import { d as defineComponent, J as useI18n, r as ref, H as onMounted, c as createElementBlock, b as createBaseVNode, t as toDisplayString, u as unref, e as createVNode, X as withCtx, Y as _sfc_main$1, M as Message, o as openBlock, T as createTextVNode, _ as _export_sfc } from "./windowDrag-a6baf7c9.js";
import { u as useView, a as useDownload, b as useClient, s as storeToRefs, c as checkGame, E as Ellipsis, h as handleDownloadGame } from "./main-2b0108e0.js";
const _hoisted_1 = { class: "download-menu-container" };
const _hoisted_2 = { class: "download-menu-left" };
const _hoisted_3 = { class: "download-menu-left-head" };
const _hoisted_4 = { class: "download-menu-left-head-info" };
const _hoisted_5 = { class: "download-menu-left-head-tips" };
const _hoisted_6 = { class: "input-container" };
const _hoisted_7 = { class: "download-menu-operation" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Menu",
  setup(__props) {
    const { t } = useI18n();
    const { dispatchViewState } = useView();
    const { dispatchDownloadTask } = useDownload();
    const clientStore = useClient();
    const { dispatchClientState } = clientStore;
    const { clientState } = storeToRefs(clientStore);
    const freeSize = ref("");
    const handleGetDiskSpace = async () => {
      freeSize.value = await window.api.invoke("handle-disk-space", clientState.value.gamePath);
    };
    const handleChangePath = async () => {
      const value = await window.api.invoke("handle-choose-system-path", clientState.value.gamePath);
      if (!value)
        return;
      dispatchClientState({
        gamePath: value
      });
      handleGetDiskSpace();
    };
    const handleSelectInstalledGame = async () => {
      const value = await window.api.invoke(
        "handle-choose-system-path",
        clientState.value.gamePath,
        false
      );
      if (!value)
        return;
      const haveGame = await checkGame(value);
      if (!haveGame) {
        Message({
          title: t("message.tip"),
          content: t("message.error-detect-no-game"),
          confirmText: t("message.confirm")
        });
      } else {
        window.api.send("request-game-click-code", value);
      }
    };
    const handleDownload = () => {
      dispatchDownloadTask({ repair: false });
      handleDownloadGame();
    };
    onMounted(() => {
      checkGame(clientState.value.gamePath);
      handleGetDiskSpace();
      dispatchDownloadTask({ state: "idle" });
      dispatchViewState("menu");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("p", _hoisted_4, toDisplayString(unref(t)("download.need-space")) + toDisplayString(unref(clientState).gameSize) + "  " + toDisplayString(unref(t)("download.available-space")) + toDisplayString(freeSize.value), 1),
            createBaseVNode("p", {
              class: "download-menu-choose-game-path",
              onClick: handleSelectInstalledGame
            }, toDisplayString(unref(t)("download.select-installed-game")), 1)
          ]),
          createBaseVNode("div", {
            class: "download-menu-left-path",
            onClick: handleChangePath
          }, [
            createBaseVNode("p", _hoisted_5, toDisplayString(unref(t)("download.choose-path")), 1),
            createBaseVNode("div", _hoisted_6, [
              createVNode(Ellipsis, {
                text: unref(clientState).gamePath,
                width: "700px",
                style: { "width": "100%" }
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(clientState).gamePath || unref(t)("download.choose-path")), 1)
                ]),
                _: 1
              }, 8, ["text"])
            ]),
            createBaseVNode("span", null, toDisplayString(unref(t)("download.change")), 1)
          ])
        ]),
        createBaseVNode("div", _hoisted_7, [
          createVNode(_sfc_main$1, {
            type: "yellow",
            class: "download-menu-operation-download",
            onClick: handleDownload
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(t)("download.install")), 1)
            ]),
            _: 1
          })
        ])
      ]);
    };
  }
});
const Menu_vue_vue_type_style_index_0_scoped_fba53772_lang = "";
const Menu = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fba53772"]]);
export {
  Menu as default
};
