import { d as defineComponent, o as openBlock, c as createElementBlock, b as createBaseVNode, e as createVNode, u as unref, $ as IconMinus, a0 as IconMinusH, a1 as IconClose, _ as _export_sfc, A as Axios, r as ref, H as onMounted, a7 as resolveDirective, a8 as withDirectives, ab as vShow, S as renderSlot, n as normalizeClass, B as nextTick, J as useI18n, Z as onUnmounted, t as toDisplayString, M as Message, x as reactive, D as readonly, Q as createBlock, V as createCommentVNode, a9 as onErrorCaptured, X as withCtx, f as createApp, i as i18n, aa as windowDrag } from "./windowDrag-a6baf7c9.js";
import { P as ProgressBar } from "./ProgressBar-deae07b3.js";
window.addEventListener("error", function(event) {
  if (event.target !== window) {
    const target = event.target;
    window.api.send("ali-sls-log", "window error listener", `资源加载失败: ${target.src}`);
  } else {
    const logMsg = `${event?.message}
file:${event?.filename}
line:${event?.lineno};col:${event?.colno}`;
    window.api.send("ali-sls-log", "window error listener", `${logMsg}`);
  }
});
window.addEventListener("unhandledrejection", (event) => {
  window.api.send(
    "ali-sls-log",
    "window unhandled rejection",
    `reason: ${event?.reason?.message}
stack: ${event?.reason?.stack}`
  );
});
const _hoisted_1$3 = { id: "header" };
const _hoisted_2$1 = { id: "controller" };
const _hoisted_3 = {
  id: "btn-close",
  class: "controller-btn disable"
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "HeaderArea",
  setup(__props) {
    const handleMinimize = () => {
      window.api.send("minimize-window");
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", {
            id: "btn-minimize",
            class: "controller-btn",
            onClick: handleMinimize
          }, [
            createVNode(unref(IconMinus)),
            createVNode(unref(IconMinusH), { class: "hover" })
          ]),
          createBaseVNode("div", _hoisted_3, [
            createVNode(unref(IconClose))
          ])
        ])
      ]);
    };
  }
});
const HeaderArea_vue_vue_type_style_index_0_scoped_188e24e6_lang = "";
const Header = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-188e24e6"]]);
const requestUpdateBackground = async () => {
  const res = await Axios.get(
    `/api/launcher/installation/config`
  );
  return res.data.data;
};
const _hoisted_1$2 = ["src"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "Container",
  setup(__props) {
    const bgUrl = ref("");
    const getData = async () => {
      try {
        const res = await requestUpdateBackground();
        if (res.installer_background_img) {
          bgUrl.value = res.installer_background_img;
        }
      } catch {
      }
      nextTick(() => {
        const imgEl = window.document.querySelector("#base64-bg");
        imgEl.onerror = () => {
          bgUrl.value = "";
        };
      });
    };
    onMounted(() => {
      getData();
    });
    return (_ctx, _cache) => {
      const _directive_window_drag = resolveDirective("window-drag");
      return withDirectives((openBlock(), createElementBlock("div", {
        id: "app-container",
        class: normalizeClass({ bg: !bgUrl.value })
      }, [
        withDirectives(createBaseVNode("img", {
          id: "base64-bg",
          src: bgUrl.value
        }, null, 8, _hoisted_1$2), [
          [vShow, bgUrl.value]
        ]),
        createVNode(Header),
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 2)), [
        [_directive_window_drag]
      ]);
    };
  }
});
const Container_vue_vue_type_style_index_0_scoped_c99fe775_lang = "";
const Container = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-c99fe775"]]);
const _hoisted_1$1 = { class: "view-container" };
const _hoisted_2 = { class: "install-title" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Installing",
  setup(__props) {
    const { t } = useI18n();
    const progress = ref(0);
    const total = ref("");
    const downloaded = ref("");
    const handleInstallDone = () => {
      progress.value = 100;
      Message({
        title: t("message.tip"),
        content: t("update.downloaded"),
        closeable: false,
        confirmText: t("message.restart"),
        onConfirm() {
          window.api.send("quit-and-install");
        },
        cancelText: t("message.quit"),
        onCancel() {
          window.api.send("quit");
        }
      });
    };
    const handleInstallProcess = (t2, d, pg) => {
      total.value = t2;
      downloaded.value = d;
      progress.value = pg;
    };
    let errorFlag = false;
    const handleInstallError = (error) => {
      if (errorFlag)
        return;
      errorFlag = true;
      Message({
        title: t("message.tip"),
        content: t("initial.launcher-update-error"),
        confirmText: t("message.retry"),
        closeable: false,
        onConfirm() {
          errorFlag = false;
          window.api.invoke("handle-client-update");
        }
      });
      window.api.send("ali-sls-log", "client install error", error);
    };
    window.api.receive("client-update-download-done", handleInstallDone);
    window.api.receive("client-update-progress", handleInstallProcess);
    window.api.receive("client-update-error", handleInstallError);
    onUnmounted(() => {
      window.api.removeReceive("client-update-download-done");
      window.api.removeReceive("client-update-progress");
      window.api.removeReceive("client-update-error");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2, toDisplayString(unref(t)("update.downloading-title")) + " " + toDisplayString(progress.value) + "%" + toDisplayString(progress.value && total.value ? ` (${total.value}/${downloaded.value})` : ""), 1),
        createVNode(ProgressBar, {
          class: "process-bar",
          progress: progress.value
        }, null, 8, ["progress"])
      ]);
    };
  }
});
const Installing_vue_vue_type_style_index_0_scoped_427d6db5_lang = "";
const Installing = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-427d6db5"]]);
const storeState = reactive({
  "view-state": "installing"
});
const dispatch = (action, payload = {}) => {
  switch (action) {
    case "update-view-download-state":
      if (Object.prototype.hasOwnProperty.call(payload, "view-state"))
        storeState["view-state"] = payload["view-state"] || "installing";
      break;
  }
};
function useState() {
  return {
    state: readonly(storeState),
    dispatch
  };
}
const _hoisted_1 = { id: "view-container" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const { state } = useState();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        unref(state)["view-state"] === "installing" ? (openBlock(), createBlock(Installing, { key: 0 })) : createCommentVNode("", true)
      ]);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_d0cf5d6c_lang = "";
const View = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-d0cf5d6c"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    onErrorCaptured((err, instance, info) => {
      const inst = `name: ${instance?.$.type.__name}
file: ${instance?.$.type.__file}`;
      window.api.send("ali-sls-log", "vue error captured", `info: ${info}
error: ${err}
${inst}`);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Container, null, {
        default: withCtx(() => [
          createVNode(View)
        ]),
        _: 1
      });
    };
  }
});
const style = "";
const app = createApp(_sfc_main);
app.use(i18n);
app.directive("window-drag", windowDrag);
app.mount("#app");
