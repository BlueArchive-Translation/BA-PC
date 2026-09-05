"use strict";
const ALY = require("aliyun-sdk");
const fsExtra = require("fs-extra");
const pathModule = require("node:path");
const os = require("node:os");
const config = require("./config-1bcf7a0b.js");
const node_worker_threads = require("node:worker_threads");
const types = require("./types-26321524.js");
async function requestConfig() {
  return new Promise((resolve) => {
    node_worker_threads.parentPort?.on("message", (data) => {
      if (data.type === types.ELogReportMessageType.RESPONSE_CONFIG) {
        resolve(data.data);
        return;
      }
      resolve(null);
    });
    node_worker_threads.parentPort?.postMessage({
      type: types.ELogReportMessageType.REQUEST_CONFIG
    });
  });
}
class LogReporter {
  SLS;
  TAG_SOURCE;
  endpoint;
  PROJECT_NAME;
  LOG_STORE_NAME;
  scanTimer = null;
  logDirPath = "";
  SCAN_INTERVAL = 1e3;
  macInfo = null;
  constructor(options) {
    this.endpoint = options.endpoint;
    this.TAG_SOURCE = options.TAG_SOURCE;
    this.PROJECT_NAME = options.PROJECT_NAME;
    this.LOG_STORE_NAME = options.LOG_STORE_NAME;
    this.logDirPath = options.logDirPath;
    this.macInfo = this.getMacAddress();
    this.startLogScanner();
  }
  async initialSLS() {
    console.log("=> ali sls initial");
    try {
      const config2 = await requestConfig();
      if (!config2) {
        return false;
      }
      this.SLS = new ALY.SLS({
        accessKeyId: config2.accessKeyId,
        secretAccessKey: config2.secretAccessKey,
        securityToken: config2.securityToken,
        endpoint: this.endpoint,
        apiVersion: "2015-06-01"
      });
      return true;
    } catch (error) {
      this.SLS = null;
    }
    return false;
  }
  startLogScanner() {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
    }
    const scan = async () => {
      try {
        await this.scanAndReport();
      } catch (error) {
        console.error("Log scan error:", error);
      } finally {
        this.scanTimer = setTimeout(scan, this.SCAN_INTERVAL);
      }
    };
    this.scanTimer = setTimeout(scan, this.SCAN_INTERVAL);
  }
  getCurrentLogFilePaths() {
    const files = fsExtra.readdirSync(this.logDirPath);
    const pattern = new RegExp(`^${config.TO_BE_REPORTED_LOG_PREFIX}-(\\d+)\\.json$`);
    const matchedFile = files.filter((file) => {
      return pattern.test(file);
    });
    return matchedFile || [];
  }
  async scanAndReport() {
    const newLogFilePath = this.getCurrentLogFilePaths();
    try {
      for (const file of newLogFilePath) {
        const filePath = pathModule.join(this.logDirPath, file);
        let success = false;
        if (fsExtra.existsSync(filePath)) {
          const logStr = fsExtra.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
          try {
            const logArr = JSON.parse(logStr);
            const logs = logArr.map((item) => {
              return Object.entries(item).map(([key, value]) => {
                return { key, value };
              });
            });
            let currentIndex = 0;
            success = true;
            while (currentIndex < logs.length) {
              const currentLoopLogs = logs.slice(currentIndex, currentIndex + 4096);
              currentIndex += 4096;
              const currentRes = await this.writeLog(currentLoopLogs);
              if (!currentRes)
                success = false;
            }
          } catch (error) {
            success = await this.writeLog([
              [
                { key: "message", value: `${error}` },
                { key: "prefix", value: "report worker parse log error" },
                { key: "log", value: logStr }
              ]
            ]);
          }
          if (success)
            fsExtra.removeSync(filePath);
        }
      }
      return true;
    } catch {
    }
    return false;
  }
  getParams(data) {
    return {
      projectName: this.PROJECT_NAME,
      logStoreName: this.LOG_STORE_NAME,
      logGroup: {
        logs: data.map((item) => {
          const time = item.find((timeItem) => timeItem.key === "time")?.value || Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
          return {
            time,
            contents: [
              ...item,
              {
                key: "mac",
                value: this.macInfo || "undefined"
              }
            ]
          };
        }),
        topic: "vv",
        source: this.TAG_SOURCE
      }
    };
  }
  async writeLog(data) {
    return new Promise((resolve) => {
      if (!this.SLS) {
        this.initialSLS().then(() => {
          resolve(false);
        });
        return;
      }
      try {
        const param = this.getParams(data);
        this.SLS.putLogs(param, (err) => {
          if (err) {
            this.initialSLS().then(() => {
              resolve(false);
            });
            console.error("=> ali sls put logs error: ", err);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        return resolve(false);
      }
    });
  }
  getMacAddress() {
    const networkInterfaces = os.networkInterfaces();
    const virtualMacPrefixes = [
      "00:50:56",
      // VMware
      "00:15:5d",
      // Hyper-V
      "08:00:27",
      // VirtualBox
      "02:42"
      // Docker
    ];
    for (const name in networkInterfaces) {
      const configArr = networkInterfaces[name];
      if (!configArr?.length)
        continue;
      for (const config2 of configArr) {
        if (!config2.internal && config2.mac && config2.mac !== "00:00:00:00:00:00" && !virtualMacPrefixes.some((prefix) => config2.mac.startsWith(prefix))) {
          return config2.mac;
        }
      }
    }
    return null;
  }
}
(() => {
  const { endpoint, TAG_SOURCE, PROJECT_NAME, LOG_STORE_NAME, logDirPath } = node_worker_threads.workerData;
  if (!endpoint || !TAG_SOURCE || !PROJECT_NAME || !LOG_STORE_NAME || !logDirPath) {
    throw new Error("accessKeyId or secretAccessKey or securityToken or endpoint is empty");
  }
  new LogReporter({
    endpoint,
    TAG_SOURCE,
    PROJECT_NAME,
    LOG_STORE_NAME,
    logDirPath
  });
})();
