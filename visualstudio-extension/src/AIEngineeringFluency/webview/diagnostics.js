"use strict";(()=>{var on=Object.defineProperty;var g=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var nn=(e,t)=>{for(var o in t)on(e,o,{get:t[o],enumerable:!0})};var kt,Ct,qt,Pe,ot,$t,R,Ne,jt,Gt=g(()=>{kt=globalThis,Ct=kt.ShadowRoot&&(kt.ShadyCSS===void 0||kt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,qt=Symbol(),Pe=new WeakMap,ot=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==qt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(Ct&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=Pe.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Pe.set(o,t))}return t}toString(){return this.cssText}},$t=e=>new ot(typeof e=="string"?e:e+"",void 0,qt),R=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,s,i)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new ot(o,e,qt)},Ne=(e,t)=>{if(Ct)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),s=kt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,e.appendChild(n)}},jt=Ct?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return $t(o)})(e):e});var mn,gn,hn,vn,fn,yn,L,He,xn,Sn,nt,st,wt,Oe,T,it=g(()=>{Gt();Gt();({is:mn,defineProperty:gn,getOwnPropertyDescriptor:hn,getOwnPropertyNames:vn,getOwnPropertySymbols:fn,getPrototypeOf:yn}=Object),L=globalThis,He=L.trustedTypes,xn=He?He.emptyScript:"",Sn=L.reactiveElementPolyfillSupport,nt=(e,t)=>e,st={toAttribute(e,t){switch(t){case Boolean:e=e?xn:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},wt=(e,t)=>!mn(e,t),Oe={attribute:!0,type:String,converter:st,reflect:!1,useDefault:!1,hasChanged:wt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),L.litPropertyMetadata??(L.litPropertyMetadata=new WeakMap);T=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=Oe){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(t,n,o);s!==void 0&&gn(this.prototype,t,s)}}static getPropertyDescriptor(t,o,n){let{get:s,set:i}=hn(this.prototype,t)??{get(){return this[o]},set(r){this[o]=r}};return{get:s,set(r){let a=s?.call(this);i?.call(this,r),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Oe}static _$Ei(){if(this.hasOwnProperty(nt("elementProperties")))return;let t=yn(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(nt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(nt("properties"))){let o=this.properties,n=[...vn(o),...fn(o)];for(let s of n)this.createProperty(s,o[s])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let s of n)o.unshift(jt(s))}else t!==void 0&&o.push(jt(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ne(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,n);if(s!==void 0&&n.reflect===!0){let i=(n.converter?.toAttribute!==void 0?n.converter:st).toAttribute(o,n.type);this._$Em=t,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(t,o){let n=this.constructor,s=n._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let i=n.getPropertyOptions(s),r=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:st;this._$Em=s;let a=r.fromAttribute(o,i.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,o,n,s=!1,i){if(t!==void 0){let r=this.constructor;if(s===!1&&(i=this[t]),n??(n=r.getPropertyOptions(t)),!((n.hasChanged??wt)(i,o)||n.useDefault&&n.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:s,wrapped:i},r){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,r??o??this[t]),i!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,i]of n){let{wrapped:r}=i,a=this[s];r!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,i,a)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[nt("elementProperties")]=new Map,T[nt("finalized")]=new Map,Sn?.({ReactiveElement:T}),(L.reactiveElementVersions??(L.reactiveElementVersions=[])).push("2.1.2")});function Je(e,t){if(!Xt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return ze!==void 0?ze.createHTML(t):t}function F(e,t,o=e,n){if(t===$)return t;let s=n!==void 0?o._$Co?.[n]:o._$Cl,i=dt(t)?void 0:t._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(e),s._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(t=F(e,s._$AS(e,t.values),s,n)),t}var at,Fe,Et,ze,We,_,Ze,kn,H,lt,dt,Xt,Cn,Vt,rt,Ue,qe,P,je,Ge,Ke,Qt,A,Fi,zi,$,y,Ve,N,$n,ct,Wt,ut,z,Zt,Kt,Jt,Yt,wn,Ye,U=g(()=>{at=globalThis,Fe=e=>e,Et=at.trustedTypes,ze=Et?Et.createPolicy("lit-html",{createHTML:e=>e}):void 0,We="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,Ze="?"+_,kn=`<${Ze}>`,H=document,lt=()=>H.createComment(""),dt=e=>e===null||typeof e!="object"&&typeof e!="function",Xt=Array.isArray,Cn=e=>Xt(e)||typeof e?.[Symbol.iterator]=="function",Vt=`[ 	
\f\r]`,rt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ue=/-->/g,qe=/>/g,P=RegExp(`>|${Vt}(?:([^\\s"'>=/]+)(${Vt}*=${Vt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),je=/'/g,Ge=/"/g,Ke=/^(?:script|style|textarea|title)$/i,Qt=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),A=Qt(1),Fi=Qt(2),zi=Qt(3),$=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),Ve=new WeakMap,N=H.createTreeWalker(H,129);$n=(e,t)=>{let o=e.length-1,n=[],s,i=t===2?"<svg>":t===3?"<math>":"",r=rt;for(let a=0;a<o;a++){let l=e[a],u,p,c=-1,b=0;for(;b<l.length&&(r.lastIndex=b,p=r.exec(l),p!==null);)b=r.lastIndex,r===rt?p[1]==="!--"?r=Ue:p[1]!==void 0?r=qe:p[2]!==void 0?(Ke.test(p[2])&&(s=RegExp("</"+p[2],"g")),r=P):p[3]!==void 0&&(r=P):r===P?p[0]===">"?(r=s??rt,c=-1):p[1]===void 0?c=-2:(c=r.lastIndex-p[2].length,u=p[1],r=p[3]===void 0?P:p[3]==='"'?Ge:je):r===Ge||r===je?r=P:r===Ue||r===qe?r=rt:(r=P,s=void 0);let h=r===P&&e[a+1].startsWith("/>")?" ":"";i+=r===rt?l+kn:c>=0?(n.push(u),l.slice(0,c)+We+l.slice(c)+_+h):l+_+(c===-2?a:h)}return[Je(e,i+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},ct=class e{constructor({strings:t,_$litType$:o},n){let s;this.parts=[];let i=0,r=0,a=t.length-1,l=this.parts,[u,p]=$n(t,o);if(this.el=e.createElement(u,n),N.currentNode=this.el.content,o===2||o===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=N.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(We)){let b=p[r++],h=s.getAttribute(c).split(_),x=/([.?@])?(.*)/.exec(b);l.push({type:1,index:i,name:x[2],strings:h,ctor:x[1]==="."?Zt:x[1]==="?"?Kt:x[1]==="@"?Jt:z}),s.removeAttribute(c)}else c.startsWith(_)&&(l.push({type:6,index:i}),s.removeAttribute(c));if(Ke.test(s.tagName)){let c=s.textContent.split(_),b=c.length-1;if(b>0){s.textContent=Et?Et.emptyScript:"";for(let h=0;h<b;h++)s.append(c[h],lt()),N.nextNode(),l.push({type:2,index:++i});s.append(c[b],lt())}}}else if(s.nodeType===8)if(s.data===Ze)l.push({type:2,index:i});else{let c=-1;for(;(c=s.data.indexOf(_,c+1))!==-1;)l.push({type:7,index:i}),c+=_.length-1}i++}}static createElement(t,o){let n=H.createElement("template");return n.innerHTML=t,n}};Wt=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,s=(t?.creationScope??H).importNode(o,!0);N.currentNode=s;let i=N.nextNode(),r=0,a=0,l=n[0];for(;l!==void 0;){if(r===l.index){let u;l.type===2?u=new ut(i,i.nextSibling,this,t):l.type===1?u=new l.ctor(i,l.name,l.strings,this,t):l.type===6&&(u=new Yt(i,this,t)),this._$AV.push(u),l=n[++a]}r!==l?.index&&(i=N.nextNode(),r++)}return N.currentNode=H,s}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},ut=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,s){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=F(this,t,o),dt(t)?t===y||t==null||t===""?(this._$AH!==y&&this._$AR(),this._$AH=y):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Cn(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==y&&dt(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,s=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=ct.createElement(Je(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let i=new Wt(s,this),r=i.u(this.options);i.p(o),this.T(r),this._$AH=i}}_$AC(t){let o=Ve.get(t.strings);return o===void 0&&Ve.set(t.strings,o=new ct(t)),o}k(t){Xt(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let i of t)s===o.length?o.push(n=new e(this.O(lt()),this.O(lt()),this,this.options)):n=o[s],n._$AI(i),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=Fe(t).nextSibling;Fe(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,s,i){this.type=1,this._$AH=y,this._$AN=void 0,this.element=t,this.name=o,this._$AM=s,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=y}_$AI(t,o=this,n,s){let i=this.strings,r=!1;if(i===void 0)t=F(this,t,o,0),r=!dt(t)||t!==this._$AH&&t!==$,r&&(this._$AH=t);else{let a=t,l,u;for(t=i[0],l=0;l<i.length-1;l++)u=F(this,a[n+l],o,l),u===$&&(u=this._$AH[l]),r||(r=!dt(u)||u!==this._$AH[l]),u===y?t=y:t!==y&&(t+=(u??"")+i[l+1]),this._$AH[l]=u}r&&!s&&this.j(t)}j(t){t===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Zt=class extends z{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===y?void 0:t}},Kt=class extends z{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==y)}},Jt=class extends z{constructor(t,o,n,s,i){super(t,o,n,s,i),this.type=5}_$AI(t,o=this){if((t=F(this,t,o,0)??y)===$)return;let n=this._$AH,s=t===y&&n!==y||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,i=t!==y&&(n===y||s);s&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Yt=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){F(this,t)}},wn=at.litHtmlPolyfillSupport;wn?.(ct,ut),(at.litHtmlVersions??(at.litHtmlVersions=[])).push("3.3.3");Ye=(e,t,o)=>{let n=o?.renderBefore??t,s=n._$litPart$;if(s===void 0){let i=o?.renderBefore??null;n._$litPart$=s=new ut(t.insertBefore(lt(),i),i,void 0,o??{})}return s._$AI(e),s}});var pt,D,En,Xe=g(()=>{it();it();U();U();pt=globalThis,D=class extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ye(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};D._$litElement$=!0,D.finalized=!0,pt.litElementHydrateSupport?.({LitElement:D});En=pt.litElementPolyfillSupport;En?.({LitElement:D});(pt.litElementVersions??(pt.litElementVersions=[])).push("4.2.2")});var Qe=g(()=>{});var B=g(()=>{it();U();Xe();Qe()});var to=g(()=>{});function v(e){return(t,o)=>typeof o=="object"?An(e,t,o):((n,s,i)=>{let r=s.hasOwnProperty(i);return s.constructor.createProperty(i,n),r?Object.getOwnPropertyDescriptor(s,i):void 0})(e,t,o)}var Tn,An,te=g(()=>{it();Tn={attribute:!0,type:String,converter:st,reflect:!1,hasChanged:wt},An=(e=Tn,t,o)=>{let{kind:n,metadata:s}=o,i=globalThis.litPropertyMetadata.get(s);if(i===void 0&&globalThis.litPropertyMetadata.set(s,i=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),i.set(o.name,e),n==="accessor"){let{name:r}=o;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(r,l,e,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,e,a),a}}}if(n==="setter"){let{name:r}=o;return function(a){let l=this[r];t.call(this,a),this.requestUpdate(r,l,e,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function ee(e){return v({...e,state:!0,attribute:!1})}var eo=g(()=>{te();});var oo=g(()=>{});var q=g(()=>{});var no=g(()=>{q();});var so=g(()=>{q();});var io=g(()=>{q();});var ro=g(()=>{q();});var ao=g(()=>{q();});var oe=g(()=>{to();te();eo();oo();no();so();io();ro();ao()});var At,It,j,ne=g(()=>{At={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},It=e=>(...t)=>({_$litDirective$:e,values:t}),j=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var Mt,lo=g(()=>{U();ne();Mt=It(class extends j{constructor(e){if(super(e),e.type!==At.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let s=!!t[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return $}})});var se=g(()=>{lo()});var Lt,co,uo,G,_t,ie=g(()=>{B();Lt="2.5.1",co="__vscodeElements_disableRegistryWarning__",uo=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},G=class extends D{get version(){return Lt}warn(t){uo(t,this)}},_t=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(co in window)return;let s=document.createElement(e)?.version,i="";s?s!==Lt?(i+="is already registered by a different version of VSCode Elements. ",i+=`This version is "${Lt}", while the other one is "${s}".`):i+=`is already registered by the same version of VSCode Elements (${Lt}).`:i+="is already registered by an unknown custom element handler class.",uo(`The custom element "${e}" ${i}
To suppress this warning, set window.${co} to true`)}});var V,po=g(()=>{U();V=e=>e??y});var re=g(()=>{po()});var bo=g(()=>{ne()});var ae,mo,go=g(()=>{B();bo();ae=class extends j{constructor(t){if(super(t),this._prevProperties={},t.type!==At.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?t.element.style.setProperty(n,s):t.element.style[n]=s,this._prevProperties[n]=s)}),$}render(t){return $}},mo=It(ae)});var Dt,le=g(()=>{B();Dt=R`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var In,ho,vo=g(()=>{B();le();In=[Dt,R`
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
  `],ho=In});var O,bt,w,fo=g(()=>{B();oe();se();re();ie();go();vo();O=function(e,t,o,n){var s=arguments.length,i=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(i=(s<3?r(i):s>3?r(t,o,i):r(t,o))||i);return s>3&&i&&Object.defineProperty(t,o,i),i},w=bt=class extends G{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();bt.stylesheetHref=t,bt.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=bt,n=A`<span
      class=${Mt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${mo({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?A` <button
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
        href=${V(t)}
        nonce=${V(o)}
      />
      ${s}
    `}};w.styles=ho;w.stylesheetHref="";w.nonce="";O([v()],w.prototype,"label",void 0);O([v({type:String})],w.prototype,"name",void 0);O([v({type:Number})],w.prototype,"size",void 0);O([v({type:Boolean,reflect:!0})],w.prototype,"spin",void 0);O([v({type:Number,attribute:"spin-duration"})],w.prototype,"spinDuration",void 0);O([v({type:Boolean,reflect:!0,attribute:"action-icon"})],w.prototype,"actionIcon",void 0);w=bt=O([_t("vscode-icon")],w)});var yo=g(()=>{fo()});function xo(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var So=g(()=>{});var Mn,Ln,ko,Co=g(()=>{B();le();So();Mn=$t(xo()),Ln=[Dt,R`
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
      font-family: var(--vscode-font-family, ${Mn});
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
  `],ko=Ln});var S,f,$o=g(()=>{B();oe();se();ie();yo();Co();re();S=function(e,t,o,n){var s=arguments.length,i=s<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(i=(s<3?r(i):s>3?r(t,o,i):r(t,o))||i);return s>3&&i&&Object.defineProperty(t,o,i),i},f=class extends G{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=t?A`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${V(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:y,i=o?A`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${V(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:y;return A`
      <div
        class=${Mt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${i}
        <slot name="content-after"></slot>
      </div>
    `}};f.styles=ko;f.formAssociated=!0;S([v({type:Boolean,reflect:!0})],f.prototype,"autofocus",void 0);S([v({type:Number,reflect:!0})],f.prototype,"tabIndex",void 0);S([v({type:Boolean,reflect:!0})],f.prototype,"secondary",void 0);S([v({type:Boolean,reflect:!0})],f.prototype,"block",void 0);S([v({reflect:!0})],f.prototype,"role",void 0);S([v({type:Boolean,reflect:!0})],f.prototype,"disabled",void 0);S([v()],f.prototype,"icon",void 0);S([v({type:Boolean,reflect:!0,attribute:"icon-spin"})],f.prototype,"iconSpin",void 0);S([v({type:Number,reflect:!0,attribute:"icon-spin-duration"})],f.prototype,"iconSpinDuration",void 0);S([v({attribute:"icon-after"})],f.prototype,"iconAfter",void 0);S([v({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],f.prototype,"iconAfterSpin",void 0);S([v({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],f.prototype,"iconAfterSpinDuration",void 0);S([v({type:Boolean,reflect:!0})],f.prototype,"focused",void 0);S([v({type:String,reflect:!0})],f.prototype,"name",void 0);S([v({type:Boolean,reflect:!0,attribute:"icon-only"})],f.prototype,"iconOnly",void 0);S([v({reflect:!0})],f.prototype,"type",void 0);S([v()],f.prototype,"value",void 0);S([ee()],f.prototype,"_hasContentBefore",void 0);S([ee()],f.prototype,"_hasContentAfter",void 0);f=S([_t("vscode-button")],f)});var wo={};nn(wo,{VscodeButton:()=>f});var Eo=g(()=>{$o()});var we={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var sn=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function rn(e,t){return sn.filter(o=>o!=="btn-dashboard"||t).map(o=>({...we[o],active:o===e}))}function an(e){let t=typeof e=="string"?we[e]:e;if(t.hidden)return"";let o=t.appearance?` appearance="${t.appearance}"`:"",n=t.active?' class="nav-active" disabled aria-current="page"':"",s=t.iconColor?` style="--icon-accent:${t.iconColor}"`:"",i=t.icon?`<span class="codicon codicon-${t.icon} nav-icon"${s}></span>`:"";return`<vscode-button id="${t.id}"${o}${n}>${i}${t.label}</vscode-button>`}function Ee(e,t){return rn(e,t).map(o=>an(o)).join(`
`)}function Te(e){let t=window.__EXTENSION_POINT_BUTTONS__??[];if(t.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of t){let s=document.createElement("vscode-button");s.id=`ext-point-${n.id}`,s.textContent=n.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(s)}}var Ae={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",JetBrains:"\u{1F9E9}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function Ie(e){return Ae[e]??"\u{1F4DD}"}function yt(e){let t=globalThis.window;return t?t[e]:void 0}var ln=yt("__TOKEN_ESTIMATORS__"),Ti=ln?.estimators??{};function M(e){return Ie(e)}function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function zt(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"N/A";if(t<1024)return`${t} B`;let o=["KB","MB","GB","TB","PB"],n=t/1024,s=0;for(;n>=1024&&s<o.length-1;)n/=1024,s++;let i=s===0?1:2;return`${n.toFixed(i)} ${o[s]}`}function xt(e){try{let t=Date.now(),o=new Date(e).getTime(),n=t-o;if(n<0)return"Just now";let s=Math.floor(n/1e3),i=Math.floor(s/60),r=Math.floor(i/60),a=Math.floor(r/24);return a>0?`${a} day${a!==1?"s":""} ago`:r>0?`${r} hour${r!==1?"s":""} ago`:i>0?`${i} minute${i!==1?"s":""} ago`:`${s} second${s!==1?"s":""} ago`}catch{return"Unknown"}}function Ut(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}var dn={today:"Today",last7:"Last 7 days",last30:"Last 30 days",currentMonth:"Current month",lastMonth:"Previous month",thisWeek:"This week",allTime:"All time"},cn=["today","last7","last30","currentMonth","allTime"];function Me(e,t,o){t===o&&(e.selected=!0)}function Le(e){let t=Ut("div","period-selector");t.style.display="inline-flex",t.style.alignItems="center",t.style.gap="4px";let o=e.label??"Time window:";if(o){let r=Ut("span","period-selector-label",o);r.style.fontSize="11px",r.style.color="var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))",t.append(r)}let n=document.createElement("select");n.className="period-selector-select",e.id&&(n.id=e.id),n.style.background="var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))",n.style.color="var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))",n.style.border="1px solid var(--border-subtle, #555555)",n.style.borderRadius="4px",n.style.padding="4px 8px",n.style.fontSize="13px",n.style.cursor="pointer",n.style.minHeight="24px";let s=new Set(e.disabled??[]),i=e.periods??cn;for(let r of i){let a=document.createElement("option");a.value=r,a.textContent=dn[r],Me(a,r,e.selected),s.has(r)&&(a.disabled=!0,e.disabledTitle&&(a.title=e.disabledTitle)),n.append(a)}for(let r of e.extraOptions??[]){let a=document.createElement("option");a.value=r.value,a.textContent=r.label,r.title&&(a.title=r.title),Me(a,r.value,e.selected),r.disabled&&(a.disabled=!0),n.append(a)}return n.addEventListener("change",()=>{e.onChange(n.value)}),t.append(n),{wrapper:t,select:n}}function _e(e,t){return{restore(){let o=e.getState();return{...t,...o??{}}},save(o){e.setState(o)},patch(o){let n=e.getState()??{...t},s={...t,...n,...o};return e.setState(s),s}}}var De=`/**
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
`;var Be=`* {
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

.tab, .group-tab {
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

.tab:hover, .group-tab:hover {
	color: var(--text-primary);
	background: var(--list-hover-bg);
}

.tab.active, .group-tab.active {
	color: var(--link-color);
	border-bottom-color: var(--link-color);
}

.tab-content {
	display: none;
}

.tab-content.active {
	display: block;
}

/* Group tab bar (Diagnostics / Research / Settings) sits above the leaf tab bar for its group */
.group-tabs {
	border-bottom: 2px solid var(--border-color);
	margin-bottom: 4px;
}

.group-tab {
	font-size: 14px;
	font-weight: 600;
}

.leaf-tabs {
	margin-bottom: 16px;
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

.otel-delta-positive {
	color: var(--success-fg);
}

.otel-delta-negative {
	color: var(--error-fg);
}

.info-box pre {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 4px;
	padding: 8px 10px;
	font-size: 12px;
	overflow-x: auto;
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

.otel-delta-period-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 20px;
}

.otel-delta-period-row label {
	color: var(--text-secondary);
	font-size: 13px;
}

.otel-delta-period-select {
	background: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border, var(--border-color));
	border-radius: 4px;
	padding: 4px 8px;
	font-size: 13px;
	cursor: pointer;
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

`;function St(e){return e.file+e.selection+e.implicitSelection+e.symbol+e.codebase+e.workspace+e.terminal+e.vscode+e.copilotInstructions+e.agentsMd+(e.terminalLastCommand||0)+(e.terminalSelection||0)+(e.clipboard||0)+(e.changes||0)+(e.outputPanel||0)+(e.problemsPanel||0)+(e.pullRequest||0)}var bn=[{key:"file",full:"#file",abbr:"#file"},{key:"selection",full:"#selection",abbr:"#sel"},{key:"implicitSelection",full:"implicit",abbr:"impl"},{key:"symbol",full:"#symbol",abbr:"#sym"},{key:"codebase",full:"#codebase",abbr:"#cb"},{key:"workspace",full:"@workspace",abbr:"@ws"},{key:"terminal",full:"@terminal",abbr:"@term"},{key:"vscode",full:"@vscode",abbr:"@vsc"},{key:"terminalLastCommand",full:"#terminalLastCommand",abbr:"#termLC"},{key:"terminalSelection",full:"#terminalSelection",abbr:"#termSel"},{key:"clipboard",full:"#clipboard",abbr:"#clip"},{key:"changes",full:"#changes",abbr:"#chg"},{key:"outputPanel",full:"#outputPanel",abbr:"#out"},{key:"problemsPanel",full:"#problemsPanel",abbr:"#prob"},{key:"pullRequest",full:"#pr",abbr:"#pr"},{key:"copilotInstructions",full:"\u{1F4CB} instructions",abbr:"\u{1F4CB} inst"},{key:"agentsMd",full:"\u{1F916} agents",abbr:"\u{1F916} ag"}];function Re(e,t=!1){let o=[];for(let n of bn){let s=e[n.key]||0;if(s>0){let i=t?n.abbr:n.full;o.push(`${i}: ${s}`)}}return o.length>0?o.join(", "):"None"}var _n="Loading...",Dn=/Session File Locations \(first 20\):[\s\S]*?(?=\n\s*\n|={70})/,Bn=`\u23F3 Loading diagnostic data...

This may take a few moments depending on the number of session files.
The view will automatically update when data is ready.`,m=acquireVsCodeApi(),To=yt("__INITIAL_DIAGNOSTICS__"),I=_e(m,{activeTab:void 0,activeSubtab:void 0,otelDeltaPeriod:"all"}),ue,Rt=I.restore().otelDeltaPeriod??"all",Z="lastInteraction",K="desc",Q=null,J=null,gt=!0,pe=!1,Pt="avg",Y="desc",de,ht=[],tt=!0,vt,X,Nt="all";function Po(e){return e.replace(Dn,"")}function ft(e){if(!e)return"N/A";try{return d(new Date(e).toLocaleString())}catch{return d(e)}}function Ao(e){if(e==null)return"0";let t=Number(e);return Number.isFinite(t)?Math.floor(t).toString():"0"}function C(e){let t=Number(e??0);return!Number.isFinite(t)||t===0?"0":t>=1e9?`${(t/1e9).toFixed(1)}B`:t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(1)}K`:Math.floor(t).toString()}function Rn(e,t){let o=document.createElement("tr");e.exists||(o.style.opacity="0.5");let n=document.createElement("td");n.textContent=e.exists?"\u2705":"\u274C",n.style.textAlign="center";let s=document.createElement("td"),i=document.createElement("span");i.className=Ot(e.source),i.textContent=`${M(e.source)} ${e.source}`,s.appendChild(i);let r=document.createElement("td");r.setAttribute("title",e.path),r.style.fontFamily="var(--vscode-editor-font-family, monospace)",r.style.fontSize="12px",r.textContent=e.path,o.append(n,s,r),t.appendChild(o)}function Pn(e,t){let o=e.some(l=>l.exists),n=document.createElement("tr");o||(n.style.opacity="0.5");let s=document.createElement("td");s.textContent=o?"\u2705":"\u274C",s.style.textAlign="center";let i=document.createElement("td"),r=document.createElement("span");r.className=Ot("Crush"),r.textContent=`${M("Crush")} Crush`,i.appendChild(r);let a=document.createElement("td");a.style.fontFamily="var(--vscode-editor-font-family, monospace)",a.style.fontSize="12px",a.style.lineHeight="1.6";for(let l of e){let u=document.createElement("div");u.style.opacity=l.exists?"1":"0.5",u.title=l.path,u.textContent=`${l.exists?"\u2705":"\u274C"} ${l.path}`,a.appendChild(u)}n.append(s,i,a),t.appendChild(n)}function Nn(e){let t=document.createElement("div");t.className="candidate-paths-table";let o=document.createElement("h4");o.textContent="Scanned Paths (all candidate locations):",t.appendChild(o);let n=document.createElement("p");n.style.cssText="color: #999; font-size: 12px; margin: 4px 0 8px 0;",n.textContent="These are all the paths the extension checks for session files. Paths marked with \u2705 exist on this system.",t.appendChild(n);let s=document.createElement("table");s.className="session-table",t.appendChild(s);let i=document.createElement("thead"),r=document.createElement("tr");for(let c of["Status","Source","Path"]){let b=document.createElement("th");b.textContent=c,r.appendChild(b)}i.appendChild(r),s.appendChild(i);let a=document.createElement("tbody");s.appendChild(a);let l=[...e].sort((c,b)=>c.exists!==b.exists?c.exists?-1:1:c.source.localeCompare(b.source)),u=l.filter(c=>c.source.toLowerCase().includes("crush")),p=l.filter(c=>!c.source.toLowerCase().includes("crush"));for(let c of p)Rn(c,a);return u.length>0&&Pn(u,a),t}function Hn(e){let t=e.split(/[/\\]/);return t[t.length-1]}function On(e){if(!e)return"";let t=e.replace(/\.git$/,"");if(t.includes("@")&&t.includes(":")){let n=t.lastIndexOf(":"),s=t.lastIndexOf("@");if(n>s)return t.substring(n+1)}try{if(t.includes("://")){let n=new URL(t),s=n.pathname.split("/").filter(i=>i);return s.length>=2?`${s[s.length-2]}/${s[s.length-1]}`:n.pathname.replace(/^\//,"")}}catch{}let o=t.split("/").filter(n=>n);return o.length>=2?`${o[o.length-2]}/${o[o.length-1]}`:t}function Ot(e){let t=e.toLowerCase();return t.includes("ms scout")||t.includes("microsoft scout")?"editor-badge editor-badge-ms-scout":t.includes("visual studio")?"editor-badge editor-badge-vs":t.includes("jetbrains")?"editor-badge editor-badge-jetbrains":t.includes("mistral")?"editor-badge editor-badge-mistral-vibe":t.includes("antigravity")?"editor-badge editor-badge-antigravity":t.includes("gemini")?"editor-badge editor-badge-gemini-cli":t.includes("crush")?"editor-badge editor-badge-crush":t.includes("cursor")?"editor-badge editor-badge-cursor":t==="pi"?"editor-badge editor-badge-pi":"editor-badge"}function Io(e,t){switch(t){case"size":return e.size||0;case"tokens":return e.tokens||0;case"interactions":return e.interactions||0;case"contextRefs":return St(e.contextReferences);default:return 0}}function Fn(e,t){if(Z==="lastInteraction"){let s=e.lastInteraction,i=t.lastInteraction;if(!s&&!i)return 0;if(!s)return 1;if(!i)return-1;let r=new Date(s).getTime(),a=new Date(i).getTime();return K==="desc"?a-r:r-a}let o=Io(e,Z),n=Io(t,Z);return o===0&&n===0?0:K==="desc"?n-o:o-n}function zn(e,t){let o=new Set,n=[];for(let s of e)if(!o.has(s.file)){n.push(s),o.add(s.file);for(let i of s.childInfo??[]){if(!i.sessionFile)continue;let r=t.get(i.sessionFile);r&&!o.has(r.file)&&(n.push(r),o.add(r.file))}}return n}function Un(e){let t=[...e].sort(Fn),o=new Map;for(let n of t)o.set(n.file,n);return zn(t,o)}function mt(e){return Z!==e?"":K==="desc"?" \u25BC":" \u25B2"}function be(e){let t={};for(let o of e){let n=o.editorSource||"Unknown";t[n]||(t[n]={count:0,interactions:0}),t[n].count++,t[n].interactions+=o.interactions}return t}function qn(e){return e==null?"":d(String(e))}function me(e){let t=e.tokens||0;if(t===0||!e.modelUsage)return 0;let o=Object.values(e.modelUsage).reduce((n,s)=>n+s.inputTokens+s.outputTokens,0);return o>0?Math.max(0,t-o):0}function jn(e){let t=Q?e.filter(n=>n.editorSource===Q):e;J&&(t=t.filter(n=>{let s=n.contextReferences[J];return typeof s=="number"&&s>0})),pe&&(t=t.filter(n=>me(n)>1e3));let o=t.filter(n=>n.interactions===0).length;return gt&&o===t.length&&t.length>0&&(gt=!1),gt&&(t=t.filter(n=>n.interactions>0)),{filteredFiles:t,zeroInteractionCount:o}}function Gn(e){return e.reduce((t,o)=>{let n=o.contextReferences;return t.file+=n.file,t.symbol+=n.symbol,t.selection+=n.selection,t.implicitSelection+=n.implicitSelection,t.codebase+=n.codebase,t.workspace+=n.workspace,t.terminal+=n.terminal,t.vscode+=n.vscode,t.copilotInstructions+=n.copilotInstructions,t.agentsMd+=n.agentsMd,t},{file:0,symbol:0,selection:0,implicitSelection:0,codebase:0,workspace:0,terminal:0,vscode:0,copilotInstructions:0,agentsMd:0})}function Vn(e,t,o){return`<div class="editor-filter-panels">
    <div class="editor-panel ${Q===null?"active":""}" data-editor=""><div class="editor-panel-icon">\u{1F310}</div><div class="editor-panel-name">All Editors</div><div class="editor-panel-stats">${e.length} sessions</div></div>
    ${o.map(n=>`<div class="editor-panel ${Q===n?"active":""}" data-editor="${d(n)}"><div class="editor-panel-icon">${M(n)}</div><div class="editor-panel-name">${d(n)}</div><div class="editor-panel-stats">${t[n].count} sessions \xB7 ${t[n].interactions} interactions</div></div>`).join("")}
  </div>`}function Wn(e,t,o,n,s,i,r){let a=(p,c,b)=>i[p]>0?`<div class="context-ref-filter ${J===p?"active":""}" data-ref-type="${p}">${c} ${b} ${i[p]}</div>`:"",l=t.filter(p=>me(p)>1e3).length,u=l>0?`<label class="empty-sessions-toggle" title="Sessions where some debug-log tokens cannot be assigned to a specific model \u2014 may indicate incomplete model attribution in the debug log"><input type="checkbox" id="show-only-unattributed" ${pe?"checked":""}>\u26A0\uFE0F Show only sessions with unattributed tokens<span class="hidden-count">(${l} session${l===1?"":"s"})</span></label>`:"";return`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F4C1} ${Q?"Filtered":"Total"} Sessions</div><div class="summary-value">${e.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4AC} Interactions</div><div class="summary-value">${o}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1FA99} Tokens</div><div class="summary-value" title="${n.toLocaleString()} tokens">${C(n)}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F517} Context References</div><div class="summary-value">${qn(s)}</div><div class="summary-sub">${s===0?"None":""}${a("file","","#file")}${a("symbol","","#sym")}${a("implicitSelection","","implicit")}${a("copilotInstructions","\u{1F4CB}","instructions")}${a("agentsMd","\u{1F916}","agents")}${a("workspace","","@workspace")}${a("vscode","","@vscode")}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4C5} Time Range</div><div class="summary-value">Last 14 days</div></div>
  </div>
  <div class="filter-options"><label class="empty-sessions-toggle"><input type="checkbox" id="hide-empty-sessions" ${gt?"checked":""}>Hide sessions with 0 interactions${r>0?`<span class="hidden-count">(${r} hidden)</span>`:""}</label>${u}</div>`}function Zn(e){let t="";if(e.parentInfo){let o=d(e.parentInfo.name.length>30?e.parentInfo.name.substring(0,30)+"\u2026":e.parentInfo.name),n=e.parentInfo.sessionFile?` href="#" class="session-hierarchy-badge hierarchy-parent session-file-link" data-file="${encodeURIComponent(e.parentInfo.sessionFile)}"`:' class="session-hierarchy-badge hierarchy-parent"';t+=`<a${n} title="Parent session: ${d(e.parentInfo.name)}">\u2191 Parent: ${o}</a>`}if(e.totalChildCount&&e.totalChildCount>0){let o=e.totalChildCount,n=o===1?"1 child session":`${o} child sessions`;t+=`<span class="session-hierarchy-badge hierarchy-children" title="${n}">\u2193 ${o} ${o===1?"Child":"Children"}</span>`}return t?`<div class="session-hierarchy-badges">${t}</div>`:""}function Kn(e){let t=me(e);if(t<=1e3)return"";let o=Math.round(t/(e.tokens||1)*100);return` <span title="\u26A0\uFE0F ${t.toLocaleString()} tokens (~${o}%) not attributed to any model \u2014 debug log events without a model field" style="color:#f59e0b; cursor:help; font-size:0.9em;">\u26A0\uFE0F</span>`}function Jn(e){let t=e.map((o,n)=>{let s=o.editorName||o.editorSource,i=!!o.parentInfo,r=o.title?`<a href="#" class="session-file-link" data-file="${encodeURIComponent(o.file)}" title="${d(o.title)}">${d(o.title.length>40?o.title.substring(0,40)+"...":o.title)}</a>`:`<a href="#" class="session-file-link empty-session-link" data-file="${encodeURIComponent(o.file)}" title="Empty session">(Empty session)</a>`,a=i?`<span class="child-title-indent">${r}</span>`:r,l=Zn(o),u=o.repository?d(On(o.repository)):o.file.includes("session-store.db")?'<span style="color: #888; font-style: italic;">No workspace</span>':'<span style="color: #666;">\u2014</span>',p=o.repository?d(o.repository):o.file.includes("session-store.db")?"Chat session \u2014 no workspace connected":"No repository detected",c=(o.editorName||o.editorSource||"Unknown")==="Unknown";return`<tr${i?' class="child-session-row"':""}><td>${n+1}</td><td><span class="${Ot(s)}" title="${d(o.editorSource)}">${M(s)} ${d(s)}</span></td><td class="session-title" title="${o.title?d(o.title):"Empty session"}">${l}${a}</td><td class="repository-cell" title="${p}">${u}</td><td>${zt(o.size)}</td><td title="${Number(o.tokens||0).toLocaleString()} tokens">${C(o.tokens)}${Kn(o)}</td><td>${Ao(o.interactions)}</td><td title="${d(Re(o.contextReferences))}">${Ao(St(o.contextReferences))}</td><td>${ft(o.lastInteraction)}</td><td><a href="#" class="view-formatted-link" data-file="${encodeURIComponent(o.file)}" title="View formatted JSONL file">\u{1F4C4} View</a>${c?` <a href="#" class="report-editor-link" data-path="${encodeURIComponent(o.file)}" title="Report this unknown path so we can add editor support">\u{1F4E2} Report</a>`:""}</td></tr>`}).join("");return`<div class="table-container"><table class="session-table"><thead><tr><th>#</th><th>Editor</th><th>Title</th><th>Repository</th><th class="sortable" data-sort="size">Size${mt("size")}</th><th class="sortable" data-sort="tokens">Tokens${mt("tokens")}</th><th class="sortable" data-sort="interactions">Interactions${mt("interactions")}</th><th class="sortable" data-sort="contextRefs">Context Refs${mt("contextRefs")}</th><th class="sortable" data-sort="lastInteraction">Last Interaction${mt("lastInteraction")}</th><th>Actions</th></tr></thead><tbody>${t}</tbody></table></div>`}function No(e,t=!1){if(t)return'<div class="loading-state"><div class="loading-spinner">\u23F3</div><div class="loading-text">Loading session files...</div><div class="loading-subtext" id="session-loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>';if(e.length===0)return'<p style="color: #999;">No session files with activity in the last 14 days.</p>';let o=be(e),n=Object.keys(o).sort(),{filteredFiles:s,zeroInteractionCount:i}=jn(e),r=s.reduce((c,b)=>c+Number(b.interactions||0),0),a=s.reduce((c,b)=>c+Number(b.tokens||0),0),l=s.reduce((c,b)=>c+St(b.contextReferences),0),u=Gn(s),p=Un(s);return`${Vn(e,o,n)}${Wn(s,e,r,a,l,u,i)}${Jn(p)}`}function Mo(e,t,o){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(t)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="number" class="debug-counter-input" data-key="${d(e)}" value="${o}" min="0" step="1"
          style="width:70px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 2px 6px; font-family: var(--vscode-editor-font-family, monospace);" />
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-counter-set" data-key="${d(e)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}function Yn(e,t,o){let n=o?`\u2705 ${d(o)}`:"\u274C (not set)";return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(t)}</td>
      <td style="padding: 6px 8px 6px 0;" colspan="2">
        <span style="font-family: var(--vscode-editor-font-family, monospace);">${n}</span>
      </td>
    </tr>`}function Xn(e,t,o){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(t)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="checkbox" class="debug-flag-input" data-key="${d(e)}" ${o?"checked":""} />
        <span style="margin-left:6px; font-family: var(--vscode-editor-font-family, monospace);">${o?"\u2705 true":"\u274C false"}</span>
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-flag-set" data-key="${d(e)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}function Qn(e){let t=e??{openCount:0,unknownMcpOpenCount:0,fluencyBannerDismissed:!1,unknownMcpDismissedVersion:""};return`
    <div id="tab-debug" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F41B} Debug \u2014 Global State Counters</div>
        <div>Visible only when a debugger is attached. Edit counters and dismissed flags stored in VS Code global state, then click Set to apply. Changes take effect immediately.</div>
      </div>
      <div class="cache-details">
        <h4>Notification Counters</h4>
        <table><tbody>
          ${Mo("extension.openCount","extension.openCount (fluency banner threshold: 5)",t.openCount)}
          ${Mo("extension.unknownMcpOpenCount","extension.unknownMcpOpenCount (unknown MCP threshold: 8)",t.unknownMcpOpenCount)}
        </tbody></table>
        <h4 style="margin-top:16px;">Dismissed Flags</h4>
        <table><tbody>
          ${Xn("news.fluencyScoreBanner.v1.dismissed","news.fluencyScoreBanner.v1.dismissed",t.fluencyBannerDismissed)}
          ${Yn("news.unknownMcpTools.dismissedVersion","news.unknownMcpTools.dismissedVersion",t.unknownMcpDismissedVersion)}
        </tbody></table>
        <div style="margin-top: 16px;">
          <button class="button secondary" id="btn-reset-debug-counters"><span>\u{1F504}</span><span>Reset All Counters &amp; Dismissed Flags</span></button>
        </div>
      </div>
    </div>`}function ge(e){let t=e?.authenticated||!1,o=e?.username||"",n=t?"#2d6a4f":"#666";return`
<div class="info-box">
  <div class="info-box-title">\u{1F511} GitHub Authentication</div>
  <div>
    Authenticate with GitHub to unlock additional features in future releases.
  </div>
</div>

<div class="summary-cards">
  <div class="summary-card" style="border-left: 4px solid ${n};">
    <div class="summary-label">${t?"\u2705":"\u26AA"} Status</div>
    <div class="summary-value" style="font-size: 16px; color: ${n};">${t?"Authenticated":"Not Authenticated"}</div>
  </div>
  ${t?`
  <div class="summary-card">
    <div class="summary-label">\u{1F464} Logged in as</div>
    <div class="summary-value" style="font-size: 16px;">${d(o)}</div>
  </div>
  `:""}
</div>

${t?`
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
`:`
  <div style="margin-top: 24px;">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">
      Sign in with your GitHub account to unlock future features. This uses VS Code's built-in authentication.
    </p>
  </div>
`}

<div class="button-group">
  ${t?`
    <button class="button secondary" id="btn-sign-out-github">
      <span>\u{1F50C}</span>
      <span>Disconnect GitHub</span>
    </button>
  `:`
    <button class="button" id="btn-authenticate-github">
      <span>\u{1F511}</span>
      <span>Authenticate with GitHub</span>
    </button>
  `}
</div>
  `}function Ho(e,t){return e?{color:"#2d6a4f",icon:"\u2705",text:"Configured & Enabled"}:t?{color:"#d97706",icon:"\u26A0\uFE0F",text:"Enabled but Not Configured"}:{color:"#666",icon:"\u26AA",text:"Disabled"}}function ts(e){return e.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Storage Account</td><td>${d(e.storageAccount)}</td></tr><tr><td style="font-weight: 600;">Subscription ID</td><td>${d(e.subscriptionId)}</td></tr><tr><td style="font-weight: 600;">Resource Group</td><td>${d(e.resourceGroup)}</td></tr><tr><td style="font-weight: 600;">Aggregation Table</td><td>${d(e.aggTable)}</td></tr><tr><td style="font-weight: 600;">Events Table</td><td>${d(e.eventsTable)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4BB} Unique Devices</div><div class="summary-value">${d(String(e.deviceCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Based on workspace IDs</div></div><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${d(String(e.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u2601\uFE0F Cloud Records</div><div class="summary-value">${e.recordCount!==null?d(String(e.recordCount)):"\u2014"}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Azure Storage records</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Sync Status</div><div class="summary-value" style="font-size: 14px;">${e.lastSyncTime?ft(e.lastSyncTime):"Never"}</div></div></div></div>`:'<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Azure Storage</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">To enable cloud synchronization, configure an Azure Storage account via the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Azure subscription with Storage Account access</li><li>Appropriate permissions (Storage Table Data Contributor or Storage Account Key)</li><li>VS Code signed in with your Azure account (for Entra ID auth)</li></ul></div>'}function es(e){let{color:t,icon:o,text:n}=Ho(e.isConfigured,e.enabled);return`<div class="info-box"><div class="info-box-title">\u2601\uFE0F Azure Storage Backend</div><div>Sync your token usage data to Azure Storage Tables for team-wide reporting and multi-device access.</div></div>
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${t};"><div class="summary-label">${o} Status</div><div class="summary-value" style="font-size: 16px; color: ${t};">${n}</div></div><div class="summary-card"><div class="summary-label">\u{1F510} Auth Mode</div><div class="summary-value" style="font-size: 16px;">${e.authMode==="entraId"?"Entra ID":"Shared Key"}</div></div><div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${d(e.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${e.lastSyncTime?xt(e.lastSyncTime):"Never"}</div></div></div>
    ${ts(e)}
    <div class="button-group"><button class="button" id="btn-configure-backend"><span>${e.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${e.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function os(e,t){let o=t?"#d97706":e?.authenticated?"#2d6a4f":"#666",n=t?"\u26A0\uFE0F":e?.authenticated?"\u2705":"\u26AA",s=t?"Not Authenticated":e?.authenticated?d(e.username||"Authenticated"):"Not Authenticated";return`<div class="summary-card" style="border-left: 4px solid ${o};"><div class="summary-label">${n} GitHub Auth</div><div class="summary-value" style="font-size: 14px; color: ${o};">${s}</div></div>`}function ns(e){return e.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Server URL</td><td>${d(e.endpointUrl)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${d(String(e.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Last Sync</div><div class="summary-value" style="font-size: 14px;">${e.lastSyncTime?ft(e.lastSyncTime):"Never"}</div></div></div></div>`:`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Team Server</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">Deploy the sharing server and configure its URL in the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Deploy the sharing server (see the <code>sharing-server/</code> folder in the repository)</li><li>Enter the server's base URL in the Backend configuration panel</li><li>Data syncs automatically every 5 minutes once configured</li></ul></div>`}function ss(e,t){let{color:o,icon:n,text:s}=Ho(e.isConfigured,e.enabled),i=e.isConfigured&&!t?.authenticated;return`<div class="info-box"><div class="info-box-title">\u{1F5A5}\uFE0F Team Server Backend</div><div>Sync your token usage data to a self-hosted team server for team-wide reporting.</div></div>
    ${i?'<button id="btn-team-server-auth-warning" style="width: 100%; margin-bottom: 16px; padding: 12px 16px; background: rgba(217, 119, 6, 0.15); border: 1px solid #d97706; border-radius: 6px; display: flex; gap: 10px; align-items: center; cursor: pointer; text-align: left;" title="Click to sign in to GitHub"><span style="font-size: 18px; flex-shrink: 0;">\u26A0\uFE0F</span><div style="flex: 1;"><div style="color: #fbbf24; font-weight: 600; font-size: 13px; margin-bottom: 4px;">GitHub Authentication Required</div><div style="color: #d4a017; font-size: 12px;">Team server sync will not run until you sign in to GitHub. <strong style="color: #fbbf24;">Click here to sign in.</strong></div></div><span style="color: #fbbf24; font-size: 18px; flex-shrink: 0;">\u2192</span></button>':""}
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${o};"><div class="summary-label">${n} Status</div><div class="summary-value" style="font-size: 16px; color: ${o};">${s}</div></div>${os(t,i)}<div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${d(e.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${e.lastSyncTime?xt(e.lastSyncTime):"Never"}</div></div></div>
    ${ns(e)}
    <div class="button-group"><button class="button" id="btn-configure-backend-team"><span>${e.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${e.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function he(e,t){return e?`
    <div class="subtab-bar">
      <button class="subtab active" data-subtab="backend-azure">\u2601\uFE0F Azure Storage</button>
      <button class="subtab" data-subtab="backend-teamserver">\u{1F5A5}\uFE0F Team Server</button>
    </div>
    <div id="subtab-backend-azure" class="subtab-content active">
      ${es(e.azure)}
    </div>
    <div id="subtab-backend-teamserver" class="subtab-content">
      ${ss(e.teamServer,t)}
    </div>
  `:`
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
    `}function is(){return`
    <div class="info-box">
      <div class="info-box-title">\u{1F52C} Path Analyzer</div>
      <div>
        Analyze any folder to find session files and inspect their content.
        This helps troubleshoot why the extension isn't finding your AI tool's session files,
        or verify that files from another OS would be recognized.
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Folder Selection</span></div>
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
  `}function rs(e,t,o){let n=e.interactions>0||e.tokens>0,s=e.file.startsWith(o)?e.file.slice(o.length).replace(/^[/\\]/,""):Hn(e.file),i=Number(e.interactions),r=i>0?`<strong>${d(String(i))}</strong>`:'<span style="color: var(--text-muted);">0</span>',a=Number(e.tokens),l=a>0?`<strong title="${d(String(a.toLocaleString()))} tokens">${d(String(C(a)))}</strong>`:'<span style="color: var(--text-muted);">0</span>';return`
    <tr style="${n?"":"opacity: 0.45;"}">
      <td>${t+1}</td>
      <td title="${d(e.file)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d(s)}</td>
      <td>${d(String(zt(e.size)))}</td>
      <td>${r}</td>
      <td>${l}</td>
      <td>${ft(e.modified)}</td>
    </tr>`}function as(e,t,o,n,s){let i=e.filter(b=>b.interactions>0||b.tokens>0),r=e.reduce((b,h)=>b+Number(h.interactions),0),a=e.reduce((b,h)=>b+Number(h.tokens),0),l=[...e].sort((b,h)=>{let x=b.interactions*1e3+b.tokens;return h.interactions*1e3+h.tokens-x}),u=n?`<div class="info-box" style="margin-bottom: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);">
        <div>\u26A0\uFE0F Scan limit reached (500 files). Results may be incomplete. Try a more specific subfolder.</div>
      </div>`:"",p=`
    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
      <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
      <div style="font-size: 14px;">No matching files found in this folder.</div>
      <div style="font-size: 12px; margin-top: 8px;">Try a different folder path or tool type.</div>
    </div>`,c=l.map((b,h)=>rs(b,h,s)).join("");return`
    <div class="section" style="margin-top: 0;">
      <div class="section-title"><span class="codicon codicon-graph"></span><span>Analysis Results</span></div>
      ${u}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Files Scanned</div>
          <div class="summary-value">${d(String(t))}${n?"+":""}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u2705 With Sessions</div>
          <div class="summary-value">${i.length}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${e.length-i.length} empty / unknown</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F4AC} Interactions</div>
          <div class="summary-value">${d(String(r))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1FA99} Tokens</div>
          <div class="summary-value" title="${d(String(a.toLocaleString()))} tokens">${d(String(C(a)))}</div>
        </div>
        ${o>0?`
        <div class="summary-card" style="border-left: 3px solid #d97706;">
          <div class="summary-label">\u26A0\uFE0F Unreadable</div>
          <div class="summary-value" style="color: #d97706;">${d(String(o))}</div>
        </div>`:""}
      </div>
      ${e.length===0?p:`
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
            <tbody>${c}</tbody>
          </table>
        </div>`}
    </div>`}var ls=["allTime","lastMonth","currentMonth","thisWeek","today"],ds={today:"today",thisWeek:"week",currentMonth:"month",lastMonth:"lastMonth",allTime:"all",yesterday:"yesterday"},cs={today:"today",week:"thisWeek",month:"currentMonth",lastMonth:"lastMonth",all:"allTime",yesterday:"yesterday"};function us(e,t=!1){let o=be(e),n=Object.keys(o).sort().map(i=>`<option value="${d(i)}">${d(M(i))} ${d(i)} (${o[i].count})</option>`).join("");return`
    <div class="info-box">
      <div class="info-box-title">\u{1F9EE} Model Usage Breakdown</div>
      <div>
        Aggregates the exact per-model token usage and estimated cost the dashboard uses,
        for a single editor or across all of them. Handy for spotting model/pricing
        mismatches behind an unexpected cost total (e.g. tokens attributed to the wrong model tier).
        Updates automatically when you change the editor or time range below.
      </div>
    </div>
    <div class="section">
      <div class="section-title">\u{1F3AF} Select Editor &amp; Time Range</div>
      <div class="folder-input-row">
        <select id="model-usage-editor-select" class="tool-type-select" ${t?"disabled":""}>
          <option value="all">\u{1F310} All Editors</option>
          ${n}
        </select>
        <span id="model-usage-time-selector"></span>
        <span id="model-usage-status" style="font-size: 12px; color: var(--text-muted);">${d(t?"\u23F3 Loading sessions\u2026":"")}</span>
      </div>
    </div>
    <div id="model-usage-results"></div>
  `}function ve(e=!1){let t=document.getElementById("model-usage-time-selector");if(!t)return;t.replaceChildren();let o=cs[Nt]??"allTime",{select:n}=Le({id:"model-usage-time-select",selected:o,periods:ls,extraOptions:[{value:"yesterday",label:"Yesterday"}],label:"",onChange:s=>{let i=ds[s];i&&(Nt=i,Ft())}});n.disabled=e,t.append(n)}function ps(e,t){return`
    <tr>
      <td>${d(e.model)}</td>
      <td title="${e.sessionCount} session(s)">${e.sessionCount.toLocaleString()}</td>
      <td title="${e.inputTokens.toLocaleString()} tokens">${C(e.inputTokens)}</td>
      <td title="${e.outputTokens.toLocaleString()} tokens">${C(e.outputTokens)}</td>
      <td title="${e.cacheCreationTokens.toLocaleString()} tokens">${C(e.cacheCreationTokens)}</td>
      ${t?`<td title="${e.cacheCreation1hTokens.toLocaleString()} tokens">${C(e.cacheCreation1hTokens)}</td>`:""}
      <td title="${e.cachedReadTokens.toLocaleString()} tokens">${C(e.cachedReadTokens)}</td>
      <td>$${e.estimatedCost.toFixed(2)}</td>
    </tr>`}function Lo(e,t){let o=e-t;return o<=0?"":`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u2139\uFE0F ${o} session(s) have no per-model data</div>
      <div>
        This is often expected, not a bug. Common causes: chat-only sessions stored in a
        database with no model/token columns (e.g. Copilot CLI's session-store.db), older
        or truncated session logs written before an editor started recording per-model
        attribution, or sessions that never made a model-backed request (e.g. empty/aborted
        chats).
      </div>
    </div>`}var bs={all:"All Time",lastMonth:"Last Month",month:"Current Month",week:"This Week",today:"Today",yesterday:"Yesterday"};function ms(e,t,o,n,s,i=!0,r="all"){let a=e==="all"?"All Editors":e,l=bs[r]||"All Time",u=r==="all"?a:`${a} \u2014 ${l}`;if(n.length===0)return`
      <div class="section" style="margin-top: 0;">
        <div style="padding: 32px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
          <div style="font-size: 14px;">No per-model usage data found for ${d(u)}.</div>
          <div style="font-size: 12px; margin-top: 8px;">${t} session file(s) matched, ${o} had model attribution data.</div>
        </div>
      </div>
      ${Lo(t,o)}`;let p=n.map(c=>ps(c,i)).join("");return`
    <div class="section" style="margin-top: 0;">
      <div class="section-title">\u{1F4CA} Results \u2014 ${d(u)}</div>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Session Files</div>
          <div class="summary-value">${t}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${o} with model data</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F9E9} Models</div>
          <div class="summary-value">${n.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F4B0} Est. Total Cost</div>
          <div class="summary-value">$${s.toFixed(2)}</div>
        </div>
      </div>
      <div class="table-container" style="margin-top: 12px; max-height: 420px;">
        <table class="session-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Sessions</th>
              <th>Input</th>
              <th>Output</th>
              <th>Cache Create</th>
              ${i?"<th>Cache Create (1h)</th>":""}
              <th>Cache Read</th>
              <th>Est. Cost</th>
            </tr>
          </thead>
          <tbody>${p}</tbody>
        </table>
      </div>
      ${Lo(t,o)}
    </div>`}function Oo(e){let t=[],o=new Map;for(let n of e||[]){let s=String(n.dir||"").replace(/\\/g,"/"),i=s.match(/^(.*\/\.copilot\/jb)\/[^/]+\/?$/);if(i){let r=i[1],a=o.get(r);if(a)a.count+=n.count;else{let l=s.length-r.length,u=n.dir.slice(0,n.dir.length-l);o.set(r,{dir:u,count:n.count,editorName:n.editorName||"JetBrains"})}}else t.push(n)}for(let n of o.values())t.push(n);return t}function gs(){let e=window;return e.process?.env?.HOME||e.process?.env?.USERPROFILE||""}function hs(e,t){let o=e.dir;t&&o.startsWith(t)&&(o=o.replace(t,"~"));let n=e.editorName||"Unknown",s=document.createElement("tr"),i=document.createElement("td");i.setAttribute("title",e.dir),i.textContent=o,s.appendChild(i);let r=document.createElement("td"),a=document.createElement("span");a.className=Ot(n),a.textContent=`${M(n)} ${n}`,r.appendChild(a),s.appendChild(r);let l=document.createElement("td");l.textContent=String(e.count),s.appendChild(l);let u=document.createElement("td"),p=document.createElement("a");if(p.href="#",p.className="reveal-link",p.setAttribute("data-path",encodeURIComponent(e.dir)),p.textContent="Open directory",u.appendChild(p),n==="Unknown"){let c=document.createElement("a");c.href="#",c.className="report-editor-link",c.setAttribute("data-path",encodeURIComponent(e.dir)),c.setAttribute("title","Report this unknown path so we can add editor support"),c.textContent="\u{1F4E2} Report",u.appendChild(document.createTextNode(" ")),u.appendChild(c)}return s.appendChild(u),s}function Fo(e){let t=[...e].sort((h,x)=>x.count-h.count),o=t.reduce((h,x)=>h+x.count,0),n=gs(),s=document.createElement("div");s.className="session-folders-table";let i=document.createElement("h4");i.textContent="Main Session Folders (by editor root):",s.appendChild(i);let r=document.createElement("table");r.className="session-table",s.appendChild(r);let a=document.createElement("thead");r.appendChild(a);let l=document.createElement("tr");a.appendChild(l);for(let h of["Folder","Editor","# of Sessions","Open"]){let x=document.createElement("th");x.textContent=h,l.appendChild(x)}let u=document.createElement("tbody");r.appendChild(u);for(let h of t)u.appendChild(hs(h,n));let p=document.createElement("tr");p.style.borderTop="2px solid #5a5a5a",p.style.fontWeight="600",p.style.background="rgba(255, 255, 255, 0.05)";let c=document.createElement("td");c.setAttribute("colspan","2"),c.style.textAlign="right",c.style.paddingRight="16px",c.textContent="Total:",p.appendChild(c);let b=document.createElement("td");return b.textContent=String(o),p.appendChild(b),p.appendChild(document.createElement("td")),u.appendChild(p),s}function zo(){document.querySelectorAll(".open-storage-link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let o=decodeURIComponent(e.getAttribute("data-path")||"");o&&m.postMessage({command:"revealPath",path:o})})})}function fe(){document.getElementById("btn-authenticate-github")?.addEventListener("click",()=>{m.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-sign-out-github")?.addEventListener("click",()=>{m.postMessage({command:"signOutGitHub"})})}function ye(e){let t=document.querySelector(`.subtab[data-subtab="${e}"]`),o=document.getElementById(`subtab-${e}`);if(t&&o){let n=t.closest(".subtab-bar");return n&&n.querySelectorAll(".subtab").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(s=>s.classList.remove("active")),t.classList.add("active"),o.classList.add("active"),!0}return!1}function Ht(e){let t=document.querySelector(`.tab[data-tab="${e}"]`),o=document.getElementById(`tab-${e}`);return t&&o?(document.querySelectorAll(".tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(n=>n.classList.remove("active")),t.classList.add("active"),o.classList.add("active"),!0):!1}var Uo={diagnostics:["report","sessions","cache","path-analyzer"],research:["model-usage","tool-analysis","otel-delta"],settings:["display","backend","github","debug"]};function vs(e){for(let[t,o]of Object.entries(Uo))if(o.includes(e))return t;return"diagnostics"}function fs(e){return Uo[e]?.find(t=>document.querySelector(`.tab[data-tab="${t}"]`))}function qo(e){let t=document.querySelector(`.group-tab[data-group="${e}"]`),o=document.querySelector(`.leaf-tabs[data-group="${e}"]`);return!t||!o?!1:(document.querySelectorAll(".group-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".leaf-tabs").forEach(n=>{n.style.display="none"}),t.classList.add("active"),o.style.display="flex",!0)}function ys(){document.querySelectorAll(".group-tab").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-group");if(!t||!qo(t))return;if(!document.querySelector(`.leaf-tabs[data-group="${t}"] .tab.active`)){let n=fs(t);n&&Ht(n)&&I.patch({activeTab:n})}})})}function jo(){document.querySelectorAll(".sortable").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-sort");t&&(Z===t?K=K==="desc"?"asc":"desc":(Z=t,K="desc"),et())})})}function Go(){document.querySelectorAll(".editor-panel").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-editor");Q=t===""?null:t,et()})})}function Vo(){document.querySelectorAll(".context-ref-filter").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-ref-type");J===t?J=null:J=t,et()})})}function Wo(){let e=document.getElementById("show-only-unattributed");e&&e.addEventListener("change",()=>{pe=e.checked,et()})}function Zo(){let e=document.getElementById("hide-empty-sessions");e&&e.addEventListener("change",()=>{gt=e.checked,et()})}function xe(){document.getElementById("btn-configure-backend")?.addEventListener("click",()=>{m.postMessage({command:"configureBackend"})}),document.getElementById("btn-configure-backend-team")?.addEventListener("click",()=>{I.patch({activeTab:"backend",activeSubtab:"backend-teamserver"}),m.postMessage({command:"configureTeamServer"})}),document.getElementById("btn-team-server-auth-warning")?.addEventListener("click",()=>{m.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-open-settings")?.addEventListener("click",()=>{m.postMessage({command:"openSettings"})}),document.getElementById("btn-open-display-settings")?.addEventListener("click",()=>{m.postMessage({command:"openDisplaySettings"})})}function xs(){document.getElementById("select-show-tokens")?.addEventListener("change",e=>{let t=e.target.value;m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showTokens",value:t})}),document.getElementById("select-show-cost")?.addEventListener("change",e=>{let t=e.target.value;m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showCost",value:t})}),document.getElementById("input-monthly-budget")?.addEventListener("change",e=>{let t=e.target,o=parseFloat(t.value),n=isNaN(o)?0:Math.min(99999,Math.max(0,Math.round(o*100)/100));t.value=n.toString(),m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.monthlyBudget",value:n})})}function Se(){document.querySelectorAll(".subtab").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-subtab");if(!t)return;let o=e.closest(".subtab-bar");o&&o.querySelectorAll(".subtab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(n=>n.classList.remove("active")),e.classList.add("active"),document.getElementById(`subtab-${t}`)?.classList.add("active"),I.patch({activeSubtab:t})})})}function et(){let e=document.getElementById("session-table-container");e&&(e.innerHTML=No(ht,tt),tt||(jo(),Go(),Vo(),Zo(),Wo(),Ko()))}function Ss(){document.querySelectorAll(".tool-analysis-table").forEach(e=>{let t=e.getAttribute("data-rows");if(!t)return;let o=JSON.parse(decodeURIComponent(t)),n=e.getAttribute("data-baseline"),s=n?parseFloat(n):NaN,i=e.querySelector("tbody");i&&(i.innerHTML=Ce(o,s));let r=e.querySelector("thead");r&&(r.innerHTML=$e())}),ke()}function ke(){document.querySelectorAll(".tool-sortable").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-sort");t&&(Pt===t?Y=Y==="desc"?"asc":"desc":(Pt=t,Y=t==="tool"?"asc":"desc"),Ss())})}),document.getElementById("btn-open-tool-families-settings")?.addEventListener("click",()=>{m.postMessage({command:"openToolFamiliesSettings"})})}function Ko(){document.querySelectorAll(".session-file-link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let o=decodeURIComponent(e.getAttribute("data-file")||"");m.postMessage({command:"openSessionFile",file:o})})}),document.querySelectorAll(".view-formatted-link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let o=decodeURIComponent(e.getAttribute("data-file")||"");m.postMessage({command:"openFormattedJsonlFile",file:o})})}),document.querySelectorAll(".reveal-link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let o=decodeURIComponent(e.getAttribute("data-path")||"");m.postMessage({command:"revealPath",path:o})})}),document.querySelectorAll(".report-editor-link").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();let o=decodeURIComponent(e.getAttribute("data-path")||"");m.postMessage({command:"reportNewEditorPath",path:o})})})}function ce(){let e=document.getElementById("tab-cache");if(e){let t=e.querySelectorAll(".summary-card");if(t.length>=4){let o=t[0]?.querySelector(".summary-value");o&&(o.textContent="0");let n=t[1]?.querySelector(".summary-value");n&&(n.textContent="0 MB");let s=t[2]?.querySelector(".summary-value");s&&(s.textContent="Never");let i=t[3]?.querySelector(".summary-value");i&&(i.textContent="N/A")}}}function ks(){document.getElementById("btn-browse-folder")?.addEventListener("click",()=>{m.postMessage({command:"pickFolder"})}),document.getElementById("btn-analyze-folder")?.addEventListener("click",()=>{let e=document.getElementById("folder-path-input"),t=document.getElementById("tool-type-select"),o=e?.value.trim()??"";if(!o){e&&(e.style.borderColor="#d97706",e.focus());return}e&&(e.style.borderColor="");let n=document.getElementById("btn-analyze-folder");n&&(n.disabled=!0,n.innerHTML="<span>\u23F3</span><span>Analyzing\u2026</span>");let s=document.getElementById("folder-analysis-results");s&&(s.innerHTML=`
          <div class="analyzer-loading">
            <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
            <span>Scanning files\u2026</span>
          </div>`),m.postMessage({command:"analyzeFolder",folderPath:o,toolType:t?.value??"auto"})})}function Ft(){let e=document.getElementById("model-usage-editor-select");if(!e||e.disabled)return;let t=e.value||"all",o=Nt||"all",n=document.getElementById("model-usage-results");n&&(n.innerHTML=`
        <div class="analyzer-loading">
          <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
          <span>Aggregating model usage\u2026</span>
        </div>`),m.postMessage({command:"analyzeModelUsage",editor:t,timeRange:o})}function Cs(){document.getElementById("model-usage-editor-select")?.addEventListener("change",()=>{Ft()})}function $s(e){let t=document.getElementById("model-usage-results");if(t){if(typeof e.timeRange=="string"&&e.timeRange&&(Nt=e.timeRange,ve(!1)),e.stillLoading){t.innerHTML=`
      <div class="info-box" style="margin-top: 12px;">
        <div class="info-box-title">\u23F3 Still loading session files</div>
        <div>Session files are still being scanned in the background. Wait a moment (watch the "Session Files" tab count) and try again.</div>
      </div>`;return}t.innerHTML=ms(String(e.editor||"all"),Number(e.fileCount||0),Number(e.filesWithUsage||0),e.rows||[],Number(e.totalCost||0),e.supportsCache1h!==!1,String(e.timeRange||"all"))}}function ws(){document.querySelectorAll(".tab").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-tab");if(t&&Ht(t)&&(I.patch({activeTab:t}),t==="model-usage")){let o=document.getElementById("model-usage-results");o&&!o.innerHTML.trim()&&Ft()}})})}function Es(e){e.style.background="#d97706",e.innerHTML="<span>\u23F3</span><span>Clearing...</span>",e instanceof HTMLButtonElement&&(e.disabled=!0),ce(),m.postMessage({command:"clearCache"})}function Ts(e){let t=e.getAttribute("data-key"),n=e.closest("tr")?.querySelector(".debug-counter-input");if(t&&n){let s=parseInt(n.value,10);isNaN(s)||m.postMessage({command:"setDebugCounter",key:t,value:s})}}function As(e){let t=e.getAttribute("data-key"),n=e.closest("tr")?.querySelector(".debug-flag-input");t&&n&&m.postMessage({command:"setDebugFlag",key:t,value:n.checked})}function Is(e){let t=e.target;t&&((t.id==="btn-clear-cache"||t.id==="btn-clear-cache-tab")&&Es(t),(t.id==="btn-reset-insights"||t.id==="btn-reset-insights-tab")&&m.postMessage({command:"resetInsightsState"}),t.id==="btn-reset-debug-counters"&&m.postMessage({command:"resetDebugCounters"}),t.id==="btn-reset-discovered-editors"&&m.postMessage({command:"resetDiscoveredEditors"}),t.classList.contains("debug-counter-set")&&Ts(t),t.classList.contains("debug-flag-set")&&As(t))}function Ms(){document.getElementById("btn-refresh")?.addEventListener("click",()=>m.postMessage({command:"refresh"})),document.getElementById("btn-chart")?.addEventListener("click",()=>m.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>m.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-details")?.addEventListener("click",()=>m.postMessage({command:"showDetails"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>m.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>m.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>m.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>m.postMessage({command:"showEnvironmental"})),Te(m)}function Ls(){document.getElementById("btn-copy")?.addEventListener("click",()=>{m.postMessage({command:"copyReport"})}),document.getElementById("btn-issue")?.addEventListener("click",()=>{m.postMessage({command:"openIssue"})}),document.getElementById("btn-clear-cache")?.addEventListener("click",()=>{let e=document.getElementById("btn-clear-cache");e&&(e.style.background="#d97706",e.innerHTML="<span>\u23F3</span><span>Clearing...</span>",e.disabled=!0),ce(),m.postMessage({command:"clearCache"})}),document.getElementById("btn-clear-cache-tab")?.addEventListener("click",()=>{let e=document.getElementById("btn-clear-cache-tab");e&&(e.style.background="#d97706",e.innerHTML="<span>\u23F3</span><span>Clearing...</span>",e.disabled=!0),ce(),m.postMessage({command:"clearCache"})}),document.addEventListener("click",Is),Ms()}function _s(e){if(!e.report)return;let t=document.getElementById("tab-report");if(!t)return;let o=Po(e.report),n=t.querySelector(".report-content");n&&(n.textContent=o)}function Ds(e){if(!e.backendStorageInfo){console.warn("diagnosticDataLoaded received but backendStorageInfo is missing or undefined");return}vt=e.backendStorageInfo,e.githubAuth!==void 0&&(X=e.githubAuth);let t=document.getElementById("tab-backend");if(!t)return;let n=t.querySelector(".subtab.active")?.getAttribute("data-subtab")??I.restore().activeSubtab;t.innerHTML=he(vt,X),xe(),Se(),n&&(ye(n),I.patch({activeSubtab:n}))}function Bs(e){if(!e.sessionFolders||e.sessionFolders.length===0)return;let t=document.getElementById("tab-report");if(!t)return;let o=Oo(e.sessionFolders),n=Fo(o),s=t.querySelector(".session-folders-table");if(s)s.replaceWith(n);else{let i=t.querySelector(".report-content");i?i.insertAdjacentElement("afterend",n):t.appendChild(n)}zo()}function Rs(e){if(!e.candidatePaths||e.candidatePaths.length===0)return;let t=document.getElementById("tab-report");if(!t)return;t.querySelector(".candidate-paths-table")?.remove();let o=Nn(e.candidatePaths),n=t.querySelector(".session-folders-table");if(n)n.insertAdjacentElement("afterend",o);else{let s=t.querySelector(".report-content");s?s.insertAdjacentElement("afterend",o):t.appendChild(o)}}function Jo(e,t,o){let n=document.getElementById(`tab-${e}`);if(!n)return;let s=n.classList.contains("active"),i=document.createElement("div");i.innerHTML=t;let r=i.firstElementChild;r&&(s&&r.classList.add("active"),n.replaceWith(r),o?.())}function Ps(e){if(e.githubAuth===void 0)return;let t=document.getElementById("tab-github");t&&(t.innerHTML=ge(e.githubAuth),fe())}function Ns(e){if(e.toolFamilies&&(de=e.toolFamilies),e.toolCallStats===void 0)return;let t=Qo(e.toolCallStats,de);Jo("tool-analysis",t,ke)}function Yo(){Jo("otel-delta",en(ue,Rt),Xo)}function Xo(){let e=document.getElementById("otel-delta-period");e&&e.addEventListener("change",()=>{Rt=e.value,I.patch({otelDeltaPeriod:Rt}),Yo()})}function Hs(e){e.otelComparison!==void 0&&(ue=e.otelComparison,Yo())}function Os(e){_s(e),Ds(e),Bs(e),Rs(e),Ps(e),Ns(e),Hs(e)}function Fs(e){X=e.githubAuth;let t=document.getElementById("tab-github");t&&(t.innerHTML=ge(X),fe());let o=document.getElementById("tab-backend");if(o&&vt){let s=o.querySelector(".subtab.active")?.getAttribute("data-subtab");o.innerHTML=he(vt,X),xe(),Se(),s&&ye(s)}}function zs(e){console.error("Error loading diagnostic data:",e.error);let t=document.getElementById("root");if(t){let o=document.createElement("div");o.style.cssText="color: #ff6b6b; padding: 20px; text-align: center;",o.innerHTML=`
<h3><span class="codicon codicon-warning"></span> Error Loading Diagnostic Data</h3>
<p>${d(e.error||"Unknown error")}</p>
`,t.insertBefore(o,t.firstChild)}}function _o(e){return!e||typeof e!="object"?{}:Object.fromEntries(Object.entries(e).map(([t,o])=>[t,Number(o??0)||0]))}function k(e){return Number(e??0)||0}function W(e){return e==null?void 0:String(e)}function Do(e){return e==null?null:String(e)}function Us(e){return{file:k(e.file),symbol:k(e.symbol),selection:k(e.selection),implicitSelection:k(e.implicitSelection),codebase:k(e.codebase),workspace:k(e.workspace),terminal:k(e.terminal),vscode:k(e.vscode),terminalLastCommand:k(e.terminalLastCommand),terminalSelection:k(e.terminalSelection),clipboard:k(e.clipboard),changes:k(e.changes),outputPanel:k(e.outputPanel),problemsPanel:k(e.problemsPanel),pullRequest:k(e.pullRequest),byKind:_o(e.byKind),copilotInstructions:k(e.copilotInstructions),agentsMd:k(e.agentsMd),byPath:_o(e.byPath)}}function qs(e){if(Array.isArray(e.childInfo))return e.childInfo.filter(t=>!!t&&typeof t=="object").map(t=>({uuid:String(t.uuid??""),name:String(t.name??""),sessionFile:W(t.sessionFile)}))}function js(e){if(!e.parentInfo||typeof e.parentInfo!="object")return;let t=e.parentInfo;return{uuid:String(t.uuid??""),name:String(t.name??""),sessionFile:W(t.sessionFile)}}function Gs(e){let t=e??{},o=t.contextReferences??{};return{file:String(t.file??t.sessionFile??""),editorSource:String(t.editorSource??""),editorRoot:W(t.editorRoot),editorName:W(t.editorName),title:W(t.title),repository:W(t.repository),size:k(t.size),modified:String(t.modified??""),tokens:k(t.tokens),interactions:k(t.interactions),firstInteraction:Do(t.firstInteraction),lastInteraction:Do(t.lastInteraction),contextReferences:Us(o),parentInfo:js(t),childInfo:qs(t),totalChildCount:t.totalChildCount===null||t.totalChildCount===void 0?void 0:Number(t.totalChildCount)}}function Vs(e){return Array.isArray(e)?e.map(Gs):[]}function Ws(e){let t=Number(e.processed||0),o=Number(e.total||0),n=o>0?`Analyzing files\u2026 (${t} / ${o})`:"Analyzing files\u2026",s=document.getElementById("session-loading-subtext");s&&(s.textContent=n);let i=document.getElementById("model-usage-status");i&&(i.textContent=o>0?`\u23F3 Loading sessions\u2026 (${t}/${o})`:"\u23F3 Loading sessions\u2026")}function Zs(e){ht=Vs(e.detailedSessionFiles),tt=!1;let t=document.querySelector('.tab[data-tab="sessions"]');t&&(t.textContent=`\u{1F4C1} Session Files (${ht.length})`);let o=document.getElementById("model-usage-editor-select");if(o){let s=be(ht),i=Object.keys(s).sort().map(r=>`<option value="${d(r)}">${d(M(r))} ${d(r)} (${s[r].count})</option>`).join("");o.innerHTML=`<option value="all">\u{1F310} All Editors</option>${i}`,o.disabled=!1}ve(!1);let n=document.getElementById("model-usage-status");n&&(n.textContent=""),Ft(),et()}function Ks(){let e=document.getElementById("btn-clear-cache"),t=document.getElementById("btn-clear-cache-tab");e&&(e.style.background="#2d6a4f",e.innerHTML="<span>\u2705</span><span>Cache Cleared</span>",e.disabled=!1),t&&(t.style.background="#2d6a4f",t.innerHTML="<span>\u2705</span><span>Cache Cleared</span>",t.disabled=!1),setTimeout(()=>{e&&(e.style.background="",e.innerHTML="<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>"),t&&(t.style.background="",t.innerHTML="<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>")},2e3)}function Js(e,t){if(t.length<4)return;let o=t[0]?.querySelector(".summary-value");o&&(o.textContent=String(e.size));let n=t[1]?.querySelector(".summary-value");n&&(n.textContent=`${e.sizeInMB.toFixed(2)} MB`);let s=t[2]?.querySelector(".summary-value");s&&(s.textContent=new Date(e.lastUpdated).toLocaleString());let i=t[3]?.querySelector(".summary-value");i&&(i.textContent="0 seconds ago")}function Ys(e){if(!e.cacheInfo)return;let t=document.getElementById("tab-cache");t&&Js(e.cacheInfo,t.querySelectorAll(".summary-card"))}function Xs(e){let t=document.getElementById("folder-path-input");t&&e.folderPath&&(t.value=e.folderPath,t.style.borderColor="")}function Qs(e){let t=document.getElementById("btn-analyze-folder");t&&(t.disabled=!1,t.innerHTML="<span>\u{1F50D}</span><span>Analyze</span>");let o=document.getElementById("folder-analysis-results");o&&(e.error?o.innerHTML=`
        <div class="info-box" style="border-color: #d97706; background: rgba(217,119,6,0.08); margin-top: 12px;">
          <div class="info-box-title">\u26A0\uFE0F Analysis Error</div>
          <div>${d(e.error)}</div>
        </div>`:o.innerHTML=as(e.files||[],e.totalScanned||0,e.parseErrors||0,e.truncated||!1,d(String(e.folderPath||""))))}function ti(){window.addEventListener("message",e=>{let t=e.data;t.command==="diagnosticDataLoaded"?Os(t):t.command==="githubAuthUpdated"?Fs(t):t.command==="diagnosticDataError"?zs(t):t.command==="sessionFilesLoaded"&&t.detailedSessionFiles?Zs(t):t.command==="sessionFilesLoadProgress"?Ws(t):t.command==="cacheCleared"?Ks():t.command==="cacheRefreshed"?Ys(t):t.command==="folderPicked"?Xs(t):t.command==="folderAnalysisResult"?Qs(t):t.command==="modelUsageResult"&&$s(t)})}function ei(e){return`
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
<div class="summary-value">${e.cacheInfo?.size||0}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4BE} Cache Size</div>
<div class="summary-value">${e.cacheInfo?.sizeInMB?e.cacheInfo.sizeInMB.toFixed(2)+" MB":"N/A"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F552} Last Updated</div>
<div class="summary-value" style="font-size: 14px;">${e.cacheInfo?.lastUpdated?ft(e.cacheInfo.lastUpdated):"Never"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u23F1\uFE0F Cache Age</div>
<div class="summary-value" style="font-size: 14px;">${e.cacheInfo?.lastUpdated?xt(e.cacheInfo.lastUpdated):"N/A"}</div>
</div>
</div>
<div class="cache-location">
<h4>Storage Location</h4>
<div class="location-box">
<code>${d(e.cacheInfo?.location||"VS Code Global State")}</code>
${e.cacheInfo?.storagePath?` <a href="#" class="open-storage-link" data-path="${encodeURIComponent(e.cacheInfo.storagePath)}">Open storage location</a>`:""}
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
</div>`}function E(e,t){return e===t?"selected":""}function oi(e){return`<div class="backend-card">
<h4>\u{1F4CA} API Quota Information</h4>
${e.quotaEntitlements?`<p>
${e.quotaEntitlements.premium_interactions?`<strong>Premium Interactions:</strong> $${e.quotaEntitlements.premium_interactions.toFixed(2)}/month<br/>`:""}${e.quotaEntitlements.completions?`<strong>Completions:</strong> $${e.quotaEntitlements.completions.toFixed(2)}/month<br/>`:""}
    </p>`:'<p class="hint">No quota information available from the API yet. Sign out and back in to refresh.</p>'}
</div>`}function ni(){return`<div class="backend-card">
<h4>\u{1F195} Editor Discovery Notifications</h4>
<p>
The extension remembers which editors it has already seen so each editor triggers a discovery notification only once.
Use this reset to clear that memory and start tracking from scratch.
</p>
<div class="button-group">
<button class="button secondary" id="btn-reset-discovered-editors">
<span>\u267B\uFE0F</span>
<span>Reset Discovered Editors</span>
</button>
</div>
</div>`}function si(e){let t=e.displaySettings?.showTokens??"both",o=e.displaySettings?.showCost??"none",n=Math.round((e.displaySettings?.monthlyBudget??0)*100)/100;return`
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
    <option value="none" ${E(t,"none")}>None</option>
    <option value="today" ${E(t,"today")}>Today only</option>
    <option value="last30days" ${E(t,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${E(t,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${E(t,"both")}>Today + last 30 days (default)</option>
    <option value="todayAndCurrentMonth" ${E(t,"todayAndCurrentMonth")}>Today + current calendar month</option>
  </select>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F4B0} Estimated cost (USD):</label>
  <select id="select-show-cost" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${E(o,"none")}>None (hidden)</option>
    <option value="today" ${E(o,"today")}>Today only</option>
    <option value="last30days" ${E(o,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${E(o,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${E(o,"both")}>Today + last 30 days</option>
    <option value="todayAndCurrentMonth" ${E(o,"todayAndCurrentMonth")}>Today + current calendar month</option>
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
  <input id="input-monthly-budget" type="number" min="0" max="99999" step="0.01" value="${n}" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 100px;" />
</div>
<p class="hint">Budget coloring uses the current calendar month's estimated cost. Set to 0 to disable.</p>
${e.quotaEntitlements&&e.quotaEntitlements.premium_interactions?`<p class="hint" style="color: #90ee90;"><strong>\u2139\uFE0F API-driven budget:</strong> Your premium_interactions quota entitlement is <strong>$${e.quotaEntitlements.premium_interactions.toFixed(2)}</strong>/month. If the budget above is 0 or empty, this API value will be used as your effective budget.</p>`:""}
</div>
${oi(e)}
${ni()}
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
</div>`}function Bt(e){return Pt!==e?' <span class="sort-hint">\u2195</span>':Y==="desc"?" \u25BC":" \u25B2"}function ii(e){let t=e.reduce((n,s)=>n+s.calls,0),o=e.reduce((n,s)=>n+s.totalTokens,0);return t>0?o/t:NaN}function ri(e){return[...e].sort((t,o)=>{let n,s;switch(Pt){case"tool":n=t.tool.toLowerCase(),s=o.tool.toLowerCase();break;case"calls":n=t.calls,s=o.calls;break;case"total":n=t.totalTokens,s=o.totalTokens;break;default:n=t.calls>0?t.totalTokens/t.calls:0,s=o.calls>0?o.totalTokens/o.calls:0;break}return n<s?Y==="desc"?1:-1:n>s?Y==="desc"?-1:1:0})}function ai(e,t){let o=e.calls>0?Math.round(e.totalTokens/e.calls):0,n='<td class="tool-ratio">\u2014</td>';if(!e.isBuiltIn&&!isNaN(t)&&t>0&&e.calls>0){let i=e.totalTokens/e.calls/t,r=Number(Math.round(i*100))||0;n=`<td class="tool-ratio ${i<.85?"ratio-better":i>1.15?"ratio-worse":"ratio-neutral"}" title="${r}% of built-in average">${r}%</td>`}else e.isBuiltIn&&(n='<td class="tool-ratio tool-builtin-label">baseline</td>');let s=e.isBuiltIn?' <span class="tool-type-badge built-in">built-in</span>':' <span class="tool-type-badge alternative">alt</span>';return`<tr><td>${d(e.tool)}${s}</td><td>${d(String(e.calls))}</td><td>${C(e.totalTokens)}</td><td>${C(o)}</td>${n}</tr>`}function Ce(e,t=NaN){return ri(e).map(o=>ai(o,t)).join("")}function $e(){return`<tr>
<th class="tool-sortable" data-sort="tool">Tool${Bt("tool")}</th>
<th class="tool-sortable" data-sort="calls">Calls${Bt("calls")}</th>
<th class="tool-sortable" data-sort="total">Total Output Tokens${Bt("total")}</th>
<th class="tool-sortable" data-sort="avg">Avg Tokens / Call${Bt("avg")}</th>
<th>vs Built-in</th>
</tr>`}function li(e,t,o,n){let s=(b,h)=>b.filter(x=>t[x]!==void 0&&(o[x]||0)>0&&!n.has(x)).map(x=>(n.add(x),{tool:x,totalTokens:t[x],calls:o[x]||0,isBuiltIn:h})),i=s(e.builtIn,!0),r=s(e.alternatives,!1),a=[...i,...r];if(a.length===0)return{html:"",rows:[]};let l=ii(i),u=encodeURIComponent(JSON.stringify(a)),p=e.description?` <span class="hint">${d(e.description)}</span>`:"";return{html:`
<div class="tool-family-section">
<h4 class="tool-family-heading">${d(e.name)}${p}</h4>
<table class="session-table tool-analysis-table" data-rows="${u}" data-baseline="${isNaN(l)?"":String(l)}">
<thead>${$e()}</thead>
<tbody>${Ce(a,l)}</tbody>
</table>
</div>`,rows:a}}function Qo(e,t){if(!e||!e.outputTokensByTool||Object.keys(e.outputTokensByTool).length===0)return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Track how many tokens each tool produces as output over the last 30 days. Data is collected as you use the extension \u2014 no output token data has been recorded yet.</div>
</div>
</div>`;let o=e.outputTokensByTool,n=e.byTool,s=new Set,i="";if(t&&t.length>0)for(let a of t){let{html:l}=li(a,o,n,s);i+=l}let r=Object.entries(o).filter(([a])=>!s.has(a)&&(n[a]||0)>0).map(([a,l])=>({tool:a,totalTokens:l,calls:n[a]||0,isBuiltIn:!1}));if(r.length>0){let a=encodeURIComponent(JSON.stringify(r));i+=`
<div class="tool-family-section">
<h4 class="tool-family-heading">Other Tools</h4>
<table class="session-table tool-analysis-table" data-rows="${a}" data-baseline="">
<thead>${$e()}</thead>
<tbody>${Ce(r,NaN)}</tbody>
</table>
</div>`}return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Tokens produced by each tool's output over the last 30 days. Tools are grouped by family. <strong>vs Built-in</strong> shows how an alternative compares to the pooled baseline \u2014 green is more token-efficient. Click column headers to sort within each group. <button class="inline-link" id="btn-open-tool-families-settings">Configure tool families \u2197</button></div>
</div>
${i}
</div>`}function di(e){return e&&e.otelSessionsIndexed>0?"":`<div class="info-box">
<div class="info-box-title">\u{1F4E1} Copilot CLI OpenTelemetry Export Not Detected</div>
<div>
${e?.otelDirExists?`The export directory exists but no session data has been indexed from it yet (${Number(e.otelFileCount)} file(s) found).`:"No <code>~/.copilot/otel</code> directory was found \u2014 the export isn't enabled yet."} Enabling it lets this extension read <strong>exact</strong> token counts (input, output, cache) straight from Copilot CLI instead of estimating them from ratios.<br/><br/>
Set these three environment variables before starting a Copilot CLI session, then run a session and reopen this tab:
<pre style="margin-top:8px;">COPILOT_OTEL_ENABLED=true
COPILOT_OTEL_EXPORTER_TYPE=file
COPILOT_OTEL_FILE_EXPORTER_PATH=~/.copilot/otel/copilot-otel.jsonl</pre>
See <code>docs/COPILOT-CLI-OTEL-EXPORT.md</code> in the repo for full setup steps (Windows/PowerShell and Unix shells) and how to verify it's working.
</div>
</div>`}function tn(e){let t=Number(e)||0;if(t===0)return{text:"0",cssClass:""};let o=t>0?"+":"-",n=t>0?"otel-delta-positive":"otel-delta-negative";return{text:`${o}${C(Math.abs(t))}`,cssClass:n}}function Bo(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function ci(e,t,o){if(t==="all")return!0;if(!e)return!1;let n=new Date(e);if(Number.isNaN(n.getTime()))return!1;let s=Bo(o),i=Bo(n);if(t==="today")return i.getTime()===s.getTime();if(t==="yesterday"){let r=new Date(s);return r.setDate(r.getDate()-1),i.getTime()===r.getTime()}if(t==="week"){let r=new Date(s);return r.setDate(r.getDate()-6),n>=r&&n<=o}return n.getFullYear()===o.getFullYear()&&n.getMonth()===o.getMonth()&&n<=o}function ui(e,t){if(t==="all")return e;let o=new Date,n=e.sessions.filter(r=>ci(r.lastActivity,t,o)),s=n.reduce((r,a)=>r+a.baselineTokens,0),i=n.reduce((r,a)=>r+a.otelTokens,0);return{...e,sessions:n,sessionsMatched:n.length,totalBaselineTokens:s,totalOtelTokens:i,deltaTokens:i-s}}var Ro={all:"All Time",today:"Today",yesterday:"Yesterday",week:"This Week",month:"This Month"};function pi(e){return`<div class="otel-delta-period-row">
<label for="otel-delta-period">Show:</label>
<select id="otel-delta-period" class="otel-delta-period-select">${Object.keys(Ro).map(o=>`<option value="${o}"${o===e?" selected":""}>${Ro[o]}</option>`).join("")}</select>
</div>`}function bi(e){let t=tn(e.deltaTokens),o=Number(e.sessionsMatched)||0,n=Number(e.totalBaselineTokens)||0,s=Number(e.totalOtelTokens)||0,i=Number(e.deltaTokens)||0;return`<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">\u{1F4E1} Sessions With OTel Data</div>
<div class="summary-value">${o.toLocaleString()}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4CA} Previous Estimate (Total)</div>
<div class="summary-value" title="${n.toLocaleString()} tokens">${C(n)}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F3AF} OTel Exact (Total)</div>
<div class="summary-value" title="${s.toLocaleString()} tokens">${C(s)}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u0394 Delta</div>
<div class="summary-value ${t.cssClass}" title="${i.toLocaleString()} tokens">${t.text}</div>
</div>
</div>`}function mi(e){return e.map(t=>{let o=tn(t.delta),n=d(String(t.sessionId??"").slice(0,8)),s=d((Array.isArray(t.models)?t.models:[]).map(a=>String(a)).join(", ")||"\u2014"),i=Number(t.baselineTokens)||0,r=Number(t.otelTokens)||0;return`<tr>
<td title="${d(String(t.sessionId??""))}"><code>${n}</code></td>
<td>${s}</td>
<td title="${i.toLocaleString()} tokens">${C(i)}</td>
<td title="${r.toLocaleString()} tokens">${C(r)}</td>
<td class="${o.cssClass}" title="${(Number(t.delta)||0).toLocaleString()} tokens">${o.text}</td>
</tr>`}).join("")}function en(e,t=Rt){let o=di(e);if(!e||e.sessionsMatched===0)return`<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4E1} OTel vs. Estimated Token Counts</div>
<div>Compares the token counts this extension estimates for Copilot CLI sessions against exact counts read from Copilot CLI's OpenTelemetry export, when available.</div>
</div>
${o}
</div>`;let n=ui(e,t),s=n.sessions.length>0?`<table class="session-table">
<thead><tr><th>Session</th><th>Model(s)</th><th>Previous Estimate</th><th>OTel Exact</th><th>Delta</th></tr></thead>
<tbody>${mi(n.sessions)}</tbody>
</table>`:'<div class="info-box">No Copilot CLI sessions with OTel data in this period. Try a wider range.</div>';return`<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4E1} OTel vs. Estimated Token Counts</div>
<div>
Compares the token counts this extension would normally estimate for each Copilot CLI session against the exact counts read from Copilot CLI's OpenTelemetry file export. A positive delta means OTel revealed usage the estimate missed entirely (e.g. chat-only sessions, which previously reported 0 tokens); near-zero deltas mean the estimate already had exact numbers from a session.shutdown event.<br/>
Checked ${(Number(e.sessionsChecked)||0).toLocaleString()} Copilot CLI session(s) found locally; ${(Number(e.otelSessionsIndexed)||0).toLocaleString()} session(s) are present in the OTel export.
</div>
</div>
${o}
${pi(t)}
${bi(n)}
${s}
</div>`}function gi(e){return`<div id="tab-report" class="tab-content active">
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
<div class="report-content">${e}</div>
</div>`}function hi(e,t,o){return`
<style>${De}</style>
<style>${Be}</style>
<div class="container">
<div class="header">
<div class="header-left">
<span class="header-icon">\u{1F50D}</span>
<span class="header-title">Diagnostic Report</span>
</div>
<div class="button-row">
${Ee("btn-diagnostics",!!e?.backendConfigured)}
</div>
</div>

<div class="tabs group-tabs">
<button class="group-tab active" data-group="diagnostics">\u{1FA7A} Diagnostics</button>
<button class="group-tab" data-group="research">\u{1F52C} Research</button>
<button class="group-tab" data-group="settings">\u2699\uFE0F Settings</button>
</div>

<div class="tabs leaf-tabs" data-group="diagnostics" style="display: flex;">
<button class="tab active" data-tab="report">\u{1F4CB} Report</button>
<button class="tab" data-tab="sessions">\u{1F4C1} Session Files (${t.length})</button>
<button class="tab" data-tab="cache">\u{1F4BE} Cache</button>
<button class="tab" data-tab="path-analyzer">\u{1F52C} Path Analyzer</button>
</div>

<div class="tabs leaf-tabs" data-group="research" style="display: none;">
<button class="tab" data-tab="model-usage">\u{1F9EE} Model Usage</button>
<button class="tab" data-tab="tool-analysis">\u{1F527} Tool Analysis</button>
<button class="tab" data-tab="otel-delta">\u{1F4E1} OTel Delta</button>
</div>

<div class="tabs leaf-tabs" data-group="settings" style="display: none;">
<button class="tab" data-tab="display">\u2699\uFE0F Display</button>
<button class="tab" data-tab="backend">\u2601\uFE0F Backend Storage</button>
<button class="tab" data-tab="github">\u{1F511} GitHub Auth</button>
${e.isDebugMode?'<button class="tab" data-tab="debug">\u{1F41B} Debug</button>':""}
</div>

${gi(o)}

<div id="tab-sessions" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4C1} Session File Analysis</div>
<div>
This tab shows session files with activity in the last 14 days from all detected editors. </br>
Click on an editor panel to filter, click column headers to sort, and click a file name to open it.
</div>
</div>
<div id="session-table-container">${No(t,t.length===0)}</div>
</div>

${ei(e)}
<div id="tab-backend" class="tab-content">
${he(e.backendStorageInfo,e.githubAuth)}
</div>

<div id="tab-github" class="tab-content">
${ge(e.githubAuth)}
</div>
${si(e)}
${e.isDebugMode?Qn(e.globalStateCounters):""}
<div id="tab-path-analyzer" class="tab-content">
${is()}
</div>
<div id="tab-model-usage" class="tab-content">
${us(t,tt)}
</div>
${Qo(e.toolCallStats,e.toolFamilies)}
${en(e.otelComparison)}
</div>
`}function vi(e){let t=document.getElementById("root");if(!t)return;let o=e.detailedSessionFiles||[];ht=o,tt=o.length===0,vt=e.backendStorageInfo,X=e.githubAuth,ue=e.otelComparison,e.toolFamilies&&(de=e.toolFamilies);let s=e.report===_n?Bn.trim():Po(d(e.report));t.innerHTML=hi(e,o,s);let i=Oo(e.sessionFolders||[]);if(i.length>0){let u=document.getElementById("tab-report")?.querySelector(".report-content");u&&u.insertAdjacentElement("afterend",Fo(i))}ti(),ws(),ys(),jo(),Go(),Vo(),Zo(),Wo(),xe(),Se(),Ko(),zo(),fe(),ks(),Cs(),ve(tt),Ls(),xs(),ke(),Xo();let r=I.restore(),a="report";r?.activeTab&&Ht(r.activeTab)?a=r.activeTab:Ht("report"),qo(vs(a)),r?.activeSubtab&&ye(r.activeSubtab)}async function fi(){if(await Promise.resolve().then(()=>(Eo(),wo)),!To){let e=document.getElementById("root");e&&(e.textContent="No data available.");return}vi(To)}fi();})();
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
