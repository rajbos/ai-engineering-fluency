"use strict";(()=>{var Xe=Object.defineProperty;var d=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var Ze=(e,t)=>{for(var o in t)Xe(e,o,{get:t[o],enumerable:!0})};var it,at,St,se,W,ct,L,ie,kt,Ct=d(()=>{it=globalThis,at=it.ShadowRoot&&(it.ShadyCSS===void 0||it.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,St=Symbol(),se=new WeakMap,W=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==St)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(at&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=se.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&se.set(o,t))}return t}toString(){return this.cssText}},ct=e=>new W(typeof e=="string"?e:e+"",void 0,St),L=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,r,s)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[s+1],e[0]);return new W(o,e,St)},ie=(e,t)=>{if(at)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),r=it.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=o.cssText,e.appendChild(n)}},kt=at?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return ct(o)})(e):e});var po,ho,go,mo,fo,bo,k,ae,vo,yo,q,K,dt,ce,w,G=d(()=>{Ct();Ct();({is:po,defineProperty:ho,getOwnPropertyDescriptor:go,getOwnPropertyNames:mo,getOwnPropertySymbols:fo,getPrototypeOf:bo}=Object),k=globalThis,ae=k.trustedTypes,vo=ae?ae.emptyScript:"",yo=k.reactiveElementPolyfillSupport,q=(e,t)=>e,K={toAttribute(e,t){switch(t){case Boolean:e=e?vo:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},dt=(e,t)=>!po(e,t),ce={attribute:!0,type:String,converter:K,reflect:!1,useDefault:!1,hasChanged:dt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),k.litPropertyMetadata??(k.litPropertyMetadata=new WeakMap);w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=ce){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(t,n,o);r!==void 0&&ho(this.prototype,t,r)}}static getPropertyDescriptor(t,o,n){let{get:r,set:s}=go(this.prototype,t)??{get(){return this[o]},set(i){this[o]=i}};return{get:r,set(i){let a=r?.call(this);s?.call(this,i),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ce}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;let t=bo(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){let o=this.properties,n=[...mo(o),...fo(o)];for(let r of n)this.createProperty(r,o[r])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,r]of o)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let r=this._$Eu(o,n);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let r of n)o.unshift(kt(r))}else t!==void 0&&o.push(kt(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ie(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,n);if(r!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:K).toAttribute(o,n.type);this._$Em=t,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,o){let n=this.constructor,r=n._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let s=n.getPropertyOptions(r),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:K;this._$Em=r;let a=i.fromAttribute(o,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(t,o,n,r=!1,s){if(t!==void 0){let i=this.constructor;if(r===!1&&(s=this[t]),n??(n=i.getPropertyOptions(t)),!((n.hasChanged??dt)(s,o)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:r,wrapped:s},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??o??this[t]),s!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:i}=s,a=this[r];i!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[q("elementProperties")]=new Map,w[q("finalized")]=new Map,yo?.({ReactiveElement:w}),(k.reactiveElementVersions??(k.reactiveElementVersions=[])).push("2.1.2")});function ye(e,t){if(!Rt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(t):t}function O(e,t,o=e,n){if(t===x)return t;let r=n!==void 0?o._$Co?.[n]:o._$Cl,s=Z(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(e),r._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=r:o._$Cl=r),r!==void 0&&(t=O(e,r._$AS(e,t.values),r,n)),t}var J,de,lt,le,fe,C,be,xo,M,X,Z,Rt,_o,Tt,Y,ue,pe,B,he,ge,ve,Dt,$,bn,vn,x,m,me,P,Eo,Q,It,tt,N,Lt,Bt,Pt,Mt,wo,xe,U=d(()=>{J=globalThis,de=e=>e,lt=J.trustedTypes,le=lt?lt.createPolicy("lit-html",{createHTML:e=>e}):void 0,fe="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,be="?"+C,xo=`<${be}>`,M=document,X=()=>M.createComment(""),Z=e=>e===null||typeof e!="object"&&typeof e!="function",Rt=Array.isArray,_o=e=>Rt(e)||typeof e?.[Symbol.iterator]=="function",Tt=`[ 	
\f\r]`,Y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,pe=/>/g,B=RegExp(`>|${Tt}(?:([^\\s"'>=/]+)(${Tt}*=${Tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),he=/'/g,ge=/"/g,ve=/^(?:script|style|textarea|title)$/i,Dt=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),$=Dt(1),bn=Dt(2),vn=Dt(3),x=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),me=new WeakMap,P=M.createTreeWalker(M,129);Eo=(e,t)=>{let o=e.length-1,n=[],r,s=t===2?"<svg>":t===3?"<math>":"",i=Y;for(let a=0;a<o;a++){let c=e[a],g,f,l=-1,y=0;for(;y<c.length&&(i.lastIndex=y,f=i.exec(c),f!==null);)y=i.lastIndex,i===Y?f[1]==="!--"?i=ue:f[1]!==void 0?i=pe:f[2]!==void 0?(ve.test(f[2])&&(r=RegExp("</"+f[2],"g")),i=B):f[3]!==void 0&&(i=B):i===B?f[0]===">"?(i=r??Y,l=-1):f[1]===void 0?l=-2:(l=i.lastIndex-f[2].length,g=f[1],i=f[3]===void 0?B:f[3]==='"'?ge:he):i===ge||i===he?i=B:i===ue||i===pe?i=Y:(i=B,r=void 0);let E=i===B&&e[a+1].startsWith("/>")?" ":"";s+=i===Y?c+xo:l>=0?(n.push(g),c.slice(0,l)+fe+c.slice(l)+C+E):c+C+(l===-2?a:E)}return[ye(e,s+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},Q=class e{constructor({strings:t,_$litType$:o},n){let r;this.parts=[];let s=0,i=0,a=t.length-1,c=this.parts,[g,f]=Eo(t,o);if(this.el=e.createElement(g,n),P.currentNode=this.el.content,o===2||o===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=P.nextNode())!==null&&c.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let l of r.getAttributeNames())if(l.endsWith(fe)){let y=f[i++],E=r.getAttribute(l).split(C),S=/([.?@])?(.*)/.exec(y);c.push({type:1,index:s,name:S[2],strings:E,ctor:S[1]==="."?Lt:S[1]==="?"?Bt:S[1]==="@"?Pt:N}),r.removeAttribute(l)}else l.startsWith(C)&&(c.push({type:6,index:s}),r.removeAttribute(l));if(ve.test(r.tagName)){let l=r.textContent.split(C),y=l.length-1;if(y>0){r.textContent=lt?lt.emptyScript:"";for(let E=0;E<y;E++)r.append(l[E],X()),P.nextNode(),c.push({type:2,index:++s});r.append(l[y],X())}}}else if(r.nodeType===8)if(r.data===be)c.push({type:2,index:s});else{let l=-1;for(;(l=r.data.indexOf(C,l+1))!==-1;)c.push({type:7,index:s}),l+=C.length-1}s++}}static createElement(t,o){let n=M.createElement("template");return n.innerHTML=t,n}};It=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,r=(t?.creationScope??M).importNode(o,!0);P.currentNode=r;let s=P.nextNode(),i=0,a=0,c=n[0];for(;c!==void 0;){if(i===c.index){let g;c.type===2?g=new tt(s,s.nextSibling,this,t):c.type===1?g=new c.ctor(s,c.name,c.strings,this,t):c.type===6&&(g=new Mt(s,this,t)),this._$AV.push(g),c=n[++a]}i!==c?.index&&(s=P.nextNode(),i++)}return P.currentNode=M,r}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},tt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=O(this,t,o),Z(t)?t===m||t==null||t===""?(this._$AH!==m&&this._$AR(),this._$AH=m):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):_o(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==m&&Z(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,r=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=Q.createElement(ye(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new It(r,this),i=s.u(this.options);s.p(o),this.T(i),this._$AH=s}}_$AC(t){let o=me.get(t.strings);return o===void 0&&me.set(t.strings,o=new Q(t)),o}k(t){Rt(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,r=0;for(let s of t)r===o.length?o.push(n=new e(this.O(X()),this.O(X()),this,this.options)):n=o[r],n._$AI(s),r++;r<o.length&&(this._$AR(n&&n._$AB.nextSibling,r),o.length=r)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=de(t).nextSibling;de(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,r,s){this.type=1,this._$AH=m,this._$AN=void 0,this.element=t,this.name=o,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=m}_$AI(t,o=this,n,r){let s=this.strings,i=!1;if(s===void 0)t=O(this,t,o,0),i=!Z(t)||t!==this._$AH&&t!==x,i&&(this._$AH=t);else{let a=t,c,g;for(t=s[0],c=0;c<s.length-1;c++)g=O(this,a[n+c],o,c),g===x&&(g=this._$AH[c]),i||(i=!Z(g)||g!==this._$AH[c]),g===m?t=m:t!==m&&(t+=(g??"")+s[c+1]),this._$AH[c]=g}i&&!r&&this.j(t)}j(t){t===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Lt=class extends N{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===m?void 0:t}},Bt=class extends N{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==m)}},Pt=class extends N{constructor(t,o,n,r,s){super(t,o,n,r,s),this.type=5}_$AI(t,o=this){if((t=O(this,t,o,0)??m)===x)return;let n=this._$AH,r=t===m&&n!==m||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==m&&(n===m||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Mt=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){O(this,t)}},wo=J.litHtmlPolyfillSupport;wo?.(Q,tt),(J.litHtmlVersions??(J.litHtmlVersions=[])).push("3.3.3");xe=(e,t,o)=>{let n=o?.renderBefore??t,r=n._$litPart$;if(r===void 0){let s=o?.renderBefore??null;n._$litPart$=r=new tt(t.insertBefore(X(),s),s,void 0,o??{})}return r._$AI(e),r}});var et,T,$o,_e=d(()=>{G();G();U();U();et=globalThis,T=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xe(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};T._$litElement$=!0,T.finalized=!0,et.litElementHydrateSupport?.({LitElement:T});$o=et.litElementPolyfillSupport;$o?.({LitElement:T});(et.litElementVersions??(et.litElementVersions=[])).push("4.2.2")});var Ee=d(()=>{});var I=d(()=>{G();U();_e();Ee()});var we=d(()=>{});function u(e){return(t,o)=>typeof o=="object"?So(e,t,o):((n,r,s)=>{let i=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),i?Object.getOwnPropertyDescriptor(r,s):void 0})(e,t,o)}var Ao,So,Ot=d(()=>{G();Ao={attribute:!0,type:String,converter:K,reflect:!1,hasChanged:dt},So=(e=Ao,t,o)=>{let{kind:n,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),s.set(o.name,e),n==="accessor"){let{name:i}=o;return{set(a){let c=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,c,e,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,e,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let c=this[i];t.call(this,a),this.requestUpdate(i,c,e,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function Nt(e){return u({...e,state:!0,attribute:!1})}var $e=d(()=>{Ot();});var Ae=d(()=>{});var H=d(()=>{});var Se=d(()=>{H();});var ke=d(()=>{H();});var Ce=d(()=>{H();});var Te=d(()=>{H();});var Ie=d(()=>{H();});var Ut=d(()=>{we();Ot();$e();Ae();Se();ke();Ce();Te();Ie()});var pt,ht,F,Ht=d(()=>{pt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ht=e=>(...t)=>({_$litDirective$:e,values:t}),F=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var gt,Le=d(()=>{U();Ht();gt=ht(class extends F{constructor(e){if(super(e),e.type!==pt.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let r=!!t[n];r===this.st.has(n)||this.nt?.has(n)||(r?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return x}})});var Ft=d(()=>{Le()});var mt,Be,Pe,z,ft,zt=d(()=>{I();mt="2.5.1",Be="__vscodeElements_disableRegistryWarning__",Pe=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},z=class extends T{get version(){return mt}warn(t){Pe(t,this)}},ft=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(Be in window)return;let r=document.createElement(e)?.version,s="";r?r!==mt?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${mt}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${mt}).`:s+="is already registered by an unknown custom element handler class.",Pe(`The custom element "${e}" ${s}
To suppress this warning, set window.${Be} to true`)}});var V,Me=d(()=>{U();V=e=>e??m});var Vt=d(()=>{Me()});var Re=d(()=>{Ht()});var jt,De,Oe=d(()=>{I();Re();jt=class extends F{constructor(t){if(super(t),this._prevProperties={},t.type!==pt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,r])=>{this._prevProperties[n]!==r&&(n.startsWith("--")?t.element.style.setProperty(n,r):t.element.style[n]=r,this._prevProperties[n]=r)}),x}render(t){return x}},De=ht(jt)});var bt,Wt=d(()=>{I();bt=L`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var ko,Ne,Ue=d(()=>{I();Wt();ko=[bt,L`
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
  `],Ne=ko});var R,ot,_,He=d(()=>{I();Ut();Ft();Vt();zt();Oe();Ue();R=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},_=ot=class extends z{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();ot.stylesheetHref=t,ot.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=ot,n=$`<span
      class=${gt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${De({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?$` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:$` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return $`
      <link
        rel="stylesheet"
        href=${V(t)}
        nonce=${V(o)}
      />
      ${r}
    `}};_.styles=Ne;_.stylesheetHref="";_.nonce="";R([u()],_.prototype,"label",void 0);R([u({type:String})],_.prototype,"name",void 0);R([u({type:Number})],_.prototype,"size",void 0);R([u({type:Boolean,reflect:!0})],_.prototype,"spin",void 0);R([u({type:Number,attribute:"spin-duration"})],_.prototype,"spinDuration",void 0);R([u({type:Boolean,reflect:!0,attribute:"action-icon"})],_.prototype,"actionIcon",void 0);_=ot=R([ft("vscode-icon")],_)});var Fe=d(()=>{He()});function ze(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var Ve=d(()=>{});var Co,To,je,We=d(()=>{I();Wt();Ve();Co=ct(ze()),To=[bt,L`
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
      font-family: var(--vscode-font-family, ${Co});
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
  `],je=To});var v,p,qe=d(()=>{I();Ut();Ft();zt();Fe();We();Vt();v=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},p=class extends z{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=t?$`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${V(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:m,s=o?$`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${V(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:m;return $`
      <div
        class=${gt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};p.styles=je;p.formAssociated=!0;v([u({type:Boolean,reflect:!0})],p.prototype,"autofocus",void 0);v([u({type:Number,reflect:!0})],p.prototype,"tabIndex",void 0);v([u({type:Boolean,reflect:!0})],p.prototype,"secondary",void 0);v([u({type:Boolean,reflect:!0})],p.prototype,"block",void 0);v([u({reflect:!0})],p.prototype,"role",void 0);v([u({type:Boolean,reflect:!0})],p.prototype,"disabled",void 0);v([u()],p.prototype,"icon",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-spin"})],p.prototype,"iconSpin",void 0);v([u({type:Number,reflect:!0,attribute:"icon-spin-duration"})],p.prototype,"iconSpinDuration",void 0);v([u({attribute:"icon-after"})],p.prototype,"iconAfter",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],p.prototype,"iconAfterSpin",void 0);v([u({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],p.prototype,"iconAfterSpinDuration",void 0);v([u({type:Boolean,reflect:!0})],p.prototype,"focused",void 0);v([u({type:String,reflect:!0})],p.prototype,"name",void 0);v([u({type:Boolean,reflect:!0,attribute:"icon-only"})],p.prototype,"iconOnly",void 0);v([u({reflect:!0})],p.prototype,"type",void 0);v([u()],p.prototype,"value",void 0);v([Nt()],p.prototype,"_hasContentBefore",void 0);v([Nt()],p.prototype,"_hasContentAfter",void 0);p=v([ft("vscode-button")],p)});var Ke={};Ze(Ke,{VscodeButton:()=>p});var Ge=d(()=>{qe()});function b(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}function wt(e,t,o,n){let r=document.createElement(e);n&&(r.className=n);let s=document.createElement("span");return s.className=`codicon codicon-${t}`,r.append(s,document.createTextNode(` ${o}`)),r}function Qe(e,t){let o=document.createElement("span");return o.className=`codicon codicon-${e} nav-icon`,t&&o.style.setProperty("--icon-accent",t),o}function to(e,t){t.appearance&&e.setAttribute("appearance",t.appearance),t.hidden&&(e.hidden=!0),t.active&&(e.classList.add("nav-active"),e.setAttribute("disabled",""),e.setAttribute("aria-current","page"))}function qt(e,t,o){let n=document.createElement("vscode-button");if(typeof e=="string")return n.id=e,n.textContent=t||"",o&&n.setAttribute("appearance",o),n;let r=e;return n.id=r.id,r.icon?n.append(Qe(r.icon,r.iconColor),document.createTextNode(r.label)):n.textContent=r.label,to(n,r),n}var $t={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency","share.exportTitle":"AI Engineering Fluency Score","share.exportReportLabel":"Report","usage.contextPressure.compactedLabel":"\u{1F5DC}\uFE0F Sessions compacted","usage.contextPressure.ofCount":"{0} of {1}","usage.contextPressure.compactedShare":"{0}% of sessions with context data lost earlier turns to automatic compaction","usage.contextPressure.noneCompacted":"No session ran out of context window in this period","usage.contextPressure.compactedTooltip":"Sessions where the client automatically compacted or truncated the history at least once, counted per session rather than per compaction event","usage.contextPressure.nearLimitLabel":"\u26A0\uFE0F Sessions near the limit","usage.contextPressure.worstFill":"Fullest session reached {0}% of its window","usage.contextPressure.nearLimitTooltip":"Copilot CLI sessions that filled at least {0}% of their context window without compacting \u2014 the early-warning band before context starts getting dropped"},Kt={...$t};function Gt(e){let t={};for(let[o,n]of Object.entries(e))typeof n=="string"&&n!==o&&(t[o]=n);Kt={...$t,...t}}function Yt(e){return Kt[e]||$t[e]||e}var eo="en";function Jt(e){eo=e}var oo={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},no=new Proxy({},{get(e,t){let o=oo[t];if(!o)return;let{labelKey:n,...r}=o;return{...r,label:Yt(n)}}});var ro=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-efficiency","btn-environmental","btn-diagnostics","btn-dashboard"];function Xt(e,t){return ro.filter(o=>o!=="btn-dashboard"||t).map(o=>({...no[o],active:o===e}))}function rt(e){let t=globalThis.window;return t?t[e]:void 0}var so=rt("__TOKEN_ESTIMATORS__"),sn=so?.estimators??{},At,Zt=!0;function Qt(e){Zt=e}function D(e,t){return new Intl.NumberFormat(At,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function io(e){return e.toLocaleString(At)}function j(e){return Zt?new Intl.NumberFormat(At,{notation:"compact",maximumFractionDigits:1}).format(e):io(e)}function ao(e){let t=[],o=e.location?.origin;o&&o!=="null"&&t.push(o);let n=e.location?.href,r=n?/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(n):null;return r&&!t.includes(r[0])&&t.push(r[0]),t}function co(e,t,o){return e==null||e===t||e===t.parent||e===t.top?!0:!!o&&ao(t).includes(o)}function st(e,t){window.addEventListener("message",o=>{if(!co(o.source,window,o.origin)){t?.(o);return}e(o.data)})}function te(e){return`ext-point-${e}`}function ee(e,t){let o=document.querySelector(".button-row");if(!o)return;let n=new Set(t.map(r=>r.id));for(let r of Array.from(o.querySelectorAll('[id^="ext-point-"]'))){let s=r.id.slice(10);n.has(s)||r.remove()}for(let r of t){if(document.getElementById(te(r.id)))continue;let s=document.createElement("vscode-button");s.id=te(r.id),s.textContent=r.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:r.id})}),o.append(s)}}function oe(e){ee(e,window.__EXTENSION_POINT_BUTTONS__??[]),!window.__extensionPointButtonsListenerRegistered__&&(window.__extensionPointButtonsListenerRegistered__=!0,st(t=>{t?.command==="extensionPointButtonsUpdated"&&Array.isArray(t.buttons)&&ee(e,t.buttons)}))}var ne=`/**
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
`;var re=`body {
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
`;var Io=120,Lo=20,Bo=41,Po=180,Mo=8,Ro=3,Do=8,Oo=50,No=.25,Uo=150,Ho=12,Fo=2,A=acquireVsCodeApi(),nt=rt("__INITIAL_ENVIRONMENTAL__");if(nt?.localization){Gt(nt.localization);let e=nt.localization.__language__||"en";Jt(e)}function vt(e){return e/30*365.25}function h(e){return e<.001?D(e,6):e<1?D(e,4):e<=100?D(e,2):e<=1e3?D(e,1):D(Math.round(e),0)}function yt(e){return e>=1e3?`${h(e/1e3)} kg`:`${h(e)} g`}var xt=e=>[{icon:"\u{1F697}",text:`${h(e/Io)} km driving (EU petrol car)`},{icon:"\u{1F682}",text:`${h(e/Bo)} km by train (EU intercity)`},{icon:"\u2708\uFE0F",text:`${h(e/Po)} km flying (economy, short-haul)`},{icon:"\u{1FAD6}",text:`${h(e/Lo)} kettle boils`},{icon:"\u{1F4F1}",text:`${h(e/Mo)} smartphone charges`},{icon:"\u{1F4A1}",text:`${h(e/Ro)} hours of LED lighting (10 W)`}],_t=e=>[{icon:"\u2615",text:`${h(e/No)} mugs of tea/coffee`},{icon:"\u{1F6BF}",text:`${h(e/Do)} shower minutes`},{icon:"\u{1F455}",text:`${h(e/Oo)} washing machine loads`},{icon:"\u{1F6C1}",text:`${h(e/Uo)} standard bathtubs`},{icon:"\u{1F37D}\uFE0F",text:`${h(e/Ho)} dishwasher cycles`},{icon:"\u{1F4A7}",text:`${h(e/Fo)} days of drinking water`}],Et=e=>{let t=e*365.25;return e>=1?[{icon:"\u{1F333}",text:`${h(e)} \xD7 a tree's full annual CO\u2082 absorption`},{icon:"\u{1F332}",text:`Plant ${Math.ceil(e)} trees to fully offset this per year`}]:[{icon:"\u{1F333}",text:`${h(e*100)} % of one tree's annual absorption`},{icon:"\u{1F4C5}",text:`1 tree absorbs this CO\u2082 in about ${h(t)} days`}]};function Ye(e){Qt(e.compactNumbers!==!1);let t=document.getElementById("root");if(!t)return;let o=vt(e.last30Days.co2),n=vt(e.last30Days.waterUsage),r=vt(e.last30Days.treesEquivalent),s=Math.round(vt(e.last30Days.tokens)),i=new Date(e.lastUpdated);t.replaceChildren();let a=document.createElement("style");a.textContent=ne;let c=document.createElement("style");c.textContent=re;let g=b("div","container"),f=b("div","header"),l=b("div","title","\u{1F33F} Environmental Impact"),y=b("div","button-row");y.append(...Xt("btn-environmental",!!e.backendConfigured).map(Je=>qt(Je))),f.append(l,y);let E=b("div","footer",`Last updated: ${i.toLocaleString()} \xB7 Updates every 5 minutes`),S=b("div","sections");S.append(jo(e,s,o,n,r)),S.append(Wo()),g.append(f,S,E),t.append(a,c,g),qo()}function zo(e,t,o){let n=b("div","analogy-col");if(n.append(b("div","analogy-col-header",e)),n.append(b("div","metric-primary-value",t)),o)for(let r of o){let s=b("div","analogy-item");s.append(b("span","analogy-icon",r.icon));let i=document.createElement("span");i.textContent=r.text,s.append(i),n.append(s)}return n}function Vo(e,t){let o=b("div","metric-card"),n=b("div","metric-card-header"),r=b("span","metric-card-icon",t.icon);r.style.color=t.color,n.append(r,b("span","metric-card-label",t.label)),o.append(n);let s=b("div","analogy-grid");for(let[i,a,c]of e)s.append(zo(i,a,c));return o.append(s),o}function jo(e,t,o,n,r){let s=b("div","section"),i=wt("h3","globe","Impact at a Glance");s.append(i);let a=b("p","section-intro");a.textContent="All figures are estimates based on average data center energy and water consumption figures. Analogies use European averages. Treat these as order-of-magnitude indicators, not precise measurements.",s.append(a);let c=[[["\u{1F4C5} Today",j(e.today.tokens),null],["\u{1F4C8} Last 30 Days",j(e.last30Days.tokens),null],["\u{1F4C6} Previous Month",j(e.lastMonth.tokens),null],["\u{1F30D} Projected Year",j(t),null]],[["\u{1F4C5} Today",yt(e.today.co2),xt(e.today.co2)],["\u{1F4C8} Last 30 Days",yt(e.last30Days.co2),xt(e.last30Days.co2)],["\u{1F4C6} Previous Month",yt(e.lastMonth.co2),xt(e.lastMonth.co2)],["\u{1F30D} Projected Year",yt(o),xt(o)]],[["\u{1F4C5} Today",`${h(e.today.waterUsage)} L`,_t(e.today.waterUsage)],["\u{1F4C8} Last 30 Days",`${h(e.last30Days.waterUsage)} L`,_t(e.last30Days.waterUsage)],["\u{1F4C6} Previous Month",`${h(e.lastMonth.waterUsage)} L`,_t(e.lastMonth.waterUsage)],["\u{1F30D} Projected Year",`${h(n)} L`,_t(n)]],[["\u{1F4C5} Today",`${h(e.today.treesEquivalent)} \u{1F333}`,Et(e.today.treesEquivalent)],["\u{1F4C8} Last 30 Days",`${h(e.last30Days.treesEquivalent)} \u{1F333}`,Et(e.last30Days.treesEquivalent)],["\u{1F4C6} Previous Month",`${h(e.lastMonth.treesEquivalent)} \u{1F333}`,Et(e.lastMonth.treesEquivalent)],["\u{1F30D} Projected Year",`${h(r)} \u{1F333}`,Et(r)]]],g=[{icon:"\u{1F7E3}",label:"Tokens (total)",color:"#c37bff"},{icon:"\u{1F331}",label:"Estimated CO\u2082",color:"#7fe36f"},{icon:"\u{1F4A7}",label:"Estimated Water",color:"#6fc3ff"},{icon:"\u{1F333}",label:"Tree equivalent",color:"#9de67f"}],f=b("div","metric-cards");return c.forEach((l,y)=>f.append(Vo(l,g[y]))),s.append(f),s}function Wo(){let e=b("div","section"),t=wt("h3","lightbulb","Calculation & Estimates");e.append(t);let o=document.createElement("ul");return o.className="notes",["Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) under Usage Based Billing.","Estimated CO\u2082 is based on ~0.2 g CO\u2082e per 1,000 tokens (average data center energy mix and PUE).","Estimated water usage is based on ~0.3 L per 1,000 tokens (data center cooling estimates).","Tree equivalent represents the fraction of a single mature tree's annual CO\u2082 absorption (~21 kg/year).","CO\u2082 analogies: petrol car \u2248 120 g/km \xB7 intercity train \u2248 41 g/km \xB7 economy flight \u2248 180 g/km (ICAO avg.) \xB7 smartphone charge \u2248 8 g \xB7 LED bulb \u2248 3 g/hr (10 W, EU grid) \xB7 kettle boil \u2248 20 g.","Water analogies: shower \u2248 8 L/min \xB7 washing machine \u2248 50 L \xB7 standard bathtub \u2248 150 L \xB7 dishwasher \u2248 12 L \xB7 mug of tea \u2248 250 mL \xB7 daily drinking water \u2248 2 L/person.","All analogies are order-of-magnitude estimates. Actual values depend on your region's energy mix and device efficiency."].forEach(r=>{let s=document.createElement("li");s.textContent=r,o.append(s)}),e.append(o),e}function qo(){document.getElementById("btn-refresh")?.addEventListener("click",()=>A.postMessage({command:"refresh"})),document.getElementById("btn-details")?.addEventListener("click",()=>A.postMessage({command:"showDetails"})),document.getElementById("btn-chart")?.addEventListener("click",()=>A.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>A.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>A.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>A.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>A.postMessage({command:"showDashboard"})),document.getElementById("btn-efficiency")?.addEventListener("click",()=>A.postMessage({command:"showEfficiency"})),oe(A)}st(e=>{e.command==="updateStats"&&Ye(e.data)});async function Ko(){if(await Promise.resolve().then(()=>(Ge(),Ke)),nt)Ye(nt);else{let e=document.getElementById("root");if(e){e.textContent="";let t=document.createElement("div");t.style.padding="16px",t.style.color="#e7e7e7",t.textContent="No data available.",e.append(t)}}}Ko();})();
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
