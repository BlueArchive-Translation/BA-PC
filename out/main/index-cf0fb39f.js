"use strict";
const worker_threads = require("worker_threads");
const winston = require("winston");
const Transport = require("winston-transport");
const pathModule = require("node:path");
const fsExtra = require("fs-extra");
const config = require("./config-1bcf7a0b.js");
const types = require("./types-26321524.js");
class FileRotateTransport extends Transport {
  rotationTimer;
  timerDelay = 5e3;
  currentLogFilePath = "";
  logDirPath = "";
  constructor(options) {
    super(options);
    this.logDirPath = options.dirname || "";
    this.currentLogFilePath = pathModule.join(options.dirname || "", options.filename || "");
    this.on("finish", () => {
      clearTimeout(this.rotationTimer);
    });
    if (options.immediateRotate) {
      this.rotateLog();
    }
  }
  log(info, callback) {
    clearTimeout(this.rotationTimer);
    try {
      fsExtra.writeFileSync(
        this.currentLogFilePath,
        `====== [${this.getOccurrenceTime()}] [${info.level}] ======
[prefix]:${info.prefix}
${info.message}
`,
        { encoding: "utf-8", mode: 511, flag: "a" }
      );
    } catch {
      this.emit("error");
    }
    const currentSize = fsExtra.statSync(this.currentLogFilePath).size;
    if (currentSize > 1024 * 1024) {
      this.rotateLog();
    } else {
      this.setupRotation();
    }
    callback();
    this.emit("logged", info);
  }
  setupRotation() {
    this.rotationTimer = setTimeout(this.rotateLog.bind(this), this.timerDelay);
  }
  rotateLog() {
    const timestamp = Date.now().toString();
    const newLogPath = pathModule.join(this.logDirPath, `${config.TO_BE_REPORTED_LOG_PREFIX}-${timestamp}.json`);
    const logArr = this.parseLogContent();
    if (logArr.length) {
      fsExtra.writeFileSync(this.currentLogFilePath, "", {
        encoding: "utf-8",
        mode: 511,
        flag: "w"
      });
      fsExtra.writeFileSync(newLogPath, JSON.stringify(logArr, null, 2), {
        encoding: "utf-8",
        mode: 511,
        flag: "w"
      });
    }
  }
  getOccurrenceTime() {
    return Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
  }
  parseLogContent() {
    const logRegex = /={6}\s\[([^\]]+)\]\s\[(\w+)\]\s={6}\n\[prefix\]:([^\n]*)\n([\s\S]*?)(?=\n={6}|$)/g;
    const rotateLogStr = fsExtra.readFileSync(this.currentLogFilePath, {
      encoding: "utf-8",
      flag: "r"
    });
    const parsedLogs = [];
    let match;
    while ((match = logRegex.exec(rotateLogStr)) !== null) {
      const [, time, level, prefix, message] = match;
      let msg = message;
      if (msg.length > 3 * 1024 * 1024)
        msg = msg.slice(0, 3 * 1024 * 1024);
      parsedLogs.push({
        time,
        level,
        prefix,
        message: msg.trim()
      });
    }
    return parsedLogs;
  }
}
let logDirPath = "";
(() => {
  let logger;
  const cacheList = [];
  worker_threads.parentPort?.on("message", (message) => {
    if (message.type === types.EWorkerLoggerType.INIT) {
      const { logDirPath: dirPath } = message.payload;
      logDirPath = dirPath;
      fsExtra.ensureDirSync(logDirPath);
      logger = winston.createLogger({
        level: "silly",
        exitOnError: false,
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.printf(({ level, message: message2, timestamp, prefix }) => {
                return `=> ${level} [${prefix}] [${timestamp}] 
${message2}
`;
              })
            )
          }),
          new FileRotateTransport({
            dirname: logDirPath,
            filename: config.RUNNING_LOG_NAME,
            handleExceptions: true,
            zippedArchive: false
          })
        ]
      });
    } else if (message.type === types.EWorkerLoggerType.LOG) {
      const { level, prefix, message: msg } = message.payload;
      cacheList.push({ level, prefix, msg });
      if (logger) {
        cacheList.forEach((item) => {
          logger.log(item.level, item.msg, { prefix: item.prefix });
        });
        cacheList.length = 0;
      }
    }
  });
})();
