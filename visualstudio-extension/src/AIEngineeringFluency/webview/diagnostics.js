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
          const el = document.createElement(tagName);
          const anotherVersion = el?.version;
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

  // src/webview/shared/buttonConfig.ts
  var BUTTONS = {
    "btn-refresh": {
      id: "btn-refresh",
      label: "\u{1F504} Refresh",
      appearance: "primary"
    },
    "btn-details": {
      id: "btn-details",
      label: "\u{1F916} Details"
    },
    "btn-chart": {
      id: "btn-chart",
      label: "\u{1F4C8} Chart"
    },
    "btn-usage": {
      id: "btn-usage",
      label: "\u{1F4CA} Usage Analysis"
    },
    "btn-diagnostics": {
      id: "btn-diagnostics",
      label: "\u{1F50D} Diagnostics"
    },
    "btn-maturity": {
      id: "btn-maturity",
      label: "\u{1F3AF} Fluency Score"
    },
    "btn-dashboard": {
      id: "btn-dashboard",
      label: "\u{1F4CA} Team Dashboard"
    },
    "btn-level-viewer": {
      id: "btn-level-viewer",
      label: "\u{1F50D} Level Viewer"
    },
    "btn-environmental": {
      id: "btn-environmental",
      label: "\u{1F33F} Environmental Impact"
    }
  };
  function buttonHtml(id) {
    const config = BUTTONS[id];
    if (config.hidden) {
      return "";
    }
    const appearance = config.appearance ? ` appearance="${config.appearance}"` : "";
    return `<vscode-button id="${config.id}"${appearance}>${config.label}</vscode-button>`;
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
      const el = document.createElement("vscode-button");
      el.id = `ext-point-${btn.id}`;
      el.textContent = btn.label;
      el.addEventListener("click", () => {
        vscodeApi.postMessage({ command: "extensionPointAction", buttonId: btn.id });
      });
      buttonRow.append(el);
    }
  }

  // src/editorIcons.ts
  var EDITOR_ICON_MAP = {
    "Antigravity": "\u{1F680}",
    "Claude Code": "\u{1F7E0}",
    "Claude Desktop Cowork": "\u{1F7E0}",
    "Continue": "\u25B6\uFE0F",
    "Copilot CLI": "\u{1F916}",
    "Crush": "\u{1F9BE}",
    "Cursor": "\u{1F5B1}\uFE0F",
    "Eclipse": "\u{1F311}",
    "Gemini CLI": "\u{1F48E}",
    "JetBrains": "\u{1F9E9}",
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

  // src/webview/shared/dataLoader.ts
  function getWindowData(key) {
    if (typeof window === "undefined") {
      return void 0;
    }
    return window[key];
  }

  // src/webview/shared/formatUtils.ts
  var _estimatorsData = getWindowData("__TOKEN_ESTIMATORS__");
  var tokenEstimators = _estimatorsData?.estimators ?? {};
  function getEditorIcon(editor) {
    return getEditorIconByName(editor);
  }
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function formatFileSize(bytes) {
    const numericBytes = Number(bytes);
    if (!Number.isFinite(numericBytes) || numericBytes < 0) {
      return "N/A";
    }
    if (numericBytes < 1024) {
      return `${numericBytes} B`;
    }
    if (numericBytes < 1024 * 1024) {
      return `${(numericBytes / 1024).toFixed(1)} KB`;
    }
    return `${(numericBytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  function getTimeSince(isoString) {
    try {
      const now = Date.now();
      const then = new Date(isoString).getTime();
      const diffMs = now - then;
      if (diffMs < 0) {
        return "Just now";
      }
      const seconds = Math.floor(diffMs / 1e3);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) {
        return `${days} day${days !== 1 ? "s" : ""} ago`;
      }
      if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      }
      if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    } catch {
      return "Unknown";
    }
  }

  // src/webview/shared/viewState.ts
  function createViewStateManager(vscode2, defaults) {
    return {
      restore() {
        const saved = vscode2.getState();
        return { ...defaults, ...saved ?? {} };
      },
      save(state) {
        vscode2.setState(state);
      },
      patch(partial) {
        const current = vscode2.getState() ?? { ...defaults };
        const next = { ...defaults, ...current, ...partial };
        vscode2.setState(next);
        return next;
      }
    };
  }

  // src/webview/shared/theme.css
  var theme_default = '/**\n * Shared theme variables for all webview panels\n * Uses VS Code theme tokens for automatic light/dark theme support.\n *\n * The "INDUSTRIAL REDUX" high-contrast styling (stark outlines, uppercase\n * navigation, neon stage colors, monospace body) is intentionally scoped to\n * the high-contrast themes only. Normal light/dark themes keep the native\n * VS Code look so the navigation bar and typography stay unobtrusive.\n */\n\n:root {\n	/* VS Code base colors */\n	--bg-primary: var(--vscode-editor-background);\n	--bg-secondary: var(--vscode-sideBar-background);\n	--bg-tertiary: var(--vscode-editorWidget-background);\n	--text-primary: var(--vscode-editor-foreground);\n	--text-secondary: var(--vscode-descriptionForeground);\n	--text-muted: var(--vscode-disabledForeground);\n	--border-color: var(--vscode-panel-border);\n	--border-subtle: var(--vscode-widget-border);\n\n	/* Button colors */\n	--button-bg: var(--vscode-button-background);\n	--button-fg: var(--vscode-button-foreground);\n	--button-hover-bg: var(--vscode-button-hoverBackground);\n	--button-secondary-bg: var(--vscode-button-secondaryBackground);\n	--button-secondary-fg: var(--vscode-button-secondaryForeground);\n	--button-secondary-hover-bg: var(--vscode-button-secondaryHoverBackground);\n\n	/* Input colors */\n	--input-bg: var(--vscode-input-background);\n	--input-fg: var(--vscode-input-foreground);\n	--input-border: var(--vscode-input-border);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-list-hoverBackground);\n	--list-active-bg: var(--vscode-list-activeSelectionBackground);\n	--list-active-fg: var(--vscode-list-activeSelectionForeground);\n	--list-inactive-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Alternating row colors for better readability */\n	--row-alternate-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-badge-background);\n	--badge-fg: var(--vscode-badge-foreground);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-focusBorder);\n\n	/* Link colors */\n	--link-color: var(--vscode-textLink-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Status colors */\n	--error-fg: var(--vscode-errorForeground);\n	--warning-fg: var(--vscode-editorWarning-foreground);\n	--success-fg: var(--vscode-terminal-ansiGreen);\n\n	/* Stage accent colors \u2014 dark theme defaults */\n	--stage-1-color: #93c5fd;\n	--stage-2-color: #a78bfa;\n	--stage-3-color: #3b82f6;\n	--stage-4-color: #22d3ee;\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: rgba(128, 128, 128, 0.2);\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-disabledForeground);\n\n	/* Shadow for cards */\n	--shadow-color: rgb(0, 0, 0, 0.16);\n	--shadow-hover-color: rgb(0, 0, 0, 0.24);\n}\n\n/* Light theme adjustments */\nbody[data-vscode-theme-kind="vscode-light"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--shadow-color: rgb(0, 0, 0, 0.08);\n	--shadow-hover-color: rgb(0, 0, 0, 0.12);\n	/* Stage colors darkened for readable contrast on light backgrounds */\n	--stage-1-color: #1d6fa4;\n	--stage-2-color: #7c3aed;\n	--stage-3-color: #2563eb;\n	--stage-4-color: #0891b2;\n	--stage-pip-empty-bg: rgba(0, 0, 0, 0.12);\n}\n\n/* Default navigation button row \u2014 native look for normal themes */\n.button-row {\n	display: flex;\n	gap: 10px;\n	flex-wrap: wrap;\n}\n\n/* ------------------------------------------------------------------ *\n * High contrast themes \u2014 INDUSTRIAL REDUX\n * Stark outlines, uppercase navigation, neon stage colors, monospace.\n * Everything below is deliberately gated to the high-contrast theme\n * kinds so normal light/dark themes are unaffected.\n * ------------------------------------------------------------------ */\n\nbody[data-vscode-theme-kind="vscode-high-contrast"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	/* Base colors \u2014 forced to stark contrasts */\n	--bg-secondary: transparent;\n	--bg-tertiary: transparent;\n	--text-secondary: var(--vscode-foreground);\n	--text-muted: var(--vscode-descriptionForeground);\n	--border-color: var(--vscode-contrastBorder);\n	--border-subtle: var(--vscode-contrastBorder);\n\n	/* Button colors \u2014 high contrast, no subtle grays */\n	--button-bg: var(--vscode-foreground);\n	--button-fg: var(--vscode-editor-background);\n	--button-hover-bg: var(--vscode-editor-background);\n	--button-secondary-bg: transparent;\n	--button-secondary-fg: var(--vscode-foreground);\n	--button-secondary-hover-bg: var(--vscode-foreground);\n\n	/* Input colors */\n	--input-bg: transparent;\n	--input-fg: var(--vscode-foreground);\n	--input-border: var(--vscode-foreground);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-editor-background);\n	--list-active-bg: var(--vscode-foreground);\n	--list-active-fg: var(--vscode-editor-background);\n	--list-inactive-bg: transparent;\n\n	/* Alternating row colors dropped for harsh outlines */\n	--row-alternate-bg: transparent;\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-foreground);\n	--badge-fg: var(--vscode-editor-background);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-foreground);\n\n	/* Link colors */\n	--link-color: var(--vscode-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: transparent;\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-descriptionForeground);\n\n	/* Shadow for cards \u2014 HARD shadows */\n	--shadow-color: var(--vscode-foreground);\n	--shadow-hover-color: var(--vscode-foreground);\n\n	/* Monospace body for the industrial identity */\n	font-family: var(--vscode-editor-font-family), "JetBrains Mono", "Fira Code", monospace;\n}\n\n/* High contrast dark \u2014 stark neon stage colors */\nbody[data-vscode-theme-kind="vscode-high-contrast"] {\n	--stage-1-color: #ff00ff; /* Magenta */\n	--stage-2-color: #00ffff; /* Cyan */\n	--stage-3-color: #ffff00; /* Yellow */\n	--stage-4-color: #00ff00; /* Green */\n}\n\n/* High contrast light \u2014 darkened neon for readable contrast */\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--stage-1-color: #d100d1;\n	--stage-2-color: #008787;\n	--stage-3-color: #b5b500;\n	--stage-4-color: #00a300;\n}\n\n/* Industrial navigation tab bar (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row {\n	display: flex;\n	gap: 0; /* Force flush blocks */\n	flex-wrap: wrap; /* Let it wrap so no scrollbars appear */\n	border: 3px solid var(--vscode-foreground);\n	background-color: var(--vscode-editor-background);\n	margin-bottom: 2rem;\n	box-shadow: 4px 4px 0 var(--vscode-panel-border);\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > * {\n	flex-grow: 1; /* Stretch to fill */\n	flex-shrink: 1;\n	flex-basis: auto;\n	text-align: center;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button {\n	border-radius: 0 !important;\n	border: none !important;\n	border-right: 2px solid var(--vscode-foreground) !important;\n	font-family: inherit;\n	font-weight: 900;\n	text-transform: uppercase;\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n	padding: 12px 16px !important;\n	cursor: pointer;\n	box-shadow: none !important;\n	letter-spacing: 1px;\n	transition: transform 0.1s, background-color 0.1s;\n	height: auto !important; /* Override vscode-button strict heights */\n	border-bottom: 3px solid transparent !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button::part(control) {\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover::part(control) {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:last-child {\n	border-right: none !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button:hover {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n	border-bottom: 3px solid var(--vscode-terminal-ansiCyan) !important; /* Cyber/Industrial accent indicator */\n}\n\n/* Industrial header + title (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .header,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .header {\n	display: flex;\n	justify-content: space-between;\n	align-items: flex-end;\n	margin-bottom: 2rem;\n	flex-wrap: nowrap;\n	white-space: nowrap;\n	gap: 15px;\n	border-bottom: 4px solid var(--vscode-foreground);\n	padding-bottom: 1rem;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .title,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .title {\n	font-size: 28px;\n	font-weight: 900;\n	text-transform: uppercase;\n	letter-spacing: 2px;\n	color: var(--vscode-foreground);\n	text-shadow: 2px 2px 0 var(--vscode-panel-border);\n	white-space: nowrap;\n}\n';

  // src/webview/diagnostics/styles.css
  var styles_default = `* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	background: var(--bg-primary);
	color: var(--text-primary);
	padding: 16px;
	line-height: 1.5;
	min-width: 320px;
}

.container {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 16px;
	box-shadow: 0 4px 10px var(--shadow-color);
	max-width: 1200px;
	margin: 0 auto;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
	padding-bottom: 4px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.header-icon {
	font-size: 20px;
}




.section {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 16px;
	box-shadow: 0 2px 6px var(--shadow-color);
}

.section-title {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 10px;
	display: flex;
	align-items: center;
	gap: 6px;
	letter-spacing: 0.2px;
}

.section-subtitle {
	font-size: 12px;
	color: var(--text-secondary);
	margin-bottom: 12px;
}

/* Tab styles */
.tabs {
	display: flex;
	flex-wrap: wrap;
	border-bottom: 1px solid var(--border-color);
	margin-bottom: 16px;
}

.tab {
	padding: 10px 20px;
	cursor: pointer;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	font-size: 13px;
	font-weight: 500;
	border-bottom: 2px solid transparent;
	transition: all 0.2s;
}

.tab:hover {
	color: var(--text-primary);
	background: var(--list-hover-bg);
}

.tab.active {
	color: var(--link-color);
	border-bottom-color: var(--link-color);
}

.tab-content {
	display: none;
}

.tab-content.active {
	display: block;
}

/* Sub-tabs (used inside tabs, e.g. Backend Storage sub-tabs) */
.subtab-bar {
	display: flex;
	gap: 4px;
	margin-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
}

.subtab {
	padding: 8px 16px;
	cursor: pointer;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	font-size: 12px;
	font-weight: 500;
	border-bottom: 2px solid transparent;
	margin-bottom: -1px;
	transition: all 0.2s;
}

.subtab:hover {
	color: var(--text-primary);
	background: var(--list-hover-bg);
}

.subtab.active {
	color: var(--link-color);
	border-bottom-color: var(--link-color);
}

.subtab-content {
	display: none;
}

.subtab-content.active {
	display: block;
}

/* Editor filter panels */
.editor-filter-panels {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 16px;
}

.editor-panel {
	background: var(--bg-tertiary);
	border: 2px solid var(--border-color);
	border-radius: 8px;
	padding: 12px 16px;
	cursor: pointer;
	transition: all 0.2s;
	min-width: 140px;
	text-align: center;
	white-space: nowrap;
}

.editor-panel:hover {
	background: var(--list-hover-bg);
	border-color: var(--border-color);
}

.editor-panel.active {
	background: var(--list-active-bg);
	border-color: var(--link-color);
	color: var(--list-active-fg);
}

.editor-panel.active .editor-panel-name {
	color: var(--list-active-fg);
}

.editor-panel.active .editor-panel-stats {
	color: var(--list-active-fg);
	opacity: 0.85;
}

.editor-panel-icon {
	font-size: 24px;
	margin-bottom: 4px;
}

.editor-panel-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 2px;
}

.editor-panel-stats {
	font-size: 10px;
	color: var(--text-muted);
}

/* Loading state */
.loading-state {
	text-align: center;
	padding: 40px 20px;
	color: var(--text-muted);
}

.loading-spinner {
	font-size: 48px;
	margin-bottom: 16px;
	animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

.loading-text {
	font-size: 16px;
	color: var(--text-primary);
	margin-bottom: 8px;
}

.loading-subtext {
	font-size: 12px;
	color: var(--text-muted);
}

/* Summary cards */
.summary-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 12px;
	margin-bottom: 16px;
}

.summary-card {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 12px;
	text-align: center;
}

.summary-label {
	font-size: 11px;
	color: var(--text-secondary);
	margin-bottom: 4px;
}

.summary-value {
	font-size: 18px;
	font-weight: 600;
	color: var(--text-primary);
}

.summary-sub {
	font-size: 10px;
	color: var(--text-secondary);
	text-align: left;
	margin-top: 6px;
}

.context-ref-filter {
	cursor: pointer;
	padding: 2px 6px;
	border-radius: 3px;
	margin: 2px 0;
	transition: all 0.2s;
}

.context-ref-filter:hover {
	background: var(--list-hover-bg);
	color: var(--link-color);
}

.context-ref-filter.active {
	background: var(--list-inactive-bg);
	color: var(--link-color);
	font-weight: 600;
}

/* Table styles */
.filter-options {
	margin: 8px 0 4px;
}

.empty-sessions-toggle {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	font-size: 12px;
	color: var(--vscode-foreground);
}

.empty-sessions-toggle input[type="checkbox"] {
	cursor: pointer;
}

.hidden-count {
	color: var(--vscode-descriptionForeground);
	font-size: 11px;
}

.table-container {
	overflow: auto;
	max-height: 500px;
}

.session-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 12px;
}

.session-table th,
.session-table td {
	padding: 8px 10px;
	text-align: left;
	border-bottom: 1px solid var(--border-color);
}

.session-table th {
	background: var(--bg-tertiary);
	color: var(--text-primary);
	font-weight: 600;
	position: sticky;
	top: 0;
}

.session-table th.sortable,
.session-table th.tool-sortable {
	cursor: pointer;
	user-select: none;
}

.session-table th.sortable:hover,
.session-table th.tool-sortable:hover {
	background: var(--list-hover-bg);
	color: var(--link-color);
}

.sort-hint {
	opacity: 0.4;
}

.tool-family-section {
	margin-bottom: 20px;
}

.tool-family-heading {
	margin: 8px 0 4px;
	font-size: 13px;
	font-weight: 600;
	color: var(--fg-muted);
}

.tool-type-badge {
	padding: 1px 5px;
	border-radius: 3px;
	font-size: 10px;
	white-space: nowrap;
	margin-left: 4px;
	vertical-align: middle;
}

.tool-type-badge.built-in {
	background: rgba(100, 120, 180, 0.25);
	color: var(--stage-3-color);
}

.tool-type-badge.alternative {
	background: rgba(100, 200, 120, 0.2);
	color: var(--success-fg);
}

.tool-ratio {
	font-variant-numeric: tabular-nums;
	text-align: right;
}

.tool-builtin-label {
	opacity: 0.5;
	font-style: italic;
}

.ratio-better {
	color: var(--success-fg);
}

.ratio-worse {
	color: var(--error-fg);
}

.ratio-neutral {
	color: var(--fg-muted);
}

.inline-link {
	background: none;
	border: none;
	padding: 0;
	color: var(--link-color);
	cursor: pointer;
	font-size: inherit;
	text-decoration: underline;
	text-underline-offset: 2px;
}

.inline-link:hover {
	opacity: 0.8;
}


.session-table tr:hover {
	background: var(--list-hover-bg);
}

.editor-badge {
	background: var(--list-active-bg);
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 10px;
	color: var(--list-active-fg);
	white-space: nowrap;
}

/* MS Scout: Microsoft brand blue on dark navy */
.editor-badge-ms-scout {
	background: #001a2e;
	color: #0078d4;
	border: 1px solid #0078d4;
}

.editor-badge-crush {
	background: #3d0a4f;
	color: #ff3dff;
	border: 1px solid #cc00cc;
}

.editor-badge-vs {
	background: #5c2d91;
	color: #ffffff;
	border: 1px solid #7b3fbe;
}
.editor-badge-mistral-vibe {
background: #1a0800;
color: #FF8205;
border: 1px solid #FA500F;
padding-left: 20px;
position: relative;
}

.editor-badge-mistral-vibe::before {
content: '';
display: inline-block;
position: absolute;
left: 3px;
top: 50%;
transform: translateY(-50%);
width: 13px;
height: 13px;
background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRDgwMCIvPjxzdG9wIG9mZnNldD0iNDUlIiBzdG9wLWNvbG9yPSIjRkY4MjA1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRTEwNTAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNSIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjEyIiB5PSIzIiB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIyMSIgeT0iMyIgd2lkdGg9IjgiIGhlaWdodD0iMTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMyIgeT0iMTUiIHdpZHRoPSI4IiBoZWlnaHQ9IjE0IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjIxIiB5PSIxNSIgd2lkdGg9IjgiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTIiIHk9IjE5IiB3aWR0aD0iOCIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=");
background-size: contain;
background-repeat: no-repeat;
background-position: center;
}

.editor-badge-antigravity {
	background: #0a1628;
	color: #4285f4;
	border: 1px solid #1a73e8;
}

.editor-badge-gemini-cli {
	background: #111827;
	color: #8ec5ff;
	border: 1px solid #5b8cff;
}

.editor-badge-pi {
background: #0d1117;
color: #58a6ff;
border: 1px solid #1f6feb;
}

/* Cursor: dark theme matching Cursor's brand (charcoal + bright white) */
.editor-badge-cursor {
	background: #1a1a2e;
	color: #ffffff;
	border: 1px solid #4a4a8a;
}

.session-folders-table {
	margin-top: 16px;
	margin-bottom: 16px;
}

.session-folders-table h4 {
	color: var(--text-primary);
	font-size: 14px;
	margin-bottom: 12px;
}

.report-content {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 16px;
	white-space: pre-wrap;
	font-size: 13px;
	overflow: auto;
	max-height: 45vh;
}

.file-subpath {
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 4px;
}

.session-file-link,
.reveal-link,
.view-formatted-link {
	color: var(--link-color);
	text-decoration: underline;
	cursor: pointer;
}

.session-file-link:hover,
.reveal-link:hover,
.view-formatted-link:hover {
	color: var(--link-hover-color);
}

.empty-session-link {
	color: var(--text-muted);
}

/* Session hierarchy badges (parent \u2191 / children \u2193) */
.session-hierarchy-badges {
	display: flex;
	flex-wrap: wrap;
	gap: 3px;
	margin-bottom: 3px;
}

.session-hierarchy-badge {
	display: inline-block;
	font-size: 10px;
	padding: 1px 5px;
	border-radius: 3px;
	white-space: nowrap;
	text-decoration: none;
}

.hierarchy-parent {
	background: rgba(100, 60, 180, 0.2);
	color: var(--stage-2-color);
	border: 1px solid rgba(100, 60, 180, 0.4);
	cursor: pointer;
}

.hierarchy-parent:hover {
	background: rgba(100, 60, 180, 0.35);
	color: var(--stage-2-color);
	opacity: 0.85;
}

.hierarchy-children {
	background: rgba(30, 120, 80, 0.2);
	color: var(--success-fg);
	border: 1px solid rgba(30, 120, 80, 0.4);
}

/* Child session rows \u2014 subtle left border to visually group them under parent */
.child-session-row {
	border-left: 2px solid rgba(30, 120, 80, 0.5);
}

.child-session-row td:first-child {
	padding-left: 6px;
}

/* Indent the title of child sessions */
.child-title-indent {
	display: inline-block;
	padding-left: 20px;
	position: relative;
}

.child-title-indent::before {
	content: '\u21B3';
	position: absolute;
	left: 4px;
	color: var(--success-fg);
	opacity: 0.7;
	font-size: 11px;
}

.empty-session-link:hover {
	color: var(--text-secondary);
}

.button-group {
	display: flex;
	gap: 12px;
	margin-top: 16px;
	flex-wrap: wrap;
}

.button {
	background: var(--button-secondary-bg);
	border: 1px solid var(--border-subtle);
	color: var(--text-primary);
	padding: 8px 12px;
	border-radius: 6px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 500;
	transition: background-color 0.15s ease;
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.button:hover {
	background: var(--bg-tertiary);
}

.button:active {
	background: var(--button-bg);
}

.button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.button.secondary {
	background: var(--bg-tertiary);
	border-color: var(--border-subtle);
	color: var(--text-primary);
}

.button.secondary:hover {
	background: var(--list-hover-bg);
}

.backend-card {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 16px 20px;
	margin-bottom: 16px;
}

.backend-card h4 {
	color: var(--text-primary);
	font-size: 15px;
	font-weight: 600;
	margin-top: 0;
	margin-bottom: 10px;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-subtle);
}

.backend-card p {
	color: var(--text-secondary);
	font-size: 13px;
	line-height: 1.5;
	margin-bottom: 14px;
}

.backend-card p:last-child {
	margin-bottom: 0;
}

.backend-card p.hint {
	color: var(--text-muted, #888);
	font-size: 11px;
	margin-top: 10px;
	margin-bottom: 0;
}

.info-box {
	background: var(--list-active-bg);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 12px;
	margin-bottom: 16px;
	font-size: 13px;
	color: var(--list-active-fg);
}

.info-box-title {
	font-weight: 600;
	color: var(--list-active-fg);
	margin-bottom: 6px;
}

.cache-details {
	margin-top: 16px;
}

.cache-location {
	margin-top: 20px;
}

.cache-location h4 {
	color: var(--text-primary);
	font-size: 14px;
	margin-bottom: 8px;
}

.location-box {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 12px;
	overflow-x: auto;
}

.location-box code {
	color: var(--link-color);
	font-size: 12px;
}

.cache-actions {
	margin-top: 20px;
}

.cache-actions h4 {
	color: var(--text-primary);
	font-size: 14px;
	margin-bottom: 8px;
}

/* Path Analyzer tab */
.folder-input-row {
	display: flex;
	gap: 8px;
	align-items: center;
}

.folder-input {
	flex: 1;
	background: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border, var(--border-color));
	border-radius: 4px;
	padding: 6px 10px;
	font-size: 13px;
	min-width: 0;
}

.folder-input:focus {
	outline: 1px solid var(--link-color);
	border-color: var(--link-color);
}

.tool-type-select {
	background: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border, var(--border-color));
	border-radius: 4px;
	padding: 6px 10px;
	font-size: 13px;
	cursor: pointer;
	min-width: 280px;
}

.analyzer-loading {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 20px;
	color: var(--text-muted);
	font-size: 13px;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}


`;

  // src/webview/shared/contextRefUtils.ts
  function getTotalContextRefs(refs) {
    return refs.file + refs.selection + refs.implicitSelection + refs.symbol + refs.codebase + refs.workspace + refs.terminal + refs.vscode + refs.copilotInstructions + refs.agentsMd + (refs.terminalLastCommand || 0) + (refs.terminalSelection || 0) + (refs.clipboard || 0) + (refs.changes || 0) + (refs.outputPanel || 0) + (refs.problemsPanel || 0) + (refs.pullRequest || 0);
  }
  var REF_LABELS = [
    { key: "file", full: "#file", abbr: "#file" },
    { key: "selection", full: "#selection", abbr: "#sel" },
    { key: "implicitSelection", full: "implicit", abbr: "impl" },
    { key: "symbol", full: "#symbol", abbr: "#sym" },
    { key: "codebase", full: "#codebase", abbr: "#cb" },
    { key: "workspace", full: "@workspace", abbr: "@ws" },
    { key: "terminal", full: "@terminal", abbr: "@term" },
    { key: "vscode", full: "@vscode", abbr: "@vsc" },
    { key: "terminalLastCommand", full: "#terminalLastCommand", abbr: "#termLC" },
    { key: "terminalSelection", full: "#terminalSelection", abbr: "#termSel" },
    { key: "clipboard", full: "#clipboard", abbr: "#clip" },
    { key: "changes", full: "#changes", abbr: "#chg" },
    { key: "outputPanel", full: "#outputPanel", abbr: "#out" },
    { key: "problemsPanel", full: "#problemsPanel", abbr: "#prob" },
    { key: "pullRequest", full: "#pr", abbr: "#pr" },
    { key: "copilotInstructions", full: "\u{1F4CB} instructions", abbr: "\u{1F4CB} inst" },
    { key: "agentsMd", full: "\u{1F916} agents", abbr: "\u{1F916} ag" }
  ];
  function getContextRefsSummary(refs, abbreviated = false) {
    const parts = [];
    for (const entry of REF_LABELS) {
      const count = refs[entry.key] || 0;
      if (count > 0) {
        const label = abbreviated ? entry.abbr : entry.full;
        parts.push(`${label}: ${count}`);
      }
    }
    return parts.length > 0 ? parts.join(", ") : "None";
  }

  // src/webview/diagnostics/main.ts
  var LOADING_PLACEHOLDER = "Loading...";
  var SESSION_FILES_SECTION_REGEX = /Session File Locations \(first 20\):[\s\S]*?(?=\n\s*\n|={70})/;
  var LOADING_MESSAGE = `\u23F3 Loading diagnostic data...

This may take a few moments depending on the number of session files.
The view will automatically update when data is ready.`;
  var vscode = acquireVsCodeApi();
  var initialData = getWindowData("__INITIAL_DIAGNOSTICS__");
  var diagState = createViewStateManager(vscode, {
    activeTab: void 0,
    activeSubtab: void 0
  });
  var currentSortColumn = "lastInteraction";
  var currentSortDirection = "desc";
  var currentEditorFilter = null;
  var currentContextRefFilter = null;
  var hideEmptySessions = true;
  var showOnlyUnattributed = false;
  var toolSortColumn = "avg";
  var toolSortDir = "desc";
  var storedToolFamilies;
  var storedDetailedFiles = [];
  var isLoading = true;
  var currentBackendInfo;
  var currentGithubAuth;
  function removeSessionFilesSection(reportText) {
    return reportText.replace(SESSION_FILES_SECTION_REGEX, "");
  }
  function formatDate(isoString) {
    if (!isoString) {
      return "N/A";
    }
    try {
      return escapeHtml(new Date(isoString).toLocaleString());
    } catch {
      return escapeHtml(isoString);
    }
  }
  function sanitizeNumber(value) {
    if (value === void 0 || value === null) {
      return "0";
    }
    const n5 = Number(value);
    if (!Number.isFinite(n5)) {
      return "0";
    }
    return Math.floor(n5).toString();
  }
  function formatTokenCount(value) {
    const n5 = Number(value ?? 0);
    if (!Number.isFinite(n5) || n5 === 0) {
      return "0";
    }
    if (n5 >= 1e9) {
      return `${(n5 / 1e9).toFixed(1)}B`;
    }
    if (n5 >= 1e6) {
      return `${(n5 / 1e6).toFixed(1)}M`;
    }
    if (n5 >= 1e3) {
      return `${(n5 / 1e3).toFixed(1)}K`;
    }
    return Math.floor(n5).toString();
  }
  function buildCandidatePathRow(cp, tbody) {
    const row = document.createElement("tr");
    if (!cp.exists) {
      row.style.opacity = "0.5";
    }
    const statusCell = document.createElement("td");
    statusCell.textContent = cp.exists ? "\u2705" : "\u274C";
    statusCell.style.textAlign = "center";
    const sourceCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = getEditorBadgeClass(cp.source);
    badge.textContent = `${getEditorIcon(cp.source)} ${cp.source}`;
    sourceCell.appendChild(badge);
    const pathCell = document.createElement("td");
    pathCell.setAttribute("title", cp.path);
    pathCell.style.fontFamily = "var(--vscode-editor-font-family, monospace)";
    pathCell.style.fontSize = "12px";
    pathCell.textContent = cp.path;
    row.append(statusCell, sourceCell, pathCell);
    tbody.appendChild(row);
  }
  function buildCrushGroupRow(crushEntries, tbody) {
    const anyExist = crushEntries.some((cp) => cp.exists);
    const row = document.createElement("tr");
    if (!anyExist) {
      row.style.opacity = "0.5";
    }
    const statusCell = document.createElement("td");
    statusCell.textContent = anyExist ? "\u2705" : "\u274C";
    statusCell.style.textAlign = "center";
    const sourceCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = getEditorBadgeClass("Crush");
    badge.textContent = `${getEditorIcon("Crush")} Crush`;
    sourceCell.appendChild(badge);
    const pathCell = document.createElement("td");
    pathCell.style.fontFamily = "var(--vscode-editor-font-family, monospace)";
    pathCell.style.fontSize = "12px";
    pathCell.style.lineHeight = "1.6";
    for (const cp of crushEntries) {
      const line = document.createElement("div");
      line.style.opacity = cp.exists ? "1" : "0.5";
      line.title = cp.path;
      line.textContent = `${cp.exists ? "\u2705" : "\u274C"} ${cp.path}`;
      pathCell.appendChild(line);
    }
    row.append(statusCell, sourceCell, pathCell);
    tbody.appendChild(row);
  }
  function buildCandidatePathsElement(candidatePaths) {
    const container = document.createElement("div");
    container.className = "candidate-paths-table";
    const heading = document.createElement("h4");
    heading.textContent = "Scanned Paths (all candidate locations):";
    container.appendChild(heading);
    const description = document.createElement("p");
    description.style.cssText = "color: #999; font-size: 12px; margin: 4px 0 8px 0;";
    description.textContent = "These are all the paths the extension checks for session files. Paths marked with \u2705 exist on this system.";
    container.appendChild(description);
    const table = document.createElement("table");
    table.className = "session-table";
    container.appendChild(table);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (const text of ["Status", "Source", "Path"]) {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    const sorted = [...candidatePaths].sort((a3, b3) => a3.exists !== b3.exists ? a3.exists ? -1 : 1 : a3.source.localeCompare(b3.source));
    const crushEntries = sorted.filter((cp) => cp.source.toLowerCase().includes("crush"));
    const otherEntries = sorted.filter((cp) => !cp.source.toLowerCase().includes("crush"));
    for (const cp of otherEntries) {
      buildCandidatePathRow(cp, tbody);
    }
    if (crushEntries.length > 0) {
      buildCrushGroupRow(crushEntries, tbody);
    }
    return container;
  }
  function getFileName(filePath) {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1];
  }
  function getRepoDisplayName(repoUrl) {
    if (!repoUrl) {
      return "";
    }
    let url = repoUrl.replace(/\.git$/, "");
    if (url.includes("@") && url.includes(":")) {
      const colonIndex = url.lastIndexOf(":");
      const atIndex = url.lastIndexOf("@");
      if (colonIndex > atIndex) {
        return url.substring(colonIndex + 1);
      }
    }
    try {
      if (url.includes("://")) {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter((p3) => p3);
        if (pathParts.length >= 2) {
          return `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
        }
        return urlObj.pathname.replace(/^\//, "");
      }
    } catch {
    }
    const parts = url.split("/").filter((p3) => p3);
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    }
    return url;
  }
  function getEditorBadgeClass(editor) {
    const lower = editor.toLowerCase();
    if (lower.includes("ms scout") || lower.includes("microsoft scout")) {
      return "editor-badge editor-badge-ms-scout";
    }
    if (lower.includes("visual studio")) {
      return "editor-badge editor-badge-vs";
    }
    if (lower.includes("jetbrains")) {
      return "editor-badge editor-badge-jetbrains";
    }
    if (lower.includes("mistral")) {
      return "editor-badge editor-badge-mistral-vibe";
    }
    if (lower.includes("antigravity")) {
      return "editor-badge editor-badge-antigravity";
    }
    if (lower.includes("gemini")) {
      return "editor-badge editor-badge-gemini-cli";
    }
    if (lower.includes("crush")) {
      return "editor-badge editor-badge-crush";
    }
    if (lower.includes("cursor")) {
      return "editor-badge editor-badge-cursor";
    }
    if (lower === "pi") {
      return "editor-badge editor-badge-pi";
    }
    return "editor-badge";
  }
  function getSortValue(file, column) {
    switch (column) {
      case "size":
        return file.size || 0;
      case "tokens":
        return file.tokens || 0;
      case "interactions":
        return file.interactions || 0;
      case "contextRefs":
        return getTotalContextRefs(file.contextReferences);
      default:
        return 0;
    }
  }
  function compareSessionFiles(a3, b3) {
    if (currentSortColumn === "lastInteraction") {
      const aVal = a3.lastInteraction;
      const bVal = b3.lastInteraction;
      if (!aVal && !bVal) {
        return 0;
      }
      if (!aVal) {
        return 1;
      }
      if (!bVal) {
        return -1;
      }
      const aNum2 = new Date(aVal).getTime();
      const bNum2 = new Date(bVal).getTime();
      return currentSortDirection === "desc" ? bNum2 - aNum2 : aNum2 - bNum2;
    }
    const aNum = getSortValue(a3, currentSortColumn);
    const bNum = getSortValue(b3, currentSortColumn);
    if (aNum === 0 && bNum === 0) {
      return 0;
    }
    return currentSortDirection === "desc" ? bNum - aNum : aNum - bNum;
  }
  function groupChildrenAfterParents(sorted, byFile) {
    const placed = /* @__PURE__ */ new Set();
    const result = [];
    for (const f3 of sorted) {
      if (placed.has(f3.file)) {
        continue;
      }
      result.push(f3);
      placed.add(f3.file);
      for (const childRef of f3.childInfo ?? []) {
        if (!childRef.sessionFile) {
          continue;
        }
        const childDetails = byFile.get(childRef.sessionFile);
        if (childDetails && !placed.has(childDetails.file)) {
          result.push(childDetails);
          placed.add(childDetails.file);
        }
      }
    }
    return result;
  }
  function sortSessionFiles(files) {
    const sorted = [...files].sort(compareSessionFiles);
    const byFile = /* @__PURE__ */ new Map();
    for (const f3 of sorted) {
      byFile.set(f3.file, f3);
    }
    return groupChildrenAfterParents(sorted, byFile);
  }
  function getSortIndicator(column) {
    if (currentSortColumn !== column) {
      return "";
    }
    return currentSortDirection === "desc" ? " \u25BC" : " \u25B2";
  }
  function getEditorStats(files) {
    const stats = {};
    for (const sf of files) {
      const editor = sf.editorSource || "Unknown";
      if (!stats[editor]) {
        stats[editor] = { count: 0, interactions: 0 };
      }
      stats[editor].count++;
      stats[editor].interactions += sf.interactions;
    }
    return stats;
  }
  function safeText(value) {
    if (value === null || value === void 0) {
      return "";
    }
    return escapeHtml(String(value));
  }
  function getUnattributedTokens(sf) {
    const tokens = sf.tokens || 0;
    if (tokens === 0 || !sf.modelUsage) {
      return 0;
    }
    const attributed = Object.values(sf.modelUsage).reduce((s4, m2) => s4 + m2.inputTokens + m2.outputTokens, 0);
    return attributed > 0 ? Math.max(0, tokens - attributed) : 0;
  }
  function applySessionFilters(detailedFiles) {
    let filteredFiles = currentEditorFilter ? detailedFiles.filter((sf) => sf.editorSource === currentEditorFilter) : detailedFiles;
    if (currentContextRefFilter) {
      filteredFiles = filteredFiles.filter((sf) => {
        const value = sf.contextReferences[currentContextRefFilter];
        return typeof value === "number" && value > 0;
      });
    }
    if (showOnlyUnattributed) {
      filteredFiles = filteredFiles.filter((sf) => getUnattributedTokens(sf) > 1e3);
    }
    const zeroInteractionCount = filteredFiles.filter((sf) => sf.interactions === 0).length;
    if (hideEmptySessions && zeroInteractionCount === filteredFiles.length && filteredFiles.length > 0) {
      hideEmptySessions = false;
    }
    if (hideEmptySessions) {
      filteredFiles = filteredFiles.filter((sf) => sf.interactions > 0);
    }
    return { filteredFiles, zeroInteractionCount };
  }
  function aggregateContextRefs(filteredFiles) {
    return filteredFiles.reduce((agg, sf) => {
      const r6 = sf.contextReferences;
      agg.file += r6.file;
      agg.symbol += r6.symbol;
      agg.selection += r6.selection;
      agg.implicitSelection += r6.implicitSelection;
      agg.codebase += r6.codebase;
      agg.workspace += r6.workspace;
      agg.terminal += r6.terminal;
      agg.vscode += r6.vscode;
      agg.copilotInstructions += r6.copilotInstructions;
      agg.agentsMd += r6.agentsMd;
      return agg;
    }, { file: 0, symbol: 0, selection: 0, implicitSelection: 0, codebase: 0, workspace: 0, terminal: 0, vscode: 0, copilotInstructions: 0, agentsMd: 0 });
  }
  function buildEditorPanelsHtml(detailedFiles, editorStats, editors) {
    return `<div class="editor-filter-panels">
    <div class="editor-panel ${currentEditorFilter === null ? "active" : ""}" data-editor=""><div class="editor-panel-icon">\u{1F310}</div><div class="editor-panel-name">All Editors</div><div class="editor-panel-stats">${detailedFiles.length} sessions</div></div>
    ${editors.map((editor) => `<div class="editor-panel ${currentEditorFilter === editor ? "active" : ""}" data-editor="${escapeHtml(editor)}"><div class="editor-panel-icon">${getEditorIcon(editor)}</div><div class="editor-panel-name">${escapeHtml(editor)}</div><div class="editor-panel-stats">${editorStats[editor].count} sessions \xB7 ${editorStats[editor].interactions} interactions</div></div>`).join("")}
  </div>`;
  }
  function buildSessionSummaryCardsHtml(filteredFiles, allFiles, totalInteractions, totalTokens, totalContextRefs, agg, zeroInteractionCount) {
    const mkRef = (key, icon, label) => agg[key] > 0 ? `<div class="context-ref-filter ${currentContextRefFilter === key ? "active" : ""}" data-ref-type="${key}">${icon} ${label} ${agg[key]}</div>` : "";
    const unattributedCount = allFiles.filter((sf) => getUnattributedTokens(sf) > 1e3).length;
    const unattributedCheckbox = unattributedCount > 0 ? `<label class="empty-sessions-toggle" title="Sessions where some debug-log tokens cannot be assigned to a specific model \u2014 may indicate incomplete model attribution in the debug log"><input type="checkbox" id="show-only-unattributed" ${showOnlyUnattributed ? "checked" : ""}>\u26A0\uFE0F Show only sessions with unattributed tokens<span class="hidden-count">(${unattributedCount} session${unattributedCount === 1 ? "" : "s"})</span></label>` : "";
    return `<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F4C1} ${currentEditorFilter ? "Filtered" : "Total"} Sessions</div><div class="summary-value">${filteredFiles.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4AC} Interactions</div><div class="summary-value">${totalInteractions}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1FA99} Tokens</div><div class="summary-value" title="${totalTokens.toLocaleString()} tokens">${formatTokenCount(totalTokens)}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F517} Context References</div><div class="summary-value">${safeText(totalContextRefs)}</div><div class="summary-sub">${totalContextRefs === 0 ? "None" : ""}${mkRef("file", "", "#file")}${mkRef("symbol", "", "#sym")}${mkRef("implicitSelection", "", "implicit")}${mkRef("copilotInstructions", "\u{1F4CB}", "instructions")}${mkRef("agentsMd", "\u{1F916}", "agents")}${mkRef("workspace", "", "@workspace")}${mkRef("vscode", "", "@vscode")}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4C5} Time Range</div><div class="summary-value">Last 14 days</div></div>
  </div>
  <div class="filter-options"><label class="empty-sessions-toggle"><input type="checkbox" id="hide-empty-sessions" ${hideEmptySessions ? "checked" : ""}>Hide sessions with 0 interactions${zeroInteractionCount > 0 ? `<span class="hidden-count">(${zeroInteractionCount} hidden)</span>` : ""}</label>${unattributedCheckbox}</div>`;
  }
  function buildHierarchyBadgesHtml(sf) {
    let html = "";
    if (sf.parentInfo) {
      const parentTitle = escapeHtml(sf.parentInfo.name.length > 30 ? sf.parentInfo.name.substring(0, 30) + "\u2026" : sf.parentInfo.name);
      const linkAttr = sf.parentInfo.sessionFile ? ` href="#" class="session-hierarchy-badge hierarchy-parent session-file-link" data-file="${encodeURIComponent(sf.parentInfo.sessionFile)}"` : ` class="session-hierarchy-badge hierarchy-parent"`;
      html += `<a${linkAttr} title="Parent session: ${escapeHtml(sf.parentInfo.name)}">\u2191 Parent: ${parentTitle}</a>`;
    }
    if (sf.totalChildCount && sf.totalChildCount > 0) {
      const count = sf.totalChildCount;
      const label = count === 1 ? "1 child session" : `${count} child sessions`;
      html += `<span class="session-hierarchy-badge hierarchy-children" title="${label}">\u2193 ${count} ${count === 1 ? "Child" : "Children"}</span>`;
    }
    return html ? `<div class="session-hierarchy-badges">${html}</div>` : "";
  }
  function buildUnattributedBadge(sf) {
    const unattributed = getUnattributedTokens(sf);
    if (unattributed <= 1e3) {
      return "";
    }
    const pct = Math.round(unattributed / (sf.tokens || 1) * 100);
    return ` <span title="\u26A0\uFE0F ${unattributed.toLocaleString()} tokens (~${pct}%) not attributed to any model \u2014 debug log events without a model field" style="color:#f59e0b; cursor:help; font-size:0.9em;">\u26A0\uFE0F</span>`;
  }
  function buildSessionTableHtml(sortedFiles) {
    const rows = sortedFiles.map((sf, idx) => {
      const editorLabel = sf.editorName || sf.editorSource;
      const isChild = !!sf.parentInfo;
      const rawTitleHtml = sf.title ? `<a href="#" class="session-file-link" data-file="${encodeURIComponent(sf.file)}" title="${escapeHtml(sf.title)}">${escapeHtml(sf.title.length > 40 ? sf.title.substring(0, 40) + "..." : sf.title)}</a>` : `<a href="#" class="session-file-link empty-session-link" data-file="${encodeURIComponent(sf.file)}" title="Empty session">(Empty session)</a>`;
      const titleHtml = isChild ? `<span class="child-title-indent">${rawTitleHtml}</span>` : rawTitleHtml;
      const hierarchyBadges = buildHierarchyBadgesHtml(sf);
      const repoLabel = sf.repository ? escapeHtml(getRepoDisplayName(sf.repository)) : sf.file.includes("session-store.db") ? '<span style="color: #888; font-style: italic;">No workspace</span>' : '<span style="color: #666;">\u2014</span>';
      const repoTitle = sf.repository ? escapeHtml(sf.repository) : sf.file.includes("session-store.db") ? "Chat session \u2014 no workspace connected" : "No repository detected";
      const isUnknownEditor = (sf.editorName || sf.editorSource || "Unknown") === "Unknown";
      const rowClass = isChild ? ' class="child-session-row"' : "";
      return `<tr${rowClass}><td>${idx + 1}</td><td><span class="${getEditorBadgeClass(editorLabel)}" title="${escapeHtml(sf.editorSource)}">${getEditorIcon(editorLabel)} ${escapeHtml(editorLabel)}</span></td><td class="session-title" title="${sf.title ? escapeHtml(sf.title) : "Empty session"}">${hierarchyBadges}${titleHtml}</td><td class="repository-cell" title="${repoTitle}">${repoLabel}</td><td>${formatFileSize(sf.size)}</td><td title="${Number(sf.tokens || 0).toLocaleString()} tokens">${formatTokenCount(sf.tokens)}${buildUnattributedBadge(sf)}</td><td>${sanitizeNumber(sf.interactions)}</td><td title="${escapeHtml(getContextRefsSummary(sf.contextReferences))}">${sanitizeNumber(getTotalContextRefs(sf.contextReferences))}</td><td>${formatDate(sf.lastInteraction)}</td><td><a href="#" class="view-formatted-link" data-file="${encodeURIComponent(sf.file)}" title="View formatted JSONL file">\u{1F4C4} View</a>${isUnknownEditor ? ` <a href="#" class="report-editor-link" data-path="${encodeURIComponent(sf.file)}" title="Report this unknown path so we can add editor support">\u{1F4E2} Report</a>` : ""}</td></tr>`;
    }).join("");
    return `<div class="table-container"><table class="session-table"><thead><tr><th>#</th><th>Editor</th><th>Title</th><th>Repository</th><th class="sortable" data-sort="size">Size${getSortIndicator("size")}</th><th class="sortable" data-sort="tokens">Tokens${getSortIndicator("tokens")}</th><th class="sortable" data-sort="interactions">Interactions${getSortIndicator("interactions")}</th><th class="sortable" data-sort="contextRefs">Context Refs${getSortIndicator("contextRefs")}</th><th class="sortable" data-sort="lastInteraction">Last Interaction${getSortIndicator("lastInteraction")}</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function renderSessionTable(detailedFiles, isLoading2 = false) {
    if (isLoading2) {
      return `<div class="loading-state"><div class="loading-spinner">\u23F3</div><div class="loading-text">Loading session files...</div><div class="loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>`;
    }
    if (detailedFiles.length === 0) {
      return '<p style="color: #999;">No session files with activity in the last 14 days.</p>';
    }
    const editorStats = getEditorStats(detailedFiles);
    const editors = Object.keys(editorStats).sort();
    const { filteredFiles, zeroInteractionCount } = applySessionFilters(detailedFiles);
    const totalInteractions = filteredFiles.reduce((sum, sf) => sum + Number(sf.interactions || 0), 0);
    const totalTokens = filteredFiles.reduce((sum, sf) => sum + Number(sf.tokens || 0), 0);
    const totalContextRefs = filteredFiles.reduce((sum, sf) => sum + getTotalContextRefs(sf.contextReferences), 0);
    const agg = aggregateContextRefs(filteredFiles);
    const sortedFiles = sortSessionFiles(filteredFiles);
    return `${buildEditorPanelsHtml(detailedFiles, editorStats, editors)}${buildSessionSummaryCardsHtml(filteredFiles, detailedFiles, totalInteractions, totalTokens, totalContextRefs, agg, zeroInteractionCount)}${buildSessionTableHtml(sortedFiles)}`;
  }
  function counterRow(key, label, value) {
    return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="number" class="debug-counter-input" data-key="${escapeHtml(key)}" value="${value}" min="0" step="1"
          style="width:70px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 2px 6px; font-family: var(--vscode-editor-font-family, monospace);" />
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-counter-set" data-key="${escapeHtml(key)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`;
  }
  function stringRow(key, label, value) {
    const display = value ? `\u2705 ${escapeHtml(value)}` : "\u274C (not set)";
    return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;" colspan="2">
        <span style="font-family: var(--vscode-editor-font-family, monospace);">${display}</span>
      </td>
    </tr>`;
  }
  function flagRow(key, label, value) {
    return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="checkbox" class="debug-flag-input" data-key="${escapeHtml(key)}" ${value ? "checked" : ""} />
        <span style="margin-left:6px; font-family: var(--vscode-editor-font-family, monospace);">${value ? "\u2705 true" : "\u274C false"}</span>
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-flag-set" data-key="${escapeHtml(key)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`;
  }
  function renderDebugTab(counters) {
    const c4 = counters ?? { openCount: 0, unknownMcpOpenCount: 0, fluencyBannerDismissed: false, unknownMcpDismissedVersion: "" };
    return `
    <div id="tab-debug" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F41B} Debug \u2014 Global State Counters</div>
        <div>Visible only when a debugger is attached. Edit counters and dismissed flags stored in VS Code global state, then click Set to apply. Changes take effect immediately.</div>
      </div>
      <div class="cache-details">
        <h4>Notification Counters</h4>
        <table><tbody>
          ${counterRow("extension.openCount", "extension.openCount (fluency banner threshold: 5)", c4.openCount)}
          ${counterRow("extension.unknownMcpOpenCount", "extension.unknownMcpOpenCount (unknown MCP threshold: 8)", c4.unknownMcpOpenCount)}
        </tbody></table>
        <h4 style="margin-top:16px;">Dismissed Flags</h4>
        <table><tbody>
          ${flagRow("news.fluencyScoreBanner.v1.dismissed", "news.fluencyScoreBanner.v1.dismissed", c4.fluencyBannerDismissed)}
          ${stringRow("news.unknownMcpTools.dismissedVersion", "news.unknownMcpTools.dismissedVersion", c4.unknownMcpDismissedVersion)}
        </tbody></table>
        <div style="margin-top: 16px;">
          <button class="button secondary" id="btn-reset-debug-counters"><span>\u{1F504}</span><span>Reset All Counters &amp; Dismissed Flags</span></button>
        </div>
      </div>
    </div>`;
  }
  function renderGitHubAuthPanel(githubAuth) {
    const authenticated = githubAuth?.authenticated || false;
    const username = githubAuth?.username || "";
    const statusColor = authenticated ? "#2d6a4f" : "#666";
    const statusIcon = authenticated ? "\u2705" : "\u26AA";
    const statusText = authenticated ? "Authenticated" : "Not Authenticated";
    return `
<div class="info-box">
  <div class="info-box-title">\u{1F511} GitHub Authentication</div>
  <div>
    Authenticate with GitHub to unlock additional features in future releases.
  </div>
</div>

<div class="summary-cards">
  <div class="summary-card" style="border-left: 4px solid ${statusColor};">
    <div class="summary-label">${statusIcon} Status</div>
    <div class="summary-value" style="font-size: 16px; color: ${statusColor};">${statusText}</div>
  </div>
  ${authenticated ? `
  <div class="summary-card">
    <div class="summary-label">\u{1F464} Logged in as</div>
    <div class="summary-value" style="font-size: 16px;">${escapeHtml(username)}</div>
  </div>
  ` : ""}
</div>

${authenticated ? `
  <div style="margin-top: 24px;">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">
      You are currently authenticated with GitHub. This enables future features such as:
    </p>
    <ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;">
      <li>Repository-specific usage tracking</li>
      <li>Team collaboration features</li>
      <li>Advanced analytics and insights</li>
    </ul>
  </div>
` : `
  <div style="margin-top: 24px;">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">
      Sign in with your GitHub account to unlock future features. This uses VS Code's built-in authentication.
    </p>
  </div>
`}

<div class="button-group">
  ${authenticated ? `
    <button class="button secondary" id="btn-sign-out-github">
      <span>\u{1F50C}</span>
      <span>Disconnect GitHub</span>
    </button>
  ` : `
    <button class="button" id="btn-authenticate-github">
      <span>\u{1F511}</span>
      <span>Authenticate with GitHub</span>
    </button>
  `}
</div>
  `;
  }
  function getBackendStatus(isConfigured, enabled) {
    return isConfigured ? { color: "#2d6a4f", icon: "\u2705", text: "Configured & Enabled" } : enabled ? { color: "#d97706", icon: "\u26A0\uFE0F", text: "Enabled but Not Configured" } : { color: "#666", icon: "\u26AA", text: "Disabled" };
  }
  function renderAzureDetailsSection(azureInfo) {
    if (!azureInfo.isConfigured) {
      return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Azure Storage</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">To enable cloud synchronization, configure an Azure Storage account via the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Azure subscription with Storage Account access</li><li>Appropriate permissions (Storage Table Data Contributor or Storage Account Key)</li><li>VS Code signed in with your Azure account (for Entra ID auth)</li></ul></div>`;
    }
    return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Storage Account</td><td>${escapeHtml(azureInfo.storageAccount)}</td></tr><tr><td style="font-weight: 600;">Subscription ID</td><td>${escapeHtml(azureInfo.subscriptionId)}</td></tr><tr><td style="font-weight: 600;">Resource Group</td><td>${escapeHtml(azureInfo.resourceGroup)}</td></tr><tr><td style="font-weight: 600;">Aggregation Table</td><td>${escapeHtml(azureInfo.aggTable)}</td></tr><tr><td style="font-weight: 600;">Events Table</td><td>${escapeHtml(azureInfo.eventsTable)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4BB} Unique Devices</div><div class="summary-value">${escapeHtml(String(azureInfo.deviceCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Based on workspace IDs</div></div><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${escapeHtml(String(azureInfo.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u2601\uFE0F Cloud Records</div><div class="summary-value">${azureInfo.recordCount !== null ? escapeHtml(String(azureInfo.recordCount)) : "\u2014"}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Azure Storage records</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Sync Status</div><div class="summary-value" style="font-size: 14px;">${azureInfo.lastSyncTime ? formatDate(azureInfo.lastSyncTime) : "Never"}</div></div></div></div>`;
  }
  function renderAzureStoragePanel(azureInfo) {
    const { color, icon, text } = getBackendStatus(azureInfo.isConfigured, azureInfo.enabled);
    return `<div class="info-box"><div class="info-box-title">\u2601\uFE0F Azure Storage Backend</div><div>Sync your token usage data to Azure Storage Tables for team-wide reporting and multi-device access.</div></div>
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${color};"><div class="summary-label">${icon} Status</div><div class="summary-value" style="font-size: 16px; color: ${color};">${text}</div></div><div class="summary-card"><div class="summary-label">\u{1F510} Auth Mode</div><div class="summary-value" style="font-size: 16px;">${azureInfo.authMode === "entraId" ? "Entra ID" : "Shared Key"}</div></div><div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${escapeHtml(azureInfo.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${azureInfo.lastSyncTime ? getTimeSince(azureInfo.lastSyncTime) : "Never"}</div></div></div>
    ${renderAzureDetailsSection(azureInfo)}
    <div class="button-group"><button class="button" id="btn-configure-backend"><span>${azureInfo.isConfigured ? "\u2699\uFE0F" : "\u{1F527}"}</span><span>${azureInfo.isConfigured ? "Manage Backend" : "Configure Backend"}</span></button></div>`;
  }
  function renderTeamServerGithubAuthCard(githubAuth, githubNotAuthenticated) {
    const authColor = githubNotAuthenticated ? "#d97706" : githubAuth?.authenticated ? "#2d6a4f" : "#666";
    const authIcon = githubNotAuthenticated ? "\u26A0\uFE0F" : githubAuth?.authenticated ? "\u2705" : "\u26AA";
    const authValue = githubNotAuthenticated ? "Not Authenticated" : githubAuth?.authenticated ? escapeHtml(githubAuth.username || "Authenticated") : "Not Authenticated";
    return `<div class="summary-card" style="border-left: 4px solid ${authColor};"><div class="summary-label">${authIcon} GitHub Auth</div><div class="summary-value" style="font-size: 14px; color: ${authColor};">${authValue}</div></div>`;
  }
  function renderTeamServerDetailsSection(teamInfo) {
    if (!teamInfo.isConfigured) {
      return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Team Server</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">Deploy the sharing server and configure its URL in the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Deploy the sharing server (see the <code>sharing-server/</code> folder in the repository)</li><li>Enter the server's base URL in the Backend configuration panel</li><li>Data syncs automatically every 5 minutes once configured</li></ul></div>`;
    }
    return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Server URL</td><td>${escapeHtml(teamInfo.endpointUrl)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${escapeHtml(String(teamInfo.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Last Sync</div><div class="summary-value" style="font-size: 14px;">${teamInfo.lastSyncTime ? formatDate(teamInfo.lastSyncTime) : "Never"}</div></div></div></div>`;
  }
  function renderTeamServerPanel(teamInfo, githubAuth) {
    const { color, icon, text } = getBackendStatus(teamInfo.isConfigured, teamInfo.enabled);
    const githubNotAuthenticated = teamInfo.isConfigured && !githubAuth?.authenticated;
    const authWarning = githubNotAuthenticated ? `<button id="btn-team-server-auth-warning" style="width: 100%; margin-bottom: 16px; padding: 12px 16px; background: rgba(217, 119, 6, 0.15); border: 1px solid #d97706; border-radius: 6px; display: flex; gap: 10px; align-items: center; cursor: pointer; text-align: left;" title="Click to sign in to GitHub"><span style="font-size: 18px; flex-shrink: 0;">\u26A0\uFE0F</span><div style="flex: 1;"><div style="color: #fbbf24; font-weight: 600; font-size: 13px; margin-bottom: 4px;">GitHub Authentication Required</div><div style="color: #d4a017; font-size: 12px;">Team server sync will not run until you sign in to GitHub. <strong style="color: #fbbf24;">Click here to sign in.</strong></div></div><span style="color: #fbbf24; font-size: 18px; flex-shrink: 0;">\u2192</span></button>` : "";
    return `<div class="info-box"><div class="info-box-title">\u{1F5A5}\uFE0F Team Server Backend</div><div>Sync your token usage data to a self-hosted team server for team-wide reporting.</div></div>
    ${authWarning}
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${color};"><div class="summary-label">${icon} Status</div><div class="summary-value" style="font-size: 16px; color: ${color};">${text}</div></div>${renderTeamServerGithubAuthCard(githubAuth, githubNotAuthenticated)}<div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${escapeHtml(teamInfo.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${teamInfo.lastSyncTime ? getTimeSince(teamInfo.lastSyncTime) : "Never"}</div></div></div>
    ${renderTeamServerDetailsSection(teamInfo)}
    <div class="button-group"><button class="button" id="btn-configure-backend-team"><span>${teamInfo.isConfigured ? "\u2699\uFE0F" : "\u{1F527}"}</span><span>${teamInfo.isConfigured ? "Manage Backend" : "Configure Backend"}</span></button></div>`;
  }
  function renderBackendStoragePanel(backendInfo, githubAuth) {
    if (!backendInfo) {
      return `
      <div class="info-box">
        <div class="info-box-title">\u2601\uFE0F Backend Storage</div>
        <div>Backend storage information is not available. This may be a temporary issue.</div>
        <div class="button-group" style="margin-top: 12px;">
          <button class="button" id="btn-configure-backend">
            <span>\u{1F527}</span>
            <span>Configure Backend</span>
          </button>
        </div>
      </div>
    `;
    }
    return `
    <div class="subtab-bar">
      <button class="subtab active" data-subtab="backend-azure">\u2601\uFE0F Azure Storage</button>
      <button class="subtab" data-subtab="backend-teamserver">\u{1F5A5}\uFE0F Team Server</button>
    </div>
    <div id="subtab-backend-azure" class="subtab-content active">
      ${renderAzureStoragePanel(backendInfo.azure)}
    </div>
    <div id="subtab-backend-teamserver" class="subtab-content">
      ${renderTeamServerPanel(backendInfo.teamServer, githubAuth)}
    </div>
  `;
  }
  function renderFolderAnalyzerTab() {
    return `
    <div class="info-box">
      <div class="info-box-title">\u{1F52C} Path Analyzer</div>
      <div>
        Analyze any folder to find session files and inspect their content.
        This helps troubleshoot why the extension isn't finding your AI tool's session files,
        or verify that files from another OS would be recognized.
      </div>
    </div>
    <div class="section">
      <div class="section-title">\u{1F4C1} Folder Selection</div>
      <div class="folder-input-row">
        <input
          type="text"
          id="folder-path-input"
          class="folder-input"
          placeholder="Paste a folder path here, e.g. /Users/you/.claude/projects/abc123"
        />
        <button class="button secondary" id="btn-browse-folder">\u{1F4C2} Browse\u2026</button>
      </div>
      <div style="margin-top: 14px;">
        <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 6px;">
          Tool type (determines which file types to scan):
        </label>
        <select id="tool-type-select" class="tool-type-select">
          <option value="auto">\u{1F50D} Auto-detect (all JSON / JSONL files)</option>
          <option value="antigravity">\u{1F680} Antigravity (.jsonl only)</option>
          <option value="claude-code">\u{1F7E3} Claude Code (.jsonl only)</option>
          <option value="claude-desktop">\u{1F5A5}\uFE0F Claude Desktop</option>
          <option value="continue">\u26A1 Continue</option>
          <option value="copilot-chat">\u{1F499} GitHub Copilot Chat (VS Code)</option>
          <option value="copilot-cli">\u{1F916} GitHub Copilot CLI</option>
          <option value="gemini-cli">\u{1F48E} Gemini CLI (.jsonl only)</option>
          <option value="mistral-vibe">\u{1F525} Mistral Vibe</option>
          <option value="opencode">\u{1F7E2} OpenCode (JSON format only \u2014 DB not supported)</option>
        </select>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-analyze-folder">\u{1F50D} Analyze</button>
      </div>
    </div>
    <div id="folder-analysis-results"></div>
  `;
  }
  function buildFolderFileTableRow(f3, idx, folderPath) {
    const hasData = f3.interactions > 0 || f3.tokens > 0;
    const rel = f3.file.startsWith(folderPath) ? f3.file.slice(folderPath.length).replace(/^[/\\]/, "") : getFileName(f3.file);
    const safeInteractions = Number(f3.interactions);
    const interactionsCell = safeInteractions > 0 ? `<strong>${escapeHtml(String(safeInteractions))}</strong>` : `<span style="color: var(--text-muted);">0</span>`;
    const safeTokens = Number(f3.tokens);
    const tokensCell = safeTokens > 0 ? `<strong title="${escapeHtml(String(safeTokens.toLocaleString()))} tokens">${escapeHtml(String(formatTokenCount(safeTokens)))}</strong>` : `<span style="color: var(--text-muted);">0</span>`;
    return `
    <tr style="${hasData ? "" : "opacity: 0.45;"}">
      <td>${idx + 1}</td>
      <td title="${escapeHtml(f3.file)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(rel)}</td>
      <td>${escapeHtml(String(formatFileSize(f3.size)))}</td>
      <td>${interactionsCell}</td>
      <td>${tokensCell}</td>
      <td>${formatDate(f3.modified)}</td>
    </tr>`;
  }
  function renderFolderAnalysisResults(files, totalScanned, parseErrors, truncated, folderPath) {
    const sessionFiles = files.filter((f3) => f3.interactions > 0 || f3.tokens > 0);
    const totalInteractions = files.reduce((sum, f3) => sum + Number(f3.interactions), 0);
    const totalTokens = files.reduce((sum, f3) => sum + Number(f3.tokens), 0);
    const sorted = [...files].sort((a3, b3) => {
      const aScore = a3.interactions * 1e3 + a3.tokens;
      const bScore = b3.interactions * 1e3 + b3.tokens;
      return bScore - aScore;
    });
    const truncatedWarning = truncated ? `<div class="info-box" style="margin-bottom: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);">
        <div>\u26A0\uFE0F Scan limit reached (500 files). Results may be incomplete. Try a more specific subfolder.</div>
      </div>` : "";
    const emptyState = `
    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
      <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
      <div style="font-size: 14px;">No matching files found in this folder.</div>
      <div style="font-size: 12px; margin-top: 8px;">Try a different folder path or tool type.</div>
    </div>`;
    const tableRows = sorted.map((f3, idx) => buildFolderFileTableRow(f3, idx, folderPath)).join("");
    return `
    <div class="section" style="margin-top: 0;">
      <div class="section-title">\u{1F4CA} Analysis Results</div>
      ${truncatedWarning}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Files Scanned</div>
          <div class="summary-value">${escapeHtml(String(totalScanned))}${truncated ? "+" : ""}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u2705 With Sessions</div>
          <div class="summary-value">${sessionFiles.length}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${files.length - sessionFiles.length} empty / unknown</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F4AC} Interactions</div>
          <div class="summary-value">${escapeHtml(String(totalInteractions))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1FA99} Tokens</div>
          <div class="summary-value" title="${escapeHtml(String(totalTokens.toLocaleString()))} tokens">${escapeHtml(String(formatTokenCount(totalTokens)))}</div>
        </div>
        ${parseErrors > 0 ? `
        <div class="summary-card" style="border-left: 3px solid #d97706;">
          <div class="summary-label">\u26A0\uFE0F Unreadable</div>
          <div class="summary-value" style="color: #d97706;">${escapeHtml(String(parseErrors))}</div>
        </div>` : ""}
      </div>
      ${files.length === 0 ? emptyState : `
        <div class="table-container" style="margin-top: 12px; max-height: 420px;">
          <table class="session-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File</th>
                <th>Size</th>
                <th>Interactions</th>
                <th>Tokens</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`}
    </div>`;
  }
  function groupSessionFolders(raw) {
    const result = [];
    const jbBuckets = /* @__PURE__ */ new Map();
    for (const sf of raw || []) {
      const norm = String(sf.dir || "").replace(/\\/g, "/");
      const m2 = norm.match(/^(.*\/\.copilot\/jb)\/[^/]+\/?$/);
      if (m2) {
        const parent = m2[1];
        const existing = jbBuckets.get(parent);
        if (existing) {
          existing.count += sf.count;
        } else {
          const tail = norm.length - parent.length;
          const parentNative = sf.dir.slice(0, sf.dir.length - tail);
          jbBuckets.set(parent, { dir: parentNative, count: sf.count, editorName: sf.editorName || "JetBrains" });
        }
      } else {
        result.push(sf);
      }
    }
    for (const bucket of jbBuckets.values()) {
      result.push(bucket);
    }
    return result;
  }
  function getHomeDirectory() {
    const win = window;
    return win.process?.env?.HOME || win.process?.env?.USERPROFILE || "";
  }
  function buildSessionFolderRow(sf, home) {
    let display = sf.dir;
    if (home && display.startsWith(home)) {
      display = display.replace(home, "~");
    }
    const editorName = sf.editorName || "Unknown";
    const row = document.createElement("tr");
    const folderCell = document.createElement("td");
    folderCell.setAttribute("title", sf.dir);
    folderCell.textContent = display;
    row.appendChild(folderCell);
    const editorCell = document.createElement("td");
    const editorBadge = document.createElement("span");
    editorBadge.className = getEditorBadgeClass(editorName);
    editorBadge.textContent = `${getEditorIcon(editorName)} ${editorName}`;
    editorCell.appendChild(editorBadge);
    row.appendChild(editorCell);
    const countCell = document.createElement("td");
    countCell.textContent = String(sf.count);
    row.appendChild(countCell);
    const openCell = document.createElement("td");
    const openLink = document.createElement("a");
    openLink.href = "#";
    openLink.className = "reveal-link";
    openLink.setAttribute("data-path", encodeURIComponent(sf.dir));
    openLink.textContent = "Open directory";
    openCell.appendChild(openLink);
    if (editorName === "Unknown") {
      const reportLink = document.createElement("a");
      reportLink.href = "#";
      reportLink.className = "report-editor-link";
      reportLink.setAttribute("data-path", encodeURIComponent(sf.dir));
      reportLink.setAttribute("title", "Report this unknown path so we can add editor support");
      reportLink.textContent = "\u{1F4E2} Report";
      openCell.appendChild(document.createTextNode(" "));
      openCell.appendChild(reportLink);
    }
    row.appendChild(openCell);
    return row;
  }
  function buildSessionFoldersElement(folders) {
    const sorted = [...folders].sort((a3, b3) => b3.count - a3.count);
    const totalSessions = sorted.reduce((sum, sf) => sum + sf.count, 0);
    const home = getHomeDirectory();
    const container = document.createElement("div");
    container.className = "session-folders-table";
    const heading = document.createElement("h4");
    heading.textContent = "Main Session Folders (by editor root):";
    container.appendChild(heading);
    const table = document.createElement("table");
    table.className = "session-table";
    container.appendChild(table);
    const thead = document.createElement("thead");
    table.appendChild(thead);
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);
    for (const text of ["Folder", "Editor", "# of Sessions", "Open"]) {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    }
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    for (const sf of sorted) {
      tbody.appendChild(buildSessionFolderRow(sf, home));
    }
    const totalRow = document.createElement("tr");
    totalRow.style.borderTop = "2px solid #5a5a5a";
    totalRow.style.fontWeight = "600";
    totalRow.style.background = "rgba(255, 255, 255, 0.05)";
    const totalLabelCell = document.createElement("td");
    totalLabelCell.setAttribute("colspan", "2");
    totalLabelCell.style.textAlign = "right";
    totalLabelCell.style.paddingRight = "16px";
    totalLabelCell.textContent = "Total:";
    totalRow.appendChild(totalLabelCell);
    const totalCountCell = document.createElement("td");
    totalCountCell.textContent = String(totalSessions);
    totalRow.appendChild(totalCountCell);
    totalRow.appendChild(document.createElement("td"));
    tbody.appendChild(totalRow);
    return container;
  }
  function setupStorageLinkHandlers() {
    document.querySelectorAll(".open-storage-link").forEach((link) => {
      link.addEventListener("click", (e7) => {
        e7.preventDefault();
        const path = decodeURIComponent(
          link.getAttribute("data-path") || ""
        );
        if (path) {
          vscode.postMessage({ command: "revealPath", path });
        }
      });
    });
  }
  function setupGitHubAuthHandlers() {
    document.getElementById("btn-authenticate-github")?.addEventListener("click", () => {
      vscode.postMessage({ command: "authenticateGitHub" });
    });
    document.getElementById("btn-sign-out-github")?.addEventListener("click", () => {
      vscode.postMessage({ command: "signOutGitHub" });
    });
  }
  function activateSubtab(subtabId) {
    const subtabEl = document.querySelector(`.subtab[data-subtab="${subtabId}"]`);
    const contentEl = document.getElementById(`subtab-${subtabId}`);
    if (subtabEl && contentEl) {
      const subtabBar = subtabEl.closest(".subtab-bar");
      if (subtabBar) {
        subtabBar.querySelectorAll(".subtab").forEach((s4) => s4.classList.remove("active"));
      }
      document.querySelectorAll(".subtab-content").forEach((c4) => c4.classList.remove("active"));
      subtabEl.classList.add("active");
      contentEl.classList.add("active");
      return true;
    }
    return false;
  }
  function activateTab(tabId) {
    const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(`tab-${tabId}`);
    if (tabButton && tabContent) {
      document.querySelectorAll(".tab").forEach((t4) => t4.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c4) => c4.classList.remove("active"));
      tabButton.classList.add("active");
      tabContent.classList.add("active");
      return true;
    }
    return false;
  }
  function setupSortHandlers() {
    document.querySelectorAll(".sortable").forEach((header) => {
      header.addEventListener("click", () => {
        const sortColumn = header.getAttribute(
          "data-sort"
        );
        if (sortColumn) {
          if (currentSortColumn === sortColumn) {
            currentSortDirection = currentSortDirection === "desc" ? "asc" : "desc";
          } else {
            currentSortColumn = sortColumn;
            currentSortDirection = "desc";
          }
          reRenderTable();
        }
      });
    });
  }
  function setupEditorFilterHandlers() {
    document.querySelectorAll(".editor-panel").forEach((panel) => {
      panel.addEventListener("click", () => {
        const editor = panel.getAttribute("data-editor");
        currentEditorFilter = editor === "" ? null : editor;
        reRenderTable();
      });
    });
  }
  function setupContextRefFilterHandlers() {
    document.querySelectorAll(".context-ref-filter").forEach((filter) => {
      filter.addEventListener("click", () => {
        const refType = filter.getAttribute(
          "data-ref-type"
        );
        if (currentContextRefFilter === refType) {
          currentContextRefFilter = null;
        } else {
          currentContextRefFilter = refType;
        }
        reRenderTable();
      });
    });
  }
  function setupUnattributedFilterHandler() {
    const checkbox = document.getElementById("show-only-unattributed");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        showOnlyUnattributed = checkbox.checked;
        reRenderTable();
      });
    }
  }
  function setupZeroInteractionFilterHandler() {
    const checkbox = document.getElementById("hide-empty-sessions");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        hideEmptySessions = checkbox.checked;
        reRenderTable();
      });
    }
  }
  function setupBackendButtonHandlers() {
    document.getElementById("btn-configure-backend")?.addEventListener("click", () => {
      vscode.postMessage({ command: "configureBackend" });
    });
    document.getElementById("btn-configure-backend-team")?.addEventListener("click", () => {
      diagState.patch({ activeTab: "backend", activeSubtab: "backend-teamserver" });
      vscode.postMessage({ command: "configureTeamServer" });
    });
    document.getElementById("btn-team-server-auth-warning")?.addEventListener("click", () => {
      vscode.postMessage({ command: "authenticateGitHub" });
    });
    document.getElementById("btn-open-settings")?.addEventListener("click", () => {
      vscode.postMessage({ command: "openSettings" });
    });
    document.getElementById("btn-open-display-settings")?.addEventListener("click", () => {
      vscode.postMessage({ command: "openDisplaySettings" });
    });
  }
  function setupDisplaySettingHandlers() {
    document.getElementById("select-show-tokens")?.addEventListener("change", (e7) => {
      const value = e7.target.value;
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.showTokens", value });
    });
    document.getElementById("select-show-cost")?.addEventListener("change", (e7) => {
      const value = e7.target.value;
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.showCost", value });
    });
    document.getElementById("input-monthly-budget")?.addEventListener("change", (e7) => {
      const input = e7.target;
      const raw = parseFloat(input.value);
      const value = isNaN(raw) ? 0 : Math.min(99999, Math.max(0, Math.round(raw * 100) / 100));
      input.value = value.toString();
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.monthlyBudget", value });
    });
  }
  function setupSubtabHandlers() {
    document.querySelectorAll(".subtab").forEach((subtab) => {
      subtab.addEventListener("click", () => {
        const subtabId = subtab.getAttribute("data-subtab");
        if (!subtabId) {
          return;
        }
        const subtabBar = subtab.closest(".subtab-bar");
        if (subtabBar) {
          subtabBar.querySelectorAll(".subtab").forEach((s4) => s4.classList.remove("active"));
        }
        document.querySelectorAll(".subtab-content").forEach((c4) => c4.classList.remove("active"));
        subtab.classList.add("active");
        document.getElementById(`subtab-${subtabId}`)?.classList.add("active");
        diagState.patch({ activeSubtab: subtabId });
      });
    });
  }
  function reRenderTable() {
    const container = document.getElementById("session-table-container");
    if (container) {
      container.innerHTML = renderSessionTable(storedDetailedFiles, isLoading);
      if (!isLoading) {
        setupSortHandlers();
        setupEditorFilterHandlers();
        setupContextRefFilterHandlers();
        setupZeroInteractionFilterHandler();
        setupUnattributedFilterHandler();
        setupFileLinks();
      }
    }
  }
  function reRenderToolAnalysisTable() {
    document.querySelectorAll(".tool-analysis-table").forEach((table) => {
      const encoded = table.getAttribute("data-rows");
      if (!encoded) {
        return;
      }
      const rows = JSON.parse(decodeURIComponent(encoded));
      const baselineRaw = table.getAttribute("data-baseline");
      const baseline = baselineRaw ? parseFloat(baselineRaw) : NaN;
      const tbody = table.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = renderToolAnalysisRows(rows, baseline);
      }
      const thead = table.querySelector("thead");
      if (thead) {
        thead.innerHTML = toolAnalysisTheadHtml();
      }
    });
    setupToolAnalysisSortHandlers();
  }
  function setupToolAnalysisSortHandlers() {
    document.querySelectorAll(".tool-sortable").forEach((header) => {
      header.addEventListener("click", () => {
        const col = header.getAttribute("data-sort");
        if (!col) {
          return;
        }
        if (toolSortColumn === col) {
          toolSortDir = toolSortDir === "desc" ? "asc" : "desc";
        } else {
          toolSortColumn = col;
          toolSortDir = col === "tool" ? "asc" : "desc";
        }
        reRenderToolAnalysisTable();
      });
    });
    document.getElementById("btn-open-tool-families-settings")?.addEventListener("click", () => {
      vscode.postMessage({ command: "openToolFamiliesSettings" });
    });
  }
  function setupFileLinks() {
    document.querySelectorAll(".session-file-link").forEach((link) => {
      link.addEventListener("click", (e7) => {
        e7.preventDefault();
        const file = decodeURIComponent(
          link.getAttribute("data-file") || ""
        );
        vscode.postMessage({ command: "openSessionFile", file });
      });
    });
    document.querySelectorAll(".view-formatted-link").forEach((link) => {
      link.addEventListener("click", (e7) => {
        e7.preventDefault();
        const file = decodeURIComponent(
          link.getAttribute("data-file") || ""
        );
        vscode.postMessage({ command: "openFormattedJsonlFile", file });
      });
    });
    document.querySelectorAll(".reveal-link").forEach((link) => {
      link.addEventListener("click", (e7) => {
        e7.preventDefault();
        const path = decodeURIComponent(
          link.getAttribute("data-path") || ""
        );
        vscode.postMessage({ command: "revealPath", path });
      });
    });
    document.querySelectorAll(".report-editor-link").forEach((link) => {
      link.addEventListener("click", (e7) => {
        e7.preventDefault();
        const path = decodeURIComponent(
          link.getAttribute("data-path") || ""
        );
        vscode.postMessage({ command: "reportNewEditorPath", path });
      });
    });
  }
  function updateCacheNumbers() {
    const cacheTabContent = document.getElementById("tab-cache");
    if (cacheTabContent) {
      const summaryCards = cacheTabContent.querySelectorAll(".summary-card");
      if (summaryCards.length >= 4) {
        const entriesValue = summaryCards[0]?.querySelector(".summary-value");
        if (entriesValue) {
          entriesValue.textContent = "0";
        }
        const sizeValue = summaryCards[1]?.querySelector(".summary-value");
        if (sizeValue) {
          sizeValue.textContent = "0 MB";
        }
        const lastUpdatedValue = summaryCards[2]?.querySelector(".summary-value");
        if (lastUpdatedValue) {
          lastUpdatedValue.textContent = "Never";
        }
        const ageValue = summaryCards[3]?.querySelector(".summary-value");
        if (ageValue) {
          ageValue.textContent = "N/A";
        }
      }
    }
  }
  function setupFolderAnalyzerHandlers() {
    document.getElementById("btn-browse-folder")?.addEventListener("click", () => {
      vscode.postMessage({ command: "pickFolder" });
    });
    document.getElementById("btn-analyze-folder")?.addEventListener("click", () => {
      const input = document.getElementById("folder-path-input");
      const select = document.getElementById("tool-type-select");
      const folderPath = input?.value.trim() ?? "";
      if (!folderPath) {
        if (input) {
          input.style.borderColor = "#d97706";
          input.focus();
        }
        return;
      }
      if (input) {
        input.style.borderColor = "";
      }
      const btn = document.getElementById("btn-analyze-folder");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span>\u23F3</span><span>Analyzing\u2026</span>";
      }
      const resultsDiv = document.getElementById("folder-analysis-results");
      if (resultsDiv) {
        resultsDiv.innerHTML = `
          <div class="analyzer-loading">
            <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
            <span>Scanning files\u2026</span>
          </div>`;
      }
      vscode.postMessage({
        command: "analyzeFolder",
        folderPath,
        toolType: select?.value ?? "auto"
      });
    });
  }
  function setupTabHandlers() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabId = tab.getAttribute("data-tab");
        if (tabId && activateTab(tabId)) {
          diagState.patch({ activeTab: tabId });
        }
      });
    });
  }
  function handleClearCacheClick(target) {
    target.style.background = "#d97706";
    target.innerHTML = "<span>\u23F3</span><span>Clearing...</span>";
    if (target instanceof HTMLButtonElement) {
      target.disabled = true;
    }
    updateCacheNumbers();
    vscode.postMessage({ command: "clearCache" });
  }
  function handleDebugCounterSetClick(target) {
    const key = target.getAttribute("data-key");
    const row = target.closest("tr");
    const input = row?.querySelector(".debug-counter-input");
    if (key && input) {
      const value = parseInt(input.value, 10);
      if (!isNaN(value)) {
        vscode.postMessage({ command: "setDebugCounter", key, value });
      }
    }
  }
  function handleDebugFlagSetClick(target) {
    const key = target.getAttribute("data-key");
    const row = target.closest("tr");
    const input = row?.querySelector(".debug-flag-input");
    if (key && input) {
      vscode.postMessage({ command: "setDebugFlag", key, value: input.checked });
    }
  }
  function handleGlobalClickEvent(event) {
    const target = event.target;
    if (!target) {
      return;
    }
    if (target.id === "btn-clear-cache" || target.id === "btn-clear-cache-tab") {
      handleClearCacheClick(target);
    }
    if (target.id === "btn-reset-insights" || target.id === "btn-reset-insights-tab") {
      vscode.postMessage({ command: "resetInsightsState" });
    }
    if (target.id === "btn-reset-debug-counters") {
      vscode.postMessage({ command: "resetDebugCounters" });
    }
    if (target.classList.contains("debug-counter-set")) {
      handleDebugCounterSetClick(target);
    }
    if (target.classList.contains("debug-flag-set")) {
      handleDebugFlagSetClick(target);
    }
  }
  function wireNavButtons() {
    document.getElementById("btn-refresh")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "refresh" })
    );
    document.getElementById("btn-chart")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showChart" })
    );
    document.getElementById("btn-usage")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showUsageAnalysis" })
    );
    document.getElementById("btn-details")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showDetails" })
    );
    document.getElementById("btn-diagnostics")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showDiagnostics" })
    );
    document.getElementById("btn-maturity")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showMaturity" })
    );
    document.getElementById("btn-dashboard")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showDashboard" })
    );
    document.getElementById("btn-environmental")?.addEventListener(
      "click",
      () => vscode.postMessage({ command: "showEnvironmental" })
    );
    wireExtensionPointButtons(vscode);
  }
  function setupButtonHandlers() {
    document.getElementById("btn-copy")?.addEventListener("click", () => {
      vscode.postMessage({ command: "copyReport" });
    });
    document.getElementById("btn-issue")?.addEventListener("click", () => {
      vscode.postMessage({ command: "openIssue" });
    });
    document.getElementById("btn-clear-cache")?.addEventListener("click", () => {
      const btn = document.getElementById(
        "btn-clear-cache"
      );
      if (btn) {
        btn.style.background = "#d97706";
        btn.innerHTML = "<span>\u23F3</span><span>Clearing...</span>";
        btn.disabled = true;
      }
      updateCacheNumbers();
      vscode.postMessage({ command: "clearCache" });
    });
    document.getElementById("btn-clear-cache-tab")?.addEventListener("click", () => {
      const btn = document.getElementById(
        "btn-clear-cache-tab"
      );
      if (btn) {
        btn.style.background = "#d97706";
        btn.innerHTML = "<span>\u23F3</span><span>Clearing...</span>";
        btn.disabled = true;
      }
      updateCacheNumbers();
      vscode.postMessage({ command: "clearCache" });
    });
    document.addEventListener("click", handleGlobalClickEvent);
    wireNavButtons();
  }
  function handleDiagnosticReport(message) {
    if (!message.report) {
      return;
    }
    const reportTabContent = document.getElementById("tab-report");
    if (!reportTabContent) {
      return;
    }
    const processedReport = removeSessionFilesSection(message.report);
    const reportPre = reportTabContent.querySelector(".report-content");
    if (reportPre) {
      reportPre.textContent = processedReport;
    }
  }
  function handleBackendStorageSection(message) {
    if (!message.backendStorageInfo) {
      console.warn("diagnosticDataLoaded received but backendStorageInfo is missing or undefined");
      return;
    }
    currentBackendInfo = message.backendStorageInfo;
    if (message.githubAuth !== void 0) {
      currentGithubAuth = message.githubAuth;
    }
    const backendTabContent = document.getElementById("tab-backend");
    if (!backendTabContent) {
      return;
    }
    const activeSubtabEl = backendTabContent.querySelector(".subtab.active");
    const previousSubtab = activeSubtabEl?.getAttribute("data-subtab") ?? diagState.restore().activeSubtab;
    backendTabContent.innerHTML = renderBackendStoragePanel(currentBackendInfo, currentGithubAuth);
    setupBackendButtonHandlers();
    setupSubtabHandlers();
    if (previousSubtab) {
      activateSubtab(previousSubtab);
      diagState.patch({ activeSubtab: previousSubtab });
    }
  }
  function handleSessionFoldersSection(message) {
    if (!message.sessionFolders || message.sessionFolders.length === 0) {
      return;
    }
    const reportTabContent = document.getElementById("tab-report");
    if (!reportTabContent) {
      return;
    }
    const grouped = groupSessionFolders(message.sessionFolders);
    const foldersEl = buildSessionFoldersElement(grouped);
    const existing = reportTabContent.querySelector(".session-folders-table");
    if (existing) {
      existing.replaceWith(foldersEl);
    } else {
      const reportContent = reportTabContent.querySelector(".report-content");
      if (reportContent) {
        reportContent.insertAdjacentElement("afterend", foldersEl);
      } else {
        reportTabContent.appendChild(foldersEl);
      }
    }
    setupStorageLinkHandlers();
  }
  function handleCandidatePathsSection(message) {
    if (!message.candidatePaths || message.candidatePaths.length === 0) {
      return;
    }
    const reportTabContent = document.getElementById("tab-report");
    if (!reportTabContent) {
      return;
    }
    reportTabContent.querySelector(".candidate-paths-table")?.remove();
    const candidateEl = buildCandidatePathsElement(message.candidatePaths);
    const foldersTable = reportTabContent.querySelector(".session-folders-table");
    if (foldersTable) {
      foldersTable.insertAdjacentElement("afterend", candidateEl);
    } else {
      const reportContent = reportTabContent.querySelector(".report-content");
      if (reportContent) {
        reportContent.insertAdjacentElement("afterend", candidateEl);
      } else {
        reportTabContent.appendChild(candidateEl);
      }
    }
  }
  function handleDiagnosticDataLoaded(message) {
    handleDiagnosticReport(message);
    handleBackendStorageSection(message);
    handleSessionFoldersSection(message);
    handleCandidatePathsSection(message);
    if (message.githubAuth !== void 0) {
      const githubTabContent = document.getElementById("tab-github");
      if (githubTabContent) {
        githubTabContent.innerHTML = renderGitHubAuthPanel(message.githubAuth);
        setupGitHubAuthHandlers();
      }
    }
    if (message.toolFamilies) {
      storedToolFamilies = message.toolFamilies;
    }
    if (message.toolCallStats !== void 0) {
      const toolAnalysisTab = document.getElementById("tab-tool-analysis");
      if (toolAnalysisTab) {
        const wasActive = toolAnalysisTab.classList.contains("active");
        const newContent = renderToolAnalysisTab(message.toolCallStats, storedToolFamilies);
        const temp = document.createElement("div");
        temp.innerHTML = newContent;
        const newTab = temp.firstElementChild;
        if (newTab) {
          if (wasActive) {
            newTab.classList.add("active");
          }
          toolAnalysisTab.replaceWith(newTab);
          setupToolAnalysisSortHandlers();
        }
      }
    }
  }
  function handleGithubAuthUpdated(message) {
    currentGithubAuth = message.githubAuth;
    const githubTabContent = document.getElementById("tab-github");
    if (githubTabContent) {
      githubTabContent.innerHTML = renderGitHubAuthPanel(currentGithubAuth);
      setupGitHubAuthHandlers();
    }
    const backendTabContent = document.getElementById("tab-backend");
    if (backendTabContent && currentBackendInfo) {
      const activeSubtabEl = backendTabContent.querySelector(".subtab.active");
      const previousSubtab = activeSubtabEl?.getAttribute("data-subtab");
      backendTabContent.innerHTML = renderBackendStoragePanel(currentBackendInfo, currentGithubAuth);
      setupBackendButtonHandlers();
      setupSubtabHandlers();
      if (previousSubtab) {
        activateSubtab(previousSubtab);
      }
    }
  }
  function handleDiagnosticDataError(message) {
    console.error("Error loading diagnostic data:", message.error);
    const rootEl = document.getElementById("root");
    if (rootEl) {
      const errorDiv = document.createElement("div");
      errorDiv.style.cssText = "color: #ff6b6b; padding: 20px; text-align: center;";
      errorDiv.innerHTML = `
<h3>\u26A0\uFE0F Error Loading Diagnostic Data</h3>
<p>${escapeHtml(message.error || "Unknown error")}</p>
`;
      rootEl.insertBefore(errorDiv, rootEl.firstChild);
    }
  }
  function sanitizeNumericRecord(input) {
    if (!input || typeof input !== "object") {
      return {};
    }
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, Number(value ?? 0) || 0])
    );
  }
  function numField(v2) {
    return Number(v2 ?? 0) || 0;
  }
  function optStr(v2) {
    return v2 === null || v2 === void 0 ? void 0 : String(v2);
  }
  function nullStr(v2) {
    return v2 === null || v2 === void 0 ? null : String(v2);
  }
  function sanitizeContextReferences(contextRefs) {
    return {
      file: numField(contextRefs.file),
      symbol: numField(contextRefs.symbol),
      selection: numField(contextRefs.selection),
      implicitSelection: numField(contextRefs.implicitSelection),
      codebase: numField(contextRefs.codebase),
      workspace: numField(contextRefs.workspace),
      terminal: numField(contextRefs.terminal),
      vscode: numField(contextRefs.vscode),
      terminalLastCommand: numField(contextRefs.terminalLastCommand),
      terminalSelection: numField(contextRefs.terminalSelection),
      clipboard: numField(contextRefs.clipboard),
      changes: numField(contextRefs.changes),
      outputPanel: numField(contextRefs.outputPanel),
      problemsPanel: numField(contextRefs.problemsPanel),
      pullRequest: numField(contextRefs.pullRequest),
      byKind: sanitizeNumericRecord(contextRefs.byKind),
      copilotInstructions: numField(contextRefs.copilotInstructions),
      agentsMd: numField(contextRefs.agentsMd),
      byPath: sanitizeNumericRecord(contextRefs.byPath)
    };
  }
  function sanitizeChildInfo(sf) {
    if (!Array.isArray(sf.childInfo)) {
      return void 0;
    }
    return sf.childInfo.filter((child) => !!child && typeof child === "object").map((child) => ({
      uuid: String(child.uuid ?? ""),
      name: String(child.name ?? ""),
      sessionFile: optStr(child.sessionFile)
    }));
  }
  function sanitizeParentInfo(sf) {
    if (!sf.parentInfo || typeof sf.parentInfo !== "object") {
      return void 0;
    }
    const p3 = sf.parentInfo;
    return {
      uuid: String(p3.uuid ?? ""),
      name: String(p3.name ?? ""),
      sessionFile: optStr(p3.sessionFile)
    };
  }
  function sanitizeSessionFileItem(item) {
    const sf = item ?? {};
    const contextRefs = sf.contextReferences ?? {};
    return {
      file: String(sf.file ?? sf.sessionFile ?? ""),
      editorSource: String(sf.editorSource ?? ""),
      editorRoot: optStr(sf.editorRoot),
      editorName: optStr(sf.editorName),
      title: optStr(sf.title),
      repository: optStr(sf.repository),
      size: numField(sf.size),
      modified: String(sf.modified ?? ""),
      tokens: numField(sf.tokens),
      interactions: numField(sf.interactions),
      firstInteraction: nullStr(sf.firstInteraction),
      lastInteraction: nullStr(sf.lastInteraction),
      contextReferences: sanitizeContextReferences(contextRefs),
      parentInfo: sanitizeParentInfo(sf),
      childInfo: sanitizeChildInfo(sf),
      totalChildCount: sf.totalChildCount === null || sf.totalChildCount === void 0 ? void 0 : Number(sf.totalChildCount)
    };
  }
  function sanitizeDetailedSessionFiles(input) {
    if (!Array.isArray(input)) {
      return [];
    }
    return input.map(sanitizeSessionFileItem);
  }
  function handleSessionFilesLoaded(message) {
    storedDetailedFiles = sanitizeDetailedSessionFiles(message.detailedSessionFiles);
    isLoading = false;
    const sessionsTab = document.querySelector('.tab[data-tab="sessions"]');
    if (sessionsTab) {
      sessionsTab.textContent = `\u{1F4C1} Session Files (${storedDetailedFiles.length})`;
    }
    reRenderTable();
  }
  function handleCacheCleared() {
    const btnReport = document.getElementById(
      "btn-clear-cache"
    );
    const btnTab = document.getElementById(
      "btn-clear-cache-tab"
    );
    if (btnReport) {
      btnReport.style.background = "#2d6a4f";
      btnReport.innerHTML = "<span>\u2705</span><span>Cache Cleared</span>";
      btnReport.disabled = false;
    }
    if (btnTab) {
      btnTab.style.background = "#2d6a4f";
      btnTab.innerHTML = "<span>\u2705</span><span>Cache Cleared</span>";
      btnTab.disabled = false;
    }
    setTimeout(() => {
      if (btnReport) {
        btnReport.style.background = "";
        btnReport.innerHTML = "<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>";
      }
      if (btnTab) {
        btnTab.style.background = "";
        btnTab.innerHTML = "<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>";
      }
    }, 2e3);
  }
  function updateCacheSummaryCards(cacheInfo, summaryCards) {
    if (summaryCards.length < 4) {
      return;
    }
    const entriesValue = summaryCards[0]?.querySelector(".summary-value");
    if (entriesValue) {
      entriesValue.textContent = String(cacheInfo.size);
    }
    const sizeValue = summaryCards[1]?.querySelector(".summary-value");
    if (sizeValue) {
      sizeValue.textContent = `${cacheInfo.sizeInMB.toFixed(2)} MB`;
    }
    const lastUpdatedValue = summaryCards[2]?.querySelector(".summary-value");
    if (lastUpdatedValue) {
      lastUpdatedValue.textContent = new Date(cacheInfo.lastUpdated).toLocaleString();
    }
    const ageValue = summaryCards[3]?.querySelector(".summary-value");
    if (ageValue) {
      ageValue.textContent = "0 seconds ago";
    }
  }
  function handleCacheRefreshed(message) {
    if (!message.cacheInfo) {
      return;
    }
    const cacheTabContent = document.getElementById("tab-cache");
    if (!cacheTabContent) {
      return;
    }
    updateCacheSummaryCards(message.cacheInfo, cacheTabContent.querySelectorAll(".summary-card"));
  }
  function handleFolderPicked(message) {
    const input = document.getElementById("folder-path-input");
    if (input && message.folderPath) {
      input.value = message.folderPath;
      input.style.borderColor = "";
    }
  }
  function handleFolderAnalysisResult(message) {
    const btn = document.getElementById("btn-analyze-folder");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "<span>\u{1F50D}</span><span>Analyze</span>";
    }
    const resultsDiv = document.getElementById("folder-analysis-results");
    if (resultsDiv) {
      if (message.error) {
        resultsDiv.innerHTML = `
        <div class="info-box" style="border-color: #d97706; background: rgba(217,119,6,0.08); margin-top: 12px;">
          <div class="info-box-title">\u26A0\uFE0F Analysis Error</div>
          <div>${escapeHtml(message.error)}</div>
        </div>`;
      } else {
        resultsDiv.innerHTML = renderFolderAnalysisResults(
          message.files || [],
          message.totalScanned || 0,
          message.parseErrors || 0,
          message.truncated || false,
          escapeHtml(String(message.folderPath || ""))
        );
      }
    }
  }
  function setupMessageHandlers() {
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "diagnosticDataLoaded") {
        handleDiagnosticDataLoaded(message);
      } else if (message.command === "githubAuthUpdated") {
        handleGithubAuthUpdated(message);
      } else if (message.command === "diagnosticDataError") {
        handleDiagnosticDataError(message);
      } else if (message.command === "sessionFilesLoaded" && message.detailedSessionFiles) {
        handleSessionFilesLoaded(message);
      } else if (message.command === "cacheCleared") {
        handleCacheCleared();
      } else if (message.command === "cacheRefreshed") {
        handleCacheRefreshed(message);
      } else if (message.command === "folderPicked") {
        handleFolderPicked(message);
      } else if (message.command === "folderAnalysisResult") {
        handleFolderAnalysisResult(message);
      }
    });
  }
  function renderDiagCacheTabHtml(data) {
    return `
<div id="tab-cache" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4BE} Cache Information</div>
<div>
The extension caches session file data to improve performance and reduce file system operations.
Cache is stored in VS Code's global state and persists across sessions.
</div>
</div>
<div class="cache-details">
<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">\u{1F4E6} Cache Entries</div>
<div class="summary-value">${data.cacheInfo?.size || 0}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4BE} Cache Size</div>
<div class="summary-value">${data.cacheInfo?.sizeInMB ? data.cacheInfo.sizeInMB.toFixed(2) + " MB" : "N/A"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F552} Last Updated</div>
<div class="summary-value" style="font-size: 14px;">${data.cacheInfo?.lastUpdated ? formatDate(data.cacheInfo.lastUpdated) : "Never"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u23F1\uFE0F Cache Age</div>
<div class="summary-value" style="font-size: 14px;">${data.cacheInfo?.lastUpdated ? getTimeSince(data.cacheInfo.lastUpdated) : "N/A"}</div>
</div>
</div>
<div class="cache-location">
<h4>Storage Location</h4>
<div class="location-box">
<code>${escapeHtml(data.cacheInfo?.location || "VS Code Global State")}</code>
${data.cacheInfo?.storagePath ? ` <a href="#" class="open-storage-link" data-path="${encodeURIComponent(data.cacheInfo.storagePath)}">Open storage location</a>` : ""}
</div>
<p style="color: #999; font-size: 12px; margin-top: 8px;">
Cache is stored in VS Code's global state (extension storage) and includes:
<ul style="margin: 8px 0 0 20px;">
<li>Token counts per session file</li>
<li>Interaction counts</li>
<li>Model usage statistics</li>
<li>File modification timestamps for validation</li>
<li>Usage analysis data (tool calls, modes, context references)</li>
</ul>
</p>
</div>
<div class="cache-actions">
<h4>Cache Management</h4>
<p style="color: #999; font-size: 12px; margin-bottom: 12px;">
Clearing the cache will force the extension to re-read and re-analyze all session files on the next update.
This can help resolve issues with stale or incorrect data.
</p>
<div class="button-group" style="margin-top: 8px;">
<button class="button secondary" id="btn-clear-cache-tab"><span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span></button>
<button class="button secondary" id="btn-reset-insights-tab"><span>\u{1F4A1}</span><span>Reset Insights Dismissals</span></button>
</div>
</div>
</div>
</div>`;
  }
  function sel(current, value) {
    return current === value ? "selected" : "";
  }
  function renderQuotaCardHtml(data) {
    const quotaContent = data.quotaEntitlements ? `<p>
${data.quotaEntitlements.premium_interactions ? `<strong>Premium Interactions:</strong> $${data.quotaEntitlements.premium_interactions.toFixed(2)}/month<br/>` : ""}${data.quotaEntitlements.completions ? `<strong>Completions:</strong> $${data.quotaEntitlements.completions.toFixed(2)}/month<br/>` : ""}
    </p>` : `<p class="hint">No quota information available from the API yet. Sign out and back in to refresh.</p>`;
    return `<div class="backend-card">
<h4>\u{1F4CA} API Quota Information</h4>
${quotaContent}
</div>`;
  }
  function renderDiagDisplayTabHtml(data) {
    const showTokens = data.displaySettings?.showTokens ?? "both";
    const showCost = data.displaySettings?.showCost ?? "none";
    const monthlyBudget = Math.round((data.displaySettings?.monthlyBudget ?? 0) * 100) / 100;
    return `
<div id="tab-display" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u2699\uFE0F Display Settings</div>
<div>Configure what is shown in the status bar at the bottom of VS Code. Changes take effect immediately \u2014 no data refresh needed.</div>
</div>
<div class="backend-card">
<h4>\u{1F4CA} Status Bar Display</h4>
<p>
Choose what to show in the VS Code status bar toolbar. You can show token counts, estimated costs, both, or neither for each period.
</p>
<div style="display: grid; gap: 16px;">
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F522} Token counts:</label>
  <select id="select-show-tokens" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${sel(showTokens, "none")}>None</option>
    <option value="today" ${sel(showTokens, "today")}>Today only</option>
    <option value="last30days" ${sel(showTokens, "last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${sel(showTokens, "currentMonth")}>Current calendar month only</option>
    <option value="both" ${sel(showTokens, "both")}>Today + last 30 days (default)</option>
    <option value="todayAndCurrentMonth" ${sel(showTokens, "todayAndCurrentMonth")}>Today + current calendar month</option>
  </select>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F4B0} Estimated cost (USD):</label>
  <select id="select-show-cost" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${sel(showCost, "none")}>None (hidden)</option>
    <option value="today" ${sel(showCost, "today")}>Today only</option>
    <option value="last30days" ${sel(showCost, "last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${sel(showCost, "currentMonth")}>Current calendar month only</option>
    <option value="both" ${sel(showCost, "both")}>Today + last 30 days</option>
    <option value="todayAndCurrentMonth" ${sel(showCost, "todayAndCurrentMonth")}>Today + current calendar month</option>
  </select>
</div>
</div>
<p class="hint">Cost is estimated using GitHub Copilot AI-Credit rates (Usage Based Billing). Changes apply to the status bar immediately.</p>
</div>
<div class="backend-card">
<h4>\u{1F4B0} Monthly Budget</h4>
<p>
Set a monthly AI spend budget in USD to get visual alerts on the status bar. The bar turns yellow at 75%, orange at 90%, and red at 100% of your budget. Set to 0 to disable.
</p>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F4B5} Monthly budget (USD):</label>
  <input id="input-monthly-budget" type="number" min="0" max="99999" step="0.01" value="${monthlyBudget}" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 100px;" />
</div>
<p class="hint">Budget coloring uses the current calendar month's estimated cost. Set to 0 to disable.</p>
${data.quotaEntitlements && data.quotaEntitlements.premium_interactions ? `<p class="hint" style="color: #90ee90;"><strong>\u2139\uFE0F API-driven budget:</strong> Your premium_interactions quota entitlement is <strong>$${data.quotaEntitlements.premium_interactions.toFixed(2)}</strong>/month. If the budget above is 0 or empty, this API value will be used as your effective budget.</p>` : ""}
</div>
${renderQuotaCardHtml(data)}
<div class="backend-card">
<h4>\u{1F522} Number Formatting</h4>
<p>
Token counts can be shown in compact format using K/M suffixes (e.g. <strong>1.5K</strong>, <strong>1.2M</strong>)
for quick scanning, or as full numbers (e.g. <strong>1,500</strong>, <strong>1,200,000</strong>) for precision.
</p>
<div class="button-group">
<button class="button" id="btn-open-display-settings">
<span>\u2699\uFE0F</span>
<span>Open Display Settings</span>
</button>
</div>
</div>
</div>`;
  }
  function getToolSortIndicator(col) {
    if (toolSortColumn !== col) {
      return ' <span class="sort-hint">\u2195</span>';
    }
    return toolSortDir === "desc" ? " \u25BC" : " \u25B2";
  }
  function pooledAvg(rows) {
    const totalCalls = rows.reduce((s4, r6) => s4 + r6.calls, 0);
    const totalTokens = rows.reduce((s4, r6) => s4 + r6.totalTokens, 0);
    return totalCalls > 0 ? totalTokens / totalCalls : NaN;
  }
  function sortToolRows(rows) {
    return [...rows].sort((a3, b3) => {
      let aVal, bVal;
      switch (toolSortColumn) {
        case "tool":
          aVal = a3.tool.toLowerCase();
          bVal = b3.tool.toLowerCase();
          break;
        case "calls":
          aVal = a3.calls;
          bVal = b3.calls;
          break;
        case "total":
          aVal = a3.totalTokens;
          bVal = b3.totalTokens;
          break;
        case "avg":
        default:
          aVal = a3.calls > 0 ? a3.totalTokens / a3.calls : 0;
          bVal = b3.calls > 0 ? b3.totalTokens / b3.calls : 0;
          break;
      }
      if (aVal < bVal) {
        return toolSortDir === "desc" ? 1 : -1;
      }
      if (aVal > bVal) {
        return toolSortDir === "desc" ? -1 : 1;
      }
      return 0;
    });
  }
  function renderToolRow(r6, builtInBaseline) {
    const avg = r6.calls > 0 ? Math.round(r6.totalTokens / r6.calls) : 0;
    let ratioHtml = '<td class="tool-ratio">\u2014</td>';
    if (!r6.isBuiltIn && !isNaN(builtInBaseline) && builtInBaseline > 0 && r6.calls > 0) {
      const ratio = r6.totalTokens / r6.calls / builtInBaseline;
      const pct = Math.round(ratio * 100);
      const cls = ratio < 0.85 ? "ratio-better" : ratio > 1.15 ? "ratio-worse" : "ratio-neutral";
      ratioHtml = `<td class="tool-ratio ${cls}" title="${pct}% of built-in average">${pct}%</td>`;
    } else if (r6.isBuiltIn) {
      ratioHtml = '<td class="tool-ratio tool-builtin-label">baseline</td>';
    }
    const badge = r6.isBuiltIn ? ' <span class="tool-type-badge built-in">built-in</span>' : ' <span class="tool-type-badge alternative">alt</span>';
    return `<tr><td>${escapeHtml(r6.tool)}${badge}</td><td>${escapeHtml(String(r6.calls))}</td><td>${formatTokenCount(r6.totalTokens)}</td><td>${formatTokenCount(avg)}</td>${ratioHtml}</tr>`;
  }
  function renderToolAnalysisRows(rows, builtInBaseline = NaN) {
    return sortToolRows(rows).map((r6) => renderToolRow(r6, builtInBaseline)).join("");
  }
  function toolAnalysisTheadHtml() {
    return `<tr>
<th class="tool-sortable" data-sort="tool">Tool${getToolSortIndicator("tool")}</th>
<th class="tool-sortable" data-sort="calls">Calls${getToolSortIndicator("calls")}</th>
<th class="tool-sortable" data-sort="total">Total Output Tokens${getToolSortIndicator("total")}</th>
<th class="tool-sortable" data-sort="avg">Avg Tokens / Call${getToolSortIndicator("avg")}</th>
<th>vs Built-in</th>
</tr>`;
  }
  function renderToolFamilySection(family, outputTokensByTool, byTool, assignedTools) {
    const buildRows = (names, isBuiltIn) => names.filter((t4) => outputTokensByTool[t4] !== void 0 && (byTool[t4] || 0) > 0 && !assignedTools.has(t4)).map((t4) => {
      assignedTools.add(t4);
      return { tool: t4, totalTokens: outputTokensByTool[t4], calls: byTool[t4] || 0, isBuiltIn };
    });
    const builtInRows = buildRows(family.builtIn, true);
    const altRows = buildRows(family.alternatives, false);
    const allRows = [...builtInRows, ...altRows];
    if (allRows.length === 0) {
      return { html: "", rows: [] };
    }
    const baseline = pooledAvg(builtInRows);
    const encodedRows = encodeURIComponent(JSON.stringify(allRows));
    const desc = family.description ? ` <span class="hint">${escapeHtml(family.description)}</span>` : "";
    const html = `
<div class="tool-family-section">
<h4 class="tool-family-heading">${escapeHtml(family.name)}${desc}</h4>
<table class="session-table tool-analysis-table" data-rows="${encodedRows}" data-baseline="${isNaN(baseline) ? "" : String(baseline)}">
<thead>${toolAnalysisTheadHtml()}</thead>
<tbody>${renderToolAnalysisRows(allRows, baseline)}</tbody>
</table>
</div>`;
    return { html, rows: allRows };
  }
  function renderToolAnalysisTab(toolCallStats, families) {
    if (!toolCallStats || !toolCallStats.outputTokensByTool || Object.keys(toolCallStats.outputTokensByTool).length === 0) {
      return `<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Track how many tokens each tool produces as output over the last 30 days. Data is collected as you use the extension \u2014 no output token data has been recorded yet.</div>
</div>
</div>`;
    }
    const outputTokensByTool = toolCallStats.outputTokensByTool;
    const byTool = toolCallStats.byTool;
    const assignedTools = /* @__PURE__ */ new Set();
    let sectionsHtml = "";
    if (families && families.length > 0) {
      for (const family of families) {
        const { html } = renderToolFamilySection(family, outputTokensByTool, byTool, assignedTools);
        sectionsHtml += html;
      }
    }
    const otherRows = Object.entries(outputTokensByTool).filter(([t4]) => !assignedTools.has(t4) && (byTool[t4] || 0) > 0).map(([t4, tokens]) => ({ tool: t4, totalTokens: tokens, calls: byTool[t4] || 0, isBuiltIn: false }));
    if (otherRows.length > 0) {
      const encodedOther = encodeURIComponent(JSON.stringify(otherRows));
      sectionsHtml += `
<div class="tool-family-section">
<h4 class="tool-family-heading">Other Tools</h4>
<table class="session-table tool-analysis-table" data-rows="${encodedOther}" data-baseline="">
<thead>${toolAnalysisTheadHtml()}</thead>
<tbody>${renderToolAnalysisRows(otherRows, NaN)}</tbody>
</table>
</div>`;
    }
    return `<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Tokens produced by each tool's output over the last 30 days. Tools are grouped by family. <strong>vs Built-in</strong> shows how an alternative compares to the pooled baseline \u2014 green is more token-efficient. Click column headers to sort within each group. <button class="inline-link" id="btn-open-tool-families-settings">Configure tool families \u2197</button></div>
</div>
${sectionsHtml}
</div>`;
  }
  function buildDiagReportTabHtml(escapedReport) {
    return `<div id="tab-report" class="tab-content active">
<div class="info-box">
<div class="info-box-title">\u{1F4CB} About This Report</div>
<div>
This diagnostic report contains information about your AI Engineering Fluency extension
extension setup and usage statistics. </br> It does <strong>not</strong> include any of your
code or conversation content. You can safely share this report when reporting issues.
</div>
</div>
<div class="button-group" style="margin-bottom: 12px;">
<button class="button" id="btn-copy"><span>\u{1F4CB}</span><span>Copy to Clipboard</span></button>
<button class="button secondary" id="btn-issue"><span>\u{1F41B}</span><span>Open GitHub Issue</span></button>
<button class="button secondary" id="btn-clear-cache"><span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span></button>
<button class="button secondary" id="btn-reset-insights"><span>\u{1F4A1}</span><span>Reset Insights Dismissals</span></button>
</div>
<div class="report-content">${escapedReport}</div>
</div>`;
  }
  function buildDiagRootHtml(data, detailedFiles, escapedReport) {
    return `
<style>${theme_default}</style>
<style>${styles_default}</style>
<div class="container">
<div class="header">
<div class="header-left">
<span class="header-icon">\u{1F50D}</span>
<span class="header-title">Diagnostic Report</span>
</div>
<div class="button-row">
${buttonHtml("btn-refresh")}
${buttonHtml("btn-details")}
${buttonHtml("btn-chart")}
${buttonHtml("btn-usage")}
${buttonHtml("btn-environmental")}
${buttonHtml("btn-maturity")}
${data?.backendConfigured ? buttonHtml("btn-dashboard") : ""}
</div>
</div>

<div class="tabs">
<button class="tab active" data-tab="report">\u{1F4CB} Report</button>
<button class="tab" data-tab="sessions">\u{1F4C1} Session Files (${detailedFiles.length})</button>
<button class="tab" data-tab="cache">\u{1F4BE} Cache</button>
<button class="tab" data-tab="backend">\u2601\uFE0F Backend Storage</button>
<button class="tab" data-tab="github">\u{1F511} GitHub Auth</button>
<button class="tab" data-tab="display">\u2699\uFE0F Settings</button>
<button class="tab" data-tab="path-analyzer">\u{1F52C} Path Analyzer</button>
<button class="tab" data-tab="tool-analysis">\u{1F527} Tool Analysis</button>
${data.isDebugMode ? '<button class="tab" data-tab="debug">\u{1F41B} Debug</button>' : ""}
</div>

${buildDiagReportTabHtml(escapedReport)}

<div id="tab-sessions" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4C1} Session File Analysis</div>
<div>
This tab shows session files with activity in the last 14 days from all detected editors. </br>
Click on an editor panel to filter, click column headers to sort, and click a file name to open it.
</div>
</div>
<div id="session-table-container">${renderSessionTable(detailedFiles, detailedFiles.length === 0)}</div>
</div>

${renderDiagCacheTabHtml(data)}
<div id="tab-backend" class="tab-content">
${renderBackendStoragePanel(data.backendStorageInfo, data.githubAuth)}
</div>

<div id="tab-github" class="tab-content">
${renderGitHubAuthPanel(data.githubAuth)}
</div>
${renderDiagDisplayTabHtml(data)}
${data.isDebugMode ? renderDebugTab(data.globalStateCounters) : ""}
<div id="tab-path-analyzer" class="tab-content">
${renderFolderAnalyzerTab()}
</div>
${renderToolAnalysisTab(data.toolCallStats, data.toolFamilies)}
</div>
`;
  }
  function renderLayout(data) {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const detailedFiles = data.detailedSessionFiles || [];
    storedDetailedFiles = detailedFiles;
    isLoading = detailedFiles.length === 0;
    currentBackendInfo = data.backendStorageInfo;
    currentGithubAuth = data.githubAuth;
    if (data.toolFamilies) {
      storedToolFamilies = data.toolFamilies;
    }
    const reportIsLoading = data.report === LOADING_PLACEHOLDER;
    const escapedReport = reportIsLoading ? LOADING_MESSAGE.trim() : removeSessionFilesSection(escapeHtml(data.report));
    root.innerHTML = buildDiagRootHtml(data, detailedFiles, escapedReport);
    const sessionFolders = groupSessionFolders(data.sessionFolders || []);
    if (sessionFolders.length > 0) {
      const reportTab = document.getElementById("tab-report");
      const reportContent = reportTab?.querySelector(".report-content");
      if (reportContent) {
        reportContent.insertAdjacentElement("afterend", buildSessionFoldersElement(sessionFolders));
      }
    }
    setupMessageHandlers();
    setupTabHandlers();
    setupSortHandlers();
    setupEditorFilterHandlers();
    setupContextRefFilterHandlers();
    setupZeroInteractionFilterHandler();
    setupUnattributedFilterHandler();
    setupBackendButtonHandlers();
    setupSubtabHandlers();
    setupFileLinks();
    setupStorageLinkHandlers();
    setupGitHubAuthHandlers();
    setupFolderAnalyzerHandlers();
    setupButtonHandlers();
    setupDisplaySettingHandlers();
    setupToolAnalysisSortHandlers();
    const savedState = diagState.restore();
    if (savedState?.activeTab && !activateTab(savedState.activeTab)) {
      activateTab("report");
    }
    if (savedState?.activeSubtab) {
      activateSubtab(savedState.activeSubtab);
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
    renderLayout(initialData);
  }
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
//# sourceMappingURL=diagnostics.js.map
