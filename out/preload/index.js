"use strict";
const electron = require("electron");
const sendValidChannels = [
  "close-window",
  // 关闭应用窗口
  "minimize-window",
  // 最小化应用窗口
  "hidden-window",
  // 隐藏应用窗口
  "set-window-position",
  // 设置应用窗口位置
  "focus-window",
  // 聚焦应用窗口
  "download-new-client",
  // 下载新版客户端
  "quit-and-install",
  // 退出并安装新版客户端
  "show-message-debug",
  // 显示调试信息
  "open-external-url",
  // 打开外部链接
  "debug-message",
  "ali-sls-log",
  "request-game-click-code",
  // 处理click code
  "report-error-log"
  // 上报错误日志
];
const sendSyncChannels = [
  "request-check-update",
  // 检测启动器更新
  "request-current-version",
  // 请求当前客户端版本
  "request-default-download-path",
  // 获取默认下载目录
  "request-system-locale",
  // 获取系统语言
  "request-string-md5",
  // 获取字符串md5编码
  "request-http-authorization-header",
  // 获取请求授权头
  "request-recover-games-folder"
  // 请求恢复游戏目录
];
const receiveValidChannels = [
  "error-request-manifest",
  "error-system",
  "start-game-damage",
  "change-view",
  "receive-progress",
  "renderer-quit",
  // 退出
  "shut-down-download",
  // 终止下载
  "game-download-progress",
  // 游戏下载回调
  "game-download-error-no-space",
  // 游戏下载错误，空间不足
  "game-download-error-network-down",
  // 游戏下载错误，网络中断
  "game-download-failed",
  // 游戏下载错误，其他错误
  "game-download-done",
  // 游戏下载完成
  "uninstall-done",
  // 卸载游戏结束
  "uninstall-process",
  // 卸载游戏进度
  "uninstall-error",
  // 卸载游戏失败
  "uninstall-error-running",
  // 卸载游戏失败
  "game-install-done"
  // 游戏解压完成
];
const invokeValidChannels = [
  "handle-start-download",
  "handle-stop-download",
  "handle-start-uninstall",
  "handle-game-start",
  // 执行游戏启动
  "handle-window-position",
  "handle-choose-system-path",
  // 选择安装目录
  "handle-check-game",
  // 检测游戏，并返回版本号
  "handle-create-download-directory",
  // 创建下载目录
  "handle-game-download-start",
  // 游戏下载开始
  "handle-client-update",
  // 请求更新客户端
  "handle-disk-space",
  // 获取硬盘空间
  "handle-set-proxy-mode",
  // 设置proxy
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
