"use strict";(()=>{var Po=Object.defineProperty;var u=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var me=(e,t)=>{for(var o in t)Po(e,o,{get:t[o],enumerable:!0})};var $t,_t,Wt,_e,ct,W,P,Ae,Kt,Gt=u(()=>{$t=globalThis,_t=$t.ShadowRoot&&($t.ShadyCSS===void 0||$t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Wt=Symbol(),_e=new WeakMap,ct=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==Wt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(_t&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=_e.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&_e.set(o,t))}return t}toString(){return this.cssText}},W=e=>new ct(typeof e=="string"?e:e+"",void 0,Wt),P=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,r,s)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[s+1],e[0]);return new ct(o,e,Wt)},Ae=(e,t)=>{if(_t)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),r=$t.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=o.cssText,e.appendChild(n)}},Kt=_t?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return W(o)})(e):e});var zo,qo,Wo,Ko,Go,Yo,L,Me,Jo,Xo,dt,lt,At,De,B,pt=u(()=>{Gt();Gt();({is:zo,defineProperty:qo,getOwnPropertyDescriptor:Wo,getOwnPropertyNames:Ko,getOwnPropertySymbols:Go,getPrototypeOf:Yo}=Object),L=globalThis,Me=L.trustedTypes,Jo=Me?Me.emptyScript:"",Xo=L.reactiveElementPolyfillSupport,dt=(e,t)=>e,lt={toAttribute(e,t){switch(t){case Boolean:e=e?Jo:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},At=(e,t)=>!zo(e,t),De={attribute:!0,type:String,converter:lt,reflect:!1,useDefault:!1,hasChanged:At};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),L.litPropertyMetadata??(L.litPropertyMetadata=new WeakMap);B=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=De){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(t,n,o);r!==void 0&&qo(this.prototype,t,r)}}static getPropertyDescriptor(t,o,n){let{get:r,set:s}=Wo(this.prototype,t)??{get(){return this[o]},set(a){this[o]=a}};return{get:r,set(a){let i=r?.call(this);s?.call(this,a),this.requestUpdate(t,i,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??De}static _$Ei(){if(this.hasOwnProperty(dt("elementProperties")))return;let t=Yo(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(dt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(dt("properties"))){let o=this.properties,n=[...Ko(o),...Go(o)];for(let r of n)this.createProperty(r,o[r])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,r]of o)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let r=this._$Eu(o,n);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let r of n)o.unshift(Kt(r))}else t!==void 0&&o.push(Kt(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ae(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,n);if(r!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:lt).toAttribute(o,n.type);this._$Em=t,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,o){let n=this.constructor,r=n._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let s=n.getPropertyOptions(r),a=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:lt;this._$Em=r;let i=a.fromAttribute(o,s.type);this[r]=i??this._$Ej?.get(r)??i,this._$Em=null}}requestUpdate(t,o,n,r=!1,s){if(t!==void 0){let a=this.constructor;if(r===!1&&(s=this[t]),n??(n=a.getPropertyOptions(t)),!((n.hasChanged??At)(s,o)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:r,wrapped:s},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,a??o??this[t]),s!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:a}=s,i=this[r];a!==!0||this._$AL.has(r)||i===void 0||this.C(r,void 0,s,i)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};B.elementStyles=[],B.shadowRootOptions={mode:"open"},B[dt("elementProperties")]=new Map,B[dt("finalized")]=new Map,Xo?.({ReactiveElement:B}),(L.reactiveElementVersions??(L.reactiveElementVersions=[])).push("2.1.2")});function Fe(e,t){if(!ee(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pe!==void 0?Pe.createHTML(t):t}function K(e,t,o=e,n){if(t===$)return t;let r=n!==void 0?o._$Co?.[n]:o._$Cl,s=gt(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(e),r._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=r:o._$Cl=r),r!==void 0&&(t=K(e,r._$AS(e,t.values),r,n)),t}var ht,Ie,Mt,Pe,Re,O,He,Zo,V,mt,gt,ee,Qo,Yt,ut,Be,Ue,j,Le,Oe,je,oe,A,qn,Wn,$,x,Ne,F,tn,bt,Jt,ft,G,Xt,Zt,Qt,te,en,Ve,Y=u(()=>{ht=globalThis,Ie=e=>e,Mt=ht.trustedTypes,Pe=Mt?Mt.createPolicy("lit-html",{createHTML:e=>e}):void 0,Re="$lit$",O=`lit$${Math.random().toFixed(9).slice(2)}$`,He="?"+O,Zo=`<${He}>`,V=document,mt=()=>V.createComment(""),gt=e=>e===null||typeof e!="object"&&typeof e!="function",ee=Array.isArray,Qo=e=>ee(e)||typeof e?.[Symbol.iterator]=="function",Yt=`[ 	
\f\r]`,ut=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Be=/-->/g,Ue=/>/g,j=RegExp(`>|${Yt}(?:([^\\s"'>=/]+)(${Yt}*=${Yt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Le=/'/g,Oe=/"/g,je=/^(?:script|style|textarea|title)$/i,oe=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),A=oe(1),qn=oe(2),Wn=oe(3),$=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),Ne=new WeakMap,F=V.createTreeWalker(V,129);tn=(e,t)=>{let o=e.length-1,n=[],r,s=t===2?"<svg>":t===3?"<math>":"",a=ut;for(let i=0;i<o;i++){let c=e[i],d,p,l=-1,g=0;for(;g<c.length&&(a.lastIndex=g,p=a.exec(c),p!==null);)g=a.lastIndex,a===ut?p[1]==="!--"?a=Be:p[1]!==void 0?a=Ue:p[2]!==void 0?(je.test(p[2])&&(r=RegExp("</"+p[2],"g")),a=j):p[3]!==void 0&&(a=j):a===j?p[0]===">"?(a=r??ut,l=-1):p[1]===void 0?l=-2:(l=a.lastIndex-p[2].length,d=p[1],a=p[3]===void 0?j:p[3]==='"'?Oe:Le):a===Oe||a===Le?a=j:a===Be||a===Ue?a=ut:(a=j,r=void 0);let y=a===j&&e[i+1].startsWith("/>")?" ":"";s+=a===ut?c+Zo:l>=0?(n.push(d),c.slice(0,l)+Re+c.slice(l)+O+y):c+O+(l===-2?i:y)}return[Fe(e,s+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},bt=class e{constructor({strings:t,_$litType$:o},n){let r;this.parts=[];let s=0,a=0,i=t.length-1,c=this.parts,[d,p]=tn(t,o);if(this.el=e.createElement(d,n),F.currentNode=this.el.content,o===2||o===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=F.nextNode())!==null&&c.length<i;){if(r.nodeType===1){if(r.hasAttributes())for(let l of r.getAttributeNames())if(l.endsWith(Re)){let g=p[a++],y=r.getAttribute(l).split(O),b=/([.?@])?(.*)/.exec(g);c.push({type:1,index:s,name:b[2],strings:y,ctor:b[1]==="."?Xt:b[1]==="?"?Zt:b[1]==="@"?Qt:G}),r.removeAttribute(l)}else l.startsWith(O)&&(c.push({type:6,index:s}),r.removeAttribute(l));if(je.test(r.tagName)){let l=r.textContent.split(O),g=l.length-1;if(g>0){r.textContent=Mt?Mt.emptyScript:"";for(let y=0;y<g;y++)r.append(l[y],mt()),F.nextNode(),c.push({type:2,index:++s});r.append(l[g],mt())}}}else if(r.nodeType===8)if(r.data===He)c.push({type:2,index:s});else{let l=-1;for(;(l=r.data.indexOf(O,l+1))!==-1;)c.push({type:7,index:s}),l+=O.length-1}s++}}static createElement(t,o){let n=V.createElement("template");return n.innerHTML=t,n}};Jt=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,r=(t?.creationScope??V).importNode(o,!0);F.currentNode=r;let s=F.nextNode(),a=0,i=0,c=n[0];for(;c!==void 0;){if(a===c.index){let d;c.type===2?d=new ft(s,s.nextSibling,this,t):c.type===1?d=new c.ctor(s,c.name,c.strings,this,t):c.type===6&&(d=new te(s,this,t)),this._$AV.push(d),c=n[++i]}a!==c?.index&&(s=F.nextNode(),a++)}return F.currentNode=V,r}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},ft=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,r){this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=K(this,t,o),gt(t)?t===x||t==null||t===""?(this._$AH!==x&&this._$AR(),this._$AH=x):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Qo(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==x&&gt(this._$AH)?this._$AA.nextSibling.data=t:this.T(V.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,r=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=bt.createElement(Fe(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new Jt(r,this),a=s.u(this.options);s.p(o),this.T(a),this._$AH=s}}_$AC(t){let o=Ne.get(t.strings);return o===void 0&&Ne.set(t.strings,o=new bt(t)),o}k(t){ee(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,r=0;for(let s of t)r===o.length?o.push(n=new e(this.O(mt()),this.O(mt()),this,this.options)):n=o[r],n._$AI(s),r++;r<o.length&&(this._$AR(n&&n._$AB.nextSibling,r),o.length=r)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=Ie(t).nextSibling;Ie(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},G=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,r,s){this.type=1,this._$AH=x,this._$AN=void 0,this.element=t,this.name=o,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=x}_$AI(t,o=this,n,r){let s=this.strings,a=!1;if(s===void 0)t=K(this,t,o,0),a=!gt(t)||t!==this._$AH&&t!==$,a&&(this._$AH=t);else{let i=t,c,d;for(t=s[0],c=0;c<s.length-1;c++)d=K(this,i[n+c],o,c),d===$&&(d=this._$AH[c]),a||(a=!gt(d)||d!==this._$AH[c]),d===x?t=x:t!==x&&(t+=(d??"")+s[c+1]),this._$AH[c]=d}a&&!r&&this.j(t)}j(t){t===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Xt=class extends G{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===x?void 0:t}},Zt=class extends G{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==x)}},Qt=class extends G{constructor(t,o,n,r,s){super(t,o,n,r,s),this.type=5}_$AI(t,o=this){if((t=K(this,t,o,0)??x)===$)return;let n=this._$AH,r=t===x&&n!==x||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==x&&(n===x||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},te=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}},en=ht.litHtmlPolyfillSupport;en?.(bt,ft),(ht.litHtmlVersions??(ht.litHtmlVersions=[])).push("3.3.3");Ve=(e,t,o)=>{let n=o?.renderBefore??t,r=n._$litPart$;if(r===void 0){let s=o?.renderBefore??null;n._$litPart$=r=new ft(t.insertBefore(mt(),s),s,void 0,o??{})}return r._$AI(e),r}});var vt,N,on,ze=u(()=>{pt();pt();Y();Y();vt=globalThis,N=class extends B{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ve(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};N._$litElement$=!0,N.finalized=!0,vt.litElementHydrateSupport?.({LitElement:N});on=vt.litElementPolyfillSupport;on?.({LitElement:N});(vt.litElementVersions??(vt.litElementVersions=[])).push("4.2.2")});var qe=u(()=>{});var D=u(()=>{pt();Y();ze();qe()});var We=u(()=>{});function m(e){return(t,o)=>typeof o=="object"?rn(e,t,o):((n,r,s)=>{let a=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),a?Object.getOwnPropertyDescriptor(r,s):void 0})(e,t,o)}var nn,rn,ne=u(()=>{pt();nn={attribute:!0,type:String,converter:lt,reflect:!1,hasChanged:At},rn=(e=nn,t,o)=>{let{kind:n,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),s.set(o.name,e),n==="accessor"){let{name:a}=o;return{set(i){let c=t.get.call(this);t.set.call(this,i),this.requestUpdate(a,c,e,!0,i)},init(i){return i!==void 0&&this.C(a,void 0,e,i),i}}}if(n==="setter"){let{name:a}=o;return function(i){let c=this[a];t.call(this,i),this.requestUpdate(a,c,e,!0,i)}}throw Error("Unsupported decorator location: "+n)}});function re(e){return m({...e,state:!0,attribute:!1})}var Ke=u(()=>{ne();});var Ge=u(()=>{});var J=u(()=>{});var Ye=u(()=>{J();});var Je=u(()=>{J();});var Xe=u(()=>{J();});var Ze=u(()=>{J();});var Qe=u(()=>{J();});var It=u(()=>{We();ne();Ke();Ge();Ye();Je();Xe();Ze();Qe()});var Pt,Bt,X,se=u(()=>{Pt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Bt=e=>(...t)=>({_$litDirective$:e,values:t}),X=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var Ut,to=u(()=>{Y();se();Ut=Bt(class extends X{constructor(e){if(super(e),e.type!==Pt.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let r=!!t[n];r===this.st.has(n)||this.nt?.has(n)||(r?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return $}})});var ae=u(()=>{to()});var Lt,eo,oo,R,Z,Ot=u(()=>{D();Lt="2.5.1",eo="__vscodeElements_disableRegistryWarning__",oo=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},R=class extends N{get version(){return Lt}warn(t){oo(t,this)}},Z=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(eo in window)return;let r=document.createElement(e)?.version,s="";r?r!==Lt?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${Lt}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${Lt}).`:s+="is already registered by an unknown custom element handler class.",oo(`The custom element "${e}" ${s}
To suppress this warning, set window.${eo} to true`)}});var Q,no=u(()=>{Y();Q=e=>e??x});var ie=u(()=>{no()});var ro=u(()=>{se()});var ce,so,ao=u(()=>{D();ro();ce=class extends X{constructor(t){if(super(t),this._prevProperties={},t.type!==Pt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,r])=>{this._prevProperties[n]!==r&&(n.startsWith("--")?t.element.style.setProperty(n,r):t.element.style[n]=r,this._prevProperties[n]=r)}),$}render(t){return $}},so=Bt(ce)});var tt,Nt=u(()=>{D();tt=P`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var sn,io,co=u(()=>{D();Nt();sn=[tt,P`
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
  `],io=sn});var z,yt,_,lo=u(()=>{D();It();ae();ie();Ot();ao();co();z=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(s=(r<3?a(s):r>3?a(t,o,s):a(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},_=yt=class extends R{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();yt.stylesheetHref=t,yt.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=yt,n=A`<span
      class=${Ut({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${so({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?A` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:A` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return A`
      <link
        rel="stylesheet"
        href=${Q(t)}
        nonce=${Q(o)}
      />
      ${r}
    `}};_.styles=io;_.stylesheetHref="";_.nonce="";z([m()],_.prototype,"label",void 0);z([m({type:String})],_.prototype,"name",void 0);z([m({type:Number})],_.prototype,"size",void 0);z([m({type:Boolean,reflect:!0})],_.prototype,"spin",void 0);z([m({type:Number,attribute:"spin-duration"})],_.prototype,"spinDuration",void 0);z([m({type:Boolean,reflect:!0,attribute:"action-icon"})],_.prototype,"actionIcon",void 0);_=yt=z([Z("vscode-icon")],_)});var po=u(()=>{lo()});function Rt(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var de=u(()=>{});var an,cn,uo,ho=u(()=>{D();Nt();de();an=W(Rt()),cn=[tt,P`
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
      font-family: var(--vscode-font-family, ${an});
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
  `],uo=cn});var k,v,mo=u(()=>{D();It();ae();Ot();po();ho();ie();k=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(s=(r<3?a(s):r>3?a(t,o,s):a(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},v=class extends R{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=t?A`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${Q(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:x,s=o?A`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${Q(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:x;return A`
      <div
        class=${Ut(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};v.styles=uo;v.formAssociated=!0;k([m({type:Boolean,reflect:!0})],v.prototype,"autofocus",void 0);k([m({type:Number,reflect:!0})],v.prototype,"tabIndex",void 0);k([m({type:Boolean,reflect:!0})],v.prototype,"secondary",void 0);k([m({type:Boolean,reflect:!0})],v.prototype,"block",void 0);k([m({reflect:!0})],v.prototype,"role",void 0);k([m({type:Boolean,reflect:!0})],v.prototype,"disabled",void 0);k([m()],v.prototype,"icon",void 0);k([m({type:Boolean,reflect:!0,attribute:"icon-spin"})],v.prototype,"iconSpin",void 0);k([m({type:Number,reflect:!0,attribute:"icon-spin-duration"})],v.prototype,"iconSpinDuration",void 0);k([m({attribute:"icon-after"})],v.prototype,"iconAfter",void 0);k([m({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],v.prototype,"iconAfterSpin",void 0);k([m({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],v.prototype,"iconAfterSpinDuration",void 0);k([m({type:Boolean,reflect:!0})],v.prototype,"focused",void 0);k([m({type:String,reflect:!0})],v.prototype,"name",void 0);k([m({type:Boolean,reflect:!0,attribute:"icon-only"})],v.prototype,"iconOnly",void 0);k([m({reflect:!0})],v.prototype,"type",void 0);k([m()],v.prototype,"value",void 0);k([re()],v.prototype,"_hasContentBefore",void 0);k([re()],v.prototype,"_hasContentAfter",void 0);v=k([Z("vscode-button")],v)});var go={};me(go,{VscodeButton:()=>v});var bo=u(()=>{mo()});var dn,ln,fo,vo=u(()=>{D();Nt();de();dn=W(Rt()),ln=[tt,P`
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
      font-family: var(--vscode-font-family, ${dn});
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
  `],fo=ln});var yo,et,xo=u(()=>{D();It();Ot();vo();yo=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(s=(r<3?a(s):r>3?a(t,o,s):a(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},et=class extends R{constructor(){super(...arguments),this.variant="default"}render(){return A`<div class="root"><slot></slot></div>`}};et.styles=fo;yo([m({reflect:!0})],et.prototype,"variant",void 0);et=yo([Z("vscode-badge")],et)});var ko={};me(ko,{VscodeBadge:()=>et});var To=u(()=>{xo()});function q(e){let t=globalThis.window;return t?t[e]:void 0}var Bo=q("__MODEL_PRICING__"),qt={};for(let[e,t]of Object.entries(Bo?.pricing??{}))t.displayNames&&t.displayNames.length>0&&(qt[e]=t.displayNames[0]);function ge(e){if(qt[e])return qt[e];try{return decodeURIComponent(e)}catch{return e}}var be={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",JetBrains:"\u{1F9E9}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function fe(e){return be[e]??"\u{1F4DD}"}var Uo=q("__TOKEN_ESTIMATORS__"),Lo=Uo?.estimators??{},wt,ve=!0;function ye(e){ve=e}function xe(e){return fe(e)}function ke(e){return 1/(Lo[e]??.25)}function Oo(e,t){return new Intl.NumberFormat(wt,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function E(e,t=1){return`${Oo(e,t)}%`}function C(e){return e.toLocaleString(wt)}function h(e){return ve?new Intl.NumberFormat(wt,{notation:"compact",maximumFractionDigits:1}).format(e):C(e)}function H(e){return new Intl.NumberFormat(wt,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function f(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}function Ct(e,t,o,n){let r=document.createElement(e);n&&(r.className=n);let s=document.createElement("span");return s.className=`codicon codicon-${t}`,r.append(s,document.createTextNode(` ${o}`)),r}function No(e,t){let o=document.createElement("span");return o.className=`codicon codicon-${e} nav-icon`,t&&o.style.setProperty("--icon-accent",t),o}function Ro(e,t){t.appearance&&e.setAttribute("appearance",t.appearance),t.hidden&&(e.hidden=!0),t.active&&(e.classList.add("nav-active"),e.setAttribute("disabled",""),e.setAttribute("aria-current","page"))}function Te(e,t,o){let n=document.createElement("vscode-button");if(typeof e=="string")return n.id=e,n.textContent=t||"",o&&n.setAttribute("appearance",o),n;let r=e;return n.id=r.id,r.icon?n.append(No(r.icon,r.iconColor),document.createTextNode(r.label)):n.textContent=r.label,Ro(n,r),n}var Ho={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var jo=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function Ee(e,t){return jo.filter(o=>o!=="btn-dashboard"||t).map(o=>({...Ho[o],active:o===e}))}function Se(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let r=document.createElement("vscode-button");r.id=`ext-point-${n.id}`,r.textContent=n.label,r.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(r)}}var we=`/**
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
`;var Ce=`body {
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
`;function $e(e){window.addEventListener("message",t=>{e(t.data)})}var U=acquireVsCodeApi(),at=q("__INITIAL_DETAILS__");console.log("[CopilotTokenTracker] details webview loaded");console.log("[CopilotTokenTracker] initialData:",at);console.log("[CopilotTokenTracker] initialData:",at);var Tt=at?.sortSettings,xt=Tt?.editor?.key??"name",nt=Tt?.editor?.dir??"asc",kt=Tt?.model?.key??"name",rt=Tt?.model?.dir??"asc",ot=Tt?.modelOtherExpanded??!1;function M(e){return e/30*365.25}function T(e,t){let o=document.createElement("td");return o.className="value-right align-right",o.textContent=e,t!==void 0&&o.append(f("div","muted",t)),o}function pn(e,t,o,n){let r=document.createElement("td"),s=document.createElement("span");s.className="metric-label";let a=document.createElement("span");a.textContent=e,o&&(a.style.color=o);let i=document.createElement("span");if(i.textContent=t,n){s.title=n,s.style.cursor="help";let c=document.createElement("span");c.textContent=" \u2139\uFE0F",c.style.cssText="font-size:0.75em; opacity:0.6;",i.append(c)}return s.append(a,i),r.append(s),r}function Co(e,t,o,n){let r=document.createElement("thead"),s=document.createElement("tr"),a=[];function i(){a.forEach((c,d)=>{c.textContent=`${e[d].icon} ${e[d].text}${Eo(e[d].key,t(),o())}`})}return e.forEach((c,d)=>{let p=document.createElement("th");p.className=d===0?"":"align-right",p.style.cursor="pointer",p.style.userSelect="none",p.title=`Sort by ${c.text}`;let l=f("div","period-header");l.textContent=`${c.icon} ${c.text}${Eo(c.key,t(),o())}`,p.append(l),a.push(l),p.addEventListener("click",()=>{n(c.key),i()}),s.append(p)}),r.append(s),{thead:r,updateHeaders:i}}function $o(e){ye(e.compactNumbers!==!1);let t=document.getElementById("root");if(!t)return;let o=Math.round(M(e.last30Days.tokens+e.last30Days.thinkingTokens)),n=Math.round(M(e.last30Days.sessions)),r=M(e.last30Days.co2),s=M(e.last30Days.waterUsage),a=M(e.last30Days.estimatedCost),i=M(e.last30Days.estimatedCostCopilot??0),c=M(e.last30Days.treesEquivalent);un(t,e,{projectedTokens:o,projectedSessions:n,projectedCo2:r,projectedWater:s,projectedCost:a,projectedCostCopilot:i,projectedTrees:c}),wn()}function un(e,t,o){let n=new Date(t.lastUpdated);e.replaceChildren();let r=document.createElement("style");r.textContent=we;let s=document.createElement("style");s.textContent=Ce;let a=f("div","container"),i=f("div","header"),c=f("div","header-left");c.append(f("div","title","AI Engineering Fluency"));let d=mn(t);d&&c.append(d);let p=f("div","button-row");p.append(...Ee("btn-details",!!t.backendConfigured).map(it=>Te(it))),i.append(c,p);let l=f("div","footer",`Last updated: ${n.toLocaleString()} \xB7 Updates every 5 minutes`),g=f("div","sections");(t.today.tokens??0)===0&&(t.last30Days.tokens??0)===0&&(t.lastMonth.tokens??0)===0?g.append(Sn()):g.append(gn(t)),g.append(vn(t,o));let b=xn(t);b&&g.append(b);let w=En(t);w&&g.append(w),a.append(i,g,l),e.append(r,s,a)}function _o(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.inputTokens,0)}function Ao(e){return Object.values(e.modelUsage).reduce((t,o)=>t+o.outputTokens,0)}function le(e){return(e.actualTokens||0)>0}function Ht(e){return le(e)?E((e.actualTokens-e.estimatedTokens)/e.actualTokens*100):"\u2014"}function jt(e){return le(e)?h(_o(e)):"\u2014"}function Ft(e){return le(e)?h(Ao(e)):"\u2014"}function st(e){let t=_o(e)+Ao(e);return(e.actualTokens??0)>0?h(e.tokens+e.thinkingTokens):h(t>0?t:e.tokens)}function hn(e){return e.today.cachedTokens||e.last30Days.cachedTokens||e.month.cachedTokens||e.lastMonth.cachedTokens?[{label:"Cached tokens",labelTooltip:'Cache-read tokens \u2014 already included in "Input tokens" above, shown separately because they are billed at a lower rate.',icon:"\u26A1",color:"#34d399",today:h(e.today.cachedTokens||0),last30Days:h(e.last30Days.cachedTokens||0),month:h(e.month.cachedTokens||0),lastMonth:h(e.lastMonth.cachedTokens||0),projected:"\u2014"}]:[]}function mn(e){if(!e.copilotPlan)return null;let t=e.copilotPlan,o=t.monthlyAiCreditsUsd>0?`$${t.monthlyAiCreditsUsd} credits/month`:"no credits",n=f("div","plan-badge",`\u{1F3F7}\uFE0F ${t.planName} \xB7 ${o}`);return n.title=`Your active GitHub Copilot subscription plan (ID: ${t.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`,n}function Vt(e,t,o){let n=f("div","card");return n.id=e,n.append(f("div","card-label",t),f("div","card-value",o)),n}function gn(e){let t=f("div","cards");return t.id="summary-cards",t.append(Vt("card-today-tokens","\u{1F4C5} Tokens Today",st(e.today)),Vt("card-30d-tokens","\u{1F4C8} Tokens Last 30 Days",st(e.last30Days)),Vt("card-month-cost","\u{1F4B0} Est. Cost This Month (UBB)",H(e.month.estimatedCostCopilot??0)),Vt("card-today-sessions","\u{1F4C2} Sessions Today",C(e.today.sessions))),t}function bn(e,t){let o=[{label:"Total tokens",labelTooltip:"All LLM API tokens counted across every call in this period \u2014 matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.",icon:"\u{1F7E3}",color:"#c37bff",today:st(e.today),last30Days:st(e.last30Days),month:st(e.month),lastMonth:st(e.lastMonth),projected:h(t.projectedTokens)},{label:"Input tokens",labelTooltip:"Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).",icon:"\u2B06\uFE0F",color:"#c37bff",today:jt(e.today),last30Days:jt(e.last30Days),month:jt(e.month),lastMonth:jt(e.lastMonth),projected:"\u2014"},{label:"Output tokens",icon:"\u2B07\uFE0F",color:"#c37bff",today:Ft(e.today),last30Days:Ft(e.last30Days),month:Ft(e.month),lastMonth:Ft(e.lastMonth),projected:"\u2014"},...hn(e),{label:"Tokens (user estimated)",icon:"\u{1F4DD}",color:"#b39ddb",today:h(e.today.estimatedTokens),last30Days:h(e.last30Days.estimatedTokens),month:h(e.month.estimatedTokens),lastMonth:h(e.lastMonth.estimatedTokens),projected:"\u2014"},{label:"Service overhead %",icon:"\u2601\uFE0F",color:"#90a4ae",today:Ht(e.today),last30Days:Ht(e.last30Days),month:Ht(e.month),lastMonth:Ht(e.lastMonth),projected:"\u2014"},{label:"Thinking tokens",icon:"\u{1F9E0}",color:"#a78bfa",today:h(e.today.thinkingTokens||0),last30Days:h(e.last30Days.thinkingTokens||0),month:h(e.month.thinkingTokens||0),lastMonth:h(e.lastMonth.thinkingTokens||0),projected:"\u2014"}],n=[{label:"Estimated cost (UBB)",labelTooltip:"Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.",icon:"\u{1F7E2}",color:"#7ce38b",today:H(e.today.estimatedCostCopilot??0),last30Days:H(e.last30Days.estimatedCostCopilot??0),month:H(e.month.estimatedCostCopilot??0),lastMonth:H(e.lastMonth.estimatedCostCopilot??0),projected:H(t.projectedCostCopilot??0)}],r=[{label:"Sessions",icon:"\u{1F4C2}",color:"#66aaff",today:C(e.today.sessions),last30Days:C(e.last30Days.sessions),month:C(e.month.sessions),lastMonth:C(e.lastMonth.sessions),projected:C(t.projectedSessions)},{label:"Average interactions/session",icon:"\u{1F4AC}",color:"#8ce0ff",today:C(e.today.avgInteractionsPerSession),last30Days:C(e.last30Days.avgInteractionsPerSession),month:C(e.month.avgInteractionsPerSession),lastMonth:C(e.lastMonth.avgInteractionsPerSession),projected:"\u2014"},{label:"Average tokens/session",icon:"\u{1F522}",color:"#7ce38b",today:h(e.today.avgTokensPerSession),last30Days:h(e.last30Days.avgTokensPerSession),month:h(e.month.avgTokensPerSession),lastMonth:h(e.lastMonth.avgTokensPerSession),projected:"\u2014"}];return[{heading:"\u{1F522} Tokens",rows:o},{heading:"\u{1F4B0} Cost",rows:n},{heading:"\u{1F4AC} Activity",rows:r}]}function fn(e){let t=document.createElement("tr");t.className="group-row";let o=document.createElement("td");return o.colSpan=6,o.textContent=e,t.append(o),t}function vn(e,t){let o=f("div","section");o.append(Ct("h3","graph","Key Metrics"));let n=document.createElement("table");n.className="stats-table";let r=document.createElement("thead"),s=document.createElement("tr");[{icon:"\u{1F4CA}",text:"Metric"},{icon:"\u{1F4C5}",text:"Today"},{icon:"\u{1F4C8}",text:"Last 30 Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month"},{icon:"\u{1F4C6}",text:"Previous Month"},{icon:"\u{1F30D}",text:"Projected Year"}].forEach((c,d)=>{let p=document.createElement("th");p.className=d===0?"":"align-right";let l=f("div","period-header");l.textContent=`${c.icon} ${c.text}`,p.append(l),s.append(p)}),r.append(s),n.append(r);let i=document.createElement("tbody");return bn(e,t).forEach(c=>{i.append(fn(c.heading)),c.rows.forEach(d=>{let p=document.createElement("tr");p.append(pn(d.icon,d.label,d.color,d.labelTooltip),T(d.today),T(d.last30Days),T(d.month),T(d.lastMonth),T(d.projected)),i.append(p)})}),n.append(i),o.append(n),o}function Eo(e,t,o){return e!==t?" \u2195":o==="asc"?" \u2191":" \u2193"}function pe(){U.postMessage({command:"saveSortSettings",settings:{editor:{key:xt,dir:nt},model:{key:kt,dir:rt},modelOtherExpanded:ot}})}function yn(e,t){let{editor:o,todayUsage:n,last30DaysUsage:r,monthUsage:s,lastMonthUsage:a,projectedTokens:i,projectedSessions:c}=e,d=t.today>0?n.tokens/t.today*100:0,p=t.last30Days>0?r.tokens/t.last30Days*100:0,l=t.month>0?s.tokens/t.month*100:0,g=t.lastMonth>0?a.tokens/t.lastMonth*100:0,y=document.createElement("tr");o==="JetBrains"&&(y.title="JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available."),o==="Antigravity"&&(y.title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."),o==="Cursor"&&(y.title="Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.");let b=document.createElement("td"),w=document.createElement("span");return w.className="metric-label",w.textContent=`${xe(o)} ${o}`,(o==="JetBrains"||o==="Antigravity"||o==="Cursor")&&(w.textContent=`${w.textContent} \u24D8`),b.append(w),y.append(b,T(h(n.tokens),`${E(d)} \xB7 ${n.sessions} sessions`),T(h(r.tokens),`${E(p)} \xB7 ${r.sessions} sessions`),T(h(s.tokens),`${E(l)} \xB7 ${s.sessions} sessions`),T(h(a.tokens),`${E(g)} \xB7 ${a.sessions} sessions`),T(h(i),`${c} sessions`)),y}function So(e,t){let o={today:Object.values(e.today.editorUsage).reduce((s,a)=>s+a.tokens,0),last30Days:Object.values(e.last30Days.editorUsage).reduce((s,a)=>s+a.tokens,0),month:Object.values(e.month.editorUsage).reduce((s,a)=>s+a.tokens,0),lastMonth:Object.values(e.lastMonth.editorUsage).reduce((s,a)=>s+a.tokens,0)},n=t.map(s=>{let a=e.today.editorUsage[s]||{tokens:0,sessions:0},i=e.last30Days.editorUsage[s]||{tokens:0,sessions:0},c=e.month.editorUsage[s]||{tokens:0,sessions:0},d=e.lastMonth.editorUsage[s]||{tokens:0,sessions:0};return{editor:s,todayUsage:a,last30DaysUsage:i,monthUsage:c,lastMonthUsage:d,projectedTokens:Math.round(M(i.tokens)),projectedSessions:Math.round(M(i.sessions))}});n.sort((s,a)=>{let i;switch(xt){case"name":i=s.editor.localeCompare(a.editor);break;case"today":i=s.todayUsage.tokens-a.todayUsage.tokens;break;case"last30Days":i=s.last30DaysUsage.tokens-a.last30DaysUsage.tokens;break;case"month":i=s.monthUsage.tokens-a.monthUsage.tokens;break;case"lastMonth":i=s.lastMonthUsage.tokens-a.lastMonthUsage.tokens;break;case"projected":i=s.projectedTokens-a.projectedTokens;break;default:i=0}return nt==="asc"?i:-i});let r=document.createElement("tbody");return n.forEach(s=>r.append(yn(s,o))),r}function xn(e){let t=new Set([...Object.keys(e.today.editorUsage),...Object.keys(e.last30Days.editorUsage),...Object.keys(e.month.editorUsage),...Object.keys(e.lastMonth.editorUsage)]);if(t.size===0)return null;let o=f("div","section"),n=Ct("h3","device-desktop","Usage by Editor");o.append(n);let r=document.createElement("table");r.className="stats-table";let s=[{icon:"\u{1F4DD}",text:"Editor",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}],{thead:a}=Co(s,()=>xt,()=>nt,i=>{xt===i?nt=nt==="asc"?"desc":"asc":(xt=i,nt=i==="name"?"asc":"desc");let c=So(e,Array.from(t)),d=r.querySelector("tbody");d?r.replaceChild(c,d):r.append(c),pe()});return r.append(a),r.append(So(e,Array.from(t))),o.append(r),o}var wo=5;function Mo(e,t){let o=e.today.modelUsage[t]||{inputTokens:0,outputTokens:0},n=e.last30Days.modelUsage[t]||{inputTokens:0,outputTokens:0},r=e.month.modelUsage[t]||{inputTokens:0,outputTokens:0},s=e.lastMonth.modelUsage[t]||{inputTokens:0,outputTokens:0},a=o.inputTokens+o.outputTokens,i=n.inputTokens+n.outputTokens,c=r.inputTokens+r.outputTokens,d=s.inputTokens+s.outputTokens;return{model:t,todayTotal:a,todayInputPct:a>0?o.inputTokens/a*100:0,todayOutputPct:a>0?o.outputTokens/a*100:0,last30DaysTotal:i,last30DaysInputPct:i>0?n.inputTokens/i*100:0,last30DaysOutputPct:i>0?n.outputTokens/i*100:0,monthTotal:c,monthInputPct:c>0?r.inputTokens/c*100:0,monthOutputPct:c>0?r.outputTokens/c*100:0,lastMonthTotal:d,lastMonthInputPct:d>0?s.inputTokens/d*100:0,lastMonthOutputPct:d>0?s.outputTokens/d*100:0,projected:Math.round(M(i)),charsPerToken:ke(t)}}function Do(e){e.sort((t,o)=>{let n;switch(kt){case"name":n=t.model.localeCompare(o.model);break;case"today":n=t.todayTotal-o.todayTotal;break;case"last30Days":n=t.last30DaysTotal-o.last30DaysTotal;break;case"month":n=t.monthTotal-o.monthTotal;break;case"lastMonth":n=t.lastMonthTotal-o.lastMonthTotal;break;case"projected":n=t.projected-o.projected;break;default:n=0}return rt==="asc"?n:-n})}function Io(e,t){let o=document.createElement("tr");t&&(o.style.opacity="0.85");let n=document.createElement("td"),r=document.createElement("span");if(r.className="metric-label",t){let a=document.createElement("span");a.style.cssText="display:inline-block;width:12px",r.append(a)}let s=document.createElement("span");return s.style.cssText="color:#9aa0a6;font-size:11px;font-weight:500;",s.textContent=`(~${e.charsPerToken.toFixed(1)} chars/tk)`,r.append(document.createTextNode(`${ge(e.model)} `),s),n.append(r),o.append(n,T(h(e.todayTotal),`\u2191${E(e.todayInputPct)} \u2193${E(e.todayOutputPct)}`),T(h(e.last30DaysTotal),`\u2191${E(e.last30DaysInputPct)} \u2193${E(e.last30DaysOutputPct)}`),T(h(e.monthTotal),`\u2191${E(e.monthInputPct)} \u2193${E(e.monthOutputPct)}`),T(h(e.lastMonthTotal),`\u2191${E(e.lastMonthInputPct)} \u2193${E(e.lastMonthOutputPct)}`),T(h(e.projected))),o}function kn(e,t,o,n){let r=I=>t.reduce((S,St)=>{let he=e[I].modelUsage[St]||{inputTokens:0,outputTokens:0};return{inputTokens:S.inputTokens+he.inputTokens,outputTokens:S.outputTokens+he.outputTokens}},{inputTokens:0,outputTokens:0}),s=(I,S)=>S>0?I/S*100:0,a=r("today"),i=r("last30Days"),c=r("month"),d=r("lastMonth"),p=a.inputTokens+a.outputTokens,l=i.inputTokens+i.outputTokens,g=c.inputTokens+c.outputTokens,y=d.inputTokens+d.outputTokens,b=document.createElement("tr");b.style.cursor="pointer",b.style.background="var(--list-hover-bg)",b.title=ot?"Collapse other models":"Expand other models";let w=document.createElement("span");w.className="metric-label";let it=document.createElement("span");it.style.cssText="color:var(--text-secondary);font-weight:600;",it.textContent=`\u{1F4E6} Other (${t.length} model${t.length!==1?"s":""})`;let zt=document.createElement("span");zt.style.cssText="font-size:10px;color:var(--text-muted)",zt.textContent=` ${ot?"\u25B2":"\u25BC"}`,w.append(it,zt);let ue=document.createElement("td");ue.append(w);let Et=(I,S)=>{let St=T(h(S));return S>0&&St.append(f("div","muted",`\u2191${E(s(I.inputTokens,S))} \u2193${E(s(I.outputTokens,S))}`)),St};if(b.append(ue,Et(a,p),Et(i,l),Et(c,g),Et(d,y),T(h(Math.round(M(l))))),b.addEventListener("click",()=>{ot=!ot,pe(),o()}),n.append(b),ot){let I=t.map(S=>Mo(e,S));Do(I),I.forEach(S=>n.append(Io(S,!0)))}}function Tn(e,t,o,n){let r=t.map(a=>Mo(e,a));Do(r);let s=document.createElement("tbody");return r.forEach(a=>s.append(Io(a,!1))),o.length>0&&kn(e,o,n,s),s}function En(e){let t=new Set([...Object.keys(e.today.modelUsage),...Object.keys(e.last30Days.modelUsage),...Object.keys(e.month.modelUsage),...Object.keys(e.lastMonth.modelUsage)]);if(t.size===0)return null;let o=Array.from(t).sort((l,g)=>{let y=e.last30Days.modelUsage[l]||{inputTokens:0,outputTokens:0},b=e.last30Days.modelUsage[g]||{inputTokens:0,outputTokens:0};return b.inputTokens+b.outputTokens-(y.inputTokens+y.outputTokens)}),n=o.slice(0,wo),r=o.slice(wo),s=f("div","section"),a=Ct("h3","symbol-numeric","Model Usage (Tokens)");s.append(a);let i=document.createElement("table");i.className="stats-table";let c=[{icon:"\u{1F9E0}",text:"Model",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function d(){let l=Tn(e,n,r,d),g=i.querySelector("tbody");g?i.replaceChild(l,g):i.append(l)}let{thead:p}=Co(c,()=>kt,()=>rt,l=>{kt===l?rt=rt==="asc"?"desc":"asc":(kt=l,rt=l==="name"?"asc":"desc"),d(),pe()});return i.append(p),d(),s.append(i),s}function Sn(){let e=f("div","section"),t=f("div","empty-state"),o=f("div","empty-state-title","\u{1F44B} Welcome to AI Engineering Fluency"),n=f("p","empty-state-description","This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."),r=document.createElement("p");r.className="empty-state-description";let s=document.createElement("strong");s.textContent="Supported tools & editors:",r.append(s);let a=document.createElement("ul");a.className="empty-state-steps",["\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE","\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent","\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal","\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat","\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent","\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents","\u03C0 Pi \u2014 Mistral-powered terminal coding agent","\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension","\u{1F499} VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension"].forEach(y=>{let b=document.createElement("li");b.textContent=y,a.append(b)});let c=document.createElement("p");c.className="empty-state-description";let d=document.createElement("strong");d.textContent="To get started:",c.append(d);let p=document.createElement("ol");p.className="empty-state-steps",["Use any of the supported tools or editors listed above to interact with an AI model.","For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.","For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.","Click the \u{1F504} Refresh button above to reload the stats after your first session."].forEach(y=>{let b=document.createElement("li");b.textContent=y,p.append(b)});let g=f("div","empty-state-note","\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly.");return t.append(o,n,r,a,c,p,g),e.append(t),e}function wn(){let e=document.getElementById("btn-refresh"),t=document.getElementById("btn-chart"),o=document.getElementById("btn-usage"),n=document.getElementById("btn-diagnostics");e?.addEventListener("click",()=>U.postMessage({command:"refresh"})),t?.addEventListener("click",()=>U.postMessage({command:"showChart"})),o?.addEventListener("click",()=>U.postMessage({command:"showUsageAnalysis"})),n?.addEventListener("click",()=>U.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>U.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>U.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>U.postMessage({command:"showEnvironmental"})),Se(U)}async function Cn(){if(console.log("[CopilotTokenTracker] bootstrap called"),await Promise.resolve().then(()=>(bo(),go)),await Promise.resolve().then(()=>(To(),ko)),at)console.log("[CopilotTokenTracker] Rendering details with initialData:",at),$o(at);else{console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");let e=document.getElementById("root");if(e){e.textContent="";let t=document.createElement("div");t.style.padding="16px",t.style.color="#e7e7e7",t.textContent="No data available.",e.append(t)}}}$e(e=>{e.command==="updateStats"&&$o(e.data)});Cn();})();
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
