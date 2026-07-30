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

  // src/webview/shared/domUtils.ts
  function setHtml(el2, html) {
    if (!el2) {
      return;
    }
    el2.innerHTML = html;
  }
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
  function buttonHtml(idOrConfig) {
    const config = typeof idOrConfig === "string" ? BUTTONS[idOrConfig] : idOrConfig;
    if (config.hidden) {
      return "";
    }
    const appearance = config.appearance ? ` appearance="${config.appearance}"` : "";
    const active = config.active ? ' class="nav-active" disabled aria-current="page"' : "";
    const iconStyle = config.iconColor ? ` style="--icon-accent:${config.iconColor}"` : "";
    const icon = config.icon ? `<span class="codicon codicon-${config.icon} nav-icon"${iconStyle}></span>` : "";
    return `<vscode-button id="${config.id}"${appearance}${active}>${icon}${config.label}</vscode-button>`;
  }
  function navButtonsHtml(activeView, backendConfigured) {
    return getNavButtons(activeView, backendConfigured).map((config) => buttonHtml(config)).join("\n");
  }

  // src/webview/shared/contextRefUtils.ts
  function getTotalContextRefs(refs) {
    return refs.file + refs.selection + refs.implicitSelection + refs.symbol + refs.codebase + refs.workspace + refs.terminal + refs.vscode + refs.copilotInstructions + refs.agentsMd + (refs.terminalLastCommand || 0) + (refs.terminalSelection || 0) + (refs.clipboard || 0) + (refs.changes || 0) + (refs.outputPanel || 0) + (refs.problemsPanel || 0) + (refs.pullRequest || 0);
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
  function setFormatLocale(locale) {
    currentLocale = locale;
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
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function safeSectionHtml(label, builder, onError = (m2) => console.error(m2)) {
    try {
      return builder();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onError(`[usage-webview] Section "${label}" failed to render: ${message}`);
      return `<div class="section" style="border-color: rgba(239, 68, 68, 0.3);">
			<div class="section-title"><span>\u26A0\uFE0F</span><span>${escapeHtml(label)}</span></div>
			<div style="color: var(--text-secondary); font-size: 12px; padding: 8px 0;">
				This section couldn't be displayed due to an unexpected error. Other sections are unaffected \u2014 try refreshing the dashboard.
			</div>
		</div>`;
    }
  }
  function formatFileSize(bytes) {
    const numericBytes = Number(bytes);
    if (!Number.isFinite(numericBytes) || numericBytes < 0) {
      return "N/A";
    }
    if (numericBytes < 1024) {
      return `${numericBytes} B`;
    }
    const units = ["KB", "MB", "GB", "TB", "PB"];
    let value = numericBytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    const decimals = unitIndex === 0 ? 1 : 2;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
  }
  function formatDurationShort(durationMs) {
    if (durationMs === void 0 || !Number.isFinite(durationMs) || durationMs < 0) {
      return "\u2014";
    }
    const totalMinutes = Math.round(durationMs / 6e4);
    if (totalMinutes < 1) {
      return "<1m";
    }
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
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

  // src/webview/usage/styles.css
  var styles_default = "* {\n	margin: 0;\n	padding: 0;\n	box-sizing: border-box;\n}\n\nbody {\n	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n	background: var(--bg-primary);\n	color: var(--text-primary);\n	padding: 16px;\n	line-height: 1.5;\n	min-width: 320px;\n}\n\n.container {\n	background: var(--bg-secondary);\n	border: 1px solid var(--border-color);\n	border-radius: 10px;\n	padding: 16px;\n	box-shadow: 0 4px 10px var(--shadow-color);\n	max-width: 1200px;\n	margin: 0 auto;\n}\n\n.header {\n	display: flex;\n	justify-content: space-between;\n	align-items: center;\n	gap: 12px;\n	margin-bottom: 14px;\n	padding-bottom: 4px;\n}\n\n.header-left {\n	display: flex;\n	align-items: center;\n	gap: 8px;\n}\n\n.header-icon {\n	font-size: 20px;\n}\n\n.header-title {\n	font-size: 16px;\n	font-weight: 700;\n	color: var(--text-primary);\n	letter-spacing: 0.2px;\n}\n\n\n\n.section {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 8px;\n	padding: 12px;\n	margin-bottom: 16px;\n	box-shadow: 0 2px 6px var(--shadow-color);\n}\n\n.section-title {\n	font-size: 14px;\n	font-weight: 700;\n	color: var(--text-primary);\n	margin-bottom: 10px;\n	display: flex;\n	align-items: center;\n	gap: 6px;\n	letter-spacing: 0.2px;\n}\n\n.section-subtitle {\n	font-size: 12px;\n	color: var(--text-secondary);\n	margin-bottom: 12px;\n}\n\n.stats-grid {\n	display: grid;\n	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n	gap: 12px;\n	margin-bottom: 16px;\n}\n\n.stat-card {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	box-shadow: 0 2px 4px var(--shadow-color);\n}\n\n.stat-card[title] {\n	cursor: help;\n}\n\n.stat-label {\n	font-size: 11px;\n	color: var(--text-secondary);\n	margin-bottom: 4px;\n}\n\n.stat-value {\n	font-size: 20px;\n	font-weight: 700;\n	color: var(--text-primary);\n}\n\n.ctx-ref-table-wrap {\n	margin-bottom: 16px;\n	overflow-x: auto;\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	box-shadow: 0 2px 4px var(--shadow-color);\n}\n\n.ctx-ref-table {\n	width: 100%;\n	border-collapse: collapse;\n	font-size: 13px;\n}\n\n.ctx-ref-table th,\n.ctx-ref-table td {\n	padding: 8px 14px;\n	text-align: left;\n	border-bottom: 1px solid var(--border-subtle);\n}\n\n.ctx-ref-table thead th {\n	background: var(--bg-tertiary);\n	color: var(--text-secondary);\n	font-size: 11px;\n	font-weight: 600;\n	text-transform: uppercase;\n	letter-spacing: 0.4px;\n	position: sticky;\n	top: 0;\n}\n\n.ctx-ref-table tbody tr:hover {\n	background: var(--list-hover-bg);\n}\n\n.ctx-ref-table .ctx-ref-name {\n	color: var(--text-primary);\n	white-space: nowrap;\n}\n\n.ctx-ref-table .ctx-ref-num {\n	text-align: right;\n	font-variant-numeric: tabular-nums;\n	font-weight: 600;\n	color: var(--text-primary);\n	width: 110px;\n}\n\n.ctx-ref-table .ctx-ref-zero {\n	color: var(--text-muted);\n	font-weight: 400;\n}\n\n.ctx-ref-table .ctx-ref-today-active {\n	color: var(--link-color);\n}\n\n.ctx-ref-table tfoot .ctx-ref-total td {\n	background: var(--list-active-bg);\n	color: var(--list-active-fg);\n	font-weight: 700;\n	border-bottom: none;\n	border-top: 2px solid var(--border-color);\n}\n\n.ctx-ref-table tfoot .ctx-ref-total .ctx-ref-num {\n	color: var(--list-active-fg);\n}\n\n.ctx-ref-table .ctx-ref-spark {\n	width: 68px;\n	text-align: center;\n	padding: 4px 8px;\n	vertical-align: middle;\n	color: var(--text-primary);\n}\n\n\n.bar-chart {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	margin-bottom: 12px;\n}.bar-item {\n	margin-bottom: 8px;\n}\n\n.bar-label {\n	display: flex;\n	justify-content: space-between;\n	font-size: 12px;\n	margin-bottom: 4px;\n	color: var(--text-primary);\n}\n\n.bar-track {\n	background: var(--row-alternate-bg);\n	height: 8px;\n	border-radius: 4px;\n	overflow: hidden;\n}\n\n.bar-fill {\n	height: 100%;\n	border-radius: 4px;\n	transition: width 0.3s ease;\n}\n\n.list {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px 16px;\n}\n\n.list ul {\n	list-style: none;\n	padding: 0;\n}\n\n.list li {\n	padding: 4px 0;\n	font-size: 13px;\n}\n\n/* Customization matrix styles */\n.customization-matrix-container {\n	overflow-x: auto;\n	max-width: 100%;\n}\n\n.customization-matrix {\n	width: 100%;\n	border-collapse: collapse;\n	font-size: 12px;\n	color: var(--text-primary);\n}\n\n.customization-matrix th {\n	background: var(--list-hover-bg);\n	color: var(--text-primary);\n	font-weight: 600;\n	font-size: 11px;\n	white-space: nowrap;\n}\n\n.customization-matrix td {\n	background: var(--bg-tertiary);\n}\n\n.customization-matrix tbody tr:hover td {\n	background: var(--list-hover-bg);\n}\n\n.stale-warning {\n	color: var(--warning-fg);\n	font-weight: 600;\n}\n\n.two-column {\n	display: grid;\n	grid-template-columns: 1fr 1fr;\n	gap: 16px;\n}\n\n.three-column {\n	display: grid;\n	grid-template-columns: 1fr 1fr 1fr;\n	gap: 16px;\n	align-items: stretch;\n}\n\n.three-column > div {\n	display: flex;\n	flex-direction: column;\n}\n\n.three-column > div > .list {\n	flex: 1;\n}\n\n.info-box {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	margin-bottom: 16px;\n	font-size: 12px;\n	color: var(--text-secondary);\n}\n\n.info-box-title {\n	font-weight: 600;\n	color: var(--text-primary);\n	margin-bottom: 6px;\n}\n\n.info-box-toggle {\n	display: flex;\n	align-items: center;\n	justify-content: space-between;\n	gap: 8px;\n	cursor: pointer;\n	user-select: none;\n	margin-bottom: 0;\n}\n\n.info-box-chevron {\n	font-size: 10px;\n	color: var(--text-secondary);\n}\n\n.info-box-body {\n	margin-top: 6px;\n}\n\n\n.repo-hygiene-results {\n	margin-top: 4px;\n}\n\n.repo-analysis-card {\n	margin: 0;\n}\n\n.repo-hygiene-pane {\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	margin-bottom: 12px;\n	background: var(--bg-secondary);\n}\n\n.repo-hygiene-pane-header {\n	padding: 8px 12px;\n	font-size: 12px;\n	font-weight: 600;\n	color: var(--text-primary);\n	border-bottom: 1px solid var(--border-color);\n	background: var(--list-hover-bg);\n}\n\n.repo-hygiene-pane-body {\n	display: block;\n}\n\n.repo-hygiene-pane-collapsed {\n	display: none;\n}\n\n.repo-hygiene-pane-collapsed .repo-hygiene-pane-body {\n	display: none;\n}\n\n.btn-repo-action[disabled] {\n	opacity: 0.7;\n}\n\n.footer {\n	margin-top: 6px;\n	padding-top: 12px;\n	border-top: 1px solid var(--border-subtle);\n	text-align: left;\n	font-size: 11px;\n	color: var(--text-muted);\n}\n\n@media (width <= 768px) {\n	.two-column {\n		grid-template-columns: 1fr;\n	}\n\n	.three-column {\n		grid-template-columns: 1fr;\n	}\n}\n\n\n.tab-bar {\ndisplay: flex;\ngap: 2px;\nmargin-bottom: 16px;\nborder-bottom: 2px solid var(--border-color);\npadding-bottom: 0;\nflex-wrap: wrap;\n}\n\n.tab-button {\ndisplay: inline-flex;\nalign-items: center;\ngap: 4px;\nbackground: transparent;\nborder: none;\nborder-bottom: 3px solid transparent;\ncolor: var(--text-secondary);\npadding: 8px 16px;\nfont-size: 12px;\nfont-weight: 600;\ncursor: pointer;\nborder-radius: 4px 4px 0 0;\ntransition: all 0.15s ease;\nwhite-space: nowrap;\nmargin-bottom: -2px;\nfont-family: inherit;\n}\n\n.tab-button:hover {\ncolor: var(--text-primary);\nbackground: var(--list-hover-bg);\n}\n\n.tab-button.active {\ncolor: var(--text-primary);\nborder-bottom-color: var(--link-color);\nbackground: var(--bg-tertiary);\n}\n\n.auto-badge {\n	display: inline-block;\n	margin-left: 6px;\n	padding: 1px 5px;\n	font-size: 10px;\n	border-radius: 3px;\n	border: 1px solid var(--text-primary);\n	color: var(--text-primary);\n	background: transparent;\n	vertical-align: middle;\n	line-height: 1.4;\n}\n\n/* Sortable table headers */\n.sessions-table th.sortable {\n	cursor: pointer;\n	user-select: none;\n	transition: background 0.1s ease, color 0.1s ease;\n}\n\n.sessions-table th.sortable:hover {\n	background: var(--list-hover-bg);\n	color: var(--link-color);\n}\n\n.sessions-table tr:hover td {\n	background: var(--list-hover-bg);\n}\n\n/* Worktrees tab */\n.summary-cards {\n	display: grid;\n	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n	gap: 12px;\n	margin-bottom: 16px;\n}\n\n.summary-card {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 4px;\n	padding: 12px;\n	text-align: center;\n}\n\n.summary-label {\n	font-size: 11px;\n	color: var(--text-secondary);\n	margin-bottom: 4px;\n}\n\n.summary-value {\n	font-size: 18px;\n	font-weight: 600;\n	color: var(--text-primary);\n}\n\n.table-container {\n	overflow: auto;\n	max-height: 500px;\n}\n\n.session-table {\n	width: 100%;\n	border-collapse: collapse;\n	font-size: 12px;\n}\n\n.session-table th,\n.session-table td {\n	padding: 8px 10px;\n	text-align: left;\n	border-bottom: 1px solid var(--border-color);\n}\n\n.session-table th {\n	background: var(--bg-tertiary);\n	color: var(--text-primary);\n	font-weight: 600;\n	position: sticky;\n	top: 0;\n}\n\n.session-table th.sortable {\n	cursor: pointer;\n	user-select: none;\n}\n\n.session-table th.sortable:hover {\n	background: var(--list-hover-bg);\n	color: var(--link-color);\n}\n\n.button {\n	background: var(--button-secondary-bg);\n	border: 1px solid var(--border-subtle);\n	color: var(--text-primary);\n	padding: 8px 12px;\n	border-radius: 6px;\n	cursor: pointer;\n	font-size: 13px;\n	font-weight: 500;\n	transition: background-color 0.15s ease;\n	display: inline-flex;\n	align-items: center;\n	gap: 8px;\n}\n\n.button:hover {\n	background: var(--bg-tertiary);\n}\n\n.button:active {\n	background: var(--button-bg);\n}\n\n.button:disabled {\n	opacity: 0.6;\n	cursor: not-allowed;\n}\n\n.button.secondary {\n	background: var(--bg-tertiary);\n	border-color: var(--border-subtle);\n	color: var(--text-primary);\n}\n\n.button.secondary:hover {\n	background: var(--list-hover-bg);\n}\n\n.folder-input-row {\n	display: flex;\n	gap: 8px;\n	align-items: center;\n}\n\n.folder-input {\n	flex: 1;\n	background: var(--vscode-input-background);\n	color: var(--vscode-input-foreground);\n	border: 1px solid var(--vscode-input-border, var(--border-color));\n	border-radius: 4px;\n	padding: 6px 10px;\n	font-size: 13px;\n	min-width: 0;\n}\n\n.folder-input:focus {\n	outline: 1px solid var(--link-color);\n	border-color: var(--link-color);\n}\n\n.worktree-roots-list {\n	display: flex;\n	flex-direction: column;\n	gap: 6px;\n}\n\n.worktree-root-item {\n	display: flex;\n	align-items: center;\n	justify-content: space-between;\n	gap: 8px;\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 4px;\n	padding: 6px 10px;\n	font-family: var(--vscode-editor-font-family, monospace);\n	font-size: 12px;\n}\n\n.worktree-root-item span {\n	overflow: hidden;\n	text-overflow: ellipsis;\n	white-space: nowrap;\n}\n\n.worktree-progress-bar {\n	height: 6px;\n	border-radius: 3px;\n	background: var(--bg-tertiary);\n	overflow: hidden;\n	margin-top: 8px;\n}\n\n.worktree-progress-fill {\n	height: 100%;\n	background: var(--link-color);\n	transition: width 0.2s ease;\n}\n\n/* While walking the folder tree we have no percentage yet, so pulse the bar to\n   signal ongoing activity instead of showing a misleading fixed progress. */\n.worktree-progress-fill.indeterminate {\n	animation: worktree-pulse 1.2s ease-in-out infinite;\n}\n\n@keyframes worktree-pulse {\n	0%,\n	100% {\n		opacity: 0.35;\n	}\n\n	50% {\n		opacity: 1;\n	}\n}\n\n.worktree-repo-row {\n	cursor: pointer;\n	font-weight: 600;\n}\n\n.worktree-repo-row:hover {\n	background: var(--bg-tertiary);\n}\n\n.worktree-repo-row.expanded {\n	background: var(--bg-tertiary);\n}\n\n.worktree-delete-link {\n	margin-left: 8px;\n	color: var(--vscode-errorForeground, #f14c4c);\n}\n\n.worktree-delete-link:hover {\n	text-decoration: underline;\n}\n\n.worktree-caret {\n	display: inline-block;\n	width: 14px;\n	color: var(--text-muted);\n	font-size: 10px;\n}\n\n.worktree-roots-toggle {\n	display: inline-flex;\n	align-items: center;\n	gap: 4px;\n	margin: 8px 0;\n	padding: 0;\n	background: none;\n	border: none;\n	color: var(--link-color);\n	font-size: 12px;\n	cursor: pointer;\n}\n\n.worktree-roots-toggle:hover {\n	text-decoration: underline;\n}\n\n.worktree-pending {\n	color: var(--text-muted);\n	font-style: italic;\n	opacity: 0.8;\n}\n\n/* The details row's cell wraps the per-worktree table; trim its padding so the\n   nested table aligns with the parent columns. */\n.worktree-repo-details > td {\n	padding: 0 0 12px;\n}\n\n.worktree-cleanup-card {\n	display: flex;\n	flex-direction: column;\n	align-items: center;\n	justify-content: center;\n	gap: 6px;\n}\n\n.worktree-cleanup-card-actions {\n	display: flex;\n	align-items: center;\n	justify-content: center;\n	gap: 6px;\n	flex-wrap: wrap;\n}\n\n.worktree-cleanup-card-actions .button {\n	font-size: 12px;\n	padding: 4px 10px;\n}\n\n.worktree-cleanup-log {\n	margin-top: 8px;\n	display: flex;\n	flex-direction: column;\n	gap: 4px;\n	font-size: 12px;\n}\n\n.worktree-cleanup-log-row {\n	display: flex;\n	gap: 8px;\n	align-items: baseline;\n	padding: 4px 6px;\n	border-radius: 4px;\n	background: var(--bg-tertiary);\n}\n\n.worktree-cleanup-log-branch {\n	font-weight: 600;\n	font-family: var(--vscode-editor-font-family, monospace);\n}\n\n.worktree-cleanup-log-repo {\n	color: var(--text-muted);\n}\n\n.worktree-cleanup-log-reason {\n	color: var(--text-muted);\n	flex: 1;\n}\n";

  // src/webview/shared/messageHandler.ts
  function registerMessageHandler(handler) {
    window.addEventListener("message", (event) => {
      handler(event.data);
    });
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

  // ../src/tokenEstimation.ts
  var NANO_AIU_TO_DOLLARS = 1 / 1e11;
  function parseContextThreshold(threshold) {
    if (!threshold) {
      return null;
    }
    const m2 = /([\d.]+)\s*([KkMm])?/.exec(threshold);
    if (!m2) {
      return null;
    }
    const n5 = parseFloat(m2[1]);
    if (!isFinite(n5) || n5 <= 0) {
      return null;
    }
    const unit = (m2[2] ?? "").toUpperCase();
    return Math.round(n5 * (unit === "M" ? 1e6 : unit === "K" ? 1e3 : 1));
  }
  function getLongContextInfo(modelId, modelPricing = {}) {
    let pricing = modelPricing[modelId];
    if (!pricing) {
      const id = modelId.toLowerCase();
      for (const [key, value] of Object.entries(modelPricing)) {
        if (id.includes(key.toLowerCase()) || key.toLowerCase().includes(id)) {
          pricing = value;
          break;
        }
      }
    }
    const longContext = pricing?.copilotPricing?.longContext;
    if (!longContext) {
      return null;
    }
    const thresholdTokens = parseContextThreshold(longContext.threshold);
    if (!thresholdTokens) {
      return null;
    }
    return {
      thresholdTokens,
      defaultInputCostPerMillion: pricing.copilotPricing.inputCostPerMillion,
      longContextInputCostPerMillion: longContext.inputCostPerMillion
    };
  }

  // ../src/modelEfficiency.ts
  function deriveModelEfficiencyRates(c4) {
    return {
      oneShotRate: c4.editTurns > 0 ? c4.oneShotEditTurns / c4.editTurns : null,
      retryRate: c4.editTurns > 0 ? c4.retries / c4.editTurns : null,
      selfCorrectionRate: c4.editTurns > 0 ? c4.selfCorrections / c4.editTurns : null,
      costPerCall: c4.calls > 0 ? c4.cost / c4.calls : null,
      costPerEdit: c4.editTurns > 0 ? c4.cost / c4.editTurns : null,
      outputTokensPerCall: c4.calls > 0 ? c4.outputTokens / c4.calls : null,
      // Cap at 1.0: some providers report cachedReadTokens > inputTokens (e.g. DeepSeek).
      cacheHitRate: c4.inputTokens > 0 ? Math.min(1, c4.cachedReadTokens / c4.inputTokens) : null
    };
  }
  function computeEfficiencyLowUsageThreshold(usage) {
    const calls = Object.values(usage).map((c4) => c4.calls).sort((a3, b3) => a3 - b3);
    if (calls.length < 4) {
      return null;
    }
    return calls[Math.floor((calls.length - 1) * 0.25)];
  }

  // src/webview/usage/customizationSanitizer.ts
  var VALID_STATUSES = /* @__PURE__ */ new Set(["\u2705", "\u26A0\uFE0F", "\u274C"]);
  function coerceNumber(value) {
    const n5 = Number(value);
    return Number.isFinite(n5) ? n5 : 0;
  }
  function sanitizeCustomizationMatrix(rawMatrix) {
    if (!rawMatrix || typeof rawMatrix !== "object") {
      return void 0;
    }
    const m2 = rawMatrix;
    const customizationTypes = Array.isArray(m2.customizationTypes) ? m2.customizationTypes.filter((t4) => !!t4 && typeof t4 === "object").map((t4) => ({
      id: typeof t4.id === "string" ? t4.id : "",
      icon: typeof t4.icon === "string" ? t4.icon : "",
      label: typeof t4.label === "string" ? t4.label : ""
    })).filter((t4) => t4.id !== "") : [];
    const workspaces = Array.isArray(m2.workspaces) ? m2.workspaces.filter((w2) => !!w2 && typeof w2 === "object").map((w2) => {
      const rawStatuses = w2.typeStatuses && typeof w2.typeStatuses === "object" ? w2.typeStatuses : {};
      const typeStatuses = {};
      for (const [key, val] of Object.entries(rawStatuses)) {
        typeStatuses[key] = VALID_STATUSES.has(val) ? val : "\u274C";
      }
      return {
        workspacePath: typeof w2.workspacePath === "string" ? w2.workspacePath : "",
        workspaceName: typeof w2.workspaceName === "string" ? w2.workspaceName : "",
        sessionCount: coerceNumber(w2.sessionCount),
        interactionCount: coerceNumber(w2.interactionCount),
        typeStatuses
      };
    }) : [];
    return {
      customizationTypes,
      workspaces,
      totalWorkspaces: coerceNumber(m2.totalWorkspaces),
      workspacesWithIssues: coerceNumber(m2.workspacesWithIssues)
    };
  }

  // src/webview/usage/billingStatsSanitizer.ts
  function finiteNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }
  function sanitizeCopilotApiBalance(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const r6 = raw;
    return {
      budgetUsd: finiteNumber(r6.budgetUsd),
      budgetAiCredits: finiteNumber(r6.budgetAiCredits),
      remainingAiCredits: finiteNumber(r6.remainingAiCredits),
      usedAiCredits: finiteNumber(r6.usedAiCredits),
      pctAvailable: finiteNumber(r6.pctAvailable)
    };
  }
  function sanitizeBillingGroupCosts(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const result = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        result[key] = value;
      }
    }
    return result;
  }
  function applyBillingFields(target, raw) {
    if (!raw || typeof raw !== "object") {
      return;
    }
    const r6 = raw;
    const apiBalance = sanitizeCopilotApiBalance(r6.copilotApiBalance);
    if (apiBalance) {
      target.copilotApiBalance = apiBalance;
    }
    const billingCosts = sanitizeBillingGroupCosts(r6.monthBillingGroupCosts);
    if (billingCosts) {
      target.monthBillingGroupCosts = billingCosts;
    }
  }

  // src/webview/usage/agentSessionsSanitizer.ts
  function toSafeNumber(value) {
    const n5 = Number(value);
    return Number.isFinite(n5) && n5 >= 0 ? n5 : 0;
  }
  function toSafeHttpUrl(value) {
    const raw = typeof value === "string" ? value.trim() : "";
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
    }
    return "#";
  }
  function sanitizeAgentSessionsData(input) {
    const src = input && typeof input === "object" ? input : {};
    const repos = Array.isArray(src.repos) ? src.repos : [];
    return {
      authenticated: Boolean(src.authenticated),
      since: typeof src.since === "string" ? escapeHtml(src.since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
      fetchedAt: typeof src.fetchedAt === "string" ? src.fetchedAt : "",
      totalTasks: toSafeNumber(src.totalTasks),
      totalSessions: toSafeNumber(src.totalSessions),
      totalCredits: toSafeNumber(src.totalCredits),
      repos: repos.map((repo) => {
        const r6 = repo && typeof repo === "object" ? repo : {};
        const owner = escapeHtml(typeof r6.owner === "string" ? r6.owner : "");
        const repoName = escapeHtml(typeof r6.repo === "string" ? r6.repo : "");
        return {
          owner,
          repo: repoName,
          repoUrl: toSafeHttpUrl(`https://github.com/${owner}/${repoName}`),
          totalTasks: toSafeNumber(r6.totalTasks),
          totalSessions: toSafeNumber(r6.totalSessions),
          totalCredits: toSafeNumber(r6.totalCredits),
          tasksScanned: toSafeNumber(r6.tasksScanned),
          tasksTotal: toSafeNumber(r6.tasksTotal),
          partial: Boolean(r6.partial),
          error: typeof r6.error === "string" ? escapeHtml(r6.error) : void 0
        };
      })
    };
  }

  // ../src/utils/toolUtils.ts
  var GUID_MCP_PATTERN = /^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;
  function toTitleCase(s4) {
    return s4.replace(/_/g, " ").replace(/\b\w/g, (c4) => c4.toUpperCase());
  }
  function resolveGuidMcpToolName(id) {
    const match = GUID_MCP_PATTERN.exec(id);
    if (!match) {
      return void 0;
    }
    return `Claude MCP: M365 Connector - ${toTitleCase(match[1])}`;
  }
  function isGuidMcpTool(id) {
    return GUID_MCP_PATTERN.test(id);
  }
  var MCP_TOOL_FAMILIES = [
    {
      displayName: "GitHub MCP",
      keywords: ["github"],
      actions: /* @__PURE__ */ new Set([
        "actions_list",
        "add_comment_to_pending_review",
        "add_issue_comment",
        "add_reply_to_pull_request_comment",
        "assign_copilot_to_issue",
        "create_or_update_file",
        "create_pull_request",
        "create_repository",
        "get_commit",
        "get_file_contents",
        "get_job_logs",
        "get_label",
        "get_latest_release",
        "get_me",
        "get_release_by_tag",
        "get_repository_tree",
        "get_tag",
        "issue_read",
        "issue_write",
        "label_write",
        "list_branches",
        "list_code_scanning_alerts",
        "list_commits",
        "list_issue_fields",
        "list_issue_types",
        "list_issues",
        "list_label",
        "list_pull_requests",
        "list_tags",
        "projects_list",
        "pull_request_read",
        "pull_request_review_write",
        "request_copilot_review",
        "search_code",
        "search_issues",
        "search_pull_requests",
        "search_repositories",
        "search_users",
        "semantic_issue_similarity_search",
        "semantic_issues_search",
        "sub_issue_write",
        "update_pull_request"
      ])
    },
    {
      displayName: "Playwright MCP",
      keywords: ["playwright"],
      actions: /* @__PURE__ */ new Set([
        "browser_click",
        "browser_close",
        "browser_console_messages",
        "browser_evaluate",
        "browser_fill_form",
        "browser_find",
        "browser_hover",
        "browser_install",
        "browser_navigate",
        "browser_network_request",
        "browser_network_requests",
        "browser_press_key",
        "browser_resize",
        "browser_run_code",
        "browser_run_code_unsafe",
        "browser_snapshot",
        "browser_tabs",
        "browser_take_screenshot",
        "browser_type",
        "browser_wait_for"
      ])
    },
    {
      displayName: "Context7 MCP",
      keywords: ["context7"],
      actions: /* @__PURE__ */ new Set(["get_library_docs", "query_docs", "resolve_library_id"])
    },
    {
      displayName: "Tavily MCP",
      keywords: ["tavily"],
      actions: /* @__PURE__ */ new Set(["tavily_crawl", "tavily_extract", "tavily_research", "tavily_search", "crawl", "extract", "research", "search"])
    },
    {
      displayName: "Microsoft Docs MCP",
      keywords: ["microsoft_doc", "microsoftdocs", "microsoft_learn"],
      actions: /* @__PURE__ */ new Set(["docs_fetch", "docs_search", "code_sample_search"])
    },
    {
      displayName: "Claude Browser MCP",
      keywords: ["claude_browser", "claude_in_chrome"],
      actions: /* @__PURE__ */ new Set([
        "computer",
        "find",
        "get_page_text",
        "javascript_tool",
        "navigate",
        "preview_list",
        "preview_logs",
        "preview_start",
        "preview_stop",
        "read_console_messages",
        "read_network_requests",
        "read_page",
        "resize_window",
        "tabs_close",
        "tabs_context",
        "tabs_create",
        "tabs_select"
      ])
    }
  ];
  function normalizeMcpId(id) {
    return id.toLowerCase().replace(/[.-]/g, "_");
  }
  function resolveMcpFamilyToolName(id) {
    const normalized = normalizeMcpId(id);
    for (const family of MCP_TOOL_FAMILIES) {
      if (!family.keywords.some((keyword) => normalized.includes(keyword))) {
        continue;
      }
      for (const action of family.actions) {
        if (normalized === action || normalized.endsWith(`_${action}`)) {
          return `${family.displayName}: ${toTitleCase(action)}`;
        }
      }
    }
    return void 0;
  }
  function isMcpFamilyResolvedTool(id) {
    return resolveMcpFamilyToolName(id) !== void 0;
  }

  // src/webview/usage/main.ts
  function statusBadgeHtml(status, label) {
    const titleAttr = label ? ` title="${escapeHtml(label)}"` : "";
    const base = "display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";
    if (status === "\u2705") {
      return `<span style="${base}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? "Present and fresh")}">\u2713</span>`;
    } else if (status === "\u26A0\uFE0F") {
      return `<span style="${base}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? "Present but stale")}">!</span>`;
    } else {
      return `<span style="${base}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? "Missing")}">\u2715</span>`;
    }
  }
  var vscode = acquireVsCodeApi();
  var curationTraceOnceKeys = /* @__PURE__ */ new Set();
  var aboutCollapsed = vscode.getState()?.aboutCollapsed ?? false;
  function traceCuration(stage, details) {
    try {
      vscode.postMessage({ command: "traceUsageCuration", stage, details: details ?? {} });
    } catch {
    }
  }
  function traceCurationOnce(key, stage, details) {
    if (curationTraceOnceKeys.has(key)) {
      return;
    }
    curationTraceOnceKeys.add(key);
    traceCuration(stage, details);
  }
  var initialData = getWindowData("__INITIAL_USAGE__");
  var hygieneMatrixState = null;
  var repoAnalysisState = /* @__PURE__ */ new Map();
  var selectedRepoPath = null;
  var isSwitchingRepository = false;
  var isBatchAnalysisInProgress = false;
  var currentWorkspacePaths = [];
  var activeTab = "activity";
  var loadingTimeoutId = null;
  var currentInsights = [];
  var currentCurationAnalysis = null;
  var worktreeRoots = initialData?.worktreeScanRoots ? [...initialData.worktreeScanRoots] : [];
  var worktreeResults = [];
  var worktreeScanInProgress = false;
  var worktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
  var worktreeScanError = null;
  var worktreeRenderPending = false;
  var worktreeExpandedRepos = /* @__PURE__ */ new Set();
  var worktreeRootsExpanded = false;
  var worktreeSortColumn = "count";
  var worktreeSortDir = "desc";
  var worktreeCleanupInProgress = false;
  var worktreeCleanupConfirmPending = false;
  var worktreeCleanupStatus = { processed: 0, total: 0 };
  var worktreeCleanupLog = [];
  function numField(v2) {
    return Number(v2 ?? 0) || 0;
  }
  var USAGE_LOADING_CSS = `
<style id="usage-loading-css">
:root {
  --ul-bg: var(--vscode-sideBar-background, #181825);
  --ul-card: var(--vscode-editorWidget-background, #24273a);
  --ul-fg: var(--vscode-editor-foreground, #cdd6f4);
  --ul-muted: var(--vscode-descriptionForeground, #9399b2);
  --ul-accent: var(--vscode-textLink-foreground, #89b4fa);
  --ul-success: var(--vscode-terminal-ansiGreen, #a6e3a1);
  --ul-border: var(--vscode-panel-border, #313244);
  --ul-badge-bg: var(--vscode-badge-background, #313244);
}
#usage-loading-wrap {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex; align-items: flex-start; justify-content: center; padding: 28px 20px;
}
#usage-loading-card {
  width: 100%; max-width: 680px;
  background: var(--ul-card); border: 1px solid var(--ul-border);
  border-radius: 16px; padding: 24px 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: var(--ul-fg);
}
#ul-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 16px; }
#ul-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ul-accent); margin-bottom: 4px; }
#ul-title { font-size: 22px; font-weight: 700; color: var(--ul-fg); margin-bottom: 4px; }
#ul-subtitle { font-size: 12px; color: var(--ul-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
#ul-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
#ul-pct { font-size: 32px; font-weight: 800; color: var(--ul-fg); line-height: 1; min-width: 60px; text-align: right; font-variant-numeric: tabular-nums; }
.ul-meta-badge { font-size: 11px; padding: 3px 10px; border: 1px solid var(--ul-border); border-radius: 20px; color: var(--ul-muted); background: var(--vscode-editor-background, #1e1e2e); white-space: nowrap; }
#ul-track { height: 6px; background: var(--ul-border); border-radius: 3px; overflow: hidden; margin: 16px 0; }
#ul-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--ul-accent), var(--ul-success)); transition: width 0.4s ease; width: 3%; }
#ul-fill.ul-indeterminate { width: 25%; animation: ul-shimmer 1.8s ease-in-out infinite; background: linear-gradient(90deg, transparent, var(--ul-accent), var(--ul-success), transparent); }
@keyframes ul-shimmer { 0% { margin-left: -30%; } 100% { margin-left: 110%; } }
#ul-steps { background: var(--ul-bg); border: 1px solid var(--ul-border); border-radius: 10px; padding: 14px 16px; }
.ul-step { display: flex; align-items: center; gap: 10px; padding: 5px 0; color: var(--ul-muted); font-size: 13px; transition: color 0.25s; }
.ul-step.ul-done   { color: var(--ul-success); }
.ul-step.ul-active { color: var(--ul-accent); font-weight: 600; }
.ul-ico { width: 18px; text-align: center; flex-shrink: 0; }
.ul-spin { display: inline-block; animation: ul-spin 0.75s linear infinite; }
@keyframes ul-spin { to { transform: rotate(360deg); } }
.ul-lbl { flex: 1; }
.ul-cnt { font-size: 11px; opacity: 0.75; font-variant-numeric: tabular-nums; }
@keyframes ul-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
.ul-pop { animation: ul-pop 0.3s ease both; }
</style>`;
  var USAGE_LOADING_STEPS = [
    { id: "ul-s-start", label: "Starting usage analysis" },
    { id: "ul-s-tools", label: "Collecting runtime tools" },
    { id: "ul-s-mcp", label: "Discovering MCP servers" },
    { id: "ul-s-skills", label: "Scanning skill directories" },
    { id: "ul-s-crunch", label: "Computing curation analysis" },
    { id: "ul-s-ready", label: "Ready!" }
  ];
  var USAGE_STAGE_MAP = {
    start: { pct: 5, stepId: "ul-s-start", subtitle: "Starting usage analysis\u2026" },
    "curation:start": { pct: 20, stepId: "ul-s-tools", subtitle: "Collecting tools and skills\u2026" },
    "curation:runtimeTools": { pct: 32, stepId: "ul-s-tools", subtitle: "Collected runtime tools" },
    "curation:mcpJson": { pct: 44, stepId: "ul-s-mcp", subtitle: "Scanning MCP config files\u2026" },
    "curation:mcpSources": { pct: 55, stepId: "ul-s-mcp", subtitle: "Collected MCP servers" },
    "curation:skillsScanStart": { pct: 63, stepId: "ul-s-skills", subtitle: "Scanning skill directories\u2026" },
    "curation:skillsScanDone": { pct: 75, stepId: "ul-s-skills", subtitle: "Skill discovery complete" },
    "curation:analyzing": { pct: 85, stepId: "ul-s-crunch", subtitle: "Analyzing tool usage patterns\u2026" },
    "curation:done": { pct: 96, stepId: "ul-s-crunch", subtitle: "Curation analysis complete" },
    ready: { pct: 100, stepId: "ul-s-ready", subtitle: "Usage analysis ready" },
    error: { pct: 100, stepId: "ul-s-ready", subtitle: "Analysis completed with errors" },
    "curation:error": { pct: 85, stepId: "ul-s-crunch", subtitle: "Curation analysis skipped" }
  };
  function renderUsageLoadingState(initialMessage = "Loading usage analysis...") {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    _ulLoadingActive = true;
    const stepsHtml = USAGE_LOADING_STEPS.map((s4, i6) => {
      const isFirst = i6 === 0;
      const cls = isFirst ? "ul-step ul-active" : "ul-step";
      const ico = isFirst ? '<span class="ul-spin">\u21BB</span>' : "\u25CB";
      return `<div class="${cls}" id="${s4.id}"><span class="ul-ico">${ico}</span><span class="ul-lbl">${escapeHtml(s4.label)}</span><span class="ul-cnt" id="${s4.id}-cnt"></span></div>`;
    }).join("");
    setHtml(root, `${USAGE_LOADING_CSS}
<div id="usage-loading-wrap">
  <div id="usage-loading-card">
    <div id="ul-header">
      <div>
        <div id="ul-badge">\u{1F4CA} Analyzing Usage Data</div>
        <div id="ul-title">${escapeHtml(initialMessage)}</div>
        <div id="ul-subtitle">Initializing\u2026</div>
      </div>
      <div id="ul-right">
        <div id="ul-pct">\u2013</div>
        <div style="display:flex;gap:6px;" id="ul-meta"></div>
      </div>
    </div>
    <div id="ul-track"><div id="ul-fill" class="ul-indeterminate"></div></div>
    <div id="ul-steps">${stepsHtml}</div>
  </div>
</div>`);
  }
  function _ulSetDone(id) {
    const el2 = document.getElementById(id);
    if (!el2) {
      return;
    }
    el2.className = "ul-step ul-done";
    const ico = el2.querySelector(".ul-ico");
    if (ico) {
      setHtml(ico, '<span class="ul-pop">\u2713</span>');
    }
  }
  function _ulSetActive(id) {
    const el2 = document.getElementById(id);
    if (!el2) {
      return;
    }
    el2.className = "ul-step ul-active";
    const ico = el2.querySelector(".ul-ico");
    if (ico) {
      setHtml(ico, '<span class="ul-spin">\u21BB</span>');
    }
  }
  function _ulSetCnt(id, text) {
    const el2 = document.getElementById(`${id}-cnt`);
    if (el2) {
      el2.textContent = text;
    }
  }
  var _ulLastStepIdx = 0;
  var _ulLoadingActive = false;
  function _ulAdvanceSteps(targetIdx, pct) {
    for (let i6 = _ulLastStepIdx; i6 < targetIdx; i6++) {
      _ulSetDone(USAGE_LOADING_STEPS[i6].id);
    }
    if (targetIdx > _ulLastStepIdx) {
      _ulLastStepIdx = targetIdx;
    }
    if (pct < 100) {
      _ulSetActive(USAGE_LOADING_STEPS[targetIdx].id);
    } else {
      _ulSetDone(USAGE_LOADING_STEPS[targetIdx].id);
    }
  }
  function _ulDetailCnt(details) {
    if (typeof details.count === "number") {
      return `${details.count}`;
    }
    if (typeof details.skills === "number") {
      return `${details.skills} skills`;
    }
    if (typeof details.availableTools === "number") {
      return `${details.availableTools} tools`;
    }
    return "";
  }
  function _ulEnsureCard() {
    const root = document.getElementById("root");
    if (!root) {
      return false;
    }
    if (root.querySelector("#usage-loading-card")) {
      return true;
    }
    if (!_ulLoadingActive) {
      return false;
    }
    renderUsageLoadingState("Building Usage Analysis");
    _ulLastStepIdx = 0;
    return true;
  }
  function updateUsageLoadingProgress(message) {
    if (!_ulEnsureCard()) {
      return;
    }
    const stage = typeof message?.stage === "string" ? message.stage : "";
    const mapped = USAGE_STAGE_MAP[stage];
    if (!mapped) {
      return;
    }
    const pct = mapped.pct;
    const fill = document.getElementById("ul-fill");
    if (fill) {
      fill.classList.remove("ul-indeterminate");
      fill.style.width = `${Math.max(pct, 3)}%`;
    }
    const pctEl = document.getElementById("ul-pct");
    if (pctEl) {
      pctEl.textContent = pct === 100 ? "100%" : `${pct}%`;
    }
    const subtitleEl = document.getElementById("ul-subtitle");
    if (subtitleEl) {
      subtitleEl.textContent = mapped.subtitle;
    }
    const targetIdx = USAGE_LOADING_STEPS.findIndex((s4) => s4.id === mapped.stepId);
    if (targetIdx >= 0) {
      _ulAdvanceSteps(targetIdx, pct);
    }
    const details = message?.details;
    if (details && typeof details === "object") {
      const cnt = _ulDetailCnt(details);
      if (cnt) {
        _ulSetCnt(mapped.stepId, `(${cnt})`);
      }
    }
  }
  function clearLoadingTimeout() {
    if (loadingTimeoutId !== null) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = null;
    }
  }
  function createRefreshButton() {
    const btn = document.createElement("button");
    btn.textContent = "\u{1F504} Refresh";
    btn.style.cssText = "padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;";
    btn.addEventListener("click", () => vscode.postMessage({ command: "refresh" }));
    return btn;
  }
  function showLoadError(message) {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const container = document.createElement("div");
    container.style.cssText = "padding: 32px; text-align: center; font-size: 14px;";
    const icon = document.createElement("div");
    icon.style.cssText = "font-size: 24px; margin-bottom: 12px;";
    setHtml(icon, statusBadgeHtml("\u274C", "Error"));
    const msg = document.createElement("div");
    msg.style.cssText = "color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;";
    msg.textContent = message;
    container.append(icon, msg, createRefreshButton());
    root.textContent = "";
    root.append(container);
  }
  var repoPrStatsLoaded = false;
  var repoPrStatsData = null;
  var agentSessionsLoaded = false;
  var agentSessionsData = null;
  var EFFORT_DISPLAY_NAMES = {
    xhigh: "Extra High"
  };
  function getEffortDisplayName(level) {
    return EFFORT_DISPLAY_NAMES[level] ?? level;
  }
  var TOOL_NAME_MAP = getWindowData("__TOOL_NAMES__") ?? null;
  var _automaticToolIds = getWindowData("__AUTOMATIC_TOOLS__") ?? [];
  var AUTOMATIC_TOOL_SET_WV = new Set(_automaticToolIds.map((id) => id.toLowerCase()));
  function lookupToolName(id) {
    if (!TOOL_NAME_MAP) {
      return id;
    }
    return TOOL_NAME_MAP[id] ?? TOOL_NAME_MAP[id.toLowerCase()] ?? resolveGuidMcpToolName(id) ?? resolveMcpFamilyToolName(id) ?? id;
  }
  function lookupMcpToolName(id) {
    const full = lookupToolName(id);
    const colonIdx = full.indexOf(":");
    if (colonIdx !== -1) {
      return full.substring(colonIdx + 1).trim();
    }
    return full;
  }
  function getUnknownMcpTools(stats) {
    const allTools = /* @__PURE__ */ new Set();
    Object.entries(stats.today.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
    Object.entries(stats.last30Days.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
    Object.entries(stats.month.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
    Object.entries(stats.today.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));
    Object.entries(stats.last30Days.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));
    Object.entries(stats.month.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));
    const suppressed = new Set(stats.suppressedUnknownTools ?? []);
    return Array.from(allTools).filter((tool) => !TOOL_NAME_MAP?.[tool] && !TOOL_NAME_MAP?.[tool.toLowerCase()] && !isGuidMcpTool(tool) && !isMcpFamilyResolvedTool(tool) && !suppressed.has(tool)).sort();
  }
  function createMcpToolIssueUrl(unknownTools) {
    const repoUrl = "https://github.com/rajbos/ai-engineering-fluency";
    const title = encodeURIComponent("Add missing friendly names for tools");
    const toolList = unknownTools.map((tool) => `- \`${tool}\``).join("\n");
    const body = encodeURIComponent(
      `## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${toolList}

Please add friendly names for these tools to improve the user experience.`
    );
    const labels = encodeURIComponent("MCP Toolnames");
    return `${repoUrl}/issues/new?title=${title}&body=${body}&labels=${labels}`;
  }
  var MODE_BAR_CONFIGS = [
    { label: "\u{1F4AC} Ask Mode", key: "ask", gradient: "linear-gradient(90deg, #3b82f6, #60a5fa)" },
    { label: "\u270F\uFE0F Edit Mode", key: "edit", gradient: "linear-gradient(90deg, #10b981, #34d399)" },
    { label: "\u{1F916} Agent Mode", key: "agent", gradient: "linear-gradient(90deg, #7c3aed, #a855f7)" },
    { label: "\u{1F4CB} Plan Mode", key: "plan", gradient: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
    { label: "\u26A1 Custom Agent", key: "customAgent", gradient: "linear-gradient(90deg, #ec4899, #f472b6)" },
    { label: "\u{1F5A5}\uFE0F CLI", key: "cli", gradient: "linear-gradient(90deg, #06b6d4, #22d3ee)" }
  ];
  function renderModeBarItem(label, count, total, gradient) {
    const pct = total > 0 ? count / total * 100 : 0;
    return `
<div class="bar-item">
<div class="bar-label"><span>${label}</span><span><strong>${formatNumber(count)}</strong> (${formatPercent(pct, 0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${pct.toFixed(1)}%; background: ${gradient};"></div></div>
</div>`;
  }
  function renderModeBarChart(modeUsage, title) {
    const total = modeUsage.ask + modeUsage.edit + modeUsage.agent + modeUsage.plan + modeUsage.customAgent + modeUsage.cli;
    const bars = MODE_BAR_CONFIGS.map(({ label, key, gradient }) => renderModeBarItem(label, modeUsage[key], total, gradient)).join("");
    return `
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${title}</h4>
<div class="bar-chart">${bars}
</div>
</div>`;
  }
  function _renderMultiModelStatCards(switching) {
    return `
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${formatFixed(switching.averageModelsPerSession, 1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${formatPercent(switching.switchingFrequency, 0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${formatNumber(switching.maxModelsPerSession || 0)}</div>
</div>
</div>`;
  }
  function _renderMultiModelCostLevelBreakdown(allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels) {
    return `
<div style="min-height: 110px;">
${allLowCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">\u{1F49A} Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allLowCostModels.map(escapeHtml).join(", ")}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allMediumCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allMediumCostModels.map(escapeHtml).join(", ")}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allHighCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allHighCostModels.map(escapeHtml).join(", ")}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allUnknownModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">\u2753 Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allUnknownModels.map(escapeHtml).join(", ")}</span>
</div>
` : ""}
</div>`;
  }
  function _renderMultiModelRequestCountBreakdown(switching) {
    if (switching.totalRequests <= 0) {
      return "";
    }
    return `
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${switching.lowCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.lowCostRequests)} (${formatPercent(switching.lowCostRequests / switching.totalRequests * 100)})</span>
</div>
` : ""}
${switching.mediumCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.mediumCostRequests)} (${formatPercent(switching.mediumCostRequests / switching.totalRequests * 100)})</span>
</div>
` : ""}
${switching.highCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.highCostRequests)} (${formatPercent(switching.highCostRequests / switching.totalRequests * 100)})</span>
</div>
` : ""}
${switching.unknownRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.unknownRequests)} (${formatPercent(switching.unknownRequests / switching.totalRequests * 100)})</span>
</div>
` : ""}
</div>`;
  }
  function _renderMultiModelMixedCostSessions(switching) {
    if (switching.mixedCostSessions <= 0) {
      return "";
    }
    return `
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${formatNumber(switching.mixedCostSessions)}</span>
</div>`;
  }
  function renderMultiModelPeriod(title, switching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels) {
    return `
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${title}</h4>
${_renderMultiModelStatCards(switching)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${_renderMultiModelCostLevelBreakdown(allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
${_renderMultiModelRequestCountBreakdown(switching)}
${_renderMultiModelMixedCostSessions(switching)}
</div>
</div>`;
  }
  function updateProgressPanel(selector, progressClass, messagePrefix, done, total) {
    const container = document.querySelector(selector);
    if (!container) {
      return;
    }
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const message = `${messagePrefix} ${done}/${total} repos (${pct}%)`;
    const existing = container.querySelector(`.${progressClass}`);
    if (existing) {
      existing.textContent = message;
    } else {
      Array.from(container.children).forEach((child) => {
        const htmlEl = child;
        if (!htmlEl.classList.contains("section-title") && !htmlEl.classList.contains("section-subtitle")) {
          htmlEl.remove();
        }
      });
      const div = document.createElement("div");
      div.className = progressClass;
      div.style.cssText = "margin-top:8px; font-size:12px; color:var(--text-secondary);";
      div.textContent = message;
      container.appendChild(div);
    }
  }
  function renderMissedPotential(stats) {
    const missed = stats.missedPotential || initialData?.missedPotential || [];
    if (missed.length === 0) {
      return `
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${statusBadgeHtml("\u2705")} No other AI tool configs missing a Copilot counterpart
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
					All active workspaces that contain instruction files for other AI tools (e.g. .cursorrules, CLAUDE.md, AGENTS.md) also have Copilot customization files configured.
				</div>
				<div style="font-size: 11px; color: var(--text-secondary);">
					A workspace appears here when it has instruction files for other AI tools but no Copilot customization files \u2014 indicating Copilot may be under-configured compared to other tools. <a href="https://code.visualstudio.com/docs/copilot/customization/custom-instructions" style="color: var(--link-color);" target="_blank">Learn how to add Copilot instructions</a>.
				</div>
			</div>
		`;
    }
    return `
        <div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 6px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--warning-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${statusBadgeHtml("\u26A0\uFE0F")} Missed Potential: Non-Copilot Instruction Files
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
                These active workspaces use other AI tools but lack Copilot customizations. <a href="https://code.visualstudio.com/docs/copilot/customization/custom-instructions" style="color: var(--link-color);" target="_blank">Learn how to add Copilot instructions</a>.
            </div>
            <div class="customization-matrix-container">
                <table class="customization-matrix">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">\u{1F4C2} Workspace</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Sessions</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Interactions</th>
                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Non-Copilot Files Found</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${missed.map((ws) => `
                            <tr style="background: rgba(251, 191, 36, 0.05);">
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); font-family: 'Courier New', monospace; font-size: 12px;">
                                    ${escapeHtml(ws.workspaceName)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${formatNumber(ws.sessionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${formatNumber(ws.interactionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        ${ws.nonCopilotFiles.map((f3) => `
                                            <div style="font-size: 11px; display: flex; align-items: center; gap: 6px;">
                                                <span>${escapeHtml(f3.icon || "\u{1F4C4}")}</span>
                                                <span style="font-weight: 500;">${escapeHtml(f3.label || "")}:</span>
                                                <span style="font-family: monospace; color: var(--text-muted);">${escapeHtml(f3.relativePath)}</span>
                                            </div>
                                        `).join("")}
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
  }
  function renderToolsTable(byTool, limit = 10, nameResolver = lookupToolName, applyAutoFilter = false) {
    const entries = applyAutoFilter && hideAutomaticToolCalls ? Object.entries(byTool).filter(([tool]) => !AUTOMATIC_TOOL_SET_WV.has(tool.toLowerCase())) : Object.entries(byTool);
    const sortedTools = entries.sort(([, a3], [, b3]) => b3 - a3).slice(0, limit);
    if (sortedTools.length === 0) {
      return applyAutoFilter && hideAutomaticToolCalls ? '<div style="color: var(--text-muted);">No purposeful tools used yet (automatic tool calls are hidden)</div>' : '<div style="color: var(--text-muted);">No tools used yet</div>';
    }
    const rows = sortedTools.map(([tool, count], idx) => {
      const friendly = escapeHtml(nameResolver(tool));
      const idEscaped = escapeHtml(tool);
      const autoBadge = AUTOMATIC_TOOL_SET_WV.has(tool.toLowerCase()) ? `<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>` : "";
      return `
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${idx + 1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${idEscaped}">${friendly}</strong>${autoBadge}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${formatNumber(count)}</td>
		    </tr>`;
    }).join("");
    return `
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>`;
  }
  var SESSION_COLUMN_DEFS = [
    { id: "interactions", label: "Turns", sortKey: "interactions", align: "right", render: (s4) => ({ html: formatNumber(s4.interactions) }) },
    { id: "toolCalls", label: "Tools", sortKey: "toolCalls", align: "right", render: (s4) => ({ html: formatNumber(s4.toolCalls) }) },
    { id: "inputTokens", label: "Input", sortKey: "inputTokens", align: "right", render: (s4) => ({ html: formatNumber(s4.inputTokens) }) },
    { id: "outputTokens", label: "Output", sortKey: "outputTokens", align: "right", render: (s4) => ({ html: formatNumber(s4.outputTokens) }) },
    { id: "thinkingTokens", label: "Thinking", sortKey: "thinkingTokens", align: "right", render: (s4) => ({ html: formatNumber(s4.thinkingTokens) }) },
    { id: "cachedTokens", label: "Cached", sortKey: "cachedTokens", align: "right", render: (s4) => ({ html: formatNumber(s4.cachedTokens) }) },
    { id: "totalTokens", label: "Total", sortKey: "totalTokens", align: "right", render: (s4) => ({ html: formatNumber(s4.totalTokens) }) },
    { id: "estimatedCost", label: "Cost", sortKey: "estimatedCost", align: "right", render: (s4) => ({ html: s4.estimatedCost > 0 ? `$${s4.estimatedCost.toFixed(4)}` : "\u2014" }) },
    { id: "editor", label: "Editor", sortKey: "editor", align: "left", render: (s4) => ({ html: escapeHtml(s4.editor || "unknown") }) },
    { id: "workspace", label: "Workspace", sortKey: "workspace", align: "left", cellStyle: "max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;", render: (s4) => {
      const workspace = escapeHtml(s4.workspace || "\u2014");
      return { html: workspace, title: workspace };
    } },
    { id: "models", label: "Models", align: "left", cellStyle: "font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;", render: (s4) => {
      const models = s4.models.map((m2) => escapeHtml(getModelDisplayName(m2))).join(", ") || "\u2014";
      return { html: models, title: models };
    } },
    { id: "durationMs", label: "Duration", sortKey: "durationMs", align: "right", cellStyle: "white-space:nowrap;", render: (s4) => {
      const net = s4.activeDurationMs ?? s4.durationMs;
      const wallLabel = s4.durationMs !== void 0 ? `Wall time: ${formatDurationShort(s4.durationMs)}` : void 0;
      return { html: formatDurationShort(net), ...wallLabel ? { title: wallLabel } : {} };
    } },
    {
      id: "lastActivity",
      label: "Last Active",
      sortKey: "lastActivity",
      align: "right",
      cellStyle: "white-space:nowrap;",
      render: (s4) => ({
        html: s4.lastActivity ? sessionsLookback === "today" ? new Date(s4.lastActivity).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !use24HourTime }) : new Date(s4.lastActivity).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: !use24HourTime }) : "\u2014"
      })
    }
  ];
  var ALL_SESSION_COLUMN_IDS = SESSION_COLUMN_DEFS.map((c4) => c4.id);
  var sessionSortColumn = "interactions";
  var sessionSortDirection = "desc";
  var cachedTodaySessions = [];
  var use24HourTime = true;
  var hideAutomaticToolCalls = true;
  var sessionsLookback = "today";
  var latestTodaySessions = [];
  var recentSessionsCache = {};
  var enabledSessionColumns = new Set(ALL_SESSION_COLUMN_IDS);
  function saveSessionColumnSettings() {
    vscode.postMessage({ command: "saveSessionColumnSettings", settings: { enabledColumns: Array.from(enabledSessionColumns) } });
  }
  function getSessionSortIndicator(column) {
    if (sessionSortColumn !== column) {
      return "";
    }
    return sessionSortDirection === "desc" ? " \u25BC" : " \u25B2";
  }
  var _todaySessionColumnComparators = {
    title: (a3, b3) => (a3.title || "").localeCompare(b3.title || ""),
    editor: (a3, b3) => (a3.editor || "").localeCompare(b3.editor || ""),
    workspace: (a3, b3) => (a3.workspace || "").localeCompare(b3.workspace || ""),
    durationMs: (a3, b3) => (a3.activeDurationMs ?? a3.durationMs ?? -1) - (b3.activeDurationMs ?? b3.durationMs ?? -1),
    lastActivity: (a3, b3) => (a3.lastActivity || "").localeCompare(b3.lastActivity || "")
  };
  function _compareTodaySessionsByColumn(a3, b3) {
    const comparator = _todaySessionColumnComparators[sessionSortColumn];
    if (comparator) {
      return comparator(a3, b3);
    }
    return a3[sessionSortColumn] - b3[sessionSortColumn];
  }
  function sortTodaySessions(sessions) {
    return [...sessions].sort((a3, b3) => {
      const cmp = _compareTodaySessionsByColumn(a3, b3);
      return sessionSortDirection === "desc" ? -cmp : cmp;
    });
  }
  function renderTodaySessionsTable(sessions) {
    cachedTodaySessions = sessions;
    if (!sessions || sessions.length === 0) {
      const emptyMessage = sessionsLookback === "today" ? "No sessions recorded today yet." : "No sessions recorded in this period.";
      return `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${emptyMessage}</div>`;
    }
    return `<div id="sessions-table-container">${buildSessionsTableHtml(sessions)}</div>`;
  }
  function buildSessionsTableHtml(sessions) {
    const sorted = sortTodaySessions(sessions);
    const visibleColumns = SESSION_COLUMN_DEFS.filter((c4) => enabledSessionColumns.has(c4.id));
    const rows = sorted.map((s4, idx) => {
      const title = escapeHtml(s4.title || "Untitled session");
      const filePath = escapeHtml(s4.filePath || "");
      const optionalCells = visibleColumns.map((col) => {
        const { html, title: cellTitle } = col.render(s4);
        const alignStyle = col.align === "right" ? "text-align:right;" : "";
        const titleAttr = cellTitle !== void 0 ? ` title="${cellTitle}"` : "";
        return `<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${alignStyle}${col.cellStyle || ""}"${titleAttr}>${html}</td>`;
      }).join("");
      return `<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${idx + 1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${title}&quot;"><a href="#" class="session-title-link" data-file="${filePath}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${title}</a></td>
			${optionalCells}
		</tr>`;
    }).join("");
    const headerCells = visibleColumns.map((col) => {
      const alignStyle = col.align === "right" ? " text-align:right;" : "";
      if (!col.sortKey) {
        return `<th style="padding:6px 8px;${alignStyle}">${col.label}</th>`;
      }
      return `<th class="sortable" data-sort="${col.sortKey}" style="padding:6px 8px;${alignStyle}">${col.label}${getSessionSortIndicator(col.sortKey)}</th>`;
    }).join("");
    return `
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${getSessionSortIndicator("title")}</th>
					${headerCells}
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>
		</div>`;
  }
  function buildSessionColumnsMenuHtml() {
    const items = SESSION_COLUMN_DEFS.map((col) => `
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${col.id}"${enabledSessionColumns.has(col.id) ? " checked" : ""} />
			<span>${col.label}</span>
		</label>`).join("");
    return `
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">\u2699 Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${items}
			</div>
		</div>`;
  }
  function setupSessionsTableSort() {
    const body = document.getElementById("sessions-panel-body");
    if (!body) {
      return;
    }
    body.addEventListener("click", (e7) => {
      const link = e7.target.closest("a.session-title-link");
      if (link) {
        e7.preventDefault();
        const file = link.getAttribute("data-file");
        if (file) {
          vscode.postMessage({ command: "openSessionFile", file });
        }
        return;
      }
      const th = e7.target.closest("th.sortable");
      if (!th) {
        return;
      }
      const col = th.getAttribute("data-sort");
      if (!col) {
        return;
      }
      if (sessionSortColumn === col) {
        sessionSortDirection = sessionSortDirection === "desc" ? "asc" : "desc";
      } else {
        sessionSortColumn = col;
        sessionSortDirection = "desc";
      }
      const container = document.getElementById("sessions-table-container");
      if (container) {
        setHtml(container, buildSessionsTableHtml(cachedTodaySessions));
      }
    });
    renderSessionsLookbackSelector();
    setupSessionColumnsMenu();
  }
  var _documentClickClosesColumnsMenu = false;
  function setupSessionColumnsMenu() {
    const toggle = document.getElementById("sessions-columns-toggle");
    const menu = document.getElementById("sessions-columns-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", (e7) => {
      e7.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    });
    menu.addEventListener("click", (e7) => e7.stopPropagation());
    menu.addEventListener("change", (e7) => {
      const checkbox = e7.target;
      const columnId = checkbox.getAttribute("data-column");
      if (!columnId) {
        return;
      }
      if (checkbox.checked) {
        enabledSessionColumns.add(columnId);
      } else {
        enabledSessionColumns.delete(columnId);
      }
      const container = document.getElementById("sessions-table-container");
      if (container) {
        setHtml(container, buildSessionsTableHtml(cachedTodaySessions));
      }
      saveSessionColumnSettings();
    });
    if (!_documentClickClosesColumnsMenu) {
      _documentClickClosesColumnsMenu = true;
      document.addEventListener("click", () => {
        const liveMenu = document.getElementById("sessions-columns-menu");
        if (liveMenu) {
          liveMenu.style.display = "none";
        }
      });
    }
  }
  function renderSessionsLookbackSelector() {
    const wrapper = document.getElementById("sessions-lookback-wrapper");
    if (!wrapper) {
      return;
    }
    wrapper.replaceChildren();
    const { wrapper: selectorWrapper } = createPeriodSelector({
      id: "sessions-lookback",
      selected: sessionsLookback,
      disabled: ["allTime"],
      disabledTitle: "All-time sessions are not loaded yet",
      label: "",
      onChange: (value) => {
        sessionsLookback = value;
        refreshSessionsPanelBody();
      }
    });
    wrapper.append(selectorWrapper);
    if (sessionsLookback !== "today" && !recentSessionsCache[sessionsLookback]) {
      refreshSessionsPanelBody();
    }
  }
  function refreshSessionsPanelBody() {
    const body = document.getElementById("sessions-panel-body");
    if (!body) {
      return;
    }
    if (sessionsLookback === "today") {
      setHtml(body, renderTodaySessionsTable(latestTodaySessions));
      return;
    }
    const cached = recentSessionsCache[sessionsLookback];
    if (cached) {
      setHtml(body, renderTodaySessionsTable(cached));
      return;
    }
    setHtml(body, `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${PERIOD_LABELS[sessionsLookback]}\u2026</div>`);
    vscode.postMessage({ command: "loadRecentSessions", period: sessionsLookback });
  }
  function handleRecentSessionsLoaded(message) {
    const period = message.period;
    if (!period) {
      return;
    }
    const sessions = Array.isArray(message.sessions) ? message.sessions.filter((s4) => s4 && typeof s4 === "object" && typeof s4.interactions === "number") : [];
    recentSessionsCache[period] = sessions;
    if (sessionsLookback === period) {
      refreshSessionsPanelBody();
    }
  }
  function unionFill(map, keys) {
    const result = { ...map };
    for (const k2 of keys) {
      if (!(k2 in result)) {
        result[k2] = 0;
      }
    }
    return result;
  }
  function coerceNumber2(value) {
    const n5 = Number(value);
    return Number.isFinite(n5) ? n5 : 0;
  }
  function sanitizeModeUsage(mode) {
    const m2 = mode && typeof mode === "object" ? mode : {};
    return {
      ask: coerceNumber2(m2.ask),
      edit: coerceNumber2(m2.edit),
      agent: coerceNumber2(m2.agent),
      plan: coerceNumber2(m2.plan),
      customAgent: coerceNumber2(m2.customAgent),
      cli: coerceNumber2(m2.cli)
    };
  }
  function sanitizeContextRefs(refs) {
    const r6 = refs && typeof refs === "object" ? refs : {};
    return {
      file: coerceNumber2(r6.file),
      selection: coerceNumber2(r6.selection),
      implicitSelection: coerceNumber2(r6.implicitSelection),
      symbol: coerceNumber2(r6.symbol),
      codebase: coerceNumber2(r6.codebase),
      workspace: coerceNumber2(r6.workspace),
      terminal: coerceNumber2(r6.terminal),
      vscode: coerceNumber2(r6.vscode),
      terminalLastCommand: coerceNumber2(r6.terminalLastCommand),
      terminalSelection: coerceNumber2(r6.terminalSelection),
      clipboard: coerceNumber2(r6.clipboard),
      changes: coerceNumber2(r6.changes),
      outputPanel: coerceNumber2(r6.outputPanel),
      problemsPanel: coerceNumber2(r6.problemsPanel),
      pullRequest: coerceNumber2(r6.pullRequest),
      byKind: r6.byKind ?? {},
      copilotInstructions: coerceNumber2(r6.copilotInstructions),
      agentsMd: coerceNumber2(r6.agentsMd),
      byPath: r6.byPath ?? {}
    };
  }
  function sanitizePeriod(period) {
    const p3 = period && typeof period === "object" ? period : {};
    const toolCalls = p3.toolCalls && typeof p3.toolCalls === "object" ? p3.toolCalls : {};
    const mcpTools = p3.mcpTools && typeof p3.mcpTools === "object" ? p3.mcpTools : {};
    return {
      sessions: coerceNumber2(p3.sessions),
      modeUsage: sanitizeModeUsage(p3.modeUsage),
      contextReferences: sanitizeContextRefs(p3.contextReferences),
      toolCalls: {
        total: coerceNumber2(toolCalls.total),
        byTool: toolCalls.byTool ?? {}
      },
      mcpTools: {
        total: coerceNumber2(mcpTools.total),
        byServer: mcpTools.byServer ?? {},
        byTool: mcpTools.byTool ?? {}
      },
      modelSwitching: {
        modelsPerSession: [],
        totalSessions: 0,
        averageModelsPerSession: 0,
        maxModelsPerSession: 0,
        minModelsPerSession: 0,
        switchingFrequency: 0,
        standardModels: [],
        premiumModels: [],
        unknownModels: [],
        mixedTierSessions: 0,
        lowCostModels: [],
        mediumCostModels: [],
        highCostModels: [],
        mixedCostSessions: 0,
        standardRequests: 0,
        premiumRequests: 0,
        lowCostRequests: 0,
        mediumCostRequests: 0,
        highCostRequests: 0,
        unknownRequests: 0,
        totalRequests: 0,
        ...p3.modelSwitching ?? {}
      },
      thinkingEffortUsage: p3.thinkingEffortUsage,
      modelEfficiency: p3.modelEfficiency
    };
  }
  function sanitizeInsights(rawInsights) {
    return rawInsights.filter((i6) => i6 && typeof i6 === "object" && typeof i6.id === "string").map((i6) => ({
      id: String(i6.id),
      category: typeof i6.category === "string" ? i6.category : "general",
      severity: ["tip", "opportunity", "celebration"].includes(i6.severity) ? i6.severity : "tip",
      title: typeof i6.title === "string" ? i6.title : "",
      body: typeof i6.body === "string" ? i6.body : "",
      actionLabel: typeof i6.actionLabel === "string" ? i6.actionLabel : void 0,
      actionCommand: typeof i6.actionCommand === "string" ? i6.actionCommand : void 0,
      status: ["new", "seen", "dismissed", "snoozed", "done"].includes(i6.status) ? i6.status : "new",
      allowToast: !!i6.allowToast
    }));
  }
  function _sanitizeCurationAnalysis(rawCa) {
    if (!rawCa || typeof rawCa !== "object") {
      return null;
    }
    const ca = rawCa;
    return {
      windowDays: typeof ca.windowDays === "number" ? ca.windowDays : 30,
      availableTools: Array.isArray(ca.availableTools) ? ca.availableTools : [],
      usedTools: Array.isArray(ca.usedTools) ? ca.usedTools : [],
      unusedTools: Array.isArray(ca.unusedTools) ? ca.unusedTools : [],
      underusedMcpServers: Array.isArray(ca.underusedMcpServers) ? ca.underusedMcpServers : [],
      underusedAgentPlugins: Array.isArray(ca.underusedAgentPlugins) ? ca.underusedAgentPlugins : [],
      estimatedPromptBloat: ca.estimatedPromptBloat && typeof ca.estimatedPromptBloat === "object" ? ca.estimatedPromptBloat : { totalTokens: 0, byServer: {} },
      recommendations: Array.isArray(ca.recommendations) ? ca.recommendations : []
    };
  }
  function sanitizeStats(raw) {
    if (!raw || typeof raw !== "object") {
      traceCurationOnce("sanitize-invalid-root", "sanitizeStats.invalidRoot");
      return null;
    }
    try {
      const sanitized = {
        today: sanitizePeriod(raw.today),
        last30Days: sanitizePeriod(raw.last30Days),
        month: sanitizePeriod(raw.month),
        lastMonth: sanitizePeriod(raw.lastMonth),
        lastUpdated: typeof raw.lastUpdated === "string" ? raw.lastUpdated : "",
        backendConfigured: !!raw.backendConfigured,
        locale: typeof raw.locale === "string" ? raw.locale : void 0,
        currentWorkspacePaths: Array.isArray(raw.currentWorkspacePaths) ? raw.currentWorkspacePaths.filter((p3) => typeof p3 === "string") : void 0,
        suppressedUnknownTools: Array.isArray(raw.suppressedUnknownTools) ? raw.suppressedUnknownTools.filter((t4) => typeof t4 === "string") : void 0
      };
      const safeMatrix = sanitizeCustomizationMatrix(raw.customizationMatrix);
      if (safeMatrix) {
        sanitized.customizationMatrix = safeMatrix;
      }
      if (Array.isArray(raw.missedPotential)) {
        sanitized.missedPotential = raw.missedPotential.filter(
          (w2) => w2 && typeof w2 === "object" && typeof w2.workspacePath === "string"
        );
      }
      if (Array.isArray(raw.todaySessions)) {
        sanitized.todaySessions = raw.todaySessions.filter(
          (s4) => s4 && typeof s4 === "object" && typeof s4.interactions === "number"
        );
      }
      if (Array.isArray(raw.insights)) {
        sanitized.insights = sanitizeInsights(raw.insights);
      }
      const curationAnalysis = _sanitizeCurationAnalysis(raw.curationAnalysis);
      if (curationAnalysis) {
        sanitized.curationAnalysis = curationAnalysis;
        traceCuration("sanitizeStats.curation.present", {
          availableTools: curationAnalysis.availableTools.length,
          unusedTools: curationAnalysis.unusedTools.length,
          unusedServers: curationAnalysis.underusedMcpServers.filter((s4) => s4 && s4.usedToolCount === 0).length
        });
      } else {
        traceCurationOnce("sanitize-no-curation", "sanitizeStats.curation.missing");
      }
      applyBillingFields(sanitized, raw);
      return sanitized;
    } catch (error) {
      traceCurationOnce("sanitize-error", "sanitizeStats.error", {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
  function updateWorktreeControls() {
    const controlsEl = document.getElementById("worktree-controls");
    if (controlsEl) {
      setHtml(controlsEl, renderWorktreeControls());
    }
  }
  function updateWorktreeResults() {
    const resultsEl = document.getElementById("worktree-results");
    if (resultsEl) {
      setHtml(resultsEl, renderWorktreeResults());
    }
  }
  function updateWorktreeProgressArea() {
    const el2 = document.getElementById("worktree-progress-area");
    if (el2) {
      setHtml(el2, renderWorktreeProgress());
    }
  }
  function scheduleWorktreeResultsRender() {
    if (worktreeRenderPending) {
      return;
    }
    worktreeRenderPending = true;
    requestAnimationFrame(() => {
      worktreeRenderPending = false;
      updateWorktreeResults();
    });
  }
  function addWorktreeRootFromInput() {
    const input = document.getElementById("worktree-root-input");
    const value = input?.value.trim();
    if (!value) {
      return;
    }
    if (!worktreeRoots.some((r6) => r6.toLowerCase() === value.toLowerCase())) {
      worktreeRoots.push(value);
    }
    if (input) {
      input.value = "";
    }
    updateWorktreeControls();
  }
  function startWorktreeScan() {
    if (worktreeRoots.length === 0 || worktreeScanInProgress || worktreeCleanupInProgress) {
      return;
    }
    worktreeScanInProgress = true;
    worktreeResults = [];
    worktreeScanError = null;
    worktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
    worktreeCleanupLog = [];
    updateWorktreeControls();
    updateWorktreeResults();
    vscode.postMessage({ command: "scanWorktrees", rootPaths: worktreeRoots });
  }
  function startWorktreeCleanup() {
    if (worktreeCleanupInProgress || worktreeCleanupConfirmPending || worktreeScanInProgress) {
      return;
    }
    const targets = getCleanupCandidates();
    if (targets.length === 0) {
      return;
    }
    worktreeCleanupConfirmPending = true;
    updateWorktreeResults();
    vscode.postMessage({
      command: "cleanupPushedWorktrees",
      worktrees: targets.map((w2) => ({ path: w2.path, branch: w2.branch, repoLabel: w2.repoLabel }))
    });
  }
  function _handleWorktreeActionButtonClick(target) {
    if (target.id === "btn-browse-worktree-root") {
      vscode.postMessage({ command: "pickWorktreeRoot" });
      return true;
    }
    if (target.id === "btn-add-worktree-root") {
      addWorktreeRootFromInput();
      return true;
    }
    if (target.id === "btn-scan-worktrees") {
      startWorktreeScan();
      return true;
    }
    if (target.id === "btn-cancel-worktree-scan") {
      vscode.postMessage({ command: "cancelWorktreeScan" });
      return true;
    }
    if (target.id === "btn-cleanup-pushed-worktrees") {
      startWorktreeCleanup();
      return true;
    }
    if (target.id === "btn-cancel-cleanup") {
      vscode.postMessage({ command: "cancelCleanupPushedWorktrees" });
      return true;
    }
    return false;
  }
  function _handleWorktreeRootsListClick(target) {
    if (target.closest("#btn-toggle-worktree-roots")) {
      worktreeRootsExpanded = !worktreeRootsExpanded;
      updateWorktreeControls();
      return true;
    }
    if (target.classList.contains("worktree-remove-root")) {
      const idx = Number(target.getAttribute("data-index"));
      if (!isNaN(idx)) {
        worktreeRoots.splice(idx, 1);
        updateWorktreeControls();
      }
      return true;
    }
    return false;
  }
  function _handleWorktreeRowLinkClick(event, target) {
    const revealLink = target.closest(".worktree-reveal-link");
    if (revealLink) {
      event.preventDefault();
      const p3 = decodeURIComponent(revealLink.getAttribute("data-path") || "");
      if (p3) {
        vscode.postMessage({ command: "revealPath", path: p3 });
      }
      return true;
    }
    const deleteLink = target.closest(".worktree-delete-link");
    if (deleteLink) {
      event.preventDefault();
      const p3 = decodeURIComponent(deleteLink.getAttribute("data-path") || "");
      const branch = decodeURIComponent(deleteLink.getAttribute("data-branch") || "");
      const repoLabel = decodeURIComponent(deleteLink.getAttribute("data-repo") || "");
      const pushed = deleteLink.getAttribute("data-pushed") || "?";
      if (p3) {
        vscode.postMessage({ command: "deleteWorktree", path: p3, branch, repoLabel, pushed });
      }
      return true;
    }
    return false;
  }
  function _handleWorktreeSortHeaderClick(target) {
    const sortHeader = target.closest("[data-wt-sort]");
    if (!sortHeader) {
      return false;
    }
    const col = sortHeader.getAttribute("data-wt-sort");
    if (!col) {
      return true;
    }
    if (worktreeSortColumn === col) {
      worktreeSortDir = worktreeSortDir === "desc" ? "asc" : "desc";
    } else {
      worktreeSortColumn = col;
      worktreeSortDir = col === "repo" ? "asc" : "desc";
    }
    updateWorktreeResults();
    return true;
  }
  function _handleWorktreeRepoRowClick(target) {
    const repoRow = target.closest(".worktree-repo-row");
    if (!repoRow) {
      return false;
    }
    const repo = repoRow.getAttribute("data-repo") ?? "";
    if (worktreeExpandedRepos.has(repo)) {
      worktreeExpandedRepos.delete(repo);
    } else {
      worktreeExpandedRepos.add(repo);
    }
    updateWorktreeResults();
    return true;
  }
  function _handleWorktreeTableInteractionClick(target) {
    if (_handleWorktreeSortHeaderClick(target)) {
      return true;
    }
    return _handleWorktreeRepoRowClick(target);
  }
  function handleWorktreeTabClick(event) {
    const target = event.target;
    if (!target) {
      return;
    }
    if (_handleWorktreeActionButtonClick(target)) {
      return;
    }
    if (_handleWorktreeRootsListClick(target)) {
      return;
    }
    if (_handleWorktreeRowLinkClick(event, target)) {
      return;
    }
    _handleWorktreeTableInteractionClick(target);
  }
  function setupWorktreesHandlers() {
    const tabEl = document.getElementById("tab-panel-worktrees");
    if (!tabEl) {
      return;
    }
    tabEl.addEventListener("click", handleWorktreeTabClick);
    tabEl.addEventListener("keydown", (event) => {
      const target = event.target;
      if (target?.id === "worktree-root-input" && event.key === "Enter") {
        event.preventDefault();
        addWorktreeRootFromInput();
      }
    });
  }
  function sanitizeWorktreeResult(item) {
    const w2 = item ?? {};
    const pushedRaw = String(w2.pushed ?? "?");
    const pushed = pushedRaw === "yes" || pushedRaw === "no" ? pushedRaw : "?";
    return {
      path: String(w2.path ?? ""),
      repoLabel: String(w2.repoLabel ?? "Unknown"),
      branch: String(w2.branch ?? "?"),
      lastCommit: String(w2.lastCommit ?? "?"),
      lastCommitDate: w2.lastCommitDate ? String(w2.lastCommitDate) : null,
      pushed,
      files: numField(w2.files),
      folders: numField(w2.folders),
      bytes: numField(w2.bytes)
    };
  }
  function handleWorktreeRootPicked(message) {
    if (!message.folderPath) {
      return;
    }
    const folderPath = String(message.folderPath);
    if (!worktreeRoots.some((r6) => r6.toLowerCase() === folderPath.toLowerCase())) {
      worktreeRoots.push(folderPath);
    }
    updateWorktreeControls();
  }
  function handleWorktreeRootsDiscovered(message) {
    if (worktreeScanInProgress || !Array.isArray(message.roots)) {
      return;
    }
    let added = false;
    for (const raw of message.roots) {
      if (typeof raw !== "string") {
        continue;
      }
      const root = raw.trim();
      if (!root) {
        continue;
      }
      if (!worktreeRoots.some((r6) => r6.toLowerCase() === root.toLowerCase())) {
        worktreeRoots.push(root);
        added = true;
      }
    }
    if (added) {
      updateWorktreeControls();
    }
  }
  function handleWorktreeScanStarted() {
    worktreeScanInProgress = true;
    worktreeResults = [];
    worktreeScanError = null;
    worktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
    updateWorktreeControls();
    updateWorktreeResults();
  }
  function handleWorktreeScanRootStarted(message) {
    worktreeScanStatus = { ...worktreeScanStatus, root: String(message.root || ""), checked: 0, total: 0, phase: "walking", dirsScanned: 0 };
    updateWorktreeProgressArea();
  }
  function handleWorktreeScanWalkProgress(message) {
    worktreeScanStatus = {
      ...worktreeScanStatus,
      root: String(message.root ?? worktreeScanStatus.root),
      phase: "walking",
      dirsScanned: numField(message.dirsScanned),
      elapsedMs: numField(message.elapsedMs)
    };
    updateWorktreeProgressArea();
  }
  function handleWorktreeScanRootMarkersFound(message) {
    worktreeScanStatus = { ...worktreeScanStatus, total: numField(message.count), phase: "checking" };
    updateWorktreeProgressArea();
  }
  function handleWorktreeScanRootSkipped(message) {
    worktreeScanError = `Skipped "${message.root}": ${message.reason || "not accessible"}`;
    updateWorktreeControls();
  }
  function handleWorktreeScanProgress(message) {
    worktreeScanStatus = {
      root: String(message.root ?? worktreeScanStatus.root),
      checked: numField(message.checked),
      total: message.total !== void 0 ? numField(message.total) : worktreeScanStatus.total,
      foundCount: numField(message.foundCount),
      elapsedMs: numField(message.elapsedMs)
    };
    updateWorktreeProgressArea();
  }
  function handleWorktreeFound(message) {
    if (!message.worktree) {
      return;
    }
    worktreeResults.push(sanitizeWorktreeResult(message.worktree));
    scheduleWorktreeResultsRender();
  }
  function handleWorktreeDeleted(message) {
    const targetPath = String(message.path ?? "");
    if (!targetPath) {
      return;
    }
    const idx = worktreeResults.findIndex((w2) => w2.path === targetPath);
    if (idx === -1) {
      return;
    }
    worktreeResults.splice(idx, 1);
    updateWorktreeResults();
  }
  function handleCleanupDeclined() {
    worktreeCleanupConfirmPending = false;
    updateWorktreeResults();
  }
  function handleCleanupStarted(message) {
    worktreeCleanupConfirmPending = false;
    worktreeCleanupInProgress = true;
    worktreeCleanupStatus = { processed: 0, total: numField(message.total) };
    worktreeCleanupLog = [];
    updateWorktreeResults();
  }
  function handleCleanupWorktreeResult(message) {
    worktreeCleanupStatus = { processed: numField(message.processed), total: numField(message.total) };
    const rawStatus = message.status;
    const status = rawStatus === "deleted" || rawStatus === "skipped" ? rawStatus : "error";
    worktreeCleanupLog.push({
      path: String(message.path ?? ""),
      branch: String(message.branch ?? "?"),
      repoLabel: String(message.repoLabel ?? ""),
      status,
      reason: typeof message.reason === "string" ? message.reason : void 0
    });
    updateWorktreeResults();
  }
  function handleCleanupComplete() {
    worktreeCleanupInProgress = false;
    updateWorktreeResults();
  }
  function handleCleanupCancelled() {
    worktreeCleanupInProgress = false;
    worktreeCleanupConfirmPending = false;
    updateWorktreeResults();
  }
  function handleWorktreeEnrichStarted(message) {
    worktreeScanStatus = { ...worktreeScanStatus, phase: "enriching", enriched: 0, enrichTotal: numField(message.total), elapsedMs: numField(message.elapsedMs) };
    updateWorktreeProgressArea();
  }
  function handleWorktreeEnrichProgress(message) {
    worktreeScanStatus = { ...worktreeScanStatus, phase: "enriching", enriched: numField(message.enriched), enrichTotal: numField(message.total), elapsedMs: numField(message.elapsedMs) };
    updateWorktreeProgressArea();
  }
  function handleWorktreeEnriched(message) {
    const targetPath = String(message.path ?? "");
    if (!targetPath) {
      return;
    }
    const wt = worktreeResults.find((w2) => w2.path === targetPath);
    if (!wt) {
      return;
    }
    wt.files = numField(message.files);
    wt.folders = numField(message.folders);
    wt.bytes = numField(message.bytes);
    const pushedRaw = String(message.pushed ?? "?");
    wt.pushed = pushedRaw === "yes" || pushedRaw === "no" ? pushedRaw : "?";
    scheduleWorktreeResultsRender();
  }
  function handleWorktreeScanComplete() {
    worktreeScanInProgress = false;
    updateWorktreeControls();
    updateWorktreeResults();
  }
  function handleWorktreeScanCancelled() {
    worktreeScanInProgress = false;
    updateWorktreeControls();
  }
  var _worktreeMessageHandlers = {
    worktreeRootPicked: handleWorktreeRootPicked,
    worktreeRootsDiscovered: handleWorktreeRootsDiscovered,
    worktreeScanStarted: () => handleWorktreeScanStarted(),
    worktreeScanRootStarted: handleWorktreeScanRootStarted,
    worktreeScanWalkProgress: handleWorktreeScanWalkProgress,
    worktreeScanRootMarkersFound: handleWorktreeScanRootMarkersFound,
    worktreeScanRootSkipped: handleWorktreeScanRootSkipped,
    worktreeScanProgress: handleWorktreeScanProgress,
    worktreeFound: handleWorktreeFound,
    worktreeEnrichStarted: handleWorktreeEnrichStarted,
    worktreeEnrichProgress: handleWorktreeEnrichProgress,
    worktreeEnriched: handleWorktreeEnriched,
    worktreeDeleted: handleWorktreeDeleted,
    worktreeScanComplete: () => handleWorktreeScanComplete(),
    worktreeScanCancelled: () => handleWorktreeScanCancelled(),
    cleanupDeclined: () => handleCleanupDeclined(),
    cleanupStarted: handleCleanupStarted,
    cleanupWorktreeResult: handleCleanupWorktreeResult,
    cleanupComplete: () => handleCleanupComplete(),
    cleanupCancelled: () => handleCleanupCancelled()
  };
  function handleWorktreeMessage(message) {
    const handler = _worktreeMessageHandlers[message.command];
    if (handler) {
      handler(message);
    }
  }
  function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.getAttribute("data-tab");
        if (!tab) {
          return;
        }
        activeTab = tab;
        tabButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-tab") === tab));
        document.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.style.display = "none";
        });
        const activePanel = document.getElementById(`tab-panel-${tab}`);
        if (activePanel) {
          activePanel.style.display = "block";
        }
        if (tab === "repos" && !repoPrStatsLoaded) {
          repoPrStatsLoaded = true;
          vscode.postMessage({ command: "loadRepoPrStats" });
        }
        if (tab === "agent" && !agentSessionsLoaded) {
          agentSessionsLoaded = true;
          vscode.postMessage({ command: "loadAgentSessions" });
        }
        if (tab === "insights") {
          currentInsights.filter((i6) => i6.status === "new").forEach((i6) => vscode.postMessage({ command: "insightAction", id: i6.id, action: "seen" }));
        }
      });
    });
  }
  function sanitizeRepoPrStatsData(input) {
    const src = input && typeof input === "object" ? input : {};
    const repos = Array.isArray(src.repos) ? src.repos : [];
    return {
      authenticated: Boolean(src.authenticated),
      since: typeof src.since === "string" || typeof src.since === "number" ? src.since : Date.now(),
      repos: repos.map((repo) => {
        const r6 = repo && typeof repo === "object" ? repo : {};
        const aiDetails = Array.isArray(r6.aiDetails) ? r6.aiDetails : [];
        return {
          repoUrl: toSafeHttpUrl(r6.repoUrl),
          owner: escapeHtml(typeof r6.owner === "string" ? r6.owner : ""),
          repo: escapeHtml(typeof r6.repo === "string" ? r6.repo : ""),
          error: typeof r6.error === "string" ? escapeHtml(r6.error) : "",
          totalPrs: toSafeNumber(r6.totalPrs),
          aiAuthoredPrs: toSafeNumber(r6.aiAuthoredPrs),
          aiReviewRequestedPrs: toSafeNumber(r6.aiReviewRequestedPrs),
          aiDetails: aiDetails.map((d3) => {
            const detail = d3 && typeof d3 === "object" ? d3 : {};
            const validAiTypes = ["copilot", "claude", "openai", "other-ai"];
            const validRoles = ["author", "reviewer-requested"];
            const aiType = validAiTypes.includes(detail.aiType) ? detail.aiType : "other-ai";
            const role = validRoles.includes(detail.role) ? detail.role : "author";
            return {
              number: toSafeNumber(detail.number),
              title: escapeHtml(typeof detail.title === "string" ? detail.title : ""),
              url: toSafeHttpUrl(detail.url),
              aiType,
              role
            };
          })
        };
      })
    };
  }
  function renderReposPrContent(data) {
    const sinceDate = escapeHtml(new Date(data.since).toLocaleDateString());
    if (!data.authenticated) {
      return `
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;
    }
    if (data.repos.length === 0) {
      return `
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;
    }
    const aiLabel = {
      copilot: "\u{1F916} Copilot",
      claude: "\u{1F9E0} Claude",
      openai: "\u2728 Codex",
      "other-ai": "\u{1F916} AI"
    };
    const cell = "padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);";
    const cellCenter = `${cell} text-align: center;`;
    const rows = data.repos.map((r6) => {
      const repoLink = `<a href="${escapeHtml(r6.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${escapeHtml(r6.owner)}/${escapeHtml(r6.repo)}</a>`;
      if (r6.error) {
        return `<tr>
				<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}</td>
				<td colspan="3" style="${cell} color:var(--text-secondary); font-style:italic; font-size:12px;">${escapeHtml(r6.error)}</td>
			</tr>`;
      }
      let detailsHtml = "";
      if (r6.aiDetails.length > 0) {
        const items = r6.aiDetails.map(
          (d3) => `<li><a href="${escapeHtml(d3.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${d3.number} ${escapeHtml(d3.title)}</a> \u2014 ${aiLabel[d3.aiType] ?? escapeHtml(String(d3.aiType))} (${d3.role === "author" ? "authored" : "review requested"})</li>`
        ).join("");
        detailsHtml = `
				<details style="margin-top:4px; font-size:11px;">
					<summary style="cursor:pointer; color:var(--text-secondary);">Show ${r6.aiDetails.length} detail(s)</summary>
					<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${items}</ul>
				</details>`;
      }
      return `<tr>
			<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}${detailsHtml}</td>
			<td style="${cellCenter} font-weight:600;">${r6.totalPrs}</td>
			<td style="${cellCenter}">${r6.aiAuthoredPrs > 0 ? `<span style="font-weight:600;">${r6.aiAuthoredPrs}</span>` : "0"}</td>
			<td style="${cellCenter}">${r6.aiReviewRequestedPrs > 0 ? `<span style="font-weight:600;">${r6.aiReviewRequestedPrs}</span>` : "0"}</td>
		</tr>`;
    }).join("");
    return `
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing PRs created since ${sinceDate}.
			Reviewer requests are only visible for <strong>open</strong> PRs \u2014 the GitHub API clears this field after a PR is merged or closed.
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">\u{1F4C2} Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">PRs</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs where the PR author's GitHub login matches a known AI agent (e.g. copilot-swe-agent, claude-code-action, openai-code-agent)">\u{1F916} Cloud Agent Authored</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Open PRs where an AI agent was listed as a requested reviewer">\u{1F441} Copilot Review Agent requested\u2020</th>
					</tr>
				</thead>
				<tbody>
					${rows}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2020 Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			\u{1F916} Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`;
  }
  function updateReposPrPanel(data) {
    const container = document.querySelector("#repos-pr-content");
    if (!container) {
      return;
    }
    setHtml(container, `
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${renderReposPrContent(data)}
	`);
  }
  function buildAgentSessionRows(data, cell, cellCenter) {
    return data.repos.map((r6) => {
      const repoLink = `<a href="${r6.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${r6.owner}/${r6.repo}</a>`;
      if (r6.error) {
        return `<tr>
        <td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}</td>
        <td colspan="3" style="${cell} color:var(--text-secondary); font-style:italic; font-size:12px;">${r6.error}</td>
      </tr>`;
      }
      const partialNote = r6.partial ? ` <span title="Showing ${r6.tasksScanned} of ${r6.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${r6.tasksScanned}/${r6.tasksTotal} tasks scanned)</span>` : "";
      return `<tr>
      <td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}${partialNote}</td>
      <td style="${cellCenter} font-weight:600;">${r6.totalTasks}</td>
      <td style="${cellCenter} font-weight:600;">${r6.totalSessions}</td>
      <td style="${cellCenter}">${r6.totalCredits > 0 ? r6.totalCredits.toFixed(1) : "\u2014"}</td>
    </tr>`;
    }).join("");
  }
  function renderAgentSessionsContent(data) {
    if (!data.authenticated) {
      return `
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;
    }
    if (data.repos.length === 0) {
      return `
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;
    }
    const sinceDate = new Date(data.since).toLocaleDateString();
    const cell = "padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);";
    const cellCenter = `${cell} text-align: center;`;
    const summaryTotals = data.repos.reduce((acc, r6) => {
      if (!r6.error) {
        acc.tasks += r6.totalTasks;
        acc.sessions += r6.totalSessions;
        acc.credits += r6.totalCredits;
      }
      return acc;
    }, { tasks: 0, sessions: 0, credits: 0 });
    const hasPartial = data.repos.some((r6) => r6.partial && !r6.error);
    const rows = buildAgentSessionRows(data, cell, cellCenter);
    return `
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.credits > 0 ? summaryTotals.credits.toFixed(1) : "\u2014"}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${sinceDate} to now.
			${hasPartial ? "<strong>Note:</strong> Some repos were capped at 50 tasks \u2014 totals may be lower bounds. " : ""}
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">\u{1F4C2} Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Number of Copilot cloud agent tasks (each task = one user prompt to the agent)">Tasks</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Number of agent sessions (each session = one autonomous coding run)">Sessions</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="AI credits consumed (1 credit = $0.01). Only available when the API reports usage data.">AI Credits</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2139\uFE0F <strong>No double-counting:</strong> These are cloud agent sessions only. CLI/remote sessions and local IDE chat sessions (shown in "My Activity") are excluded.<br/>
			\u2139\uFE0F <strong>Action minutes</strong> (GitHub Actions compute used by the agent) are not shown here \u2014 they require additional per-branch API calls.
		</div>`;
  }
  function updateAgentSessionsPanel(data) {
    const container = document.querySelector("#agent-sessions-content");
    if (!container) {
      return;
    }
    setHtml(container, `
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${renderAgentSessionsContent(data)}
	`);
  }
  function buildCustomizationSectionHtml(matrix) {
    if (!matrix || !matrix.workspaces || matrix.workspaces.length === 0) {
      return `
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;
    }
    const workspaceRows = matrix.workspaces.map((ws) => {
      const statuses = ws.typeStatuses ?? {};
      const hasNoCustomization = Object.values(statuses).every((s4) => s4 === "\u274C");
      const typeCells = (matrix.customizationTypes ?? []).map((type) => {
        const status = statuses[type.id] || "\u2753";
        const statusLabel = status === "\u2705" ? "Present and fresh" : status === "\u26A0\uFE0F" ? "Present but stale" : status === "\u274C" ? "Missing" : "Status unknown";
        return `
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${statusBadgeHtml(status, statusLabel)}
				</td>`;
      }).join("");
      return `
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${escapeHtml(ws.workspaceName)}${hasNoCustomization ? ` <span style="font-family: sans-serif; vertical-align: middle;">${statusBadgeHtml("\u26A0\uFE0F", "No customization files")}</span>` : ""}
				</td>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center; color: var(--link-color); font-weight: 600;">
					${ws.sessionCount}
				</td>
				${typeCells}
			</tr>`;
    }).join("");
    return `
		<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				\u{1F6E0}\uFE0F Copilot Customization Files
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				Showing ${matrix.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${matrix.workspacesWithIssues > 0 ? `<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml("\u26A0\uFE0F")} ${matrix.workspacesWithIssues} workspace(s) have no customization files.</span>` : `<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml("\u2705")} All workspaces have up-to-date customizations.</span>`}
			</div>
			<div class="customization-matrix-container">
				<table class="customization-matrix">
					<thead>
						<tr>
							<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">\u{1F4C2} Workspace</th>
							<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Sessions</th>
							${(matrix.customizationTypes ?? []).map((type) => `
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${escapeHtml(type.label)}">
									${escapeHtml(type.icon)}
								</th>
							`).join("")}
						</tr>
					</thead>
					<tbody>
						${workspaceRows}
					</tbody>
				</table>
			</div>
			<div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
				<div style="display: flex; gap: 16px; flex-wrap: wrap;">
					${(matrix.customizationTypes ?? []).map((type) => `
						<span>${escapeHtml(type.icon)} ${escapeHtml(type.label)}</span>
					`).join("")}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml("\u2705")} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml("\u26A0\uFE0F")} = Present but Stale</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml("\u274C")} = Missing</span>
				</div>
			</div>
		</div>`;
  }
  function buildModelCostSectionHtml(stats) {
    const p30 = stats.last30Days.modelSwitching;
    const today = stats.today.modelSwitching;
    if ((p30.totalRequests ?? 0) === 0 && (today.totalRequests ?? 0) === 0) {
      return "";
    }
    function renderCostPeriod(ms) {
      const total = ms.totalRequests ?? 0;
      if (total === 0) {
        return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>';
      }
      const buckets = [
        { label: "\u{1F49A} Low cost", count: ms.lowCostRequests ?? 0, color: "#4ade80" },
        { label: "\u{1F535} Medium cost", count: ms.mediumCostRequests ?? 0, color: "var(--link-color)" },
        { label: "\u{1F4B8} High cost", count: ms.highCostRequests ?? 0, color: "var(--warning-fg)" },
        { label: "\u2753 Unknown", count: ms.unknownRequests ?? 0, color: "var(--text-muted)" }
      ].filter((b3) => b3.count > 0);
      const rows = buckets.map((b3) => {
        const pct = total > 0 ? Math.round(b3.count / total * 100) : 0;
        return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${b3.color};">${b3.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${pct}%; background: ${b3.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${formatNumber(b3.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${pct}%)</span></span>
			</div>`;
      }).join("");
      const mixedNote = (ms.mixedCostSessions ?? 0) > 0 ? `<div style="font-size: 11px; color: var(--link-color); margin-top: 6px;">\u{1F500} ${formatNumber(ms.mixedCostSessions)} mixed-cost session${ms.mixedCostSessions !== 1 ? "s" : ""}</div>` : "";
      return `${rows}<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${formatNumber(total)} total requests</div>${mixedNote}`;
    }
    return `
		<!-- Model Cost Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4B0}</span><span>Model Cost Usage</span></div>
			<div class="section-subtitle">Request distribution across cost levels \u2014 low (&lt;$2/M tokens), medium ($2\u20135/M), high (\u2265$5/M)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${renderCostPeriod(today)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${renderCostPeriod(p30)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${renderCostPeriod(stats.month.modelSwitching)}
				</div>
			</div>
		</div>`;
  }
  function buildThinkingEffortSectionHtml(stats) {
    const effortData = stats.last30Days.thinkingEffortUsage || stats.today.thinkingEffortUsage || stats.month.thinkingEffortUsage;
    if (!effortData) {
      return "";
    }
    return `
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${renderEffortPeriodHtml(stats.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${renderEffortPeriodHtml(stats.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${renderEffortPeriodHtml(stats.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`;
  }
  function renderEffortPeriodHtml(teu) {
    const EFFORT_ORDER = ["minimal", "low", "medium", "high", "max", "xhigh"];
    if (!teu || teu.sessionCount === 0) {
      return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>';
    }
    const total = Object.values(teu.byEffort).reduce((s4, v2) => s4 + v2, 0);
    const sorted = EFFORT_ORDER.filter((k2) => teu.byEffort[k2] > 0).concat(Object.keys(teu.byEffort).filter((k2) => !EFFORT_ORDER.includes(k2) && teu.byEffort[k2] > 0));
    return `
		${sorted.map((level) => {
      const count = teu.byEffort[level] || 0;
      const pct = total > 0 ? Math.round(count / total * 100) : 0;
      return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${escapeHtml(getEffortDisplayName(level))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${pct}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${count} <span style="color: var(--text-secondary); font-weight: 400;">(${pct}%)</span></span>
			</div>`;
    }).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${teu.sessionCount} session${teu.sessionCount !== 1 ? "s" : ""} \xB7 ${teu.switchCount} effort switch${teu.switchCount !== 1 ? "es" : ""}</div>
	`;
  }
  function buildUsageAllKeysSets(stats) {
    return {
      allToolKeys: [.../* @__PURE__ */ new Set([...Object.keys(stats.today.toolCalls.byTool), ...Object.keys(stats.last30Days.toolCalls.byTool), ...Object.keys(stats.month.toolCalls.byTool)])].sort(),
      allMcpToolKeys: [.../* @__PURE__ */ new Set([...Object.keys(stats.today.mcpTools.byTool), ...Object.keys(stats.last30Days.mcpTools.byTool), ...Object.keys(stats.month.mcpTools.byTool)])].sort(),
      allMcpServerKeys: [.../* @__PURE__ */ new Set([...Object.keys(stats.today.mcpTools.byServer), ...Object.keys(stats.last30Days.mcpTools.byServer), ...Object.keys(stats.month.mcpTools.byServer)])].sort(),
      allStandardModels: [.../* @__PURE__ */ new Set([...stats.today.modelSwitching.standardModels, ...stats.last30Days.modelSwitching.standardModels, ...stats.month.modelSwitching.standardModels])].sort(),
      allHighCostModels: [.../* @__PURE__ */ new Set([...stats.today.modelSwitching.highCostModels, ...stats.last30Days.modelSwitching.highCostModels, ...stats.month.modelSwitching.highCostModels])].sort(),
      allLowCostModels: [.../* @__PURE__ */ new Set([...stats.today.modelSwitching.lowCostModels, ...stats.last30Days.modelSwitching.lowCostModels, ...stats.month.modelSwitching.lowCostModels])].sort(),
      allMediumCostModels: [.../* @__PURE__ */ new Set([...stats.today.modelSwitching.mediumCostModels, ...stats.last30Days.modelSwitching.mediumCostModels, ...stats.month.modelSwitching.mediumCostModels])].sort(),
      allUnknownModels: [.../* @__PURE__ */ new Set([...stats.today.modelSwitching.unknownModels, ...stats.last30Days.modelSwitching.unknownModels, ...stats.month.modelSwitching.unknownModels])].sort()
    };
  }
  function buildHealthTabPanelHtml(customizationHtml, stats) {
    return `
		<div id="tab-panel-health" class="tab-panel"${activeTab !== "health" ? ' style="display:none"' : ""}>
			${customizationHtml}
			${renderMissedPotential(stats)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					\u{1F3D7}\uFE0F Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${hygieneMatrixState && hygieneMatrixState.workspaces && hygieneMatrixState.workspaces.length > 0 ? `
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;">Analyze All Repositories (${hygieneMatrixState.workspaces.length})</vscode-button>
					</div>
					<div id="repo-list-pane-container" class="repo-hygiene-pane">
						<div class="repo-hygiene-pane-header">\u{1F4C1} Repository List</div>
						<div id="repo-list-pane" class="repo-hygiene-pane-body"></div>
					</div>
					<div id="repo-details-pane-container" class="repo-hygiene-pane repo-hygiene-pane-collapsed">
						<div class="repo-hygiene-pane-header">\u{1F4CA} Repository Details</div>
						<div id="repo-details-pane" class="repo-hygiene-pane-body"></div>
					</div>
				` : `
					<vscode-button id="btn-analyse-repo">Analyze Repo for Best Practices</vscode-button>
					<div id="repo-analysis-results" class="repo-hygiene-results" style="margin-top: 12px;"></div>
				`}
			</div>
		</div>`;
  }
  function buildMcpToolsSectionHtml(stats, allMcpToolKeys, allMcpServerKeys) {
    return `
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${buildUnknownMcpToolsBannerHtml(stats)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.today.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.today.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.last30Days.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.last30Days.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.month.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.month.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.today.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ""}
				</div>
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.last30Days.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ""}
				</div>
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.month.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ""}
				</div>
			</div>
		</div>`;
  }
  function buildCurationSummaryHtml(availableTools, unusedTools, bloat) {
    const usedCount = availableTools.length - unusedTools.length;
    const severityColor = unusedTools.length > 0 ? "rgba(251,191,36,0.12)" : "rgba(74,222,128,0.12)";
    const severityBorder = unusedTools.length > 0 ? "rgba(251,191,36,0.4)" : "rgba(74,222,128,0.4)";
    const unusedColor = unusedTools.length > 0 ? "#fbbf24" : "#4ade80";
    const totalBloat = bloat.totalTokens;
    const skillBloat = bloat.byServer["skill"] ?? 0;
    const builtinBloat = bloat.byServer["builtin"] ?? 0;
    const mcpBloat = totalBloat - skillBloat - builtinBloat;
    const fmt = (n5) => n5 >= 1e3 ? `~${Math.round(n5 / 1e3)}K` : `~${n5}`;
    const actionableBloat = mcpBloat + skillBloat;
    const actionableParts = [];
    if (mcpBloat > 0) {
      actionableParts.push(`${fmt(mcpBloat)} MCP`);
    }
    if (skillBloat > 0) {
      actionableParts.push(`${fmt(skillBloat)} skills`);
    }
    return `<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${formatNumber(availableTools.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${formatNumber(usedCount)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${severityColor}; border:1px solid ${severityBorder}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:${unusedColor};">${formatNumber(unusedTools.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Unused</div>
		</div>
		${actionableBloat > 0 ? `<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center;" title="Overhead you can reduce by disabling unused MCP servers or removing unused skills">
			<div style="font-size:20px; font-weight:700; color:#f87171;">${fmt(actionableBloat)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Actionable overhead</div>
			${actionableParts.length > 0 ? `<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${escapeHtml(actionableParts.join(" + "))}</div>` : ""}
		</div>` : ""}
		${builtinBloat > 0 ? `<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center; opacity:0.7;" title="Overhead from VS Code built-in tools \u2014 cannot be disabled">
			<div style="font-size:20px; font-weight:700; color:var(--text-secondary);">${fmt(builtinBloat)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Built-in overhead</div>
			<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">not actionable</div>
		</div>` : ""}
	</div>`;
  }
  function _mcpSourceLabel(s4) {
    if (s4.extensionId) {
      return "Extension";
    }
    if (!s4.configFiles || s4.configFiles.length === 0) {
      return "Settings";
    }
    const labels = /* @__PURE__ */ new Set();
    for (const f3 of s4.configFiles) {
      const p3 = f3.replace(/\\/g, "/");
      if (p3.includes("/.vscode/")) {
        labels.add("Workspace");
      } else if (p3.includes("/.vs/")) {
        labels.add("Workspace (VS)");
      } else if (p3.includes("/.cursor/")) {
        labels.add("Workspace (Cursor)");
      } else if (p3.endsWith("/.mcp.json")) {
        labels.add(p3.split("/").slice(-2).join("/"));
      } else {
        labels.add("Config file");
      }
    }
    return [...labels].join(", ");
  }
  function _buildMcpSourceOpenBtn(s4, sourceTip) {
    if (s4.configFiles && s4.configFiles.length === 1) {
      return ` <button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(s4.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${escapeHtml(s4.configFiles[0])}">open</button>`;
    }
    if (s4.configFiles && s4.configFiles.length > 1) {
      return ` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${escapeHtml(JSON.stringify(s4.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${escapeHtml(sourceTip)}">open</button>`;
    }
    if (s4.extensionId) {
      return ` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${escapeHtml(s4.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${escapeHtml(s4.extensionId)}">open</button>`;
    }
    return ` <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>`;
  }
  function _buildMcpActionCell(s4) {
    if (s4.extensionId) {
      return `<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${escapeHtml(s4.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${escapeHtml(s4.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`;
    }
    if (!s4.configFiles || s4.configFiles.length === 0) {
      return `<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>`;
    }
    if (s4.configFiles.length === 1) {
      return `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(s4.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${escapeHtml(s4.configFiles[0])}">Change Tools</button>`;
    }
    return `<button class="curation-file-btn" data-command="openFileFromList" data-paths="${escapeHtml(JSON.stringify(s4.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${s4.configFiles.length} config files">Change Tools</button>`;
  }
  function _buildMcpServerRowHtml(s4, bloat) {
    const b3 = bloat.byServer[s4.server] ?? 0;
    const sourceLabel = _mcpSourceLabel(s4);
    const sourceTip = s4.configFiles?.join("\n") ?? s4.extensionId ?? "";
    const sourceOpenBtn = _buildMcpSourceOpenBtn(s4, sourceTip);
    const actionCell = _buildMcpActionCell(s4);
    const notConnected = s4.availableToolCount === 0;
    return `<tr class="${s4.usedToolCount > 0 ? "mcp-has-usage" : ""}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(s4.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${escapeHtml(sourceTip)}">${escapeHtml(sourceLabel)}${sourceOpenBtn}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${notConnected ? '<em style="color:var(--text-secondary)">not connected</em>' : s4.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${notConnected ? "\u2014" : s4.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${b3 > 0 ? `~${b3.toLocaleString()} tokens` : "\u2014"}</td>
		<td style="padding:5px 8px; font-size:12px;">${actionCell}</td>
	</tr>`;
  }
  function _buildMcpJsonLink(allServers) {
    const allConfigFiles = [...new Set(
      allServers.filter((s4) => !s4.extensionId).flatMap((s4) => s4.configFiles ?? [])
    )];
    const preferredFile = allConfigFiles.find((f3) => f3.replace(/\\/g, "/").endsWith(".vscode/mcp.json")) ?? allConfigFiles[0];
    if (!preferredFile) {
      return `<code>.vscode/mcp.json</code>`;
    }
    const displayName = preferredFile.replace(/\\/g, "/").split("/").slice(-3).join("/");
    return `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(preferredFile)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${escapeHtml(preferredFile)}">${escapeHtml(displayName)}</button>`;
  }
  function buildUnusedMcpHtml(underusedMcpServers, bloat, windowDays) {
    const allServers = [...underusedMcpServers].sort((a3, b3) => {
      const aKey = a3.usedToolCount === 0 ? 0 : a3.usedToolCount < a3.availableToolCount ? 1 : 2;
      const bKey = b3.usedToolCount === 0 ? 0 : b3.usedToolCount < b3.availableToolCount ? 1 : 2;
      return aKey !== bKey ? aKey - bKey : a3.usedToolCount - b3.usedToolCount;
    });
    if (allServers.length === 0) {
      return "";
    }
    const rows = allServers.map((s4) => _buildMcpServerRowHtml(s4, bloat)).join("");
    const mcpJsonLink = _buildMcpJsonLink(allServers);
    const usedCount = allServers.filter((s4) => s4.usedToolCount > 0).length;
    const unusedCount = allServers.length - usedCount;
    return `<details style="margin-top:12px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F50C} MCP Servers in Last ${windowDays} Days (${allServers.length})
		</summary>
		<style>#mcp-hide-toggle:checked ~ .mcp-table-wrap .mcp-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="mcp-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="mcp-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide servers with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${unusedCount} with no usage \xB7 ${usedCount} with usage</span>
		</div>
		<div class="mcp-table-wrap" style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Server</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Source</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tools Available</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tools Used</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Action</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Open ${mcpJsonLink} to disable file-configured servers, or use <em>Manage Extension</em> to disable or uninstall an MCP-providing extension. (VS Code does not expose per-server picker state to extensions, so servers you disabled in the chat tool picker may still appear here.)</div>
		</div>
	</details>`;
  }
  function buildUnusedSkillsHtml(unusedSkills) {
    if (unusedSkills.length === 0) {
      return "";
    }
    const rows = unusedSkills.map((s4) => {
      const skillFile = s4.configFiles?.[0];
      const viewLink = skillFile ? `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(skillFile)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${escapeHtml(skillFile)}">View skill</button>` : "\u2014";
      let sourceLabel = "\u2014";
      let manageBtn = "";
      if (s4.pluginName) {
        sourceLabel = `Plugin: ${s4.pluginName}`;
        manageBtn = ` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${escapeHtml(s4.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`;
      } else if (s4.skillPath) {
        if (s4.skillPath.startsWith(".github/skills")) {
          sourceLabel = "Workspace (.github)";
        } else if (s4.skillPath.startsWith(".claude/skills")) {
          sourceLabel = "Workspace (.claude)";
        } else if (s4.skillPath.startsWith(".agents/skills")) {
          sourceLabel = "Workspace (.agents)";
        } else {
          sourceLabel = "User (~)";
        }
      }
      const estTokens = Math.round((s4.name.length + s4.description.length + 10) / 4);
      return `<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(s4.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(sourceLabel)}${manageBtn}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(s4.description)}">${escapeHtml(s4.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${estTokens.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${viewLink}</td>
	</tr>`;
    }).join("");
    return `<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F4DA} Unused Skills (${unusedSkills.length})
		</summary>
		<div style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skill</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Source</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Description</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">View</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Est. overhead is per agent interaction. For plugin skills, click <em>manage</em> to open the agent plugins view where you can uninstall the plugin. For workspace skills, update the description or remove the SKILL.md.</div>
		</div>
	</details>`;
  }
  function buildUnderusedAgentPluginsHtml(underusedAgentPlugins, windowDays) {
    if (underusedAgentPlugins.length === 0) {
      return "";
    }
    const rows = underusedAgentPlugins.map((p3) => {
      const manageBtn = `<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${escapeHtml(p3.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${escapeHtml(p3.pluginName)}">Manage Plugin</button>`;
      const usageClass = p3.usedSkillCount === 0 ? "" : "plugin-has-usage";
      return `<tr class="${usageClass}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(p3.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${p3.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${p3.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${manageBtn}</td>
		</tr>`;
    }).join("");
    const unusedCount = underusedAgentPlugins.filter((p3) => p3.usedSkillCount === 0).length;
    const usedCount = underusedAgentPlugins.length - unusedCount;
    return `<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F9E9} Agent Plugins in Last ${windowDays} Days (${underusedAgentPlugins.length})
		</summary>
		<style>#plugin-hide-toggle:checked ~ .plugin-table-wrap .plugin-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="plugin-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="plugin-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide plugins with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${unusedCount} with no usage \xB7 ${usedCount} with usage</span>
		</div>
		<div class="plugin-table-wrap" style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Plugin</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Available</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Used</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Action</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Click <em>Manage Plugin</em> to open the Extensions view filtered to <code>@agentPlugins</code> where you can uninstall unused plugins to reclaim prompt budget.</div>
		</div>
	</details>`;
  }
  function buildBuiltinToolsHtml(builtinTools, bloat) {
    if (builtinTools.length === 0) {
      return "";
    }
    const builtinBloat = bloat.byServer["builtin"] ?? 0;
    const rows = builtinTools.map((t4) => {
      const overhead = Math.round((t4.name.length + (t4.description?.length ?? 0) + 10) / 4);
      return `<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(t4.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(t4.description ?? "")}">${escapeHtml(t4.description ?? "\u2014")}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${overhead} tokens</td>
		</tr>`;
    }).join("");
    const fmt = (n5) => n5 >= 1e3 ? `~${Math.round(n5 / 1e3)}K` : `~${n5}`;
    return `<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F527} Built-in VS Code Tools (${builtinTools.length}) \u2014 ${fmt(builtinBloat)} tokens overhead, not actionable
		</summary>
		<div style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tool</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Description</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} These tools are provided by VS Code itself and cannot be disabled. They are excluded from the actionable overhead total above.</div>
		</div>
	</details>`;
  }
  function buildCurationSectionHtml(curation) {
    try {
      if (!curation || curation.availableTools.length === 0) {
        traceCurationOnce("render-hidden-empty", "buildCurationSectionHtml.hidden", {
          hasCurationObject: !!curation,
          availableTools: curation?.availableTools?.length ?? 0
        });
        return "";
      }
      const { availableTools, unusedTools, underusedMcpServers, underusedAgentPlugins, estimatedPromptBloat, windowDays } = curation;
      const unusedSkills = unusedTools.filter((t4) => t4.source === "skill");
      const builtinTools = availableTools.filter((t4) => t4.source === "builtin");
      traceCuration("buildCurationSectionHtml.render", {
        availableTools: availableTools.length,
        unusedTools: unusedTools.length,
        unusedSkills: unusedSkills.length,
        mcpServers: underusedMcpServers.length
      });
      return `
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${windowDays} days)</div>
				${buildCurationSummaryHtml(availableTools, unusedTools, estimatedPromptBloat)}
				${buildUnusedMcpHtml(underusedMcpServers, estimatedPromptBloat, windowDays)}
				${buildUnderusedAgentPluginsHtml(underusedAgentPlugins, windowDays)}
				${buildBuiltinToolsHtml(builtinTools, estimatedPromptBloat)}
				${buildUnusedSkillsHtml(unusedSkills)}
			</div>`;
    } catch (error) {
      traceCuration("buildCurationSectionHtml.error", {
        error: error instanceof Error ? error.message : String(error)
      });
      return `
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`;
    }
  }
  function buildReposAndAgentTabPanelsHtml() {
    return `
		<div id="tab-panel-repos" class="tab-panel"${activeTab !== "repos" ? ' style="display:none"' : ""}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories \u2014 authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${activeTab !== "agent" ? ' style="display:none"' : ""}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>`;
  }
  function buildInsightCardHtml(insight) {
    const severityColors = {
      tip: "rgba(96,165,250,0.12)",
      opportunity: "rgba(251,191,36,0.12)",
      celebration: "rgba(74,222,128,0.12)"
    };
    const severityBorder = {
      tip: "rgba(96,165,250,0.5)",
      opportunity: "rgba(251,191,36,0.5)",
      celebration: "rgba(74,222,128,0.5)"
    };
    const severityAccent = {
      tip: "rgba(96,165,250,0.85)",
      opportunity: "rgba(251,191,36,0.85)",
      celebration: "rgba(74,222,128,0.85)"
    };
    const bg = severityColors[insight.severity] ?? severityColors.tip;
    const border = severityBorder[insight.severity] ?? severityBorder.tip;
    const accent = severityAccent[insight.severity] ?? severityAccent.tip;
    const isNew = insight.status === "new";
    const isDone = insight.status === "done";
    const actionBtn = insight.actionLabel ? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="execute" data-command="${escapeHtml(insight.actionCommand ?? "")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:${bg}; color:var(--text-primary);">${escapeHtml(insight.actionLabel)}</button>` : "";
    const doneBtn = !isDone ? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:${accent}; color:#0d1117;">\u2713 Done</button>` : `<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>`;
    const snoozeBtn = !isDone ? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>` : "";
    const dismissBtn = !isDone ? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>` : "";
    return `
		<div class="insight-card" data-insight-id="${escapeHtml(insight.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${bg}; border:1px solid ${border};
			${isNew ? "box-shadow:0 2px 8px " + bg + ";" : ""}
			${isDone ? "opacity:0.45;" : ""}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${isNew ? `<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${accent}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>` : ""}
						${escapeHtml(insight.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${escapeHtml(insight.body)}</div>
					${actionBtn ? `<div style="margin-top:12px;">${actionBtn}</div>` : ""}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${dismissBtn}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${border}; padding-top:10px;">
				${doneBtn}
				${snoozeBtn}
			</div>
		</div>`;
  }
  function buildInsightsTabPanelHtml(insights) {
    const applicable = insights.filter((i6) => i6.status !== "dismissed");
    const newInsights = applicable.filter((i6) => i6.status === "new");
    const otherInsights = applicable.filter((i6) => i6.status !== "new" && i6.status !== "done");
    const forYouSection = newInsights.length > 0 ? `<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${newInsights.map(buildInsightCardHtml).join("")}
		</div>` : `<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`;
    const allSection = otherInsights.length > 0 ? `<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${otherInsights.map(buildInsightCardHtml).join("")}
		</div>` : "";
    return `
		<div id="tab-panel-insights" class="tab-panel"${activeTab !== "insights" ? ' style="display:none"' : ""}>
			<div class="section">
				<div class="section-title"><span>\u{1F4A1}</span><span>Insights</span></div>
				<div class="section-subtitle">
					Personalized tips based on your usage patterns. Tips are data-driven \u2014 they only appear when relevant to how you code with AI.
				</div>
				<div id="insights-container" style="margin-top:16px;">
					${forYouSection}
					${allSection}
				</div>
			</div>
		</div>`;
  }
  function updateTabButtonCount(insights) {
    const tabButton = document.querySelector('.tab-button[data-tab="insights"]');
    if (!tabButton) {
      return;
    }
    const newCount = insights.filter((i6) => i6.status === "new").length;
    const badgeHtml = newCount > 0 ? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${newCount}</span>` : "";
    const titleOnly = '<span class="codicon codicon-lightbulb"></span> Insights';
    setHtml(tabButton, titleOnly + badgeHtml);
  }
  function refreshInsightsPanel(insights) {
    const container = document.getElementById("insights-container");
    if (!container) {
      return;
    }
    currentInsights = insights;
    const forYou = insights.filter((i6) => i6.status === "new");
    const other = insights.filter((i6) => i6.status !== "new" && i6.status !== "dismissed" && i6.status !== "done");
    const forYouSection = forYou.length > 0 ? `<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${forYou.map(buildInsightCardHtml).join("")}
		</div>` : `<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`;
    const allSection = other.length > 0 ? `<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${other.map(buildInsightCardHtml).join("")}
		</div>` : "";
    setHtml(container, forYouSection + allSection);
    wireInsightCardButtons();
    updateTabButtonCount(insights);
  }
  function _postOpenFileFromList(pathsJson) {
    if (!pathsJson) {
      return;
    }
    try {
      const paths = JSON.parse(pathsJson);
      vscode.postMessage({ command: "openFileFromList", paths });
    } catch (error) {
      traceCuration("wireCurationButtons.badPathsJson", { error: error instanceof Error ? error.message : String(error) });
    }
  }
  function _handleCurationBtnClick(btn) {
    const command = btn.getAttribute("data-command");
    if (!command) {
      return;
    }
    if (command === "openFile") {
      const filePath = btn.getAttribute("data-path");
      if (filePath) {
        vscode.postMessage({ command: "openFile", path: filePath });
      }
    } else if (command === "openFileFromList") {
      _postOpenFileFromList(btn.getAttribute("data-paths"));
    } else if (command === "manageExtension") {
      const extensionId = btn.getAttribute("data-extension-id");
      if (extensionId) {
        vscode.postMessage({ command: "manageExtension", extensionId });
      }
    } else if (command === "openAgentPlugins") {
      const pluginName = btn.getAttribute("data-plugin-name") ?? "";
      vscode.postMessage({ command: "openAgentPlugins", pluginName });
    } else {
      vscode.postMessage({ command });
    }
  }
  function wireCurationButtons() {
    try {
      const section = document.getElementById("section-tool-curation");
      if (!section) {
        traceCurationOnce("wire-no-section", "wireCurationButtons.noSection");
        return;
      }
      const buttons = section.querySelectorAll(".curation-file-btn");
      traceCuration("wireCurationButtons.bind", { buttons: buttons.length });
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          try {
            _handleCurationBtnClick(btn);
          } catch (error) {
            traceCuration("wireCurationButtons.clickError", { error: error instanceof Error ? error.message : String(error) });
          }
        });
      });
    } catch (error) {
      traceCuration("wireCurationButtons.error", { error: error instanceof Error ? error.message : String(error) });
    }
  }
  function wireInsightCardButtons() {
    const container = document.getElementById("insights-container");
    if (!container) {
      return;
    }
    container.querySelectorAll(".insight-action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-insight-id");
        const action = btn.getAttribute("data-action");
        if (!id || !action) {
          return;
        }
        if (action === "execute") {
          const command = btn.getAttribute("data-command");
          if (command) {
            vscode.postMessage({ command });
          }
        } else {
          vscode.postMessage({ command: "insightAction", id, action });
        }
      });
    });
  }
  function buildUsageRootHtml(stats, customizationHtml, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels) {
    return `
		<style>${theme_default}</style>
		<style>${styles_default}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${navButtonsHtml("btn-usage", !!stats.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!aboutCollapsed}" aria-controls="about-info-body">
					<span>\u{1F4CB} About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${aboutCollapsed ? "\u25B8" : "\u25BE"}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${aboutCollapsed ? ' style="display:none"' : ""}>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${activeTab === "activity" ? "active" : ""}" data-tab="activity"><span class="codicon codicon-pulse"></span> My Activity</button>
				<button class="tab-button ${activeTab === "sessions" ? "active" : ""}" data-tab="sessions"><span class="codicon codicon-history"></span> Recent Sessions</button>
				<button class="tab-button ${activeTab === "tools" ? "active" : ""}" data-tab="tools"><span class="codicon codicon-tools"></span> Tools &amp; Integrations</button>
				<button class="tab-button ${activeTab === "health" ? "active" : ""}" data-tab="health"><span class="codicon codicon-server-environment"></span> Workspace Health</button>
				<button class="tab-button ${activeTab === "repos" ? "active" : ""}" data-tab="repos"><span class="codicon codicon-git-pull-request"></span> Repository PRs</button>
				<button class="tab-button ${activeTab === "agent" ? "active" : ""}" data-tab="agent"><span class="codicon codicon-cloud"></span> Cloud Agent</button>
				<button class="tab-button ${activeTab === "worktrees" ? "active" : ""}" data-tab="worktrees"><span class="codicon codicon-git-branch"></span> Worktrees</button>
				<button class="tab-button ${activeTab === "insights" ? "active" : ""}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(stats.insights ?? []).filter((i6) => i6.status === "new").length > 0 ? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(stats.insights ?? []).filter((i6) => i6.status === "new").length}</span>` : ""}</button>
			</div>

			${safeSectionHtml("Recent Sessions", () => buildSessionsTabPanelHtml(stats))}
			${safeSectionHtml("My Activity", () => buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs))}
			${safeSectionHtml("Tools & Integrations", () => buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels))}
			${safeSectionHtml("Workspace Health", () => buildHealthTabPanelHtml(customizationHtml, stats))}
			${safeSectionHtml("Repository PRs & Cloud Agent", () => buildReposAndAgentTabPanelsHtml())}
			${safeSectionHtml("Worktrees", () => buildWorktreesTabPanelHtml())}
			${safeSectionHtml("Insights", () => buildInsightsTabPanelHtml(stats.insights ?? []))}
			<div class="footer">
				Last updated: ${escapeHtml(new Date(stats.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`;
  }
  function renderWorktreeRootsList() {
    if (worktreeRoots.length === 0) {
      return `<div style="color: var(--text-muted); font-size: 12px; margin: 8px 0;">No root folders added yet. Add a folder to scan for worktrees.</div>`;
    }
    const collapsible = worktreeRoots.length > 2;
    const showList = !collapsible || worktreeRootsExpanded;
    const toggle = collapsible ? `<button class="worktree-roots-toggle" id="btn-toggle-worktree-roots" aria-expanded="${worktreeRootsExpanded}"><span class="worktree-caret">${worktreeRootsExpanded ? "\u25BC" : "\u25B6"}</span>${worktreeRoots.length} root folders found</button>` : "";
    const list = showList ? `<div class="worktree-roots-list">${worktreeRoots.map(
      (r6, i6) => `<div class="worktree-root-item"><span title="${escapeHtml(r6)}">${escapeHtml(r6)}</span><button class="button secondary worktree-remove-root" data-index="${i6}" ${worktreeScanInProgress ? "disabled" : ""}>\u2715</button></div>`
    ).join("")}</div>` : "";
    return toggle + list;
  }
  function _renderWorktreeEnrichingProgress(s4, seconds) {
    const done = s4.enriched ?? 0;
    const total = s4.enrichTotal ?? 0;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    return `
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F4E6} Computing sizes &amp; push status\u2026</div>
      <div>${done} / ${total} worktree${total === 1 ? "" : "s"} analyzed (${seconds}s)</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${pct}%;"></div></div>
    </div>`;
  }
  function _renderWorktreeScanningProgress(s4, seconds) {
    const walking = s4.phase === "walking";
    const title = walking ? "\u{1F50D} Scanning folder\u2026" : "\u23F3 Checking markers\u2026";
    const dirs = s4.dirsScanned ?? 0;
    const detail = walking ? `Exploring for git worktrees \u2014 ${dirs} folder${dirs === 1 ? "" : "s"} scanned (${seconds}s)` : `${s4.checked} / ${s4.total || "?"} .git markers checked \u2014 ${s4.foundCount} worktree${s4.foundCount === 1 ? "" : "s"} found so far (${seconds}s)`;
    const pct = walking ? 100 : s4.total > 0 ? Math.round(s4.checked / s4.total * 100) : 0;
    const fillClass = walking ? "worktree-progress-fill indeterminate" : "worktree-progress-fill";
    return `
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">${title}</div>
      <div>Folder: <span style="font-family: var(--vscode-editor-font-family, monospace);">${escapeHtml(s4.root || "\u2026")}</span></div>
      <div>${detail}</div>
      <div class="worktree-progress-bar"><div class="${fillClass}" style="width: ${pct}%;"></div></div>
    </div>`;
  }
  function renderWorktreeProgress() {
    if (!worktreeScanInProgress) {
      return "";
    }
    const s4 = worktreeScanStatus;
    const seconds = (s4.elapsedMs / 1e3).toFixed(1);
    if (s4.phase === "enriching") {
      return _renderWorktreeEnrichingProgress(s4, seconds);
    }
    return _renderWorktreeScanningProgress(s4, seconds);
  }
  function renderWorktreeControls() {
    return `
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Root Folders</span></div>
      <div id="worktree-roots-list">${renderWorktreeRootsList()}</div>
      <div class="folder-input-row" style="margin-top: 8px;">
        <input
          type="text"
          id="worktree-root-input"
          class="folder-input"
          placeholder="Paste a root folder path here, e.g. C:\\code\\repos"
          ${worktreeScanInProgress ? "disabled" : ""}
        />
        <button class="button secondary" id="btn-browse-worktree-root" ${worktreeScanInProgress ? "disabled" : ""}>\u{1F4C2} Browse\u2026</button>
        <button class="button secondary" id="btn-add-worktree-root" ${worktreeScanInProgress ? "disabled" : ""}>\u2795 Add</button>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-scan-worktrees" ${worktreeScanInProgress || worktreeCleanupInProgress || worktreeRoots.length === 0 ? "disabled" : ""}>\u{1F50D} Scan for Worktrees</button>
        ${worktreeScanInProgress ? '<button class="button secondary" id="btn-cancel-worktree-scan">\u2715 Cancel</button>' : ""}
      </div>
      ${worktreeScanError ? `<div class="info-box" style="margin-top: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);"><div>\u26A0\uFE0F ${escapeHtml(worktreeScanError)}</div></div>` : ""}
      <div id="worktree-progress-area">${renderWorktreeProgress()}</div>
    </div>`;
  }
  function groupWorktreesByRepo(results) {
    const groups = /* @__PURE__ */ new Map();
    for (const wt of results) {
      const key = wt.repoLabel || "Unknown";
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(wt);
    }
    return groups;
  }
  function isWorktreePending(w2) {
    return w2.bytes < 0;
  }
  function knownBytes(w2) {
    return w2.bytes > 0 ? w2.bytes : 0;
  }
  function buildWorktreeRowHtml(w2) {
    const pending = isWorktreePending(w2);
    const pendingLabel = (active) => `<span class="worktree-pending">${worktreeScanInProgress ? active : "\u2014"}</span>`;
    const pushedIcon = w2.pushed === "yes" ? "\u2705" : w2.pushed === "no" ? "\u{1F534}" : "\u2753";
    const pushedCell = pending ? pendingLabel("checking\u2026") : `${pushedIcon} ${escapeHtml(w2.pushed)}`;
    const filesCell = pending ? pendingLabel("\u2026") : escapeHtml(String(w2.files));
    const sizeCell = pending ? pendingLabel("computing\u2026") : `<span title="${w2.bytes.toLocaleString()} bytes">${formatFileSize(w2.bytes)}</span>`;
    return `<tr>
    <td title="${escapeHtml(w2.path)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(w2.path)}</td>
    <td>${escapeHtml(w2.branch)}</td>
    <td>${escapeHtml(w2.lastCommit)}</td>
    <td>${pushedCell}</td>
    <td>${filesCell}</td>
    <td>${sizeCell}</td>
    <td>
      <a href="#" class="worktree-reveal-link" data-path="${encodeURIComponent(w2.path)}">Open</a>
      <a href="#" class="worktree-delete-link" data-path="${encodeURIComponent(w2.path)}" data-branch="${encodeURIComponent(w2.branch)}" data-repo="${encodeURIComponent(w2.repoLabel)}" data-pushed="${escapeHtml(w2.pushed)}" title="Remove via git worktree remove (asks for confirmation)">\u{1F5D1}\uFE0F Delete</a>
    </td>
  </tr>`;
  }
  function buildWorktreeDetailsTableHtml(worktrees) {
    const sorted = [...worktrees].sort((a3, b3) => knownBytes(b3) - knownBytes(a3));
    const rows = sorted.map(buildWorktreeRowHtml).join("");
    return `<div class="table-container">
    <table class="session-table">
      <thead><tr><th>Path</th><th>Branch</th><th>Last Commit</th><th>Pushed</th><th>Files</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
  }
  function worktreeSizeText(worktrees) {
    const totalBytes = worktrees.reduce((s4, w2) => s4 + knownBytes(w2), 0);
    const pending = worktrees.some(isWorktreePending);
    const size = `<span title="${totalBytes.toLocaleString()} bytes">${formatFileSize(totalBytes)}</span>`;
    return pending ? `${size} <span class="worktree-pending">\u2026</span>` : size;
  }
  function buildWorktreeRepoRowsHtml(repoLabel, worktrees) {
    const expanded = worktreeExpandedRepos.has(repoLabel);
    const caret = expanded ? "\u25BC" : "\u25B6";
    const repoAttr = escapeHtml(repoLabel);
    const summaryRow = `<tr class="worktree-repo-row${expanded ? " expanded" : ""}" data-repo="${repoAttr}" aria-expanded="${expanded}">
    <td><span class="worktree-caret">${caret}</span> ${escapeHtml(repoLabel)}</td>
    <td>${worktrees.length}</td>
    <td>${worktreeSizeText(worktrees)}</td>
  </tr>`;
    const detailsRow = `<tr class="worktree-repo-details" data-repo="${repoAttr}"${expanded ? "" : ' style="display: none;"'}>
    <td colspan="3">${buildWorktreeDetailsTableHtml(worktrees)}</td>
  </tr>`;
    return summaryRow + detailsRow;
  }
  function getWorktreeSortIndicator(col) {
    if (worktreeSortColumn !== col) {
      return "";
    }
    return worktreeSortDir === "desc" ? " \u25BC" : " \u25B2";
  }
  function groupKnownBytes(worktrees) {
    return worktrees.reduce((s4, w2) => s4 + knownBytes(w2), 0);
  }
  function compareWorktreeGroups(a3, b3) {
    const dir = worktreeSortDir === "desc" ? -1 : 1;
    if (worktreeSortColumn === "repo") {
      return dir * a3[0].localeCompare(b3[0]);
    }
    const value = (g2) => worktreeSortColumn === "count" ? g2.length : groupKnownBytes(g2);
    const diff = value(a3[1]) - value(b3[1]);
    return diff !== 0 ? dir * diff : a3[0].localeCompare(b3[0]);
  }
  function getCleanupCandidates() {
    return worktreeResults.filter((w2) => w2.pushed === "yes" && !isWorktreePending(w2));
  }
  function renderWorktreeCleanupCard() {
    const pushedCount = getCleanupCandidates().length;
    const disabled = worktreeCleanupInProgress || worktreeCleanupConfirmPending || worktreeScanInProgress || pushedCount === 0;
    const label = worktreeCleanupConfirmPending ? "\u23F3 Waiting\u2026" : `\u{1F9F9} Clean Up (${pushedCount})`;
    return `<div class="summary-card worktree-cleanup-card">
    <div class="summary-label">Pushed Worktrees</div>
    <div class="worktree-cleanup-card-actions">
      <button class="button secondary" id="btn-cleanup-pushed-worktrees" ${disabled ? "disabled" : ""}>${label}</button>
      ${worktreeCleanupInProgress ? '<button class="button secondary" id="btn-cancel-cleanup">\u2715</button>' : ""}
    </div>
  </div>`;
  }
  function renderWorktreeCleanupLog() {
    const notable = worktreeCleanupLog.filter((e7) => e7.status !== "deleted");
    if (notable.length === 0) {
      return "";
    }
    const rows = notable.map((e7) => {
      const icon = e7.status === "skipped" ? "\u23ED\uFE0F" : "\u274C";
      return `<div class="worktree-cleanup-log-row">
      <span>${icon}</span>
      <span class="worktree-cleanup-log-branch">${escapeHtml(e7.branch)}</span>
      <span class="worktree-cleanup-log-repo">${escapeHtml(e7.repoLabel)}</span>
      <span class="worktree-cleanup-log-reason">${escapeHtml(e7.reason || "")}</span>
    </div>`;
    }).join("");
    return `<div class="worktree-cleanup-log">${rows}</div>`;
  }
  function renderWorktreeCleanupStatus() {
    if (worktreeCleanupInProgress) {
      const { processed, total } = worktreeCleanupStatus;
      const pct = total > 0 ? Math.round(processed / total * 100) : 0;
      return `<div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F9F9} Cleaning up pushed worktrees\u2026</div>
      <div>${processed} / ${total} processed</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${pct}%;"></div></div>
    </div>${renderWorktreeCleanupLog()}`;
    }
    if (worktreeCleanupLog.length === 0) {
      return "";
    }
    const deleted = worktreeCleanupLog.filter((e7) => e7.status === "deleted").length;
    const skipped = worktreeCleanupLog.filter((e7) => e7.status === "skipped").length;
    const errors = worktreeCleanupLog.filter((e7) => e7.status === "error").length;
    return `<div class="info-box" style="margin-top: 12px;">
    <div class="info-box-title">\u{1F9F9} Cleanup finished</div>
    <div>\u2705 ${deleted} deleted \xB7 \u23ED\uFE0F ${skipped} skipped (uncommitted/unpushed) \xB7 ${errors > 0 ? `\u274C ${errors} error${errors === 1 ? "" : "s"}` : "0 errors"}</div>
  </div>${renderWorktreeCleanupLog()}`;
  }
  function renderWorktreeResults() {
    if (worktreeResults.length === 0) {
      if (worktreeScanInProgress) {
        return '<div style="padding: 16px; color: var(--text-muted);">Discovering worktrees\u2026</div>';
      }
      return '<div style="padding: 16px; color: var(--text-muted);">No worktrees found yet. Add root folders above and click Scan.</div>';
    }
    const groups = groupWorktreesByRepo(worktreeResults);
    const totalBytes = worktreeResults.reduce((s4, w2) => s4 + knownBytes(w2), 0);
    const anyPending = worktreeResults.some(isWorktreePending);
    const totalSizeHtml = `${formatFileSize(totalBytes)}${anyPending ? ' <span class="worktree-pending">\u2026</span>' : ""}`;
    const summary = `<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F333} Worktrees</div><div class="summary-value">${worktreeResults.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4E6} Repositories</div><div class="summary-value">${groups.size}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4BE} Total Size</div><div class="summary-value" title="${totalBytes.toLocaleString()} bytes">${totalSizeHtml}</div></div>
    ${renderWorktreeCleanupCard()}
  </div>`;
    const sortedGroups = [...groups.entries()].sort(compareWorktreeGroups);
    const repoRows = sortedGroups.map(([repo, wts]) => buildWorktreeRepoRowsHtml(repo, wts)).join("");
    const table = `<div class="table-container">
    <table class="session-table worktree-repo-table">
      <thead><tr>
        <th class="sortable" data-wt-sort="repo">Repository${getWorktreeSortIndicator("repo")}</th>
        <th class="sortable" data-wt-sort="count">Worktrees${getWorktreeSortIndicator("count")}</th>
        <th class="sortable" data-wt-sort="size">Size${getWorktreeSortIndicator("size")}</th>
      </tr></thead>
      <tbody>${repoRows}</tbody>
    </table>
  </div>`;
    return summary + renderWorktreeCleanupStatus() + table;
  }
  function buildWorktreesTabPanelHtml() {
    return `
    <div id="tab-panel-worktrees" class="tab-panel"${activeTab !== "worktrees" ? ' style="display:none"' : ""}>
      <div class="info-box">
        <div class="info-box-title">\u{1F333} Worktree Discovery</div>
        <div>
          Scans folders for uncleaned git worktrees and reports disk usage grouped by repository (based on each
          worktree's git remote). Add one or more root folders below, then click Scan. Results stream in as they're found.
        </div>
      </div>
      <div id="worktree-controls">${renderWorktreeControls()}</div>
      <div id="worktree-results">${renderWorktreeResults()}</div>
    </div>`;
  }
  function buildSessionsTabPanelHtml(stats) {
    if (Array.isArray(stats.todaySessions)) {
      latestTodaySessions = stats.todaySessions;
    }
    const cachedForLookback = sessionsLookback === "today" ? latestTodaySessions : recentSessionsCache[sessionsLookback];
    const bodyHtml = cachedForLookback ? renderTodaySessionsTable(cachedForLookback) : `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${PERIOD_LABELS[sessionsLookback]}\u2026</div>`;
    return `
		<div id="tab-panel-sessions" class="tab-panel"${activeTab !== "sessions" ? ' style="display:none"' : ""}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>\u{1F4CB}</span><span>Recent Sessions</span>
					<span id="sessions-lookback-wrapper" style="margin-left:auto;"></span>
					${buildSessionColumnsMenuHtml()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period \u2014 sorted by number of interactions (most active first).</div>
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${bodyHtml}
				</div>
			</div>
		</div>`;
  }
  function _billingApiBalanceHtml(api, copilotCostUsd) {
    const apiUsedUsd = api.usedAiCredits * 0.01;
    const trackedUsd = Math.max(0, Math.min(copilotCostUsd, apiUsedUsd));
    const gapUsd = Math.max(0, apiUsedUsd - trackedUsd);
    const budgetUsd = api.budgetUsd;
    const trackedPct = budgetUsd > 0 ? Math.min(100, trackedUsd / budgetUsd * 100) : 0;
    const gapPct = budgetUsd > 0 ? Math.min(100 - trackedPct, gapUsd / budgetUsd * 100) : 0;
    const totalUsedPct = trackedPct + gapPct;
    const usedPct = formatFixed(100 - api.pctAvailable, 1);
    const pct = formatFixed(api.pctAvailable, 1);
    const severityColor = totalUsedPct > 90 ? "var(--error-color, #f14c4c)" : totalUsedPct > 75 ? "var(--warning-color, #cca700)" : "var(--accent-color, #4d9cf8)";
    const trackedSegment = trackedPct > 0 ? `<div style="height:100%; width:${formatFixed(trackedPct, 4)}%; background:${severityColor};"></div>` : "";
    const gapSegment = gapPct > 0 ? `<div title="Usage the API reports but this device has no local session data for" style="height:100%; width:${formatFixed(gapPct, 4)}%; background:${severityColor}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 6px);"></div>` : "";
    const legend = gapPct > 0 ? `<div style="display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-secondary); margin-top:6px;">
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${severityColor}; margin-right:4px; vertical-align:middle;"></span>Tracked here (${formatFixed(trackedPct, 1)}%)</span>
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${severityColor}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px); margin-right:4px; vertical-align:middle;"></span>Other devices/cloud (${formatFixed(gapPct, 1)}%)</span>
			</div>` : "";
    return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">GitHub Copilot API (all channels)</div>
			<div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px;">
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.usedAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits used</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.remainingAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits remaining</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.budgetAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Monthly budget</div>
				</div>
			</div>
			<div style="margin-bottom:4px; font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
				<span>${usedPct}% used</span><span>${pct}% available</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden; display:flex;">
				${trackedSegment}${gapSegment}
			</div>
			${legend}
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 \xB7 Budget = $${formatFixed(api.budgetUsd, 2)}/month
			</div>
		</div>`;
  }
  function _billingExtGroupCostsHtml(groupCosts) {
    const totalCostUsd = Object.values(groupCosts).reduce((s4, v2) => s4 + v2, 0);
    const rows = Object.entries(groupCosts).sort(([, a3], [, b3]) => b3 - a3).map(([group, cost]) => `
			<tr>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${escapeHtml(group)}</td>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${formatFixed(cost, 2)}</td>
			</tr>`).join("");
    return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${formatFixed(totalCostUsd, 2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`;
  }
  function _billingCoverageAnalysisHtml(api, copilotCostUsd, nonCopilotCostUsd) {
    if (!api) {
      return `
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				\u2139\uFE0F No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions \u2014 it cannot see web chat, cloud agent, or review agent usage.
			</div>`;
    }
    if (copilotCostUsd <= 0) {
      return "";
    }
    const apiUsedUsd = api.usedAiCredits * 0.01;
    const gapUsd = apiUsedUsd - copilotCostUsd;
    const gapCredits = Math.round(gapUsd * 100);
    const gapRow = gapCredits > 0 ? `<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${formatFixed(gapUsd, 2)} (${formatNumber(gapCredits)} credits)</span></div>` : "";
    const otherRow = nonCopilotCostUsd > 1e-3 ? `<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${formatFixed(nonCopilotCostUsd, 2)}</span></div>` : "";
    const note = gapCredits > 0 ? `<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">\u2139\uFE0F The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> \u2014 all counted against your AI Credit budget.</div>` : `<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">\u2705 Extension-tracked Copilot usage matches the API \u2014 no significant untracked usage from web chat, cloud agent, or review agent.</div>`;
    return `
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${formatFixed(apiUsedUsd, 2)} (${formatNumber(api.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${formatFixed(copilotCostUsd, 2)} (${formatNumber(Math.round(copilotCostUsd * 100))} credits)</span></div>
				${gapRow}${otherRow}
			</div>
			${note}
		</div>`;
  }
  function buildBillingComparisonSectionHtml(stats) {
    const api = stats.copilotApiBalance;
    const groupCosts = stats.monthBillingGroupCosts;
    if (!api && (!groupCosts || Object.keys(groupCosts).length === 0)) {
      return "";
    }
    const copilotCostUsd = groupCosts?.["GitHub Copilot"] ?? 0;
    const totalCostUsd = groupCosts ? Object.values(groupCosts).reduce((s4, v2) => s4 + v2, 0) : 0;
    const nonCopilotCostUsd = totalCostUsd - copilotCostUsd;
    const apiHtml = api ? _billingApiBalanceHtml(api, copilotCostUsd) : "";
    const extHtml = groupCosts && Object.keys(groupCosts).length > 0 ? _billingExtGroupCostsHtml(groupCosts) : "";
    const deltaHtml = _billingCoverageAnalysisHtml(api, copilotCostUsd, nonCopilotCostUsd);
    return `
		<div class="section">
			<div class="section-title"><span>\u{1F4B3}</span><span>Copilot Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs.</div>
			${apiHtml}
			${extHtml}
			${deltaHtml}
		</div>`;
  }
  function buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs) {
    const modelCostHtml = safeSectionHtml("Model Cost", () => buildModelCostSectionHtml(stats));
    const billingComparisonHtml = safeSectionHtml("Copilot Billing Coverage", () => buildBillingComparisonSectionHtml(stats));
    const modeUsageHtml = safeSectionHtml("Interaction Modes", () => `
			<div class="section">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${renderModeBarChart(stats.today.modeUsage, "\u{1F4C5} Today")}
					${renderModeBarChart(stats.last30Days.modeUsage, "\u{1F4CA} Last 30 Days")}
				</div>
			</div>`);
    const contextRefsHtml = safeSectionHtml("Context References", () => buildContextRefsHtml(stats, todayTotalRefs, last30DaysTotalRefs));
    const modelEfficiencyHtml = safeSectionHtml("Model Efficiency", () => buildModelEfficiencySectionHtml(stats));
    const contextWindowHtml = safeSectionHtml("Context Window", () => buildContextWindowSectionHtml(stats));
    return `
		<div id="tab-panel-activity" class="tab-panel"${activeTab !== "activity" ? ' style="display:none"' : ""}>
			${sessionsSummaryHtml}
			${billingComparisonHtml}
			<!-- Mode Usage Section -->
			${modeUsageHtml}
			${contextRefsHtml}
			${multiModelHtml}
			${modelCostHtml}
			${modelEfficiencyHtml}
			${thinkingEffortHtml}
			${contextWindowHtml}
		</div>`;
  }
  var _modelPricingData = getWindowData("__MODEL_PRICING__");
  var MODEL_PRICING_MAP = _modelPricingData?.pricing ?? {};
  function _tierInfoForModels(models) {
    let best = null;
    for (const model of models) {
      const info = getLongContextInfo(model, MODEL_PRICING_MAP);
      if (info && (!best || info.thresholdTokens < best.thresholdTokens)) {
        best = { ...info, model };
      }
    }
    return best;
  }
  function _defaultTierCapacityText(thresholdTokens) {
    const mb = thresholdTokens * 4 / (1024 * 1024);
    const lines = Math.round(thresholdTokens / 10 / 1e3);
    return `\u2248${formatFixed(mb, 1)} MB of code (~${formatNumber(lines)}K lines)`;
  }
  function _renderContextWindowBar(maxTokens, tier) {
    const pct = maxTokens / tier.thresholdTokens * 100;
    const fillPct = Math.min(pct, 100);
    const color = pct > 100 ? "var(--error-color, #f14c4c)" : pct >= 70 ? "var(--warning-color, #cca700)" : "var(--success-color, #89d185)";
    const modelName = escapeHtml(getModelDisplayName(tier.model));
    const rateNote = `above it, input billing goes $${tier.defaultInputCostPerMillion.toFixed(2)} \u2192 $${tier.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;
    return `
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${formatNumber(maxTokens)} tokens \u2014 ${formatFixed(pct, 0)}% of the ${formatNumber(tier.thresholdTokens)}-token default tier for ${modelName}</span>
				<span>${formatNumber(tier.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${formatFixed(fillPct, 0)}%; background:${color}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${_defaultTierCapacityText(tier.thresholdTokens)}; ${rateNote}.</div>
		</div>`;
  }
  function _cwRow(label, value, subNote, labelTitle) {
    const titleAttr = labelTitle ? ` title="${labelTitle}"` : "";
    return `
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${titleAttr}>${label}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${value}</div>
			${subNote ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${subNote}</div>` : ""}
		</div>`;
  }
  function _cwLargestRequestRow(cw) {
    if (cw.maxRequestInputTokens <= 0) {
      return "";
    }
    const tier = _tierInfoForModels(cw.maxRequestModels);
    const modelsLabel = escapeHtml(cw.maxRequestModels.map((m2) => getModelDisplayName(m2)).join(", ") || "\u2014");
    const thresholdNote = tier ? `${formatFixed(cw.maxRequestInputTokens / tier.thresholdTokens * 100, 0)}% of the ${formatNumber(tier.thresholdTokens)}-token price line \xB7 ${modelsLabel}` : `${modelsLabel} \u2014 no long-context surcharge for ${cw.maxRequestModels.length > 1 ? "these models" : "this model"}`;
    return _cwRow(
      "\u{1F4CF} Largest request",
      `${formatNumber(cw.maxRequestInputTokens)} input tokens`,
      thresholdNote,
      "The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period"
    );
  }
  function _cwFullestWindowRow(cw) {
    if ((cw.maxReachedTokens ?? 0) <= 0) {
      return "";
    }
    const limit = cw.maxReachedWindowLimit;
    const value = limit ? `${formatNumber(cw.maxReachedTokens)} of ${formatNumber(limit)} (${formatFixed(cw.maxReachedTokens / limit * 100, 0)}%)` : formatNumber(cw.maxReachedTokens);
    return _cwRow(
      "\u{1FA9F} Fullest CLI window",
      value,
      void 0,
      "The highest context fill recorded for a Copilot CLI session in this period, versus its window limit"
    );
  }
  function renderContextWindowPeriodHtml(cw) {
    const hasData = !!cw && (cw.maxRequestInputTokens > 0 || (cw.maxReachedTokens ?? 0) > 0 || Object.keys(cw.tierCounts).length > 0);
    if (!hasData) {
      return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>';
    }
    const tierEntries = Object.entries(cw.tierCounts);
    const tierSessionCount = tierEntries.reduce((sum, [, c4]) => sum + c4, 0);
    const tierRow = tierEntries.length > 0 ? _cwRow(
      "\u{1FA9C} Context tiers",
      tierEntries.map(([t4, c4]) => `${escapeHtml(t4)} \xD7${c4}`).join(", "),
      `${tierSessionCount} Copilot CLI session${tierSessionCount === 1 ? "" : "s"} grouped by chosen window size \u2014 "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,
      "Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier"
    ) : "";
    return _cwLargestRequestRow(cw) + _cwFullestWindowRow(cw) + tierRow;
  }
  function buildContextWindowSectionHtml(stats) {
    const cw30 = stats.last30Days.contextWindow;
    const tier30 = cw30 && cw30.maxRequestInputTokens > 0 ? _tierInfoForModels(cw30.maxRequestModels) : null;
    const bar = cw30 && tier30 ? _renderContextWindowBar(cw30.maxRequestInputTokens, tier30) : "";
    return `
		<div class="section">
			<div class="section-title"><span>\u{1FA9F}</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${renderContextWindowPeriodHtml(stats.today.contextWindow)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${renderContextWindowPeriodHtml(cw30)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${renderContextWindowPeriodHtml(stats.lastMonth.contextWindow)}
				</div>
			</div>
			${bar}
		</div>`;
  }
  function numCell(value, extraClass = "") {
    const zeroClass = value > 0 ? "" : " ctx-ref-zero";
    const cls = `ctx-ref-num${extraClass ? " " + extraClass : ""}${zeroClass}`;
    return `<td class="${cls}">${value}</td>`;
  }
  function sparklineCell(lastMonth, month, today) {
    const W = 60, H2 = 20, PAD = 2;
    const values = [lastMonth, month, today];
    const max = Math.max(...values);
    const points = values.map((v2, i6) => {
      const x2 = PAD + i6 * ((W - PAD * 2) / (values.length - 1));
      const y3 = max === 0 ? H2 - PAD : PAD + (1 - v2 / max) * (H2 - PAD * 2);
      return `${x2.toFixed(1)},${y3.toFixed(1)}`;
    }).join(" ");
    const isFlat = max === 0;
    const color = isFlat ? "var(--text-muted)" : today >= month && month >= lastMonth ? "var(--link-color)" : today <= month && month <= lastMonth ? "#f87171" : "var(--text-secondary)";
    return `<td class="ctx-ref-spark"><svg viewBox="0 0 ${W} ${H2}" width="${W}" height="${H2}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${values.map((v2, i6) => {
      const x2 = PAD + i6 * ((W - PAD * 2) / (values.length - 1));
      const y3 = max === 0 ? H2 - PAD : PAD + (1 - v2 / max) * (H2 - PAD * 2);
      return `<circle cx="${x2.toFixed(1)}" cy="${y3.toFixed(1)}" r="2" fill="${color}"/>`;
    }).join("")}</svg></td>`;
  }
  function renderContextRefTable(rows, totals) {
    const bodyRows = rows.slice().sort((a3, b3) => b3.last30 - a3.last30).map((row) => {
      const titleAttr = row.title ? ` title="${escapeHtml(row.title)}"` : "";
      return `<tr${titleAttr}><td class="ctx-ref-name">${row.label}</td>${numCell(row.today, row.today > 0 ? "ctx-ref-today-active" : "")}${numCell(row.month)}${numCell(row.lastMonth)}${numCell(row.last30)}${sparklineCell(row.lastMonth, row.month, row.today)}</tr>`;
    }).join("");
    return `
		<div class="ctx-ref-table-wrap">
			<table class="ctx-ref-table">
				<thead>
					<tr>
						<th class="ctx-ref-name">Reference</th>
						<th class="ctx-ref-num">Today</th>
						<th class="ctx-ref-num">This Month</th>
						<th class="ctx-ref-num">Last Month</th>
						<th class="ctx-ref-num">Last 30 Days</th>
						<th class="ctx-ref-spark" title="Trend: Last Month \u2192 This Month \u2192 Today">Trend</th>
					</tr>
				</thead>
				<tbody>
					${bodyRows}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${totals.today}</td>
						<td class="ctx-ref-num">${totals.month}</td>
						<td class="ctx-ref-num">${totals.lastMonth}</td>
						<td class="ctx-ref-num">${totals.last30}</td>
						<td class="ctx-ref-spark">${sparklineCell(totals.lastMonth, totals.month, totals.today).replace(/^<td[^>]*>/, "").replace(/<\/td>$/, "")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`;
  }
  function buildContextRefCardsHtml(stats, todayTotalRefs, last30DaysTotalRefs) {
    const c4 = (v2) => v2 || 0;
    const descriptors = [
      { label: "\u{1F4C4} #file", get: (cr) => cr.file },
      { label: "\u2702\uFE0F #selection", get: (cr) => cr.selection },
      { label: "\u2728 Implicit Selection", title: "Text selected in your editor providing passive context to Copilot", get: (cr) => cr.implicitSelection },
      { label: "\u{1F524} #symbol", get: (cr) => cr.symbol },
      { label: "\u{1F5C2}\uFE0F #codebase", get: (cr) => cr.codebase },
      { label: "\u{1F4C1} @workspace", get: (cr) => cr.workspace },
      { label: "\u{1F4BB} @terminal", get: (cr) => cr.terminal },
      { label: "\u{1F527} @vscode", get: (cr) => cr.vscode },
      { label: "\u2328\uFE0F #terminalLastCommand", title: "Last command run in the terminal", get: (cr) => c4(cr.terminalLastCommand) },
      { label: "\u{1F5B1}\uFE0F #terminalSelection", title: "Selected terminal output", get: (cr) => c4(cr.terminalSelection) },
      { label: "\u{1F4CB} #clipboard", title: "Clipboard contents", get: (cr) => c4(cr.clipboard) },
      { label: "\u{1F4DD} #changes", title: "Uncommitted git changes", get: (cr) => c4(cr.changes) },
      { label: "\u{1F4E4} #outputPanel", title: "Output panel contents", get: (cr) => c4(cr.outputPanel) },
      { label: "\u26A0\uFE0F #problemsPanel", title: "Problems panel contents", get: (cr) => c4(cr.problemsPanel) },
      { label: "\u{1F500} #pr", title: "Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary", get: (cr) => c4(cr.pullRequest) },
      { label: "\u{1F4F7} Images", title: "Pasted images and vision context detected in session logs", get: (cr) => c4(cr.byKind["copilot.image"]) },
      { label: "\u{1F4CB} Prompt Files", title: ".github/prompts/ prompt file uses detected in session logs", get: (cr) => c4(cr.byKind["promptFile"]) },
      { label: "\u{1F4D0} Code Lines", title: "Total lines of code referenced via #file: range selections", get: (cr) => c4(cr.codeContextLines) },
      { label: "\u{1F3AF} Custom Prompts", title: "Custom /command prompt uses detected in session logs", get: (cr) => c4(cr.byKind["prompt"]) },
      { label: "\u{1F4CB} Copilot Instructions", title: "copilot-instructions.md file references detected in session logs", get: (cr) => cr.copilotInstructions },
      { label: "\u{1F916} Agents.md", title: "agents.md file references detected in session logs", get: (cr) => cr.agentsMd }
    ];
    const r6 = stats.last30Days.contextReferences;
    const m2 = stats.month.contextReferences;
    const lm = stats.lastMonth.contextReferences;
    const t4 = stats.today.contextReferences;
    const rows = descriptors.map((d3) => ({
      label: d3.label,
      title: d3.title,
      last30: d3.get(r6),
      month: d3.get(m2),
      lastMonth: d3.get(lm),
      today: d3.get(t4)
    }));
    return renderContextRefTable(rows, {
      last30: last30DaysTotalRefs,
      month: getTotalContextRefs(m2),
      lastMonth: getTotalContextRefs(lm),
      today: todayTotalRefs
    });
  }
  function buildContextRefsHtml(stats, todayTotalRefs, last30DaysTotalRefs) {
    const byKindHtml = Object.keys(stats.last30Days.contextReferences.byKind).length > 0 ? `
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(stats.last30Days.contextReferences.byKind).sort(([, a3], [, b3]) => b3 - a3).slice(0, 5).map(([kind, count]) => `<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${escapeHtml(kind)}:</span> ${count}</div>`).join("")}
			</div>
		</div>
	` : "";
    const byPathHtml = Object.keys(stats.last30Days.contextReferences.byPath).length > 0 ? `
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(stats.last30Days.contextReferences.byPath).sort(([, a3], [, b3]) => b3 - a3).slice(0, 10).map(([path, count]) => `<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${count}\xD7</span> ${escapeHtml(path)}</div>`).join("")}
			</div>
		</div>
	` : "";
    return `
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${buildContextRefCardsHtml(stats, todayTotalRefs, last30DaysTotalRefs)}
			${byKindHtml}
			${byPathHtml}
		</div>`;
  }
  function buildUnknownMcpToolsBannerHtml(stats) {
    const unknownTools = getUnknownMcpTools(stats);
    if (unknownTools.length === 0) {
      return "";
    }
    const issueUrl = createMcpToolIssueUrl(unknownTools);
    const toolListHtml = unknownTools.map((tool) => {
      const todayCount = (stats.today.toolCalls.byTool[tool] || 0) + (stats.today.mcpTools.byTool[tool] || 0);
      const last30Count = (stats.last30Days.toolCalls.byTool[tool] || 0) + (stats.last30Days.mcpTools.byTool[tool] || 0);
      const monthCount = (stats.month.toolCalls.byTool[tool] || 0) + (stats.month.mcpTools.byTool[tool] || 0);
      const countParts = [];
      if (todayCount > 0) {
        countParts.push(`${todayCount} today`);
      }
      if (last30Count > todayCount) {
        countParts.push(`${last30Count} in the last 30d`);
      }
      if (monthCount > last30Count) {
        countParts.push(`${monthCount} this month`);
      }
      const countHtml = countParts.length > 0 ? `<span style="color:var(--text-muted);"> (${countParts.join(" | ")})</span>` : "";
      const suppressBtn = `<button data-suppress-tool="${escapeHtml(tool)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${escapeHtml(tool)}">\u{1F507}</button>`;
      return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${escapeHtml(tool)}${countHtml}${suppressBtn}</span>`;
    }).join(" ");
    return `
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${toolListHtml}
			</div>
			<a href="${escapeHtml(issueUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`;
  }
  var EFFICIENCY_PERIOD_TO_DATA_KEY = {
    today: "today",
    last30: "last30Days",
    currentMonth: "month"
  };
  var efficiencySelectedPeriod = "last30";
  var efficiencyPeriod = "last30Days";
  var efficiencySortColumn = "calls";
  var efficiencySortDirection = "desc";
  var cachedModelEfficiency = {};
  var efficiencyFilterLowUsage = true;
  function formatUnitCost(value) {
    if (value === null) {
      return "\u2014";
    }
    return value >= 0.01 ? formatCost(value) : `$${value.toFixed(2)}`;
  }
  function formatRatePercent(value) {
    return value === null ? "\u2014" : formatPercent(value * 100);
  }
  function formatPerEdit(value) {
    return value === null ? "\u2014" : formatFixed(value, 2);
  }
  var EFFICIENCY_COLUMN_DEFS = [
    { sortKey: "model", label: "Model", title: "Model identifier", align: "left", sortValue: (r6) => r6.model, render: (r6) => escapeHtml(getModelDisplayName(r6.model)) },
    { sortKey: "calls", label: "Turns", title: "User-request turns attributed to this model", align: "right", sortValue: (r6) => r6.counters.calls, render: (r6) => r6.counters.calls > 0 ? formatNumber(r6.counters.calls) : "\u2014" },
    { sortKey: "editTurns", label: "Edit turns", title: "Turns containing at least one file-edit tool call", align: "right", sortValue: (r6) => r6.counters.editTurns, render: (r6) => r6.counters.calls > 0 ? formatNumber(r6.counters.editTurns) : "\u2014" },
    { sortKey: "oneShotRate", label: "One-shot edit rate", title: "Share of edit turns completed without retries or self-corrections", align: "right", sortValue: (r6) => r6.rates.oneShotRate, render: (r6) => formatRatePercent(r6.rates.oneShotRate) },
    { sortKey: "retryRate", label: "Retries/edit", title: "Average immediate same-file retries per edit turn", align: "right", sortValue: (r6) => r6.rates.retryRate, render: (r6) => formatPerEdit(r6.rates.retryRate) },
    { sortKey: "selfCorrectionRate", label: "Self-corr/edit", title: "Average self-corrections (re-edits after other tool calls) per edit turn", align: "right", sortValue: (r6) => r6.rates.selfCorrectionRate, render: (r6) => formatPerEdit(r6.rates.selfCorrectionRate) },
    { sortKey: "costPerCall", label: "Cost/turn", title: "Average estimated cost per turn (provider rates)", align: "right", sortValue: (r6) => r6.rates.costPerCall, render: (r6) => formatUnitCost(r6.rates.costPerCall) },
    { sortKey: "costPerEdit", label: "Cost/edit", title: "Average estimated cost per edit turn (provider rates)", align: "right", sortValue: (r6) => r6.rates.costPerEdit, render: (r6) => formatUnitCost(r6.rates.costPerEdit) },
    { sortKey: "outputTokensPerCall", label: "Out tok/turn", title: "Average output tokens per turn", align: "right", sortValue: (r6) => r6.rates.outputTokensPerCall, render: (r6) => r6.rates.outputTokensPerCall === null ? "\u2014" : formatCompact(Math.round(r6.rates.outputTokensPerCall)) },
    { sortKey: "cacheHitRate", label: "Cache hit", title: "Cache-read share of input tokens", align: "right", sortValue: (r6) => r6.rates.cacheHitRate, render: (r6) => formatRatePercent(r6.rates.cacheHitRate) }
  ];
  function getEfficiencySortIndicator(column) {
    if (efficiencySortColumn !== column) {
      return "";
    }
    return efficiencySortDirection === "desc" ? " \u25BC" : " \u25B2";
  }
  function buildEfficiencyRows(usage) {
    const rows = Object.entries(usage).map(([model, counters]) => ({ model, counters, rates: deriveModelEfficiencyRates(counters) }));
    const col = EFFICIENCY_COLUMN_DEFS.find((c4) => c4.sortKey === efficiencySortColumn) ?? EFFICIENCY_COLUMN_DEFS[1];
    rows.sort((a3, b3) => {
      const av = col.sortValue(a3);
      const bv = col.sortValue(b3);
      if (av === null && bv === null) {
        return 0;
      }
      if (av === null) {
        return 1;
      }
      if (bv === null) {
        return -1;
      }
      const cmp = typeof av === "string" || typeof bv === "string" ? String(av).localeCompare(String(bv)) : av - bv;
      return efficiencySortDirection === "desc" ? -cmp : cmp;
    });
    return rows;
  }
  function buildModelEfficiencyTableHtml() {
    const usage = cachedModelEfficiency[efficiencyPeriod];
    if (!usage || Object.keys(usage).length === 0) {
      return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No per-model efficiency data recorded for this period yet.</div>';
    }
    let rows = buildEfficiencyRows(usage);
    let hiddenNote = "";
    if (efficiencyFilterLowUsage) {
      const threshold = computeEfficiencyLowUsageThreshold(usage);
      if (threshold !== null) {
        const before = rows.length;
        rows = rows.filter((r6) => r6.counters.calls > threshold);
        const hiddenCount = before - rows.length;
        if (hiddenCount > 0) {
          hiddenNote = `<div style="color:var(--text-secondary); font-size:11px; padding:4px 8px 2px;">${hiddenCount} model${hiddenCount === 1 ? "" : "s"} hidden (\u2264${threshold} turn${threshold === 1 ? "" : "s"})</div>`;
        }
      }
    }
    const tableRows = rows.map((r6) => {
      const cells = EFFICIENCY_COLUMN_DEFS.map((col) => {
        const alignStyle = col.align === "right" ? "text-align:right;" : "";
        return `<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${alignStyle}">${col.render(r6)}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    const headerCells = EFFICIENCY_COLUMN_DEFS.map((col) => {
      const alignStyle = col.align === "right" ? " text-align:right;" : "";
      return `<th class="sortable" data-eff-sort="${col.sortKey}" title="${col.title}" style="padding:6px 8px; cursor:pointer;${alignStyle}">${col.label}${getEfficiencySortIndicator(col.sortKey)}</th>`;
    }).join("");
    return `
		<div style="overflow-x:auto;">
		<table style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">${headerCells}</tr>
			</thead>
			<tbody>${tableRows}</tbody>
		</table>
		</div>
		${hiddenNote}`;
  }
  function buildModelEfficiencySectionHtml(stats) {
    cachedModelEfficiency = {
      today: stats.today.modelEfficiency,
      last30Days: stats.last30Days.modelEfficiency,
      month: stats.month.modelEfficiency
    };
    return `
		<div class="section" id="section-model-efficiency">
			<div class="section-title"><span>\u{1F3AF}</span><span>Model Efficiency</span></div>
			<div class="section-subtitle">Compare models on quality and efficiency, not just cost \u2014 one-shot edit rate, retries, self-corrections, per-turn cost, and cache hit rate. Retry/self-correction detection needs structured tool-call data, so some editors show token metrics only.</div>
			<div id="model-efficiency-controls" style="display:flex; gap:6px; flex-wrap:wrap; margin:8px 0;"><span id="model-efficiency-period-selector"></span></div>
			<div style="margin:2px 0 8px 0;">
				<label style="display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--text-secondary); cursor:pointer;" title="Shows only models above the 25th-percentile turn count (Q1). Uncheck to see all models.">
					<input type="checkbox" id="eff-filter-low-usage"${efficiencyFilterLowUsage ? " checked" : ""} style="cursor:pointer;">
					Hide low-usage models
				</label>
			</div>
			<div id="model-efficiency-table">${buildModelEfficiencyTableHtml()}</div>
		</div>`;
  }
  function renderModelEfficiencyPeriodSelector() {
    const wrapper = document.getElementById("model-efficiency-period-selector");
    if (!wrapper) {
      return;
    }
    wrapper.replaceChildren();
    const { wrapper: selectorWrapper } = createPeriodSelector({
      selected: efficiencySelectedPeriod,
      disabled: ["last7", "allTime"],
      disabledTitle: "Not available for model efficiency",
      label: "",
      onChange: (value) => {
        const dataKey = EFFICIENCY_PERIOD_TO_DATA_KEY[value];
        if (!dataKey) {
          return;
        }
        efficiencySelectedPeriod = value;
        efficiencyPeriod = dataKey;
        rerenderModelEfficiencyTable();
      }
    });
    wrapper.append(selectorWrapper);
  }
  function rerenderModelEfficiencyTable() {
    const table = document.getElementById("model-efficiency-table");
    if (table) {
      setHtml(table, buildModelEfficiencyTableHtml());
    }
  }
  function handleEfficiencySortClick(th) {
    const col = th.getAttribute("data-eff-sort");
    if (!col) {
      return;
    }
    if (efficiencySortColumn === col) {
      efficiencySortDirection = efficiencySortDirection === "desc" ? "asc" : "desc";
    } else {
      efficiencySortColumn = col;
      efficiencySortDirection = col === "model" ? "asc" : "desc";
    }
    rerenderModelEfficiencyTable();
  }
  function setupModelEfficiencySection() {
    const section = document.getElementById("section-model-efficiency");
    if (!section) {
      return;
    }
    section.addEventListener("click", (e7) => {
      const target = e7.target;
      const th = target.closest("th[data-eff-sort]");
      if (th) {
        handleEfficiencySortClick(th);
      }
    });
    section.addEventListener("change", (e7) => {
      const target = e7.target;
      if (target.id === "eff-filter-low-usage") {
        efficiencyFilterLowUsage = target.checked;
        rerenderModelEfficiencyTable();
      }
    });
  }
  function buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels) {
    return `
		<div id="tab-panel-tools" class="tab-panel"${activeTab !== "tools" ? ' style="display:none"' : ""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions${hideAutomaticToolCalls ? ' (automatic tool calls hidden \u2014 disable "Hide Automatic Tool Calls" in settings to show them)' : ""}</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.today.toolCalls.total)}</div>
						${renderToolsTable(unionFill(stats.today.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.last30Days.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.last30Days.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.month.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.month.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
						</div>
					</div>
				</div>
			</div>

			${buildMcpToolsSectionHtml(stats, allMcpToolKeys, allMcpServerKeys)}
			${buildCurationSectionHtml(currentCurationAnalysis ?? stats.curationAnalysis)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${renderMultiModelPeriod("\u{1F4C5} Today", stats.today.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
					${renderMultiModelPeriod("\u{1F4C6} Last 30 Days", stats.last30Days.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
					${renderMultiModelPeriod("\u{1F4C5} Previous Month", stats.month.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
				</div>
			</div>
		</div>`;
  }
  function assignUsageRootHtml(root, build) {
    try {
      setHtml(root, build());
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[usage-webview] renderLayout failed: ${message}`);
      setHtml(root, `<div style="padding: 32px; text-align: center; font-size: 14px;">
			<div style="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;">\u26A0\uFE0F Something went wrong rendering the dashboard.</div>
			${createRefreshButton().outerHTML}
		</div>`);
      return false;
    }
  }
  function syncRenderLayoutState(stats) {
    const matrix = stats.customizationMatrix ?? initialData?.customizationMatrix ?? null;
    hygieneMatrixState = matrix ?? null;
    if (!hygieneMatrixState || hygieneMatrixState.workspaces.length === 0) {
      selectedRepoPath = null;
    }
    if (Array.isArray(stats.currentWorkspacePaths)) {
      currentWorkspacePaths = stats.currentWorkspacePaths;
    }
    if (stats.curationAnalysis) {
      currentCurationAnalysis = stats.curationAnalysis;
      traceCuration("renderLayout.curation.cached", {
        availableTools: currentCurationAnalysis.availableTools.length,
        unusedTools: currentCurationAnalysis.unusedTools.length
      });
    } else {
      traceCurationOnce("render-no-curation-update", "renderLayout.curation.notProvidedInUpdate");
    }
    return matrix;
  }
  function renderLayout(stats) {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const matrix = syncRenderLayoutState(stats);
    const customizationHtml = safeSectionHtml("Workspace Customization", () => buildCustomizationSectionHtml(matrix));
    const allKeys = buildUsageAllKeysSets(stats);
    const todayTotalRefs = getTotalContextRefs(stats.today.contextReferences);
    const last30DaysTotalRefs = getTotalContextRefs(stats.last30Days.contextReferences);
    const thinkingEffortHtml = safeSectionHtml("Thinking Effort", () => buildThinkingEffortSectionHtml(stats));
    const sessionsSummaryHtml = `
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${formatNumber(stats.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${formatNumber(stats.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${formatNumber(stats.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${formatNumber(stats.lastMonth.sessions)}</div></div>
			</div>
		</div>`;
    const rendered = assignUsageRootHtml(root, () => buildUsageRootHtml(
      stats,
      customizationHtml,
      "",
      thinkingEffortHtml,
      sessionsSummaryHtml,
      todayTotalRefs,
      last30DaysTotalRefs,
      allKeys.allToolKeys,
      allKeys.allMcpToolKeys,
      allKeys.allMcpServerKeys,
      allKeys.allHighCostModels,
      allKeys.allLowCostModels,
      allKeys.allMediumCostModels,
      allKeys.allUnknownModels
    ));
    if (!rendered) {
      return;
    }
    wireNavigationButtons();
    wireAboutInfoToggle();
    wireRepositoryButtons();
    wireCurationButtons();
    renderRepositoryHygienePanels();
    setupTabs();
    setupModelEfficiencySection();
    renderModelEfficiencyPeriodSelector();
    renderSessionsLookbackSelector();
    setupWorktreesHandlers();
    wireCopyButtons();
    currentInsights = stats.insights ?? [];
    wireInsightCardButtons();
  }
  function wireAboutInfoToggle() {
    const toggle = document.getElementById("about-info-toggle");
    const body = document.getElementById("about-info-body");
    if (!toggle || !body) {
      return;
    }
    const chevron = toggle.querySelector(".info-box-chevron");
    const applyToggle = () => {
      aboutCollapsed = !aboutCollapsed;
      body.style.display = aboutCollapsed ? "none" : "";
      toggle.setAttribute("aria-expanded", String(!aboutCollapsed));
      if (chevron) {
        chevron.textContent = aboutCollapsed ? "\u25B8" : "\u25BE";
      }
      vscode.setState({ ...vscode.getState() ?? {}, aboutCollapsed });
    };
    toggle.addEventListener("click", applyToggle);
    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applyToggle();
      }
    });
  }
  function wireNavigationButtons() {
    document.getElementById("btn-refresh")?.addEventListener("click", () => {
      vscode.postMessage({ command: "refresh" });
    });
    document.getElementById("btn-details")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDetails" });
    });
    document.getElementById("btn-chart")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showChart" });
    });
    document.getElementById("btn-diagnostics")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDiagnostics" });
    });
    document.getElementById("btn-maturity")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showMaturity" });
    });
    document.getElementById("btn-dashboard")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDashboard" });
    });
    document.getElementById("btn-environmental")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showEnvironmental" });
    });
    wireExtensionPointButtons(vscode);
  }
  function wireRepositoryButtons() {
    document.getElementById("btn-analyse-repo")?.addEventListener("click", () => {
      const btn = document.getElementById("btn-analyse-repo");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Analyzing...";
      }
      vscode.postMessage({ command: "analyseRepository" });
    });
    document.getElementById("btn-analyse-all")?.addEventListener("click", () => {
      const btn = document.getElementById("btn-analyse-all");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Analyzing All...";
      }
      isBatchAnalysisInProgress = true;
      isSwitchingRepository = true;
      selectedRepoPath = null;
      renderRepositoryHygienePanels();
      vscode.postMessage({ command: "analyseAllRepositories" });
    });
    document.getElementById("repo-list-pane")?.addEventListener("click", (e7) => {
      const target = e7.target;
      const actionButton = target.closest(".btn-repo-action");
      if (!actionButton) {
        return;
      }
      const workspacePath = actionButton.getAttribute("data-workspace-path");
      const action = actionButton.getAttribute("data-action");
      if (!workspacePath || !action) {
        return;
      }
      if (action === "details") {
        selectedRepoPath = workspacePath;
        isSwitchingRepository = false;
        renderRepositoryHygienePanels();
        return;
      }
      if (action === "analyze") {
        actionButton.disabled = true;
        actionButton.textContent = "Analyzing...";
        isBatchAnalysisInProgress = false;
        vscode.postMessage({ command: "analyseRepository", workspacePath });
      }
    });
    document.getElementById("repo-details-pane")?.addEventListener("click", (e7) => {
      const target = e7.target;
      if (target.closest("#btn-switch-repository")) {
        isSwitchingRepository = true;
        renderRepositoryHygienePanels();
      }
    });
  }
  function wireCopyButtons() {
    Array.from(document.getElementsByClassName("cf-copy")).forEach((el2) => {
      el2.addEventListener("click", (ev) => {
        const target = ev.currentTarget;
        const path = target.getAttribute("data-path") || "";
        if (navigator.clipboard && path) {
          navigator.clipboard.writeText(path).then(() => {
            target.textContent = "Copied";
            setTimeout(() => {
              target.textContent = "Copy";
            }, 1200);
          }).catch(() => {
            vscode.postMessage({ command: "copyFailed", path });
          });
        }
      });
    });
  }
  function handleUpdateStats(message) {
    clearLoadingTimeout();
    if (message.data?.locale) {
      setFormatLocale(message.data.locale);
    }
    if (typeof message.data?.use24HourTime === "boolean") {
      use24HourTime = message.data.use24HourTime;
    }
    if (typeof message.data?.hideAutomaticToolCalls === "boolean") {
      hideAutomaticToolCalls = message.data.hideAutomaticToolCalls;
    }
    const sanitized = sanitizeStats(message.data);
    if (sanitized) {
      _ulLoadingActive = false;
      for (const key of Object.keys(recentSessionsCache)) {
        delete recentSessionsCache[key];
      }
      renderLayout(sanitized);
      setupSessionsTableSort();
      renderRepositoryHygienePanels();
      if (repoPrStatsData) {
        updateReposPrPanel(repoPrStatsData);
      }
      if (agentSessionsData) {
        updateAgentSessionsPanel(agentSessionsData);
      }
    } else {
      traceCurationOnce("update-invalid-sanitized", "handleUpdateStats.sanitizeReturnedNull");
      showLoadError("Received invalid data from the extension. Try refreshing.");
    }
  }
  function handleToolSuppressed(toolName) {
    if (!toolName) {
      return;
    }
    const section = document.getElementById("unknown-mcp-tools-section");
    if (!section) {
      return;
    }
    section.querySelectorAll("button[data-suppress-tool]").forEach((btn) => {
      if (btn.getAttribute("data-suppress-tool") === toolName) {
        btn.closest("span")?.remove();
      }
    });
    if (section.querySelectorAll("button[data-suppress-tool]").length === 0) {
      section.remove();
    }
  }
  function handleHighlightUnknownTools() {
    activeTab = "tools";
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === "tools");
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.style.display = "none";
    });
    const toolsPanel = document.getElementById("tab-panel-tools");
    if (toolsPanel) {
      toolsPanel.style.display = "block";
    }
    const el2 = document.getElementById("unknown-mcp-tools-section");
    if (el2) {
      el2.scrollIntoView({ behavior: "smooth", block: "center" });
      el2.style.transition = "box-shadow 0.3s ease";
      el2.style.boxShadow = "0 0 0 3px var(--vscode-focusBorder)";
      setTimeout(() => {
        el2.style.boxShadow = "";
      }, 2e3);
    }
  }
  function handleRepoPrStatsLoaded(data) {
    repoPrStatsData = sanitizeRepoPrStatsData(data);
    if (!repoPrStatsData.authenticated) {
      repoPrStatsLoaded = false;
    }
    updateReposPrPanel(repoPrStatsData);
  }
  function handleAgentSessionsLoaded(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    agentSessionsData = sanitizeAgentSessionsData(data);
    if (!agentSessionsData.authenticated) {
      agentSessionsLoaded = false;
    }
    updateAgentSessionsPanel(agentSessionsData);
  }
  function handleUpdateInsights(rawInsights) {
    if (!Array.isArray(rawInsights)) {
      return;
    }
    const sanitized = sanitizeInsights(rawInsights);
    refreshInsightsPanel(sanitized);
  }
  function handleLoadingStateMessage(message) {
    switch (message.command) {
      case "usageLoadingProgress":
        updateUsageLoadingProgress(message);
        return true;
      case "usageRefreshing":
        clearLoadingTimeout();
        _ulLastStepIdx = 0;
        renderUsageLoadingState("Refreshing Usage Analysis");
        return true;
      case "updateStatsError":
        clearLoadingTimeout();
        showLoadError("Failed to calculate usage analysis. Check the Output panel for details.");
        return true;
    }
    return false;
  }
  function handleExtensionMessage(message) {
    if (handleLoadingStateMessage(message)) {
      return;
    }
    switch (message.command) {
      case "repoAnalysisResults":
        displayRepoAnalysisResults(message.data, message.workspacePath);
        break;
      case "repoAnalysisError":
        displayRepoAnalysisError(message.error, message.workspacePath);
        break;
      case "repoAnalysisBatchComplete":
        handleBatchAnalysisComplete();
        break;
      case "updateStats":
        handleUpdateStats(message);
        break;
      case "toolSuppressed":
        handleToolSuppressed(message.toolName);
        break;
      case "highlightUnknownTools":
        handleHighlightUnknownTools();
        break;
      case "repoPrStatsLoaded":
        handleRepoPrStatsLoaded(message.data);
        break;
      case "repoPrStatsProgress":
        updateProgressPanel("#repos-pr-content", "repos-pr-progress", "Fetching PRs\u2026", message.done, message.total);
        break;
      case "agentSessionsLoaded":
        handleAgentSessionsLoaded(message.data);
        break;
      case "recentSessionsLoaded":
        handleRecentSessionsLoaded(message);
        break;
      case "agentSessionsProgress":
        updateProgressPanel("#agent-sessions-content", "agent-sessions-progress", "Fetching agent sessions\u2026", message.done, message.total);
        break;
      case "updateInsights":
        handleUpdateInsights(message.insights);
        break;
      case "switchTab":
        handleSwitchTab(message);
        break;
      default:
        handleWorktreeMessage(message);
        break;
    }
  }
  function handleSwitchTab(message) {
    const btn = document.querySelector(`.tab-button[data-tab="${String(message.tab)}"]`);
    btn?.click();
    if (message.anchor) {
      const anchor = document.getElementById(String(message.anchor));
      if (anchor) {
        setTimeout(() => anchor.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    }
  }
  registerMessageHandler((message) => {
    handleExtensionMessage(message);
  });
  function getWorkspaceName(workspacePath) {
    const workspace = hygieneMatrixState?.workspaces.find((ws) => ws.workspacePath === workspacePath);
    return workspace?.workspaceName || workspacePath;
  }
  function getScoreLabel(workspacePath) {
    const record = repoAnalysisState.get(workspacePath);
    if (record?.data?.summary) {
      const percentage = toFiniteNumber(record.data.summary.percentage);
      return `${Math.round(percentage)}%`;
    }
    if (record?.error) {
      return "Error";
    }
    return "\u2014";
  }
  function toFiniteNumber(value) {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  var REPO_DOCS_LINKS = {
    "git-repo": "https://docs.github.com/en/get-started/using-git/about-git",
    "gitignore": "https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files",
    "env-example": "https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",
    "editorconfig": "https://editorconfig.org/",
    "linter": "https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",
    "formatter": "https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide",
    "type-safety": "https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries",
    "commit-messages": "https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits",
    "conventional-commits": "https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets",
    "ci-config": "https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",
    "scripts": "https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs",
    "task-runner": "https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",
    "devcontainer": "https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",
    "dockerfile": "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry",
    "version-pinning": "https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",
    "license": "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"
  };
  var REPO_CATEGORY_LABELS = {
    versionControl: "\u{1F504} Version Control",
    codeQuality: "\u2728 Code Quality",
    cicd: "\u{1F680} CI/CD",
    environment: "\u{1F527} Environment",
    documentation: "\u{1F4DA} Documentation"
  };
  function buildScoreHeaderElement(summary) {
    const header = el("div");
    header.setAttribute("style", "display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");
    const title = el("div");
    title.setAttribute("style", "font-size: 14px; font-weight: 600; color: var(--text-primary);");
    title.textContent = "\u{1F4CA} Repository Hygiene Score";
    const score = el("div");
    score.setAttribute("style", "font-size: 24px; font-weight: 700; color: var(--link-color);");
    score.textContent = `${Math.round(toFiniteNumber(summary.percentage))}%`;
    header.append(title, score);
    return header;
  }
  function buildStatsGridElement(summary) {
    const statsGrid = el("div");
    statsGrid.setAttribute("style", "display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");
    const statCards = [
      { count: summary.passedChecks, label: "Passed", cardStyle: "text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;", countStyle: "font-size: 18px; font-weight: 600; color: var(--success-fg);" },
      { count: summary.warningChecks, label: "Warnings", cardStyle: "text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;", countStyle: "font-size: 18px; font-weight: 600; color: var(--warning-fg);" },
      { count: summary.failedChecks, label: "Failed", cardStyle: "text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;", countStyle: "font-size: 18px; font-weight: 600; color: #ef4444;" }
    ];
    for (const statCard of statCards) {
      const card = el("div");
      card.setAttribute("style", statCard.cardStyle);
      const count = el("div");
      count.setAttribute("style", statCard.countStyle);
      count.textContent = String(toFiniteNumber(statCard.count));
      const label = el("div");
      label.setAttribute("style", "font-size: 10px; color: var(--text-secondary);");
      label.textContent = statCard.label;
      card.append(count, label);
      statsGrid.appendChild(card);
    }
    return statsGrid;
  }
  function resolveCheckStatus(check) {
    const status = check?.status === "pass" || check?.status === "warning" ? check.status : "fail";
    const emoji = status === "pass" ? "\u2705" : status === "warning" ? "\u26A0\uFE0F" : "\u274C";
    const color = status === "pass" ? "#22c55e" : status === "warning" ? "#f59e0b" : "#ef4444";
    return { status, emoji, color };
  }
  function buildCheckContentElement(check, statusColor) {
    const content = el("div");
    content.setAttribute("style", "flex: 1;");
    const checkLabel = el("div");
    checkLabel.setAttribute("style", `font-size: 12px; font-weight: 600; color: ${statusColor};`);
    checkLabel.textContent = typeof check?.label === "string" ? check.label : "";
    const checkDetail = el("div");
    checkDetail.setAttribute("style", "font-size: 11px; color: var(--text-secondary); margin-top: 2px;");
    checkDetail.textContent = typeof check?.detail === "string" ? check.detail : "";
    content.append(checkLabel, checkDetail);
    if (typeof check?.hint === "string" && check.hint.length > 0) {
      const hint = el("div");
      hint.setAttribute("style", "font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;");
      hint.textContent = `\u{1F4A1} ${check.hint}`;
      content.appendChild(hint);
    }
    const docUrl = REPO_DOCS_LINKS[typeof check?.id === "string" ? check.id : ""];
    if (docUrl) {
      const docLink = el("a");
      docLink.setAttribute("href", docUrl);
      docLink.setAttribute("style", "font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;");
      docLink.setAttribute("title", "View official documentation");
      docLink.textContent = "\u{1F4D6} View documentation";
      content.appendChild(docLink);
    }
    return content;
  }
  function buildCheckRowElement(check) {
    const { emoji, color } = resolveCheckStatus(check);
    const checkRow = el("div");
    checkRow.setAttribute("style", "padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");
    const icon = el("span");
    icon.setAttribute("style", "flex-shrink: 0; padding-top: 1px;");
    setHtml(icon, statusBadgeHtml(emoji));
    const weight = el("span");
    weight.setAttribute("style", "font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;");
    weight.textContent = `+${toFiniteNumber(check?.weight)}`;
    checkRow.append(icon, buildCheckContentElement(check, color), weight);
    return checkRow;
  }
  function buildCategorySectionElement(categoryId, categoryChecks, summary) {
    const section = el("div");
    section.setAttribute("style", "margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");
    const sectionHeader = el("div");
    sectionHeader.setAttribute("style", "padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");
    const categoryName = el("span");
    categoryName.setAttribute("style", "font-size: 12px; font-weight: 600; color: var(--text-primary);");
    categoryName.textContent = REPO_CATEGORY_LABELS[categoryId] || categoryId;
    const categorySummary = summary?.categories?.[categoryId];
    const categoryPct = el("span");
    categoryPct.setAttribute("style", "font-size: 11px; color: var(--link-color); font-weight: 600;");
    categoryPct.textContent = `${Math.round(toFiniteNumber(categorySummary?.percentage))}%`;
    sectionHeader.append(categoryName, categoryPct);
    section.appendChild(sectionHeader);
    for (const check of categoryChecks) {
      section.appendChild(buildCheckRowElement(check));
    }
    return section;
  }
  function buildRecommendationsSectionElement(recommendations) {
    const section = el("div");
    section.setAttribute("style", "margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");
    const hdr = el("div");
    hdr.setAttribute("style", "padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");
    const hdrTitle = el("span");
    hdrTitle.setAttribute("style", "font-size: 12px; font-weight: 600; color: var(--text-primary);");
    hdrTitle.textContent = "\u{1F4A1} Top Recommendations";
    hdr.appendChild(hdrTitle);
    section.appendChild(hdr);
    for (const rec of recommendations.slice(0, 5)) {
      const priority = rec?.priority === "high" || rec?.priority === "medium" ? rec.priority : "low";
      const priorityColor = priority === "high" ? "#ef4444" : priority === "medium" ? "#f59e0b" : "#60a5fa";
      const row = el("div");
      row.setAttribute("style", "padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");
      const priorityLabel = el("span");
      priorityLabel.setAttribute("style", `font-size: 10px; font-weight: 600; color: ${priorityColor}; min-width: 50px;`);
      priorityLabel.textContent = String(priority).toUpperCase();
      const content = el("div");
      content.setAttribute("style", "flex: 1;");
      const action = el("div");
      action.setAttribute("style", "font-size: 11px; color: var(--text-primary);");
      action.textContent = typeof rec?.action === "string" ? rec.action : "";
      const impact = el("div");
      impact.setAttribute("style", "font-size: 10px; color: var(--text-muted); margin-top: 2px;");
      impact.textContent = typeof rec?.impact === "string" ? rec.impact : "";
      content.append(action, impact);
      const weight = el("span");
      weight.setAttribute("style", "font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;");
      weight.textContent = `+${toFiniteNumber(rec?.weight)}`;
      row.append(priorityLabel, content, weight);
      section.appendChild(row);
    }
    return section;
  }
  function buildCopilotSectionElement(failedChecks, workspacePath) {
    const copilotSection = el("div");
    copilotSection.setAttribute("style", "margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");
    const copilotText = el("div");
    copilotText.setAttribute("style", "font-size: 11px; color: var(--text-secondary); flex: 1;");
    copilotText.textContent = "Let Copilot help you fix the identified issues in this repository.";
    const copilotBtn = document.createElement("vscode-button");
    copilotBtn.setAttribute("style", "min-width: 180px;");
    copilotBtn.textContent = "\u{1F916} Ask Copilot to Improve";
    copilotBtn.addEventListener("click", () => {
      const failedLines = failedChecks.map((c4) => `- ${c4.label}: ${c4.detail || ""}${c4.hint ? ` (${c4.hint})` : ""}`).join("\n");
      const prompt = `Please help me improve this repository by addressing the following best practice issues:

${failedLines}

For each issue, please provide specific steps or code changes to fix it.`;
      const isRepoOpen = !workspacePath || currentWorkspacePaths.some((p3) => p3.toLowerCase() === workspacePath.toLowerCase());
      if (isRepoOpen) {
        vscode.postMessage({ command: "openCopilotChatWithPrompt", prompt });
      } else {
        const repoFolderName = workspacePath.split(/[/\\]/).filter(Boolean).pop() ?? workspacePath;
        copilotSection.replaceChildren();
        copilotSection.setAttribute("style", "margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");
        const instructions = el("div");
        instructions.setAttribute("style", "font-size: 11px; color: var(--warning-fg);");
        instructions.textContent = `\u26A0\uFE0F Open "${repoFolderName}" in VS Code first, then paste this prompt into Copilot Chat:`;
        const promptBox = el("pre");
        promptBox.setAttribute("style", "font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;");
        promptBox.textContent = prompt;
        const copyBtn = document.createElement("vscode-button");
        copyBtn.setAttribute("appearance", "secondary");
        copyBtn.textContent = "\u{1F4CB} Copy prompt";
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(prompt).then(() => {
            copyBtn.textContent = "\u2705 Copied!";
            setTimeout(() => {
              copyBtn.textContent = "\u{1F4CB} Copy prompt";
            }, 2e3);
          });
        });
        copilotSection.append(instructions, promptBox, copyBtn);
      }
    });
    copilotSection.append(copilotText, copilotBtn);
    return copilotSection;
  }
  function buildRepoAnalysisBodyElement(data, workspacePath) {
    const summary = data?.summary || {};
    const checks = Array.isArray(data?.checks) ? data.checks : [];
    const recommendations = Array.isArray(data?.recommendations) ? [...data.recommendations] : [];
    const container = el("div");
    container.appendChild(buildScoreHeaderElement(summary));
    container.appendChild(buildStatsGridElement(summary));
    const scoreSummary = el("div");
    scoreSummary.setAttribute("style", "font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;");
    scoreSummary.textContent = `Score: ${toFiniteNumber(summary.totalScore)} / ${toFiniteNumber(summary.maxScore)} points`;
    container.appendChild(scoreSummary);
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    recommendations.sort((a3, b3) => (priorityOrder[a3?.priority] || 99) - (priorityOrder[b3?.priority] || 99));
    const categories = {};
    for (const check of checks) {
      const categoryId = typeof check?.category === "string" && check.category.length > 0 ? check.category : "other";
      if (!categories[categoryId]) {
        categories[categoryId] = [];
      }
      categories[categoryId].push(check);
    }
    for (const [categoryId, categoryChecks] of Object.entries(categories)) {
      container.appendChild(buildCategorySectionElement(categoryId, categoryChecks, summary));
    }
    if (recommendations.length > 0) {
      container.appendChild(buildRecommendationsSectionElement(recommendations));
    }
    const failedChecks = checks.filter((c4) => c4?.status === "fail" || c4?.status === "warning");
    if (failedChecks.length > 0) {
      container.appendChild(buildCopilotSectionElement(failedChecks, workspacePath));
    }
    return container;
  }
  function renderRepoListPane(listPane, visibleWorkspaces, hasSelectedRepository) {
    const colStyles = {
      sessions: "width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",
      interactions: "width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",
      score: "width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"
    };
    const headerHtml = `
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${colStyles.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${colStyles.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${colStyles.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 80px; flex-shrink: 0;"></div>
		</div>
	`;
    setHtml(listPane, headerHtml + visibleWorkspaces.map((ws, idx) => {
      const record = repoAnalysisState.get(ws.workspacePath);
      const hasResult = !!record?.data?.summary;
      const scoreLabel = getScoreLabel(ws.workspacePath);
      const buttonLabel = hasResult ? "Details" : "Analyze";
      const buttonAction = hasResult ? "details" : "analyze";
      const isCurrentSelection = selectedRepoPath === ws.workspacePath && hasSelectedRepository;
      const sessions = Number(ws.sessionCount) || 0;
      const interactions = Number(ws.interactionCount) || 0;
      return `
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${idx < visibleWorkspaces.length - 1 ? "1px solid var(--border-subtle)" : "none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(ws.workspacePath)}">
						${escapeHtml(ws.workspaceName)}
					</div>
				</div>
				<div style="${colStyles.sessions}">${sessions}</div>
				<div style="${colStyles.interactions}">${interactions}</div>
				<div style="${colStyles.score}">${escapeHtml(scoreLabel)}</div>
				<vscode-button class="btn-repo-action" data-action="${buttonAction}" data-workspace-path="${escapeHtml(ws.workspacePath)}" ${isCurrentSelection ? 'disabled="true"' : ""} style="min-width: 80px; flex-shrink: 0;">
					${buttonLabel}
				</vscode-button>
			</div>
		`;
    }).join(""));
  }
  function renderRepoDetailSuccess(detailsPane, record, workspaceName) {
    detailsPane.replaceChildren();
    const card = el("div", "repo-details-card");
    card.setAttribute("style", "padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");
    const header = el("div", "repo-details-card-header");
    header.setAttribute("style", "display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");
    const label = el("div");
    label.setAttribute("style", "font-size: 12px; color: var(--text-secondary);");
    label.textContent = "Repository: ";
    const repoName = el("span");
    repoName.setAttribute("style", "color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;");
    repoName.textContent = workspaceName;
    label.appendChild(repoName);
    const switchButton = document.createElement("vscode-button");
    switchButton.id = "btn-switch-repository";
    switchButton.setAttribute("style", "min-width: 120px;");
    switchButton.textContent = "Switch Repository";
    header.append(label, switchButton);
    card.append(header, buildRepoAnalysisBodyElement(record.data, selectedRepoPath ?? void 0));
    detailsPane.appendChild(card);
  }
  function renderRepositoryHygienePanels() {
    const listPane = document.getElementById("repo-list-pane");
    const listContainer = document.getElementById("repo-list-pane-container");
    const detailsPane = document.getElementById("repo-details-pane");
    const detailsContainer = document.getElementById("repo-details-pane-container");
    if (!listPane || !listContainer || !detailsPane || !detailsContainer || !hygieneMatrixState) {
      return;
    }
    const hasSelectedRepository = !!selectedRepoPath && !isSwitchingRepository;
    const visibleWorkspaces = hasSelectedRepository ? hygieneMatrixState.workspaces.filter((ws) => ws.workspacePath === selectedRepoPath) : hygieneMatrixState.workspaces;
    listContainer.classList.remove("repo-hygiene-pane-collapsed");
    detailsContainer.classList.toggle("repo-hygiene-pane-collapsed", !hasSelectedRepository);
    renderRepoListPane(listPane, visibleWorkspaces, hasSelectedRepository);
    if (!hasSelectedRepository || !selectedRepoPath) {
      detailsPane.replaceChildren();
      return;
    }
    const workspaceName = getWorkspaceName(selectedRepoPath);
    const record = repoAnalysisState.get(selectedRepoPath);
    if (record?.data) {
      renderRepoDetailSuccess(detailsPane, record, workspaceName);
      return;
    }
    if (record?.error) {
      setHtml(detailsPane, `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${escapeHtml(workspaceName)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(record.error)}</div>
			</div>
		`);
      return;
    }
    setHtml(detailsPane, `
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${escapeHtml(workspaceName)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`);
  }
  function displayRepoAnalysisResults(data, workspacePath) {
    if (workspacePath) {
      repoAnalysisState.set(workspacePath, { data, error: void 0 });
      if (!isBatchAnalysisInProgress) {
        selectedRepoPath = workspacePath;
        isSwitchingRepository = false;
      }
      renderRepositoryHygienePanels();
      return;
    }
    const btn = document.getElementById("btn-analyse-repo");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Analyze Repo for Best Practices";
    }
    const resultsHost = document.getElementById("repo-analysis-results");
    if (resultsHost) {
      resultsHost.replaceChildren();
      const card = el("div", "repo-analysis-card");
      card.setAttribute("style", "padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;");
      card.appendChild(buildRepoAnalysisBodyElement(data, workspacePath));
      resultsHost.appendChild(card);
    }
  }
  function displayRepoAnalysisError(error, workspacePath) {
    if (workspacePath) {
      repoAnalysisState.set(workspacePath, { data: void 0, error });
      if (!isBatchAnalysisInProgress) {
        selectedRepoPath = workspacePath;
        isSwitchingRepository = false;
      }
      renderRepositoryHygienePanels();
      return;
    }
    const btn = document.getElementById("btn-analyse-repo");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Analyze Repo for Best Practices";
    }
    const resultsHost = document.getElementById("repo-analysis-results");
    if (resultsHost) {
      setHtml(resultsHost, `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(error)}</div>
			</div>
		`);
    }
  }
  function handleBatchAnalysisComplete() {
    isBatchAnalysisInProgress = false;
    isSwitchingRepository = true;
    selectedRepoPath = null;
    renderRepositoryHygienePanels();
    const btn = document.getElementById("btn-analyse-all");
    if (btn) {
      btn.disabled = false;
      const matrix = initialData?.customizationMatrix;
      const count = matrix?.workspaces?.length || 0;
      btn.textContent = `Analyze All Repositories (${count})`;
    }
  }
  async function bootstrap() {
    await Promise.resolve().then(() => (init_vscode_button2(), vscode_button_exports));
    if (!initialData) {
      renderUsageLoadingState("Loading usage analysis...");
      loadingTimeoutId = setTimeout(() => {
        const r6 = document.getElementById("root");
        if (r6 && r6.querySelector("#usage-loading-card")) {
          const hint = document.createElement("div");
          hint.style.cssText = "padding: 32px; text-align: center; font-size: 14px;";
          const msg = document.createElement("div");
          msg.style.cssText = "color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;";
          msg.textContent = "\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.";
          hint.append(msg, createRefreshButton());
          r6.textContent = "";
          r6.append(hint);
        }
      }, 3e4);
      return;
    }
    setFormatLocale(initialData.locale);
    use24HourTime = initialData.use24HourTime !== false;
    hideAutomaticToolCalls = initialData.hideAutomaticToolCalls !== false;
    const savedColumns = initialData.sessionColumnSettings?.enabledColumns;
    if (Array.isArray(savedColumns)) {
      const valid = savedColumns.filter((c4) => ALL_SESSION_COLUMN_IDS.includes(c4));
      enabledSessionColumns = new Set(valid);
    }
    renderLayout(initialData);
    setupSessionsTableSort();
    document.addEventListener("click", (event) => {
      const target = event.target;
      const toolName = target.getAttribute("data-suppress-tool");
      if (toolName) {
        handleToolSuppressed(toolName);
        vscode.postMessage({ command: "suppressUnknownTool", toolName });
      }
    });
  }
  void bootstrap().catch((err) => {
    console.error("[Usage Analysis] Bootstrap failed:", err);
    const root = document.getElementById("root");
    if (root) {
      const container = document.createElement("div");
      container.style.cssText = "padding: 32px; text-align: center; font-size: 14px;";
      const msg = document.createElement("div");
      msg.style.cssText = "color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;";
      msg.textContent = "Failed to initialize usage analysis. Please try refreshing.";
      container.append(msg, createRefreshButton());
      root.textContent = "";
      root.append(container);
    }
  });
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
//# sourceMappingURL=usage.js.map
