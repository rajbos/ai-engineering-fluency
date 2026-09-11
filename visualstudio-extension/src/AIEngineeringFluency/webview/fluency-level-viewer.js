"use strict";(()=>{var Ue=Object.defineProperty;var l=(n,t,e)=>()=>{if(e)throw e[0];try{return n&&(t=n(n=0)),t}catch(o){throw e=[o],o}};var He=(n,t)=>{for(var e in t)Ue(n,e,{get:t[e],enumerable:!0})};var nt,rt,mt,Gt,F,st,B,Jt,bt,vt=l(()=>{nt=globalThis,rt=nt.ShadowRoot&&(nt.ShadyCSS===void 0||nt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,mt=Symbol(),Gt=new WeakMap,F=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==mt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(rt&&t===void 0){let o=e!==void 0&&e.length===1;o&&(t=Gt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&Gt.set(e,t))}return t}toString(){return this.cssText}},st=n=>new F(typeof n=="string"?n:n+"",void 0,mt),B=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((o,r,s)=>o+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+n[s+1],n[0]);return new F(e,n,mt)},Jt=(n,t)=>{if(rt)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let o=document.createElement("style"),r=nt.litNonce;r!==void 0&&o.setAttribute("nonce",r),o.textContent=e.cssText,n.appendChild(o)}},bt=rt?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let o of t.cssRules)e+=o.cssText;return st(e)})(n):n});var Ge,Je,Ye,Ze,Xe,Qe,A,Yt,to,eo,V,j,it,Zt,x,K=l(()=>{vt();vt();({is:Ge,defineProperty:Je,getOwnPropertyDescriptor:Ye,getOwnPropertyNames:Ze,getOwnPropertySymbols:Xe,getPrototypeOf:Qe}=Object),A=globalThis,Yt=A.trustedTypes,to=Yt?Yt.emptyScript:"",eo=A.reactiveElementPolyfillSupport,V=(n,t)=>n,j={toAttribute(n,t){switch(t){case Boolean:n=n?to:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},it=(n,t)=>!Ge(n,t),Zt={attribute:!0,type:String,converter:j,reflect:!1,useDefault:!1,hasChanged:it};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),A.litPropertyMetadata??(A.litPropertyMetadata=new WeakMap);x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Zt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let o=Symbol(),r=this.getPropertyDescriptor(t,o,e);r!==void 0&&Je(this.prototype,t,r)}}static getPropertyDescriptor(t,e,o){let{get:r,set:s}=Ye(this.prototype,t)??{get(){return this[e]},set(i){this[e]=i}};return{get:r,set(i){let c=r?.call(this);s?.call(this,i),this.requestUpdate(t,c,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Zt}static _$Ei(){if(this.hasOwnProperty(V("elementProperties")))return;let t=Qe(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(V("properties"))){let e=this.properties,o=[...Ze(e),...Xe(e)];for(let r of o)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[o,r]of e)this.elementProperties.set(o,r)}this._$Eh=new Map;for(let[e,o]of this.elementProperties){let r=this._$Eu(e,o);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let o=new Set(t.flat(1/0).reverse());for(let r of o)e.unshift(bt(r))}else t!==void 0&&e.push(bt(t));return e}static _$Eu(t,e){let o=e.attribute;return o===!1?void 0:typeof o=="string"?o:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Jt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){let o=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,o);if(r!==void 0&&o.reflect===!0){let s=(o.converter?.toAttribute!==void 0?o.converter:j).toAttribute(e,o.type);this._$Em=t,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){let o=this.constructor,r=o._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let s=o.getPropertyOptions(r),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:j;this._$Em=r;let c=i.fromAttribute(e,s.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(t,e,o,r=!1,s){if(t!==void 0){let i=this.constructor;if(r===!1&&(s=this[t]),o??(o=i.getPropertyOptions(t)),!((o.hasChanged??it)(s,e)||o.useDefault&&o.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,o))))return;this.C(t,e,o)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:r,wrapped:s},i){o&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??e??this[t]),s!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let o=this.constructor.elementProperties;if(o.size>0)for(let[r,s]of o){let{wrapped:i}=s,c=this[r];i!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,s,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(o=>o.hostUpdate?.()),this.update(e)):this._$EM()}catch(o){throw t=!1,this._$EM(),o}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[V("elementProperties")]=new Map,x[V("finalized")]=new Map,eo?.({ReactiveElement:x}),(A.reactiveElementVersions??(A.reactiveElementVersions=[])).push("2.1.2")});function ce(n,t){if(!St(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Qt!==void 0?Qt.createHTML(t):t}function P(n,t,e=n,o){if(t===b)return t;let r=o!==void 0?e._$Co?.[o]:e._$Cl,s=J(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(n),r._$AT(n,e,o)),o!==void 0?(e._$Co??(e._$Co=[]))[o]=r:e._$Cl=r),r!==void 0&&(t=P(n,r._$AS(n,t.values),r,o)),t}var W,Xt,at,Qt,se,S,ie,oo,L,G,J,St,no,yt,q,te,ee,k,oe,ne,ae,wt,_,Ro,Uo,b,h,re,I,ro,Y,xt,Z,N,_t,$t,Et,At,so,le,O=l(()=>{W=globalThis,Xt=n=>n,at=W.trustedTypes,Qt=at?at.createPolicy("lit-html",{createHTML:n=>n}):void 0,se="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,ie="?"+S,oo=`<${ie}>`,L=document,G=()=>L.createComment(""),J=n=>n===null||typeof n!="object"&&typeof n!="function",St=Array.isArray,no=n=>St(n)||typeof n?.[Symbol.iterator]=="function",yt=`[ 	
\f\r]`,q=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,te=/-->/g,ee=/>/g,k=RegExp(`>|${yt}(?:([^\\s"'>=/]+)(${yt}*=${yt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),oe=/'/g,ne=/"/g,ae=/^(?:script|style|textarea|title)$/i,wt=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),_=wt(1),Ro=wt(2),Uo=wt(3),b=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),re=new WeakMap,I=L.createTreeWalker(L,129);ro=(n,t)=>{let e=n.length-1,o=[],r,s=t===2?"<svg>":t===3?"<math>":"",i=q;for(let c=0;c<e;c++){let a=n[c],g,m,u=-1,y=0;for(;y<a.length&&(i.lastIndex=y,m=i.exec(a),m!==null);)y=i.lastIndex,i===q?m[1]==="!--"?i=te:m[1]!==void 0?i=ee:m[2]!==void 0?(ae.test(m[2])&&(r=RegExp("</"+m[2],"g")),i=k):m[3]!==void 0&&(i=k):i===k?m[0]===">"?(i=r??q,u=-1):m[1]===void 0?u=-2:(u=i.lastIndex-m[2].length,g=m[1],i=m[3]===void 0?k:m[3]==='"'?ne:oe):i===ne||i===oe?i=k:i===te||i===ee?i=q:(i=k,r=void 0);let $=i===k&&n[c+1].startsWith("/>")?" ":"";s+=i===q?a+oo:u>=0?(o.push(g),a.slice(0,u)+se+a.slice(u)+S+$):a+S+(u===-2?c:$)}return[ce(n,s+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),o]},Y=class n{constructor({strings:t,_$litType$:e},o){let r;this.parts=[];let s=0,i=0,c=t.length-1,a=this.parts,[g,m]=ro(t,e);if(this.el=n.createElement(g,o),I.currentNode=this.el.content,e===2||e===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=I.nextNode())!==null&&a.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(let u of r.getAttributeNames())if(u.endsWith(se)){let y=m[i++],$=r.getAttribute(u).split(S),et=/([.?@])?(.*)/.exec(y);a.push({type:1,index:s,name:et[2],strings:$,ctor:et[1]==="."?_t:et[1]==="?"?$t:et[1]==="@"?Et:N}),r.removeAttribute(u)}else u.startsWith(S)&&(a.push({type:6,index:s}),r.removeAttribute(u));if(ae.test(r.tagName)){let u=r.textContent.split(S),y=u.length-1;if(y>0){r.textContent=at?at.emptyScript:"";for(let $=0;$<y;$++)r.append(u[$],G()),I.nextNode(),a.push({type:2,index:++s});r.append(u[y],G())}}}else if(r.nodeType===8)if(r.data===ie)a.push({type:2,index:s});else{let u=-1;for(;(u=r.data.indexOf(S,u+1))!==-1;)a.push({type:7,index:s}),u+=S.length-1}s++}}static createElement(t,e){let o=L.createElement("template");return o.innerHTML=t,o}};xt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:o}=this._$AD,r=(t?.creationScope??L).importNode(e,!0);I.currentNode=r;let s=I.nextNode(),i=0,c=0,a=o[0];for(;a!==void 0;){if(i===a.index){let g;a.type===2?g=new Z(s,s.nextSibling,this,t):a.type===1?g=new a.ctor(s,a.name,a.strings,this,t):a.type===6&&(g=new At(s,this,t)),this._$AV.push(g),a=o[++c]}i!==a?.index&&(s=I.nextNode(),i++)}return I.currentNode=L,r}p(t){let e=0;for(let o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}},Z=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,r){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=P(this,t,e),J(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==b&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):no(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&J(this._$AH)?this._$AA.nextSibling.data=t:this.T(L.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:o}=t,r=typeof o=="number"?this._$AC(t):(o.el===void 0&&(o.el=Y.createElement(ce(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===r)this._$AH.p(e);else{let s=new xt(r,this),i=s.u(this.options);s.p(e),this.T(i),this._$AH=s}}_$AC(t){let e=re.get(t.strings);return e===void 0&&re.set(t.strings,e=new Y(t)),e}k(t){St(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,o,r=0;for(let s of t)r===e.length?e.push(o=new n(this.O(G()),this.O(G()),this,this.options)):o=e[r],o._$AI(s),r++;r<e.length&&(this._$AR(o&&o._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let o=Xt(t).nextSibling;Xt(t).remove(),t=o}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,r,s){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=h}_$AI(t,e=this,o,r){let s=this.strings,i=!1;if(s===void 0)t=P(this,t,e,0),i=!J(t)||t!==this._$AH&&t!==b,i&&(this._$AH=t);else{let c=t,a,g;for(t=s[0],a=0;a<s.length-1;a++)g=P(this,c[o+a],e,a),g===b&&(g=this._$AH[a]),i||(i=!J(g)||g!==this._$AH[a]),g===h?t=h:t!==h&&(t+=(g??"")+s[a+1]),this._$AH[a]=g}i&&!r&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},_t=class extends N{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},$t=class extends N{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},Et=class extends N{constructor(t,e,o,r,s){super(t,e,o,r,s),this.type=5}_$AI(t,e=this){if((t=P(this,t,e,0)??h)===b)return;let o=this._$AH,r=t===h&&o!==h||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,s=t!==h&&(o===h||r);r&&this.element.removeEventListener(this.name,this,o),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},At=class{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t)}},so=W.litHtmlPolyfillSupport;so?.(Y,Z),(W.litHtmlVersions??(W.litHtmlVersions=[])).push("3.3.3");le=(n,t,e)=>{let o=e?.renderBefore??t,r=o._$litPart$;if(r===void 0){let s=e?.renderBefore??null;o._$litPart$=r=new Z(t.insertBefore(G(),s),s,void 0,e??{})}return r._$AI(n),r}});var X,w,io,de=l(()=>{K();K();O();O();X=globalThis,w=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=le(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return b}};w._$litElement$=!0,w.finalized=!0,X.litElementHydrateSupport?.({LitElement:w});io=X.litElementPolyfillSupport;io?.({LitElement:w});(X.litElementVersions??(X.litElementVersions=[])).push("4.2.2")});var pe=l(()=>{});var C=l(()=>{K();O();de();pe()});var ue=l(()=>{});function d(n){return(t,e)=>typeof e=="object"?co(n,t,e):((o,r,s)=>{let i=r.hasOwnProperty(s);return r.constructor.createProperty(s,o),i?Object.getOwnPropertyDescriptor(r,s):void 0})(n,t,e)}var ao,co,Ct=l(()=>{K();ao={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:it},co=(n=ao,t,e)=>{let{kind:o,metadata:r}=e,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),o==="setter"&&((n=Object.create(n)).wrapped=!0),s.set(e.name,n),o==="accessor"){let{name:i}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(i,a,n,!0,c)},init(c){return c!==void 0&&this.C(i,void 0,n,c),c}}}if(o==="setter"){let{name:i}=e;return function(c){let a=this[i];t.call(this,c),this.requestUpdate(i,a,n,!0,c)}}throw Error("Unsupported decorator location: "+o)}});function Tt(n){return d({...n,state:!0,attribute:!1})}var he=l(()=>{Ct();});var fe=l(()=>{});var R=l(()=>{});var ge=l(()=>{R();});var me=l(()=>{R();});var be=l(()=>{R();});var ve=l(()=>{R();});var ye=l(()=>{R();});var Bt=l(()=>{ue();Ct();he();fe();ge();me();be();ve();ye()});var lt,dt,U,kt=l(()=>{lt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},dt=n=>(...t)=>({_$litDirective$:n,values:t}),U=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,o){this._$Ct=t,this._$AM=e,this._$Ci=o}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}});var pt,xe=l(()=>{O();kt();pt=dt(class extends U{constructor(n){if(super(n),n.type!==lt.ATTRIBUTE||n.name!=="class"||n.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){if(this.st===void 0){this.st=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(let o in t)t[o]&&!this.nt?.has(o)&&this.st.add(o);return this.render(t)}let e=n.element.classList;for(let o of this.st)o in t||(e.remove(o),this.st.delete(o));for(let o in t){let r=!!t[o];r===this.st.has(o)||this.nt?.has(o)||(r?(e.add(o),this.st.add(o)):(e.remove(o),this.st.delete(o)))}return b}})});var It=l(()=>{xe()});var ut,_e,$e,H,ht,Lt=l(()=>{C();ut="2.5.1",_e="__vscodeElements_disableRegistryWarning__",$e=(n,t)=>{console.warn(t?`[VSCode Elements] ${n}
%o`:`${n}
%o`,t)},H=class extends w{get version(){return ut}warn(t){$e(t,this)}},ht=n=>t=>{if(!customElements.get(n)){customElements.define(n,t);return}if(_e in window)return;let r=document.createElement(n)?.version,s="";r?r!==ut?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${ut}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${ut}).`:s+="is already registered by an unknown custom element handler class.",$e(`The custom element "${n}" ${s}
To suppress this warning, set window.${_e} to true`)}});var z,Ee=l(()=>{O();z=n=>n??h});var Dt=l(()=>{Ee()});var Ae=l(()=>{kt()});var Mt,Se,we=l(()=>{C();Ae();Mt=class extends U{constructor(t){if(super(t),this._prevProperties={},t.type!==lt.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[e]){return Object.entries(e).forEach(([o,r])=>{this._prevProperties[o]!==r&&(o.startsWith("--")?t.element.style.setProperty(o,r):t.element.style[o]=r,this._prevProperties[o]=r)}),b}render(t){return b}},Se=dt(Mt)});var ft,Pt=l(()=>{C();ft=B`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var lo,Ce,Te=l(()=>{C();Pt();lo=[ft,B`
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
  `],Ce=lo});var D,Q,v,Be=l(()=>{C();Bt();It();Dt();Lt();we();Te();D=function(n,t,e,o){var r=arguments.length,s=r<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(n,t,e,o);else for(var c=n.length-1;c>=0;c--)(i=n[c])&&(s=(r<3?i(s):r>3?i(t,e,s):i(t,e))||s);return r>3&&s&&Object.defineProperty(t,e,s),s},v=Q=class extends H{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:e}=this._getStylesheetConfig();Q.stylesheetHref=t,Q.nonce=e}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),e=t?.getAttribute("href")||void 0,o=t?.nonce||void 0;if(!t){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:o,href:e}}render(){let{stylesheetHref:t,nonce:e}=Q,o=_`<span
      class=${pt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${Se({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?_` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${o}
        </button>`:_` <span class="icon" aria-hidden="true" role="presentation"
          >${o}</span
        >`;return _`
      <link
        rel="stylesheet"
        href=${z(t)}
        nonce=${z(e)}
      />
      ${r}
    `}};v.styles=Ce;v.stylesheetHref="";v.nonce="";D([d()],v.prototype,"label",void 0);D([d({type:String})],v.prototype,"name",void 0);D([d({type:Number})],v.prototype,"size",void 0);D([d({type:Boolean,reflect:!0})],v.prototype,"spin",void 0);D([d({type:Number,attribute:"spin-duration"})],v.prototype,"spinDuration",void 0);D([d({type:Boolean,reflect:!0,attribute:"action-icon"})],v.prototype,"actionIcon",void 0);v=Q=D([ht("vscode-icon")],v)});var ke=l(()=>{Be()});function Ie(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var Le=l(()=>{});var po,uo,De,Me=l(()=>{C();Pt();Le();po=st(Ie()),uo=[ft,B`
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
      font-family: var(--vscode-font-family, ${po});
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
  `],De=uo});var f,p,Pe=l(()=>{C();Bt();It();Lt();ke();Me();Dt();f=function(n,t,e,o){var r=arguments.length,s=r<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,e):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(n,t,e,o);else for(var c=n.length-1;c>=0;c--)(i=n[c])&&(s=(r<3?i(s):r>3?i(t,e,s):i(t,e))||s);return r>3&&s&&Object.defineProperty(t,e,s),s},p=class extends H{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let e=new MouseEvent("click",{bubbles:!0,cancelable:!0});e.synthetic=!0,this.dispatchEvent(e),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let e=t.target;e.name==="content-before"&&(this._hasContentBefore=e.assignedElements().length>0),e.name==="content-after"&&(this._hasContentAfter=e.assignedElements().length>0)}render(){let t=this.icon!=="",e=this.iconAfter!=="",o={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=t?_`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${z(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:h,s=e?_`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${z(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:h;return _`
      <div
        class=${pt(o)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};p.styles=De;p.formAssociated=!0;f([d({type:Boolean,reflect:!0})],p.prototype,"autofocus",void 0);f([d({type:Number,reflect:!0})],p.prototype,"tabIndex",void 0);f([d({type:Boolean,reflect:!0})],p.prototype,"secondary",void 0);f([d({type:Boolean,reflect:!0})],p.prototype,"block",void 0);f([d({reflect:!0})],p.prototype,"role",void 0);f([d({type:Boolean,reflect:!0})],p.prototype,"disabled",void 0);f([d()],p.prototype,"icon",void 0);f([d({type:Boolean,reflect:!0,attribute:"icon-spin"})],p.prototype,"iconSpin",void 0);f([d({type:Number,reflect:!0,attribute:"icon-spin-duration"})],p.prototype,"iconSpinDuration",void 0);f([d({attribute:"icon-after"})],p.prototype,"iconAfter",void 0);f([d({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],p.prototype,"iconAfterSpin",void 0);f([d({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],p.prototype,"iconAfterSpinDuration",void 0);f([d({type:Boolean,reflect:!0})],p.prototype,"focused",void 0);f([d({type:String,reflect:!0})],p.prototype,"name",void 0);f([d({type:Boolean,reflect:!0,attribute:"icon-only"})],p.prototype,"iconOnly",void 0);f([d({reflect:!0})],p.prototype,"type",void 0);f([d()],p.prototype,"value",void 0);f([Tt()],p.prototype,"_hasContentBefore",void 0);f([Tt()],p.prototype,"_hasContentAfter",void 0);p=f([ht("vscode-button")],p)});var Ne={};He(Ne,{VscodeButton:()=>p});var Oe=l(()=>{Pe()});var gt={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency","share.exportTitle":"AI Engineering Fluency Score","share.exportReportLabel":"Report"},Ot={...gt};function Rt(n){let t={};for(let[e,o]of Object.entries(n))typeof o=="string"&&o!==e&&(t[e]=o);Ot={...gt,...t}}function Ut(n){return Ot[n]||gt[n]||n}var ze="en";function Ht(n){ze=n}var Fe={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},Ve=new Proxy({},{get(n,t){let e=Fe[t];if(!e)return;let{labelKey:o,...r}=e;return{...r,label:Ut(o)}}});function E(n){let t=typeof n=="string"?Ve[n]:n;if(t.hidden)return"";let e=t.appearance?` appearance="${t.appearance}"`:"",o=t.active?' class="nav-active" disabled aria-current="page"':"",r=t.iconColor?` style="--icon-accent:${t.iconColor}"`:"",s=t.icon?`<span class="codicon codicon-${t.icon} nav-icon"${r}></span>`:"";return`<vscode-button id="${t.id}"${e}${o}>${s}${t.label}</vscode-button>`}function zt(n,t){n&&(n.innerHTML=t)}function ot(n){let t=globalThis.window;return t?t[n]:void 0}var je=ot("__TOKEN_ESTIMATORS__"),To=je?.estimators??{};function M(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ft(n){let t=M(n);return t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'),t}function Ke(n){let t=[],e=n.location?.origin;e&&e!=="null"&&t.push(e);let o=n.location?.href,r=o?/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(o):null;return r&&!t.includes(r[0])&&t.push(r[0]),t}function qe(n,t,e){return n==null||n===t||n===t.parent||n===t.top?!0:!!e&&Ke(t).includes(e)}function Vt(n,t){window.addEventListener("message",e=>{if(!qe(e.source,window,e.origin)){t?.(e);return}n(e.data)})}function jt(n){return`ext-point-${n}`}function Kt(n,t){let e=document.querySelector(".button-row");if(!e)return;let o=new Set(t.map(r=>r.id));for(let r of Array.from(e.querySelectorAll('[id^="ext-point-"]'))){let s=r.id.slice(10);o.has(s)||r.remove()}for(let r of t){if(document.getElementById(jt(r.id)))continue;let s=document.createElement("vscode-button");s.id=jt(r.id),s.textContent=r.label,s.addEventListener("click",()=>{n.postMessage({command:"extensionPointAction",buttonId:r.id})}),e.append(s)}}function qt(n){Kt(n,window.__EXTENSION_POINT_BUTTONS__??[]),!window.__extensionPointButtonsListenerRegistered__&&(window.__extensionPointButtonsListenerRegistered__=!0,Vt(t=>{t?.command==="extensionPointButtonsUpdated"&&Array.isArray(t.buttons)&&Kt(n,t.buttons)}))}var Wt=`/* Fluency Level Viewer Styles */

.container {
	padding: 20px;
	max-width: 1400px;
	margin: 0 auto;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--vscode-panel-border);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.header-icon {
	font-size: 24px;
}

.header-title {
	font-size: 18px;
	font-weight: 600;
}



.debug-badge {
	display: inline-block;
	padding: 4px 10px;
	background: rgba(255, 152, 0, 0.2);
	color: var(--warning-fg);
	border-radius: 12px;
	font-size: 11px;
	font-weight: 600;
	margin-left: 12px;
	border: 1px solid rgba(255, 152, 0, 0.4);
}

.info-box {
	background: color-mix(in srgb, var(--link-color) 10%, transparent);
	border: 1px solid color-mix(in srgb, var(--link-color) 30%, transparent);
	border-radius: 6px;
	padding: 12px 16px;
	margin-bottom: 20px;
	font-size: 12px;
	line-height: 1.5;
}

.info-box-title {
	font-weight: 600;
	margin-bottom: 6px;
	color: var(--link-color);
}

.category-selector {
	display: flex;
	gap: 10px;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

.category-btn {
	padding: 10px 16px;
	background: var(--vscode-button-secondaryBackground);
	color: var(--vscode-button-secondaryForeground);
	border: 1px solid var(--vscode-panel-border);
	border-radius: 6px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.2s;
}

.category-btn:hover {
	background: var(--vscode-button-secondaryHoverBackground);
	border-color: var(--vscode-focusBorder);
}

.category-btn.active {
	background: var(--vscode-button-background);
	color: var(--vscode-button-foreground);
	border-color: var(--vscode-focusBorder);
	box-shadow: 0 0 0 1px var(--vscode-focusBorder);
}

.category-btn .icon {
	font-size: 16px;
}

.level-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 16px;
	margin-bottom: 24px;
}

.level-card {
	background: var(--vscode-editor-background);
	border: 2px solid var(--vscode-panel-border);
	border-radius: 8px;
	padding: 16px;
	transition: all 0.2s;
}

.level-card:hover {
	border-color: var(--vscode-focusBorder);
	box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.level-card.stage-1 { border-left: 4px solid #93c5fd; }
.level-card.stage-2 { border-left: 4px solid #a78bfa; }
.level-card.stage-3 { border-left: 4px solid #3b82f6; }
.level-card.stage-4 { border-left: 4px solid #22d3ee; }

.level-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.level-title {
	font-size: 14px;
	font-weight: 600;
}

.level-badge {
	padding: 3px 10px;
	border-radius: 12px;
	font-size: 11px;
	font-weight: 600;
}

.badge-1 { background: rgba(147, 197, 253, 0.2); color: #93c5fd; }
.badge-2 { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.badge-3 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.badge-4 { background: rgba(34, 211, 238, 0.2); color: #22d3ee; }

.level-description {
	font-size: 12px;
	color: var(--vscode-descriptionForeground);
	margin-bottom: 12px;
	line-height: 1.5;
}

.threshold-section {
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid var(--vscode-panel-border);
}

.threshold-title {
	font-size: 11px;
	font-weight: 600;
	color: var(--vscode-descriptionForeground);
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.threshold-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.threshold-item {
	font-size: 12px;
	padding: 6px 0;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	line-height: 1.5;
}

.threshold-icon {
	color: #3b82f6;
	font-size: 12px;
	margin-top: 2px;
}

.tips-section {
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid var(--vscode-panel-border);
}

.tips-title {
	font-size: 11px;
	font-weight: 600;
	color: #f59e0b;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.tips-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.tip-item-viewer {
	font-size: 12px;
	padding: 6px 0;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	line-height: 1.5;
}

.tip-icon {
	color: #f59e0b;
	font-size: 12px;
	margin-top: 2px;
}

.tip-item-viewer a {
	color: #60a5fa;
	text-decoration: none;
	border-bottom: 1px solid transparent;
	transition: border-color 0.2s ease;
}

.tip-item-viewer a:hover {
	border-bottom-color: #60a5fa;
}

.footer {
	margin-top: 24px;
	padding-top: 16px;
	border-top: 1px solid var(--vscode-panel-border);
	text-align: center;
	font-size: 11px;
	color: var(--vscode-descriptionForeground);
}
`;var T=acquireVsCodeApi(),tt=ot("__INITIAL_FLUENCY_LEVEL_DATA__");if(tt?.localization){Rt(tt.localization);let n=tt.localization.__language__||"en";Ht(n)}var Nt=0;function ho(n){return n.map((t,e)=>`
		<button class="category-btn ${e===Nt?"active":""}" data-index="${e}">
			<span class="icon">${t.icon}</span>
			<span>${M(t.category)}</span>
		</button>
	`).join("")}function fo(n){return n.levels.map(t=>{let e=t.thresholds.length>0?t.thresholds.map(r=>`
				<li class="threshold-item">
					<span class="threshold-icon">\u25B8</span>
					<span>${M(r)}</span>
				</li>
			`).join(""):'<li class="threshold-item"><span class="threshold-icon">-</span><span>No specific thresholds</span></li>',o=t.tips.length>0?t.tips.map(r=>`
				<li class="tip-item-viewer">
					<span class="tip-icon">\u{1F4A1}</span>
					<span>${Ft(r)}</span>
				</li>
			`).join(""):`<li class="tip-item-viewer"><span class="tip-icon">\u2713</span><span>No specific suggestions - you're at the highest level!</span></li>`;return`
			<div class="level-card stage-${t.stage}">
				<div class="level-header">
					<div class="level-title">${M(t.label)}</div>
					<div class="level-badge badge-${t.stage}">Stage ${t.stage}</div>
				</div>
				<div class="level-description">${M(t.description)}</div>
				
				<div class="threshold-section">
					<div class="threshold-title">\u{1F3AF} Requirements to Reach This Stage</div>
					<ul class="threshold-list">${e}</ul>
				</div>
				
				${t.tips.length>0?`
				<div class="tips-section">
					<div class="tips-title">\u{1F4A1} Next Steps (if below this stage)</div>
					<ul class="tips-list">${o}</ul>
				</div>
				`:""}
			</div>
		`}).join("")}function go(n){document.getElementById("btn-refresh")?.addEventListener("click",()=>{T.postMessage({command:"refresh"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{T.postMessage({command:"showMaturity"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{T.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{T.postMessage({command:"showChart"})}),document.getElementById("btn-usage")?.addEventListener("click",()=>{T.postMessage({command:"showUsageAnalysis"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{T.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{T.postMessage({command:"showDashboard"})}),qt(T),document.querySelectorAll(".category-btn").forEach(t=>{t.addEventListener("click",e=>{let o=e.currentTarget;Nt=parseInt(o.getAttribute("data-index")||"0",10),Re(n)})})}function Re(n){let t=document.getElementById("root");if(!t)return;let e=n.categories[Nt];zt(t,`
		<style>${Wt}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Scoring Guide</span>
					${n.isDebugMode?'<span class="debug-badge">\u{1F41B} DEBUG MODE</span>':""}
				</div>
				<div class="button-row">
					${E("btn-refresh")}
					${E("btn-maturity")}
					${E("btn-details")}
					${E("btn-chart")}
					${E("btn-usage")}
					${E("btn-diagnostics")}
					${n.backendConfigured?E("btn-dashboard"):""}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title">\u{1F4CB} About This Tool</div>
				<div>
					This tool shows all fluency score rules, thresholds, and tips for each category and stage.
					Use it to understand how the scoring system works and what actions trigger different fluency levels.
					Select a category below to view its stage definitions and advancement criteria.
				</div>
			</div>

			<div class="category-selector">
				${ho(n.categories)}
			</div>

			<div class="level-grid">
				${fo(e)}
			</div>

			<div class="footer">
				\u{1F4CA} Scoring Guide &middot; ${n.categories.length} categories &middot; 4 stages each
			</div>
		</div>
	`),go(n)}async function mo(){if(await Promise.resolve().then(()=>(Oe(),Ne)),!tt){let n=document.getElementById("root");n&&(n.textContent="No data available.");return}Re(tt)}mo();})();
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
