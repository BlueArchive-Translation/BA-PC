import { d as defineComponent, J as useI18n, r as ref, H as onMounted, Z as onUnmounted, c as createElementBlock, b as createBaseVNode, t as toDisplayString, u as unref, V as createCommentVNode, a8 as withDirectives, ab as vShow, e as createVNode, T as createTextVNode, o as openBlock, _ as _export_sfc } from "./windowDrag-a6baf7c9.js";
import { I as IconLoading } from "./loading1-b0246f70.js";
import { P as ProgressBar } from "./ProgressBar-deae07b3.js";
import { a as useDownload, u as useView, b as useClient, s as storeToRefs, L as LocalStorageUtil } from "./main-2b0108e0.js";
const _hoisted_1 = { class: "install-process-container" };
const _hoisted_2 = { class: "install-process-head" };
const _hoisted_3 = { class: "install-process-head-space" };
const _hoisted_4 = { key: 0 };
const _hoisted_5 = { class: "install-process-main" };
const _hoisted_6 = { class: "install-process-main-left" };
const _hoisted_7 = { class: "install-process-main-tips" };
const _hoisted_8 = { class: "download-process-tips-left" };
const _hoisted_9 = { key: 0 };
const _hoisted_10 = { class: "tips-span" };
const _hoisted_11 = { key: 1 };
const _hoisted_12 = { class: "tips-span" };
const _hoisted_13 = { class: "install-process-tips-right" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Progress",
  setup(__props) {
    const { t } = useI18n();
    const { dispatchDownloadTask } = useDownload();
    const { dispatchViewState } = useView();
    const clientstore = useClient();
    const { clientState } = storeToRefs(clientstore);
    const progressState = ref("");
    const installProgress = ref(0);
    const installSpeed = ref("");
    const installRemaining = ref("");
    const handleComplete = () => {
      LocalStorageUtil.removeItem("download-task");
      dispatchDownloadTask({ state: "idle" });
      dispatchViewState("control");
    };
    const handleProgress = (data) => {
      if (data.state !== progressState.value)
        progressState.value = data.state;
      if (data.progress > 100)
        data.progress = 100;
      installProgress.value = data.progress;
      if (data.speed)
        installSpeed.value = data.speed;
      if (data.remaining)
        installRemaining.value = data.remaining;
    };
    window.api.receive("game-install-done", handleComplete);
    window.api.receive("receive-progress", handleProgress);
    onMounted(() => {
      dispatchViewState("progress");
    });
    onUnmounted(() => {
      window.api.removeReceive("game-install-done");
      window.api.removeReceive("receive-progress");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("p", _hoisted_3, [
            progressState.value ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(unref(t)(`download.${progressState.value}`)), 1)) : createCommentVNode("", true),
            withDirectives(createBaseVNode("span", null, "(" + toDisplayString(installProgress.value.toFixed(2)) + "%)", 513), [
              [vShow, installProgress.value > 0]
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createVNode(ProgressBar, {
              class: "install-process-bar",
              progress: installProgress.value
            }, null, 8, ["progress"]),
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", _hoisted_8, [
                installSpeed.value ? (openBlock(), createElementBlock("span", _hoisted_9, [
                  createTextVNode(toDisplayString(unref(t)("download.extract-speed")) + " ", 1),
                  createBaseVNode("span", _hoisted_10, toDisplayString(installSpeed.value), 1)
                ])) : createCommentVNode("", true),
                installRemaining.value ? (openBlock(), createElementBlock("span", _hoisted_11, [
                  createTextVNode(toDisplayString(unref(t)("download.remaining")) + " ", 1),
                  createBaseVNode("span", _hoisted_12, toDisplayString(installRemaining.value), 1)
                ])) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_13, toDisplayString(unref(t)("download.version")) + toDisplayString(unref(clientState).gameVersion), 1)
            ])
          ]),
          createVNode(unref(IconLoading), { class: "icon-loading install-process-action loading" })
        ])
      ]);
    };
  }
});
const Progress_vue_vue_type_style_index_0_scoped_adc60ec9_lang = "";
const Progress = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-adc60ec9"]]);
export {
  Progress as default
};
