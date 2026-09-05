"use strict";
var EWorkerLoggerType = /* @__PURE__ */ ((EWorkerLoggerType2) => {
  EWorkerLoggerType2["LOG"] = "__log__";
  EWorkerLoggerType2["INIT"] = "__init__";
  return EWorkerLoggerType2;
})(EWorkerLoggerType || {});
var ELogReportMessageType = /* @__PURE__ */ ((ELogReportMessageType2) => {
  ELogReportMessageType2["REQUEST_CONFIG"] = "__request_config__";
  ELogReportMessageType2["RESPONSE_CONFIG"] = "__response_config__";
  return ELogReportMessageType2;
})(ELogReportMessageType || {});
var BusMessageType = /* @__PURE__ */ ((BusMessageType2) => {
  BusMessageType2["WORKER_BUS_MESSAGE"] = "__worker_bus_message__";
  return BusMessageType2;
})(BusMessageType || {});
exports.BusMessageType = BusMessageType;
exports.ELogReportMessageType = ELogReportMessageType;
exports.EWorkerLoggerType = EWorkerLoggerType;
