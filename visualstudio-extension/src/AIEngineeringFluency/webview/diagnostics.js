"use strict";(()=>{var ns=Object.defineProperty;var f=(t,e,o)=>()=>{if(o)throw o[0];try{return t&&(e=t(t=0)),e}catch(n){throw o=[n],n}};var ss=(t,e)=>{for(var o in e)ns(t,o,{get:e[o],enumerable:!0})};var Pt,Ot,fe,wo,pt,Bt,F,Eo,be,he=f(()=>{Pt=globalThis,Ot=Pt.ShadowRoot&&(Pt.ShadyCSS===void 0||Pt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,fe=Symbol(),wo=new WeakMap,pt=class{constructor(e,o,n){if(this._$cssResult$=!0,n!==fe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(Ot&&e===void 0){let n=o!==void 0&&o.length===1;n&&(e=wo.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&wo.set(o,e))}return e}toString(){return this.cssText}},Bt=t=>new pt(typeof t=="string"?t:t+"",void 0,fe),F=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((n,s,i)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new pt(o,t,fe)},Eo=(t,e)=>{if(Ot)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let n=document.createElement("style"),s=Pt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,t.appendChild(n)}},be=Ot?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let n of e.cssRules)o+=n.cssText;return Bt(o)})(t):t});var xs,Ts,Ss,Cs,ws,Es,U,Mo,Ms,As,gt,mt,Nt,Ao,_,ft=f(()=>{he();he();({is:xs,defineProperty:Ts,getOwnPropertyDescriptor:Ss,getOwnPropertyNames:Cs,getOwnPropertySymbols:ws,getPrototypeOf:Es}=Object),U=globalThis,Mo=U.trustedTypes,Ms=Mo?Mo.emptyScript:"",As=U.reactiveElementPolyfillSupport,gt=(t,e)=>t,mt={toAttribute(t,e){switch(e){case Boolean:t=t?Ms:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},Nt=(t,e)=>!xs(t,e),Ao={attribute:!0,type:String,converter:mt,reflect:!1,useDefault:!1,hasChanged:Nt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),U.litPropertyMetadata??(U.litPropertyMetadata=new WeakMap);_=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=Ao){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(e,n,o);s!==void 0&&Ts(this.prototype,e,s)}}static getPropertyDescriptor(e,o,n){let{get:s,set:i}=Ss(this.prototype,e)??{get(){return this[o]},set(r){this[o]=r}};return{get:s,set(r){let a=s?.call(this);i?.call(this,r),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ao}static _$Ei(){if(this.hasOwnProperty(gt("elementProperties")))return;let e=Es(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(gt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(gt("properties"))){let o=this.properties,n=[...Cs(o),...ws(o)];for(let s of n)this.createProperty(s,o[s])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let s of n)o.unshift(be(s))}else e!==void 0&&o.push(be(e));return o}static _$Eu(e,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Eo(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,n){this._$AK(e,n)}_$ET(e,o){let n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){let i=(n.converter?.toAttribute!==void 0?n.converter:mt).toAttribute(o,n.type);this._$Em=e,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(e,o){let n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let i=n.getPropertyOptions(s),r=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:mt;this._$Em=s;let a=r.fromAttribute(o,i.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,o,n,s=!1,i){if(e!==void 0){let r=this.constructor;if(s===!1&&(i=this[e]),n??(n=r.getPropertyOptions(e)),!((n.hasChanged??Nt)(i,o)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,n))))return;this.C(e,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:n,reflect:s,wrapped:i},r){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,r??o??this[e]),i!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(o=void 0),this._$AL.set(e,o)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,i]of n){let{wrapped:r}=i,a=this[s];r!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,i,a)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[gt("elementProperties")]=new Map,_[gt("finalized")]=new Map,As?.({ReactiveElement:_}),(U.reactiveElementVersions??(U.reactiveElementVersions=[])).push("2.1.2")});function No(t,e){if(!Ce(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return $o!==void 0?$o.createHTML(e):e}function J(t,e,o=t,n){if(e===A)return e;let s=n!==void 0?o._$Co?.[n]:o._$Cl,i=vt(e)?void 0:e._$litDirective$;return s?.constructor!==i&&(s?._$AO?.(!1),i===void 0?s=void 0:(s=new i(t),s._$AT(t,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(e=J(t,s._$AS(t,e.values),s,n)),e}var ht,Do,Ft,$o,Po,P,Oo,Ds,j,yt,vt,Ce,$s,ye,bt,Ro,Io,H,_o,Lo,Bo,we,L,Na,Fa,A,T,Uo,z,Rs,kt,ve,xt,Z,ke,xe,Te,Se,Is,Fo,X=f(()=>{ht=globalThis,Do=t=>t,Ft=ht.trustedTypes,$o=Ft?Ft.createPolicy("lit-html",{createHTML:t=>t}):void 0,Po="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Oo="?"+P,Ds=`<${Oo}>`,j=document,yt=()=>j.createComment(""),vt=t=>t===null||typeof t!="object"&&typeof t!="function",Ce=Array.isArray,$s=t=>Ce(t)||typeof t?.[Symbol.iterator]=="function",ye=`[ 	
\f\r]`,bt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ro=/-->/g,Io=/>/g,H=RegExp(`>|${ye}(?:([^\\s"'>=/]+)(${ye}*=${ye}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_o=/'/g,Lo=/"/g,Bo=/^(?:script|style|textarea|title)$/i,we=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),L=we(1),Na=we(2),Fa=we(3),A=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),Uo=new WeakMap,z=j.createTreeWalker(j,129);Rs=(t,e)=>{let o=t.length-1,n=[],s,i=e===2?"<svg>":e===3?"<math>":"",r=bt;for(let a=0;a<o;a++){let l=t[a],p,g,c=-1,u=0;for(;u<l.length&&(r.lastIndex=u,g=r.exec(l),g!==null);)u=r.lastIndex,r===bt?g[1]==="!--"?r=Ro:g[1]!==void 0?r=Io:g[2]!==void 0?(Bo.test(g[2])&&(s=RegExp("</"+g[2],"g")),r=H):g[3]!==void 0&&(r=H):r===H?g[0]===">"?(r=s??bt,c=-1):g[1]===void 0?c=-2:(c=r.lastIndex-g[2].length,p=g[1],r=g[3]===void 0?H:g[3]==='"'?Lo:_o):r===Lo||r===_o?r=H:r===Ro||r===Io?r=bt:(r=H,s=void 0);let b=r===H&&t[a+1].startsWith("/>")?" ":"";i+=r===bt?l+Ds:c>=0?(n.push(p),l.slice(0,c)+Po+l.slice(c)+P+b):l+P+(c===-2?a:b)}return[No(t,i+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},kt=class t{constructor({strings:e,_$litType$:o},n){let s;this.parts=[];let i=0,r=0,a=e.length-1,l=this.parts,[p,g]=Rs(e,o);if(this.el=t.createElement(p,n),z.currentNode=this.el.content,o===2||o===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=z.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let c of s.getAttributeNames())if(c.endsWith(Po)){let u=g[r++],b=s.getAttribute(c).split(P),v=/([.?@])?(.*)/.exec(u);l.push({type:1,index:i,name:v[2],strings:b,ctor:v[1]==="."?ke:v[1]==="?"?xe:v[1]==="@"?Te:Z}),s.removeAttribute(c)}else c.startsWith(P)&&(l.push({type:6,index:i}),s.removeAttribute(c));if(Bo.test(s.tagName)){let c=s.textContent.split(P),u=c.length-1;if(u>0){s.textContent=Ft?Ft.emptyScript:"";for(let b=0;b<u;b++)s.append(c[b],yt()),z.nextNode(),l.push({type:2,index:++i});s.append(c[u],yt())}}}else if(s.nodeType===8)if(s.data===Oo)l.push({type:2,index:i});else{let c=-1;for(;(c=s.data.indexOf(P,c+1))!==-1;)l.push({type:7,index:i}),c+=P.length-1}i++}}static createElement(e,o){let n=j.createElement("template");return n.innerHTML=e,n}};ve=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:n}=this._$AD,s=(e?.creationScope??j).importNode(o,!0);z.currentNode=s;let i=z.nextNode(),r=0,a=0,l=n[0];for(;l!==void 0;){if(r===l.index){let p;l.type===2?p=new xt(i,i.nextSibling,this,e):l.type===1?p=new l.ctor(i,l.name,l.strings,this,e):l.type===6&&(p=new Se(i,this,e)),this._$AV.push(p),l=n[++a]}r!==l?.index&&(i=z.nextNode(),r++)}return z.currentNode=j,s}p(e){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,o),o+=n.strings.length-2):n._$AI(e[o])),o++}},xt=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,n,s){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=J(this,e,o),vt(e)?e===T||e==null||e===""?(this._$AH!==T&&this._$AR(),this._$AH=T):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$s(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==T&&vt(this._$AH)?this._$AA.nextSibling.data=e:this.T(j.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=kt.createElement(No(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let i=new ve(s,this),r=i.u(this.options);i.p(o),this.T(r),this._$AH=i}}_$AC(e){let o=Uo.get(e.strings);return o===void 0&&Uo.set(e.strings,o=new kt(e)),o}k(e){Ce(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let i of e)s===o.length?o.push(n=new t(this.O(yt()),this.O(yt()),this,this.options)):n=o[s],n._$AI(i),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let n=Do(e).nextSibling;Do(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Z=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,n,s,i){this.type=1,this._$AH=T,this._$AN=void 0,this.element=e,this.name=o,this._$AM=s,this.options=i,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=T}_$AI(e,o=this,n,s){let i=this.strings,r=!1;if(i===void 0)e=J(this,e,o,0),r=!vt(e)||e!==this._$AH&&e!==A,r&&(this._$AH=e);else{let a=e,l,p;for(e=i[0],l=0;l<i.length-1;l++)p=J(this,a[n+l],o,l),p===A&&(p=this._$AH[l]),r||(r=!vt(p)||p!==this._$AH[l]),p===T?e=T:e!==T&&(e+=(p??"")+i[l+1]),this._$AH[l]=p}r&&!s&&this.j(e)}j(e){e===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ke=class extends Z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===T?void 0:e}},xe=class extends Z{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==T)}},Te=class extends Z{constructor(e,o,n,s,i){super(e,o,n,s,i),this.type=5}_$AI(e,o=this){if((e=J(this,e,o,0)??T)===A)return;let n=this._$AH,s=e===T&&n!==T||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==T&&(n===T||s);s&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Se=class{constructor(e,o,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}},Is=ht.litHtmlPolyfillSupport;Is?.(kt,xt),(ht.litHtmlVersions??(ht.litHtmlVersions=[])).push("3.3.3");Fo=(t,e,o)=>{let n=o?.renderBefore??e,s=n._$litPart$;if(s===void 0){let i=o?.renderBefore??null;n._$litPart$=s=new xt(e.insertBefore(yt(),i),i,void 0,o??{})}return s._$AI(t),s}});var Tt,O,_s,Ho=f(()=>{ft();ft();X();X();Tt=globalThis,O=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let e=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=e.firstChild),e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fo(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}};O._$litElement$=!0,O.finalized=!0,Tt.litElementHydrateSupport?.({LitElement:O});_s=Tt.litElementPolyfillSupport;_s?.({LitElement:O});(Tt.litElementVersions??(Tt.litElementVersions=[])).push("4.2.2")});var zo=f(()=>{});var B=f(()=>{ft();X();Ho();zo()});var jo=f(()=>{});function y(t){return(e,o)=>typeof o=="object"?Us(t,e,o):((n,s,i)=>{let r=s.hasOwnProperty(i);return s.constructor.createProperty(i,n),r?Object.getOwnPropertyDescriptor(s,i):void 0})(t,e,o)}var Ls,Us,Ee=f(()=>{ft();Ls={attribute:!0,type:String,converter:mt,reflect:!1,hasChanged:Nt},Us=(t=Ls,e,o)=>{let{kind:n,metadata:s}=o,i=globalThis.litPropertyMetadata.get(s);if(i===void 0&&globalThis.litPropertyMetadata.set(s,i=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),i.set(o.name,t),n==="accessor"){let{name:r}=o;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(r,l,t,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,t,a),a}}}if(n==="setter"){let{name:r}=o;return function(a){let l=this[r];e.call(this,a),this.requestUpdate(r,l,t,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function Me(t){return y({...t,state:!0,attribute:!1})}var Go=f(()=>{Ee();});var qo=f(()=>{});var Q=f(()=>{});var Wo=f(()=>{Q();});var Vo=f(()=>{Q();});var Ko=f(()=>{Q();});var Yo=f(()=>{Q();});var Jo=f(()=>{Q();});var Ae=f(()=>{jo();Ee();Go();qo();Wo();Vo();Ko();Yo();Jo()});var zt,jt,tt,De=f(()=>{zt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},jt=t=>(...e)=>({_$litDirective$:t,values:e}),tt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,n){this._$Ct=e,this._$AM=o,this._$Ci=n}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}}});var Gt,Zo=f(()=>{X();De();Gt=jt(class extends tt{constructor(t){if(super(t),t.type!==zt.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in e)e[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(e)}let o=t.element.classList;for(let n of this.st)n in e||(o.remove(n),this.st.delete(n));for(let n in e){let s=!!e[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return A}})});var $e=f(()=>{Zo()});var qt,Xo,Qo,et,Wt,Re=f(()=>{B();qt="2.5.1",Xo="__vscodeElements_disableRegistryWarning__",Qo=(t,e)=>{console.warn(e?`[VSCode Elements] ${t}
%o`:`${t}
%o`,e)},et=class extends O{get version(){return qt}warn(e){Qo(e,this)}},Wt=t=>e=>{if(!customElements.get(t)){customElements.define(t,e);return}if(Xo in window)return;let s=document.createElement(t)?.version,i="";s?s!==qt?(i+="is already registered by a different version of VSCode Elements. ",i+=`This version is "${qt}", while the other one is "${s}".`):i+=`is already registered by the same version of VSCode Elements (${qt}).`:i+="is already registered by an unknown custom element handler class.",Qo(`The custom element "${t}" ${i}
To suppress this warning, set window.${Xo} to true`)}});var ot,tn=f(()=>{X();ot=t=>t??T});var Ie=f(()=>{tn()});var en=f(()=>{De()});var _e,on,nn=f(()=>{B();en();_e=class extends tt{constructor(e){if(super(e),this._prevProperties={},e.type!==zt.PROPERTY||e.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(e,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?e.element.style.setProperty(n,s):e.element.style[n]=s,this._prevProperties[n]=s)}),A}render(e){return A}},on=jt(_e)});var Vt,Le=f(()=>{B();Vt=F`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var Ps,sn,rn=f(()=>{B();Le();Ps=[Vt,F`
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
  `],sn=Ps});var G,St,D,an=f(()=>{B();Ae();$e();Ie();Re();nn();rn();G=function(t,e,o,n){var s=arguments.length,i=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(i=(s<3?r(i):s>3?r(e,o,i):r(e,o))||i);return s>3&&i&&Object.defineProperty(e,o,i),i},D=St=class extends et{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();let{href:e,nonce:o}=this._getStylesheetConfig();St.stylesheetHref=e,St.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let e=document.getElementById("vscode-codicon-stylesheet"),o=e?.getAttribute("href")||void 0,n=e?.nonce||void 0;if(!e){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:e,nonce:o}=St,n=L`<span
      class=${Gt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${on({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?L` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:L` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return L`
      <link
        rel="stylesheet"
        href=${ot(e)}
        nonce=${ot(o)}
      />
      ${s}
    `}};D.styles=sn;D.stylesheetHref="";D.nonce="";G([y()],D.prototype,"label",void 0);G([y({type:String})],D.prototype,"name",void 0);G([y({type:Number})],D.prototype,"size",void 0);G([y({type:Boolean,reflect:!0})],D.prototype,"spin",void 0);G([y({type:Number,attribute:"spin-duration"})],D.prototype,"spinDuration",void 0);G([y({type:Boolean,reflect:!0,attribute:"action-icon"})],D.prototype,"actionIcon",void 0);D=St=G([Wt("vscode-icon")],D)});var ln=f(()=>{an()});function dn(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var cn=f(()=>{});var Os,Bs,un,pn=f(()=>{B();Le();cn();Os=Bt(dn()),Bs=[Vt,F`
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
      font-family: var(--vscode-font-family, ${Os});
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
  `],un=Bs});var C,k,gn=f(()=>{B();Ae();$e();Re();ln();pn();Ie();C=function(t,e,o,n){var s=arguments.length,i=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(i=(s<3?r(i):s>3?r(e,o,i):r(e,o))||i);return s>3&&i&&Object.defineProperty(e,o,i),i},k=class extends et{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(e){super.update(e),e.has("value")&&this._internals.setFormValue(this.value),e.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(e){if((e.key==="Enter"||e.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(e){e.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(e){let o=e.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let e=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=e?L`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${ot(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:T,i=o?L`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${ot(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:T;return L`
      <div
        class=${Gt(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${i}
        <slot name="content-after"></slot>
      </div>
    `}};k.styles=un;k.formAssociated=!0;C([y({type:Boolean,reflect:!0})],k.prototype,"autofocus",void 0);C([y({type:Number,reflect:!0})],k.prototype,"tabIndex",void 0);C([y({type:Boolean,reflect:!0})],k.prototype,"secondary",void 0);C([y({type:Boolean,reflect:!0})],k.prototype,"block",void 0);C([y({reflect:!0})],k.prototype,"role",void 0);C([y({type:Boolean,reflect:!0})],k.prototype,"disabled",void 0);C([y()],k.prototype,"icon",void 0);C([y({type:Boolean,reflect:!0,attribute:"icon-spin"})],k.prototype,"iconSpin",void 0);C([y({type:Number,reflect:!0,attribute:"icon-spin-duration"})],k.prototype,"iconSpinDuration",void 0);C([y({attribute:"icon-after"})],k.prototype,"iconAfter",void 0);C([y({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],k.prototype,"iconAfterSpin",void 0);C([y({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],k.prototype,"iconAfterSpinDuration",void 0);C([y({type:Boolean,reflect:!0})],k.prototype,"focused",void 0);C([y({type:String,reflect:!0})],k.prototype,"name",void 0);C([y({type:Boolean,reflect:!0,attribute:"icon-only"})],k.prototype,"iconOnly",void 0);C([y({reflect:!0})],k.prototype,"type",void 0);C([y()],k.prototype,"value",void 0);C([Me()],k.prototype,"_hasContentBefore",void 0);C([Me()],k.prototype,"_hasContentAfter",void 0);k=C([Wt("vscode-button")],k)});var mn={};ss(mn,{VscodeButton:()=>k});var fn=f(()=>{gn()});var ae={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency","share.exportTitle":"AI Engineering Fluency Score","share.exportReportLabel":"Report","usage.contextPressure.compactedLabel":"\u{1F5DC}\uFE0F Sessions compacted","usage.contextPressure.ofCount":"{0} of {1}","usage.contextPressure.compactedShare":"{0}% of sessions with context data lost earlier turns to automatic compaction","usage.contextPressure.noneCompacted":"No session ran out of context window in this period","usage.contextPressure.compactedTooltip":"Sessions where the client automatically compacted or truncated the history at least once, counted per session rather than per compaction event","usage.contextPressure.nearLimitLabel":"\u26A0\uFE0F Sessions near the limit","usage.contextPressure.worstFill":"Fullest session reached {0}% of its window","usage.contextPressure.nearLimitTooltip":"Copilot CLI sessions that filled at least {0}% of their context window without compacting \u2014 the early-warning band before context starts getting dropped"},ro={...ae};function ao(t){let e={};for(let[o,n]of Object.entries(t))typeof n=="string"&&n!==o&&(e[o]=n);ro={...ae,...e}}function lo(t){return ro[t]||ae[t]||t}var is="en";function co(t){is=t}var rs={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},uo=new Proxy({},{get(t,e){let o=rs[e];if(!o)return;let{labelKey:n,...s}=o;return{...s,label:lo(n)}}});var as=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-efficiency","btn-environmental","btn-diagnostics","btn-dashboard"];function ls(t,e){return as.filter(o=>o!=="btn-dashboard"||e).map(o=>({...uo[o],active:o===t}))}function ds(t){let e=typeof t=="string"?uo[t]:t;if(e.hidden)return"";let o=e.appearance?` appearance="${e.appearance}"`:"",n=e.active?' class="nav-active" disabled aria-current="page"':"",s=e.iconColor?` style="--icon-accent:${e.iconColor}"`:"",i=e.icon?`<span class="codicon codicon-${e.icon} nav-icon"${s}></span>`:"";return`<vscode-button id="${e.id}"${o}${n}>${i}${e.label}</vscode-button>`}function po(t,e){return ls(t,e).map(o=>ds(o)).join(`
`)}function h(t,e){t&&(t.innerHTML=e)}function le(t,e,o){let n=document.createElement(t);return e&&(n.className=e),o!==void 0&&(n.textContent=o),n}function cs(t){let e=[],o=t.location?.origin;o&&o!=="null"&&e.push(o);let n=t.location?.href,s=n?/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(n):null;return s&&!e.includes(s[0])&&e.push(s[0]),e}function us(t,e,o){return t==null||t===e||t===e.parent||t===e.top?!0:!!o&&cs(e).includes(o)}function $t(t,e){window.addEventListener("message",o=>{if(!us(o.source,window,o.origin)){e?.(o);return}t(o.data)})}function go(t){return`ext-point-${t}`}function mo(t,e){let o=document.querySelector(".button-row");if(!o)return;let n=new Set(e.map(s=>s.id));for(let s of Array.from(o.querySelectorAll('[id^="ext-point-"]'))){let i=s.id.slice(10);n.has(i)||s.remove()}for(let s of e){if(document.getElementById(go(s.id)))continue;let i=document.createElement("vscode-button");i.id=go(s.id),i.textContent=s.label,i.addEventListener("click",()=>{t.postMessage({command:"extensionPointAction",buttonId:s.id})}),o.append(i)}}function fo(t){mo(t,window.__EXTENSION_POINT_BUTTONS__??[]),!window.__extensionPointButtonsListenerRegistered__&&(window.__extensionPointButtonsListenerRegistered__=!0,$t(e=>{e?.command==="extensionPointButtonsUpdated"&&Array.isArray(e.buttons)&&mo(t,e.buttons)}))}var bo={Antigravity:"\u{1F680}","Claude Code":"\u{1F7E0}","Claude Code CLI":"\u{1F7E0}","Claude Desktop":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}",Cline:"\u{1F916}","Codex CLI":"\u{1F300}",Continue:"\u25B6\uFE0F","Copilot CLI":"\u{1F916}","Copilot CLI (App)":"\u{1F916}",Crush:"\u{1F9BE}",Cursor:"\u{1F5B1}\uFE0F",Devin:"\u{1F9E0}","Devin CLI":"\u{1F9E0}",Eclipse:"\u{1F311}","Gemini CLI":"\u{1F48E}",Hermes:"\u{1FABD}",JetBrains:"\u{1F9E9}","Kilo Code":"\u{1F7E3}",Kiro:"\u{1F47B}","Kiro CLI":"\u{1F47B}","Mistral Vibe":"\u{1F525}","MS Scout (Copilot CLI)":"\u{1F52D}",OpenCode:"\u{1F7E2}",Pi:"\u03C0",Unknown:"\u2753","Visual Studio":"\u{1FA9F}","VS Code":"\u{1F499}","VS Code Exploration":"\u{1F9EA}","VS Code Insiders":"\u{1F49A}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Windsurf:"\u{1F3C4}"};function ho(t){return bo[t]??"\u{1F4DD}"}function Y(t){let e=globalThis.window;return e?e[t]:void 0}var ps=Y("__TOKEN_ESTIMATORS__"),ea=ps?.estimators??{};function I(t){return ho(t)}function d(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function de(t){let e=Number(t);if(!Number.isFinite(e)||e<0)return"N/A";if(e<1024)return`${e} B`;let o=["KB","MB","GB","TB","PB"],n=e/1024,s=0;for(;n>=1024&&s<o.length-1;)n/=1024,s++;let i=s===0?1:2;return`${n.toFixed(i)} ${o[s]}`}function Rt(t){try{let e=Date.now(),o=new Date(t).getTime();if(!Number.isFinite(o))return"Unknown";let n=e-o;if(n<0)return"Just now";let s=Math.floor(n/1e3),i=Math.floor(s/60),r=Math.floor(i/60),a=Math.floor(r/24);return a>0?`${a} day${a!==1?"s":""} ago`:r>0?`${r} hour${r!==1?"s":""} ago`:i>0?`${i} minute${i!==1?"s":""} ago`:`${s} second${s!==1?"s":""} ago`}catch{return"Unknown"}}var It={today:"Today",last7:"Last 7 days",last14:"Last 14 days",last30:"Last 30 days",last90:"Last 90 days",currentMonth:"Current month",lastMonth:"Previous month",thisWeek:"This week",allTime:"All time"},gs=["today","last7","last30","last90","currentMonth","allTime"];function yo(t,e,o){e===o&&(t.selected=!0)}function ce(t){let e=le("div","period-selector");e.style.display="inline-flex",e.style.alignItems="center",e.style.gap="4px";let o=t.label??"Time window:";if(o){let r=le("span","period-selector-label",o);r.style.fontSize="11px",r.style.color="var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))",e.append(r)}let n=document.createElement("select");n.className="period-selector-select",t.id&&(n.id=t.id),n.style.background="var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))",n.style.color="var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))",n.style.border="1px solid var(--border-subtle, #555555)",n.style.borderRadius="4px",n.style.padding="4px 8px",n.style.fontSize="13px",n.style.cursor="pointer",n.style.minHeight="24px";let s=new Set(t.disabled??[]),i=t.periods??gs;for(let r of i){let a=document.createElement("option");a.value=r,a.textContent=It[r],yo(a,r,t.selected),s.has(r)&&(a.disabled=!0,t.disabledTitle&&(a.title=t.disabledTitle)),n.append(a)}for(let r of t.extraOptions??[]){let a=document.createElement("option");a.value=r.value,a.textContent=r.label,r.title&&(a.title=r.title),yo(a,r.value,t.selected),r.disabled&&(a.disabled=!0),n.append(a)}return n.addEventListener("change",()=>{t.onChange(n.value)}),e.append(n),{wrapper:e,select:n}}function vo(t,e){return{restore(){let o=t.getState();return{...e,...o??{}}},save(o){t.setState(o)},patch(o){let n=t.getState()??{...e},s={...e,...n,...o};return t.setState(s),s}}}var ko=`/**
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
`;var xo=`* {
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

/* Share Card tab \u2014 a screenshot-friendly summary of detected editors */
.share-card {
	background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
	border: 1px solid var(--border-color);
	border-radius: 16px;
	padding: 24px 28px;
	max-width: 640px;
	box-shadow: 0 8px 32px var(--shadow-color);
}

.share-badge {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--link-color);
	margin-bottom: 6px;
}

.share-title {
	font-size: 22px;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 4px;
}

.share-subtitle {
	font-size: 12px;
	color: var(--text-muted);
	margin-bottom: 18px;
}

.share-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 18px;
}

.share-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-size: 13px;
	color: var(--text-primary);
}

.share-pill-count {
	font-weight: 700;
	color: var(--link-color);
}

.share-stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
	gap: 10px;
}

.share-stat {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 10px;
	text-align: center;
}

.share-stat-value {
	font-size: 18px;
	font-weight: 700;
	color: var(--text-primary);
}

.share-stat-label {
	font-size: 10px;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.06em;
	margin-top: 2px;
}

/* Share Card social share buttons \u2014 mirrors the Fluency Score share-section styling */
.share-buttons {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 10px;
}

.share-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 14px;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
	background: var(--button-secondary-bg);
}

.share-btn-icon {
	font-size: 16px;
	flex-shrink: 0;
}

.share-btn:active {
	transform: translateY(0);
}

.share-btn-linkedin {
	color: #0a66c2;
	border-color: rgba(10, 102, 194, 0.5);
}

.share-btn-linkedin:hover {
	background: rgba(10, 102, 194, 0.12);
	border-color: #0a66c2;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(10, 102, 194, 0.25);
}

.share-btn-bluesky {
	color: #1285fe;
	border-color: rgba(18, 133, 254, 0.5);
}

.share-btn-bluesky:hover {
	background: rgba(18, 133, 254, 0.12);
	border-color: #1285fe;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(18, 133, 254, 0.25);
}

.share-btn-mastodon {
	color: #6364ff;
	border-color: rgba(99, 100, 255, 0.5);
}

.share-btn-mastodon:hover {
	background: rgba(99, 100, 255, 0.12);
	border-color: #6364ff;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(99, 100, 255, 0.25);
}

/* Light theme overrides for share button text colors */
body[data-vscode-theme-kind="vscode-light"] .share-btn-linkedin,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-linkedin { color: #0a66c2; }
body[data-vscode-theme-kind="vscode-light"] .share-btn-bluesky,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-bluesky { color: #0369a1; }
body[data-vscode-theme-kind="vscode-light"] .share-btn-mastodon,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-mastodon { color: #4f46e5; }

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

/* Skill Usage tab: editor filter chip row */
.skill-usage-filter-panel {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 14px;
}

.skill-usage-chip {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 999px;
	padding: 5px 12px;
	font-size: 12px;
	color: var(--text-primary);
	cursor: pointer;
	transition: all 0.15s;
	white-space: nowrap;
}

.skill-usage-chip:hover {
	background: var(--list-hover-bg);
}

.skill-usage-chip.active {
	background: var(--list-active-bg);
	border-color: var(--link-color);
	color: var(--list-active-fg);
}

.skill-usage-chip-count {
	opacity: 0.75;
	font-variant-numeric: tabular-nums;
	margin-left: 2px;
}

.skill-usage-description {
	color: var(--text-primary);
	opacity: 0.8;
	font-size: 12px;
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

/* Candidate/scanned paths table: force long paths to wrap within the
   panel instead of growing the table wider than its container. */
.candidate-paths-table .session-table {
	table-layout: fixed;
}

.candidate-paths-table .session-table th:first-child,
.candidate-paths-table .session-table td:first-child {
	width: 60px;
}

.candidate-paths-table .session-table th:nth-child(2),
.candidate-paths-table .session-table td:nth-child(2) {
	width: 140px;
}

.candidate-paths-table .session-table th:last-child,
.candidate-paths-table .session-table td:last-child {
	word-break: break-all;
	overflow-wrap: anywhere;
	white-space: normal;
}

.candidate-paths-table .session-table td:nth-child(2) .editor-badge {
	white-space: normal;
	word-break: break-word;
}

/* Main Session Folders table: same treatment as the candidate paths table
   so long folder paths wrap instead of forcing the table (and page) wider
   than the panel. */
.session-folders-table .session-table {
	table-layout: fixed;
}

.session-folders-table .session-table th:first-child,
.session-folders-table .session-table td:first-child {
	word-break: break-all;
	overflow-wrap: anywhere;
	white-space: normal;
}

.session-folders-table .session-table th:nth-child(2),
.session-folders-table .session-table td:nth-child(2) {
	width: 150px;
}

.session-folders-table .session-table td:nth-child(2) .editor-badge {
	white-space: normal;
	word-break: break-word;
}

.session-folders-table .session-table th:nth-child(3),
.session-folders-table .session-table td:nth-child(3) {
	width: 110px;
}

.session-folders-table .session-table th:last-child,
.session-folders-table .session-table td:last-child {
	width: 150px;
	white-space: normal;
	overflow-wrap: anywhere;
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

.ttft-chart-wrap {
	margin-top: 16px;
}

.ttft-chart {
	width: 100%;
	height: auto;
	display: block;
}

.ttft-gridline {
	stroke: var(--border-color);
	stroke-width: 1;
	stroke-dasharray: 2 3;
}

.ttft-axis-label {
	fill: var(--text-muted);
	font-size: 10px;
}

.ttft-legend {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 8px;
	font-size: 12px;
	color: var(--text-secondary);
}

.ttft-legend-item {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
	user-select: none;
}

.ttft-legend-item.ttft-hidden {
	opacity: 0.4;
	text-decoration: line-through;
}

.ttft-series.ttft-hidden {
	display: none;
}

.ttft-legend-swatch {
	width: 10px;
	height: 10px;
	border-radius: 2px;
	display: inline-block;
}

`;var bs=Y("__MODEL_PRICING__"),ue={};for(let[t,e]of Object.entries(bs?.pricing??{}))e.displayNames&&e.displayNames.length>0&&(ue[t]=e.displayNames[0]);function _t(t){try{return decodeURIComponent(t)}catch{return t}}function To(t){let e=t.split("/");if(!(e.length!==3||e.some(o=>o.trim()==="")))return{source:_t(e[0]),providerName:_t(e[1]),modelId:_t(e[2])}}var Lt=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i;function pe(t){let e=[],o=r=>{r&&!e.includes(r)&&e.push(r)},n=r=>{o(r),o(r.replace(/(\d+)-(\d+)(?=-|$)/,"$1.$2"))},s=t.replace(/^copilot\//,"");n(s);let i=To(s);return i&&n(i.modelId),Lt.test(s)&&n(s.replace(Lt,"")),e}function ge(t){for(let o of pe(t))if(ue[o])return ue[o];let e=To(t);return e?e.modelId:Lt.test(t)?t.replace(Lt,""):_t(t)}var va=1/1e11;var So=[{bg:"rgba(54, 162, 235, 0.6)",border:"rgba(54, 162, 235, 1)"},{bg:"rgba(255, 99, 132, 0.6)",border:"rgba(255, 99, 132, 1)"},{bg:"rgba(75, 192, 192, 0.6)",border:"rgba(75, 192, 192, 1)"},{bg:"rgba(153, 102, 255, 0.6)",border:"rgba(153, 102, 255, 1)"},{bg:"rgba(255, 159, 64, 0.6)",border:"rgba(255, 159, 64, 1)"},{bg:"rgba(255, 205, 86, 0.6)",border:"rgba(255, 205, 86, 1)"},{bg:"rgba(201, 203, 207, 0.6)",border:"rgba(201, 203, 207, 1)"},{bg:"rgba(100, 181, 246, 0.6)",border:"rgba(100, 181, 246, 1)"}];function me(t){return So[t%So.length]}function Ut(t){return t.file+t.selection+t.implicitSelection+t.symbol+t.codebase+t.workspace+t.terminal+t.vscode+t.copilotInstructions+t.agentsMd+(t.terminalLastCommand||0)+(t.terminalSelection||0)+(t.clipboard||0)+(t.changes||0)+(t.outputPanel||0)+(t.problemsPanel||0)+(t.pullRequest||0)}var ks=[{key:"file",full:"#file",abbr:"#file"},{key:"selection",full:"#selection",abbr:"#sel"},{key:"implicitSelection",full:"implicit",abbr:"impl"},{key:"symbol",full:"#symbol",abbr:"#sym"},{key:"codebase",full:"#codebase",abbr:"#cb"},{key:"workspace",full:"@workspace",abbr:"@ws"},{key:"terminal",full:"@terminal",abbr:"@term"},{key:"vscode",full:"@vscode",abbr:"@vsc"},{key:"terminalLastCommand",full:"#terminalLastCommand",abbr:"#termLC"},{key:"terminalSelection",full:"#terminalSelection",abbr:"#termSel"},{key:"clipboard",full:"#clipboard",abbr:"#clip"},{key:"changes",full:"#changes",abbr:"#chg"},{key:"outputPanel",full:"#outputPanel",abbr:"#out"},{key:"problemsPanel",full:"#problemsPanel",abbr:"#prob"},{key:"pullRequest",full:"#pr",abbr:"#pr"},{key:"copilotInstructions",full:"\u{1F4CB} instructions",abbr:"\u{1F4CB} inst"},{key:"agentsMd",full:"\u{1F916} agents",abbr:"\u{1F916} ag"}];function Co(t,e=!1){let o=[];for(let n of ks){let s=t[n.key]||0;if(s>0){let i=e?n.abbr:n.full;o.push(`${i}: ${s}`)}}return o.length>0?o.join(", "):"None"}var Ns="Loading...",Fs=/Session File Locations \(first 20\):[\s\S]*?(?=\n\s*\n|={70})/,Hs=`<div class="analyzer-loading" style="flex-direction:column;align-items:flex-start;gap:6px;">
<div style="display:flex;align-items:center;gap:10px;">
<span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
<span>\u23F3 Loading diagnostic data\u2026</span>
</div>
<div id="report-loading-subtext" style="font-size:12px;color:var(--text-muted);">Scanning session files\u2026</div>
</div>`,m=acquireVsCodeApi(),wt=Y("__INITIAL_DIAGNOSTICS__");if(wt?.localization){ao(wt.localization);let t=wt.localization.__language__||"en";co(t)}var E=vo(m,{activeTab:void 0,activeSubtab:void 0,otelDeltaPeriod:"all",shareCardPeriod:"last14",skillUsageEditorFilter:"all",ttftGranularity:"day",ttftScanRange:"14d"}),Fe,Jt=E.restore().otelDeltaPeriod??"all",Mt=E.restore().ttftGranularity??"day",Zt=E.restore().ttftScanRange??"14d",zs=["last7","last14","last30","last90","allTime"],st=E.restore().shareCardPeriod??"last14",it="lastInteraction",rt="desc",dt=null,at=null,Et=!0,He=!1,Xt="avg",lt="desc",Oe,ze,je,Ge,qe=E.restore().skillUsageEditorFilter??"all",q=[],V=!0,W,N,Qt="all";function Dn(t){return t.replace(Fs,"")}function At(t){if(!t)return"N/A";try{return d(new Date(t).toLocaleString())}catch{return d(t)}}function bn(t){if(t==null)return"0";let e=Number(t);return Number.isFinite(e)?Math.floor(e).toString():"0"}function S(t){let e=Number(t??0);return!Number.isFinite(e)||e===0?"0":e>=1e9?`${(e/1e9).toFixed(1)}B`:e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:Math.floor(e).toString()}function js(t,e){let o=document.createElement("tr");t.exists||(o.style.opacity="0.5");let n=document.createElement("td");n.textContent=t.exists?"\u2705":"\u274C",n.style.textAlign="center";let s=document.createElement("td"),i=document.createElement("span");i.className=oe(t.source),i.textContent=`${I(t.source)} ${t.source}`,s.appendChild(i);let r=document.createElement("td");r.setAttribute("title",t.path),r.style.fontFamily="var(--vscode-editor-font-family, monospace)",r.style.fontSize="12px",r.textContent=t.path,o.append(n,s,r),e.appendChild(o)}function Gs(t,e){let o=t.some(l=>l.exists),n=document.createElement("tr");o||(n.style.opacity="0.5");let s=document.createElement("td");s.textContent=o?"\u2705":"\u274C",s.style.textAlign="center";let i=document.createElement("td"),r=document.createElement("span");r.className=oe("Crush"),r.textContent=`${I("Crush")} Crush`,i.appendChild(r);let a=document.createElement("td");a.style.fontFamily="var(--vscode-editor-font-family, monospace)",a.style.fontSize="12px",a.style.lineHeight="1.6";for(let l of t){let p=document.createElement("div");p.style.opacity=l.exists?"1":"0.5",p.title=l.path,p.textContent=`${l.exists?"\u2705":"\u274C"} ${l.path}`,a.appendChild(p)}n.append(s,i,a),e.appendChild(n)}function qs(t){let e=document.createElement("div");e.className="candidate-paths-table";let o=document.createElement("h4");o.textContent="Scanned Paths (all candidate locations):",e.appendChild(o);let n=document.createElement("p");n.style.cssText="color: #999; font-size: 12px; margin: 4px 0 8px 0;",n.textContent="These are all the paths the extension checks for session files. Paths marked with \u2705 exist on this system.",e.appendChild(n);let s=document.createElement("div");s.className="table-container",e.appendChild(s);let i=document.createElement("table");i.className="session-table",s.appendChild(i);let r=document.createElement("thead"),a=document.createElement("tr");for(let u of["Status","Source","Path"]){let b=document.createElement("th");b.textContent=u,a.appendChild(b)}r.appendChild(a),i.appendChild(r);let l=document.createElement("tbody");i.appendChild(l);let p=[...t].sort((u,b)=>u.exists!==b.exists?u.exists?-1:1:u.source.localeCompare(b.source)),g=p.filter(u=>u.source.toLowerCase().includes("crush")),c=p.filter(u=>!u.source.toLowerCase().includes("crush"));for(let u of c)js(u,l);return g.length>0&&Gs(g,l),e}function Ws(t){let e=t.split(/[/\\]/);return e[e.length-1]}function Vs(t){if(!t)return"";let e=t.replace(/\.git$/,"");if(e.includes("@")&&e.includes(":")){let n=e.lastIndexOf(":"),s=e.lastIndexOf("@");if(n>s)return e.substring(n+1)}try{if(e.includes("://")){let n=new URL(e),s=n.pathname.split("/").filter(i=>i);return s.length>=2?`${s[s.length-2]}/${s[s.length-1]}`:n.pathname.replace(/^\//,"")}}catch{}let o=e.split("/").filter(n=>n);return o.length>=2?`${o[o.length-2]}/${o[o.length-1]}`:e}function oe(t){let e=t.toLowerCase();return e.includes("ms scout")||e.includes("microsoft scout")?"editor-badge editor-badge-ms-scout":e.includes("visual studio")?"editor-badge editor-badge-vs":e.includes("jetbrains")?"editor-badge editor-badge-jetbrains":e.includes("mistral")?"editor-badge editor-badge-mistral-vibe":e.includes("antigravity")?"editor-badge editor-badge-antigravity":e.includes("gemini")?"editor-badge editor-badge-gemini-cli":e.includes("crush")?"editor-badge editor-badge-crush":e.includes("cursor")?"editor-badge editor-badge-cursor":e==="pi"?"editor-badge editor-badge-pi":"editor-badge"}function hn(t,e){switch(e){case"size":return t.size||0;case"tokens":return t.tokens||0;case"interactions":return t.interactions||0;case"contextRefs":return Ut(t.contextReferences);default:return 0}}function Ks(t,e){if(it==="lastInteraction"){let s=t.lastInteraction,i=e.lastInteraction;if(!s&&!i)return 0;if(!s)return 1;if(!i)return-1;let r=new Date(s).getTime(),a=new Date(i).getTime();return rt==="desc"?a-r:r-a}let o=hn(t,it),n=hn(e,it);return o===0&&n===0?0:rt==="desc"?n-o:o-n}function Ys(t,e){let o=new Set,n=[];for(let s of t)if(!o.has(s.file)){n.push(s),o.add(s.file);for(let i of s.childInfo??[]){if(!i.sessionFile)continue;let r=e.get(i.sessionFile);r&&!o.has(r.file)&&(n.push(r),o.add(r.file))}}return n}function Js(t){let e=[...t].sort(Ks),o=new Map;for(let n of e)o.set(n.file,n);return Ys(e,o)}function Ct(t){return it!==t?"":rt==="desc"?" \u25BC":" \u25B2"}function Dt(t){let e=new Map;for(let o of t){let n=o.editorName||o.editorSource||"Unknown";e.has(n)||e.set(n,{count:0,interactions:0});let s=e.get(n);s.count++,s.interactions+=o.interactions}return Object.fromEntries(e)}function Zs(t){return t==null?"":d(String(t))}function We(t){let e=t.tokens||0;if(e===0||!t.modelUsage)return 0;let o=Object.values(t.modelUsage).reduce((n,s)=>n+s.inputTokens+s.outputTokens,0);return o>0?Math.max(0,e-o):0}function Xs(t){let e=dt?t.filter(n=>(n.editorName||n.editorSource)===dt):t;at&&(e=e.filter(n=>{let s=n.contextReferences[at];return typeof s=="number"&&s>0})),He&&(e=e.filter(n=>We(n)>1e3));let o=e.filter(n=>n.interactions===0).length;return Et&&o===e.length&&e.length>0&&(Et=!1),Et&&(e=e.filter(n=>n.interactions>0)),{filteredFiles:e,zeroInteractionCount:o}}function Qs(t){return t.reduce((e,o)=>{let n=o.contextReferences;return e.file+=n.file,e.symbol+=n.symbol,e.selection+=n.selection,e.implicitSelection+=n.implicitSelection,e.codebase+=n.codebase,e.workspace+=n.workspace,e.terminal+=n.terminal,e.vscode+=n.vscode,e.copilotInstructions+=n.copilotInstructions,e.agentsMd+=n.agentsMd,e},{file:0,symbol:0,selection:0,implicitSelection:0,codebase:0,workspace:0,terminal:0,vscode:0,copilotInstructions:0,agentsMd:0})}function ti(t,e,o){return`<div class="editor-filter-panels">
    <div class="editor-panel ${dt===null?"active":""}" data-editor=""><div class="editor-panel-icon">\u{1F310}</div><div class="editor-panel-name">All Editors</div><div class="editor-panel-stats">${t.length} sessions</div></div>
    ${o.map(n=>`<div class="editor-panel ${dt===n?"active":""}" data-editor="${d(n)}"><div class="editor-panel-icon">${I(n)}</div><div class="editor-panel-name">${d(n)}</div><div class="editor-panel-stats">${e[n].count} sessions \xB7 ${e[n].interactions} interactions</div></div>`).join("")}
  </div>`}function ei(t,e,o,n,s,i,r){let a=(g,c,u)=>i[g]>0?`<div class="context-ref-filter ${at===g?"active":""}" data-ref-type="${g}">${c} ${u} ${i[g]}</div>`:"",l=e.filter(g=>We(g)>1e3).length,p=l>0?`<label class="empty-sessions-toggle" title="Sessions where some debug-log tokens cannot be assigned to a specific model \u2014 may indicate incomplete model attribution in the debug log"><input type="checkbox" id="show-only-unattributed" ${He?"checked":""}>\u26A0\uFE0F Show only sessions with unattributed tokens<span class="hidden-count">(${l} session${l===1?"":"s"})</span></label>`:"";return`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F4C1} ${dt?"Filtered":"Total"} Sessions</div><div class="summary-value">${t.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4AC} Interactions</div><div class="summary-value">${o}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1FA99} Tokens</div><div class="summary-value" title="${n.toLocaleString()} tokens">${S(n)}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F517} Context References</div><div class="summary-value">${Zs(s)}</div><div class="summary-sub">${s===0?"None":""}${a("file","","#file")}${a("symbol","","#sym")}${a("implicitSelection","","implicit")}${a("copilotInstructions","\u{1F4CB}","instructions")}${a("agentsMd","\u{1F916}","agents")}${a("workspace","","@workspace")}${a("vscode","","@vscode")}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4C5} Time Range</div><div class="summary-value">Last 14 days</div></div>
  </div>
  <div class="filter-options"><label class="empty-sessions-toggle"><input type="checkbox" id="hide-empty-sessions" ${Et?"checked":""}>Hide sessions with 0 interactions${r>0?`<span class="hidden-count">(${r} hidden)</span>`:""}</label>${p}</div>`}function oi(t){return!t.subAgentCalls||t.subAgentCalls<=0?"":`<span class="session-hierarchy-badge" title="${t.subAgentCalls===1?"1 sub-agent tool call":`${t.subAgentCalls} sub-agent tool calls`} detected in this session">\u{1F916} ${t.subAgentCalls} Sub-Agent${t.subAgentCalls===1?"":"s"}</span>`}function ni(t){let e="";if(t.parentInfo){let o=d(t.parentInfo.name.length>30?t.parentInfo.name.substring(0,30)+"\u2026":t.parentInfo.name),n=t.parentInfo.sessionFile?` href="#" class="session-hierarchy-badge hierarchy-parent session-file-link" data-file="${encodeURIComponent(t.parentInfo.sessionFile)}"`:' class="session-hierarchy-badge hierarchy-parent"';e+=`<a${n} title="Parent session: ${d(t.parentInfo.name)}">\u2191 Parent: ${o}</a>`}if(t.totalChildCount&&t.totalChildCount>0){let o=t.totalChildCount,n=o===1?"1 child session":`${o} child sessions`;e+=`<span class="session-hierarchy-badge hierarchy-children" title="${n}">\u2193 ${o} ${o===1?"Child":"Children"}</span>`}return e+=oi(t),e?`<div class="session-hierarchy-badges">${e}</div>`:""}function si(t){let e=We(t);if(e<=1e3)return"";let o=Math.round(e/(t.tokens||1)*100);return` <span title="\u26A0\uFE0F ${e.toLocaleString()} tokens (~${o}%) not attributed to any model \u2014 debug log events without a model field" style="color:#f59e0b; cursor:help; font-size:0.9em;">\u26A0\uFE0F</span>`}function ii(t){let e=t.map((o,n)=>{let s=o.editorName||o.editorSource,i=!!o.parentInfo,r=o.title?`<a href="#" class="session-file-link" data-file="${encodeURIComponent(o.file)}" title="${d(o.title)}">${d(o.title.length>40?o.title.substring(0,40)+"...":o.title)}</a>`:`<a href="#" class="session-file-link empty-session-link" data-file="${encodeURIComponent(o.file)}" title="Empty session">(Empty session)</a>`,a=i?`<span class="child-title-indent">${r}</span>`:r,l=ni(o),p=o.repository?d(Vs(o.repository)):o.file.includes("session-store.db")?'<span style="color: #888; font-style: italic;">No workspace</span>':'<span style="color: #666;">\u2014</span>',g=o.repository?d(o.repository):o.file.includes("session-store.db")?"Chat session \u2014 no workspace connected":"No repository detected",c=(o.editorName||o.editorSource||"Unknown")==="Unknown";return`<tr${i?' class="child-session-row"':""}><td>${n+1}</td><td><span class="${oe(s)}" title="${d(o.editorSource)}">${I(s)} ${d(s)}</span></td><td class="session-title" title="${o.title?d(o.title):"Empty session"}">${l}${a}</td><td class="repository-cell" title="${g}">${p}</td><td>${de(o.size)}</td><td title="${Number(o.tokens||0).toLocaleString()} tokens">${S(o.tokens)}${si(o)}</td><td>${bn(o.interactions)}</td><td title="${d(Co(o.contextReferences))}">${bn(Ut(o.contextReferences))}</td><td>${At(o.lastInteraction)}</td><td><a href="#" class="view-formatted-link" data-file="${encodeURIComponent(o.file)}" title="View formatted JSONL file">\u{1F4C4} View</a>${c?` <a href="#" class="report-editor-link" data-path="${encodeURIComponent(o.file)}" title="Report this unknown path so we can add editor support">\u{1F4E2} Report</a>`:""}</td></tr>`}).join("");return`<div class="table-container"><table class="session-table"><thead><tr><th>#</th><th>Editor</th><th>Title</th><th>Repository</th><th class="sortable" data-sort="size">Size${Ct("size")}</th><th class="sortable" data-sort="tokens">Tokens${Ct("tokens")}</th><th class="sortable" data-sort="interactions">Interactions${Ct("interactions")}</th><th class="sortable" data-sort="contextRefs">Context Refs${Ct("contextRefs")}</th><th class="sortable" data-sort="lastInteraction">Last Interaction${Ct("lastInteraction")}</th><th>Actions</th></tr></thead><tbody>${e}</tbody></table></div>`}function $n(t,e=!1){if(e)return'<div class="loading-state"><div class="loading-spinner">\u23F3</div><div class="loading-text">Loading session files...</div><div class="loading-subtext" id="session-loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>';if(t.length===0)return'<p style="color: #999;">No session files with activity in the last 14 days.</p>';let o=Dt(t),n=Object.keys(o).sort(),{filteredFiles:s,zeroInteractionCount:i}=Xs(t),r=s.reduce((c,u)=>c+Number(u.interactions||0),0),a=s.reduce((c,u)=>c+Number(u.tokens||0),0),l=s.reduce((c,u)=>c+Ut(u.contextReferences),0),p=Qs(s),g=Js(s);return`${ti(t,o,n)}${ei(s,t,r,a,l,p,i)}${ii(g)}`}function yn(t,e,o){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(e)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="number" class="debug-counter-input" data-key="${d(t)}" value="${o}" min="0" step="1"
          style="width:70px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 2px 6px; font-family: var(--vscode-editor-font-family, monospace);" />
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-counter-set" data-key="${d(t)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}function ri(t,e,o){let n=o?`\u2705 ${d(o)}`:"\u274C (not set)";return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(e)}</td>
      <td style="padding: 6px 8px 6px 0;" colspan="2">
        <span style="font-family: var(--vscode-editor-font-family, monospace);">${n}</span>
      </td>
    </tr>`}function vn(t,e,o){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${d(e)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="checkbox" class="debug-flag-input" data-key="${d(t)}" ${o?"checked":""} />
        <span style="margin-left:6px; font-family: var(--vscode-editor-font-family, monospace);">${o?"\u2705 true":"\u274C false"}</span>
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-flag-set" data-key="${d(t)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}var ai={last7:7,last14:14,last30:30,last90:90};function Rn(t,e,o=new Date){let n=ai[e];if(n===void 0)return t;let s=new Date(o);return s.setDate(s.getDate()-n),t.filter(i=>{if(!i.lastInteraction)return!1;let r=new Date(i.lastInteraction);return!Number.isNaN(r.getTime())&&r>=s&&r<=o})}function li(t){return t==="allTime"?"of all time":`in the ${It[t].toLowerCase()}`}function di(t,e,o,n,s,i){let r=t.map(a=>`${I(a)} ${a} (${e[a].count})`).join(", ");return`My AI Coding Toolbox \u2014 ${t.length} editor${t.length===1?"":"s"} detected: ${r}. ${o} sessions, ${n} interactions, ${S(s)} tokens ${li(i)}. #AIEngineeringFluency`}function In(t,e=!1){if(e)return`<div id="tab-share" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F4F8} Share Card</div>
        <div>A snapshot of your AI coding toolbox \u2014 screenshot this card to share your editor mix on social media.</div>
      </div>
      <div class="loading-state"><div class="loading-spinner">\u23F3</div><div class="loading-text">Loading session files...</div><div class="loading-subtext" id="share-loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>
    </div>`;if(t.length===0)return`<div id="tab-share" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F4F8} Share Card</div>
        <div>No session activity found yet. Once you have some AI coding sessions, a shareable summary card will appear here.</div>
      </div>
    </div>`;let o=st,n=Rn(t,o),s=Dt(n),i=Object.keys(s).sort((c,u)=>s[u].count-s[c].count),r=n.length,a=n.reduce((c,u)=>c+Number(u.interactions||0),0),l=n.reduce((c,u)=>c+Number(u.tokens||0),0),p=i.map(c=>`<div class="share-pill"><span>${I(c)}</span><span>${d(c)}</span><span class="share-pill-count">${s[c].count}</span></div>`).join(""),g=r===0?'<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">No session activity in this period. Try a wider range.</div>':"";return`<div id="tab-share" class="tab-content">
    <div class="info-box">
      <div class="info-box-title">\u{1F4F8} Share Card</div>
      <div>A snapshot of your AI coding toolbox \u2014 screenshot this card to share your editor mix on social media.</div>
    </div>
    <div class="share-card-controls" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 12px; color: var(--text-muted);">Period:</span>
      <span id="share-card-period-selector"></span>
    </div>
    <div class="share-card">
      <div class="share-badge">\u{1F916} AI Engineering Fluency</div>
      <div class="share-title">My AI Coding Toolbox</div>
      <div class="share-subtitle">${d(It[o])} \xB7 ${i.length} editor${i.length===1?"":"s"} detected</div>
      <div class="share-pills">${p}</div>
      <div class="share-stats">
        <div class="share-stat"><div class="share-stat-value">${r}</div><div class="share-stat-label">Sessions</div></div>
        <div class="share-stat"><div class="share-stat-value">${a}</div><div class="share-stat-label">Interactions</div></div>
        <div class="share-stat"><div class="share-stat-value" title="${l.toLocaleString()} tokens">${S(l)}</div><div class="share-stat-label">Tokens</div></div>
        <div class="share-stat"><div class="share-stat-value">${i.length}</div><div class="share-stat-label">Editors</div></div>
      </div>
    </div>
    ${g}
    <div class="button-group" style="margin-top: 12px;">
      <button class="button secondary" id="btn-copy-share-summary"><span>\u{1F4CB}</span><span>Copy Summary Text</span></button>
    </div>
    <div class="share-buttons" style="margin-top: 12px;">
      <button id="btn-share-card-linkedin" class="share-btn share-btn-linkedin"><span class="share-btn-icon">\u{1F4BC}</span><span>Share on LinkedIn</span></button>
      <button id="btn-share-card-bluesky" class="share-btn share-btn-bluesky"><span class="share-btn-icon">\u{1F98B}</span><span>Share on Bluesky</span></button>
      <button id="btn-share-card-mastodon" class="share-btn share-btn-mastodon"><span class="share-btn-icon">\u{1F418}</span><span>Share on Mastodon</span></button>
    </div>
  </div>`}function ci(t){let e=t??{openCount:0,unknownMcpOpenCount:0,fluencyBannerDismissed:!1,unknownMcpDismissedVersion:"",efficiencyTabBannerDismissed:!1};return`
    <div id="tab-debug" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F41B} Debug \u2014 Global State Counters</div>
        <div>Visible only when a debugger is attached. Edit counters and dismissed flags stored in VS Code global state, then click Set to apply. Changes take effect immediately.</div>
      </div>
      <div class="cache-details">
        <h4>Notification Counters</h4>
        <table><tbody>
          ${yn("extension.openCount","extension.openCount (fluency banner threshold: 5)",e.openCount)}
          ${yn("extension.unknownMcpOpenCount","extension.unknownMcpOpenCount (unknown MCP threshold: 8)",e.unknownMcpOpenCount)}
        </tbody></table>
        <h4 style="margin-top:16px;">Dismissed Flags</h4>
        <table><tbody>
          ${vn("news.fluencyScoreBanner.v1.dismissed","news.fluencyScoreBanner.v1.dismissed",e.fluencyBannerDismissed)}
          ${ri("news.unknownMcpTools.dismissedVersion","news.unknownMcpTools.dismissedVersion",e.unknownMcpDismissedVersion)}
          ${vn("news.efficiencyTab.v1.dismissed","news.efficiencyTab.v1.dismissed",e.efficiencyTabBannerDismissed)}
        </tbody></table>
        <div style="margin-top: 16px;">
          <button class="button secondary" id="btn-reset-debug-counters"><span>\u{1F504}</span><span>Reset All Counters &amp; Dismissed Flags</span></button>
        </div>
      </div>
    </div>`}function Ve(t){let e=t?.authenticated||!1,o=t?.username||"",n=e?"#2d6a4f":"#666";return`
<div class="info-box">
  <div class="info-box-title">\u{1F511} GitHub Authentication</div>
  <div>
    Authenticate with GitHub to unlock additional features in future releases.
  </div>
</div>

<div class="summary-cards">
  <div class="summary-card" style="border-left: 4px solid ${n};">
    <div class="summary-label">${e?"\u2705":"\u26AA"} Status</div>
    <div class="summary-value" style="font-size: 16px; color: ${n};">${e?"Authenticated":"Not Authenticated"}</div>
  </div>
  ${e?`
  <div class="summary-card">
    <div class="summary-label">\u{1F464} Logged in as</div>
    <div class="summary-value" style="font-size: 16px;">${d(o)}</div>
  </div>
  `:""}
</div>

${e?`
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
  ${e?`
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
  `}function _n(t,e){return t?{color:"#2d6a4f",icon:"\u2705",text:"Configured & Enabled"}:e?{color:"#d97706",icon:"\u26A0\uFE0F",text:"Enabled but Not Configured"}:{color:"#666",icon:"\u26AA",text:"Disabled"}}function ui(t){return t.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Storage Account</td><td>${d(t.storageAccount)}</td></tr><tr><td style="font-weight: 600;">Subscription ID</td><td>${d(t.subscriptionId)}</td></tr><tr><td style="font-weight: 600;">Resource Group</td><td>${d(t.resourceGroup)}</td></tr><tr><td style="font-weight: 600;">Aggregation Table</td><td>${d(t.aggTable)}</td></tr><tr><td style="font-weight: 600;">Events Table</td><td>${d(t.eventsTable)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4BB} Unique Devices</div><div class="summary-value">${d(String(t.deviceCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Based on workspace IDs</div></div><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${d(String(t.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u2601\uFE0F Cloud Records</div><div class="summary-value">${t.recordCount!==null?d(String(t.recordCount)):"\u2014"}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Azure Storage records</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Sync Status</div><div class="summary-value" style="font-size: 14px;">${t.lastSyncTime?At(t.lastSyncTime):"Never"}</div></div></div></div>`:'<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Azure Storage</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">To enable cloud synchronization, configure an Azure Storage account via the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Azure subscription with Storage Account access</li><li>Appropriate permissions (Storage Table Data Contributor or Storage Account Key)</li><li>VS Code signed in with your Azure account (for Entra ID auth)</li></ul></div>'}function pi(t){let{color:e,icon:o,text:n}=_n(t.isConfigured,t.enabled);return`<div class="info-box"><div class="info-box-title">\u2601\uFE0F Azure Storage Backend</div><div>Sync your token usage data to Azure Storage Tables for team-wide reporting and multi-device access.</div></div>
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${e};"><div class="summary-label">${o} Status</div><div class="summary-value" style="font-size: 16px; color: ${e};">${n}</div></div><div class="summary-card"><div class="summary-label">\u{1F510} Auth Mode</div><div class="summary-value" style="font-size: 16px;">${t.authMode==="entraId"?"Entra ID":"Shared Key"}</div></div><div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${d(t.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${t.lastSyncTime?Rt(t.lastSyncTime):"Never"}</div></div></div>
    ${ui(t)}
    <div class="button-group"><button class="button" id="btn-configure-backend"><span>${t.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${t.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function gi(t,e){let o=e?"#d97706":t?.authenticated?"#2d6a4f":"#666",n=e?"\u26A0\uFE0F":t?.authenticated?"\u2705":"\u26AA",s=e?"Not Authenticated":t?.authenticated?d(t.username||"Authenticated"):"Not Authenticated";return`<div class="summary-card" style="border-left: 4px solid ${o};"><div class="summary-label">${n} GitHub Auth</div><div class="summary-value" style="font-size: 14px; color: ${o};">${s}</div></div>`}function mi(t){return t.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Server URL</td><td>${d(t.endpointUrl)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${d(String(t.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Last Sync</div><div class="summary-value" style="font-size: 14px;">${t.lastSyncTime?At(t.lastSyncTime):"Never"}</div></div></div></div>`:`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Team Server</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">Deploy the sharing server and configure its URL in the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Deploy the sharing server (see the <code>sharing-server/</code> folder in the repository)</li><li>Enter the server's base URL in the Backend configuration panel</li><li>Data syncs automatically every 5 minutes once configured</li></ul></div>`}function fi(t,e){let{color:o,icon:n,text:s}=_n(t.isConfigured,t.enabled),i=t.isConfigured&&!e?.authenticated;return`<div class="info-box"><div class="info-box-title">\u{1F5A5}\uFE0F Team Server Backend</div><div>Sync your token usage data to a self-hosted team server for team-wide reporting.</div></div>
    ${i?'<button id="btn-team-server-auth-warning" style="width: 100%; margin-bottom: 16px; padding: 12px 16px; background: rgba(217, 119, 6, 0.15); border: 1px solid #d97706; border-radius: 6px; display: flex; gap: 10px; align-items: center; cursor: pointer; text-align: left;" title="Click to sign in to GitHub"><span style="font-size: 18px; flex-shrink: 0;">\u26A0\uFE0F</span><div style="flex: 1;"><div style="color: #fbbf24; font-weight: 600; font-size: 13px; margin-bottom: 4px;">GitHub Authentication Required</div><div style="color: #d4a017; font-size: 12px;">Team server sync will not run until you sign in to GitHub. <strong style="color: #fbbf24;">Click here to sign in.</strong></div></div><span style="color: #fbbf24; font-size: 18px; flex-shrink: 0;">\u2192</span></button>':""}
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${o};"><div class="summary-label">${n} Status</div><div class="summary-value" style="font-size: 16px; color: ${o};">${s}</div></div>${gi(e,i)}<div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${d(t.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${t.lastSyncTime?Rt(t.lastSyncTime):"Never"}</div></div></div>
    ${mi(t)}
    <div class="button-group"><button class="button" id="btn-configure-backend-team"><span>${t.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${t.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function Ke(t,e){return t?`
    <div class="subtab-bar">
      <button class="subtab active" data-subtab="backend-azure">\u2601\uFE0F Azure Storage</button>
      <button class="subtab" data-subtab="backend-teamserver">\u{1F5A5}\uFE0F Team Server</button>
    </div>
    <div id="subtab-backend-azure" class="subtab-content active">
      ${pi(t.azure)}
    </div>
    <div id="subtab-backend-teamserver" class="subtab-content">
      ${fi(t.teamServer,e)}
    </div>
  `:`
      <div class="info-box">
        <div class="info-box-title">\u2601\uFE0F Backend Storage</div>
        <div>\u23F3 Loading backend storage status...</div>
      </div>
    `}function bi(){return`
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
  `}function hi(t,e,o){let n=t.interactions>0||t.tokens>0,s=t.file.startsWith(o)?t.file.slice(o.length).replace(/^[/\\]/,""):Ws(t.file),i=Number(t.interactions),r=i>0?`<strong>${d(String(i))}</strong>`:'<span style="color: var(--text-muted);">0</span>',a=Number(t.tokens),l=a>0?`<strong title="${d(String(a.toLocaleString()))} tokens">${d(String(S(a)))}</strong>`:'<span style="color: var(--text-muted);">0</span>';return`
    <tr style="${n?"":"opacity: 0.45;"}">
      <td>${e+1}</td>
      <td title="${d(t.file)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d(s)}</td>
      <td>${d(String(de(t.size)))}</td>
      <td>${r}</td>
      <td>${l}</td>
      <td>${At(t.modified)}</td>
    </tr>`}function yi(t,e,o,n,s){let i=t.filter(u=>u.interactions>0||u.tokens>0),r=t.reduce((u,b)=>u+Number(b.interactions),0),a=t.reduce((u,b)=>u+Number(b.tokens),0),l=[...t].sort((u,b)=>{let v=u.interactions*1e3+u.tokens;return b.interactions*1e3+b.tokens-v}),p=n?`<div class="info-box" style="margin-bottom: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);">
        <div>\u26A0\uFE0F Scan limit reached (500 files). Results may be incomplete. Try a more specific subfolder.</div>
      </div>`:"",g=`
    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
      <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
      <div style="font-size: 14px;">No matching files found in this folder.</div>
      <div style="font-size: 12px; margin-top: 8px;">Try a different folder path or tool type.</div>
    </div>`,c=l.map((u,b)=>hi(u,b,s)).join("");return`
    <div class="section" style="margin-top: 0;">
      <div class="section-title"><span class="codicon codicon-graph"></span><span>Analysis Results</span></div>
      ${p}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Files Scanned</div>
          <div class="summary-value">${d(String(e))}${n?"+":""}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u2705 With Sessions</div>
          <div class="summary-value">${i.length}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${t.length-i.length} empty / unknown</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F4AC} Interactions</div>
          <div class="summary-value">${d(String(r))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1FA99} Tokens</div>
          <div class="summary-value" title="${d(String(a.toLocaleString()))} tokens">${d(String(S(a)))}</div>
        </div>
        ${o>0?`
        <div class="summary-card" style="border-left: 3px solid #d97706;">
          <div class="summary-label">\u26A0\uFE0F Unreadable</div>
          <div class="summary-value" style="color: #d97706;">${d(String(o))}</div>
        </div>`:""}
      </div>
      ${t.length===0?g:`
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
    </div>`}var vi=["allTime","lastMonth","currentMonth","thisWeek","today"],ki={today:"today",thisWeek:"week",currentMonth:"month",lastMonth:"lastMonth",allTime:"all",yesterday:"yesterday"},xi={today:"today",week:"thisWeek",month:"currentMonth",lastMonth:"lastMonth",all:"allTime",yesterday:"yesterday"};function Ti(t,e=!1){let o=Dt(t),n=Object.keys(o).sort().map(i=>`<option value="${d(i)}">${d(I(i))} ${d(i)} (${o[i].count})</option>`).join("");return`
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
        <select id="model-usage-editor-select" class="tool-type-select" ${e?"disabled":""}>
          <option value="all">\u{1F310} All Editors</option>
          ${n}
        </select>
        <span id="model-usage-time-selector"></span>
        <span id="model-usage-status" style="font-size: 12px; color: var(--text-muted);">${d(e?"\u23F3 Loading sessions\u2026":"")}</span>
      </div>
    </div>
    <div id="model-usage-results"></div>
  `}function Ye(t=!1){let e=document.getElementById("model-usage-time-selector");if(!e)return;e.replaceChildren();let o=xi[Qt]??"allTime",{select:n}=ce({id:"model-usage-time-select",selected:o,periods:vi,extraOptions:[{value:"yesterday",label:"Yesterday"}],label:"",onChange:s=>{let i=ki[s];i&&(Qt=i,ne())}});n.disabled=t,e.append(n)}function Si(t,e){let o=d(`${t.sessionCount} session(s)`),n=d(`${t.inputTokens.toLocaleString()} tokens`),s=d(`${t.outputTokens.toLocaleString()} tokens`),i=d(`${t.cacheCreationTokens.toLocaleString()} tokens`),r=d(`${t.cacheCreation1hTokens.toLocaleString()} tokens`),a=d(`${t.cachedReadTokens.toLocaleString()} tokens`);return`
    <tr>
      <td>${d(t.model)}</td>
      <td title="${o}">${t.sessionCount.toLocaleString()}</td>
      <td title="${n}">${S(t.inputTokens)}</td>
      <td title="${s}">${S(t.outputTokens)}</td>
      <td title="${i}">${S(t.cacheCreationTokens)}</td>
      ${e?`<td title="${r}">${S(t.cacheCreation1hTokens)}</td>`:""}
      <td title="${a}">${S(t.cachedReadTokens)}</td>
      <td>$${t.estimatedCost.toFixed(2)}</td>
    </tr>`}function kn(t,e){let o=t-e;return o<=0?"":`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u2139\uFE0F ${o} session(s) have no per-model data</div>
      <div>
        This is often expected, not a bug. Common causes: chat-only sessions stored in a
        database with no model/token columns (e.g. Copilot CLI's session-store.db), older
        or truncated session logs written before an editor started recording per-model
        attribution, or sessions that never made a model-backed request (e.g. empty/aborted
        chats).
      </div>
    </div>`}var Ci={all:"All Time",lastMonth:"Last Month",month:"Current Month",week:"This Week",today:"Today",yesterday:"Yesterday"};function wi(t,e,o,n,s,i=!0,r="all"){let a=t==="all"?"All Editors":t,l=Ci[r]||"All Time",p=r==="all"?a:`${a} \u2014 ${l}`;if(n.length===0)return`
      <div class="section" style="margin-top: 0;">
        <div style="padding: 32px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
          <div style="font-size: 14px;">No per-model usage data found for ${d(p)}.</div>
          <div style="font-size: 12px; margin-top: 8px;">${e} session file(s) matched, ${o} had model attribution data.</div>
        </div>
      </div>
      ${kn(e,o)}`;let g=n.map(c=>Si(c,i)).join("");return`
    <div class="section" style="margin-top: 0;">
      <div class="section-title">\u{1F4CA} Results \u2014 ${d(p)}</div>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Session Files</div>
          <div class="summary-value">${e}</div>
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
          <tbody>${g}</tbody>
        </table>
      </div>
      ${kn(e,o)}
    </div>`}function Ln(t){let e=[],o=new Map;for(let n of t||[]){let s=String(n.dir||"").replace(/\\/g,"/"),i=s.match(/^(.*\/\.copilot\/jb)\/[^/]+\/?$/);if(i){let r=i[1],a=o.get(r);if(a)a.count+=n.count;else{let l=s.length-r.length,p=n.dir.slice(0,n.dir.length-l);o.set(r,{dir:p,count:n.count,editorName:n.editorName||"JetBrains"})}}else e.push(n)}for(let n of o.values())e.push(n);return e}function Ei(){let t=window;return t.process?.env?.HOME||t.process?.env?.USERPROFILE||""}function Mi(t,e){let o=t.dir;e&&o.startsWith(e)&&(o=o.replace(e,"~"));let n=t.editorName||"Unknown",s=document.createElement("tr"),i=document.createElement("td");i.setAttribute("title",t.dir),i.textContent=o,s.appendChild(i);let r=document.createElement("td"),a=document.createElement("span");a.className=oe(n),a.textContent=`${I(n)} ${n}`,r.appendChild(a),s.appendChild(r);let l=document.createElement("td");l.textContent=String(t.count),s.appendChild(l);let p=document.createElement("td"),g=document.createElement("a");if(g.href="#",g.className="reveal-link",g.setAttribute("data-path",encodeURIComponent(t.dir)),g.textContent="Open directory",p.appendChild(g),n==="Unknown"){let c=document.createElement("a");c.href="#",c.className="report-editor-link",c.setAttribute("data-path",encodeURIComponent(t.dir)),c.setAttribute("title","Report this unknown path so we can add editor support"),c.textContent="\u{1F4E2} Report",p.appendChild(document.createTextNode(" ")),p.appendChild(c)}return s.appendChild(p),s}function Un(t){let e=[...t].sort((v,x)=>x.count-v.count),o=e.reduce((v,x)=>v+x.count,0),n=Ei(),s=document.createElement("div");s.className="session-folders-table";let i=document.createElement("h4");i.textContent="Main Session Folders (by editor root):",s.appendChild(i);let r=document.createElement("div");r.className="table-container",s.appendChild(r);let a=document.createElement("table");a.className="session-table",r.appendChild(a);let l=document.createElement("thead");a.appendChild(l);let p=document.createElement("tr");l.appendChild(p);for(let v of["Folder","Editor","# of Sessions","Open"]){let x=document.createElement("th");x.textContent=v,p.appendChild(x)}let g=document.createElement("tbody");a.appendChild(g);for(let v of e)g.appendChild(Mi(v,n));let c=document.createElement("tr");c.style.borderTop="2px solid #5a5a5a",c.style.fontWeight="600",c.style.background="rgba(255, 255, 255, 0.05)";let u=document.createElement("td");u.setAttribute("colspan","2"),u.style.textAlign="right",u.style.paddingRight="16px",u.textContent="Total:",c.appendChild(u);let b=document.createElement("td");return b.textContent=String(o),c.appendChild(b),c.appendChild(document.createElement("td")),g.appendChild(c),s}function Pn(){document.querySelectorAll(".open-storage-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let o=decodeURIComponent(t.getAttribute("data-path")||"");o&&m.postMessage({command:"revealPath",path:o})})})}function Je(){document.getElementById("btn-authenticate-github")?.addEventListener("click",()=>{m.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-sign-out-github")?.addEventListener("click",()=>{m.postMessage({command:"signOutGitHub"})})}function Ze(t){let e=document.querySelector(`.subtab[data-subtab="${t}"]`),o=document.getElementById(`subtab-${t}`);if(e&&o){let n=e.closest(".subtab-bar");return n&&n.querySelectorAll(".subtab").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(s=>s.classList.remove("active")),e.classList.add("active"),o.classList.add("active"),!0}return!1}function te(t){let e=document.querySelector(`.tab[data-tab="${t}"]`),o=document.getElementById(`tab-${t}`);return e&&o?(document.querySelectorAll(".tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(n=>n.classList.remove("active")),e.classList.add("active"),o.classList.add("active"),m.postMessage({command:"viewTabOpened",view:"diagnostics",tab:t}),!0):!1}var On={diagnostics:["report","sessions","cache","path-analyzer"],research:["model-usage","tool-analysis","skill-usage","otel-delta","ttft"],settings:["display","backend","github","debug"]};function Ai(t){for(let[e,o]of Object.entries(On))if(o.includes(t))return e;return"diagnostics"}function Di(t){return On[t]?.find(e=>document.querySelector(`.tab[data-tab="${e}"]`))}function Bn(t){let e=document.querySelector(`.group-tab[data-group="${t}"]`),o=document.querySelector(`.leaf-tabs[data-group="${t}"]`);return!e||!o?!1:(document.querySelectorAll(".group-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".leaf-tabs").forEach(n=>{n.style.display="none"}),e.classList.add("active"),o.style.display="flex",!0)}function $i(){document.querySelectorAll(".group-tab").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-group");if(!e||!Bn(e))return;if(!document.querySelector(`.leaf-tabs[data-group="${e}"] .tab.active`)){let n=Di(e);n&&te(n)&&E.patch({activeTab:n})}})})}function Nn(){document.querySelectorAll(".sortable").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-sort");e&&(it===e?rt=rt==="desc"?"asc":"desc":(it=e,rt="desc"),ct())})})}function Fn(){document.querySelectorAll(".editor-panel").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-editor");dt=e===""?null:e,ct()})})}function Hn(){document.querySelectorAll(".context-ref-filter").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-ref-type");at===e?at=null:at=e,ct()})})}function zn(){let t=document.getElementById("show-only-unattributed");t&&t.addEventListener("change",()=>{He=t.checked,ct()})}function jn(){let t=document.getElementById("hide-empty-sessions");t&&t.addEventListener("change",()=>{Et=t.checked,ct()})}function Xe(){document.getElementById("btn-configure-backend")?.addEventListener("click",()=>{m.postMessage({command:"configureBackend"})}),document.getElementById("btn-configure-backend-team")?.addEventListener("click",()=>{E.patch({activeTab:"backend",activeSubtab:"backend-teamserver"}),m.postMessage({command:"configureTeamServer"})}),document.getElementById("btn-team-server-auth-warning")?.addEventListener("click",()=>{m.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-open-settings")?.addEventListener("click",()=>{m.postMessage({command:"openSettings"})}),document.getElementById("btn-open-display-settings")?.addEventListener("click",()=>{m.postMessage({command:"openDisplaySettings"})})}function Ri(){document.getElementById("select-show-tokens")?.addEventListener("change",t=>{let e=t.target.value;m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showTokens",value:e})}),document.getElementById("select-show-cost")?.addEventListener("change",t=>{let e=t.target.value;m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showCost",value:e})}),document.getElementById("input-monthly-budget")?.addEventListener("change",t=>{let e=t.target,o=parseFloat(e.value),n=isNaN(o)?0:Math.min(99999,Math.max(0,Math.round(o*100)/100));e.value=n.toString(),m.postMessage({command:"updateDisplaySetting",key:"display.statusBar.monthlyBudget",value:n})})}function Qe(){document.querySelectorAll(".subtab").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-subtab");if(!e)return;let o=t.closest(".subtab-bar");o&&o.querySelectorAll(".subtab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(n=>n.classList.remove("active")),t.classList.add("active"),document.getElementById(`subtab-${e}`)?.classList.add("active"),E.patch({activeSubtab:e})})})}function ct(){let t=document.getElementById("session-table-container");t&&(h(t,$n(q,V)),V||(Nn(),Fn(),Hn(),jn(),zn(),Gn()))}function Ii(){document.querySelectorAll(".tool-analysis-table").forEach(t=>{let e=t.getAttribute("data-rows");if(!e)return;let o=JSON.parse(decodeURIComponent(e)),n=t.getAttribute("data-baseline"),s=n?parseFloat(n):NaN,i=t.querySelector("tbody");i&&h(i,eo(o,s));let r=t.querySelector("thead");r&&h(r,oo())}),to()}function to(){document.querySelectorAll(".tool-sortable").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-sort");e&&(Xt===e?lt=lt==="desc"?"asc":"desc":(Xt=e,lt=e==="tool"?"asc":"desc"),Ii())})}),document.getElementById("btn-open-tool-families-settings")?.addEventListener("click",()=>{m.postMessage({command:"openToolFamiliesSettings"})})}function Gn(){document.querySelectorAll(".session-file-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let o=decodeURIComponent(t.getAttribute("data-file")||"");m.postMessage({command:"openSessionFile",file:o})})}),document.querySelectorAll(".view-formatted-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let o=decodeURIComponent(t.getAttribute("data-file")||"");m.postMessage({command:"openFormattedJsonlFile",file:o})})}),document.querySelectorAll(".reveal-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let o=decodeURIComponent(t.getAttribute("data-path")||"");m.postMessage({command:"revealPath",path:o})})}),document.querySelectorAll(".report-editor-link").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();let o=decodeURIComponent(t.getAttribute("data-path")||"");m.postMessage({command:"reportNewEditorPath",path:o})})})}function Be(){let t=document.getElementById("tab-cache");if(t){let e=t.querySelectorAll(".summary-card");if(e.length>=4){let o=e[0]?.querySelector(".summary-value");o&&(o.textContent="0");let n=e[1]?.querySelector(".summary-value");n&&(n.textContent="0 MB");let s=e[2]?.querySelector(".summary-value");s&&(s.textContent="Never");let i=e[3]?.querySelector(".summary-value");i&&(i.textContent="N/A")}}}function _i(){document.getElementById("btn-browse-folder")?.addEventListener("click",()=>{m.postMessage({command:"pickFolder"})}),document.getElementById("btn-analyze-folder")?.addEventListener("click",()=>{let t=document.getElementById("folder-path-input"),e=document.getElementById("tool-type-select"),o=t?.value.trim()??"";if(!o){t&&(t.style.borderColor="#d97706",t.focus());return}t&&(t.style.borderColor="");let n=document.getElementById("btn-analyze-folder");n&&(n.disabled=!0,h(n,"<span>\u23F3</span><span>Analyzing\u2026</span>"));let s=document.getElementById("folder-analysis-results");s&&h(s,`
          <div class="analyzer-loading">
            <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
            <span>Scanning files\u2026</span>
          </div>`),m.postMessage({command:"analyzeFolder",folderPath:o,toolType:e?.value??"auto"})})}function ne(){let t=document.getElementById("model-usage-editor-select");if(!t||t.disabled)return;let e=t.value||"all",o=Qt||"all",n=document.getElementById("model-usage-results");n&&h(n,`
        <div class="analyzer-loading">
          <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
          <span>Aggregating model usage\u2026</span>
        </div>`),m.postMessage({command:"analyzeModelUsage",editor:e,timeRange:o})}function Li(){document.getElementById("model-usage-editor-select")?.addEventListener("change",()=>{ne()})}function Ui(t){let e=document.getElementById("model-usage-results");if(e){if(typeof t.timeRange=="string"&&t.timeRange&&(Qt=t.timeRange,Ye(!1)),t.stillLoading){h(e,`
      <div class="info-box" style="margin-top: 12px;">
        <div class="info-box-title">\u23F3 Still loading session files</div>
        <div>Session files are still being scanned in the background. Wait a moment (watch the "Session Files" tab count) and try again.</div>
      </div>`);return}h(e,wi(String(t.editor||"all"),Number(t.fileCount||0),Number(t.filesWithUsage||0),t.rows||[],Number(t.totalCost||0),t.supportsCache1h!==!1,String(t.timeRange||"all")))}}function Pi(){document.querySelectorAll(".tab").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-tab");if(e&&te(e)){if(E.patch({activeTab:e}),e==="model-usage"){let o=document.getElementById("model-usage-results");o&&!o.innerHTML.trim()&&ne()}else if(e==="ttft"){let o=document.getElementById("ttft-results");o&&!o.innerHTML.trim()&&ee()}}})})}function Oi(t){t.style.background="#d97706",h(t,"<span>\u23F3</span><span>Clearing...</span>"),t instanceof HTMLButtonElement&&(t.disabled=!0),Be(),m.postMessage({command:"clearCache"})}function Bi(t){let e=t.getAttribute("data-key"),n=t.closest("tr")?.querySelector(".debug-counter-input");if(e&&n){let s=parseInt(n.value,10);isNaN(s)||m.postMessage({command:"setDebugCounter",key:e,value:s})}}function Ni(t){let e=t.getAttribute("data-key"),n=t.closest("tr")?.querySelector(".debug-flag-input");e&&n&&m.postMessage({command:"setDebugFlag",key:e,value:n.checked})}function Fi(t){let e=t.target;e&&((e.id==="btn-clear-cache"||e.id==="btn-clear-cache-tab")&&Oi(e),(e.id==="btn-reset-insights"||e.id==="btn-reset-insights-tab")&&m.postMessage({command:"resetInsightsState"}),e.id==="btn-reset-debug-counters"&&m.postMessage({command:"resetDebugCounters"}),e.id==="btn-reset-discovered-editors"&&m.postMessage({command:"resetDiscoveredEditors"}),e.classList.contains("debug-counter-set")&&Bi(e),e.classList.contains("debug-flag-set")&&Ni(e))}function Hi(){document.getElementById("btn-refresh")?.addEventListener("click",()=>m.postMessage({command:"refresh"})),document.getElementById("btn-chart")?.addEventListener("click",()=>m.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>m.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-details")?.addEventListener("click",()=>m.postMessage({command:"showDetails"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>m.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>m.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>m.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>m.postMessage({command:"showEnvironmental"})),document.getElementById("btn-efficiency")?.addEventListener("click",()=>m.postMessage({command:"showEfficiency"})),fo(m)}function zi(){let t=document.getElementById("share-card-period-selector");if(!t)return;t.replaceChildren();let{select:e}=ce({id:"share-card-period-select",selected:st,periods:zs,label:"",onChange:o=>{st=o,E.patch({shareCardPeriod:st}),Wn()}});t.append(e)}function xn(){let t=Rn(q,st),e=Dt(t),o=Object.keys(e).sort((r,a)=>e[a].count-e[r].count),n=t.length,s=t.reduce((r,a)=>r+Number(a.interactions||0),0),i=t.reduce((r,a)=>r+Number(a.tokens||0),0);return di(o,e,n,s,i,st)}function qn(){zi(),document.getElementById("btn-copy-share-summary")?.addEventListener("click",()=>{m.postMessage({command:"copyText",text:xn()})});let t=[{id:"btn-share-card-linkedin",platform:"linkedin"},{id:"btn-share-card-bluesky",platform:"bluesky"},{id:"btn-share-card-mastodon",platform:"mastodon"}];for(let{id:e,platform:o}of t)document.getElementById(e)?.addEventListener("click",()=>{m.postMessage({command:"shareCardToSocial",platform:o,text:xn()})})}function Wn(){se("share",In(q),qn)}function ji(){document.getElementById("btn-copy")?.addEventListener("click",()=>{m.postMessage({command:"copyReport"})}),qn(),document.getElementById("btn-issue")?.addEventListener("click",()=>{m.postMessage({command:"openIssue"})}),document.getElementById("btn-clear-cache")?.addEventListener("click",()=>{let t=document.getElementById("btn-clear-cache");t&&(t.style.background="#d97706",h(t,"<span>\u23F3</span><span>Clearing...</span>"),t.disabled=!0),Be(),m.postMessage({command:"clearCache"})}),document.getElementById("btn-clear-cache-tab")?.addEventListener("click",()=>{let t=document.getElementById("btn-clear-cache-tab");t&&(t.style.background="#d97706",h(t,"<span>\u23F3</span><span>Clearing...</span>"),t.disabled=!0),Be(),m.postMessage({command:"clearCache"})}),document.addEventListener("click",Fi),Hi()}function Gi(t){if(!t.report)return;let e=document.getElementById("tab-report");if(!e)return;let o=Dn(t.report),n=e.querySelector(".report-content");n&&(n.textContent=o)}function Vn(t){if(!t.backendStorageInfo){console.warn("diagnosticDataLoaded received but backendStorageInfo is missing or undefined");return}W=t.backendStorageInfo,t.githubAuth!==void 0&&(N=t.githubAuth);let e=document.getElementById("tab-backend");if(!e)return;let n=e.querySelector(".subtab.active")?.getAttribute("data-subtab")??E.restore().activeSubtab;h(e,Ke(W,N)),Xe(),Qe(),n&&(Ze(n),E.patch({activeSubtab:n}))}function qi(t){if(!t.sessionFolders||t.sessionFolders.length===0)return;let e=document.getElementById("tab-report");if(!e)return;let o=Ln(t.sessionFolders),n=Un(o),s=e.querySelector(".session-folders-table");if(s)s.replaceWith(n);else{let i=e.querySelector(".report-content");i?i.insertAdjacentElement("afterend",n):e.appendChild(n)}Pn()}function Wi(t){if(!t.candidatePaths||t.candidatePaths.length===0)return;let e=document.getElementById("tab-report");if(!e)return;e.querySelector(".candidate-paths-table")?.remove();let o=qs(t.candidatePaths),n=e.querySelector(".session-folders-table");if(n)n.insertAdjacentElement("afterend",o);else{let s=e.querySelector(".report-content");s?s.insertAdjacentElement("afterend",o):e.appendChild(o)}}function se(t,e,o){let n=document.getElementById(`tab-${t}`);if(!n)return;let s=n.classList.contains("active"),i=document.createElement("div");h(i,e);let r=i.firstElementChild;r&&(s&&r.classList.add("active"),n.replaceWith(r),o?.())}function Vi(t){if(t.githubAuth===void 0)return;let e=document.getElementById("tab-github");e&&(h(e,Ve(t.githubAuth)),Je())}function Ki(t){if(t.toolFamilies&&(Oe=t.toolFamilies),t.toolCallStats===void 0)return;let e=Xn(t.toolCallStats,Oe);se("tool-analysis",e,to)}function Kn(){se("skill-usage",Qn(ze,je,Ge,qe),Yn)}function Yn(){document.querySelectorAll(".skill-usage-chip").forEach(t=>{t.addEventListener("click",()=>{let e=t.getAttribute("data-editor");e&&(qe=e,E.patch({skillUsageEditorFilter:e}),Kn())})})}function Yi(t){t.skillCallStats!==void 0&&(ze=t.skillCallStats),t.skillCallsByEditor!==void 0&&(je=t.skillCallsByEditor),t.skillDescriptions!==void 0&&(Ge=t.skillDescriptions),t.skillCallStats!==void 0&&Kn()}function Jn(){se("otel-delta",es(Fe,Jt),Zn)}function Zn(){let t=document.getElementById("otel-delta-period");t&&t.addEventListener("change",()=>{Jt=t.value,E.patch({otelDeltaPeriod:Jt}),Jn()})}function Ji(t){t.otelComparison!==void 0&&(Fe=t.otelComparison,Jn())}function Zi(t){Gi(t),Vn(t),qi(t),Wi(t),Vi(t),Ki(t),Yi(t),Ji(t)}function Xi(t){N=t.githubAuth;let e=document.getElementById("tab-github");e&&(h(e,Ve(N)),Je());let o=document.getElementById("tab-backend");if(o&&W){let s=o.querySelector(".subtab.active")?.getAttribute("data-subtab");h(o,Ke(W,N)),Xe(),Qe(),s&&Ze(s)}}function Qi(t){console.error("Error loading diagnostic data:",t.error);let e=document.getElementById("root");if(e){let o=document.createElement("div");o.style.cssText="color: #ff6b6b; padding: 20px; text-align: center;",h(o,`
<h3><span class="codicon codicon-warning"></span> Error Loading Diagnostic Data</h3>
<p>${d(t.error||"Unknown error")}</p>
`),e.insertBefore(o,e.firstChild)}}function Tn(t){return!t||typeof t!="object"?{}:Object.fromEntries(Object.entries(t).map(([e,o])=>[e,Number(o??0)||0]))}function w(t){return Number(t??0)||0}function nt(t){return t==null?void 0:String(t)}function Sn(t){return t==null?null:String(t)}function tr(t){return{file:w(t.file),symbol:w(t.symbol),selection:w(t.selection),implicitSelection:w(t.implicitSelection),codebase:w(t.codebase),workspace:w(t.workspace),terminal:w(t.terminal),vscode:w(t.vscode),terminalLastCommand:w(t.terminalLastCommand),terminalSelection:w(t.terminalSelection),clipboard:w(t.clipboard),changes:w(t.changes),outputPanel:w(t.outputPanel),problemsPanel:w(t.problemsPanel),pullRequest:w(t.pullRequest),byKind:Tn(t.byKind),copilotInstructions:w(t.copilotInstructions),agentsMd:w(t.agentsMd),byPath:Tn(t.byPath)}}function er(t){if(Array.isArray(t.childInfo))return t.childInfo.filter(e=>!!e&&typeof e=="object").map(e=>({uuid:String(e.uuid??""),name:String(e.name??""),sessionFile:nt(e.sessionFile)}))}function or(t){if(!t.parentInfo||typeof t.parentInfo!="object")return;let e=t.parentInfo;return{uuid:String(e.uuid??""),name:String(e.name??""),sessionFile:nt(e.sessionFile)}}function nr(t){let e=t??{},o=e.contextReferences??{};return{file:String(e.file??e.sessionFile??""),editorSource:String(e.editorSource??""),editorRoot:nt(e.editorRoot),editorName:nt(e.editorName),title:nt(e.title),repository:nt(e.repository),size:w(e.size),modified:String(e.modified??""),tokens:w(e.tokens),interactions:w(e.interactions),firstInteraction:Sn(e.firstInteraction),lastInteraction:Sn(e.lastInteraction),contextReferences:tr(o),parentInfo:or(e),childInfo:er(e),totalChildCount:e.totalChildCount===null||e.totalChildCount===void 0?void 0:Number(e.totalChildCount),subAgentCalls:e.subAgentCalls===null||e.subAgentCalls===void 0?void 0:Number(e.subAgentCalls)}}function sr(t){return Array.isArray(t)?t.map(nr):[]}function ir(t){let e=Number(t.processed||0),o=Number(t.total||0),n=o>0?`Analyzing files\u2026 (${e} / ${o})`:"Analyzing files\u2026",s=document.getElementById("session-loading-subtext");s&&(s.textContent=n);let i=document.getElementById("share-loading-subtext");i&&(i.textContent=n);let r=document.getElementById("report-loading-subtext");r&&(r.textContent=n);let a=document.getElementById("ttft-loading-status");a&&(a.textContent=n);let l=document.getElementById("model-usage-status");l&&(l.textContent=o>0?`\u23F3 Loading sessions\u2026 (${e}/${o})`:"\u23F3 Loading sessions\u2026")}function rr(t){q=sr(t.detailedSessionFiles),V=!1;let e=document.querySelector('.tab[data-tab="sessions"]');e&&(e.textContent=`\u{1F4C1} Session Files (${q.length})`);let o=document.getElementById("model-usage-editor-select");if(o){let i=Dt(q),r=Object.keys(i).sort().map(a=>`<option value="${d(a)}">${d(I(a))} ${d(a)} (${i[a].count})</option>`).join("");h(o,`<option value="all">\u{1F310} All Editors</option>${r}`),o.disabled=!1}Ye(!1);let n=document.getElementById("model-usage-status");n&&(n.textContent=""),ne();let s=document.getElementById("ttft-results");s&&s.innerHTML.trim()&&ee(),ct(),Wn()}function ar(){let t=document.getElementById("btn-clear-cache"),e=document.getElementById("btn-clear-cache-tab");t&&(t.style.background="#2d6a4f",h(t,"<span>\u2705</span><span>Cache Cleared</span>"),t.disabled=!1),e&&(e.style.background="#2d6a4f",h(e,"<span>\u2705</span><span>Cache Cleared</span>"),e.disabled=!1),setTimeout(()=>{t&&(t.style.background="",h(t,"<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>")),e&&(e.style.background="",h(e,"<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>"))},2e3)}function lr(t,e){if(e.length<4)return;let o=e[0]?.querySelector(".summary-value");o&&(o.textContent=String(t.size));let n=e[1]?.querySelector(".summary-value");n&&(n.textContent=`${t.sizeInMB.toFixed(2)} MB`);let s=e[2]?.querySelector(".summary-value");s&&(s.textContent=new Date(t.lastUpdated).toLocaleString());let i=e[3]?.querySelector(".summary-value");i&&(i.textContent="0 seconds ago")}function dr(t){if(!t.cacheInfo)return;let e=document.getElementById("tab-cache");e&&lr(t.cacheInfo,e.querySelectorAll(".summary-card"))}function cr(t){let e=document.getElementById("folder-path-input");e&&t.folderPath&&(e.value=t.folderPath,e.style.borderColor="")}function ur(t){let e=document.getElementById("btn-analyze-folder");e&&(e.disabled=!1,h(e,"<span>\u{1F50D}</span><span>Analyze</span>"));let o=document.getElementById("folder-analysis-results");o&&(t.error?h(o,`
        <div class="info-box" style="border-color: #d97706; background: rgba(217,119,6,0.08); margin-top: 12px;">
          <div class="info-box-title">\u26A0\uFE0F Analysis Error</div>
          <div>${d(t.error)}</div>
        </div>`):h(o,yi(t.files||[],t.totalScanned||0,t.parseErrors||0,t.truncated||!1,d(String(t.folderPath||"")))))}function pr(){$t(t=>{t.command==="diagnosticDataLoaded"?Zi(t):t.command==="backendStorageInfoLoaded"?Vn(t):t.command==="githubAuthUpdated"?Xi(t):t.command==="diagnosticDataError"?Qi(t):t.command==="sessionFilesLoaded"&&t.detailedSessionFiles?rr(t):t.command==="sessionFilesLoadProgress"?ir(t):t.command==="cacheCleared"?ar():t.command==="cacheRefreshed"?dr(t):t.command==="folderPicked"?cr(t):t.command==="folderAnalysisResult"?ur(t):t.command==="modelUsageResult"?Ui(t):t.command==="ttftResult"&&Pr(t)})}function gr(t){return`
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
<div class="summary-value">${t.cacheInfo?.size||0}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4BE} Cache Size</div>
<div class="summary-value">${t.cacheInfo?.sizeInMB?t.cacheInfo.sizeInMB.toFixed(2)+" MB":"N/A"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F552} Last Updated</div>
<div class="summary-value" style="font-size: 14px;">${t.cacheInfo?.lastUpdated?At(t.cacheInfo.lastUpdated):"Never"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u23F1\uFE0F Cache Age</div>
<div class="summary-value" style="font-size: 14px;">${t.cacheInfo?.lastUpdated?Rt(t.cacheInfo.lastUpdated):"N/A"}</div>
</div>
</div>
<div class="cache-location">
<h4>Storage Location</h4>
<div class="location-box">
<code>${d(t.cacheInfo?.location||"VS Code Global State")}</code>
${t.cacheInfo?.storagePath?` <a href="#" class="open-storage-link" data-path="${encodeURIComponent(t.cacheInfo.storagePath)}">Open storage location</a>`:""}
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
</div>`}function $(t,e){return t===e?"selected":""}function mr(t){return`<div class="backend-card">
<h4>\u{1F4CA} API Quota Information</h4>
${t.quotaEntitlements?`<p>
${t.quotaEntitlements.premium_interactions?`<strong>Premium Interactions:</strong> $${t.quotaEntitlements.premium_interactions.toFixed(2)}/month<br/>`:""}${t.quotaEntitlements.completions?`<strong>Completions:</strong> $${t.quotaEntitlements.completions.toFixed(2)}/month<br/>`:""}
    </p>`:'<p class="hint">No quota information available from the API yet. Sign out and back in to refresh.</p>'}
</div>`}function fr(){return`<div class="backend-card">
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
</div>`}function br(t){let e=t.displaySettings?.showTokens??"both",o=t.displaySettings?.showCost??"none",n=Math.round((t.displaySettings?.monthlyBudget??0)*100)/100;return`
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
    <option value="none" ${$(e,"none")}>None</option>
    <option value="today" ${$(e,"today")}>Today only</option>
    <option value="last30days" ${$(e,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${$(e,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${$(e,"both")}>Today + last 30 days (default)</option>
    <option value="todayAndCurrentMonth" ${$(e,"todayAndCurrentMonth")}>Today + current calendar month</option>
  </select>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F4B0} Estimated cost (USD):</label>
  <select id="select-show-cost" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${$(o,"none")}>None (hidden)</option>
    <option value="today" ${$(o,"today")}>Today only</option>
    <option value="last30days" ${$(o,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${$(o,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${$(o,"both")}>Today + last 30 days</option>
    <option value="todayAndCurrentMonth" ${$(o,"todayAndCurrentMonth")}>Today + current calendar month</option>
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
${t.quotaEntitlements&&t.quotaEntitlements.premium_interactions?`<p class="hint" style="color: #90ee90;"><strong>\u2139\uFE0F API-driven budget:</strong> Your premium_interactions quota entitlement is <strong>$${t.quotaEntitlements.premium_interactions.toFixed(2)}</strong>/month. If the budget above is 0 or empty, this API value will be used as your effective budget.</p>`:""}
</div>
${mr(t)}
${fr()}
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
</div>`}function Kt(t){return Xt!==t?' <span class="sort-hint">\u2195</span>':lt==="desc"?" \u25BC":" \u25B2"}function hr(t){let e=t.reduce((n,s)=>n+s.calls,0),o=t.reduce((n,s)=>n+s.totalTokens,0);return e>0?o/e:NaN}function yr(t){return[...t].sort((e,o)=>{let n,s;switch(Xt){case"tool":n=e.tool.toLowerCase(),s=o.tool.toLowerCase();break;case"calls":n=e.calls,s=o.calls;break;case"total":n=e.totalTokens,s=o.totalTokens;break;default:n=e.calls>0?e.totalTokens/e.calls:0,s=o.calls>0?o.totalTokens/o.calls:0;break}return n<s?lt==="desc"?1:-1:n>s?lt==="desc"?-1:1:0})}function vr(t,e){let o=t.calls>0?Math.round(t.totalTokens/t.calls):0,n='<td class="tool-ratio">\u2014</td>';if(!t.isBuiltIn&&!isNaN(e)&&e>0&&t.calls>0){let i=t.totalTokens/t.calls/e,r=Number(Math.round(i*100))||0;n=`<td class="tool-ratio ${i<.85?"ratio-better":i>1.15?"ratio-worse":"ratio-neutral"}" title="${r}% of built-in average">${r}%</td>`}else t.isBuiltIn&&(n='<td class="tool-ratio tool-builtin-label">baseline</td>');let s=t.isBuiltIn?' <span class="tool-type-badge built-in">built-in</span>':' <span class="tool-type-badge alternative">alt</span>';return`<tr><td>${d(t.tool)}${s}</td><td>${d(String(t.calls))}</td><td>${S(t.totalTokens)}</td><td>${S(o)}</td>${n}</tr>`}function eo(t,e=NaN){return yr(t).map(o=>vr(o,e)).join("")}function oo(){return`<tr>
<th class="tool-sortable" data-sort="tool">Tool${Kt("tool")}</th>
<th class="tool-sortable" data-sort="calls">Calls${Kt("calls")}</th>
<th class="tool-sortable" data-sort="total">Total Output Tokens${Kt("total")}</th>
<th class="tool-sortable" data-sort="avg">Avg Tokens / Call${Kt("avg")}</th>
<th>vs Built-in</th>
</tr>`}function kr(t,e,o,n){let s=(u,b)=>u.filter(v=>e[v]!==void 0&&(o[v]||0)>0&&!n.has(v)).map(v=>(n.add(v),{tool:v,totalTokens:e[v],calls:o[v]||0,isBuiltIn:b})),i=s(t.builtIn,!0),r=s(t.alternatives,!1),a=[...i,...r];if(a.length===0)return{html:"",rows:[]};let l=hr(i),p=encodeURIComponent(JSON.stringify(a)),g=t.description?` <span class="hint">${d(t.description)}</span>`:"";return{html:`
<div class="tool-family-section">
<h4 class="tool-family-heading">${d(t.name)}${g}</h4>
<table class="session-table tool-analysis-table" data-rows="${p}" data-baseline="${isNaN(l)?"":String(l)}">
<thead>${oo()}</thead>
<tbody>${eo(a,l)}</tbody>
</table>
</div>`,rows:a}}function Xn(t,e){if(!t||!t.outputTokensByTool||Object.keys(t.outputTokensByTool).length===0)return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Track how many tokens each tool produces as output over the last 30 days. Data is collected as you use the extension \u2014 no output token data has been recorded yet.</div>
</div>
</div>`;let o=t.outputTokensByTool,n=t.byTool,s=new Set,i="";if(e&&e.length>0)for(let a of e){let{html:l}=kr(a,o,n,s);i+=l}let r=Object.entries(o).filter(([a])=>!s.has(a)&&(n[a]||0)>0).map(([a,l])=>({tool:a,totalTokens:l,calls:n[a]||0,isBuiltIn:!1}));if(r.length>0){let a=encodeURIComponent(JSON.stringify(r));i+=`
<div class="tool-family-section">
<h4 class="tool-family-heading">Other Tools</h4>
<table class="session-table tool-analysis-table" data-rows="${a}" data-baseline="">
<thead>${oo()}</thead>
<tbody>${eo(r,NaN)}</tbody>
</table>
</div>`}return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Tokens produced by each tool's output over the last 30 days. Tools are grouped by family. <strong>vs Built-in</strong> shows how an alternative compares to the pooled baseline \u2014 green is more token-efficient. Click column headers to sort within each group. <button class="inline-link" id="btn-open-tool-families-settings">Configure tool families \u2197</button></div>
</div>
${i}
</div>`}function xr(t,e,o){let n=new Map;for(let a of Object.values(t??{}))for(let[l,p]of Object.entries(a))n.set(l,(n.get(l)??0)+p);let s=[...n.entries()].sort((a,l)=>l[1]-a[1]);if(s.length===0)return"";let i=`<button class="skill-usage-chip${o==="all"?" active":""}" data-editor="all">All <span class="skill-usage-chip-count">${S(e)}</span></button>`,r=s.map(([a,l])=>`<button class="skill-usage-chip${o===a?" active":""}" data-editor="${d(a)}">${d(a)} <span class="skill-usage-chip-count">${S(l)}</span></button>`).join("");return`<div class="skill-usage-filter-panel">${i}${r}</div>`}function Qn(t,e,o,n="all"){let s=t?.byName??{};if(Object.keys(s).length===0)return`<div id="tab-skill-usage" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F9E9} Skill Usage</div>
<div>Tracks how often each agent skill (e.g. a <code>/skill-name</code> invocation or another editor's <code>SKILL.md</code> workflow) was invoked over the last 30 days. No skill invocations have been recorded yet. Skill usage is currently detected for Claude Code, Claude Desktop, and Copilot CLI sessions \u2014 support for other editors depends on whether their session logs expose a distinguishable skill name.</div>
</div>
</div>`;let i=Object.values(s).reduce((c,u)=>c+u,0),r=xr(e,i,n),a=Object.keys(s).map(c=>({name:c,count:n==="all"?s[c]:e?.[c]?.[n]??0,description:o?.[c]??""})).filter(c=>c.count>0).sort((c,u)=>u.count-c.count),l=a.reduce((c,u)=>c+u.count,0),p=a.map(c=>`<tr><td>${d(c.name)}</td><td class="skill-usage-description">${c.description?d(c.description):'<span class="hint">\u2014</span>'}</td><td>${S(c.count)}</td></tr>`).join(""),g=n==="all"?"across all editors":`for ${d(n)}`;return`<div id="tab-skill-usage" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F9E9} Skill Usage</div>
<div>${S(l)} skill invocation(s) across ${a.length} skill(s) ${g} in the last 30 days. Currently detected for Claude Code / Claude Desktop / Copilot CLI sessions.</div>
</div>
${r}
<table class="session-table skill-usage-table">
<thead><tr><th>Skill</th><th>Description</th><th>Invocations</th></tr></thead>
<tbody>${p}</tbody>
</table>
</div>`}function Tr(t){return t===void 0?`<div class="info-box">
<div class="info-box-title">\u{1F4E1} Copilot CLI OpenTelemetry Detection Running</div>
<div>
Detecting Copilot CLI OpenTelemetry export data\u2026<br/><br/>
This check compares this extension's estimated token counts against exact counts from local OTel export files.
</div>
</div>`:t&&t.otelSessionsIndexed>0?"":`<div class="info-box">
<div class="info-box-title">\u{1F4E1} Copilot CLI OpenTelemetry Export Not Detected</div>
<div>
${t?.otelDirExists?`The export directory exists but no session data has been indexed from it yet (${Number(t.otelFileCount)} file(s) found).`:"No <code>~/.copilot/otel</code> directory was found \u2014 the export isn't enabled yet."} Enabling it lets this extension read <strong>exact</strong> token counts (input, output, cache) straight from Copilot CLI instead of estimating them from ratios.<br/><br/>
Set these three environment variables before starting a Copilot CLI session, then run a session and reopen this tab:
<pre style="margin-top:8px;">COPILOT_OTEL_ENABLED=true
COPILOT_OTEL_EXPORTER_TYPE=file
COPILOT_OTEL_FILE_EXPORTER_PATH=~/.copilot/otel/copilot-otel.jsonl</pre>
See <code>docs/COPILOT-CLI-OTEL-EXPORT.md</code> in the repo for full setup steps (Windows/PowerShell and Unix shells) and how to verify it's working.
</div>
</div>`}function ts(t){let e=Number(t)||0;if(e===0)return{text:"0",cssClass:""};let o=e>0?"+":"-",n=e>0?"otel-delta-positive":"otel-delta-negative";return{text:`${o}${S(Math.abs(e))}`,cssClass:n}}function Cn(t){return new Date(t.getFullYear(),t.getMonth(),t.getDate())}function Sr(t,e,o){if(e==="all")return!0;if(!t)return!1;let n=new Date(t);if(Number.isNaN(n.getTime()))return!1;let s=Cn(o),i=Cn(n);if(e==="today")return i.getTime()===s.getTime();if(e==="yesterday"){let r=new Date(s);return r.setDate(r.getDate()-1),i.getTime()===r.getTime()}if(e==="week"){let r=new Date(s);return r.setDate(r.getDate()-6),n>=r&&n<=o}return n.getFullYear()===o.getFullYear()&&n.getMonth()===o.getMonth()&&n<=o}function Cr(t,e){if(e==="all")return t;let o=new Date,n=t.sessions.filter(r=>Sr(r.lastActivity,e,o)),s=n.reduce((r,a)=>r+a.baselineTokens,0),i=n.reduce((r,a)=>r+a.otelTokens,0);return{...t,sessions:n,sessionsMatched:n.length,totalBaselineTokens:s,totalOtelTokens:i,deltaTokens:i-s}}var wn={all:"All Time",today:"Today",yesterday:"Yesterday",week:"This Week",month:"This Month"};function wr(t){return`<div class="otel-delta-period-row">
<label for="otel-delta-period">Show:</label>
<select id="otel-delta-period" class="otel-delta-period-select">${Object.keys(wn).map(o=>`<option value="${o}"${o===t?" selected":""}>${wn[o]}</option>`).join("")}</select>
</div>`}function Er(t){let e=ts(t.deltaTokens),o=Number(t.sessionsMatched)||0,n=Number(t.totalBaselineTokens)||0,s=Number(t.totalOtelTokens)||0,i=Number(t.deltaTokens)||0;return`<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">\u{1F4E1} Sessions With OTel Data</div>
<div class="summary-value">${o.toLocaleString()}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4CA} Previous Estimate (Total)</div>
<div class="summary-value" title="${n.toLocaleString()} tokens">${S(n)}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F3AF} OTel Exact (Total)</div>
<div class="summary-value" title="${s.toLocaleString()} tokens">${S(s)}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u0394 Delta</div>
<div class="summary-value ${e.cssClass}" title="${i.toLocaleString()} tokens">${e.text}</div>
</div>
</div>`}function Mr(t){return t.map(e=>{let o=ts(e.delta),n=d(String(e.sessionId??"").slice(0,8)),s=d((Array.isArray(e.models)?e.models:[]).map(a=>String(a)).join(", ")||"\u2014"),i=Number(e.baselineTokens)||0,r=Number(e.otelTokens)||0;return`<tr>
<td title="${d(String(e.sessionId??""))}"><code>${n}</code></td>
<td>${s}</td>
<td title="${i.toLocaleString()} tokens">${S(i)}</td>
<td title="${r.toLocaleString()} tokens">${S(r)}</td>
<td class="${o.cssClass}" title="${(Number(e.delta)||0).toLocaleString()} tokens">${o.text}</td>
</tr>`}).join("")}function es(t,e=Jt){let o=Tr(t);if(!t||t.sessionsMatched===0)return`<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4E1} OTel vs. Estimated Token Counts</div>
<div>Compares the token counts this extension estimates for Copilot CLI sessions against exact counts read from Copilot CLI's OpenTelemetry export, when available.</div>
</div>
${o}
</div>`;let n=Cr(t,e),s=n.sessions.length>0?`<table class="session-table">
<thead><tr><th>Session</th><th>Model(s)</th><th>Previous Estimate</th><th>OTel Exact</th><th>Delta</th></tr></thead>
<tbody>${Mr(n.sessions)}</tbody>
</table>`:'<div class="info-box">No Copilot CLI sessions with OTel data in this period. Try a wider range.</div>';return`<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4E1} OTel vs. Estimated Token Counts</div>
<div>
Compares the token counts this extension would normally estimate for each Copilot CLI session against the exact counts read from Copilot CLI's OpenTelemetry file export. A positive delta means OTel revealed usage the estimate missed entirely (e.g. chat-only sessions, which previously reported 0 tokens); near-zero deltas mean the estimate already had exact numbers from a session.shutdown event.<br/>
Checked ${(Number(t.sessionsChecked)||0).toLocaleString()} Copilot CLI session(s) found locally; ${(Number(t.otelSessionsIndexed)||0).toLocaleString()} session(s) are present in the OTel export.
</div>
</div>
${o}
${wr(e)}
${Er(n)}
${s}
</div>`}var Ne={day:"Day",week:"Week",month:"Month"},En={"14d":"Last 14 days","30d":"Last 30 days","90d":"Last 90 days","180d":"Last 6 months","365d":"Last year",all:"All time"};function no(t){return t>=10?`${t.toFixed(1)}s`:`${Math.round(t*1e3)}ms`}function Ar(t){return`<div class="otel-delta-period-row">
<label for="ttft-granularity">Bucket by:</label>
<select id="ttft-granularity" class="otel-delta-period-select">${Object.keys(Ne).map(o=>`<option value="${o}"${o===t?" selected":""}>${Ne[o]}</option>`).join("")}</select>
</div>`}function Dr(t){return`<div class="otel-delta-period-row">
<label for="ttft-scan-range">Scan session files from:</label>
<select id="ttft-scan-range" class="otel-delta-period-select">${Object.keys(En).map(o=>`<option value="${o}"${o===t?" selected":""}>${En[o]}</option>`).join("")}</select>
</div>`}var Ue=760,Pe=220,Yt=48,Mn=32,An=12,$r=28;function Rr(t,e){if(t.length===0||e.length===0)return"";let o=Ue-Yt-Mn,n=Pe-An-$r,s=e.flatMap(x=>x.data.filter(M=>M!==null)),r=((s.length>0?Math.max(...s):1)||1)*1.15,a=t.length>1?o/(t.length-1):0,l=x=>Yt+x*a,p=x=>An+n-x/r*n,g=[0,.25,.5,.75,1].map(x=>{let M=r*x,R=p(M);return`<line x1="${Yt}" y1="${R.toFixed(1)}" x2="${Ue-Mn}" y2="${R.toFixed(1)}" class="ttft-gridline" />
<text x="${Yt-6}" y="${(R+3).toFixed(1)}" class="ttft-axis-label" text-anchor="end">${d(no(M))}</text>`}).join(""),c=Math.max(1,Math.ceil(t.length/8)),u=t.map((x,M)=>{if(M%c!==0&&M!==t.length-1)return"";let R=M===t.length-1?"end":M===0?"start":"middle";return`<text x="${l(M).toFixed(1)}" y="${Pe-8}" class="ttft-axis-label" text-anchor="${R}">${d(x.label)}</text>`}).join(""),b=e.map((x,M)=>{let R=me(M),K="",ie=!1;x.data.forEach((ut,re)=>{if(ut===null){ie=!1;return}let so=l(re).toFixed(1),io=p(ut).toFixed(1);K+=ie?` L ${so} ${io}`:`${K?" ":""}M ${so} ${io}`,ie=!0});let os=x.data.map((ut,re)=>ut===null?"":`<circle cx="${l(re).toFixed(1)}" cy="${p(ut).toFixed(1)}" r="2.5" fill="${R.border}" />`).join("");return`<g class="ttft-series" data-model="${d(x.model)}"><path d="${K}" fill="none" stroke="${R.border}" stroke-width="2" />${os}</g>`}).join(""),v=e.map((x,M)=>{let R=me(M),K=d(ge(x.model));return`<span class="ttft-legend-item" data-model="${d(x.model)}" role="button" tabindex="0" aria-pressed="false" title="Click to hide/show ${K}"><span class="ttft-legend-swatch" style="background:${R.border}"></span>${K}</span>`}).join("");return`<div class="ttft-chart-wrap">
<svg viewBox="0 0 ${Ue} ${Pe}" class="ttft-chart" role="img" aria-label="Average time to first token per model over time">
${g}
${u}
${b}
</svg>
<div class="ttft-legend">${v}</div>
</div>`}function Ir(t){return t.slice().reverse().map(e=>`<tr>
<td>${d(e.label)}</td>
<td>${d(no(e.avgSeconds))}</td>
<td>${e.count.toLocaleString()}</td>
</tr>`).join("")}function _r(t,e,o,n,s){if(n===0)return`<div class="info-box">
<div class="info-box-title">\u{1F4ED} No TTFT data found</div>
<div>
Checked ${s.toLocaleString()} session file(s) in the selected range; none had a debug log
with a populated <code>attrs.ttft</code>. Try widening "Scan session files from" above, but also
check VS Code's <b>GitHub \u203A Copilot \u203A Chat \u203A Agent Debug Log \u203A File Logging: Enabled</b> setting
(Experimental) \u2014 it's off by default, and this data only exists for sessions that ran while it
was on (a window reload is needed after enabling it).
</div>
</div>`;let i=e.reduce((r,a)=>r+a.avgSeconds*a.count,0)/Math.max(1,n);return`<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">\u23F1\uFE0F Overall Avg TTFT</div>
<div class="summary-value">${d(no(i))}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F9E9} Models Shown</div>
<div class="summary-value">${o.length}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4CA} Samples</div>
<div class="summary-value">${n.toLocaleString()}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4C4} Session Files Checked</div>
<div class="summary-value">${s.toLocaleString()}</div>
</div>
</div>
${Rr(e,o)}
<div class="table-container" style="margin-top: 12px; max-height: 320px;">
<table class="session-table">
<thead><tr><th>${Ne[t]}</th><th>Avg TTFT</th><th>Samples</th></tr></thead>
<tbody>${Ir(e)}</tbody>
</table>
</div>`}function Lr(){return`<div id="tab-ttft" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u23F1\uFE0F Time to First Token</div>
<div>
How long a chat model takes to start streaming a response, averaged per model over time.
Read from VS Code Copilot Chat's own debug log (<code>attrs.ttft</code> on <code>llm_request</code>
events) \u2014 the same file this extension already reads for exact per-session billing. This only
exists for sessions that ran while VS Code's experimental <b>GitHub \u203A Copilot \u203A Chat \u203A Agent Debug
Log \u203A File Logging: Enabled</b> setting was on (off by default, requires a window reload after
enabling) \u2014 nothing in this extension's own settings. The unit isn't documented upstream, so
values are auto-detected as seconds or milliseconds by magnitude.
</div>
</div>
${Ar(Mt)}
${Dr(Zt)}
<div id="ttft-results"></div>
</div>`}function ee(){let t=document.getElementById("ttft-results");t&&h(t,`
        <div class="analyzer-loading">
          <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
          <span>Scanning debug logs for TTFT\u2026</span>
        </div>`),m.postMessage({command:"analyzeTtft",granularity:Mt,scanRange:Zt})}function Ur(){document.getElementById("ttft-granularity")?.addEventListener("change",o=>{Mt=o.target.value,E.patch({ttftGranularity:Mt}),ee()}),document.getElementById("ttft-scan-range")?.addEventListener("change",o=>{Zt=o.target.value,E.patch({ttftScanRange:Zt}),ee()});let t=document.getElementById("ttft-results"),e=o=>{let n=o.dataset.model;if(!n)return;let s=o.classList.toggle("ttft-hidden");o.setAttribute("aria-pressed",String(s)),document.querySelectorAll(".ttft-series").forEach(i=>{i.dataset.model===n&&i.classList.toggle("ttft-hidden",s)})};t?.addEventListener("click",o=>{let n=o.target?.closest(".ttft-legend-item");n&&e(n)}),t?.addEventListener("keydown",o=>{if(o.key!=="Enter"&&o.key!==" ")return;let n=o.target?.closest(".ttft-legend-item");n&&(o.preventDefault(),e(n))})}function Pr(t){let e=document.getElementById("ttft-results");if(e){if(t.stillLoading){h(e,`
        <div class="analyzer-loading">
          <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
          <span id="ttft-loading-status">Waiting for session files to finish loading\u2026</span>
        </div>`);return}h(e,_r(t.granularity||Mt,t.buckets||[],t.series||[],Number(t.sampleCount||0),Number(t.fileCount||0)))}}function Or(t){return`<div id="tab-report" class="tab-content active">
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
<div class="report-content">${t}</div>
</div>`}function Br(t,e){return`
<div class="tabs group-tabs">
<button class="group-tab active" data-group="diagnostics">\u{1FA7A} Diagnostics</button>
<button class="group-tab" data-group="research">\u{1F52C} Research</button>
<button class="group-tab" data-group="settings">\u2699\uFE0F Settings</button>
</div>

<div class="tabs leaf-tabs" data-group="diagnostics" style="display: flex;">
<button class="tab active" data-tab="report">\u{1F4CB} Report</button>
<button class="tab" data-tab="sessions">\u{1F4C1} Session Files (${e.length})</button>
<button class="tab" data-tab="cache">\u{1F4BE} Cache</button>
<button class="tab" data-tab="path-analyzer">\u{1F52C} Path Analyzer</button>
<button class="tab" data-tab="share">\u{1F4F8} Share Card</button>
</div>

<div class="tabs leaf-tabs" data-group="research" style="display: none;">
<button class="tab" data-tab="model-usage">\u{1F9EE} Model Usage</button>
<button class="tab" data-tab="tool-analysis">\u{1F527} Tool Analysis</button>
<button class="tab" data-tab="skill-usage">\u{1F9E9} Skill Usage</button>
<button class="tab" data-tab="otel-delta">\u{1F4E1} OTel Delta</button>
<button class="tab" data-tab="ttft">\u23F1\uFE0F TTFT</button>
</div>

<div class="tabs leaf-tabs" data-group="settings" style="display: none;">
<button class="tab" data-tab="display">\u2699\uFE0F Display</button>
<button class="tab" data-tab="backend">\u2601\uFE0F Backend Storage</button>
<button class="tab" data-tab="github">\u{1F511} GitHub Auth</button>
${t.isDebugMode?'<button class="tab" data-tab="debug">\u{1F41B} Debug</button>':""}
</div>`}function Nr(t,e,o){return`
<style>${ko}</style>
<style>${xo}</style>
<div class="container">
<div class="header">
<div class="header-left">
<span class="header-icon">\u{1F50D}</span>
<span class="header-title">Diagnostic Report</span>
</div>
<div class="button-row">
${po("btn-diagnostics",!!t?.backendConfigured)}
</div>
</div>

${Br(t,e)}

${Or(o)}

<div id="tab-sessions" class="tab-content">
<div class="info-box"><div class="info-box-title">\u{1F4C1} Session File Analysis</div><div>
This tab shows session files with activity in the last 14 days from all detected editors. </br>
Click on an editor panel to filter, click column headers to sort, and click a file name to open it.
</div></div>
<div id="session-table-container">${$n(e,e.length===0)}</div>
</div>

${gr(t)}
<div id="tab-backend" class="tab-content">
${Ke(t.backendStorageInfo,t.githubAuth)}
</div>

<div id="tab-github" class="tab-content">
${Ve(t.githubAuth)}
</div>
${br(t)}
${t.isDebugMode?ci(t.globalStateCounters):""}
<div id="tab-path-analyzer" class="tab-content">
${bi()}
</div>
${In(e,V)}
<div id="tab-model-usage" class="tab-content">
${Ti(e,V)}
</div>
${Xn(t.toolCallStats,t.toolFamilies)}
${Qn(t.skillCallStats,t.skillCallsByEditor,t.skillDescriptions,qe)}
${es(t.otelComparison)}
${Lr()}
</div>
`}function Fr(t){return W=W??t.backendStorageInfo,N=N??t.githubAuth,{backendStorageInfo:W,githubAuth:N}}function Hr(t){let e=document.getElementById("root");if(!e)return;let o=t.detailedSessionFiles||[];q=o,V=o.length===0;let n=Fr(t);Fe=t.otelComparison,t.toolFamilies&&(Oe=t.toolFamilies),ze=t.skillCallStats,je=t.skillCallsByEditor,Ge=t.skillDescriptions;let i=t.report===Ns?Hs.trim():Dn(d(t.report));h(e,Nr({...t,...n},o,i));let r=Ln(t.sessionFolders||[]);if(r.length>0){let g=document.getElementById("tab-report")?.querySelector(".report-content");g&&g.insertAdjacentElement("afterend",Un(r))}Pi(),$i(),Nn(),Fn(),Hn(),jn(),zn(),Xe(),Qe(),Gn(),Pn(),Je(),_i(),Li(),Ye(V),ji(),Ri(),to(),Yn(),Zn(),Ur();let a=E.restore(),l="report";a?.activeTab&&te(a.activeTab)?l=a.activeTab:te("report"),Bn(Ai(l)),a?.activeSubtab&&Ze(a.activeSubtab)}async function zr(){if(await Promise.resolve().then(()=>(fn(),mn)),!wt){let t=document.getElementById("root");t&&(t.textContent="No data available.");return}Hr(wt)}pr();zr();})();
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
