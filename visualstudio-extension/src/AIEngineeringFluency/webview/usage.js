"use strict";(()=>{var pn=Object.defineProperty;var b=(t,e,o)=>()=>{if(o)throw o[0];try{return t&&(e=t(t=0)),e}catch(n){throw o=[n],n}};var un=(t,e)=>{for(var o in e)pn(t,o,{get:e[o],enumerable:!0})};var Lt,Bt,oe,Qe,gt,Dt,J,to,ne,se=b(()=>{Lt=globalThis,Bt=Lt.ShadowRoot&&(Lt.ShadyCSS===void 0||Lt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,oe=Symbol(),Qe=new WeakMap,gt=class{constructor(e,o,n){if(this._$cssResult$=!0,n!==oe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(Bt&&e===void 0){let n=o!==void 0&&o.length===1;n&&(e=Qe.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Qe.set(o,e))}return e}toString(){return this.cssText}},Dt=t=>new gt(typeof t=="string"?t:t+"",void 0,oe),J=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((n,s,r)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[r+1],t[0]);return new gt(o,t,oe)},to=(t,e)=>{if(Bt)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let n=document.createElement("style"),s=Lt.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=o.cssText,t.appendChild(n)}},ne=Bt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let n of e.cssRules)o+=n.cssText;return Dt(o)})(t):t});var Cn,Tn,Sn,$n,An,En,O,eo,Rn,Mn,mt,bt,Nt,oo,L,ft=b(()=>{se();se();({is:Cn,defineProperty:Tn,getOwnPropertyDescriptor:Sn,getOwnPropertyNames:$n,getOwnPropertySymbols:An,getPrototypeOf:En}=Object),O=globalThis,eo=O.trustedTypes,Rn=eo?eo.emptyScript:"",Mn=O.reactiveElementPolyfillSupport,mt=(t,e)=>t,bt={toAttribute(t,e){switch(e){case Boolean:t=t?Rn:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},Nt=(t,e)=>!Cn(t,e),oo={attribute:!0,type:String,converter:bt,reflect:!1,useDefault:!1,hasChanged:Nt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),O.litPropertyMetadata??(O.litPropertyMetadata=new WeakMap);L=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=oo){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(e,n,o);s!==void 0&&Tn(this.prototype,e,s)}}static getPropertyDescriptor(e,o,n){let{get:s,set:r}=Sn(this.prototype,e)??{get(){return this[o]},set(i){this[o]=i}};return{get:s,set(i){let a=s?.call(this);r?.call(this,i),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oo}static _$Ei(){if(this.hasOwnProperty(mt("elementProperties")))return;let e=En(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(mt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(mt("properties"))){let o=this.properties,n=[...$n(o),...An(o)];for(let s of n)this.createProperty(s,o[s])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[n,s]of o)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let s=this._$Eu(o,n);s!==void 0&&this._$Eh.set(s,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let s of n)o.unshift(ne(s))}else e!==void 0&&o.push(ne(e));return o}static _$Eu(e,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return to(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,n){this._$AK(e,n)}_$ET(e,o){let n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:bt).toAttribute(o,n.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,o){let n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),i=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:bt;this._$Em=s;let a=i.fromAttribute(o,r.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,o,n,s=!1,r){if(e!==void 0){let i=this.constructor;if(s===!1&&(r=this[e]),n??(n=i.getPropertyOptions(e)),!((n.hasChanged??Nt)(r,o)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,n))))return;this.C(e,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:n,reflect:s,wrapped:r},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,i??o??this[e]),r!==!0||i!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(o=void 0),this._$AL.set(e,o)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:i}=r,a=this[s];i!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,r,a)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(e){}firstUpdated(e){}};L.elementStyles=[],L.shadowRootOptions={mode:"open"},L[mt("elementProperties")]=new Map,L[mt("finalized")]=new Map,Mn?.({ReactiveElement:L}),(O.reactiveElementVersions??(O.reactiveElementVersions=[])).push("2.1.2")});function mo(t,e){if(!pe(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return so!==void 0?so.createHTML(e):e}function ot(t,e,o=t,n){if(e===R)return e;let s=n!==void 0?o._$Co?.[n]:o._$Cl,r=xt(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(t),s._$AT(t,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=s:o._$Cl=s),s!==void 0&&(e=ot(t,s._$AS(t,e.values),s,n)),e}var yt,no,Ht,so,po,j,uo,_n,Z,vt,xt,pe,zn,re,ht,ro,io,Y,ao,lo,go,ue,B,xi,ki,R,w,co,X,Pn,kt,ie,wt,nt,ae,le,de,ce,In,bo,st=b(()=>{yt=globalThis,no=t=>t,Ht=yt.trustedTypes,so=Ht?Ht.createPolicy("lit-html",{createHTML:t=>t}):void 0,po="$lit$",j=`lit$${Math.random().toFixed(9).slice(2)}$`,uo="?"+j,_n=`<${uo}>`,Z=document,vt=()=>Z.createComment(""),xt=t=>t===null||typeof t!="object"&&typeof t!="function",pe=Array.isArray,zn=t=>pe(t)||typeof t?.[Symbol.iterator]=="function",re=`[ 	
\f\r]`,ht=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ro=/-->/g,io=/>/g,Y=RegExp(`>|${re}(?:([^\\s"'>=/]+)(${re}*=${re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ao=/'/g,lo=/"/g,go=/^(?:script|style|textarea|title)$/i,ue=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),B=ue(1),xi=ue(2),ki=ue(3),R=Symbol.for("lit-noChange"),w=Symbol.for("lit-nothing"),co=new WeakMap,X=Z.createTreeWalker(Z,129);Pn=(t,e)=>{let o=t.length-1,n=[],s,r=e===2?"<svg>":e===3?"<math>":"",i=ht;for(let a=0;a<o;a++){let l=t[a],p,d,u=-1,h=0;for(;h<l.length&&(i.lastIndex=h,d=i.exec(l),d!==null);)h=i.lastIndex,i===ht?d[1]==="!--"?i=ro:d[1]!==void 0?i=io:d[2]!==void 0?(go.test(d[2])&&(s=RegExp("</"+d[2],"g")),i=Y):d[3]!==void 0&&(i=Y):i===Y?d[0]===">"?(i=s??ht,u=-1):d[1]===void 0?u=-2:(u=i.lastIndex-d[2].length,p=d[1],i=d[3]===void 0?Y:d[3]==='"'?lo:ao):i===lo||i===ao?i=Y:i===ro||i===io?i=ht:(i=Y,s=void 0);let k=i===Y&&t[a+1].startsWith("/>")?" ":"";r+=i===ht?l+_n:u>=0?(n.push(p),l.slice(0,u)+po+l.slice(u)+j+k):l+j+(u===-2?a:k)}return[mo(t,r+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},kt=class t{constructor({strings:e,_$litType$:o},n){let s;this.parts=[];let r=0,i=0,a=e.length-1,l=this.parts,[p,d]=Pn(e,o);if(this.el=t.createElement(p,n),X.currentNode=this.el.content,o===2||o===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=X.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let u of s.getAttributeNames())if(u.endsWith(po)){let h=d[i++],k=s.getAttribute(u).split(j),C=/([.?@])?(.*)/.exec(h);l.push({type:1,index:r,name:C[2],strings:k,ctor:C[1]==="."?ae:C[1]==="?"?le:C[1]==="@"?de:nt}),s.removeAttribute(u)}else u.startsWith(j)&&(l.push({type:6,index:r}),s.removeAttribute(u));if(go.test(s.tagName)){let u=s.textContent.split(j),h=u.length-1;if(h>0){s.textContent=Ht?Ht.emptyScript:"";for(let k=0;k<h;k++)s.append(u[k],vt()),X.nextNode(),l.push({type:2,index:++r});s.append(u[h],vt())}}}else if(s.nodeType===8)if(s.data===uo)l.push({type:2,index:r});else{let u=-1;for(;(u=s.data.indexOf(j,u+1))!==-1;)l.push({type:7,index:r}),u+=j.length-1}r++}}static createElement(e,o){let n=Z.createElement("template");return n.innerHTML=e,n}};ie=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:n}=this._$AD,s=(e?.creationScope??Z).importNode(o,!0);X.currentNode=s;let r=X.nextNode(),i=0,a=0,l=n[0];for(;l!==void 0;){if(i===l.index){let p;l.type===2?p=new wt(r,r.nextSibling,this,e):l.type===1?p=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(p=new ce(r,this,e)),this._$AV.push(p),l=n[++a]}i!==l?.index&&(r=X.nextNode(),i++)}return X.currentNode=Z,s}p(e){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,o),o+=n.strings.length-2):n._$AI(e[o])),o++}},wt=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,n,s){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=ot(this,e,o),xt(e)?e===w||e==null||e===""?(this._$AH!==w&&this._$AR(),this._$AH=w):e!==this._$AH&&e!==R&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):zn(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==w&&xt(this._$AH)?this._$AA.nextSibling.data=e:this.T(Z.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=kt.createElement(mo(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(o);else{let r=new ie(s,this),i=r.u(this.options);r.p(o),this.T(i),this._$AH=r}}_$AC(e){let o=co.get(e.strings);return o===void 0&&co.set(e.strings,o=new kt(e)),o}k(e){pe(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,s=0;for(let r of e)s===o.length?o.push(n=new t(this.O(vt()),this.O(vt()),this,this.options)):n=o[s],n._$AI(r),s++;s<o.length&&(this._$AR(n&&n._$AB.nextSibling,s),o.length=s)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let n=no(e).nextSibling;no(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},nt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,n,s,r){this.type=1,this._$AH=w,this._$AN=void 0,this.element=e,this.name=o,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=w}_$AI(e,o=this,n,s){let r=this.strings,i=!1;if(r===void 0)e=ot(this,e,o,0),i=!xt(e)||e!==this._$AH&&e!==R,i&&(this._$AH=e);else{let a=e,l,p;for(e=r[0],l=0;l<r.length-1;l++)p=ot(this,a[n+l],o,l),p===R&&(p=this._$AH[l]),i||(i=!xt(p)||p!==this._$AH[l]),p===w?e=w:e!==w&&(e+=(p??"")+r[l+1]),this._$AH[l]=p}i&&!s&&this.j(e)}j(e){e===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ae=class extends nt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===w?void 0:e}},le=class extends nt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==w)}},de=class extends nt{constructor(e,o,n,s,r){super(e,o,n,s,r),this.type=5}_$AI(e,o=this){if((e=ot(this,e,o,0)??w)===R)return;let n=this._$AH,s=e===w&&n!==w||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==w&&(n===w||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ce=class{constructor(e,o,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ot(this,e)}},In=yt.litHtmlPolyfillSupport;In?.(kt,wt),(yt.litHtmlVersions??(yt.litHtmlVersions=[])).push("3.3.3");bo=(t,e,o)=>{let n=o?.renderBefore??e,s=n._$litPart$;if(s===void 0){let r=o?.renderBefore??null;n._$litPart$=s=new wt(e.insertBefore(vt(),r),r,void 0,o??{})}return s._$AI(t),s}});var Ct,F,Ln,fo=b(()=>{ft();ft();st();st();Ct=globalThis,F=class extends L{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let e=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=e.firstChild),e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=bo(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};F._$litElement$=!0,F.finalized=!0,Ct.litElementHydrateSupport?.({LitElement:F});Ln=Ct.litElementPolyfillSupport;Ln?.({LitElement:F});(Ct.litElementVersions??(Ct.litElementVersions=[])).push("4.2.2")});var ho=b(()=>{});var q=b(()=>{ft();st();fo();ho()});var yo=b(()=>{});function y(t){return(e,o)=>typeof o=="object"?Dn(t,e,o):((n,s,r)=>{let i=s.hasOwnProperty(r);return s.constructor.createProperty(r,n),i?Object.getOwnPropertyDescriptor(s,r):void 0})(t,e,o)}var Bn,Dn,ge=b(()=>{ft();Bn={attribute:!0,type:String,converter:bt,reflect:!1,hasChanged:Nt},Dn=(t=Bn,e,o)=>{let{kind:n,metadata:s}=o,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),r.set(o.name,t),n==="accessor"){let{name:i}=o;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(i,l,t,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,t,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let l=this[i];e.call(this,a),this.requestUpdate(i,l,t,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function me(t){return y({...t,state:!0,attribute:!1})}var vo=b(()=>{ge();});var xo=b(()=>{});var rt=b(()=>{});var ko=b(()=>{rt();});var wo=b(()=>{rt();});var Co=b(()=>{rt();});var To=b(()=>{rt();});var So=b(()=>{rt();});var be=b(()=>{yo();ge();vo();xo();ko();wo();Co();To();So()});var Ot,jt,it,fe=b(()=>{Ot={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},jt=t=>(...e)=>({_$litDirective$:t,values:e}),it=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,n){this._$Ct=e,this._$AM=o,this._$Ci=n}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}}});var Ft,$o=b(()=>{st();fe();Ft=jt(class extends it{constructor(t){if(super(t),t.type!==Ot.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in e)e[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(e)}let o=t.element.classList;for(let n of this.st)n in e||(o.remove(n),this.st.delete(n));for(let n in e){let s=!!e[n];s===this.st.has(n)||this.nt?.has(n)||(s?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return R}})});var he=b(()=>{$o()});var qt,Ao,Eo,at,Wt,ye=b(()=>{q();qt="2.5.1",Ao="__vscodeElements_disableRegistryWarning__",Eo=(t,e)=>{console.warn(e?`[VSCode Elements] ${t}
%o`:`${t}
%o`,e)},at=class extends F{get version(){return qt}warn(e){Eo(e,this)}},Wt=t=>e=>{if(!customElements.get(t)){customElements.define(t,e);return}if(Ao in window)return;let s=document.createElement(t)?.version,r="";s?s!==qt?(r+="is already registered by a different version of VSCode Elements. ",r+=`This version is "${qt}", while the other one is "${s}".`):r+=`is already registered by the same version of VSCode Elements (${qt}).`:r+="is already registered by an unknown custom element handler class.",Eo(`The custom element "${t}" ${r}
To suppress this warning, set window.${Ao} to true`)}});var lt,Ro=b(()=>{st();lt=t=>t??w});var ve=b(()=>{Ro()});var Mo=b(()=>{fe()});var xe,_o,zo=b(()=>{q();Mo();xe=class extends it{constructor(e){if(super(e),this._prevProperties={},e.type!==Ot.PROPERTY||e.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(e,[o]){return Object.entries(o).forEach(([n,s])=>{this._prevProperties[n]!==s&&(n.startsWith("--")?e.element.style.setProperty(n,s):e.element.style[n]=s,this._prevProperties[n]=s)}),R}render(e){return R}},_o=jt(xe)});var Kt,ke=b(()=>{q();Kt=J`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var Nn,Po,Io=b(()=>{q();ke();Nn=[Kt,J`
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
  `],Po=Nn});var Q,Tt,M,Lo=b(()=>{q();be();he();ve();ye();zo();Io();Q=function(t,e,o,n){var s=arguments.length,r=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(r=(s<3?i(r):s>3?i(e,o,r):i(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r},M=Tt=class extends at{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();let{href:e,nonce:o}=this._getStylesheetConfig();Tt.stylesheetHref=e,Tt.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let e=document.getElementById("vscode-codicon-stylesheet"),o=e?.getAttribute("href")||void 0,n=e?.nonce||void 0;if(!e){let s='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';s+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(s)}return{nonce:n,href:o}}render(){let{stylesheetHref:e,nonce:o}=Tt,n=B`<span
      class=${Ft({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${_o({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,s=this.actionIcon?B` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:B` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return B`
      <link
        rel="stylesheet"
        href=${lt(e)}
        nonce=${lt(o)}
      />
      ${s}
    `}};M.styles=Po;M.stylesheetHref="";M.nonce="";Q([y()],M.prototype,"label",void 0);Q([y({type:String})],M.prototype,"name",void 0);Q([y({type:Number})],M.prototype,"size",void 0);Q([y({type:Boolean,reflect:!0})],M.prototype,"spin",void 0);Q([y({type:Number,attribute:"spin-duration"})],M.prototype,"spinDuration",void 0);Q([y({type:Boolean,reflect:!0,attribute:"action-icon"})],M.prototype,"actionIcon",void 0);M=Tt=Q([Wt("vscode-icon")],M)});var Bo=b(()=>{Lo()});function Do(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var No=b(()=>{});var Hn,Un,Ho,Uo=b(()=>{q();ke();No();Hn=Dt(Do()),Un=[Kt,J`
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
      font-family: var(--vscode-font-family, ${Hn});
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
  `],Ho=Un});var T,x,Oo=b(()=>{q();be();he();ye();Bo();Uo();ve();T=function(t,e,o,n){var s=arguments.length,r=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(r=(s<3?i(r):s>3?i(e,o,r):i(e,o))||r);return s>3&&r&&Object.defineProperty(e,o,r),r},x=class extends at{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(e){super.update(e),e.has("value")&&this._internals.setFormValue(this.value),e.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(e){if((e.key==="Enter"||e.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(e){e.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(e){let o=e.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let e=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},s=e?B`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${lt(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:w,r=o?B`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${lt(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:w;return B`
      <div
        class=${Ft(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${s}
        <slot></slot>
        ${r}
        <slot name="content-after"></slot>
      </div>
    `}};x.styles=Ho;x.formAssociated=!0;T([y({type:Boolean,reflect:!0})],x.prototype,"autofocus",void 0);T([y({type:Number,reflect:!0})],x.prototype,"tabIndex",void 0);T([y({type:Boolean,reflect:!0})],x.prototype,"secondary",void 0);T([y({type:Boolean,reflect:!0})],x.prototype,"block",void 0);T([y({reflect:!0})],x.prototype,"role",void 0);T([y({type:Boolean,reflect:!0})],x.prototype,"disabled",void 0);T([y()],x.prototype,"icon",void 0);T([y({type:Boolean,reflect:!0,attribute:"icon-spin"})],x.prototype,"iconSpin",void 0);T([y({type:Number,reflect:!0,attribute:"icon-spin-duration"})],x.prototype,"iconSpinDuration",void 0);T([y({attribute:"icon-after"})],x.prototype,"iconAfter",void 0);T([y({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],x.prototype,"iconAfterSpin",void 0);T([y({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],x.prototype,"iconAfterSpinDuration",void 0);T([y({type:Boolean,reflect:!0})],x.prototype,"focused",void 0);T([y({type:String,reflect:!0})],x.prototype,"name",void 0);T([y({type:Boolean,reflect:!0,attribute:"icon-only"})],x.prototype,"iconOnly",void 0);T([y({reflect:!0})],x.prototype,"type",void 0);T([y()],x.prototype,"value",void 0);T([me()],x.prototype,"_hasContentBefore",void 0);T([me()],x.prototype,"_hasContentAfter",void 0);x=T([Wt("vscode-button")],x)});var jo={};un(jo,{VscodeButton:()=>x});var Fo=b(()=>{Oo()});function m(t,e,o){let n=document.createElement(t);return e&&(n.className=e),o!==void 0&&(n.textContent=o),n}var Oe={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var gn=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function mn(t,e){return gn.filter(o=>o!=="btn-dashboard"||e).map(o=>({...Oe[o],active:o===t}))}function bn(t){let e=typeof t=="string"?Oe[t]:t;if(e.hidden)return"";let o=e.appearance?` appearance="${e.appearance}"`:"",n=e.active?' class="nav-active" disabled aria-current="page"':"",s=e.iconColor?` style="--icon-accent:${e.iconColor}"`:"",r=e.icon?`<span class="codicon codicon-${e.icon} nav-icon"${s}></span>`:"";return`<vscode-button id="${e.id}"${o}${n}>${r}${e.label}</vscode-button>`}function je(t,e){return mn(t,e).map(o=>bn(o)).join(`
`)}function ut(t){return t.file+t.selection+t.implicitSelection+t.symbol+t.codebase+t.workspace+t.terminal+t.vscode+t.copilotInstructions+t.agentsMd+(t.terminalLastCommand||0)+(t.terminalSelection||0)+(t.clipboard||0)+(t.changes||0)+(t.outputPanel||0)+(t.problemsPanel||0)+(t.pullRequest||0)}function I(t){let e=globalThis.window;return e?e[t]:void 0}var fn=I("__TOKEN_ESTIMATORS__"),ei=fn?.estimators??{},Qt;function te(t){Qt=t}function S(t,e){return new Intl.NumberFormat(Qt,{minimumFractionDigits:e,maximumFractionDigits:e}).format(t)}function V(t,e=1){return`${S(t,e)}%`}function g(t){return t.toLocaleString(Qt)}function c(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Fe(t){if(t===void 0||!Number.isFinite(t)||t<0)return"\u2014";let e=Math.round(t/6e4);if(e<1)return"<1m";if(e<60)return`${e}m`;let o=Math.floor(e/60),n=e%60;return`${o}h ${String(n).padStart(2,"0")}m`}function qe(t){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of e){let s=document.createElement("vscode-button");s.id=`ext-point-${n.id}`,s.textContent=n.label,s.addEventListener("click",()=>{t.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(s)}}var We=`/**
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
`;var Ke=`* {
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
`;function Ge(t){window.addEventListener("message",e=>{t(e.data)})}var vn=I("__MODEL_PRICING__"),ee={};for(let[t,e]of Object.entries(vn?.pricing??{}))e.displayNames&&e.displayNames.length>0&&(ee[t]=e.displayNames[0]);function Pt(t){if(ee[t])return ee[t];try{return decodeURIComponent(t)}catch{return t}}var ui=1/1e11;function xn(t){if(!t)return null;let e=/([\d.]+)\s*([KkMm])?/.exec(t);if(!e)return null;let o=parseFloat(e[1]);if(!isFinite(o)||o<=0)return null;let n=(e[2]??"").toUpperCase();return Math.round(o*(n==="M"?1e6:n==="K"?1e3:1))}function Ve(t,e={}){let o=e[t];if(!o){let r=t.toLowerCase();for(let[i,a]of Object.entries(e))if(r.includes(i.toLowerCase())||i.toLowerCase().includes(r)){o=a;break}}let n=o?.copilotPricing?.longContext;if(!n)return null;let s=xn(n.threshold);return s?{thresholdTokens:s,defaultInputCostPerMillion:o.copilotPricing.inputCostPerMillion,longContextInputCostPerMillion:n.inputCostPerMillion}:null}var kn=new Set(["\u2705","\u26A0\uFE0F","\u274C"]);function It(t){let e=Number(t);return Number.isFinite(e)?e:0}function Je(t){if(!t||typeof t!="object")return;let e=t,o=Array.isArray(e.customizationTypes)?e.customizationTypes.filter(s=>!!s&&typeof s=="object").map(s=>({id:typeof s.id=="string"?s.id:"",icon:typeof s.icon=="string"?s.icon:"",label:typeof s.label=="string"?s.label:""})).filter(s=>s.id!==""):[],n=Array.isArray(e.workspaces)?e.workspaces.filter(s=>!!s&&typeof s=="object").map(s=>{let r=s.typeStatuses&&typeof s.typeStatuses=="object"?s.typeStatuses:{},i={};for(let[a,l]of Object.entries(r))i[a]=kn.has(l)?l:"\u274C";return{workspacePath:typeof s.workspacePath=="string"?s.workspacePath:"",workspaceName:typeof s.workspaceName=="string"?s.workspaceName:"",sessionCount:It(s.sessionCount),interactionCount:It(s.interactionCount),typeStatuses:i}}):[];return{customizationTypes:o,workspaces:n,totalWorkspaces:It(e.totalWorkspaces),workspacesWithIssues:It(e.workspacesWithIssues)}}var Ye=/^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;function wn(t){return t.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}function Xe(t){let e=Ye.exec(t);if(e)return`Claude MCP: M365 Connector - ${wn(e[1])}`}function Ze(t){return Ye.test(t)}function z(t,e){let o=e?` title="${c(e)}"`:"",n="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";return t==="\u2705"?`<span style="${n}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${o} aria-label="${c(e??"Present and fresh")}">\u2713</span>`:t==="\u26A0\uFE0F"?`<span style="${n}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${o} aria-label="${c(e??"Present but stale")}">!</span>`:`<span style="${n}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${o} aria-label="${c(e??"Missing")}">\u2715</span>`}var f=acquireVsCodeApi(),qo=new Set,D=f.getState()?.aboutCollapsed??!1;function U(t,e){try{f.postMessage({command:"traceUsageCuration",stage:t,details:e??{}})}catch{}}function tt(t,e,o){qo.has(t)||(qo.add(t),U(e,o))}var W=I("__INITIAL_USAGE__"),P=null,zt=new Map,E=null,et=!1,_t=!1,Xo=[],A="activity",Jt=null,Pe=[],Yt=null,On=`
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
</style>`,St=[{id:"ul-s-start",label:"Starting usage analysis"},{id:"ul-s-tools",label:"Collecting runtime tools"},{id:"ul-s-mcp",label:"Discovering MCP servers"},{id:"ul-s-skills",label:"Scanning skill directories"},{id:"ul-s-crunch",label:"Computing curation analysis"},{id:"ul-s-ready",label:"Ready!"}],jn={start:{pct:5,stepId:"ul-s-start",subtitle:"Starting usage analysis\u2026"},"curation:start":{pct:20,stepId:"ul-s-tools",subtitle:"Collecting tools and skills\u2026"},"curation:runtimeTools":{pct:32,stepId:"ul-s-tools",subtitle:"Collected runtime tools"},"curation:mcpJson":{pct:44,stepId:"ul-s-mcp",subtitle:"Scanning MCP config files\u2026"},"curation:mcpSources":{pct:55,stepId:"ul-s-mcp",subtitle:"Collected MCP servers"},"curation:skillsScanStart":{pct:63,stepId:"ul-s-skills",subtitle:"Scanning skill directories\u2026"},"curation:skillsScanDone":{pct:75,stepId:"ul-s-skills",subtitle:"Skill discovery complete"},"curation:analyzing":{pct:85,stepId:"ul-s-crunch",subtitle:"Analyzing tool usage patterns\u2026"},"curation:done":{pct:96,stepId:"ul-s-crunch",subtitle:"Curation analysis complete"},ready:{pct:100,stepId:"ul-s-ready",subtitle:"Usage analysis ready"},error:{pct:100,stepId:"ul-s-ready",subtitle:"Analysis completed with errors"},"curation:error":{pct:85,stepId:"ul-s-crunch",subtitle:"Curation analysis skipped"}};function Ie(t="Loading usage analysis..."){let e=document.getElementById("root");if(!e)return;Le=!0;let o=St.map((n,s)=>{let r=s===0,i=r?"ul-step ul-active":"ul-step",a=r?'<span class="ul-spin">\u21BB</span>':"\u25CB";return`<div class="${i}" id="${n.id}"><span class="ul-ico">${a}</span><span class="ul-lbl">${c(n.label)}</span><span class="ul-cnt" id="${n.id}-cnt"></span></div>`}).join("");e.innerHTML=`${On}
<div id="usage-loading-wrap">
  <div id="usage-loading-card">
    <div id="ul-header">
      <div>
        <div id="ul-badge">\u{1F4CA} Analyzing Usage Data</div>
        <div id="ul-title">${c(t)}</div>
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
</div>`}function Wo(t){let e=document.getElementById(t);if(!e)return;e.className="ul-step ul-done";let o=e.querySelector(".ul-ico");o&&(o.innerHTML='<span class="ul-pop">\u2713</span>')}function Fn(t){let e=document.getElementById(t);if(!e)return;e.className="ul-step ul-active";let o=e.querySelector(".ul-ico");o&&(o.innerHTML='<span class="ul-spin">\u21BB</span>')}function qn(t,e){let o=document.getElementById(`${t}-cnt`);o&&(o.textContent=e)}var $t=0,Le=!1;function Wn(t,e){for(let o=$t;o<t;o++)Wo(St[o].id);t>$t&&($t=t),e<100?Fn(St[t].id):Wo(St[t].id)}function Kn(t){return typeof t.count=="number"?`${t.count}`:typeof t.skills=="number"?`${t.skills} skills`:typeof t.availableTools=="number"?`${t.availableTools} tools`:""}function Gn(){let t=document.getElementById("root");return t?t.querySelector("#usage-loading-card")?!0:Le?(Ie("Building Usage Analysis"),$t=0,!0):!1:!1}function Vn(t){if(!Gn())return;let e=typeof t?.stage=="string"?t.stage:"",o=jn[e];if(!o)return;let n=o.pct,s=document.getElementById("ul-fill");s&&(s.classList.remove("ul-indeterminate"),s.style.width=`${Math.max(n,3)}%`);let r=document.getElementById("ul-pct");r&&(r.textContent=n===100?"100%":`${n}%`);let i=document.getElementById("ul-subtitle");i&&(i.textContent=o.subtitle);let a=St.findIndex(p=>p.id===o.stepId);a>=0&&Wn(a,n);let l=t?.details;if(l&&typeof l=="object"){let p=Kn(l);p&&qn(o.stepId,`(${p})`)}}function $e(){Jt!==null&&(clearTimeout(Jt),Jt=null)}function Be(){let t=document.createElement("button");return t.textContent="\u{1F504} Refresh",t.style.cssText="padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;",t.addEventListener("click",()=>f.postMessage({command:"refresh"})),t}function Zo(t){let e=document.getElementById("root");if(!e)return;let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="font-size: 24px; margin-bottom: 12px;",n.innerHTML=z("\u274C","Error");let s=document.createElement("div");s.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",s.textContent=t,o.append(n,s,Be()),e.textContent="",e.append(o)}var Ae=!1,At=null,Ee=!1,Et=null,Jn={xhigh:"Extra High"};function Yn(t){return Jn[t]??t}var Rt=I("__TOOL_NAMES__")??null,Xn=I("__AUTOMATIC_TOOLS__")??[],Zn=new Set(Xn.map(t=>t.toLowerCase()));function Qo(t){return Rt?Rt[t]??Rt[t.toLowerCase()]??Xe(t)??t:t}function we(t){let e=Qo(t),o=e.indexOf(":");return o!==-1?e.substring(o+1).trim():e}function Qn(t){let e=new Set;Object.entries(t.today.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.last30Days.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.month.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.today.toolCalls.byTool).forEach(([n])=>e.add(n)),Object.entries(t.last30Days.toolCalls.byTool).forEach(([n])=>e.add(n)),Object.entries(t.month.toolCalls.byTool).forEach(([n])=>e.add(n));let o=new Set(t.suppressedUnknownTools??[]);return Array.from(e).filter(n=>!Rt?.[n]&&!Rt?.[n.toLowerCase()]&&!Ze(n)&&!o.has(n)).sort()}function ts(t){let e="https://github.com/rajbos/ai-engineering-fluency",o=encodeURIComponent("Add missing friendly names for tools"),n=t.map(i=>`- \`${i}\``).join(`
`),s=encodeURIComponent(`## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${n}

Please add friendly names for these tools to improve the user experience.`),r=encodeURIComponent("MCP Toolnames");return`${e}/issues/new?title=${o}&body=${s}&labels=${r}`}var es=[{label:"\u{1F4AC} Ask Mode",key:"ask",gradient:"linear-gradient(90deg, #3b82f6, #60a5fa)"},{label:"\u270F\uFE0F Edit Mode",key:"edit",gradient:"linear-gradient(90deg, #10b981, #34d399)"},{label:"\u{1F916} Agent Mode",key:"agent",gradient:"linear-gradient(90deg, #7c3aed, #a855f7)"},{label:"\u{1F4CB} Plan Mode",key:"plan",gradient:"linear-gradient(90deg, #f59e0b, #fbbf24)"},{label:"\u26A1 Custom Agent",key:"customAgent",gradient:"linear-gradient(90deg, #ec4899, #f472b6)"},{label:"\u{1F5A5}\uFE0F CLI",key:"cli",gradient:"linear-gradient(90deg, #06b6d4, #22d3ee)"}];function os(t,e,o,n){let s=o>0?e/o*100:0;return`
<div class="bar-item">
<div class="bar-label"><span>${t}</span><span><strong>${g(e)}</strong> (${V(s,0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${s.toFixed(1)}%; background: ${n};"></div></div>
</div>`}function Ko(t,e){let o=t.ask+t.edit+t.agent+t.plan+t.customAgent+t.cli,n=es.map(({label:s,key:r,gradient:i})=>os(s,t[r],o,i)).join("");return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${e}</h4>
<div class="bar-chart">${n}
</div>
</div>`}function ns(t){return`
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${S(t.averageModelsPerSession,1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${V(t.switchingFrequency,0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${g(t.maxModelsPerSession||0)}</div>
</div>
</div>`}function ss(t,e,o,n){return`
<div style="min-height: 110px;">
${t.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">\u{1F49A} Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${t.map(c).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${e.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${e.map(c).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${o.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${o.map(c).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${n.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">\u2753 Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${n.map(c).join(", ")}</span>
</div>
`:""}
</div>`}function rs(t){return t.totalRequests<=0?"":`
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${t.lowCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${g(t.lowCostRequests)} (${V(t.lowCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.mediumCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${g(t.mediumCostRequests)} (${V(t.mediumCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.highCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${g(t.highCostRequests)} (${V(t.highCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.unknownRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${g(t.unknownRequests)} (${V(t.unknownRequests/t.totalRequests*100)})</span>
</div>
`:""}
</div>`}function is(t){return t.mixedCostSessions<=0?"":`
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${g(t.mixedCostSessions)}</span>
</div>`}function Ce(t,e,o,n,s,r){return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${t}</h4>
${ns(e)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${ss(o,n,s,r)}
${rs(e)}
${is(e)}
</div>
</div>`}function Go(t,e,o,n,s){let r=document.querySelector(t);if(!r)return;let i=s>0?Math.round(n/s*100):0,a=`${o} ${n}/${s} repos (${i}%)`,l=r.querySelector(`.${e}`);if(l)l.textContent=a;else{Array.from(r.children).forEach(d=>{let u=d;!u.classList.contains("section-title")&&!u.classList.contains("section-subtitle")&&u.remove()});let p=document.createElement("div");p.className=e,p.style.cssText="margin-top:8px; font-size:12px; color:var(--text-secondary);",p.textContent=a,r.appendChild(p)}}function as(t){let e=t.missedPotential||W?.missedPotential||[];return e.length===0?`
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${z("\u2705")} No other AI tool configs missing a Copilot counterpart
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
                ${z("\u26A0\uFE0F")} Missed Potential: Non-Copilot Instruction Files
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
                        ${e.map(o=>`
                            <tr style="background: rgba(251, 191, 36, 0.05);">
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); font-family: 'Courier New', monospace; font-size: 12px;">
                                    ${c(o.workspaceName)}
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
                                                <span>${c(n.icon||"\u{1F4C4}")}</span>
                                                <span style="font-weight: 500;">${c(n.label||"")}:</span>
                                                <span style="font-family: monospace; color: var(--text-muted);">${c(n.relativePath)}</span>
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
    `}function N(t,e=10,o=Qo){let n=Object.entries(t).sort(([,r],[,i])=>i-r).slice(0,e);return n.length===0?'<div style="color: var(--text-muted);">No tools used yet</div>':`
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${n.map(([r,i],a)=>{let l=c(o(r)),p=c(r),d=Zn.has(r.toLowerCase())?'<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>':"";return`
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${a+1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${p}">${l}</strong>${d}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${g(i)}</td>
		    </tr>`}).join("")}
			</tbody>
		</table>`}var De=[{id:"interactions",label:"Turns",sortKey:"interactions",align:"right",render:t=>({html:g(t.interactions)})},{id:"toolCalls",label:"Tools",sortKey:"toolCalls",align:"right",render:t=>({html:g(t.toolCalls)})},{id:"inputTokens",label:"Input",sortKey:"inputTokens",align:"right",render:t=>({html:g(t.inputTokens)})},{id:"outputTokens",label:"Output",sortKey:"outputTokens",align:"right",render:t=>({html:g(t.outputTokens)})},{id:"thinkingTokens",label:"Thinking",sortKey:"thinkingTokens",align:"right",render:t=>({html:g(t.thinkingTokens)})},{id:"cachedTokens",label:"Cached",sortKey:"cachedTokens",align:"right",render:t=>({html:g(t.cachedTokens)})},{id:"totalTokens",label:"Total",sortKey:"totalTokens",align:"right",render:t=>({html:g(t.totalTokens)})},{id:"estimatedCost",label:"Cost",sortKey:"estimatedCost",align:"right",render:t=>({html:t.estimatedCost>0?`$${t.estimatedCost.toFixed(4)}`:"\u2014"})},{id:"editor",label:"Editor",sortKey:"editor",align:"left",render:t=>({html:c(t.editor||"unknown")})},{id:"workspace",label:"Workspace",sortKey:"workspace",align:"left",cellStyle:"max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:t=>{let e=c(t.workspace||"\u2014");return{html:e,title:e}}},{id:"models",label:"Models",align:"left",cellStyle:"font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:t=>{let e=t.models.map(o=>c(Pt(o))).join(", ")||"\u2014";return{html:e,title:e}}},{id:"durationMs",label:"Duration",sortKey:"durationMs",align:"right",cellStyle:"white-space:nowrap;",render:t=>({html:Fe(t.durationMs)})},{id:"lastActivity",label:"Last Active",sortKey:"lastActivity",align:"right",cellStyle:"white-space:nowrap;",render:t=>({html:t.lastActivity?$==="today"?new Date(t.lastActivity).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!Xt}):new Date(t.lastActivity).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!Xt}):"\u2014"})}],tn=De.map(t=>t.id),dt="interactions",Mt="desc",Ne=[],Xt=!0,$="today",Re=[],ct={},pt=new Set(tn);function ls(){f.postMessage({command:"saveSessionColumnSettings",settings:{enabledColumns:Array.from(pt)}})}function Vo(t){return dt!==t?"":Mt==="desc"?" \u25BC":" \u25B2"}var ds={title:(t,e)=>(t.title||"").localeCompare(e.title||""),editor:(t,e)=>(t.editor||"").localeCompare(e.editor||""),workspace:(t,e)=>(t.workspace||"").localeCompare(e.workspace||""),durationMs:(t,e)=>(t.durationMs??-1)-(e.durationMs??-1),lastActivity:(t,e)=>(t.lastActivity||"").localeCompare(e.lastActivity||"")};function cs(t,e){let o=ds[dt];return o?o(t,e):t[dt]-e[dt]}function ps(t){return[...t].sort((e,o)=>{let n=cs(e,o);return Mt==="desc"?-n:n})}function Me(t){return Ne=t,!t||t.length===0?`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${$==="today"?"No sessions recorded today yet.":"No sessions recorded in this period."}</div>`:`<div id="sessions-table-container">${He(t)}</div>`}function He(t){let e=ps(t),o=De.filter(r=>pt.has(r.id)),n=e.map((r,i)=>{let a=c(r.title||"Untitled session"),l=c(r.filePath||""),p=o.map(d=>{let{html:u,title:h}=d.render(r),k=d.align==="right"?"text-align:right;":"",C=h!==void 0?` title="${h}"`:"";return`<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${k}${d.cellStyle||""}"${C}>${u}</td>`}).join("");return`<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${i+1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${a}&quot;"><a href="#" class="session-title-link" data-file="${l}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${a}</a></td>
			${p}
		</tr>`}).join(""),s=o.map(r=>{let i=r.align==="right"?" text-align:right;":"";return r.sortKey?`<th class="sortable" data-sort="${r.sortKey}" style="padding:6px 8px;${i}">${r.label}${Vo(r.sortKey)}</th>`:`<th style="padding:6px 8px;${i}">${r.label}</th>`}).join("");return`
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${Vo("title")}</th>
					${s}
				</tr>
			</thead>
			<tbody>
				${n}
			</tbody>
		</table>
		</div>`}function us(){return`
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">\u2699 Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${De.map(e=>`
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${e.id}"${pt.has(e.id)?" checked":""} />
			<span>${e.label}</span>
		</label>`).join("")}
			</div>
		</div>`}function en(){let t=document.getElementById("sessions-panel-body");t&&(t.addEventListener("click",e=>{let o=e.target.closest("a.session-title-link");if(o){e.preventDefault();let i=o.getAttribute("data-file");i&&f.postMessage({command:"openSessionFile",file:i});return}let n=e.target.closest("th.sortable");if(!n)return;let s=n.getAttribute("data-sort");if(!s)return;dt===s?Mt=Mt==="desc"?"asc":"desc":(dt=s,Mt="desc");let r=document.getElementById("sessions-table-container");r&&(r.innerHTML=He(Ne))}),ms(),gs())}var Jo=!1;function gs(){let t=document.getElementById("sessions-columns-toggle"),e=document.getElementById("sessions-columns-menu");!t||!e||(t.addEventListener("click",o=>{o.stopPropagation(),e.style.display=e.style.display==="none"?"block":"none"}),e.addEventListener("click",o=>o.stopPropagation()),e.addEventListener("change",o=>{let n=o.target,s=n.getAttribute("data-column");if(!s)return;n.checked?pt.add(s):pt.delete(s);let r=document.getElementById("sessions-table-container");r&&(r.innerHTML=He(Ne)),ls()}),Jo||(Jo=!0,document.addEventListener("click",()=>{let o=document.getElementById("sessions-columns-menu");o&&(o.style.display="none")})))}function ms(){let t=document.getElementById("sessions-lookback");t&&(t.value=$,t.addEventListener("change",()=>{let e=t.value;$=e==="7"||e==="30"?e:"today",_e()}),$!=="today"&&!ct[$]&&_e())}function _e(){let t=document.getElementById("sessions-panel-body");if(!t)return;if($==="today"){t.innerHTML=Me(Re);return}let e=ct[$];if(e){t.innerHTML=Me(e);return}t.innerHTML=`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for the last ${$} days\u2026</div>`,f.postMessage({command:"loadRecentSessions",days:Number($)})}function bs(t){let e=Number(t.days);if(e!==7&&e!==30)return;let o=Array.isArray(t.sessions)?t.sessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"):[];ct[String(e)]=o,$===String(e)&&_e()}function H(t,e){let o={...t};for(let n of e)n in o||(o[n]=0);return o}function v(t){let e=Number(t);return Number.isFinite(e)?e:0}function fs(t){let e=t&&typeof t=="object"?t:{};return{ask:v(e.ask),edit:v(e.edit),agent:v(e.agent),plan:v(e.plan),customAgent:v(e.customAgent),cli:v(e.cli)}}function hs(t){let e=t&&typeof t=="object"?t:{};return{file:v(e.file),selection:v(e.selection),implicitSelection:v(e.implicitSelection),symbol:v(e.symbol),codebase:v(e.codebase),workspace:v(e.workspace),terminal:v(e.terminal),vscode:v(e.vscode),terminalLastCommand:v(e.terminalLastCommand),terminalSelection:v(e.terminalSelection),clipboard:v(e.clipboard),changes:v(e.changes),outputPanel:v(e.outputPanel),problemsPanel:v(e.problemsPanel),pullRequest:v(e.pullRequest),byKind:e.byKind??{},copilotInstructions:v(e.copilotInstructions),agentsMd:v(e.agentsMd),byPath:e.byPath??{}}}function Gt(t){let e=t&&typeof t=="object"?t:{},o=e.toolCalls&&typeof e.toolCalls=="object"?e.toolCalls:{},n=e.mcpTools&&typeof e.mcpTools=="object"?e.mcpTools:{};return{sessions:v(e.sessions),modeUsage:fs(e.modeUsage),contextReferences:hs(e.contextReferences),toolCalls:{total:v(o.total),byTool:o.byTool??{}},mcpTools:{total:v(n.total),byServer:n.byServer??{},byTool:n.byTool??{}},modelSwitching:{modelsPerSession:[],totalSessions:0,averageModelsPerSession:0,maxModelsPerSession:0,minModelsPerSession:0,switchingFrequency:0,standardModels:[],premiumModels:[],unknownModels:[],mixedTierSessions:0,lowCostModels:[],mediumCostModels:[],highCostModels:[],mixedCostSessions:0,standardRequests:0,premiumRequests:0,lowCostRequests:0,mediumCostRequests:0,highCostRequests:0,unknownRequests:0,totalRequests:0,...e.modelSwitching??{}},thinkingEffortUsage:e.thinkingEffortUsage}}function on(t){return t.filter(e=>e&&typeof e=="object"&&typeof e.id=="string").map(e=>({id:String(e.id),category:typeof e.category=="string"?e.category:"general",severity:["tip","opportunity","celebration"].includes(e.severity)?e.severity:"tip",title:typeof e.title=="string"?e.title:"",body:typeof e.body=="string"?e.body:"",actionLabel:typeof e.actionLabel=="string"?e.actionLabel:void 0,actionCommand:typeof e.actionCommand=="string"?e.actionCommand:void 0,status:["new","seen","dismissed","snoozed","done"].includes(e.status)?e.status:"new",allowToast:!!e.allowToast}))}function ys(t){if(!t||typeof t!="object")return null;let e=t;return{windowDays:typeof e.windowDays=="number"?e.windowDays:30,availableTools:Array.isArray(e.availableTools)?e.availableTools:[],usedTools:Array.isArray(e.usedTools)?e.usedTools:[],unusedTools:Array.isArray(e.unusedTools)?e.unusedTools:[],underusedMcpServers:Array.isArray(e.underusedMcpServers)?e.underusedMcpServers:[],underusedAgentPlugins:Array.isArray(e.underusedAgentPlugins)?e.underusedAgentPlugins:[],estimatedPromptBloat:e.estimatedPromptBloat&&typeof e.estimatedPromptBloat=="object"?e.estimatedPromptBloat:{totalTokens:0,byServer:{}},recommendations:Array.isArray(e.recommendations)?e.recommendations:[]}}function vs(t){if(!t||typeof t!="object")return tt("sanitize-invalid-root","sanitizeStats.invalidRoot"),null;try{let e={today:Gt(t.today),last30Days:Gt(t.last30Days),month:Gt(t.month),lastMonth:Gt(t.lastMonth),lastUpdated:typeof t.lastUpdated=="string"?t.lastUpdated:"",backendConfigured:!!t.backendConfigured,locale:typeof t.locale=="string"?t.locale:void 0,currentWorkspacePaths:Array.isArray(t.currentWorkspacePaths)?t.currentWorkspacePaths.filter(s=>typeof s=="string"):void 0,suppressedUnknownTools:Array.isArray(t.suppressedUnknownTools)?t.suppressedUnknownTools.filter(s=>typeof s=="string"):void 0},o=Je(t.customizationMatrix);o&&(e.customizationMatrix=o),Array.isArray(t.missedPotential)&&(e.missedPotential=t.missedPotential.filter(s=>s&&typeof s=="object"&&typeof s.workspacePath=="string")),Array.isArray(t.todaySessions)&&(e.todaySessions=t.todaySessions.filter(s=>s&&typeof s=="object"&&typeof s.interactions=="number")),Array.isArray(t.insights)&&(e.insights=on(t.insights));let n=ys(t.curationAnalysis);return n?(e.curationAnalysis=n,U("sanitizeStats.curation.present",{availableTools:n.availableTools.length,unusedTools:n.unusedTools.length,unusedServers:n.underusedMcpServers.filter(s=>s&&s.usedToolCount===0).length})):tt("sanitize-no-curation","sanitizeStats.curation.missing"),e}catch(e){return tt("sanitize-error","sanitizeStats.error",{error:e instanceof Error?e.message:String(e)}),null}}function xs(){let t=document.querySelectorAll(".tab-button");t.forEach(e=>{e.addEventListener("click",()=>{let o=e.getAttribute("data-tab");if(!o)return;A=o,t.forEach(s=>s.classList.toggle("active",s.getAttribute("data-tab")===o)),document.querySelectorAll(".tab-panel").forEach(s=>{s.style.display="none"});let n=document.getElementById(`tab-panel-${o}`);n&&(n.style.display="block"),o==="repos"&&!Ae&&(Ae=!0,f.postMessage({command:"loadRepoPrStats"})),o==="agent"&&!Ee&&(Ee=!0,f.postMessage({command:"loadAgentSessions"})),o==="insights"&&Pe.filter(s=>s.status==="new").forEach(s=>f.postMessage({command:"insightAction",id:s.id,action:"seen"}))})})}function _(t){let e=Number(t);return Number.isFinite(e)&&e>=0?e:0}function ze(t){let e=typeof t=="string"?t.trim():"";try{let o=new URL(e);if(o.protocol==="http:"||o.protocol==="https:")return o.toString()}catch{}return"#"}function ks(t){let e=t&&typeof t=="object"?t:{},o=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"||typeof e.since=="number"?e.since:Date.now(),repos:o.map(n=>{let s=n&&typeof n=="object"?n:{},r=Array.isArray(s.aiDetails)?s.aiDetails:[];return{repoUrl:ze(s.repoUrl),owner:c(typeof s.owner=="string"?s.owner:""),repo:c(typeof s.repo=="string"?s.repo:""),error:typeof s.error=="string"?c(s.error):"",totalPrs:_(s.totalPrs),aiAuthoredPrs:_(s.aiAuthoredPrs),aiReviewRequestedPrs:_(s.aiReviewRequestedPrs),aiDetails:r.map(i=>{let a=i&&typeof i=="object"?i:{},l=["copilot","claude","openai","other-ai"],p=["author","reviewer-requested"],d=l.includes(a.aiType)?a.aiType:"other-ai",u=p.includes(a.role)?a.role:"author";return{number:_(a.number),title:c(typeof a.title=="string"?a.title:""),url:ze(a.url),aiType:d,role:u}})}})}}function ws(t){let e=c(new Date(t.since).toLocaleDateString());if(!t.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;if(t.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let o={copilot:"\u{1F916} Copilot",claude:"\u{1F9E0} Claude",openai:"\u2728 Codex","other-ai":"\u{1F916} AI"},n="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",s=`${n} text-align: center;`,r=t.repos.map(i=>{let a=`<a href="${c(i.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${c(i.owner)}/${c(i.repo)}</a>`;if(i.error)return`<tr>
				<td style="${n} font-family:'Courier New',monospace; font-size:12px;">${a}</td>
				<td colspan="3" style="${n} color:var(--text-secondary); font-style:italic; font-size:12px;">${c(i.error)}</td>
			</tr>`;let l="";if(i.aiDetails.length>0){let p=i.aiDetails.map(d=>`<li><a href="${c(d.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${d.number} ${c(d.title)}</a> \u2014 ${o[d.aiType]??c(String(d.aiType))} (${d.role==="author"?"authored":"review requested"})</li>`).join("");l=`
				<details style="margin-top:4px; font-size:11px;">
					<summary style="cursor:pointer; color:var(--text-secondary);">Show ${i.aiDetails.length} detail(s)</summary>
					<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${p}</ul>
				</details>`}return`<tr>
			<td style="${n} font-family:'Courier New',monospace; font-size:12px;">${a}${l}</td>
			<td style="${s} font-weight:600;">${i.totalPrs}</td>
			<td style="${s}">${i.aiAuthoredPrs>0?`<span style="font-weight:600;">${i.aiAuthoredPrs}</span>`:"0"}</td>
			<td style="${s}">${i.aiReviewRequestedPrs>0?`<span style="font-weight:600;">${i.aiReviewRequestedPrs}</span>`:"0"}</td>
		</tr>`}).join("");return`
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing PRs created since ${e}.
			Reviewer requests are only visible for <strong>open</strong> PRs \u2014 the GitHub API clears this field after a PR is merged or closed.
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">\u{1F4C2} Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">PRs</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs where the PR author's GitHub login matches a known AI agent (e.g. copilot-swe-agent, claude-code-action, openai-code-agent)">\u{1F916} Cloud Agent Authored</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Open PRs where an AI agent was listed as a requested reviewer">\u{1F441} Copilot Review Agent requested\u2020</th>
					</tr>
				</thead>
				<tbody>
					${r}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2020 Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			\u{1F916} Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`}function Cs(t){let e=t&&typeof t=="object"?t:{},o=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"?c(e.since):new Date(Date.now()-720*60*60*1e3).toISOString(),fetchedAt:typeof e.fetchedAt=="string"?e.fetchedAt:"",totalTasks:_(e.totalTasks),totalSessions:_(e.totalSessions),totalCredits:_(e.totalCredits),repos:o.map(n=>{let s=n&&typeof n=="object"?n:{},r=c(typeof s.owner=="string"?s.owner:""),i=c(typeof s.repo=="string"?s.repo:"");return{owner:r,repo:i,repoUrl:ze(`https://github.com/${r}/${i}`),totalTasks:_(s.totalTasks),totalSessions:_(s.totalSessions),totalCredits:_(s.totalCredits),tasksScanned:_(s.tasksScanned),tasksTotal:_(s.tasksTotal),partial:!!s.partial,error:typeof s.error=="string"?c(s.error):void 0}})}}function nn(t){let e=document.querySelector("#repos-pr-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${ws(t)}
	`)}function Ts(t,e,o){return t.repos.map(n=>{let s=`<a href="${n.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${n.owner}/${n.repo}</a>`;if(n.error)return`<tr>
        <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${s}</td>
        <td colspan="3" style="${e} color:var(--text-secondary); font-style:italic; font-size:12px;">${n.error}</td>
      </tr>`;let r=n.partial?` <span title="Showing ${n.tasksScanned} of ${n.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${n.tasksScanned}/${n.tasksTotal} tasks scanned)</span>`:"";return`<tr>
      <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${s}${r}</td>
      <td style="${o} font-weight:600;">${n.totalTasks}</td>
      <td style="${o} font-weight:600;">${n.totalSessions}</td>
      <td style="${o}">${n.totalCredits>0?n.totalCredits.toFixed(1):"\u2014"}</td>
    </tr>`}).join("")}function Ss(t){if(!t.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;if(t.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let e=new Date(t.since).toLocaleDateString(),o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,s=t.repos.reduce((a,l)=>(l.error||(a.tasks+=l.totalTasks,a.sessions+=l.totalSessions,a.credits+=l.totalCredits),a),{tasks:0,sessions:0,credits:0}),r=t.repos.some(a=>a.partial&&!a.error),i=Ts(t,o,n);return`
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${s.credits>0?s.credits.toFixed(1):"\u2014"}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${e} to now.
			${r?"<strong>Note:</strong> Some repos were capped at 50 tasks \u2014 totals may be lower bounds. ":""}
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
			\u2139\uFE0F <strong>Action minutes</strong> (GitHub Actions compute used by the agent) are not shown here \u2014 they require additional per-branch API calls.
		</div>`}function sn(t){let e=document.querySelector("#agent-sessions-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${Ss(t)}
	`)}function $s(t){if(!t||!t.workspaces||t.workspaces.length===0)return`
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;let e=t.workspaces.map(o=>{let n=o.typeStatuses??{},s=Object.values(n).every(i=>i==="\u274C"),r=(t.customizationTypes??[]).map(i=>{let a=n[i.id]||"\u2753";return`
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${z(a,a==="\u2705"?"Present and fresh":a==="\u26A0\uFE0F"?"Present but stale":a==="\u274C"?"Missing":"Status unknown")}
				</td>`}).join("");return`
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${c(o.workspaceName)}${s?` <span style="font-family: sans-serif; vertical-align: middle;">${z("\u26A0\uFE0F","No customization files")}</span>`:""}
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
				Showing ${t.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${t.workspacesWithIssues>0?`<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${z("\u26A0\uFE0F")} ${t.workspacesWithIssues} workspace(s) have no customization files.</span>`:`<span style="display:inline-flex;align-items:center;gap:4px;">${z("\u2705")} All workspaces have up-to-date customizations.</span>`}
			</div>
			<div class="customization-matrix-container">
				<table class="customization-matrix">
					<thead>
						<tr>
							<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">\u{1F4C2} Workspace</th>
							<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Sessions</th>
							${(t.customizationTypes??[]).map(o=>`
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${c(o.label)}">
									${c(o.icon)}
								</th>
							`).join("")}
						</tr>
					</thead>
					<tbody>
						${e}
					</tbody>
				</table>
			</div>
			<div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
				<div style="display: flex; gap: 16px; flex-wrap: wrap;">
					${(t.customizationTypes??[]).map(o=>`
						<span>${c(o.icon)} ${c(o.label)}</span>
					`).join("")}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${z("\u2705")} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${z("\u26A0\uFE0F")} = Present but Stale</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${z("\u274C")} = Missing</span>
				</div>
			</div>
		</div>`}function As(t){let e=t.last30Days.modelSwitching,o=t.today.modelSwitching;if((e.totalRequests??0)===0&&(o.totalRequests??0)===0)return"";function n(s){let r=s.totalRequests??0;if(r===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let a=[{label:"\u{1F49A} Low cost",count:s.lowCostRequests??0,color:"#4ade80"},{label:"\u{1F535} Medium cost",count:s.mediumCostRequests??0,color:"var(--link-color)"},{label:"\u{1F4B8} High cost",count:s.highCostRequests??0,color:"var(--warning-fg)"},{label:"\u2753 Unknown",count:s.unknownRequests??0,color:"var(--text-muted)"}].filter(p=>p.count>0).map(p=>{let d=r>0?Math.round(p.count/r*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${p.color};">${p.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${d}%; background: ${p.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${g(p.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${d}%)</span></span>
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
					${n(e)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${n(t.month.modelSwitching)}
				</div>
			</div>
		</div>`}function Es(t){return t.last30Days.thinkingEffortUsage||t.today.thinkingEffortUsage||t.month.thinkingEffortUsage?`
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Te(t.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Te(t.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Te(t.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`:""}function Te(t){let e=["minimal","low","medium","high","max","xhigh"];if(!t||t.sessionCount===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.values(t.byEffort).reduce((s,r)=>s+r,0);return`
		${e.filter(s=>t.byEffort[s]>0).concat(Object.keys(t.byEffort).filter(s=>!e.includes(s)&&t.byEffort[s]>0)).map(s=>{let r=t.byEffort[s]||0,i=o>0?Math.round(r/o*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${c(Yn(s))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${i}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${r} <span style="color: var(--text-secondary); font-weight: 400;">(${i}%)</span></span>
			</div>`}).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${t.sessionCount} session${t.sessionCount!==1?"s":""} \xB7 ${t.switchCount} effort switch${t.switchCount!==1?"es":""}</div>
	`}function Rs(t){return{allToolKeys:[...new Set([...Object.keys(t.today.toolCalls.byTool),...Object.keys(t.last30Days.toolCalls.byTool),...Object.keys(t.month.toolCalls.byTool)])].sort(),allMcpToolKeys:[...new Set([...Object.keys(t.today.mcpTools.byTool),...Object.keys(t.last30Days.mcpTools.byTool),...Object.keys(t.month.mcpTools.byTool)])].sort(),allMcpServerKeys:[...new Set([...Object.keys(t.today.mcpTools.byServer),...Object.keys(t.last30Days.mcpTools.byServer),...Object.keys(t.month.mcpTools.byServer)])].sort(),allStandardModels:[...new Set([...t.today.modelSwitching.standardModels,...t.last30Days.modelSwitching.standardModels,...t.month.modelSwitching.standardModels])].sort(),allHighCostModels:[...new Set([...t.today.modelSwitching.highCostModels,...t.last30Days.modelSwitching.highCostModels,...t.month.modelSwitching.highCostModels])].sort(),allLowCostModels:[...new Set([...t.today.modelSwitching.lowCostModels,...t.last30Days.modelSwitching.lowCostModels,...t.month.modelSwitching.lowCostModels])].sort(),allMediumCostModels:[...new Set([...t.today.modelSwitching.mediumCostModels,...t.last30Days.modelSwitching.mediumCostModels,...t.month.modelSwitching.mediumCostModels])].sort(),allUnknownModels:[...new Set([...t.today.modelSwitching.unknownModels,...t.last30Days.modelSwitching.unknownModels,...t.month.modelSwitching.unknownModels])].sort()}}function Ms(t,e){return`
		<div id="tab-panel-health" class="tab-panel"${A!=="health"?' style="display:none"':""}>
			${t}
			${as(e)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					\u{1F3D7}\uFE0F Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${P&&P.workspaces&&P.workspaces.length>0?`
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;">Analyze All Repositories (${P.workspaces.length})</vscode-button>
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
					<vscode-button id="btn-analyse-repo">Analyze Repo for Best Practices</vscode-button>
					<div id="repo-analysis-results" class="repo-hygiene-results" style="margin-top: 12px;"></div>
				`}
			</div>
		</div>`}function _s(t,e,o){return`
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${gr(t)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.today.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${N(H(t.today.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.last30Days.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${N(H(t.last30Days.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.month.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${N(H(t.month.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${N(H(t.today.mcpTools.byTool,e),10,we)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${N(H(t.last30Days.mcpTools.byTool,e),10,we)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${N(H(t.month.mcpTools.byTool,e),10,we)}</div></div>
						</div>
					`:""}
				</div>
			</div>
		</div>`}function zs(t,e,o){let n=t.length-e.length,s=e.length>0?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",r=e.length>0?"rgba(251,191,36,0.4)":"rgba(74,222,128,0.4)",i=e.length>0?"#fbbf24":"#4ade80",a=o.totalTokens,l=o.byServer.skill??0,p=o.byServer.builtin??0,d=a-l-p,u=C=>C>=1e3?`~${Math.round(C/1e3)}K`:`~${C}`,h=d+l,k=[];return d>0&&k.push(`${u(d)} MCP`),l>0&&k.push(`${u(l)} skills`),`<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${g(t.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${g(n)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${s}; border:1px solid ${r}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:${i};">${g(e.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Unused</div>
		</div>
		${h>0?`<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center;" title="Overhead you can reduce by disabling unused MCP servers or removing unused skills">
			<div style="font-size:20px; font-weight:700; color:#f87171;">${u(h)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Actionable overhead</div>
			${k.length>0?`<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${c(k.join(" + "))}</div>`:""}
		</div>`:""}
		${p>0?`<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center; opacity:0.7;" title="Overhead from VS Code built-in tools \u2014 cannot be disabled">
			<div style="font-size:20px; font-weight:700; color:var(--text-secondary);">${u(p)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Built-in overhead</div>
			<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">not actionable</div>
		</div>`:""}
	</div>`}function Ps(t){if(t.extensionId)return"Extension";if(!t.configFiles||t.configFiles.length===0)return"Settings";let e=new Set;for(let o of t.configFiles){let n=o.replace(/\\/g,"/");n.includes("/.vscode/")?e.add("Workspace"):n.includes("/.vs/")?e.add("Workspace (VS)"):n.includes("/.cursor/")?e.add("Workspace (Cursor)"):n.endsWith("/.mcp.json")?e.add(n.split("/").slice(-2).join("/")):e.add("Config file")}return[...e].join(", ")}function Is(t,e){return t.configFiles&&t.configFiles.length===1?` <button class="curation-file-btn" data-command="openFile" data-path="${c(t.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(t.configFiles[0])}">open</button>`:t.configFiles&&t.configFiles.length>1?` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(t.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(e)}">open</button>`:t.extensionId?` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(t.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${c(t.extensionId)}">open</button>`:' <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>'}function Ls(t){return t.extensionId?`<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(t.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${c(t.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`:!t.configFiles||t.configFiles.length===0?'<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>':t.configFiles.length===1?`<button class="curation-file-btn" data-command="openFile" data-path="${c(t.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(t.configFiles[0])}">Change Tools</button>`:`<button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(t.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${t.configFiles.length} config files">Change Tools</button>`}function Bs(t,e){let o=e.byServer[t.server]??0,n=Ps(t),s=t.configFiles?.join(`
`)??t.extensionId??"",r=Is(t,s),i=Ls(t),a=t.availableToolCount===0;return`<tr class="${t.usedToolCount>0?"mcp-has-usage":""}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(t.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${c(s)}">${c(n)}${r}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?'<em style="color:var(--text-secondary)">not connected</em>':t.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?"\u2014":t.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${o>0?`~${o.toLocaleString()} tokens`:"\u2014"}</td>
		<td style="padding:5px 8px; font-size:12px;">${i}</td>
	</tr>`}function Ds(t){let e=[...new Set(t.filter(s=>!s.extensionId).flatMap(s=>s.configFiles??[]))],o=e.find(s=>s.replace(/\\/g,"/").endsWith(".vscode/mcp.json"))??e[0];if(!o)return"<code>.vscode/mcp.json</code>";let n=o.replace(/\\/g,"/").split("/").slice(-3).join("/");return`<button class="curation-file-btn" data-command="openFile" data-path="${c(o)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(o)}">${c(n)}</button>`}function Ns(t,e,o){let n=[...t].sort((l,p)=>{let d=l.usedToolCount===0?0:l.usedToolCount<l.availableToolCount?1:2,u=p.usedToolCount===0?0:p.usedToolCount<p.availableToolCount?1:2;return d!==u?d-u:l.usedToolCount-p.usedToolCount});if(n.length===0)return"";let s=n.map(l=>Bs(l,e)).join(""),r=Ds(n),i=n.filter(l=>l.usedToolCount>0).length,a=n.length-i;return`<details style="margin-top:12px;" open>
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
	</details>`}function Hs(t){if(t.length===0)return"";let e=t.map(o=>{let n=o.configFiles?.[0],s=n?`<button class="curation-file-btn" data-command="openFile" data-path="${c(n)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${c(n)}">View skill</button>`:"\u2014",r="\u2014",i="";o.pluginName?(r=`Plugin: ${o.pluginName}`,i=` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(o.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`):o.skillPath&&(o.skillPath.startsWith(".github/skills")?r="Workspace (.github)":o.skillPath.startsWith(".claude/skills")?r="Workspace (.claude)":o.skillPath.startsWith(".agents/skills")?r="Workspace (.agents)":r="User (~)");let a=Math.round((o.name.length+o.description.length+10)/4);return`<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(o.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(r)}${i}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(o.description)}">${c(o.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${a.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${s}</td>
	</tr>`}).join("");return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F4DA} Unused Skills (${t.length})
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
				<tbody>${e}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Est. overhead is per agent interaction. For plugin skills, click <em>manage</em> to open the agent plugins view where you can uninstall the plugin. For workspace skills, update the description or remove the SKILL.md.</div>
		</div>
	</details>`}function Us(t,e){if(t.length===0)return"";let o=t.map(r=>{let i=`<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(r.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${c(r.pluginName)}">Manage Plugin</button>`;return`<tr class="${r.usedSkillCount===0?"":"plugin-has-usage"}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(r.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${r.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${r.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${i}</td>
		</tr>`}).join(""),n=t.filter(r=>r.usedSkillCount===0).length,s=t.length-n;return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F9E9} Agent Plugins in Last ${e} Days (${t.length})
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
	</details>`}function Os(t,e){if(t.length===0)return"";let o=e.byServer.builtin??0,n=t.map(r=>{let i=Math.round((r.name.length+(r.description?.length??0)+10)/4);return`<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(r.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(r.description??"")}">${c(r.description??"\u2014")}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${i} tokens</td>
		</tr>`}).join(""),s=r=>r>=1e3?`~${Math.round(r/1e3)}K`:`~${r}`;return`<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F527} Built-in VS Code Tools (${t.length}) \u2014 ${s(o)} tokens overhead, not actionable
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
	</details>`}function js(t){try{if(!t||t.availableTools.length===0)return tt("render-hidden-empty","buildCurationSectionHtml.hidden",{hasCurationObject:!!t,availableTools:t?.availableTools?.length??0}),"";let{availableTools:e,unusedTools:o,underusedMcpServers:n,underusedAgentPlugins:s,estimatedPromptBloat:r,windowDays:i}=t,a=o.filter(p=>p.source==="skill"),l=e.filter(p=>p.source==="builtin");return U("buildCurationSectionHtml.render",{availableTools:e.length,unusedTools:o.length,unusedSkills:a.length,mcpServers:n.length}),`
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${i} days)</div>
				${zs(e,o,r)}
				${Ns(n,r,i)}
				${Us(s,i)}
				${Os(l,r)}
				${Hs(a)}
			</div>`}catch(e){return U("buildCurationSectionHtml.error",{error:e instanceof Error?e.message:String(e)}),`
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`}}function Fs(){return`
		<div id="tab-panel-repos" class="tab-panel"${A!=="repos"?' style="display:none"':""}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories \u2014 authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${A!=="agent"?' style="display:none"':""}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>`}function Zt(t){let e={tip:"rgba(96,165,250,0.12)",opportunity:"rgba(251,191,36,0.12)",celebration:"rgba(74,222,128,0.12)"},o={tip:"rgba(96,165,250,0.5)",opportunity:"rgba(251,191,36,0.5)",celebration:"rgba(74,222,128,0.5)"},n={tip:"rgba(96,165,250,0.85)",opportunity:"rgba(251,191,36,0.85)",celebration:"rgba(74,222,128,0.85)"},s=e[t.severity]??e.tip,r=o[t.severity]??o.tip,i=n[t.severity]??n.tip,a=t.status==="new",l=t.status==="done",p=t.actionLabel?`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="execute" data-command="${c(t.actionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${s}; color:var(--text-primary);">${c(t.actionLabel)}</button>`:"",d=l?'<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>':`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${i}; color:#0d1117;">\u2713 Done</button>`,u=l?"":`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>`,h=l?"":`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>`;return`
		<div class="insight-card" data-insight-id="${c(t.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${s}; border:1px solid ${r};
			${a?"box-shadow:0 2px 8px "+s+";":""}
			${l?"opacity:0.45;":""}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${a?`<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${i}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>`:""}
						${c(t.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${c(t.body)}</div>
					${p?`<div style="margin-top:12px;">${p}</div>`:""}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${h}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${r}; padding-top:10px;">
				${d}
				${u}
			</div>
		</div>`}function qs(t){let e=t.filter(i=>i.status!=="dismissed"),o=e.filter(i=>i.status==="new"),n=e.filter(i=>i.status!=="new"&&i.status!=="done"),s=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(Zt).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(Zt).join("")}
		</div>`:"";return`
		<div id="tab-panel-insights" class="tab-panel"${A!=="insights"?' style="display:none"':""}>
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
		</div>`}function Ws(t){let e=document.querySelector('.tab-button[data-tab="insights"]');if(!e)return;let o=t.filter(r=>r.status==="new").length,n=o>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${o}</span>`:"",s='<span class="codicon codicon-lightbulb"></span> Insights';e.innerHTML=s+n}function Ks(t){let e=document.getElementById("insights-container");if(!e)return;Pe=t;let o=t.filter(i=>i.status==="new"),n=t.filter(i=>i.status!=="new"&&i.status!=="dismissed"&&i.status!=="done"),s=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(Zt).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(Zt).join("")}
		</div>`:"";e.innerHTML=s+r,rn(),Ws(t)}function Gs(t){if(t)try{let e=JSON.parse(t);f.postMessage({command:"openFileFromList",paths:e})}catch(e){U("wireCurationButtons.badPathsJson",{error:e instanceof Error?e.message:String(e)})}}function Vs(t){let e=t.getAttribute("data-command");if(e)if(e==="openFile"){let o=t.getAttribute("data-path");o&&f.postMessage({command:"openFile",path:o})}else if(e==="openFileFromList")Gs(t.getAttribute("data-paths"));else if(e==="manageExtension"){let o=t.getAttribute("data-extension-id");o&&f.postMessage({command:"manageExtension",extensionId:o})}else if(e==="openAgentPlugins"){let o=t.getAttribute("data-plugin-name")??"";f.postMessage({command:"openAgentPlugins",pluginName:o})}else f.postMessage({command:e})}function Js(){try{let t=document.getElementById("section-tool-curation");if(!t){tt("wire-no-section","wireCurationButtons.noSection");return}let e=t.querySelectorAll(".curation-file-btn");U("wireCurationButtons.bind",{buttons:e.length}),e.forEach(o=>{o.addEventListener("click",()=>{try{Vs(o)}catch(n){U("wireCurationButtons.clickError",{error:n instanceof Error?n.message:String(n)})}})})}catch(t){U("wireCurationButtons.error",{error:t instanceof Error?t.message:String(t)})}}function rn(){let t=document.getElementById("insights-container");t&&t.querySelectorAll(".insight-action-btn").forEach(e=>{e.addEventListener("click",()=>{let o=e.getAttribute("data-insight-id"),n=e.getAttribute("data-action");if(!(!o||!n))if(n==="execute"){let s=e.getAttribute("data-command");s&&f.postMessage({command:s})}else f.postMessage({command:"insightAction",id:o,action:n})})})}function Ys(t,e,o,n,s,r,i,a,l,p,d,u,h,k){return`
		<style>${We}</style>
		<style>${Ke}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${je("btn-usage",!!t.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!D}" aria-controls="about-info-body">
					<span>\u{1F4CB} About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${D?"\u25B8":"\u25BE"}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${D?' style="display:none"':""}>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${A==="activity"?"active":""}" data-tab="activity"><span class="codicon codicon-pulse"></span> My Activity</button>
				<button class="tab-button ${A==="sessions"?"active":""}" data-tab="sessions"><span class="codicon codicon-history"></span> Recent Sessions</button>
				<button class="tab-button ${A==="tools"?"active":""}" data-tab="tools"><span class="codicon codicon-tools"></span> Tools &amp; Integrations</button>
				<button class="tab-button ${A==="health"?"active":""}" data-tab="health"><span class="codicon codicon-server-environment"></span> Workspace Health</button>
				<button class="tab-button ${A==="repos"?"active":""}" data-tab="repos"><span class="codicon codicon-git-pull-request"></span> Repository PRs</button>
				<button class="tab-button ${A==="agent"?"active":""}" data-tab="agent"><span class="codicon codicon-cloud"></span> Cloud Agent</button>
				<button class="tab-button ${A==="insights"?"active":""}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(t.insights??[]).filter(C=>C.status==="new").length>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(t.insights??[]).filter(C=>C.status==="new").length}</span>`:""}</button>
			</div>

			${Xs(t)}
			${or(t,o,n,s,r,i)}
			${mr(t,a,l,p,d,u,h,k)}
			${Ms(e,t)}
			${Fs()}
			${qs(t.insights??[])}
			<div class="footer">
				Last updated: ${c(new Date(t.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`}function Xs(t){Re=t.todaySessions||[];let e=$==="today"?Re:ct[$],o=e?Me(e):`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for the last ${$} days\u2026</div>`;return`
		<div id="tab-panel-sessions" class="tab-panel"${A!=="sessions"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>\u{1F4CB}</span><span>Recent Sessions</span>
					<select id="sessions-lookback" style="margin-left:auto; font-size:12px; padding:2px 6px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px;">
						<option value="today"${$==="today"?" selected":""}>Today</option>
						<option value="7"${$==="7"?" selected":""}>Last 7 days</option>
						<option value="30"${$==="30"?" selected":""}>Last 30 days</option>
					</select>
					${us()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period \u2014 sorted by number of interactions (most active first).</div>
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${o}
				</div>
			</div>
		</div>`}function Zs(t){let e=S(t.pctAvailable,1),o=S(100-t.pctAvailable,1),n=Math.min(100-t.pctAvailable,100),s=n>90?"var(--error-color, #f14c4c)":n>75?"var(--warning-color, #cca700)":"var(--accent-color, #4d9cf8)";return`
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">GitHub Copilot API (all channels)</div>
			<div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px;">
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(t.usedAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits used</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(t.remainingAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits remaining</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${g(t.budgetAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Monthly budget</div>
				</div>
			</div>
			<div style="margin-bottom:4px; font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
				<span>${o}% used</span><span>${e}% available</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:100%; background:${s}; border-radius:4px; transform-origin:left; transform:scaleX(${S(n/100,4)});"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 \xB7 Budget = $${S(t.budgetUsd,2)}/month
			</div>
		</div>`}function Qs(t){let e=Object.values(t).reduce((n,s)=>n+s,0);return`
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${Object.entries(t).sort(([,n],[,s])=>s-n).map(([n,s])=>`
			<tr>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${c(n)}</td>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${S(s,2)}</td>
			</tr>`).join("")}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${S(e,2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function tr(t,e,o){if(!t)return`
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				\u2139\uFE0F No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions \u2014 it cannot see web chat, cloud agent, or review agent usage.
			</div>`;if(e<=0)return"";let n=t.usedAiCredits*.01,s=n-e,r=Math.round(s*100),i=r>0?`<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${S(s,2)} (${g(r)} credits)</span></div>`:"",a=o>.001?`<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${S(o,2)}</span></div>`:"",l=r>0?'<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">\u2139\uFE0F The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> \u2014 all counted against your AI Credit budget.</div>':'<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">\u2705 Extension-tracked Copilot usage matches the API \u2014 no significant untracked usage from web chat, cloud agent, or review agent.</div>';return`
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${S(n,2)} (${g(t.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${S(e,2)} (${g(Math.round(e*100))} credits)</span></div>
				${i}${a}
			</div>
			${l}
		</div>`}function er(t){let e=t.copilotApiBalance,o=t.monthBillingGroupCosts;if(!e&&(!o||Object.keys(o).length===0))return"";let n=o?.["GitHub Copilot"]??0,r=(o?Object.values(o).reduce((p,d)=>p+d,0):0)-n,i=e?Zs(e):"",a=o&&Object.keys(o).length>0?Qs(o):"",l=tr(e,n,r);return`
		<div class="section">
			<div class="section-title"><span>\u{1F4B3}</span><span>Copilot Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs.</div>
			${i}
			${a}
			${l}
		</div>`}function or(t,e,o,n,s,r){let i=As(t),a=er(t);return`
		<div id="tab-panel-activity" class="tab-panel"${A!=="activity"?' style="display:none"':""}>
			${n}
			${a}
			<!-- Mode Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${Ko(t.today.modeUsage,"\u{1F4C5} Today")}
					${Ko(t.last30Days.modeUsage,"\u{1F4CA} Last 30 Days")}
				</div>
			</div>
			${ur(t,s,r)}
			${e}
			${i}
			${o}
			${dr(t)}
		</div>`}var nr=I("__MODEL_PRICING__"),sr=nr?.pricing??{};function an(t){let e=null;for(let o of t){let n=Ve(o,sr);n&&(!e||n.thresholdTokens<e.thresholdTokens)&&(e={...n,model:o})}return e}function rr(t){let e=t*4/1048576,o=Math.round(t/10/1e3);return`\u2248${S(e,1)} MB of code (~${g(o)}K lines)`}function ir(t,e){let o=t/e.thresholdTokens*100,n=Math.min(o,100),s=o>100?"var(--error-color, #f14c4c)":o>=70?"var(--warning-color, #cca700)":"var(--success-color, #89d185)",r=c(Pt(e.model)),i=`above it, input billing goes $${e.defaultInputCostPerMillion.toFixed(2)} \u2192 $${e.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;return`
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${g(t)} tokens \u2014 ${S(o,0)}% of the ${g(e.thresholdTokens)}-token default tier for ${r}</span>
				<span>${g(e.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${S(n,0)}%; background:${s}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${rr(e.thresholdTokens)}; ${i}.</div>
		</div>`}function Ue(t,e,o,n){return`
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${n?` title="${n}"`:""}>${t}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${e}</div>
			${o?`<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${o}</div>`:""}
		</div>`}function ar(t){if(t.maxRequestInputTokens<=0)return"";let e=an(t.maxRequestModels),o=c(t.maxRequestModels.map(s=>Pt(s)).join(", ")||"\u2014"),n=e?`${S(t.maxRequestInputTokens/e.thresholdTokens*100,0)}% of the ${g(e.thresholdTokens)}-token price line \xB7 ${o}`:`${o} \u2014 no long-context surcharge for ${t.maxRequestModels.length>1?"these models":"this model"}`;return Ue("\u{1F4CF} Largest request",`${g(t.maxRequestInputTokens)} input tokens`,n,"The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period")}function lr(t){if((t.maxReachedTokens??0)<=0)return"";let e=t.maxReachedWindowLimit,o=e?`${g(t.maxReachedTokens)} of ${g(e)} (${S(t.maxReachedTokens/e*100,0)}%)`:g(t.maxReachedTokens);return Ue("\u{1FA9F} Fullest CLI window",o,void 0,"The highest context fill recorded for a Copilot CLI session in this period, versus its window limit")}function Se(t){if(!(!!t&&(t.maxRequestInputTokens>0||(t.maxReachedTokens??0)>0||Object.keys(t.tierCounts).length>0)))return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.entries(t.tierCounts),n=o.reduce((r,[,i])=>r+i,0),s=o.length>0?Ue("\u{1FA9C} Context tiers",o.map(([r,i])=>`${c(r)} \xD7${i}`).join(", "),`${n} Copilot CLI session${n===1?"":"s"} grouped by chosen window size \u2014 "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,"Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier"):"";return ar(t)+lr(t)+s}function dr(t){let e=t.last30Days.contextWindow,o=e&&e.maxRequestInputTokens>0?an(e.maxRequestModels):null,n=e&&o?ir(e.maxRequestInputTokens,o):"";return`
		<div class="section">
			<div class="section-title"><span>\u{1FA9F}</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Se(t.today.contextWindow)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Se(e)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Se(t.lastMonth.contextWindow)}
				</div>
			</div>
			${n}
		</div>`}function Vt(t,e=""){let o=t>0?"":" ctx-ref-zero";return`<td class="${`ctx-ref-num${e?" "+e:""}${o}`}">${t}</td>`}function Yo(t,e,o){let i=[t,e,o],a=Math.max(...i),l=i.map((u,h)=>{let k=2+h*(56/(i.length-1)),C=a===0?18:2+(1-u/a)*16;return`${k.toFixed(1)},${C.toFixed(1)}`}).join(" "),d=a===0?"var(--text-muted)":o>=e&&e>=t?"var(--link-color)":o<=e&&e<=t?"#f87171":"var(--text-secondary)";return`<td class="ctx-ref-spark"><svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><polyline points="${l}" fill="none" stroke="${d}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${i.map((u,h)=>{let k=2+h*(56/(i.length-1)),C=a===0?18:2+(1-u/a)*16;return`<circle cx="${k.toFixed(1)}" cy="${C.toFixed(1)}" r="2" fill="${d}"/>`}).join("")}</svg></td>`}function cr(t,e){return`
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
					${t.slice().sort((n,s)=>s.last30-n.last30).map(n=>`<tr${n.title?` title="${c(n.title)}"`:""}><td class="ctx-ref-name">${n.label}</td>${Vt(n.today,n.today>0?"ctx-ref-today-active":"")}${Vt(n.month)}${Vt(n.lastMonth)}${Vt(n.last30)}${Yo(n.lastMonth,n.month,n.today)}</tr>`).join("")}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${e.today}</td>
						<td class="ctx-ref-num">${e.month}</td>
						<td class="ctx-ref-num">${e.lastMonth}</td>
						<td class="ctx-ref-num">${e.last30}</td>
						<td class="ctx-ref-spark">${Yo(e.lastMonth,e.month,e.today).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,"")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function pr(t,e,o){let n=d=>d||0,s=[{label:"\u{1F4C4} #file",get:d=>d.file},{label:"\u2702\uFE0F #selection",get:d=>d.selection},{label:"\u2728 Implicit Selection",title:"Text selected in your editor providing passive context to Copilot",get:d=>d.implicitSelection},{label:"\u{1F524} #symbol",get:d=>d.symbol},{label:"\u{1F5C2}\uFE0F #codebase",get:d=>d.codebase},{label:"\u{1F4C1} @workspace",get:d=>d.workspace},{label:"\u{1F4BB} @terminal",get:d=>d.terminal},{label:"\u{1F527} @vscode",get:d=>d.vscode},{label:"\u2328\uFE0F #terminalLastCommand",title:"Last command run in the terminal",get:d=>n(d.terminalLastCommand)},{label:"\u{1F5B1}\uFE0F #terminalSelection",title:"Selected terminal output",get:d=>n(d.terminalSelection)},{label:"\u{1F4CB} #clipboard",title:"Clipboard contents",get:d=>n(d.clipboard)},{label:"\u{1F4DD} #changes",title:"Uncommitted git changes",get:d=>n(d.changes)},{label:"\u{1F4E4} #outputPanel",title:"Output panel contents",get:d=>n(d.outputPanel)},{label:"\u26A0\uFE0F #problemsPanel",title:"Problems panel contents",get:d=>n(d.problemsPanel)},{label:"\u{1F500} #pr",title:"Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary",get:d=>n(d.pullRequest)},{label:"\u{1F4F7} Images",title:"Pasted images and vision context detected in session logs",get:d=>n(d.byKind["copilot.image"])},{label:"\u{1F4CB} Prompt Files",title:".github/prompts/ prompt file uses detected in session logs",get:d=>n(d.byKind.promptFile)},{label:"\u{1F4D0} Code Lines",title:"Total lines of code referenced via #file: range selections",get:d=>n(d.codeContextLines)},{label:"\u{1F3AF} Custom Prompts",title:"Custom /command prompt uses detected in session logs",get:d=>n(d.byKind.prompt)},{label:"\u{1F4CB} Copilot Instructions",title:"copilot-instructions.md file references detected in session logs",get:d=>d.copilotInstructions},{label:"\u{1F916} Agents.md",title:"agents.md file references detected in session logs",get:d=>d.agentsMd}],r=t.last30Days.contextReferences,i=t.month.contextReferences,a=t.lastMonth.contextReferences,l=t.today.contextReferences,p=s.map(d=>({label:d.label,title:d.title,last30:d.get(r),month:d.get(i),lastMonth:d.get(a),today:d.get(l)}));return cr(p,{last30:o,month:ut(i),lastMonth:ut(a),today:e})}function ur(t,e,o){let n=Object.keys(t.last30Days.contextReferences.byKind).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(t.last30Days.contextReferences.byKind).sort(([,r],[,i])=>i-r).slice(0,5).map(([r,i])=>`<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${c(r)}:</span> ${i}</div>`).join("")}
			</div>
		</div>
	`:"",s=Object.keys(t.last30Days.contextReferences.byPath).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(t.last30Days.contextReferences.byPath).sort(([,r],[,i])=>i-r).slice(0,10).map(([r,i])=>`<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${i}\xD7</span> ${c(r)}</div>`).join("")}
			</div>
		</div>
	`:"";return`
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${pr(t,e,o)}
			${n}
			${s}
		</div>`}function gr(t){let e=Qn(t);if(e.length===0)return"";let o=ts(e);return`
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${e.map(s=>{let r=(t.today.toolCalls.byTool[s]||0)+(t.today.mcpTools.byTool[s]||0),i=(t.last30Days.toolCalls.byTool[s]||0)+(t.last30Days.mcpTools.byTool[s]||0),a=(t.month.toolCalls.byTool[s]||0)+(t.month.mcpTools.byTool[s]||0),l=[];r>0&&l.push(`${r} today`),i>r&&l.push(`${i} in the last 30d`),a>i&&l.push(`${a} this month`);let p=l.length>0?`<span style="color:var(--text-muted);"> (${l.join(" | ")})</span>`:"",d=`<button data-suppress-tool="${c(s)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${c(s)}">\u{1F507}</button>`;return`<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${c(s)}${p}${d}</span>`}).join(" ")}
			</div>
			<a href="${c(o)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`}function mr(t,e,o,n,s,r,i,a){return`
		<div id="tab-panel-tools" class="tab-panel"${A!=="tools"?' style="display:none"':""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(t.today.toolCalls.total)}</div>
						${N(H(t.today.toolCalls.byTool,e),10)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(t.last30Days.toolCalls.total)}</div>
							${N(H(t.last30Days.toolCalls.byTool,e),10)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(t.month.toolCalls.total)}</div>
							${N(H(t.month.toolCalls.byTool,e),10)}
						</div>
					</div>
				</div>
			</div>

			${_s(t,o,n)}
			${js(Yt??t.curationAnalysis)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${Ce("\u{1F4C5} Today",t.today.modelSwitching,r,i,s,a)}
					${Ce("\u{1F4C6} Last 30 Days",t.last30Days.modelSwitching,r,i,s,a)}
					${Ce("\u{1F4C5} Previous Month",t.month.modelSwitching,r,i,s,a)}
				</div>
			</div>
		</div>`}function ln(t){let e=document.getElementById("root");if(!e)return;let o=t.customizationMatrix??W?.customizationMatrix??null;P=o??null,(!P||P.workspaces.length===0)&&(E=null),Array.isArray(t.currentWorkspacePaths)&&(Xo=t.currentWorkspacePaths),t.curationAnalysis?(Yt=t.curationAnalysis,U("renderLayout.curation.cached",{availableTools:Yt.availableTools.length,unusedTools:Yt.unusedTools.length})):tt("render-no-curation-update","renderLayout.curation.notProvidedInUpdate");let n=$s(o),s=Rs(t),r=ut(t.today.contextReferences),i=ut(t.last30Days.contextReferences),a=Es(t),l=`
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${g(t.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${g(t.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${g(t.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${g(t.lastMonth.sessions)}</div></div>
			</div>
		</div>`;e.innerHTML=Ys(t,n,"",a,l,r,i,s.allToolKeys,s.allMcpToolKeys,s.allMcpServerKeys,s.allHighCostModels,s.allLowCostModels,s.allMediumCostModels,s.allUnknownModels),fr(),br(),hr(),Js(),K(),xs(),yr(),Pe=t.insights??[],rn()}function br(){let t=document.getElementById("about-info-toggle"),e=document.getElementById("about-info-body");if(!t||!e)return;let o=t.querySelector(".info-box-chevron"),n=()=>{D=!D,e.style.display=D?"none":"",t.setAttribute("aria-expanded",String(!D)),o&&(o.textContent=D?"\u25B8":"\u25BE"),f.setState({...f.getState()??{},aboutCollapsed:D})};t.addEventListener("click",n),t.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),n())})}function fr(){document.getElementById("btn-refresh")?.addEventListener("click",()=>{f.postMessage({command:"refresh"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{f.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{f.postMessage({command:"showChart"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{f.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{f.postMessage({command:"showMaturity"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{f.postMessage({command:"showDashboard"})}),document.getElementById("btn-environmental")?.addEventListener("click",()=>{f.postMessage({command:"showEnvironmental"})}),qe(f)}function hr(){document.getElementById("btn-analyse-repo")?.addEventListener("click",()=>{let t=document.getElementById("btn-analyse-repo");t&&(t.disabled=!0,t.textContent="Analyzing..."),f.postMessage({command:"analyseRepository"})}),document.getElementById("btn-analyse-all")?.addEventListener("click",()=>{let t=document.getElementById("btn-analyse-all");t&&(t.disabled=!0,t.textContent="Analyzing All..."),_t=!0,et=!0,E=null,K(),f.postMessage({command:"analyseAllRepositories"})}),document.getElementById("repo-list-pane")?.addEventListener("click",t=>{let o=t.target.closest(".btn-repo-action");if(!o)return;let n=o.getAttribute("data-workspace-path"),s=o.getAttribute("data-action");if(!(!n||!s)){if(s==="details"){E=n,et=!1,K();return}s==="analyze"&&(o.disabled=!0,o.textContent="Analyzing...",_t=!1,f.postMessage({command:"analyseRepository",workspacePath:n}))}}),document.getElementById("repo-details-pane")?.addEventListener("click",t=>{t.target.closest("#btn-switch-repository")&&(et=!0,K())})}function yr(){Array.from(document.getElementsByClassName("cf-copy")).forEach(t=>{t.addEventListener("click",e=>{let o=e.currentTarget,n=o.getAttribute("data-path")||"";navigator.clipboard&&n&&navigator.clipboard.writeText(n).then(()=>{o.textContent="Copied",setTimeout(()=>{o.textContent="Copy"},1200)}).catch(()=>{f.postMessage({command:"copyFailed",path:n})})})})}function vr(t){$e(),t.data?.locale&&te(t.data.locale),typeof t.data?.use24HourTime=="boolean"&&(Xt=t.data.use24HourTime);let e=vs(t.data);e?(Le=!1,delete ct[7],delete ct[30],ln(e),en(),K(),At&&nn(At),Et&&sn(Et)):(tt("update-invalid-sanitized","handleUpdateStats.sanitizeReturnedNull"),Zo("Received invalid data from the extension. Try refreshing."))}function dn(t){if(!t)return;let e=document.getElementById("unknown-mcp-tools-section");e&&(e.querySelectorAll("button[data-suppress-tool]").forEach(o=>{o.getAttribute("data-suppress-tool")===t&&o.closest("span")?.remove()}),e.querySelectorAll("button[data-suppress-tool]").length===0&&e.remove())}function xr(){A="tools",document.querySelectorAll(".tab-button").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-tab")==="tools")}),document.querySelectorAll(".tab-panel").forEach(o=>{o.style.display="none"});let t=document.getElementById("tab-panel-tools");t&&(t.style.display="block");let e=document.getElementById("unknown-mcp-tools-section");e&&(e.scrollIntoView({behavior:"smooth",block:"center"}),e.style.transition="box-shadow 0.3s ease",e.style.boxShadow="0 0 0 3px var(--vscode-focusBorder)",setTimeout(()=>{e.style.boxShadow=""},2e3))}function kr(t){At=ks(t),At.authenticated||(Ae=!1),nn(At)}function wr(t){!t||typeof t!="object"||(Et=Cs(t),Et.authenticated||(Ee=!1),sn(Et))}function Cr(t){if(!Array.isArray(t))return;let e=on(t);Ks(e)}function Tr(t){switch(t.command){case"usageLoadingProgress":return Vn(t),!0;case"usageRefreshing":return $e(),$t=0,Ie("Refreshing Usage Analysis"),!0;case"updateStatsError":return $e(),Zo("Failed to calculate usage analysis. Check the Output panel for details."),!0}return!1}function Sr(t){if(!Tr(t))switch(t.command){case"repoAnalysisResults":Or(t.data,t.workspacePath);break;case"repoAnalysisError":jr(t.error,t.workspacePath);break;case"repoAnalysisBatchComplete":Fr();break;case"updateStats":vr(t);break;case"toolSuppressed":dn(t.toolName);break;case"highlightUnknownTools":xr();break;case"repoPrStatsLoaded":kr(t.data);break;case"repoPrStatsProgress":Go("#repos-pr-content","repos-pr-progress","Fetching PRs\u2026",t.done,t.total);break;case"agentSessionsLoaded":wr(t.data);break;case"recentSessionsLoaded":bs(t);break;case"agentSessionsProgress":Go("#agent-sessions-content","agent-sessions-progress","Fetching agent sessions\u2026",t.done,t.total);break;case"updateInsights":Cr(t.insights);break;case"switchTab":$r(t);break}}function $r(t){if(document.querySelector(`.tab-button[data-tab="${String(t.tab)}"]`)?.click(),t.anchor){let o=document.getElementById(String(t.anchor));o&&setTimeout(()=>o.scrollIntoView({behavior:"smooth",block:"start"}),50)}}Ge(t=>{Sr(t)});function Ar(t){return P?.workspaces.find(o=>o.workspacePath===t)?.workspaceName||t}function Er(t){let e=zt.get(t);if(e?.data?.summary){let o=G(e.data.summary.percentage);return`${Math.round(o)}%`}return e?.error?"Error":"\u2014"}function G(t){let e=typeof t=="number"?t:Number(t);return Number.isFinite(e)?e:0}var Rr={"git-repo":"https://docs.github.com/en/get-started/using-git/about-git",gitignore:"https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files","env-example":"https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",editorconfig:"https://editorconfig.org/",linter:"https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",formatter:"https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide","type-safety":"https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries","commit-messages":"https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits","conventional-commits":"https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets","ci-config":"https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",scripts:"https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs","task-runner":"https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",devcontainer:"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",dockerfile:"https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry","version-pinning":"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",license:"https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"},Mr={versionControl:"\u{1F504} Version Control",codeQuality:"\u2728 Code Quality",cicd:"\u{1F680} CI/CD",environment:"\u{1F527} Environment",documentation:"\u{1F4DA} Documentation"};function _r(t){let e=m("div");e.setAttribute("style","display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");let o=m("div");o.setAttribute("style","font-size: 14px; font-weight: 600; color: var(--text-primary);"),o.textContent="\u{1F4CA} Repository Hygiene Score";let n=m("div");return n.setAttribute("style","font-size: 24px; font-weight: 700; color: var(--link-color);"),n.textContent=`${Math.round(G(t.percentage))}%`,e.append(o,n),e}function zr(t){let e=m("div");e.setAttribute("style","display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");let o=[{count:t.passedChecks,label:"Passed",cardStyle:"text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--success-fg);"},{count:t.warningChecks,label:"Warnings",cardStyle:"text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--warning-fg);"},{count:t.failedChecks,label:"Failed",cardStyle:"text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: #ef4444;"}];for(let n of o){let s=m("div");s.setAttribute("style",n.cardStyle);let r=m("div");r.setAttribute("style",n.countStyle),r.textContent=String(G(n.count));let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--text-secondary);"),i.textContent=n.label,s.append(r,i),e.appendChild(s)}return e}function Pr(t){let e=t?.status==="pass"||t?.status==="warning"?t.status:"fail";return{status:e,emoji:e==="pass"?"\u2705":e==="warning"?"\u26A0\uFE0F":"\u274C",color:e==="pass"?"#22c55e":e==="warning"?"#f59e0b":"#ef4444"}}function Ir(t,e){let o=m("div");o.setAttribute("style","flex: 1;");let n=m("div");n.setAttribute("style",`font-size: 12px; font-weight: 600; color: ${e};`),n.textContent=typeof t?.label=="string"?t.label:"";let s=m("div");if(s.setAttribute("style","font-size: 11px; color: var(--text-secondary); margin-top: 2px;"),s.textContent=typeof t?.detail=="string"?t.detail:"",o.append(n,s),typeof t?.hint=="string"&&t.hint.length>0){let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;"),i.textContent=`\u{1F4A1} ${t.hint}`,o.appendChild(i)}let r=Rr[typeof t?.id=="string"?t.id:""];if(r){let i=m("a");i.setAttribute("href",r),i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;"),i.setAttribute("title","View official documentation"),i.textContent="\u{1F4D6} View documentation",o.appendChild(i)}return o}function Lr(t){let{emoji:e,color:o}=Pr(t),n=m("div");n.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");let s=m("span");s.setAttribute("style","flex-shrink: 0; padding-top: 1px;"),s.innerHTML=z(e);let r=m("span");return r.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),r.textContent=`+${G(t?.weight)}`,n.append(s,Ir(t,o),r),n}function Br(t,e,o){let n=m("div");n.setAttribute("style","margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let s=m("div");s.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");let r=m("span");r.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),r.textContent=Mr[t]||t;let i=o?.categories?.[t],a=m("span");a.setAttribute("style","font-size: 11px; color: var(--link-color); font-weight: 600;"),a.textContent=`${Math.round(G(i?.percentage))}%`,s.append(r,a),n.appendChild(s);for(let l of e)n.appendChild(Lr(l));return n}function Dr(t){let e=m("div");e.setAttribute("style","margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let o=m("div");o.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");let n=m("span");n.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),n.textContent="\u{1F4A1} Top Recommendations",o.appendChild(n),e.appendChild(o);for(let s of t.slice(0,5)){let r=s?.priority==="high"||s?.priority==="medium"?s.priority:"low",i=r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#60a5fa",a=m("div");a.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");let l=m("span");l.setAttribute("style",`font-size: 10px; font-weight: 600; color: ${i}; min-width: 50px;`),l.textContent=String(r).toUpperCase();let p=m("div");p.setAttribute("style","flex: 1;");let d=m("div");d.setAttribute("style","font-size: 11px; color: var(--text-primary);"),d.textContent=typeof s?.action=="string"?s.action:"";let u=m("div");u.setAttribute("style","font-size: 10px; color: var(--text-muted); margin-top: 2px;"),u.textContent=typeof s?.impact=="string"?s.impact:"",p.append(d,u);let h=m("span");h.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),h.textContent=`+${G(s?.weight)}`,a.append(l,p,h),e.appendChild(a)}return e}function Nr(t,e){let o=m("div");o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");let n=m("div");n.setAttribute("style","font-size: 11px; color: var(--text-secondary); flex: 1;"),n.textContent="Let Copilot help you fix the identified issues in this repository.";let s=document.createElement("vscode-button");return s.setAttribute("style","min-width: 180px;"),s.textContent="\u{1F916} Ask Copilot to Improve",s.addEventListener("click",()=>{let i=`Please help me improve this repository by addressing the following best practice issues:

${t.map(l=>`- ${l.label}: ${l.detail||""}${l.hint?` (${l.hint})`:""}`).join(`
`)}

For each issue, please provide specific steps or code changes to fix it.`;if(!e||Xo.some(l=>l.toLowerCase()===e.toLowerCase()))f.postMessage({command:"openCopilotChatWithPrompt",prompt:i});else{let l=e.split(/[/\\]/).filter(Boolean).pop()??e;o.replaceChildren(),o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");let p=m("div");p.setAttribute("style","font-size: 11px; color: var(--warning-fg);"),p.textContent=`\u26A0\uFE0F Open "${l}" in VS Code first, then paste this prompt into Copilot Chat:`;let d=m("pre");d.setAttribute("style","font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;"),d.textContent=i;let u=document.createElement("vscode-button");u.setAttribute("appearance","secondary"),u.textContent="\u{1F4CB} Copy prompt",u.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{u.textContent="\u2705 Copied!",setTimeout(()=>{u.textContent="\u{1F4CB} Copy prompt"},2e3)})}),o.append(p,d,u)}}),o.append(n,s),o}function cn(t,e){let o=t?.summary||{},n=Array.isArray(t?.checks)?t.checks:[],s=Array.isArray(t?.recommendations)?[...t.recommendations]:[],r=m("div");r.appendChild(_r(o)),r.appendChild(zr(o));let i=m("div");i.setAttribute("style","font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;"),i.textContent=`Score: ${G(o.totalScore)} / ${G(o.maxScore)} points`,r.appendChild(i);let a={high:1,medium:2,low:3};s.sort((d,u)=>(a[d?.priority]||99)-(a[u?.priority]||99));let l={};for(let d of n){let u=typeof d?.category=="string"&&d.category.length>0?d.category:"other";l[u]||(l[u]=[]),l[u].push(d)}for(let[d,u]of Object.entries(l))r.appendChild(Br(d,u,o));s.length>0&&r.appendChild(Dr(s));let p=n.filter(d=>d?.status==="fail"||d?.status==="warning");return p.length>0&&r.appendChild(Nr(p,e)),r}function Hr(t,e,o){let n={sessions:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",interactions:"width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",score:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"},s=`
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${n.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${n.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${n.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 80px; flex-shrink: 0;"></div>
		</div>
	`;t.innerHTML=s+e.map((r,i)=>{let l=!!zt.get(r.workspacePath)?.data?.summary,p=Er(r.workspacePath),d=l?"Details":"Analyze",u=l?"details":"analyze",h=E===r.workspacePath&&o,k=Number(r.sessionCount)||0,C=Number(r.interactionCount)||0;return`
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${i<e.length-1?"1px solid var(--border-subtle)":"none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c(r.workspacePath)}">
						${c(r.workspaceName)}
					</div>
				</div>
				<div style="${n.sessions}">${k}</div>
				<div style="${n.interactions}">${C}</div>
				<div style="${n.score}">${c(p)}</div>
				<vscode-button class="btn-repo-action" data-action="${u}" data-workspace-path="${c(r.workspacePath)}" ${h?'disabled="true"':""} style="min-width: 80px; flex-shrink: 0;">
					${d}
				</vscode-button>
			</div>
		`}).join("")}function Ur(t,e,o){t.replaceChildren();let n=m("div","repo-details-card");n.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");let s=m("div","repo-details-card-header");s.setAttribute("style","display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");let r=m("div");r.setAttribute("style","font-size: 12px; color: var(--text-secondary);"),r.textContent="Repository: ";let i=m("span");i.setAttribute("style","color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;"),i.textContent=o,r.appendChild(i);let a=document.createElement("vscode-button");a.id="btn-switch-repository",a.setAttribute("style","min-width: 120px;"),a.textContent="Switch Repository",s.append(r,a),n.append(s,cn(e.data,E??void 0)),t.appendChild(n)}function K(){let t=document.getElementById("repo-list-pane"),e=document.getElementById("repo-list-pane-container"),o=document.getElementById("repo-details-pane"),n=document.getElementById("repo-details-pane-container");if(!t||!e||!o||!n||!P)return;let s=!!E&&!et,r=s?P.workspaces.filter(l=>l.workspacePath===E):P.workspaces;if(e.classList.remove("repo-hygiene-pane-collapsed"),n.classList.toggle("repo-hygiene-pane-collapsed",!s),Hr(t,r,s),!s||!E){o.replaceChildren();return}let i=Ar(E),a=zt.get(E);if(a?.data){Ur(o,a,i);return}if(a?.error){o.innerHTML=`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${c(i)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${c(a.error)}</div>
			</div>
		`;return}o.innerHTML=`
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${c(i)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`}function Or(t,e){if(e){zt.set(e,{data:t,error:void 0}),_t||(E=e,et=!1),K();return}let o=document.getElementById("btn-analyse-repo");o&&(o.disabled=!1,o.textContent="Analyze Repo for Best Practices");let n=document.getElementById("repo-analysis-results");if(n){n.replaceChildren();let s=m("div","repo-analysis-card");s.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;"),s.appendChild(cn(t,e)),n.appendChild(s)}}function jr(t,e){if(e){zt.set(e,{data:void 0,error:t}),_t||(E=e,et=!1),K();return}let o=document.getElementById("btn-analyse-repo");o&&(o.disabled=!1,o.textContent="Analyze Repo for Best Practices");let n=document.getElementById("repo-analysis-results");n&&(n.innerHTML=`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${c(t)}</div>
			</div>
		`)}function Fr(){_t=!1,et=!0,E=null,K();let t=document.getElementById("btn-analyse-all");if(t){t.disabled=!1;let o=W?.customizationMatrix?.workspaces?.length||0;t.textContent=`Analyze All Repositories (${o})`}}async function qr(){if(await Promise.resolve().then(()=>(Fo(),jo)),!W){Ie("Loading usage analysis..."),Jt=setTimeout(()=>{let e=document.getElementById("root");if(e&&e.querySelector("#usage-loading-card")){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;",n.textContent="\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.",o.append(n,Be()),e.textContent="",e.append(o)}},3e4);return}te(W.locale),Xt=W.use24HourTime!==!1;let t=W.sessionColumnSettings?.enabledColumns;if(Array.isArray(t)){let e=t.filter(o=>tn.includes(o));pt=new Set(e)}ln(W),en(),document.addEventListener("click",e=>{let n=e.target.getAttribute("data-suppress-tool");n&&(dn(n),f.postMessage({command:"suppressUnknownTool",toolName:n}))})}qr().catch(t=>{console.error("[Usage Analysis] Bootstrap failed:",t);let e=document.getElementById("root");if(e){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",n.textContent="Failed to initialize usage analysis. Please try refreshing.",o.append(n,Be()),e.textContent="",e.append(o)}});})();
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
