"use strict";(()=>{var qe=Object.defineProperty;var d=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var ze=(e,t)=>{for(var o in t)qe(e,o,{get:t[o],enumerable:!0})};var rt,st,$t,Xt,z,it,M,Zt,wt,At=d(()=>{rt=globalThis,st=rt.ShadowRoot&&(rt.ShadyCSS===void 0||rt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,$t=Symbol(),Xt=new WeakMap,z=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==$t)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(st&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=Xt.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Xt.set(o,t))}return t}toString(){return this.cssText}},it=e=>new z(typeof e=="string"?e:e+"",void 0,$t),M=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,r,s)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[s+1],e[0]);return new z(o,e,$t)},Zt=(e,t)=>{if(st)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),r=rt.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=o.cssText,e.appendChild(n)}},wt=st?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return it(o)})(e):e});var to,eo,oo,no,ro,so,S,Qt,io,ao,W,G,at,te,$,K=d(()=>{At();At();({is:to,defineProperty:eo,getOwnPropertyDescriptor:oo,getOwnPropertyNames:no,getOwnPropertySymbols:ro,getPrototypeOf:so}=Object),S=globalThis,Qt=S.trustedTypes,io=Qt?Qt.emptyScript:"",ao=S.reactiveElementPolyfillSupport,W=(e,t)=>e,G={toAttribute(e,t){switch(t){case Boolean:e=e?io:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},at=(e,t)=>!to(e,t),te={attribute:!0,type:String,converter:G,reflect:!1,useDefault:!1,hasChanged:at};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),S.litPropertyMetadata??(S.litPropertyMetadata=new WeakMap);$=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=te){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(t,n,o);r!==void 0&&eo(this.prototype,t,r)}}static getPropertyDescriptor(t,o,n){let{get:r,set:s}=oo(this.prototype,t)??{get(){return this[o]},set(i){this[o]=i}};return{get:r,set(i){let a=r?.call(this);s?.call(this,i),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??te}static _$Ei(){if(this.hasOwnProperty(W("elementProperties")))return;let t=so(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(W("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(W("properties"))){let o=this.properties,n=[...no(o),...ro(o)];for(let r of n)this.createProperty(r,o[r])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,r]of o)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let r=this._$Eu(o,n);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let r of n)o.unshift(wt(r))}else t!==void 0&&o.push(wt(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Zt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,n);if(r!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:G).toAttribute(o,n.type);this._$Em=t,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,o){let n=this.constructor,r=n._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let s=n.getPropertyOptions(r),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:G;this._$Em=r;let a=i.fromAttribute(o,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(t,o,n,r=!1,s){if(t!==void 0){let i=this.constructor;if(r===!1&&(s=this[t]),n??(n=i.getPropertyOptions(t)),!((n.hasChanged??at)(s,o)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:r,wrapped:s},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??o??this[t]),s!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:i}=s,a=this[r];i!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[W("elementProperties")]=new Map,$[W("finalized")]=new Map,ao?.({ReactiveElement:$}),(S.reactiveElementVersions??(S.reactiveElementVersions=[])).push("2.1.2")});function ue(e,t){if(!Bt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return oe!==void 0?oe.createHTML(t):t}function N(e,t,o=e,n){if(t===x)return t;let r=n!==void 0?o._$Co?.[n]:o._$Cl,s=Z(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(e),r._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=r:o._$Cl=r),r!==void 0&&(t=N(e,r._$AS(e,t.values),r,n)),t}var J,ee,ct,oe,ce,k,de,co,L,X,Z,Bt,lo,St,Y,ne,re,B,se,ie,le,Pt,w,on,nn,x,m,ae,P,uo,Q,kt,tt,O,Ct,Tt,It,Mt,ho,he,U=d(()=>{J=globalThis,ee=e=>e,ct=J.trustedTypes,oe=ct?ct.createPolicy("lit-html",{createHTML:e=>e}):void 0,ce="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,de="?"+k,co=`<${de}>`,L=document,X=()=>L.createComment(""),Z=e=>e===null||typeof e!="object"&&typeof e!="function",Bt=Array.isArray,lo=e=>Bt(e)||typeof e?.[Symbol.iterator]=="function",St=`[ 	
\f\r]`,Y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ne=/-->/g,re=/>/g,B=RegExp(`>|${St}(?:([^\\s"'>=/]+)(${St}*=${St}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),se=/'/g,ie=/"/g,le=/^(?:script|style|textarea|title)$/i,Pt=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),w=Pt(1),on=Pt(2),nn=Pt(3),x=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),ae=new WeakMap,P=L.createTreeWalker(L,129);uo=(e,t)=>{let o=e.length-1,n=[],r,s=t===2?"<svg>":t===3?"<math>":"",i=Y;for(let a=0;a<o;a++){let c=e[a],g,f,l=-1,y=0;for(;y<c.length&&(i.lastIndex=y,f=i.exec(c),f!==null);)y=i.lastIndex,i===Y?f[1]==="!--"?i=ne:f[1]!==void 0?i=re:f[2]!==void 0?(le.test(f[2])&&(r=RegExp("</"+f[2],"g")),i=B):f[3]!==void 0&&(i=B):i===B?f[0]===">"?(i=r??Y,l=-1):f[1]===void 0?l=-2:(l=i.lastIndex-f[2].length,g=f[1],i=f[3]===void 0?B:f[3]==='"'?ie:se):i===ie||i===se?i=B:i===ne||i===re?i=Y:(i=B,r=void 0);let E=i===B&&e[a+1].startsWith("/>")?" ":"";s+=i===Y?c+co:l>=0?(n.push(g),c.slice(0,l)+ce+c.slice(l)+k+E):c+k+(l===-2?a:E)}return[ue(e,s+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},Q=class e{constructor({strings:t,_$litType$:o},n){let r;this.parts=[];let s=0,i=0,a=t.length-1,c=this.parts,[g,f]=uo(t,o);if(this.el=e.createElement(g,n),P.currentNode=this.el.content,o===2||o===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=P.nextNode())!==null&&c.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let l of r.getAttributeNames())if(l.endsWith(ce)){let y=f[i++],E=r.getAttribute(l).split(k),A=/([.?@])?(.*)/.exec(y);c.push({type:1,index:s,name:A[2],strings:E,ctor:A[1]==="."?Ct:A[1]==="?"?Tt:A[1]==="@"?It:O}),r.removeAttribute(l)}else l.startsWith(k)&&(c.push({type:6,index:s}),r.removeAttribute(l));if(le.test(r.tagName)){let l=r.textContent.split(k),y=l.length-1;if(y>0){r.textContent=ct?ct.emptyScript:"";for(let E=0;E<y;E++)r.append(l[E],X()),P.nextNode(),c.push({type:2,index:++s});r.append(l[y],X())}}}else if(r.nodeType===8)if(r.data===de)c.push({type:2,index:s});else{let l=-1;for(;(l=r.data.indexOf(k,l+1))!==-1;)c.push({type:7,index:s}),l+=k.length-1}s++}}static createElement(t,o){let n=L.createElement("template");return n.innerHTML=t,n}};kt=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,r=(t?.creationScope??L).importNode(o,!0);P.currentNode=r;let s=P.nextNode(),i=0,a=0,c=n[0];for(;c!==void 0;){if(i===c.index){let g;c.type===2?g=new tt(s,s.nextSibling,this,t):c.type===1?g=new c.ctor(s,c.name,c.strings,this,t):c.type===6&&(g=new Mt(s,this,t)),this._$AV.push(g),c=n[++a]}i!==c?.index&&(s=P.nextNode(),i++)}return P.currentNode=L,r}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},tt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=N(this,t,o),Z(t)?t===m||t==null||t===""?(this._$AH!==m&&this._$AR(),this._$AH=m):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):lo(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==m&&Z(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,r=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=Q.createElement(ue(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new kt(r,this),i=s.u(this.options);s.p(o),this.T(i),this._$AH=s}}_$AC(t){let o=ae.get(t.strings);return o===void 0&&ae.set(t.strings,o=new Q(t)),o}k(t){Bt(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,r=0;for(let s of t)r===o.length?o.push(n=new e(this.O(X()),this.O(X()),this,this.options)):n=o[r],n._$AI(s),r++;r<o.length&&(this._$AR(n&&n._$AB.nextSibling,r),o.length=r)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=ee(t).nextSibling;ee(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,r,s){this.type=1,this._$AH=m,this._$AN=void 0,this.element=t,this.name=o,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=m}_$AI(t,o=this,n,r){let s=this.strings,i=!1;if(s===void 0)t=N(this,t,o,0),i=!Z(t)||t!==this._$AH&&t!==x,i&&(this._$AH=t);else{let a=t,c,g;for(t=s[0],c=0;c<s.length-1;c++)g=N(this,a[n+c],o,c),g===x&&(g=this._$AH[c]),i||(i=!Z(g)||g!==this._$AH[c]),g===m?t=m:t!==m&&(t+=(g??"")+s[c+1]),this._$AH[c]=g}i&&!r&&this.j(t)}j(t){t===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Ct=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===m?void 0:t}},Tt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==m)}},It=class extends O{constructor(t,o,n,r,s){super(t,o,n,r,s),this.type=5}_$AI(t,o=this){if((t=N(this,t,o,0)??m)===x)return;let n=this._$AH,r=t===m&&n!==m||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==m&&(n===m||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Mt=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}},ho=J.litHtmlPolyfillSupport;ho?.(Q,tt),(J.litHtmlVersions??(J.litHtmlVersions=[])).push("3.3.3");he=(e,t,o)=>{let n=o?.renderBefore??t,r=n._$litPart$;if(r===void 0){let s=o?.renderBefore??null;n._$litPart$=r=new tt(t.insertBefore(X(),s),s,void 0,o??{})}return r._$AI(e),r}});var et,C,po,pe=d(()=>{K();K();U();U();et=globalThis,C=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=he(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};C._$litElement$=!0,C.finalized=!0,et.litElementHydrateSupport?.({LitElement:C});po=et.litElementPolyfillSupport;po?.({LitElement:C});(et.litElementVersions??(et.litElementVersions=[])).push("4.2.2")});var ge=d(()=>{});var T=d(()=>{K();U();pe();ge()});var me=d(()=>{});function u(e){return(t,o)=>typeof o=="object"?mo(e,t,o):((n,r,s)=>{let i=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),i?Object.getOwnPropertyDescriptor(r,s):void 0})(e,t,o)}var go,mo,Lt=d(()=>{K();go={attribute:!0,type:String,converter:G,reflect:!1,hasChanged:at},mo=(e=go,t,o)=>{let{kind:n,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),s.set(o.name,e),n==="accessor"){let{name:i}=o;return{set(a){let c=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,c,e,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,e,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let c=this[i];t.call(this,a),this.requestUpdate(i,c,e,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function Rt(e){return u({...e,state:!0,attribute:!1})}var fe=d(()=>{Lt();});var be=d(()=>{});var H=d(()=>{});var ve=d(()=>{H();});var ye=d(()=>{H();});var xe=d(()=>{H();});var _e=d(()=>{H();});var Ee=d(()=>{H();});var Dt=d(()=>{me();Lt();fe();be();ve();ye();xe();_e();Ee()});var lt,ut,F,Nt=d(()=>{lt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ut=e=>(...t)=>({_$litDirective$:e,values:t}),F=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var ht,$e=d(()=>{U();Nt();ht=ut(class extends F{constructor(e){if(super(e),e.type!==lt.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let r=!!t[n];r===this.st.has(n)||this.nt?.has(n)||(r?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return x}})});var Ot=d(()=>{$e()});var pt,we,Ae,V,gt,Ut=d(()=>{T();pt="2.5.1",we="__vscodeElements_disableRegistryWarning__",Ae=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},V=class extends C{get version(){return pt}warn(t){Ae(t,this)}},gt=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(we in window)return;let r=document.createElement(e)?.version,s="";r?r!==pt?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${pt}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${pt}).`:s+="is already registered by an unknown custom element handler class.",Ae(`The custom element "${e}" ${s}
To suppress this warning, set window.${we} to true`)}});var j,Se=d(()=>{U();j=e=>e??m});var Ht=d(()=>{Se()});var ke=d(()=>{Nt()});var Ft,Ce,Te=d(()=>{T();ke();Ft=class extends F{constructor(t){if(super(t),this._prevProperties={},t.type!==lt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,r])=>{this._prevProperties[n]!==r&&(n.startsWith("--")?t.element.style.setProperty(n,r):t.element.style[n]=r,this._prevProperties[n]=r)}),x}render(t){return x}},Ce=ut(Ft)});var mt,Vt=d(()=>{T();mt=M`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var fo,Ie,Me=d(()=>{T();Vt();fo=[mt,M`
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
  `],Ie=fo});var R,ot,_,Be=d(()=>{T();Dt();Ot();Ht();Ut();Te();Me();R=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},_=ot=class extends V{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();ot.stylesheetHref=t,ot.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=ot,n=w`<span
      class=${ht({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${Ce({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?w` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:w` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return w`
      <link
        rel="stylesheet"
        href=${j(t)}
        nonce=${j(o)}
      />
      ${r}
    `}};_.styles=Ie;_.stylesheetHref="";_.nonce="";R([u()],_.prototype,"label",void 0);R([u({type:String})],_.prototype,"name",void 0);R([u({type:Number})],_.prototype,"size",void 0);R([u({type:Boolean,reflect:!0})],_.prototype,"spin",void 0);R([u({type:Number,attribute:"spin-duration"})],_.prototype,"spinDuration",void 0);R([u({type:Boolean,reflect:!0,attribute:"action-icon"})],_.prototype,"actionIcon",void 0);_=ot=R([gt("vscode-icon")],_)});var Pe=d(()=>{Be()});function Le(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var Re=d(()=>{});var bo,vo,De,Ne=d(()=>{T();Vt();Re();bo=it(Le()),vo=[mt,M`
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
      font-family: var(--vscode-font-family, ${bo});
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
  `],De=vo});var v,h,Oe=d(()=>{T();Dt();Ot();Ut();Pe();Ne();Ht();v=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},h=class extends V{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=t?w`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${j(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:m,s=o?w`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${j(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:m;return w`
      <div
        class=${ht(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};h.styles=De;h.formAssociated=!0;v([u({type:Boolean,reflect:!0})],h.prototype,"autofocus",void 0);v([u({type:Number,reflect:!0})],h.prototype,"tabIndex",void 0);v([u({type:Boolean,reflect:!0})],h.prototype,"secondary",void 0);v([u({type:Boolean,reflect:!0})],h.prototype,"block",void 0);v([u({reflect:!0})],h.prototype,"role",void 0);v([u({type:Boolean,reflect:!0})],h.prototype,"disabled",void 0);v([u()],h.prototype,"icon",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-spin"})],h.prototype,"iconSpin",void 0);v([u({type:Number,reflect:!0,attribute:"icon-spin-duration"})],h.prototype,"iconSpinDuration",void 0);v([u({attribute:"icon-after"})],h.prototype,"iconAfter",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],h.prototype,"iconAfterSpin",void 0);v([u({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],h.prototype,"iconAfterSpinDuration",void 0);v([u({type:Boolean,reflect:!0})],h.prototype,"focused",void 0);v([u({type:String,reflect:!0})],h.prototype,"name",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-only"})],h.prototype,"iconOnly",void 0);v([u({reflect:!0})],h.prototype,"type",void 0);v([u()],h.prototype,"value",void 0);v([Rt()],h.prototype,"_hasContentBefore",void 0);v([Rt()],h.prototype,"_hasContentAfter",void 0);h=v([gt("vscode-button")],h)});var Ue={};ze(Ue,{VscodeButton:()=>h});var He=d(()=>{Oe()});function b(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}function _t(e,t,o,n){let r=document.createElement(e);n&&(r.className=n);let s=document.createElement("span");return s.className=`codicon codicon-${t}`,r.append(s,document.createTextNode(` ${o}`)),r}function We(e,t){let o=document.createElement("span");return o.className=`codicon codicon-${e} nav-icon`,t&&o.style.setProperty("--icon-accent",t),o}function Ge(e,t){t.appearance&&e.setAttribute("appearance",t.appearance),t.hidden&&(e.hidden=!0),t.active&&(e.classList.add("nav-active"),e.setAttribute("disabled",""),e.setAttribute("aria-current","page"))}function jt(e,t,o){let n=document.createElement("vscode-button");if(typeof e=="string")return n.id=e,n.textContent=t||"",o&&n.setAttribute("appearance",o),n;let r=e;return n.id=r.id,r.icon?n.append(We(r.icon,r.iconColor),document.createTextNode(r.label)):n.textContent=r.label,Ge(n,r),n}var Ke={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var Ye=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function qt(e,t){return Ye.filter(o=>o!=="btn-dashboard"||t).map(o=>({...Ke[o],active:o===e}))}function nt(e){let t=globalThis.window;return t?t[e]:void 0}var Je=nt("__TOKEN_ESTIMATORS__"),Wo=Je?.estimators??{},Et,zt=!0;function Wt(e){zt=e}function D(e,t){return new Intl.NumberFormat(Et,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function Xe(e){return e.toLocaleString(Et)}function q(e){return zt?new Intl.NumberFormat(Et,{notation:"compact",maximumFractionDigits:1}).format(e):Xe(e)}function Gt(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let r=document.createElement("vscode-button");r.id=`ext-point-${n.id}`,r.textContent=n.label,r.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(r)}}var Kt=`/**
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
`;var Yt=`body {
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

.title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
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

/* --- Metric cards --- */
.metric-cards {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.metric-card {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 8px;
	padding: 14px 16px;
}

.metric-card-header {
	display: flex;
	align-items: center;
	gap: 7px;
	margin-bottom: 12px;
}

.metric-card-icon {
	font-size: 16px;
	line-height: 1;
}

.metric-card-label {
	font-size: 13px;
	font-weight: 700;
	color: var(--text-primary);
	text-transform: uppercase;
	letter-spacing: 0.4px;
}

.metric-primary-value {
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
	padding: 6px 0 10px;
	border-bottom: 1px solid var(--border-subtle);
	margin-bottom: 8px;
}

.analogy-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
}

.analogy-col {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.analogy-col-header {
	font-size: 11px;
	font-weight: 700;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	padding-bottom: 5px;
	border-bottom: 1px solid var(--border-subtle);
	margin-bottom: 2px;
}

.analogy-item {
	display: flex;
	align-items: baseline;
	gap: 6px;
	font-size: 12px;
	color: var(--text-primary);
	line-height: 1.5;
}

.analogy-icon {
	flex-shrink: 0;
	width: 20px;
	text-align: center;
	font-size: 13px;
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

.section-intro {
	color: var(--text-secondary);
	font-size: 12px;
	margin: 0 0 10px;
	line-height: 1.5;
}
`;function Jt(e){window.addEventListener("message",t=>{e(t.data)})}var yo=120,xo=20,_o=41,Eo=180,$o=8,wo=3,Ao=8,So=50,ko=.25,Co=150,To=12,Io=2,I=acquireVsCodeApi(),Fe=nt("__INITIAL_ENVIRONMENTAL__");function ft(e){return e/30*365.25}function p(e){return e<.001?D(e,6):e<1?D(e,4):e<=100?D(e,2):e<=1e3?D(e,1):D(Math.round(e),0)}function bt(e){return e>=1e3?`${p(e/1e3)} kg`:`${p(e)} g`}var vt=e=>[{icon:"\u{1F697}",text:`${p(e/yo)} km driving (EU petrol car)`},{icon:"\u{1F682}",text:`${p(e/_o)} km by train (EU intercity)`},{icon:"\u2708\uFE0F",text:`${p(e/Eo)} km flying (economy, short-haul)`},{icon:"\u{1FAD6}",text:`${p(e/xo)} kettle boils`},{icon:"\u{1F4F1}",text:`${p(e/$o)} smartphone charges`},{icon:"\u{1F4A1}",text:`${p(e/wo)} hours of LED lighting (10 W)`}],yt=e=>[{icon:"\u2615",text:`${p(e/ko)} mugs of tea/coffee`},{icon:"\u{1F6BF}",text:`${p(e/Ao)} shower minutes`},{icon:"\u{1F455}",text:`${p(e/So)} washing machine loads`},{icon:"\u{1F6C1}",text:`${p(e/Co)} standard bathtubs`},{icon:"\u{1F37D}\uFE0F",text:`${p(e/To)} dishwasher cycles`},{icon:"\u{1F4A7}",text:`${p(e/Io)} days of drinking water`}],xt=e=>{let t=e*365.25;return e>=1?[{icon:"\u{1F333}",text:`${p(e)} \xD7 a tree's full annual CO\u2082 absorption`},{icon:"\u{1F332}",text:`Plant ${Math.ceil(e)} trees to fully offset this per year`}]:[{icon:"\u{1F333}",text:`${p(e*100)} % of one tree's annual absorption`},{icon:"\u{1F4C5}",text:`1 tree absorbs this CO\u2082 in about ${p(t)} days`}]};function Ve(e){Wt(e.compactNumbers!==!1);let t=document.getElementById("root");if(!t)return;let o=ft(e.last30Days.co2),n=ft(e.last30Days.waterUsage),r=ft(e.last30Days.treesEquivalent),s=Math.round(ft(e.last30Days.tokens)),i=new Date(e.lastUpdated);t.replaceChildren();let a=document.createElement("style");a.textContent=Kt;let c=document.createElement("style");c.textContent=Yt;let g=b("div","container"),f=b("div","header"),l=b("div","title","\u{1F33F} Environmental Impact"),y=b("div","button-row");y.append(...qt("btn-environmental",!!e.backendConfigured).map(je=>jt(je))),f.append(l,y);let E=b("div","footer",`Last updated: ${i.toLocaleString()} \xB7 Updates every 5 minutes`),A=b("div","sections");A.append(Po(e,s,o,n,r)),A.append(Lo()),g.append(f,A,E),t.append(a,c,g),Ro()}function Mo(e,t,o){let n=b("div","analogy-col");if(n.append(b("div","analogy-col-header",e)),n.append(b("div","metric-primary-value",t)),o)for(let r of o){let s=b("div","analogy-item");s.append(b("span","analogy-icon",r.icon));let i=document.createElement("span");i.textContent=r.text,s.append(i),n.append(s)}return n}function Bo(e,t){let o=b("div","metric-card"),n=b("div","metric-card-header"),r=b("span","metric-card-icon",t.icon);r.style.color=t.color,n.append(r,b("span","metric-card-label",t.label)),o.append(n);let s=b("div","analogy-grid");for(let[i,a,c]of e)s.append(Mo(i,a,c));return o.append(s),o}function Po(e,t,o,n,r){let s=b("div","section"),i=_t("h3","globe","Impact at a Glance");s.append(i);let a=b("p","section-intro");a.textContent="All figures are estimates based on average data center energy and water consumption figures. Analogies use European averages. Treat these as order-of-magnitude indicators, not precise measurements.",s.append(a);let c=[[["\u{1F4C5} Today",q(e.today.tokens),null],["\u{1F4C8} Last 30 Days",q(e.last30Days.tokens),null],["\u{1F4C6} Previous Month",q(e.lastMonth.tokens),null],["\u{1F30D} Projected Year",q(t),null]],[["\u{1F4C5} Today",bt(e.today.co2),vt(e.today.co2)],["\u{1F4C8} Last 30 Days",bt(e.last30Days.co2),vt(e.last30Days.co2)],["\u{1F4C6} Previous Month",bt(e.lastMonth.co2),vt(e.lastMonth.co2)],["\u{1F30D} Projected Year",bt(o),vt(o)]],[["\u{1F4C5} Today",`${p(e.today.waterUsage)} L`,yt(e.today.waterUsage)],["\u{1F4C8} Last 30 Days",`${p(e.last30Days.waterUsage)} L`,yt(e.last30Days.waterUsage)],["\u{1F4C6} Previous Month",`${p(e.lastMonth.waterUsage)} L`,yt(e.lastMonth.waterUsage)],["\u{1F30D} Projected Year",`${p(n)} L`,yt(n)]],[["\u{1F4C5} Today",`${p(e.today.treesEquivalent)} \u{1F333}`,xt(e.today.treesEquivalent)],["\u{1F4C8} Last 30 Days",`${p(e.last30Days.treesEquivalent)} \u{1F333}`,xt(e.last30Days.treesEquivalent)],["\u{1F4C6} Previous Month",`${p(e.lastMonth.treesEquivalent)} \u{1F333}`,xt(e.lastMonth.treesEquivalent)],["\u{1F30D} Projected Year",`${p(r)} \u{1F333}`,xt(r)]]],g=[{icon:"\u{1F7E3}",label:"Tokens (total)",color:"#c37bff"},{icon:"\u{1F331}",label:"Estimated CO\u2082",color:"#7fe36f"},{icon:"\u{1F4A7}",label:"Estimated Water",color:"#6fc3ff"},{icon:"\u{1F333}",label:"Tree equivalent",color:"#9de67f"}],f=b("div","metric-cards");return c.forEach((l,y)=>f.append(Bo(l,g[y]))),s.append(f),s}function Lo(){let e=b("div","section"),t=_t("h3","lightbulb","Calculation & Estimates");e.append(t);let o=document.createElement("ul");return o.className="notes",["Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) under Usage Based Billing.","Estimated CO\u2082 is based on ~0.2 g CO\u2082e per 1,000 tokens (average data center energy mix and PUE).","Estimated water usage is based on ~0.3 L per 1,000 tokens (data center cooling estimates).","Tree equivalent represents the fraction of a single mature tree's annual CO\u2082 absorption (~21 kg/year).","CO\u2082 analogies: petrol car \u2248 120 g/km \xB7 intercity train \u2248 41 g/km \xB7 economy flight \u2248 180 g/km (ICAO avg.) \xB7 smartphone charge \u2248 8 g \xB7 LED bulb \u2248 3 g/hr (10 W, EU grid) \xB7 kettle boil \u2248 20 g.","Water analogies: shower \u2248 8 L/min \xB7 washing machine \u2248 50 L \xB7 standard bathtub \u2248 150 L \xB7 dishwasher \u2248 12 L \xB7 mug of tea \u2248 250 mL \xB7 daily drinking water \u2248 2 L/person.","All analogies are order-of-magnitude estimates. Actual values depend on your region's energy mix and device efficiency."].forEach(r=>{let s=document.createElement("li");s.textContent=r,o.append(s)}),e.append(o),e}function Ro(){document.getElementById("btn-refresh")?.addEventListener("click",()=>I.postMessage({command:"refresh"})),document.getElementById("btn-details")?.addEventListener("click",()=>I.postMessage({command:"showDetails"})),document.getElementById("btn-chart")?.addEventListener("click",()=>I.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>I.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>I.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>I.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>I.postMessage({command:"showDashboard"})),Gt(I)}Jt(e=>{e.command==="updateStats"&&Ve(e.data)});async function Do(){if(await Promise.resolve().then(()=>(He(),Ue)),Fe)Ve(Fe);else{let e=document.getElementById("root");if(e){e.textContent="";let t=document.createElement("div");t.style.padding="16px",t.style.color="#e7e7e7",t.textContent="No data available.",e.append(t)}}}Do();})();
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
