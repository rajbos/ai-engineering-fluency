"use strict";(()=>{var Wo=Object.defineProperty;var g=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var De=(e,t)=>{for(var o in t)Wo(e,o,{get:t[o],enumerable:!0})};var _t,Pt,te,Re,gt,Z,B,Be,ee,oe=g(()=>{_t=globalThis,Pt=_t.ShadowRoot&&(_t.ShadyCSS===void 0||_t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,te=Symbol(),Re=new WeakMap,gt=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(Pt&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=Re.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Re.set(o,t))}return t}toString(){return this.cssText}},Z=e=>new gt(typeof e=="string"?e:e+"",void 0,te),B=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,s,r)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[r+1],e[0]);return new gt(o,e,te)},Be=(e,t)=>{if(Pt)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),s=_t.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,e.appendChild(n)}},ee=Pt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return Z(o)})(e):e});var an,dn,cn,ln,un,pn,H,Ne,hn,gn,mt,bt,It,je,N,ft=g(()=>{oe();oe();({is:an,defineProperty:dn,getOwnPropertyDescriptor:cn,getOwnPropertyNames:ln,getOwnPropertySymbols:un,getPrototypeOf:pn}=Object),H=globalThis,Ne=H.trustedTypes,hn=Ne?Ne.emptyScript:"",gn=H.reactiveElementPolyfillSupport,mt=(e,t)=>e,bt={toAttribute(e,t){switch(t){case Boolean:e=e?hn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},It=(e,t)=>!an(e,t),je={attribute:!0,type:String,converter:bt,reflect:!1,useDefault:!1,hasChanged:It};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),H.litPropertyMetadata??(H.litPropertyMetadata=new WeakMap);N=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=je){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,o);s!==void 0&&dn(this.prototype,t,s)}}static getPropertyDescriptor(t,o,n){let{get:s,set:r}=cn(this.prototype,t)??{get(){return this[o]},set(a){this[o]=a}};return{get:s,set(a){let d=s?.call(this);r?.call(this,a),this.requestUpdate(t,d,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??je}static _$Ei(){if(this.hasOwnProperty(mt("elementProperties")))return;let t=pn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(mt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(mt("properties"))){let o=this.properties,n=[...ln(o),...un(o)];for(let s of n)this.createProperty(s,o[s])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)o.unshift(ee(s))}else t!==void 0&&o.push(ee(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Be(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:bt).toAttribute(o,n.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,o){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:bt;this._$Em=s;let d=a.fromAttribute(o,r.type);this[s]=d??this._$Ej?.get(s)??d,this._$Em=null}}requestUpdate(t,o,n,s=!1,r){if(t!==void 0){let a=this.constructor;if(s===!1&&(r=this[t]),n??(n=a.getPropertyOptions(t)),!((n.hasChanged??It)(r,o)||n.useDefault&&n.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:s,wrapped:r},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,a??o??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:a}=r,d=this[s];a!==!0||this._$AL.has(s)||d===void 0||this.C(s,void 0,r,d)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[mt("elementProperties")]=new Map,N[mt("finalized")]=new Map,gn?.({ReactiveElement:N}),(H.reactiveElementVersions??(H.reactiveElementVersions=[])).push("2.1.2")});function Xe(e,t){if(!ce(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Fe!==void 0?Fe.createHTML(t):t}function Q(e,t,o=e,n){if(t===_)return t;let s=n!==void 0?o._$Co?.[n]:o._$Cl,r=xt(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(e),s._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(t=Q(e,s._$AS(e,t.values),s,n)),t}var vt,He,Ot,Fe,qe,F,Ye,mn,q,kt,xt,ce,bn,ne,yt,Ge,Ve,z,Ke,ze,Je,le,O,Ds,Cs,_,k,We,W,fn,Tt,se,St,tt,re,ae,ie,de,yn,Ze,et=g(()=>{vt=globalThis,He=e=>e,Ot=vt.trustedTypes,Fe=Ot?Ot.createPolicy("lit-html",{createHTML:e=>e}):void 0,qe="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,Ye="?"+F,mn=`<${Ye}>`,q=document,kt=()=>q.createComment(""),xt=e=>e===null||typeof e!="object"&&typeof e!="function",ce=Array.isArray,bn=e=>ce(e)||typeof e?.[Symbol.iterator]=="function",ne=`[ 	
\f\r]`,yt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ge=/-->/g,Ve=/>/g,z=RegExp(`>|${ne}(?:([^\\s"'>=/]+)(${ne}*=${ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ke=/'/g,ze=/"/g,Je=/^(?:script|style|textarea|title)$/i,le=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),O=le(1),Ds=le(2),Cs=le(3),_=Symbol.for("lit-noChange"),k=Symbol.for("lit-nothing"),We=new WeakMap,W=q.createTreeWalker(q,129);fn=(e,t)=>{let o=e.length-1,n=[],s,r=t===2?"<svg>":t===3?"<math>":"",a=yt;for(let d=0;d<o;d++){let i=e[d],c,l,p=-1,u=0;for(;u<i.length&&(a.lastIndex=u,l=a.exec(i),l!==null);)u=a.lastIndex,a===yt?l[1]==="!--"?a=Ge:l[1]!==void 0?a=Ve:l[2]!==void 0?(Je.test(l[2])&&(s=RegExp("</"+l[2],"g")),a=z):l[3]!==void 0&&(a=z):a===z?l[0]===">"?(a=s??yt,p=-1):l[1]===void 0?p=-2:(p=a.lastIndex-l[2].length,c=l[1],a=l[3]===void 0?z:l[3]==='"'?ze:Ke):a===ze||a===Ke?a=z:a===Ge||a===Ve?a=yt:(a=z,s=void 0);let f=a===z&&e[d+1].startsWith("/>")?" ":"";r+=a===yt?i+mn:p>=0?(n.push(c),i.slice(0,p)+qe+i.slice(p)+F+f):i+F+(p===-2?d:f)}return[Xe(e,r+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},Tt=class e{constructor({strings:t,_$litType$:o},n){let s;this.parts=[];let r=0,a=0,d=t.length-1,i=this.parts,[c,l]=fn(t,o);if(this.el=e.createElement(c,n),W.currentNode=this.el.content,o===2||o===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=W.nextNode())!==null&&i.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(let p of s.getAttributeNames())if(p.endsWith(qe)){let u=l[a++],f=s.getAttribute(p).split(F),h=/([.?@])?(.*)/.exec(u);i.push({type:1,index:r,name:h[2],strings:f,ctor:h[1]==="."?re:h[1]==="?"?ae:h[1]==="@"?ie:tt}),s.removeAttribute(p)}else p.startsWith(F)&&(i.push({type:6,index:r}),s.removeAttribute(p));if(Je.test(s.tagName)){let p=s.textContent.split(F),u=p.length-1;if(u>0){s.textContent=Ot?Ot.emptyScript:"";for(let f=0;f<u;f++)s.append(p[f],kt()),W.nextNode(),i.push({type:2,index:++r});s.append(p[u],kt())}}}else if(s.nodeType===8)if(s.data===Ye)i.push({type:2,index:r});else{let p=-1;for(;(p=s.data.indexOf(F,p+1))!==-1;)i.push({type:7,index:r}),p+=F.length-1}r++}}static createElement(t,o){let n=q.createElement("template");return n.innerHTML=t,n}};se=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,s=(t?.creationScope??q).importNode(o,!0);W.currentNode=s;let r=W.nextNode(),a=0,d=0,i=n[0];for(;i!==void 0;){if(a===i.index){let c;i.type===2?c=new St(r,r.nextSibling,this,t):i.type===1?c=new i.ctor(r,i.name,i.strings,this,t):i.type===6&&(c=new de(r,this,t)),this._$AV.push(c),i=n[++d]}a!==i?.index&&(r=W.nextNode(),a++)}return W.currentNode=q,s}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},St=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,s){this.type=2,this._$AH=k,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=Q(this,t,o),xt(t)?t===k||t==null||t===""?(this._$AH!==k&&this._$AR(),this._$AH=k):t!==this._$AH&&t!==_&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):bn(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==k&&xt(this._$AH)?this._$AA.nextSibling.data=t:this.T(q.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=Tt.createElement(Xe(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let r=new se(s,this),a=r.u(this.options);r.p(o),this.T(a),this._$AH=r}}_$AC(t){let o=We.get(t.strings);return o===void 0&&We.set(t.strings,o=new Tt(t)),o}k(t){ce(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let r of t)s===o.length?o.push(n=new e(this.O(kt()),this.O(kt()),this,this.options)):n=o[s],n._$AI(r),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=He(t).nextSibling;He(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},tt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,s,r){this.type=1,this._$AH=k,this._$AN=void 0,this.element=t,this.name=o,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=k}_$AI(t,o=this,n,s){let r=this.strings,a=!1;if(r===void 0)t=Q(this,t,o,0),a=!xt(t)||t!==this._$AH&&t!==_,a&&(this._$AH=t);else{let d=t,i,c;for(t=r[0],i=0;i<r.length-1;i++)c=Q(this,d[n+i],o,i),c===_&&(c=this._$AH[i]),a||(a=!xt(c)||c!==this._$AH[i]),c===k?t=k:t!==k&&(t+=(c??"")+r[i+1]),this._$AH[i]=c}a&&!s&&this.j(t)}j(t){t===k?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},re=class extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===k?void 0:t}},ae=class extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==k)}},ie=class extends tt{constructor(t,o,n,s,r){super(t,o,n,s,r),this.type=5}_$AI(t,o=this){if((t=Q(this,t,o,0)??k)===_)return;let n=this._$AH,s=t===k&&n!==k||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,r=t!==k&&(n===k||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},de=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}},yn=vt.litHtmlPolyfillSupport;yn?.(Tt,St),(vt.litHtmlVersions??(vt.litHtmlVersions=[])).push("3.3.3");Ze=(e,t,o)=>{let n=o?.renderBefore??t,s=n._$litPart$;if(s===void 0){let r=o?.renderBefore??null;n._$litPart$=s=new St(t.insertBefore(kt(),r),r,void 0,o??{})}return s._$AI(e),s}});var Dt,G,vn,Qe=g(()=>{ft();ft();et();et();Dt=globalThis,G=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ze(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};G._$litElement$=!0,G.finalized=!0,Dt.litElementHydrateSupport?.({LitElement:G});vn=Dt.litElementPolyfillSupport;vn?.({LitElement:G});(Dt.litElementVersions??(Dt.litElementVersions=[])).push("4.2.2")});var to=g(()=>{});var L=g(()=>{ft();et();Qe();to()});var eo=g(()=>{});function y(e){return(t,o)=>typeof o=="object"?xn(e,t,o):((n,s,r)=>{let a=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),a?Object.getOwnPropertyDescriptor(s,r):void 0})(e,t,o)}var kn,xn,ue=g(()=>{ft();kn={attribute:!0,type:String,converter:bt,reflect:!1,hasChanged:It},xn=(e=kn,t,o)=>{let{kind:n,metadata:s}=o,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(o.name,e),n==="accessor"){let{name:a}=o;return{set(d){let i=t.get.call(this);t.set.call(this,d),this.requestUpdate(a,i,e,!0,d)},init(d){return d!==void 0&&this.C(a,void 0,e,d),d}}}if(n==="setter"){let{name:a}=o;return function(d){let i=this[a];t.call(this,d),this.requestUpdate(a,i,e,!0,d)}}throw Error("Unsupported decorator location: "+n)}});function pe(e){return y({...e,state:!0,attribute:!1})}var oo=g(()=>{ue();});var no=g(()=>{});var ot=g(()=>{});var so=g(()=>{ot();});var ro=g(()=>{ot();});var ao=g(()=>{ot();});var io=g(()=>{ot();});var co=g(()=>{ot();});var Rt=g(()=>{eo();ue();oo();no();so();ro();ao();io();co()});var Bt,Nt,nt,he=g(()=>{Bt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Nt=e=>(...t)=>({_$litDirective$:e,values:t}),nt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var jt,lo=g(()=>{et();he();jt=Nt(class extends nt{constructor(e){if(super(e),e.type!==Bt.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return _}})});var ge=g(()=>{lo()});var Ht,uo,po,V,st,Ft=g(()=>{L();Ht="2.5.1",uo="__vscodeElements_disableRegistryWarning__",po=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},V=class extends G{get version(){return Ht}warn(t){po(t,this)}},st=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(uo in window)return;let s=document.createElement(e)?.version,r="";s?s!==Ht?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${Ht}", while the other one is "${s}".`):r+=`is already registered by the same version of VSCode Elements (${Ht}).`:r+="is already registered by an unknown custom element handler class.",po(`The custom element "${e}" ${r}
To suppress this warning, set window.${uo} to true`)}});var rt,ho=g(()=>{et();rt=e=>e??k});var me=g(()=>{ho()});var go=g(()=>{he()});var be,mo,bo=g(()=>{L();go();be=class extends nt{constructor(t){if(super(t),this._prevProperties={},t.type!==Bt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?t.element.style.setProperty(n,s):t.element.style[n]=s,this._prevProperties[n]=s)}),_}render(t){return _}},mo=Nt(be)});var at,Gt=g(()=>{L();at=B`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var Tn,fo,yo=g(()=>{L();Gt();Tn=[at,B`
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
  `],fo=Tn});var Y,Ct,P,vo=g(()=>{L();Rt();ge();me();Ft();bo();yo();Y=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var d=e.length-1;d>=0;d--)(a=e[d])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},P=Ct=class extends V{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();Ct.stylesheetHref=t,Ct.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=Ct,n=O`<span
      class=${jt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${mo({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?O` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:O` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return O`
      <link
        rel="stylesheet"
        href=${rt(t)}
        nonce=${rt(o)}
      />
      ${s}
    `}};P.styles=fo;P.stylesheetHref="";P.nonce="";Y([y()],P.prototype,"label",void 0);Y([y({type:String})],P.prototype,"name",void 0);Y([y({type:Number})],P.prototype,"size",void 0);Y([y({type:Boolean,reflect:!0})],P.prototype,"spin",void 0);Y([y({type:Number,attribute:"spin-duration"})],P.prototype,"spinDuration",void 0);Y([y({type:Boolean,reflect:!0,attribute:"action-icon"})],P.prototype,"actionIcon",void 0);P=Ct=Y([st("vscode-icon")],P)});var ko=g(()=>{vo()});function Vt(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var fe=g(()=>{});var Sn,Dn,xo,To=g(()=>{L();Gt();fe();Sn=Z(Vt()),Dn=[at,B`
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
      font-family: var(--vscode-font-family, ${Sn});
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
  `],xo=Dn});var x,v,So=g(()=>{L();Rt();ge();Ft();ko();To();me();x=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var d=e.length-1;d>=0;d--)(a=e[d])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},v=class extends V{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=t?O`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${rt(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:k,r=o?O`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${rt(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:k;return O`
      <div
        class=${jt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${r}
        <slot name="content-after"></slot>
      </div>
    `}};v.styles=xo;v.formAssociated=!0;x([y({type:Boolean,reflect:!0})],v.prototype,"autofocus",void 0);x([y({type:Number,reflect:!0})],v.prototype,"tabIndex",void 0);x([y({type:Boolean,reflect:!0})],v.prototype,"secondary",void 0);x([y({type:Boolean,reflect:!0})],v.prototype,"block",void 0);x([y({reflect:!0})],v.prototype,"role",void 0);x([y({type:Boolean,reflect:!0})],v.prototype,"disabled",void 0);x([y()],v.prototype,"icon",void 0);x([y({type:Boolean,reflect:!0,attribute:"icon-spin"})],v.prototype,"iconSpin",void 0);x([y({type:Number,reflect:!0,attribute:"icon-spin-duration"})],v.prototype,"iconSpinDuration",void 0);x([y({attribute:"icon-after"})],v.prototype,"iconAfter",void 0);x([y({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],v.prototype,"iconAfterSpin",void 0);x([y({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],v.prototype,"iconAfterSpinDuration",void 0);x([y({type:Boolean,reflect:!0})],v.prototype,"focused",void 0);x([y({type:String,reflect:!0})],v.prototype,"name",void 0);x([y({type:Boolean,reflect:!0,attribute:"icon-only"})],v.prototype,"iconOnly",void 0);x([y({reflect:!0})],v.prototype,"type",void 0);x([y()],v.prototype,"value",void 0);x([pe()],v.prototype,"_hasContentBefore",void 0);x([pe()],v.prototype,"_hasContentAfter",void 0);v=x([st("vscode-button")],v)});var Do={};De(Do,{VscodeButton:()=>v});var Co=g(()=>{So()});var Cn,En,Eo,Mo=g(()=>{L();Gt();fe();Cn=Z(Vt()),En=[at,B`
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
      font-family: var(--vscode-font-family, ${Cn});
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
  `],Eo=En});var wo,it,Ao=g(()=>{L();Rt();Ft();Mo();wo=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var d=e.length-1;d>=0;d--)(a=e[d])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},it=class extends V{constructor(){super(...arguments),this.variant="default"}render(){return O`<div class="root"><slot></slot></div>`}};it.styles=Eo;wo([y({reflect:!0})],it.prototype,"variant",void 0);it=wo([st("vscode-badge")],it)});var Uo={};De(Uo,{VscodeBadge:()=>it});var $o=g(()=>{Ao()});function X(e){let t=globalThis.window;return t?t[e]:void 0}var qo=X("__MODEL_PRICING__"),Jt={};for(let[e,t]of Object.entries(qo?.pricing??{}))t.displayNames&&t.displayNames.length>0&&(Jt[e]=t.displayNames[0]);function Xt(e){if(Jt[e])return Jt[e];try{return decodeURIComponent(e)}catch{return e}}var Ce={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",JetBrains:"\u{1F9E9}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function Ee(e){return Ce[e]??"\u{1F4DD}"}var Yo=X("__TOKEN_ESTIMATORS__"),Jo=Yo?.estimators??{},$t,Me=!0;function we(e){Me=e}function Ae(e){return Ee(e)}function Ue(e){return 1/(Jo[e]??.25)}function Xo(e,t){return new Intl.NumberFormat($t,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function C(e,t=1){return`${Xo(e,t)}%`}function I(e){return e.toLocaleString($t)}function m(e){return Me?new Intl.NumberFormat($t,{notation:"compact",maximumFractionDigits:1}).format(e):I(e)}function E(e){return new Intl.NumberFormat($t,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function b(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}function ht(e,t,o,n){let s=document.createElement(e);n&&(s.className=n);let r=document.createElement("span");return r.className=`codicon codicon-${t}`,s.append(r,document.createTextNode(` ${o}`)),s}function Zo(e,t){let o=document.createElement("span");return o.className=`codicon codicon-${e} nav-icon`,t&&o.style.setProperty("--icon-accent",t),o}function Qo(e,t){t.appearance&&e.setAttribute("appearance",t.appearance),t.hidden&&(e.hidden=!0),t.active&&(e.classList.add("nav-active"),e.setAttribute("disabled",""),e.setAttribute("aria-current","page"))}function $e(e,t,o){let n=document.createElement("vscode-button");if(typeof e=="string")return n.id=e,n.textContent=t||"",o&&n.setAttribute("appearance",o),n;let s=e;return n.id=s.id,s.icon?n.append(Zo(s.icon,s.iconColor),document.createTextNode(s.label)):n.textContent=s.label,Qo(n,s),n}var tn={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var en=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function _e(e,t){return en.filter(o=>o!=="btn-dashboard"||t).map(o=>({...tn[o],active:o===e}))}function Pe(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let s=document.createElement("vscode-button");s.id=`ext-point-${n.id}`,s.textContent=n.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(s)}}var Ie=`/**
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
`;var Oe=`body {
	margin: 0;
	background: var(--bg-primary);
	color: var(--text-primary);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 14px;
	max-width: 1200px;
	margin: 0 auto;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	padding-bottom: 4px;
}

.header-left {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
}

.plan-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	align-self: flex-start;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 999px;
	padding: 2px 10px;
	font-size: 11px;
	color: var(--text-secondary);
	cursor: help;
}

.provider-panel-hint {
	color: var(--text-secondary);
	font-size: 11px;
	margin: -4px 0 10px;
}

.provider-cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 10px;
	text-align: center;
}

.provider-card {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 12px;
	box-shadow: 0 4px 10px var(--shadow-color);
	text-align: center;
	cursor: pointer;
	transition: background-color 0.1s ease, opacity 0.1s ease;
}

.provider-card:hover {
	background: var(--list-hover-bg);
}

.provider-card-excluded {
	opacity: 0.45;
}

.provider-card-total {
	cursor: default;
	border-style: dashed;
}

.provider-card-total:hover {
	background: var(--bg-secondary);
}

.provider-card-label {
	color: var(--text-secondary);
	font-size: 11px;
	margin-bottom: 6px;
}

.provider-card-value {
	color: var(--text-primary);
	font-size: 18px;
	font-weight: 700;
}

.provider-card-sub {
	color: var(--text-secondary);
	font-size: 10px;
	margin-top: 4px;
}

.no-data-row td {
	text-align: center;
	color: var(--text-secondary);
	font-size: 12px;
	padding: 14px;
	font-style: italic;
}

.sections {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.section {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 12px;
	box-shadow: 0 4px 10px var(--shadow-color);
}

.section h3 {
	margin: 0 0 10px;
	font-size: 14px;
	display: flex;
	align-items: center;
	gap: 6px;
	color: var(--text-primary);
	letter-spacing: 0.2px;
}

.stats-table {
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 8px;
	overflow: hidden;
}

.stats-table thead {
	background: var(--list-hover-bg);
}

.stats-table th,
.stats-table td {
	padding: 10px 12px;
	border-bottom: 1px solid var(--border-subtle);
	vertical-align: middle;
}

.stats-table th {
	text-align: left;
	color: var(--text-secondary);
	font-weight: 700;
	font-size: 12px;
	letter-spacing: 0.1px;
}

.stats-table td {
	color: var(--text-primary);
	font-size: 12px;
}

.stats-table th.align-right,
.stats-table td.align-right {
	text-align: right;
}

.stats-table tr.group-row td {
	background: var(--list-hover-bg);
	color: var(--text-secondary);
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 1px;
	padding: 8px 12px;
	border-top: 1px solid var(--border-color);
	border-bottom: 1px solid var(--border-color);
}

/* First group sits right under the table header, no extra top rule needed */
.stats-table tbody tr.group-row:first-child td {
	border-top: none;
}

.metric-label {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-weight: 600;
}

.period-header {
	display: flex;
	align-items: center;
	gap: 4px;
	color: var(--text-secondary);
}

.align-right .period-header {
	justify-content: flex-end;
}

.value-right {
	text-align: right;
}

.muted {
	color: var(--text-muted);
	font-size: 11px;
	margin-top: 4px;
}

.notes {
	margin: 4px 0 0;
	padding-left: 16px;
	color: var(--text-secondary);
}

.notes li {
	margin: 4px 0;
	line-height: 1.4;
}

.footer {
	color: var(--text-muted);
	font-size: 11px;
	margin-top: 6px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 20px;
}

.empty-state-title {
	font-size: 15px;
	font-weight: 700;
	color: var(--text-primary);
}

.empty-state-description {
	color: var(--text-secondary);
	font-size: 13px;
	line-height: 1.5;
	margin: 0;
}

.empty-state-steps {
	margin: 0;
	padding-left: 20px;
	color: var(--text-secondary);
	font-size: 13px;
	line-height: 1.6;
}

.empty-state-steps li {
	margin: 4px 0;
}

.empty-state-note {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 6px;
	padding: 10px 14px;
	color: var(--text-secondary);
	font-size: 12px;
	line-height: 1.5;
}
`;function Le(e){window.addEventListener("message",t=>{e(t.data)})}var Zt=new Set(["VS Code","VS Code Insiders","VS Code Exploration","VS Code Server","VS Code Server (Insiders)","VSCodium","Visual Studio","JetBrains","Copilot CLI","Copilot CLI (App)","MS Scout (Copilot CLI)"]);var sn=[["anthropic","Anthropic"],["claude","Anthropic"],["codestral","Mistral AI"],["devstral","Mistral AI"],["gemini","Google"],["goldeneye","xAI"],["google","Google"],["gpt","OpenAI"],["grok","xAI"],["magistral","Mistral AI"],["mai-","Microsoft"],["ministral","Mistral AI"],["mistral","Mistral AI"],["o1","OpenAI"],["o3","OpenAI"],["o4","OpenAI"],["pixtral","Mistral AI"],["qwen","Alibaba"],["raptor","xAI"]];function rn(e){let t=e.toLowerCase(),o=sn.find(([n])=>t.startsWith(n));return o?o[1]:"Other"}function Qt(e,t){return Zt.has(e)?"GitHub Copilot":rn(t)}var j=acquireVsCodeApi(),pt=X("__INITIAL_DETAILS__");console.log("[CopilotTokenTracker] details webview loaded");console.log("[CopilotTokenTracker] initialData:",pt);console.log("[CopilotTokenTracker] initialData:",pt);var J=pt?.sortSettings,Mt=J?.editor?.key??"name",lt=J?.editor?.dir??"asc",wt=J?.model?.key??"name",ut=J?.model?.dir??"asc",dt=J?.modelOtherExpanded??!1,ct=J?.editorOtherExpanded??!1,K=new Set(J?.excludedProviders??[]),ye=null;function U(e){return e/30*365.25}function S(e,t){let o=document.createElement("td");return o.className="value-right align-right",o.textContent=e,t!==void 0&&o.append(b("div","muted",t)),o}function Mn(e,t,o,n){let s=document.createElement("td"),r=document.createElement("span");r.className="metric-label";let a=document.createElement("span");a.textContent=e,o&&(a.style.color=o);let d=document.createElement("span");if(d.textContent=t,n){r.title=n,r.style.cursor="help";let i=document.createElement("span");i.textContent=" \u2139\uFE0F",i.style.cssText="font-size:0.75em; opacity:0.6;",d.append(i)}return r.append(a,d),s.append(r),s}function Oo(e,t,o,n){let s=document.createElement("thead"),r=document.createElement("tr"),a=[];function d(){a.forEach((i,c)=>{i.textContent=`${e[c].icon} ${e[c].text}${_o(e[c].key,t(),o())}`})}return e.forEach((i,c)=>{let l=document.createElement("th");l.className=c===0?"":"align-right",l.style.cursor="pointer",l.style.userSelect="none",l.title=`Sort by ${i.text}`;let p=b("div","period-header");p.textContent=`${i.icon} ${i.text}${_o(i.key,t(),o())}`,l.append(p),a.push(p),l.addEventListener("click",()=>{n(i.key),d()}),r.append(l)}),s.append(r),{thead:s,updateHeaders:d}}function ve(e){we(e.compactNumbers!==!1),ye=e;let t=document.getElementById("root");if(!t)return;let o=Te(e),n=Math.round(U(e.last30Days.tokens+e.last30Days.thinkingTokens)),s=Math.round(U(e.last30Days.sessions)),r=U(e.last30Days.co2),a=U(e.last30Days.waterUsage),d=U(Et(e.last30Days,o)),i=U(e.last30Days.estimatedCostCopilot??0),c=U(e.last30Days.treesEquivalent);An(t,e,{projectedTokens:n,projectedSessions:s,projectedCo2:r,projectedWater:a,projectedCost:d,projectedCostCopilot:i,projectedTrees:c}),Yn()}function wn(){ye&&ve(ye)}function An(e,t,o){let n=new Date(t.lastUpdated);e.replaceChildren();let s=document.createElement("style");s.textContent=Ie;let r=document.createElement("style");r.textContent=Oe;let a=b("div","container"),d=b("div","header"),i=b("div","header-left");i.append(b("div","title","AI Engineering Fluency"));let c=$n(t);c&&i.append(c);let l=b("div","button-row");l.append(..._e("btn-details",!!t.backendConfigured).map(T=>$e(T))),d.append(i,l);let p=b("div","footer",`Last updated: ${n.toLocaleString()} \xB7 Updates every 5 minutes`),u=b("div","sections");if((t.today.tokens??0)===0&&(t.last30Days.tokens??0)===0&&(t.lastMonth.tokens??0)===0)u.append(qn());else{let T=Nn(t);T&&u.append(T)}u.append(In(t,o));let h=Vn(t);h&&u.append(h);let M=Wn(t);M&&u.append(M),a.append(d,u,p),e.append(s,r,a)}function Lo(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.inputTokens,0)}function Ro(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.outputTokens,0)}function ke(e){return(e.actualTokens||0)>0}function Kt(e){return ke(e)?C((e.actualTokens-e.estimatedTokens)/e.actualTokens*100):"\u2014"}function zt(e){return ke(e)?m(Lo(e)):"\u2014"}function Wt(e){return ke(e)?m(Ro(e)):"\u2014"}function qt(e){let t=Lo(e)+Ro(e);return(e.actualTokens??0)>0?m(e.tokens+e.thinkingTokens):m(t>0?t:e.tokens)}function Un(e){return e.today.cachedTokens||e.last30Days.cachedTokens||e.month.cachedTokens||e.lastMonth.cachedTokens?[{label:"Cached tokens",labelTooltip:'Cache-read tokens \u2014 already included in "Input tokens" above, shown separately because they are billed at a lower rate.',icon:"\u26A1",color:"#34d399",today:m(e.today.cachedTokens||0),last30Days:m(e.last30Days.cachedTokens||0),month:m(e.month.cachedTokens||0),lastMonth:m(e.lastMonth.cachedTokens||0),projected:"\u2014"}]:[]}function $n(e){if(!e.copilotPlan)return null;let t=e.copilotPlan,o=t.monthlyAiCreditsUsd>0?`$${t.monthlyAiCreditsUsd} credits/month`:"no credits",n=b("div","plan-badge",`\u{1F3F7}\uFE0F ${t.planName} \xB7 ${o}`);return n.title=`Your active GitHub Copilot subscription plan (ID: ${t.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`,n}function _n(e,t){let o=Te(e),n=[{label:"Total tokens",labelTooltip:"All LLM API tokens counted across every call in this period \u2014 matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.",icon:"\u{1F7E3}",color:"#c37bff",today:qt(e.today),last30Days:qt(e.last30Days),month:qt(e.month),lastMonth:qt(e.lastMonth),projected:m(t.projectedTokens)},{label:"Input tokens",labelTooltip:"Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).",icon:"\u2B06\uFE0F",color:"#c37bff",today:zt(e.today),last30Days:zt(e.last30Days),month:zt(e.month),lastMonth:zt(e.lastMonth),projected:"\u2014"},{label:"Output tokens",icon:"\u2B07\uFE0F",color:"#c37bff",today:Wt(e.today),last30Days:Wt(e.last30Days),month:Wt(e.month),lastMonth:Wt(e.lastMonth),projected:"\u2014"},...Un(e),{label:"Tokens (user estimated)",icon:"\u{1F4DD}",color:"#b39ddb",today:m(e.today.estimatedTokens),last30Days:m(e.last30Days.estimatedTokens),month:m(e.month.estimatedTokens),lastMonth:m(e.lastMonth.estimatedTokens),projected:"\u2014"},{label:"Service overhead %",icon:"\u2601\uFE0F",color:"#90a4ae",today:Kt(e.today),last30Days:Kt(e.last30Days),month:Kt(e.month),lastMonth:Kt(e.lastMonth),projected:"\u2014"},{label:"Thinking tokens",icon:"\u{1F9E0}",color:"#a78bfa",today:m(e.today.thinkingTokens||0),last30Days:m(e.last30Days.thinkingTokens||0),month:m(e.month.thinkingTokens||0),lastMonth:m(e.lastMonth.thinkingTokens||0),projected:"\u2014"}],s=[{label:"Estimated cost (selected providers)",labelTooltip:"Sum of estimated cost across the providers selected in the Cost by Provider filter below \u2014 GitHub Copilot uses UBB AI Credit rates, other providers use their own API pricing.",icon:"\u{1F4B5}",color:"#7ce38b",today:E(Et(e.today,o)),last30Days:E(Et(e.last30Days,o)),month:E(Et(e.month,o)),lastMonth:E(Et(e.lastMonth,o)),projected:E(t.projectedCost)},{label:"Estimated cost (GitHub Copilot UBB)",labelTooltip:"Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.",icon:"\u{1F7E2}",color:"#7ce38b",today:E(e.today.estimatedCostCopilot??0),last30Days:E(e.last30Days.estimatedCostCopilot??0),month:E(e.month.estimatedCostCopilot??0),lastMonth:E(e.lastMonth.estimatedCostCopilot??0),projected:E(t.projectedCostCopilot??0)}],r=[{label:"Sessions",icon:"\u{1F4C2}",color:"#66aaff",today:I(e.today.sessions),last30Days:I(e.last30Days.sessions),month:I(e.month.sessions),lastMonth:I(e.lastMonth.sessions),projected:I(t.projectedSessions)},{label:"Average interactions/session",icon:"\u{1F4AC}",color:"#8ce0ff",today:I(e.today.avgInteractionsPerSession),last30Days:I(e.last30Days.avgInteractionsPerSession),month:I(e.month.avgInteractionsPerSession),lastMonth:I(e.lastMonth.avgInteractionsPerSession),projected:"\u2014"},{label:"Average tokens/session",icon:"\u{1F522}",color:"#7ce38b",today:m(e.today.avgTokensPerSession),last30Days:m(e.last30Days.avgTokensPerSession),month:m(e.month.avgTokensPerSession),lastMonth:m(e.lastMonth.avgTokensPerSession),projected:"\u2014"}];return[{heading:"\u{1F522} Tokens",rows:n},{heading:"\u{1F4B0} Cost",rows:s},{heading:"\u{1F4AC} Activity",rows:r}]}function Pn(e){let t=document.createElement("tr");t.className="group-row";let o=document.createElement("td");return o.colSpan=6,o.textContent=e,t.append(o),t}function Bo(e,t){let o=document.createElement("tr");o.className="no-data-row";let n=document.createElement("td");return n.colSpan=e,n.textContent=t,o.append(n),o}function In(e,t){let o=b("div","section");o.append(ht("h3","graph","Key Metrics"));let n=document.createElement("table");n.className="stats-table";let s=document.createElement("thead"),r=document.createElement("tr");[{icon:"\u{1F4CA}",text:"Metric"},{icon:"\u{1F4C5}",text:"Today"},{icon:"\u{1F4C8}",text:"Last 30 Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month"},{icon:"\u{1F4C6}",text:"Previous Month"},{icon:"\u{1F30D}",text:"Projected Year"}].forEach((i,c)=>{let l=document.createElement("th");l.className=c===0?"":"align-right";let p=b("div","period-header");p.textContent=`${i.icon} ${i.text}`,l.append(p),r.append(l)}),s.append(r),n.append(s);let d=document.createElement("tbody");return _n(e,t).forEach(i=>{d.append(Pn(i.heading)),i.rows.forEach(c=>{let l=document.createElement("tr");l.append(Mn(c.icon,c.label,c.color,c.labelTooltip),S(c.today),S(c.last30Days),S(c.month),S(c.lastMonth),S(c.projected)),d.append(l)})}),n.append(d),o.append(n),o}var On={"GitHub Copilot":"\u{1F419}",Anthropic:"\u{1F170}\uFE0F",Google:"\u{1F537}",OpenAI:"\u{1F7E2}","Mistral AI":"\u{1F32C}\uFE0F",xAI:"\u2716\uFE0F",Microsoft:"\u{1FA9F}",Alibaba:"\u{1F409}",Other:"\u2754"};function Ln(e){return On[e]??"\u{1F4B5}"}function Rn(e,t){let o=K.has(t),n=b("div",`provider-card${o?" provider-card-excluded":""}`);n.tabIndex=0,n.setAttribute("role","button"),n.setAttribute("aria-pressed",String(!o)),n.title=o?`${t} is hidden \u2014 click to show it again and include it in the totals below.`:`Click to hide ${t} \u2014 filters it out of the totals and the Editor/Model usage lists below.`,n.append(b("div","provider-card-label",`${Ln(t)} ${t}`),b("div","provider-card-value",E(e.month.billingGroupCosts?.[t]||0)),b("div","provider-card-sub",`Today ${E(e.today.billingGroupCosts?.[t]||0)} \xB7 30d ${E(e.last30Days.billingGroupCosts?.[t]||0)}`));let s=()=>{K.has(t)?K.delete(t):K.add(t),At(),wn()};return n.addEventListener("click",s),n.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),s())}),n}function Bn(e,t){let o=No(t),n=b("div","provider-card provider-card-total");return n.title=`Sum of ${o.length} of ${t.length} selected provider(s).`,n.append(b("div","provider-card-label","\u2211 Total (selected)"),b("div","provider-card-value",E(Yt(e.month.billingGroupCosts,o))),b("div","provider-card-sub",`Today ${E(Yt(e.today.billingGroupCosts,o))} \xB7 30d ${E(Yt(e.last30Days.billingGroupCosts,o))}`)),n}function Nn(e){let t=Te(e);if(t.length===0)return null;let o=b("div","section");o.append(ht("h3","credit-card","Cost by Provider")),o.append(b("div","provider-panel-hint","Click a provider to hide/show it \u2014 this also filters the Editor & Model usage lists below."));let n=b("div","provider-cards");return n.append(Bn(e,t)),t.forEach(s=>n.append(Rn(e,s))),o.append(n),o}function _o(e,t,o){return e!==t?" \u2195":o==="asc"?" \u2191":" \u2193"}function At(){j.postMessage({command:"saveSortSettings",settings:{editor:{key:Mt,dir:lt},model:{key:wt,dir:ut},modelOtherExpanded:dt,editorOtherExpanded:ct,excludedProviders:Array.from(K)}})}var xe=["today","last30Days","month","lastMonth"];function Te(e){let t=new Set;return xe.forEach(o=>{Object.keys(e[o].billingGroupCosts??{}).forEach(n=>t.add(n))}),Array.from(t).sort((o,n)=>o==="GitHub Copilot"?-1:n==="GitHub Copilot"?1:o.localeCompare(n))}function No(e){return e.filter(t=>!K.has(t))}function Yt(e,t){return e?t.reduce((o,n)=>o+(e[n]||0),0):0}function Et(e,t){return t.length===0?e.estimatedCostCopilot??e.estimatedCost??0:Yt(e.billingGroupCosts,No(t))}function jn(e,t){let o=new Set;return xe.forEach(n=>{let s=e[n].editorModelUsage?.[t];s&&Object.keys(s).forEach(r=>o.add(Qt(t,r)))}),o}function Hn(e,t){let o=new Set;return xe.forEach(n=>{let s=e[n].editorModelUsage;s&&Object.keys(s).forEach(r=>{s[r][t]&&o.add(Qt(r,t))})}),o}function jo(e){return K.size===0||e.size===0?!0:Array.from(e).some(t=>!K.has(t))}function Ho(e,t){let o=e.today.editorUsage[t]||{tokens:0,sessions:0},n=e.last30Days.editorUsage[t]||{tokens:0,sessions:0},s=e.month.editorUsage[t]||{tokens:0,sessions:0},r=e.lastMonth.editorUsage[t]||{tokens:0,sessions:0};return{editor:t,todayUsage:o,last30DaysUsage:n,monthUsage:s,lastMonthUsage:r,projectedTokens:Math.round(U(n.tokens)),projectedSessions:Math.round(U(n.sessions))}}function Fo(e){e.sort((t,o)=>{let n;switch(Mt){case"name":n=t.editor.localeCompare(o.editor);break;case"today":n=t.todayUsage.tokens-o.todayUsage.tokens;break;case"last30Days":n=t.last30DaysUsage.tokens-o.last30DaysUsage.tokens;break;case"month":n=t.monthUsage.tokens-o.monthUsage.tokens;break;case"lastMonth":n=t.lastMonthUsage.tokens-o.lastMonthUsage.tokens;break;case"projected":n=t.projectedTokens-o.projectedTokens;break;default:n=0}return lt==="asc"?n:-n})}function Go(e,t,o){let{editor:n,todayUsage:s,last30DaysUsage:r,monthUsage:a,lastMonthUsage:d,projectedTokens:i,projectedSessions:c}=e,l=t.today>0?s.tokens/t.today*100:0,p=t.last30Days>0?r.tokens/t.last30Days*100:0,u=t.month>0?a.tokens/t.month*100:0,f=t.lastMonth>0?d.tokens/t.lastMonth*100:0,h=document.createElement("tr");o&&(h.style.opacity="0.85"),n==="JetBrains"&&(h.title="JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available."),n==="Antigravity"&&(h.title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."),n==="Cursor"&&(h.title="Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.");let M=document.createElement("td"),T=document.createElement("span");if(T.className="metric-label",o){let D=document.createElement("span");D.style.cssText="display:inline-block;width:12px",T.append(D)}return T.append(document.createTextNode(`${Ae(n)} ${n}`)),(n==="JetBrains"||n==="Antigravity"||n==="Cursor")&&T.append(document.createTextNode(" \u24D8")),M.append(T),h.append(M,S(m(s.tokens),`${C(l)} \xB7 ${s.sessions} sessions`),S(m(r.tokens),`${C(p)} \xB7 ${r.sessions} sessions`),S(m(a.tokens),`${C(u)} \xB7 ${a.sessions} sessions`),S(m(d.tokens),`${C(f)} \xB7 ${d.sessions} sessions`),S(m(i),`${c} sessions`)),h}function Fn(e,t,o,n,s){let r=D=>t.reduce((w,R)=>{let $=e[D].editorUsage[R]||{tokens:0,sessions:0};return{tokens:w.tokens+$.tokens,sessions:w.sessions+$.sessions}},{tokens:0,sessions:0}),a=r("today"),d=r("last30Days"),i=r("month"),c=r("lastMonth"),l=(D,w)=>w>0?D/w*100:0,p=document.createElement("tr");p.style.cursor="pointer",p.style.background="var(--list-hover-bg)",p.title=ct?"Collapse other editors":"Expand other editors";let u=document.createElement("span");u.className="metric-label";let f=document.createElement("span");f.style.cssText="color:var(--text-secondary);font-weight:600;",f.textContent=`\u{1F4E6} Other (${t.length} editor${t.length!==1?"s":""})`;let h=document.createElement("span");h.style.cssText="font-size:10px;color:var(--text-muted)",h.textContent=` ${ct?"\u25B2":"\u25BC"}`,u.append(f,h);let M=document.createElement("td");M.append(u);let T=(D,w)=>{let R=S(m(D.tokens));return R.append(b("div","muted",`${C(l(D.tokens,w))} \xB7 ${D.sessions} sessions`)),R};if(p.append(M,T(a,o.today),T(d,o.last30Days),T(i,o.month),T(c,o.lastMonth),S(m(Math.round(U(d.tokens))),`${Math.round(U(d.sessions))} sessions`)),p.addEventListener("click",()=>{ct=!ct,At(),n()}),s.append(p),ct){let D=t.map(w=>Ho(e,w));Fo(D),D.forEach(w=>s.append(Go(w,o,!0)))}}function Gn(e,t,o,n){let s=[...t,...o],r={today:s.reduce((i,c)=>i+(e.today.editorUsage[c]?.tokens||0),0),last30Days:s.reduce((i,c)=>i+(e.last30Days.editorUsage[c]?.tokens||0),0),month:s.reduce((i,c)=>i+(e.month.editorUsage[c]?.tokens||0),0),lastMonth:s.reduce((i,c)=>i+(e.lastMonth.editorUsage[c]?.tokens||0),0)},a=document.createElement("tbody");if(s.length===0)return a.append(Bo(6,"No editor usage matches the selected provider filter.")),a;let d=t.map(i=>Ho(e,i));return Fo(d),d.forEach(i=>a.append(Go(i,r,!1))),o.length>0&&Fn(e,o,r,n,a),a}var Po=5;function Vn(e){let t=new Set([...Object.keys(e.today.editorUsage),...Object.keys(e.last30Days.editorUsage),...Object.keys(e.month.editorUsage),...Object.keys(e.lastMonth.editorUsage)]);if(t.size===0)return null;let n=Array.from(t).filter(u=>jo(jn(e,u))).sort((u,f)=>{let h=e.last30Days.editorUsage[u]||{tokens:0,sessions:0};return(e.last30Days.editorUsage[f]||{tokens:0,sessions:0}).tokens-h.tokens}),s=n.slice(0,Po),r=n.slice(Po),a=b("div","section"),d=ht("h3","device-desktop","Usage by Editor");a.append(d);let i=document.createElement("table");i.className="stats-table";let c=[{icon:"\u{1F4DD}",text:"Editor",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function l(){let u=Gn(e,s,r,l),f=i.querySelector("tbody");f?i.replaceChild(u,f):i.append(u)}let{thead:p}=Oo(c,()=>Mt,()=>lt,u=>{Mt===u?lt=lt==="asc"?"desc":"asc":(Mt=u,lt=u==="name"?"asc":"desc"),l(),At()});return i.append(p),l(),a.append(i),a}var Io=5;function Vo(e,t){let o=e.today.modelUsage[t]||{inputTokens:0,outputTokens:0},n=e.last30Days.modelUsage[t]||{inputTokens:0,outputTokens:0},s=e.month.modelUsage[t]||{inputTokens:0,outputTokens:0},r=e.lastMonth.modelUsage[t]||{inputTokens:0,outputTokens:0},a=o.inputTokens+o.outputTokens,d=n.inputTokens+n.outputTokens,i=s.inputTokens+s.outputTokens,c=r.inputTokens+r.outputTokens;return{model:t,todayTotal:a,todayInputPct:a>0?o.inputTokens/a*100:0,todayOutputPct:a>0?o.outputTokens/a*100:0,last30DaysTotal:d,last30DaysInputPct:d>0?n.inputTokens/d*100:0,last30DaysOutputPct:d>0?n.outputTokens/d*100:0,monthTotal:i,monthInputPct:i>0?s.inputTokens/i*100:0,monthOutputPct:i>0?s.outputTokens/i*100:0,lastMonthTotal:c,lastMonthInputPct:c>0?r.inputTokens/c*100:0,lastMonthOutputPct:c>0?r.outputTokens/c*100:0,projected:Math.round(U(d)),charsPerToken:Ue(t)}}function Ko(e){e.sort((t,o)=>{let n;switch(wt){case"name":n=t.model.localeCompare(o.model);break;case"today":n=t.todayTotal-o.todayTotal;break;case"last30Days":n=t.last30DaysTotal-o.last30DaysTotal;break;case"month":n=t.monthTotal-o.monthTotal;break;case"lastMonth":n=t.lastMonthTotal-o.lastMonthTotal;break;case"projected":n=t.projected-o.projected;break;default:n=0}return ut==="asc"?n:-n})}function zo(e,t){let o=document.createElement("tr");t&&(o.style.opacity="0.85");let n=document.createElement("td"),s=document.createElement("span");if(s.className="metric-label",t){let a=document.createElement("span");a.style.cssText="display:inline-block;width:12px",s.append(a)}let r=document.createElement("span");return r.style.cssText="color:#9aa0a6;font-size:11px;font-weight:500;",r.textContent=`(~${e.charsPerToken.toFixed(1)} chars/tk)`,s.append(document.createTextNode(`${Xt(e.model)} `),r),n.append(s),o.append(n,S(m(e.todayTotal),`\u2191${C(e.todayInputPct)} \u2193${C(e.todayOutputPct)}`),S(m(e.last30DaysTotal),`\u2191${C(e.last30DaysInputPct)} \u2193${C(e.last30DaysOutputPct)}`),S(m(e.monthTotal),`\u2191${C(e.monthInputPct)} \u2193${C(e.monthOutputPct)}`),S(m(e.lastMonthTotal),`\u2191${C(e.lastMonthInputPct)} \u2193${C(e.lastMonthOutputPct)}`),S(m(e.projected))),o}function Kn(e,t,o,n){let s=$=>t.reduce((A,Ut)=>{let Se=e[$].modelUsage[Ut]||{inputTokens:0,outputTokens:0};return{inputTokens:A.inputTokens+Se.inputTokens,outputTokens:A.outputTokens+Se.outputTokens}},{inputTokens:0,outputTokens:0}),r=($,A)=>A>0?$/A*100:0,a=s("today"),d=s("last30Days"),i=s("month"),c=s("lastMonth"),l=a.inputTokens+a.outputTokens,p=d.inputTokens+d.outputTokens,u=i.inputTokens+i.outputTokens,f=c.inputTokens+c.outputTokens,h=document.createElement("tr");h.style.cursor="pointer",h.style.background="var(--list-hover-bg)",h.title=dt?"Collapse other models":"Expand other models";let M=document.createElement("span");M.className="metric-label";let T=document.createElement("span");T.style.cssText="color:var(--text-secondary);font-weight:600;",T.textContent=`\u{1F4E6} Other (${t.length} model${t.length!==1?"s":""})`;let D=document.createElement("span");D.style.cssText="font-size:10px;color:var(--text-muted)",D.textContent=` ${dt?"\u25B2":"\u25BC"}`,M.append(T,D);let w=document.createElement("td");w.append(M);let R=($,A)=>{let Ut=S(m(A));return A>0&&Ut.append(b("div","muted",`\u2191${C(r($.inputTokens,A))} \u2193${C(r($.outputTokens,A))}`)),Ut};if(h.append(w,R(a,l),R(d,p),R(i,u),R(c,f),S(m(Math.round(U(p))))),h.addEventListener("click",()=>{dt=!dt,At(),o()}),n.append(h),dt){let $=t.map(A=>Vo(e,A));Ko($),$.forEach(A=>n.append(zo(A,!0)))}}function zn(e,t,o,n){let s=t.map(a=>Vo(e,a));Ko(s);let r=document.createElement("tbody");return s.forEach(a=>r.append(zo(a,!1))),o.length>0&&Kn(e,o,n,r),r}function Wn(e){let t=new Set([...Object.keys(e.today.modelUsage),...Object.keys(e.last30Days.modelUsage),...Object.keys(e.month.modelUsage),...Object.keys(e.lastMonth.modelUsage)]);if(t.size===0)return null;let o=new Set(Array.from(t).filter(u=>jo(Hn(e,u)))),n=b("div","section"),s=ht("h3","symbol-numeric","Model Usage (Tokens)");n.append(s);let r=document.createElement("table");if(r.className="stats-table",o.size===0){let u=document.createElement("tbody");return u.append(Bo(6,"No model usage matches the selected provider filter.")),r.append(u),n.append(r),n}let a=Array.from(o).sort((u,f)=>{let h=e.last30Days.modelUsage[u]||{inputTokens:0,outputTokens:0},M=e.last30Days.modelUsage[f]||{inputTokens:0,outputTokens:0};return M.inputTokens+M.outputTokens-(h.inputTokens+h.outputTokens)}),d=a.slice(0,Io),i=a.slice(Io),c=[{icon:"\u{1F9E0}",text:"Model",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function l(){let u=zn(e,d,i,l),f=r.querySelector("tbody");f?r.replaceChild(u,f):r.append(u)}let{thead:p}=Oo(c,()=>wt,()=>ut,u=>{wt===u?ut=ut==="asc"?"desc":"asc":(wt=u,ut=u==="name"?"asc":"desc"),l(),At()});return r.append(p),l(),n.append(r),n}function qn(){let e=b("div","section"),t=b("div","empty-state"),o=b("div","empty-state-title","\u{1F44B} Welcome to AI Engineering Fluency"),n=b("p","empty-state-description","This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."),s=document.createElement("p");s.className="empty-state-description";let r=document.createElement("strong");r.textContent="Supported tools & editors:",s.append(r);let a=document.createElement("ul");a.className="empty-state-steps",["\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE","\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent","\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal","\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat","\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent","\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents","\u03C0 Pi \u2014 Mistral-powered terminal coding agent","\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension","\u{1F499} VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension"].forEach(f=>{let h=document.createElement("li");h.textContent=f,a.append(h)});let i=document.createElement("p");i.className="empty-state-description";let c=document.createElement("strong");c.textContent="To get started:",i.append(c);let l=document.createElement("ol");l.className="empty-state-steps",["Use any of the supported tools or editors listed above to interact with an AI model.","For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.","For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.","Click the \u{1F504} Refresh button above to reload the stats after your first session."].forEach(f=>{let h=document.createElement("li");h.textContent=f,l.append(h)});let u=b("div","empty-state-note","\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly.");return t.append(o,n,s,a,i,l,u),e.append(t),e}function Yn(){let e=document.getElementById("btn-refresh"),t=document.getElementById("btn-chart"),o=document.getElementById("btn-usage"),n=document.getElementById("btn-diagnostics");e?.addEventListener("click",()=>j.postMessage({command:"refresh"})),t?.addEventListener("click",()=>j.postMessage({command:"showChart"})),o?.addEventListener("click",()=>j.postMessage({command:"showUsageAnalysis"})),n?.addEventListener("click",()=>j.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>j.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>j.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>j.postMessage({command:"showEnvironmental"})),Pe(j)}async function Jn(){if(console.log("[CopilotTokenTracker] bootstrap called"),await Promise.resolve().then(()=>(Co(),Do)),await Promise.resolve().then(()=>($o(),Uo)),pt)console.log("[CopilotTokenTracker] Rendering details with initialData:",pt),ve(pt);else{console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");let e=document.getElementById("root");if(e){e.textContent="";let t=document.createElement("div");t.style.padding="16px",t.style.color="#e7e7e7",t.textContent="No data available.",e.append(t)}}}Le(e=>{e.command==="updateStats"&&ve(e.data)});Jn();})();
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
