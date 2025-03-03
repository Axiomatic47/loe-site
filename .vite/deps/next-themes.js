import {
  require_react
} from "./chunk-2CLD7BNN.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/next-themes/dist/index.module.js
var import_react = __toESM(require_react());
var c = ["light", "dark"];
var i = "(prefers-color-scheme: dark)";
var d = "undefined" == typeof window;
var u = (0, import_react.createContext)(void 0);
var h = { setTheme: (e2) => {
}, themes: [] };
var y = () => {
  var e2;
  return null !== (e2 = (0, import_react.useContext)(u)) && void 0 !== e2 ? e2 : h;
};
var $ = (r2) => (0, import_react.useContext)(u) ? import_react.default.createElement(import_react.Fragment, null, r2.children) : import_react.default.createElement(f, r2);
var v = ["light", "dark"];
var f = ({ forcedTheme: t2, disableTransitionOnChange: n2 = false, enableSystem: l2 = true, enableColorScheme: m2 = true, storageKey: d2 = "theme", themes: h2 = v, defaultTheme: y2 = l2 ? "system" : "light", attribute: $2 = "data-theme", value: f2, children: w, nonce: T }) => {
  const [E, k] = (0, import_react.useState)(() => S(d2, y2)), [C, L] = (0, import_react.useState)(() => S(d2)), x = f2 ? Object.values(f2) : h2, I = (0, import_react.useCallback)((e2) => {
    let t3 = e2;
    if (!t3) return;
    "system" === e2 && l2 && (t3 = p());
    const r2 = f2 ? f2[t3] : t3, o2 = n2 ? b() : null, a2 = document.documentElement;
    if ("class" === $2 ? (a2.classList.remove(...x), r2 && a2.classList.add(r2)) : r2 ? a2.setAttribute($2, r2) : a2.removeAttribute($2), m2) {
      const e3 = c.includes(y2) ? y2 : null, n3 = c.includes(t3) ? t3 : e3;
      a2.style.colorScheme = n3;
    }
    null == o2 || o2();
  }, []), O = (0, import_react.useCallback)((e2) => {
    k(e2);
    try {
      localStorage.setItem(d2, e2);
    } catch (e3) {
    }
  }, [t2]), M = (0, import_react.useCallback)((e2) => {
    const n3 = p(e2);
    L(n3), "system" === E && l2 && !t2 && I("system");
  }, [E, t2]);
  (0, import_react.useEffect)(() => {
    const e2 = window.matchMedia(i);
    return e2.addListener(M), M(e2), () => e2.removeListener(M);
  }, [M]), (0, import_react.useEffect)(() => {
    const e2 = (e3) => {
      e3.key === d2 && O(e3.newValue || y2);
    };
    return window.addEventListener("storage", e2), () => window.removeEventListener("storage", e2);
  }, [O]), (0, import_react.useEffect)(() => {
    I(null != t2 ? t2 : E);
  }, [t2, E]);
  const A = (0, import_react.useMemo)(() => ({ theme: E, setTheme: O, forcedTheme: t2, resolvedTheme: "system" === E ? C : E, themes: l2 ? [...h2, "system"] : h2, systemTheme: l2 ? C : void 0 }), [E, O, t2, C, l2, h2]);
  return import_react.default.createElement(u.Provider, { value: A }, import_react.default.createElement(g, { forcedTheme: t2, disableTransitionOnChange: n2, enableSystem: l2, enableColorScheme: m2, storageKey: d2, themes: h2, defaultTheme: y2, attribute: $2, value: f2, children: w, attrs: x, nonce: T }), w);
};
var g = (0, import_react.memo)(({ forcedTheme: t2, storageKey: n2, attribute: r2, enableSystem: o2, enableColorScheme: a2, defaultTheme: s2, value: l2, attrs: m2, nonce: d2 }) => {
  const u2 = "system" === s2, h2 = "class" === r2 ? `var d=document.documentElement,c=d.classList;c.remove(${m2.map((e2) => `'${e2}'`).join(",")});` : `var d=document.documentElement,n='${r2}',s='setAttribute';`, y2 = a2 ? c.includes(s2) && s2 ? `if(e==='light'||e==='dark'||!e)d.style.colorScheme=e||'${s2}'` : "if(e==='light'||e==='dark')d.style.colorScheme=e" : "", $2 = (e2, t3 = false, n3 = true) => {
    const o3 = l2 ? l2[e2] : e2, s3 = t3 ? e2 + "|| ''" : `'${o3}'`;
    let m3 = "";
    return a2 && n3 && !t3 && c.includes(e2) && (m3 += `d.style.colorScheme = '${e2}';`), "class" === r2 ? m3 += t3 || o3 ? `c.add(${s3})` : "null" : o3 && (m3 += `d[s](n,${s3})`), m3;
  }, v2 = t2 ? `!function(){${h2}${$2(t2)}}()` : o2 ? `!function(){try{${h2}var e=localStorage.getItem('${n2}');if('system'===e||(!e&&${u2})){var t='${i}',m=window.matchMedia(t);if(m.media!==t||m.matches){${$2("dark")}}else{${$2("light")}}}else if(e){${l2 ? `var x=${JSON.stringify(l2)};` : ""}${$2(l2 ? "x[e]" : "e", true)}}${u2 ? "" : "else{" + $2(s2, false, false) + "}"}${y2}}catch(e){}}()` : `!function(){try{${h2}var e=localStorage.getItem('${n2}');if(e){${l2 ? `var x=${JSON.stringify(l2)};` : ""}${$2(l2 ? "x[e]" : "e", true)}}else{${$2(s2, false, false)};}${y2}}catch(t){}}();`;
  return import_react.default.createElement("script", { nonce: d2, dangerouslySetInnerHTML: { __html: v2 } });
}, () => true);
var S = (e2, t2) => {
  if (d) return;
  let n2;
  try {
    n2 = localStorage.getItem(e2) || void 0;
  } catch (e3) {
  }
  return n2 || t2;
};
var b = () => {
  const e2 = document.createElement("style");
  return e2.appendChild(document.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")), document.head.appendChild(e2), () => {
    window.getComputedStyle(document.body), setTimeout(() => {
      document.head.removeChild(e2);
    }, 1);
  };
};
var p = (e2) => (e2 || (e2 = window.matchMedia(i)), e2.matches ? "dark" : "light");
export {
  $ as ThemeProvider,
  y as useTheme
};
//# sourceMappingURL=next-themes.js.map
