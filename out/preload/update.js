"use strict";
const electron = require("electron");
const sendValidChannels = [
  "quit",
  // 退出客户端
  "minimize-window",
  // 最小化应用窗口
  "quit-and-install",
  // 退出并安装新版客户端
  "set-window-position",
  // 设置应用窗口位置
  "ali-sls-log"
];
const sendSyncChannels = [
  "request-http-authorization-header",
  "request-system-locale"
  // 获取系统语言
];
const receiveValidChannels = [
  "client-update-download-done",
  // 客户端更新下载完成
  "client-update-progress",
  // 客户端更新下载完成
  "client-update-error"
  // 客户端更新下载错误
];
const invokeValidChannels = [
  "handle-choose-system-path",
  // 选择安装目录
  "handle-client-update",
  // 请求更新客户端
  "handle-window-position",
  "handle-request-http-image-base64"
  // 获取网络图片的base64
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
  electron.contextBridge.exposeInMainWorld("api", api);
} else {
  window.api = api;
}
