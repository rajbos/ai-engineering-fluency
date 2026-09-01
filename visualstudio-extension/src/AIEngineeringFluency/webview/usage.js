"use strict";(()=>{var sr=Object.defineProperty;var y=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var rr=(e,t)=>{for(var o in t)sr(e,o,{get:t[o],enumerable:!0})};var xt,kt,ro,$n,Ue,wt,ae,An,io,ao=y(()=>{xt=globalThis,kt=xt.ShadowRoot&&(xt.ShadyCSS===void 0||xt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ro=Symbol(),$n=new WeakMap,Ue=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==ro)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(kt&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=$n.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&$n.set(o,t))}return t}toString(){return this.cssText}},wt=e=>new Ue(typeof e=="string"?e:e+"",void 0,ro),ae=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,s,r)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[r+1],e[0]);return new Ue(o,e,ro)},An=(e,t)=>{if(kt)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),s=xt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,e.appendChild(n)}},io=kt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return wt(o)})(e):e});var Ir,zr,Br,Or,Nr,Hr,te,Mn,jr,Fr,Ie,ze,Ct,En,K,Be=y(()=>{ao();ao();({is:Ir,defineProperty:zr,getOwnPropertyDescriptor:Br,getOwnPropertyNames:Or,getOwnPropertySymbols:Nr,getPrototypeOf:Hr}=Object),te=globalThis,Mn=te.trustedTypes,jr=Mn?Mn.emptyScript:"",Fr=te.reactiveElementPolyfillSupport,Ie=(e,t)=>e,ze={toAttribute(e,t){switch(t){case Boolean:e=e?jr:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},Ct=(e,t)=>!Ir(e,t),En={attribute:!0,type:String,converter:ze,reflect:!1,useDefault:!1,hasChanged:Ct};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),te.litPropertyMetadata??(te.litPropertyMetadata=new WeakMap);K=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=En){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,o);s!==void 0&&zr(this.prototype,t,s)}}static getPropertyDescriptor(t,o,n){let{get:s,set:r}=Br(this.prototype,t)??{get(){return this[o]},set(i){this[o]=i}};return{get:s,set(i){let a=s?.call(this);r?.call(this,i),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??En}static _$Ei(){if(this.hasOwnProperty(Ie("elementProperties")))return;let t=Hr(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ie("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ie("properties"))){let o=this.properties,n=[...Or(o),...Nr(o)];for(let s of n)this.createProperty(s,o[s])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)o.unshift(io(s))}else t!==void 0&&o.push(io(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return An(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:ze).toAttribute(o,n.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,o){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),i=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:ze;this._$Em=s;let a=i.fromAttribute(o,r.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,o,n,s=!1,r){if(t!==void 0){let i=this.constructor;if(s===!1&&(r=this[t]),n??(n=i.getPropertyOptions(t)),!((n.hasChanged??Ct)(r,o)||n.useDefault&&n.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:s,wrapped:r},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??o??this[t]),r!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:i}=r,a=this[s];i!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,r,a)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};K.elementStyles=[],K.shadowRootOptions={mode:"open"},K[Ie("elementProperties")]=new Map,K[Ie("finalized")]=new Map,Fr?.({ReactiveElement:K}),(te.reactiveElementVersions??(te.reactiveElementVersions=[])).push("2.1.2")});function Nn(e,t){if(!fo(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return _n!==void 0?_n.createHTML(t):t}function ye(e,t,o=e,n){if(t===O)return t;let s=n!==void 0?o._$Co?.[n]:o._$Cl,r=je(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(e),s._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(t=ye(e,s._$AS(e,t.values),s,n)),t}var Ne,Rn,St,_n,zn,oe,Bn,Wr,ce,He,je,fo,qr,lo,Oe,Pn,Dn,le,Ln,Un,On,bo,G,Bc,Oc,O,T,In,de,Kr,Fe,co,We,he,uo,po,go,mo,Gr,Hn,ve=y(()=>{Ne=globalThis,Rn=e=>e,St=Ne.trustedTypes,_n=St?St.createPolicy("lit-html",{createHTML:e=>e}):void 0,zn="$lit$",oe=`lit$${Math.random().toFixed(9).slice(2)}$`,Bn="?"+oe,Wr=`<${Bn}>`,ce=document,He=()=>ce.createComment(""),je=e=>e===null||typeof e!="object"&&typeof e!="function",fo=Array.isArray,qr=e=>fo(e)||typeof e?.[Symbol.iterator]=="function",lo=`[ 	
\f\r]`,Oe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Pn=/-->/g,Dn=/>/g,le=RegExp(`>|${lo}(?:([^\\s"'>=/]+)(${lo}*=${lo}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ln=/'/g,Un=/"/g,On=/^(?:script|style|textarea|title)$/i,bo=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),G=bo(1),Bc=bo(2),Oc=bo(3),O=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),In=new WeakMap,de=ce.createTreeWalker(ce,129);Kr=(e,t)=>{let o=e.length-1,n=[],s,r=t===2?"<svg>":t===3?"<math>":"",i=Oe;for(let a=0;a<o;a++){let l=e[a],u,c,p=-1,b=0;for(;b<l.length&&(i.lastIndex=b,c=i.exec(l),c!==null);)b=i.lastIndex,i===Oe?c[1]==="!--"?i=Pn:c[1]!==void 0?i=Dn:c[2]!==void 0?(On.test(c[2])&&(s=RegExp("</"+c[2],"g")),i=le):c[3]!==void 0&&(i=le):i===le?c[0]===">"?(i=s??Oe,p=-1):c[1]===void 0?p=-2:(p=i.lastIndex-c[2].length,u=c[1],i=c[3]===void 0?le:c[3]==='"'?Un:Ln):i===Un||i===Ln?i=le:i===Pn||i===Dn?i=Oe:(i=le,s=void 0);let h=i===le&&e[a+1].startsWith("/>")?" ":"";r+=i===Oe?l+Wr:p>=0?(n.push(u),l.slice(0,p)+zn+l.slice(p)+oe+h):l+oe+(p===-2?a:h)}return[Nn(e,r+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},Fe=class e{constructor({strings:t,_$litType$:o},n){let s;this.parts=[];let r=0,i=0,a=t.length-1,l=this.parts,[u,c]=Kr(t,o);if(this.el=e.createElement(u,n),de.currentNode=this.el.content,o===2||o===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=de.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let p of s.getAttributeNames())if(p.endsWith(zn)){let b=c[i++],h=s.getAttribute(p).split(oe),S=/([.?@])?(.*)/.exec(b);l.push({type:1,index:r,name:S[2],strings:h,ctor:S[1]==="."?uo:S[1]==="?"?po:S[1]==="@"?go:he}),s.removeAttribute(p)}else p.startsWith(oe)&&(l.push({type:6,index:r}),s.removeAttribute(p));if(On.test(s.tagName)){let p=s.textContent.split(oe),b=p.length-1;if(b>0){s.textContent=St?St.emptyScript:"";for(let h=0;h<b;h++)s.append(p[h],He()),de.nextNode(),l.push({type:2,index:++r});s.append(p[b],He())}}}else if(s.nodeType===8)if(s.data===Bn)l.push({type:2,index:r});else{let p=-1;for(;(p=s.data.indexOf(oe,p+1))!==-1;)l.push({type:7,index:r}),p+=oe.length-1}r++}}static createElement(t,o){let n=ce.createElement("template");return n.innerHTML=t,n}};co=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,s=(t?.creationScope??ce).importNode(o,!0);de.currentNode=s;let r=de.nextNode(),i=0,a=0,l=n[0];for(;l!==void 0;){if(i===l.index){let u;l.type===2?u=new We(r,r.nextSibling,this,t):l.type===1?u=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(u=new mo(r,this,t)),this._$AV.push(u),l=n[++a]}i!==l?.index&&(r=de.nextNode(),i++)}return de.currentNode=ce,s}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},We=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,s){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=ye(this,t,o),je(t)?t===T||t==null||t===""?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==O&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):qr(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==T&&je(this._$AH)?this._$AA.nextSibling.data=t:this.T(ce.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=Fe.createElement(Nn(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let r=new co(s,this),i=r.u(this.options);r.p(o),this.T(i),this._$AH=r}}_$AC(t){let o=In.get(t.strings);return o===void 0&&In.set(t.strings,o=new Fe(t)),o}k(t){fo(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let r of t)s===o.length?o.push(n=new e(this.O(He()),this.O(He()),this,this.options)):n=o[s],n._$AI(r),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=Rn(t).nextSibling;Rn(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},he=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,s,r){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=o,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=T}_$AI(t,o=this,n,s){let r=this.strings,i=!1;if(r===void 0)t=ye(this,t,o,0),i=!je(t)||t!==this._$AH&&t!==O,i&&(this._$AH=t);else{let a=t,l,u;for(t=r[0],l=0;l<r.length-1;l++)u=ye(this,a[n+l],o,l),u===O&&(u=this._$AH[l]),i||(i=!je(u)||u!==this._$AH[l]),u===T?t=T:t!==T&&(t+=(u??"")+r[l+1]),this._$AH[l]=u}i&&!s&&this.j(t)}j(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},uo=class extends he{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===T?void 0:t}},po=class extends he{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==T)}},go=class extends he{constructor(t,o,n,s,r){super(t,o,n,s,r),this.type=5}_$AI(t,o=this){if((t=ye(this,t,o,0)??T)===O)return;let n=this._$AH,s=t===T&&n!==T||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,r=t!==T&&(n===T||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},mo=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){ye(this,t)}},Gr=Ne.litHtmlPolyfillSupport;Gr?.(Fe,We),(Ne.litHtmlVersions??(Ne.litHtmlVersions=[])).push("3.3.3");Hn=(e,t,o)=>{let n=o?.renderBefore??t,s=n._$litPart$;if(s===void 0){let r=o?.renderBefore??null;n._$litPart$=s=new We(t.insertBefore(He(),r),r,void 0,o??{})}return s._$AI(e),s}});var qe,ne,Vr,jn=y(()=>{Be();Be();ve();ve();qe=globalThis,ne=class extends K{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Hn(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};ne._$litElement$=!0,ne.finalized=!0,qe.litElementHydrateSupport?.({LitElement:ne});Vr=qe.litElementPolyfillSupport;Vr?.({LitElement:ne});(qe.litElementVersions??(qe.litElementVersions=[])).push("4.2.2")});var Fn=y(()=>{});var se=y(()=>{Be();ve();jn();Fn()});var Wn=y(()=>{});function v(e){return(t,o)=>typeof o=="object"?Jr(e,t,o):((n,s,r)=>{let i=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),i?Object.getOwnPropertyDescriptor(s,r):void 0})(e,t,o)}var Yr,Jr,yo=y(()=>{Be();Yr={attribute:!0,type:String,converter:ze,reflect:!1,hasChanged:Ct},Jr=(e=Yr,t,o)=>{let{kind:n,metadata:s}=o,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(o.name,e),n==="accessor"){let{name:i}=o;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,l,e,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,e,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let l=this[i];t.call(this,a),this.requestUpdate(i,l,e,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function ho(e){return v({...e,state:!0,attribute:!1})}var qn=y(()=>{yo();});var Kn=y(()=>{});var xe=y(()=>{});var Gn=y(()=>{xe();});var Vn=y(()=>{xe();});var Yn=y(()=>{xe();});var Jn=y(()=>{xe();});var Xn=y(()=>{xe();});var vo=y(()=>{Wn();yo();qn();Kn();Gn();Vn();Yn();Jn();Xn()});var $t,At,ke,xo=y(()=>{$t={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},At=e=>(...t)=>({_$litDirective$:e,values:t}),ke=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var Mt,Zn=y(()=>{ve();xo();Mt=At(class extends ke{constructor(e){if(super(e),e.type!==$t.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return O}})});var ko=y(()=>{Zn()});var Et,Qn,es,we,Rt,wo=y(()=>{se();Et="2.5.1",Qn="__vscodeElements_disableRegistryWarning__",es=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},we=class extends ne{get version(){return Et}warn(t){es(t,this)}},Rt=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(Qn in window)return;let s=document.createElement(e)?.version,r="";s?s!==Et?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${Et}", while the other one is "${s}".`):r+=`is already registered by the same version of VSCode Elements (${Et}).`:r+="is already registered by an unknown custom element handler class.",es(`The custom element "${e}" ${r}
To suppress this warning, set window.${Qn} to true`)}});var Ce,ts=y(()=>{ve();Ce=e=>e??T});var Co=y(()=>{ts()});var os=y(()=>{xo()});var So,ns,ss=y(()=>{se();os();So=class extends ke{constructor(t){if(super(t),this._prevProperties={},t.type!==$t.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?t.element.style.setProperty(n,s):t.element.style[n]=s,this._prevProperties[n]=s)}),O}render(t){return O}},ns=At(So)});var _t,To=y(()=>{se();_t=ae`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var Xr,rs,is=y(()=>{se();To();Xr=[_t,ae`
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
  `],rs=Xr});var ue,Ke,N,as=y(()=>{se();vo();ko();Co();wo();ss();is();ue=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(r=(s<3?i(r):s>3?i(t,o,r):i(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},N=Ke=class extends we{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();Ke.stylesheetHref=t,Ke.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=Ke,n=G`<span
      class=${Mt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${ns({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?G` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:G` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return G`
      <link
        rel="stylesheet"
        href=${Ce(t)}
        nonce=${Ce(o)}
      />
      ${s}
    `}};N.styles=rs;N.stylesheetHref="";N.nonce="";ue([v()],N.prototype,"label",void 0);ue([v({type:String})],N.prototype,"name",void 0);ue([v({type:Number})],N.prototype,"size",void 0);ue([v({type:Boolean,reflect:!0})],N.prototype,"spin",void 0);ue([v({type:Number,attribute:"spin-duration"})],N.prototype,"spinDuration",void 0);ue([v({type:Boolean,reflect:!0,attribute:"action-icon"})],N.prototype,"actionIcon",void 0);N=Ke=ue([Rt("vscode-icon")],N)});var ls=y(()=>{as()});function ds(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var cs=y(()=>{});var Zr,Qr,us,ps=y(()=>{se();To();cs();Zr=wt(ds()),Qr=[_t,ae`
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
      font-family: var(--vscode-font-family, ${Zr});
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
  `],us=Qr});var M,C,gs=y(()=>{se();vo();ko();wo();ls();ps();Co();M=function(e,t,o,n){var s=arguments.length,r=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(r=(s<3?i(r):s>3?i(t,o,r):i(t,o))||r);return s>3&&r&&Object.defineProperty(t,o,r),r},C=class extends we{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=t?G`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${Ce(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:T,r=o?G`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${Ce(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:T;return G`
      <div
        class=${Mt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${r}
        <slot name="content-after"></slot>
      </div>
    `}};C.styles=us;C.formAssociated=!0;M([v({type:Boolean,reflect:!0})],C.prototype,"autofocus",void 0);M([v({type:Number,reflect:!0})],C.prototype,"tabIndex",void 0);M([v({type:Boolean,reflect:!0})],C.prototype,"secondary",void 0);M([v({type:Boolean,reflect:!0})],C.prototype,"block",void 0);M([v({reflect:!0})],C.prototype,"role",void 0);M([v({type:Boolean,reflect:!0})],C.prototype,"disabled",void 0);M([v()],C.prototype,"icon",void 0);M([v({type:Boolean,reflect:!0,attribute:"icon-spin"})],C.prototype,"iconSpin",void 0);M([v({type:Number,reflect:!0,attribute:"icon-spin-duration"})],C.prototype,"iconSpinDuration",void 0);M([v({attribute:"icon-after"})],C.prototype,"iconAfter",void 0);M([v({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],C.prototype,"iconAfterSpin",void 0);M([v({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],C.prototype,"iconAfterSpinDuration",void 0);M([v({type:Boolean,reflect:!0})],C.prototype,"focused",void 0);M([v({type:String,reflect:!0})],C.prototype,"name",void 0);M([v({type:Boolean,reflect:!0,attribute:"icon-only"})],C.prototype,"iconOnly",void 0);M([v({reflect:!0})],C.prototype,"type",void 0);M([v()],C.prototype,"value",void 0);M([ho()],C.prototype,"_hasContentBefore",void 0);M([ho()],C.prototype,"_hasContentAfter",void 0);C=M([Rt("vscode-button")],C)});var ms={};rr(ms,{VscodeButton:()=>C});var fs=y(()=>{gs()});function k(e,t){e&&(e.innerHTML=t)}function m(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}var pt={today:"Today",last7:"Last 7 days",last14:"Last 14 days",last30:"Last 30 days",last90:"Last 90 days",currentMonth:"Current month",lastMonth:"Previous month",thisWeek:"This week",allTime:"All time"},ir=["today","last7","last30","currentMonth","allTime"];function Xo(e,t,o){t===o&&(e.selected=!0)}function Yt(e){let t=m("div","period-selector");t.style.display="inline-flex",t.style.alignItems="center",t.style.gap="4px";let o=e.label??"Time window:";if(o){let i=m("span","period-selector-label",o);i.style.fontSize="11px",i.style.color="var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))",t.append(i)}let n=document.createElement("select");n.className="period-selector-select",e.id&&(n.id=e.id),n.style.background="var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))",n.style.color="var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))",n.style.border="1px solid var(--border-subtle, #555555)",n.style.borderRadius="4px",n.style.padding="4px 8px",n.style.fontSize="13px",n.style.cursor="pointer",n.style.minHeight="24px";let s=new Set(e.disabled??[]),r=e.periods??ir;for(let i of r){let a=document.createElement("option");a.value=i,a.textContent=pt[i],Xo(a,i,e.selected),s.has(i)&&(a.disabled=!0,e.disabledTitle&&(a.title=e.disabledTitle)),n.append(a)}for(let i of e.extraOptions??[]){let a=document.createElement("option");a.value=i.value,a.textContent=i.label,i.title&&(a.title=i.title),Xo(a,i.value,e.selected),i.disabled&&(a.disabled=!0),n.append(a)}return n.addEventListener("change",()=>{e.onChange(n.value)}),t.append(n),{wrapper:t,select:n}}var Jt={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency"},Zo={...Jt};function Qo(e){let t={};for(let[o,n]of Object.entries(e))typeof n=="string"&&n!==o&&(t[o]=n);Zo={...Jt,...t}}function en(e){return Zo[e]||Jt[e]||e}var ar="en";function tn(e){ar=e}var lr={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},on=new Proxy({},{get(e,t){let o=lr[t];if(!o)return;let{labelKey:n,...s}=o;return{...s,label:en(n)}}});var dr=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-efficiency","btn-environmental","btn-diagnostics","btn-dashboard"];function cr(e,t){return dr.filter(o=>o!=="btn-dashboard"||t).map(o=>({...on[o],active:o===e}))}function ur(e){let t=typeof e=="string"?on[e]:e;if(t.hidden)return"";let o=t.appearance?` appearance="${t.appearance}"`:"",n=t.active?' class="nav-active" disabled aria-current="page"':"",s=t.iconColor?` style="--icon-accent:${t.iconColor}"`:"",r=t.icon?`<span class="codicon codicon-${t.icon} nav-icon"${s}></span>`:"";return`<vscode-button id="${t.id}"${o}${n}>${r}${t.label}</vscode-button>`}function nn(e,t){return cr(e,t).map(o=>ur(o)).join(`
`)}function Re(e){return e.file+e.selection+e.implicitSelection+e.symbol+e.codebase+e.workspace+e.terminal+e.vscode+e.copilotInstructions+e.agentsMd+(e.terminalLastCommand||0)+(e.terminalSelection||0)+(e.clipboard||0)+(e.changes||0)+(e.outputPanel||0)+(e.problemsPanel||0)+(e.pullRequest||0)}function q(e){let t=globalThis.window;return t?t[e]:void 0}var pr=q("__TOKEN_ESTIMATORS__"),Yd=pr?.estimators??{},_e,gr=!0;function Xt(e){_e=e}function w(e,t){return new Intl.NumberFormat(_e,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function Q(e,t=1){return`${w(e,t)}%`}function g(e){return e.toLocaleString(_e)}function gt(e){return gr?new Intl.NumberFormat(_e,{notation:"compact",maximumFractionDigits:1}).format(e):g(e)}function sn(e){return new Intl.NumberFormat(_e,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function P(e,t,o=n=>console.error(n)){try{return t()}catch(n){let s=n instanceof Error?n.message:String(n);return o(`[usage-webview] Section "${e}" failed to render: ${s}`),`<div class="section" style="border-color: rgba(239, 68, 68, 0.3);">
			<div class="section-title"><span>\u26A0\uFE0F</span><span>${d(e)}</span></div>
			<div style="color: var(--text-secondary); font-size: 12px; padding: 8px 0;">
				This section couldn't be displayed due to an unexpected error. Other sections are unaffected \u2014 try refreshing the dashboard.
			</div>
		</div>`}}function Pe(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"N/A";if(t<1024)return`${t} B`;let o=["KB","MB","GB","TB","PB"],n=t/1024,s=0;for(;n>=1024&&s<o.length-1;)n/=1024,s++;let r=s===0?1:2;return`${n.toFixed(r)} ${o[s]}`}function Zt(e){if(e===void 0||!Number.isFinite(e)||e<0)return"\u2014";let t=Math.round(e/6e4);if(t<1)return"<1m";if(t<60)return`${t}m`;let o=Math.floor(t/60),n=t%60;return`${o}h ${String(n).padStart(2,"0")}m`}function rn(e){try{let t=Date.now(),o=new Date(e).getTime();if(!Number.isFinite(o))return"Unknown";let n=t-o;if(n<0)return"Just now";let s=Math.floor(n/1e3),r=Math.floor(s/60),i=Math.floor(r/60),a=Math.floor(i/24);return a>0?`${a} day${a!==1?"s":""} ago`:i>0?`${i} hour${i!==1?"s":""} ago`:r>0?`${r} minute${r!==1?"s":""} ago`:`${s} second${s!==1?"s":""} ago`}catch{return"Unknown"}}function an(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let s=document.createElement("vscode-button");s.id=`ext-point-${n.id}`,s.textContent=n.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(s)}}var mt=["last7","last30","currentMonth"];function Qt(e){if(!e||typeof e!="object")return;let t=e,o={};for(let n of mt){let s=t[n];if(!Array.isArray(s))return;o[n]=s.filter(r=>!!r&&typeof r=="object"&&typeof r.interactions=="number")}return o}var ln=`/**
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
`;var dn=`* {
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
	margin-bottom: 14px;
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

.header-title {
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
	letter-spacing: 0.2px;
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

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 12px;
	margin-bottom: 16px;
}

.stat-card {
	background: var(--list-hover-bg);
	border: 1px solid var(--border-color);
	border-radius: 6px;
	padding: 12px;
	box-shadow: 0 2px 4px var(--shadow-color);
}

.stat-card[title] {
	cursor: help;
}

.stat-label {
	font-size: 11px;
	color: var(--text-secondary);
	margin-bottom: 4px;
}

.stat-value {
	font-size: 20px;
	font-weight: 700;
	color: var(--text-primary);
}

.ctx-ref-table-wrap {
	margin-bottom: 16px;
	overflow-x: auto;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	box-shadow: 0 2px 4px var(--shadow-color);
}

.ctx-ref-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;
}

.ctx-ref-table th,
.ctx-ref-table td {
	padding: 8px 14px;
	text-align: left;
	border-bottom: 1px solid var(--border-subtle);
}

.ctx-ref-table thead th {
	background: var(--bg-tertiary);
	color: var(--text-secondary);
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.4px;
	position: sticky;
	top: 0;
}

.ctx-ref-table tbody tr:hover {
	background: var(--list-hover-bg);
}

.ctx-ref-table .ctx-ref-name {
	color: var(--text-primary);
	white-space: nowrap;
}

.ctx-ref-table .ctx-ref-num {
	text-align: right;
	font-variant-numeric: tabular-nums;
	font-weight: 600;
	color: var(--text-primary);
	width: 110px;
}

.ctx-ref-table .ctx-ref-zero {
	color: var(--text-muted);
	font-weight: 400;
}

.ctx-ref-table .ctx-ref-today-active {
	color: var(--link-color);
}

.ctx-ref-table tfoot .ctx-ref-total td {
	background: var(--list-active-bg);
	color: var(--list-active-fg);
	font-weight: 700;
	border-bottom: none;
	border-top: 2px solid var(--border-color);
}

.ctx-ref-table tfoot .ctx-ref-total .ctx-ref-num {
	color: var(--list-active-fg);
}

.ctx-ref-table .ctx-ref-spark {
	width: 68px;
	text-align: center;
	padding: 4px 8px;
	vertical-align: middle;
	color: var(--text-primary);
}


.bar-chart {
	background: var(--list-hover-bg);
	border: 1px solid var(--border-color);
	border-radius: 6px;
	padding: 12px;
	margin-bottom: 12px;
}.bar-item {
	margin-bottom: 8px;
}

.bar-label {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	margin-bottom: 4px;
	color: var(--text-primary);
}

.bar-track {
	background: var(--row-alternate-bg);
	height: 8px;
	border-radius: 4px;
	overflow: hidden;
}

.bar-fill {
	height: 100%;
	border-radius: 4px;
	transition: width 0.3s ease;
}

/* Local model leaderboard */
.model-leaderboard-controls,
.efficiency-chart-header,
.model-leaderboard-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}

.model-leaderboard-controls {
	margin: 8px 0 14px;
}

.model-leaderboard-filter {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	color: var(--text-secondary);
	font-size: 12px;
	cursor: pointer;
}

.model-leaderboard-filter input {
	accent-color: var(--link-color);
}

.efficiency-chart-header,
.model-leaderboard-heading {
	margin: 14px 2px 8px;
}

.efficiency-chart-controls {
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	gap: 10px;
	flex-wrap: wrap;
}

.efficiency-control {
	display: flex;
	flex-direction: column;
	gap: 4px;
	color: var(--text-secondary);
	font-size: 11px;
	font-weight: 600;
}

.efficiency-control select {
	min-height: 27px;
	border: 1px solid var(--input-border);
	border-radius: 4px;
	background: var(--input-bg);
	color: var(--input-fg);
	padding: 3px 24px 3px 8px;
	font: inherit;
	font-weight: 400;
}

.efficiency-control select:focus-visible {
	outline: 2px solid var(--focus-border);
	outline-offset: 1px;
}

.efficiency-chart-header > div:first-child,
.model-leaderboard-heading > div:first-child,
.model-leaderboard-empty {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.efficiency-chart-header strong,
.model-leaderboard-heading strong,
.model-leaderboard-empty strong {
	font-size: 13px;
	color: var(--text-primary);
}

.efficiency-chart-header span,
.model-leaderboard-heading span,
.model-leaderboard-empty span {
	font-size: 11px;
	color: var(--text-secondary);
}

.efficiency-metric-selector {
	display: inline-flex;
	border: 1px solid var(--border-color);
	border-radius: 5px;
	overflow: hidden;
}

.efficiency-metric-button {
	border: 0;
	border-right: 1px solid var(--border-color);
	background: var(--button-secondary-bg);
	color: var(--button-secondary-fg);
	padding: 5px 10px;
	font: inherit;
	font-size: 11px;
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
}

.efficiency-metric-button:last-child {
	border-right: 0;
}

.efficiency-metric-button:hover {
	background: var(--button-secondary-hover-bg);
}

.efficiency-metric-button.active {
	background: var(--button-bg);
	color: var(--button-fg);
}

.efficiency-metric-button:focus-visible,
.efficiency-point:focus {
	outline: 2px solid var(--focus-border);
	outline-offset: -2px;
}

.efficiency-chart-wrap {
	overflow-x: auto;
	border: 1px solid var(--border-color);
	background: var(--list-hover-bg);
	border-radius: 6px;
}

.efficiency-chart {
	display: block;
	width: 100%;
	min-width: 700px;
	min-height: 300px;
}

.efficiency-grid line {
	stroke: var(--border-subtle);
	stroke-width: 1;
}

.efficiency-grid text,
.efficiency-axis-title,
.efficiency-chart-hint,
.efficiency-point text {
	fill: var(--text-secondary);
	font-family: inherit;
	font-size: 10px;
}

.efficiency-axis-title {
	font-size: 11px;
	font-weight: 600;
}

.efficiency-chart-hint {
	fill: var(--success-fg);
	font-style: italic;
}

.efficiency-point {
	cursor: default;
}

.efficiency-point circle {
	fill: var(--model-color);
	stroke: var(--bg-tertiary);
	stroke-width: 2;
	transition: filter 0.15s ease;
}

.efficiency-point:hover circle,
.efficiency-point:focus circle {
	filter: brightness(1.18);
}

.efficiency-point text {
	fill: var(--model-color);
	font-size: 10px;
	font-weight: 600;
	paint-order: stroke;
	stroke: var(--bg-tertiary);
	stroke-width: 3px;
	stroke-linejoin: round;
}

.efficiency-vendor-legend {
	display: flex;
	gap: 8px 14px;
	flex-wrap: wrap;
	margin: 8px 2px 0;
	color: var(--text-secondary);
	font-size: 11px;
}

.efficiency-legend-item {
	display: inline-flex;
	align-items: center;
	gap: 5px;
}

.efficiency-legend-item > span {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--model-color);
}

.model-leaderboard-filter-note {
	color: var(--text-muted);
	font-size: 11px;
}

.model-leaderboard-table-wrap {
	overflow-x: auto;
	border: 1px solid var(--border-color);
	border-radius: 6px;
}

.model-leaderboard-table {
	width: 100%;
	min-width: 940px;
	border-collapse: collapse;
	font-size: 12px;
	font-variant-numeric: tabular-nums;
}

.model-leaderboard-table th,
.model-leaderboard-table td {
	padding: 8px 10px;
	text-align: right;
	border-bottom: 1px solid var(--border-subtle);
	white-space: nowrap;
}

.model-leaderboard-table th:first-child,
.model-leaderboard-table td:first-child,
.model-leaderboard-table th:nth-child(2),
.model-leaderboard-table td:nth-child(2) {
	text-align: left;
}

.model-leaderboard-table th {
	color: var(--text-secondary);
	background: var(--bg-tertiary);
	font-size: 11px;
	font-weight: 600;
}

.model-leaderboard-table th.sortable {
	cursor: pointer;
	user-select: none;
}

.model-leaderboard-table th.sortable:hover {
	color: var(--link-color);
	background: var(--list-hover-bg);
}

.model-leaderboard-table tbody tr:last-child td {
	border-bottom: 0;
}

.model-leaderboard-table tbody tr:hover td {
	background: var(--list-hover-bg);
}

.model-leaderboard-table td:first-child {
	color: var(--text-primary);
	font-weight: 600;
}

.model-leaderboard-table td:first-child::before {
	content: "";
	display: inline-block;
	width: 7px;
	height: 7px;
	margin-right: 7px;
	border-radius: 50%;
	background: var(--model-color);
}

.model-use-cell {
	display: grid;
	grid-template-columns: 82px 42px auto;
	align-items: center;
	gap: 7px;
}

.model-use-track {
	height: 6px;
	overflow: hidden;
	background: var(--row-alternate-bg);
	border-radius: 3px;
}

.model-use-track span {
	display: block;
	height: 100%;
	background: var(--model-color);
	border-radius: inherit;
}

.model-use-cell strong {
	color: var(--text-primary);
	text-align: right;
}

.model-use-cell > span {
	color: var(--text-secondary);
	font-size: 11px;
}

.model-leaderboard-empty {
	align-items: flex-start;
	padding: 18px;
	border: 1px dashed var(--border-color);
	border-radius: 6px;
	background: var(--list-hover-bg);
}

@media (width <= 768px) {
	.efficiency-chart-header,
	.model-leaderboard-heading {
		align-items: flex-start;
	}

	.efficiency-chart-controls {
		width: 100%;
		justify-content: flex-start;
	}

	.efficiency-metric-selector {
		width: 100%;
	}

	.efficiency-metric-button {
		flex: 1;
	}

	.efficiency-control:first-child {
		width: 100%;
	}
}

.list {
	background: var(--list-hover-bg);
	border: 1px solid var(--border-color);
	border-radius: 6px;
	padding: 12px 16px;
}

.list ul {
	list-style: none;
	padding: 0;
}

.list li {
	padding: 4px 0;
	font-size: 13px;
}

/* Customization matrix styles */
.customization-matrix-container {
	overflow-x: auto;
	max-width: 100%;
}

.customization-matrix {
	width: 100%;
	border-collapse: collapse;
	font-size: 12px;
	color: var(--text-primary);
}

.customization-matrix th {
	background: var(--list-hover-bg);
	color: var(--text-primary);
	font-weight: 600;
	font-size: 11px;
	white-space: nowrap;
}

.customization-matrix td {
	background: var(--bg-tertiary);
}

.customization-matrix tbody tr:hover td {
	background: var(--list-hover-bg);
}

.stale-warning {
	color: var(--warning-fg);
	font-weight: 600;
}

.two-column {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}

.three-column {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 16px;
	align-items: stretch;
}

.three-column > div {
	display: flex;
	flex-direction: column;
}

.three-column > div > .list {
	flex: 1;
}

.info-box {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 6px;
	padding: 12px;
	margin-bottom: 16px;
	font-size: 12px;
	color: var(--text-secondary);
}

.info-box-title {
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 6px;
}

.info-box-toggle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	cursor: pointer;
	user-select: none;
	margin-bottom: 0;
}

.info-box-chevron {
	font-size: 10px;
	color: var(--text-secondary);
}

.info-box-body {
	margin-top: 6px;
}


.repo-hygiene-results {
	margin-top: 4px;
}

.repo-analysis-card {
	margin: 0;
}

.repo-hygiene-pane {
	border: 1px solid var(--border-color);
	border-radius: 6px;
	margin-bottom: 12px;
	background: var(--bg-secondary);
}

.repo-hygiene-pane-header {
	padding: 8px 12px;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
	border-bottom: 1px solid var(--border-color);
	background: var(--list-hover-bg);
}

.repo-hygiene-pane-body {
	display: block;
}

.repo-hygiene-pane-collapsed {
	display: none;
}

.repo-hygiene-pane-collapsed .repo-hygiene-pane-body {
	display: none;
}

.btn-repo-action[disabled] {
	opacity: 0.7;
}

.footer {
	margin-top: 6px;
	padding-top: 12px;
	border-top: 1px solid var(--border-subtle);
	text-align: left;
	font-size: 11px;
	color: var(--text-muted);
}

@media (width <= 768px) {
	.two-column {
		grid-template-columns: 1fr;
	}

	.three-column {
		grid-template-columns: 1fr;
	}
}


.tab-bar {
display: flex;
gap: 2px;
margin-bottom: 16px;
border-bottom: 2px solid var(--border-color);
padding-bottom: 0;
flex-wrap: wrap;
}

.tab-button {
display: inline-flex;
align-items: center;
gap: 4px;
background: transparent;
border: none;
border-bottom: 3px solid transparent;
color: var(--text-secondary);
padding: 8px 16px;
font-size: 12px;
font-weight: 600;
cursor: pointer;
border-radius: 4px 4px 0 0;
transition: all 0.15s ease;
white-space: nowrap;
margin-bottom: -2px;
font-family: inherit;
}

.tab-button:hover {
color: var(--text-primary);
background: var(--list-hover-bg);
}

.tab-button.active {
color: var(--text-primary);
border-bottom-color: var(--link-color);
background: var(--bg-tertiary);
}

.auto-badge {
	display: inline-block;
	margin-left: 6px;
	padding: 1px 5px;
	font-size: 10px;
	border-radius: 3px;
	border: 1px solid var(--text-primary);
	color: var(--text-primary);
	background: transparent;
	vertical-align: middle;
	line-height: 1.4;
}

/* Sortable table headers */
.sessions-table th.sortable {
	cursor: pointer;
	user-select: none;
	transition: background 0.1s ease, color 0.1s ease;
}

.sessions-table th.sortable:hover {
	background: var(--list-hover-bg);
	color: var(--link-color);
}

.sessions-table tr:hover td {
	background: var(--list-hover-bg);
}

/* Worktrees tab */
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

.session-table th.sortable {
	cursor: pointer;
	user-select: none;
}

.session-table th.sortable:hover {
	background: var(--list-hover-bg);
	color: var(--link-color);
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

.worktree-roots-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.worktree-root-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 6px 10px;
	font-family: var(--vscode-editor-font-family, monospace);
	font-size: 12px;
}

.worktree-root-item span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.worktree-progress-bar {
	height: 6px;
	border-radius: 3px;
	background: var(--bg-tertiary);
	overflow: hidden;
	margin-top: 8px;
}

.worktree-progress-fill {
	height: 100%;
	background: var(--link-color);
	transition: width 0.2s ease;
}

/* While walking the folder tree we have no percentage yet, so pulse the bar to
   signal ongoing activity instead of showing a misleading fixed progress. */
.worktree-progress-fill.indeterminate {
	animation: worktree-pulse 1.2s ease-in-out infinite;
}

@keyframes worktree-pulse {
	0%,
	100% {
		opacity: 0.35;
	}

	50% {
		opacity: 1;
	}
}

.worktree-repo-row {
	cursor: pointer;
	font-weight: 600;
}

.worktree-repo-row:hover {
	background: var(--bg-tertiary);
}

.worktree-repo-row.expanded {
	background: var(--bg-tertiary);
}

.worktree-delete-link {
	margin-left: 8px;
	color: var(--vscode-errorForeground, #f14c4c);
}

.worktree-delete-link:hover {
	text-decoration: underline;
}

.worktree-caret {
	display: inline-block;
	width: 14px;
	color: var(--text-muted);
	font-size: 10px;
}

.worktree-roots-toggle {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	margin: 8px 0;
	padding: 0;
	background: none;
	border: none;
	color: var(--link-color);
	font-size: 12px;
	cursor: pointer;
}

.worktree-roots-toggle:hover {
	text-decoration: underline;
}

.worktree-pending {
	color: var(--text-muted);
	font-style: italic;
	opacity: 0.8;
}

/* The details row's cell wraps the per-worktree table; trim its padding so the
   nested table aligns with the parent columns. */
.worktree-repo-details > td {
	padding: 0 0 12px;
}

.worktree-cleanup-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
}

.worktree-cleanup-card-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	flex-wrap: wrap;
}

.worktree-cleanup-card-actions .button {
	font-size: 12px;
	padding: 4px 10px;
}

.worktree-cleanup-log {
	margin-top: 8px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 12px;
}

.worktree-cleanup-log-row {
	display: flex;
	gap: 8px;
	align-items: baseline;
	padding: 4px 6px;
	border-radius: 4px;
	background: var(--bg-tertiary);
}

.worktree-cleanup-log-branch {
	font-weight: 600;
	font-family: var(--vscode-editor-font-family, monospace);
}

.worktree-cleanup-log-repo {
	color: var(--text-muted);
}

.worktree-cleanup-log-reason {
	color: var(--text-muted);
	flex: 1;
}
`;function br(e,t){return e===null||e===t}function cn(e){window.addEventListener("message",t=>{br(t.source,window)&&e(t.data)})}var yr=q("__MODEL_PRICING__"),eo={};for(let[e,t]of Object.entries(yr?.pricing??{}))t.displayNames&&t.displayNames.length>0&&(eo[e]=t.displayNames[0]);var hr=" (Custom)";function ft(e){try{return decodeURIComponent(e)}catch{return e}}function to(e){let t=e.split("/");if(!(t.length!==3||t.some(o=>o.trim()==="")))return{source:ft(t[0]),providerName:ft(t[1]),modelId:ft(t[2])}}var bt=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i;function De(e){let t=[],o=i=>{i&&!t.includes(i)&&t.push(i)},n=i=>{o(i),o(i.replace(/(\d+)-(\d+)(?=-|$)/,"$1.$2"))},s=e.replace(/^copilot\//,"");n(s);let r=to(s);return r&&n(r.modelId),bt.test(s)&&n(s.replace(bt,"")),t}function oo(e){let t=to(e);return t?`${t.providerName}${hr}`:void 0}function ee(e){for(let o of De(e))if(eo[o])return eo[o];let t=to(e);return t?t.modelId:bt.test(e)?e.replace(bt,""):ft(e)}var gc=1/1e11;function xr(e){if(!e)return null;let t=/([\d.]+)\s*([KkMm])?/.exec(e);if(!t)return null;let o=parseFloat(t[1]);if(!isFinite(o)||o<=0)return null;let n=(t[2]??"").toUpperCase();return Math.round(o*(n==="M"?1e6:n==="K"?1e3:1))}function un(e,t={}){let o=kr(e,t);if(!o){let r=e.toLowerCase();for(let[i,a]of Object.entries(t))if(r.includes(i.toLowerCase())||i.toLowerCase().includes(r)){o=a;break}}let n=o?.copilotPricing?.longContext;if(!n)return null;let s=xr(n.threshold);return s?{thresholdTokens:s,defaultInputCostPerMillion:o.copilotPricing.inputCostPerMillion,longContextInputCostPerMillion:n.inputCostPerMillion}:null}function kr(e,t){for(let o of De(e)){let n=t[o];if(n)return n}}function pn(e){return{oneShotRate:e.editTurns>0?e.oneShotEditTurns/e.editTurns:null,retryRate:e.editTurns>0?e.retries/e.editTurns:null,selfCorrectionRate:e.editTurns>0?e.selfCorrections/e.editTurns:null,costPerCall:e.calls>0?e.cost/e.calls:null,costPerEdit:e.editTurns>0?e.cost/e.editTurns:null,outputTokensPerCall:e.calls>0?e.outputTokens/e.calls:null,toolCallsPerCall:e.calls>0?(e.toolCalls??0)/e.calls:null,cacheHitRate:e.inputTokens>0?Math.min(1,e.cachedReadTokens/e.inputTokens):null}}function gn(e){let t=Object.values(e).map(o=>o.calls).sort((o,n)=>o-n);return t.length<4?null:t[Math.floor((t.length-1)*.25)]}var Cr=[["anthropic","Anthropic"],["claude","Anthropic"],["codestral","Mistral AI"],["devstral","Mistral AI"],["gemini","Google"],["goldeneye","xAI"],["google","Google"],["gpt","OpenAI"],["grok","xAI"],["magistral","Mistral AI"],["mai-","Microsoft"],["ministral","Mistral AI"],["mistral","Mistral AI"],["o1","OpenAI"],["o3","OpenAI"],["o4","OpenAI"],["pixtral","Mistral AI"],["qwen","Alibaba"],["raptor","xAI"]];function yt(e){let t=oo(e);if(t)return t;let o=De(e).flatMap(n=>Cr.filter(([s])=>n.toLowerCase().startsWith(s))).at(0);return o?o[1]:"Other"}var Sr=new Set(["\u2705","\u26A0\uFE0F","\u274C"]);function ht(e){let t=Number(e);return Number.isFinite(t)?t:0}function mn(e){if(!e||typeof e!="object")return;let t=e,o=Array.isArray(t.customizationTypes)?t.customizationTypes.filter(s=>!!s&&typeof s=="object").map(s=>({id:typeof s.id=="string"?s.id:"",icon:typeof s.icon=="string"?s.icon:"",label:typeof s.label=="string"?s.label:""})).filter(s=>s.id!==""):[],n=Array.isArray(t.workspaces)?t.workspaces.filter(s=>!!s&&typeof s=="object").map(s=>{let r=s.typeStatuses&&typeof s.typeStatuses=="object"?s.typeStatuses:{},i={};for(let[a,l]of Object.entries(r))i[a]=Sr.has(l)?l:"\u274C";return{workspacePath:typeof s.workspacePath=="string"?s.workspacePath:"",workspaceName:typeof s.workspaceName=="string"?s.workspaceName:"",sessionCount:ht(s.sessionCount),interactionCount:ht(s.interactionCount),typeStatuses:i}}):[];return{customizationTypes:o,workspaces:n,totalWorkspaces:ht(t.totalWorkspaces),workspacesWithIssues:ht(t.workspacesWithIssues)}}function Le(e){return typeof e=="number"&&Number.isFinite(e)?e:0}function Tr(e){if(!e||typeof e!="object")return null;let t=e;return{budgetUsd:Le(t.budgetUsd),budgetAiCredits:Le(t.budgetAiCredits),remainingAiCredits:Le(t.remainingAiCredits),usedAiCredits:Le(t.usedAiCredits),pctAvailable:Le(t.pctAvailable)}}function $r(e){if(!e||typeof e!="object")return null;let t={};for(let[o,n]of Object.entries(e))typeof n=="number"&&Number.isFinite(n)&&(t[o]=n);return t}function fn(e,t){if(!t||typeof t!="object")return;let o=t,n=Tr(o.copilotApiBalance);n&&(e.copilotApiBalance=n);let s=$r(o.monthBillingGroupCosts);s&&(e.monthBillingGroupCosts=s)}function Ar(e,t){if(!t)return 0;let o=e["GitHub Copilot"]??0;return Math.max(0,t.usedAiCredits*.01-o)}function bn(e,t){let o=Ar(e,t),n="GitHub Copilot"in e,s=Object.values(e).reduce((a,l)=>a+l,0)+o,r=o>.001?`<tr>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary);">GitHub Copilot - other sessions (remote or different environment)</td>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary); text-align:right;">$${w(o,2)}</td>
		</tr>`:"";return`
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${Object.entries(e).sort(([,a],[,l])=>l-a).map(([a,l])=>`
				<tr>
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${d(a==="GitHub Copilot"?"GitHub Copilot - local sessions":a)}</td>
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${w(l,2)}</td>
				</tr>${a==="GitHub Copilot"?r:""}`).join("")+(n?"":r)}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${w(s,2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}var Mr=3600*1e3;function Er(e){return e==="account"||e==="both"?e:"workspace"}function _(e){let t=Number(e);return Number.isFinite(t)&&t>=0?t:0}function vt(e){let t=typeof e=="string"?e.trim():"";try{let o=new URL(t);if(o.protocol==="http:"||o.protocol==="https:")return o.toString()}catch{}return"#"}function yn(e){let t=e&&typeof e=="object"?e:{},o=Array.isArray(t.repos)?t.repos:[];return{authenticated:!!t.authenticated,since:typeof t.since=="string"?d(t.since):new Date(Date.now()-720*60*60*1e3).toISOString(),fetchedAt:typeof t.fetchedAt=="string"?t.fetchedAt:"",totalTasks:_(t.totalTasks),totalSessions:_(t.totalSessions),totalCredits:_(t.totalCredits),totalPremiumRequests:_(t.totalPremiumRequests),accountTasksAvailable:!!t.accountTasksAvailable,refreshIntervalMs:_(t.refreshIntervalMs)||Mr,accountTasksError:typeof t.accountTasksError=="string"?d(t.accountTasksError):void 0,partial:!!t.partial,repos:o.map(n=>{let s=n&&typeof n=="object"?n:{},r=d(typeof s.owner=="string"?s.owner:""),i=d(typeof s.repo=="string"?s.repo:""),a=!!s.unassigned||!r||!i;return{owner:r,repo:i,repoUrl:a?"#":vt(`https://github.com/${r}/${i}`),totalTasks:_(s.totalTasks),totalSessions:_(s.totalSessions),totalCredits:_(s.totalCredits),totalPremiumRequests:_(s.totalPremiumRequests),tasksScanned:_(s.tasksScanned),tasksTotal:_(s.tasksTotal),partial:!!s.partial,discovery:Er(s.discovery),unassigned:a,error:typeof s.error=="string"?d(s.error):void 0}})}}var Rr=new Set(["activity","sessions","tools","health","repos","agent","worktrees","insights","corrections"]);function hn(e){return Rr.has(String(e))}function no(e,t){if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<=0)return 5;let o=Math.min(e/t,1);return 5+Math.sqrt(o)*11}function be(e,t,o,n){let s=Math.max(18,Array.from(e.label).length*6),r=n==="start"?t:n==="end"?t-s:t-s/2;return{x:t,y:o,textAnchor:n,bounds:{left:r,right:r+s,top:o-10,bottom:o-10+12}}}function _r(e,t){let o=e.x+e.radius+4,n=e.x-e.radius-4,s=e.y-e.radius-6,r=e.y+e.radius+12,i=e.y<t.top+22?[e.y+18,e.y-10]:[e.y-10,e.y+18];return[be(e,o,i[0],"start"),be(e,o,i[1],"start"),be(e,n,i[0],"end"),be(e,n,i[1],"end"),be(e,e.x,s,"middle"),be(e,e.x,r,"middle")]}function Pr(e,t){return e.left<t.right+2&&e.right+2>t.left&&e.top<t.bottom+2&&e.bottom+2>t.top}function Dr(e,t){let o=Math.max(e.left,Math.min(t.x,e.right)),n=Math.max(e.top,Math.min(t.y,e.bottom)),s=t.x-o,r=t.y-n;return s*s+r*r<(t.radius+2)**2}function vn(e,t,o,n){let s=e.bounds,r=Math.max(0,n.left-s.left)+Math.max(0,s.right-n.right)+Math.max(0,n.top-s.top)+Math.max(0,s.bottom-n.bottom),i=t.filter(l=>Pr(s,l.bounds)).length,a=o.filter(l=>Dr(s,l)).length;return r*1e4+a*1e3+i*100}function xn(e,t){let o=[];for(let n of e){let r=_r(n,t).reduce((i,a)=>vn(a,o,e,t)<vn(i,o,e,t)?a:i);o.push(r)}return o}var kn=/^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;function wn(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function Cn(e){let t=kn.exec(e);if(t)return`Claude MCP: M365 Connector - ${wn(t[1])}`}function Sn(e){return kn.test(e)}var Lr=[{displayName:"GitHub MCP",keywords:["github"],actions:new Set(["actions_list","add_comment_to_pending_review","add_issue_comment","add_reply_to_pull_request_comment","assign_copilot_to_issue","create_or_update_file","create_pull_request","create_repository","get_commit","get_file_contents","get_job_logs","get_label","get_latest_release","get_me","get_release_by_tag","get_repository_tree","get_tag","issue_read","issue_write","label_write","list_branches","list_code_scanning_alerts","list_commits","list_issue_fields","list_issue_types","list_issues","list_label","list_pull_requests","list_tags","projects_list","pull_request_read","pull_request_review_write","request_copilot_review","search_code","search_issues","search_pull_requests","search_repositories","search_users","semantic_issue_similarity_search","semantic_issues_search","sub_issue_write","update_pull_request"])},{displayName:"Playwright MCP",keywords:["playwright"],actions:new Set(["browser_click","browser_close","browser_console_messages","browser_evaluate","browser_fill_form","browser_find","browser_hover","browser_install","browser_navigate","browser_network_request","browser_network_requests","browser_press_key","browser_resize","browser_run_code","browser_run_code_unsafe","browser_snapshot","browser_tabs","browser_take_screenshot","browser_type","browser_wait_for"])},{displayName:"Context7 MCP",keywords:["context7"],actions:new Set(["get_library_docs","query_docs","resolve_library_id"])},{displayName:"Tavily MCP",keywords:["tavily"],actions:new Set(["tavily_crawl","tavily_extract","tavily_research","tavily_search","crawl","extract","research","search"])},{displayName:"Microsoft Docs MCP",keywords:["microsoft_doc","microsoftdocs","microsoft_learn"],actions:new Set(["docs_fetch","docs_search","code_sample_search"])},{displayName:"Claude Browser MCP",keywords:["claude_browser","claude_in_chrome"],actions:new Set(["computer","find","get_page_text","javascript_tool","navigate","preview_list","preview_logs","preview_start","preview_stop","read_console_messages","read_network_requests","read_page","resize_window","tabs_close","tabs_context","tabs_create","tabs_select"])}];function Ur(e){return e.toLowerCase().replace(/[.-]/g,"_")}function so(e){let t=Ur(e);for(let o of Lr)if(o.keywords.some(n=>t.includes(n))){for(let n of o.actions)if(t===n||t.endsWith(`_${n}`))return`${o.displayName}: ${wn(n)}`}}function Tn(e){return so(e)!==void 0}function j(e,t){let o=t?` title="${d(t)}"`:"",n="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";return e==="\u2705"?`<span style="${n}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${o} aria-label="${d(t??"Present and fresh")}">\u2713</span>`:e==="\u26A0\uFE0F"?`<span style="${n}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${o} aria-label="${d(t??"Present but stale")}">!</span>`:`<span style="${n}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${o} aria-label="${d(t??"Missing")}">\u2715</span>`}var f=acquireVsCodeApi(),bs=new Set,V=f.getState()?.aboutCollapsed??!1;function Z(e,t){try{f.postMessage({command:"traceUsageCuration",stage:e,details:t??{}})}catch{}}function pe(e,t,o){bs.has(e)||(bs.add(e),Z(t,o))}var E=q("__INITIAL_USAGE__");if(E?.localization){Qo(E.localization);let e=E.localization.__language__||"en";tn(e)}var H=null,ct=new Map,$e=new Set,B=null,ge=!1,me=!1,st=!1,_s=[],$="activity",Lt=null,Ut=null,Bo=[],It=null,U=E?.worktreeScanRoots?[...E.worktreeScanRoots]:[],L=E?.worktreeBackgroundScan?E.worktreeBackgroundScan.worktrees.map(qo):[],Ge=E?.worktreeBackgroundScan?{scannedAt:E.worktreeBackgroundScan.scannedAt,totalBytes:E.worktreeBackgroundScan.totalBytes}:null,R=!1,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},rt=null,$o=!1,zt=new Set,Ve=!1,it="count",Ye="desc",W=!1,fe=!1,Oo={processed:0,total:0},re=[];function A(e){return Number(e??0)||0}var ei=`
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
</style>`,Je=[{id:"ul-s-start",label:"Starting usage analysis"},{id:"ul-s-tools",label:"Collecting runtime tools"},{id:"ul-s-mcp",label:"Discovering MCP servers"},{id:"ul-s-skills",label:"Scanning skill directories"},{id:"ul-s-crunch",label:"Computing curation analysis"},{id:"ul-s-ready",label:"Ready!"}],ti={start:{pct:5,stepId:"ul-s-start",subtitle:"Starting usage analysis\u2026"},"curation:start":{pct:20,stepId:"ul-s-tools",subtitle:"Collecting tools and skills\u2026"},"curation:runtimeTools":{pct:32,stepId:"ul-s-tools",subtitle:"Collected runtime tools"},"curation:mcpJson":{pct:44,stepId:"ul-s-mcp",subtitle:"Scanning MCP config files\u2026"},"curation:mcpSources":{pct:55,stepId:"ul-s-mcp",subtitle:"Collected MCP servers"},"curation:skillsScanStart":{pct:63,stepId:"ul-s-skills",subtitle:"Scanning skill directories\u2026"},"curation:skillsScanDone":{pct:75,stepId:"ul-s-skills",subtitle:"Skill discovery complete"},"curation:analyzing":{pct:85,stepId:"ul-s-crunch",subtitle:"Analyzing tool usage patterns\u2026"},"curation:done":{pct:96,stepId:"ul-s-crunch",subtitle:"Curation analysis complete"},ready:{pct:100,stepId:"ul-s-ready",subtitle:"Usage analysis ready"},error:{pct:100,stepId:"ul-s-ready",subtitle:"Analysis completed with errors"},"curation:error":{pct:85,stepId:"ul-s-crunch",subtitle:"Curation analysis skipped"}};function No(e="Loading usage analysis..."){let t=document.getElementById("root");if(!t)return;Ho=!0;let o=Je.map((n,s)=>{let r=s===0,i=r?"ul-step ul-active":"ul-step",a=r?'<span class="ul-spin">\u21BB</span>':"\u25CB";return`<div class="${i}" id="${n.id}"><span class="ul-ico">${a}</span><span class="ul-lbl">${d(n.label)}</span><span class="ul-cnt" id="${n.id}-cnt"></span></div>`}).join("");k(t,`${ei}
<div id="usage-loading-wrap">
  <div id="usage-loading-card">
    <div id="ul-header">
      <div>
        <div id="ul-badge">\u{1F4CA} Analyzing Usage Data</div>
        <div id="ul-title">${d(e)}</div>
        <div id="ul-subtitle">Initializing\u2026</div>
      </div>
      <div id="ul-right">
        <div id="ul-pct">\u2013</div>
        <div style="display:flex;gap:6px;" id="ul-meta"></div>
      </div>
    </div>
    <div id="ul-track"><div id="ul-fill" class="ul-indeterminate"></div></div>
    <div id="ul-steps">${o}</div>
  </div>
</div>`)}function ys(e){let t=document.getElementById(e);if(!t)return;t.className="ul-step ul-done";let o=t.querySelector(".ul-ico");o&&k(o,'<span class="ul-pop">\u2713</span>')}function oi(e){let t=document.getElementById(e);if(!t)return;t.className="ul-step ul-active";let o=t.querySelector(".ul-ico");o&&k(o,'<span class="ul-spin">\u21BB</span>')}function ni(e,t){let o=document.getElementById(`${e}-cnt`);o&&(o.textContent=t)}var Xe=0,Ho=!1;function si(e,t){for(let o=Xe;o<e;o++)ys(Je[o].id);e>Xe&&(Xe=e),t<100?oi(Je[e].id):ys(Je[e].id)}function ri(e){return typeof e.count=="number"?`${e.count}`:typeof e.skills=="number"?`${e.skills} skills`:typeof e.availableTools=="number"?`${e.availableTools} tools`:""}function ii(){let e=document.getElementById("root");return e?e.querySelector("#usage-loading-card")?!0:Ho?(No("Building Usage Analysis"),Xe=0,!0):!1:!1}function ai(e){if(!ii())return;let t=typeof e?.stage=="string"?e.stage:"",o=ti[t];if(!o)return;let n=o.pct,s=document.getElementById("ul-fill");s&&(s.classList.remove("ul-indeterminate"),s.style.width=`${Math.max(n,3)}%`);let r=document.getElementById("ul-pct");r&&(r.textContent=n===100?"100%":`${n}%`);let i=document.getElementById("ul-subtitle");i&&(i.textContent=o.subtitle);let a=Je.findIndex(u=>u.id===o.stepId);a>=0&&si(a,n);let l=e?.details;if(l&&typeof l=="object"){let u=ri(l);u&&ni(o.stepId,`(${u})`)}}function Po(){Ut!==null&&(clearTimeout(Ut),Ut=null)}function Kt(){let e=document.createElement("button");return e.textContent="\u{1F504} Refresh",e.style.cssText="padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;",e.addEventListener("click",()=>f.postMessage({command:"refresh"})),e}function Ps(e){let t=document.getElementById("root");if(!t)return;let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="font-size: 24px; margin-bottom: 12px;",k(n,j("\u274C","Error"));let s=document.createElement("div");s.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",s.textContent=e,o.append(n,s,Kt()),t.textContent="",t.append(o)}var Do=!1,Ze=null,Lo=!1,Qe=null,li={xhigh:"Extra High"};function di(e){return li[e]??e}var et=q("__TOOL_NAMES__")??null,ci=q("__AUTOMATIC_TOOLS__")??[],hs=new Set(ci.map(e=>e.toLowerCase()));function tt(e){return et?et[e]??et[e.toLowerCase()]??Cn(e)??so(e)??e:e}function Ao(e){let t=tt(e),o=t.indexOf(":");return o!==-1?t.substring(o+1).trim():t}function ui(e){let t=new Set;Object.entries(e.today.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.entries(e.last30Days.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.entries(e.month.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.keys(e.today.mcpTools.byServer).forEach(n=>t.add(n)),Object.keys(e.last30Days.mcpTools.byServer).forEach(n=>t.add(n)),Object.keys(e.month.mcpTools.byServer).forEach(n=>t.add(n)),Object.entries(e.today.toolCalls.byTool).forEach(([n])=>t.add(n)),Object.entries(e.last30Days.toolCalls.byTool).forEach(([n])=>t.add(n)),Object.entries(e.month.toolCalls.byTool).forEach(([n])=>t.add(n));let o=new Set(e.suppressedUnknownTools??[]);return Array.from(t).filter(n=>!et?.[n]&&!et?.[n.toLowerCase()]&&!Sn(n)&&!Tn(n)&&!o.has(n)).sort()}function pi(e){let t="https://github.com/rajbos/ai-engineering-fluency",o=encodeURIComponent("Add missing friendly names for tools"),n=e.map(i=>`- \`${i}\``).join(`
`),s=encodeURIComponent(`## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${n}

Please add friendly names for these tools to improve the user experience.`),r=encodeURIComponent("MCP Toolnames");return`${t}/issues/new?title=${o}&body=${s}&labels=${r}`}var gi=[{label:"\u{1F4AC} Ask Mode",key:"ask",gradient:"linear-gradient(90deg, #3b82f6, #60a5fa)"},{label:"\u270F\uFE0F Edit Mode",key:"edit",gradient:"linear-gradient(90deg, #10b981, #34d399)"},{label:"\u{1F916} Agent Mode",key:"agent",gradient:"linear-gradient(90deg, #7c3aed, #a855f7)"},{label:"\u{1F4CB} Plan Mode",key:"plan",gradient:"linear-gradient(90deg, #f59e0b, #fbbf24)"},{label:"\u26A1 Custom Agent",key:"customAgent",gradient:"linear-gradient(90deg, #ec4899, #f472b6)"},{label:"\u{1F5A5}\uFE0F CLI",key:"cli",gradient:"linear-gradient(90deg, #06b6d4, #22d3ee)"},{label:"\u2728 Copilot App",key:"cliApp",gradient:"linear-gradient(90deg, #6366f1, #818cf8)"}];function mi(e,t,o,n){let s=o>0?t/o*100:0;return`
<div class="bar-item">
<div class="bar-label"><span>${e}</span><span><strong>${g(t)}</strong> (${Q(s,0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${s.toFixed(1)}%; background: ${n};"></div></div>
</div>`}function vs(e,t){let o=e.ask+e.edit+e.agent+e.plan+e.customAgent+e.cli+(e.cliApp??0),n=gi.map(({label:s,key:r,gradient:i})=>mi(s,e[r]??0,o,i)).join("");return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${t}</h4>
<div class="bar-chart">${n}
</div>
</div>`}function fi(e){return`
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${w(e.averageModelsPerSession,1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${Q(e.switchingFrequency,0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${g(e.maxModelsPerSession||0)}</div>
</div>
</div>`}function bi(e,t,o,n){return`
<div style="min-height: 110px;">
${e.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">\u{1F49A} Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${e.map(d).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${t.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${t.map(d).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${o.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${o.map(d).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${n.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">\u2753 Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${n.map(d).join(", ")}</span>
</div>
`:""}
</div>`}function yi(e){return e.totalRequests<=0?"":`
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${e.lowCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${g(e.lowCostRequests)} (${Q(e.lowCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.mediumCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${g(e.mediumCostRequests)} (${Q(e.mediumCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.highCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${g(e.highCostRequests)} (${Q(e.highCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.unknownRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${g(e.unknownRequests)} (${Q(e.unknownRequests/e.totalRequests*100)})</span>
</div>
`:""}
</div>`}function hi(e){return e.mixedCostSessions<=0?"":`
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${g(e.mixedCostSessions)}</span>
</div>`}function Mo(e,t,o,n,s,r){return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${e}</h4>
${fi(t)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${bi(o,n,s,r)}
${yi(t)}
${hi(t)}
</div>
</div>`}function xs(e,t,o,n,s){let r=document.querySelector(e);if(!r)return;let i=s>0?Math.round(n/s*100):0,a=`${o} ${n}/${s} repos (${i}%)`,l=r.querySelector(`.${t}`);if(l)l.textContent=a;else{Array.from(r.children).forEach(c=>{let p=c;!p.classList.contains("section-title")&&!p.classList.contains("section-subtitle")&&p.remove()});let u=document.createElement("div");u.className=t,u.style.cssText="margin-top:8px; font-size:12px; color:var(--text-secondary);",u.textContent=a,r.appendChild(u)}}function vi(e){let t=e.missedPotential||E?.missedPotential||[];return t.length===0?`
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${j("\u2705")} No other AI tool configs missing a Copilot counterpart
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
					All active workspaces that contain instruction files for other AI tools (e.g. .cursorrules, CLAUDE.md, AGENTS.md) also have Copilot customization files configured.
				</div>
				<div style="font-size: 11px; color: var(--text-secondary);">
					A workspace appears here when it has instruction files for other AI tools but no Copilot customization files \u2014 indicating Copilot may be under-configured compared to other tools. <a href="https://code.visualstudio.com/docs/copilot/customization/custom-instructions" style="color: var(--link-color);" target="_blank">Learn how to add Copilot instructions</a>.
				</div>
			</div>
		`:`
        <div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 6px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--warning-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${j("\u26A0\uFE0F")} Missed Potential: Non-Copilot Instruction Files
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
                        ${t.map(o=>`
                            <tr style="background: rgba(251, 191, 36, 0.05);">
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); font-family: 'Courier New', monospace; font-size: 12px;">
                                    ${d(o.workspaceName)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${g(o.sessionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${g(o.interactionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        ${o.nonCopilotFiles.map(n=>`
                                            <div style="font-size: 11px; display: flex; align-items: center; gap: 6px;">
                                                <span>${d(n.icon||"\u{1F4C4}")}</span>
                                                <span style="font-weight: 500;">${d(n.label||"")}:</span>
                                                <span style="font-family: monospace; color: var(--text-muted);">${d(n.relativePath)}</span>
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
    `}function Y(e,t=10,o=tt,n=!1){let r=(n&&at?Object.entries(e).filter(([a])=>!hs.has(a.toLowerCase())):Object.entries(e)).sort(([,a],[,l])=>l-a).slice(0,t);return r.length===0?n&&at?'<div style="color: var(--text-muted);">No purposeful tools used yet (automatic tool calls are hidden)</div>':'<div style="color: var(--text-muted);">No tools used yet</div>':`
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${r.map(([a,l],u)=>{let c=d(o(a)),p=d(a),b=hs.has(a.toLowerCase())?'<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>':"";return`
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${u+1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${p}">${c}</strong>${b}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${g(l)}</td>
		    </tr>`}).join("")}
			</tbody>
		</table>`}var jo=[{id:"interactions",label:"Turns",sortKey:"interactions",align:"right",render:e=>({html:g(e.interactions)})},{id:"toolCalls",label:"Tools",sortKey:"toolCalls",align:"right",render:e=>({html:g(e.toolCalls)})},{id:"subAgentCalls",label:"Sub-Agents",sortKey:"subAgentCalls",align:"right",render:e=>e.subAgentCalls?{html:g(e.subAgentCalls),title:`${e.subAgentCalls} sub-agent tool call${e.subAgentCalls===1?"":"s"} detected in this session`}:{html:"\u2014",title:"No sub-agent calls detected in this session"}},{id:"inputTokens",label:"Input",sortKey:"inputTokens",align:"right",render:e=>({html:g(e.inputTokens)})},{id:"outputTokens",label:"Output",sortKey:"outputTokens",align:"right",render:e=>({html:g(e.outputTokens)})},{id:"thinkingTokens",label:"Thinking",sortKey:"thinkingTokens",align:"right",render:e=>({html:g(e.thinkingTokens)})},{id:"cachedTokens",label:"Cached",sortKey:"cachedTokens",align:"right",render:e=>({html:g(e.cachedTokens)})},{id:"totalTokens",label:"Total",sortKey:"totalTokens",align:"right",render:e=>({html:g(e.totalTokens)})},{id:"estimatedCost",label:"Cost",sortKey:"estimatedCost",align:"right",render:e=>({html:e.estimatedCost>0?`$${e.estimatedCost.toFixed(4)}`:"\u2014"})},{id:"editor",label:"Editor",sortKey:"editor",align:"left",render:e=>({html:d(e.editor||"unknown")})},{id:"workspace",label:"Workspace",sortKey:"workspace",align:"left",cellStyle:"max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:e=>{let t=d(e.workspace||"\u2014");return{html:t,title:t}}},{id:"models",label:"Models",align:"left",cellStyle:"font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:e=>{let t=e.models.map(o=>d(ee(o))).join(", ")||"\u2014";return{html:t,title:t}}},{id:"durationMs",label:"Duration",sortKey:"durationMs",align:"right",cellStyle:"white-space:nowrap;",render:e=>{let t=e.activeDurationMs??e.durationMs,o=e.durationMs!==void 0?`Wall time: ${Zt(e.durationMs)}`:void 0;return{html:Zt(t),...o?{title:o}:{}}}},{id:"lastActivity",label:"Last Active",sortKey:"lastActivity",align:"right",cellStyle:"white-space:nowrap;",render:e=>({html:e.lastActivity?I==="today"?new Date(e.lastActivity).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!Ot}):new Date(e.lastActivity).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!Ot}):"\u2014"})}],Ds=jo.map(e=>e.id),Te="interactions",ot="desc",Fo=[],Ot=!0,at=!0,I="today",Uo=[],Ae={},Me=new Set(Ds);function xi(){f.postMessage({command:"saveSessionColumnSettings",settings:{enabledColumns:Array.from(Me)}})}function ks(e){return Te!==e?"":ot==="desc"?" \u25BC":" \u25B2"}var ki={title:(e,t)=>(e.title||"").localeCompare(t.title||""),editor:(e,t)=>(e.editor||"").localeCompare(t.editor||""),workspace:(e,t)=>(e.workspace||"").localeCompare(t.workspace||""),durationMs:(e,t)=>(e.activeDurationMs??e.durationMs??-1)-(t.activeDurationMs??t.durationMs??-1),subAgentCalls:(e,t)=>(e.subAgentCalls??0)-(t.subAgentCalls??0),lastActivity:(e,t)=>(e.lastActivity||"").localeCompare(t.lastActivity||"")};function wi(e,t){let o=ki[Te];return o?o(e,t):e[Te]-t[Te]}function Ci(e){return[...e].sort((t,o)=>{let n=wi(t,o);return ot==="desc"?-n:n})}function Io(e){return Fo=e,!e||e.length===0?`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${I==="today"?"No sessions recorded today yet.":"No sessions recorded in this period."}</div>`:`<div id="sessions-table-container">${Wo(e)}</div>`}function Wo(e){let t=Ci(e),o=jo.filter(r=>Me.has(r.id)),n=t.map((r,i)=>{let a=d(r.title||"Untitled session"),l=d(r.filePath||""),u=o.map(c=>{let{html:p,title:b}=c.render(r),h=c.align==="right"?"text-align:right;":"",S=b!==void 0?` title="${b}"`:"";return`<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${h}${c.cellStyle||""}"${S}>${p}</td>`}).join("");return`<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${i+1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${a}&quot;"><a href="#" class="session-title-link" data-file="${l}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${a}</a></td>
			${u}
		</tr>`}).join(""),s=o.map(r=>{let i=r.align==="right"?" text-align:right;":"";return r.sortKey?`<th class="sortable" data-sort="${r.sortKey}" style="padding:6px 8px;${i}">${r.label}${ks(r.sortKey)}</th>`:`<th style="padding:6px 8px;${i}">${r.label}</th>`}).join("");return`
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${ks("title")}</th>
					${s}
				</tr>
			</thead>
			<tbody>
				${n}
			</tbody>
		</table>
		</div>`}function Si(){return`
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">\u2699 Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${jo.map(t=>`
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${t.id}"${Me.has(t.id)?" checked":""} />
			<span>${t.label}</span>
		</label>`).join("")}
			</div>
		</div>`}function Ls(){let e=document.getElementById("sessions-panel-body");e&&(e.addEventListener("click",t=>{let o=t.target.closest("a.session-title-link");if(o){t.preventDefault();let i=o.getAttribute("data-file");i&&f.postMessage({command:"openSessionFile",file:i});return}let n=t.target.closest("th.sortable");if(!n)return;let s=n.getAttribute("data-sort");if(!s)return;Te===s?ot=ot==="desc"?"asc":"desc":(Te=s,ot="desc");let r=document.getElementById("sessions-table-container");r&&k(r,Wo(Fo))}),Us(),Ti())}var ws=!1;function Ti(){let e=document.getElementById("sessions-columns-toggle"),t=document.getElementById("sessions-columns-menu");!e||!t||(e.addEventListener("click",o=>{o.stopPropagation(),t.style.display=t.style.display==="none"?"block":"none"}),t.addEventListener("click",o=>o.stopPropagation()),t.addEventListener("change",o=>{let n=o.target,s=n.getAttribute("data-column");if(!s)return;n.checked?Me.add(s):Me.delete(s);let r=document.getElementById("sessions-table-container");r&&k(r,Wo(Fo)),xi()}),ws||(ws=!0,document.addEventListener("click",()=>{let o=document.getElementById("sessions-columns-menu");o&&(o.style.display="none")})))}function Us(){let e=document.getElementById("sessions-lookback-wrapper");if(!e)return;e.replaceChildren();let{wrapper:t}=Yt({id:"sessions-lookback",selected:I,disabled:["allTime"],disabledTitle:"All-time sessions are not loaded yet",label:"",onChange:o=>{I=o,zo()}});e.append(t),I!=="today"&&!Ae[I]&&zo()}function zo(){let e=document.getElementById("sessions-panel-body");if(!e)return;if(I==="today"){k(e,Io(Uo));return}let t=Ae[I];if(t){k(e,Io(t));return}k(e,`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${pt[I]}\u2026</div>`),f.postMessage({command:"loadRecentSessions",period:I})}function $i(e){let t=e.period;if(!t)return;let o=Array.isArray(e.sessions)?e.sessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"):[];Ae[t]=o,I===t&&zo()}function Is(e){for(let o of mt)delete Ae[o];let t=Qt(e);if(t)for(let o of mt)Ae[o]=t[o]}function J(e,t){let o={...e};for(let n of t)n in o||(o[n]=0);return o}function x(e){let t=Number(e);return Number.isFinite(t)?t:0}function Ai(e){let t=e&&typeof e=="object"?e:{};return{ask:x(t.ask),edit:x(t.edit),agent:x(t.agent),plan:x(t.plan),customAgent:x(t.customAgent),cli:x(t.cli),cliApp:x(t.cliApp)}}function Mi(e){let t=e&&typeof e=="object"?e:{};return{file:x(t.file),selection:x(t.selection),implicitSelection:x(t.implicitSelection),symbol:x(t.symbol),codebase:x(t.codebase),workspace:x(t.workspace),terminal:x(t.terminal),vscode:x(t.vscode),terminalLastCommand:x(t.terminalLastCommand),terminalSelection:x(t.terminalSelection),clipboard:x(t.clipboard),changes:x(t.changes),outputPanel:x(t.outputPanel),problemsPanel:x(t.problemsPanel),pullRequest:x(t.pullRequest),byKind:t.byKind??{},copilotInstructions:x(t.copilotInstructions),agentsMd:x(t.agentsMd),byPath:t.byPath??{}}}function Pt(e){let t=e&&typeof e=="object"?e:{},o=t.toolCalls&&typeof t.toolCalls=="object"?t.toolCalls:{},n=t.mcpTools&&typeof t.mcpTools=="object"?t.mcpTools:{};return{sessions:x(t.sessions),modeUsage:Ai(t.modeUsage),contextReferences:Mi(t.contextReferences),toolCalls:{total:x(o.total),byTool:o.byTool??{}},mcpTools:{total:x(n.total),byServer:n.byServer??{},byTool:n.byTool??{}},modelSwitching:{modelsPerSession:[],totalSessions:0,averageModelsPerSession:0,maxModelsPerSession:0,minModelsPerSession:0,switchingFrequency:0,standardModels:[],premiumModels:[],unknownModels:[],mixedTierSessions:0,lowCostModels:[],mediumCostModels:[],highCostModels:[],mixedCostSessions:0,standardRequests:0,premiumRequests:0,lowCostRequests:0,mediumCostRequests:0,highCostRequests:0,unknownRequests:0,totalRequests:0,...t.modelSwitching??{}},thinkingEffortUsage:t.thinkingEffortUsage,modelEfficiency:t.modelEfficiency}}function zs(e){return e.filter(t=>t&&typeof t=="object"&&typeof t.id=="string").map(t=>({id:String(t.id),category:typeof t.category=="string"?t.category:"general",severity:["tip","opportunity","celebration"].includes(t.severity)?t.severity:"tip",title:typeof t.title=="string"?t.title:"",body:typeof t.body=="string"?t.body:"",actionLabel:typeof t.actionLabel=="string"?t.actionLabel:void 0,actionCommand:typeof t.actionCommand=="string"?t.actionCommand:void 0,status:["new","seen","dismissed","snoozed","done"].includes(t.status)?t.status:"new",allowToast:!!t.allowToast}))}var Ei=["user-correction","edit-retry","edit-self-correction","tool-error","agent-self-correction"];function Ri(e){return!e||typeof e!="object"||!Ei.includes(e.type)||typeof e.snippet!="string"?null:{type:e.type,turnNumber:typeof e.turnNumber=="number"?e.turnNumber:0,timestamp:typeof e.timestamp=="string"?e.timestamp:null,snippet:e.snippet,tool:typeof e.tool=="string"?e.tool:void 0,file:typeof e.file=="string"?e.file:void 0,retried:e.retried===!0?!0:void 0,matchedPattern:typeof e.matchedPattern=="string"?e.matchedPattern:void 0}}function Bs(e){let t=o=>typeof o=="number"&&isFinite(o)&&o>=0?o:0;return{userCorrections:t(e?.userCorrections),editRetries:t(e?.editRetries),editSelfCorrections:t(e?.editSelfCorrections),toolErrors:t(e?.toolErrors),toolErrorsRetried:t(e?.toolErrorsRetried),agentSelfCorrections:t(e?.agentSelfCorrections)}}function _i(e){if(!e||typeof e!="object"||typeof e.file!="string"||!Array.isArray(e.moments))return null;let t=e.moments.map(Ri).filter(o=>o!==null);return t.length===0?null:{file:e.file,title:typeof e.title=="string"?e.title:null,lastInteraction:typeof e.lastInteraction=="string"?e.lastInteraction:null,moments:t,totalMoments:typeof e.totalMoments=="number"&&isFinite(e.totalMoments)?Math.max(t.length,e.totalMoments):t.length}}function Pi(e){if(!e||typeof e!="object"||typeof e.repository!="string"||!Array.isArray(e.sessions))return null;let t=e.sessions.map(_i).filter(o=>o!==null);return t.length===0?null:{repository:e.repository,sessions:t,counts:Bs(e.counts),sessionsWithMoments:typeof e.sessionsWithMoments=="number"?e.sessionsWithMoments:t.length}}function Di(e){if(!e||typeof e!="object"||!Array.isArray(e.repos))return null;let t=e.repos.map(Pi).filter(o=>o!==null);return t.length===0?null:{sessionsPerRepo:typeof e.sessionsPerRepo=="number"?e.sessionsPerRepo:25,repos:t,counts:Bs(e.counts),sessionsWithMoments:typeof e.sessionsWithMoments=="number"?e.sessionsWithMoments:t.reduce((o,n)=>o+n.sessionsWithMoments,0)}}function Li(e){if(!e||typeof e!="object"||typeof e.representativePrompt!="string"||typeof e.sessionCount!="number"||!Array.isArray(e.sessions))return null;let t=e.sessions.filter(o=>o&&typeof o=="object"&&typeof o.file=="string").map(o=>({file:o.file,title:typeof o.title=="string"?o.title:null,lastInteraction:typeof o.lastInteraction=="string"?o.lastInteraction:null,repository:typeof o.repository=="string"?o.repository:void 0}));return t.length===0?null:{representativePrompt:e.representativePrompt,sessionCount:t.length,repositories:Array.isArray(e.repositories)?e.repositories.filter(o=>typeof o=="string"):[],sessions:t,sharedKeywords:Array.isArray(e.sharedKeywords)?e.sharedKeywords.filter(o=>typeof o=="string"):[]}}function Ui(e){if(!e||typeof e!="object"||!Array.isArray(e.clusters))return null;let t=e.clusters.map(Li).filter(o=>o!==null);return t.length===0?null:{minClusterSize:typeof e.minClusterSize=="number"?e.minClusterSize:2,sessionsScanned:typeof e.sessionsScanned=="number"?e.sessionsScanned:0,clusters:t}}function Ii(e){if(!e||typeof e!="object")return null;let t=e;return{windowDays:typeof t.windowDays=="number"?t.windowDays:30,availableTools:Array.isArray(t.availableTools)?t.availableTools:[],usedTools:Array.isArray(t.usedTools)?t.usedTools:[],unusedTools:Array.isArray(t.unusedTools)?t.unusedTools:[],underusedMcpServers:Array.isArray(t.underusedMcpServers)?t.underusedMcpServers:[],underusedAgentPlugins:Array.isArray(t.underusedAgentPlugins)?t.underusedAgentPlugins:[],estimatedPromptBloat:t.estimatedPromptBloat&&typeof t.estimatedPromptBloat=="object"?t.estimatedPromptBloat:{totalTokens:0,byServer:{}},recommendations:Array.isArray(t.recommendations)?t.recommendations:[]}}function zi(e,t){e.correctionReport=Di(t.correctionReport),e.repeatedTasks=Ui(t.repeatedTasks)}function Bi(e,t){Array.isArray(t.todaySessions)&&(e.todaySessions=t.todaySessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"));let o=Qt(t.recentSessions);o&&(e.recentSessions=o)}function Oi(e){if(!e||typeof e!="object")return pe("sanitize-invalid-root","sanitizeStats.invalidRoot"),null;try{let t={today:Pt(e.today),last30Days:Pt(e.last30Days),month:Pt(e.month),lastMonth:Pt(e.lastMonth),lastUpdated:typeof e.lastUpdated=="string"?e.lastUpdated:"",backendConfigured:!!e.backendConfigured,locale:typeof e.locale=="string"?e.locale:void 0,currentWorkspacePaths:Array.isArray(e.currentWorkspacePaths)?e.currentWorkspacePaths.filter(s=>typeof s=="string"):void 0,suppressedUnknownTools:Array.isArray(e.suppressedUnknownTools)?e.suppressedUnknownTools.filter(s=>typeof s=="string"):void 0},o=mn(e.customizationMatrix);o&&(t.customizationMatrix=o),Array.isArray(e.missedPotential)&&(t.missedPotential=e.missedPotential.filter(s=>s&&typeof s=="object"&&typeof s.workspacePath=="string")),Bi(t,e),Array.isArray(e.insights)&&(t.insights=zs(e.insights)),zi(t,e);let n=Ii(e.curationAnalysis);return n?(t.curationAnalysis=n,Z("sanitizeStats.curation.present",{availableTools:n.availableTools.length,unusedTools:n.unusedTools.length,unusedServers:n.underusedMcpServers.filter(s=>s&&s.usedToolCount===0).length})):pe("sanitize-no-curation","sanitizeStats.curation.missing"),fn(t,e),t}catch(t){return pe("sanitize-error","sanitizeStats.error",{error:t instanceof Error?t.message:String(t)}),null}}function F(){let e=document.getElementById("worktree-controls");e&&k(e,qs())}function z(){let e=document.getElementById("worktree-results");e&&k(e,Gs())}function Ee(){let e=document.getElementById("worktree-progress-area");e&&k(e,Ws())}function Os(){$o||($o=!0,requestAnimationFrame(()=>{$o=!1,z()}))}function Ns(){let e=document.getElementById("worktree-root-input"),t=e?.value.trim();t&&(U.some(o=>o.toLowerCase()===t.toLowerCase())||U.push(t),e&&(e.value=""),F())}function Ni(){U.length===0||R||W||(R=!0,L=[],Ge=null,rt=null,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},re=[],F(),z(),f.postMessage({command:"scanWorktrees",rootPaths:U}))}function Hi(){if(W||fe||R)return;let e=Ks();e.length!==0&&(fe=!0,z(),f.postMessage({command:"cleanupPushedWorktrees",worktrees:e.map(t=>({path:t.path,branch:t.branch,repoLabel:t.repoLabel}))}))}function ji(e){return e.id==="btn-browse-worktree-root"?(f.postMessage({command:"pickWorktreeRoot"}),!0):e.id==="btn-add-worktree-root"?(Ns(),!0):e.id==="btn-scan-worktrees"?(Ni(),!0):e.id==="btn-cancel-worktree-scan"?(f.postMessage({command:"cancelWorktreeScan"}),!0):e.id==="btn-cleanup-pushed-worktrees"?(Hi(),!0):e.id==="btn-cancel-cleanup"?(f.postMessage({command:"cancelCleanupPushedWorktrees"}),!0):!1}function Fi(e){if(e.closest("#btn-toggle-worktree-roots"))return Ve=!Ve,F(),!0;if(e.classList.contains("worktree-remove-root")){let t=Number(e.getAttribute("data-index"));return isNaN(t)||(U.splice(t,1),F()),!0}return!1}function Wi(e,t){let o=t.closest(".worktree-reveal-link");if(o){e.preventDefault();let s=decodeURIComponent(o.getAttribute("data-path")||"");return s&&f.postMessage({command:"revealPath",path:s}),!0}let n=t.closest(".worktree-delete-link");if(n){e.preventDefault();let s=decodeURIComponent(n.getAttribute("data-path")||""),r=decodeURIComponent(n.getAttribute("data-branch")||""),i=decodeURIComponent(n.getAttribute("data-repo")||""),a=n.getAttribute("data-pushed")||"?";return s&&f.postMessage({command:"deleteWorktree",path:s,branch:r,repoLabel:i,pushed:a}),!0}return!1}function qi(e){let t=e.closest("[data-wt-sort]");if(!t)return!1;let o=t.getAttribute("data-wt-sort");return o&&(it===o?Ye=Ye==="desc"?"asc":"desc":(it=o,Ye=o==="repo"?"asc":"desc"),z()),!0}function Ki(e){let t=e.closest(".worktree-repo-row");if(!t)return!1;let o=t.getAttribute("data-repo")??"";return zt.has(o)?zt.delete(o):zt.add(o),z(),!0}function Gi(e){return qi(e)?!0:Ki(e)}function Vi(e){let t=e.target;t&&(ji(t)||Fi(t)||Wi(e,t)||Gi(t))}function Yi(){let e=document.getElementById("tab-panel-worktrees");e&&(e.addEventListener("click",Vi),e.addEventListener("keydown",t=>{t.target?.id==="worktree-root-input"&&t.key==="Enter"&&(t.preventDefault(),Ns())}))}function qo(e){let t=e??{},o=String(t.pushed??"?"),n=o==="yes"||o==="no"?o:"?";return{path:String(t.path??""),repoLabel:String(t.repoLabel??"Unknown"),branch:String(t.branch??"?"),lastCommit:String(t.lastCommit??"?"),lastCommitDate:t.lastCommitDate?String(t.lastCommitDate):null,pushed:n,files:A(t.files),folders:A(t.folders),bytes:A(t.bytes)}}function Ji(e){if(!e.folderPath)return;let t=String(e.folderPath);U.some(o=>o.toLowerCase()===t.toLowerCase())||U.push(t),F()}function Xi(e){if(R||!Array.isArray(e.roots))return;let t=!1;for(let o of e.roots){if(typeof o!="string")continue;let n=o.trim();n&&(U.some(s=>s.toLowerCase()===n.toLowerCase())||(U.push(n),t=!0))}t&&F()}function Zi(){R=!0,L=[],rt=null,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},F(),z()}function Qi(e){D={...D,root:String(e.root||""),checked:0,total:0,phase:"walking",dirsScanned:0},Ee()}function ea(e){D={...D,root:String(e.root??D.root),phase:"walking",dirsScanned:A(e.dirsScanned),elapsedMs:A(e.elapsedMs)},Ee()}function ta(e){D={...D,total:A(e.count),phase:"checking"},Ee()}function oa(e){rt=`Skipped "${e.root}": ${e.reason||"not accessible"}`,F()}function na(e){D={root:String(e.root??D.root),checked:A(e.checked),total:e.total!==void 0?A(e.total):D.total,foundCount:A(e.foundCount),elapsedMs:A(e.elapsedMs)},Ee()}function sa(e){e.worktree&&(L.push(qo(e.worktree)),Os())}function ra(e){let t=String(e.path??"");if(!t)return;let o=L.findIndex(n=>n.path===t);o!==-1&&(L.splice(o,1),z())}function ia(){fe=!1,z()}function aa(e){fe=!1,W=!0,Oo={processed:0,total:A(e.total)},re=[],z()}function la(e){Oo={processed:A(e.processed),total:A(e.total)};let t=e.status,o=t==="deleted"||t==="skipped"?t:"error";re.push({path:String(e.path??""),branch:String(e.branch??"?"),repoLabel:String(e.repoLabel??""),status:o,reason:typeof e.reason=="string"?e.reason:void 0}),z()}function da(){W=!1,z()}function ca(){W=!1,fe=!1,z()}function ua(e){D={...D,phase:"enriching",enriched:0,enrichTotal:A(e.total),elapsedMs:A(e.elapsedMs)},Ee()}function pa(e){D={...D,phase:"enriching",enriched:A(e.enriched),enrichTotal:A(e.total),elapsedMs:A(e.elapsedMs)},Ee()}function ga(e){let t=String(e.path??"");if(!t)return;let o=L.find(s=>s.path===t);if(!o)return;o.files=A(e.files),o.folders=A(e.folders),o.bytes=A(e.bytes);let n=String(e.pushed??"?");o.pushed=n==="yes"||n==="no"?n:"?",Os()}function ma(){R=!1,F(),z()}function fa(){R=!1,F()}function ba(e){if(R||W)return;L=(Array.isArray(e.worktrees)?e.worktrees:[]).map(qo),Ge={scannedAt:String(e.scannedAt??""),totalBytes:A(e.totalBytes)},F(),z()}var ya={worktreeRootPicked:Ji,worktreeRootsDiscovered:Xi,worktreeScanStarted:()=>Zi(),worktreeScanRootStarted:Qi,worktreeScanWalkProgress:ea,worktreeScanRootMarkersFound:ta,worktreeScanRootSkipped:oa,worktreeScanProgress:na,worktreeFound:sa,worktreeEnrichStarted:ua,worktreeEnrichProgress:pa,worktreeEnriched:ga,worktreeDeleted:ra,worktreeScanComplete:()=>ma(),worktreeScanCancelled:()=>fa(),worktreeBackgroundResults:ba,cleanupDeclined:()=>ia(),cleanupStarted:aa,cleanupWorktreeResult:la,cleanupComplete:()=>da(),cleanupCancelled:()=>ca()};function ha(e){let t=ya[e.command];t&&t(e)}function va(){let e=document.querySelectorAll(".tab-button");e.forEach(t=>{t.addEventListener("click",()=>{let o=t.getAttribute("data-tab");if(!o)return;$=o,e.forEach(s=>s.classList.toggle("active",s.getAttribute("data-tab")===o)),document.querySelectorAll(".tab-panel").forEach(s=>{s.style.display="none"});let n=document.getElementById(`tab-panel-${o}`);n&&(n.style.display="block"),o==="repos"&&!Do&&(Do=!0,f.postMessage({command:"loadRepoPrStats"})),o==="agent"&&!Lo&&(Lo=!0,f.postMessage({command:"loadAgentSessions"})),o==="insights"&&Bo.filter(s=>s.status==="new").forEach(s=>f.postMessage({command:"insightAction",id:s.id,action:"seen"}))})})}function xa(e){let t=e&&typeof e=="object"?e:{},o=Array.isArray(t.repos)?t.repos:[];return{authenticated:!!t.authenticated,since:typeof t.since=="string"||typeof t.since=="number"?t.since:Date.now(),error:typeof t.error=="string"?d(t.error):void 0,repos:o.map(n=>{let s=n&&typeof n=="object"?n:{},r=Array.isArray(s.aiDetails)?s.aiDetails:[];return{repoUrl:vt(s.repoUrl),owner:d(typeof s.owner=="string"?s.owner:""),repo:d(typeof s.repo=="string"?s.repo:""),error:typeof s.error=="string"?d(s.error):"",totalPrs:_(s.totalPrs),aiAuthoredPrs:_(s.aiAuthoredPrs),aiReviewRequestedPrs:_(s.aiReviewRequestedPrs),userAuthoredPrs:_(s.userAuthoredPrs),userMergedPrs:_(s.userMergedPrs),aiDetails:r.map(i=>{let a=i&&typeof i=="object"?i:{},l=["copilot","claude","openai","other-ai"],u=["author","reviewer-requested"],c=l.includes(a.aiType)?a.aiType:"other-ai",p=u.includes(a.role)?a.role:"author";return{number:_(a.number),title:d(typeof a.title=="string"?a.title:""),url:vt(a.url),aiType:c,role:p}})}})}}var ka={copilot:"\u{1F916} Copilot",claude:"\u{1F9E0} Claude",openai:"\u2728 Codex","other-ai":"\u{1F916} AI"};function wa(e,t,o){let n=`<a href="${d(e.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${d(e.owner)}/${d(e.repo)}</a>`;if(e.error)return`<tr>
			<td style="${t} font-family:'Courier New',monospace; font-size:12px;">${n}</td>
			<td colspan="4" style="${t} color:var(--text-secondary); font-style:italic; font-size:12px;">${d(e.error)}</td>
		</tr>`;let s="";if(e.aiDetails.length>0){let i=e.aiDetails.map(a=>`<li><a href="${d(a.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${a.number} ${d(a.title)}</a> \u2014 ${ka[a.aiType]??d(String(a.aiType))} (${a.role==="author"?"authored":"review requested"})</li>`).join("");s=`
			<details style="margin-top:4px; font-size:11px;">
				<summary style="cursor:pointer; color:var(--text-secondary);">Show ${e.aiDetails.length} detail(s)</summary>
				<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${i}</ul>
			</details>`}let r=(e.userAuthoredPrs??0)>0?`<span style="font-weight:600;">${e.userMergedPrs??0} / ${e.userAuthoredPrs}</span>`:"0";return`<tr>
		<td style="${t} font-family:'Courier New',monospace; font-size:12px;">${n}${s}</td>
		<td style="${o} font-weight:600;">${e.totalPrs}</td>
		<td style="${o}">${r}</td>
		<td style="${o}">${e.aiAuthoredPrs>0?`<span style="font-weight:600;">${e.aiAuthoredPrs}</span>`:"0"}</td>
		<td style="${o}">${e.aiReviewRequestedPrs>0?`<span style="font-weight:600;">${e.aiReviewRequestedPrs}</span>`:"0"}</td>
	</tr>`}function Ca(e){let t=d(new Date(e.since).toLocaleDateString());if(e.error)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u26A0\uFE0F Failed to load repository PR activity</strong><br/>
				${e.error}<br/>
				Switch to another tab and back to retry \u2014 details are in the extension Output channel.
			</div>`;if(!e.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;if(e.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,s=e.repos.map(r=>wa(r,o,n)).join("");return`
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing PRs created since ${t}.
			Reviewer requests are only visible for <strong>open</strong> PRs \u2014 the GitHub API clears this field after a PR is merged or closed.
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">\u{1F4C2} Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">PRs</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs you opened yourself, shown as merged / opened. Work driven by a local AI assistant lands here, not under Cloud Agent Authored.">\u{1F6A2} Yours (merged / opened)</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs where the PR author's GitHub login matches a known AI agent (e.g. copilot-swe-agent, claude-code-action, openai-code-agent)">\u{1F916} Cloud Agent Authored</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Open PRs where an AI agent was listed as a requested reviewer">\u{1F441} Copilot Review Agent requested\u2020</th>
					</tr>
				</thead>
				<tbody>
					${s}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2020 Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			\u{1F916} Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`}function Hs(e){let t=document.querySelector("#repos-pr-content");t&&k(t,`
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${Ca(e)}
	`)}function Sa(e){let t="font-family:'Courier New',monospace; font-size:12px;";if(e.unassigned)return`<span style="${t} color:var(--text-secondary);" title="Tasks the agents API reported without a repository \u2014 typically ad-hoc sessions started from cloud chat">no repository (cloud chat)</span>`;let o=`<a href="${e.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); ${t}">${e.owner}/${e.repo}</a>`,n=e.discovery==="account"?' <span title="Found through your account-wide agent tasks \u2014 this repo is not open in any workspace folder" style="color:var(--text-muted); font-size:10px;">(not in workspace)</span>':"";return`${o}${n}`}function Ta(e,t,o){return e.repos.map(n=>{let s=Sa(n);if(n.error)return`<tr>
        <td style="${t}">${s}</td>
        <td colspan="3" style="${t} color:var(--text-secondary); font-style:italic; font-size:12px;">${n.error}</td>
      </tr>`;let r=n.partial?` <span title="Showing ${n.tasksScanned} of ${n.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${n.tasksScanned}/${n.tasksTotal} tasks scanned)</span>`:"",i=n.totalCredits>0?n.totalCredits.toFixed(1):n.totalPremiumRequests>0?`${n.totalPremiumRequests.toFixed(1)} PR`:"\u2014";return`<tr>
      <td style="${t}">${s}${r}</td>
      <td style="${o} font-weight:600;">${n.totalTasks}</td>
      <td style="${o} font-weight:600;">${n.totalSessions}</td>
      <td style="${o}">${i}</td>
    </tr>`}).join("")}function Cs(e){let t="margin-bottom:12px; padding:8px 10px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:11px; color:var(--text-secondary);";if(!e.fetchedAt)return`<div style="${t}">\u{1F552} <strong>Not fetched yet.</strong> The snapshot is refreshed hourly by the main VS Code window \u2014 it will appear here once that first refresh completes.</div>`;let o=Date.parse(e.fetchedAt),n=Number.isFinite(o)?new Date(o+e.refreshIntervalMs).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"unknown";return`<div style="${t}">
    \u{1F552} Updated <strong>${d(rn(e.fetchedAt))}</strong> \xB7 next refresh after ${d(n)}.
    Cached and refreshed at most once an hour, by a single VS Code window, to keep GitHub API usage low.
  </div>`}function $a(e){if(!e.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;if(e.repos.length===0)return`${Cs(e)}
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No cloud agent tasks found \u2014 neither in your workspace repositories nor anywhere else in your account.
			</div>`;let t=new Date(e.since).toLocaleDateString(),o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,s=e.repos.reduce((l,u)=>(u.error||(l.tasks+=u.totalTasks,l.sessions+=u.totalSessions,l.credits+=u.totalCredits,l.premiumRequests+=u.totalPremiumRequests),l),{tasks:0,sessions:0,credits:0,premiumRequests:0}),r=e.repos.some(l=>l.partial&&!l.error),i=Ta(e,o,n),a="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;";return`
		${Cs(e)}
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.credits>0?s.credits.toFixed(1):"\u2014"}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
			${s.premiumRequests>0?`
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.premiumRequests.toFixed(1)}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;" title="Sessions that ran before the June 2026 switch to AI credits are billed in premium requests">Premium Requests</div>
			</div>`:""}
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${t} to now.
			${r?"<strong>Note:</strong> Some repos were capped \u2014 totals are lower bounds. ":""}
			${e.accountTasksAvailable?"":`<strong>Account-wide tasks unavailable:</strong> ${e.accountTasksError??"the /agents/tasks endpoint could not be read"} \u2014 only workspace repositories are shown.`}
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
				<tbody>${i}</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2139\uFE0F <strong>No double-counting:</strong> These are cloud agent sessions only. CLI/remote sessions and local IDE chat sessions (shown in "My Activity") are excluded.<br/>
			\u2139\uFE0F <strong>Two sources:</strong> your workspace repositories (which also surface tasks other people started there) plus your account-wide agent tasks, which cover repos you don't have open and ad-hoc cloud chat sessions. Tasks seen in both are counted once.<br/>
			\u2139\uFE0F <strong>Action minutes</strong> (GitHub Actions compute used by the agent) are not shown here \u2014 they require additional per-branch API calls.
		</div>`}function js(e){let t=document.querySelector("#agent-sessions-content");t&&k(t,`
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${$a(e)}
	`)}function Aa(e){if(!e||!e.workspaces||e.workspaces.length===0)return`
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;let t=e.workspaces.map(o=>{let n=o.typeStatuses??{},s=Object.values(n).every(i=>i==="\u274C"),r=(e.customizationTypes??[]).map(i=>{let a=n[i.id]||"\u2753";return`
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${j(a,a==="\u2705"?"Present and fresh":a==="\u26A0\uFE0F"?"Present but stale":a==="\u274C"?"Missing":"Status unknown")}
				</td>`}).join("");return`
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${d(o.workspaceName)}${s?` <span style="font-family: sans-serif; vertical-align: middle;">${j("\u26A0\uFE0F","No customization files")}</span>`:""}
				</td>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center; color: var(--link-color); font-weight: 600;">
					${o.sessionCount}
				</td>
				${r}
			</tr>`}).join("");return`
		<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				\u{1F6E0}\uFE0F Copilot Customization Files
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				Showing ${e.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${e.workspacesWithIssues>0?`<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${j("\u26A0\uFE0F")} ${e.workspacesWithIssues} workspace(s) have no customization files.</span>`:`<span style="display:inline-flex;align-items:center;gap:4px;">${j("\u2705")} All workspaces have up-to-date customizations.</span>`}
			</div>
			<div class="customization-matrix-container">
				<table class="customization-matrix">
					<thead>
						<tr>
							<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">\u{1F4C2} Workspace</th>
							<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Sessions</th>
							${(e.customizationTypes??[]).map(o=>`
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${d(o.label)}">
									${d(o.icon)}
								</th>
							`).join("")}
						</tr>
					</thead>
					<tbody>
						${t}
					</tbody>
				</table>
			</div>
			<div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
				<div style="display: flex; gap: 16px; flex-wrap: wrap;">
					${(e.customizationTypes??[]).map(o=>`
						<span>${d(o.icon)} ${d(o.label)}</span>
					`).join("")}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${j("\u2705")} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${j("\u26A0\uFE0F")} = Present but Stale</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${j("\u274C")} = Missing</span>
				</div>
			</div>
		</div>`}function Ma(e){let t=e.last30Days.modelSwitching,o=e.today.modelSwitching;if((t.totalRequests??0)===0&&(o.totalRequests??0)===0)return"";function n(s){let r=s.totalRequests??0;if(r===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let a=[{label:"\u{1F49A} Low cost",count:s.lowCostRequests??0,color:"#4ade80"},{label:"\u{1F535} Medium cost",count:s.mediumCostRequests??0,color:"var(--link-color)"},{label:"\u{1F4B8} High cost",count:s.highCostRequests??0,color:"var(--warning-fg)"},{label:"\u2753 Unknown",count:s.unknownRequests??0,color:"var(--text-muted)"}].filter(u=>u.count>0).map(u=>{let c=r>0?Math.round(u.count/r*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${u.color};">${u.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${c}%; background: ${u.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${g(u.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${c}%)</span></span>
			</div>`}).join(""),l=(s.mixedCostSessions??0)>0?`<div style="font-size: 11px; color: var(--link-color); margin-top: 6px;">\u{1F500} ${g(s.mixedCostSessions)} mixed-cost session${s.mixedCostSessions!==1?"s":""}</div>`:"";return`${a}<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${g(r)} total requests</div>${l}`}return`
		<!-- Model Cost Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4B0}</span><span>Model Cost Usage</span></div>
			<div class="section-subtitle">Request distribution across cost levels \u2014 low (&lt;$2/M tokens), medium ($2\u20135/M), high (\u2265$5/M)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${n(o)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${n(t)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${n(e.month.modelSwitching)}
				</div>
			</div>
		</div>`}function Ea(e){return e.last30Days.thinkingEffortUsage||e.today.thinkingEffortUsage||e.month.thinkingEffortUsage?`
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Eo(e.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Eo(e.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Eo(e.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`:""}function Eo(e){let t=["minimal","low","medium","high","max","xhigh"];if(!e||e.sessionCount===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.values(e.byEffort).reduce((s,r)=>s+r,0);return`
		${t.filter(s=>e.byEffort[s]>0).concat(Object.keys(e.byEffort).filter(s=>!t.includes(s)&&e.byEffort[s]>0)).map(s=>{let r=e.byEffort[s]||0,i=o>0?Math.round(r/o*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${d(di(s))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${i}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${r} <span style="color: var(--text-secondary); font-weight: 400;">(${i}%)</span></span>
			</div>`}).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${e.sessionCount} session${e.sessionCount!==1?"s":""} \xB7 ${e.switchCount} effort switch${e.switchCount!==1?"es":""}</div>
	`}function Ra(e){return{allToolKeys:[...new Set([...Object.keys(e.today.toolCalls.byTool),...Object.keys(e.last30Days.toolCalls.byTool),...Object.keys(e.month.toolCalls.byTool)])].sort(),allMcpToolKeys:[...new Set([...Object.keys(e.today.mcpTools.byTool),...Object.keys(e.last30Days.mcpTools.byTool),...Object.keys(e.month.mcpTools.byTool)])].sort(),allMcpServerKeys:[...new Set([...Object.keys(e.today.mcpTools.byServer),...Object.keys(e.last30Days.mcpTools.byServer),...Object.keys(e.month.mcpTools.byServer)])].sort(),allStandardModels:[...new Set([...e.today.modelSwitching.standardModels,...e.last30Days.modelSwitching.standardModels,...e.month.modelSwitching.standardModels])].sort(),allHighCostModels:[...new Set([...e.today.modelSwitching.highCostModels,...e.last30Days.modelSwitching.highCostModels,...e.month.modelSwitching.highCostModels])].sort(),allLowCostModels:[...new Set([...e.today.modelSwitching.lowCostModels,...e.last30Days.modelSwitching.lowCostModels,...e.month.modelSwitching.lowCostModels])].sort(),allMediumCostModels:[...new Set([...e.today.modelSwitching.mediumCostModels,...e.last30Days.modelSwitching.mediumCostModels,...e.month.modelSwitching.mediumCostModels])].sort(),allUnknownModels:[...new Set([...e.today.modelSwitching.unknownModels,...e.last30Days.modelSwitching.unknownModels,...e.month.modelSwitching.unknownModels])].sort()}}function _a(e,t){return`
		<div id="tab-panel-health" class="tab-panel"${$!=="health"?' style="display:none"':""}>
			${e}
			${vi(t)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					\u{1F3D7}\uFE0F Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${H&&H.workspaces&&H.workspaces.length>0?`
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;" ${me?'disabled="true" appearance="secondary"':""}>${me?"Analyzing All...":`Analyze All Repositories (${H.workspaces.length})`}</vscode-button>
					</div>
					<div id="repo-list-pane-container" class="repo-hygiene-pane">
						<div class="repo-hygiene-pane-header">\u{1F4C1} Repository List</div>
						<div id="repo-list-pane" class="repo-hygiene-pane-body"></div>
					</div>
					<div id="repo-details-pane-container" class="repo-hygiene-pane repo-hygiene-pane-collapsed">
						<div class="repo-hygiene-pane-header">\u{1F4CA} Repository Details</div>
						<div id="repo-details-pane" class="repo-hygiene-pane-body"></div>
					</div>
				`:`
					<vscode-button id="btn-analyse-repo" ${st?'disabled="true" appearance="secondary"':""}>${st?"Analyzing...":"Analyze Repo for Best Practices"}</vscode-button>
					<div id="repo-analysis-results" class="repo-hygiene-results" style="margin-top: 12px;"></div>
				`}
			</div>
		</div>`}function Pa(e,t,o){return`
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${zl(e)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.today.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Y(J(e.today.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.last30Days.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Y(J(e.last30Days.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.month.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Y(J(e.month.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Y(J(e.today.mcpTools.byTool,t),10,Ao)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Y(J(e.last30Days.mcpTools.byTool,t),10,Ao)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Y(J(e.month.mcpTools.byTool,t),10,Ao)}</div></div>
						</div>
					`:""}
				</div>
			</div>
		</div>`}function Da(e,t,o){let n=e.length-t.length,s=t.length>0?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",r=t.length>0?"rgba(251,191,36,0.4)":"rgba(74,222,128,0.4)",i=t.length>0?"#fbbf24":"#4ade80",a=o.totalTokens,l=o.byServer.skill??0,u=o.byServer.builtin??0,c=a-l-u,p=S=>S>=1e3?`~${Math.round(S/1e3)}K`:`~${S}`,b=c+l,h=[];return c>0&&h.push(`${p(c)} MCP`),l>0&&h.push(`${p(l)} skills`),`<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${g(e.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${g(n)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${s}; border:1px solid ${r}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:${i};">${g(t.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Unused</div>
		</div>
		${b>0?`<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center;" title="Overhead you can reduce by disabling unused MCP servers or removing unused skills">
			<div style="font-size:20px; font-weight:700; color:#f87171;">${p(b)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Actionable overhead</div>
			${h.length>0?`<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${d(h.join(" + "))}</div>`:""}
		</div>`:""}
		${u>0?`<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center; opacity:0.7;" title="Overhead from VS Code built-in tools \u2014 cannot be disabled">
			<div style="font-size:20px; font-weight:700; color:var(--text-secondary);">${p(u)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Built-in overhead</div>
			<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">not actionable</div>
		</div>`:""}
	</div>`}function La(e){if(e.extensionId)return"Extension";if(!e.configFiles||e.configFiles.length===0)return"Settings";let t=new Set;for(let o of e.configFiles){let n=o.replace(/\\/g,"/");n.includes("/.vscode/")?t.add("Workspace"):n.includes("/.vs/")?t.add("Workspace (VS)"):n.includes("/.cursor/")?t.add("Workspace (Cursor)"):n.endsWith("/.mcp.json")?t.add(n.split("/").slice(-2).join("/")):t.add("Config file")}return[...t].join(", ")}function Ua(e,t){return e.configFiles&&e.configFiles.length===1?` <button class="curation-file-btn" data-command="openFile" data-path="${d(e.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${d(e.configFiles[0])}">open</button>`:e.configFiles&&e.configFiles.length>1?` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${d(JSON.stringify(e.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${d(t)}">open</button>`:e.extensionId?` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${d(e.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${d(e.extensionId)}">open</button>`:' <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>'}function Ia(e){return e.extensionId?`<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${d(e.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${d(e.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`:!e.configFiles||e.configFiles.length===0?'<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>':e.configFiles.length===1?`<button class="curation-file-btn" data-command="openFile" data-path="${d(e.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${d(e.configFiles[0])}">Change Tools</button>`:`<button class="curation-file-btn" data-command="openFileFromList" data-paths="${d(JSON.stringify(e.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${e.configFiles.length} config files">Change Tools</button>`}function za(e,t){let o=t.byServer[e.server]??0,n=La(e),s=e.configFiles?.join(`
`)??e.extensionId??"",r=Ua(e,s),i=Ia(e),a=e.availableToolCount===0;return`<tr class="${e.usedToolCount>0?"mcp-has-usage":""}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${d(e.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${d(s)}">${d(n)}${r}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?'<em style="color:var(--text-secondary)">not connected</em>':e.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?"\u2014":e.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${o>0?`~${o.toLocaleString()} tokens`:"\u2014"}</td>
		<td style="padding:5px 8px; font-size:12px;">${i}</td>
	</tr>`}function Ba(e){let t=[...new Set(e.filter(s=>!s.extensionId).flatMap(s=>s.configFiles??[]))],o=t.find(s=>s.replace(/\\/g,"/").endsWith(".vscode/mcp.json"))??t[0];if(!o)return"<code>.vscode/mcp.json</code>";let n=o.replace(/\\/g,"/").split("/").slice(-3).join("/");return`<button class="curation-file-btn" data-command="openFile" data-path="${d(o)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${d(o)}">${d(n)}</button>`}function Oa(e,t,o){let n=[...e].sort((l,u)=>{let c=l.usedToolCount===0?0:l.usedToolCount<l.availableToolCount?1:2,p=u.usedToolCount===0?0:u.usedToolCount<u.availableToolCount?1:2;return c!==p?c-p:l.usedToolCount-u.usedToolCount});if(n.length===0)return"";let s=n.map(l=>za(l,t)).join(""),r=Ba(n),i=n.filter(l=>l.usedToolCount>0).length,a=n.length-i;return`<details style="margin-top:12px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F50C} MCP Servers in Last ${o} Days (${n.length})
		</summary>
		<style>#mcp-hide-toggle:checked ~ .mcp-table-wrap .mcp-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="mcp-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="mcp-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide servers with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${a} with no usage \xB7 ${i} with usage</span>
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
				<tbody>${s}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Open ${r} to disable file-configured servers, or use <em>Manage Extension</em> to disable or uninstall an MCP-providing extension. (VS Code does not expose per-server picker state to extensions, so servers you disabled in the chat tool picker may still appear here.)</div>
		</div>
	</details>`}function Na(e){if(e.length===0)return"";let t=e.map(o=>{let n=o.configFiles?.[0],s=n?`<button class="curation-file-btn" data-command="openFile" data-path="${d(n)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${d(n)}">View skill</button>`:"\u2014",r="\u2014",i="";o.pluginName?(r=`Plugin: ${o.pluginName}`,i=` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${d(o.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`):o.skillPath&&(o.skillPath.startsWith(".github/skills")?r="Workspace (.github)":o.skillPath.startsWith(".claude/skills")?r="Workspace (.claude)":o.skillPath.startsWith(".agents/skills")?r="Workspace (.agents)":r="User (~)");let a=Math.round((o.name.length+o.description.length+10)/4);return`<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${d(o.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${d(r)}${i}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${d(o.description)}">${d(o.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${a.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${s}</td>
	</tr>`}).join("");return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F4DA} Unused Skills (${e.length})
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
				<tbody>${t}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Est. overhead is per agent interaction. For plugin skills, click <em>manage</em> to open the agent plugins view where you can uninstall the plugin. For workspace skills, update the description or remove the SKILL.md.</div>
		</div>
	</details>`}function Ha(e,t){if(e.length===0)return"";let o=e.map(r=>{let i=`<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${d(r.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${d(r.pluginName)}">Manage Plugin</button>`;return`<tr class="${r.usedSkillCount===0?"":"plugin-has-usage"}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${d(r.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${r.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${r.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${i}</td>
		</tr>`}).join(""),n=e.filter(r=>r.usedSkillCount===0).length,s=e.length-n;return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F9E9} Agent Plugins in Last ${t} Days (${e.length})
		</summary>
		<style>#plugin-hide-toggle:checked ~ .plugin-table-wrap .plugin-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="plugin-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="plugin-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide plugins with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${n} with no usage \xB7 ${s} with usage</span>
		</div>
		<div class="plugin-table-wrap" style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Plugin</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Available</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Used</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Action</th>
				</tr></thead>
				<tbody>${o}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Click <em>Manage Plugin</em> to open the Extensions view filtered to <code>@agentPlugins</code> where you can uninstall unused plugins to reclaim prompt budget.</div>
		</div>
	</details>`}function ja(e,t){if(e.length===0)return"";let o=t.byServer.builtin??0,n=e.map(r=>{let i=Math.round((r.name.length+(r.description?.length??0)+10)/4);return`<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${d(r.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${d(r.description??"")}">${d(r.description??"\u2014")}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${i} tokens</td>
		</tr>`}).join(""),s=r=>r>=1e3?`~${Math.round(r/1e3)}K`:`~${r}`;return`<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F527} Built-in VS Code Tools (${e.length}) \u2014 ${s(o)} tokens overhead, not actionable
		</summary>
		<div style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tool</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Description</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
				</tr></thead>
				<tbody>${n}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} These tools are provided by VS Code itself and cannot be disabled. They are excluded from the actionable overhead total above.</div>
		</div>
	</details>`}function Fa(e){try{if(!e||e.availableTools.length===0)return pe("render-hidden-empty","buildCurationSectionHtml.hidden",{hasCurationObject:!!e,availableTools:e?.availableTools?.length??0}),"";let{availableTools:t,unusedTools:o,underusedMcpServers:n,underusedAgentPlugins:s,estimatedPromptBloat:r,windowDays:i}=e,a=o.filter(u=>u.source==="skill"),l=t.filter(u=>u.source==="builtin");return Z("buildCurationSectionHtml.render",{availableTools:t.length,unusedTools:o.length,unusedSkills:a.length,mcpServers:n.length}),`
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${i} days)</div>
				${Da(t,o,r)}
				${Oa(n,r,i)}
				${Ha(s,i)}
				${ja(l,r)}
				${Na(a)}
			</div>`}catch(t){return Z("buildCurationSectionHtml.error",{error:t instanceof Error?t.message:String(t)}),`
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`}}function Wa(){return`
		<div id="tab-panel-repos" class="tab-panel"${$!=="repos"?' style="display:none"':""}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories \u2014 authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${$!=="agent"?' style="display:none"':""}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>`}function Nt(e){let t={tip:"rgba(96,165,250,0.12)",opportunity:"rgba(251,191,36,0.12)",celebration:"rgba(74,222,128,0.12)"},o={tip:"rgba(96,165,250,0.5)",opportunity:"rgba(251,191,36,0.5)",celebration:"rgba(74,222,128,0.5)"},n={tip:"rgba(96,165,250,0.85)",opportunity:"rgba(251,191,36,0.85)",celebration:"rgba(74,222,128,0.85)"},s=t[e.severity]??t.tip,r=o[e.severity]??o.tip,i=n[e.severity]??n.tip,a=e.status==="new",l=e.status==="done",u=e.actionLabel?`<button class="insight-action-btn" data-insight-id="${d(e.id)}" data-action="execute" data-command="${d(e.actionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${s}; color:var(--text-primary);">${d(e.actionLabel)}</button>`:"",c=l?'<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>':`<button class="insight-action-btn" data-insight-id="${d(e.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${i}; color:#0d1117;">\u2713 Done</button>`,p=l?"":`<button class="insight-action-btn" data-insight-id="${d(e.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>`,b=l?"":`<button class="insight-action-btn" data-insight-id="${d(e.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>`;return`
		<div class="insight-card" data-insight-id="${d(e.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${s}; border:1px solid ${r};
			${a?"box-shadow:0 2px 8px "+s+";":""}
			${l?"opacity:0.45;":""}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${a?`<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${i}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>`:""}
						${d(e.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${d(e.body)}</div>
					${u?`<div style="margin-top:12px;">${u}</div>`:""}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${b}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${r}; padding-top:10px;">
				${c}
				${p}
			</div>
		</div>`}function qa(e){let t=e.filter(i=>i.status!=="dismissed"),o=t.filter(i=>i.status==="new"),n=t.filter(i=>i.status!=="new"&&i.status!=="done"),s=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(Nt).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(Nt).join("")}
		</div>`:"";return`
		<div id="tab-panel-insights" class="tab-panel"${$!=="insights"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F4A1}</span><span>Insights</span></div>
				<div class="section-subtitle">
					Personalized tips based on your usage patterns. Tips are data-driven \u2014 they only appear when relevant to how you code with AI.
				</div>
				<div id="insights-container" style="margin-top:16px;">
					${s}
					${r}
				</div>
			</div>
		</div>`}function Ka(e){return!e||e.sessionsWithMoments===0?"":` <span style="background:rgba(251,191,36,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${e.sessionsWithMoments}</span>`}function Ga(e){return`<button class="tab-button ${$==="corrections"?"active":""}" data-tab="corrections"><span class="codicon codicon-debug-restart"></span> Corrections${Ka(e)}</button>`}function Va(e){let t=e.title||e.file.split(/[\\/]/).pop()||e.file,o=e.lastInteraction?new Date(e.lastInteraction):null,n=o&&!isNaN(o.getTime())?o.toLocaleDateString():"",s=e.repository?` \xB7 ${e.repository}`:"";return`<div style="font-size:11px; color:var(--text-secondary); padding:2px 0; overflow-wrap:anywhere;">${d(t)}${d(n?` \xB7 ${n}`:"")}${d(s)}</div>`}function Ya(e){let t=e.sharedKeywords.length>0?`<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">${e.sharedKeywords.map(o=>`<span style="font-size:10px; padding:1px 7px; border-radius:8px; background:var(--bg-tertiary); color:var(--text-secondary);">${d(o)}</span>`).join("")}</div>`:"";return`
		<div style="margin-top:10px; padding:12px 14px; border-radius:8px; background:var(--bg-tertiary); border:1px solid var(--border-color, transparent);">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<span style="flex-shrink:0; font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.5); color:var(--text-primary); white-space:nowrap;">${e.sessionCount}\xD7 repeated</span>
				<div style="flex:1; min-width:0; font-size:12px; color:var(--text-primary); font-style:italic; overflow-wrap:anywhere;">&ldquo;${d(e.representativePrompt)}&rdquo;</div>
			</div>
			${t}
			<details style="margin-top:8px;">
				<summary style="font-size:11px; color:var(--text-secondary); cursor:pointer;">Sessions (${e.sessions.length})</summary>
				<div style="margin-top:4px;">${e.sessions.map(Va).join("")}</div>
			</details>
		</div>`}function Ja(e){return!e||e.clusters.length===0?"":`
		<div class="section">
			<div class="section-title"><span>\u{1F9E9}</span><span>Skill Suggestions</span></div>
			<div class="section-subtitle">
				Tasks you keep prompting for across sessions (first prompt per session, ${e.sessionsScanned} sessions scanned).
				A repeated task is a good candidate for a reusable skill, prompt file, or custom agent.
			</div>
			${e.clusters.map(Ya).join("")}
		</div>`}var Xa={"user-correction":{label:"You corrected the agent",color:"rgba(251,191,36,0.85)"},"tool-error":{label:"Tool failed",color:"rgba(248,113,113,0.85)"},"edit-retry":{label:"Edit retry",color:"rgba(251,146,60,0.85)"},"edit-self-correction":{label:"Edit self-correction",color:"rgba(251,146,60,0.85)"},"agent-self-correction":{label:"Agent caught itself",color:"rgba(96,165,250,0.85)"}};function Za(e){let t=Xa[e.type]??{label:e.type,color:"rgba(148,163,184,0.85)"},o=e.timestamp?new Date(e.timestamp):null,n=o&&!isNaN(o.getTime())?o.toLocaleString():"",s=e.type==="tool-error"?`tool \`${e.tool??"?"}\`${e.retried?" \u2014 retried shortly after":""}`:e.matchedPattern?`matched ${e.matchedPattern}`:"";return`
		<div style="display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--bg-tertiary);">
			<span style="flex-shrink:0; font-size:10px; font-weight:700; letter-spacing:0.03em; padding:2px 8px; border-radius:10px; border:1px solid ${t.color}; color:var(--text-primary); background:${t.color.replace("0.85","0.12")}; white-space:nowrap;">${d(t.label)}</span>
			<div style="flex:1; min-width:0;">
				<div style="font-size:12px; color:var(--text-primary); opacity:0.9; overflow-wrap:anywhere;">${d(e.snippet)}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">
					turn ${e.turnNumber}${s?` \xB7 ${d(s)}`:""}${n?` \xB7 ${d(n)}`:""}
				</div>
			</div>
		</div>`}function Qa(e){let t=e.title||e.file.split(/[\\/]/).pop()||e.file,o=e.lastInteraction?new Date(e.lastInteraction):null,n=o&&!isNaN(o.getTime())?o.toLocaleDateString():"",s=e.totalMoments??e.moments.length,r=s>e.moments.length?` \xB7 showing ${e.moments.length} of ${s} moments`:"";return`
		<div style="margin:10px 0 4px; padding:10px 12px; background:var(--bg-tertiary); border-radius:6px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-primary); overflow-wrap:anywhere;">
				${d(t)}${n||r?` <span style="font-weight:400; color:var(--text-secondary);">${n?`\xB7 ${d(n)}`:""}${d(r)}</span>`:""}
			</div>
			${e.moments.map(Za).join("")}
		</div>`}function el(e){if(!e||e.repos.length===0)return`
		<div id="tab-panel-corrections" class="tab-panel"${$!=="corrections"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F501}</span><span>Corrections</span></div>
				<div class="section-subtitle">Moments where the agent corrected itself after an error, or you had to correct the agent.</div>
				<div style="margin-top:16px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
					\u2728 No correction moments detected in your recent sessions \u2014 nice and smooth!
				</div>
			</div>
		</div>`;let t=e.counts,o=(r,i)=>r>0?`<span style="font-size:11px; padding:2px 10px; border-radius:10px; background:var(--bg-tertiary); color:var(--text-primary);">${r} ${d(i)}</span>`:"",n=[o(t.userCorrections,"user corrections"),o(t.toolErrors,"tool errors"),o(t.editRetries,"edit retries"),o(t.editSelfCorrections,"edit self-corrections"),o(t.agentSelfCorrections,"agent self-corrections")].filter(Boolean).join(" "),s=e.repos.map(r=>`
		<div style="margin-top:18px;">
			<div style="font-size:12px; font-weight:700; color:var(--text-primary); margin-bottom:4px;">
				${d(r.repository)}
				<span style="font-weight:400; color:var(--text-secondary);">\u2014 ${r.sessionsWithMoments} session${r.sessionsWithMoments!==1?"s":""} with moments</span>
			</div>
			${r.sessions.map(Qa).join("")}
		</div>`).join("");return`
		<div id="tab-panel-corrections" class="tab-panel"${$!=="corrections"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F501}</span><span>Corrections</span></div>
				<div class="section-subtitle">
					Moments where the agent corrected itself after an error, or you had to correct the agent \u2014
					heuristic detection over each repository's ${e.sessionsPerRepo} most recent sessions with detected moments \u2014
					sessions without corrections are not listed. Summary counts include all detected moments; long sessions show a capped detail sample.
					Pattern-based matches are candidates, not verdicts; open the session in the log viewer for full context.
				</div>
				<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:12px;">${n}</div>
				${s}
			</div>
		</div>`}function tl(e){let t=document.querySelector('.tab-button[data-tab="insights"]');if(!t)return;let o=e.filter(r=>r.status==="new").length,n=o>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${o}</span>`:"";k(t,'<span class="codicon codicon-lightbulb"></span> Insights'+n)}function ol(e){let t=document.getElementById("insights-container");if(!t)return;Bo=e;let o=e.filter(i=>i.status==="new"),n=e.filter(i=>i.status!=="new"&&i.status!=="dismissed"&&i.status!=="done"),s=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(Nt).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(Nt).join("")}
		</div>`:"";k(t,s+r),Fs(),tl(e)}function nl(e){if(e)try{let t=JSON.parse(e);f.postMessage({command:"openFileFromList",paths:t})}catch(t){Z("wireCurationButtons.badPathsJson",{error:t instanceof Error?t.message:String(t)})}}function sl(e){let t=e.getAttribute("data-command");if(t)if(t==="openFile"){let o=e.getAttribute("data-path");o&&f.postMessage({command:"openFile",path:o})}else if(t==="openFileFromList")nl(e.getAttribute("data-paths"));else if(t==="manageExtension"){let o=e.getAttribute("data-extension-id");o&&f.postMessage({command:"manageExtension",extensionId:o})}else if(t==="openAgentPlugins"){let o=e.getAttribute("data-plugin-name")??"";f.postMessage({command:"openAgentPlugins",pluginName:o})}else f.postMessage({command:t})}function rl(){try{let e=document.getElementById("section-tool-curation");if(!e){pe("wire-no-section","wireCurationButtons.noSection");return}let t=e.querySelectorAll(".curation-file-btn");Z("wireCurationButtons.bind",{buttons:t.length}),t.forEach(o=>{o.addEventListener("click",()=>{try{sl(o)}catch(n){Z("wireCurationButtons.clickError",{error:n instanceof Error?n.message:String(n)})}})})}catch(e){Z("wireCurationButtons.error",{error:e instanceof Error?e.message:String(e)})}}function Fs(){let e=document.getElementById("insights-container");e&&e.querySelectorAll(".insight-action-btn").forEach(t=>{t.addEventListener("click",()=>{let o=t.getAttribute("data-insight-id"),n=t.getAttribute("data-action");if(!(!o||!n))if(n==="execute"){let s=t.getAttribute("data-command");s&&f.postMessage({command:s})}else f.postMessage({command:"insightAction",id:o,action:n})})})}function il(e,t,o,n,s,r,i,a,l,u,c,p,b,h){return`
		<style>${ln}</style>
		<style>${dn}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${nn("btn-usage",!!e.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!V}" aria-controls="about-info-body">
					<span>\u{1F4CB} About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${V?"\u25B8":"\u25BE"}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${V?' style="display:none"':""}>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${$==="activity"?"active":""}" data-tab="activity"><span class="codicon codicon-pulse"></span> My Activity</button>
				<button class="tab-button ${$==="sessions"?"active":""}" data-tab="sessions"><span class="codicon codicon-history"></span> Recent Sessions</button>
				<button class="tab-button ${$==="tools"?"active":""}" data-tab="tools"><span class="codicon codicon-tools"></span> Tools &amp; Integrations</button>
				<button class="tab-button ${$==="health"?"active":""}" data-tab="health"><span class="codicon codicon-server-environment"></span> Workspace Health</button>
				<button class="tab-button ${$==="repos"?"active":""}" data-tab="repos"><span class="codicon codicon-git-pull-request"></span> Repository PRs</button>
				<button class="tab-button ${$==="agent"?"active":""}" data-tab="agent"><span class="codicon codicon-cloud"></span> Cloud Agent</button>
				<button class="tab-button ${$==="worktrees"?"active":""}" data-tab="worktrees"><span class="codicon codicon-git-branch"></span> Worktrees</button>
				<button class="tab-button ${$==="insights"?"active":""}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(e.insights??[]).filter(S=>S.status==="new").length>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(e.insights??[]).filter(S=>S.status==="new").length}</span>`:""}</button>
				${Ga(e.correctionReport??null)}
			</div>

			${P("Recent Sessions",()=>wl(e))}
			${P("My Activity",()=>$l(e,o,n,s,r,i))}
			${P("Tools & Integrations",()=>od(e,a,l,u,c,p,b,h))}
			${P("Workspace Health",()=>_a(t,e))}
			${P("Repository PRs & Cloud Agent",()=>Wa())}
			${P("Worktrees",()=>xl())}
			${P("Insights",()=>qa(e.insights??[]))}
			${P("Corrections",()=>el(e.correctionReport??null))}
			<div class="footer">
				Last updated: ${d(new Date(e.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`}function al(){if(U.length===0)return'<div style="color: var(--text-muted); font-size: 12px; margin: 8px 0;">No root folders added yet. Add a folder to scan for worktrees.</div>';let e=U.length>2,t=!e||Ve,o=e?`<button class="worktree-roots-toggle" id="btn-toggle-worktree-roots" aria-expanded="${Ve}"><span class="worktree-caret">${Ve?"\u25BC":"\u25B6"}</span>${U.length} root folders found</button>`:"",n=t?`<div class="worktree-roots-list">${U.map((s,r)=>`<div class="worktree-root-item"><span title="${d(s)}">${d(s)}</span><button class="button secondary worktree-remove-root" data-index="${r}" ${R?"disabled":""}>\u2715</button></div>`).join("")}</div>`:"";return o+n}function ll(e,t){let o=e.enriched??0,n=e.enrichTotal??0,s=n>0?Math.round(o/n*100):0;return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F4E6} Computing sizes &amp; push status\u2026</div>
      <div>${o} / ${n} worktree${n===1?"":"s"} analyzed (${t}s)</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${s}%;"></div></div>
    </div>`}function dl(e,t){let o=e.phase==="walking",n=o?"\u{1F50D} Scanning folder\u2026":"\u23F3 Checking markers\u2026",s=e.dirsScanned??0,r=o?`Exploring for git worktrees \u2014 ${s} folder${s===1?"":"s"} scanned (${t}s)`:`${e.checked} / ${e.total||"?"} .git markers checked \u2014 ${e.foundCount} worktree${e.foundCount===1?"":"s"} found so far (${t}s)`,i=o?100:e.total>0?Math.round(e.checked/e.total*100):0,a=o?"worktree-progress-fill indeterminate":"worktree-progress-fill";return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">${n}</div>
      <div>Folder: <span style="font-family: var(--vscode-editor-font-family, monospace);">${d(e.root||"\u2026")}</span></div>
      <div>${r}</div>
      <div class="worktree-progress-bar"><div class="${a}" style="width: ${i}%;"></div></div>
    </div>`}function Ws(){if(!R)return"";let e=D,t=(e.elapsedMs/1e3).toFixed(1);return e.phase==="enriching"?ll(e,t):dl(e,t)}function cl(){if(!Ge||R||L.length===0)return"";let e=d(new Date(Ge.scannedAt).toLocaleString()),t=Pe(Ge.totalBytes),o=L.length;return`<div class="info-box" style="margin-top: 12px;"><div>\u{1F333} Found automatically by the daily background scan: ${t} across ${o} worktree${o===1?"":"s"}, last checked ${e}. Scan again for the latest.</div></div>`}function qs(){return`
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Root Folders</span></div>
      <div id="worktree-roots-list">${al()}</div>
      <div class="folder-input-row" style="margin-top: 8px;">
        <input
          type="text"
          id="worktree-root-input"
          class="folder-input"
          placeholder="Paste a root folder path here, e.g. C:\\code\\repos"
          ${R?"disabled":""}
        />
        <button class="button secondary" id="btn-browse-worktree-root" ${R?"disabled":""}>\u{1F4C2} Browse\u2026</button>
        <button class="button secondary" id="btn-add-worktree-root" ${R?"disabled":""}>\u2795 Add</button>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-scan-worktrees" ${R||W||U.length===0?"disabled":""}>\u{1F50D} Scan for Worktrees</button>
        ${R?'<button class="button secondary" id="btn-cancel-worktree-scan">\u2715 Cancel</button>':""}
      </div>
      ${cl()}
      ${rt?`<div class="info-box" style="margin-top: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);"><div>\u26A0\uFE0F ${d(rt)}</div></div>`:""}
      <div id="worktree-progress-area">${Ws()}</div>
    </div>`}function ul(e){let t=new Map;for(let o of e){let n=o.repoLabel||"Unknown";t.has(n)||t.set(n,[]),t.get(n).push(o)}return t}function Gt(e){return e.bytes<0}function lt(e){return e.bytes>0?e.bytes:0}function pl(e){let t=Gt(e),o=a=>`<span class="worktree-pending">${R?a:"\u2014"}</span>`,n=e.pushed==="yes"?"\u2705":e.pushed==="no"?"\u{1F534}":"\u2753",s=t?o("checking\u2026"):`${n} ${d(e.pushed)}`,r=t?o("\u2026"):d(String(e.files)),i=t?o("computing\u2026"):`<span title="${e.bytes.toLocaleString()} bytes">${Pe(e.bytes)}</span>`;return`<tr>
    <td title="${d(e.path)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d(e.path)}</td>
    <td>${d(e.branch)}</td>
    <td>${d(e.lastCommit)}</td>
    <td>${s}</td>
    <td>${r}</td>
    <td>${i}</td>
    <td>
      <a href="#" class="worktree-reveal-link" data-path="${encodeURIComponent(e.path)}">Open</a>
      <a href="#" class="worktree-delete-link" data-path="${encodeURIComponent(e.path)}" data-branch="${encodeURIComponent(e.branch)}" data-repo="${encodeURIComponent(e.repoLabel)}" data-pushed="${d(e.pushed)}" title="Remove via git worktree remove (asks for confirmation)">\u{1F5D1}\uFE0F Delete</a>
    </td>
  </tr>`}function gl(e){return`<div class="table-container">
    <table class="session-table">
      <thead><tr><th>Path</th><th>Branch</th><th>Last Commit</th><th>Pushed</th><th>Files</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody>${[...e].sort((n,s)=>lt(s)-lt(n)).map(pl).join("")}</tbody>
    </table>
  </div>`}function ml(e){let t=e.reduce((s,r)=>s+lt(r),0),o=e.some(Gt),n=`<span title="${t.toLocaleString()} bytes">${Pe(t)}</span>`;return o?`${n} <span class="worktree-pending">\u2026</span>`:n}function fl(e,t){let o=zt.has(e),n=o?"\u25BC":"\u25B6",s=d(e),r=`<tr class="worktree-repo-row${o?" expanded":""}" data-repo="${s}" aria-expanded="${o}">
    <td><span class="worktree-caret">${n}</span> ${d(e)}</td>
    <td>${t.length}</td>
    <td>${ml(t)}</td>
  </tr>`,i=`<tr class="worktree-repo-details" data-repo="${s}"${o?"":' style="display: none;"'}>
    <td colspan="3">${gl(t)}</td>
  </tr>`;return r+i}function Ro(e){return it!==e?"":Ye==="desc"?" \u25BC":" \u25B2"}function bl(e){return e.reduce((t,o)=>t+lt(o),0)}function yl(e,t){let o=Ye==="desc"?-1:1;if(it==="repo")return o*e[0].localeCompare(t[0]);let n=r=>it==="count"?r.length:bl(r),s=n(e[1])-n(t[1]);return s!==0?o*s:e[0].localeCompare(t[0])}function Ks(){return L.filter(e=>e.pushed==="yes"&&!Gt(e))}function hl(){let e=Ks().length,t=W||fe||R||e===0,o=fe?"\u23F3 Waiting\u2026":`\u{1F9F9} Clean Up (${e})`;return`<div class="summary-card worktree-cleanup-card">
    <div class="summary-label">Pushed Worktrees</div>
    <div class="worktree-cleanup-card-actions">
      <button class="button secondary" id="btn-cleanup-pushed-worktrees" ${t?"disabled":""}>${o}</button>
      ${W?'<button class="button secondary" id="btn-cancel-cleanup">\u2715</button>':""}
    </div>
  </div>`}function Ss(){let e=re.filter(o=>o.status!=="deleted");return e.length===0?"":`<div class="worktree-cleanup-log">${e.map(o=>`<div class="worktree-cleanup-log-row">
      <span>${o.status==="skipped"?"\u23ED\uFE0F":"\u274C"}</span>
      <span class="worktree-cleanup-log-branch">${d(o.branch)}</span>
      <span class="worktree-cleanup-log-repo">${d(o.repoLabel)}</span>
      <span class="worktree-cleanup-log-reason">${d(o.reason||"")}</span>
    </div>`).join("")}</div>`}function vl(){if(W){let{processed:n,total:s}=Oo,r=s>0?Math.round(n/s*100):0;return`<div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F9F9} Cleaning up pushed worktrees\u2026</div>
      <div>${n} / ${s} processed</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${r}%;"></div></div>
    </div>${Ss()}`}if(re.length===0)return"";let e=re.filter(n=>n.status==="deleted").length,t=re.filter(n=>n.status==="skipped").length,o=re.filter(n=>n.status==="error").length;return`<div class="info-box" style="margin-top: 12px;">
    <div class="info-box-title">\u{1F9F9} Cleanup finished</div>
    <div>\u2705 ${e} deleted \xB7 \u23ED\uFE0F ${t} skipped (uncommitted/unpushed) \xB7 ${o>0?`\u274C ${o} error${o===1?"":"s"}`:"0 errors"}</div>
  </div>${Ss()}`}function Gs(){if(L.length===0)return R?'<div style="padding: 16px; color: var(--text-muted);">Discovering worktrees\u2026</div>':'<div style="padding: 16px; color: var(--text-muted);">No worktrees found yet. Add root folders above and click Scan.</div>';let e=ul(L),t=L.reduce((l,u)=>l+lt(u),0),o=L.some(Gt),n=`${Pe(t)}${o?' <span class="worktree-pending">\u2026</span>':""}`,s=`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F333} Worktrees</div><div class="summary-value">${L.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4E6} Repositories</div><div class="summary-value">${e.size}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4BE} Total Size</div><div class="summary-value" title="${t.toLocaleString()} bytes">${n}</div></div>
    ${hl()}
  </div>`,i=[...e.entries()].sort(yl).map(([l,u])=>fl(l,u)).join(""),a=`<div class="table-container">
    <table class="session-table worktree-repo-table">
      <thead><tr>
        <th class="sortable" data-wt-sort="repo">Repository${Ro("repo")}</th>
        <th class="sortable" data-wt-sort="count">Worktrees${Ro("count")}</th>
        <th class="sortable" data-wt-sort="size">Size${Ro("size")}</th>
      </tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`;return s+vl()+a}function xl(){return`
    <div id="tab-panel-worktrees" class="tab-panel"${$!=="worktrees"?' style="display:none"':""}>
      <div class="info-box">
        <div class="info-box-title">\u{1F333} Worktree Discovery</div>
        <div>
          Scans folders for uncleaned git worktrees and reports disk usage grouped by repository (based on each
          worktree's git remote). Add one or more root folders below, then click Scan. Results stream in as they're found.
        </div>
      </div>
      <div id="worktree-controls">${qs()}</div>
      <div id="worktree-results">${Gs()}</div>
    </div>`}function kl(e){let t=e.filter(n=>(n.subAgentCalls??0)>0).length;if(t===0)return"";let o=e.reduce((n,s)=>n+(s.subAgentCalls??0),0);return`<div style="margin-top:8px; font-size:12px; color:var(--text-secondary);" title="Sessions that delegated work to sub-agents (task/read_agent/write_agent/list_agents, runSubagent, delegate_*, \u2026)">
		\u{1F916} <strong>${t}</strong> session${t===1?"":"s"} used sub-agents (${g(o)} sub-agent call${o===1?"":"s"}) in this period
	</div>`}function wl(e){Array.isArray(e.todaySessions)&&(Uo=e.todaySessions);let t=I==="today"?Uo:Ae[I],o=t?Io(t):`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${pt[I]}\u2026</div>`,n=t?kl(t):"";return`
		<div id="tab-panel-sessions" class="tab-panel"${$!=="sessions"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>\u{1F4CB}</span><span>Recent Sessions</span>
					<span id="sessions-lookback-wrapper" style="margin-left:auto;"></span>
					${Si()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period \u2014 sorted by number of interactions (most active first).</div>
				${n}
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${o}
				</div>
			</div>
		</div>`}function Cl(e,t){let o=e.usedAiCredits*.01,n=Math.max(0,Math.min(t,o)),s=Math.max(0,o-n),r=e.budgetUsd,i=r>0?Math.min(100,n/r*100):0,a=r>0?Math.min(100-i,s/r*100):0,l=i+a,u=w(100-e.pctAvailable,1),c=w(e.pctAvailable,1),p=l>90?"var(--error-color, #f14c4c)":l>75?"var(--warning-color, #cca700)":"var(--accent-color, #4d9cf8)",b=i>0?`<div style="height:100%; width:${w(i,4)}%; background:${p};"></div>`:"",h=a>0?`<div title="Usage the API reports but this device has no local session data for" style="height:100%; width:${w(a,4)}%; background:${p}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 6px);"></div>`:"",S=a>0?`<div style="display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-secondary); margin-top:6px;">
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${p}; margin-right:4px; vertical-align:middle;"></span>Tracked here (${w(i,1)}%)</span>
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${p}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px); margin-right:4px; vertical-align:middle;"></span>Other devices/cloud (${w(a,1)}%)</span>
			</div>`:"";return`
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">GitHub Copilot API (all channels)</div>
			<div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px;">
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(e.usedAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits used</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(e.remainingAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits remaining</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(e.budgetAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Monthly budget</div>
				</div>
			</div>
			<div style="margin-bottom:4px; font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
				<span>${u}% used</span><span>${c}% available</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden; display:flex;">
				${b}${h}
			</div>
			${S}
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 \xB7 Budget = $${w(e.budgetUsd,2)}/month
			</div>
		</div>`}function Sl(e,t,o){if(!e)return`
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				\u2139\uFE0F No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions \u2014 it cannot see web chat, cloud agent, or review agent usage.
			</div>`;if(t<=0)return"";let n=e.usedAiCredits*.01,s=n-t,r=Math.round(s*100),i=r>0?`<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${w(s,2)} (${g(r)} credits)</span></div>`:"",a=o>.001?`<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${w(o,2)}</span></div>`:"",l=r>0?'<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">\u2139\uFE0F The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> \u2014 all counted against your AI Credit budget.</div>':'<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">\u2705 Extension-tracked Copilot usage matches the API \u2014 no significant untracked usage from web chat, cloud agent, or review agent.</div>';return`
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${w(n,2)} (${g(e.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${w(t,2)} (${g(Math.round(t*100))} credits)</span></div>
				${i}${a}
			</div>
			${l}
		</div>`}function Tl(e){let t=e.copilotApiBalance,o=e.monthBillingGroupCosts;if(!t&&(!o||Object.keys(o).length===0))return"";let n=o?.["GitHub Copilot"]??0,r=(o?Object.values(o).reduce((u,c)=>u+c,0):0)-n,i=t?Cl(t,n):"",a=o&&Object.keys(o).length>0?bn(o,t):"",l=Sl(t,n,r);return`
		<div class="section">
			<div class="section-title"><span>\u{1F4B3}</span><span>AI Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs, alongside estimated costs from other AI providers.</div>
			${i}
			${a}
			${l}
		</div>`}function $l(e,t,o,n,s,r){let i=P("Model Cost",()=>Ma(e)),a=P("AI Billing Coverage",()=>Tl(e)),l=P("Interaction Modes",()=>`
			<div class="section" id="section-interaction-modes">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), Agent (autonomous tasks), Plan, Custom Agent, CLI (terminal), or Copilot App (desktop-app CLI sessions)</div>
				<div class="two-column">
					${vs(e.today.modeUsage,"\u{1F4C5} Today")}
					${vs(e.last30Days.modeUsage,"\u{1F4CA} Last 30 Days")}
				</div>
			</div>`),u=P("Context References",()=>Il(e,s,r)),c=P("Model Efficiency",()=>Zl(e)),p=P("Context Window",()=>Dl(e));return`
		<div id="tab-panel-activity" class="tab-panel"${$!=="activity"?' style="display:none"':""}>
			${n}
			${a}
			<!-- Mode Usage Section -->
			${l}
			${u}
			${t}
			${i}
			${c}
			${o}
			${p}
		</div>`}var Al=q("__MODEL_PRICING__"),Ml=Al?.pricing??{};function Vs(e){let t=null;for(let o of e){let n=un(o,Ml);n&&(!t||n.thresholdTokens<t.thresholdTokens)&&(t={...n,model:o})}return t}function El(e){let t=e*4/1048576,o=Math.round(e/10/1e3);return`\u2248${w(t,1)} MB of code (~${g(o)}K lines)`}function Rl(e,t){let o=e/t.thresholdTokens*100,n=Math.min(o,100),s=o>100?"var(--error-color, #f14c4c)":o>=70?"var(--warning-color, #cca700)":"var(--success-color, #89d185)",r=d(ee(t.model)),i=`above it, input billing goes $${t.defaultInputCostPerMillion.toFixed(2)} \u2192 $${t.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;return`
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${g(e)} tokens \u2014 ${w(o,0)}% of the ${g(t.thresholdTokens)}-token default tier for ${r}</span>
				<span>${g(t.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${w(n,0)}%; background:${s}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${El(t.thresholdTokens)}; ${i}.</div>
		</div>`}function Ko(e,t,o,n){return`
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${n?` title="${n}"`:""}>${e}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${t}</div>
			${o?`<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${o}</div>`:""}
		</div>`}function _l(e){if(e.maxRequestInputTokens<=0)return"";let t=Vs(e.maxRequestModels),o=d(e.maxRequestModels.map(s=>ee(s)).join(", ")||"\u2014"),n=t?`${w(e.maxRequestInputTokens/t.thresholdTokens*100,0)}% of the ${g(t.thresholdTokens)}-token price line \xB7 ${o}`:`${o} \u2014 no long-context surcharge for ${e.maxRequestModels.length>1?"these models":"this model"}`;return Ko("\u{1F4CF} Largest request",`${g(e.maxRequestInputTokens)} input tokens`,n,"The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period")}function Pl(e){if((e.maxReachedTokens??0)<=0)return"";let t=e.maxReachedWindowLimit,o=t?`${g(e.maxReachedTokens)} of ${g(t)} (${w(e.maxReachedTokens/t*100,0)}%)`:g(e.maxReachedTokens);return Ko("\u{1FA9F} Fullest CLI window",o,void 0,"The highest context fill recorded for a Copilot CLI session in this period, versus its window limit")}function _o(e){if(!(!!e&&(e.maxRequestInputTokens>0||(e.maxReachedTokens??0)>0||Object.keys(e.tierCounts).length>0)))return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.entries(e.tierCounts),n=o.reduce((r,[,i])=>r+i,0),s=o.length>0?Ko("\u{1FA9C} Context tiers",o.map(([r,i])=>`${d(r)} \xD7${i}`).join(", "),`${n} Copilot CLI session${n===1?"":"s"} grouped by chosen window size \u2014 "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,"Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier"):"";return _l(e)+Pl(e)+s}function Dl(e){let t=e.last30Days.contextWindow,o=t&&t.maxRequestInputTokens>0?Vs(t.maxRequestModels):null,n=t&&o?Rl(t.maxRequestInputTokens,o):"";return`
		<div class="section">
			<div class="section-title"><span>\u{1FA9F}</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${_o(e.today.contextWindow)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${_o(t)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${_o(e.lastMonth.contextWindow)}
				</div>
			</div>
			${n}
		</div>`}function Dt(e,t=""){let o=e>0?"":" ctx-ref-zero";return`<td class="${`ctx-ref-num${t?" "+t:""}${o}`}">${e}</td>`}function Ts(e,t,o){let i=[e,t,o],a=Math.max(...i),l=i.map((p,b)=>{let h=2+b*(56/(i.length-1)),S=a===0?18:2+(1-p/a)*16;return`${h.toFixed(1)},${S.toFixed(1)}`}).join(" "),c=a===0?"var(--text-muted)":o>=t&&t>=e?"var(--link-color)":o<=t&&t<=e?"#f87171":"var(--text-secondary)";return`<td class="ctx-ref-spark"><svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><polyline points="${l}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${i.map((p,b)=>{let h=2+b*(56/(i.length-1)),S=a===0?18:2+(1-p/a)*16;return`<circle cx="${h.toFixed(1)}" cy="${S.toFixed(1)}" r="2" fill="${c}"/>`}).join("")}</svg></td>`}function Ll(e,t){return`
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
					${e.slice().sort((n,s)=>s.last30-n.last30).map(n=>`<tr${n.title?` title="${d(n.title)}"`:""}><td class="ctx-ref-name">${n.label}</td>${Dt(n.today,n.today>0?"ctx-ref-today-active":"")}${Dt(n.month)}${Dt(n.lastMonth)}${Dt(n.last30)}${Ts(n.lastMonth,n.month,n.today)}</tr>`).join("")}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${t.today}</td>
						<td class="ctx-ref-num">${t.month}</td>
						<td class="ctx-ref-num">${t.lastMonth}</td>
						<td class="ctx-ref-num">${t.last30}</td>
						<td class="ctx-ref-spark">${Ts(t.lastMonth,t.month,t.today).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,"")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function Ul(e,t,o){let n=c=>c||0,s=[{label:"\u{1F4C4} #file",get:c=>c.file},{label:"\u2702\uFE0F #selection",get:c=>c.selection},{label:"\u2728 Implicit Selection",title:"Text selected in your editor providing passive context to Copilot",get:c=>c.implicitSelection},{label:"\u{1F524} #symbol",get:c=>c.symbol},{label:"\u{1F5C2}\uFE0F #codebase",get:c=>c.codebase},{label:"\u{1F4C1} @workspace",get:c=>c.workspace},{label:"\u{1F4BB} @terminal",get:c=>c.terminal},{label:"\u{1F527} @vscode",get:c=>c.vscode},{label:"\u2328\uFE0F #terminalLastCommand",title:"Last command run in the terminal",get:c=>n(c.terminalLastCommand)},{label:"\u{1F5B1}\uFE0F #terminalSelection",title:"Selected terminal output",get:c=>n(c.terminalSelection)},{label:"\u{1F4CB} #clipboard",title:"Clipboard contents",get:c=>n(c.clipboard)},{label:"\u{1F4DD} #changes",title:"Uncommitted git changes",get:c=>n(c.changes)},{label:"\u{1F4E4} #outputPanel",title:"Output panel contents",get:c=>n(c.outputPanel)},{label:"\u26A0\uFE0F #problemsPanel",title:"Problems panel contents",get:c=>n(c.problemsPanel)},{label:"\u{1F500} #pr",title:"Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary",get:c=>n(c.pullRequest)},{label:"\u{1F4F7} Images",title:"Pasted images and vision context detected in session logs",get:c=>n(c.byKind["copilot.image"])},{label:"\u{1F4CB} Prompt Files",title:".github/prompts/ prompt file uses detected in session logs",get:c=>n(c.byKind.promptFile)},{label:"\u{1F4D0} Code Lines",title:"Total lines of code referenced via #file: range selections",get:c=>n(c.codeContextLines)},{label:"\u{1F3AF} Custom Prompts",title:"Custom /command prompt uses detected in session logs",get:c=>n(c.byKind.prompt)},{label:"\u{1F4CB} Copilot Instructions",title:"copilot-instructions.md file references detected in session logs",get:c=>c.copilotInstructions},{label:"\u{1F916} Agents.md",title:"agents.md file references detected in session logs",get:c=>c.agentsMd}],r=e.last30Days.contextReferences,i=e.month.contextReferences,a=e.lastMonth.contextReferences,l=e.today.contextReferences,u=s.map(c=>({label:c.label,title:c.title,last30:c.get(r),month:c.get(i),lastMonth:c.get(a),today:c.get(l)}));return Ll(u,{last30:o,month:Re(i),lastMonth:Re(a),today:t})}function Il(e,t,o){let n=Object.keys(e.last30Days.contextReferences.byKind).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(e.last30Days.contextReferences.byKind).sort(([,r],[,i])=>i-r).slice(0,5).map(([r,i])=>`<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${d(r)}:</span> ${i}</div>`).join("")}
			</div>
		</div>
	`:"",s=Object.keys(e.last30Days.contextReferences.byPath).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(e.last30Days.contextReferences.byPath).sort(([,r],[,i])=>i-r).slice(0,10).map(([r,i])=>`<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${i}\xD7</span> ${d(r)}</div>`).join("")}
			</div>
		</div>
	`:"";return`
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${Ul(e,t,o)}
			${n}
			${s}
		</div>`}function zl(e){let t=ui(e);if(t.length===0)return"";let o=pi(t);return`
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${t.map(s=>{let r=(e.today.toolCalls.byTool[s]||0)+(e.today.mcpTools.byTool[s]||0),i=(e.last30Days.toolCalls.byTool[s]||0)+(e.last30Days.mcpTools.byTool[s]||0),a=(e.month.toolCalls.byTool[s]||0)+(e.month.mcpTools.byTool[s]||0),l=[];r>0&&l.push(`${r} today`),i>r&&l.push(`${i} in the last 30d`),a>i&&l.push(`${a} this month`);let u=l.length>0?`<span style="color:var(--text-muted);"> (${l.join(" | ")})</span>`:"",c=`<button data-suppress-tool="${d(s)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${d(s)}">\u{1F507}</button>`;return`<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${d(s)}${u}${c}</span>`}).join(" ")}
			</div>
			<a href="${d(o)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`}var Bl={today:"today",last30:"last30Days",currentMonth:"month"},$s="last30",Ys="last30Days",Ht="cost",Go="calls",Vt="vendor",jt="calls",nt="desc",Js={},Vo=!0;function Yo(e){return e===null?"\u2014":e>=.01?sn(e):`$${e.toFixed(3)}`}function Ft(e){return e===null?"\u2014":Q(e*100)}function Bt(e){return e===null?"\u2014":w(e,1)}var dt=[{key:"cost",label:"Cost",axisLabel:"Average cost per turn",value:e=>e.rates.costPerCall,format:Yo},{key:"outputTokens",label:"Output tokens",axisLabel:"Average output tokens per turn",value:e=>e.rates.outputTokensPerCall,format:e=>e===null?"\u2014":gt(Math.round(e))},{key:"toolSteps",label:"Tool steps",axisLabel:"Average tool steps per turn",value:e=>e.rates.toolCallsPerCall,format:Bt}],Wt=[{key:"calls",label:"Local use",value:e=>e.counters.calls,format:e=>`${g(e??0)} turns`},...dt.map(({key:e,label:t,value:o,format:n})=>({key:e,label:t,value:o,format:n}))];function Ol(e,t){let o=t>0?e.counters.calls/t:0;return`<div class="model-use-cell">
		<div class="model-use-track" aria-hidden="true"><span style="width:${Math.max(2,o*100).toFixed(1)}%"></span></div>
		<strong>${Ft(o)}</strong>
		<span>${g(e.counters.calls)} turns</span>
	</div>`}var qt=[{sortKey:"model",label:"Model",title:"Model identifier",sortValue:e=>e.model,render:e=>d(ee(e.model))},{sortKey:"calls",label:"Local use",title:"Share of user-request turns attributed to this model",sortValue:e=>e.counters.calls,render:Ol},{sortKey:"oneShotRate",label:"One-shot",title:"Share of edit turns completed without retries or self-corrections",sortValue:e=>e.rates.oneShotRate,render:e=>Ft(e.rates.oneShotRate)},{sortKey:"retryRate",label:"Retries/edit",title:"Average immediate same-file retries per edit turn",sortValue:e=>e.rates.retryRate,render:e=>Bt(e.rates.retryRate)},{sortKey:"selfCorrectionRate",label:"Self-corr/edit",title:"Average re-edits after intervening tool calls per edit turn",sortValue:e=>e.rates.selfCorrectionRate,render:e=>Bt(e.rates.selfCorrectionRate)},{sortKey:"costPerCall",label:"Avg cost",title:"Average estimated provider cost per user-request turn",sortValue:e=>e.rates.costPerCall,render:e=>Yo(e.rates.costPerCall)},{sortKey:"outputTokensPerCall",label:"Out tok",title:"Average output tokens per user-request turn",sortValue:e=>e.rates.outputTokensPerCall,render:e=>e.rates.outputTokensPerCall===null?"\u2014":gt(Math.round(e.rates.outputTokensPerCall))},{sortKey:"toolCallsPerCall",label:"Steps",title:"Average tool invocations per user-request turn",sortValue:e=>e.rates.toolCallsPerCall,render:e=>Bt(e.rates.toolCallsPerCall)},{sortKey:"cacheHitRate",label:"Cache hit",title:"Cache-read share of input tokens",sortValue:e=>e.rates.cacheHitRate,render:e=>Ft(e.rates.cacheHitRate)}];function Nl(e){return jt!==e?"":nt==="desc"?" \u25BC":" \u25B2"}function Hl(e,t,o){let n=o.sortValue(e),s=o.sortValue(t);if(n===null&&s===null)return 0;if(n===null)return 1;if(s===null)return-1;let r=typeof n=="string"||typeof s=="string"?String(n).localeCompare(String(s)):n-s;return nt==="desc"?-r:r}function jl(e){let t=Object.entries(e).map(([n,s])=>({model:n,counters:s,rates:pn(s)})),o=qt.find(n=>n.sortKey===jt)??qt[1];return t.sort((n,s)=>Hl(n,s,o))}function Fl(e,t){if(!Vo)return{rows:e,hiddenNote:""};let o=gn(t);if(o===null)return{rows:e,hiddenNote:""};let n=e.filter(l=>l.counters.calls>o),s=e.length-n.length,r=s===1?"model":"models",i=o===1?"turn":"turns",a=s>0?`${s} low-usage ${r} hidden (\u2264${o} ${i})`:"";return{rows:n,hiddenNote:a}}var As=["--stage-1-color","--stage-2-color","--stage-3-color","--stage-4-color","--success-fg","--warning-fg","--link-color"],Wl={Anthropic:"--warning-fg",OpenAI:"--success-fg",Google:"--stage-3-color","Mistral AI":"--stage-2-color",xAI:"--stage-4-color",Alibaba:"--stage-1-color",Microsoft:"--link-color"};function Ms(e){let t=0;for(let o=0;o<e.length;o++)t=(t<<5)-t+e.charCodeAt(o)|0;return`var(${As[Math.abs(t)%As.length]})`}function Jo(e){if(Vt==="model")return Ms(e);let t=yt(e),o=Wl[t];return o?`var(${o})`:Ms(t)}function ql(e,t){return e.key==="cost"?Yo(t):e.key==="outputTokens"?gt(Math.round(t)):w(t,1)}function Kl(e,t){let o=[0,.25,.5,.75,1].map(s=>{let r=76+s*760;return`<line x1="${r}" y1="24" x2="${r}" y2="286"></line><text x="${r}" y="310" text-anchor="middle">${d(ql(e,t*s))}</text>`}).join(""),n=[0,.25,.5,.75,1].map(s=>{let r=286-s*262;return`<line x1="76" y1="${r}" x2="836" y2="${r}"></line><text x="64" y="${r+4}" text-anchor="end">${Math.round(s*100)}%</text>`}).join("");return`<g class="efficiency-grid">${o}${n}</g>`}function Gl(e,t,o,n,s,r){let i=t.value(e)??0,a=o.value(e)??0,l=e.rates.oneShotRate??0,u=76+i/n*760,c=286-l*262,p=no(a,s),b=Jo(e.model),h=ee(e.model),S=d(h),ut=`${h}: ${Ft(l)} one-shot edit rate, ${t.format(i)} ${t.axisLabel.toLowerCase()}, bubble sized by ${o.label.toLowerCase()}: ${o.format(a)}`;return`<g class="efficiency-point" style="--model-color:${b}" tabindex="0" role="img" aria-label="${d(ut)}">
		<circle cx="${u.toFixed(1)}" cy="${c.toFixed(1)}" r="${p.toFixed(1)}"><title>${d(ut)}</title></circle>
		<text x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" text-anchor="${r.textAnchor}">${S}</text>
	</g>`}function Vl(e){return Vt!=="vendor"?"":`<div class="efficiency-vendor-legend" aria-label="Model vendor colors">${[...new Set(e.map(n=>yt(n.model)))].sort().map(n=>{let s=e.find(r=>yt(r.model)===n)?.model??"";return`<span class="efficiency-legend-item" style="--model-color:${Jo(s)}"><span aria-hidden="true"></span>${d(n)}</span>`}).join("")}</div>`}function Yl(e){let t=dt.find(u=>u.key===Ht)??dt[0],o=Wt.find(u=>u.key===Go)??Wt[0],n=e.filter(u=>u.rates.oneShotRate!==null&&t.value(u)!==null).sort((u,c)=>c.counters.calls-u.counters.calls).slice(0,12);if(n.length===0)return'<div class="model-leaderboard-empty"><strong>No comparable edit data yet.</strong><span>The chart appears after local sessions record both a model and structured edit turns.</span></div>';let s=Math.max(...n.map(u=>t.value(u)??0),1e-4)*1.08,r=Math.max(...n.map(u=>o.value(u)??0),0),i=n.map(u=>{let c=t.value(u)??0,p=o.value(u)??0;return{x:76+c/s*760,y:286-(u.rates.oneShotRate??0)*262,radius:no(p,r),label:ee(u.model)}}),a=xn(i,{left:76,right:836,top:24,bottom:286}),l=n.map((u,c)=>Gl(u,t,o,s,r,a[c])).join("");return`<div class="efficiency-chart-wrap">
		<svg class="efficiency-chart" viewBox="0 0 900 350" role="img" aria-label="One-shot edit rate compared with ${d(t.axisLabel.toLowerCase())}; bubble size represents ${d(o.label.toLowerCase())}">
			${Kl(t,s)}
			<text class="efficiency-axis-title" x="456" y="344" text-anchor="middle">${d(t.axisLabel)}</text>
			<text class="efficiency-axis-title" x="17" y="155" text-anchor="middle" transform="rotate(-90 17 155)">One-shot edit rate</text>
			<text class="efficiency-chart-hint" x="836" y="17" text-anchor="end">higher is better \u2191</text>
			${l}
		</svg>
	</div>${Vl(n)}`}function Jl(){let e=dt.map(n=>`<button class="efficiency-metric-button${n.key===Ht?" active":""}" type="button" data-eff-metric="${n.key}" aria-pressed="${n.key===Ht}">${n.label}</button>`).join(""),t=Wt.map(n=>`<option value="${n.key}"${n.key===Go?" selected":""}>${n.label}</option>`).join(""),o=[{value:"vendor",label:"Vendor"},{value:"model",label:"Model"}].map(n=>`<option value="${n.value}"${n.value===Vt?" selected":""}>${n.label}</option>`).join("");return`<div class="efficiency-chart-controls">
		<div class="efficiency-control"><span>X-axis</span><div class="efficiency-metric-selector" role="group" aria-label="Efficiency comparison metric">${e}</div></div>
		<label class="efficiency-control"><span>Bubble size</span><select id="eff-bubble-metric">${t}</select></label>
		<label class="efficiency-control"><span>Color by</span><select id="eff-color-mode">${o}</select></label>
	</div>`}function Xl(e,t){let o=e.map(s=>{let r=qt.map(i=>`<td>${i.render(s,t)}</td>`).join("");return`<tr style="--model-color:${Jo(s.model)}">${r}</tr>`}).join("");return`<div class="model-leaderboard-table-wrap"><table class="model-leaderboard-table"><thead><tr>${qt.map(s=>`<th class="sortable" data-eff-sort="${s.sortKey}" title="${s.title}">${s.label}${Nl(s.sortKey)}</th>`).join("")}</tr></thead><tbody>${o}</tbody></table></div>`}function Xs(){let e=Js[Ys];if(!e||Object.keys(e).length===0)return'<div class="model-leaderboard-empty"><strong>No per-model efficiency data for this period.</strong><span>Run local agent sessions with model and tool-call metadata, then refresh the dashboard.</span></div>';let t=jl(e),o=t.reduce((r,i)=>r+i.counters.calls,0),n=Fl(t,e),s=n.hiddenNote?`<span class="model-leaderboard-filter-note">${n.hiddenNote}</span>`:"";return`<div class="efficiency-chart-header"><div><strong>Efficiency frontier</strong><span>One-shot edit rate is a local quality proxy, not a benchmark pass rate.</span></div>${Jl()}</div>
		${Yl(n.rows)}
		<div class="model-leaderboard-heading"><div><strong>Most used models locally</strong><span>Ranked by your local turns; all averages use the same selected period.</span></div>${s}</div>
		${Xl(n.rows,o)}`}function Zl(e){return Js={today:e.today.modelEfficiency,last30Days:e.last30Days.modelEfficiency,month:e.month.modelEfficiency},`<div class="section" id="section-model-efficiency">
		<div class="section-title"><span>\u{1F3AF}</span><span>Local Model Leaderboard</span></div>
		<div class="section-subtitle">Compare the models in your own sessions by local usage, one-shot edits, cost, output tokens, and tool steps. Exactness depends on what each editor records; missing structured data is shown as unavailable rather than estimated.</div>
		<div class="model-leaderboard-controls">
			<span id="model-efficiency-period-selector"></span>
			<label class="model-leaderboard-filter" title="Show only models above the 25th-percentile local turn count.">
				<input type="checkbox" id="eff-filter-low-usage"${Vo?" checked":""}>
				Hide low-usage models
			</label>
		</div>
		<div id="model-efficiency-content">${Xs()}</div>
	</div>`}function Ql(){let e=document.getElementById("model-efficiency-period-selector");if(!e)return;e.replaceChildren();let{wrapper:t}=Yt({selected:$s,disabled:["last7","allTime"],disabledTitle:"Not available for model efficiency",label:"",onChange:o=>{let n=Bl[o];n&&($s=o,Ys=n,Se())}});e.append(t)}function Se(){let e=document.getElementById("model-efficiency-content");e&&k(e,Xs())}function ed(e){let t=e.getAttribute("data-eff-sort");t&&(jt===t?nt=nt==="desc"?"asc":"desc":(jt=t,nt=t==="model"?"asc":"desc"),Se())}function td(){let e=document.getElementById("section-model-efficiency");e&&(e.addEventListener("click",t=>{let o=t.target,n=o.closest("th[data-eff-sort]");if(n){ed(n);return}let s=o.closest("button[data-eff-metric]")?.dataset.effMetric;s&&dt.some(r=>r.key===s)&&(Ht=s,Se())}),e.addEventListener("change",t=>{let o=t.target;o.id==="eff-filter-low-usage"?(Vo=o.checked,Se()):o.id==="eff-bubble-metric"&&Wt.some(n=>n.key===o.value)?(Go=o.value,Se()):o.id==="eff-color-mode"&&(o.value==="vendor"||o.value==="model")&&(Vt=o.value,Se())}))}function od(e,t,o,n,s,r,i,a){return`
		<div id="tab-panel-tools" class="tab-panel"${$!=="tools"?' style="display:none"':""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions${at?' (automatic tool calls hidden \u2014 disable "Hide Automatic Tool Calls" in settings to show them)':""}</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.today.toolCalls.total)}</div>
						${Y(J(e.today.toolCalls.byTool,t),10,tt,!0)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.last30Days.toolCalls.total)}</div>
							${Y(J(e.last30Days.toolCalls.byTool,t),10,tt,!0)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.month.toolCalls.total)}</div>
							${Y(J(e.month.toolCalls.byTool,t),10,tt,!0)}
						</div>
					</div>
				</div>
			</div>

			${Pa(e,o,n)}
			${Fa(It??e.curationAnalysis)}
			${Ja(e.repeatedTasks??null)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${Mo("\u{1F4C5} Today",e.today.modelSwitching,r,i,s,a)}
					${Mo("\u{1F4C6} Last 30 Days",e.last30Days.modelSwitching,r,i,s,a)}
					${Mo("\u{1F4C5} Previous Month",e.month.modelSwitching,r,i,s,a)}
				</div>
			</div>
		</div>`}function nd(e,t){try{return k(e,t()),!0}catch(o){let n=o instanceof Error?o.message:String(o);return console.error(`[usage-webview] renderLayout failed: ${n}`),k(e,`<div style="padding: 32px; text-align: center; font-size: 14px;">
			<div style="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;">\u26A0\uFE0F Something went wrong rendering the dashboard.</div>
			${Kt().outerHTML}
		</div>`),!1}}function sd(e){let t=e.customizationMatrix??E?.customizationMatrix??null;return H=t??null,(!H||H.workspaces.length===0)&&(B=null),Array.isArray(e.currentWorkspacePaths)&&(_s=e.currentWorkspacePaths),e.curationAnalysis?(It=e.curationAnalysis,Z("renderLayout.curation.cached",{availableTools:It.availableTools.length,unusedTools:It.unusedTools.length})):pe("render-no-curation-update","renderLayout.curation.notProvidedInUpdate"),t}function Zs(e){let t=document.getElementById("root");if(!t)return;let o=sd(e),n=P("Workspace Customization",()=>Aa(o)),s=Ra(e),r=Re(e.today.contextReferences),i=Re(e.last30Days.contextReferences),a=P("Thinking Effort",()=>Ea(e)),l=`
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${g(e.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${g(e.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${g(e.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${g(e.lastMonth.sessions)}</div></div>
			</div>
		</div>`;nd(t,()=>il(e,n,"",a,l,r,i,s.allToolKeys,s.allMcpToolKeys,s.allMcpServerKeys,s.allHighCostModels,s.allLowCostModels,s.allMediumCostModels,s.allUnknownModels))&&(id(),rd(),ad(),rl(),X(),va(),td(),Ql(),Us(),Yi(),ld(),Bo=e.insights??[],Fs(),er())}function rd(){let e=document.getElementById("about-info-toggle"),t=document.getElementById("about-info-body");if(!e||!t)return;let o=e.querySelector(".info-box-chevron"),n=()=>{V=!V,t.style.display=V?"none":"",e.setAttribute("aria-expanded",String(!V)),o&&(o.textContent=V?"\u25B8":"\u25BE"),f.setState({...f.getState()??{},aboutCollapsed:V})};e.addEventListener("click",n),e.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),n())})}function id(){document.getElementById("btn-refresh")?.addEventListener("click",()=>{f.postMessage({command:"refresh"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{f.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{f.postMessage({command:"showChart"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{f.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{f.postMessage({command:"showMaturity"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{f.postMessage({command:"showDashboard"})}),document.getElementById("btn-environmental")?.addEventListener("click",()=>{f.postMessage({command:"showEnvironmental"})}),document.getElementById("btn-efficiency")?.addEventListener("click",()=>{f.postMessage({command:"showEfficiency"})}),an(f)}function Es(e,t){e&&(e.disabled=!0,e.textContent=t,e.setAttribute("appearance","secondary"))}function ad(){document.getElementById("btn-analyse-repo")?.addEventListener("click",()=>{let e=document.getElementById("btn-analyse-repo");st=!0,Es(e,"Analyzing..."),f.postMessage({command:"analyseRepository"})}),document.getElementById("btn-analyse-all")?.addEventListener("click",()=>{let e=document.getElementById("btn-analyse-all");Es(e,"Analyzing All..."),me=!0,ge=!0,B=null;for(let t of H?.workspaces??[])t.workspacePath.startsWith("<unresolved:")||$e.add(t.workspacePath);X(),f.postMessage({command:"analyseAllRepositories"})}),document.getElementById("repo-list-pane")?.addEventListener("click",e=>{let o=e.target.closest(".btn-repo-action");if(!o)return;let n=o.getAttribute("data-workspace-path"),s=o.getAttribute("data-action");if(!(!n||!s)){if(s==="details"){B=n,ge=!1,X();return}s==="analyze"&&($e.add(n),me=!1,X(),f.postMessage({command:"analyseRepository",workspacePath:n}))}}),document.getElementById("repo-details-pane")?.addEventListener("click",e=>{e.target.closest("#btn-switch-repository")&&(ge=!0,X())})}function ld(){Array.from(document.getElementsByClassName("cf-copy")).forEach(e=>{e.addEventListener("click",t=>{let o=t.currentTarget,n=o.getAttribute("data-path")||"";navigator.clipboard&&n&&navigator.clipboard.writeText(n).then(()=>{o.textContent="Copied",setTimeout(()=>{o.textContent="Copy"},1200)}).catch(()=>{f.postMessage({command:"copyFailed",path:n})})})})}function dd(e){Po(),e.data?.locale&&Xt(e.data.locale),typeof e.data?.use24HourTime=="boolean"&&(Ot=e.data.use24HourTime),typeof e.data?.hideAutomaticToolCalls=="boolean"&&(at=e.data.hideAutomaticToolCalls);let t=Oi(e.data);t?(Ho=!1,Is(t.recentSessions),Zs(t),Ls(),X(),Ze&&Hs(Ze),Qe&&js(Qe)):(pe("update-invalid-sanitized","handleUpdateStats.sanitizeReturnedNull"),Ps("Received invalid data from the extension. Try refreshing."))}function Qs(e){if(!e)return;let t=document.getElementById("unknown-mcp-tools-section");t&&(t.querySelectorAll("button[data-suppress-tool]").forEach(o=>{o.getAttribute("data-suppress-tool")===e&&o.closest("span")?.remove()}),t.querySelectorAll("button[data-suppress-tool]").length===0&&t.remove())}function cd(){$="tools",document.querySelectorAll(".tab-button").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-tab")==="tools")}),document.querySelectorAll(".tab-panel").forEach(o=>{o.style.display="none"});let e=document.getElementById("tab-panel-tools");e&&(e.style.display="block");let t=document.getElementById("unknown-mcp-tools-section");t&&(t.scrollIntoView({behavior:"smooth",block:"center"}),t.style.transition="box-shadow 0.3s ease",t.style.boxShadow="0 0 0 3px var(--vscode-focusBorder)",setTimeout(()=>{t.style.boxShadow=""},2e3))}function ud(e){Ze=xa(e),Ze.authenticated||(Do=!1),Hs(Ze)}function pd(e){!e||typeof e!="object"||(Qe=yn(e),Qe.authenticated||(Lo=!1),js(Qe))}function gd(e){if(!Array.isArray(e))return;let t=zs(e);ol(t)}function md(e){switch(e.command){case"usageLoadingProgress":return ai(e),!0;case"usageRefreshing":return Po(),Xe=0,No("Refreshing Usage Analysis"),!0;case"updateStatsError":return Po(),Ps("Failed to calculate usage analysis. Check the Output panel for details."),!0}return!1}function fd(e){switch(e.command){case"repoAnalysisResults":try{Pd(e.data,e.workspacePath)}catch(t){console.error("Failed to render repo analysis results",t),Rs(t instanceof Error?t.message:String(t),e.workspacePath)}return!0;case"repoAnalysisError":return Rs(e.error,e.workspacePath),!0;case"repoAnalysisBatchComplete":return Dd(),!0}return!1}function bd(e){if(!md(e)&&!fd(e))switch(e.command){case"updateStats":dd(e);break;case"toolSuppressed":Qs(e.toolName);break;case"highlightUnknownTools":cd();break;case"repoPrStatsLoaded":ud(e.data);break;case"repoPrStatsProgress":xs("#repos-pr-content","repos-pr-progress","Fetching PRs\u2026",e.done,e.total);break;case"agentSessionsLoaded":pd(e.data);break;case"recentSessionsLoaded":$i(e);break;case"agentSessionsProgress":xs("#agent-sessions-content","agent-sessions-progress","Fetching agent sessions\u2026",e.done,e.total);break;case"updateInsights":gd(e.insights);break;case"switchTab":yd(e);break;default:ha(e);break}}function yd(e){let t=String(e.tab);if(!hn(t))return;$=t,Lt=typeof e.anchor=="string"&&e.anchor?e.anchor:null,document.querySelector(`.tab-button[data-tab="${t}"]`)?.click(),er()}function er(){if(!Lt)return;let e=document.getElementById(Lt);e&&(Lt=null,setTimeout(()=>e.scrollIntoView({behavior:"smooth",block:"start"}),50))}cn(e=>{bd(e)});f.postMessage({command:"usageWebviewReady"});function hd(e){return H?.workspaces.find(o=>o.workspacePath===e)?.workspaceName||e}function vd(e){let t=ct.get(e);if(t?.data?.summary){let o=ie(t.data.summary.percentage);return`${Math.round(o)}%`}return t?.error?"Error":"\u2014"}function ie(e){let t=typeof e=="number"?e:Number(e);return Number.isFinite(t)?t:0}var xd={"git-repo":"https://docs.github.com/en/get-started/using-git/about-git",gitignore:"https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files","env-example":"https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",editorconfig:"https://editorconfig.org/",linter:"https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",formatter:"https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide","type-safety":"https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries","commit-messages":"https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits","conventional-commits":"https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets","ci-config":"https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",scripts:"https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs","task-runner":"https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",devcontainer:"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",dockerfile:"https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry","version-pinning":"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",license:"https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"},kd={versionControl:"\u{1F504} Version Control",codeQuality:"\u2728 Code Quality",cicd:"\u{1F680} CI/CD",environment:"\u{1F527} Environment",documentation:"\u{1F4DA} Documentation"};function wd(e){let t=m("div");t.setAttribute("style","display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");let o=m("div");o.setAttribute("style","font-size: 14px; font-weight: 600; color: var(--text-primary);"),o.textContent="\u{1F4CA} Repository Hygiene Score";let n=m("div");return n.setAttribute("style","font-size: 24px; font-weight: 700; color: var(--link-color);"),n.textContent=`${Math.round(ie(e.percentage))}%`,t.append(o,n),t}function Cd(e){let t=m("div");t.setAttribute("style","display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");let o=[{count:e.passedChecks,label:"Passed",cardStyle:"text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--success-fg);"},{count:e.warningChecks,label:"Warnings",cardStyle:"text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--warning-fg);"},{count:e.failedChecks,label:"Failed",cardStyle:"text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: #ef4444;"}];for(let n of o){let s=m("div");s.setAttribute("style",n.cardStyle);let r=m("div");r.setAttribute("style",n.countStyle),r.textContent=String(ie(n.count));let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--text-secondary);"),i.textContent=n.label,s.append(r,i),t.appendChild(s)}return t}function Sd(e){let t=e?.status==="pass"||e?.status==="warning"?e.status:"fail";return{status:t,emoji:t==="pass"?"\u2705":t==="warning"?"\u26A0\uFE0F":"\u274C",color:t==="pass"?"#22c55e":t==="warning"?"#f59e0b":"#ef4444"}}function Td(e,t){let o=m("div");o.setAttribute("style","flex: 1;");let n=m("div");n.setAttribute("style",`font-size: 12px; font-weight: 600; color: ${t};`),n.textContent=typeof e?.label=="string"?e.label:"";let s=m("div");if(s.setAttribute("style","font-size: 11px; color: var(--text-secondary); margin-top: 2px;"),s.textContent=typeof e?.detail=="string"?e.detail:"",o.append(n,s),typeof e?.hint=="string"&&e.hint.length>0){let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;"),i.textContent=`\u{1F4A1} ${e.hint}`,o.appendChild(i)}let r=xd[typeof e?.id=="string"?e.id:""];if(r){let i=m("a");i.setAttribute("href",r),i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;"),i.setAttribute("title","View official documentation"),i.textContent="\u{1F4D6} View documentation",o.appendChild(i)}return o}function $d(e){let{emoji:t,color:o}=Sd(e),n=m("div");n.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");let s=m("span");s.setAttribute("style","flex-shrink: 0; padding-top: 1px;"),k(s,j(t));let r=m("span");return r.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),r.textContent=`+${ie(e?.weight)}`,n.append(s,Td(e,o),r),n}function Ad(e,t,o){let n=m("div");n.setAttribute("style","margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let s=m("div");s.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");let r=m("span");r.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),r.textContent=kd[e]||e;let i=o?.categories?.[e],a=m("span");a.setAttribute("style","font-size: 11px; color: var(--link-color); font-weight: 600;"),a.textContent=`${Math.round(ie(i?.percentage))}%`,s.append(r,a),n.appendChild(s);for(let l of t)n.appendChild($d(l));return n}function Md(e){let t=m("div");t.setAttribute("style","margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let o=m("div");o.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");let n=m("span");n.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),n.textContent="\u{1F4A1} Top Recommendations",o.appendChild(n),t.appendChild(o);for(let s of e.slice(0,5)){let r=s?.priority==="high"||s?.priority==="medium"?s.priority:"low",i=r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#60a5fa",a=m("div");a.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");let l=m("span");l.setAttribute("style",`font-size: 10px; font-weight: 600; color: ${i}; min-width: 50px;`),l.textContent=String(r).toUpperCase();let u=m("div");u.setAttribute("style","flex: 1;");let c=m("div");c.setAttribute("style","font-size: 11px; color: var(--text-primary);"),c.textContent=typeof s?.action=="string"?s.action:"";let p=m("div");p.setAttribute("style","font-size: 10px; color: var(--text-muted); margin-top: 2px;"),p.textContent=typeof s?.impact=="string"?s.impact:"",u.append(c,p);let b=m("span");b.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),b.textContent=`+${ie(s?.weight)}`,a.append(l,u,b),t.appendChild(a)}return t}function Ed(e,t){let o=m("div");o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");let n=m("div");n.setAttribute("style","font-size: 11px; color: var(--text-secondary); flex: 1;"),n.textContent="Let Copilot help you fix the identified issues in this repository.";let s=document.createElement("vscode-button");return s.setAttribute("style","min-width: 180px;"),s.textContent="\u{1F916} Ask Copilot to Improve",s.addEventListener("click",()=>{let i=`Please help me improve this repository by addressing the following best practice issues:

${e.map(l=>`- ${l.label}: ${l.detail||""}${l.hint?` (${l.hint})`:""}`).join(`
`)}

For each issue, please provide specific steps or code changes to fix it.`;if(!t||_s.some(l=>l.toLowerCase()===t.toLowerCase()))f.postMessage({command:"openCopilotChatWithPrompt",prompt:i});else{let l=t.split(/[/\\]/).filter(Boolean).pop()??t;o.replaceChildren(),o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");let u=m("div");u.setAttribute("style","font-size: 11px; color: var(--warning-fg);"),u.textContent=`\u26A0\uFE0F Open "${l}" in VS Code first, then paste this prompt into Copilot Chat:`;let c=m("pre");c.setAttribute("style","font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;"),c.textContent=i;let p=document.createElement("vscode-button");p.setAttribute("appearance","secondary"),p.textContent="\u{1F4CB} Copy prompt",p.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{p.textContent="\u2705 Copied!",setTimeout(()=>{p.textContent="\u{1F4CB} Copy prompt"},2e3)})}),o.append(u,c,p)}}),o.append(n,s),o}function tr(e,t){let o=e?.summary||{},n=Array.isArray(e?.checks)?e.checks:[],s=Array.isArray(e?.recommendations)?[...e.recommendations]:[],r=m("div");r.appendChild(wd(o)),r.appendChild(Cd(o));let i=m("div");i.setAttribute("style","font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;"),i.textContent=`Score: ${ie(o.totalScore)} / ${ie(o.maxScore)} points`,r.appendChild(i);let a={high:1,medium:2,low:3};s.sort((c,p)=>(a[c?.priority]||99)-(a[p?.priority]||99));let l={};for(let c of n){let p=typeof c?.category=="string"&&c.category.length>0?c.category:"other";l[p]||(l[p]=[]),l[p].push(c)}for(let[c,p]of Object.entries(l))r.appendChild(Ad(c,p,o));s.length>0&&r.appendChild(Md(s));let u=n.filter(c=>c?.status==="fail"||c?.status==="warning");return u.length>0&&r.appendChild(Ed(u,t)),r}function Rd(e,t,o){let n={sessions:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",interactions:"width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",score:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"},s=`
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${n.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${n.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${n.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 110px; flex-shrink: 0;"></div>
		</div>
	`;k(e,s+t.map((r,i)=>{let a=ct.get(r.workspacePath),l=$e.has(r.workspacePath),u=!!a?.data?.summary,c=vd(r.workspacePath),p=l?"Analyzing\u2026":u?"Details":"Analyze",b=u&&!l?"details":"analyze",h=B===r.workspacePath&&o,S=l||h,ut=l?' appearance="secondary"':"",or=Number(r.sessionCount)||0,nr=Number(r.interactionCount)||0;return`
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${i<t.length-1?"1px solid var(--border-subtle)":"none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d(r.workspacePath)}">
						${d(r.workspaceName)}
					</div>
				</div>
				<div style="${n.sessions}">${or}</div>
				<div style="${n.interactions}">${nr}</div>
				<div style="${n.score}">${d(c)}</div>
				<vscode-button class="btn-repo-action" data-action="${b}" data-workspace-path="${d(r.workspacePath)}" ${S?'disabled="true"':""}${ut} style="width: 110px; flex-shrink: 0;">
					${p}
				</vscode-button>
			</div>
		`}).join(""))}function _d(e,t,o){e.replaceChildren();let n=m("div","repo-details-card");n.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");let s=m("div","repo-details-card-header");s.setAttribute("style","display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");let r=m("div");r.setAttribute("style","font-size: 12px; color: var(--text-secondary);"),r.textContent="Repository: ";let i=m("span");i.setAttribute("style","color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;"),i.textContent=o,r.appendChild(i);let a=document.createElement("vscode-button");a.id="btn-switch-repository",a.setAttribute("style","min-width: 120px;"),a.textContent="Switch Repository",s.append(r,a),n.append(s,tr(t.data,B??void 0)),e.appendChild(n)}function X(){let e=document.getElementById("repo-list-pane"),t=document.getElementById("repo-list-pane-container"),o=document.getElementById("repo-details-pane"),n=document.getElementById("repo-details-pane-container");if(!e||!t||!o||!n||!H)return;let s=!!B&&!ge,r=s?H.workspaces.filter(l=>l.workspacePath===B):H.workspaces;if(t.classList.remove("repo-hygiene-pane-collapsed"),n.classList.toggle("repo-hygiene-pane-collapsed",!s),Rd(e,r,s),!s||!B){o.replaceChildren();return}let i=hd(B),a=ct.get(B);if(a?.data){_d(o,a,i);return}if(a?.error){k(o,`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${d(i)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${d(a.error)}</div>
			</div>
		`);return}k(o,`
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${d(i)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`)}function Pd(e,t){if(t){$e.delete(t),ct.set(t,{data:e,error:void 0}),me||(B=t,ge=!1),X();return}let o=document.getElementById("btn-analyse-repo");o&&(st=!1,o.disabled=!1,o.textContent="Analyze Repo for Best Practices",o.removeAttribute("appearance"));let n=document.getElementById("repo-analysis-results");if(n){n.replaceChildren();let s=m("div","repo-analysis-card");s.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;"),s.appendChild(tr(e,t)),n.appendChild(s)}}function Rs(e,t){if(t){$e.delete(t),ct.set(t,{data:void 0,error:e}),me||(B=t,ge=!1),X();return}let o=document.getElementById("btn-analyse-repo");o&&(st=!1,o.disabled=!1,o.textContent="Analyze Repo for Best Practices",o.removeAttribute("appearance"));let n=document.getElementById("repo-analysis-results");n&&k(n,`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${d(e)}</div>
			</div>
		`)}function Dd(){me=!1,ge=!0,B=null,$e.clear(),X();let e=document.getElementById("btn-analyse-all");if(e){e.disabled=!1,e.removeAttribute("appearance");let o=E?.customizationMatrix?.workspaces?.length||0;e.textContent=`Analyze All Repositories (${o})`}}async function Ld(){if(await Promise.resolve().then(()=>(fs(),ms)),!E){No("Loading usage analysis..."),Ut=setTimeout(()=>{let t=document.getElementById("root");if(t&&t.querySelector("#usage-loading-card")){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;",n.textContent="\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.",o.append(n,Kt()),t.textContent="",t.append(o)}},3e4);return}Xt(E.locale),Ot=E.use24HourTime!==!1,at=E.hideAutomaticToolCalls!==!1,Is(E.recentSessions);let e=E.sessionColumnSettings?.enabledColumns;if(Array.isArray(e)){let t=e.filter(o=>Ds.includes(o));Me=new Set(t)}Zs(E),Ls(),document.addEventListener("click",t=>{let n=t.target.getAttribute("data-suppress-tool");n&&(Qs(n),f.postMessage({command:"suppressUnknownTool",toolName:n}))})}Ld().catch(e=>{console.error("[Usage Analysis] Bootstrap failed:",e);let t=document.getElementById("root");if(t){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",n.textContent="Failed to initialize usage analysis. Please try refreshing.",o.append(n,Kt()),t.textContent="",t.append(o)}});})();
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
