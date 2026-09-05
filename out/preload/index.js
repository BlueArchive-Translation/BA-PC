"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const sendValidChannels = [
  "minimize-window",
  "close-window",
  "open-external-url",
  "set-window-position",
  "open-exe"
  // 打开应用
];
const sendSyncChannels = [
  "request-system-locale",
  // 获取系统语言
  "request-home-path",
  // 获取用户home路径
  "request-install-path",
  // 请求安装路径
  "set-install-path",
  // 设置安装路径
  "request-string-md5"
  // 请求字符串md5
];
const receiveValidChannels = [
  "handle-install-done",
  // 安装完成
  "handle-back-to-choose"
  // 安装完成
];
const invokeValidChannels = [
  "handle-window-position",
  "handle-request-http-image-base64",
  // 下载图片base64
  "handle-auth-head"
  // 请求头
];
const api = {
  send: (channel, ...data) => {
    if (sendValidChannels.includes(channel)) {
      electron.ipcRenderer.send(channel, ...data);
    }
  },
  sendSync: (channel, ...data) => {
    if (sendSyncChannels.includes(channel)) {
      return electron.ipcRenderer.sendSync(channel, ...data);
    }
  },
  receive: (channel, func) => {
    if (receiveValidChannels.includes(channel)) {
      electron.ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  removeReceive: (channel) => {
    if (receiveValidChannels.includes(channel)) {
      electron.ipcRenderer.removeAllListeners(channel);
    }
  },
  invoke: (channel, ...data) => {
    return new Promise((resolve, reject) => {
      if (invokeValidChannels.includes(channel)) {
        resolve(electron.ipcRenderer.invoke(channel, ...data));
      } else {
        reject(new Error("Invalid channel"));
      }
    });
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
