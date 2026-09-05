import { u as useView, b as useClient, s as storeToRefs, l as lodashExports, r as requestGameInfo, L as LocalStorageUtil, v as versionCompare, d as handleNeedUpdate, c as checkGame } from "./main-2b0108e0.js";
import { d as defineComponent, J as useI18n, r as ref, H as onMounted, c as createElementBlock, b as createBaseVNode, t as toDisplayString, u as unref, o as openBlock, L as pushScopeId, N as popScopeId, _ as _export_sfc } from "./windowDrag-a6baf7c9.js";
const _imports_0 = "" + new URL("btn_site-4c6ed9f1.png", import.meta.url).href;
const _imports_1 = "" + new URL("btn_site_h-d7121448.png", import.meta.url).href;
const _imports_2 = "" + new URL("btn_start-b353e68f.png", import.meta.url).href;
const _imports_3 = "" + new URL("btn_start_h-a0fdb2a2.png", import.meta.url).href;
const _withScopeId = (n) => (pushScopeId("data-v-40243fe2"), n = n(), popScopeId(), n);
const _hoisted_1 = { class: "game-control-container" };
const _hoisted_2 = { class: "game-version" };
const _hoisted_3 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("img", {
  class: "control-btn",
  src: _imports_0,
  draggable: "false"
}, null, -1));
const _hoisted_4 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("img", {
  class: "control-btn-hover",
  src: _imports_1,
  draggable: "false"
}, null, -1));
const _hoisted_5 = [
  _hoisted_3,
  _hoisted_4
];
const _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("img", {
  class: "control-btn",
  src: _imports_2,
  draggable: "false"
}, null, -1));
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("img", {
  class: "control-btn-hover",
  src: _imports_3,
  draggable: "false"
}, null, -1));
const _hoisted_8 = [
  _hoisted_6,
  _hoisted_7
];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GameControl",
  setup(__props) {
    const { t } = useI18n();
    const { dispatchViewState } = useView();
    const clientStore = useClient();
    const { dispatchClientState } = clientStore;
    const { clientState } = storeToRefs(clientStore);
    const loadingStartGame = ref(false);
    const handleGameStart = lodashExports.debounce(async () => {
      if (loadingStartGame.value)
        return;
      loadingStartGame.value = true;
      try {
        const res = await requestGameInfo();
        const downloadPath = LocalStorageUtil.getItem("downloadPath") || "";
        if (!downloadPath) {
          dispatchClientState({
            gameVersion: ""
          });
          dispatchViewState("menu");
          loadingStartGame.value = false;
          return;
        }
        const gameConfig = await window.api.invoke("handle-check-game", downloadPath);
        if (!gameConfig?.version || !gameConfig?.name) {
          dispatchViewState("menu");
          loadingStartGame.value = false;
          return;
        }
        const needUpdate = versionCompare(gameConfig?.version, res?.game_lowest_version) === -1;
        if (needUpdate) {
          handleNeedUpdate();
        } else {
          await window.api.invoke("handle-game-start", {
            path: downloadPath,
            name: gameConfig.name,
            params: gameConfig.params || []
          });
        }
      } catch {
      }
      loadingStartGame.value = false;
    }, 500);
    const handleOpenOfficialWebsite = () => {
      window.api.send("open-external-url", "https://bluearchive.jp");
    };
    onMounted(async () => {
      const path = LocalStorageUtil.getItem("downloadPath") || "";
      const haveGame = await checkGame(path);
      if (!haveGame) {
        dispatchViewState("menu");
      } else {
        dispatchViewState("control");
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("p", _hoisted_2, toDisplayString(unref(t)("download.version") + unref(clientState).gameVersion), 1),
        createBaseVNode("div", {
          class: "button-order-wrapper hoverable",
          onClick: handleOpenOfficialWebsite
        }, _hoisted_5),
        createBaseVNode("div", {
          class: "button-order-wrapper hoverable",
          onClick: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => unref(handleGameStart) && unref(handleGameStart)(...args))
        }, _hoisted_8)
      ]);
    };
  }
});
const GameControl_vue_vue_type_style_index_0_scoped_40243fe2_lang = "";
const GameControl = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-40243fe2"]]);
export {
  GameControl as default
};
