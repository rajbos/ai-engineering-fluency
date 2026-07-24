"use strict";(()=>{var Lo=Object.defineProperty;var h=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var ge=(e,t)=>{for(var o in t)Lo(e,o,{get:t[o],enumerable:!0})};var Mt,Dt,Yt,Ae,ht,J,L,Me,Jt,Xt=h(()=>{Mt=globalThis,Dt=Mt.ShadowRoot&&(Mt.ShadyCSS===void 0||Mt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Yt=Symbol(),Ae=new WeakMap,ht=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==Yt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(Dt&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=Ae.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Ae.set(o,t))}return t}toString(){return this.cssText}},J=e=>new ht(typeof e=="string"?e:e+"",void 0,Yt),L=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,s,r)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[r+1],e[0]);return new ht(o,e,Yt)},Me=(e,t)=>{if(Dt)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),s=Mt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,e.appendChild(n)}},Jt=Dt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return J(o)})(e):e});var Go,Yo,Jo,Xo,Zo,Qo,H,De,tn,en,mt,gt,It,Ie,N,bt=h(()=>{Xt();Xt();({is:Go,defineProperty:Yo,getOwnPropertyDescriptor:Jo,getOwnPropertyNames:Xo,getOwnPropertySymbols:Zo,getPrototypeOf:Qo}=Object),H=globalThis,De=H.trustedTypes,tn=De?De.emptyScript:"",en=H.reactiveElementPolyfillSupport,mt=(e,t)=>e,gt={toAttribute(e,t){switch(t){case Boolean:e=e?tn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},It=(e,t)=>!Go(e,t),Ie={attribute:!0,type:String,converter:gt,reflect:!1,useDefault:!1,hasChanged:It};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),H.litPropertyMetadata??(H.litPropertyMetadata=new WeakMap);N=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=Ie){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,o);s!==void 0&&Yo(this.prototype,t,s)}}static getPropertyDescriptor(t,o,n){let{get:s,set:r}=Jo(this.prototype,t)??{get(){return this[o]},set(a){this[o]=a}};return{get:s,set(a){let i=s?.call(this);r?.call(this,a),this.requestUpdate(t,i,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Ie}static _$Ei(){if(this.hasOwnProperty(mt("elementProperties")))return;let t=Qo(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(mt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(mt("properties"))){let o=this.properties,n=[...Xo(o),...Zo(o)];for(let s of n)this.createProperty(s,o[s])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)o.unshift(Jt(s))}else t!==void 0&&o.push(Jt(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Me(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:gt).toAttribute(o,n.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,o){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:gt;this._$Em=s;let i=a.fromAttribute(o,r.type);this[s]=i??this._$Ej?.get(s)??i,this._$Em=null}}requestUpdate(t,o,n,s=!1,r){if(t!==void 0){let a=this.constructor;if(s===!1&&(r=this[t]),n??(n=a.getPropertyOptions(t)),!((n.hasChanged??It)(r,o)||n.useDefault&&n.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:s,wrapped:r},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,a??o??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:a}=r,i=this[s];a!==!0||this._$AL.has(s)||i===void 0||this.C(s,void 0,r,i)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[mt("elementProperties")]=new Map,N[mt("finalized")]=new Map,en?.({ReactiveElement:N}),(H.reactiveElementVersions??(H.reactiveElementVersions=[])).push("2.1.2")});function Ve(e,t){if(!se(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ue!==void 0?Ue.createHTML(t):t}function X(e,t,o=e,n){if(t===I)return t;let s=n!==void 0?o._$Co?.[n]:o._$Cl,r=xt(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(e),s._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(t=X(e,s._$AS(e,t.values),s,n)),t}var vt,Pe,Pt,Ue,He,j,je,on,K,yt,xt,se,nn,Zt,ft,Be,Oe,W,Le,Ne,Fe,re,U,Jn,Xn,I,x,Re,q,sn,kt,Qt,Tt,Z,te,ee,oe,ne,rn,ze,Q=h(()=>{vt=globalThis,Pe=e=>e,Pt=vt.trustedTypes,Ue=Pt?Pt.createPolicy("lit-html",{createHTML:e=>e}):void 0,He="$lit$",j=`lit$${Math.random().toFixed(9).slice(2)}$`,je="?"+j,on=`<${je}>`,K=document,yt=()=>K.createComment(""),xt=e=>e===null||typeof e!="object"&&typeof e!="function",se=Array.isArray,nn=e=>se(e)||typeof e?.[Symbol.iterator]=="function",Zt=`[ 	
\f\r]`,ft=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Be=/-->/g,Oe=/>/g,W=RegExp(`>|${Zt}(?:([^\\s"'>=/]+)(${Zt}*=${Zt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Le=/'/g,Ne=/"/g,Fe=/^(?:script|style|textarea|title)$/i,re=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),U=re(1),Jn=re(2),Xn=re(3),I=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),Re=new WeakMap,q=K.createTreeWalker(K,129);sn=(e,t)=>{let o=e.length-1,n=[],s,r=t===2?"<svg>":t===3?"<math>":"",a=ft;for(let i=0;i<o;i++){let c=e[i],d,p,l=-1,u=0;for(;u<c.length&&(a.lastIndex=u,p=a.exec(c),p!==null);)u=a.lastIndex,a===ft?p[1]==="!--"?a=Be:p[1]!==void 0?a=Oe:p[2]!==void 0?(Fe.test(p[2])&&(s=RegExp("</"+p[2],"g")),a=W):p[3]!==void 0&&(a=W):a===W?p[0]===">"?(a=s??ft,l=-1):p[1]===void 0?l=-2:(l=a.lastIndex-p[2].length,d=p[1],a=p[3]===void 0?W:p[3]==='"'?Ne:Le):a===Ne||a===Le?a=W:a===Be||a===Oe?a=ft:(a=W,s=void 0);let f=a===W&&e[i+1].startsWith("/>")?" ":"";r+=a===ft?c+on:l>=0?(n.push(d),c.slice(0,l)+He+c.slice(l)+j+f):c+j+(l===-2?i:f)}return[Ve(e,r+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},kt=class e{constructor({strings:t,_$litType$:o},n){let s;this.parts=[];let r=0,a=0,i=t.length-1,c=this.parts,[d,p]=sn(t,o);if(this.el=e.createElement(d,n),q.currentNode=this.el.content,o===2||o===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(s=q.nextNode())!==null&&c.length<i;){if(s.nodeType===1){if(s.hasAttributes())for(let l of s.getAttributeNames())if(l.endsWith(He)){let u=p[a++],f=s.getAttribute(l).split(j),g=/([.?@])?(.*)/.exec(u);c.push({type:1,index:r,name:g[2],strings:f,ctor:g[1]==="."?te:g[1]==="?"?ee:g[1]==="@"?oe:Z}),s.removeAttribute(l)}else l.startsWith(j)&&(c.push({type:6,index:r}),s.removeAttribute(l));if(Fe.test(s.tagName)){let l=s.textContent.split(j),u=l.length-1;if(u>0){s.textContent=Pt?Pt.emptyScript:"";for(let f=0;f<u;f++)s.append(l[f],yt()),q.nextNode(),c.push({type:2,index:++r});s.append(l[u],yt())}}}else if(s.nodeType===8)if(s.data===je)c.push({type:2,index:r});else{let l=-1;for(;(l=s.data.indexOf(j,l+1))!==-1;)c.push({type:7,index:r}),l+=j.length-1}r++}}static createElement(t,o){let n=K.createElement("template");return n.innerHTML=t,n}};Qt=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,s=(t?.creationScope??K).importNode(o,!0);q.currentNode=s;let r=q.nextNode(),a=0,i=0,c=n[0];for(;c!==void 0;){if(a===c.index){let d;c.type===2?d=new Tt(r,r.nextSibling,this,t):c.type===1?d=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(d=new ne(r,this,t)),this._$AV.push(d),c=n[++i]}a!==c?.index&&(r=q.nextNode(),a++)}return q.currentNode=K,s}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},Tt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,s){this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=X(this,t,o),xt(t)?t===x||t==null||t===""?(this._$AH!==x&&this._$AR(),this._$AH=x):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):nn(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==x&&xt(this._$AH)?this._$AA.nextSibling.data=t:this.T(K.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=kt.createElement(Ve(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let r=new Qt(s,this),a=r.u(this.options);r.p(o),this.T(a),this._$AH=r}}_$AC(t){let o=Re.get(t.strings);return o===void 0&&Re.set(t.strings,o=new kt(t)),o}k(t){se(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let r of t)s===o.length?o.push(n=new e(this.O(yt()),this.O(yt()),this,this.options)):n=o[s],n._$AI(r),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=Pe(t).nextSibling;Pe(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},Z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,s,r){this.type=1,this._$AH=x,this._$AN=void 0,this.element=t,this.name=o,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=x}_$AI(t,o=this,n,s){let r=this.strings,a=!1;if(r===void 0)t=X(this,t,o,0),a=!xt(t)||t!==this._$AH&&t!==I,a&&(this._$AH=t);else{let i=t,c,d;for(t=r[0],c=0;c<r.length-1;c++)d=X(this,i[n+c],o,c),d===I&&(d=this._$AH[c]),a||(a=!xt(d)||d!==this._$AH[c]),d===x?t=x:t!==x&&(t+=(d??"")+r[c+1]),this._$AH[c]=d}a&&!s&&this.j(t)}j(t){t===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},te=class extends Z{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===x?void 0:t}},ee=class extends Z{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==x)}},oe=class extends Z{constructor(t,o,n,s,r){super(t,o,n,s,r),this.type=5}_$AI(t,o=this){if((t=X(this,t,o,0)??x)===I)return;let n=this._$AH,s=t===x&&n!==x||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,r=t!==x&&(n===x||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ne=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}},rn=vt.litHtmlPolyfillSupport;rn?.(kt,Tt),(vt.litHtmlVersions??(vt.litHtmlVersions=[])).push("3.3.3");ze=(e,t,o)=>{let n=o?.renderBefore??t,s=n._$litPart$;if(s===void 0){let r=o?.renderBefore??null;n._$litPart$=s=new Tt(t.insertBefore(yt(),r),r,void 0,o??{})}return s._$AI(e),s}});var Et,F,an,We=h(()=>{bt();bt();Q();Q();Et=globalThis,F=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ze(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};F._$litElement$=!0,F.finalized=!0,Et.litElementHydrateSupport?.({LitElement:F});an=Et.litElementPolyfillSupport;an?.({LitElement:F});(Et.litElementVersions??(Et.litElementVersions=[])).push("4.2.2")});var qe=h(()=>{});var B=h(()=>{bt();Q();We();qe()});var Ke=h(()=>{});function b(e){return(t,o)=>typeof o=="object"?dn(e,t,o):((n,s,r)=>{let a=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),a?Object.getOwnPropertyDescriptor(s,r):void 0})(e,t,o)}var cn,dn,ae=h(()=>{bt();cn={attribute:!0,type:String,converter:gt,reflect:!1,hasChanged:It},dn=(e=cn,t,o)=>{let{kind:n,metadata:s}=o,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(o.name,e),n==="accessor"){let{name:a}=o;return{set(i){let c=t.get.call(this);t.set.call(this,i),this.requestUpdate(a,c,e,!0,i)},init(i){return i!==void 0&&this.C(a,void 0,e,i),i}}}if(n==="setter"){let{name:a}=o;return function(i){let c=this[a];t.call(this,i),this.requestUpdate(a,c,e,!0,i)}}throw Error("Unsupported decorator location: "+n)}});function ie(e){return b({...e,state:!0,attribute:!1})}var Ge=h(()=>{ae();});var Ye=h(()=>{});var tt=h(()=>{});var Je=h(()=>{tt();});var Xe=h(()=>{tt();});var Ze=h(()=>{tt();});var Qe=h(()=>{tt();});var to=h(()=>{tt();});var Bt=h(()=>{Ke();ae();Ge();Ye();Je();Xe();Ze();Qe();to()});var Ot,Lt,et,ce=h(()=>{Ot={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Lt=e=>(...t)=>({_$litDirective$:e,values:t}),et=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var Nt,eo=h(()=>{Q();ce();Nt=Lt(class extends et{constructor(e){if(super(e),e.type!==Ot.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return I}})});var de=h(()=>{eo()});var Rt,oo,no,V,ot,Ht=h(()=>{B();Rt="2.5.1",oo="__vscodeElements_disableRegistryWarning__",no=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},V=class extends F{get version(){return Rt}warn(t){no(t,this)}},ot=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(oo in window)return;let s=document.createElement(e)?.version,r="";s?s!==Rt?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${Rt}", while the other one is "${s}".`):r+=`is already registered by the same version of VSCode Elements (${Rt}).`:r+="is already registered by an unknown custom element handler class.",no(`The custom element "${e}" ${r}
To suppress this warning, set window.${oo} to true`)}});var nt,so=h(()=>{Q();nt=e=>e??x});var le=h(()=>{so()});var ro=h(()=>{ce()});var pe,ao,io=h(()=>{B();ro();pe=class extends et{constructor(t){if(super(t),this._prevProperties={},t.type!==Ot.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?t.element.style.setProperty(n,s):t.element.style[n]=s,this._prevProperties[n]=s)}),I}render(t){return I}},ao=Lt(pe)});var st,jt=h(()=>{B();st=L`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var ln,co,lo=h(()=>{B();jt();ln=[st,L`
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
  `],co=ln});var G,St,P,po=h(()=>{B();Bt();de();le();Ht();io();lo();G=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},P=St=class extends V{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();St.stylesheetHref=t,St.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=St,n=U`<span
      class=${Nt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${ao({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?U` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:U` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return U`
      <link
        rel="stylesheet"
        href=${nt(t)}
        nonce=${nt(o)}
      />
      ${s}
    `}};P.styles=co;P.stylesheetHref="";P.nonce="";G([b()],P.prototype,"label",void 0);G([b({type:String})],P.prototype,"name",void 0);G([b({type:Number})],P.prototype,"size",void 0);G([b({type:Boolean,reflect:!0})],P.prototype,"spin",void 0);G([b({type:Number,attribute:"spin-duration"})],P.prototype,"spinDuration",void 0);G([b({type:Boolean,reflect:!0,attribute:"action-icon"})],P.prototype,"actionIcon",void 0);P=St=G([ot("vscode-icon")],P)});var uo=h(()=>{po()});function Ft(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var ue=h(()=>{});var pn,un,ho,mo=h(()=>{B();jt();ue();pn=J(Ft()),un=[st,L`
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
      font-family: var(--vscode-font-family, ${pn});
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
  `],ho=un});var k,y,go=h(()=>{B();Bt();de();Ht();uo();mo();le();k=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},y=class extends V{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=t?U`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${nt(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:x,r=o?U`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${nt(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:x;return U`
      <div
        class=${Nt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${r}
        <slot name="content-after"></slot>
      </div>
    `}};y.styles=ho;y.formAssociated=!0;k([b({type:Boolean,reflect:!0})],y.prototype,"autofocus",void 0);k([b({type:Number,reflect:!0})],y.prototype,"tabIndex",void 0);k([b({type:Boolean,reflect:!0})],y.prototype,"secondary",void 0);k([b({type:Boolean,reflect:!0})],y.prototype,"block",void 0);k([b({reflect:!0})],y.prototype,"role",void 0);k([b({type:Boolean,reflect:!0})],y.prototype,"disabled",void 0);k([b()],y.prototype,"icon",void 0);k([b({type:Boolean,reflect:!0,attribute:"icon-spin"})],y.prototype,"iconSpin",void 0);k([b({type:Number,reflect:!0,attribute:"icon-spin-duration"})],y.prototype,"iconSpinDuration",void 0);k([b({attribute:"icon-after"})],y.prototype,"iconAfter",void 0);k([b({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],y.prototype,"iconAfterSpin",void 0);k([b({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],y.prototype,"iconAfterSpinDuration",void 0);k([b({type:Boolean,reflect:!0})],y.prototype,"focused",void 0);k([b({type:String,reflect:!0})],y.prototype,"name",void 0);k([b({type:Boolean,reflect:!0,attribute:"icon-only"})],y.prototype,"iconOnly",void 0);k([b({reflect:!0})],y.prototype,"type",void 0);k([b()],y.prototype,"value",void 0);k([ie()],y.prototype,"_hasContentBefore",void 0);k([ie()],y.prototype,"_hasContentAfter",void 0);y=k([ot("vscode-button")],y)});var bo={};ge(bo,{VscodeButton:()=>y});var fo=h(()=>{go()});var hn,mn,vo,yo=h(()=>{B();jt();ue();hn=J(Ft()),mn=[st,L`
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
      font-family: var(--vscode-font-family, ${hn});
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
  `],vo=mn});var xo,rt,ko=h(()=>{B();Bt();Ht();yo();xo=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(r=(s<3?a(r):s>3?a(t,o,r):a(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},rt=class extends V{constructor(){super(...arguments),this.variant="default"}render(){return U`<div class="root"><slot></slot></div>`}};rt.styles=vo;xo([b({reflect:!0})],rt.prototype,"variant",void 0);rt=xo([ot("vscode-badge")],rt)});var To={};ge(To,{VscodeBadge:()=>rt});var Eo=h(()=>{ko()});function Y(e){let t=globalThis.window;return t?t[e]:void 0}var No=Y("__MODEL_PRICING__"),Gt={};for(let[e,t]of Object.entries(No?.pricing??{}))t.displayNames&&t.displayNames.length>0&&(Gt[e]=t.displayNames[0]);function be(e){if(Gt[e])return Gt[e];try{return decodeURIComponent(e)}catch{return e}}var fe={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",JetBrains:"\u{1F9E9}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function ve(e){return fe[e]??"\u{1F4DD}"}var Ro=Y("__TOKEN_ESTIMATORS__"),Ho=Ro?.estimators??{},_t,ye=!0;function xe(e){ye=e}function ke(e){return ve(e)}function Te(e){return 1/(Ho[e]??.25)}function jo(e,t){return new Intl.NumberFormat(_t,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function S(e,t=1){return`${jo(e,t)}%`}function D(e){return e.toLocaleString(_t)}function m(e){return ye?new Intl.NumberFormat(_t,{notation:"compact",maximumFractionDigits:1}).format(e):D(e)}function z(e){return new Intl.NumberFormat(_t,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function v(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}function At(e,t,o,n){let s=document.createElement(e);n&&(s.className=n);let r=document.createElement("span");return r.className=`codicon codicon-${t}`,s.append(r,document.createTextNode(` ${o}`)),s}function Fo(e,t){let o=document.createElement("span");return o.className=`codicon codicon-${e} nav-icon`,t&&o.style.setProperty("--icon-accent",t),o}function Vo(e,t){t.appearance&&e.setAttribute("appearance",t.appearance),t.hidden&&(e.hidden=!0),t.active&&(e.classList.add("nav-active"),e.setAttribute("disabled",""),e.setAttribute("aria-current","page"))}function Ee(e,t,o){let n=document.createElement("vscode-button");if(typeof e=="string")return n.id=e,n.textContent=t||"",o&&n.setAttribute("appearance",o),n;let s=e;return n.id=s.id,s.icon?n.append(Fo(s.icon,s.iconColor),document.createTextNode(s.label)):n.textContent=s.label,Vo(n,s),n}var zo={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var Wo=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function Se(e,t){return Wo.filter(o=>o!=="btn-dashboard"||t).map(o=>({...zo[o],active:o===e}))}function we(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let s=document.createElement("vscode-button");s.id=`ext-point-${n.id}`,s.textContent=n.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(s)}}var Ce=`/**
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
`;var $e=`body {
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

.cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 10px;
	text-align: center;
}

.card {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 12px;
	box-shadow: 0 4px 10px var(--shadow-color);
	text-align: center;
}

.card-label {
	color: var(--text-secondary);
	font-size: 11px;
	margin-bottom: 6px;
}

.card-value {
	color: var(--text-primary);
	font-size: 18px;
	font-weight: 700;
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
`;function _e(e){window.addEventListener("message",t=>{e(t.data)})}var R=acquireVsCodeApi(),pt=Y("__INITIAL_DETAILS__");console.log("[CopilotTokenTracker] details webview loaded");console.log("[CopilotTokenTracker] initialData:",pt);console.log("[CopilotTokenTracker] initialData:",pt);var ut=pt?.sortSettings,wt=ut?.editor?.key??"name",ct=ut?.editor?.dir??"asc",Ct=ut?.model?.key??"name",dt=ut?.model?.dir??"asc",at=ut?.modelOtherExpanded??!1,it=ut?.editorOtherExpanded??!1;function _(e){return e/30*365.25}function T(e,t){let o=document.createElement("td");return o.className="value-right align-right",o.textContent=e,t!==void 0&&o.append(v("div","muted",t)),o}function gn(e,t,o,n){let s=document.createElement("td"),r=document.createElement("span");r.className="metric-label";let a=document.createElement("span");a.textContent=e,o&&(a.style.color=o);let i=document.createElement("span");if(i.textContent=t,n){r.title=n,r.style.cursor="help";let c=document.createElement("span");c.textContent=" \u2139\uFE0F",c.style.cssText="font-size:0.75em; opacity:0.6;",i.append(c)}return r.append(a,i),s.append(r),s}function $o(e,t,o,n){let s=document.createElement("thead"),r=document.createElement("tr"),a=[];function i(){a.forEach((c,d)=>{c.textContent=`${e[d].icon} ${e[d].text}${So(e[d].key,t(),o())}`})}return e.forEach((c,d)=>{let p=document.createElement("th");p.className=d===0?"":"align-right",p.style.cursor="pointer",p.style.userSelect="none",p.title=`Sort by ${c.text}`;let l=v("div","period-header");l.textContent=`${c.icon} ${c.text}${So(c.key,t(),o())}`,p.append(l),a.push(l),p.addEventListener("click",()=>{n(c.key),i()}),r.append(p)}),s.append(r),{thead:s,updateHeaders:i}}function _o(e){xe(e.compactNumbers!==!1);let t=document.getElementById("root");if(!t)return;let o=Math.round(_(e.last30Days.tokens+e.last30Days.thinkingTokens)),n=Math.round(_(e.last30Days.sessions)),s=_(e.last30Days.co2),r=_(e.last30Days.waterUsage),a=_(e.last30Days.estimatedCost),i=_(e.last30Days.estimatedCostCopilot??0),c=_(e.last30Days.treesEquivalent);bn(t,e,{projectedTokens:o,projectedSessions:n,projectedCo2:s,projectedWater:r,projectedCost:a,projectedCostCopilot:i,projectedTrees:c}),Mn()}function bn(e,t,o){let n=new Date(t.lastUpdated);e.replaceChildren();let s=document.createElement("style");s.textContent=Ce;let r=document.createElement("style");r.textContent=$e;let a=v("div","container"),i=v("div","header"),c=v("div","header-left");c.append(v("div","title","AI Engineering Fluency"));let d=vn(t);d&&c.append(d);let p=v("div","button-row");p.append(...Se("btn-details",!!t.backendConfigured).map(w=>Ee(w))),i.append(c,p);let l=v("div","footer",`Last updated: ${n.toLocaleString()} \xB7 Updates every 5 minutes`),u=v("div","sections");(t.today.tokens??0)===0&&(t.last30Days.tokens??0)===0&&(t.lastMonth.tokens??0)===0?u.append(An()):u.append(yn(t)),u.append(Tn(t,o));let g=wn(t);g&&u.append(g);let A=_n(t);A&&u.append(A),a.append(i,u,l),e.append(s,r,a)}function Ao(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.inputTokens,0)}function Mo(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.outputTokens,0)}function he(e){return(e.actualTokens||0)>0}function Vt(e){return he(e)?S((e.actualTokens-e.estimatedTokens)/e.actualTokens*100):"\u2014"}function zt(e){return he(e)?m(Ao(e)):"\u2014"}function Wt(e){return he(e)?m(Mo(e)):"\u2014"}function lt(e){let t=Ao(e)+Mo(e);return(e.actualTokens??0)>0?m(e.tokens+e.thinkingTokens):m(t>0?t:e.tokens)}function fn(e){return e.today.cachedTokens||e.last30Days.cachedTokens||e.month.cachedTokens||e.lastMonth.cachedTokens?[{label:"Cached tokens",labelTooltip:'Cache-read tokens \u2014 already included in "Input tokens" above, shown separately because they are billed at a lower rate.',icon:"\u26A1",color:"#34d399",today:m(e.today.cachedTokens||0),last30Days:m(e.last30Days.cachedTokens||0),month:m(e.month.cachedTokens||0),lastMonth:m(e.lastMonth.cachedTokens||0),projected:"\u2014"}]:[]}function vn(e){if(!e.copilotPlan)return null;let t=e.copilotPlan,o=t.monthlyAiCreditsUsd>0?`$${t.monthlyAiCreditsUsd} credits/month`:"no credits",n=v("div","plan-badge",`\u{1F3F7}\uFE0F ${t.planName} \xB7 ${o}`);return n.title=`Your active GitHub Copilot subscription plan (ID: ${t.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`,n}function qt(e,t,o){let n=v("div","card");return n.id=e,n.append(v("div","card-label",t),v("div","card-value",o)),n}function yn(e){let t=v("div","cards");return t.id="summary-cards",t.append(qt("card-today-tokens","\u{1F4C5} Tokens Today",lt(e.today)),qt("card-30d-tokens","\u{1F4C8} Tokens Last 30 Days",lt(e.last30Days)),qt("card-month-cost","\u{1F4B0} Est. Cost This Month (UBB)",z(e.month.estimatedCostCopilot??0)),qt("card-today-sessions","\u{1F4C2} Sessions Today",D(e.today.sessions))),t}function xn(e,t){let o=[{label:"Total tokens",labelTooltip:"All LLM API tokens counted across every call in this period \u2014 matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.",icon:"\u{1F7E3}",color:"#c37bff",today:lt(e.today),last30Days:lt(e.last30Days),month:lt(e.month),lastMonth:lt(e.lastMonth),projected:m(t.projectedTokens)},{label:"Input tokens",labelTooltip:"Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).",icon:"\u2B06\uFE0F",color:"#c37bff",today:zt(e.today),last30Days:zt(e.last30Days),month:zt(e.month),lastMonth:zt(e.lastMonth),projected:"\u2014"},{label:"Output tokens",icon:"\u2B07\uFE0F",color:"#c37bff",today:Wt(e.today),last30Days:Wt(e.last30Days),month:Wt(e.month),lastMonth:Wt(e.lastMonth),projected:"\u2014"},...fn(e),{label:"Tokens (user estimated)",icon:"\u{1F4DD}",color:"#b39ddb",today:m(e.today.estimatedTokens),last30Days:m(e.last30Days.estimatedTokens),month:m(e.month.estimatedTokens),lastMonth:m(e.lastMonth.estimatedTokens),projected:"\u2014"},{label:"Service overhead %",icon:"\u2601\uFE0F",color:"#90a4ae",today:Vt(e.today),last30Days:Vt(e.last30Days),month:Vt(e.month),lastMonth:Vt(e.lastMonth),projected:"\u2014"},{label:"Thinking tokens",icon:"\u{1F9E0}",color:"#a78bfa",today:m(e.today.thinkingTokens||0),last30Days:m(e.last30Days.thinkingTokens||0),month:m(e.month.thinkingTokens||0),lastMonth:m(e.lastMonth.thinkingTokens||0),projected:"\u2014"}],n=[{label:"Estimated cost (UBB)",labelTooltip:"Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.",icon:"\u{1F7E2}",color:"#7ce38b",today:z(e.today.estimatedCostCopilot??0),last30Days:z(e.last30Days.estimatedCostCopilot??0),month:z(e.month.estimatedCostCopilot??0),lastMonth:z(e.lastMonth.estimatedCostCopilot??0),projected:z(t.projectedCostCopilot??0)}],s=[{label:"Sessions",icon:"\u{1F4C2}",color:"#66aaff",today:D(e.today.sessions),last30Days:D(e.last30Days.sessions),month:D(e.month.sessions),lastMonth:D(e.lastMonth.sessions),projected:D(t.projectedSessions)},{label:"Average interactions/session",icon:"\u{1F4AC}",color:"#8ce0ff",today:D(e.today.avgInteractionsPerSession),last30Days:D(e.last30Days.avgInteractionsPerSession),month:D(e.month.avgInteractionsPerSession),lastMonth:D(e.lastMonth.avgInteractionsPerSession),projected:"\u2014"},{label:"Average tokens/session",icon:"\u{1F522}",color:"#7ce38b",today:m(e.today.avgTokensPerSession),last30Days:m(e.last30Days.avgTokensPerSession),month:m(e.month.avgTokensPerSession),lastMonth:m(e.lastMonth.avgTokensPerSession),projected:"\u2014"}];return[{heading:"\u{1F522} Tokens",rows:o},{heading:"\u{1F4B0} Cost",rows:n},{heading:"\u{1F4AC} Activity",rows:s}]}function kn(e){let t=document.createElement("tr");t.className="group-row";let o=document.createElement("td");return o.colSpan=6,o.textContent=e,t.append(o),t}function Tn(e,t){let o=v("div","section");o.append(At("h3","graph","Key Metrics"));let n=document.createElement("table");n.className="stats-table";let s=document.createElement("thead"),r=document.createElement("tr");[{icon:"\u{1F4CA}",text:"Metric"},{icon:"\u{1F4C5}",text:"Today"},{icon:"\u{1F4C8}",text:"Last 30 Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month"},{icon:"\u{1F4C6}",text:"Previous Month"},{icon:"\u{1F30D}",text:"Projected Year"}].forEach((c,d)=>{let p=document.createElement("th");p.className=d===0?"":"align-right";let l=v("div","period-header");l.textContent=`${c.icon} ${c.text}`,p.append(l),r.append(p)}),s.append(r),n.append(s);let i=document.createElement("tbody");return xn(e,t).forEach(c=>{i.append(kn(c.heading)),c.rows.forEach(d=>{let p=document.createElement("tr");p.append(gn(d.icon,d.label,d.color,d.labelTooltip),T(d.today),T(d.last30Days),T(d.month),T(d.lastMonth),T(d.projected)),i.append(p)})}),n.append(i),o.append(n),o}function So(e,t,o){return e!==t?" \u2195":o==="asc"?" \u2191":" \u2193"}function Kt(){R.postMessage({command:"saveSortSettings",settings:{editor:{key:wt,dir:ct},model:{key:Ct,dir:dt},modelOtherExpanded:at,editorOtherExpanded:it}})}function Do(e,t){let o=e.today.editorUsage[t]||{tokens:0,sessions:0},n=e.last30Days.editorUsage[t]||{tokens:0,sessions:0},s=e.month.editorUsage[t]||{tokens:0,sessions:0},r=e.lastMonth.editorUsage[t]||{tokens:0,sessions:0};return{editor:t,todayUsage:o,last30DaysUsage:n,monthUsage:s,lastMonthUsage:r,projectedTokens:Math.round(_(n.tokens)),projectedSessions:Math.round(_(n.sessions))}}function Io(e){e.sort((t,o)=>{let n;switch(wt){case"name":n=t.editor.localeCompare(o.editor);break;case"today":n=t.todayUsage.tokens-o.todayUsage.tokens;break;case"last30Days":n=t.last30DaysUsage.tokens-o.last30DaysUsage.tokens;break;case"month":n=t.monthUsage.tokens-o.monthUsage.tokens;break;case"lastMonth":n=t.lastMonthUsage.tokens-o.lastMonthUsage.tokens;break;case"projected":n=t.projectedTokens-o.projectedTokens;break;default:n=0}return ct==="asc"?n:-n})}function Po(e,t,o){let{editor:n,todayUsage:s,last30DaysUsage:r,monthUsage:a,lastMonthUsage:i,projectedTokens:c,projectedSessions:d}=e,p=t.today>0?s.tokens/t.today*100:0,l=t.last30Days>0?r.tokens/t.last30Days*100:0,u=t.month>0?a.tokens/t.month*100:0,f=t.lastMonth>0?i.tokens/t.lastMonth*100:0,g=document.createElement("tr");o&&(g.style.opacity="0.85"),n==="JetBrains"&&(g.title="JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available."),n==="Antigravity"&&(g.title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."),n==="Cursor"&&(g.title="Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.");let A=document.createElement("td"),w=document.createElement("span");if(w.className="metric-label",o){let E=document.createElement("span");E.style.cssText="display:inline-block;width:12px",w.append(E)}return w.append(document.createTextNode(`${ke(n)} ${n}`)),(n==="JetBrains"||n==="Antigravity"||n==="Cursor")&&w.append(document.createTextNode(" \u24D8")),A.append(w),g.append(A,T(m(s.tokens),`${S(p)} \xB7 ${s.sessions} sessions`),T(m(r.tokens),`${S(l)} \xB7 ${r.sessions} sessions`),T(m(a.tokens),`${S(u)} \xB7 ${a.sessions} sessions`),T(m(i.tokens),`${S(f)} \xB7 ${i.sessions} sessions`),T(m(c),`${d} sessions`)),g}function En(e,t,o,n,s){let r=E=>t.reduce((C,O)=>{let M=e[E].editorUsage[O]||{tokens:0,sessions:0};return{tokens:C.tokens+M.tokens,sessions:C.sessions+M.sessions}},{tokens:0,sessions:0}),a=r("today"),i=r("last30Days"),c=r("month"),d=r("lastMonth"),p=(E,C)=>C>0?E/C*100:0,l=document.createElement("tr");l.style.cursor="pointer",l.style.background="var(--list-hover-bg)",l.title=it?"Collapse other editors":"Expand other editors";let u=document.createElement("span");u.className="metric-label";let f=document.createElement("span");f.style.cssText="color:var(--text-secondary);font-weight:600;",f.textContent=`\u{1F4E6} Other (${t.length} editor${t.length!==1?"s":""})`;let g=document.createElement("span");g.style.cssText="font-size:10px;color:var(--text-muted)",g.textContent=` ${it?"\u25B2":"\u25BC"}`,u.append(f,g);let A=document.createElement("td");A.append(u);let w=(E,C)=>{let O=T(m(E.tokens));return O.append(v("div","muted",`${S(p(E.tokens,C))} \xB7 ${E.sessions} sessions`)),O};if(l.append(A,w(a,o.today),w(i,o.last30Days),w(c,o.month),w(d,o.lastMonth),T(m(Math.round(_(i.tokens))),`${Math.round(_(i.sessions))} sessions`)),l.addEventListener("click",()=>{it=!it,Kt(),n()}),s.append(l),it){let E=t.map(C=>Do(e,C));Io(E),E.forEach(C=>s.append(Po(C,o,!0)))}}function Sn(e,t,o,n){let s={today:Object.values(e.today.editorUsage).reduce((i,c)=>i+c.tokens,0),last30Days:Object.values(e.last30Days.editorUsage).reduce((i,c)=>i+c.tokens,0),month:Object.values(e.month.editorUsage).reduce((i,c)=>i+c.tokens,0),lastMonth:Object.values(e.lastMonth.editorUsage).reduce((i,c)=>i+c.tokens,0)},r=t.map(i=>Do(e,i));Io(r);let a=document.createElement("tbody");return r.forEach(i=>a.append(Po(i,s,!1))),o.length>0&&En(e,o,s,n,a),a}var wo=5;function wn(e){let t=new Set([...Object.keys(e.today.editorUsage),...Object.keys(e.last30Days.editorUsage),...Object.keys(e.month.editorUsage),...Object.keys(e.lastMonth.editorUsage)]);if(t.size===0)return null;let o=Array.from(t).sort((l,u)=>{let f=e.last30Days.editorUsage[l]||{tokens:0,sessions:0};return(e.last30Days.editorUsage[u]||{tokens:0,sessions:0}).tokens-f.tokens}),n=o.slice(0,wo),s=o.slice(wo),r=v("div","section"),a=At("h3","device-desktop","Usage by Editor");r.append(a);let i=document.createElement("table");i.className="stats-table";let c=[{icon:"\u{1F4DD}",text:"Editor",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function d(){let l=Sn(e,n,s,d),u=i.querySelector("tbody");u?i.replaceChild(l,u):i.append(l)}let{thead:p}=$o(c,()=>wt,()=>ct,l=>{wt===l?ct=ct==="asc"?"desc":"asc":(wt=l,ct=l==="name"?"asc":"desc"),d(),Kt()});return i.append(p),d(),r.append(i),r}var Co=5;function Uo(e,t){let o=e.today.modelUsage[t]||{inputTokens:0,outputTokens:0},n=e.last30Days.modelUsage[t]||{inputTokens:0,outputTokens:0},s=e.month.modelUsage[t]||{inputTokens:0,outputTokens:0},r=e.lastMonth.modelUsage[t]||{inputTokens:0,outputTokens:0},a=o.inputTokens+o.outputTokens,i=n.inputTokens+n.outputTokens,c=s.inputTokens+s.outputTokens,d=r.inputTokens+r.outputTokens;return{model:t,todayTotal:a,todayInputPct:a>0?o.inputTokens/a*100:0,todayOutputPct:a>0?o.outputTokens/a*100:0,last30DaysTotal:i,last30DaysInputPct:i>0?n.inputTokens/i*100:0,last30DaysOutputPct:i>0?n.outputTokens/i*100:0,monthTotal:c,monthInputPct:c>0?s.inputTokens/c*100:0,monthOutputPct:c>0?s.outputTokens/c*100:0,lastMonthTotal:d,lastMonthInputPct:d>0?r.inputTokens/d*100:0,lastMonthOutputPct:d>0?r.outputTokens/d*100:0,projected:Math.round(_(i)),charsPerToken:Te(t)}}function Bo(e){e.sort((t,o)=>{let n;switch(Ct){case"name":n=t.model.localeCompare(o.model);break;case"today":n=t.todayTotal-o.todayTotal;break;case"last30Days":n=t.last30DaysTotal-o.last30DaysTotal;break;case"month":n=t.monthTotal-o.monthTotal;break;case"lastMonth":n=t.lastMonthTotal-o.lastMonthTotal;break;case"projected":n=t.projected-o.projected;break;default:n=0}return dt==="asc"?n:-n})}function Oo(e,t){let o=document.createElement("tr");t&&(o.style.opacity="0.85");let n=document.createElement("td"),s=document.createElement("span");if(s.className="metric-label",t){let a=document.createElement("span");a.style.cssText="display:inline-block;width:12px",s.append(a)}let r=document.createElement("span");return r.style.cssText="color:#9aa0a6;font-size:11px;font-weight:500;",r.textContent=`(~${e.charsPerToken.toFixed(1)} chars/tk)`,s.append(document.createTextNode(`${be(e.model)} `),r),n.append(s),o.append(n,T(m(e.todayTotal),`\u2191${S(e.todayInputPct)} \u2193${S(e.todayOutputPct)}`),T(m(e.last30DaysTotal),`\u2191${S(e.last30DaysInputPct)} \u2193${S(e.last30DaysOutputPct)}`),T(m(e.monthTotal),`\u2191${S(e.monthInputPct)} \u2193${S(e.monthOutputPct)}`),T(m(e.lastMonthTotal),`\u2191${S(e.lastMonthInputPct)} \u2193${S(e.lastMonthOutputPct)}`),T(m(e.projected))),o}function Cn(e,t,o,n){let s=M=>t.reduce(($,$t)=>{let me=e[M].modelUsage[$t]||{inputTokens:0,outputTokens:0};return{inputTokens:$.inputTokens+me.inputTokens,outputTokens:$.outputTokens+me.outputTokens}},{inputTokens:0,outputTokens:0}),r=(M,$)=>$>0?M/$*100:0,a=s("today"),i=s("last30Days"),c=s("month"),d=s("lastMonth"),p=a.inputTokens+a.outputTokens,l=i.inputTokens+i.outputTokens,u=c.inputTokens+c.outputTokens,f=d.inputTokens+d.outputTokens,g=document.createElement("tr");g.style.cursor="pointer",g.style.background="var(--list-hover-bg)",g.title=at?"Collapse other models":"Expand other models";let A=document.createElement("span");A.className="metric-label";let w=document.createElement("span");w.style.cssText="color:var(--text-secondary);font-weight:600;",w.textContent=`\u{1F4E6} Other (${t.length} model${t.length!==1?"s":""})`;let E=document.createElement("span");E.style.cssText="font-size:10px;color:var(--text-muted)",E.textContent=` ${at?"\u25B2":"\u25BC"}`,A.append(w,E);let C=document.createElement("td");C.append(A);let O=(M,$)=>{let $t=T(m($));return $>0&&$t.append(v("div","muted",`\u2191${S(r(M.inputTokens,$))} \u2193${S(r(M.outputTokens,$))}`)),$t};if(g.append(C,O(a,p),O(i,l),O(c,u),O(d,f),T(m(Math.round(_(l))))),g.addEventListener("click",()=>{at=!at,Kt(),o()}),n.append(g),at){let M=t.map($=>Uo(e,$));Bo(M),M.forEach($=>n.append(Oo($,!0)))}}function $n(e,t,o,n){let s=t.map(a=>Uo(e,a));Bo(s);let r=document.createElement("tbody");return s.forEach(a=>r.append(Oo(a,!1))),o.length>0&&Cn(e,o,n,r),r}function _n(e){let t=new Set([...Object.keys(e.today.modelUsage),...Object.keys(e.last30Days.modelUsage),...Object.keys(e.month.modelUsage),...Object.keys(e.lastMonth.modelUsage)]);if(t.size===0)return null;let o=Array.from(t).sort((l,u)=>{let f=e.last30Days.modelUsage[l]||{inputTokens:0,outputTokens:0},g=e.last30Days.modelUsage[u]||{inputTokens:0,outputTokens:0};return g.inputTokens+g.outputTokens-(f.inputTokens+f.outputTokens)}),n=o.slice(0,Co),s=o.slice(Co),r=v("div","section"),a=At("h3","symbol-numeric","Model Usage (Tokens)");r.append(a);let i=document.createElement("table");i.className="stats-table";let c=[{icon:"\u{1F9E0}",text:"Model",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function d(){let l=$n(e,n,s,d),u=i.querySelector("tbody");u?i.replaceChild(l,u):i.append(l)}let{thead:p}=$o(c,()=>Ct,()=>dt,l=>{Ct===l?dt=dt==="asc"?"desc":"asc":(Ct=l,dt=l==="name"?"asc":"desc"),d(),Kt()});return i.append(p),d(),r.append(i),r}function An(){let e=v("div","section"),t=v("div","empty-state"),o=v("div","empty-state-title","\u{1F44B} Welcome to AI Engineering Fluency"),n=v("p","empty-state-description","This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."),s=document.createElement("p");s.className="empty-state-description";let r=document.createElement("strong");r.textContent="Supported tools & editors:",s.append(r);let a=document.createElement("ul");a.className="empty-state-steps",["\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE","\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent","\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal","\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat","\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent","\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents","\u03C0 Pi \u2014 Mistral-powered terminal coding agent","\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension","\u{1F499} VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension"].forEach(f=>{let g=document.createElement("li");g.textContent=f,a.append(g)});let c=document.createElement("p");c.className="empty-state-description";let d=document.createElement("strong");d.textContent="To get started:",c.append(d);let p=document.createElement("ol");p.className="empty-state-steps",["Use any of the supported tools or editors listed above to interact with an AI model.","For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.","For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.","Click the \u{1F504} Refresh button above to reload the stats after your first session."].forEach(f=>{let g=document.createElement("li");g.textContent=f,p.append(g)});let u=v("div","empty-state-note","\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly.");return t.append(o,n,s,a,c,p,u),e.append(t),e}function Mn(){let e=document.getElementById("btn-refresh"),t=document.getElementById("btn-chart"),o=document.getElementById("btn-usage"),n=document.getElementById("btn-diagnostics");e?.addEventListener("click",()=>R.postMessage({command:"refresh"})),t?.addEventListener("click",()=>R.postMessage({command:"showChart"})),o?.addEventListener("click",()=>R.postMessage({command:"showUsageAnalysis"})),n?.addEventListener("click",()=>R.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>R.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>R.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>R.postMessage({command:"showEnvironmental"})),we(R)}async function Dn(){if(console.log("[CopilotTokenTracker] bootstrap called"),await Promise.resolve().then(()=>(fo(),bo)),await Promise.resolve().then(()=>(Eo(),To)),pt)console.log("[CopilotTokenTracker] Rendering details with initialData:",pt),_o(pt);else{console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");let e=document.getElementById("root");if(e){e.textContent="";let t=document.createElement("div");t.style.padding="16px",t.style.color="#e7e7e7",t.textContent="No data available.",e.append(t)}}}_e(e=>{e.command==="updateStats"&&_o(e.data)});Dn();})();
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
