import { d as defineComponent, k as computed, c as createElementBlock, b as createBaseVNode, U as normalizeStyle, n as normalizeClass, o as openBlock, _ as _export_sfc } from "./windowDrag-a6baf7c9.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProgressBar",
  props: {
    progress: { default: 0 }
  },
  setup(__props) {
    const props = __props;
    const isDynamic = computed(() => props.progress === -1);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["progress-bar", { dynamic: isDynamic.value }])
      }, [
        createBaseVNode("div", {
          class: "progress-bar-done",
          style: normalizeStyle(`width: ${isDynamic.value ? 100 : props.progress || 0}%`)
        }, null, 4)
      ], 2);
    };
  }
});
const ProgressBar_vue_vue_type_style_index_0_scoped_23927ea3_lang = "";
const ProgressBar = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-23927ea3"]]);
export {
  ProgressBar as P
};
