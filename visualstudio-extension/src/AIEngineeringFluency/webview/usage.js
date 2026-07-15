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

  // src/webview/shared/contextRefUtils.ts
  function getTotalContextRefs(refs) {
    return refs.file + refs.selection + refs.implicitSelection + refs.symbol + refs.codebase + refs.workspace + refs.terminal + refs.vscode + refs.copilotInstructions + refs.agentsMd + (refs.terminalLastCommand || 0) + (refs.terminalSelection || 0) + (refs.clipboard || 0) + (refs.changes || 0) + (refs.outputPanel || 0) + (refs.problemsPanel || 0) + (refs.pullRequest || 0);
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
  var currentLocale;
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
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
  var theme_default = '/**\n * Shared theme variables for all webview panels\n * Uses VS Code theme tokens for automatic light/dark theme support.\n *\n * The "INDUSTRIAL REDUX" high-contrast styling (stark outlines, uppercase\n * navigation, neon stage colors, monospace body) is intentionally scoped to\n * the high-contrast themes only. Normal light/dark themes keep the native\n * VS Code look so the navigation bar and typography stay unobtrusive.\n */\n\n:root {\n	/* VS Code base colors */\n	--bg-primary: var(--vscode-editor-background);\n	--bg-secondary: var(--vscode-sideBar-background);\n	--bg-tertiary: var(--vscode-editorWidget-background);\n	--text-primary: var(--vscode-editor-foreground);\n	--text-secondary: var(--vscode-descriptionForeground);\n	--text-muted: var(--vscode-disabledForeground);\n	--border-color: var(--vscode-panel-border);\n	--border-subtle: var(--vscode-widget-border);\n\n	/* Button colors */\n	--button-bg: var(--vscode-button-background);\n	--button-fg: var(--vscode-button-foreground);\n	--button-hover-bg: var(--vscode-button-hoverBackground);\n	--button-secondary-bg: var(--vscode-button-secondaryBackground);\n	--button-secondary-fg: var(--vscode-button-secondaryForeground);\n	--button-secondary-hover-bg: var(--vscode-button-secondaryHoverBackground);\n\n	/* Input colors */\n	--input-bg: var(--vscode-input-background);\n	--input-fg: var(--vscode-input-foreground);\n	--input-border: var(--vscode-input-border);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-list-hoverBackground);\n	--list-active-bg: var(--vscode-list-activeSelectionBackground);\n	--list-active-fg: var(--vscode-list-activeSelectionForeground);\n	--list-inactive-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Alternating row colors for better readability */\n	--row-alternate-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-badge-background);\n	--badge-fg: var(--vscode-badge-foreground);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-focusBorder);\n\n	/* Link colors */\n	--link-color: var(--vscode-textLink-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Status colors */\n	--error-fg: var(--vscode-errorForeground);\n	--warning-fg: var(--vscode-editorWarning-foreground);\n	--success-fg: var(--vscode-terminal-ansiGreen);\n\n	/* Stage accent colors \u2014 dark theme defaults */\n	--stage-1-color: #93c5fd;\n	--stage-2-color: #a78bfa;\n	--stage-3-color: #3b82f6;\n	--stage-4-color: #22d3ee;\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: rgba(128, 128, 128, 0.2);\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-disabledForeground);\n\n	/* Shadow for cards */\n	--shadow-color: rgb(0, 0, 0, 0.16);\n	--shadow-hover-color: rgb(0, 0, 0, 0.24);\n}\n\n/* Light theme adjustments */\nbody[data-vscode-theme-kind="vscode-light"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--shadow-color: rgb(0, 0, 0, 0.08);\n	--shadow-hover-color: rgb(0, 0, 0, 0.12);\n	/* Stage colors darkened for readable contrast on light backgrounds */\n	--stage-1-color: #1d6fa4;\n	--stage-2-color: #7c3aed;\n	--stage-3-color: #2563eb;\n	--stage-4-color: #0891b2;\n	--stage-pip-empty-bg: rgba(0, 0, 0, 0.12);\n}\n\n/* Default navigation button row \u2014 native look for normal themes */\n.button-row {\n	display: flex;\n	gap: 10px;\n	flex-wrap: wrap;\n}\n\n/* ------------------------------------------------------------------ *\n * High contrast themes \u2014 INDUSTRIAL REDUX\n * Stark outlines, uppercase navigation, neon stage colors, monospace.\n * Everything below is deliberately gated to the high-contrast theme\n * kinds so normal light/dark themes are unaffected.\n * ------------------------------------------------------------------ */\n\nbody[data-vscode-theme-kind="vscode-high-contrast"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	/* Base colors \u2014 forced to stark contrasts */\n	--bg-secondary: transparent;\n	--bg-tertiary: transparent;\n	--text-secondary: var(--vscode-foreground);\n	--text-muted: var(--vscode-descriptionForeground);\n	--border-color: var(--vscode-contrastBorder);\n	--border-subtle: var(--vscode-contrastBorder);\n\n	/* Button colors \u2014 high contrast, no subtle grays */\n	--button-bg: var(--vscode-foreground);\n	--button-fg: var(--vscode-editor-background);\n	--button-hover-bg: var(--vscode-editor-background);\n	--button-secondary-bg: transparent;\n	--button-secondary-fg: var(--vscode-foreground);\n	--button-secondary-hover-bg: var(--vscode-foreground);\n\n	/* Input colors */\n	--input-bg: transparent;\n	--input-fg: var(--vscode-foreground);\n	--input-border: var(--vscode-foreground);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-editor-background);\n	--list-active-bg: var(--vscode-foreground);\n	--list-active-fg: var(--vscode-editor-background);\n	--list-inactive-bg: transparent;\n\n	/* Alternating row colors dropped for harsh outlines */\n	--row-alternate-bg: transparent;\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-foreground);\n	--badge-fg: var(--vscode-editor-background);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-foreground);\n\n	/* Link colors */\n	--link-color: var(--vscode-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: transparent;\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-descriptionForeground);\n\n	/* Shadow for cards \u2014 HARD shadows */\n	--shadow-color: var(--vscode-foreground);\n	--shadow-hover-color: var(--vscode-foreground);\n\n	/* Monospace body for the industrial identity */\n	font-family: var(--vscode-editor-font-family), "JetBrains Mono", "Fira Code", monospace;\n}\n\n/* High contrast dark \u2014 stark neon stage colors */\nbody[data-vscode-theme-kind="vscode-high-contrast"] {\n	--stage-1-color: #ff00ff; /* Magenta */\n	--stage-2-color: #00ffff; /* Cyan */\n	--stage-3-color: #ffff00; /* Yellow */\n	--stage-4-color: #00ff00; /* Green */\n}\n\n/* High contrast light \u2014 darkened neon for readable contrast */\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--stage-1-color: #d100d1;\n	--stage-2-color: #008787;\n	--stage-3-color: #b5b500;\n	--stage-4-color: #00a300;\n}\n\n/* Industrial navigation tab bar (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row {\n	display: flex;\n	gap: 0; /* Force flush blocks */\n	flex-wrap: wrap; /* Let it wrap so no scrollbars appear */\n	border: 3px solid var(--vscode-foreground);\n	background-color: var(--vscode-editor-background);\n	margin-bottom: 2rem;\n	box-shadow: 4px 4px 0 var(--vscode-panel-border);\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > * {\n	flex-grow: 1; /* Stretch to fill */\n	flex-shrink: 1;\n	flex-basis: auto;\n	text-align: center;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button {\n	border-radius: 0 !important;\n	border: none !important;\n	border-right: 2px solid var(--vscode-foreground) !important;\n	font-family: inherit;\n	font-weight: 900;\n	text-transform: uppercase;\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n	padding: 12px 16px !important;\n	cursor: pointer;\n	box-shadow: none !important;\n	letter-spacing: 1px;\n	transition: transform 0.1s, background-color 0.1s;\n	height: auto !important; /* Override vscode-button strict heights */\n	border-bottom: 3px solid transparent !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button::part(control) {\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover::part(control) {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:last-child {\n	border-right: none !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button:hover {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n	border-bottom: 3px solid var(--vscode-terminal-ansiCyan) !important; /* Cyber/Industrial accent indicator */\n}\n\n/* Industrial header + title (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .header,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .header {\n	display: flex;\n	justify-content: space-between;\n	align-items: flex-end;\n	margin-bottom: 2rem;\n	flex-wrap: nowrap;\n	white-space: nowrap;\n	gap: 15px;\n	border-bottom: 4px solid var(--vscode-foreground);\n	padding-bottom: 1rem;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .title,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .title {\n	font-size: 28px;\n	font-weight: 900;\n	text-transform: uppercase;\n	letter-spacing: 2px;\n	color: var(--vscode-foreground);\n	text-shadow: 2px 2px 0 var(--vscode-panel-border);\n	white-space: nowrap;\n}\n';

  // src/webview/usage/styles.css
  var styles_default = "* {\n	margin: 0;\n	padding: 0;\n	box-sizing: border-box;\n}\n\nbody {\n	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n	background: var(--bg-primary);\n	color: var(--text-primary);\n	padding: 16px;\n	line-height: 1.5;\n	min-width: 320px;\n}\n\n.container {\n	background: var(--bg-secondary);\n	border: 1px solid var(--border-color);\n	border-radius: 10px;\n	padding: 16px;\n	box-shadow: 0 4px 10px var(--shadow-color);\n	max-width: 1200px;\n	margin: 0 auto;\n}\n\n.header {\n	display: flex;\n	justify-content: space-between;\n	align-items: center;\n	gap: 12px;\n	margin-bottom: 14px;\n	padding-bottom: 4px;\n}\n\n.header-left {\n	display: flex;\n	align-items: center;\n	gap: 8px;\n}\n\n.header-icon {\n	font-size: 20px;\n}\n\n.header-title {\n	font-size: 16px;\n	font-weight: 700;\n	color: var(--text-primary);\n	letter-spacing: 0.2px;\n}\n\n\n\n.section {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 8px;\n	padding: 12px;\n	margin-bottom: 16px;\n	box-shadow: 0 2px 6px var(--shadow-color);\n}\n\n.section-title {\n	font-size: 14px;\n	font-weight: 700;\n	color: var(--text-primary);\n	margin-bottom: 10px;\n	display: flex;\n	align-items: center;\n	gap: 6px;\n	letter-spacing: 0.2px;\n}\n\n.section-subtitle {\n	font-size: 12px;\n	color: var(--text-secondary);\n	margin-bottom: 12px;\n}\n\n.stats-grid {\n	display: grid;\n	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n	gap: 12px;\n	margin-bottom: 16px;\n}\n\n.stat-card {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	box-shadow: 0 2px 4px var(--shadow-color);\n}\n\n.stat-card[title] {\n	cursor: help;\n}\n\n.stat-label {\n	font-size: 11px;\n	color: var(--text-secondary);\n	margin-bottom: 4px;\n}\n\n.stat-value {\n	font-size: 20px;\n	font-weight: 700;\n	color: var(--text-primary);\n}\n\n.ctx-ref-table-wrap {\n	margin-bottom: 16px;\n	overflow-x: auto;\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	box-shadow: 0 2px 4px var(--shadow-color);\n}\n\n.ctx-ref-table {\n	width: 100%;\n	border-collapse: collapse;\n	font-size: 13px;\n}\n\n.ctx-ref-table th,\n.ctx-ref-table td {\n	padding: 8px 14px;\n	text-align: left;\n	border-bottom: 1px solid var(--border-subtle);\n}\n\n.ctx-ref-table thead th {\n	background: var(--bg-tertiary);\n	color: var(--text-secondary);\n	font-size: 11px;\n	font-weight: 600;\n	text-transform: uppercase;\n	letter-spacing: 0.4px;\n	position: sticky;\n	top: 0;\n}\n\n.ctx-ref-table tbody tr:hover {\n	background: var(--list-hover-bg);\n}\n\n.ctx-ref-table .ctx-ref-name {\n	color: var(--text-primary);\n	white-space: nowrap;\n}\n\n.ctx-ref-table .ctx-ref-num {\n	text-align: right;\n	font-variant-numeric: tabular-nums;\n	font-weight: 600;\n	color: var(--text-primary);\n	width: 110px;\n}\n\n.ctx-ref-table .ctx-ref-zero {\n	color: var(--text-muted);\n	font-weight: 400;\n}\n\n.ctx-ref-table .ctx-ref-today-active {\n	color: var(--link-color);\n}\n\n.ctx-ref-table tfoot .ctx-ref-total td {\n	background: var(--list-active-bg);\n	color: var(--list-active-fg);\n	font-weight: 700;\n	border-bottom: none;\n	border-top: 2px solid var(--border-color);\n}\n\n.ctx-ref-table tfoot .ctx-ref-total .ctx-ref-num {\n	color: var(--list-active-fg);\n}\n\n.ctx-ref-table .ctx-ref-spark {\n	width: 68px;\n	text-align: center;\n	padding: 4px 8px;\n	vertical-align: middle;\n	color: var(--text-primary);\n}\n\n\n.bar-chart {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	margin-bottom: 12px;\n}.bar-item {\n	margin-bottom: 8px;\n}\n\n.bar-label {\n	display: flex;\n	justify-content: space-between;\n	font-size: 12px;\n	margin-bottom: 4px;\n	color: var(--text-primary);\n}\n\n.bar-track {\n	background: var(--row-alternate-bg);\n	height: 8px;\n	border-radius: 4px;\n	overflow: hidden;\n}\n\n.bar-fill {\n	height: 100%;\n	border-radius: 4px;\n	transition: width 0.3s ease;\n}\n\n.list {\n	background: var(--list-hover-bg);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px 16px;\n}\n\n.list ul {\n	list-style: none;\n	padding: 0;\n}\n\n.list li {\n	padding: 4px 0;\n	font-size: 13px;\n}\n\n/* Customization matrix styles */\n.customization-matrix-container {\n	overflow-x: auto;\n	max-width: 100%;\n}\n\n.customization-matrix {\n	width: 100%;\n	border-collapse: collapse;\n	font-size: 12px;\n	color: var(--text-primary);\n}\n\n.customization-matrix th {\n	background: var(--list-hover-bg);\n	color: var(--text-primary);\n	font-weight: 600;\n	font-size: 11px;\n	white-space: nowrap;\n}\n\n.customization-matrix td {\n	background: var(--bg-tertiary);\n}\n\n.customization-matrix tbody tr:hover td {\n	background: var(--list-hover-bg);\n}\n\n.stale-warning {\n	color: var(--warning-fg);\n	font-weight: 600;\n}\n\n.two-column {\n	display: grid;\n	grid-template-columns: 1fr 1fr;\n	gap: 16px;\n}\n\n.three-column {\n	display: grid;\n	grid-template-columns: 1fr 1fr 1fr;\n	gap: 16px;\n	align-items: stretch;\n}\n\n.three-column > div {\n	display: flex;\n	flex-direction: column;\n}\n\n.three-column > div > .list {\n	flex: 1;\n}\n\n.info-box {\n	background: var(--bg-tertiary);\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	padding: 12px;\n	margin-bottom: 16px;\n	font-size: 12px;\n	color: var(--text-secondary);\n}\n\n.info-box-title {\n	font-weight: 600;\n	color: var(--text-primary);\n	margin-bottom: 6px;\n}\n\n\n.repo-hygiene-results {\n	margin-top: 4px;\n}\n\n.repo-analysis-card {\n	margin: 0;\n}\n\n.repo-hygiene-pane {\n	border: 1px solid var(--border-color);\n	border-radius: 6px;\n	margin-bottom: 12px;\n	background: var(--bg-secondary);\n}\n\n.repo-hygiene-pane-header {\n	padding: 8px 12px;\n	font-size: 12px;\n	font-weight: 600;\n	color: var(--text-primary);\n	border-bottom: 1px solid var(--border-color);\n	background: var(--list-hover-bg);\n}\n\n.repo-hygiene-pane-body {\n	display: block;\n}\n\n.repo-hygiene-pane-collapsed {\n	display: none;\n}\n\n.repo-hygiene-pane-collapsed .repo-hygiene-pane-body {\n	display: none;\n}\n\n.btn-repo-action[disabled] {\n	opacity: 0.7;\n}\n\n.footer {\n	margin-top: 6px;\n	padding-top: 12px;\n	border-top: 1px solid var(--border-subtle);\n	text-align: left;\n	font-size: 11px;\n	color: var(--text-muted);\n}\n\n@media (width <= 768px) {\n	.two-column {\n		grid-template-columns: 1fr;\n	}\n\n	.three-column {\n		grid-template-columns: 1fr;\n	}\n}\n\n\n.tab-bar {\ndisplay: flex;\ngap: 2px;\nmargin-bottom: 16px;\nborder-bottom: 2px solid var(--border-color);\npadding-bottom: 0;\nflex-wrap: wrap;\n}\n\n.tab-button {\nbackground: transparent;\nborder: none;\nborder-bottom: 3px solid transparent;\ncolor: var(--text-secondary);\npadding: 8px 16px;\nfont-size: 12px;\nfont-weight: 600;\ncursor: pointer;\nborder-radius: 4px 4px 0 0;\ntransition: all 0.15s ease;\nwhite-space: nowrap;\nmargin-bottom: -2px;\nfont-family: inherit;\n}\n\n.tab-button:hover {\ncolor: var(--text-primary);\nbackground: var(--list-hover-bg);\n}\n\n.tab-button.active {\ncolor: var(--text-primary);\nborder-bottom-color: var(--link-color);\nbackground: var(--bg-tertiary);\n}\n\n.auto-badge {\n	display: inline-block;\n	margin-left: 6px;\n	padding: 1px 5px;\n	font-size: 10px;\n	border-radius: 3px;\n	border: 1px solid var(--text-primary);\n	color: var(--text-primary);\n	background: transparent;\n	vertical-align: middle;\n	line-height: 1.4;\n}\n\n/* Sortable table headers */\n.sessions-table th.sortable {\n	cursor: pointer;\n	user-select: none;\n	transition: background 0.1s ease, color 0.1s ease;\n}\n\n.sessions-table th.sortable:hover {\n	background: var(--list-hover-bg);\n	color: var(--link-color);\n}\n\n.sessions-table tr:hover td {\n	background: var(--list-hover-bg);\n}\n";

  // src/webview/shared/messageHandler.ts
  function registerMessageHandler(handler) {
    window.addEventListener("message", (event) => {
      handler(event.data);
    });
  }

  // src/webview/shared/modelUtils.ts
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

  // src/utils/toolUtils.ts
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
    root.innerHTML = `${USAGE_LOADING_CSS}
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
</div>`;
  }
  function _ulSetDone(id) {
    const el2 = document.getElementById(id);
    if (!el2) {
      return;
    }
    el2.className = "ul-step ul-done";
    const ico = el2.querySelector(".ul-ico");
    if (ico) {
      ico.innerHTML = '<span class="ul-pop">\u2713</span>';
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
      ico.innerHTML = '<span class="ul-spin">\u21BB</span>';
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
    icon.innerHTML = statusBadgeHtml("\u274C", "Error");
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
    return TOOL_NAME_MAP[id] ?? TOOL_NAME_MAP[id.toLowerCase()] ?? resolveGuidMcpToolName(id) ?? id;
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
    return Array.from(allTools).filter((tool) => !TOOL_NAME_MAP?.[tool] && !TOOL_NAME_MAP?.[tool.toLowerCase()] && !isGuidMcpTool(tool) && !suppressed.has(tool)).sort();
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
  function renderToolsTable(byTool, limit = 10, nameResolver = lookupToolName) {
    const sortedTools = Object.entries(byTool).sort(([, a3], [, b3]) => b3 - a3).slice(0, limit);
    if (sortedTools.length === 0) {
      return '<div style="color: var(--text-muted);">No tools used yet</div>';
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
  var sessionSortColumn = "interactions";
  var sessionSortDirection = "desc";
  var cachedTodaySessions = [];
  var use24HourTime = true;
  function getSessionSortIndicator(column) {
    if (sessionSortColumn !== column) {
      return "";
    }
    return sessionSortDirection === "desc" ? " \u25BC" : " \u25B2";
  }
  function sortTodaySessions(sessions) {
    return [...sessions].sort((a3, b3) => {
      let cmp = 0;
      switch (sessionSortColumn) {
        case "title":
          cmp = (a3.title || "").localeCompare(b3.title || "");
          break;
        case "editor":
          cmp = (a3.editor || "").localeCompare(b3.editor || "");
          break;
        case "lastActivity":
          cmp = (a3.lastActivity || "").localeCompare(b3.lastActivity || "");
          break;
        default:
          cmp = a3[sessionSortColumn] - b3[sessionSortColumn];
          break;
      }
      return sessionSortDirection === "desc" ? -cmp : cmp;
    });
  }
  function renderTodaySessionsTable(sessions) {
    cachedTodaySessions = sessions;
    if (!sessions || sessions.length === 0) {
      return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No sessions recorded today yet.</div>';
    }
    return `<div id="sessions-table-container">${buildSessionsTableHtml(sessions)}</div>`;
  }
  function buildSessionsTableHtml(sessions) {
    const sorted = sortTodaySessions(sessions);
    const rows = sorted.map((s4, idx) => {
      const title = escapeHtml(s4.title || "Untitled session");
      const filePath = escapeHtml(s4.filePath || "");
      const models = s4.models.map((m2) => escapeHtml(getModelDisplayName(m2))).join(", ") || "\u2014";
      const editor = escapeHtml(s4.editor || "unknown");
      const cost = s4.estimatedCost > 0 ? `$${s4.estimatedCost.toFixed(4)}` : "\u2014";
      const time = s4.lastActivity ? new Date(s4.lastActivity).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !use24HourTime }) : "\u2014";
      return `<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${idx + 1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${title}&quot;"><a href="#" class="session-title-link" data-file="${filePath}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${title}</a></td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.interactions)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.toolCalls)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.inputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.outputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.thinkingTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.cachedTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s4.totalTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${cost}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px;">${editor}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${models}">${models}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; white-space:nowrap; text-align:right;">${time}</td>
		</tr>`;
    }).join("");
    return `
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${getSessionSortIndicator("title")}</th>
					<th class="sortable" data-sort="interactions" style="padding:6px 8px; text-align:right;">Turns${getSessionSortIndicator("interactions")}</th>
					<th class="sortable" data-sort="toolCalls" style="padding:6px 8px; text-align:right;">Tools${getSessionSortIndicator("toolCalls")}</th>
					<th class="sortable" data-sort="inputTokens" style="padding:6px 8px; text-align:right;">Input${getSessionSortIndicator("inputTokens")}</th>
					<th class="sortable" data-sort="outputTokens" style="padding:6px 8px; text-align:right;">Output${getSessionSortIndicator("outputTokens")}</th>
					<th class="sortable" data-sort="thinkingTokens" style="padding:6px 8px; text-align:right;">Thinking${getSessionSortIndicator("thinkingTokens")}</th>
					<th class="sortable" data-sort="cachedTokens" style="padding:6px 8px; text-align:right;">Cached${getSessionSortIndicator("cachedTokens")}</th>
					<th class="sortable" data-sort="totalTokens" style="padding:6px 8px; text-align:right;">Total${getSessionSortIndicator("totalTokens")}</th>
					<th class="sortable" data-sort="estimatedCost" style="padding:6px 8px; text-align:right;">Cost${getSessionSortIndicator("estimatedCost")}</th>
					<th class="sortable" data-sort="editor" style="padding:6px 8px;">Editor${getSessionSortIndicator("editor")}</th>
					<th style="padding:6px 8px;">Models</th>
					<th class="sortable" data-sort="lastActivity" style="padding:6px 8px; text-align:right;">Last Active${getSessionSortIndicator("lastActivity")}</th>
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>
		</div>`;
  }
  function setupSessionsTableSort() {
    const container = document.getElementById("sessions-table-container");
    if (!container) {
      return;
    }
    container.addEventListener("click", (e7) => {
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
      container.innerHTML = buildSessionsTableHtml(cachedTodaySessions);
    });
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
      thinkingEffortUsage: p3.thinkingEffortUsage
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
      return sanitized;
    } catch (error) {
      traceCurationOnce("sanitize-error", "sanitizeStats.error", {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
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
  function updateReposPrPanel(data) {
    const container = document.querySelector("#repos-pr-content");
    if (!container) {
      return;
    }
    container.innerHTML = `
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${renderReposPrContent(data)}
	`;
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
    container.innerHTML = `
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${renderAgentSessionsContent(data)}
	`;
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
    const titleOnly = "\u{1F4A1} Insights";
    tabButton.innerHTML = titleOnly + badgeHtml;
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
    container.innerHTML = forYouSection + allSection;
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
				${buttonHtml("btn-refresh")}
				${buttonHtml("btn-details")}
				${buttonHtml("btn-chart")}
				${buttonHtml("btn-environmental")}
				${buttonHtml("btn-diagnostics")}
				${buttonHtml("btn-maturity")}
				${stats.backendConfigured ? buttonHtml("btn-dashboard") : ""}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title">\u{1F4CB} About This Dashboard</div>
				<div>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${activeTab === "activity" ? "active" : ""}" data-tab="activity">\u{1F4CA} My Activity</button>
				<button class="tab-button ${activeTab === "sessions" ? "active" : ""}" data-tab="sessions">\u{1F4CB} Today's Sessions</button>
				<button class="tab-button ${activeTab === "tools" ? "active" : ""}" data-tab="tools">\u{1F527} Tools &amp; Integrations</button>
				<button class="tab-button ${activeTab === "health" ? "active" : ""}" data-tab="health">\u{1F3D7}\uFE0F Workspace Health</button>
				<button class="tab-button ${activeTab === "repos" ? "active" : ""}" data-tab="repos">\u{1F916} Repository PRs</button>
				<button class="tab-button ${activeTab === "agent" ? "active" : ""}" data-tab="agent">\u{1F916} Cloud Agent</button>
				<button class="tab-button ${activeTab === "insights" ? "active" : ""}" data-tab="insights">\u{1F4A1} Insights${(stats.insights ?? []).filter((i6) => i6.status === "new").length > 0 ? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(stats.insights ?? []).filter((i6) => i6.status === "new").length}</span>` : ""}</button>
			</div>

			${buildSessionsTabPanelHtml(stats)}
			${buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs)}
			${buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels)}
			${buildHealthTabPanelHtml(customizationHtml, stats)}
			${buildReposAndAgentTabPanelsHtml()}
			${buildInsightsTabPanelHtml(stats.insights ?? [])}
			<div class="footer">
				Last updated: ${escapeHtml(new Date(stats.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`;
  }
  function buildSessionsTabPanelHtml(stats) {
    return `
		<div id="tab-panel-sessions" class="tab-panel"${activeTab !== "sessions" ? ' style="display:none"' : ""}>
			<div class="section">
				<div class="section-title"><span>\u{1F4CB}</span><span>Today's Sessions</span></div>
				<div class="section-subtitle">Individual session breakdown for today \u2014 sorted by number of interactions (most active first).</div>
				<div style="margin-top: 12px;">
					${renderTodaySessionsTable(stats.todaySessions || [])}
				</div>
			</div>
		</div>`;
  }
  function buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs) {
    const modelCostHtml = buildModelCostSectionHtml(stats);
    return `
		<div id="tab-panel-activity" class="tab-panel"${activeTab !== "activity" ? ' style="display:none"' : ""}>
			${sessionsSummaryHtml}
			<!-- Mode Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${renderModeBarChart(stats.today.modeUsage, "\u{1F4C5} Today")}
					${renderModeBarChart(stats.last30Days.modeUsage, "\u{1F4CA} Last 30 Days")}
				</div>
			</div>
			${buildContextRefsHtml(stats, todayTotalRefs, last30DaysTotalRefs)}
			${multiModelHtml}
			${modelCostHtml}
			${thinkingEffortHtml}
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
  function buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels) {
    return `
		<div id="tab-panel-tools" class="tab-panel"${activeTab !== "tools" ? ' style="display:none"' : ""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.today.toolCalls.total)}</div>
						${renderToolsTable(unionFill(stats.today.toolCalls.byTool, allToolKeys), 10)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.last30Days.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.last30Days.toolCalls.byTool, allToolKeys), 10)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.month.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.month.toolCalls.byTool, allToolKeys), 10)}
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
  function renderLayout(stats) {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
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
    const customizationHtml = buildCustomizationSectionHtml(matrix);
    const allKeys = buildUsageAllKeysSets(stats);
    const todayTotalRefs = getTotalContextRefs(stats.today.contextReferences);
    const last30DaysTotalRefs = getTotalContextRefs(stats.last30Days.contextReferences);
    const thinkingEffortHtml = buildThinkingEffortSectionHtml(stats);
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
    root.innerHTML = buildUsageRootHtml(
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
    );
    wireNavigationButtons();
    wireRepositoryButtons();
    wireCurationButtons();
    renderRepositoryHygienePanels();
    setupTabs();
    wireCopyButtons();
    currentInsights = stats.insights ?? [];
    wireInsightCardButtons();
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
    const sanitized = sanitizeStats(message.data);
    if (sanitized) {
      _ulLoadingActive = false;
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
      case "agentSessionsProgress":
        updateProgressPanel("#agent-sessions-content", "agent-sessions-progress", "Fetching agent sessions\u2026", message.done, message.total);
        break;
      case "updateInsights":
        handleUpdateInsights(message.insights);
        break;
      case "switchTab":
        handleSwitchTab(message);
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
    icon.innerHTML = statusBadgeHtml(emoji);
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
    listPane.innerHTML = headerHtml + visibleWorkspaces.map((ws, idx) => {
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
    }).join("");
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
      detailsPane.innerHTML = `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${escapeHtml(workspaceName)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(record.error)}</div>
			</div>
		`;
      return;
    }
    detailsPane.innerHTML = `
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${escapeHtml(workspaceName)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`;
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
      resultsHost.innerHTML = `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(error)}</div>
			</div>
		`;
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
