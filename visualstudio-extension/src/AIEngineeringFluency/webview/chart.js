"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e7) {
      throw err = [e7], e7;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/@kurkle/color/dist/color.esm.js
  function round(v2) {
    return v2 + 0.5 | 0;
  }
  function p2b(v2) {
    return lim(round(v2 * 2.55), 0, 255);
  }
  function n2b(v2) {
    return lim(round(v2 * 255), 0, 255);
  }
  function b2n(v2) {
    return lim(round(v2 / 2.55) / 100, 0, 1);
  }
  function n2p(v2) {
    return lim(round(v2 * 100), 0, 100);
  }
  function hexParse(str) {
    var len = str.length;
    var ret;
    if (str[0] === "#") {
      if (len === 4 || len === 5) {
        ret = {
          r: 255 & map$1[str[1]] * 17,
          g: 255 & map$1[str[2]] * 17,
          b: 255 & map$1[str[3]] * 17,
          a: len === 5 ? map$1[str[4]] * 17 : 255
        };
      } else if (len === 7 || len === 9) {
        ret = {
          r: map$1[str[1]] << 4 | map$1[str[2]],
          g: map$1[str[3]] << 4 | map$1[str[4]],
          b: map$1[str[5]] << 4 | map$1[str[6]],
          a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
        };
      }
    }
    return ret;
  }
  function hexString(v2) {
    var f3 = isShort(v2) ? h1 : h2;
    return v2 ? "#" + f3(v2.r) + f3(v2.g) + f3(v2.b) + alpha(v2.a, f3) : void 0;
  }
  function hsl2rgbn(h4, s4, l3) {
    const a3 = s4 * Math.min(l3, 1 - l3);
    const f3 = (n5, k2 = (n5 + h4 / 30) % 12) => l3 - a3 * Math.max(Math.min(k2 - 3, 9 - k2, 1), -1);
    return [f3(0), f3(8), f3(4)];
  }
  function hsv2rgbn(h4, s4, v2) {
    const f3 = (n5, k2 = (n5 + h4 / 60) % 6) => v2 - v2 * s4 * Math.max(Math.min(k2, 4 - k2, 1), 0);
    return [f3(5), f3(3), f3(1)];
  }
  function hwb2rgbn(h4, w2, b3) {
    const rgb = hsl2rgbn(h4, 1, 0.5);
    let i6;
    if (w2 + b3 > 1) {
      i6 = 1 / (w2 + b3);
      w2 *= i6;
      b3 *= i6;
    }
    for (i6 = 0; i6 < 3; i6++) {
      rgb[i6] *= 1 - w2 - b3;
      rgb[i6] += w2;
    }
    return rgb;
  }
  function hueValue(r6, g2, b3, d3, max) {
    if (r6 === max) {
      return (g2 - b3) / d3 + (g2 < b3 ? 6 : 0);
    }
    if (g2 === max) {
      return (b3 - r6) / d3 + 2;
    }
    return (r6 - g2) / d3 + 4;
  }
  function rgb2hsl(v2) {
    const range = 255;
    const r6 = v2.r / range;
    const g2 = v2.g / range;
    const b3 = v2.b / range;
    const max = Math.max(r6, g2, b3);
    const min = Math.min(r6, g2, b3);
    const l3 = (max + min) / 2;
    let h4, s4, d3;
    if (max !== min) {
      d3 = max - min;
      s4 = l3 > 0.5 ? d3 / (2 - max - min) : d3 / (max + min);
      h4 = hueValue(r6, g2, b3, d3, max);
      h4 = h4 * 60 + 0.5;
    }
    return [h4 | 0, s4 || 0, l3];
  }
  function calln(f3, a3, b3, c4) {
    return (Array.isArray(a3) ? f3(a3[0], a3[1], a3[2]) : f3(a3, b3, c4)).map(n2b);
  }
  function hsl2rgb(h4, s4, l3) {
    return calln(hsl2rgbn, h4, s4, l3);
  }
  function hwb2rgb(h4, w2, b3) {
    return calln(hwb2rgbn, h4, w2, b3);
  }
  function hsv2rgb(h4, s4, v2) {
    return calln(hsv2rgbn, h4, s4, v2);
  }
  function hue(h4) {
    return (h4 % 360 + 360) % 360;
  }
  function hueParse(str) {
    const m2 = HUE_RE.exec(str);
    let a3 = 255;
    let v2;
    if (!m2) {
      return;
    }
    if (m2[5] !== v2) {
      a3 = m2[6] ? p2b(+m2[5]) : n2b(+m2[5]);
    }
    const h4 = hue(+m2[2]);
    const p1 = +m2[3] / 100;
    const p22 = +m2[4] / 100;
    if (m2[1] === "hwb") {
      v2 = hwb2rgb(h4, p1, p22);
    } else if (m2[1] === "hsv") {
      v2 = hsv2rgb(h4, p1, p22);
    } else {
      v2 = hsl2rgb(h4, p1, p22);
    }
    return {
      r: v2[0],
      g: v2[1],
      b: v2[2],
      a: a3
    };
  }
  function rotate(v2, deg) {
    var h4 = rgb2hsl(v2);
    h4[0] = hue(h4[0] + deg);
    h4 = hsl2rgb(h4);
    v2.r = h4[0];
    v2.g = h4[1];
    v2.b = h4[2];
  }
  function hslString(v2) {
    if (!v2) {
      return;
    }
    const a3 = rgb2hsl(v2);
    const h4 = a3[0];
    const s4 = n2p(a3[1]);
    const l3 = n2p(a3[2]);
    return v2.a < 255 ? `hsla(${h4}, ${s4}%, ${l3}%, ${b2n(v2.a)})` : `hsl(${h4}, ${s4}%, ${l3}%)`;
  }
  function unpack() {
    const unpacked = {};
    const keys = Object.keys(names$1);
    const tkeys = Object.keys(map);
    let i6, j, k2, ok, nk;
    for (i6 = 0; i6 < keys.length; i6++) {
      ok = nk = keys[i6];
      for (j = 0; j < tkeys.length; j++) {
        k2 = tkeys[j];
        nk = nk.replace(k2, map[k2]);
      }
      k2 = parseInt(names$1[ok], 16);
      unpacked[nk] = [k2 >> 16 & 255, k2 >> 8 & 255, k2 & 255];
    }
    return unpacked;
  }
  function nameParse(str) {
    if (!names) {
      names = unpack();
      names.transparent = [0, 0, 0, 0];
    }
    const a3 = names[str.toLowerCase()];
    return a3 && {
      r: a3[0],
      g: a3[1],
      b: a3[2],
      a: a3.length === 4 ? a3[3] : 255
    };
  }
  function rgbParse(str) {
    const m2 = RGB_RE.exec(str);
    let a3 = 255;
    let r6, g2, b3;
    if (!m2) {
      return;
    }
    if (m2[7] !== r6) {
      const v2 = +m2[7];
      a3 = m2[8] ? p2b(v2) : lim(v2 * 255, 0, 255);
    }
    r6 = +m2[1];
    g2 = +m2[3];
    b3 = +m2[5];
    r6 = 255 & (m2[2] ? p2b(r6) : lim(r6, 0, 255));
    g2 = 255 & (m2[4] ? p2b(g2) : lim(g2, 0, 255));
    b3 = 255 & (m2[6] ? p2b(b3) : lim(b3, 0, 255));
    return {
      r: r6,
      g: g2,
      b: b3,
      a: a3
    };
  }
  function rgbString(v2) {
    return v2 && (v2.a < 255 ? `rgba(${v2.r}, ${v2.g}, ${v2.b}, ${b2n(v2.a)})` : `rgb(${v2.r}, ${v2.g}, ${v2.b})`);
  }
  function interpolate(rgb1, rgb2, t4) {
    const r6 = from(b2n(rgb1.r));
    const g2 = from(b2n(rgb1.g));
    const b3 = from(b2n(rgb1.b));
    return {
      r: n2b(to(r6 + t4 * (from(b2n(rgb2.r)) - r6))),
      g: n2b(to(g2 + t4 * (from(b2n(rgb2.g)) - g2))),
      b: n2b(to(b3 + t4 * (from(b2n(rgb2.b)) - b3))),
      a: rgb1.a + t4 * (rgb2.a - rgb1.a)
    };
  }
  function modHSL(v2, i6, ratio) {
    if (v2) {
      let tmp = rgb2hsl(v2);
      tmp[i6] = Math.max(0, Math.min(tmp[i6] + tmp[i6] * ratio, i6 === 0 ? 360 : 1));
      tmp = hsl2rgb(tmp);
      v2.r = tmp[0];
      v2.g = tmp[1];
      v2.b = tmp[2];
    }
  }
  function clone(v2, proto) {
    return v2 ? Object.assign(proto || {}, v2) : v2;
  }
  function fromObject(input) {
    var v2 = { r: 0, g: 0, b: 0, a: 255 };
    if (Array.isArray(input)) {
      if (input.length >= 3) {
        v2 = { r: input[0], g: input[1], b: input[2], a: 255 };
        if (input.length > 3) {
          v2.a = n2b(input[3]);
        }
      }
    } else {
      v2 = clone(input, { r: 0, g: 0, b: 0, a: 1 });
      v2.a = n2b(v2.a);
    }
    return v2;
  }
  function functionParse(str) {
    if (str.charAt(0) === "r") {
      return rgbParse(str);
    }
    return hueParse(str);
  }
  var lim, map$1, hex, h1, h2, eq, isShort, alpha, HUE_RE, map, names$1, names, RGB_RE, to, from, Color;
  var init_color_esm = __esm({
    "node_modules/@kurkle/color/dist/color.esm.js"() {
      lim = (v2, l3, h4) => Math.max(Math.min(v2, h4), l3);
      map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
      hex = [..."0123456789ABCDEF"];
      h1 = (b3) => hex[b3 & 15];
      h2 = (b3) => hex[(b3 & 240) >> 4] + hex[b3 & 15];
      eq = (b3) => (b3 & 240) >> 4 === (b3 & 15);
      isShort = (v2) => eq(v2.r) && eq(v2.g) && eq(v2.b) && eq(v2.a);
      alpha = (a3, f3) => a3 < 255 ? f3(a3) : "";
      HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
      map = {
        x: "dark",
        Z: "light",
        Y: "re",
        X: "blu",
        W: "gr",
        V: "medium",
        U: "slate",
        A: "ee",
        T: "ol",
        S: "or",
        B: "ra",
        C: "lateg",
        D: "ights",
        R: "in",
        Q: "turquois",
        E: "hi",
        P: "ro",
        O: "al",
        N: "le",
        M: "de",
        L: "yello",
        F: "en",
        K: "ch",
        G: "arks",
        H: "ea",
        I: "ightg",
        J: "wh"
      };
      names$1 = {
        OiceXe: "f0f8ff",
        antiquewEte: "faebd7",
        aqua: "ffff",
        aquamarRe: "7fffd4",
        azuY: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "0",
        blanKedOmond: "ffebcd",
        Xe: "ff",
        XeviTet: "8a2be2",
        bPwn: "a52a2a",
        burlywood: "deb887",
        caMtXe: "5f9ea0",
        KartYuse: "7fff00",
        KocTate: "d2691e",
        cSO: "ff7f50",
        cSnflowerXe: "6495ed",
        cSnsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "ffff",
        xXe: "8b",
        xcyan: "8b8b",
        xgTMnPd: "b8860b",
        xWay: "a9a9a9",
        xgYF: "6400",
        xgYy: "a9a9a9",
        xkhaki: "bdb76b",
        xmagFta: "8b008b",
        xTivegYF: "556b2f",
        xSange: "ff8c00",
        xScEd: "9932cc",
        xYd: "8b0000",
        xsOmon: "e9967a",
        xsHgYF: "8fbc8f",
        xUXe: "483d8b",
        xUWay: "2f4f4f",
        xUgYy: "2f4f4f",
        xQe: "ced1",
        xviTet: "9400d3",
        dAppRk: "ff1493",
        dApskyXe: "bfff",
        dimWay: "696969",
        dimgYy: "696969",
        dodgerXe: "1e90ff",
        fiYbrick: "b22222",
        flSOwEte: "fffaf0",
        foYstWAn: "228b22",
        fuKsia: "ff00ff",
        gaRsbSo: "dcdcdc",
        ghostwEte: "f8f8ff",
        gTd: "ffd700",
        gTMnPd: "daa520",
        Way: "808080",
        gYF: "8000",
        gYFLw: "adff2f",
        gYy: "808080",
        honeyMw: "f0fff0",
        hotpRk: "ff69b4",
        RdianYd: "cd5c5c",
        Rdigo: "4b0082",
        ivSy: "fffff0",
        khaki: "f0e68c",
        lavFMr: "e6e6fa",
        lavFMrXsh: "fff0f5",
        lawngYF: "7cfc00",
        NmoncEffon: "fffacd",
        ZXe: "add8e6",
        ZcSO: "f08080",
        Zcyan: "e0ffff",
        ZgTMnPdLw: "fafad2",
        ZWay: "d3d3d3",
        ZgYF: "90ee90",
        ZgYy: "d3d3d3",
        ZpRk: "ffb6c1",
        ZsOmon: "ffa07a",
        ZsHgYF: "20b2aa",
        ZskyXe: "87cefa",
        ZUWay: "778899",
        ZUgYy: "778899",
        ZstAlXe: "b0c4de",
        ZLw: "ffffe0",
        lime: "ff00",
        limegYF: "32cd32",
        lRF: "faf0e6",
        magFta: "ff00ff",
        maPon: "800000",
        VaquamarRe: "66cdaa",
        VXe: "cd",
        VScEd: "ba55d3",
        VpurpN: "9370db",
        VsHgYF: "3cb371",
        VUXe: "7b68ee",
        VsprRggYF: "fa9a",
        VQe: "48d1cc",
        VviTetYd: "c71585",
        midnightXe: "191970",
        mRtcYam: "f5fffa",
        mistyPse: "ffe4e1",
        moccasR: "ffe4b5",
        navajowEte: "ffdead",
        navy: "80",
        Tdlace: "fdf5e6",
        Tive: "808000",
        TivedBb: "6b8e23",
        Sange: "ffa500",
        SangeYd: "ff4500",
        ScEd: "da70d6",
        pOegTMnPd: "eee8aa",
        pOegYF: "98fb98",
        pOeQe: "afeeee",
        pOeviTetYd: "db7093",
        papayawEp: "ffefd5",
        pHKpuff: "ffdab9",
        peru: "cd853f",
        pRk: "ffc0cb",
        plum: "dda0dd",
        powMrXe: "b0e0e6",
        purpN: "800080",
        YbeccapurpN: "663399",
        Yd: "ff0000",
        Psybrown: "bc8f8f",
        PyOXe: "4169e1",
        saddNbPwn: "8b4513",
        sOmon: "fa8072",
        sandybPwn: "f4a460",
        sHgYF: "2e8b57",
        sHshell: "fff5ee",
        siFna: "a0522d",
        silver: "c0c0c0",
        skyXe: "87ceeb",
        UXe: "6a5acd",
        UWay: "708090",
        UgYy: "708090",
        snow: "fffafa",
        sprRggYF: "ff7f",
        stAlXe: "4682b4",
        tan: "d2b48c",
        teO: "8080",
        tEstN: "d8bfd8",
        tomato: "ff6347",
        Qe: "40e0d0",
        viTet: "ee82ee",
        JHt: "f5deb3",
        wEte: "ffffff",
        wEtesmoke: "f5f5f5",
        Lw: "ffff00",
        LwgYF: "9acd32"
      };
      RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
      to = (v2) => v2 <= 31308e-7 ? v2 * 12.92 : Math.pow(v2, 1 / 2.4) * 1.055 - 0.055;
      from = (v2) => v2 <= 0.04045 ? v2 / 12.92 : Math.pow((v2 + 0.055) / 1.055, 2.4);
      Color = class _Color {
        constructor(input) {
          if (input instanceof _Color) {
            return input;
          }
          const type = typeof input;
          let v2;
          if (type === "object") {
            v2 = fromObject(input);
          } else if (type === "string") {
            v2 = hexParse(input) || nameParse(input) || functionParse(input);
          }
          this._rgb = v2;
          this._valid = !!v2;
        }
        get valid() {
          return this._valid;
        }
        get rgb() {
          var v2 = clone(this._rgb);
          if (v2) {
            v2.a = b2n(v2.a);
          }
          return v2;
        }
        set rgb(obj) {
          this._rgb = fromObject(obj);
        }
        rgbString() {
          return this._valid ? rgbString(this._rgb) : void 0;
        }
        hexString() {
          return this._valid ? hexString(this._rgb) : void 0;
        }
        hslString() {
          return this._valid ? hslString(this._rgb) : void 0;
        }
        mix(color2, weight) {
          if (color2) {
            const c1 = this.rgb;
            const c22 = color2.rgb;
            let w2;
            const p3 = weight === w2 ? 0.5 : weight;
            const w3 = 2 * p3 - 1;
            const a3 = c1.a - c22.a;
            const w1 = ((w3 * a3 === -1 ? w3 : (w3 + a3) / (1 + w3 * a3)) + 1) / 2;
            w2 = 1 - w1;
            c1.r = 255 & w1 * c1.r + w2 * c22.r + 0.5;
            c1.g = 255 & w1 * c1.g + w2 * c22.g + 0.5;
            c1.b = 255 & w1 * c1.b + w2 * c22.b + 0.5;
            c1.a = p3 * c1.a + (1 - p3) * c22.a;
            this.rgb = c1;
          }
          return this;
        }
        interpolate(color2, t4) {
          if (color2) {
            this._rgb = interpolate(this._rgb, color2._rgb, t4);
          }
          return this;
        }
        clone() {
          return new _Color(this.rgb);
        }
        alpha(a3) {
          this._rgb.a = n2b(a3);
          return this;
        }
        clearer(ratio) {
          const rgb = this._rgb;
          rgb.a *= 1 - ratio;
          return this;
        }
        greyscale() {
          const rgb = this._rgb;
          const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
          rgb.r = rgb.g = rgb.b = val;
          return this;
        }
        opaquer(ratio) {
          const rgb = this._rgb;
          rgb.a *= 1 + ratio;
          return this;
        }
        negate() {
          const v2 = this._rgb;
          v2.r = 255 - v2.r;
          v2.g = 255 - v2.g;
          v2.b = 255 - v2.b;
          return this;
        }
        lighten(ratio) {
          modHSL(this._rgb, 2, ratio);
          return this;
        }
        darken(ratio) {
          modHSL(this._rgb, 2, -ratio);
          return this;
        }
        saturate(ratio) {
          modHSL(this._rgb, 1, ratio);
          return this;
        }
        desaturate(ratio) {
          modHSL(this._rgb, 1, -ratio);
          return this;
        }
        rotate(deg) {
          rotate(this._rgb, deg);
          return this;
        }
      };
    }
  });

  // node_modules/chart.js/dist/chunks/helpers.dataset.js
  function noop() {
  }
  function isNullOrUndef(value) {
    return value === null || value === void 0;
  }
  function isArray(value) {
    if (Array.isArray && Array.isArray(value)) {
      return true;
    }
    const type = Object.prototype.toString.call(value);
    if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
      return true;
    }
    return false;
  }
  function isObject(value) {
    return value !== null && Object.prototype.toString.call(value) === "[object Object]";
  }
  function isNumberFinite(value) {
    return (typeof value === "number" || value instanceof Number) && isFinite(+value);
  }
  function finiteOrDefault(value, defaultValue) {
    return isNumberFinite(value) ? value : defaultValue;
  }
  function valueOrDefault(value, defaultValue) {
    return typeof value === "undefined" ? defaultValue : value;
  }
  function callback(fn, args, thisArg) {
    if (fn && typeof fn.call === "function") {
      return fn.apply(thisArg, args);
    }
  }
  function each(loopable, fn, thisArg, reverse) {
    let i6, len, keys;
    if (isArray(loopable)) {
      len = loopable.length;
      if (reverse) {
        for (i6 = len - 1; i6 >= 0; i6--) {
          fn.call(thisArg, loopable[i6], i6);
        }
      } else {
        for (i6 = 0; i6 < len; i6++) {
          fn.call(thisArg, loopable[i6], i6);
        }
      }
    } else if (isObject(loopable)) {
      keys = Object.keys(loopable);
      len = keys.length;
      for (i6 = 0; i6 < len; i6++) {
        fn.call(thisArg, loopable[keys[i6]], keys[i6]);
      }
    }
  }
  function _elementsEqual(a0, a1) {
    let i6, ilen, v0, v1;
    if (!a0 || !a1 || a0.length !== a1.length) {
      return false;
    }
    for (i6 = 0, ilen = a0.length; i6 < ilen; ++i6) {
      v0 = a0[i6];
      v1 = a1[i6];
      if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
        return false;
      }
    }
    return true;
  }
  function clone2(source) {
    if (isArray(source)) {
      return source.map(clone2);
    }
    if (isObject(source)) {
      const target = /* @__PURE__ */ Object.create(null);
      const keys = Object.keys(source);
      const klen = keys.length;
      let k2 = 0;
      for (; k2 < klen; ++k2) {
        target[keys[k2]] = clone2(source[keys[k2]]);
      }
      return target;
    }
    return source;
  }
  function isValidKey(key) {
    return [
      "__proto__",
      "prototype",
      "constructor"
    ].indexOf(key) === -1;
  }
  function _merger(key, target, source, options) {
    if (!isValidKey(key)) {
      return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
      merge(tval, sval, options);
    } else {
      target[key] = clone2(sval);
    }
  }
  function merge(target, source, options) {
    const sources = isArray(source) ? source : [
      source
    ];
    const ilen = sources.length;
    if (!isObject(target)) {
      return target;
    }
    options = options || {};
    const merger = options.merger || _merger;
    let current;
    for (let i6 = 0; i6 < ilen; ++i6) {
      current = sources[i6];
      if (!isObject(current)) {
        continue;
      }
      const keys = Object.keys(current);
      for (let k2 = 0, klen = keys.length; k2 < klen; ++k2) {
        merger(keys[k2], target, current, options);
      }
    }
    return target;
  }
  function mergeIf(target, source) {
    return merge(target, source, {
      merger: _mergerIf
    });
  }
  function _mergerIf(key, target, source) {
    if (!isValidKey(key)) {
      return;
    }
    const tval = target[key];
    const sval = source[key];
    if (isObject(tval) && isObject(sval)) {
      mergeIf(tval, sval);
    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = clone2(sval);
    }
  }
  function _splitKey(key) {
    const parts = key.split(".");
    const keys = [];
    let tmp = "";
    for (const part of parts) {
      tmp += part;
      if (tmp.endsWith("\\")) {
        tmp = tmp.slice(0, -1) + ".";
      } else {
        keys.push(tmp);
        tmp = "";
      }
    }
    return keys;
  }
  function _getKeyResolver(key) {
    const keys = _splitKey(key);
    return (obj) => {
      for (const k2 of keys) {
        if (k2 === "") {
          break;
        }
        obj = obj && obj[k2];
      }
      return obj;
    };
  }
  function resolveObjectKey(obj, key) {
    const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
    return resolver(obj);
  }
  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function _isClickEvent(e7) {
    return e7.type === "mouseup" || e7.type === "click" || e7.type === "contextmenu";
  }
  function almostEquals(x2, y3, epsilon) {
    return Math.abs(x2 - y3) < epsilon;
  }
  function niceNum(range) {
    const roundedRange = Math.round(range);
    range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
    const niceRange = Math.pow(10, Math.floor(log10(range)));
    const fraction = range / niceRange;
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return niceFraction * niceRange;
  }
  function _factorize(value) {
    const result = [];
    const sqrt = Math.sqrt(value);
    let i6;
    for (i6 = 1; i6 < sqrt; i6++) {
      if (value % i6 === 0) {
        result.push(i6);
        result.push(value / i6);
      }
    }
    if (sqrt === (sqrt | 0)) {
      result.push(sqrt);
    }
    result.sort((a3, b3) => a3 - b3).pop();
    return result;
  }
  function isNonPrimitive(n5) {
    return typeof n5 === "symbol" || typeof n5 === "object" && n5 !== null && !(Symbol.toPrimitive in n5 || "toString" in n5 || "valueOf" in n5);
  }
  function isNumber(n5) {
    return !isNonPrimitive(n5) && !isNaN(parseFloat(n5)) && isFinite(n5);
  }
  function almostWhole(x2, epsilon) {
    const rounded = Math.round(x2);
    return rounded - epsilon <= x2 && rounded + epsilon >= x2;
  }
  function _setMinAndMaxByKey(array, target, property) {
    let i6, ilen, value;
    for (i6 = 0, ilen = array.length; i6 < ilen; i6++) {
      value = array[i6][property];
      if (!isNaN(value)) {
        target.min = Math.min(target.min, value);
        target.max = Math.max(target.max, value);
      }
    }
  }
  function toRadians(degrees) {
    return degrees * (PI / 180);
  }
  function toDegrees(radians) {
    return radians * (180 / PI);
  }
  function _decimalPlaces(x2) {
    if (!isNumberFinite(x2)) {
      return;
    }
    let e7 = 1;
    let p3 = 0;
    while (Math.round(x2 * e7) / e7 !== x2) {
      e7 *= 10;
      p3++;
    }
    return p3;
  }
  function getAngleFromPoint(centrePoint, anglePoint) {
    const distanceFromXCenter = anglePoint.x - centrePoint.x;
    const distanceFromYCenter = anglePoint.y - centrePoint.y;
    const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
    let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
    if (angle < -0.5 * PI) {
      angle += TAU;
    }
    return {
      angle,
      distance: radialDistanceFromCenter
    };
  }
  function distanceBetweenPoints(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  }
  function _angleDiff(a3, b3) {
    return (a3 - b3 + PITAU) % TAU - PI;
  }
  function _normalizeAngle(a3) {
    return (a3 % TAU + TAU) % TAU;
  }
  function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
    const a3 = _normalizeAngle(angle);
    const s4 = _normalizeAngle(start);
    const e7 = _normalizeAngle(end);
    const angleToStart = _normalizeAngle(s4 - a3);
    const angleToEnd = _normalizeAngle(e7 - a3);
    const startToAngle = _normalizeAngle(a3 - s4);
    const endToAngle = _normalizeAngle(a3 - e7);
    return a3 === s4 || a3 === e7 || sameAngleIsFullCircle && s4 === e7 || angleToStart > angleToEnd && startToAngle < endToAngle;
  }
  function _limitValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function _int16Range(value) {
    return _limitValue(value, -32768, 32767);
  }
  function _isBetween(value, start, end, epsilon = 1e-6) {
    return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
  }
  function _lookup(table, value, cmp) {
    cmp = cmp || ((index2) => table[index2] < value);
    let hi = table.length - 1;
    let lo = 0;
    let mid;
    while (hi - lo > 1) {
      mid = lo + hi >> 1;
      if (cmp(mid)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return {
      lo,
      hi
    };
  }
  function _filterBetween(values, min, max) {
    let start = 0;
    let end = values.length;
    while (start < end && values[start] < min) {
      start++;
    }
    while (end > start && values[end - 1] > max) {
      end--;
    }
    return start > 0 || end < values.length ? values.slice(start, end) : values;
  }
  function listenArrayEvents(array, listener) {
    if (array._chartjs) {
      array._chartjs.listeners.push(listener);
      return;
    }
    Object.defineProperty(array, "_chartjs", {
      configurable: true,
      enumerable: false,
      value: {
        listeners: [
          listener
        ]
      }
    });
    arrayEvents.forEach((key) => {
      const method = "_onData" + _capitalize(key);
      const base = array[key];
      Object.defineProperty(array, key, {
        configurable: true,
        enumerable: false,
        value(...args) {
          const res = base.apply(this, args);
          array._chartjs.listeners.forEach((object) => {
            if (typeof object[method] === "function") {
              object[method](...args);
            }
          });
          return res;
        }
      });
    });
  }
  function unlistenArrayEvents(array, listener) {
    const stub = array._chartjs;
    if (!stub) {
      return;
    }
    const listeners = stub.listeners;
    const index2 = listeners.indexOf(listener);
    if (index2 !== -1) {
      listeners.splice(index2, 1);
    }
    if (listeners.length > 0) {
      return;
    }
    arrayEvents.forEach((key) => {
      delete array[key];
    });
    delete array._chartjs;
  }
  function _arrayUnique(items) {
    const set2 = new Set(items);
    if (set2.size === items.length) {
      return items;
    }
    return Array.from(set2);
  }
  function throttled(fn, thisArg) {
    let argsToUse = [];
    let ticking = false;
    return function(...args) {
      argsToUse = args;
      if (!ticking) {
        ticking = true;
        requestAnimFrame.call(window, () => {
          ticking = false;
          fn.apply(thisArg, argsToUse);
        });
      }
    };
  }
  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      if (delay) {
        clearTimeout(timeout);
        timeout = setTimeout(fn, delay, args);
      } else {
        fn.apply(this, args);
      }
      return delay;
    };
  }
  function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
    const pointCount = points.length;
    let start = 0;
    let count = pointCount;
    if (meta._sorted) {
      const { iScale, vScale, _parsed } = meta;
      const spanGaps = meta.dataset ? meta.dataset.options ? meta.dataset.options.spanGaps : null : null;
      const axis = iScale.axis;
      const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
      if (minDefined) {
        start = Math.min(
          // @ts-expect-error Need to type _parsed
          _lookupByKey(_parsed, axis, min).lo,
          // @ts-expect-error Need to fix types on _lookupByKey
          animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo
        );
        if (spanGaps) {
          const distanceToDefinedLo = _parsed.slice(0, start + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
          start -= Math.max(0, distanceToDefinedLo);
        }
        start = _limitValue(start, 0, pointCount - 1);
      }
      if (maxDefined) {
        let end = Math.max(
          // @ts-expect-error Need to type _parsed
          _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
          // @ts-expect-error Need to fix types on _lookupByKey
          animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1
        );
        if (spanGaps) {
          const distanceToDefinedHi = _parsed.slice(end - 1).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
          end += Math.max(0, distanceToDefinedHi);
        }
        count = _limitValue(end, start, pointCount) - start;
      } else {
        count = pointCount - start;
      }
    }
    return {
      start,
      count
    };
  }
  function _scaleRangesChanged(meta) {
    const { xScale, yScale, _scaleRanges } = meta;
    const newRanges = {
      xmin: xScale.min,
      xmax: xScale.max,
      ymin: yScale.min,
      ymax: yScale.max
    };
    if (!_scaleRanges) {
      meta._scaleRanges = newRanges;
      return true;
    }
    const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
    Object.assign(_scaleRanges, newRanges);
    return changed;
  }
  function isPatternOrGradient(value) {
    if (value && typeof value === "object") {
      const type = value.toString();
      return type === "[object CanvasPattern]" || type === "[object CanvasGradient]";
    }
    return false;
  }
  function color(value) {
    return isPatternOrGradient(value) ? value : new Color(value);
  }
  function getHoverColor(value) {
    return isPatternOrGradient(value) ? value : new Color(value).saturate(0.5).darken(0.1).hexString();
  }
  function applyAnimationsDefaults(defaults2) {
    defaults2.set("animation", {
      delay: void 0,
      duration: 1e3,
      easing: "easeOutQuart",
      fn: void 0,
      from: void 0,
      loop: void 0,
      to: void 0,
      type: void 0
    });
    defaults2.describe("animation", {
      _fallback: false,
      _indexable: false,
      _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
    });
    defaults2.set("animations", {
      colors: {
        type: "color",
        properties: colors
      },
      numbers: {
        type: "number",
        properties: numbers
      }
    });
    defaults2.describe("animations", {
      _fallback: "animation"
    });
    defaults2.set("transitions", {
      active: {
        animation: {
          duration: 400
        }
      },
      resize: {
        animation: {
          duration: 0
        }
      },
      show: {
        animations: {
          colors: {
            from: "transparent"
          },
          visible: {
            type: "boolean",
            duration: 0
          }
        }
      },
      hide: {
        animations: {
          colors: {
            to: "transparent"
          },
          visible: {
            type: "boolean",
            easing: "linear",
            fn: (v2) => v2 | 0
          }
        }
      }
    });
  }
  function applyLayoutsDefaults(defaults2) {
    defaults2.set("layout", {
      autoPadding: true,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
  }
  function getNumberFormat(locale, options) {
    options = options || {};
    const cacheKey = locale + JSON.stringify(options);
    let formatter = intlCache.get(cacheKey);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, options);
      intlCache.set(cacheKey, formatter);
    }
    return formatter;
  }
  function formatNumber2(num, locale, options) {
    return getNumberFormat(locale, options).format(num);
  }
  function calculateDelta(tickValue, ticks) {
    let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
    if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
      delta = tickValue - Math.floor(tickValue);
    }
    return delta;
  }
  function applyScaleDefaults(defaults2) {
    defaults2.set("scale", {
      display: true,
      offset: false,
      reverse: false,
      beginAtZero: false,
      bounds: "ticks",
      clip: true,
      grace: 0,
      grid: {
        display: true,
        lineWidth: 1,
        drawOnChartArea: true,
        drawTicks: true,
        tickLength: 8,
        tickWidth: (_ctx, options) => options.lineWidth,
        tickColor: (_ctx, options) => options.color,
        offset: false
      },
      border: {
        display: true,
        dash: [],
        dashOffset: 0,
        width: 1
      },
      title: {
        display: false,
        text: "",
        padding: {
          top: 4,
          bottom: 4
        }
      },
      ticks: {
        minRotation: 0,
        maxRotation: 50,
        mirror: false,
        textStrokeWidth: 0,
        textStrokeColor: "",
        padding: 3,
        display: true,
        autoSkip: true,
        autoSkipPadding: 3,
        labelOffset: 0,
        callback: Ticks.formatters.values,
        minor: {},
        major: {},
        align: "center",
        crossAlign: "near",
        showLabelBackdrop: false,
        backdropColor: "rgba(255, 255, 255, 0.75)",
        backdropPadding: 2
      }
    });
    defaults2.route("scale.ticks", "color", "", "color");
    defaults2.route("scale.grid", "color", "", "borderColor");
    defaults2.route("scale.border", "color", "", "borderColor");
    defaults2.route("scale.title", "color", "", "color");
    defaults2.describe("scale", {
      _fallback: false,
      _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
      _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash" && name !== "dash"
    });
    defaults2.describe("scales", {
      _fallback: "scale"
    });
    defaults2.describe("scale.ticks", {
      _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
      _indexable: (name) => name !== "backdropPadding"
    });
  }
  function getScope$1(node, key) {
    if (!key) {
      return node;
    }
    const keys = key.split(".");
    for (let i6 = 0, n5 = keys.length; i6 < n5; ++i6) {
      const k2 = keys[i6];
      node = node[k2] || (node[k2] = /* @__PURE__ */ Object.create(null));
    }
    return node;
  }
  function set(root, scope, values) {
    if (typeof scope === "string") {
      return merge(getScope$1(root, scope), values);
    }
    return merge(getScope$1(root, ""), scope);
  }
  function toFontString(font) {
    if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
      return null;
    }
    return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
  }
  function _measureText(ctx, data, gc, longest, string) {
    let textWidth = data[string];
    if (!textWidth) {
      textWidth = data[string] = ctx.measureText(string).width;
      gc.push(string);
    }
    if (textWidth > longest) {
      longest = textWidth;
    }
    return longest;
  }
  function _longestText(ctx, font, arrayOfThings, cache) {
    cache = cache || {};
    let data = cache.data = cache.data || {};
    let gc = cache.garbageCollect = cache.garbageCollect || [];
    if (cache.font !== font) {
      data = cache.data = {};
      gc = cache.garbageCollect = [];
      cache.font = font;
    }
    ctx.save();
    ctx.font = font;
    let longest = 0;
    const ilen = arrayOfThings.length;
    let i6, j, jlen, thing, nestedThing;
    for (i6 = 0; i6 < ilen; i6++) {
      thing = arrayOfThings[i6];
      if (thing !== void 0 && thing !== null && !isArray(thing)) {
        longest = _measureText(ctx, data, gc, longest, thing);
      } else if (isArray(thing)) {
        for (j = 0, jlen = thing.length; j < jlen; j++) {
          nestedThing = thing[j];
          if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
            longest = _measureText(ctx, data, gc, longest, nestedThing);
          }
        }
      }
    }
    ctx.restore();
    const gcLen = gc.length / 2;
    if (gcLen > arrayOfThings.length) {
      for (i6 = 0; i6 < gcLen; i6++) {
        delete data[gc[i6]];
      }
      gc.splice(0, gcLen);
    }
    return longest;
  }
  function _alignPixel(chart2, pixel, width) {
    const devicePixelRatio = chart2.currentDevicePixelRatio;
    const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
    return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
  }
  function clearCanvas(canvas, ctx) {
    if (!ctx && !canvas) {
      return;
    }
    ctx = ctx || canvas.getContext("2d");
    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  function drawPoint(ctx, options, x2, y3) {
    drawPointLegend(ctx, options, x2, y3, null);
  }
  function drawPointLegend(ctx, options, x2, y3, w2) {
    let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
    const style = options.pointStyle;
    const rotation = options.rotation;
    const radius = options.radius;
    let rad = (rotation || 0) * RAD_PER_DEG;
    if (style && typeof style === "object") {
      type = style.toString();
      if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
        ctx.save();
        ctx.translate(x2, y3);
        ctx.rotate(rad);
        ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
        ctx.restore();
        return;
      }
    }
    if (isNaN(radius) || radius <= 0) {
      return;
    }
    ctx.beginPath();
    switch (style) {
      // Default includes circle
      default:
        if (w2) {
          ctx.ellipse(x2, y3, w2 / 2, radius, 0, 0, TAU);
        } else {
          ctx.arc(x2, y3, radius, 0, TAU);
        }
        ctx.closePath();
        break;
      case "triangle":
        width = w2 ? w2 / 2 : radius;
        ctx.moveTo(x2 + Math.sin(rad) * width, y3 - Math.cos(rad) * radius);
        rad += TWO_THIRDS_PI;
        ctx.lineTo(x2 + Math.sin(rad) * width, y3 - Math.cos(rad) * radius);
        rad += TWO_THIRDS_PI;
        ctx.lineTo(x2 + Math.sin(rad) * width, y3 - Math.cos(rad) * radius);
        ctx.closePath();
        break;
      case "rectRounded":
        cornerRadius = radius * 0.516;
        size = radius - cornerRadius;
        xOffset = Math.cos(rad + QUARTER_PI) * size;
        xOffsetW = Math.cos(rad + QUARTER_PI) * (w2 ? w2 / 2 - cornerRadius : size);
        yOffset = Math.sin(rad + QUARTER_PI) * size;
        yOffsetW = Math.sin(rad + QUARTER_PI) * (w2 ? w2 / 2 - cornerRadius : size);
        ctx.arc(x2 - xOffsetW, y3 - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
        ctx.arc(x2 + yOffsetW, y3 - xOffset, cornerRadius, rad - HALF_PI, rad);
        ctx.arc(x2 + xOffsetW, y3 + yOffset, cornerRadius, rad, rad + HALF_PI);
        ctx.arc(x2 - yOffsetW, y3 + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
        ctx.closePath();
        break;
      case "rect":
        if (!rotation) {
          size = Math.SQRT1_2 * radius;
          width = w2 ? w2 / 2 : size;
          ctx.rect(x2 - width, y3 - size, 2 * width, 2 * size);
          break;
        }
        rad += QUARTER_PI;
      /* falls through */
      case "rectRot":
        xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
        xOffset = Math.cos(rad) * radius;
        yOffset = Math.sin(rad) * radius;
        yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
        ctx.moveTo(x2 - xOffsetW, y3 - yOffset);
        ctx.lineTo(x2 + yOffsetW, y3 - xOffset);
        ctx.lineTo(x2 + xOffsetW, y3 + yOffset);
        ctx.lineTo(x2 - yOffsetW, y3 + xOffset);
        ctx.closePath();
        break;
      case "crossRot":
        rad += QUARTER_PI;
      /* falls through */
      case "cross":
        xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
        xOffset = Math.cos(rad) * radius;
        yOffset = Math.sin(rad) * radius;
        yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
        ctx.moveTo(x2 - xOffsetW, y3 - yOffset);
        ctx.lineTo(x2 + xOffsetW, y3 + yOffset);
        ctx.moveTo(x2 + yOffsetW, y3 - xOffset);
        ctx.lineTo(x2 - yOffsetW, y3 + xOffset);
        break;
      case "star":
        xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
        xOffset = Math.cos(rad) * radius;
        yOffset = Math.sin(rad) * radius;
        yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
        ctx.moveTo(x2 - xOffsetW, y3 - yOffset);
        ctx.lineTo(x2 + xOffsetW, y3 + yOffset);
        ctx.moveTo(x2 + yOffsetW, y3 - xOffset);
        ctx.lineTo(x2 - yOffsetW, y3 + xOffset);
        rad += QUARTER_PI;
        xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
        xOffset = Math.cos(rad) * radius;
        yOffset = Math.sin(rad) * radius;
        yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
        ctx.moveTo(x2 - xOffsetW, y3 - yOffset);
        ctx.lineTo(x2 + xOffsetW, y3 + yOffset);
        ctx.moveTo(x2 + yOffsetW, y3 - xOffset);
        ctx.lineTo(x2 - yOffsetW, y3 + xOffset);
        break;
      case "line":
        xOffset = w2 ? w2 / 2 : Math.cos(rad) * radius;
        yOffset = Math.sin(rad) * radius;
        ctx.moveTo(x2 - xOffset, y3 - yOffset);
        ctx.lineTo(x2 + xOffset, y3 + yOffset);
        break;
      case "dash":
        ctx.moveTo(x2, y3);
        ctx.lineTo(x2 + Math.cos(rad) * (w2 ? w2 / 2 : radius), y3 + Math.sin(rad) * radius);
        break;
      case false:
        ctx.closePath();
        break;
    }
    ctx.fill();
    if (options.borderWidth > 0) {
      ctx.stroke();
    }
  }
  function _isPointInArea(point, area, margin) {
    margin = margin || 0.5;
    return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
  }
  function clipArea(ctx, area) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
    ctx.clip();
  }
  function unclipArea(ctx) {
    ctx.restore();
  }
  function _steppedLineTo(ctx, previous, target, flip, mode) {
    if (!previous) {
      return ctx.lineTo(target.x, target.y);
    }
    if (mode === "middle") {
      const midpoint = (previous.x + target.x) / 2;
      ctx.lineTo(midpoint, previous.y);
      ctx.lineTo(midpoint, target.y);
    } else if (mode === "after" !== !!flip) {
      ctx.lineTo(previous.x, target.y);
    } else {
      ctx.lineTo(target.x, previous.y);
    }
    ctx.lineTo(target.x, target.y);
  }
  function _bezierCurveTo(ctx, previous, target, flip) {
    if (!previous) {
      return ctx.lineTo(target.x, target.y);
    }
    ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
  }
  function setRenderOpts(ctx, opts) {
    if (opts.translation) {
      ctx.translate(opts.translation[0], opts.translation[1]);
    }
    if (!isNullOrUndef(opts.rotation)) {
      ctx.rotate(opts.rotation);
    }
    if (opts.color) {
      ctx.fillStyle = opts.color;
    }
    if (opts.textAlign) {
      ctx.textAlign = opts.textAlign;
    }
    if (opts.textBaseline) {
      ctx.textBaseline = opts.textBaseline;
    }
  }
  function decorateText(ctx, x2, y3, line, opts) {
    if (opts.strikethrough || opts.underline) {
      const metrics = ctx.measureText(line);
      const left = x2 - metrics.actualBoundingBoxLeft;
      const right = x2 + metrics.actualBoundingBoxRight;
      const top = y3 - metrics.actualBoundingBoxAscent;
      const bottom = y3 + metrics.actualBoundingBoxDescent;
      const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      ctx.lineWidth = opts.decorationWidth || 2;
      ctx.moveTo(left, yDecoration);
      ctx.lineTo(right, yDecoration);
      ctx.stroke();
    }
  }
  function drawBackdrop(ctx, opts) {
    const oldColor = ctx.fillStyle;
    ctx.fillStyle = opts.color;
    ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
    ctx.fillStyle = oldColor;
  }
  function renderText(ctx, text, x2, y3, font, opts = {}) {
    const lines = isArray(text) ? text : [
      text
    ];
    const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
    let i6, line;
    ctx.save();
    ctx.font = font.string;
    setRenderOpts(ctx, opts);
    for (i6 = 0; i6 < lines.length; ++i6) {
      line = lines[i6];
      if (opts.backdrop) {
        drawBackdrop(ctx, opts.backdrop);
      }
      if (stroke) {
        if (opts.strokeColor) {
          ctx.strokeStyle = opts.strokeColor;
        }
        if (!isNullOrUndef(opts.strokeWidth)) {
          ctx.lineWidth = opts.strokeWidth;
        }
        ctx.strokeText(line, x2, y3, opts.maxWidth);
      }
      ctx.fillText(line, x2, y3, opts.maxWidth);
      decorateText(ctx, x2, y3, line, opts);
      y3 += Number(font.lineHeight);
    }
    ctx.restore();
  }
  function addRoundedRectPath(ctx, rect) {
    const { x: x2, y: y3, w: w2, h: h4, radius } = rect;
    ctx.arc(x2 + radius.topLeft, y3 + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
    ctx.lineTo(x2, y3 + h4 - radius.bottomLeft);
    ctx.arc(x2 + radius.bottomLeft, y3 + h4 - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
    ctx.lineTo(x2 + w2 - radius.bottomRight, y3 + h4);
    ctx.arc(x2 + w2 - radius.bottomRight, y3 + h4 - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
    ctx.lineTo(x2 + w2, y3 + radius.topRight);
    ctx.arc(x2 + w2 - radius.topRight, y3 + radius.topRight, radius.topRight, 0, -HALF_PI, true);
    ctx.lineTo(x2 + radius.topLeft, y3);
  }
  function toLineHeight(value, size) {
    const matches = ("" + value).match(LINE_HEIGHT);
    if (!matches || matches[1] === "normal") {
      return size * 1.2;
    }
    value = +matches[2];
    switch (matches[3]) {
      case "px":
        return value;
      case "%":
        value /= 100;
        break;
    }
    return size * value;
  }
  function _readValueToProps(value, props) {
    const ret = {};
    const objProps = isObject(props);
    const keys = objProps ? Object.keys(props) : props;
    const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
    for (const prop of keys) {
      ret[prop] = numberOrZero(read(prop));
    }
    return ret;
  }
  function toTRBL(value) {
    return _readValueToProps(value, {
      top: "y",
      right: "x",
      bottom: "y",
      left: "x"
    });
  }
  function toTRBLCorners(value) {
    return _readValueToProps(value, [
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight"
    ]);
  }
  function toPadding(value) {
    const obj = toTRBL(value);
    obj.width = obj.left + obj.right;
    obj.height = obj.top + obj.bottom;
    return obj;
  }
  function toFont(options, fallback) {
    options = options || {};
    fallback = fallback || defaults.font;
    let size = valueOrDefault(options.size, fallback.size);
    if (typeof size === "string") {
      size = parseInt(size, 10);
    }
    let style = valueOrDefault(options.style, fallback.style);
    if (style && !("" + style).match(FONT_STYLE)) {
      console.warn('Invalid font style specified: "' + style + '"');
      style = void 0;
    }
    const font = {
      family: valueOrDefault(options.family, fallback.family),
      lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
      size,
      style,
      weight: valueOrDefault(options.weight, fallback.weight),
      string: ""
    };
    font.string = toFontString(font);
    return font;
  }
  function resolve(inputs, context, index2, info) {
    let cacheable = true;
    let i6, ilen, value;
    for (i6 = 0, ilen = inputs.length; i6 < ilen; ++i6) {
      value = inputs[i6];
      if (value === void 0) {
        continue;
      }
      if (context !== void 0 && typeof value === "function") {
        value = value(context);
        cacheable = false;
      }
      if (index2 !== void 0 && isArray(value)) {
        value = value[index2 % value.length];
        cacheable = false;
      }
      if (value !== void 0) {
        if (info && !cacheable) {
          info.cacheable = false;
        }
        return value;
      }
    }
  }
  function _addGrace(minmax, grace, beginAtZero) {
    const { min, max } = minmax;
    const change = toDimension(grace, (max - min) / 2);
    const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add;
    return {
      min: keepZero(min, -Math.abs(change)),
      max: keepZero(max, change)
    };
  }
  function createContext(parentContext, context) {
    return Object.assign(Object.create(parentContext), context);
  }
  function _createResolver(scopes, prefixes = [
    ""
  ], rootScopes, fallback, getTarget = () => scopes[0]) {
    const finalRootScopes = rootScopes || scopes;
    if (typeof fallback === "undefined") {
      fallback = _resolve("_fallback", scopes);
    }
    const cache = {
      [Symbol.toStringTag]: "Object",
      _cacheable: true,
      _scopes: scopes,
      _rootScopes: finalRootScopes,
      _fallback: fallback,
      _getTarget: getTarget,
      override: (scope) => _createResolver([
        scope,
        ...scopes
      ], prefixes, finalRootScopes, fallback)
    };
    return new Proxy(cache, {
      /**
      * A trap for the delete operator.
      */
      deleteProperty(target, prop) {
        delete target[prop];
        delete target._keys;
        delete scopes[0][prop];
        return true;
      },
      /**
      * A trap for getting property values.
      */
      get(target, prop) {
        return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target));
      },
      /**
      * A trap for Object.getOwnPropertyDescriptor.
      * Also used by Object.hasOwnProperty.
      */
      getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
      },
      /**
      * A trap for Object.getPrototypeOf.
      */
      getPrototypeOf() {
        return Reflect.getPrototypeOf(scopes[0]);
      },
      /**
      * A trap for the in operator.
      */
      has(target, prop) {
        return getKeysFromAllScopes(target).includes(prop);
      },
      /**
      * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
      */
      ownKeys(target) {
        return getKeysFromAllScopes(target);
      },
      /**
      * A trap for setting property values.
      */
      set(target, prop, value) {
        const storage = target._storage || (target._storage = getTarget());
        target[prop] = storage[prop] = value;
        delete target._keys;
        return true;
      }
    });
  }
  function _attachContext(proxy, context, subProxy, descriptorDefaults) {
    const cache = {
      _cacheable: false,
      _proxy: proxy,
      _context: context,
      _subProxy: subProxy,
      _stack: /* @__PURE__ */ new Set(),
      _descriptors: _descriptors(proxy, descriptorDefaults),
      setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
      override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
    };
    return new Proxy(cache, {
      /**
      * A trap for the delete operator.
      */
      deleteProperty(target, prop) {
        delete target[prop];
        delete proxy[prop];
        return true;
      },
      /**
      * A trap for getting property values.
      */
      get(target, prop, receiver) {
        return _cached(target, prop, () => _resolveWithContext(target, prop, receiver));
      },
      /**
      * A trap for Object.getOwnPropertyDescriptor.
      * Also used by Object.hasOwnProperty.
      */
      getOwnPropertyDescriptor(target, prop) {
        return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
          enumerable: true,
          configurable: true
        } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
      },
      /**
      * A trap for Object.getPrototypeOf.
      */
      getPrototypeOf() {
        return Reflect.getPrototypeOf(proxy);
      },
      /**
      * A trap for the in operator.
      */
      has(target, prop) {
        return Reflect.has(proxy, prop);
      },
      /**
      * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
      */
      ownKeys() {
        return Reflect.ownKeys(proxy);
      },
      /**
      * A trap for setting property values.
      */
      set(target, prop, value) {
        proxy[prop] = value;
        delete target[prop];
        return true;
      }
    });
  }
  function _descriptors(proxy, defaults2 = {
    scriptable: true,
    indexable: true
  }) {
    const { _scriptable = defaults2.scriptable, _indexable = defaults2.indexable, _allKeys = defaults2.allKeys } = proxy;
    return {
      allKeys: _allKeys,
      scriptable: _scriptable,
      indexable: _indexable,
      isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
      isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
    };
  }
  function _cached(target, prop, resolve2) {
    if (Object.prototype.hasOwnProperty.call(target, prop) || prop === "constructor") {
      return target[prop];
    }
    const value = resolve2();
    target[prop] = value;
    return value;
  }
  function _resolveWithContext(target, prop, receiver) {
    const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
    let value = _proxy[prop];
    if (isFunction(value) && descriptors2.isScriptable(prop)) {
      value = _resolveScriptable(prop, value, target, receiver);
    }
    if (isArray(value) && value.length) {
      value = _resolveArray(prop, value, target, descriptors2.isIndexable);
    }
    if (needsSubResolver(prop, value)) {
      value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
    }
    return value;
  }
  function _resolveScriptable(prop, getValue, target, receiver) {
    const { _proxy, _context, _subProxy, _stack } = target;
    if (_stack.has(prop)) {
      throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
    }
    _stack.add(prop);
    let value = getValue(_context, _subProxy || receiver);
    _stack.delete(prop);
    if (needsSubResolver(prop, value)) {
      value = createSubResolver(_proxy._scopes, _proxy, prop, value);
    }
    return value;
  }
  function _resolveArray(prop, value, target, isIndexable) {
    const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
    if (typeof _context.index !== "undefined" && isIndexable(prop)) {
      return value[_context.index % value.length];
    } else if (isObject(value[0])) {
      const arr = value;
      const scopes = _proxy._scopes.filter((s4) => s4 !== arr);
      value = [];
      for (const item of arr) {
        const resolver = createSubResolver(scopes, _proxy, prop, item);
        value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
      }
    }
    return value;
  }
  function resolveFallback(fallback, prop, value) {
    return isFunction(fallback) ? fallback(prop, value) : fallback;
  }
  function addScopes(set2, parentScopes, key, parentFallback, value) {
    for (const parent of parentScopes) {
      const scope = getScope(key, parent);
      if (scope) {
        set2.add(scope);
        const fallback = resolveFallback(scope._fallback, key, value);
        if (typeof fallback !== "undefined" && fallback !== key && fallback !== parentFallback) {
          return fallback;
        }
      } else if (scope === false && typeof parentFallback !== "undefined" && key !== parentFallback) {
        return null;
      }
    }
    return false;
  }
  function createSubResolver(parentScopes, resolver, prop, value) {
    const rootScopes = resolver._rootScopes;
    const fallback = resolveFallback(resolver._fallback, prop, value);
    const allScopes = [
      ...parentScopes,
      ...rootScopes
    ];
    const set2 = /* @__PURE__ */ new Set();
    set2.add(value);
    let key = addScopesFromKey(set2, allScopes, prop, fallback || prop, value);
    if (key === null) {
      return false;
    }
    if (typeof fallback !== "undefined" && fallback !== prop) {
      key = addScopesFromKey(set2, allScopes, fallback, key, value);
      if (key === null) {
        return false;
      }
    }
    return _createResolver(Array.from(set2), [
      ""
    ], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
  }
  function addScopesFromKey(set2, allScopes, key, fallback, item) {
    while (key) {
      key = addScopes(set2, allScopes, key, fallback, item);
    }
    return key;
  }
  function subGetTarget(resolver, prop, value) {
    const parent = resolver._getTarget();
    if (!(prop in parent)) {
      parent[prop] = {};
    }
    const target = parent[prop];
    if (isArray(target) && isObject(value)) {
      return value;
    }
    return target || {};
  }
  function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
    let value;
    for (const prefix of prefixes) {
      value = _resolve(readKey(prefix, prop), scopes);
      if (typeof value !== "undefined") {
        return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
      }
    }
  }
  function _resolve(key, scopes) {
    for (const scope of scopes) {
      if (!scope) {
        continue;
      }
      const value = scope[key];
      if (typeof value !== "undefined") {
        return value;
      }
    }
  }
  function getKeysFromAllScopes(target) {
    let keys = target._keys;
    if (!keys) {
      keys = target._keys = resolveKeysFromAllScopes(target._scopes);
    }
    return keys;
  }
  function resolveKeysFromAllScopes(scopes) {
    const set2 = /* @__PURE__ */ new Set();
    for (const scope of scopes) {
      for (const key of Object.keys(scope).filter((k2) => !k2.startsWith("_"))) {
        set2.add(key);
      }
    }
    return Array.from(set2);
  }
  function _parseObjectDataRadialScale(meta, data, start, count) {
    const { iScale } = meta;
    const { key = "r" } = this._parsing;
    const parsed = new Array(count);
    let i6, ilen, index2, item;
    for (i6 = 0, ilen = count; i6 < ilen; ++i6) {
      index2 = i6 + start;
      item = data[index2];
      parsed[i6] = {
        r: iScale.parse(resolveObjectKey(item, key), index2)
      };
    }
    return parsed;
  }
  function splineCurve(firstPoint, middlePoint, afterPoint, t4) {
    const previous = firstPoint.skip ? middlePoint : firstPoint;
    const current = middlePoint;
    const next = afterPoint.skip ? middlePoint : afterPoint;
    const d01 = distanceBetweenPoints(current, previous);
    const d12 = distanceBetweenPoints(next, current);
    let s01 = d01 / (d01 + d12);
    let s12 = d12 / (d01 + d12);
    s01 = isNaN(s01) ? 0 : s01;
    s12 = isNaN(s12) ? 0 : s12;
    const fa = t4 * s01;
    const fb = t4 * s12;
    return {
      previous: {
        x: current.x - fa * (next.x - previous.x),
        y: current.y - fa * (next.y - previous.y)
      },
      next: {
        x: current.x + fb * (next.x - previous.x),
        y: current.y + fb * (next.y - previous.y)
      }
    };
  }
  function monotoneAdjust(points, deltaK, mK) {
    const pointsLen = points.length;
    let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for (let i6 = 0; i6 < pointsLen - 1; ++i6) {
      pointCurrent = pointAfter;
      pointAfter = getPoint(points, i6 + 1);
      if (!pointCurrent || !pointAfter) {
        continue;
      }
      if (almostEquals(deltaK[i6], 0, EPSILON)) {
        mK[i6] = mK[i6 + 1] = 0;
        continue;
      }
      alphaK = mK[i6] / deltaK[i6];
      betaK = mK[i6 + 1] / deltaK[i6];
      squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
      if (squaredMagnitude <= 9) {
        continue;
      }
      tauK = 3 / Math.sqrt(squaredMagnitude);
      mK[i6] = alphaK * tauK * deltaK[i6];
      mK[i6 + 1] = betaK * tauK * deltaK[i6];
    }
  }
  function monotoneCompute(points, mK, indexAxis = "x") {
    const valueAxis = getValueAxis(indexAxis);
    const pointsLen = points.length;
    let delta, pointBefore, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for (let i6 = 0; i6 < pointsLen; ++i6) {
      pointBefore = pointCurrent;
      pointCurrent = pointAfter;
      pointAfter = getPoint(points, i6 + 1);
      if (!pointCurrent) {
        continue;
      }
      const iPixel = pointCurrent[indexAxis];
      const vPixel = pointCurrent[valueAxis];
      if (pointBefore) {
        delta = (iPixel - pointBefore[indexAxis]) / 3;
        pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
        pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i6];
      }
      if (pointAfter) {
        delta = (pointAfter[indexAxis] - iPixel) / 3;
        pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
        pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i6];
      }
    }
  }
  function splineCurveMonotone(points, indexAxis = "x") {
    const valueAxis = getValueAxis(indexAxis);
    const pointsLen = points.length;
    const deltaK = Array(pointsLen).fill(0);
    const mK = Array(pointsLen);
    let i6, pointBefore, pointCurrent;
    let pointAfter = getPoint(points, 0);
    for (i6 = 0; i6 < pointsLen; ++i6) {
      pointBefore = pointCurrent;
      pointCurrent = pointAfter;
      pointAfter = getPoint(points, i6 + 1);
      if (!pointCurrent) {
        continue;
      }
      if (pointAfter) {
        const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
        deltaK[i6] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
      }
      mK[i6] = !pointBefore ? deltaK[i6] : !pointAfter ? deltaK[i6 - 1] : sign(deltaK[i6 - 1]) !== sign(deltaK[i6]) ? 0 : (deltaK[i6 - 1] + deltaK[i6]) / 2;
    }
    monotoneAdjust(points, deltaK, mK);
    monotoneCompute(points, mK, indexAxis);
  }
  function capControlPoint(pt, min, max) {
    return Math.max(Math.min(pt, max), min);
  }
  function capBezierPoints(points, area) {
    let i6, ilen, point, inArea, inAreaPrev;
    let inAreaNext = _isPointInArea(points[0], area);
    for (i6 = 0, ilen = points.length; i6 < ilen; ++i6) {
      inAreaPrev = inArea;
      inArea = inAreaNext;
      inAreaNext = i6 < ilen - 1 && _isPointInArea(points[i6 + 1], area);
      if (!inArea) {
        continue;
      }
      point = points[i6];
      if (inAreaPrev) {
        point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
        point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
      }
      if (inAreaNext) {
        point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
        point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
      }
    }
  }
  function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
    let i6, ilen, point, controlPoints;
    if (options.spanGaps) {
      points = points.filter((pt) => !pt.skip);
    }
    if (options.cubicInterpolationMode === "monotone") {
      splineCurveMonotone(points, indexAxis);
    } else {
      let prev = loop ? points[points.length - 1] : points[0];
      for (i6 = 0, ilen = points.length; i6 < ilen; ++i6) {
        point = points[i6];
        controlPoints = splineCurve(prev, point, points[Math.min(i6 + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
        point.cp1x = controlPoints.previous.x;
        point.cp1y = controlPoints.previous.y;
        point.cp2x = controlPoints.next.x;
        point.cp2y = controlPoints.next.y;
        prev = point;
      }
    }
    if (options.capBezierPoints) {
      capBezierPoints(points, area);
    }
  }
  function _isDomSupported() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }
  function _getParentNode(domNode) {
    let parent = domNode.parentNode;
    if (parent && parent.toString() === "[object ShadowRoot]") {
      parent = parent.host;
    }
    return parent;
  }
  function parseMaxStyle(styleValue, node, parentProperty) {
    let valueInPixels;
    if (typeof styleValue === "string") {
      valueInPixels = parseInt(styleValue, 10);
      if (styleValue.indexOf("%") !== -1) {
        valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
      }
    } else {
      valueInPixels = styleValue;
    }
    return valueInPixels;
  }
  function getStyle(el2, property) {
    return getComputedStyle2(el2).getPropertyValue(property);
  }
  function getPositionedStyle(styles3, style, suffix) {
    const result = {};
    suffix = suffix ? "-" + suffix : "";
    for (let i6 = 0; i6 < 4; i6++) {
      const pos = positions[i6];
      result[pos] = parseFloat(styles3[style + "-" + pos + suffix]) || 0;
    }
    result.width = result.left + result.right;
    result.height = result.top + result.bottom;
    return result;
  }
  function getCanvasPosition(e7, canvas) {
    const touches = e7.touches;
    const source = touches && touches.length ? touches[0] : e7;
    const { offsetX, offsetY } = source;
    let box = false;
    let x2, y3;
    if (useOffsetPos(offsetX, offsetY, e7.target)) {
      x2 = offsetX;
      y3 = offsetY;
    } else {
      const rect = canvas.getBoundingClientRect();
      x2 = source.clientX - rect.left;
      y3 = source.clientY - rect.top;
      box = true;
    }
    return {
      x: x2,
      y: y3,
      box
    };
  }
  function getRelativePosition(event, chart2) {
    if ("native" in event) {
      return event;
    }
    const { canvas, currentDevicePixelRatio } = chart2;
    const style = getComputedStyle2(canvas);
    const borderBox = style.boxSizing === "border-box";
    const paddings = getPositionedStyle(style, "padding");
    const borders = getPositionedStyle(style, "border", "width");
    const { x: x2, y: y3, box } = getCanvasPosition(event, canvas);
    const xOffset = paddings.left + (box && borders.left);
    const yOffset = paddings.top + (box && borders.top);
    let { width, height } = chart2;
    if (borderBox) {
      width -= paddings.width + borders.width;
      height -= paddings.height + borders.height;
    }
    return {
      x: Math.round((x2 - xOffset) / width * canvas.width / currentDevicePixelRatio),
      y: Math.round((y3 - yOffset) / height * canvas.height / currentDevicePixelRatio)
    };
  }
  function getContainerSize(canvas, width, height) {
    let maxWidth, maxHeight;
    if (width === void 0 || height === void 0) {
      const container = canvas && _getParentNode(canvas);
      if (!container) {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
      } else {
        const rect = container.getBoundingClientRect();
        const containerStyle = getComputedStyle2(container);
        const containerBorder = getPositionedStyle(containerStyle, "border", "width");
        const containerPadding = getPositionedStyle(containerStyle, "padding");
        width = rect.width - containerPadding.width - containerBorder.width;
        height = rect.height - containerPadding.height - containerBorder.height;
        maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
        maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
      }
    }
    return {
      width,
      height,
      maxWidth: maxWidth || INFINITY,
      maxHeight: maxHeight || INFINITY
    };
  }
  function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
    const style = getComputedStyle2(canvas);
    const margins = getPositionedStyle(style, "margin");
    const maxWidth = parseMaxStyle(style.maxWidth, canvas, "clientWidth") || INFINITY;
    const maxHeight = parseMaxStyle(style.maxHeight, canvas, "clientHeight") || INFINITY;
    const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
    let { width, height } = containerSize;
    if (style.boxSizing === "content-box") {
      const borders = getPositionedStyle(style, "border", "width");
      const paddings = getPositionedStyle(style, "padding");
      width -= paddings.width + borders.width;
      height -= paddings.height + borders.height;
    }
    width = Math.max(0, width - margins.width);
    height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
    width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
    height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
    if (width && !height) {
      height = round1(width / 2);
    }
    const maintainHeight = bbWidth !== void 0 || bbHeight !== void 0;
    if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
      height = containerSize.height;
      width = round1(Math.floor(height * aspectRatio));
    }
    return {
      width,
      height
    };
  }
  function retinaScale(chart2, forceRatio, forceStyle) {
    const pixelRatio = forceRatio || 1;
    const deviceHeight = round1(chart2.height * pixelRatio);
    const deviceWidth = round1(chart2.width * pixelRatio);
    chart2.height = round1(chart2.height);
    chart2.width = round1(chart2.width);
    const canvas = chart2.canvas;
    if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
      canvas.style.height = `${chart2.height}px`;
      canvas.style.width = `${chart2.width}px`;
    }
    if (chart2.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
      chart2.currentDevicePixelRatio = pixelRatio;
      canvas.height = deviceHeight;
      canvas.width = deviceWidth;
      chart2.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      return true;
    }
    return false;
  }
  function readUsedSize(element, property) {
    const value = getStyle(element, property);
    const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
    return matches ? +matches[1] : void 0;
  }
  function _pointInLine(p1, p22, t4, mode) {
    return {
      x: p1.x + t4 * (p22.x - p1.x),
      y: p1.y + t4 * (p22.y - p1.y)
    };
  }
  function _steppedInterpolation(p1, p22, t4, mode) {
    return {
      x: p1.x + t4 * (p22.x - p1.x),
      y: mode === "middle" ? t4 < 0.5 ? p1.y : p22.y : mode === "after" ? t4 < 1 ? p1.y : p22.y : t4 > 0 ? p22.y : p1.y
    };
  }
  function _bezierInterpolation(p1, p22, t4, mode) {
    const cp1 = {
      x: p1.cp2x,
      y: p1.cp2y
    };
    const cp2 = {
      x: p22.cp1x,
      y: p22.cp1y
    };
    const a3 = _pointInLine(p1, cp1, t4);
    const b3 = _pointInLine(cp1, cp2, t4);
    const c4 = _pointInLine(cp2, p22, t4);
    const d3 = _pointInLine(a3, b3, t4);
    const e7 = _pointInLine(b3, c4, t4);
    return _pointInLine(d3, e7, t4);
  }
  function getRtlAdapter(rtl, rectX, width) {
    return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
  }
  function overrideTextDirection(ctx, direction) {
    let style, original;
    if (direction === "ltr" || direction === "rtl") {
      style = ctx.canvas.style;
      original = [
        style.getPropertyValue("direction"),
        style.getPropertyPriority("direction")
      ];
      style.setProperty("direction", direction, "important");
      ctx.prevTextDirection = original;
    }
  }
  function restoreTextDirection(ctx, original) {
    if (original !== void 0) {
      delete ctx.prevTextDirection;
      ctx.canvas.style.setProperty("direction", original[0], original[1]);
    }
  }
  function propertyFn(property) {
    if (property === "angle") {
      return {
        between: _angleBetween,
        compare: _angleDiff,
        normalize: _normalizeAngle
      };
    }
    return {
      between: _isBetween,
      compare: (a3, b3) => a3 - b3,
      normalize: (x2) => x2
    };
  }
  function normalizeSegment({ start, end, count, loop, style }) {
    return {
      start: start % count,
      end: end % count,
      loop: loop && (end - start + 1) % count === 0,
      style
    };
  }
  function getSegment(segment, points, bounds) {
    const { property, start: startBound, end: endBound } = bounds;
    const { between, normalize } = propertyFn(property);
    const count = points.length;
    let { start, end, loop } = segment;
    let i6, ilen;
    if (loop) {
      start += count;
      end += count;
      for (i6 = 0, ilen = count; i6 < ilen; ++i6) {
        if (!between(normalize(points[start % count][property]), startBound, endBound)) {
          break;
        }
        start--;
        end--;
      }
      start %= count;
      end %= count;
    }
    if (end < start) {
      end += count;
    }
    return {
      start,
      end,
      loop,
      style: segment.style
    };
  }
  function _boundSegment(segment, points, bounds) {
    if (!bounds) {
      return [
        segment
      ];
    }
    const { property, start: startBound, end: endBound } = bounds;
    const count = points.length;
    const { compare, between, normalize } = propertyFn(property);
    const { start, end, loop, style } = getSegment(segment, points, bounds);
    const result = [];
    let inside = false;
    let subStart = null;
    let value, point, prevValue;
    const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
    const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
    const shouldStart = () => inside || startIsBefore();
    const shouldStop = () => !inside || endIsBefore();
    for (let i6 = start, prev = start; i6 <= end; ++i6) {
      point = points[i6 % count];
      if (point.skip) {
        continue;
      }
      value = normalize(point[property]);
      if (value === prevValue) {
        continue;
      }
      inside = between(value, startBound, endBound);
      if (subStart === null && shouldStart()) {
        subStart = compare(value, startBound) === 0 ? i6 : prev;
      }
      if (subStart !== null && shouldStop()) {
        result.push(normalizeSegment({
          start: subStart,
          end: i6,
          loop,
          count,
          style
        }));
        subStart = null;
      }
      prev = i6;
      prevValue = value;
    }
    if (subStart !== null) {
      result.push(normalizeSegment({
        start: subStart,
        end,
        loop,
        count,
        style
      }));
    }
    return result;
  }
  function _boundSegments(line, bounds) {
    const result = [];
    const segments = line.segments;
    for (let i6 = 0; i6 < segments.length; i6++) {
      const sub = _boundSegment(segments[i6], line.points, bounds);
      if (sub.length) {
        result.push(...sub);
      }
    }
    return result;
  }
  function findStartAndEnd(points, count, loop, spanGaps) {
    let start = 0;
    let end = count - 1;
    if (loop && !spanGaps) {
      while (start < count && !points[start].skip) {
        start++;
      }
    }
    while (start < count && points[start].skip) {
      start++;
    }
    start %= count;
    if (loop) {
      end += start;
    }
    while (end > start && points[end % count].skip) {
      end--;
    }
    end %= count;
    return {
      start,
      end
    };
  }
  function solidSegments(points, start, max, loop) {
    const count = points.length;
    const result = [];
    let last = start;
    let prev = points[start];
    let end;
    for (end = start + 1; end <= max; ++end) {
      const cur = points[end % count];
      if (cur.skip || cur.stop) {
        if (!prev.skip) {
          loop = false;
          result.push({
            start: start % count,
            end: (end - 1) % count,
            loop
          });
          start = last = cur.stop ? end : null;
        }
      } else {
        last = end;
        if (prev.skip) {
          start = end;
        }
      }
      prev = cur;
    }
    if (last !== null) {
      result.push({
        start: start % count,
        end: last % count,
        loop
      });
    }
    return result;
  }
  function _computeSegments(line, segmentOptions) {
    const points = line.points;
    const spanGaps = line.options.spanGaps;
    const count = points.length;
    if (!count) {
      return [];
    }
    const loop = !!line._loop;
    const { start, end } = findStartAndEnd(points, count, loop, spanGaps);
    if (spanGaps === true) {
      return splitByStyles(line, [
        {
          start,
          end,
          loop
        }
      ], points, segmentOptions);
    }
    const max = end < start ? end + count : end;
    const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
    return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
  }
  function splitByStyles(line, segments, points, segmentOptions) {
    if (!segmentOptions || !segmentOptions.setContext || !points) {
      return segments;
    }
    return doSplitByStyles(line, segments, points, segmentOptions);
  }
  function doSplitByStyles(line, segments, points, segmentOptions) {
    const chartContext = line._chart.getContext();
    const baseStyle = readStyle(line.options);
    const { _datasetIndex: datasetIndex, options: { spanGaps } } = line;
    const count = points.length;
    const result = [];
    let prevStyle = baseStyle;
    let start = segments[0].start;
    let i6 = start;
    function addStyle(s4, e7, l3, st) {
      const dir = spanGaps ? -1 : 1;
      if (s4 === e7) {
        return;
      }
      s4 += count;
      while (points[s4 % count].skip) {
        s4 -= dir;
      }
      while (points[e7 % count].skip) {
        e7 += dir;
      }
      if (s4 % count !== e7 % count) {
        result.push({
          start: s4 % count,
          end: e7 % count,
          loop: l3,
          style: st
        });
        prevStyle = st;
        start = e7 % count;
      }
    }
    for (const segment of segments) {
      start = spanGaps ? start : segment.start;
      let prev = points[start % count];
      let style;
      for (i6 = start + 1; i6 <= segment.end; i6++) {
        const pt = points[i6 % count];
        style = readStyle(segmentOptions.setContext(createContext(chartContext, {
          type: "segment",
          p0: prev,
          p1: pt,
          p0DataIndex: (i6 - 1) % count,
          p1DataIndex: i6 % count,
          datasetIndex
        })));
        if (styleChanged(style, prevStyle)) {
          addStyle(start, i6 - 1, segment.loop, prevStyle);
        }
        prev = pt;
        prevStyle = style;
      }
      if (start < i6 - 1) {
        addStyle(start, i6 - 1, segment.loop, prevStyle);
      }
    }
    return result;
  }
  function readStyle(options) {
    return {
      backgroundColor: options.backgroundColor,
      borderCapStyle: options.borderCapStyle,
      borderDash: options.borderDash,
      borderDashOffset: options.borderDashOffset,
      borderJoinStyle: options.borderJoinStyle,
      borderWidth: options.borderWidth,
      borderColor: options.borderColor
    };
  }
  function styleChanged(style, prevStyle) {
    if (!prevStyle) {
      return false;
    }
    const cache = [];
    const replacer = function(key, value) {
      if (!isPatternOrGradient(value)) {
        return value;
      }
      if (!cache.includes(value)) {
        cache.push(value);
      }
      return cache.indexOf(value);
    };
    return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
  }
  function getSizeForArea(scale, chartArea, field) {
    return scale.options.clip ? scale[field] : chartArea[field];
  }
  function getDatasetArea(meta, chartArea) {
    const { xScale, yScale } = meta;
    if (xScale && yScale) {
      return {
        left: getSizeForArea(xScale, chartArea, "left"),
        right: getSizeForArea(xScale, chartArea, "right"),
        top: getSizeForArea(yScale, chartArea, "top"),
        bottom: getSizeForArea(yScale, chartArea, "bottom")
      };
    }
    return chartArea;
  }
  function getDatasetClipArea(chart2, meta) {
    const clip = meta._clip;
    if (clip.disabled) {
      return false;
    }
    const area = getDatasetArea(meta, chart2.chartArea);
    return {
      left: clip.left === false ? 0 : area.left - (clip.left === true ? 0 : clip.left),
      right: clip.right === false ? chart2.width : area.right + (clip.right === true ? 0 : clip.right),
      top: clip.top === false ? 0 : area.top - (clip.top === true ? 0 : clip.top),
      bottom: clip.bottom === false ? chart2.height : area.bottom + (clip.bottom === true ? 0 : clip.bottom)
    };
  }
  var uid, toPercentage, toDimension, keyResolvers, defined, isFunction, setsEqual, PI, TAU, PITAU, INFINITY, RAD_PER_DEG, HALF_PI, QUARTER_PI, TWO_THIRDS_PI, log10, sign, _lookupByKey, _rlookupByKey, arrayEvents, requestAnimFrame, _toLeftRightCenter, _alignStartEnd, _textX, atEdge, elasticIn, elasticOut, effects, numbers, colors, intlCache, formatters, Ticks, overrides, descriptors, Defaults, defaults, LINE_HEIGHT, FONT_STYLE, numberOrZero, readKey, needsSubResolver, getScope, EPSILON, getPoint, getValueAxis, getComputedStyle2, positions, useOffsetPos, round1, supportsEventListenerOptions, getRightToLeftAdapter, getLeftToRightAdapter;
  var init_helpers_dataset = __esm({
    "node_modules/chart.js/dist/chunks/helpers.dataset.js"() {
      init_color_esm();
      uid = /* @__PURE__ */ (() => {
        let id = 0;
        return () => id++;
      })();
      toPercentage = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 : +value / dimension;
      toDimension = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value;
      keyResolvers = {
        // Chart.helpers.core resolveObjectKey should resolve empty key to root object
        "": (v2) => v2,
        // default resolvers
        x: (o7) => o7.x,
        y: (o7) => o7.y
      };
      defined = (value) => typeof value !== "undefined";
      isFunction = (value) => typeof value === "function";
      setsEqual = (a3, b3) => {
        if (a3.size !== b3.size) {
          return false;
        }
        for (const item of a3) {
          if (!b3.has(item)) {
            return false;
          }
        }
        return true;
      };
      PI = Math.PI;
      TAU = 2 * PI;
      PITAU = TAU + PI;
      INFINITY = Number.POSITIVE_INFINITY;
      RAD_PER_DEG = PI / 180;
      HALF_PI = PI / 2;
      QUARTER_PI = PI / 4;
      TWO_THIRDS_PI = PI * 2 / 3;
      log10 = Math.log10;
      sign = Math.sign;
      _lookupByKey = (table, key, value, last) => _lookup(table, value, last ? (index2) => {
        const ti = table[index2][key];
        return ti < value || ti === value && table[index2 + 1][key] === value;
      } : (index2) => table[index2][key] < value);
      _rlookupByKey = (table, key, value) => _lookup(table, value, (index2) => table[index2][key] >= value);
      arrayEvents = [
        "push",
        "pop",
        "shift",
        "splice",
        "unshift"
      ];
      requestAnimFrame = (function() {
        if (typeof window === "undefined") {
          return function(callback2) {
            return callback2();
          };
        }
        return window.requestAnimationFrame;
      })();
      _toLeftRightCenter = (align) => align === "start" ? "left" : align === "end" ? "right" : "center";
      _alignStartEnd = (align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2;
      _textX = (align, left, right, rtl) => {
        const check = rtl ? "left" : "right";
        return align === check ? right : align === "center" ? (left + right) / 2 : left;
      };
      atEdge = (t4) => t4 === 0 || t4 === 1;
      elasticIn = (t4, s4, p3) => -(Math.pow(2, 10 * (t4 -= 1)) * Math.sin((t4 - s4) * TAU / p3));
      elasticOut = (t4, s4, p3) => Math.pow(2, -10 * t4) * Math.sin((t4 - s4) * TAU / p3) + 1;
      effects = {
        linear: (t4) => t4,
        easeInQuad: (t4) => t4 * t4,
        easeOutQuad: (t4) => -t4 * (t4 - 2),
        easeInOutQuad: (t4) => (t4 /= 0.5) < 1 ? 0.5 * t4 * t4 : -0.5 * (--t4 * (t4 - 2) - 1),
        easeInCubic: (t4) => t4 * t4 * t4,
        easeOutCubic: (t4) => (t4 -= 1) * t4 * t4 + 1,
        easeInOutCubic: (t4) => (t4 /= 0.5) < 1 ? 0.5 * t4 * t4 * t4 : 0.5 * ((t4 -= 2) * t4 * t4 + 2),
        easeInQuart: (t4) => t4 * t4 * t4 * t4,
        easeOutQuart: (t4) => -((t4 -= 1) * t4 * t4 * t4 - 1),
        easeInOutQuart: (t4) => (t4 /= 0.5) < 1 ? 0.5 * t4 * t4 * t4 * t4 : -0.5 * ((t4 -= 2) * t4 * t4 * t4 - 2),
        easeInQuint: (t4) => t4 * t4 * t4 * t4 * t4,
        easeOutQuint: (t4) => (t4 -= 1) * t4 * t4 * t4 * t4 + 1,
        easeInOutQuint: (t4) => (t4 /= 0.5) < 1 ? 0.5 * t4 * t4 * t4 * t4 * t4 : 0.5 * ((t4 -= 2) * t4 * t4 * t4 * t4 + 2),
        easeInSine: (t4) => -Math.cos(t4 * HALF_PI) + 1,
        easeOutSine: (t4) => Math.sin(t4 * HALF_PI),
        easeInOutSine: (t4) => -0.5 * (Math.cos(PI * t4) - 1),
        easeInExpo: (t4) => t4 === 0 ? 0 : Math.pow(2, 10 * (t4 - 1)),
        easeOutExpo: (t4) => t4 === 1 ? 1 : -Math.pow(2, -10 * t4) + 1,
        easeInOutExpo: (t4) => atEdge(t4) ? t4 : t4 < 0.5 ? 0.5 * Math.pow(2, 10 * (t4 * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t4 * 2 - 1)) + 2),
        easeInCirc: (t4) => t4 >= 1 ? t4 : -(Math.sqrt(1 - t4 * t4) - 1),
        easeOutCirc: (t4) => Math.sqrt(1 - (t4 -= 1) * t4),
        easeInOutCirc: (t4) => (t4 /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t4 * t4) - 1) : 0.5 * (Math.sqrt(1 - (t4 -= 2) * t4) + 1),
        easeInElastic: (t4) => atEdge(t4) ? t4 : elasticIn(t4, 0.075, 0.3),
        easeOutElastic: (t4) => atEdge(t4) ? t4 : elasticOut(t4, 0.075, 0.3),
        easeInOutElastic(t4) {
          const s4 = 0.1125;
          const p3 = 0.45;
          return atEdge(t4) ? t4 : t4 < 0.5 ? 0.5 * elasticIn(t4 * 2, s4, p3) : 0.5 + 0.5 * elasticOut(t4 * 2 - 1, s4, p3);
        },
        easeInBack(t4) {
          const s4 = 1.70158;
          return t4 * t4 * ((s4 + 1) * t4 - s4);
        },
        easeOutBack(t4) {
          const s4 = 1.70158;
          return (t4 -= 1) * t4 * ((s4 + 1) * t4 + s4) + 1;
        },
        easeInOutBack(t4) {
          let s4 = 1.70158;
          if ((t4 /= 0.5) < 1) {
            return 0.5 * (t4 * t4 * (((s4 *= 1.525) + 1) * t4 - s4));
          }
          return 0.5 * ((t4 -= 2) * t4 * (((s4 *= 1.525) + 1) * t4 + s4) + 2);
        },
        easeInBounce: (t4) => 1 - effects.easeOutBounce(1 - t4),
        easeOutBounce(t4) {
          const m2 = 7.5625;
          const d3 = 2.75;
          if (t4 < 1 / d3) {
            return m2 * t4 * t4;
          }
          if (t4 < 2 / d3) {
            return m2 * (t4 -= 1.5 / d3) * t4 + 0.75;
          }
          if (t4 < 2.5 / d3) {
            return m2 * (t4 -= 2.25 / d3) * t4 + 0.9375;
          }
          return m2 * (t4 -= 2.625 / d3) * t4 + 0.984375;
        },
        easeInOutBounce: (t4) => t4 < 0.5 ? effects.easeInBounce(t4 * 2) * 0.5 : effects.easeOutBounce(t4 * 2 - 1) * 0.5 + 0.5
      };
      numbers = [
        "x",
        "y",
        "borderWidth",
        "radius",
        "tension"
      ];
      colors = [
        "color",
        "borderColor",
        "backgroundColor"
      ];
      intlCache = /* @__PURE__ */ new Map();
      formatters = {
        values(value) {
          return isArray(value) ? value : "" + value;
        },
        numeric(tickValue, index2, ticks) {
          if (tickValue === 0) {
            return "0";
          }
          const locale = this.chart.options.locale;
          let notation;
          let delta = tickValue;
          if (ticks.length > 1) {
            const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
            if (maxTick < 1e-4 || maxTick > 1e15) {
              notation = "scientific";
            }
            delta = calculateDelta(tickValue, ticks);
          }
          const logDelta = log10(Math.abs(delta));
          const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
          const options = {
            notation,
            minimumFractionDigits: numDecimal,
            maximumFractionDigits: numDecimal
          };
          Object.assign(options, this.options.ticks.format);
          return formatNumber2(tickValue, locale, options);
        },
        logarithmic(tickValue, index2, ticks) {
          if (tickValue === 0) {
            return "0";
          }
          const remain = ticks[index2].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
          if ([
            1,
            2,
            3,
            5,
            10,
            15
          ].includes(remain) || index2 > 0.8 * ticks.length) {
            return formatters.numeric.call(this, tickValue, index2, ticks);
          }
          return "";
        }
      };
      Ticks = {
        formatters
      };
      overrides = /* @__PURE__ */ Object.create(null);
      descriptors = /* @__PURE__ */ Object.create(null);
      Defaults = class {
        constructor(_descriptors2, _appliers) {
          this.animation = void 0;
          this.backgroundColor = "rgba(0,0,0,0.1)";
          this.borderColor = "rgba(0,0,0,0.1)";
          this.color = "#666";
          this.datasets = {};
          this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
          this.elements = {};
          this.events = [
            "mousemove",
            "mouseout",
            "click",
            "touchstart",
            "touchmove"
          ];
          this.font = {
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            size: 12,
            style: "normal",
            lineHeight: 1.2,
            weight: null
          };
          this.hover = {};
          this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
          this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
          this.hoverColor = (ctx, options) => getHoverColor(options.color);
          this.indexAxis = "x";
          this.interaction = {
            mode: "nearest",
            intersect: true,
            includeInvisible: false
          };
          this.maintainAspectRatio = true;
          this.onHover = null;
          this.onClick = null;
          this.parsing = true;
          this.plugins = {};
          this.responsive = true;
          this.scale = void 0;
          this.scales = {};
          this.showLine = true;
          this.drawActiveElementsOnTop = true;
          this.describe(_descriptors2);
          this.apply(_appliers);
        }
        set(scope, values) {
          return set(this, scope, values);
        }
        get(scope) {
          return getScope$1(this, scope);
        }
        describe(scope, values) {
          return set(descriptors, scope, values);
        }
        override(scope, values) {
          return set(overrides, scope, values);
        }
        route(scope, name, targetScope, targetName) {
          const scopeObject = getScope$1(this, scope);
          const targetScopeObject = getScope$1(this, targetScope);
          const privateName = "_" + name;
          Object.defineProperties(scopeObject, {
            [privateName]: {
              value: scopeObject[name],
              writable: true
            },
            [name]: {
              enumerable: true,
              get() {
                const local = this[privateName];
                const target = targetScopeObject[targetName];
                if (isObject(local)) {
                  return Object.assign({}, target, local);
                }
                return valueOrDefault(local, target);
              },
              set(value) {
                this[privateName] = value;
              }
            }
          });
        }
        apply(appliers) {
          appliers.forEach((apply) => apply(this));
        }
      };
      defaults = /* @__PURE__ */ new Defaults({
        _scriptable: (name) => !name.startsWith("on"),
        _indexable: (name) => name !== "events",
        hover: {
          _fallback: "interaction"
        },
        interaction: {
          _scriptable: false,
          _indexable: false
        }
      }, [
        applyAnimationsDefaults,
        applyLayoutsDefaults,
        applyScaleDefaults
      ]);
      LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
      FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
      numberOrZero = (v2) => +v2 || 0;
      readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
      needsSubResolver = (prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object);
      getScope = (key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0;
      EPSILON = Number.EPSILON || 1e-14;
      getPoint = (points, i6) => i6 < points.length && !points[i6].skip && points[i6];
      getValueAxis = (indexAxis) => indexAxis === "x" ? "y" : "x";
      getComputedStyle2 = (element) => element.ownerDocument.defaultView.getComputedStyle(element, null);
      positions = [
        "top",
        "right",
        "bottom",
        "left"
      ];
      useOffsetPos = (x2, y3, target) => (x2 > 0 || y3 > 0) && (!target || !target.shadowRoot);
      round1 = (v2) => Math.round(v2 * 10) / 10;
      supportsEventListenerOptions = (function() {
        let passiveSupported = false;
        try {
          const options = {
            get passive() {
              passiveSupported = true;
              return false;
            }
          };
          if (_isDomSupported()) {
            window.addEventListener("test", null, options);
            window.removeEventListener("test", null, options);
          }
        } catch (e7) {
        }
        return passiveSupported;
      })();
      getRightToLeftAdapter = function(rectX, width) {
        return {
          x(x2) {
            return rectX + rectX + width - x2;
          },
          setWidth(w2) {
            width = w2;
          },
          textAlign(align) {
            if (align === "center") {
              return align;
            }
            return align === "right" ? "left" : "right";
          },
          xPlus(x2, value) {
            return x2 - value;
          },
          leftForLtr(x2, itemWidth) {
            return x2 - itemWidth;
          }
        };
      };
      getLeftToRightAdapter = function() {
        return {
          x(x2) {
            return x2;
          },
          setWidth(w2) {
          },
          textAlign(align) {
            return align;
          },
          xPlus(x2, value) {
            return x2 + value;
          },
          leftForLtr(x2, _itemWidth) {
            return x2;
          }
        };
      };
    }
  });

  // node_modules/chart.js/dist/chart.js
  function awaitAll(animations, properties) {
    const running = [];
    const keys = Object.keys(properties);
    for (let i6 = 0; i6 < keys.length; i6++) {
      const anim = animations[keys[i6]];
      if (anim && anim.active()) {
        running.push(anim.wait());
      }
    }
    return Promise.all(running);
  }
  function resolveTargetOptions(target, newOptions) {
    if (!newOptions) {
      return;
    }
    let options = target.options;
    if (!options) {
      target.options = newOptions;
      return;
    }
    if (options.$shared) {
      target.options = options = Object.assign({}, options, {
        $shared: false,
        $animations: {}
      });
    }
    return options;
  }
  function scaleClip(scale, allowedOverflow) {
    const opts = scale && scale.options || {};
    const reverse = opts.reverse;
    const min = opts.min === void 0 ? allowedOverflow : 0;
    const max = opts.max === void 0 ? allowedOverflow : 0;
    return {
      start: reverse ? max : min,
      end: reverse ? min : max
    };
  }
  function defaultClip(xScale, yScale, allowedOverflow) {
    if (allowedOverflow === false) {
      return false;
    }
    const x2 = scaleClip(xScale, allowedOverflow);
    const y3 = scaleClip(yScale, allowedOverflow);
    return {
      top: y3.end,
      right: x2.end,
      bottom: y3.start,
      left: x2.start
    };
  }
  function toClip(value) {
    let t4, r6, b3, l3;
    if (isObject(value)) {
      t4 = value.top;
      r6 = value.right;
      b3 = value.bottom;
      l3 = value.left;
    } else {
      t4 = r6 = b3 = l3 = value;
    }
    return {
      top: t4,
      right: r6,
      bottom: b3,
      left: l3,
      disabled: value === false
    };
  }
  function getSortedDatasetIndices(chart2, filterVisible) {
    const keys = [];
    const metasets = chart2._getSortedDatasetMetas(filterVisible);
    let i6, ilen;
    for (i6 = 0, ilen = metasets.length; i6 < ilen; ++i6) {
      keys.push(metasets[i6].index);
    }
    return keys;
  }
  function applyStack(stack, value, dsIndex, options = {}) {
    const keys = stack.keys;
    const singleMode = options.mode === "single";
    let i6, ilen, datasetIndex, otherValue;
    if (value === null) {
      return;
    }
    let found = false;
    for (i6 = 0, ilen = keys.length; i6 < ilen; ++i6) {
      datasetIndex = +keys[i6];
      if (datasetIndex === dsIndex) {
        found = true;
        if (options.all) {
          continue;
        }
        break;
      }
      otherValue = stack.values[datasetIndex];
      if (isNumberFinite(otherValue) && (singleMode || value === 0 || sign(value) === sign(otherValue))) {
        value += otherValue;
      }
    }
    if (!found && !options.all) {
      return 0;
    }
    return value;
  }
  function convertObjectDataToArray(data, meta) {
    const { iScale, vScale } = meta;
    const iAxisKey = iScale.axis === "x" ? "x" : "y";
    const vAxisKey = vScale.axis === "x" ? "x" : "y";
    const keys = Object.keys(data);
    const adata = new Array(keys.length);
    let i6, ilen, key;
    for (i6 = 0, ilen = keys.length; i6 < ilen; ++i6) {
      key = keys[i6];
      adata[i6] = {
        [iAxisKey]: key,
        [vAxisKey]: data[key]
      };
    }
    return adata;
  }
  function isStacked(scale, meta) {
    const stacked = scale && scale.options.stacked;
    return stacked || stacked === void 0 && meta.stack !== void 0;
  }
  function getStackKey(indexScale, valueScale, meta) {
    return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
  }
  function getUserBounds(scale) {
    const { min, max, minDefined, maxDefined } = scale.getUserBounds();
    return {
      min: minDefined ? min : Number.NEGATIVE_INFINITY,
      max: maxDefined ? max : Number.POSITIVE_INFINITY
    };
  }
  function getOrCreateStack(stacks, stackKey, indexValue) {
    const subStack = stacks[stackKey] || (stacks[stackKey] = {});
    return subStack[indexValue] || (subStack[indexValue] = {});
  }
  function getLastIndexInStack(stack, vScale, positive, type) {
    for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
      const value = stack[meta.index];
      if (positive && value > 0 || !positive && value < 0) {
        return meta.index;
      }
    }
    return null;
  }
  function updateStacks(controller, parsed) {
    const { chart: chart2, _cachedMeta: meta } = controller;
    const stacks = chart2._stacks || (chart2._stacks = {});
    const { iScale, vScale, index: datasetIndex } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const key = getStackKey(iScale, vScale, meta);
    const ilen = parsed.length;
    let stack;
    for (let i6 = 0; i6 < ilen; ++i6) {
      const item = parsed[i6];
      const { [iAxis]: index2, [vAxis]: value } = item;
      const itemStacks = item._stacks || (item._stacks = {});
      stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index2);
      stack[datasetIndex] = value;
      stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
      stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
      const visualValues = stack._visualValues || (stack._visualValues = {});
      visualValues[datasetIndex] = value;
    }
  }
  function getFirstScaleId(chart2, axis) {
    const scales2 = chart2.scales;
    return Object.keys(scales2).filter((key) => scales2[key].axis === axis).shift();
  }
  function createDatasetContext(parent, index2) {
    return createContext(parent, {
      active: false,
      dataset: void 0,
      datasetIndex: index2,
      index: index2,
      mode: "default",
      type: "dataset"
    });
  }
  function createDataContext(parent, index2, element) {
    return createContext(parent, {
      active: false,
      dataIndex: index2,
      parsed: void 0,
      raw: void 0,
      element,
      index: index2,
      mode: "default",
      type: "data"
    });
  }
  function clearStacks(meta, items) {
    const datasetIndex = meta.controller.index;
    const axis = meta.vScale && meta.vScale.axis;
    if (!axis) {
      return;
    }
    items = items || meta._parsed;
    for (const parsed of items) {
      const stacks = parsed._stacks;
      if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
        return;
      }
      delete stacks[axis][datasetIndex];
      if (stacks[axis]._visualValues !== void 0 && stacks[axis]._visualValues[datasetIndex] !== void 0) {
        delete stacks[axis]._visualValues[datasetIndex];
      }
    }
  }
  function getAllScaleValues(scale, type) {
    if (!scale._cache.$bar) {
      const visibleMetas = scale.getMatchingVisibleMetas(type);
      let values = [];
      for (let i6 = 0, ilen = visibleMetas.length; i6 < ilen; i6++) {
        values = values.concat(visibleMetas[i6].controller.getAllParsedValues(scale));
      }
      scale._cache.$bar = _arrayUnique(values.sort((a3, b3) => a3 - b3));
    }
    return scale._cache.$bar;
  }
  function computeMinSampleSize(meta) {
    const scale = meta.iScale;
    const values = getAllScaleValues(scale, meta.type);
    let min = scale._length;
    let i6, ilen, curr, prev;
    const updateMinAndPrev = () => {
      if (curr === 32767 || curr === -32768) {
        return;
      }
      if (defined(prev)) {
        min = Math.min(min, Math.abs(curr - prev) || min);
      }
      prev = curr;
    };
    for (i6 = 0, ilen = values.length; i6 < ilen; ++i6) {
      curr = scale.getPixelForValue(values[i6]);
      updateMinAndPrev();
    }
    prev = void 0;
    for (i6 = 0, ilen = scale.ticks.length; i6 < ilen; ++i6) {
      curr = scale.getPixelForTick(i6);
      updateMinAndPrev();
    }
    return min;
  }
  function computeFitCategoryTraits(index2, ruler, options, stackCount) {
    const thickness = options.barThickness;
    let size, ratio;
    if (isNullOrUndef(thickness)) {
      size = ruler.min * options.categoryPercentage;
      ratio = options.barPercentage;
    } else {
      size = thickness * stackCount;
      ratio = 1;
    }
    return {
      chunk: size / stackCount,
      ratio,
      start: ruler.pixels[index2] - size / 2
    };
  }
  function computeFlexCategoryTraits(index2, ruler, options, stackCount) {
    const pixels = ruler.pixels;
    const curr = pixels[index2];
    let prev = index2 > 0 ? pixels[index2 - 1] : null;
    let next = index2 < pixels.length - 1 ? pixels[index2 + 1] : null;
    const percent = options.categoryPercentage;
    if (prev === null) {
      prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
    }
    if (next === null) {
      next = curr + curr - prev;
    }
    const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
    const size = Math.abs(next - prev) / 2 * percent;
    return {
      chunk: size / stackCount,
      ratio: options.barPercentage,
      start
    };
  }
  function parseFloatBar(entry, item, vScale, i6) {
    const startValue = vScale.parse(entry[0], i6);
    const endValue = vScale.parse(entry[1], i6);
    const min = Math.min(startValue, endValue);
    const max = Math.max(startValue, endValue);
    let barStart = min;
    let barEnd = max;
    if (Math.abs(min) > Math.abs(max)) {
      barStart = max;
      barEnd = min;
    }
    item[vScale.axis] = barEnd;
    item._custom = {
      barStart,
      barEnd,
      start: startValue,
      end: endValue,
      min,
      max
    };
  }
  function parseValue(entry, item, vScale, i6) {
    if (isArray(entry)) {
      parseFloatBar(entry, item, vScale, i6);
    } else {
      item[vScale.axis] = vScale.parse(entry, i6);
    }
    return item;
  }
  function parseArrayOrPrimitive(meta, data, start, count) {
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = [];
    let i6, ilen, item, entry;
    for (i6 = start, ilen = start + count; i6 < ilen; ++i6) {
      entry = data[i6];
      item = {};
      item[iScale.axis] = singleScale || iScale.parse(labels[i6], i6);
      parsed.push(parseValue(entry, item, vScale, i6));
    }
    return parsed;
  }
  function isFloatBar(custom) {
    return custom && custom.barStart !== void 0 && custom.barEnd !== void 0;
  }
  function barSign(size, vScale, actualBase) {
    if (size !== 0) {
      return sign(size);
    }
    return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
  }
  function borderProps(properties) {
    let reverse, start, end, top, bottom;
    if (properties.horizontal) {
      reverse = properties.base > properties.x;
      start = "left";
      end = "right";
    } else {
      reverse = properties.base < properties.y;
      start = "bottom";
      end = "top";
    }
    if (reverse) {
      top = "end";
      bottom = "start";
    } else {
      top = "start";
      bottom = "end";
    }
    return {
      start,
      end,
      reverse,
      top,
      bottom
    };
  }
  function setBorderSkipped(properties, options, stack, index2) {
    let edge = options.borderSkipped;
    const res = {};
    if (!edge) {
      properties.borderSkipped = res;
      return;
    }
    if (edge === true) {
      properties.borderSkipped = {
        top: true,
        right: true,
        bottom: true,
        left: true
      };
      return;
    }
    const { start, end, reverse, top, bottom } = borderProps(properties);
    if (edge === "middle" && stack) {
      properties.enableBorderRadius = true;
      if ((stack._top || 0) === index2) {
        edge = top;
      } else if ((stack._bottom || 0) === index2) {
        edge = bottom;
      } else {
        res[parseEdge(bottom, start, end, reverse)] = true;
        edge = top;
      }
    }
    res[parseEdge(edge, start, end, reverse)] = true;
    properties.borderSkipped = res;
  }
  function parseEdge(edge, a3, b3, reverse) {
    if (reverse) {
      edge = swap(edge, a3, b3);
      edge = startEnd(edge, b3, a3);
    } else {
      edge = startEnd(edge, a3, b3);
    }
    return edge;
  }
  function swap(orig, v1, v2) {
    return orig === v1 ? v2 : orig === v2 ? v1 : orig;
  }
  function startEnd(v2, start, end) {
    return v2 === "start" ? start : v2 === "end" ? end : v2;
  }
  function setInflateAmount(properties, { inflateAmount }, ratio) {
    properties.inflateAmount = inflateAmount === "auto" ? ratio === 1 ? 0.33 : 0 : inflateAmount;
  }
  function getRatioAndOffset(rotation, circumference, cutout) {
    let ratioX = 1;
    let ratioY = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (circumference < TAU) {
      const startAngle = rotation;
      const endAngle = startAngle + circumference;
      const startX = Math.cos(startAngle);
      const startY = Math.sin(startAngle);
      const endX = Math.cos(endAngle);
      const endY = Math.sin(endAngle);
      const calcMax = (angle, a3, b3) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a3, a3 * cutout, b3, b3 * cutout);
      const calcMin = (angle, a3, b3) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a3, a3 * cutout, b3, b3 * cutout);
      const maxX = calcMax(0, startX, endX);
      const maxY = calcMax(HALF_PI, startY, endY);
      const minX = calcMin(PI, startX, endX);
      const minY = calcMin(PI + HALF_PI, startY, endY);
      ratioX = (maxX - minX) / 2;
      ratioY = (maxY - minY) / 2;
      offsetX = -(maxX + minX) / 2;
      offsetY = -(maxY + minY) / 2;
    }
    return {
      ratioX,
      ratioY,
      offsetX,
      offsetY
    };
  }
  function abstract() {
    throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
  }
  function binarySearch(metaset, axis, value, intersect) {
    const { controller, data, _sorted } = metaset;
    const iScale = controller._cachedMeta.iScale;
    const spanGaps = metaset.dataset ? metaset.dataset.options ? metaset.dataset.options.spanGaps : null : null;
    if (iScale && axis === iScale.axis && axis !== "r" && _sorted && data.length) {
      const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
      if (!intersect) {
        const result = lookupMethod(data, axis, value);
        if (spanGaps) {
          const { vScale } = controller._cachedMeta;
          const { _parsed } = metaset;
          const distanceToDefinedLo = _parsed.slice(0, result.lo + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
          result.lo -= Math.max(0, distanceToDefinedLo);
          const distanceToDefinedHi = _parsed.slice(result.hi).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
          result.hi += Math.max(0, distanceToDefinedHi);
        }
        return result;
      } else if (controller._sharedOptions) {
        const el2 = data[0];
        const range = typeof el2.getRange === "function" && el2.getRange(axis);
        if (range) {
          const start = lookupMethod(data, axis, value - range);
          const end = lookupMethod(data, axis, value + range);
          return {
            lo: start.lo,
            hi: end.hi
          };
        }
      }
    }
    return {
      lo: 0,
      hi: data.length - 1
    };
  }
  function evaluateInteractionItems(chart2, axis, position, handler, intersect) {
    const metasets = chart2.getSortedVisibleDatasetMetas();
    const value = position[axis];
    for (let i6 = 0, ilen = metasets.length; i6 < ilen; ++i6) {
      const { index: index2, data } = metasets[i6];
      const { lo, hi } = binarySearch(metasets[i6], axis, value, intersect);
      for (let j = lo; j <= hi; ++j) {
        const element = data[j];
        if (!element.skip) {
          handler(element, index2, j);
        }
      }
    }
  }
  function getDistanceMetricForAxis(axis) {
    const useX = axis.indexOf("x") !== -1;
    const useY = axis.indexOf("y") !== -1;
    return function(pt1, pt2) {
      const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
      const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
      return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    };
  }
  function getIntersectItems(chart2, position, axis, useFinalPosition, includeInvisible) {
    const items = [];
    if (!includeInvisible && !chart2.isPointInArea(position)) {
      return items;
    }
    const evaluationFunc = function(element, datasetIndex, index2) {
      if (!includeInvisible && !_isPointInArea(element, chart2.chartArea, 0)) {
        return;
      }
      if (element.inRange(position.x, position.y, useFinalPosition)) {
        items.push({
          element,
          datasetIndex,
          index: index2
        });
      }
    };
    evaluateInteractionItems(chart2, axis, position, evaluationFunc, true);
    return items;
  }
  function getNearestRadialItems(chart2, position, axis, useFinalPosition) {
    let items = [];
    function evaluationFunc(element, datasetIndex, index2) {
      const { startAngle, endAngle } = element.getProps([
        "startAngle",
        "endAngle"
      ], useFinalPosition);
      const { angle } = getAngleFromPoint(element, {
        x: position.x,
        y: position.y
      });
      if (_angleBetween(angle, startAngle, endAngle)) {
        items.push({
          element,
          datasetIndex,
          index: index2
        });
      }
    }
    evaluateInteractionItems(chart2, axis, position, evaluationFunc);
    return items;
  }
  function getNearestCartesianItems(chart2, position, axis, intersect, useFinalPosition, includeInvisible) {
    let items = [];
    const distanceMetric = getDistanceMetricForAxis(axis);
    let minDistance = Number.POSITIVE_INFINITY;
    function evaluationFunc(element, datasetIndex, index2) {
      const inRange2 = element.inRange(position.x, position.y, useFinalPosition);
      if (intersect && !inRange2) {
        return;
      }
      const center = element.getCenterPoint(useFinalPosition);
      const pointInArea = !!includeInvisible || chart2.isPointInArea(center);
      if (!pointInArea && !inRange2) {
        return;
      }
      const distance = distanceMetric(position, center);
      if (distance < minDistance) {
        items = [
          {
            element,
            datasetIndex,
            index: index2
          }
        ];
        minDistance = distance;
      } else if (distance === minDistance) {
        items.push({
          element,
          datasetIndex,
          index: index2
        });
      }
    }
    evaluateInteractionItems(chart2, axis, position, evaluationFunc);
    return items;
  }
  function getNearestItems(chart2, position, axis, intersect, useFinalPosition, includeInvisible) {
    if (!includeInvisible && !chart2.isPointInArea(position)) {
      return [];
    }
    return axis === "r" && !intersect ? getNearestRadialItems(chart2, position, axis, useFinalPosition) : getNearestCartesianItems(chart2, position, axis, intersect, useFinalPosition, includeInvisible);
  }
  function getAxisItems(chart2, position, axis, intersect, useFinalPosition) {
    const items = [];
    const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
    let intersectsItem = false;
    evaluateInteractionItems(chart2, axis, position, (element, datasetIndex, index2) => {
      if (element[rangeMethod] && element[rangeMethod](position[axis], useFinalPosition)) {
        items.push({
          element,
          datasetIndex,
          index: index2
        });
        intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
      }
    });
    if (intersect && !intersectsItem) {
      return [];
    }
    return items;
  }
  function filterByPosition(array, position) {
    return array.filter((v2) => v2.pos === position);
  }
  function filterDynamicPositionByAxis(array, axis) {
    return array.filter((v2) => STATIC_POSITIONS.indexOf(v2.pos) === -1 && v2.box.axis === axis);
  }
  function sortByWeight(array, reverse) {
    return array.sort((a3, b3) => {
      const v0 = reverse ? b3 : a3;
      const v1 = reverse ? a3 : b3;
      return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
    });
  }
  function wrapBoxes(boxes) {
    const layoutBoxes = [];
    let i6, ilen, box, pos, stack, stackWeight;
    for (i6 = 0, ilen = (boxes || []).length; i6 < ilen; ++i6) {
      box = boxes[i6];
      ({ position: pos, options: { stack, stackWeight = 1 } } = box);
      layoutBoxes.push({
        index: i6,
        box,
        pos,
        horizontal: box.isHorizontal(),
        weight: box.weight,
        stack: stack && pos + stack,
        stackWeight
      });
    }
    return layoutBoxes;
  }
  function buildStacks(layouts2) {
    const stacks = {};
    for (const wrap of layouts2) {
      const { stack, pos, stackWeight } = wrap;
      if (!stack || !STATIC_POSITIONS.includes(pos)) {
        continue;
      }
      const _stack = stacks[stack] || (stacks[stack] = {
        count: 0,
        placed: 0,
        weight: 0,
        size: 0
      });
      _stack.count++;
      _stack.weight += stackWeight;
    }
    return stacks;
  }
  function setLayoutDims(layouts2, params) {
    const stacks = buildStacks(layouts2);
    const { vBoxMaxWidth, hBoxMaxHeight } = params;
    let i6, ilen, layout;
    for (i6 = 0, ilen = layouts2.length; i6 < ilen; ++i6) {
      layout = layouts2[i6];
      const { fullSize } = layout.box;
      const stack = stacks[layout.stack];
      const factor = stack && layout.stackWeight / stack.weight;
      if (layout.horizontal) {
        layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
        layout.height = hBoxMaxHeight;
      } else {
        layout.width = vBoxMaxWidth;
        layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
      }
    }
    return stacks;
  }
  function buildLayoutBoxes(boxes) {
    const layoutBoxes = wrapBoxes(boxes);
    const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
    const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
    const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
    const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
    const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
    const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
    const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
    return {
      fullSize,
      leftAndTop: left.concat(top),
      rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
      chartArea: filterByPosition(layoutBoxes, "chartArea"),
      vertical: left.concat(right).concat(centerVertical),
      horizontal: top.concat(bottom).concat(centerHorizontal)
    };
  }
  function getCombinedMax(maxPadding, chartArea, a3, b3) {
    return Math.max(maxPadding[a3], chartArea[a3]) + Math.max(maxPadding[b3], chartArea[b3]);
  }
  function updateMaxPadding(maxPadding, boxPadding) {
    maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
    maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
    maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
    maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
  }
  function updateDims(chartArea, params, layout, stacks) {
    const { pos, box } = layout;
    const maxPadding = chartArea.maxPadding;
    if (!isObject(pos)) {
      if (layout.size) {
        chartArea[pos] -= layout.size;
      }
      const stack = stacks[layout.stack] || {
        size: 0,
        count: 1
      };
      stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
      layout.size = stack.size / stack.count;
      chartArea[pos] += layout.size;
    }
    if (box.getPadding) {
      updateMaxPadding(maxPadding, box.getPadding());
    }
    const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
    const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
    const widthChanged = newWidth !== chartArea.w;
    const heightChanged = newHeight !== chartArea.h;
    chartArea.w = newWidth;
    chartArea.h = newHeight;
    return layout.horizontal ? {
      same: widthChanged,
      other: heightChanged
    } : {
      same: heightChanged,
      other: widthChanged
    };
  }
  function handleMaxPadding(chartArea) {
    const maxPadding = chartArea.maxPadding;
    function updatePos(pos) {
      const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
      chartArea[pos] += change;
      return change;
    }
    chartArea.y += updatePos("top");
    chartArea.x += updatePos("left");
    updatePos("right");
    updatePos("bottom");
  }
  function getMargins(horizontal, chartArea) {
    const maxPadding = chartArea.maxPadding;
    function marginForPositions(positions2) {
      const margin = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
      positions2.forEach((pos) => {
        margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
      });
      return margin;
    }
    return horizontal ? marginForPositions([
      "left",
      "right"
    ]) : marginForPositions([
      "top",
      "bottom"
    ]);
  }
  function fitBoxes(boxes, chartArea, params, stacks) {
    const refitBoxes = [];
    let i6, ilen, layout, box, refit, changed;
    for (i6 = 0, ilen = boxes.length, refit = 0; i6 < ilen; ++i6) {
      layout = boxes[i6];
      box = layout.box;
      box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
      const { same, other } = updateDims(chartArea, params, layout, stacks);
      refit |= same && refitBoxes.length;
      changed = changed || other;
      if (!box.fullSize) {
        refitBoxes.push(layout);
      }
    }
    return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
  }
  function setBoxDims(box, left, top, width, height) {
    box.top = top;
    box.left = left;
    box.right = left + width;
    box.bottom = top + height;
    box.width = width;
    box.height = height;
  }
  function placeBoxes(boxes, chartArea, params, stacks) {
    const userPadding = params.padding;
    let { x: x2, y: y3 } = chartArea;
    for (const layout of boxes) {
      const box = layout.box;
      const stack = stacks[layout.stack] || {
        count: 1,
        placed: 0,
        weight: 1
      };
      const weight = layout.stackWeight / stack.weight || 1;
      if (layout.horizontal) {
        const width = chartArea.w * weight;
        const height = stack.size || box.height;
        if (defined(stack.start)) {
          y3 = stack.start;
        }
        if (box.fullSize) {
          setBoxDims(box, userPadding.left, y3, params.outerWidth - userPadding.right - userPadding.left, height);
        } else {
          setBoxDims(box, chartArea.left + stack.placed, y3, width, height);
        }
        stack.start = y3;
        stack.placed += width;
        y3 = box.bottom;
      } else {
        const height = chartArea.h * weight;
        const width = stack.size || box.width;
        if (defined(stack.start)) {
          x2 = stack.start;
        }
        if (box.fullSize) {
          setBoxDims(box, x2, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
        } else {
          setBoxDims(box, x2, chartArea.top + stack.placed, width, height);
        }
        stack.start = x2;
        stack.placed += height;
        x2 = box.right;
      }
    }
    chartArea.x = x2;
    chartArea.y = y3;
  }
  function initCanvas(canvas, aspectRatio) {
    const style = canvas.style;
    const renderHeight = canvas.getAttribute("height");
    const renderWidth = canvas.getAttribute("width");
    canvas[EXPANDO_KEY] = {
      initial: {
        height: renderHeight,
        width: renderWidth,
        style: {
          display: style.display,
          height: style.height,
          width: style.width
        }
      }
    };
    style.display = style.display || "block";
    style.boxSizing = style.boxSizing || "border-box";
    if (isNullOrEmpty(renderWidth)) {
      const displayWidth = readUsedSize(canvas, "width");
      if (displayWidth !== void 0) {
        canvas.width = displayWidth;
      }
    }
    if (isNullOrEmpty(renderHeight)) {
      if (canvas.style.height === "") {
        canvas.height = canvas.width / (aspectRatio || 2);
      } else {
        const displayHeight = readUsedSize(canvas, "height");
        if (displayHeight !== void 0) {
          canvas.height = displayHeight;
        }
      }
    }
    return canvas;
  }
  function addListener(node, type, listener) {
    if (node) {
      node.addEventListener(type, listener, eventListenerOptions);
    }
  }
  function removeListener(chart2, type, listener) {
    if (chart2 && chart2.canvas) {
      chart2.canvas.removeEventListener(type, listener, eventListenerOptions);
    }
  }
  function fromNativeEvent(event, chart2) {
    const type = EVENT_TYPES[event.type] || event.type;
    const { x: x2, y: y3 } = getRelativePosition(event, chart2);
    return {
      type,
      chart: chart2,
      native: event,
      x: x2 !== void 0 ? x2 : null,
      y: y3 !== void 0 ? y3 : null
    };
  }
  function nodeListContains(nodeList, canvas) {
    for (const node of nodeList) {
      if (node === canvas || node.contains(canvas)) {
        return true;
      }
    }
  }
  function createAttachObserver(chart2, type, listener) {
    const canvas = chart2.canvas;
    const observer = new MutationObserver((entries) => {
      let trigger = false;
      for (const entry of entries) {
        trigger = trigger || nodeListContains(entry.addedNodes, canvas);
        trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
      }
      if (trigger) {
        listener();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    return observer;
  }
  function createDetachObserver(chart2, type, listener) {
    const canvas = chart2.canvas;
    const observer = new MutationObserver((entries) => {
      let trigger = false;
      for (const entry of entries) {
        trigger = trigger || nodeListContains(entry.removedNodes, canvas);
        trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
      }
      if (trigger) {
        listener();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    return observer;
  }
  function onWindowResize() {
    const dpr = window.devicePixelRatio;
    if (dpr === oldDevicePixelRatio) {
      return;
    }
    oldDevicePixelRatio = dpr;
    drpListeningCharts.forEach((resize, chart2) => {
      if (chart2.currentDevicePixelRatio !== dpr) {
        resize();
      }
    });
  }
  function listenDevicePixelRatioChanges(chart2, resize) {
    if (!drpListeningCharts.size) {
      window.addEventListener("resize", onWindowResize);
    }
    drpListeningCharts.set(chart2, resize);
  }
  function unlistenDevicePixelRatioChanges(chart2) {
    drpListeningCharts.delete(chart2);
    if (!drpListeningCharts.size) {
      window.removeEventListener("resize", onWindowResize);
    }
  }
  function createResizeObserver(chart2, type, listener) {
    const canvas = chart2.canvas;
    const container = canvas && _getParentNode(canvas);
    if (!container) {
      return;
    }
    const resize = throttled((width, height) => {
      const w2 = container.clientWidth;
      listener(width, height);
      if (w2 < container.clientWidth) {
        listener();
      }
    }, window);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      if (width === 0 && height === 0) {
        return;
      }
      resize(width, height);
    });
    observer.observe(container);
    listenDevicePixelRatioChanges(chart2, resize);
    return observer;
  }
  function releaseObserver(chart2, type, observer) {
    if (observer) {
      observer.disconnect();
    }
    if (type === "resize") {
      unlistenDevicePixelRatioChanges(chart2);
    }
  }
  function createProxyAndListen(chart2, type, listener) {
    const canvas = chart2.canvas;
    const proxy = throttled((event) => {
      if (chart2.ctx !== null) {
        listener(fromNativeEvent(event, chart2));
      }
    }, chart2);
    addListener(canvas, type, proxy);
    return proxy;
  }
  function _detectPlatform(canvas) {
    if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
      return BasicPlatform;
    }
    return DomPlatform;
  }
  function autoSkip(scale, ticks) {
    const tickOpts = scale.options.ticks;
    const determinedMaxTicks = determineMaxTicks(scale);
    const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
    const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
    const numMajorIndices = majorIndices.length;
    const first = majorIndices[0];
    const last = majorIndices[numMajorIndices - 1];
    const newTicks = [];
    if (numMajorIndices > ticksLimit) {
      skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
      return newTicks;
    }
    const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
    if (numMajorIndices > 0) {
      let i6, ilen;
      const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
      skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
      for (i6 = 0, ilen = numMajorIndices - 1; i6 < ilen; i6++) {
        skip(ticks, newTicks, spacing, majorIndices[i6], majorIndices[i6 + 1]);
      }
      skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
      return newTicks;
    }
    skip(ticks, newTicks, spacing);
    return newTicks;
  }
  function determineMaxTicks(scale) {
    const offset = scale.options.offset;
    const tickLength = scale._tickSize();
    const maxScale = scale._length / tickLength + (offset ? 0 : 1);
    const maxChart = scale._maxLength / tickLength;
    return Math.floor(Math.min(maxScale, maxChart));
  }
  function calculateSpacing(majorIndices, ticks, ticksLimit) {
    const evenMajorSpacing = getEvenSpacing(majorIndices);
    const spacing = ticks.length / ticksLimit;
    if (!evenMajorSpacing) {
      return Math.max(spacing, 1);
    }
    const factors = _factorize(evenMajorSpacing);
    for (let i6 = 0, ilen = factors.length - 1; i6 < ilen; i6++) {
      const factor = factors[i6];
      if (factor > spacing) {
        return factor;
      }
    }
    return Math.max(spacing, 1);
  }
  function getMajorIndices(ticks) {
    const result = [];
    let i6, ilen;
    for (i6 = 0, ilen = ticks.length; i6 < ilen; i6++) {
      if (ticks[i6].major) {
        result.push(i6);
      }
    }
    return result;
  }
  function skipMajors(ticks, newTicks, majorIndices, spacing) {
    let count = 0;
    let next = majorIndices[0];
    let i6;
    spacing = Math.ceil(spacing);
    for (i6 = 0; i6 < ticks.length; i6++) {
      if (i6 === next) {
        newTicks.push(ticks[i6]);
        count++;
        next = majorIndices[count * spacing];
      }
    }
  }
  function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
    const start = valueOrDefault(majorStart, 0);
    const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
    let count = 0;
    let length, i6, next;
    spacing = Math.ceil(spacing);
    if (majorEnd) {
      length = majorEnd - majorStart;
      spacing = length / Math.floor(length / spacing);
    }
    next = start;
    while (next < 0) {
      count++;
      next = Math.round(start + count * spacing);
    }
    for (i6 = Math.max(start, 0); i6 < end; i6++) {
      if (i6 === next) {
        newTicks.push(ticks[i6]);
        count++;
        next = Math.round(start + count * spacing);
      }
    }
  }
  function getEvenSpacing(arr) {
    const len = arr.length;
    let i6, diff;
    if (len < 2) {
      return false;
    }
    for (diff = arr[0], i6 = 1; i6 < len; ++i6) {
      if (arr[i6] - arr[i6 - 1] !== diff) {
        return false;
      }
    }
    return diff;
  }
  function sample(arr, numItems) {
    const result = [];
    const increment = arr.length / numItems;
    const len = arr.length;
    let i6 = 0;
    for (; i6 < len; i6 += increment) {
      result.push(arr[Math.floor(i6)]);
    }
    return result;
  }
  function getPixelForGridLine(scale, index2, offsetGridLines) {
    const length = scale.ticks.length;
    const validIndex2 = Math.min(index2, length - 1);
    const start = scale._startPixel;
    const end = scale._endPixel;
    const epsilon = 1e-6;
    let lineValue = scale.getPixelForTick(validIndex2);
    let offset;
    if (offsetGridLines) {
      if (length === 1) {
        offset = Math.max(lineValue - start, end - lineValue);
      } else if (index2 === 0) {
        offset = (scale.getPixelForTick(1) - lineValue) / 2;
      } else {
        offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
      }
      lineValue += validIndex2 < index2 ? offset : -offset;
      if (lineValue < start - epsilon || lineValue > end + epsilon) {
        return;
      }
    }
    return lineValue;
  }
  function garbageCollect(caches, length) {
    each(caches, (cache) => {
      const gc = cache.gc;
      const gcLen = gc.length / 2;
      let i6;
      if (gcLen > length) {
        for (i6 = 0; i6 < gcLen; ++i6) {
          delete cache.data[gc[i6]];
        }
        gc.splice(0, gcLen);
      }
    });
  }
  function getTickMarkLength(options) {
    return options.drawTicks ? options.tickLength : 0;
  }
  function getTitleHeight(options, fallback) {
    if (!options.display) {
      return 0;
    }
    const font = toFont(options.font, fallback);
    const padding = toPadding(options.padding);
    const lines = isArray(options.text) ? options.text.length : 1;
    return lines * font.lineHeight + padding.height;
  }
  function createScaleContext(parent, scale) {
    return createContext(parent, {
      scale,
      type: "scale"
    });
  }
  function createTickContext(parent, index2, tick) {
    return createContext(parent, {
      tick,
      index: index2,
      type: "tick"
    });
  }
  function titleAlign(align, position, reverse) {
    let ret = _toLeftRightCenter(align);
    if (reverse && position !== "right" || !reverse && position === "right") {
      ret = reverseAlign(ret);
    }
    return ret;
  }
  function titleArgs(scale, offset, position, align) {
    const { top, left, bottom, right, chart: chart2 } = scale;
    const { chartArea, scales: scales2 } = chart2;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    const height = bottom - top;
    const width = right - left;
    if (scale.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        titleY = scales2[positionAxisID].getPixelForValue(value) + height - offset;
      } else if (position === "center") {
        titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
      } else {
        titleY = offsetFromEdge(scale, position, offset);
      }
      maxWidth = right - left;
    } else {
      if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        titleX = scales2[positionAxisID].getPixelForValue(value) - width + offset;
      } else if (position === "center") {
        titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
      } else {
        titleX = offsetFromEdge(scale, position, offset);
      }
      titleY = _alignStartEnd(align, bottom, top);
      rotation = position === "left" ? -HALF_PI : HALF_PI;
    }
    return {
      titleX,
      titleY,
      maxWidth,
      rotation
    };
  }
  function registerDefaults(item, scope, parentScope) {
    const itemDefaults = merge(/* @__PURE__ */ Object.create(null), [
      parentScope ? defaults.get(parentScope) : {},
      defaults.get(scope),
      item.defaults
    ]);
    defaults.set(scope, itemDefaults);
    if (item.defaultRoutes) {
      routeDefaults(scope, item.defaultRoutes);
    }
    if (item.descriptors) {
      defaults.describe(scope, item.descriptors);
    }
  }
  function routeDefaults(scope, routes) {
    Object.keys(routes).forEach((property) => {
      const propertyParts = property.split(".");
      const sourceName = propertyParts.pop();
      const sourceScope = [
        scope
      ].concat(propertyParts).join(".");
      const parts = routes[property].split(".");
      const targetName = parts.pop();
      const targetScope = parts.join(".");
      defaults.route(sourceScope, sourceName, targetScope, targetName);
    });
  }
  function isIChartComponent(proto) {
    return "id" in proto && "defaults" in proto;
  }
  function allPlugins(config) {
    const localIds = {};
    const plugins2 = [];
    const keys = Object.keys(registry.plugins.items);
    for (let i6 = 0; i6 < keys.length; i6++) {
      plugins2.push(registry.getPlugin(keys[i6]));
    }
    const local = config.plugins || [];
    for (let i6 = 0; i6 < local.length; i6++) {
      const plugin = local[i6];
      if (plugins2.indexOf(plugin) === -1) {
        plugins2.push(plugin);
        localIds[plugin.id] = true;
      }
    }
    return {
      plugins: plugins2,
      localIds
    };
  }
  function getOpts(options, all) {
    if (!all && options === false) {
      return null;
    }
    if (options === true) {
      return {};
    }
    return options;
  }
  function createDescriptors(chart2, { plugins: plugins2, localIds }, options, all) {
    const result = [];
    const context = chart2.getContext();
    for (const plugin of plugins2) {
      const id = plugin.id;
      const opts = getOpts(options[id], all);
      if (opts === null) {
        continue;
      }
      result.push({
        plugin,
        options: pluginOpts(chart2.config, {
          plugin,
          local: localIds[id]
        }, opts, context)
      });
    }
    return result;
  }
  function pluginOpts(config, { plugin, local }, opts, context) {
    const keys = config.pluginScopeKeys(plugin);
    const scopes = config.getOptionScopes(opts, keys);
    if (local && plugin.defaults) {
      scopes.push(plugin.defaults);
    }
    return config.createResolver(scopes, context, [
      ""
    ], {
      scriptable: false,
      indexable: false,
      allKeys: true
    });
  }
  function getIndexAxis(type, options) {
    const datasetDefaults = defaults.datasets[type] || {};
    const datasetOptions = (options.datasets || {})[type] || {};
    return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || "x";
  }
  function getAxisFromDefaultScaleID(id, indexAxis) {
    let axis = id;
    if (id === "_index_") {
      axis = indexAxis;
    } else if (id === "_value_") {
      axis = indexAxis === "x" ? "y" : "x";
    }
    return axis;
  }
  function getDefaultScaleIDFromAxis(axis, indexAxis) {
    return axis === indexAxis ? "_index_" : "_value_";
  }
  function idMatchesAxis(id) {
    if (id === "x" || id === "y" || id === "r") {
      return id;
    }
  }
  function axisFromPosition(position) {
    if (position === "top" || position === "bottom") {
      return "x";
    }
    if (position === "left" || position === "right") {
      return "y";
    }
  }
  function determineAxis(id, ...scaleOptions) {
    if (idMatchesAxis(id)) {
      return id;
    }
    for (const opts of scaleOptions) {
      const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
      if (axis) {
        return axis;
      }
    }
    throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
  }
  function getAxisFromDataset(id, axis, dataset) {
    if (dataset[axis + "AxisID"] === id) {
      return {
        axis
      };
    }
  }
  function retrieveAxisFromDatasets(id, config) {
    if (config.data && config.data.datasets) {
      const boundDs = config.data.datasets.filter((d3) => d3.xAxisID === id || d3.yAxisID === id);
      if (boundDs.length) {
        return getAxisFromDataset(id, "x", boundDs[0]) || getAxisFromDataset(id, "y", boundDs[0]);
      }
    }
    return {};
  }
  function mergeScaleConfig(config, options) {
    const chartDefaults = overrides[config.type] || {
      scales: {}
    };
    const configScales = options.scales || {};
    const chartIndexAxis = getIndexAxis(config.type, options);
    const scales2 = /* @__PURE__ */ Object.create(null);
    Object.keys(configScales).forEach((id) => {
      const scaleConf = configScales[id];
      if (!isObject(scaleConf)) {
        return console.error(`Invalid scale configuration for scale: ${id}`);
      }
      if (scaleConf._proxy) {
        return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
      }
      const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), defaults.scales[scaleConf.type]);
      const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
      const defaultScaleOptions = chartDefaults.scales || {};
      scales2[id] = mergeIf(/* @__PURE__ */ Object.create(null), [
        {
          axis
        },
        scaleConf,
        defaultScaleOptions[axis],
        defaultScaleOptions[defaultId]
      ]);
    });
    config.data.datasets.forEach((dataset) => {
      const type = dataset.type || config.type;
      const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
      const datasetDefaults = overrides[type] || {};
      const defaultScaleOptions = datasetDefaults.scales || {};
      Object.keys(defaultScaleOptions).forEach((defaultID) => {
        const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
        const id = dataset[axis + "AxisID"] || axis;
        scales2[id] = scales2[id] || /* @__PURE__ */ Object.create(null);
        mergeIf(scales2[id], [
          {
            axis
          },
          configScales[id],
          defaultScaleOptions[defaultID]
        ]);
      });
    });
    Object.keys(scales2).forEach((key) => {
      const scale = scales2[key];
      mergeIf(scale, [
        defaults.scales[scale.type],
        defaults.scale
      ]);
    });
    return scales2;
  }
  function initOptions(config) {
    const options = config.options || (config.options = {});
    options.plugins = valueOrDefault(options.plugins, {});
    options.scales = mergeScaleConfig(config, options);
  }
  function initData(data) {
    data = data || {};
    data.datasets = data.datasets || [];
    data.labels = data.labels || [];
    return data;
  }
  function initConfig(config) {
    config = config || {};
    config.data = initData(config.data);
    initOptions(config);
    return config;
  }
  function cachedKeys(cacheKey, generate) {
    let keys = keyCache.get(cacheKey);
    if (!keys) {
      keys = generate();
      keyCache.set(cacheKey, keys);
      keysCached.add(keys);
    }
    return keys;
  }
  function getResolver(resolverCache, scopes, prefixes) {
    let cache = resolverCache.get(scopes);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      resolverCache.set(scopes, cache);
    }
    const cacheKey = prefixes.join();
    let cached = cache.get(cacheKey);
    if (!cached) {
      const resolver = _createResolver(scopes, prefixes);
      cached = {
        resolver,
        subPrefixes: prefixes.filter((p3) => !p3.toLowerCase().includes("hover"))
      };
      cache.set(cacheKey, cached);
    }
    return cached;
  }
  function needContext(proxy, names2) {
    const { isScriptable, isIndexable } = _descriptors(proxy);
    for (const prop of names2) {
      const scriptable = isScriptable(prop);
      const indexable = isIndexable(prop);
      const value = (indexable || scriptable) && proxy[prop];
      if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
        return true;
      }
    }
    return false;
  }
  function positionIsHorizontal(position, axis) {
    return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
  }
  function compare2Level(l1, l22) {
    return function(a3, b3) {
      return a3[l1] === b3[l1] ? a3[l22] - b3[l22] : a3[l1] - b3[l1];
    };
  }
  function onAnimationsComplete(context) {
    const chart2 = context.chart;
    const animationOptions = chart2.options.animation;
    chart2.notifyPlugins("afterRender");
    callback(animationOptions && animationOptions.onComplete, [
      context
    ], chart2);
  }
  function onAnimationProgress(context) {
    const chart2 = context.chart;
    const animationOptions = chart2.options.animation;
    callback(animationOptions && animationOptions.onProgress, [
      context
    ], chart2);
  }
  function getCanvas(item) {
    if (_isDomSupported() && typeof item === "string") {
      item = document.getElementById(item);
    } else if (item && item.length) {
      item = item[0];
    }
    if (item && item.canvas) {
      item = item.canvas;
    }
    return item;
  }
  function moveNumericKeys(obj, start, move) {
    const keys = Object.keys(obj);
    for (const key of keys) {
      const intKey = +key;
      if (intKey >= start) {
        const value = obj[key];
        delete obj[key];
        if (move > 0 || intKey > start) {
          obj[intKey + move] = value;
        }
      }
    }
  }
  function determineLastEvent(e7, lastEvent, inChartArea, isClick) {
    if (!inChartArea || e7.type === "mouseout") {
      return null;
    }
    if (isClick) {
      return lastEvent;
    }
    return e7;
  }
  function invalidatePlugins() {
    return each(Chart.instances, (chart2) => chart2._plugins.invalidate());
  }
  function clipSelf(ctx, element, endAngle) {
    const { startAngle, x: x2, y: y3, outerRadius, innerRadius, options } = element;
    const { borderWidth, borderJoinStyle } = options;
    const outerAngleClip = Math.min(borderWidth / outerRadius, _normalizeAngle(startAngle - endAngle));
    ctx.beginPath();
    ctx.arc(x2, y3, outerRadius - borderWidth / 2, startAngle + outerAngleClip / 2, endAngle - outerAngleClip / 2);
    if (innerRadius > 0) {
      const innerAngleClip = Math.min(borderWidth / innerRadius, _normalizeAngle(startAngle - endAngle));
      ctx.arc(x2, y3, innerRadius + borderWidth / 2, endAngle - innerAngleClip / 2, startAngle + innerAngleClip / 2, true);
    } else {
      const clipWidth = Math.min(borderWidth / 2, outerRadius * _normalizeAngle(startAngle - endAngle));
      if (borderJoinStyle === "round") {
        ctx.arc(x2, y3, clipWidth, endAngle - PI / 2, startAngle + PI / 2, true);
      } else if (borderJoinStyle === "bevel") {
        const r6 = 2 * clipWidth * clipWidth;
        const endX = -r6 * Math.cos(endAngle + PI / 2) + x2;
        const endY = -r6 * Math.sin(endAngle + PI / 2) + y3;
        const startX = r6 * Math.cos(startAngle + PI / 2) + x2;
        const startY = r6 * Math.sin(startAngle + PI / 2) + y3;
        ctx.lineTo(endX, endY);
        ctx.lineTo(startX, startY);
      }
    }
    ctx.closePath();
    ctx.moveTo(0, 0);
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.clip("evenodd");
  }
  function clipArc(ctx, element, endAngle) {
    const { startAngle, pixelMargin, x: x2, y: y3, outerRadius, innerRadius } = element;
    let angleMargin = pixelMargin / outerRadius;
    ctx.beginPath();
    ctx.arc(x2, y3, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
    if (innerRadius > pixelMargin) {
      angleMargin = pixelMargin / innerRadius;
      ctx.arc(x2, y3, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
    } else {
      ctx.arc(x2, y3, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
    }
    ctx.closePath();
    ctx.clip();
  }
  function toRadiusCorners(value) {
    return _readValueToProps(value, [
      "outerStart",
      "outerEnd",
      "innerStart",
      "innerEnd"
    ]);
  }
  function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
    const o7 = toRadiusCorners(arc.options.borderRadius);
    const halfThickness = (outerRadius - innerRadius) / 2;
    const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
    const computeOuterLimit = (val) => {
      const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
      return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
    };
    return {
      outerStart: computeOuterLimit(o7.outerStart),
      outerEnd: computeOuterLimit(o7.outerEnd),
      innerStart: _limitValue(o7.innerStart, 0, innerLimit),
      innerEnd: _limitValue(o7.innerEnd, 0, innerLimit)
    };
  }
  function rThetaToXY(r6, theta, x2, y3) {
    return {
      x: x2 + r6 * Math.cos(theta),
      y: y3 + r6 * Math.sin(theta)
    };
  }
  function pathArc(ctx, element, offset, spacing, end, circular) {
    const { x: x2, y: y3, startAngle: start, pixelMargin, innerRadius: innerR } = element;
    const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
    const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
    let spacingOffset = 0;
    const alpha2 = end - start;
    if (spacing) {
      const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
      const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
      const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
      const adjustedAngle = avNogSpacingRadius !== 0 ? alpha2 * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha2;
      spacingOffset = (alpha2 - adjustedAngle) / 2;
    }
    const beta = Math.max(1e-3, alpha2 * outerRadius - offset / PI) / outerRadius;
    const angleOffset = (alpha2 - beta) / 2;
    const startAngle = start + angleOffset + spacingOffset;
    const endAngle = end - angleOffset - spacingOffset;
    const { outerStart, outerEnd, innerStart, innerEnd } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle);
    const outerStartAdjustedRadius = outerRadius - outerStart;
    const outerEndAdjustedRadius = outerRadius - outerEnd;
    const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
    const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
    const innerStartAdjustedRadius = innerRadius + innerStart;
    const innerEndAdjustedRadius = innerRadius + innerEnd;
    const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
    const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
    ctx.beginPath();
    if (circular) {
      const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
      ctx.arc(x2, y3, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
      ctx.arc(x2, y3, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
      if (outerEnd > 0) {
        const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x2, y3);
        ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
      }
      const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x2, y3);
      ctx.lineTo(p4.x, p4.y);
      if (innerEnd > 0) {
        const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x2, y3);
        ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
      }
      const innerMidAdjustedAngle = (endAngle - innerEnd / innerRadius + (startAngle + innerStart / innerRadius)) / 2;
      ctx.arc(x2, y3, innerRadius, endAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
      ctx.arc(x2, y3, innerRadius, innerMidAdjustedAngle, startAngle + innerStart / innerRadius, true);
      if (innerStart > 0) {
        const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x2, y3);
        ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
      }
      const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x2, y3);
      ctx.lineTo(p8.x, p8.y);
      if (outerStart > 0) {
        const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x2, y3);
        ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
      }
    } else {
      ctx.moveTo(x2, y3);
      const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x2;
      const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y3;
      ctx.lineTo(outerStartX, outerStartY);
      const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x2;
      const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y3;
      ctx.lineTo(outerEndX, outerEndY);
    }
    ctx.closePath();
  }
  function drawArc(ctx, element, offset, spacing, circular) {
    const { fullCircles, startAngle, circumference } = element;
    let endAngle = element.endAngle;
    if (fullCircles) {
      pathArc(ctx, element, offset, spacing, endAngle, circular);
      for (let i6 = 0; i6 < fullCircles; ++i6) {
        ctx.fill();
      }
      if (!isNaN(circumference)) {
        endAngle = startAngle + (circumference % TAU || TAU);
      }
    }
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.fill();
    return endAngle;
  }
  function drawBorder(ctx, element, offset, spacing, circular) {
    const { fullCircles, startAngle, circumference, options } = element;
    const { borderWidth, borderJoinStyle, borderDash, borderDashOffset, borderRadius } = options;
    const inner = options.borderAlign === "inner";
    if (!borderWidth) {
      return;
    }
    ctx.setLineDash(borderDash || []);
    ctx.lineDashOffset = borderDashOffset;
    if (inner) {
      ctx.lineWidth = borderWidth * 2;
      ctx.lineJoin = borderJoinStyle || "round";
    } else {
      ctx.lineWidth = borderWidth;
      ctx.lineJoin = borderJoinStyle || "bevel";
    }
    let endAngle = element.endAngle;
    if (fullCircles) {
      pathArc(ctx, element, offset, spacing, endAngle, circular);
      for (let i6 = 0; i6 < fullCircles; ++i6) {
        ctx.stroke();
      }
      if (!isNaN(circumference)) {
        endAngle = startAngle + (circumference % TAU || TAU);
      }
    }
    if (inner) {
      clipArc(ctx, element, endAngle);
    }
    if (options.selfJoin && endAngle - startAngle >= PI && borderRadius === 0 && borderJoinStyle !== "miter") {
      clipSelf(ctx, element, endAngle);
    }
    if (!fullCircles) {
      pathArc(ctx, element, offset, spacing, endAngle, circular);
      ctx.stroke();
    }
  }
  function setStyle(ctx, options, style = options) {
    ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
    ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
    ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
    ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
    ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
    ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
  }
  function lineTo(ctx, previous, target) {
    ctx.lineTo(target.x, target.y);
  }
  function getLineMethod(options) {
    if (options.stepped) {
      return _steppedLineTo;
    }
    if (options.tension || options.cubicInterpolationMode === "monotone") {
      return _bezierCurveTo;
    }
    return lineTo;
  }
  function pathVars(points, segment, params = {}) {
    const count = points.length;
    const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params;
    const { start: segmentStart, end: segmentEnd } = segment;
    const start = Math.max(paramsStart, segmentStart);
    const end = Math.min(paramsEnd, segmentEnd);
    const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
    return {
      count,
      start,
      loop: segment.loop,
      ilen: end < start && !outside ? count + end - start : end - start
    };
  }
  function pathSegment(ctx, line, segment, params) {
    const { points, options } = line;
    const { count, start, loop, ilen } = pathVars(points, segment, params);
    const lineMethod = getLineMethod(options);
    let { move = true, reverse } = params || {};
    let i6, point, prev;
    for (i6 = 0; i6 <= ilen; ++i6) {
      point = points[(start + (reverse ? ilen - i6 : i6)) % count];
      if (point.skip) {
        continue;
      } else if (move) {
        ctx.moveTo(point.x, point.y);
        move = false;
      } else {
        lineMethod(ctx, prev, point, reverse, options.stepped);
      }
      prev = point;
    }
    if (loop) {
      point = points[(start + (reverse ? ilen : 0)) % count];
      lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    return !!loop;
  }
  function fastPathSegment(ctx, line, segment, params) {
    const points = line.points;
    const { count, start, ilen } = pathVars(points, segment, params);
    const { move = true, reverse } = params || {};
    let avgX = 0;
    let countX = 0;
    let i6, point, prevX, minY, maxY, lastY;
    const pointIndex = (index2) => (start + (reverse ? ilen - index2 : index2)) % count;
    const drawX = () => {
      if (minY !== maxY) {
        ctx.lineTo(avgX, maxY);
        ctx.lineTo(avgX, minY);
        ctx.lineTo(avgX, lastY);
      }
    };
    if (move) {
      point = points[pointIndex(0)];
      ctx.moveTo(point.x, point.y);
    }
    for (i6 = 0; i6 <= ilen; ++i6) {
      point = points[pointIndex(i6)];
      if (point.skip) {
        continue;
      }
      const x2 = point.x;
      const y3 = point.y;
      const truncX = x2 | 0;
      if (truncX === prevX) {
        if (y3 < minY) {
          minY = y3;
        } else if (y3 > maxY) {
          maxY = y3;
        }
        avgX = (countX * avgX + x2) / ++countX;
      } else {
        drawX();
        ctx.lineTo(x2, y3);
        prevX = truncX;
        countX = 0;
        minY = maxY = y3;
      }
      lastY = y3;
    }
    drawX();
  }
  function _getSegmentMethod(line) {
    const opts = line.options;
    const borderDash = opts.borderDash && opts.borderDash.length;
    const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
    return useFastPath ? fastPathSegment : pathSegment;
  }
  function _getInterpolationMethod(options) {
    if (options.stepped) {
      return _steppedInterpolation;
    }
    if (options.tension || options.cubicInterpolationMode === "monotone") {
      return _bezierInterpolation;
    }
    return _pointInLine;
  }
  function strokePathWithCache(ctx, line, start, count) {
    let path = line._path;
    if (!path) {
      path = line._path = new Path2D();
      if (line.path(path, start, count)) {
        path.closePath();
      }
    }
    setStyle(ctx, line.options);
    ctx.stroke(path);
  }
  function strokePathDirect(ctx, line, start, count) {
    const { segments, options } = line;
    const segmentMethod = _getSegmentMethod(line);
    for (const segment of segments) {
      setStyle(ctx, options, segment.style);
      ctx.beginPath();
      if (segmentMethod(ctx, line, segment, {
        start,
        end: start + count - 1
      })) {
        ctx.closePath();
      }
      ctx.stroke();
    }
  }
  function draw(ctx, line, start, count) {
    if (usePath2D && !line.options.segment) {
      strokePathWithCache(ctx, line, start, count);
    } else {
      strokePathDirect(ctx, line, start, count);
    }
  }
  function inRange$1(el2, pos, axis, useFinalPosition) {
    const options = el2.options;
    const { [axis]: value } = el2.getProps([
      axis
    ], useFinalPosition);
    return Math.abs(pos - value) < options.radius + options.hitRadius;
  }
  function getBarBounds(bar, useFinalPosition) {
    const { x: x2, y: y3, base, width, height } = bar.getProps([
      "x",
      "y",
      "base",
      "width",
      "height"
    ], useFinalPosition);
    let left, right, top, bottom, half;
    if (bar.horizontal) {
      half = height / 2;
      left = Math.min(x2, base);
      right = Math.max(x2, base);
      top = y3 - half;
      bottom = y3 + half;
    } else {
      half = width / 2;
      left = x2 - half;
      right = x2 + half;
      top = Math.min(y3, base);
      bottom = Math.max(y3, base);
    }
    return {
      left,
      top,
      right,
      bottom
    };
  }
  function skipOrLimit(skip2, value, min, max) {
    return skip2 ? 0 : _limitValue(value, min, max);
  }
  function parseBorderWidth(bar, maxW, maxH) {
    const value = bar.options.borderWidth;
    const skip2 = bar.borderSkipped;
    const o7 = toTRBL(value);
    return {
      t: skipOrLimit(skip2.top, o7.top, 0, maxH),
      r: skipOrLimit(skip2.right, o7.right, 0, maxW),
      b: skipOrLimit(skip2.bottom, o7.bottom, 0, maxH),
      l: skipOrLimit(skip2.left, o7.left, 0, maxW)
    };
  }
  function parseBorderRadius(bar, maxW, maxH) {
    const { enableBorderRadius } = bar.getProps([
      "enableBorderRadius"
    ]);
    const value = bar.options.borderRadius;
    const o7 = toTRBLCorners(value);
    const maxR = Math.min(maxW, maxH);
    const skip2 = bar.borderSkipped;
    const enableBorder = enableBorderRadius || isObject(value);
    return {
      topLeft: skipOrLimit(!enableBorder || skip2.top || skip2.left, o7.topLeft, 0, maxR),
      topRight: skipOrLimit(!enableBorder || skip2.top || skip2.right, o7.topRight, 0, maxR),
      bottomLeft: skipOrLimit(!enableBorder || skip2.bottom || skip2.left, o7.bottomLeft, 0, maxR),
      bottomRight: skipOrLimit(!enableBorder || skip2.bottom || skip2.right, o7.bottomRight, 0, maxR)
    };
  }
  function boundingRects(bar) {
    const bounds = getBarBounds(bar);
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const border = parseBorderWidth(bar, width / 2, height / 2);
    const radius = parseBorderRadius(bar, width / 2, height / 2);
    return {
      outer: {
        x: bounds.left,
        y: bounds.top,
        w: width,
        h: height,
        radius
      },
      inner: {
        x: bounds.left + border.l,
        y: bounds.top + border.t,
        w: width - border.l - border.r,
        h: height - border.t - border.b,
        radius: {
          topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
          topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
          bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
          bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
        }
      }
    };
  }
  function inRange(bar, x2, y3, useFinalPosition) {
    const skipX = x2 === null;
    const skipY = y3 === null;
    const skipBoth = skipX && skipY;
    const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
    return bounds && (skipX || _isBetween(x2, bounds.left, bounds.right)) && (skipY || _isBetween(y3, bounds.top, bounds.bottom));
  }
  function hasRadius(radius) {
    return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
  }
  function addNormalRectPath(ctx, rect) {
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
  }
  function inflateRect(rect, amount, refRect = {}) {
    const x2 = rect.x !== refRect.x ? -amount : 0;
    const y3 = rect.y !== refRect.y ? -amount : 0;
    const w2 = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x2;
    const h4 = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y3;
    return {
      x: rect.x + x2,
      y: rect.y + y3,
      w: rect.w + w2,
      h: rect.h + h4,
      radius: rect.radius
    };
  }
  function getBorderColor(i6) {
    return BORDER_COLORS[i6 % BORDER_COLORS.length];
  }
  function getBackgroundColor(i6) {
    return BACKGROUND_COLORS[i6 % BACKGROUND_COLORS.length];
  }
  function colorizeDefaultDataset(dataset, i6) {
    dataset.borderColor = getBorderColor(i6);
    dataset.backgroundColor = getBackgroundColor(i6);
    return ++i6;
  }
  function colorizeDoughnutDataset(dataset, i6) {
    dataset.backgroundColor = dataset.data.map(() => getBorderColor(i6++));
    return i6;
  }
  function colorizePolarAreaDataset(dataset, i6) {
    dataset.backgroundColor = dataset.data.map(() => getBackgroundColor(i6++));
    return i6;
  }
  function getColorizer(chart2) {
    let i6 = 0;
    return (dataset, datasetIndex) => {
      const controller = chart2.getDatasetMeta(datasetIndex).controller;
      if (controller instanceof DoughnutController) {
        i6 = colorizeDoughnutDataset(dataset, i6);
      } else if (controller instanceof PolarAreaController) {
        i6 = colorizePolarAreaDataset(dataset, i6);
      } else if (controller) {
        i6 = colorizeDefaultDataset(dataset, i6);
      }
    };
  }
  function containsColorsDefinitions(descriptors2) {
    let k2;
    for (k2 in descriptors2) {
      if (descriptors2[k2].borderColor || descriptors2[k2].backgroundColor) {
        return true;
      }
    }
    return false;
  }
  function containsColorsDefinition(descriptor) {
    return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
  }
  function containsDefaultColorsDefenitions() {
    return defaults.borderColor !== "rgba(0,0,0,0.1)" || defaults.backgroundColor !== "rgba(0,0,0,0.1)";
  }
  function lttbDecimation(data, start, count, availableWidth, options) {
    const samples = options.samples || availableWidth;
    if (samples >= count) {
      return data.slice(start, start + count);
    }
    const decimated = [];
    const bucketWidth = (count - 2) / (samples - 2);
    let sampledIndex = 0;
    const endIndex = start + count - 1;
    let a3 = start;
    let i6, maxAreaPoint, maxArea, area, nextA;
    decimated[sampledIndex++] = data[a3];
    for (i6 = 0; i6 < samples - 2; i6++) {
      let avgX = 0;
      let avgY = 0;
      let j;
      const avgRangeStart = Math.floor((i6 + 1) * bucketWidth) + 1 + start;
      const avgRangeEnd = Math.min(Math.floor((i6 + 2) * bucketWidth) + 1, count) + start;
      const avgRangeLength = avgRangeEnd - avgRangeStart;
      for (j = avgRangeStart; j < avgRangeEnd; j++) {
        avgX += data[j].x;
        avgY += data[j].y;
      }
      avgX /= avgRangeLength;
      avgY /= avgRangeLength;
      const rangeOffs = Math.floor(i6 * bucketWidth) + 1 + start;
      const rangeTo = Math.min(Math.floor((i6 + 1) * bucketWidth) + 1, count) + start;
      const { x: pointAx, y: pointAy } = data[a3];
      maxArea = area = -1;
      for (j = rangeOffs; j < rangeTo; j++) {
        area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
        if (area > maxArea) {
          maxArea = area;
          maxAreaPoint = data[j];
          nextA = j;
        }
      }
      decimated[sampledIndex++] = maxAreaPoint;
      a3 = nextA;
    }
    decimated[sampledIndex++] = data[endIndex];
    return decimated;
  }
  function minMaxDecimation(data, start, count, availableWidth) {
    let avgX = 0;
    let countX = 0;
    let i6, point, x2, y3, prevX, minIndex, maxIndex, startIndex, minY, maxY;
    const decimated = [];
    const endIndex = start + count - 1;
    const xMin = data[start].x;
    const xMax = data[endIndex].x;
    const dx = xMax - xMin;
    for (i6 = start; i6 < start + count; ++i6) {
      point = data[i6];
      x2 = (point.x - xMin) / dx * availableWidth;
      y3 = point.y;
      const truncX = x2 | 0;
      if (truncX === prevX) {
        if (y3 < minY) {
          minY = y3;
          minIndex = i6;
        } else if (y3 > maxY) {
          maxY = y3;
          maxIndex = i6;
        }
        avgX = (countX * avgX + point.x) / ++countX;
      } else {
        const lastIndex = i6 - 1;
        if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
          const intermediateIndex1 = Math.min(minIndex, maxIndex);
          const intermediateIndex2 = Math.max(minIndex, maxIndex);
          if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
            decimated.push({
              ...data[intermediateIndex1],
              x: avgX
            });
          }
          if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
            decimated.push({
              ...data[intermediateIndex2],
              x: avgX
            });
          }
        }
        if (i6 > 0 && lastIndex !== startIndex) {
          decimated.push(data[lastIndex]);
        }
        decimated.push(point);
        prevX = truncX;
        countX = 0;
        minY = maxY = y3;
        minIndex = maxIndex = startIndex = i6;
      }
    }
    return decimated;
  }
  function cleanDecimatedDataset(dataset) {
    if (dataset._decimated) {
      const data = dataset._data;
      delete dataset._decimated;
      delete dataset._data;
      Object.defineProperty(dataset, "data", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: data
      });
    }
  }
  function cleanDecimatedData(chart2) {
    chart2.data.datasets.forEach((dataset) => {
      cleanDecimatedDataset(dataset);
    });
  }
  function getStartAndCountOfVisiblePointsSimplified(meta, points) {
    const pointCount = points.length;
    let start = 0;
    let count;
    const { iScale } = meta;
    const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
    if (minDefined) {
      start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
    }
    if (maxDefined) {
      count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
    return {
      start,
      count
    };
  }
  function _segments(line, target, property) {
    const segments = line.segments;
    const points = line.points;
    const tpoints = target.points;
    const parts = [];
    for (const segment of segments) {
      let { start, end } = segment;
      end = _findSegmentEnd(start, end, points);
      const bounds = _getBounds(property, points[start], points[end], segment.loop);
      if (!target.segments) {
        parts.push({
          source: segment,
          target: bounds,
          start: points[start],
          end: points[end]
        });
        continue;
      }
      const targetSegments = _boundSegments(target, bounds);
      for (const tgt of targetSegments) {
        const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
        const fillSources = _boundSegment(segment, points, subBounds);
        for (const fillSource of fillSources) {
          parts.push({
            source: fillSource,
            target: tgt,
            start: {
              [property]: _getEdge(bounds, subBounds, "start", Math.max)
            },
            end: {
              [property]: _getEdge(bounds, subBounds, "end", Math.min)
            }
          });
        }
      }
    }
    return parts;
  }
  function _getBounds(property, first, last, loop) {
    if (loop) {
      return;
    }
    let start = first[property];
    let end = last[property];
    if (property === "angle") {
      start = _normalizeAngle(start);
      end = _normalizeAngle(end);
    }
    return {
      property,
      start,
      end
    };
  }
  function _pointsFromSegments(boundary, line) {
    const { x: x2 = null, y: y3 = null } = boundary || {};
    const linePoints = line.points;
    const points = [];
    line.segments.forEach(({ start, end }) => {
      end = _findSegmentEnd(start, end, linePoints);
      const first = linePoints[start];
      const last = linePoints[end];
      if (y3 !== null) {
        points.push({
          x: first.x,
          y: y3
        });
        points.push({
          x: last.x,
          y: y3
        });
      } else if (x2 !== null) {
        points.push({
          x: x2,
          y: first.y
        });
        points.push({
          x: x2,
          y: last.y
        });
      }
    });
    return points;
  }
  function _findSegmentEnd(start, end, points) {
    for (; end > start; end--) {
      const point = points[end];
      if (!isNaN(point.x) && !isNaN(point.y)) {
        break;
      }
    }
    return end;
  }
  function _getEdge(a3, b3, prop, fn) {
    if (a3 && b3) {
      return fn(a3[prop], b3[prop]);
    }
    return a3 ? a3[prop] : b3 ? b3[prop] : 0;
  }
  function _createBoundaryLine(boundary, line) {
    let points = [];
    let _loop = false;
    if (isArray(boundary)) {
      _loop = true;
      points = boundary;
    } else {
      points = _pointsFromSegments(boundary, line);
    }
    return points.length ? new LineElement({
      points,
      options: {
        tension: 0
      },
      _loop,
      _fullLoop: _loop
    }) : null;
  }
  function _shouldApplyFill(source) {
    return source && source.fill !== false;
  }
  function _resolveTarget(sources, index2, propagate) {
    const source = sources[index2];
    let fill2 = source.fill;
    const visited = [
      index2
    ];
    let target;
    if (!propagate) {
      return fill2;
    }
    while (fill2 !== false && visited.indexOf(fill2) === -1) {
      if (!isNumberFinite(fill2)) {
        return fill2;
      }
      target = sources[fill2];
      if (!target) {
        return false;
      }
      if (target.visible) {
        return fill2;
      }
      visited.push(fill2);
      fill2 = target.fill;
    }
    return false;
  }
  function _decodeFill(line, index2, count) {
    const fill2 = parseFillOption(line);
    if (isObject(fill2)) {
      return isNaN(fill2.value) ? false : fill2;
    }
    let target = parseFloat(fill2);
    if (isNumberFinite(target) && Math.floor(target) === target) {
      return decodeTargetIndex(fill2[0], index2, target, count);
    }
    return [
      "origin",
      "start",
      "end",
      "stack",
      "shape"
    ].indexOf(fill2) >= 0 && fill2;
  }
  function decodeTargetIndex(firstCh, index2, target, count) {
    if (firstCh === "-" || firstCh === "+") {
      target = index2 + target;
    }
    if (target === index2 || target < 0 || target >= count) {
      return false;
    }
    return target;
  }
  function _getTargetPixel(fill2, scale) {
    let pixel = null;
    if (fill2 === "start") {
      pixel = scale.bottom;
    } else if (fill2 === "end") {
      pixel = scale.top;
    } else if (isObject(fill2)) {
      pixel = scale.getPixelForValue(fill2.value);
    } else if (scale.getBasePixel) {
      pixel = scale.getBasePixel();
    }
    return pixel;
  }
  function _getTargetValue(fill2, scale, startValue) {
    let value;
    if (fill2 === "start") {
      value = startValue;
    } else if (fill2 === "end") {
      value = scale.options.reverse ? scale.min : scale.max;
    } else if (isObject(fill2)) {
      value = fill2.value;
    } else {
      value = scale.getBaseValue();
    }
    return value;
  }
  function parseFillOption(line) {
    const options = line.options;
    const fillOption = options.fill;
    let fill2 = valueOrDefault(fillOption && fillOption.target, fillOption);
    if (fill2 === void 0) {
      fill2 = !!options.backgroundColor;
    }
    if (fill2 === false || fill2 === null) {
      return false;
    }
    if (fill2 === true) {
      return "origin";
    }
    return fill2;
  }
  function _buildStackLine(source) {
    const { scale, index: index2, line } = source;
    const points = [];
    const segments = line.segments;
    const sourcePoints = line.points;
    const linesBelow = getLinesBelow(scale, index2);
    linesBelow.push(_createBoundaryLine({
      x: null,
      y: scale.bottom
    }, line));
    for (let i6 = 0; i6 < segments.length; i6++) {
      const segment = segments[i6];
      for (let j = segment.start; j <= segment.end; j++) {
        addPointsBelow(points, sourcePoints[j], linesBelow);
      }
    }
    return new LineElement({
      points,
      options: {}
    });
  }
  function getLinesBelow(scale, index2) {
    const below = [];
    const metas = scale.getMatchingVisibleMetas("line");
    for (let i6 = 0; i6 < metas.length; i6++) {
      const meta = metas[i6];
      if (meta.index === index2) {
        break;
      }
      if (!meta.hidden) {
        below.unshift(meta.dataset);
      }
    }
    return below;
  }
  function addPointsBelow(points, sourcePoint, linesBelow) {
    const postponed = [];
    for (let j = 0; j < linesBelow.length; j++) {
      const line = linesBelow[j];
      const { first, last, point } = findPoint(line, sourcePoint, "x");
      if (!point || first && last) {
        continue;
      }
      if (first) {
        postponed.unshift(point);
      } else {
        points.push(point);
        if (!last) {
          break;
        }
      }
    }
    points.push(...postponed);
  }
  function findPoint(line, sourcePoint, property) {
    const point = line.interpolate(sourcePoint, property);
    if (!point) {
      return {};
    }
    const pointValue = point[property];
    const segments = line.segments;
    const linePoints = line.points;
    let first = false;
    let last = false;
    for (let i6 = 0; i6 < segments.length; i6++) {
      const segment = segments[i6];
      const firstValue = linePoints[segment.start][property];
      const lastValue = linePoints[segment.end][property];
      if (_isBetween(pointValue, firstValue, lastValue)) {
        first = pointValue === firstValue;
        last = pointValue === lastValue;
        break;
      }
    }
    return {
      first,
      last,
      point
    };
  }
  function _getTarget(source) {
    const { chart: chart2, fill: fill2, line } = source;
    if (isNumberFinite(fill2)) {
      return getLineByIndex(chart2, fill2);
    }
    if (fill2 === "stack") {
      return _buildStackLine(source);
    }
    if (fill2 === "shape") {
      return true;
    }
    const boundary = computeBoundary(source);
    if (boundary instanceof simpleArc) {
      return boundary;
    }
    return _createBoundaryLine(boundary, line);
  }
  function getLineByIndex(chart2, index2) {
    const meta = chart2.getDatasetMeta(index2);
    const visible = meta && chart2.isDatasetVisible(index2);
    return visible ? meta.dataset : null;
  }
  function computeBoundary(source) {
    const scale = source.scale || {};
    if (scale.getPointPositionForValue) {
      return computeCircularBoundary(source);
    }
    return computeLinearBoundary(source);
  }
  function computeLinearBoundary(source) {
    const { scale = {}, fill: fill2 } = source;
    const pixel = _getTargetPixel(fill2, scale);
    if (isNumberFinite(pixel)) {
      const horizontal = scale.isHorizontal();
      return {
        x: horizontal ? pixel : null,
        y: horizontal ? null : pixel
      };
    }
    return null;
  }
  function computeCircularBoundary(source) {
    const { scale, fill: fill2 } = source;
    const options = scale.options;
    const length = scale.getLabels().length;
    const start = options.reverse ? scale.max : scale.min;
    const value = _getTargetValue(fill2, scale, start);
    const target = [];
    if (options.grid.circular) {
      const center = scale.getPointPositionForValue(0, start);
      return new simpleArc({
        x: center.x,
        y: center.y,
        radius: scale.getDistanceFromCenterForValue(value)
      });
    }
    for (let i6 = 0; i6 < length; ++i6) {
      target.push(scale.getPointPositionForValue(i6, value));
    }
    return target;
  }
  function _drawfill(ctx, source, area) {
    const target = _getTarget(source);
    const { chart: chart2, index: index2, line, scale, axis } = source;
    const lineOpts = line.options;
    const fillOption = lineOpts.fill;
    const color2 = lineOpts.backgroundColor;
    const { above = color2, below = color2 } = fillOption || {};
    const meta = chart2.getDatasetMeta(index2);
    const clip = getDatasetClipArea(chart2, meta);
    if (target && line.points.length) {
      clipArea(ctx, area);
      doFill(ctx, {
        line,
        target,
        above,
        below,
        area,
        scale,
        axis,
        clip
      });
      unclipArea(ctx);
    }
  }
  function doFill(ctx, cfg) {
    const { line, target, above, below, area, scale, clip } = cfg;
    const property = line._loop ? "angle" : cfg.axis;
    ctx.save();
    let fillColor = below;
    if (below !== above) {
      if (property === "x") {
        clipVertical(ctx, target, area.top);
        fill(ctx, {
          line,
          target,
          color: above,
          scale,
          property,
          clip
        });
        ctx.restore();
        ctx.save();
        clipVertical(ctx, target, area.bottom);
      } else if (property === "y") {
        clipHorizontal(ctx, target, area.left);
        fill(ctx, {
          line,
          target,
          color: below,
          scale,
          property,
          clip
        });
        ctx.restore();
        ctx.save();
        clipHorizontal(ctx, target, area.right);
        fillColor = above;
      }
    }
    fill(ctx, {
      line,
      target,
      color: fillColor,
      scale,
      property,
      clip
    });
    ctx.restore();
  }
  function clipVertical(ctx, target, clipY) {
    const { segments, points } = target;
    let first = true;
    let lineLoop = false;
    ctx.beginPath();
    for (const segment of segments) {
      const { start, end } = segment;
      const firstPoint = points[start];
      const lastPoint = points[_findSegmentEnd(start, end, points)];
      if (first) {
        ctx.moveTo(firstPoint.x, firstPoint.y);
        first = false;
      } else {
        ctx.lineTo(firstPoint.x, clipY);
        ctx.lineTo(firstPoint.x, firstPoint.y);
      }
      lineLoop = !!target.pathSegment(ctx, segment, {
        move: lineLoop
      });
      if (lineLoop) {
        ctx.closePath();
      } else {
        ctx.lineTo(lastPoint.x, clipY);
      }
    }
    ctx.lineTo(target.first().x, clipY);
    ctx.closePath();
    ctx.clip();
  }
  function clipHorizontal(ctx, target, clipX) {
    const { segments, points } = target;
    let first = true;
    let lineLoop = false;
    ctx.beginPath();
    for (const segment of segments) {
      const { start, end } = segment;
      const firstPoint = points[start];
      const lastPoint = points[_findSegmentEnd(start, end, points)];
      if (first) {
        ctx.moveTo(firstPoint.x, firstPoint.y);
        first = false;
      } else {
        ctx.lineTo(clipX, firstPoint.y);
        ctx.lineTo(firstPoint.x, firstPoint.y);
      }
      lineLoop = !!target.pathSegment(ctx, segment, {
        move: lineLoop
      });
      if (lineLoop) {
        ctx.closePath();
      } else {
        ctx.lineTo(clipX, lastPoint.y);
      }
    }
    ctx.lineTo(clipX, target.first().y);
    ctx.closePath();
    ctx.clip();
  }
  function fill(ctx, cfg) {
    const { line, target, property, color: color2, scale, clip } = cfg;
    const segments = _segments(line, target, property);
    for (const { source: src, target: tgt, start, end } of segments) {
      const { style: { backgroundColor = color2 } = {} } = src;
      const notShape = target !== true;
      ctx.save();
      ctx.fillStyle = backgroundColor;
      clipBounds(ctx, scale, clip, notShape && _getBounds(property, start, end));
      ctx.beginPath();
      const lineLoop = !!line.pathSegment(ctx, src);
      let loop;
      if (notShape) {
        if (lineLoop) {
          ctx.closePath();
        } else {
          interpolatedLineTo(ctx, target, end, property);
        }
        const targetLoop = !!target.pathSegment(ctx, tgt, {
          move: lineLoop,
          reverse: true
        });
        loop = lineLoop && targetLoop;
        if (!loop) {
          interpolatedLineTo(ctx, target, start, property);
        }
      }
      ctx.closePath();
      ctx.fill(loop ? "evenodd" : "nonzero");
      ctx.restore();
    }
  }
  function clipBounds(ctx, scale, clip, bounds) {
    const chartArea = scale.chart.chartArea;
    const { property, start, end } = bounds || {};
    if (property === "x" || property === "y") {
      let left, top, right, bottom;
      if (property === "x") {
        left = start;
        top = chartArea.top;
        right = end;
        bottom = chartArea.bottom;
      } else {
        left = chartArea.left;
        top = start;
        right = chartArea.right;
        bottom = end;
      }
      ctx.beginPath();
      if (clip) {
        left = Math.max(left, clip.left);
        right = Math.min(right, clip.right);
        top = Math.max(top, clip.top);
        bottom = Math.min(bottom, clip.bottom);
      }
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();
    }
  }
  function interpolatedLineTo(ctx, target, point, property) {
    const interpolatedPoint = target.interpolate(point, property);
    if (interpolatedPoint) {
      ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
    }
  }
  function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
    const itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
    const itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
    return {
      itemWidth,
      itemHeight
    };
  }
  function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
    let legendItemText = legendItem.text;
    if (legendItemText && typeof legendItemText !== "string") {
      legendItemText = legendItemText.reduce((a3, b3) => a3.length > b3.length ? a3 : b3);
    }
    return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
  }
  function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
    let itemHeight = _itemHeight;
    if (typeof legendItem.text !== "string") {
      itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
    }
    return itemHeight;
  }
  function calculateLegendItemHeight(legendItem, fontLineHeight) {
    const labelHeight = legendItem.text ? legendItem.text.length : 0;
    return fontLineHeight * labelHeight;
  }
  function isListened(type, opts) {
    if ((type === "mousemove" || type === "mouseout") && (opts.onHover || opts.onLeave)) {
      return true;
    }
    if (opts.onClick && (type === "click" || type === "mouseup")) {
      return true;
    }
    return false;
  }
  function createTitle(chart2, titleOpts) {
    const title = new Title({
      ctx: chart2.ctx,
      options: titleOpts,
      chart: chart2
    });
    layouts.configure(chart2, title, titleOpts);
    layouts.addBox(chart2, title);
    chart2.titleBlock = title;
  }
  function pushOrConcat(base, toPush) {
    if (toPush) {
      if (isArray(toPush)) {
        Array.prototype.push.apply(base, toPush);
      } else {
        base.push(toPush);
      }
    }
    return base;
  }
  function splitNewlines(str) {
    if ((typeof str === "string" || str instanceof String) && str.indexOf("\n") > -1) {
      return str.split("\n");
    }
    return str;
  }
  function createTooltipItem(chart2, item) {
    const { element, datasetIndex, index: index2 } = item;
    const controller = chart2.getDatasetMeta(datasetIndex).controller;
    const { label, value } = controller.getLabelAndValue(index2);
    return {
      chart: chart2,
      label,
      parsed: controller.getParsed(index2),
      raw: chart2.data.datasets[datasetIndex].data[index2],
      formattedValue: value,
      dataset: controller.getDataset(),
      dataIndex: index2,
      datasetIndex,
      element
    };
  }
  function getTooltipSize(tooltip, options) {
    const ctx = tooltip.chart.ctx;
    const { body, footer, title } = tooltip;
    const { boxWidth, boxHeight } = options;
    const bodyFont = toFont(options.bodyFont);
    const titleFont = toFont(options.titleFont);
    const footerFont = toFont(options.footerFont);
    const titleLineCount = title.length;
    const footerLineCount = footer.length;
    const bodyLineItemCount = body.length;
    const padding = toPadding(options.padding);
    let height = padding.height;
    let width = 0;
    let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
    combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
    if (titleLineCount) {
      height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
    }
    if (combinedBodyLength) {
      const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
      height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
    }
    if (footerLineCount) {
      height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
    }
    let widthPadding = 0;
    const maxLineWidth = function(line) {
      width = Math.max(width, ctx.measureText(line).width + widthPadding);
    };
    ctx.save();
    ctx.font = titleFont.string;
    each(tooltip.title, maxLineWidth);
    ctx.font = bodyFont.string;
    each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
    widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
    each(body, (bodyItem) => {
      each(bodyItem.before, maxLineWidth);
      each(bodyItem.lines, maxLineWidth);
      each(bodyItem.after, maxLineWidth);
    });
    widthPadding = 0;
    ctx.font = footerFont.string;
    each(tooltip.footer, maxLineWidth);
    ctx.restore();
    width += padding.width;
    return {
      width,
      height
    };
  }
  function determineYAlign(chart2, size) {
    const { y: y3, height } = size;
    if (y3 < height / 2) {
      return "top";
    } else if (y3 > chart2.height - height / 2) {
      return "bottom";
    }
    return "center";
  }
  function doesNotFitWithAlign(xAlign, chart2, options, size) {
    const { x: x2, width } = size;
    const caret = options.caretSize + options.caretPadding;
    if (xAlign === "left" && x2 + width + caret > chart2.width) {
      return true;
    }
    if (xAlign === "right" && x2 - width - caret < 0) {
      return true;
    }
  }
  function determineXAlign(chart2, options, size, yAlign) {
    const { x: x2, width } = size;
    const { width: chartWidth, chartArea: { left, right } } = chart2;
    let xAlign = "center";
    if (yAlign === "center") {
      xAlign = x2 <= (left + right) / 2 ? "left" : "right";
    } else if (x2 <= width / 2) {
      xAlign = "left";
    } else if (x2 >= chartWidth - width / 2) {
      xAlign = "right";
    }
    if (doesNotFitWithAlign(xAlign, chart2, options, size)) {
      xAlign = "center";
    }
    return xAlign;
  }
  function determineAlignment(chart2, options, size) {
    const yAlign = size.yAlign || options.yAlign || determineYAlign(chart2, size);
    return {
      xAlign: size.xAlign || options.xAlign || determineXAlign(chart2, options, size, yAlign),
      yAlign
    };
  }
  function alignX(size, xAlign) {
    let { x: x2, width } = size;
    if (xAlign === "right") {
      x2 -= width;
    } else if (xAlign === "center") {
      x2 -= width / 2;
    }
    return x2;
  }
  function alignY(size, yAlign, paddingAndSize) {
    let { y: y3, height } = size;
    if (yAlign === "top") {
      y3 += paddingAndSize;
    } else if (yAlign === "bottom") {
      y3 -= height + paddingAndSize;
    } else {
      y3 -= height / 2;
    }
    return y3;
  }
  function getBackgroundPoint(options, size, alignment, chart2) {
    const { caretSize, caretPadding, cornerRadius } = options;
    const { xAlign, yAlign } = alignment;
    const paddingAndSize = caretSize + caretPadding;
    const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
    let x2 = alignX(size, xAlign);
    const y3 = alignY(size, yAlign, paddingAndSize);
    if (yAlign === "center") {
      if (xAlign === "left") {
        x2 += paddingAndSize;
      } else if (xAlign === "right") {
        x2 -= paddingAndSize;
      }
    } else if (xAlign === "left") {
      x2 -= Math.max(topLeft, bottomLeft) + caretSize;
    } else if (xAlign === "right") {
      x2 += Math.max(topRight, bottomRight) + caretSize;
    }
    return {
      x: _limitValue(x2, 0, chart2.width - size.width),
      y: _limitValue(y3, 0, chart2.height - size.height)
    };
  }
  function getAlignedX(tooltip, align, options) {
    const padding = toPadding(options.padding);
    return align === "center" ? tooltip.x + tooltip.width / 2 : align === "right" ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
  }
  function getBeforeAfterBodyLines(callback2) {
    return pushOrConcat([], splitNewlines(callback2));
  }
  function createTooltipContext(parent, tooltip, tooltipItems) {
    return createContext(parent, {
      tooltip,
      tooltipItems,
      type: "tooltip"
    });
  }
  function overrideCallbacks(callbacks, context) {
    const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
    return override ? callbacks.override(override) : callbacks;
  }
  function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
    const result = callbacks[name].call(ctx, arg);
    if (typeof result === "undefined") {
      return defaultCallbacks[name].call(ctx, arg);
    }
    return result;
  }
  function findOrAddLabel(labels, raw, index2, addedLabels) {
    const first = labels.indexOf(raw);
    if (first === -1) {
      return addIfString(labels, raw, index2, addedLabels);
    }
    const last = labels.lastIndexOf(raw);
    return first !== last ? index2 : first;
  }
  function _getLabelForValue(value) {
    const labels = this.getLabels();
    if (value >= 0 && value < labels.length) {
      return labels[value];
    }
    return value;
  }
  function generateTicks$1(generationOptions, dataRange) {
    const ticks = [];
    const MIN_SPACING = 1e-14;
    const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions;
    const unit = step || 1;
    const maxSpaces = maxTicks - 1;
    const { min: rmin, max: rmax } = dataRange;
    const minDefined = !isNullOrUndef(min);
    const maxDefined = !isNullOrUndef(max);
    const countDefined = !isNullOrUndef(count);
    const minSpacing = (rmax - rmin) / (maxDigits + 1);
    let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
    let factor, niceMin, niceMax, numSpaces;
    if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
      return [
        {
          value: rmin
        },
        {
          value: rmax
        }
      ];
    }
    numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
    if (numSpaces > maxSpaces) {
      spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
    }
    if (!isNullOrUndef(precision)) {
      factor = Math.pow(10, precision);
      spacing = Math.ceil(spacing * factor) / factor;
    }
    if (bounds === "ticks") {
      niceMin = Math.floor(rmin / spacing) * spacing;
      niceMax = Math.ceil(rmax / spacing) * spacing;
    } else {
      niceMin = rmin;
      niceMax = rmax;
    }
    if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
      numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
      spacing = (max - min) / numSpaces;
      niceMin = min;
      niceMax = max;
    } else if (countDefined) {
      niceMin = minDefined ? min : niceMin;
      niceMax = maxDefined ? max : niceMax;
      numSpaces = count - 1;
      spacing = (niceMax - niceMin) / numSpaces;
    } else {
      numSpaces = (niceMax - niceMin) / spacing;
      if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
        numSpaces = Math.round(numSpaces);
      } else {
        numSpaces = Math.ceil(numSpaces);
      }
    }
    const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
    factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
    niceMin = Math.round(niceMin * factor) / factor;
    niceMax = Math.round(niceMax * factor) / factor;
    let j = 0;
    if (minDefined) {
      if (includeBounds && niceMin !== min) {
        ticks.push({
          value: min
        });
        if (niceMin < min) {
          j++;
        }
        if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
          j++;
        }
      } else if (niceMin < min) {
        j++;
      }
    }
    for (; j < numSpaces; ++j) {
      const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
      if (maxDefined && tickValue > max) {
        break;
      }
      ticks.push({
        value: tickValue
      });
    }
    if (maxDefined && includeBounds && niceMax !== max) {
      if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
        ticks[ticks.length - 1].value = max;
      } else {
        ticks.push({
          value: max
        });
      }
    } else if (!maxDefined || niceMax === max) {
      ticks.push({
        value: niceMax
      });
    }
    return ticks;
  }
  function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) {
    const rad = toRadians(minRotation);
    const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
    const length = 0.75 * minSpacing * ("" + value).length;
    return Math.min(minSpacing / ratio, length);
  }
  function isMajor(tickVal) {
    const remain = tickVal / Math.pow(10, log10Floor(tickVal));
    return remain === 1;
  }
  function steps(min, max, rangeExp) {
    const rangeStep = Math.pow(10, rangeExp);
    const start = Math.floor(min / rangeStep);
    const end = Math.ceil(max / rangeStep);
    return end - start;
  }
  function startExp(min, max) {
    const range = max - min;
    let rangeExp = log10Floor(range);
    while (steps(min, max, rangeExp) > 10) {
      rangeExp++;
    }
    while (steps(min, max, rangeExp) < 10) {
      rangeExp--;
    }
    return Math.min(rangeExp, log10Floor(min));
  }
  function generateTicks(generationOptions, { min, max }) {
    min = finiteOrDefault(generationOptions.min, min);
    const ticks = [];
    const minExp = log10Floor(min);
    let exp = startExp(min, max);
    let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
    const stepSize = Math.pow(10, exp);
    const base = minExp > exp ? Math.pow(10, minExp) : 0;
    const start = Math.round((min - base) * precision) / precision;
    const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
    let significand = Math.floor((start - offset) / Math.pow(10, exp));
    let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
    while (value < max) {
      ticks.push({
        value,
        major: isMajor(value),
        significand
      });
      if (significand >= 10) {
        significand = significand < 15 ? 15 : 20;
      } else {
        significand++;
      }
      if (significand >= 20) {
        exp++;
        significand = 2;
        precision = exp >= 0 ? 1 : precision;
      }
      value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
    }
    const lastTick = finiteOrDefault(generationOptions.max, value);
    ticks.push({
      value: lastTick,
      major: isMajor(lastTick),
      significand
    });
    return ticks;
  }
  function getTickBackdropHeight(opts) {
    const tickOpts = opts.ticks;
    if (tickOpts.display && opts.display) {
      const padding = toPadding(tickOpts.backdropPadding);
      return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
    }
    return 0;
  }
  function measureLabelSize(ctx, font, label) {
    label = isArray(label) ? label : [
      label
    ];
    return {
      w: _longestText(ctx, font.string, label),
      h: label.length * font.lineHeight
    };
  }
  function determineLimits(angle, pos, size, min, max) {
    if (angle === min || angle === max) {
      return {
        start: pos - size / 2,
        end: pos + size / 2
      };
    } else if (angle < min || angle > max) {
      return {
        start: pos - size,
        end: pos
      };
    }
    return {
      start: pos,
      end: pos + size
    };
  }
  function fitWithPointLabels(scale) {
    const orig = {
      l: scale.left + scale._padding.left,
      r: scale.right - scale._padding.right,
      t: scale.top + scale._padding.top,
      b: scale.bottom - scale._padding.bottom
    };
    const limits = Object.assign({}, orig);
    const labelSizes = [];
    const padding = [];
    const valueCount = scale._pointLabels.length;
    const pointLabelOpts = scale.options.pointLabels;
    const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
    for (let i6 = 0; i6 < valueCount; i6++) {
      const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i6));
      padding[i6] = opts.padding;
      const pointPosition = scale.getPointPosition(i6, scale.drawingArea + padding[i6], additionalAngle);
      const plFont = toFont(opts.font);
      const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i6]);
      labelSizes[i6] = textSize;
      const angleRadians = _normalizeAngle(scale.getIndexAngle(i6) + additionalAngle);
      const angle = Math.round(toDegrees(angleRadians));
      const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
      const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
      updateLimits(limits, orig, angleRadians, hLimits, vLimits);
    }
    scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
    scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
  }
  function updateLimits(limits, orig, angle, hLimits, vLimits) {
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    let x2 = 0;
    let y3 = 0;
    if (hLimits.start < orig.l) {
      x2 = (orig.l - hLimits.start) / sin;
      limits.l = Math.min(limits.l, orig.l - x2);
    } else if (hLimits.end > orig.r) {
      x2 = (hLimits.end - orig.r) / sin;
      limits.r = Math.max(limits.r, orig.r + x2);
    }
    if (vLimits.start < orig.t) {
      y3 = (orig.t - vLimits.start) / cos;
      limits.t = Math.min(limits.t, orig.t - y3);
    } else if (vLimits.end > orig.b) {
      y3 = (vLimits.end - orig.b) / cos;
      limits.b = Math.max(limits.b, orig.b + y3);
    }
  }
  function createPointLabelItem(scale, index2, itemOpts) {
    const outerDistance = scale.drawingArea;
    const { extra, additionalAngle, padding, size } = itemOpts;
    const pointLabelPosition = scale.getPointPosition(index2, outerDistance + extra + padding, additionalAngle);
    const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
    const y3 = yForAngle(pointLabelPosition.y, size.h, angle);
    const textAlign = getTextAlignForAngle(angle);
    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
    return {
      visible: true,
      x: pointLabelPosition.x,
      y: y3,
      textAlign,
      left,
      top: y3,
      right: left + size.w,
      bottom: y3 + size.h
    };
  }
  function isNotOverlapped(item, area) {
    if (!area) {
      return true;
    }
    const { left, top, right, bottom } = item;
    const apexesInArea = _isPointInArea({
      x: left,
      y: top
    }, area) || _isPointInArea({
      x: left,
      y: bottom
    }, area) || _isPointInArea({
      x: right,
      y: top
    }, area) || _isPointInArea({
      x: right,
      y: bottom
    }, area);
    return !apexesInArea;
  }
  function buildPointLabelItems(scale, labelSizes, padding) {
    const items = [];
    const valueCount = scale._pointLabels.length;
    const opts = scale.options;
    const { centerPointLabels, display } = opts.pointLabels;
    const itemOpts = {
      extra: getTickBackdropHeight(opts) / 2,
      additionalAngle: centerPointLabels ? PI / valueCount : 0
    };
    let area;
    for (let i6 = 0; i6 < valueCount; i6++) {
      itemOpts.padding = padding[i6];
      itemOpts.size = labelSizes[i6];
      const item = createPointLabelItem(scale, i6, itemOpts);
      items.push(item);
      if (display === "auto") {
        item.visible = isNotOverlapped(item, area);
        if (item.visible) {
          area = item;
        }
      }
    }
    return items;
  }
  function getTextAlignForAngle(angle) {
    if (angle === 0 || angle === 180) {
      return "center";
    } else if (angle < 180) {
      return "left";
    }
    return "right";
  }
  function leftForTextAlign(x2, w2, align) {
    if (align === "right") {
      x2 -= w2;
    } else if (align === "center") {
      x2 -= w2 / 2;
    }
    return x2;
  }
  function yForAngle(y3, h4, angle) {
    if (angle === 90 || angle === 270) {
      y3 -= h4 / 2;
    } else if (angle > 270 || angle < 90) {
      y3 -= h4;
    }
    return y3;
  }
  function drawPointLabelBox(ctx, opts, item) {
    const { left, top, right, bottom } = item;
    const { backdropColor } = opts;
    if (!isNullOrUndef(backdropColor)) {
      const borderRadius = toTRBLCorners(opts.borderRadius);
      const padding = toPadding(opts.backdropPadding);
      ctx.fillStyle = backdropColor;
      const backdropLeft = left - padding.left;
      const backdropTop = top - padding.top;
      const backdropWidth = right - left + padding.width;
      const backdropHeight = bottom - top + padding.height;
      if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: backdropLeft,
          y: backdropTop,
          w: backdropWidth,
          h: backdropHeight,
          radius: borderRadius
        });
        ctx.fill();
      } else {
        ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
      }
    }
  }
  function drawPointLabels(scale, labelCount) {
    const { ctx, options: { pointLabels } } = scale;
    for (let i6 = labelCount - 1; i6 >= 0; i6--) {
      const item = scale._pointLabelItems[i6];
      if (!item.visible) {
        continue;
      }
      const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i6));
      drawPointLabelBox(ctx, optsAtIndex, item);
      const plFont = toFont(optsAtIndex.font);
      const { x: x2, y: y3, textAlign } = item;
      renderText(ctx, scale._pointLabels[i6], x2, y3 + plFont.lineHeight / 2, plFont, {
        color: optsAtIndex.color,
        textAlign,
        textBaseline: "middle"
      });
    }
  }
  function pathRadiusLine(scale, radius, circular, labelCount) {
    const { ctx } = scale;
    if (circular) {
      ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
    } else {
      let pointPosition = scale.getPointPosition(0, radius);
      ctx.moveTo(pointPosition.x, pointPosition.y);
      for (let i6 = 1; i6 < labelCount; i6++) {
        pointPosition = scale.getPointPosition(i6, radius);
        ctx.lineTo(pointPosition.x, pointPosition.y);
      }
    }
  }
  function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
    const ctx = scale.ctx;
    const circular = gridLineOpts.circular;
    const { color: color2, lineWidth } = gridLineOpts;
    if (!circular && !labelCount || !color2 || !lineWidth || radius < 0) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = color2;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(borderOpts.dash || []);
    ctx.lineDashOffset = borderOpts.dashOffset;
    ctx.beginPath();
    pathRadiusLine(scale, radius, circular, labelCount);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  function createPointLabelContext(parent, index2, label) {
    return createContext(parent, {
      label,
      index: index2,
      type: "pointLabel"
    });
  }
  function sorter(a3, b3) {
    return a3 - b3;
  }
  function parse(scale, input) {
    if (isNullOrUndef(input)) {
      return null;
    }
    const adapter = scale._adapter;
    const { parser, round: round2, isoWeekday } = scale._parseOpts;
    let value = input;
    if (typeof parser === "function") {
      value = parser(value);
    }
    if (!isNumberFinite(value)) {
      value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
    }
    if (value === null) {
      return null;
    }
    if (round2) {
      value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
    }
    return +value;
  }
  function determineUnitForAutoTicks(minUnit, min, max, capacity) {
    const ilen = UNITS.length;
    for (let i6 = UNITS.indexOf(minUnit); i6 < ilen - 1; ++i6) {
      const interval = INTERVALS[UNITS[i6]];
      const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
      if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
        return UNITS[i6];
      }
    }
    return UNITS[ilen - 1];
  }
  function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
    for (let i6 = UNITS.length - 1; i6 >= UNITS.indexOf(minUnit); i6--) {
      const unit = UNITS[i6];
      if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
        return unit;
      }
    }
    return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
  }
  function determineMajorUnit(unit) {
    for (let i6 = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i6 < ilen; ++i6) {
      if (INTERVALS[UNITS[i6]].common) {
        return UNITS[i6];
      }
    }
  }
  function addTick(ticks, time, timestamps) {
    if (!timestamps) {
      ticks[time] = true;
    } else if (timestamps.length) {
      const { lo, hi } = _lookup(timestamps, time);
      const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
      ticks[timestamp] = true;
    }
  }
  function setMajorTicks(scale, ticks, map3, majorUnit) {
    const adapter = scale._adapter;
    const first = +adapter.startOf(ticks[0].value, majorUnit);
    const last = ticks[ticks.length - 1].value;
    let major, index2;
    for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
      index2 = map3[major];
      if (index2 >= 0) {
        ticks[index2].major = true;
      }
    }
    return ticks;
  }
  function ticksFromTimestamps(scale, values, majorUnit) {
    const ticks = [];
    const map3 = {};
    const ilen = values.length;
    let i6, value;
    for (i6 = 0; i6 < ilen; ++i6) {
      value = values[i6];
      map3[value] = i6;
      ticks.push({
        value,
        major: false
      });
    }
    return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map3, majorUnit);
  }
  function interpolate2(table, val, reverse) {
    let lo = 0;
    let hi = table.length - 1;
    let prevSource, nextSource, prevTarget, nextTarget;
    if (reverse) {
      if (val >= table[lo].pos && val <= table[hi].pos) {
        ({ lo, hi } = _lookupByKey(table, "pos", val));
      }
      ({ pos: prevSource, time: prevTarget } = table[lo]);
      ({ pos: nextSource, time: nextTarget } = table[hi]);
    } else {
      if (val >= table[lo].time && val <= table[hi].time) {
        ({ lo, hi } = _lookupByKey(table, "time", val));
      }
      ({ time: prevSource, pos: prevTarget } = table[lo]);
      ({ time: nextSource, pos: nextTarget } = table[hi]);
    }
    const span = nextSource - prevSource;
    return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
  }
  var Animator, animator, transparent, interpolators, Animation, Animations, isDirectUpdateMode, cloneIfNotShared, createStack, DatasetController, BarController, BubbleController, DoughnutController, LineController, PolarAreaController, PieController, RadarController, ScatterController, controllers, DateAdapterBase, adapters, Interaction, STATIC_POSITIONS, layouts, BasePlatform, BasicPlatform, EXPANDO_KEY, EVENT_TYPES, isNullOrEmpty, eventListenerOptions, drpListeningCharts, oldDevicePixelRatio, DomPlatform, Element, reverseAlign, offsetFromEdge, getTicksLimit, Scale, TypedRegistry, Registry, registry, PluginService, keyCache, keysCached, addIfFound, Config, hasFunction, version, KNOWN_POSITIONS, instances, getChart, Chart, ArcElement, usePath2D, LineElement, PointElement, BarElement, elements, BORDER_COLORS, BACKGROUND_COLORS, plugin_colors, plugin_decimation, simpleArc, index, getBoxSize, itemsEqual, Legend, plugin_legend, Title, plugin_title, map2, plugin_subtitle, positioners, defaultCallbacks, Tooltip, plugin_tooltip, plugins, addIfString, validIndex, CategoryScale, LinearScaleBase, LinearScale, log10Floor, changeExponent, LogarithmicScale, RadialLinearScale, INTERVALS, UNITS, TimeScale, TimeSeriesScale, scales, registerables;
  var init_chart = __esm({
    "node_modules/chart.js/dist/chart.js"() {
      init_helpers_dataset();
      Animator = class {
        constructor() {
          this._request = null;
          this._charts = /* @__PURE__ */ new Map();
          this._running = false;
          this._lastDate = void 0;
        }
        _notify(chart2, anims, date, type) {
          const callbacks = anims.listeners[type];
          const numSteps = anims.duration;
          callbacks.forEach((fn) => fn({
            chart: chart2,
            initial: anims.initial,
            numSteps,
            currentStep: Math.min(date - anims.start, numSteps)
          }));
        }
        _refresh() {
          if (this._request) {
            return;
          }
          this._running = true;
          this._request = requestAnimFrame.call(window, () => {
            this._update();
            this._request = null;
            if (this._running) {
              this._refresh();
            }
          });
        }
        _update(date = Date.now()) {
          let remaining = 0;
          this._charts.forEach((anims, chart2) => {
            if (!anims.running || !anims.items.length) {
              return;
            }
            const items = anims.items;
            let i6 = items.length - 1;
            let draw2 = false;
            let item;
            for (; i6 >= 0; --i6) {
              item = items[i6];
              if (item._active) {
                if (item._total > anims.duration) {
                  anims.duration = item._total;
                }
                item.tick(date);
                draw2 = true;
              } else {
                items[i6] = items[items.length - 1];
                items.pop();
              }
            }
            if (draw2) {
              chart2.draw();
              this._notify(chart2, anims, date, "progress");
            }
            if (!items.length) {
              anims.running = false;
              this._notify(chart2, anims, date, "complete");
              anims.initial = false;
            }
            remaining += items.length;
          });
          this._lastDate = date;
          if (remaining === 0) {
            this._running = false;
          }
        }
        _getAnims(chart2) {
          const charts = this._charts;
          let anims = charts.get(chart2);
          if (!anims) {
            anims = {
              running: false,
              initial: true,
              items: [],
              listeners: {
                complete: [],
                progress: []
              }
            };
            charts.set(chart2, anims);
          }
          return anims;
        }
        listen(chart2, event, cb) {
          this._getAnims(chart2).listeners[event].push(cb);
        }
        add(chart2, items) {
          if (!items || !items.length) {
            return;
          }
          this._getAnims(chart2).items.push(...items);
        }
        has(chart2) {
          return this._getAnims(chart2).items.length > 0;
        }
        start(chart2) {
          const anims = this._charts.get(chart2);
          if (!anims) {
            return;
          }
          anims.running = true;
          anims.start = Date.now();
          anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
          this._refresh();
        }
        running(chart2) {
          if (!this._running) {
            return false;
          }
          const anims = this._charts.get(chart2);
          if (!anims || !anims.running || !anims.items.length) {
            return false;
          }
          return true;
        }
        stop(chart2) {
          const anims = this._charts.get(chart2);
          if (!anims || !anims.items.length) {
            return;
          }
          const items = anims.items;
          let i6 = items.length - 1;
          for (; i6 >= 0; --i6) {
            items[i6].cancel();
          }
          anims.items = [];
          this._notify(chart2, anims, Date.now(), "complete");
        }
        remove(chart2) {
          return this._charts.delete(chart2);
        }
      };
      animator = /* @__PURE__ */ new Animator();
      transparent = "transparent";
      interpolators = {
        boolean(from2, to2, factor) {
          return factor > 0.5 ? to2 : from2;
        },
        color(from2, to2, factor) {
          const c0 = color(from2 || transparent);
          const c1 = c0.valid && color(to2 || transparent);
          return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to2;
        },
        number(from2, to2, factor) {
          return from2 + (to2 - from2) * factor;
        }
      };
      Animation = class {
        constructor(cfg, target, prop, to2) {
          const currentValue = target[prop];
          to2 = resolve([
            cfg.to,
            to2,
            currentValue,
            cfg.from
          ]);
          const from2 = resolve([
            cfg.from,
            currentValue,
            to2
          ]);
          this._active = true;
          this._fn = cfg.fn || interpolators[cfg.type || typeof from2];
          this._easing = effects[cfg.easing] || effects.linear;
          this._start = Math.floor(Date.now() + (cfg.delay || 0));
          this._duration = this._total = Math.floor(cfg.duration);
          this._loop = !!cfg.loop;
          this._target = target;
          this._prop = prop;
          this._from = from2;
          this._to = to2;
          this._promises = void 0;
        }
        active() {
          return this._active;
        }
        update(cfg, to2, date) {
          if (this._active) {
            this._notify(false);
            const currentValue = this._target[this._prop];
            const elapsed = date - this._start;
            const remain = this._duration - elapsed;
            this._start = date;
            this._duration = Math.floor(Math.max(remain, cfg.duration));
            this._total += elapsed;
            this._loop = !!cfg.loop;
            this._to = resolve([
              cfg.to,
              to2,
              currentValue,
              cfg.from
            ]);
            this._from = resolve([
              cfg.from,
              currentValue,
              to2
            ]);
          }
        }
        cancel() {
          if (this._active) {
            this.tick(Date.now());
            this._active = false;
            this._notify(false);
          }
        }
        tick(date) {
          const elapsed = date - this._start;
          const duration = this._duration;
          const prop = this._prop;
          const from2 = this._from;
          const loop = this._loop;
          const to2 = this._to;
          let factor;
          this._active = from2 !== to2 && (loop || elapsed < duration);
          if (!this._active) {
            this._target[prop] = to2;
            this._notify(true);
            return;
          }
          if (elapsed < 0) {
            this._target[prop] = from2;
            return;
          }
          factor = elapsed / duration % 2;
          factor = loop && factor > 1 ? 2 - factor : factor;
          factor = this._easing(Math.min(1, Math.max(0, factor)));
          this._target[prop] = this._fn(from2, to2, factor);
        }
        wait() {
          const promises = this._promises || (this._promises = []);
          return new Promise((res, rej) => {
            promises.push({
              res,
              rej
            });
          });
        }
        _notify(resolved) {
          const method = resolved ? "res" : "rej";
          const promises = this._promises || [];
          for (let i6 = 0; i6 < promises.length; i6++) {
            promises[i6][method]();
          }
        }
      };
      Animations = class {
        constructor(chart2, config) {
          this._chart = chart2;
          this._properties = /* @__PURE__ */ new Map();
          this.configure(config);
        }
        configure(config) {
          if (!isObject(config)) {
            return;
          }
          const animationOptions = Object.keys(defaults.animation);
          const animatedProps = this._properties;
          Object.getOwnPropertyNames(config).forEach((key) => {
            const cfg = config[key];
            if (!isObject(cfg)) {
              return;
            }
            const resolved = {};
            for (const option of animationOptions) {
              resolved[option] = cfg[option];
            }
            (isArray(cfg.properties) && cfg.properties || [
              key
            ]).forEach((prop) => {
              if (prop === key || !animatedProps.has(prop)) {
                animatedProps.set(prop, resolved);
              }
            });
          });
        }
        _animateOptions(target, values) {
          const newOptions = values.options;
          const options = resolveTargetOptions(target, newOptions);
          if (!options) {
            return [];
          }
          const animations = this._createAnimations(options, newOptions);
          if (newOptions.$shared) {
            awaitAll(target.options.$animations, newOptions).then(() => {
              target.options = newOptions;
            }, () => {
            });
          }
          return animations;
        }
        _createAnimations(target, values) {
          const animatedProps = this._properties;
          const animations = [];
          const running = target.$animations || (target.$animations = {});
          const props = Object.keys(values);
          const date = Date.now();
          let i6;
          for (i6 = props.length - 1; i6 >= 0; --i6) {
            const prop = props[i6];
            if (prop.charAt(0) === "$") {
              continue;
            }
            if (prop === "options") {
              animations.push(...this._animateOptions(target, values));
              continue;
            }
            const value = values[prop];
            let animation = running[prop];
            const cfg = animatedProps.get(prop);
            if (animation) {
              if (cfg && animation.active()) {
                animation.update(cfg, value, date);
                continue;
              } else {
                animation.cancel();
              }
            }
            if (!cfg || !cfg.duration) {
              target[prop] = value;
              continue;
            }
            running[prop] = animation = new Animation(cfg, target, prop, value);
            animations.push(animation);
          }
          return animations;
        }
        update(target, values) {
          if (this._properties.size === 0) {
            Object.assign(target, values);
            return;
          }
          const animations = this._createAnimations(target, values);
          if (animations.length) {
            animator.add(this._chart, animations);
            return true;
          }
        }
      };
      isDirectUpdateMode = (mode) => mode === "reset" || mode === "none";
      cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
      createStack = (canStack, meta, chart2) => canStack && !meta.hidden && meta._stacked && {
        keys: getSortedDatasetIndices(chart2, true),
        values: null
      };
      DatasetController = class {
        constructor(chart2, datasetIndex) {
          this.chart = chart2;
          this._ctx = chart2.ctx;
          this.index = datasetIndex;
          this._cachedDataOpts = {};
          this._cachedMeta = this.getMeta();
          this._type = this._cachedMeta.type;
          this.options = void 0;
          this._parsing = false;
          this._data = void 0;
          this._objectData = void 0;
          this._sharedOptions = void 0;
          this._drawStart = void 0;
          this._drawCount = void 0;
          this.enableOptionSharing = false;
          this.supportsDecimation = false;
          this.$context = void 0;
          this._syncList = [];
          this.datasetElementType = new.target.datasetElementType;
          this.dataElementType = new.target.dataElementType;
          this.initialize();
        }
        initialize() {
          const meta = this._cachedMeta;
          this.configure();
          this.linkScales();
          meta._stacked = isStacked(meta.vScale, meta);
          this.addElements();
          if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
            console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
          }
        }
        updateIndex(datasetIndex) {
          if (this.index !== datasetIndex) {
            clearStacks(this._cachedMeta);
          }
          this.index = datasetIndex;
        }
        linkScales() {
          const chart2 = this.chart;
          const meta = this._cachedMeta;
          const dataset = this.getDataset();
          const chooseId = (axis, x2, y3, r6) => axis === "x" ? x2 : axis === "r" ? r6 : y3;
          const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart2, "x"));
          const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart2, "y"));
          const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart2, "r"));
          const indexAxis = meta.indexAxis;
          const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
          const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
          meta.xScale = this.getScaleForId(xid);
          meta.yScale = this.getScaleForId(yid);
          meta.rScale = this.getScaleForId(rid);
          meta.iScale = this.getScaleForId(iid);
          meta.vScale = this.getScaleForId(vid);
        }
        getDataset() {
          return this.chart.data.datasets[this.index];
        }
        getMeta() {
          return this.chart.getDatasetMeta(this.index);
        }
        getScaleForId(scaleID) {
          return this.chart.scales[scaleID];
        }
        _getOtherScale(scale) {
          const meta = this._cachedMeta;
          return scale === meta.iScale ? meta.vScale : meta.iScale;
        }
        reset() {
          this._update("reset");
        }
        _destroy() {
          const meta = this._cachedMeta;
          if (this._data) {
            unlistenArrayEvents(this._data, this);
          }
          if (meta._stacked) {
            clearStacks(meta);
          }
        }
        _dataCheck() {
          const dataset = this.getDataset();
          const data = dataset.data || (dataset.data = []);
          const _data = this._data;
          if (isObject(data)) {
            const meta = this._cachedMeta;
            this._data = convertObjectDataToArray(data, meta);
          } else if (_data !== data) {
            if (_data) {
              unlistenArrayEvents(_data, this);
              const meta = this._cachedMeta;
              clearStacks(meta);
              meta._parsed = [];
            }
            if (data && Object.isExtensible(data)) {
              listenArrayEvents(data, this);
            }
            this._syncList = [];
            this._data = data;
          }
        }
        addElements() {
          const meta = this._cachedMeta;
          this._dataCheck();
          if (this.datasetElementType) {
            meta.dataset = new this.datasetElementType();
          }
        }
        buildOrUpdateElements(resetNewElements) {
          const meta = this._cachedMeta;
          const dataset = this.getDataset();
          let stackChanged = false;
          this._dataCheck();
          const oldStacked = meta._stacked;
          meta._stacked = isStacked(meta.vScale, meta);
          if (meta.stack !== dataset.stack) {
            stackChanged = true;
            clearStacks(meta);
            meta.stack = dataset.stack;
          }
          this._resyncElements(resetNewElements);
          if (stackChanged || oldStacked !== meta._stacked) {
            updateStacks(this, meta._parsed);
            meta._stacked = isStacked(meta.vScale, meta);
          }
        }
        configure() {
          const config = this.chart.config;
          const scopeKeys = config.datasetScopeKeys(this._type);
          const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
          this.options = config.createResolver(scopes, this.getContext());
          this._parsing = this.options.parsing;
          this._cachedDataOpts = {};
        }
        parse(start, count) {
          const { _cachedMeta: meta, _data: data } = this;
          const { iScale, _stacked } = meta;
          const iAxis = iScale.axis;
          let sorted = start === 0 && count === data.length ? true : meta._sorted;
          let prev = start > 0 && meta._parsed[start - 1];
          let i6, cur, parsed;
          if (this._parsing === false) {
            meta._parsed = data;
            meta._sorted = true;
            parsed = data;
          } else {
            if (isArray(data[start])) {
              parsed = this.parseArrayData(meta, data, start, count);
            } else if (isObject(data[start])) {
              parsed = this.parseObjectData(meta, data, start, count);
            } else {
              parsed = this.parsePrimitiveData(meta, data, start, count);
            }
            const isNotInOrderComparedToPrev = () => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
            for (i6 = 0; i6 < count; ++i6) {
              meta._parsed[i6 + start] = cur = parsed[i6];
              if (sorted) {
                if (isNotInOrderComparedToPrev()) {
                  sorted = false;
                }
                prev = cur;
              }
            }
            meta._sorted = sorted;
          }
          if (_stacked) {
            updateStacks(this, parsed);
          }
        }
        parsePrimitiveData(meta, data, start, count) {
          const { iScale, vScale } = meta;
          const iAxis = iScale.axis;
          const vAxis = vScale.axis;
          const labels = iScale.getLabels();
          const singleScale = iScale === vScale;
          const parsed = new Array(count);
          let i6, ilen, index2;
          for (i6 = 0, ilen = count; i6 < ilen; ++i6) {
            index2 = i6 + start;
            parsed[i6] = {
              [iAxis]: singleScale || iScale.parse(labels[index2], index2),
              [vAxis]: vScale.parse(data[index2], index2)
            };
          }
          return parsed;
        }
        parseArrayData(meta, data, start, count) {
          const { xScale, yScale } = meta;
          const parsed = new Array(count);
          let i6, ilen, index2, item;
          for (i6 = 0, ilen = count; i6 < ilen; ++i6) {
            index2 = i6 + start;
            item = data[index2];
            parsed[i6] = {
              x: xScale.parse(item[0], index2),
              y: yScale.parse(item[1], index2)
            };
          }
          return parsed;
        }
        parseObjectData(meta, data, start, count) {
          const { xScale, yScale } = meta;
          const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
          const parsed = new Array(count);
          let i6, ilen, index2, item;
          for (i6 = 0, ilen = count; i6 < ilen; ++i6) {
            index2 = i6 + start;
            item = data[index2];
            parsed[i6] = {
              x: xScale.parse(resolveObjectKey(item, xAxisKey), index2),
              y: yScale.parse(resolveObjectKey(item, yAxisKey), index2)
            };
          }
          return parsed;
        }
        getParsed(index2) {
          return this._cachedMeta._parsed[index2];
        }
        getDataElement(index2) {
          return this._cachedMeta.data[index2];
        }
        applyStack(scale, parsed, mode) {
          const chart2 = this.chart;
          const meta = this._cachedMeta;
          const value = parsed[scale.axis];
          const stack = {
            keys: getSortedDatasetIndices(chart2, true),
            values: parsed._stacks[scale.axis]._visualValues
          };
          return applyStack(stack, value, meta.index, {
            mode
          });
        }
        updateRangeFromParsed(range, scale, parsed, stack) {
          const parsedValue = parsed[scale.axis];
          let value = parsedValue === null ? NaN : parsedValue;
          const values = stack && parsed._stacks[scale.axis];
          if (stack && values) {
            stack.values = values;
            value = applyStack(stack, parsedValue, this._cachedMeta.index);
          }
          range.min = Math.min(range.min, value);
          range.max = Math.max(range.max, value);
        }
        getMinMax(scale, canStack) {
          const meta = this._cachedMeta;
          const _parsed = meta._parsed;
          const sorted = meta._sorted && scale === meta.iScale;
          const ilen = _parsed.length;
          const otherScale = this._getOtherScale(scale);
          const stack = createStack(canStack, meta, this.chart);
          const range = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
          };
          const { min: otherMin, max: otherMax } = getUserBounds(otherScale);
          let i6, parsed;
          function _skip() {
            parsed = _parsed[i6];
            const otherValue = parsed[otherScale.axis];
            return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
          }
          for (i6 = 0; i6 < ilen; ++i6) {
            if (_skip()) {
              continue;
            }
            this.updateRangeFromParsed(range, scale, parsed, stack);
            if (sorted) {
              break;
            }
          }
          if (sorted) {
            for (i6 = ilen - 1; i6 >= 0; --i6) {
              if (_skip()) {
                continue;
              }
              this.updateRangeFromParsed(range, scale, parsed, stack);
              break;
            }
          }
          return range;
        }
        getAllParsedValues(scale) {
          const parsed = this._cachedMeta._parsed;
          const values = [];
          let i6, ilen, value;
          for (i6 = 0, ilen = parsed.length; i6 < ilen; ++i6) {
            value = parsed[i6][scale.axis];
            if (isNumberFinite(value)) {
              values.push(value);
            }
          }
          return values;
        }
        getMaxOverflow() {
          return false;
        }
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const iScale = meta.iScale;
          const vScale = meta.vScale;
          const parsed = this.getParsed(index2);
          return {
            label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
            value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
          };
        }
        _update(mode) {
          const meta = this._cachedMeta;
          this.update(mode || "default");
          meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
        }
        update(mode) {
        }
        draw() {
          const ctx = this._ctx;
          const chart2 = this.chart;
          const meta = this._cachedMeta;
          const elements2 = meta.data || [];
          const area = chart2.chartArea;
          const active = [];
          const start = this._drawStart || 0;
          const count = this._drawCount || elements2.length - start;
          const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
          let i6;
          if (meta.dataset) {
            meta.dataset.draw(ctx, area, start, count);
          }
          for (i6 = start; i6 < start + count; ++i6) {
            const element = elements2[i6];
            if (element.hidden) {
              continue;
            }
            if (element.active && drawActiveElementsOnTop) {
              active.push(element);
            } else {
              element.draw(ctx, area);
            }
          }
          for (i6 = 0; i6 < active.length; ++i6) {
            active[i6].draw(ctx, area);
          }
        }
        getStyle(index2, active) {
          const mode = active ? "active" : "default";
          return index2 === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index2 || 0, mode);
        }
        getContext(index2, active, mode) {
          const dataset = this.getDataset();
          let context;
          if (index2 >= 0 && index2 < this._cachedMeta.data.length) {
            const element = this._cachedMeta.data[index2];
            context = element.$context || (element.$context = createDataContext(this.getContext(), index2, element));
            context.parsed = this.getParsed(index2);
            context.raw = dataset.data[index2];
            context.index = context.dataIndex = index2;
          } else {
            context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
            context.dataset = dataset;
            context.index = context.datasetIndex = this.index;
          }
          context.active = !!active;
          context.mode = mode;
          return context;
        }
        resolveDatasetElementOptions(mode) {
          return this._resolveElementOptions(this.datasetElementType.id, mode);
        }
        resolveDataElementOptions(index2, mode) {
          return this._resolveElementOptions(this.dataElementType.id, mode, index2);
        }
        _resolveElementOptions(elementType, mode = "default", index2) {
          const active = mode === "active";
          const cache = this._cachedDataOpts;
          const cacheKey = elementType + "-" + mode;
          const cached = cache[cacheKey];
          const sharing = this.enableOptionSharing && defined(index2);
          if (cached) {
            return cloneIfNotShared(cached, sharing);
          }
          const config = this.chart.config;
          const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
          const prefixes = active ? [
            `${elementType}Hover`,
            "hover",
            elementType,
            ""
          ] : [
            elementType,
            ""
          ];
          const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
          const names2 = Object.keys(defaults.elements[elementType]);
          const context = () => this.getContext(index2, active, mode);
          const values = config.resolveNamedOptions(scopes, names2, context, prefixes);
          if (values.$shared) {
            values.$shared = sharing;
            cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
          }
          return values;
        }
        _resolveAnimations(index2, transition, active) {
          const chart2 = this.chart;
          const cache = this._cachedDataOpts;
          const cacheKey = `animation-${transition}`;
          const cached = cache[cacheKey];
          if (cached) {
            return cached;
          }
          let options;
          if (chart2.options.animation !== false) {
            const config = this.chart.config;
            const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
            const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
            options = config.createResolver(scopes, this.getContext(index2, active, transition));
          }
          const animations = new Animations(chart2, options && options.animations);
          if (options && options._cacheable) {
            cache[cacheKey] = Object.freeze(animations);
          }
          return animations;
        }
        getSharedOptions(options) {
          if (!options.$shared) {
            return;
          }
          return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
        }
        includeOptions(mode, sharedOptions) {
          return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
        }
        _getSharedOptions(start, mode) {
          const firstOpts = this.resolveDataElementOptions(start, mode);
          const previouslySharedOptions = this._sharedOptions;
          const sharedOptions = this.getSharedOptions(firstOpts);
          const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
          this.updateSharedOptions(sharedOptions, mode, firstOpts);
          return {
            sharedOptions,
            includeOptions
          };
        }
        updateElement(element, index2, properties, mode) {
          if (isDirectUpdateMode(mode)) {
            Object.assign(element, properties);
          } else {
            this._resolveAnimations(index2, mode).update(element, properties);
          }
        }
        updateSharedOptions(sharedOptions, mode, newOptions) {
          if (sharedOptions && !isDirectUpdateMode(mode)) {
            this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
          }
        }
        _setStyle(element, index2, mode, active) {
          element.active = active;
          const options = this.getStyle(index2, active);
          this._resolveAnimations(index2, mode, active).update(element, {
            options: !active && this.getSharedOptions(options) || options
          });
        }
        removeHoverStyle(element, datasetIndex, index2) {
          this._setStyle(element, index2, "active", false);
        }
        setHoverStyle(element, datasetIndex, index2) {
          this._setStyle(element, index2, "active", true);
        }
        _removeDatasetHoverStyle() {
          const element = this._cachedMeta.dataset;
          if (element) {
            this._setStyle(element, void 0, "active", false);
          }
        }
        _setDatasetHoverStyle() {
          const element = this._cachedMeta.dataset;
          if (element) {
            this._setStyle(element, void 0, "active", true);
          }
        }
        _resyncElements(resetNewElements) {
          const data = this._data;
          const elements2 = this._cachedMeta.data;
          for (const [method, arg1, arg2] of this._syncList) {
            this[method](arg1, arg2);
          }
          this._syncList = [];
          const numMeta = elements2.length;
          const numData = data.length;
          const count = Math.min(numData, numMeta);
          if (count) {
            this.parse(0, count);
          }
          if (numData > numMeta) {
            this._insertElements(numMeta, numData - numMeta, resetNewElements);
          } else if (numData < numMeta) {
            this._removeElements(numData, numMeta - numData);
          }
        }
        _insertElements(start, count, resetNewElements = true) {
          const meta = this._cachedMeta;
          const data = meta.data;
          const end = start + count;
          let i6;
          const move = (arr) => {
            arr.length += count;
            for (i6 = arr.length - 1; i6 >= end; i6--) {
              arr[i6] = arr[i6 - count];
            }
          };
          move(data);
          for (i6 = start; i6 < end; ++i6) {
            data[i6] = new this.dataElementType();
          }
          if (this._parsing) {
            move(meta._parsed);
          }
          this.parse(start, count);
          if (resetNewElements) {
            this.updateElements(data, start, count, "reset");
          }
        }
        updateElements(element, start, count, mode) {
        }
        _removeElements(start, count) {
          const meta = this._cachedMeta;
          if (this._parsing) {
            const removed = meta._parsed.splice(start, count);
            if (meta._stacked) {
              clearStacks(meta, removed);
            }
          }
          meta.data.splice(start, count);
        }
        _sync(args) {
          if (this._parsing) {
            this._syncList.push(args);
          } else {
            const [method, arg1, arg2] = args;
            this[method](arg1, arg2);
          }
          this.chart._dataChanges.push([
            this.index,
            ...args
          ]);
        }
        _onDataPush() {
          const count = arguments.length;
          this._sync([
            "_insertElements",
            this.getDataset().data.length - count,
            count
          ]);
        }
        _onDataPop() {
          this._sync([
            "_removeElements",
            this._cachedMeta.data.length - 1,
            1
          ]);
        }
        _onDataShift() {
          this._sync([
            "_removeElements",
            0,
            1
          ]);
        }
        _onDataSplice(start, count) {
          if (count) {
            this._sync([
              "_removeElements",
              start,
              count
            ]);
          }
          const newCount = arguments.length - 2;
          if (newCount) {
            this._sync([
              "_insertElements",
              start,
              newCount
            ]);
          }
        }
        _onDataUnshift() {
          this._sync([
            "_insertElements",
            0,
            arguments.length
          ]);
        }
      };
      __publicField(DatasetController, "defaults", {});
      __publicField(DatasetController, "datasetElementType", null);
      __publicField(DatasetController, "dataElementType", null);
      BarController = class extends DatasetController {
        parsePrimitiveData(meta, data, start, count) {
          return parseArrayOrPrimitive(meta, data, start, count);
        }
        parseArrayData(meta, data, start, count) {
          return parseArrayOrPrimitive(meta, data, start, count);
        }
        parseObjectData(meta, data, start, count) {
          const { iScale, vScale } = meta;
          const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
          const iAxisKey = iScale.axis === "x" ? xAxisKey : yAxisKey;
          const vAxisKey = vScale.axis === "x" ? xAxisKey : yAxisKey;
          const parsed = [];
          let i6, ilen, item, obj;
          for (i6 = start, ilen = start + count; i6 < ilen; ++i6) {
            obj = data[i6];
            item = {};
            item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i6);
            parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i6));
          }
          return parsed;
        }
        updateRangeFromParsed(range, scale, parsed, stack) {
          super.updateRangeFromParsed(range, scale, parsed, stack);
          const custom = parsed._custom;
          if (custom && scale === this._cachedMeta.vScale) {
            range.min = Math.min(range.min, custom.min);
            range.max = Math.max(range.max, custom.max);
          }
        }
        getMaxOverflow() {
          return 0;
        }
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const { iScale, vScale } = meta;
          const parsed = this.getParsed(index2);
          const custom = parsed._custom;
          const value = isFloatBar(custom) ? "[" + custom.start + ", " + custom.end + "]" : "" + vScale.getLabelForValue(parsed[vScale.axis]);
          return {
            label: "" + iScale.getLabelForValue(parsed[iScale.axis]),
            value
          };
        }
        initialize() {
          this.enableOptionSharing = true;
          super.initialize();
          const meta = this._cachedMeta;
          meta.stack = this.getDataset().stack;
        }
        update(mode) {
          const meta = this._cachedMeta;
          this.updateElements(meta.data, 0, meta.data.length, mode);
        }
        updateElements(bars, start, count, mode) {
          const reset = mode === "reset";
          const { index: index2, _cachedMeta: { vScale } } = this;
          const base = vScale.getBasePixel();
          const horizontal = vScale.isHorizontal();
          const ruler = this._getRuler();
          const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
          for (let i6 = start; i6 < start + count; i6++) {
            const parsed = this.getParsed(i6);
            const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? {
              base,
              head: base
            } : this._calculateBarValuePixels(i6);
            const ipixels = this._calculateBarIndexPixels(i6, ruler);
            const stack = (parsed._stacks || {})[vScale.axis];
            const properties = {
              horizontal,
              base: vpixels.base,
              enableBorderRadius: !stack || isFloatBar(parsed._custom) || index2 === stack._top || index2 === stack._bottom,
              x: horizontal ? vpixels.head : ipixels.center,
              y: horizontal ? ipixels.center : vpixels.head,
              height: horizontal ? ipixels.size : Math.abs(vpixels.size),
              width: horizontal ? Math.abs(vpixels.size) : ipixels.size
            };
            if (includeOptions) {
              properties.options = sharedOptions || this.resolveDataElementOptions(i6, bars[i6].active ? "active" : mode);
            }
            const options = properties.options || bars[i6].options;
            setBorderSkipped(properties, options, stack, index2);
            setInflateAmount(properties, options, ruler.ratio);
            this.updateElement(bars[i6], i6, properties, mode);
          }
        }
        _getStacks(last, dataIndex) {
          const { iScale } = this._cachedMeta;
          const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta) => meta.controller.options.grouped);
          const stacked = iScale.options.stacked;
          const stacks = [];
          const currentParsed = this._cachedMeta.controller.getParsed(dataIndex);
          const iScaleValue = currentParsed && currentParsed[iScale.axis];
          const skipNull = (meta) => {
            const parsed = meta._parsed.find((item) => item[iScale.axis] === iScaleValue);
            const val = parsed && parsed[meta.vScale.axis];
            if (isNullOrUndef(val) || isNaN(val)) {
              return true;
            }
          };
          for (const meta of metasets) {
            if (dataIndex !== void 0 && skipNull(meta)) {
              continue;
            }
            if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === void 0 && meta.stack === void 0) {
              stacks.push(meta.stack);
            }
            if (meta.index === last) {
              break;
            }
          }
          if (!stacks.length) {
            stacks.push(void 0);
          }
          return stacks;
        }
        _getStackCount(index2) {
          return this._getStacks(void 0, index2).length;
        }
        _getAxisCount() {
          return this._getAxis().length;
        }
        getFirstScaleIdForIndexAxis() {
          const scales2 = this.chart.scales;
          const indexScaleId = this.chart.options.indexAxis;
          return Object.keys(scales2).filter((key) => scales2[key].axis === indexScaleId).shift();
        }
        _getAxis() {
          const axis = {};
          const firstScaleAxisId = this.getFirstScaleIdForIndexAxis();
          for (const dataset of this.chart.data.datasets) {
            axis[valueOrDefault(this.chart.options.indexAxis === "x" ? dataset.xAxisID : dataset.yAxisID, firstScaleAxisId)] = true;
          }
          return Object.keys(axis);
        }
        _getStackIndex(datasetIndex, name, dataIndex) {
          const stacks = this._getStacks(datasetIndex, dataIndex);
          const index2 = name !== void 0 ? stacks.indexOf(name) : -1;
          return index2 === -1 ? stacks.length - 1 : index2;
        }
        _getRuler() {
          const opts = this.options;
          const meta = this._cachedMeta;
          const iScale = meta.iScale;
          const pixels = [];
          let i6, ilen;
          for (i6 = 0, ilen = meta.data.length; i6 < ilen; ++i6) {
            pixels.push(iScale.getPixelForValue(this.getParsed(i6)[iScale.axis], i6));
          }
          const barThickness = opts.barThickness;
          const min = barThickness || computeMinSampleSize(meta);
          return {
            min,
            pixels,
            start: iScale._startPixel,
            end: iScale._endPixel,
            stackCount: this._getStackCount(),
            scale: iScale,
            grouped: opts.grouped,
            ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
          };
        }
        _calculateBarValuePixels(index2) {
          const { _cachedMeta: { vScale, _stacked, index: datasetIndex }, options: { base: baseValue, minBarLength } } = this;
          const actualBase = baseValue || 0;
          const parsed = this.getParsed(index2);
          const custom = parsed._custom;
          const floating = isFloatBar(custom);
          let value = parsed[vScale.axis];
          let start = 0;
          let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
          let head, size;
          if (length !== value) {
            start = length - value;
            length = value;
          }
          if (floating) {
            value = custom.barStart;
            length = custom.barEnd - custom.barStart;
            if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
              start = 0;
            }
            start += value;
          }
          const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
          let base = vScale.getPixelForValue(startValue);
          if (this.chart.getDataVisibility(index2)) {
            head = vScale.getPixelForValue(start + length);
          } else {
            head = base;
          }
          size = head - base;
          if (Math.abs(size) < minBarLength) {
            size = barSign(size, vScale, actualBase) * minBarLength;
            if (value === actualBase) {
              base -= size / 2;
            }
            const startPixel = vScale.getPixelForDecimal(0);
            const endPixel = vScale.getPixelForDecimal(1);
            const min = Math.min(startPixel, endPixel);
            const max = Math.max(startPixel, endPixel);
            base = Math.max(Math.min(base, max), min);
            head = base + size;
            if (_stacked && !floating) {
              parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
            }
          }
          if (base === vScale.getPixelForValue(actualBase)) {
            const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
            base += halfGrid;
            size -= halfGrid;
          }
          return {
            size,
            base,
            head,
            center: head + size / 2
          };
        }
        _calculateBarIndexPixels(index2, ruler) {
          const scale = ruler.scale;
          const options = this.options;
          const skipNull = options.skipNull;
          const maxBarThickness = valueOrDefault(options.maxBarThickness, Infinity);
          let center, size;
          const axisCount = this._getAxisCount();
          if (ruler.grouped) {
            const stackCount = skipNull ? this._getStackCount(index2) : ruler.stackCount;
            const range = options.barThickness === "flex" ? computeFlexCategoryTraits(index2, ruler, options, stackCount * axisCount) : computeFitCategoryTraits(index2, ruler, options, stackCount * axisCount);
            const axisID = this.chart.options.indexAxis === "x" ? this.getDataset().xAxisID : this.getDataset().yAxisID;
            const axisNumber = this._getAxis().indexOf(valueOrDefault(axisID, this.getFirstScaleIdForIndexAxis()));
            const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index2 : void 0) + axisNumber;
            center = range.start + range.chunk * stackIndex + range.chunk / 2;
            size = Math.min(maxBarThickness, range.chunk * range.ratio);
          } else {
            center = scale.getPixelForValue(this.getParsed(index2)[scale.axis], index2);
            size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
          }
          return {
            base: center - size / 2,
            head: center + size / 2,
            center,
            size
          };
        }
        draw() {
          const meta = this._cachedMeta;
          const vScale = meta.vScale;
          const rects = meta.data;
          const ilen = rects.length;
          let i6 = 0;
          for (; i6 < ilen; ++i6) {
            if (this.getParsed(i6)[vScale.axis] !== null && !rects[i6].hidden) {
              rects[i6].draw(this._ctx);
            }
          }
        }
      };
      __publicField(BarController, "id", "bar");
      __publicField(BarController, "defaults", {
        datasetElementType: false,
        dataElementType: "bar",
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        grouped: true,
        animations: {
          numbers: {
            type: "number",
            properties: [
              "x",
              "y",
              "base",
              "width",
              "height"
            ]
          }
        }
      });
      __publicField(BarController, "overrides", {
        scales: {
          _index_: {
            type: "category",
            offset: true,
            grid: {
              offset: true
            }
          },
          _value_: {
            type: "linear",
            beginAtZero: true
          }
        }
      });
      BubbleController = class extends DatasetController {
        initialize() {
          this.enableOptionSharing = true;
          super.initialize();
        }
        parsePrimitiveData(meta, data, start, count) {
          const parsed = super.parsePrimitiveData(meta, data, start, count);
          for (let i6 = 0; i6 < parsed.length; i6++) {
            parsed[i6]._custom = this.resolveDataElementOptions(i6 + start).radius;
          }
          return parsed;
        }
        parseArrayData(meta, data, start, count) {
          const parsed = super.parseArrayData(meta, data, start, count);
          for (let i6 = 0; i6 < parsed.length; i6++) {
            const item = data[start + i6];
            parsed[i6]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i6 + start).radius);
          }
          return parsed;
        }
        parseObjectData(meta, data, start, count) {
          const parsed = super.parseObjectData(meta, data, start, count);
          for (let i6 = 0; i6 < parsed.length; i6++) {
            const item = data[start + i6];
            parsed[i6]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i6 + start).radius);
          }
          return parsed;
        }
        getMaxOverflow() {
          const data = this._cachedMeta.data;
          let max = 0;
          for (let i6 = data.length - 1; i6 >= 0; --i6) {
            max = Math.max(max, data[i6].size(this.resolveDataElementOptions(i6)) / 2);
          }
          return max > 0 && max;
        }
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const labels = this.chart.data.labels || [];
          const { xScale, yScale } = meta;
          const parsed = this.getParsed(index2);
          const x2 = xScale.getLabelForValue(parsed.x);
          const y3 = yScale.getLabelForValue(parsed.y);
          const r6 = parsed._custom;
          return {
            label: labels[index2] || "",
            value: "(" + x2 + ", " + y3 + (r6 ? ", " + r6 : "") + ")"
          };
        }
        update(mode) {
          const points = this._cachedMeta.data;
          this.updateElements(points, 0, points.length, mode);
        }
        updateElements(points, start, count, mode) {
          const reset = mode === "reset";
          const { iScale, vScale } = this._cachedMeta;
          const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
          const iAxis = iScale.axis;
          const vAxis = vScale.axis;
          for (let i6 = start; i6 < start + count; i6++) {
            const point = points[i6];
            const parsed = !reset && this.getParsed(i6);
            const properties = {};
            const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
            const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
            properties.skip = isNaN(iPixel) || isNaN(vPixel);
            if (includeOptions) {
              properties.options = sharedOptions || this.resolveDataElementOptions(i6, point.active ? "active" : mode);
              if (reset) {
                properties.options.radius = 0;
              }
            }
            this.updateElement(point, i6, properties, mode);
          }
        }
        resolveDataElementOptions(index2, mode) {
          const parsed = this.getParsed(index2);
          let values = super.resolveDataElementOptions(index2, mode);
          if (values.$shared) {
            values = Object.assign({}, values, {
              $shared: false
            });
          }
          const radius = values.radius;
          if (mode !== "active") {
            values.radius = 0;
          }
          values.radius += valueOrDefault(parsed && parsed._custom, radius);
          return values;
        }
      };
      __publicField(BubbleController, "id", "bubble");
      __publicField(BubbleController, "defaults", {
        datasetElementType: false,
        dataElementType: "point",
        animations: {
          numbers: {
            type: "number",
            properties: [
              "x",
              "y",
              "borderWidth",
              "radius"
            ]
          }
        }
      });
      __publicField(BubbleController, "overrides", {
        scales: {
          x: {
            type: "linear"
          },
          y: {
            type: "linear"
          }
        }
      });
      DoughnutController = class extends DatasetController {
        constructor(chart2, datasetIndex) {
          super(chart2, datasetIndex);
          this.enableOptionSharing = true;
          this.innerRadius = void 0;
          this.outerRadius = void 0;
          this.offsetX = void 0;
          this.offsetY = void 0;
        }
        linkScales() {
        }
        parse(start, count) {
          const data = this.getDataset().data;
          const meta = this._cachedMeta;
          if (this._parsing === false) {
            meta._parsed = data;
          } else {
            let getter = (i7) => +data[i7];
            if (isObject(data[start])) {
              const { key = "value" } = this._parsing;
              getter = (i7) => +resolveObjectKey(data[i7], key);
            }
            let i6, ilen;
            for (i6 = start, ilen = start + count; i6 < ilen; ++i6) {
              meta._parsed[i6] = getter(i6);
            }
          }
        }
        _getRotation() {
          return toRadians(this.options.rotation - 90);
        }
        _getCircumference() {
          return toRadians(this.options.circumference);
        }
        _getRotationExtents() {
          let min = TAU;
          let max = -TAU;
          for (let i6 = 0; i6 < this.chart.data.datasets.length; ++i6) {
            if (this.chart.isDatasetVisible(i6) && this.chart.getDatasetMeta(i6).type === this._type) {
              const controller = this.chart.getDatasetMeta(i6).controller;
              const rotation = controller._getRotation();
              const circumference = controller._getCircumference();
              min = Math.min(min, rotation);
              max = Math.max(max, rotation + circumference);
            }
          }
          return {
            rotation: min,
            circumference: max - min
          };
        }
        update(mode) {
          const chart2 = this.chart;
          const { chartArea } = chart2;
          const meta = this._cachedMeta;
          const arcs = meta.data;
          const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
          const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
          const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
          const chartWeight = this._getRingWeight(this.index);
          const { circumference, rotation } = this._getRotationExtents();
          const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(rotation, circumference, cutout);
          const maxWidth = (chartArea.width - spacing) / ratioX;
          const maxHeight = (chartArea.height - spacing) / ratioY;
          const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
          const outerRadius = toDimension(this.options.radius, maxRadius);
          const innerRadius = Math.max(outerRadius * cutout, 0);
          const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
          this.offsetX = offsetX * outerRadius;
          this.offsetY = offsetY * outerRadius;
          meta.total = this.calculateTotal();
          this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
          this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
          this.updateElements(arcs, 0, arcs.length, mode);
        }
        _circumference(i6, reset) {
          const opts = this.options;
          const meta = this._cachedMeta;
          const circumference = this._getCircumference();
          if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i6) || meta._parsed[i6] === null || meta.data[i6].hidden) {
            return 0;
          }
          return this.calculateCircumference(meta._parsed[i6] * circumference / TAU);
        }
        updateElements(arcs, start, count, mode) {
          const reset = mode === "reset";
          const chart2 = this.chart;
          const chartArea = chart2.chartArea;
          const opts = chart2.options;
          const animationOpts = opts.animation;
          const centerX = (chartArea.left + chartArea.right) / 2;
          const centerY = (chartArea.top + chartArea.bottom) / 2;
          const animateScale = reset && animationOpts.animateScale;
          const innerRadius = animateScale ? 0 : this.innerRadius;
          const outerRadius = animateScale ? 0 : this.outerRadius;
          const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
          let startAngle = this._getRotation();
          let i6;
          for (i6 = 0; i6 < start; ++i6) {
            startAngle += this._circumference(i6, reset);
          }
          for (i6 = start; i6 < start + count; ++i6) {
            const circumference = this._circumference(i6, reset);
            const arc = arcs[i6];
            const properties = {
              x: centerX + this.offsetX,
              y: centerY + this.offsetY,
              startAngle,
              endAngle: startAngle + circumference,
              circumference,
              outerRadius,
              innerRadius
            };
            if (includeOptions) {
              properties.options = sharedOptions || this.resolveDataElementOptions(i6, arc.active ? "active" : mode);
            }
            startAngle += circumference;
            this.updateElement(arc, i6, properties, mode);
          }
        }
        calculateTotal() {
          const meta = this._cachedMeta;
          const metaData = meta.data;
          let total = 0;
          let i6;
          for (i6 = 0; i6 < metaData.length; i6++) {
            const value = meta._parsed[i6];
            if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i6) && !metaData[i6].hidden) {
              total += Math.abs(value);
            }
          }
          return total;
        }
        calculateCircumference(value) {
          const total = this._cachedMeta.total;
          if (total > 0 && !isNaN(value)) {
            return TAU * (Math.abs(value) / total);
          }
          return 0;
        }
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const chart2 = this.chart;
          const labels = chart2.data.labels || [];
          const value = formatNumber2(meta._parsed[index2], chart2.options.locale);
          return {
            label: labels[index2] || "",
            value
          };
        }
        getMaxBorderWidth(arcs) {
          let max = 0;
          const chart2 = this.chart;
          let i6, ilen, meta, controller, options;
          if (!arcs) {
            for (i6 = 0, ilen = chart2.data.datasets.length; i6 < ilen; ++i6) {
              if (chart2.isDatasetVisible(i6)) {
                meta = chart2.getDatasetMeta(i6);
                arcs = meta.data;
                controller = meta.controller;
                break;
              }
            }
          }
          if (!arcs) {
            return 0;
          }
          for (i6 = 0, ilen = arcs.length; i6 < ilen; ++i6) {
            options = controller.resolveDataElementOptions(i6);
            if (options.borderAlign !== "inner") {
              max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
            }
          }
          return max;
        }
        getMaxOffset(arcs) {
          let max = 0;
          for (let i6 = 0, ilen = arcs.length; i6 < ilen; ++i6) {
            const options = this.resolveDataElementOptions(i6);
            max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
          }
          return max;
        }
        _getRingWeightOffset(datasetIndex) {
          let ringWeightOffset = 0;
          for (let i6 = 0; i6 < datasetIndex; ++i6) {
            if (this.chart.isDatasetVisible(i6)) {
              ringWeightOffset += this._getRingWeight(i6);
            }
          }
          return ringWeightOffset;
        }
        _getRingWeight(datasetIndex) {
          return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
        }
        _getVisibleDatasetWeightTotal() {
          return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
        }
      };
      __publicField(DoughnutController, "id", "doughnut");
      __publicField(DoughnutController, "defaults", {
        datasetElementType: false,
        dataElementType: "arc",
        animation: {
          animateRotate: true,
          animateScale: false
        },
        animations: {
          numbers: {
            type: "number",
            properties: [
              "circumference",
              "endAngle",
              "innerRadius",
              "outerRadius",
              "startAngle",
              "x",
              "y",
              "offset",
              "borderWidth",
              "spacing"
            ]
          }
        },
        cutout: "50%",
        rotation: 0,
        circumference: 360,
        radius: "100%",
        spacing: 0,
        indexAxis: "r"
      });
      __publicField(DoughnutController, "descriptors", {
        _scriptable: (name) => name !== "spacing",
        _indexable: (name) => name !== "spacing" && !name.startsWith("borderDash") && !name.startsWith("hoverBorderDash")
      });
      __publicField(DoughnutController, "overrides", {
        aspectRatio: 1,
        plugins: {
          legend: {
            labels: {
              generateLabels(chart2) {
                const data = chart2.data;
                const { labels: { pointStyle, textAlign, color: color2, useBorderRadius, borderRadius } } = chart2.legend.options;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i6) => {
                    const meta = chart2.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i6);
                    return {
                      text: label,
                      fillStyle: style.backgroundColor,
                      fontColor: color2,
                      hidden: !chart2.getDataVisibility(i6),
                      lineDash: style.borderDash,
                      lineDashOffset: style.borderDashOffset,
                      lineJoin: style.borderJoinStyle,
                      lineWidth: style.borderWidth,
                      strokeStyle: style.borderColor,
                      textAlign,
                      pointStyle,
                      borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
                      index: i6
                    };
                  });
                }
                return [];
              }
            },
            onClick(e7, legendItem, legend) {
              legend.chart.toggleDataVisibility(legendItem.index);
              legend.chart.update();
            }
          }
        }
      });
      LineController = class extends DatasetController {
        initialize() {
          this.enableOptionSharing = true;
          this.supportsDecimation = true;
          super.initialize();
        }
        update(mode) {
          const meta = this._cachedMeta;
          const { dataset: line, data: points = [], _dataset } = meta;
          const animationsDisabled = this.chart._animationsDisabled;
          let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
          this._drawStart = start;
          this._drawCount = count;
          if (_scaleRangesChanged(meta)) {
            start = 0;
            count = points.length;
          }
          line._chart = this.chart;
          line._datasetIndex = this.index;
          line._decimated = !!_dataset._decimated;
          line.points = points;
          const options = this.resolveDatasetElementOptions(mode);
          if (!this.options.showLine) {
            options.borderWidth = 0;
          }
          options.segment = this.options.segment;
          this.updateElement(line, void 0, {
            animated: !animationsDisabled,
            options
          }, mode);
          this.updateElements(points, start, count, mode);
        }
        updateElements(points, start, count, mode) {
          const reset = mode === "reset";
          const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
          const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
          const iAxis = iScale.axis;
          const vAxis = vScale.axis;
          const { spanGaps, segment } = this.options;
          const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
          const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
          const end = start + count;
          const pointsCount = points.length;
          let prevParsed = start > 0 && this.getParsed(start - 1);
          for (let i6 = 0; i6 < pointsCount; ++i6) {
            const point = points[i6];
            const properties = directUpdate ? point : {};
            if (i6 < start || i6 >= end) {
              properties.skip = true;
              continue;
            }
            const parsed = this.getParsed(i6);
            const nullData = isNullOrUndef(parsed[vAxis]);
            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i6);
            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i6);
            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
            properties.stop = i6 > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
            if (segment) {
              properties.parsed = parsed;
              properties.raw = _dataset.data[i6];
            }
            if (includeOptions) {
              properties.options = sharedOptions || this.resolveDataElementOptions(i6, point.active ? "active" : mode);
            }
            if (!directUpdate) {
              this.updateElement(point, i6, properties, mode);
            }
            prevParsed = parsed;
          }
        }
        getMaxOverflow() {
          const meta = this._cachedMeta;
          const dataset = meta.dataset;
          const border = dataset.options && dataset.options.borderWidth || 0;
          const data = meta.data || [];
          if (!data.length) {
            return border;
          }
          const firstPoint = data[0].size(this.resolveDataElementOptions(0));
          const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
          return Math.max(border, firstPoint, lastPoint) / 2;
        }
        draw() {
          const meta = this._cachedMeta;
          meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
          super.draw();
        }
      };
      __publicField(LineController, "id", "line");
      __publicField(LineController, "defaults", {
        datasetElementType: "line",
        dataElementType: "point",
        showLine: true,
        spanGaps: false
      });
      __publicField(LineController, "overrides", {
        scales: {
          _index_: {
            type: "category"
          },
          _value_: {
            type: "linear"
          }
        }
      });
      PolarAreaController = class extends DatasetController {
        constructor(chart2, datasetIndex) {
          super(chart2, datasetIndex);
          this.innerRadius = void 0;
          this.outerRadius = void 0;
        }
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const chart2 = this.chart;
          const labels = chart2.data.labels || [];
          const value = formatNumber2(meta._parsed[index2].r, chart2.options.locale);
          return {
            label: labels[index2] || "",
            value
          };
        }
        parseObjectData(meta, data, start, count) {
          return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
        }
        update(mode) {
          const arcs = this._cachedMeta.data;
          this._updateRadius();
          this.updateElements(arcs, 0, arcs.length, mode);
        }
        getMinMax() {
          const meta = this._cachedMeta;
          const range = {
            min: Number.POSITIVE_INFINITY,
            max: Number.NEGATIVE_INFINITY
          };
          meta.data.forEach((element, index2) => {
            const parsed = this.getParsed(index2).r;
            if (!isNaN(parsed) && this.chart.getDataVisibility(index2)) {
              if (parsed < range.min) {
                range.min = parsed;
              }
              if (parsed > range.max) {
                range.max = parsed;
              }
            }
          });
          return range;
        }
        _updateRadius() {
          const chart2 = this.chart;
          const chartArea = chart2.chartArea;
          const opts = chart2.options;
          const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          const outerRadius = Math.max(minSize / 2, 0);
          const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
          const radiusLength = (outerRadius - innerRadius) / chart2.getVisibleDatasetCount();
          this.outerRadius = outerRadius - radiusLength * this.index;
          this.innerRadius = this.outerRadius - radiusLength;
        }
        updateElements(arcs, start, count, mode) {
          const reset = mode === "reset";
          const chart2 = this.chart;
          const opts = chart2.options;
          const animationOpts = opts.animation;
          const scale = this._cachedMeta.rScale;
          const centerX = scale.xCenter;
          const centerY = scale.yCenter;
          const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
          let angle = datasetStartAngle;
          let i6;
          const defaultAngle = 360 / this.countVisibleElements();
          for (i6 = 0; i6 < start; ++i6) {
            angle += this._computeAngle(i6, mode, defaultAngle);
          }
          for (i6 = start; i6 < start + count; i6++) {
            const arc = arcs[i6];
            let startAngle = angle;
            let endAngle = angle + this._computeAngle(i6, mode, defaultAngle);
            let outerRadius = chart2.getDataVisibility(i6) ? scale.getDistanceFromCenterForValue(this.getParsed(i6).r) : 0;
            angle = endAngle;
            if (reset) {
              if (animationOpts.animateScale) {
                outerRadius = 0;
              }
              if (animationOpts.animateRotate) {
                startAngle = endAngle = datasetStartAngle;
              }
            }
            const properties = {
              x: centerX,
              y: centerY,
              innerRadius: 0,
              outerRadius,
              startAngle,
              endAngle,
              options: this.resolveDataElementOptions(i6, arc.active ? "active" : mode)
            };
            this.updateElement(arc, i6, properties, mode);
          }
        }
        countVisibleElements() {
          const meta = this._cachedMeta;
          let count = 0;
          meta.data.forEach((element, index2) => {
            if (!isNaN(this.getParsed(index2).r) && this.chart.getDataVisibility(index2)) {
              count++;
            }
          });
          return count;
        }
        _computeAngle(index2, mode, defaultAngle) {
          return this.chart.getDataVisibility(index2) ? toRadians(this.resolveDataElementOptions(index2, mode).angle || defaultAngle) : 0;
        }
      };
      __publicField(PolarAreaController, "id", "polarArea");
      __publicField(PolarAreaController, "defaults", {
        dataElementType: "arc",
        animation: {
          animateRotate: true,
          animateScale: true
        },
        animations: {
          numbers: {
            type: "number",
            properties: [
              "x",
              "y",
              "startAngle",
              "endAngle",
              "innerRadius",
              "outerRadius"
            ]
          }
        },
        indexAxis: "r",
        startAngle: 0
      });
      __publicField(PolarAreaController, "overrides", {
        aspectRatio: 1,
        plugins: {
          legend: {
            labels: {
              generateLabels(chart2) {
                const data = chart2.data;
                if (data.labels.length && data.datasets.length) {
                  const { labels: { pointStyle, color: color2 } } = chart2.legend.options;
                  return data.labels.map((label, i6) => {
                    const meta = chart2.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i6);
                    return {
                      text: label,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      fontColor: color2,
                      lineWidth: style.borderWidth,
                      pointStyle,
                      hidden: !chart2.getDataVisibility(i6),
                      index: i6
                    };
                  });
                }
                return [];
              }
            },
            onClick(e7, legendItem, legend) {
              legend.chart.toggleDataVisibility(legendItem.index);
              legend.chart.update();
            }
          }
        },
        scales: {
          r: {
            type: "radialLinear",
            angleLines: {
              display: false
            },
            beginAtZero: true,
            grid: {
              circular: true
            },
            pointLabels: {
              display: false
            },
            startAngle: 0
          }
        }
      });
      PieController = class extends DoughnutController {
      };
      __publicField(PieController, "id", "pie");
      __publicField(PieController, "defaults", {
        cutout: 0,
        rotation: 0,
        circumference: 360,
        radius: "100%"
      });
      RadarController = class extends DatasetController {
        getLabelAndValue(index2) {
          const vScale = this._cachedMeta.vScale;
          const parsed = this.getParsed(index2);
          return {
            label: vScale.getLabels()[index2],
            value: "" + vScale.getLabelForValue(parsed[vScale.axis])
          };
        }
        parseObjectData(meta, data, start, count) {
          return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
        }
        update(mode) {
          const meta = this._cachedMeta;
          const line = meta.dataset;
          const points = meta.data || [];
          const labels = meta.iScale.getLabels();
          line.points = points;
          if (mode !== "resize") {
            const options = this.resolveDatasetElementOptions(mode);
            if (!this.options.showLine) {
              options.borderWidth = 0;
            }
            const properties = {
              _loop: true,
              _fullLoop: labels.length === points.length,
              options
            };
            this.updateElement(line, void 0, properties, mode);
          }
          this.updateElements(points, 0, points.length, mode);
        }
        updateElements(points, start, count, mode) {
          const scale = this._cachedMeta.rScale;
          const reset = mode === "reset";
          for (let i6 = start; i6 < start + count; i6++) {
            const point = points[i6];
            const options = this.resolveDataElementOptions(i6, point.active ? "active" : mode);
            const pointPosition = scale.getPointPositionForValue(i6, this.getParsed(i6).r);
            const x2 = reset ? scale.xCenter : pointPosition.x;
            const y3 = reset ? scale.yCenter : pointPosition.y;
            const properties = {
              x: x2,
              y: y3,
              angle: pointPosition.angle,
              skip: isNaN(x2) || isNaN(y3),
              options
            };
            this.updateElement(point, i6, properties, mode);
          }
        }
      };
      __publicField(RadarController, "id", "radar");
      __publicField(RadarController, "defaults", {
        datasetElementType: "line",
        dataElementType: "point",
        indexAxis: "r",
        showLine: true,
        elements: {
          line: {
            fill: "start"
          }
        }
      });
      __publicField(RadarController, "overrides", {
        aspectRatio: 1,
        scales: {
          r: {
            type: "radialLinear"
          }
        }
      });
      ScatterController = class extends DatasetController {
        getLabelAndValue(index2) {
          const meta = this._cachedMeta;
          const labels = this.chart.data.labels || [];
          const { xScale, yScale } = meta;
          const parsed = this.getParsed(index2);
          const x2 = xScale.getLabelForValue(parsed.x);
          const y3 = yScale.getLabelForValue(parsed.y);
          return {
            label: labels[index2] || "",
            value: "(" + x2 + ", " + y3 + ")"
          };
        }
        update(mode) {
          const meta = this._cachedMeta;
          const { data: points = [] } = meta;
          const animationsDisabled = this.chart._animationsDisabled;
          let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
          this._drawStart = start;
          this._drawCount = count;
          if (_scaleRangesChanged(meta)) {
            start = 0;
            count = points.length;
          }
          if (this.options.showLine) {
            if (!this.datasetElementType) {
              this.addElements();
            }
            const { dataset: line, _dataset } = meta;
            line._chart = this.chart;
            line._datasetIndex = this.index;
            line._decimated = !!_dataset._decimated;
            line.points = points;
            const options = this.resolveDatasetElementOptions(mode);
            options.segment = this.options.segment;
            this.updateElement(line, void 0, {
              animated: !animationsDisabled,
              options
            }, mode);
          } else if (this.datasetElementType) {
            delete meta.dataset;
            this.datasetElementType = false;
          }
          this.updateElements(points, start, count, mode);
        }
        addElements() {
          const { showLine } = this.options;
          if (!this.datasetElementType && showLine) {
            this.datasetElementType = this.chart.registry.getElement("line");
          }
          super.addElements();
        }
        updateElements(points, start, count, mode) {
          const reset = mode === "reset";
          const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
          const firstOpts = this.resolveDataElementOptions(start, mode);
          const sharedOptions = this.getSharedOptions(firstOpts);
          const includeOptions = this.includeOptions(mode, sharedOptions);
          const iAxis = iScale.axis;
          const vAxis = vScale.axis;
          const { spanGaps, segment } = this.options;
          const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
          const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
          let prevParsed = start > 0 && this.getParsed(start - 1);
          for (let i6 = start; i6 < start + count; ++i6) {
            const point = points[i6];
            const parsed = this.getParsed(i6);
            const properties = directUpdate ? point : {};
            const nullData = isNullOrUndef(parsed[vAxis]);
            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i6);
            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i6);
            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
            properties.stop = i6 > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
            if (segment) {
              properties.parsed = parsed;
              properties.raw = _dataset.data[i6];
            }
            if (includeOptions) {
              properties.options = sharedOptions || this.resolveDataElementOptions(i6, point.active ? "active" : mode);
            }
            if (!directUpdate) {
              this.updateElement(point, i6, properties, mode);
            }
            prevParsed = parsed;
          }
          this.updateSharedOptions(sharedOptions, mode, firstOpts);
        }
        getMaxOverflow() {
          const meta = this._cachedMeta;
          const data = meta.data || [];
          if (!this.options.showLine) {
            let max = 0;
            for (let i6 = data.length - 1; i6 >= 0; --i6) {
              max = Math.max(max, data[i6].size(this.resolveDataElementOptions(i6)) / 2);
            }
            return max > 0 && max;
          }
          const dataset = meta.dataset;
          const border = dataset.options && dataset.options.borderWidth || 0;
          if (!data.length) {
            return border;
          }
          const firstPoint = data[0].size(this.resolveDataElementOptions(0));
          const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
          return Math.max(border, firstPoint, lastPoint) / 2;
        }
      };
      __publicField(ScatterController, "id", "scatter");
      __publicField(ScatterController, "defaults", {
        datasetElementType: false,
        dataElementType: "point",
        showLine: false,
        fill: false
      });
      __publicField(ScatterController, "overrides", {
        interaction: {
          mode: "point"
        },
        scales: {
          x: {
            type: "linear"
          },
          y: {
            type: "linear"
          }
        }
      });
      controllers = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        BarController,
        BubbleController,
        DoughnutController,
        LineController,
        PieController,
        PolarAreaController,
        RadarController,
        ScatterController
      });
      DateAdapterBase = class _DateAdapterBase {
        constructor(options) {
          __publicField(this, "options");
          this.options = options || {};
        }
        /**
        * Override default date adapter methods.
        * Accepts type parameter to define options type.
        * @example
        * Chart._adapters._date.override<{myAdapterOption: string}>({
        *   init() {
        *     console.log(this.options.myAdapterOption);
        *   }
        * })
        */
        static override(members) {
          Object.assign(_DateAdapterBase.prototype, members);
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        init() {
        }
        formats() {
          return abstract();
        }
        parse() {
          return abstract();
        }
        format() {
          return abstract();
        }
        add() {
          return abstract();
        }
        diff() {
          return abstract();
        }
        startOf() {
          return abstract();
        }
        endOf() {
          return abstract();
        }
      };
      adapters = {
        _date: DateAdapterBase
      };
      Interaction = {
        evaluateInteractionItems,
        modes: {
          index(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            const axis = options.axis || "x";
            const includeInvisible = options.includeInvisible || false;
            const items = options.intersect ? getIntersectItems(chart2, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart2, position, axis, false, useFinalPosition, includeInvisible);
            const elements2 = [];
            if (!items.length) {
              return [];
            }
            chart2.getSortedVisibleDatasetMetas().forEach((meta) => {
              const index2 = items[0].index;
              const element = meta.data[index2];
              if (element && !element.skip) {
                elements2.push({
                  element,
                  datasetIndex: meta.index,
                  index: index2
                });
              }
            });
            return elements2;
          },
          dataset(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            const axis = options.axis || "xy";
            const includeInvisible = options.includeInvisible || false;
            let items = options.intersect ? getIntersectItems(chart2, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart2, position, axis, false, useFinalPosition, includeInvisible);
            if (items.length > 0) {
              const datasetIndex = items[0].datasetIndex;
              const data = chart2.getDatasetMeta(datasetIndex).data;
              items = [];
              for (let i6 = 0; i6 < data.length; ++i6) {
                items.push({
                  element: data[i6],
                  datasetIndex,
                  index: i6
                });
              }
            }
            return items;
          },
          point(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            const axis = options.axis || "xy";
            const includeInvisible = options.includeInvisible || false;
            return getIntersectItems(chart2, position, axis, useFinalPosition, includeInvisible);
          },
          nearest(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            const axis = options.axis || "xy";
            const includeInvisible = options.includeInvisible || false;
            return getNearestItems(chart2, position, axis, options.intersect, useFinalPosition, includeInvisible);
          },
          x(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            return getAxisItems(chart2, position, "x", options.intersect, useFinalPosition);
          },
          y(chart2, e7, options, useFinalPosition) {
            const position = getRelativePosition(e7, chart2);
            return getAxisItems(chart2, position, "y", options.intersect, useFinalPosition);
          }
        }
      };
      STATIC_POSITIONS = [
        "left",
        "top",
        "right",
        "bottom"
      ];
      layouts = {
        addBox(chart2, item) {
          if (!chart2.boxes) {
            chart2.boxes = [];
          }
          item.fullSize = item.fullSize || false;
          item.position = item.position || "top";
          item.weight = item.weight || 0;
          item._layers = item._layers || function() {
            return [
              {
                z: 0,
                draw(chartArea) {
                  item.draw(chartArea);
                }
              }
            ];
          };
          chart2.boxes.push(item);
        },
        removeBox(chart2, layoutItem) {
          const index2 = chart2.boxes ? chart2.boxes.indexOf(layoutItem) : -1;
          if (index2 !== -1) {
            chart2.boxes.splice(index2, 1);
          }
        },
        configure(chart2, item, options) {
          item.fullSize = options.fullSize;
          item.position = options.position;
          item.weight = options.weight;
        },
        update(chart2, width, height, minPadding) {
          if (!chart2) {
            return;
          }
          const padding = toPadding(chart2.options.layout.padding);
          const availableWidth = Math.max(width - padding.width, 0);
          const availableHeight = Math.max(height - padding.height, 0);
          const boxes = buildLayoutBoxes(chart2.boxes);
          const verticalBoxes = boxes.vertical;
          const horizontalBoxes = boxes.horizontal;
          each(chart2.boxes, (box) => {
            if (typeof box.beforeLayout === "function") {
              box.beforeLayout();
            }
          });
          const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
          const params = Object.freeze({
            outerWidth: width,
            outerHeight: height,
            padding,
            availableWidth,
            availableHeight,
            vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
            hBoxMaxHeight: availableHeight / 2
          });
          const maxPadding = Object.assign({}, padding);
          updateMaxPadding(maxPadding, toPadding(minPadding));
          const chartArea = Object.assign({
            maxPadding,
            w: availableWidth,
            h: availableHeight,
            x: padding.left,
            y: padding.top
          }, padding);
          const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
          fitBoxes(boxes.fullSize, chartArea, params, stacks);
          fitBoxes(verticalBoxes, chartArea, params, stacks);
          if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
            fitBoxes(verticalBoxes, chartArea, params, stacks);
          }
          handleMaxPadding(chartArea);
          placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
          chartArea.x += chartArea.w;
          chartArea.y += chartArea.h;
          placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
          chart2.chartArea = {
            left: chartArea.left,
            top: chartArea.top,
            right: chartArea.left + chartArea.w,
            bottom: chartArea.top + chartArea.h,
            height: chartArea.h,
            width: chartArea.w
          };
          each(boxes.chartArea, (layout) => {
            const box = layout.box;
            Object.assign(box, chart2.chartArea);
            box.update(chartArea.w, chartArea.h, {
              left: 0,
              top: 0,
              right: 0,
              bottom: 0
            });
          });
        }
      };
      BasePlatform = class {
        acquireContext(canvas, aspectRatio) {
        }
        releaseContext(context) {
          return false;
        }
        addEventListener(chart2, type, listener) {
        }
        removeEventListener(chart2, type, listener) {
        }
        getDevicePixelRatio() {
          return 1;
        }
        getMaximumSize(element, width, height, aspectRatio) {
          width = Math.max(0, width || element.width);
          height = height || element.height;
          return {
            width,
            height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
          };
        }
        isAttached(canvas) {
          return true;
        }
        updateConfig(config) {
        }
      };
      BasicPlatform = class extends BasePlatform {
        acquireContext(item) {
          return item && item.getContext && item.getContext("2d") || null;
        }
        updateConfig(config) {
          config.options.animation = false;
        }
      };
      EXPANDO_KEY = "$chartjs";
      EVENT_TYPES = {
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup",
        pointerenter: "mouseenter",
        pointerdown: "mousedown",
        pointermove: "mousemove",
        pointerup: "mouseup",
        pointerleave: "mouseout",
        pointerout: "mouseout"
      };
      isNullOrEmpty = (value) => value === null || value === "";
      eventListenerOptions = supportsEventListenerOptions ? {
        passive: true
      } : false;
      drpListeningCharts = /* @__PURE__ */ new Map();
      oldDevicePixelRatio = 0;
      DomPlatform = class extends BasePlatform {
        acquireContext(canvas, aspectRatio) {
          const context = canvas && canvas.getContext && canvas.getContext("2d");
          if (context && context.canvas === canvas) {
            initCanvas(canvas, aspectRatio);
            return context;
          }
          return null;
        }
        releaseContext(context) {
          const canvas = context.canvas;
          if (!canvas[EXPANDO_KEY]) {
            return false;
          }
          const initial = canvas[EXPANDO_KEY].initial;
          [
            "height",
            "width"
          ].forEach((prop) => {
            const value = initial[prop];
            if (isNullOrUndef(value)) {
              canvas.removeAttribute(prop);
            } else {
              canvas.setAttribute(prop, value);
            }
          });
          const style = initial.style || {};
          Object.keys(style).forEach((key) => {
            canvas.style[key] = style[key];
          });
          canvas.width = canvas.width;
          delete canvas[EXPANDO_KEY];
          return true;
        }
        addEventListener(chart2, type, listener) {
          this.removeEventListener(chart2, type);
          const proxies = chart2.$proxies || (chart2.$proxies = {});
          const handlers = {
            attach: createAttachObserver,
            detach: createDetachObserver,
            resize: createResizeObserver
          };
          const handler = handlers[type] || createProxyAndListen;
          proxies[type] = handler(chart2, type, listener);
        }
        removeEventListener(chart2, type) {
          const proxies = chart2.$proxies || (chart2.$proxies = {});
          const proxy = proxies[type];
          if (!proxy) {
            return;
          }
          const handlers = {
            attach: releaseObserver,
            detach: releaseObserver,
            resize: releaseObserver
          };
          const handler = handlers[type] || removeListener;
          handler(chart2, type, proxy);
          proxies[type] = void 0;
        }
        getDevicePixelRatio() {
          return window.devicePixelRatio;
        }
        getMaximumSize(canvas, width, height, aspectRatio) {
          return getMaximumSize(canvas, width, height, aspectRatio);
        }
        isAttached(canvas) {
          const container = canvas && _getParentNode(canvas);
          return !!(container && container.isConnected);
        }
      };
      Element = class {
        constructor() {
          __publicField(this, "x");
          __publicField(this, "y");
          __publicField(this, "active", false);
          __publicField(this, "options");
          __publicField(this, "$animations");
        }
        tooltipPosition(useFinalPosition) {
          const { x: x2, y: y3 } = this.getProps([
            "x",
            "y"
          ], useFinalPosition);
          return {
            x: x2,
            y: y3
          };
        }
        hasValue() {
          return isNumber(this.x) && isNumber(this.y);
        }
        getProps(props, final) {
          const anims = this.$animations;
          if (!final || !anims) {
            return this;
          }
          const ret = {};
          props.forEach((prop) => {
            ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
          });
          return ret;
        }
      };
      __publicField(Element, "defaults", {});
      __publicField(Element, "defaultRoutes");
      reverseAlign = (align) => align === "left" ? "right" : align === "right" ? "left" : align;
      offsetFromEdge = (scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset;
      getTicksLimit = (ticksLength, maxTicksLimit) => Math.min(maxTicksLimit || ticksLength, ticksLength);
      Scale = class _Scale extends Element {
        constructor(cfg) {
          super();
          this.id = cfg.id;
          this.type = cfg.type;
          this.options = void 0;
          this.ctx = cfg.ctx;
          this.chart = cfg.chart;
          this.top = void 0;
          this.bottom = void 0;
          this.left = void 0;
          this.right = void 0;
          this.width = void 0;
          this.height = void 0;
          this._margins = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          };
          this.maxWidth = void 0;
          this.maxHeight = void 0;
          this.paddingTop = void 0;
          this.paddingBottom = void 0;
          this.paddingLeft = void 0;
          this.paddingRight = void 0;
          this.axis = void 0;
          this.labelRotation = void 0;
          this.min = void 0;
          this.max = void 0;
          this._range = void 0;
          this.ticks = [];
          this._gridLineItems = null;
          this._labelItems = null;
          this._labelSizes = null;
          this._length = 0;
          this._maxLength = 0;
          this._longestTextCache = {};
          this._startPixel = void 0;
          this._endPixel = void 0;
          this._reversePixels = false;
          this._userMax = void 0;
          this._userMin = void 0;
          this._suggestedMax = void 0;
          this._suggestedMin = void 0;
          this._ticksLength = 0;
          this._borderValue = 0;
          this._cache = {};
          this._dataLimitsCached = false;
          this.$context = void 0;
        }
        init(options) {
          this.options = options.setContext(this.getContext());
          this.axis = options.axis;
          this._userMin = this.parse(options.min);
          this._userMax = this.parse(options.max);
          this._suggestedMin = this.parse(options.suggestedMin);
          this._suggestedMax = this.parse(options.suggestedMax);
        }
        parse(raw, index2) {
          return raw;
        }
        getUserBounds() {
          let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this;
          _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
          _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
          _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
          _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
          return {
            min: finiteOrDefault(_userMin, _suggestedMin),
            max: finiteOrDefault(_userMax, _suggestedMax),
            minDefined: isNumberFinite(_userMin),
            maxDefined: isNumberFinite(_userMax)
          };
        }
        getMinMax(canStack) {
          let { min, max, minDefined, maxDefined } = this.getUserBounds();
          let range;
          if (minDefined && maxDefined) {
            return {
              min,
              max
            };
          }
          const metas = this.getMatchingVisibleMetas();
          for (let i6 = 0, ilen = metas.length; i6 < ilen; ++i6) {
            range = metas[i6].controller.getMinMax(this, canStack);
            if (!minDefined) {
              min = Math.min(min, range.min);
            }
            if (!maxDefined) {
              max = Math.max(max, range.max);
            }
          }
          min = maxDefined && min > max ? max : min;
          max = minDefined && min > max ? min : max;
          return {
            min: finiteOrDefault(min, finiteOrDefault(max, min)),
            max: finiteOrDefault(max, finiteOrDefault(min, max))
          };
        }
        getPadding() {
          return {
            left: this.paddingLeft || 0,
            top: this.paddingTop || 0,
            right: this.paddingRight || 0,
            bottom: this.paddingBottom || 0
          };
        }
        getTicks() {
          return this.ticks;
        }
        getLabels() {
          const data = this.chart.data;
          return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
        }
        getLabelItems(chartArea = this.chart.chartArea) {
          const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
          return items;
        }
        beforeLayout() {
          this._cache = {};
          this._dataLimitsCached = false;
        }
        beforeUpdate() {
          callback(this.options.beforeUpdate, [
            this
          ]);
        }
        update(maxWidth, maxHeight, margins) {
          const { beginAtZero, grace, ticks: tickOpts } = this.options;
          const sampleSize = tickOpts.sampleSize;
          this.beforeUpdate();
          this.maxWidth = maxWidth;
          this.maxHeight = maxHeight;
          this._margins = margins = Object.assign({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }, margins);
          this.ticks = null;
          this._labelSizes = null;
          this._gridLineItems = null;
          this._labelItems = null;
          this.beforeSetDimensions();
          this.setDimensions();
          this.afterSetDimensions();
          this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
          if (!this._dataLimitsCached) {
            this.beforeDataLimits();
            this.determineDataLimits();
            this.afterDataLimits();
            this._range = _addGrace(this, grace, beginAtZero);
            this._dataLimitsCached = true;
          }
          this.beforeBuildTicks();
          this.ticks = this.buildTicks() || [];
          this.afterBuildTicks();
          const samplingEnabled = sampleSize < this.ticks.length;
          this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
          this.configure();
          this.beforeCalculateLabelRotation();
          this.calculateLabelRotation();
          this.afterCalculateLabelRotation();
          if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
            this.ticks = autoSkip(this, this.ticks);
            this._labelSizes = null;
            this.afterAutoSkip();
          }
          if (samplingEnabled) {
            this._convertTicksToLabels(this.ticks);
          }
          this.beforeFit();
          this.fit();
          this.afterFit();
          this.afterUpdate();
        }
        configure() {
          let reversePixels = this.options.reverse;
          let startPixel, endPixel;
          if (this.isHorizontal()) {
            startPixel = this.left;
            endPixel = this.right;
          } else {
            startPixel = this.top;
            endPixel = this.bottom;
            reversePixels = !reversePixels;
          }
          this._startPixel = startPixel;
          this._endPixel = endPixel;
          this._reversePixels = reversePixels;
          this._length = endPixel - startPixel;
          this._alignToPixels = this.options.alignToPixels;
        }
        afterUpdate() {
          callback(this.options.afterUpdate, [
            this
          ]);
        }
        beforeSetDimensions() {
          callback(this.options.beforeSetDimensions, [
            this
          ]);
        }
        setDimensions() {
          if (this.isHorizontal()) {
            this.width = this.maxWidth;
            this.left = 0;
            this.right = this.width;
          } else {
            this.height = this.maxHeight;
            this.top = 0;
            this.bottom = this.height;
          }
          this.paddingLeft = 0;
          this.paddingTop = 0;
          this.paddingRight = 0;
          this.paddingBottom = 0;
        }
        afterSetDimensions() {
          callback(this.options.afterSetDimensions, [
            this
          ]);
        }
        _callHooks(name) {
          this.chart.notifyPlugins(name, this.getContext());
          callback(this.options[name], [
            this
          ]);
        }
        beforeDataLimits() {
          this._callHooks("beforeDataLimits");
        }
        determineDataLimits() {
        }
        afterDataLimits() {
          this._callHooks("afterDataLimits");
        }
        beforeBuildTicks() {
          this._callHooks("beforeBuildTicks");
        }
        buildTicks() {
          return [];
        }
        afterBuildTicks() {
          this._callHooks("afterBuildTicks");
        }
        beforeTickToLabelConversion() {
          callback(this.options.beforeTickToLabelConversion, [
            this
          ]);
        }
        generateTickLabels(ticks) {
          const tickOpts = this.options.ticks;
          let i6, ilen, tick;
          for (i6 = 0, ilen = ticks.length; i6 < ilen; i6++) {
            tick = ticks[i6];
            tick.label = callback(tickOpts.callback, [
              tick.value,
              i6,
              ticks
            ], this);
          }
        }
        afterTickToLabelConversion() {
          callback(this.options.afterTickToLabelConversion, [
            this
          ]);
        }
        beforeCalculateLabelRotation() {
          callback(this.options.beforeCalculateLabelRotation, [
            this
          ]);
        }
        calculateLabelRotation() {
          const options = this.options;
          const tickOpts = options.ticks;
          const numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
          const minRotation = tickOpts.minRotation || 0;
          const maxRotation = tickOpts.maxRotation;
          let labelRotation = minRotation;
          let tickWidth, maxHeight, maxLabelDiagonal;
          if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
            this.labelRotation = minRotation;
            return;
          }
          const labelSizes = this._getLabelSizes();
          const maxLabelWidth = labelSizes.widest.width;
          const maxLabelHeight = labelSizes.highest.height;
          const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
          tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
          if (maxLabelWidth + 6 > tickWidth) {
            tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
            maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
            maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
            labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
            labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
          }
          this.labelRotation = labelRotation;
        }
        afterCalculateLabelRotation() {
          callback(this.options.afterCalculateLabelRotation, [
            this
          ]);
        }
        afterAutoSkip() {
        }
        beforeFit() {
          callback(this.options.beforeFit, [
            this
          ]);
        }
        fit() {
          const minSize = {
            width: 0,
            height: 0
          };
          const { chart: chart2, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this;
          const display = this._isVisible();
          const isHorizontal = this.isHorizontal();
          if (display) {
            const titleHeight = getTitleHeight(titleOpts, chart2.options.font);
            if (isHorizontal) {
              minSize.width = this.maxWidth;
              minSize.height = getTickMarkLength(gridOpts) + titleHeight;
            } else {
              minSize.height = this.maxHeight;
              minSize.width = getTickMarkLength(gridOpts) + titleHeight;
            }
            if (tickOpts.display && this.ticks.length) {
              const { first, last, widest, highest } = this._getLabelSizes();
              const tickPadding = tickOpts.padding * 2;
              const angleRadians = toRadians(this.labelRotation);
              const cos = Math.cos(angleRadians);
              const sin = Math.sin(angleRadians);
              if (isHorizontal) {
                const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
                minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
              } else {
                const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
                minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
              }
              this._calculatePadding(first, last, sin, cos);
            }
          }
          this._handleMargins();
          if (isHorizontal) {
            this.width = this._length = chart2.width - this._margins.left - this._margins.right;
            this.height = minSize.height;
          } else {
            this.width = minSize.width;
            this.height = this._length = chart2.height - this._margins.top - this._margins.bottom;
          }
        }
        _calculatePadding(first, last, sin, cos) {
          const { ticks: { align, padding }, position } = this.options;
          const isRotated = this.labelRotation !== 0;
          const labelsBelowTicks = position !== "top" && this.axis === "x";
          if (this.isHorizontal()) {
            const offsetLeft = this.getPixelForTick(0) - this.left;
            const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
            let paddingLeft = 0;
            let paddingRight = 0;
            if (isRotated) {
              if (labelsBelowTicks) {
                paddingLeft = cos * first.width;
                paddingRight = sin * last.height;
              } else {
                paddingLeft = sin * first.height;
                paddingRight = cos * last.width;
              }
            } else if (align === "start") {
              paddingRight = last.width;
            } else if (align === "end") {
              paddingLeft = first.width;
            } else if (align !== "inner") {
              paddingLeft = first.width / 2;
              paddingRight = last.width / 2;
            }
            this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
            this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
          } else {
            let paddingTop = last.height / 2;
            let paddingBottom = first.height / 2;
            if (align === "start") {
              paddingTop = 0;
              paddingBottom = first.height;
            } else if (align === "end") {
              paddingTop = last.height;
              paddingBottom = 0;
            }
            this.paddingTop = paddingTop + padding;
            this.paddingBottom = paddingBottom + padding;
          }
        }
        _handleMargins() {
          if (this._margins) {
            this._margins.left = Math.max(this.paddingLeft, this._margins.left);
            this._margins.top = Math.max(this.paddingTop, this._margins.top);
            this._margins.right = Math.max(this.paddingRight, this._margins.right);
            this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
          }
        }
        afterFit() {
          callback(this.options.afterFit, [
            this
          ]);
        }
        isHorizontal() {
          const { axis, position } = this.options;
          return position === "top" || position === "bottom" || axis === "x";
        }
        isFullSize() {
          return this.options.fullSize;
        }
        _convertTicksToLabels(ticks) {
          this.beforeTickToLabelConversion();
          this.generateTickLabels(ticks);
          let i6, ilen;
          for (i6 = 0, ilen = ticks.length; i6 < ilen; i6++) {
            if (isNullOrUndef(ticks[i6].label)) {
              ticks.splice(i6, 1);
              ilen--;
              i6--;
            }
          }
          this.afterTickToLabelConversion();
        }
        _getLabelSizes() {
          let labelSizes = this._labelSizes;
          if (!labelSizes) {
            const sampleSize = this.options.ticks.sampleSize;
            let ticks = this.ticks;
            if (sampleSize < ticks.length) {
              ticks = sample(ticks, sampleSize);
            }
            this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
          }
          return labelSizes;
        }
        _computeLabelSizes(ticks, length, maxTicksLimit) {
          const { ctx, _longestTextCache: caches } = this;
          const widths = [];
          const heights = [];
          const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
          let widestLabelSize = 0;
          let highestLabelSize = 0;
          let i6, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
          for (i6 = 0; i6 < length; i6 += increment) {
            label = ticks[i6].label;
            tickFont = this._resolveTickFontOptions(i6);
            ctx.font = fontString = tickFont.string;
            cache = caches[fontString] = caches[fontString] || {
              data: {},
              gc: []
            };
            lineHeight = tickFont.lineHeight;
            width = height = 0;
            if (!isNullOrUndef(label) && !isArray(label)) {
              width = _measureText(ctx, cache.data, cache.gc, width, label);
              height = lineHeight;
            } else if (isArray(label)) {
              for (j = 0, jlen = label.length; j < jlen; ++j) {
                nestedLabel = label[j];
                if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
                  width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
                  height += lineHeight;
                }
              }
            }
            widths.push(width);
            heights.push(height);
            widestLabelSize = Math.max(width, widestLabelSize);
            highestLabelSize = Math.max(height, highestLabelSize);
          }
          garbageCollect(caches, length);
          const widest = widths.indexOf(widestLabelSize);
          const highest = heights.indexOf(highestLabelSize);
          const valueAt = (idx) => ({
            width: widths[idx] || 0,
            height: heights[idx] || 0
          });
          return {
            first: valueAt(0),
            last: valueAt(length - 1),
            widest: valueAt(widest),
            highest: valueAt(highest),
            widths,
            heights
          };
        }
        getLabelForValue(value) {
          return value;
        }
        getPixelForValue(value, index2) {
          return NaN;
        }
        getValueForPixel(pixel) {
        }
        getPixelForTick(index2) {
          const ticks = this.ticks;
          if (index2 < 0 || index2 > ticks.length - 1) {
            return null;
          }
          return this.getPixelForValue(ticks[index2].value);
        }
        getPixelForDecimal(decimal) {
          if (this._reversePixels) {
            decimal = 1 - decimal;
          }
          const pixel = this._startPixel + decimal * this._length;
          return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
        }
        getDecimalForPixel(pixel) {
          const decimal = (pixel - this._startPixel) / this._length;
          return this._reversePixels ? 1 - decimal : decimal;
        }
        getBasePixel() {
          return this.getPixelForValue(this.getBaseValue());
        }
        getBaseValue() {
          const { min, max } = this;
          return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
        }
        getContext(index2) {
          const ticks = this.ticks || [];
          if (index2 >= 0 && index2 < ticks.length) {
            const tick = ticks[index2];
            return tick.$context || (tick.$context = createTickContext(this.getContext(), index2, tick));
          }
          return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
        }
        _tickSize() {
          const optionTicks = this.options.ticks;
          const rot = toRadians(this.labelRotation);
          const cos = Math.abs(Math.cos(rot));
          const sin = Math.abs(Math.sin(rot));
          const labelSizes = this._getLabelSizes();
          const padding = optionTicks.autoSkipPadding || 0;
          const w2 = labelSizes ? labelSizes.widest.width + padding : 0;
          const h4 = labelSizes ? labelSizes.highest.height + padding : 0;
          return this.isHorizontal() ? h4 * cos > w2 * sin ? w2 / cos : h4 / sin : h4 * sin < w2 * cos ? h4 / cos : w2 / sin;
        }
        _isVisible() {
          const display = this.options.display;
          if (display !== "auto") {
            return !!display;
          }
          return this.getMatchingVisibleMetas().length > 0;
        }
        _computeGridLineItems(chartArea) {
          const axis = this.axis;
          const chart2 = this.chart;
          const options = this.options;
          const { grid, position, border } = options;
          const offset = grid.offset;
          const isHorizontal = this.isHorizontal();
          const ticks = this.ticks;
          const ticksLength = ticks.length + (offset ? 1 : 0);
          const tl = getTickMarkLength(grid);
          const items = [];
          const borderOpts = border.setContext(this.getContext());
          const axisWidth = borderOpts.display ? borderOpts.width : 0;
          const axisHalfWidth = axisWidth / 2;
          const alignBorderValue = function(pixel) {
            return _alignPixel(chart2, pixel, axisWidth);
          };
          let borderValue, i6, lineValue, alignedLineValue;
          let tx1, ty1, tx2, ty2, x1, y1, x2, y22;
          if (position === "top") {
            borderValue = alignBorderValue(this.bottom);
            ty1 = this.bottom - tl;
            ty2 = borderValue - axisHalfWidth;
            y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
            y22 = chartArea.bottom;
          } else if (position === "bottom") {
            borderValue = alignBorderValue(this.top);
            y1 = chartArea.top;
            y22 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
            ty1 = borderValue + axisHalfWidth;
            ty2 = this.top + tl;
          } else if (position === "left") {
            borderValue = alignBorderValue(this.right);
            tx1 = this.right - tl;
            tx2 = borderValue - axisHalfWidth;
            x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
            x2 = chartArea.right;
          } else if (position === "right") {
            borderValue = alignBorderValue(this.left);
            x1 = chartArea.left;
            x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
            tx1 = borderValue + axisHalfWidth;
            tx2 = this.left + tl;
          } else if (axis === "x") {
            if (position === "center") {
              borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
            } else if (isObject(position)) {
              const positionAxisID = Object.keys(position)[0];
              const value = position[positionAxisID];
              borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
            }
            y1 = chartArea.top;
            y22 = chartArea.bottom;
            ty1 = borderValue + axisHalfWidth;
            ty2 = ty1 + tl;
          } else if (axis === "y") {
            if (position === "center") {
              borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
            } else if (isObject(position)) {
              const positionAxisID = Object.keys(position)[0];
              const value = position[positionAxisID];
              borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
            }
            tx1 = borderValue - axisHalfWidth;
            tx2 = tx1 - tl;
            x1 = chartArea.left;
            x2 = chartArea.right;
          }
          const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
          const step = Math.max(1, Math.ceil(ticksLength / limit));
          for (i6 = 0; i6 < ticksLength; i6 += step) {
            const context = this.getContext(i6);
            const optsAtIndex = grid.setContext(context);
            const optsAtIndexBorder = border.setContext(context);
            const lineWidth = optsAtIndex.lineWidth;
            const lineColor = optsAtIndex.color;
            const borderDash = optsAtIndexBorder.dash || [];
            const borderDashOffset = optsAtIndexBorder.dashOffset;
            const tickWidth = optsAtIndex.tickWidth;
            const tickColor = optsAtIndex.tickColor;
            const tickBorderDash = optsAtIndex.tickBorderDash || [];
            const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
            lineValue = getPixelForGridLine(this, i6, offset);
            if (lineValue === void 0) {
              continue;
            }
            alignedLineValue = _alignPixel(chart2, lineValue, lineWidth);
            if (isHorizontal) {
              tx1 = tx2 = x1 = x2 = alignedLineValue;
            } else {
              ty1 = ty2 = y1 = y22 = alignedLineValue;
            }
            items.push({
              tx1,
              ty1,
              tx2,
              ty2,
              x1,
              y1,
              x2,
              y2: y22,
              width: lineWidth,
              color: lineColor,
              borderDash,
              borderDashOffset,
              tickWidth,
              tickColor,
              tickBorderDash,
              tickBorderDashOffset
            });
          }
          this._ticksLength = ticksLength;
          this._borderValue = borderValue;
          return items;
        }
        _computeLabelItems(chartArea) {
          const axis = this.axis;
          const options = this.options;
          const { position, ticks: optionTicks } = options;
          const isHorizontal = this.isHorizontal();
          const ticks = this.ticks;
          const { align, crossAlign, padding, mirror } = optionTicks;
          const tl = getTickMarkLength(options.grid);
          const tickAndPadding = tl + padding;
          const hTickAndPadding = mirror ? -padding : tickAndPadding;
          const rotation = -toRadians(this.labelRotation);
          const items = [];
          let i6, ilen, tick, label, x2, y3, textAlign, pixel, font, lineHeight, lineCount, textOffset;
          let textBaseline = "middle";
          if (position === "top") {
            y3 = this.bottom - hTickAndPadding;
            textAlign = this._getXAxisLabelAlignment();
          } else if (position === "bottom") {
            y3 = this.top + hTickAndPadding;
            textAlign = this._getXAxisLabelAlignment();
          } else if (position === "left") {
            const ret = this._getYAxisLabelAlignment(tl);
            textAlign = ret.textAlign;
            x2 = ret.x;
          } else if (position === "right") {
            const ret = this._getYAxisLabelAlignment(tl);
            textAlign = ret.textAlign;
            x2 = ret.x;
          } else if (axis === "x") {
            if (position === "center") {
              y3 = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
            } else if (isObject(position)) {
              const positionAxisID = Object.keys(position)[0];
              const value = position[positionAxisID];
              y3 = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
            }
            textAlign = this._getXAxisLabelAlignment();
          } else if (axis === "y") {
            if (position === "center") {
              x2 = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
            } else if (isObject(position)) {
              const positionAxisID = Object.keys(position)[0];
              const value = position[positionAxisID];
              x2 = this.chart.scales[positionAxisID].getPixelForValue(value);
            }
            textAlign = this._getYAxisLabelAlignment(tl).textAlign;
          }
          if (axis === "y") {
            if (align === "start") {
              textBaseline = "top";
            } else if (align === "end") {
              textBaseline = "bottom";
            }
          }
          const labelSizes = this._getLabelSizes();
          for (i6 = 0, ilen = ticks.length; i6 < ilen; ++i6) {
            tick = ticks[i6];
            label = tick.label;
            const optsAtIndex = optionTicks.setContext(this.getContext(i6));
            pixel = this.getPixelForTick(i6) + optionTicks.labelOffset;
            font = this._resolveTickFontOptions(i6);
            lineHeight = font.lineHeight;
            lineCount = isArray(label) ? label.length : 1;
            const halfCount = lineCount / 2;
            const color2 = optsAtIndex.color;
            const strokeColor = optsAtIndex.textStrokeColor;
            const strokeWidth = optsAtIndex.textStrokeWidth;
            let tickTextAlign = textAlign;
            if (isHorizontal) {
              x2 = pixel;
              if (textAlign === "inner") {
                if (i6 === ilen - 1) {
                  tickTextAlign = !this.options.reverse ? "right" : "left";
                } else if (i6 === 0) {
                  tickTextAlign = !this.options.reverse ? "left" : "right";
                } else {
                  tickTextAlign = "center";
                }
              }
              if (position === "top") {
                if (crossAlign === "near" || rotation !== 0) {
                  textOffset = -lineCount * lineHeight + lineHeight / 2;
                } else if (crossAlign === "center") {
                  textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
                } else {
                  textOffset = -labelSizes.highest.height + lineHeight / 2;
                }
              } else {
                if (crossAlign === "near" || rotation !== 0) {
                  textOffset = lineHeight / 2;
                } else if (crossAlign === "center") {
                  textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
                } else {
                  textOffset = labelSizes.highest.height - lineCount * lineHeight;
                }
              }
              if (mirror) {
                textOffset *= -1;
              }
              if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
                x2 += lineHeight / 2 * Math.sin(rotation);
              }
            } else {
              y3 = pixel;
              textOffset = (1 - lineCount) * lineHeight / 2;
            }
            let backdrop;
            if (optsAtIndex.showLabelBackdrop) {
              const labelPadding = toPadding(optsAtIndex.backdropPadding);
              const height = labelSizes.heights[i6];
              const width = labelSizes.widths[i6];
              let top = textOffset - labelPadding.top;
              let left = 0 - labelPadding.left;
              switch (textBaseline) {
                case "middle":
                  top -= height / 2;
                  break;
                case "bottom":
                  top -= height;
                  break;
              }
              switch (textAlign) {
                case "center":
                  left -= width / 2;
                  break;
                case "right":
                  left -= width;
                  break;
                case "inner":
                  if (i6 === ilen - 1) {
                    left -= width;
                  } else if (i6 > 0) {
                    left -= width / 2;
                  }
                  break;
              }
              backdrop = {
                left,
                top,
                width: width + labelPadding.width,
                height: height + labelPadding.height,
                color: optsAtIndex.backdropColor
              };
            }
            items.push({
              label,
              font,
              textOffset,
              options: {
                rotation,
                color: color2,
                strokeColor,
                strokeWidth,
                textAlign: tickTextAlign,
                textBaseline,
                translation: [
                  x2,
                  y3
                ],
                backdrop
              }
            });
          }
          return items;
        }
        _getXAxisLabelAlignment() {
          const { position, ticks } = this.options;
          const rotation = -toRadians(this.labelRotation);
          if (rotation) {
            return position === "top" ? "left" : "right";
          }
          let align = "center";
          if (ticks.align === "start") {
            align = "left";
          } else if (ticks.align === "end") {
            align = "right";
          } else if (ticks.align === "inner") {
            align = "inner";
          }
          return align;
        }
        _getYAxisLabelAlignment(tl) {
          const { position, ticks: { crossAlign, mirror, padding } } = this.options;
          const labelSizes = this._getLabelSizes();
          const tickAndPadding = tl + padding;
          const widest = labelSizes.widest.width;
          let textAlign;
          let x2;
          if (position === "left") {
            if (mirror) {
              x2 = this.right + padding;
              if (crossAlign === "near") {
                textAlign = "left";
              } else if (crossAlign === "center") {
                textAlign = "center";
                x2 += widest / 2;
              } else {
                textAlign = "right";
                x2 += widest;
              }
            } else {
              x2 = this.right - tickAndPadding;
              if (crossAlign === "near") {
                textAlign = "right";
              } else if (crossAlign === "center") {
                textAlign = "center";
                x2 -= widest / 2;
              } else {
                textAlign = "left";
                x2 = this.left;
              }
            }
          } else if (position === "right") {
            if (mirror) {
              x2 = this.left + padding;
              if (crossAlign === "near") {
                textAlign = "right";
              } else if (crossAlign === "center") {
                textAlign = "center";
                x2 -= widest / 2;
              } else {
                textAlign = "left";
                x2 -= widest;
              }
            } else {
              x2 = this.left + tickAndPadding;
              if (crossAlign === "near") {
                textAlign = "left";
              } else if (crossAlign === "center") {
                textAlign = "center";
                x2 += widest / 2;
              } else {
                textAlign = "right";
                x2 = this.right;
              }
            }
          } else {
            textAlign = "right";
          }
          return {
            textAlign,
            x: x2
          };
        }
        _computeLabelArea() {
          if (this.options.ticks.mirror) {
            return;
          }
          const chart2 = this.chart;
          const position = this.options.position;
          if (position === "left" || position === "right") {
            return {
              top: 0,
              left: this.left,
              bottom: chart2.height,
              right: this.right
            };
          }
          if (position === "top" || position === "bottom") {
            return {
              top: this.top,
              left: 0,
              bottom: this.bottom,
              right: chart2.width
            };
          }
        }
        drawBackground() {
          const { ctx, options: { backgroundColor }, left, top, width, height } = this;
          if (backgroundColor) {
            ctx.save();
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(left, top, width, height);
            ctx.restore();
          }
        }
        getLineWidthForValue(value) {
          const grid = this.options.grid;
          if (!this._isVisible() || !grid.display) {
            return 0;
          }
          const ticks = this.ticks;
          const index2 = ticks.findIndex((t4) => t4.value === value);
          if (index2 >= 0) {
            const opts = grid.setContext(this.getContext(index2));
            return opts.lineWidth;
          }
          return 0;
        }
        drawGrid(chartArea) {
          const grid = this.options.grid;
          const ctx = this.ctx;
          const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
          let i6, ilen;
          const drawLine = (p1, p22, style) => {
            if (!style.width || !style.color) {
              return;
            }
            ctx.save();
            ctx.lineWidth = style.width;
            ctx.strokeStyle = style.color;
            ctx.setLineDash(style.borderDash || []);
            ctx.lineDashOffset = style.borderDashOffset;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p22.x, p22.y);
            ctx.stroke();
            ctx.restore();
          };
          if (grid.display) {
            for (i6 = 0, ilen = items.length; i6 < ilen; ++i6) {
              const item = items[i6];
              if (grid.drawOnChartArea) {
                drawLine({
                  x: item.x1,
                  y: item.y1
                }, {
                  x: item.x2,
                  y: item.y2
                }, item);
              }
              if (grid.drawTicks) {
                drawLine({
                  x: item.tx1,
                  y: item.ty1
                }, {
                  x: item.tx2,
                  y: item.ty2
                }, {
                  color: item.tickColor,
                  width: item.tickWidth,
                  borderDash: item.tickBorderDash,
                  borderDashOffset: item.tickBorderDashOffset
                });
              }
            }
          }
        }
        drawBorder() {
          const { chart: chart2, ctx, options: { border, grid } } = this;
          const borderOpts = border.setContext(this.getContext());
          const axisWidth = border.display ? borderOpts.width : 0;
          if (!axisWidth) {
            return;
          }
          const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
          const borderValue = this._borderValue;
          let x1, x2, y1, y22;
          if (this.isHorizontal()) {
            x1 = _alignPixel(chart2, this.left, axisWidth) - axisWidth / 2;
            x2 = _alignPixel(chart2, this.right, lastLineWidth) + lastLineWidth / 2;
            y1 = y22 = borderValue;
          } else {
            y1 = _alignPixel(chart2, this.top, axisWidth) - axisWidth / 2;
            y22 = _alignPixel(chart2, this.bottom, lastLineWidth) + lastLineWidth / 2;
            x1 = x2 = borderValue;
          }
          ctx.save();
          ctx.lineWidth = borderOpts.width;
          ctx.strokeStyle = borderOpts.color;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y22);
          ctx.stroke();
          ctx.restore();
        }
        drawLabels(chartArea) {
          const optionTicks = this.options.ticks;
          if (!optionTicks.display) {
            return;
          }
          const ctx = this.ctx;
          const area = this._computeLabelArea();
          if (area) {
            clipArea(ctx, area);
          }
          const items = this.getLabelItems(chartArea);
          for (const item of items) {
            const renderTextOptions = item.options;
            const tickFont = item.font;
            const label = item.label;
            const y3 = item.textOffset;
            renderText(ctx, label, 0, y3, tickFont, renderTextOptions);
          }
          if (area) {
            unclipArea(ctx);
          }
        }
        drawTitle() {
          const { ctx, options: { position, title, reverse } } = this;
          if (!title.display) {
            return;
          }
          const font = toFont(title.font);
          const padding = toPadding(title.padding);
          const align = title.align;
          let offset = font.lineHeight / 2;
          if (position === "bottom" || position === "center" || isObject(position)) {
            offset += padding.bottom;
            if (isArray(title.text)) {
              offset += font.lineHeight * (title.text.length - 1);
            }
          } else {
            offset += padding.top;
          }
          const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align);
          renderText(ctx, title.text, 0, 0, font, {
            color: title.color,
            maxWidth,
            rotation,
            textAlign: titleAlign(align, position, reverse),
            textBaseline: "middle",
            translation: [
              titleX,
              titleY
            ]
          });
        }
        draw(chartArea) {
          if (!this._isVisible()) {
            return;
          }
          this.drawBackground();
          this.drawGrid(chartArea);
          this.drawBorder();
          this.drawTitle();
          this.drawLabels(chartArea);
        }
        _layers() {
          const opts = this.options;
          const tz = opts.ticks && opts.ticks.z || 0;
          const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
          const bz = valueOrDefault(opts.border && opts.border.z, 0);
          if (!this._isVisible() || this.draw !== _Scale.prototype.draw) {
            return [
              {
                z: tz,
                draw: (chartArea) => {
                  this.draw(chartArea);
                }
              }
            ];
          }
          return [
            {
              z: gz,
              draw: (chartArea) => {
                this.drawBackground();
                this.drawGrid(chartArea);
                this.drawTitle();
              }
            },
            {
              z: bz,
              draw: () => {
                this.drawBorder();
              }
            },
            {
              z: tz,
              draw: (chartArea) => {
                this.drawLabels(chartArea);
              }
            }
          ];
        }
        getMatchingVisibleMetas(type) {
          const metas = this.chart.getSortedVisibleDatasetMetas();
          const axisID = this.axis + "AxisID";
          const result = [];
          let i6, ilen;
          for (i6 = 0, ilen = metas.length; i6 < ilen; ++i6) {
            const meta = metas[i6];
            if (meta[axisID] === this.id && (!type || meta.type === type)) {
              result.push(meta);
            }
          }
          return result;
        }
        _resolveTickFontOptions(index2) {
          const opts = this.options.ticks.setContext(this.getContext(index2));
          return toFont(opts.font);
        }
        _maxDigits() {
          const fontSize = this._resolveTickFontOptions(0).lineHeight;
          return (this.isHorizontal() ? this.width : this.height) / fontSize;
        }
      };
      TypedRegistry = class {
        constructor(type, scope, override) {
          this.type = type;
          this.scope = scope;
          this.override = override;
          this.items = /* @__PURE__ */ Object.create(null);
        }
        isForType(type) {
          return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
        }
        register(item) {
          const proto = Object.getPrototypeOf(item);
          let parentScope;
          if (isIChartComponent(proto)) {
            parentScope = this.register(proto);
          }
          const items = this.items;
          const id = item.id;
          const scope = this.scope + "." + id;
          if (!id) {
            throw new Error("class does not have id: " + item);
          }
          if (id in items) {
            return scope;
          }
          items[id] = item;
          registerDefaults(item, scope, parentScope);
          if (this.override) {
            defaults.override(item.id, item.overrides);
          }
          return scope;
        }
        get(id) {
          return this.items[id];
        }
        unregister(item) {
          const items = this.items;
          const id = item.id;
          const scope = this.scope;
          if (id in items) {
            delete items[id];
          }
          if (scope && id in defaults[scope]) {
            delete defaults[scope][id];
            if (this.override) {
              delete overrides[id];
            }
          }
        }
      };
      Registry = class {
        constructor() {
          this.controllers = new TypedRegistry(DatasetController, "datasets", true);
          this.elements = new TypedRegistry(Element, "elements");
          this.plugins = new TypedRegistry(Object, "plugins");
          this.scales = new TypedRegistry(Scale, "scales");
          this._typedRegistries = [
            this.controllers,
            this.scales,
            this.elements
          ];
        }
        add(...args) {
          this._each("register", args);
        }
        remove(...args) {
          this._each("unregister", args);
        }
        addControllers(...args) {
          this._each("register", args, this.controllers);
        }
        addElements(...args) {
          this._each("register", args, this.elements);
        }
        addPlugins(...args) {
          this._each("register", args, this.plugins);
        }
        addScales(...args) {
          this._each("register", args, this.scales);
        }
        getController(id) {
          return this._get(id, this.controllers, "controller");
        }
        getElement(id) {
          return this._get(id, this.elements, "element");
        }
        getPlugin(id) {
          return this._get(id, this.plugins, "plugin");
        }
        getScale(id) {
          return this._get(id, this.scales, "scale");
        }
        removeControllers(...args) {
          this._each("unregister", args, this.controllers);
        }
        removeElements(...args) {
          this._each("unregister", args, this.elements);
        }
        removePlugins(...args) {
          this._each("unregister", args, this.plugins);
        }
        removeScales(...args) {
          this._each("unregister", args, this.scales);
        }
        _each(method, args, typedRegistry) {
          [
            ...args
          ].forEach((arg) => {
            const reg = typedRegistry || this._getRegistryForType(arg);
            if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
              this._exec(method, reg, arg);
            } else {
              each(arg, (item) => {
                const itemReg = typedRegistry || this._getRegistryForType(item);
                this._exec(method, itemReg, item);
              });
            }
          });
        }
        _exec(method, registry2, component) {
          const camelMethod = _capitalize(method);
          callback(component["before" + camelMethod], [], component);
          registry2[method](component);
          callback(component["after" + camelMethod], [], component);
        }
        _getRegistryForType(type) {
          for (let i6 = 0; i6 < this._typedRegistries.length; i6++) {
            const reg = this._typedRegistries[i6];
            if (reg.isForType(type)) {
              return reg;
            }
          }
          return this.plugins;
        }
        _get(id, typedRegistry, type) {
          const item = typedRegistry.get(id);
          if (item === void 0) {
            throw new Error('"' + id + '" is not a registered ' + type + ".");
          }
          return item;
        }
      };
      registry = /* @__PURE__ */ new Registry();
      PluginService = class {
        constructor() {
          this._init = void 0;
        }
        notify(chart2, hook, args, filter) {
          if (hook === "beforeInit") {
            this._init = this._createDescriptors(chart2, true);
            this._notify(this._init, chart2, "install");
          }
          if (this._init === void 0) {
            return;
          }
          const descriptors2 = filter ? this._descriptors(chart2).filter(filter) : this._descriptors(chart2);
          const result = this._notify(descriptors2, chart2, hook, args);
          if (hook === "afterDestroy") {
            this._notify(descriptors2, chart2, "stop");
            this._notify(this._init, chart2, "uninstall");
            this._init = void 0;
          }
          return result;
        }
        _notify(descriptors2, chart2, hook, args) {
          args = args || {};
          for (const descriptor of descriptors2) {
            const plugin = descriptor.plugin;
            const method = plugin[hook];
            const params = [
              chart2,
              args,
              descriptor.options
            ];
            if (callback(method, params, plugin) === false && args.cancelable) {
              return false;
            }
          }
          return true;
        }
        invalidate() {
          if (!isNullOrUndef(this._cache)) {
            this._oldCache = this._cache;
            this._cache = void 0;
          }
        }
        _descriptors(chart2) {
          if (this._cache) {
            return this._cache;
          }
          const descriptors2 = this._cache = this._createDescriptors(chart2);
          this._notifyStateChanges(chart2);
          return descriptors2;
        }
        _createDescriptors(chart2, all) {
          const config = chart2 && chart2.config;
          const options = valueOrDefault(config.options && config.options.plugins, {});
          const plugins2 = allPlugins(config);
          return options === false && !all ? [] : createDescriptors(chart2, plugins2, options, all);
        }
        _notifyStateChanges(chart2) {
          const previousDescriptors = this._oldCache || [];
          const descriptors2 = this._cache;
          const diff = (a3, b3) => a3.filter((x2) => !b3.some((y3) => x2.plugin.id === y3.plugin.id));
          this._notify(diff(previousDescriptors, descriptors2), chart2, "stop");
          this._notify(diff(descriptors2, previousDescriptors), chart2, "start");
        }
      };
      keyCache = /* @__PURE__ */ new Map();
      keysCached = /* @__PURE__ */ new Set();
      addIfFound = (set2, obj, key) => {
        const opts = resolveObjectKey(obj, key);
        if (opts !== void 0) {
          set2.add(opts);
        }
      };
      Config = class {
        constructor(config) {
          this._config = initConfig(config);
          this._scopeCache = /* @__PURE__ */ new Map();
          this._resolverCache = /* @__PURE__ */ new Map();
        }
        get platform() {
          return this._config.platform;
        }
        get type() {
          return this._config.type;
        }
        set type(type) {
          this._config.type = type;
        }
        get data() {
          return this._config.data;
        }
        set data(data) {
          this._config.data = initData(data);
        }
        get options() {
          return this._config.options;
        }
        set options(options) {
          this._config.options = options;
        }
        get plugins() {
          return this._config.plugins;
        }
        update() {
          const config = this._config;
          this.clearCache();
          initOptions(config);
        }
        clearCache() {
          this._scopeCache.clear();
          this._resolverCache.clear();
        }
        datasetScopeKeys(datasetType) {
          return cachedKeys(datasetType, () => [
            [
              `datasets.${datasetType}`,
              ""
            ]
          ]);
        }
        datasetAnimationScopeKeys(datasetType, transition) {
          return cachedKeys(`${datasetType}.transition.${transition}`, () => [
            [
              `datasets.${datasetType}.transitions.${transition}`,
              `transitions.${transition}`
            ],
            [
              `datasets.${datasetType}`,
              ""
            ]
          ]);
        }
        datasetElementScopeKeys(datasetType, elementType) {
          return cachedKeys(`${datasetType}-${elementType}`, () => [
            [
              `datasets.${datasetType}.elements.${elementType}`,
              `datasets.${datasetType}`,
              `elements.${elementType}`,
              ""
            ]
          ]);
        }
        pluginScopeKeys(plugin) {
          const id = plugin.id;
          const type = this.type;
          return cachedKeys(`${type}-plugin-${id}`, () => [
            [
              `plugins.${id}`,
              ...plugin.additionalOptionScopes || []
            ]
          ]);
        }
        _cachedScopes(mainScope, resetCache) {
          const _scopeCache = this._scopeCache;
          let cache = _scopeCache.get(mainScope);
          if (!cache || resetCache) {
            cache = /* @__PURE__ */ new Map();
            _scopeCache.set(mainScope, cache);
          }
          return cache;
        }
        getOptionScopes(mainScope, keyLists, resetCache) {
          const { options, type } = this;
          const cache = this._cachedScopes(mainScope, resetCache);
          const cached = cache.get(keyLists);
          if (cached) {
            return cached;
          }
          const scopes = /* @__PURE__ */ new Set();
          keyLists.forEach((keys) => {
            if (mainScope) {
              scopes.add(mainScope);
              keys.forEach((key) => addIfFound(scopes, mainScope, key));
            }
            keys.forEach((key) => addIfFound(scopes, options, key));
            keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
            keys.forEach((key) => addIfFound(scopes, defaults, key));
            keys.forEach((key) => addIfFound(scopes, descriptors, key));
          });
          const array = Array.from(scopes);
          if (array.length === 0) {
            array.push(/* @__PURE__ */ Object.create(null));
          }
          if (keysCached.has(keyLists)) {
            cache.set(keyLists, array);
          }
          return array;
        }
        chartOptionScopes() {
          const { options, type } = this;
          return [
            options,
            overrides[type] || {},
            defaults.datasets[type] || {},
            {
              type
            },
            defaults,
            descriptors
          ];
        }
        resolveNamedOptions(scopes, names2, context, prefixes = [
          ""
        ]) {
          const result = {
            $shared: true
          };
          const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes);
          let options = resolver;
          if (needContext(resolver, names2)) {
            result.$shared = false;
            context = isFunction(context) ? context() : context;
            const subResolver = this.createResolver(scopes, context, subPrefixes);
            options = _attachContext(resolver, context, subResolver);
          }
          for (const prop of names2) {
            result[prop] = options[prop];
          }
          return result;
        }
        createResolver(scopes, context, prefixes = [
          ""
        ], descriptorDefaults) {
          const { resolver } = getResolver(this._resolverCache, scopes, prefixes);
          return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
        }
      };
      hasFunction = (value) => isObject(value) && Object.getOwnPropertyNames(value).some((key) => isFunction(value[key]));
      version = "4.5.1";
      KNOWN_POSITIONS = [
        "top",
        "bottom",
        "left",
        "right",
        "chartArea"
      ];
      instances = {};
      getChart = (key) => {
        const canvas = getCanvas(key);
        return Object.values(instances).filter((c4) => c4.canvas === canvas).pop();
      };
      Chart = class {
        static register(...items) {
          registry.add(...items);
          invalidatePlugins();
        }
        static unregister(...items) {
          registry.remove(...items);
          invalidatePlugins();
        }
        constructor(item, userConfig) {
          const config = this.config = new Config(userConfig);
          const initialCanvas = getCanvas(item);
          const existingChart = getChart(initialCanvas);
          if (existingChart) {
            throw new Error("Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas with ID '" + existingChart.canvas.id + "' can be reused.");
          }
          const options = config.createResolver(config.chartOptionScopes(), this.getContext());
          this.platform = new (config.platform || _detectPlatform(initialCanvas))();
          this.platform.updateConfig(config);
          const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
          const canvas = context && context.canvas;
          const height = canvas && canvas.height;
          const width = canvas && canvas.width;
          this.id = uid();
          this.ctx = context;
          this.canvas = canvas;
          this.width = width;
          this.height = height;
          this._options = options;
          this._aspectRatio = this.aspectRatio;
          this._layers = [];
          this._metasets = [];
          this._stacks = void 0;
          this.boxes = [];
          this.currentDevicePixelRatio = void 0;
          this.chartArea = void 0;
          this._active = [];
          this._lastEvent = void 0;
          this._listeners = {};
          this._responsiveListeners = void 0;
          this._sortedMetasets = [];
          this.scales = {};
          this._plugins = new PluginService();
          this.$proxies = {};
          this._hiddenIndices = {};
          this.attached = false;
          this._animationsDisabled = void 0;
          this.$context = void 0;
          this._doResize = debounce((mode) => this.update(mode), options.resizeDelay || 0);
          this._dataChanges = [];
          instances[this.id] = this;
          if (!context || !canvas) {
            console.error("Failed to create chart: can't acquire context from the given item");
            return;
          }
          animator.listen(this, "complete", onAnimationsComplete);
          animator.listen(this, "progress", onAnimationProgress);
          this._initialize();
          if (this.attached) {
            this.update();
          }
        }
        get aspectRatio() {
          const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this;
          if (!isNullOrUndef(aspectRatio)) {
            return aspectRatio;
          }
          if (maintainAspectRatio && _aspectRatio) {
            return _aspectRatio;
          }
          return height ? width / height : null;
        }
        get data() {
          return this.config.data;
        }
        set data(data) {
          this.config.data = data;
        }
        get options() {
          return this._options;
        }
        set options(options) {
          this.config.options = options;
        }
        get registry() {
          return registry;
        }
        _initialize() {
          this.notifyPlugins("beforeInit");
          if (this.options.responsive) {
            this.resize();
          } else {
            retinaScale(this, this.options.devicePixelRatio);
          }
          this.bindEvents();
          this.notifyPlugins("afterInit");
          return this;
        }
        clear() {
          clearCanvas(this.canvas, this.ctx);
          return this;
        }
        stop() {
          animator.stop(this);
          return this;
        }
        resize(width, height) {
          if (!animator.running(this)) {
            this._resize(width, height);
          } else {
            this._resizeBeforeDraw = {
              width,
              height
            };
          }
        }
        _resize(width, height) {
          const options = this.options;
          const canvas = this.canvas;
          const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
          const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
          const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
          const mode = this.width ? "resize" : "attach";
          this.width = newSize.width;
          this.height = newSize.height;
          this._aspectRatio = this.aspectRatio;
          if (!retinaScale(this, newRatio, true)) {
            return;
          }
          this.notifyPlugins("resize", {
            size: newSize
          });
          callback(options.onResize, [
            this,
            newSize
          ], this);
          if (this.attached) {
            if (this._doResize(mode)) {
              this.render();
            }
          }
        }
        ensureScalesHaveIDs() {
          const options = this.options;
          const scalesOptions = options.scales || {};
          each(scalesOptions, (axisOptions, axisID) => {
            axisOptions.id = axisID;
          });
        }
        buildOrUpdateScales() {
          const options = this.options;
          const scaleOpts = options.scales;
          const scales2 = this.scales;
          const updated = Object.keys(scales2).reduce((obj, id) => {
            obj[id] = false;
            return obj;
          }, {});
          let items = [];
          if (scaleOpts) {
            items = items.concat(Object.keys(scaleOpts).map((id) => {
              const scaleOptions = scaleOpts[id];
              const axis = determineAxis(id, scaleOptions);
              const isRadial = axis === "r";
              const isHorizontal = axis === "x";
              return {
                options: scaleOptions,
                dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
                dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
              };
            }));
          }
          each(items, (item) => {
            const scaleOptions = item.options;
            const id = scaleOptions.id;
            const axis = determineAxis(id, scaleOptions);
            const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
            if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
              scaleOptions.position = item.dposition;
            }
            updated[id] = true;
            let scale = null;
            if (id in scales2 && scales2[id].type === scaleType) {
              scale = scales2[id];
            } else {
              const scaleClass = registry.getScale(scaleType);
              scale = new scaleClass({
                id,
                type: scaleType,
                ctx: this.ctx,
                chart: this
              });
              scales2[scale.id] = scale;
            }
            scale.init(scaleOptions, options);
          });
          each(updated, (hasUpdated, id) => {
            if (!hasUpdated) {
              delete scales2[id];
            }
          });
          each(scales2, (scale) => {
            layouts.configure(this, scale, scale.options);
            layouts.addBox(this, scale);
          });
        }
        _updateMetasets() {
          const metasets = this._metasets;
          const numData = this.data.datasets.length;
          const numMeta = metasets.length;
          metasets.sort((a3, b3) => a3.index - b3.index);
          if (numMeta > numData) {
            for (let i6 = numData; i6 < numMeta; ++i6) {
              this._destroyDatasetMeta(i6);
            }
            metasets.splice(numData, numMeta - numData);
          }
          this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
        }
        _removeUnreferencedMetasets() {
          const { _metasets: metasets, data: { datasets } } = this;
          if (metasets.length > datasets.length) {
            delete this._stacks;
          }
          metasets.forEach((meta, index2) => {
            if (datasets.filter((x2) => x2 === meta._dataset).length === 0) {
              this._destroyDatasetMeta(index2);
            }
          });
        }
        buildOrUpdateControllers() {
          const newControllers = [];
          const datasets = this.data.datasets;
          let i6, ilen;
          this._removeUnreferencedMetasets();
          for (i6 = 0, ilen = datasets.length; i6 < ilen; i6++) {
            const dataset = datasets[i6];
            let meta = this.getDatasetMeta(i6);
            const type = dataset.type || this.config.type;
            if (meta.type && meta.type !== type) {
              this._destroyDatasetMeta(i6);
              meta = this.getDatasetMeta(i6);
            }
            meta.type = type;
            meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
            meta.order = dataset.order || 0;
            meta.index = i6;
            meta.label = "" + dataset.label;
            meta.visible = this.isDatasetVisible(i6);
            if (meta.controller) {
              meta.controller.updateIndex(i6);
              meta.controller.linkScales();
            } else {
              const ControllerClass = registry.getController(type);
              const { datasetElementType, dataElementType } = defaults.datasets[type];
              Object.assign(ControllerClass, {
                dataElementType: registry.getElement(dataElementType),
                datasetElementType: datasetElementType && registry.getElement(datasetElementType)
              });
              meta.controller = new ControllerClass(this, i6);
              newControllers.push(meta.controller);
            }
          }
          this._updateMetasets();
          return newControllers;
        }
        _resetElements() {
          each(this.data.datasets, (dataset, datasetIndex) => {
            this.getDatasetMeta(datasetIndex).controller.reset();
          }, this);
        }
        reset() {
          this._resetElements();
          this.notifyPlugins("reset");
        }
        update(mode) {
          const config = this.config;
          config.update();
          const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
          const animsDisabled = this._animationsDisabled = !options.animation;
          this._updateScales();
          this._checkEventBindings();
          this._updateHiddenIndices();
          this._plugins.invalidate();
          if (this.notifyPlugins("beforeUpdate", {
            mode,
            cancelable: true
          }) === false) {
            return;
          }
          const newControllers = this.buildOrUpdateControllers();
          this.notifyPlugins("beforeElementsUpdate");
          let minPadding = 0;
          for (let i6 = 0, ilen = this.data.datasets.length; i6 < ilen; i6++) {
            const { controller } = this.getDatasetMeta(i6);
            const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
            controller.buildOrUpdateElements(reset);
            minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
          }
          minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
          this._updateLayout(minPadding);
          if (!animsDisabled) {
            each(newControllers, (controller) => {
              controller.reset();
            });
          }
          this._updateDatasets(mode);
          this.notifyPlugins("afterUpdate", {
            mode
          });
          this._layers.sort(compare2Level("z", "_idx"));
          const { _active, _lastEvent } = this;
          if (_lastEvent) {
            this._eventHandler(_lastEvent, true);
          } else if (_active.length) {
            this._updateHoverStyles(_active, _active, true);
          }
          this.render();
        }
        _updateScales() {
          each(this.scales, (scale) => {
            layouts.removeBox(this, scale);
          });
          this.ensureScalesHaveIDs();
          this.buildOrUpdateScales();
        }
        _checkEventBindings() {
          const options = this.options;
          const existingEvents = new Set(Object.keys(this._listeners));
          const newEvents = new Set(options.events);
          if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
            this.unbindEvents();
            this.bindEvents();
          }
        }
        _updateHiddenIndices() {
          const { _hiddenIndices } = this;
          const changes = this._getUniformDataChanges() || [];
          for (const { method, start, count } of changes) {
            const move = method === "_removeElements" ? -count : count;
            moveNumericKeys(_hiddenIndices, start, move);
          }
        }
        _getUniformDataChanges() {
          const _dataChanges = this._dataChanges;
          if (!_dataChanges || !_dataChanges.length) {
            return;
          }
          this._dataChanges = [];
          const datasetCount = this.data.datasets.length;
          const makeSet = (idx) => new Set(_dataChanges.filter((c4) => c4[0] === idx).map((c4, i6) => i6 + "," + c4.splice(1).join(",")));
          const changeSet = makeSet(0);
          for (let i6 = 1; i6 < datasetCount; i6++) {
            if (!setsEqual(changeSet, makeSet(i6))) {
              return;
            }
          }
          return Array.from(changeSet).map((c4) => c4.split(",")).map((a3) => ({
            method: a3[1],
            start: +a3[2],
            count: +a3[3]
          }));
        }
        _updateLayout(minPadding) {
          if (this.notifyPlugins("beforeLayout", {
            cancelable: true
          }) === false) {
            return;
          }
          layouts.update(this, this.width, this.height, minPadding);
          const area = this.chartArea;
          const noArea = area.width <= 0 || area.height <= 0;
          this._layers = [];
          each(this.boxes, (box) => {
            if (noArea && box.position === "chartArea") {
              return;
            }
            if (box.configure) {
              box.configure();
            }
            this._layers.push(...box._layers());
          }, this);
          this._layers.forEach((item, index2) => {
            item._idx = index2;
          });
          this.notifyPlugins("afterLayout");
        }
        _updateDatasets(mode) {
          if (this.notifyPlugins("beforeDatasetsUpdate", {
            mode,
            cancelable: true
          }) === false) {
            return;
          }
          for (let i6 = 0, ilen = this.data.datasets.length; i6 < ilen; ++i6) {
            this.getDatasetMeta(i6).controller.configure();
          }
          for (let i6 = 0, ilen = this.data.datasets.length; i6 < ilen; ++i6) {
            this._updateDataset(i6, isFunction(mode) ? mode({
              datasetIndex: i6
            }) : mode);
          }
          this.notifyPlugins("afterDatasetsUpdate", {
            mode
          });
        }
        _updateDataset(index2, mode) {
          const meta = this.getDatasetMeta(index2);
          const args = {
            meta,
            index: index2,
            mode,
            cancelable: true
          };
          if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
            return;
          }
          meta.controller._update(mode);
          args.cancelable = false;
          this.notifyPlugins("afterDatasetUpdate", args);
        }
        render() {
          if (this.notifyPlugins("beforeRender", {
            cancelable: true
          }) === false) {
            return;
          }
          if (animator.has(this)) {
            if (this.attached && !animator.running(this)) {
              animator.start(this);
            }
          } else {
            this.draw();
            onAnimationsComplete({
              chart: this
            });
          }
        }
        draw() {
          let i6;
          if (this._resizeBeforeDraw) {
            const { width, height } = this._resizeBeforeDraw;
            this._resizeBeforeDraw = null;
            this._resize(width, height);
          }
          this.clear();
          if (this.width <= 0 || this.height <= 0) {
            return;
          }
          if (this.notifyPlugins("beforeDraw", {
            cancelable: true
          }) === false) {
            return;
          }
          const layers = this._layers;
          for (i6 = 0; i6 < layers.length && layers[i6].z <= 0; ++i6) {
            layers[i6].draw(this.chartArea);
          }
          this._drawDatasets();
          for (; i6 < layers.length; ++i6) {
            layers[i6].draw(this.chartArea);
          }
          this.notifyPlugins("afterDraw");
        }
        _getSortedDatasetMetas(filterVisible) {
          const metasets = this._sortedMetasets;
          const result = [];
          let i6, ilen;
          for (i6 = 0, ilen = metasets.length; i6 < ilen; ++i6) {
            const meta = metasets[i6];
            if (!filterVisible || meta.visible) {
              result.push(meta);
            }
          }
          return result;
        }
        getSortedVisibleDatasetMetas() {
          return this._getSortedDatasetMetas(true);
        }
        _drawDatasets() {
          if (this.notifyPlugins("beforeDatasetsDraw", {
            cancelable: true
          }) === false) {
            return;
          }
          const metasets = this.getSortedVisibleDatasetMetas();
          for (let i6 = metasets.length - 1; i6 >= 0; --i6) {
            this._drawDataset(metasets[i6]);
          }
          this.notifyPlugins("afterDatasetsDraw");
        }
        _drawDataset(meta) {
          const ctx = this.ctx;
          const args = {
            meta,
            index: meta.index,
            cancelable: true
          };
          const clip = getDatasetClipArea(this, meta);
          if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
            return;
          }
          if (clip) {
            clipArea(ctx, clip);
          }
          meta.controller.draw();
          if (clip) {
            unclipArea(ctx);
          }
          args.cancelable = false;
          this.notifyPlugins("afterDatasetDraw", args);
        }
        isPointInArea(point) {
          return _isPointInArea(point, this.chartArea, this._minPadding);
        }
        getElementsAtEventForMode(e7, mode, options, useFinalPosition) {
          const method = Interaction.modes[mode];
          if (typeof method === "function") {
            return method(this, e7, options, useFinalPosition);
          }
          return [];
        }
        getDatasetMeta(datasetIndex) {
          const dataset = this.data.datasets[datasetIndex];
          const metasets = this._metasets;
          let meta = metasets.filter((x2) => x2 && x2._dataset === dataset).pop();
          if (!meta) {
            meta = {
              type: null,
              data: [],
              dataset: null,
              controller: null,
              hidden: null,
              xAxisID: null,
              yAxisID: null,
              order: dataset && dataset.order || 0,
              index: datasetIndex,
              _dataset: dataset,
              _parsed: [],
              _sorted: false
            };
            metasets.push(meta);
          }
          return meta;
        }
        getContext() {
          return this.$context || (this.$context = createContext(null, {
            chart: this,
            type: "chart"
          }));
        }
        getVisibleDatasetCount() {
          return this.getSortedVisibleDatasetMetas().length;
        }
        isDatasetVisible(datasetIndex) {
          const dataset = this.data.datasets[datasetIndex];
          if (!dataset) {
            return false;
          }
          const meta = this.getDatasetMeta(datasetIndex);
          return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
        }
        setDatasetVisibility(datasetIndex, visible) {
          const meta = this.getDatasetMeta(datasetIndex);
          meta.hidden = !visible;
        }
        toggleDataVisibility(index2) {
          this._hiddenIndices[index2] = !this._hiddenIndices[index2];
        }
        getDataVisibility(index2) {
          return !this._hiddenIndices[index2];
        }
        _updateVisibility(datasetIndex, dataIndex, visible) {
          const mode = visible ? "show" : "hide";
          const meta = this.getDatasetMeta(datasetIndex);
          const anims = meta.controller._resolveAnimations(void 0, mode);
          if (defined(dataIndex)) {
            meta.data[dataIndex].hidden = !visible;
            this.update();
          } else {
            this.setDatasetVisibility(datasetIndex, visible);
            anims.update(meta, {
              visible
            });
            this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
          }
        }
        hide(datasetIndex, dataIndex) {
          this._updateVisibility(datasetIndex, dataIndex, false);
        }
        show(datasetIndex, dataIndex) {
          this._updateVisibility(datasetIndex, dataIndex, true);
        }
        _destroyDatasetMeta(datasetIndex) {
          const meta = this._metasets[datasetIndex];
          if (meta && meta.controller) {
            meta.controller._destroy();
          }
          delete this._metasets[datasetIndex];
        }
        _stop() {
          let i6, ilen;
          this.stop();
          animator.remove(this);
          for (i6 = 0, ilen = this.data.datasets.length; i6 < ilen; ++i6) {
            this._destroyDatasetMeta(i6);
          }
        }
        destroy() {
          this.notifyPlugins("beforeDestroy");
          const { canvas, ctx } = this;
          this._stop();
          this.config.clearCache();
          if (canvas) {
            this.unbindEvents();
            clearCanvas(canvas, ctx);
            this.platform.releaseContext(ctx);
            this.canvas = null;
            this.ctx = null;
          }
          delete instances[this.id];
          this.notifyPlugins("afterDestroy");
        }
        toBase64Image(...args) {
          return this.canvas.toDataURL(...args);
        }
        bindEvents() {
          this.bindUserEvents();
          if (this.options.responsive) {
            this.bindResponsiveEvents();
          } else {
            this.attached = true;
          }
        }
        bindUserEvents() {
          const listeners = this._listeners;
          const platform = this.platform;
          const _add = (type, listener2) => {
            platform.addEventListener(this, type, listener2);
            listeners[type] = listener2;
          };
          const listener = (e7, x2, y3) => {
            e7.offsetX = x2;
            e7.offsetY = y3;
            this._eventHandler(e7);
          };
          each(this.options.events, (type) => _add(type, listener));
        }
        bindResponsiveEvents() {
          if (!this._responsiveListeners) {
            this._responsiveListeners = {};
          }
          const listeners = this._responsiveListeners;
          const platform = this.platform;
          const _add = (type, listener2) => {
            platform.addEventListener(this, type, listener2);
            listeners[type] = listener2;
          };
          const _remove = (type, listener2) => {
            if (listeners[type]) {
              platform.removeEventListener(this, type, listener2);
              delete listeners[type];
            }
          };
          const listener = (width, height) => {
            if (this.canvas) {
              this.resize(width, height);
            }
          };
          let detached;
          const attached = () => {
            _remove("attach", attached);
            this.attached = true;
            this.resize();
            _add("resize", listener);
            _add("detach", detached);
          };
          detached = () => {
            this.attached = false;
            _remove("resize", listener);
            this._stop();
            this._resize(0, 0);
            _add("attach", attached);
          };
          if (platform.isAttached(this.canvas)) {
            attached();
          } else {
            detached();
          }
        }
        unbindEvents() {
          each(this._listeners, (listener, type) => {
            this.platform.removeEventListener(this, type, listener);
          });
          this._listeners = {};
          each(this._responsiveListeners, (listener, type) => {
            this.platform.removeEventListener(this, type, listener);
          });
          this._responsiveListeners = void 0;
        }
        updateHoverStyle(items, mode, enabled) {
          const prefix = enabled ? "set" : "remove";
          let meta, item, i6, ilen;
          if (mode === "dataset") {
            meta = this.getDatasetMeta(items[0].datasetIndex);
            meta.controller["_" + prefix + "DatasetHoverStyle"]();
          }
          for (i6 = 0, ilen = items.length; i6 < ilen; ++i6) {
            item = items[i6];
            const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
            if (controller) {
              controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
            }
          }
        }
        getActiveElements() {
          return this._active || [];
        }
        setActiveElements(activeElements) {
          const lastActive = this._active || [];
          const active = activeElements.map(({ datasetIndex, index: index2 }) => {
            const meta = this.getDatasetMeta(datasetIndex);
            if (!meta) {
              throw new Error("No dataset found at index " + datasetIndex);
            }
            return {
              datasetIndex,
              element: meta.data[index2],
              index: index2
            };
          });
          const changed = !_elementsEqual(active, lastActive);
          if (changed) {
            this._active = active;
            this._lastEvent = null;
            this._updateHoverStyles(active, lastActive);
          }
        }
        notifyPlugins(hook, args, filter) {
          return this._plugins.notify(this, hook, args, filter);
        }
        isPluginEnabled(pluginId) {
          return this._plugins._cache.filter((p3) => p3.plugin.id === pluginId).length === 1;
        }
        _updateHoverStyles(active, lastActive, replay) {
          const hoverOptions = this.options.hover;
          const diff = (a3, b3) => a3.filter((x2) => !b3.some((y3) => x2.datasetIndex === y3.datasetIndex && x2.index === y3.index));
          const deactivated = diff(lastActive, active);
          const activated = replay ? active : diff(active, lastActive);
          if (deactivated.length) {
            this.updateHoverStyle(deactivated, hoverOptions.mode, false);
          }
          if (activated.length && hoverOptions.mode) {
            this.updateHoverStyle(activated, hoverOptions.mode, true);
          }
        }
        _eventHandler(e7, replay) {
          const args = {
            event: e7,
            replay,
            cancelable: true,
            inChartArea: this.isPointInArea(e7)
          };
          const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e7.native.type);
          if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
            return;
          }
          const changed = this._handleEvent(e7, replay, args.inChartArea);
          args.cancelable = false;
          this.notifyPlugins("afterEvent", args, eventFilter);
          if (changed || args.changed) {
            this.render();
          }
          return this;
        }
        _handleEvent(e7, replay, inChartArea) {
          const { _active: lastActive = [], options } = this;
          const useFinalPosition = replay;
          const active = this._getActiveElements(e7, lastActive, inChartArea, useFinalPosition);
          const isClick = _isClickEvent(e7);
          const lastEvent = determineLastEvent(e7, this._lastEvent, inChartArea, isClick);
          if (inChartArea) {
            this._lastEvent = null;
            callback(options.onHover, [
              e7,
              active,
              this
            ], this);
            if (isClick) {
              callback(options.onClick, [
                e7,
                active,
                this
              ], this);
            }
          }
          const changed = !_elementsEqual(active, lastActive);
          if (changed || replay) {
            this._active = active;
            this._updateHoverStyles(active, lastActive, replay);
          }
          this._lastEvent = lastEvent;
          return changed;
        }
        _getActiveElements(e7, lastActive, inChartArea, useFinalPosition) {
          if (e7.type === "mouseout") {
            return [];
          }
          if (!inChartArea) {
            return lastActive;
          }
          const hoverOptions = this.options.hover;
          return this.getElementsAtEventForMode(e7, hoverOptions.mode, hoverOptions, useFinalPosition);
        }
      };
      __publicField(Chart, "defaults", defaults);
      __publicField(Chart, "instances", instances);
      __publicField(Chart, "overrides", overrides);
      __publicField(Chart, "registry", registry);
      __publicField(Chart, "version", version);
      __publicField(Chart, "getChart", getChart);
      ArcElement = class extends Element {
        constructor(cfg) {
          super();
          __publicField(this, "circumference");
          __publicField(this, "endAngle");
          __publicField(this, "fullCircles");
          __publicField(this, "innerRadius");
          __publicField(this, "outerRadius");
          __publicField(this, "pixelMargin");
          __publicField(this, "startAngle");
          this.options = void 0;
          this.circumference = void 0;
          this.startAngle = void 0;
          this.endAngle = void 0;
          this.innerRadius = void 0;
          this.outerRadius = void 0;
          this.pixelMargin = 0;
          this.fullCircles = 0;
          if (cfg) {
            Object.assign(this, cfg);
          }
        }
        inRange(chartX, chartY, useFinalPosition) {
          const point = this.getProps([
            "x",
            "y"
          ], useFinalPosition);
          const { angle, distance } = getAngleFromPoint(point, {
            x: chartX,
            y: chartY
          });
          const { startAngle, endAngle, innerRadius, outerRadius, circumference } = this.getProps([
            "startAngle",
            "endAngle",
            "innerRadius",
            "outerRadius",
            "circumference"
          ], useFinalPosition);
          const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
          const _circumference = valueOrDefault(circumference, endAngle - startAngle);
          const nonZeroBetween = _angleBetween(angle, startAngle, endAngle) && startAngle !== endAngle;
          const betweenAngles = _circumference >= TAU || nonZeroBetween;
          const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
          return betweenAngles && withinRadius;
        }
        getCenterPoint(useFinalPosition) {
          const { x: x2, y: y3, startAngle, endAngle, innerRadius, outerRadius } = this.getProps([
            "x",
            "y",
            "startAngle",
            "endAngle",
            "innerRadius",
            "outerRadius"
          ], useFinalPosition);
          const { offset, spacing } = this.options;
          const halfAngle = (startAngle + endAngle) / 2;
          const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
          return {
            x: x2 + Math.cos(halfAngle) * halfRadius,
            y: y3 + Math.sin(halfAngle) * halfRadius
          };
        }
        tooltipPosition(useFinalPosition) {
          return this.getCenterPoint(useFinalPosition);
        }
        draw(ctx) {
          const { options, circumference } = this;
          const offset = (options.offset || 0) / 4;
          const spacing = (options.spacing || 0) / 2;
          const circular = options.circular;
          this.pixelMargin = options.borderAlign === "inner" ? 0.33 : 0;
          this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
          if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
            return;
          }
          ctx.save();
          const halfAngle = (this.startAngle + this.endAngle) / 2;
          ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
          const fix = 1 - Math.sin(Math.min(PI, circumference || 0));
          const radiusOffset = offset * fix;
          ctx.fillStyle = options.backgroundColor;
          ctx.strokeStyle = options.borderColor;
          drawArc(ctx, this, radiusOffset, spacing, circular);
          drawBorder(ctx, this, radiusOffset, spacing, circular);
          ctx.restore();
        }
      };
      __publicField(ArcElement, "id", "arc");
      __publicField(ArcElement, "defaults", {
        borderAlign: "center",
        borderColor: "#fff",
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: void 0,
        borderRadius: 0,
        borderWidth: 2,
        offset: 0,
        spacing: 0,
        angle: void 0,
        circular: true,
        selfJoin: false
      });
      __publicField(ArcElement, "defaultRoutes", {
        backgroundColor: "backgroundColor"
      });
      __publicField(ArcElement, "descriptors", {
        _scriptable: true,
        _indexable: (name) => name !== "borderDash"
      });
      usePath2D = typeof Path2D === "function";
      LineElement = class extends Element {
        constructor(cfg) {
          super();
          this.animated = true;
          this.options = void 0;
          this._chart = void 0;
          this._loop = void 0;
          this._fullLoop = void 0;
          this._path = void 0;
          this._points = void 0;
          this._segments = void 0;
          this._decimated = false;
          this._pointsUpdated = false;
          this._datasetIndex = void 0;
          if (cfg) {
            Object.assign(this, cfg);
          }
        }
        updateControlPoints(chartArea, indexAxis) {
          const options = this.options;
          if ((options.tension || options.cubicInterpolationMode === "monotone") && !options.stepped && !this._pointsUpdated) {
            const loop = options.spanGaps ? this._loop : this._fullLoop;
            _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis);
            this._pointsUpdated = true;
          }
        }
        set points(points) {
          this._points = points;
          delete this._segments;
          delete this._path;
          this._pointsUpdated = false;
        }
        get points() {
          return this._points;
        }
        get segments() {
          return this._segments || (this._segments = _computeSegments(this, this.options.segment));
        }
        first() {
          const segments = this.segments;
          const points = this.points;
          return segments.length && points[segments[0].start];
        }
        last() {
          const segments = this.segments;
          const points = this.points;
          const count = segments.length;
          return count && points[segments[count - 1].end];
        }
        interpolate(point, property) {
          const options = this.options;
          const value = point[property];
          const points = this.points;
          const segments = _boundSegments(this, {
            property,
            start: value,
            end: value
          });
          if (!segments.length) {
            return;
          }
          const result = [];
          const _interpolate = _getInterpolationMethod(options);
          let i6, ilen;
          for (i6 = 0, ilen = segments.length; i6 < ilen; ++i6) {
            const { start, end } = segments[i6];
            const p1 = points[start];
            const p22 = points[end];
            if (p1 === p22) {
              result.push(p1);
              continue;
            }
            const t4 = Math.abs((value - p1[property]) / (p22[property] - p1[property]));
            const interpolated = _interpolate(p1, p22, t4, options.stepped);
            interpolated[property] = point[property];
            result.push(interpolated);
          }
          return result.length === 1 ? result[0] : result;
        }
        pathSegment(ctx, segment, params) {
          const segmentMethod = _getSegmentMethod(this);
          return segmentMethod(ctx, this, segment, params);
        }
        path(ctx, start, count) {
          const segments = this.segments;
          const segmentMethod = _getSegmentMethod(this);
          let loop = this._loop;
          start = start || 0;
          count = count || this.points.length - start;
          for (const segment of segments) {
            loop &= segmentMethod(ctx, this, segment, {
              start,
              end: start + count - 1
            });
          }
          return !!loop;
        }
        draw(ctx, chartArea, start, count) {
          const options = this.options || {};
          const points = this.points || [];
          if (points.length && options.borderWidth) {
            ctx.save();
            draw(ctx, this, start, count);
            ctx.restore();
          }
          if (this.animated) {
            this._pointsUpdated = false;
            this._path = void 0;
          }
        }
      };
      __publicField(LineElement, "id", "line");
      __publicField(LineElement, "defaults", {
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0,
        borderJoinStyle: "miter",
        borderWidth: 3,
        capBezierPoints: true,
        cubicInterpolationMode: "default",
        fill: false,
        spanGaps: false,
        stepped: false,
        tension: 0
      });
      __publicField(LineElement, "defaultRoutes", {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
      });
      __publicField(LineElement, "descriptors", {
        _scriptable: true,
        _indexable: (name) => name !== "borderDash" && name !== "fill"
      });
      PointElement = class extends Element {
        constructor(cfg) {
          super();
          __publicField(this, "parsed");
          __publicField(this, "skip");
          __publicField(this, "stop");
          this.options = void 0;
          this.parsed = void 0;
          this.skip = void 0;
          this.stop = void 0;
          if (cfg) {
            Object.assign(this, cfg);
          }
        }
        inRange(mouseX, mouseY, useFinalPosition) {
          const options = this.options;
          const { x: x2, y: y3 } = this.getProps([
            "x",
            "y"
          ], useFinalPosition);
          return Math.pow(mouseX - x2, 2) + Math.pow(mouseY - y3, 2) < Math.pow(options.hitRadius + options.radius, 2);
        }
        inXRange(mouseX, useFinalPosition) {
          return inRange$1(this, mouseX, "x", useFinalPosition);
        }
        inYRange(mouseY, useFinalPosition) {
          return inRange$1(this, mouseY, "y", useFinalPosition);
        }
        getCenterPoint(useFinalPosition) {
          const { x: x2, y: y3 } = this.getProps([
            "x",
            "y"
          ], useFinalPosition);
          return {
            x: x2,
            y: y3
          };
        }
        size(options) {
          options = options || this.options || {};
          let radius = options.radius || 0;
          radius = Math.max(radius, radius && options.hoverRadius || 0);
          const borderWidth = radius && options.borderWidth || 0;
          return (radius + borderWidth) * 2;
        }
        draw(ctx, area) {
          const options = this.options;
          if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
            return;
          }
          ctx.strokeStyle = options.borderColor;
          ctx.lineWidth = options.borderWidth;
          ctx.fillStyle = options.backgroundColor;
          drawPoint(ctx, options, this.x, this.y);
        }
        getRange() {
          const options = this.options || {};
          return options.radius + options.hitRadius;
        }
      };
      __publicField(PointElement, "id", "point");
      /**
      * @type {any}
      */
      __publicField(PointElement, "defaults", {
        borderWidth: 1,
        hitRadius: 1,
        hoverBorderWidth: 1,
        hoverRadius: 4,
        pointStyle: "circle",
        radius: 3,
        rotation: 0
      });
      /**
      * @type {any}
      */
      __publicField(PointElement, "defaultRoutes", {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
      });
      BarElement = class extends Element {
        constructor(cfg) {
          super();
          this.options = void 0;
          this.horizontal = void 0;
          this.base = void 0;
          this.width = void 0;
          this.height = void 0;
          this.inflateAmount = void 0;
          if (cfg) {
            Object.assign(this, cfg);
          }
        }
        draw(ctx) {
          const { inflateAmount, options: { borderColor, backgroundColor } } = this;
          const { inner, outer } = boundingRects(this);
          const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
          ctx.save();
          if (outer.w !== inner.w || outer.h !== inner.h) {
            ctx.beginPath();
            addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
            ctx.clip();
            addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
            ctx.fillStyle = borderColor;
            ctx.fill("evenodd");
          }
          ctx.beginPath();
          addRectPath(ctx, inflateRect(inner, inflateAmount));
          ctx.fillStyle = backgroundColor;
          ctx.fill();
          ctx.restore();
        }
        inRange(mouseX, mouseY, useFinalPosition) {
          return inRange(this, mouseX, mouseY, useFinalPosition);
        }
        inXRange(mouseX, useFinalPosition) {
          return inRange(this, mouseX, null, useFinalPosition);
        }
        inYRange(mouseY, useFinalPosition) {
          return inRange(this, null, mouseY, useFinalPosition);
        }
        getCenterPoint(useFinalPosition) {
          const { x: x2, y: y3, base, horizontal } = this.getProps([
            "x",
            "y",
            "base",
            "horizontal"
          ], useFinalPosition);
          return {
            x: horizontal ? (x2 + base) / 2 : x2,
            y: horizontal ? y3 : (y3 + base) / 2
          };
        }
        getRange(axis) {
          return axis === "x" ? this.width / 2 : this.height / 2;
        }
      };
      __publicField(BarElement, "id", "bar");
      __publicField(BarElement, "defaults", {
        borderSkipped: "start",
        borderWidth: 0,
        borderRadius: 0,
        inflateAmount: "auto",
        pointStyle: void 0
      });
      __publicField(BarElement, "defaultRoutes", {
        backgroundColor: "backgroundColor",
        borderColor: "borderColor"
      });
      elements = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        ArcElement,
        BarElement,
        LineElement,
        PointElement
      });
      BORDER_COLORS = [
        "rgb(54, 162, 235)",
        "rgb(255, 99, 132)",
        "rgb(255, 159, 64)",
        "rgb(255, 205, 86)",
        "rgb(75, 192, 192)",
        "rgb(153, 102, 255)",
        "rgb(201, 203, 207)"
        // grey
      ];
      BACKGROUND_COLORS = /* @__PURE__ */ BORDER_COLORS.map((color2) => color2.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
      plugin_colors = {
        id: "colors",
        defaults: {
          enabled: true,
          forceOverride: false
        },
        beforeLayout(chart2, _args, options) {
          if (!options.enabled) {
            return;
          }
          const { data: { datasets }, options: chartOptions } = chart2.config;
          const { elements: elements2 } = chartOptions;
          const containsColorDefenition = containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements2 && containsColorsDefinitions(elements2) || containsDefaultColorsDefenitions();
          if (!options.forceOverride && containsColorDefenition) {
            return;
          }
          const colorizer = getColorizer(chart2);
          datasets.forEach(colorizer);
        }
      };
      plugin_decimation = {
        id: "decimation",
        defaults: {
          algorithm: "min-max",
          enabled: false
        },
        beforeElementsUpdate: (chart2, args, options) => {
          if (!options.enabled) {
            cleanDecimatedData(chart2);
            return;
          }
          const availableWidth = chart2.width;
          chart2.data.datasets.forEach((dataset, datasetIndex) => {
            const { _data, indexAxis } = dataset;
            const meta = chart2.getDatasetMeta(datasetIndex);
            const data = _data || dataset.data;
            if (resolve([
              indexAxis,
              chart2.options.indexAxis
            ]) === "y") {
              return;
            }
            if (!meta.controller.supportsDecimation) {
              return;
            }
            const xAxis = chart2.scales[meta.xAxisID];
            if (xAxis.type !== "linear" && xAxis.type !== "time") {
              return;
            }
            if (chart2.options.parsing) {
              return;
            }
            let { start, count } = getStartAndCountOfVisiblePointsSimplified(meta, data);
            const threshold = options.threshold || 4 * availableWidth;
            if (count <= threshold) {
              cleanDecimatedDataset(dataset);
              return;
            }
            if (isNullOrUndef(_data)) {
              dataset._data = data;
              delete dataset.data;
              Object.defineProperty(dataset, "data", {
                configurable: true,
                enumerable: true,
                get: function() {
                  return this._decimated;
                },
                set: function(d3) {
                  this._data = d3;
                }
              });
            }
            let decimated;
            switch (options.algorithm) {
              case "lttb":
                decimated = lttbDecimation(data, start, count, availableWidth, options);
                break;
              case "min-max":
                decimated = minMaxDecimation(data, start, count, availableWidth);
                break;
              default:
                throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
            }
            dataset._decimated = decimated;
          });
        },
        destroy(chart2) {
          cleanDecimatedData(chart2);
        }
      };
      simpleArc = class {
        constructor(opts) {
          this.x = opts.x;
          this.y = opts.y;
          this.radius = opts.radius;
        }
        pathSegment(ctx, bounds, opts) {
          const { x: x2, y: y3, radius } = this;
          bounds = bounds || {
            start: 0,
            end: TAU
          };
          ctx.arc(x2, y3, radius, bounds.end, bounds.start, true);
          return !opts.bounds;
        }
        interpolate(point) {
          const { x: x2, y: y3, radius } = this;
          const angle = point.angle;
          return {
            x: x2 + Math.cos(angle) * radius,
            y: y3 + Math.sin(angle) * radius,
            angle
          };
        }
      };
      index = {
        id: "filler",
        afterDatasetsUpdate(chart2, _args, options) {
          const count = (chart2.data.datasets || []).length;
          const sources = [];
          let meta, i6, line, source;
          for (i6 = 0; i6 < count; ++i6) {
            meta = chart2.getDatasetMeta(i6);
            line = meta.dataset;
            source = null;
            if (line && line.options && line instanceof LineElement) {
              source = {
                visible: chart2.isDatasetVisible(i6),
                index: i6,
                fill: _decodeFill(line, i6, count),
                chart: chart2,
                axis: meta.controller.options.indexAxis,
                scale: meta.vScale,
                line
              };
            }
            meta.$filler = source;
            sources.push(source);
          }
          for (i6 = 0; i6 < count; ++i6) {
            source = sources[i6];
            if (!source || source.fill === false) {
              continue;
            }
            source.fill = _resolveTarget(sources, i6, options.propagate);
          }
        },
        beforeDraw(chart2, _args, options) {
          const draw2 = options.drawTime === "beforeDraw";
          const metasets = chart2.getSortedVisibleDatasetMetas();
          const area = chart2.chartArea;
          for (let i6 = metasets.length - 1; i6 >= 0; --i6) {
            const source = metasets[i6].$filler;
            if (!source) {
              continue;
            }
            source.line.updateControlPoints(area, source.axis);
            if (draw2 && source.fill) {
              _drawfill(chart2.ctx, source, area);
            }
          }
        },
        beforeDatasetsDraw(chart2, _args, options) {
          if (options.drawTime !== "beforeDatasetsDraw") {
            return;
          }
          const metasets = chart2.getSortedVisibleDatasetMetas();
          for (let i6 = metasets.length - 1; i6 >= 0; --i6) {
            const source = metasets[i6].$filler;
            if (_shouldApplyFill(source)) {
              _drawfill(chart2.ctx, source, chart2.chartArea);
            }
          }
        },
        beforeDatasetDraw(chart2, args, options) {
          const source = args.meta.$filler;
          if (!_shouldApplyFill(source) || options.drawTime !== "beforeDatasetDraw") {
            return;
          }
          _drawfill(chart2.ctx, source, chart2.chartArea);
        },
        defaults: {
          propagate: true,
          drawTime: "beforeDatasetDraw"
        }
      };
      getBoxSize = (labelOpts, fontSize) => {
        let { boxHeight = fontSize, boxWidth = fontSize } = labelOpts;
        if (labelOpts.usePointStyle) {
          boxHeight = Math.min(boxHeight, fontSize);
          boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
        }
        return {
          boxWidth,
          boxHeight,
          itemHeight: Math.max(fontSize, boxHeight)
        };
      };
      itemsEqual = (a3, b3) => a3 !== null && b3 !== null && a3.datasetIndex === b3.datasetIndex && a3.index === b3.index;
      Legend = class extends Element {
        constructor(config) {
          super();
          this._added = false;
          this.legendHitBoxes = [];
          this._hoveredItem = null;
          this.doughnutMode = false;
          this.chart = config.chart;
          this.options = config.options;
          this.ctx = config.ctx;
          this.legendItems = void 0;
          this.columnSizes = void 0;
          this.lineWidths = void 0;
          this.maxHeight = void 0;
          this.maxWidth = void 0;
          this.top = void 0;
          this.bottom = void 0;
          this.left = void 0;
          this.right = void 0;
          this.height = void 0;
          this.width = void 0;
          this._margins = void 0;
          this.position = void 0;
          this.weight = void 0;
          this.fullSize = void 0;
        }
        update(maxWidth, maxHeight, margins) {
          this.maxWidth = maxWidth;
          this.maxHeight = maxHeight;
          this._margins = margins;
          this.setDimensions();
          this.buildLabels();
          this.fit();
        }
        setDimensions() {
          if (this.isHorizontal()) {
            this.width = this.maxWidth;
            this.left = this._margins.left;
            this.right = this.width;
          } else {
            this.height = this.maxHeight;
            this.top = this._margins.top;
            this.bottom = this.height;
          }
        }
        buildLabels() {
          const labelOpts = this.options.labels || {};
          let legendItems = callback(labelOpts.generateLabels, [
            this.chart
          ], this) || [];
          if (labelOpts.filter) {
            legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
          }
          if (labelOpts.sort) {
            legendItems = legendItems.sort((a3, b3) => labelOpts.sort(a3, b3, this.chart.data));
          }
          if (this.options.reverse) {
            legendItems.reverse();
          }
          this.legendItems = legendItems;
        }
        fit() {
          const { options, ctx } = this;
          if (!options.display) {
            this.width = this.height = 0;
            return;
          }
          const labelOpts = options.labels;
          const labelFont = toFont(labelOpts.font);
          const fontSize = labelFont.size;
          const titleHeight = this._computeTitleHeight();
          const { boxWidth, itemHeight } = getBoxSize(labelOpts, fontSize);
          let width, height;
          ctx.font = labelFont.string;
          if (this.isHorizontal()) {
            width = this.maxWidth;
            height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
          } else {
            height = this.maxHeight;
            width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
          }
          this.width = Math.min(width, options.maxWidth || this.maxWidth);
          this.height = Math.min(height, options.maxHeight || this.maxHeight);
        }
        _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
          const { ctx, maxWidth, options: { labels: { padding } } } = this;
          const hitboxes = this.legendHitBoxes = [];
          const lineWidths = this.lineWidths = [
            0
          ];
          const lineHeight = itemHeight + padding;
          let totalHeight = titleHeight;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          let row = -1;
          let top = -lineHeight;
          this.legendItems.forEach((legendItem, i6) => {
            const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
            if (i6 === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
              totalHeight += lineHeight;
              lineWidths[lineWidths.length - (i6 > 0 ? 0 : 1)] = 0;
              top += lineHeight;
              row++;
            }
            hitboxes[i6] = {
              left: 0,
              top,
              row,
              width: itemWidth,
              height: itemHeight
            };
            lineWidths[lineWidths.length - 1] += itemWidth + padding;
          });
          return totalHeight;
        }
        _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
          const { ctx, maxHeight, options: { labels: { padding } } } = this;
          const hitboxes = this.legendHitBoxes = [];
          const columnSizes = this.columnSizes = [];
          const heightLimit = maxHeight - titleHeight;
          let totalWidth = padding;
          let currentColWidth = 0;
          let currentColHeight = 0;
          let left = 0;
          let col = 0;
          this.legendItems.forEach((legendItem, i6) => {
            const { itemWidth, itemHeight } = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight);
            if (i6 > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
              totalWidth += currentColWidth + padding;
              columnSizes.push({
                width: currentColWidth,
                height: currentColHeight
              });
              left += currentColWidth + padding;
              col++;
              currentColWidth = currentColHeight = 0;
            }
            hitboxes[i6] = {
              left,
              top: currentColHeight,
              col,
              width: itemWidth,
              height: itemHeight
            };
            currentColWidth = Math.max(currentColWidth, itemWidth);
            currentColHeight += itemHeight + padding;
          });
          totalWidth += currentColWidth;
          columnSizes.push({
            width: currentColWidth,
            height: currentColHeight
          });
          return totalWidth;
        }
        adjustHitBoxes() {
          if (!this.options.display) {
            return;
          }
          const titleHeight = this._computeTitleHeight();
          const { legendHitBoxes: hitboxes, options: { align, labels: { padding }, rtl } } = this;
          const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
          if (this.isHorizontal()) {
            let row = 0;
            let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
            for (const hitbox of hitboxes) {
              if (row !== hitbox.row) {
                row = hitbox.row;
                left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
              }
              hitbox.top += this.top + titleHeight + padding;
              hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
              left += hitbox.width + padding;
            }
          } else {
            let col = 0;
            let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
            for (const hitbox of hitboxes) {
              if (hitbox.col !== col) {
                col = hitbox.col;
                top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
              }
              hitbox.top = top;
              hitbox.left += this.left + padding;
              hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
              top += hitbox.height + padding;
            }
          }
        }
        isHorizontal() {
          return this.options.position === "top" || this.options.position === "bottom";
        }
        draw() {
          if (this.options.display) {
            const ctx = this.ctx;
            clipArea(ctx, this);
            this._draw();
            unclipArea(ctx);
          }
        }
        _draw() {
          const { options: opts, columnSizes, lineWidths, ctx } = this;
          const { align, labels: labelOpts } = opts;
          const defaultColor = defaults.color;
          const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
          const labelFont = toFont(labelOpts.font);
          const { padding } = labelOpts;
          const fontSize = labelFont.size;
          const halfFontSize = fontSize / 2;
          let cursor;
          this.drawTitle();
          ctx.textAlign = rtlHelper.textAlign("left");
          ctx.textBaseline = "middle";
          ctx.lineWidth = 0.5;
          ctx.font = labelFont.string;
          const { boxWidth, boxHeight, itemHeight } = getBoxSize(labelOpts, fontSize);
          const drawLegendBox = function(x2, y3, legendItem) {
            if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
              return;
            }
            ctx.save();
            const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
            ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
            ctx.lineCap = valueOrDefault(legendItem.lineCap, "butt");
            ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
            ctx.lineJoin = valueOrDefault(legendItem.lineJoin, "miter");
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
            ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
            if (labelOpts.usePointStyle) {
              const drawOptions = {
                radius: boxHeight * Math.SQRT2 / 2,
                pointStyle: legendItem.pointStyle,
                rotation: legendItem.rotation,
                borderWidth: lineWidth
              };
              const centerX = rtlHelper.xPlus(x2, boxWidth / 2);
              const centerY = y3 + halfFontSize;
              drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
            } else {
              const yBoxTop = y3 + Math.max((fontSize - boxHeight) / 2, 0);
              const xBoxLeft = rtlHelper.leftForLtr(x2, boxWidth);
              const borderRadius = toTRBLCorners(legendItem.borderRadius);
              ctx.beginPath();
              if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
                addRoundedRectPath(ctx, {
                  x: xBoxLeft,
                  y: yBoxTop,
                  w: boxWidth,
                  h: boxHeight,
                  radius: borderRadius
                });
              } else {
                ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
              }
              ctx.fill();
              if (lineWidth !== 0) {
                ctx.stroke();
              }
            }
            ctx.restore();
          };
          const fillText = function(x2, y3, legendItem) {
            renderText(ctx, legendItem.text, x2, y3 + itemHeight / 2, labelFont, {
              strikethrough: legendItem.hidden,
              textAlign: rtlHelper.textAlign(legendItem.textAlign)
            });
          };
          const isHorizontal = this.isHorizontal();
          const titleHeight = this._computeTitleHeight();
          if (isHorizontal) {
            cursor = {
              x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
              y: this.top + padding + titleHeight,
              line: 0
            };
          } else {
            cursor = {
              x: this.left + padding,
              y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
              line: 0
            };
          }
          overrideTextDirection(this.ctx, opts.textDirection);
          const lineHeight = itemHeight + padding;
          this.legendItems.forEach((legendItem, i6) => {
            ctx.strokeStyle = legendItem.fontColor;
            ctx.fillStyle = legendItem.fontColor;
            const textWidth = ctx.measureText(legendItem.text).width;
            const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
            const width = boxWidth + halfFontSize + textWidth;
            let x2 = cursor.x;
            let y3 = cursor.y;
            rtlHelper.setWidth(this.width);
            if (isHorizontal) {
              if (i6 > 0 && x2 + width + padding > this.right) {
                y3 = cursor.y += lineHeight;
                cursor.line++;
                x2 = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
              }
            } else if (i6 > 0 && y3 + lineHeight > this.bottom) {
              x2 = cursor.x = x2 + columnSizes[cursor.line].width + padding;
              cursor.line++;
              y3 = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
            }
            const realX = rtlHelper.x(x2);
            drawLegendBox(realX, y3, legendItem);
            x2 = _textX(textAlign, x2 + boxWidth + halfFontSize, isHorizontal ? x2 + width : this.right, opts.rtl);
            fillText(rtlHelper.x(x2), y3, legendItem);
            if (isHorizontal) {
              cursor.x += width + padding;
            } else if (typeof legendItem.text !== "string") {
              const fontLineHeight = labelFont.lineHeight;
              cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
            } else {
              cursor.y += lineHeight;
            }
          });
          restoreTextDirection(this.ctx, opts.textDirection);
        }
        drawTitle() {
          const opts = this.options;
          const titleOpts = opts.title;
          const titleFont = toFont(titleOpts.font);
          const titlePadding = toPadding(titleOpts.padding);
          if (!titleOpts.display) {
            return;
          }
          const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
          const ctx = this.ctx;
          const position = titleOpts.position;
          const halfFontSize = titleFont.size / 2;
          const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
          let y3;
          let left = this.left;
          let maxWidth = this.width;
          if (this.isHorizontal()) {
            maxWidth = Math.max(...this.lineWidths);
            y3 = this.top + topPaddingPlusHalfFontSize;
            left = _alignStartEnd(opts.align, left, this.right - maxWidth);
          } else {
            const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
            y3 = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
          }
          const x2 = _alignStartEnd(position, left, left + maxWidth);
          ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
          ctx.textBaseline = "middle";
          ctx.strokeStyle = titleOpts.color;
          ctx.fillStyle = titleOpts.color;
          ctx.font = titleFont.string;
          renderText(ctx, titleOpts.text, x2, y3, titleFont);
        }
        _computeTitleHeight() {
          const titleOpts = this.options.title;
          const titleFont = toFont(titleOpts.font);
          const titlePadding = toPadding(titleOpts.padding);
          return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
        }
        _getLegendItemAt(x2, y3) {
          let i6, hitBox, lh;
          if (_isBetween(x2, this.left, this.right) && _isBetween(y3, this.top, this.bottom)) {
            lh = this.legendHitBoxes;
            for (i6 = 0; i6 < lh.length; ++i6) {
              hitBox = lh[i6];
              if (_isBetween(x2, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y3, hitBox.top, hitBox.top + hitBox.height)) {
                return this.legendItems[i6];
              }
            }
          }
          return null;
        }
        handleEvent(e7) {
          const opts = this.options;
          if (!isListened(e7.type, opts)) {
            return;
          }
          const hoveredItem = this._getLegendItemAt(e7.x, e7.y);
          if (e7.type === "mousemove" || e7.type === "mouseout") {
            const previous = this._hoveredItem;
            const sameItem = itemsEqual(previous, hoveredItem);
            if (previous && !sameItem) {
              callback(opts.onLeave, [
                e7,
                previous,
                this
              ], this);
            }
            this._hoveredItem = hoveredItem;
            if (hoveredItem && !sameItem) {
              callback(opts.onHover, [
                e7,
                hoveredItem,
                this
              ], this);
            }
          } else if (hoveredItem) {
            callback(opts.onClick, [
              e7,
              hoveredItem,
              this
            ], this);
          }
        }
      };
      plugin_legend = {
        id: "legend",
        _element: Legend,
        start(chart2, _args, options) {
          const legend = chart2.legend = new Legend({
            ctx: chart2.ctx,
            options,
            chart: chart2
          });
          layouts.configure(chart2, legend, options);
          layouts.addBox(chart2, legend);
        },
        stop(chart2) {
          layouts.removeBox(chart2, chart2.legend);
          delete chart2.legend;
        },
        beforeUpdate(chart2, _args, options) {
          const legend = chart2.legend;
          layouts.configure(chart2, legend, options);
          legend.options = options;
        },
        afterUpdate(chart2) {
          const legend = chart2.legend;
          legend.buildLabels();
          legend.adjustHitBoxes();
        },
        afterEvent(chart2, args) {
          if (!args.replay) {
            chart2.legend.handleEvent(args.event);
          }
        },
        defaults: {
          display: true,
          position: "top",
          align: "center",
          fullSize: true,
          reverse: false,
          weight: 1e3,
          onClick(e7, legendItem, legend) {
            const index2 = legendItem.datasetIndex;
            const ci = legend.chart;
            if (ci.isDatasetVisible(index2)) {
              ci.hide(index2);
              legendItem.hidden = true;
            } else {
              ci.show(index2);
              legendItem.hidden = false;
            }
          },
          onHover: null,
          onLeave: null,
          labels: {
            color: (ctx) => ctx.chart.options.color,
            boxWidth: 40,
            padding: 10,
            generateLabels(chart2) {
              const datasets = chart2.data.datasets;
              const { labels: { usePointStyle, pointStyle, textAlign, color: color2, useBorderRadius, borderRadius } } = chart2.legend.options;
              return chart2._getSortedDatasetMetas().map((meta) => {
                const style = meta.controller.getStyle(usePointStyle ? 0 : void 0);
                const borderWidth = toPadding(style.borderWidth);
                return {
                  text: datasets[meta.index].label,
                  fillStyle: style.backgroundColor,
                  fontColor: color2,
                  hidden: !meta.visible,
                  lineCap: style.borderCapStyle,
                  lineDash: style.borderDash,
                  lineDashOffset: style.borderDashOffset,
                  lineJoin: style.borderJoinStyle,
                  lineWidth: (borderWidth.width + borderWidth.height) / 4,
                  strokeStyle: style.borderColor,
                  pointStyle: pointStyle || style.pointStyle,
                  rotation: style.rotation,
                  textAlign: textAlign || style.textAlign,
                  borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
                  datasetIndex: meta.index
                };
              }, this);
            }
          },
          title: {
            color: (ctx) => ctx.chart.options.color,
            display: false,
            position: "center",
            text: ""
          }
        },
        descriptors: {
          _scriptable: (name) => !name.startsWith("on"),
          labels: {
            _scriptable: (name) => ![
              "generateLabels",
              "filter",
              "sort"
            ].includes(name)
          }
        }
      };
      Title = class extends Element {
        constructor(config) {
          super();
          this.chart = config.chart;
          this.options = config.options;
          this.ctx = config.ctx;
          this._padding = void 0;
          this.top = void 0;
          this.bottom = void 0;
          this.left = void 0;
          this.right = void 0;
          this.width = void 0;
          this.height = void 0;
          this.position = void 0;
          this.weight = void 0;
          this.fullSize = void 0;
        }
        update(maxWidth, maxHeight) {
          const opts = this.options;
          this.left = 0;
          this.top = 0;
          if (!opts.display) {
            this.width = this.height = this.right = this.bottom = 0;
            return;
          }
          this.width = this.right = maxWidth;
          this.height = this.bottom = maxHeight;
          const lineCount = isArray(opts.text) ? opts.text.length : 1;
          this._padding = toPadding(opts.padding);
          const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
          if (this.isHorizontal()) {
            this.height = textSize;
          } else {
            this.width = textSize;
          }
        }
        isHorizontal() {
          const pos = this.options.position;
          return pos === "top" || pos === "bottom";
        }
        _drawArgs(offset) {
          const { top, left, bottom, right, options } = this;
          const align = options.align;
          let rotation = 0;
          let maxWidth, titleX, titleY;
          if (this.isHorizontal()) {
            titleX = _alignStartEnd(align, left, right);
            titleY = top + offset;
            maxWidth = right - left;
          } else {
            if (options.position === "left") {
              titleX = left + offset;
              titleY = _alignStartEnd(align, bottom, top);
              rotation = PI * -0.5;
            } else {
              titleX = right - offset;
              titleY = _alignStartEnd(align, top, bottom);
              rotation = PI * 0.5;
            }
            maxWidth = bottom - top;
          }
          return {
            titleX,
            titleY,
            maxWidth,
            rotation
          };
        }
        draw() {
          const ctx = this.ctx;
          const opts = this.options;
          if (!opts.display) {
            return;
          }
          const fontOpts = toFont(opts.font);
          const lineHeight = fontOpts.lineHeight;
          const offset = lineHeight / 2 + this._padding.top;
          const { titleX, titleY, maxWidth, rotation } = this._drawArgs(offset);
          renderText(ctx, opts.text, 0, 0, fontOpts, {
            color: opts.color,
            maxWidth,
            rotation,
            textAlign: _toLeftRightCenter(opts.align),
            textBaseline: "middle",
            translation: [
              titleX,
              titleY
            ]
          });
        }
      };
      plugin_title = {
        id: "title",
        _element: Title,
        start(chart2, _args, options) {
          createTitle(chart2, options);
        },
        stop(chart2) {
          const titleBlock = chart2.titleBlock;
          layouts.removeBox(chart2, titleBlock);
          delete chart2.titleBlock;
        },
        beforeUpdate(chart2, _args, options) {
          const title = chart2.titleBlock;
          layouts.configure(chart2, title, options);
          title.options = options;
        },
        defaults: {
          align: "center",
          display: false,
          font: {
            weight: "bold"
          },
          fullSize: true,
          padding: 10,
          position: "top",
          text: "",
          weight: 2e3
        },
        defaultRoutes: {
          color: "color"
        },
        descriptors: {
          _scriptable: true,
          _indexable: false
        }
      };
      map2 = /* @__PURE__ */ new WeakMap();
      plugin_subtitle = {
        id: "subtitle",
        start(chart2, _args, options) {
          const title = new Title({
            ctx: chart2.ctx,
            options,
            chart: chart2
          });
          layouts.configure(chart2, title, options);
          layouts.addBox(chart2, title);
          map2.set(chart2, title);
        },
        stop(chart2) {
          layouts.removeBox(chart2, map2.get(chart2));
          map2.delete(chart2);
        },
        beforeUpdate(chart2, _args, options) {
          const title = map2.get(chart2);
          layouts.configure(chart2, title, options);
          title.options = options;
        },
        defaults: {
          align: "center",
          display: false,
          font: {
            weight: "normal"
          },
          fullSize: true,
          padding: 0,
          position: "top",
          text: "",
          weight: 1500
        },
        defaultRoutes: {
          color: "color"
        },
        descriptors: {
          _scriptable: true,
          _indexable: false
        }
      };
      positioners = {
        average(items) {
          if (!items.length) {
            return false;
          }
          let i6, len;
          let xSet = /* @__PURE__ */ new Set();
          let y3 = 0;
          let count = 0;
          for (i6 = 0, len = items.length; i6 < len; ++i6) {
            const el2 = items[i6].element;
            if (el2 && el2.hasValue()) {
              const pos = el2.tooltipPosition();
              xSet.add(pos.x);
              y3 += pos.y;
              ++count;
            }
          }
          if (count === 0 || xSet.size === 0) {
            return false;
          }
          const xAverage = [
            ...xSet
          ].reduce((a3, b3) => a3 + b3) / xSet.size;
          return {
            x: xAverage,
            y: y3 / count
          };
        },
        nearest(items, eventPosition) {
          if (!items.length) {
            return false;
          }
          let x2 = eventPosition.x;
          let y3 = eventPosition.y;
          let minDistance = Number.POSITIVE_INFINITY;
          let i6, len, nearestElement;
          for (i6 = 0, len = items.length; i6 < len; ++i6) {
            const el2 = items[i6].element;
            if (el2 && el2.hasValue()) {
              const center = el2.getCenterPoint();
              const d3 = distanceBetweenPoints(eventPosition, center);
              if (d3 < minDistance) {
                minDistance = d3;
                nearestElement = el2;
              }
            }
          }
          if (nearestElement) {
            const tp = nearestElement.tooltipPosition();
            x2 = tp.x;
            y3 = tp.y;
          }
          return {
            x: x2,
            y: y3
          };
        }
      };
      defaultCallbacks = {
        beforeTitle: noop,
        title(tooltipItems) {
          if (tooltipItems.length > 0) {
            const item = tooltipItems[0];
            const labels = item.chart.data.labels;
            const labelCount = labels ? labels.length : 0;
            if (this && this.options && this.options.mode === "dataset") {
              return item.dataset.label || "";
            } else if (item.label) {
              return item.label;
            } else if (labelCount > 0 && item.dataIndex < labelCount) {
              return labels[item.dataIndex];
            }
          }
          return "";
        },
        afterTitle: noop,
        beforeBody: noop,
        beforeLabel: noop,
        label(tooltipItem) {
          if (this && this.options && this.options.mode === "dataset") {
            return tooltipItem.label + ": " + tooltipItem.formattedValue || tooltipItem.formattedValue;
          }
          let label = tooltipItem.dataset.label || "";
          if (label) {
            label += ": ";
          }
          const value = tooltipItem.formattedValue;
          if (!isNullOrUndef(value)) {
            label += value;
          }
          return label;
        },
        labelColor(tooltipItem) {
          const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
          const options = meta.controller.getStyle(tooltipItem.dataIndex);
          return {
            borderColor: options.borderColor,
            backgroundColor: options.backgroundColor,
            borderWidth: options.borderWidth,
            borderDash: options.borderDash,
            borderDashOffset: options.borderDashOffset,
            borderRadius: 0
          };
        },
        labelTextColor() {
          return this.options.bodyColor;
        },
        labelPointStyle(tooltipItem) {
          const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
          const options = meta.controller.getStyle(tooltipItem.dataIndex);
          return {
            pointStyle: options.pointStyle,
            rotation: options.rotation
          };
        },
        afterLabel: noop,
        afterBody: noop,
        beforeFooter: noop,
        footer: noop,
        afterFooter: noop
      };
      Tooltip = class extends Element {
        constructor(config) {
          super();
          this.opacity = 0;
          this._active = [];
          this._eventPosition = void 0;
          this._size = void 0;
          this._cachedAnimations = void 0;
          this._tooltipItems = [];
          this.$animations = void 0;
          this.$context = void 0;
          this.chart = config.chart;
          this.options = config.options;
          this.dataPoints = void 0;
          this.title = void 0;
          this.beforeBody = void 0;
          this.body = void 0;
          this.afterBody = void 0;
          this.footer = void 0;
          this.xAlign = void 0;
          this.yAlign = void 0;
          this.x = void 0;
          this.y = void 0;
          this.height = void 0;
          this.width = void 0;
          this.caretX = void 0;
          this.caretY = void 0;
          this.labelColors = void 0;
          this.labelPointStyles = void 0;
          this.labelTextColors = void 0;
        }
        initialize(options) {
          this.options = options;
          this._cachedAnimations = void 0;
          this.$context = void 0;
        }
        _resolveAnimations() {
          const cached = this._cachedAnimations;
          if (cached) {
            return cached;
          }
          const chart2 = this.chart;
          const options = this.options.setContext(this.getContext());
          const opts = options.enabled && chart2.options.animation && options.animations;
          const animations = new Animations(this.chart, opts);
          if (opts._cacheable) {
            this._cachedAnimations = Object.freeze(animations);
          }
          return animations;
        }
        getContext() {
          return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
        }
        getTitle(context, options) {
          const { callbacks } = options;
          const beforeTitle = invokeCallbackWithFallback(callbacks, "beforeTitle", this, context);
          const title = invokeCallbackWithFallback(callbacks, "title", this, context);
          const afterTitle = invokeCallbackWithFallback(callbacks, "afterTitle", this, context);
          let lines = [];
          lines = pushOrConcat(lines, splitNewlines(beforeTitle));
          lines = pushOrConcat(lines, splitNewlines(title));
          lines = pushOrConcat(lines, splitNewlines(afterTitle));
          return lines;
        }
        getBeforeBody(tooltipItems, options) {
          return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, "beforeBody", this, tooltipItems));
        }
        getBody(tooltipItems, options) {
          const { callbacks } = options;
          const bodyItems = [];
          each(tooltipItems, (context) => {
            const bodyItem = {
              before: [],
              lines: [],
              after: []
            };
            const scoped = overrideCallbacks(callbacks, context);
            pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, "beforeLabel", this, context)));
            pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, "label", this, context));
            pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, "afterLabel", this, context)));
            bodyItems.push(bodyItem);
          });
          return bodyItems;
        }
        getAfterBody(tooltipItems, options) {
          return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, "afterBody", this, tooltipItems));
        }
        getFooter(tooltipItems, options) {
          const { callbacks } = options;
          const beforeFooter = invokeCallbackWithFallback(callbacks, "beforeFooter", this, tooltipItems);
          const footer = invokeCallbackWithFallback(callbacks, "footer", this, tooltipItems);
          const afterFooter = invokeCallbackWithFallback(callbacks, "afterFooter", this, tooltipItems);
          let lines = [];
          lines = pushOrConcat(lines, splitNewlines(beforeFooter));
          lines = pushOrConcat(lines, splitNewlines(footer));
          lines = pushOrConcat(lines, splitNewlines(afterFooter));
          return lines;
        }
        _createItems(options) {
          const active = this._active;
          const data = this.chart.data;
          const labelColors = [];
          const labelPointStyles = [];
          const labelTextColors = [];
          let tooltipItems = [];
          let i6, len;
          for (i6 = 0, len = active.length; i6 < len; ++i6) {
            tooltipItems.push(createTooltipItem(this.chart, active[i6]));
          }
          if (options.filter) {
            tooltipItems = tooltipItems.filter((element, index2, array) => options.filter(element, index2, array, data));
          }
          if (options.itemSort) {
            tooltipItems = tooltipItems.sort((a3, b3) => options.itemSort(a3, b3, data));
          }
          each(tooltipItems, (context) => {
            const scoped = overrideCallbacks(options.callbacks, context);
            labelColors.push(invokeCallbackWithFallback(scoped, "labelColor", this, context));
            labelPointStyles.push(invokeCallbackWithFallback(scoped, "labelPointStyle", this, context));
            labelTextColors.push(invokeCallbackWithFallback(scoped, "labelTextColor", this, context));
          });
          this.labelColors = labelColors;
          this.labelPointStyles = labelPointStyles;
          this.labelTextColors = labelTextColors;
          this.dataPoints = tooltipItems;
          return tooltipItems;
        }
        update(changed, replay) {
          const options = this.options.setContext(this.getContext());
          const active = this._active;
          let properties;
          let tooltipItems = [];
          if (!active.length) {
            if (this.opacity !== 0) {
              properties = {
                opacity: 0
              };
            }
          } else {
            const position = positioners[options.position].call(this, active, this._eventPosition);
            tooltipItems = this._createItems(options);
            this.title = this.getTitle(tooltipItems, options);
            this.beforeBody = this.getBeforeBody(tooltipItems, options);
            this.body = this.getBody(tooltipItems, options);
            this.afterBody = this.getAfterBody(tooltipItems, options);
            this.footer = this.getFooter(tooltipItems, options);
            const size = this._size = getTooltipSize(this, options);
            const positionAndSize = Object.assign({}, position, size);
            const alignment = determineAlignment(this.chart, options, positionAndSize);
            const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
            this.xAlign = alignment.xAlign;
            this.yAlign = alignment.yAlign;
            properties = {
              opacity: 1,
              x: backgroundPoint.x,
              y: backgroundPoint.y,
              width: size.width,
              height: size.height,
              caretX: position.x,
              caretY: position.y
            };
          }
          this._tooltipItems = tooltipItems;
          this.$context = void 0;
          if (properties) {
            this._resolveAnimations().update(this, properties);
          }
          if (changed && options.external) {
            options.external.call(this, {
              chart: this.chart,
              tooltip: this,
              replay
            });
          }
        }
        drawCaret(tooltipPoint, ctx, size, options) {
          const caretPosition = this.getCaretPosition(tooltipPoint, size, options);
          ctx.lineTo(caretPosition.x1, caretPosition.y1);
          ctx.lineTo(caretPosition.x2, caretPosition.y2);
          ctx.lineTo(caretPosition.x3, caretPosition.y3);
        }
        getCaretPosition(tooltipPoint, size, options) {
          const { xAlign, yAlign } = this;
          const { caretSize, cornerRadius } = options;
          const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
          const { x: ptX, y: ptY } = tooltipPoint;
          const { width, height } = size;
          let x1, x2, x3, y1, y22, y3;
          if (yAlign === "center") {
            y22 = ptY + height / 2;
            if (xAlign === "left") {
              x1 = ptX;
              x2 = x1 - caretSize;
              y1 = y22 + caretSize;
              y3 = y22 - caretSize;
            } else {
              x1 = ptX + width;
              x2 = x1 + caretSize;
              y1 = y22 - caretSize;
              y3 = y22 + caretSize;
            }
            x3 = x1;
          } else {
            if (xAlign === "left") {
              x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
            } else if (xAlign === "right") {
              x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
            } else {
              x2 = this.caretX;
            }
            if (yAlign === "top") {
              y1 = ptY;
              y22 = y1 - caretSize;
              x1 = x2 - caretSize;
              x3 = x2 + caretSize;
            } else {
              y1 = ptY + height;
              y22 = y1 + caretSize;
              x1 = x2 + caretSize;
              x3 = x2 - caretSize;
            }
            y3 = y1;
          }
          return {
            x1,
            x2,
            x3,
            y1,
            y2: y22,
            y3
          };
        }
        drawTitle(pt, ctx, options) {
          const title = this.title;
          const length = title.length;
          let titleFont, titleSpacing, i6;
          if (length) {
            const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
            pt.x = getAlignedX(this, options.titleAlign, options);
            ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
            ctx.textBaseline = "middle";
            titleFont = toFont(options.titleFont);
            titleSpacing = options.titleSpacing;
            ctx.fillStyle = options.titleColor;
            ctx.font = titleFont.string;
            for (i6 = 0; i6 < length; ++i6) {
              ctx.fillText(title[i6], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
              pt.y += titleFont.lineHeight + titleSpacing;
              if (i6 + 1 === length) {
                pt.y += options.titleMarginBottom - titleSpacing;
              }
            }
          }
        }
        _drawColorBox(ctx, pt, i6, rtlHelper, options) {
          const labelColor = this.labelColors[i6];
          const labelPointStyle = this.labelPointStyles[i6];
          const { boxHeight, boxWidth } = options;
          const bodyFont = toFont(options.bodyFont);
          const colorX = getAlignedX(this, "left", options);
          const rtlColorX = rtlHelper.x(colorX);
          const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
          const colorY = pt.y + yOffSet;
          if (options.usePointStyle) {
            const drawOptions = {
              radius: Math.min(boxWidth, boxHeight) / 2,
              pointStyle: labelPointStyle.pointStyle,
              rotation: labelPointStyle.rotation,
              borderWidth: 1
            };
            const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
            const centerY = colorY + boxHeight / 2;
            ctx.strokeStyle = options.multiKeyBackground;
            ctx.fillStyle = options.multiKeyBackground;
            drawPoint(ctx, drawOptions, centerX, centerY);
            ctx.strokeStyle = labelColor.borderColor;
            ctx.fillStyle = labelColor.backgroundColor;
            drawPoint(ctx, drawOptions, centerX, centerY);
          } else {
            ctx.lineWidth = isObject(labelColor.borderWidth) ? Math.max(...Object.values(labelColor.borderWidth)) : labelColor.borderWidth || 1;
            ctx.strokeStyle = labelColor.borderColor;
            ctx.setLineDash(labelColor.borderDash || []);
            ctx.lineDashOffset = labelColor.borderDashOffset || 0;
            const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
            const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
            const borderRadius = toTRBLCorners(labelColor.borderRadius);
            if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
              ctx.beginPath();
              ctx.fillStyle = options.multiKeyBackground;
              addRoundedRectPath(ctx, {
                x: outerX,
                y: colorY,
                w: boxWidth,
                h: boxHeight,
                radius: borderRadius
              });
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = labelColor.backgroundColor;
              ctx.beginPath();
              addRoundedRectPath(ctx, {
                x: innerX,
                y: colorY + 1,
                w: boxWidth - 2,
                h: boxHeight - 2,
                radius: borderRadius
              });
              ctx.fill();
            } else {
              ctx.fillStyle = options.multiKeyBackground;
              ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
              ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
              ctx.fillStyle = labelColor.backgroundColor;
              ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
            }
          }
          ctx.fillStyle = this.labelTextColors[i6];
        }
        drawBody(pt, ctx, options) {
          const { body } = this;
          const { bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding } = options;
          const bodyFont = toFont(options.bodyFont);
          let bodyLineHeight = bodyFont.lineHeight;
          let xLinePadding = 0;
          const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
          const fillLineOfText = function(line) {
            ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
            pt.y += bodyLineHeight + bodySpacing;
          };
          const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
          let bodyItem, textColor, lines, i6, j, ilen, jlen;
          ctx.textAlign = bodyAlign;
          ctx.textBaseline = "middle";
          ctx.font = bodyFont.string;
          pt.x = getAlignedX(this, bodyAlignForCalculation, options);
          ctx.fillStyle = options.bodyColor;
          each(this.beforeBody, fillLineOfText);
          xLinePadding = displayColors && bodyAlignForCalculation !== "right" ? bodyAlign === "center" ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
          for (i6 = 0, ilen = body.length; i6 < ilen; ++i6) {
            bodyItem = body[i6];
            textColor = this.labelTextColors[i6];
            ctx.fillStyle = textColor;
            each(bodyItem.before, fillLineOfText);
            lines = bodyItem.lines;
            if (displayColors && lines.length) {
              this._drawColorBox(ctx, pt, i6, rtlHelper, options);
              bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
            }
            for (j = 0, jlen = lines.length; j < jlen; ++j) {
              fillLineOfText(lines[j]);
              bodyLineHeight = bodyFont.lineHeight;
            }
            each(bodyItem.after, fillLineOfText);
          }
          xLinePadding = 0;
          bodyLineHeight = bodyFont.lineHeight;
          each(this.afterBody, fillLineOfText);
          pt.y -= bodySpacing;
        }
        drawFooter(pt, ctx, options) {
          const footer = this.footer;
          const length = footer.length;
          let footerFont, i6;
          if (length) {
            const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
            pt.x = getAlignedX(this, options.footerAlign, options);
            pt.y += options.footerMarginTop;
            ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
            ctx.textBaseline = "middle";
            footerFont = toFont(options.footerFont);
            ctx.fillStyle = options.footerColor;
            ctx.font = footerFont.string;
            for (i6 = 0; i6 < length; ++i6) {
              ctx.fillText(footer[i6], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
              pt.y += footerFont.lineHeight + options.footerSpacing;
            }
          }
        }
        drawBackground(pt, ctx, tooltipSize, options) {
          const { xAlign, yAlign } = this;
          const { x: x2, y: y3 } = pt;
          const { width, height } = tooltipSize;
          const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(options.cornerRadius);
          ctx.fillStyle = options.backgroundColor;
          ctx.strokeStyle = options.borderColor;
          ctx.lineWidth = options.borderWidth;
          ctx.beginPath();
          ctx.moveTo(x2 + topLeft, y3);
          if (yAlign === "top") {
            this.drawCaret(pt, ctx, tooltipSize, options);
          }
          ctx.lineTo(x2 + width - topRight, y3);
          ctx.quadraticCurveTo(x2 + width, y3, x2 + width, y3 + topRight);
          if (yAlign === "center" && xAlign === "right") {
            this.drawCaret(pt, ctx, tooltipSize, options);
          }
          ctx.lineTo(x2 + width, y3 + height - bottomRight);
          ctx.quadraticCurveTo(x2 + width, y3 + height, x2 + width - bottomRight, y3 + height);
          if (yAlign === "bottom") {
            this.drawCaret(pt, ctx, tooltipSize, options);
          }
          ctx.lineTo(x2 + bottomLeft, y3 + height);
          ctx.quadraticCurveTo(x2, y3 + height, x2, y3 + height - bottomLeft);
          if (yAlign === "center" && xAlign === "left") {
            this.drawCaret(pt, ctx, tooltipSize, options);
          }
          ctx.lineTo(x2, y3 + topLeft);
          ctx.quadraticCurveTo(x2, y3, x2 + topLeft, y3);
          ctx.closePath();
          ctx.fill();
          if (options.borderWidth > 0) {
            ctx.stroke();
          }
        }
        _updateAnimationTarget(options) {
          const chart2 = this.chart;
          const anims = this.$animations;
          const animX = anims && anims.x;
          const animY = anims && anims.y;
          if (animX || animY) {
            const position = positioners[options.position].call(this, this._active, this._eventPosition);
            if (!position) {
              return;
            }
            const size = this._size = getTooltipSize(this, options);
            const positionAndSize = Object.assign({}, position, this._size);
            const alignment = determineAlignment(chart2, options, positionAndSize);
            const point = getBackgroundPoint(options, positionAndSize, alignment, chart2);
            if (animX._to !== point.x || animY._to !== point.y) {
              this.xAlign = alignment.xAlign;
              this.yAlign = alignment.yAlign;
              this.width = size.width;
              this.height = size.height;
              this.caretX = position.x;
              this.caretY = position.y;
              this._resolveAnimations().update(this, point);
            }
          }
        }
        _willRender() {
          return !!this.opacity;
        }
        draw(ctx) {
          const options = this.options.setContext(this.getContext());
          let opacity = this.opacity;
          if (!opacity) {
            return;
          }
          this._updateAnimationTarget(options);
          const tooltipSize = {
            width: this.width,
            height: this.height
          };
          const pt = {
            x: this.x,
            y: this.y
          };
          opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
          const padding = toPadding(options.padding);
          const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
          if (options.enabled && hasTooltipContent) {
            ctx.save();
            ctx.globalAlpha = opacity;
            this.drawBackground(pt, ctx, tooltipSize, options);
            overrideTextDirection(ctx, options.textDirection);
            pt.y += padding.top;
            this.drawTitle(pt, ctx, options);
            this.drawBody(pt, ctx, options);
            this.drawFooter(pt, ctx, options);
            restoreTextDirection(ctx, options.textDirection);
            ctx.restore();
          }
        }
        getActiveElements() {
          return this._active || [];
        }
        setActiveElements(activeElements, eventPosition) {
          const lastActive = this._active;
          const active = activeElements.map(({ datasetIndex, index: index2 }) => {
            const meta = this.chart.getDatasetMeta(datasetIndex);
            if (!meta) {
              throw new Error("Cannot find a dataset at index " + datasetIndex);
            }
            return {
              datasetIndex,
              element: meta.data[index2],
              index: index2
            };
          });
          const changed = !_elementsEqual(lastActive, active);
          const positionChanged = this._positionChanged(active, eventPosition);
          if (changed || positionChanged) {
            this._active = active;
            this._eventPosition = eventPosition;
            this._ignoreReplayEvents = true;
            this.update(true);
          }
        }
        handleEvent(e7, replay, inChartArea = true) {
          if (replay && this._ignoreReplayEvents) {
            return false;
          }
          this._ignoreReplayEvents = false;
          const options = this.options;
          const lastActive = this._active || [];
          const active = this._getActiveElements(e7, lastActive, replay, inChartArea);
          const positionChanged = this._positionChanged(active, e7);
          const changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
          if (changed) {
            this._active = active;
            if (options.enabled || options.external) {
              this._eventPosition = {
                x: e7.x,
                y: e7.y
              };
              this.update(true, replay);
            }
          }
          return changed;
        }
        _getActiveElements(e7, lastActive, replay, inChartArea) {
          const options = this.options;
          if (e7.type === "mouseout") {
            return [];
          }
          if (!inChartArea) {
            return lastActive.filter((i6) => this.chart.data.datasets[i6.datasetIndex] && this.chart.getDatasetMeta(i6.datasetIndex).controller.getParsed(i6.index) !== void 0);
          }
          const active = this.chart.getElementsAtEventForMode(e7, options.mode, options, replay);
          if (options.reverse) {
            active.reverse();
          }
          return active;
        }
        _positionChanged(active, e7) {
          const { caretX, caretY, options } = this;
          const position = positioners[options.position].call(this, active, e7);
          return position !== false && (caretX !== position.x || caretY !== position.y);
        }
      };
      __publicField(Tooltip, "positioners", positioners);
      plugin_tooltip = {
        id: "tooltip",
        _element: Tooltip,
        positioners,
        afterInit(chart2, _args, options) {
          if (options) {
            chart2.tooltip = new Tooltip({
              chart: chart2,
              options
            });
          }
        },
        beforeUpdate(chart2, _args, options) {
          if (chart2.tooltip) {
            chart2.tooltip.initialize(options);
          }
        },
        reset(chart2, _args, options) {
          if (chart2.tooltip) {
            chart2.tooltip.initialize(options);
          }
        },
        afterDraw(chart2) {
          const tooltip = chart2.tooltip;
          if (tooltip && tooltip._willRender()) {
            const args = {
              tooltip
            };
            if (chart2.notifyPlugins("beforeTooltipDraw", {
              ...args,
              cancelable: true
            }) === false) {
              return;
            }
            tooltip.draw(chart2.ctx);
            chart2.notifyPlugins("afterTooltipDraw", args);
          }
        },
        afterEvent(chart2, args) {
          if (chart2.tooltip) {
            const useFinalPosition = args.replay;
            if (chart2.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
              args.changed = true;
            }
          }
        },
        defaults: {
          enabled: true,
          external: null,
          position: "average",
          backgroundColor: "rgba(0,0,0,0.8)",
          titleColor: "#fff",
          titleFont: {
            weight: "bold"
          },
          titleSpacing: 2,
          titleMarginBottom: 6,
          titleAlign: "left",
          bodyColor: "#fff",
          bodySpacing: 2,
          bodyFont: {},
          bodyAlign: "left",
          footerColor: "#fff",
          footerSpacing: 2,
          footerMarginTop: 6,
          footerFont: {
            weight: "bold"
          },
          footerAlign: "left",
          padding: 6,
          caretPadding: 2,
          caretSize: 5,
          cornerRadius: 6,
          boxHeight: (ctx, opts) => opts.bodyFont.size,
          boxWidth: (ctx, opts) => opts.bodyFont.size,
          multiKeyBackground: "#fff",
          displayColors: true,
          boxPadding: 0,
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          animation: {
            duration: 400,
            easing: "easeOutQuart"
          },
          animations: {
            numbers: {
              type: "number",
              properties: [
                "x",
                "y",
                "width",
                "height",
                "caretX",
                "caretY"
              ]
            },
            opacity: {
              easing: "linear",
              duration: 200
            }
          },
          callbacks: defaultCallbacks
        },
        defaultRoutes: {
          bodyFont: "font",
          footerFont: "font",
          titleFont: "font"
        },
        descriptors: {
          _scriptable: (name) => name !== "filter" && name !== "itemSort" && name !== "external",
          _indexable: false,
          callbacks: {
            _scriptable: false,
            _indexable: false
          },
          animation: {
            _fallback: false
          },
          animations: {
            _fallback: "animation"
          }
        },
        additionalOptionScopes: [
          "interaction"
        ]
      };
      plugins = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        Colors: plugin_colors,
        Decimation: plugin_decimation,
        Filler: index,
        Legend: plugin_legend,
        SubTitle: plugin_subtitle,
        Title: plugin_title,
        Tooltip: plugin_tooltip
      });
      addIfString = (labels, raw, index2, addedLabels) => {
        if (typeof raw === "string") {
          index2 = labels.push(raw) - 1;
          addedLabels.unshift({
            index: index2,
            label: raw
          });
        } else if (isNaN(raw)) {
          index2 = null;
        }
        return index2;
      };
      validIndex = (index2, max) => index2 === null ? null : _limitValue(Math.round(index2), 0, max);
      CategoryScale = class extends Scale {
        constructor(cfg) {
          super(cfg);
          this._startValue = void 0;
          this._valueRange = 0;
          this._addedLabels = [];
        }
        init(scaleOptions) {
          const added = this._addedLabels;
          if (added.length) {
            const labels = this.getLabels();
            for (const { index: index2, label } of added) {
              if (labels[index2] === label) {
                labels.splice(index2, 1);
              }
            }
            this._addedLabels = [];
          }
          super.init(scaleOptions);
        }
        parse(raw, index2) {
          if (isNullOrUndef(raw)) {
            return null;
          }
          const labels = this.getLabels();
          index2 = isFinite(index2) && labels[index2] === raw ? index2 : findOrAddLabel(labels, raw, valueOrDefault(index2, raw), this._addedLabels);
          return validIndex(index2, labels.length - 1);
        }
        determineDataLimits() {
          const { minDefined, maxDefined } = this.getUserBounds();
          let { min, max } = this.getMinMax(true);
          if (this.options.bounds === "ticks") {
            if (!minDefined) {
              min = 0;
            }
            if (!maxDefined) {
              max = this.getLabels().length - 1;
            }
          }
          this.min = min;
          this.max = max;
        }
        buildTicks() {
          const min = this.min;
          const max = this.max;
          const offset = this.options.offset;
          const ticks = [];
          let labels = this.getLabels();
          labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
          this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
          this._startValue = this.min - (offset ? 0.5 : 0);
          for (let value = min; value <= max; value++) {
            ticks.push({
              value
            });
          }
          return ticks;
        }
        getLabelForValue(value) {
          return _getLabelForValue.call(this, value);
        }
        configure() {
          super.configure();
          if (!this.isHorizontal()) {
            this._reversePixels = !this._reversePixels;
          }
        }
        getPixelForValue(value) {
          if (typeof value !== "number") {
            value = this.parse(value);
          }
          return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
        }
        getPixelForTick(index2) {
          const ticks = this.ticks;
          if (index2 < 0 || index2 > ticks.length - 1) {
            return null;
          }
          return this.getPixelForValue(ticks[index2].value);
        }
        getValueForPixel(pixel) {
          return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
        }
        getBasePixel() {
          return this.bottom;
        }
      };
      __publicField(CategoryScale, "id", "category");
      __publicField(CategoryScale, "defaults", {
        ticks: {
          callback: _getLabelForValue
        }
      });
      LinearScaleBase = class extends Scale {
        constructor(cfg) {
          super(cfg);
          this.start = void 0;
          this.end = void 0;
          this._startValue = void 0;
          this._endValue = void 0;
          this._valueRange = 0;
        }
        parse(raw, index2) {
          if (isNullOrUndef(raw)) {
            return null;
          }
          if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
            return null;
          }
          return +raw;
        }
        handleTickRangeOptions() {
          const { beginAtZero } = this.options;
          const { minDefined, maxDefined } = this.getUserBounds();
          let { min, max } = this;
          const setMin = (v2) => min = minDefined ? min : v2;
          const setMax = (v2) => max = maxDefined ? max : v2;
          if (beginAtZero) {
            const minSign = sign(min);
            const maxSign = sign(max);
            if (minSign < 0 && maxSign < 0) {
              setMax(0);
            } else if (minSign > 0 && maxSign > 0) {
              setMin(0);
            }
          }
          if (min === max) {
            let offset = max === 0 ? 1 : Math.abs(max * 0.05);
            setMax(max + offset);
            if (!beginAtZero) {
              setMin(min - offset);
            }
          }
          this.min = min;
          this.max = max;
        }
        getTickLimit() {
          const tickOpts = this.options.ticks;
          let { maxTicksLimit, stepSize } = tickOpts;
          let maxTicks;
          if (stepSize) {
            maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
            if (maxTicks > 1e3) {
              console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
              maxTicks = 1e3;
            }
          } else {
            maxTicks = this.computeTickLimit();
            maxTicksLimit = maxTicksLimit || 11;
          }
          if (maxTicksLimit) {
            maxTicks = Math.min(maxTicksLimit, maxTicks);
          }
          return maxTicks;
        }
        computeTickLimit() {
          return Number.POSITIVE_INFINITY;
        }
        buildTicks() {
          const opts = this.options;
          const tickOpts = opts.ticks;
          let maxTicks = this.getTickLimit();
          maxTicks = Math.max(2, maxTicks);
          const numericGeneratorOptions = {
            maxTicks,
            bounds: opts.bounds,
            min: opts.min,
            max: opts.max,
            precision: tickOpts.precision,
            step: tickOpts.stepSize,
            count: tickOpts.count,
            maxDigits: this._maxDigits(),
            horizontal: this.isHorizontal(),
            minRotation: tickOpts.minRotation || 0,
            includeBounds: tickOpts.includeBounds !== false
          };
          const dataRange = this._range || this;
          const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
          if (opts.bounds === "ticks") {
            _setMinAndMaxByKey(ticks, this, "value");
          }
          if (opts.reverse) {
            ticks.reverse();
            this.start = this.max;
            this.end = this.min;
          } else {
            this.start = this.min;
            this.end = this.max;
          }
          return ticks;
        }
        configure() {
          const ticks = this.ticks;
          let start = this.min;
          let end = this.max;
          super.configure();
          if (this.options.offset && ticks.length) {
            const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
            start -= offset;
            end += offset;
          }
          this._startValue = start;
          this._endValue = end;
          this._valueRange = end - start;
        }
        getLabelForValue(value) {
          return formatNumber2(value, this.chart.options.locale, this.options.ticks.format);
        }
      };
      LinearScale = class extends LinearScaleBase {
        determineDataLimits() {
          const { min, max } = this.getMinMax(true);
          this.min = isNumberFinite(min) ? min : 0;
          this.max = isNumberFinite(max) ? max : 1;
          this.handleTickRangeOptions();
        }
        computeTickLimit() {
          const horizontal = this.isHorizontal();
          const length = horizontal ? this.width : this.height;
          const minRotation = toRadians(this.options.ticks.minRotation);
          const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
          const tickFont = this._resolveTickFontOptions(0);
          return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
        }
        getPixelForValue(value) {
          return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
        }
        getValueForPixel(pixel) {
          return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
        }
      };
      __publicField(LinearScale, "id", "linear");
      __publicField(LinearScale, "defaults", {
        ticks: {
          callback: Ticks.formatters.numeric
        }
      });
      log10Floor = (v2) => Math.floor(log10(v2));
      changeExponent = (v2, m2) => Math.pow(10, log10Floor(v2) + m2);
      LogarithmicScale = class extends Scale {
        constructor(cfg) {
          super(cfg);
          this.start = void 0;
          this.end = void 0;
          this._startValue = void 0;
          this._valueRange = 0;
        }
        parse(raw, index2) {
          const value = LinearScaleBase.prototype.parse.apply(this, [
            raw,
            index2
          ]);
          if (value === 0) {
            this._zero = true;
            return void 0;
          }
          return isNumberFinite(value) && value > 0 ? value : null;
        }
        determineDataLimits() {
          const { min, max } = this.getMinMax(true);
          this.min = isNumberFinite(min) ? Math.max(0, min) : null;
          this.max = isNumberFinite(max) ? Math.max(0, max) : null;
          if (this.options.beginAtZero) {
            this._zero = true;
          }
          if (this._zero && this.min !== this._suggestedMin && !isNumberFinite(this._userMin)) {
            this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
          }
          this.handleTickRangeOptions();
        }
        handleTickRangeOptions() {
          const { minDefined, maxDefined } = this.getUserBounds();
          let min = this.min;
          let max = this.max;
          const setMin = (v2) => min = minDefined ? min : v2;
          const setMax = (v2) => max = maxDefined ? max : v2;
          if (min === max) {
            if (min <= 0) {
              setMin(1);
              setMax(10);
            } else {
              setMin(changeExponent(min, -1));
              setMax(changeExponent(max, 1));
            }
          }
          if (min <= 0) {
            setMin(changeExponent(max, -1));
          }
          if (max <= 0) {
            setMax(changeExponent(min, 1));
          }
          this.min = min;
          this.max = max;
        }
        buildTicks() {
          const opts = this.options;
          const generationOptions = {
            min: this._userMin,
            max: this._userMax
          };
          const ticks = generateTicks(generationOptions, this);
          if (opts.bounds === "ticks") {
            _setMinAndMaxByKey(ticks, this, "value");
          }
          if (opts.reverse) {
            ticks.reverse();
            this.start = this.max;
            this.end = this.min;
          } else {
            this.start = this.min;
            this.end = this.max;
          }
          return ticks;
        }
        getLabelForValue(value) {
          return value === void 0 ? "0" : formatNumber2(value, this.chart.options.locale, this.options.ticks.format);
        }
        configure() {
          const start = this.min;
          super.configure();
          this._startValue = log10(start);
          this._valueRange = log10(this.max) - log10(start);
        }
        getPixelForValue(value) {
          if (value === void 0 || value === 0) {
            value = this.min;
          }
          if (value === null || isNaN(value)) {
            return NaN;
          }
          return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
        }
        getValueForPixel(pixel) {
          const decimal = this.getDecimalForPixel(pixel);
          return Math.pow(10, this._startValue + decimal * this._valueRange);
        }
      };
      __publicField(LogarithmicScale, "id", "logarithmic");
      __publicField(LogarithmicScale, "defaults", {
        ticks: {
          callback: Ticks.formatters.logarithmic,
          major: {
            enabled: true
          }
        }
      });
      RadialLinearScale = class extends LinearScaleBase {
        constructor(cfg) {
          super(cfg);
          this.xCenter = void 0;
          this.yCenter = void 0;
          this.drawingArea = void 0;
          this._pointLabels = [];
          this._pointLabelItems = [];
        }
        setDimensions() {
          const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
          const w2 = this.width = this.maxWidth - padding.width;
          const h4 = this.height = this.maxHeight - padding.height;
          this.xCenter = Math.floor(this.left + w2 / 2 + padding.left);
          this.yCenter = Math.floor(this.top + h4 / 2 + padding.top);
          this.drawingArea = Math.floor(Math.min(w2, h4) / 2);
        }
        determineDataLimits() {
          const { min, max } = this.getMinMax(false);
          this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
          this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
          this.handleTickRangeOptions();
        }
        computeTickLimit() {
          return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
        }
        generateTickLabels(ticks) {
          LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
          this._pointLabels = this.getLabels().map((value, index2) => {
            const label = callback(this.options.pointLabels.callback, [
              value,
              index2
            ], this);
            return label || label === 0 ? label : "";
          }).filter((v2, i6) => this.chart.getDataVisibility(i6));
        }
        fit() {
          const opts = this.options;
          if (opts.display && opts.pointLabels.display) {
            fitWithPointLabels(this);
          } else {
            this.setCenterPoint(0, 0, 0, 0);
          }
        }
        setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
          this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
          this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
          this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
        }
        getIndexAngle(index2) {
          const angleMultiplier = TAU / (this._pointLabels.length || 1);
          const startAngle = this.options.startAngle || 0;
          return _normalizeAngle(index2 * angleMultiplier + toRadians(startAngle));
        }
        getDistanceFromCenterForValue(value) {
          if (isNullOrUndef(value)) {
            return NaN;
          }
          const scalingFactor = this.drawingArea / (this.max - this.min);
          if (this.options.reverse) {
            return (this.max - value) * scalingFactor;
          }
          return (value - this.min) * scalingFactor;
        }
        getValueForDistanceFromCenter(distance) {
          if (isNullOrUndef(distance)) {
            return NaN;
          }
          const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
          return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
        }
        getPointLabelContext(index2) {
          const pointLabels = this._pointLabels || [];
          if (index2 >= 0 && index2 < pointLabels.length) {
            const pointLabel = pointLabels[index2];
            return createPointLabelContext(this.getContext(), index2, pointLabel);
          }
        }
        getPointPosition(index2, distanceFromCenter, additionalAngle = 0) {
          const angle = this.getIndexAngle(index2) - HALF_PI + additionalAngle;
          return {
            x: Math.cos(angle) * distanceFromCenter + this.xCenter,
            y: Math.sin(angle) * distanceFromCenter + this.yCenter,
            angle
          };
        }
        getPointPositionForValue(index2, value) {
          return this.getPointPosition(index2, this.getDistanceFromCenterForValue(value));
        }
        getBasePosition(index2) {
          return this.getPointPositionForValue(index2 || 0, this.getBaseValue());
        }
        getPointLabelPosition(index2) {
          const { left, top, right, bottom } = this._pointLabelItems[index2];
          return {
            left,
            top,
            right,
            bottom
          };
        }
        drawBackground() {
          const { backgroundColor, grid: { circular } } = this.options;
          if (backgroundColor) {
            const ctx = this.ctx;
            ctx.save();
            ctx.beginPath();
            pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
            ctx.closePath();
            ctx.fillStyle = backgroundColor;
            ctx.fill();
            ctx.restore();
          }
        }
        drawGrid() {
          const ctx = this.ctx;
          const opts = this.options;
          const { angleLines, grid, border } = opts;
          const labelCount = this._pointLabels.length;
          let i6, offset, position;
          if (opts.pointLabels.display) {
            drawPointLabels(this, labelCount);
          }
          if (grid.display) {
            this.ticks.forEach((tick, index2) => {
              if (index2 !== 0 || index2 === 0 && this.min < 0) {
                offset = this.getDistanceFromCenterForValue(tick.value);
                const context = this.getContext(index2);
                const optsAtIndex = grid.setContext(context);
                const optsAtIndexBorder = border.setContext(context);
                drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
              }
            });
          }
          if (angleLines.display) {
            ctx.save();
            for (i6 = labelCount - 1; i6 >= 0; i6--) {
              const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i6));
              const { color: color2, lineWidth } = optsAtIndex;
              if (!lineWidth || !color2) {
                continue;
              }
              ctx.lineWidth = lineWidth;
              ctx.strokeStyle = color2;
              ctx.setLineDash(optsAtIndex.borderDash);
              ctx.lineDashOffset = optsAtIndex.borderDashOffset;
              offset = this.getDistanceFromCenterForValue(opts.reverse ? this.min : this.max);
              position = this.getPointPosition(i6, offset);
              ctx.beginPath();
              ctx.moveTo(this.xCenter, this.yCenter);
              ctx.lineTo(position.x, position.y);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
        drawBorder() {
        }
        drawLabels() {
          const ctx = this.ctx;
          const opts = this.options;
          const tickOpts = opts.ticks;
          if (!tickOpts.display) {
            return;
          }
          const startAngle = this.getIndexAngle(0);
          let offset, width;
          ctx.save();
          ctx.translate(this.xCenter, this.yCenter);
          ctx.rotate(startAngle);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          this.ticks.forEach((tick, index2) => {
            if (index2 === 0 && this.min >= 0 && !opts.reverse) {
              return;
            }
            const optsAtIndex = tickOpts.setContext(this.getContext(index2));
            const tickFont = toFont(optsAtIndex.font);
            offset = this.getDistanceFromCenterForValue(this.ticks[index2].value);
            if (optsAtIndex.showLabelBackdrop) {
              ctx.font = tickFont.string;
              width = ctx.measureText(tick.label).width;
              ctx.fillStyle = optsAtIndex.backdropColor;
              const padding = toPadding(optsAtIndex.backdropPadding);
              ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
            }
            renderText(ctx, tick.label, 0, -offset, tickFont, {
              color: optsAtIndex.color,
              strokeColor: optsAtIndex.textStrokeColor,
              strokeWidth: optsAtIndex.textStrokeWidth
            });
          });
          ctx.restore();
        }
        drawTitle() {
        }
      };
      __publicField(RadialLinearScale, "id", "radialLinear");
      __publicField(RadialLinearScale, "defaults", {
        display: true,
        animate: true,
        position: "chartArea",
        angleLines: {
          display: true,
          lineWidth: 1,
          borderDash: [],
          borderDashOffset: 0
        },
        grid: {
          circular: false
        },
        startAngle: 0,
        ticks: {
          showLabelBackdrop: true,
          callback: Ticks.formatters.numeric
        },
        pointLabels: {
          backdropColor: void 0,
          backdropPadding: 2,
          display: true,
          font: {
            size: 10
          },
          callback(label) {
            return label;
          },
          padding: 5,
          centerPointLabels: false
        }
      });
      __publicField(RadialLinearScale, "defaultRoutes", {
        "angleLines.color": "borderColor",
        "pointLabels.color": "color",
        "ticks.color": "color"
      });
      __publicField(RadialLinearScale, "descriptors", {
        angleLines: {
          _fallback: "grid"
        }
      });
      INTERVALS = {
        millisecond: {
          common: true,
          size: 1,
          steps: 1e3
        },
        second: {
          common: true,
          size: 1e3,
          steps: 60
        },
        minute: {
          common: true,
          size: 6e4,
          steps: 60
        },
        hour: {
          common: true,
          size: 36e5,
          steps: 24
        },
        day: {
          common: true,
          size: 864e5,
          steps: 30
        },
        week: {
          common: false,
          size: 6048e5,
          steps: 4
        },
        month: {
          common: true,
          size: 2628e6,
          steps: 12
        },
        quarter: {
          common: false,
          size: 7884e6,
          steps: 4
        },
        year: {
          common: true,
          size: 3154e7
        }
      };
      UNITS = /* @__PURE__ */ Object.keys(INTERVALS);
      TimeScale = class extends Scale {
        constructor(props) {
          super(props);
          this._cache = {
            data: [],
            labels: [],
            all: []
          };
          this._unit = "day";
          this._majorUnit = void 0;
          this._offsets = {};
          this._normalized = false;
          this._parseOpts = void 0;
        }
        init(scaleOpts, opts = {}) {
          const time = scaleOpts.time || (scaleOpts.time = {});
          const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
          adapter.init(opts);
          mergeIf(time.displayFormats, adapter.formats());
          this._parseOpts = {
            parser: time.parser,
            round: time.round,
            isoWeekday: time.isoWeekday
          };
          super.init(scaleOpts);
          this._normalized = opts.normalized;
        }
        parse(raw, index2) {
          if (raw === void 0) {
            return null;
          }
          return parse(this, raw);
        }
        beforeLayout() {
          super.beforeLayout();
          this._cache = {
            data: [],
            labels: [],
            all: []
          };
        }
        determineDataLimits() {
          const options = this.options;
          const adapter = this._adapter;
          const unit = options.time.unit || "day";
          let { min, max, minDefined, maxDefined } = this.getUserBounds();
          function _applyBounds(bounds) {
            if (!minDefined && !isNaN(bounds.min)) {
              min = Math.min(min, bounds.min);
            }
            if (!maxDefined && !isNaN(bounds.max)) {
              max = Math.max(max, bounds.max);
            }
          }
          if (!minDefined || !maxDefined) {
            _applyBounds(this._getLabelBounds());
            if (options.bounds !== "ticks" || options.ticks.source !== "labels") {
              _applyBounds(this.getMinMax(false));
            }
          }
          min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
          max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
          this.min = Math.min(min, max - 1);
          this.max = Math.max(min + 1, max);
        }
        _getLabelBounds() {
          const arr = this.getLabelTimestamps();
          let min = Number.POSITIVE_INFINITY;
          let max = Number.NEGATIVE_INFINITY;
          if (arr.length) {
            min = arr[0];
            max = arr[arr.length - 1];
          }
          return {
            min,
            max
          };
        }
        buildTicks() {
          const options = this.options;
          const timeOpts = options.time;
          const tickOpts = options.ticks;
          const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
          if (options.bounds === "ticks" && timestamps.length) {
            this.min = this._userMin || timestamps[0];
            this.max = this._userMax || timestamps[timestamps.length - 1];
          }
          const min = this.min;
          const max = this.max;
          const ticks = _filterBetween(timestamps, min, max);
          this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
          this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
          this.initOffsets(timestamps);
          if (options.reverse) {
            ticks.reverse();
          }
          return ticksFromTimestamps(this, ticks, this._majorUnit);
        }
        afterAutoSkip() {
          if (this.options.offsetAfterAutoskip) {
            this.initOffsets(this.ticks.map((tick) => +tick.value));
          }
        }
        initOffsets(timestamps = []) {
          let start = 0;
          let end = 0;
          let first, last;
          if (this.options.offset && timestamps.length) {
            first = this.getDecimalForValue(timestamps[0]);
            if (timestamps.length === 1) {
              start = 1 - first;
            } else {
              start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
            }
            last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
            if (timestamps.length === 1) {
              end = last;
            } else {
              end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
            }
          }
          const limit = timestamps.length < 3 ? 0.5 : 0.25;
          start = _limitValue(start, 0, limit);
          end = _limitValue(end, 0, limit);
          this._offsets = {
            start,
            end,
            factor: 1 / (start + 1 + end)
          };
        }
        _generate() {
          const adapter = this._adapter;
          const min = this.min;
          const max = this.max;
          const options = this.options;
          const timeOpts = options.time;
          const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
          const stepSize = valueOrDefault(options.ticks.stepSize, 1);
          const weekday = minor === "week" ? timeOpts.isoWeekday : false;
          const hasWeekday = isNumber(weekday) || weekday === true;
          const ticks = {};
          let first = min;
          let time, count;
          if (hasWeekday) {
            first = +adapter.startOf(first, "isoWeek", weekday);
          }
          first = +adapter.startOf(first, hasWeekday ? "day" : minor);
          if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
            throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
          }
          const timestamps = options.ticks.source === "data" && this.getDataTimestamps();
          for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
            addTick(ticks, time, timestamps);
          }
          if (time === max || options.bounds === "ticks" || count === 1) {
            addTick(ticks, time, timestamps);
          }
          return Object.keys(ticks).sort(sorter).map((x2) => +x2);
        }
        getLabelForValue(value) {
          const adapter = this._adapter;
          const timeOpts = this.options.time;
          if (timeOpts.tooltipFormat) {
            return adapter.format(value, timeOpts.tooltipFormat);
          }
          return adapter.format(value, timeOpts.displayFormats.datetime);
        }
        format(value, format) {
          const options = this.options;
          const formats = options.time.displayFormats;
          const unit = this._unit;
          const fmt = format || formats[unit];
          return this._adapter.format(value, fmt);
        }
        _tickFormatFunction(time, index2, ticks, format) {
          const options = this.options;
          const formatter = options.ticks.callback;
          if (formatter) {
            return callback(formatter, [
              time,
              index2,
              ticks
            ], this);
          }
          const formats = options.time.displayFormats;
          const unit = this._unit;
          const majorUnit = this._majorUnit;
          const minorFormat = unit && formats[unit];
          const majorFormat = majorUnit && formats[majorUnit];
          const tick = ticks[index2];
          const major = majorUnit && majorFormat && tick && tick.major;
          return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
        }
        generateTickLabels(ticks) {
          let i6, ilen, tick;
          for (i6 = 0, ilen = ticks.length; i6 < ilen; ++i6) {
            tick = ticks[i6];
            tick.label = this._tickFormatFunction(tick.value, i6, ticks);
          }
        }
        getDecimalForValue(value) {
          return value === null ? NaN : (value - this.min) / (this.max - this.min);
        }
        getPixelForValue(value) {
          const offsets = this._offsets;
          const pos = this.getDecimalForValue(value);
          return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
        }
        getValueForPixel(pixel) {
          const offsets = this._offsets;
          const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
          return this.min + pos * (this.max - this.min);
        }
        _getLabelSize(label) {
          const ticksOpts = this.options.ticks;
          const tickLabelWidth = this.ctx.measureText(label).width;
          const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
          const cosRotation = Math.cos(angle);
          const sinRotation = Math.sin(angle);
          const tickFontSize = this._resolveTickFontOptions(0).size;
          return {
            w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
            h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
          };
        }
        _getLabelCapacity(exampleTime) {
          const timeOpts = this.options.time;
          const displayFormats = timeOpts.displayFormats;
          const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
          const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [
            exampleTime
          ], this._majorUnit), format);
          const size = this._getLabelSize(exampleLabel);
          const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
          return capacity > 0 ? capacity : 1;
        }
        getDataTimestamps() {
          let timestamps = this._cache.data || [];
          let i6, ilen;
          if (timestamps.length) {
            return timestamps;
          }
          const metas = this.getMatchingVisibleMetas();
          if (this._normalized && metas.length) {
            return this._cache.data = metas[0].controller.getAllParsedValues(this);
          }
          for (i6 = 0, ilen = metas.length; i6 < ilen; ++i6) {
            timestamps = timestamps.concat(metas[i6].controller.getAllParsedValues(this));
          }
          return this._cache.data = this.normalize(timestamps);
        }
        getLabelTimestamps() {
          const timestamps = this._cache.labels || [];
          let i6, ilen;
          if (timestamps.length) {
            return timestamps;
          }
          const labels = this.getLabels();
          for (i6 = 0, ilen = labels.length; i6 < ilen; ++i6) {
            timestamps.push(parse(this, labels[i6]));
          }
          return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
        }
        normalize(values) {
          return _arrayUnique(values.sort(sorter));
        }
      };
      __publicField(TimeScale, "id", "time");
      __publicField(TimeScale, "defaults", {
        bounds: "data",
        adapters: {},
        time: {
          parser: false,
          unit: false,
          round: false,
          isoWeekday: false,
          minUnit: "millisecond",
          displayFormats: {}
        },
        ticks: {
          source: "auto",
          callback: false,
          major: {
            enabled: false
          }
        }
      });
      TimeSeriesScale = class extends TimeScale {
        constructor(props) {
          super(props);
          this._table = [];
          this._minPos = void 0;
          this._tableRange = void 0;
        }
        initOffsets() {
          const timestamps = this._getTimestampsForTable();
          const table = this._table = this.buildLookupTable(timestamps);
          this._minPos = interpolate2(table, this.min);
          this._tableRange = interpolate2(table, this.max) - this._minPos;
          super.initOffsets(timestamps);
        }
        buildLookupTable(timestamps) {
          const { min, max } = this;
          const items = [];
          const table = [];
          let i6, ilen, prev, curr, next;
          for (i6 = 0, ilen = timestamps.length; i6 < ilen; ++i6) {
            curr = timestamps[i6];
            if (curr >= min && curr <= max) {
              items.push(curr);
            }
          }
          if (items.length < 2) {
            return [
              {
                time: min,
                pos: 0
              },
              {
                time: max,
                pos: 1
              }
            ];
          }
          for (i6 = 0, ilen = items.length; i6 < ilen; ++i6) {
            next = items[i6 + 1];
            prev = items[i6 - 1];
            curr = items[i6];
            if (Math.round((next + prev) / 2) !== curr) {
              table.push({
                time: curr,
                pos: i6 / (ilen - 1)
              });
            }
          }
          return table;
        }
        _generate() {
          const min = this.min;
          const max = this.max;
          let timestamps = super.getDataTimestamps();
          if (!timestamps.includes(min) || !timestamps.length) {
            timestamps.splice(0, 0, min);
          }
          if (!timestamps.includes(max) || timestamps.length === 1) {
            timestamps.push(max);
          }
          return timestamps.sort((a3, b3) => a3 - b3);
        }
        _getTimestampsForTable() {
          let timestamps = this._cache.all || [];
          if (timestamps.length) {
            return timestamps;
          }
          const data = this.getDataTimestamps();
          const label = this.getLabelTimestamps();
          if (data.length && label.length) {
            timestamps = this.normalize(data.concat(label));
          } else {
            timestamps = data.length ? data : label;
          }
          timestamps = this._cache.all = timestamps;
          return timestamps;
        }
        getDecimalForValue(value) {
          return (interpolate2(this._table, value) - this._minPos) / this._tableRange;
        }
        getValueForPixel(pixel) {
          const offsets = this._offsets;
          const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
          return interpolate2(this._table, decimal * this._tableRange + this._minPos, true);
        }
      };
      __publicField(TimeSeriesScale, "id", "timeseries");
      __publicField(TimeSeriesScale, "defaults", TimeScale.defaults);
      scales = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        CategoryScale,
        LinearScale,
        LogarithmicScale,
        RadialLinearScale,
        TimeScale,
        TimeSeriesScale
      });
      registerables = [
        controllers,
        elements,
        plugins,
        scales
      ];
    }
  });

  // node_modules/chart.js/auto/auto.js
  var auto_exports = {};
  __export(auto_exports, {
    Animation: () => Animation,
    Animations: () => Animations,
    ArcElement: () => ArcElement,
    BarController: () => BarController,
    BarElement: () => BarElement,
    BasePlatform: () => BasePlatform,
    BasicPlatform: () => BasicPlatform,
    BubbleController: () => BubbleController,
    CategoryScale: () => CategoryScale,
    Chart: () => Chart,
    Colors: () => plugin_colors,
    DatasetController: () => DatasetController,
    Decimation: () => plugin_decimation,
    DomPlatform: () => DomPlatform,
    DoughnutController: () => DoughnutController,
    Element: () => Element,
    Filler: () => index,
    Interaction: () => Interaction,
    Legend: () => plugin_legend,
    LineController: () => LineController,
    LineElement: () => LineElement,
    LinearScale: () => LinearScale,
    LogarithmicScale: () => LogarithmicScale,
    PieController: () => PieController,
    PointElement: () => PointElement,
    PolarAreaController: () => PolarAreaController,
    RadarController: () => RadarController,
    RadialLinearScale: () => RadialLinearScale,
    Scale: () => Scale,
    ScatterController: () => ScatterController,
    SubTitle: () => plugin_subtitle,
    Ticks: () => Ticks,
    TimeScale: () => TimeScale,
    TimeSeriesScale: () => TimeSeriesScale,
    Title: () => plugin_title,
    Tooltip: () => plugin_tooltip,
    _adapters: () => adapters,
    _detectPlatform: () => _detectPlatform,
    animator: () => animator,
    controllers: () => controllers,
    default: () => auto_default,
    defaults: () => defaults,
    elements: () => elements,
    layouts: () => layouts,
    plugins: () => plugins,
    registerables: () => registerables,
    registry: () => registry,
    scales: () => scales
  });
  var auto_default;
  var init_auto = __esm({
    "node_modules/chart.js/auto/auto.js"() {
      init_chart();
      init_chart();
      Chart.register(...registerables);
      auto_default = Chart;
    }
  });

  // node_modules/@lit/reactive-element/css-tag.js
  var t, e, s, o, n, r, i, S, c;
  var init_css_tag = __esm({
    "node_modules/@lit/reactive-element/css-tag.js"() {
      t = globalThis;
      e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
      s = /* @__PURE__ */ Symbol();
      o = /* @__PURE__ */ new WeakMap();
      n = class {
        constructor(t4, e7, o7) {
          if (this._$cssResult$ = true, o7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
          this.cssText = t4, this.t = e7;
        }
        get styleSheet() {
          let t4 = this.o;
          const s4 = this.t;
          if (e && void 0 === t4) {
            const e7 = void 0 !== s4 && 1 === s4.length;
            e7 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e7 && o.set(s4, t4));
          }
          return t4;
        }
        toString() {
          return this.cssText;
        }
      };
      r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
      i = (t4, ...e7) => {
        const o7 = 1 === t4.length ? t4[0] : e7.reduce((e8, s4, o8) => e8 + ((t5) => {
          if (true === t5._$cssResult$) return t5.cssText;
          if ("number" == typeof t5) return t5;
          throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s4) + t4[o8 + 1], t4[0]);
        return new n(o7, t4, s);
      };
      S = (s4, o7) => {
        if (e) s4.adoptedStyleSheets = o7.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
        else for (const e7 of o7) {
          const o8 = document.createElement("style"), n5 = t.litNonce;
          void 0 !== n5 && o8.setAttribute("nonce", n5), o8.textContent = e7.cssText, s4.appendChild(o8);
        }
      };
      c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
        let e7 = "";
        for (const s4 of t5.cssRules) e7 += s4.cssText;
        return r(e7);
      })(t4) : t4;
    }
  });

  // node_modules/@lit/reactive-element/reactive-element.js
  var i2, e2, h, r2, o2, n2, a, c2, l, p, d, u, f, b, y;
  var init_reactive_element = __esm({
    "node_modules/@lit/reactive-element/reactive-element.js"() {
      init_css_tag();
      init_css_tag();
      ({ is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object);
      a = globalThis;
      c2 = a.trustedTypes;
      l = c2 ? c2.emptyScript : "";
      p = a.reactiveElementPolyfillSupport;
      d = (t4, s4) => t4;
      u = { toAttribute(t4, s4) {
        switch (s4) {
          case Boolean:
            t4 = t4 ? l : null;
            break;
          case Object:
          case Array:
            t4 = null == t4 ? t4 : JSON.stringify(t4);
        }
        return t4;
      }, fromAttribute(t4, s4) {
        let i6 = t4;
        switch (s4) {
          case Boolean:
            i6 = null !== t4;
            break;
          case Number:
            i6 = null === t4 ? null : Number(t4);
            break;
          case Object:
          case Array:
            try {
              i6 = JSON.parse(t4);
            } catch (t5) {
              i6 = null;
            }
        }
        return i6;
      } };
      f = (t4, s4) => !i2(t4, s4);
      b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
      Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
      y = class extends HTMLElement {
        static addInitializer(t4) {
          this._$Ei(), (this.l ?? (this.l = [])).push(t4);
        }
        static get observedAttributes() {
          return this.finalize(), this._$Eh && [...this._$Eh.keys()];
        }
        static createProperty(t4, s4 = b) {
          if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
            const i6 = /* @__PURE__ */ Symbol(), h4 = this.getPropertyDescriptor(t4, i6, s4);
            void 0 !== h4 && e2(this.prototype, t4, h4);
          }
        }
        static getPropertyDescriptor(t4, s4, i6) {
          const { get: e7, set: r6 } = h(this.prototype, t4) ?? { get() {
            return this[s4];
          }, set(t5) {
            this[s4] = t5;
          } };
          return { get: e7, set(s5) {
            const h4 = e7?.call(this);
            r6?.call(this, s5), this.requestUpdate(t4, h4, i6);
          }, configurable: true, enumerable: true };
        }
        static getPropertyOptions(t4) {
          return this.elementProperties.get(t4) ?? b;
        }
        static _$Ei() {
          if (this.hasOwnProperty(d("elementProperties"))) return;
          const t4 = n2(this);
          t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
        }
        static finalize() {
          if (this.hasOwnProperty(d("finalized"))) return;
          if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
            const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
            for (const i6 of s4) this.createProperty(i6, t5[i6]);
          }
          const t4 = this[Symbol.metadata];
          if (null !== t4) {
            const s4 = litPropertyMetadata.get(t4);
            if (void 0 !== s4) for (const [t5, i6] of s4) this.elementProperties.set(t5, i6);
          }
          this._$Eh = /* @__PURE__ */ new Map();
          for (const [t5, s4] of this.elementProperties) {
            const i6 = this._$Eu(t5, s4);
            void 0 !== i6 && this._$Eh.set(i6, t5);
          }
          this.elementStyles = this.finalizeStyles(this.styles);
        }
        static finalizeStyles(s4) {
          const i6 = [];
          if (Array.isArray(s4)) {
            const e7 = new Set(s4.flat(1 / 0).reverse());
            for (const s5 of e7) i6.unshift(c(s5));
          } else void 0 !== s4 && i6.push(c(s4));
          return i6;
        }
        static _$Eu(t4, s4) {
          const i6 = s4.attribute;
          return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
        }
        constructor() {
          super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
        }
        _$Ev() {
          this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
        }
        addController(t4) {
          (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
        }
        removeController(t4) {
          this._$EO?.delete(t4);
        }
        _$E_() {
          const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
          for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t4.set(i6, this[i6]), delete this[i6]);
          t4.size > 0 && (this._$Ep = t4);
        }
        createRenderRoot() {
          const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
          return S(t4, this.constructor.elementStyles), t4;
        }
        connectedCallback() {
          this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
        }
        enableUpdating(t4) {
        }
        disconnectedCallback() {
          this._$EO?.forEach((t4) => t4.hostDisconnected?.());
        }
        attributeChangedCallback(t4, s4, i6) {
          this._$AK(t4, i6);
        }
        _$ET(t4, s4) {
          const i6 = this.constructor.elementProperties.get(t4), e7 = this.constructor._$Eu(t4, i6);
          if (void 0 !== e7 && true === i6.reflect) {
            const h4 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
            this._$Em = t4, null == h4 ? this.removeAttribute(e7) : this.setAttribute(e7, h4), this._$Em = null;
          }
        }
        _$AK(t4, s4) {
          const i6 = this.constructor, e7 = i6._$Eh.get(t4);
          if (void 0 !== e7 && this._$Em !== e7) {
            const t5 = i6.getPropertyOptions(e7), h4 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
            this._$Em = e7;
            const r6 = h4.fromAttribute(s4, t5.type);
            this[e7] = r6 ?? this._$Ej?.get(e7) ?? r6, this._$Em = null;
          }
        }
        requestUpdate(t4, s4, i6, e7 = false, h4) {
          if (void 0 !== t4) {
            const r6 = this.constructor;
            if (false === e7 && (h4 = this[t4]), i6 ?? (i6 = r6.getPropertyOptions(t4)), !((i6.hasChanged ?? f)(h4, s4) || i6.useDefault && i6.reflect && h4 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i6)))) return;
            this.C(t4, s4, i6);
          }
          false === this.isUpdatePending && (this._$ES = this._$EP());
        }
        C(t4, s4, { useDefault: i6, reflect: e7, wrapped: h4 }, r6) {
          i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h4 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t4, s4)), true === e7 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
        }
        async _$EP() {
          this.isUpdatePending = true;
          try {
            await this._$ES;
          } catch (t5) {
            Promise.reject(t5);
          }
          const t4 = this.scheduleUpdate();
          return null != t4 && await t4, !this.isUpdatePending;
        }
        scheduleUpdate() {
          return this.performUpdate();
        }
        performUpdate() {
          if (!this.isUpdatePending) return;
          if (!this.hasUpdated) {
            if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
              for (const [t6, s5] of this._$Ep) this[t6] = s5;
              this._$Ep = void 0;
            }
            const t5 = this.constructor.elementProperties;
            if (t5.size > 0) for (const [s5, i6] of t5) {
              const { wrapped: t6 } = i6, e7 = this[s5];
              true !== t6 || this._$AL.has(s5) || void 0 === e7 || this.C(s5, void 0, i6, e7);
            }
          }
          let t4 = false;
          const s4 = this._$AL;
          try {
            t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
          } catch (s5) {
            throw t4 = false, this._$EM(), s5;
          }
          t4 && this._$AE(s4);
        }
        willUpdate(t4) {
        }
        _$AE(t4) {
          this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
        }
        _$EM() {
          this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
        }
        get updateComplete() {
          return this.getUpdateComplete();
        }
        getUpdateComplete() {
          return this._$ES;
        }
        shouldUpdate(t4) {
          return true;
        }
        update(t4) {
          this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
        }
        updated(t4) {
        }
        firstUpdated(t4) {
        }
      };
      y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");
    }
  });

  // node_modules/lit-html/lit-html.js
  function V(t4, i6) {
    if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== e3 ? e3.createHTML(i6) : i6;
  }
  function M(t4, i6, s4 = t4, e7) {
    if (i6 === E) return i6;
    let h4 = void 0 !== e7 ? s4._$Co?.[e7] : s4._$Cl;
    const o7 = a2(i6) ? void 0 : i6._$litDirective$;
    return h4?.constructor !== o7 && (h4?._$AO?.(false), void 0 === o7 ? h4 = void 0 : (h4 = new o7(t4), h4._$AT(t4, s4, e7)), void 0 !== e7 ? (s4._$Co ?? (s4._$Co = []))[e7] = h4 : s4._$Cl = h4), void 0 !== h4 && (i6 = M(t4, h4._$AS(t4, i6.values), h4, e7)), i6;
  }
  var t2, i3, s2, e3, h3, o3, n3, r3, l2, c3, a2, u2, d2, f2, v, _, m, p2, g, $, y2, x, b2, w, T, E, A, C, P, N, S2, R, k, H, I, L, z, Z, B, D;
  var init_lit_html = __esm({
    "node_modules/lit-html/lit-html.js"() {
      t2 = globalThis;
      i3 = (t4) => t4;
      s2 = t2.trustedTypes;
      e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
      h3 = "$lit$";
      o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
      n3 = "?" + o3;
      r3 = `<${n3}>`;
      l2 = document;
      c3 = () => l2.createComment("");
      a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
      u2 = Array.isArray;
      d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
      f2 = "[ 	\n\f\r]";
      v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
      _ = /-->/g;
      m = />/g;
      p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
      g = /'/g;
      $ = /"/g;
      y2 = /^(?:script|style|textarea|title)$/i;
      x = (t4) => (i6, ...s4) => ({ _$litType$: t4, strings: i6, values: s4 });
      b2 = x(1);
      w = x(2);
      T = x(3);
      E = /* @__PURE__ */ Symbol.for("lit-noChange");
      A = /* @__PURE__ */ Symbol.for("lit-nothing");
      C = /* @__PURE__ */ new WeakMap();
      P = l2.createTreeWalker(l2, 129);
      N = (t4, i6) => {
        const s4 = t4.length - 1, e7 = [];
        let n5, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
        for (let i7 = 0; i7 < s4; i7++) {
          const s5 = t4[i7];
          let a3, u3, d3 = -1, f3 = 0;
          for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
          const x2 = c4 === p2 && t4[i7 + 1].startsWith("/>") ? " " : "";
          l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e7.push(a3), s5.slice(0, d3) + h3 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i7 : x2);
        }
        return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e7];
      };
      S2 = class _S {
        constructor({ strings: t4, _$litType$: i6 }, e7) {
          let r6;
          this.parts = [];
          let l3 = 0, a3 = 0;
          const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i6);
          if (this.el = _S.createElement(f3, e7), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
            const t5 = this.el.content.firstChild;
            t5.replaceWith(...t5.childNodes);
          }
          for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
            if (1 === r6.nodeType) {
              if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h3)) {
                const i7 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e8 = /([.?@])?(.*)/.exec(i7);
                d3.push({ type: 1, index: l3, name: e8[2], strings: s4, ctor: "." === e8[1] ? I : "?" === e8[1] ? L : "@" === e8[1] ? z : H }), r6.removeAttribute(t5);
              } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
              if (y2.test(r6.tagName)) {
                const t5 = r6.textContent.split(o3), i7 = t5.length - 1;
                if (i7 > 0) {
                  r6.textContent = s2 ? s2.emptyScript : "";
                  for (let s4 = 0; s4 < i7; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
                  r6.append(t5[i7], c3());
                }
              }
            } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
            else {
              let t5 = -1;
              for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
            }
            l3++;
          }
        }
        static createElement(t4, i6) {
          const s4 = l2.createElement("template");
          return s4.innerHTML = t4, s4;
        }
      };
      R = class {
        constructor(t4, i6) {
          this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i6;
        }
        get parentNode() {
          return this._$AM.parentNode;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        u(t4) {
          const { el: { content: i6 }, parts: s4 } = this._$AD, e7 = (t4?.creationScope ?? l2).importNode(i6, true);
          P.currentNode = e7;
          let h4 = P.nextNode(), o7 = 0, n5 = 0, r6 = s4[0];
          for (; void 0 !== r6; ) {
            if (o7 === r6.index) {
              let i7;
              2 === r6.type ? i7 = new k(h4, h4.nextSibling, this, t4) : 1 === r6.type ? i7 = new r6.ctor(h4, r6.name, r6.strings, this, t4) : 6 === r6.type && (i7 = new Z(h4, this, t4)), this._$AV.push(i7), r6 = s4[++n5];
            }
            o7 !== r6?.index && (h4 = P.nextNode(), o7++);
          }
          return P.currentNode = l2, e7;
        }
        p(t4) {
          let i6 = 0;
          for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t4[i6])), i6++;
        }
      };
      k = class _k {
        get _$AU() {
          return this._$AM?._$AU ?? this._$Cv;
        }
        constructor(t4, i6, s4, e7) {
          this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i6, this._$AM = s4, this.options = e7, this._$Cv = e7?.isConnected ?? true;
        }
        get parentNode() {
          let t4 = this._$AA.parentNode;
          const i6 = this._$AM;
          return void 0 !== i6 && 11 === t4?.nodeType && (t4 = i6.parentNode), t4;
        }
        get startNode() {
          return this._$AA;
        }
        get endNode() {
          return this._$AB;
        }
        _$AI(t4, i6 = this) {
          t4 = M(this, t4, i6), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
        }
        O(t4) {
          return this._$AA.parentNode.insertBefore(t4, this._$AB);
        }
        T(t4) {
          this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
        }
        _(t4) {
          this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
        }
        $(t4) {
          const { values: i6, _$litType$: s4 } = t4, e7 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
          if (this._$AH?._$AD === e7) this._$AH.p(i6);
          else {
            const t5 = new R(e7, this), s5 = t5.u(this.options);
            t5.p(i6), this.T(s5), this._$AH = t5;
          }
        }
        _$AC(t4) {
          let i6 = C.get(t4.strings);
          return void 0 === i6 && C.set(t4.strings, i6 = new S2(t4)), i6;
        }
        k(t4) {
          u2(this._$AH) || (this._$AH = [], this._$AR());
          const i6 = this._$AH;
          let s4, e7 = 0;
          for (const h4 of t4) e7 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e7], s4._$AI(h4), e7++;
          e7 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e7), i6.length = e7);
        }
        _$AR(t4 = this._$AA.nextSibling, s4) {
          for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
            const s5 = i3(t4).nextSibling;
            i3(t4).remove(), t4 = s5;
          }
        }
        setConnected(t4) {
          void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
        }
      };
      H = class {
        get tagName() {
          return this.element.tagName;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        constructor(t4, i6, s4, e7, h4) {
          this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i6, this._$AM = e7, this.options = h4, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
        }
        _$AI(t4, i6 = this, s4, e7) {
          const h4 = this.strings;
          let o7 = false;
          if (void 0 === h4) t4 = M(this, t4, i6, 0), o7 = !a2(t4) || t4 !== this._$AH && t4 !== E, o7 && (this._$AH = t4);
          else {
            const e8 = t4;
            let n5, r6;
            for (t4 = h4[0], n5 = 0; n5 < h4.length - 1; n5++) r6 = M(this, e8[s4 + n5], i6, n5), r6 === E && (r6 = this._$AH[n5]), o7 || (o7 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h4[n5 + 1]), this._$AH[n5] = r6;
          }
          o7 && !e7 && this.j(t4);
        }
        j(t4) {
          t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
        }
      };
      I = class extends H {
        constructor() {
          super(...arguments), this.type = 3;
        }
        j(t4) {
          this.element[this.name] = t4 === A ? void 0 : t4;
        }
      };
      L = class extends H {
        constructor() {
          super(...arguments), this.type = 4;
        }
        j(t4) {
          this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
        }
      };
      z = class extends H {
        constructor(t4, i6, s4, e7, h4) {
          super(t4, i6, s4, e7, h4), this.type = 5;
        }
        _$AI(t4, i6 = this) {
          if ((t4 = M(this, t4, i6, 0) ?? A) === E) return;
          const s4 = this._$AH, e7 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h4 = t4 !== A && (s4 === A || e7);
          e7 && this.element.removeEventListener(this.name, this, s4), h4 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
        }
        handleEvent(t4) {
          "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
        }
      };
      Z = class {
        constructor(t4, i6, s4) {
          this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AI(t4) {
          M(this, t4);
        }
      };
      B = t2.litHtmlPolyfillSupport;
      B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
      D = (t4, i6, s4) => {
        const e7 = s4?.renderBefore ?? i6;
        let h4 = e7._$litPart$;
        if (void 0 === h4) {
          const t5 = s4?.renderBefore ?? null;
          e7._$litPart$ = h4 = new k(i6.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
        }
        return h4._$AI(t4), h4;
      };
    }
  });

  // node_modules/lit-element/lit-element.js
  var s3, i4, o4;
  var init_lit_element = __esm({
    "node_modules/lit-element/lit-element.js"() {
      init_reactive_element();
      init_reactive_element();
      init_lit_html();
      init_lit_html();
      s3 = globalThis;
      i4 = class extends y {
        constructor() {
          super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
        }
        createRenderRoot() {
          var _a;
          const t4 = super.createRenderRoot();
          return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
        }
        update(t4) {
          const r6 = this.render();
          this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
        }
        connectedCallback() {
          super.connectedCallback(), this._$Do?.setConnected(true);
        }
        disconnectedCallback() {
          super.disconnectedCallback(), this._$Do?.setConnected(false);
        }
        render() {
          return E;
        }
      };
      i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
      o4 = s3.litElementPolyfillSupport;
      o4?.({ LitElement: i4 });
      (s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");
    }
  });

  // node_modules/lit-html/is-server.js
  var init_is_server = __esm({
    "node_modules/lit-html/is-server.js"() {
    }
  });

  // node_modules/lit/index.js
  var init_lit = __esm({
    "node_modules/lit/index.js"() {
      init_reactive_element();
      init_lit_html();
      init_lit_element();
      init_is_server();
    }
  });

  // node_modules/@lit/reactive-element/decorators/custom-element.js
  var init_custom_element = __esm({
    "node_modules/@lit/reactive-element/decorators/custom-element.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/property.js
  function n4(t4) {
    return (e7, o7) => "object" == typeof o7 ? r4(t4, e7, o7) : ((t5, e8, o8) => {
      const r6 = e8.hasOwnProperty(o8);
      return e8.constructor.createProperty(o8, t5), r6 ? Object.getOwnPropertyDescriptor(e8, o8) : void 0;
    })(t4, e7, o7);
  }
  var o5, r4;
  var init_property = __esm({
    "node_modules/@lit/reactive-element/decorators/property.js"() {
      init_reactive_element();
      o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
      r4 = (t4 = o5, e7, r6) => {
        const { kind: n5, metadata: i6 } = r6;
        let s4 = globalThis.litPropertyMetadata.get(i6);
        if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
          const { name: o7 } = r6;
          return { set(r7) {
            const n6 = e7.get.call(this);
            e7.set.call(this, r7), this.requestUpdate(o7, n6, t4, true, r7);
          }, init(e8) {
            return void 0 !== e8 && this.C(o7, void 0, t4, e8), e8;
          } };
        }
        if ("setter" === n5) {
          const { name: o7 } = r6;
          return function(r7) {
            const n6 = this[o7];
            e7.call(this, r7), this.requestUpdate(o7, n6, t4, true, r7);
          };
        }
        throw Error("Unsupported decorator location: " + n5);
      };
    }
  });

  // node_modules/@lit/reactive-element/decorators/state.js
  function r5(r6) {
    return n4({ ...r6, state: true, attribute: false });
  }
  var init_state = __esm({
    "node_modules/@lit/reactive-element/decorators/state.js"() {
      init_property();
    }
  });

  // node_modules/@lit/reactive-element/decorators/event-options.js
  var init_event_options = __esm({
    "node_modules/@lit/reactive-element/decorators/event-options.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/base.js
  var init_base = __esm({
    "node_modules/@lit/reactive-element/decorators/base.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/query.js
  var init_query = __esm({
    "node_modules/@lit/reactive-element/decorators/query.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-all.js
  var init_query_all = __esm({
    "node_modules/@lit/reactive-element/decorators/query-all.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-async.js
  var init_query_async = __esm({
    "node_modules/@lit/reactive-element/decorators/query-async.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
  var init_query_assigned_elements = __esm({
    "node_modules/@lit/reactive-element/decorators/query-assigned-elements.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js
  var init_query_assigned_nodes = __esm({
    "node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js"() {
      init_base();
    }
  });

  // node_modules/lit/decorators.js
  var init_decorators = __esm({
    "node_modules/lit/decorators.js"() {
      init_custom_element();
      init_property();
      init_state();
      init_event_options();
      init_query();
      init_query_all();
      init_query_async();
      init_query_assigned_elements();
      init_query_assigned_nodes();
    }
  });

  // node_modules/lit-html/directive.js
  var t3, e5, i5;
  var init_directive = __esm({
    "node_modules/lit-html/directive.js"() {
      t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
      e5 = (t4) => (...e7) => ({ _$litDirective$: t4, values: e7 });
      i5 = class {
        constructor(t4) {
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AT(t4, e7, i6) {
          this._$Ct = t4, this._$AM = e7, this._$Ci = i6;
        }
        _$AS(t4, e7) {
          return this.update(t4, e7);
        }
        update(t4, e7) {
          return this.render(...e7);
        }
      };
    }
  });

  // node_modules/lit-html/directives/class-map.js
  var e6;
  var init_class_map = __esm({
    "node_modules/lit-html/directives/class-map.js"() {
      init_lit_html();
      init_directive();
      e6 = e5(class extends i5 {
        constructor(t4) {
          if (super(t4), t4.type !== t3.ATTRIBUTE || "class" !== t4.name || t4.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
        }
        render(t4) {
          return " " + Object.keys(t4).filter((s4) => t4[s4]).join(" ") + " ";
        }
        update(s4, [i6]) {
          if (void 0 === this.st) {
            this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t4) => "" !== t4)));
            for (const t4 in i6) i6[t4] && !this.nt?.has(t4) && this.st.add(t4);
            return this.render(i6);
          }
          const r6 = s4.element.classList;
          for (const t4 of this.st) t4 in i6 || (r6.remove(t4), this.st.delete(t4));
          for (const t4 in i6) {
            const s5 = !!i6[t4];
            s5 === this.st.has(t4) || this.nt?.has(t4) || (s5 ? (r6.add(t4), this.st.add(t4)) : (r6.remove(t4), this.st.delete(t4)));
          }
          return E;
        }
      });
    }
  });

  // node_modules/lit/directives/class-map.js
  var init_class_map2 = __esm({
    "node_modules/lit/directives/class-map.js"() {
      init_class_map();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/VscElement.js
  var VERSION, CONFIG_KEY, warn, VscElement, customElement;
  var init_VscElement = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/VscElement.js"() {
      init_lit();
      VERSION = "2.5.1";
      CONFIG_KEY = "__vscodeElements_disableRegistryWarning__";
      warn = (message, componentInstance) => {
        const prefix = "[VSCode Elements] ";
        if (componentInstance) {
          console.warn(`${prefix}${message}
%o`, componentInstance);
        } else {
          console.warn(`${message}
%o`, componentInstance);
        }
      };
      VscElement = class extends i4 {
        /** VSCode Elements version */
        get version() {
          return VERSION;
        }
        warn(message) {
          warn(message, this);
        }
      };
      customElement = (tagName) => {
        return (classOrTarget) => {
          const customElementClass = customElements.get(tagName);
          if (!customElementClass) {
            customElements.define(tagName, classOrTarget);
            return;
          }
          if (CONFIG_KEY in window) {
            return;
          }
          const el2 = document.createElement(tagName);
          const anotherVersion = el2?.version;
          let message = "";
          if (!anotherVersion) {
            message += "is already registered by an unknown custom element handler class.";
          } else if (anotherVersion !== VERSION) {
            message += "is already registered by a different version of VSCode Elements. ";
            message += `This version is "${VERSION}", while the other one is "${anotherVersion}".`;
          } else {
            message += `is already registered by the same version of VSCode Elements (${VERSION}).`;
          }
          warn(`The custom element "${tagName}" ${message}
To suppress this warning, set window.${CONFIG_KEY} to true`);
        };
      };
    }
  });

  // node_modules/lit-html/directives/if-defined.js
  var o6;
  var init_if_defined = __esm({
    "node_modules/lit-html/directives/if-defined.js"() {
      init_lit_html();
      o6 = (o7) => o7 ?? A;
    }
  });

  // node_modules/lit/directives/if-defined.js
  var init_if_defined2 = __esm({
    "node_modules/lit/directives/if-defined.js"() {
      init_if_defined();
    }
  });

  // node_modules/lit/directive.js
  var init_directive2 = __esm({
    "node_modules/lit/directive.js"() {
      init_directive();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/style-property-map.js
  var StylePropertyMap, stylePropertyMap;
  var init_style_property_map = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/style-property-map.js"() {
      init_lit();
      init_directive2();
      StylePropertyMap = class extends i5 {
        constructor(partInfo) {
          super(partInfo);
          this._prevProperties = {};
          if (partInfo.type !== t3.PROPERTY || partInfo.name !== "style") {
            throw new Error("The `stylePropertyMap` directive must be used in the `style` property");
          }
        }
        update(part, [styleProps]) {
          Object.entries(styleProps).forEach(([key, val]) => {
            if (this._prevProperties[key] !== val) {
              if (key.startsWith("--")) {
                part.element.style.setProperty(key, val);
              } else {
                part.element.style[key] = val;
              }
              this._prevProperties[key] = val;
            }
          });
          return E;
        }
        render(_styleProps) {
          return E;
        }
      };
      stylePropertyMap = e5(StylePropertyMap);
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/default.styles.js
  var default_styles_default;
  var init_default_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/default.styles.js"() {
      init_lit();
      default_styles_default = i`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.styles.js
  var styles, vscode_icon_styles_default;
  var init_vscode_icon_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.styles.js"() {
      init_lit();
      init_default_styles();
      styles = [
        default_styles_default,
        i`
    :host {
      color: var(--vscode-icon-foreground, #cccccc);
      display: inline-block;
    }

    .codicon[class*='codicon-'] {
      display: block;
    }

    .icon,
    .button {
      background-color: transparent;
      display: block;
      padding: 0;
    }

    .button {
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
      color: currentColor;
      cursor: pointer;
      padding: 2px;
    }

    .button:hover {
      background-color: var(
        --vscode-toolbar-hoverBackground,
        rgba(90, 93, 94, 0.31)
      );
    }

    .button:active {
      background-color: var(
        --vscode-toolbar-activeBackground,
        rgba(99, 102, 103, 0.31)
      );
    }

    .button:focus {
      outline: none;
    }

    .button:focus-visible {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    @keyframes icon-spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation-name: icon-spin;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `
      ];
      vscode_icon_styles_default = styles;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.js
  var __decorate, VscodeIcon_1, VscodeIcon;
  var init_vscode_icon = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.js"() {
      init_lit();
      init_decorators();
      init_class_map2();
      init_if_defined2();
      init_VscElement();
      init_style_property_map();
      init_vscode_icon_styles();
      __decorate = function(decorators, target, key, desc) {
        var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
        else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
        return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
      };
      VscodeIcon = VscodeIcon_1 = class VscodeIcon2 extends VscElement {
        constructor() {
          super(...arguments);
          this.label = "";
          this.name = "";
          this.size = 16;
          this.spin = false;
          this.spinDuration = 1.5;
          this.actionIcon = false;
          this._onButtonClick = (ev) => {
            this.dispatchEvent(new CustomEvent("vsc-click", { detail: { originalEvent: ev } }));
          };
        }
        connectedCallback() {
          super.connectedCallback();
          const { href, nonce } = this._getStylesheetConfig();
          VscodeIcon_1.stylesheetHref = href;
          VscodeIcon_1.nonce = nonce;
        }
        /**
         * For using web fonts in web components, the font stylesheet must be included
         * twice: on the page and in the web component. This function looks for the
         * font stylesheet on the page and returns the stylesheet URL and the nonce
         * id.
         */
        _getStylesheetConfig() {
          if (typeof document === "undefined") {
            return { nonce: void 0, href: void 0 };
          }
          const linkElement = document.getElementById("vscode-codicon-stylesheet");
          const href = linkElement?.getAttribute("href") || void 0;
          const nonce = linkElement?.nonce || void 0;
          if (!linkElement) {
            let msg = 'To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';
            msg += "See https://vscode-elements.github.io/components/icon/ for more details.";
            this.warn(msg);
          }
          return { nonce, href };
        }
        render() {
          const { stylesheetHref, nonce } = VscodeIcon_1;
          const content = b2`<span
      class=${e6({
            codicon: true,
            ["codicon-" + this.name]: true,
            spin: this.spin
          })}
      .style=${stylePropertyMap({
            animationDuration: String(this.spinDuration) + "s",
            fontSize: this.size + "px",
            height: this.size + "px",
            width: this.size + "px"
          })}
    ></span>`;
          const wrapped = this.actionIcon ? b2` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${content}
        </button>` : b2` <span class="icon" aria-hidden="true" role="presentation"
          >${content}</span
        >`;
          return b2`
      <link
        rel="stylesheet"
        href=${o6(stylesheetHref)}
        nonce=${o6(nonce)}
      />
      ${wrapped}
    `;
        }
      };
      VscodeIcon.styles = vscode_icon_styles_default;
      VscodeIcon.stylesheetHref = "";
      VscodeIcon.nonce = "";
      __decorate([
        n4()
      ], VscodeIcon.prototype, "label", void 0);
      __decorate([
        n4({ type: String })
      ], VscodeIcon.prototype, "name", void 0);
      __decorate([
        n4({ type: Number })
      ], VscodeIcon.prototype, "size", void 0);
      __decorate([
        n4({ type: Boolean, reflect: true })
      ], VscodeIcon.prototype, "spin", void 0);
      __decorate([
        n4({ type: Number, attribute: "spin-duration" })
      ], VscodeIcon.prototype, "spinDuration", void 0);
      __decorate([
        n4({ type: Boolean, reflect: true, attribute: "action-icon" })
      ], VscodeIcon.prototype, "actionIcon", void 0);
      VscodeIcon = VscodeIcon_1 = __decorate([
        customElement("vscode-icon")
      ], VscodeIcon);
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/index.js
  var init_vscode_icon2 = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/index.js"() {
      init_vscode_icon();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/helpers.js
  function getDefaultFontStack() {
    if (navigator.userAgent.indexOf("Linux") > -1) {
      return 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
    } else if (navigator.userAgent.indexOf("Mac") > -1) {
      return "-apple-system, BlinkMacSystemFont, sans-serif";
    } else if (navigator.userAgent.indexOf("Windows") > -1) {
      return '"Segoe WPC", "Segoe UI", sans-serif';
    } else {
      return "sans-serif";
    }
  }
  var DEFAULT_LINE_HEIGHT, DEFAULT_FONT_SIZE, INPUT_LINE_HEIGHT_RATIO;
  var init_helpers = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/helpers.js"() {
      DEFAULT_LINE_HEIGHT = 16;
      DEFAULT_FONT_SIZE = 13;
      INPUT_LINE_HEIGHT_RATIO = DEFAULT_LINE_HEIGHT / DEFAULT_FONT_SIZE;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.styles.js
  var defaultFontStack, styles2, vscode_button_styles_default;
  var init_vscode_button_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.styles.js"() {
      init_lit();
      init_default_styles();
      init_helpers();
      defaultFontStack = r(getDefaultFontStack());
      styles2 = [
        default_styles_default,
        i`
    :host {
      cursor: pointer;
      display: inline-block;
      width: auto;
    }

    :host([block]) {
      display: block;
      width: 100%;
    }

    .base {
      align-items: center;
      background-color: var(--vscode-button-background, #0078d4);
      border-bottom-left-radius: var(--vsc-border-left-radius, 4px);
      border-bottom-right-radius: var(--vsc-border-right-radius, 4px);
      border-bottom-width: 1px;
      border-color: var(--vscode-button-border, transparent);
      border-left-width: var(--vsc-border-left-width, 1px);
      border-right-width: var(--vsc-border-right-width, 1px);
      border-style: solid;
      border-top-left-radius: var(--vsc-border-left-radius, 4px);
      border-top-right-radius: var(--vsc-border-right-radius, 4px);
      border-top-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-button-foreground, #ffffff);
      display: flex;
      font-family: var(--vscode-font-family, ${defaultFontStack});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 100%;
      justify-content: center;
      line-height: 22px;
      overflow: hidden;
      padding: 1px calc(13px + var(--vsc-base-additional-right-padding, 0px))
        1px 13px;
      position: relative;
      user-select: none;
      white-space: nowrap;
      width: 100%;
    }

    :host([block]) .base {
      min-height: 28px;
      text-align: center;
      width: 100%;
    }

    .base:after {
      background-color: var(
        --vscode-button-separator,
        rgba(255, 255, 255, 0.4)
      );
      content: var(--vsc-base-after-content);
      display: var(--vsc-divider-display, none);
      position: absolute;
      right: 0;
      top: 4px;
      bottom: 4px;
      width: 1px;
    }

    :host([secondary]) .base:after {
      background-color: var(--vscode-button-secondaryForeground, #cccccc);
      opacity: 0.4;
    }

    :host([secondary]) .base {
      color: var(--vscode-button-secondaryForeground, #cccccc);
      background-color: var(--vscode-button-secondaryBackground, #313131);
      border-color: var(
        --vscode-button-border,
        var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.07))
      );
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.4;
      pointer-events: none;
    }

    :host(:hover) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
    }

    :host([disabled]:hover) .base {
      background-color: var(--vscode-button-background, #0078d4);
    }

    :host([secondary]:hover) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:hover) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    :host(:focus),
    :host(:active) {
      outline: none;
    }

    :host(:focus) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: 2px;
    }

    :host([disabled]:focus) .base {
      background-color: var(--vscode-button-background, #0078d4);
      outline: 0;
    }

    :host([secondary]:focus) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:focus) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    ::slotted(*) {
      display: inline-block;
      margin-left: 4px;
      margin-right: 4px;
    }

    ::slotted(*:first-child) {
      margin-left: 0;
    }

    ::slotted(*:last-child) {
      margin-right: 0;
    }

    ::slotted(vscode-icon) {
      color: inherit;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      padding: 1px 13px;
    }

    :host(:empty) .base,
    .base.icon-only {
      min-height: 24px;
      min-width: 26px;
      padding: 1px 4px;
    }

    slot {
      align-items: center;
      display: flex;
      height: 100%;
    }

    .has-content-before slot[name='content-before'] {
      margin-right: 4px;
    }

    .has-content-after slot[name='content-after'] {
      margin-left: 4px;
    }

    .icon,
    .icon-after {
      color: inherit;
      display: block;
    }

    :host(:not(:empty)) .icon {
      margin-right: 3px;
    }

    :host(:not(:empty)) .icon-after,
    :host([icon]) .icon-after {
      margin-left: 3px;
    }
  `
      ];
      vscode_button_styles_default = styles2;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.js
  var __decorate2, VscodeButton;
  var init_vscode_button = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.js"() {
      init_lit();
      init_decorators();
      init_class_map2();
      init_VscElement();
      init_vscode_icon2();
      init_vscode_button_styles();
      init_if_defined2();
      __decorate2 = function(decorators, target, key, desc) {
        var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
        else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
        return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
      };
      VscodeButton = class VscodeButton2 extends VscElement {
        get form() {
          return this._internals.form;
        }
        constructor() {
          super();
          this.autofocus = false;
          this.tabIndex = 0;
          this.secondary = false;
          this.block = false;
          this.role = "button";
          this.disabled = false;
          this.icon = "";
          this.iconSpin = false;
          this.iconAfter = "";
          this.iconAfterSpin = false;
          this.focused = false;
          this.name = void 0;
          this.iconOnly = false;
          this.type = "button";
          this.value = "";
          this._prevTabindex = 0;
          this._hasContentBefore = false;
          this._hasContentAfter = false;
          this._handleFocus = () => {
            this.focused = true;
          };
          this._handleBlur = () => {
            this.focused = false;
          };
          this.addEventListener("keydown", this._handleKeyDown.bind(this));
          this.addEventListener("click", this._handleClick.bind(this));
          this._internals = this.attachInternals();
        }
        connectedCallback() {
          super.connectedCallback();
          if (this.autofocus) {
            if (this.tabIndex < 0) {
              this.tabIndex = 0;
            }
            this.updateComplete.then(() => {
              this.focus();
              this.requestUpdate();
            });
          }
          this.addEventListener("focus", this._handleFocus);
          this.addEventListener("blur", this._handleBlur);
        }
        disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener("focus", this._handleFocus);
          this.removeEventListener("blur", this._handleBlur);
        }
        update(changedProperties) {
          super.update(changedProperties);
          if (changedProperties.has("value")) {
            this._internals.setFormValue(this.value);
          }
          if (changedProperties.has("disabled")) {
            if (this.disabled) {
              this._prevTabindex = this.tabIndex;
              this.tabIndex = -1;
            } else {
              this.tabIndex = this._prevTabindex;
            }
          }
        }
        _executeAction() {
          if (this.type === "submit" && this._internals.form) {
            this._internals.form.requestSubmit();
          }
          if (this.type === "reset" && this._internals.form) {
            this._internals.form.reset();
          }
        }
        _handleKeyDown(event) {
          if ((event.key === "Enter" || event.key === " ") && !this.hasAttribute("disabled")) {
            const syntheticClick = new MouseEvent("click", {
              bubbles: true,
              cancelable: true
            });
            syntheticClick.synthetic = true;
            this.dispatchEvent(syntheticClick);
            this._executeAction();
          }
        }
        _handleClick(event) {
          if (event.synthetic) {
            return;
          }
          if (!this.hasAttribute("disabled")) {
            this._executeAction();
          }
        }
        _handleSlotChange(ev) {
          const slot = ev.target;
          if (slot.name === "content-before") {
            this._hasContentBefore = slot.assignedElements().length > 0;
          }
          if (slot.name === "content-after") {
            this._hasContentAfter = slot.assignedElements().length > 0;
          }
        }
        render() {
          const hasIcon = this.icon !== "";
          const hasIconAfter = this.iconAfter !== "";
          const baseClasses = {
            base: true,
            "icon-only": this.iconOnly,
            "has-content-before": this._hasContentBefore,
            "has-content-after": this._hasContentAfter
          };
          const iconElem = hasIcon ? b2`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${o6(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>` : A;
          const iconAfterElem = hasIconAfter ? b2`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${o6(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>` : A;
          return b2`
      <div
        class=${e6(baseClasses)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${iconElem}
        <slot></slot>
        ${iconAfterElem}
        <slot name="content-after"></slot>
      </div>
    `;
        }
      };
      VscodeButton.styles = vscode_button_styles_default;
      VscodeButton.formAssociated = true;
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "autofocus", void 0);
      __decorate2([
        n4({ type: Number, reflect: true })
      ], VscodeButton.prototype, "tabIndex", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "secondary", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "block", void 0);
      __decorate2([
        n4({ reflect: true })
      ], VscodeButton.prototype, "role", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "disabled", void 0);
      __decorate2([
        n4()
      ], VscodeButton.prototype, "icon", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-spin" })
      ], VscodeButton.prototype, "iconSpin", void 0);
      __decorate2([
        n4({ type: Number, reflect: true, attribute: "icon-spin-duration" })
      ], VscodeButton.prototype, "iconSpinDuration", void 0);
      __decorate2([
        n4({ attribute: "icon-after" })
      ], VscodeButton.prototype, "iconAfter", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-after-spin" })
      ], VscodeButton.prototype, "iconAfterSpin", void 0);
      __decorate2([
        n4({
          type: Number,
          reflect: true,
          attribute: "icon-after-spin-duration"
        })
      ], VscodeButton.prototype, "iconAfterSpinDuration", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "focused", void 0);
      __decorate2([
        n4({ type: String, reflect: true })
      ], VscodeButton.prototype, "name", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-only" })
      ], VscodeButton.prototype, "iconOnly", void 0);
      __decorate2([
        n4({ reflect: true })
      ], VscodeButton.prototype, "type", void 0);
      __decorate2([
        n4()
      ], VscodeButton.prototype, "value", void 0);
      __decorate2([
        r5()
      ], VscodeButton.prototype, "_hasContentBefore", void 0);
      __decorate2([
        r5()
      ], VscodeButton.prototype, "_hasContentAfter", void 0);
      VscodeButton = __decorate2([
        customElement("vscode-button")
      ], VscodeButton);
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/index.js
  var vscode_button_exports = {};
  __export(vscode_button_exports, {
    VscodeButton: () => VscodeButton
  });
  var init_vscode_button2 = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/index.js"() {
      init_vscode_button();
    }
  });

  // src/webview/shared/domUtils.ts
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== void 0) {
      node.textContent = text;
    }
    return node;
  }
  function iconHeading(tag, icon, text, className) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    const iconSpan = document.createElement("span");
    iconSpan.className = `codicon codicon-${icon}`;
    node.append(iconSpan, document.createTextNode(` ${text}`));
    return node;
  }
  function buildNavIconSpan(icon, iconColor) {
    const iconSpan = document.createElement("span");
    iconSpan.className = `codicon codicon-${icon} nav-icon`;
    if (iconColor) {
      iconSpan.style.setProperty("--icon-accent", iconColor);
    }
    return iconSpan;
  }
  function applyButtonConfigAttributes(button, config) {
    if (config.appearance) {
      button.setAttribute("appearance", config.appearance);
    }
    if (config.hidden) {
      button.hidden = true;
    }
    if (config.active) {
      button.classList.add("nav-active");
      button.setAttribute("disabled", "");
      button.setAttribute("aria-current", "page");
    }
  }
  function createButton(configOrId, label, appearance) {
    const button = document.createElement("vscode-button");
    if (typeof configOrId === "string") {
      button.id = configOrId;
      button.textContent = label || "";
      if (appearance) {
        button.setAttribute("appearance", appearance);
      }
      return button;
    }
    const config = configOrId;
    button.id = config.id;
    if (config.icon) {
      button.append(buildNavIconSpan(config.icon, config.iconColor), document.createTextNode(config.label));
    } else {
      button.textContent = config.label;
    }
    applyButtonConfigAttributes(button, config);
    return button;
  }

  // src/webview/shared/buttonConfig.ts
  var BUTTONS = {
    "btn-refresh": {
      id: "btn-refresh",
      label: "Refresh",
      icon: "refresh",
      appearance: "primary"
    },
    "btn-details": {
      id: "btn-details",
      label: "Details",
      icon: "robot",
      iconColor: "#c37bff",
      appearance: "secondary"
    },
    "btn-chart": {
      id: "btn-chart",
      label: "Chart",
      icon: "graph-line",
      iconColor: "#60a5fa",
      appearance: "secondary"
    },
    "btn-usage": {
      id: "btn-usage",
      label: "Usage Analysis",
      icon: "graph",
      iconColor: "#22d3ee",
      appearance: "secondary"
    },
    "btn-diagnostics": {
      id: "btn-diagnostics",
      label: "Diagnostics",
      icon: "search",
      iconColor: "#fb7185",
      appearance: "secondary"
    },
    "btn-maturity": {
      id: "btn-maturity",
      label: "Fluency Score",
      icon: "target",
      iconColor: "#fbbf24",
      appearance: "secondary"
    },
    "btn-dashboard": {
      id: "btn-dashboard",
      label: "Team Dashboard",
      icon: "organization",
      iconColor: "#818cf8",
      appearance: "secondary"
    },
    "btn-level-viewer": {
      id: "btn-level-viewer",
      label: "Level Viewer",
      icon: "list-tree",
      iconColor: "#94a3b8",
      appearance: "secondary"
    },
    "btn-environmental": {
      id: "btn-environmental",
      label: "Environmental Impact",
      icon: "globe",
      iconColor: "#4ade80",
      appearance: "secondary"
    }
  };
  var NAV_ORDER = [
    "btn-refresh",
    "btn-details",
    "btn-chart",
    "btn-usage",
    "btn-maturity",
    "btn-environmental",
    "btn-diagnostics",
    "btn-dashboard"
  ];
  function getNavButtons(activeView, backendConfigured) {
    return NAV_ORDER.filter((id) => id !== "btn-dashboard" || backendConfigured).map((id) => ({ ...BUTTONS[id], active: id === activeView }));
  }

  // ../src/webview/shared/dataLoader.ts
  function getWindowData(key) {
    const win = globalThis.window;
    return win ? win[key] : void 0;
  }

  // src/webview/shared/formatUtils.ts
  var _estimatorsData = getWindowData("__TOKEN_ESTIMATORS__");
  var tokenEstimators = _estimatorsData?.estimators ?? {};
  var currentLocale;
  var compactNumbersEnabled = true;
  function setCompactNumbers(enabled) {
    compactNumbersEnabled = enabled;
  }
  function formatNumber(value) {
    return value.toLocaleString(currentLocale);
  }
  function formatCompact(value) {
    if (!compactNumbersEnabled) {
      return formatNumber(value);
    }
    return new Intl.NumberFormat(currentLocale, {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  }

  // src/webview/shared/extensionPoints.ts
  function wireExtensionPointButtons(vscodeApi) {
    const buttons = window.__EXTENSION_POINT_BUTTONS__ ?? [];
    if (buttons.length === 0) {
      return;
    }
    const buttonRow = document.querySelector(".button-row");
    if (!buttonRow) {
      return;
    }
    for (const btn of buttons) {
      const el2 = document.createElement("vscode-button");
      el2.id = `ext-point-${btn.id}`;
      el2.textContent = btn.label;
      el2.addEventListener("click", () => {
        vscodeApi.postMessage({ command: "extensionPointAction", buttonId: btn.id });
      });
      buttonRow.append(el2);
    }
  }

  // src/webview/shared/periodSelector.ts
  var PERIOD_LABELS = {
    today: "Today",
    last7: "Last 7 days",
    last14: "Last 14 days",
    last30: "Last 30 days",
    last90: "Last 90 days",
    currentMonth: "Current month",
    lastMonth: "Previous month",
    thisWeek: "This week",
    allTime: "All time"
  };
  var CANONICAL_PERIODS = ["today", "last7", "last30", "currentMonth", "allTime"];
  function setOptionSelected(option, value, selected) {
    if (value === selected) {
      option.selected = true;
    }
  }
  function createPeriodSelector(options) {
    const wrapper = el("div", "period-selector");
    wrapper.style.display = "inline-flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "4px";
    const labelText = options.label ?? "Time window:";
    if (labelText) {
      const label = el("span", "period-selector-label", labelText);
      label.style.fontSize = "11px";
      label.style.color = "var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))";
      wrapper.append(label);
    }
    const select = document.createElement("select");
    select.className = "period-selector-select";
    if (options.id) {
      select.id = options.id;
    }
    select.style.background = "var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))";
    select.style.color = "var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))";
    select.style.border = "1px solid var(--border-subtle, #555555)";
    select.style.borderRadius = "4px";
    select.style.padding = "4px 8px";
    select.style.fontSize = "13px";
    select.style.cursor = "pointer";
    select.style.minHeight = "24px";
    const disabledSet = new Set(options.disabled ?? []);
    const periods = options.periods ?? CANONICAL_PERIODS;
    for (const period of periods) {
      const option = document.createElement("option");
      option.value = period;
      option.textContent = PERIOD_LABELS[period];
      setOptionSelected(option, period, options.selected);
      if (disabledSet.has(period)) {
        option.disabled = true;
        if (options.disabledTitle) {
          option.title = options.disabledTitle;
        }
      }
      select.append(option);
    }
    for (const extra of options.extraOptions ?? []) {
      const option = document.createElement("option");
      option.value = extra.value;
      option.textContent = extra.label;
      if (extra.title) {
        option.title = extra.title;
      }
      setOptionSelected(option, extra.value, options.selected);
      if (extra.disabled) {
        option.disabled = true;
      }
      select.append(option);
    }
    select.addEventListener("change", () => {
      options.onChange(select.value);
    });
    wrapper.append(select);
    return { wrapper, select };
  }

  // src/webview/chart/projectionUtils.ts
  function getCurrentPeriodFraction(period, now) {
    const d3 = now ?? /* @__PURE__ */ new Date();
    const dayFrac = (d3.getHours() * 60 + d3.getMinutes()) / (24 * 60);
    if (period === "day") {
      return Math.max(0, Math.min(1, dayFrac));
    }
    if (period === "week") {
      const isoWeekDay = (d3.getDay() + 6) % 7;
      return Math.max(0, Math.min(1, (isoWeekDay + dayFrac) / 7));
    }
    const daysInMonth = new Date(d3.getFullYear(), d3.getMonth() + 1, 0).getDate();
    return Math.max(0, Math.min(1, (d3.getDate() - 1 + dayFrac) / daysInMonth));
  }
  function computeProjectionExtra(actual, fraction) {
    if (actual <= 0 || fraction < 0.01 || fraction >= 0.995) {
      return null;
    }
    const extra = actual / fraction - actual;
    return extra > 0 ? extra : null;
  }

  // src/webview/shared/viewState.ts
  function createViewStateManager(vscode2, defaults2) {
    return {
      restore() {
        const saved = vscode2.getState();
        return { ...defaults2, ...saved ?? {} };
      },
      save(state) {
        vscode2.setState(state);
      },
      patch(partial) {
        const current = vscode2.getState() ?? { ...defaults2 };
        const next = { ...defaults2, ...current, ...partial };
        vscode2.setState(next);
        return next;
      }
    };
  }

  // src/webview/shared/theme.css
  var theme_default = `/**
 * Shared theme variables for all webview panels
 * Uses VS Code theme tokens for automatic light/dark theme support.
 *
 * The "INDUSTRIAL REDUX" high-contrast styling (stark outlines, uppercase
 * navigation, neon stage colors, monospace body) is intentionally scoped to
 * the high-contrast themes only. Normal light/dark themes keep the native
 * VS Code look so the navigation bar and typography stay unobtrusive.
 */

:root {
	/* VS Code base colors */
	--bg-primary: var(--vscode-editor-background);
	--bg-secondary: var(--vscode-sideBar-background);
	--bg-tertiary: var(--vscode-editorWidget-background);
	--text-primary: var(--vscode-editor-foreground);
	--text-secondary: var(--vscode-descriptionForeground);
	--text-muted: var(--vscode-disabledForeground);
	--border-color: var(--vscode-panel-border);
	--border-subtle: var(--vscode-widget-border);

	/* Button colors */
	--button-bg: var(--vscode-button-background);
	--button-fg: var(--vscode-button-foreground);
	--button-hover-bg: var(--vscode-button-hoverBackground);
	--button-secondary-bg: var(--vscode-button-secondaryBackground);
	--button-secondary-fg: var(--vscode-button-secondaryForeground);
	--button-secondary-hover-bg: var(--vscode-button-secondaryHoverBackground);

	/* Input colors */
	--input-bg: var(--vscode-input-background);
	--input-fg: var(--vscode-input-foreground);
	--input-border: var(--vscode-input-border);

	/* List/card colors */
	--list-hover-bg: var(--vscode-list-hoverBackground);
	--list-active-bg: var(--vscode-list-activeSelectionBackground);
	--list-active-fg: var(--vscode-list-activeSelectionForeground);
	--list-inactive-bg: var(--vscode-list-inactiveSelectionBackground);

	/* Alternating row colors for better readability */
	--row-alternate-bg: var(--vscode-list-inactiveSelectionBackground);

	/* Badge colors */
	--badge-bg: var(--vscode-badge-background);
	--badge-fg: var(--vscode-badge-foreground);

	/* Focus colors */
	--focus-border: var(--vscode-focusBorder);

	/* Link colors */
	--link-color: var(--vscode-textLink-foreground);
	--link-hover-color: var(--vscode-textLink-activeForeground);

	/* Status colors */
	--error-fg: var(--vscode-errorForeground);
	--warning-fg: var(--vscode-editorWarning-foreground);
	--success-fg: var(--vscode-terminal-ansiGreen);

	/* Stage accent colors \u2014 dark theme defaults */
	--stage-1-color: #93c5fd;
	--stage-2-color: #a78bfa;
	--stage-3-color: #3b82f6;
	--stage-4-color: #22d3ee;

	/* Stage progress pip empty fill */
	--stage-pip-empty-bg: rgba(128, 128, 128, 0.2);

	/* Semantic muted foreground */
	--fg-muted: var(--vscode-disabledForeground);

	/* Shadow for cards */
	--shadow-color: rgb(0, 0, 0, 0.16);
	--shadow-hover-color: rgb(0, 0, 0, 0.24);
}

/* Light theme adjustments */
body[data-vscode-theme-kind="vscode-light"],
body[data-vscode-theme-kind="vscode-high-contrast-light"] {
	--shadow-color: rgb(0, 0, 0, 0.08);
	--shadow-hover-color: rgb(0, 0, 0, 0.12);
	/* Stage colors darkened for readable contrast on light backgrounds */
	--stage-1-color: #1d6fa4;
	--stage-2-color: #7c3aed;
	--stage-3-color: #2563eb;
	--stage-4-color: #0891b2;
	--stage-pip-empty-bg: rgba(0, 0, 0, 0.12);
}

/* Default navigation button row \u2014 native look for normal themes */
.button-row {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

/* Per-button icon accent color (set via the --icon-accent custom property on the icon
   span itself), so the label text keeps the theme's normal button foreground while the
   glyph picks up a distinct color \u2014 breaks up an otherwise uniform row of solid pills.
   The explicit margin-right overrides vscode-button's own ::slotted(*) 4px default \u2014
   some codicon glyphs (graph, target, globe) fill their 16px box edge-to-edge with
   little built-in whitespace, so 4px reads as touching the label; a fixed 6px keeps the
   gap visually consistent across glyphs instead of varying with each icon's artwork. */
.button-row .nav-icon {
	color: var(--icon-accent, inherit);
	margin-right: 6px !important;
}

/* Active view indicator \u2014 the nav button for the currently open view.
   Rendered non-clickable (disabled) but kept fully opaque and marked with a
   secondary background plus an accent underline so the row reads as a tab strip. */
.button-row vscode-button.nav-active {
	opacity: 1;
	pointer-events: none;
}

.button-row vscode-button.nav-active::part(control) {
	background: var(--button-secondary-bg);
	color: var(--button-secondary-fg);
	border-bottom: 2px solid var(--focus-border);
	cursor: default;
}

/* ------------------------------------------------------------------ *
 * High contrast themes \u2014 INDUSTRIAL REDUX
 * Stark outlines, uppercase navigation, neon stage colors, monospace.
 * Everything below is deliberately gated to the high-contrast theme
 * kinds so normal light/dark themes are unaffected.
 * ------------------------------------------------------------------ */

body[data-vscode-theme-kind="vscode-high-contrast"],
body[data-vscode-theme-kind="vscode-high-contrast-light"] {
	/* Base colors \u2014 forced to stark contrasts */
	--bg-secondary: transparent;
	--bg-tertiary: transparent;
	--text-secondary: var(--vscode-foreground);
	--text-muted: var(--vscode-descriptionForeground);
	--border-color: var(--vscode-contrastBorder);
	--border-subtle: var(--vscode-contrastBorder);

	/* Button colors \u2014 high contrast, no subtle grays */
	--button-bg: var(--vscode-foreground);
	--button-fg: var(--vscode-editor-background);
	--button-hover-bg: var(--vscode-editor-background);
	--button-secondary-bg: transparent;
	--button-secondary-fg: var(--vscode-foreground);
	--button-secondary-hover-bg: var(--vscode-foreground);

	/* Input colors */
	--input-bg: transparent;
	--input-fg: var(--vscode-foreground);
	--input-border: var(--vscode-foreground);

	/* List/card colors */
	--list-hover-bg: var(--vscode-editor-background);
	--list-active-bg: var(--vscode-foreground);
	--list-active-fg: var(--vscode-editor-background);
	--list-inactive-bg: transparent;

	/* Alternating row colors dropped for harsh outlines */
	--row-alternate-bg: transparent;

	/* Badge colors */
	--badge-bg: var(--vscode-foreground);
	--badge-fg: var(--vscode-editor-background);

	/* Focus colors */
	--focus-border: var(--vscode-foreground);

	/* Link colors */
	--link-color: var(--vscode-foreground);
	--link-hover-color: var(--vscode-textLink-activeForeground);

	/* Stage progress pip empty fill */
	--stage-pip-empty-bg: transparent;

	/* Semantic muted foreground */
	--fg-muted: var(--vscode-descriptionForeground);

	/* Shadow for cards \u2014 HARD shadows */
	--shadow-color: var(--vscode-foreground);
	--shadow-hover-color: var(--vscode-foreground);

	/* Monospace body for the industrial identity */
	font-family: var(--vscode-editor-font-family), "JetBrains Mono", "Fira Code", monospace;
}

/* High contrast dark \u2014 stark neon stage colors */
body[data-vscode-theme-kind="vscode-high-contrast"] {
	--stage-1-color: #ff00ff; /* Magenta */
	--stage-2-color: #00ffff; /* Cyan */
	--stage-3-color: #ffff00; /* Yellow */
	--stage-4-color: #00ff00; /* Green */
}

/* High contrast light \u2014 darkened neon for readable contrast */
body[data-vscode-theme-kind="vscode-high-contrast-light"] {
	--stage-1-color: #d100d1;
	--stage-2-color: #008787;
	--stage-3-color: #b5b500;
	--stage-4-color: #00a300;
}

/* High contrast stays stark and monochrome by design \u2014 the per-button icon accent
   colors are a normal-theme-only affordance and must not dilute that contrast. */
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-icon,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-icon {
	color: currentColor;
}

/* Industrial navigation tab bar (high contrast only) */
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row {
	display: flex;
	gap: 0; /* Force flush blocks */
	flex-wrap: wrap; /* Let it wrap so no scrollbars appear */
	border: 3px solid var(--vscode-foreground);
	background-color: var(--vscode-editor-background);
	margin-bottom: 2rem;
	box-shadow: 4px 4px 0 var(--vscode-panel-border);
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > * {
	flex-grow: 1; /* Stretch to fill */
	flex-shrink: 1;
	flex-basis: auto;
	text-align: center;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row button,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button {
	border-radius: 0 !important;
	border: none !important;
	border-right: 2px solid var(--vscode-foreground) !important;
	font-family: inherit;
	font-weight: 900;
	text-transform: uppercase;
	background-color: var(--vscode-editor-background) !important;
	color: var(--vscode-foreground) !important;
	padding: 12px 16px !important;
	cursor: pointer;
	box-shadow: none !important;
	letter-spacing: 1px;
	transition: transform 0.1s, background-color 0.1s;
	height: auto !important; /* Override vscode-button strict heights */
	border-bottom: 3px solid transparent !important;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button::part(control),
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row button::part(control),
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button::part(control),
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button::part(control) {
	background-color: var(--vscode-editor-background) !important;
	color: var(--vscode-foreground) !important;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover::part(control),
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover::part(control),
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover::part(control),
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover::part(control) {
	background-color: var(--vscode-foreground) !important;
	color: var(--vscode-editor-background) !important;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *:last-child,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:last-child,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:last-child,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > *:last-child,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:last-child,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:last-child {
	border-right: none !important;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover,
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button:hover,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button:hover {
	background-color: var(--vscode-foreground) !important;
	color: var(--vscode-editor-background) !important;
	border-bottom: 3px solid var(--vscode-terminal-ansiCyan) !important; /* Cyber/Industrial accent indicator */
}

/* Active view indicator (high contrast) \u2014 inverted like hover, with the accent underline */
body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button.nav-active,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button.nav-active {
	background-color: var(--vscode-foreground) !important;
	color: var(--vscode-editor-background) !important;
	border-bottom: 3px solid var(--vscode-terminal-ansiCyan) !important;
	opacity: 1;
	pointer-events: none;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button.nav-active::part(control),
body[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button.nav-active::part(control) {
	background-color: var(--vscode-foreground) !important;
	color: var(--vscode-editor-background) !important;
	cursor: default;
}

/* Industrial header + title (high contrast only) */
body[data-vscode-theme-kind="vscode-high-contrast"] .header,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .header {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: 2rem;
	flex-wrap: nowrap;
	white-space: nowrap;
	gap: 15px;
	border-bottom: 4px solid var(--vscode-foreground);
	padding-bottom: 1rem;
}

body[data-vscode-theme-kind="vscode-high-contrast"] .title,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .title {
	font-size: 28px;
	font-weight: 900;
	text-transform: uppercase;
	letter-spacing: 2px;
	color: var(--vscode-foreground);
	text-shadow: 2px 2px 0 var(--vscode-panel-border);
	white-space: nowrap;
}
`;

  // src/webview/chart/styles.css
  var styles_default = "body {\n	margin: 0;\n	background: var(--bg-primary);\n	color: var(--text-primary);\n	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n\n.container {\n	padding: 16px;\n	display: flex;\n	flex-direction: column;\n	gap: 32px;\n	max-width: 1200px;\n	margin: 0 auto;\n}\n\n.header {\n	display: flex;\n	justify-content: space-between;\n	align-items: center;\n	gap: 12px;\n	padding-bottom: 4px;\n}\n\n.header-left {\n	display: flex;\n	align-items: center;\n	gap: 8px;\n}\n\n.header-icon {\n	font-size: 20px;\n}\n\n.header-title {\n	font-size: 16px;\n	font-weight: 700;\n	color: var(--text-primary);\n	text-align: left;\n}\n\n\n\n.section {\n	background: var(--bg-secondary);\n	border: 1px solid var(--border-color);\n	border-radius: 10px;\n	padding: 16px;\n	box-shadow: 0 4px 10px var(--shadow-color);\n	text-align: center;\n}\n\n.section h3 {\n	margin: 0 0 10px;\n	font-size: 14px;\n	display: flex;\n	align-items: center;\n	gap: 6px;\n	color: var(--text-primary);\n	letter-spacing: 0.2px;\n	text-align: left;\n}\n\n.cards {\n	display: grid;\n	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n	gap: 10px;\n	text-align: center;\n}\n\n.cards + .cards {\n	margin-top: 16px;\n}\n\n.card {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-subtle);\n	border-radius: 8px;\n	padding: 12px;\n	box-shadow: 0 2px 6px var(--shadow-color);\n	text-align: center;\n}\n\n.card-label {\n	color: var(--text-secondary);\n	font-size: 11px;\n	margin-bottom: 6px;\n}\n\n.card-value {\n	color: var(--text-primary);\n	font-size: 18px;\n	font-weight: 700;\n}\n\n.card-sub {\n	color: var(--text-muted);\n	font-size: 11px;\n	margin-top: 2px;\n}\n\n.chart-section-header {\n	display: flex;\n	justify-content: space-between;\n	align-items: center;\n	margin-bottom: 10px;\n}\n\n.chart-section-header h3 {\n	margin: 0;\n}\n\n.chart-shell {	background: var(--bg-tertiary);\n	border: 1px solid var(--border-subtle);\n	border-radius: 10px;\n	padding: 12px;\n	box-shadow: 0 2px 8px var(--shadow-color);\n	text-align: center;\n}\n\n.chart-controls {\n	display: flex;\n	flex-direction: column;\n	gap: 10px;\n	margin-bottom: 12px;\n}\n\n.chart-controls-row {\n	display: flex;\n	flex-wrap: wrap;\n	align-items: center;\n	gap: 10px;\n	justify-content: flex-start;\n	padding-bottom: 10px;\n	border-bottom: 1px solid var(--border-subtle);\n}\n\n.chart-controls-row:last-child {\n	padding-bottom: 0;\n	border-bottom: none;\n}\n\n.control-group {\n	display: flex;\n	gap: 4px;\n	align-items: center;\n}\n\n.control-label {\n	font-size: 11px;\n	color: var(--text-secondary);\n}\n\n.loading-note {\n	font-size: 11px;\n	color: var(--text-secondary);\n	margin-left: 4px;\n	white-space: nowrap;\n}\n\n.control-group-separator {\n	width: 1px;\n	height: 20px;\n	background: var(--border-subtle);\n	margin: 0 4px;\n	flex-shrink: 0;\n}\n\n.period-controls {\n	display: flex;\n	gap: 4px;\n	align-items: center;\n}\n\n.period-controls-label {\n	font-size: 11px;\n	color: var(--text-secondary);\n	margin-right: 4px;\n}\n\n.period-controls .toggle {\n	padding: 6px 10px;\n}\n\n.toggle {\n	background: var(--button-secondary-bg);\n	border: 1px solid var(--border-subtle);\n	color: var(--text-primary);\n	padding: 6px 12px;\n	border-radius: 6px;\n	font-size: 12px;\n	cursor: pointer;\n	transition: all 0.15s ease;\n	min-height: 30px;\n	display: inline-flex;\n	align-items: center;\n	justify-content: center;\n}\n\n.toggle.active {\n	background: var(--button-bg);\n	border-color: var(--button-bg);\n	color: var(--button-fg);\n}\n\n.toggle:hover {\n	background: var(--button-secondary-hover-bg);\n}\n\n.toggle.active:hover {\n	background: var(--button-hover-bg);\n}\n\n.toggle:disabled {\n	opacity: 0.45;\n	cursor: not-allowed;\n}\n\n.toggle:disabled:hover {\n	background: var(--button-secondary-bg);\n}\n\n.canvas-wrap {\n	position: relative;\n	height: 420px;\n}\n\n.footer {\n	color: var(--text-muted);\n	font-size: 11px;\n	margin-top: 6px;\n	text-align: center;\n}\n\n.footer em {\n	color: var(--text-secondary);\n}\n\n.hidden {\n	display: none !important;\n}\n\n.toggle.dim {\n	opacity: 0.6;\n}\n\n.toggle.disabled {\n	opacity: 0.45;\n	cursor: not-allowed;\n}\n\n.toggle.disabled:hover {\n	background: var(--button-secondary-bg);\n}\n\n.time-window-select {\n	background: var(--button-secondary-bg);\n	border: 1px solid var(--border-subtle);\n	color: var(--text-primary);\n	border-radius: 6px;\n	padding: 6px 10px;\n	font-size: 12px;\n	cursor: pointer;\n	outline: none;\n	min-height: 30px;\n}\n\n.time-window-select:focus {\n	border-color: var(--button-bg);\n}\n\n.time-window-select option {\n	background: var(--bg-secondary);\n	color: var(--text-primary);\n}\n\n/* Language Heatmap */\n.heatmap-container {\n	position: relative;\n	min-height: 420px;\n	overflow: auto;\n}\n\n.heatmap-wrap {\n	width: 100%;\n	min-height: 380px;\n	display: flex;\n	flex-direction: column;\n	padding-top: 8px;\n}\n\n.heatmap-empty {\n	flex: 1;\n	display: flex;\n	align-items: center;\n	justify-content: center;\n	color: var(--text-muted);\n	font-size: 13px;\n	min-height: 380px;\n}\n\n.heatmap-table {\n	border-collapse: separate;\n	border-spacing: 3px;\n	width: 100%;\n	table-layout: fixed;\n}\n\n.heatmap-lang-header {\n	width: 72px;\n	min-width: 72px;\n}\n\n.heatmap-date-header {\n	height: 56px;\n	vertical-align: bottom;\n	padding: 0 0 2px 0;\n	text-align: center;\n}\n\n.heatmap-date-header span {\n	display: block;\n	writing-mode: vertical-lr;\n	transform: rotate(180deg);\n	white-space: nowrap;\n	font-size: 10px;\n	color: var(--text-primary);\n	font-weight: 500;\n	opacity: 0.85;\n	max-height: 54px;\n	overflow: hidden;\n	margin: 0 auto;\n}\n\n.heatmap-lang-label {\n	text-align: right;\n	padding-right: 8px;\n	font-size: 11px;\n	color: var(--text-secondary);\n	white-space: nowrap;\n	overflow: hidden;\n	text-overflow: ellipsis;\n	max-width: 72px;\n	height: 22px;\n}\n\n.heatmap-data-cell {\n	border-radius: 3px;\n	cursor: default;\n	height: 22px;\n	transition: opacity 0.1s ease;\n}\n\n.heatmap-data-cell:hover {\n	opacity: 0.75;\n	outline: 1px solid rgba(34, 197, 94, 0.7);\n	outline-offset: -1px;\n}\n";

  // src/webview/shared/messageHandler.ts
  function registerMessageHandler(handler) {
    window.addEventListener("message", (event) => {
      handler(event.data);
    });
  }

  // src/webview/chart/main.ts
  var vscode = acquireVsCodeApi();
  var initialData = getWindowData("__INITIAL_CHART__");
  var chart;
  var Chart2;
  async function loadChartModule() {
    if (Chart2) {
      return;
    }
    const mod = await Promise.resolve().then(() => (init_auto(), auto_exports));
    Chart2 = mod.default;
  }
  var currentMetric = "tokens";
  var currentSplit = "total";
  var currentPeriod = "day";
  var currentTimeWindow = "last30";
  var pendingMetric = null;
  var pendingSplit = null;
  var pendingPeriod = null;
  var currentDisplayMode = "actual";
  var chartState = createViewStateManager(vscode, {
    period: "day",
    timeWindow: "last30",
    metric: "tokens",
    split: "total",
    displayMode: "actual"
  });
  function saveWebviewState() {
    chartState.save({ period: currentPeriod, timeWindow: currentTimeWindow, metric: currentMetric, split: currentSplit, displayMode: currentDisplayMode });
  }
  function getWindowStartDate(timeWindow, now) {
    const y3 = now.getFullYear();
    const m2 = now.getMonth();
    const d3 = now.getDate();
    switch (timeWindow) {
      case "today":
        return `${y3}-${String(m2 + 1).padStart(2, "0")}-${String(d3).padStart(2, "0")}`;
      case "last7": {
        const start = new Date(y3, m2, d3 - 6);
        return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
      }
      case "last30": {
        const start = new Date(y3, m2, d3 - 29);
        return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
      }
      case "currentMonth":
        return `${y3}-${String(m2 + 1).padStart(2, "0")}-01`;
      case "allTime":
        return "0000-00-00";
    }
  }
  function getWindowStartMonth(timeWindow, now) {
    if (timeWindow === "allTime") {
      return "0000-00";
    }
    const y3 = now.getFullYear();
    const m2 = now.getMonth();
    if (timeWindow === "currentMonth") {
      return `${y3}-${String(m2 + 1).padStart(2, "0")}`;
    }
    const start = new Date(y3, m2, timeWindow === "today" ? 1 : timeWindow === "last7" ? -5 : -29);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
  }
  function sliceByIndices(arr, indices) {
    if (!arr) {
      return void 0;
    }
    return indices.map((i6) => arr[i6]);
  }
  function sliceDatasetsByIndices(datasets, indices) {
    if (!datasets) {
      return void 0;
    }
    return datasets.map((ds) => {
      const d3 = ds;
      return { ...d3, data: indices.map((i6) => d3.data[i6]) };
    });
  }
  function getFilterStartKey(timeWindow, periodType, now) {
    return periodType === "month" ? getWindowStartMonth(timeWindow, now) : getWindowStartDate(timeWindow, now);
  }
  function buildCoreFilteredPeriod(period, indices) {
    const totalTokens = indices.reduce((sum, i6) => sum + period.tokensData[i6], 0);
    const totalSessions = indices.reduce((sum, i6) => sum + period.sessionsData[i6], 0);
    const costData = sliceByIndices(period.costData, indices);
    const totalCost = costData.reduce((a3, b3) => a3 + b3, 0);
    return {
      labels: indices.map((i6) => period.labels[i6]),
      periodKeys: indices.map((i6) => period.periodKeys[i6]),
      tokensData: indices.map((i6) => period.tokensData[i6]),
      sessionsData: indices.map((i6) => period.sessionsData[i6]),
      modelDatasets: sliceDatasetsByIndices(period.modelDatasets, indices),
      editorDatasets: sliceDatasetsByIndices(period.editorDatasets, indices),
      repositoryDatasets: sliceDatasetsByIndices(period.repositoryDatasets, indices),
      periodCount: indices.length,
      totalTokens,
      totalSessions,
      avgPerPeriod: indices.length > 0 ? Math.round(totalTokens / indices.length) : 0,
      costData,
      totalCost,
      avgCostPerPeriod: indices.length > 0 ? totalCost / indices.length : 0
    };
  }
  function copyFilteredLocFields(source, target, indices) {
    const locData = sliceByIndices(source.locData, indices);
    const linesAddedData = sliceByIndices(source.linesAddedData, indices);
    const linesRemovedData = sliceByIndices(source.linesRemovedData, indices);
    if (locData) {
      target.locData = locData;
    }
    if (linesAddedData) {
      target.linesAddedData = linesAddedData;
    }
    if (linesRemovedData) {
      target.linesRemovedData = linesRemovedData;
    }
    if (source.totalLinesAdded !== void 0) {
      target.totalLinesAdded = (linesAddedData ?? []).reduce((a3, b3) => a3 + b3, 0);
    }
    if (source.totalLinesRemoved !== void 0) {
      target.totalLinesRemoved = (linesRemovedData ?? []).reduce((a3, b3) => a3 + b3, 0);
    }
    if (source.avgLocPerPeriod !== void 0) {
      target.avgLocPerPeriod = locData && locData.length > 0 ? locData.reduce((a3, b3) => a3 + b3, 0) / locData.length : 0;
    }
  }
  function copyFilteredDatasetFields(source, target, indices) {
    const datasetFields = [
      { key: "languageDatasets", source: source.languageDatasets },
      { key: "locEditorDatasets", source: source.locEditorDatasets },
      { key: "locRepositoryDatasets", source: source.locRepositoryDatasets },
      { key: "editorCostDatasets", source: source.editorCostDatasets },
      { key: "billingGroupCostDatasets", source: source.billingGroupCostDatasets },
      { key: "modelSessionsDatasets", source: source.modelSessionsDatasets },
      { key: "editorSessionsDatasets", source: source.editorSessionsDatasets },
      { key: "providerSessionsDatasets", source: source.providerSessionsDatasets },
      { key: "taskCategoryDatasets", source: source.taskCategoryDatasets }
    ];
    for (const { key, source: ds } of datasetFields) {
      if (ds) {
        target[key] = sliceDatasetsByIndices(ds, indices);
      }
    }
  }
  function copyFilteredOptionalFields(source, target, indices) {
    copyFilteredLocFields(source, target, indices);
    copyFilteredDatasetFields(source, target, indices);
  }
  function filterPeriodByTimeWindow(period, timeWindow, periodType) {
    if (timeWindow === "last30" && periodType === "day") {
      return period;
    }
    const startKey = getFilterStartKey(timeWindow, periodType, /* @__PURE__ */ new Date());
    const indices = [];
    for (let i6 = 0; i6 < period.periodKeys.length; i6++) {
      if (period.periodKeys[i6] >= startKey) {
        indices.push(i6);
      }
    }
    if (indices.length === 0) {
      return period;
    }
    const filtered = buildCoreFilteredPeriod(period, indices);
    copyFilteredOptionalFields(period, filtered, indices);
    return filtered;
  }
  var ROLLING_WINDOW = { day: 7, week: 4, month: 3 };
  function computeRollingAverage(data, window2) {
    return data.map((_2, i6) => {
      const start = Math.max(0, i6 - window2 + 1);
      const slice = data.slice(start, i6 + 1);
      return Math.round(slice.reduce((a3, b3) => a3 + b3, 0) / slice.length);
    });
  }
  function getRollingLabel() {
    const w2 = ROLLING_WINDOW[currentPeriod];
    const unit = currentPeriod === "day" ? "day" : currentPeriod === "week" ? "week" : "month";
    return `${w2}-${unit} rolling avg`;
  }
  function getSessionsChartTitle() {
    switch (currentSplit) {
      case "model":
        return "Sessions by Model";
      case "editor":
        return "Sessions by Editor";
      case "provider":
        return "Sessions by Provider";
      default: {
        let title = "Sessions";
        if (currentDisplayMode === "rolling") {
          title += ` (${getRollingLabel()})`;
        }
        return title;
      }
    }
  }
  function getChartTitle() {
    const periodMeta = PERIOD_LABELS2[currentPeriod];
    if (currentMetric === "sessions") {
      return getSessionsChartTitle();
    }
    if (currentMetric === "cost") {
      let titleText2;
      if (currentSplit === "editor") {
        titleText2 = periodMeta.costTitle.replace("Est. Cost", "Est. Cost by Editor");
      } else if (currentSplit === "provider") {
        titleText2 = periodMeta.costTitle.replace("Est. Cost", "Est. Cost by Provider");
      } else {
        titleText2 = periodMeta.costTitle;
      }
      if (currentDisplayMode === "rolling" && currentSplit === "total") {
        titleText2 += ` (${getRollingLabel()})`;
      }
      return titleText2;
    }
    if (currentMetric === "output") {
      return periodMeta.outputTitle;
    }
    let titleText = periodMeta.title;
    if (currentDisplayMode === "rolling" && currentSplit === "total") {
      titleText += ` (${getRollingLabel()})`;
    }
    return titleText;
  }
  function getActivePeriodData(data) {
    let period;
    if (data.periods) {
      period = data.periods[currentPeriod];
    } else {
      period = {
        labels: data.labels,
        periodKeys: data.labels,
        tokensData: data.tokensData,
        sessionsData: data.sessionsData,
        modelDatasets: data.modelDatasets,
        editorDatasets: data.editorDatasets,
        repositoryDatasets: data.repositoryDatasets,
        periodCount: data.dailyCount,
        totalTokens: data.totalTokens,
        totalSessions: data.totalSessions,
        avgPerPeriod: data.avgTokensPerDay,
        costData: [],
        totalCost: 0,
        avgCostPerPeriod: 0
      };
    }
    return filterPeriodByTimeWindow(period, currentTimeWindow, currentPeriod);
  }
  var PERIOD_LABELS2 = {
    day: { title: "Token Usage", footer: "Day-by-day token usage", countLabel: "Total Days", avgLabel: "Avg Tokens / Day", aggregationLabel: "Aggregated by Day", costTitle: "Est. Cost", avgCostLabel: "Avg Cost / Day", outputTitle: "Lines of Code", avgLocLabel: "Avg Lines / Day" },
    week: { title: "Token Usage", footer: "Week-by-week token usage", countLabel: "Total Weeks", avgLabel: "Avg Tokens / Week", aggregationLabel: "Aggregated by Week", costTitle: "Est. Cost", avgCostLabel: "Avg Cost / Week", outputTitle: "Lines of Code", avgLocLabel: "Avg Lines / Week" },
    month: { title: "Token Usage", footer: "Monthly token usage", countLabel: "Total Months", avgLabel: "Avg Tokens / Month", aggregationLabel: "Aggregated by Month", costTitle: "Est. Cost", avgCostLabel: "Avg Cost / Month", outputTitle: "Lines of Code", avgLocLabel: "Avg Lines / Month" }
  };
  function isComboSupported(metric, split) {
    if (metric === "sessions") {
      return split === "total" || split === "model" || split === "editor" || split === "provider";
    }
    if (metric === "cost") {
      return split === "total" || split === "editor" || split === "provider";
    }
    if (metric === "output") {
      return split !== "model" && split !== "provider" && split !== "taskCategory";
    }
    return split !== "language" && split !== "provider";
  }
  function buildChartHeader(data) {
    const header = el("div", "header");
    const headerLeft = el("div", "header-left");
    const title = el("span", "header-title", getChartTitle());
    title.id = "chart-title";
    headerLeft.append(el("span", "header-icon", "\u{1F4C8}"), title);
    const buttons = el("div", "button-row");
    buttons.append(...getNavButtons("btn-chart", !!data.backendConfigured).map((config) => createButton(config)));
    header.append(headerLeft, buttons);
    return header;
  }
  function getSummaryTotal(periodData) {
    switch (currentMetric) {
      case "cost":
        return { label: "Total Cost (est.)", value: `$${periodData.totalCost.toFixed(2)}` };
      case "output":
        return { label: "Total Lines (AI)", value: ((periodData.totalLinesAdded ?? 0) + (periodData.totalLinesRemoved ?? 0)).toLocaleString() };
      case "sessions":
        return { label: "Total Sessions", value: periodData.totalSessions.toLocaleString() };
      default:
        return { label: "Total Tokens", value: formatCompact(periodData.totalTokens) };
    }
  }
  function getSummaryAverage(periodData, periodMeta) {
    switch (currentMetric) {
      case "cost":
        return { label: periodMeta.avgCostLabel, value: `$${periodData.avgCostPerPeriod.toFixed(2)}` };
      case "output":
        return { label: periodMeta.avgLocLabel, value: Math.round(periodData.avgLocPerPeriod ?? 0).toLocaleString() };
      case "sessions":
        return { label: `Avg Sessions / ${periodMeta.countLabel.replace("Total ", "")}`, value: Math.round(periodData.totalSessions / (periodData.periodCount || 1)).toLocaleString() };
      default:
        return { label: periodMeta.avgLabel, value: formatCompact(periodData.avgPerPeriod) };
    }
  }
  function buildSummaryCards(periodData, periodMeta) {
    const total = getSummaryTotal(periodData);
    const average = getSummaryAverage(periodData, periodMeta);
    const cards = el("div", "cards");
    cards.id = "summary-cards";
    cards.append(
      buildCard("card-period-count", periodMeta.countLabel, periodData.periodCount.toLocaleString()),
      buildCard("card-total-tokens", total.label, total.value),
      buildCard("card-avg-tokens", average.label, average.value),
      buildCard("card-total-sessions", "Total Sessions", periodData.totalSessions.toLocaleString())
    );
    return cards;
  }
  function buildPeriodToggles(periodsReady) {
    const periodToggles = el("div", "period-controls");
    const label = el("span", "period-controls-label", "Aggregate by");
    const dayBtn = el("button", `toggle${currentPeriod === "day" ? " active" : ""}`, "Day");
    dayBtn.id = "period-day";
    dayBtn.title = "Aggregate data by day";
    const weekBtn = el("button", `toggle${currentPeriod === "week" ? " active" : ""}`, "Week");
    weekBtn.id = "period-week";
    weekBtn.title = "Aggregate data by week";
    const monthBtn = el("button", `toggle${currentPeriod === "month" ? " active" : ""}`, "Month");
    monthBtn.id = "period-month";
    monthBtn.title = "Aggregate data by month";
    if (!periodsReady) {
      weekBtn.disabled = true;
      weekBtn.title = "Loading historical data for weekly aggregation\u2026";
      monthBtn.disabled = true;
      monthBtn.title = "Loading historical data for monthly aggregation\u2026";
    }
    periodToggles.append(label, dayBtn, weekBtn, monthBtn);
    return periodToggles;
  }
  function buildTimeWindowControl(data) {
    const periodsReady = data.periodsReady !== false;
    const group = el("div", "control-group");
    const { wrapper } = createPeriodSelector({
      id: "time-window-select",
      selected: currentTimeWindow,
      disabled: periodsReady ? [] : ["allTime"],
      disabledTitle: "Full history is still loading",
      label: "Time window:",
      onChange: (value) => {
        void switchTimeWindow(value, data);
      }
    });
    wrapper.classList.add("chart-time-window");
    group.append(wrapper);
    if (!periodsReady) {
      const loadingNote = el("span", "loading-note", "Loading history\u2026");
      loadingNote.title = 'Full history is still loading. "All time" and weekly/monthly aggregation are not available yet.';
      group.append(loadingNote);
    }
    return group;
  }
  function buildMetricControl(data) {
    const group = el("div", "control-group");
    group.append(el("span", "control-label", "Metric:"));
    const tokensBtn = el("button", `toggle${currentMetric === "tokens" ? " active" : ""}`, "Tokens");
    tokensBtn.id = "metric-tokens";
    const outputBtn = el("button", `toggle${currentMetric === "output" ? " active" : ""}${!data.hasLocData ? " dim" : ""}`, "\u270F\uFE0F Output");
    outputBtn.id = "metric-output";
    if (!data.hasLocData) {
      outputBtn.title = "No edit data available yet (VS Code edit/agent sessions only)";
    }
    const costBtn = el("button", `toggle${currentMetric === "cost" ? " active" : ""}`, "\u{1F4B0} Cost");
    costBtn.id = "metric-cost";
    const sessionsBtn = el("button", `toggle${currentMetric === "sessions" ? " active" : ""}`, "\u{1F4CA} Sessions");
    sessionsBtn.id = "metric-sessions";
    group.append(tokensBtn, outputBtn, costBtn, sessionsBtn);
    return group;
  }
  function buildSplitControl() {
    const group = el("div", "control-group");
    group.append(el("span", "control-label", "Split:"));
    const mkSplit = (id, split, label) => {
      const supported = isComboSupported(currentMetric, split);
      const btn = el("button", `toggle${currentSplit === split ? " active" : ""}${!supported ? " disabled" : ""}`, label);
      btn.id = id;
      if (!supported) {
        btn.disabled = true;
        btn.title = `Not available for ${currentMetric} metric`;
      }
      return btn;
    };
    group.append(
      mkSplit("split-total", "total", "Total"),
      mkSplit("split-model", "model", "By Model"),
      mkSplit("split-editor", "editor", "By Editor"),
      mkSplit("split-provider", "provider", "\u{1F3F7}\uFE0F By Provider"),
      mkSplit("split-repository", "repository", "By Repository"),
      mkSplit("split-language", "language", "By Language"),
      mkSplit("split-taskcategory", "taskCategory", "By Task")
    );
    return group;
  }
  function buildRollingControl() {
    const group = el("div", "control-group");
    const rollingApplicable = currentSplit === "total" && currentMetric !== "output";
    const rollingBtn = el("button", `toggle${currentDisplayMode === "rolling" ? " active" : ""}${rollingApplicable ? "" : " hidden"}`, "\u{1F4C8} Rolling Avg");
    rollingBtn.id = "view-rolling";
    group.append(rollingBtn);
    return group;
  }
  function buildChartControls(data) {
    const controls = el("div", "chart-controls");
    const scopeRow = el("div", "chart-controls-row scope-row");
    scopeRow.append(buildTimeWindowControl(data), el("div", "control-group-separator"), buildPeriodToggles(data.periodsReady !== false), el("div", "control-group-separator"), buildRollingControl());
    const metricRow = el("div", "chart-controls-row metric-row");
    metricRow.append(buildMetricControl(data));
    const splitRow = el("div", "chart-controls-row split-row");
    splitRow.append(buildSplitControl());
    controls.append(scopeRow, metricRow, splitRow);
    return controls;
  }
  function renderLayout(data) {
    setCompactNumbers(data.compactNumbers !== false);
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    root.replaceChildren();
    const themeStyle = document.createElement("style");
    themeStyle.textContent = theme_default;
    const style = document.createElement("style");
    style.textContent = styles_default;
    const periodData = getActivePeriodData(data);
    const periodMeta = PERIOD_LABELS2[currentPeriod];
    const summarySection = el("div", "section");
    summarySection.append(iconHeading("h3", "graph", "Summary"), buildSummaryCards(periodData, periodMeta));
    const editorCards = buildEditorCards(data.editorTotalsMap);
    if (editorCards) {
      summarySection.append(editorCards);
    }
    const chartSectionHeader = el("div", "chart-section-header");
    chartSectionHeader.append(iconHeading("h3", "graph-line", "Charts"));
    const canvasWrap = el("div", "canvas-wrap");
    const canvas = document.createElement("canvas");
    canvas.id = "token-chart";
    canvasWrap.append(canvas);
    const heatmapContainer = el("div", "heatmap-container hidden");
    heatmapContainer.id = "heatmap-container";
    const chartShell = el("div", "chart-shell");
    chartShell.append(buildChartControls(data), canvasWrap, heatmapContainer);
    const chartSection = el("div", "section");
    chartSection.append(chartSectionHeader, chartShell);
    const footer = el(
      "div",
      "footer",
      `${periodMeta.footer} (${periodMeta.aggregationLabel})
Last updated: ${new Date(data.lastUpdated).toLocaleString()}
Updates automatically every 5 minutes.`
    );
    footer.id = "chart-footer";
    const container = el("div", "container");
    container.append(buildChartHeader(data), summarySection, chartSection, footer);
    root.append(themeStyle, style, container);
    wireInteractions(data);
    void setupChart(canvas, data);
  }
  function buildCard(id, label, value) {
    const card = el("div", "card");
    card.id = id;
    card.append(el("div", "card-label", label), el("div", "card-value", value));
    return card;
  }
  function buildEditorCards(editorTotals) {
    const entries = Object.entries(editorTotals);
    if (!entries.length) {
      return null;
    }
    const wrap = el("div", "cards");
    entries.forEach(([editor, tokens]) => {
      const card = buildCard(`editor-${editor}`, editor, formatCompact(tokens));
      if (editor === "JetBrains") {
        card.title = "JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available.";
        const labelEl = card.querySelector(".card-label");
        if (labelEl) {
          labelEl.textContent = `${editor} \u24D8`;
        }
      }
      if (editor === "Antigravity") {
        card.title = "Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally.";
        const labelEl = card.querySelector(".card-label");
        if (labelEl) {
          labelEl.textContent = `${editor} \u24D8`;
        }
      }
      wrap.append(card);
    });
    return wrap;
  }
  function updateSummaryCards(data) {
    const periodData = getActivePeriodData(data);
    const periodMeta = PERIOD_LABELS2[currentPeriod];
    const updateCard = (id, label, value) => {
      const card = document.getElementById(id);
      if (!card) {
        return;
      }
      if (label !== null) {
        const labelEl = card.querySelector(".card-label");
        if (labelEl) {
          labelEl.textContent = label;
        }
      }
      const valueEl = card.querySelector(".card-value");
      if (valueEl) {
        valueEl.textContent = value;
      }
    };
    updateCard("card-period-count", periodMeta.countLabel, periodData.periodCount.toLocaleString());
    const total = getSummaryTotal(periodData);
    const average = getSummaryAverage(periodData, periodMeta);
    updateCard("card-total-tokens", total.label, total.value);
    updateCard("card-avg-tokens", average.label, average.value);
    updateCard("card-total-sessions", null, periodData.totalSessions.toLocaleString());
    const title = document.getElementById("chart-title");
    if (title) {
      title.textContent = getChartTitle();
    }
    const footer = document.getElementById("chart-footer");
    if (footer) {
      footer.textContent = `${periodMeta.footer} (${periodMeta.aggregationLabel})
Last updated: ${new Date(data.lastUpdated).toLocaleString()}
Updates automatically every 5 minutes.`;
    }
  }
  function wireInteractions(data) {
    const refresh = document.getElementById("btn-refresh");
    refresh?.addEventListener("click", () => vscode.postMessage({ command: "refresh" }));
    const details = document.getElementById("btn-details");
    details?.addEventListener("click", () => vscode.postMessage({ command: "showDetails" }));
    const usage = document.getElementById("btn-usage");
    usage?.addEventListener("click", () => vscode.postMessage({ command: "showUsageAnalysis" }));
    const diagnostics = document.getElementById("btn-diagnostics");
    diagnostics?.addEventListener("click", () => vscode.postMessage({ command: "showDiagnostics" }));
    const maturity = document.getElementById("btn-maturity");
    maturity?.addEventListener("click", () => vscode.postMessage({ command: "showMaturity" }));
    const dashboard = document.getElementById("btn-dashboard");
    dashboard?.addEventListener("click", () => vscode.postMessage({ command: "showDashboard" }));
    const environmental = document.getElementById("btn-environmental");
    environmental?.addEventListener("click", () => vscode.postMessage({ command: "showEnvironmental" }));
    wireExtensionPointButtons(vscode);
    const periodButtons = [
      { id: "period-day", period: "day" },
      { id: "period-week", period: "week" },
      { id: "period-month", period: "month" }
    ];
    periodButtons.forEach(({ id, period }) => {
      const btn = document.getElementById(id);
      btn?.addEventListener("click", () => {
        void switchPeriod(period, data);
      });
    });
    const metricButtons = [
      { id: "metric-tokens", metric: "tokens" },
      { id: "metric-output", metric: "output" },
      { id: "metric-cost", metric: "cost" },
      { id: "metric-sessions", metric: "sessions" }
    ];
    metricButtons.forEach(({ id, metric }) => {
      const btn = document.getElementById(id);
      btn?.addEventListener("click", () => {
        void switchMetric(metric, data);
      });
    });
    const splitButtons = [
      { id: "split-total", split: "total" },
      { id: "split-model", split: "model" },
      { id: "split-editor", split: "editor" },
      { id: "split-repository", split: "repository" },
      { id: "split-language", split: "language" },
      { id: "split-provider", split: "provider" },
      { id: "split-taskcategory", split: "taskCategory" }
    ];
    splitButtons.forEach(({ id, split }) => {
      const btn = document.getElementById(id);
      btn?.addEventListener("click", () => {
        void switchSplit(split, data);
      });
    });
    const rollingToggle = document.getElementById("view-rolling");
    rollingToggle?.addEventListener("click", () => {
      void switchDisplayMode(data);
    });
  }
  async function setupChart(canvas, data) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    await loadChartModule();
    if (!Chart2) {
      return;
    }
    chart = new Chart2(ctx, createConfig(data));
    if (pendingPeriod !== null && pendingPeriod !== "day") {
      const periodToRestore = pendingPeriod;
      currentPeriod = "day";
      await switchPeriod(periodToRestore, data);
    } else if (pendingMetric !== null || pendingSplit !== null) {
      const metricToRestore = pendingMetric ?? currentMetric;
      const splitToRestore = pendingSplit ?? currentSplit;
      currentMetric = "tokens";
      currentSplit = "total";
      await switchMetric(metricToRestore, data);
      if (splitToRestore !== "total") {
        await switchSplit(splitToRestore, data);
      }
    }
    pendingMetric = null;
    pendingSplit = null;
    pendingPeriod = null;
    refreshHeatmapView(data);
  }
  async function switchPeriod(period, data) {
    if (currentPeriod === period) {
      return;
    }
    currentPeriod = period;
    vscode.postMessage({ command: "setPeriodPreference", period });
    saveWebviewState();
    setActivePeriod(period);
    updateSummaryCards(data);
    refreshHeatmapView(data);
    if (isHeatmapView()) {
      return;
    }
    if (!chart) {
      return;
    }
    const canvas = chart.canvas;
    chart.destroy();
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    await loadChartModule();
    if (!Chart2) {
      return;
    }
    chart = new Chart2(ctx, createConfig(data));
  }
  function clampSplitForMetric(metric) {
    if (metric === "cost" && currentSplit !== "editor" && currentSplit !== "provider") {
      currentSplit = "total";
      return;
    }
    if (metric === "output" && currentSplit === "model") {
      currentSplit = "total";
      return;
    }
    if (metric === "tokens" && currentSplit === "language") {
      currentSplit = "total";
      return;
    }
    if (metric === "sessions" && currentSplit !== "total" && currentSplit !== "model" && currentSplit !== "editor" && currentSplit !== "provider") {
      currentSplit = "total";
    }
  }
  async function switchMetric(metric, data) {
    if (currentMetric === metric) {
      return;
    }
    clampSplitForMetric(metric);
    currentMetric = metric;
    const rollingApplicable = currentSplit === "total" && metric !== "output";
    if (!rollingApplicable) {
      currentDisplayMode = "actual";
    }
    vscode.postMessage({ command: "setViewPreference", metric: currentMetric, split: currentSplit });
    saveWebviewState();
    setActiveMetric(metric);
    setActiveSplit(currentSplit);
    updateSplitButtonStates();
    const rollingBtnEl = document.getElementById("view-rolling");
    if (rollingBtnEl) {
      rollingBtnEl.classList.toggle("hidden", !rollingApplicable);
      rollingBtnEl.classList.toggle("active", rollingApplicable && currentDisplayMode === "rolling");
    }
    updateSummaryCards(data);
    await reinitChart(data);
  }
  async function switchTimeWindow(timeWindow, data) {
    if (currentTimeWindow === timeWindow) {
      return;
    }
    currentTimeWindow = timeWindow;
    vscode.postMessage({ command: "setTimeWindowPreference", timeWindow });
    saveWebviewState();
    updateSummaryCards(data);
    await reinitChart(data);
  }
  function isSplitSupported(metric, split) {
    if (metric === "sessions") {
      return split === "total" || split === "model" || split === "editor" || split === "provider";
    }
    return metric === "cost" && (split === "total" || split === "editor" || split === "provider") || metric === "output" && split !== "model" && split !== "provider" && split !== "taskCategory" || metric === "tokens" && split !== "language" && split !== "provider";
  }
  async function reinitChart(data) {
    refreshHeatmapView(data);
    if (isHeatmapView()) {
      if (chart) {
        chart.destroy();
        chart = void 0;
      }
      return;
    }
    if (!chart) {
      const canvasEl = document.getElementById("token-chart");
      if (!canvasEl) {
        return;
      }
      await loadChartModule();
      if (!Chart2) {
        return;
      }
      const ctx2 = canvasEl.getContext("2d");
      if (!ctx2) {
        return;
      }
      chart = new Chart2(ctx2, createConfig(data));
      return;
    }
    const canvas = chart.canvas;
    chart.destroy();
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    await loadChartModule();
    if (!Chart2) {
      return;
    }
    chart = new Chart2(ctx, createConfig(data));
  }
  async function switchSplit(split, data) {
    if (currentSplit === split) {
      return;
    }
    if (!isSplitSupported(currentMetric, split)) {
      return;
    }
    currentSplit = split;
    const rollingApplicable = split === "total" && currentMetric !== "output";
    if (!rollingApplicable) {
      currentDisplayMode = "actual";
    }
    vscode.postMessage({ command: "setViewPreference", metric: currentMetric, split: currentSplit });
    saveWebviewState();
    setActiveSplit(split);
    const rollingBtnEl = document.getElementById("view-rolling");
    if (rollingBtnEl) {
      rollingBtnEl.classList.toggle("hidden", !rollingApplicable);
      rollingBtnEl.classList.toggle("active", rollingApplicable && currentDisplayMode === "rolling");
    }
    updateSummaryCards(data);
    await reinitChart(data);
  }
  function setActivePeriod(period) {
    ["period-day", "period-week", "period-month"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) {
        return;
      }
      btn.classList.toggle("active", id === `period-${period}`);
    });
  }
  function setActiveMetric(metric) {
    ["metric-tokens", "metric-output", "metric-cost", "metric-sessions"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) {
        return;
      }
      btn.classList.toggle("active", id === `metric-${metric}`);
    });
  }
  function setActiveSplit(split) {
    ["split-total", "split-model", "split-editor", "split-repository", "split-language", "split-provider", "split-taskcategory"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) {
        return;
      }
      btn.classList.toggle("active", id === `split-${split}`);
    });
  }
  function updateSplitButtonStates() {
    const splits = [
      { id: "split-total", split: "total" },
      { id: "split-model", split: "model" },
      { id: "split-editor", split: "editor" },
      { id: "split-repository", split: "repository" },
      { id: "split-language", split: "language" },
      { id: "split-provider", split: "provider" },
      { id: "split-taskcategory", split: "taskCategory" }
    ];
    splits.forEach(({ id, split }) => {
      const btn = document.getElementById(id);
      if (!btn) {
        return;
      }
      const supported = isSplitSupported(currentMetric, split);
      btn.disabled = !supported;
      btn.classList.toggle("disabled", !supported);
      btn.title = supported ? "" : `Not available for ${currentMetric} metric`;
    });
  }
  function setActiveDisplayMode(mode) {
    const btn = document.getElementById("view-rolling");
    if (!btn) {
      return;
    }
    btn.classList.toggle("active", mode === "rolling");
  }
  async function switchDisplayMode(data) {
    currentDisplayMode = currentDisplayMode === "actual" ? "rolling" : "actual";
    setActiveDisplayMode(currentDisplayMode);
    saveWebviewState();
    updateSummaryCards(data);
    if (!chart) {
      return;
    }
    const canvas = chart.canvas;
    chart.destroy();
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    await loadChartModule();
    if (!Chart2) {
      return;
    }
    chart = new Chart2(ctx, createConfig(data));
  }
  var PROJECTION_LABELS = {
    day: "\u{1F4C8} Projected (today)",
    week: "\u{1F4C8} Projected (this week)",
    month: "\u{1F4C8} Projected (this month)"
  };
  function getChartColors() {
    const s4 = getComputedStyle(document.body);
    return {
      textColor: s4.getPropertyValue("--text-primary") || "#e0e0e0",
      gridColor: "rgba(128, 128, 128, 0.15)",
      borderColor: s4.getPropertyValue("--border-subtle") || "#3a3a40",
      bgColor: s4.getPropertyValue("--bg-tertiary") || "#1e1e1e"
    };
  }
  function buildBaseOptions(c4, periodsReady) {
    const title = !periodsReady && currentTimeWindow === "allTime" ? `${PERIOD_LABELS2[currentTimeWindow]} (loading history\u2026)` : PERIOD_LABELS2[currentTimeWindow];
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        title: { display: true, text: title, color: c4.textColor, font: { size: 14, weight: "bold" }, padding: { top: 4, bottom: 12 } },
        legend: { position: "top", labels: { color: c4.textColor, font: { size: 12 } } },
        tooltip: { backgroundColor: c4.bgColor, titleColor: c4.textColor, bodyColor: c4.textColor, borderColor: c4.borderColor, borderWidth: 1, padding: 10, displayColors: true }
      },
      scales: { x: { grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } } }
    };
  }
  function resolveSessionsDatasets(view, period) {
    if (view === "sessions-model") {
      return period.modelSessionsDatasets ?? period.modelDatasets;
    }
    if (view === "sessions-editor") {
      return period.editorSessionsDatasets ?? period.editorDatasets;
    }
    if (view === "sessions-provider") {
      return period.providerSessionsDatasets ?? period.billingGroupCostDatasets ?? [];
    }
    return void 0;
  }
  function buildSessionsTotalDataset(period) {
    const isRolling = currentDisplayMode === "rolling";
    return {
      label: isRolling ? getRollingLabel() : "Sessions",
      data: isRolling ? computeRollingAverage(period.sessionsData, ROLLING_WINDOW[currentPeriod]) : period.sessionsData,
      backgroundColor: isRolling ? "rgba(137, 180, 250, 0.15)" : "rgba(137, 180, 250, 0.7)",
      borderColor: "rgba(137, 180, 250, 1)",
      borderWidth: isRolling ? 2 : 1,
      borderRadius: isRolling ? void 0 : 4,
      type: isRolling ? "line" : void 0,
      tension: isRolling ? 0.4 : void 0,
      fill: isRolling ? false : void 0
    };
  }
  function buildSessionsProjectionDataset(period) {
    const lastIdx = period.sessionsData.length - 1;
    if (lastIdx < 0) {
      return null;
    }
    const projExtra = computeProjectionExtra(period.sessionsData[lastIdx], getCurrentPeriodFraction(currentPeriod));
    if (projExtra === null) {
      return null;
    }
    return {
      label: PROJECTION_LABELS[currentPeriod],
      data: period.sessionsData.map((_2, i6) => i6 === lastIdx ? Math.round(projExtra) : 0),
      backgroundColor: "rgba(137, 180, 250, 0.25)",
      borderColor: "rgba(137, 180, 250, 0.5)",
      borderWidth: 1
    };
  }
  function buildSessionsViewConfig(view, period, baseOptions, c4) {
    const datasets = resolveSessionsDatasets(view, period);
    const isStacked2 = !!datasets;
    const isRolling = !isStacked2 && currentDisplayMode === "rolling";
    const projDs = !isStacked2 && !isRolling ? buildSessionsProjectionDataset(period) : null;
    const showLegend = isStacked2 || !!projDs;
    const stackAxes = isStacked2 || !!projDs;
    const seriesDatasets = isStacked2 ? datasets : [buildSessionsTotalDataset(period), ...projDs ? [projDs] : []];
    return {
      type: "bar",
      data: { labels: period.labels, datasets: seriesDatasets },
      options: {
        ...baseOptions,
        plugins: { ...baseOptions.plugins, legend: { display: showLegend, position: "top", labels: { color: c4.textColor, font: { size: 12 } } }, tooltip: { ...baseOptions.plugins.tooltip, callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString()} sessions` } } },
        scales: {
          x: { stacked: stackAxes, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } },
          y: { stacked: stackAxes, type: "linear", display: true, position: "left", grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => Number(value).toLocaleString() }, title: { display: true, text: "Sessions", color: c4.textColor, font: { size: 12, weight: "bold" } } }
        }
      }
    };
  }
  function buildTotalViewConfig(period, baseOptions, c4) {
    const isRolling = currentDisplayMode === "rolling";
    const tokenData = isRolling ? computeRollingAverage(period.tokensData, ROLLING_WINDOW[currentPeriod]) : period.tokensData;
    const lastIdx = period.tokensData.length - 1;
    const projExtra = !isRolling && lastIdx >= 0 ? computeProjectionExtra(period.tokensData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
    const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.tokensData.map((_2, i6) => i6 === lastIdx ? Math.round(projExtra) : 0), backgroundColor: "rgba(54, 162, 235, 0.2)", borderColor: "rgba(54, 162, 235, 0.5)", borderWidth: 1, yAxisID: "y" }] : [];
    const rollingLabel = getRollingLabel();
    return {
      type: "bar",
      data: { labels: period.labels, datasets: [
        { label: isRolling ? rollingLabel : "Tokens", data: tokenData, backgroundColor: isRolling ? "rgba(54, 162, 235, 0.15)" : "rgba(54, 162, 235, 0.6)", borderColor: "rgba(54, 162, 235, 1)", borderWidth: isRolling ? 2 : 1, type: isRolling ? "line" : void 0, tension: isRolling ? 0.4 : void 0, fill: isRolling ? false : void 0, yAxisID: "y" },
        ...projDs,
        { label: "Sessions", data: period.sessionsData, backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1, type: "line", yAxisID: "y1" }
      ] },
      options: { ...baseOptions, scales: {
        x: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } },
        y: { stacked: true, type: "linear", display: true, position: "left", grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => Number(value).toLocaleString() }, title: { display: true, text: "Tokens", color: c4.textColor, font: { size: 12, weight: "bold" } } },
        y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false }, ticks: { color: c4.textColor, font: { size: 11 } }, title: { display: true, text: "Sessions", color: c4.textColor, font: { size: 12, weight: "bold" } } }
      } }
    };
  }
  function buildBudgetLinePlugin(monthlyBudget) {
    return {
      id: "budgetLine",
      afterDraw(ch) {
        const { ctx, chartArea, scales: { y: y3 } } = ch;
        if (!y3 || !chartArea) {
          return;
        }
        const yPos = y3.getPixelForValue(monthlyBudget);
        if (yPos < chartArea.top || yPos > chartArea.bottom) {
          return;
        }
        ctx.save();
        ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(chartArea.left, yPos);
        ctx.lineTo(chartArea.right, yPos);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Budget: $${monthlyBudget.toFixed(2)}`, chartArea.left + 6, yPos - 5);
        ctx.restore();
      }
    };
  }
  function buildCostDataset(isRolling, rollingLabel, costData) {
    return {
      label: isRolling ? `${rollingLabel} (UBB)` : "Est. Cost (UBB)",
      data: costData,
      backgroundColor: isRolling ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.6)",
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: isRolling ? 2 : 1,
      type: isRolling ? "line" : void 0,
      tension: isRolling ? 0.4 : void 0,
      fill: isRolling ? false : void 0,
      yAxisID: "y"
    };
  }
  function buildCostProviderViewConfig(period, baseOptions, c4) {
    const datasets = period.billingGroupCostDatasets ?? [];
    return {
      type: "bar",
      data: { labels: period.labels, datasets },
      options: {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: { position: "top", labels: { color: c4.textColor, font: { size: 11 } } },
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(4)}`,
              footer: (items) => {
                const total = items.reduce((sum, i6) => sum + (Number(i6.parsed.y) || 0), 0);
                return `Total: $${total.toFixed(4)}`;
              }
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } },
          y: { stacked: true, type: "linear", display: true, position: "left", grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => `$${Number(value).toFixed(2)}` }, title: { display: true, text: "Estimated Cost (USD)", color: c4.textColor, font: { size: 12, weight: "bold" } } }
        }
      }
    };
  }
  function buildCostEditorViewConfig(period, baseOptions, c4) {
    const datasets = period.editorCostDatasets ?? [];
    return {
      type: "bar",
      data: { labels: period.labels, datasets },
      options: {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: { position: "top", labels: { color: c4.textColor, font: { size: 11 } } },
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(4)}`,
              footer: (items) => {
                const total = items.reduce((sum, i6) => sum + (Number(i6.parsed.y) || 0), 0);
                return `Total: $${total.toFixed(4)}`;
              }
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } },
          y: { stacked: true, type: "linear", display: true, position: "left", grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => `$${Number(value).toFixed(2)}` }, title: { display: true, text: "Estimated Cost (USD)", color: c4.textColor, font: { size: 12, weight: "bold" } } }
        }
      }
    };
  }
  function buildCostViewConfig(period, baseOptions, c4, monthlyBudget = 0) {
    const isRolling = currentDisplayMode === "rolling";
    const costData = isRolling ? computeRollingAverage(period.costData, ROLLING_WINDOW[currentPeriod]) : period.costData;
    const lastIdx = period.costData.length - 1;
    const projExtra = !isRolling && lastIdx >= 0 ? computeProjectionExtra(period.costData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
    const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.costData.map((_2, i6) => i6 === lastIdx ? projExtra : 0), backgroundColor: "rgba(34, 197, 94, 0.2)", borderColor: "rgba(34, 197, 94, 0.5)", borderWidth: 1, yAxisID: "y" }] : [];
    const budget = monthlyBudget;
    const budgetDs = budget > 0 && currentPeriod === "month" ? [{ label: `Monthly Budget ($${budget.toFixed(2)})`, data: period.labels.map(() => budget), type: "line", borderColor: "rgba(255, 165, 0, 0.9)", borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false, yAxisID: "y" }] : [];
    const rollingLabel = getRollingLabel();
    const showBudgetLine = currentPeriod === "month" && monthlyBudget > 0;
    const budgetLinePlugin = showBudgetLine ? buildBudgetLinePlugin(monthlyBudget) : null;
    return {
      type: "bar",
      data: { labels: period.labels, datasets: [buildCostDataset(isRolling, rollingLabel, costData), ...projDs] },
      options: {
        ...baseOptions,
        plugins: { ...baseOptions.plugins, tooltip: { ...baseOptions.plugins.tooltip, callbacks: { label: (ctx) => ` $${Number(ctx.parsed.y).toFixed(4)}` } } },
        scales: { x: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } }, y: { stacked: true, type: "linear", display: true, position: "left", grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => `$${Number(value).toFixed(2)}` }, title: { display: true, text: "Estimated Cost (UBB)", color: c4.textColor, font: { size: 12, weight: "bold" } }, ...showBudgetLine ? { suggestedMax: monthlyBudget * 1.05 } : {} } }
      },
      ...budgetLinePlugin ? { plugins: [budgetLinePlugin] } : {}
    };
  }
  function buildOutputViewConfig(view, period, baseOptions, c4) {
    const locDatasets = view === "output-language" ? period.languageDatasets ?? [] : view === "output-editor" ? period.locEditorDatasets ?? [] : view === "output-repository" ? period.locRepositoryDatasets ?? [] : [
      { label: "Lines Added", data: period.linesAddedData ?? [], backgroundColor: "rgba(75, 192, 192, 0.6)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 },
      { label: "Lines Removed", data: (period.linesRemovedData ?? []).map((v2) => -v2), backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 1 }
    ];
    const stacked = view === "output-total";
    return {
      type: "bar",
      data: { labels: period.labels, datasets: locDatasets },
      options: {
        ...baseOptions,
        plugins: { ...baseOptions.plugins, legend: { position: "top", labels: { color: c4.textColor, font: { size: 11 } } }, tooltip: { ...baseOptions.plugins.tooltip, callbacks: { label: (ctx) => ` ${Math.abs(Number(ctx.parsed.y)).toLocaleString()} lines` } } },
        scales: { x: { stacked, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } }, y: { stacked, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => Math.abs(Number(value)).toLocaleString() }, title: { display: true, text: "Lines of Code", color: c4.textColor, font: { size: 12, weight: "bold" } } } }
      }
    };
  }
  function getHeatmapColor(value, maxValue) {
    if (maxValue === 0 || value === 0) {
      return "rgba(128, 128, 128, 0.06)";
    }
    const f3 = Math.log1p(value) / Math.log1p(maxValue);
    const r6 = Math.round(5 + (34 - 5) * f3);
    const g2 = Math.round(60 + (197 - 60) * f3);
    const b3 = Math.round(30 + (94 - 30) * f3);
    const a3 = (0.55 + 0.45 * f3).toFixed(2);
    return `rgba(${r6}, ${g2}, ${b3}, ${a3})`;
  }
  var HEATMAP_TOP_LANGUAGES = 10;
  function shortenDateLabel(label) {
    const m2 = /^\d{4}-(\d{2})-(\d{2})$/.exec(label);
    if (m2) {
      return `${parseInt(m2[1])}/${parseInt(m2[2])}`;
    }
    return label;
  }
  function buildLanguageHeatmap(period) {
    const datasets = period.languageDatasets ?? [];
    const withTotals = datasets.map((ds) => ({ label: ds.label, data: ds.data, total: ds.data.reduce((a3, b3) => a3 + b3, 0) })).filter((ds) => ds.total > 0).sort((a3, b3) => b3.total - a3.total);
    const topLangs = withTotals.slice(0, HEATMAP_TOP_LANGUAGES);
    const otherLangs = withTotals.slice(HEATMAP_TOP_LANGUAGES);
    if (otherLangs.length > 0) {
      const otherData = otherLangs[0].data.map((_2, i6) => otherLangs.reduce((sum, ds) => sum + ds.data[i6], 0));
      const otherTotal = otherData.reduce((a3, b3) => a3 + b3, 0);
      if (otherTotal > 0) {
        topLangs.push({ label: "Other", data: otherData, total: otherTotal });
      }
    }
    const labels = period.labels;
    const shortLabels = labels.map(shortenDateLabel);
    const wrap = el("div", "heatmap-wrap");
    if (!topLangs.length) {
      wrap.append(el("div", "heatmap-empty", "No language data for this period."));
      return wrap;
    }
    const maxValue = Math.max(...topLangs.flatMap((ds) => ds.data));
    const table = document.createElement("table");
    table.className = "heatmap-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const cornerTh = document.createElement("th");
    cornerTh.className = "heatmap-lang-header";
    headerRow.append(cornerTh);
    labels.forEach((label, i6) => {
      const th = document.createElement("th");
      th.className = "heatmap-date-header";
      const span = document.createElement("span");
      span.textContent = shortLabels[i6];
      th.title = label;
      th.append(span);
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);
    const tbody = document.createElement("tbody");
    topLangs.forEach((ds) => {
      const tr = document.createElement("tr");
      const langTd = document.createElement("td");
      langTd.className = "heatmap-lang-label";
      langTd.textContent = ds.label;
      tr.append(langTd);
      ds.data.forEach((value, i6) => {
        const td = document.createElement("td");
        td.className = "heatmap-data-cell";
        td.style.backgroundColor = getHeatmapColor(value, maxValue);
        if (value > 0) {
          td.title = `${ds.label} \xB7 ${labels[i6]}: ${value.toLocaleString()} lines`;
        }
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(tbody);
    wrap.append(table);
    return wrap;
  }
  function isHeatmapView() {
    return currentMetric === "output" && currentSplit === "language";
  }
  function refreshHeatmapView(data) {
    const canvasWrap = document.querySelector(".canvas-wrap");
    const heatmapContainer = document.getElementById("heatmap-container");
    if (!canvasWrap || !heatmapContainer) {
      return;
    }
    const show = isHeatmapView();
    canvasWrap.classList.toggle("hidden", show);
    heatmapContainer.classList.toggle("hidden", !show);
    if (show) {
      heatmapContainer.replaceChildren(buildLanguageHeatmap(getActivePeriodData(data)));
    }
  }
  function buildStackedViewConfig(view, period, baseOptions, c4) {
    const datasets = view === "model" ? period.modelDatasets : view === "repository" ? period.repositoryDatasets : view === "taskCategory" ? period.taskCategoryDatasets ?? [] : period.editorDatasets;
    const lastIdx = period.tokensData.length - 1;
    const projExtra = lastIdx >= 0 ? computeProjectionExtra(period.tokensData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
    const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.tokensData.map((_2, i6) => i6 === lastIdx ? Math.round(projExtra) : 0), backgroundColor: "rgba(200, 200, 200, 0.25)", borderColor: "rgba(200, 200, 200, 0.5)", borderWidth: 1 }] : [];
    const sessionsDs = { label: "Sessions", data: period.sessionsData, backgroundColor: "rgba(255, 99, 132, 0.6)", borderColor: "rgba(255, 99, 132, 1)", borderWidth: 2, type: "line", yAxisID: "y1", stack: void 0 };
    return {
      type: "bar",
      data: { labels: period.labels, datasets: [...datasets, ...projDs, sessionsDs] },
      options: {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: { position: "top", labels: { color: c4.textColor, font: { size: 11 } } },
          tooltip: { ...baseOptions.plugins.tooltip, callbacks: { footer: (items) => {
            if (currentSplit !== "editor") {
              return "";
            }
            if (items.some((i6) => i6?.dataset?.label === "JetBrains")) {
              return "JetBrains: estimates from user messages + assistant text only.\nActual API counts and thinking tokens are not available.";
            }
            if (items.some((i6) => i6?.dataset?.label === "Antigravity")) {
              return "Antigravity: estimates from transcript content.\nActual API counts are not stored locally.";
            }
            return "";
          } } }
        },
        scales: { ...baseOptions.scales, y: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 }, callback: (value) => Number(value).toLocaleString() }, title: { display: true, text: "Tokens", color: c4.textColor, font: { size: 12, weight: "bold" } } }, x: { stacked: true, grid: { color: c4.gridColor }, ticks: { color: c4.textColor, font: { size: 11 } } }, y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false }, ticks: { color: c4.textColor, font: { size: 11 } }, title: { display: true, text: "Sessions", color: c4.textColor, font: { size: 12, weight: "bold" } } } }
      }
    };
  }
  function resolveTokensView(split) {
    if (split === "model") {
      return "model";
    }
    if (split === "editor") {
      return "editor";
    }
    if (split === "repository") {
      return "repository";
    }
    if (split === "taskCategory") {
      return "taskCategory";
    }
    return "total";
  }
  function resolveCostView(split) {
    if (split === "editor") {
      return "cost-editor";
    }
    if (split === "provider") {
      return "cost-provider";
    }
    return "cost";
  }
  function resolveSessionsView(split) {
    if (split === "model") {
      return "sessions-model";
    }
    if (split === "editor") {
      return "sessions-editor";
    }
    if (split === "provider") {
      return "sessions-provider";
    }
    return "sessions";
  }
  function resolveChartView(metric, split) {
    if (metric === "sessions") {
      return resolveSessionsView(split);
    }
    if (metric === "tokens") {
      return resolveTokensView(split);
    }
    if (metric === "cost") {
      return resolveCostView(split);
    }
    return `output-${split}`;
  }
  function createConfig(data) {
    const period = getActivePeriodData(data);
    const view = resolveChartView(currentMetric, currentSplit);
    const c4 = getChartColors();
    const periodsReady = data.periodsReady !== false;
    const baseOptions = buildBaseOptions(c4, periodsReady);
    if (view.startsWith("sessions")) {
      return buildSessionsViewConfig(view, period, baseOptions, c4);
    }
    if (view === "total") {
      return buildTotalViewConfig(period, baseOptions, c4);
    }
    if (view === "cost") {
      return buildCostViewConfig(period, baseOptions, c4, data.monthlyBudget ?? 0);
    }
    if (view === "cost-editor") {
      return buildCostEditorViewConfig(period, baseOptions, c4);
    }
    if (view === "cost-provider") {
      return buildCostProviderViewConfig(period, baseOptions, c4);
    }
    if (view.startsWith("output-")) {
      return buildOutputViewConfig(view, period, baseOptions, c4);
    }
    return buildStackedViewConfig(view, period, baseOptions, c4);
  }
  function migrateViewKey(view) {
    const map3 = {
      total: { metric: "tokens", split: "total" },
      model: { metric: "tokens", split: "model" },
      editor: { metric: "tokens", split: "editor" },
      repository: { metric: "tokens", split: "repository" },
      cost: { metric: "cost", split: "total" }
    };
    return map3[view] ?? { metric: "tokens", split: "total" };
  }
  function restoreChartState(initialData2) {
    const saved = chartState.restore();
    if (!vscode.getState()) {
      if (initialData2.initialPeriod) {
        currentPeriod = initialData2.initialPeriod;
      }
      if (initialData2.initialTimeWindow) {
        currentTimeWindow = initialData2.initialTimeWindow;
      }
      if (initialData2.initialMetric) {
        currentMetric = initialData2.initialMetric;
      }
      if (initialData2.initialSplit) {
        currentSplit = initialData2.initialSplit;
      } else if (initialData2.initialView) {
        const m2 = migrateViewKey(initialData2.initialView);
        currentMetric = m2.metric;
        currentSplit = m2.split;
      }
      return;
    }
    currentPeriod = saved.period;
    currentTimeWindow = saved.timeWindow ?? "last30";
    currentDisplayMode = saved.displayMode;
    if (saved.view && !saved.metric) {
      const m2 = migrateViewKey(saved.view);
      currentMetric = m2.metric;
      currentSplit = m2.split;
    } else {
      currentMetric = saved.metric ?? "tokens";
      currentSplit = saved.split ?? "total";
    }
  }
  async function bootstrap() {
    await Promise.resolve().then(() => (init_vscode_button2(), vscode_button_exports));
    if (!initialData) {
      const root = document.getElementById("root");
      if (root) {
        root.textContent = "No data available.";
      }
      return;
    }
    restoreChartState(initialData);
    renderLayout(initialData);
  }
  void bootstrap();
  registerMessageHandler((message) => {
    if (message.command === "updateChartData") {
      pendingMetric = currentMetric;
      pendingSplit = currentSplit;
      pendingPeriod = currentPeriod;
      renderLayout(message.data);
    }
  });
})();
/*! Bundled license information:

@kurkle/color/dist/color.esm.js:
  (*!
   * @kurkle/color v0.3.4
   * https://github.com/kurkle/color#readme
   * (c) 2024 Jukka Kurkela
   * Released under the MIT License
   *)

chart.js/dist/chunks/helpers.dataset.js:
chart.js/dist/chart.js:
  (*!
   * Chart.js v4.5.1
   * https://www.chartjs.org
   * (c) 2025 Chart.js Contributors
   * Released under the MIT License
   *)

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=chart.js.map
