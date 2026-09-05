import { o as openBlock, c as createElementBlock, b as createBaseVNode, d as defineComponent, r as ref, J as useI18n, w as watch, H as onMounted, Z as onUnmounted, t as toDisplayString, u as unref, e as createVNode, T as createTextVNode, a8 as withDirectives, ab as vShow, _ as _export_sfc } from "./windowDrag-a6baf7c9.js";
import { I as IconLoading } from "./loading1-b0246f70.js";
import { a as useDownload, s as storeToRefs, u as useView, b as useClient, L as LocalStorageUtil, h as handleDownloadGame } from "./main-2b0108e0.js";
import { P as ProgressBar } from "./ProgressBar-deae07b3.js";
const _hoisted_1$4 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "28",
  height: "28"
};
function render$3(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$4, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "none",
      "fill-rule": "evenodd"
    }, [
      createBaseVNode("circle", {
        cx: "14",
        cy: "14",
        r: "14",
        fill: "#EBEDF1"
      }),
      createBaseVNode("rect", {
        width: "3",
        height: "12",
        x: "9",
        y: "8",
        fill: "#A5A8B3",
        rx: "1.5"
      }),
      createBaseVNode("rect", {
        width: "3",
        height: "12",
        x: "16",
        y: "8",
        fill: "#A5A8B3",
        rx: "1.5"
      })
    ], -1)
  ]));
}
const IconPause = { render: render$3 };
const _hoisted_1$3 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "28",
  height: "28"
};
function render$2(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$3, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "none",
      "fill-rule": "evenodd"
    }, [
      createBaseVNode("circle", {
        cx: "14",
        cy: "14",
        r: "14",
        fill: "#DFE1E7"
      }),
      createBaseVNode("rect", {
        width: "3",
        height: "12",
        x: "9",
        y: "8",
        fill: "#A5A8B3",
        rx: "1.5"
      }),
      createBaseVNode("rect", {
        width: "3",
        height: "12",
        x: "16",
        y: "8",
        fill: "#A5A8B3",
        rx: "1.5"
      })
    ], -1)
  ]));
}
const IconPauseH = { render: render$2 };
const _hoisted_1$2 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "28",
  height: "28"
};
function render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$2, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "none",
      "fill-rule": "evenodd"
    }, [
      createBaseVNode("circle", {
        cx: "14",
        cy: "14",
        r: "14",
        fill: "#EBEDF1"
      }),
      createBaseVNode("path", {
        fill: "#A5A8B3",
        d: "m18.644 14.76-5.57 4.925a1.33 1.33 0 0 1-1.718 0 1.01 1.01 0 0 1-.356-.76v-9.85C11 8.48 11.544 8 12.215 8a1.3 1.3 0 0 1 .859.315l5.57 4.925a.99.99 0 0 1 0 1.52"
      })
    ], -1)
  ]));
}
const IconPlay = { render: render$1 };
const _hoisted_1$1 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "28",
  height: "28"
};
function render(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$1, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "none",
      "fill-rule": "evenodd"
    }, [
      createBaseVNode("circle", {
        cx: "14",
        cy: "14",
        r: "14",
        fill: "#DFE1E7"
      }),
      createBaseVNode("path", {
        fill: "#A5A8B3",
        d: "m18.644 14.76-5.57 4.925a1.33 1.33 0 0 1-1.718 0 1.01 1.01 0 0 1-.356-.76v-9.85C11 8.48 11.544 8 12.215 8a1.3 1.3 0 0 1 .859.315l5.57 4.925a.99.99 0 0 1 0 1.52"
      })
    ], -1)
  ]));
}
const IconPlayH = { render };
const _hoisted_1 = { class: "download-process-container" };
const _hoisted_2 = { class: "download-process-head" };
const _hoisted_3 = { class: "download-process-head-space" };
const _hoisted_4 = { class: "download-process-main" };
const _hoisted_5 = { class: "download-process-main-left" };
const _hoisted_6 = { class: "download-process-main-tips" };
const _hoisted_7 = { class: "download-process-tips-left" };
const _hoisted_8 = { class: "tips-span" };
const _hoisted_9 = { class: "tips-span" };
const _hoisted_10 = { class: "download-process-tips-right" };
const _hoisted_11 = { class: "download-action-box" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Download",
  setup(__props) {
    const donePercent = ref(0);
    const doneMem = ref("0");
    const totalMem = ref("0");
    const doneSpeed = ref("0KB/S");
    const estimatedTime = ref("0s");
    const { t } = useI18n();
    const downloadStore = useDownload();
    const { dispatchDownloadTask } = downloadStore;
    const { downloadTask } = storeToRefs(downloadStore);
    const { dispatchViewState } = useView();
    const clientStore = useClient();
    const { clientState } = storeToRefs(clientStore);
    const taskInfo = LocalStorageUtil.getItem("download-task");
    if (taskInfo?.lastProgress)
      donePercent.value = taskInfo.lastProgress;
    const handleComplete = () => {
      LocalStorageUtil.removeItem("download-task");
      dispatchDownloadTask({ state: "idle" });
      dispatchViewState("progress");
    };
    const handleDownloadProgress = (data) => {
      if (downloadTask.value.state === "downloading") {
        doneMem.value = data.downloadedSize;
        totalMem.value = data.downloadTotalSize;
        doneSpeed.value = data.speed;
        estimatedTime.value = data.estimated;
        donePercent.value = data.progress;
        if (donePercent.value > 100)
          donePercent.value = 100;
      }
    };
    watch(
      () => donePercent.value,
      () => {
        const taskCurrent = LocalStorageUtil.getItem("download-task");
        if (!taskCurrent)
          return;
        LocalStorageUtil.setItem("download-task", { ...taskCurrent, lastProgress: donePercent.value });
      }
    );
    const handleStop = () => {
      window.api.invoke("handle-stop-download");
      dispatchDownloadTask({ state: "paused" });
      doneSpeed.value = "--";
      estimatedTime.value = "--";
    };
    window.api.receive("game-download-progress", handleDownloadProgress);
    window.api.receive("game-download-done", handleComplete);
    window.api.receive("shut-down-download", handleStop);
    onMounted(() => {
      dispatchViewState("download");
    });
    onUnmounted(() => {
      window.api.removeReceive("game-download-progress");
      window.api.removeReceive("game-download-done");
      window.api.removeReceive("shut-down-download");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("p", _hoisted_3, toDisplayString(unref(t)("download.download-tips")) + " " + toDisplayString(donePercent.value) + "% (" + toDisplayString(doneMem.value) + "/" + toDisplayString(totalMem.value) + ") ", 1)
        ]),
        createBaseVNode("div", _hoisted_4, [
          createBaseVNode("div", _hoisted_5, [
            createVNode(ProgressBar, {
              class: "download-process-bar",
              progress: donePercent.value
            }, null, 8, ["progress"]),
            createBaseVNode("div", _hoisted_6, [
              createBaseVNode("div", _hoisted_7, [
                createTextVNode(toDisplayString(unref(t)("download.speed")) + " ", 1),
                createBaseVNode("span", _hoisted_8, toDisplayString(doneSpeed.value), 1),
                createTextVNode(" " + toDisplayString(unref(t)("download.remaining")) + " ", 1),
                createBaseVNode("span", _hoisted_9, toDisplayString(estimatedTime.value), 1)
              ]),
              createBaseVNode("div", _hoisted_10, toDisplayString(unref(t)("download.version")) + toDisplayString(unref(clientState).gameVersion), 1)
            ])
          ]),
          createBaseVNode("div", _hoisted_11, [
            withDirectives(createBaseVNode("div", {
              class: "download-process-action",
              onClick: handleStop
            }, [
              createVNode(unref(IconPause)),
              createVNode(unref(IconPauseH), { class: "hover" })
            ], 512), [
              [vShow, unref(downloadTask).state === "downloading"]
            ]),
            withDirectives(createBaseVNode("div", {
              class: "download-process-action",
              onClick: _cache[0] || (_cache[0] = () => unref(handleDownloadGame)())
            }, [
              createVNode(unref(IconPlay)),
              createVNode(unref(IconPlayH), { class: "hover" })
            ], 512), [
              [vShow, unref(downloadTask).state === "paused"]
            ]),
            withDirectives(createBaseVNode("div", null, [
              createVNode(unref(IconLoading), { class: "loading" })
            ], 512), [
              [vShow, unref(downloadTask).state === "loading"]
            ])
          ])
        ])
      ]);
    };
  }
});
const Download_vue_vue_type_style_index_0_scoped_ece5fcd4_lang = "";
const Download = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ece5fcd4"]]);
export {
  Download as default
};
