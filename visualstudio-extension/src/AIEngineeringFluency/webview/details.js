"use strict";(()=>{var on=Object.defineProperty;var g=(t,e,o)=>()=>{if(o)throw o[0];try{return t&&(e=t(t=0)),e}catch(n){throw o=[n],n}};var Mt=(t,e)=>{for(var o in e)on(t,o,{get:e[o],enumerable:!0})};var Ue,Re,ot,Wt,ue,J,I,qt,nt,st=g(()=>{Ue=globalThis,Re=Ue.ShadowRoot&&(Ue.ShadyCSS===void 0||Ue.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),Wt=new WeakMap,ue=class{constructor(e,o,n){if(this._$cssResult$=!0,n!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(Re&&e===void 0){let n=o!==void 0&&o.length===1;n&&(e=Wt.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Wt.set(o,e))}return e}toString(){return this.cssText}},J=t=>new ue(typeof t=="string"?t:t+"",void 0,ot),I=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((n,s,r)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[r+1],t[0]);return new ue(o,t,ot)},qt=(t,e)=>{if(Re)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let n=document.createElement("style"),s=Ue.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,t.appendChild(n)}},nt=Re?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let n of e.cssRules)o+=n.cssText;return J(o)})(t):t});var vn,Cn,Sn,xn,En,Mn,$,Vt,wn,Dn,pe,ge,Pe,Yt,O,me=g(()=>{st();st();({is:vn,defineProperty:Cn,getOwnPropertyDescriptor:Sn,getOwnPropertyNames:xn,getOwnPropertySymbols:En,getPrototypeOf:Mn}=Object),$=globalThis,Vt=$.trustedTypes,wn=Vt?Vt.emptyScript:"",Dn=$.reactiveElementPolyfillSupport,pe=(t,e)=>t,ge={toAttribute(t,e){switch(e){case Boolean:t=t?wn:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},Pe=(t,e)=>!vn(t,e),Yt={attribute:!0,type:String,converter:ge,reflect:!1,useDefault:!1,hasChanged:Pe};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),$.litPropertyMetadata??($.litPropertyMetadata=new WeakMap);O=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=Yt){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(e,n,o);s!==void 0&&Cn(this.prototype,e,s)}}static getPropertyDescriptor(e,o,n){let{get:s,set:r}=Sn(this.prototype,e)??{get(){return this[o]},set(a){this[o]=a}};return{get:s,set(a){let c=s?.call(this);r?.call(this,a),this.requestUpdate(e,c,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Yt}static _$Ei(){if(this.hasOwnProperty(pe("elementProperties")))return;let e=Mn(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(pe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(pe("properties"))){let o=this.properties,n=[...xn(o),...En(o)];for(let s of n)this.createProperty(s,o[s])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let s of n)o.unshift(nt(s))}else e!==void 0&&o.push(nt(e));return o}static _$Eu(e,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return qt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,n){this._$AK(e,n)}_$ET(e,o){let n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:ge).toAttribute(o,n.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,o){let n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:ge;this._$Em=s;let c=a.fromAttribute(o,r.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(e,o,n,s=!1,r){if(e!==void 0){let a=this.constructor;if(s===!1&&(r=this[e]),n??(n=a.getPropertyOptions(e)),!((n.hasChanged??Pe)(r,o)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:n,reflect:s,wrapped:r},a){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,a??o??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(o=void 0),this._$AL.set(e,o)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:a}=r,c=this[s];a!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,r,c)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(e){}firstUpdated(e){}};O.elementStyles=[],O.shadowRootOptions={mode:"open"},O[pe("elementProperties")]=new Map,O[pe("finalized")]=new Map,Dn?.({ReactiveElement:O}),($.reactiveElementVersions??($.reactiveElementVersions=[])).push("2.1.2")});function ao(t,e){if(!ut(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Xt!==void 0?Xt.createHTML(e):e}function X(t,e,o=t,n){if(e===w)return e;let s=n!==void 0?o._$Co?.[n]:o._$Cl,r=ye(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(t),s._$AT(t,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(e=X(t,s._$AS(t,e.values),s,n)),e}var he,Jt,Ie,Xt,no,L,so,An,K,be,ye,ut,_n,rt,fe,Zt,Qt,F,eo,to,ro,pt,_,ar,ir,w,T,oo,H,Un,ke,at,Te,Z,it,ct,lt,dt,Rn,io,Q=g(()=>{he=globalThis,Jt=t=>t,Ie=he.trustedTypes,Xt=Ie?Ie.createPolicy("lit-html",{createHTML:t=>t}):void 0,no="$lit$",L=`lit$${Math.random().toFixed(9).slice(2)}$`,so="?"+L,An=`<${so}>`,K=document,be=()=>K.createComment(""),ye=t=>t===null||typeof t!="object"&&typeof t!="function",ut=Array.isArray,_n=t=>ut(t)||typeof t?.[Symbol.iterator]=="function",rt=`[ 	
\f\r]`,fe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Zt=/-->/g,Qt=/>/g,F=RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),eo=/'/g,to=/"/g,ro=/^(?:script|style|textarea|title)$/i,pt=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),_=pt(1),ar=pt(2),ir=pt(3),w=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),oo=new WeakMap,H=K.createTreeWalker(K,129);Un=(t,e)=>{let o=t.length-1,n=[],s,r=e===2?"<svg>":e===3?"<math>":"",a=fe;for(let c=0;c<o;c++){let i=t[c],l,d,u=-1,p=0;for(;p<i.length&&(a.lastIndex=p,d=a.exec(i),d!==null);)p=a.lastIndex,a===fe?d[1]==="!--"?a=Zt:d[1]!==void 0?a=Qt:d[2]!==void 0?(ro.test(d[2])&&(s=RegExp("</"+d[2],"g")),a=F):d[3]!==void 0&&(a=F):a===F?d[0]===">"?(a=s??fe,u=-1):d[1]===void 0?u=-2:(u=a.lastIndex-d[2].length,l=d[1],a=d[3]===void 0?F:d[3]==='"'?to:eo):a===to||a===eo?a=F:a===Zt||a===Qt?a=fe:(a=F,s=void 0);let f=a===F&&t[c+1].startsWith("/>")?" ":"";r+=a===fe?i+An:u>=0?(n.push(l),i.slice(0,u)+no+i.slice(u)+L+f):i+L+(u===-2?c:f)}return[ao(t,r+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},ke=class t{constructor({strings:e,_$litType$:o},n){let s;this.parts=[];let r=0,a=0,c=e.length-1,i=this.parts,[l,d]=Un(e,o);if(this.el=t.createElement(l,n),H.currentNode=this.el.content,o===2||o===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=H.nextNode())!==null&&i.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(let u of s.getAttributeNames())if(u.endsWith(no)){let p=d[a++],f=s.getAttribute(u).split(L),h=/([.?@])?(.*)/.exec(p);i.push({type:1,index:r,name:h[2],strings:f,ctor:h[1]==="."?it:h[1]==="?"?ct:h[1]==="@"?lt:Z}),s.removeAttribute(u)}else u.startsWith(L)&&(i.push({type:6,index:r}),s.removeAttribute(u));if(ro.test(s.tagName)){let u=s.textContent.split(L),p=u.length-1;if(p>0){s.textContent=Ie?Ie.emptyScript:"";for(let f=0;f<p;f++)s.append(u[f],be()),H.nextNode(),i.push({type:2,index:++r});s.append(u[p],be())}}}else if(s.nodeType===8)if(s.data===so)i.push({type:2,index:r});else{let u=-1;for(;(u=s.data.indexOf(L,u+1))!==-1;)i.push({type:7,index:r}),u+=L.length-1}r++}}static createElement(e,o){let n=K.createElement("template");return n.innerHTML=e,n}};at=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:n}=this._$AD,s=(e?.creationScope??K).importNode(o,!0);H.currentNode=s;let r=H.nextNode(),a=0,c=0,i=n[0];for(;i!==void 0;){if(a===i.index){let l;i.type===2?l=new Te(r,r.nextSibling,this,e):i.type===1?l=new i.ctor(r,i.name,i.strings,this,e):i.type===6&&(l=new dt(r,this,e)),this._$AV.push(l),i=n[++c]}a!==i?.index&&(r=H.nextNode(),a++)}return H.currentNode=K,s}p(e){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,o),o+=n.strings.length-2):n._$AI(e[o])),o++}},Te=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,n,s){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=X(this,e,o),ye(e)?e===T||e==null||e===""?(this._$AH!==T&&this._$AR(),this._$AH=T):e!==this._$AH&&e!==w&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):_n(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==T&&ye(this._$AH)?this._$AA.nextSibling.data=e:this.T(K.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=ke.createElement(ao(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let r=new at(s,this),a=r.u(this.options);r.p(o),this.T(a),this._$AH=r}}_$AC(e){let o=oo.get(e.strings);return o===void 0&&oo.set(e.strings,o=new ke(e)),o}k(e){ut(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let r of e)s===o.length?o.push(n=new t(this.O(be()),this.O(be()),this,this.options)):n=o[s],n._$AI(r),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let n=Jt(e).nextSibling;Jt(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,n,s,r){this.type=1,this._$AH=T,this._$AN=void 0,this.element=e,this.name=o,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=T}_$AI(e,o=this,n,s){let r=this.strings,a=!1;if(r===void 0)e=X(this,e,o,0),a=!ye(e)||e!==this._$AH&&e!==w,a&&(this._$AH=e);else{let c=e,i,l;for(e=r[0],i=0;i<r.length-1;i++)l=X(this,c[n+i],o,i),l===w&&(l=this._$AH[i]),a||(a=!ye(l)||l!==this._$AH[i]),l===T?e=T:e!==T&&(e+=(l??"")+r[i+1]),this._$AH[i]=l}a&&!s&&this.j(e)}j(e){e===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},it=class extends Z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===T?void 0:e}},ct=class extends Z{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==T)}},lt=class extends Z{constructor(e,o,n,s,r){super(e,o,n,s,r),this.type=5}_$AI(e,o=this){if((e=X(this,e,o,0)??T)===w)return;let n=this._$AH,s=e===T&&n!==T||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==T&&(n===T||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},dt=class{constructor(e,o,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}},Rn=he.litHtmlPolyfillSupport;Rn?.(ke,Te),(he.litHtmlVersions??(he.litHtmlVersions=[])).push("3.3.3");io=(t,e,o)=>{let n=o?.renderBefore??e,s=n._$litPart$;if(s===void 0){let r=o?.renderBefore??null;n._$litPart$=s=new Te(e.insertBefore(be(),r),r,void 0,o??{})}return s._$AI(t),s}});var ve,B,Pn,co=g(()=>{me();me();Q();Q();ve=globalThis,B=class extends O{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let e=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=e.firstChild),e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=io(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};B._$litElement$=!0,B.finalized=!0,ve.litElementHydrateSupport?.({LitElement:B});Pn=ve.litElementPolyfillSupport;Pn?.({LitElement:B});(ve.litElementVersions??(ve.litElementVersions=[])).push("4.2.2")});var lo=g(()=>{});var R=g(()=>{me();Q();co();lo()});var uo=g(()=>{});function y(t){return(e,o)=>typeof o=="object"?On(t,e,o):((n,s,r)=>{let a=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),a?Object.getOwnPropertyDescriptor(s,r):void 0})(t,e,o)}var In,On,gt=g(()=>{me();In={attribute:!0,type:String,converter:ge,reflect:!1,hasChanged:Pe},On=(t=In,e,o)=>{let{kind:n,metadata:s}=o,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),r.set(o.name,t),n==="accessor"){let{name:a}=o;return{set(c){let i=e.get.call(this);e.set.call(this,c),this.requestUpdate(a,i,t,!0,c)},init(c){return c!==void 0&&this.C(a,void 0,t,c),c}}}if(n==="setter"){let{name:a}=o;return function(c){let i=this[a];e.call(this,c),this.requestUpdate(a,i,t,!0,c)}}throw Error("Unsupported decorator location: "+n)}});function mt(t){return y({...t,state:!0,attribute:!1})}var po=g(()=>{gt();});var go=g(()=>{});var ee=g(()=>{});var mo=g(()=>{ee();});var fo=g(()=>{ee();});var ho=g(()=>{ee();});var bo=g(()=>{ee();});var yo=g(()=>{ee();});var $e=g(()=>{uo();gt();po();go();mo();fo();ho();bo();yo()});var Le,Be,te,ft=g(()=>{Le={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Be=t=>(...e)=>({_$litDirective$:t,values:e}),te=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,n){this._$Ct=e,this._$AM=o,this._$Ci=n}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}}});var Ne,ko=g(()=>{Q();ft();Ne=Be(class extends te{constructor(t){if(super(t),t.type!==Le.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in e)e[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(e)}let o=t.element.classList;for(let n of this.st)n in e||(o.remove(n),this.st.delete(n));for(let n in e){let s=!!e[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return w}})});var ht=g(()=>{ko()});var je,To,vo,N,oe,Fe=g(()=>{R();je="2.5.1",To="__vscodeElements_disableRegistryWarning__",vo=(t,e)=>{console.warn(e?`[VSCode Elements] ${t}
%o`:`${t}
%o`,e)},N=class extends B{get version(){return je}warn(e){vo(e,this)}},oe=t=>e=>{if(!customElements.get(t)){customElements.define(t,e);return}if(To in window)return;let s=document.createElement(t)?.version,r="";s?s!==je?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${je}", while the other one is "${s}".`):r+=`is already registered by the same version of VSCode Elements (${je}).`:r+="is already registered by an unknown custom element handler class.",vo(`The custom element "${t}" ${r}
To suppress this warning, set window.${To} to true`)}});var ne,Co=g(()=>{Q();ne=t=>t??T});var bt=g(()=>{Co()});var So=g(()=>{ft()});var yt,xo,Eo=g(()=>{R();So();yt=class extends te{constructor(e){if(super(e),this._prevProperties={},e.type!==Le.PROPERTY||e.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(e,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?e.element.style.setProperty(n,s):e.element.style[n]=s,this._prevProperties[n]=s)}),w}render(e){return w}},xo=Be(yt)});var se,He=g(()=>{R();se=I`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var $n,Mo,wo=g(()=>{R();He();$n=[se,I`
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
  `],Mo=$n});var G,Ce,D,Do=g(()=>{R();$e();ht();bt();Fe();Eo();wo();G=function(t,e,o,n){var s=arguments.length,r=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,o,n);else for(var c=t.length-1;c>=0;c--)(a=t[c])&&(r=(s<3?a(r):s>3?a(e,o,r):a(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r},D=Ce=class extends N{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();let{href:e,nonce:o}=this._getStylesheetConfig();Ce.stylesheetHref=e,Ce.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let e=document.getElementById("vscode-codicon-stylesheet"),o=e?.getAttribute("href")||void 0,n=e?.nonce||void 0;if(!e){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:e,nonce:o}=Ce,n=_`<span
      class=${Ne({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${xo({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?_` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:_` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return _`
      <link
        rel="stylesheet"
        href=${ne(e)}
        nonce=${ne(o)}
      />
      ${s}
    `}};D.styles=Mo;D.stylesheetHref="";D.nonce="";G([y()],D.prototype,"label",void 0);G([y({type:String})],D.prototype,"name",void 0);G([y({type:Number})],D.prototype,"size",void 0);G([y({type:Boolean,reflect:!0})],D.prototype,"spin",void 0);G([y({type:Number,attribute:"spin-duration"})],D.prototype,"spinDuration",void 0);G([y({type:Boolean,reflect:!0,attribute:"action-icon"})],D.prototype,"actionIcon",void 0);D=Ce=G([oe("vscode-icon")],D)});var Ao=g(()=>{Do()});function Ke(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var kt=g(()=>{});var Ln,Bn,_o,Uo=g(()=>{R();He();kt();Ln=J(Ke()),Bn=[se,I`
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
      font-family: var(--vscode-font-family, ${Ln});
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
  `],_o=Bn});var v,k,Ro=g(()=>{R();$e();ht();Fe();Ao();Uo();bt();v=function(t,e,o,n){var s=arguments.length,r=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,o,n);else for(var c=t.length-1;c>=0;c--)(a=t[c])&&(r=(s<3?a(r):s>3?a(e,o,r):a(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r},k=class extends N{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(e){super.update(e),e.has("value")&&this._internals.setFormValue(this.value),e.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(e){if((e.key==="Enter"||e.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(e){e.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(e){let o=e.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let e=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=e?_`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${ne(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:T,r=o?_`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${ne(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:T;return _`
      <div
        class=${Ne(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${r}
        <slot name="content-after"></slot>
      </div>
    `}};k.styles=_o;k.formAssociated=!0;v([y({type:Boolean,reflect:!0})],k.prototype,"autofocus",void 0);v([y({type:Number,reflect:!0})],k.prototype,"tabIndex",void 0);v([y({type:Boolean,reflect:!0})],k.prototype,"secondary",void 0);v([y({type:Boolean,reflect:!0})],k.prototype,"block",void 0);v([y({reflect:!0})],k.prototype,"role",void 0);v([y({type:Boolean,reflect:!0})],k.prototype,"disabled",void 0);v([y()],k.prototype,"icon",void 0);v([y({type:Boolean,reflect:!0,attribute:"icon-spin"})],k.prototype,"iconSpin",void 0);v([y({type:Number,reflect:!0,attribute:"icon-spin-duration"})],k.prototype,"iconSpinDuration",void 0);v([y({attribute:"icon-after"})],k.prototype,"iconAfter",void 0);v([y({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],k.prototype,"iconAfterSpin",void 0);v([y({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],k.prototype,"iconAfterSpinDuration",void 0);v([y({type:Boolean,reflect:!0})],k.prototype,"focused",void 0);v([y({type:String,reflect:!0})],k.prototype,"name",void 0);v([y({type:Boolean,reflect:!0,attribute:"icon-only"})],k.prototype,"iconOnly",void 0);v([y({reflect:!0})],k.prototype,"type",void 0);v([y()],k.prototype,"value",void 0);v([mt()],k.prototype,"_hasContentBefore",void 0);v([mt()],k.prototype,"_hasContentAfter",void 0);k=v([oe("vscode-button")],k)});var Po={};Mt(Po,{VscodeButton:()=>k});var Io=g(()=>{Ro()});var Nn,jn,Oo,$o=g(()=>{R();He();kt();Nn=J(Ke()),jn=[se,I`
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
      font-family: var(--vscode-font-family, ${Nn});
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
  `],Oo=jn});var Lo,re,Bo=g(()=>{R();$e();Fe();$o();Lo=function(t,e,o,n){var s=arguments.length,r=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,o,n);else for(var c=t.length-1;c>=0;c--)(a=t[c])&&(r=(s<3?a(r):s>3?a(e,o,r):a(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r},re=class extends N{constructor(){super(...arguments),this.variant="default"}render(){return _`<div class="root"><slot></slot></div>`}};re.styles=Oo;Lo([y({reflect:!0})],re.prototype,"variant",void 0);re=Lo([oe("vscode-badge")],re)});var No={};Mt(No,{VscodeBadge:()=>re});var jo=g(()=>{Bo()});function Y(t){let e=globalThis.window;return e?e[t]:void 0}var nn=Y("__MODEL_PRICING__"),Je={};for(let[t,e]of Object.entries(nn?.pricing??{}))e.displayNames&&e.displayNames.length>0&&(Je[t]=e.displayNames[0]);var wt=" (Custom)";function Ee(t){try{return decodeURIComponent(t)}catch{return t}}function Xe(t){let e=t.split("/");if(!(e.length!==3||e.some(o=>o.trim()==="")))return{source:Ee(e[0]),providerName:Ee(e[1]),modelId:Ee(e[2])}}var Me=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i;function we(t){let e=[],o=a=>{a&&!e.includes(a)&&e.push(a)},n=a=>{o(a),o(a.replace(/(\d+)-(\d+)(?=-|$)/,"$1.$2"))},s=t.replace(/^copilot\//,"");n(s);let r=Xe(s);return r&&n(r.modelId),Me.test(s)&&n(s.replace(Me,"")),e}function De(t){let e=Xe(t);return e?`${e.providerName}${wt}`:void 0}function Dt(t){return t.endsWith(wt)}function Ze(t){for(let o of we(t))if(Je[o])return Je[o];let e=Xe(t);return e?e.modelId:Me.test(t)?t.replace(Me,""):Ee(t)}var At={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",Hermes:"\u{1FABD}",JetBrains:"\u{1F9E9}","Kilo Code":"\u{1F7E3}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function _t(t){return At[t]??"\u{1F4DD}"}var sn=Y("__TOKEN_ESTIMATORS__"),rn=sn?.estimators??{},Ae,Ut=!0;function Rt(t){Ut=t}function Pt(t){return _t(t)}function It(t){return 1/(rn[t]??.25)}function an(t,e){return new Intl.NumberFormat(Ae,{minimumFractionDigits:e,maximumFractionDigits:e}).format(t)}function S(t,e=1){return`${an(t,e)}%`}function x(t){return t.toLocaleString(Ae)}function m(t){return Ut?new Intl.NumberFormat(Ae,{notation:"compact",maximumFractionDigits:1}).format(t):x(t)}function E(t){return new Intl.NumberFormat(Ae,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}function b(t,e,o){let n=document.createElement(t);return e&&(n.className=e),o!==void 0&&(n.textContent=o),n}function de(t,e,o,n){let s=document.createElement(t);n&&(s.className=n);let r=document.createElement("span");return r.className=`codicon codicon-${e}`,s.append(r,document.createTextNode(` ${o}`)),s}function cn(t,e){let o=document.createElement("span");return o.className=`codicon codicon-${t} nav-icon`,e&&o.style.setProperty("--icon-accent",e),o}function ln(t,e){e.appearance&&t.setAttribute("appearance",e.appearance),e.hidden&&(t.hidden=!0),e.active&&(t.classList.add("nav-active"),t.setAttribute("disabled",""),t.setAttribute("aria-current","page"))}function Ot(t,e,o){let n=document.createElement("vscode-button");if(typeof t=="string")return n.id=t,n.textContent=e||"",o&&n.setAttribute("appearance",o),n;let s=t;return n.id=s.id,s.icon?n.append(cn(s.icon,s.iconColor),document.createTextNode(s.label)):n.textContent=s.label,ln(n,s),n}var Qe={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency","share.exportTitle":"AI Engineering Fluency Score","share.exportReportLabel":"Report","usage.contextPressure.compactedLabel":"\u{1F5DC}\uFE0F Sessions compacted","usage.contextPressure.ofCount":"{0} of {1}","usage.contextPressure.compactedShare":"{0}% of sessions with context data lost earlier turns to automatic compaction","usage.contextPressure.noneCompacted":"No session ran out of context window in this period","usage.contextPressure.compactedTooltip":"Sessions where the client automatically compacted or truncated the history at least once, counted per session rather than per compaction event","usage.contextPressure.nearLimitLabel":"\u26A0\uFE0F Sessions near the limit","usage.contextPressure.worstFill":"Fullest session reached {0}% of its window","usage.contextPressure.nearLimitTooltip":"Copilot CLI sessions that filled at least {0}% of their context window without compacting \u2014 the early-warning band before context starts getting dropped"},$t={...Qe};function Lt(t){let e={};for(let[o,n]of Object.entries(t))typeof n=="string"&&n!==o&&(e[o]=n);$t={...Qe,...e}}function Bt(t){return $t[t]||Qe[t]||t}var dn="en";function Nt(t){dn=t}var un={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},pn=new Proxy({},{get(t,e){let o=un[e];if(!o)return;let{labelKey:n,...s}=o;return{...s,label:Bt(n)}}});var gn=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-efficiency","btn-environmental","btn-diagnostics","btn-dashboard"];function jt(t,e){return gn.filter(o=>o!=="btn-dashboard"||e).map(o=>({...pn[o],active:o===t}))}function mn(t){let e=[],o=t.location?.origin;o&&o!=="null"&&e.push(o);let n=t.location?.href,s=n?/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(n):null;return s&&!e.includes(s[0])&&e.push(s[0]),e}function fn(t,e,o){return t==null||t===e||t===e.parent||t===e.top?!0:!!o&&mn(e).includes(o)}function _e(t,e){window.addEventListener("message",o=>{if(!fn(o.source,window,o.origin)){e?.(o);return}t(o.data)})}function Ft(t){return`ext-point-${t}`}function Ht(t,e){let o=document.querySelector(".button-row");if(!o)return;let n=new Set(e.map(s=>s.id));for(let s of Array.from(o.querySelectorAll('[id^="ext-point-"]'))){let r=s.id.slice(10);n.has(r)||s.remove()}for(let s of e){if(document.getElementById(Ft(s.id)))continue;let r=document.createElement("vscode-button");r.id=Ft(s.id),r.textContent=s.label,r.addEventListener("click",()=>{t.postMessage({command:"extensionPointAction",buttonId:s.id})}),o.append(r)}}function Kt(t){Ht(t,window.__EXTENSION_POINT_BUTTONS__??[]),!window.__extensionPointButtonsListenerRegistered__&&(window.__extensionPointButtonsListenerRegistered__=!0,_e(e=>{e?.command==="extensionPointButtonsUpdated"&&Array.isArray(e.buttons)&&Ht(t,e.buttons)}))}var Gt=`/**
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
`;var zt=`body {
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
`;var et=new Set(["VS Code","VS Code Insiders","VS Code Exploration","VS Code Server","VS Code Server (Insiders)","VSCodium","Visual Studio","JetBrains","Copilot CLI","Copilot CLI (App)","MS Scout (Copilot CLI)"]);var Fs=1/1e11;var kn=[["anthropic","Anthropic"],["claude","Anthropic"],["codestral","Mistral AI"],["devstral","Mistral AI"],["gemini","Google"],["goldeneye","xAI"],["google","Google"],["gpt","OpenAI"],["grok","xAI"],["magistral","Mistral AI"],["mai-","Microsoft"],["ministral","Mistral AI"],["mistral","Mistral AI"],["o1","OpenAI"],["o3","OpenAI"],["o4","OpenAI"],["pixtral","Mistral AI"],["qwen","Alibaba"],["raptor","xAI"]];function Tn(t){let e=De(t);if(e)return e;let o=we(t).flatMap(n=>kn.filter(([s])=>n.toLowerCase().startsWith(s))).at(0);return o?o[1]:"Other"}function tt(t,e){let o=De(e);return o||(et.has(t)?"GitHub Copilot":Tn(e))}var P=acquireVsCodeApi(),z=Y("__INITIAL_DETAILS__");console.log("[CopilotTokenTracker] details webview loaded");if(z?.localization){Lt(z.localization);let t=z.localization.__language__||"en";Nt(t),console.log("[CopilotTokenTracker] Webview localization initialized for language:",t)}var V=z?.sortSettings,W=V?.editor?.key??"name",ce=V?.editor?.dir??"asc",q=V?.model?.key??"name",le=V?.model?.dir??"asc",ae=V?.modelOtherExpanded??!1,ie=V?.editorOtherExpanded??!1,j=new Set(V?.excludedProviders??[]),Tt=null;function M(t){return t/30*365.25}function C(t,e){let o=document.createElement("td");return o.className="value-right align-right",o.textContent=t,e!==void 0&&o.append(b("div","muted",e)),o}function Fn(t,e,o,n){let s=document.createElement("td"),r=document.createElement("span");r.className="metric-label";let a=document.createElement("span");a.textContent=t,o&&(a.style.color=o);let c=document.createElement("span");if(c.textContent=e,n){r.title=n,r.style.cursor="help";let i=document.createElement("span");i.textContent=" \u2139\uFE0F",i.style.cssText="font-size:0.75em; opacity:0.6;",c.append(i)}return r.append(a,c),s.append(r),s}function zo(t,e,o,n){let s=document.createElement("thead"),r=document.createElement("tr"),a=[];function c(){a.forEach((i,l)=>{i.textContent=`${t[l].icon} ${t[l].text}${Ho(t[l].key,e(),o())}`})}return t.forEach((i,l)=>{let d=document.createElement("th");d.className=l===0?"":"align-right",d.style.cursor="pointer",d.style.userSelect="none",d.title=`Sort by ${i.text}`;let u=b("div","period-header");u.textContent=`${i.icon} ${i.text}${Ho(i.key,e(),o())}`,d.append(u),a.push(u),d.addEventListener("click",()=>{n(i.key),c()}),r.append(d)}),s.append(r),{thead:s,updateHeaders:c}}function vt(t){Rt(t.compactNumbers!==!1),Tt=t;let e=document.getElementById("root");if(!e)return;let o=xt(t),n=Math.round(M(t.last30Days.tokens+t.last30Days.thinkingTokens)),s=Math.round(M(t.last30Days.sessions)),r=M(t.last30Days.co2),a=M(t.last30Days.waterUsage),c=M(Se(t.last30Days,o)),i=M(t.last30Days.estimatedCostCopilot??0),l=M(t.last30Days.treesEquivalent);Kn(e,t,{projectedTokens:n,projectedSessions:s,projectedCo2:r,projectedWater:a,projectedCost:c,projectedCostCopilot:i,projectedTrees:l}),gs()}function Hn(){Tt&&vt(Tt)}function Kn(t,e,o){let n=new Date(e.lastUpdated);t.replaceChildren();let s=document.createElement("style");s.textContent=Gt;let r=document.createElement("style");r.textContent=zt;let a=b("div","container"),c=b("div","header"),i=b("div","header-left");i.append(b("div","title","AI Engineering Fluency"));let l=zn(e);l&&i.append(l);let d=b("div","button-row");d.append(...jt("btn-details",!!e.backendConfigured).map(U=>Ot(U))),c.append(i,d);let u=b("div","footer",`Last updated: ${n.toLocaleString()} \xB7 Updates every 5 minutes`),p=b("div","sections");if((e.today.tokens??0)===0&&(e.last30Days.tokens??0)===0&&(e.lastMonth.tokens??0)===0)p.append(ps());else{let U=Zn(e);U&&p.append(U)}p.append(Vn(e,o));let h=as(e);h&&p.append(h);let A=us(e);A&&p.append(A),a.append(c,p,u),t.append(s,r,a)}function Wo(t){return Object.values(t.modelUsage).reduce((e,o)=>e+o.inputTokens,0)}function qo(t){return Object.values(t.modelUsage).reduce((e,o)=>e+o.outputTokens,0)}function Ct(t){return(t.actualTokens||0)>0}function Ge(t){return Ct(t)?S((t.actualTokens-t.estimatedTokens)/t.actualTokens*100):"\u2014"}function ze(t){return Ct(t)?m(Wo(t)):"\u2014"}function We(t){return Ct(t)?m(qo(t)):"\u2014"}function qe(t){let e=Wo(t)+qo(t);return(t.actualTokens??0)>0?m(t.tokens+t.thinkingTokens):m(e>0?e:t.tokens)}function Gn(t){return t.today.cachedTokens||t.last30Days.cachedTokens||t.month.cachedTokens||t.lastMonth.cachedTokens?[{label:"Cached tokens",labelTooltip:'Cache-read tokens \u2014 already included in "Input tokens" above, shown separately because they are billed at a lower rate.',icon:"\u26A1",color:"#34d399",today:m(t.today.cachedTokens||0),last30Days:m(t.last30Days.cachedTokens||0),month:m(t.month.cachedTokens||0),lastMonth:m(t.lastMonth.cachedTokens||0),projected:"\u2014"}]:[]}function zn(t){if(!t.copilotPlan)return null;let e=t.copilotPlan,o=e.monthlyAiCreditsUsd>0?`$${e.monthlyAiCreditsUsd} credits/month`:"no credits",n=b("div","plan-badge",`\u{1F3F7}\uFE0F ${e.planName} \xB7 ${o}`);return n.title=`Your active GitHub Copilot subscription plan (ID: ${e.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`,n}function Wn(t,e){let o=xt(t),n=[{label:"Total tokens",labelTooltip:"All LLM API tokens counted across every call in this period \u2014 matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.",icon:"\u{1F7E3}",color:"#c37bff",today:qe(t.today),last30Days:qe(t.last30Days),month:qe(t.month),lastMonth:qe(t.lastMonth),projected:m(e.projectedTokens)},{label:"Input tokens",labelTooltip:"Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).",icon:"\u2B06\uFE0F",color:"#c37bff",today:ze(t.today),last30Days:ze(t.last30Days),month:ze(t.month),lastMonth:ze(t.lastMonth),projected:"\u2014"},{label:"Output tokens",icon:"\u2B07\uFE0F",color:"#c37bff",today:We(t.today),last30Days:We(t.last30Days),month:We(t.month),lastMonth:We(t.lastMonth),projected:"\u2014"},...Gn(t),{label:"Tokens (user estimated)",icon:"\u{1F4DD}",color:"#b39ddb",today:m(t.today.estimatedTokens),last30Days:m(t.last30Days.estimatedTokens),month:m(t.month.estimatedTokens),lastMonth:m(t.lastMonth.estimatedTokens),projected:"\u2014"},{label:"Service overhead %",icon:"\u2601\uFE0F",color:"#90a4ae",today:Ge(t.today),last30Days:Ge(t.last30Days),month:Ge(t.month),lastMonth:Ge(t.lastMonth),projected:"\u2014"},{label:"Thinking tokens",icon:"\u{1F9E0}",color:"#a78bfa",today:m(t.today.thinkingTokens||0),last30Days:m(t.last30Days.thinkingTokens||0),month:m(t.month.thinkingTokens||0),lastMonth:m(t.lastMonth.thinkingTokens||0),projected:"\u2014"}],r=[...Qn(o)?[]:[{label:"Estimated cost (selected providers)",labelTooltip:"Sum of estimated cost across the providers selected in the Cost by Provider filter below \u2014 GitHub Copilot uses UBB AI Credit rates, other providers use their own API pricing.",icon:"\u{1F4B5}",color:"#7ce38b",today:E(Se(t.today,o)),last30Days:E(Se(t.last30Days,o)),month:E(Se(t.month,o)),lastMonth:E(Se(t.lastMonth,o)),projected:E(e.projectedCost)}],{label:"Estimated cost (GitHub Copilot UBB)",labelTooltip:"Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.",icon:"\u{1F7E2}",color:"#7ce38b",today:E(t.today.estimatedCostCopilot??0),last30Days:E(t.last30Days.estimatedCostCopilot??0),month:E(t.month.estimatedCostCopilot??0),lastMonth:E(t.lastMonth.estimatedCostCopilot??0),projected:E(e.projectedCostCopilot??0)}],a=[{label:"Sessions",icon:"\u{1F4C2}",color:"#66aaff",today:x(t.today.sessions),last30Days:x(t.last30Days.sessions),month:x(t.month.sessions),lastMonth:x(t.lastMonth.sessions),projected:x(e.projectedSessions)},{label:"Sessions with sub-agents",labelTooltip:"Sessions that delegated work to sub-agents in this period (task/read_agent/write_agent/list_agents, runSubagent, delegate_* tool calls detected in the session logs).",icon:"\u{1F916}",color:"#66aaff",today:x(t.today.subAgentSessions??0),last30Days:x(t.last30Days.subAgentSessions??0),month:x(t.month.subAgentSessions??0),lastMonth:x(t.lastMonth.subAgentSessions??0),projected:"\u2014"},{label:"Average interactions/session",icon:"\u{1F4AC}",color:"#8ce0ff",today:x(t.today.avgInteractionsPerSession),last30Days:x(t.last30Days.avgInteractionsPerSession),month:x(t.month.avgInteractionsPerSession),lastMonth:x(t.lastMonth.avgInteractionsPerSession),projected:"\u2014"},{label:"Average tokens/session",icon:"\u{1F522}",color:"#7ce38b",today:m(t.today.avgTokensPerSession),last30Days:m(t.last30Days.avgTokensPerSession),month:m(t.month.avgTokensPerSession),lastMonth:m(t.lastMonth.avgTokensPerSession),projected:"\u2014"}];return[{heading:"\u{1F522} Tokens",rows:n},{heading:"\u{1F4B0} Cost",rows:r},{heading:"\u{1F4AC} Activity",rows:a}]}function qn(t){let e=document.createElement("tr");e.className="group-row";let o=document.createElement("td");return o.colSpan=6,o.textContent=t,e.append(o),e}function Vo(t,e){let o=document.createElement("tr");o.className="no-data-row";let n=document.createElement("td");return n.colSpan=t,n.textContent=e,o.append(n),o}function Vn(t,e){let o=b("div","section");o.append(de("h3","graph","Key Metrics"));let n=document.createElement("table");n.className="stats-table";let s=document.createElement("thead"),r=document.createElement("tr");[{icon:"\u{1F4CA}",text:"Metric"},{icon:"\u{1F4C5}",text:"Today"},{icon:"\u{1F4C8}",text:"Last 30 Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month"},{icon:"\u{1F4C6}",text:"Previous Month"},{icon:"\u{1F30D}",text:"Projected Year"}].forEach((i,l)=>{let d=document.createElement("th");d.className=l===0?"":"align-right";let u=b("div","period-header");u.textContent=`${i.icon} ${i.text}`,d.append(u),r.append(d)}),s.append(r),n.append(s);let c=document.createElement("tbody");return Wn(t,e).forEach(i=>{c.append(qn(i.heading)),i.rows.forEach(l=>{let d=document.createElement("tr");d.append(Fn(l.icon,l.label,l.color,l.labelTooltip),C(l.today),C(l.last30Days),C(l.month),C(l.lastMonth),C(l.projected)),c.append(d)})}),n.append(c),o.append(n),o}var Fo={"GitHub Copilot":"\u{1F419}",Anthropic:"\u{1F170}\uFE0F",Google:"\u{1F537}",OpenAI:"\u{1F7E2}","Mistral AI":"\u{1F32C}\uFE0F",xAI:"\u2716\uFE0F",Microsoft:"\u{1FA9F}",Alibaba:"\u{1F409}",Other:"\u2754"};function Yn(t){return Fo[t]?Fo[t]:Dt(t)?"\u{1F9E9}":"\u{1F4B5}"}function Jn(t,e){let o=j.has(e),n=b("div",`provider-card${o?" provider-card-excluded":""}`);n.tabIndex=0,n.setAttribute("role","button"),n.setAttribute("aria-pressed",String(!o)),n.title=o?`${e} is hidden \u2014 click to show it again and include it in the totals below.`:`Click to hide ${e} \u2014 filters it out of the totals and the Editor/Model usage lists below.`,n.append(b("div","provider-card-label",`${Yn(e)} ${e}`),b("div","provider-card-value",E(t.month.billingGroupCosts?.[e]||0)),b("div","provider-card-sub","Cost this month"));let s=()=>{j.has(e)?j.delete(e):j.add(e),xe(),Hn()};return n.addEventListener("click",s),n.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),s())}),n}function Xn(t,e){let o=Yo(e),n=b("div","provider-card provider-card-total");return n.title=`Sum of ${o.length} of ${e.length} selected provider(s).`,n.append(b("div","provider-card-label","\u2211 Total (selected)"),b("div","provider-card-value",E(Jo(t.month.billingGroupCosts,o))),b("div","provider-card-sub","Cost this month")),n}function Zn(t){let o=xt(t).filter(r=>(t.month.billingGroupCosts?.[r]??0)>0);if(o.length<=1)return null;let n=b("div","section");n.append(de("h3","credit-card","Cost by Provider")),n.append(b("div","provider-panel-hint","Click a provider to hide/show it \u2014 this also filters the Editor & Model usage lists below."));let s=b("div","provider-cards");return s.append(Xn(t,o)),o.forEach(r=>s.append(Jn(t,r))),n.append(s),n}function Ho(t,e,o){return t!==e?" \u2195":o==="asc"?" \u2191":" \u2193"}function xe(){P.postMessage({command:"saveSortSettings",settings:{editor:{key:W,dir:ce},model:{key:q,dir:le},modelOtherExpanded:ae,editorOtherExpanded:ie,excludedProviders:Array.from(j)}})}var St=["today","last30Days","month","lastMonth"];function xt(t){let e=new Set;return St.forEach(o=>{Object.keys(t[o].billingGroupCosts??{}).forEach(n=>e.add(n))}),Array.from(e).sort((o,n)=>o==="GitHub Copilot"?-1:n==="GitHub Copilot"?1:o.localeCompare(n))}function Qn(t){return t.every(e=>e==="GitHub Copilot")}function Yo(t){return t.filter(e=>!j.has(e))}function Jo(t,e){return t?e.reduce((o,n)=>o+(t[n]||0),0):0}function Se(t,e){return e.length===0?t.estimatedCostCopilot??t.estimatedCost??0:Jo(t.billingGroupCosts,Yo(e))}function es(t,e){let o=new Set;return St.forEach(n=>{let s=t[n].editorModelUsage?.[e];s&&Object.keys(s).forEach(r=>o.add(tt(e,r)))}),o}function ts(t,e){let o=new Set;return St.forEach(n=>{let s=t[n].editorModelUsage;s&&Object.keys(s).forEach(r=>{s[r][e]&&o.add(tt(r,e))})}),o}function Xo(t){return j.size===0||t.size===0?!0:Array.from(t).some(e=>!j.has(e))}function Ve(t,e){let o=t.today.editorUsage[e]||{tokens:0,sessions:0},n=t.last30Days.editorUsage[e]||{tokens:0,sessions:0},s=t.month.editorUsage[e]||{tokens:0,sessions:0},r=t.lastMonth.editorUsage[e]||{tokens:0,sessions:0};return{editor:e,todayUsage:o,last30DaysUsage:n,monthUsage:s,lastMonthUsage:r,projectedTokens:Math.round(M(n.tokens)),projectedSessions:Math.round(M(n.sessions))}}function os(t,e){let o=c=>e.reduce((i,l)=>{let d=t[c].editorUsage[l]||{tokens:0,sessions:0};return{tokens:i.tokens+d.tokens,sessions:i.sessions+d.sessions}},{tokens:0,sessions:0}),n=o("today"),s=o("last30Days"),r=o("month"),a=o("lastMonth");return{editor:`Other (${e.length} editor${e.length!==1?"s":""})`,todayUsage:n,last30DaysUsage:s,monthUsage:r,lastMonthUsage:a,projectedTokens:Math.round(M(s.tokens)),projectedSessions:Math.round(M(s.sessions)),otherEditors:e}}function Zo(t){t.sort((e,o)=>{let n;switch(W){case"name":n=e.editor.localeCompare(o.editor);break;case"today":n=e.todayUsage.tokens-o.todayUsage.tokens;break;case"last30Days":n=e.last30DaysUsage.tokens-o.last30DaysUsage.tokens;break;case"month":n=e.monthUsage.tokens-o.monthUsage.tokens;break;case"lastMonth":n=e.lastMonthUsage.tokens-o.lastMonthUsage.tokens;break;case"projected":n=e.projectedTokens-o.projectedTokens;break;default:n=0}return ce==="asc"?n:-n})}function ns(t,e){return[...e].sort((o,n)=>{if(W==="name")return o.localeCompare(n);let s=Ve(t,o),r=Ve(t,n),a;switch(W){case"today":a=s.todayUsage.tokens-r.todayUsage.tokens;break;case"last30Days":a=s.last30DaysUsage.tokens-r.last30DaysUsage.tokens;break;case"month":a=s.monthUsage.tokens-r.monthUsage.tokens;break;case"lastMonth":a=s.lastMonthUsage.tokens-r.lastMonthUsage.tokens;break;case"projected":a=s.projectedTokens-r.projectedTokens;break;default:a=0}return-a||o.localeCompare(n)})}function Qo(t,e,o){let{editor:n,todayUsage:s,last30DaysUsage:r,monthUsage:a,lastMonthUsage:c,projectedTokens:i,projectedSessions:l}=t,d=e.today>0?s.tokens/e.today*100:0,u=e.last30Days>0?r.tokens/e.last30Days*100:0,p=e.month>0?a.tokens/e.month*100:0,f=e.lastMonth>0?c.tokens/e.lastMonth*100:0,h=document.createElement("tr");o&&(h.style.opacity="0.85"),n==="JetBrains"&&(h.title="JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available."),n==="Antigravity"&&(h.title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."),n==="Cursor"&&(h.title="Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.");let A=document.createElement("td"),U=document.createElement("span");if(U.className="metric-label",o){let Et=document.createElement("span");Et.style.cssText="display:inline-block;width:12px",U.append(Et)}return U.append(document.createTextNode(`${Pt(n)} ${n}`)),(n==="JetBrains"||n==="Antigravity"||n==="Cursor")&&U.append(document.createTextNode(" \u24D8")),A.append(U),h.append(A,C(m(s.tokens),`${S(d)} \xB7 ${s.sessions} sessions`),C(m(r.tokens),`${S(u)} \xB7 ${r.sessions} sessions`),C(m(a.tokens),`${S(p)} \xB7 ${a.sessions} sessions`),C(m(c.tokens),`${S(f)} \xB7 ${c.sessions} sessions`),C(m(i),`${l} sessions`)),h}function ss(t,e,o,n,s){let r=t.otherEditors??[],a=(f,h)=>h>0?f/h*100:0,c=document.createElement("tr");c.style.cursor="pointer",c.style.background="var(--list-hover-bg)",c.title=ie?"Collapse other editors":"Expand other editors";let i=document.createElement("span");i.className="metric-label";let l=document.createElement("span");l.style.cssText="color:var(--text-secondary);font-weight:600;",l.textContent=`\u{1F4E6} ${t.editor}`;let d=document.createElement("span");d.style.cssText="font-size:10px;color:var(--text-muted)",d.textContent=` ${ie?"\u25B2":"\u25BC"}`,i.append(l,d);let u=document.createElement("td");u.append(i);let p=(f,h)=>{let A=C(m(f.tokens));return A.append(b("div","muted",`${S(a(f.tokens,h))} \xB7 ${f.sessions} sessions`)),A};if(c.append(u,p(t.todayUsage,e.today),p(t.last30DaysUsage,e.last30Days),p(t.monthUsage,e.month),p(t.lastMonthUsage,e.lastMonth),C(m(t.projectedTokens),`${t.projectedSessions} sessions`)),c.addEventListener("click",()=>{ie=!ie,xe(),o()}),n.append(c),ie){let f=r.map(h=>Ve(s,h));Zo(f),f.forEach(h=>n.append(Qo(h,e,!0)))}}function rs(t,e,o){let n=e,s={today:n.reduce((d,u)=>d+(t.today.editorUsage[u]?.tokens||0),0),last30Days:n.reduce((d,u)=>d+(t.last30Days.editorUsage[u]?.tokens||0),0),month:n.reduce((d,u)=>d+(t.month.editorUsage[u]?.tokens||0),0),lastMonth:n.reduce((d,u)=>d+(t.lastMonth.editorUsage[u]?.tokens||0),0)},r=document.createElement("tbody");if(n.length===0)return r.append(Vo(6,"No editor usage matches the selected provider filter.")),r;let a=ns(t,n),c=a.slice(0,Ko),i=a.slice(Ko),l=c.map(d=>Ve(t,d));return Zo(l),i.length>0&&l.push(os(t,i)),l.forEach(d=>{d.otherEditors?ss(d,s,o,r,t):r.append(Qo(d,s,!1))}),r}var Ko=5;function as(t){let e=new Set([...Object.keys(t.today.editorUsage),...Object.keys(t.last30Days.editorUsage),...Object.keys(t.month.editorUsage),...Object.keys(t.lastMonth.editorUsage)]);if(e.size===0)return null;let o=Array.from(e).filter(l=>Xo(es(t,l))),n=b("div","section"),s=de("h3","device-desktop","Usage by Editor");n.append(s);let r=document.createElement("table");r.className="stats-table";let a=[{icon:"\u{1F4DD}",text:"Editor",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function c(){let l=rs(t,o,c),d=r.querySelector("tbody");d?r.replaceChild(l,d):r.append(l)}let{thead:i}=zo(a,()=>W,()=>ce,l=>{W===l?ce=ce==="asc"?"desc":"asc":(W=l,ce=l==="name"?"asc":"desc"),c(),xe()});return r.append(i),c(),n.append(r),n}var Go=5;function Ye(t,e){let o=t.today.modelUsage[e]||{inputTokens:0,outputTokens:0},n=t.last30Days.modelUsage[e]||{inputTokens:0,outputTokens:0},s=t.month.modelUsage[e]||{inputTokens:0,outputTokens:0},r=t.lastMonth.modelUsage[e]||{inputTokens:0,outputTokens:0},a=o.inputTokens+o.outputTokens,c=n.inputTokens+n.outputTokens,i=s.inputTokens+s.outputTokens,l=r.inputTokens+r.outputTokens;return{model:e,todayTotal:a,todayInputPct:a>0?o.inputTokens/a*100:0,todayOutputPct:a>0?o.outputTokens/a*100:0,last30DaysTotal:c,last30DaysInputPct:c>0?n.inputTokens/c*100:0,last30DaysOutputPct:c>0?n.outputTokens/c*100:0,monthTotal:i,monthInputPct:i>0?s.inputTokens/i*100:0,monthOutputPct:i>0?s.outputTokens/i*100:0,lastMonthTotal:l,lastMonthInputPct:l>0?r.inputTokens/l*100:0,lastMonthOutputPct:l>0?r.outputTokens/l*100:0,projected:Math.round(M(c)),charsPerToken:It(e)}}function is(t,e){let o=u=>e.reduce((p,f)=>{let h=t[u].modelUsage[f]||{inputTokens:0,outputTokens:0};return{inputTokens:p.inputTokens+h.inputTokens,outputTokens:p.outputTokens+h.outputTokens}},{inputTokens:0,outputTokens:0}),n=o("today"),s=o("last30Days"),r=o("month"),a=o("lastMonth"),c=n.inputTokens+n.outputTokens,i=s.inputTokens+s.outputTokens,l=r.inputTokens+r.outputTokens,d=a.inputTokens+a.outputTokens;return{model:`Other (${e.length} model${e.length!==1?"s":""})`,todayTotal:c,todayInputPct:c>0?n.inputTokens/c*100:0,todayOutputPct:c>0?n.outputTokens/c*100:0,last30DaysTotal:i,last30DaysInputPct:i>0?s.inputTokens/i*100:0,last30DaysOutputPct:i>0?s.outputTokens/i*100:0,monthTotal:l,monthInputPct:l>0?r.inputTokens/l*100:0,monthOutputPct:l>0?r.outputTokens/l*100:0,lastMonthTotal:d,lastMonthInputPct:d>0?a.inputTokens/d*100:0,lastMonthOutputPct:d>0?a.outputTokens/d*100:0,projected:Math.round(M(i)),charsPerToken:0,otherModels:e}}function en(t){t.sort((e,o)=>{let n;switch(q){case"name":n=e.model.localeCompare(o.model);break;case"today":n=e.todayTotal-o.todayTotal;break;case"last30Days":n=e.last30DaysTotal-o.last30DaysTotal;break;case"month":n=e.monthTotal-o.monthTotal;break;case"lastMonth":n=e.lastMonthTotal-o.lastMonthTotal;break;case"projected":n=e.projected-o.projected;break;default:n=0}return le==="asc"?n:-n})}function cs(t,e){return[...e].sort((o,n)=>{if(q==="name")return o.localeCompare(n);let s=Ye(t,o),r=Ye(t,n),a;switch(q){case"today":a=s.todayTotal-r.todayTotal;break;case"last30Days":a=s.last30DaysTotal-r.last30DaysTotal;break;case"month":a=s.monthTotal-r.monthTotal;break;case"lastMonth":a=s.lastMonthTotal-r.lastMonthTotal;break;case"projected":a=s.projected-r.projected;break;default:a=0}return-a||o.localeCompare(n)})}function tn(t,e){let o=document.createElement("tr");e&&(o.style.opacity="0.85");let n=document.createElement("td"),s=document.createElement("span");if(s.className="metric-label",e){let a=document.createElement("span");a.style.cssText="display:inline-block;width:12px",s.append(a)}let r=document.createElement("span");return r.style.cssText="color:#9aa0a6;font-size:11px;font-weight:500;",r.textContent=`(~${t.charsPerToken.toFixed(1)} chars/tk)`,s.append(document.createTextNode(`${Ze(t.model)} `),r),n.append(s),o.append(n,C(m(t.todayTotal),`\u2191${S(t.todayInputPct)} \u2193${S(t.todayOutputPct)}`),C(m(t.last30DaysTotal),`\u2191${S(t.last30DaysInputPct)} \u2193${S(t.last30DaysOutputPct)}`),C(m(t.monthTotal),`\u2191${S(t.monthInputPct)} \u2193${S(t.monthOutputPct)}`),C(m(t.lastMonthTotal),`\u2191${S(t.lastMonthInputPct)} \u2193${S(t.lastMonthOutputPct)}`),C(m(t.projected))),o}function ls(t,e,o,n){let s=t.otherModels??[],r=(p,f)=>f>0?p/f*100:0,a=document.createElement("tr");a.style.cursor="pointer",a.style.background="var(--list-hover-bg)",a.title=ae?"Collapse other models":"Expand other models";let c=document.createElement("span");c.className="metric-label";let i=document.createElement("span");i.style.cssText="color:var(--text-secondary);font-weight:600;",i.textContent=`\u{1F4E6} ${t.model}`;let l=document.createElement("span");l.style.cssText="font-size:10px;color:var(--text-muted)",l.textContent=` ${ae?"\u25B2":"\u25BC"}`,c.append(i,l);let d=document.createElement("td");d.append(c);let u=(p,f,h)=>{let A=C(m(p));return p>0&&A.append(b("div","muted",`\u2191${S(f)} \u2193${S(h)}`)),A};if(a.append(d,u(t.todayTotal,t.todayInputPct,t.todayOutputPct),u(t.last30DaysTotal,t.last30DaysInputPct,t.last30DaysOutputPct),u(t.monthTotal,t.monthInputPct,t.monthOutputPct),u(t.lastMonthTotal,t.lastMonthInputPct,t.lastMonthOutputPct),C(m(t.projected))),a.addEventListener("click",()=>{ae=!ae,xe(),e()}),o.append(a),ae){let p=s.map(f=>Ye(n,f));en(p),p.forEach(f=>o.append(tn(f,!0)))}}function ds(t,e,o){let n=cs(t,e),s=n.slice(0,Go),r=n.slice(Go),a=s.map(i=>Ye(t,i));en(a),r.length>0&&a.push(is(t,r));let c=document.createElement("tbody");return a.forEach(i=>{i.otherModels?ls(i,o,c,t):c.append(tn(i,!1))}),c}function us(t){let e=new Set([...Object.keys(t.today.modelUsage),...Object.keys(t.last30Days.modelUsage),...Object.keys(t.month.modelUsage),...Object.keys(t.lastMonth.modelUsage)]);if(e.size===0)return null;let o=new Set(Array.from(e).filter(l=>Xo(ts(t,l)))),n=b("div","section"),s=de("h3","symbol-numeric","Model Usage (Tokens)");n.append(s);let r=document.createElement("table");if(r.className="stats-table",o.size===0){let l=document.createElement("tbody");return l.append(Vo(6,"No model usage matches the selected provider filter.")),r.append(l),n.append(r),n}let a=[{icon:"\u{1F9E0}",text:"Model",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function c(){let l=ds(t,Array.from(o),c),d=r.querySelector("tbody");d?r.replaceChild(l,d):r.append(l)}let{thead:i}=zo(a,()=>q,()=>le,l=>{q===l?le=le==="asc"?"desc":"asc":(q=l,le=l==="name"?"asc":"desc"),c(),xe()});return r.append(i),c(),n.append(r),n}function ps(){let t=b("div","section"),e=b("div","empty-state"),o=b("div","empty-state-title","\u{1F44B} Welcome to AI Engineering Fluency"),n=b("p","empty-state-description","This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."),s=document.createElement("p");s.className="empty-state-description";let r=document.createElement("strong");r.textContent="Supported tools & editors:",s.append(r);let a=document.createElement("ul");a.className="empty-state-steps",["\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE","\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent","\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal","\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat","\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent","\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents","\u03C0 Pi \u2014 Mistral-powered terminal coding agent","\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension","\u{1F499} VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension"].forEach(f=>{let h=document.createElement("li");h.textContent=f,a.append(h)});let i=document.createElement("p");i.className="empty-state-description";let l=document.createElement("strong");l.textContent="To get started:",i.append(l);let d=document.createElement("ol");d.className="empty-state-steps",["Use any of the supported tools or editors listed above to interact with an AI model.","For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.","For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.","Click the \u{1F504} Refresh button above to reload the stats after your first session."].forEach(f=>{let h=document.createElement("li");h.textContent=f,d.append(h)});let p=b("div","empty-state-note","\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly.");return e.append(o,n,s,a,i,d,p),t.append(e),t}function gs(){let t=document.getElementById("btn-refresh"),e=document.getElementById("btn-chart"),o=document.getElementById("btn-usage"),n=document.getElementById("btn-diagnostics");t?.addEventListener("click",()=>P.postMessage({command:"refresh"})),e?.addEventListener("click",()=>P.postMessage({command:"showChart"})),o?.addEventListener("click",()=>P.postMessage({command:"showUsageAnalysis"})),n?.addEventListener("click",()=>P.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>P.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>P.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>P.postMessage({command:"showEnvironmental"})),document.getElementById("btn-efficiency")?.addEventListener("click",()=>P.postMessage({command:"showEfficiency"})),Kt(P)}async function ms(){if(console.log("[CopilotTokenTracker] bootstrap called"),await Promise.resolve().then(()=>(Io(),Po)),await Promise.resolve().then(()=>(jo(),No)),z)console.log("[CopilotTokenTracker] Rendering details with initialData:",z),vt(z);else{console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");let t=document.getElementById("root");if(t){t.textContent="";let e=document.createElement("div");e.style.padding="16px",e.style.color="#e7e7e7",e.textContent="No data available.",t.append(e)}}}_e(t=>{t.command==="updateStats"&&vt(t.data)});ms();})();
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
