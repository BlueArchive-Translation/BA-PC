"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const utils = require("@electron-toolkit/utils");
const pathModule = require("node:path");
const node_worker_threads = require("node:worker_threads");
const types = require("./types-26321524.js");
const config = require("./config-1bcf7a0b.js");
const log = require("electron-log");
const electronUpdater = require("electron-updater");
const fsModule = require("node:fs");
const utils$1 = require("@launcher/utils");
const path$1 = require("path");
const node_child_process = require("node:child_process");
const diskInfo = require("node-disk-info");
const axios = require("axios");
const proxyAgent = require("proxy-agent");
const fsExtra = require("fs-extra");
const constant = require("./constant-a9fc53dd.js");
const toArray = require("stream-to-array");
const crypto = require("node:crypto");
const i18next = require("i18next");
const worker_threads = require("worker_threads");
function CreateLogger(options) {
  return new node_worker_threads.Worker(require.resolve("./index-cf0fb39f.js"), options);
}
const workerLogger = CreateLogger({});
const Logger = {
  info: (prefix, message) => workerLogger.postMessage({
    type: types.EWorkerLoggerType.LOG,
    payload: { level: "info", prefix, message }
  }),
  warn: (prefix, message) => workerLogger.postMessage({
    type: types.EWorkerLoggerType.LOG,
    payload: { level: "warn", prefix, message }
  }),
  error: (prefix, message) => workerLogger.postMessage({
    type: types.EWorkerLoggerType.LOG,
    payload: { level: "error", prefix, message }
  })
};
function createWorkerLogger() {
  const logDirPath = pathModule.join(electron.app.getPath("userData"), config.logDirName);
  workerLogger.postMessage({
    type: types.EWorkerLoggerType.INIT,
    payload: { logDirPath }
  });
  return workerLogger;
}
const globalEvent = () => {
  log.catchErrors({
    showDialog: false,
    onError(error) {
      Logger.error("log.catchErrors", `${error}`);
    }
  });
  electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
  electron.app.on("ready", function() {
    log.info("App ready...\ncurrent version: " + electron.app.getVersion() + "\nname: " + electron.app.getName());
  });
};
const icon = path$1.join(__dirname, "../../resources/build.ico");
const shortcut = (window2) => {
  window2.on("enter-full-screen", (_event) => {
    window2.setFullScreen(false);
  });
  window2.webContents.on("before-input-event", (event, input) => {
    if (input.control || input.meta || input.alt || input.shift) {
      event.preventDefault();
    }
    if (input.key.toLowerCase() === "f11" && input.type === "keyDown") {
      event.preventDefault();
    }
    if (input.key.toLowerCase() === "f5") {
      event.preventDefault();
    }
    if (input.control && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      event.preventDefault();
    }
    if (input.control && input.key.toLowerCase() === "w") {
      event.preventDefault();
    }
  });
};
const globalCss = () => {
  return `html,
  body {
    background-color: transparent;
    margin: 0;
    padding: 0;
  }

  a {
    -webkit-user-drag: none;
  }
  `;
};
const renderPath$1 = "update/index.html";
const windowWidth$1 = 710 + 20;
const windowHeight$1 = 530 + 20;
function createUpdateWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: windowWidth$1,
    height: windowHeight$1,
    show: true,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor: "rgba(255,255,255,0)",
    resizable: false,
    fullscreen: false,
    maximizable: false,
    useContentSize: true,
    icon,
    webPreferences: {
      preload: pathModule.join(__dirname, "../preload/update.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: true,
      devTools: process.env.NODE_ENV === "development"
    }
  });
  mainWindow.name = "update-window";
  mainWindow.once("ready-to-show", () => {
    mainWindow.setBackgroundColor("rgba(255,255,255,0)");
    if (process.env.NODE_ENV === "development")
      mainWindow?.webContents.openDevTools();
  });
  mainWindow.on("resize", () => {
    mainWindow.setBounds({ width: windowWidth$1, height: windowHeight$1 });
  });
  electron.app.on("second-instance", () => {
    const windows = electron.BrowserWindow.getAllWindows();
    if (mainWindow) {
      if (mainWindow.isMinimized())
        windows[0].restore();
      mainWindow.focus();
    }
  });
  electron.app.on("before-quit", () => {
    if (mainWindow) {
      mainWindow.removeAllListeners("close");
      mainWindow.close();
    }
  });
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!utils.is.dev && url.startsWith("http")) {
      event.preventDefault();
      electron.shell.openExternal(url);
    }
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(pathModule.join(process.env["ELECTRON_RENDERER_URL"], renderPath$1)).catch((err) => {
      Logger.error("main process Window:update loadURL", err);
      electron.app.quit();
    });
  } else {
    mainWindow.loadFile(pathModule.join(__dirname, "../renderer", renderPath$1)).catch((err) => {
      Logger.error("main process Window:update loadFile", err);
      electron.app.quit();
    });
  }
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(globalCss());
  });
  shortcut(mainWindow);
  return mainWindow;
}
const rootName$1 = "YostarGames";
async function detectGameFolder() {
  return new Promise(async (res, _rej) => {
    const currentInstallFolder = pathModule.dirname(electron.app.getPath("exe"));
    const gameFolderPath = pathModule.join(currentInstallFolder, rootName$1);
    const existGameFolder = fsModule.existsSync(gameFolderPath);
    const EXEList = [];
    const eachExeFiles = (dir) => {
      const files = fsModule.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = pathModule.join(dir, file.name);
        if (file.isDirectory()) {
          eachExeFiles(filePath);
        } else if (file.isFile() && pathModule.extname(file.name).toLowerCase() === ".exe") {
          EXEList.push(file.name);
        }
      }
    };
    if (existGameFolder) {
      let count = 0;
      const timer = setInterval(async () => {
        if (count > 7) {
          res(true);
          clearInterval(timer);
        }
        eachExeFiles(gameFolderPath);
        try {
          for (let i2 = 0; i2 < EXEList.length; i2++) {
            const exeName = EXEList[i2];
            const isRunning = await utils$1.isExeRunning(exeName);
            if (isRunning) {
              await utils$1.killEXE(exeName);
            }
          }
        } catch (error) {
          Logger.error("detectGameFolder", `error:${error}`);
        }
        count++;
        try {
          const tempGameFolderPath = pathModule.join(
            currentInstallFolder,
            "..",
            `temp-yo-star-games-${"ja"}`
          );
          fsModule.renameSync(gameFolderPath, tempGameFolderPath);
          const userTempFilePath = pathModule.join(
            electron.app.getPath("temp"),
            `temp-yo-star-games-${"ja"}.txt`
          );
          fsModule.writeFileSync(userTempFilePath, tempGameFolderPath);
          res(true);
          clearInterval(timer);
        } catch (error) {
        }
      }, 3e3);
    } else {
      res(true);
    }
  });
}
const updateEvent = () => {
  log.transports.file.level = "debug";
  electronUpdater.autoUpdater.logger = log;
  electronUpdater.autoUpdater.autoDownload = false;
  electronUpdater.autoUpdater.autoInstallOnAppQuit = true;
  electronUpdater.autoUpdater.disableWebInstaller = true;
  electronUpdater.autoUpdater.on("error", (error) => {
    Logger.warn("autoUpdater warn", `${error}`);
  });
  electron.ipcMain.on("request-check-update", (event) => {
    electronUpdater.autoUpdater.on("update-available", (info) => {
      Logger.info("update-available", JSON.stringify(info));
      event.returnValue = info.version;
    });
    electronUpdater.autoUpdater.on("update-not-available", (info) => {
      log.info("=> update-not-available\n", JSON.stringify(info));
      event.returnValue = false;
    });
    electronUpdater.autoUpdater.checkForUpdates().then((res) => {
      if (!res) {
        event.returnValue = false;
      }
    }).catch((error) => {
      Logger.error("checkForUpdates promise error", error);
      event.returnValue = false;
    });
  });
  electron.ipcMain.handle("handle-client-update", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    const isRetry = window2?.name === "update-window";
    if (!isRetry) {
      window2?.close();
    }
    const updateWindow = isRetry ? window2 : createUpdateWindow();
    electronUpdater.autoUpdater.removeAllListeners();
    electronUpdater.autoUpdater.on("checking-for-update", () => {
      log.info("=> checking-for-update");
    });
    electronUpdater.autoUpdater.on("error", (err) => {
      Logger.error("Error in auto-updater", err?.message);
      updateWindow?.webContents.send("client-update-error");
    });
    electronUpdater.autoUpdater.on("download-progress", (progressObj) => {
      updateWindow?.webContents.send(
        "client-update-progress",
        utils$1.bytesToSize(progressObj.transferred),
        utils$1.bytesToSize(progressObj.total),
        parseInt(progressObj.percent.toFixed(2))
      );
    });
    electronUpdater.autoUpdater.on("update-downloaded", async (info) => {
      Logger.info("update-downloaded", JSON.stringify(info));
      await detectGameFolder();
      setTimeout(() => {
        updateWindow?.webContents.send("client-update-download-done");
      }, 2e3);
    });
    electronUpdater.autoUpdater.downloadUpdate().catch((err) => {
      updateWindow?.webContents.send("client-update-error");
      Logger.error("autoUpdater downloadUpdate error", err);
    }).finally(() => {
      event.returnValue = true;
    });
  });
  electron.ipcMain.on("quit-and-install", (event) => {
    try {
      const window2 = electron.BrowserWindow.fromWebContents(event.sender);
      window2.close();
      electronUpdater.autoUpdater.autoRunAppAfterInstall = true;
      electronUpdater.autoUpdater.quitAndInstall(false, false);
    } catch (error) {
      Logger.error("quitAndInstall error", `${error}`);
    }
  });
};
const CLICK_CODE_FILE_NAME = "clickCode";
const saveClickCodeInfo = async () => {
  return new Promise(() => {
    const homeDir = pathModule.dirname(electron.app.getPath("exe"));
    const clickCodePath = pathModule.join(homeDir, CLICK_CODE_FILE_NAME);
    if (!fsModule.existsSync(clickCodePath))
      return;
    const userDataDir = electron.app.getPath("userData");
    const clickCodePathUserData = pathModule.join(userDataDir, CLICK_CODE_FILE_NAME);
    const name = fsModule.readFileSync(clickCodePath, { encoding: "utf-8" }).trim();
    const pattern = /^.*?_install_(.*?)_\d+\.\d+\.\d+.*\.exe$/;
    const match = name.match(pattern);
    try {
      if (match) {
        const hash = match[1];
        fsModule.writeFileSync(clickCodePathUserData, hash, { encoding: "utf-8", flag: "w+" });
        fsModule.unlinkSync(clickCodePath);
        Logger.info("save clickcode", `clickCodePath: ${clickCodePath}
click_code: ${hash}`);
      } else {
        fsModule.unlinkSync(clickCodePath);
        Logger.info("save clickcode", `clickcode校验失败:
name: ${name}`);
      }
    } catch (error) {
      Logger.error("save clickcode", `${error}`);
    }
  });
};
const loadClickCodeFile = (gamePath) => {
  return new Promise(() => {
    if (!gamePath)
      return;
    const userDataDir = electron.app.getPath("userData");
    const clickCodePath = pathModule.join(userDataDir, CLICK_CODE_FILE_NAME);
    const clickCodeFileTargetPath = pathModule.join(gamePath, CLICK_CODE_FILE_NAME);
    if (!fsModule.existsSync(clickCodePath)) {
      Logger.info("clickcode load", "clickcode校验失败: 无clickcode");
      return;
    }
    try {
      const hash = fsModule.readFileSync(clickCodePath, { encoding: "utf-8" }).trim();
      const pattern = /^(.*?)\.exe$/;
      const match = hash.match(pattern);
      if (match) {
        const hash2 = match[1];
        fsModule.unlinkSync(clickCodePath);
        Logger.info("clickcode load", `clickcode校验失败:
name: ${hash2}`);
      } else {
        fsModule.writeFileSync(clickCodeFileTargetPath, hash, { encoding: "utf-8", flag: "w+" });
        Logger.info("clickcode load", `写入clickcode: ${hash}
target: ${clickCodeFileTargetPath}`);
      }
    } catch (error) {
      Logger.error("clickcode load", `${error}`);
    }
  });
};
const checkClickCode = (gamePath) => {
  if (!gamePath)
    return "";
  const clickCodePath = pathModule.join(gamePath, CLICK_CODE_FILE_NAME);
  if (!fsModule.existsSync(clickCodePath))
    return "";
  const hash = fsModule.readFileSync(clickCodePath, { encoding: "utf-8" }).trim();
  return hash;
};
const renderPath = "main/index.html";
const windowWidth = 1280 + 20;
const windowHeight = 734 + 20;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: windowWidth,
    minHeight: windowHeight,
    maxHeight: windowHeight,
    maxWidth: windowWidth,
    frame: false,
    autoHideMenuBar: true,
    show: true,
    transparent: true,
    backgroundColor: "rgba(255,255,255,0)",
    resizable: false,
    fullscreen: false,
    maximizable: false,
    useContentSize: true,
    icon,
    webPreferences: {
      zoomFactor: 1,
      preload: pathModule.join(__dirname, "../preload/index.js"),
      sandbox: true,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: true,
      devTools: process.env.NODE_ENV === "development"
    }
  });
  mainWindow.name = "main-window";
  mainWindow.once("ready-to-show", () => {
    mainWindow.setBackgroundColor("rgba(255,255,255,0)");
    if (process.env.NODE_ENV === "development")
      mainWindow?.webContents.openDevTools();
    saveClickCodeInfo();
  });
  mainWindow.on("resize", () => {
    mainWindow.setBounds({ width: windowWidth, height: windowHeight });
  });
  electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      } else {
        mainWindow.show();
      }
      mainWindow.focus();
    }
  });
  electron.app.on("before-quit", () => {
    if (mainWindow) {
      mainWindow.removeAllListeners("close");
      mainWindow.close();
    }
  });
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!utils.is.dev && url.startsWith("http")) {
      event.preventDefault();
      electron.shell.openExternal(url);
    }
  });
  mainWindow.webContents.on("context-menu", (e) => {
    e.preventDefault();
    return;
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(pathModule.join(process.env["ELECTRON_RENDERER_URL"], renderPath)).catch((err) => {
      Logger.error("mainWindow.loadURL", err);
      electron.app.quit();
    });
  } else {
    mainWindow.loadFile(pathModule.join(__dirname, "../renderer", renderPath)).catch((err) => {
      Logger.error("mainWindow.loadFile", err);
      electron.app.quit();
    });
  }
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(globalCss());
    mainWindow.webContents.setZoomFactor(1);
  });
  mainWindow.webContents.on("zoom-changed", () => {
    mainWindow.webContents.setZoomFactor(1);
  });
  shortcut(mainWindow);
  return mainWindow;
}
const windowSize = {
  "main-window": {
    width: windowWidth,
    height: windowHeight
  },
  "update-window": {
    width: windowWidth$1,
    height: windowHeight$1
  }
};
const header = () => {
  electron.ipcMain.on("close-window", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (window2) {
      window2.close();
    }
  });
  electron.ipcMain.on("minimize-window", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (window2) {
      window2.minimize();
    }
  });
  electron.ipcMain.handle("handle-window-position", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (window2) {
      const [windowX, windowY] = window2.getPosition();
      const { x, y } = electron.screen.getCursorScreenPoint();
      return { windowX, windowY, originCursorX: x, originCursorY: y };
    }
    return { windowX: 0, windowY: 0, originCursorX: 0, originCursorY: 0 };
  });
  electron.ipcMain.on(
    "set-window-position",
    (event, originWindowX, originWindowY, originCursorX, originCursorY) => {
      const window2 = electron.BrowserWindow.fromWebContents(event.sender);
      if (window2) {
        const { x, y } = electron.screen.getCursorScreenPoint();
        const offsetX = x - originCursorX;
        const offsetY = y - originCursorY;
        if (offsetX || offsetY) {
          window2.setBounds({
            x: originWindowX + offsetX,
            y: originWindowY + offsetY,
            width: windowSize[window2["name"]].width,
            height: windowSize[window2["name"]].height
          });
        }
      }
    }
  );
  electron.ipcMain.on("hidden-window", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (window2) {
      window2.hide();
    }
  });
  electron.ipcMain.on("focus-window", (event) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (window2?.isMinimized()) {
      window2.restore();
    } else {
      window2?.show();
    }
    window2?.focus();
  });
};
const defaultSubPath = [
  "YostarGames",
  "BlueArchive_JP"
];
const checkPath = (value) => {
  let tempPath = value;
  const tempDefaultSubPath = [...defaultSubPath];
  const size = tempDefaultSubPath.length;
  const neededSuffix = [];
  const pathArr = [];
  let dir = pathModule.dirname(tempPath);
  let base = pathModule.basename(tempPath);
  while (base) {
    pathArr.unshift(base);
    tempPath = dir;
    dir = pathModule.dirname(tempPath);
    base = pathModule.basename(tempPath);
  }
  const formatPath = pathArr.join(";");
  for (let i2 = 0; i2 < size; i2++) {
    const tempSuffix = tempDefaultSubPath.join(";");
    if (formatPath.endsWith(tempSuffix)) {
      break;
    }
    const currentItem = tempDefaultSubPath.pop();
    if (currentItem)
      neededSuffix.unshift(currentItem);
  }
  return pathModule.join(value, ...neededSuffix);
};
function checkPathExistence(path2) {
  if (!path2)
    return void 0;
  try {
    const stats = fsModule.statSync(path2, { throwIfNoEntry: false });
    if (stats?.isDirectory())
      return path2;
  } catch (error) {
    return checkPathExistence(pathModule.dirname(path2));
  }
  return checkPathExistence(pathModule.dirname(path2));
}
const isSystemProtectPath = (path2) => {
  const blackList = [];
  try {
    const setArr = /* @__PURE__ */ new Set([
      pathModule.dirname(electron.app.getPath("exe")),
      electron.app.getPath("userData"),
      electron.app.getPath("appData"),
      electron.app.getPath("temp"),
      electron.app.getPath("desktop"),
      electron.app.getPath("documents"),
      electron.app.getPath("downloads"),
      electron.app.getPath("music"),
      electron.app.getPath("pictures"),
      electron.app.getPath("videos"),
      electron.app.getPath("home"),
      pathModule.dirname(electron.app.getPath("home")),
      electron.app.getPath("sessionData"),
      electron.app.getPath("module"),
      electron.app.getPath("recent"),
      process.env["PROGRAMFILES"] || "",
      process.env["PROGRAMFILES(X86)"] || "",
      process.env["SystemDrive"] || "",
      process.env["SystemRoot"] || "",
      process.env["USERPROFILE"] || "",
      process.env["LOCALAPPDATA"] || ""
    ]);
    blackList.push(...setArr);
  } catch (error) {
    Logger.error("uninstall blackList", `path: ${path2}
error: ${error}`);
    blackList.length = 0;
  }
  path2 = path2.replace(/^[a-zA-Z]:$/, (match) => `${match}/`).replace(/^[a-z]:/, (match) => match.toUpperCase());
  try {
    fsModule.statSync(path2, { throwIfNoEntry: true });
  } catch {
    return true;
  }
  const a = pathModule.normalize(pathModule.resolve(path2));
  const regex = /^[a-zA-Z]:\\$/;
  if (regex.test(a))
    return true;
  const res = blackList.find((item) => {
    const b = pathModule.normalize(pathModule.resolve(item));
    return fsModule.statSync(a, { throwIfNoEntry: false })?.ino === fsModule.statSync(b, { throwIfNoEntry: false })?.ino;
  });
  return !!res;
};
const disksInfo = [];
function getPowerShell() {
  return new Promise((resolve, reject) => {
    node_child_process.exec('powershell -Command "$PSVersionTable.PSVersion"', (error, _stdout, _stderr) => {
      if (error) {
        Logger.error("no powershell ENV", `${error}`);
        const possiblePaths = [
          pathModule.join(
            process.env.SystemRoot || "C:\\Windows",
            "System32",
            "WindowsPowerShell",
            "v1.0",
            "powershell.exe"
          ),
          pathModule.join(
            process.env.ProgramFiles || "C:\\Program Files",
            "PowerShell",
            "7",
            "pwsh.exe"
          ),
          pathModule.join(
            process.env?.["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
            "PowerShell",
            "7",
            "pwsh.exe"
          )
        ];
        for (const p of possiblePaths) {
          if (fsModule.existsSync(p)) {
            resolve(p);
            return;
          }
        }
        Logger.error("no powershell", "powershell.exe not found");
        reject("powershell not found");
        return void 0;
      } else {
        resolve("powershell");
      }
    });
  });
}
async function initDiskInfo() {
  try {
    const diskInfoArr = await diskInfo.getDiskInfo();
    diskInfoArr?.forEach((item) => {
      disksInfo.push({
        name: item.mounted.toLowerCase().replace(/[^a-zA-Z]/g, ""),
        free: String(item.available),
        used: String(item.used),
        total: String(item.blocks)
      });
    });
    return true;
  } catch (error) {
    Logger.error("disk info", `${error}`);
  }
  try {
    const powershellPath = await getPowerShell();
    const command = 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name="Free";Expression={$_.Free}}, @{Name="Used";Expression={$_.Used}}, @{Name="Total";Expression={$_.Used + $_.Free}}';
    const stdout = node_child_process.execSync(command, { encoding: "utf8", shell: powershellPath });
    const lines = stdout.trim().split("\n").filter((line) => line.trim() !== "");
    const headers = lines[0].trim().split(/\s+/);
    lines.slice(1).forEach((line) => {
      const values = line?.trim()?.split(/\s+/);
      const info = headers.reduce(
        (acc, header2, index) => {
          acc[header2.toLowerCase()] = values?.[index]?.toLowerCase();
          return acc;
        },
        {}
      );
      disksInfo.push(info);
    });
    return true;
  } catch (error) {
    Logger.error("disk info command", `${error}`);
    return false;
  }
}
const path = () => {
  electron.ipcMain.on("request-default-download-path", (event) => {
    const appDir = pathModule.dirname(electron.app.getPath("exe"));
    event.returnValue = checkPath(pathModule.join(appDir, ".."));
  });
  electron.ipcMain.handle("handle-choose-system-path", async (event, defaultPath, fill = true) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    if (!defaultPath)
      defaultPath = electron.app.getPath("home");
    const existsDefaultPath = checkPathExistence(defaultPath);
    try {
      const result = await electron.dialog.showOpenDialog(window2, {
        properties: ["openDirectory"],
        message: "选择安装目录",
        defaultPath: existsDefaultPath
      });
      if (result.canceled)
        return void 0;
      return fill ? checkPath(result.filePaths[0]) : result.filePaths[0];
    } catch (error) {
      Logger.error("handle-choose-system-path", `${error}`);
      return void 0;
    }
  });
  electron.ipcMain.handle("handle-disk-space", async (_event, path2) => {
    const existPath = checkPathExistence(path2);
    if (!existPath) {
      Logger.error(
        "request-disk-space",
        `None of the paths exist up to root directory from : ${path2}`
      );
      return "--";
    }
    if (!disksInfo.length)
      await initDiskInfo();
    const diskSpaceInfo = disksInfo.find((item) => {
      const lowerCasePath = String.prototype.toLowerCase.call(existPath);
      return lowerCasePath.startsWith(item.name);
    });
    return diskSpaceInfo ? utils$1.bytesToSize(Number(diskSpaceInfo.free)) : "--";
  });
  electron.ipcMain.handle("handle-create-download-directory", async (_event, path2) => {
    try {
      fsModule.mkdirSync(path2, { recursive: true });
      return true;
    } catch (error) {
      Logger.error("create-download-directory", `${error}`);
      return false;
    }
  });
};
class ProxyManager {
  static instance;
  proxyMode = "direct";
  proxyInfo = { url: "", noProxy: "" };
  timer = null;
  constructor() {
    this.startSystemProxyMonitor();
  }
  static getInstance() {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }
  startSystemProxyMonitor() {
    this.stopSystemProxyMonitor();
    this.fetchSystemProxy();
    this.timer = setInterval(() => {
      this.fetchSystemProxy();
    }, 5 * 1e3);
  }
  async fetchSystemProxy() {
    const sysProxy = await utils$1.getWindowsSystemProxy();
    if (this.proxyMode === "direct") {
      this.proxyInfo.url = "";
      this.proxyInfo.noProxy = "";
    } else {
      const isChanged = this.proxyInfo.url !== (sysProxy?.proxyUrl || "");
      if (isChanged) {
        this.proxyInfo.url = sysProxy?.proxyUrl || "";
        this.proxyInfo.noProxy = sysProxy?.noProxy?.join(",") || "";
        Logger.info("fetch system proxy change", `proxyInfo: ${JSON.stringify(this.proxyInfo)}`);
      }
    }
    utils$1.setProxyEnvironment(this.proxyInfo);
    this.setSessionsProxy();
  }
  async setSessionsProxy() {
    const sessions = [electron.session.defaultSession, electron.session.fromPartition("persist:webview")];
    await Promise.all(
      sessions.map(
        (session2) => session2.setProxy({
          mode: this.proxyMode
        })
      )
    );
  }
  // 设置代理模式
  setMode(mode) {
    this.proxyMode = mode;
    if (mode === "system") {
      this.startSystemProxyMonitor();
    } else {
      this.proxyInfo.url = "";
      this.proxyInfo.noProxy = "";
      utils$1.setProxyEnvironment(this.proxyInfo);
      this.setSessionsProxy();
    }
    Logger.info("set proxy mode", `mode: ${mode}
proxyInfo: ${JSON.stringify(this.proxyInfo)}`);
  }
  // 获取当前代理信息
  getProxyInfo() {
    return this.proxyInfo;
  }
  // 停止监控（进程结束时可调用）
  stopSystemProxyMonitor() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
const Axios = axios.create({
  timeout: 3e4,
  baseURL: {}.MAIN_VITE_BASE_API_URL || "https://api-launcher-jp.yo-star.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
});
Axios.interceptors.request.use(
  async (config2) => {
    const proxyManager = ProxyManager.getInstance();
    const proxyInfo = proxyManager.getProxyInfo();
    if (proxyInfo.url) {
      const agent = new proxyAgent.ProxyAgent();
      config2.proxy = false;
      config2.httpsAgent = agent;
      config2.httpAgent = agent;
    }
    if (config2._isDownload) {
      config2.headers = new axios.AxiosHeaders({
        "Cache-Control": "no-cache"
      });
      config2.baseURL = "";
      config2.withCredentials = false;
      return config2;
    }
    const Authorization = utils$1.getAuthHeader({
      data: config2.data || "",
      gameId: "BlueArchive_JP",
      version: electron.app.getVersion(),
      salt: "DE7108E9B2842FD460F4777702727869"
    });
    config2.headers["Authorization"] = Authorization;
    return config2;
  },
  (error) => {
    return Promise.reject(error);
  }
);
Axios.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (response.config._isDownload)
      return data;
    if (data.code !== 200) {
      Logger.error(
        "main process request data",
        `url: ${response.config.url}
message: ${data?.message || data?.msg}`
      );
    }
    return data;
  },
  (error) => {
    const date = /* @__PURE__ */ new Date();
    const time = date.toLocaleString();
    const url = error?.config?.url;
    const message = error?.message;
    const status = error?.status;
    const code = error?.code;
    const stack = error?.stack;
    const errorLog = time + "\nurl:" + url + "\nstatus:" + status + "\ncode: " + code + "\nmessage:" + message + "\nstack:" + stack + "\n\n";
    Logger.error("main process request catch", errorLog);
    return Promise.reject(error);
  }
);
const requestManifestUrl = async (data) => {
  const url = encodeURI(
    `/api/launcher/game/config/json?version=${data.version}&file_path=${data.path}`
  );
  const res = await Axios.get(url);
  const fileUrl = res.data?.url ? res.data.url + "?nocache=" + Date.now() : "";
  return fileUrl;
};
const requestManifest = async (url) => {
  const res = await Axios.get(url, {
    _isDownload: true
  });
  const manifestRes = res;
  return manifestRes;
};
const requestDomain = async () => {
  const res = await Axios("/api/launcher/advanced/game/download/cdn");
  return res.data;
};
var Module;
if (!Module)
  Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
  if (Module["ENVIRONMENT"] === "WEB") {
    ENVIRONMENT_IS_WEB = true;
  } else if (Module["ENVIRONMENT"] === "WORKER") {
    ENVIRONMENT_IS_WORKER = true;
  } else if (Module["ENVIRONMENT"] === "NODE") {
    ENVIRONMENT_IS_NODE = true;
  } else if (Module["ENVIRONMENT"] === "SHELL") {
    ENVIRONMENT_IS_SHELL = true;
  } else {
    throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
  }
} else {
  ENVIRONMENT_IS_WEB = typeof window === "object";
  ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
  ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
  ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}
if (ENVIRONMENT_IS_NODE) {
  if (!Module["print"])
    Module["print"] = console.log;
  if (!Module["printErr"])
    Module["printErr"] = console.warn;
  var nodeFS;
  var nodePath;
  Module["read"] = function shell_read(filename, binary) {
    if (!nodeFS)
      nodeFS = require("fs");
    if (!nodePath)
      nodePath = require("path");
    filename = nodePath["normalize"](filename);
    var ret = nodeFS["readFileSync"](filename);
    return binary ? ret : ret.toString();
  };
  Module["readBinary"] = function readBinary(filename) {
    var ret = Module["read"](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };
  Module["load"] = function load(f) {
    globalEval(read(f));
  };
  if (!Module["thisProgram"]) {
    if (process["argv"].length > 1) {
      Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
    } else {
      Module["thisProgram"] = "unknown-program";
    }
  }
  Module["arguments"] = process["argv"].slice(2);
  if (typeof module !== "undefined") {
    module["exports"] = Module;
  }
  Module["inspect"] = function() {
    return "[Emscripten Module object]";
  };
} else if (ENVIRONMENT_IS_SHELL) {
  if (!Module["print"])
    Module["print"] = print;
  if (typeof printErr != "undefined")
    Module["printErr"] = printErr;
  if (typeof read != "undefined") {
    Module["read"] = read;
  } else {
    Module["read"] = function shell_read() {
      throw "no read() available";
    };
  }
  Module["readBinary"] = function readBinary(f) {
    if (typeof readbuffer === "function") {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, "binary");
    assert(typeof data === "object");
    return data;
  };
  if (typeof scriptArgs != "undefined") {
    Module["arguments"] = scriptArgs;
  } else if (typeof arguments != "undefined") {
    Module["arguments"] = arguments;
  }
  if (typeof quit === "function") {
    Module["quit"] = function(status, toThrow) {
      quit(status);
    };
  }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module["read"] = function shell_read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
    Module["readBinary"] = function readBinary(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.responseType = "arraybuffer";
      xhr.send(null);
      return new Uint8Array(xhr.response);
    };
  }
  Module["readAsync"] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
        onload(xhr.response);
      } else {
        onerror();
      }
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };
  if (typeof arguments != "undefined") {
    Module["arguments"] = arguments;
  }
  if (typeof console !== "undefined") {
    if (!Module["print"])
      Module["print"] = function shell_print(x) {
        console.log(x);
      };
    if (!Module["printErr"])
      Module["printErr"] = function shell_printErr(x) {
        console.warn(x);
      };
  } else {
    var TRY_USE_DUMP = false;
    if (!Module["print"])
      Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? function(x) {
        dump(x);
      } : function(x) {
      };
  }
  if (ENVIRONMENT_IS_WORKER) {
    Module["load"] = importScripts;
  }
  if (typeof Module["setWindowTitle"] === "undefined") {
    Module["setWindowTitle"] = function(title) {
      document.title = title;
    };
  }
} else {
  throw "Unknown runtime environment. Where are we?";
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module["load"] && Module["read"]) {
  Module["load"] = function load(f) {
    globalEval(Module["read"](f));
  };
}
if (!Module["print"]) {
  Module["print"] = function() {
  };
}
if (!Module["printErr"]) {
  Module["printErr"] = Module["print"];
}
if (!Module["arguments"]) {
  Module["arguments"] = [];
}
if (!Module["thisProgram"]) {
  Module["thisProgram"] = "./this.program";
}
if (!Module["quit"]) {
  Module["quit"] = function(status, toThrow) {
    throw toThrow;
  };
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
moduleOverrides = void 0;
var Runtime = {
  setTempRet0: function(value) {
    tempRet0 = value;
    return value;
  },
  getTempRet0: function() {
    return tempRet0;
  },
  stackSave: function() {
    return STACKTOP;
  },
  stackRestore: function(stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function(type2) {
    switch (type2) {
      case "i1":
      case "i8":
        return 1;
      case "i16":
        return 2;
      case "i32":
        return 4;
      case "i64":
        return 8;
      case "float":
        return 4;
      case "double":
        return 8;
      default: {
        if (type2[type2.length - 1] === "*") {
          return Runtime.QUANTUM_SIZE;
        } else if (type2[0] === "i") {
          var bits = parseInt(type2.substr(1));
          assert(bits % 8 === 0);
          return bits / 8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function(type2) {
    return Math.max(Runtime.getNativeTypeSize(type2), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function(ptr, type2) {
    if (type2 === "double" || type2 === "i64") {
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function(type2, size, vararg) {
    if (!vararg && (type2 == "i64" || type2 == "double"))
      return 8;
    if (!type2)
      return Math.min(size, 8);
    return Math.min(size || (type2 ? Runtime.getNativeFieldSize(type2) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function(sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length - 1);
      assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
      return Module["dynCall_" + sig].apply(null, [ptr].concat(args));
    } else {
      assert(sig.length == 1);
      assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
      return Module["dynCall_" + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function(func2) {
    for (var i2 = 0; i2 < Runtime.functionPointers.length; i2++) {
      if (!Runtime.functionPointers[i2]) {
        Runtime.functionPointers[i2] = func2;
        return 2 * (1 + i2);
      }
    }
    throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
  },
  removeFunction: function(index) {
    Runtime.functionPointers[(index - 2) / 2] = null;
  },
  warnOnce: function(text) {
    if (!Runtime.warnOnce.shown)
      Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function(func2, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func2]) {
      if (sig.length === 1) {
        sigCache[func2] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func2);
        };
      } else if (sig.length === 2) {
        sigCache[func2] = function dynCall_wrapper(arg2) {
          return Runtime.dynCall(sig, func2, [arg2]);
        };
      } else {
        sigCache[func2] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func2, Array.prototype.slice.call(arguments));
        };
      }
    }
    return sigCache[func2];
  },
  getCompilerSetting: function(name) {
    throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
  },
  stackAlloc: function(size) {
    var ret = STACKTOP;
    STACKTOP = STACKTOP + size | 0;
    STACKTOP = STACKTOP + 15 & -16;
    assert((STACKTOP | 0) < (STACK_MAX | 0) | 0) | 0;
    return ret;
  },
  staticAlloc: function(size) {
    var ret = STATICTOP;
    STATICTOP = STATICTOP + (assert(!staticSealed), size) | 0;
    STATICTOP = STATICTOP + 15 & -16;
    return ret;
  },
  dynamicAlloc: function(size) {
    assert(DYNAMICTOP_PTR);
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = (ret + size + 15 | 0) & -16;
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    if (end >= TOTAL_MEMORY) {
      var success = enlargeMemory();
      if (!success) {
        HEAP32[DYNAMICTOP_PTR >> 2] = ret;
        return 0;
      }
    }
    return ret;
  },
  alignMemory: function(size, quantum) {
    var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
    return ret;
  },
  makeBigInt: function(low, high, unsigned) {
    var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296;
    return ret;
  },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = 0;
function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed: " + text);
  }
}
function getCFunc(ident) {
  var func = Module["_" + ident];
  if (!func) {
    try {
      func = eval("_" + ident);
    } catch (e) {
    }
  }
  assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
  return func;
}
var cwrap, ccall;
(function() {
  var JSfuncs = {
    // Helpers for cwrap -- it can't refer to Runtime directly because it might
    // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
    // out what the minified function name is.
    "stackSave": function() {
      Runtime.stackSave();
    },
    "stackRestore": function() {
      Runtime.stackRestore();
    },
    // type conversion from js to c
    "arrayToC": function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    "stringToC": function(str) {
      var ret = 0;
      if (str !== null && str !== void 0 && str !== 0) {
        var len = (str.length << 2) + 1;
        ret = Runtime.stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    }
  };
  var toC = { "string": JSfuncs["stringToC"], "array": JSfuncs["arrayToC"] };
  ccall = function ccallFunc(ident2, returnType2, argTypes2, args, opts) {
    var func2 = getCFunc(ident2);
    var cArgs = [];
    var stack = 0;
    assert(returnType2 !== "array", 'Return type should not be "array".');
    if (args) {
      for (var i2 = 0; i2 < args.length; i2++) {
        var converter = toC[argTypes2[i2]];
        if (converter) {
          if (stack === 0)
            stack = Runtime.stackSave();
          cArgs[i2] = converter(args[i2]);
        } else {
          cArgs[i2] = args[i2];
        }
      }
    }
    var ret = func2.apply(null, cArgs);
    if ((!opts || !opts.async) && typeof EmterpreterAsync === "object") {
      assert(!EmterpreterAsync.state, "cannot start async op with normal JS calling ccall");
    }
    if (opts && opts.async)
      assert(!returnType2, "async ccalls cannot return values");
    if (returnType2 === "string")
      ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function() {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  };
  var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return { arguments: parsed[0], body: parsed[1], returnValue: parsed[2] };
  }
  var JSsource = null;
  function ensureJSsource() {
    if (!JSsource) {
      JSsource = {};
      for (var fun in JSfuncs) {
        if (JSfuncs.hasOwnProperty(fun)) {
          JSsource[fun] = parseJSFunc(JSfuncs[fun]);
        }
      }
    }
  }
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    var numericArgs = argTypes.every(function(type2) {
      return type2 === "number";
    });
    var numericRet = returnType !== "string";
    if (numericRet && numericArgs) {
      return cfunc;
    }
    var argNames = argTypes.map(function(x, i2) {
      return "$" + i2;
    });
    var funcstr = "(function(" + argNames.join(",") + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      ensureJSsource();
      funcstr += "var stack = " + JSsource["stackSave"].body + ";";
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === "number")
          continue;
        var convertCode = JSsource[type + "ToC"];
        funcstr += "var " + convertCode.arguments + " = " + arg + ";";
        funcstr += convertCode.body + ";";
        funcstr += arg + "=(" + convertCode.returnValue + ");";
      }
    }
    var cfuncname = parseJSFunc(function() {
      return cfunc;
    }).returnValue;
    funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
    if (!numericRet) {
      var strgfy = parseJSFunc(function() {
        return Pointer_stringify;
      }).returnValue;
      funcstr += "ret = " + strgfy + "(ret);";
    }
    funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
    if (!numericArgs) {
      ensureJSsource();
      funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";";
    }
    funcstr += "return ret})";
    return eval(funcstr);
  };
})();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function setValue(ptr, value, type2, noSafe) {
  type2 = type2 || "i8";
  if (type2.charAt(type2.length - 1) === "*")
    type2 = "i32";
  switch (type2) {
    case "i1":
      HEAP8[ptr >> 0] = value;
      break;
    case "i8":
      HEAP8[ptr >> 0] = value;
      break;
    case "i16":
      HEAP16[ptr >> 1] = value;
      break;
    case "i32":
      HEAP32[ptr >> 2] = value;
      break;
    case "i64":
      tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
      break;
    case "float":
      HEAPF32[ptr >> 2] = value;
      break;
    case "double":
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort("invalid type for setValue: " + type2);
  }
}
Module["setValue"] = setValue;
function getValue(ptr, type2, noSafe) {
  type2 = type2 || "i8";
  if (type2.charAt(type2.length - 1) === "*")
    type2 = "i32";
  switch (type2) {
    case "i1":
      return HEAP8[ptr >> 0];
    case "i8":
      return HEAP8[ptr >> 0];
    case "i16":
      return HEAP16[ptr >> 1];
    case "i32":
      return HEAP32[ptr >> 2];
    case "i64":
      return HEAP32[ptr >> 2];
    case "float":
      return HEAPF32[ptr >> 2];
    case "double":
      return HEAPF64[ptr >> 3];
    default:
      abort("invalid type for setValue: " + type2);
  }
  return null;
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;
function allocate(slab, types2, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === "number") {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types2 === "string" ? types2 : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === void 0 ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types2.length));
  }
  if (zeroinit) {
    var ptr = ret, stop2;
    assert((ret & 3) == 0);
    stop2 = ret + (size & ~3);
    for (; ptr < stop2; ptr += 4) {
      HEAP32[ptr >> 2] = 0;
    }
    stop2 = ret + size;
    while (ptr < stop2) {
      HEAP8[ptr++ >> 0] = 0;
    }
    return ret;
  }
  if (singleType === "i8") {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(
        /** @type {!Uint8Array} */
        slab,
        ret
      );
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i2 = 0, type2, typeSize, previousType;
  while (i2 < size) {
    var curr = slab[i2];
    if (typeof curr === "function") {
      curr = Runtime.getFunctionIndex(curr);
    }
    type2 = singleType || types2[i2];
    if (type2 === 0) {
      i2++;
      continue;
    }
    assert(type2, "Must know what type to store in allocate!");
    if (type2 == "i64")
      type2 = "i32";
    setValue(ret + i2, curr, type2);
    if (previousType !== type2) {
      typeSize = Runtime.getNativeTypeSize(type2);
      previousType = type2;
    }
    i2 += typeSize;
  }
  return ret;
}
Module["allocate"] = allocate;
function getMemory(size) {
  if (!staticSealed)
    return Runtime.staticAlloc(size);
  if (!runtimeInitialized)
    return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module["getMemory"] = getMemory;
function Pointer_stringify(ptr, length) {
  if (length === 0 || !ptr)
    return "";
  var hasUtf = 0;
  var t;
  var i2 = 0;
  while (1) {
    assert(ptr + i2 < TOTAL_MEMORY);
    t = HEAPU8[ptr + i2 >> 0];
    hasUtf |= t;
    if (t == 0 && !length)
      break;
    i2++;
    if (length && i2 == length)
      break;
  }
  if (!length)
    length = i2;
  var ret = "";
  if (hasUtf < 128) {
    var MAX_CHUNK = 1024;
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module["UTF8ToString"](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;
function AsciiToString(ptr) {
  var str = "";
  while (1) {
    var ch = HEAP8[ptr++ >> 0];
    if (!ch)
      return str;
    str += String.fromCharCode(ch);
  }
}
Module["AsciiToString"] = AsciiToString;
function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(u8Array, idx) {
  var endPtr = idx;
  while (u8Array[endPtr])
    ++endPtr;
  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var u0, u1, u2, u3, u4, u5;
    var str = "";
    while (1) {
      u0 = u8Array[idx++];
      if (!u0)
        return str;
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode((u0 & 31) << 6 | u1);
        continue;
      }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = (u0 & 15) << 12 | u1 << 6 | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 248) == 240) {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 252) == 248) {
            u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;
          }
        }
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
      }
    }
  }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;
function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8, ptr);
}
Module["UTF8ToString"] = UTF8ToString;
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0))
    return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i2 = 0; i2 < str.length; ++i2) {
    var u = str.charCodeAt(i2);
    if (u >= 55296 && u <= 57343)
      u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i2) & 1023;
    if (u <= 127) {
      if (outIdx >= endIdx)
        break;
      outU8Array[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx)
        break;
      outU8Array[outIdx++] = 192 | u >> 6;
      outU8Array[outIdx++] = 128 | u & 63;
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx)
        break;
      outU8Array[outIdx++] = 224 | u >> 12;
      outU8Array[outIdx++] = 128 | u >> 6 & 63;
      outU8Array[outIdx++] = 128 | u & 63;
    } else if (u <= 2097151) {
      if (outIdx + 3 >= endIdx)
        break;
      outU8Array[outIdx++] = 240 | u >> 18;
      outU8Array[outIdx++] = 128 | u >> 12 & 63;
      outU8Array[outIdx++] = 128 | u >> 6 & 63;
      outU8Array[outIdx++] = 128 | u & 63;
    } else if (u <= 67108863) {
      if (outIdx + 4 >= endIdx)
        break;
      outU8Array[outIdx++] = 248 | u >> 24;
      outU8Array[outIdx++] = 128 | u >> 18 & 63;
      outU8Array[outIdx++] = 128 | u >> 12 & 63;
      outU8Array[outIdx++] = 128 | u >> 6 & 63;
      outU8Array[outIdx++] = 128 | u & 63;
    } else {
      if (outIdx + 5 >= endIdx)
        break;
      outU8Array[outIdx++] = 252 | u >> 30;
      outU8Array[outIdx++] = 128 | u >> 24 & 63;
      outU8Array[outIdx++] = 128 | u >> 18 & 63;
      outU8Array[outIdx++] = 128 | u >> 12 & 63;
      outU8Array[outIdx++] = 128 | u >> 6 & 63;
      outU8Array[outIdx++] = 128 | u & 63;
    }
  }
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i2 = 0; i2 < str.length; ++i2) {
    var u = str.charCodeAt(i2);
    if (u >= 55296 && u <= 57343)
      u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i2) & 1023;
    if (u <= 127) {
      ++len;
    } else if (u <= 2047) {
      len += 2;
    } else if (u <= 65535) {
      len += 3;
    } else if (u <= 2097151) {
      len += 4;
    } else if (u <= 67108863) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;
typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : void 0;
function demangle(func2) {
  var __cxa_demangle_func = Module["___cxa_demangle"] || Module["__cxa_demangle"];
  if (__cxa_demangle_func) {
    try {
      var s = func2.substr(1);
      var len = lengthBytesUTF8(s) + 1;
      var buf = _malloc(len);
      stringToUTF8(s, buf, len);
      var status = _malloc(4);
      var ret = __cxa_demangle_func(buf, 0, 0, status);
      if (getValue(status, "i32") === 0 && ret) {
        return Pointer_stringify(ret);
      }
    } catch (e) {
    } finally {
      if (buf)
        _free(buf);
      if (status)
        _free(status);
      if (ret)
        _free(ret);
    }
    return func2;
  }
  Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
  return func2;
}
function demangleAll(text) {
  var regex = /__Z[\w\d_]+/g;
  return text.replace(
    regex,
    function(x) {
      var y = demangle(x);
      return x === y ? x : x + " [" + y + "]";
    }
  );
}
function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    try {
      throw new Error(0);
    } catch (e) {
      err = e;
    }
    if (!err.stack) {
      return "(no stack trace available)";
    }
  }
  return err.stack.toString();
}
function stackTrace() {
  var js = jsStackTrace();
  if (Module["extraStackTrace"])
    js += "\n" + Module["extraStackTrace"]();
  return demangleAll(js);
}
Module["stackTrace"] = stackTrace;
var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
  Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
  Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
  Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STATIC_BASE, STATICTOP, staticSealed;
var STACK_BASE, STACKTOP, STACK_MAX;
var DYNAMIC_BASE, DYNAMICTOP_PTR;
STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
staticSealed = false;
function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
  HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022;
}
function checkStackCookie() {
  if (HEAPU32[(STACK_MAX >> 2) - 1] != 34821223 || HEAPU32[(STACK_MAX >> 2) - 2] != 2310721022) {
    abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + HEAPU32[(STACK_MAX >> 2) - 2].toString(16) + " " + HEAPU32[(STACK_MAX >> 2) - 1].toString(16));
  }
  if (HEAP32[0] !== 1668509029)
    throw "Runtime error: The application has corrupted its heap memory area (address zero)!";
}
function abortStackOverflow(allocSize) {
  abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - Module["asm"].stackSave() + allocSize) + " bytes available!");
}
function abortOnCannotGrowMemory() {
  abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
  abortOnCannotGrowMemory();
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK)
  Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(
  typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== void 0 && Int32Array.prototype.set !== void 0,
  "JS engine does not provide full typed array support"
);
if (Module["buffer"]) {
  buffer = Module["buffer"];
  assert(buffer.byteLength === TOTAL_MEMORY, "provided buffer should be " + TOTAL_MEMORY + " bytes, but it is " + buffer.byteLength);
} else {
  {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  assert(buffer.byteLength === TOTAL_MEMORY);
}
updateGlobalBufferViews();
function getTotalMemory() {
  return TOTAL_MEMORY;
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99)
  throw "Runtime error: expected the system to be little-endian!";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == "function") {
      callback();
      continue;
    }
    var func2 = callback.func;
    if (typeof func2 === "number") {
      if (callback.arg === void 0) {
        Module["dynCall_v"](func2);
      } else {
        Module["dynCall_vi"](func2, callback.arg);
      }
    } else {
      func2(callback.arg === void 0 ? null : callback.arg);
    }
  }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  checkStackCookie();
  if (runtimeInitialized)
    return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  checkStackCookie();
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  checkStackCookie();
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}
function postRun() {
  checkStackCookie();
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull)
    u8array.length = numBytesWritten;
  return u8array;
}
Module["intArrayFromString"] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i2 = 0; i2 < array.length; i2++) {
    var chr = array[i2];
    if (chr > 255) {
      assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i2 + " not in 0x00-0xFF.");
      chr &= 255;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
}
Module["intArrayToString"] = intArrayToString;
function writeStringToMemory(string, buffer2, dontAddNull) {
  Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
  var lastChar, end;
  if (dontAddNull) {
    end = buffer2 + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer2, Infinity);
  if (dontAddNull)
    HEAP8[end] = lastChar;
}
Module["writeStringToMemory"] = writeStringToMemory;
function writeArrayToMemory(array, buffer2) {
  assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
  HEAP8.set(array, buffer2);
}
Module["writeArrayToMemory"] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer2, dontAddNull) {
  for (var i2 = 0; i2 < str.length; ++i2) {
    assert(str.charCodeAt(i2) === str.charCodeAt(i2) & 255);
    HEAP8[buffer2++ >> 0] = str.charCodeAt(i2);
  }
  if (!dontAddNull)
    HEAP8[buffer2 >> 0] = 0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5)
  Math["imul"] = function imul(a, b) {
    var ah = a >>> 16;
    var al = a & 65535;
    var bh = b >>> 16;
    var bl = b & 65535;
    return al * bl + (ah * bl + al * bh << 16) | 0;
  };
Math.imul = Math["imul"];
if (!Math["clz32"])
  Math["clz32"] = function(x) {
    x = x >>> 0;
    for (var i2 = 0; i2 < 32; i2++) {
      if (x & 1 << 31 - i2)
        return i2;
    }
    return 32;
  };
Math.clz32 = Math["clz32"];
if (!Math["trunc"])
  Math["trunc"] = function(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };
Math.trunc = Math["trunc"];
var Math_abs = Math.abs;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function addRunDependency(id) {
  runDependencies++;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr("still waiting on run dependencies:");
          }
          Module.printErr("dependency: " + dep);
        }
        if (shown) {
          Module.printErr("(end of list)");
        }
      }, 1e4);
    }
  } else {
    Module.printErr("warning: run dependency added without ID");
  }
}
Module["addRunDependency"] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr("warning: run dependency removed without ID");
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var FS = {
  error: function() {
    abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1");
  },
  init: function() {
    FS.error();
  },
  createDataFile: function() {
    FS.error();
  },
  createPreloadedFile: function() {
    FS.error();
  },
  createLazyFile: function() {
    FS.error();
  },
  open: function() {
    FS.error();
  },
  mkdev: function() {
    FS.error();
  },
  registerDevice: function() {
    FS.error();
  },
  analyzePath: function() {
    FS.error();
  },
  loadFilesFromDB: function() {
    FS.error();
  },
  ErrnoError: function ErrnoError() {
    FS.error();
  }
};
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
STATIC_BASE = Runtime.GLOBAL_BASE;
STATICTOP = STATIC_BASE + 4e4;
__ATINIT__.push({ func: function() {
  __GLOBAL__sub_I_bind_cpp();
} });
allocate([108, 4, 0, 0, 26, 8, 0, 0, 108, 4, 0, 0, 57, 8, 0, 0, 108, 4, 0, 0, 88, 8, 0, 0, 108, 4, 0, 0, 119, 8, 0, 0, 108, 4, 0, 0, 150, 8, 0, 0, 108, 4, 0, 0, 181, 8, 0, 0, 108, 4, 0, 0, 212, 8, 0, 0, 108, 4, 0, 0, 243, 8, 0, 0, 108, 4, 0, 0, 18, 9, 0, 0, 108, 4, 0, 0, 49, 9, 0, 0, 108, 4, 0, 0, 80, 9, 0, 0, 108, 4, 0, 0, 111, 9, 0, 0, 108, 4, 0, 0, 142, 9, 0, 0, 216, 4, 0, 0, 161, 9, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 0, 0, 0, 0, 0, 0, 0, 108, 4, 0, 0, 224, 9, 0, 0, 216, 4, 0, 0, 6, 10, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 0, 0, 0, 0, 0, 0, 0, 216, 4, 0, 0, 69, 10, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 136, 0, 0, 0, 0, 0, 0, 0, 148, 4, 0, 0, 100, 21, 0, 0, 208, 0, 0, 0, 0, 0, 0, 0, 148, 4, 0, 0, 17, 21, 0, 0, 224, 0, 0, 0, 0, 0, 0, 0, 108, 4, 0, 0, 50, 21, 0, 0, 148, 4, 0, 0, 63, 21, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 148, 4, 0, 0, 134, 21, 0, 0, 208, 0, 0, 0, 0, 0, 0, 0, 188, 4, 0, 0, 174, 21, 0, 0, 188, 4, 0, 0, 176, 21, 0, 0, 188, 4, 0, 0, 178, 21, 0, 0, 188, 4, 0, 0, 180, 21, 0, 0, 188, 4, 0, 0, 182, 21, 0, 0, 188, 4, 0, 0, 184, 21, 0, 0, 188, 4, 0, 0, 186, 21, 0, 0, 188, 4, 0, 0, 188, 21, 0, 0, 188, 4, 0, 0, 190, 21, 0, 0, 188, 4, 0, 0, 192, 21, 0, 0, 188, 4, 0, 0, 194, 21, 0, 0, 188, 4, 0, 0, 196, 21, 0, 0, 188, 4, 0, 0, 198, 21, 0, 0, 148, 4, 0, 0, 200, 21, 0, 0, 192, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 192, 3, 0, 0, 192, 4, 0, 0, 192, 5, 0, 0, 192, 6, 0, 0, 192, 7, 0, 0, 192, 8, 0, 0, 192, 9, 0, 0, 192, 10, 0, 0, 192, 11, 0, 0, 192, 12, 0, 0, 192, 13, 0, 0, 192, 14, 0, 0, 192, 15, 0, 0, 192, 16, 0, 0, 192, 17, 0, 0, 192, 18, 0, 0, 192, 19, 0, 0, 192, 20, 0, 0, 192, 21, 0, 0, 192, 22, 0, 0, 192, 23, 0, 0, 192, 24, 0, 0, 192, 25, 0, 0, 192, 26, 0, 0, 192, 27, 0, 0, 192, 28, 0, 0, 192, 29, 0, 0, 192, 30, 0, 0, 192, 31, 0, 0, 192, 0, 0, 0, 179, 1, 0, 0, 195, 2, 0, 0, 195, 3, 0, 0, 195, 4, 0, 0, 195, 5, 0, 0, 195, 6, 0, 0, 195, 7, 0, 0, 195, 8, 0, 0, 195, 9, 0, 0, 195, 10, 0, 0, 195, 11, 0, 0, 195, 12, 0, 0, 195, 13, 0, 0, 211, 14, 0, 0, 195, 15, 0, 0, 195, 0, 0, 12, 187, 1, 0, 12, 195, 2, 0, 12, 195, 3, 0, 12, 195, 4, 0, 12, 211, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 152, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 57, 152, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 100, 0, 0, 0, 232, 3, 0, 0, 16, 39, 0, 0, 160, 134, 1, 0, 64, 66, 15, 0, 128, 150, 152, 0, 0, 225, 245, 5, 95, 112, 137, 0, 255, 9, 47, 15, 0, 0, 0, 0, 192, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 11, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 232, 0, 0, 0, 5, 0, 0, 0, 13, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 248, 0, 0, 0, 5, 0, 0, 0, 17, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 112, 1, 0, 0, 5, 0, 0, 0, 19, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 20, 0, 0, 0, 21, 0, 0, 0, 22, 0, 0, 0, 37, 108, 108, 117, 0, 118, 111, 105, 100, 0, 98, 111, 111, 108, 0, 99, 104, 97, 114, 0, 115, 105, 103, 110, 101, 100, 32, 99, 104, 97, 114, 0, 117, 110, 115, 105, 103, 110, 101, 100, 32, 99, 104, 97, 114, 0, 115, 104, 111, 114, 116, 0, 117, 110, 115, 105, 103, 110, 101, 100, 32, 115, 104, 111, 114, 116, 0, 105, 110, 116, 0, 117, 110, 115, 105, 103, 110, 101, 100, 32, 105, 110, 116, 0, 108, 111, 110, 103, 0, 117, 110, 115, 105, 103, 110, 101, 100, 32, 108, 111, 110, 103, 0, 102, 108, 111, 97, 116, 0, 100, 111, 117, 98, 108, 101, 0, 115, 116, 100, 58, 58, 115, 116, 114, 105, 110, 103, 0, 115, 116, 100, 58, 58, 98, 97, 115, 105, 99, 95, 115, 116, 114, 105, 110, 103, 60, 117, 110, 115, 105, 103, 110, 101, 100, 32, 99, 104, 97, 114, 62, 0, 115, 116, 100, 58, 58, 119, 115, 116, 114, 105, 110, 103, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 118, 97, 108, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 99, 104, 97, 114, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 115, 105, 103, 110, 101, 100, 32, 99, 104, 97, 114, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 110, 115, 105, 103, 110, 101, 100, 32, 99, 104, 97, 114, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 115, 104, 111, 114, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 110, 115, 105, 103, 110, 101, 100, 32, 115, 104, 111, 114, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 105, 110, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 110, 115, 105, 103, 110, 101, 100, 32, 105, 110, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 108, 111, 110, 103, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 110, 115, 105, 103, 110, 101, 100, 32, 108, 111, 110, 103, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 105, 110, 116, 56, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 105, 110, 116, 56, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 105, 110, 116, 49, 54, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 105, 110, 116, 49, 54, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 105, 110, 116, 51, 50, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 117, 105, 110, 116, 51, 50, 95, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 102, 108, 111, 97, 116, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 100, 111, 117, 98, 108, 101, 62, 0, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 58, 58, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 60, 108, 111, 110, 103, 32, 100, 111, 117, 98, 108, 101, 62, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 101, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 100, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 102, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 109, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 108, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 106, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 105, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 116, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 115, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 104, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 97, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 49, 49, 109, 101, 109, 111, 114, 121, 95, 118, 105, 101, 119, 73, 99, 69, 69, 0, 78, 49, 48, 101, 109, 115, 99, 114, 105, 112, 116, 101, 110, 51, 118, 97, 108, 69, 0, 78, 83, 116, 51, 95, 95, 50, 49, 50, 98, 97, 115, 105, 99, 95, 115, 116, 114, 105, 110, 103, 73, 119, 78, 83, 95, 49, 49, 99, 104, 97, 114, 95, 116, 114, 97, 105, 116, 115, 73, 119, 69, 69, 78, 83, 95, 57, 97, 108, 108, 111, 99, 97, 116, 111, 114, 73, 119, 69, 69, 69, 69, 0, 78, 83, 116, 51, 95, 95, 50, 50, 49, 95, 95, 98, 97, 115, 105, 99, 95, 115, 116, 114, 105, 110, 103, 95, 99, 111, 109, 109, 111, 110, 73, 76, 98, 49, 69, 69, 69, 0, 78, 83, 116, 51, 95, 95, 50, 49, 50, 98, 97, 115, 105, 99, 95, 115, 116, 114, 105, 110, 103, 73, 104, 78, 83, 95, 49, 49, 99, 104, 97, 114, 95, 116, 114, 97, 105, 116, 115, 73, 104, 69, 69, 78, 83, 95, 57, 97, 108, 108, 111, 99, 97, 116, 111, 114, 73, 104, 69, 69, 69, 69, 0, 78, 83, 116, 51, 95, 95, 50, 49, 50, 98, 97, 115, 105, 99, 95, 115, 116, 114, 105, 110, 103, 73, 99, 78, 83, 95, 49, 49, 99, 104, 97, 114, 95, 116, 114, 97, 105, 116, 115, 73, 99, 69, 69, 78, 83, 95, 57, 97, 108, 108, 111, 99, 97, 116, 111, 114, 73, 99, 69, 69, 69, 69, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 255, 255, 255, 255, 255, 255, 255, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 255, 255, 255, 255, 255, 255, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 4, 7, 3, 6, 5, 0, 17, 0, 10, 0, 17, 17, 17, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 15, 10, 17, 17, 17, 3, 10, 7, 0, 1, 19, 9, 11, 11, 0, 0, 9, 6, 11, 0, 0, 11, 0, 6, 17, 0, 0, 0, 17, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 10, 10, 17, 17, 17, 0, 10, 0, 0, 2, 0, 9, 11, 0, 0, 0, 9, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 4, 13, 0, 0, 0, 0, 9, 14, 0, 0, 0, 0, 0, 14, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 9, 16, 0, 0, 0, 0, 0, 16, 0, 0, 16, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 18, 18, 18, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 9, 11, 0, 0, 0, 0, 0, 11, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 12, 0, 0, 0, 0, 9, 12, 0, 0, 0, 0, 0, 12, 0, 0, 12, 0, 0, 45, 43, 32, 32, 32, 48, 88, 48, 120, 0, 40, 110, 117, 108, 108, 41, 0, 45, 48, 88, 43, 48, 88, 32, 48, 88, 45, 48, 120, 43, 48, 120, 32, 48, 120, 0, 105, 110, 102, 0, 73, 78, 70, 0, 78, 65, 78, 0, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 46, 0, 84, 33, 34, 25, 13, 1, 2, 3, 17, 75, 28, 12, 16, 4, 11, 29, 18, 30, 39, 104, 110, 111, 112, 113, 98, 32, 5, 6, 15, 19, 20, 21, 26, 8, 22, 7, 40, 36, 23, 24, 9, 10, 14, 27, 31, 37, 35, 131, 130, 125, 38, 42, 43, 60, 61, 62, 63, 67, 71, 74, 77, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 105, 106, 107, 108, 114, 115, 116, 121, 122, 123, 124, 0, 73, 108, 108, 101, 103, 97, 108, 32, 98, 121, 116, 101, 32, 115, 101, 113, 117, 101, 110, 99, 101, 0, 68, 111, 109, 97, 105, 110, 32, 101, 114, 114, 111, 114, 0, 82, 101, 115, 117, 108, 116, 32, 110, 111, 116, 32, 114, 101, 112, 114, 101, 115, 101, 110, 116, 97, 98, 108, 101, 0, 78, 111, 116, 32, 97, 32, 116, 116, 121, 0, 80, 101, 114, 109, 105, 115, 115, 105, 111, 110, 32, 100, 101, 110, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 110, 111, 116, 32, 112, 101, 114, 109, 105, 116, 116, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 102, 105, 108, 101, 32, 111, 114, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 78, 111, 32, 115, 117, 99, 104, 32, 112, 114, 111, 99, 101, 115, 115, 0, 70, 105, 108, 101, 32, 101, 120, 105, 115, 116, 115, 0, 86, 97, 108, 117, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 32, 102, 111, 114, 32, 100, 97, 116, 97, 32, 116, 121, 112, 101, 0, 78, 111, 32, 115, 112, 97, 99, 101, 32, 108, 101, 102, 116, 32, 111, 110, 32, 100, 101, 118, 105, 99, 101, 0, 79, 117, 116, 32, 111, 102, 32, 109, 101, 109, 111, 114, 121, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 98, 117, 115, 121, 0, 73, 110, 116, 101, 114, 114, 117, 112, 116, 101, 100, 32, 115, 121, 115, 116, 101, 109, 32, 99, 97, 108, 108, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 108, 121, 32, 117, 110, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 73, 110, 118, 97, 108, 105, 100, 32, 115, 101, 101, 107, 0, 67, 114, 111, 115, 115, 45, 100, 101, 118, 105, 99, 101, 32, 108, 105, 110, 107, 0, 82, 101, 97, 100, 45, 111, 110, 108, 121, 32, 102, 105, 108, 101, 32, 115, 121, 115, 116, 101, 109, 0, 68, 105, 114, 101, 99, 116, 111, 114, 121, 32, 110, 111, 116, 32, 101, 109, 112, 116, 121, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 112, 101, 101, 114, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 116, 105, 109, 101, 100, 32, 111, 117, 116, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 102, 117, 115, 101, 100, 0, 72, 111, 115, 116, 32, 105, 115, 32, 100, 111, 119, 110, 0, 72, 111, 115, 116, 32, 105, 115, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 65, 100, 100, 114, 101, 115, 115, 32, 105, 110, 32, 117, 115, 101, 0, 66, 114, 111, 107, 101, 110, 32, 112, 105, 112, 101, 0, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 32, 111, 114, 32, 97, 100, 100, 114, 101, 115, 115, 0, 66, 108, 111, 99, 107, 32, 100, 101, 118, 105, 99, 101, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 78, 111, 32, 115, 117, 99, 104, 32, 100, 101, 118, 105, 99, 101, 0, 78, 111, 116, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 73, 115, 32, 97, 32, 100, 105, 114, 101, 99, 116, 111, 114, 121, 0, 84, 101, 120, 116, 32, 102, 105, 108, 101, 32, 98, 117, 115, 121, 0, 69, 120, 101, 99, 32, 102, 111, 114, 109, 97, 116, 32, 101, 114, 114, 111, 114, 0, 73, 110, 118, 97, 108, 105, 100, 32, 97, 114, 103, 117, 109, 101, 110, 116, 0, 65, 114, 103, 117, 109, 101, 110, 116, 32, 108, 105, 115, 116, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 83, 121, 109, 98, 111, 108, 105, 99, 32, 108, 105, 110, 107, 32, 108, 111, 111, 112, 0, 70, 105, 108, 101, 110, 97, 109, 101, 32, 116, 111, 111, 32, 108, 111, 110, 103, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 111, 112, 101, 110, 32, 102, 105, 108, 101, 115, 32, 105, 110, 32, 115, 121, 115, 116, 101, 109, 0, 78, 111, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 66, 97, 100, 32, 102, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 0, 78, 111, 32, 99, 104, 105, 108, 100, 32, 112, 114, 111, 99, 101, 115, 115, 0, 66, 97, 100, 32, 97, 100, 100, 114, 101, 115, 115, 0, 70, 105, 108, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 84, 111, 111, 32, 109, 97, 110, 121, 32, 108, 105, 110, 107, 115, 0, 78, 111, 32, 108, 111, 99, 107, 115, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 82, 101, 115, 111, 117, 114, 99, 101, 32, 100, 101, 97, 100, 108, 111, 99, 107, 32, 119, 111, 117, 108, 100, 32, 111, 99, 99, 117, 114, 0, 83, 116, 97, 116, 101, 32, 110, 111, 116, 32, 114, 101, 99, 111, 118, 101, 114, 97, 98, 108, 101, 0, 80, 114, 101, 118, 105, 111, 117, 115, 32, 111, 119, 110, 101, 114, 32, 100, 105, 101, 100, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 99, 97, 110, 99, 101, 108, 101, 100, 0, 70, 117, 110, 99, 116, 105, 111, 110, 32, 110, 111, 116, 32, 105, 109, 112, 108, 101, 109, 101, 110, 116, 101, 100, 0, 78, 111, 32, 109, 101, 115, 115, 97, 103, 101, 32, 111, 102, 32, 100, 101, 115, 105, 114, 101, 100, 32, 116, 121, 112, 101, 0, 73, 100, 101, 110, 116, 105, 102, 105, 101, 114, 32, 114, 101, 109, 111, 118, 101, 100, 0, 68, 101, 118, 105, 99, 101, 32, 110, 111, 116, 32, 97, 32, 115, 116, 114, 101, 97, 109, 0, 78, 111, 32, 100, 97, 116, 97, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 68, 101, 118, 105, 99, 101, 32, 116, 105, 109, 101, 111, 117, 116, 0, 79, 117, 116, 32, 111, 102, 32, 115, 116, 114, 101, 97, 109, 115, 32, 114, 101, 115, 111, 117, 114, 99, 101, 115, 0, 76, 105, 110, 107, 32, 104, 97, 115, 32, 98, 101, 101, 110, 32, 115, 101, 118, 101, 114, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 101, 114, 114, 111, 114, 0, 66, 97, 100, 32, 109, 101, 115, 115, 97, 103, 101, 0, 70, 105, 108, 101, 32, 100, 101, 115, 99, 114, 105, 112, 116, 111, 114, 32, 105, 110, 32, 98, 97, 100, 32, 115, 116, 97, 116, 101, 0, 78, 111, 116, 32, 97, 32, 115, 111, 99, 107, 101, 116, 0, 68, 101, 115, 116, 105, 110, 97, 116, 105, 111, 110, 32, 97, 100, 100, 114, 101, 115, 115, 32, 114, 101, 113, 117, 105, 114, 101, 100, 0, 77, 101, 115, 115, 97, 103, 101, 32, 116, 111, 111, 32, 108, 97, 114, 103, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 119, 114, 111, 110, 103, 32, 116, 121, 112, 101, 32, 102, 111, 114, 32, 115, 111, 99, 107, 101, 116, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 116, 121, 112, 101, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 78, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 80, 114, 111, 116, 111, 99, 111, 108, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 0, 65, 100, 100, 114, 101, 115, 115, 32, 102, 97, 109, 105, 108, 121, 32, 110, 111, 116, 32, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 98, 121, 32, 112, 114, 111, 116, 111, 99, 111, 108, 0, 65, 100, 100, 114, 101, 115, 115, 32, 110, 111, 116, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 78, 101, 116, 119, 111, 114, 107, 32, 105, 115, 32, 100, 111, 119, 110, 0, 78, 101, 116, 119, 111, 114, 107, 32, 117, 110, 114, 101, 97, 99, 104, 97, 98, 108, 101, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 114, 101, 115, 101, 116, 32, 98, 121, 32, 110, 101, 116, 119, 111, 114, 107, 0, 67, 111, 110, 110, 101, 99, 116, 105, 111, 110, 32, 97, 98, 111, 114, 116, 101, 100, 0, 78, 111, 32, 98, 117, 102, 102, 101, 114, 32, 115, 112, 97, 99, 101, 32, 97, 118, 97, 105, 108, 97, 98, 108, 101, 0, 83, 111, 99, 107, 101, 116, 32, 105, 115, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 83, 111, 99, 107, 101, 116, 32, 110, 111, 116, 32, 99, 111, 110, 110, 101, 99, 116, 101, 100, 0, 67, 97, 110, 110, 111, 116, 32, 115, 101, 110, 100, 32, 97, 102, 116, 101, 114, 32, 115, 111, 99, 107, 101, 116, 32, 115, 104, 117, 116, 100, 111, 119, 110, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 97, 108, 114, 101, 97, 100, 121, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 79, 112, 101, 114, 97, 116, 105, 111, 110, 32, 105, 110, 32, 112, 114, 111, 103, 114, 101, 115, 115, 0, 83, 116, 97, 108, 101, 32, 102, 105, 108, 101, 32, 104, 97, 110, 100, 108, 101, 0, 82, 101, 109, 111, 116, 101, 32, 73, 47, 79, 32, 101, 114, 114, 111, 114, 0, 81, 117, 111, 116, 97, 32, 101, 120, 99, 101, 101, 100, 101, 100, 0, 78, 111, 32, 109, 101, 100, 105, 117, 109, 32, 102, 111, 117, 110, 100, 0, 87, 114, 111, 110, 103, 32, 109, 101, 100, 105, 117, 109, 32, 116, 121, 112, 101, 0, 78, 111, 32, 101, 114, 114, 111, 114, 32, 105, 110, 102, 111, 114, 109, 97, 116, 105, 111, 110, 0, 0, 105, 110, 102, 105, 110, 105, 116, 121, 0, 110, 97, 110, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 54, 95, 95, 115, 104, 105, 109, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 83, 116, 57, 116, 121, 112, 101, 95, 105, 110, 102, 111, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 48, 95, 95, 115, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 55, 95, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 51, 95, 95, 102, 117, 110, 100, 97, 109, 101, 110, 116, 97, 108, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0, 118, 0, 98, 0, 99, 0, 104, 0, 97, 0, 115, 0, 116, 0, 105, 0, 106, 0, 108, 0, 109, 0, 102, 0, 100, 0, 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 49, 95, 95, 118, 109, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
assert(tempDoublePtr % 8 == 0);
function embind_init_charCodes() {
  var codes = new Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    codes[i2] = String.fromCharCode(i2);
  }
  embind_charCodes = codes;
}
var embind_charCodes = void 0;
function readLatin1String(ptr) {
  var ret = "";
  var c = ptr;
  while (HEAPU8[c]) {
    ret += embind_charCodes[HEAPU8[c++]];
  }
  return ret;
}
var awaitingDependencies = {};
var registeredTypes = {};
var char_0 = 48;
var char_9 = 57;
function makeLegalFunctionName(name) {
  if (void 0 === name) {
    return "_unknown";
  }
  name = name.replace(/[^a-zA-Z0-9_]/g, "$");
  var f = name.charCodeAt(0);
  if (f >= char_0 && f <= char_9) {
    return "_" + name;
  } else {
    return name;
  }
}
function createNamedFunction(name, body) {
  name = makeLegalFunctionName(name);
  return new Function(
    "body",
    "return function " + name + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n'
  )(body);
}
function extendError(baseErrorType, errorName) {
  var errorClass = createNamedFunction(errorName, function(message) {
    this.name = errorName;
    this.message = message;
    var stack = new Error(message).stack;
    if (stack !== void 0) {
      this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
    }
  });
  errorClass.prototype = Object.create(baseErrorType.prototype);
  errorClass.prototype.constructor = errorClass;
  errorClass.prototype.toString = function() {
    if (this.message === void 0) {
      return this.name;
    } else {
      return this.name + ": " + this.message;
    }
  };
  return errorClass;
}
var BindingError = void 0;
function throwBindingError(message) {
  throw new BindingError(message);
}
var InternalError = void 0;
function throwInternalError(message) {
  throw new InternalError(message);
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
  myTypes.forEach(function(type2) {
  });
  function onComplete(typeConverters2) {
    var myTypeConverters = getTypeConverters(typeConverters2);
    if (myTypeConverters.length !== myTypes.length) {
      throwInternalError("Mismatched type converter count");
    }
    for (var i2 = 0; i2 < myTypes.length; ++i2) {
      registerType(myTypes[i2], myTypeConverters[i2]);
    }
  }
  var typeConverters = new Array(dependentTypes.length);
  var unregisteredTypes = [];
  var registered = 0;
  dependentTypes.forEach(function(dt, i2) {
    if (registeredTypes.hasOwnProperty(dt)) {
      typeConverters[i2] = registeredTypes[dt];
    } else {
      unregisteredTypes.push(dt);
      if (!awaitingDependencies.hasOwnProperty(dt)) {
        awaitingDependencies[dt] = [];
      }
      awaitingDependencies[dt].push(function() {
        typeConverters[i2] = registeredTypes[dt];
        ++registered;
        if (registered === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      });
    }
  });
  if (0 === unregisteredTypes.length) {
    onComplete(typeConverters);
  }
}
function registerType(rawType, registeredInstance, options) {
  options = options || {};
  if (!("argPackAdvance" in registeredInstance)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  var name = registeredInstance.name;
  if (!rawType) {
    throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
  }
  if (registeredTypes.hasOwnProperty(rawType)) {
    if (options.ignoreDuplicateRegistrations) {
      return;
    } else {
      throwBindingError("Cannot register type '" + name + "' twice");
    }
  }
  registeredTypes[rawType] = registeredInstance;
  if (awaitingDependencies.hasOwnProperty(rawType)) {
    var callbacks = awaitingDependencies[rawType];
    delete awaitingDependencies[rawType];
    callbacks.forEach(function(cb) {
      cb();
    });
  }
}
function __embind_register_void(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    isVoid: true,
    // void return values can be optimized out sometimes
    name,
    "argPackAdvance": 0,
    "fromWireType": function() {
      return void 0;
    },
    "toWireType": function(destructors, o) {
      return void 0;
    }
  });
}
function _embind_repr(v) {
  if (v === null) {
    return "null";
  }
  var t = typeof v;
  if (t === "object" || t === "array" || t === "function") {
    return v.toString();
  } else {
    return "" + v;
  }
}
function floatReadValueFromPointer(name, shift) {
  switch (shift) {
    case 2:
      return function(pointer) {
        return this["fromWireType"](HEAPF32[pointer >> 2]);
      };
    case 3:
      return function(pointer) {
        return this["fromWireType"](HEAPF64[pointer >> 3]);
      };
    default:
      throw new TypeError("Unknown float type: " + name);
  }
}
function getShiftFromSize(size) {
  switch (size) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError("Unknown type size: " + size);
  }
}
function __embind_register_float(rawType, name, size) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name,
    "fromWireType": function(value) {
      return value;
    },
    "toWireType": function(destructors, value) {
      if (typeof value !== "number" && typeof value !== "boolean") {
        throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
      }
      return value;
    },
    "argPackAdvance": 8,
    "readValueFromPointer": floatReadValueFromPointer(name, shift),
    destructorFunction: null
    // This type does not need a destructor
  });
}
function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
  var shift = getShiftFromSize(size);
  name = readLatin1String(name);
  registerType(rawType, {
    name,
    "fromWireType": function(wt) {
      return !!wt;
    },
    "toWireType": function(destructors, o) {
      return o ? trueValue : falseValue;
    },
    "argPackAdvance": 8,
    "readValueFromPointer": function(pointer) {
      var heap;
      if (size === 1) {
        heap = HEAP8;
      } else if (size === 2) {
        heap = HEAP16;
      } else if (size === 4) {
        heap = HEAP32;
      } else {
        throw new TypeError("Unknown boolean type size: " + name);
      }
      return this["fromWireType"](heap[pointer >> shift]);
    },
    destructorFunction: null
    // This type does not need a destructor
  });
}
function simpleReadValueFromPointer(pointer) {
  return this["fromWireType"](HEAPU32[pointer >> 2]);
}
function __embind_register_std_string(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    name,
    "fromWireType": function(value) {
      var length = HEAPU32[value >> 2];
      var a = new Array(length);
      for (var i2 = 0; i2 < length; ++i2) {
        a[i2] = String.fromCharCode(HEAPU8[value + 4 + i2]);
      }
      _free(value);
      return a.join("");
    },
    "toWireType": function(destructors, value) {
      if (value instanceof ArrayBuffer) {
        value = new Uint8Array(value);
      }
      function getTAElement(ta, index) {
        return ta[index];
      }
      function getStringElement(string, index) {
        return string.charCodeAt(index);
      }
      var getElement;
      if (value instanceof Uint8Array) {
        getElement = getTAElement;
      } else if (value instanceof Uint8ClampedArray) {
        getElement = getTAElement;
      } else if (value instanceof Int8Array) {
        getElement = getTAElement;
      } else if (typeof value === "string") {
        getElement = getStringElement;
      } else {
        throwBindingError("Cannot pass non-string to std::string");
      }
      var length = value.length;
      var ptr = _malloc(4 + length);
      HEAPU32[ptr >> 2] = length;
      for (var i2 = 0; i2 < length; ++i2) {
        var charCode = getElement(value, i2);
        if (charCode > 255) {
          _free(ptr);
          throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
        }
        HEAPU8[ptr + 4 + i2] = charCode;
      }
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    "argPackAdvance": 8,
    "readValueFromPointer": simpleReadValueFromPointer,
    destructorFunction: function(ptr) {
      _free(ptr);
    }
  });
}
function integerReadValueFromPointer(name, shift, signed) {
  switch (shift) {
    case 0:
      return signed ? function readS8FromPointer(pointer) {
        return HEAP8[pointer];
      } : function readU8FromPointer(pointer) {
        return HEAPU8[pointer];
      };
    case 1:
      return signed ? function readS16FromPointer(pointer) {
        return HEAP16[pointer >> 1];
      } : function readU16FromPointer(pointer) {
        return HEAPU16[pointer >> 1];
      };
    case 2:
      return signed ? function readS32FromPointer(pointer) {
        return HEAP32[pointer >> 2];
      } : function readU32FromPointer(pointer) {
        return HEAPU32[pointer >> 2];
      };
    default:
      throw new TypeError("Unknown integer type: " + name);
  }
}
function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
  name = readLatin1String(name);
  if (maxRange === -1) {
    maxRange = 4294967295;
  }
  var shift = getShiftFromSize(size);
  var fromWireType = function(value) {
    return value;
  };
  if (minRange === 0) {
    var bitshift = 32 - 8 * size;
    fromWireType = function(value) {
      return value << bitshift >>> bitshift;
    };
  }
  var isUnsignedType = name.indexOf("unsigned") != -1;
  registerType(primitiveType, {
    name,
    "fromWireType": fromWireType,
    "toWireType": function(destructors, value) {
      if (typeof value !== "number" && typeof value !== "boolean") {
        throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
      }
      if (value < minRange || value > maxRange) {
        throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
      }
      return isUnsignedType ? value >>> 0 : value | 0;
    },
    "argPackAdvance": 8,
    "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
    destructorFunction: null
    // This type does not need a destructor
  });
}
function ___lock() {
}
function ___unlock() {
}
var SYSCALLS = { varargs: 0, get: function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
}, getStr: function() {
  var ret = Pointer_stringify(SYSCALLS.get());
  return ret;
}, get64: function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  if (low >= 0)
    assert(high === 0);
  else
    assert(high === -1);
  return low;
}, getZero: function() {
  assert(SYSCALLS.get() === 0);
} };
function ___syscall6(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD();
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
      abort(e);
    return -e.errno;
  }
}
var cttz_i8 = allocate([8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0], "i8", ALLOC_STATIC);
function ___setErrNo(value) {
  if (Module["___errno_location"])
    HEAP32[Module["___errno_location"]() >> 2] = value;
  else
    Module.printErr("failed to set errno from JS");
  return value;
}
function __embind_register_std_wstring(rawType, charSize, name) {
  name = readLatin1String(name);
  var getHeap, shift;
  if (charSize === 2) {
    getHeap = function() {
      return HEAPU16;
    };
    shift = 1;
  } else if (charSize === 4) {
    getHeap = function() {
      return HEAPU32;
    };
    shift = 2;
  }
  registerType(rawType, {
    name,
    "fromWireType": function(value) {
      var HEAP2 = getHeap();
      var length = HEAPU32[value >> 2];
      var a = new Array(length);
      var start2 = value + 4 >> shift;
      for (var i2 = 0; i2 < length; ++i2) {
        a[i2] = String.fromCharCode(HEAP2[start2 + i2]);
      }
      _free(value);
      return a.join("");
    },
    "toWireType": function(destructors, value) {
      var HEAP2 = getHeap();
      var length = value.length;
      var ptr = _malloc(4 + length * charSize);
      HEAPU32[ptr >> 2] = length;
      var start2 = ptr + 4 >> shift;
      for (var i2 = 0; i2 < length; ++i2) {
        HEAP2[start2 + i2] = value.charCodeAt(i2);
      }
      if (destructors !== null) {
        destructors.push(_free, ptr);
      }
      return ptr;
    },
    "argPackAdvance": 8,
    "readValueFromPointer": simpleReadValueFromPointer,
    destructorFunction: function(ptr) {
      _free(ptr);
    }
  });
}
function __ZSt18uncaught_exceptionv() {
  return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
var EXCEPTIONS = { last: 0, caught: [], infos: {}, deAdjust: function(adjusted) {
  if (!adjusted || EXCEPTIONS.infos[adjusted])
    return adjusted;
  for (var ptr in EXCEPTIONS.infos) {
    var info = EXCEPTIONS.infos[ptr];
    if (info.adjusted === adjusted) {
      return ptr;
    }
  }
  return adjusted;
}, addRef: function(ptr) {
  if (!ptr)
    return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount++;
}, decRef: function(ptr) {
  if (!ptr)
    return;
  var info = EXCEPTIONS.infos[ptr];
  assert(info.refcount > 0);
  info.refcount--;
  if (info.refcount === 0 && !info.rethrown) {
    if (info.destructor) {
      Module["dynCall_vi"](info.destructor, ptr);
    }
    delete EXCEPTIONS.infos[ptr];
    ___cxa_free_exception(ptr);
  }
}, clearRef: function(ptr) {
  if (!ptr)
    return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount = 0;
} };
function ___resumeException(ptr) {
  if (!EXCEPTIONS.last) {
    EXCEPTIONS.last = ptr;
  }
  throw ptr;
}
function ___cxa_find_matching_catch() {
  var thrown = EXCEPTIONS.last;
  if (!thrown) {
    return (Runtime.setTempRet0(0), 0) | 0;
  }
  var info = EXCEPTIONS.infos[thrown];
  var throwntype = info.type;
  if (!throwntype) {
    return (Runtime.setTempRet0(0), thrown) | 0;
  }
  var typeArray = Array.prototype.slice.call(arguments);
  Module["___cxa_is_pointer_type"](throwntype);
  if (!___cxa_find_matching_catch.buffer)
    ___cxa_find_matching_catch.buffer = _malloc(4);
  HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
  thrown = ___cxa_find_matching_catch.buffer;
  for (var i2 = 0; i2 < typeArray.length; i2++) {
    if (typeArray[i2] && Module["___cxa_can_catch"](typeArray[i2], throwntype, thrown)) {
      thrown = HEAP32[thrown >> 2];
      info.adjusted = thrown;
      return (Runtime.setTempRet0(typeArray[i2]), thrown) | 0;
    }
  }
  thrown = HEAP32[thrown >> 2];
  return (Runtime.setTempRet0(throwntype), thrown) | 0;
}
function ___gxx_personality_v0() {
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
  return dest;
}
var emval_free_list = [];
var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
function __emval_decref(handle) {
  if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
    emval_handle_array[handle] = void 0;
    emval_free_list.push(handle);
  }
}
function count_emval_handles() {
  var count = 0;
  for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
    if (emval_handle_array[i2] !== void 0) {
      ++count;
    }
  }
  return count;
}
function get_first_emval() {
  for (var i2 = 5; i2 < emval_handle_array.length; ++i2) {
    if (emval_handle_array[i2] !== void 0) {
      return emval_handle_array[i2];
    }
  }
  return null;
}
function init_emval() {
  Module["count_emval_handles"] = count_emval_handles;
  Module["get_first_emval"] = get_first_emval;
}
function __emval_register(value) {
  switch (value) {
    case void 0: {
      return 1;
    }
    case null: {
      return 2;
    }
    case true: {
      return 3;
    }
    case false: {
      return 4;
    }
    default: {
      var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
      emval_handle_array[handle] = { refcount: 1, value };
      return handle;
    }
  }
}
function __embind_register_emval(rawType, name) {
  name = readLatin1String(name);
  registerType(rawType, {
    name,
    "fromWireType": function(handle) {
      var rv = emval_handle_array[handle].value;
      __emval_decref(handle);
      return rv;
    },
    "toWireType": function(destructors, value) {
      return __emval_register(value);
    },
    "argPackAdvance": 8,
    "readValueFromPointer": simpleReadValueFromPointer,
    destructorFunction: null
    // This type does not need a destructor
    // TODO: do we need a deleteObject here?  write a test where
    // emval is passed into JS via an interface
  });
}
function __embind_register_memory_view(rawType, dataTypeIndex, name) {
  var typeMapping = [
    Int8Array,
    Uint8Array,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array
  ];
  var TA = typeMapping[dataTypeIndex];
  function decodeMemoryView(handle) {
    handle = handle >> 2;
    var heap = HEAPU32;
    var size = heap[handle];
    var data = heap[handle + 1];
    return new TA(heap["buffer"], data, size);
  }
  name = readLatin1String(name);
  registerType(rawType, {
    name,
    "fromWireType": decodeMemoryView,
    "argPackAdvance": 8,
    "readValueFromPointer": decodeMemoryView
  }, {
    ignoreDuplicateRegistrations: true
  });
}
function ___syscall140(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
    var offset = offset_low;
    FS.llseek(stream, offset, whence);
    HEAP32[result >> 2] = stream.position;
    if (stream.getdents && offset === 0 && whence === 0)
      stream.getdents = null;
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
      abort(e);
    return -e.errno;
  }
}
function ___syscall146(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
    var ret = 0;
    if (!___syscall146.buffer) {
      ___syscall146.buffers = [null, [], []];
      ___syscall146.printChar = function(stream2, curr) {
        var buffer2 = ___syscall146.buffers[stream2];
        assert(buffer2);
        if (curr === 0 || curr === 10) {
          (stream2 === 1 ? Module["print"] : Module["printErr"])(UTF8ArrayToString(buffer2, 0));
          buffer2.length = 0;
        } else {
          buffer2.push(curr);
        }
      };
    }
    for (var i2 = 0; i2 < iovcnt; i2++) {
      var ptr = HEAP32[iov + i2 * 8 >> 2];
      var len = HEAP32[iov + (i2 * 8 + 4) >> 2];
      for (var j = 0; j < len; j++) {
        ___syscall146.printChar(stream, HEAPU8[ptr + j]);
      }
      ret += len;
    }
    return ret;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
      abort(e);
    return -e.errno;
  }
}
function ___syscall54(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
      abort(e);
    return -e.errno;
  }
}
embind_init_charCodes();
BindingError = Module["BindingError"] = extendError(Error, "BindingError");
InternalError = Module["InternalError"] = extendError(Error, "InternalError");
init_emval();
__ATEXIT__.push(function() {
  var fflush = Module["_fflush"];
  if (fflush)
    fflush(0);
  var printChar = ___syscall146.printChar;
  if (!printChar)
    return;
  var buffers = ___syscall146.buffers;
  if (buffers[1].length)
    printChar(1, 10);
  if (buffers[2].length)
    printChar(2, 10);
});
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
staticSealed = true;
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
function nullFunc_iiii(x) {
  Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function nullFunc_viiiii(x) {
  Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function nullFunc_vi(x) {
  Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function nullFunc_ii(x) {
  Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function nullFunc_viiiiii(x) {
  Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function nullFunc_viiii(x) {
  Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");
  Module["printErr"]("Build with ASSERTIONS=2 for more info.");
  abort(x);
}
function invoke_iiii(index, a1, a2, a3) {
  try {
    return Module["dynCall_iiii"](index, a1, a2, a3);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
  try {
    Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
function invoke_vi(index, a1) {
  try {
    Module["dynCall_vi"](index, a1);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
function invoke_ii(index, a1) {
  try {
    return Module["dynCall_ii"](index, a1);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
  try {
    Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  try {
    Module["dynCall_viiii"](index, a1, a2, a3, a4);
  } catch (e) {
    if (typeof e !== "number" && e !== "longjmp")
      throw e;
    Module["setThrew"](1, 0);
  }
}
Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };
Module.asmLibraryArg = { "abort": abort, "assert": assert, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "abortStackOverflow": abortStackOverflow, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_vi": nullFunc_vi, "nullFunc_ii": nullFunc_ii, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_viiii": nullFunc_viiii, "invoke_iiii": invoke_iiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_ii": invoke_ii, "invoke_viiiiii": invoke_viiiiii, "invoke_viiii": invoke_viiii, "floatReadValueFromPointer": floatReadValueFromPointer, "simpleReadValueFromPointer": simpleReadValueFromPointer, "integerReadValueFromPointer": integerReadValueFromPointer, "__embind_register_memory_view": __embind_register_memory_view, "throwInternalError": throwInternalError, "get_first_emval": get_first_emval, "___gxx_personality_v0": ___gxx_personality_v0, "extendError": extendError, "__embind_register_void": __embind_register_void, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "getShiftFromSize": getShiftFromSize, "embind_init_charCodes": embind_init_charCodes, "___setErrNo": ___setErrNo, "__emval_register": __emval_register, "__embind_register_std_wstring": __embind_register_std_wstring, "_emscripten_memcpy_big": _emscripten_memcpy_big, "__embind_register_bool": __embind_register_bool, "___resumeException": ___resumeException, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_embind_repr": _embind_repr, "__embind_register_std_string": __embind_register_std_string, "createNamedFunction": createNamedFunction, "__embind_register_emval": __embind_register_emval, "readLatin1String": readLatin1String, "__embind_register_integer": __embind_register_integer, "__emval_decref": __emval_decref, "__embind_register_float": __embind_register_float, "makeLegalFunctionName": makeLegalFunctionName, "___syscall54": ___syscall54, "___unlock": ___unlock, "init_emval": init_emval, "whenDependentTypesAreResolved": whenDependentTypesAreResolved, "registerType": registerType, "___lock": ___lock, "___syscall6": ___syscall6, "throwBindingError": throwBindingError, "count_emval_handles": count_emval_handles, "___syscall140": ___syscall140, "___syscall146": ___syscall146, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "cttz_i8": cttz_i8 };
var asm = function(global, env, buffer2) {
  "almost asm";
  var HEAP82 = new global.Int8Array(buffer2);
  var HEAP162 = new global.Int16Array(buffer2);
  var HEAP322 = new global.Int32Array(buffer2);
  new global.Uint8Array(buffer2);
  new global.Uint16Array(buffer2);
  new global.Uint32Array(buffer2);
  var HEAPF322 = new global.Float32Array(buffer2);
  var HEAPF642 = new global.Float64Array(buffer2);
  var DYNAMICTOP_PTR2 = env.DYNAMICTOP_PTR | 0;
  var tempDoublePtr2 = env.tempDoublePtr | 0;
  env.ABORT | 0;
  var STACKTOP2 = env.STACKTOP | 0;
  var STACK_MAX2 = env.STACK_MAX | 0;
  var cttz_i82 = env.cttz_i8 | 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempRet02 = 0;
  global.Math.floor;
  var Math_abs2 = global.Math.abs;
  global.Math.sqrt;
  global.Math.pow;
  global.Math.cos;
  global.Math.sin;
  global.Math.tan;
  global.Math.acos;
  global.Math.asin;
  global.Math.atan;
  global.Math.atan2;
  global.Math.exp;
  global.Math.log;
  global.Math.ceil;
  var Math_imul = global.Math.imul;
  global.Math.min;
  global.Math.max;
  var Math_clz32 = global.Math.clz32;
  env.abort;
  env.assert;
  var enlargeMemory2 = env.enlargeMemory;
  var getTotalMemory2 = env.getTotalMemory;
  var abortOnCannotGrowMemory2 = env.abortOnCannotGrowMemory;
  var abortStackOverflow2 = env.abortStackOverflow;
  var nullFunc_iiii2 = env.nullFunc_iiii;
  var nullFunc_viiiii2 = env.nullFunc_viiiii;
  var nullFunc_vi2 = env.nullFunc_vi;
  var nullFunc_ii2 = env.nullFunc_ii;
  var nullFunc_viiiiii2 = env.nullFunc_viiiiii;
  var nullFunc_viiii2 = env.nullFunc_viiii;
  env.invoke_iiii;
  env.invoke_viiiii;
  env.invoke_vi;
  env.invoke_ii;
  env.invoke_viiiiii;
  env.invoke_viiii;
  env.floatReadValueFromPointer;
  env.simpleReadValueFromPointer;
  env.integerReadValueFromPointer;
  var __embind_register_memory_view2 = env.__embind_register_memory_view;
  env.throwInternalError;
  env.get_first_emval;
  env.___gxx_personality_v0;
  env.extendError;
  var __embind_register_void2 = env.__embind_register_void;
  env.__ZSt18uncaught_exceptionv;
  env.getShiftFromSize;
  env.embind_init_charCodes;
  var ___setErrNo2 = env.___setErrNo;
  env.__emval_register;
  var __embind_register_std_wstring2 = env.__embind_register_std_wstring;
  var _emscripten_memcpy_big2 = env._emscripten_memcpy_big;
  var __embind_register_bool2 = env.__embind_register_bool;
  env.___resumeException;
  env.___cxa_find_matching_catch;
  env._embind_repr;
  var __embind_register_std_string2 = env.__embind_register_std_string;
  env.createNamedFunction;
  var __embind_register_emval2 = env.__embind_register_emval;
  env.readLatin1String;
  var __embind_register_integer2 = env.__embind_register_integer;
  env.__emval_decref;
  var __embind_register_float2 = env.__embind_register_float;
  env.makeLegalFunctionName;
  var ___syscall542 = env.___syscall54;
  var ___unlock2 = env.___unlock;
  env.init_emval;
  env.whenDependentTypesAreResolved;
  env.registerType;
  var ___lock2 = env.___lock;
  var ___syscall62 = env.___syscall6;
  env.throwBindingError;
  env.count_emval_handles;
  var ___syscall1402 = env.___syscall140;
  var ___syscall1462 = env.___syscall146;
  function stackAlloc(size) {
    size = size | 0;
    var ret = 0;
    ret = STACKTOP2;
    STACKTOP2 = STACKTOP2 + size | 0;
    STACKTOP2 = STACKTOP2 + 15 & -16;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(size | 0);
    return ret | 0;
  }
  function stackSave() {
    return STACKTOP2 | 0;
  }
  function stackRestore(top) {
    top = top | 0;
    STACKTOP2 = top;
  }
  function establishStackSpace(stackBase, stackMax) {
    stackBase = stackBase | 0;
    stackMax = stackMax | 0;
    STACKTOP2 = stackBase;
    STACK_MAX2 = stackMax;
  }
  function setThrew(threw, value) {
  }
  function setTempRet0(value) {
    value = value | 0;
    tempRet02 = value;
  }
  function getTempRet0() {
    return tempRet02 | 0;
  }
  function _crc64_init() {
    var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $0 = sp;
    $1 = $0;
    $2 = $1;
    HEAP322[$2 >> 2] = 1;
    $3 = $1 + 4 | 0;
    $4 = $3;
    HEAP322[$4 >> 2] = 0;
    $5 = HEAP82[$0 >> 0] | 0;
    $6 = $5 << 24 >> 24 != 0;
    if ($6) {
      __ZL17crc64_little_initv();
      STACKTOP2 = sp;
      return;
    } else {
      __ZL14crc64_big_initv();
      STACKTOP2 = sp;
      return;
    }
  }
  function __ZL17crc64_little_initv() {
    __ZL11crc64_init_PA256_y(5616);
    return;
  }
  function __ZL14crc64_big_initv() {
    var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
    var $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    __ZL11crc64_init_PA256_y(22e3);
    $0 = 0;
    while (1) {
      $2 = $0;
      $3 = $2 >>> 0 < 8;
      if (!$3) {
        break;
      }
      $1 = 0;
      while (1) {
        $4 = $1;
        $5 = $4 >>> 0 < 256;
        $6 = $0;
        if (!$5) {
          break;
        }
        $7 = 22e3 + ($6 << 11) | 0;
        $8 = $1;
        $9 = $7 + ($8 << 3) | 0;
        $10 = $9;
        $11 = $10;
        $12 = HEAP322[$11 >> 2] | 0;
        $13 = $10 + 4 | 0;
        $14 = $13;
        $15 = HEAP322[$14 >> 2] | 0;
        $16 = __ZL4rev8y($12, $15) | 0;
        $17 = tempRet02;
        $18 = $0;
        $19 = 22e3 + ($18 << 11) | 0;
        $20 = $1;
        $21 = $19 + ($20 << 3) | 0;
        $22 = $21;
        $23 = $22;
        HEAP322[$23 >> 2] = $16;
        $24 = $22 + 4 | 0;
        $25 = $24;
        HEAP322[$25 >> 2] = $17;
        $26 = $1;
        $27 = $26 + 1 | 0;
        $1 = $27;
      }
      $28 = $6 + 1 | 0;
      $0 = $28;
    }
    STACKTOP2 = sp;
    return;
  }
  function _crc64($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
    var $3 = 0, $30 = 0, $31 = 0, $32 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $6 = sp;
    $3 = $0;
    $4 = $1;
    $5 = $2;
    $7 = $6;
    $8 = $7;
    HEAP322[$8 >> 2] = 1;
    $9 = $7 + 4 | 0;
    $10 = $9;
    HEAP322[$10 >> 2] = 0;
    $11 = HEAP82[$6 >> 0] | 0;
    $12 = $11 << 24 >> 24 != 0;
    $13 = $3;
    $14 = $13;
    $15 = $14;
    $16 = HEAP322[$15 >> 2] | 0;
    $17 = $14 + 4 | 0;
    $18 = $17;
    $19 = HEAP322[$18 >> 2] | 0;
    $20 = $4;
    $21 = $5;
    if ($12) {
      $22 = __ZL12crc64_littleyPvj($16, $19, $20, $21) | 0;
      $23 = tempRet02;
      $29 = $22;
      $32 = $23;
    } else {
      $24 = __ZL9crc64_bigyPvj($16, $19, $20, $21) | 0;
      $25 = tempRet02;
      $29 = $24;
      $32 = $25;
    }
    $26 = $3;
    $27 = $26;
    $28 = $27;
    HEAP322[$28 >> 2] = $29;
    $30 = $27 + 4 | 0;
    $31 = $30;
    HEAP322[$31 >> 2] = $32;
    STACKTOP2 = sp;
    return;
  }
  function __ZL12crc64_littleyPvj($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
    var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
    var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
    var $154 = 0, $155 = 0, $156 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
    var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
    var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
    var $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0;
    var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0;
    var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
    var $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $37 = 0, $38 = 0;
    var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0;
    var $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0;
    var $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
    var $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $4 = sp;
    $8 = $4;
    $9 = $8;
    HEAP322[$9 >> 2] = $0;
    $10 = $8 + 4 | 0;
    $11 = $10;
    HEAP322[$11 >> 2] = $1;
    $5 = $2;
    $6 = $3;
    $12 = $5;
    $7 = $12;
    $13 = $4;
    $14 = $13;
    $15 = HEAP322[$14 >> 2] | 0;
    $16 = $13 + 4 | 0;
    $17 = $16;
    $18 = HEAP322[$17 >> 2] | 0;
    $19 = $15 ^ -1;
    $20 = $18 ^ -1;
    $21 = $4;
    $22 = $21;
    HEAP322[$22 >> 2] = $19;
    $23 = $21 + 4 | 0;
    $24 = $23;
    HEAP322[$24 >> 2] = $20;
    while (1) {
      $25 = $6;
      $26 = ($25 | 0) != 0;
      if (!$26) {
        break;
      }
      $27 = $7;
      $28 = $27;
      $29 = $28 & 7;
      $30 = ($29 | 0) != 0;
      if (!$30) {
        break;
      }
      $31 = $4;
      $32 = $31;
      $33 = HEAP322[$32 >> 2] | 0;
      $34 = $31 + 4 | 0;
      $35 = $34;
      HEAP322[$35 >> 2] | 0;
      $37 = $7;
      $38 = $37 + 1 | 0;
      $7 = $38;
      $39 = HEAP82[$37 >> 0] | 0;
      $40 = $39 & 255;
      $41 = $33 ^ $40;
      $42 = $41 & 255;
      $43 = 5616 + ($42 << 3) | 0;
      $44 = $43;
      $45 = $44;
      $46 = HEAP322[$45 >> 2] | 0;
      $47 = $44 + 4 | 0;
      $48 = $47;
      $49 = HEAP322[$48 >> 2] | 0;
      $50 = $4;
      $51 = $50;
      $52 = HEAP322[$51 >> 2] | 0;
      $53 = $50 + 4 | 0;
      $54 = $53;
      $55 = HEAP322[$54 >> 2] | 0;
      $56 = _bitshift64Lshr($52 | 0, $55 | 0, 8) | 0;
      $57 = tempRet02;
      $58 = $46 ^ $56;
      $59 = $49 ^ $57;
      $60 = $4;
      $61 = $60;
      HEAP322[$61 >> 2] = $58;
      $62 = $60 + 4 | 0;
      $63 = $62;
      HEAP322[$63 >> 2] = $59;
      $64 = $6;
      $65 = $64 + -1 | 0;
      $6 = $65;
    }
    while (1) {
      $66 = $6;
      $67 = $66 >>> 0 >= 8;
      if (!$67) {
        break;
      }
      $68 = $7;
      $69 = $68;
      $70 = $69;
      $71 = HEAP322[$70 >> 2] | 0;
      $72 = $69 + 4 | 0;
      $73 = $72;
      $74 = HEAP322[$73 >> 2] | 0;
      $75 = $4;
      $76 = $75;
      $77 = HEAP322[$76 >> 2] | 0;
      $78 = $75 + 4 | 0;
      $79 = $78;
      $80 = HEAP322[$79 >> 2] | 0;
      $81 = $77 ^ $71;
      $82 = $80 ^ $74;
      $83 = $4;
      $84 = $83;
      HEAP322[$84 >> 2] = $81;
      $85 = $83 + 4 | 0;
      $86 = $85;
      HEAP322[$86 >> 2] = $82;
      $87 = $4;
      $88 = $87;
      $89 = HEAP322[$88 >> 2] | 0;
      $90 = $87 + 4 | 0;
      $91 = $90;
      HEAP322[$91 >> 2] | 0;
      $93 = $89 & 255;
      $94 = 19952 + ($93 << 3) | 0;
      $95 = $94;
      $96 = $95;
      $97 = HEAP322[$96 >> 2] | 0;
      $98 = $95 + 4 | 0;
      $99 = $98;
      $100 = HEAP322[$99 >> 2] | 0;
      $101 = $4;
      $102 = $101;
      $103 = HEAP322[$102 >> 2] | 0;
      $104 = $101 + 4 | 0;
      $105 = $104;
      $106 = HEAP322[$105 >> 2] | 0;
      $107 = _bitshift64Lshr($103 | 0, $106 | 0, 8) | 0;
      $109 = $107 & 255;
      $110 = 17904 + ($109 << 3) | 0;
      $111 = $110;
      $112 = $111;
      $113 = HEAP322[$112 >> 2] | 0;
      $114 = $111 + 4 | 0;
      $115 = $114;
      $116 = HEAP322[$115 >> 2] | 0;
      $117 = $97 ^ $113;
      $118 = $100 ^ $116;
      $119 = $4;
      $120 = $119;
      $121 = HEAP322[$120 >> 2] | 0;
      $122 = $119 + 4 | 0;
      $123 = $122;
      $124 = HEAP322[$123 >> 2] | 0;
      $125 = _bitshift64Lshr($121 | 0, $124 | 0, 16) | 0;
      $127 = $125 & 255;
      $128 = 15856 + ($127 << 3) | 0;
      $129 = $128;
      $130 = $129;
      $131 = HEAP322[$130 >> 2] | 0;
      $132 = $129 + 4 | 0;
      $133 = $132;
      $134 = HEAP322[$133 >> 2] | 0;
      $135 = $117 ^ $131;
      $136 = $118 ^ $134;
      $137 = $4;
      $138 = $137;
      $139 = HEAP322[$138 >> 2] | 0;
      $140 = $137 + 4 | 0;
      $141 = $140;
      $142 = HEAP322[$141 >> 2] | 0;
      $143 = _bitshift64Lshr($139 | 0, $142 | 0, 24) | 0;
      $145 = $143 & 255;
      $146 = 13808 + ($145 << 3) | 0;
      $147 = $146;
      $148 = $147;
      $149 = HEAP322[$148 >> 2] | 0;
      $150 = $147 + 4 | 0;
      $151 = $150;
      $152 = HEAP322[$151 >> 2] | 0;
      $153 = $135 ^ $149;
      $154 = $136 ^ $152;
      $155 = $4;
      $156 = $155;
      HEAP322[$156 >> 2] | 0;
      $158 = $155 + 4 | 0;
      $159 = $158;
      $160 = HEAP322[$159 >> 2] | 0;
      $161 = $160 & 255;
      $162 = 11760 + ($161 << 3) | 0;
      $163 = $162;
      $164 = $163;
      $165 = HEAP322[$164 >> 2] | 0;
      $166 = $163 + 4 | 0;
      $167 = $166;
      $168 = HEAP322[$167 >> 2] | 0;
      $169 = $153 ^ $165;
      $170 = $154 ^ $168;
      $171 = $4;
      $172 = $171;
      $173 = HEAP322[$172 >> 2] | 0;
      $174 = $171 + 4 | 0;
      $175 = $174;
      $176 = HEAP322[$175 >> 2] | 0;
      $177 = _bitshift64Lshr($173 | 0, $176 | 0, 40) | 0;
      $179 = $177 & 255;
      $180 = 9712 + ($179 << 3) | 0;
      $181 = $180;
      $182 = $181;
      $183 = HEAP322[$182 >> 2] | 0;
      $184 = $181 + 4 | 0;
      $185 = $184;
      $186 = HEAP322[$185 >> 2] | 0;
      $187 = $169 ^ $183;
      $188 = $170 ^ $186;
      $189 = $4;
      $190 = $189;
      $191 = HEAP322[$190 >> 2] | 0;
      $192 = $189 + 4 | 0;
      $193 = $192;
      $194 = HEAP322[$193 >> 2] | 0;
      $195 = _bitshift64Lshr($191 | 0, $194 | 0, 48) | 0;
      $197 = $195 & 255;
      $198 = 7664 + ($197 << 3) | 0;
      $199 = $198;
      $200 = $199;
      $201 = HEAP322[$200 >> 2] | 0;
      $202 = $199 + 4 | 0;
      $203 = $202;
      $204 = HEAP322[$203 >> 2] | 0;
      $205 = $187 ^ $201;
      $206 = $188 ^ $204;
      $207 = $4;
      $208 = $207;
      $209 = HEAP322[$208 >> 2] | 0;
      $210 = $207 + 4 | 0;
      $211 = $210;
      $212 = HEAP322[$211 >> 2] | 0;
      $213 = _bitshift64Lshr($209 | 0, $212 | 0, 56) | 0;
      $215 = 5616 + ($213 << 3) | 0;
      $216 = $215;
      $217 = $216;
      $218 = HEAP322[$217 >> 2] | 0;
      $219 = $216 + 4 | 0;
      $220 = $219;
      $221 = HEAP322[$220 >> 2] | 0;
      $222 = $205 ^ $218;
      $223 = $206 ^ $221;
      $224 = $4;
      $225 = $224;
      HEAP322[$225 >> 2] = $222;
      $226 = $224 + 4 | 0;
      $227 = $226;
      HEAP322[$227 >> 2] = $223;
      $228 = $7;
      $229 = $228 + 8 | 0;
      $7 = $229;
      $230 = $6;
      $231 = $230 - 8 | 0;
      $6 = $231;
    }
    while (1) {
      $232 = $6;
      $233 = ($232 | 0) != 0;
      $234 = $4;
      $235 = $234;
      $236 = HEAP322[$235 >> 2] | 0;
      $237 = $234 + 4 | 0;
      $238 = $237;
      $239 = HEAP322[$238 >> 2] | 0;
      if (!$233) {
        break;
      }
      $240 = $7;
      $241 = $240 + 1 | 0;
      $7 = $241;
      $242 = HEAP82[$240 >> 0] | 0;
      $243 = $242 & 255;
      $244 = $236 ^ $243;
      $245 = $244 & 255;
      $246 = 5616 + ($245 << 3) | 0;
      $247 = $246;
      $248 = $247;
      $249 = HEAP322[$248 >> 2] | 0;
      $250 = $247 + 4 | 0;
      $251 = $250;
      $252 = HEAP322[$251 >> 2] | 0;
      $253 = $4;
      $254 = $253;
      $255 = HEAP322[$254 >> 2] | 0;
      $256 = $253 + 4 | 0;
      $257 = $256;
      $258 = HEAP322[$257 >> 2] | 0;
      $259 = _bitshift64Lshr($255 | 0, $258 | 0, 8) | 0;
      $260 = tempRet02;
      $261 = $249 ^ $259;
      $262 = $252 ^ $260;
      $263 = $4;
      $264 = $263;
      HEAP322[$264 >> 2] = $261;
      $265 = $263 + 4 | 0;
      $266 = $265;
      HEAP322[$266 >> 2] = $262;
      $267 = $6;
      $268 = $267 + -1 | 0;
      $6 = $268;
    }
    $269 = $236 ^ -1;
    $270 = $239 ^ -1;
    tempRet02 = $270;
    STACKTOP2 = sp;
    return $269 | 0;
  }
  function __ZL9crc64_bigyPvj($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
    var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
    var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
    var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
    var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
    var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
    var $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0;
    var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0;
    var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
    var $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0;
    var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
    var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
    var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
    var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $4 = sp;
    $8 = $4;
    $9 = $8;
    HEAP322[$9 >> 2] = $0;
    $10 = $8 + 4 | 0;
    $11 = $10;
    HEAP322[$11 >> 2] = $1;
    $5 = $2;
    $6 = $3;
    $12 = $5;
    $7 = $12;
    $13 = $4;
    $14 = $13;
    $15 = HEAP322[$14 >> 2] | 0;
    $16 = $13 + 4 | 0;
    $17 = $16;
    $18 = HEAP322[$17 >> 2] | 0;
    $19 = __ZL4rev8y($15, $18) | 0;
    $20 = tempRet02;
    $21 = $19 ^ -1;
    $22 = $20 ^ -1;
    $23 = $4;
    $24 = $23;
    HEAP322[$24 >> 2] = $21;
    $25 = $23 + 4 | 0;
    $26 = $25;
    HEAP322[$26 >> 2] = $22;
    while (1) {
      $27 = $6;
      $28 = ($27 | 0) != 0;
      if (!$28) {
        break;
      }
      $29 = $7;
      $30 = $29;
      $31 = $30 & 7;
      $32 = ($31 | 0) != 0;
      if (!$32) {
        break;
      }
      $33 = $4;
      $34 = $33;
      $35 = HEAP322[$34 >> 2] | 0;
      $36 = $33 + 4 | 0;
      $37 = $36;
      $38 = HEAP322[$37 >> 2] | 0;
      $39 = _bitshift64Lshr($35 | 0, $38 | 0, 56) | 0;
      $41 = $7;
      $42 = $41 + 1 | 0;
      $7 = $42;
      $43 = HEAP82[$41 >> 0] | 0;
      $44 = $43 & 255;
      $45 = $39 ^ $44;
      $46 = 22e3 + ($45 << 3) | 0;
      $47 = $46;
      $48 = $47;
      $49 = HEAP322[$48 >> 2] | 0;
      $50 = $47 + 4 | 0;
      $51 = $50;
      $52 = HEAP322[$51 >> 2] | 0;
      $53 = $4;
      $54 = $53;
      $55 = HEAP322[$54 >> 2] | 0;
      $56 = $53 + 4 | 0;
      $57 = $56;
      $58 = HEAP322[$57 >> 2] | 0;
      $59 = _bitshift64Shl($55 | 0, $58 | 0, 8) | 0;
      $60 = tempRet02;
      $61 = $49 ^ $59;
      $62 = $52 ^ $60;
      $63 = $4;
      $64 = $63;
      HEAP322[$64 >> 2] = $61;
      $65 = $63 + 4 | 0;
      $66 = $65;
      HEAP322[$66 >> 2] = $62;
      $67 = $6;
      $68 = $67 + -1 | 0;
      $6 = $68;
    }
    while (1) {
      $69 = $6;
      $70 = $69 >>> 0 >= 8;
      if (!$70) {
        break;
      }
      $71 = $7;
      $72 = $71;
      $73 = $72;
      $74 = HEAP322[$73 >> 2] | 0;
      $75 = $72 + 4 | 0;
      $76 = $75;
      $77 = HEAP322[$76 >> 2] | 0;
      $78 = $4;
      $79 = $78;
      $80 = HEAP322[$79 >> 2] | 0;
      $81 = $78 + 4 | 0;
      $82 = $81;
      $83 = HEAP322[$82 >> 2] | 0;
      $84 = $80 ^ $74;
      $85 = $83 ^ $77;
      $86 = $4;
      $87 = $86;
      HEAP322[$87 >> 2] = $84;
      $88 = $86 + 4 | 0;
      $89 = $88;
      HEAP322[$89 >> 2] = $85;
      $90 = $4;
      $91 = $90;
      $92 = HEAP322[$91 >> 2] | 0;
      $93 = $90 + 4 | 0;
      $94 = $93;
      HEAP322[$94 >> 2] | 0;
      $96 = $92 & 255;
      $97 = 22e3 + ($96 << 3) | 0;
      $98 = $97;
      $99 = $98;
      $100 = HEAP322[$99 >> 2] | 0;
      $101 = $98 + 4 | 0;
      $102 = $101;
      $103 = HEAP322[$102 >> 2] | 0;
      $104 = $4;
      $105 = $104;
      $106 = HEAP322[$105 >> 2] | 0;
      $107 = $104 + 4 | 0;
      $108 = $107;
      $109 = HEAP322[$108 >> 2] | 0;
      $110 = _bitshift64Lshr($106 | 0, $109 | 0, 8) | 0;
      $112 = $110 & 255;
      $113 = 24048 + ($112 << 3) | 0;
      $114 = $113;
      $115 = $114;
      $116 = HEAP322[$115 >> 2] | 0;
      $117 = $114 + 4 | 0;
      $118 = $117;
      $119 = HEAP322[$118 >> 2] | 0;
      $120 = $100 ^ $116;
      $121 = $103 ^ $119;
      $122 = $4;
      $123 = $122;
      $124 = HEAP322[$123 >> 2] | 0;
      $125 = $122 + 4 | 0;
      $126 = $125;
      $127 = HEAP322[$126 >> 2] | 0;
      $128 = _bitshift64Lshr($124 | 0, $127 | 0, 16) | 0;
      $130 = $128 & 255;
      $131 = 26096 + ($130 << 3) | 0;
      $132 = $131;
      $133 = $132;
      $134 = HEAP322[$133 >> 2] | 0;
      $135 = $132 + 4 | 0;
      $136 = $135;
      $137 = HEAP322[$136 >> 2] | 0;
      $138 = $120 ^ $134;
      $139 = $121 ^ $137;
      $140 = $4;
      $141 = $140;
      $142 = HEAP322[$141 >> 2] | 0;
      $143 = $140 + 4 | 0;
      $144 = $143;
      $145 = HEAP322[$144 >> 2] | 0;
      $146 = _bitshift64Lshr($142 | 0, $145 | 0, 24) | 0;
      $148 = $146 & 255;
      $149 = 28144 + ($148 << 3) | 0;
      $150 = $149;
      $151 = $150;
      $152 = HEAP322[$151 >> 2] | 0;
      $153 = $150 + 4 | 0;
      $154 = $153;
      $155 = HEAP322[$154 >> 2] | 0;
      $156 = $138 ^ $152;
      $157 = $139 ^ $155;
      $158 = $4;
      $159 = $158;
      HEAP322[$159 >> 2] | 0;
      $161 = $158 + 4 | 0;
      $162 = $161;
      $163 = HEAP322[$162 >> 2] | 0;
      $164 = $163 & 255;
      $165 = 30192 + ($164 << 3) | 0;
      $166 = $165;
      $167 = $166;
      $168 = HEAP322[$167 >> 2] | 0;
      $169 = $166 + 4 | 0;
      $170 = $169;
      $171 = HEAP322[$170 >> 2] | 0;
      $172 = $156 ^ $168;
      $173 = $157 ^ $171;
      $174 = $4;
      $175 = $174;
      $176 = HEAP322[$175 >> 2] | 0;
      $177 = $174 + 4 | 0;
      $178 = $177;
      $179 = HEAP322[$178 >> 2] | 0;
      $180 = _bitshift64Lshr($176 | 0, $179 | 0, 40) | 0;
      $182 = $180 & 255;
      $183 = 32240 + ($182 << 3) | 0;
      $184 = $183;
      $185 = $184;
      $186 = HEAP322[$185 >> 2] | 0;
      $187 = $184 + 4 | 0;
      $188 = $187;
      $189 = HEAP322[$188 >> 2] | 0;
      $190 = $172 ^ $186;
      $191 = $173 ^ $189;
      $192 = $4;
      $193 = $192;
      $194 = HEAP322[$193 >> 2] | 0;
      $195 = $192 + 4 | 0;
      $196 = $195;
      $197 = HEAP322[$196 >> 2] | 0;
      $198 = _bitshift64Lshr($194 | 0, $197 | 0, 48) | 0;
      $200 = $198 & 255;
      $201 = 34288 + ($200 << 3) | 0;
      $202 = $201;
      $203 = $202;
      $204 = HEAP322[$203 >> 2] | 0;
      $205 = $202 + 4 | 0;
      $206 = $205;
      $207 = HEAP322[$206 >> 2] | 0;
      $208 = $190 ^ $204;
      $209 = $191 ^ $207;
      $210 = $4;
      $211 = $210;
      $212 = HEAP322[$211 >> 2] | 0;
      $213 = $210 + 4 | 0;
      $214 = $213;
      $215 = HEAP322[$214 >> 2] | 0;
      $216 = _bitshift64Lshr($212 | 0, $215 | 0, 56) | 0;
      $218 = 36336 + ($216 << 3) | 0;
      $219 = $218;
      $220 = $219;
      $221 = HEAP322[$220 >> 2] | 0;
      $222 = $219 + 4 | 0;
      $223 = $222;
      $224 = HEAP322[$223 >> 2] | 0;
      $225 = $208 ^ $221;
      $226 = $209 ^ $224;
      $227 = $4;
      $228 = $227;
      HEAP322[$228 >> 2] = $225;
      $229 = $227 + 4 | 0;
      $230 = $229;
      HEAP322[$230 >> 2] = $226;
      $231 = $7;
      $232 = $231 + 8 | 0;
      $7 = $232;
      $233 = $6;
      $234 = $233 - 8 | 0;
      $6 = $234;
    }
    while (1) {
      $235 = $6;
      $236 = ($235 | 0) != 0;
      $237 = $4;
      $238 = $237;
      $239 = HEAP322[$238 >> 2] | 0;
      $240 = $237 + 4 | 0;
      $241 = $240;
      $242 = HEAP322[$241 >> 2] | 0;
      if (!$236) {
        break;
      }
      $243 = _bitshift64Lshr($239 | 0, $242 | 0, 56) | 0;
      $245 = $7;
      $246 = $245 + 1 | 0;
      $7 = $246;
      $247 = HEAP82[$245 >> 0] | 0;
      $248 = $247 & 255;
      $249 = $243 ^ $248;
      $250 = 22e3 + ($249 << 3) | 0;
      $251 = $250;
      $252 = $251;
      $253 = HEAP322[$252 >> 2] | 0;
      $254 = $251 + 4 | 0;
      $255 = $254;
      $256 = HEAP322[$255 >> 2] | 0;
      $257 = $4;
      $258 = $257;
      $259 = HEAP322[$258 >> 2] | 0;
      $260 = $257 + 4 | 0;
      $261 = $260;
      $262 = HEAP322[$261 >> 2] | 0;
      $263 = _bitshift64Shl($259 | 0, $262 | 0, 8) | 0;
      $264 = tempRet02;
      $265 = $253 ^ $263;
      $266 = $256 ^ $264;
      $267 = $4;
      $268 = $267;
      HEAP322[$268 >> 2] = $265;
      $269 = $267 + 4 | 0;
      $270 = $269;
      HEAP322[$270 >> 2] = $266;
      $271 = $6;
      $272 = $271 + -1 | 0;
      $6 = $272;
    }
    $273 = __ZL4rev8y($239, $242) | 0;
    $274 = tempRet02;
    $275 = $273 ^ -1;
    $276 = $274 ^ -1;
    tempRet02 = $276;
    STACKTOP2 = sp;
    return $275 | 0;
  }
  function _str_to_uint64($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $2 = 0, $3 = 0, $4 = 0, $5 = 0, $vararg_buffer = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $vararg_buffer = sp;
    $2 = $0;
    $3 = $1;
    $4 = $2;
    $5 = $3;
    HEAP322[$vararg_buffer >> 2] = $5;
    _sscanf($4, 1272, $vararg_buffer) | 0;
    STACKTOP2 = sp;
    return;
  }
  function _uint64_to_str($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $vararg_buffer = sp;
    $2 = $0;
    $3 = $1;
    $4 = $2;
    $5 = $3;
    $6 = $5;
    $7 = $6;
    $8 = HEAP322[$7 >> 2] | 0;
    $9 = $6 + 4 | 0;
    $10 = $9;
    $11 = HEAP322[$10 >> 2] | 0;
    $12 = $vararg_buffer;
    $13 = $12;
    HEAP322[$13 >> 2] = $8;
    $14 = $12 + 4 | 0;
    $15 = $14;
    HEAP322[$15 >> 2] = $11;
    _sprintf($4, 1272, $vararg_buffer) | 0;
    STACKTOP2 = sp;
    return;
  }
  function __ZL11crc64_init_PA256_y($0) {
    $0 = $0 | 0;
    var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $12 = 0;
    var $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0;
    var $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0;
    var $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0;
    var $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0;
    var $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $4 = sp;
    $1 = $0;
    $2 = 0;
    while (1) {
      $5 = $2;
      $6 = $5 >>> 0 < 256;
      if (!$6) {
        break;
      }
      $7 = $2;
      $8 = $4;
      $9 = $8;
      HEAP322[$9 >> 2] = $7;
      $10 = $8 + 4 | 0;
      $11 = $10;
      HEAP322[$11 >> 2] = 0;
      $3 = 0;
      while (1) {
        $12 = $3;
        $13 = $12 >>> 0 < 8;
        $14 = $4;
        $15 = $14;
        $16 = HEAP322[$15 >> 2] | 0;
        $17 = $14 + 4 | 0;
        $18 = $17;
        $19 = HEAP322[$18 >> 2] | 0;
        if (!$13) {
          break;
        }
        $20 = $16 & 1;
        $21 = ($20 | 0) != 0;
        $22 = false;
        $23 = $21 | $22;
        $24 = $4;
        $25 = $24;
        $26 = HEAP322[$25 >> 2] | 0;
        $27 = $24 + 4 | 0;
        $28 = $27;
        $29 = HEAP322[$28 >> 2] | 0;
        $30 = _bitshift64Lshr($26 | 0, $29 | 0, 1) | 0;
        $31 = tempRet02;
        $32 = -679014590 ^ $30;
        $33 = -915646571 ^ $31;
        $34 = $23 ? $32 : $30;
        $35 = $23 ? $33 : $31;
        $36 = $4;
        $37 = $36;
        HEAP322[$37 >> 2] = $34;
        $38 = $36 + 4 | 0;
        $39 = $38;
        HEAP322[$39 >> 2] = $35;
        $40 = $3;
        $41 = $40 + 1 | 0;
        $3 = $41;
      }
      $42 = $1;
      $43 = $2;
      $44 = $42 + ($43 << 3) | 0;
      $45 = $44;
      $46 = $45;
      HEAP322[$46 >> 2] = $16;
      $47 = $45 + 4 | 0;
      $48 = $47;
      HEAP322[$48 >> 2] = $19;
      $49 = $2;
      $50 = $49 + 1 | 0;
      $2 = $50;
    }
    $2 = 0;
    while (1) {
      $51 = $2;
      $52 = $51 >>> 0 < 256;
      if (!$52) {
        break;
      }
      $53 = $1;
      $54 = $2;
      $55 = $53 + ($54 << 3) | 0;
      $56 = $55;
      $57 = $56;
      $58 = HEAP322[$57 >> 2] | 0;
      $59 = $56 + 4 | 0;
      $60 = $59;
      $61 = HEAP322[$60 >> 2] | 0;
      $62 = $4;
      $63 = $62;
      HEAP322[$63 >> 2] = $58;
      $64 = $62 + 4 | 0;
      $65 = $64;
      HEAP322[$65 >> 2] = $61;
      $3 = 1;
      while (1) {
        $66 = $3;
        $67 = $66 >>> 0 < 8;
        if (!$67) {
          break;
        }
        $68 = $1;
        $69 = $4;
        $70 = $69;
        $71 = HEAP322[$70 >> 2] | 0;
        $72 = $69 + 4 | 0;
        $73 = $72;
        HEAP322[$73 >> 2] | 0;
        $75 = $71 & 255;
        $76 = $68 + ($75 << 3) | 0;
        $77 = $76;
        $78 = $77;
        $79 = HEAP322[$78 >> 2] | 0;
        $80 = $77 + 4 | 0;
        $81 = $80;
        $82 = HEAP322[$81 >> 2] | 0;
        $83 = $4;
        $84 = $83;
        $85 = HEAP322[$84 >> 2] | 0;
        $86 = $83 + 4 | 0;
        $87 = $86;
        $88 = HEAP322[$87 >> 2] | 0;
        $89 = _bitshift64Lshr($85 | 0, $88 | 0, 8) | 0;
        $90 = tempRet02;
        $91 = $79 ^ $89;
        $92 = $82 ^ $90;
        $93 = $4;
        $94 = $93;
        HEAP322[$94 >> 2] = $91;
        $95 = $93 + 4 | 0;
        $96 = $95;
        HEAP322[$96 >> 2] = $92;
        $97 = $4;
        $98 = $97;
        $99 = HEAP322[$98 >> 2] | 0;
        $100 = $97 + 4 | 0;
        $101 = $100;
        $102 = HEAP322[$101 >> 2] | 0;
        $103 = $1;
        $104 = $3;
        $105 = $103 + ($104 << 11) | 0;
        $106 = $2;
        $107 = $105 + ($106 << 3) | 0;
        $108 = $107;
        $109 = $108;
        HEAP322[$109 >> 2] = $99;
        $110 = $108 + 4 | 0;
        $111 = $110;
        HEAP322[$111 >> 2] = $102;
        $112 = $3;
        $113 = $112 + 1 | 0;
        $3 = $113;
      }
      $114 = $2;
      $115 = $114 + 1 | 0;
      $2 = $115;
    }
    STACKTOP2 = sp;
    return;
  }
  function __ZL4rev8y($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
    var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
    var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
    var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
    var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $95 = 0, $96 = 0, $97 = 0;
    var $98 = 0, $99 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = sp + 8 | 0;
    $3 = sp;
    $4 = $2;
    $5 = $4;
    HEAP322[$5 >> 2] = $0;
    $6 = $4 + 4 | 0;
    $7 = $6;
    HEAP322[$7 >> 2] = $1;
    $8 = $3;
    $9 = $8;
    HEAP322[$9 >> 2] = 16711935;
    $10 = $8 + 4 | 0;
    $11 = $10;
    HEAP322[$11 >> 2] = 16711935;
    $12 = $2;
    $13 = $12;
    $14 = HEAP322[$13 >> 2] | 0;
    $15 = $12 + 4 | 0;
    $16 = $15;
    $17 = HEAP322[$16 >> 2] | 0;
    $18 = _bitshift64Lshr($14 | 0, $17 | 0, 8) | 0;
    $19 = tempRet02;
    $20 = $3;
    $21 = $20;
    $22 = HEAP322[$21 >> 2] | 0;
    $23 = $20 + 4 | 0;
    $24 = $23;
    $25 = HEAP322[$24 >> 2] | 0;
    $26 = $18 & $22;
    $27 = $19 & $25;
    $28 = $2;
    $29 = $28;
    $30 = HEAP322[$29 >> 2] | 0;
    $31 = $28 + 4 | 0;
    $32 = $31;
    $33 = HEAP322[$32 >> 2] | 0;
    $34 = $3;
    $35 = $34;
    $36 = HEAP322[$35 >> 2] | 0;
    $37 = $34 + 4 | 0;
    $38 = $37;
    $39 = HEAP322[$38 >> 2] | 0;
    $40 = $30 & $36;
    $41 = $33 & $39;
    $42 = _bitshift64Shl($40 | 0, $41 | 0, 8) | 0;
    $43 = tempRet02;
    $44 = $26 | $42;
    $45 = $27 | $43;
    $46 = $2;
    $47 = $46;
    HEAP322[$47 >> 2] = $44;
    $48 = $46 + 4 | 0;
    $49 = $48;
    HEAP322[$49 >> 2] = $45;
    $50 = $3;
    $51 = $50;
    HEAP322[$51 >> 2] = 65535;
    $52 = $50 + 4 | 0;
    $53 = $52;
    HEAP322[$53 >> 2] = 65535;
    $54 = $2;
    $55 = $54;
    $56 = HEAP322[$55 >> 2] | 0;
    $57 = $54 + 4 | 0;
    $58 = $57;
    $59 = HEAP322[$58 >> 2] | 0;
    $60 = _bitshift64Lshr($56 | 0, $59 | 0, 16) | 0;
    $61 = tempRet02;
    $62 = $3;
    $63 = $62;
    $64 = HEAP322[$63 >> 2] | 0;
    $65 = $62 + 4 | 0;
    $66 = $65;
    $67 = HEAP322[$66 >> 2] | 0;
    $68 = $60 & $64;
    $69 = $61 & $67;
    $70 = $2;
    $71 = $70;
    $72 = HEAP322[$71 >> 2] | 0;
    $73 = $70 + 4 | 0;
    $74 = $73;
    $75 = HEAP322[$74 >> 2] | 0;
    $76 = $3;
    $77 = $76;
    $78 = HEAP322[$77 >> 2] | 0;
    $79 = $76 + 4 | 0;
    $80 = $79;
    $81 = HEAP322[$80 >> 2] | 0;
    $82 = $72 & $78;
    $83 = $75 & $81;
    $84 = _bitshift64Shl($82 | 0, $83 | 0, 16) | 0;
    $85 = tempRet02;
    $86 = $68 | $84;
    $87 = $69 | $85;
    $88 = $2;
    $89 = $88;
    HEAP322[$89 >> 2] = $86;
    $90 = $88 + 4 | 0;
    $91 = $90;
    HEAP322[$91 >> 2] = $87;
    $92 = $2;
    $93 = $92;
    HEAP322[$93 >> 2] | 0;
    $95 = $92 + 4 | 0;
    $96 = $95;
    $97 = HEAP322[$96 >> 2] | 0;
    $98 = $2;
    $99 = $98;
    $100 = HEAP322[$99 >> 2] | 0;
    $101 = $98 + 4 | 0;
    $102 = $101;
    HEAP322[$102 >> 2] | 0;
    tempRet02 = $100;
    STACKTOP2 = sp;
    return $97 | 0;
  }
  function __GLOBAL__sub_I_bind_cpp2() {
    ___cxx_global_var_init();
    return;
  }
  function ___cxx_global_var_init() {
    __ZN53EmscriptenBindingInitializer_native_and_builtin_typesC2Ev();
    return;
  }
  function __ZN53EmscriptenBindingInitializer_native_and_builtin_typesC2Ev($0) {
    var $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = __ZN10emscripten8internal6TypeIDIvE3getEv() | 0;
    __embind_register_void2($2 | 0, 1277 | 0);
    $3 = __ZN10emscripten8internal6TypeIDIbE3getEv() | 0;
    __embind_register_bool2($3 | 0, 1282 | 0, 1, 1, 0);
    __ZN12_GLOBAL__N_1L16register_integerIcEEvPKc(1287);
    __ZN12_GLOBAL__N_1L16register_integerIaEEvPKc(1292);
    __ZN12_GLOBAL__N_1L16register_integerIhEEvPKc(1304);
    __ZN12_GLOBAL__N_1L16register_integerIsEEvPKc(1318);
    __ZN12_GLOBAL__N_1L16register_integerItEEvPKc(1324);
    __ZN12_GLOBAL__N_1L16register_integerIiEEvPKc(1339);
    __ZN12_GLOBAL__N_1L16register_integerIjEEvPKc(1343);
    __ZN12_GLOBAL__N_1L16register_integerIlEEvPKc(1356);
    __ZN12_GLOBAL__N_1L16register_integerImEEvPKc(1361);
    __ZN12_GLOBAL__N_1L14register_floatIfEEvPKc(1375);
    __ZN12_GLOBAL__N_1L14register_floatIdEEvPKc(1381);
    $4 = __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE3getEv() | 0;
    __embind_register_std_string2($4 | 0, 1388 | 0);
    $5 = __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIhNS2_11char_traitsIhEENS2_9allocatorIhEEEEE3getEv() | 0;
    __embind_register_std_string2($5 | 0, 1400 | 0);
    $6 = __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIwNS2_11char_traitsIwEENS2_9allocatorIwEEEEE3getEv() | 0;
    __embind_register_std_wstring2($6 | 0, 4, 1433 | 0);
    $7 = __ZN10emscripten8internal6TypeIDINS_3valEE3getEv() | 0;
    __embind_register_emval2($7 | 0, 1446 | 0);
    __ZN12_GLOBAL__N_1L20register_memory_viewIcEEvPKc(1462);
    __ZN12_GLOBAL__N_1L20register_memory_viewIaEEvPKc(1492);
    __ZN12_GLOBAL__N_1L20register_memory_viewIhEEvPKc(1529);
    __ZN12_GLOBAL__N_1L20register_memory_viewIsEEvPKc(1568);
    __ZN12_GLOBAL__N_1L20register_memory_viewItEEvPKc(1599);
    __ZN12_GLOBAL__N_1L20register_memory_viewIiEEvPKc(1639);
    __ZN12_GLOBAL__N_1L20register_memory_viewIjEEvPKc(1668);
    __ZN12_GLOBAL__N_1L20register_memory_viewIlEEvPKc(1706);
    __ZN12_GLOBAL__N_1L20register_memory_viewImEEvPKc(1736);
    __ZN12_GLOBAL__N_1L20register_memory_viewIaEEvPKc(1775);
    __ZN12_GLOBAL__N_1L20register_memory_viewIhEEvPKc(1807);
    __ZN12_GLOBAL__N_1L20register_memory_viewIsEEvPKc(1840);
    __ZN12_GLOBAL__N_1L20register_memory_viewItEEvPKc(1873);
    __ZN12_GLOBAL__N_1L20register_memory_viewIiEEvPKc(1907);
    __ZN12_GLOBAL__N_1L20register_memory_viewIjEEvPKc(1940);
    __ZN12_GLOBAL__N_1L20register_memory_viewIfEEvPKc(1974);
    __ZN12_GLOBAL__N_1L20register_memory_viewIdEEvPKc(2005);
    __ZN12_GLOBAL__N_1L20register_memory_viewIeEEvPKc(2037);
    STACKTOP2 = sp;
    return;
  }
  function __ZN10emscripten8internal6TypeIDIvE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIvE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIbE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIbE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIcEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIcE3getEv() | 0;
    $3 = $1;
    $4 = -128 << 24 >> 24;
    $5 = 127 << 24 >> 24;
    __embind_register_integer2($2 | 0, $3 | 0, 1, $4 | 0, $5 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIaEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIaE3getEv() | 0;
    $3 = $1;
    $4 = -128 << 24 >> 24;
    $5 = 127 << 24 >> 24;
    __embind_register_integer2($2 | 0, $3 | 0, 1, $4 | 0, $5 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIhEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIhE3getEv() | 0;
    $3 = $1;
    $4 = 0;
    $5 = 255;
    __embind_register_integer2($2 | 0, $3 | 0, 1, $4 | 0, $5 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIsEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIsE3getEv() | 0;
    $3 = $1;
    $4 = -32768 << 16 >> 16;
    $5 = 32767 << 16 >> 16;
    __embind_register_integer2($2 | 0, $3 | 0, 2, $4 | 0, $5 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerItEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDItE3getEv() | 0;
    $3 = $1;
    $4 = 0;
    $5 = 65535;
    __embind_register_integer2($2 | 0, $3 | 0, 2, $4 | 0, $5 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIiEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIiE3getEv() | 0;
    $3 = $1;
    __embind_register_integer2($2 | 0, $3 | 0, 4, -2147483648, 2147483647);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIjEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIjE3getEv() | 0;
    $3 = $1;
    __embind_register_integer2($2 | 0, $3 | 0, 4, 0, -1);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerIlEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIlE3getEv() | 0;
    $3 = $1;
    __embind_register_integer2($2 | 0, $3 | 0, 4, -2147483648, 2147483647);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L16register_integerImEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDImE3getEv() | 0;
    $3 = $1;
    __embind_register_integer2($2 | 0, $3 | 0, 4, 0, -1);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L14register_floatIfEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIfE3getEv() | 0;
    $3 = $1;
    __embind_register_float2($2 | 0, $3 | 0, 4);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L14register_floatIdEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDIdE3getEv() | 0;
    $3 = $1;
    __embind_register_float2($2 | 0, $3 | 0, 8);
    STACKTOP2 = sp;
    return;
  }
  function __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIhNS2_11char_traitsIhEENS2_9allocatorIhEEEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIhNS2_11char_traitsIhEENS2_9allocatorIhEEEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINSt3__212basic_stringIwNS2_11char_traitsIwEENS2_9allocatorIwEEEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIwNS2_11char_traitsIwEENS2_9allocatorIwEEEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_3valEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_3valEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIcEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIcEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIcEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIaEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIaEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIaEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIhEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIhEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIhEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIsEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIsEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIsEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewItEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewItEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexItEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIiEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIiEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIiEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIjEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIjEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIjEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIlEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIlEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIlEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewImEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewImEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexImEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIfEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIfEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIfEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIdEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIdEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIdEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN12_GLOBAL__N_1L20register_memory_viewIeEEvPKc($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = $0;
    $2 = __ZN10emscripten8internal6TypeIDINS_11memory_viewIeEEE3getEv() | 0;
    $3 = __ZN12_GLOBAL__N_118getTypedArrayIndexIeEENS_15TypedArrayIndexEv() | 0;
    $4 = $1;
    __embind_register_memory_view2($2 | 0, $3 | 0, $4 | 0);
    STACKTOP2 = sp;
    return;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIeEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIeEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIeEENS_15TypedArrayIndexEv() {
    return 7;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIeEEE3getEv() {
    return 8 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIdEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIdEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIdEENS_15TypedArrayIndexEv() {
    return 7;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIdEEE3getEv() {
    return 16 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIfEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIfEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIfEENS_15TypedArrayIndexEv() {
    return 6;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIfEEE3getEv() {
    return 24 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewImEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewImEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexImEENS_15TypedArrayIndexEv() {
    return 5;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewImEEE3getEv() {
    return 32 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIlEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIlEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIlEENS_15TypedArrayIndexEv() {
    return 4;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIlEEE3getEv() {
    return 40 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIjEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIjEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIjEENS_15TypedArrayIndexEv() {
    return 5;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIjEEE3getEv() {
    return 48 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIiEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIiEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIiEENS_15TypedArrayIndexEv() {
    return 4;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIiEEE3getEv() {
    return 56 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewItEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewItEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexItEENS_15TypedArrayIndexEv() {
    return 3;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewItEEE3getEv() {
    return 64 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIsEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIsEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIsEENS_15TypedArrayIndexEv() {
    return 2;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIsEEE3getEv() {
    return 72 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIhEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIhEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIhEENS_15TypedArrayIndexEv() {
    return 1;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIhEEE3getEv() {
    return 80 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIaEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIaEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIaEENS_15TypedArrayIndexEv() {
    return 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIaEEE3getEv() {
    return 88 | 0;
  }
  function __ZN10emscripten8internal6TypeIDINS_11memory_viewIcEEE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIcEEE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN12_GLOBAL__N_118getTypedArrayIndexIcEENS_15TypedArrayIndexEv() {
    return 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_11memory_viewIcEEE3getEv() {
    return 96 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINS_3valEE3getEv() {
    return 104 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIwNS2_11char_traitsIwEENS2_9allocatorIwEEEEE3getEv() {
    return 112 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIhNS2_11char_traitsIhEENS2_9allocatorIhEEEEE3getEv() {
    return 144 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDINSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEE3getEv() {
    return 168 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIdE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIdE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIdE3getEv() {
    return 360 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIfE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIfE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIfE3getEv() {
    return 352 | 0;
  }
  function __ZN10emscripten8internal6TypeIDImE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDImE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDImE3getEv() {
    return 344 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIlE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIlE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIlE3getEv() {
    return 336 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIjE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIjE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIjE3getEv() {
    return 328 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIiE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIiE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIiE3getEv() {
    return 320 | 0;
  }
  function __ZN10emscripten8internal6TypeIDItE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDItE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDItE3getEv() {
    return 312 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIsE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIsE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIsE3getEv() {
    return 304 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIhE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIhE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIhE3getEv() {
    return 288 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIaE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIaE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIaE3getEv() {
    return 296 | 0;
  }
  function __ZN10emscripten8internal6TypeIDIcE3getEv() {
    var $0 = 0;
    $0 = __ZN10emscripten8internal11LightTypeIDIcE3getEv() | 0;
    return $0 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIcE3getEv() {
    return 280 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIbE3getEv() {
    return 272 | 0;
  }
  function __ZN10emscripten8internal11LightTypeIDIvE3getEv() {
    return 264 | 0;
  }
  function ___getTypeName($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = $0;
    $3 = $2;
    $1 = $3;
    $4 = $1;
    $5 = $4 + 4 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = ___strdup($6) | 0;
    STACKTOP2 = sp;
    return $7 | 0;
  }
  function _malloc2($0) {
    $0 = $0 | 0;
    var $$$0172$i = 0, $$$0173$i = 0, $$$4236$i = 0, $$$4329$i = 0, $$$i = 0, $$0 = 0, $$0$i = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i20$i = 0, $$01$i$i = 0, $$0172$lcssa$i = 0, $$01726$i = 0, $$0173$lcssa$i = 0, $$01735$i = 0, $$0192 = 0, $$0194 = 0, $$0201$i$i = 0, $$0202$i$i = 0, $$0206$i$i = 0;
    var $$0207$i$i = 0, $$024370$i = 0, $$0260$i$i = 0, $$0261$i$i = 0, $$0262$i$i = 0, $$0268$i$i = 0, $$0269$i$i = 0, $$0320$i = 0, $$0322$i = 0, $$0323$i = 0, $$0325$i = 0, $$0331$i = 0, $$0336$i = 0, $$0337$$i = 0, $$0337$i = 0, $$0339$i = 0, $$0340$i = 0, $$0345$i = 0, $$1176$i = 0, $$1178$i = 0;
    var $$124469$i = 0, $$1264$i$i = 0, $$1266$i$i = 0, $$1321$i = 0, $$1326$i = 0, $$1341$i = 0, $$1347$i = 0, $$1351$i = 0, $$2234243136$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2333$i = 0, $$3$i = 0, $$3$i$i = 0, $$3$i200 = 0, $$3328$i = 0, $$3349$i = 0, $$4$lcssa$i = 0, $$4$ph$i = 0, $$411$i = 0;
    var $$4236$i = 0, $$4329$lcssa$i = 0, $$432910$i = 0, $$4335$$4$i = 0, $$4335$ph$i = 0, $$43359$i = 0, $$723947$i = 0, $$748$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i17$i = 0, $$pre$i195 = 0, $$pre$i210 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i18$iZ2D = 0, $$pre$phi$i211Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phiZ2D = 0, $$sink1$i = 0;
    var $$sink1$i$i = 0, $$sink14$i = 0, $$sink2$i = 0, $$sink2$i204 = 0, $$sink3$i = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0;
    var $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0;
    var $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0;
    var $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0;
    var $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0;
    var $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0;
    var $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0;
    var $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0;
    var $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0;
    var $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0;
    var $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0;
    var $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0;
    var $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0;
    var $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0;
    var $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0;
    var $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0;
    var $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0;
    var $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0;
    var $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0;
    var $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0;
    var $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0;
    var $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0;
    var $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0;
    var $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0;
    var $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0;
    var $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0;
    var $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0;
    var $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0;
    var $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0;
    var $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0;
    var $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0;
    var $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0;
    var $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0;
    var $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0;
    var $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0;
    var $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0;
    var $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0;
    var $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0;
    var $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0;
    var $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0;
    var $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0;
    var $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0;
    var $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0;
    var $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0;
    var $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0;
    var $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0;
    var $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0;
    var $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0;
    var $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $98 = 0, $99 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i208 = 0, $exitcond$i$i = 0, $not$$i = 0;
    var $not$$i$i = 0, $not$$i197 = 0, $not$$i209 = 0, $not$1$i = 0, $not$1$i203 = 0, $not$3$i = 0, $not$5$i = 0, $or$cond$i = 0, $or$cond$i201 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond11$i = 0, $or$cond11$not$i = 0, $or$cond12$i = 0, $or$cond2$i = 0, $or$cond2$i199 = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond50$i = 0, $or$cond7$i = 0;
    var label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = sp;
    $2 = $0 >>> 0 < 245;
    do {
      if ($2) {
        $3 = $0 >>> 0 < 11;
        $4 = $0 + 11 | 0;
        $5 = $4 & -8;
        $6 = $3 ? 16 : $5;
        $7 = $6 >>> 3;
        $8 = HEAP322[9596] | 0;
        $9 = $8 >>> $7;
        $10 = $9 & 3;
        $11 = ($10 | 0) == 0;
        if (!$11) {
          $12 = $9 & 1;
          $13 = $12 ^ 1;
          $14 = $13 + $7 | 0;
          $15 = $14 << 1;
          $16 = 38424 + ($15 << 2) | 0;
          $17 = $16 + 8 | 0;
          $18 = HEAP322[$17 >> 2] | 0;
          $19 = $18 + 8 | 0;
          $20 = HEAP322[$19 >> 2] | 0;
          $21 = ($16 | 0) == ($20 | 0);
          if ($21) {
            $22 = 1 << $14;
            $23 = $22 ^ -1;
            $24 = $8 & $23;
            HEAP322[9596] = $24;
          } else {
            $25 = $20 + 12 | 0;
            HEAP322[$25 >> 2] = $16;
            HEAP322[$17 >> 2] = $20;
          }
          $26 = $14 << 3;
          $27 = $26 | 3;
          $28 = $18 + 4 | 0;
          HEAP322[$28 >> 2] = $27;
          $29 = $18 + $26 | 0;
          $30 = $29 + 4 | 0;
          $31 = HEAP322[$30 >> 2] | 0;
          $32 = $31 | 1;
          HEAP322[$30 >> 2] = $32;
          $$0 = $19;
          STACKTOP2 = sp;
          return $$0 | 0;
        }
        $33 = HEAP322[38392 >> 2] | 0;
        $34 = $6 >>> 0 > $33 >>> 0;
        if ($34) {
          $35 = ($9 | 0) == 0;
          if (!$35) {
            $36 = $9 << $7;
            $37 = 2 << $7;
            $38 = 0 - $37 | 0;
            $39 = $37 | $38;
            $40 = $36 & $39;
            $41 = 0 - $40 | 0;
            $42 = $40 & $41;
            $43 = $42 + -1 | 0;
            $44 = $43 >>> 12;
            $45 = $44 & 16;
            $46 = $43 >>> $45;
            $47 = $46 >>> 5;
            $48 = $47 & 8;
            $49 = $48 | $45;
            $50 = $46 >>> $48;
            $51 = $50 >>> 2;
            $52 = $51 & 4;
            $53 = $49 | $52;
            $54 = $50 >>> $52;
            $55 = $54 >>> 1;
            $56 = $55 & 2;
            $57 = $53 | $56;
            $58 = $54 >>> $56;
            $59 = $58 >>> 1;
            $60 = $59 & 1;
            $61 = $57 | $60;
            $62 = $58 >>> $60;
            $63 = $61 + $62 | 0;
            $64 = $63 << 1;
            $65 = 38424 + ($64 << 2) | 0;
            $66 = $65 + 8 | 0;
            $67 = HEAP322[$66 >> 2] | 0;
            $68 = $67 + 8 | 0;
            $69 = HEAP322[$68 >> 2] | 0;
            $70 = ($65 | 0) == ($69 | 0);
            if ($70) {
              $71 = 1 << $63;
              $72 = $71 ^ -1;
              $73 = $8 & $72;
              HEAP322[9596] = $73;
              $90 = $73;
            } else {
              $74 = $69 + 12 | 0;
              HEAP322[$74 >> 2] = $65;
              HEAP322[$66 >> 2] = $69;
              $90 = $8;
            }
            $75 = $63 << 3;
            $76 = $75 - $6 | 0;
            $77 = $6 | 3;
            $78 = $67 + 4 | 0;
            HEAP322[$78 >> 2] = $77;
            $79 = $67 + $6 | 0;
            $80 = $76 | 1;
            $81 = $79 + 4 | 0;
            HEAP322[$81 >> 2] = $80;
            $82 = $79 + $76 | 0;
            HEAP322[$82 >> 2] = $76;
            $83 = ($33 | 0) == 0;
            if (!$83) {
              $84 = HEAP322[38404 >> 2] | 0;
              $85 = $33 >>> 3;
              $86 = $85 << 1;
              $87 = 38424 + ($86 << 2) | 0;
              $88 = 1 << $85;
              $89 = $90 & $88;
              $91 = ($89 | 0) == 0;
              if ($91) {
                $92 = $90 | $88;
                HEAP322[9596] = $92;
                $$pre = $87 + 8 | 0;
                $$0194 = $87;
                $$pre$phiZ2D = $$pre;
              } else {
                $93 = $87 + 8 | 0;
                $94 = HEAP322[$93 >> 2] | 0;
                $$0194 = $94;
                $$pre$phiZ2D = $93;
              }
              HEAP322[$$pre$phiZ2D >> 2] = $84;
              $95 = $$0194 + 12 | 0;
              HEAP322[$95 >> 2] = $84;
              $96 = $84 + 8 | 0;
              HEAP322[$96 >> 2] = $$0194;
              $97 = $84 + 12 | 0;
              HEAP322[$97 >> 2] = $87;
            }
            HEAP322[38392 >> 2] = $76;
            HEAP322[38404 >> 2] = $79;
            $$0 = $68;
            STACKTOP2 = sp;
            return $$0 | 0;
          }
          $98 = HEAP322[38388 >> 2] | 0;
          $99 = ($98 | 0) == 0;
          if ($99) {
            $$0192 = $6;
          } else {
            $100 = 0 - $98 | 0;
            $101 = $98 & $100;
            $102 = $101 + -1 | 0;
            $103 = $102 >>> 12;
            $104 = $103 & 16;
            $105 = $102 >>> $104;
            $106 = $105 >>> 5;
            $107 = $106 & 8;
            $108 = $107 | $104;
            $109 = $105 >>> $107;
            $110 = $109 >>> 2;
            $111 = $110 & 4;
            $112 = $108 | $111;
            $113 = $109 >>> $111;
            $114 = $113 >>> 1;
            $115 = $114 & 2;
            $116 = $112 | $115;
            $117 = $113 >>> $115;
            $118 = $117 >>> 1;
            $119 = $118 & 1;
            $120 = $116 | $119;
            $121 = $117 >>> $119;
            $122 = $120 + $121 | 0;
            $123 = 38688 + ($122 << 2) | 0;
            $124 = HEAP322[$123 >> 2] | 0;
            $125 = $124 + 4 | 0;
            $126 = HEAP322[$125 >> 2] | 0;
            $127 = $126 & -8;
            $128 = $127 - $6 | 0;
            $129 = $124 + 16 | 0;
            $130 = HEAP322[$129 >> 2] | 0;
            $not$3$i = ($130 | 0) == (0 | 0);
            $$sink14$i = $not$3$i & 1;
            $131 = ($124 + 16 | 0) + ($$sink14$i << 2) | 0;
            $132 = HEAP322[$131 >> 2] | 0;
            $133 = ($132 | 0) == (0 | 0);
            if ($133) {
              $$0172$lcssa$i = $124;
              $$0173$lcssa$i = $128;
            } else {
              $$01726$i = $124;
              $$01735$i = $128;
              $135 = $132;
              while (1) {
                $134 = $135 + 4 | 0;
                $136 = HEAP322[$134 >> 2] | 0;
                $137 = $136 & -8;
                $138 = $137 - $6 | 0;
                $139 = $138 >>> 0 < $$01735$i >>> 0;
                $$$0173$i = $139 ? $138 : $$01735$i;
                $$$0172$i = $139 ? $135 : $$01726$i;
                $140 = $135 + 16 | 0;
                $141 = HEAP322[$140 >> 2] | 0;
                $not$$i = ($141 | 0) == (0 | 0);
                $$sink1$i = $not$$i & 1;
                $142 = ($135 + 16 | 0) + ($$sink1$i << 2) | 0;
                $143 = HEAP322[$142 >> 2] | 0;
                $144 = ($143 | 0) == (0 | 0);
                if ($144) {
                  $$0172$lcssa$i = $$$0172$i;
                  $$0173$lcssa$i = $$$0173$i;
                  break;
                } else {
                  $$01726$i = $$$0172$i;
                  $$01735$i = $$$0173$i;
                  $135 = $143;
                }
              }
            }
            $145 = $$0172$lcssa$i + $6 | 0;
            $146 = $$0172$lcssa$i >>> 0 < $145 >>> 0;
            if ($146) {
              $147 = $$0172$lcssa$i + 24 | 0;
              $148 = HEAP322[$147 >> 2] | 0;
              $149 = $$0172$lcssa$i + 12 | 0;
              $150 = HEAP322[$149 >> 2] | 0;
              $151 = ($150 | 0) == ($$0172$lcssa$i | 0);
              do {
                if ($151) {
                  $156 = $$0172$lcssa$i + 20 | 0;
                  $157 = HEAP322[$156 >> 2] | 0;
                  $158 = ($157 | 0) == (0 | 0);
                  if ($158) {
                    $159 = $$0172$lcssa$i + 16 | 0;
                    $160 = HEAP322[$159 >> 2] | 0;
                    $161 = ($160 | 0) == (0 | 0);
                    if ($161) {
                      $$3$i = 0;
                      break;
                    } else {
                      $$1176$i = $160;
                      $$1178$i = $159;
                    }
                  } else {
                    $$1176$i = $157;
                    $$1178$i = $156;
                  }
                  while (1) {
                    $162 = $$1176$i + 20 | 0;
                    $163 = HEAP322[$162 >> 2] | 0;
                    $164 = ($163 | 0) == (0 | 0);
                    if (!$164) {
                      $$1176$i = $163;
                      $$1178$i = $162;
                      continue;
                    }
                    $165 = $$1176$i + 16 | 0;
                    $166 = HEAP322[$165 >> 2] | 0;
                    $167 = ($166 | 0) == (0 | 0);
                    if ($167) {
                      break;
                    } else {
                      $$1176$i = $166;
                      $$1178$i = $165;
                    }
                  }
                  HEAP322[$$1178$i >> 2] = 0;
                  $$3$i = $$1176$i;
                } else {
                  $152 = $$0172$lcssa$i + 8 | 0;
                  $153 = HEAP322[$152 >> 2] | 0;
                  $154 = $153 + 12 | 0;
                  HEAP322[$154 >> 2] = $150;
                  $155 = $150 + 8 | 0;
                  HEAP322[$155 >> 2] = $153;
                  $$3$i = $150;
                }
              } while (0);
              $168 = ($148 | 0) == (0 | 0);
              do {
                if (!$168) {
                  $169 = $$0172$lcssa$i + 28 | 0;
                  $170 = HEAP322[$169 >> 2] | 0;
                  $171 = 38688 + ($170 << 2) | 0;
                  $172 = HEAP322[$171 >> 2] | 0;
                  $173 = ($$0172$lcssa$i | 0) == ($172 | 0);
                  if ($173) {
                    HEAP322[$171 >> 2] = $$3$i;
                    $cond$i = ($$3$i | 0) == (0 | 0);
                    if ($cond$i) {
                      $174 = 1 << $170;
                      $175 = $174 ^ -1;
                      $176 = $98 & $175;
                      HEAP322[38388 >> 2] = $176;
                      break;
                    }
                  } else {
                    $177 = $148 + 16 | 0;
                    $178 = HEAP322[$177 >> 2] | 0;
                    $not$1$i = ($178 | 0) != ($$0172$lcssa$i | 0);
                    $$sink2$i = $not$1$i & 1;
                    $179 = ($148 + 16 | 0) + ($$sink2$i << 2) | 0;
                    HEAP322[$179 >> 2] = $$3$i;
                    $180 = ($$3$i | 0) == (0 | 0);
                    if ($180) {
                      break;
                    }
                  }
                  $181 = $$3$i + 24 | 0;
                  HEAP322[$181 >> 2] = $148;
                  $182 = $$0172$lcssa$i + 16 | 0;
                  $183 = HEAP322[$182 >> 2] | 0;
                  $184 = ($183 | 0) == (0 | 0);
                  if (!$184) {
                    $185 = $$3$i + 16 | 0;
                    HEAP322[$185 >> 2] = $183;
                    $186 = $183 + 24 | 0;
                    HEAP322[$186 >> 2] = $$3$i;
                  }
                  $187 = $$0172$lcssa$i + 20 | 0;
                  $188 = HEAP322[$187 >> 2] | 0;
                  $189 = ($188 | 0) == (0 | 0);
                  if (!$189) {
                    $190 = $$3$i + 20 | 0;
                    HEAP322[$190 >> 2] = $188;
                    $191 = $188 + 24 | 0;
                    HEAP322[$191 >> 2] = $$3$i;
                  }
                }
              } while (0);
              $192 = $$0173$lcssa$i >>> 0 < 16;
              if ($192) {
                $193 = $$0173$lcssa$i + $6 | 0;
                $194 = $193 | 3;
                $195 = $$0172$lcssa$i + 4 | 0;
                HEAP322[$195 >> 2] = $194;
                $196 = $$0172$lcssa$i + $193 | 0;
                $197 = $196 + 4 | 0;
                $198 = HEAP322[$197 >> 2] | 0;
                $199 = $198 | 1;
                HEAP322[$197 >> 2] = $199;
              } else {
                $200 = $6 | 3;
                $201 = $$0172$lcssa$i + 4 | 0;
                HEAP322[$201 >> 2] = $200;
                $202 = $$0173$lcssa$i | 1;
                $203 = $145 + 4 | 0;
                HEAP322[$203 >> 2] = $202;
                $204 = $145 + $$0173$lcssa$i | 0;
                HEAP322[$204 >> 2] = $$0173$lcssa$i;
                $205 = ($33 | 0) == 0;
                if (!$205) {
                  $206 = HEAP322[38404 >> 2] | 0;
                  $207 = $33 >>> 3;
                  $208 = $207 << 1;
                  $209 = 38424 + ($208 << 2) | 0;
                  $210 = 1 << $207;
                  $211 = $8 & $210;
                  $212 = ($211 | 0) == 0;
                  if ($212) {
                    $213 = $8 | $210;
                    HEAP322[9596] = $213;
                    $$pre$i = $209 + 8 | 0;
                    $$0$i = $209;
                    $$pre$phi$iZ2D = $$pre$i;
                  } else {
                    $214 = $209 + 8 | 0;
                    $215 = HEAP322[$214 >> 2] | 0;
                    $$0$i = $215;
                    $$pre$phi$iZ2D = $214;
                  }
                  HEAP322[$$pre$phi$iZ2D >> 2] = $206;
                  $216 = $$0$i + 12 | 0;
                  HEAP322[$216 >> 2] = $206;
                  $217 = $206 + 8 | 0;
                  HEAP322[$217 >> 2] = $$0$i;
                  $218 = $206 + 12 | 0;
                  HEAP322[$218 >> 2] = $209;
                }
                HEAP322[38392 >> 2] = $$0173$lcssa$i;
                HEAP322[38404 >> 2] = $145;
              }
              $219 = $$0172$lcssa$i + 8 | 0;
              $$0 = $219;
              STACKTOP2 = sp;
              return $$0 | 0;
            } else {
              $$0192 = $6;
            }
          }
        } else {
          $$0192 = $6;
        }
      } else {
        $220 = $0 >>> 0 > 4294967231;
        if ($220) {
          $$0192 = -1;
        } else {
          $221 = $0 + 11 | 0;
          $222 = $221 & -8;
          $223 = HEAP322[38388 >> 2] | 0;
          $224 = ($223 | 0) == 0;
          if ($224) {
            $$0192 = $222;
          } else {
            $225 = 0 - $222 | 0;
            $226 = $221 >>> 8;
            $227 = ($226 | 0) == 0;
            if ($227) {
              $$0336$i = 0;
            } else {
              $228 = $222 >>> 0 > 16777215;
              if ($228) {
                $$0336$i = 31;
              } else {
                $229 = $226 + 1048320 | 0;
                $230 = $229 >>> 16;
                $231 = $230 & 8;
                $232 = $226 << $231;
                $233 = $232 + 520192 | 0;
                $234 = $233 >>> 16;
                $235 = $234 & 4;
                $236 = $235 | $231;
                $237 = $232 << $235;
                $238 = $237 + 245760 | 0;
                $239 = $238 >>> 16;
                $240 = $239 & 2;
                $241 = $236 | $240;
                $242 = 14 - $241 | 0;
                $243 = $237 << $240;
                $244 = $243 >>> 15;
                $245 = $242 + $244 | 0;
                $246 = $245 << 1;
                $247 = $245 + 7 | 0;
                $248 = $222 >>> $247;
                $249 = $248 & 1;
                $250 = $249 | $246;
                $$0336$i = $250;
              }
            }
            $251 = 38688 + ($$0336$i << 2) | 0;
            $252 = HEAP322[$251 >> 2] | 0;
            $253 = ($252 | 0) == (0 | 0);
            L74:
              do {
                if ($253) {
                  $$2333$i = 0;
                  $$3$i200 = 0;
                  $$3328$i = $225;
                  label = 57;
                } else {
                  $254 = ($$0336$i | 0) == 31;
                  $255 = $$0336$i >>> 1;
                  $256 = 25 - $255 | 0;
                  $257 = $254 ? 0 : $256;
                  $258 = $222 << $257;
                  $$0320$i = 0;
                  $$0325$i = $225;
                  $$0331$i = $252;
                  $$0337$i = $258;
                  $$0340$i = 0;
                  while (1) {
                    $259 = $$0331$i + 4 | 0;
                    $260 = HEAP322[$259 >> 2] | 0;
                    $261 = $260 & -8;
                    $262 = $261 - $222 | 0;
                    $263 = $262 >>> 0 < $$0325$i >>> 0;
                    if ($263) {
                      $264 = ($262 | 0) == 0;
                      if ($264) {
                        $$411$i = $$0331$i;
                        $$432910$i = 0;
                        $$43359$i = $$0331$i;
                        label = 61;
                        break L74;
                      } else {
                        $$1321$i = $$0331$i;
                        $$1326$i = $262;
                      }
                    } else {
                      $$1321$i = $$0320$i;
                      $$1326$i = $$0325$i;
                    }
                    $265 = $$0331$i + 20 | 0;
                    $266 = HEAP322[$265 >> 2] | 0;
                    $267 = $$0337$i >>> 31;
                    $268 = ($$0331$i + 16 | 0) + ($267 << 2) | 0;
                    $269 = HEAP322[$268 >> 2] | 0;
                    $270 = ($266 | 0) == (0 | 0);
                    $271 = ($266 | 0) == ($269 | 0);
                    $or$cond2$i199 = $270 | $271;
                    $$1341$i = $or$cond2$i199 ? $$0340$i : $266;
                    $272 = ($269 | 0) == (0 | 0);
                    $not$5$i = $272 ^ 1;
                    $273 = $not$5$i & 1;
                    $$0337$$i = $$0337$i << $273;
                    if ($272) {
                      $$2333$i = $$1341$i;
                      $$3$i200 = $$1321$i;
                      $$3328$i = $$1326$i;
                      label = 57;
                      break;
                    } else {
                      $$0320$i = $$1321$i;
                      $$0325$i = $$1326$i;
                      $$0331$i = $269;
                      $$0337$i = $$0337$$i;
                      $$0340$i = $$1341$i;
                    }
                  }
                }
              } while (0);
            if ((label | 0) == 57) {
              $274 = ($$2333$i | 0) == (0 | 0);
              $275 = ($$3$i200 | 0) == (0 | 0);
              $or$cond$i201 = $274 & $275;
              if ($or$cond$i201) {
                $276 = 2 << $$0336$i;
                $277 = 0 - $276 | 0;
                $278 = $276 | $277;
                $279 = $223 & $278;
                $280 = ($279 | 0) == 0;
                if ($280) {
                  $$0192 = $222;
                  break;
                }
                $281 = 0 - $279 | 0;
                $282 = $279 & $281;
                $283 = $282 + -1 | 0;
                $284 = $283 >>> 12;
                $285 = $284 & 16;
                $286 = $283 >>> $285;
                $287 = $286 >>> 5;
                $288 = $287 & 8;
                $289 = $288 | $285;
                $290 = $286 >>> $288;
                $291 = $290 >>> 2;
                $292 = $291 & 4;
                $293 = $289 | $292;
                $294 = $290 >>> $292;
                $295 = $294 >>> 1;
                $296 = $295 & 2;
                $297 = $293 | $296;
                $298 = $294 >>> $296;
                $299 = $298 >>> 1;
                $300 = $299 & 1;
                $301 = $297 | $300;
                $302 = $298 >>> $300;
                $303 = $301 + $302 | 0;
                $304 = 38688 + ($303 << 2) | 0;
                $305 = HEAP322[$304 >> 2] | 0;
                $$4$ph$i = 0;
                $$4335$ph$i = $305;
              } else {
                $$4$ph$i = $$3$i200;
                $$4335$ph$i = $$2333$i;
              }
              $306 = ($$4335$ph$i | 0) == (0 | 0);
              if ($306) {
                $$4$lcssa$i = $$4$ph$i;
                $$4329$lcssa$i = $$3328$i;
              } else {
                $$411$i = $$4$ph$i;
                $$432910$i = $$3328$i;
                $$43359$i = $$4335$ph$i;
                label = 61;
              }
            }
            if ((label | 0) == 61) {
              while (1) {
                label = 0;
                $307 = $$43359$i + 4 | 0;
                $308 = HEAP322[$307 >> 2] | 0;
                $309 = $308 & -8;
                $310 = $309 - $222 | 0;
                $311 = $310 >>> 0 < $$432910$i >>> 0;
                $$$4329$i = $311 ? $310 : $$432910$i;
                $$4335$$4$i = $311 ? $$43359$i : $$411$i;
                $312 = $$43359$i + 16 | 0;
                $313 = HEAP322[$312 >> 2] | 0;
                $not$1$i203 = ($313 | 0) == (0 | 0);
                $$sink2$i204 = $not$1$i203 & 1;
                $314 = ($$43359$i + 16 | 0) + ($$sink2$i204 << 2) | 0;
                $315 = HEAP322[$314 >> 2] | 0;
                $316 = ($315 | 0) == (0 | 0);
                if ($316) {
                  $$4$lcssa$i = $$4335$$4$i;
                  $$4329$lcssa$i = $$$4329$i;
                  break;
                } else {
                  $$411$i = $$4335$$4$i;
                  $$432910$i = $$$4329$i;
                  $$43359$i = $315;
                  label = 61;
                }
              }
            }
            $317 = ($$4$lcssa$i | 0) == (0 | 0);
            if ($317) {
              $$0192 = $222;
            } else {
              $318 = HEAP322[38392 >> 2] | 0;
              $319 = $318 - $222 | 0;
              $320 = $$4329$lcssa$i >>> 0 < $319 >>> 0;
              if ($320) {
                $321 = $$4$lcssa$i + $222 | 0;
                $322 = $$4$lcssa$i >>> 0 < $321 >>> 0;
                if (!$322) {
                  $$0 = 0;
                  STACKTOP2 = sp;
                  return $$0 | 0;
                }
                $323 = $$4$lcssa$i + 24 | 0;
                $324 = HEAP322[$323 >> 2] | 0;
                $325 = $$4$lcssa$i + 12 | 0;
                $326 = HEAP322[$325 >> 2] | 0;
                $327 = ($326 | 0) == ($$4$lcssa$i | 0);
                do {
                  if ($327) {
                    $332 = $$4$lcssa$i + 20 | 0;
                    $333 = HEAP322[$332 >> 2] | 0;
                    $334 = ($333 | 0) == (0 | 0);
                    if ($334) {
                      $335 = $$4$lcssa$i + 16 | 0;
                      $336 = HEAP322[$335 >> 2] | 0;
                      $337 = ($336 | 0) == (0 | 0);
                      if ($337) {
                        $$3349$i = 0;
                        break;
                      } else {
                        $$1347$i = $336;
                        $$1351$i = $335;
                      }
                    } else {
                      $$1347$i = $333;
                      $$1351$i = $332;
                    }
                    while (1) {
                      $338 = $$1347$i + 20 | 0;
                      $339 = HEAP322[$338 >> 2] | 0;
                      $340 = ($339 | 0) == (0 | 0);
                      if (!$340) {
                        $$1347$i = $339;
                        $$1351$i = $338;
                        continue;
                      }
                      $341 = $$1347$i + 16 | 0;
                      $342 = HEAP322[$341 >> 2] | 0;
                      $343 = ($342 | 0) == (0 | 0);
                      if ($343) {
                        break;
                      } else {
                        $$1347$i = $342;
                        $$1351$i = $341;
                      }
                    }
                    HEAP322[$$1351$i >> 2] = 0;
                    $$3349$i = $$1347$i;
                  } else {
                    $328 = $$4$lcssa$i + 8 | 0;
                    $329 = HEAP322[$328 >> 2] | 0;
                    $330 = $329 + 12 | 0;
                    HEAP322[$330 >> 2] = $326;
                    $331 = $326 + 8 | 0;
                    HEAP322[$331 >> 2] = $329;
                    $$3349$i = $326;
                  }
                } while (0);
                $344 = ($324 | 0) == (0 | 0);
                do {
                  if ($344) {
                    $426 = $223;
                  } else {
                    $345 = $$4$lcssa$i + 28 | 0;
                    $346 = HEAP322[$345 >> 2] | 0;
                    $347 = 38688 + ($346 << 2) | 0;
                    $348 = HEAP322[$347 >> 2] | 0;
                    $349 = ($$4$lcssa$i | 0) == ($348 | 0);
                    if ($349) {
                      HEAP322[$347 >> 2] = $$3349$i;
                      $cond$i208 = ($$3349$i | 0) == (0 | 0);
                      if ($cond$i208) {
                        $350 = 1 << $346;
                        $351 = $350 ^ -1;
                        $352 = $223 & $351;
                        HEAP322[38388 >> 2] = $352;
                        $426 = $352;
                        break;
                      }
                    } else {
                      $353 = $324 + 16 | 0;
                      $354 = HEAP322[$353 >> 2] | 0;
                      $not$$i209 = ($354 | 0) != ($$4$lcssa$i | 0);
                      $$sink3$i = $not$$i209 & 1;
                      $355 = ($324 + 16 | 0) + ($$sink3$i << 2) | 0;
                      HEAP322[$355 >> 2] = $$3349$i;
                      $356 = ($$3349$i | 0) == (0 | 0);
                      if ($356) {
                        $426 = $223;
                        break;
                      }
                    }
                    $357 = $$3349$i + 24 | 0;
                    HEAP322[$357 >> 2] = $324;
                    $358 = $$4$lcssa$i + 16 | 0;
                    $359 = HEAP322[$358 >> 2] | 0;
                    $360 = ($359 | 0) == (0 | 0);
                    if (!$360) {
                      $361 = $$3349$i + 16 | 0;
                      HEAP322[$361 >> 2] = $359;
                      $362 = $359 + 24 | 0;
                      HEAP322[$362 >> 2] = $$3349$i;
                    }
                    $363 = $$4$lcssa$i + 20 | 0;
                    $364 = HEAP322[$363 >> 2] | 0;
                    $365 = ($364 | 0) == (0 | 0);
                    if ($365) {
                      $426 = $223;
                    } else {
                      $366 = $$3349$i + 20 | 0;
                      HEAP322[$366 >> 2] = $364;
                      $367 = $364 + 24 | 0;
                      HEAP322[$367 >> 2] = $$3349$i;
                      $426 = $223;
                    }
                  }
                } while (0);
                $368 = $$4329$lcssa$i >>> 0 < 16;
                do {
                  if ($368) {
                    $369 = $$4329$lcssa$i + $222 | 0;
                    $370 = $369 | 3;
                    $371 = $$4$lcssa$i + 4 | 0;
                    HEAP322[$371 >> 2] = $370;
                    $372 = $$4$lcssa$i + $369 | 0;
                    $373 = $372 + 4 | 0;
                    $374 = HEAP322[$373 >> 2] | 0;
                    $375 = $374 | 1;
                    HEAP322[$373 >> 2] = $375;
                  } else {
                    $376 = $222 | 3;
                    $377 = $$4$lcssa$i + 4 | 0;
                    HEAP322[$377 >> 2] = $376;
                    $378 = $$4329$lcssa$i | 1;
                    $379 = $321 + 4 | 0;
                    HEAP322[$379 >> 2] = $378;
                    $380 = $321 + $$4329$lcssa$i | 0;
                    HEAP322[$380 >> 2] = $$4329$lcssa$i;
                    $381 = $$4329$lcssa$i >>> 3;
                    $382 = $$4329$lcssa$i >>> 0 < 256;
                    if ($382) {
                      $383 = $381 << 1;
                      $384 = 38424 + ($383 << 2) | 0;
                      $385 = HEAP322[9596] | 0;
                      $386 = 1 << $381;
                      $387 = $385 & $386;
                      $388 = ($387 | 0) == 0;
                      if ($388) {
                        $389 = $385 | $386;
                        HEAP322[9596] = $389;
                        $$pre$i210 = $384 + 8 | 0;
                        $$0345$i = $384;
                        $$pre$phi$i211Z2D = $$pre$i210;
                      } else {
                        $390 = $384 + 8 | 0;
                        $391 = HEAP322[$390 >> 2] | 0;
                        $$0345$i = $391;
                        $$pre$phi$i211Z2D = $390;
                      }
                      HEAP322[$$pre$phi$i211Z2D >> 2] = $321;
                      $392 = $$0345$i + 12 | 0;
                      HEAP322[$392 >> 2] = $321;
                      $393 = $321 + 8 | 0;
                      HEAP322[$393 >> 2] = $$0345$i;
                      $394 = $321 + 12 | 0;
                      HEAP322[$394 >> 2] = $384;
                      break;
                    }
                    $395 = $$4329$lcssa$i >>> 8;
                    $396 = ($395 | 0) == 0;
                    if ($396) {
                      $$0339$i = 0;
                    } else {
                      $397 = $$4329$lcssa$i >>> 0 > 16777215;
                      if ($397) {
                        $$0339$i = 31;
                      } else {
                        $398 = $395 + 1048320 | 0;
                        $399 = $398 >>> 16;
                        $400 = $399 & 8;
                        $401 = $395 << $400;
                        $402 = $401 + 520192 | 0;
                        $403 = $402 >>> 16;
                        $404 = $403 & 4;
                        $405 = $404 | $400;
                        $406 = $401 << $404;
                        $407 = $406 + 245760 | 0;
                        $408 = $407 >>> 16;
                        $409 = $408 & 2;
                        $410 = $405 | $409;
                        $411 = 14 - $410 | 0;
                        $412 = $406 << $409;
                        $413 = $412 >>> 15;
                        $414 = $411 + $413 | 0;
                        $415 = $414 << 1;
                        $416 = $414 + 7 | 0;
                        $417 = $$4329$lcssa$i >>> $416;
                        $418 = $417 & 1;
                        $419 = $418 | $415;
                        $$0339$i = $419;
                      }
                    }
                    $420 = 38688 + ($$0339$i << 2) | 0;
                    $421 = $321 + 28 | 0;
                    HEAP322[$421 >> 2] = $$0339$i;
                    $422 = $321 + 16 | 0;
                    $423 = $422 + 4 | 0;
                    HEAP322[$423 >> 2] = 0;
                    HEAP322[$422 >> 2] = 0;
                    $424 = 1 << $$0339$i;
                    $425 = $426 & $424;
                    $427 = ($425 | 0) == 0;
                    if ($427) {
                      $428 = $426 | $424;
                      HEAP322[38388 >> 2] = $428;
                      HEAP322[$420 >> 2] = $321;
                      $429 = $321 + 24 | 0;
                      HEAP322[$429 >> 2] = $420;
                      $430 = $321 + 12 | 0;
                      HEAP322[$430 >> 2] = $321;
                      $431 = $321 + 8 | 0;
                      HEAP322[$431 >> 2] = $321;
                      break;
                    }
                    $432 = HEAP322[$420 >> 2] | 0;
                    $433 = ($$0339$i | 0) == 31;
                    $434 = $$0339$i >>> 1;
                    $435 = 25 - $434 | 0;
                    $436 = $433 ? 0 : $435;
                    $437 = $$4329$lcssa$i << $436;
                    $$0322$i = $437;
                    $$0323$i = $432;
                    while (1) {
                      $438 = $$0323$i + 4 | 0;
                      $439 = HEAP322[$438 >> 2] | 0;
                      $440 = $439 & -8;
                      $441 = ($440 | 0) == ($$4329$lcssa$i | 0);
                      if ($441) {
                        label = 97;
                        break;
                      }
                      $442 = $$0322$i >>> 31;
                      $443 = ($$0323$i + 16 | 0) + ($442 << 2) | 0;
                      $444 = $$0322$i << 1;
                      $445 = HEAP322[$443 >> 2] | 0;
                      $446 = ($445 | 0) == (0 | 0);
                      if ($446) {
                        label = 96;
                        break;
                      } else {
                        $$0322$i = $444;
                        $$0323$i = $445;
                      }
                    }
                    if ((label | 0) == 96) {
                      HEAP322[$443 >> 2] = $321;
                      $447 = $321 + 24 | 0;
                      HEAP322[$447 >> 2] = $$0323$i;
                      $448 = $321 + 12 | 0;
                      HEAP322[$448 >> 2] = $321;
                      $449 = $321 + 8 | 0;
                      HEAP322[$449 >> 2] = $321;
                      break;
                    } else if ((label | 0) == 97) {
                      $450 = $$0323$i + 8 | 0;
                      $451 = HEAP322[$450 >> 2] | 0;
                      $452 = $451 + 12 | 0;
                      HEAP322[$452 >> 2] = $321;
                      HEAP322[$450 >> 2] = $321;
                      $453 = $321 + 8 | 0;
                      HEAP322[$453 >> 2] = $451;
                      $454 = $321 + 12 | 0;
                      HEAP322[$454 >> 2] = $$0323$i;
                      $455 = $321 + 24 | 0;
                      HEAP322[$455 >> 2] = 0;
                      break;
                    }
                  }
                } while (0);
                $456 = $$4$lcssa$i + 8 | 0;
                $$0 = $456;
                STACKTOP2 = sp;
                return $$0 | 0;
              } else {
                $$0192 = $222;
              }
            }
          }
        }
      }
    } while (0);
    $457 = HEAP322[38392 >> 2] | 0;
    $458 = $457 >>> 0 < $$0192 >>> 0;
    if (!$458) {
      $459 = $457 - $$0192 | 0;
      $460 = HEAP322[38404 >> 2] | 0;
      $461 = $459 >>> 0 > 15;
      if ($461) {
        $462 = $460 + $$0192 | 0;
        HEAP322[38404 >> 2] = $462;
        HEAP322[38392 >> 2] = $459;
        $463 = $459 | 1;
        $464 = $462 + 4 | 0;
        HEAP322[$464 >> 2] = $463;
        $465 = $462 + $459 | 0;
        HEAP322[$465 >> 2] = $459;
        $466 = $$0192 | 3;
        $467 = $460 + 4 | 0;
        HEAP322[$467 >> 2] = $466;
      } else {
        HEAP322[38392 >> 2] = 0;
        HEAP322[38404 >> 2] = 0;
        $468 = $457 | 3;
        $469 = $460 + 4 | 0;
        HEAP322[$469 >> 2] = $468;
        $470 = $460 + $457 | 0;
        $471 = $470 + 4 | 0;
        $472 = HEAP322[$471 >> 2] | 0;
        $473 = $472 | 1;
        HEAP322[$471 >> 2] = $473;
      }
      $474 = $460 + 8 | 0;
      $$0 = $474;
      STACKTOP2 = sp;
      return $$0 | 0;
    }
    $475 = HEAP322[38396 >> 2] | 0;
    $476 = $475 >>> 0 > $$0192 >>> 0;
    if ($476) {
      $477 = $475 - $$0192 | 0;
      HEAP322[38396 >> 2] = $477;
      $478 = HEAP322[38408 >> 2] | 0;
      $479 = $478 + $$0192 | 0;
      HEAP322[38408 >> 2] = $479;
      $480 = $477 | 1;
      $481 = $479 + 4 | 0;
      HEAP322[$481 >> 2] = $480;
      $482 = $$0192 | 3;
      $483 = $478 + 4 | 0;
      HEAP322[$483 >> 2] = $482;
      $484 = $478 + 8 | 0;
      $$0 = $484;
      STACKTOP2 = sp;
      return $$0 | 0;
    }
    $485 = HEAP322[9714] | 0;
    $486 = ($485 | 0) == 0;
    if ($486) {
      HEAP322[38864 >> 2] = 4096;
      HEAP322[38860 >> 2] = 4096;
      HEAP322[38868 >> 2] = -1;
      HEAP322[38872 >> 2] = -1;
      HEAP322[38876 >> 2] = 0;
      HEAP322[38828 >> 2] = 0;
      $487 = $1;
      $488 = $487 & -16;
      $489 = $488 ^ 1431655768;
      HEAP322[$1 >> 2] = $489;
      HEAP322[9714] = $489;
      $493 = 4096;
    } else {
      $$pre$i195 = HEAP322[38864 >> 2] | 0;
      $493 = $$pre$i195;
    }
    $490 = $$0192 + 48 | 0;
    $491 = $$0192 + 47 | 0;
    $492 = $493 + $491 | 0;
    $494 = 0 - $493 | 0;
    $495 = $492 & $494;
    $496 = $495 >>> 0 > $$0192 >>> 0;
    if (!$496) {
      $$0 = 0;
      STACKTOP2 = sp;
      return $$0 | 0;
    }
    $497 = HEAP322[38824 >> 2] | 0;
    $498 = ($497 | 0) == 0;
    if (!$498) {
      $499 = HEAP322[38816 >> 2] | 0;
      $500 = $499 + $495 | 0;
      $501 = $500 >>> 0 <= $499 >>> 0;
      $502 = $500 >>> 0 > $497 >>> 0;
      $or$cond1$i = $501 | $502;
      if ($or$cond1$i) {
        $$0 = 0;
        STACKTOP2 = sp;
        return $$0 | 0;
      }
    }
    $503 = HEAP322[38828 >> 2] | 0;
    $504 = $503 & 4;
    $505 = ($504 | 0) == 0;
    L167:
      do {
        if ($505) {
          $506 = HEAP322[38408 >> 2] | 0;
          $507 = ($506 | 0) == (0 | 0);
          L169:
            do {
              if ($507) {
                label = 118;
              } else {
                $$0$i20$i = 38832;
                while (1) {
                  $508 = HEAP322[$$0$i20$i >> 2] | 0;
                  $509 = $508 >>> 0 > $506 >>> 0;
                  if (!$509) {
                    $510 = $$0$i20$i + 4 | 0;
                    $511 = HEAP322[$510 >> 2] | 0;
                    $512 = $508 + $511 | 0;
                    $513 = $512 >>> 0 > $506 >>> 0;
                    if ($513) {
                      break;
                    }
                  }
                  $514 = $$0$i20$i + 8 | 0;
                  $515 = HEAP322[$514 >> 2] | 0;
                  $516 = ($515 | 0) == (0 | 0);
                  if ($516) {
                    label = 118;
                    break L169;
                  } else {
                    $$0$i20$i = $515;
                  }
                }
                $539 = $492 - $475 | 0;
                $540 = $539 & $494;
                $541 = $540 >>> 0 < 2147483647;
                if ($541) {
                  $542 = _sbrk($540 | 0) | 0;
                  $543 = HEAP322[$$0$i20$i >> 2] | 0;
                  $544 = HEAP322[$510 >> 2] | 0;
                  $545 = $543 + $544 | 0;
                  $546 = ($542 | 0) == ($545 | 0);
                  if ($546) {
                    $547 = ($542 | 0) == (-1 | 0);
                    if ($547) {
                      $$2234243136$i = $540;
                    } else {
                      $$723947$i = $540;
                      $$748$i = $542;
                      label = 135;
                      break L167;
                    }
                  } else {
                    $$2247$ph$i = $542;
                    $$2253$ph$i = $540;
                    label = 126;
                  }
                } else {
                  $$2234243136$i = 0;
                }
              }
            } while (0);
          do {
            if ((label | 0) == 118) {
              $517 = _sbrk(0) | 0;
              $518 = ($517 | 0) == (-1 | 0);
              if ($518) {
                $$2234243136$i = 0;
              } else {
                $519 = $517;
                $520 = HEAP322[38860 >> 2] | 0;
                $521 = $520 + -1 | 0;
                $522 = $521 & $519;
                $523 = ($522 | 0) == 0;
                $524 = $521 + $519 | 0;
                $525 = 0 - $520 | 0;
                $526 = $524 & $525;
                $527 = $526 - $519 | 0;
                $528 = $523 ? 0 : $527;
                $$$i = $528 + $495 | 0;
                $529 = HEAP322[38816 >> 2] | 0;
                $530 = $$$i + $529 | 0;
                $531 = $$$i >>> 0 > $$0192 >>> 0;
                $532 = $$$i >>> 0 < 2147483647;
                $or$cond$i = $531 & $532;
                if ($or$cond$i) {
                  $533 = HEAP322[38824 >> 2] | 0;
                  $534 = ($533 | 0) == 0;
                  if (!$534) {
                    $535 = $530 >>> 0 <= $529 >>> 0;
                    $536 = $530 >>> 0 > $533 >>> 0;
                    $or$cond2$i = $535 | $536;
                    if ($or$cond2$i) {
                      $$2234243136$i = 0;
                      break;
                    }
                  }
                  $537 = _sbrk($$$i | 0) | 0;
                  $538 = ($537 | 0) == ($517 | 0);
                  if ($538) {
                    $$723947$i = $$$i;
                    $$748$i = $517;
                    label = 135;
                    break L167;
                  } else {
                    $$2247$ph$i = $537;
                    $$2253$ph$i = $$$i;
                    label = 126;
                  }
                } else {
                  $$2234243136$i = 0;
                }
              }
            }
          } while (0);
          do {
            if ((label | 0) == 126) {
              $548 = 0 - $$2253$ph$i | 0;
              $549 = ($$2247$ph$i | 0) != (-1 | 0);
              $550 = $$2253$ph$i >>> 0 < 2147483647;
              $or$cond7$i = $550 & $549;
              $551 = $490 >>> 0 > $$2253$ph$i >>> 0;
              $or$cond10$i = $551 & $or$cond7$i;
              if (!$or$cond10$i) {
                $561 = ($$2247$ph$i | 0) == (-1 | 0);
                if ($561) {
                  $$2234243136$i = 0;
                  break;
                } else {
                  $$723947$i = $$2253$ph$i;
                  $$748$i = $$2247$ph$i;
                  label = 135;
                  break L167;
                }
              }
              $552 = HEAP322[38864 >> 2] | 0;
              $553 = $491 - $$2253$ph$i | 0;
              $554 = $553 + $552 | 0;
              $555 = 0 - $552 | 0;
              $556 = $554 & $555;
              $557 = $556 >>> 0 < 2147483647;
              if (!$557) {
                $$723947$i = $$2253$ph$i;
                $$748$i = $$2247$ph$i;
                label = 135;
                break L167;
              }
              $558 = _sbrk($556 | 0) | 0;
              $559 = ($558 | 0) == (-1 | 0);
              if ($559) {
                _sbrk($548 | 0) | 0;
                $$2234243136$i = 0;
                break;
              } else {
                $560 = $556 + $$2253$ph$i | 0;
                $$723947$i = $560;
                $$748$i = $$2247$ph$i;
                label = 135;
                break L167;
              }
            }
          } while (0);
          $562 = HEAP322[38828 >> 2] | 0;
          $563 = $562 | 4;
          HEAP322[38828 >> 2] = $563;
          $$4236$i = $$2234243136$i;
          label = 133;
        } else {
          $$4236$i = 0;
          label = 133;
        }
      } while (0);
    if ((label | 0) == 133) {
      $564 = $495 >>> 0 < 2147483647;
      if ($564) {
        $565 = _sbrk($495 | 0) | 0;
        $566 = _sbrk(0) | 0;
        $567 = ($565 | 0) != (-1 | 0);
        $568 = ($566 | 0) != (-1 | 0);
        $or$cond5$i = $567 & $568;
        $569 = $565 >>> 0 < $566 >>> 0;
        $or$cond11$i = $569 & $or$cond5$i;
        $570 = $566;
        $571 = $565;
        $572 = $570 - $571 | 0;
        $573 = $$0192 + 40 | 0;
        $574 = $572 >>> 0 > $573 >>> 0;
        $$$4236$i = $574 ? $572 : $$4236$i;
        $or$cond11$not$i = $or$cond11$i ^ 1;
        $575 = ($565 | 0) == (-1 | 0);
        $not$$i197 = $574 ^ 1;
        $576 = $575 | $not$$i197;
        $or$cond49$i = $576 | $or$cond11$not$i;
        if (!$or$cond49$i) {
          $$723947$i = $$$4236$i;
          $$748$i = $565;
          label = 135;
        }
      }
    }
    if ((label | 0) == 135) {
      $577 = HEAP322[38816 >> 2] | 0;
      $578 = $577 + $$723947$i | 0;
      HEAP322[38816 >> 2] = $578;
      $579 = HEAP322[38820 >> 2] | 0;
      $580 = $578 >>> 0 > $579 >>> 0;
      if ($580) {
        HEAP322[38820 >> 2] = $578;
      }
      $581 = HEAP322[38408 >> 2] | 0;
      $582 = ($581 | 0) == (0 | 0);
      do {
        if ($582) {
          $583 = HEAP322[38400 >> 2] | 0;
          $584 = ($583 | 0) == (0 | 0);
          $585 = $$748$i >>> 0 < $583 >>> 0;
          $or$cond12$i = $584 | $585;
          if ($or$cond12$i) {
            HEAP322[38400 >> 2] = $$748$i;
          }
          HEAP322[38832 >> 2] = $$748$i;
          HEAP322[38836 >> 2] = $$723947$i;
          HEAP322[38844 >> 2] = 0;
          $586 = HEAP322[9714] | 0;
          HEAP322[38420 >> 2] = $586;
          HEAP322[38416 >> 2] = -1;
          $$01$i$i = 0;
          while (1) {
            $587 = $$01$i$i << 1;
            $588 = 38424 + ($587 << 2) | 0;
            $589 = $588 + 12 | 0;
            HEAP322[$589 >> 2] = $588;
            $590 = $588 + 8 | 0;
            HEAP322[$590 >> 2] = $588;
            $591 = $$01$i$i + 1 | 0;
            $exitcond$i$i = ($591 | 0) == 32;
            if ($exitcond$i$i) {
              break;
            } else {
              $$01$i$i = $591;
            }
          }
          $592 = $$723947$i + -40 | 0;
          $593 = $$748$i + 8 | 0;
          $594 = $593;
          $595 = $594 & 7;
          $596 = ($595 | 0) == 0;
          $597 = 0 - $594 | 0;
          $598 = $597 & 7;
          $599 = $596 ? 0 : $598;
          $600 = $$748$i + $599 | 0;
          $601 = $592 - $599 | 0;
          HEAP322[38408 >> 2] = $600;
          HEAP322[38396 >> 2] = $601;
          $602 = $601 | 1;
          $603 = $600 + 4 | 0;
          HEAP322[$603 >> 2] = $602;
          $604 = $600 + $601 | 0;
          $605 = $604 + 4 | 0;
          HEAP322[$605 >> 2] = 40;
          $606 = HEAP322[38872 >> 2] | 0;
          HEAP322[38412 >> 2] = $606;
        } else {
          $$024370$i = 38832;
          while (1) {
            $607 = HEAP322[$$024370$i >> 2] | 0;
            $608 = $$024370$i + 4 | 0;
            $609 = HEAP322[$608 >> 2] | 0;
            $610 = $607 + $609 | 0;
            $611 = ($$748$i | 0) == ($610 | 0);
            if ($611) {
              label = 145;
              break;
            }
            $612 = $$024370$i + 8 | 0;
            $613 = HEAP322[$612 >> 2] | 0;
            $614 = ($613 | 0) == (0 | 0);
            if ($614) {
              break;
            } else {
              $$024370$i = $613;
            }
          }
          if ((label | 0) == 145) {
            $615 = $$024370$i + 12 | 0;
            $616 = HEAP322[$615 >> 2] | 0;
            $617 = $616 & 8;
            $618 = ($617 | 0) == 0;
            if ($618) {
              $619 = $581 >>> 0 >= $607 >>> 0;
              $620 = $581 >>> 0 < $$748$i >>> 0;
              $or$cond50$i = $620 & $619;
              if ($or$cond50$i) {
                $621 = $609 + $$723947$i | 0;
                HEAP322[$608 >> 2] = $621;
                $622 = HEAP322[38396 >> 2] | 0;
                $623 = $581 + 8 | 0;
                $624 = $623;
                $625 = $624 & 7;
                $626 = ($625 | 0) == 0;
                $627 = 0 - $624 | 0;
                $628 = $627 & 7;
                $629 = $626 ? 0 : $628;
                $630 = $581 + $629 | 0;
                $631 = $$723947$i - $629 | 0;
                $632 = $622 + $631 | 0;
                HEAP322[38408 >> 2] = $630;
                HEAP322[38396 >> 2] = $632;
                $633 = $632 | 1;
                $634 = $630 + 4 | 0;
                HEAP322[$634 >> 2] = $633;
                $635 = $630 + $632 | 0;
                $636 = $635 + 4 | 0;
                HEAP322[$636 >> 2] = 40;
                $637 = HEAP322[38872 >> 2] | 0;
                HEAP322[38412 >> 2] = $637;
                break;
              }
            }
          }
          $638 = HEAP322[38400 >> 2] | 0;
          $639 = $$748$i >>> 0 < $638 >>> 0;
          if ($639) {
            HEAP322[38400 >> 2] = $$748$i;
          }
          $640 = $$748$i + $$723947$i | 0;
          $$124469$i = 38832;
          while (1) {
            $641 = HEAP322[$$124469$i >> 2] | 0;
            $642 = ($641 | 0) == ($640 | 0);
            if ($642) {
              label = 153;
              break;
            }
            $643 = $$124469$i + 8 | 0;
            $644 = HEAP322[$643 >> 2] | 0;
            $645 = ($644 | 0) == (0 | 0);
            if ($645) {
              break;
            } else {
              $$124469$i = $644;
            }
          }
          if ((label | 0) == 153) {
            $646 = $$124469$i + 12 | 0;
            $647 = HEAP322[$646 >> 2] | 0;
            $648 = $647 & 8;
            $649 = ($648 | 0) == 0;
            if ($649) {
              HEAP322[$$124469$i >> 2] = $$748$i;
              $650 = $$124469$i + 4 | 0;
              $651 = HEAP322[$650 >> 2] | 0;
              $652 = $651 + $$723947$i | 0;
              HEAP322[$650 >> 2] = $652;
              $653 = $$748$i + 8 | 0;
              $654 = $653;
              $655 = $654 & 7;
              $656 = ($655 | 0) == 0;
              $657 = 0 - $654 | 0;
              $658 = $657 & 7;
              $659 = $656 ? 0 : $658;
              $660 = $$748$i + $659 | 0;
              $661 = $640 + 8 | 0;
              $662 = $661;
              $663 = $662 & 7;
              $664 = ($663 | 0) == 0;
              $665 = 0 - $662 | 0;
              $666 = $665 & 7;
              $667 = $664 ? 0 : $666;
              $668 = $640 + $667 | 0;
              $669 = $668;
              $670 = $660;
              $671 = $669 - $670 | 0;
              $672 = $660 + $$0192 | 0;
              $673 = $671 - $$0192 | 0;
              $674 = $$0192 | 3;
              $675 = $660 + 4 | 0;
              HEAP322[$675 >> 2] = $674;
              $676 = ($668 | 0) == ($581 | 0);
              do {
                if ($676) {
                  $677 = HEAP322[38396 >> 2] | 0;
                  $678 = $677 + $673 | 0;
                  HEAP322[38396 >> 2] = $678;
                  HEAP322[38408 >> 2] = $672;
                  $679 = $678 | 1;
                  $680 = $672 + 4 | 0;
                  HEAP322[$680 >> 2] = $679;
                } else {
                  $681 = HEAP322[38404 >> 2] | 0;
                  $682 = ($668 | 0) == ($681 | 0);
                  if ($682) {
                    $683 = HEAP322[38392 >> 2] | 0;
                    $684 = $683 + $673 | 0;
                    HEAP322[38392 >> 2] = $684;
                    HEAP322[38404 >> 2] = $672;
                    $685 = $684 | 1;
                    $686 = $672 + 4 | 0;
                    HEAP322[$686 >> 2] = $685;
                    $687 = $672 + $684 | 0;
                    HEAP322[$687 >> 2] = $684;
                    break;
                  }
                  $688 = $668 + 4 | 0;
                  $689 = HEAP322[$688 >> 2] | 0;
                  $690 = $689 & 3;
                  $691 = ($690 | 0) == 1;
                  if ($691) {
                    $692 = $689 & -8;
                    $693 = $689 >>> 3;
                    $694 = $689 >>> 0 < 256;
                    L237:
                      do {
                        if ($694) {
                          $695 = $668 + 8 | 0;
                          $696 = HEAP322[$695 >> 2] | 0;
                          $697 = $668 + 12 | 0;
                          $698 = HEAP322[$697 >> 2] | 0;
                          $699 = ($698 | 0) == ($696 | 0);
                          if ($699) {
                            $700 = 1 << $693;
                            $701 = $700 ^ -1;
                            $702 = HEAP322[9596] | 0;
                            $703 = $702 & $701;
                            HEAP322[9596] = $703;
                            break;
                          } else {
                            $704 = $696 + 12 | 0;
                            HEAP322[$704 >> 2] = $698;
                            $705 = $698 + 8 | 0;
                            HEAP322[$705 >> 2] = $696;
                            break;
                          }
                        } else {
                          $706 = $668 + 24 | 0;
                          $707 = HEAP322[$706 >> 2] | 0;
                          $708 = $668 + 12 | 0;
                          $709 = HEAP322[$708 >> 2] | 0;
                          $710 = ($709 | 0) == ($668 | 0);
                          do {
                            if ($710) {
                              $715 = $668 + 16 | 0;
                              $716 = $715 + 4 | 0;
                              $717 = HEAP322[$716 >> 2] | 0;
                              $718 = ($717 | 0) == (0 | 0);
                              if ($718) {
                                $719 = HEAP322[$715 >> 2] | 0;
                                $720 = ($719 | 0) == (0 | 0);
                                if ($720) {
                                  $$3$i$i = 0;
                                  break;
                                } else {
                                  $$1264$i$i = $719;
                                  $$1266$i$i = $715;
                                }
                              } else {
                                $$1264$i$i = $717;
                                $$1266$i$i = $716;
                              }
                              while (1) {
                                $721 = $$1264$i$i + 20 | 0;
                                $722 = HEAP322[$721 >> 2] | 0;
                                $723 = ($722 | 0) == (0 | 0);
                                if (!$723) {
                                  $$1264$i$i = $722;
                                  $$1266$i$i = $721;
                                  continue;
                                }
                                $724 = $$1264$i$i + 16 | 0;
                                $725 = HEAP322[$724 >> 2] | 0;
                                $726 = ($725 | 0) == (0 | 0);
                                if ($726) {
                                  break;
                                } else {
                                  $$1264$i$i = $725;
                                  $$1266$i$i = $724;
                                }
                              }
                              HEAP322[$$1266$i$i >> 2] = 0;
                              $$3$i$i = $$1264$i$i;
                            } else {
                              $711 = $668 + 8 | 0;
                              $712 = HEAP322[$711 >> 2] | 0;
                              $713 = $712 + 12 | 0;
                              HEAP322[$713 >> 2] = $709;
                              $714 = $709 + 8 | 0;
                              HEAP322[$714 >> 2] = $712;
                              $$3$i$i = $709;
                            }
                          } while (0);
                          $727 = ($707 | 0) == (0 | 0);
                          if ($727) {
                            break;
                          }
                          $728 = $668 + 28 | 0;
                          $729 = HEAP322[$728 >> 2] | 0;
                          $730 = 38688 + ($729 << 2) | 0;
                          $731 = HEAP322[$730 >> 2] | 0;
                          $732 = ($668 | 0) == ($731 | 0);
                          do {
                            if ($732) {
                              HEAP322[$730 >> 2] = $$3$i$i;
                              $cond$i$i = ($$3$i$i | 0) == (0 | 0);
                              if (!$cond$i$i) {
                                break;
                              }
                              $733 = 1 << $729;
                              $734 = $733 ^ -1;
                              $735 = HEAP322[38388 >> 2] | 0;
                              $736 = $735 & $734;
                              HEAP322[38388 >> 2] = $736;
                              break L237;
                            } else {
                              $737 = $707 + 16 | 0;
                              $738 = HEAP322[$737 >> 2] | 0;
                              $not$$i$i = ($738 | 0) != ($668 | 0);
                              $$sink1$i$i = $not$$i$i & 1;
                              $739 = ($707 + 16 | 0) + ($$sink1$i$i << 2) | 0;
                              HEAP322[$739 >> 2] = $$3$i$i;
                              $740 = ($$3$i$i | 0) == (0 | 0);
                              if ($740) {
                                break L237;
                              }
                            }
                          } while (0);
                          $741 = $$3$i$i + 24 | 0;
                          HEAP322[$741 >> 2] = $707;
                          $742 = $668 + 16 | 0;
                          $743 = HEAP322[$742 >> 2] | 0;
                          $744 = ($743 | 0) == (0 | 0);
                          if (!$744) {
                            $745 = $$3$i$i + 16 | 0;
                            HEAP322[$745 >> 2] = $743;
                            $746 = $743 + 24 | 0;
                            HEAP322[$746 >> 2] = $$3$i$i;
                          }
                          $747 = $742 + 4 | 0;
                          $748 = HEAP322[$747 >> 2] | 0;
                          $749 = ($748 | 0) == (0 | 0);
                          if ($749) {
                            break;
                          }
                          $750 = $$3$i$i + 20 | 0;
                          HEAP322[$750 >> 2] = $748;
                          $751 = $748 + 24 | 0;
                          HEAP322[$751 >> 2] = $$3$i$i;
                        }
                      } while (0);
                    $752 = $668 + $692 | 0;
                    $753 = $692 + $673 | 0;
                    $$0$i$i = $752;
                    $$0260$i$i = $753;
                  } else {
                    $$0$i$i = $668;
                    $$0260$i$i = $673;
                  }
                  $754 = $$0$i$i + 4 | 0;
                  $755 = HEAP322[$754 >> 2] | 0;
                  $756 = $755 & -2;
                  HEAP322[$754 >> 2] = $756;
                  $757 = $$0260$i$i | 1;
                  $758 = $672 + 4 | 0;
                  HEAP322[$758 >> 2] = $757;
                  $759 = $672 + $$0260$i$i | 0;
                  HEAP322[$759 >> 2] = $$0260$i$i;
                  $760 = $$0260$i$i >>> 3;
                  $761 = $$0260$i$i >>> 0 < 256;
                  if ($761) {
                    $762 = $760 << 1;
                    $763 = 38424 + ($762 << 2) | 0;
                    $764 = HEAP322[9596] | 0;
                    $765 = 1 << $760;
                    $766 = $764 & $765;
                    $767 = ($766 | 0) == 0;
                    if ($767) {
                      $768 = $764 | $765;
                      HEAP322[9596] = $768;
                      $$pre$i17$i = $763 + 8 | 0;
                      $$0268$i$i = $763;
                      $$pre$phi$i18$iZ2D = $$pre$i17$i;
                    } else {
                      $769 = $763 + 8 | 0;
                      $770 = HEAP322[$769 >> 2] | 0;
                      $$0268$i$i = $770;
                      $$pre$phi$i18$iZ2D = $769;
                    }
                    HEAP322[$$pre$phi$i18$iZ2D >> 2] = $672;
                    $771 = $$0268$i$i + 12 | 0;
                    HEAP322[$771 >> 2] = $672;
                    $772 = $672 + 8 | 0;
                    HEAP322[$772 >> 2] = $$0268$i$i;
                    $773 = $672 + 12 | 0;
                    HEAP322[$773 >> 2] = $763;
                    break;
                  }
                  $774 = $$0260$i$i >>> 8;
                  $775 = ($774 | 0) == 0;
                  do {
                    if ($775) {
                      $$0269$i$i = 0;
                    } else {
                      $776 = $$0260$i$i >>> 0 > 16777215;
                      if ($776) {
                        $$0269$i$i = 31;
                        break;
                      }
                      $777 = $774 + 1048320 | 0;
                      $778 = $777 >>> 16;
                      $779 = $778 & 8;
                      $780 = $774 << $779;
                      $781 = $780 + 520192 | 0;
                      $782 = $781 >>> 16;
                      $783 = $782 & 4;
                      $784 = $783 | $779;
                      $785 = $780 << $783;
                      $786 = $785 + 245760 | 0;
                      $787 = $786 >>> 16;
                      $788 = $787 & 2;
                      $789 = $784 | $788;
                      $790 = 14 - $789 | 0;
                      $791 = $785 << $788;
                      $792 = $791 >>> 15;
                      $793 = $790 + $792 | 0;
                      $794 = $793 << 1;
                      $795 = $793 + 7 | 0;
                      $796 = $$0260$i$i >>> $795;
                      $797 = $796 & 1;
                      $798 = $797 | $794;
                      $$0269$i$i = $798;
                    }
                  } while (0);
                  $799 = 38688 + ($$0269$i$i << 2) | 0;
                  $800 = $672 + 28 | 0;
                  HEAP322[$800 >> 2] = $$0269$i$i;
                  $801 = $672 + 16 | 0;
                  $802 = $801 + 4 | 0;
                  HEAP322[$802 >> 2] = 0;
                  HEAP322[$801 >> 2] = 0;
                  $803 = HEAP322[38388 >> 2] | 0;
                  $804 = 1 << $$0269$i$i;
                  $805 = $803 & $804;
                  $806 = ($805 | 0) == 0;
                  if ($806) {
                    $807 = $803 | $804;
                    HEAP322[38388 >> 2] = $807;
                    HEAP322[$799 >> 2] = $672;
                    $808 = $672 + 24 | 0;
                    HEAP322[$808 >> 2] = $799;
                    $809 = $672 + 12 | 0;
                    HEAP322[$809 >> 2] = $672;
                    $810 = $672 + 8 | 0;
                    HEAP322[$810 >> 2] = $672;
                    break;
                  }
                  $811 = HEAP322[$799 >> 2] | 0;
                  $812 = ($$0269$i$i | 0) == 31;
                  $813 = $$0269$i$i >>> 1;
                  $814 = 25 - $813 | 0;
                  $815 = $812 ? 0 : $814;
                  $816 = $$0260$i$i << $815;
                  $$0261$i$i = $816;
                  $$0262$i$i = $811;
                  while (1) {
                    $817 = $$0262$i$i + 4 | 0;
                    $818 = HEAP322[$817 >> 2] | 0;
                    $819 = $818 & -8;
                    $820 = ($819 | 0) == ($$0260$i$i | 0);
                    if ($820) {
                      label = 194;
                      break;
                    }
                    $821 = $$0261$i$i >>> 31;
                    $822 = ($$0262$i$i + 16 | 0) + ($821 << 2) | 0;
                    $823 = $$0261$i$i << 1;
                    $824 = HEAP322[$822 >> 2] | 0;
                    $825 = ($824 | 0) == (0 | 0);
                    if ($825) {
                      label = 193;
                      break;
                    } else {
                      $$0261$i$i = $823;
                      $$0262$i$i = $824;
                    }
                  }
                  if ((label | 0) == 193) {
                    HEAP322[$822 >> 2] = $672;
                    $826 = $672 + 24 | 0;
                    HEAP322[$826 >> 2] = $$0262$i$i;
                    $827 = $672 + 12 | 0;
                    HEAP322[$827 >> 2] = $672;
                    $828 = $672 + 8 | 0;
                    HEAP322[$828 >> 2] = $672;
                    break;
                  } else if ((label | 0) == 194) {
                    $829 = $$0262$i$i + 8 | 0;
                    $830 = HEAP322[$829 >> 2] | 0;
                    $831 = $830 + 12 | 0;
                    HEAP322[$831 >> 2] = $672;
                    HEAP322[$829 >> 2] = $672;
                    $832 = $672 + 8 | 0;
                    HEAP322[$832 >> 2] = $830;
                    $833 = $672 + 12 | 0;
                    HEAP322[$833 >> 2] = $$0262$i$i;
                    $834 = $672 + 24 | 0;
                    HEAP322[$834 >> 2] = 0;
                    break;
                  }
                }
              } while (0);
              $959 = $660 + 8 | 0;
              $$0 = $959;
              STACKTOP2 = sp;
              return $$0 | 0;
            }
          }
          $$0$i$i$i = 38832;
          while (1) {
            $835 = HEAP322[$$0$i$i$i >> 2] | 0;
            $836 = $835 >>> 0 > $581 >>> 0;
            if (!$836) {
              $837 = $$0$i$i$i + 4 | 0;
              $838 = HEAP322[$837 >> 2] | 0;
              $839 = $835 + $838 | 0;
              $840 = $839 >>> 0 > $581 >>> 0;
              if ($840) {
                break;
              }
            }
            $841 = $$0$i$i$i + 8 | 0;
            $842 = HEAP322[$841 >> 2] | 0;
            $$0$i$i$i = $842;
          }
          $843 = $839 + -47 | 0;
          $844 = $843 + 8 | 0;
          $845 = $844;
          $846 = $845 & 7;
          $847 = ($846 | 0) == 0;
          $848 = 0 - $845 | 0;
          $849 = $848 & 7;
          $850 = $847 ? 0 : $849;
          $851 = $843 + $850 | 0;
          $852 = $581 + 16 | 0;
          $853 = $851 >>> 0 < $852 >>> 0;
          $854 = $853 ? $581 : $851;
          $855 = $854 + 8 | 0;
          $856 = $854 + 24 | 0;
          $857 = $$723947$i + -40 | 0;
          $858 = $$748$i + 8 | 0;
          $859 = $858;
          $860 = $859 & 7;
          $861 = ($860 | 0) == 0;
          $862 = 0 - $859 | 0;
          $863 = $862 & 7;
          $864 = $861 ? 0 : $863;
          $865 = $$748$i + $864 | 0;
          $866 = $857 - $864 | 0;
          HEAP322[38408 >> 2] = $865;
          HEAP322[38396 >> 2] = $866;
          $867 = $866 | 1;
          $868 = $865 + 4 | 0;
          HEAP322[$868 >> 2] = $867;
          $869 = $865 + $866 | 0;
          $870 = $869 + 4 | 0;
          HEAP322[$870 >> 2] = 40;
          $871 = HEAP322[38872 >> 2] | 0;
          HEAP322[38412 >> 2] = $871;
          $872 = $854 + 4 | 0;
          HEAP322[$872 >> 2] = 27;
          HEAP322[$855 >> 2] = HEAP322[38832 >> 2] | 0;
          HEAP322[$855 + 4 >> 2] = HEAP322[38832 + 4 >> 2] | 0;
          HEAP322[$855 + 8 >> 2] = HEAP322[38832 + 8 >> 2] | 0;
          HEAP322[$855 + 12 >> 2] = HEAP322[38832 + 12 >> 2] | 0;
          HEAP322[38832 >> 2] = $$748$i;
          HEAP322[38836 >> 2] = $$723947$i;
          HEAP322[38844 >> 2] = 0;
          HEAP322[38840 >> 2] = $855;
          $874 = $856;
          while (1) {
            $873 = $874 + 4 | 0;
            HEAP322[$873 >> 2] = 7;
            $875 = $874 + 8 | 0;
            $876 = $875 >>> 0 < $839 >>> 0;
            if ($876) {
              $874 = $873;
            } else {
              break;
            }
          }
          $877 = ($854 | 0) == ($581 | 0);
          if (!$877) {
            $878 = $854;
            $879 = $581;
            $880 = $878 - $879 | 0;
            $881 = HEAP322[$872 >> 2] | 0;
            $882 = $881 & -2;
            HEAP322[$872 >> 2] = $882;
            $883 = $880 | 1;
            $884 = $581 + 4 | 0;
            HEAP322[$884 >> 2] = $883;
            HEAP322[$854 >> 2] = $880;
            $885 = $880 >>> 3;
            $886 = $880 >>> 0 < 256;
            if ($886) {
              $887 = $885 << 1;
              $888 = 38424 + ($887 << 2) | 0;
              $889 = HEAP322[9596] | 0;
              $890 = 1 << $885;
              $891 = $889 & $890;
              $892 = ($891 | 0) == 0;
              if ($892) {
                $893 = $889 | $890;
                HEAP322[9596] = $893;
                $$pre$i$i = $888 + 8 | 0;
                $$0206$i$i = $888;
                $$pre$phi$i$iZ2D = $$pre$i$i;
              } else {
                $894 = $888 + 8 | 0;
                $895 = HEAP322[$894 >> 2] | 0;
                $$0206$i$i = $895;
                $$pre$phi$i$iZ2D = $894;
              }
              HEAP322[$$pre$phi$i$iZ2D >> 2] = $581;
              $896 = $$0206$i$i + 12 | 0;
              HEAP322[$896 >> 2] = $581;
              $897 = $581 + 8 | 0;
              HEAP322[$897 >> 2] = $$0206$i$i;
              $898 = $581 + 12 | 0;
              HEAP322[$898 >> 2] = $888;
              break;
            }
            $899 = $880 >>> 8;
            $900 = ($899 | 0) == 0;
            if ($900) {
              $$0207$i$i = 0;
            } else {
              $901 = $880 >>> 0 > 16777215;
              if ($901) {
                $$0207$i$i = 31;
              } else {
                $902 = $899 + 1048320 | 0;
                $903 = $902 >>> 16;
                $904 = $903 & 8;
                $905 = $899 << $904;
                $906 = $905 + 520192 | 0;
                $907 = $906 >>> 16;
                $908 = $907 & 4;
                $909 = $908 | $904;
                $910 = $905 << $908;
                $911 = $910 + 245760 | 0;
                $912 = $911 >>> 16;
                $913 = $912 & 2;
                $914 = $909 | $913;
                $915 = 14 - $914 | 0;
                $916 = $910 << $913;
                $917 = $916 >>> 15;
                $918 = $915 + $917 | 0;
                $919 = $918 << 1;
                $920 = $918 + 7 | 0;
                $921 = $880 >>> $920;
                $922 = $921 & 1;
                $923 = $922 | $919;
                $$0207$i$i = $923;
              }
            }
            $924 = 38688 + ($$0207$i$i << 2) | 0;
            $925 = $581 + 28 | 0;
            HEAP322[$925 >> 2] = $$0207$i$i;
            $926 = $581 + 20 | 0;
            HEAP322[$926 >> 2] = 0;
            HEAP322[$852 >> 2] = 0;
            $927 = HEAP322[38388 >> 2] | 0;
            $928 = 1 << $$0207$i$i;
            $929 = $927 & $928;
            $930 = ($929 | 0) == 0;
            if ($930) {
              $931 = $927 | $928;
              HEAP322[38388 >> 2] = $931;
              HEAP322[$924 >> 2] = $581;
              $932 = $581 + 24 | 0;
              HEAP322[$932 >> 2] = $924;
              $933 = $581 + 12 | 0;
              HEAP322[$933 >> 2] = $581;
              $934 = $581 + 8 | 0;
              HEAP322[$934 >> 2] = $581;
              break;
            }
            $935 = HEAP322[$924 >> 2] | 0;
            $936 = ($$0207$i$i | 0) == 31;
            $937 = $$0207$i$i >>> 1;
            $938 = 25 - $937 | 0;
            $939 = $936 ? 0 : $938;
            $940 = $880 << $939;
            $$0201$i$i = $940;
            $$0202$i$i = $935;
            while (1) {
              $941 = $$0202$i$i + 4 | 0;
              $942 = HEAP322[$941 >> 2] | 0;
              $943 = $942 & -8;
              $944 = ($943 | 0) == ($880 | 0);
              if ($944) {
                label = 216;
                break;
              }
              $945 = $$0201$i$i >>> 31;
              $946 = ($$0202$i$i + 16 | 0) + ($945 << 2) | 0;
              $947 = $$0201$i$i << 1;
              $948 = HEAP322[$946 >> 2] | 0;
              $949 = ($948 | 0) == (0 | 0);
              if ($949) {
                label = 215;
                break;
              } else {
                $$0201$i$i = $947;
                $$0202$i$i = $948;
              }
            }
            if ((label | 0) == 215) {
              HEAP322[$946 >> 2] = $581;
              $950 = $581 + 24 | 0;
              HEAP322[$950 >> 2] = $$0202$i$i;
              $951 = $581 + 12 | 0;
              HEAP322[$951 >> 2] = $581;
              $952 = $581 + 8 | 0;
              HEAP322[$952 >> 2] = $581;
              break;
            } else if ((label | 0) == 216) {
              $953 = $$0202$i$i + 8 | 0;
              $954 = HEAP322[$953 >> 2] | 0;
              $955 = $954 + 12 | 0;
              HEAP322[$955 >> 2] = $581;
              HEAP322[$953 >> 2] = $581;
              $956 = $581 + 8 | 0;
              HEAP322[$956 >> 2] = $954;
              $957 = $581 + 12 | 0;
              HEAP322[$957 >> 2] = $$0202$i$i;
              $958 = $581 + 24 | 0;
              HEAP322[$958 >> 2] = 0;
              break;
            }
          }
        }
      } while (0);
      $960 = HEAP322[38396 >> 2] | 0;
      $961 = $960 >>> 0 > $$0192 >>> 0;
      if ($961) {
        $962 = $960 - $$0192 | 0;
        HEAP322[38396 >> 2] = $962;
        $963 = HEAP322[38408 >> 2] | 0;
        $964 = $963 + $$0192 | 0;
        HEAP322[38408 >> 2] = $964;
        $965 = $962 | 1;
        $966 = $964 + 4 | 0;
        HEAP322[$966 >> 2] = $965;
        $967 = $$0192 | 3;
        $968 = $963 + 4 | 0;
        HEAP322[$968 >> 2] = $967;
        $969 = $963 + 8 | 0;
        $$0 = $969;
        STACKTOP2 = sp;
        return $$0 | 0;
      }
    }
    $970 = ___errno_location() | 0;
    HEAP322[$970 >> 2] = 12;
    $$0 = 0;
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function _free2($0) {
    $0 = $0 | 0;
    var $$0195$i = 0, $$0195$in$i = 0, $$0348 = 0, $$0349 = 0, $$0361 = 0, $$0368 = 0, $$1 = 0, $$1347 = 0, $$1352 = 0, $$1355 = 0, $$1363 = 0, $$1367 = 0, $$2 = 0, $$3 = 0, $$3365 = 0, $$pre = 0, $$pre$phiZ2D = 0, $$sink3 = 0, $$sink5 = 0, $1 = 0;
    var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
    var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
    var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
    var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
    var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
    var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0;
    var $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0;
    var $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0;
    var $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
    var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
    var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
    var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
    var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond374 = 0, $cond375 = 0, $not$ = 0, $not$370 = 0;
    var label = 0;
    $1 = ($0 | 0) == (0 | 0);
    if ($1) {
      return;
    }
    $2 = $0 + -8 | 0;
    $3 = HEAP322[38400 >> 2] | 0;
    $4 = $0 + -4 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = $5 & -8;
    $7 = $2 + $6 | 0;
    $8 = $5 & 1;
    $9 = ($8 | 0) == 0;
    do {
      if ($9) {
        $10 = HEAP322[$2 >> 2] | 0;
        $11 = $5 & 3;
        $12 = ($11 | 0) == 0;
        if ($12) {
          return;
        }
        $13 = 0 - $10 | 0;
        $14 = $2 + $13 | 0;
        $15 = $10 + $6 | 0;
        $16 = $14 >>> 0 < $3 >>> 0;
        if ($16) {
          return;
        }
        $17 = HEAP322[38404 >> 2] | 0;
        $18 = ($14 | 0) == ($17 | 0);
        if ($18) {
          $78 = $7 + 4 | 0;
          $79 = HEAP322[$78 >> 2] | 0;
          $80 = $79 & 3;
          $81 = ($80 | 0) == 3;
          if (!$81) {
            $$1 = $14;
            $$1347 = $15;
            $87 = $14;
            break;
          }
          $82 = $14 + $15 | 0;
          $83 = $14 + 4 | 0;
          $84 = $15 | 1;
          $85 = $79 & -2;
          HEAP322[38392 >> 2] = $15;
          HEAP322[$78 >> 2] = $85;
          HEAP322[$83 >> 2] = $84;
          HEAP322[$82 >> 2] = $15;
          return;
        }
        $19 = $10 >>> 3;
        $20 = $10 >>> 0 < 256;
        if ($20) {
          $21 = $14 + 8 | 0;
          $22 = HEAP322[$21 >> 2] | 0;
          $23 = $14 + 12 | 0;
          $24 = HEAP322[$23 >> 2] | 0;
          $25 = ($24 | 0) == ($22 | 0);
          if ($25) {
            $26 = 1 << $19;
            $27 = $26 ^ -1;
            $28 = HEAP322[9596] | 0;
            $29 = $28 & $27;
            HEAP322[9596] = $29;
            $$1 = $14;
            $$1347 = $15;
            $87 = $14;
            break;
          } else {
            $30 = $22 + 12 | 0;
            HEAP322[$30 >> 2] = $24;
            $31 = $24 + 8 | 0;
            HEAP322[$31 >> 2] = $22;
            $$1 = $14;
            $$1347 = $15;
            $87 = $14;
            break;
          }
        }
        $32 = $14 + 24 | 0;
        $33 = HEAP322[$32 >> 2] | 0;
        $34 = $14 + 12 | 0;
        $35 = HEAP322[$34 >> 2] | 0;
        $36 = ($35 | 0) == ($14 | 0);
        do {
          if ($36) {
            $41 = $14 + 16 | 0;
            $42 = $41 + 4 | 0;
            $43 = HEAP322[$42 >> 2] | 0;
            $44 = ($43 | 0) == (0 | 0);
            if ($44) {
              $45 = HEAP322[$41 >> 2] | 0;
              $46 = ($45 | 0) == (0 | 0);
              if ($46) {
                $$3 = 0;
                break;
              } else {
                $$1352 = $45;
                $$1355 = $41;
              }
            } else {
              $$1352 = $43;
              $$1355 = $42;
            }
            while (1) {
              $47 = $$1352 + 20 | 0;
              $48 = HEAP322[$47 >> 2] | 0;
              $49 = ($48 | 0) == (0 | 0);
              if (!$49) {
                $$1352 = $48;
                $$1355 = $47;
                continue;
              }
              $50 = $$1352 + 16 | 0;
              $51 = HEAP322[$50 >> 2] | 0;
              $52 = ($51 | 0) == (0 | 0);
              if ($52) {
                break;
              } else {
                $$1352 = $51;
                $$1355 = $50;
              }
            }
            HEAP322[$$1355 >> 2] = 0;
            $$3 = $$1352;
          } else {
            $37 = $14 + 8 | 0;
            $38 = HEAP322[$37 >> 2] | 0;
            $39 = $38 + 12 | 0;
            HEAP322[$39 >> 2] = $35;
            $40 = $35 + 8 | 0;
            HEAP322[$40 >> 2] = $38;
            $$3 = $35;
          }
        } while (0);
        $53 = ($33 | 0) == (0 | 0);
        if ($53) {
          $$1 = $14;
          $$1347 = $15;
          $87 = $14;
        } else {
          $54 = $14 + 28 | 0;
          $55 = HEAP322[$54 >> 2] | 0;
          $56 = 38688 + ($55 << 2) | 0;
          $57 = HEAP322[$56 >> 2] | 0;
          $58 = ($14 | 0) == ($57 | 0);
          if ($58) {
            HEAP322[$56 >> 2] = $$3;
            $cond374 = ($$3 | 0) == (0 | 0);
            if ($cond374) {
              $59 = 1 << $55;
              $60 = $59 ^ -1;
              $61 = HEAP322[38388 >> 2] | 0;
              $62 = $61 & $60;
              HEAP322[38388 >> 2] = $62;
              $$1 = $14;
              $$1347 = $15;
              $87 = $14;
              break;
            }
          } else {
            $63 = $33 + 16 | 0;
            $64 = HEAP322[$63 >> 2] | 0;
            $not$370 = ($64 | 0) != ($14 | 0);
            $$sink3 = $not$370 & 1;
            $65 = ($33 + 16 | 0) + ($$sink3 << 2) | 0;
            HEAP322[$65 >> 2] = $$3;
            $66 = ($$3 | 0) == (0 | 0);
            if ($66) {
              $$1 = $14;
              $$1347 = $15;
              $87 = $14;
              break;
            }
          }
          $67 = $$3 + 24 | 0;
          HEAP322[$67 >> 2] = $33;
          $68 = $14 + 16 | 0;
          $69 = HEAP322[$68 >> 2] | 0;
          $70 = ($69 | 0) == (0 | 0);
          if (!$70) {
            $71 = $$3 + 16 | 0;
            HEAP322[$71 >> 2] = $69;
            $72 = $69 + 24 | 0;
            HEAP322[$72 >> 2] = $$3;
          }
          $73 = $68 + 4 | 0;
          $74 = HEAP322[$73 >> 2] | 0;
          $75 = ($74 | 0) == (0 | 0);
          if ($75) {
            $$1 = $14;
            $$1347 = $15;
            $87 = $14;
          } else {
            $76 = $$3 + 20 | 0;
            HEAP322[$76 >> 2] = $74;
            $77 = $74 + 24 | 0;
            HEAP322[$77 >> 2] = $$3;
            $$1 = $14;
            $$1347 = $15;
            $87 = $14;
          }
        }
      } else {
        $$1 = $2;
        $$1347 = $6;
        $87 = $2;
      }
    } while (0);
    $86 = $87 >>> 0 < $7 >>> 0;
    if (!$86) {
      return;
    }
    $88 = $7 + 4 | 0;
    $89 = HEAP322[$88 >> 2] | 0;
    $90 = $89 & 1;
    $91 = ($90 | 0) == 0;
    if ($91) {
      return;
    }
    $92 = $89 & 2;
    $93 = ($92 | 0) == 0;
    if ($93) {
      $94 = HEAP322[38408 >> 2] | 0;
      $95 = ($7 | 0) == ($94 | 0);
      $96 = HEAP322[38404 >> 2] | 0;
      if ($95) {
        $97 = HEAP322[38396 >> 2] | 0;
        $98 = $97 + $$1347 | 0;
        HEAP322[38396 >> 2] = $98;
        HEAP322[38408 >> 2] = $$1;
        $99 = $98 | 1;
        $100 = $$1 + 4 | 0;
        HEAP322[$100 >> 2] = $99;
        $101 = ($$1 | 0) == ($96 | 0);
        if (!$101) {
          return;
        }
        HEAP322[38404 >> 2] = 0;
        HEAP322[38392 >> 2] = 0;
        return;
      }
      $102 = ($7 | 0) == ($96 | 0);
      if ($102) {
        $103 = HEAP322[38392 >> 2] | 0;
        $104 = $103 + $$1347 | 0;
        HEAP322[38392 >> 2] = $104;
        HEAP322[38404 >> 2] = $87;
        $105 = $104 | 1;
        $106 = $$1 + 4 | 0;
        HEAP322[$106 >> 2] = $105;
        $107 = $87 + $104 | 0;
        HEAP322[$107 >> 2] = $104;
        return;
      }
      $108 = $89 & -8;
      $109 = $108 + $$1347 | 0;
      $110 = $89 >>> 3;
      $111 = $89 >>> 0 < 256;
      do {
        if ($111) {
          $112 = $7 + 8 | 0;
          $113 = HEAP322[$112 >> 2] | 0;
          $114 = $7 + 12 | 0;
          $115 = HEAP322[$114 >> 2] | 0;
          $116 = ($115 | 0) == ($113 | 0);
          if ($116) {
            $117 = 1 << $110;
            $118 = $117 ^ -1;
            $119 = HEAP322[9596] | 0;
            $120 = $119 & $118;
            HEAP322[9596] = $120;
            break;
          } else {
            $121 = $113 + 12 | 0;
            HEAP322[$121 >> 2] = $115;
            $122 = $115 + 8 | 0;
            HEAP322[$122 >> 2] = $113;
            break;
          }
        } else {
          $123 = $7 + 24 | 0;
          $124 = HEAP322[$123 >> 2] | 0;
          $125 = $7 + 12 | 0;
          $126 = HEAP322[$125 >> 2] | 0;
          $127 = ($126 | 0) == ($7 | 0);
          do {
            if ($127) {
              $132 = $7 + 16 | 0;
              $133 = $132 + 4 | 0;
              $134 = HEAP322[$133 >> 2] | 0;
              $135 = ($134 | 0) == (0 | 0);
              if ($135) {
                $136 = HEAP322[$132 >> 2] | 0;
                $137 = ($136 | 0) == (0 | 0);
                if ($137) {
                  $$3365 = 0;
                  break;
                } else {
                  $$1363 = $136;
                  $$1367 = $132;
                }
              } else {
                $$1363 = $134;
                $$1367 = $133;
              }
              while (1) {
                $138 = $$1363 + 20 | 0;
                $139 = HEAP322[$138 >> 2] | 0;
                $140 = ($139 | 0) == (0 | 0);
                if (!$140) {
                  $$1363 = $139;
                  $$1367 = $138;
                  continue;
                }
                $141 = $$1363 + 16 | 0;
                $142 = HEAP322[$141 >> 2] | 0;
                $143 = ($142 | 0) == (0 | 0);
                if ($143) {
                  break;
                } else {
                  $$1363 = $142;
                  $$1367 = $141;
                }
              }
              HEAP322[$$1367 >> 2] = 0;
              $$3365 = $$1363;
            } else {
              $128 = $7 + 8 | 0;
              $129 = HEAP322[$128 >> 2] | 0;
              $130 = $129 + 12 | 0;
              HEAP322[$130 >> 2] = $126;
              $131 = $126 + 8 | 0;
              HEAP322[$131 >> 2] = $129;
              $$3365 = $126;
            }
          } while (0);
          $144 = ($124 | 0) == (0 | 0);
          if (!$144) {
            $145 = $7 + 28 | 0;
            $146 = HEAP322[$145 >> 2] | 0;
            $147 = 38688 + ($146 << 2) | 0;
            $148 = HEAP322[$147 >> 2] | 0;
            $149 = ($7 | 0) == ($148 | 0);
            if ($149) {
              HEAP322[$147 >> 2] = $$3365;
              $cond375 = ($$3365 | 0) == (0 | 0);
              if ($cond375) {
                $150 = 1 << $146;
                $151 = $150 ^ -1;
                $152 = HEAP322[38388 >> 2] | 0;
                $153 = $152 & $151;
                HEAP322[38388 >> 2] = $153;
                break;
              }
            } else {
              $154 = $124 + 16 | 0;
              $155 = HEAP322[$154 >> 2] | 0;
              $not$ = ($155 | 0) != ($7 | 0);
              $$sink5 = $not$ & 1;
              $156 = ($124 + 16 | 0) + ($$sink5 << 2) | 0;
              HEAP322[$156 >> 2] = $$3365;
              $157 = ($$3365 | 0) == (0 | 0);
              if ($157) {
                break;
              }
            }
            $158 = $$3365 + 24 | 0;
            HEAP322[$158 >> 2] = $124;
            $159 = $7 + 16 | 0;
            $160 = HEAP322[$159 >> 2] | 0;
            $161 = ($160 | 0) == (0 | 0);
            if (!$161) {
              $162 = $$3365 + 16 | 0;
              HEAP322[$162 >> 2] = $160;
              $163 = $160 + 24 | 0;
              HEAP322[$163 >> 2] = $$3365;
            }
            $164 = $159 + 4 | 0;
            $165 = HEAP322[$164 >> 2] | 0;
            $166 = ($165 | 0) == (0 | 0);
            if (!$166) {
              $167 = $$3365 + 20 | 0;
              HEAP322[$167 >> 2] = $165;
              $168 = $165 + 24 | 0;
              HEAP322[$168 >> 2] = $$3365;
            }
          }
        }
      } while (0);
      $169 = $109 | 1;
      $170 = $$1 + 4 | 0;
      HEAP322[$170 >> 2] = $169;
      $171 = $87 + $109 | 0;
      HEAP322[$171 >> 2] = $109;
      $172 = HEAP322[38404 >> 2] | 0;
      $173 = ($$1 | 0) == ($172 | 0);
      if ($173) {
        HEAP322[38392 >> 2] = $109;
        return;
      } else {
        $$2 = $109;
      }
    } else {
      $174 = $89 & -2;
      HEAP322[$88 >> 2] = $174;
      $175 = $$1347 | 1;
      $176 = $$1 + 4 | 0;
      HEAP322[$176 >> 2] = $175;
      $177 = $87 + $$1347 | 0;
      HEAP322[$177 >> 2] = $$1347;
      $$2 = $$1347;
    }
    $178 = $$2 >>> 3;
    $179 = $$2 >>> 0 < 256;
    if ($179) {
      $180 = $178 << 1;
      $181 = 38424 + ($180 << 2) | 0;
      $182 = HEAP322[9596] | 0;
      $183 = 1 << $178;
      $184 = $182 & $183;
      $185 = ($184 | 0) == 0;
      if ($185) {
        $186 = $182 | $183;
        HEAP322[9596] = $186;
        $$pre = $181 + 8 | 0;
        $$0368 = $181;
        $$pre$phiZ2D = $$pre;
      } else {
        $187 = $181 + 8 | 0;
        $188 = HEAP322[$187 >> 2] | 0;
        $$0368 = $188;
        $$pre$phiZ2D = $187;
      }
      HEAP322[$$pre$phiZ2D >> 2] = $$1;
      $189 = $$0368 + 12 | 0;
      HEAP322[$189 >> 2] = $$1;
      $190 = $$1 + 8 | 0;
      HEAP322[$190 >> 2] = $$0368;
      $191 = $$1 + 12 | 0;
      HEAP322[$191 >> 2] = $181;
      return;
    }
    $192 = $$2 >>> 8;
    $193 = ($192 | 0) == 0;
    if ($193) {
      $$0361 = 0;
    } else {
      $194 = $$2 >>> 0 > 16777215;
      if ($194) {
        $$0361 = 31;
      } else {
        $195 = $192 + 1048320 | 0;
        $196 = $195 >>> 16;
        $197 = $196 & 8;
        $198 = $192 << $197;
        $199 = $198 + 520192 | 0;
        $200 = $199 >>> 16;
        $201 = $200 & 4;
        $202 = $201 | $197;
        $203 = $198 << $201;
        $204 = $203 + 245760 | 0;
        $205 = $204 >>> 16;
        $206 = $205 & 2;
        $207 = $202 | $206;
        $208 = 14 - $207 | 0;
        $209 = $203 << $206;
        $210 = $209 >>> 15;
        $211 = $208 + $210 | 0;
        $212 = $211 << 1;
        $213 = $211 + 7 | 0;
        $214 = $$2 >>> $213;
        $215 = $214 & 1;
        $216 = $215 | $212;
        $$0361 = $216;
      }
    }
    $217 = 38688 + ($$0361 << 2) | 0;
    $218 = $$1 + 28 | 0;
    HEAP322[$218 >> 2] = $$0361;
    $219 = $$1 + 16 | 0;
    $220 = $$1 + 20 | 0;
    HEAP322[$220 >> 2] = 0;
    HEAP322[$219 >> 2] = 0;
    $221 = HEAP322[38388 >> 2] | 0;
    $222 = 1 << $$0361;
    $223 = $221 & $222;
    $224 = ($223 | 0) == 0;
    do {
      if ($224) {
        $225 = $221 | $222;
        HEAP322[38388 >> 2] = $225;
        HEAP322[$217 >> 2] = $$1;
        $226 = $$1 + 24 | 0;
        HEAP322[$226 >> 2] = $217;
        $227 = $$1 + 12 | 0;
        HEAP322[$227 >> 2] = $$1;
        $228 = $$1 + 8 | 0;
        HEAP322[$228 >> 2] = $$1;
      } else {
        $229 = HEAP322[$217 >> 2] | 0;
        $230 = ($$0361 | 0) == 31;
        $231 = $$0361 >>> 1;
        $232 = 25 - $231 | 0;
        $233 = $230 ? 0 : $232;
        $234 = $$2 << $233;
        $$0348 = $234;
        $$0349 = $229;
        while (1) {
          $235 = $$0349 + 4 | 0;
          $236 = HEAP322[$235 >> 2] | 0;
          $237 = $236 & -8;
          $238 = ($237 | 0) == ($$2 | 0);
          if ($238) {
            label = 73;
            break;
          }
          $239 = $$0348 >>> 31;
          $240 = ($$0349 + 16 | 0) + ($239 << 2) | 0;
          $241 = $$0348 << 1;
          $242 = HEAP322[$240 >> 2] | 0;
          $243 = ($242 | 0) == (0 | 0);
          if ($243) {
            label = 72;
            break;
          } else {
            $$0348 = $241;
            $$0349 = $242;
          }
        }
        if ((label | 0) == 72) {
          HEAP322[$240 >> 2] = $$1;
          $244 = $$1 + 24 | 0;
          HEAP322[$244 >> 2] = $$0349;
          $245 = $$1 + 12 | 0;
          HEAP322[$245 >> 2] = $$1;
          $246 = $$1 + 8 | 0;
          HEAP322[$246 >> 2] = $$1;
          break;
        } else if ((label | 0) == 73) {
          $247 = $$0349 + 8 | 0;
          $248 = HEAP322[$247 >> 2] | 0;
          $249 = $248 + 12 | 0;
          HEAP322[$249 >> 2] = $$1;
          HEAP322[$247 >> 2] = $$1;
          $250 = $$1 + 8 | 0;
          HEAP322[$250 >> 2] = $248;
          $251 = $$1 + 12 | 0;
          HEAP322[$251 >> 2] = $$0349;
          $252 = $$1 + 24 | 0;
          HEAP322[$252 >> 2] = 0;
          break;
        }
      }
    } while (0);
    $253 = HEAP322[38416 >> 2] | 0;
    $254 = $253 + -1 | 0;
    HEAP322[38416 >> 2] = $254;
    $255 = ($254 | 0) == 0;
    if ($255) {
      $$0195$in$i = 38840;
    } else {
      return;
    }
    while (1) {
      $$0195$i = HEAP322[$$0195$in$i >> 2] | 0;
      $256 = ($$0195$i | 0) == (0 | 0);
      $257 = $$0195$i + 8 | 0;
      if ($256) {
        break;
      } else {
        $$0195$in$i = $257;
      }
    }
    HEAP322[38416 >> 2] = -1;
    return;
  }
  function _realloc($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0, $5 = 0;
    var $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $2 = ($0 | 0) == (0 | 0);
    if ($2) {
      $3 = _malloc2($1) | 0;
      $$1 = $3;
      return $$1 | 0;
    }
    $4 = $1 >>> 0 > 4294967231;
    if ($4) {
      $5 = ___errno_location() | 0;
      HEAP322[$5 >> 2] = 12;
      $$1 = 0;
      return $$1 | 0;
    }
    $6 = $1 >>> 0 < 11;
    $7 = $1 + 11 | 0;
    $8 = $7 & -8;
    $9 = $6 ? 16 : $8;
    $10 = $0 + -8 | 0;
    $11 = _try_realloc_chunk($10, $9) | 0;
    $12 = ($11 | 0) == (0 | 0);
    if (!$12) {
      $13 = $11 + 8 | 0;
      $$1 = $13;
      return $$1 | 0;
    }
    $14 = _malloc2($1) | 0;
    $15 = ($14 | 0) == (0 | 0);
    if ($15) {
      $$1 = 0;
      return $$1 | 0;
    }
    $16 = $0 + -4 | 0;
    $17 = HEAP322[$16 >> 2] | 0;
    $18 = $17 & -8;
    $19 = $17 & 3;
    $20 = ($19 | 0) == 0;
    $21 = $20 ? 8 : 4;
    $22 = $18 - $21 | 0;
    $23 = $22 >>> 0 < $1 >>> 0;
    $24 = $23 ? $22 : $1;
    _memcpy($14 | 0, $0 | 0, $24 | 0) | 0;
    _free2($0);
    $$1 = $14;
    return $$1 | 0;
  }
  function _try_realloc_chunk($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$1246 = 0, $$1249 = 0, $$2 = 0, $$3 = 0, $$sink1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0;
    var $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0;
    var $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $15 = 0, $16 = 0, $17 = 0;
    var $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
    var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
    var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
    var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
    var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $cond = 0, $not$ = 0, $storemerge = 0, $storemerge1 = 0;
    $2 = $0 + 4 | 0;
    $3 = HEAP322[$2 >> 2] | 0;
    $4 = $3 & -8;
    $5 = $0 + $4 | 0;
    $6 = $3 & 3;
    $7 = ($6 | 0) == 0;
    if ($7) {
      $8 = $1 >>> 0 < 256;
      if ($8) {
        $$2 = 0;
        return $$2 | 0;
      }
      $9 = $1 + 4 | 0;
      $10 = $4 >>> 0 < $9 >>> 0;
      if (!$10) {
        $11 = $4 - $1 | 0;
        $12 = HEAP322[38864 >> 2] | 0;
        $13 = $12 << 1;
        $14 = $11 >>> 0 > $13 >>> 0;
        if (!$14) {
          $$2 = $0;
          return $$2 | 0;
        }
      }
      $$2 = 0;
      return $$2 | 0;
    }
    $15 = $4 >>> 0 < $1 >>> 0;
    if (!$15) {
      $16 = $4 - $1 | 0;
      $17 = $16 >>> 0 > 15;
      if (!$17) {
        $$2 = $0;
        return $$2 | 0;
      }
      $18 = $0 + $1 | 0;
      $19 = $3 & 1;
      $20 = $19 | $1;
      $21 = $20 | 2;
      HEAP322[$2 >> 2] = $21;
      $22 = $18 + 4 | 0;
      $23 = $16 | 3;
      HEAP322[$22 >> 2] = $23;
      $24 = $18 + $16 | 0;
      $25 = $24 + 4 | 0;
      $26 = HEAP322[$25 >> 2] | 0;
      $27 = $26 | 1;
      HEAP322[$25 >> 2] = $27;
      _dispose_chunk($18, $16);
      $$2 = $0;
      return $$2 | 0;
    }
    $28 = HEAP322[38408 >> 2] | 0;
    $29 = ($5 | 0) == ($28 | 0);
    if ($29) {
      $30 = HEAP322[38396 >> 2] | 0;
      $31 = $30 + $4 | 0;
      $32 = $31 >>> 0 > $1 >>> 0;
      $33 = $31 - $1 | 0;
      $34 = $0 + $1 | 0;
      if (!$32) {
        $$2 = 0;
        return $$2 | 0;
      }
      $35 = $33 | 1;
      $36 = $34 + 4 | 0;
      $37 = $3 & 1;
      $38 = $37 | $1;
      $39 = $38 | 2;
      HEAP322[$2 >> 2] = $39;
      HEAP322[$36 >> 2] = $35;
      HEAP322[38408 >> 2] = $34;
      HEAP322[38396 >> 2] = $33;
      $$2 = $0;
      return $$2 | 0;
    }
    $40 = HEAP322[38404 >> 2] | 0;
    $41 = ($5 | 0) == ($40 | 0);
    if ($41) {
      $42 = HEAP322[38392 >> 2] | 0;
      $43 = $42 + $4 | 0;
      $44 = $43 >>> 0 < $1 >>> 0;
      if ($44) {
        $$2 = 0;
        return $$2 | 0;
      }
      $45 = $43 - $1 | 0;
      $46 = $45 >>> 0 > 15;
      $47 = $3 & 1;
      if ($46) {
        $48 = $0 + $1 | 0;
        $49 = $48 + $45 | 0;
        $50 = $47 | $1;
        $51 = $50 | 2;
        HEAP322[$2 >> 2] = $51;
        $52 = $48 + 4 | 0;
        $53 = $45 | 1;
        HEAP322[$52 >> 2] = $53;
        HEAP322[$49 >> 2] = $45;
        $54 = $49 + 4 | 0;
        $55 = HEAP322[$54 >> 2] | 0;
        $56 = $55 & -2;
        HEAP322[$54 >> 2] = $56;
        $storemerge = $48;
        $storemerge1 = $45;
      } else {
        $57 = $47 | $43;
        $58 = $57 | 2;
        HEAP322[$2 >> 2] = $58;
        $59 = $0 + $43 | 0;
        $60 = $59 + 4 | 0;
        $61 = HEAP322[$60 >> 2] | 0;
        $62 = $61 | 1;
        HEAP322[$60 >> 2] = $62;
        $storemerge = 0;
        $storemerge1 = 0;
      }
      HEAP322[38392 >> 2] = $storemerge1;
      HEAP322[38404 >> 2] = $storemerge;
      $$2 = $0;
      return $$2 | 0;
    }
    $63 = $5 + 4 | 0;
    $64 = HEAP322[$63 >> 2] | 0;
    $65 = $64 & 2;
    $66 = ($65 | 0) == 0;
    if (!$66) {
      $$2 = 0;
      return $$2 | 0;
    }
    $67 = $64 & -8;
    $68 = $67 + $4 | 0;
    $69 = $68 >>> 0 < $1 >>> 0;
    if ($69) {
      $$2 = 0;
      return $$2 | 0;
    }
    $70 = $68 - $1 | 0;
    $71 = $64 >>> 3;
    $72 = $64 >>> 0 < 256;
    do {
      if ($72) {
        $73 = $5 + 8 | 0;
        $74 = HEAP322[$73 >> 2] | 0;
        $75 = $5 + 12 | 0;
        $76 = HEAP322[$75 >> 2] | 0;
        $77 = ($76 | 0) == ($74 | 0);
        if ($77) {
          $78 = 1 << $71;
          $79 = $78 ^ -1;
          $80 = HEAP322[9596] | 0;
          $81 = $80 & $79;
          HEAP322[9596] = $81;
          break;
        } else {
          $82 = $74 + 12 | 0;
          HEAP322[$82 >> 2] = $76;
          $83 = $76 + 8 | 0;
          HEAP322[$83 >> 2] = $74;
          break;
        }
      } else {
        $84 = $5 + 24 | 0;
        $85 = HEAP322[$84 >> 2] | 0;
        $86 = $5 + 12 | 0;
        $87 = HEAP322[$86 >> 2] | 0;
        $88 = ($87 | 0) == ($5 | 0);
        do {
          if ($88) {
            $93 = $5 + 16 | 0;
            $94 = $93 + 4 | 0;
            $95 = HEAP322[$94 >> 2] | 0;
            $96 = ($95 | 0) == (0 | 0);
            if ($96) {
              $97 = HEAP322[$93 >> 2] | 0;
              $98 = ($97 | 0) == (0 | 0);
              if ($98) {
                $$3 = 0;
                break;
              } else {
                $$1246 = $97;
                $$1249 = $93;
              }
            } else {
              $$1246 = $95;
              $$1249 = $94;
            }
            while (1) {
              $99 = $$1246 + 20 | 0;
              $100 = HEAP322[$99 >> 2] | 0;
              $101 = ($100 | 0) == (0 | 0);
              if (!$101) {
                $$1246 = $100;
                $$1249 = $99;
                continue;
              }
              $102 = $$1246 + 16 | 0;
              $103 = HEAP322[$102 >> 2] | 0;
              $104 = ($103 | 0) == (0 | 0);
              if ($104) {
                break;
              } else {
                $$1246 = $103;
                $$1249 = $102;
              }
            }
            HEAP322[$$1249 >> 2] = 0;
            $$3 = $$1246;
          } else {
            $89 = $5 + 8 | 0;
            $90 = HEAP322[$89 >> 2] | 0;
            $91 = $90 + 12 | 0;
            HEAP322[$91 >> 2] = $87;
            $92 = $87 + 8 | 0;
            HEAP322[$92 >> 2] = $90;
            $$3 = $87;
          }
        } while (0);
        $105 = ($85 | 0) == (0 | 0);
        if (!$105) {
          $106 = $5 + 28 | 0;
          $107 = HEAP322[$106 >> 2] | 0;
          $108 = 38688 + ($107 << 2) | 0;
          $109 = HEAP322[$108 >> 2] | 0;
          $110 = ($5 | 0) == ($109 | 0);
          if ($110) {
            HEAP322[$108 >> 2] = $$3;
            $cond = ($$3 | 0) == (0 | 0);
            if ($cond) {
              $111 = 1 << $107;
              $112 = $111 ^ -1;
              $113 = HEAP322[38388 >> 2] | 0;
              $114 = $113 & $112;
              HEAP322[38388 >> 2] = $114;
              break;
            }
          } else {
            $115 = $85 + 16 | 0;
            $116 = HEAP322[$115 >> 2] | 0;
            $not$ = ($116 | 0) != ($5 | 0);
            $$sink1 = $not$ & 1;
            $117 = ($85 + 16 | 0) + ($$sink1 << 2) | 0;
            HEAP322[$117 >> 2] = $$3;
            $118 = ($$3 | 0) == (0 | 0);
            if ($118) {
              break;
            }
          }
          $119 = $$3 + 24 | 0;
          HEAP322[$119 >> 2] = $85;
          $120 = $5 + 16 | 0;
          $121 = HEAP322[$120 >> 2] | 0;
          $122 = ($121 | 0) == (0 | 0);
          if (!$122) {
            $123 = $$3 + 16 | 0;
            HEAP322[$123 >> 2] = $121;
            $124 = $121 + 24 | 0;
            HEAP322[$124 >> 2] = $$3;
          }
          $125 = $120 + 4 | 0;
          $126 = HEAP322[$125 >> 2] | 0;
          $127 = ($126 | 0) == (0 | 0);
          if (!$127) {
            $128 = $$3 + 20 | 0;
            HEAP322[$128 >> 2] = $126;
            $129 = $126 + 24 | 0;
            HEAP322[$129 >> 2] = $$3;
          }
        }
      }
    } while (0);
    $130 = $70 >>> 0 < 16;
    $131 = $3 & 1;
    if ($130) {
      $132 = $68 | $131;
      $133 = $132 | 2;
      HEAP322[$2 >> 2] = $133;
      $134 = $0 + $68 | 0;
      $135 = $134 + 4 | 0;
      $136 = HEAP322[$135 >> 2] | 0;
      $137 = $136 | 1;
      HEAP322[$135 >> 2] = $137;
      $$2 = $0;
      return $$2 | 0;
    } else {
      $138 = $0 + $1 | 0;
      $139 = $131 | $1;
      $140 = $139 | 2;
      HEAP322[$2 >> 2] = $140;
      $141 = $138 + 4 | 0;
      $142 = $70 | 3;
      HEAP322[$141 >> 2] = $142;
      $143 = $138 + $70 | 0;
      $144 = $143 + 4 | 0;
      $145 = HEAP322[$144 >> 2] | 0;
      $146 = $145 | 1;
      HEAP322[$144 >> 2] = $146;
      _dispose_chunk($138, $70);
      $$2 = $0;
      return $$2 | 0;
    }
  }
  function _dispose_chunk($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0366 = 0, $$0367 = 0, $$0378 = 0, $$0385 = 0, $$1 = 0, $$1365 = 0, $$1373 = 0, $$1376 = 0, $$1380 = 0, $$1384 = 0, $$2 = 0, $$3 = 0, $$3382 = 0, $$pre = 0, $$pre$phiZ2D = 0, $$sink2 = 0, $$sink4 = 0, $10 = 0, $100 = 0, $101 = 0;
    var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
    var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
    var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
    var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
    var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
    var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
    var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
    var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $25 = 0, $26 = 0;
    var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
    var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
    var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
    var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
    var $cond = 0, $cond5 = 0, $not$ = 0, $not$1 = 0, label = 0;
    $2 = $0 + $1 | 0;
    $3 = $0 + 4 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = $4 & 1;
    $6 = ($5 | 0) == 0;
    do {
      if ($6) {
        $7 = HEAP322[$0 >> 2] | 0;
        $8 = $4 & 3;
        $9 = ($8 | 0) == 0;
        if ($9) {
          return;
        }
        $10 = 0 - $7 | 0;
        $11 = $0 + $10 | 0;
        $12 = $7 + $1 | 0;
        $13 = HEAP322[38404 >> 2] | 0;
        $14 = ($11 | 0) == ($13 | 0);
        if ($14) {
          $74 = $2 + 4 | 0;
          $75 = HEAP322[$74 >> 2] | 0;
          $76 = $75 & 3;
          $77 = ($76 | 0) == 3;
          if (!$77) {
            $$1 = $11;
            $$1365 = $12;
            break;
          }
          $78 = $11 + $12 | 0;
          $79 = $11 + 4 | 0;
          $80 = $12 | 1;
          $81 = $75 & -2;
          HEAP322[38392 >> 2] = $12;
          HEAP322[$74 >> 2] = $81;
          HEAP322[$79 >> 2] = $80;
          HEAP322[$78 >> 2] = $12;
          return;
        }
        $15 = $7 >>> 3;
        $16 = $7 >>> 0 < 256;
        if ($16) {
          $17 = $11 + 8 | 0;
          $18 = HEAP322[$17 >> 2] | 0;
          $19 = $11 + 12 | 0;
          $20 = HEAP322[$19 >> 2] | 0;
          $21 = ($20 | 0) == ($18 | 0);
          if ($21) {
            $22 = 1 << $15;
            $23 = $22 ^ -1;
            $24 = HEAP322[9596] | 0;
            $25 = $24 & $23;
            HEAP322[9596] = $25;
            $$1 = $11;
            $$1365 = $12;
            break;
          } else {
            $26 = $18 + 12 | 0;
            HEAP322[$26 >> 2] = $20;
            $27 = $20 + 8 | 0;
            HEAP322[$27 >> 2] = $18;
            $$1 = $11;
            $$1365 = $12;
            break;
          }
        }
        $28 = $11 + 24 | 0;
        $29 = HEAP322[$28 >> 2] | 0;
        $30 = $11 + 12 | 0;
        $31 = HEAP322[$30 >> 2] | 0;
        $32 = ($31 | 0) == ($11 | 0);
        do {
          if ($32) {
            $37 = $11 + 16 | 0;
            $38 = $37 + 4 | 0;
            $39 = HEAP322[$38 >> 2] | 0;
            $40 = ($39 | 0) == (0 | 0);
            if ($40) {
              $41 = HEAP322[$37 >> 2] | 0;
              $42 = ($41 | 0) == (0 | 0);
              if ($42) {
                $$3 = 0;
                break;
              } else {
                $$1373 = $41;
                $$1376 = $37;
              }
            } else {
              $$1373 = $39;
              $$1376 = $38;
            }
            while (1) {
              $43 = $$1373 + 20 | 0;
              $44 = HEAP322[$43 >> 2] | 0;
              $45 = ($44 | 0) == (0 | 0);
              if (!$45) {
                $$1373 = $44;
                $$1376 = $43;
                continue;
              }
              $46 = $$1373 + 16 | 0;
              $47 = HEAP322[$46 >> 2] | 0;
              $48 = ($47 | 0) == (0 | 0);
              if ($48) {
                break;
              } else {
                $$1373 = $47;
                $$1376 = $46;
              }
            }
            HEAP322[$$1376 >> 2] = 0;
            $$3 = $$1373;
          } else {
            $33 = $11 + 8 | 0;
            $34 = HEAP322[$33 >> 2] | 0;
            $35 = $34 + 12 | 0;
            HEAP322[$35 >> 2] = $31;
            $36 = $31 + 8 | 0;
            HEAP322[$36 >> 2] = $34;
            $$3 = $31;
          }
        } while (0);
        $49 = ($29 | 0) == (0 | 0);
        if ($49) {
          $$1 = $11;
          $$1365 = $12;
        } else {
          $50 = $11 + 28 | 0;
          $51 = HEAP322[$50 >> 2] | 0;
          $52 = 38688 + ($51 << 2) | 0;
          $53 = HEAP322[$52 >> 2] | 0;
          $54 = ($11 | 0) == ($53 | 0);
          if ($54) {
            HEAP322[$52 >> 2] = $$3;
            $cond = ($$3 | 0) == (0 | 0);
            if ($cond) {
              $55 = 1 << $51;
              $56 = $55 ^ -1;
              $57 = HEAP322[38388 >> 2] | 0;
              $58 = $57 & $56;
              HEAP322[38388 >> 2] = $58;
              $$1 = $11;
              $$1365 = $12;
              break;
            }
          } else {
            $59 = $29 + 16 | 0;
            $60 = HEAP322[$59 >> 2] | 0;
            $not$1 = ($60 | 0) != ($11 | 0);
            $$sink2 = $not$1 & 1;
            $61 = ($29 + 16 | 0) + ($$sink2 << 2) | 0;
            HEAP322[$61 >> 2] = $$3;
            $62 = ($$3 | 0) == (0 | 0);
            if ($62) {
              $$1 = $11;
              $$1365 = $12;
              break;
            }
          }
          $63 = $$3 + 24 | 0;
          HEAP322[$63 >> 2] = $29;
          $64 = $11 + 16 | 0;
          $65 = HEAP322[$64 >> 2] | 0;
          $66 = ($65 | 0) == (0 | 0);
          if (!$66) {
            $67 = $$3 + 16 | 0;
            HEAP322[$67 >> 2] = $65;
            $68 = $65 + 24 | 0;
            HEAP322[$68 >> 2] = $$3;
          }
          $69 = $64 + 4 | 0;
          $70 = HEAP322[$69 >> 2] | 0;
          $71 = ($70 | 0) == (0 | 0);
          if ($71) {
            $$1 = $11;
            $$1365 = $12;
          } else {
            $72 = $$3 + 20 | 0;
            HEAP322[$72 >> 2] = $70;
            $73 = $70 + 24 | 0;
            HEAP322[$73 >> 2] = $$3;
            $$1 = $11;
            $$1365 = $12;
          }
        }
      } else {
        $$1 = $0;
        $$1365 = $1;
      }
    } while (0);
    $82 = $2 + 4 | 0;
    $83 = HEAP322[$82 >> 2] | 0;
    $84 = $83 & 2;
    $85 = ($84 | 0) == 0;
    if ($85) {
      $86 = HEAP322[38408 >> 2] | 0;
      $87 = ($2 | 0) == ($86 | 0);
      $88 = HEAP322[38404 >> 2] | 0;
      if ($87) {
        $89 = HEAP322[38396 >> 2] | 0;
        $90 = $89 + $$1365 | 0;
        HEAP322[38396 >> 2] = $90;
        HEAP322[38408 >> 2] = $$1;
        $91 = $90 | 1;
        $92 = $$1 + 4 | 0;
        HEAP322[$92 >> 2] = $91;
        $93 = ($$1 | 0) == ($88 | 0);
        if (!$93) {
          return;
        }
        HEAP322[38404 >> 2] = 0;
        HEAP322[38392 >> 2] = 0;
        return;
      }
      $94 = ($2 | 0) == ($88 | 0);
      if ($94) {
        $95 = HEAP322[38392 >> 2] | 0;
        $96 = $95 + $$1365 | 0;
        HEAP322[38392 >> 2] = $96;
        HEAP322[38404 >> 2] = $$1;
        $97 = $96 | 1;
        $98 = $$1 + 4 | 0;
        HEAP322[$98 >> 2] = $97;
        $99 = $$1 + $96 | 0;
        HEAP322[$99 >> 2] = $96;
        return;
      }
      $100 = $83 & -8;
      $101 = $100 + $$1365 | 0;
      $102 = $83 >>> 3;
      $103 = $83 >>> 0 < 256;
      do {
        if ($103) {
          $104 = $2 + 8 | 0;
          $105 = HEAP322[$104 >> 2] | 0;
          $106 = $2 + 12 | 0;
          $107 = HEAP322[$106 >> 2] | 0;
          $108 = ($107 | 0) == ($105 | 0);
          if ($108) {
            $109 = 1 << $102;
            $110 = $109 ^ -1;
            $111 = HEAP322[9596] | 0;
            $112 = $111 & $110;
            HEAP322[9596] = $112;
            break;
          } else {
            $113 = $105 + 12 | 0;
            HEAP322[$113 >> 2] = $107;
            $114 = $107 + 8 | 0;
            HEAP322[$114 >> 2] = $105;
            break;
          }
        } else {
          $115 = $2 + 24 | 0;
          $116 = HEAP322[$115 >> 2] | 0;
          $117 = $2 + 12 | 0;
          $118 = HEAP322[$117 >> 2] | 0;
          $119 = ($118 | 0) == ($2 | 0);
          do {
            if ($119) {
              $124 = $2 + 16 | 0;
              $125 = $124 + 4 | 0;
              $126 = HEAP322[$125 >> 2] | 0;
              $127 = ($126 | 0) == (0 | 0);
              if ($127) {
                $128 = HEAP322[$124 >> 2] | 0;
                $129 = ($128 | 0) == (0 | 0);
                if ($129) {
                  $$3382 = 0;
                  break;
                } else {
                  $$1380 = $128;
                  $$1384 = $124;
                }
              } else {
                $$1380 = $126;
                $$1384 = $125;
              }
              while (1) {
                $130 = $$1380 + 20 | 0;
                $131 = HEAP322[$130 >> 2] | 0;
                $132 = ($131 | 0) == (0 | 0);
                if (!$132) {
                  $$1380 = $131;
                  $$1384 = $130;
                  continue;
                }
                $133 = $$1380 + 16 | 0;
                $134 = HEAP322[$133 >> 2] | 0;
                $135 = ($134 | 0) == (0 | 0);
                if ($135) {
                  break;
                } else {
                  $$1380 = $134;
                  $$1384 = $133;
                }
              }
              HEAP322[$$1384 >> 2] = 0;
              $$3382 = $$1380;
            } else {
              $120 = $2 + 8 | 0;
              $121 = HEAP322[$120 >> 2] | 0;
              $122 = $121 + 12 | 0;
              HEAP322[$122 >> 2] = $118;
              $123 = $118 + 8 | 0;
              HEAP322[$123 >> 2] = $121;
              $$3382 = $118;
            }
          } while (0);
          $136 = ($116 | 0) == (0 | 0);
          if (!$136) {
            $137 = $2 + 28 | 0;
            $138 = HEAP322[$137 >> 2] | 0;
            $139 = 38688 + ($138 << 2) | 0;
            $140 = HEAP322[$139 >> 2] | 0;
            $141 = ($2 | 0) == ($140 | 0);
            if ($141) {
              HEAP322[$139 >> 2] = $$3382;
              $cond5 = ($$3382 | 0) == (0 | 0);
              if ($cond5) {
                $142 = 1 << $138;
                $143 = $142 ^ -1;
                $144 = HEAP322[38388 >> 2] | 0;
                $145 = $144 & $143;
                HEAP322[38388 >> 2] = $145;
                break;
              }
            } else {
              $146 = $116 + 16 | 0;
              $147 = HEAP322[$146 >> 2] | 0;
              $not$ = ($147 | 0) != ($2 | 0);
              $$sink4 = $not$ & 1;
              $148 = ($116 + 16 | 0) + ($$sink4 << 2) | 0;
              HEAP322[$148 >> 2] = $$3382;
              $149 = ($$3382 | 0) == (0 | 0);
              if ($149) {
                break;
              }
            }
            $150 = $$3382 + 24 | 0;
            HEAP322[$150 >> 2] = $116;
            $151 = $2 + 16 | 0;
            $152 = HEAP322[$151 >> 2] | 0;
            $153 = ($152 | 0) == (0 | 0);
            if (!$153) {
              $154 = $$3382 + 16 | 0;
              HEAP322[$154 >> 2] = $152;
              $155 = $152 + 24 | 0;
              HEAP322[$155 >> 2] = $$3382;
            }
            $156 = $151 + 4 | 0;
            $157 = HEAP322[$156 >> 2] | 0;
            $158 = ($157 | 0) == (0 | 0);
            if (!$158) {
              $159 = $$3382 + 20 | 0;
              HEAP322[$159 >> 2] = $157;
              $160 = $157 + 24 | 0;
              HEAP322[$160 >> 2] = $$3382;
            }
          }
        }
      } while (0);
      $161 = $101 | 1;
      $162 = $$1 + 4 | 0;
      HEAP322[$162 >> 2] = $161;
      $163 = $$1 + $101 | 0;
      HEAP322[$163 >> 2] = $101;
      $164 = HEAP322[38404 >> 2] | 0;
      $165 = ($$1 | 0) == ($164 | 0);
      if ($165) {
        HEAP322[38392 >> 2] = $101;
        return;
      } else {
        $$2 = $101;
      }
    } else {
      $166 = $83 & -2;
      HEAP322[$82 >> 2] = $166;
      $167 = $$1365 | 1;
      $168 = $$1 + 4 | 0;
      HEAP322[$168 >> 2] = $167;
      $169 = $$1 + $$1365 | 0;
      HEAP322[$169 >> 2] = $$1365;
      $$2 = $$1365;
    }
    $170 = $$2 >>> 3;
    $171 = $$2 >>> 0 < 256;
    if ($171) {
      $172 = $170 << 1;
      $173 = 38424 + ($172 << 2) | 0;
      $174 = HEAP322[9596] | 0;
      $175 = 1 << $170;
      $176 = $174 & $175;
      $177 = ($176 | 0) == 0;
      if ($177) {
        $178 = $174 | $175;
        HEAP322[9596] = $178;
        $$pre = $173 + 8 | 0;
        $$0385 = $173;
        $$pre$phiZ2D = $$pre;
      } else {
        $179 = $173 + 8 | 0;
        $180 = HEAP322[$179 >> 2] | 0;
        $$0385 = $180;
        $$pre$phiZ2D = $179;
      }
      HEAP322[$$pre$phiZ2D >> 2] = $$1;
      $181 = $$0385 + 12 | 0;
      HEAP322[$181 >> 2] = $$1;
      $182 = $$1 + 8 | 0;
      HEAP322[$182 >> 2] = $$0385;
      $183 = $$1 + 12 | 0;
      HEAP322[$183 >> 2] = $173;
      return;
    }
    $184 = $$2 >>> 8;
    $185 = ($184 | 0) == 0;
    if ($185) {
      $$0378 = 0;
    } else {
      $186 = $$2 >>> 0 > 16777215;
      if ($186) {
        $$0378 = 31;
      } else {
        $187 = $184 + 1048320 | 0;
        $188 = $187 >>> 16;
        $189 = $188 & 8;
        $190 = $184 << $189;
        $191 = $190 + 520192 | 0;
        $192 = $191 >>> 16;
        $193 = $192 & 4;
        $194 = $193 | $189;
        $195 = $190 << $193;
        $196 = $195 + 245760 | 0;
        $197 = $196 >>> 16;
        $198 = $197 & 2;
        $199 = $194 | $198;
        $200 = 14 - $199 | 0;
        $201 = $195 << $198;
        $202 = $201 >>> 15;
        $203 = $200 + $202 | 0;
        $204 = $203 << 1;
        $205 = $203 + 7 | 0;
        $206 = $$2 >>> $205;
        $207 = $206 & 1;
        $208 = $207 | $204;
        $$0378 = $208;
      }
    }
    $209 = 38688 + ($$0378 << 2) | 0;
    $210 = $$1 + 28 | 0;
    HEAP322[$210 >> 2] = $$0378;
    $211 = $$1 + 16 | 0;
    $212 = $$1 + 20 | 0;
    HEAP322[$212 >> 2] = 0;
    HEAP322[$211 >> 2] = 0;
    $213 = HEAP322[38388 >> 2] | 0;
    $214 = 1 << $$0378;
    $215 = $213 & $214;
    $216 = ($215 | 0) == 0;
    if ($216) {
      $217 = $213 | $214;
      HEAP322[38388 >> 2] = $217;
      HEAP322[$209 >> 2] = $$1;
      $218 = $$1 + 24 | 0;
      HEAP322[$218 >> 2] = $209;
      $219 = $$1 + 12 | 0;
      HEAP322[$219 >> 2] = $$1;
      $220 = $$1 + 8 | 0;
      HEAP322[$220 >> 2] = $$1;
      return;
    }
    $221 = HEAP322[$209 >> 2] | 0;
    $222 = ($$0378 | 0) == 31;
    $223 = $$0378 >>> 1;
    $224 = 25 - $223 | 0;
    $225 = $222 ? 0 : $224;
    $226 = $$2 << $225;
    $$0366 = $226;
    $$0367 = $221;
    while (1) {
      $227 = $$0367 + 4 | 0;
      $228 = HEAP322[$227 >> 2] | 0;
      $229 = $228 & -8;
      $230 = ($229 | 0) == ($$2 | 0);
      if ($230) {
        label = 69;
        break;
      }
      $231 = $$0366 >>> 31;
      $232 = ($$0367 + 16 | 0) + ($231 << 2) | 0;
      $233 = $$0366 << 1;
      $234 = HEAP322[$232 >> 2] | 0;
      $235 = ($234 | 0) == (0 | 0);
      if ($235) {
        label = 68;
        break;
      } else {
        $$0366 = $233;
        $$0367 = $234;
      }
    }
    if ((label | 0) == 68) {
      HEAP322[$232 >> 2] = $$1;
      $236 = $$1 + 24 | 0;
      HEAP322[$236 >> 2] = $$0367;
      $237 = $$1 + 12 | 0;
      HEAP322[$237 >> 2] = $$1;
      $238 = $$1 + 8 | 0;
      HEAP322[$238 >> 2] = $$1;
      return;
    } else if ((label | 0) == 69) {
      $239 = $$0367 + 8 | 0;
      $240 = HEAP322[$239 >> 2] | 0;
      $241 = $240 + 12 | 0;
      HEAP322[$241 >> 2] = $$1;
      HEAP322[$239 >> 2] = $$1;
      $242 = $$1 + 8 | 0;
      HEAP322[$242 >> 2] = $240;
      $243 = $$1 + 12 | 0;
      HEAP322[$243 >> 2] = $$0367;
      $244 = $$1 + 24 | 0;
      HEAP322[$244 >> 2] = 0;
      return;
    }
  }
  function _emscripten_get_global_libc() {
    return 38880 | 0;
  }
  function ___stdio_close($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $vararg_buffer = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $vararg_buffer = sp;
    $1 = $0 + 60 | 0;
    $2 = HEAP322[$1 >> 2] | 0;
    $3 = _dummy_570($2) | 0;
    HEAP322[$vararg_buffer >> 2] = $3;
    $4 = ___syscall62(6, $vararg_buffer | 0) | 0;
    $5 = ___syscall_ret($4) | 0;
    STACKTOP2 = sp;
    return $5 | 0;
  }
  function ___stdio_write($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$0 = 0, $$04756 = 0, $$04855 = 0, $$04954 = 0, $$051 = 0, $$1 = 0, $$150 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0;
    var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
    var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr6 = 0;
    var $vararg_ptr7 = 0, label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 48 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(48 | 0);
    $vararg_buffer3 = sp + 16 | 0;
    $vararg_buffer = sp;
    $3 = sp + 32 | 0;
    $4 = $0 + 28 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    HEAP322[$3 >> 2] = $5;
    $6 = $3 + 4 | 0;
    $7 = $0 + 20 | 0;
    $8 = HEAP322[$7 >> 2] | 0;
    $9 = $8 - $5 | 0;
    HEAP322[$6 >> 2] = $9;
    $10 = $3 + 8 | 0;
    HEAP322[$10 >> 2] = $1;
    $11 = $3 + 12 | 0;
    HEAP322[$11 >> 2] = $2;
    $12 = $9 + $2 | 0;
    $13 = $0 + 60 | 0;
    $14 = HEAP322[$13 >> 2] | 0;
    $15 = $3;
    HEAP322[$vararg_buffer >> 2] = $14;
    $vararg_ptr1 = $vararg_buffer + 4 | 0;
    HEAP322[$vararg_ptr1 >> 2] = $15;
    $vararg_ptr2 = $vararg_buffer + 8 | 0;
    HEAP322[$vararg_ptr2 >> 2] = 2;
    $16 = ___syscall1462(146, $vararg_buffer | 0) | 0;
    $17 = ___syscall_ret($16) | 0;
    $18 = ($12 | 0) == ($17 | 0);
    L1:
      do {
        if ($18) {
          label = 3;
        } else {
          $$04756 = 2;
          $$04855 = $12;
          $$04954 = $3;
          $26 = $17;
          while (1) {
            $25 = ($26 | 0) < 0;
            if ($25) {
              break;
            }
            $34 = $$04855 - $26 | 0;
            $35 = $$04954 + 4 | 0;
            $36 = HEAP322[$35 >> 2] | 0;
            $37 = $26 >>> 0 > $36 >>> 0;
            $38 = $$04954 + 8 | 0;
            $$150 = $37 ? $38 : $$04954;
            $39 = $37 << 31 >> 31;
            $$1 = $39 + $$04756 | 0;
            $40 = $37 ? $36 : 0;
            $$0 = $26 - $40 | 0;
            $41 = HEAP322[$$150 >> 2] | 0;
            $42 = $41 + $$0 | 0;
            HEAP322[$$150 >> 2] = $42;
            $43 = $$150 + 4 | 0;
            $44 = HEAP322[$43 >> 2] | 0;
            $45 = $44 - $$0 | 0;
            HEAP322[$43 >> 2] = $45;
            $46 = HEAP322[$13 >> 2] | 0;
            $47 = $$150;
            HEAP322[$vararg_buffer3 >> 2] = $46;
            $vararg_ptr6 = $vararg_buffer3 + 4 | 0;
            HEAP322[$vararg_ptr6 >> 2] = $47;
            $vararg_ptr7 = $vararg_buffer3 + 8 | 0;
            HEAP322[$vararg_ptr7 >> 2] = $$1;
            $48 = ___syscall1462(146, $vararg_buffer3 | 0) | 0;
            $49 = ___syscall_ret($48) | 0;
            $50 = ($34 | 0) == ($49 | 0);
            if ($50) {
              label = 3;
              break L1;
            } else {
              $$04756 = $$1;
              $$04855 = $34;
              $$04954 = $$150;
              $26 = $49;
            }
          }
          $27 = $0 + 16 | 0;
          HEAP322[$27 >> 2] = 0;
          HEAP322[$4 >> 2] = 0;
          HEAP322[$7 >> 2] = 0;
          $28 = HEAP322[$0 >> 2] | 0;
          $29 = $28 | 32;
          HEAP322[$0 >> 2] = $29;
          $30 = ($$04756 | 0) == 2;
          if ($30) {
            $$051 = 0;
          } else {
            $31 = $$04954 + 4 | 0;
            $32 = HEAP322[$31 >> 2] | 0;
            $33 = $2 - $32 | 0;
            $$051 = $33;
          }
        }
      } while (0);
    if ((label | 0) == 3) {
      $19 = $0 + 44 | 0;
      $20 = HEAP322[$19 >> 2] | 0;
      $21 = $0 + 48 | 0;
      $22 = HEAP322[$21 >> 2] | 0;
      $23 = $20 + $22 | 0;
      $24 = $0 + 16 | 0;
      HEAP322[$24 >> 2] = $23;
      HEAP322[$4 >> 2] = $20;
      HEAP322[$7 >> 2] = $20;
      $$051 = $2;
    }
    STACKTOP2 = sp;
    return $$051 | 0;
  }
  function ___stdio_seek($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$pre = 0, $10 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $vararg_buffer = sp;
    $3 = sp + 20 | 0;
    $4 = $0 + 60 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = $3;
    HEAP322[$vararg_buffer >> 2] = $5;
    $vararg_ptr1 = $vararg_buffer + 4 | 0;
    HEAP322[$vararg_ptr1 >> 2] = 0;
    $vararg_ptr2 = $vararg_buffer + 8 | 0;
    HEAP322[$vararg_ptr2 >> 2] = $1;
    $vararg_ptr3 = $vararg_buffer + 12 | 0;
    HEAP322[$vararg_ptr3 >> 2] = $6;
    $vararg_ptr4 = $vararg_buffer + 16 | 0;
    HEAP322[$vararg_ptr4 >> 2] = $2;
    $7 = ___syscall1402(140, $vararg_buffer | 0) | 0;
    $8 = ___syscall_ret($7) | 0;
    $9 = ($8 | 0) < 0;
    if ($9) {
      HEAP322[$3 >> 2] = -1;
      $10 = -1;
    } else {
      $$pre = HEAP322[$3 >> 2] | 0;
      $10 = $$pre;
    }
    STACKTOP2 = sp;
    return $10 | 0;
  }
  function ___syscall_ret($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $2 = 0, $3 = 0;
    $1 = $0 >>> 0 > 4294963200;
    if ($1) {
      $2 = 0 - $0 | 0;
      $3 = ___errno_location() | 0;
      HEAP322[$3 >> 2] = $2;
      $$0 = -1;
    } else {
      $$0 = $0;
    }
    return $$0 | 0;
  }
  function ___errno_location() {
    var $0 = 0, $1 = 0;
    $0 = ___pthread_self_103() | 0;
    $1 = $0 + 64 | 0;
    return $1 | 0;
  }
  function ___pthread_self_103() {
    var $0 = 0;
    $0 = _pthread_self() | 0;
    return $0 | 0;
  }
  function _pthread_self() {
    return 588 | 0;
  }
  function _dummy_570($0) {
    $0 = $0 | 0;
    return $0 | 0;
  }
  function ___stdout_write($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 32 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(32 | 0);
    $vararg_buffer = sp;
    $3 = sp + 16 | 0;
    $4 = $0 + 36 | 0;
    HEAP322[$4 >> 2] = 23;
    $5 = HEAP322[$0 >> 2] | 0;
    $6 = $5 & 64;
    $7 = ($6 | 0) == 0;
    if ($7) {
      $8 = $0 + 60 | 0;
      $9 = HEAP322[$8 >> 2] | 0;
      $10 = $3;
      HEAP322[$vararg_buffer >> 2] = $9;
      $vararg_ptr1 = $vararg_buffer + 4 | 0;
      HEAP322[$vararg_ptr1 >> 2] = 21523;
      $vararg_ptr2 = $vararg_buffer + 8 | 0;
      HEAP322[$vararg_ptr2 >> 2] = $10;
      $11 = ___syscall542(54, $vararg_buffer | 0) | 0;
      $12 = ($11 | 0) == 0;
      if (!$12) {
        $13 = $0 + 75 | 0;
        HEAP82[$13 >> 0] = -1;
      }
    }
    $14 = ___stdio_write($0, $1, $2) | 0;
    STACKTOP2 = sp;
    return $14 | 0;
  }
  function ___shlim($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$sink = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0;
    $2 = $0 + 104 | 0;
    HEAP322[$2 >> 2] = $1;
    $3 = $0 + 8 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = $0 + 4 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = $4;
    $8 = $6;
    $9 = $7 - $8 | 0;
    $10 = $0 + 108 | 0;
    HEAP322[$10 >> 2] = $9;
    $11 = ($1 | 0) != 0;
    $12 = ($9 | 0) > ($1 | 0);
    $or$cond = $11 & $12;
    $13 = $6 + $1 | 0;
    $$sink = $or$cond ? $13 : $4;
    $14 = $0 + 100 | 0;
    HEAP322[$14 >> 2] = $$sink;
    return;
  }
  function ___intscan($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$0154222 = 0, $$0157 = 0, $$0157$ = 0, $$0159 = 0, $$1155192 = 0, $$1158 = 0, $$1160 = 0, $$1160169 = 0, $$1165 = 0, $$1165167 = 0, $$1165168 = 0, $$166 = 0, $$2156210 = 0, $$2161$be = 0, $$2161$lcssa = 0, $$3162$be = 0, $$3162215 = 0, $$4163$be = 0, $$4163$lcssa = 0, $$5$be = 0;
    var $$6$be = 0, $$6$lcssa = 0, $$7$be = 0, $$7198 = 0, $$8 = 0, $$9$be = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0;
    var $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0;
    var $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0;
    var $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0;
    var $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0;
    var $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0;
    var $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0;
    var $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0;
    var $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0;
    var $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0;
    var $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0;
    var $294 = 0, $295 = 0, $296 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
    var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
    var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
    var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $or$cond = 0, $or$cond12 = 0;
    var $or$cond187 = 0, $or$cond5 = 0, $or$cond7 = 0, label = 0;
    $5 = $1 >>> 0 > 36;
    L1:
      do {
        if ($5) {
          $8 = ___errno_location() | 0;
          HEAP322[$8 >> 2] = 22;
          $289 = 0;
          $290 = 0;
        } else {
          $6 = $0 + 4 | 0;
          $7 = $0 + 100 | 0;
          while (1) {
            $9 = HEAP322[$6 >> 2] | 0;
            $10 = HEAP322[$7 >> 2] | 0;
            $11 = $9 >>> 0 < $10 >>> 0;
            if ($11) {
              $12 = $9 + 1 | 0;
              HEAP322[$6 >> 2] = $12;
              $13 = HEAP82[$9 >> 0] | 0;
              $14 = $13 & 255;
              $16 = $14;
            } else {
              $15 = ___shgetc($0) | 0;
              $16 = $15;
            }
            $17 = _isspace($16) | 0;
            $18 = ($17 | 0) == 0;
            if ($18) {
              break;
            }
          }
          L11:
            do {
              switch ($16 | 0) {
                case 43:
                case 45: {
                  $19 = ($16 | 0) == 45;
                  $20 = $19 << 31 >> 31;
                  $21 = HEAP322[$6 >> 2] | 0;
                  $22 = HEAP322[$7 >> 2] | 0;
                  $23 = $21 >>> 0 < $22 >>> 0;
                  if ($23) {
                    $24 = $21 + 1 | 0;
                    HEAP322[$6 >> 2] = $24;
                    $25 = HEAP82[$21 >> 0] | 0;
                    $26 = $25 & 255;
                    $$0157 = $20;
                    $$0159 = $26;
                    break L11;
                  } else {
                    $27 = ___shgetc($0) | 0;
                    $$0157 = $20;
                    $$0159 = $27;
                    break L11;
                  }
                }
                default: {
                  $$0157 = 0;
                  $$0159 = $16;
                }
              }
            } while (0);
          $28 = ($1 | 0) == 0;
          $29 = $1 | 16;
          $30 = ($29 | 0) == 16;
          $31 = ($$0159 | 0) == 48;
          $or$cond5 = $30 & $31;
          do {
            if ($or$cond5) {
              $32 = HEAP322[$6 >> 2] | 0;
              $33 = HEAP322[$7 >> 2] | 0;
              $34 = $32 >>> 0 < $33 >>> 0;
              if ($34) {
                $35 = $32 + 1 | 0;
                HEAP322[$6 >> 2] = $35;
                $36 = HEAP82[$32 >> 0] | 0;
                $37 = $36 & 255;
                $40 = $37;
              } else {
                $38 = ___shgetc($0) | 0;
                $40 = $38;
              }
              $39 = $40 | 32;
              $41 = ($39 | 0) == 120;
              if (!$41) {
                if ($28) {
                  $$1160169 = $40;
                  $$1165168 = 8;
                  label = 46;
                  break;
                } else {
                  $$1160 = $40;
                  $$1165 = $1;
                  label = 32;
                  break;
                }
              }
              $42 = HEAP322[$6 >> 2] | 0;
              $43 = HEAP322[$7 >> 2] | 0;
              $44 = $42 >>> 0 < $43 >>> 0;
              if ($44) {
                $45 = $42 + 1 | 0;
                HEAP322[$6 >> 2] = $45;
                $46 = HEAP82[$42 >> 0] | 0;
                $47 = $46 & 255;
                $50 = $47;
              } else {
                $48 = ___shgetc($0) | 0;
                $50 = $48;
              }
              $49 = 2693 + $50 | 0;
              $51 = HEAP82[$49 >> 0] | 0;
              $52 = ($51 & 255) > 15;
              if ($52) {
                $53 = HEAP322[$7 >> 2] | 0;
                $54 = ($53 | 0) != (0 | 0);
                if ($54) {
                  $55 = HEAP322[$6 >> 2] | 0;
                  $56 = $55 + -1 | 0;
                  HEAP322[$6 >> 2] = $56;
                }
                $57 = ($2 | 0) == 0;
                if ($57) {
                  ___shlim($0, 0);
                  $289 = 0;
                  $290 = 0;
                  break L1;
                }
                if (!$54) {
                  $289 = 0;
                  $290 = 0;
                  break L1;
                }
                $58 = HEAP322[$6 >> 2] | 0;
                $59 = $58 + -1 | 0;
                HEAP322[$6 >> 2] = $59;
                $289 = 0;
                $290 = 0;
                break L1;
              } else {
                $$1160169 = $50;
                $$1165168 = 16;
                label = 46;
              }
            } else {
              $$166 = $28 ? 10 : $1;
              $60 = 2693 + $$0159 | 0;
              $61 = HEAP82[$60 >> 0] | 0;
              $62 = $61 & 255;
              $63 = $62 >>> 0 < $$166 >>> 0;
              if ($63) {
                $$1160 = $$0159;
                $$1165 = $$166;
                label = 32;
              } else {
                $64 = HEAP322[$7 >> 2] | 0;
                $65 = ($64 | 0) == (0 | 0);
                if (!$65) {
                  $66 = HEAP322[$6 >> 2] | 0;
                  $67 = $66 + -1 | 0;
                  HEAP322[$6 >> 2] = $67;
                }
                ___shlim($0, 0);
                $68 = ___errno_location() | 0;
                HEAP322[$68 >> 2] = 22;
                $289 = 0;
                $290 = 0;
                break L1;
              }
            }
          } while (0);
          L43:
            do {
              if ((label | 0) == 32) {
                $69 = ($$1165 | 0) == 10;
                if ($69) {
                  $70 = $$1160 + -48 | 0;
                  $71 = $70 >>> 0 < 10;
                  if ($71) {
                    $$0154222 = 0;
                    $74 = $70;
                    while (1) {
                      $72 = $$0154222 * 10 | 0;
                      $73 = $72 + $74 | 0;
                      $75 = HEAP322[$6 >> 2] | 0;
                      $76 = HEAP322[$7 >> 2] | 0;
                      $77 = $75 >>> 0 < $76 >>> 0;
                      if ($77) {
                        $78 = $75 + 1 | 0;
                        HEAP322[$6 >> 2] = $78;
                        $79 = HEAP82[$75 >> 0] | 0;
                        $80 = $79 & 255;
                        $$2161$be = $80;
                      } else {
                        $81 = ___shgetc($0) | 0;
                        $$2161$be = $81;
                      }
                      $82 = $$2161$be + -48 | 0;
                      $83 = $82 >>> 0 < 10;
                      $84 = $73 >>> 0 < 429496729;
                      $85 = $83 & $84;
                      if ($85) {
                        $$0154222 = $73;
                        $74 = $82;
                      } else {
                        break;
                      }
                    }
                    $$2161$lcssa = $$2161$be;
                    $291 = $73;
                    $292 = 0;
                  } else {
                    $$2161$lcssa = $$1160;
                    $291 = 0;
                    $292 = 0;
                  }
                  $86 = $$2161$lcssa + -48 | 0;
                  $87 = $86 >>> 0 < 10;
                  if ($87) {
                    $$3162215 = $$2161$lcssa;
                    $88 = $291;
                    $89 = $292;
                    $93 = $86;
                    while (1) {
                      $90 = ___muldi3($88 | 0, $89 | 0, 10, 0) | 0;
                      $91 = tempRet02;
                      $92 = ($93 | 0) < 0;
                      $94 = $92 << 31 >> 31;
                      $95 = $93 ^ -1;
                      $96 = $94 ^ -1;
                      $97 = $91 >>> 0 > $96 >>> 0;
                      $98 = $90 >>> 0 > $95 >>> 0;
                      $99 = ($91 | 0) == ($96 | 0);
                      $100 = $99 & $98;
                      $101 = $97 | $100;
                      if ($101) {
                        $$1165167 = 10;
                        $$8 = $$3162215;
                        $293 = $88;
                        $294 = $89;
                        label = 72;
                        break L43;
                      }
                      $102 = _i64Add($90 | 0, $91 | 0, $93 | 0, $94 | 0) | 0;
                      $103 = tempRet02;
                      $104 = HEAP322[$6 >> 2] | 0;
                      $105 = HEAP322[$7 >> 2] | 0;
                      $106 = $104 >>> 0 < $105 >>> 0;
                      if ($106) {
                        $107 = $104 + 1 | 0;
                        HEAP322[$6 >> 2] = $107;
                        $108 = HEAP82[$104 >> 0] | 0;
                        $109 = $108 & 255;
                        $$3162$be = $109;
                      } else {
                        $110 = ___shgetc($0) | 0;
                        $$3162$be = $110;
                      }
                      $111 = $$3162$be + -48 | 0;
                      $112 = $111 >>> 0 < 10;
                      $113 = $103 >>> 0 < 429496729;
                      $114 = $102 >>> 0 < 2576980378;
                      $115 = ($103 | 0) == 429496729;
                      $116 = $115 & $114;
                      $117 = $113 | $116;
                      $or$cond7 = $112 & $117;
                      if ($or$cond7) {
                        $$3162215 = $$3162$be;
                        $88 = $102;
                        $89 = $103;
                        $93 = $111;
                      } else {
                        break;
                      }
                    }
                    $118 = $111 >>> 0 > 9;
                    if ($118) {
                      $$1158 = $$0157;
                      $263 = $103;
                      $265 = $102;
                    } else {
                      $$1165167 = 10;
                      $$8 = $$3162$be;
                      $293 = $102;
                      $294 = $103;
                      label = 72;
                    }
                  } else {
                    $$1158 = $$0157;
                    $263 = $292;
                    $265 = $291;
                  }
                } else {
                  $$1160169 = $$1160;
                  $$1165168 = $$1165;
                  label = 46;
                }
              }
            } while (0);
          L63:
            do {
              if ((label | 0) == 46) {
                $119 = $$1165168 + -1 | 0;
                $120 = $119 & $$1165168;
                $121 = ($120 | 0) == 0;
                if ($121) {
                  $126 = $$1165168 * 23 | 0;
                  $127 = $126 >>> 5;
                  $128 = $127 & 7;
                  $129 = 2949 + $128 | 0;
                  $130 = HEAP82[$129 >> 0] | 0;
                  $131 = $130 << 24 >> 24;
                  $132 = 2693 + $$1160169 | 0;
                  $133 = HEAP82[$132 >> 0] | 0;
                  $134 = $133 & 255;
                  $135 = $134 >>> 0 < $$1165168 >>> 0;
                  if ($135) {
                    $$1155192 = 0;
                    $138 = $134;
                    while (1) {
                      $136 = $$1155192 << $131;
                      $137 = $138 | $136;
                      $139 = HEAP322[$6 >> 2] | 0;
                      $140 = HEAP322[$7 >> 2] | 0;
                      $141 = $139 >>> 0 < $140 >>> 0;
                      if ($141) {
                        $142 = $139 + 1 | 0;
                        HEAP322[$6 >> 2] = $142;
                        $143 = HEAP82[$139 >> 0] | 0;
                        $144 = $143 & 255;
                        $$4163$be = $144;
                      } else {
                        $145 = ___shgetc($0) | 0;
                        $$4163$be = $145;
                      }
                      $146 = 2693 + $$4163$be | 0;
                      $147 = HEAP82[$146 >> 0] | 0;
                      $148 = $147 & 255;
                      $149 = $148 >>> 0 < $$1165168 >>> 0;
                      $150 = $137 >>> 0 < 134217728;
                      $151 = $150 & $149;
                      if ($151) {
                        $$1155192 = $137;
                        $138 = $148;
                      } else {
                        break;
                      }
                    }
                    $$4163$lcssa = $$4163$be;
                    $155 = $147;
                    $158 = 0;
                    $160 = $137;
                  } else {
                    $$4163$lcssa = $$1160169;
                    $155 = $133;
                    $158 = 0;
                    $160 = 0;
                  }
                  $152 = _bitshift64Lshr(-1, -1, $131 | 0) | 0;
                  $153 = tempRet02;
                  $154 = $155 & 255;
                  $156 = $154 >>> 0 >= $$1165168 >>> 0;
                  $157 = $158 >>> 0 > $153 >>> 0;
                  $159 = $160 >>> 0 > $152 >>> 0;
                  $161 = ($158 | 0) == ($153 | 0);
                  $162 = $161 & $159;
                  $163 = $157 | $162;
                  $or$cond187 = $156 | $163;
                  if ($or$cond187) {
                    $$1165167 = $$1165168;
                    $$8 = $$4163$lcssa;
                    $293 = $160;
                    $294 = $158;
                    label = 72;
                    break;
                  } else {
                    $164 = $160;
                    $165 = $158;
                    $169 = $155;
                  }
                  while (1) {
                    $166 = _bitshift64Shl($164 | 0, $165 | 0, $131 | 0) | 0;
                    $167 = tempRet02;
                    $168 = $169 & 255;
                    $170 = $168 | $166;
                    $171 = HEAP322[$6 >> 2] | 0;
                    $172 = HEAP322[$7 >> 2] | 0;
                    $173 = $171 >>> 0 < $172 >>> 0;
                    if ($173) {
                      $174 = $171 + 1 | 0;
                      HEAP322[$6 >> 2] = $174;
                      $175 = HEAP82[$171 >> 0] | 0;
                      $176 = $175 & 255;
                      $$5$be = $176;
                    } else {
                      $177 = ___shgetc($0) | 0;
                      $$5$be = $177;
                    }
                    $178 = 2693 + $$5$be | 0;
                    $179 = HEAP82[$178 >> 0] | 0;
                    $180 = $179 & 255;
                    $181 = $180 >>> 0 >= $$1165168 >>> 0;
                    $182 = $167 >>> 0 > $153 >>> 0;
                    $183 = $170 >>> 0 > $152 >>> 0;
                    $184 = ($167 | 0) == ($153 | 0);
                    $185 = $184 & $183;
                    $186 = $182 | $185;
                    $or$cond = $181 | $186;
                    if ($or$cond) {
                      $$1165167 = $$1165168;
                      $$8 = $$5$be;
                      $293 = $170;
                      $294 = $167;
                      label = 72;
                      break L63;
                    } else {
                      $164 = $170;
                      $165 = $167;
                      $169 = $179;
                    }
                  }
                }
                $122 = 2693 + $$1160169 | 0;
                $123 = HEAP82[$122 >> 0] | 0;
                $124 = $123 & 255;
                $125 = $124 >>> 0 < $$1165168 >>> 0;
                if ($125) {
                  $$2156210 = 0;
                  $189 = $124;
                  while (1) {
                    $187 = Math_imul($$2156210, $$1165168) | 0;
                    $188 = $189 + $187 | 0;
                    $190 = HEAP322[$6 >> 2] | 0;
                    $191 = HEAP322[$7 >> 2] | 0;
                    $192 = $190 >>> 0 < $191 >>> 0;
                    if ($192) {
                      $193 = $190 + 1 | 0;
                      HEAP322[$6 >> 2] = $193;
                      $194 = HEAP82[$190 >> 0] | 0;
                      $195 = $194 & 255;
                      $$6$be = $195;
                    } else {
                      $196 = ___shgetc($0) | 0;
                      $$6$be = $196;
                    }
                    $197 = 2693 + $$6$be | 0;
                    $198 = HEAP82[$197 >> 0] | 0;
                    $199 = $198 & 255;
                    $200 = $199 >>> 0 < $$1165168 >>> 0;
                    $201 = $188 >>> 0 < 119304647;
                    $202 = $201 & $200;
                    if ($202) {
                      $$2156210 = $188;
                      $189 = $199;
                    } else {
                      break;
                    }
                  }
                  $$6$lcssa = $$6$be;
                  $204 = $198;
                  $295 = $188;
                  $296 = 0;
                } else {
                  $$6$lcssa = $$1160169;
                  $204 = $123;
                  $295 = 0;
                  $296 = 0;
                }
                $203 = $204 & 255;
                $205 = $203 >>> 0 < $$1165168 >>> 0;
                if ($205) {
                  $206 = ___udivdi3(-1, -1, $$1165168 | 0, 0) | 0;
                  $207 = tempRet02;
                  $$7198 = $$6$lcssa;
                  $209 = $296;
                  $211 = $295;
                  $218 = $204;
                  while (1) {
                    $208 = $209 >>> 0 > $207 >>> 0;
                    $210 = $211 >>> 0 > $206 >>> 0;
                    $212 = ($209 | 0) == ($207 | 0);
                    $213 = $212 & $210;
                    $214 = $208 | $213;
                    if ($214) {
                      $$1165167 = $$1165168;
                      $$8 = $$7198;
                      $293 = $211;
                      $294 = $209;
                      label = 72;
                      break L63;
                    }
                    $215 = ___muldi3($211 | 0, $209 | 0, $$1165168 | 0, 0) | 0;
                    $216 = tempRet02;
                    $217 = $218 & 255;
                    $219 = $217 ^ -1;
                    $220 = $216 >>> 0 > 4294967295;
                    $221 = $215 >>> 0 > $219 >>> 0;
                    $222 = ($216 | 0) == -1;
                    $223 = $222 & $221;
                    $224 = $220 | $223;
                    if ($224) {
                      $$1165167 = $$1165168;
                      $$8 = $$7198;
                      $293 = $211;
                      $294 = $209;
                      label = 72;
                      break L63;
                    }
                    $225 = _i64Add($217 | 0, 0, $215 | 0, $216 | 0) | 0;
                    $226 = tempRet02;
                    $227 = HEAP322[$6 >> 2] | 0;
                    $228 = HEAP322[$7 >> 2] | 0;
                    $229 = $227 >>> 0 < $228 >>> 0;
                    if ($229) {
                      $230 = $227 + 1 | 0;
                      HEAP322[$6 >> 2] = $230;
                      $231 = HEAP82[$227 >> 0] | 0;
                      $232 = $231 & 255;
                      $$7$be = $232;
                    } else {
                      $233 = ___shgetc($0) | 0;
                      $$7$be = $233;
                    }
                    $234 = 2693 + $$7$be | 0;
                    $235 = HEAP82[$234 >> 0] | 0;
                    $236 = $235 & 255;
                    $237 = $236 >>> 0 < $$1165168 >>> 0;
                    if ($237) {
                      $$7198 = $$7$be;
                      $209 = $226;
                      $211 = $225;
                      $218 = $235;
                    } else {
                      $$1165167 = $$1165168;
                      $$8 = $$7$be;
                      $293 = $225;
                      $294 = $226;
                      label = 72;
                      break;
                    }
                  }
                } else {
                  $$1165167 = $$1165168;
                  $$8 = $$6$lcssa;
                  $293 = $295;
                  $294 = $296;
                  label = 72;
                }
              }
            } while (0);
          if ((label | 0) == 72) {
            $238 = 2693 + $$8 | 0;
            $239 = HEAP82[$238 >> 0] | 0;
            $240 = $239 & 255;
            $241 = $240 >>> 0 < $$1165167 >>> 0;
            if ($241) {
              while (1) {
                $242 = HEAP322[$6 >> 2] | 0;
                $243 = HEAP322[$7 >> 2] | 0;
                $244 = $242 >>> 0 < $243 >>> 0;
                if ($244) {
                  $245 = $242 + 1 | 0;
                  HEAP322[$6 >> 2] = $245;
                  $246 = HEAP82[$242 >> 0] | 0;
                  $247 = $246 & 255;
                  $$9$be = $247;
                } else {
                  $248 = ___shgetc($0) | 0;
                  $$9$be = $248;
                }
                $249 = 2693 + $$9$be | 0;
                $250 = HEAP82[$249 >> 0] | 0;
                $251 = $250 & 255;
                $252 = $251 >>> 0 < $$1165167 >>> 0;
                if (!$252) {
                  break;
                }
              }
              $253 = ___errno_location() | 0;
              HEAP322[$253 >> 2] = 34;
              $254 = $3 & 1;
              $255 = ($254 | 0) == 0;
              $256 = true;
              $257 = $255 & $256;
              $$0157$ = $257 ? $$0157 : 0;
              $$1158 = $$0157$;
              $263 = $4;
              $265 = $3;
            } else {
              $$1158 = $$0157;
              $263 = $294;
              $265 = $293;
            }
          }
          $258 = HEAP322[$7 >> 2] | 0;
          $259 = ($258 | 0) == (0 | 0);
          if (!$259) {
            $260 = HEAP322[$6 >> 2] | 0;
            $261 = $260 + -1 | 0;
            HEAP322[$6 >> 2] = $261;
          }
          $262 = $263 >>> 0 < $4 >>> 0;
          $264 = $265 >>> 0 < $3 >>> 0;
          $266 = ($263 | 0) == ($4 | 0);
          $267 = $266 & $264;
          $268 = $262 | $267;
          if (!$268) {
            $269 = $3 & 1;
            $270 = ($269 | 0) != 0;
            $271 = false;
            $272 = $270 | $271;
            $273 = ($$1158 | 0) != 0;
            $or$cond12 = $272 | $273;
            if (!$or$cond12) {
              $274 = ___errno_location() | 0;
              HEAP322[$274 >> 2] = 34;
              $275 = _i64Add($3 | 0, $4 | 0, -1, -1) | 0;
              $276 = tempRet02;
              $289 = $276;
              $290 = $275;
              break;
            }
            $277 = $263 >>> 0 > $4 >>> 0;
            $278 = $265 >>> 0 > $3 >>> 0;
            $279 = ($263 | 0) == ($4 | 0);
            $280 = $279 & $278;
            $281 = $277 | $280;
            if ($281) {
              $282 = ___errno_location() | 0;
              HEAP322[$282 >> 2] = 34;
              $289 = $4;
              $290 = $3;
              break;
            }
          }
          $283 = ($$1158 | 0) < 0;
          $284 = $283 << 31 >> 31;
          $285 = $265 ^ $$1158;
          $286 = $263 ^ $284;
          $287 = _i64Subtract($285 | 0, $286 | 0, $$1158 | 0, $284 | 0) | 0;
          $288 = tempRet02;
          $289 = $288;
          $290 = $287;
        }
      } while (0);
    tempRet02 = $289;
    return $290 | 0;
  }
  function ___shgetc($0) {
    $0 = $0 | 0;
    var $$0 = 0, $$phi$trans$insert = 0, $$phi$trans$insert28$phi$trans$insert = 0, $$pre = 0, $$pre$phi34Z2D = 0, $$pre29$pre = 0, $$pre35 = 0, $$sink = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0;
    var $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0;
    var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
    $1 = $0 + 104 | 0;
    $2 = HEAP322[$1 >> 2] | 0;
    $3 = ($2 | 0) == 0;
    if ($3) {
      label = 3;
    } else {
      $4 = $0 + 108 | 0;
      $5 = HEAP322[$4 >> 2] | 0;
      $6 = ($5 | 0) < ($2 | 0);
      if ($6) {
        label = 3;
      } else {
        label = 4;
      }
    }
    if ((label | 0) == 3) {
      $7 = ___uflow($0) | 0;
      $8 = ($7 | 0) < 0;
      if ($8) {
        label = 4;
      } else {
        $10 = HEAP322[$1 >> 2] | 0;
        $11 = ($10 | 0) == 0;
        $$phi$trans$insert = $0 + 8 | 0;
        if ($11) {
          $$pre = HEAP322[$$phi$trans$insert >> 2] | 0;
          $$phi$trans$insert28$phi$trans$insert = $0 + 4 | 0;
          $$pre29$pre = HEAP322[$$phi$trans$insert28$phi$trans$insert >> 2] | 0;
          $$pre35 = $0 + 108 | 0;
          $$pre$phi34Z2D = $$pre35;
          $$sink = $$pre;
          $26 = $$pre;
          $29 = $$pre29$pre;
        } else {
          $12 = HEAP322[$$phi$trans$insert >> 2] | 0;
          $13 = $0 + 4 | 0;
          $14 = HEAP322[$13 >> 2] | 0;
          $15 = $14;
          $16 = $12 - $15 | 0;
          $17 = $0 + 108 | 0;
          $18 = HEAP322[$17 >> 2] | 0;
          $19 = $10 - $18 | 0;
          $20 = ($16 | 0) < ($19 | 0);
          $21 = $12;
          if ($20) {
            $$pre$phi34Z2D = $17;
            $$sink = $21;
            $26 = $21;
            $29 = $14;
          } else {
            $22 = $19 + -1 | 0;
            $23 = $14 + $22 | 0;
            $$pre$phi34Z2D = $17;
            $$sink = $23;
            $26 = $21;
            $29 = $14;
          }
        }
        $24 = $0 + 100 | 0;
        HEAP322[$24 >> 2] = $$sink;
        $25 = ($26 | 0) == (0 | 0);
        if (!$25) {
          $27 = $26;
          $28 = $29;
          $30 = HEAP322[$$pre$phi34Z2D >> 2] | 0;
          $31 = $27 + 1 | 0;
          $32 = $31 - $28 | 0;
          $33 = $32 + $30 | 0;
          HEAP322[$$pre$phi34Z2D >> 2] = $33;
        }
        $34 = $29 + -1 | 0;
        $35 = HEAP82[$34 >> 0] | 0;
        $36 = $35 & 255;
        $37 = ($36 | 0) == ($7 | 0);
        if ($37) {
          $$0 = $7;
        } else {
          $38 = $7 & 255;
          HEAP82[$34 >> 0] = $38;
          $$0 = $7;
        }
      }
    }
    if ((label | 0) == 4) {
      $9 = $0 + 100 | 0;
      HEAP322[$9 >> 2] = 0;
      $$0 = -1;
    }
    return $$0 | 0;
  }
  function _isspace($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0;
    $1 = ($0 | 0) == 32;
    $2 = $0 + -9 | 0;
    $3 = $2 >>> 0 < 5;
    $4 = $1 | $3;
    $5 = $4 & 1;
    return $5 | 0;
  }
  function ___uflow($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $1 = sp;
    $2 = ___toread($0) | 0;
    $3 = ($2 | 0) == 0;
    if ($3) {
      $4 = $0 + 32 | 0;
      $5 = HEAP322[$4 >> 2] | 0;
      $6 = FUNCTION_TABLE_iiii[$5 & 31]($0, $1, 1) | 0;
      $7 = ($6 | 0) == 1;
      if ($7) {
        $8 = HEAP82[$1 >> 0] | 0;
        $9 = $8 & 255;
        $$0 = $9;
      } else {
        $$0 = -1;
      }
    } else {
      $$0 = -1;
    }
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function ___toread($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
    var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $sext = 0;
    $1 = $0 + 74 | 0;
    $2 = HEAP82[$1 >> 0] | 0;
    $3 = $2 << 24 >> 24;
    $4 = $3 + 255 | 0;
    $5 = $4 | $3;
    $6 = $5 & 255;
    HEAP82[$1 >> 0] = $6;
    $7 = $0 + 20 | 0;
    $8 = HEAP322[$7 >> 2] | 0;
    $9 = $0 + 28 | 0;
    $10 = HEAP322[$9 >> 2] | 0;
    $11 = $8 >>> 0 > $10 >>> 0;
    if ($11) {
      $12 = $0 + 36 | 0;
      $13 = HEAP322[$12 >> 2] | 0;
      FUNCTION_TABLE_iiii[$13 & 31]($0, 0, 0) | 0;
    }
    $14 = $0 + 16 | 0;
    HEAP322[$14 >> 2] = 0;
    HEAP322[$9 >> 2] = 0;
    HEAP322[$7 >> 2] = 0;
    $15 = HEAP322[$0 >> 2] | 0;
    $16 = $15 & 4;
    $17 = ($16 | 0) == 0;
    if ($17) {
      $19 = $0 + 44 | 0;
      $20 = HEAP322[$19 >> 2] | 0;
      $21 = $0 + 48 | 0;
      $22 = HEAP322[$21 >> 2] | 0;
      $23 = $20 + $22 | 0;
      $24 = $0 + 8 | 0;
      HEAP322[$24 >> 2] = $23;
      $25 = $0 + 4 | 0;
      HEAP322[$25 >> 2] = $23;
      $26 = $15 << 27;
      $sext = $26 >> 31;
      $$0 = $sext;
    } else {
      $18 = $15 | 32;
      HEAP322[$0 >> 2] = $18;
      $$0 = -1;
    }
    return $$0 | 0;
  }
  function _copysign($0, $1) {
    $0 = +$0;
    $1 = +$1;
    var $2 = 0, $3 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    HEAPF642[tempDoublePtr2 >> 3] = $0;
    $2 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $3 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    HEAPF642[tempDoublePtr2 >> 3] = $1;
    HEAP322[tempDoublePtr2 >> 2] | 0;
    $5 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    $6 = $3 & 2147483647;
    $7 = $5 & -2147483648;
    $8 = $7 | $6;
    HEAP322[tempDoublePtr2 >> 2] = $2;
    HEAP322[tempDoublePtr2 + 4 >> 2] = $8;
    $9 = +HEAPF642[tempDoublePtr2 >> 3];
    return +$9;
  }
  function _strcmp($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$011 = 0, $$0710 = 0, $$lcssa = 0, $$lcssa8 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond9 = 0;
    $2 = HEAP82[$0 >> 0] | 0;
    $3 = HEAP82[$1 >> 0] | 0;
    $4 = $2 << 24 >> 24 != $3 << 24 >> 24;
    $5 = $2 << 24 >> 24 == 0;
    $or$cond9 = $5 | $4;
    if ($or$cond9) {
      $$lcssa = $3;
      $$lcssa8 = $2;
    } else {
      $$011 = $1;
      $$0710 = $0;
      while (1) {
        $6 = $$0710 + 1 | 0;
        $7 = $$011 + 1 | 0;
        $8 = HEAP82[$6 >> 0] | 0;
        $9 = HEAP82[$7 >> 0] | 0;
        $10 = $8 << 24 >> 24 != $9 << 24 >> 24;
        $11 = $8 << 24 >> 24 == 0;
        $or$cond = $11 | $10;
        if ($or$cond) {
          $$lcssa = $9;
          $$lcssa8 = $8;
          break;
        } else {
          $$011 = $7;
          $$0710 = $6;
        }
      }
    }
    $12 = $$lcssa8 & 255;
    $13 = $$lcssa & 255;
    $14 = $12 - $13 | 0;
    return $14 | 0;
  }
  function _sprintf($0, $1, $varargs) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $varargs = $varargs | 0;
    var $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = sp;
    HEAP322[$2 >> 2] = $varargs;
    $3 = _vsprintf($0, $1, $2) | 0;
    STACKTOP2 = sp;
    return $3 | 0;
  }
  function _vsprintf($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $3 = 0;
    $3 = _vsnprintf($0, 2147483647, $1, $2) | 0;
    return $3 | 0;
  }
  function _vsnprintf($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$$015 = 0, $$0 = 0, $$014 = 0, $$015 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
    var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, dest = 0, label = 0, sp = 0, src = 0, stop2 = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 128 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(128 | 0);
    $4 = sp + 124 | 0;
    $5 = sp;
    dest = $5;
    src = 960;
    stop2 = dest + 124 | 0;
    do {
      HEAP322[dest >> 2] = HEAP322[src >> 2] | 0;
      dest = dest + 4 | 0;
      src = src + 4 | 0;
    } while ((dest | 0) < (stop2 | 0));
    $6 = $1 + -1 | 0;
    $7 = $6 >>> 0 > 2147483646;
    if ($7) {
      $8 = ($1 | 0) == 0;
      if ($8) {
        $$014 = $4;
        $$015 = 1;
        label = 4;
      } else {
        $9 = ___errno_location() | 0;
        HEAP322[$9 >> 2] = 75;
        $$0 = -1;
      }
    } else {
      $$014 = $0;
      $$015 = $1;
      label = 4;
    }
    if ((label | 0) == 4) {
      $10 = $$014;
      $11 = -2 - $10 | 0;
      $12 = $$015 >>> 0 > $11 >>> 0;
      $$$015 = $12 ? $11 : $$015;
      $13 = $5 + 48 | 0;
      HEAP322[$13 >> 2] = $$$015;
      $14 = $5 + 20 | 0;
      HEAP322[$14 >> 2] = $$014;
      $15 = $5 + 44 | 0;
      HEAP322[$15 >> 2] = $$014;
      $16 = $$014 + $$$015 | 0;
      $17 = $5 + 16 | 0;
      HEAP322[$17 >> 2] = $16;
      $18 = $5 + 28 | 0;
      HEAP322[$18 >> 2] = $16;
      $19 = _vfprintf($5, $2, $3) | 0;
      $20 = ($$$015 | 0) == 0;
      if ($20) {
        $$0 = $19;
      } else {
        $21 = HEAP322[$14 >> 2] | 0;
        $22 = HEAP322[$17 >> 2] | 0;
        $23 = ($21 | 0) == ($22 | 0);
        $24 = $23 << 31 >> 31;
        $25 = $21 + $24 | 0;
        HEAP82[$25 >> 0] = 0;
        $$0 = $19;
      }
    }
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function _vfprintf($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$ = 0, $$0 = 0, $$1 = 0, $$1$ = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
    var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
    var $8 = 0, $9 = 0, $vacopy_currentptr = 0, dest = 0, sp = 0, stop2 = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 224 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(224 | 0);
    $3 = sp + 120 | 0;
    $4 = sp + 80 | 0;
    $5 = sp;
    $6 = sp + 136 | 0;
    dest = $4;
    stop2 = dest + 40 | 0;
    do {
      HEAP322[dest >> 2] = 0 | 0;
      dest = dest + 4 | 0;
    } while ((dest | 0) < (stop2 | 0));
    $vacopy_currentptr = HEAP322[$2 >> 2] | 0;
    HEAP322[$3 >> 2] = $vacopy_currentptr;
    $7 = _printf_core(0, $1, $3, $5, $4) | 0;
    $8 = ($7 | 0) < 0;
    if ($8) {
      $$0 = -1;
    } else {
      $9 = $0 + 76 | 0;
      HEAP322[$9 >> 2] | 0;
      $13 = HEAP322[$0 >> 2] | 0;
      $14 = $13 & 32;
      $15 = $0 + 74 | 0;
      $16 = HEAP82[$15 >> 0] | 0;
      $17 = $16 << 24 >> 24 < 1;
      if ($17) {
        $18 = $13 & -33;
        HEAP322[$0 >> 2] = $18;
      }
      $19 = $0 + 48 | 0;
      $20 = HEAP322[$19 >> 2] | 0;
      $21 = ($20 | 0) == 0;
      if ($21) {
        $23 = $0 + 44 | 0;
        $24 = HEAP322[$23 >> 2] | 0;
        HEAP322[$23 >> 2] = $6;
        $25 = $0 + 28 | 0;
        HEAP322[$25 >> 2] = $6;
        $26 = $0 + 20 | 0;
        HEAP322[$26 >> 2] = $6;
        HEAP322[$19 >> 2] = 80;
        $27 = $6 + 80 | 0;
        $28 = $0 + 16 | 0;
        HEAP322[$28 >> 2] = $27;
        $29 = _printf_core($0, $1, $3, $5, $4) | 0;
        $30 = ($24 | 0) == (0 | 0);
        if ($30) {
          $$1 = $29;
        } else {
          $31 = $0 + 36 | 0;
          $32 = HEAP322[$31 >> 2] | 0;
          FUNCTION_TABLE_iiii[$32 & 31]($0, 0, 0) | 0;
          $33 = HEAP322[$26 >> 2] | 0;
          $34 = ($33 | 0) == (0 | 0);
          $$ = $34 ? -1 : $29;
          HEAP322[$23 >> 2] = $24;
          HEAP322[$19 >> 2] = 0;
          HEAP322[$28 >> 2] = 0;
          HEAP322[$25 >> 2] = 0;
          HEAP322[$26 >> 2] = 0;
          $$1 = $$;
        }
      } else {
        $22 = _printf_core($0, $1, $3, $5, $4) | 0;
        $$1 = $22;
      }
      $35 = HEAP322[$0 >> 2] | 0;
      $36 = $35 & 32;
      $37 = ($36 | 0) == 0;
      $$1$ = $37 ? $$1 : -1;
      $38 = $35 | $14;
      HEAP322[$0 >> 2] = $38;
      $$0 = $$1$;
    }
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function _printf_core($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$ = 0, $$$ = 0, $$$0259 = 0, $$$0262 = 0, $$$0269 = 0, $$$4266 = 0, $$$5 = 0, $$0 = 0, $$0228 = 0, $$0228$ = 0, $$0229322 = 0, $$0232 = 0, $$0235 = 0, $$0237 = 0, $$0240$lcssa = 0, $$0240$lcssa357 = 0, $$0240321 = 0, $$0243 = 0, $$0247 = 0, $$0249$lcssa = 0;
    var $$0249306 = 0, $$0252 = 0, $$0253 = 0, $$0254 = 0, $$0254$$0254$ = 0, $$0259 = 0, $$0262$lcssa = 0, $$0262311 = 0, $$0269 = 0, $$0269$phi = 0, $$1 = 0, $$1230333 = 0, $$1233 = 0, $$1236 = 0, $$1238 = 0, $$1241332 = 0, $$1244320 = 0, $$1248 = 0, $$1250 = 0, $$1255 = 0;
    var $$1260 = 0, $$1263 = 0, $$1263$ = 0, $$1270 = 0, $$2 = 0, $$2234 = 0, $$2239 = 0, $$2242305 = 0, $$2245 = 0, $$2251 = 0, $$2256 = 0, $$2256$ = 0, $$2256$$$2256 = 0, $$2261 = 0, $$2271 = 0, $$284$ = 0, $$289 = 0, $$290 = 0, $$3257 = 0, $$3265 = 0;
    var $$3272 = 0, $$3303 = 0, $$377 = 0, $$4258355 = 0, $$4266 = 0, $$5 = 0, $$6268 = 0, $$lcssa295 = 0, $$pre = 0, $$pre346 = 0, $$pre347 = 0, $$pre347$pre = 0, $$pre349 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
    var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
    var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
    var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
    var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
    var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
    var $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0;
    var $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0;
    var $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0;
    var $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0;
    var $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0;
    var $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0;
    var $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0;
    var $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
    var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
    var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $79 = 0, $8 = 0, $80 = 0;
    var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
    var $arglist_current = 0, $arglist_current2 = 0, $arglist_next = 0, $arglist_next3 = 0, $expanded = 0, $expanded10 = 0, $expanded11 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded4 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $isdigit = 0, $isdigit275 = 0, $isdigit277 = 0, $isdigittmp = 0, $isdigittmp$ = 0, $isdigittmp274 = 0;
    var $isdigittmp276 = 0, $narrow = 0, $or$cond = 0, $or$cond281 = 0, $or$cond283 = 0, $or$cond286 = 0, $storemerge = 0, $storemerge273310 = 0, $storemerge278 = 0, $trunc = 0, label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 64 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(64 | 0);
    $5 = sp + 16 | 0;
    $6 = sp;
    $7 = sp + 24 | 0;
    $8 = sp + 8 | 0;
    $9 = sp + 20 | 0;
    HEAP322[$5 >> 2] = $1;
    $10 = ($0 | 0) != (0 | 0);
    $11 = $7 + 40 | 0;
    $12 = $11;
    $13 = $7 + 39 | 0;
    $14 = $8 + 4 | 0;
    $$0243 = 0;
    $$0247 = 0;
    $$0269 = 0;
    $21 = $1;
    L1:
      while (1) {
        $15 = ($$0247 | 0) > -1;
        do {
          if ($15) {
            $16 = 2147483647 - $$0247 | 0;
            $17 = ($$0243 | 0) > ($16 | 0);
            if ($17) {
              $18 = ___errno_location() | 0;
              HEAP322[$18 >> 2] = 75;
              $$1248 = -1;
              break;
            } else {
              $19 = $$0243 + $$0247 | 0;
              $$1248 = $19;
              break;
            }
          } else {
            $$1248 = $$0247;
          }
        } while (0);
        $20 = HEAP82[$21 >> 0] | 0;
        $22 = $20 << 24 >> 24 == 0;
        if ($22) {
          label = 87;
          break;
        } else {
          $23 = $20;
          $25 = $21;
        }
        L9:
          while (1) {
            switch ($23 << 24 >> 24) {
              case 37: {
                $$0249306 = $25;
                $27 = $25;
                label = 9;
                break L9;
              }
              case 0: {
                $$0249$lcssa = $25;
                $39 = $25;
                break L9;
              }
            }
            $24 = $25 + 1 | 0;
            HEAP322[$5 >> 2] = $24;
            $$pre = HEAP82[$24 >> 0] | 0;
            $23 = $$pre;
            $25 = $24;
          }
        L12:
          do {
            if ((label | 0) == 9) {
              while (1) {
                label = 0;
                $26 = $27 + 1 | 0;
                $28 = HEAP82[$26 >> 0] | 0;
                $29 = $28 << 24 >> 24 == 37;
                if (!$29) {
                  $$0249$lcssa = $$0249306;
                  $39 = $27;
                  break L12;
                }
                $30 = $$0249306 + 1 | 0;
                $31 = $27 + 2 | 0;
                HEAP322[$5 >> 2] = $31;
                $32 = HEAP82[$31 >> 0] | 0;
                $33 = $32 << 24 >> 24 == 37;
                if ($33) {
                  $$0249306 = $30;
                  $27 = $31;
                  label = 9;
                } else {
                  $$0249$lcssa = $30;
                  $39 = $31;
                  break;
                }
              }
            }
          } while (0);
        $34 = $$0249$lcssa;
        $35 = $21;
        $36 = $34 - $35 | 0;
        if ($10) {
          _out($0, $21, $36);
        }
        $37 = ($36 | 0) == 0;
        if (!$37) {
          $$0269$phi = $$0269;
          $$0243 = $36;
          $$0247 = $$1248;
          $21 = $39;
          $$0269 = $$0269$phi;
          continue;
        }
        $38 = $39 + 1 | 0;
        $40 = HEAP82[$38 >> 0] | 0;
        $41 = $40 << 24 >> 24;
        $isdigittmp = $41 + -48 | 0;
        $isdigit = $isdigittmp >>> 0 < 10;
        if ($isdigit) {
          $42 = $39 + 2 | 0;
          $43 = HEAP82[$42 >> 0] | 0;
          $44 = $43 << 24 >> 24 == 36;
          $45 = $39 + 3 | 0;
          $$377 = $44 ? $45 : $38;
          $$$0269 = $44 ? 1 : $$0269;
          $isdigittmp$ = $44 ? $isdigittmp : -1;
          $$0253 = $isdigittmp$;
          $$1270 = $$$0269;
          $storemerge = $$377;
        } else {
          $$0253 = -1;
          $$1270 = $$0269;
          $storemerge = $38;
        }
        HEAP322[$5 >> 2] = $storemerge;
        $46 = HEAP82[$storemerge >> 0] | 0;
        $47 = $46 << 24 >> 24;
        $48 = $47 + -32 | 0;
        $49 = $48 >>> 0 < 32;
        L24:
          do {
            if ($49) {
              $$0262311 = 0;
              $329 = $46;
              $51 = $48;
              $storemerge273310 = $storemerge;
              while (1) {
                $50 = 1 << $51;
                $52 = $50 & 75913;
                $53 = ($52 | 0) == 0;
                if ($53) {
                  $$0262$lcssa = $$0262311;
                  $$lcssa295 = $329;
                  $62 = $storemerge273310;
                  break L24;
                }
                $54 = $50 | $$0262311;
                $55 = $storemerge273310 + 1 | 0;
                HEAP322[$5 >> 2] = $55;
                $56 = HEAP82[$55 >> 0] | 0;
                $57 = $56 << 24 >> 24;
                $58 = $57 + -32 | 0;
                $59 = $58 >>> 0 < 32;
                if ($59) {
                  $$0262311 = $54;
                  $329 = $56;
                  $51 = $58;
                  $storemerge273310 = $55;
                } else {
                  $$0262$lcssa = $54;
                  $$lcssa295 = $56;
                  $62 = $55;
                  break;
                }
              }
            } else {
              $$0262$lcssa = 0;
              $$lcssa295 = $46;
              $62 = $storemerge;
            }
          } while (0);
        $60 = $$lcssa295 << 24 >> 24 == 42;
        if ($60) {
          $61 = $62 + 1 | 0;
          $63 = HEAP82[$61 >> 0] | 0;
          $64 = $63 << 24 >> 24;
          $isdigittmp276 = $64 + -48 | 0;
          $isdigit277 = $isdigittmp276 >>> 0 < 10;
          if ($isdigit277) {
            $65 = $62 + 2 | 0;
            $66 = HEAP82[$65 >> 0] | 0;
            $67 = $66 << 24 >> 24 == 36;
            if ($67) {
              $68 = $4 + ($isdigittmp276 << 2) | 0;
              HEAP322[$68 >> 2] = 10;
              $69 = HEAP82[$61 >> 0] | 0;
              $70 = $69 << 24 >> 24;
              $71 = $70 + -48 | 0;
              $72 = $3 + ($71 << 3) | 0;
              $73 = $72;
              $74 = $73;
              $75 = HEAP322[$74 >> 2] | 0;
              $76 = $73 + 4 | 0;
              $77 = $76;
              HEAP322[$77 >> 2] | 0;
              $79 = $62 + 3 | 0;
              $$0259 = $75;
              $$2271 = 1;
              $storemerge278 = $79;
            } else {
              label = 23;
            }
          } else {
            label = 23;
          }
          if ((label | 0) == 23) {
            label = 0;
            $80 = ($$1270 | 0) == 0;
            if (!$80) {
              $$0 = -1;
              break;
            }
            if ($10) {
              $arglist_current = HEAP322[$2 >> 2] | 0;
              $81 = $arglist_current;
              $82 = 0 + 4 | 0;
              $expanded4 = $82;
              $expanded = $expanded4 - 1 | 0;
              $83 = $81 + $expanded | 0;
              $84 = 0 + 4 | 0;
              $expanded8 = $84;
              $expanded7 = $expanded8 - 1 | 0;
              $expanded6 = $expanded7 ^ -1;
              $85 = $83 & $expanded6;
              $86 = $85;
              $87 = HEAP322[$86 >> 2] | 0;
              $arglist_next = $86 + 4 | 0;
              HEAP322[$2 >> 2] = $arglist_next;
              $$0259 = $87;
              $$2271 = 0;
              $storemerge278 = $61;
            } else {
              $$0259 = 0;
              $$2271 = 0;
              $storemerge278 = $61;
            }
          }
          HEAP322[$5 >> 2] = $storemerge278;
          $88 = ($$0259 | 0) < 0;
          $89 = $$0262$lcssa | 8192;
          $90 = 0 - $$0259 | 0;
          $$$0262 = $88 ? $89 : $$0262$lcssa;
          $$$0259 = $88 ? $90 : $$0259;
          $$1260 = $$$0259;
          $$1263 = $$$0262;
          $$3272 = $$2271;
          $94 = $storemerge278;
        } else {
          $91 = _getint($5) | 0;
          $92 = ($91 | 0) < 0;
          if ($92) {
            $$0 = -1;
            break;
          }
          $$pre346 = HEAP322[$5 >> 2] | 0;
          $$1260 = $91;
          $$1263 = $$0262$lcssa;
          $$3272 = $$1270;
          $94 = $$pre346;
        }
        $93 = HEAP82[$94 >> 0] | 0;
        $95 = $93 << 24 >> 24 == 46;
        do {
          if ($95) {
            $96 = $94 + 1 | 0;
            $97 = HEAP82[$96 >> 0] | 0;
            $98 = $97 << 24 >> 24 == 42;
            if (!$98) {
              $125 = $94 + 1 | 0;
              HEAP322[$5 >> 2] = $125;
              $126 = _getint($5) | 0;
              $$pre347$pre = HEAP322[$5 >> 2] | 0;
              $$0254 = $126;
              $$pre347 = $$pre347$pre;
              break;
            }
            $99 = $94 + 2 | 0;
            $100 = HEAP82[$99 >> 0] | 0;
            $101 = $100 << 24 >> 24;
            $isdigittmp274 = $101 + -48 | 0;
            $isdigit275 = $isdigittmp274 >>> 0 < 10;
            if ($isdigit275) {
              $102 = $94 + 3 | 0;
              $103 = HEAP82[$102 >> 0] | 0;
              $104 = $103 << 24 >> 24 == 36;
              if ($104) {
                $105 = $4 + ($isdigittmp274 << 2) | 0;
                HEAP322[$105 >> 2] = 10;
                $106 = HEAP82[$99 >> 0] | 0;
                $107 = $106 << 24 >> 24;
                $108 = $107 + -48 | 0;
                $109 = $3 + ($108 << 3) | 0;
                $110 = $109;
                $111 = $110;
                $112 = HEAP322[$111 >> 2] | 0;
                $113 = $110 + 4 | 0;
                $114 = $113;
                HEAP322[$114 >> 2] | 0;
                $116 = $94 + 4 | 0;
                HEAP322[$5 >> 2] = $116;
                $$0254 = $112;
                $$pre347 = $116;
                break;
              }
            }
            $117 = ($$3272 | 0) == 0;
            if (!$117) {
              $$0 = -1;
              break L1;
            }
            if ($10) {
              $arglist_current2 = HEAP322[$2 >> 2] | 0;
              $118 = $arglist_current2;
              $119 = 0 + 4 | 0;
              $expanded11 = $119;
              $expanded10 = $expanded11 - 1 | 0;
              $120 = $118 + $expanded10 | 0;
              $121 = 0 + 4 | 0;
              $expanded15 = $121;
              $expanded14 = $expanded15 - 1 | 0;
              $expanded13 = $expanded14 ^ -1;
              $122 = $120 & $expanded13;
              $123 = $122;
              $124 = HEAP322[$123 >> 2] | 0;
              $arglist_next3 = $123 + 4 | 0;
              HEAP322[$2 >> 2] = $arglist_next3;
              $330 = $124;
            } else {
              $330 = 0;
            }
            HEAP322[$5 >> 2] = $99;
            $$0254 = $330;
            $$pre347 = $99;
          } else {
            $$0254 = -1;
            $$pre347 = $94;
          }
        } while (0);
        $$0252 = 0;
        $128 = $$pre347;
        while (1) {
          $127 = HEAP82[$128 >> 0] | 0;
          $129 = $127 << 24 >> 24;
          $130 = $129 + -65 | 0;
          $131 = $130 >>> 0 > 57;
          if ($131) {
            $$0 = -1;
            break L1;
          }
          $132 = $128 + 1 | 0;
          HEAP322[$5 >> 2] = $132;
          $133 = HEAP82[$128 >> 0] | 0;
          $134 = $133 << 24 >> 24;
          $135 = $134 + -65 | 0;
          $136 = (2958 + ($$0252 * 58 | 0) | 0) + $135 | 0;
          $137 = HEAP82[$136 >> 0] | 0;
          $138 = $137 & 255;
          $139 = $138 + -1 | 0;
          $140 = $139 >>> 0 < 8;
          if ($140) {
            $$0252 = $138;
            $128 = $132;
          } else {
            break;
          }
        }
        $141 = $137 << 24 >> 24 == 0;
        if ($141) {
          $$0 = -1;
          break;
        }
        $142 = $137 << 24 >> 24 == 19;
        $143 = ($$0253 | 0) > -1;
        do {
          if ($142) {
            if ($143) {
              $$0 = -1;
              break L1;
            } else {
              label = 49;
            }
          } else {
            if ($143) {
              $144 = $4 + ($$0253 << 2) | 0;
              HEAP322[$144 >> 2] = $138;
              $145 = $3 + ($$0253 << 3) | 0;
              $146 = $145;
              $147 = $146;
              $148 = HEAP322[$147 >> 2] | 0;
              $149 = $146 + 4 | 0;
              $150 = $149;
              $151 = HEAP322[$150 >> 2] | 0;
              $152 = $6;
              $153 = $152;
              HEAP322[$153 >> 2] = $148;
              $154 = $152 + 4 | 0;
              $155 = $154;
              HEAP322[$155 >> 2] = $151;
              label = 49;
              break;
            }
            if (!$10) {
              $$0 = 0;
              break L1;
            }
            _pop_arg($6, $138, $2);
          }
        } while (0);
        if ((label | 0) == 49) {
          label = 0;
          if (!$10) {
            $$0243 = 0;
            $$0247 = $$1248;
            $$0269 = $$3272;
            $21 = $132;
            continue;
          }
        }
        $156 = HEAP82[$128 >> 0] | 0;
        $157 = $156 << 24 >> 24;
        $158 = ($$0252 | 0) != 0;
        $159 = $157 & 15;
        $160 = ($159 | 0) == 3;
        $or$cond281 = $158 & $160;
        $161 = $157 & -33;
        $$0235 = $or$cond281 ? $161 : $157;
        $162 = $$1263 & 8192;
        $163 = ($162 | 0) == 0;
        $164 = $$1263 & -65537;
        $$1263$ = $163 ? $$1263 : $164;
        L71:
          do {
            switch ($$0235 | 0) {
              case 110: {
                $trunc = $$0252 & 255;
                switch ($trunc << 24 >> 24) {
                  case 0: {
                    $171 = HEAP322[$6 >> 2] | 0;
                    HEAP322[$171 >> 2] = $$1248;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 1: {
                    $172 = HEAP322[$6 >> 2] | 0;
                    HEAP322[$172 >> 2] = $$1248;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 2: {
                    $173 = ($$1248 | 0) < 0;
                    $174 = $173 << 31 >> 31;
                    $175 = HEAP322[$6 >> 2] | 0;
                    $176 = $175;
                    $177 = $176;
                    HEAP322[$177 >> 2] = $$1248;
                    $178 = $176 + 4 | 0;
                    $179 = $178;
                    HEAP322[$179 >> 2] = $174;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 3: {
                    $180 = $$1248 & 65535;
                    $181 = HEAP322[$6 >> 2] | 0;
                    HEAP162[$181 >> 1] = $180;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 4: {
                    $182 = $$1248 & 255;
                    $183 = HEAP322[$6 >> 2] | 0;
                    HEAP82[$183 >> 0] = $182;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 6: {
                    $184 = HEAP322[$6 >> 2] | 0;
                    HEAP322[$184 >> 2] = $$1248;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  case 7: {
                    $185 = ($$1248 | 0) < 0;
                    $186 = $185 << 31 >> 31;
                    $187 = HEAP322[$6 >> 2] | 0;
                    $188 = $187;
                    $189 = $188;
                    HEAP322[$189 >> 2] = $$1248;
                    $190 = $188 + 4 | 0;
                    $191 = $190;
                    HEAP322[$191 >> 2] = $186;
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                  default: {
                    $$0243 = 0;
                    $$0247 = $$1248;
                    $$0269 = $$3272;
                    $21 = $132;
                    continue L1;
                  }
                }
              }
              case 112: {
                $192 = $$0254 >>> 0 > 8;
                $193 = $192 ? $$0254 : 8;
                $194 = $$1263$ | 8;
                $$1236 = 120;
                $$1255 = $193;
                $$3265 = $194;
                label = 61;
                break;
              }
              case 88:
              case 120: {
                $$1236 = $$0235;
                $$1255 = $$0254;
                $$3265 = $$1263$;
                label = 61;
                break;
              }
              case 111: {
                $210 = $6;
                $211 = $210;
                $212 = HEAP322[$211 >> 2] | 0;
                $213 = $210 + 4 | 0;
                $214 = $213;
                $215 = HEAP322[$214 >> 2] | 0;
                $216 = _fmt_o($212, $215, $11) | 0;
                $217 = $$1263$ & 8;
                $218 = ($217 | 0) == 0;
                $219 = $216;
                $220 = $12 - $219 | 0;
                $221 = ($$0254 | 0) > ($220 | 0);
                $222 = $220 + 1 | 0;
                $223 = $218 | $221;
                $$0254$$0254$ = $223 ? $$0254 : $222;
                $$0228 = $216;
                $$1233 = 0;
                $$1238 = 3422;
                $$2256 = $$0254$$0254$;
                $$4266 = $$1263$;
                $248 = $212;
                $250 = $215;
                label = 67;
                break;
              }
              case 105:
              case 100: {
                $224 = $6;
                $225 = $224;
                $226 = HEAP322[$225 >> 2] | 0;
                $227 = $224 + 4 | 0;
                $228 = $227;
                $229 = HEAP322[$228 >> 2] | 0;
                $230 = ($229 | 0) < 0;
                if ($230) {
                  $231 = _i64Subtract(0, 0, $226 | 0, $229 | 0) | 0;
                  $232 = tempRet02;
                  $233 = $6;
                  $234 = $233;
                  HEAP322[$234 >> 2] = $231;
                  $235 = $233 + 4 | 0;
                  $236 = $235;
                  HEAP322[$236 >> 2] = $232;
                  $$0232 = 1;
                  $$0237 = 3422;
                  $242 = $231;
                  $243 = $232;
                  label = 66;
                  break L71;
                } else {
                  $237 = $$1263$ & 2048;
                  $238 = ($237 | 0) == 0;
                  $239 = $$1263$ & 1;
                  $240 = ($239 | 0) == 0;
                  $$ = $240 ? 3422 : 3424;
                  $$$ = $238 ? $$ : 3423;
                  $241 = $$1263$ & 2049;
                  $narrow = ($241 | 0) != 0;
                  $$284$ = $narrow & 1;
                  $$0232 = $$284$;
                  $$0237 = $$$;
                  $242 = $226;
                  $243 = $229;
                  label = 66;
                  break L71;
                }
              }
              case 117: {
                $165 = $6;
                $166 = $165;
                $167 = HEAP322[$166 >> 2] | 0;
                $168 = $165 + 4 | 0;
                $169 = $168;
                $170 = HEAP322[$169 >> 2] | 0;
                $$0232 = 0;
                $$0237 = 3422;
                $242 = $167;
                $243 = $170;
                label = 66;
                break;
              }
              case 99: {
                $259 = $6;
                $260 = $259;
                $261 = HEAP322[$260 >> 2] | 0;
                $262 = $259 + 4 | 0;
                $263 = $262;
                HEAP322[$263 >> 2] | 0;
                $265 = $261 & 255;
                HEAP82[$13 >> 0] = $265;
                $$2 = $13;
                $$2234 = 0;
                $$2239 = 3422;
                $$2251 = $11;
                $$5 = 1;
                $$6268 = $164;
                break;
              }
              case 109: {
                $266 = ___errno_location() | 0;
                $267 = HEAP322[$266 >> 2] | 0;
                $268 = _strerror($267) | 0;
                $$1 = $268;
                label = 71;
                break;
              }
              case 115: {
                $269 = HEAP322[$6 >> 2] | 0;
                $270 = ($269 | 0) != (0 | 0);
                $271 = $270 ? $269 : 3432;
                $$1 = $271;
                label = 71;
                break;
              }
              case 67: {
                $278 = $6;
                $279 = $278;
                $280 = HEAP322[$279 >> 2] | 0;
                $281 = $278 + 4 | 0;
                $282 = $281;
                HEAP322[$282 >> 2] | 0;
                HEAP322[$8 >> 2] = $280;
                HEAP322[$14 >> 2] = 0;
                HEAP322[$6 >> 2] = $8;
                $$4258355 = -1;
                $331 = $8;
                label = 75;
                break;
              }
              case 83: {
                $$pre349 = HEAP322[$6 >> 2] | 0;
                $284 = ($$0254 | 0) == 0;
                if ($284) {
                  _pad_684($0, 32, $$1260, 0, $$1263$);
                  $$0240$lcssa357 = 0;
                  label = 84;
                } else {
                  $$4258355 = $$0254;
                  $331 = $$pre349;
                  label = 75;
                }
                break;
              }
              case 65:
              case 71:
              case 70:
              case 69:
              case 97:
              case 103:
              case 102:
              case 101: {
                $306 = +HEAPF642[$6 >> 3];
                $307 = _fmt_fp($0, $306, $$1260, $$0254, $$1263$, $$0235) | 0;
                $$0243 = $307;
                $$0247 = $$1248;
                $$0269 = $$3272;
                $21 = $132;
                continue L1;
              }
              default: {
                $$2 = $21;
                $$2234 = 0;
                $$2239 = 3422;
                $$2251 = $11;
                $$5 = $$0254;
                $$6268 = $$1263$;
              }
            }
          } while (0);
        L95:
          do {
            if ((label | 0) == 61) {
              label = 0;
              $195 = $6;
              $196 = $195;
              $197 = HEAP322[$196 >> 2] | 0;
              $198 = $195 + 4 | 0;
              $199 = $198;
              $200 = HEAP322[$199 >> 2] | 0;
              $201 = $$1236 & 32;
              $202 = _fmt_x($197, $200, $11, $201) | 0;
              $203 = ($197 | 0) == 0;
              $204 = ($200 | 0) == 0;
              $205 = $203 & $204;
              $206 = $$3265 & 8;
              $207 = ($206 | 0) == 0;
              $or$cond283 = $207 | $205;
              $208 = $$1236 >> 4;
              $209 = 3422 + $208 | 0;
              $$289 = $or$cond283 ? 3422 : $209;
              $$290 = $or$cond283 ? 0 : 2;
              $$0228 = $202;
              $$1233 = $$290;
              $$1238 = $$289;
              $$2256 = $$1255;
              $$4266 = $$3265;
              $248 = $197;
              $250 = $200;
              label = 67;
            } else if ((label | 0) == 66) {
              label = 0;
              $244 = _fmt_u($242, $243, $11) | 0;
              $$0228 = $244;
              $$1233 = $$0232;
              $$1238 = $$0237;
              $$2256 = $$0254;
              $$4266 = $$1263$;
              $248 = $242;
              $250 = $243;
              label = 67;
            } else if ((label | 0) == 71) {
              label = 0;
              $272 = _memchr($$1, 0, $$0254) | 0;
              $273 = ($272 | 0) == (0 | 0);
              $274 = $272;
              $275 = $$1;
              $276 = $274 - $275 | 0;
              $277 = $$1 + $$0254 | 0;
              $$3257 = $273 ? $$0254 : $276;
              $$1250 = $273 ? $277 : $272;
              $$2 = $$1;
              $$2234 = 0;
              $$2239 = 3422;
              $$2251 = $$1250;
              $$5 = $$3257;
              $$6268 = $164;
            } else if ((label | 0) == 75) {
              label = 0;
              $$0229322 = $331;
              $$0240321 = 0;
              $$1244320 = 0;
              while (1) {
                $285 = HEAP322[$$0229322 >> 2] | 0;
                $286 = ($285 | 0) == 0;
                if ($286) {
                  $$0240$lcssa = $$0240321;
                  $$2245 = $$1244320;
                  break;
                }
                $287 = _wctomb($9, $285) | 0;
                $288 = ($287 | 0) < 0;
                $289 = $$4258355 - $$0240321 | 0;
                $290 = $287 >>> 0 > $289 >>> 0;
                $or$cond286 = $288 | $290;
                if ($or$cond286) {
                  $$0240$lcssa = $$0240321;
                  $$2245 = $287;
                  break;
                }
                $291 = $$0229322 + 4 | 0;
                $292 = $287 + $$0240321 | 0;
                $293 = $$4258355 >>> 0 > $292 >>> 0;
                if ($293) {
                  $$0229322 = $291;
                  $$0240321 = $292;
                  $$1244320 = $287;
                } else {
                  $$0240$lcssa = $292;
                  $$2245 = $287;
                  break;
                }
              }
              $294 = ($$2245 | 0) < 0;
              if ($294) {
                $$0 = -1;
                break L1;
              }
              _pad_684($0, 32, $$1260, $$0240$lcssa, $$1263$);
              $295 = ($$0240$lcssa | 0) == 0;
              if ($295) {
                $$0240$lcssa357 = 0;
                label = 84;
              } else {
                $$1230333 = $331;
                $$1241332 = 0;
                while (1) {
                  $296 = HEAP322[$$1230333 >> 2] | 0;
                  $297 = ($296 | 0) == 0;
                  if ($297) {
                    $$0240$lcssa357 = $$0240$lcssa;
                    label = 84;
                    break L95;
                  }
                  $298 = _wctomb($9, $296) | 0;
                  $299 = $298 + $$1241332 | 0;
                  $300 = ($299 | 0) > ($$0240$lcssa | 0);
                  if ($300) {
                    $$0240$lcssa357 = $$0240$lcssa;
                    label = 84;
                    break L95;
                  }
                  $301 = $$1230333 + 4 | 0;
                  _out($0, $9, $298);
                  $302 = $299 >>> 0 < $$0240$lcssa >>> 0;
                  if ($302) {
                    $$1230333 = $301;
                    $$1241332 = $299;
                  } else {
                    $$0240$lcssa357 = $$0240$lcssa;
                    label = 84;
                    break;
                  }
                }
              }
            }
          } while (0);
        if ((label | 0) == 67) {
          label = 0;
          $245 = ($$2256 | 0) > -1;
          $246 = $$4266 & -65537;
          $$$4266 = $245 ? $246 : $$4266;
          $247 = ($248 | 0) != 0;
          $249 = ($250 | 0) != 0;
          $251 = $247 | $249;
          $252 = ($$2256 | 0) != 0;
          $or$cond = $252 | $251;
          $253 = $$0228;
          $254 = $12 - $253 | 0;
          $255 = $251 ^ 1;
          $256 = $255 & 1;
          $257 = $256 + $254 | 0;
          $258 = ($$2256 | 0) > ($257 | 0);
          $$2256$ = $258 ? $$2256 : $257;
          $$2256$$$2256 = $or$cond ? $$2256$ : $$2256;
          $$0228$ = $or$cond ? $$0228 : $11;
          $$2 = $$0228$;
          $$2234 = $$1233;
          $$2239 = $$1238;
          $$2251 = $11;
          $$5 = $$2256$$$2256;
          $$6268 = $$$4266;
        } else if ((label | 0) == 84) {
          label = 0;
          $303 = $$1263$ ^ 8192;
          _pad_684($0, 32, $$1260, $$0240$lcssa357, $303);
          $304 = ($$1260 | 0) > ($$0240$lcssa357 | 0);
          $305 = $304 ? $$1260 : $$0240$lcssa357;
          $$0243 = $305;
          $$0247 = $$1248;
          $$0269 = $$3272;
          $21 = $132;
          continue;
        }
        $308 = $$2251;
        $309 = $$2;
        $310 = $308 - $309 | 0;
        $311 = ($$5 | 0) < ($310 | 0);
        $$$5 = $311 ? $310 : $$5;
        $312 = $$$5 + $$2234 | 0;
        $313 = ($$1260 | 0) < ($312 | 0);
        $$2261 = $313 ? $312 : $$1260;
        _pad_684($0, 32, $$2261, $312, $$6268);
        _out($0, $$2239, $$2234);
        $314 = $$6268 ^ 65536;
        _pad_684($0, 48, $$2261, $312, $314);
        _pad_684($0, 48, $$$5, $310, 0);
        _out($0, $$2, $310);
        $315 = $$6268 ^ 8192;
        _pad_684($0, 32, $$2261, $312, $315);
        $$0243 = $$2261;
        $$0247 = $$1248;
        $$0269 = $$3272;
        $21 = $132;
      }
    L114:
      do {
        if ((label | 0) == 87) {
          $316 = ($0 | 0) == (0 | 0);
          if ($316) {
            $317 = ($$0269 | 0) == 0;
            if ($317) {
              $$0 = 0;
            } else {
              $$2242305 = 1;
              while (1) {
                $318 = $4 + ($$2242305 << 2) | 0;
                $319 = HEAP322[$318 >> 2] | 0;
                $320 = ($319 | 0) == 0;
                if ($320) {
                  $$3303 = $$2242305;
                  break;
                }
                $321 = $3 + ($$2242305 << 3) | 0;
                _pop_arg($321, $319, $2);
                $322 = $$2242305 + 1 | 0;
                $323 = ($322 | 0) < 10;
                if ($323) {
                  $$2242305 = $322;
                } else {
                  $$0 = 1;
                  break L114;
                }
              }
              while (1) {
                $326 = $4 + ($$3303 << 2) | 0;
                $327 = HEAP322[$326 >> 2] | 0;
                $328 = ($327 | 0) == 0;
                $325 = $$3303 + 1 | 0;
                if (!$328) {
                  $$0 = -1;
                  break L114;
                }
                $324 = ($325 | 0) < 10;
                if ($324) {
                  $$3303 = $325;
                } else {
                  $$0 = 1;
                  break;
                }
              }
            }
          } else {
            $$0 = $$1248;
          }
        }
      } while (0);
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function ___lockfile($0) {
    return 0;
  }
  function _out($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $3 = 0, $4 = 0, $5 = 0;
    $3 = HEAP322[$0 >> 2] | 0;
    $4 = $3 & 32;
    $5 = ($4 | 0) == 0;
    if ($5) {
      ___fwritex($1, $2, $0) | 0;
    }
    return;
  }
  function _getint($0) {
    $0 = $0 | 0;
    var $$0$lcssa = 0, $$06 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $isdigit = 0, $isdigit5 = 0, $isdigittmp = 0, $isdigittmp4 = 0, $isdigittmp7 = 0;
    $1 = HEAP322[$0 >> 2] | 0;
    $2 = HEAP82[$1 >> 0] | 0;
    $3 = $2 << 24 >> 24;
    $isdigittmp4 = $3 + -48 | 0;
    $isdigit5 = $isdigittmp4 >>> 0 < 10;
    if ($isdigit5) {
      $$06 = 0;
      $7 = $1;
      $isdigittmp7 = $isdigittmp4;
      while (1) {
        $4 = $$06 * 10 | 0;
        $5 = $isdigittmp7 + $4 | 0;
        $6 = $7 + 1 | 0;
        HEAP322[$0 >> 2] = $6;
        $8 = HEAP82[$6 >> 0] | 0;
        $9 = $8 << 24 >> 24;
        $isdigittmp = $9 + -48 | 0;
        $isdigit = $isdigittmp >>> 0 < 10;
        if ($isdigit) {
          $$06 = $5;
          $7 = $6;
          $isdigittmp7 = $isdigittmp;
        } else {
          $$0$lcssa = $5;
          break;
        }
      }
    } else {
      $$0$lcssa = 0;
    }
    return $$0$lcssa | 0;
  }
  function _pop_arg($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$mask = 0, $$mask31 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
    var $116 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
    var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
    var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
    var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
    var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $arglist_current = 0, $arglist_current11 = 0, $arglist_current14 = 0, $arglist_current17 = 0;
    var $arglist_current2 = 0, $arglist_current20 = 0, $arglist_current23 = 0, $arglist_current26 = 0, $arglist_current5 = 0, $arglist_current8 = 0, $arglist_next = 0, $arglist_next12 = 0, $arglist_next15 = 0, $arglist_next18 = 0, $arglist_next21 = 0, $arglist_next24 = 0, $arglist_next27 = 0, $arglist_next3 = 0, $arglist_next6 = 0, $arglist_next9 = 0, $expanded = 0, $expanded28 = 0, $expanded30 = 0, $expanded31 = 0;
    var $expanded32 = 0, $expanded34 = 0, $expanded35 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded41 = 0, $expanded42 = 0, $expanded44 = 0, $expanded45 = 0, $expanded46 = 0, $expanded48 = 0, $expanded49 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded55 = 0, $expanded56 = 0, $expanded58 = 0, $expanded59 = 0;
    var $expanded60 = 0, $expanded62 = 0, $expanded63 = 0, $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded69 = 0, $expanded70 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded76 = 0, $expanded77 = 0, $expanded79 = 0, $expanded80 = 0, $expanded81 = 0, $expanded83 = 0, $expanded84 = 0, $expanded86 = 0, $expanded87 = 0;
    var $expanded88 = 0, $expanded90 = 0, $expanded91 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0;
    $3 = $1 >>> 0 > 20;
    L1:
      do {
        if (!$3) {
          do {
            switch ($1 | 0) {
              case 9: {
                $arglist_current = HEAP322[$2 >> 2] | 0;
                $4 = $arglist_current;
                $5 = 0 + 4 | 0;
                $expanded28 = $5;
                $expanded = $expanded28 - 1 | 0;
                $6 = $4 + $expanded | 0;
                $7 = 0 + 4 | 0;
                $expanded32 = $7;
                $expanded31 = $expanded32 - 1 | 0;
                $expanded30 = $expanded31 ^ -1;
                $8 = $6 & $expanded30;
                $9 = $8;
                $10 = HEAP322[$9 >> 2] | 0;
                $arglist_next = $9 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next;
                HEAP322[$0 >> 2] = $10;
                break L1;
              }
              case 10: {
                $arglist_current2 = HEAP322[$2 >> 2] | 0;
                $11 = $arglist_current2;
                $12 = 0 + 4 | 0;
                $expanded35 = $12;
                $expanded34 = $expanded35 - 1 | 0;
                $13 = $11 + $expanded34 | 0;
                $14 = 0 + 4 | 0;
                $expanded39 = $14;
                $expanded38 = $expanded39 - 1 | 0;
                $expanded37 = $expanded38 ^ -1;
                $15 = $13 & $expanded37;
                $16 = $15;
                $17 = HEAP322[$16 >> 2] | 0;
                $arglist_next3 = $16 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next3;
                $18 = ($17 | 0) < 0;
                $19 = $18 << 31 >> 31;
                $20 = $0;
                $21 = $20;
                HEAP322[$21 >> 2] = $17;
                $22 = $20 + 4 | 0;
                $23 = $22;
                HEAP322[$23 >> 2] = $19;
                break L1;
              }
              case 11: {
                $arglist_current5 = HEAP322[$2 >> 2] | 0;
                $24 = $arglist_current5;
                $25 = 0 + 4 | 0;
                $expanded42 = $25;
                $expanded41 = $expanded42 - 1 | 0;
                $26 = $24 + $expanded41 | 0;
                $27 = 0 + 4 | 0;
                $expanded46 = $27;
                $expanded45 = $expanded46 - 1 | 0;
                $expanded44 = $expanded45 ^ -1;
                $28 = $26 & $expanded44;
                $29 = $28;
                $30 = HEAP322[$29 >> 2] | 0;
                $arglist_next6 = $29 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next6;
                $31 = $0;
                $32 = $31;
                HEAP322[$32 >> 2] = $30;
                $33 = $31 + 4 | 0;
                $34 = $33;
                HEAP322[$34 >> 2] = 0;
                break L1;
              }
              case 12: {
                $arglist_current8 = HEAP322[$2 >> 2] | 0;
                $35 = $arglist_current8;
                $36 = 0 + 8 | 0;
                $expanded49 = $36;
                $expanded48 = $expanded49 - 1 | 0;
                $37 = $35 + $expanded48 | 0;
                $38 = 0 + 8 | 0;
                $expanded53 = $38;
                $expanded52 = $expanded53 - 1 | 0;
                $expanded51 = $expanded52 ^ -1;
                $39 = $37 & $expanded51;
                $40 = $39;
                $41 = $40;
                $42 = $41;
                $43 = HEAP322[$42 >> 2] | 0;
                $44 = $41 + 4 | 0;
                $45 = $44;
                $46 = HEAP322[$45 >> 2] | 0;
                $arglist_next9 = $40 + 8 | 0;
                HEAP322[$2 >> 2] = $arglist_next9;
                $47 = $0;
                $48 = $47;
                HEAP322[$48 >> 2] = $43;
                $49 = $47 + 4 | 0;
                $50 = $49;
                HEAP322[$50 >> 2] = $46;
                break L1;
              }
              case 13: {
                $arglist_current11 = HEAP322[$2 >> 2] | 0;
                $51 = $arglist_current11;
                $52 = 0 + 4 | 0;
                $expanded56 = $52;
                $expanded55 = $expanded56 - 1 | 0;
                $53 = $51 + $expanded55 | 0;
                $54 = 0 + 4 | 0;
                $expanded60 = $54;
                $expanded59 = $expanded60 - 1 | 0;
                $expanded58 = $expanded59 ^ -1;
                $55 = $53 & $expanded58;
                $56 = $55;
                $57 = HEAP322[$56 >> 2] | 0;
                $arglist_next12 = $56 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next12;
                $58 = $57 & 65535;
                $59 = $58 << 16 >> 16;
                $60 = ($59 | 0) < 0;
                $61 = $60 << 31 >> 31;
                $62 = $0;
                $63 = $62;
                HEAP322[$63 >> 2] = $59;
                $64 = $62 + 4 | 0;
                $65 = $64;
                HEAP322[$65 >> 2] = $61;
                break L1;
              }
              case 14: {
                $arglist_current14 = HEAP322[$2 >> 2] | 0;
                $66 = $arglist_current14;
                $67 = 0 + 4 | 0;
                $expanded63 = $67;
                $expanded62 = $expanded63 - 1 | 0;
                $68 = $66 + $expanded62 | 0;
                $69 = 0 + 4 | 0;
                $expanded67 = $69;
                $expanded66 = $expanded67 - 1 | 0;
                $expanded65 = $expanded66 ^ -1;
                $70 = $68 & $expanded65;
                $71 = $70;
                $72 = HEAP322[$71 >> 2] | 0;
                $arglist_next15 = $71 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next15;
                $$mask31 = $72 & 65535;
                $73 = $0;
                $74 = $73;
                HEAP322[$74 >> 2] = $$mask31;
                $75 = $73 + 4 | 0;
                $76 = $75;
                HEAP322[$76 >> 2] = 0;
                break L1;
              }
              case 15: {
                $arglist_current17 = HEAP322[$2 >> 2] | 0;
                $77 = $arglist_current17;
                $78 = 0 + 4 | 0;
                $expanded70 = $78;
                $expanded69 = $expanded70 - 1 | 0;
                $79 = $77 + $expanded69 | 0;
                $80 = 0 + 4 | 0;
                $expanded74 = $80;
                $expanded73 = $expanded74 - 1 | 0;
                $expanded72 = $expanded73 ^ -1;
                $81 = $79 & $expanded72;
                $82 = $81;
                $83 = HEAP322[$82 >> 2] | 0;
                $arglist_next18 = $82 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next18;
                $84 = $83 & 255;
                $85 = $84 << 24 >> 24;
                $86 = ($85 | 0) < 0;
                $87 = $86 << 31 >> 31;
                $88 = $0;
                $89 = $88;
                HEAP322[$89 >> 2] = $85;
                $90 = $88 + 4 | 0;
                $91 = $90;
                HEAP322[$91 >> 2] = $87;
                break L1;
              }
              case 16: {
                $arglist_current20 = HEAP322[$2 >> 2] | 0;
                $92 = $arglist_current20;
                $93 = 0 + 4 | 0;
                $expanded77 = $93;
                $expanded76 = $expanded77 - 1 | 0;
                $94 = $92 + $expanded76 | 0;
                $95 = 0 + 4 | 0;
                $expanded81 = $95;
                $expanded80 = $expanded81 - 1 | 0;
                $expanded79 = $expanded80 ^ -1;
                $96 = $94 & $expanded79;
                $97 = $96;
                $98 = HEAP322[$97 >> 2] | 0;
                $arglist_next21 = $97 + 4 | 0;
                HEAP322[$2 >> 2] = $arglist_next21;
                $$mask = $98 & 255;
                $99 = $0;
                $100 = $99;
                HEAP322[$100 >> 2] = $$mask;
                $101 = $99 + 4 | 0;
                $102 = $101;
                HEAP322[$102 >> 2] = 0;
                break L1;
              }
              case 17: {
                $arglist_current23 = HEAP322[$2 >> 2] | 0;
                $103 = $arglist_current23;
                $104 = 0 + 8 | 0;
                $expanded84 = $104;
                $expanded83 = $expanded84 - 1 | 0;
                $105 = $103 + $expanded83 | 0;
                $106 = 0 + 8 | 0;
                $expanded88 = $106;
                $expanded87 = $expanded88 - 1 | 0;
                $expanded86 = $expanded87 ^ -1;
                $107 = $105 & $expanded86;
                $108 = $107;
                $109 = +HEAPF642[$108 >> 3];
                $arglist_next24 = $108 + 8 | 0;
                HEAP322[$2 >> 2] = $arglist_next24;
                HEAPF642[$0 >> 3] = $109;
                break L1;
              }
              case 18: {
                $arglist_current26 = HEAP322[$2 >> 2] | 0;
                $110 = $arglist_current26;
                $111 = 0 + 8 | 0;
                $expanded91 = $111;
                $expanded90 = $expanded91 - 1 | 0;
                $112 = $110 + $expanded90 | 0;
                $113 = 0 + 8 | 0;
                $expanded95 = $113;
                $expanded94 = $expanded95 - 1 | 0;
                $expanded93 = $expanded94 ^ -1;
                $114 = $112 & $expanded93;
                $115 = $114;
                $116 = +HEAPF642[$115 >> 3];
                $arglist_next27 = $115 + 8 | 0;
                HEAP322[$2 >> 2] = $arglist_next27;
                HEAPF642[$0 >> 3] = $116;
                break L1;
              }
              default: {
                break L1;
              }
            }
          } while (0);
        }
      } while (0);
    return;
  }
  function _fmt_x($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$05$lcssa = 0, $$056 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = ($0 | 0) == 0;
    $5 = ($1 | 0) == 0;
    $6 = $4 & $5;
    if ($6) {
      $$05$lcssa = $2;
    } else {
      $$056 = $2;
      $15 = $1;
      $8 = $0;
      while (1) {
        $7 = $8 & 15;
        $9 = 3470 + $7 | 0;
        $10 = HEAP82[$9 >> 0] | 0;
        $11 = $10 & 255;
        $12 = $11 | $3;
        $13 = $12 & 255;
        $14 = $$056 + -1 | 0;
        HEAP82[$14 >> 0] = $13;
        $16 = _bitshift64Lshr($8 | 0, $15 | 0, 4) | 0;
        $17 = tempRet02;
        $18 = ($16 | 0) == 0;
        $19 = ($17 | 0) == 0;
        $20 = $18 & $19;
        if ($20) {
          $$05$lcssa = $14;
          break;
        } else {
          $$056 = $14;
          $15 = $17;
          $8 = $16;
        }
      }
    }
    return $$05$lcssa | 0;
  }
  function _fmt_o($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$0$lcssa = 0, $$06 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $3 = ($0 | 0) == 0;
    $4 = ($1 | 0) == 0;
    $5 = $3 & $4;
    if ($5) {
      $$0$lcssa = $2;
    } else {
      $$06 = $2;
      $11 = $1;
      $7 = $0;
      while (1) {
        $6 = $7 & 255;
        $8 = $6 & 7;
        $9 = $8 | 48;
        $10 = $$06 + -1 | 0;
        HEAP82[$10 >> 0] = $9;
        $12 = _bitshift64Lshr($7 | 0, $11 | 0, 3) | 0;
        $13 = tempRet02;
        $14 = ($12 | 0) == 0;
        $15 = ($13 | 0) == 0;
        $16 = $14 & $15;
        if ($16) {
          $$0$lcssa = $10;
          break;
        } else {
          $$06 = $10;
          $11 = $13;
          $7 = $12;
        }
      }
    }
    return $$0$lcssa | 0;
  }
  function _fmt_u($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$010$lcssa$off0 = 0, $$012 = 0, $$09$lcssa = 0, $$0914 = 0, $$1$lcssa = 0, $$111 = 0, $10 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
    var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $3 = $1 >>> 0 > 0;
    $4 = $0 >>> 0 > 4294967295;
    $5 = ($1 | 0) == 0;
    $6 = $5 & $4;
    $7 = $3 | $6;
    if ($7) {
      $$0914 = $2;
      $8 = $0;
      $9 = $1;
      while (1) {
        $10 = ___uremdi3($8 | 0, $9 | 0, 10, 0) | 0;
        $12 = $10 & 255;
        $13 = $12 | 48;
        $14 = $$0914 + -1 | 0;
        HEAP82[$14 >> 0] = $13;
        $15 = ___udivdi3($8 | 0, $9 | 0, 10, 0) | 0;
        $16 = tempRet02;
        $17 = $9 >>> 0 > 9;
        $18 = $8 >>> 0 > 4294967295;
        $19 = ($9 | 0) == 9;
        $20 = $19 & $18;
        $21 = $17 | $20;
        if ($21) {
          $$0914 = $14;
          $8 = $15;
          $9 = $16;
        } else {
          break;
        }
      }
      $$010$lcssa$off0 = $15;
      $$09$lcssa = $14;
    } else {
      $$010$lcssa$off0 = $0;
      $$09$lcssa = $2;
    }
    $22 = ($$010$lcssa$off0 | 0) == 0;
    if ($22) {
      $$1$lcssa = $$09$lcssa;
    } else {
      $$012 = $$010$lcssa$off0;
      $$111 = $$09$lcssa;
      while (1) {
        $23 = ($$012 >>> 0) % 10 & -1;
        $24 = $23 | 48;
        $25 = $24 & 255;
        $26 = $$111 + -1 | 0;
        HEAP82[$26 >> 0] = $25;
        $27 = ($$012 >>> 0) / 10 & -1;
        $28 = $$012 >>> 0 < 10;
        if ($28) {
          $$1$lcssa = $26;
          break;
        } else {
          $$012 = $27;
          $$111 = $26;
        }
      }
    }
    return $$1$lcssa | 0;
  }
  function _strerror($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0;
    $1 = ___pthread_self_104() | 0;
    $2 = $1 + 188 | 0;
    $3 = HEAP322[$2 >> 2] | 0;
    $4 = ___strerror_l($0, $3) | 0;
    return $4 | 0;
  }
  function _memchr($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$0$lcssa = 0, $$035$lcssa = 0, $$035$lcssa65 = 0, $$03555 = 0, $$036$lcssa = 0, $$036$lcssa64 = 0, $$03654 = 0, $$046 = 0, $$137$lcssa = 0, $$13745 = 0, $$140 = 0, $$2 = 0, $$23839 = 0, $$3 = 0, $$lcssa = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0;
    var $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0;
    var $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond53 = 0, label = 0;
    $3 = $1 & 255;
    $4 = $0;
    $5 = $4 & 3;
    $6 = ($5 | 0) != 0;
    $7 = ($2 | 0) != 0;
    $or$cond53 = $7 & $6;
    L1:
      do {
        if ($or$cond53) {
          $8 = $1 & 255;
          $$03555 = $0;
          $$03654 = $2;
          while (1) {
            $9 = HEAP82[$$03555 >> 0] | 0;
            $10 = $9 << 24 >> 24 == $8 << 24 >> 24;
            if ($10) {
              $$035$lcssa65 = $$03555;
              $$036$lcssa64 = $$03654;
              label = 6;
              break L1;
            }
            $11 = $$03555 + 1 | 0;
            $12 = $$03654 + -1 | 0;
            $13 = $11;
            $14 = $13 & 3;
            $15 = ($14 | 0) != 0;
            $16 = ($12 | 0) != 0;
            $or$cond = $16 & $15;
            if ($or$cond) {
              $$03555 = $11;
              $$03654 = $12;
            } else {
              $$035$lcssa = $11;
              $$036$lcssa = $12;
              $$lcssa = $16;
              label = 5;
              break;
            }
          }
        } else {
          $$035$lcssa = $0;
          $$036$lcssa = $2;
          $$lcssa = $7;
          label = 5;
        }
      } while (0);
    if ((label | 0) == 5) {
      if ($$lcssa) {
        $$035$lcssa65 = $$035$lcssa;
        $$036$lcssa64 = $$036$lcssa;
        label = 6;
      } else {
        $$2 = $$035$lcssa;
        $$3 = 0;
      }
    }
    L8:
      do {
        if ((label | 0) == 6) {
          $17 = HEAP82[$$035$lcssa65 >> 0] | 0;
          $18 = $1 & 255;
          $19 = $17 << 24 >> 24 == $18 << 24 >> 24;
          if ($19) {
            $$2 = $$035$lcssa65;
            $$3 = $$036$lcssa64;
          } else {
            $20 = Math_imul($3, 16843009) | 0;
            $21 = $$036$lcssa64 >>> 0 > 3;
            L11:
              do {
                if ($21) {
                  $$046 = $$035$lcssa65;
                  $$13745 = $$036$lcssa64;
                  while (1) {
                    $22 = HEAP322[$$046 >> 2] | 0;
                    $23 = $22 ^ $20;
                    $24 = $23 + -16843009 | 0;
                    $25 = $23 & -2139062144;
                    $26 = $25 ^ -2139062144;
                    $27 = $26 & $24;
                    $28 = ($27 | 0) == 0;
                    if (!$28) {
                      break;
                    }
                    $29 = $$046 + 4 | 0;
                    $30 = $$13745 + -4 | 0;
                    $31 = $30 >>> 0 > 3;
                    if ($31) {
                      $$046 = $29;
                      $$13745 = $30;
                    } else {
                      $$0$lcssa = $29;
                      $$137$lcssa = $30;
                      label = 11;
                      break L11;
                    }
                  }
                  $$140 = $$046;
                  $$23839 = $$13745;
                } else {
                  $$0$lcssa = $$035$lcssa65;
                  $$137$lcssa = $$036$lcssa64;
                  label = 11;
                }
              } while (0);
            if ((label | 0) == 11) {
              $32 = ($$137$lcssa | 0) == 0;
              if ($32) {
                $$2 = $$0$lcssa;
                $$3 = 0;
                break;
              } else {
                $$140 = $$0$lcssa;
                $$23839 = $$137$lcssa;
              }
            }
            while (1) {
              $33 = HEAP82[$$140 >> 0] | 0;
              $34 = $33 << 24 >> 24 == $18 << 24 >> 24;
              if ($34) {
                $$2 = $$140;
                $$3 = $$23839;
                break L8;
              }
              $35 = $$140 + 1 | 0;
              $36 = $$23839 + -1 | 0;
              $37 = ($36 | 0) == 0;
              if ($37) {
                $$2 = $35;
                $$3 = 0;
                break;
              } else {
                $$140 = $35;
                $$23839 = $36;
              }
            }
          }
        }
      } while (0);
    $38 = ($$3 | 0) != 0;
    $39 = $38 ? $$2 : 0;
    return $39 | 0;
  }
  function _pad_684($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$0$lcssa = 0, $$011 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 256 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(256 | 0);
    $5 = sp;
    $6 = $4 & 73728;
    $7 = ($6 | 0) == 0;
    $8 = ($2 | 0) > ($3 | 0);
    $or$cond = $8 & $7;
    if ($or$cond) {
      $9 = $2 - $3 | 0;
      $10 = $9 >>> 0 < 256;
      $11 = $10 ? $9 : 256;
      _memset($5 | 0, $1 | 0, $11 | 0) | 0;
      $12 = $9 >>> 0 > 255;
      if ($12) {
        $13 = $2 - $3 | 0;
        $$011 = $9;
        while (1) {
          _out($0, $5, 256);
          $14 = $$011 + -256 | 0;
          $15 = $14 >>> 0 > 255;
          if ($15) {
            $$011 = $14;
          } else {
            break;
          }
        }
        $16 = $13 & 255;
        $$0$lcssa = $16;
      } else {
        $$0$lcssa = $9;
      }
      _out($0, $5, $$0$lcssa);
    }
    STACKTOP2 = sp;
    return;
  }
  function _wctomb($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0 = 0, $2 = 0, $3 = 0;
    $2 = ($0 | 0) == (0 | 0);
    if ($2) {
      $$0 = 0;
    } else {
      $3 = _wcrtomb($0, $1) | 0;
      $$0 = $3;
    }
    return $$0 | 0;
  }
  function _fmt_fp($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = +$1;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    $5 = $5 | 0;
    var $$ = 0, $$$ = 0, $$$$559 = 0, $$$3484 = 0, $$$3484691 = 0, $$$3484692 = 0, $$$3501 = 0, $$$4502 = 0, $$$542 = 0, $$$559 = 0, $$0 = 0, $$0463$lcssa = 0, $$0463584 = 0, $$0464594 = 0, $$0471 = 0, $$0479 = 0, $$0487642 = 0, $$0488 = 0, $$0488653 = 0, $$0488655 = 0;
    var $$0496$$9 = 0, $$0497654 = 0, $$0498 = 0, $$0509582 = 0, $$0510 = 0, $$0511 = 0, $$0514637 = 0, $$0520 = 0, $$0521 = 0, $$0521$ = 0, $$0523 = 0, $$0525 = 0, $$0527 = 0, $$0527629 = 0, $$0527631 = 0, $$0530636 = 0, $$1465 = 0, $$1467 = 0, $$1469 = 0, $$1472 = 0;
    var $$1480 = 0, $$1482$lcssa = 0, $$1482661 = 0, $$1489641 = 0, $$1499$lcssa = 0, $$1499660 = 0, $$1508583 = 0, $$1512$lcssa = 0, $$1512607 = 0, $$1515 = 0, $$1524 = 0, $$1526 = 0, $$1528614 = 0, $$1531$lcssa = 0, $$1531630 = 0, $$1598 = 0, $$2 = 0, $$2473 = 0, $$2476 = 0, $$2476$$547 = 0;
    var $$2476$$549 = 0, $$2483$ph = 0, $$2500 = 0, $$2513 = 0, $$2516618 = 0, $$2529 = 0, $$2532617 = 0, $$3 = 0, $$3477 = 0, $$3484$lcssa = 0, $$3484648 = 0, $$3501$lcssa = 0, $$3501647 = 0, $$3533613 = 0, $$4 = 0, $$4478$lcssa = 0, $$4478590 = 0, $$4492 = 0, $$4502 = 0, $$4518 = 0;
    var $$5$lcssa = 0, $$534$ = 0, $$539 = 0, $$539$ = 0, $$542 = 0, $$546 = 0, $$548 = 0, $$5486$lcssa = 0, $$5486623 = 0, $$5493597 = 0, $$5519$ph = 0, $$555 = 0, $$556 = 0, $$559 = 0, $$5602 = 0, $$6 = 0, $$6494589 = 0, $$7495601 = 0, $$7505 = 0, $$7505$ = 0;
    var $$7505$ph = 0, $$8 = 0, $$9$ph = 0, $$lcssa673 = 0, $$neg = 0, $$neg567 = 0, $$pn = 0, $$pn566 = 0, $$pr = 0, $$pr564 = 0, $$pre = 0, $$pre$phi690Z2D = 0, $$pre689 = 0, $$sink545$lcssa = 0, $$sink545622 = 0, $$sink562 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0;
    var $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0;
    var $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $132 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0;
    var $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0;
    var $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0;
    var $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0;
    var $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0;
    var $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0;
    var $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0;
    var $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0;
    var $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0;
    var $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
    var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
    var $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0;
    var $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0;
    var $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0;
    var $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
    var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
    var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
    var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $exitcond = 0;
    var $narrow = 0, $not$ = 0, $notlhs = 0, $notrhs = 0, $or$cond = 0, $or$cond3$not = 0, $or$cond537 = 0, $or$cond541 = 0, $or$cond544 = 0, $or$cond554 = 0, $or$cond6 = 0, $scevgep684 = 0, $scevgep684685 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 560 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(560 | 0);
    $6 = sp + 8 | 0;
    $7 = sp;
    $8 = sp + 524 | 0;
    $9 = $8;
    $10 = sp + 512 | 0;
    HEAP322[$7 >> 2] = 0;
    $11 = $10 + 12 | 0;
    ___DOUBLE_BITS_685($1) | 0;
    $12 = tempRet02;
    $13 = ($12 | 0) < 0;
    if ($13) {
      $14 = -$1;
      $$0471 = $14;
      $$0520 = 1;
      $$0521 = 3439;
    } else {
      $15 = $4 & 2048;
      $16 = ($15 | 0) == 0;
      $17 = $4 & 1;
      $18 = ($17 | 0) == 0;
      $$ = $18 ? 3440 : 3445;
      $$$ = $16 ? $$ : 3442;
      $19 = $4 & 2049;
      $narrow = ($19 | 0) != 0;
      $$534$ = $narrow & 1;
      $$0471 = $1;
      $$0520 = $$534$;
      $$0521 = $$$;
    }
    ___DOUBLE_BITS_685($$0471) | 0;
    $20 = tempRet02;
    $21 = $20 & 2146435072;
    $22 = $21 >>> 0 < 2146435072;
    $23 = 0 < 0;
    $24 = ($21 | 0) == 2146435072;
    $25 = $24 & $23;
    $26 = $22 | $25;
    do {
      if ($26) {
        $35 = +_frexpl($$0471, $7);
        $36 = $35 * 2;
        $37 = $36 != 0;
        if ($37) {
          $38 = HEAP322[$7 >> 2] | 0;
          $39 = $38 + -1 | 0;
          HEAP322[$7 >> 2] = $39;
        }
        $40 = $5 | 32;
        $41 = ($40 | 0) == 97;
        if ($41) {
          $42 = $5 & 32;
          $43 = ($42 | 0) == 0;
          $44 = $$0521 + 9 | 0;
          $$0521$ = $43 ? $$0521 : $44;
          $45 = $$0520 | 2;
          $46 = $3 >>> 0 > 11;
          $47 = 12 - $3 | 0;
          $48 = ($47 | 0) == 0;
          $49 = $46 | $48;
          do {
            if ($49) {
              $$1472 = $36;
            } else {
              $$0509582 = 8;
              $$1508583 = $47;
              while (1) {
                $50 = $$1508583 + -1 | 0;
                $51 = $$0509582 * 16;
                $52 = ($50 | 0) == 0;
                if ($52) {
                  break;
                } else {
                  $$0509582 = $51;
                  $$1508583 = $50;
                }
              }
              $53 = HEAP82[$$0521$ >> 0] | 0;
              $54 = $53 << 24 >> 24 == 45;
              if ($54) {
                $55 = -$36;
                $56 = $55 - $51;
                $57 = $51 + $56;
                $58 = -$57;
                $$1472 = $58;
                break;
              } else {
                $59 = $36 + $51;
                $60 = $59 - $51;
                $$1472 = $60;
                break;
              }
            }
          } while (0);
          $61 = HEAP322[$7 >> 2] | 0;
          $62 = ($61 | 0) < 0;
          $63 = 0 - $61 | 0;
          $64 = $62 ? $63 : $61;
          $65 = ($64 | 0) < 0;
          $66 = $65 << 31 >> 31;
          $67 = _fmt_u($64, $66, $11) | 0;
          $68 = ($67 | 0) == ($11 | 0);
          if ($68) {
            $69 = $10 + 11 | 0;
            HEAP82[$69 >> 0] = 48;
            $$0511 = $69;
          } else {
            $$0511 = $67;
          }
          $70 = $61 >> 31;
          $71 = $70 & 2;
          $72 = $71 + 43 | 0;
          $73 = $72 & 255;
          $74 = $$0511 + -1 | 0;
          HEAP82[$74 >> 0] = $73;
          $75 = $5 + 15 | 0;
          $76 = $75 & 255;
          $77 = $$0511 + -2 | 0;
          HEAP82[$77 >> 0] = $76;
          $notrhs = ($3 | 0) < 1;
          $78 = $4 & 8;
          $79 = ($78 | 0) == 0;
          $$0523 = $8;
          $$2473 = $$1472;
          while (1) {
            $80 = ~~$$2473;
            $81 = 3470 + $80 | 0;
            $82 = HEAP82[$81 >> 0] | 0;
            $83 = $82 & 255;
            $84 = $83 | $42;
            $85 = $84 & 255;
            $86 = $$0523 + 1 | 0;
            HEAP82[$$0523 >> 0] = $85;
            $87 = +($80 | 0);
            $88 = $$2473 - $87;
            $89 = $88 * 16;
            $90 = $86;
            $91 = $90 - $9 | 0;
            $92 = ($91 | 0) == 1;
            if ($92) {
              $notlhs = $89 == 0;
              $or$cond3$not = $notrhs & $notlhs;
              $or$cond = $79 & $or$cond3$not;
              if ($or$cond) {
                $$1524 = $86;
              } else {
                $93 = $$0523 + 2 | 0;
                HEAP82[$86 >> 0] = 46;
                $$1524 = $93;
              }
            } else {
              $$1524 = $86;
            }
            $94 = $89 != 0;
            if ($94) {
              $$0523 = $$1524;
              $$2473 = $89;
            } else {
              break;
            }
          }
          $95 = ($3 | 0) != 0;
          $96 = $77;
          $97 = $11;
          $98 = $$1524;
          $99 = $98 - $9 | 0;
          $100 = $97 - $96 | 0;
          $101 = $99 + -2 | 0;
          $102 = ($101 | 0) < ($3 | 0);
          $or$cond537 = $95 & $102;
          $103 = $3 + 2 | 0;
          $$pn = $or$cond537 ? $103 : $99;
          $$0525 = $100 + $45 | 0;
          $104 = $$0525 + $$pn | 0;
          _pad_684($0, 32, $2, $104, $4);
          _out($0, $$0521$, $45);
          $105 = $4 ^ 65536;
          _pad_684($0, 48, $2, $104, $105);
          _out($0, $8, $99);
          $106 = $$pn - $99 | 0;
          _pad_684($0, 48, $106, 0, 0);
          _out($0, $77, $100);
          $107 = $4 ^ 8192;
          _pad_684($0, 32, $2, $104, $107);
          $$sink562 = $104;
          break;
        }
        $108 = ($3 | 0) < 0;
        $$539 = $108 ? 6 : $3;
        if ($37) {
          $109 = $36 * 268435456;
          $110 = HEAP322[$7 >> 2] | 0;
          $111 = $110 + -28 | 0;
          HEAP322[$7 >> 2] = $111;
          $$3 = $109;
          $$pr = $111;
        } else {
          $$pre = HEAP322[$7 >> 2] | 0;
          $$3 = $36;
          $$pr = $$pre;
        }
        $112 = ($$pr | 0) < 0;
        $113 = $6 + 288 | 0;
        $$556 = $112 ? $6 : $113;
        $$0498 = $$556;
        $$4 = $$3;
        while (1) {
          $114 = ~~$$4 >>> 0;
          HEAP322[$$0498 >> 2] = $114;
          $115 = $$0498 + 4 | 0;
          $116 = +($114 >>> 0);
          $117 = $$4 - $116;
          $118 = $117 * 1e9;
          $119 = $118 != 0;
          if ($119) {
            $$0498 = $115;
            $$4 = $118;
          } else {
            break;
          }
        }
        $120 = ($$pr | 0) > 0;
        if ($120) {
          $$1482661 = $$556;
          $$1499660 = $115;
          $122 = $$pr;
          while (1) {
            $121 = ($122 | 0) < 29;
            $123 = $121 ? $122 : 29;
            $$0488653 = $$1499660 + -4 | 0;
            $124 = $$0488653 >>> 0 < $$1482661 >>> 0;
            if ($124) {
              $$2483$ph = $$1482661;
            } else {
              $$0488655 = $$0488653;
              $$0497654 = 0;
              while (1) {
                $125 = HEAP322[$$0488655 >> 2] | 0;
                $126 = _bitshift64Shl($125 | 0, 0, $123 | 0) | 0;
                $127 = tempRet02;
                $128 = _i64Add($126 | 0, $127 | 0, $$0497654 | 0, 0) | 0;
                $129 = tempRet02;
                $130 = ___uremdi3($128 | 0, $129 | 0, 1e9, 0) | 0;
                HEAP322[$$0488655 >> 2] = $130;
                $132 = ___udivdi3($128 | 0, $129 | 0, 1e9, 0) | 0;
                $$0488 = $$0488655 + -4 | 0;
                $134 = $$0488 >>> 0 < $$1482661 >>> 0;
                if ($134) {
                  break;
                } else {
                  $$0488655 = $$0488;
                  $$0497654 = $132;
                }
              }
              $135 = ($132 | 0) == 0;
              if ($135) {
                $$2483$ph = $$1482661;
              } else {
                $136 = $$1482661 + -4 | 0;
                HEAP322[$136 >> 2] = $132;
                $$2483$ph = $136;
              }
            }
            $$2500 = $$1499660;
            while (1) {
              $137 = $$2500 >>> 0 > $$2483$ph >>> 0;
              if (!$137) {
                break;
              }
              $138 = $$2500 + -4 | 0;
              $139 = HEAP322[$138 >> 2] | 0;
              $140 = ($139 | 0) == 0;
              if ($140) {
                $$2500 = $138;
              } else {
                break;
              }
            }
            $141 = HEAP322[$7 >> 2] | 0;
            $142 = $141 - $123 | 0;
            HEAP322[$7 >> 2] = $142;
            $143 = ($142 | 0) > 0;
            if ($143) {
              $$1482661 = $$2483$ph;
              $$1499660 = $$2500;
              $122 = $142;
            } else {
              $$1482$lcssa = $$2483$ph;
              $$1499$lcssa = $$2500;
              $$pr564 = $142;
              break;
            }
          }
        } else {
          $$1482$lcssa = $$556;
          $$1499$lcssa = $115;
          $$pr564 = $$pr;
        }
        $144 = ($$pr564 | 0) < 0;
        if ($144) {
          $145 = $$539 + 25 | 0;
          $146 = ($145 | 0) / 9 & -1;
          $147 = $146 + 1 | 0;
          $148 = ($40 | 0) == 102;
          $$3484648 = $$1482$lcssa;
          $$3501647 = $$1499$lcssa;
          $150 = $$pr564;
          while (1) {
            $149 = 0 - $150 | 0;
            $151 = ($149 | 0) < 9;
            $152 = $151 ? $149 : 9;
            $153 = $$3484648 >>> 0 < $$3501647 >>> 0;
            if ($153) {
              $157 = 1 << $152;
              $158 = $157 + -1 | 0;
              $159 = 1e9 >>> $152;
              $$0487642 = 0;
              $$1489641 = $$3484648;
              while (1) {
                $160 = HEAP322[$$1489641 >> 2] | 0;
                $161 = $160 & $158;
                $162 = $160 >>> $152;
                $163 = $162 + $$0487642 | 0;
                HEAP322[$$1489641 >> 2] = $163;
                $164 = Math_imul($161, $159) | 0;
                $165 = $$1489641 + 4 | 0;
                $166 = $165 >>> 0 < $$3501647 >>> 0;
                if ($166) {
                  $$0487642 = $164;
                  $$1489641 = $165;
                } else {
                  break;
                }
              }
              $167 = HEAP322[$$3484648 >> 2] | 0;
              $168 = ($167 | 0) == 0;
              $169 = $$3484648 + 4 | 0;
              $$$3484 = $168 ? $169 : $$3484648;
              $170 = ($164 | 0) == 0;
              if ($170) {
                $$$3484692 = $$$3484;
                $$4502 = $$3501647;
              } else {
                $171 = $$3501647 + 4 | 0;
                HEAP322[$$3501647 >> 2] = $164;
                $$$3484692 = $$$3484;
                $$4502 = $171;
              }
            } else {
              $154 = HEAP322[$$3484648 >> 2] | 0;
              $155 = ($154 | 0) == 0;
              $156 = $$3484648 + 4 | 0;
              $$$3484691 = $155 ? $156 : $$3484648;
              $$$3484692 = $$$3484691;
              $$4502 = $$3501647;
            }
            $172 = $148 ? $$556 : $$$3484692;
            $173 = $$4502;
            $174 = $172;
            $175 = $173 - $174 | 0;
            $176 = $175 >> 2;
            $177 = ($176 | 0) > ($147 | 0);
            $178 = $172 + ($147 << 2) | 0;
            $$$4502 = $177 ? $178 : $$4502;
            $179 = HEAP322[$7 >> 2] | 0;
            $180 = $179 + $152 | 0;
            HEAP322[$7 >> 2] = $180;
            $181 = ($180 | 0) < 0;
            if ($181) {
              $$3484648 = $$$3484692;
              $$3501647 = $$$4502;
              $150 = $180;
            } else {
              $$3484$lcssa = $$$3484692;
              $$3501$lcssa = $$$4502;
              break;
            }
          }
        } else {
          $$3484$lcssa = $$1482$lcssa;
          $$3501$lcssa = $$1499$lcssa;
        }
        $182 = $$3484$lcssa >>> 0 < $$3501$lcssa >>> 0;
        $183 = $$556;
        if ($182) {
          $184 = $$3484$lcssa;
          $185 = $183 - $184 | 0;
          $186 = $185 >> 2;
          $187 = $186 * 9 | 0;
          $188 = HEAP322[$$3484$lcssa >> 2] | 0;
          $189 = $188 >>> 0 < 10;
          if ($189) {
            $$1515 = $187;
          } else {
            $$0514637 = $187;
            $$0530636 = 10;
            while (1) {
              $190 = $$0530636 * 10 | 0;
              $191 = $$0514637 + 1 | 0;
              $192 = $188 >>> 0 < $190 >>> 0;
              if ($192) {
                $$1515 = $191;
                break;
              } else {
                $$0514637 = $191;
                $$0530636 = $190;
              }
            }
          }
        } else {
          $$1515 = 0;
        }
        $193 = ($40 | 0) != 102;
        $194 = $193 ? $$1515 : 0;
        $195 = $$539 - $194 | 0;
        $196 = ($40 | 0) == 103;
        $197 = ($$539 | 0) != 0;
        $198 = $197 & $196;
        $$neg = $198 << 31 >> 31;
        $199 = $195 + $$neg | 0;
        $200 = $$3501$lcssa;
        $201 = $200 - $183 | 0;
        $202 = $201 >> 2;
        $203 = $202 * 9 | 0;
        $204 = $203 + -9 | 0;
        $205 = ($199 | 0) < ($204 | 0);
        if ($205) {
          $206 = $$556 + 4 | 0;
          $207 = $199 + 9216 | 0;
          $208 = ($207 | 0) / 9 & -1;
          $209 = $208 + -1024 | 0;
          $210 = $206 + ($209 << 2) | 0;
          $211 = ($207 | 0) % 9 & -1;
          $$0527629 = $211 + 1 | 0;
          $212 = ($$0527629 | 0) < 9;
          if ($212) {
            $$0527631 = $$0527629;
            $$1531630 = 10;
            while (1) {
              $213 = $$1531630 * 10 | 0;
              $$0527 = $$0527631 + 1 | 0;
              $exitcond = ($$0527 | 0) == 9;
              if ($exitcond) {
                $$1531$lcssa = $213;
                break;
              } else {
                $$0527631 = $$0527;
                $$1531630 = $213;
              }
            }
          } else {
            $$1531$lcssa = 10;
          }
          $214 = HEAP322[$210 >> 2] | 0;
          $215 = ($214 >>> 0) % ($$1531$lcssa >>> 0) & -1;
          $216 = ($215 | 0) == 0;
          $217 = $210 + 4 | 0;
          $218 = ($217 | 0) == ($$3501$lcssa | 0);
          $or$cond541 = $218 & $216;
          if ($or$cond541) {
            $$4492 = $210;
            $$4518 = $$1515;
            $$8 = $$3484$lcssa;
          } else {
            $219 = ($214 >>> 0) / ($$1531$lcssa >>> 0) & -1;
            $220 = $219 & 1;
            $221 = ($220 | 0) == 0;
            $$542 = $221 ? 9007199254740992 : 9007199254740994;
            $222 = ($$1531$lcssa | 0) / 2 & -1;
            $223 = $215 >>> 0 < $222 >>> 0;
            $224 = ($215 | 0) == ($222 | 0);
            $or$cond544 = $218 & $224;
            $$559 = $or$cond544 ? 1 : 1.5;
            $$$559 = $223 ? 0.5 : $$559;
            $225 = ($$0520 | 0) == 0;
            if ($225) {
              $$1467 = $$$559;
              $$1469 = $$542;
            } else {
              $226 = HEAP82[$$0521 >> 0] | 0;
              $227 = $226 << 24 >> 24 == 45;
              $228 = -$$542;
              $229 = -$$$559;
              $$$542 = $227 ? $228 : $$542;
              $$$$559 = $227 ? $229 : $$$559;
              $$1467 = $$$$559;
              $$1469 = $$$542;
            }
            $230 = $214 - $215 | 0;
            HEAP322[$210 >> 2] = $230;
            $231 = $$1469 + $$1467;
            $232 = $231 != $$1469;
            if ($232) {
              $233 = $230 + $$1531$lcssa | 0;
              HEAP322[$210 >> 2] = $233;
              $234 = $233 >>> 0 > 999999999;
              if ($234) {
                $$5486623 = $$3484$lcssa;
                $$sink545622 = $210;
                while (1) {
                  $235 = $$sink545622 + -4 | 0;
                  HEAP322[$$sink545622 >> 2] = 0;
                  $236 = $235 >>> 0 < $$5486623 >>> 0;
                  if ($236) {
                    $237 = $$5486623 + -4 | 0;
                    HEAP322[$237 >> 2] = 0;
                    $$6 = $237;
                  } else {
                    $$6 = $$5486623;
                  }
                  $238 = HEAP322[$235 >> 2] | 0;
                  $239 = $238 + 1 | 0;
                  HEAP322[$235 >> 2] = $239;
                  $240 = $239 >>> 0 > 999999999;
                  if ($240) {
                    $$5486623 = $$6;
                    $$sink545622 = $235;
                  } else {
                    $$5486$lcssa = $$6;
                    $$sink545$lcssa = $235;
                    break;
                  }
                }
              } else {
                $$5486$lcssa = $$3484$lcssa;
                $$sink545$lcssa = $210;
              }
              $241 = $$5486$lcssa;
              $242 = $183 - $241 | 0;
              $243 = $242 >> 2;
              $244 = $243 * 9 | 0;
              $245 = HEAP322[$$5486$lcssa >> 2] | 0;
              $246 = $245 >>> 0 < 10;
              if ($246) {
                $$4492 = $$sink545$lcssa;
                $$4518 = $244;
                $$8 = $$5486$lcssa;
              } else {
                $$2516618 = $244;
                $$2532617 = 10;
                while (1) {
                  $247 = $$2532617 * 10 | 0;
                  $248 = $$2516618 + 1 | 0;
                  $249 = $245 >>> 0 < $247 >>> 0;
                  if ($249) {
                    $$4492 = $$sink545$lcssa;
                    $$4518 = $248;
                    $$8 = $$5486$lcssa;
                    break;
                  } else {
                    $$2516618 = $248;
                    $$2532617 = $247;
                  }
                }
              }
            } else {
              $$4492 = $210;
              $$4518 = $$1515;
              $$8 = $$3484$lcssa;
            }
          }
          $250 = $$4492 + 4 | 0;
          $251 = $$3501$lcssa >>> 0 > $250 >>> 0;
          $$$3501 = $251 ? $250 : $$3501$lcssa;
          $$5519$ph = $$4518;
          $$7505$ph = $$$3501;
          $$9$ph = $$8;
        } else {
          $$5519$ph = $$1515;
          $$7505$ph = $$3501$lcssa;
          $$9$ph = $$3484$lcssa;
        }
        $$7505 = $$7505$ph;
        while (1) {
          $252 = $$7505 >>> 0 > $$9$ph >>> 0;
          if (!$252) {
            $$lcssa673 = 0;
            break;
          }
          $253 = $$7505 + -4 | 0;
          $254 = HEAP322[$253 >> 2] | 0;
          $255 = ($254 | 0) == 0;
          if ($255) {
            $$7505 = $253;
          } else {
            $$lcssa673 = 1;
            break;
          }
        }
        $256 = 0 - $$5519$ph | 0;
        do {
          if ($196) {
            $not$ = $197 ^ 1;
            $257 = $not$ & 1;
            $$539$ = $257 + $$539 | 0;
            $258 = ($$539$ | 0) > ($$5519$ph | 0);
            $259 = ($$5519$ph | 0) > -5;
            $or$cond6 = $258 & $259;
            if ($or$cond6) {
              $260 = $5 + -1 | 0;
              $$neg567 = $$539$ + -1 | 0;
              $261 = $$neg567 - $$5519$ph | 0;
              $$0479 = $260;
              $$2476 = $261;
            } else {
              $262 = $5 + -2 | 0;
              $263 = $$539$ + -1 | 0;
              $$0479 = $262;
              $$2476 = $263;
            }
            $264 = $4 & 8;
            $265 = ($264 | 0) == 0;
            if ($265) {
              if ($$lcssa673) {
                $266 = $$7505 + -4 | 0;
                $267 = HEAP322[$266 >> 2] | 0;
                $268 = ($267 | 0) == 0;
                if ($268) {
                  $$2529 = 9;
                } else {
                  $269 = ($267 >>> 0) % 10 & -1;
                  $270 = ($269 | 0) == 0;
                  if ($270) {
                    $$1528614 = 0;
                    $$3533613 = 10;
                    while (1) {
                      $271 = $$3533613 * 10 | 0;
                      $272 = $$1528614 + 1 | 0;
                      $273 = ($267 >>> 0) % ($271 >>> 0) & -1;
                      $274 = ($273 | 0) == 0;
                      if ($274) {
                        $$1528614 = $272;
                        $$3533613 = $271;
                      } else {
                        $$2529 = $272;
                        break;
                      }
                    }
                  } else {
                    $$2529 = 0;
                  }
                }
              } else {
                $$2529 = 9;
              }
              $275 = $$0479 | 32;
              $276 = ($275 | 0) == 102;
              $277 = $$7505;
              $278 = $277 - $183 | 0;
              $279 = $278 >> 2;
              $280 = $279 * 9 | 0;
              $281 = $280 + -9 | 0;
              if ($276) {
                $282 = $281 - $$2529 | 0;
                $283 = ($282 | 0) > 0;
                $$546 = $283 ? $282 : 0;
                $284 = ($$2476 | 0) < ($$546 | 0);
                $$2476$$547 = $284 ? $$2476 : $$546;
                $$1480 = $$0479;
                $$3477 = $$2476$$547;
                $$pre$phi690Z2D = 0;
                break;
              } else {
                $285 = $281 + $$5519$ph | 0;
                $286 = $285 - $$2529 | 0;
                $287 = ($286 | 0) > 0;
                $$548 = $287 ? $286 : 0;
                $288 = ($$2476 | 0) < ($$548 | 0);
                $$2476$$549 = $288 ? $$2476 : $$548;
                $$1480 = $$0479;
                $$3477 = $$2476$$549;
                $$pre$phi690Z2D = 0;
                break;
              }
            } else {
              $$1480 = $$0479;
              $$3477 = $$2476;
              $$pre$phi690Z2D = $264;
            }
          } else {
            $$pre689 = $4 & 8;
            $$1480 = $5;
            $$3477 = $$539;
            $$pre$phi690Z2D = $$pre689;
          }
        } while (0);
        $289 = $$3477 | $$pre$phi690Z2D;
        $290 = ($289 | 0) != 0;
        $291 = $290 & 1;
        $292 = $$1480 | 32;
        $293 = ($292 | 0) == 102;
        if ($293) {
          $294 = ($$5519$ph | 0) > 0;
          $295 = $294 ? $$5519$ph : 0;
          $$2513 = 0;
          $$pn566 = $295;
        } else {
          $296 = ($$5519$ph | 0) < 0;
          $297 = $296 ? $256 : $$5519$ph;
          $298 = ($297 | 0) < 0;
          $299 = $298 << 31 >> 31;
          $300 = _fmt_u($297, $299, $11) | 0;
          $301 = $11;
          $302 = $300;
          $303 = $301 - $302 | 0;
          $304 = ($303 | 0) < 2;
          if ($304) {
            $$1512607 = $300;
            while (1) {
              $305 = $$1512607 + -1 | 0;
              HEAP82[$305 >> 0] = 48;
              $306 = $305;
              $307 = $301 - $306 | 0;
              $308 = ($307 | 0) < 2;
              if ($308) {
                $$1512607 = $305;
              } else {
                $$1512$lcssa = $305;
                break;
              }
            }
          } else {
            $$1512$lcssa = $300;
          }
          $309 = $$5519$ph >> 31;
          $310 = $309 & 2;
          $311 = $310 + 43 | 0;
          $312 = $311 & 255;
          $313 = $$1512$lcssa + -1 | 0;
          HEAP82[$313 >> 0] = $312;
          $314 = $$1480 & 255;
          $315 = $$1512$lcssa + -2 | 0;
          HEAP82[$315 >> 0] = $314;
          $316 = $315;
          $317 = $301 - $316 | 0;
          $$2513 = $315;
          $$pn566 = $317;
        }
        $318 = $$0520 + 1 | 0;
        $319 = $318 + $$3477 | 0;
        $$1526 = $319 + $291 | 0;
        $320 = $$1526 + $$pn566 | 0;
        _pad_684($0, 32, $2, $320, $4);
        _out($0, $$0521, $$0520);
        $321 = $4 ^ 65536;
        _pad_684($0, 48, $2, $320, $321);
        if ($293) {
          $322 = $$9$ph >>> 0 > $$556 >>> 0;
          $$0496$$9 = $322 ? $$556 : $$9$ph;
          $323 = $8 + 9 | 0;
          $324 = $323;
          $325 = $8 + 8 | 0;
          $$5493597 = $$0496$$9;
          while (1) {
            $326 = HEAP322[$$5493597 >> 2] | 0;
            $327 = _fmt_u($326, 0, $323) | 0;
            $328 = ($$5493597 | 0) == ($$0496$$9 | 0);
            if ($328) {
              $334 = ($327 | 0) == ($323 | 0);
              if ($334) {
                HEAP82[$325 >> 0] = 48;
                $$1465 = $325;
              } else {
                $$1465 = $327;
              }
            } else {
              $329 = $327 >>> 0 > $8 >>> 0;
              if ($329) {
                $330 = $327;
                $331 = $330 - $9 | 0;
                _memset($8 | 0, 48, $331 | 0) | 0;
                $$0464594 = $327;
                while (1) {
                  $332 = $$0464594 + -1 | 0;
                  $333 = $332 >>> 0 > $8 >>> 0;
                  if ($333) {
                    $$0464594 = $332;
                  } else {
                    $$1465 = $332;
                    break;
                  }
                }
              } else {
                $$1465 = $327;
              }
            }
            $335 = $$1465;
            $336 = $324 - $335 | 0;
            _out($0, $$1465, $336);
            $337 = $$5493597 + 4 | 0;
            $338 = $337 >>> 0 > $$556 >>> 0;
            if ($338) {
              break;
            } else {
              $$5493597 = $337;
            }
          }
          $339 = ($289 | 0) == 0;
          if (!$339) {
            _out($0, 3486, 1);
          }
          $340 = $337 >>> 0 < $$7505 >>> 0;
          $341 = ($$3477 | 0) > 0;
          $342 = $340 & $341;
          if ($342) {
            $$4478590 = $$3477;
            $$6494589 = $337;
            while (1) {
              $343 = HEAP322[$$6494589 >> 2] | 0;
              $344 = _fmt_u($343, 0, $323) | 0;
              $345 = $344 >>> 0 > $8 >>> 0;
              if ($345) {
                $346 = $344;
                $347 = $346 - $9 | 0;
                _memset($8 | 0, 48, $347 | 0) | 0;
                $$0463584 = $344;
                while (1) {
                  $348 = $$0463584 + -1 | 0;
                  $349 = $348 >>> 0 > $8 >>> 0;
                  if ($349) {
                    $$0463584 = $348;
                  } else {
                    $$0463$lcssa = $348;
                    break;
                  }
                }
              } else {
                $$0463$lcssa = $344;
              }
              $350 = ($$4478590 | 0) < 9;
              $351 = $350 ? $$4478590 : 9;
              _out($0, $$0463$lcssa, $351);
              $352 = $$6494589 + 4 | 0;
              $353 = $$4478590 + -9 | 0;
              $354 = $352 >>> 0 < $$7505 >>> 0;
              $355 = ($$4478590 | 0) > 9;
              $356 = $354 & $355;
              if ($356) {
                $$4478590 = $353;
                $$6494589 = $352;
              } else {
                $$4478$lcssa = $353;
                break;
              }
            }
          } else {
            $$4478$lcssa = $$3477;
          }
          $357 = $$4478$lcssa + 9 | 0;
          _pad_684($0, 48, $357, 9, 0);
        } else {
          $358 = $$9$ph + 4 | 0;
          $$7505$ = $$lcssa673 ? $$7505 : $358;
          $359 = ($$3477 | 0) > -1;
          if ($359) {
            $360 = $8 + 9 | 0;
            $361 = ($$pre$phi690Z2D | 0) == 0;
            $362 = $360;
            $363 = 0 - $9 | 0;
            $364 = $8 + 8 | 0;
            $$5602 = $$3477;
            $$7495601 = $$9$ph;
            while (1) {
              $365 = HEAP322[$$7495601 >> 2] | 0;
              $366 = _fmt_u($365, 0, $360) | 0;
              $367 = ($366 | 0) == ($360 | 0);
              if ($367) {
                HEAP82[$364 >> 0] = 48;
                $$0 = $364;
              } else {
                $$0 = $366;
              }
              $368 = ($$7495601 | 0) == ($$9$ph | 0);
              do {
                if ($368) {
                  $372 = $$0 + 1 | 0;
                  _out($0, $$0, 1);
                  $373 = ($$5602 | 0) < 1;
                  $or$cond554 = $361 & $373;
                  if ($or$cond554) {
                    $$2 = $372;
                    break;
                  }
                  _out($0, 3486, 1);
                  $$2 = $372;
                } else {
                  $369 = $$0 >>> 0 > $8 >>> 0;
                  if (!$369) {
                    $$2 = $$0;
                    break;
                  }
                  $scevgep684 = $$0 + $363 | 0;
                  $scevgep684685 = $scevgep684;
                  _memset($8 | 0, 48, $scevgep684685 | 0) | 0;
                  $$1598 = $$0;
                  while (1) {
                    $370 = $$1598 + -1 | 0;
                    $371 = $370 >>> 0 > $8 >>> 0;
                    if ($371) {
                      $$1598 = $370;
                    } else {
                      $$2 = $370;
                      break;
                    }
                  }
                }
              } while (0);
              $374 = $$2;
              $375 = $362 - $374 | 0;
              $376 = ($$5602 | 0) > ($375 | 0);
              $377 = $376 ? $375 : $$5602;
              _out($0, $$2, $377);
              $378 = $$5602 - $375 | 0;
              $379 = $$7495601 + 4 | 0;
              $380 = $379 >>> 0 < $$7505$ >>> 0;
              $381 = ($378 | 0) > -1;
              $382 = $380 & $381;
              if ($382) {
                $$5602 = $378;
                $$7495601 = $379;
              } else {
                $$5$lcssa = $378;
                break;
              }
            }
          } else {
            $$5$lcssa = $$3477;
          }
          $383 = $$5$lcssa + 18 | 0;
          _pad_684($0, 48, $383, 18, 0);
          $384 = $11;
          $385 = $$2513;
          $386 = $384 - $385 | 0;
          _out($0, $$2513, $386);
        }
        $387 = $4 ^ 8192;
        _pad_684($0, 32, $2, $320, $387);
        $$sink562 = $320;
      } else {
        $27 = $5 & 32;
        $28 = ($27 | 0) != 0;
        $29 = $28 ? 3458 : 3462;
        $30 = $$0471 != $$0471 | false;
        $31 = $28 ? 5389 : 3466;
        $$0510 = $30 ? $31 : $29;
        $32 = $$0520 + 3 | 0;
        $33 = $4 & -65537;
        _pad_684($0, 32, $2, $32, $33);
        _out($0, $$0521, $$0520);
        _out($0, $$0510, 3);
        $34 = $4 ^ 8192;
        _pad_684($0, 32, $2, $32, $34);
        $$sink562 = $32;
      }
    } while (0);
    $388 = ($$sink562 | 0) < ($2 | 0);
    $$555 = $388 ? $2 : $$sink562;
    STACKTOP2 = sp;
    return $$555 | 0;
  }
  function ___DOUBLE_BITS_685($0) {
    $0 = +$0;
    var $1 = 0, $2 = 0;
    HEAPF642[tempDoublePtr2 >> 3] = $0;
    $1 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $2 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    tempRet02 = $2;
    return $1 | 0;
  }
  function _frexpl($0, $1) {
    $0 = +$0;
    $1 = $1 | 0;
    var $2 = 0;
    $2 = +_frexp($0, $1);
    return +$2;
  }
  function _frexp($0, $1) {
    $0 = +$0;
    $1 = $1 | 0;
    var $$0 = 0, $$016 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $storemerge = 0, $trunc$clear = 0;
    HEAPF642[tempDoublePtr2 >> 3] = $0;
    $2 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $3 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    $4 = _bitshift64Lshr($2 | 0, $3 | 0, 52) | 0;
    $6 = $4 & 65535;
    $trunc$clear = $6 & 2047;
    switch ($trunc$clear << 16 >> 16) {
      case 0: {
        $7 = $0 != 0;
        if ($7) {
          $8 = $0 * 18446744073709552e3;
          $9 = +_frexp($8, $1);
          $10 = HEAP322[$1 >> 2] | 0;
          $11 = $10 + -64 | 0;
          $$016 = $9;
          $storemerge = $11;
        } else {
          $$016 = $0;
          $storemerge = 0;
        }
        HEAP322[$1 >> 2] = $storemerge;
        $$0 = $$016;
        break;
      }
      case 2047: {
        $$0 = $0;
        break;
      }
      default: {
        $12 = $4 & 2047;
        $13 = $12 + -1022 | 0;
        HEAP322[$1 >> 2] = $13;
        $14 = $3 & -2146435073;
        $15 = $14 | 1071644672;
        HEAP322[tempDoublePtr2 >> 2] = $2;
        HEAP322[tempDoublePtr2 + 4 >> 2] = $15;
        $16 = +HEAPF642[tempDoublePtr2 >> 3];
        $$0 = $16;
      }
    }
    return +$$0;
  }
  function _wcrtomb($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
    var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
    var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $not$ = 0, $or$cond = 0;
    $3 = ($0 | 0) == (0 | 0);
    do {
      if ($3) {
        $$0 = 1;
      } else {
        $4 = $1 >>> 0 < 128;
        if ($4) {
          $5 = $1 & 255;
          HEAP82[$0 >> 0] = $5;
          $$0 = 1;
          break;
        }
        $6 = ___pthread_self_431() | 0;
        $7 = $6 + 188 | 0;
        $8 = HEAP322[$7 >> 2] | 0;
        $9 = HEAP322[$8 >> 2] | 0;
        $not$ = ($9 | 0) == (0 | 0);
        if ($not$) {
          $10 = $1 & -128;
          $11 = ($10 | 0) == 57216;
          if ($11) {
            $13 = $1 & 255;
            HEAP82[$0 >> 0] = $13;
            $$0 = 1;
            break;
          } else {
            $12 = ___errno_location() | 0;
            HEAP322[$12 >> 2] = 84;
            $$0 = -1;
            break;
          }
        }
        $14 = $1 >>> 0 < 2048;
        if ($14) {
          $15 = $1 >>> 6;
          $16 = $15 | 192;
          $17 = $16 & 255;
          $18 = $0 + 1 | 0;
          HEAP82[$0 >> 0] = $17;
          $19 = $1 & 63;
          $20 = $19 | 128;
          $21 = $20 & 255;
          HEAP82[$18 >> 0] = $21;
          $$0 = 2;
          break;
        }
        $22 = $1 >>> 0 < 55296;
        $23 = $1 & -8192;
        $24 = ($23 | 0) == 57344;
        $or$cond = $22 | $24;
        if ($or$cond) {
          $25 = $1 >>> 12;
          $26 = $25 | 224;
          $27 = $26 & 255;
          $28 = $0 + 1 | 0;
          HEAP82[$0 >> 0] = $27;
          $29 = $1 >>> 6;
          $30 = $29 & 63;
          $31 = $30 | 128;
          $32 = $31 & 255;
          $33 = $0 + 2 | 0;
          HEAP82[$28 >> 0] = $32;
          $34 = $1 & 63;
          $35 = $34 | 128;
          $36 = $35 & 255;
          HEAP82[$33 >> 0] = $36;
          $$0 = 3;
          break;
        }
        $37 = $1 + -65536 | 0;
        $38 = $37 >>> 0 < 1048576;
        if ($38) {
          $39 = $1 >>> 18;
          $40 = $39 | 240;
          $41 = $40 & 255;
          $42 = $0 + 1 | 0;
          HEAP82[$0 >> 0] = $41;
          $43 = $1 >>> 12;
          $44 = $43 & 63;
          $45 = $44 | 128;
          $46 = $45 & 255;
          $47 = $0 + 2 | 0;
          HEAP82[$42 >> 0] = $46;
          $48 = $1 >>> 6;
          $49 = $48 & 63;
          $50 = $49 | 128;
          $51 = $50 & 255;
          $52 = $0 + 3 | 0;
          HEAP82[$47 >> 0] = $51;
          $53 = $1 & 63;
          $54 = $53 | 128;
          $55 = $54 & 255;
          HEAP82[$52 >> 0] = $55;
          $$0 = 4;
          break;
        } else {
          $56 = ___errno_location() | 0;
          HEAP322[$56 >> 2] = 84;
          $$0 = -1;
          break;
        }
      }
    } while (0);
    return $$0 | 0;
  }
  function ___pthread_self_431() {
    var $0 = 0;
    $0 = _pthread_self() | 0;
    return $0 | 0;
  }
  function ___pthread_self_104() {
    var $0 = 0;
    $0 = _pthread_self() | 0;
    return $0 | 0;
  }
  function ___strerror_l($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$012$lcssa = 0, $$01214 = 0, $$016 = 0, $$113 = 0, $$115 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    var label = 0;
    $$016 = 0;
    while (1) {
      $3 = 3488 + $$016 | 0;
      $4 = HEAP82[$3 >> 0] | 0;
      $5 = $4 & 255;
      $6 = ($5 | 0) == ($0 | 0);
      if ($6) {
        label = 2;
        break;
      }
      $7 = $$016 + 1 | 0;
      $8 = ($7 | 0) == 87;
      if ($8) {
        $$01214 = 3576;
        $$115 = 87;
        label = 5;
        break;
      } else {
        $$016 = $7;
      }
    }
    if ((label | 0) == 2) {
      $2 = ($$016 | 0) == 0;
      if ($2) {
        $$012$lcssa = 3576;
      } else {
        $$01214 = 3576;
        $$115 = $$016;
        label = 5;
      }
    }
    if ((label | 0) == 5) {
      while (1) {
        label = 0;
        $$113 = $$01214;
        while (1) {
          $9 = HEAP82[$$113 >> 0] | 0;
          $10 = $9 << 24 >> 24 == 0;
          $11 = $$113 + 1 | 0;
          if ($10) {
            break;
          } else {
            $$113 = $11;
          }
        }
        $12 = $$115 + -1 | 0;
        $13 = ($12 | 0) == 0;
        if ($13) {
          $$012$lcssa = $11;
          break;
        } else {
          $$01214 = $11;
          $$115 = $12;
          label = 5;
        }
      }
    }
    $14 = $1 + 20 | 0;
    $15 = HEAP322[$14 >> 2] | 0;
    $16 = ___lctrans($$012$lcssa, $15) | 0;
    return $16 | 0;
  }
  function ___lctrans($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $2 = 0;
    $2 = ___lctrans_impl($0, $1) | 0;
    return $2 | 0;
  }
  function ___lctrans_impl($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
    $2 = ($1 | 0) == (0 | 0);
    if ($2) {
      $$0 = 0;
    } else {
      $3 = HEAP322[$1 >> 2] | 0;
      $4 = $1 + 4 | 0;
      $5 = HEAP322[$4 >> 2] | 0;
      $6 = ___mo_lookup($3, $5, $0) | 0;
      $$0 = $6;
    }
    $7 = ($$0 | 0) != (0 | 0);
    $8 = $7 ? $$0 : $0;
    return $8 | 0;
  }
  function ___mo_lookup($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$ = 0, $$090 = 0, $$094 = 0, $$191 = 0, $$195 = 0, $$4 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
    var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
    var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
    var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond102 = 0, $or$cond104 = 0;
    $3 = HEAP322[$0 >> 2] | 0;
    $4 = $3 + 1794895138 | 0;
    $5 = $0 + 8 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = _swapc($6, $4) | 0;
    $8 = $0 + 12 | 0;
    $9 = HEAP322[$8 >> 2] | 0;
    $10 = _swapc($9, $4) | 0;
    $11 = $0 + 16 | 0;
    $12 = HEAP322[$11 >> 2] | 0;
    $13 = _swapc($12, $4) | 0;
    $14 = $1 >>> 2;
    $15 = $7 >>> 0 < $14 >>> 0;
    L1:
      do {
        if ($15) {
          $16 = $7 << 2;
          $17 = $1 - $16 | 0;
          $18 = $10 >>> 0 < $17 >>> 0;
          $19 = $13 >>> 0 < $17 >>> 0;
          $or$cond = $18 & $19;
          if ($or$cond) {
            $20 = $13 | $10;
            $21 = $20 & 3;
            $22 = ($21 | 0) == 0;
            if ($22) {
              $23 = $10 >>> 2;
              $24 = $13 >>> 2;
              $$090 = 0;
              $$094 = $7;
              while (1) {
                $25 = $$094 >>> 1;
                $26 = $$090 + $25 | 0;
                $27 = $26 << 1;
                $28 = $27 + $23 | 0;
                $29 = $0 + ($28 << 2) | 0;
                $30 = HEAP322[$29 >> 2] | 0;
                $31 = _swapc($30, $4) | 0;
                $32 = $28 + 1 | 0;
                $33 = $0 + ($32 << 2) | 0;
                $34 = HEAP322[$33 >> 2] | 0;
                $35 = _swapc($34, $4) | 0;
                $36 = $35 >>> 0 < $1 >>> 0;
                $37 = $1 - $35 | 0;
                $38 = $31 >>> 0 < $37 >>> 0;
                $or$cond102 = $36 & $38;
                if (!$or$cond102) {
                  $$4 = 0;
                  break L1;
                }
                $39 = $35 + $31 | 0;
                $40 = $0 + $39 | 0;
                $41 = HEAP82[$40 >> 0] | 0;
                $42 = $41 << 24 >> 24 == 0;
                if (!$42) {
                  $$4 = 0;
                  break L1;
                }
                $43 = $0 + $35 | 0;
                $44 = _strcmp($2, $43) | 0;
                $45 = ($44 | 0) == 0;
                if ($45) {
                  break;
                }
                $62 = ($$094 | 0) == 1;
                $63 = ($44 | 0) < 0;
                $64 = $$094 - $25 | 0;
                $$195 = $63 ? $25 : $64;
                $$191 = $63 ? $$090 : $26;
                if ($62) {
                  $$4 = 0;
                  break L1;
                } else {
                  $$090 = $$191;
                  $$094 = $$195;
                }
              }
              $46 = $27 + $24 | 0;
              $47 = $0 + ($46 << 2) | 0;
              $48 = HEAP322[$47 >> 2] | 0;
              $49 = _swapc($48, $4) | 0;
              $50 = $46 + 1 | 0;
              $51 = $0 + ($50 << 2) | 0;
              $52 = HEAP322[$51 >> 2] | 0;
              $53 = _swapc($52, $4) | 0;
              $54 = $53 >>> 0 < $1 >>> 0;
              $55 = $1 - $53 | 0;
              $56 = $49 >>> 0 < $55 >>> 0;
              $or$cond104 = $54 & $56;
              if ($or$cond104) {
                $57 = $0 + $53 | 0;
                $58 = $53 + $49 | 0;
                $59 = $0 + $58 | 0;
                $60 = HEAP82[$59 >> 0] | 0;
                $61 = $60 << 24 >> 24 == 0;
                $$ = $61 ? $57 : 0;
                $$4 = $$;
              } else {
                $$4 = 0;
              }
            } else {
              $$4 = 0;
            }
          } else {
            $$4 = 0;
          }
        } else {
          $$4 = 0;
        }
      } while (0);
    return $$4 | 0;
  }
  function _swapc($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$ = 0, $2 = 0, $3 = 0;
    $2 = ($1 | 0) == 0;
    $3 = _llvm_bswap_i32($0 | 0) | 0;
    $$ = $2 ? $0 : $3;
    return $$ | 0;
  }
  function ___fwritex($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$038 = 0, $$042 = 0, $$1 = 0, $$139 = 0, $$141 = 0, $$143 = 0, $$pre = 0, $$pre47 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0;
    var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    var label = 0;
    $3 = $2 + 16 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = ($4 | 0) == (0 | 0);
    if ($5) {
      $7 = ___towrite($2) | 0;
      $8 = ($7 | 0) == 0;
      if ($8) {
        $$pre = HEAP322[$3 >> 2] | 0;
        $12 = $$pre;
        label = 5;
      } else {
        $$1 = 0;
      }
    } else {
      $6 = $4;
      $12 = $6;
      label = 5;
    }
    L5:
      do {
        if ((label | 0) == 5) {
          $9 = $2 + 20 | 0;
          $10 = HEAP322[$9 >> 2] | 0;
          $11 = $12 - $10 | 0;
          $13 = $11 >>> 0 < $1 >>> 0;
          $14 = $10;
          if ($13) {
            $15 = $2 + 36 | 0;
            $16 = HEAP322[$15 >> 2] | 0;
            $17 = FUNCTION_TABLE_iiii[$16 & 31]($2, $0, $1) | 0;
            $$1 = $17;
            break;
          }
          $18 = $2 + 75 | 0;
          $19 = HEAP82[$18 >> 0] | 0;
          $20 = $19 << 24 >> 24 > -1;
          L10:
            do {
              if ($20) {
                $$038 = $1;
                while (1) {
                  $21 = ($$038 | 0) == 0;
                  if ($21) {
                    $$139 = 0;
                    $$141 = $0;
                    $$143 = $1;
                    $31 = $14;
                    break L10;
                  }
                  $22 = $$038 + -1 | 0;
                  $23 = $0 + $22 | 0;
                  $24 = HEAP82[$23 >> 0] | 0;
                  $25 = $24 << 24 >> 24 == 10;
                  if ($25) {
                    break;
                  } else {
                    $$038 = $22;
                  }
                }
                $26 = $2 + 36 | 0;
                $27 = HEAP322[$26 >> 2] | 0;
                $28 = FUNCTION_TABLE_iiii[$27 & 31]($2, $0, $$038) | 0;
                $29 = $28 >>> 0 < $$038 >>> 0;
                if ($29) {
                  $$1 = $28;
                  break L5;
                }
                $30 = $0 + $$038 | 0;
                $$042 = $1 - $$038 | 0;
                $$pre47 = HEAP322[$9 >> 2] | 0;
                $$139 = $$038;
                $$141 = $30;
                $$143 = $$042;
                $31 = $$pre47;
              } else {
                $$139 = 0;
                $$141 = $0;
                $$143 = $1;
                $31 = $14;
              }
            } while (0);
          _memcpy($31 | 0, $$141 | 0, $$143 | 0) | 0;
          $32 = HEAP322[$9 >> 2] | 0;
          $33 = $32 + $$143 | 0;
          HEAP322[$9 >> 2] = $33;
          $34 = $$139 + $$143 | 0;
          $$1 = $34;
        }
      } while (0);
    return $$1 | 0;
  }
  function ___towrite($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
    var $9 = 0;
    $1 = $0 + 74 | 0;
    $2 = HEAP82[$1 >> 0] | 0;
    $3 = $2 << 24 >> 24;
    $4 = $3 + 255 | 0;
    $5 = $4 | $3;
    $6 = $5 & 255;
    HEAP82[$1 >> 0] = $6;
    $7 = HEAP322[$0 >> 2] | 0;
    $8 = $7 & 8;
    $9 = ($8 | 0) == 0;
    if ($9) {
      $11 = $0 + 8 | 0;
      HEAP322[$11 >> 2] = 0;
      $12 = $0 + 4 | 0;
      HEAP322[$12 >> 2] = 0;
      $13 = $0 + 44 | 0;
      $14 = HEAP322[$13 >> 2] | 0;
      $15 = $0 + 28 | 0;
      HEAP322[$15 >> 2] = $14;
      $16 = $0 + 20 | 0;
      HEAP322[$16 >> 2] = $14;
      $17 = $0 + 48 | 0;
      $18 = HEAP322[$17 >> 2] | 0;
      $19 = $14 + $18 | 0;
      $20 = $0 + 16 | 0;
      HEAP322[$20 >> 2] = $19;
      $$0 = 0;
    } else {
      $10 = $7 | 32;
      HEAP322[$0 >> 2] = $10;
      $$0 = -1;
    }
    return $$0 | 0;
  }
  function _sn_write($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$ = 0, $10 = 0, $11 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $3 = $0 + 16 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = $0 + 20 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = $6;
    $8 = $4 - $7 | 0;
    $9 = $8 >>> 0 > $2 >>> 0;
    $$ = $9 ? $2 : $8;
    _memcpy($6 | 0, $1 | 0, $$ | 0) | 0;
    $10 = HEAP322[$5 >> 2] | 0;
    $11 = $10 + $$ | 0;
    HEAP322[$5 >> 2] = $11;
    return $2 | 0;
  }
  function ___floatscan($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$0 = 0, $$0105$ph = 0, $$0106$ph = 0, $$0107$lcssa = 0, $$0107127 = 0, $$0113 = 0, $$0114 = 0, $$1$lcssa = 0, $$1108 = 0, $$1128 = 0, $$2 = 0, $$2109125 = 0, $$3110 = 0, $$3126 = 0, $$4 = 0, $$4111 = 0, $$5 = 0, $$6 = 0, $$in = 0, $$old8 = 0;
    var $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
    var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $14 = 0, $15 = 0;
    var $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0;
    var $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0;
    var $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0;
    var $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
    var $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $or$cond = 0, $or$cond5 = 0, $or$cond7 = 0, $or$cond9 = 0, label = 0;
    switch ($1 | 0) {
      case 0: {
        $$0105$ph = -149;
        $$0106$ph = 24;
        label = 4;
        break;
      }
      case 1: {
        $$0105$ph = -1074;
        $$0106$ph = 53;
        label = 4;
        break;
      }
      case 2: {
        $$0105$ph = -1074;
        $$0106$ph = 53;
        label = 4;
        break;
      }
      default: {
        $$0114 = 0;
      }
    }
    L4:
      do {
        if ((label | 0) == 4) {
          $3 = $0 + 4 | 0;
          $4 = $0 + 100 | 0;
          while (1) {
            $5 = HEAP322[$3 >> 2] | 0;
            $6 = HEAP322[$4 >> 2] | 0;
            $7 = $5 >>> 0 < $6 >>> 0;
            if ($7) {
              $8 = $5 + 1 | 0;
              HEAP322[$3 >> 2] = $8;
              $9 = HEAP82[$5 >> 0] | 0;
              $10 = $9 & 255;
              $12 = $10;
            } else {
              $11 = ___shgetc($0) | 0;
              $12 = $11;
            }
            $13 = _isspace($12) | 0;
            $14 = ($13 | 0) == 0;
            if ($14) {
              break;
            }
          }
          L13:
            do {
              switch ($12 | 0) {
                case 43:
                case 45: {
                  $15 = ($12 | 0) == 45;
                  $16 = $15 & 1;
                  $17 = $16 << 1;
                  $18 = 1 - $17 | 0;
                  $19 = HEAP322[$3 >> 2] | 0;
                  $20 = HEAP322[$4 >> 2] | 0;
                  $21 = $19 >>> 0 < $20 >>> 0;
                  if ($21) {
                    $22 = $19 + 1 | 0;
                    HEAP322[$3 >> 2] = $22;
                    $23 = HEAP82[$19 >> 0] | 0;
                    $24 = $23 & 255;
                    $$0 = $24;
                    $$0113 = $18;
                    break L13;
                  } else {
                    $25 = ___shgetc($0) | 0;
                    $$0 = $25;
                    $$0113 = $18;
                    break L13;
                  }
                }
                default: {
                  $$0 = $12;
                  $$0113 = 1;
                }
              }
            } while (0);
          $$0107127 = 0;
          $$1128 = $$0;
          while (1) {
            $26 = $$1128 | 32;
            $27 = 5380 + $$0107127 | 0;
            $28 = HEAP82[$27 >> 0] | 0;
            $29 = $28 << 24 >> 24;
            $30 = ($26 | 0) == ($29 | 0);
            if (!$30) {
              $$0107$lcssa = $$0107127;
              $$1$lcssa = $$1128;
              break;
            }
            $31 = $$0107127 >>> 0 < 7;
            do {
              if ($31) {
                $32 = HEAP322[$3 >> 2] | 0;
                $33 = HEAP322[$4 >> 2] | 0;
                $34 = $32 >>> 0 < $33 >>> 0;
                if ($34) {
                  $35 = $32 + 1 | 0;
                  HEAP322[$3 >> 2] = $35;
                  $36 = HEAP82[$32 >> 0] | 0;
                  $37 = $36 & 255;
                  $$2 = $37;
                  break;
                } else {
                  $38 = ___shgetc($0) | 0;
                  $$2 = $38;
                  break;
                }
              } else {
                $$2 = $$1128;
              }
            } while (0);
            $39 = $$0107127 + 1 | 0;
            $40 = $39 >>> 0 < 8;
            if ($40) {
              $$0107127 = $39;
              $$1128 = $$2;
            } else {
              $$0107$lcssa = $39;
              $$1$lcssa = $$2;
              break;
            }
          }
          L29:
            do {
              switch ($$0107$lcssa | 0) {
                case 8: {
                  break;
                }
                case 3: {
                  label = 23;
                  break;
                }
                default: {
                  $41 = $$0107$lcssa >>> 0 > 3;
                  $42 = ($2 | 0) != 0;
                  $or$cond5 = $42 & $41;
                  if ($or$cond5) {
                    $43 = ($$0107$lcssa | 0) == 8;
                    if ($43) {
                      break L29;
                    } else {
                      label = 23;
                      break L29;
                    }
                  }
                  $56 = ($$0107$lcssa | 0) == 0;
                  L34:
                    do {
                      if ($56) {
                        $$2109125 = 0;
                        $$3126 = $$1$lcssa;
                        while (1) {
                          $57 = $$3126 | 32;
                          $58 = 5389 + $$2109125 | 0;
                          $59 = HEAP82[$58 >> 0] | 0;
                          $60 = $59 << 24 >> 24;
                          $61 = ($57 | 0) == ($60 | 0);
                          if (!$61) {
                            $$3110 = $$2109125;
                            $$5 = $$3126;
                            break L34;
                          }
                          $62 = $$2109125 >>> 0 < 2;
                          do {
                            if ($62) {
                              $63 = HEAP322[$3 >> 2] | 0;
                              $64 = HEAP322[$4 >> 2] | 0;
                              $65 = $63 >>> 0 < $64 >>> 0;
                              if ($65) {
                                $66 = $63 + 1 | 0;
                                HEAP322[$3 >> 2] = $66;
                                $67 = HEAP82[$63 >> 0] | 0;
                                $68 = $67 & 255;
                                $$4 = $68;
                                break;
                              } else {
                                $69 = ___shgetc($0) | 0;
                                $$4 = $69;
                                break;
                              }
                            } else {
                              $$4 = $$3126;
                            }
                          } while (0);
                          $70 = $$2109125 + 1 | 0;
                          $71 = $70 >>> 0 < 3;
                          if ($71) {
                            $$2109125 = $70;
                            $$3126 = $$4;
                          } else {
                            $$3110 = $70;
                            $$5 = $$4;
                            break;
                          }
                        }
                      } else {
                        $$3110 = $$0107$lcssa;
                        $$5 = $$1$lcssa;
                      }
                    } while (0);
                  switch ($$3110 | 0) {
                    case 3: {
                      $72 = HEAP322[$3 >> 2] | 0;
                      $73 = HEAP322[$4 >> 2] | 0;
                      $74 = $72 >>> 0 < $73 >>> 0;
                      if ($74) {
                        $75 = $72 + 1 | 0;
                        HEAP322[$3 >> 2] = $75;
                        $76 = HEAP82[$72 >> 0] | 0;
                        $77 = $76 & 255;
                        $80 = $77;
                      } else {
                        $78 = ___shgetc($0) | 0;
                        $80 = $78;
                      }
                      $79 = ($80 | 0) == 40;
                      if ($79) {
                        $$4111 = 1;
                      } else {
                        $81 = HEAP322[$4 >> 2] | 0;
                        $82 = ($81 | 0) == (0 | 0);
                        if ($82) {
                          $$0114 = nan;
                          break L4;
                        }
                        $83 = HEAP322[$3 >> 2] | 0;
                        $84 = $83 + -1 | 0;
                        HEAP322[$3 >> 2] = $84;
                        $$0114 = nan;
                        break L4;
                      }
                      while (1) {
                        $85 = HEAP322[$3 >> 2] | 0;
                        $86 = HEAP322[$4 >> 2] | 0;
                        $87 = $85 >>> 0 < $86 >>> 0;
                        if ($87) {
                          $88 = $85 + 1 | 0;
                          HEAP322[$3 >> 2] = $88;
                          $89 = HEAP82[$85 >> 0] | 0;
                          $90 = $89 & 255;
                          $93 = $90;
                        } else {
                          $91 = ___shgetc($0) | 0;
                          $93 = $91;
                        }
                        $92 = $93 + -48 | 0;
                        $94 = $92 >>> 0 < 10;
                        $95 = $93 + -65 | 0;
                        $96 = $95 >>> 0 < 26;
                        $or$cond = $94 | $96;
                        if (!$or$cond) {
                          $97 = $93 + -97 | 0;
                          $98 = $97 >>> 0 < 26;
                          $99 = ($93 | 0) == 95;
                          $or$cond7 = $99 | $98;
                          if (!$or$cond7) {
                            break;
                          }
                        }
                        $111 = $$4111 + 1 | 0;
                        $$4111 = $111;
                      }
                      $100 = ($93 | 0) == 41;
                      if ($100) {
                        $$0114 = nan;
                        break L4;
                      }
                      $101 = HEAP322[$4 >> 2] | 0;
                      $102 = ($101 | 0) == (0 | 0);
                      if (!$102) {
                        $103 = HEAP322[$3 >> 2] | 0;
                        $104 = $103 + -1 | 0;
                        HEAP322[$3 >> 2] = $104;
                      }
                      if (!$42) {
                        $106 = ___errno_location() | 0;
                        HEAP322[$106 >> 2] = 22;
                        ___shlim($0, 0);
                        $$0114 = 0;
                        break L4;
                      }
                      $105 = ($$4111 | 0) == 0;
                      if ($105) {
                        $$0114 = nan;
                        break L4;
                      } else {
                        $$in = $$4111;
                      }
                      while (1) {
                        $107 = $$in + -1 | 0;
                        if (!$102) {
                          $108 = HEAP322[$3 >> 2] | 0;
                          $109 = $108 + -1 | 0;
                          HEAP322[$3 >> 2] = $109;
                        }
                        $110 = ($107 | 0) == 0;
                        if ($110) {
                          $$0114 = nan;
                          break L4;
                        } else {
                          $$in = $107;
                        }
                      }
                      break;
                    }
                    case 0: {
                      $117 = ($$5 | 0) == 48;
                      if ($117) {
                        $118 = HEAP322[$3 >> 2] | 0;
                        $119 = HEAP322[$4 >> 2] | 0;
                        $120 = $118 >>> 0 < $119 >>> 0;
                        if ($120) {
                          $121 = $118 + 1 | 0;
                          HEAP322[$3 >> 2] = $121;
                          $122 = HEAP82[$118 >> 0] | 0;
                          $123 = $122 & 255;
                          $126 = $123;
                        } else {
                          $124 = ___shgetc($0) | 0;
                          $126 = $124;
                        }
                        $125 = $126 | 32;
                        $127 = ($125 | 0) == 120;
                        if ($127) {
                          $128 = +_hexfloat($0, $$0106$ph, $$0105$ph, $$0113, $2);
                          $$0114 = $128;
                          break L4;
                        }
                        $129 = HEAP322[$4 >> 2] | 0;
                        $130 = ($129 | 0) == (0 | 0);
                        if ($130) {
                          $$6 = 48;
                        } else {
                          $131 = HEAP322[$3 >> 2] | 0;
                          $132 = $131 + -1 | 0;
                          HEAP322[$3 >> 2] = $132;
                          $$6 = 48;
                        }
                      } else {
                        $$6 = $$5;
                      }
                      $133 = +_decfloat($0, $$6, $$0106$ph, $$0105$ph, $$0113, $2);
                      $$0114 = $133;
                      break L4;
                    }
                    default: {
                      $112 = HEAP322[$4 >> 2] | 0;
                      $113 = ($112 | 0) == (0 | 0);
                      if (!$113) {
                        $114 = HEAP322[$3 >> 2] | 0;
                        $115 = $114 + -1 | 0;
                        HEAP322[$3 >> 2] = $115;
                      }
                      $116 = ___errno_location() | 0;
                      HEAP322[$116 >> 2] = 22;
                      ___shlim($0, 0);
                      $$0114 = 0;
                      break L4;
                    }
                  }
                }
              }
            } while (0);
          if ((label | 0) == 23) {
            $44 = HEAP322[$4 >> 2] | 0;
            $45 = ($44 | 0) == (0 | 0);
            if (!$45) {
              $46 = HEAP322[$3 >> 2] | 0;
              $47 = $46 + -1 | 0;
              HEAP322[$3 >> 2] = $47;
            }
            $48 = ($2 | 0) != 0;
            $49 = $$0107$lcssa >>> 0 > 3;
            $or$cond9 = $48 & $49;
            if ($or$cond9) {
              $$1108 = $$0107$lcssa;
              while (1) {
                if (!$45) {
                  $50 = HEAP322[$3 >> 2] | 0;
                  $51 = $50 + -1 | 0;
                  HEAP322[$3 >> 2] = $51;
                }
                $52 = $$1108 + -1 | 0;
                $$old8 = $52 >>> 0 > 3;
                if ($$old8) {
                  $$1108 = $52;
                } else {
                  break;
                }
              }
            }
          }
          $53 = +($$0113 | 0);
          $54 = $53 * inf;
          $55 = $54;
          $$0114 = $55;
        }
      } while (0);
    return +$$0114;
  }
  function _hexfloat($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$0 = 0, $$0133 = 0, $$0142 = 0, $$0146 = 0, $$0148 = 0, $$0148$ = 0, $$0151 = 0, $$0152 = 0, $$0155 = 0, $$0155$ = 0, $$0159 = 0, $$0165 = 0, $$0166 = 0, $$0166169 = 0, $$0166170 = 0, $$1$ph = 0, $$1147 = 0, $$1149 = 0, $$1153 = 0, $$1156 = 0;
    var $$1160 = 0, $$2 = 0, $$2$lcssa = 0, $$2144 = 0, $$2150 = 0, $$2154 = 0, $$2157 = 0, $$2161 = 0, $$3145 = 0, $$3158$lcssa = 0, $$3158179 = 0, $$3162$lcssa = 0, $$3162183 = 0, $$4 = 0, $$4163$lcssa = 0, $$4163178 = 0, $$5 = 0, $$5164 = 0, $$6 = 0, $$pn = 0;
    var $$pre = 0, $$pre$phiZ2D = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
    var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
    var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
    var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
    var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
    var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
    var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
    var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0;
    var $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0;
    var $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0;
    var $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $not$ = 0, $or$cond = 0, $or$cond168 = 0, $or$cond206 = 0, $or$cond4 = 0;
    var $or$cond6 = 0, label = 0;
    $5 = $0 + 4 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = $0 + 100 | 0;
    $8 = HEAP322[$7 >> 2] | 0;
    $9 = $6 >>> 0 < $8 >>> 0;
    if ($9) {
      $10 = $6 + 1 | 0;
      HEAP322[$5 >> 2] = $10;
      $11 = HEAP82[$6 >> 0] | 0;
      $12 = $11 & 255;
      $$0 = $12;
      $$0142 = 0;
    } else {
      $13 = ___shgetc($0) | 0;
      $$0 = $13;
      $$0142 = 0;
    }
    L4:
      while (1) {
        switch ($$0 | 0) {
          case 46: {
            label = 8;
            break L4;
          }
          case 48: {
            break;
          }
          default: {
            $$0146 = 0;
            $$0148 = 0;
            $$0152 = 1;
            $$0155 = 0;
            $$0159 = 0;
            $$2 = $$0;
            $$2144 = $$0142;
            $101 = 0;
            $53 = 0;
            $55 = 0;
            $99 = 0;
            break L4;
          }
        }
        $14 = HEAP322[$5 >> 2] | 0;
        $15 = HEAP322[$7 >> 2] | 0;
        $16 = $14 >>> 0 < $15 >>> 0;
        if ($16) {
          $17 = $14 + 1 | 0;
          HEAP322[$5 >> 2] = $17;
          $18 = HEAP82[$14 >> 0] | 0;
          $19 = $18 & 255;
          $$0 = $19;
          $$0142 = 1;
          continue;
        } else {
          $20 = ___shgetc($0) | 0;
          $$0 = $20;
          $$0142 = 1;
          continue;
        }
      }
    if ((label | 0) == 8) {
      $21 = HEAP322[$5 >> 2] | 0;
      $22 = HEAP322[$7 >> 2] | 0;
      $23 = $21 >>> 0 < $22 >>> 0;
      if ($23) {
        $24 = $21 + 1 | 0;
        HEAP322[$5 >> 2] = $24;
        $25 = HEAP82[$21 >> 0] | 0;
        $26 = $25 & 255;
        $$1$ph = $26;
      } else {
        $27 = ___shgetc($0) | 0;
        $$1$ph = $27;
      }
      $28 = ($$1$ph | 0) == 48;
      if ($28) {
        $36 = 0;
        $37 = 0;
        while (1) {
          $29 = HEAP322[$5 >> 2] | 0;
          $30 = HEAP322[$7 >> 2] | 0;
          $31 = $29 >>> 0 < $30 >>> 0;
          if ($31) {
            $32 = $29 + 1 | 0;
            HEAP322[$5 >> 2] = $32;
            $33 = HEAP82[$29 >> 0] | 0;
            $34 = $33 & 255;
            $41 = $34;
          } else {
            $35 = ___shgetc($0) | 0;
            $41 = $35;
          }
          $38 = _i64Add($36 | 0, $37 | 0, -1, -1) | 0;
          $39 = tempRet02;
          $40 = ($41 | 0) == 48;
          if ($40) {
            $36 = $38;
            $37 = $39;
          } else {
            $$0146 = 1;
            $$0148 = 0;
            $$0152 = 1;
            $$0155 = 0;
            $$0159 = 0;
            $$2 = $41;
            $$2144 = 1;
            $101 = $39;
            $53 = 0;
            $55 = 0;
            $99 = $38;
            break;
          }
        }
      } else {
        $$0146 = 1;
        $$0148 = 0;
        $$0152 = 1;
        $$0155 = 0;
        $$0159 = 0;
        $$2 = $$1$ph;
        $$2144 = $$0142;
        $101 = 0;
        $53 = 0;
        $55 = 0;
        $99 = 0;
      }
    }
    while (1) {
      $42 = $$2 + -48 | 0;
      $43 = $42 >>> 0 < 10;
      $44 = ($$2 | 0) == 46;
      if (!$43) {
        $45 = $$2 | 32;
        $46 = $45 + -97 | 0;
        $47 = $46 >>> 0 < 6;
        $or$cond6 = $44 | $47;
        if (!$or$cond6) {
          $$2$lcssa = $$2;
          break;
        }
      }
      if ($44) {
        $48 = ($$0146 | 0) == 0;
        if ($48) {
          $$1147 = 1;
          $$2150 = $$0148;
          $$2154 = $$0152;
          $$2157 = $$0155;
          $$2161 = $$0159;
          $$3145 = $$2144;
          $214 = $55;
          $215 = $53;
          $216 = $55;
          $217 = $53;
        } else {
          $$2$lcssa = 46;
          break;
        }
      } else {
        $49 = ($$2 | 0) > 57;
        $50 = $$2 | 32;
        $51 = $50 + -87 | 0;
        $$0133 = $49 ? $51 : $42;
        $52 = ($53 | 0) < 0;
        $54 = $55 >>> 0 < 8;
        $56 = ($53 | 0) == 0;
        $57 = $56 & $54;
        $58 = $52 | $57;
        do {
          if ($58) {
            $59 = $$0159 << 4;
            $60 = $$0133 + $59 | 0;
            $$1149 = $$0148;
            $$1153 = $$0152;
            $$1156 = $$0155;
            $$1160 = $60;
          } else {
            $61 = ($53 | 0) < 0;
            $62 = $55 >>> 0 < 14;
            $63 = ($53 | 0) == 0;
            $64 = $63 & $62;
            $65 = $61 | $64;
            if ($65) {
              $66 = +($$0133 | 0);
              $67 = $$0152 * 0.0625;
              $68 = $67 * $66;
              $69 = $$0155 + $68;
              $$1149 = $$0148;
              $$1153 = $67;
              $$1156 = $69;
              $$1160 = $$0159;
              break;
            } else {
              $70 = ($$0133 | 0) == 0;
              $71 = ($$0148 | 0) != 0;
              $or$cond = $71 | $70;
              $72 = $$0152 * 0.5;
              $73 = $$0155 + $72;
              $$0155$ = $or$cond ? $$0155 : $73;
              $$0148$ = $or$cond ? $$0148 : 1;
              $$1149 = $$0148$;
              $$1153 = $$0152;
              $$1156 = $$0155$;
              $$1160 = $$0159;
              break;
            }
          }
        } while (0);
        $74 = _i64Add($55 | 0, $53 | 0, 1, 0) | 0;
        $75 = tempRet02;
        $$1147 = $$0146;
        $$2150 = $$1149;
        $$2154 = $$1153;
        $$2157 = $$1156;
        $$2161 = $$1160;
        $$3145 = 1;
        $214 = $99;
        $215 = $101;
        $216 = $74;
        $217 = $75;
      }
      $76 = HEAP322[$5 >> 2] | 0;
      $77 = HEAP322[$7 >> 2] | 0;
      $78 = $76 >>> 0 < $77 >>> 0;
      if ($78) {
        $79 = $76 + 1 | 0;
        HEAP322[$5 >> 2] = $79;
        $80 = HEAP82[$76 >> 0] | 0;
        $81 = $80 & 255;
        $$0146 = $$1147;
        $$0148 = $$2150;
        $$0152 = $$2154;
        $$0155 = $$2157;
        $$0159 = $$2161;
        $$2 = $81;
        $$2144 = $$3145;
        $101 = $215;
        $53 = $217;
        $55 = $216;
        $99 = $214;
        continue;
      } else {
        $82 = ___shgetc($0) | 0;
        $$0146 = $$1147;
        $$0148 = $$2150;
        $$0152 = $$2154;
        $$0155 = $$2157;
        $$0159 = $$2161;
        $$2 = $82;
        $$2144 = $$3145;
        $101 = $215;
        $53 = $217;
        $55 = $216;
        $99 = $214;
        continue;
      }
    }
    $83 = ($$2144 | 0) == 0;
    do {
      if ($83) {
        $84 = HEAP322[$7 >> 2] | 0;
        $85 = ($84 | 0) != (0 | 0);
        if ($85) {
          $86 = HEAP322[$5 >> 2] | 0;
          $87 = $86 + -1 | 0;
          HEAP322[$5 >> 2] = $87;
        }
        $88 = ($4 | 0) == 0;
        if ($88) {
          ___shlim($0, 0);
        } else {
          if ($85) {
            $89 = HEAP322[$5 >> 2] | 0;
            $90 = $89 + -1 | 0;
            HEAP322[$5 >> 2] = $90;
          }
          $91 = ($$0146 | 0) == 0;
          $92 = ($84 | 0) == (0 | 0);
          $or$cond206 = $91 | $92;
          if (!$or$cond206) {
            $93 = HEAP322[$5 >> 2] | 0;
            $94 = $93 + -1 | 0;
            HEAP322[$5 >> 2] = $94;
          }
        }
        $95 = +($3 | 0);
        $96 = $95 * 0;
        $$0165 = $96;
      } else {
        $97 = ($$0146 | 0) == 0;
        $98 = $97 ? $55 : $99;
        $100 = $97 ? $53 : $101;
        $102 = ($53 | 0) < 0;
        $103 = $55 >>> 0 < 8;
        $104 = ($53 | 0) == 0;
        $105 = $104 & $103;
        $106 = $102 | $105;
        if ($106) {
          $$3162183 = $$0159;
          $108 = $55;
          $109 = $53;
          while (1) {
            $107 = $$3162183 << 4;
            $110 = _i64Add($108 | 0, $109 | 0, 1, 0) | 0;
            $111 = tempRet02;
            $112 = ($111 | 0) < 0;
            $113 = $110 >>> 0 < 8;
            $114 = ($111 | 0) == 0;
            $115 = $114 & $113;
            $116 = $112 | $115;
            if ($116) {
              $$3162183 = $107;
              $108 = $110;
              $109 = $111;
            } else {
              $$3162$lcssa = $107;
              break;
            }
          }
        } else {
          $$3162$lcssa = $$0159;
        }
        $117 = $$2$lcssa | 32;
        $118 = ($117 | 0) == 112;
        if ($118) {
          $119 = _scanexp($0, $4) | 0;
          $120 = tempRet02;
          $121 = ($119 | 0) == 0;
          $122 = ($120 | 0) == -2147483648;
          $123 = $121 & $122;
          if ($123) {
            $124 = ($4 | 0) == 0;
            if ($124) {
              ___shlim($0, 0);
              $$0165 = 0;
              break;
            }
            $125 = HEAP322[$7 >> 2] | 0;
            $126 = ($125 | 0) == (0 | 0);
            if ($126) {
              $137 = 0;
              $138 = 0;
            } else {
              $127 = HEAP322[$5 >> 2] | 0;
              $128 = $127 + -1 | 0;
              HEAP322[$5 >> 2] = $128;
              $137 = 0;
              $138 = 0;
            }
          } else {
            $137 = $119;
            $138 = $120;
          }
        } else {
          $129 = HEAP322[$7 >> 2] | 0;
          $130 = ($129 | 0) == (0 | 0);
          if ($130) {
            $137 = 0;
            $138 = 0;
          } else {
            $131 = HEAP322[$5 >> 2] | 0;
            $132 = $131 + -1 | 0;
            HEAP322[$5 >> 2] = $132;
            $137 = 0;
            $138 = 0;
          }
        }
        $133 = _bitshift64Shl($98 | 0, $100 | 0, 2) | 0;
        $134 = tempRet02;
        $135 = _i64Add($133 | 0, $134 | 0, -32, -1) | 0;
        $136 = tempRet02;
        $139 = _i64Add($135 | 0, $136 | 0, $137 | 0, $138 | 0) | 0;
        $140 = tempRet02;
        $141 = ($$3162$lcssa | 0) == 0;
        if ($141) {
          $142 = +($3 | 0);
          $143 = $142 * 0;
          $$0165 = $143;
          break;
        }
        $144 = 0 - $2 | 0;
        $145 = ($144 | 0) < 0;
        $146 = $145 << 31 >> 31;
        $147 = ($140 | 0) > ($146 | 0);
        $148 = $139 >>> 0 > $144 >>> 0;
        $149 = ($140 | 0) == ($146 | 0);
        $150 = $149 & $148;
        $151 = $147 | $150;
        if ($151) {
          $152 = ___errno_location() | 0;
          HEAP322[$152 >> 2] = 34;
          $153 = +($3 | 0);
          $154 = $153 * 17976931348623157e292;
          $155 = $154 * 17976931348623157e292;
          $$0165 = $155;
          break;
        }
        $156 = $2 + -106 | 0;
        $157 = ($156 | 0) < 0;
        $158 = $157 << 31 >> 31;
        $159 = ($140 | 0) < ($158 | 0);
        $160 = $139 >>> 0 < $156 >>> 0;
        $161 = ($140 | 0) == ($158 | 0);
        $162 = $161 & $160;
        $163 = $159 | $162;
        if ($163) {
          $165 = ___errno_location() | 0;
          HEAP322[$165 >> 2] = 34;
          $166 = +($3 | 0);
          $167 = $166 * 22250738585072014e-324;
          $168 = $167 * 22250738585072014e-324;
          $$0165 = $168;
          break;
        }
        $164 = ($$3162$lcssa | 0) > -1;
        if ($164) {
          $$3158179 = $$0155;
          $$4163178 = $$3162$lcssa;
          $173 = $139;
          $174 = $140;
          while (1) {
            $169 = !($$3158179 >= 0.5);
            $170 = $$4163178 << 1;
            $171 = $$3158179 + -1;
            $not$ = $169 ^ 1;
            $172 = $not$ & 1;
            $$5164 = $170 | $172;
            $$pn = $169 ? $$3158179 : $171;
            $$4 = $$3158179 + $$pn;
            $175 = _i64Add($173 | 0, $174 | 0, -1, -1) | 0;
            $176 = tempRet02;
            $177 = ($$5164 | 0) > -1;
            if ($177) {
              $$3158179 = $$4;
              $$4163178 = $$5164;
              $173 = $175;
              $174 = $176;
            } else {
              $$3158$lcssa = $$4;
              $$4163$lcssa = $$5164;
              $184 = $175;
              $185 = $176;
              break;
            }
          }
        } else {
          $$3158$lcssa = $$0155;
          $$4163$lcssa = $$3162$lcssa;
          $184 = $139;
          $185 = $140;
        }
        $178 = ($1 | 0) < 0;
        $179 = $178 << 31 >> 31;
        $180 = ($2 | 0) < 0;
        $181 = $180 << 31 >> 31;
        $182 = _i64Subtract(32, 0, $2 | 0, $181 | 0) | 0;
        $183 = tempRet02;
        $186 = _i64Add($182 | 0, $183 | 0, $184 | 0, $185 | 0) | 0;
        $187 = tempRet02;
        $188 = ($179 | 0) > ($187 | 0);
        $189 = $1 >>> 0 > $186 >>> 0;
        $190 = ($179 | 0) == ($187 | 0);
        $191 = $190 & $189;
        $192 = $188 | $191;
        if ($192) {
          $193 = ($186 | 0) > 0;
          if ($193) {
            $$0166 = $186;
            label = 59;
          } else {
            $$0166170 = 0;
            $197 = 84;
            label = 61;
          }
        } else {
          $$0166 = $1;
          label = 59;
        }
        if ((label | 0) == 59) {
          $194 = ($$0166 | 0) < 53;
          $195 = 84 - $$0166 | 0;
          if ($194) {
            $$0166170 = $$0166;
            $197 = $195;
            label = 61;
          } else {
            $$pre = +($3 | 0);
            $$0151 = 0;
            $$0166169 = $$0166;
            $$pre$phiZ2D = $$pre;
          }
        }
        if ((label | 0) == 61) {
          $196 = +($3 | 0);
          $198 = +_scalbn(1, $197);
          $199 = +_copysignl($198, $196);
          $$0151 = $199;
          $$0166169 = $$0166170;
          $$pre$phiZ2D = $196;
        }
        $200 = ($$0166169 | 0) < 32;
        $201 = $$3158$lcssa != 0;
        $or$cond4 = $201 & $200;
        $202 = $$4163$lcssa & 1;
        $203 = ($202 | 0) == 0;
        $or$cond168 = $203 & $or$cond4;
        $204 = $or$cond168 & 1;
        $$6 = $204 + $$4163$lcssa | 0;
        $$5 = $or$cond168 ? 0 : $$3158$lcssa;
        $205 = +($$6 >>> 0);
        $206 = $$pre$phiZ2D * $205;
        $207 = $$0151 + $206;
        $208 = $$pre$phiZ2D * $$5;
        $209 = $208 + $207;
        $210 = $209 - $$0151;
        $211 = $210 != 0;
        if (!$211) {
          $212 = ___errno_location() | 0;
          HEAP322[$212 >> 2] = 34;
        }
        $213 = +_scalbnl($210, $184);
        $$0165 = $213;
      }
    } while (0);
    return +$$0165;
  }
  function _decfloat($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    $5 = $5 | 0;
    var $$ = 0, $$$0345 = 0, $$$0350 = 0, $$$0385 = 0, $$$0401 = 0, $$$5355 = 0, $$$5390 = 0, $$0329 = 0, $$0332490 = 0, $$0333 = 0, $$0334 = 0, $$0336486 = 0, $$0340496 = 0, $$0341$lcssa = 0, $$0341463 = 0, $$0341464 = 0, $$0341465 = 0, $$0341513 = 0, $$0345$lcssa = 0, $$0345467 = 0;
    var $$0345468 = 0, $$0345469 = 0, $$0345512 = 0, $$0350$lcssa554 = 0, $$0350494 = 0, $$0360 = 0, $$0361 = 0, $$0365484 = 0, $$0372 = 0, $$0380 = 0, $$0380$ph = 0, $$0385$lcssa553 = 0, $$0385493 = 0, $$0393 = 0, $$0396 = 0, $$0401$lcssa = 0, $$0401473 = 0, $$0401474 = 0, $$0401475 = 0, $$0401509 = 0;
    var $$1 = 0, $$10 = 0, $$1330$be = 0, $$1330$ph = 0, $$1335 = 0, $$1337 = 0, $$1362 = 0, $$1366 = 0, $$1373 = 0, $$1373$ph448 = 0, $$1381 = 0, $$1381$ph = 0, $$1381$ph558 = 0, $$1394$lcssa = 0, $$1394511 = 0, $$2 = 0, $$2343 = 0, $$2347 = 0, $$2352$ph449 = 0, $$2367 = 0;
    var $$2371$v = 0, $$2374 = 0, $$2387$ph447 = 0, $$2395 = 0, $$2398 = 0, $$2403 = 0, $$3$be = 0, $$3$lcssa = 0, $$3344503 = 0, $$3348 = 0, $$3364 = 0, $$3368 = 0, $$3375 = 0, $$3383 = 0, $$3399$lcssa = 0, $$3399510 = 0, $$3514 = 0, $$413 = 0, $$425 = 0, $$4349495 = 0;
    var $$4354 = 0, $$4354$ph = 0, $$4354$ph559 = 0, $$4376 = 0, $$4384 = 0, $$4389$ph = 0, $$4389$ph445 = 0, $$4400 = 0, $$4485 = 0, $$5 = 0, $$5$in = 0, $$5355488 = 0, $$5390487 = 0, $$6378$ph = 0, $$6489 = 0, $$9483 = 0, $$neg442 = 0, $$neg443 = 0, $$pre = 0, $$promoted = 0;
    var $$sink = 0, $$sink421$off0 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
    var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
    var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
    var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
    var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
    var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
    var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
    var $225 = 0, $226 = 0, $227 = 0, $229 = 0, $23 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
    var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
    var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
    var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
    var $298 = 0, $299 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0;
    var $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0;
    var $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0;
    var $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0;
    var $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $39 = 0, $40 = 0, $41 = 0;
    var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
    var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
    var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
    var $98 = 0, $99 = 0, $cond = 0, $exitcond = 0, $exitcond551 = 0, $narrow = 0, $not$ = 0, $or$cond = 0, $or$cond11 = 0, $or$cond14 = 0, $or$cond415 = 0, $or$cond417 = 0, $or$cond419 = 0, $or$cond420 = 0, $or$cond422 = 0, $or$cond422$not = 0, $or$cond423 = 0, $or$cond426 = 0, $or$cond5 = 0, $sum = 0;
    var label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 512 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(512 | 0);
    $6 = sp;
    $sum = $3 + $2 | 0;
    $7 = 0 - $sum | 0;
    $8 = $0 + 4 | 0;
    $9 = $0 + 100 | 0;
    $$0329 = $1;
    $$0396 = 0;
    L1:
      while (1) {
        switch ($$0329 | 0) {
          case 46: {
            label = 6;
            break L1;
          }
          case 48: {
            break;
          }
          default: {
            $$0393 = 0;
            $$2 = $$0329;
            $$2398 = $$0396;
            $366 = 0;
            $367 = 0;
            break L1;
          }
        }
        $10 = HEAP322[$8 >> 2] | 0;
        $11 = HEAP322[$9 >> 2] | 0;
        $12 = $10 >>> 0 < $11 >>> 0;
        if ($12) {
          $13 = $10 + 1 | 0;
          HEAP322[$8 >> 2] = $13;
          $14 = HEAP82[$10 >> 0] | 0;
          $15 = $14 & 255;
          $$0329 = $15;
          $$0396 = 1;
          continue;
        } else {
          $16 = ___shgetc($0) | 0;
          $$0329 = $16;
          $$0396 = 1;
          continue;
        }
      }
    if ((label | 0) == 6) {
      $17 = HEAP322[$8 >> 2] | 0;
      $18 = HEAP322[$9 >> 2] | 0;
      $19 = $17 >>> 0 < $18 >>> 0;
      if ($19) {
        $20 = $17 + 1 | 0;
        HEAP322[$8 >> 2] = $20;
        $21 = HEAP82[$17 >> 0] | 0;
        $22 = $21 & 255;
        $$1330$ph = $22;
      } else {
        $23 = ___shgetc($0) | 0;
        $$1330$ph = $23;
      }
      $24 = ($$1330$ph | 0) == 48;
      if ($24) {
        $25 = 0;
        $26 = 0;
        while (1) {
          $27 = _i64Add($25 | 0, $26 | 0, -1, -1) | 0;
          $28 = tempRet02;
          $29 = HEAP322[$8 >> 2] | 0;
          $30 = HEAP322[$9 >> 2] | 0;
          $31 = $29 >>> 0 < $30 >>> 0;
          if ($31) {
            $32 = $29 + 1 | 0;
            HEAP322[$8 >> 2] = $32;
            $33 = HEAP82[$29 >> 0] | 0;
            $34 = $33 & 255;
            $$1330$be = $34;
          } else {
            $35 = ___shgetc($0) | 0;
            $$1330$be = $35;
          }
          $36 = ($$1330$be | 0) == 48;
          if ($36) {
            $25 = $27;
            $26 = $28;
          } else {
            $$0393 = 1;
            $$2 = $$1330$be;
            $$2398 = 1;
            $366 = $27;
            $367 = $28;
            break;
          }
        }
      } else {
        $$0393 = 1;
        $$2 = $$1330$ph;
        $$2398 = $$0396;
        $366 = 0;
        $367 = 0;
      }
    }
    HEAP322[$6 >> 2] = 0;
    $37 = $$2 + -48 | 0;
    $38 = $37 >>> 0 < 10;
    $39 = ($$2 | 0) == 46;
    $40 = $39 | $38;
    L20:
      do {
        if ($40) {
          $41 = $6 + 496 | 0;
          $$0341513 = 0;
          $$0345512 = 0;
          $$0401509 = 0;
          $$1394511 = $$0393;
          $$3399510 = $$2398;
          $$3514 = $$2;
          $368 = $39;
          $369 = $37;
          $370 = $366;
          $371 = $367;
          $44 = 0;
          $45 = 0;
          L22:
            while (1) {
              do {
                if ($368) {
                  $cond = ($$1394511 | 0) == 0;
                  if ($cond) {
                    $$2343 = $$0341513;
                    $$2347 = $$0345512;
                    $$2395 = 1;
                    $$2403 = $$0401509;
                    $$4400 = $$3399510;
                    $372 = $44;
                    $373 = $45;
                    $374 = $44;
                    $375 = $45;
                  } else {
                    break L22;
                  }
                } else {
                  $43 = ($$0345512 | 0) < 125;
                  $46 = _i64Add($44 | 0, $45 | 0, 1, 0) | 0;
                  $47 = tempRet02;
                  $48 = ($$3514 | 0) != 48;
                  if (!$43) {
                    if (!$48) {
                      $$2343 = $$0341513;
                      $$2347 = $$0345512;
                      $$2395 = $$1394511;
                      $$2403 = $$0401509;
                      $$4400 = $$3399510;
                      $372 = $370;
                      $373 = $371;
                      $374 = $46;
                      $375 = $47;
                      break;
                    }
                    $57 = HEAP322[$41 >> 2] | 0;
                    $58 = $57 | 1;
                    HEAP322[$41 >> 2] = $58;
                    $$2343 = $$0341513;
                    $$2347 = $$0345512;
                    $$2395 = $$1394511;
                    $$2403 = $$0401509;
                    $$4400 = $$3399510;
                    $372 = $370;
                    $373 = $371;
                    $374 = $46;
                    $375 = $47;
                    break;
                  }
                  $$$0401 = $48 ? $46 : $$0401509;
                  $49 = ($$0341513 | 0) == 0;
                  $$pre = $6 + ($$0345512 << 2) | 0;
                  if ($49) {
                    $$sink = $369;
                  } else {
                    $50 = HEAP322[$$pre >> 2] | 0;
                    $51 = $50 * 10 | 0;
                    $52 = $$3514 + -48 | 0;
                    $53 = $52 + $51 | 0;
                    $$sink = $53;
                  }
                  HEAP322[$$pre >> 2] = $$sink;
                  $54 = $$0341513 + 1 | 0;
                  $55 = ($54 | 0) == 9;
                  $56 = $55 & 1;
                  $$$0345 = $56 + $$0345512 | 0;
                  $$413 = $55 ? 0 : $54;
                  $$2343 = $$413;
                  $$2347 = $$$0345;
                  $$2395 = $$1394511;
                  $$2403 = $$$0401;
                  $$4400 = 1;
                  $372 = $370;
                  $373 = $371;
                  $374 = $46;
                  $375 = $47;
                }
              } while (0);
              $59 = HEAP322[$8 >> 2] | 0;
              $60 = HEAP322[$9 >> 2] | 0;
              $61 = $59 >>> 0 < $60 >>> 0;
              if ($61) {
                $62 = $59 + 1 | 0;
                HEAP322[$8 >> 2] = $62;
                $63 = HEAP82[$59 >> 0] | 0;
                $64 = $63 & 255;
                $$3$be = $64;
              } else {
                $65 = ___shgetc($0) | 0;
                $$3$be = $65;
              }
              $66 = $$3$be + -48 | 0;
              $67 = $66 >>> 0 < 10;
              $68 = ($$3$be | 0) == 46;
              $69 = $68 | $67;
              if ($69) {
                $$0341513 = $$2343;
                $$0345512 = $$2347;
                $$0401509 = $$2403;
                $$1394511 = $$2395;
                $$3399510 = $$4400;
                $$3514 = $$3$be;
                $368 = $68;
                $369 = $66;
                $370 = $372;
                $371 = $373;
                $44 = $374;
                $45 = $375;
              } else {
                $$0341$lcssa = $$2343;
                $$0345$lcssa = $$2347;
                $$0401$lcssa = $$2403;
                $$1394$lcssa = $$2395;
                $$3$lcssa = $$3$be;
                $$3399$lcssa = $$4400;
                $72 = $374;
                $73 = $372;
                $75 = $375;
                $76 = $373;
                label = 29;
                break L20;
              }
            }
          $42 = ($$3399510 | 0) != 0;
          $$0341465 = $$0341513;
          $$0345469 = $$0345512;
          $$0401475 = $$0401509;
          $376 = $44;
          $377 = $45;
          $378 = $370;
          $379 = $371;
          $380 = $42;
          label = 37;
        } else {
          $$0341$lcssa = 0;
          $$0345$lcssa = 0;
          $$0401$lcssa = 0;
          $$1394$lcssa = $$0393;
          $$3$lcssa = $$2;
          $$3399$lcssa = $$2398;
          $72 = 0;
          $73 = $366;
          $75 = 0;
          $76 = $367;
          label = 29;
        }
      } while (0);
    do {
      if ((label | 0) == 29) {
        $70 = ($$1394$lcssa | 0) == 0;
        $71 = $70 ? $72 : $73;
        $74 = $70 ? $75 : $76;
        $77 = ($$3399$lcssa | 0) != 0;
        $78 = $$3$lcssa | 32;
        $79 = ($78 | 0) == 101;
        $or$cond415 = $77 & $79;
        if (!$or$cond415) {
          $94 = ($$3$lcssa | 0) > -1;
          if ($94) {
            $$0341465 = $$0341$lcssa;
            $$0345469 = $$0345$lcssa;
            $$0401475 = $$0401$lcssa;
            $376 = $72;
            $377 = $75;
            $378 = $71;
            $379 = $74;
            $380 = $77;
            label = 37;
            break;
          } else {
            $$0341464 = $$0341$lcssa;
            $$0345468 = $$0345$lcssa;
            $$0401474 = $$0401$lcssa;
            $381 = $72;
            $382 = $75;
            $383 = $77;
            $384 = $71;
            $385 = $74;
            label = 39;
            break;
          }
        }
        $80 = _scanexp($0, $5) | 0;
        $81 = tempRet02;
        $82 = ($80 | 0) == 0;
        $83 = ($81 | 0) == -2147483648;
        $84 = $82 & $83;
        if ($84) {
          $85 = ($5 | 0) == 0;
          if ($85) {
            ___shlim($0, 0);
            $$1 = 0;
            break;
          }
          $86 = HEAP322[$9 >> 2] | 0;
          $87 = ($86 | 0) == (0 | 0);
          if ($87) {
            $90 = 0;
            $91 = 0;
          } else {
            $88 = HEAP322[$8 >> 2] | 0;
            $89 = $88 + -1 | 0;
            HEAP322[$8 >> 2] = $89;
            $90 = 0;
            $91 = 0;
          }
        } else {
          $90 = $80;
          $91 = $81;
        }
        $92 = _i64Add($90 | 0, $91 | 0, $71 | 0, $74 | 0) | 0;
        $93 = tempRet02;
        $$0341463 = $$0341$lcssa;
        $$0345467 = $$0345$lcssa;
        $$0401473 = $$0401$lcssa;
        $105 = $92;
        $106 = $72;
        $108 = $93;
        $109 = $75;
        label = 41;
      }
    } while (0);
    if ((label | 0) == 37) {
      $95 = HEAP322[$9 >> 2] | 0;
      $96 = ($95 | 0) == (0 | 0);
      if ($96) {
        $$0341464 = $$0341465;
        $$0345468 = $$0345469;
        $$0401474 = $$0401475;
        $381 = $376;
        $382 = $377;
        $383 = $380;
        $384 = $378;
        $385 = $379;
        label = 39;
      } else {
        $97 = HEAP322[$8 >> 2] | 0;
        $98 = $97 + -1 | 0;
        HEAP322[$8 >> 2] = $98;
        if ($380) {
          $$0341463 = $$0341465;
          $$0345467 = $$0345469;
          $$0401473 = $$0401475;
          $105 = $378;
          $106 = $376;
          $108 = $379;
          $109 = $377;
          label = 41;
        } else {
          label = 40;
        }
      }
    }
    if ((label | 0) == 39) {
      if ($383) {
        $$0341463 = $$0341464;
        $$0345467 = $$0345468;
        $$0401473 = $$0401474;
        $105 = $384;
        $106 = $381;
        $108 = $385;
        $109 = $382;
        label = 41;
      } else {
        label = 40;
      }
    }
    do {
      if ((label | 0) == 40) {
        $99 = ___errno_location() | 0;
        HEAP322[$99 >> 2] = 22;
        ___shlim($0, 0);
        $$1 = 0;
      } else if ((label | 0) == 41) {
        $100 = HEAP322[$6 >> 2] | 0;
        $101 = ($100 | 0) == 0;
        if ($101) {
          $102 = +($4 | 0);
          $103 = $102 * 0;
          $$1 = $103;
          break;
        }
        $104 = ($105 | 0) == ($106 | 0);
        $107 = ($108 | 0) == ($109 | 0);
        $110 = $104 & $107;
        $111 = ($109 | 0) < 0;
        $112 = $106 >>> 0 < 10;
        $113 = ($109 | 0) == 0;
        $114 = $113 & $112;
        $115 = $111 | $114;
        $or$cond = $115 & $110;
        if ($or$cond) {
          $116 = ($2 | 0) > 30;
          $117 = $100 >>> $2;
          $118 = ($117 | 0) == 0;
          $or$cond417 = $116 | $118;
          if ($or$cond417) {
            $119 = +($4 | 0);
            $120 = +($100 >>> 0);
            $121 = $119 * $120;
            $$1 = $121;
            break;
          }
        }
        $122 = ($3 | 0) / -2 & -1;
        $123 = ($122 | 0) < 0;
        $124 = $123 << 31 >> 31;
        $125 = ($108 | 0) > ($124 | 0);
        $126 = $105 >>> 0 > $122 >>> 0;
        $127 = ($108 | 0) == ($124 | 0);
        $128 = $127 & $126;
        $129 = $125 | $128;
        if ($129) {
          $130 = ___errno_location() | 0;
          HEAP322[$130 >> 2] = 34;
          $131 = +($4 | 0);
          $132 = $131 * 17976931348623157e292;
          $133 = $132 * 17976931348623157e292;
          $$1 = $133;
          break;
        }
        $134 = $3 + -106 | 0;
        $135 = ($134 | 0) < 0;
        $136 = $135 << 31 >> 31;
        $137 = ($108 | 0) < ($136 | 0);
        $138 = $105 >>> 0 < $134 >>> 0;
        $139 = ($108 | 0) == ($136 | 0);
        $140 = $139 & $138;
        $141 = $137 | $140;
        if ($141) {
          $142 = ___errno_location() | 0;
          HEAP322[$142 >> 2] = 34;
          $143 = +($4 | 0);
          $144 = $143 * 22250738585072014e-324;
          $145 = $144 * 22250738585072014e-324;
          $$1 = $145;
          break;
        }
        $146 = ($$0341463 | 0) == 0;
        if ($146) {
          $$3348 = $$0345467;
        } else {
          $147 = ($$0341463 | 0) < 9;
          if ($147) {
            $148 = $6 + ($$0345467 << 2) | 0;
            $$promoted = HEAP322[$148 >> 2] | 0;
            $$3344503 = $$0341463;
            $150 = $$promoted;
            while (1) {
              $149 = $150 * 10 | 0;
              $151 = $$3344503 + 1 | 0;
              $exitcond551 = ($151 | 0) == 9;
              if ($exitcond551) {
                break;
              } else {
                $$3344503 = $151;
                $150 = $149;
              }
            }
            HEAP322[$148 >> 2] = $149;
          }
          $152 = $$0345467 + 1 | 0;
          $$3348 = $152;
        }
        $153 = ($$0401473 | 0) < 9;
        if ($153) {
          $154 = ($$0401473 | 0) <= ($105 | 0);
          $155 = ($105 | 0) < 18;
          $or$cond5 = $154 & $155;
          if ($or$cond5) {
            $156 = ($105 | 0) == 9;
            $157 = HEAP322[$6 >> 2] | 0;
            if ($156) {
              $158 = +($4 | 0);
              $159 = +($157 >>> 0);
              $160 = $158 * $159;
              $$1 = $160;
              break;
            }
            $161 = ($105 | 0) < 9;
            if ($161) {
              $162 = +($4 | 0);
              $163 = +($157 >>> 0);
              $164 = $162 * $163;
              $165 = 8 - $105 | 0;
              $166 = 1084 + ($165 << 2) | 0;
              $167 = HEAP322[$166 >> 2] | 0;
              $168 = +($167 | 0);
              $169 = $164 / $168;
              $$1 = $169;
              break;
            }
            $$neg442 = Math_imul($105, -3) | 0;
            $$neg443 = $2 + 27 | 0;
            $170 = $$neg443 + $$neg442 | 0;
            $171 = ($170 | 0) > 30;
            $172 = $157 >>> $170;
            $173 = ($172 | 0) == 0;
            $or$cond419 = $171 | $173;
            if ($or$cond419) {
              $174 = $105 + -10 | 0;
              $175 = 1084 + ($174 << 2) | 0;
              $176 = +($4 | 0);
              $177 = +($157 >>> 0);
              $178 = $176 * $177;
              $179 = HEAP322[$175 >> 2] | 0;
              $180 = +($179 | 0);
              $181 = $178 * $180;
              $$1 = $181;
              break;
            }
          }
        }
        $182 = ($105 | 0) % 9 & -1;
        $183 = ($182 | 0) == 0;
        if ($183) {
          $$0380$ph = 0;
          $$1373$ph448 = $$3348;
          $$2352$ph449 = 0;
          $$2387$ph447 = $105;
        } else {
          $184 = ($105 | 0) > -1;
          $185 = $182 + 9 | 0;
          $186 = $184 ? $182 : $185;
          $187 = 8 - $186 | 0;
          $188 = 1084 + ($187 << 2) | 0;
          $189 = HEAP322[$188 >> 2] | 0;
          $190 = ($$3348 | 0) == 0;
          if ($190) {
            $$0350$lcssa554 = 0;
            $$0372 = 0;
            $$0385$lcssa553 = $105;
          } else {
            $191 = 1e9 / ($189 | 0) & -1;
            $$0340496 = 0;
            $$0350494 = 0;
            $$0385493 = $105;
            $$4349495 = 0;
            while (1) {
              $192 = $6 + ($$4349495 << 2) | 0;
              $193 = HEAP322[$192 >> 2] | 0;
              $194 = ($193 >>> 0) % ($189 >>> 0) & -1;
              $195 = ($193 >>> 0) / ($189 >>> 0) & -1;
              $196 = $195 + $$0340496 | 0;
              HEAP322[$192 >> 2] = $196;
              $197 = Math_imul($191, $194) | 0;
              $198 = ($$4349495 | 0) == ($$0350494 | 0);
              $199 = ($196 | 0) == 0;
              $or$cond420 = $198 & $199;
              $200 = $$0350494 + 1 | 0;
              $201 = $200 & 127;
              $202 = $$0385493 + -9 | 0;
              $$$0385 = $or$cond420 ? $202 : $$0385493;
              $$$0350 = $or$cond420 ? $201 : $$0350494;
              $203 = $$4349495 + 1 | 0;
              $204 = ($203 | 0) == ($$3348 | 0);
              if ($204) {
                break;
              } else {
                $$0340496 = $197;
                $$0350494 = $$$0350;
                $$0385493 = $$$0385;
                $$4349495 = $203;
              }
            }
            $205 = ($197 | 0) == 0;
            if ($205) {
              $$0350$lcssa554 = $$$0350;
              $$0372 = $$3348;
              $$0385$lcssa553 = $$$0385;
            } else {
              $206 = $6 + ($$3348 << 2) | 0;
              $207 = $$3348 + 1 | 0;
              HEAP322[$206 >> 2] = $197;
              $$0350$lcssa554 = $$$0350;
              $$0372 = $207;
              $$0385$lcssa553 = $$$0385;
            }
          }
          $208 = 9 - $186 | 0;
          $209 = $208 + $$0385$lcssa553 | 0;
          $$0380$ph = 0;
          $$1373$ph448 = $$0372;
          $$2352$ph449 = $$0350$lcssa554;
          $$2387$ph447 = $209;
        }
        L101:
          while (1) {
            $210 = ($$2387$ph447 | 0) < 18;
            $211 = ($$2387$ph447 | 0) == 18;
            $212 = $6 + ($$2352$ph449 << 2) | 0;
            $$0380 = $$0380$ph;
            $$1373 = $$1373$ph448;
            while (1) {
              if (!$210) {
                if (!$211) {
                  $$1381$ph = $$0380;
                  $$4354$ph = $$2352$ph449;
                  $$4389$ph445 = $$2387$ph447;
                  $$6378$ph = $$1373;
                  break L101;
                }
                $213 = HEAP322[$212 >> 2] | 0;
                $214 = $213 >>> 0 < 9007199;
                if (!$214) {
                  $$1381$ph = $$0380;
                  $$4354$ph = $$2352$ph449;
                  $$4389$ph445 = 18;
                  $$6378$ph = $$1373;
                  break L101;
                }
              }
              $215 = $$1373 + 127 | 0;
              $$0334 = 0;
              $$2374 = $$1373;
              $$5$in = $215;
              while (1) {
                $$5 = $$5$in & 127;
                $216 = $6 + ($$5 << 2) | 0;
                $217 = HEAP322[$216 >> 2] | 0;
                $218 = _bitshift64Shl($217 | 0, 0, 29) | 0;
                $219 = tempRet02;
                $220 = _i64Add($218 | 0, $219 | 0, $$0334 | 0, 0) | 0;
                $221 = tempRet02;
                $222 = $221 >>> 0 > 0;
                $223 = $220 >>> 0 > 1e9;
                $224 = ($221 | 0) == 0;
                $225 = $224 & $223;
                $226 = $222 | $225;
                if ($226) {
                  $227 = ___udivdi3($220 | 0, $221 | 0, 1e9, 0) | 0;
                  $229 = ___uremdi3($220 | 0, $221 | 0, 1e9, 0) | 0;
                  $$1335 = $227;
                  $$sink421$off0 = $229;
                } else {
                  $$1335 = 0;
                  $$sink421$off0 = $220;
                }
                HEAP322[$216 >> 2] = $$sink421$off0;
                $231 = $$2374 + 127 | 0;
                $232 = $231 & 127;
                $233 = ($$5 | 0) != ($232 | 0);
                $234 = ($$5 | 0) == ($$2352$ph449 | 0);
                $or$cond422 = $233 | $234;
                $or$cond422$not = $or$cond422 ^ 1;
                $235 = ($$sink421$off0 | 0) == 0;
                $or$cond423 = $235 & $or$cond422$not;
                $$3375 = $or$cond423 ? $$5 : $$2374;
                $236 = $$5 + -1 | 0;
                if ($234) {
                  break;
                } else {
                  $$0334 = $$1335;
                  $$2374 = $$3375;
                  $$5$in = $236;
                }
              }
              $237 = $$0380 + -29 | 0;
              $238 = ($$1335 | 0) == 0;
              if ($238) {
                $$0380 = $237;
                $$1373 = $$3375;
              } else {
                break;
              }
            }
            $239 = $$2387$ph447 + 9 | 0;
            $240 = $$2352$ph449 + 127 | 0;
            $241 = $240 & 127;
            $242 = ($241 | 0) == ($$3375 | 0);
            $243 = $$3375 + 127 | 0;
            $244 = $243 & 127;
            $245 = $$3375 + 126 | 0;
            $246 = $245 & 127;
            $247 = $6 + ($246 << 2) | 0;
            if ($242) {
              $248 = $6 + ($244 << 2) | 0;
              $249 = HEAP322[$248 >> 2] | 0;
              $250 = HEAP322[$247 >> 2] | 0;
              $251 = $250 | $249;
              HEAP322[$247 >> 2] = $251;
              $$4376 = $244;
            } else {
              $$4376 = $$3375;
            }
            $252 = $6 + ($241 << 2) | 0;
            HEAP322[$252 >> 2] = $$1335;
            $$0380$ph = $237;
            $$1373$ph448 = $$4376;
            $$2352$ph449 = $241;
            $$2387$ph447 = $239;
          }
        L119:
          while (1) {
            $289 = $$6378$ph + 1 | 0;
            $287 = $289 & 127;
            $290 = $$6378$ph + 127 | 0;
            $291 = $290 & 127;
            $292 = $6 + ($291 << 2) | 0;
            $$1381$ph558 = $$1381$ph;
            $$4354$ph559 = $$4354$ph;
            $$4389$ph = $$4389$ph445;
            while (1) {
              $265 = ($$4389$ph | 0) == 18;
              $293 = ($$4389$ph | 0) > 27;
              $$425 = $293 ? 9 : 1;
              $$1381 = $$1381$ph558;
              $$4354 = $$4354$ph559;
              while (1) {
                $$0336486 = 0;
                while (1) {
                  $253 = $$0336486 + $$4354 | 0;
                  $254 = $253 & 127;
                  $255 = ($254 | 0) == ($$6378$ph | 0);
                  if ($255) {
                    $$1337 = 2;
                    label = 88;
                    break;
                  }
                  $256 = $6 + ($254 << 2) | 0;
                  $257 = HEAP322[$256 >> 2] | 0;
                  $258 = 1116 + ($$0336486 << 2) | 0;
                  $259 = HEAP322[$258 >> 2] | 0;
                  $260 = $257 >>> 0 < $259 >>> 0;
                  if ($260) {
                    $$1337 = 2;
                    label = 88;
                    break;
                  }
                  $261 = $257 >>> 0 > $259 >>> 0;
                  if ($261) {
                    break;
                  }
                  $262 = $$0336486 + 1 | 0;
                  $263 = ($262 | 0) < 2;
                  if ($263) {
                    $$0336486 = $262;
                  } else {
                    $$1337 = $262;
                    label = 88;
                    break;
                  }
                }
                if ((label | 0) == 88) {
                  label = 0;
                  $264 = ($$1337 | 0) == 2;
                  $or$cond11 = $265 & $264;
                  if ($or$cond11) {
                    $$0365484 = 0;
                    $$4485 = 0;
                    $$9483 = $$6378$ph;
                    break L119;
                  }
                }
                $266 = $$425 + $$1381 | 0;
                $267 = ($$4354 | 0) == ($$6378$ph | 0);
                if ($267) {
                  $$1381 = $266;
                  $$4354 = $$6378$ph;
                } else {
                  break;
                }
              }
              $268 = 1 << $$425;
              $269 = $268 + -1 | 0;
              $270 = 1e9 >>> $$425;
              $$0332490 = 0;
              $$5355488 = $$4354;
              $$5390487 = $$4389$ph;
              $$6489 = $$4354;
              while (1) {
                $271 = $6 + ($$6489 << 2) | 0;
                $272 = HEAP322[$271 >> 2] | 0;
                $273 = $272 & $269;
                $274 = $272 >>> $$425;
                $275 = $274 + $$0332490 | 0;
                HEAP322[$271 >> 2] = $275;
                $276 = Math_imul($273, $270) | 0;
                $277 = ($$6489 | 0) == ($$5355488 | 0);
                $278 = ($275 | 0) == 0;
                $or$cond426 = $277 & $278;
                $279 = $$5355488 + 1 | 0;
                $280 = $279 & 127;
                $281 = $$5390487 + -9 | 0;
                $$$5390 = $or$cond426 ? $281 : $$5390487;
                $$$5355 = $or$cond426 ? $280 : $$5355488;
                $282 = $$6489 + 1 | 0;
                $283 = $282 & 127;
                $284 = ($283 | 0) == ($$6378$ph | 0);
                if ($284) {
                  break;
                } else {
                  $$0332490 = $276;
                  $$5355488 = $$$5355;
                  $$5390487 = $$$5390;
                  $$6489 = $283;
                }
              }
              $285 = ($276 | 0) == 0;
              if ($285) {
                $$1381$ph558 = $266;
                $$4354$ph559 = $$$5355;
                $$4389$ph = $$$5390;
                continue;
              }
              $286 = ($287 | 0) == ($$$5355 | 0);
              if (!$286) {
                break;
              }
              $294 = HEAP322[$292 >> 2] | 0;
              $295 = $294 | 1;
              HEAP322[$292 >> 2] = $295;
              $$1381$ph558 = $266;
              $$4354$ph559 = $$$5355;
              $$4389$ph = $$$5390;
            }
            $288 = $6 + ($$6378$ph << 2) | 0;
            HEAP322[$288 >> 2] = $276;
            $$1381$ph = $266;
            $$4354$ph = $$$5355;
            $$4389$ph445 = $$$5390;
            $$6378$ph = $287;
          }
        while (1) {
          $296 = $$4485 + $$4354 | 0;
          $297 = $296 & 127;
          $298 = ($297 | 0) == ($$9483 | 0);
          $299 = $$9483 + 1 | 0;
          $300 = $299 & 127;
          if ($298) {
            $301 = $300 + -1 | 0;
            $302 = $6 + ($301 << 2) | 0;
            HEAP322[$302 >> 2] = 0;
            $$10 = $300;
          } else {
            $$10 = $$9483;
          }
          $303 = $$0365484 * 1e9;
          $304 = $6 + ($297 << 2) | 0;
          $305 = HEAP322[$304 >> 2] | 0;
          $306 = +($305 >>> 0);
          $307 = $303 + $306;
          $308 = $$4485 + 1 | 0;
          $exitcond = ($308 | 0) == 2;
          if ($exitcond) {
            break;
          } else {
            $$0365484 = $307;
            $$4485 = $308;
            $$9483 = $$10;
          }
        }
        $309 = +($4 | 0);
        $310 = $309 * $307;
        $311 = $$1381 + 53 | 0;
        $312 = $311 - $3 | 0;
        $313 = ($312 | 0) < ($2 | 0);
        $314 = ($312 | 0) > 0;
        $$ = $314 ? $312 : 0;
        $$0333 = $313 ? $$ : $2;
        $315 = ($$0333 | 0) < 53;
        if ($315) {
          $316 = 105 - $$0333 | 0;
          $317 = +_scalbn(1, $316);
          $318 = +_copysignl($317, $310);
          $319 = 53 - $$0333 | 0;
          $320 = +_scalbn(1, $319);
          $321 = +_fmodl($310, $320);
          $322 = $310 - $321;
          $323 = $318 + $322;
          $$0360 = $318;
          $$0361 = $321;
          $$1366 = $323;
        } else {
          $$0360 = 0;
          $$0361 = 0;
          $$1366 = $310;
        }
        $324 = $$4354 + 2 | 0;
        $325 = $324 & 127;
        $326 = ($325 | 0) == ($$10 | 0);
        if ($326) {
          $$3364 = $$0361;
        } else {
          $327 = $6 + ($325 << 2) | 0;
          $328 = HEAP322[$327 >> 2] | 0;
          $329 = $328 >>> 0 < 5e8;
          do {
            if ($329) {
              $330 = ($328 | 0) == 0;
              if ($330) {
                $331 = $$4354 + 3 | 0;
                $332 = $331 & 127;
                $333 = ($332 | 0) == ($$10 | 0);
                if ($333) {
                  $$1362 = $$0361;
                  break;
                }
              }
              $334 = $309 * 0.25;
              $335 = $334 + $$0361;
              $$1362 = $335;
            } else {
              $336 = ($328 | 0) == 5e8;
              if (!$336) {
                $337 = $309 * 0.75;
                $338 = $337 + $$0361;
                $$1362 = $338;
                break;
              }
              $339 = $$4354 + 3 | 0;
              $340 = $339 & 127;
              $341 = ($340 | 0) == ($$10 | 0);
              if ($341) {
                $342 = $309 * 0.5;
                $343 = $342 + $$0361;
                $$1362 = $343;
                break;
              } else {
                $344 = $309 * 0.75;
                $345 = $344 + $$0361;
                $$1362 = $345;
                break;
              }
            }
          } while (0);
          $346 = 53 - $$0333 | 0;
          $347 = ($346 | 0) > 1;
          if ($347) {
            $348 = +_fmodl($$1362, 1);
            $349 = $348 != 0;
            if ($349) {
              $$3364 = $$1362;
            } else {
              $350 = $$1362 + 1;
              $$3364 = $350;
            }
          } else {
            $$3364 = $$1362;
          }
        }
        $351 = $$1366 + $$3364;
        $352 = $351 - $$0360;
        $353 = $311 & 2147483647;
        $354 = -2 - $sum | 0;
        $355 = ($353 | 0) > ($354 | 0);
        do {
          if ($355) {
            $356 = +Math_abs2(+$352);
            $357 = !($356 >= 9007199254740992);
            $358 = $352 * 0.5;
            $not$ = $357 ^ 1;
            $359 = $not$ & 1;
            $$3383 = $359 + $$1381 | 0;
            $$2367 = $357 ? $352 : $358;
            $360 = $$3383 + 50 | 0;
            $361 = ($360 | 0) > ($7 | 0);
            if (!$361) {
              $362 = ($$0333 | 0) != ($312 | 0);
              $narrow = $362 | $357;
              $$2371$v = $313 & $narrow;
              $363 = $$3364 != 0;
              $or$cond14 = $363 & $$2371$v;
              if (!$or$cond14) {
                $$3368 = $$2367;
                $$4384 = $$3383;
                break;
              }
            }
            $364 = ___errno_location() | 0;
            HEAP322[$364 >> 2] = 34;
            $$3368 = $$2367;
            $$4384 = $$3383;
          } else {
            $$3368 = $352;
            $$4384 = $$1381;
          }
        } while (0);
        $365 = +_scalbnl($$3368, $$4384);
        $$1 = $365;
      }
    } while (0);
    STACKTOP2 = sp;
    return +$$1;
  }
  function _scanexp($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0 = 0, $$04861 = 0, $$049 = 0, $$1$be = 0, $$160 = 0, $$2$be = 0, $$2$lcssa = 0, $$254 = 0, $$3$be = 0, $$lcssa = 0, $$pre = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0;
    var $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0;
    var $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0;
    var $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0;
    var $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0;
    var $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $or$cond3 = 0;
    $2 = $0 + 4 | 0;
    $3 = HEAP322[$2 >> 2] | 0;
    $4 = $0 + 100 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = $3 >>> 0 < $5 >>> 0;
    if ($6) {
      $7 = $3 + 1 | 0;
      HEAP322[$2 >> 2] = $7;
      $8 = HEAP82[$3 >> 0] | 0;
      $9 = $8 & 255;
      $11 = $9;
    } else {
      $10 = ___shgetc($0) | 0;
      $11 = $10;
    }
    switch ($11 | 0) {
      case 43:
      case 45: {
        $12 = ($11 | 0) == 45;
        $13 = $12 & 1;
        $14 = HEAP322[$2 >> 2] | 0;
        $15 = HEAP322[$4 >> 2] | 0;
        $16 = $14 >>> 0 < $15 >>> 0;
        if ($16) {
          $17 = $14 + 1 | 0;
          HEAP322[$2 >> 2] = $17;
          $18 = HEAP82[$14 >> 0] | 0;
          $19 = $18 & 255;
          $22 = $19;
        } else {
          $20 = ___shgetc($0) | 0;
          $22 = $20;
        }
        $21 = $22 + -48 | 0;
        $23 = $21 >>> 0 > 9;
        $24 = ($1 | 0) != 0;
        $or$cond3 = $24 & $23;
        if ($or$cond3) {
          $25 = HEAP322[$4 >> 2] | 0;
          $26 = ($25 | 0) == (0 | 0);
          if ($26) {
            $$0 = $13;
            $$049 = $22;
          } else {
            $27 = HEAP322[$2 >> 2] | 0;
            $28 = $27 + -1 | 0;
            HEAP322[$2 >> 2] = $28;
            $$0 = $13;
            $$049 = $22;
          }
        } else {
          $$0 = $13;
          $$049 = $22;
        }
        break;
      }
      default: {
        $$0 = 0;
        $$049 = $11;
      }
    }
    $29 = $$049 + -48 | 0;
    $30 = $29 >>> 0 > 9;
    if ($30) {
      $31 = HEAP322[$4 >> 2] | 0;
      $32 = ($31 | 0) == (0 | 0);
      if ($32) {
        $100 = -2147483648;
        $101 = 0;
      } else {
        $33 = HEAP322[$2 >> 2] | 0;
        $34 = $33 + -1 | 0;
        HEAP322[$2 >> 2] = $34;
        $100 = -2147483648;
        $101 = 0;
      }
    } else {
      $$04861 = 0;
      $$160 = $$049;
      while (1) {
        $35 = $$04861 * 10 | 0;
        $36 = $$160 + -48 | 0;
        $37 = $36 + $35 | 0;
        $38 = HEAP322[$2 >> 2] | 0;
        $39 = HEAP322[$4 >> 2] | 0;
        $40 = $38 >>> 0 < $39 >>> 0;
        if ($40) {
          $41 = $38 + 1 | 0;
          HEAP322[$2 >> 2] = $41;
          $42 = HEAP82[$38 >> 0] | 0;
          $43 = $42 & 255;
          $$1$be = $43;
        } else {
          $44 = ___shgetc($0) | 0;
          $$1$be = $44;
        }
        $45 = $$1$be + -48 | 0;
        $46 = $45 >>> 0 < 10;
        $47 = ($37 | 0) < 214748364;
        $48 = $46 & $47;
        if ($48) {
          $$04861 = $37;
          $$160 = $$1$be;
        } else {
          break;
        }
      }
      $49 = ($37 | 0) < 0;
      $50 = $49 << 31 >> 31;
      $51 = $$1$be + -48 | 0;
      $52 = $51 >>> 0 < 10;
      if ($52) {
        $$254 = $$1$be;
        $56 = $37;
        $57 = $50;
        while (1) {
          $58 = ___muldi3($56 | 0, $57 | 0, 10, 0) | 0;
          $59 = tempRet02;
          $60 = ($$254 | 0) < 0;
          $61 = $60 << 31 >> 31;
          $62 = _i64Add($$254 | 0, $61 | 0, -48, -1) | 0;
          $63 = tempRet02;
          $64 = _i64Add($62 | 0, $63 | 0, $58 | 0, $59 | 0) | 0;
          $65 = tempRet02;
          $66 = HEAP322[$2 >> 2] | 0;
          $67 = HEAP322[$4 >> 2] | 0;
          $68 = $66 >>> 0 < $67 >>> 0;
          if ($68) {
            $69 = $66 + 1 | 0;
            HEAP322[$2 >> 2] = $69;
            $70 = HEAP82[$66 >> 0] | 0;
            $71 = $70 & 255;
            $$2$be = $71;
          } else {
            $72 = ___shgetc($0) | 0;
            $$2$be = $72;
          }
          $73 = $$2$be + -48 | 0;
          $74 = $73 >>> 0 < 10;
          $75 = ($65 | 0) < 21474836;
          $76 = $64 >>> 0 < 2061584302;
          $77 = ($65 | 0) == 21474836;
          $78 = $77 & $76;
          $79 = $75 | $78;
          $80 = $74 & $79;
          if ($80) {
            $$254 = $$2$be;
            $56 = $64;
            $57 = $65;
          } else {
            $$2$lcssa = $$2$be;
            $94 = $64;
            $95 = $65;
            break;
          }
        }
      } else {
        $$2$lcssa = $$1$be;
        $94 = $37;
        $95 = $50;
      }
      $53 = $$2$lcssa + -48 | 0;
      $54 = $53 >>> 0 < 10;
      $55 = HEAP322[$4 >> 2] | 0;
      if ($54) {
        $83 = $55;
        while (1) {
          $81 = HEAP322[$2 >> 2] | 0;
          $82 = $81 >>> 0 < $83 >>> 0;
          if ($82) {
            $84 = $81 + 1 | 0;
            HEAP322[$2 >> 2] = $84;
            $85 = HEAP82[$81 >> 0] | 0;
            $86 = $85 & 255;
            $$3$be = $86;
            $102 = $83;
          } else {
            $87 = ___shgetc($0) | 0;
            $$pre = HEAP322[$4 >> 2] | 0;
            $$3$be = $87;
            $102 = $$pre;
          }
          $88 = $$3$be + -48 | 0;
          $89 = $88 >>> 0 < 10;
          if ($89) {
            $83 = $102;
          } else {
            $$lcssa = $102;
            break;
          }
        }
      } else {
        $$lcssa = $55;
      }
      $90 = ($$lcssa | 0) == (0 | 0);
      if (!$90) {
        $91 = HEAP322[$2 >> 2] | 0;
        $92 = $91 + -1 | 0;
        HEAP322[$2 >> 2] = $92;
      }
      $93 = ($$0 | 0) != 0;
      $96 = _i64Subtract(0, 0, $94 | 0, $95 | 0) | 0;
      $97 = tempRet02;
      $98 = $93 ? $96 : $94;
      $99 = $93 ? $97 : $95;
      $100 = $99;
      $101 = $98;
    }
    tempRet02 = $100;
    return $101 | 0;
  }
  function _scalbn($0, $1) {
    $0 = +$0;
    $1 = $1 | 0;
    var $$ = 0, $$$ = 0, $$0 = 0, $$020 = 0, $$1 = 0, $$1$ = 0, $$21 = 0, $$22 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
    var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $2 = ($1 | 0) > 1023;
    if ($2) {
      $3 = $0 * 898846567431158e293;
      $4 = $1 + -1023 | 0;
      $5 = ($4 | 0) > 1023;
      $6 = $3 * 898846567431158e293;
      $7 = $1 + -2046 | 0;
      $8 = ($7 | 0) < 1023;
      $$ = $8 ? $7 : 1023;
      $$$ = $5 ? $$ : $4;
      $$21 = $5 ? $6 : $3;
      $$0 = $$21;
      $$020 = $$$;
    } else {
      $9 = ($1 | 0) < -1022;
      if ($9) {
        $10 = $0 * 22250738585072014e-324;
        $11 = $1 + 1022 | 0;
        $12 = ($11 | 0) < -1022;
        $13 = $10 * 22250738585072014e-324;
        $14 = $1 + 2044 | 0;
        $15 = ($14 | 0) > -1022;
        $$1 = $15 ? $14 : -1022;
        $$1$ = $12 ? $$1 : $11;
        $$22 = $12 ? $13 : $10;
        $$0 = $$22;
        $$020 = $$1$;
      } else {
        $$0 = $0;
        $$020 = $1;
      }
    }
    $16 = $$020 + 1023 | 0;
    $17 = _bitshift64Shl($16 | 0, 0, 52) | 0;
    $18 = tempRet02;
    HEAP322[tempDoublePtr2 >> 2] = $17;
    HEAP322[tempDoublePtr2 + 4 >> 2] = $18;
    $19 = +HEAPF642[tempDoublePtr2 >> 3];
    $20 = $$0 * $19;
    return +$20;
  }
  function _copysignl($0, $1) {
    $0 = +$0;
    $1 = +$1;
    var $2 = 0;
    $2 = +_copysign($0, $1);
    return +$2;
  }
  function _fmodl($0, $1) {
    $0 = +$0;
    $1 = +$1;
    var $2 = 0;
    $2 = +_fmod($0, $1);
    return +$2;
  }
  function _scalbnl($0, $1) {
    $0 = +$0;
    $1 = $1 | 0;
    var $2 = 0;
    $2 = +_scalbn($0, $1);
    return +$2;
  }
  function _fmod($0, $1) {
    $0 = +$0;
    $1 = +$1;
    var $$ = 0, $$070 = 0, $$071$lcssa = 0, $$07194 = 0, $$073$lcssa = 0, $$073100 = 0, $$172$ph = 0, $$174 = 0, $$275$lcssa = 0, $$27586 = 0, $$376$lcssa = 0, $$37683 = 0, $$lcssa = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
    var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
    var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
    var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
    var $160 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0;
    var $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0;
    var $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
    var $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0;
    var $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $or$cond = 0, label = 0;
    HEAPF642[tempDoublePtr2 >> 3] = $0;
    $2 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $3 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    HEAPF642[tempDoublePtr2 >> 3] = $1;
    $4 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $5 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    $6 = _bitshift64Lshr($2 | 0, $3 | 0, 52) | 0;
    $8 = $6 & 2047;
    $9 = _bitshift64Lshr($4 | 0, $5 | 0, 52) | 0;
    $11 = $9 & 2047;
    $12 = $3 & -2147483648;
    $13 = _bitshift64Shl($4 | 0, $5 | 0, 1) | 0;
    $14 = tempRet02;
    $15 = ($13 | 0) == 0;
    $16 = ($14 | 0) == 0;
    $17 = $15 & $16;
    L1:
      do {
        if ($17) {
          label = 3;
        } else {
          $18 = ___DOUBLE_BITS_272($1) | 0;
          $19 = tempRet02;
          $20 = $19 & 2147483647;
          $21 = $20 >>> 0 > 2146435072;
          $22 = $18 >>> 0 > 0;
          $23 = ($20 | 0) == 2146435072;
          $24 = $23 & $22;
          $25 = $21 | $24;
          $26 = ($8 | 0) == 2047;
          $or$cond = $26 | $25;
          if ($or$cond) {
            label = 3;
          } else {
            $29 = _bitshift64Shl($2 | 0, $3 | 0, 1) | 0;
            $30 = tempRet02;
            $31 = $30 >>> 0 > $14 >>> 0;
            $32 = $29 >>> 0 > $13 >>> 0;
            $33 = ($30 | 0) == ($14 | 0);
            $34 = $33 & $32;
            $35 = $31 | $34;
            if (!$35) {
              $36 = ($29 | 0) == ($13 | 0);
              $37 = ($30 | 0) == ($14 | 0);
              $38 = $36 & $37;
              $39 = $0 * 0;
              $$ = $38 ? $39 : $0;
              return +$$;
            }
            $40 = ($8 | 0) == 0;
            if ($40) {
              $41 = _bitshift64Shl($2 | 0, $3 | 0, 12) | 0;
              $42 = tempRet02;
              $43 = ($42 | 0) > -1;
              $44 = $41 >>> 0 > 4294967295;
              $45 = ($42 | 0) == -1;
              $46 = $45 & $44;
              $47 = $43 | $46;
              if ($47) {
                $$073100 = 0;
                $49 = $41;
                $50 = $42;
                while (1) {
                  $48 = $$073100 + -1 | 0;
                  $51 = _bitshift64Shl($49 | 0, $50 | 0, 1) | 0;
                  $52 = tempRet02;
                  $53 = ($52 | 0) > -1;
                  $54 = $51 >>> 0 > 4294967295;
                  $55 = ($52 | 0) == -1;
                  $56 = $55 & $54;
                  $57 = $53 | $56;
                  if ($57) {
                    $$073100 = $48;
                    $49 = $51;
                    $50 = $52;
                  } else {
                    $$073$lcssa = $48;
                    break;
                  }
                }
              } else {
                $$073$lcssa = 0;
              }
              $58 = 1 - $$073$lcssa | 0;
              $59 = _bitshift64Shl($2 | 0, $3 | 0, $58 | 0) | 0;
              $60 = tempRet02;
              $$174 = $$073$lcssa;
              $87 = $59;
              $88 = $60;
            } else {
              $61 = $3 & 1048575;
              $62 = $61 | 1048576;
              $$174 = $8;
              $87 = $2;
              $88 = $62;
            }
            $63 = ($11 | 0) == 0;
            if ($63) {
              $64 = _bitshift64Shl($4 | 0, $5 | 0, 12) | 0;
              $65 = tempRet02;
              $66 = ($65 | 0) > -1;
              $67 = $64 >>> 0 > 4294967295;
              $68 = ($65 | 0) == -1;
              $69 = $68 & $67;
              $70 = $66 | $69;
              if ($70) {
                $$07194 = 0;
                $72 = $64;
                $73 = $65;
                while (1) {
                  $71 = $$07194 + -1 | 0;
                  $74 = _bitshift64Shl($72 | 0, $73 | 0, 1) | 0;
                  $75 = tempRet02;
                  $76 = ($75 | 0) > -1;
                  $77 = $74 >>> 0 > 4294967295;
                  $78 = ($75 | 0) == -1;
                  $79 = $78 & $77;
                  $80 = $76 | $79;
                  if ($80) {
                    $$07194 = $71;
                    $72 = $74;
                    $73 = $75;
                  } else {
                    $$071$lcssa = $71;
                    break;
                  }
                }
              } else {
                $$071$lcssa = 0;
              }
              $81 = 1 - $$071$lcssa | 0;
              $82 = _bitshift64Shl($4 | 0, $5 | 0, $81 | 0) | 0;
              $83 = tempRet02;
              $$172$ph = $$071$lcssa;
              $89 = $82;
              $90 = $83;
            } else {
              $84 = $5 & 1048575;
              $85 = $84 | 1048576;
              $$172$ph = $11;
              $89 = $4;
              $90 = $85;
            }
            $86 = ($$174 | 0) > ($$172$ph | 0);
            $91 = _i64Subtract($87 | 0, $88 | 0, $89 | 0, $90 | 0) | 0;
            $92 = tempRet02;
            $93 = ($92 | 0) > -1;
            $94 = $91 >>> 0 > 4294967295;
            $95 = ($92 | 0) == -1;
            $96 = $95 & $94;
            $97 = $93 | $96;
            L23:
              do {
                if ($86) {
                  $$27586 = $$174;
                  $101 = $92;
                  $156 = $97;
                  $157 = $87;
                  $158 = $88;
                  $99 = $91;
                  while (1) {
                    if ($156) {
                      $98 = ($99 | 0) == 0;
                      $100 = ($101 | 0) == 0;
                      $102 = $98 & $100;
                      if ($102) {
                        break;
                      } else {
                        $104 = $99;
                        $105 = $101;
                      }
                    } else {
                      $104 = $157;
                      $105 = $158;
                    }
                    $106 = _bitshift64Shl($104 | 0, $105 | 0, 1) | 0;
                    $107 = tempRet02;
                    $108 = $$27586 + -1 | 0;
                    $109 = ($108 | 0) > ($$172$ph | 0);
                    $110 = _i64Subtract($106 | 0, $107 | 0, $89 | 0, $90 | 0) | 0;
                    $111 = tempRet02;
                    $112 = ($111 | 0) > -1;
                    $113 = $110 >>> 0 > 4294967295;
                    $114 = ($111 | 0) == -1;
                    $115 = $114 & $113;
                    $116 = $112 | $115;
                    if ($109) {
                      $$27586 = $108;
                      $101 = $111;
                      $156 = $116;
                      $157 = $106;
                      $158 = $107;
                      $99 = $110;
                    } else {
                      $$275$lcssa = $108;
                      $$lcssa = $116;
                      $118 = $110;
                      $120 = $111;
                      $159 = $106;
                      $160 = $107;
                      break L23;
                    }
                  }
                  $103 = $0 * 0;
                  $$070 = $103;
                  break L1;
                } else {
                  $$275$lcssa = $$174;
                  $$lcssa = $97;
                  $118 = $91;
                  $120 = $92;
                  $159 = $87;
                  $160 = $88;
                }
              } while (0);
            if ($$lcssa) {
              $117 = ($118 | 0) == 0;
              $119 = ($120 | 0) == 0;
              $121 = $117 & $119;
              if ($121) {
                $129 = $0 * 0;
                $$070 = $129;
                break;
              } else {
                $123 = $120;
                $125 = $118;
              }
            } else {
              $123 = $160;
              $125 = $159;
            }
            $122 = $123 >>> 0 < 1048576;
            $124 = $125 >>> 0 < 0;
            $126 = ($123 | 0) == 1048576;
            $127 = $126 & $124;
            $128 = $122 | $127;
            if ($128) {
              $$37683 = $$275$lcssa;
              $130 = $125;
              $131 = $123;
              while (1) {
                $132 = _bitshift64Shl($130 | 0, $131 | 0, 1) | 0;
                $133 = tempRet02;
                $134 = $$37683 + -1 | 0;
                $135 = $133 >>> 0 < 1048576;
                $136 = $132 >>> 0 < 0;
                $137 = ($133 | 0) == 1048576;
                $138 = $137 & $136;
                $139 = $135 | $138;
                if ($139) {
                  $$37683 = $134;
                  $130 = $132;
                  $131 = $133;
                } else {
                  $$376$lcssa = $134;
                  $141 = $132;
                  $142 = $133;
                  break;
                }
              }
            } else {
              $$376$lcssa = $$275$lcssa;
              $141 = $125;
              $142 = $123;
            }
            $140 = ($$376$lcssa | 0) > 0;
            if ($140) {
              $143 = _i64Add($141 | 0, $142 | 0, 0, -1048576) | 0;
              $144 = tempRet02;
              $145 = _bitshift64Shl($$376$lcssa | 0, 0, 52) | 0;
              $146 = tempRet02;
              $147 = $143 | $145;
              $148 = $144 | $146;
              $153 = $148;
              $154 = $147;
            } else {
              $149 = 1 - $$376$lcssa | 0;
              $150 = _bitshift64Lshr($141 | 0, $142 | 0, $149 | 0) | 0;
              $151 = tempRet02;
              $153 = $151;
              $154 = $150;
            }
            $152 = $153 | $12;
            HEAP322[tempDoublePtr2 >> 2] = $154;
            HEAP322[tempDoublePtr2 + 4 >> 2] = $152;
            $155 = +HEAPF642[tempDoublePtr2 >> 3];
            $$070 = $155;
          }
        }
      } while (0);
    if ((label | 0) == 3) {
      $27 = $0 * $1;
      $28 = $27 / $27;
      $$070 = $28;
    }
    return +$$070;
  }
  function ___DOUBLE_BITS_272($0) {
    $0 = +$0;
    var $1 = 0, $2 = 0;
    HEAPF642[tempDoublePtr2 >> 3] = $0;
    $1 = HEAP322[tempDoublePtr2 >> 2] | 0;
    $2 = HEAP322[tempDoublePtr2 + 4 >> 2] | 0;
    tempRet02 = $2;
    return $1 | 0;
  }
  function _strlen($0) {
    $0 = $0 | 0;
    var $$0 = 0, $$015$lcssa = 0, $$01519 = 0, $$1$lcssa = 0, $$pn = 0, $$pre = 0, $$sink = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
    var $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
    $1 = $0;
    $2 = $1 & 3;
    $3 = ($2 | 0) == 0;
    L1:
      do {
        if ($3) {
          $$015$lcssa = $0;
          label = 4;
        } else {
          $$01519 = $0;
          $23 = $1;
          while (1) {
            $4 = HEAP82[$$01519 >> 0] | 0;
            $5 = $4 << 24 >> 24 == 0;
            if ($5) {
              $$sink = $23;
              break L1;
            }
            $6 = $$01519 + 1 | 0;
            $7 = $6;
            $8 = $7 & 3;
            $9 = ($8 | 0) == 0;
            if ($9) {
              $$015$lcssa = $6;
              label = 4;
              break;
            } else {
              $$01519 = $6;
              $23 = $7;
            }
          }
        }
      } while (0);
    if ((label | 0) == 4) {
      $$0 = $$015$lcssa;
      while (1) {
        $10 = HEAP322[$$0 >> 2] | 0;
        $11 = $10 + -16843009 | 0;
        $12 = $10 & -2139062144;
        $13 = $12 ^ -2139062144;
        $14 = $13 & $11;
        $15 = ($14 | 0) == 0;
        $16 = $$0 + 4 | 0;
        if ($15) {
          $$0 = $16;
        } else {
          break;
        }
      }
      $17 = $10 & 255;
      $18 = $17 << 24 >> 24 == 0;
      if ($18) {
        $$1$lcssa = $$0;
      } else {
        $$pn = $$0;
        while (1) {
          $19 = $$pn + 1 | 0;
          $$pre = HEAP82[$19 >> 0] | 0;
          $20 = $$pre << 24 >> 24 == 0;
          if ($20) {
            $$1$lcssa = $19;
            break;
          } else {
            $$pn = $19;
          }
        }
      }
      $21 = $$1$lcssa;
      $$sink = $21;
    }
    $22 = $$sink - $1 | 0;
    return $22 | 0;
  }
  function _mbrtowc($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$ = 0, $$0 = 0, $$03952 = 0, $$04051 = 0, $$04350 = 0, $$1 = 0, $$141 = 0, $$144 = 0, $$2 = 0, $$47 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0;
    var $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
    var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    var $not$ = 0, label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $4 = sp;
    $5 = ($3 | 0) == (0 | 0);
    $$ = $5 ? 38944 : $3;
    $6 = HEAP322[$$ >> 2] | 0;
    $7 = ($1 | 0) == (0 | 0);
    L1:
      do {
        if ($7) {
          $8 = ($6 | 0) == 0;
          if ($8) {
            $$0 = 0;
          } else {
            label = 17;
          }
        } else {
          $9 = ($0 | 0) == (0 | 0);
          $$47 = $9 ? $4 : $0;
          $10 = ($2 | 0) == 0;
          if ($10) {
            $$0 = -2;
          } else {
            $11 = ($6 | 0) == 0;
            if ($11) {
              $12 = HEAP82[$1 >> 0] | 0;
              $13 = $12 << 24 >> 24 > -1;
              if ($13) {
                $14 = $12 & 255;
                HEAP322[$$47 >> 2] = $14;
                $15 = $12 << 24 >> 24 != 0;
                $16 = $15 & 1;
                $$0 = $16;
                break;
              }
              $17 = ___pthread_self_422() | 0;
              $18 = $17 + 188 | 0;
              $19 = HEAP322[$18 >> 2] | 0;
              $20 = HEAP322[$19 >> 2] | 0;
              $not$ = ($20 | 0) == (0 | 0);
              $21 = HEAP82[$1 >> 0] | 0;
              if ($not$) {
                $22 = $21 << 24 >> 24;
                $23 = $22 & 57343;
                HEAP322[$$47 >> 2] = $23;
                $$0 = 1;
                break;
              }
              $24 = $21 & 255;
              $25 = $24 + -194 | 0;
              $26 = $25 >>> 0 > 50;
              if ($26) {
                label = 17;
                break;
              }
              $27 = $1 + 1 | 0;
              $28 = 384 + ($25 << 2) | 0;
              $29 = HEAP322[$28 >> 2] | 0;
              $30 = $2 + -1 | 0;
              $31 = ($30 | 0) == 0;
              if ($31) {
                $$2 = $29;
              } else {
                $$03952 = $27;
                $$04051 = $29;
                $$04350 = $30;
                label = 11;
              }
            } else {
              $$03952 = $1;
              $$04051 = $6;
              $$04350 = $2;
              label = 11;
            }
            L14:
              do {
                if ((label | 0) == 11) {
                  $32 = HEAP82[$$03952 >> 0] | 0;
                  $33 = $32 & 255;
                  $34 = $33 >>> 3;
                  $35 = $34 + -16 | 0;
                  $36 = $$04051 >> 26;
                  $37 = $34 + $36 | 0;
                  $38 = $35 | $37;
                  $39 = $38 >>> 0 > 7;
                  if ($39) {
                    label = 17;
                    break L1;
                  } else {
                    $$1 = $$03952;
                    $$141 = $$04051;
                    $$144 = $$04350;
                    $43 = $32;
                  }
                  while (1) {
                    $40 = $$141 << 6;
                    $41 = $$1 + 1 | 0;
                    $42 = $43 & 255;
                    $44 = $42 + -128 | 0;
                    $45 = $44 | $40;
                    $46 = $$144 + -1 | 0;
                    $47 = ($45 | 0) < 0;
                    if (!$47) {
                      break;
                    }
                    $49 = ($46 | 0) == 0;
                    if ($49) {
                      $$2 = $45;
                      break L14;
                    }
                    $50 = HEAP82[$41 >> 0] | 0;
                    $51 = $50 & -64;
                    $52 = $51 << 24 >> 24 == -128;
                    if ($52) {
                      $$1 = $41;
                      $$141 = $45;
                      $$144 = $46;
                      $43 = $50;
                    } else {
                      label = 17;
                      break L1;
                    }
                  }
                  HEAP322[$$ >> 2] = 0;
                  HEAP322[$$47 >> 2] = $45;
                  $48 = $2 - $46 | 0;
                  $$0 = $48;
                  break L1;
                }
              } while (0);
            HEAP322[$$ >> 2] = $$2;
            $$0 = -2;
          }
        }
      } while (0);
    if ((label | 0) == 17) {
      HEAP322[$$ >> 2] = 0;
      $53 = ___errno_location() | 0;
      HEAP322[$53 >> 2] = 84;
      $$0 = -1;
    }
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function ___pthread_self_422() {
    var $0 = 0;
    $0 = _pthread_self() | 0;
    return $0 | 0;
  }
  function ___strdup($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0;
    $1 = _strlen($0) | 0;
    $2 = $1 + 1 | 0;
    $3 = _malloc2($2) | 0;
    $4 = ($3 | 0) == (0 | 0);
    if ($4) {
      $$0 = 0;
    } else {
      _memcpy($3 | 0, $0 | 0, $2 | 0) | 0;
      $$0 = $3;
    }
    return $$0 | 0;
  }
  function ___ofl_lock() {
    ___lock2(38948 | 0);
    return 38956 | 0;
  }
  function ___ofl_unlock() {
    ___unlock2(38948 | 0);
    return;
  }
  function _fflush($0) {
    $0 = $0 | 0;
    var $$0 = 0, $$023 = 0, $$02325 = 0, $$02327 = 0, $$024$lcssa = 0, $$02426 = 0, $$1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
    var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phitmp = 0;
    $1 = ($0 | 0) == (0 | 0);
    do {
      if ($1) {
        $8 = HEAP322[239] | 0;
        $9 = ($8 | 0) == (0 | 0);
        if ($9) {
          $29 = 0;
        } else {
          $10 = HEAP322[239] | 0;
          $11 = _fflush($10) | 0;
          $29 = $11;
        }
        $12 = ___ofl_lock() | 0;
        $$02325 = HEAP322[$12 >> 2] | 0;
        $13 = ($$02325 | 0) == (0 | 0);
        if ($13) {
          $$024$lcssa = $29;
        } else {
          $$02327 = $$02325;
          $$02426 = $29;
          while (1) {
            $14 = $$02327 + 76 | 0;
            HEAP322[$14 >> 2] | 0;
            $18 = $$02327 + 20 | 0;
            $19 = HEAP322[$18 >> 2] | 0;
            $20 = $$02327 + 28 | 0;
            $21 = HEAP322[$20 >> 2] | 0;
            $22 = $19 >>> 0 > $21 >>> 0;
            if ($22) {
              $23 = ___fflush_unlocked($$02327) | 0;
              $24 = $23 | $$02426;
              $$1 = $24;
            } else {
              $$1 = $$02426;
            }
            $27 = $$02327 + 56 | 0;
            $$023 = HEAP322[$27 >> 2] | 0;
            $28 = ($$023 | 0) == (0 | 0);
            if ($28) {
              $$024$lcssa = $$1;
              break;
            } else {
              $$02327 = $$023;
              $$02426 = $$1;
            }
          }
        }
        ___ofl_unlock();
        $$0 = $$024$lcssa;
      } else {
        $2 = $0 + 76 | 0;
        $3 = HEAP322[$2 >> 2] | 0;
        $4 = ($3 | 0) > -1;
        if (!$4) {
          $5 = ___fflush_unlocked($0) | 0;
          $$0 = $5;
          break;
        }
        $6 = ___lockfile() | 0;
        $phitmp = ($6 | 0) == 0;
        $7 = ___fflush_unlocked($0) | 0;
        if ($phitmp) {
          $$0 = $7;
        } else {
          $$0 = $7;
        }
      }
    } while (0);
    return $$0 | 0;
  }
  function ___fflush_unlocked($0) {
    $0 = $0 | 0;
    var $$0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
    var $9 = 0, label = 0;
    $1 = $0 + 20 | 0;
    $2 = HEAP322[$1 >> 2] | 0;
    $3 = $0 + 28 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = $2 >>> 0 > $4 >>> 0;
    if ($5) {
      $6 = $0 + 36 | 0;
      $7 = HEAP322[$6 >> 2] | 0;
      FUNCTION_TABLE_iiii[$7 & 31]($0, 0, 0) | 0;
      $8 = HEAP322[$1 >> 2] | 0;
      $9 = ($8 | 0) == (0 | 0);
      if ($9) {
        $$0 = -1;
      } else {
        label = 3;
      }
    } else {
      label = 3;
    }
    if ((label | 0) == 3) {
      $10 = $0 + 4 | 0;
      $11 = HEAP322[$10 >> 2] | 0;
      $12 = $0 + 8 | 0;
      $13 = HEAP322[$12 >> 2] | 0;
      $14 = $11 >>> 0 < $13 >>> 0;
      if ($14) {
        $15 = $11;
        $16 = $13;
        $17 = $15 - $16 | 0;
        $18 = $0 + 40 | 0;
        $19 = HEAP322[$18 >> 2] | 0;
        FUNCTION_TABLE_iiii[$19 & 31]($0, $17, 1) | 0;
      }
      $20 = $0 + 16 | 0;
      HEAP322[$20 >> 2] = 0;
      HEAP322[$3 >> 2] = 0;
      HEAP322[$1 >> 2] = 0;
      HEAP322[$12 >> 2] = 0;
      HEAP322[$10 >> 2] = 0;
      $$0 = 0;
    }
    return $$0 | 0;
  }
  function _sscanf($0, $1, $varargs) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $varargs = $varargs | 0;
    var $2 = 0, $3 = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = sp;
    HEAP322[$2 >> 2] = $varargs;
    $3 = _vsscanf($0, $1, $2) | 0;
    STACKTOP2 = sp;
    return $3 | 0;
  }
  function _vsscanf($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, dest = 0, sp = 0, stop2 = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 128 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(128 | 0);
    $3 = sp;
    dest = $3;
    stop2 = dest + 124 | 0;
    do {
      HEAP322[dest >> 2] = 0 | 0;
      dest = dest + 4 | 0;
    } while ((dest | 0) < (stop2 | 0));
    $4 = $3 + 32 | 0;
    HEAP322[$4 >> 2] = 24;
    $5 = $3 + 44 | 0;
    HEAP322[$5 >> 2] = $0;
    $6 = $3 + 76 | 0;
    HEAP322[$6 >> 2] = -1;
    $7 = $3 + 84 | 0;
    HEAP322[$7 >> 2] = $0;
    $8 = _vfscanf($3, $1, $2) | 0;
    STACKTOP2 = sp;
    return $8 | 0;
  }
  function _do_read($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $3 = 0;
    $3 = ___string_read($0, $1, $2) | 0;
    return $3 | 0;
  }
  function _vfscanf($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$ = 0, $$$0266 = 0, $$$0268 = 0, $$$0305 = 0, $$$3 = 0, $$0266$lcssa = 0, $$0266417 = 0, $$0268 = 0, $$0272 = 0, $$0273429 = 0, $$0276$ph = 0, $$0278$ph = 0, $$0278$ph$phi = 0, $$0278$ph336 = 0, $$0283428 = 0, $$0286420 = 0, $$0288$ = 0, $$0288425 = 0, $$0292 = 0, $$0293 = 0;
    var $$0305423 = 0, $$10 = 0, $$11 = 0, $$1267 = 0, $$1271 = 0, $$1274 = 0, $$1277$ph = 0, $$1279 = 0, $$1284 = 0, $$1289 = 0, $$2 = 0, $$2275 = 0, $$2280 = 0, $$2280$ph = 0, $$2280$ph$phi = 0, $$2285 = 0, $$2290 = 0, $$2307$ph = 0, $$3$lcssa = 0, $$319 = 0;
    var $$320 = 0, $$321 = 0, $$322 = 0, $$327 = 0, $$328$le439 = 0, $$328$le441 = 0, $$3281 = 0, $$3291 = 0, $$3416 = 0, $$4282 = 0, $$4309 = 0, $$5 = 0, $$5299 = 0, $$5310 = 0, $$6 = 0, $$6311 = 0, $$7 = 0, $$7$ph = 0, $$7312 = 0, $$8 = 0;
    var $$8313 = 0, $$9 = 0, $$9314 = 0, $$9314$ph = 0, $$lcssa355 = 0, $$not = 0, $$old4 = 0, $$ph = 0, $$ph353 = 0, $$pre = 0, $$pre$phi516Z2D = 0, $$pre507 = 0, $$pre509 = 0, $$pre511 = 0, $$pre512 = 0, $$pre513 = 0, $$pre514 = 0, $$pre515 = 0, $$sink443 = 0, $$sroa$2$0$$sroa_idx13 = 0;
    var $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0;
    var $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0;
    var $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0;
    var $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0;
    var $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0;
    var $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0;
    var $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0;
    var $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0;
    var $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0;
    var $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0;
    var $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0;
    var $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
    var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
    var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
    var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
    var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $arglist_current = 0, $arglist_next = 0, $expanded = 0, $expanded1 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $factor = 0, $factor331 = 0, $isdigit = 0;
    var $isdigit316 = 0, $isdigit316415 = 0, $isdigittmp = 0, $isdigittmp315 = 0, $isdigittmp315414 = 0, $narrow = 0, $narrow469 = 0, $or$cond = 0, $or$cond3 = 0, $or$cond318 = 0, $or$cond5 = 0, $trunc = 0, label = 0, sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 288 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(288 | 0);
    $3 = sp + 8 | 0;
    $4 = sp + 17 | 0;
    $5 = sp;
    $6 = sp + 16 | 0;
    $7 = $0 + 76 | 0;
    HEAP322[$7 >> 2] | 0;
    $11 = HEAP82[$1 >> 0] | 0;
    $12 = $11 << 24 >> 24 == 0;
    L4:
      do {
        if ($12) {
          $$3291 = 0;
        } else {
          $13 = $0 + 4 | 0;
          $14 = $0 + 100 | 0;
          $15 = $0 + 108 | 0;
          $16 = $0 + 8 | 0;
          $17 = $4 + 10 | 0;
          $18 = $4 + 33 | 0;
          $$sroa$2$0$$sroa_idx13 = $3 + 4 | 0;
          $19 = $4 + 46 | 0;
          $20 = $4 + 94 | 0;
          $21 = $4 + 1 | 0;
          $22 = $4 + 1 | 0;
          $$0273429 = $1;
          $$0283428 = 0;
          $$0288425 = 0;
          $$0305423 = 0;
          $102 = 0;
          $24 = $11;
          L6:
            while (1) {
              $23 = $24 & 255;
              $25 = _isspace($23) | 0;
              $26 = ($25 | 0) == 0;
              L8:
                do {
                  if ($26) {
                    $53 = $24 << 24 >> 24 == 37;
                    L10:
                      do {
                        if ($53) {
                          $54 = $$0273429 + 1 | 0;
                          $55 = HEAP82[$54 >> 0] | 0;
                          L12:
                            do {
                              switch ($55 << 24 >> 24) {
                                case 37: {
                                  break L10;
                                }
                                case 42: {
                                  $76 = $$0273429 + 2 | 0;
                                  $$0293 = 0;
                                  $$2275 = $76;
                                  break;
                                }
                                default: {
                                  $77 = $55 & 255;
                                  $isdigittmp = $77 + -48 | 0;
                                  $isdigit = $isdigittmp >>> 0 < 10;
                                  if ($isdigit) {
                                    $78 = $$0273429 + 2 | 0;
                                    $79 = HEAP82[$78 >> 0] | 0;
                                    $80 = $79 << 24 >> 24 == 36;
                                    if ($80) {
                                      $81 = _arg_n($2, $isdigittmp) | 0;
                                      $82 = $$0273429 + 3 | 0;
                                      $$0293 = $81;
                                      $$2275 = $82;
                                      break L12;
                                    }
                                  }
                                  $arglist_current = HEAP322[$2 >> 2] | 0;
                                  $83 = $arglist_current;
                                  $84 = 0 + 4 | 0;
                                  $expanded1 = $84;
                                  $expanded = $expanded1 - 1 | 0;
                                  $85 = $83 + $expanded | 0;
                                  $86 = 0 + 4 | 0;
                                  $expanded5 = $86;
                                  $expanded4 = $expanded5 - 1 | 0;
                                  $expanded3 = $expanded4 ^ -1;
                                  $87 = $85 & $expanded3;
                                  $88 = $87;
                                  $89 = HEAP322[$88 >> 2] | 0;
                                  $arglist_next = $88 + 4 | 0;
                                  HEAP322[$2 >> 2] = $arglist_next;
                                  $$0293 = $89;
                                  $$2275 = $54;
                                }
                              }
                            } while (0);
                          $90 = HEAP82[$$2275 >> 0] | 0;
                          $91 = $90 & 255;
                          $isdigittmp315414 = $91 + -48 | 0;
                          $isdigit316415 = $isdigittmp315414 >>> 0 < 10;
                          if ($isdigit316415) {
                            $$0266417 = 0;
                            $$3416 = $$2275;
                            $95 = $91;
                            while (1) {
                              $92 = $$0266417 * 10 | 0;
                              $93 = $92 + -48 | 0;
                              $94 = $93 + $95 | 0;
                              $96 = $$3416 + 1 | 0;
                              $97 = HEAP82[$96 >> 0] | 0;
                              $98 = $97 & 255;
                              $isdigittmp315 = $98 + -48 | 0;
                              $isdigit316 = $isdigittmp315 >>> 0 < 10;
                              if ($isdigit316) {
                                $$0266417 = $94;
                                $$3416 = $96;
                                $95 = $98;
                              } else {
                                $$0266$lcssa = $94;
                                $$3$lcssa = $96;
                                $$lcssa355 = $97;
                                break;
                              }
                            }
                          } else {
                            $$0266$lcssa = 0;
                            $$3$lcssa = $$2275;
                            $$lcssa355 = $90;
                          }
                          $99 = $$lcssa355 << 24 >> 24 == 109;
                          $100 = ($$0293 | 0) != (0 | 0);
                          $101 = $$3$lcssa + 1 | 0;
                          $$$0305 = $99 ? 0 : $$0305423;
                          $$327 = $99 ? 0 : $102;
                          $$$3 = $99 ? $101 : $$3$lcssa;
                          $narrow = $100 & $99;
                          $103 = $$$3 + 1 | 0;
                          $104 = HEAP82[$$$3 >> 0] | 0;
                          switch ($104 << 24 >> 24) {
                            case 104: {
                              $105 = HEAP82[$103 >> 0] | 0;
                              $106 = $105 << 24 >> 24 == 104;
                              $107 = $$$3 + 2 | 0;
                              $$319 = $106 ? $107 : $103;
                              $$320 = $106 ? -2 : -1;
                              $$0268 = $$320;
                              $$5 = $$319;
                              break;
                            }
                            case 108: {
                              $108 = HEAP82[$103 >> 0] | 0;
                              $109 = $108 << 24 >> 24 == 108;
                              $110 = $$$3 + 2 | 0;
                              $$321 = $109 ? $110 : $103;
                              $$322 = $109 ? 3 : 1;
                              $$0268 = $$322;
                              $$5 = $$321;
                              break;
                            }
                            case 106: {
                              $$0268 = 3;
                              $$5 = $103;
                              break;
                            }
                            case 116:
                            case 122: {
                              $$0268 = 1;
                              $$5 = $103;
                              break;
                            }
                            case 76: {
                              $$0268 = 2;
                              $$5 = $103;
                              break;
                            }
                            case 110:
                            case 112:
                            case 67:
                            case 83:
                            case 91:
                            case 99:
                            case 115:
                            case 88:
                            case 71:
                            case 70:
                            case 69:
                            case 65:
                            case 103:
                            case 102:
                            case 101:
                            case 97:
                            case 120:
                            case 117:
                            case 111:
                            case 105:
                            case 100: {
                              $$0268 = 0;
                              $$5 = $$$3;
                              break;
                            }
                            default: {
                              $$7312 = $$$0305;
                              $309 = $$327;
                              $narrow469 = $narrow;
                              label = 137;
                              break L6;
                            }
                          }
                          $111 = HEAP82[$$5 >> 0] | 0;
                          $112 = $111 & 255;
                          $113 = $112 & 47;
                          $114 = ($113 | 0) == 3;
                          $115 = $112 | 32;
                          $$ = $114 ? $115 : $112;
                          $$$0268 = $114 ? 1 : $$0268;
                          $trunc = $$ & 255;
                          switch ($trunc << 24 >> 24) {
                            case 99: {
                              $116 = ($$0266$lcssa | 0) > 1;
                              $$$0266 = $116 ? $$0266$lcssa : 1;
                              $$1267 = $$$0266;
                              $$1284 = $$0283428;
                              break;
                            }
                            case 91: {
                              $$1267 = $$0266$lcssa;
                              $$1284 = $$0283428;
                              break;
                            }
                            case 110: {
                              $117 = ($$0283428 | 0) < 0;
                              $118 = $117 << 31 >> 31;
                              _store_int($$0293, $$$0268, $$0283428, $118);
                              $$11 = $$5;
                              $$1289 = $$0288425;
                              $$2285 = $$0283428;
                              $$6311 = $$$0305;
                              $307 = $$327;
                              break L8;
                            }
                            default: {
                              ___shlim($0, 0);
                              while (1) {
                                $119 = HEAP322[$13 >> 2] | 0;
                                $120 = HEAP322[$14 >> 2] | 0;
                                $121 = $119 >>> 0 < $120 >>> 0;
                                if ($121) {
                                  $122 = $119 + 1 | 0;
                                  HEAP322[$13 >> 2] = $122;
                                  $123 = HEAP82[$119 >> 0] | 0;
                                  $124 = $123 & 255;
                                  $126 = $124;
                                } else {
                                  $125 = ___shgetc($0) | 0;
                                  $126 = $125;
                                }
                                $127 = _isspace($126) | 0;
                                $128 = ($127 | 0) == 0;
                                if ($128) {
                                  break;
                                }
                              }
                              $129 = HEAP322[$14 >> 2] | 0;
                              $130 = ($129 | 0) == (0 | 0);
                              if ($130) {
                                $$pre507 = HEAP322[$13 >> 2] | 0;
                                $138 = $$pre507;
                              } else {
                                $131 = HEAP322[$13 >> 2] | 0;
                                $132 = $131 + -1 | 0;
                                HEAP322[$13 >> 2] = $132;
                                $133 = $132;
                                $138 = $133;
                              }
                              $134 = HEAP322[$15 >> 2] | 0;
                              $135 = HEAP322[$16 >> 2] | 0;
                              $136 = $134 + $$0283428 | 0;
                              $137 = $136 + $138 | 0;
                              $139 = $137 - $135 | 0;
                              $$1267 = $$0266$lcssa;
                              $$1284 = $139;
                            }
                          }
                          ___shlim($0, $$1267);
                          $140 = HEAP322[$13 >> 2] | 0;
                          $141 = HEAP322[$14 >> 2] | 0;
                          $142 = $140 >>> 0 < $141 >>> 0;
                          if ($142) {
                            $143 = $140 + 1 | 0;
                            HEAP322[$13 >> 2] = $143;
                            $147 = $141;
                          } else {
                            $144 = ___shgetc($0) | 0;
                            $145 = ($144 | 0) < 0;
                            if ($145) {
                              $$7312 = $$$0305;
                              $309 = $$327;
                              $narrow469 = $narrow;
                              label = 137;
                              break L6;
                            }
                            $$pre509 = HEAP322[$14 >> 2] | 0;
                            $147 = $$pre509;
                          }
                          $146 = ($147 | 0) == (0 | 0);
                          if (!$146) {
                            $148 = HEAP322[$13 >> 2] | 0;
                            $149 = $148 + -1 | 0;
                            HEAP322[$13 >> 2] = $149;
                          }
                          L55:
                            do {
                              switch ($trunc << 24 >> 24) {
                                case 91:
                                case 99:
                                case 115: {
                                  $150 = ($$ | 0) == 99;
                                  $151 = $$ | 16;
                                  $152 = ($151 | 0) == 115;
                                  L57:
                                    do {
                                      if ($152) {
                                        $153 = ($$ | 0) == 115;
                                        _memset($21 | 0, -1, 256) | 0;
                                        HEAP82[$4 >> 0] = 0;
                                        if ($153) {
                                          HEAP82[$18 >> 0] = 0;
                                          HEAP82[$17 >> 0] = 0 | 0;
                                          HEAP82[$17 + 1 >> 0] = 0 | 0;
                                          HEAP82[$17 + 2 >> 0] = 0 | 0;
                                          HEAP82[$17 + 3 >> 0] = 0 | 0;
                                          HEAP82[$17 + 4 >> 0] = 0 | 0;
                                          $$9 = $$5;
                                        } else {
                                          $$9 = $$5;
                                        }
                                      } else {
                                        $154 = $$5 + 1 | 0;
                                        $155 = HEAP82[$154 >> 0] | 0;
                                        $156 = $155 << 24 >> 24 == 94;
                                        $157 = $$5 + 2 | 0;
                                        $$0292 = $156 & 1;
                                        $$6 = $156 ? $157 : $154;
                                        $158 = $156 & 1;
                                        _memset($22 | 0, $158 | 0, 256) | 0;
                                        HEAP82[$4 >> 0] = 0;
                                        $159 = HEAP82[$$6 >> 0] | 0;
                                        switch ($159 << 24 >> 24) {
                                          case 45: {
                                            $$sink443 = $19;
                                            label = 64;
                                            break;
                                          }
                                          case 93: {
                                            $$sink443 = $20;
                                            label = 64;
                                            break;
                                          }
                                          default: {
                                            $$pre514 = $$0292 ^ 1;
                                            $$pre515 = $$pre514 & 255;
                                            $$7$ph = $$6;
                                            $$pre$phi516Z2D = $$pre515;
                                          }
                                        }
                                        if ((label | 0) == 64) {
                                          label = 0;
                                          $160 = $$6 + 1 | 0;
                                          $161 = $$0292 ^ 1;
                                          $162 = $161 & 255;
                                          HEAP82[$$sink443 >> 0] = $162;
                                          $$7$ph = $160;
                                          $$pre$phi516Z2D = $162;
                                        }
                                        $$7 = $$7$ph;
                                        while (1) {
                                          $163 = HEAP82[$$7 >> 0] | 0;
                                          L69:
                                            do {
                                              switch ($163 << 24 >> 24) {
                                                case 0: {
                                                  $$7312 = $$$0305;
                                                  $309 = $$327;
                                                  $narrow469 = $narrow;
                                                  label = 137;
                                                  break L6;
                                                }
                                                case 93: {
                                                  $$9 = $$7;
                                                  break L57;
                                                }
                                                case 45: {
                                                  $164 = $$7 + 1 | 0;
                                                  $165 = HEAP82[$164 >> 0] | 0;
                                                  switch ($165 << 24 >> 24) {
                                                    case 93:
                                                    case 0: {
                                                      $$8 = $$7;
                                                      $176 = 45;
                                                      break L69;
                                                    }
                                                  }
                                                  $166 = $$7 + -1 | 0;
                                                  $167 = HEAP82[$166 >> 0] | 0;
                                                  $168 = ($167 & 255) < ($165 & 255);
                                                  if ($168) {
                                                    $169 = $167 & 255;
                                                    $$0286420 = $169;
                                                    while (1) {
                                                      $170 = $$0286420 + 1 | 0;
                                                      $171 = $4 + $170 | 0;
                                                      HEAP82[$171 >> 0] = $$pre$phi516Z2D;
                                                      $172 = HEAP82[$164 >> 0] | 0;
                                                      $173 = $172 & 255;
                                                      $174 = ($170 | 0) < ($173 | 0);
                                                      if ($174) {
                                                        $$0286420 = $170;
                                                      } else {
                                                        $$8 = $164;
                                                        $176 = $172;
                                                        break;
                                                      }
                                                    }
                                                  } else {
                                                    $$8 = $164;
                                                    $176 = $165;
                                                  }
                                                  break;
                                                }
                                                default: {
                                                  $$8 = $$7;
                                                  $176 = $163;
                                                }
                                              }
                                            } while (0);
                                          $175 = $176 & 255;
                                          $177 = $175 + 1 | 0;
                                          $178 = $4 + $177 | 0;
                                          HEAP82[$178 >> 0] = $$pre$phi516Z2D;
                                          $179 = $$8 + 1 | 0;
                                          $$7 = $179;
                                        }
                                      }
                                    } while (0);
                                  $180 = $$1267 + 1 | 0;
                                  $181 = $150 ? $180 : 31;
                                  $182 = ($$$0268 | 0) == 1;
                                  L77:
                                    do {
                                      if ($182) {
                                        if ($narrow) {
                                          $183 = $181 << 2;
                                          $184 = _malloc2($183) | 0;
                                          $185 = ($184 | 0) == (0 | 0);
                                          if ($185) {
                                            $$7312 = 0;
                                            $309 = 0;
                                            $narrow469 = 1;
                                            label = 137;
                                            break L6;
                                          } else {
                                            $311 = $184;
                                          }
                                        } else {
                                          $311 = $$0293;
                                        }
                                        HEAP322[$3 >> 2] = 0;
                                        HEAP322[$$sroa$2$0$$sroa_idx13 >> 2] = 0;
                                        $$0276$ph = $181;
                                        $$0278$ph = 0;
                                        $$ph = $311;
                                        L82:
                                          while (1) {
                                            $186 = ($$ph | 0) == (0 | 0);
                                            $$0278$ph336 = $$0278$ph;
                                            while (1) {
                                              L86:
                                                while (1) {
                                                  $187 = HEAP322[$13 >> 2] | 0;
                                                  $188 = HEAP322[$14 >> 2] | 0;
                                                  $189 = $187 >>> 0 < $188 >>> 0;
                                                  if ($189) {
                                                    $190 = $187 + 1 | 0;
                                                    HEAP322[$13 >> 2] = $190;
                                                    $191 = HEAP82[$187 >> 0] | 0;
                                                    $192 = $191 & 255;
                                                    $195 = $192;
                                                  } else {
                                                    $193 = ___shgetc($0) | 0;
                                                    $195 = $193;
                                                  }
                                                  $194 = $195 + 1 | 0;
                                                  $196 = $4 + $194 | 0;
                                                  $197 = HEAP82[$196 >> 0] | 0;
                                                  $198 = $197 << 24 >> 24 == 0;
                                                  if ($198) {
                                                    break L82;
                                                  }
                                                  $199 = $195 & 255;
                                                  HEAP82[$6 >> 0] = $199;
                                                  $200 = _mbrtowc($5, $6, 1, $3) | 0;
                                                  switch ($200 | 0) {
                                                    case -1: {
                                                      $$7312 = 0;
                                                      $309 = $$ph;
                                                      $narrow469 = $narrow;
                                                      label = 137;
                                                      break L6;
                                                    }
                                                    case -2: {
                                                      break;
                                                    }
                                                    default: {
                                                      break L86;
                                                    }
                                                  }
                                                }
                                              if ($186) {
                                                $$1279 = $$0278$ph336;
                                              } else {
                                                $201 = $$ph + ($$0278$ph336 << 2) | 0;
                                                $202 = $$0278$ph336 + 1 | 0;
                                                $203 = HEAP322[$5 >> 2] | 0;
                                                HEAP322[$201 >> 2] = $203;
                                                $$1279 = $202;
                                              }
                                              $204 = ($$1279 | 0) == ($$0276$ph | 0);
                                              $or$cond = $narrow & $204;
                                              if ($or$cond) {
                                                break;
                                              } else {
                                                $$0278$ph336 = $$1279;
                                              }
                                            }
                                            $factor331 = $$0276$ph << 1;
                                            $205 = $factor331 | 1;
                                            $206 = $205 << 2;
                                            $207 = _realloc($$ph, $206) | 0;
                                            $208 = ($207 | 0) == (0 | 0);
                                            if ($208) {
                                              $$7312 = 0;
                                              $309 = $$ph;
                                              $narrow469 = 1;
                                              label = 137;
                                              break L6;
                                            } else {
                                              $$0278$ph$phi = $$0276$ph;
                                              $$0276$ph = $205;
                                              $$ph = $207;
                                              $$0278$ph = $$0278$ph$phi;
                                            }
                                          }
                                        $209 = _mbsinit($3) | 0;
                                        $210 = ($209 | 0) == 0;
                                        if ($210) {
                                          $$7312 = 0;
                                          $309 = $$ph;
                                          $narrow469 = $narrow;
                                          label = 137;
                                          break L6;
                                        } else {
                                          $$4282 = $$0278$ph336;
                                          $$4309 = 0;
                                          $$5299 = $$ph;
                                          $312 = $$ph;
                                        }
                                      } else {
                                        if ($narrow) {
                                          $211 = _malloc2($181) | 0;
                                          $212 = ($211 | 0) == (0 | 0);
                                          if ($212) {
                                            $$7312 = 0;
                                            $309 = 0;
                                            $narrow469 = 1;
                                            label = 137;
                                            break L6;
                                          } else {
                                            $$1277$ph = $181;
                                            $$2280$ph = 0;
                                            $$2307$ph = $211;
                                          }
                                          while (1) {
                                            $$2280 = $$2280$ph;
                                            while (1) {
                                              $213 = HEAP322[$13 >> 2] | 0;
                                              $214 = HEAP322[$14 >> 2] | 0;
                                              $215 = $213 >>> 0 < $214 >>> 0;
                                              if ($215) {
                                                $216 = $213 + 1 | 0;
                                                HEAP322[$13 >> 2] = $216;
                                                $217 = HEAP82[$213 >> 0] | 0;
                                                $218 = $217 & 255;
                                                $221 = $218;
                                              } else {
                                                $219 = ___shgetc($0) | 0;
                                                $221 = $219;
                                              }
                                              $220 = $221 + 1 | 0;
                                              $222 = $4 + $220 | 0;
                                              $223 = HEAP82[$222 >> 0] | 0;
                                              $224 = $223 << 24 >> 24 == 0;
                                              if ($224) {
                                                $$4282 = $$2280;
                                                $$4309 = $$2307$ph;
                                                $$5299 = 0;
                                                $312 = 0;
                                                break L77;
                                              }
                                              $225 = $221 & 255;
                                              $226 = $$2280 + 1 | 0;
                                              $227 = $$2307$ph + $$2280 | 0;
                                              HEAP82[$227 >> 0] = $225;
                                              $228 = ($226 | 0) == ($$1277$ph | 0);
                                              if ($228) {
                                                break;
                                              } else {
                                                $$2280 = $226;
                                              }
                                            }
                                            $factor = $$1277$ph << 1;
                                            $229 = $factor | 1;
                                            $230 = _realloc($$2307$ph, $229) | 0;
                                            $231 = ($230 | 0) == (0 | 0);
                                            if ($231) {
                                              $$7312 = $$2307$ph;
                                              $309 = 0;
                                              $narrow469 = 1;
                                              label = 137;
                                              break L6;
                                            } else {
                                              $$2280$ph$phi = $$1277$ph;
                                              $$1277$ph = $229;
                                              $$2307$ph = $230;
                                              $$2280$ph = $$2280$ph$phi;
                                            }
                                          }
                                        }
                                        $232 = ($$0293 | 0) == (0 | 0);
                                        if ($232) {
                                          $250 = $147;
                                          while (1) {
                                            $248 = HEAP322[$13 >> 2] | 0;
                                            $249 = $248 >>> 0 < $250 >>> 0;
                                            if ($249) {
                                              $251 = $248 + 1 | 0;
                                              HEAP322[$13 >> 2] = $251;
                                              $252 = HEAP82[$248 >> 0] | 0;
                                              $253 = $252 & 255;
                                              $256 = $253;
                                            } else {
                                              $254 = ___shgetc($0) | 0;
                                              $256 = $254;
                                            }
                                            $255 = $256 + 1 | 0;
                                            $257 = $4 + $255 | 0;
                                            $258 = HEAP82[$257 >> 0] | 0;
                                            $259 = $258 << 24 >> 24 == 0;
                                            if ($259) {
                                              $$4282 = 0;
                                              $$4309 = 0;
                                              $$5299 = 0;
                                              $312 = 0;
                                              break L77;
                                            }
                                            $$pre512 = HEAP322[$14 >> 2] | 0;
                                            $250 = $$pre512;
                                          }
                                        } else {
                                          $$3281 = 0;
                                          $235 = $147;
                                          while (1) {
                                            $233 = HEAP322[$13 >> 2] | 0;
                                            $234 = $233 >>> 0 < $235 >>> 0;
                                            if ($234) {
                                              $236 = $233 + 1 | 0;
                                              HEAP322[$13 >> 2] = $236;
                                              $237 = HEAP82[$233 >> 0] | 0;
                                              $238 = $237 & 255;
                                              $241 = $238;
                                            } else {
                                              $239 = ___shgetc($0) | 0;
                                              $241 = $239;
                                            }
                                            $240 = $241 + 1 | 0;
                                            $242 = $4 + $240 | 0;
                                            $243 = HEAP82[$242 >> 0] | 0;
                                            $244 = $243 << 24 >> 24 == 0;
                                            if ($244) {
                                              $$4282 = $$3281;
                                              $$4309 = $$0293;
                                              $$5299 = 0;
                                              $312 = 0;
                                              break L77;
                                            }
                                            $245 = $241 & 255;
                                            $246 = $$3281 + 1 | 0;
                                            $247 = $$0293 + $$3281 | 0;
                                            HEAP82[$247 >> 0] = $245;
                                            $$pre511 = HEAP322[$14 >> 2] | 0;
                                            $$3281 = $246;
                                            $235 = $$pre511;
                                          }
                                        }
                                      }
                                    } while (0);
                                  $260 = HEAP322[$14 >> 2] | 0;
                                  $261 = ($260 | 0) == (0 | 0);
                                  if ($261) {
                                    $$pre513 = HEAP322[$13 >> 2] | 0;
                                    $268 = $$pre513;
                                  } else {
                                    $262 = HEAP322[$13 >> 2] | 0;
                                    $263 = $262 + -1 | 0;
                                    HEAP322[$13 >> 2] = $263;
                                    $264 = $263;
                                    $268 = $264;
                                  }
                                  $265 = HEAP322[$15 >> 2] | 0;
                                  $266 = HEAP322[$16 >> 2] | 0;
                                  $267 = $268 - $266 | 0;
                                  $269 = $267 + $265 | 0;
                                  $270 = ($269 | 0) == 0;
                                  if ($270) {
                                    $$9314$ph = $$4309;
                                    $$ph353 = $312;
                                    label = 139;
                                    break L6;
                                  }
                                  $$not = $150 ^ 1;
                                  $271 = ($269 | 0) == ($$1267 | 0);
                                  $or$cond318 = $271 | $$not;
                                  if (!$or$cond318) {
                                    $$9314$ph = $$4309;
                                    $$ph353 = $312;
                                    label = 139;
                                    break L6;
                                  }
                                  do {
                                    if ($narrow) {
                                      if ($182) {
                                        HEAP322[$$0293 >> 2] = $$5299;
                                        break;
                                      } else {
                                        HEAP322[$$0293 >> 2] = $$4309;
                                        break;
                                      }
                                    }
                                  } while (0);
                                  if ($150) {
                                    $$10 = $$9;
                                    $$5310 = $$4309;
                                    $310 = $312;
                                  } else {
                                    $272 = ($$5299 | 0) == (0 | 0);
                                    if (!$272) {
                                      $273 = $$5299 + ($$4282 << 2) | 0;
                                      HEAP322[$273 >> 2] = 0;
                                    }
                                    $274 = ($$4309 | 0) == (0 | 0);
                                    if ($274) {
                                      $$10 = $$9;
                                      $$5310 = 0;
                                      $310 = $312;
                                      break L55;
                                    }
                                    $275 = $$4309 + $$4282 | 0;
                                    HEAP82[$275 >> 0] = 0;
                                    $$10 = $$9;
                                    $$5310 = $$4309;
                                    $310 = $312;
                                  }
                                  break;
                                }
                                case 120:
                                case 88:
                                case 112: {
                                  $$0272 = 16;
                                  label = 125;
                                  break;
                                }
                                case 111: {
                                  $$0272 = 8;
                                  label = 125;
                                  break;
                                }
                                case 117:
                                case 100: {
                                  $$0272 = 10;
                                  label = 125;
                                  break;
                                }
                                case 105: {
                                  $$0272 = 0;
                                  label = 125;
                                  break;
                                }
                                case 71:
                                case 103:
                                case 70:
                                case 102:
                                case 69:
                                case 101:
                                case 65:
                                case 97: {
                                  $285 = +___floatscan($0, $$$0268, 0);
                                  $286 = HEAP322[$15 >> 2] | 0;
                                  $287 = HEAP322[$13 >> 2] | 0;
                                  $288 = HEAP322[$16 >> 2] | 0;
                                  $289 = $288 - $287 | 0;
                                  $290 = ($286 | 0) == ($289 | 0);
                                  if ($290) {
                                    $$9314$ph = $$$0305;
                                    $$ph353 = $$327;
                                    label = 139;
                                    break L6;
                                  }
                                  $291 = ($$0293 | 0) == (0 | 0);
                                  if ($291) {
                                    $$10 = $$5;
                                    $$5310 = $$$0305;
                                    $310 = $$327;
                                  } else {
                                    switch ($$$0268 | 0) {
                                      case 0: {
                                        $292 = $285;
                                        HEAPF322[$$0293 >> 2] = $292;
                                        $$10 = $$5;
                                        $$5310 = $$$0305;
                                        $310 = $$327;
                                        break L55;
                                      }
                                      case 1: {
                                        HEAPF642[$$0293 >> 3] = $285;
                                        $$10 = $$5;
                                        $$5310 = $$$0305;
                                        $310 = $$327;
                                        break L55;
                                      }
                                      case 2: {
                                        HEAPF642[$$0293 >> 3] = $285;
                                        $$10 = $$5;
                                        $$5310 = $$$0305;
                                        $310 = $$327;
                                        break L55;
                                      }
                                      default: {
                                        $$10 = $$5;
                                        $$5310 = $$$0305;
                                        $310 = $$327;
                                        break L55;
                                      }
                                    }
                                  }
                                  break;
                                }
                                default: {
                                  $$10 = $$5;
                                  $$5310 = $$$0305;
                                  $310 = $$327;
                                }
                              }
                            } while (0);
                          do {
                            if ((label | 0) == 125) {
                              label = 0;
                              $276 = ___intscan($0, $$0272, 0, -1, -1) | 0;
                              $277 = tempRet02;
                              $278 = HEAP322[$15 >> 2] | 0;
                              $279 = HEAP322[$13 >> 2] | 0;
                              $280 = HEAP322[$16 >> 2] | 0;
                              $281 = $280 - $279 | 0;
                              $282 = ($278 | 0) == ($281 | 0);
                              if ($282) {
                                $$9314$ph = $$$0305;
                                $$ph353 = $$327;
                                label = 139;
                                break L6;
                              }
                              $283 = ($$ | 0) == 112;
                              $or$cond3 = $100 & $283;
                              if ($or$cond3) {
                                $284 = $276;
                                HEAP322[$$0293 >> 2] = $284;
                                $$10 = $$5;
                                $$5310 = $$$0305;
                                $310 = $$327;
                                break;
                              } else {
                                _store_int($$0293, $$$0268, $276, $277);
                                $$10 = $$5;
                                $$5310 = $$$0305;
                                $310 = $$327;
                                break;
                              }
                            }
                          } while (0);
                          $293 = HEAP322[$15 >> 2] | 0;
                          $294 = HEAP322[$13 >> 2] | 0;
                          $295 = HEAP322[$16 >> 2] | 0;
                          $296 = $293 + $$1284 | 0;
                          $297 = $296 + $294 | 0;
                          $298 = $297 - $295 | 0;
                          $299 = $100 & 1;
                          $$0288$ = $299 + $$0288425 | 0;
                          $$11 = $$10;
                          $$1289 = $$0288$;
                          $$2285 = $298;
                          $$6311 = $$5310;
                          $307 = $310;
                          break L8;
                        }
                      } while (0);
                    $56 = $53 & 1;
                    $57 = $$0273429 + $56 | 0;
                    ___shlim($0, 0);
                    $58 = HEAP322[$13 >> 2] | 0;
                    $59 = HEAP322[$14 >> 2] | 0;
                    $60 = $58 >>> 0 < $59 >>> 0;
                    if ($60) {
                      $61 = $58 + 1 | 0;
                      HEAP322[$13 >> 2] = $61;
                      $62 = HEAP82[$58 >> 0] | 0;
                      $63 = $62 & 255;
                      $68 = $63;
                    } else {
                      $64 = ___shgetc($0) | 0;
                      $68 = $64;
                    }
                    $65 = HEAP82[$57 >> 0] | 0;
                    $66 = $65 & 255;
                    $67 = ($68 | 0) == ($66 | 0);
                    if (!$67) {
                      label = 22;
                      break L6;
                    }
                    $75 = $$0283428 + 1 | 0;
                    $$11 = $57;
                    $$1289 = $$0288425;
                    $$2285 = $75;
                    $$6311 = $$0305423;
                    $307 = $102;
                  } else {
                    $$1274 = $$0273429;
                    while (1) {
                      $27 = $$1274 + 1 | 0;
                      $28 = HEAP82[$27 >> 0] | 0;
                      $29 = $28 & 255;
                      $30 = _isspace($29) | 0;
                      $31 = ($30 | 0) == 0;
                      if ($31) {
                        break;
                      } else {
                        $$1274 = $27;
                      }
                    }
                    ___shlim($0, 0);
                    while (1) {
                      $32 = HEAP322[$13 >> 2] | 0;
                      $33 = HEAP322[$14 >> 2] | 0;
                      $34 = $32 >>> 0 < $33 >>> 0;
                      if ($34) {
                        $35 = $32 + 1 | 0;
                        HEAP322[$13 >> 2] = $35;
                        $36 = HEAP82[$32 >> 0] | 0;
                        $37 = $36 & 255;
                        $39 = $37;
                      } else {
                        $38 = ___shgetc($0) | 0;
                        $39 = $38;
                      }
                      $40 = _isspace($39) | 0;
                      $41 = ($40 | 0) == 0;
                      if ($41) {
                        break;
                      }
                    }
                    $42 = HEAP322[$14 >> 2] | 0;
                    $43 = ($42 | 0) == (0 | 0);
                    if ($43) {
                      $$pre = HEAP322[$13 >> 2] | 0;
                      $51 = $$pre;
                    } else {
                      $44 = HEAP322[$13 >> 2] | 0;
                      $45 = $44 + -1 | 0;
                      HEAP322[$13 >> 2] = $45;
                      $46 = $45;
                      $51 = $46;
                    }
                    $47 = HEAP322[$15 >> 2] | 0;
                    $48 = HEAP322[$16 >> 2] | 0;
                    $49 = $47 + $$0283428 | 0;
                    $50 = $49 + $51 | 0;
                    $52 = $50 - $48 | 0;
                    $$11 = $$1274;
                    $$1289 = $$0288425;
                    $$2285 = $52;
                    $$6311 = $$0305423;
                    $307 = $102;
                  }
                } while (0);
              $300 = $$11 + 1 | 0;
              $301 = HEAP82[$300 >> 0] | 0;
              $302 = $301 << 24 >> 24 == 0;
              if ($302) {
                $$3291 = $$1289;
                break L4;
              } else {
                $$0273429 = $300;
                $$0283428 = $$2285;
                $$0288425 = $$1289;
                $$0305423 = $$6311;
                $102 = $307;
                $24 = $301;
              }
            }
          if ((label | 0) == 22) {
            $69 = HEAP322[$14 >> 2] | 0;
            $70 = ($69 | 0) == (0 | 0);
            if (!$70) {
              $71 = HEAP322[$13 >> 2] | 0;
              $72 = $71 + -1 | 0;
              HEAP322[$13 >> 2] = $72;
            }
            $73 = ($68 | 0) > -1;
            $74 = ($$0288425 | 0) != 0;
            $or$cond5 = $74 | $73;
            if ($or$cond5) {
              $$3291 = $$0288425;
              break;
            } else {
              $$1271 = 0;
              $$8313 = $$0305423;
              $308 = $102;
              label = 138;
            }
          } else if ((label | 0) == 137) {
            $$328$le441 = $narrow469 & 1;
            $$old4 = ($$0288425 | 0) == 0;
            if ($$old4) {
              $$1271 = $$328$le441;
              $$8313 = $$7312;
              $308 = $309;
              label = 138;
            } else {
              $$2 = $$328$le441;
              $$2290 = $$0288425;
              $$9314 = $$7312;
              $304 = $309;
            }
          } else if ((label | 0) == 139) {
            $$328$le439 = $narrow & 1;
            $$2 = $$328$le439;
            $$2290 = $$0288425;
            $$9314 = $$9314$ph;
            $304 = $$ph353;
          }
          if ((label | 0) == 138) {
            $$2 = $$1271;
            $$2290 = -1;
            $$9314 = $$8313;
            $304 = $308;
          }
          $303 = ($$2 | 0) == 0;
          if ($303) {
            $$3291 = $$2290;
          } else {
            _free2($$9314);
            _free2($304);
            $$3291 = $$2290;
          }
        }
      } while (0);
    STACKTOP2 = sp;
    return $$3291 | 0;
  }
  function _arg_n($0, $1) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $arglist_current = 0, $arglist_next = 0, $expanded = 0, $expanded1 = 0, $expanded3 = 0, $expanded4 = 0, $expanded5 = 0, $vacopy_currentptr = 0;
    var sp = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(16 | 0);
    $2 = sp;
    $vacopy_currentptr = HEAP322[$0 >> 2] | 0;
    HEAP322[$2 >> 2] = $vacopy_currentptr;
    $$0 = $1;
    while (1) {
      $3 = $$0 >>> 0 > 1;
      $arglist_current = HEAP322[$2 >> 2] | 0;
      $4 = $arglist_current;
      $5 = 0 + 4 | 0;
      $expanded1 = $5;
      $expanded = $expanded1 - 1 | 0;
      $6 = $4 + $expanded | 0;
      $7 = 0 + 4 | 0;
      $expanded5 = $7;
      $expanded4 = $expanded5 - 1 | 0;
      $expanded3 = $expanded4 ^ -1;
      $8 = $6 & $expanded3;
      $9 = $8;
      $10 = HEAP322[$9 >> 2] | 0;
      $arglist_next = $9 + 4 | 0;
      HEAP322[$2 >> 2] = $arglist_next;
      $11 = $$0 + -1 | 0;
      if ($3) {
        $$0 = $11;
      } else {
        break;
      }
    }
    STACKTOP2 = sp;
    return $10 | 0;
  }
  function _store_int($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = ($0 | 0) == (0 | 0);
    L1:
      do {
        if (!$4) {
          switch ($1 | 0) {
            case -2: {
              $5 = $2 & 255;
              HEAP82[$0 >> 0] = $5;
              break L1;
            }
            case -1: {
              $6 = $2 & 65535;
              HEAP162[$0 >> 1] = $6;
              break L1;
            }
            case 0: {
              HEAP322[$0 >> 2] = $2;
              break L1;
            }
            case 1: {
              HEAP322[$0 >> 2] = $2;
              break L1;
            }
            case 3: {
              $7 = $0;
              $8 = $7;
              HEAP322[$8 >> 2] = $2;
              $9 = $7 + 4 | 0;
              $10 = $9;
              HEAP322[$10 >> 2] = $3;
              break L1;
            }
            default: {
              break L1;
            }
          }
        }
      } while (0);
    return;
  }
  function _mbsinit($0) {
    $0 = $0 | 0;
    var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0;
    $1 = ($0 | 0) == (0 | 0);
    if ($1) {
      $5 = 1;
    } else {
      $2 = HEAP322[$0 >> 2] | 0;
      $3 = ($2 | 0) == 0;
      $5 = $3;
    }
    $4 = $5 & 1;
    return $4 | 0;
  }
  function ___string_read($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$027 = 0, $$027$ = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $3 = $0 + 84 | 0;
    $4 = HEAP322[$3 >> 2] | 0;
    $5 = $2 + 256 | 0;
    $6 = _memchr($4, 0, $5) | 0;
    $7 = ($6 | 0) == (0 | 0);
    $8 = $6;
    $9 = $4;
    $10 = $8 - $9 | 0;
    $$027 = $7 ? $5 : $10;
    $11 = $$027 >>> 0 < $2 >>> 0;
    $$027$ = $11 ? $$027 : $2;
    _memcpy($1 | 0, $4 | 0, $$027$ | 0) | 0;
    $12 = $4 + $$027$ | 0;
    $13 = $0 + 4 | 0;
    HEAP322[$13 >> 2] = $12;
    $14 = $4 + $$027 | 0;
    $15 = $0 + 8 | 0;
    HEAP322[$15 >> 2] = $14;
    HEAP322[$3 >> 2] = $14;
    return $$027$ | 0;
  }
  function __ZN10__cxxabiv116__shim_type_infoD2Ev($0) {
    return;
  }
  function __ZN10__cxxabiv117__class_type_infoD0Ev($0) {
    $0 = $0 | 0;
    __ZdlPv($0);
    return;
  }
  function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($0) {
    return;
  }
  function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($0) {
    return;
  }
  function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    var $$0 = 0, $$2 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    var dest = 0, sp = 0, stop2 = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 64 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(64 | 0);
    $3 = sp;
    $4 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $1) | 0;
    if ($4) {
      $$2 = 1;
    } else {
      $5 = ($1 | 0) == (0 | 0);
      if ($5) {
        $$2 = 0;
      } else {
        $6 = ___dynamic_cast($1, 208, 192, 0) | 0;
        $7 = ($6 | 0) == (0 | 0);
        if ($7) {
          $$2 = 0;
        } else {
          $8 = $3 + 4 | 0;
          dest = $8;
          stop2 = dest + 52 | 0;
          do {
            HEAP322[dest >> 2] = 0 | 0;
            dest = dest + 4 | 0;
          } while ((dest | 0) < (stop2 | 0));
          HEAP322[$3 >> 2] = $6;
          $9 = $3 + 8 | 0;
          HEAP322[$9 >> 2] = $0;
          $10 = $3 + 12 | 0;
          HEAP322[$10 >> 2] = -1;
          $11 = $3 + 48 | 0;
          HEAP322[$11 >> 2] = 1;
          $12 = HEAP322[$6 >> 2] | 0;
          $13 = $12 + 28 | 0;
          $14 = HEAP322[$13 >> 2] | 0;
          $15 = HEAP322[$2 >> 2] | 0;
          FUNCTION_TABLE_viiii[$14 & 31]($6, $3, $15, 1);
          $16 = $3 + 24 | 0;
          $17 = HEAP322[$16 >> 2] | 0;
          $18 = ($17 | 0) == 1;
          if ($18) {
            $19 = $3 + 16 | 0;
            $20 = HEAP322[$19 >> 2] | 0;
            HEAP322[$2 >> 2] = $20;
            $$0 = 1;
          } else {
            $$0 = 0;
          }
          $$2 = $$0;
        }
      }
    }
    STACKTOP2 = sp;
    return $$2 | 0;
  }
  function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $6 = 0, $7 = 0, $8 = 0;
    $6 = $1 + 8 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $7) | 0;
    if ($8) {
      __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0, $1, $2, $3, $4);
    }
    return;
  }
  function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $5 = 0;
    var $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $5 = $1 + 8 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $6) | 0;
    do {
      if ($7) {
        __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi(0, $1, $2, $3);
      } else {
        $8 = HEAP322[$1 >> 2] | 0;
        $9 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $8) | 0;
        if ($9) {
          $10 = $1 + 16 | 0;
          $11 = HEAP322[$10 >> 2] | 0;
          $12 = ($11 | 0) == ($2 | 0);
          $13 = $1 + 32 | 0;
          if (!$12) {
            $14 = $1 + 20 | 0;
            $15 = HEAP322[$14 >> 2] | 0;
            $16 = ($15 | 0) == ($2 | 0);
            if (!$16) {
              HEAP322[$13 >> 2] = $3;
              HEAP322[$14 >> 2] = $2;
              $18 = $1 + 40 | 0;
              $19 = HEAP322[$18 >> 2] | 0;
              $20 = $19 + 1 | 0;
              HEAP322[$18 >> 2] = $20;
              $21 = $1 + 36 | 0;
              $22 = HEAP322[$21 >> 2] | 0;
              $23 = ($22 | 0) == 1;
              if ($23) {
                $24 = $1 + 24 | 0;
                $25 = HEAP322[$24 >> 2] | 0;
                $26 = ($25 | 0) == 2;
                if ($26) {
                  $27 = $1 + 54 | 0;
                  HEAP82[$27 >> 0] = 1;
                }
              }
              $28 = $1 + 44 | 0;
              HEAP322[$28 >> 2] = 4;
              break;
            }
          }
          $17 = ($3 | 0) == 1;
          if ($17) {
            HEAP322[$13 >> 2] = 1;
          }
        }
      }
    } while (0);
    return;
  }
  function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $4 = 0, $5 = 0, $6 = 0;
    $4 = $1 + 8 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $5) | 0;
    if ($6) {
      __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0, $1, $2, $3);
    }
    return;
  }
  function __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $3 = 0;
    $3 = ($0 | 0) == ($1 | 0);
    return $3 | 0;
  }
  function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = $1 + 16 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = ($5 | 0) == (0 | 0);
    $7 = $1 + 36 | 0;
    $8 = $1 + 24 | 0;
    do {
      if ($6) {
        HEAP322[$4 >> 2] = $2;
        HEAP322[$8 >> 2] = $3;
        HEAP322[$7 >> 2] = 1;
      } else {
        $9 = ($5 | 0) == ($2 | 0);
        if (!$9) {
          $12 = HEAP322[$7 >> 2] | 0;
          $13 = $12 + 1 | 0;
          HEAP322[$7 >> 2] = $13;
          HEAP322[$8 >> 2] = 2;
          $14 = $1 + 54 | 0;
          HEAP82[$14 >> 0] = 1;
          break;
        }
        $10 = HEAP322[$8 >> 2] | 0;
        $11 = ($10 | 0) == 2;
        if ($11) {
          HEAP322[$8 >> 2] = $3;
        }
      }
    } while (0);
    return;
  }
  function __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($0, $1, $2, $3) {
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = $1 + 4 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = ($5 | 0) == ($2 | 0);
    if ($6) {
      $7 = $1 + 28 | 0;
      $8 = HEAP322[$7 >> 2] | 0;
      $9 = ($8 | 0) == 1;
      if (!$9) {
        HEAP322[$7 >> 2] = $3;
      }
    }
    return;
  }
  function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($0, $1, $2, $3, $4) {
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $5 = 0;
    var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond22 = 0;
    $5 = $1 + 53 | 0;
    HEAP82[$5 >> 0] = 1;
    $6 = $1 + 4 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = ($7 | 0) == ($3 | 0);
    do {
      if ($8) {
        $9 = $1 + 52 | 0;
        HEAP82[$9 >> 0] = 1;
        $10 = $1 + 16 | 0;
        $11 = HEAP322[$10 >> 2] | 0;
        $12 = ($11 | 0) == (0 | 0);
        $13 = $1 + 54 | 0;
        $14 = $1 + 48 | 0;
        $15 = $1 + 24 | 0;
        $16 = $1 + 36 | 0;
        if ($12) {
          HEAP322[$10 >> 2] = $2;
          HEAP322[$15 >> 2] = $4;
          HEAP322[$16 >> 2] = 1;
          $17 = HEAP322[$14 >> 2] | 0;
          $18 = ($17 | 0) == 1;
          $19 = ($4 | 0) == 1;
          $or$cond = $18 & $19;
          if (!$or$cond) {
            break;
          }
          HEAP82[$13 >> 0] = 1;
          break;
        }
        $20 = ($11 | 0) == ($2 | 0);
        if (!$20) {
          $27 = HEAP322[$16 >> 2] | 0;
          $28 = $27 + 1 | 0;
          HEAP322[$16 >> 2] = $28;
          HEAP82[$13 >> 0] = 1;
          break;
        }
        $21 = HEAP322[$15 >> 2] | 0;
        $22 = ($21 | 0) == 2;
        if ($22) {
          HEAP322[$15 >> 2] = $4;
          $26 = $4;
        } else {
          $26 = $21;
        }
        $23 = HEAP322[$14 >> 2] | 0;
        $24 = ($23 | 0) == 1;
        $25 = ($26 | 0) == 1;
        $or$cond22 = $24 & $25;
        if ($or$cond22) {
          HEAP82[$13 >> 0] = 1;
        }
      }
    } while (0);
    return;
  }
  function ___dynamic_cast($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$ = 0, $$0 = 0, $$33 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
    var $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
    var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond28 = 0, $or$cond30 = 0, $or$cond32 = 0, dest = 0, sp = 0, stop2 = 0;
    sp = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 64 | 0;
    if ((STACKTOP2 | 0) >= (STACK_MAX2 | 0))
      abortStackOverflow2(64 | 0);
    $4 = sp;
    $5 = HEAP322[$0 >> 2] | 0;
    $6 = $5 + -8 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = $0 + $7 | 0;
    $9 = $5 + -4 | 0;
    $10 = HEAP322[$9 >> 2] | 0;
    HEAP322[$4 >> 2] = $2;
    $11 = $4 + 4 | 0;
    HEAP322[$11 >> 2] = $0;
    $12 = $4 + 8 | 0;
    HEAP322[$12 >> 2] = $1;
    $13 = $4 + 12 | 0;
    HEAP322[$13 >> 2] = $3;
    $14 = $4 + 16 | 0;
    $15 = $4 + 20 | 0;
    $16 = $4 + 24 | 0;
    $17 = $4 + 28 | 0;
    $18 = $4 + 32 | 0;
    $19 = $4 + 40 | 0;
    dest = $14;
    stop2 = dest + 36 | 0;
    do {
      HEAP322[dest >> 2] = 0 | 0;
      dest = dest + 4 | 0;
    } while ((dest | 0) < (stop2 | 0));
    HEAP162[$14 + 36 >> 1] = 0 | 0;
    HEAP82[$14 + 38 >> 0] = 0 | 0;
    $20 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($10, $2) | 0;
    L1:
      do {
        if ($20) {
          $21 = $4 + 48 | 0;
          HEAP322[$21 >> 2] = 1;
          $22 = HEAP322[$10 >> 2] | 0;
          $23 = $22 + 20 | 0;
          $24 = HEAP322[$23 >> 2] | 0;
          FUNCTION_TABLE_viiiiii[$24 & 31]($10, $4, $8, $8, 1, 0);
          $25 = HEAP322[$16 >> 2] | 0;
          $26 = ($25 | 0) == 1;
          $$ = $26 ? $8 : 0;
          $$0 = $$;
        } else {
          $27 = $4 + 36 | 0;
          $28 = HEAP322[$10 >> 2] | 0;
          $29 = $28 + 24 | 0;
          $30 = HEAP322[$29 >> 2] | 0;
          FUNCTION_TABLE_viiiii[$30 & 31]($10, $4, $8, 1, 0);
          $31 = HEAP322[$27 >> 2] | 0;
          switch ($31 | 0) {
            case 0: {
              $32 = HEAP322[$19 >> 2] | 0;
              $33 = ($32 | 0) == 1;
              $34 = HEAP322[$17 >> 2] | 0;
              $35 = ($34 | 0) == 1;
              $or$cond = $33 & $35;
              $36 = HEAP322[$18 >> 2] | 0;
              $37 = ($36 | 0) == 1;
              $or$cond28 = $or$cond & $37;
              $38 = HEAP322[$15 >> 2] | 0;
              $$33 = $or$cond28 ? $38 : 0;
              $$0 = $$33;
              break L1;
            }
            case 1: {
              break;
            }
            default: {
              $$0 = 0;
              break L1;
            }
          }
          $39 = HEAP322[$16 >> 2] | 0;
          $40 = ($39 | 0) == 1;
          if (!$40) {
            $41 = HEAP322[$19 >> 2] | 0;
            $42 = ($41 | 0) == 0;
            $43 = HEAP322[$17 >> 2] | 0;
            $44 = ($43 | 0) == 1;
            $or$cond30 = $42 & $44;
            $45 = HEAP322[$18 >> 2] | 0;
            $46 = ($45 | 0) == 1;
            $or$cond32 = $or$cond30 & $46;
            if (!$or$cond32) {
              $$0 = 0;
              break;
            }
          }
          $47 = HEAP322[$14 >> 2] | 0;
          $$0 = $47;
        }
      } while (0);
    STACKTOP2 = sp;
    return $$0 | 0;
  }
  function __ZN10__cxxabiv120__si_class_type_infoD0Ev($0) {
    $0 = $0 | 0;
    __ZdlPv($0);
    return;
  }
  function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    $5 = $5 | 0;
    var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $6 = $1 + 8 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $7) | 0;
    if ($8) {
      __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0, $1, $2, $3, $4);
    } else {
      $9 = $0 + 8 | 0;
      $10 = HEAP322[$9 >> 2] | 0;
      $11 = HEAP322[$10 >> 2] | 0;
      $12 = $11 + 20 | 0;
      $13 = HEAP322[$12 >> 2] | 0;
      FUNCTION_TABLE_viiiiii[$13 & 31]($10, $1, $2, $3, $4, $5);
    }
    return;
  }
  function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$037$off038 = 0, $$037$off039 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
    var $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $5 = 0, $6 = 0, $7 = 0;
    var $8 = 0, $9 = 0, $not$ = 0, label = 0;
    $5 = $1 + 8 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $6) | 0;
    do {
      if ($7) {
        __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi(0, $1, $2, $3);
      } else {
        $8 = HEAP322[$1 >> 2] | 0;
        $9 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $8) | 0;
        $10 = $0 + 8 | 0;
        if (!$9) {
          $41 = HEAP322[$10 >> 2] | 0;
          $42 = HEAP322[$41 >> 2] | 0;
          $43 = $42 + 24 | 0;
          $44 = HEAP322[$43 >> 2] | 0;
          FUNCTION_TABLE_viiiii[$44 & 31]($41, $1, $2, $3, $4);
          break;
        }
        $11 = $1 + 16 | 0;
        $12 = HEAP322[$11 >> 2] | 0;
        $13 = ($12 | 0) == ($2 | 0);
        $14 = $1 + 32 | 0;
        if (!$13) {
          $15 = $1 + 20 | 0;
          $16 = HEAP322[$15 >> 2] | 0;
          $17 = ($16 | 0) == ($2 | 0);
          if (!$17) {
            HEAP322[$14 >> 2] = $3;
            $19 = $1 + 44 | 0;
            $20 = HEAP322[$19 >> 2] | 0;
            $21 = ($20 | 0) == 4;
            if ($21) {
              break;
            }
            $22 = $1 + 52 | 0;
            HEAP82[$22 >> 0] = 0;
            $23 = $1 + 53 | 0;
            HEAP82[$23 >> 0] = 0;
            $24 = HEAP322[$10 >> 2] | 0;
            $25 = HEAP322[$24 >> 2] | 0;
            $26 = $25 + 20 | 0;
            $27 = HEAP322[$26 >> 2] | 0;
            FUNCTION_TABLE_viiiiii[$27 & 31]($24, $1, $2, $2, 1, $4);
            $28 = HEAP82[$23 >> 0] | 0;
            $29 = $28 << 24 >> 24 == 0;
            if ($29) {
              $$037$off038 = 4;
              label = 11;
            } else {
              $30 = HEAP82[$22 >> 0] | 0;
              $not$ = $30 << 24 >> 24 == 0;
              if ($not$) {
                $$037$off038 = 3;
                label = 11;
              } else {
                $$037$off039 = 3;
              }
            }
            if ((label | 0) == 11) {
              HEAP322[$15 >> 2] = $2;
              $31 = $1 + 40 | 0;
              $32 = HEAP322[$31 >> 2] | 0;
              $33 = $32 + 1 | 0;
              HEAP322[$31 >> 2] = $33;
              $34 = $1 + 36 | 0;
              $35 = HEAP322[$34 >> 2] | 0;
              $36 = ($35 | 0) == 1;
              if ($36) {
                $37 = $1 + 24 | 0;
                $38 = HEAP322[$37 >> 2] | 0;
                $39 = ($38 | 0) == 2;
                if ($39) {
                  $40 = $1 + 54 | 0;
                  HEAP82[$40 >> 0] = 1;
                  $$037$off039 = $$037$off038;
                } else {
                  $$037$off039 = $$037$off038;
                }
              } else {
                $$037$off039 = $$037$off038;
              }
            }
            HEAP322[$19 >> 2] = $$037$off039;
            break;
          }
        }
        $18 = ($3 | 0) == 1;
        if ($18) {
          HEAP322[$14 >> 2] = 1;
        }
      }
    } while (0);
    return;
  }
  function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $10 = 0, $11 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = $1 + 8 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $5) | 0;
    if ($6) {
      __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0, $1, $2, $3);
    } else {
      $7 = $0 + 8 | 0;
      $8 = HEAP322[$7 >> 2] | 0;
      $9 = HEAP322[$8 >> 2] | 0;
      $10 = $9 + 28 | 0;
      $11 = HEAP322[$10 >> 2] | 0;
      FUNCTION_TABLE_viiii[$11 & 31]($8, $1, $2, $3);
    }
    return;
  }
  function __ZdlPv($0) {
    $0 = $0 | 0;
    _free2($0);
    return;
  }
  function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($0) {
    $0 = $0 | 0;
    __ZdlPv($0);
    return;
  }
  function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($0, $1, $2) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    var $3 = 0;
    $3 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $1) | 0;
    return $3 | 0;
  }
  function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($0) {
    $0 = $0 | 0;
    __ZdlPv($0);
    return;
  }
  function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    $5 = $5 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
    var $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $6 = $1 + 8 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $7) | 0;
    if ($8) {
      __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0, $1, $2, $3, $4);
    } else {
      $9 = $1 + 52 | 0;
      $10 = HEAP82[$9 >> 0] | 0;
      $11 = $1 + 53 | 0;
      $12 = HEAP82[$11 >> 0] | 0;
      $13 = $0 + 16 | 0;
      $14 = $0 + 12 | 0;
      $15 = HEAP322[$14 >> 2] | 0;
      $16 = ($0 + 16 | 0) + ($15 << 3) | 0;
      HEAP82[$9 >> 0] = 0;
      HEAP82[$11 >> 0] = 0;
      __ZNK10__cxxabiv122__base_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($13, $1, $2, $3, $4, $5);
      $17 = ($15 | 0) > 1;
      L4:
        do {
          if ($17) {
            $18 = $0 + 24 | 0;
            $19 = $1 + 24 | 0;
            $20 = $1 + 54 | 0;
            $21 = $0 + 8 | 0;
            $$0 = $18;
            while (1) {
              $22 = HEAP82[$20 >> 0] | 0;
              $23 = $22 << 24 >> 24 == 0;
              if (!$23) {
                break L4;
              }
              $24 = HEAP82[$9 >> 0] | 0;
              $25 = $24 << 24 >> 24 == 0;
              if ($25) {
                $31 = HEAP82[$11 >> 0] | 0;
                $32 = $31 << 24 >> 24 == 0;
                if (!$32) {
                  $33 = HEAP322[$21 >> 2] | 0;
                  $34 = $33 & 1;
                  $35 = ($34 | 0) == 0;
                  if ($35) {
                    break L4;
                  }
                }
              } else {
                $26 = HEAP322[$19 >> 2] | 0;
                $27 = ($26 | 0) == 1;
                if ($27) {
                  break L4;
                }
                $28 = HEAP322[$21 >> 2] | 0;
                $29 = $28 & 2;
                $30 = ($29 | 0) == 0;
                if ($30) {
                  break L4;
                }
              }
              HEAP82[$9 >> 0] = 0;
              HEAP82[$11 >> 0] = 0;
              __ZNK10__cxxabiv122__base_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($$0, $1, $2, $3, $4, $5);
              $36 = $$0 + 8 | 0;
              $37 = $36 >>> 0 < $16 >>> 0;
              if ($37) {
                $$0 = $36;
              } else {
                break;
              }
            }
          }
        } while (0);
      HEAP82[$9 >> 0] = $10;
      HEAP82[$11 >> 0] = $12;
    }
    return;
  }
  function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$0 = 0, $$081$off0 = 0, $$084 = 0, $$085$off0 = 0, $$1 = 0, $$182$off0 = 0, $$186$off0 = 0, $$2 = 0, $$283$off0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0;
    var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0;
    var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
    var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
    var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $9 = 0, label = 0;
    $5 = $1 + 8 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $6) | 0;
    L1:
      do {
        if ($7) {
          __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi(0, $1, $2, $3);
        } else {
          $8 = HEAP322[$1 >> 2] | 0;
          $9 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $8) | 0;
          $10 = $0 + 12 | 0;
          $11 = $1 + 24 | 0;
          $12 = $1 + 36 | 0;
          $13 = $1 + 54 | 0;
          $14 = $0 + 8 | 0;
          $15 = $0 + 16 | 0;
          if (!$9) {
            $55 = HEAP322[$10 >> 2] | 0;
            $56 = ($0 + 16 | 0) + ($55 << 3) | 0;
            __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($15, $1, $2, $3, $4);
            $57 = $0 + 24 | 0;
            $58 = ($55 | 0) > 1;
            if (!$58) {
              break;
            }
            $59 = HEAP322[$14 >> 2] | 0;
            $60 = $59 & 2;
            $61 = ($60 | 0) == 0;
            if ($61) {
              $62 = HEAP322[$12 >> 2] | 0;
              $63 = ($62 | 0) == 1;
              if ($63) {
                $$0 = $57;
              } else {
                $68 = $59 & 1;
                $69 = ($68 | 0) == 0;
                if ($69) {
                  $$2 = $57;
                  while (1) {
                    $78 = HEAP82[$13 >> 0] | 0;
                    $79 = $78 << 24 >> 24 == 0;
                    if (!$79) {
                      break L1;
                    }
                    $80 = HEAP322[$12 >> 2] | 0;
                    $81 = ($80 | 0) == 1;
                    if ($81) {
                      break L1;
                    }
                    __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($$2, $1, $2, $3, $4);
                    $82 = $$2 + 8 | 0;
                    $83 = $82 >>> 0 < $56 >>> 0;
                    if ($83) {
                      $$2 = $82;
                    } else {
                      break L1;
                    }
                  }
                } else {
                  $$1 = $57;
                }
                while (1) {
                  $70 = HEAP82[$13 >> 0] | 0;
                  $71 = $70 << 24 >> 24 == 0;
                  if (!$71) {
                    break L1;
                  }
                  $72 = HEAP322[$12 >> 2] | 0;
                  $73 = ($72 | 0) == 1;
                  if ($73) {
                    $74 = HEAP322[$11 >> 2] | 0;
                    $75 = ($74 | 0) == 1;
                    if ($75) {
                      break L1;
                    }
                  }
                  __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($$1, $1, $2, $3, $4);
                  $76 = $$1 + 8 | 0;
                  $77 = $76 >>> 0 < $56 >>> 0;
                  if ($77) {
                    $$1 = $76;
                  } else {
                    break L1;
                  }
                }
              }
            } else {
              $$0 = $57;
            }
            while (1) {
              $64 = HEAP82[$13 >> 0] | 0;
              $65 = $64 << 24 >> 24 == 0;
              if (!$65) {
                break L1;
              }
              __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($$0, $1, $2, $3, $4);
              $66 = $$0 + 8 | 0;
              $67 = $66 >>> 0 < $56 >>> 0;
              if ($67) {
                $$0 = $66;
              } else {
                break L1;
              }
            }
          }
          $16 = $1 + 16 | 0;
          $17 = HEAP322[$16 >> 2] | 0;
          $18 = ($17 | 0) == ($2 | 0);
          $19 = $1 + 32 | 0;
          if (!$18) {
            $20 = $1 + 20 | 0;
            $21 = HEAP322[$20 >> 2] | 0;
            $22 = ($21 | 0) == ($2 | 0);
            if (!$22) {
              HEAP322[$19 >> 2] = $3;
              $24 = $1 + 44 | 0;
              $25 = HEAP322[$24 >> 2] | 0;
              $26 = ($25 | 0) == 4;
              if ($26) {
                break;
              }
              $27 = HEAP322[$10 >> 2] | 0;
              $28 = ($0 + 16 | 0) + ($27 << 3) | 0;
              $29 = $1 + 52 | 0;
              $30 = $1 + 53 | 0;
              $$081$off0 = 0;
              $$084 = $15;
              $$085$off0 = 0;
              L29:
                while (1) {
                  $31 = $$084 >>> 0 < $28 >>> 0;
                  if (!$31) {
                    $$283$off0 = $$081$off0;
                    label = 18;
                    break;
                  }
                  HEAP82[$29 >> 0] = 0;
                  HEAP82[$30 >> 0] = 0;
                  __ZNK10__cxxabiv122__base_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($$084, $1, $2, $2, 1, $4);
                  $32 = HEAP82[$13 >> 0] | 0;
                  $33 = $32 << 24 >> 24 == 0;
                  if (!$33) {
                    $$283$off0 = $$081$off0;
                    label = 18;
                    break;
                  }
                  $34 = HEAP82[$30 >> 0] | 0;
                  $35 = $34 << 24 >> 24 == 0;
                  do {
                    if ($35) {
                      $$182$off0 = $$081$off0;
                      $$186$off0 = $$085$off0;
                    } else {
                      $36 = HEAP82[$29 >> 0] | 0;
                      $37 = $36 << 24 >> 24 == 0;
                      if ($37) {
                        $43 = HEAP322[$14 >> 2] | 0;
                        $44 = $43 & 1;
                        $45 = ($44 | 0) == 0;
                        if ($45) {
                          $$283$off0 = 1;
                          label = 18;
                          break L29;
                        } else {
                          $$182$off0 = 1;
                          $$186$off0 = $$085$off0;
                          break;
                        }
                      }
                      $38 = HEAP322[$11 >> 2] | 0;
                      $39 = ($38 | 0) == 1;
                      if ($39) {
                        label = 23;
                        break L29;
                      }
                      $40 = HEAP322[$14 >> 2] | 0;
                      $41 = $40 & 2;
                      $42 = ($41 | 0) == 0;
                      if ($42) {
                        label = 23;
                        break L29;
                      } else {
                        $$182$off0 = 1;
                        $$186$off0 = 1;
                      }
                    }
                  } while (0);
                  $46 = $$084 + 8 | 0;
                  $$081$off0 = $$182$off0;
                  $$084 = $46;
                  $$085$off0 = $$186$off0;
                }
              do {
                if ((label | 0) == 18) {
                  if (!$$085$off0) {
                    HEAP322[$20 >> 2] = $2;
                    $47 = $1 + 40 | 0;
                    $48 = HEAP322[$47 >> 2] | 0;
                    $49 = $48 + 1 | 0;
                    HEAP322[$47 >> 2] = $49;
                    $50 = HEAP322[$12 >> 2] | 0;
                    $51 = ($50 | 0) == 1;
                    if ($51) {
                      $52 = HEAP322[$11 >> 2] | 0;
                      $53 = ($52 | 0) == 2;
                      if ($53) {
                        HEAP82[$13 >> 0] = 1;
                        if ($$283$off0) {
                          label = 23;
                          break;
                        } else {
                          $54 = 4;
                          break;
                        }
                      }
                    }
                  }
                  if ($$283$off0) {
                    label = 23;
                  } else {
                    $54 = 4;
                  }
                }
              } while (0);
              if ((label | 0) == 23) {
                $54 = 3;
              }
              HEAP322[$24 >> 2] = $54;
              break;
            }
          }
          $23 = ($3 | 0) == 1;
          if ($23) {
            HEAP322[$19 >> 2] = 1;
          }
        }
      } while (0);
    return;
  }
  function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = $1 + 8 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $5) | 0;
    L1:
      do {
        if ($6) {
          __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0, $1, $2, $3);
        } else {
          $7 = $0 + 16 | 0;
          $8 = $0 + 12 | 0;
          $9 = HEAP322[$8 >> 2] | 0;
          $10 = ($0 + 16 | 0) + ($9 << 3) | 0;
          __ZNK10__cxxabiv122__base_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($7, $1, $2, $3);
          $11 = ($9 | 0) > 1;
          if ($11) {
            $12 = $0 + 24 | 0;
            $13 = $1 + 54 | 0;
            $$0 = $12;
            while (1) {
              __ZNK10__cxxabiv122__base_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($$0, $1, $2, $3);
              $14 = HEAP82[$13 >> 0] | 0;
              $15 = $14 << 24 >> 24 == 0;
              if (!$15) {
                break L1;
              }
              $16 = $$0 + 8 | 0;
              $17 = $16 >>> 0 < $10 >>> 0;
              if ($17) {
                $$0 = $16;
              } else {
                break;
              }
            }
          }
        }
      } while (0);
    return;
  }
  function __ZNK10__cxxabiv122__base_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $4 = $0 + 4 | 0;
    $5 = HEAP322[$4 >> 2] | 0;
    $6 = $5 >> 8;
    $7 = $5 & 1;
    $8 = ($7 | 0) == 0;
    if ($8) {
      $$0 = $6;
    } else {
      $9 = HEAP322[$2 >> 2] | 0;
      $10 = $9 + $6 | 0;
      $11 = HEAP322[$10 >> 2] | 0;
      $$0 = $11;
    }
    $12 = HEAP322[$0 >> 2] | 0;
    $13 = HEAP322[$12 >> 2] | 0;
    $14 = $13 + 28 | 0;
    $15 = HEAP322[$14 >> 2] | 0;
    $16 = $2 + $$0 | 0;
    $17 = $5 & 2;
    $18 = ($17 | 0) != 0;
    $19 = $18 ? $3 : 2;
    FUNCTION_TABLE_viiii[$15 & 31]($12, $1, $16, $19);
    return;
  }
  function __ZNK10__cxxabiv122__base_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    $5 = $5 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $6 = $0 + 4 | 0;
    $7 = HEAP322[$6 >> 2] | 0;
    $8 = $7 >> 8;
    $9 = $7 & 1;
    $10 = ($9 | 0) == 0;
    if ($10) {
      $$0 = $8;
    } else {
      $11 = HEAP322[$3 >> 2] | 0;
      $12 = $11 + $8 | 0;
      $13 = HEAP322[$12 >> 2] | 0;
      $$0 = $13;
    }
    $14 = HEAP322[$0 >> 2] | 0;
    $15 = HEAP322[$14 >> 2] | 0;
    $16 = $15 + 20 | 0;
    $17 = HEAP322[$16 >> 2] | 0;
    $18 = $3 + $$0 | 0;
    $19 = $7 & 2;
    $20 = ($19 | 0) != 0;
    $21 = $20 ? $4 : 2;
    FUNCTION_TABLE_viiiiii[$17 & 31]($14, $1, $2, $18, $21, $5);
    return;
  }
  function __ZNK10__cxxabiv122__base_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
    $0 = $0 | 0;
    $1 = $1 | 0;
    $2 = $2 | 0;
    $3 = $3 | 0;
    $4 = $4 | 0;
    var $$0 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
    $5 = $0 + 4 | 0;
    $6 = HEAP322[$5 >> 2] | 0;
    $7 = $6 >> 8;
    $8 = $6 & 1;
    $9 = ($8 | 0) == 0;
    if ($9) {
      $$0 = $7;
    } else {
      $10 = HEAP322[$2 >> 2] | 0;
      $11 = $10 + $7 | 0;
      $12 = HEAP322[$11 >> 2] | 0;
      $$0 = $12;
    }
    $13 = HEAP322[$0 >> 2] | 0;
    $14 = HEAP322[$13 >> 2] | 0;
    $15 = $14 + 24 | 0;
    $16 = HEAP322[$15 >> 2] | 0;
    $17 = $2 + $$0 | 0;
    $18 = $6 & 2;
    $19 = ($18 | 0) != 0;
    $20 = $19 ? $3 : 2;
    FUNCTION_TABLE_viiiii[$16 & 31]($13, $1, $17, $20, $4);
    return;
  }
  function runPostSets() {
  }
  function _i64Subtract(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var l = 0, h = 0;
    l = a - c >>> 0;
    h = b - d >>> 0;
    h = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;
    return (tempRet02 = h, l | 0) | 0;
  }
  function _i64Add(a, b, c, d) {
    a = a | 0;
    b = b | 0;
    c = c | 0;
    d = d | 0;
    var l = 0, h = 0;
    l = a + c >>> 0;
    h = b + d + (l >>> 0 < a >>> 0 | 0) >>> 0;
    return (tempRet02 = h, l | 0) | 0;
  }
  function _memset(ptr, value, num) {
    ptr = ptr | 0;
    value = value | 0;
    num = num | 0;
    var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
    end = ptr + num | 0;
    value = value & 255;
    if ((num | 0) >= 67) {
      while ((ptr & 3) != 0) {
        HEAP82[ptr >> 0] = value;
        ptr = ptr + 1 | 0;
      }
      aligned_end = end & -4 | 0;
      block_aligned_end = aligned_end - 64 | 0;
      value4 = value | value << 8 | value << 16 | value << 24;
      while ((ptr | 0) <= (block_aligned_end | 0)) {
        HEAP322[ptr >> 2] = value4;
        HEAP322[ptr + 4 >> 2] = value4;
        HEAP322[ptr + 8 >> 2] = value4;
        HEAP322[ptr + 12 >> 2] = value4;
        HEAP322[ptr + 16 >> 2] = value4;
        HEAP322[ptr + 20 >> 2] = value4;
        HEAP322[ptr + 24 >> 2] = value4;
        HEAP322[ptr + 28 >> 2] = value4;
        HEAP322[ptr + 32 >> 2] = value4;
        HEAP322[ptr + 36 >> 2] = value4;
        HEAP322[ptr + 40 >> 2] = value4;
        HEAP322[ptr + 44 >> 2] = value4;
        HEAP322[ptr + 48 >> 2] = value4;
        HEAP322[ptr + 52 >> 2] = value4;
        HEAP322[ptr + 56 >> 2] = value4;
        HEAP322[ptr + 60 >> 2] = value4;
        ptr = ptr + 64 | 0;
      }
      while ((ptr | 0) < (aligned_end | 0)) {
        HEAP322[ptr >> 2] = value4;
        ptr = ptr + 4 | 0;
      }
    }
    while ((ptr | 0) < (end | 0)) {
      HEAP82[ptr >> 0] = value;
      ptr = ptr + 1 | 0;
    }
    return end - num | 0;
  }
  function _bitshift64Shl(low, high, bits) {
    low = low | 0;
    high = high | 0;
    bits = bits | 0;
    var ander = 0;
    if ((bits | 0) < 32) {
      ander = (1 << bits) - 1 | 0;
      tempRet02 = high << bits | (low & ander << 32 - bits) >>> 32 - bits;
      return low << bits;
    }
    tempRet02 = low << bits - 32;
    return 0;
  }
  function _bitshift64Lshr(low, high, bits) {
    low = low | 0;
    high = high | 0;
    bits = bits | 0;
    var ander = 0;
    if ((bits | 0) < 32) {
      ander = (1 << bits) - 1 | 0;
      tempRet02 = high >>> bits;
      return low >>> bits | (high & ander) << 32 - bits;
    }
    tempRet02 = 0;
    return high >>> bits - 32 | 0;
  }
  function _llvm_cttz_i32(x) {
    x = x | 0;
    var ret = 0;
    ret = HEAP82[cttz_i82 + (x & 255) >> 0] | 0;
    if ((ret | 0) < 8)
      return ret | 0;
    ret = HEAP82[cttz_i82 + (x >> 8 & 255) >> 0] | 0;
    if ((ret | 0) < 8)
      return ret + 8 | 0;
    ret = HEAP82[cttz_i82 + (x >> 16 & 255) >> 0] | 0;
    if ((ret | 0) < 8)
      return ret + 16 | 0;
    return (HEAP82[cttz_i82 + (x >>> 24) >> 0] | 0) + 24 | 0;
  }
  function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
    $a$0 = $a$0 | 0;
    $a$1 = $a$1 | 0;
    $b$0 = $b$0 | 0;
    $b$1 = $b$1 | 0;
    $rem = $rem | 0;
    var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
    $n_sroa_0_0_extract_trunc = $a$0;
    $n_sroa_1_4_extract_shift$0 = $a$1;
    $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
    $d_sroa_0_0_extract_trunc = $b$0;
    $d_sroa_1_4_extract_shift$0 = $b$1;
    $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
    if (($n_sroa_1_4_extract_trunc | 0) == 0) {
      $4 = ($rem | 0) != 0;
      if (($d_sroa_1_4_extract_trunc | 0) == 0) {
        if ($4) {
          HEAP322[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP322[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet02 = $_0$1, $_0$0) | 0;
      } else {
        if (!$4) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        HEAP322[$rem >> 2] = $a$0 & -1;
        HEAP322[$rem + 4 >> 2] = $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet02 = $_0$1, $_0$0) | 0;
      }
    }
    $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
    do {
      if (($d_sroa_0_0_extract_trunc | 0) == 0) {
        if ($17) {
          if (($rem | 0) != 0) {
            HEAP322[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
            HEAP322[$rem + 4 >> 2] = 0;
          }
          $_0$1 = 0;
          $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        if (($n_sroa_0_0_extract_trunc | 0) == 0) {
          if (($rem | 0) != 0) {
            HEAP322[$rem >> 2] = 0;
            HEAP322[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
          }
          $_0$1 = 0;
          $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
        if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
          if (($rem | 0) != 0) {
            HEAP322[$rem >> 2] = 0 | $a$0 & -1;
            HEAP322[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
          }
          $_0$1 = 0;
          $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        $49 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
        $51 = $49 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($51 >>> 0 <= 30) {
          $57 = $51 + 1 | 0;
          $58 = 31 - $51 | 0;
          $sr_1_ph = $57;
          $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        HEAP322[$rem >> 2] = 0 | $a$0 & -1;
        HEAP322[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet02 = $_0$1, $_0$0) | 0;
      } else {
        if (!$17) {
          $117 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
          $119 = $117 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
          if ($119 >>> 0 <= 31) {
            $125 = $119 + 1 | 0;
            $126 = 31 - $119 | 0;
            $130 = $119 - 31 >> 31;
            $sr_1_ph = $125;
            $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
            $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
            $q_sroa_0_1_ph = 0;
            $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
            break;
          }
          if (($rem | 0) == 0) {
            $_0$1 = 0;
            $_0$0 = 0;
            return (tempRet02 = $_0$1, $_0$0) | 0;
          }
          HEAP322[$rem >> 2] = 0 | $a$0 & -1;
          HEAP322[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
        $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
        if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
          $86 = (Math_clz32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
          $88 = $86 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
          $89 = 64 - $88 | 0;
          $91 = 32 - $88 | 0;
          $92 = $91 >> 31;
          $95 = $88 - 32 | 0;
          $105 = $95 >> 31;
          $sr_1_ph = $88;
          $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
          $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
          $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
          $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
          break;
        }
        if (($rem | 0) != 0) {
          HEAP322[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
          HEAP322[$rem + 4 >> 2] = 0;
        }
        if (($d_sroa_0_0_extract_trunc | 0) == 1) {
          $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
          $_0$0 = 0 | $a$0 & -1;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        } else {
          $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
          $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
          $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
          return (tempRet02 = $_0$1, $_0$0) | 0;
        }
      }
    } while (0);
    if (($sr_1_ph | 0) == 0) {
      $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
      $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
      $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
      $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
      $carry_0_lcssa$1 = 0;
      $carry_0_lcssa$0 = 0;
    } else {
      $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
      $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
      $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0 | 0, $d_sroa_0_0_insert_insert99$1 | 0, -1, -1) | 0;
      $137$1 = tempRet02;
      $q_sroa_1_1198 = $q_sroa_1_1_ph;
      $q_sroa_0_1199 = $q_sroa_0_1_ph;
      $r_sroa_1_1200 = $r_sroa_1_1_ph;
      $r_sroa_0_1201 = $r_sroa_0_1_ph;
      $sr_1202 = $sr_1_ph;
      $carry_0203 = 0;
      while (1) {
        $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
        $149 = $carry_0203 | $q_sroa_0_1199 << 1;
        $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
        $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
        _i64Subtract($137$0 | 0, $137$1 | 0, $r_sroa_0_0_insert_insert42$0 | 0, $r_sroa_0_0_insert_insert42$1 | 0) | 0;
        $150$1 = tempRet02;
        $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
        $152 = $151$0 & 1;
        $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0 | 0, $r_sroa_0_0_insert_insert42$1 | 0, $151$0 & $d_sroa_0_0_insert_insert99$0 | 0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1 | 0) | 0;
        $r_sroa_0_0_extract_trunc = $154$0;
        $r_sroa_1_4_extract_trunc = tempRet02;
        $155 = $sr_1202 - 1 | 0;
        if (($155 | 0) == 0) {
          break;
        } else {
          $q_sroa_1_1198 = $147;
          $q_sroa_0_1199 = $149;
          $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
          $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
          $sr_1202 = $155;
          $carry_0203 = $152;
        }
      }
      $q_sroa_1_1_lcssa = $147;
      $q_sroa_0_1_lcssa = $149;
      $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
      $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
      $carry_0_lcssa$1 = 0;
      $carry_0_lcssa$0 = $152;
    }
    $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
    $q_sroa_0_0_insert_ext75$1 = 0;
    $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
    if (($rem | 0) != 0) {
      HEAP322[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
      HEAP322[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
    }
    $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
    $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
    return (tempRet02 = $_0$1, $_0$0) | 0;
  }
  function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
    $a$0 = $a$0 | 0;
    $a$1 = $a$1 | 0;
    $b$0 = $b$0 | 0;
    $b$1 = $b$1 | 0;
    var $1$0 = 0;
    $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
    return $1$0 | 0;
  }
  function ___muldsi3($a, $b) {
    $a = $a | 0;
    $b = $b | 0;
    var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
    $1 = $a & 65535;
    $2 = $b & 65535;
    $3 = Math_imul($2, $1) | 0;
    $6 = $a >>> 16;
    $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
    $11 = $b >>> 16;
    $12 = Math_imul($11, $1) | 0;
    return (tempRet02 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
  }
  function ___muldi3($a$0, $a$1, $b$0, $b$1) {
    $a$0 = $a$0 | 0;
    $a$1 = $a$1 | 0;
    $b$0 = $b$0 | 0;
    $b$1 = $b$1 | 0;
    var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
    $x_sroa_0_0_extract_trunc = $a$0;
    $y_sroa_0_0_extract_trunc = $b$0;
    $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
    $1$1 = tempRet02;
    $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
    return (tempRet02 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
  }
  function _sbrk(increment) {
    increment = increment | 0;
    var oldDynamicTop = 0;
    var newDynamicTop = 0;
    var totalMemory = 0;
    increment = increment + 15 & -16 | 0;
    oldDynamicTop = HEAP322[DYNAMICTOP_PTR2 >> 2] | 0;
    newDynamicTop = oldDynamicTop + increment | 0;
    if ((increment | 0) > 0 & (newDynamicTop | 0) < (oldDynamicTop | 0) | (newDynamicTop | 0) < 0) {
      abortOnCannotGrowMemory2() | 0;
      ___setErrNo2(12);
      return -1;
    }
    HEAP322[DYNAMICTOP_PTR2 >> 2] = newDynamicTop;
    totalMemory = getTotalMemory2() | 0;
    if ((newDynamicTop | 0) > (totalMemory | 0)) {
      if ((enlargeMemory2() | 0) == 0) {
        HEAP322[DYNAMICTOP_PTR2 >> 2] = oldDynamicTop;
        ___setErrNo2(12);
        return -1;
      }
    }
    return oldDynamicTop | 0;
  }
  function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
    $a$0 = $a$0 | 0;
    $a$1 = $a$1 | 0;
    $b$0 = $b$0 | 0;
    $b$1 = $b$1 | 0;
    var $rem = 0, __stackBase__ = 0;
    __stackBase__ = STACKTOP2;
    STACKTOP2 = STACKTOP2 + 16 | 0;
    $rem = __stackBase__ | 0;
    ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
    STACKTOP2 = __stackBase__;
    return (tempRet02 = HEAP322[$rem + 4 >> 2] | 0, HEAP322[$rem >> 2] | 0) | 0;
  }
  function _memcpy(dest, src, num) {
    dest = dest | 0;
    src = src | 0;
    num = num | 0;
    var ret = 0;
    var aligned_dest_end = 0;
    var block_aligned_dest_end = 0;
    var dest_end = 0;
    if ((num | 0) >= 8192) {
      return _emscripten_memcpy_big2(dest | 0, src | 0, num | 0) | 0;
    }
    ret = dest | 0;
    dest_end = dest + num | 0;
    if ((dest & 3) == (src & 3)) {
      while (dest & 3) {
        if ((num | 0) == 0)
          return ret | 0;
        HEAP82[dest >> 0] = HEAP82[src >> 0] | 0;
        dest = dest + 1 | 0;
        src = src + 1 | 0;
        num = num - 1 | 0;
      }
      aligned_dest_end = dest_end & -4 | 0;
      block_aligned_dest_end = aligned_dest_end - 64 | 0;
      while ((dest | 0) <= (block_aligned_dest_end | 0)) {
        HEAP322[dest >> 2] = HEAP322[src >> 2] | 0;
        HEAP322[dest + 4 >> 2] = HEAP322[src + 4 >> 2] | 0;
        HEAP322[dest + 8 >> 2] = HEAP322[src + 8 >> 2] | 0;
        HEAP322[dest + 12 >> 2] = HEAP322[src + 12 >> 2] | 0;
        HEAP322[dest + 16 >> 2] = HEAP322[src + 16 >> 2] | 0;
        HEAP322[dest + 20 >> 2] = HEAP322[src + 20 >> 2] | 0;
        HEAP322[dest + 24 >> 2] = HEAP322[src + 24 >> 2] | 0;
        HEAP322[dest + 28 >> 2] = HEAP322[src + 28 >> 2] | 0;
        HEAP322[dest + 32 >> 2] = HEAP322[src + 32 >> 2] | 0;
        HEAP322[dest + 36 >> 2] = HEAP322[src + 36 >> 2] | 0;
        HEAP322[dest + 40 >> 2] = HEAP322[src + 40 >> 2] | 0;
        HEAP322[dest + 44 >> 2] = HEAP322[src + 44 >> 2] | 0;
        HEAP322[dest + 48 >> 2] = HEAP322[src + 48 >> 2] | 0;
        HEAP322[dest + 52 >> 2] = HEAP322[src + 52 >> 2] | 0;
        HEAP322[dest + 56 >> 2] = HEAP322[src + 56 >> 2] | 0;
        HEAP322[dest + 60 >> 2] = HEAP322[src + 60 >> 2] | 0;
        dest = dest + 64 | 0;
        src = src + 64 | 0;
      }
      while ((dest | 0) < (aligned_dest_end | 0)) {
        HEAP322[dest >> 2] = HEAP322[src >> 2] | 0;
        dest = dest + 4 | 0;
        src = src + 4 | 0;
      }
    } else {
      aligned_dest_end = dest_end - 4 | 0;
      while ((dest | 0) < (aligned_dest_end | 0)) {
        HEAP82[dest >> 0] = HEAP82[src >> 0] | 0;
        HEAP82[dest + 1 >> 0] = HEAP82[src + 1 >> 0] | 0;
        HEAP82[dest + 2 >> 0] = HEAP82[src + 2 >> 0] | 0;
        HEAP82[dest + 3 >> 0] = HEAP82[src + 3 >> 0] | 0;
        dest = dest + 4 | 0;
        src = src + 4 | 0;
      }
    }
    while ((dest | 0) < (dest_end | 0)) {
      HEAP82[dest >> 0] = HEAP82[src >> 0] | 0;
      dest = dest + 1 | 0;
      src = src + 1 | 0;
    }
    return ret | 0;
  }
  function _llvm_bswap_i32(x) {
    x = x | 0;
    return (x & 255) << 24 | (x >> 8 & 255) << 16 | (x >> 16 & 255) << 8 | x >>> 24 | 0;
  }
  function dynCall_iiii(index, a1, a2, a3) {
    index = index | 0;
    a1 = a1 | 0;
    a2 = a2 | 0;
    a3 = a3 | 0;
    return FUNCTION_TABLE_iiii[index & 31](a1 | 0, a2 | 0, a3 | 0) | 0;
  }
  function dynCall_viiiii(index, a1, a2, a3, a4, a5) {
    index = index | 0;
    a1 = a1 | 0;
    a2 = a2 | 0;
    a3 = a3 | 0;
    a4 = a4 | 0;
    a5 = a5 | 0;
    FUNCTION_TABLE_viiiii[index & 31](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0);
  }
  function dynCall_vi(index, a1) {
    index = index | 0;
    a1 = a1 | 0;
    FUNCTION_TABLE_vi[index & 31](a1 | 0);
  }
  function dynCall_ii(index, a1) {
    index = index | 0;
    a1 = a1 | 0;
    return FUNCTION_TABLE_ii[index & 1](a1 | 0) | 0;
  }
  function dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6) {
    index = index | 0;
    a1 = a1 | 0;
    a2 = a2 | 0;
    a3 = a3 | 0;
    a4 = a4 | 0;
    a5 = a5 | 0;
    a6 = a6 | 0;
    FUNCTION_TABLE_viiiiii[index & 31](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0, a6 | 0);
  }
  function dynCall_viiii(index, a1, a2, a3, a4) {
    index = index | 0;
    a1 = a1 | 0;
    a2 = a2 | 0;
    a3 = a3 | 0;
    a4 = a4 | 0;
    FUNCTION_TABLE_viiii[index & 31](a1 | 0, a2 | 0, a3 | 0, a4 | 0);
  }
  function b0(p0, p1, p2) {
    nullFunc_iiii2(0);
    return 0;
  }
  function b1(p0, p1, p2, p3, p4) {
    nullFunc_viiiii2(1);
  }
  function b2(p0) {
    nullFunc_vi2(2);
  }
  function b3(p0) {
    nullFunc_ii2(3);
    return 0;
  }
  function b4(p0, p1, p2, p3, p4, p5) {
    nullFunc_viiiiii2(4);
  }
  function b5(p0, p1, p2, p3) {
    nullFunc_viiii2(5);
  }
  var FUNCTION_TABLE_iiii = [
    b0,
    b0,
    ___stdout_write,
    ___stdio_seek,
    _sn_write,
    b0,
    b0,
    b0,
    b0,
    __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,
    b0,
    b0,
    b0,
    b0,
    b0,
    b0,
    b0,
    b0,
    __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,
    b0,
    b0,
    b0,
    b0,
    ___stdio_write,
    _do_read,
    b0,
    b0,
    b0,
    b0,
    b0,
    b0,
    b0
  ];
  var FUNCTION_TABLE_viiiii = [
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,
    b1,
    b1,
    b1,
    __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,
    b1,
    b1,
    b1,
    b1,
    b1,
    __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1,
    b1
  ];
  var FUNCTION_TABLE_vi = [
    b2,
    b2,
    b2,
    b2,
    b2,
    __ZN10__cxxabiv116__shim_type_infoD2Ev,
    __ZN10__cxxabiv117__class_type_infoD0Ev,
    __ZNK10__cxxabiv116__shim_type_info5noop1Ev,
    __ZNK10__cxxabiv116__shim_type_info5noop2Ev,
    b2,
    b2,
    b2,
    b2,
    __ZN10__cxxabiv120__si_class_type_infoD0Ev,
    b2,
    b2,
    b2,
    __ZN10__cxxabiv123__fundamental_type_infoD0Ev,
    b2,
    __ZN10__cxxabiv121__vmi_class_type_infoD0Ev,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2,
    b2
  ];
  var FUNCTION_TABLE_ii = [b3, ___stdio_close];
  var FUNCTION_TABLE_viiiiii = [
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,
    b4,
    b4,
    b4,
    __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,
    b4,
    b4,
    b4,
    b4,
    b4,
    __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4,
    b4
  ];
  var FUNCTION_TABLE_viiii = [
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,
    b5,
    b5,
    b5,
    __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,
    b5,
    b5,
    b5,
    b5,
    b5,
    __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5,
    b5
  ];
  return { stackSave, _i64Subtract, ___udivdi3, setThrew, _str_to_uint64, _bitshift64Lshr, _bitshift64Shl, _fflush, _crc64, ___errno_location, _memset, _sbrk, _memcpy, stackAlloc, ___muldi3, _crc64_init, ___uremdi3, dynCall_vi, getTempRet0, __GLOBAL__sub_I_bind_cpp: __GLOBAL__sub_I_bind_cpp2, _uint64_to_str, setTempRet0, _i64Add, dynCall_iiii, _emscripten_get_global_libc, ___getTypeName, dynCall_ii, dynCall_viiii, _llvm_bswap_i32, dynCall_viiiii, _free: _free2, runPostSets, dynCall_viiiiii, establishStackSpace, stackRestore, _malloc: _malloc2 };
}(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real_stackSave = asm["stackSave"];
asm["stackSave"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_stackSave.apply(null, arguments);
};
var real_getTempRet0 = asm["getTempRet0"];
asm["getTempRet0"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_getTempRet0.apply(null, arguments);
};
var real____udivdi3 = asm["___udivdi3"];
asm["___udivdi3"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real____udivdi3.apply(null, arguments);
};
var real_setThrew = asm["setThrew"];
asm["setThrew"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_setThrew.apply(null, arguments);
};
var real___GLOBAL__sub_I_bind_cpp = asm["__GLOBAL__sub_I_bind_cpp"];
asm["__GLOBAL__sub_I_bind_cpp"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real___GLOBAL__sub_I_bind_cpp.apply(null, arguments);
};
var real__bitshift64Lshr = asm["_bitshift64Lshr"];
asm["_bitshift64Lshr"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__bitshift64Lshr.apply(null, arguments);
};
var real__bitshift64Shl = asm["_bitshift64Shl"];
asm["_bitshift64Shl"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__bitshift64Shl.apply(null, arguments);
};
var real__fflush = asm["_fflush"];
asm["_fflush"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__fflush.apply(null, arguments);
};
var real__crc64 = asm["_crc64"];
asm["_crc64"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__crc64.apply(null, arguments);
};
var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__sbrk.apply(null, arguments);
};
var real__llvm_bswap_i32 = asm["_llvm_bswap_i32"];
asm["_llvm_bswap_i32"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__llvm_bswap_i32.apply(null, arguments);
};
var real____muldi3 = asm["___muldi3"];
asm["___muldi3"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real____muldi3.apply(null, arguments);
};
var real__crc64_init = asm["_crc64_init"];
asm["_crc64_init"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__crc64_init.apply(null, arguments);
};
var real____uremdi3 = asm["___uremdi3"];
asm["___uremdi3"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real____uremdi3.apply(null, arguments);
};
var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_stackAlloc.apply(null, arguments);
};
var real__i64Subtract = asm["_i64Subtract"];
asm["_i64Subtract"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__i64Subtract.apply(null, arguments);
};
var real__str_to_uint64 = asm["_str_to_uint64"];
asm["_str_to_uint64"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__str_to_uint64.apply(null, arguments);
};
var real__uint64_to_str = asm["_uint64_to_str"];
asm["_uint64_to_str"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__uint64_to_str.apply(null, arguments);
};
var real_setTempRet0 = asm["setTempRet0"];
asm["setTempRet0"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_setTempRet0.apply(null, arguments);
};
var real__i64Add = asm["_i64Add"];
asm["_i64Add"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__i64Add.apply(null, arguments);
};
var real__emscripten_get_global_libc = asm["_emscripten_get_global_libc"];
asm["_emscripten_get_global_libc"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__emscripten_get_global_libc.apply(null, arguments);
};
var real____getTypeName = asm["___getTypeName"];
asm["___getTypeName"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real____getTypeName.apply(null, arguments);
};
var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real____errno_location.apply(null, arguments);
};
var real__free = asm["_free"];
asm["_free"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__free.apply(null, arguments);
};
var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_establishStackSpace.apply(null, arguments);
};
var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real_stackRestore.apply(null, arguments);
};
var real__malloc = asm["_malloc"];
asm["_malloc"] = function() {
  assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
  assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
  return real__malloc.apply(null, arguments);
};
Module["stackSave"] = asm["stackSave"];
Module["getTempRet0"] = asm["getTempRet0"];
Module["___udivdi3"] = asm["___udivdi3"];
Module["setThrew"] = asm["setThrew"];
var __GLOBAL__sub_I_bind_cpp = Module["__GLOBAL__sub_I_bind_cpp"] = asm["__GLOBAL__sub_I_bind_cpp"];
Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
Module["_fflush"] = asm["_fflush"];
Module["_crc64"] = asm["_crc64"];
Module["_memset"] = asm["_memset"];
Module["_sbrk"] = asm["_sbrk"];
Module["_memcpy"] = asm["_memcpy"];
Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
Module["___muldi3"] = asm["___muldi3"];
Module["_crc64_init"] = asm["_crc64_init"];
Module["___uremdi3"] = asm["___uremdi3"];
Module["stackAlloc"] = asm["stackAlloc"];
Module["_i64Subtract"] = asm["_i64Subtract"];
Module["_str_to_uint64"] = asm["_str_to_uint64"];
Module["_uint64_to_str"] = asm["_uint64_to_str"];
Module["setTempRet0"] = asm["setTempRet0"];
Module["_i64Add"] = asm["_i64Add"];
Module["_emscripten_get_global_libc"] = asm["_emscripten_get_global_libc"];
Module["___getTypeName"] = asm["___getTypeName"];
Module["___errno_location"] = asm["___errno_location"];
var _free = Module["_free"] = asm["_free"];
Module["runPostSets"] = asm["runPostSets"];
Module["establishStackSpace"] = asm["establishStackSpace"];
Module["stackRestore"] = asm["stackRestore"];
var _malloc = Module["_malloc"] = asm["_malloc"];
Module["dynCall_iiii"] = asm["dynCall_iiii"];
Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
Module["dynCall_vi"] = asm["dynCall_vi"];
Module["dynCall_ii"] = asm["dynCall_ii"];
Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = Module["stackAlloc"];
Runtime.stackSave = Module["stackSave"];
Runtime.stackRestore = Module["stackRestore"];
Runtime.establishStackSpace = Module["establishStackSpace"];
Runtime.setTempRet0 = Module["setTempRet0"];
Runtime.getTempRet0 = Module["getTempRet0"];
Module["asm"] = asm;
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
dependenciesFulfilled = function runCaller() {
  if (!Module["calledRun"])
    run();
  if (!Module["calledRun"])
    dependenciesFulfilled = runCaller;
};
Module["callMain"] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, "cannot call main when async dependencies remain! (listen on __ATMAIN__)");
  assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
  args = args || [];
  ensureInitRuntime();
  var argc = args.length + 1;
  function pad() {
    for (var i3 = 0; i3 < 4 - 1; i3++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL)];
  pad();
  for (var i2 = 0; i2 < argc - 1; i2 = i2 + 1) {
    argv.push(allocate(intArrayFromString(args[i2]), "i8", ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, "i32", ALLOC_NORMAL);
  try {
    var ret = Module["_main"](argc, argv, 0);
    exit(
      ret,
      /* implicit = */
      true
    );
  } catch (e) {
    if (e instanceof ExitStatus) {
      return;
    } else if (e == "SimulateInfiniteLoop") {
      Module["noExitRuntime"] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === "object" && e.stack) {
        toLog = [e, e.stack];
      }
      Module.printErr("exception thrown: " + toLog);
      Module["quit"](1, e);
    }
  } finally {
  }
};
function run(args) {
  args = args || Module["arguments"];
  if (preloadStartTime === null)
    preloadStartTime = Date.now();
  if (runDependencies > 0) {
    return;
  }
  writeStackCookie();
  preRun();
  if (runDependencies > 0)
    return;
  if (Module["calledRun"])
    return;
  function doRun() {
    if (Module["calledRun"])
      return;
    Module["calledRun"] = true;
    if (ABORT)
      return;
    ensureInitRuntime();
    preMain();
    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr("pre-main prep time: " + (Date.now() - preloadStartTime) + " ms");
    }
    if (Module["onRuntimeInitialized"])
      Module["onRuntimeInitialized"]();
    if (Module["_main"] && shouldRunNow)
      Module["callMain"](args);
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function() {
      setTimeout(function() {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}
Module["run"] = Module.run = run;
function exit(status, implicit) {
  if (implicit && Module["noExitRuntime"]) {
    Module.printErr("exit(" + status + ") implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)");
    return;
  }
  if (Module["noExitRuntime"]) {
    Module.printErr("exit(" + status + ") called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)");
  } else {
    ABORT = true;
    STACKTOP = initialStackTop;
    exitRuntime();
    if (Module["onExit"])
      Module["onExit"](status);
  }
  if (ENVIRONMENT_IS_NODE) {
    process["exit"](status);
  }
  Module["quit"](status, new ExitStatus(status));
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];
function abort(what) {
  if (Module["onAbort"]) {
    Module["onAbort"](what);
  }
  if (what !== void 0) {
    Module.print(what);
    Module.printErr(what);
    what = JSON.stringify(what);
  } else {
    what = "";
  }
  ABORT = true;
  var extra = "";
  var output = "abort(" + what + ") at " + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
  shouldRunNow = false;
}
run();
const binding = Module;
const fs = require("fs");
const raw = {
  crc64: binding.cwrap("crc64", "null", ["number", "number", "number"]),
  crc64Init: binding.cwrap("crc64_init", "null", []),
  strToUint64Ptr: binding.cwrap("str_to_uint64", "null", ["number", "number"]),
  uint64PtrToStr: binding.cwrap("uint64_to_str", "null", ["number", "number"])
};
raw.crc64Init();
function strToUint64Ptr(str) {
  const strPtr = binding._malloc(str.length + 1);
  binding.stringToUTF8(str, strPtr, str.length + 1);
  const uint64Ptr = binding._malloc(8);
  raw.strToUint64Ptr(strPtr, uint64Ptr);
  binding._free(strPtr);
  return uint64Ptr;
}
function uint64PtrToStr(uint64Ptr) {
  const strPtr = binding._malloc(32);
  raw.uint64PtrToStr(strPtr, uint64Ptr);
  const str = binding.UTF8ToString(strPtr);
  binding._free(strPtr);
  return str;
}
function buffToPtr(buff) {
  if (typeof buff === "string") {
    buff = new Buffer(buff);
  } else if (!Buffer.isBuffer(buff)) {
    throw new Error("Invalid buffer type.");
  }
  const buffPtr = binding._malloc(buff.length);
  binding.writeArrayToMemory(buff, buffPtr);
  return buffPtr;
}
module.exports.crc64 = function(buff, prev) {
  if (!prev)
    prev = "0";
  if (typeof prev !== "string" || !/\d+/.test(prev)) {
    throw new Error("Invlid previous value.");
  }
  const prevPtr = strToUint64Ptr(prev);
  const buffPtr = buffToPtr(buff);
  raw.crc64(prevPtr, buffPtr, buff.length);
  const ret = uint64PtrToStr(prevPtr);
  binding._free(prevPtr);
  binding._free(buffPtr);
  return ret;
};
module.exports.crc64File = function(filename, callback, progressCallback) {
  let errored = false;
  const stream = fs.createReadStream(filename);
  const crcPtr = strToUint64Ptr("0");
  let crcPtrFreed = false;
  let totalBytesRead = 0;
  const fileSize = fs.statSync(filename).size;
  stream.on("error", function(err) {
    errored = true;
    stream.destroy();
    if (!crcPtrFreed) {
      binding._free(crcPtr);
      crcPtrFreed = true;
    }
    return callback(err);
  });
  stream.on("data", function(chunk) {
    const buffPtr = buffToPtr(chunk);
    raw.crc64(crcPtr, buffPtr, chunk.length);
    binding._free(buffPtr);
    totalBytesRead += chunk.length;
    progressCallback(totalBytesRead, fileSize);
  });
  stream.on("end", function() {
    if (errored)
      return;
    const ret = uint64PtrToStr(crcPtr);
    if (!crcPtrFreed) {
      binding._free(crcPtr);
      crcPtrFreed = true;
    }
    return callback(void 0, ret);
  });
};
const crc64 = {
  crc64: module.exports.crc64,
  crc64File: module.exports.crc64File
};
const getFileCrc64 = (filePath, p) => {
  return new Promise((resolve, reject) => {
    if (!fsExtra.existsSync(filePath))
      return reject("file not exist");
    crc64.crc64File(
      filePath,
      function(err, crc64Str) {
        if (err)
          return reject(err);
        return resolve(crc64Str);
      },
      function(progress, total) {
        const percent = progress / total * 100;
        p?.(percent);
      }
    );
  });
};
function checkStat(fileList, gamePath, pc) {
  const result = { diff: [] };
  let currentIndex = 0;
  for (const fileItem of fileList) {
    const filePath = pathModule.join(gamePath, fileItem.path);
    const fileStat = fsExtra.statSync(filePath, { throwIfNoEntry: false });
    if (!fileStat || fileStat.size !== parseInt(fileItem.size)) {
      result?.diff?.push(fileItem);
    }
    pc?.(Math.round(++currentIndex / fileList.length * 100));
  }
  return result;
}
async function checkHash(fileList, gamePath, pc) {
  const result = { diff: [], same: [] };
  let totalRate = 0;
  for (const fileItem of fileList) {
    const filePath = pathModule.join(gamePath, fileItem.path);
    if (!fsExtra.existsSync(filePath)) {
      result?.diff?.push(fileItem);
      continue;
    }
    let currentRate = 0;
    try {
      const crc64Str = await getFileCrc64(filePath, (p) => {
        totalRate = totalRate - currentRate + p;
        currentRate = p;
        pc?.(Math.round(totalRate / fileList.length));
      });
      if (crc64Str !== fileItem.hash) {
        result?.diff?.push(fileItem);
      } else {
        result?.same?.push(fileItem);
      }
    } catch (error) {
      Logger.error(
        "checkHash catch",
        `path: ${filePath}
manifest path: ${fileItem.path}
${error}`
      );
    }
  }
  return result;
}
function gameManifestDiff(oldList, newList) {
  const needDownload = {};
  const needDelete = {};
  for (const fileItem of newList) {
    needDownload[fileItem.path] = fileItem;
  }
  for (const fileItem of oldList) {
    if (!needDownload[fileItem.path]) {
      needDelete[fileItem.path] = fileItem;
    } else if (needDownload[fileItem.path].hash === fileItem.hash) {
      delete needDownload[fileItem.path];
    }
  }
  return {
    needDownload: Object.values(needDownload),
    needDelete: Object.values(needDelete)
  };
}
function gameResultMerge(...resultArr) {
  const actualResult = {
    needDownload: [],
    needDelete: []
  };
  const processed = {};
  const result = {
    needDelete: [],
    needDownload: []
  };
  for (const resultItem of resultArr) {
    resultItem?.needDelete && result.needDelete.push(...resultItem.needDelete);
    resultItem?.needDownload && result.needDownload.push(...resultItem.needDownload);
  }
  result.needDelete?.forEach((fileItem) => {
    if (processed[fileItem.path])
      return;
    processed[fileItem.path] = true;
    actualResult.needDelete.push({ ...fileItem });
  });
  result.needDownload?.forEach((fileItem) => {
    if (processed[fileItem.path])
      return;
    processed[fileItem.path] = true;
    actualResult.needDownload.push({ ...fileItem });
  });
  return actualResult;
}
const getCurrentManifestFiles = async (gamePath) => {
  const localManifest = utils$1.readManifestFile(pathModule.join(gamePath, constant.MANIFEST_FILE_NAME));
  const currentVersion = localManifest?.version;
  const currentPath = localManifest?.basis;
  if (!currentVersion || !currentPath) {
    return [...localManifest.files];
  }
  try {
    const currentManifestUrl = await requestManifestUrl({
      version: currentVersion,
      path: currentPath
    });
    const res = await requestManifest(currentManifestUrl);
    return res.file || [];
  } catch (error) {
    Logger.error("local manifest error", `gamePath: ${gamePath}
error: ${error}`);
    return [];
  }
};
const LocalGameStartCheck = async (gamePath) => {
  const currentManifestFiles = await getCurrentManifestFiles(gamePath);
  const checkResult = checkStat(currentManifestFiles, gamePath);
  return checkResult.diff || [];
};
async function gameDownloadList(gamePath, version, basis, pc) {
  const currentManifestFiles = await getCurrentManifestFiles(gamePath);
  const checkResult = checkStat(currentManifestFiles, gamePath, pc);
  const latestManifestUrl = await requestManifestUrl({ version, path: basis });
  const res = await requestManifest(latestManifestUrl);
  Logger.info("latest manifest", `version: ${version}
basis: ${basis}
url: ${latestManifestUrl}`);
  const expectedResult = gameManifestDiff(currentManifestFiles, res?.file || []);
  const actualResult = gameResultMerge(expectedResult, { needDownload: checkResult.diff || [] });
  return { ...actualResult, source: res.source, manifestFiles: res.file };
}
async function gameRepairList(gamePath, version, basis, pc) {
  let latestSource = "";
  const getLatestManifestFiles = async () => {
    const latestManifestUrl = await requestManifestUrl({ version, path: basis });
    const res = await requestManifest(latestManifestUrl);
    latestSource = res.source;
    return res.file;
  };
  const [currentManifestFiles, newManifestFiles] = await Promise.all([
    getCurrentManifestFiles(gamePath),
    getLatestManifestFiles()
  ]);
  const checkResult = await checkHash(newManifestFiles || [], gamePath, pc);
  const expectedResult = gameManifestDiff(currentManifestFiles, newManifestFiles || []);
  const actualResult = gameResultMerge(
    { needDownload: [], needDelete: expectedResult.needDelete || [] },
    { needDownload: checkResult.diff || [] }
  );
  return { ...actualResult, source: latestSource, manifestFiles: newManifestFiles };
}
const GAME_DIR_NAME$1 = "BlueArchive_JP";
function getSystemEnv() {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const shell2 = isWin ? "cmd" : process.env.SHELL || "/bin/bash";
    const params = isWin ? ["/c", "set"] : ["-li", "-c", "env"];
    const splitter = isWin ? "\r\n" : "\n";
    try {
      const child = node_child_process.spawn(shell2, params);
      let buffer2 = "";
      const env = {};
      child.stdout.on("data", (chunk) => {
        buffer2 += chunk.toString();
        const lines = buffer2.split(splitter);
        buffer2 = lines.pop() || "";
        for (const line of lines) {
          const m = line.match(/^([^=]+)=(.*)$/);
          if (m)
            env[m[1]] = m[2];
        }
      });
      child.on("close", () => {
        if (buffer2.length > 0) {
          const m = buffer2.match(/^([^=]+)=(.*)$/);
          if (m)
            env[m[1]] = m[2];
        }
        resolve(env);
      });
      child.on("error", (err) => {
        reject(err.message);
      });
    } catch (e) {
      reject(e);
    }
  });
}
function game() {
  electron.ipcMain.handle("handle-game-start", async (event, data) => {
    const window2 = electron.BrowserWindow.fromWebContents(event.sender);
    try {
      const checkRes = await LocalGameStartCheck(data.path);
      if (checkRes.length) {
        event.sender.send("start-game-damage");
        Logger.warn("start game damage", `damage list: ${JSON.stringify(checkRes)}`);
        return false;
      }
    } catch (error) {
      event.sender.send("error-request-manifest");
      Logger.error("start game request manifest error", `dirPath: ${data.path}
error: ${error}`);
      return false;
    }
    const gamePath = pathModule.join(data.path, `${data.name}.exe`);
    if (!data.name)
      return false;
    if (data.params?.length) {
      const env = await getSystemEnv();
      node_child_process.execFile(gamePath, data.params || [], { env, cwd: data.path }, (error, _stdout, _stderr) => {
        if (error) {
          Logger.error(
            "start game error",
            `gamePath: ${gamePath}
params: ${data.params}
error: ${error}`
          );
        }
      });
      Logger.info("start game with params", `gamePath: ${gamePath}
params: ${data.params}`);
    } else {
      electron.shell.openPath(gamePath);
      Logger.info("start game", `gamePath: ${gamePath}`);
    }
    window2.minimize();
    const clickCode = checkClickCode(data.path);
    if (clickCode)
      Logger.info("start game with clickCode", `clickCode: ${clickCode}`);
    return true;
  });
  electron.ipcMain.handle("handle-check-game", (_event, gamePath) => {
    if (!gamePath) {
      return null;
    }
    if (pathModule.basename(gamePath) !== GAME_DIR_NAME$1)
      return {};
    const gameConfigPath = pathModule.join(gamePath, constant.CONFIG_FILE_NAME);
    const { version, name, params } = utils$1.readGameConfigFile(gameConfigPath);
    return { version, name, params };
  });
  electron.ipcMain.on("request-game-click-code", (_event, gamePath) => {
    loadClickCodeFile(gamePath);
  });
}
function external() {
  electron.ipcMain.on("open-external-url", (_event, url) => {
    electron.shell.openExternal(url);
  });
}
const rootName = "YostarGames";
function initial() {
  electron.ipcMain.on("request-current-version", (event) => {
    const version = electron.app.getVersion();
    event.returnValue = version;
  });
  electron.ipcMain.on("request-system-locale", (event) => {
    const locale = electron.app.getLocale();
    event.returnValue = locale;
  });
  electron.ipcMain.handle("handle-request-http-image-base64", async (_event, imgUrl) => {
    if (!imgUrl) {
      return "";
    }
    let base64;
    try {
      const response = await axios.get(imgUrl, { responseType: "stream" });
      const arrayBuffer = await toArray(response.data);
      const buffer2 = Buffer.concat(arrayBuffer);
      base64 = `data:${response.headers["content-type"]};base64,${buffer2.toString("base64")}`;
    } catch (error) {
      base64 = "";
    }
    if (!base64) {
      return "";
    }
    return base64;
  });
  electron.ipcMain.on("request-recover-games-folder", (event) => {
    const userTempFilePath = pathModule.join(
      electron.app.getPath("temp"),
      `temp-yo-star-games-${"ja"}.txt`
    );
    const currentInstallFolder = pathModule.dirname(electron.app.getPath("exe"));
    if (fsModule.existsSync(userTempFilePath)) {
      const tempFolderPath = fsModule.readFileSync(userTempFilePath);
      if (fsModule.existsSync(tempFolderPath)) {
        const gameFolderPath = pathModule.join(currentInstallFolder, rootName);
        fsModule.renameSync(tempFolderPath, gameFolderPath);
      }
      fsModule.unlinkSync(userTempFilePath);
    }
    event.returnValue = true;
  });
  electron.ipcMain.on("request-string-md5", (event, str) => {
    event.returnValue = crypto.createHash("md5").update(str).digest("hex");
  });
  electron.ipcMain.on("request-http-authorization-header", (event, data) => {
    event.returnValue = utils$1.getAuthHeader({
      data,
      gameId: "BlueArchive_JP",
      version: electron.app.getVersion(),
      salt: "DE7108E9B2842FD460F4777702727869"
    });
  });
  electron.ipcMain.on("quit", () => {
    electron.app.quit();
  });
}
function system$1() {
  electron.ipcMain.on("report-error-log", (_event, logString = "") => {
    return;
  });
  electron.ipcMain.handle("handle-set-proxy-mode", (_event, mode) => {
    const proxyManager = ProxyManager.getInstance();
    proxyManager.setMode(mode);
    return true;
  });
  electron.ipcMain.on("ali-sls-log", (_event, prefix, message) => {
    Logger.error(prefix, message);
  });
}
function CreateDownloader(options) {
  return new node_worker_threads.Worker(require.resolve("./index-f057dd97.js"), options);
}
const workerDownloader = CreateDownloader({});
workerDownloader.on("message", (data) => {
  const windows = electron.BrowserWindow.getAllWindows();
  const windowInstance = windows.find((win) => win["name"] === "main-window");
  if (!windowInstance)
    return;
  switch (data.type) {
    case "download-progress":
      windowInstance.webContents.send("change-view", "download");
      windowInstance.webContents.send("game-download-progress", {
        speed: data.data.speed,
        estimated: data.data.estimated,
        downloadedSize: utils$1.bytesToSize(data.data.downloadedSize),
        downloadTotalSize: utils$1.bytesToSize(data.data.downloadTotalSize),
        progress: parseInt(String(data.data.downloadedSize / data.data.downloadTotalSize * 100))
      });
      break;
    case "progress":
      windowInstance.webContents.send("change-view", "progress");
      windowInstance.webContents.send("receive-progress", {
        state: data.data.key,
        progress: data.data.value
      });
      break;
    case "error":
      windowInstance.webContents.send(data.data);
      break;
    case "start":
      windowInstance.webContents.send("change-view", "download");
      break;
    case "done":
      loadClickCodeFile(data.data);
      windowInstance.webContents.send("game-install-done");
      break;
  }
});
const start = async (downloadParams) => {
  const { dirPath, version, basis, repair, gameName, gameParams, domainMain, domainBackup } = downloadParams;
  const downloadListRes = {
    source: "",
    needDownload: [],
    manifestFiles: []
  };
  try {
    const windows = electron.BrowserWindow.getAllWindows();
    const windowInstance = windows.find((win) => win["name"] === "main-window");
    if (!windowInstance)
      return false;
    if (repair) {
      windowInstance.webContents.send("receive-progress", {
        state: "repair-check",
        progress: 0
      });
      const res = await gameRepairList(dirPath, version, basis, (p) => {
        windowInstance.webContents.send("receive-progress", {
          state: "repair-check",
          progress: p
        });
      });
      windowInstance.webContents.send("receive-progress", {
        state: "repair-confirm",
        progress: -1
      });
      downloadListRes.source = res.source;
      downloadListRes.needDownload = res.needDownload;
      downloadListRes.needDelete = res.needDelete;
      downloadListRes.manifestFiles = res.manifestFiles || [];
    } else {
      windowInstance.webContents.send("receive-progress", {
        state: "update-tips",
        progress: -1
      });
      const res = await gameDownloadList(dirPath, version, basis, (p) => {
        windowInstance.webContents.send("receive-progress", {
          state: "update-check",
          progress: p
        });
      });
      downloadListRes.source = res.source;
      downloadListRes.needDownload = res.needDownload;
      downloadListRes.needDelete = res.needDelete;
      downloadListRes.manifestFiles = res.manifestFiles || [];
    }
  } catch (error) {
    Logger.error("request manifest error", `details: ${error}`);
    return false;
  }
  const proxyManager = ProxyManager.getInstance();
  const proxyInfo = proxyManager.getProxyInfo();
  workerDownloader.postMessage({
    type: "start",
    startParams: {
      dirPath,
      version,
      basis,
      gameName,
      gameParams,
      gameTag: "BlueArchive_JP",
      domainMain,
      domainBackup,
      proxyInfo,
      ...downloadListRes
    }
  });
  return true;
};
const stop = () => {
  workerDownloader.postMessage({ type: "stop" });
};
const GAME_DIR_NAME = "BlueArchive_JP";
function download() {
  electron.ipcMain.handle(
    "handle-start-download",
    async (_event, dirPath, version, basis, gameName, gameParams, repair) => {
      const { version: localVersion } = utils$1.readGameConfigFile(
        pathModule.join(dirPath, constant.CONFIG_FILE_NAME)
      );
      Logger.info(
        "start download",
        `repair: ${repair}
version: ${version}
local version: ${localVersion}
dirPath: ${dirPath}
basis: ${basis}`
      );
      try {
        const res = await requestDomain();
        if (!res) {
          Logger.error("requestDomain null", `response: ${res}`);
          return false;
        }
        return await start({
          domainMain: res.primary_cdn,
          domainBackup: res.back_up_cdn,
          dirPath,
          version,
          basis,
          gameName,
          gameParams,
          repair
        });
      } catch (error) {
        Logger.error("requestDomain error", `${error}`);
        return false;
      }
      return true;
    }
  );
  electron.ipcMain.handle("handle-stop-download", async () => {
    stop();
  });
  electron.ipcMain.handle("handle-start-uninstall", async (event, gamePath) => {
    if (!fsExtra.existsSync(gamePath)) {
      Logger.error("uninstall path error", `gamePath not exist: ${gamePath}`);
      event.sender.send("uninstall-error");
      return;
    }
    if (isSystemProtectPath(gamePath)) {
      Logger.warn("uninstall game", `gamePath is system protect path: ${gamePath}`);
      event.sender.send("uninstall-error");
      return;
    }
    const gameDirectory = pathModule.basename(gamePath);
    if (gameDirectory !== GAME_DIR_NAME) {
      Logger.warn(
        "uninstall game",
        `game directory error: expect name: ${GAME_DIR_NAME}, but actual name: ${gameDirectory}`
      );
      event.sender.send("uninstall-error");
      return;
    }
    const { version, name } = utils$1.readGameConfigFile(pathModule.join(gamePath, constant.CONFIG_FILE_NAME));
    if (!version || !name) {
      Logger.warn("uninstall game", `${constant.CONFIG_FILE_NAME} not exist: ${gamePath}`);
      event.sender.send("uninstall-error");
      return;
    }
    try {
      const isRunning = await utils$1.isExeRunning(`${name}.exe`);
      if (isRunning) {
        Logger.warn("uninstall game", `game is running: ${name}.exe`);
        event.sender.send("uninstall-error-running");
        return;
      }
    } catch (error) {
      Logger.error("uninstall process check", `error: ${error}`);
    }
    const manifestPath = pathModule.join(gamePath, constant.MANIFEST_FILE_NAME);
    const configPath = pathModule.join(gamePath, constant.CONFIG_FILE_NAME);
    const manifestConfig = utils$1.readManifestFile(manifestPath);
    event.sender.send("uninstall-start");
    utils$1.removeFiles(gamePath, manifestConfig.files, (p) => {
      event.sender.send("uninstall-process", p);
    });
    fsExtra.removeSync(manifestPath);
    fsExtra.removeSync(configPath);
    event.sender.send("uninstall-done");
  });
}
const ipcEvent = () => {
  header();
  path();
  game();
  download();
  external();
  initial();
  system$1();
};
const system = () => {
  electron.app.commandLine.appendSwitch("high-dpi-support", "true");
  electron.app.commandLine.appendSwitch("wm-window-animations-disabled");
  electron.app.commandLine.appendSwitch("--no-sandbox");
  electron.app.on("render-process-gone", (_event, _webContents, details) => {
    Logger.error("app:render-process-gone", `details: ${JSON.stringify(details)}`);
  });
  electron.app.on("child-process-gone", (_event, details) => {
    Logger.error("app:child-process-gone", `details: ${JSON.stringify(details)}`);
  });
  process.on("uncaughtException", (error) => {
    Logger.error("process uncaughtException", `details: ${JSON.stringify(error)}`);
  });
  process.on("unhandledRejection", (error) => {
    Logger.error("process unhandledRejection", `details: ${JSON.stringify(error)}`);
  });
};
const translation$4 = {
  tray: {
    show: "Show Launcher",
    exit: "Exit Launcher"
  }
};
const en = {
  translation: translation$4
};
const translation$3 = {
  tray: {
    show: "ランチャー表示",
    exit: "ランチャーを終了する"
  }
};
const ja = {
  translation: translation$3
};
const translation$2 = {
  tray: {
    show: "메인 화면 표시",
    exit: "게임 런처 종료"
  }
};
const ko = {
  translation: translation$2
};
const translation$1 = {
  tray: {
    show: "显示主界面",
    exit: "退出启动器"
  }
};
const zh_cn = {
  translation: translation$1
};
const translation = {
  tray: {
    show: "顯示主介面",
    exit: "退出啟動器"
  }
};
const zh_tw = {
  translation
};
const locales = async () => {
  const langConfig = "ja"?.replace("-", "_")?.toLowerCase();
  const resources = {
    en
  };
  switch (langConfig) {
    case "en":
      resources["ja"] = ja;
      resources["ko"] = ko;
      break;
    case "ja":
      resources["ja"] = ja;
      break;
    case "ko":
      resources["ko"] = ko;
      break;
    case "zh_cn":
      resources["zh_cn"] = zh_cn;
      break;
    case "zh_tw":
      resources["zh_tw"] = zh_tw;
      break;
  }
  let systemLocale = electron.app.getLocale();
  if (systemLocale?.startsWith("ko"))
    systemLocale = "ko";
  if (systemLocale?.startsWith("en"))
    systemLocale = "en";
  const locale = Object.keys(resources).includes(systemLocale) ? systemLocale : langConfig || "en";
  await i18next.init(
    {
      lng: locale,
      fallbackLng: "en",
      resources
    },
    (err) => {
      if (err) {
        return console.error(err);
      }
    }
  );
};
function createTray() {
  const tray = new electron.Tray(electron.nativeImage.createFromPath(icon));
  const showWin = () => {
    try {
      const windows = electron.BrowserWindow.getAllWindows();
      windows.forEach((win) => {
        if (win.isMinimized()) {
          win.restore();
        } else {
          win.show();
        }
        win.focus();
        win.center();
      });
    } catch {
    }
  };
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: i18next.t("tray.show"),
      click: () => {
        showWin();
      }
    },
    {
      label: i18next.t("tray.exit"),
      click: () => {
        const windows = electron.BrowserWindow.getAllWindows();
        windows.forEach((win) => {
          win.webContents.send("renderer-quit");
        });
      }
    }
  ]);
  tray.setToolTip("ブルアカ");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    showWin();
  });
  electron.app.on("browser-window-focus", (_event, window2) => {
    if (window2.name === "update-window") {
      contextMenu.items[1].enabled = false;
      tray.setContextMenu(contextMenu);
    }
  });
}
const MAX_RESTART_ATTEMPTS = 3;
class WorkerBus {
  workers;
  workerRestartAttempts = /* @__PURE__ */ new Map();
  static instance;
  constructor() {
    this.workers = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    if (!WorkerBus.instance) {
      WorkerBus.instance = new WorkerBus();
    }
    return WorkerBus.instance;
  }
  // 注册 Worker
  registerWorker(workerName, worker, globalChannels = []) {
    console.log(`Registering worker ${workerName}`);
    return new Promise((resolve, reject) => {
      if (this.workers.has(workerName)) {
        return reject(new Error(`Worker ${workerName} already registered`));
      }
      this.workers.set(workerName, {
        worker,
        globalChannels: new Set(globalChannels)
      });
      worker.on("message", (message) => {
        if (message.channel === types.BusMessageType.WORKER_BUS_MESSAGE) {
          this.handleWorkerMessage(message.data);
        }
      });
      worker.on("error", (err) => this.handleWorkerError(workerName, err));
      worker.on("online", () => {
        console.log(`Worker ${workerName} is online`);
        resolve(true);
      });
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker ${workerName} stopped with exit code ${code}`);
          this.restartWorker(workerName).catch((err) => {
            console.error(`Failed to restart worker ${workerName}:`, err);
          });
        }
      });
      this.registerMessage(workerName, globalChannels);
    });
  }
  // 注册 on message
  registerMessage(workerName, channels) {
    const workerInfo = this.workers.get(workerName);
    if (!workerInfo)
      return;
    channels.forEach((channel) => {
      workerInfo.globalChannels.add(channel);
    });
  }
  // 注销 Worker
  unregisterWorker(workerName) {
    const workerInfo = this.workers.get(workerName);
    if (!workerInfo)
      return;
    workerInfo.worker.terminate();
    this.workers.delete(workerName);
  }
  // 处理 Worker 消息
  handleWorkerMessage(message) {
    this.workers.forEach((workerInfo) => {
      if (workerInfo.globalChannels.has(message.type)) {
        workerInfo.worker.postMessage?.(message);
      }
    });
  }
  handleWorkerError(workerName, err) {
    console.error(`Worker ${workerName} error:`, err);
    this.restartWorker(workerName).catch(console.error);
  }
  async restartWorker(workerName) {
    const attempts = this.workerRestartAttempts.get(workerName) || 0;
    if (attempts >= MAX_RESTART_ATTEMPTS) {
      console.error(`Max restart attempts reached for worker ${workerName}`);
      this.unregisterWorker(workerName);
      return;
    }
    const workerInfo = this.workers.get(workerName);
    if (!workerInfo) {
      throw new Error(`Worker ${workerName} not found`);
    }
    try {
      await workerInfo.worker.terminate();
      const newWorker = new worker_threads.Worker(workerInfo.worker.constructor.name);
      await this.registerWorker(workerName, newWorker, Array.from(workerInfo.globalChannels));
      this.workerRestartAttempts.delete(workerName);
      console.log(`Worker ${workerName} restarted successfully`);
    } catch (err) {
      console.error(`Failed to restart worker ${workerName}:`, err);
      this.workerRestartAttempts.set(workerName, attempts + 1);
      throw err;
    }
  }
}
function CreateLogReporter(options) {
  return new node_worker_threads.Worker(require.resolve("./logReport-600fb64e.js"), options);
}
const requestLogger = async () => {
  const res = await Axios({
    method: "get",
    url: "/api/launcher/advanced/config"
  });
  return res.data;
};
const requestLoggerConfig = async () => {
  const res = await Axios({
    method: "get",
    url: "/api/open/api/config"
  });
  return res.data;
};
function createWorkerLogReporter() {
  const logDirPath = pathModule.join(electron.app.getPath("userData"), config.logDirName);
  const PROJECT_NAME = "yostar-oversea-launcher-logging";
  const LOG_STORE_NAME = "oversea-launcher";
  const GAME_ID = "BlueArchive_JP";
  const TAG_SOURCE = `${GAME_ID}-${"production"}-${electron.app.getVersion()}`;
  const endpoint = "https://ap-southeast-1.log.aliyuncs.com";
  const workerLogReporter = CreateLogReporter({
    workerData: {
      endpoint,
      TAG_SOURCE,
      PROJECT_NAME,
      LOG_STORE_NAME,
      logDirPath
    }
  });
  workerLogReporter.on("message", async (data) => {
    if (data.type === types.ELogReportMessageType.REQUEST_CONFIG) {
      try {
        const logRes = await requestLogger();
        if (!logRes?.log_upload) {
          workerLogReporter.postMessage({
            type: types.ELogReportMessageType.RESPONSE_CONFIG,
            data: { accessKeyId: "", secretAccessKey: "", securityToken: "" }
          });
          return;
        }
        const res = await requestLoggerConfig();
        const accessKeyId = res?.AccessKeyId;
        const secretAccessKey = res?.AccessKeySecret;
        const securityToken = res?.SecurityToken;
        workerLogReporter.postMessage({
          type: types.ELogReportMessageType.RESPONSE_CONFIG,
          data: { accessKeyId, secretAccessKey, securityToken }
        });
      } catch {
        workerLogReporter.postMessage({
          type: types.ELogReportMessageType.RESPONSE_CONFIG,
          data: { accessKeyId: "", secretAccessKey: "", securityToken: "" }
        });
      }
    }
  });
  return workerLogReporter;
}
function startThreads() {
  const workerBus = WorkerBus.getInstance();
  const workerLogger2 = createWorkerLogger();
  const workerLogReporter = createWorkerLogReporter();
  workerBus.registerWorker("local-logger", workerLogger2, [types.EWorkerLoggerType.LOG]);
  workerBus.registerWorker("log-reporter", workerLogReporter, []);
  workerBus.registerWorker("game-downloader", workerDownloader, []);
}
system();
globalEvent();
updateEvent();
ipcEvent();
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.yo-star-launcher.BlueArchive_JP");
  electron.session.defaultSession.setProxy({ mode: "system" });
  electron.app.on("browser-window-created", (_, window2) => {
    utils.optimizer.watchWindowShortcuts(window2);
  });
  locales();
  createTray();
  createWindow();
  startThreads();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
