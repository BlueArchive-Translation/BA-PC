import { A as Axios, o as openBlock, c as createElementBlock, a as createStaticVNode, d as defineComponent, i as i18n, r as ref, b as createBaseVNode, t as toDisplayString, u as unref, n as normalizeClass, e as createVNode, I as IconClose$1, M as Message$2, _ as _export_sfc, f as createApp, h, g as effectScope, m as markRaw, j as toRaw, k as computed, l as isRef, p as isReactive, q as toRef, s as hasInjectionContext, v as inject, w as watch, x as reactive, y as getCurrentScope, z as onScopeDispose, B as nextTick$1, C as toRefs, D as readonly, E as shallowRef, F as shallowReactive, G as provide, H as onMounted, J as useI18n, K as withModifiers, L as pushScopeId, N as popScopeId, O as Fragment, P as renderList, Q as createBlock, R as useSlots, S as renderSlot, T as createTextVNode, U as normalizeStyle, V as createCommentVNode, W as Teleport, X as withCtx, Y as _sfc_main$c, Z as onUnmounted, $ as IconMinus, a0 as IconMinusH, a1 as IconClose$2, a2 as MessageDomUninstall, a3 as resolveDynamicComponent, a4 as onUpdated, a5 as onBeforeUnmount, a6 as onBeforeUpdate, a7 as resolveDirective, a8 as withDirectives, a9 as onErrorCaptured, aa as windowDrag } from "./windowDrag-a6baf7c9.js";
window.addEventListener("error", function(event2) {
  if (event2.target !== window) {
    const target = event2.target;
    window.api.send(
      "ali-sls-log",
      "window error listener",
      `window error handle
资源加载失败: ${target.src}`
    );
  } else {
    const logMsg = `${event2?.message}
file:${event2?.filename}
line:${event2?.lineno};col:${event2?.colno}`;
    window.api.send("ali-sls-log", "window error listener", `${logMsg}`);
  }
});
window.addEventListener("unhandledrejection", (event2) => {
  window.api.send(
    "ali-sls-log",
    "window unhandled rejection",
    `reason: ${event2?.reason?.message}
stack: ${event2?.reason?.stack}`
  );
});
const requestGameInfo = async () => {
  const res = await Axios.get("/api/launcher/game/config");
  return res.data.data;
};
const requestClientInfo = async () => {
  const res = await Axios.get(`/api/launcher/base/config`);
  return res.data.data;
};
const requestBannerAndNews = async () => {
  const res = await Axios.get("/api/launcher/operations/resource");
  return res.data.data;
};
const requestMedia = async () => {
  const res = await Axios.get("/api/launcher/social/media/resource");
  return res.data.data;
};
function versionCompare(v1 = "", v2 = "") {
  const v1Arr = v1?.split(".");
  const v2Arr = v2?.split(".");
  const len = Math.max(v1Arr?.length, v2Arr?.length);
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1Arr[i] || "0");
    const num2 = parseInt(v2Arr[i] || "0");
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}
const LocalStorageKey = [
  "download-task",
  "downloadPath",
  "close-choice",
  "close-choice-save",
  "proxy-config"
];
class LocalStorageUtil {
  static setItem(key, value) {
    if (!LocalStorageKey.includes(key))
      return void 0;
    localStorage.setItem(key, JSON.stringify(value));
  }
  static getItem(key) {
    if (!LocalStorageKey.includes(key))
      return void 0;
    const value = localStorage.getItem(key);
    let res = void 0;
    if (value) {
      try {
        res = JSON.parse(value);
      } catch {
        localStorage.removeItem(key);
      }
    }
    return res;
  }
  static removeItem(key) {
    if (!LocalStorageKey.includes(key))
      return void 0;
    localStorage.removeItem(key);
  }
  static clear() {
    localStorage.clear();
  }
}
const DATABASE_NAME = "launcher-db";
const DATABASE_VERSION = 2;
function useIDB(databaseName) {
  return {
    async get(hash) {
      return new Promise((resolve, reject) => {
        if (!hash) {
          resolve({ hash: "", base64: "" });
          return;
        }
        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onerror = () => reject(new Error("数据库打开报错"));
        request.onupgradeneeded = function(_event) {
          const db = request.result;
          if (!db.objectStoreNames.contains(databaseName)) {
            db.createObjectStore(databaseName, { keyPath: "hash" });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          try {
            const transaction = db.transaction([databaseName], "readonly");
            const objectStore = transaction.objectStore(databaseName);
            const objRequest = objectStore.get(hash);
            objRequest.onerror = function(_event) {
              reject(new Error("数据库查询报错"));
            };
            objRequest.onsuccess = function(_event) {
              resolve(objRequest.result);
              db.close();
            };
          } catch (error) {
            resolve({
              hash: "",
              base64: ""
            });
          }
        };
      });
    },
    async getALL() {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onerror = () => reject(new Error("数据库打开报错"));
        request.onupgradeneeded = function(_event) {
          const db = request.result;
          if (!db.objectStoreNames.contains(databaseName)) {
            db.createObjectStore(databaseName, { keyPath: "hash" });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([databaseName], "readonly");
          const objectStore = transaction.objectStore(databaseName);
          const objRequest = objectStore.getAll();
          objRequest.onerror = function(_event) {
            reject(new Error("数据库查询报错"));
          };
          objRequest.onsuccess = function(_event) {
            resolve(objRequest.result[0]);
            db.close();
          };
        };
      });
    },
    async set(hash, base64) {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onerror = () => reject(new Error("数据库打开报错"));
        request.onupgradeneeded = function(_event) {
          const db = request.result;
          if (!db.objectStoreNames.contains(databaseName)) {
            db.createObjectStore(databaseName, { keyPath: "hash" });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([databaseName], "readwrite");
          const objectStore = transaction.objectStore(databaseName);
          objectStore.clear();
          const objRequest = objectStore.put({ hash, base64 });
          objRequest.onerror = function(_event) {
            reject(new Error("数据库写入报错"));
          };
          objRequest.onsuccess = function(_event) {
            resolve(objRequest.result);
            db.close();
          };
        };
      });
    }
  };
}
const _hoisted_1$C = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "18",
  height: "18"
};
function render$s(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$C, _cache[0] || (_cache[0] = [
    createStaticVNode('<g fill="none" fill-rule="evenodd"><circle cx="9" cy="9" r="9" fill="#FFF"></circle><path d="M4.154 4.154h9.692v9.692H4.154z"></path><g fill="#675700" fill-rule="nonzero"><path d="M5.766 9.35a3.19 3.19 0 0 1 1.998-3.478 3.19 3.19 0 0 1 3.01.374l-.687 1.112 3.087-.012-1.104-3.192-.565.913c-1.192-.77-2.817-1.022-4.24-.469A4.56 4.56 0 0 0 4.385 9.35zM12.234 8.555a3.19 3.19 0 0 1-1.997 3.478 3.26 3.26 0 0 1-2.875-.275l.622-1.005-3.32-.194 1.405 3.287.589-.95a4.43 4.43 0 0 0 4.076.411 4.56 4.56 0 0 0 2.882-4.752z"></path></g></g>', 1)
  ]));
}
const IconUpdating = { render: render$s };
const _hoisted_1$B = { id: "update-message-container" };
const _hoisted_2$7 = { id: "message-body" };
const _hoisted_3$5 = { id: "message-title" };
const _hoisted_4$5 = { id: "message-content" };
const _hoisted_5$3 = { id: "message-content-version" };
const _hoisted_6$3 = { id: "message-update-button" };
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "UpdateMessage",
  props: {
    type: { default: "ready" },
    title: {},
    content: { default: "" },
    version: {},
    onConfirm: {},
    onClose: {}
  },
  emits: ["confirm", "close"],
  setup(__props, { emit }) {
    const props = __props;
    const { t } = i18n.global;
    const isUpdating = ref(false);
    const handleConfirm = () => {
      if (isUpdating.value)
        return;
      isUpdating.value = true;
      window.api.invoke("handle-client-update");
      emit("confirm");
    };
    const handleClose = () => {
      if (isUpdating.value) {
        Message$2({
          title: t("message.tip"),
          content: t("install.close-tips"),
          confirmText: t("install.confirm"),
          cancelText: t("install.cancel"),
          onConfirm: () => {
            window.api.send("close-window");
          }
        }).catch();
      } else {
        emit("close");
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$B, [
        createBaseVNode("div", {
          id: "message-box",
          class: normalizeClass(_ctx.type)
        }, [
          createBaseVNode("div", _hoisted_2$7, [
            createBaseVNode("div", _hoisted_3$5, toDisplayString(isUpdating.value ? unref(t)("update.message-updating-title") : unref(t)("message.tip")), 1),
            createBaseVNode("div", _hoisted_4$5, [
              createBaseVNode("p", null, toDisplayString(isUpdating.value ? unref(t)("update.message-updating-content") : unref(t)("update.message-default-content")), 1),
              createBaseVNode("p", _hoisted_5$3, toDisplayString(props.version), 1)
            ]),
            createBaseVNode("div", {
              id: "message-control",
              class: normalizeClass({ "updating-btn": isUpdating.value }),
              onClick: handleConfirm
            }, [
              createVNode(unref(IconUpdating), { id: "message-btn-updating" }),
              createBaseVNode("span", _hoisted_6$3, toDisplayString(isUpdating.value ? unref(t)("update.message-updating-btn") : unref(t)("update.message-default-btn")), 1)
            ], 2)
          ]),
          createVNode(unref(IconClose$1), {
            id: "message-box-close",
            onClick: handleClose
          })
        ], 2)
      ]);
    };
  }
});
const UpdateMessage_vue_vue_type_style_index_0_scoped_192b67e6_lang = "";
const UpdateMessage = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-192b67e6"]]);
function Message$1(options) {
  return new Promise((resolve, _reject) => {
    const closeMessage = () => {
      unmount();
    };
    const onClose = () => {
      if (options.onClose)
        options.onClose();
      window.api.send("close-window");
      closeMessage();
    };
    const onConfirm = () => {
      if (options.onConfirm)
        options.onConfirm();
      else
        resolve("confirm");
    };
    const messageApp = createApp({
      render() {
        return h(UpdateMessage, { ...options, onConfirm, onClose });
      }
    });
    let mountNode = document.createElement("div");
    document.body.appendChild(mountNode);
    messageApp.mount(mountNode);
    const unmount = () => {
      messageApp.unmount();
      document.body.removeChild(mountNode);
      mountNode = null;
    };
  });
}
var isVue2 = false;
/*!
 * pinia v2.3.1
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia2) => activePinia = pinia2;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia2 = markRaw({
    install(app2) {
      setActivePinia(pinia2);
      {
        pinia2._a = app2;
        app2.provide(piniaSymbol, pinia2);
        app2.config.globalProperties.$pinia = pinia2;
        toBeInstalled.forEach((plugin) => _p.push(plugin));
        toBeInstalled = [];
      }
    },
    use(plugin) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia2;
}
const noop$1 = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop$1) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
const ACTION_MARKER = Symbol();
const ACTION_NAME = Symbol();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  } else if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign: assign$1 } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia2, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia2.state.value[id];
  let store;
  function setup() {
    if (!initialState && true) {
      {
        pinia2.state.value[id] = state ? state() : {};
      }
    }
    const localState = toRefs(pinia2.state.value[id]);
    return assign$1(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia2);
        const store2 = pinia2._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia2, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia2, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign$1({ actions: {} }, options);
  const $subscribeOptions = { deep: true };
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia2.state.value[$id];
  if (!isOptionsStore && !initialState && true) {
    {
      pinia2.state.value[$id] = {};
    }
  }
  ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia2.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia2.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick$1().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia2.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign$1($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop$1
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia2._s.delete($id);
  }
  const action = (fn, name = "") => {
    if (ACTION_MARKER in fn) {
      fn[ACTION_NAME] = name;
      return fn;
    }
    const wrappedAction = function() {
      setActivePinia(pinia2);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name: wrappedAction[ACTION_NAME],
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = fn.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
    wrappedAction[ACTION_MARKER] = true;
    wrappedAction[ACTION_NAME] = name;
    return wrappedAction;
  };
  const partialStore = {
    _p: pinia2,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia2.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign$1({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia2._s.set($id, store);
  const runWithContext = pinia2._a && pinia2._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia2._e.run(() => (scope = effectScope()).run(() => setup({ action }))));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia2.state.value[$id][key] = prop;
        }
      }
    } else if (typeof prop === "function") {
      const actionValue = action(prop, key);
      {
        setupStore[key] = actionValue;
      }
      optionsForPlugin.actions[key] = prop;
    } else
      ;
  }
  {
    assign$1(store, setupStore);
    assign$1(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => pinia2.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign$1($state, state);
      });
    }
  });
  pinia2._p.forEach((extender) => {
    {
      assign$1(store, scope.run(() => extender({
        store,
        app: pinia2._a,
        pinia: pinia2,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  function useStore(pinia2, hot) {
    const hasContext = hasInjectionContext();
    pinia2 = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    pinia2 || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia2)
      setActivePinia(pinia2);
    pinia2 = activePinia;
    if (!pinia2._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia2);
      } else {
        createOptionsStore(id, options, pinia2);
      }
    }
    const store = pinia2._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function storeToRefs(store) {
  {
    const rawStore = toRaw(store);
    const refs = {};
    for (const key in rawStore) {
      const value = rawStore[key];
      if (value.effect) {
        refs[key] = // ...
        computed({
          get: () => store[key],
          set(value2) {
            store[key] = value2;
          }
        });
      } else if (isRef(value) || isReactive(value)) {
        refs[key] = // ---
        toRef(store, key);
      }
    }
    return refs;
  }
}
const useDownload = /* @__PURE__ */ defineStore("download", () => {
  const downloadTask = reactive({
    state: "idle",
    repair: false,
    basis: "",
    version: "",
    game_start_exe_name: "",
    game_start_exe_params: []
  });
  const dispatchDownloadTask = (state) => {
    Object.assign(downloadTask, state);
  };
  return {
    downloadTask: readonly(downloadTask),
    dispatchDownloadTask
  };
});
/*!
  * vue-router v4.5.0
  * (c) 2024 Eduardo San Martin Morote
  * @license MIT
  */
const isBrowser = typeof document !== "undefined";
function isRouteComponent(component) {
  return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function isESModule(obj) {
  return obj.__esModule || obj[Symbol.toStringTag] === "Module" || // support CF with dynamic imports that do not
  // add the Module string tag
  obj.default && isRouteComponent(obj.default);
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
const noop = () => {
};
const isArray = Array.isArray;
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return text == null ? "" : encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
  }
  return "" + text;
}
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const hashPos = location.indexOf("#");
  let searchPos = location.indexOf("?");
  if (hashPos < searchPos && hashPos >= 0) {
    searchPos = -1;
  }
  if (searchPos > -1) {
    path = location.slice(0, searchPos);
    searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location.slice(0, hashPos);
    hash = location.slice(hashPos, location.length);
  }
  path = resolveRelativePath(path != null ? path : location, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash: decode(hash)
  };
}
function stringifyURL(stringifyQuery2, location) {
  const query = location.query ? stringifyQuery2(location.query) : "";
  return location.path + (query && "?") + query + (location.hash || "");
}
function isSameRouteLocation(stringifyQuery2, a, b) {
  const aLastIndex = a.matched.length - 1;
  const bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length)
    return false;
  for (const key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return isArray(a) ? isEquivalentArray(a, b) : isArray(b) ? isEquivalentArray(b, a) : a === b;
}
function isEquivalentArray(a, b) {
  return isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  const lastToSegment = toSegments[toSegments.length - 1];
  if (lastToSegment === ".." || lastToSegment === ".") {
    toSegments.push("");
  }
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (segment === ".")
      continue;
    if (segment === "..") {
      if (position > 1)
        position--;
    } else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition).join("/");
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  // TODO: could we use a symbol in the future?
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
const START = "";
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location) {
  return base.replace(BEFORE_HASH_RE, "#") + location;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.scrollX,
  top: window.scrollY
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    const positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.scrollX, scrollToOptions.top != null ? scrollToOptions.top : window.scrollY);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
function createMemoryHistory(base = "") {
  let listeners = [];
  let queue = [START];
  let position = 0;
  base = normalizeBase(base);
  function setLocation(location) {
    position++;
    if (position !== queue.length) {
      queue.splice(position);
    }
    queue.push(location);
  }
  function triggerListeners(to, from, { direction, delta }) {
    const info = {
      direction,
      delta,
      type: NavigationType.pop
    };
    for (const callback of listeners) {
      callback(to, from, info);
    }
  }
  const routerHistory = {
    // rewritten by Object.defineProperty
    location: START,
    // TODO: should be kept in queue
    state: {},
    base,
    createHref: createHref.bind(null, base),
    replace(to) {
      queue.splice(position--, 1);
      setLocation(to);
    },
    push(to, data) {
      setLocation(to);
    },
    listen(callback) {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1)
          listeners.splice(index, 1);
      };
    },
    destroy() {
      listeners = [];
      queue = [START];
      position = 0;
    },
    go(delta, shouldTrigger = true) {
      const from = this.location;
      const direction = (
        // we are considering delta === 0 going forward, but in abstract mode
        // using 0 for the delta doesn't make sense like it does in html5 where
        // it reloads the page
        delta < 0 ? NavigationDirection.back : NavigationDirection.forward
      );
      position = Math.max(0, Math.min(position + delta, queue.length - 1));
      if (shouldTrigger) {
        triggerListeners(this.location, from, {
          direction,
          delta
        });
      }
    }
  };
  Object.defineProperty(routerHistory, "location", {
    enumerable: true,
    get: () => queue[position]
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const NavigationFailureSymbol = Symbol("");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
function createRouterError(type, params) {
  {
    return assign(new Error(), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  const score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [
      90
      /* PathScore.Root */
    ];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const { value, repeatable, optional, regexp } = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = // avoid an optional / if there are more segments e.g. /:p?-static
          // or /:p?-:p2
          optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict && !pattern.endsWith("/"))
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const { value, repeatable, optional } = token;
          const param = value in params ? params[value] : "";
          if (isArray(param) && !repeatable) {
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          }
          const text = isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (segment.length < 2) {
                if (path.endsWith("/"))
                  path = path.slice(0, -1);
                else
                  avoidDuplicatedSlash = true;
              }
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path || "/";
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff)
      return diff;
    i++;
  }
  if (a.length < b.length) {
    return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp)
      return comp;
    i++;
  }
  if (Math.abs(bScore.length - aScore.length) === 1) {
    if (isLastScoreNegative(aScore))
      return 1;
    if (isLastScoreNegative(bScore))
      return -1;
  }
  return bScore.length - aScore.length;
}
function isLastScoreNegative(score) {
  const last = score[score.length - 1];
  return score.length > 0 && last[last.length - 1] < 0;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Invalid path "${path}"`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i--;
        customRe = "";
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  const matcher = assign(parser, {
    record,
    parent,
    // these needs to be populated by the parent
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = /* @__PURE__ */ new Map();
  globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    const isRootAdd = !originalRecord;
    const mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [mainNormalizedRecord];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(
          // we need to normalize again to ensure the `mods` property
          // being non enumerable
          normalizeRouteRecord(assign({}, mainNormalizedRecord, {
            // this allows us to hold a copy of the `components` option
            // so that async components cache is hold on the original record
            components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
            path: alias,
            // we might be the child of an alias
            aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
            // the aliases are always of the same kind as the original since they
            // are defined on the same record
          }))
        );
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      const { path } = normalizedRecord;
      if (parent && path[0] !== "/") {
        const parentPath = parent.record.path;
        const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher)) {
          removeRoute(record.name);
        }
      }
      if (isMatchable(matcher)) {
        insertMatcher(matcher);
      }
      if (mainNormalizedRecord.children) {
        const children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) {
          addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
        }
      }
      originalRecord = originalRecord || matcher;
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    const index = findInsertionIndex(matcher, matchers);
    matchers.splice(index, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve(location, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location && location.name) {
      matcher = matcherMap.get(location.name);
      if (!matcher)
        throw createRouterError(1, {
          location
        });
      name = matcher.record.name;
      params = assign(
        // paramsFromLocation is a new object
        paramsFromLocation(
          currentLocation.params,
          // only keep params that exist in the resolved location
          // only keep optional params coming from a parent record
          matcher.keys.filter((k) => !k.optional).concat(matcher.parent ? matcher.parent.keys.filter((k) => k.optional) : []).map((k) => k.name)
        ),
        // discard any existing params in the current location that do not exist here
        // #1497 this ensures better active/exact matching
        location.params && paramsFromLocation(location.params, matcher.keys.map((k) => k.name))
      );
      path = matcher.stringify(params);
    } else if (location.path != null) {
      path = location.path;
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  function clearRoutes() {
    matchers.length = 0;
    matcherMap.clear();
  }
  return {
    addRoute,
    resolve,
    removeRoute,
    clearRoutes,
    getRoutes,
    getRecordMatcher
  };
}
function paramsFromLocation(params, keys) {
  const newParams = {};
  for (const key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  const normalized = {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: record.aliasOf,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: /* @__PURE__ */ new Set(),
    updateGuards: /* @__PURE__ */ new Set(),
    enterCallbacks: {},
    // must be declared afterwards
    // mods: {},
    components: "components" in record ? record.components || null : record.component && { default: record.component }
  };
  Object.defineProperty(normalized, "mods", {
    value: {}
  });
  return normalized;
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (const name in record.components)
      propsObject[name] = typeof props === "object" ? props[name] : props;
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults2, partialOptions) {
  const options = {};
  for (const key in defaults2) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults2[key];
  }
  return options;
}
function findInsertionIndex(matcher, matchers) {
  let lower = 0;
  let upper = matchers.length;
  while (lower !== upper) {
    const mid = lower + upper >> 1;
    const sortOrder = comparePathParserScore(matcher, matchers[mid]);
    if (sortOrder < 0) {
      upper = mid;
    } else {
      lower = mid + 1;
    }
  }
  const insertionAncestor = getInsertionAncestor(matcher);
  if (insertionAncestor) {
    upper = matchers.lastIndexOf(insertionAncestor, upper - 1);
  }
  return upper;
}
function getInsertionAncestor(matcher) {
  let ancestor = matcher;
  while (ancestor = ancestor.parent) {
    if (isMatchable(ancestor) && comparePathParserScore(matcher, ancestor) === 0) {
      return ancestor;
    }
  }
  return;
}
function isMatchable({ record }) {
  return !!(record.name || record.components && Object.keys(record.components).length || record.redirect);
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    const eqPos = searchParam.indexOf("=");
    const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0) {
        search += (search.length ? "&" : "") + key;
      }
      continue;
    }
    const values = isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
    values.forEach((value2) => {
      if (value2 !== void 0) {
        search += (search.length ? "&" : "") + key;
        if (value2 != null)
          search += "=" + value2;
      }
    });
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (const key in query) {
    const value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
const matchedRouteKey = Symbol("");
const viewDepthKey = Symbol("");
const routerKey = Symbol("");
const routeLocationKey = Symbol("");
const routerViewLocationKey = Symbol("");
function useCallbacks() {
  let handlers = [];
  function add(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1)
        handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add,
    list: () => handlers.slice(),
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name, runWithContext = (fn) => fn()) {
  const enterCallbackArray = record && // name is defined if record is because of the function overload
  (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve, reject) => {
    const next = (valid) => {
      if (valid === false) {
        reject(createRouterError(4, {
          from,
          to
        }));
      } else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && // since enterCallbackArray is truthy, both record and name also are
        record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") {
          enterCallbackArray.push(valid);
        }
        resolve();
      }
    };
    const guardReturn = runWithContext(() => guard.call(record && record.instances[name], to, from, next));
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    guardCall.catch((err) => reject(err));
  });
}
function extractComponentsGuards(matched, guardType, to, from, runWithContext = (fn) => fn()) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        const options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name, runWithContext));
      } else {
        let componentPromise = rawComponent();
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            throw new Error(`Couldn't resolve component "${name}" at "${record.path}"`);
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.mods[name] = resolved;
          record.components[name] = resolvedComponent;
          const options = resolvedComponent.__vccOpts || resolvedComponent;
          const guard = options[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name, runWithContext)();
        }));
      }
    }
  }
  return guards;
}
function useLink(props) {
  const router2 = inject(routerKey);
  const currentRoute = inject(routeLocationKey);
  const route = computed(() => {
    const to = unref(props.to);
    return router2.resolve(to);
  });
  const activeRecordIndex = computed(() => {
    const { matched } = route.value;
    const { length } = matched;
    const routeMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    const parentRecordPath = getOriginalPath(matched[length - 2]);
    return (
      // we are dealing with nested routes
      length > 1 && // if the parent and matched route have the same path, this link is
      // referring to the empty child. Or we currently are on a different
      // child of the same parent
      getOriginalPath(routeMatched) === parentRecordPath && // avoid comparing the child with its parent
      currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index
    );
  });
  const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e)) {
      const p = router2[unref(props.replace) ? "replace" : "push"](
        unref(props.to)
        // avoid uncaught errors are they are logged anyway
      ).catch(noop);
      if (props.viewTransition && typeof document !== "undefined" && "startViewTransition" in document) {
        document.startViewTransition(() => p);
      }
      return p;
    }
    return Promise.resolve();
  }
  return {
    route,
    href: computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
function preferSingleVNode(vnodes) {
  return vnodes.length === 1 ? vnodes[0] : vnodes;
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
  name: "RouterLink",
  compatConfig: { MODE: 3 },
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    replace: Boolean,
    activeClass: String,
    // inactiveClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  useLink,
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);
    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      // [getLinkClass(
      //   props.inactiveClass,
      //   options.linkInactiveClass,
      //   'router-link-inactive'
      // )]: !link.isExactActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && preferSingleVNode(slots.default(link));
      return props.custom ? children : h("a", {
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        href: link.href,
        // this would override user added attrs but Vue will still add
        // the listener, so we end up triggering both
        onClick: link.navigate,
        class: elClass.value
      }, children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    return;
  if (e.defaultPrevented)
    return;
  if (e.button !== void 0 && e.button !== 0)
    return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e.preventDefault)
    e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (const key in inner) {
    const innerValue = inner[key];
    const outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ defineComponent({
  name: "RouterView",
  // #674 we manually inherit them
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  // Better compat for @vue/compat users
  // https://github.com/vuejs/router/issues/1315
  compatConfig: { MODE: 3 },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let initialDepth = unref(injectedDepth);
      const { matched } = routeToDisplay.value;
      let matchedRoute;
      while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) {
        initialDepth++;
      }
      return initialDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
    provide(viewDepthKey, computed(() => depth.value + 1));
    provide(matchedRouteKey, matchedRouteRef);
    provide(routerViewLocationKey, routeToDisplay);
    const viewRef = ref();
    watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && from !== to && instance && instance === oldInstance) {
          if (!to.leaveGuards.size) {
            to.leaveGuards = from.leaveGuards;
          }
          if (!to.updateGuards.size) {
            to.updateGuards = from.updateGuards;
          }
        }
      }
      if (instance && to && // if there is no instance but to and from are the same this might be
      // the first visit
      (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, { flush: "post" });
    return () => {
      const route = routeToDisplay.value;
      const currentName = props.name;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[currentName];
      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }
      const routePropsOption = matchedRoute.props[currentName];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component = h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return (
        // pass the vnode to the slot as a prop.
        // h and <component :is="..."> both accept vnodes
        normalizeSlot(slots.default, { Component: component, route }) || component
      );
    };
  }
});
function normalizeSlot(slot, data) {
  if (!slot)
    return null;
  const slotContent = slot(data);
  return slotContent.length === 1 ? slotContent[0] : slotContent;
}
const RouterView = RouterViewImpl;
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const parseQuery$1 = options.parseQuery || parseQuery;
  const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  const routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = (
    // @ts-expect-error: intentionally avoid the type check
    applyToParams.bind(null, decode)
  );
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    const recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      const matchedRoute2 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
      const href2 = routerHistory.createHref(locationNormalized.fullPath);
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if (rawLocation.path != null) {
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      const targetParams = assign({}, rawLocation.params);
      for (const key in targetParams) {
        if (targetParams[key] == null) {
          delete targetParams[key];
        }
      }
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(targetParams)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    const href = routerHistory.createHref(fullPath);
    return assign({
      fullPath,
      // keep the hash encoded so fullPath is effectively path + encodedQuery +
      // hash
      hash,
      query: (
        // if the user is using a custom query lib like qs, we might have
        // nested objects, so we keep the query as is, meaning it can contain
        // numbers at `$route.query`, but at the point, the user will have to
        // use their own type anyway.
        // https://github.com/vuejs/router/issues/328#issuecomment-649481567
        stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
      )
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), { replace: true }));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const { redirect } = lastMatched;
      let newTargetLocation = typeof redirect === "function" ? redirect(to) : redirect;
      if (typeof newTargetLocation === "string") {
        newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : (
          // force empty params
          { path: newTargetLocation }
        );
        newTargetLocation.params = {};
      }
      return assign({
        query: to.query,
        hash: to.hash,
        // avoid transferring params if the redirect has a path
        params: newTargetLocation.path != null ? {} : to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(
        assign(locationAsObject(shouldRedirect), {
          state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
          force,
          replace: replace2
        }),
        // keep original redirectedFrom if it exists
        redirectedFrom || targetLocation
      );
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, { to: toLocation, from });
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false
      );
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? (
      // navigation redirects still mark the router as ready
      isNavigationFailure(
        error,
        2
        /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
      ) ? error : markAsReady(error)
    ) : (
      // reject any unknown error
      triggerError(error, toLocation, from)
    )).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(
          failure2,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          return pushWithRedirect(
            // keep options
            assign({
              // preserve an existing replacement but allow the redirect to override it
              replace: replace2
            }, locationAsObject(failure2.to), {
              state: typeof failure2.to === "object" ? assign({}, data, failure2.to.state) : data,
              force
            }),
            // preserve the original redirectedFrom if any
            redirectedFrom || toLocation
          );
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function runWithContext(fn) {
    const app2 = installedApps.values().next().value;
    return app2 && typeof app2.runWithContext === "function" ? app2.runWithContext(fn) : fn();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      record.leaveGuards.forEach((guard) => {
        guards.push(guardToPromiseFn(guard, to, from));
      });
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        record.updateGuards.forEach((guard) => {
          guards.push(guardToPromiseFn(guard, to, from));
        });
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of enteringRecords) {
        if (record.beforeEnter) {
          if (isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from, runWithContext);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(
      err,
      8
      /* ErrorTypes.NAVIGATION_CANCELLED */
    ) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    afterGuards.list().forEach((guard) => runWithContext(() => guard(to, from, failure)));
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    if (removeHistoryListener)
      return;
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      if (!router2.listening)
        return;
      const toLocation = resolve(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, { replace: true, force: true }), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(
          error,
          4 | 8
          /* ErrorTypes.NAVIGATION_CANCELLED */
        )) {
          return error;
        }
        if (isNavigationFailure(
          error,
          2
          /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */
        )) {
          pushWithRedirect(
            assign(locationAsObject(error.to), {
              force: true
            }),
            toLocation
            // avoid an uncaught rejection, let push call triggerError
          ).then((failure) => {
            if (isNavigationFailure(
              failure,
              4 | 16
              /* ErrorTypes.NAVIGATION_DUPLICATED */
            ) && !info.delta && info.type === NavigationType.pop) {
              routerHistory.go(-1, false);
            }
          }).catch(noop);
          return Promise.reject();
        }
        if (info.delta) {
          routerHistory.go(-info.delta, false);
        }
        return triggerError(error, toLocation, from);
      }).then((failure) => {
        failure = failure || finalizeNavigation(
          // after navigation, all matched components are resolved
          toLocation,
          from,
          false
        );
        if (failure) {
          if (info.delta && // a new navigation has been triggered, so we do not want to revert, that will change the current history
          // entry while a different route is displayed
          !isNavigationFailure(
            failure,
            8
            /* ErrorTypes.NAVIGATION_CANCELLED */
          )) {
            routerHistory.go(-info.delta, false);
          } else if (info.type === NavigationType.pop && isNavigationFailure(
            failure,
            4 | 16
            /* ErrorTypes.NAVIGATION_DUPLICATED */
          )) {
            routerHistory.go(-1, false);
          }
        }
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorListeners = useCallbacks();
  let ready;
  function triggerError(error, to, from) {
    markAsReady(error);
    const list = errorListeners.list();
    if (list.length) {
      list.forEach((handler) => handler(error, to, from));
    } else {
      console.error(error);
    }
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve2, reject) => {
      readyHandlers.add([resolve2, reject]);
    });
  }
  function markAsReady(err) {
    if (!ready) {
      ready = !err;
      setupListeners();
      readyHandlers.list().forEach(([resolve2, reject]) => err ? reject(err) : resolve2());
      readyHandlers.reset();
    }
    return err;
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    const { scrollBehavior } = options;
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return nextTick$1().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = /* @__PURE__ */ new Set();
  const router2 = {
    currentRoute,
    listening: true,
    addRoute,
    removeRoute,
    clearRoutes: matcher.clearRoutes,
    hasRoute,
    getRoutes,
    resolve,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorListeners.add,
    isReady,
    install(app2) {
      const router3 = this;
      app2.component("RouterLink", RouterLink);
      app2.component("RouterView", RouterView);
      app2.config.globalProperties.$router = router3;
      Object.defineProperty(app2.config.globalProperties, "$route", {
        enumerable: true,
        get: () => unref(currentRoute)
      });
      if (isBrowser && // used for the initial navigation client side to avoid pushing
      // multiple times when the router is used in multiple apps
      !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
        });
      }
      const reactiveRoute = {};
      for (const key in START_LOCATION_NORMALIZED) {
        Object.defineProperty(reactiveRoute, key, {
          get: () => currentRoute.value[key],
          enumerable: true
        });
      }
      app2.provide(routerKey, router3);
      app2.provide(routeLocationKey, shallowReactive(reactiveRoute));
      app2.provide(routerViewLocationKey, currentRoute);
      const unmountApp = app2.unmount;
      installedApps.add(app2);
      app2.unmount = function() {
        installedApps.delete(app2);
        if (installedApps.size < 1) {
          pendingLocation = START_LOCATION_NORMALIZED;
          removeHistoryListener && removeHistoryListener();
          removeHistoryListener = null;
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp();
      };
    }
  };
  function runGuardQueue(guards) {
    return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
  }
  return router2;
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.find((record) => isSameRouteRecord(record, recordFrom)))
        updatingRecords.push(recordFrom);
      else
        leavingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) {
        enteringRecords.push(recordTo);
      }
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
function useRouter() {
  return inject(routerKey);
}
const useView = /* @__PURE__ */ defineStore("view", () => {
  const router2 = useRouter();
  const viewState = ref("menu");
  const dispatchViewState = (state) => {
    viewState.value = state;
  };
  watch(
    () => viewState.value,
    () => {
      router2.push({
        name: viewState.value
      });
    },
    {
      immediate: true
    }
  );
  return { viewState: readonly(viewState), dispatchViewState };
});
const useClient = /* @__PURE__ */ defineStore("client", () => {
  const clientState = reactive({
    backgroundImage: void 0,
    clientVersion: "",
    gameVersion: "",
    gameSize: "--",
    gamePath: ""
  });
  const settingsState = reactive({
    about: false,
    aboutCopyright: "",
    aboutPrivacy: "",
    aboutProtocol: "",
    proxyConfig: "direct"
  });
  watch(
    () => clientState.gamePath,
    () => {
      if (!clientState.gamePath) {
        clientState.gamePath = LocalStorageUtil.getItem("downloadPath") || window.api.sendSync("request-default-download-path") || "";
      }
    },
    {
      immediate: true
    }
  );
  const dispatchClientState = (state) => {
    Object.assign(clientState, state);
  };
  const dispatchSettingsState = (state) => {
    Object.assign(settingsState, state);
  };
  onMounted(() => {
    settingsState.proxyConfig = LocalStorageUtil.getItem("proxy-config") || "direct";
    window.api.invoke("handle-set-proxy-mode", settingsState.proxyConfig);
  });
  return {
    clientState: readonly(clientState),
    settingsState: readonly(settingsState),
    dispatchClientState,
    dispatchSettingsState
  };
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var lodash = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
lodash.exports;
(function(module, exports) {
  (function() {
    var undefined$1;
    var VERSION = "4.17.21";
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [
      ["ary", WRAP_ARY_FLAG],
      ["bind", WRAP_BIND_FLAG],
      ["bindKey", WRAP_BIND_KEY_FLAG],
      ["curry", WRAP_CURRY_FLAG],
      ["curryRight", WRAP_CURRY_RIGHT_FLAG],
      ["flip", WRAP_FLIP_FLAG],
      ["partial", WRAP_PARTIAL_FLAG],
      ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
      ["rearg", WRAP_REARG_FLAG]
    ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrimStart = /^\s+/;
    var reWhitespace = /\s/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [
      "Array",
      "Buffer",
      "DataView",
      "Date",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "Map",
      "Math",
      "Object",
      "Promise",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "WeakMap",
      "_",
      "clearTimeout",
      "isFinite",
      "parseInt",
      "setTimeout"
    ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "Ç": "C",
      "ç": "c",
      "Ð": "D",
      "ð": "d",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "Ñ": "N",
      "ñ": "n",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "Ý": "Y",
      "ý": "y",
      "ÿ": "y",
      "Æ": "Ae",
      "æ": "ae",
      "Þ": "Th",
      "þ": "th",
      "ß": "ss",
      // Latin Extended-A block.
      "Ā": "A",
      "Ă": "A",
      "Ą": "A",
      "ā": "a",
      "ă": "a",
      "ą": "a",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "Ď": "D",
      "Đ": "D",
      "ď": "d",
      "đ": "d",
      "Ē": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ę": "E",
      "Ě": "E",
      "ē": "e",
      "ĕ": "e",
      "ė": "e",
      "ę": "e",
      "ě": "e",
      "Ĝ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ģ": "G",
      "ĝ": "g",
      "ğ": "g",
      "ġ": "g",
      "ģ": "g",
      "Ĥ": "H",
      "Ħ": "H",
      "ĥ": "h",
      "ħ": "h",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "Į": "I",
      "İ": "I",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "į": "i",
      "ı": "i",
      "Ĵ": "J",
      "ĵ": "j",
      "Ķ": "K",
      "ķ": "k",
      "ĸ": "k",
      "Ĺ": "L",
      "Ļ": "L",
      "Ľ": "L",
      "Ŀ": "L",
      "Ł": "L",
      "ĺ": "l",
      "ļ": "l",
      "ľ": "l",
      "ŀ": "l",
      "ł": "l",
      "Ń": "N",
      "Ņ": "N",
      "Ň": "N",
      "Ŋ": "N",
      "ń": "n",
      "ņ": "n",
      "ň": "n",
      "ŋ": "n",
      "Ō": "O",
      "Ŏ": "O",
      "Ő": "O",
      "ō": "o",
      "ŏ": "o",
      "ő": "o",
      "Ŕ": "R",
      "Ŗ": "R",
      "Ř": "R",
      "ŕ": "r",
      "ŗ": "r",
      "ř": "r",
      "Ś": "S",
      "Ŝ": "S",
      "Ş": "S",
      "Š": "S",
      "ś": "s",
      "ŝ": "s",
      "ş": "s",
      "š": "s",
      "Ţ": "T",
      "Ť": "T",
      "Ŧ": "T",
      "ţ": "t",
      "ť": "t",
      "ŧ": "t",
      "Ũ": "U",
      "Ū": "U",
      "Ŭ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ų": "U",
      "ũ": "u",
      "ū": "u",
      "ŭ": "u",
      "ů": "u",
      "ű": "u",
      "ų": "u",
      "Ŵ": "W",
      "ŵ": "w",
      "Ŷ": "Y",
      "ŷ": "y",
      "Ÿ": "Y",
      "Ź": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "ź": "z",
      "ż": "z",
      "ž": "z",
      "Ĳ": "IJ",
      "ĳ": "ij",
      "Œ": "Oe",
      "œ": "oe",
      "ŉ": "'n",
      "ſ": "s"
    };
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var htmlUnescapes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'"
    };
    var stringEscapes = {
      "\\": "\\",
      "'": "'",
      "\n": "n",
      "\r": "r",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEachRight(array, iteratee) {
      var length = array == null ? 0 : array.length;
      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEvery(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }
      return true;
    }
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function arrayIncludesWith(array, value, comparator) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }
    function arrayMap(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
      var length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection2) {
        if (predicate(value, key, collection2)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (comparator(array[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseMean(array, iteratee) {
      var length = array == null ? 0 : array.length;
      return length ? baseSum(array, iteratee) / length : NAN;
    }
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
      });
      return accumulator;
    }
    function baseSortBy(array, comparer) {
      var length = array.length;
      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }
    function baseSum(array, iteratee) {
      var result, index = -1, length = array.length;
      while (++index < length) {
        var current = iteratee(array[index]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : result + current;
        }
      }
      return result;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseToPairs(object, props) {
      return arrayMap(props, function(key) {
        return [key, object[key]];
      });
    }
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1, length = strSymbols.length;
      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;
      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function countHolders(array, placeholder) {
      var length = array.length, result = 0;
      while (length--) {
        if (array[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
      return "\\" + stringEscapes[chr];
    }
    function getValue(object, key) {
      return object == null ? undefined$1 : object[key];
    }
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
      var data, result = [];
      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function replaceHolders(array, placeholder) {
      var index = -1, length = array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (value === placeholder || value === PLACEHOLDER) {
          array[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }
      return result;
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    function setToPairs(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = [value, value];
      });
      return result;
    }
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function strictLastIndexOf(array, value, fromIndex) {
      var index = fromIndex + 1;
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return index;
    }
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var runInContext = function runInContext2(context) {
      context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
      var Array2 = context.Array, Date2 = context.Date, Error2 = context.Error, Function2 = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String, TypeError = context.TypeError;
      var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
      var coreJsData = context["__core-js_shared__"];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;
      var maskSrcKey = function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      }();
      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object2);
      var oldDash = root._;
      var reIsNative = RegExp2(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Buffer = moduleExports ? context.Buffer : undefined$1, Symbol2 = context.Symbol, Uint8Array = context.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined$1, symIterator = Symbol2 ? Symbol2.iterator : undefined$1, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined$1;
      var defineProperty = function() {
        try {
          var func = getNative(Object2, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      }();
      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date2 && Date2.now !== root.Date.now && Date2.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
      var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
      var DataView = getNative(context, "DataView"), Map2 = getNative(context, "Map"), Promise2 = getNative(context, "Promise"), Set2 = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object2, "create");
      var metaMap = WeakMap && new WeakMap();
      var realNames = {};
      var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol2 ? Symbol2.prototype : undefined$1, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1, symbolToString = symbolProto ? symbolProto.toString : undefined$1;
      function lodash2(value) {
        if (isObjectLike(value) && !isArray2(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, "__wrapped__")) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }
      var baseCreate = function() {
        function object() {
        }
        return function(proto) {
          if (!isObject2(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result2 = new object();
          object.prototype = undefined$1;
          return result2;
        };
      }();
      function baseLodash() {
      }
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }
      lodash2.templateSettings = {
        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "escape": reEscape,
        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "evaluate": reEvaluate,
        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "interpolate": reInterpolate,
        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        "variable": "",
        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        "imports": {
          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          "_": lodash2
        }
      };
      lodash2.prototype = baseLodash.prototype;
      lodash2.prototype.constructor = lodash2;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }
      function lazyClone() {
        var result2 = new LazyWrapper(this.__wrapped__);
        result2.__actions__ = copyArray(this.__actions__);
        result2.__dir__ = this.__dir__;
        result2.__filtered__ = this.__filtered__;
        result2.__iteratees__ = copyArray(this.__iteratees__);
        result2.__takeCount__ = this.__takeCount__;
        result2.__views__ = copyArray(this.__views__);
        return result2;
      }
      function lazyReverse() {
        if (this.__filtered__) {
          var result2 = new LazyWrapper(this);
          result2.__dir__ = -1;
          result2.__filtered__ = true;
        } else {
          result2 = this.clone();
          result2.__dir__ *= -1;
        }
        return result2;
      }
      function lazyValue() {
        var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray2(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array, this.__actions__);
        }
        var result2 = [];
        outer:
          while (length-- && resIndex < takeCount) {
            index += dir;
            var iterIndex = -1, value = array[index];
            while (++iterIndex < iterLength) {
              var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed2 = iteratee2(value);
              if (type == LAZY_MAP_FLAG) {
                value = computed2;
              } else if (!computed2) {
                if (type == LAZY_FILTER_FLAG) {
                  continue outer;
                } else {
                  break outer;
                }
              }
            }
            result2[resIndex++] = value;
          }
        return result2;
      }
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      function hashDelete(key) {
        var result2 = this.has(key) && delete this.__data__[key];
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result2 = data[key];
          return result2 === HASH_UNDEFINED ? undefined$1 : result2;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined$1 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined$1 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? undefined$1 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map2 || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        var result2 = getMapData(this, key)["delete"](key);
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size2 = data.size;
        data.set(key, value);
        this.size += data.size == size2 ? 0 : 1;
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function SetCache(values2) {
        var index = -1, length = values2 == null ? 0 : values2.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values2[index]);
        }
      }
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      function stackDelete(key) {
        var data = this.__data__, result2 = data["delete"](key);
        this.size = data.size;
        return result2;
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray2(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined$1;
      }
      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }
      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }
      function assignMergeValue(object, key, value) {
        if (value !== undefined$1 && !eq(object[key], value) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAggregator(collection, setter, iteratee2, accumulator) {
        baseEach(collection, function(value, key, collection2) {
          setter(accumulator, value, iteratee2(value), collection2);
        });
        return accumulator;
      }
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }
      function baseAssignValue(object, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object[key] = value;
        }
      }
      function baseAt(object, paths) {
        var index = -1, length = paths.length, result2 = Array2(length), skip = object == null;
        while (++index < length) {
          result2[index] = skip ? undefined$1 : get(object, paths[index]);
        }
        return result2;
      }
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined$1) {
            number = number <= upper ? number : upper;
          }
          if (lower !== undefined$1) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }
      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result2 = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result2 !== undefined$1) {
          return result2;
        }
        if (!isObject2(value)) {
          return value;
        }
        var isArr = isArray2(value);
        if (isArr) {
          result2 = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result2);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            result2 = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result2 = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result2);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result2;
      }
      function baseConforms(source) {
        var props = keys(source);
        return function(object) {
          return baseConformsTo(object, source, props);
        };
      }
      function baseConformsTo(object, source, props) {
        var length = props.length;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (length--) {
          var key = props[length], predicate = source[key], value = object[key];
          if (value === undefined$1 && !(key in object) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }
      function baseDelay(func, wait, args) {
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return setTimeout2(function() {
          func.apply(undefined$1, args);
        }, wait);
      }
      function baseDifference(array, values2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, isCommon = true, length = array.length, result2 = [], valuesLength = values2.length;
        if (!length) {
          return result2;
        }
        if (iteratee2) {
          values2 = arrayMap(values2, baseUnary(iteratee2));
        }
        if (comparator) {
          includes2 = arrayIncludesWith;
          isCommon = false;
        } else if (values2.length >= LARGE_ARRAY_SIZE) {
          includes2 = cacheHas;
          isCommon = false;
          values2 = new SetCache(values2);
        }
        outer:
          while (++index < length) {
            var value = array[index], computed2 = iteratee2 == null ? value : iteratee2(value);
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed2 === computed2) {
              var valuesIndex = valuesLength;
              while (valuesIndex--) {
                if (values2[valuesIndex] === computed2) {
                  continue outer;
                }
              }
              result2.push(value);
            } else if (!includes2(values2, computed2, comparator)) {
              result2.push(value);
            }
          }
        return result2;
      }
      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);
      function baseEvery(collection, predicate) {
        var result2 = true;
        baseEach(collection, function(value, index, collection2) {
          result2 = !!predicate(value, index, collection2);
          return result2;
        });
        return result2;
      }
      function baseExtremum(array, iteratee2, comparator) {
        var index = -1, length = array.length;
        while (++index < length) {
          var value = array[index], current = iteratee2(value);
          if (current != null && (computed2 === undefined$1 ? current === current && !isSymbol(current) : comparator(current, computed2))) {
            var computed2 = current, result2 = value;
          }
        }
        return result2;
      }
      function baseFill(array, value, start, end) {
        var length = array.length;
        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end === undefined$1 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array[start++] = value;
        }
        return array;
      }
      function baseFilter(collection, predicate) {
        var result2 = [];
        baseEach(collection, function(value, index, collection2) {
          if (predicate(value, index, collection2)) {
            result2.push(value);
          }
        });
        return result2;
      }
      function baseFlatten(array, depth, predicate, isStrict, result2) {
        var index = -1, length = array.length;
        predicate || (predicate = isFlattenable);
        result2 || (result2 = []);
        while (++index < length) {
          var value = array[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result2);
            } else {
              arrayPush(result2, value);
            }
          } else if (!isStrict) {
            result2[result2.length] = value;
          }
        }
        return result2;
      }
      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);
      function baseForOwn(object, iteratee2) {
        return object && baseFor(object, iteratee2, keys);
      }
      function baseForOwnRight(object, iteratee2) {
        return object && baseForRight(object, iteratee2, keys);
      }
      function baseFunctions(object, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object[key]);
        });
      }
      function baseGet(object, path) {
        path = castPath(path, object);
        var index = 0, length = path.length;
        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return index && index == length ? object : undefined$1;
      }
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result2 = keysFunc(object);
        return isArray2(object) ? result2 : arrayPush(result2, symbolsFunc(object));
      }
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
      }
      function baseGt(value, other) {
        return value > other;
      }
      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }
      function baseHasIn(object, key) {
        return object != null && key in Object2(object);
      }
      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }
      function baseIntersection(arrays, iteratee2, comparator) {
        var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
        while (othIndex--) {
          var array = arrays[othIndex];
          if (othIndex && iteratee2) {
            array = arrayMap(array, baseUnary(iteratee2));
          }
          maxLength = nativeMin(array.length, maxLength);
          caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined$1;
        }
        array = arrays[0];
        var index = -1, seen2 = caches[0];
        outer:
          while (++index < length && result2.length < maxLength) {
            var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (!(seen2 ? cacheHas(seen2, computed2) : includes2(result2, computed2, comparator))) {
              othIndex = othLength;
              while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed2) : includes2(arrays[othIndex], computed2, comparator))) {
                  continue outer;
                }
              }
              if (seen2) {
                seen2.push(computed2);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseInverter(object, setter, iteratee2, accumulator) {
        baseForOwn(object, function(value, key, object2) {
          setter(accumulator, iteratee2(value), key, object2);
        });
        return accumulator;
      }
      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object, args);
      }
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray2(object), othIsArr = isArray2(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result2 = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result2 === undefined$1 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
              return false;
            }
          }
        }
        return true;
      }
      function baseIsNative(value) {
        if (!isObject2(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray2(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result2 = [];
        for (var key in Object2(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseKeysIn(object) {
        if (!isObject2(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object), result2 = [];
        for (var key in object) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseLt(value, other) {
        return value < other;
      }
      function baseMap(collection, iteratee2) {
        var index = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result2[++index] = iteratee2(value, key, collection2);
        });
        return result2;
      }
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return objValue === undefined$1 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack());
          if (isObject2(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined$1;
            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined$1;
        var isCommon = newValue === undefined$1;
        if (isCommon) {
          var isArr = isArray2(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray2(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject2(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject2(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }
      function baseNth(array, n) {
        var length = array.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array[n] : undefined$1;
      }
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee2) {
            if (isArray2(iteratee2)) {
              return function(value) {
                return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
              };
            }
            return iteratee2;
          });
        } else {
          iteratees = [identity];
        }
        var index = -1;
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        var result2 = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee2) {
            return iteratee2(value);
          });
          return { "criteria": criteria, "index": ++index, "value": value };
        });
        return baseSortBy(result2, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }
      function basePickBy(object, paths, predicate) {
        var index = -1, length = paths.length, result2 = {};
        while (++index < length) {
          var path = paths[index], value = baseGet(object, path);
          if (predicate(value, path)) {
            baseSet(result2, castPath(path, object), value);
          }
        }
        return result2;
      }
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      function basePullAll(array, values2, iteratee2, comparator) {
        var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen2 = array;
        if (array === values2) {
          values2 = copyArray(values2);
        }
        if (iteratee2) {
          seen2 = arrayMap(array, baseUnary(iteratee2));
        }
        while (++index < length) {
          var fromIndex = 0, value = values2[index], computed2 = iteratee2 ? iteratee2(value) : value;
          while ((fromIndex = indexOf2(seen2, computed2, fromIndex, comparator)) > -1) {
            if (seen2 !== array) {
              splice.call(seen2, fromIndex, 1);
            }
            splice.call(array, fromIndex, 1);
          }
        }
        return array;
      }
      function basePullAt(array, indexes) {
        var length = array ? indexes.length : 0, lastIndex = length - 1;
        while (length--) {
          var index = indexes[length];
          if (length == lastIndex || index !== previous) {
            var previous = index;
            if (isIndex(index)) {
              splice.call(array, index, 1);
            } else {
              baseUnset(array, index);
            }
          }
        }
        return array;
      }
      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }
      function baseRange(start, end, step, fromRight) {
        var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result2 = Array2(length);
        while (length--) {
          result2[fromRight ? length : ++index] = start;
          start += step;
        }
        return result2;
      }
      function baseRepeat(string, n) {
        var result2 = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result2;
        }
        do {
          if (n % 2) {
            result2 += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result2;
      }
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
      }
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }
      function baseSet(object, path, value, customizer) {
        if (!isObject2(object)) {
          return object;
        }
        path = castPath(path, object);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject2(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant(string),
          "writable": true
        });
      };
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result2 = Array2(length);
        while (++index < length) {
          result2[index] = array[index + start];
        }
        return result2;
      }
      function baseSome(collection, predicate) {
        var result2;
        baseEach(collection, function(value, index, collection2) {
          result2 = predicate(value, index, collection2);
          return !result2;
        });
        return !!result2;
      }
      function baseSortedIndex(array, value, retHighest) {
        var low = 0, high = array == null ? low : array.length;
        if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1, computed2 = array[mid];
            if (computed2 !== null && !isSymbol(computed2) && (retHighest ? computed2 <= value : computed2 < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array, value, identity, retHighest);
      }
      function baseSortedIndexBy(array, value, iteratee2, retHighest) {
        var low = 0, high = array == null ? 0 : array.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee2(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined$1;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed2 = iteratee2(array[mid]), othIsDefined = computed2 !== undefined$1, othIsNull = computed2 === null, othIsReflexive = computed2 === computed2, othIsSymbol = isSymbol(computed2);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed2 <= value : computed2 < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      function baseSortedUniq(array, iteratee2) {
        var index = -1, length = array.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
          if (!index || !eq(computed2, seen2)) {
            var seen2 = computed2;
            result2[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result2;
      }
      function baseToNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray2(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function baseUniq(array, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, length = array.length, isCommon = true, result2 = [], seen2 = result2;
        if (comparator) {
          isCommon = false;
          includes2 = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set2 = iteratee2 ? null : createSet(array);
          if (set2) {
            return setToArray(set2);
          }
          isCommon = false;
          includes2 = cacheHas;
          seen2 = new SetCache();
        } else {
          seen2 = iteratee2 ? [] : result2;
        }
        outer:
          while (++index < length) {
            var value = array[index], computed2 = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed2 === computed2) {
              var seenIndex = seen2.length;
              while (seenIndex--) {
                if (seen2[seenIndex] === computed2) {
                  continue outer;
                }
              }
              if (iteratee2) {
                seen2.push(computed2);
              }
              result2.push(value);
            } else if (!includes2(seen2, computed2, comparator)) {
              if (seen2 !== result2) {
                seen2.push(computed2);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }
      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }
      function baseWhile(array, predicate, isDrop, fromRight) {
        var length = array.length, index = fromRight ? length : -1;
        while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {
        }
        return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
      }
      function baseWrapperValue(value, actions) {
        var result2 = value;
        if (result2 instanceof LazyWrapper) {
          result2 = result2.value();
        }
        return arrayReduce(actions, function(result3, action) {
          return action.func.apply(action.thisArg, arrayPush([result3], action.args));
        }, result2);
      }
      function baseXor(arrays, iteratee2, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index = -1, result2 = Array2(length);
        while (++index < length) {
          var array = arrays[index], othIndex = -1;
          while (++othIndex < length) {
            if (othIndex != index) {
              result2[index] = baseDifference(result2[index] || array, arrays[othIndex], iteratee2, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
      }
      function baseZipObject(props, values2, assignFunc) {
        var index = -1, length = props.length, valsLength = values2.length, result2 = {};
        while (++index < length) {
          var value = index < valsLength ? values2[index] : undefined$1;
          assignFunc(result2, props[index], value);
        }
        return result2;
      }
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      function castFunction(value) {
        return typeof value == "function" ? value : identity;
      }
      function castPath(value, object) {
        if (isArray2(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      var castRest = baseRest;
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined$1 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      var clearTimeout2 = ctxClearTimeout || function(id) {
        return root.clearTimeout(id);
      };
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result2);
        return result2;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array(result2).set(new Uint8Array(arrayBuffer));
        return result2;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneRegExp(regexp) {
        var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result2.lastIndex = regexp.lastIndex;
        return result2;
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined$1, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      function compareMultiple(object, other, orders) {
        var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index < length) {
          var result2 = compareAscending(objCriteria[index], othCriteria[index]);
          if (result2) {
            if (index >= ordersLength) {
              return result2;
            }
            var order = orders[index];
            return result2 * (order == "desc" ? -1 : 1);
          }
        }
        return object.index - other.index;
      }
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
        while (++leftIndex < leftLength) {
          result2[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result2[leftIndex++] = args[argsIndex++];
        }
        return result2;
      }
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
        while (++argsIndex < rangeLength) {
          result2[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result2[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result2;
      }
      function copyArray(source, array) {
        var index = -1, length = source.length;
        array || (array = Array2(length));
        while (++index < length) {
          array[index] = source[index];
        }
        return array;
      }
      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined$1;
          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }
      function createAggregator(setter, initializer) {
        return function(collection, iteratee2) {
          var func = isArray2(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
        };
      }
      function createAssigner(assigner) {
        return baseRest(function(object, sources) {
          var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined$1, guard = length > 2 ? sources[2] : undefined$1;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined$1;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object = Object2(object);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object, source, index, customizer);
            }
          }
          return object;
        });
      }
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee2) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee2);
          }
          var length = collection.length, index = fromRight ? length : -1, iterable = Object2(collection);
          while (fromRight ? index-- : ++index < length) {
            if (iteratee2(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      function createBaseFor(fromRight) {
        return function(object, iteratee2, keysFunc) {
          var index = -1, iterable = Object2(object), props = keysFunc(object), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee2(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object;
        };
      }
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined$1;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
        };
      }
      function createCtor(Ctor) {
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return new Ctor();
            case 1:
              return new Ctor(args[0]);
            case 2:
              return new Ctor(args[0], args[1]);
            case 3:
              return new Ctor(args[0], args[1], args[2]);
            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);
            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
          return isObject2(result2) ? result2 : thisBinding;
        };
      }
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length, placeholder = getHolder(wrapper);
          while (index--) {
            args[index] = arguments[index];
          }
          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              undefined$1,
              args,
              holders,
              undefined$1,
              undefined$1,
              arity - length
            );
          }
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object2(collection);
          if (!isArrayLike(collection)) {
            var iteratee2 = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee2(iterable[key], key, iterable);
            };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee2 ? collection[index] : index] : undefined$1;
        };
      }
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != "function") {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == "wrapper") {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];
            var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined$1;
            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments, value = args[0];
            if (wrapper && args.length == 1 && isArray2(value)) {
              return wrapper.plant(value).value();
            }
            var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
            while (++index2 < length) {
              result2 = funcs[index2].call(this, result2);
            }
            return result2;
          };
        });
      }
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined$1 : createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length;
          while (index--) {
            args[index] = arguments[index];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              thisArg,
              args,
              newHolders,
              argPos,
              ary2,
              arity - length
            );
          }
          var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary2 < length) {
            args.length = ary2;
          }
          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }
      function createInverter(setter, toIteratee) {
        return function(object, iteratee2) {
          return baseInverter(object, setter, toIteratee(iteratee2), {});
        };
      }
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result2;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result2 = value;
          }
          if (other !== undefined$1) {
            if (result2 === undefined$1) {
              return other;
            }
            if (typeof value == "string" || typeof other == "string") {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result2 = operator(value, other);
          }
          return result2;
        };
      }
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee2) {
              return apply(iteratee2, thisArg, args);
            });
          });
        });
      }
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
      }
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
            end = step = undefined$1;
          }
          start = toFinite(start);
          if (end === undefined$1) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == "string" && typeof other == "string")) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined$1, newHoldersRight = isCurry ? undefined$1 : holders, newPartials = isCurry ? partials : undefined$1, newPartialsRight = isCurry ? undefined$1 : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func,
          bitmask,
          thisArg,
          newPartials,
          newHolders,
          newPartialsRight,
          newHoldersRight,
          argPos,
          ary2,
          arity
        ];
        var result2 = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result2, newData);
        }
        result2.placeholder = placeholder;
        return setWrapToString(result2, func, bitmask);
      }
      function createRound(methodName) {
        var func = Math2[methodName];
        return function(number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number)) {
            var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
            pair = (toString(value) + "e").split("e");
            return +(pair[0] + "e" + (+pair[1] - precision));
          }
          return func(number);
        };
      }
      var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop2 : function(values2) {
        return new Set2(values2);
      };
      function createToPairs(keysFunc) {
        return function(object) {
          var tag = getTag(object);
          if (tag == mapTag) {
            return mapToArray(object);
          }
          if (tag == setTag) {
            return setToPairs(object);
          }
          return baseToPairs(object, keysFunc(object));
        };
      }
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary2 = ary2 === undefined$1 ? ary2 : nativeMax(toInteger(ary2), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;
        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials, holdersRight = holders;
          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);
        var newData = [
          func,
          bitmask,
          thisArg,
          partials,
          holders,
          partialsRight,
          holdersRight,
          argPos,
          ary2,
          arity
        ];
        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result2 = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result2 = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result2 = createPartial(func, bitmask, thisArg, partials);
        } else {
          result2 = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result2, newData), func, bitmask);
      }
      function customDefaultsAssignIn(objValue, srcValue, key, object) {
        if (objValue === undefined$1 || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          return srcValue;
        }
        return objValue;
      }
      function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
        if (isObject2(objValue) && isObject2(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack["delete"](srcValue);
        }
        return objValue;
      }
      function customOmitClone(value) {
        return isPlainObject2(value) ? undefined$1 : value;
      }
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array;
        }
        var index = -1, result2 = true, seen2 = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined$1;
        stack.set(array, other);
        stack.set(other, array);
        while (++index < arrLength) {
          var arrValue = array[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result2 = false;
            break;
          }
          if (seen2) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen2, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen2.push(othIndex);
              }
            })) {
              result2 = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result2 = false;
            break;
          }
        }
        stack["delete"](array);
        stack["delete"](other);
        return result2;
      }
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);
          case errorTag:
            return object.name == other.name && object.message == other.message;
          case regexpTag:
          case stringTag:
            return object == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result2 = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result2;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object;
        }
        var result2 = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }
          if (!(compared === undefined$1 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result2 = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result2 && !skipCtor) {
          var objCtor = object.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result2 = false;
          }
        }
        stack["delete"](object);
        stack["delete"](other);
        return result2;
      }
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten), func + "");
      }
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }
      var getData = !metaMap ? noop2 : function(func) {
        return metaMap.get(func);
      };
      function getFuncName(func) {
        var result2 = func.name + "", array = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array.length : 0;
        while (length--) {
          var data = array[length], otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result2;
      }
      function getHolder(func) {
        var object = hasOwnProperty.call(lodash2, "placeholder") ? lodash2 : func;
        return object.placeholder;
      }
      function getIteratee() {
        var result2 = lodash2.iteratee || iteratee;
        result2 = result2 === iteratee ? baseIteratee : result2;
        return arguments.length ? result2(arguments[0], arguments[1]) : result2;
      }
      function getMapData(map2, key) {
        var data = map2.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getMatchData(object) {
        var result2 = keys(object), length = result2.length;
        while (length--) {
          var key = result2[length], value = object[key];
          result2[length] = [key, value, isStrictComparable(value)];
        }
        return result2;
      }
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined$1;
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {
        }
        var result2 = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result2;
      }
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object2(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result2 = [];
        while (object) {
          arrayPush(result2, getSymbols(object));
          object = getPrototype(object);
        }
        return result2;
      };
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined$1, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result2;
        };
      }
      function getView(start, end, transforms) {
        var index = -1, length = transforms.length;
        while (++index < length) {
          var data = transforms[index], size2 = data.size;
          switch (data.type) {
            case "drop":
              start += size2;
              break;
            case "dropRight":
              end -= size2;
              break;
            case "take":
              end = nativeMin(end, start + size2);
              break;
            case "takeRight":
              start = nativeMax(start, end - size2);
              break;
          }
        }
        return { "start": start, "end": end };
      }
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index = -1, length = path.length, result2 = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result2 = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result2 || ++index != length) {
          return result2;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray2(object) || isArguments(object));
      }
      function initCloneArray(array) {
        var length = array.length, result2 = new array.constructor(length);
        if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
          result2.index = array.index;
          result2.input = array.input;
        }
        return result2;
      }
      function initCloneObject(object) {
        return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }
      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);
          case boolTag:
          case dateTag:
            return new Ctor(+object);
          case dataViewTag:
            return cloneDataView(object, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object);
          case regexpTag:
            return cloneRegExp(object);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object);
        }
      }
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
        details = details.join(length > 2 ? ", " : " ");
        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
      }
      function isFlattenable(value) {
        return isArray2(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index, object) {
        if (!isObject2(object)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
          return eq(object[index], value);
        }
        return false;
      }
      function isKey(value, object) {
        if (isArray2(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object2(object);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isLaziable(func) {
        var funcName = getFuncName(func), other = lodash2[funcName];
        if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var isMaskable = coreJsData ? isFunction : stubFalse;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function isStrictComparable(value) {
        return value === value && !isObject2(value);
      }
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue && (srcValue !== undefined$1 || key in Object2(object));
        };
      }
      function memoizeCapped(func) {
        var result2 = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result2.cache;
        return result2;
      }
      function mergeData(data, source) {
        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
        if (!(isCommon || isCombo)) {
          return data;
        }
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        value = source[7];
        if (value) {
          data[7] = value;
        }
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        if (data[9] == null) {
          data[9] = source[9];
        }
        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }
      function nativeKeysIn(object) {
        var result2 = [];
        if (object != null) {
          for (var key in Object2(object)) {
            result2.push(key);
          }
        }
        return result2;
      }
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      function overRest(func, start, transform2) {
        start = nativeMax(start === undefined$1 ? func.length - 1 : start, 0);
        return function() {
          var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array2(length);
          while (++index < length) {
            array[index] = args[start + index];
          }
          index = -1;
          var otherArgs = Array2(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform2(array);
          return apply(func, this, otherArgs);
        };
      }
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }
      function reorder(array, indexes) {
        var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
        while (length--) {
          var index = indexes[length];
          array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
        }
        return array;
      }
      function safeGet(object, key) {
        if (key === "constructor" && typeof object[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object[key];
      }
      var setData = shortOut(baseSetData);
      var setTimeout2 = ctxSetTimeout || function(func, wait) {
        return root.setTimeout(func, wait);
      };
      var setToString = shortOut(baseSetToString);
      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + "";
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      function shortOut(func) {
        var count = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }
      function shuffleSelf(array, size2) {
        var index = -1, length = array.length, lastIndex = length - 1;
        size2 = size2 === undefined$1 ? length : size2;
        while (++index < size2) {
          var rand = baseRandom(index, lastIndex), value = array[rand];
          array[rand] = array[index];
          array[index] = value;
        }
        array.length = size2;
        return array;
      }
      var stringToPath = memoizeCapped(function(string) {
        var result2 = [];
        if (string.charCodeAt(0) === 46) {
          result2.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result2.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result2;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = "_." + pair[0];
          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result2.__actions__ = copyArray(wrapper.__actions__);
        result2.__index__ = wrapper.__index__;
        result2.__values__ = wrapper.__values__;
        return result2;
      }
      function chunk(array, size2, guard) {
        if (guard ? isIterateeCall(array, size2, guard) : size2 === undefined$1) {
          size2 = 1;
        } else {
          size2 = nativeMax(toInteger(size2), 0);
        }
        var length = array == null ? 0 : array.length;
        if (!length || size2 < 1) {
          return [];
        }
        var index = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
        while (index < length) {
          result2[resIndex++] = baseSlice(array, index, index += size2);
        }
        return result2;
      }
      function compact(array) {
        var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array[index];
          if (value) {
            result2[resIndex++] = value;
          }
        }
        return result2;
      }
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array2(length - 1), array = arguments[0], index = length;
        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray2(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }
      var difference = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function(array, values2) {
        var iteratee2 = last(values2);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
      });
      var differenceWith = baseRest(function(array, values2) {
        var comparator = last(values2);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), undefined$1, comparator) : [];
      });
      function drop(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function dropRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function dropRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
      }
      function dropWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
      }
      function fill(array, value, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array, value, start, end);
      }
      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index);
      }
      function findLastIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length - 1;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index, true);
      }
      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }
      function flattenDeep(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, INFINITY) : [];
      }
      function flattenDepth(array, depth) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array, depth);
      }
      function fromPairs(pairs) {
        var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
        while (++index < length) {
          var pair = pairs[index];
          result2[pair[0]] = pair[1];
        }
        return result2;
      }
      function head(array) {
        return array && array.length ? array[0] : undefined$1;
      }
      function indexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseIndexOf(array, value, index);
      }
      function initial(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 0, -1) : [];
      }
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        if (iteratee2 === last(mapped)) {
          iteratee2 = undefined$1;
        } else {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
      });
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined$1, comparator) : [];
      });
      function join(array, separator) {
        return array == null ? "" : nativeJoin.call(array, separator);
      }
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined$1;
      }
      function lastIndexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
      }
      function nth(array, n) {
        return array && array.length ? baseNth(array, toInteger(n)) : undefined$1;
      }
      var pull = baseRest(pullAll);
      function pullAll(array, values2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2) : array;
      }
      function pullAllBy(array, values2, iteratee2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, getIteratee(iteratee2, 2)) : array;
      }
      function pullAllWith(array, values2, comparator) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, undefined$1, comparator) : array;
      }
      var pullAt = flatRest(function(array, indexes) {
        var length = array == null ? 0 : array.length, result2 = baseAt(array, indexes);
        basePullAt(array, arrayMap(indexes, function(index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));
        return result2;
      });
      function remove(array, predicate) {
        var result2 = [];
        if (!(array && array.length)) {
          return result2;
        }
        var index = -1, indexes = [], length = array.length;
        predicate = getIteratee(predicate, 3);
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result2.push(value);
            indexes.push(index);
          }
        }
        basePullAt(array, indexes);
        return result2;
      }
      function reverse(array) {
        return array == null ? array : nativeReverse.call(array);
      }
      function slice(array, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
          start = 0;
          end = length;
        } else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array, start, end);
      }
      function sortedIndex(array, value) {
        return baseSortedIndex(array, value);
      }
      function sortedIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2));
      }
      function sortedIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value);
          if (index < length && eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedLastIndex(array, value) {
        return baseSortedIndex(array, value, true);
      }
      function sortedLastIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2), true);
      }
      function sortedLastIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value, true) - 1;
          if (eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedUniq(array) {
        return array && array.length ? baseSortedUniq(array) : [];
      }
      function sortedUniqBy(array, iteratee2) {
        return array && array.length ? baseSortedUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function tail(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 1, length) : [];
      }
      function take(array, n, guard) {
        if (!(array && array.length)) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function takeRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function takeRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
      }
      function takeWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
      }
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
      });
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });
      function uniq(array) {
        return array && array.length ? baseUniq(array) : [];
      }
      function uniqBy(array, iteratee2) {
        return array && array.length ? baseUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function uniqWith(array, comparator) {
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return array && array.length ? baseUniq(array, undefined$1, comparator) : [];
      }
      function unzip(array) {
        if (!(array && array.length)) {
          return [];
        }
        var length = 0;
        array = arrayFilter(array, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index) {
          return arrayMap(array, baseProperty(index));
        });
      }
      function unzipWith(array, iteratee2) {
        if (!(array && array.length)) {
          return [];
        }
        var result2 = unzip(array);
        if (iteratee2 == null) {
          return result2;
        }
        return arrayMap(result2, function(group) {
          return apply(iteratee2, undefined$1, group);
        });
      }
      var without = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, values2) : [];
      });
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
      });
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });
      var zip = baseRest(unzip);
      function zipObject(props, values2) {
        return baseZipObject(props || [], values2 || [], assignValue);
      }
      function zipObjectDeep(props, values2) {
        return baseZipObject(props || [], values2 || [], baseSet);
      }
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined$1;
        iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined$1;
        return unzipWith(arrays, iteratee2);
      });
      function chain(value) {
        var result2 = lodash2(value);
        result2.__chain__ = true;
        return result2;
      }
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }
      function thru(value, interceptor) {
        return interceptor(value);
      }
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
          return baseAt(object, paths);
        };
        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          "func": thru,
          "args": [interceptor],
          "thisArg": undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array) {
          if (length && !array.length) {
            array.push(undefined$1);
          }
          return array;
        });
      });
      function wrapperChain() {
        return chain(this);
      }
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length, value = done ? undefined$1 : this.__values__[this.__index__++];
        return { "done": done, "value": value };
      }
      function wrapperToIterator() {
        return this;
      }
      function wrapperPlant(value) {
        var result2, parent2 = this;
        while (parent2 instanceof baseLodash) {
          var clone2 = wrapperClone(parent2);
          clone2.__index__ = 0;
          clone2.__values__ = undefined$1;
          if (result2) {
            previous.__wrapped__ = clone2;
          } else {
            result2 = clone2;
          }
          var previous = clone2;
          parent2 = parent2.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result2;
      }
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            "func": thru,
            "args": [reverse],
            "thisArg": undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      var countBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          ++result2[key];
        } else {
          baseAssignValue(result2, key, 1);
        }
      });
      function every(collection, predicate, guard) {
        var func = isArray2(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      function filter(collection, predicate) {
        var func = isArray2(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }
      var find = createFind(findIndex);
      var findLast = createFind(findLastIndex);
      function flatMap(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), 1);
      }
      function flatMapDeep(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), INFINITY);
      }
      function flatMapDepth(collection, iteratee2, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map(collection, iteratee2), depth);
      }
      function forEach(collection, iteratee2) {
        var func = isArray2(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function forEachRight(collection, iteratee2) {
        var func = isArray2(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee2, 3));
      }
      var groupBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          result2[key].push(value);
        } else {
          baseAssignValue(result2, key, [value]);
        }
      });
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }
      var invokeMap = baseRest(function(collection, path, args) {
        var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value) {
          result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result2;
      });
      var keyBy = createAggregator(function(result2, value, key) {
        baseAssignValue(result2, key, value);
      });
      function map(collection, iteratee2) {
        var func = isArray2(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray2(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray2(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }
      var partition = createAggregator(function(result2, value, key) {
        result2[key ? 0 : 1].push(value);
      }, function() {
        return [[], []];
      });
      function reduce(collection, iteratee2, accumulator) {
        var func = isArray2(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
      }
      function reduceRight(collection, iteratee2, accumulator) {
        var func = isArray2(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
      }
      function reject(collection, predicate) {
        var func = isArray2(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }
      function sample(collection) {
        var func = isArray2(collection) ? arraySample : baseSample;
        return func(collection);
      }
      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray2(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      function shuffle(collection) {
        var func = isArray2(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      function some(collection, predicate, guard) {
        var func = isArray2(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      var now2 = ctxNow || function() {
        return root.Date.now();
      };
      function after(n, func) {
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }
      function before(n, func) {
        var result2;
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result2 = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result2;
        };
      }
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey = baseRest(function(object, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object, partials, holders);
      });
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curry.placeholder;
        return result2;
      }
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curryRight.placeholder;
        return result2;
      }
      function debounce(func, wait, options) {
        var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject2(options)) {
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function invokeFunc(time) {
          var args = lastArgs, thisArg = lastThis;
          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result2 = func.apply(thisArg, args);
          return result2;
        }
        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout2(timerExpired, wait);
          return leading ? invokeFunc(time) : result2;
        }
        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined$1 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }
        function timerExpired() {
          var time = now2();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          timerId = setTimeout2(timerExpired, remainingWait(time));
        }
        function trailingEdge(time) {
          timerId = undefined$1;
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result2;
        }
        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout2(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }
        function flush() {
          return timerId === undefined$1 ? result2 : trailingEdge(now2());
        }
        function debounced() {
          var time = now2(), isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              clearTimeout2(timerId);
              timerId = setTimeout2(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout2(timerExpired, wait);
          }
          return result2;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result2 = func.apply(this, args);
          memoized.cache = cache.set(key, result2) || cache;
          return result2;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function negate(predicate) {
        if (typeof predicate != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return !predicate.call(this);
            case 1:
              return !predicate.call(this, args[0]);
            case 2:
              return !predicate.call(this, args[0], args[1]);
            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }
      function once(func) {
        return before(2, func);
      }
      var overArgs = castRest(function(func, transforms) {
        transforms = transforms.length == 1 && isArray2(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1, length = nativeMin(args.length, funcsLength);
          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });
      function rest(func, start) {
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = start === undefined$1 ? start : toInteger(start);
        return baseRest(func, start);
      }
      function spread(func, start) {
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array = args[start], otherArgs = castSlice(args, 0, start);
          if (array) {
            arrayPush(otherArgs, array);
          }
          return apply(func, this, otherArgs);
        });
      }
      function throttle(func, wait, options) {
        var leading = true, trailing = true;
        if (typeof func != "function") {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        if (isObject2(options)) {
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
          "leading": leading,
          "maxWait": wait,
          "trailing": trailing
        });
      }
      function unary(func) {
        return ary(func, 1);
      }
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray2(value) ? value : [value];
      }
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      function cloneWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }
      function conformsTo(object, source) {
        return source == null || baseConformsTo(object, source, keys(source));
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(function() {
        return arguments;
      }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      var isArray2 = Array2.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject2(value);
      }
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray2(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        var result2 = customizer ? customizer(value, other) : undefined$1;
        return result2 === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result2;
      }
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject2(value);
      }
      function isFinite(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      function isFunction(value) {
        if (!isObject2(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isInteger(value) {
        return typeof value == "number" && value == toInteger(value);
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject2(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }
      function isMatchWith(object, source, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseIsMatch(object, source, getMatchData(source), customizer);
      }
      function isNaN(value) {
        return isNumber(value) && value != +value;
      }
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error2(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }
      function isNull(value) {
        return value === null;
      }
      function isNil(value) {
        return value == null;
      }
      function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
      }
      function isPlainObject2(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      function isString(value) {
        return typeof value == "string" || !isArray2(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      function isUndefined(value) {
        return value === undefined$1;
      }
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result2 = toFinite(value), remainder = result2 % 1;
        return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      var assign2 = createAssigner(function(object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function(object, source) {
        copyObject(source, keysIn(source), object);
      });
      var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
      });
      var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keys(source), object, customizer);
      });
      var at = flatRest(baseAt);
      function create(prototype, properties) {
        var result2 = baseCreate(prototype);
        return properties == null ? result2 : baseAssign(result2, properties);
      }
      var defaults2 = baseRest(function(object, sources) {
        object = Object2(object);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];
            if (value === undefined$1 || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
              object[key] = source[key];
            }
          }
        }
        return object;
      });
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });
      function findKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
      }
      function findLastKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
      }
      function forIn(object, iteratee2) {
        return object == null ? object : baseFor(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forInRight(object, iteratee2) {
        return object == null ? object : baseForRight(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forOwn(object, iteratee2) {
        return object && baseForOwn(object, getIteratee(iteratee2, 3));
      }
      function forOwnRight(object, iteratee2) {
        return object && baseForOwnRight(object, getIteratee(iteratee2, 3));
      }
      function functions(object) {
        return object == null ? [] : baseFunctions(object, keys(object));
      }
      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn(object));
      }
      function get(object, path, defaultValue) {
        var result2 = object == null ? undefined$1 : baseGet(object, path);
        return result2 === undefined$1 ? defaultValue : result2;
      }
      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }
      var invert = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        result2[value] = key;
      }, constant(identity));
      var invertBy = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        if (hasOwnProperty.call(result2, value)) {
          result2[value].push(key);
        } else {
          result2[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }
      function mapKeys(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, iteratee2(value, key, object2), value);
        });
        return result2;
      }
      function mapValues(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, key, iteratee2(value, key, object2));
        });
        return result2;
      }
      var merge = createAssigner(function(object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });
      var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      });
      var omit = flatRest(function(object, paths) {
        var result2 = {};
        if (object == null) {
          return result2;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object, getAllKeysIn(object), result2);
        if (isDeep) {
          result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result2, paths[length]);
        }
        return result2;
      });
      function omitBy(object, predicate) {
        return pickBy(object, negate(getIteratee(predicate)));
      }
      var pick = flatRest(function(object, paths) {
        return object == null ? {} : basePick(object, paths);
      });
      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      function result(object, path, defaultValue) {
        path = castPath(path, object);
        var index = -1, length = path.length;
        if (!length) {
          length = 1;
          object = undefined$1;
        }
        while (++index < length) {
          var value = object == null ? undefined$1 : object[toKey(path[index])];
          if (value === undefined$1) {
            index = length;
            value = defaultValue;
          }
          object = isFunction(value) ? value.call(object) : value;
        }
        return object;
      }
      function set(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }
      function setWith(object, path, value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseSet(object, path, value, customizer);
      }
      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);
      function transform(object, iteratee2, accumulator) {
        var isArr = isArray2(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
        iteratee2 = getIteratee(iteratee2, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject2(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object2) {
          return iteratee2(accumulator, value, index, object2);
        });
        return accumulator;
      }
      function unset(object, path) {
        return object == null ? true : baseUnset(object, path);
      }
      function update2(object, path, updater) {
        return object == null ? object : baseUpdate(object, path, castFunction(updater));
      }
      function updateWith(object, path, updater, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
      }
      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }
      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn(object));
      }
      function clamp(number, lower, upper) {
        if (upper === undefined$1) {
          upper = lower;
          lower = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower !== undefined$1) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }
        return baseClamp(toNumber(number), lower, upper);
      }
      function inRange(number, start, end) {
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        number = toNumber(number);
        return baseInRange(number, start, end);
      }
      function random(lower, upper, floating) {
        if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == "boolean") {
            floating = upper;
            upper = undefined$1;
          } else if (typeof lower == "boolean") {
            floating = lower;
            lower = undefined$1;
          }
        }
        if (lower === undefined$1 && upper === undefined$1) {
          lower = 0;
          upper = 1;
        } else {
          lower = toFinite(lower);
          if (upper === undefined$1) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }
        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
        }
        return baseRandom(lower, upper);
      }
      var camelCase = createCompounder(function(result2, word, index) {
        word = word.toLowerCase();
        return result2 + (index ? capitalize(word) : word);
      });
      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }
      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
      }
      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined$1 ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }
      function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }
      function escapeRegExp(string) {
        string = toString(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
      }
      var kebabCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "-" : "") + word.toLowerCase();
      });
      var lowerCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst("toLowerCase");
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      function parseInt2(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
      }
      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }
      function replace() {
        var args = arguments, string = toString(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }
      var snakeCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "_" : "") + word.toLowerCase();
      });
      function split(string, separator, limit) {
        if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString(string);
        if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }
      var startCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + upperFirst(word);
      });
      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }
      function template(string, options, guard) {
        var settings = lodash2.templateSettings;
        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
        var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
        var reDelimiters = RegExp2(
          (options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
          "g"
        );
        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = hasOwnProperty.call(options, "variable") && options.variable;
        if (!variable) {
          source = "with (obj) {\n" + source + "\n}\n";
        } else if (reForbiddenIdentifierChars.test(variable)) {
          throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
        }
        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
        var result2 = attempt(function() {
          return Function2(importsKeys, sourceURL + "return " + source).apply(undefined$1, importsValues);
        });
        result2.source = source;
        if (isError(result2)) {
          throw result2;
        }
        return result2;
      }
      function toLower(value) {
        return toString(value).toLowerCase();
      }
      function toUpper(value) {
        return toString(value).toUpperCase();
      }
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return baseTrim(string);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start, end).join("");
      }
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.slice(0, trimmedEndIndex(string) + 1);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join("");
      }
      function trimStart(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, "");
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start).join("");
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject2(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === undefined$1) {
          return result2 + omission;
        }
        if (strSymbols) {
          end += result2.length - end;
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result2;
            if (!separator.global) {
              separator = RegExp2(separator.source, toString(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result2 = result2.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result2.lastIndexOf(separator);
          if (index > -1) {
            result2 = result2.slice(0, index);
          }
        }
        return result2 + omission;
      }
      function unescape(string) {
        string = toString(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }
      var upperCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toUpperCase();
      });
      var upperFirst = createCaseFirst("toUpperCase");
      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined$1 : pattern;
        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error2(e);
        }
      });
      var bindAll = flatRest(function(object, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object, key, bind(object[key], object));
        });
        return object;
      });
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != "function") {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function(args) {
          var index = -1;
          while (++index < length) {
            var pair = pairs[index];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }
      function constant(value) {
        return function() {
          return value;
        };
      }
      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }
      var flow = createFlow();
      var flowRight = createFlow(true);
      function identity(value) {
        return value;
      }
      function iteratee(func) {
        return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
      }
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }
      var method = baseRest(function(path, args) {
        return function(object) {
          return baseInvoke(object, path, args);
        };
      });
      var methodOf = baseRest(function(object, args) {
        return function(path) {
          return baseInvoke(object, path, args);
        };
      });
      function mixin(object, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject2(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object;
          object = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain2 = !(isObject2(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object[methodName] = func;
          if (isFunc) {
            object.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain2 || chainAll) {
                var result2 = object(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                actions.push({ "func": func, "args": arguments, "thisArg": object });
                result2.__chain__ = chainAll;
                return result2;
              }
              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }
        });
        return object;
      }
      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }
        return this;
      }
      function noop2() {
      }
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }
      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      function propertyOf(object) {
        return function(path) {
          return object == null ? undefined$1 : baseGet(object, path);
        };
      }
      var range = createRange();
      var rangeRight = createRange(true);
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      function stubObject() {
        return {};
      }
      function stubString() {
        return "";
      }
      function stubTrue() {
        return true;
      }
      function times(n, iteratee2) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee2 = getIteratee(iteratee2);
        n -= MAX_ARRAY_LENGTH;
        var result2 = baseTimes(length, iteratee2);
        while (++index < n) {
          iteratee2(index);
        }
        return result2;
      }
      function toPath(value) {
        if (isArray2(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound("ceil");
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound("floor");
      function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined$1;
      }
      function maxBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseGt) : undefined$1;
      }
      function mean(array) {
        return baseMean(array, identity);
      }
      function meanBy(array, iteratee2) {
        return baseMean(array, getIteratee(iteratee2, 2));
      }
      function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined$1;
      }
      function minBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseLt) : undefined$1;
      }
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound("round");
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);
      function sum(array) {
        return array && array.length ? baseSum(array, identity) : 0;
      }
      function sumBy(array, iteratee2) {
        return array && array.length ? baseSum(array, getIteratee(iteratee2, 2)) : 0;
      }
      lodash2.after = after;
      lodash2.ary = ary;
      lodash2.assign = assign2;
      lodash2.assignIn = assignIn;
      lodash2.assignInWith = assignInWith;
      lodash2.assignWith = assignWith;
      lodash2.at = at;
      lodash2.before = before;
      lodash2.bind = bind;
      lodash2.bindAll = bindAll;
      lodash2.bindKey = bindKey;
      lodash2.castArray = castArray;
      lodash2.chain = chain;
      lodash2.chunk = chunk;
      lodash2.compact = compact;
      lodash2.concat = concat;
      lodash2.cond = cond;
      lodash2.conforms = conforms;
      lodash2.constant = constant;
      lodash2.countBy = countBy;
      lodash2.create = create;
      lodash2.curry = curry;
      lodash2.curryRight = curryRight;
      lodash2.debounce = debounce;
      lodash2.defaults = defaults2;
      lodash2.defaultsDeep = defaultsDeep;
      lodash2.defer = defer;
      lodash2.delay = delay;
      lodash2.difference = difference;
      lodash2.differenceBy = differenceBy;
      lodash2.differenceWith = differenceWith;
      lodash2.drop = drop;
      lodash2.dropRight = dropRight;
      lodash2.dropRightWhile = dropRightWhile;
      lodash2.dropWhile = dropWhile;
      lodash2.fill = fill;
      lodash2.filter = filter;
      lodash2.flatMap = flatMap;
      lodash2.flatMapDeep = flatMapDeep;
      lodash2.flatMapDepth = flatMapDepth;
      lodash2.flatten = flatten;
      lodash2.flattenDeep = flattenDeep;
      lodash2.flattenDepth = flattenDepth;
      lodash2.flip = flip;
      lodash2.flow = flow;
      lodash2.flowRight = flowRight;
      lodash2.fromPairs = fromPairs;
      lodash2.functions = functions;
      lodash2.functionsIn = functionsIn;
      lodash2.groupBy = groupBy;
      lodash2.initial = initial;
      lodash2.intersection = intersection;
      lodash2.intersectionBy = intersectionBy;
      lodash2.intersectionWith = intersectionWith;
      lodash2.invert = invert;
      lodash2.invertBy = invertBy;
      lodash2.invokeMap = invokeMap;
      lodash2.iteratee = iteratee;
      lodash2.keyBy = keyBy;
      lodash2.keys = keys;
      lodash2.keysIn = keysIn;
      lodash2.map = map;
      lodash2.mapKeys = mapKeys;
      lodash2.mapValues = mapValues;
      lodash2.matches = matches;
      lodash2.matchesProperty = matchesProperty;
      lodash2.memoize = memoize;
      lodash2.merge = merge;
      lodash2.mergeWith = mergeWith;
      lodash2.method = method;
      lodash2.methodOf = methodOf;
      lodash2.mixin = mixin;
      lodash2.negate = negate;
      lodash2.nthArg = nthArg;
      lodash2.omit = omit;
      lodash2.omitBy = omitBy;
      lodash2.once = once;
      lodash2.orderBy = orderBy;
      lodash2.over = over;
      lodash2.overArgs = overArgs;
      lodash2.overEvery = overEvery;
      lodash2.overSome = overSome;
      lodash2.partial = partial;
      lodash2.partialRight = partialRight;
      lodash2.partition = partition;
      lodash2.pick = pick;
      lodash2.pickBy = pickBy;
      lodash2.property = property;
      lodash2.propertyOf = propertyOf;
      lodash2.pull = pull;
      lodash2.pullAll = pullAll;
      lodash2.pullAllBy = pullAllBy;
      lodash2.pullAllWith = pullAllWith;
      lodash2.pullAt = pullAt;
      lodash2.range = range;
      lodash2.rangeRight = rangeRight;
      lodash2.rearg = rearg;
      lodash2.reject = reject;
      lodash2.remove = remove;
      lodash2.rest = rest;
      lodash2.reverse = reverse;
      lodash2.sampleSize = sampleSize;
      lodash2.set = set;
      lodash2.setWith = setWith;
      lodash2.shuffle = shuffle;
      lodash2.slice = slice;
      lodash2.sortBy = sortBy;
      lodash2.sortedUniq = sortedUniq;
      lodash2.sortedUniqBy = sortedUniqBy;
      lodash2.split = split;
      lodash2.spread = spread;
      lodash2.tail = tail;
      lodash2.take = take;
      lodash2.takeRight = takeRight;
      lodash2.takeRightWhile = takeRightWhile;
      lodash2.takeWhile = takeWhile;
      lodash2.tap = tap;
      lodash2.throttle = throttle;
      lodash2.thru = thru;
      lodash2.toArray = toArray;
      lodash2.toPairs = toPairs;
      lodash2.toPairsIn = toPairsIn;
      lodash2.toPath = toPath;
      lodash2.toPlainObject = toPlainObject;
      lodash2.transform = transform;
      lodash2.unary = unary;
      lodash2.union = union;
      lodash2.unionBy = unionBy;
      lodash2.unionWith = unionWith;
      lodash2.uniq = uniq;
      lodash2.uniqBy = uniqBy;
      lodash2.uniqWith = uniqWith;
      lodash2.unset = unset;
      lodash2.unzip = unzip;
      lodash2.unzipWith = unzipWith;
      lodash2.update = update2;
      lodash2.updateWith = updateWith;
      lodash2.values = values;
      lodash2.valuesIn = valuesIn;
      lodash2.without = without;
      lodash2.words = words;
      lodash2.wrap = wrap;
      lodash2.xor = xor;
      lodash2.xorBy = xorBy;
      lodash2.xorWith = xorWith;
      lodash2.zip = zip;
      lodash2.zipObject = zipObject;
      lodash2.zipObjectDeep = zipObjectDeep;
      lodash2.zipWith = zipWith;
      lodash2.entries = toPairs;
      lodash2.entriesIn = toPairsIn;
      lodash2.extend = assignIn;
      lodash2.extendWith = assignInWith;
      mixin(lodash2, lodash2);
      lodash2.add = add;
      lodash2.attempt = attempt;
      lodash2.camelCase = camelCase;
      lodash2.capitalize = capitalize;
      lodash2.ceil = ceil;
      lodash2.clamp = clamp;
      lodash2.clone = clone;
      lodash2.cloneDeep = cloneDeep;
      lodash2.cloneDeepWith = cloneDeepWith;
      lodash2.cloneWith = cloneWith;
      lodash2.conformsTo = conformsTo;
      lodash2.deburr = deburr;
      lodash2.defaultTo = defaultTo;
      lodash2.divide = divide;
      lodash2.endsWith = endsWith;
      lodash2.eq = eq;
      lodash2.escape = escape;
      lodash2.escapeRegExp = escapeRegExp;
      lodash2.every = every;
      lodash2.find = find;
      lodash2.findIndex = findIndex;
      lodash2.findKey = findKey;
      lodash2.findLast = findLast;
      lodash2.findLastIndex = findLastIndex;
      lodash2.findLastKey = findLastKey;
      lodash2.floor = floor;
      lodash2.forEach = forEach;
      lodash2.forEachRight = forEachRight;
      lodash2.forIn = forIn;
      lodash2.forInRight = forInRight;
      lodash2.forOwn = forOwn;
      lodash2.forOwnRight = forOwnRight;
      lodash2.get = get;
      lodash2.gt = gt;
      lodash2.gte = gte;
      lodash2.has = has;
      lodash2.hasIn = hasIn;
      lodash2.head = head;
      lodash2.identity = identity;
      lodash2.includes = includes;
      lodash2.indexOf = indexOf;
      lodash2.inRange = inRange;
      lodash2.invoke = invoke;
      lodash2.isArguments = isArguments;
      lodash2.isArray = isArray2;
      lodash2.isArrayBuffer = isArrayBuffer;
      lodash2.isArrayLike = isArrayLike;
      lodash2.isArrayLikeObject = isArrayLikeObject;
      lodash2.isBoolean = isBoolean;
      lodash2.isBuffer = isBuffer;
      lodash2.isDate = isDate;
      lodash2.isElement = isElement;
      lodash2.isEmpty = isEmpty;
      lodash2.isEqual = isEqual;
      lodash2.isEqualWith = isEqualWith;
      lodash2.isError = isError;
      lodash2.isFinite = isFinite;
      lodash2.isFunction = isFunction;
      lodash2.isInteger = isInteger;
      lodash2.isLength = isLength;
      lodash2.isMap = isMap;
      lodash2.isMatch = isMatch;
      lodash2.isMatchWith = isMatchWith;
      lodash2.isNaN = isNaN;
      lodash2.isNative = isNative;
      lodash2.isNil = isNil;
      lodash2.isNull = isNull;
      lodash2.isNumber = isNumber;
      lodash2.isObject = isObject2;
      lodash2.isObjectLike = isObjectLike;
      lodash2.isPlainObject = isPlainObject2;
      lodash2.isRegExp = isRegExp;
      lodash2.isSafeInteger = isSafeInteger;
      lodash2.isSet = isSet;
      lodash2.isString = isString;
      lodash2.isSymbol = isSymbol;
      lodash2.isTypedArray = isTypedArray;
      lodash2.isUndefined = isUndefined;
      lodash2.isWeakMap = isWeakMap;
      lodash2.isWeakSet = isWeakSet;
      lodash2.join = join;
      lodash2.kebabCase = kebabCase;
      lodash2.last = last;
      lodash2.lastIndexOf = lastIndexOf;
      lodash2.lowerCase = lowerCase;
      lodash2.lowerFirst = lowerFirst;
      lodash2.lt = lt;
      lodash2.lte = lte;
      lodash2.max = max;
      lodash2.maxBy = maxBy;
      lodash2.mean = mean;
      lodash2.meanBy = meanBy;
      lodash2.min = min;
      lodash2.minBy = minBy;
      lodash2.stubArray = stubArray;
      lodash2.stubFalse = stubFalse;
      lodash2.stubObject = stubObject;
      lodash2.stubString = stubString;
      lodash2.stubTrue = stubTrue;
      lodash2.multiply = multiply;
      lodash2.nth = nth;
      lodash2.noConflict = noConflict;
      lodash2.noop = noop2;
      lodash2.now = now2;
      lodash2.pad = pad;
      lodash2.padEnd = padEnd;
      lodash2.padStart = padStart;
      lodash2.parseInt = parseInt2;
      lodash2.random = random;
      lodash2.reduce = reduce;
      lodash2.reduceRight = reduceRight;
      lodash2.repeat = repeat;
      lodash2.replace = replace;
      lodash2.result = result;
      lodash2.round = round;
      lodash2.runInContext = runInContext2;
      lodash2.sample = sample;
      lodash2.size = size;
      lodash2.snakeCase = snakeCase;
      lodash2.some = some;
      lodash2.sortedIndex = sortedIndex;
      lodash2.sortedIndexBy = sortedIndexBy;
      lodash2.sortedIndexOf = sortedIndexOf;
      lodash2.sortedLastIndex = sortedLastIndex;
      lodash2.sortedLastIndexBy = sortedLastIndexBy;
      lodash2.sortedLastIndexOf = sortedLastIndexOf;
      lodash2.startCase = startCase;
      lodash2.startsWith = startsWith;
      lodash2.subtract = subtract;
      lodash2.sum = sum;
      lodash2.sumBy = sumBy;
      lodash2.template = template;
      lodash2.times = times;
      lodash2.toFinite = toFinite;
      lodash2.toInteger = toInteger;
      lodash2.toLength = toLength;
      lodash2.toLower = toLower;
      lodash2.toNumber = toNumber;
      lodash2.toSafeInteger = toSafeInteger;
      lodash2.toString = toString;
      lodash2.toUpper = toUpper;
      lodash2.trim = trim;
      lodash2.trimEnd = trimEnd;
      lodash2.trimStart = trimStart;
      lodash2.truncate = truncate;
      lodash2.unescape = unescape;
      lodash2.uniqueId = uniqueId;
      lodash2.upperCase = upperCase;
      lodash2.upperFirst = upperFirst;
      lodash2.each = forEach;
      lodash2.eachRight = forEachRight;
      lodash2.first = head;
      mixin(lodash2, function() {
        var source = {};
        baseForOwn(lodash2, function(func, methodName) {
          if (!hasOwnProperty.call(lodash2.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), { "chain": false });
      lodash2.VERSION = VERSION;
      arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
        lodash2[methodName].placeholder = lodash2;
      });
      arrayEach(["drop", "take"], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
          var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
          if (result2.__filtered__) {
            result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
          } else {
            result2.__views__.push({
              "size": nativeMin(n, MAX_ARRAY_LENGTH),
              "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
            });
          }
          return result2;
        };
        LazyWrapper.prototype[methodName + "Right"] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
        var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
        LazyWrapper.prototype[methodName] = function(iteratee2) {
          var result2 = this.clone();
          result2.__iteratees__.push({
            "iteratee": getIteratee(iteratee2, 3),
            "type": type
          });
          result2.__filtered__ = result2.__filtered__ || isFilter;
          return result2;
        };
      });
      arrayEach(["head", "last"], function(methodName, index) {
        var takeName = "take" + (index ? "Right" : "");
        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(["initial", "tail"], function(methodName, index) {
        var dropName = "drop" + (index ? "" : "Right");
        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });
      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };
      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };
      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };
      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == "function") {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });
      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };
      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);
        var result2 = this;
        if (result2.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result2);
        }
        if (start < 0) {
          result2 = result2.takeRight(-start);
        } else if (start) {
          result2 = result2.drop(start);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
        }
        return result2;
      };
      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };
      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash2[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
        if (!lodashFunc) {
          return;
        }
        lodash2.prototype[methodName] = function() {
          var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray2(value);
          var interceptor = function(value2) {
            var result3 = lodashFunc.apply(lodash2, arrayPush([value2], args));
            return isTaker && chainAll ? result3[0] : result3;
          };
          if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result2 = func.apply(value, args);
            result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined$1 });
            return new LodashWrapper(result2, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result2 = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
        };
      });
      arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
        lodash2.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray2(value) ? value : [], args);
          }
          return this[chainName](function(value2) {
            return func.apply(isArray2(value2) ? value2 : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash2[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + "";
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ "name": methodName, "func": lodashFunc });
        }
      });
      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        "name": "wrapper",
        "func": undefined$1
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash2.prototype.at = wrapperAt;
      lodash2.prototype.chain = wrapperChain;
      lodash2.prototype.commit = wrapperCommit;
      lodash2.prototype.next = wrapperNext;
      lodash2.prototype.plant = wrapperPlant;
      lodash2.prototype.reverse = wrapperReverse;
      lodash2.prototype.toJSON = lodash2.prototype.valueOf = lodash2.prototype.value = wrapperValue;
      lodash2.prototype.first = lodash2.prototype.head;
      if (symIterator) {
        lodash2.prototype[symIterator] = wrapperToIterator;
      }
      return lodash2;
    };
    var _ = runInContext();
    if (freeModule) {
      (freeModule.exports = _)._ = _;
      freeExports._ = _;
    } else {
      root._ = _;
    }
  }).call(commonjsGlobal);
})(lodash, lodash.exports);
var lodashExports = lodash.exports;
const DELAY_TIME = 800;
const checkGame = async (path) => {
  const gameConfig = await window.api.invoke("handle-check-game", path);
  const { dispatchDownloadTask } = useDownload();
  const { dispatchViewState } = useView();
  const { dispatchClientState } = useClient();
  if (gameConfig?.version) {
    dispatchClientState({
      gameVersion: gameConfig?.version,
      gamePath: path
    });
    dispatchDownloadTask({ state: "idle" });
    dispatchViewState("control");
    LocalStorageUtil.setItem("downloadPath", path);
    return true;
  } else {
    dispatchClientState({
      gameVersion: ""
    });
    dispatchDownloadTask({ state: "idle" });
    dispatchViewState("menu");
    return false;
  }
};
const handleNetError = lodashExports.debounce(() => {
  Message$2({
    title: i18n.global?.t("message.tip"),
    content: i18n.global?.t("message.network-error-check"),
    confirmText: i18n.global?.t("message.confirm"),
    onConfirm: () => {
      handleDownloadFailed();
    },
    onClose: () => {
      handleDownloadFailed();
    }
  });
}, DELAY_TIME);
const handleRequestManifestError = lodashExports.debounce(() => {
  Message$2({
    title: i18n.global.t("message.tip"),
    content: i18n.global.t("download.update-config-fail"),
    confirmText: i18n.global.t("message.retry"),
    onConfirm: () => {
      handleDownloadGame();
    },
    onClose: () => {
      handleDownloadFailed();
    }
  });
}, DELAY_TIME);
const handleNetworkErrorRetry = lodashExports.debounce(() => {
  Message$2({
    title: i18n.global?.t("message.tip"),
    content: i18n.global?.t("message.network-error-check"),
    confirmText: i18n.global?.t("message.retry"),
    onConfirm: () => {
      handleDownloadGame();
    },
    onClose: () => {
      handleDownloadFailed();
    }
  });
}, DELAY_TIME);
const handleNeedUpdate = () => {
  const { dispatchDownloadTask } = useDownload();
  Message$2({
    title: i18n.global.t("message.tip"),
    content: i18n.global.t("message.need-update"),
    confirmText: i18n.global.t("message.update"),
    onConfirm: () => {
      dispatchDownloadTask({ repair: false });
      handleDownloadGame();
    },
    onClose: () => {
      window.api.send("close-window");
    }
  });
};
const handleDownloadFailed = () => {
  const { dispatchDownloadTask } = useDownload();
  const { dispatchViewState } = useView();
  LocalStorageUtil.removeItem("download-task");
  dispatchDownloadTask({ state: "idle", basis: "", version: "", game_start_exe_name: "" });
  dispatchViewState("menu");
};
const handleDownloadGame = lodashExports.debounce(async () => {
  const { dispatchDownloadTask } = useDownload();
  const { dispatchViewState } = useView();
  const clientStore = useClient();
  const downloadStore = useDownload();
  const { dispatchClientState } = clientStore;
  const { clientState } = storeToRefs(clientStore);
  const { downloadTask } = storeToRefs(downloadStore);
  dispatchDownloadTask({ state: "loading" });
  try {
    dispatchViewState("progress");
    const gameInfo = await requestGameInfo();
    if (!gameInfo || !gameInfo?.game_latest_file_path) {
      window.api.send("ali-sls-log", "requestGameInfo", "api requestGameInfo get null data");
      handleNetError();
      return;
    }
    dispatchDownloadTask({
      state: "downloading",
      basis: gameInfo.game_latest_file_path,
      version: gameInfo.game_latest_version,
      game_start_exe_name: gameInfo.game_start_exe_name,
      game_start_exe_params: gameInfo.game_start_params || []
    });
    dispatchClientState({
      gameVersion: gameInfo.game_latest_version
    });
    LocalStorageUtil.setItem("downloadPath", clientState.value.gamePath);
    const lastTaskInfo = LocalStorageUtil.getItem("download-task");
    if (`${lastTaskInfo?.version}-${lastTaskInfo?.basis}-${lastTaskInfo?.path}` !== `${gameInfo.game_latest_version}-${gameInfo.game_latest_file_path}-${clientState.value.gamePath}`) {
      LocalStorageUtil.setItem("download-task", {
        version: gameInfo.game_latest_version,
        basis: gameInfo.game_latest_file_path,
        path: clientState.value.gamePath
      });
    }
    const res = await window.api.invoke(
      "handle-start-download",
      clientState.value.gamePath,
      gameInfo.game_latest_version,
      gameInfo.game_latest_file_path,
      gameInfo.game_start_exe_name,
      gameInfo.game_start_params || [],
      downloadTask.value.repair
    );
    if (!res) {
      handleNetError();
    }
  } catch (error) {
    window.api.send("ali-sls-log", "requestGameInfo catch", `${error}`);
    handleNetError();
  }
}, DELAY_TIME);
function useInitial() {
  const stepDone = reactive([]);
  const wrong = ref(false);
  const { dispatchDownloadTask } = useDownload();
  const { dispatchViewState } = useView();
  const { dispatchClientState, dispatchSettingsState } = useClient();
  const downloadPath = LocalStorageUtil.getItem("downloadPath") || "";
  const { t } = useI18n();
  const version = window.api.sendSync("request-current-version");
  dispatchClientState({
    clientVersion: version
  });
  const update2 = window.api.sendSync("request-check-update");
  const IDB = useIDB("image");
  if (update2) {
    IDB.getALL().then((res) => {
      if (res?.base64) {
        dispatchClientState({
          backgroundImage: res.base64
        });
      } else {
        dispatchClientState({
          backgroundImage: ""
        });
      }
    }).catch((err) => {
      dispatchClientState({
        backgroundImage: ""
      });
      window.api.send("ali-sls-log", "update IDB catch error", `${err}`);
    }).finally(() => {
      Message$1({ version: update2 });
      stepDone[0] = false;
    });
    return {
      done: computed(() => stepDone.every((v) => v)),
      wrong
    };
  } else {
    stepDone[0] = true;
  }
  window.api.sendSync("request-recover-games-folder");
  stepDone[1] = true;
  requestClientInfo().then(async (res) => {
    if (!res?.launcher_background_img) {
      dispatchClientState({
        backgroundImage: ""
      });
    } else {
      const IDBRes = await IDB.get(res.launcher_background_img_crc64);
      if (IDBRes?.base64) {
        dispatchClientState({
          backgroundImage: IDBRes.base64
        });
      } else {
        dispatchClientState({
          backgroundImage: ""
        });
        window.api.invoke("handle-request-http-image-base64", res.launcher_background_img).then((base64) => {
          IDB.set(res.launcher_background_img_crc64, base64);
          dispatchClientState({
            backgroundImage: base64
          });
        });
      }
    }
    if (res.config_open) {
      dispatchSettingsState({
        about: res.config_open,
        aboutCopyright: res.copyright_information,
        aboutPrivacy: res.privacy_policy,
        aboutProtocol: res.user_agreement
      });
    }
    if (res.notice_pop_open) {
      Message$2({
        type: "notification-info",
        title: t("message.tip"),
        content: res.notice_content,
        confirmText: res.exit_launcher_open ? t("message.notification-exit") : t("message.notification-confirm"),
        closeable: false,
        onConfirm() {
          if (res.exit_launcher_open) {
            window.api.send("close-window");
          }
        }
      });
    }
  }).catch((error) => {
    dispatchClientState({
      backgroundImage: ""
    });
    wrong.value = true;
    window.api.send("ali-sls-log", "initial error: requestClientInfo", `${error}`);
  }).finally(() => {
    stepDone[2] = true;
  });
  requestGameInfo().then(async (gameInfo) => {
    if (!gameInfo) {
      dispatchDownloadTask({ state: "idle" });
      dispatchViewState("menu");
      return;
    }
    dispatchClientState({
      gameSize: gameInfo?.decompression_size?.replaceAll(" ", "")
    });
    const task = LocalStorageUtil.getItem("download-task");
    if (task) {
      const sameTask = String.prototype.toLowerCase.call(
        `${gameInfo?.game_latest_file_path}-${gameInfo?.game_latest_version}`
      ) === String.prototype.toLowerCase.call(`${task?.basis}-${task?.version}`);
      if (sameTask) {
        dispatchClientState({
          gamePath: task.path
        });
        dispatchDownloadTask({
          repair: false,
          basis: gameInfo.game_latest_file_path,
          version: gameInfo.game_latest_version,
          game_start_exe_name: gameInfo.game_start_exe_name
        });
        handleDownloadGame();
        return;
      } else {
        LocalStorageUtil.removeItem("download-task");
      }
    }
    const gameConfig = await window.api.invoke("handle-check-game", downloadPath);
    dispatchDownloadTask({ state: "idle" });
    dispatchClientState({
      gameVersion: gameConfig?.version
    });
    if (!gameConfig?.version) {
      dispatchViewState("menu");
      return;
    }
    dispatchViewState("control");
    const gameNeedUpdate = versionCompare(gameConfig?.version, gameInfo.game_lowest_version) === -1;
    if (gameNeedUpdate) {
      handleNeedUpdate();
    }
  }).catch((error) => {
    wrong.value = true;
    window.api.send("ali-sls-log", "initial error: requestGameInfo", `${error}`);
  }).finally(() => {
    stepDone[3] = true;
  });
  const done = computed(() => stepDone.every((v) => v));
  return {
    done,
    wrong
  };
}
const _hoisted_1$A = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "32",
  height: "32"
};
function render$r(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$A, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "#656565",
      "fill-rule": "nonzero",
      d: "M23.726 8.274a.94.94 0 0 1 .084 1.229l-.084.096L17.324 16l6.402 6.401a.936.936 0 0 1-1.229 1.409l-.096-.084L16 17.324l-6.401 6.402a.936.936 0 0 1-1.409-1.229l.084-.096L14.676 16 8.274 9.599A.936.936 0 0 1 9.503 8.19l.096.084L16 14.676l6.401-6.402a.936.936 0 0 1 1.325 0"
    }, null, -1)
  ]));
}
const IconClose = { render: render$r };
const _hoisted_1$z = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "10",
  height: "18"
};
function render$q(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$z, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M1.975 7.567C1.681 7.906.684 9.003.715 9.442c.022.169.167.295.337.295.437-.03 1.455-2.232 2.355-2.295.194-.013.428.19.289.64L2.295 12.49c-.142.426-.828 2.482-.746 3.651.064.927.7 1.298 1.576 1.237 2.454-.172 5.086-3.392 5.036-4.099a.353.353 0 0 0-.317-.345c-.34.024-1.532 2.189-2.261 2.24a.31.31 0 0 1-.315-.321c-.027-.39.197-1.019.318-1.394l1.416-4.872c.71-2.425-.453-2.98-1.498-2.907-1.409.098-2.623.893-3.53 1.887zm4.553-6.464A2 2 0 0 0 4.672 3.19c.07 1 .772 1.612 1.769 1.542a1.973 1.973 0 0 0 1.88-2.09 1.594 1.594 0 0 0-1.794-1.54z" }, null, -1)
  ]));
}
const IconInfo = { render: render$q };
const _hoisted_1$y = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16"
};
function render$p(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$y, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M14.824 6.884c1.201-1.198 1.463-2.981.873-4.403l-2.115 2.112c-.576.575-1.562.53-2.138-.045-.575-.574-.62-1.558-.044-2.133L13.516.304c-1.425-.59-3.217-.333-4.417.866a4.01 4.01 0 0 0-.856 4.397l-1.47 1.467-3.757-3.75.256-.558-2.001-1.33L0 2.664l1.333 1.998.605-.302 3.757 3.75-4.363 4.355a.71.71 0 0 0 0 1.005l1.343 1.34a.713.713 0 0 0 1.006 0l4.363-4.355.617.616-.171.171c-.255.254-.313.575-.07.819l2.958 2.952c.243.242.686.304.94.05l1.376-1.372c.254-.254.237-.742-.006-.984L10.73 9.755c-.243-.243-.61-.14-.865.114l-.126.126-.617-.615 1.557-1.555c1.409.478 3.03.173 4.145-.94m-11.268 6.46a.772.772 0 0 1-1.091-1.089c.301-.3.79-.3 1.09 0a.77.77 0 0 1 0 1.09" }, null, -1)
  ]));
}
const IconSetting = { render: render$p };
const _hoisted_1$x = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "14",
  height: "12"
};
function render$o(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$x, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M5.133 0c.303 0 .598.097.84.277l1.12.83c.243.18.538.278.84.278H12.6c.773 0 1.4.62 1.4 1.384v7.846C14 11.38 13.373 12 12.6 12H1.4C.627 12 0 11.38 0 10.615V5.01h14v-.937H0V1.385C0 .62.627 0 1.4 0zM5.6 7.063H2.8a.464.464 0 0 0-.467.462c0 .255.21.461.467.461h2.8a.464.464 0 0 0 .467-.461.464.464 0 0 0-.467-.462" }, null, -1)
  ]));
}
const IconSettingPath = { render: render$o };
const _hoisted_1$w = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "18"
};
function render$n(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$w, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M12.44 3.113q.784.559 1.39 1.262.603.702 1.036 1.516.435.818.659 1.73.225.911.225 1.85a7.5 7.5 0 0 1-.616 3.032 7.9 7.9 0 0 1-1.661 2.464 7.9 7.9 0 0 1-2.457 1.666 7.5 7.5 0 0 1-3.024.617 7.4 7.4 0 0 1-3.008-.618 8 8 0 0 1-2.465-1.665 7.7 7.7 0 0 1-1.662-2.465A7.6 7.6 0 0 1 .25 9.47q0-.921.217-1.808.216-.885.614-1.682a7.4 7.4 0 0 1 .988-1.495 8.4 8.4 0 0 1 1.317-1.251c.3-.218.631-.302.983-.247.349.055.638.23.855.516.22.29.304.621.25.98a1.31 1.31 0 0 1-.519.87 4.96 4.96 0 0 0-1.541 1.808 5.1 5.1 0 0 0-.536 2.309q0 1.058.4 1.994a5.15 5.15 0 0 0 2.727 2.743 4.9 4.9 0 0 0 1.986.407 4.9 4.9 0 0 0 1.987-.407A5.3 5.3 0 0 0 11.61 13.1a5.3 5.3 0 0 0 1.105-1.638 4.9 4.9 0 0 0 .406-1.992q0-1.25-.575-2.365a5 5 0 0 0-1.612-1.832 1.26 1.26 0 0 1-.55-.853q-.091-.536.22-.995c.205-.289.492-.468.847-.53.355-.061.69.012.989.217M7.992.75c.369 0 .688.134.941.395.252.26.381.574.381.93v6.387c0 .358-.13.67-.383.925a1.29 1.29 0 0 1-.94.384c-.356 0-.669-.13-.922-.384a1.27 1.27 0 0 1-.383-.925V2.076c0-.357.129-.671.38-.93.254-.262.567-.396.926-.396" }, null, -1)
  ]));
}
const IconSettingClose = { render: render$n };
const _hoisted_1$v = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "14",
  height: "16"
};
function render$m(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$v, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M12 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zM6.48 9.912H3.715a.716.716 0 1 0 0 1.433H6.48a.716.716 0 1 0 0-1.433m3.804-2.78H3.718a.716.716 0 0 0-.002 1.432h6.568a.716.716 0 1 0 0-1.433m0-3.132H3.718a.716.716 0 0 0-.002 1.433h6.568a.716.716 0 1 0 0-1.433" }, null, -1)
  ]));
}
const IconSettingAbout = { render: render$m };
const _hoisted_1$u = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16"
};
function render$l(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$u, _cache[0] || (_cache[0] = [
    createBaseVNode("path", { d: "M14.896 0H1.102C.496 0 0 .519 0 1.153v2.643c0 .634.496 1.153 1.102 1.153h13.796c.606 0 1.102-.519 1.102-1.153V1.153C15.999.519 15.503 0 14.896 0M5.251 2.475a.566.566 0 0 1-.551.576H2.306a.566.566 0 0 1-.55-.576c0-.317.247-.576.55-.576h2.395c.302 0 .55.259.55.576m9.645 3.051H1.102C.496 5.526 0 6.045 0 6.68v2.643c0 .634.496 1.153 1.102 1.153h13.796c.606 0 1.102-.519 1.102-1.153V6.68c-.001-.634-.497-1.153-1.104-1.153M5.251 8a.566.566 0 0 1-.551.576H2.306A.566.566 0 0 1 1.756 8c0-.317.247-.576.55-.576h2.395c.302 0 .55.259.55.576m9.645 3.051H1.102C.496 11.051 0 11.57 0 12.204v2.643C0 15.481.496 16 1.102 16h13.796c.606 0 1.102-.519 1.102-1.153v-2.643c-.001-.634-.497-1.153-1.104-1.153m-2.833 2.475c0 .367-.287.665-.636.665s-.636-.3-.636-.665.287-.665.636-.665.636.299.636.665m2.49 0c0 .367-.286.665-.636.665s-.636-.3-.636-.665.287-.665.636-.665c.35-.001.637.299.637.665" }, null, -1)
  ]));
}
const IconSettingProxy = { render: render$l };
const _withScopeId = (n) => (pushScopeId("data-v-0a058524"), n = n(), popScopeId(), n);
const _hoisted_1$t = ["onClick"];
const _hoisted_2$6 = ["value", "checked"];
const _hoisted_3$4 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("div", { class: "radio-icon" }, [
  /* @__PURE__ */ createBaseVNode("div", { class: "radio-outline" }),
  /* @__PURE__ */ createBaseVNode("div", { class: "radio-fill" })
], -1));
const _hoisted_4$4 = {
  class: "radio-item-text",
  for: "radio"
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "Item",
  props: {
    option: {},
    groupValue: {}
  },
  emits: ["update:value"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const radioInputRef = ref();
    const handleRadioClick = () => {
      if (radioInputRef.value) {
        const value = radioInputRef.value.value;
        emits("update:value", value);
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "radio-item",
        onClick: withModifiers(handleRadioClick, ["stop"])
      }, [
        createBaseVNode("input", {
          class: "radio",
          ref_key: "radioInputRef",
          ref: radioInputRef,
          value: props.option.value,
          checked: props.option.value === props.groupValue,
          type: "radio",
          hidden: ""
        }, null, 8, _hoisted_2$6),
        _hoisted_3$4,
        createBaseVNode("label", _hoisted_4$4, toDisplayString(props.option.label), 1)
      ], 8, _hoisted_1$t);
    };
  }
});
const Item_vue_vue_type_style_index_0_scoped_0a058524_lang = "";
const RadioItem = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-0a058524"]]);
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    value: { default: "" },
    options: { default: () => ({}) },
    layout: { default: "column" }
  },
  emits: ["update:value"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const handleRadioValueUpdate = (value) => {
      emits("update:value", value);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["radio-area", props.layout])
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(props.options, (option, index) => {
          return openBlock(), createBlock(RadioItem, {
            key: `${option}-${index}`,
            option,
            "group-value": props.value,
            "onUpdate:value": _cache[0] || (_cache[0] = (v) => handleRadioValueUpdate(v))
          }, null, 8, ["option", "group-value"]);
        }), 128))
      ], 2);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_18b6f224_lang = "";
const Radio = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-18b6f224"]]);
const _hoisted_1$s = { class: "ellipsis" };
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "Ellipsis",
  props: {
    text: { default: "" },
    width: { default: "100%" }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const showTooltip = ref(false);
    const tooltipStyle = reactive({ x: 0, y: 0, width: "100%" });
    const containerRef = ref();
    const textRef = ref();
    const checkOverflow2 = () => {
      const containerWidth = containerRef.value?.offsetWidth || 0;
      const textWith = textRef.value?.offsetWidth || 0;
      const rect = containerRef.value?.getBoundingClientRect();
      if (rect) {
        tooltipStyle.x = rect.width / 2 + rect?.left + window.scrollX;
        tooltipStyle.y = rect?.top + window.scrollY - 5;
        if (tooltipStyle.width === "100%")
          tooltipStyle.width = `${rect.width}px`;
      }
      if (containerWidth < textWith) {
        showTooltip.value = true;
      } else {
        showTooltip.value = false;
      }
    };
    const hideTooltip = () => {
      showTooltip.value = false;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$s, [
        createBaseVNode("div", {
          class: "ellipsis-container",
          onMouseenter: checkOverflow2,
          onMouseleave: hideTooltip,
          ref_key: "containerRef",
          ref: containerRef
        }, [
          createBaseVNode("span", {
            class: "content",
            ref_key: "textRef",
            ref: textRef
          }, [
            unref(slots).default ? renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createTextVNode(toDisplayString(props.text), 1)
            ], 64))
          ], 512)
        ], 544),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          showTooltip.value ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "tooltip",
            style: normalizeStyle(`width: ${props.width};left: ${tooltipStyle.x}px;top: ${tooltipStyle.y}px`)
          }, toDisplayString(props.text), 5)) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const Ellipsis_vue_vue_type_style_index_0_scoped_11353878_lang = "";
const Ellipsis = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-11353878"]]);
const _hoisted_1$r = {
  key: 0,
  class: "setting-container"
};
const _hoisted_2$5 = { class: "setting-box" };
const _hoisted_3$3 = { class: "setting-header" };
const _hoisted_4$3 = { class: "setting-title" };
const _hoisted_5$2 = { class: "setting-content" };
const _hoisted_6$2 = { class: "setting-item" };
const _hoisted_7$1 = { class: "setting-item-top" };
const _hoisted_8$1 = { class: "setting-item-icon" };
const _hoisted_9$1 = { class: "item-icon-box" };
const _hoisted_10$1 = { class: "setting-item-label" };
const _hoisted_11$1 = { class: "setting-item-label-title" };
const _hoisted_12 = { class: "setting-item-label-content" };
const _hoisted_13 = { class: "setting-item-operation" };
const _hoisted_14 = { class: "setting-item" };
const _hoisted_15 = { class: "setting-item-top" };
const _hoisted_16 = { class: "setting-item-icon" };
const _hoisted_17 = { class: "item-icon-box" };
const _hoisted_18 = { class: "setting-item-label" };
const _hoisted_19 = { class: "setting-item-label-title" };
const _hoisted_20 = { class: "setting-item-label-content" };
const _hoisted_21 = { class: "setting-item" };
const _hoisted_22 = { class: "setting-item-top" };
const _hoisted_23 = { class: "setting-item-icon" };
const _hoisted_24 = { class: "item-icon-box" };
const _hoisted_25 = { class: "setting-item-label" };
const _hoisted_26 = { class: "setting-item-label-title" };
const _hoisted_27 = { class: "setting-item-label-content" };
const _hoisted_28 = { class: "setting-item-bottom" };
const _hoisted_29 = { class: "bottom-tips" };
const _hoisted_30 = { class: "setting-item" };
const _hoisted_31 = { class: "setting-item-top" };
const _hoisted_32 = { class: "setting-item-icon" };
const _hoisted_33 = { class: "item-icon-box" };
const _hoisted_34 = { class: "setting-item-label" };
const _hoisted_35 = { class: "setting-item-label-title" };
const _hoisted_36 = { class: "setting-item-label-content" };
const _hoisted_37 = { class: "setting-item-bottom" };
const _hoisted_38 = { style: { "display": "flex", "justify-content": "start", "align-items": "center" } };
const _hoisted_39 = { class: "input-container" };
const _hoisted_40 = {
  key: 0,
  class: "path-btn"
};
const _hoisted_41 = { class: "setting-item" };
const _hoisted_42 = { class: "setting-item-top" };
const _hoisted_43 = { class: "setting-item-icon" };
const _hoisted_44 = { class: "item-icon-box" };
const _hoisted_45 = { class: "setting-item-label" };
const _hoisted_46 = { class: "setting-item-label-title" };
const _hoisted_47 = { class: "setting-item-label-content" };
const _hoisted_48 = { class: "setting-item-operation" };
const _hoisted_49 = { class: "setting-item-bottom" };
const _hoisted_50 = { class: "bottom-tips" };
const _hoisted_51 = {
  key: 0,
  class: "setting-item"
};
const _hoisted_52 = { class: "setting-item-top" };
const _hoisted_53 = { class: "setting-item-icon" };
const _hoisted_54 = { class: "item-icon-box" };
const _hoisted_55 = { class: "setting-item-label" };
const _hoisted_56 = { class: "setting-item-label-title" };
const _hoisted_57 = { class: "about-link" };
const _hoisted_58 = ["href"];
const _hoisted_59 = ["href"];
const _hoisted_60 = {
  key: 0,
  class: "setting-item-label-content"
};
const _hoisted_61 = { class: "launcher-version" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "Settings",
  props: {
    modelValue: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { expose: __expose, emit }) {
    const props = __props;
    const clientStore = useClient();
    const viewStore = useView();
    const { dispatchViewState } = viewStore;
    const { dispatchDownloadTask } = useDownload();
    const { dispatchClientState, dispatchSettingsState } = clientStore;
    const { settingsState, clientState } = storeToRefs(clientStore);
    const { viewState } = storeToRefs(viewStore);
    const { t } = useI18n();
    const proxyOptions = [
      {
        value: "direct",
        label: t("settings.proxy-direct")
      },
      {
        value: "system",
        label: t("settings.proxy-system")
      }
    ];
    const handleChangeProxy = (v) => {
      const mode = v;
      LocalStorageUtil.setItem("proxy-config", mode);
      window.api.invoke("handle-set-proxy-mode", mode);
      dispatchSettingsState({ proxyConfig: mode });
    };
    const closeOptions = [
      {
        value: "minimize",
        label: t("settings.close-minimize")
      },
      {
        value: "exit",
        label: t("settings.close-exit")
      }
    ];
    const closeType = ref(closeOptions[0].value);
    const gamePath = ref("");
    const handleCloseTypeChange = (v) => {
      closeType.value = v;
      LocalStorageUtil.setItem("close-choice", v);
    };
    const launcherVersion = window.api.sendSync("request-current-version");
    const handleClose = () => {
      emit("update:modelValue", false);
    };
    const handleUpdate = async () => {
      if (viewState.value === "download") {
        handleClose();
        return;
      }
      dispatchDownloadTask({ repair: false });
      handleDownloadGame();
      handleClose();
    };
    const handleUninstall = () => {
      Message$2({
        closeable: false,
        type: "mini-info",
        title: t("settings.uninstall-title"),
        content: () => {
          return h("div", {}, [
            h("p", { style: { marginTop: "8px" } }, t("settings.uninstall-content")),
            h(
              "p",
              { style: { marginTop: "8px", fontWeight: 600, color: "#E84A4A" } },
              t("settings.uninstall-path-tips")
            ),
            h(
              "p",
              {
                style: {
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  marginTop: "8px",
                  minHeight: "40px",
                  background: "rgba(232, 74, 74, 0.1)",
                  padding: "10px 16px",
                  textAlign: "left",
                  borderRadius: "6px",
                  boxSizing: "border-box",
                  color: "#E84A4A",
                  overflow: "hidden",
                  wordBreak: "break-all"
                }
              },
              gamePath.value
            )
          ]);
        },
        confirmText: t("message.cancel"),
        cancelText: t("message.confirm-uninstall"),
        onCancel() {
          window.api.invoke("handle-start-uninstall", gamePath.value);
        }
      }).catch();
    };
    const handleRepair = () => {
      if (viewState.value === "download") {
        handleClose();
        return;
      }
      Message$2({
        title: t("message.tip"),
        content: t("settings.repair-message"),
        cancelText: t("message.cancel"),
        confirmText: t("message.confirm"),
        onConfirm() {
          handleClose();
          dispatchDownloadTask({ repair: true });
          handleDownloadGame();
        }
      }).catch();
    };
    const needUpdate = ref(false);
    const newVersion = ref("");
    const haveGame = ref(false);
    const handleChangePath = async () => {
      if (clientState.value.gameVersion)
        return;
      const value = await window.api.invoke(
        "handle-choose-system-path",
        clientState.value.gamePath,
        false
      );
      if (!value)
        return;
      haveGame.value = await checkGame(value);
      if (!haveGame.value) {
        Message$2({
          title: t("message.tip"),
          content: t("message.error-detect-no-game"),
          confirmText: t("message.confirm")
        });
      } else {
        try {
          const res = await requestGameInfo();
          if (res) {
            newVersion.value = res.game_latest_version;
            needUpdate.value = versionCompare(clientState.value.gameVersion, res.game_latest_version) === -1;
          }
        } catch {
        }
        gamePath.value = value;
        window.api.send("request-game-click-code", gamePath.value);
      }
    };
    const settingsInit = async () => {
      closeType.value = LocalStorageUtil.getItem("close-choice") || closeOptions[0].value;
      gamePath.value = LocalStorageUtil.getItem("downloadPath") || "";
      if (viewState.value === "download" || viewState.value === "progress") {
        needUpdate.value = false;
        newVersion.value = "";
        haveGame.value = false;
        return;
      }
      haveGame.value = await checkGame(gamePath.value);
      if (haveGame.value) {
        try {
          const res = await requestGameInfo();
          if (res) {
            newVersion.value = res.game_latest_version;
            needUpdate.value = versionCompare(clientState.value.gameVersion, res.game_latest_version) === -1;
          }
        } catch {
        }
      } else {
        LocalStorageUtil.removeItem("downloadPath");
        gamePath.value = "";
        dispatchClientState({
          gameVersion: ""
        });
        dispatchDownloadTask({ state: "idle" });
        dispatchViewState("menu");
      }
    };
    watch(
      () => [props.modelValue, clientState.value.gamePath],
      async () => {
        if (props.modelValue)
          settingsInit();
      }
    );
    __expose({
      settingsInit
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, { to: "body" }, [
        props.modelValue ? (openBlock(), createElementBlock("div", _hoisted_1$r, [
          createBaseVNode("div", _hoisted_2$5, [
            createBaseVNode("div", _hoisted_3$3, [
              createBaseVNode("div", _hoisted_4$3, toDisplayString(unref(t)("start.settings")), 1),
              createVNode(unref(IconClose), {
                class: "setting-close",
                onClick: handleClose
              })
            ]),
            createBaseVNode("div", _hoisted_5$2, [
              createBaseVNode("div", _hoisted_6$2, [
                createBaseVNode("div", _hoisted_7$1, [
                  createBaseVNode("div", _hoisted_8$1, [
                    createBaseVNode("div", _hoisted_9$1, [
                      createVNode(unref(IconInfo), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_10$1, [
                    createBaseVNode("p", _hoisted_11$1, toDisplayString(unref(t)("start.version")), 1),
                    createBaseVNode("p", _hoisted_12, toDisplayString(unref(clientState).gameVersion ? needUpdate.value ? `${unref(clientState).gameVersion}（${unref(t)("start.latest-version")}${newVersion.value}）` : unref(clientState).gameVersion : "-"), 1)
                  ]),
                  createBaseVNode("div", _hoisted_13, [
                    createVNode(_sfc_main$c, {
                      disabled: !haveGame.value || !needUpdate.value,
                      onClick: handleUpdate
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("start.update")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_14, [
                createBaseVNode("div", _hoisted_15, [
                  createBaseVNode("div", _hoisted_16, [
                    createBaseVNode("div", _hoisted_17, [
                      createVNode(unref(IconSettingClose), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_18, [
                    createBaseVNode("p", _hoisted_19, toDisplayString(unref(t)("settings.close-title")), 1),
                    createBaseVNode("p", _hoisted_20, [
                      createVNode(Radio, {
                        class: "check-but",
                        value: closeType.value,
                        "onUpdate:value": handleCloseTypeChange,
                        options: closeOptions,
                        layout: "row"
                      }, null, 8, ["value"])
                    ])
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_21, [
                createBaseVNode("div", _hoisted_22, [
                  createBaseVNode("div", _hoisted_23, [
                    createBaseVNode("div", _hoisted_24, [
                      createVNode(unref(IconSettingProxy), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_25, [
                    createBaseVNode("p", _hoisted_26, toDisplayString(unref(t)("settings.proxy-title")), 1),
                    createBaseVNode("p", _hoisted_27, [
                      createVNode(Radio, {
                        class: "check-but",
                        value: unref(settingsState).proxyConfig,
                        "onUpdate:value": handleChangeProxy,
                        options: proxyOptions,
                        layout: "row"
                      }, null, 8, ["value"])
                    ])
                  ])
                ]),
                createBaseVNode("div", _hoisted_28, [
                  createBaseVNode("div", _hoisted_29, toDisplayString(unref(t)("settings.proxy-tips")), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_30, [
                createBaseVNode("div", _hoisted_31, [
                  createBaseVNode("div", _hoisted_32, [
                    createBaseVNode("div", _hoisted_33, [
                      createVNode(unref(IconSettingPath), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_34, [
                    createBaseVNode("p", _hoisted_35, toDisplayString(unref(t)("settings.game-path-title")), 1),
                    createBaseVNode("p", _hoisted_36, toDisplayString(unref(t)("settings.game-path-content")), 1)
                  ])
                ]),
                createBaseVNode("div", _hoisted_37, [
                  createBaseVNode("div", _hoisted_38, [
                    createBaseVNode("div", {
                      class: normalizeClass(["path-input-container", { click: !unref(clientState).gameVersion }]),
                      onClick: handleChangePath
                    }, [
                      createBaseVNode("div", _hoisted_39, [
                        createVNode(Ellipsis, {
                          text: gamePath.value,
                          width: "450px"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(gamePath.value || "--"), 1)
                          ]),
                          _: 1
                        }, 8, ["text"])
                      ]),
                      !unref(clientState).gameVersion ? (openBlock(), createElementBlock("span", _hoisted_40, toDisplayString(unref(t)("settings.game-path-change")), 1)) : createCommentVNode("", true)
                    ], 2),
                    haveGame.value ? (openBlock(), createElementBlock("span", {
                      key: 0,
                      class: "path-btn uninstall",
                      onClick: handleUninstall
                    }, toDisplayString(unref(t)("settings.uninstall")), 1)) : createCommentVNode("", true)
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_41, [
                createBaseVNode("div", _hoisted_42, [
                  createBaseVNode("div", _hoisted_43, [
                    createBaseVNode("div", _hoisted_44, [
                      createVNode(unref(IconSetting), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_45, [
                    createBaseVNode("p", _hoisted_46, toDisplayString(unref(t)("start.repair")), 1),
                    createBaseVNode("p", _hoisted_47, toDisplayString(unref(t)("settings.repair-content")), 1)
                  ]),
                  createBaseVNode("div", _hoisted_48, [
                    createVNode(_sfc_main$c, {
                      disabled: !haveGame.value,
                      onClick: handleRepair
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(t)("settings.repair-btn")), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ])
                ]),
                createBaseVNode("div", _hoisted_49, [
                  createBaseVNode("div", _hoisted_50, toDisplayString(unref(t)("settings.repair-tips")), 1)
                ])
              ]),
              unref(settingsState).about ? (openBlock(), createElementBlock("div", _hoisted_51, [
                createBaseVNode("div", _hoisted_52, [
                  createBaseVNode("div", _hoisted_53, [
                    createBaseVNode("div", _hoisted_54, [
                      createVNode(unref(IconSettingAbout), { class: "item-icon" })
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_55, [
                    createBaseVNode("p", _hoisted_56, [
                      createTextVNode(toDisplayString(unref(t)("settings.about")) + " ", 1),
                      createBaseVNode("span", _hoisted_57, [
                        unref(settingsState).aboutProtocol ? (openBlock(), createElementBlock("a", {
                          key: 0,
                          href: unref(settingsState).aboutProtocol,
                          target: "_blank"
                        }, toDisplayString(unref(t)("settings.about-protocol")), 9, _hoisted_58)) : createCommentVNode("", true),
                        createTextVNode(" | "),
                        unref(settingsState).aboutPrivacy ? (openBlock(), createElementBlock("a", {
                          key: 1,
                          href: unref(settingsState).aboutPrivacy,
                          target: "_blank"
                        }, toDisplayString(unref(t)("settings.about-privacy")), 9, _hoisted_59)) : createCommentVNode("", true)
                      ])
                    ]),
                    unref(settingsState).aboutCopyright ? (openBlock(), createElementBlock("p", _hoisted_60, toDisplayString(unref(settingsState).aboutCopyright), 1)) : createCommentVNode("", true)
                  ])
                ])
              ])) : createCommentVNode("", true)
            ]),
            createBaseVNode("p", _hoisted_61, toDisplayString(unref(t)("start.current-launcher-version")) + toDisplayString(unref(launcherVersion)), 1)
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const Settings_vue_vue_type_style_index_0_scoped_c6b0f74d_lang = "";
const Settings = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-c6b0f74d"]]);
const _hoisted_1$q = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "18",
  height: "18"
};
function render$k(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$q, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "#CACACA",
      "fill-rule": "nonzero"
    }, [
      createBaseVNode("path", { d: "M6.554 2.148 4.7 3.218l-.104.067c-.465.334-.649.947-.431 1.486l.285.705-.117.163a6 6 0 0 0-.44.764l-.08.18-.753.105c-.62.088-1.08.617-1.08 1.242v2.142l.006.123a1.254 1.254 0 0 0 1.07 1.117l.755.105.084.184q.191.399.438.761l.116.162-.285.703a1.25 1.25 0 0 0 .538 1.556l1.85 1.069.11.056c.523.237 1.146.09 1.505-.37l.466-.597-.09-.01q.364.047.73.048l.243-.006q.123-.005.245-.016l.152-.017.466.598a1.25 1.25 0 0 0 1.614.314l1.854-1.07.104-.067c.465-.334.649-.947.432-1.486l-.286-.705.117-.163q.248-.367.44-.764l.08-.18.753-.105a1.25 1.25 0 0 0 1.079-1.24V7.93l-.005-.123a1.246 1.246 0 0 0-1.075-1.118l-.75-.105-.083-.183a6 6 0 0 0-.439-.762l-.116-.162.285-.702a1.25 1.25 0 0 0-.537-1.557l-1.851-1.07a1.25 1.25 0 0 0-1.534.22l-.08.094-.467.596.091.01a6 6 0 0 0-.73-.047l-.244.006a6 6 0 0 0-.245.016l-.152.016-.466-.597a1.25 1.25 0 0 0-1.614-.314m4.862 1.328 1.571.909-.263.65c-.168.414-.097.88.17 1.234q.334.443.555.963l.058.119c.19.345.526.588.923.644l.695.098v1.815l-.695.098c-.441.059-.81.354-.983.763q-.217.516-.554.964l-.074.11a1.25 1.25 0 0 0-.096 1.124l.263.648-1.572.907-.43-.55a1.26 1.26 0 0 0-1.159-.47 4.3 4.3 0 0 1-1.102 0l-.133-.01a1.26 1.26 0 0 0-1.03.483l-.43.548-1.57-.907.263-.65c.169-.414.097-.88-.17-1.233a4.5 4.5 0 0 1-.555-.964l-.057-.118a1.26 1.26 0 0 0-.924-.645l-.697-.098V8.091l.697-.097c.441-.059.81-.354.983-.763q.217-.516.555-.964l.074-.109c.204-.336.247-.75.096-1.123l-.265-.651 1.573-.908.43.551c.275.354.717.526 1.16.47a4.3 4.3 0 0 1 1.101 0c.445.056.887-.116 1.163-.472z" }),
      createBaseVNode("path", { d: "M9.274 6.198a2.802 2.802 0 1 0 0 5.604 2.802 2.802 0 0 0 0-5.604m0 1.44a1.362 1.362 0 1 1 0 2.724 1.362 1.362 0 0 1 0-2.724" })
    ], -1)
  ]));
}
const IconSet = { render: render$k };
const _hoisted_1$p = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "18",
  height: "18"
};
function render$j(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$p, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "#FFF",
      "fill-rule": "nonzero"
    }, [
      createBaseVNode("path", { d: "M6.554 2.148 4.7 3.218l-.104.067c-.465.334-.649.947-.431 1.486l.285.705-.117.163a6 6 0 0 0-.44.764l-.08.18-.753.105c-.62.088-1.08.617-1.08 1.242v2.142l.006.123a1.254 1.254 0 0 0 1.07 1.117l.755.105.084.184q.191.399.438.761l.116.162-.285.703a1.25 1.25 0 0 0 .538 1.556l1.85 1.069.11.056c.523.237 1.146.09 1.505-.37l.466-.597-.09-.01q.364.047.73.048l.243-.006q.123-.005.245-.016l.152-.017.466.598a1.25 1.25 0 0 0 1.614.314l1.854-1.07.104-.067c.465-.334.649-.947.432-1.486l-.286-.705.117-.163q.248-.367.44-.764l.08-.18.753-.105a1.25 1.25 0 0 0 1.079-1.24V7.93l-.005-.123a1.246 1.246 0 0 0-1.075-1.118l-.75-.105-.083-.183a6 6 0 0 0-.439-.762l-.116-.162.285-.702a1.25 1.25 0 0 0-.537-1.557l-1.851-1.07a1.25 1.25 0 0 0-1.534.22l-.08.094-.467.596.091.01a6 6 0 0 0-.73-.047l-.244.006a6 6 0 0 0-.245.016l-.152.016-.466-.597a1.25 1.25 0 0 0-1.614-.314m4.862 1.328 1.571.909-.263.65c-.168.414-.097.88.17 1.234q.334.443.555.963l.058.119c.19.345.526.588.923.644l.695.098v1.815l-.695.098c-.441.059-.81.354-.983.763q-.217.516-.554.964l-.074.11a1.25 1.25 0 0 0-.096 1.124l.263.648-1.572.907-.43-.55a1.26 1.26 0 0 0-1.159-.47 4.3 4.3 0 0 1-1.102 0l-.133-.01a1.26 1.26 0 0 0-1.03.483l-.43.548-1.57-.907.263-.65c.169-.414.097-.88-.17-1.233a4.5 4.5 0 0 1-.555-.964l-.057-.118a1.26 1.26 0 0 0-.924-.645l-.697-.098V8.091l.697-.097c.441-.059.81-.354.983-.763q.217-.516.555-.964l.074-.109c.204-.336.247-.75.096-1.123l-.265-.651 1.573-.908.43.551c.275.354.717.526 1.16.47a4.3 4.3 0 0 1 1.101 0c.445.056.887-.116 1.163-.472z" }),
      createBaseVNode("path", { d: "M9.274 6.198a2.802 2.802 0 1 0 0 5.604 2.802 2.802 0 0 0 0-5.604m0 1.44a1.362 1.362 0 1 1 0 2.724 1.362 1.362 0 0 1 0-2.724" })
    ], -1)
  ]));
}
const IconSetH = { render: render$j };
const _hoisted_1$o = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "18",
  height: "18"
};
function render$i(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$o, _cache[0] || (_cache[0] = [
    createBaseVNode("g", {
      fill: "#FFF",
      "fill-rule": "evenodd"
    }, [
      createBaseVNode("path", { d: "m4.87 3.6 9.53 9.53-1.27 1.27L3.6 4.87z" }),
      createBaseVNode("path", { d: "M13.13 3.6 3.6 13.13l1.27 1.27 9.53-9.53z" })
    ], -1)
  ]));
}
const IconCloseH = { render: render$i };
const _hoisted_1$n = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "10",
  height: "8"
};
function render$h(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$n, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "#FFF",
      "fill-rule": "nonzero",
      d: "m8.048.308-.082.083L3.54 5.3 1.87 3.81c-.394-.351-1.18-.351-1.574 0-.363.324-.391.946-.083 1.315l.083.087 2.852 2.542.057.05.041.037c.27.241.707.188 1.005-.026l.077-.061 5.507-6.048c.295-.526.197-1.14-.295-1.49a1.2 1.2 0 0 0-1.49.092"
    }, null, -1)
  ]));
}
const IconCheckbox = { render: render$h };
const _hoisted_1$m = { class: "checkbox-area-text" };
const _hoisted_2$4 = { class: "checkbox-outline" };
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "CheckBox",
  props: {
    value: { type: Boolean, default: false }
  },
  emits: ["update:value"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const handleUpdateValue = () => {
      emits("update:value", !props.value);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "checkbox-area",
        onClick: handleUpdateValue
      }, [
        createBaseVNode("div", _hoisted_1$m, [
          createBaseVNode("div", {
            class: normalizeClass(["checkbox-icon", { checked: props.value }])
          }, [
            createBaseVNode("div", _hoisted_2$4, [
              createVNode(unref(IconCheckbox), { class: "checkbox-fill" })
            ])
          ], 2),
          renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ])
      ]);
    };
  }
});
const CheckBox_vue_vue_type_style_index_0_scoped_0352ddaa_lang = "";
const CheckBox = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-0352ddaa"]]);
const _hoisted_1$l = { class: "message-container" };
const _hoisted_2$3 = { class: "message-box" };
const _hoisted_3$2 = { class: "message-body" };
const _hoisted_4$2 = { class: "message-title" };
const _hoisted_5$1 = { class: "message-content" };
const _hoisted_6$1 = { class: "message-control" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "CloseConfirmMessage",
  emits: ["confirm", "close"],
  setup(__props, { emit }) {
    const { t } = i18n.global;
    const saveChoice = ref(false);
    const options = [
      {
        label: t("settings.close-minimize"),
        value: "minimize"
      },
      {
        label: t("settings.close-exit"),
        value: "exit"
      }
    ];
    const operation = ref(LocalStorageUtil.getItem("close-choice") || options[0].value);
    watch(
      () => operation.value,
      () => {
        LocalStorageUtil.setItem("close-choice", operation.value);
      }
    );
    const handleConfirm = () => {
      if (saveChoice.value) {
        LocalStorageUtil.setItem("close-choice-save", true);
      }
      emit("confirm", operation.value === "exit");
      handleClose();
    };
    const handleClose = () => emit("close");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$l, [
        createBaseVNode("div", _hoisted_2$3, [
          createVNode(unref(IconClose$1), {
            class: "message-box-close",
            onClick: handleClose
          }),
          createBaseVNode("div", _hoisted_3$2, [
            createBaseVNode("div", _hoisted_4$2, toDisplayString(unref(t)("message.close-confirm-title")), 1),
            createBaseVNode("div", _hoisted_5$1, [
              createVNode(Radio, {
                class: "check-but",
                value: operation.value,
                "onUpdate:value": _cache[0] || (_cache[0] = ($event) => operation.value = $event),
                options
              }, null, 8, ["value"])
            ]),
            createBaseVNode("div", _hoisted_6$1, [
              createVNode(CheckBox, {
                class: "check-but",
                value: saveChoice.value,
                "onUpdate:value": _cache[1] || (_cache[1] = ($event) => saveChoice.value = $event)
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("message.close-confirm-save")), 1)
                ]),
                _: 1
              }, 8, ["value"]),
              createVNode(_sfc_main$c, {
                type: "yellow",
                class: "message-confirm",
                onClick: handleConfirm
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(t)("message.confirm")), 1)
                ]),
                _: 1
              })
            ])
          ])
        ])
      ]);
    };
  }
});
const CloseConfirmMessage_vue_vue_type_style_index_0_scoped_d95d62f9_lang = "";
const MessageDom = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-d95d62f9"]]);
function Message(options) {
  return new Promise((resolve, reject) => {
    const onClose = () => {
      unmount();
      return reject();
    };
    const onConfirm = (close) => {
      setTimeout(() => {
        if (options?.onConfirm)
          options.onConfirm(close);
      }, 100);
      return resolve(close);
    };
    if (options?.isMainProcess) {
      onConfirm(true);
      return resolve(true);
    }
    const closeChoiceSave = LocalStorageUtil.getItem("close-choice-save");
    const closeChoice = LocalStorageUtil.getItem("close-choice");
    if (closeChoiceSave) {
      onConfirm(closeChoice === "exit");
      return resolve(true);
    }
    const messageApp = createApp({
      render() {
        return h(MessageDom, { onConfirm, onClose });
      }
    });
    let mountNode = document.createElement("div");
    document.body.appendChild(mountNode);
    messageApp.mount(mountNode);
    const unmount = () => {
      {
        messageApp.unmount();
        document.body.removeChild(mountNode);
        mountNode = null;
      }
    };
  });
}
const _hoisted_1$k = { id: "header" };
const _hoisted_2$2 = { id: "controller" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "HeaderArea",
  setup(__props) {
    const { t } = useI18n();
    const downloadStore = useDownload();
    const viewStore = useView();
    const { downloadTask } = storeToRefs(downloadStore);
    const { viewState } = storeToRefs(viewStore);
    const settingsShow = ref(false);
    const settingsRef = ref();
    const handleMinimize = () => {
      window.api.send("minimize-window");
    };
    let closeMessageFlag = false;
    const handleClose = (mainProcess = false) => {
      Message({
        isMainProcess: mainProcess,
        onConfirm: async (close) => {
          if (close) {
            if (downloadTask.value.state === "downloading" || downloadTask.value.state === "loading" || viewState.value === "progress") {
              window.api.send("focus-window");
              if (closeMessageFlag)
                return;
              closeMessageFlag = true;
              Message$2({
                title: t("message.tip"),
                content: t("message.downloading-exit"),
                confirmText: t("message.confirm"),
                cancelText: t("message.cancel"),
                onClose() {
                  closeMessageFlag = false;
                }
              }).then(() => {
                closeMessageFlag = false;
                window.api.send("close-window");
              }).catch(() => {
                closeMessageFlag = false;
              });
            } else {
              window.api.send("close-window");
            }
          } else {
            window.api.send("hidden-window");
          }
        }
      }).catch(() => {
      });
    };
    const handleSetting = () => {
      settingsShow.value = true;
    };
    const installProgress = ref("");
    const uninstallProcess = (n) => {
      if (n > 100)
        n = 100;
      if (n < 0)
        n = 0;
      installProgress.value = `${t("settings.uninstall-progress")} (${n}%)`;
    };
    const uninstallDone = () => {
      installProgress.value = "";
      LocalStorageUtil.removeItem("downloadPath");
      window.api.removeReceive("uninstall-process");
      settingsRef.value?.settingsInit();
    };
    const uninstallError = () => {
      Message$2({
        closeable: false,
        title: t("message.tip"),
        content: t("message.uninstall-error"),
        confirmText: t("message.confirm")
      });
      settingsRef.value?.settingsInit();
    };
    const uninstallErrorRunning = () => {
      Message$2({
        closeable: false,
        title: t("message.tip"),
        content: t("message.uninstall-error-running"),
        confirmText: t("message.confirm")
      });
      settingsRef.value?.settingsInit();
    };
    onMounted(() => {
      window.api.receive("renderer-quit", () => handleClose(true));
      window.api.receive("uninstall-done", uninstallDone);
      window.api.receive("uninstall-process", uninstallProcess);
      window.api.receive("uninstall-error", uninstallError);
      window.api.receive("uninstall-error-running", uninstallErrorRunning);
    });
    onUnmounted(() => {
      window.api.removeReceive("renderer-quit");
      window.api.removeReceive("uninstall-process");
      window.api.removeReceive("uninstall-done");
      window.api.removeReceive("uninstall-error");
      window.api.removeReceive("uninstall-error-running");
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$k, [
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("div", {
            id: "btn-setting",
            class: "controller-btn",
            onClick: handleSetting
          }, [
            createVNode(unref(IconSet)),
            createVNode(unref(IconSetH), { class: "hover" })
          ]),
          createBaseVNode("div", {
            id: "btn-minimize",
            class: "controller-btn",
            onClick: handleMinimize
          }, [
            createVNode(unref(IconMinus)),
            createVNode(unref(IconMinusH), { class: "hover" })
          ]),
          createBaseVNode("div", {
            id: "btn-close",
            class: "controller-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => handleClose(false))
          }, [
            createVNode(unref(IconClose$2)),
            createVNode(unref(IconCloseH), { class: "hover" })
          ])
        ]),
        createVNode(Settings, {
          ref_key: "settingsRef",
          ref: settingsRef,
          modelValue: settingsShow.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => settingsShow.value = $event)
        }, null, 8, ["modelValue"]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          installProgress.value ? (openBlock(), createBlock(MessageDomUninstall, {
            key: 0,
            closeable: false,
            title: unref(t)("message.tip"),
            content: installProgress.value
          }, null, 8, ["title", "content"])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const HeaderArea_vue_vue_type_style_index_0_scoped_dc388741_lang = "";
const HeaderArea = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-dc388741"]]);
const _hoisted_1$j = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$g(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$j, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="m17.86 8.277 6.174 4.418c.606.433.966 1.131.966 1.874v7.123A2.31 2.31 0 0 1 22.685 24h-3.16v-3.357A2.523 2.523 0 0 0 17 18.125a2.523 2.523 0 0 0-2.526 2.518V24h-3.159A2.31 2.31 0 0 1 9 21.692v-7.123c0-.743.359-1.441.966-1.874l6.175-4.42a1.48 1.48 0 0 1 1.718 0z"></path></g>', 2)
  ]));
}
const MediaIconHome = { render: render$g };
const _hoisted_1$i = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$f(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$i, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M22.73 19.91h-.693q.062-.464.063-.944v-2.62h.63c.987 0 1.787.798 1.787 1.782s-.8 1.782-1.787 1.782m0-5.043H8v4.1C8 22.85 11.156 26 15.05 26c3.04 0 5.631-1.92 6.62-4.61h1.06c1.806 0 3.27-1.46 3.27-3.262a3.265 3.265 0 0 0-3.27-3.261m-6.48-2.178c2.595 0 4.7-2.1 4.7-4.69h-5.306c-2.596 0-4.7 2.1-4.7 4.69h5.305"></path></g>', 2)
  ]));
}
const MediaIconCoffee = { render: render$f };
const _hoisted_1$h = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$e(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$h, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M20.797 9c3.84 0 7.06 3.009 7.198 6.847a7.1 7.1 0 0 1-2.362 5.557c-1.124 1.006-3.96 3.458-5.353 4.661a.483.483 0 0 1-.798-.366v-2.483h-6.374a7.11 7.11 0 0 1-7.1-7.452C6.188 11.941 9.48 9 13.308 9Zm-7.557 3.79h-1.028a.39.39 0 0 0-.391.39v2.023H9.797a.39.39 0 0 0-.39.39v1.03c0 .216.175.39.39.39h2.024v2.023c0 .216.175.39.39.39h1.03a.39.39 0 0 0 .39-.39v-2.023h2.023a.39.39 0 0 0 .39-.39v-1.03a.39.39 0 0 0-.39-.39H13.63V13.18a.39.39 0 0 0-.39-.39m8.398 4.564a1.036 1.036 0 1 0 0 2.071 1.036 1.036 0 0 0 0-2.071m2.282-2.281a1.035 1.035 0 1 0 0 2.07 1.035 1.035 0 0 0 0-2.07m-4.563 0a1.035 1.035 0 1 0 0 2.07 1.035 1.035 0 0 0 0-2.07m2.281-2.282a1.036 1.036 0 1 0 0 2.071 1.036 1.036 0 0 0 0-2.071"></path></g>', 2)
  ]));
}
const MediaIconLounge = { render: render$e };
const _hoisted_1$g = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$d(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$g, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M17.805 1.351a.05.05 0 0 0-.028-.025A17.3 17.3 0 0 0 13.503.001a.065.065 0 0 0-.069.033q-.293.533-.532 1.092a16 16 0 0 0-4.8 0Q7.861.566 7.56.034A.07.07 0 0 0 7.49 0c-1.475.255-2.912.7-4.274 1.325a.06.06 0 0 0-.028.024C.467 5.416-.279 9.382.087 13.298q.004.031.027.05a17.4 17.4 0 0 0 5.244 2.65.07.07 0 0 0 .074-.025q.607-.828 1.072-1.744a.066.066 0 0 0-.036-.093 11.5 11.5 0 0 1-1.638-.78.067.067 0 0 1-.007-.112q.166-.123.325-.255a.07.07 0 0 1 .068-.009c3.437 1.569 7.158 1.569 10.554 0a.07.07 0 0 1 .069.008q.16.133.326.256a.067.067 0 0 1-.006.112q-.787.458-1.639.78a.067.067 0 0 0-.036.093q.473.91 1.072 1.743a.07.07 0 0 0 .074.025 17.4 17.4 0 0 0 5.252-2.65.07.07 0 0 0 .028-.048c.438-4.528-.734-8.46-3.105-11.948M7.018 10.914c-1.035 0-1.888-.95-1.888-2.116s.836-2.116 1.888-2.116c1.059 0 1.903.958 1.887 2.116 0 1.166-.836 2.116-1.887 2.116m6.977 0c-1.034 0-1.887-.95-1.887-2.116s.836-2.116 1.887-2.116c1.06 0 1.904.958 1.888 2.116 0 1.166-.828 2.116-1.888 2.116" transform="translate(7 9)"></path></g>', 2)
  ]));
}
const MediaIconDiscord = { render: render$d };
const _hoisted_1$f = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$c(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$f, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M17 7c5.523 0 10 4.498 10 10.047 0 5.08-3.751 9.279-8.622 9.953v-6.996h2.43l.372-2.845h-2.802v-1.816q0-.693.287-1.038.285-.346 1.11-.346h1.501V11.42q-.774-.115-2.181-.115-1.655 0-2.65.985t-.995 2.773v2.095h-2.44v2.845h2.44v6.97C10.663 26.227 7 22.068 7 17.048 7 11.498 11.477 7 17 7"></path></g>', 2)
  ]));
}
const MediaIconFacebook = { render: render$c };
const _hoisted_1$e = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$b(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$e, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M19.797 9.817a2.291 2.291 0 0 0 4.52-.527 2.29 2.29 0 0 0-4.534-.464 3.7 3.7 0 0 0-3.298 3.673v.012c-2.015.085-3.854.658-5.314 1.564a3.209 3.209 0 1 0-3.323 5.446c.106 3.725 4.166 6.722 9.16 6.722s9.058-3 9.16-6.73a3.21 3.21 0 1 0-3.331-5.443c-1.474-.911-3.333-1.485-5.368-1.56v-.01a2.71 2.71 0 0 1 2.328-2.68zm-8.755 8.834c.054-1.164.827-2.058 1.725-2.058.9 0 1.586.944 1.533 2.108s-.725 1.587-1.625 1.587-1.687-.473-1.633-1.637m10.207-2.058c.9 0 1.672.894 1.725 2.058s-.734 1.637-1.633 1.637-1.57-.422-1.625-1.587c-.053-1.164.633-2.108 1.533-2.108m-1.07 4.75a.254.254 0 0 1 .21.35 3.665 3.665 0 0 1-6.764 0 .254.254 0 0 1 .21-.35c.989-.1 2.057-.154 3.173-.154 1.115 0 2.182.055 3.171.154"></path></g>', 2)
  ]));
}
const MediaIconReddit = { render: render$b };
const _hoisted_1$d = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$a(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$d, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M26.143 7.5v10l-6.429 6.429h-2.857L13.286 27.5v-3.571H9V11.07L12.571 7.5zm-1.429 1.429H13.286v10.714H16.5v2.5l2.5-2.5h2.857l2.857-2.857zm-2.143 2.5v4.285h-1.428V11.43zm-3.928 0v4.285h-1.429V11.43z"></path></g>', 2)
  ]));
}
const MediaIconTwitch = { render: render$a };
const _hoisted_1$c = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$9(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$c, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M9.522 6.775 15.48 0h-1.412L8.895 5.883 4.765 0H0l6.247 8.895L0 16h1.412l5.461-6.212L11.236 16H16zM7.59 8.974l-.633-.886L1.92 1.04h2.168l4.064 5.688.633.886 5.283 7.394H11.9z" transform="translate(9 9)"></path></g>', 2)
  ]));
}
const MediaIconX = { render: render$9 };
const _hoisted_1$b = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$8(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$b, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M8.793 11.005V4.402l5.719 3.302zm12.747-8.6A2.76 2.76 0 0 0 19.594.46c-1.716-.46-8.6-.46-8.6-.46S4.112 0 2.395.46A2.76 2.76 0 0 0 .449 2.406c-.46 1.716-.46 5.298-.46 5.298s0 3.581.46 5.298a2.76 2.76 0 0 0 1.946 1.945c1.717.46 8.6.46 8.6.46s6.883 0 8.6-.46a2.76 2.76 0 0 0 1.945-1.945c.46-1.717.46-5.298.46-5.298s0-3.582-.46-5.298" mask="url(#mask-2)" transform="translate(6 9.29)"></path></g>', 2)
  ]));
}
const MediaIconYoutube = { render: render$8 };
const _hoisted_1$a = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$7(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$a, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M23.01 12.673c-.02 0-.04.006-.061.007v-.002A6.35 6.35 0 0 0 17 8.5a6.35 6.35 0 0 0-5.948 4.178.2.2 0 0 0-.057-.006C8.76 12.745 6.99 14.597 7 16.85c-.004 2.264 1.786 4.117 4.031 4.173h.005a1.763 1.763 0 0 0 1.687-1.78l-.01-4.347c0-2.388 1.918-4.325 4.287-4.328 2.37.001 4.291 1.938 4.292 4.328v3.914a2.71 2.71 0 0 1-1.851 2.605A2.75 2.75 0 0 0 17 19.926c-1.525.004-2.759 1.25-2.76 2.787.001 1.537 1.235 2.784 2.76 2.787a2.78 2.78 0 0 0 2.65-1.99 4.85 4.85 0 0 0 3.17-2.503v-.003q.093.018.19.019c2.231-.072 4.001-1.923 3.99-4.174.011-2.252-1.758-4.103-3.99-4.176M9.05 16.85c0-.982.665-1.838 1.611-2.073v.119l.01 4.027a2.13 2.13 0 0 1-1.618-2.073zm7.242 5.863a.72.72 0 0 1 .206-.507.7.7 0 0 1 .501-.211c.173-.001.34.063.467.18.157.134.247.331.246.538a.7.7 0 0 1-.184.476.7.7 0 0 1-.529.243.716.716 0 0 1-.706-.719zm7.05-3.797v-4.02q.002-.058-.004-.116a2.125 2.125 0 0 1 1.612 2.069c0 .979-.663 1.832-1.605 2.067z"></path></g>', 2)
  ]));
}
const MediaIconReport = { render: render$7 };
const _hoisted_1$9 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$6(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$9, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M.55 8.327c3.055-4.972 6.324-6.04 7.733-5.92 1.663.14 1.386 2.038 1.4 2.056-.57 1.463.617.79.617.79 1.804-.908 3.291-.553 3.291-.553 1.668.717.814 2.457.814 2.457-.335.594.26.672.26.672 1.927.458 2.34 2.024 2.34 2.024.5 3.779-4.955 5.581-4.955 5.581-5.375 1.588-9.18-.672-9.18-.672C-1.69 12.35.55 8.327.55 8.327m7.623-1.226c-3.269 0-6.283 1.983-6.283 4.04 0 2.076 2.088 3.742 5.912 3.742 3.253 0 5.912-2.26 5.912-4.318s-2.28-3.464-5.54-3.464m-.807 1.445c1.686.002 3.173.911 3.054 2.736-.096 1.503-1.368 2.674-3.054 2.734-2.042.078-3.388-.853-3.15-2.696a3.18 3.18 0 0 1 3.15-2.774m-1.069 2.397c-.554.078-1.091.498-1.091 1.027 0 .536.458.932 1.028.932.577.024 1.116-.53 1.116-1.066s-.498-.971-1.053-.893m1.726-.458a.4.4 0 0 0-.395.395.4.4 0 0 0 .395.396c.215.022.396-.152.396-.396a.396.396 0 0 0-.396-.395M14.764.002l.258.012c2.122.174 4.186 1.6 4.78 3.701a5.24 5.24 0 0 1-.259 3.565c-.176.417-.753.498-1.109.299-.418-.237-.48-.712-.3-1.108l-.032.071c.016-.037.038-.09.05-.127a5 5 0 0 0 .18-.726l.002-.013.004-.051.01-.119c.017-.158.017-.34.017-.498v-.113a1.2 1.2 0 0 0-.018-.204l-.012-.047-.006-.049a6 6 0 0 0-.136-.576 2 2 0 0 1-.078-.199c-.04-.1-.081-.203-.137-.3a2.4 2.4 0 0 1-.181-.276c-.04-.04-.056-.096-.096-.137l.008.013-.026-.03a6 6 0 0 0-.617-.594c-.01-.01-.05-.043-.078-.065l-.019-.016.057.04a1 1 0 0 0-.066-.047l.004.003-.02-.015-.077-.06a8 8 0 0 0-.318-.198 5 5 0 0 0-.373-.199.2.2 0 0 1-.04-.009l-.008-.003.03.012a1 1 0 0 1-.082-.027L16 1.884a3 3 0 0 0-.595-.181c-.08-.023-.136-.023-.199-.04L15.2 1.66l-.115-.007-.139-.008h-.499c-.1 0-.18.017-.259.017l-.043.01-.057.007-.027.003h-.005l-.087.017-.098.02c-.097.022-.182.037-.278.077-.418.157-.892-.158-.952-.594-.119-.435.163-.853.577-.99.554-.198 1.21-.238 1.804-.198Zm-1.106 2.98c.83-.239 1.827-.04 2.46.536.71.61.932 1.66.655 2.553a.53.53 0 0 1-.655.373c-.278-.06-.452-.377-.374-.654.023-.063.023-.125.04-.18l.013-.025q.006-.03.005-.072v-.418l.002-.034c-.016-.073-.028-.14-.047-.207l-.033-.098c-.018-.058-.018-.058 0-.018 0-.04-.018-.056-.04-.096s-.038-.096-.078-.136c.062.058-.056-.078-.056-.078-.058-.04-.096-.079-.137-.119-.259-.239-.614-.317-.932-.317-.078 0-.181.018-.26.018q-.026 0-.038-.002l-.005-.002-.012.004c-.042.015-.074.02-.107.027l-.052.013c-.65.181-.95-.849-.349-1.068" transform="translate(7 9)"></path></g>', 2)
  ]));
}
const MediaIconWeiBo = { render: render$6 };
const _hoisted_1$8 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$5(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$8, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M22.608 11.605a4.4 4.4 0 0 1-1.257-1.216 4.3 4.3 0 0 1-.669-1.604A4.3 4.3 0 0 1 20.61 8h-3.16v12.407a2.58 2.58 0 0 1-.81 1.77 2.68 2.68 0 0 1-1.833.728c-.429 0-.85-.103-1.23-.299a2.63 2.63 0 0 1-1.038-.957 2.57 2.57 0 0 1-.384-1.346 2.58 2.58 0 0 1 .778-1.838 2.68 2.68 0 0 1 2.656-.642v-3.161a6 6 0 0 0-.782-.057 5.87 5.87 0 0 0-4.104 1.67A5.65 5.65 0 0 0 9 20.304c0 .916.226 1.818.657 2.63a5.7 5.7 0 0 0 1.821 2.035A5.86 5.86 0 0 0 14.806 26a5.87 5.87 0 0 0 4.103-1.67 5.65 5.65 0 0 0 1.703-4.027v-6.291A7.6 7.6 0 0 0 25 15.398v-3.102a4.42 4.42 0 0 1-2.392-.69"></path></g>', 2)
  ]));
}
const MediaIconDouYin = { render: render$5 };
const _hoisted_1$7 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$4(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$7, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M27.405 14.823a.02.02 0 0 0 .019.018l.05.002h.726a.819.819 0 0 0 .78-.998.796.796 0 0 0-.884-.634.81.81 0 0 0-.692.815q-.002.376 0 .753zm-11.509 4.935c-.203 0-1.353.004-1.685.002a2.5 2.5 0 0 1-.766-.128.025.025 0 0 0-.03.014l-.716 1.59a.026.026 0 0 0 .01.033c.111.061.336.127.495.127.12 0 .111.004.23.003l1.751-.003q.016 0 .023-.016l.712-1.586a.026.026 0 0 0-.024-.036m-8.938-4.904H5.477c-.017 0-.05 0-.066.002q-.011.004-.01.008l-.01.082q-.016.247-.035.493-.016.225-.035.449l-.035.47-.037.486-.036.493-.035.456q-.012.147-.021.294a1.5 1.5 0 0 1-.135.623c-.026.058-.033.043.003.115.046.094.682 1.562.787 1.785q.01.022.017.02c.008 0 .033-.025.047-.044.147-.192.268-.402.371-.622.15-.32.261-.655.346-.999q.094-.37.14-.752c.014-.113.021-.226.03-.338l.06-.802.055-.706.037-.515.052-.662.023-.302c.002-.028-.002-.033-.032-.034m5.722 3.856a1.5 1.5 0 0 1-.135-.623q-.009-.147-.021-.294l-.036-.456q-.017-.247-.036-.493l-.037-.486-.034-.47-.036-.45-.035-.492c-.002-.03-.005-.072-.01-.084-.004-.011-.052-.008-.076-.008h-1.481c-.03.001-.033.006-.03.034l.022.302q.026.33.051.662l.038.515.054.706.06.802c.01.112.016.225.03.338q.047.381.14.752c.086.344.196.68.347 1 .103.22.223.429.37.62.015.02.037.053.048.051.006-.001.007-.008.013-.02.095-.195.744-1.696.791-1.79.036-.073.029-.058.003-.116m3.861-.937h-.872a.13.13 0 0 1-.116-.183l1.178-2.694a.026.026 0 0 0-.023-.036l-1.318-.003a.152.152 0 0 1-.135-.214l.876-2.006a.026.026 0 0 0-.023-.037h-1.56a.03.03 0 0 0-.024.016l-.926 2.122a10 10 0 0 0-.267.588c-.05.123-.097.246-.132.374a.6.6 0 0 0-.02.197.48.48 0 0 0 .23.387.7.7 0 0 0 .129.063 1 1 0 0 0 .33.06h.59c.024 0-.584 1.365-.693 1.63a4 4 0 0 0-.14.394.6.6 0 0 0-.023.177.48.48 0 0 0 .23.408.7.7 0 0 0 .136.065q.165.058.339.057h1.659q.016 0 .024-.016l.575-1.313a.026.026 0 0 0-.024-.036M9.61 12.707H8.1a.033.033 0 0 0-.033.034c0 .39-.01 4.154-.01 6.054v.955c0 .295-.269.268-.28.268h-.74c-.04.001-.044.004-.041.049.002.037.466 1.091.556 1.295.009.021.029.035.051.035.157.002.767.009.938-.014.153-.02.3-.062.438-.136.3-.16.49-.43.595-.785q.076-.267.075-.548v-3.527c0-1.124-.006-3.35-.007-3.647a.033.033 0 0 0-.032-.033m11.785 7.077q-.002-.021-.024-.022h-1.465c-.048-.002-.049-.002-.05-.05v-4.783c0-.074-.005-.073.07-.072h.863c.079 0 .075.005.075-.075v-1.484c0-.084.006-.078-.08-.078h-3.5c-.064 0-.075-.006-.075.075v1.484c0 .084-.006.078.08.078h.854c.075 0 .07-.004.07.072v4.745c0 .098.008.087-.085.087-.37 0-1.11-.003-1.304 0-.048.001-.06.031-.06.031l-.697 1.558s-.014.026-.008.037.013.009.058.009l1.692.002h3.551c.03-.002.034-.006.035-.034v-1.58m4.177-3.52q0 .022-.021.025l-.043.002-.957.002-.036-.001q-.021-.002-.022-.024l-.001-.058-.01-1.28c0-.073-.005-.072.07-.072l.734-.002c.041 0 .081.002.12.016a.23.23 0 0 1 .165.21q.002.025.002.05v1.132m3.394 1.276c-.084-.458-.32-.804-.724-1.025a1.9 1.9 0 0 0-.883-.228q-.09-.002-.18 0c-.04-.001-.04-.003-.042-.042v-1.082q.001-.203-.025-.404a2 2 0 0 0-.153-.544 1.56 1.56 0 0 0-.677-.73 2.1 2.1 0 0 0-1-.264c-.153-.003-.567.001-.72 0-.07 0-.068.004-.068-.066v-.506q.001-.022-.01-.034c-.009-.008-.036-.007-.036-.007H22.93s-.016 0-.023.008q-.009.008-.008.023v.502l-.001.059q-.002.02-.024.022h-1.006c-.022.002-.028.009-.03.033v1.52c0 .093-.004.084.082.084h.913c.082 0 .072.131.072.131l-.001 1.107v.071s.004.12-.06.12h-1.481c-.068 0-.06.085-.06.085v1.483s-.01.07.064.07h1.457c.082 0 .076-.007.076.08v3.311c0 .09-.007.083.082.083h1.43c.09 0 .082.007.082-.083v-3.355c.001-.03.006-.035.033-.036h.057l1.195-.002h1.071q.147 0 .279.062.255.128.275.418.004.07.003.14v1.076c0 .266-.107.377-.33.377h-1.218c-.023.001-.029.008-.028.033 0 .022.469 1.112.564 1.327l.005.01a.05.05 0 0 0 .04.028h.018c.09.002.297.005.493.003.15-.002.517.004.666-.01.138-.013.275-.036.408-.078.59-.184.974-.716.975-1.347v-2.034q.002-.195-.033-.389"></path></g>', 2)
  ]));
}
const MediaIconXiaoHongShu = { render: render$4 };
const _hoisted_1$6 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$3(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$6, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M13.538 4.84c.23 0 .456.017.683.042C13.61 2.08 10.56 0 7.08 0 3.188 0 0 2.603 0 5.911c0 1.91 1.06 3.477 2.833 4.694l-.708 2.09L4.6 11.479c.885.17 1.595.347 2.479.347q.333-.001.66-.025a5.1 5.1 0 0 1-.219-1.459c.001-3.036 2.656-5.501 6.018-5.501M9.732 2.956c.536 0 .887.345.887.868 0 .52-.351.869-.886.869-.53 0-1.062-.349-1.062-.87 0-.524.532-.867 1.062-.867M4.78 4.693c-.532 0-1.066-.349-1.066-.87 0-.522.534-.867 1.066-.867.531 0 .883.343.883.868 0 .52-.352.869-.883.869M20 10.258c0-2.78-2.832-5.044-6.014-5.044-3.369 0-6.02 2.266-6.02 5.044 0 2.786 2.653 5.044 6.02 5.044.705 0 1.416-.173 2.124-.348L18.051 16l-.532-1.738C18.94 13.214 20 11.825 20 10.258m-7.966-.87c-.352 0-.708-.344-.708-.695 0-.346.356-.695.708-.695.537 0 .886.349.886.695 0 .351-.349.695-.886.695m3.893 0c-.348 0-.703-.344-.703-.695 0-.346.354-.695.704-.695.532 0 .886.349.886.695 0 .351-.354.695-.886.695" transform="translate(7 9)"></path></g>', 2)
  ]));
}
const MediaIconWeChatPublicPlatform = { render: render$3 };
const _hoisted_1$5 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "34",
  height: "34"
};
function render$2(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$5, _cache[0] || (_cache[0] = [
    createStaticVNode('<defs><linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#CEB788"></stop><stop offset="100%" stop-color="#FFF"></stop></linearGradient></defs><g fill="none" fill-rule="evenodd"><circle cx="17" cy="17" r="17" fill="#000" fill-opacity=".5"></circle><path fill="url(#a)" fill-rule="nonzero" d="M4.147 1.876A1.091 1.091 0 1 1 5.662.306L8.02 2.58q.1.097.17.21h3.565a1 1 0 0 1 .171-.21L14.282.306a1.091 1.091 0 0 1 1.515 1.57l-.948.915h.707A4.444 4.444 0 0 1 20 7.235v6.117a4.444 4.444 0 0 1-4.444 4.445H4.444A4.444 4.444 0 0 1 0 13.352V7.235a4.444 4.444 0 0 1 4.444-4.444h.651zm.297 3.058a2.22 2.22 0 0 0-2.222 2.223v6.274c0 1.227.995 2.222 2.222 2.222h11.112a2.22 2.22 0 0 0 2.222-2.222V7.157a2.22 2.22 0 0 0-2.222-2.223zm1.112 4.327a1.111 1.111 0 0 1 2.222 0v.994a1.111 1.111 0 1 1-2.222 0zm7.777-1.11c-.613 0-1.11.497-1.11 1.11v.994a1.111 1.111 0 1 0 2.221 0V9.26c0-.613-.497-1.11-1.11-1.11" transform="translate(7 7.703)"></path></g>', 2)
  ]));
}
const MediaIconBilibili = { render: render$2 };
function aiHelp(domain, appId, appKey, intent) {
  return new Promise((resolve, reject) => {
    try {
      const scriptEl = window.document.createElement("script");
      scriptEl.src = "https://cdn.aihelp.net/webchatv3/aihelp.js";
      scriptEl.onerror = (error) => {
        window.api.send("ali-sls-log", "aihelp script", `${error}`);
      };
      scriptEl.onload = () => {
        window?.AIHelpSupport?.init({
          showConversation: "showConversation",
          supportMode: "showAllFAQSections",
          supportConfig: {
            showConversationMoment: "always",
            alwaysShowHumanSupportButtonInBotPage: true,
            conversationIntent: intent
          },
          appKey,
          domain,
          appId,
          language: "ja"
        });
        resolve(window?.AIHelpSupport.show);
      };
      window.document.body.appendChild(scriptEl);
    } catch (error) {
      window.api.send("ali-sls-log", "aihelp catch", `${error}`);
      reject(error);
    }
  });
}
const _hoisted_1$4 = { class: "social-media-container" };
const _hoisted_2$1 = ["href"];
const _hoisted_3$1 = ["src"];
const _hoisted_4$1 = ["href"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SocialMedia",
  setup(__props) {
    const loaded = ref(false);
    const mediaIconMap = {
      官网: MediaIconHome,
      Cafe: MediaIconCoffee,
      Discord: MediaIconDiscord,
      Facebook: MediaIconFacebook,
      Reddit: MediaIconReddit,
      Twitch: MediaIconTwitch,
      X: MediaIconX,
      YouTube: MediaIconYoutube,
      Lounge: MediaIconLounge,
      微博: MediaIconWeiBo,
      抖音: MediaIconDouYin,
      小红书: MediaIconXiaoHongShu,
      微信公众号: MediaIconWeChatPublicPlatform,
      联系客服: MediaIconReport,
      bilibili: MediaIconBilibili
    };
    const list = reactive([]);
    const reportable = ref(false);
    const aiHelpContainer = ref();
    const aiHelpButton = ref();
    const aiHelpArrow = ref(false);
    const reportUrl = ref("");
    let hideTimeout;
    const hideAiHelp = () => {
      hideTimeout = setTimeout(() => {
        if (aiHelpContainer.value) {
          aiHelpContainer.value.style.display = "none";
          aiHelpArrow.value = false;
        }
      }, 200);
    };
    const showAiHelp = () => {
      clearTimeout(hideTimeout);
      if (aiHelpContainer.value) {
        aiHelpContainer.value.style.display = "block";
        aiHelpArrow.value = true;
      }
    };
    const getData = async () => {
      loaded.value = false;
      list.length = 0;
      try {
        const res = await requestMedia();
        if (res.social_media_resource_open) {
          res.social_media_resource_list.forEach((item) => {
            list.push({
              icon: item.social_media_channel,
              url: item.jump_url,
              qr: item.qr_img
            });
          });
        }
        reportable.value = res.contact_customer_complaint;
        if (res.contact_customer_complaint) {
          if (res.contact_customer_complaint_type === 1) {
            const aiHelpShow = await aiHelp(
              res.aihelp_customer_complaint.aihelp_domain,
              res.aihelp_customer_complaint.aihelp_app_id,
              res.aihelp_customer_complaint.aihelp_app_key,
              res.aihelp_customer_complaint.initial_interface ? "bot" : "human"
            );
            const aiHelpInit = () => {
              aiHelpShow?.();
              aiHelpButton.value?.removeEventListener("mouseenter", aiHelpInit);
            };
            aiHelpButton.value?.addEventListener("mouseenter", aiHelpInit);
            const AiHelpContainer = window.document.getElementById("AIHelpSupportDiv");
            if (AiHelpContainer) {
              aiHelpContainer.value = AiHelpContainer;
              aiHelpContainer.value.addEventListener("mouseenter", showAiHelp);
              aiHelpContainer.value.addEventListener("mouseleave", hideAiHelp);
              aiHelpButton.value?.addEventListener("mouseenter", showAiHelp);
              aiHelpButton.value?.addEventListener("mouseleave", hideAiHelp);
            }
          } else {
            reportUrl.value = res.contact_customer_complaint_type === 0 ? res.web_customer_complaint_url : `mailto:${res.mail_customer_complaint_url}`;
          }
        }
      } catch {
      }
      loaded.value = true;
    };
    onMounted(() => {
      getData();
    });
    onUnmounted(() => {
      aiHelpContainer.value?.removeEventListener("mouseenter", showAiHelp);
      aiHelpContainer.value?.removeEventListener("mouseleave", hideAiHelp);
      aiHelpButton.value?.removeEventListener("mouseenter", showAiHelp);
      aiHelpButton.value?.removeEventListener("mouseleave", hideAiHelp);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(list, (item, index) => {
          return openBlock(), createElementBlock("div", {
            class: normalizeClass(["item-container", { qr: item.qr }]),
            key: index
          }, [
            item.url ? (openBlock(), createElementBlock("a", {
              key: 0,
              class: "item-icon",
              href: item.url,
              target: "_blank"
            }, [
              (openBlock(), createBlock(resolveDynamicComponent(mediaIconMap[item.icon])))
            ], 8, _hoisted_2$1)) : (openBlock(), createBlock(resolveDynamicComponent(mediaIconMap[item.icon]), { key: 1 })),
            item.qr ? (openBlock(), createElementBlock("div", {
              key: 2,
              class: normalizeClass(["item-more", `offset-${index}`])
            }, [
              createBaseVNode("img", {
                src: item.qr
              }, null, 8, _hoisted_3$1)
            ], 2)) : createCommentVNode("", true)
          ], 2);
        }), 128)),
        reportable.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["item-container", { arrow: aiHelpArrow.value }]),
          ref_key: "aiHelpButton",
          ref: aiHelpButton
        }, [
          reportUrl.value ? (openBlock(), createElementBlock("a", {
            key: 0,
            class: "item-icon",
            href: reportUrl.value,
            target: "_blank"
          }, [
            createVNode(unref(MediaIconReport))
          ], 8, _hoisted_4$1)) : (openBlock(), createBlock(unref(MediaIconReport), { key: 1 }))
        ], 2)) : createCommentVNode("", true)
      ]);
    };
  }
});
const SocialMedia_vue_vue_type_style_index_0_scoped_3c72d8e3_lang = "";
const SocialMedia = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-3c72d8e3"]]);
const swiper = "";
const autoplay = "";
function isObject$2(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$2(target, src) {
  if (target === void 0) {
    target = {};
  }
  if (src === void 0) {
    src = {};
  }
  Object.keys(src).forEach((key) => {
    if (typeof target[key] === "undefined")
      target[key] = src[key];
    else if (isObject$2(src[key]) && isObject$2(target[key]) && Object.keys(src[key]).length > 0) {
      extend$2(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend$2(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend$2(win, ssrWindow);
  return win;
}
function classesToTokens(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return classes2.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach((key) => {
    try {
      object[key] = null;
    } catch (e) {
    }
    try {
      delete object[key];
    } catch (e) {
    }
  });
}
function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return setTimeout(callback, delay);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window2 = getWindow();
  let style2;
  if (window2.getComputedStyle) {
    style2 = window2.getComputedStyle(el, null);
  }
  if (!style2 && el.currentStyle) {
    style2 = el.currentStyle;
  }
  if (!style2) {
    style2 = el.style;
  }
  return style2;
}
function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = "x";
  }
  const window2 = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window2.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(",").length > 6) {
      curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
    }
    transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
    matrix = transformMatrix.toString().split(",");
  }
  if (axis === "x") {
    if (window2.WebKitCSSMatrix)
      curTransform = transformMatrix.m41;
    else if (matrix.length === 16)
      curTransform = parseFloat(matrix[12]);
    else
      curTransform = parseFloat(matrix[4]);
  }
  if (axis === "y") {
    if (window2.WebKitCSSMatrix)
      curTransform = transformMatrix.m42;
    else if (matrix.length === 16)
      curTransform = parseFloat(matrix[13]);
    else
      curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject$1(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend$1() {
  const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
  const noExtend = ["__proto__", "constructor", "prototype"];
  for (let i = 1; i < arguments.length; i += 1) {
    const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
    if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== void 0 && desc.enumerable) {
          if (isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend$1(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend$1(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll(_ref) {
  let {
    swiper: swiper2,
    targetPosition,
    side
  } = _ref;
  const window2 = getWindow();
  const startPosition = -swiper2.translate;
  let startTime = null;
  let time;
  const duration = swiper2.params.speed;
  swiper2.wrapperEl.style.scrollSnapType = "none";
  window2.cancelAnimationFrame(swiper2.cssModeFrameID);
  const dir = targetPosition > startPosition ? "next" : "prev";
  const isOutOfBound = (current, target) => {
    return dir === "next" && current >= target || dir === "prev" && current <= target;
  };
  const animate = () => {
    time = (/* @__PURE__ */ new Date()).getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper2.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper2.wrapperEl.style.overflow = "hidden";
      swiper2.wrapperEl.style.scrollSnapType = "";
      setTimeout(() => {
        swiper2.wrapperEl.style.overflow = "";
        swiper2.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window2.cancelAnimationFrame(swiper2.cssModeFrameID);
      return;
    }
    swiper2.cssModeFrameID = window2.requestAnimationFrame(animate);
  };
  animate();
}
function elementChildren(element, selector) {
  if (selector === void 0) {
    selector = "";
  }
  return [...element.children].filter((el) => el.matches(selector));
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
  }
}
function createElement(tag, classes2) {
  if (classes2 === void 0) {
    classes2 = [];
  }
  const el = document.createElement(tag);
  el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
  return el;
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    if (selector) {
      if (prev.matches(selector))
        prevEls.push(prev);
    } else
      prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling;
    if (selector) {
      if (next.matches(selector))
        nextEls.push(next);
    } else
      nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window2 = getWindow();
  return window2.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1)
        i += 1;
    }
    return i;
  }
  return void 0;
}
function elementParents(el, selector) {
  const parents = [];
  let parent = el.parentElement;
  while (parent) {
    if (selector) {
      if (parent.matches(selector))
        parents.push(parent);
    } else {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementTransitionEnd(el, callback) {
  function fireCallBack(e) {
    if (e.target !== el)
      return;
    callback.call(el, e);
    el.removeEventListener("transitionend", fireCallBack);
  }
  if (callback) {
    el.addEventListener("transitionend", fireCallBack);
  }
}
function elementOuterSize(el, size, includeMargins) {
  const window2 = getWindow();
  if (includeMargins) {
    return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
  }
  return el.offsetWidth;
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
let support;
function calcSupport() {
  const window2 = getWindow();
  const document2 = getDocument();
  return {
    smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
    touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice(_temp) {
  let {
    userAgent
  } = _temp === void 0 ? {} : _temp;
  const support2 = getSupport();
  const window2 = getWindow();
  const platform = window2.navigator.platform;
  const ua = userAgent || window2.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window2.screen.width;
  const screenHeight = window2.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === "Win32";
  let macos = platform === "MacIntel";
  const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
  if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad)
      ipad = [0, 1, "13_0_0"];
    macos = false;
  }
  if (android && !windows) {
    device.os = "android";
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = "ios";
    device.ios = true;
  }
  return device;
}
function getDevice(overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window2 = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window2.navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
  }
  if (isSafari()) {
    const ua = String(window2.navigator.userAgent);
    if (ua.includes("Version/")) {
      const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize(_ref) {
  let {
    swiper: swiper2,
    on,
    emit
  } = _ref;
  const window2 = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
      return;
    emit("beforeResize");
    emit("resize");
  };
  const createObserver = () => {
    if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
      return;
    observer = new ResizeObserver((entries) => {
      animationFrame = window2.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper2;
        let newWidth = width;
        let newHeight = height;
        entries.forEach((_ref2) => {
          let {
            contentBoxSize,
            contentRect,
            target
          } = _ref2;
          if (target && target !== swiper2.el)
            return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper2.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window2.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper2.el) {
      observer.unobserve(swiper2.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper2 || swiper2.destroyed || !swiper2.initialized)
      return;
    emit("orientationchange");
  };
  on("init", () => {
    if (swiper2.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
      createObserver();
      return;
    }
    window2.addEventListener("resize", resizeHandler);
    window2.addEventListener("orientationchange", orientationChangeHandler);
  });
  on("destroy", () => {
    removeObserver();
    window2.removeEventListener("resize", resizeHandler);
    window2.removeEventListener("orientationchange", orientationChangeHandler);
  });
}
function Observer(_ref) {
  let {
    swiper: swiper2,
    extendParams,
    on,
    emit
  } = _ref;
  const observers = [];
  const window2 = getWindow();
  const attach = function(target, options) {
    if (options === void 0) {
      options = {};
    }
    const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
    const observer = new ObserverFunc((mutations) => {
      if (swiper2.__preventObserver__)
        return;
      if (mutations.length === 1) {
        emit("observerUpdate", mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate2() {
        emit("observerUpdate", mutations[0]);
      };
      if (window2.requestAnimationFrame) {
        window2.requestAnimationFrame(observerUpdate);
      } else {
        window2.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === "undefined" ? true : options.attributes,
      childList: typeof options.childList === "undefined" ? true : options.childList,
      characterData: typeof options.characterData === "undefined" ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper2.params.observer)
      return;
    if (swiper2.params.observeParents) {
      const containerParents = elementParents(swiper2.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    attach(swiper2.hostEl, {
      childList: swiper2.params.observeSlideChildren
    });
    attach(swiper2.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on("init", init);
  on("destroy", destroy);
}
var eventsEmitter = {
  on(events2, handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (typeof handler !== "function")
      return self2;
    const method = priority ? "unshift" : "push";
    events2.split(" ").forEach((event2) => {
      if (!self2.eventsListeners[event2])
        self2.eventsListeners[event2] = [];
      self2.eventsListeners[event2][method](handler);
    });
    return self2;
  },
  once(events2, handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (typeof handler !== "function")
      return self2;
    function onceHandler() {
      self2.off(events2, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      handler.apply(self2, args);
    }
    onceHandler.__emitterProxy = handler;
    return self2.on(events2, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (typeof handler !== "function")
      return self2;
    const method = priority ? "unshift" : "push";
    if (self2.eventsAnyListeners.indexOf(handler) < 0) {
      self2.eventsAnyListeners[method](handler);
    }
    return self2;
  },
  offAny(handler) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (!self2.eventsAnyListeners)
      return self2;
    const index = self2.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self2.eventsAnyListeners.splice(index, 1);
    }
    return self2;
  },
  off(events2, handler) {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (!self2.eventsListeners)
      return self2;
    events2.split(" ").forEach((event2) => {
      if (typeof handler === "undefined") {
        self2.eventsListeners[event2] = [];
      } else if (self2.eventsListeners[event2]) {
        self2.eventsListeners[event2].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self2.eventsListeners[event2].splice(index, 1);
          }
        });
      }
    });
    return self2;
  },
  emit() {
    const self2 = this;
    if (!self2.eventsListeners || self2.destroyed)
      return self2;
    if (!self2.eventsListeners)
      return self2;
    let events2;
    let data;
    let context;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      events2 = args[0];
      data = args.slice(1, args.length);
      context = self2;
    } else {
      events2 = args[0].events;
      data = args[0].data;
      context = args[0].context || self2;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
    eventsArray.forEach((event2) => {
      if (self2.eventsAnyListeners && self2.eventsAnyListeners.length) {
        self2.eventsAnyListeners.forEach((eventHandler) => {
          eventHandler.apply(context, [event2, ...data]);
        });
      }
      if (self2.eventsListeners && self2.eventsListeners[event2]) {
        self2.eventsListeners[event2].forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self2;
  }
};
function updateSize() {
  const swiper2 = this;
  let width;
  let height;
  const el = swiper2.el;
  if (typeof swiper2.params.width !== "undefined" && swiper2.params.width !== null) {
    width = swiper2.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper2.params.height !== "undefined" && swiper2.params.height !== null) {
    height = swiper2.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper2.isHorizontal() || height === 0 && swiper2.isVertical()) {
    return;
  }
  width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
  height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
  if (Number.isNaN(width))
    width = 0;
  if (Number.isNaN(height))
    height = 0;
  Object.assign(swiper2, {
    width,
    height,
    size: swiper2.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper2 = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper2.getDirectionLabel(label)) || 0);
  }
  const params = swiper2.params;
  const {
    wrapperEl,
    slidesEl,
    size: swiperSize,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper2;
  const isVirtual = swiper2.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper2.virtual.slides.length : swiper2.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper2.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper2.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === "function") {
    offsetBefore = params.slidesOffsetBefore.call(swiper2);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === "function") {
    offsetAfter = params.slidesOffsetAfter.call(swiper2);
  }
  const previousSnapGridLength = swiper2.snapGrid.length;
  const previousSlidesGridLength = swiper2.slidesGrid.length;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === "undefined") {
    return;
  }
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper2.virtualSize = -spaceBetween;
  slides.forEach((slideEl) => {
    if (rtl) {
      slideEl.style.marginLeft = "";
    } else {
      slideEl.style.marginRight = "";
    }
    slideEl.style.marginBottom = "";
    slideEl.style.marginTop = "";
  });
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper2.grid;
  if (gridEnabled) {
    swiper2.grid.initSlides(slides);
  } else if (swiper2.grid) {
    swiper2.grid.unsetSlides();
  }
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
    return typeof params.breakpoints[key].slidesPerView !== "undefined";
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    let slide2;
    if (slides[i])
      slide2 = slides[i];
    if (gridEnabled) {
      swiper2.grid.updateSlide(i, slide2, slides);
    }
    if (slides[i] && elementStyle(slide2, "display") === "none")
      continue;
    if (params.slidesPerView === "auto") {
      if (shouldResetSlideSize) {
        slides[i].style[swiper2.getDirectionLabel("width")] = ``;
      }
      const slideStyles = getComputedStyle(slide2);
      const currentTransform = slide2.style.transform;
      const currentWebKitTransform = slide2.style.webkitTransform;
      if (currentTransform) {
        slide2.style.transform = "none";
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = "none";
      }
      if (params.roundLengths) {
        slideSize = swiper2.isHorizontal() ? elementOuterSize(slide2, "width", true) : elementOuterSize(slide2, "height", true);
      } else {
        const width = getDirectionPropertyValue(slideStyles, "width");
        const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
        const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
        const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
        const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
        const boxSizing = slideStyles.getPropertyValue("box-sizing");
        if (boxSizing && boxSizing === "border-box") {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide2;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide2.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths)
        slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths)
        slideSize = Math.floor(slideSize);
      if (slides[i]) {
        slides[i].style[swiper2.getDirectionLabel("width")] = `${slideSize}px`;
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0)
        slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0)
        slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1e3)
        slidePosition = 0;
      if (params.roundLengths)
        slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0)
        snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths)
        slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper2.params.slidesPerGroupSkip, index)) % swiper2.params.slidesPerGroup === 0)
        snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper2.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper2.virtualSize = Math.max(swiper2.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
    wrapperEl.style.width = `${swiper2.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper2.getDirectionLabel("width")] = `${swiper2.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper2.grid.updateWrapperSize(slideSize, snapGrid);
  }
  if (!params.centeredSlides) {
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths)
        slidesGridItem = Math.floor(slidesGridItem);
      if (snapGrid[i] <= swiper2.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper2.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper2.virtualSize - swiperSize);
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper2.virtual.slidesBefore + swiper2.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper2.virtual.slidesBefore + swiper2.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper2.virtualSize += size;
    }
  }
  if (snapGrid.length === 0)
    snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper2.isHorizontal() && rtl ? "marginLeft" : swiper2.getDirectionLabel("marginRight");
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop)
        return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach((slideEl) => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize - swiperSize;
    snapGrid = snapGrid.map((snap) => {
      if (snap <= 0)
        return -offsetBefore;
      if (snap > maxSnap)
        return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper2, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper2.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper2.snapGrid[0];
    const addToSlidesGrid = -swiper2.slidesGrid[0];
    swiper2.snapGrid = swiper2.snapGrid.map((v) => v + addToSnapGrid);
    swiper2.slidesGrid = swiper2.slidesGrid.map((v) => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper2.emit("slidesLengthChange");
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper2.params.watchOverflow)
      swiper2.checkOverflow();
    swiper2.emit("snapGridLengthChange");
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper2.emit("slidesGridLengthChange");
  }
  if (params.watchSlidesProgress) {
    swiper2.updateSlidesOffset();
  }
  swiper2.emit("slidesUpdated");
  if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper2.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded)
        swiper2.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper2.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper2 = this;
  const activeSlides = [];
  const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === "number") {
    swiper2.setTransition(speed);
  } else if (speed === true) {
    swiper2.setTransition(swiper2.params.speed);
  }
  const getSlideByIndex = (index) => {
    if (isVirtual) {
      return swiper2.slides[swiper2.getSlideIndexByData(index)];
    }
    return swiper2.slides[index];
  };
  if (swiper2.params.slidesPerView !== "auto" && swiper2.params.slidesPerView > 1) {
    if (swiper2.params.centeredSlides) {
      (swiper2.visibleSlides || []).forEach((slide2) => {
        activeSlides.push(slide2);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper2.params.slidesPerView); i += 1) {
        const index = swiper2.activeIndex + i;
        if (index > swiper2.slides.length && !isVirtual)
          break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper2.activeIndex));
  }
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== "undefined") {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }
  if (newHeight || newHeight === 0)
    swiper2.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper2 = this;
  const slides = swiper2.slides;
  const minusOffset = swiper2.isElement ? swiper2.isHorizontal() ? swiper2.wrapperEl.offsetLeft : swiper2.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper2.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper2.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate2) {
  if (translate2 === void 0) {
    translate2 = this && this.translate || 0;
  }
  const swiper2 = this;
  const params = swiper2.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper2;
  if (slides.length === 0)
    return;
  if (typeof slides[0].swiperSlideOffset === "undefined")
    swiper2.updateSlidesOffset();
  let offsetCenter = -translate2;
  if (rtl)
    offsetCenter = translate2;
  swiper2.visibleSlidesIndexes = [];
  swiper2.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper2.size;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide2 = slides[i];
    let slideOffset = slide2.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper2.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper2.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper2.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper2.size - swiper2.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper2.size - 1 || slideAfter > 1 && slideAfter <= swiper2.size || slideBefore <= 0 && slideAfter >= swiper2.size;
    if (isVisible) {
      swiper2.visibleSlides.push(slide2);
      swiper2.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide2, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide2, isFullyVisible, params.slideFullyVisibleClass);
    slide2.progress = rtl ? -slideProgress : slideProgress;
    slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate2) {
  const swiper2 = this;
  if (typeof translate2 === "undefined") {
    const multiplier = swiper2.rtlTranslate ? -1 : 1;
    translate2 = swiper2 && swiper2.translate && swiper2.translate * multiplier || 0;
  }
  const params = swiper2.params;
  const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper2;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate2 - swiper2.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate2 - swiper2.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate2 - swiper2.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded)
      progress = 0;
    if (isEndRounded)
      progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper2.getSlideIndexByData(0);
    const lastSlideIndex = swiper2.getSlideIndexByData(swiper2.slides.length - 1);
    const firstSlideTranslate = swiper2.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper2.slidesGrid[lastSlideIndex];
    const translateMax = swiper2.slidesGrid[swiper2.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate2);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1)
      progressLoop -= 1;
  }
  Object.assign(swiper2, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight)
    swiper2.updateSlidesProgress(translate2);
  if (isBeginning && !wasBeginning) {
    swiper2.emit("reachBeginning toEdge");
  }
  if (isEnd && !wasEnd) {
    swiper2.emit("reachEnd toEdge");
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper2.emit("fromEdge");
  }
  swiper2.emit("progress", progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper2 = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper2;
  const isVirtual = swiper2.virtual && params.virtual.enabled;
  const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = (selector) => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper2.virtual.slidesBefore;
      if (slideIndex < 0)
        slideIndex = swiper2.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper2.virtual.slides.length)
        slideIndex -= swiper2.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.filter((slideEl) => slideEl.column === activeIndex)[0];
      nextSlide = slides.filter((slideEl) => slideEl.column === activeIndex + 1)[0];
      prevSlide = slides.filter((slideEl) => slideEl.column === activeIndex - 1)[0];
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach((slideEl) => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper2.emitSlidesClasses();
}
const processLazyPreloader = (swiper2, imageEl) => {
  if (!swiper2 || swiper2.destroyed || !swiper2.params)
    return;
  const slideSelector = () => swiper2.isElement ? `swiper-slide` : `.${swiper2.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper2.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
      } else {
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper2.params.lazyPreloaderClass}`);
            if (lazyEl)
              lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl)
      lazyEl.remove();
  }
};
const unlazy = (swiper2, index) => {
  if (!swiper2.slides[index])
    return;
  const imageEl = swiper2.slides[index].querySelector('[loading="lazy"]');
  if (imageEl)
    imageEl.removeAttribute("loading");
};
const preload = (swiper2) => {
  if (!swiper2 || swiper2.destroyed || !swiper2.params)
    return;
  let amount = swiper2.params.lazyPreloadPrevNext;
  const len = swiper2.slides.length;
  if (!len || !amount || amount < 0)
    return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper2.params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : Math.ceil(swiper2.params.slidesPerView);
  const activeIndex = swiper2.activeIndex;
  if (swiper2.params.grid && swiper2.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper2.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column))
        unlazy(swiper2, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper2.params.rewind || swiper2.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView)
        unlazy(swiper2, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper2, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper2) {
  const {
    slidesGrid,
    params
  } = swiper2;
  const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== "undefined") {
      if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate2 >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === "undefined")
      activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper2 = this;
  const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper2;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = (aIndex) => {
    let realIndex2 = aIndex - swiper2.virtual.slidesBefore;
    if (realIndex2 < 0) {
      realIndex2 = swiper2.virtual.slides.length + realIndex2;
    }
    if (realIndex2 >= swiper2.virtual.slides.length) {
      realIndex2 -= swiper2.virtual.slides.length;
    }
    return realIndex2;
  };
  if (typeof activeIndex === "undefined") {
    activeIndex = getActiveIndexByTranslate(swiper2);
  }
  if (snapGrid.indexOf(translate2) >= 0) {
    snapIndex = snapGrid.indexOf(translate2);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length)
    snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper2.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper2.snapIndex = snapIndex;
      swiper2.emit("snapIndexChange");
    }
    return;
  }
  if (activeIndex === previousIndex && swiper2.params.loop && swiper2.virtual && swiper2.params.virtual.enabled) {
    swiper2.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
  let realIndex;
  if (swiper2.virtual && params.virtual.enabled && params.loop) {
    realIndex = getVirtualRealIndex(activeIndex);
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper2.slides.filter((slideEl) => slideEl.column === activeIndex)[0];
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper2.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper2.slides[activeIndex]) {
    const slideIndex = swiper2.slides[activeIndex].getAttribute("data-swiper-slide-index");
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper2, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper2.initialized) {
    preload(swiper2);
  }
  swiper2.emit("activeIndexChange");
  swiper2.emit("snapIndexChange");
  if (swiper2.initialized || swiper2.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper2.emit("realIndexChange");
    }
    swiper2.emit("slideChange");
  }
}
function updateClickedSlide(el, path) {
  const swiper2 = this;
  const params = swiper2.params;
  let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide2 && swiper2.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
      if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide2 = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide2) {
    for (let i = 0; i < swiper2.slides.length; i += 1) {
      if (swiper2.slides[i] === slide2) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide2 && slideFound) {
    swiper2.clickedSlide = slide2;
    if (swiper2.virtual && swiper2.params.virtual.enabled) {
      swiper2.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
    } else {
      swiper2.clickedIndex = slideIndex;
    }
  } else {
    swiper2.clickedSlide = void 0;
    swiper2.clickedIndex = void 0;
    return;
  }
  if (params.slideToClickedSlide && swiper2.clickedIndex !== void 0 && swiper2.clickedIndex !== swiper2.activeIndex) {
    swiper2.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis) {
  if (axis === void 0) {
    axis = this.isHorizontal() ? "x" : "y";
  }
  const swiper2 = this;
  const {
    params,
    rtlTranslate: rtl,
    translate: translate2,
    wrapperEl
  } = swiper2;
  if (params.virtualTranslate) {
    return rtl ? -translate2 : translate2;
  }
  if (params.cssMode) {
    return translate2;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper2.cssOverflowAdjustment();
  if (rtl)
    currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate2, byController) {
  const swiper2 = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper2;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper2.isHorizontal()) {
    x = rtl ? -translate2 : translate2;
  } else {
    y = translate2;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper2.previousTranslate = swiper2.translate;
  swiper2.translate = swiper2.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper2.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper2.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper2.isHorizontal()) {
      x -= swiper2.cssOverflowAdjustment();
    } else {
      y -= swiper2.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }
  let newProgress;
  const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate2 - swiper2.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper2.updateProgress(translate2);
  }
  swiper2.emit("setTranslate", swiper2.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate2, speed, runCallbacks, translateBounds, internal) {
  if (translate2 === void 0) {
    translate2 = 0;
  }
  if (speed === void 0) {
    speed = this.params.speed;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (translateBounds === void 0) {
    translateBounds = true;
  }
  const swiper2 = this;
  const {
    params,
    wrapperEl
  } = swiper2;
  if (swiper2.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate2 = swiper2.minTranslate();
  const maxTranslate2 = swiper2.maxTranslate();
  let newTranslate;
  if (translateBounds && translate2 > minTranslate2)
    newTranslate = minTranslate2;
  else if (translateBounds && translate2 < maxTranslate2)
    newTranslate = maxTranslate2;
  else
    newTranslate = translate2;
  swiper2.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper2.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
    } else {
      if (!swiper2.support.smoothScroll) {
        animateCSSModeScroll({
          swiper: swiper2,
          targetPosition: -newTranslate,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: -newTranslate,
        behavior: "smooth"
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper2.setTransition(0);
    swiper2.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper2.emit("beforeTransitionStart", speed, internal);
      swiper2.emit("transitionEnd");
    }
  } else {
    swiper2.setTransition(speed);
    swiper2.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper2.emit("beforeTransitionStart", speed, internal);
      swiper2.emit("transitionStart");
    }
    if (!swiper2.animating) {
      swiper2.animating = true;
      if (!swiper2.onTranslateToWrapperTransitionEnd) {
        swiper2.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper2 || swiper2.destroyed)
            return;
          if (e.target !== this)
            return;
          swiper2.wrapperEl.removeEventListener("transitionend", swiper2.onTranslateToWrapperTransitionEnd);
          swiper2.onTranslateToWrapperTransitionEnd = null;
          delete swiper2.onTranslateToWrapperTransitionEnd;
          swiper2.animating = false;
          if (runCallbacks) {
            swiper2.emit("transitionEnd");
          }
        };
      }
      swiper2.wrapperEl.addEventListener("transitionend", swiper2.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper2 = this;
  if (!swiper2.params.cssMode) {
    swiper2.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper2.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
  }
  swiper2.emit("setTransition", duration, byController);
}
function transitionEmit(_ref) {
  let {
    swiper: swiper2,
    runCallbacks,
    direction,
    step
  } = _ref;
  const {
    activeIndex,
    previousIndex
  } = swiper2;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex)
      dir = "next";
    else if (activeIndex < previousIndex)
      dir = "prev";
    else
      dir = "reset";
  }
  swiper2.emit(`transition${step}`);
  if (runCallbacks && activeIndex !== previousIndex) {
    if (dir === "reset") {
      swiper2.emit(`slideResetTransition${step}`);
      return;
    }
    swiper2.emit(`slideChangeTransition${step}`);
    if (dir === "next") {
      swiper2.emit(`slideNextTransition${step}`);
    } else {
      swiper2.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper2 = this;
  const {
    params
  } = swiper2;
  if (params.cssMode)
    return;
  if (params.autoHeight) {
    swiper2.updateAutoHeight();
  }
  transitionEmit({
    swiper: swiper2,
    runCallbacks,
    direction,
    step: "Start"
  });
}
function transitionEnd(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper2 = this;
  const {
    params
  } = swiper2;
  swiper2.animating = false;
  if (params.cssMode)
    return;
  swiper2.setTransition(0);
  transitionEmit({
    swiper: swiper2,
    runCallbacks,
    direction,
    step: "End"
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index, speed, runCallbacks, internal, initial) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    index = parseInt(index, 10);
  }
  const swiper2 = this;
  let slideIndex = index;
  if (slideIndex < 0)
    slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper2;
  if (!enabled && !internal && !initial || swiper2.destroyed || swiper2.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  const skip = Math.min(swiper2.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper2.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length)
    snapIndex = snapGrid.length - 1;
  const translate2 = -snapGrid[snapIndex];
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate2 * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  if (swiper2.initialized && slideIndex !== activeIndex) {
    if (!swiper2.allowSlideNext && (rtl ? translate2 > swiper2.translate && translate2 > swiper2.minTranslate() : translate2 < swiper2.translate && translate2 < swiper2.minTranslate())) {
      return false;
    }
    if (!swiper2.allowSlidePrev && translate2 > swiper2.translate && translate2 > swiper2.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper2.emit("beforeSlideChangeStart");
  }
  swiper2.updateProgress(translate2);
  let direction;
  if (slideIndex > activeIndex)
    direction = "next";
  else if (slideIndex < activeIndex)
    direction = "prev";
  else
    direction = "reset";
  if (rtl && -translate2 === swiper2.translate || !rtl && translate2 === swiper2.translate) {
    swiper2.updateActiveIndex(slideIndex);
    if (params.autoHeight) {
      swiper2.updateAutoHeight();
    }
    swiper2.updateSlidesClasses();
    if (params.effect !== "slide") {
      swiper2.setTranslate(translate2);
    }
    if (direction !== "reset") {
      swiper2.transitionStart(runCallbacks, direction);
      swiper2.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper2.isHorizontal();
    const t = rtl ? translate2 : -translate2;
    if (speed === 0) {
      const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
      if (isVirtual) {
        swiper2.wrapperEl.style.scrollSnapType = "none";
        swiper2._immediateVirtual = true;
      }
      if (isVirtual && !swiper2._cssModeVirtualInitialSet && swiper2.params.initialSlide > 0) {
        swiper2._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        });
      } else {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper2.wrapperEl.style.scrollSnapType = "";
          swiper2._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper2.support.smoothScroll) {
        animateCSSModeScroll({
          swiper: swiper2,
          targetPosition: t,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: t,
        behavior: "smooth"
      });
    }
    return true;
  }
  swiper2.setTransition(speed);
  swiper2.setTranslate(translate2);
  swiper2.updateActiveIndex(slideIndex);
  swiper2.updateSlidesClasses();
  swiper2.emit("beforeTransitionStart", speed, internal);
  swiper2.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper2.transitionEnd(runCallbacks, direction);
  } else if (!swiper2.animating) {
    swiper2.animating = true;
    if (!swiper2.onSlideToWrapperTransitionEnd) {
      swiper2.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
        if (!swiper2 || swiper2.destroyed)
          return;
        if (e.target !== this)
          return;
        swiper2.wrapperEl.removeEventListener("transitionend", swiper2.onSlideToWrapperTransitionEnd);
        swiper2.onSlideToWrapperTransitionEnd = null;
        delete swiper2.onSlideToWrapperTransitionEnd;
        swiper2.transitionEnd(runCallbacks, direction);
      };
    }
    swiper2.wrapperEl.addEventListener("transitionend", swiper2.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index, speed, runCallbacks, internal) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper2 = this;
  if (swiper2.destroyed)
    return;
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  const gridEnabled = swiper2.grid && swiper2.params.grid && swiper2.params.grid.rows > 1;
  let newIndex = index;
  if (swiper2.params.loop) {
    if (swiper2.virtual && swiper2.params.virtual.enabled) {
      newIndex = newIndex + swiper2.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper2.params.grid.rows;
        targetSlideIndex = swiper2.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex)[0].column;
      } else {
        targetSlideIndex = swiper2.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper2.slides.length / swiper2.params.grid.rows) : swiper2.slides.length;
      const {
        centeredSlides
      } = swiper2.params;
      let slidesPerView = swiper2.params.slidesPerView;
      if (slidesPerView === "auto") {
        slidesPerView = swiper2.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper2.params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (centeredSlides) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && centeredSlides && swiper2.params.slidesPerView !== "auto" && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = centeredSlides ? targetSlideIndex < swiper2.activeIndex ? "prev" : "next" : targetSlideIndex - swiper2.activeIndex - 1 < swiper2.params.slidesPerView ? "next" : "prev";
        swiper2.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === "next" ? swiper2.realIndex : void 0
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper2.params.grid.rows;
        newIndex = swiper2.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex)[0].column;
      } else {
        newIndex = swiper2.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper2.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper2;
}
function slideNext(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper2 = this;
  const {
    enabled,
    params,
    animating
  } = swiper2;
  if (!enabled || swiper2.destroyed)
    return swiper2;
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper2.slidesPerViewDynamic("current", true), 1);
  }
  const increment = swiper2.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper2.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding)
      return false;
    swiper2.loopFix({
      direction: "next"
    });
    swiper2._clientLeft = swiper2.wrapperEl.clientLeft;
    if (swiper2.activeIndex === swiper2.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper2.slideTo(swiper2.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper2.isEnd) {
    return swiper2.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper2.slideTo(swiper2.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper2 = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper2;
  if (!enabled || swiper2.destroyed)
    return swiper2;
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  const isVirtual = swiper2.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding)
      return false;
    swiper2.loopFix({
      direction: "prev"
    });
    swiper2._clientLeft = swiper2.wrapperEl.clientLeft;
  }
  const translate2 = rtlTranslate ? swiper2.translate : -swiper2.translate;
  function normalize(val) {
    if (val < 0)
      return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate2);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === "undefined" && params.cssMode) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== "undefined") {
      prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== "undefined") {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0)
      prevIndex = swiper2.activeIndex - 1;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper2.slidesPerViewDynamic("previous", true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper2.isBeginning) {
    const lastIndex = swiper2.params.virtual && swiper2.params.virtual.enabled && swiper2.virtual ? swiper2.virtual.slides.length - 1 : swiper2.slides.length - 1;
    return swiper2.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper2.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper2.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper2.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper2 = this;
  if (swiper2.destroyed)
    return;
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  return swiper2.slideTo(swiper2.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks, internal, threshold) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (threshold === void 0) {
    threshold = 0.5;
  }
  const swiper2 = this;
  if (swiper2.destroyed)
    return;
  if (typeof speed === "undefined") {
    speed = swiper2.params.speed;
  }
  let index = swiper2.activeIndex;
  const skip = Math.min(swiper2.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper2.params.slidesPerGroup);
  const translate2 = swiper2.rtlTranslate ? swiper2.translate : -swiper2.translate;
  if (translate2 >= swiper2.snapGrid[snapIndex]) {
    const currentSnap = swiper2.snapGrid[snapIndex];
    const nextSnap = swiper2.snapGrid[snapIndex + 1];
    if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper2.params.slidesPerGroup;
    }
  } else {
    const prevSnap = swiper2.snapGrid[snapIndex - 1];
    const currentSnap = swiper2.snapGrid[snapIndex];
    if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper2.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper2.slidesGrid.length - 1);
  return swiper2.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper2 = this;
  if (swiper2.destroyed)
    return;
  const {
    params,
    slidesEl
  } = swiper2;
  const slidesPerView = params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper2.clickedIndex;
  let realIndex;
  const slideSelector = swiper2.isElement ? `swiper-slide` : `.${params.slideClass}`;
  if (params.loop) {
    if (swiper2.animating)
      return;
    realIndex = parseInt(swiper2.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
    if (params.centeredSlides) {
      if (slideToIndex < swiper2.loopedSlides - slidesPerView / 2 || slideToIndex > swiper2.slides.length - swiper2.loopedSlides + slidesPerView / 2) {
        swiper2.loopFix();
        slideToIndex = swiper2.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
        nextTick(() => {
          swiper2.slideTo(slideToIndex);
        });
      } else {
        swiper2.slideTo(slideToIndex);
      }
    } else if (slideToIndex > swiper2.slides.length - slidesPerView) {
      swiper2.loopFix();
      slideToIndex = swiper2.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper2.slideTo(slideToIndex);
      });
    } else {
      swiper2.slideTo(slideToIndex);
    }
  } else {
    swiper2.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex) {
  const swiper2 = this;
  const {
    params,
    slidesEl
  } = swiper2;
  if (!params.loop || swiper2.virtual && swiper2.params.virtual.enabled)
    return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute("data-swiper-slide-index", index);
    });
  };
  const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper2.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper2.slides.length % params.grid.rows !== 0;
  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper2.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
      swiper2.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper2.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper2.recalcSlides();
      swiper2.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper2.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper2.recalcSlides();
      swiper2.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else {
    initSlides();
  }
  swiper2.loopFix({
    slideRealIndex,
    direction: params.centeredSlides ? void 0 : "next"
  });
}
function loopFix(_temp) {
  let {
    slideRealIndex,
    slideTo: slideTo2 = true,
    direction,
    setTranslate: setTranslate2,
    activeSlideIndex,
    byController,
    byMousewheel
  } = _temp === void 0 ? {} : _temp;
  const swiper2 = this;
  if (!swiper2.params.loop)
    return;
  swiper2.emit("beforeLoopFix");
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper2;
  const {
    centeredSlides
  } = params;
  swiper2.allowSlidePrev = true;
  swiper2.allowSlideNext = true;
  if (swiper2.virtual && params.virtual.enabled) {
    if (slideTo2) {
      if (!params.centeredSlides && swiper2.snapIndex === 0) {
        swiper2.slideTo(swiper2.virtual.slides.length, 0, false, true);
      } else if (params.centeredSlides && swiper2.snapIndex < params.slidesPerView) {
        swiper2.slideTo(swiper2.virtual.slides.length + swiper2.snapIndex, 0, false, true);
      } else if (swiper2.snapIndex === swiper2.snapGrid.length - 1) {
        swiper2.slideTo(swiper2.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper2.allowSlidePrev = allowSlidePrev;
    swiper2.allowSlideNext = allowSlideNext;
    swiper2.emit("loopFix");
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === "auto") {
    slidesPerView = swiper2.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper2.loopedSlides = loopedSlides;
  const gridEnabled = swiper2.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides) {
    showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
  } else if (gridEnabled && params.grid.fill === "row") {
    showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  let activeIndex = swiper2.activeIndex;
  if (typeof activeSlideIndex === "undefined") {
    activeSlideIndex = swiper2.getSlideIndex(slides.filter((el) => el.classList.contains(params.slideActiveClass))[0]);
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === "next" || !direction;
  const isPrev = direction === "prev" || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
          if (slides[i2].column === colIndexToPrepend)
            prependSlidesIndexes.push(i2);
        }
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide2, slideIndex) => {
          if (slide2.column === index)
            appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper2.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper2.__preventObserver__ = false;
  });
  if (isPrev) {
    prependSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper2.recalcSlides();
  if (params.slidesPerView === "auto") {
    swiper2.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper2.slides.forEach((slide2, slideIndex) => {
      swiper2.grid.updateSlide(slideIndex, slide2, swiper2.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper2.updateSlidesOffset();
  }
  if (slideTo2) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper2.slidesGrid[activeIndex];
        const newSlideTranslate = swiper2.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper2.setTranslate(swiper2.translate - diff);
        } else {
          swiper2.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate2) {
            swiper2.touchEventsData.startTranslate = swiper2.touchEventsData.startTranslate - diff;
            swiper2.touchEventsData.currentTranslate = swiper2.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate2) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper2.slideTo(swiper2.activeIndex + shift, 0, false, true);
          swiper2.touchEventsData.currentTranslate = swiper2.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper2.slidesGrid[activeIndex];
        const newSlideTranslate = swiper2.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper2.setTranslate(swiper2.translate - diff);
        } else {
          swiper2.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate2) {
            swiper2.touchEventsData.startTranslate = swiper2.touchEventsData.startTranslate - diff;
            swiper2.touchEventsData.currentTranslate = swiper2.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper2.slideTo(swiper2.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper2.allowSlidePrev = allowSlidePrev;
  swiper2.allowSlideNext = allowSlideNext;
  if (swiper2.controller && swiper2.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper2.controller.control)) {
      swiper2.controller.control.forEach((c) => {
        if (!c.destroyed && c.params.loop)
          c.loopFix({
            ...loopParams,
            slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
          });
      });
    } else if (swiper2.controller.control instanceof swiper2.constructor && swiper2.controller.control.params.loop) {
      swiper2.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper2.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
      });
    }
  }
  swiper2.emit("loopFix");
}
function loopDestroy() {
  const swiper2 = this;
  const {
    params,
    slidesEl
  } = swiper2;
  if (!params.loop || swiper2.virtual && swiper2.params.virtual.enabled)
    return;
  swiper2.recalcSlides();
  const newSlidesOrder = [];
  swiper2.slides.forEach((slideEl) => {
    const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper2.slides.forEach((slideEl) => {
    slideEl.removeAttribute("data-swiper-slide-index");
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper2.recalcSlides();
  swiper2.slideTo(swiper2.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper2 = this;
  if (!swiper2.params.simulateTouch || swiper2.params.watchOverflow && swiper2.isLocked || swiper2.params.cssMode)
    return;
  const el = swiper2.params.touchEventsTarget === "container" ? swiper2.el : swiper2.wrapperEl;
  if (swiper2.isElement) {
    swiper2.__preventObserver__ = true;
  }
  el.style.cursor = "move";
  el.style.cursor = moving ? "grabbing" : "grab";
  if (swiper2.isElement) {
    requestAnimationFrame(() => {
      swiper2.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper2 = this;
  if (swiper2.params.watchOverflow && swiper2.isLocked || swiper2.params.cssMode) {
    return;
  }
  if (swiper2.isElement) {
    swiper2.__preventObserver__ = true;
  }
  swiper2[swiper2.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
  if (swiper2.isElement) {
    requestAnimationFrame(() => {
      swiper2.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};
function closestElement(selector, base) {
  if (base === void 0) {
    base = this;
  }
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow())
      return null;
    if (el.assignedSlot)
      el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper2, event2, startX) {
  const window2 = getWindow();
  const {
    params
  } = swiper2;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === "prevent") {
      event2.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event2) {
  const swiper2 = this;
  const document2 = getDocument();
  let e = event2;
  if (e.originalEvent)
    e = e.originalEvent;
  const data = swiper2.touchEventsData;
  if (e.type === "pointerdown") {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === "touchstart") {
    preventEdgeSwipe(swiper2, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper2;
  if (!enabled)
    return;
  if (!params.simulateTouch && e.pointerType === "mouse")
    return;
  if (swiper2.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper2.animating && params.cssMode && params.loop) {
    swiper2.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === "wrapper") {
    if (!swiper2.wrapperEl.contains(targetEl))
      return;
  }
  if ("which" in e && e.which === 3)
    return;
  if ("button" in e && e.button > 0)
    return;
  if (data.isTouched && data.isMoved)
    return;
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper2.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler))
      return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;
  if (!preventEdgeSwipe(swiper2, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: void 0,
    startMoving: void 0
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper2.allowClick = true;
  swiper2.updateSize();
  swiper2.swipeDirection = void 0;
  if (params.threshold > 0)
    data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === "SELECT") {
      data.isTouched = false;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl) {
    document2.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper2.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper2.freeMode && swiper2.animating && !params.cssMode) {
    swiper2.freeMode.onTouchStart();
  }
  swiper2.emit("touchStart", e);
}
function onTouchMove(event2) {
  const document2 = getDocument();
  const swiper2 = this;
  const data = swiper2.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper2;
  if (!enabled)
    return;
  if (!params.simulateTouch && event2.pointerType === "mouse")
    return;
  let e = event2;
  if (e.originalEvent)
    e = e.originalEvent;
  if (e.type === "pointermove") {
    if (data.touchId !== null)
      return;
    const id = e.pointerId;
    if (id !== data.pointerId)
      return;
  }
  let targetTouch;
  if (e.type === "touchmove") {
    targetTouch = [...e.changedTouches].filter((t) => t.identifier === data.touchId)[0];
    if (!targetTouch || targetTouch.identifier !== data.touchId)
      return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper2.emit("touchMoveOpposite", e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper2.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper2.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper2.isVertical()) {
      if (pageY < touches.startY && swiper2.translate <= swiper2.maxTranslate() || pageY > touches.startY && swiper2.translate >= swiper2.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (pageX < touches.startX && swiper2.translate <= swiper2.maxTranslate() || pageX > touches.startX && swiper2.translate >= swiper2.minTranslate()) {
      return;
    }
  }
  if (document2.activeElement) {
    if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper2.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper2.emit("touchMove", e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper2.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper2.params.threshold)
    return;
  if (typeof data.isScrolling === "undefined") {
    let touchAngle;
    if (swiper2.isHorizontal() && touches.currentY === touches.startY || swiper2.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper2.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper2.emit("touchMoveOpposite", e);
  }
  if (typeof data.startMoving === "undefined") {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper2.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper2.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper2.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper2.touchesDirection;
  swiper2.swipeDirection = diff > 0 ? "prev" : "next";
  swiper2.touchesDirection = touchesDiff > 0 ? "prev" : "next";
  const isLoop = swiper2.params.loop && !params.cssMode;
  const allowLoopFix = swiper2.touchesDirection === "next" && swiper2.allowSlideNext || swiper2.touchesDirection === "prev" && swiper2.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper2.loopFix({
        direction: swiper2.swipeDirection
      });
    }
    data.startTranslate = swiper2.getTranslate();
    swiper2.setTransition(0);
    if (swiper2.animating) {
      const evt = new window.CustomEvent("transitionend", {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper2.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    if (params.grabCursor && (swiper2.allowSlideNext === true || swiper2.allowSlidePrev === true)) {
      swiper2.setGrabCursor(true);
    }
    swiper2.emit("sliderFirstMove", e);
  }
  let loopFixed;
  (/* @__PURE__ */ new Date()).getTime();
  if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper2.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper2.emit("sliderMove", e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper2.minTranslate() - swiper2.slidesSizesGrid[swiper2.activeIndex + 1] : swiper2.minTranslate())) {
      swiper2.loopFix({
        direction: "prev",
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper2.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper2.minTranslate() - 1 + (-swiper2.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper2.maxTranslate() + swiper2.slidesSizesGrid[swiper2.slidesSizesGrid.length - 1] : swiper2.maxTranslate())) {
      swiper2.loopFix({
        direction: "next",
        setTranslate: true,
        activeSlideIndex: swiper2.slides.length - (params.slidesPerView === "auto" ? swiper2.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper2.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper2.maxTranslate() + 1 - (swiper2.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }
  if (!swiper2.allowSlideNext && swiper2.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper2.allowSlidePrev && swiper2.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper2.allowSlidePrev && !swiper2.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper2.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode)
    return;
  if (params.freeMode && params.freeMode.enabled && swiper2.freeMode || params.watchSlidesProgress) {
    swiper2.updateActiveIndex();
    swiper2.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper2.freeMode) {
    swiper2.freeMode.onTouchMove();
  }
  swiper2.updateProgress(data.currentTranslate);
  swiper2.setTranslate(data.currentTranslate);
}
function onTouchEnd(event2) {
  const swiper2 = this;
  const data = swiper2.touchEventsData;
  let e = event2;
  if (e.originalEvent)
    e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
  if (!isTouchEvent) {
    if (data.touchId !== null)
      return;
    if (e.pointerId !== data.pointerId)
      return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].filter((t) => t.identifier === data.touchId)[0];
    if (!targetTouch || targetTouch.identifier !== data.touchId)
      return;
  }
  if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
    const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper2.browser.isSafari || swiper2.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper2;
  if (!enabled)
    return;
  if (!params.simulateTouch && e.pointerType === "mouse")
    return;
  if (data.allowTouchCallbacks) {
    swiper2.emit("touchEnd", e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper2.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper2.allowSlideNext === true || swiper2.allowSlidePrev === true)) {
    swiper2.setGrabCursor(false);
  }
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;
  if (swiper2.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper2.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper2.emit("tap click", e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper2.emit("doubleTap doubleClick", e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper2.destroyed)
      swiper2.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper2.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper2.translate : -swiper2.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper2.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }
  const swipeToLast = currentPos >= -swiper2.maxTranslate() && !swiper2.params.loop;
  let stopIndex = 0;
  let groupSize = swiper2.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment2] !== "undefined") {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment2] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper2.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper2.virtual ? swiper2.virtual.slides.length - 1 : swiper2.slides.length - 1;
    } else if (swiper2.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    if (!params.longSwipes) {
      swiper2.slideTo(swiper2.activeIndex);
      return;
    }
    if (swiper2.swipeDirection === "next") {
      if (ratio >= params.longSwipesRatio)
        swiper2.slideTo(params.rewind && swiper2.isEnd ? rewindFirstIndex : stopIndex + increment);
      else
        swiper2.slideTo(stopIndex);
    }
    if (swiper2.swipeDirection === "prev") {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper2.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper2.slideTo(rewindLastIndex);
      } else {
        swiper2.slideTo(stopIndex);
      }
    }
  } else {
    if (!params.shortSwipes) {
      swiper2.slideTo(swiper2.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper2.navigation && (e.target === swiper2.navigation.nextEl || e.target === swiper2.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper2.swipeDirection === "next") {
        swiper2.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper2.swipeDirection === "prev") {
        swiper2.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper2.navigation.nextEl) {
      swiper2.slideTo(stopIndex + increment);
    } else {
      swiper2.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper2 = this;
  const {
    params,
    el
  } = swiper2;
  if (el && el.offsetWidth === 0)
    return;
  if (params.breakpoints) {
    swiper2.setBreakpoint();
  }
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper2;
  const isVirtual = swiper2.virtual && swiper2.params.virtual.enabled;
  swiper2.allowSlideNext = true;
  swiper2.allowSlidePrev = true;
  swiper2.updateSize();
  swiper2.updateSlides();
  swiper2.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper2.isEnd && !swiper2.isBeginning && !swiper2.params.centeredSlides && !isVirtualLoop) {
    swiper2.slideTo(swiper2.slides.length - 1, 0, false, true);
  } else {
    if (swiper2.params.loop && !isVirtual) {
      swiper2.slideToLoop(swiper2.realIndex, 0, false, true);
    } else {
      swiper2.slideTo(swiper2.activeIndex, 0, false, true);
    }
  }
  if (swiper2.autoplay && swiper2.autoplay.running && swiper2.autoplay.paused) {
    clearTimeout(swiper2.autoplay.resizeTimeout);
    swiper2.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper2.autoplay && swiper2.autoplay.running && swiper2.autoplay.paused) {
        swiper2.autoplay.resume();
      }
    }, 500);
  }
  swiper2.allowSlidePrev = allowSlidePrev;
  swiper2.allowSlideNext = allowSlideNext;
  if (swiper2.params.watchOverflow && snapGrid !== swiper2.snapGrid) {
    swiper2.checkOverflow();
  }
}
function onClick(e) {
  const swiper2 = this;
  if (!swiper2.enabled)
    return;
  if (!swiper2.allowClick) {
    if (swiper2.params.preventClicks)
      e.preventDefault();
    if (swiper2.params.preventClicksPropagation && swiper2.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper2 = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper2;
  if (!enabled)
    return;
  swiper2.previousTranslate = swiper2.translate;
  if (swiper2.isHorizontal()) {
    swiper2.translate = -wrapperEl.scrollLeft;
  } else {
    swiper2.translate = -wrapperEl.scrollTop;
  }
  if (swiper2.translate === 0)
    swiper2.translate = 0;
  swiper2.updateActiveIndex();
  swiper2.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper2.maxTranslate() - swiper2.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper2.translate - swiper2.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper2.progress) {
    swiper2.updateProgress(rtlTranslate ? -swiper2.translate : swiper2.translate);
  }
  swiper2.emit("setTranslate", swiper2.translate, false);
}
function onLoad(e) {
  const swiper2 = this;
  processLazyPreloader(swiper2, e.target);
  if (swiper2.params.cssMode || swiper2.params.slidesPerView !== "auto" && !swiper2.params.autoHeight) {
    return;
  }
  swiper2.update();
}
function onDocumentTouchStart() {
  const swiper2 = this;
  if (swiper2.documentTouchHandlerProceeded)
    return;
  swiper2.documentTouchHandlerProceeded = true;
  if (swiper2.params.touchReleaseOnEdges) {
    swiper2.el.style.touchAction = "auto";
  }
}
const events = (swiper2, method) => {
  const document2 = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper2;
  const capture = !!params.nested;
  const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
  const swiperMethod = method;
  if (!el || typeof el === "string")
    return;
  document2[domMethod]("touchstart", swiper2.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]("touchstart", swiper2.onTouchStart, {
    passive: false
  });
  el[domMethod]("pointerdown", swiper2.onTouchStart, {
    passive: false
  });
  document2[domMethod]("touchmove", swiper2.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("pointermove", swiper2.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("touchend", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerup", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointercancel", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("touchcancel", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerout", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerleave", swiper2.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("contextmenu", swiper2.onTouchEnd, {
    passive: true
  });
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]("click", swiper2.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]("scroll", swiper2.onScroll);
  }
  if (params.updateOnWindowResize) {
    swiper2[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
  } else {
    swiper2[swiperMethod]("observerUpdate", onResize, true);
  }
  el[domMethod]("load", swiper2.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper2 = this;
  const {
    params
  } = swiper2;
  swiper2.onTouchStart = onTouchStart.bind(swiper2);
  swiper2.onTouchMove = onTouchMove.bind(swiper2);
  swiper2.onTouchEnd = onTouchEnd.bind(swiper2);
  swiper2.onDocumentTouchStart = onDocumentTouchStart.bind(swiper2);
  if (params.cssMode) {
    swiper2.onScroll = onScroll.bind(swiper2);
  }
  swiper2.onClick = onClick.bind(swiper2);
  swiper2.onLoad = onLoad.bind(swiper2);
  events(swiper2, "on");
}
function detachEvents() {
  const swiper2 = this;
  events(swiper2, "off");
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper2, params) => {
  return swiper2.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper2 = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper2;
  const breakpoints2 = params.breakpoints;
  if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0)
    return;
  const breakpoint = swiper2.getBreakpoint(breakpoints2, swiper2.params.breakpointsBase, swiper2.el);
  if (!breakpoint || swiper2.currentBreakpoint === breakpoint)
    return;
  const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
  const breakpointParams = breakpointOnlyParams || swiper2.originalParams;
  const wasMultiRow = isGridEnabled(swiper2, params);
  const isMultiRow = isGridEnabled(swiper2, breakpointParams);
  const wasGrabCursor = swiper2.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper2.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper2.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper2.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper2.setGrabCursor();
  }
  ["navigation", "pagination", "scrollbar"].forEach((prop) => {
    if (typeof breakpointParams[prop] === "undefined")
      return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper2[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper2[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper2.changeDirection();
  }
  extend$1(swiper2.params, breakpointParams);
  const isEnabled = swiper2.params.enabled;
  const hasLoop = swiper2.params.loop;
  Object.assign(swiper2, {
    allowTouchMove: swiper2.params.allowTouchMove,
    allowSlideNext: swiper2.params.allowSlideNext,
    allowSlidePrev: swiper2.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper2.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper2.enable();
  }
  swiper2.currentBreakpoint = breakpoint;
  swiper2.emit("_beforeBreakpoint", breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper2.loopDestroy();
      swiper2.loopCreate(realIndex);
      swiper2.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper2.loopCreate(realIndex);
      swiper2.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper2.loopDestroy();
    }
  }
  swiper2.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints2, base, containerEl) {
  if (base === void 0) {
    base = "window";
  }
  if (!breakpoints2 || base === "container" && !containerEl)
    return void 0;
  let breakpoint = false;
  const window2 = getWindow();
  const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints2).map((point) => {
    if (typeof point === "string" && point.indexOf("@") === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === "window") {
      if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || "max";
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach((item) => {
    if (typeof item === "object") {
      Object.keys(item).forEach((classNames) => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === "string") {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses() {
  const swiper2 = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper2;
  const suffixes = prepareClasses(["initialized", params.direction, {
    "free-mode": swiper2.params.freeMode && params.freeMode.enabled
  }, {
    "autoheight": params.autoHeight
  }, {
    "rtl": rtl
  }, {
    "grid": params.grid && params.grid.rows > 1
  }, {
    "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
  }, {
    "android": device.android
  }, {
    "ios": device.ios
  }, {
    "css-mode": params.cssMode
  }, {
    "centered": params.cssMode && params.centeredSlides
  }, {
    "watch-progress": params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper2.emitContainerClasses();
}
function removeClasses() {
  const swiper2 = this;
  const {
    el,
    classNames
  } = swiper2;
  if (!el || typeof el === "string")
    return;
  el.classList.remove(...classNames);
  swiper2.emitContainerClasses();
}
var classes = {
  addClasses,
  removeClasses
};
function checkOverflow() {
  const swiper2 = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper2;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper2.slides.length - 1;
    const lastSlideRightEdge = swiper2.slidesGrid[lastSlideIndex] + swiper2.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper2.isLocked = swiper2.size > lastSlideRightEdge;
  } else {
    swiper2.isLocked = swiper2.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper2.allowSlideNext = !swiper2.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper2.allowSlidePrev = !swiper2.isLocked;
  }
  if (wasLocked && wasLocked !== swiper2.isLocked) {
    swiper2.isEnd = false;
  }
  if (wasLocked !== swiper2.isLocked) {
    swiper2.emit(swiper2.isLocked ? "lock" : "unlock");
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults = {
  init: true,
  direction: "horizontal",
  oneWayMovement: false,
  swiperElementNodeName: "SWIPER-CONTAINER",
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: "swiper",
  enabled: true,
  focusableElements: "input, select, option, textarea, button, video, label",
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: "slide",
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
  // Breakpoints
  breakpoints: void 0,
  breakpointsBase: "window",
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: "swiper-no-swiping",
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: "swiper-",
  // NEW
  slideClass: "swiper-slide",
  slideBlankClass: "swiper-slide-blank",
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideFullyVisibleClass: "swiper-slide-fully-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj) {
    if (obj === void 0) {
      obj = {};
    }
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== "object" || moduleParams === null) {
      extend$1(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && "enabled" in moduleParams)) {
      extend$1(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName])
      params[moduleParamName] = {
        enabled: false
      };
    extend$1(allModulesParams, obj);
  };
}
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
let Swiper$1 = class Swiper {
  constructor() {
    let el;
    let params;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params)
      params = {};
    params = extend$1({}, params);
    if (el && !params.el)
      params.el = el;
    const document2 = getDocument();
    if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document2.querySelectorAll(params.el).forEach((containerEl) => {
        const newParams = extend$1({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }
    const swiper2 = this;
    swiper2.__swiper__ = true;
    swiper2.support = getSupport();
    swiper2.device = getDevice({
      userAgent: params.userAgent
    });
    swiper2.browser = getBrowser();
    swiper2.eventsListeners = {};
    swiper2.eventsAnyListeners = [];
    swiper2.modules = [...swiper2.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper2.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper2.modules.forEach((mod) => {
      mod({
        params,
        swiper: swiper2,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper2.on.bind(swiper2),
        once: swiper2.once.bind(swiper2),
        off: swiper2.off.bind(swiper2),
        emit: swiper2.emit.bind(swiper2)
      });
    });
    const swiperParams = extend$1({}, defaults, allModulesParams);
    swiper2.params = extend$1({}, swiperParams, extendedDefaults, params);
    swiper2.originalParams = extend$1({}, swiper2.params);
    swiper2.passedParams = extend$1({}, params);
    if (swiper2.params && swiper2.params.on) {
      Object.keys(swiper2.params.on).forEach((eventName) => {
        swiper2.on(eventName, swiper2.params.on[eventName]);
      });
    }
    if (swiper2.params && swiper2.params.onAny) {
      swiper2.onAny(swiper2.params.onAny);
    }
    Object.assign(swiper2, {
      enabled: swiper2.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper2.params.direction === "horizontal";
      },
      isVertical() {
        return swiper2.params.direction === "vertical";
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper2.params.allowSlideNext,
      allowSlidePrev: swiper2.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: void 0,
        isMoved: void 0,
        allowTouchCallbacks: void 0,
        touchStartTime: void 0,
        isScrolling: void 0,
        currentTranslate: void 0,
        startTranslate: void 0,
        allowThresholdMove: void 0,
        // Form elements to match
        focusableElements: swiper2.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: void 0,
        // Velocities
        velocities: [],
        allowMomentumBounce: void 0,
        startMoving: void 0,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper2.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper2.emit("_swiper");
    if (swiper2.params.init) {
      swiper2.init();
    }
    return swiper2;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    return {
      "width": "height",
      "margin-top": "margin-left",
      "margin-bottom ": "margin-right",
      "margin-left": "margin-top",
      "margin-right": "margin-bottom",
      "padding-left": "padding-top",
      "padding-right": "padding-bottom",
      "marginRight": "marginBottom"
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.filter((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index)[0]);
  }
  recalcSlides() {
    const swiper2 = this;
    const {
      slidesEl,
      params
    } = swiper2;
    swiper2.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper2 = this;
    if (swiper2.enabled)
      return;
    swiper2.enabled = true;
    if (swiper2.params.grabCursor) {
      swiper2.setGrabCursor();
    }
    swiper2.emit("enable");
  }
  disable() {
    const swiper2 = this;
    if (!swiper2.enabled)
      return;
    swiper2.enabled = false;
    if (swiper2.params.grabCursor) {
      swiper2.unsetGrabCursor();
    }
    swiper2.emit("disable");
  }
  setProgress(progress, speed) {
    const swiper2 = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper2.minTranslate();
    const max = swiper2.maxTranslate();
    const current = (max - min) * progress + min;
    swiper2.translateTo(current, typeof speed === "undefined" ? 0 : speed);
    swiper2.updateActiveIndex();
    swiper2.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper2 = this;
    if (!swiper2.params._emitClasses || !swiper2.el)
      return;
    const cls = swiper2.el.className.split(" ").filter((className) => {
      return className.indexOf("swiper") === 0 || className.indexOf(swiper2.params.containerModifierClass) === 0;
    });
    swiper2.emit("_containerClasses", cls.join(" "));
  }
  getSlideClasses(slideEl) {
    const swiper2 = this;
    if (swiper2.destroyed)
      return "";
    return slideEl.className.split(" ").filter((className) => {
      return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper2.params.slideClass) === 0;
    }).join(" ");
  }
  emitSlidesClasses() {
    const swiper2 = this;
    if (!swiper2.params._emitClasses || !swiper2.el)
      return;
    const updates = [];
    swiper2.slides.forEach((slideEl) => {
      const classNames = swiper2.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper2.emit("_slideClass", slideEl, classNames);
    });
    swiper2.emit("_slideClasses", updates);
  }
  slidesPerViewDynamic(view, exact) {
    if (view === void 0) {
      view = "current";
    }
    if (exact === void 0) {
      exact = false;
    }
    const swiper2 = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper2;
    let spv = 1;
    if (typeof params.slidesPerView === "number")
      return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize)
            breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize)
            breakLoop = true;
        }
      }
    } else {
      if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper2 = this;
    if (!swiper2 || swiper2.destroyed)
      return;
    const {
      snapGrid,
      params
    } = swiper2;
    if (params.breakpoints) {
      swiper2.setBreakpoint();
    }
    [...swiper2.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper2, imageEl);
      }
    });
    swiper2.updateSize();
    swiper2.updateSlides();
    swiper2.updateProgress();
    swiper2.updateSlidesClasses();
    function setTranslate2() {
      const translateValue = swiper2.rtlTranslate ? swiper2.translate * -1 : swiper2.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper2.maxTranslate()), swiper2.minTranslate());
      swiper2.setTranslate(newTranslate);
      swiper2.updateActiveIndex();
      swiper2.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate2();
      if (params.autoHeight) {
        swiper2.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper2.isEnd && !params.centeredSlides) {
        const slides = swiper2.virtual && params.virtual.enabled ? swiper2.virtual.slides : swiper2.slides;
        translated = swiper2.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper2.slideTo(swiper2.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate2();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper2.snapGrid) {
      swiper2.checkOverflow();
    }
    swiper2.emit("update");
  }
  changeDirection(newDirection, needUpdate) {
    if (needUpdate === void 0) {
      needUpdate = true;
    }
    const swiper2 = this;
    const currentDirection = swiper2.params.direction;
    if (!newDirection) {
      newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
    }
    if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
      return swiper2;
    }
    swiper2.el.classList.remove(`${swiper2.params.containerModifierClass}${currentDirection}`);
    swiper2.el.classList.add(`${swiper2.params.containerModifierClass}${newDirection}`);
    swiper2.emitContainerClasses();
    swiper2.params.direction = newDirection;
    swiper2.slides.forEach((slideEl) => {
      if (newDirection === "vertical") {
        slideEl.style.width = "";
      } else {
        slideEl.style.height = "";
      }
    });
    swiper2.emit("changeDirection");
    if (needUpdate)
      swiper2.update();
    return swiper2;
  }
  changeLanguageDirection(direction) {
    const swiper2 = this;
    if (swiper2.rtl && direction === "rtl" || !swiper2.rtl && direction === "ltr")
      return;
    swiper2.rtl = direction === "rtl";
    swiper2.rtlTranslate = swiper2.params.direction === "horizontal" && swiper2.rtl;
    if (swiper2.rtl) {
      swiper2.el.classList.add(`${swiper2.params.containerModifierClass}rtl`);
      swiper2.el.dir = "rtl";
    } else {
      swiper2.el.classList.remove(`${swiper2.params.containerModifierClass}rtl`);
      swiper2.el.dir = "ltr";
    }
    swiper2.update();
  }
  mount(element) {
    const swiper2 = this;
    if (swiper2.mounted)
      return true;
    let el = element || swiper2.params.el;
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper2;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper2.params.swiperElementNodeName.toUpperCase()) {
      swiper2.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper2.params.wrapperClass || "").trim().split(" ").join(".")}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper2.params.createElements) {
      wrapperEl = createElement("div", swiper2.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper2.params.slideClass}`).forEach((slideEl) => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper2, {
      el,
      wrapperEl,
      slidesEl: swiper2.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper2.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
      rtlTranslate: swiper2.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
      wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
    });
    return true;
  }
  init(el) {
    const swiper2 = this;
    if (swiper2.initialized)
      return swiper2;
    const mounted = swiper2.mount(el);
    if (mounted === false)
      return swiper2;
    swiper2.emit("beforeInit");
    if (swiper2.params.breakpoints) {
      swiper2.setBreakpoint();
    }
    swiper2.addClasses();
    swiper2.updateSize();
    swiper2.updateSlides();
    if (swiper2.params.watchOverflow) {
      swiper2.checkOverflow();
    }
    if (swiper2.params.grabCursor && swiper2.enabled) {
      swiper2.setGrabCursor();
    }
    if (swiper2.params.loop && swiper2.virtual && swiper2.params.virtual.enabled) {
      swiper2.slideTo(swiper2.params.initialSlide + swiper2.virtual.slidesBefore, 0, swiper2.params.runCallbacksOnInit, false, true);
    } else {
      swiper2.slideTo(swiper2.params.initialSlide, 0, swiper2.params.runCallbacksOnInit, false, true);
    }
    if (swiper2.params.loop) {
      swiper2.loopCreate();
    }
    swiper2.attachEvents();
    const lazyElements = [...swiper2.el.querySelectorAll('[loading="lazy"]')];
    if (swiper2.isElement) {
      lazyElements.push(...swiper2.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper2, imageEl);
      } else {
        imageEl.addEventListener("load", (e) => {
          processLazyPreloader(swiper2, e.target);
        });
      }
    });
    preload(swiper2);
    swiper2.initialized = true;
    preload(swiper2);
    swiper2.emit("init");
    swiper2.emit("afterInit");
    return swiper2;
  }
  destroy(deleteInstance, cleanStyles) {
    if (deleteInstance === void 0) {
      deleteInstance = true;
    }
    if (cleanStyles === void 0) {
      cleanStyles = true;
    }
    const swiper2 = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper2;
    if (typeof swiper2.params === "undefined" || swiper2.destroyed) {
      return null;
    }
    swiper2.emit("beforeDestroy");
    swiper2.initialized = false;
    swiper2.detachEvents();
    if (params.loop) {
      swiper2.loopDestroy();
    }
    if (cleanStyles) {
      swiper2.removeClasses();
      if (el && typeof el !== "string") {
        el.removeAttribute("style");
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute("style");
      }
      if (slides && slides.length) {
        slides.forEach((slideEl) => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute("style");
          slideEl.removeAttribute("data-swiper-slide-index");
        });
      }
    }
    swiper2.emit("destroy");
    Object.keys(swiper2.eventsListeners).forEach((eventName) => {
      swiper2.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper2.el && typeof swiper2.el !== "string") {
        swiper2.el.swiper = null;
      }
      deleteProps(swiper2);
    }
    swiper2.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend$1(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__)
      Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === "function" && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach((m) => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
};
Object.keys(prototypes).forEach((prototypeGroup) => {
  Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
    Swiper$1.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper$1.use([Resize, Observer]);
const paramsList = [
  "eventsPrefix",
  "injectStyles",
  "injectStylesUrls",
  "modules",
  "init",
  "_direction",
  "oneWayMovement",
  "swiperElementNodeName",
  "touchEventsTarget",
  "initialSlide",
  "_speed",
  "cssMode",
  "updateOnWindowResize",
  "resizeObserver",
  "nested",
  "focusableElements",
  "_enabled",
  "_width",
  "_height",
  "preventInteractionOnTransition",
  "userAgent",
  "url",
  "_edgeSwipeDetection",
  "_edgeSwipeThreshold",
  "_freeMode",
  "_autoHeight",
  "setWrapperSize",
  "virtualTranslate",
  "_effect",
  "breakpoints",
  "breakpointsBase",
  "_spaceBetween",
  "_slidesPerView",
  "maxBackfaceHiddenSlides",
  "_grid",
  "_slidesPerGroup",
  "_slidesPerGroupSkip",
  "_slidesPerGroupAuto",
  "_centeredSlides",
  "_centeredSlidesBounds",
  "_slidesOffsetBefore",
  "_slidesOffsetAfter",
  "normalizeSlideIndex",
  "_centerInsufficientSlides",
  "_watchOverflow",
  "roundLengths",
  "touchRatio",
  "touchAngle",
  "simulateTouch",
  "_shortSwipes",
  "_longSwipes",
  "longSwipesRatio",
  "longSwipesMs",
  "_followFinger",
  "allowTouchMove",
  "_threshold",
  "touchMoveStopPropagation",
  "touchStartPreventDefault",
  "touchStartForcePreventDefault",
  "touchReleaseOnEdges",
  "uniqueNavElements",
  "_resistance",
  "_resistanceRatio",
  "_watchSlidesProgress",
  "_grabCursor",
  "preventClicks",
  "preventClicksPropagation",
  "_slideToClickedSlide",
  "_loop",
  "loopAdditionalSlides",
  "loopAddBlankSlides",
  "loopPreventsSliding",
  "_rewind",
  "_allowSlidePrev",
  "_allowSlideNext",
  "_swipeHandler",
  "_noSwiping",
  "noSwipingClass",
  "noSwipingSelector",
  "passiveListeners",
  "containerModifierClass",
  "slideClass",
  "slideActiveClass",
  "slideVisibleClass",
  "slideFullyVisibleClass",
  "slideNextClass",
  "slidePrevClass",
  "slideBlankClass",
  "wrapperClass",
  "lazyPreloaderClass",
  "lazyPreloadPrevNext",
  "runCallbacksOnInit",
  "observer",
  "observeParents",
  "observeSlideChildren",
  // modules
  "a11y",
  "_autoplay",
  "_controller",
  "coverflowEffect",
  "cubeEffect",
  "fadeEffect",
  "flipEffect",
  "creativeEffect",
  "cardsEffect",
  "hashNavigation",
  "history",
  "keyboard",
  "mousewheel",
  "_navigation",
  "_pagination",
  "parallax",
  "_scrollbar",
  "_thumbs",
  "virtual",
  "zoom",
  "control"
];
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object" && !o.__swiper__;
}
function extend(target, src) {
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined")
      target[key] = src[key];
    else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
      if (src[key].__swiper__)
        target[key] = src[key];
      else
        extend(target[key], src[key]);
    } else {
      target[key] = src[key];
    }
  });
}
function needsNavigation(params) {
  if (params === void 0) {
    params = {};
  }
  return params.navigation && typeof params.navigation.nextEl === "undefined" && typeof params.navigation.prevEl === "undefined";
}
function needsPagination(params) {
  if (params === void 0) {
    params = {};
  }
  return params.pagination && typeof params.pagination.el === "undefined";
}
function needsScrollbar(params) {
  if (params === void 0) {
    params = {};
  }
  return params.scrollbar && typeof params.scrollbar.el === "undefined";
}
function uniqueClasses(classNames) {
  if (classNames === void 0) {
    classNames = "";
  }
  const classes2 = classNames.split(" ").map((c) => c.trim()).filter((c) => !!c);
  const unique = [];
  classes2.forEach((c) => {
    if (unique.indexOf(c) < 0)
      unique.push(c);
  });
  return unique.join(" ");
}
function wrapperClass(className) {
  if (className === void 0) {
    className = "";
  }
  if (!className)
    return "swiper-wrapper";
  if (!className.includes("swiper-wrapper"))
    return `swiper-wrapper ${className}`;
  return className;
}
function updateSwiper(_ref) {
  let {
    swiper: swiper2,
    slides,
    passedParams,
    changedParams,
    nextEl,
    prevEl,
    scrollbarEl,
    paginationEl
  } = _ref;
  const updateParams = changedParams.filter((key) => key !== "children" && key !== "direction" && key !== "wrapperClass");
  const {
    params: currentParams,
    pagination,
    navigation,
    scrollbar,
    virtual,
    thumbs
  } = swiper2;
  let needThumbsInit;
  let needControllerInit;
  let needPaginationInit;
  let needScrollbarInit;
  let needNavigationInit;
  let loopNeedDestroy;
  let loopNeedEnable;
  let loopNeedReloop;
  if (changedParams.includes("thumbs") && passedParams.thumbs && passedParams.thumbs.swiper && currentParams.thumbs && !currentParams.thumbs.swiper) {
    needThumbsInit = true;
  }
  if (changedParams.includes("controller") && passedParams.controller && passedParams.controller.control && currentParams.controller && !currentParams.controller.control) {
    needControllerInit = true;
  }
  if (changedParams.includes("pagination") && passedParams.pagination && (passedParams.pagination.el || paginationEl) && (currentParams.pagination || currentParams.pagination === false) && pagination && !pagination.el) {
    needPaginationInit = true;
  }
  if (changedParams.includes("scrollbar") && passedParams.scrollbar && (passedParams.scrollbar.el || scrollbarEl) && (currentParams.scrollbar || currentParams.scrollbar === false) && scrollbar && !scrollbar.el) {
    needScrollbarInit = true;
  }
  if (changedParams.includes("navigation") && passedParams.navigation && (passedParams.navigation.prevEl || prevEl) && (passedParams.navigation.nextEl || nextEl) && (currentParams.navigation || currentParams.navigation === false) && navigation && !navigation.prevEl && !navigation.nextEl) {
    needNavigationInit = true;
  }
  const destroyModule = (mod) => {
    if (!swiper2[mod])
      return;
    swiper2[mod].destroy();
    if (mod === "navigation") {
      if (swiper2.isElement) {
        swiper2[mod].prevEl.remove();
        swiper2[mod].nextEl.remove();
      }
      currentParams[mod].prevEl = void 0;
      currentParams[mod].nextEl = void 0;
      swiper2[mod].prevEl = void 0;
      swiper2[mod].nextEl = void 0;
    } else {
      if (swiper2.isElement) {
        swiper2[mod].el.remove();
      }
      currentParams[mod].el = void 0;
      swiper2[mod].el = void 0;
    }
  };
  if (changedParams.includes("loop") && swiper2.isElement) {
    if (currentParams.loop && !passedParams.loop) {
      loopNeedDestroy = true;
    } else if (!currentParams.loop && passedParams.loop) {
      loopNeedEnable = true;
    } else {
      loopNeedReloop = true;
    }
  }
  updateParams.forEach((key) => {
    if (isObject(currentParams[key]) && isObject(passedParams[key])) {
      Object.assign(currentParams[key], passedParams[key]);
      if ((key === "navigation" || key === "pagination" || key === "scrollbar") && "enabled" in passedParams[key] && !passedParams[key].enabled) {
        destroyModule(key);
      }
    } else {
      const newValue = passedParams[key];
      if ((newValue === true || newValue === false) && (key === "navigation" || key === "pagination" || key === "scrollbar")) {
        if (newValue === false) {
          destroyModule(key);
        }
      } else {
        currentParams[key] = passedParams[key];
      }
    }
  });
  if (updateParams.includes("controller") && !needControllerInit && swiper2.controller && swiper2.controller.control && currentParams.controller && currentParams.controller.control) {
    swiper2.controller.control = currentParams.controller.control;
  }
  if (changedParams.includes("children") && slides && virtual && currentParams.virtual.enabled) {
    virtual.slides = slides;
    virtual.update(true);
  } else if (changedParams.includes("virtual") && virtual && currentParams.virtual.enabled) {
    if (slides)
      virtual.slides = slides;
    virtual.update(true);
  }
  if (changedParams.includes("children") && slides && currentParams.loop) {
    loopNeedReloop = true;
  }
  if (needThumbsInit) {
    const initialized = thumbs.init();
    if (initialized)
      thumbs.update(true);
  }
  if (needControllerInit) {
    swiper2.controller.control = currentParams.controller.control;
  }
  if (needPaginationInit) {
    if (swiper2.isElement && (!paginationEl || typeof paginationEl === "string")) {
      paginationEl = document.createElement("div");
      paginationEl.classList.add("swiper-pagination");
      paginationEl.part.add("pagination");
      swiper2.el.appendChild(paginationEl);
    }
    if (paginationEl)
      currentParams.pagination.el = paginationEl;
    pagination.init();
    pagination.render();
    pagination.update();
  }
  if (needScrollbarInit) {
    if (swiper2.isElement && (!scrollbarEl || typeof scrollbarEl === "string")) {
      scrollbarEl = document.createElement("div");
      scrollbarEl.classList.add("swiper-scrollbar");
      scrollbarEl.part.add("scrollbar");
      swiper2.el.appendChild(scrollbarEl);
    }
    if (scrollbarEl)
      currentParams.scrollbar.el = scrollbarEl;
    scrollbar.init();
    scrollbar.updateSize();
    scrollbar.setTranslate();
  }
  if (needNavigationInit) {
    if (swiper2.isElement) {
      if (!nextEl || typeof nextEl === "string") {
        nextEl = document.createElement("div");
        nextEl.classList.add("swiper-button-next");
        nextEl.innerHTML = swiper2.hostEl.constructor.nextButtonSvg;
        nextEl.part.add("button-next");
        swiper2.el.appendChild(nextEl);
      }
      if (!prevEl || typeof prevEl === "string") {
        prevEl = document.createElement("div");
        prevEl.classList.add("swiper-button-prev");
        prevEl.innerHTML = swiper2.hostEl.constructor.prevButtonSvg;
        prevEl.part.add("button-prev");
        swiper2.el.appendChild(prevEl);
      }
    }
    if (nextEl)
      currentParams.navigation.nextEl = nextEl;
    if (prevEl)
      currentParams.navigation.prevEl = prevEl;
    navigation.init();
    navigation.update();
  }
  if (changedParams.includes("allowSlideNext")) {
    swiper2.allowSlideNext = passedParams.allowSlideNext;
  }
  if (changedParams.includes("allowSlidePrev")) {
    swiper2.allowSlidePrev = passedParams.allowSlidePrev;
  }
  if (changedParams.includes("direction")) {
    swiper2.changeDirection(passedParams.direction, false);
  }
  if (loopNeedDestroy || loopNeedReloop) {
    swiper2.loopDestroy();
  }
  if (loopNeedEnable || loopNeedReloop) {
    swiper2.loopCreate();
  }
  swiper2.update();
}
function getParams(obj, splitEvents) {
  if (obj === void 0) {
    obj = {};
  }
  if (splitEvents === void 0) {
    splitEvents = true;
  }
  const params = {
    on: {}
  };
  const events2 = {};
  const passedParams = {};
  extend(params, defaults);
  params._emitClasses = true;
  params.init = false;
  const rest = {};
  const allowedParams = paramsList.map((key) => key.replace(/_/, ""));
  const plainObj = Object.assign({}, obj);
  Object.keys(plainObj).forEach((key) => {
    if (typeof obj[key] === "undefined")
      return;
    if (allowedParams.indexOf(key) >= 0) {
      if (isObject(obj[key])) {
        params[key] = {};
        passedParams[key] = {};
        extend(params[key], obj[key]);
        extend(passedParams[key], obj[key]);
      } else {
        params[key] = obj[key];
        passedParams[key] = obj[key];
      }
    } else if (key.search(/on[A-Z]/) === 0 && typeof obj[key] === "function") {
      if (splitEvents) {
        events2[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
      } else {
        params.on[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
      }
    } else {
      rest[key] = obj[key];
    }
  });
  ["navigation", "pagination", "scrollbar"].forEach((key) => {
    if (params[key] === true)
      params[key] = {};
    if (params[key] === false)
      delete params[key];
  });
  return {
    params,
    passedParams,
    rest,
    events: events2
  };
}
function mountSwiper(_ref, swiperParams) {
  let {
    el,
    nextEl,
    prevEl,
    paginationEl,
    scrollbarEl,
    swiper: swiper2
  } = _ref;
  if (needsNavigation(swiperParams) && nextEl && prevEl) {
    swiper2.params.navigation.nextEl = nextEl;
    swiper2.originalParams.navigation.nextEl = nextEl;
    swiper2.params.navigation.prevEl = prevEl;
    swiper2.originalParams.navigation.prevEl = prevEl;
  }
  if (needsPagination(swiperParams) && paginationEl) {
    swiper2.params.pagination.el = paginationEl;
    swiper2.originalParams.pagination.el = paginationEl;
  }
  if (needsScrollbar(swiperParams) && scrollbarEl) {
    swiper2.params.scrollbar.el = scrollbarEl;
    swiper2.originalParams.scrollbar.el = scrollbarEl;
  }
  swiper2.init(el);
}
function getChangedParams(swiperParams, oldParams, children, oldChildren, getKey) {
  const keys = [];
  if (!oldParams)
    return keys;
  const addKey = (key) => {
    if (keys.indexOf(key) < 0)
      keys.push(key);
  };
  if (children && oldChildren) {
    const oldChildrenKeys = oldChildren.map(getKey);
    const childrenKeys = children.map(getKey);
    if (oldChildrenKeys.join("") !== childrenKeys.join(""))
      addKey("children");
    if (oldChildren.length !== children.length)
      addKey("children");
  }
  const watchParams = paramsList.filter((key) => key[0] === "_").map((key) => key.replace(/_/, ""));
  watchParams.forEach((key) => {
    if (key in swiperParams && key in oldParams) {
      if (isObject(swiperParams[key]) && isObject(oldParams[key])) {
        const newKeys = Object.keys(swiperParams[key]);
        const oldKeys = Object.keys(oldParams[key]);
        if (newKeys.length !== oldKeys.length) {
          addKey(key);
        } else {
          newKeys.forEach((newKey) => {
            if (swiperParams[key][newKey] !== oldParams[key][newKey]) {
              addKey(key);
            }
          });
          oldKeys.forEach((oldKey) => {
            if (swiperParams[key][oldKey] !== oldParams[key][oldKey])
              addKey(key);
          });
        }
      } else if (swiperParams[key] !== oldParams[key]) {
        addKey(key);
      }
    }
  });
  return keys;
}
const updateOnVirtualData = (swiper2) => {
  if (!swiper2 || swiper2.destroyed || !swiper2.params.virtual || swiper2.params.virtual && !swiper2.params.virtual.enabled)
    return;
  swiper2.updateSlides();
  swiper2.updateProgress();
  swiper2.updateSlidesClasses();
  if (swiper2.parallax && swiper2.params.parallax && swiper2.params.parallax.enabled) {
    swiper2.parallax.setTranslate();
  }
};
function getChildren(originalSlots, slidesRef, oldSlidesRef) {
  if (originalSlots === void 0) {
    originalSlots = {};
  }
  const slides = [];
  const slots = {
    "container-start": [],
    "container-end": [],
    "wrapper-start": [],
    "wrapper-end": []
  };
  const getSlidesFromElements = (els, slotName) => {
    if (!Array.isArray(els)) {
      return;
    }
    els.forEach((vnode) => {
      const isFragment = typeof vnode.type === "symbol";
      if (slotName === "default")
        slotName = "container-end";
      if (isFragment && vnode.children) {
        getSlidesFromElements(vnode.children, slotName);
      } else if (vnode.type && (vnode.type.name === "SwiperSlide" || vnode.type.name === "AsyncComponentWrapper") || vnode.componentOptions && vnode.componentOptions.tag === "SwiperSlide") {
        slides.push(vnode);
      } else if (slots[slotName]) {
        slots[slotName].push(vnode);
      }
    });
  };
  Object.keys(originalSlots).forEach((slotName) => {
    if (typeof originalSlots[slotName] !== "function")
      return;
    const els = originalSlots[slotName]();
    getSlidesFromElements(els, slotName);
  });
  oldSlidesRef.value = slidesRef.value;
  slidesRef.value = slides;
  return {
    slides,
    slots
  };
}
function renderVirtual(swiperRef, slides, virtualData) {
  if (!virtualData)
    return null;
  const getSlideIndex = (index) => {
    let slideIndex = index;
    if (index < 0) {
      slideIndex = slides.length + index;
    } else if (slideIndex >= slides.length) {
      slideIndex = slideIndex - slides.length;
    }
    return slideIndex;
  };
  const style2 = swiperRef.value.isHorizontal() ? {
    [swiperRef.value.rtlTranslate ? "right" : "left"]: `${virtualData.offset}px`
  } : {
    top: `${virtualData.offset}px`
  };
  const {
    from,
    to
  } = virtualData;
  const loopFrom = swiperRef.value.params.loop ? -slides.length : 0;
  const loopTo = swiperRef.value.params.loop ? slides.length * 2 : slides.length;
  const slidesToRender = [];
  for (let i = loopFrom; i < loopTo; i += 1) {
    if (i >= from && i <= to && slidesToRender.length < slides.length) {
      slidesToRender.push(slides[getSlideIndex(i)]);
    }
  }
  return slidesToRender.map((slide2) => {
    if (!slide2.props)
      slide2.props = {};
    if (!slide2.props.style)
      slide2.props.style = {};
    slide2.props.swiperRef = swiperRef;
    slide2.props.style = style2;
    if (slide2.type) {
      return h(slide2.type, {
        ...slide2.props
      }, slide2.children);
    } else if (slide2.componentOptions) {
      return h(slide2.componentOptions.Ctor, {
        ...slide2.props
      }, slide2.componentOptions.children);
    }
  });
}
const Swiper2 = {
  name: "Swiper",
  props: {
    tag: {
      type: String,
      default: "div"
    },
    wrapperTag: {
      type: String,
      default: "div"
    },
    modules: {
      type: Array,
      default: void 0
    },
    init: {
      type: Boolean,
      default: void 0
    },
    direction: {
      type: String,
      default: void 0
    },
    oneWayMovement: {
      type: Boolean,
      default: void 0
    },
    swiperElementNodeName: {
      type: String,
      default: "SWIPER-CONTAINER"
    },
    touchEventsTarget: {
      type: String,
      default: void 0
    },
    initialSlide: {
      type: Number,
      default: void 0
    },
    speed: {
      type: Number,
      default: void 0
    },
    cssMode: {
      type: Boolean,
      default: void 0
    },
    updateOnWindowResize: {
      type: Boolean,
      default: void 0
    },
    resizeObserver: {
      type: Boolean,
      default: void 0
    },
    nested: {
      type: Boolean,
      default: void 0
    },
    focusableElements: {
      type: String,
      default: void 0
    },
    width: {
      type: Number,
      default: void 0
    },
    height: {
      type: Number,
      default: void 0
    },
    preventInteractionOnTransition: {
      type: Boolean,
      default: void 0
    },
    userAgent: {
      type: String,
      default: void 0
    },
    url: {
      type: String,
      default: void 0
    },
    edgeSwipeDetection: {
      type: [Boolean, String],
      default: void 0
    },
    edgeSwipeThreshold: {
      type: Number,
      default: void 0
    },
    autoHeight: {
      type: Boolean,
      default: void 0
    },
    setWrapperSize: {
      type: Boolean,
      default: void 0
    },
    virtualTranslate: {
      type: Boolean,
      default: void 0
    },
    effect: {
      type: String,
      default: void 0
    },
    breakpoints: {
      type: Object,
      default: void 0
    },
    spaceBetween: {
      type: [Number, String],
      default: void 0
    },
    slidesPerView: {
      type: [Number, String],
      default: void 0
    },
    maxBackfaceHiddenSlides: {
      type: Number,
      default: void 0
    },
    slidesPerGroup: {
      type: Number,
      default: void 0
    },
    slidesPerGroupSkip: {
      type: Number,
      default: void 0
    },
    slidesPerGroupAuto: {
      type: Boolean,
      default: void 0
    },
    centeredSlides: {
      type: Boolean,
      default: void 0
    },
    centeredSlidesBounds: {
      type: Boolean,
      default: void 0
    },
    slidesOffsetBefore: {
      type: Number,
      default: void 0
    },
    slidesOffsetAfter: {
      type: Number,
      default: void 0
    },
    normalizeSlideIndex: {
      type: Boolean,
      default: void 0
    },
    centerInsufficientSlides: {
      type: Boolean,
      default: void 0
    },
    watchOverflow: {
      type: Boolean,
      default: void 0
    },
    roundLengths: {
      type: Boolean,
      default: void 0
    },
    touchRatio: {
      type: Number,
      default: void 0
    },
    touchAngle: {
      type: Number,
      default: void 0
    },
    simulateTouch: {
      type: Boolean,
      default: void 0
    },
    shortSwipes: {
      type: Boolean,
      default: void 0
    },
    longSwipes: {
      type: Boolean,
      default: void 0
    },
    longSwipesRatio: {
      type: Number,
      default: void 0
    },
    longSwipesMs: {
      type: Number,
      default: void 0
    },
    followFinger: {
      type: Boolean,
      default: void 0
    },
    allowTouchMove: {
      type: Boolean,
      default: void 0
    },
    threshold: {
      type: Number,
      default: void 0
    },
    touchMoveStopPropagation: {
      type: Boolean,
      default: void 0
    },
    touchStartPreventDefault: {
      type: Boolean,
      default: void 0
    },
    touchStartForcePreventDefault: {
      type: Boolean,
      default: void 0
    },
    touchReleaseOnEdges: {
      type: Boolean,
      default: void 0
    },
    uniqueNavElements: {
      type: Boolean,
      default: void 0
    },
    resistance: {
      type: Boolean,
      default: void 0
    },
    resistanceRatio: {
      type: Number,
      default: void 0
    },
    watchSlidesProgress: {
      type: Boolean,
      default: void 0
    },
    grabCursor: {
      type: Boolean,
      default: void 0
    },
    preventClicks: {
      type: Boolean,
      default: void 0
    },
    preventClicksPropagation: {
      type: Boolean,
      default: void 0
    },
    slideToClickedSlide: {
      type: Boolean,
      default: void 0
    },
    loop: {
      type: Boolean,
      default: void 0
    },
    loopedSlides: {
      type: Number,
      default: void 0
    },
    loopPreventsSliding: {
      type: Boolean,
      default: void 0
    },
    rewind: {
      type: Boolean,
      default: void 0
    },
    allowSlidePrev: {
      type: Boolean,
      default: void 0
    },
    allowSlideNext: {
      type: Boolean,
      default: void 0
    },
    swipeHandler: {
      type: Boolean,
      default: void 0
    },
    noSwiping: {
      type: Boolean,
      default: void 0
    },
    noSwipingClass: {
      type: String,
      default: void 0
    },
    noSwipingSelector: {
      type: String,
      default: void 0
    },
    passiveListeners: {
      type: Boolean,
      default: void 0
    },
    containerModifierClass: {
      type: String,
      default: void 0
    },
    slideClass: {
      type: String,
      default: void 0
    },
    slideActiveClass: {
      type: String,
      default: void 0
    },
    slideVisibleClass: {
      type: String,
      default: void 0
    },
    slideFullyVisibleClass: {
      type: String,
      default: void 0
    },
    slideBlankClass: {
      type: String,
      default: void 0
    },
    slideNextClass: {
      type: String,
      default: void 0
    },
    slidePrevClass: {
      type: String,
      default: void 0
    },
    wrapperClass: {
      type: String,
      default: void 0
    },
    lazyPreloaderClass: {
      type: String,
      default: void 0
    },
    lazyPreloadPrevNext: {
      type: Number,
      default: void 0
    },
    runCallbacksOnInit: {
      type: Boolean,
      default: void 0
    },
    observer: {
      type: Boolean,
      default: void 0
    },
    observeParents: {
      type: Boolean,
      default: void 0
    },
    observeSlideChildren: {
      type: Boolean,
      default: void 0
    },
    a11y: {
      type: [Boolean, Object],
      default: void 0
    },
    autoplay: {
      type: [Boolean, Object],
      default: void 0
    },
    controller: {
      type: Object,
      default: void 0
    },
    coverflowEffect: {
      type: Object,
      default: void 0
    },
    cubeEffect: {
      type: Object,
      default: void 0
    },
    fadeEffect: {
      type: Object,
      default: void 0
    },
    flipEffect: {
      type: Object,
      default: void 0
    },
    creativeEffect: {
      type: Object,
      default: void 0
    },
    cardsEffect: {
      type: Object,
      default: void 0
    },
    hashNavigation: {
      type: [Boolean, Object],
      default: void 0
    },
    history: {
      type: [Boolean, Object],
      default: void 0
    },
    keyboard: {
      type: [Boolean, Object],
      default: void 0
    },
    mousewheel: {
      type: [Boolean, Object],
      default: void 0
    },
    navigation: {
      type: [Boolean, Object],
      default: void 0
    },
    pagination: {
      type: [Boolean, Object],
      default: void 0
    },
    parallax: {
      type: [Boolean, Object],
      default: void 0
    },
    scrollbar: {
      type: [Boolean, Object],
      default: void 0
    },
    thumbs: {
      type: Object,
      default: void 0
    },
    virtual: {
      type: [Boolean, Object],
      default: void 0
    },
    zoom: {
      type: [Boolean, Object],
      default: void 0
    },
    grid: {
      type: [Object],
      default: void 0
    },
    freeMode: {
      type: [Boolean, Object],
      default: void 0
    },
    enabled: {
      type: Boolean,
      default: void 0
    }
  },
  emits: ["_beforeBreakpoint", "_containerClasses", "_slideClass", "_slideClasses", "_swiper", "_freeModeNoMomentumRelease", "activeIndexChange", "afterInit", "autoplay", "autoplayStart", "autoplayStop", "autoplayPause", "autoplayResume", "autoplayTimeLeft", "beforeDestroy", "beforeInit", "beforeLoopFix", "beforeResize", "beforeSlideChangeStart", "beforeTransitionStart", "breakpoint", "breakpointsBase", "changeDirection", "click", "disable", "doubleTap", "doubleClick", "destroy", "enable", "fromEdge", "hashChange", "hashSet", "init", "keyPress", "lock", "loopFix", "momentumBounce", "navigationHide", "navigationShow", "navigationPrev", "navigationNext", "observerUpdate", "orientationchange", "paginationHide", "paginationRender", "paginationShow", "paginationUpdate", "progress", "reachBeginning", "reachEnd", "realIndexChange", "resize", "scroll", "scrollbarDragEnd", "scrollbarDragMove", "scrollbarDragStart", "setTransition", "setTranslate", "slidesUpdated", "slideChange", "slideChangeTransitionEnd", "slideChangeTransitionStart", "slideNextTransitionEnd", "slideNextTransitionStart", "slidePrevTransitionEnd", "slidePrevTransitionStart", "slideResetTransitionStart", "slideResetTransitionEnd", "sliderMove", "sliderFirstMove", "slidesLengthChange", "slidesGridLengthChange", "snapGridLengthChange", "snapIndexChange", "swiper", "tap", "toEdge", "touchEnd", "touchMove", "touchMoveOpposite", "touchStart", "transitionEnd", "transitionStart", "unlock", "update", "virtualUpdate", "zoomChange"],
  setup(props, _ref) {
    let {
      slots: originalSlots,
      emit
    } = _ref;
    const {
      tag: Tag,
      wrapperTag: WrapperTag
    } = props;
    const containerClasses = ref("swiper");
    const virtualData = ref(null);
    const breakpointChanged = ref(false);
    const initializedRef = ref(false);
    const swiperElRef = ref(null);
    const swiperRef = ref(null);
    const oldPassedParamsRef = ref(null);
    const slidesRef = {
      value: []
    };
    const oldSlidesRef = {
      value: []
    };
    const nextElRef = ref(null);
    const prevElRef = ref(null);
    const paginationElRef = ref(null);
    const scrollbarElRef = ref(null);
    const {
      params: swiperParams,
      passedParams
    } = getParams(props, false);
    getChildren(originalSlots, slidesRef, oldSlidesRef);
    oldPassedParamsRef.value = passedParams;
    oldSlidesRef.value = slidesRef.value;
    const onBeforeBreakpoint = () => {
      getChildren(originalSlots, slidesRef, oldSlidesRef);
      breakpointChanged.value = true;
    };
    swiperParams.onAny = function(event2) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      emit(event2, ...args);
    };
    Object.assign(swiperParams.on, {
      _beforeBreakpoint: onBeforeBreakpoint,
      _containerClasses(swiper2, classes2) {
        containerClasses.value = classes2;
      }
    });
    const passParams = {
      ...swiperParams
    };
    delete passParams.wrapperClass;
    swiperRef.value = new Swiper$1(passParams);
    if (swiperRef.value.virtual && swiperRef.value.params.virtual.enabled) {
      swiperRef.value.virtual.slides = slidesRef.value;
      const extendWith = {
        cache: false,
        slides: slidesRef.value,
        renderExternal: (data) => {
          virtualData.value = data;
        },
        renderExternalUpdate: false
      };
      extend(swiperRef.value.params.virtual, extendWith);
      extend(swiperRef.value.originalParams.virtual, extendWith);
    }
    onUpdated(() => {
      if (!initializedRef.value && swiperRef.value) {
        swiperRef.value.emitSlidesClasses();
        initializedRef.value = true;
      }
      const {
        passedParams: newPassedParams
      } = getParams(props, false);
      const changedParams = getChangedParams(newPassedParams, oldPassedParamsRef.value, slidesRef.value, oldSlidesRef.value, (c) => c.props && c.props.key);
      oldPassedParamsRef.value = newPassedParams;
      if ((changedParams.length || breakpointChanged.value) && swiperRef.value && !swiperRef.value.destroyed) {
        updateSwiper({
          swiper: swiperRef.value,
          slides: slidesRef.value,
          passedParams: newPassedParams,
          changedParams,
          nextEl: nextElRef.value,
          prevEl: prevElRef.value,
          scrollbarEl: scrollbarElRef.value,
          paginationEl: paginationElRef.value
        });
      }
      breakpointChanged.value = false;
    });
    provide("swiper", swiperRef);
    watch(virtualData, () => {
      nextTick$1(() => {
        updateOnVirtualData(swiperRef.value);
      });
    });
    onMounted(() => {
      if (!swiperElRef.value)
        return;
      mountSwiper({
        el: swiperElRef.value,
        nextEl: nextElRef.value,
        prevEl: prevElRef.value,
        paginationEl: paginationElRef.value,
        scrollbarEl: scrollbarElRef.value,
        swiper: swiperRef.value
      }, swiperParams);
      emit("swiper", swiperRef.value);
    });
    onBeforeUnmount(() => {
      if (swiperRef.value && !swiperRef.value.destroyed) {
        swiperRef.value.destroy(true, false);
      }
    });
    function renderSlides(slides) {
      if (swiperParams.virtual) {
        return renderVirtual(swiperRef, slides, virtualData.value);
      }
      slides.forEach((slide2, index) => {
        if (!slide2.props)
          slide2.props = {};
        slide2.props.swiperRef = swiperRef;
        slide2.props.swiperSlideIndex = index;
      });
      return slides;
    }
    return () => {
      const {
        slides,
        slots
      } = getChildren(originalSlots, slidesRef, oldSlidesRef);
      return h(Tag, {
        ref: swiperElRef,
        class: uniqueClasses(containerClasses.value)
      }, [slots["container-start"], h(WrapperTag, {
        class: wrapperClass(swiperParams.wrapperClass)
      }, [slots["wrapper-start"], renderSlides(slides), slots["wrapper-end"]]), needsNavigation(props) && [h("div", {
        ref: prevElRef,
        class: "swiper-button-prev"
      }), h("div", {
        ref: nextElRef,
        class: "swiper-button-next"
      })], needsScrollbar(props) && h("div", {
        ref: scrollbarElRef,
        class: "swiper-scrollbar"
      }), needsPagination(props) && h("div", {
        ref: paginationElRef,
        class: "swiper-pagination"
      }), slots["container-end"]]);
    };
  }
};
const SwiperSlide = {
  name: "SwiperSlide",
  props: {
    tag: {
      type: String,
      default: "div"
    },
    swiperRef: {
      type: Object,
      required: false
    },
    swiperSlideIndex: {
      type: Number,
      default: void 0,
      required: false
    },
    zoom: {
      type: Boolean,
      default: void 0,
      required: false
    },
    lazy: {
      type: Boolean,
      default: false,
      required: false
    },
    virtualIndex: {
      type: [String, Number],
      default: void 0
    }
  },
  setup(props, _ref) {
    let {
      slots
    } = _ref;
    let eventAttached = false;
    const {
      swiperRef
    } = props;
    const slideElRef = ref(null);
    const slideClasses = ref("swiper-slide");
    const lazyLoaded = ref(false);
    function updateClasses(swiper2, el, classNames) {
      if (el === slideElRef.value) {
        slideClasses.value = classNames;
      }
    }
    onMounted(() => {
      if (!swiperRef || !swiperRef.value)
        return;
      swiperRef.value.on("_slideClass", updateClasses);
      eventAttached = true;
    });
    onBeforeUpdate(() => {
      if (eventAttached || !swiperRef || !swiperRef.value)
        return;
      swiperRef.value.on("_slideClass", updateClasses);
      eventAttached = true;
    });
    onUpdated(() => {
      if (!slideElRef.value || !swiperRef || !swiperRef.value)
        return;
      if (typeof props.swiperSlideIndex !== "undefined") {
        slideElRef.value.swiperSlideIndex = props.swiperSlideIndex;
      }
      if (swiperRef.value.destroyed) {
        if (slideClasses.value !== "swiper-slide") {
          slideClasses.value = "swiper-slide";
        }
      }
    });
    onBeforeUnmount(() => {
      if (!swiperRef || !swiperRef.value)
        return;
      swiperRef.value.off("_slideClass", updateClasses);
    });
    const slideData = computed(() => ({
      isActive: slideClasses.value.indexOf("swiper-slide-active") >= 0,
      isVisible: slideClasses.value.indexOf("swiper-slide-visible") >= 0,
      isPrev: slideClasses.value.indexOf("swiper-slide-prev") >= 0,
      isNext: slideClasses.value.indexOf("swiper-slide-next") >= 0
    }));
    provide("swiperSlide", slideData);
    const onLoad2 = () => {
      lazyLoaded.value = true;
    };
    return () => {
      return h(props.tag, {
        class: uniqueClasses(`${slideClasses.value}`),
        ref: slideElRef,
        "data-swiper-slide-index": typeof props.virtualIndex === "undefined" && swiperRef && swiperRef.value && swiperRef.value.params.loop ? props.swiperSlideIndex : props.virtualIndex,
        onLoadCapture: onLoad2
      }, props.zoom ? h("div", {
        class: "swiper-zoom-container",
        "data-swiper-zoom": typeof props.zoom === "number" ? props.zoom : void 0
      }, [slots.default && slots.default(slideData.value), props.lazy && !lazyLoaded.value && h("div", {
        class: "swiper-lazy-preloader"
      })]) : [slots.default && slots.default(slideData.value), props.lazy && !lazyLoaded.value && h("div", {
        class: "swiper-lazy-preloader"
      })]);
    };
  }
};
function Mousewheel(_ref) {
  let {
    swiper: swiper2,
    extendParams,
    on,
    emit
  } = _ref;
  const window2 = getWindow();
  extendParams({
    mousewheel: {
      enabled: false,
      releaseOnEdges: false,
      invert: false,
      forceToAxis: false,
      sensitivity: 1,
      eventsTarget: "container",
      thresholdDelta: null,
      thresholdTime: null,
      noMousewheelClass: "swiper-no-mousewheel"
    }
  });
  swiper2.mousewheel = {
    enabled: false
  };
  let timeout;
  let lastScrollTime = now();
  let lastEventBeforeSnap;
  const recentWheelEvents = [];
  function normalize(e) {
    const PIXEL_STEP = 10;
    const LINE_HEIGHT = 40;
    const PAGE_HEIGHT = 800;
    let sX = 0;
    let sY = 0;
    let pX = 0;
    let pY = 0;
    if ("detail" in e) {
      sY = e.detail;
    }
    if ("wheelDelta" in e) {
      sY = -e.wheelDelta / 120;
    }
    if ("wheelDeltaY" in e) {
      sY = -e.wheelDeltaY / 120;
    }
    if ("wheelDeltaX" in e) {
      sX = -e.wheelDeltaX / 120;
    }
    if ("axis" in e && e.axis === e.HORIZONTAL_AXIS) {
      sX = sY;
      sY = 0;
    }
    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;
    if ("deltaY" in e) {
      pY = e.deltaY;
    }
    if ("deltaX" in e) {
      pX = e.deltaX;
    }
    if (e.shiftKey && !pX) {
      pX = pY;
      pY = 0;
    }
    if ((pX || pY) && e.deltaMode) {
      if (e.deltaMode === 1) {
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else {
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }
    if (pX && !sX) {
      sX = pX < 1 ? -1 : 1;
    }
    if (pY && !sY) {
      sY = pY < 1 ? -1 : 1;
    }
    return {
      spinX: sX,
      spinY: sY,
      pixelX: pX,
      pixelY: pY
    };
  }
  function handleMouseEnter() {
    if (!swiper2.enabled)
      return;
    swiper2.mouseEntered = true;
  }
  function handleMouseLeave() {
    if (!swiper2.enabled)
      return;
    swiper2.mouseEntered = false;
  }
  function animateSlider(newEvent) {
    if (swiper2.params.mousewheel.thresholdDelta && newEvent.delta < swiper2.params.mousewheel.thresholdDelta) {
      return false;
    }
    if (swiper2.params.mousewheel.thresholdTime && now() - lastScrollTime < swiper2.params.mousewheel.thresholdTime) {
      return false;
    }
    if (newEvent.delta >= 6 && now() - lastScrollTime < 60) {
      return true;
    }
    if (newEvent.direction < 0) {
      if ((!swiper2.isEnd || swiper2.params.loop) && !swiper2.animating) {
        swiper2.slideNext();
        emit("scroll", newEvent.raw);
      }
    } else if ((!swiper2.isBeginning || swiper2.params.loop) && !swiper2.animating) {
      swiper2.slidePrev();
      emit("scroll", newEvent.raw);
    }
    lastScrollTime = new window2.Date().getTime();
    return false;
  }
  function releaseScroll(newEvent) {
    const params = swiper2.params.mousewheel;
    if (newEvent.direction < 0) {
      if (swiper2.isEnd && !swiper2.params.loop && params.releaseOnEdges) {
        return true;
      }
    } else if (swiper2.isBeginning && !swiper2.params.loop && params.releaseOnEdges) {
      return true;
    }
    return false;
  }
  function handle(event2) {
    let e = event2;
    let disableParentSwiper = true;
    if (!swiper2.enabled)
      return;
    if (event2.target.closest(`.${swiper2.params.mousewheel.noMousewheelClass}`))
      return;
    const params = swiper2.params.mousewheel;
    if (swiper2.params.cssMode) {
      e.preventDefault();
    }
    let targetEl = swiper2.el;
    if (swiper2.params.mousewheel.eventsTarget !== "container") {
      targetEl = document.querySelector(swiper2.params.mousewheel.eventsTarget);
    }
    const targetElContainsTarget = targetEl && targetEl.contains(e.target);
    if (!swiper2.mouseEntered && !targetElContainsTarget && !params.releaseOnEdges)
      return true;
    if (e.originalEvent)
      e = e.originalEvent;
    let delta = 0;
    const rtlFactor = swiper2.rtlTranslate ? -1 : 1;
    const data = normalize(e);
    if (params.forceToAxis) {
      if (swiper2.isHorizontal()) {
        if (Math.abs(data.pixelX) > Math.abs(data.pixelY))
          delta = -data.pixelX * rtlFactor;
        else
          return true;
      } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX))
        delta = -data.pixelY;
      else
        return true;
    } else {
      delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
    }
    if (delta === 0)
      return true;
    if (params.invert)
      delta = -delta;
    let positions = swiper2.getTranslate() + delta * params.sensitivity;
    if (positions >= swiper2.minTranslate())
      positions = swiper2.minTranslate();
    if (positions <= swiper2.maxTranslate())
      positions = swiper2.maxTranslate();
    disableParentSwiper = swiper2.params.loop ? true : !(positions === swiper2.minTranslate() || positions === swiper2.maxTranslate());
    if (disableParentSwiper && swiper2.params.nested)
      e.stopPropagation();
    if (!swiper2.params.freeMode || !swiper2.params.freeMode.enabled) {
      const newEvent = {
        time: now(),
        delta: Math.abs(delta),
        direction: Math.sign(delta),
        raw: event2
      };
      if (recentWheelEvents.length >= 2) {
        recentWheelEvents.shift();
      }
      const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : void 0;
      recentWheelEvents.push(newEvent);
      if (prevEvent) {
        if (newEvent.direction !== prevEvent.direction || newEvent.delta > prevEvent.delta || newEvent.time > prevEvent.time + 150) {
          animateSlider(newEvent);
        }
      } else {
        animateSlider(newEvent);
      }
      if (releaseScroll(newEvent)) {
        return true;
      }
    } else {
      const newEvent = {
        time: now(),
        delta: Math.abs(delta),
        direction: Math.sign(delta)
      };
      const ignoreWheelEvents = lastEventBeforeSnap && newEvent.time < lastEventBeforeSnap.time + 500 && newEvent.delta <= lastEventBeforeSnap.delta && newEvent.direction === lastEventBeforeSnap.direction;
      if (!ignoreWheelEvents) {
        lastEventBeforeSnap = void 0;
        let position = swiper2.getTranslate() + delta * params.sensitivity;
        const wasBeginning = swiper2.isBeginning;
        const wasEnd = swiper2.isEnd;
        if (position >= swiper2.minTranslate())
          position = swiper2.minTranslate();
        if (position <= swiper2.maxTranslate())
          position = swiper2.maxTranslate();
        swiper2.setTransition(0);
        swiper2.setTranslate(position);
        swiper2.updateProgress();
        swiper2.updateActiveIndex();
        swiper2.updateSlidesClasses();
        if (!wasBeginning && swiper2.isBeginning || !wasEnd && swiper2.isEnd) {
          swiper2.updateSlidesClasses();
        }
        if (swiper2.params.loop) {
          swiper2.loopFix({
            direction: newEvent.direction < 0 ? "next" : "prev",
            byMousewheel: true
          });
        }
        if (swiper2.params.freeMode.sticky) {
          clearTimeout(timeout);
          timeout = void 0;
          if (recentWheelEvents.length >= 15) {
            recentWheelEvents.shift();
          }
          const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : void 0;
          const firstEvent = recentWheelEvents[0];
          recentWheelEvents.push(newEvent);
          if (prevEvent && (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) {
            recentWheelEvents.splice(0);
          } else if (recentWheelEvents.length >= 15 && newEvent.time - firstEvent.time < 500 && firstEvent.delta - newEvent.delta >= 1 && newEvent.delta <= 6) {
            const snapToThreshold = delta > 0 ? 0.8 : 0.2;
            lastEventBeforeSnap = newEvent;
            recentWheelEvents.splice(0);
            timeout = nextTick(() => {
              swiper2.slideToClosest(swiper2.params.speed, true, void 0, snapToThreshold);
            }, 0);
          }
          if (!timeout) {
            timeout = nextTick(() => {
              const snapToThreshold = 0.5;
              lastEventBeforeSnap = newEvent;
              recentWheelEvents.splice(0);
              swiper2.slideToClosest(swiper2.params.speed, true, void 0, snapToThreshold);
            }, 500);
          }
        }
        if (!ignoreWheelEvents)
          emit("scroll", e);
        if (swiper2.params.autoplay && swiper2.params.autoplayDisableOnInteraction)
          swiper2.autoplay.stop();
        if (params.releaseOnEdges && (position === swiper2.minTranslate() || position === swiper2.maxTranslate())) {
          return true;
        }
      }
    }
    if (e.preventDefault)
      e.preventDefault();
    else
      e.returnValue = false;
    return false;
  }
  function events2(method) {
    let targetEl = swiper2.el;
    if (swiper2.params.mousewheel.eventsTarget !== "container") {
      targetEl = document.querySelector(swiper2.params.mousewheel.eventsTarget);
    }
    targetEl[method]("mouseenter", handleMouseEnter);
    targetEl[method]("mouseleave", handleMouseLeave);
    targetEl[method]("wheel", handle);
  }
  function enable() {
    if (swiper2.params.cssMode) {
      swiper2.wrapperEl.removeEventListener("wheel", handle);
      return true;
    }
    if (swiper2.mousewheel.enabled)
      return false;
    events2("addEventListener");
    swiper2.mousewheel.enabled = true;
    return true;
  }
  function disable() {
    if (swiper2.params.cssMode) {
      swiper2.wrapperEl.addEventListener(event, handle);
      return true;
    }
    if (!swiper2.mousewheel.enabled)
      return false;
    events2("removeEventListener");
    swiper2.mousewheel.enabled = false;
    return true;
  }
  on("init", () => {
    if (!swiper2.params.mousewheel.enabled && swiper2.params.cssMode) {
      disable();
    }
    if (swiper2.params.mousewheel.enabled)
      enable();
  });
  on("destroy", () => {
    if (swiper2.params.cssMode) {
      enable();
    }
    if (swiper2.mousewheel.enabled)
      disable();
  });
  Object.assign(swiper2.mousewheel, {
    enable,
    disable
  });
}
function createElementIfNotDefined(swiper2, originalParams, params, checkProps) {
  if (swiper2.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper2.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper2.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function Navigation(_ref) {
  let {
    swiper: swiper2,
    extendParams,
    on,
    emit
  } = _ref;
  extendParams({
    navigation: {
      nextEl: null,
      prevEl: null,
      hideOnClick: false,
      disabledClass: "swiper-button-disabled",
      hiddenClass: "swiper-button-hidden",
      lockClass: "swiper-button-lock",
      navigationDisabledClass: "swiper-navigation-disabled"
    }
  });
  swiper2.navigation = {
    nextEl: null,
    prevEl: null
  };
  function getEl(el) {
    let res;
    if (el && typeof el === "string" && swiper2.isElement) {
      res = swiper2.el.querySelector(el);
      if (res)
        return res;
    }
    if (el) {
      if (typeof el === "string")
        res = [...document.querySelectorAll(el)];
      if (swiper2.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper2.el.querySelectorAll(el).length === 1) {
        res = swiper2.el.querySelector(el);
      } else if (res && res.length === 1) {
        res = res[0];
      }
    }
    if (el && !res)
      return el;
    return res;
  }
  function toggleEl(el, disabled) {
    const params = swiper2.params.navigation;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      if (subEl) {
        subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
        if (subEl.tagName === "BUTTON")
          subEl.disabled = disabled;
        if (swiper2.params.watchOverflow && swiper2.enabled) {
          subEl.classList[swiper2.isLocked ? "add" : "remove"](params.lockClass);
        }
      }
    });
  }
  function update2() {
    const {
      nextEl,
      prevEl
    } = swiper2.navigation;
    if (swiper2.params.loop) {
      toggleEl(prevEl, false);
      toggleEl(nextEl, false);
      return;
    }
    toggleEl(prevEl, swiper2.isBeginning && !swiper2.params.rewind);
    toggleEl(nextEl, swiper2.isEnd && !swiper2.params.rewind);
  }
  function onPrevClick(e) {
    e.preventDefault();
    if (swiper2.isBeginning && !swiper2.params.loop && !swiper2.params.rewind)
      return;
    swiper2.slidePrev();
    emit("navigationPrev");
  }
  function onNextClick(e) {
    e.preventDefault();
    if (swiper2.isEnd && !swiper2.params.loop && !swiper2.params.rewind)
      return;
    swiper2.slideNext();
    emit("navigationNext");
  }
  function init() {
    const params = swiper2.params.navigation;
    swiper2.params.navigation = createElementIfNotDefined(swiper2, swiper2.originalParams.navigation, swiper2.params.navigation, {
      nextEl: "swiper-button-next",
      prevEl: "swiper-button-prev"
    });
    if (!(params.nextEl || params.prevEl))
      return;
    let nextEl = getEl(params.nextEl);
    let prevEl = getEl(params.prevEl);
    Object.assign(swiper2.navigation, {
      nextEl,
      prevEl
    });
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const initButton = (el, dir) => {
      if (el) {
        el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      }
      if (!swiper2.enabled && el) {
        el.classList.add(...params.lockClass.split(" "));
      }
    };
    nextEl.forEach((el) => initButton(el, "next"));
    prevEl.forEach((el) => initButton(el, "prev"));
  }
  function destroy() {
    let {
      nextEl,
      prevEl
    } = swiper2.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const destroyButton = (el, dir) => {
      el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
      el.classList.remove(...swiper2.params.navigation.disabledClass.split(" "));
    };
    nextEl.forEach((el) => destroyButton(el, "next"));
    prevEl.forEach((el) => destroyButton(el, "prev"));
  }
  on("init", () => {
    if (swiper2.params.navigation.enabled === false) {
      disable();
    } else {
      init();
      update2();
    }
  });
  on("toEdge fromEdge lock unlock", () => {
    update2();
  });
  on("destroy", () => {
    destroy();
  });
  on("enable disable", () => {
    let {
      nextEl,
      prevEl
    } = swiper2.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    if (swiper2.enabled) {
      update2();
      return;
    }
    [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper2.params.navigation.lockClass));
  });
  on("click", (_s, e) => {
    let {
      nextEl,
      prevEl
    } = swiper2.navigation;
    nextEl = makeElementsArray(nextEl);
    prevEl = makeElementsArray(prevEl);
    const targetEl = e.target;
    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
    if (swiper2.isElement && !targetIsButton) {
      const path = e.path || e.composedPath && e.composedPath();
      if (path) {
        targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
      }
    }
    if (swiper2.params.navigation.hideOnClick && !targetIsButton) {
      if (swiper2.pagination && swiper2.params.pagination && swiper2.params.pagination.clickable && (swiper2.pagination.el === targetEl || swiper2.pagination.el.contains(targetEl)))
        return;
      let isHidden;
      if (nextEl.length) {
        isHidden = nextEl[0].classList.contains(swiper2.params.navigation.hiddenClass);
      } else if (prevEl.length) {
        isHidden = prevEl[0].classList.contains(swiper2.params.navigation.hiddenClass);
      }
      if (isHidden === true) {
        emit("navigationShow");
      } else {
        emit("navigationHide");
      }
      [...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper2.params.navigation.hiddenClass));
    }
  });
  const enable = () => {
    swiper2.el.classList.remove(...swiper2.params.navigation.navigationDisabledClass.split(" "));
    init();
    update2();
  };
  const disable = () => {
    swiper2.el.classList.add(...swiper2.params.navigation.navigationDisabledClass.split(" "));
    destroy();
  };
  Object.assign(swiper2.navigation, {
    enable,
    disable,
    update: update2,
    init,
    destroy
  });
}
function Autoplay(_ref) {
  let {
    swiper: swiper2,
    extendParams,
    on,
    emit,
    params
  } = _ref;
  swiper2.autoplay = {
    running: false,
    paused: false,
    timeLeft: 0
  };
  extendParams({
    autoplay: {
      enabled: false,
      delay: 3e3,
      waitForTransition: true,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      reverseDirection: false,
      pauseOnMouseEnter: false
    }
  });
  let timeout;
  let raf;
  let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
  let autoplayTimeLeft;
  let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
  let wasPaused;
  let isTouched;
  let pausedByTouch;
  let touchStartTimeout;
  let slideChanged;
  let pausedByInteraction;
  let pausedByPointerEnter;
  function onTransitionEnd(e) {
    if (!swiper2 || swiper2.destroyed || !swiper2.wrapperEl)
      return;
    if (e.target !== swiper2.wrapperEl)
      return;
    swiper2.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
    if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
      return;
    }
    resume();
  }
  const calcTimeLeft = () => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    if (swiper2.autoplay.paused) {
      wasPaused = true;
    } else if (wasPaused) {
      autoplayDelayCurrent = autoplayTimeLeft;
      wasPaused = false;
    }
    const timeLeft = swiper2.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
    swiper2.autoplay.timeLeft = timeLeft;
    emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
    raf = requestAnimationFrame(() => {
      calcTimeLeft();
    });
  };
  const getSlideDelay = () => {
    let activeSlideEl;
    if (swiper2.virtual && swiper2.params.virtual.enabled) {
      activeSlideEl = swiper2.slides.filter((slideEl) => slideEl.classList.contains("swiper-slide-active"))[0];
    } else {
      activeSlideEl = swiper2.slides[swiper2.activeIndex];
    }
    if (!activeSlideEl)
      return void 0;
    const currentSlideDelay = parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
    return currentSlideDelay;
  };
  const run = (delayForce) => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    cancelAnimationFrame(raf);
    calcTimeLeft();
    let delay = typeof delayForce === "undefined" ? swiper2.params.autoplay.delay : delayForce;
    autoplayDelayTotal = swiper2.params.autoplay.delay;
    autoplayDelayCurrent = swiper2.params.autoplay.delay;
    const currentSlideDelay = getSlideDelay();
    if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === "undefined") {
      delay = currentSlideDelay;
      autoplayDelayTotal = currentSlideDelay;
      autoplayDelayCurrent = currentSlideDelay;
    }
    autoplayTimeLeft = delay;
    const speed = swiper2.params.speed;
    const proceed = () => {
      if (!swiper2 || swiper2.destroyed)
        return;
      if (swiper2.params.autoplay.reverseDirection) {
        if (!swiper2.isBeginning || swiper2.params.loop || swiper2.params.rewind) {
          swiper2.slidePrev(speed, true, true);
          emit("autoplay");
        } else if (!swiper2.params.autoplay.stopOnLastSlide) {
          swiper2.slideTo(swiper2.slides.length - 1, speed, true, true);
          emit("autoplay");
        }
      } else {
        if (!swiper2.isEnd || swiper2.params.loop || swiper2.params.rewind) {
          swiper2.slideNext(speed, true, true);
          emit("autoplay");
        } else if (!swiper2.params.autoplay.stopOnLastSlide) {
          swiper2.slideTo(0, speed, true, true);
          emit("autoplay");
        }
      }
      if (swiper2.params.cssMode) {
        autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
        requestAnimationFrame(() => {
          run();
        });
      }
    };
    if (delay > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        proceed();
      }, delay);
    } else {
      requestAnimationFrame(() => {
        proceed();
      });
    }
    return delay;
  };
  const start = () => {
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    swiper2.autoplay.running = true;
    run();
    emit("autoplayStart");
  };
  const stop = () => {
    swiper2.autoplay.running = false;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    emit("autoplayStop");
  };
  const pause = (internal, reset) => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    clearTimeout(timeout);
    if (!internal) {
      pausedByInteraction = true;
    }
    const proceed = () => {
      emit("autoplayPause");
      if (swiper2.params.autoplay.waitForTransition) {
        swiper2.wrapperEl.addEventListener("transitionend", onTransitionEnd);
      } else {
        resume();
      }
    };
    swiper2.autoplay.paused = true;
    if (reset) {
      if (slideChanged) {
        autoplayTimeLeft = swiper2.params.autoplay.delay;
      }
      slideChanged = false;
      proceed();
      return;
    }
    const delay = autoplayTimeLeft || swiper2.params.autoplay.delay;
    autoplayTimeLeft = delay - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
    if (swiper2.isEnd && autoplayTimeLeft < 0 && !swiper2.params.loop)
      return;
    if (autoplayTimeLeft < 0)
      autoplayTimeLeft = 0;
    proceed();
  };
  const resume = () => {
    if (swiper2.isEnd && autoplayTimeLeft < 0 && !swiper2.params.loop || swiper2.destroyed || !swiper2.autoplay.running)
      return;
    autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
    if (pausedByInteraction) {
      pausedByInteraction = false;
      run(autoplayTimeLeft);
    } else {
      run();
    }
    swiper2.autoplay.paused = false;
    emit("autoplayResume");
  };
  const onVisibilityChange = () => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    const document2 = getDocument();
    if (document2.visibilityState === "hidden") {
      pausedByInteraction = true;
      pause(true);
    }
    if (document2.visibilityState === "visible") {
      resume();
    }
  };
  const onPointerEnter = (e) => {
    if (e.pointerType !== "mouse")
      return;
    pausedByInteraction = true;
    pausedByPointerEnter = true;
    if (swiper2.animating || swiper2.autoplay.paused)
      return;
    pause(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType !== "mouse")
      return;
    pausedByPointerEnter = false;
    if (swiper2.autoplay.paused) {
      resume();
    }
  };
  const attachMouseEvents = () => {
    if (swiper2.params.autoplay.pauseOnMouseEnter) {
      swiper2.el.addEventListener("pointerenter", onPointerEnter);
      swiper2.el.addEventListener("pointerleave", onPointerLeave);
    }
  };
  const detachMouseEvents = () => {
    if (swiper2.el && typeof swiper2.el !== "string") {
      swiper2.el.removeEventListener("pointerenter", onPointerEnter);
      swiper2.el.removeEventListener("pointerleave", onPointerLeave);
    }
  };
  const attachDocumentEvents = () => {
    const document2 = getDocument();
    document2.addEventListener("visibilitychange", onVisibilityChange);
  };
  const detachDocumentEvents = () => {
    const document2 = getDocument();
    document2.removeEventListener("visibilitychange", onVisibilityChange);
  };
  on("init", () => {
    if (swiper2.params.autoplay.enabled) {
      attachMouseEvents();
      attachDocumentEvents();
      start();
    }
  });
  on("destroy", () => {
    detachMouseEvents();
    detachDocumentEvents();
    if (swiper2.autoplay.running) {
      stop();
    }
  });
  on("_freeModeStaticRelease", () => {
    if (pausedByTouch || pausedByInteraction) {
      resume();
    }
  });
  on("_freeModeNoMomentumRelease", () => {
    if (!swiper2.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("beforeTransitionStart", (_s, speed, internal) => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    if (internal || !swiper2.params.autoplay.disableOnInteraction) {
      pause(true, true);
    } else {
      stop();
    }
  });
  on("sliderFirstMove", () => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    if (swiper2.params.autoplay.disableOnInteraction) {
      stop();
      return;
    }
    isTouched = true;
    pausedByTouch = false;
    pausedByInteraction = false;
    touchStartTimeout = setTimeout(() => {
      pausedByInteraction = true;
      pausedByTouch = true;
      pause(true);
    }, 200);
  });
  on("touchEnd", () => {
    if (swiper2.destroyed || !swiper2.autoplay.running || !isTouched)
      return;
    clearTimeout(touchStartTimeout);
    clearTimeout(timeout);
    if (swiper2.params.autoplay.disableOnInteraction) {
      pausedByTouch = false;
      isTouched = false;
      return;
    }
    if (pausedByTouch && swiper2.params.cssMode)
      resume();
    pausedByTouch = false;
    isTouched = false;
  });
  on("slideChange", () => {
    if (swiper2.destroyed || !swiper2.autoplay.running)
      return;
    slideChanged = true;
  });
  Object.assign(swiper2.autoplay, {
    start,
    stop,
    pause,
    resume
  });
}
function freeMode(_ref) {
  let {
    swiper: swiper2,
    extendParams,
    emit,
    once
  } = _ref;
  extendParams({
    freeMode: {
      enabled: false,
      momentum: true,
      momentumRatio: 1,
      momentumBounce: true,
      momentumBounceRatio: 1,
      momentumVelocityRatio: 1,
      sticky: false,
      minimumVelocity: 0.02
    }
  });
  function onTouchStart2() {
    if (swiper2.params.cssMode)
      return;
    const translate2 = swiper2.getTranslate();
    swiper2.setTranslate(translate2);
    swiper2.setTransition(0);
    swiper2.touchEventsData.velocities.length = 0;
    swiper2.freeMode.onTouchEnd({
      currentPos: swiper2.rtl ? swiper2.translate : -swiper2.translate
    });
  }
  function onTouchMove2() {
    if (swiper2.params.cssMode)
      return;
    const {
      touchEventsData: data,
      touches
    } = swiper2;
    if (data.velocities.length === 0) {
      data.velocities.push({
        position: touches[swiper2.isHorizontal() ? "startX" : "startY"],
        time: data.touchStartTime
      });
    }
    data.velocities.push({
      position: touches[swiper2.isHorizontal() ? "currentX" : "currentY"],
      time: now()
    });
  }
  function onTouchEnd2(_ref2) {
    let {
      currentPos
    } = _ref2;
    if (swiper2.params.cssMode)
      return;
    const {
      params,
      wrapperEl,
      rtlTranslate: rtl,
      snapGrid,
      touchEventsData: data
    } = swiper2;
    const touchEndTime = now();
    const timeDiff = touchEndTime - data.touchStartTime;
    if (currentPos < -swiper2.minTranslate()) {
      swiper2.slideTo(swiper2.activeIndex);
      return;
    }
    if (currentPos > -swiper2.maxTranslate()) {
      if (swiper2.slides.length < snapGrid.length) {
        swiper2.slideTo(snapGrid.length - 1);
      } else {
        swiper2.slideTo(swiper2.slides.length - 1);
      }
      return;
    }
    if (params.freeMode.momentum) {
      if (data.velocities.length > 1) {
        const lastMoveEvent = data.velocities.pop();
        const velocityEvent = data.velocities.pop();
        const distance = lastMoveEvent.position - velocityEvent.position;
        const time = lastMoveEvent.time - velocityEvent.time;
        swiper2.velocity = distance / time;
        swiper2.velocity /= 2;
        if (Math.abs(swiper2.velocity) < params.freeMode.minimumVelocity) {
          swiper2.velocity = 0;
        }
        if (time > 150 || now() - lastMoveEvent.time > 300) {
          swiper2.velocity = 0;
        }
      } else {
        swiper2.velocity = 0;
      }
      swiper2.velocity *= params.freeMode.momentumVelocityRatio;
      data.velocities.length = 0;
      let momentumDuration = 1e3 * params.freeMode.momentumRatio;
      const momentumDistance = swiper2.velocity * momentumDuration;
      let newPosition = swiper2.translate + momentumDistance;
      if (rtl)
        newPosition = -newPosition;
      let doBounce = false;
      let afterBouncePosition;
      const bounceAmount = Math.abs(swiper2.velocity) * 20 * params.freeMode.momentumBounceRatio;
      let needsLoopFix;
      if (newPosition < swiper2.maxTranslate()) {
        if (params.freeMode.momentumBounce) {
          if (newPosition + swiper2.maxTranslate() < -bounceAmount) {
            newPosition = swiper2.maxTranslate() - bounceAmount;
          }
          afterBouncePosition = swiper2.maxTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper2.maxTranslate();
        }
        if (params.loop && params.centeredSlides)
          needsLoopFix = true;
      } else if (newPosition > swiper2.minTranslate()) {
        if (params.freeMode.momentumBounce) {
          if (newPosition - swiper2.minTranslate() > bounceAmount) {
            newPosition = swiper2.minTranslate() + bounceAmount;
          }
          afterBouncePosition = swiper2.minTranslate();
          doBounce = true;
          data.allowMomentumBounce = true;
        } else {
          newPosition = swiper2.minTranslate();
        }
        if (params.loop && params.centeredSlides)
          needsLoopFix = true;
      } else if (params.freeMode.sticky) {
        let nextSlide;
        for (let j = 0; j < snapGrid.length; j += 1) {
          if (snapGrid[j] > -newPosition) {
            nextSlide = j;
            break;
          }
        }
        if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper2.swipeDirection === "next") {
          newPosition = snapGrid[nextSlide];
        } else {
          newPosition = snapGrid[nextSlide - 1];
        }
        newPosition = -newPosition;
      }
      if (needsLoopFix) {
        once("transitionEnd", () => {
          swiper2.loopFix();
        });
      }
      if (swiper2.velocity !== 0) {
        if (rtl) {
          momentumDuration = Math.abs((-newPosition - swiper2.translate) / swiper2.velocity);
        } else {
          momentumDuration = Math.abs((newPosition - swiper2.translate) / swiper2.velocity);
        }
        if (params.freeMode.sticky) {
          const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper2.translate);
          const currentSlideSize = swiper2.slidesSizesGrid[swiper2.activeIndex];
          if (moveDistance < currentSlideSize) {
            momentumDuration = params.speed;
          } else if (moveDistance < 2 * currentSlideSize) {
            momentumDuration = params.speed * 1.5;
          } else {
            momentumDuration = params.speed * 2.5;
          }
        }
      } else if (params.freeMode.sticky) {
        swiper2.slideToClosest();
        return;
      }
      if (params.freeMode.momentumBounce && doBounce) {
        swiper2.updateProgress(afterBouncePosition);
        swiper2.setTransition(momentumDuration);
        swiper2.setTranslate(newPosition);
        swiper2.transitionStart(true, swiper2.swipeDirection);
        swiper2.animating = true;
        elementTransitionEnd(wrapperEl, () => {
          if (!swiper2 || swiper2.destroyed || !data.allowMomentumBounce)
            return;
          emit("momentumBounce");
          swiper2.setTransition(params.speed);
          setTimeout(() => {
            swiper2.setTranslate(afterBouncePosition);
            elementTransitionEnd(wrapperEl, () => {
              if (!swiper2 || swiper2.destroyed)
                return;
              swiper2.transitionEnd();
            });
          }, 0);
        });
      } else if (swiper2.velocity) {
        emit("_freeModeNoMomentumRelease");
        swiper2.updateProgress(newPosition);
        swiper2.setTransition(momentumDuration);
        swiper2.setTranslate(newPosition);
        swiper2.transitionStart(true, swiper2.swipeDirection);
        if (!swiper2.animating) {
          swiper2.animating = true;
          elementTransitionEnd(wrapperEl, () => {
            if (!swiper2 || swiper2.destroyed)
              return;
            swiper2.transitionEnd();
          });
        }
      } else {
        swiper2.updateProgress(newPosition);
      }
      swiper2.updateActiveIndex();
      swiper2.updateSlidesClasses();
    } else if (params.freeMode.sticky) {
      swiper2.slideToClosest();
      return;
    } else if (params.freeMode) {
      emit("_freeModeNoMomentumRelease");
    }
    if (!params.freeMode.momentum || timeDiff >= params.longSwipesMs) {
      emit("_freeModeStaticRelease");
      swiper2.updateProgress();
      swiper2.updateActiveIndex();
      swiper2.updateSlidesClasses();
    }
  }
  Object.assign(swiper2, {
    freeMode: {
      onTouchStart: onTouchStart2,
      onTouchMove: onTouchMove2,
      onTouchEnd: onTouchEnd2
    }
  });
}
const _hoisted_1$3 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "10",
  height: "18"
};
function render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$3, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "#FFF",
      "fill-rule": "nonzero",
      d: "m2.661 9 7.016 7.096c.43.436.43 1.142 0 1.577a1.094 1.094 0 0 1-1.559 0L.323 9.788a1.124 1.124 0 0 1 0-1.576L8.118.327a1.094 1.094 0 0 1 1.56 0c.43.435.43 1.141 0 1.577z",
      opacity: ".7"
    }, null, -1)
  ]));
}
const IconSwiperPrev = { render: render$1 };
const _hoisted_1$2 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "10",
  height: "18"
};
function render(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$2, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "#FFF",
      "fill-rule": "nonzero",
      d: "M7.339 9 .323 16.096a1.124 1.124 0 0 0 0 1.577c.43.436 1.128.436 1.559 0l7.795-7.885c.43-.435.43-1.141 0-1.576L1.882.327a1.094 1.094 0 0 0-1.56 0 1.124 1.124 0 0 0 0 1.577z",
      opacity: ".7"
    }, null, -1)
  ]));
}
const IconSwiperNext = { render };
const _hoisted_1$1 = { class: "container" };
const _hoisted_2 = ["href"];
const _hoisted_3 = ["src"];
const _hoisted_4 = ["src"];
const _hoisted_5 = { class: "swiper-navigation-prev" };
const _hoisted_6 = { class: "swiper-navigation-next" };
const _hoisted_7 = { class: "news-header" };
const _hoisted_8 = ["onClick"];
const _hoisted_9 = { class: "news-content" };
const _hoisted_10 = ["href"];
const _hoisted_11 = { class: "news-date" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BannerAndNews",
  setup(__props) {
    const bannerList = reactive([]);
    const loaded = ref(false);
    const autoplayConfig = reactive({
      enable: false,
      delay: 3e3
    });
    const typeList = reactive([]);
    const newsMap = ref({});
    const newsType = ref("");
    const handleNewsTypeChange = (t) => {
      newsType.value = t;
    };
    const getData = async () => {
      loaded.value = false;
      bannerList.length = 0;
      try {
        const res = await requestBannerAndNews();
        if (res.operations_resource_open) {
          autoplayConfig.enable = res.banner_loop || false;
          autoplayConfig.delay = res.time_interval * 1e3 || 0;
          res.operations_banner_list?.forEach((item) => {
            bannerList.push({
              url: item.banner_img,
              link: item.jump_url
            });
          });
        }
        newsMap.value = {};
        typeList.length = 0;
        if (res?.news_list?.code === 0) {
          res.news_list.data?.news?.forEach((item) => {
            typeList.push(item.typeLabel);
            const newsList = item.rows;
            newsMap.value[item.typeLabel] = newsList?.map((item2) => {
              const date = new Date(item2.publishTime);
              return {
                date: `${date.getFullYear()}/${("0" + (date.getMonth() + 1)).slice(-2)}/${("0" + date.getDate()).slice(-2)}`,
                link: item2.link,
                title: item2.title
              };
            });
          });
        } else if (res?.notice_list?.length) {
          res?.notice_list?.forEach((typeItem) => {
            typeList.push(typeItem.notice_type);
            newsMap.value[typeItem.notice_type] = typeItem.notice_detail_list.map((newsItem) => ({
              date: newsItem.notice_time,
              link: newsItem.jump_url,
              title: newsItem.notice_title
            }));
          });
        }
        newsType.value = typeList[0] || "";
      } catch {
      }
      loaded.value = true;
    };
    onMounted(() => {
      getData();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        loaded.value && bannerList.length ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(["banner-container", { only: !typeList.length }])
        }, [
          createVNode(unref(Swiper2), {
            class: "swiper-container",
            modules: [unref(Autoplay), unref(Navigation)],
            "slides-per-view": 1,
            "space-between": 5,
            loop: "",
            "loop-additional-slides": 1,
            autoplay: autoplayConfig.enable && { delay: autoplayConfig.delay, pauseOnMouseEnter: true },
            navigation: { prevEl: ".swiper-navigation-prev", nextEl: ".swiper-navigation-next" }
          }, {
            default: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(bannerList, (item, index) => {
                return openBlock(), createBlock(unref(SwiperSlide), {
                  class: "slide",
                  key: `${item.url}-${index}`
                }, {
                  default: withCtx(() => [
                    item.link ? (openBlock(), createElementBlock("a", {
                      key: 0,
                      href: item.link,
                      target: "_blank"
                    }, [
                      createBaseVNode("img", {
                        src: item.url
                      }, null, 8, _hoisted_3)
                    ], 8, _hoisted_2)) : (openBlock(), createElementBlock("img", {
                      key: 1,
                      src: item.url
                    }, null, 8, _hoisted_4))
                  ]),
                  _: 2
                }, 1024);
              }), 128))
            ]),
            _: 1
          }, 8, ["modules", "autoplay", "navigation"]),
          createBaseVNode("div", _hoisted_5, [
            createVNode(unref(IconSwiperPrev), { class: "navigation-btn" })
          ]),
          createBaseVNode("div", _hoisted_6, [
            createVNode(unref(IconSwiperNext), { class: "navigation-btn" })
          ])
        ], 2)) : createCommentVNode("", true),
        loaded.value && typeList.length ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(["news-container", { only: !bannerList.length }])
        }, [
          createBaseVNode("div", _hoisted_7, [
            createVNode(unref(Swiper2), {
              class: "header-swiper-container",
              "slides-per-view": "auto",
              "slides-per-group": 1,
              modules: [unref(Mousewheel), unref(freeMode)],
              mousewheel: { enabled: true },
              "free-mode": { enabled: true }
            }, {
              default: withCtx(() => [
                (openBlock(true), createElementBlock(Fragment, null, renderList(typeList, (item, index) => {
                  return openBlock(), createBlock(unref(SwiperSlide), {
                    class: "slide",
                    key: index
                  }, {
                    default: withCtx(() => [
                      createBaseVNode("div", {
                        class: normalizeClass(["header-item", { active: item === newsType.value }]),
                        onClick: ($event) => handleNewsTypeChange(item)
                      }, [
                        createVNode(Ellipsis, {
                          text: item,
                          width: "300px",
                          class: "ellipsis-box"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(item), 1)
                          ]),
                          _: 2
                        }, 1032, ["text"])
                      ], 10, _hoisted_8)
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ]),
              _: 1
            }, 8, ["modules"])
          ]),
          createBaseVNode("div", _hoisted_9, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(newsMap.value[newsType.value], (item) => {
              return openBlock(), createElementBlock("div", {
                class: "news-item",
                key: item.link
              }, [
                createBaseVNode("a", {
                  class: "news-title",
                  href: item.link,
                  target: "_blank"
                }, [
                  createVNode(Ellipsis, {
                    text: item.title,
                    width: "300px"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(item.title), 1)
                    ]),
                    _: 2
                  }, 1032, ["text"])
                ], 8, _hoisted_10),
                createBaseVNode("div", _hoisted_11, toDisplayString(item.date), 1)
              ]);
            }), 128))
          ])
        ], 2)) : createCommentVNode("", true)
      ]);
    };
  }
});
const BannerAndNews_vue_vue_type_style_index_0_scoped_3db912fa_lang = "";
const BannerAndNews = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-3db912fa"]]);
const _hoisted_1 = ["src"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Container",
  setup(__props) {
    const { dispatchViewState } = useView();
    const { dispatchDownloadTask } = useDownload();
    const clientStore = useClient();
    const { clientState } = storeToRefs(clientStore);
    const { t } = useI18n();
    const { done, wrong } = useInitial();
    watch(wrong, (val) => {
      if (val) {
        Message$2({
          title: t("message.tip"),
          content: t("initial.error-tips"),
          confirmText: t("message.retry"),
          onConfirm: () => {
            window.location.reload();
          },
          onClose: () => {
            window.api.send("close-window");
          }
        });
      }
    });
    const handleNoSpace = () => {
      Message$2({
        title: t("message.tip"),
        content: t("download.insufficient-tips"),
        confirmText: t("message.confirm"),
        closeable: false,
        onConfirm: () => {
          dispatchDownloadTask({ state: "idle", basis: "", version: "", game_start_exe_name: "" });
          dispatchViewState("menu");
          LocalStorageUtil.removeItem("download-task");
        },
        onClose: () => dispatchViewState("menu")
      });
    };
    const handleSystemError = () => {
      Message$2({
        title: t("message.tip"),
        content: t("message.system-error"),
        confirmText: t("message.confirm"),
        closeable: false,
        onConfirm: () => {
          dispatchDownloadTask({
            state: "idle",
            basis: "",
            version: "",
            game_start_exe_name: "",
            repair: false
          });
          dispatchViewState("menu");
          LocalStorageUtil.removeItem("download-task");
        },
        onClose: () => dispatchViewState("menu")
      });
    };
    const handleChangeView = (view) => {
      dispatchViewState(view);
    };
    const handleDamageRepair = () => {
      Message$2({
        title: t("message.tip"),
        content: t("start.damage-tips"),
        confirmText: t("start.damage-repair"),
        cancelText: t("message.cancel"),
        closeable: false,
        onConfirm: () => {
          dispatchDownloadTask({ repair: false });
          handleDownloadGame();
        }
      }).catch();
    };
    onMounted(() => {
      window.api.receive("game-download-error-no-space", handleNoSpace);
      window.api.receive("change-view", handleChangeView);
      window.api.receive("game-download-error-network-down", handleNetworkErrorRetry);
      window.api.receive("game-download-failed", handleDownloadFailed);
      window.api.receive("start-game-damage", handleDamageRepair);
      window.api.receive("error-system", handleSystemError);
      window.api.receive("error-request-manifest", handleRequestManifestError);
    });
    onUnmounted(() => {
      window.api.removeReceive("game-download-error-no-space");
      window.api.removeReceive("change-view");
      window.api.removeReceive("game-download-error-network-down");
      window.api.removeReceive("game-download-failed");
      window.api.removeReceive("start-game-damage");
      window.api.removeReceive("error-system");
      window.api.removeReceive("error-request-manifest");
    });
    return (_ctx, _cache) => {
      const _directive_window_drag = resolveDirective("window-drag");
      return withDirectives((openBlock(), createElementBlock("div", {
        class: normalizeClass(["app-container", { bg: unref(clientState).backgroundImage === "" }])
      }, [
        unref(clientState).backgroundImage ? (openBlock(), createElementBlock("img", {
          key: 0,
          class: "app-container-bg",
          src: unref(clientState).backgroundImage
        }, null, 8, _hoisted_1)) : createCommentVNode("", true),
        unref(done) ? (openBlock(), createBlock(BannerAndNews, {
          key: 1,
          class: "container-widget"
        })) : createCommentVNode("", true),
        unref(done) ? (openBlock(), createBlock(SocialMedia, {
          key: 2,
          class: "container-widget social-media"
        })) : createCommentVNode("", true),
        withDirectives(createVNode(HeaderArea, { class: "header-area" }, null, 512), [
          [_directive_window_drag]
        ]),
        unref(done) && !unref(wrong) ? (openBlock(), createBlock(unref(RouterView), { key: 3 })) : createCommentVNode("", true)
      ], 2)), [
        [_directive_window_drag]
      ]);
    };
  }
});
const Container_vue_vue_type_style_index_0_scoped_215def14_lang = "";
const Container = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-215def14"]]);
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
      return openBlock(), createBlock(Container);
    };
  }
});
const style = "";
const scriptRel = function detectScriptRel() {
  const relList = typeof document !== "undefined" && document.createElement("link").relList;
  return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
}();
const assetsURL = function(dep, importerUrl) {
  return new URL(dep, importerUrl).href;
};
const seen = {};
const __vitePreload = function preload2(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep, importerUrl);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
const router = createRouter({
  history: createMemoryHistory("/"),
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/menu"
    },
    {
      path: "/menu",
      name: "menu",
      component: () => __vitePreload(() => import("./Menu-628ce084.js"), true ? ["./Menu-628ce084.js","./windowDrag-a6baf7c9.js","./windowDrag-0fb26879.css","./Menu-d38786c1.css"] : void 0, import.meta.url)
    },
    {
      path: "/download",
      name: "download",
      component: () => __vitePreload(() => import("./Download-3f8d25fc.js"), true ? ["./Download-3f8d25fc.js","./windowDrag-a6baf7c9.js","./windowDrag-0fb26879.css","./loading1-b0246f70.js","./ProgressBar-deae07b3.js","./ProgressBar-70b57343.css","./Download-d1cb7414.css"] : void 0, import.meta.url)
    },
    {
      path: "/progress",
      name: "progress",
      component: () => __vitePreload(() => import("./Progress-02cc1e76.js"), true ? ["./Progress-02cc1e76.js","./windowDrag-a6baf7c9.js","./windowDrag-0fb26879.css","./loading1-b0246f70.js","./ProgressBar-deae07b3.js","./ProgressBar-70b57343.css","./Progress-dc3b6982.css"] : void 0, import.meta.url)
    },
    {
      path: "/control",
      name: "control",
      component: () => __vitePreload(() => import("./GameControl-6831149a.js"), true ? ["./GameControl-6831149a.js","./windowDrag-a6baf7c9.js","./windowDrag-0fb26879.css","./GameControl-3f18ed9a.css"] : void 0, import.meta.url)
    }
  ]
});
const app = createApp(_sfc_main);
const pinia = createPinia();
app.use(i18n);
app.use(router);
app.use(pinia);
app.directive("window-drag", windowDrag);
app.mount("#app");
export {
  Ellipsis as E,
  LocalStorageUtil as L,
  useDownload as a,
  useClient as b,
  checkGame as c,
  handleNeedUpdate as d,
  handleDownloadGame as h,
  lodashExports as l,
  requestGameInfo as r,
  storeToRefs as s,
  useView as u,
  versionCompare as v
};
