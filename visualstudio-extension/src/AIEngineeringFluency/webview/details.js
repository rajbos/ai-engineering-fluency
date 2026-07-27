"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
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
            const i6 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i6, s4);
            void 0 !== h3 && e2(this.prototype, t4, h3);
          }
        }
        static getPropertyDescriptor(t4, s4, i6) {
          const { get: e7, set: r6 } = h(this.prototype, t4) ?? { get() {
            return this[s4];
          }, set(t5) {
            this[s4] = t5;
          } };
          return { get: e7, set(s5) {
            const h3 = e7?.call(this);
            r6?.call(this, s5), this.requestUpdate(t4, h3, i6);
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
            const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
            this._$Em = t4, null == h3 ? this.removeAttribute(e7) : this.setAttribute(e7, h3), this._$Em = null;
          }
        }
        _$AK(t4, s4) {
          const i6 = this.constructor, e7 = i6._$Eh.get(t4);
          if (void 0 !== e7 && this._$Em !== e7) {
            const t5 = i6.getPropertyOptions(e7), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
            this._$Em = e7;
            const r6 = h3.fromAttribute(s4, t5.type);
            this[e7] = r6 ?? this._$Ej?.get(e7) ?? r6, this._$Em = null;
          }
        }
        requestUpdate(t4, s4, i6, e7 = false, h3) {
          if (void 0 !== t4) {
            const r6 = this.constructor;
            if (false === e7 && (h3 = this[t4]), i6 ?? (i6 = r6.getPropertyOptions(t4)), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i6)))) return;
            this.C(t4, s4, i6);
          }
          false === this.isUpdatePending && (this._$ES = this._$EP());
        }
        C(t4, s4, { useDefault: i6, reflect: e7, wrapped: h3 }, r6) {
          i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t4, s4)), true === e7 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
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
    let h3 = void 0 !== e7 ? s4._$Co?.[e7] : s4._$Cl;
    const o7 = a2(i6) ? void 0 : i6._$litDirective$;
    return h3?.constructor !== o7 && (h3?._$AO?.(false), void 0 === o7 ? h3 = void 0 : (h3 = new o7(t4), h3._$AT(t4, s4, e7)), void 0 !== e7 ? (s4._$Co ?? (s4._$Co = []))[e7] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t4, h3._$AS(t4, i6.values), h3, e7)), i6;
  }
  var t2, i3, s2, e3, h2, o3, n3, r3, l2, c3, a2, u2, d2, f2, v, _, m, p2, g, $, y2, x, b2, w, T, E, A, C, P, N, S2, R, k, H, I, L, z, Z, B, D;
  var init_lit_html = __esm({
    "node_modules/lit-html/lit-html.js"() {
      t2 = globalThis;
      i3 = (t4) => t4;
      s2 = t2.trustedTypes;
      e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
      h2 = "$lit$";
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
          l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e7.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i7 : x2);
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
              if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
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
          let h3 = P.nextNode(), o7 = 0, n5 = 0, r6 = s4[0];
          for (; void 0 !== r6; ) {
            if (o7 === r6.index) {
              let i7;
              2 === r6.type ? i7 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i7 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i7 = new Z(h3, this, t4)), this._$AV.push(i7), r6 = s4[++n5];
            }
            o7 !== r6?.index && (h3 = P.nextNode(), o7++);
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
          for (const h3 of t4) e7 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e7], s4._$AI(h3), e7++;
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
        constructor(t4, i6, s4, e7, h3) {
          this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i6, this._$AM = e7, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
        }
        _$AI(t4, i6 = this, s4, e7) {
          const h3 = this.strings;
          let o7 = false;
          if (void 0 === h3) t4 = M(this, t4, i6, 0), o7 = !a2(t4) || t4 !== this._$AH && t4 !== E, o7 && (this._$AH = t4);
          else {
            const e8 = t4;
            let n5, r6;
            for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e8[s4 + n5], i6, n5), r6 === E && (r6 = this._$AH[n5]), o7 || (o7 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
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
        constructor(t4, i6, s4, e7, h3) {
          super(t4, i6, s4, e7, h3), this.type = 5;
        }
        _$AI(t4, i6 = this) {
          if ((t4 = M(this, t4, i6, 0) ?? A) === E) return;
          const s4 = this._$AH, e7 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e7);
          e7 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
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
        let h3 = e7._$litPart$;
        if (void 0 === h3) {
          const t5 = s4?.renderBefore ?? null;
          e7._$litPart$ = h3 = new k(i6.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
        }
        return h3._$AI(t4), h3;
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

  // node_modules/@vscode-elements/elements/dist/vscode-badge/vscode-badge.styles.js
  var defaultFontStack2, styles3, vscode_badge_styles_default;
  var init_vscode_badge_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-badge/vscode-badge.styles.js"() {
      init_lit();
      init_default_styles();
      init_helpers();
      defaultFontStack2 = r(getDefaultFontStack());
      styles3 = [
        default_styles_default,
        i`
    :host {
      display: inline-block;
    }

    .root {
      background-color: var(--vscode-badge-background, #616161);
      border: 1px solid var(--vscode-contrastBorder, transparent);
      border-radius: 2px;
      box-sizing: border-box;
      color: var(--vscode-badge-foreground, #f8f8f8);
      display: block;
      font-family: var(--vscode-font-family, ${defaultFontStack2});
      font-size: 11px;
      font-weight: 400;
      line-height: 14px;
      min-width: 18px;
      padding: 2px 3px;
      text-align: center;
      white-space: nowrap;
    }

    :host([variant='counter']) .root {
      border-radius: 11px;
      line-height: 11px;
      min-height: 18px;
      min-width: 18px;
      padding: 3px 6px;
    }

    :host([variant='activity-bar-counter']) .root {
      background-color: var(--vscode-activityBarBadge-background, #0078d4);
      border-radius: 20px;
      color: var(--vscode-activityBarBadge-foreground, #ffffff);
      font-size: 9px;
      font-weight: 600;
      line-height: 16px;
      padding: 0 4px;
    }

    :host([variant='tab-header-counter']) .root {
      background-color: var(--vscode-activityBarBadge-background, #0078d4);
      border-radius: 10px;
      color: var(--vscode-activityBarBadge-foreground, #ffffff);
      line-height: 10px;
      min-height: 16px;
      min-width: 16px;
      padding: 3px 5px;
    }
  `
      ];
      vscode_badge_styles_default = styles3;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-badge/vscode-badge.js
  var __decorate3, VscodeBadge;
  var init_vscode_badge = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-badge/vscode-badge.js"() {
      init_lit();
      init_decorators();
      init_VscElement();
      init_vscode_badge_styles();
      __decorate3 = function(decorators, target, key, desc) {
        var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
        else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
        return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
      };
      VscodeBadge = class VscodeBadge2 extends VscElement {
        constructor() {
          super(...arguments);
          this.variant = "default";
        }
        render() {
          return b2`<div class="root"><slot></slot></div>`;
        }
      };
      VscodeBadge.styles = vscode_badge_styles_default;
      __decorate3([
        n4({ reflect: true })
      ], VscodeBadge.prototype, "variant", void 0);
      VscodeBadge = __decorate3([
        customElement("vscode-badge")
      ], VscodeBadge);
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-badge/index.js
  var vscode_badge_exports = {};
  __export(vscode_badge_exports, {
    VscodeBadge: () => VscodeBadge
  });
  var init_vscode_badge2 = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-badge/index.js"() {
      init_vscode_badge();
    }
  });

  // ../src/webview/shared/dataLoader.ts
  function getWindowData(key) {
    const win = globalThis.window;
    return win ? win[key] : void 0;
  }

  // ../src/webview/shared/modelUtils.ts
  var _pricingData = getWindowData("__MODEL_PRICING__");
  var _modelNames = {};
  for (const [modelId, pricing] of Object.entries(_pricingData?.pricing ?? {})) {
    if (pricing.displayNames && pricing.displayNames.length > 0) {
      _modelNames[modelId] = pricing.displayNames[0];
    }
  }
  function getModelDisplayName(model) {
    if (_modelNames[model]) {
      return _modelNames[model];
    }
    try {
      return decodeURIComponent(model);
    } catch {
      return model;
    }
  }

  // src/editorIcons.ts
  var EDITOR_ICON_MAP = {
    "Antigravity": "\u{1F680}",
    "Claude Code": "\u{1F7E0}",
    "Claude Code CLI": "\u{1F7E0}",
    "Claude Desktop": "\u{1F7E0}",
    "Claude Desktop Cowork": "\u{1F7E0}",
    "Cline": "\u{1F916}",
    "Codex CLI": "\u{1F300}",
    "Continue": "\u25B6\uFE0F",
    "Copilot CLI": "\u{1F916}",
    "Copilot CLI (App)": "\u{1F916}",
    "Crush": "\u{1F9BE}",
    "Cursor": "\u{1F5B1}\uFE0F",
    "Devin": "\u{1F9E0}",
    "Devin CLI": "\u{1F9E0}",
    "Eclipse": "\u{1F311}",
    "Gemini CLI": "\u{1F48E}",
    "Hermes": "\u{1FABD}",
    "JetBrains": "\u{1F9E9}",
    "Kiro": "\u{1F47B}",
    "Kiro CLI": "\u{1F47B}",
    "Mistral Vibe": "\u{1F525}",
    "MS Scout (Copilot CLI)": "\u{1F52D}",
    "OpenCode": "\u{1F7E2}",
    "Pi": "\u03C0",
    "Unknown": "\u2753",
    "Visual Studio": "\u{1FA9F}",
    "VS Code": "\u{1F499}",
    "VS Code Exploration": "\u{1F9EA}",
    "VS Code Insiders": "\u{1F49A}",
    "VS Code Server": "\u2601\uFE0F",
    "VS Code Server (Insiders)": "\u2601\uFE0F",
    "VSCodium": "\u{1F537}",
    "Windsurf": "\u{1F3C4}"
  };
  function getEditorIconByName(editor) {
    return EDITOR_ICON_MAP[editor] ?? "\u{1F4DD}";
  }

  // src/webview/shared/formatUtils.ts
  var _estimatorsData = getWindowData("__TOKEN_ESTIMATORS__");
  var tokenEstimators = _estimatorsData?.estimators ?? {};
  var currentLocale;
  var compactNumbersEnabled = true;
  function setCompactNumbers(enabled) {
    compactNumbersEnabled = enabled;
  }
  function getEditorIcon(editor) {
    return getEditorIconByName(editor);
  }
  function getCharsPerToken(model) {
    const ratio = tokenEstimators[model] ?? 0.25;
    return 1 / ratio;
  }
  function formatFixed(value, digits) {
    return new Intl.NumberFormat(currentLocale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value);
  }
  function formatPercent(value, digits = 1) {
    return `${formatFixed(value, digits)}%`;
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
  function formatCost(value) {
    return new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

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

  // src/webview/details/styles.css
  var styles_default = "body {\n	margin: 0;\n	background: var(--bg-primary);\n	color: var(--text-primary);\n	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n\n.container {\n	padding: 16px;\n	display: flex;\n	flex-direction: column;\n	gap: 14px;\n	max-width: 1200px;\n	margin: 0 auto;\n}\n\n.header {\n	display: flex;\n	justify-content: space-between;\n	align-items: center;\n	gap: 12px;\n	padding-bottom: 4px;\n}\n\n.header-left {\n	display: flex;\n	flex-direction: column;\n	gap: 4px;\n}\n\n.title {\n	display: flex;\n	align-items: center;\n	gap: 8px;\n	font-size: 16px;\n	font-weight: 700;\n	color: var(--text-primary);\n}\n\n.plan-badge {\n	display: inline-flex;\n	align-items: center;\n	gap: 4px;\n	align-self: flex-start;\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-subtle);\n	border-radius: 999px;\n	padding: 2px 10px;\n	font-size: 11px;\n	color: var(--text-secondary);\n	cursor: help;\n}\n\n.provider-panel-hint {\n	color: var(--text-secondary);\n	font-size: 11px;\n	margin: -4px 0 10px;\n}\n\n.provider-cards {\n	display: grid;\n	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n	gap: 10px;\n	text-align: center;\n}\n\n.provider-card {\n	background: var(--bg-secondary);\n	border: 1px solid var(--border-color);\n	border-radius: 10px;\n	padding: 12px;\n	box-shadow: 0 4px 10px var(--shadow-color);\n	text-align: center;\n	cursor: pointer;\n	transition: background-color 0.1s ease, opacity 0.1s ease;\n}\n\n.provider-card:hover {\n	background: var(--list-hover-bg);\n}\n\n.provider-card-excluded {\n	opacity: 0.45;\n}\n\n.provider-card-total {\n	cursor: default;\n	border-style: dashed;\n}\n\n.provider-card-total:hover {\n	background: var(--bg-secondary);\n}\n\n.provider-card-label {\n	color: var(--text-secondary);\n	font-size: 11px;\n	margin-bottom: 6px;\n}\n\n.provider-card-value {\n	color: var(--text-primary);\n	font-size: 18px;\n	font-weight: 700;\n}\n\n.provider-card-sub {\n	color: var(--text-secondary);\n	font-size: 10px;\n	margin-top: 4px;\n}\n\n.no-data-row td {\n	text-align: center;\n	color: var(--text-secondary);\n	font-size: 12px;\n	padding: 14px;\n	font-style: italic;\n}\n\n.sections {\n	display: flex;\n	flex-direction: column;\n	gap: 16px;\n}\n\n.section {\n	background: var(--bg-secondary);\n	border: 1px solid var(--border-color);\n	border-radius: 10px;\n	padding: 12px;\n	box-shadow: 0 4px 10px var(--shadow-color);\n}\n\n.section h3 {\n	margin: 0 0 10px;\n	font-size: 14px;\n	display: flex;\n	align-items: center;\n	gap: 6px;\n	color: var(--text-primary);\n	letter-spacing: 0.2px;\n}\n\n.stats-table {\n	width: 100%;\n	border-collapse: collapse;\n	table-layout: fixed;\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-subtle);\n	border-radius: 8px;\n	overflow: hidden;\n}\n\n.stats-table thead {\n	background: var(--list-hover-bg);\n}\n\n.stats-table th,\n.stats-table td {\n	padding: 10px 12px;\n	border-bottom: 1px solid var(--border-subtle);\n	vertical-align: middle;\n}\n\n.stats-table th {\n	text-align: left;\n	color: var(--text-secondary);\n	font-weight: 700;\n	font-size: 12px;\n	letter-spacing: 0.1px;\n}\n\n.stats-table td {\n	color: var(--text-primary);\n	font-size: 12px;\n}\n\n.stats-table th.align-right,\n.stats-table td.align-right {\n	text-align: right;\n}\n\n.stats-table tr.group-row td {\n	background: var(--list-hover-bg);\n	color: var(--text-secondary);\n	font-size: 12px;\n	font-weight: 700;\n	text-transform: uppercase;\n	letter-spacing: 1px;\n	padding: 8px 12px;\n	border-top: 1px solid var(--border-color);\n	border-bottom: 1px solid var(--border-color);\n}\n\n/* First group sits right under the table header, no extra top rule needed */\n.stats-table tbody tr.group-row:first-child td {\n	border-top: none;\n}\n\n.metric-label {\n	display: inline-flex;\n	align-items: center;\n	gap: 6px;\n	font-weight: 600;\n}\n\n.period-header {\n	display: flex;\n	align-items: center;\n	gap: 4px;\n	color: var(--text-secondary);\n}\n\n.align-right .period-header {\n	justify-content: flex-end;\n}\n\n.value-right {\n	text-align: right;\n}\n\n.muted {\n	color: var(--text-muted);\n	font-size: 11px;\n	margin-top: 4px;\n}\n\n.notes {\n	margin: 4px 0 0;\n	padding-left: 16px;\n	color: var(--text-secondary);\n}\n\n.notes li {\n	margin: 4px 0;\n	line-height: 1.4;\n}\n\n.footer {\n	color: var(--text-muted);\n	font-size: 11px;\n	margin-top: 6px;\n}\n\n.empty-state {\n	display: flex;\n	flex-direction: column;\n	gap: 12px;\n	padding: 20px;\n}\n\n.empty-state-title {\n	font-size: 15px;\n	font-weight: 700;\n	color: var(--text-primary);\n}\n\n.empty-state-description {\n	color: var(--text-secondary);\n	font-size: 13px;\n	line-height: 1.5;\n	margin: 0;\n}\n\n.empty-state-steps {\n	margin: 0;\n	padding-left: 20px;\n	color: var(--text-secondary);\n	font-size: 13px;\n	line-height: 1.6;\n}\n\n.empty-state-steps li {\n	margin: 4px 0;\n}\n\n.empty-state-note {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-subtle);\n	border-radius: 6px;\n	padding: 10px 14px;\n	color: var(--text-secondary);\n	font-size: 12px;\n	line-height: 1.5;\n}\n";

  // src/webview/shared/messageHandler.ts
  function registerMessageHandler(handler) {
    window.addEventListener("message", (event) => {
      handler(event.data);
    });
  }

  // ../src/statsHelpers.ts
  var COPILOT_EDITOR_NAMES = /* @__PURE__ */ new Set([
    "VS Code",
    "VS Code Insiders",
    "VS Code Exploration",
    "VS Code Server",
    "VS Code Server (Insiders)",
    "VSCodium",
    "Visual Studio",
    "JetBrains",
    "Copilot CLI",
    "Copilot CLI (App)",
    "MS Scout (Copilot CLI)"
  ]);

  // ../src/chartDataBuilder.ts
  var MODEL_PROVIDER_PREFIXES = [
    ["anthropic", "Anthropic"],
    ["claude", "Anthropic"],
    ["codestral", "Mistral AI"],
    ["devstral", "Mistral AI"],
    ["gemini", "Google"],
    ["goldeneye", "xAI"],
    ["google", "Google"],
    ["gpt", "OpenAI"],
    ["grok", "xAI"],
    ["magistral", "Mistral AI"],
    ["mai-", "Microsoft"],
    ["ministral", "Mistral AI"],
    ["mistral", "Mistral AI"],
    ["o1", "OpenAI"],
    ["o3", "OpenAI"],
    ["o4", "OpenAI"],
    ["pixtral", "Mistral AI"],
    ["qwen", "Alibaba"],
    ["raptor", "xAI"]
  ];
  function getModelBillingProvider(modelId) {
    const id = modelId.toLowerCase();
    const match = MODEL_PROVIDER_PREFIXES.find(([prefix]) => id.startsWith(prefix));
    return match ? match[1] : "Other";
  }
  function getBillingGroup(editor, modelId) {
    if (COPILOT_EDITOR_NAMES.has(editor)) {
      return "GitHub Copilot";
    }
    return getModelBillingProvider(modelId);
  }

  // src/webview/details/main.ts
  var vscode = acquireVsCodeApi();
  var initialData = getWindowData("__INITIAL_DETAILS__");
  console.log("[CopilotTokenTracker] details webview loaded");
  console.log("[CopilotTokenTracker] initialData:", initialData);
  console.log("[CopilotTokenTracker] initialData:", initialData);
  var _initSort = initialData?.sortSettings;
  var editorSortKey = _initSort?.editor?.key ?? "name";
  var editorSortDir = _initSort?.editor?.dir ?? "asc";
  var modelSortKey = _initSort?.model?.key ?? "name";
  var modelSortDir = _initSort?.model?.dir ?? "asc";
  var modelOtherExpanded = _initSort?.modelOtherExpanded ?? false;
  var editorOtherExpanded = _initSort?.editorOtherExpanded ?? false;
  var excludedProviders = new Set(_initSort?.excludedProviders ?? []);
  var lastStats = null;
  function calculateProjection(last30DaysValue) {
    const daysInYear = 365.25;
    return last30DaysValue / 30 * daysInYear;
  }
  function buildValueCell(mainValue, subText) {
    const td = document.createElement("td");
    td.className = "value-right align-right";
    td.textContent = mainValue;
    if (subText !== void 0) {
      td.append(el("div", "muted", subText));
    }
    return td;
  }
  function buildMetricLabelCell(icon, label, color, tooltip) {
    const td = document.createElement("td");
    const labelWrapper = document.createElement("span");
    labelWrapper.className = "metric-label";
    const iconSpan = document.createElement("span");
    iconSpan.textContent = icon;
    if (color) {
      iconSpan.style.color = color;
    }
    const textSpan = document.createElement("span");
    textSpan.textContent = label;
    if (tooltip) {
      labelWrapper.title = tooltip;
      labelWrapper.style.cursor = "help";
      const hintSpan = document.createElement("span");
      hintSpan.textContent = " \u2139\uFE0F";
      hintSpan.style.cssText = "font-size:0.75em; opacity:0.6;";
      textSpan.append(hintSpan);
    }
    labelWrapper.append(iconSpan, textSpan);
    td.append(labelWrapper);
    return td;
  }
  function buildSortableTableHeader(columns, getSortKey, getSortDir, onSort) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const wraps = [];
    function updateHeaders() {
      wraps.forEach((w2, i6) => {
        w2.textContent = `${columns[i6].icon} ${columns[i6].text}${getSortIndicator(columns[i6].key, getSortKey(), getSortDir())}`;
      });
    }
    columns.forEach((h3, idx) => {
      const th = document.createElement("th");
      th.className = idx === 0 ? "" : "align-right";
      th.style.cursor = "pointer";
      th.style.userSelect = "none";
      th.title = `Sort by ${h3.text}`;
      const wrap = el("div", "period-header");
      wrap.textContent = `${h3.icon} ${h3.text}${getSortIndicator(h3.key, getSortKey(), getSortDir())}`;
      th.append(wrap);
      wraps.push(wrap);
      th.addEventListener("click", () => {
        onSort(h3.key);
        updateHeaders();
      });
      headerRow.append(th);
    });
    thead.append(headerRow);
    return { thead, updateHeaders };
  }
  function render(stats) {
    setCompactNumbers(stats.compactNumbers !== false);
    lastStats = stats;
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const allProviders = getAllProviders(stats);
    const projectedTokens = Math.round(calculateProjection(stats.last30Days.tokens + stats.last30Days.thinkingTokens));
    const projectedSessions = Math.round(calculateProjection(stats.last30Days.sessions));
    const projectedCo2 = calculateProjection(stats.last30Days.co2);
    const projectedWater = calculateProjection(stats.last30Days.waterUsage);
    const projectedCost = calculateProjection(totalCostForPeriod(stats.last30Days, allProviders));
    const projectedCostCopilot = calculateProjection(stats.last30Days.estimatedCostCopilot ?? 0);
    const projectedTrees = calculateProjection(stats.last30Days.treesEquivalent);
    renderShell(root, stats, {
      projectedTokens,
      projectedSessions,
      projectedCo2,
      projectedWater,
      projectedCost,
      projectedCostCopilot,
      projectedTrees
    });
    wireButtons();
  }
  function rerenderFromLastStats() {
    if (lastStats) {
      render(lastStats);
    }
  }
  function renderShell(root, stats, projections) {
    const lastUpdated = new Date(stats.lastUpdated);
    root.replaceChildren();
    const themeStyle = document.createElement("style");
    themeStyle.textContent = theme_default;
    const style = document.createElement("style");
    style.textContent = styles_default;
    const container = el("div", "container");
    const header = el("div", "header");
    const headerLeft = el("div", "header-left");
    headerLeft.append(el("div", "title", "AI Engineering Fluency"));
    const planBadge = buildPlanBadge(stats);
    if (planBadge) {
      headerLeft.append(planBadge);
    }
    const buttonRow = el("div", "button-row");
    buttonRow.append(...getNavButtons("btn-details", !!stats.backendConfigured).map((config) => createButton(config)));
    header.append(headerLeft, buttonRow);
    const footer = el("div", "footer", `Last updated: ${lastUpdated.toLocaleString()} \xB7 Updates every 5 minutes`);
    const sections = el("div", "sections");
    const isEmptyState = (stats.today.tokens ?? 0) === 0 && (stats.last30Days.tokens ?? 0) === 0 && (stats.lastMonth.tokens ?? 0) === 0;
    if (isEmptyState) {
      sections.append(buildEmptyStateSection());
    } else {
      const providerPanel = buildProviderPanel(stats);
      if (providerPanel) {
        sections.append(providerPanel);
      }
    }
    sections.append(buildMetricsSection(stats, projections));
    const editorSection = buildEditorUsageSection(stats);
    if (editorSection) {
      sections.append(editorSection);
    }
    const modelSection = buildModelUsageSection(stats);
    if (modelSection) {
      sections.append(modelSection);
    }
    container.append(header, sections, footer);
    root.append(themeStyle, style, container);
  }
  function sumInputTokens(p3) {
    return Object.values(p3.modelUsage).reduce((s4, m2) => s4 + m2.inputTokens, 0);
  }
  function sumOutputTokens(p3) {
    return Object.values(p3.modelUsage).reduce((s4, m2) => s4 + m2.outputTokens, 0);
  }
  function hasActualTokens(p3) {
    return (p3.actualTokens || 0) > 0;
  }
  function serviceOverheadPct(p3) {
    return hasActualTokens(p3) ? formatPercent((p3.actualTokens - p3.estimatedTokens) / p3.actualTokens * 100) : "\u2014";
  }
  function inputTokenCell(p3) {
    return hasActualTokens(p3) ? formatCompact(sumInputTokens(p3)) : "\u2014";
  }
  function outputTokenCell(p3) {
    return hasActualTokens(p3) ? formatCompact(sumOutputTokens(p3)) : "\u2014";
  }
  function totalTokenCell(p3) {
    const modelTotal = sumInputTokens(p3) + sumOutputTokens(p3);
    if ((p3.actualTokens ?? 0) > 0) {
      return formatCompact(p3.tokens + p3.thinkingTokens);
    }
    return formatCompact(modelTotal > 0 ? modelTotal : p3.tokens);
  }
  function buildCachedTokenRow(stats) {
    if (!(stats.today.cachedTokens || stats.last30Days.cachedTokens || stats.month.cachedTokens || stats.lastMonth.cachedTokens)) {
      return [];
    }
    return [{ label: "Cached tokens", labelTooltip: 'Cache-read tokens \u2014 already included in "Input tokens" above, shown separately because they are billed at a lower rate.', icon: "\u26A1", color: "#34d399", today: formatCompact(stats.today.cachedTokens || 0), last30Days: formatCompact(stats.last30Days.cachedTokens || 0), month: formatCompact(stats.month.cachedTokens || 0), lastMonth: formatCompact(stats.lastMonth.cachedTokens || 0), projected: "\u2014" }];
  }
  function buildPlanBadge(stats) {
    if (!stats.copilotPlan) {
      return null;
    }
    const plan = stats.copilotPlan;
    const credits = plan.monthlyAiCreditsUsd > 0 ? `$${plan.monthlyAiCreditsUsd} credits/month` : "no credits";
    const badge = el("div", "plan-badge", `\u{1F3F7}\uFE0F ${plan.planName} \xB7 ${credits}`);
    badge.title = `Your active GitHub Copilot subscription plan (ID: ${plan.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`;
    return badge;
  }
  function buildMetricsGroups(stats, projections) {
    const allProviders = getAllProviders(stats);
    const tokenRows = [
      { label: "Total tokens", labelTooltip: "All LLM API tokens counted across every call in this period \u2014 matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.", icon: "\u{1F7E3}", color: "#c37bff", today: totalTokenCell(stats.today), last30Days: totalTokenCell(stats.last30Days), month: totalTokenCell(stats.month), lastMonth: totalTokenCell(stats.lastMonth), projected: formatCompact(projections.projectedTokens) },
      { label: "Input tokens", labelTooltip: "Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).", icon: "\u2B06\uFE0F", color: "#c37bff", today: inputTokenCell(stats.today), last30Days: inputTokenCell(stats.last30Days), month: inputTokenCell(stats.month), lastMonth: inputTokenCell(stats.lastMonth), projected: "\u2014" },
      { label: "Output tokens", icon: "\u2B07\uFE0F", color: "#c37bff", today: outputTokenCell(stats.today), last30Days: outputTokenCell(stats.last30Days), month: outputTokenCell(stats.month), lastMonth: outputTokenCell(stats.lastMonth), projected: "\u2014" },
      ...buildCachedTokenRow(stats),
      { label: "Tokens (user estimated)", icon: "\u{1F4DD}", color: "#b39ddb", today: formatCompact(stats.today.estimatedTokens), last30Days: formatCompact(stats.last30Days.estimatedTokens), month: formatCompact(stats.month.estimatedTokens), lastMonth: formatCompact(stats.lastMonth.estimatedTokens), projected: "\u2014" },
      { label: "Service overhead %", icon: "\u2601\uFE0F", color: "#90a4ae", today: serviceOverheadPct(stats.today), last30Days: serviceOverheadPct(stats.last30Days), month: serviceOverheadPct(stats.month), lastMonth: serviceOverheadPct(stats.lastMonth), projected: "\u2014" },
      { label: "Thinking tokens", icon: "\u{1F9E0}", color: "#a78bfa", today: formatCompact(stats.today.thinkingTokens || 0), last30Days: formatCompact(stats.last30Days.thinkingTokens || 0), month: formatCompact(stats.month.thinkingTokens || 0), lastMonth: formatCompact(stats.lastMonth.thinkingTokens || 0), projected: "\u2014" }
    ];
    const costRows = [
      { label: "Estimated cost (selected providers)", labelTooltip: "Sum of estimated cost across the providers selected in the Cost by Provider filter below \u2014 GitHub Copilot uses UBB AI Credit rates, other providers use their own API pricing.", icon: "\u{1F4B5}", color: "#7ce38b", today: formatCost(totalCostForPeriod(stats.today, allProviders)), last30Days: formatCost(totalCostForPeriod(stats.last30Days, allProviders)), month: formatCost(totalCostForPeriod(stats.month, allProviders)), lastMonth: formatCost(totalCostForPeriod(stats.lastMonth, allProviders)), projected: formatCost(projections.projectedCost) },
      { label: "Estimated cost (GitHub Copilot UBB)", labelTooltip: "Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.", icon: "\u{1F7E2}", color: "#7ce38b", today: formatCost(stats.today.estimatedCostCopilot ?? 0), last30Days: formatCost(stats.last30Days.estimatedCostCopilot ?? 0), month: formatCost(stats.month.estimatedCostCopilot ?? 0), lastMonth: formatCost(stats.lastMonth.estimatedCostCopilot ?? 0), projected: formatCost(projections.projectedCostCopilot ?? 0) }
    ];
    const activityRows = [
      { label: "Sessions", icon: "\u{1F4C2}", color: "#66aaff", today: formatNumber(stats.today.sessions), last30Days: formatNumber(stats.last30Days.sessions), month: formatNumber(stats.month.sessions), lastMonth: formatNumber(stats.lastMonth.sessions), projected: formatNumber(projections.projectedSessions) },
      { label: "Average interactions/session", icon: "\u{1F4AC}", color: "#8ce0ff", today: formatNumber(stats.today.avgInteractionsPerSession), last30Days: formatNumber(stats.last30Days.avgInteractionsPerSession), month: formatNumber(stats.month.avgInteractionsPerSession), lastMonth: formatNumber(stats.lastMonth.avgInteractionsPerSession), projected: "\u2014" },
      { label: "Average tokens/session", icon: "\u{1F522}", color: "#7ce38b", today: formatCompact(stats.today.avgTokensPerSession), last30Days: formatCompact(stats.last30Days.avgTokensPerSession), month: formatCompact(stats.month.avgTokensPerSession), lastMonth: formatCompact(stats.lastMonth.avgTokensPerSession), projected: "\u2014" }
    ];
    return [
      { heading: "\u{1F522} Tokens", rows: tokenRows },
      { heading: "\u{1F4B0} Cost", rows: costRows },
      { heading: "\u{1F4AC} Activity", rows: activityRows }
    ];
  }
  function buildGroupHeaderRow(label) {
    const tr = document.createElement("tr");
    tr.className = "group-row";
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = label;
    tr.append(td);
    return tr;
  }
  function buildNoDataRow(colSpan, message) {
    const tr = document.createElement("tr");
    tr.className = "no-data-row";
    const td = document.createElement("td");
    td.colSpan = colSpan;
    td.textContent = message;
    tr.append(td);
    return tr;
  }
  function buildMetricsSection(stats, projections) {
    const section = el("div", "section");
    section.append(iconHeading("h3", "graph", "Key Metrics"));
    const table = document.createElement("table");
    table.className = "stats-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const HEADERS = [{ icon: "\u{1F4CA}", text: "Metric" }, { icon: "\u{1F4C5}", text: "Today" }, { icon: "\u{1F4C8}", text: "Last 30 Days" }, { icon: "\u{1F5D3}\uFE0F", text: "Current Month" }, { icon: "\u{1F4C6}", text: "Previous Month" }, { icon: "\u{1F30D}", text: "Projected Year" }];
    HEADERS.forEach((h3, idx) => {
      const th = document.createElement("th");
      th.className = idx === 0 ? "" : "align-right";
      const wrap = el("div", "period-header");
      wrap.textContent = `${h3.icon} ${h3.text}`;
      th.append(wrap);
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);
    const tbody = document.createElement("tbody");
    buildMetricsGroups(stats, projections).forEach((group) => {
      tbody.append(buildGroupHeaderRow(group.heading));
      group.rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.append(buildMetricLabelCell(row.icon, row.label, row.color, row.labelTooltip), buildValueCell(row.today), buildValueCell(row.last30Days), buildValueCell(row.month), buildValueCell(row.lastMonth), buildValueCell(row.projected));
        tbody.append(tr);
      });
    });
    table.append(tbody);
    section.append(table);
    return section;
  }
  var PROVIDER_ICONS = {
    "GitHub Copilot": "\u{1F419}",
    "Anthropic": "\u{1F170}\uFE0F",
    "Google": "\u{1F537}",
    "OpenAI": "\u{1F7E2}",
    "Mistral AI": "\u{1F32C}\uFE0F",
    "xAI": "\u2716\uFE0F",
    "Microsoft": "\u{1FA9F}",
    "Alibaba": "\u{1F409}",
    "Other": "\u2754"
  };
  function getProviderIcon(provider) {
    return PROVIDER_ICONS[provider] ?? "\u{1F4B5}";
  }
  function buildProviderCard(stats, provider) {
    const isExcluded = excludedProviders.has(provider);
    const card = el("div", `provider-card${isExcluded ? " provider-card-excluded" : ""}`);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", String(!isExcluded));
    card.title = isExcluded ? `${provider} is hidden \u2014 click to show it again and include it in the totals below.` : `Click to hide ${provider} \u2014 filters it out of the totals and the Editor/Model usage lists below.`;
    card.append(
      el("div", "provider-card-label", `${getProviderIcon(provider)} ${provider}`),
      el("div", "provider-card-value", formatCost(stats.month.billingGroupCosts?.[provider] || 0)),
      el("div", "provider-card-sub", "Cost this month")
    );
    const toggle = () => {
      if (excludedProviders.has(provider)) {
        excludedProviders.delete(provider);
      } else {
        excludedProviders.add(provider);
      }
      saveSortSettings();
      rerenderFromLastStats();
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e7) => {
      if (e7.key === "Enter" || e7.key === " ") {
        e7.preventDefault();
        toggle();
      }
    });
    return card;
  }
  function buildProviderTotalCard(stats, allProviders) {
    const included = includedProviders(allProviders);
    const card = el("div", "provider-card provider-card-total");
    card.title = `Sum of ${included.length} of ${allProviders.length} selected provider(s).`;
    card.append(
      el("div", "provider-card-label", "\u2211 Total (selected)"),
      el("div", "provider-card-value", formatCost(sumBillingGroupCosts(stats.month.billingGroupCosts, included))),
      el("div", "provider-card-sub", "Cost this month")
    );
    return card;
  }
  function buildProviderPanel(stats) {
    const allProviders = getAllProviders(stats);
    if (allProviders.length <= 1) {
      return null;
    }
    const section = el("div", "section");
    section.append(iconHeading("h3", "credit-card", "Cost by Provider"));
    section.append(el("div", "provider-panel-hint", "Click a provider to hide/show it \u2014 this also filters the Editor & Model usage lists below."));
    const grid = el("div", "provider-cards");
    grid.append(buildProviderTotalCard(stats, allProviders));
    allProviders.forEach((provider) => grid.append(buildProviderCard(stats, provider)));
    section.append(grid);
    return section;
  }
  function getSortIndicator(colKey, activeKey, dir) {
    if (colKey !== activeKey) {
      return " \u2195";
    }
    return dir === "asc" ? " \u2191" : " \u2193";
  }
  function saveSortSettings() {
    vscode.postMessage({
      command: "saveSortSettings",
      settings: {
        editor: { key: editorSortKey, dir: editorSortDir },
        model: { key: modelSortKey, dir: modelSortDir },
        modelOtherExpanded,
        editorOtherExpanded,
        excludedProviders: Array.from(excludedProviders)
      }
    });
  }
  var ALL_PERIODS = ["today", "last30Days", "month", "lastMonth"];
  function getAllProviders(stats) {
    const set = /* @__PURE__ */ new Set();
    ALL_PERIODS.forEach((period) => {
      Object.keys(stats[period].billingGroupCosts ?? {}).forEach((p3) => set.add(p3));
    });
    return Array.from(set).sort((a3, b3) => {
      if (a3 === "GitHub Copilot") {
        return -1;
      }
      if (b3 === "GitHub Copilot") {
        return 1;
      }
      return a3.localeCompare(b3);
    });
  }
  function includedProviders(allProviders) {
    return allProviders.filter((p3) => !excludedProviders.has(p3));
  }
  function sumBillingGroupCosts(billingGroupCosts, providers) {
    if (!billingGroupCosts) {
      return 0;
    }
    return providers.reduce((s4, p3) => s4 + (billingGroupCosts[p3] || 0), 0);
  }
  function totalCostForPeriod(period, allProviders) {
    if (allProviders.length === 0) {
      return period.estimatedCostCopilot ?? period.estimatedCost ?? 0;
    }
    return sumBillingGroupCosts(period.billingGroupCosts, includedProviders(allProviders));
  }
  function editorBillingGroups(stats, editor) {
    const groups = /* @__PURE__ */ new Set();
    ALL_PERIODS.forEach((period) => {
      const modelUsage = stats[period].editorModelUsage?.[editor];
      if (modelUsage) {
        Object.keys(modelUsage).forEach((model) => groups.add(getBillingGroup(editor, model)));
      }
    });
    return groups;
  }
  function modelBillingGroups(stats, model) {
    const groups = /* @__PURE__ */ new Set();
    ALL_PERIODS.forEach((period) => {
      const editorModelUsage = stats[period].editorModelUsage;
      if (!editorModelUsage) {
        return;
      }
      Object.keys(editorModelUsage).forEach((editor) => {
        if (editorModelUsage[editor][model]) {
          groups.add(getBillingGroup(editor, model));
        }
      });
    });
    return groups;
  }
  function isVisibleForProviderFilter(groups) {
    if (excludedProviders.size === 0) {
      return true;
    }
    if (groups.size === 0) {
      return true;
    }
    return Array.from(groups).some((g2) => !excludedProviders.has(g2));
  }
  function toEditorItem(stats, editor) {
    const todayUsage = stats.today.editorUsage[editor] || { tokens: 0, sessions: 0 };
    const last30DaysUsage = stats.last30Days.editorUsage[editor] || { tokens: 0, sessions: 0 };
    const monthUsage = stats.month.editorUsage[editor] || { tokens: 0, sessions: 0 };
    const lastMonthUsage = stats.lastMonth.editorUsage[editor] || { tokens: 0, sessions: 0 };
    return { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens: Math.round(calculateProjection(last30DaysUsage.tokens)), projectedSessions: Math.round(calculateProjection(last30DaysUsage.sessions)) };
  }
  function toOtherEditorItem(stats, otherEditors) {
    const sumUsage = (period) => otherEditors.reduce((acc, e7) => {
      const u3 = stats[period].editorUsage[e7] || { tokens: 0, sessions: 0 };
      return { tokens: acc.tokens + u3.tokens, sessions: acc.sessions + u3.sessions };
    }, { tokens: 0, sessions: 0 });
    const todayUsage = sumUsage("today");
    const last30DaysUsage = sumUsage("last30Days");
    const monthUsage = sumUsage("month");
    const lastMonthUsage = sumUsage("lastMonth");
    return {
      editor: `Other (${otherEditors.length} editor${otherEditors.length !== 1 ? "s" : ""})`,
      todayUsage,
      last30DaysUsage,
      monthUsage,
      lastMonthUsage,
      projectedTokens: Math.round(calculateProjection(last30DaysUsage.tokens)),
      projectedSessions: Math.round(calculateProjection(last30DaysUsage.sessions)),
      otherEditors
    };
  }
  function sortEditorItems(items) {
    items.sort((a3, b3) => {
      let cmp;
      switch (editorSortKey) {
        case "name":
          cmp = a3.editor.localeCompare(b3.editor);
          break;
        case "today":
          cmp = a3.todayUsage.tokens - b3.todayUsage.tokens;
          break;
        case "last30Days":
          cmp = a3.last30DaysUsage.tokens - b3.last30DaysUsage.tokens;
          break;
        case "month":
          cmp = a3.monthUsage.tokens - b3.monthUsage.tokens;
          break;
        case "lastMonth":
          cmp = a3.lastMonthUsage.tokens - b3.lastMonthUsage.tokens;
          break;
        case "projected":
          cmp = a3.projectedTokens - b3.projectedTokens;
          break;
        default:
          cmp = 0;
      }
      return editorSortDir === "asc" ? cmp : -cmp;
    });
  }
  function sortEditorsBySignificance(stats, editors) {
    return [...editors].sort((a3, b3) => {
      if (editorSortKey === "name") {
        return a3.localeCompare(b3);
      }
      const aItem = toEditorItem(stats, a3);
      const bItem = toEditorItem(stats, b3);
      let cmp;
      switch (editorSortKey) {
        case "today":
          cmp = aItem.todayUsage.tokens - bItem.todayUsage.tokens;
          break;
        case "last30Days":
          cmp = aItem.last30DaysUsage.tokens - bItem.last30DaysUsage.tokens;
          break;
        case "month":
          cmp = aItem.monthUsage.tokens - bItem.monthUsage.tokens;
          break;
        case "lastMonth":
          cmp = aItem.lastMonthUsage.tokens - bItem.lastMonthUsage.tokens;
          break;
        case "projected":
          cmp = aItem.projectedTokens - bItem.projectedTokens;
          break;
        default:
          cmp = 0;
      }
      return -cmp || a3.localeCompare(b3);
    });
  }
  function buildEditorRow(item, totals, isOtherChild) {
    const { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens, projectedSessions } = item;
    const todayPct = totals.today > 0 ? todayUsage.tokens / totals.today * 100 : 0;
    const last30Pct = totals.last30Days > 0 ? last30DaysUsage.tokens / totals.last30Days * 100 : 0;
    const monthPct = totals.month > 0 ? monthUsage.tokens / totals.month * 100 : 0;
    const lastMonthPct = totals.lastMonth > 0 ? lastMonthUsage.tokens / totals.lastMonth * 100 : 0;
    const tr = document.createElement("tr");
    if (isOtherChild) {
      tr.style.opacity = "0.85";
    }
    if (editor === "JetBrains") {
      tr.title = "JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available.";
    }
    if (editor === "Antigravity") {
      tr.title = "Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally.";
    }
    if (editor === "Cursor") {
      tr.title = "Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.";
    }
    const labelTd = document.createElement("td");
    const labelWrapper = document.createElement("span");
    labelWrapper.className = "metric-label";
    if (isOtherChild) {
      const indentSpan = document.createElement("span");
      indentSpan.style.cssText = "display:inline-block;width:12px";
      labelWrapper.append(indentSpan);
    }
    labelWrapper.append(document.createTextNode(`${getEditorIcon(editor)} ${editor}`));
    if (editor === "JetBrains" || editor === "Antigravity" || editor === "Cursor") {
      labelWrapper.append(document.createTextNode(" \u24D8"));
    }
    labelTd.append(labelWrapper);
    tr.append(
      labelTd,
      buildValueCell(formatCompact(todayUsage.tokens), `${formatPercent(todayPct)} \xB7 ${todayUsage.sessions} sessions`),
      buildValueCell(formatCompact(last30DaysUsage.tokens), `${formatPercent(last30Pct)} \xB7 ${last30DaysUsage.sessions} sessions`),
      buildValueCell(formatCompact(monthUsage.tokens), `${formatPercent(monthPct)} \xB7 ${monthUsage.sessions} sessions`),
      buildValueCell(formatCompact(lastMonthUsage.tokens), `${formatPercent(lastMonthPct)} \xB7 ${lastMonthUsage.sessions} sessions`),
      buildValueCell(formatCompact(projectedTokens), `${projectedSessions} sessions`)
    );
    return tr;
  }
  function appendOtherEditors(item, totals, onToggleOther, tbody, stats) {
    const otherEditors = item.otherEditors ?? [];
    const pct = (part, total) => total > 0 ? part / total * 100 : 0;
    const otherTr = document.createElement("tr");
    otherTr.style.cursor = "pointer";
    otherTr.style.background = "var(--list-hover-bg)";
    otherTr.title = editorOtherExpanded ? "Collapse other editors" : "Expand other editors";
    const otherLabelWrapper = document.createElement("span");
    otherLabelWrapper.className = "metric-label";
    const otherNameSpan = document.createElement("span");
    otherNameSpan.style.cssText = "color:var(--text-secondary);font-weight:600;";
    otherNameSpan.textContent = `\u{1F4E6} ${item.editor}`;
    const otherToggleSpan = document.createElement("span");
    otherToggleSpan.style.cssText = "font-size:10px;color:var(--text-muted)";
    otherToggleSpan.textContent = ` ${editorOtherExpanded ? "\u25B2" : "\u25BC"}`;
    otherLabelWrapper.append(otherNameSpan, otherToggleSpan);
    const otherLabelTd = document.createElement("td");
    otherLabelTd.append(otherLabelWrapper);
    const mkOtherTd = (usage, total) => {
      const td = buildValueCell(formatCompact(usage.tokens));
      td.append(el("div", "muted", `${formatPercent(pct(usage.tokens, total))} \xB7 ${usage.sessions} sessions`));
      return td;
    };
    otherTr.append(
      otherLabelTd,
      mkOtherTd(item.todayUsage, totals.today),
      mkOtherTd(item.last30DaysUsage, totals.last30Days),
      mkOtherTd(item.monthUsage, totals.month),
      mkOtherTd(item.lastMonthUsage, totals.lastMonth),
      buildValueCell(formatCompact(item.projectedTokens), `${item.projectedSessions} sessions`)
    );
    otherTr.addEventListener("click", () => {
      editorOtherExpanded = !editorOtherExpanded;
      saveSortSettings();
      onToggleOther();
    });
    tbody.append(otherTr);
    if (editorOtherExpanded) {
      const otherItems = otherEditors.map((e7) => toEditorItem(stats, e7));
      sortEditorItems(otherItems);
      otherItems.forEach((childItem) => tbody.append(buildEditorRow(childItem, totals, true)));
    }
  }
  function buildEditorTbody(stats, visibleEditors, onToggleOther) {
    const editors = visibleEditors;
    const totals = {
      today: editors.reduce((s4, e7) => s4 + (stats.today.editorUsage[e7]?.tokens || 0), 0),
      last30Days: editors.reduce((s4, e7) => s4 + (stats.last30Days.editorUsage[e7]?.tokens || 0), 0),
      month: editors.reduce((s4, e7) => s4 + (stats.month.editorUsage[e7]?.tokens || 0), 0),
      lastMonth: editors.reduce((s4, e7) => s4 + (stats.lastMonth.editorUsage[e7]?.tokens || 0), 0)
    };
    const tbody = document.createElement("tbody");
    if (editors.length === 0) {
      tbody.append(buildNoDataRow(6, "No editor usage matches the selected provider filter."));
      return tbody;
    }
    const sortedBySignificance = sortEditorsBySignificance(stats, editors);
    const topEditors = sortedBySignificance.slice(0, TOP_N_EDITORS);
    const otherEditors = sortedBySignificance.slice(TOP_N_EDITORS);
    const items = topEditors.map((editor) => toEditorItem(stats, editor));
    if (otherEditors.length > 0) {
      items.push(toOtherEditorItem(stats, otherEditors));
    }
    sortEditorItems(items);
    items.forEach((item) => {
      if (item.otherEditors) {
        appendOtherEditors(item, totals, onToggleOther, tbody, stats);
      } else {
        tbody.append(buildEditorRow(item, totals, false));
      }
    });
    return tbody;
  }
  var TOP_N_EDITORS = 5;
  function buildEditorUsageSection(stats) {
    const allEditors = /* @__PURE__ */ new Set([
      ...Object.keys(stats.today.editorUsage),
      ...Object.keys(stats.last30Days.editorUsage),
      ...Object.keys(stats.month.editorUsage),
      ...Object.keys(stats.lastMonth.editorUsage)
    ]);
    if (allEditors.size === 0) {
      return null;
    }
    const visibleEditors = Array.from(allEditors).filter((editor) => isVisibleForProviderFilter(editorBillingGroups(stats, editor)));
    const section = el("div", "section");
    const heading = iconHeading("h3", "device-desktop", "Usage by Editor");
    section.append(heading);
    const table = document.createElement("table");
    table.className = "stats-table";
    const editorColHeaders = [
      { icon: "\u{1F4DD}", text: "Editor", key: "name" },
      { icon: "\u{1F4C5}", text: "Today", key: "today" },
      { icon: "\u{1F4C8}", text: "Last 30 Days", key: "last30Days" },
      { icon: "\u{1F5D3}\uFE0F", text: "Current Month", key: "month" },
      { icon: "\u{1F4C6}", text: "Previous Month", key: "lastMonth" },
      { icon: "\u{1F30D}", text: "Projected Year", key: "projected" }
    ];
    function rebuildTbody() {
      const newTbody = buildEditorTbody(stats, visibleEditors, rebuildTbody);
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) {
        table.replaceChild(newTbody, oldTbody);
      } else {
        table.append(newTbody);
      }
    }
    const { thead } = buildSortableTableHeader(
      editorColHeaders,
      () => editorSortKey,
      () => editorSortDir,
      (key) => {
        if (editorSortKey === key) {
          editorSortDir = editorSortDir === "asc" ? "desc" : "asc";
        } else {
          editorSortKey = key;
          editorSortDir = key === "name" ? "asc" : "desc";
        }
        rebuildTbody();
        saveSortSettings();
      }
    );
    table.append(thead);
    rebuildTbody();
    section.append(table);
    return section;
  }
  var TOP_N_MODELS = 5;
  function toModelItem(stats, model) {
    const todayUsage = stats.today.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
    const last30DaysUsage = stats.last30Days.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
    const monthUsage = stats.month.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
    const lastMonthUsage = stats.lastMonth.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
    const todayTotal = todayUsage.inputTokens + todayUsage.outputTokens;
    const last30DaysTotal = last30DaysUsage.inputTokens + last30DaysUsage.outputTokens;
    const monthTotal = monthUsage.inputTokens + monthUsage.outputTokens;
    const lastMonthTotal = lastMonthUsage.inputTokens + lastMonthUsage.outputTokens;
    return {
      model,
      todayTotal,
      todayInputPct: todayTotal > 0 ? todayUsage.inputTokens / todayTotal * 100 : 0,
      todayOutputPct: todayTotal > 0 ? todayUsage.outputTokens / todayTotal * 100 : 0,
      last30DaysTotal,
      last30DaysInputPct: last30DaysTotal > 0 ? last30DaysUsage.inputTokens / last30DaysTotal * 100 : 0,
      last30DaysOutputPct: last30DaysTotal > 0 ? last30DaysUsage.outputTokens / last30DaysTotal * 100 : 0,
      monthTotal,
      monthInputPct: monthTotal > 0 ? monthUsage.inputTokens / monthTotal * 100 : 0,
      monthOutputPct: monthTotal > 0 ? monthUsage.outputTokens / monthTotal * 100 : 0,
      lastMonthTotal,
      lastMonthInputPct: lastMonthTotal > 0 ? lastMonthUsage.inputTokens / lastMonthTotal * 100 : 0,
      lastMonthOutputPct: lastMonthTotal > 0 ? lastMonthUsage.outputTokens / lastMonthTotal * 100 : 0,
      projected: Math.round(calculateProjection(last30DaysTotal)),
      charsPerToken: getCharsPerToken(model)
    };
  }
  function toOtherModelItem(stats, otherModels) {
    const sumUsage = (period) => otherModels.reduce((acc, m2) => {
      const u3 = stats[period].modelUsage[m2] || { inputTokens: 0, outputTokens: 0 };
      return { inputTokens: acc.inputTokens + u3.inputTokens, outputTokens: acc.outputTokens + u3.outputTokens };
    }, { inputTokens: 0, outputTokens: 0 });
    const todayUsage = sumUsage("today");
    const last30DaysUsage = sumUsage("last30Days");
    const monthUsage = sumUsage("month");
    const lastMonthUsage = sumUsage("lastMonth");
    const todayTotal = todayUsage.inputTokens + todayUsage.outputTokens;
    const last30DaysTotal = last30DaysUsage.inputTokens + last30DaysUsage.outputTokens;
    const monthTotal = monthUsage.inputTokens + monthUsage.outputTokens;
    const lastMonthTotal = lastMonthUsage.inputTokens + lastMonthUsage.outputTokens;
    return {
      model: `Other (${otherModels.length} model${otherModels.length !== 1 ? "s" : ""})`,
      todayTotal,
      todayInputPct: todayTotal > 0 ? todayUsage.inputTokens / todayTotal * 100 : 0,
      todayOutputPct: todayTotal > 0 ? todayUsage.outputTokens / todayTotal * 100 : 0,
      last30DaysTotal,
      last30DaysInputPct: last30DaysTotal > 0 ? last30DaysUsage.inputTokens / last30DaysTotal * 100 : 0,
      last30DaysOutputPct: last30DaysTotal > 0 ? last30DaysUsage.outputTokens / last30DaysTotal * 100 : 0,
      monthTotal,
      monthInputPct: monthTotal > 0 ? monthUsage.inputTokens / monthTotal * 100 : 0,
      monthOutputPct: monthTotal > 0 ? monthUsage.outputTokens / monthTotal * 100 : 0,
      lastMonthTotal,
      lastMonthInputPct: lastMonthTotal > 0 ? lastMonthUsage.inputTokens / lastMonthTotal * 100 : 0,
      lastMonthOutputPct: lastMonthTotal > 0 ? lastMonthUsage.outputTokens / lastMonthTotal * 100 : 0,
      projected: Math.round(calculateProjection(last30DaysTotal)),
      charsPerToken: 0,
      otherModels
    };
  }
  function sortModelItems(items) {
    items.sort((a3, b3) => {
      let cmp;
      switch (modelSortKey) {
        case "name":
          cmp = a3.model.localeCompare(b3.model);
          break;
        case "today":
          cmp = a3.todayTotal - b3.todayTotal;
          break;
        case "last30Days":
          cmp = a3.last30DaysTotal - b3.last30DaysTotal;
          break;
        case "month":
          cmp = a3.monthTotal - b3.monthTotal;
          break;
        case "lastMonth":
          cmp = a3.lastMonthTotal - b3.lastMonthTotal;
          break;
        case "projected":
          cmp = a3.projected - b3.projected;
          break;
        default:
          cmp = 0;
      }
      return modelSortDir === "asc" ? cmp : -cmp;
    });
  }
  function sortModelsBySignificance(stats, models) {
    return [...models].sort((a3, b3) => {
      if (modelSortKey === "name") {
        return a3.localeCompare(b3);
      }
      const aItem = toModelItem(stats, a3);
      const bItem = toModelItem(stats, b3);
      let cmp;
      switch (modelSortKey) {
        case "today":
          cmp = aItem.todayTotal - bItem.todayTotal;
          break;
        case "last30Days":
          cmp = aItem.last30DaysTotal - bItem.last30DaysTotal;
          break;
        case "month":
          cmp = aItem.monthTotal - bItem.monthTotal;
          break;
        case "lastMonth":
          cmp = aItem.lastMonthTotal - bItem.lastMonthTotal;
          break;
        case "projected":
          cmp = aItem.projected - bItem.projected;
          break;
        default:
          cmp = 0;
      }
      return -cmp || a3.localeCompare(b3);
    });
  }
  function buildModelRowEl(item, isOtherChild) {
    const tr = document.createElement("tr");
    if (isOtherChild) {
      tr.style.opacity = "0.85";
    }
    const labelTd = document.createElement("td");
    const labelWrapper = document.createElement("span");
    labelWrapper.className = "metric-label";
    if (isOtherChild) {
      const indentSpan = document.createElement("span");
      indentSpan.style.cssText = "display:inline-block;width:12px";
      labelWrapper.append(indentSpan);
    }
    const charsSpan = document.createElement("span");
    charsSpan.style.cssText = "color:#9aa0a6;font-size:11px;font-weight:500;";
    charsSpan.textContent = `(~${item.charsPerToken.toFixed(1)} chars/tk)`;
    labelWrapper.append(document.createTextNode(`${getModelDisplayName(item.model)} `), charsSpan);
    labelTd.append(labelWrapper);
    tr.append(
      labelTd,
      buildValueCell(formatCompact(item.todayTotal), `\u2191${formatPercent(item.todayInputPct)} \u2193${formatPercent(item.todayOutputPct)}`),
      buildValueCell(formatCompact(item.last30DaysTotal), `\u2191${formatPercent(item.last30DaysInputPct)} \u2193${formatPercent(item.last30DaysOutputPct)}`),
      buildValueCell(formatCompact(item.monthTotal), `\u2191${formatPercent(item.monthInputPct)} \u2193${formatPercent(item.monthOutputPct)}`),
      buildValueCell(formatCompact(item.lastMonthTotal), `\u2191${formatPercent(item.lastMonthInputPct)} \u2193${formatPercent(item.lastMonthOutputPct)}`),
      buildValueCell(formatCompact(item.projected))
    );
    return tr;
  }
  function appendOtherModels(item, onToggleOther, tbody, stats) {
    const otherModels = item.otherModels ?? [];
    const pct = (part, total) => total > 0 ? part / total * 100 : 0;
    const otherTr = document.createElement("tr");
    otherTr.style.cursor = "pointer";
    otherTr.style.background = "var(--list-hover-bg)";
    otherTr.title = modelOtherExpanded ? "Collapse other models" : "Expand other models";
    const otherLabelWrapper = document.createElement("span");
    otherLabelWrapper.className = "metric-label";
    const otherNameSpan = document.createElement("span");
    otherNameSpan.style.cssText = "color:var(--text-secondary);font-weight:600;";
    otherNameSpan.textContent = `\u{1F4E6} ${item.model}`;
    const otherToggleSpan = document.createElement("span");
    otherToggleSpan.style.cssText = "font-size:10px;color:var(--text-muted)";
    otherToggleSpan.textContent = ` ${modelOtherExpanded ? "\u25B2" : "\u25BC"}`;
    otherLabelWrapper.append(otherNameSpan, otherToggleSpan);
    const otherLabelTd = document.createElement("td");
    otherLabelTd.append(otherLabelWrapper);
    const mkOtherTd = (total, inputPct, outputPct) => {
      const td = buildValueCell(formatCompact(total));
      if (total > 0) {
        td.append(el("div", "muted", `\u2191${formatPercent(inputPct)} \u2193${formatPercent(outputPct)}`));
      }
      return td;
    };
    otherTr.append(
      otherLabelTd,
      mkOtherTd(item.todayTotal, item.todayInputPct, item.todayOutputPct),
      mkOtherTd(item.last30DaysTotal, item.last30DaysInputPct, item.last30DaysOutputPct),
      mkOtherTd(item.monthTotal, item.monthInputPct, item.monthOutputPct),
      mkOtherTd(item.lastMonthTotal, item.lastMonthInputPct, item.lastMonthOutputPct),
      buildValueCell(formatCompact(item.projected))
    );
    otherTr.addEventListener("click", () => {
      modelOtherExpanded = !modelOtherExpanded;
      saveSortSettings();
      onToggleOther();
    });
    tbody.append(otherTr);
    if (modelOtherExpanded) {
      const otherItems = otherModels.map((m2) => toModelItem(stats, m2));
      sortModelItems(otherItems);
      otherItems.forEach((childItem) => tbody.append(buildModelRowEl(childItem, true)));
    }
  }
  function buildModelTbody(stats, visibleModels, onToggleOther) {
    const sortedBySignificance = sortModelsBySignificance(stats, visibleModels);
    const topModels = sortedBySignificance.slice(0, TOP_N_MODELS);
    const otherModels = sortedBySignificance.slice(TOP_N_MODELS);
    const items = topModels.map((m2) => toModelItem(stats, m2));
    if (otherModels.length > 0) {
      items.push(toOtherModelItem(stats, otherModels));
    }
    sortModelItems(items);
    const tbody = document.createElement("tbody");
    items.forEach((item) => {
      if (item.otherModels) {
        appendOtherModels(item, onToggleOther, tbody, stats);
      } else {
        tbody.append(buildModelRowEl(item, false));
      }
    });
    return tbody;
  }
  function buildModelUsageSection(stats) {
    const allModels = /* @__PURE__ */ new Set([
      ...Object.keys(stats.today.modelUsage),
      ...Object.keys(stats.last30Days.modelUsage),
      ...Object.keys(stats.month.modelUsage),
      ...Object.keys(stats.lastMonth.modelUsage)
    ]);
    if (allModels.size === 0) {
      return null;
    }
    const visibleModels = new Set(Array.from(allModels).filter((model) => isVisibleForProviderFilter(modelBillingGroups(stats, model))));
    const section = el("div", "section");
    const heading = iconHeading("h3", "symbol-numeric", "Model Usage (Tokens)");
    section.append(heading);
    const table = document.createElement("table");
    table.className = "stats-table";
    if (visibleModels.size === 0) {
      const tbody = document.createElement("tbody");
      tbody.append(buildNoDataRow(6, "No model usage matches the selected provider filter."));
      table.append(tbody);
      section.append(table);
      return section;
    }
    const modelColHeaders = [
      { icon: "\u{1F9E0}", text: "Model", key: "name" },
      { icon: "\u{1F4C5}", text: "Today", key: "today" },
      { icon: "\u{1F4C8}", text: "Last 30 Days", key: "last30Days" },
      { icon: "\u{1F5D3}\uFE0F", text: "Current Month", key: "month" },
      { icon: "\u{1F4C6}", text: "Previous Month", key: "lastMonth" },
      { icon: "\u{1F30D}", text: "Projected Year", key: "projected" }
    ];
    function rebuildTbody() {
      const newTbody = buildModelTbody(stats, Array.from(visibleModels), rebuildTbody);
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) {
        table.replaceChild(newTbody, oldTbody);
      } else {
        table.append(newTbody);
      }
    }
    const { thead } = buildSortableTableHeader(
      modelColHeaders,
      () => modelSortKey,
      () => modelSortDir,
      (key) => {
        if (modelSortKey === key) {
          modelSortDir = modelSortDir === "asc" ? "desc" : "asc";
        } else {
          modelSortKey = key;
          modelSortDir = key === "name" ? "asc" : "desc";
        }
        rebuildTbody();
        saveSortSettings();
      }
    );
    table.append(thead);
    rebuildTbody();
    section.append(table);
    return section;
  }
  function buildEmptyStateSection() {
    const section = el("div", "section");
    const inner = el("div", "empty-state");
    const title = el("div", "empty-state-title", "\u{1F44B} Welcome to AI Engineering Fluency");
    const desc = el(
      "p",
      "empty-state-description",
      "This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."
    );
    const toolsLabel = document.createElement("p");
    toolsLabel.className = "empty-state-description";
    const toolsLabelStrong = document.createElement("strong");
    toolsLabelStrong.textContent = "Supported tools & editors:";
    toolsLabel.append(toolsLabelStrong);
    const toolsList = document.createElement("ul");
    toolsList.className = "empty-state-steps";
    const toolsTexts = [
      "\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE",
      "\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent",
      "\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal",
      "\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat",
      "\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent",
      "\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents",
      "\u03C0 Pi \u2014 Mistral-powered terminal coding agent",
      "\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension",
      "\u{1F499} VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension"
    ];
    toolsTexts.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      toolsList.append(li);
    });
    const stepsLabel = document.createElement("p");
    stepsLabel.className = "empty-state-description";
    const stepsLabelStrong = document.createElement("strong");
    stepsLabelStrong.textContent = "To get started:";
    stepsLabel.append(stepsLabelStrong);
    const steps = document.createElement("ol");
    steps.className = "empty-state-steps";
    const stepTexts = [
      "Use any of the supported tools or editors listed above to interact with an AI model.",
      "For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.",
      "For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.",
      "Click the \u{1F504} Refresh button above to reload the stats after your first session."
    ];
    stepTexts.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      steps.append(li);
    });
    const note = el(
      "div",
      "empty-state-note",
      "\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly."
    );
    inner.append(title, desc, toolsLabel, toolsList, stepsLabel, steps, note);
    section.append(inner);
    return section;
  }
  function wireButtons() {
    const refresh = document.getElementById("btn-refresh");
    const chart = document.getElementById("btn-chart");
    const usage = document.getElementById("btn-usage");
    const diagnostics = document.getElementById("btn-diagnostics");
    refresh?.addEventListener("click", () => vscode.postMessage({ command: "refresh" }));
    chart?.addEventListener("click", () => vscode.postMessage({ command: "showChart" }));
    usage?.addEventListener("click", () => vscode.postMessage({ command: "showUsageAnalysis" }));
    diagnostics?.addEventListener("click", () => vscode.postMessage({ command: "showDiagnostics" }));
    const maturity = document.getElementById("btn-maturity");
    maturity?.addEventListener("click", () => vscode.postMessage({ command: "showMaturity" }));
    const dashboard = document.getElementById("btn-dashboard");
    dashboard?.addEventListener("click", () => vscode.postMessage({ command: "showDashboard" }));
    const environmental = document.getElementById("btn-environmental");
    environmental?.addEventListener("click", () => vscode.postMessage({ command: "showEnvironmental" }));
    wireExtensionPointButtons(vscode);
  }
  async function bootstrap() {
    console.log("[CopilotTokenTracker] bootstrap called");
    await Promise.resolve().then(() => (init_vscode_button2(), vscode_button_exports));
    await Promise.resolve().then(() => (init_vscode_badge2(), vscode_badge_exports));
    if (initialData) {
      console.log("[CopilotTokenTracker] Rendering details with initialData:", initialData);
      render(initialData);
    } else {
      console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");
      const root = document.getElementById("root");
      if (root) {
        root.textContent = "";
        const fallback = document.createElement("div");
        fallback.style.padding = "16px";
        fallback.style.color = "#e7e7e7";
        fallback.textContent = "No data available.";
        root.append(fallback);
      }
    }
  }
  registerMessageHandler((message) => {
    if (message.command === "updateStats") {
      render(message.data);
    }
  });
  void bootstrap();
})();
/*! Bundled license information:

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
//# sourceMappingURL=details.js.map
