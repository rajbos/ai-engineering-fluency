"use strict";(()=>{var ir=Object.defineProperty;var b=(t,e,o)=>()=>{if(o)throw o[0];try{return t&&(e=t(t=0)),e}catch(n){throw o=[n],n}};var ar=(t,e)=>{for(var o in e)ir(t,o,{get:e[o],enumerable:!0})};var ee,oe,Ae,Io,$t,ne,rt,Lo,Ee,Re=b(()=>{ee=globalThis,oe=ee.ShadowRoot&&(ee.ShadyCSS===void 0||ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ae=Symbol(),Io=new WeakMap,$t=class{constructor(e,o,n){if(this._$cssResult$=!0,n!==Ae)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=o}get styleSheet(){let e=this.o,o=this.t;if(oe&&e===void 0){let n=o!==void 0&&o.length===1;n&&(e=Io.get(o)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Io.set(o,e))}return e}toString(){return this.cssText}},ne=t=>new $t(typeof t=="string"?t:t+"",void 0,Ae),rt=(t,...e)=>{let o=t.length===1?t[0]:e.reduce((n,r,s)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[s+1],t[0]);return new $t(o,t,Ae)},Lo=(t,e)=>{if(oe)t.adoptedStyleSheets=e.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of e){let n=document.createElement("style"),r=ee.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=o.cssText,t.appendChild(n)}},Ee=oe?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let o="";for(let n of e.cssRules)o+=n.cssText;return ne(o)})(t):t});var xr,kr,wr,Cr,Tr,Sr,X,Bo,$r,Ar,At,Et,re,Do,W,Rt=b(()=>{Re();Re();({is:xr,defineProperty:kr,getOwnPropertyDescriptor:wr,getOwnPropertyNames:Cr,getOwnPropertySymbols:Tr,getPrototypeOf:Sr}=Object),X=globalThis,Bo=X.trustedTypes,$r=Bo?Bo.emptyScript:"",Ar=X.reactiveElementPolyfillSupport,At=(t,e)=>t,Et={toAttribute(t,e){switch(e){case Boolean:t=t?$r:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=t!==null;break;case Number:o=t===null?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch{o=null}}return o}},re=(t,e)=>!xr(t,e),Do={attribute:!0,type:String,converter:Et,reflect:!1,useDefault:!1,hasChanged:re};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),X.litPropertyMetadata??(X.litPropertyMetadata=new WeakMap);W=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,o=Do){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(e,o),!o.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,o);r!==void 0&&kr(this.prototype,e,r)}}static getPropertyDescriptor(e,o,n){let{get:r,set:s}=wr(this.prototype,e)??{get(){return this[o]},set(i){this[o]=i}};return{get:r,set(i){let a=r?.call(this);s?.call(this,i),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Do}static _$Ei(){if(this.hasOwnProperty(At("elementProperties")))return;let e=Sr(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(At("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(At("properties"))){let o=this.properties,n=[...Cr(o),...Tr(o)];for(let r of n)this.createProperty(r,o[r])}let e=this[Symbol.metadata];if(e!==null){let o=litPropertyMetadata.get(e);if(o!==void 0)for(let[n,r]of o)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let r=this._$Eu(o,n);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let o=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let r of n)o.unshift(Ee(r))}else e!==void 0&&o.push(Ee(e));return o}static _$Eu(e,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Lo(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,o,n){this._$AK(e,n)}_$ET(e,o){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:Et).toAttribute(o,n.type);this._$Em=e,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,o){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let s=n.getPropertyOptions(r),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Et;this._$Em=r;let a=i.fromAttribute(o,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,o,n,r=!1,s){if(e!==void 0){let i=this.constructor;if(r===!1&&(s=this[e]),n??(n=i.getPropertyOptions(e)),!((n.hasChanged??re)(s,o)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(i._$Eu(e,n))))return;this.C(e,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,o,{useDefault:n,reflect:r,wrapped:s},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,i??o??this[e]),s!==!0||i!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(o=void 0),this._$AL.set(e,o)),r===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:i}=s,a=this[r];i!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let e=!1,o=this._$AL;try{e=this.shouldUpdate(o),e?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(o)}willUpdate(e){}_$AE(e){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(e){}firstUpdated(e){}};W.elementStyles=[],W.shadowRootOptions={mode:"open"},W[At("elementProperties")]=new Map,W[At("finalized")]=new Map,Ar?.({ReactiveElement:W}),(X.reactiveElementVersions??(X.reactiveElementVersions=[])).push("2.1.2")});function Go(t,e){if(!Be(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return No!==void 0?No.createHTML(e):e}function ut(t,e,o=t,n){if(e===I)return e;let r=n!==void 0?o._$Co?.[n]:o._$Cl,s=zt(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(t),r._$AT(t,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=r:o._$Cl=r),r!==void 0&&(e=ut(t,r._$AS(t,e.values),r,n)),e}var Pt,Ho,se,No,qo,Z,Ko,Er,at,_t,zt,Be,Rr,Me,Mt,Uo,Oo,st,jo,Wo,Vo,De,F,xl,kl,I,w,Fo,it,Mr,It,Pe,Lt,gt,_e,ze,Ie,Le,Pr,Jo,mt=b(()=>{Pt=globalThis,Ho=t=>t,se=Pt.trustedTypes,No=se?se.createPolicy("lit-html",{createHTML:t=>t}):void 0,qo="$lit$",Z=`lit$${Math.random().toFixed(9).slice(2)}$`,Ko="?"+Z,Er=`<${Ko}>`,at=document,_t=()=>at.createComment(""),zt=t=>t===null||typeof t!="object"&&typeof t!="function",Be=Array.isArray,Rr=t=>Be(t)||typeof t?.[Symbol.iterator]=="function",Me=`[ 	
\f\r]`,Mt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Uo=/-->/g,Oo=/>/g,st=RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),jo=/'/g,Wo=/"/g,Vo=/^(?:script|style|textarea|title)$/i,De=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),F=De(1),xl=De(2),kl=De(3),I=Symbol.for("lit-noChange"),w=Symbol.for("lit-nothing"),Fo=new WeakMap,it=at.createTreeWalker(at,129);Mr=(t,e)=>{let o=t.length-1,n=[],r,s=e===2?"<svg>":e===3?"<math>":"",i=Mt;for(let a=0;a<o;a++){let l=t[a],p,d,u=-1,h=0;for(;h<l.length&&(i.lastIndex=h,d=i.exec(l),d!==null);)h=i.lastIndex,i===Mt?d[1]==="!--"?i=Uo:d[1]!==void 0?i=Oo:d[2]!==void 0?(Vo.test(d[2])&&(r=RegExp("</"+d[2],"g")),i=st):d[3]!==void 0&&(i=st):i===st?d[0]===">"?(i=r??Mt,u=-1):d[1]===void 0?u=-2:(u=i.lastIndex-d[2].length,p=d[1],i=d[3]===void 0?st:d[3]==='"'?Wo:jo):i===Wo||i===jo?i=st:i===Uo||i===Oo?i=Mt:(i=st,r=void 0);let k=i===st&&t[a+1].startsWith("/>")?" ":"";s+=i===Mt?l+Er:u>=0?(n.push(p),l.slice(0,u)+qo+l.slice(u)+Z+k):l+Z+(u===-2?a:k)}return[Go(t,s+(t[o]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},It=class t{constructor({strings:e,_$litType$:o},n){let r;this.parts=[];let s=0,i=0,a=e.length-1,l=this.parts,[p,d]=Mr(e,o);if(this.el=t.createElement(p,n),it.currentNode=this.el.content,o===2||o===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=it.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let u of r.getAttributeNames())if(u.endsWith(qo)){let h=d[i++],k=r.getAttribute(u).split(Z),T=/([.?@])?(.*)/.exec(h);l.push({type:1,index:s,name:T[2],strings:k,ctor:T[1]==="."?_e:T[1]==="?"?ze:T[1]==="@"?Ie:gt}),r.removeAttribute(u)}else u.startsWith(Z)&&(l.push({type:6,index:s}),r.removeAttribute(u));if(Vo.test(r.tagName)){let u=r.textContent.split(Z),h=u.length-1;if(h>0){r.textContent=se?se.emptyScript:"";for(let k=0;k<h;k++)r.append(u[k],_t()),it.nextNode(),l.push({type:2,index:++s});r.append(u[h],_t())}}}else if(r.nodeType===8)if(r.data===Ko)l.push({type:2,index:s});else{let u=-1;for(;(u=r.data.indexOf(Z,u+1))!==-1;)l.push({type:7,index:s}),u+=Z.length-1}s++}}static createElement(e,o){let n=at.createElement("template");return n.innerHTML=e,n}};Pe=class{constructor(e,o){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:o},parts:n}=this._$AD,r=(e?.creationScope??at).importNode(o,!0);it.currentNode=r;let s=it.nextNode(),i=0,a=0,l=n[0];for(;l!==void 0;){if(i===l.index){let p;l.type===2?p=new Lt(s,s.nextSibling,this,e):l.type===1?p=new l.ctor(s,l.name,l.strings,this,e):l.type===6&&(p=new Le(s,this,e)),this._$AV.push(p),l=n[++a]}i!==l?.index&&(s=it.nextNode(),i++)}return it.currentNode=at,r}p(e){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,o),o+=n.strings.length-2):n._$AI(e[o])),o++}},Lt=class t{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,o,n,r){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=e,this._$AB=o,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,o=this._$AM;return o!==void 0&&e?.nodeType===11&&(e=o.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,o=this){e=ut(this,e,o),zt(e)?e===w||e==null||e===""?(this._$AH!==w&&this._$AR(),this._$AH=w):e!==this._$AH&&e!==I&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Rr(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==w&&zt(this._$AH)?this._$AA.nextSibling.data=e:this.T(at.createTextNode(e)),this._$AH=e}$(e){let{values:o,_$litType$:n}=e,r=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=It.createElement(Go(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new Pe(r,this),i=s.u(this.options);s.p(o),this.T(i),this._$AH=s}}_$AC(e){let o=Fo.get(e.strings);return o===void 0&&Fo.set(e.strings,o=new It(e)),o}k(e){Be(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,r=0;for(let s of e)r===o.length?o.push(n=new t(this.O(_t()),this.O(_t()),this,this.options)):n=o[r],n._$AI(s),r++;r<o.length&&(this._$AR(n&&n._$AB.nextSibling,r),o.length=r)}_$AR(e=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);e!==this._$AB;){let n=Ho(e).nextSibling;Ho(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},gt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,o,n,r,s){this.type=1,this._$AH=w,this._$AN=void 0,this.element=e,this.name=o,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=w}_$AI(e,o=this,n,r){let s=this.strings,i=!1;if(s===void 0)e=ut(this,e,o,0),i=!zt(e)||e!==this._$AH&&e!==I,i&&(this._$AH=e);else{let a=e,l,p;for(e=s[0],l=0;l<s.length-1;l++)p=ut(this,a[n+l],o,l),p===I&&(p=this._$AH[l]),i||(i=!zt(p)||p!==this._$AH[l]),p===w?e=w:e!==w&&(e+=(p??"")+s[l+1]),this._$AH[l]=p}i&&!r&&this.j(e)}j(e){e===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},_e=class extends gt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===w?void 0:e}},ze=class extends gt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==w)}},Ie=class extends gt{constructor(e,o,n,r,s){super(e,o,n,r,s),this.type=5}_$AI(e,o=this){if((e=ut(this,e,o,0)??w)===I)return;let n=this._$AH,r=e===w&&n!==w||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==w&&(n===w||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Le=class{constructor(e,o,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ut(this,e)}},Pr=Pt.litHtmlPolyfillSupport;Pr?.(It,Lt),(Pt.litHtmlVersions??(Pt.litHtmlVersions=[])).push("3.3.3");Jo=(t,e,o)=>{let n=o?.renderBefore??e,r=n._$litPart$;if(r===void 0){let s=o?.renderBefore??null;n._$litPart$=r=new Lt(e.insertBefore(_t(),s),s,void 0,o??{})}return r._$AI(t),r}});var Bt,Q,_r,Yo=b(()=>{Rt();Rt();mt();mt();Bt=globalThis,Q=class extends W{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let e=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=e.firstChild),e}update(e){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Jo(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};Q._$litElement$=!0,Q.finalized=!0,Bt.litElementHydrateSupport?.({LitElement:Q});_r=Bt.litElementPolyfillSupport;_r?.({LitElement:Q});(Bt.litElementVersions??(Bt.litElementVersions=[])).push("4.2.2")});var Xo=b(()=>{});var tt=b(()=>{Rt();mt();Yo();Xo()});var Zo=b(()=>{});function y(t){return(e,o)=>typeof o=="object"?Ir(t,e,o):((n,r,s)=>{let i=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),i?Object.getOwnPropertyDescriptor(r,s):void 0})(t,e,o)}var zr,Ir,He=b(()=>{Rt();zr={attribute:!0,type:String,converter:Et,reflect:!1,hasChanged:re},Ir=(t=zr,e,o)=>{let{kind:n,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),s.set(o.name,t),n==="accessor"){let{name:i}=o;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(i,l,t,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,t,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let l=this[i];e.call(this,a),this.requestUpdate(i,l,t,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function Ne(t){return y({...t,state:!0,attribute:!1})}var Qo=b(()=>{He();});var tn=b(()=>{});var ft=b(()=>{});var en=b(()=>{ft();});var on=b(()=>{ft();});var nn=b(()=>{ft();});var rn=b(()=>{ft();});var sn=b(()=>{ft();});var Ue=b(()=>{Zo();He();Qo();tn();en();on();nn();rn();sn()});var ae,le,bt,Oe=b(()=>{ae={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},le=t=>(...e)=>({_$litDirective$:t,values:e}),bt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,o,n){this._$Ct=e,this._$AM=o,this._$Ci=n}_$AS(e,o){return this.update(e,o)}update(e,o){return this.render(...o)}}});var de,an=b(()=>{mt();Oe();de=le(class extends bt{constructor(t){if(super(t),t.type!==ae.ATTRIBUTE||t.name!=="class"||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in e)e[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(e)}let o=t.element.classList;for(let n of this.st)n in e||(o.remove(n),this.st.delete(n));for(let n in e){let r=!!e[n];r===this.st.has(n)||this.nt?.has(n)||(r?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return I}})});var je=b(()=>{an()});var ce,ln,dn,ht,pe,We=b(()=>{tt();ce="2.5.1",ln="__vscodeElements_disableRegistryWarning__",dn=(t,e)=>{console.warn(e?`[VSCode Elements] ${t}
%o`:`${t}
%o`,e)},ht=class extends Q{get version(){return ce}warn(e){dn(e,this)}},pe=t=>e=>{if(!customElements.get(t)){customElements.define(t,e);return}if(ln in window)return;let r=document.createElement(t)?.version,s="";r?r!==ce?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${ce}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${ce}).`:s+="is already registered by an unknown custom element handler class.",dn(`The custom element "${t}" ${s}
To suppress this warning, set window.${ln} to true`)}});var yt,cn=b(()=>{mt();yt=t=>t??w});var Fe=b(()=>{cn()});var pn=b(()=>{Oe()});var qe,un,gn=b(()=>{tt();pn();qe=class extends bt{constructor(e){if(super(e),this._prevProperties={},e.type!==ae.PROPERTY||e.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(e,[o]){return Object.entries(o).forEach(([n,r])=>{this._prevProperties[n]!==r&&(n.startsWith("--")?e.element.style.setProperty(n,r):e.element.style[n]=r,this._prevProperties[n]=r)}),I}render(e){return I}},un=le(qe)});var ue,Ke=b(()=>{tt();ue=rt`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var Lr,mn,fn=b(()=>{tt();Ke();Lr=[ue,rt`
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
  `],mn=Lr});var lt,Dt,L,bn=b(()=>{tt();Ue();je();Fe();We();gn();fn();lt=function(t,e,o,n){var r=arguments.length,s=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(s=(r<3?i(s):r>3?i(e,o,s):i(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s},L=Dt=class extends ht{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();let{href:e,nonce:o}=this._getStylesheetConfig();Dt.stylesheetHref=e,Dt.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let e=document.getElementById("vscode-codicon-stylesheet"),o=e?.getAttribute("href")||void 0,n=e?.nonce||void 0;if(!e){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:n,href:o}}render(){let{stylesheetHref:e,nonce:o}=Dt,n=F`<span
      class=${de({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${un({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?F` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:F` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return F`
      <link
        rel="stylesheet"
        href=${yt(e)}
        nonce=${yt(o)}
      />
      ${r}
    `}};L.styles=mn;L.stylesheetHref="";L.nonce="";lt([y()],L.prototype,"label",void 0);lt([y({type:String})],L.prototype,"name",void 0);lt([y({type:Number})],L.prototype,"size",void 0);lt([y({type:Boolean,reflect:!0})],L.prototype,"spin",void 0);lt([y({type:Number,attribute:"spin-duration"})],L.prototype,"spinDuration",void 0);lt([y({type:Boolean,reflect:!0,attribute:"action-icon"})],L.prototype,"actionIcon",void 0);L=Dt=lt([pe("vscode-icon")],L)});var hn=b(()=>{bn()});function yn(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var vn=b(()=>{});var Br,Dr,xn,kn=b(()=>{tt();Ke();vn();Br=ne(yn()),Dr=[ue,rt`
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
      font-family: var(--vscode-font-family, ${Br});
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
  `],xn=Dr});var S,x,wn=b(()=>{tt();Ue();je();We();hn();kn();Fe();S=function(t,e,o,n){var r=arguments.length,s=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(s=(r<3?i(s):r>3?i(e,o,s):i(e,o))||s);return r>3&&s&&Object.defineProperty(e,o,s),s},x=class extends ht{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(e){super.update(e),e.has("value")&&this._internals.setFormValue(this.value),e.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(e){if((e.key==="Enter"||e.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(e){e.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(e){let o=e.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let e=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=e?F`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${yt(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:w,s=o?F`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${yt(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:w;return F`
      <div
        class=${de(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};x.styles=xn;x.formAssociated=!0;S([y({type:Boolean,reflect:!0})],x.prototype,"autofocus",void 0);S([y({type:Number,reflect:!0})],x.prototype,"tabIndex",void 0);S([y({type:Boolean,reflect:!0})],x.prototype,"secondary",void 0);S([y({type:Boolean,reflect:!0})],x.prototype,"block",void 0);S([y({reflect:!0})],x.prototype,"role",void 0);S([y({type:Boolean,reflect:!0})],x.prototype,"disabled",void 0);S([y()],x.prototype,"icon",void 0);S([y({type:Boolean,reflect:!0,attribute:"icon-spin"})],x.prototype,"iconSpin",void 0);S([y({type:Number,reflect:!0,attribute:"icon-spin-duration"})],x.prototype,"iconSpinDuration",void 0);S([y({attribute:"icon-after"})],x.prototype,"iconAfter",void 0);S([y({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],x.prototype,"iconAfterSpin",void 0);S([y({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],x.prototype,"iconAfterSpinDuration",void 0);S([y({type:Boolean,reflect:!0})],x.prototype,"focused",void 0);S([y({type:String,reflect:!0})],x.prototype,"name",void 0);S([y({type:Boolean,reflect:!0,attribute:"icon-only"})],x.prototype,"iconOnly",void 0);S([y({reflect:!0})],x.prototype,"type",void 0);S([y()],x.prototype,"value",void 0);S([Ne()],x.prototype,"_hasContentBefore",void 0);S([Ne()],x.prototype,"_hasContentAfter",void 0);x=S([pe("vscode-button")],x)});var Cn={};ar(Cn,{VscodeButton:()=>x});var Tn=b(()=>{wn()});function m(t,e,o){let n=document.createElement(t);return e&&(n.className=e),o!==void 0&&(n.textContent=o),n}var Zt={today:"Today",last7:"Last 7 days",last30:"Last 30 days",currentMonth:"Current month",lastMonth:"Previous month",thisWeek:"This week",allTime:"All time"},lr=["today","last7","last30","currentMonth","allTime"];function yo(t,e,o){e===o&&(t.selected=!0)}function Ce(t){let e=m("div","period-selector");e.style.display="inline-flex",e.style.alignItems="center",e.style.gap="4px";let o=t.label??"Time window:";if(o){let i=m("span","period-selector-label",o);i.style.fontSize="11px",i.style.color="var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))",e.append(i)}let n=document.createElement("select");n.className="period-selector-select",t.id&&(n.id=t.id),n.style.background="var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))",n.style.color="var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))",n.style.border="1px solid var(--border-subtle, #555555)",n.style.borderRadius="4px",n.style.padding="4px 8px",n.style.fontSize="13px",n.style.cursor="pointer",n.style.minHeight="24px";let r=new Set(t.disabled??[]),s=t.periods??lr;for(let i of s){let a=document.createElement("option");a.value=i,a.textContent=Zt[i],yo(a,i,t.selected),r.has(i)&&(a.disabled=!0,t.disabledTitle&&(a.title=t.disabledTitle)),n.append(a)}for(let i of t.extraOptions??[]){let a=document.createElement("option");a.value=i.value,a.textContent=i.label,i.title&&(a.title=i.title),yo(a,i.value,t.selected),i.disabled&&(a.disabled=!0),n.append(a)}return n.addEventListener("change",()=>{t.onChange(n.value)}),e.append(n),{wrapper:e,select:n}}var vo={"btn-refresh":{id:"btn-refresh",label:"Refresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"Details",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",label:"Chart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",label:"Usage Analysis",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",label:"Diagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",label:"Fluency Score",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",label:"Team Dashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",label:"Level Viewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",label:"Environmental Impact",icon:"globe",iconColor:"#4ade80",appearance:"secondary"}};var dr=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-environmental","btn-diagnostics","btn-dashboard"];function cr(t,e){return dr.filter(o=>o!=="btn-dashboard"||e).map(o=>({...vo[o],active:o===t}))}function pr(t){let e=typeof t=="string"?vo[t]:t;if(e.hidden)return"";let o=e.appearance?` appearance="${e.appearance}"`:"",n=e.active?' class="nav-active" disabled aria-current="page"':"",r=e.iconColor?` style="--icon-accent:${e.iconColor}"`:"",s=e.icon?`<span class="codicon codicon-${e.icon} nav-icon"${r}></span>`:"";return`<vscode-button id="${e.id}"${o}${n}>${s}${e.label}</vscode-button>`}function xo(t,e){return cr(t,e).map(o=>pr(o)).join(`
`)}function Ct(t){return t.file+t.selection+t.implicitSelection+t.symbol+t.codebase+t.workspace+t.terminal+t.vscode+t.copilotInstructions+t.agentsMd+(t.terminalLastCommand||0)+(t.terminalSelection||0)+(t.clipboard||0)+(t.changes||0)+(t.outputPanel||0)+(t.problemsPanel||0)+(t.pullRequest||0)}function j(t){let e=globalThis.window;return e?e[t]:void 0}var ur=j("__TOKEN_ESTIMATORS__"),Za=ur?.estimators??{},Tt,gr=!0;function Te(t){Tt=t}function $(t,e){return new Intl.NumberFormat(Tt,{minimumFractionDigits:e,maximumFractionDigits:e}).format(t)}function Y(t,e=1){return`${$(t,e)}%`}function g(t){return t.toLocaleString(Tt)}function ko(t){return gr?new Intl.NumberFormat(Tt,{notation:"compact",maximumFractionDigits:1}).format(t):g(t)}function wo(t){return new Intl.NumberFormat(Tt,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(t)}function c(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Qt(t){let e=Number(t);if(!Number.isFinite(e)||e<0)return"N/A";if(e<1024)return`${e} B`;let o=["KB","MB","GB","TB","PB"],n=e/1024,r=0;for(;n>=1024&&r<o.length-1;)n/=1024,r++;let s=r===0?1:2;return`${n.toFixed(s)} ${o[r]}`}function Se(t){if(t===void 0||!Number.isFinite(t)||t<0)return"\u2014";let e=Math.round(t/6e4);if(e<1)return"<1m";if(e<60)return`${e}m`;let o=Math.floor(e/60),n=e%60;return`${o}h ${String(n).padStart(2,"0")}m`}function Co(t){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let o=document.querySelector(".button-row");if(o)for(let n of e){let r=document.createElement("vscode-button");r.id=`ext-point-${n.id}`,r.textContent=n.label,r.addEventListener("click",()=>{t.postMessage({command:"extensionPointAction",buttonId:n.id})}),o.append(r)}}var To=`/**
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
`;var So=`* {
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
`;function $o(t){window.addEventListener("message",e=>{t(e.data)})}var br=j("__MODEL_PRICING__"),$e={};for(let[t,e]of Object.entries(br?.pricing??{}))e.displayNames&&e.displayNames.length>0&&($e[t]=e.displayNames[0]);function St(t){if($e[t])return $e[t];try{return decodeURIComponent(t)}catch{return t}}var dl=1/1e11;function hr(t){if(!t)return null;let e=/([\d.]+)\s*([KkMm])?/.exec(t);if(!e)return null;let o=parseFloat(e[1]);if(!isFinite(o)||o<=0)return null;let n=(e[2]??"").toUpperCase();return Math.round(o*(n==="M"?1e6:n==="K"?1e3:1))}function Ao(t,e={}){let o=e[t];if(!o){let s=t.toLowerCase();for(let[i,a]of Object.entries(e))if(s.includes(i.toLowerCase())||i.toLowerCase().includes(s)){o=a;break}}let n=o?.copilotPricing?.longContext;if(!n)return null;let r=hr(n.threshold);return r?{thresholdTokens:r,defaultInputCostPerMillion:o.copilotPricing.inputCostPerMillion,longContextInputCostPerMillion:n.inputCostPerMillion}:null}function Eo(t){return{oneShotRate:t.editTurns>0?t.oneShotEditTurns/t.editTurns:null,retryRate:t.editTurns>0?t.retries/t.editTurns:null,selfCorrectionRate:t.editTurns>0?t.selfCorrections/t.editTurns:null,costPerCall:t.calls>0?t.cost/t.calls:null,costPerEdit:t.editTurns>0?t.cost/t.editTurns:null,outputTokensPerCall:t.calls>0?t.outputTokens/t.calls:null,cacheHitRate:t.inputTokens>0?Math.min(1,t.cachedReadTokens/t.inputTokens):null}}function Ro(t){let e=Object.values(t).map(o=>o.calls).sort((o,n)=>o-n);return e.length<4?null:e[Math.floor((e.length-1)*.25)]}var yr=new Set(["\u2705","\u26A0\uFE0F","\u274C"]);function te(t){let e=Number(t);return Number.isFinite(e)?e:0}function Mo(t){if(!t||typeof t!="object")return;let e=t,o=Array.isArray(e.customizationTypes)?e.customizationTypes.filter(r=>!!r&&typeof r=="object").map(r=>({id:typeof r.id=="string"?r.id:"",icon:typeof r.icon=="string"?r.icon:"",label:typeof r.label=="string"?r.label:""})).filter(r=>r.id!==""):[],n=Array.isArray(e.workspaces)?e.workspaces.filter(r=>!!r&&typeof r=="object").map(r=>{let s=r.typeStatuses&&typeof r.typeStatuses=="object"?r.typeStatuses:{},i={};for(let[a,l]of Object.entries(s))i[a]=yr.has(l)?l:"\u274C";return{workspacePath:typeof r.workspacePath=="string"?r.workspacePath:"",workspaceName:typeof r.workspaceName=="string"?r.workspaceName:"",sessionCount:te(r.sessionCount),interactionCount:te(r.interactionCount),typeStatuses:i}}):[];return{customizationTypes:o,workspaces:n,totalWorkspaces:te(e.totalWorkspaces),workspacesWithIssues:te(e.workspacesWithIssues)}}var Po=/^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;function vr(t){return t.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}function _o(t){let e=Po.exec(t);if(e)return`Claude MCP: M365 Connector - ${vr(e[1])}`}function zo(t){return Po.test(t)}function H(t,e){let o=e?` title="${c(e)}"`:"",n="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";return t==="\u2705"?`<span style="${n}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${o} aria-label="${c(e??"Present and fresh")}">\u2713</span>`:t==="\u26A0\uFE0F"?`<span style="${n}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${o} aria-label="${c(e??"Present but stale")}">!</span>`:`<span style="${n}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${o} aria-label="${c(e??"Missing")}">\u2715</span>`}var f=acquireVsCodeApi(),Sn=new Set,q=f.getState()?.aboutCollapsed??!1;function G(t,e){try{f.postMessage({command:"traceUsageCuration",stage:t,details:e??{}})}catch{}}function dt(t,e,o){Sn.has(t)||(Sn.add(t),G(e,o))}var U=j("__INITIAL_USAGE__"),N=null,Xt=new Map,_=null,ct=!1,Vt=!1,Dn=[],A="activity",fe=null,io=[],be=null,M=U?.worktreeScanRoots?[...U.worktreeScanRoots]:[],D=[],E=!1,R={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},Gt=null,Ve=!1,he=new Set,Ht=!1,Jt="count",Nt="desc",J=!1,pt=!1,ao={processed:0,total:0},et=[];function C(t){return Number(t??0)||0}var Hr=`
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
</style>`,Ut=[{id:"ul-s-start",label:"Starting usage analysis"},{id:"ul-s-tools",label:"Collecting runtime tools"},{id:"ul-s-mcp",label:"Discovering MCP servers"},{id:"ul-s-skills",label:"Scanning skill directories"},{id:"ul-s-crunch",label:"Computing curation analysis"},{id:"ul-s-ready",label:"Ready!"}],Nr={start:{pct:5,stepId:"ul-s-start",subtitle:"Starting usage analysis\u2026"},"curation:start":{pct:20,stepId:"ul-s-tools",subtitle:"Collecting tools and skills\u2026"},"curation:runtimeTools":{pct:32,stepId:"ul-s-tools",subtitle:"Collected runtime tools"},"curation:mcpJson":{pct:44,stepId:"ul-s-mcp",subtitle:"Scanning MCP config files\u2026"},"curation:mcpSources":{pct:55,stepId:"ul-s-mcp",subtitle:"Collected MCP servers"},"curation:skillsScanStart":{pct:63,stepId:"ul-s-skills",subtitle:"Scanning skill directories\u2026"},"curation:skillsScanDone":{pct:75,stepId:"ul-s-skills",subtitle:"Skill discovery complete"},"curation:analyzing":{pct:85,stepId:"ul-s-crunch",subtitle:"Analyzing tool usage patterns\u2026"},"curation:done":{pct:96,stepId:"ul-s-crunch",subtitle:"Curation analysis complete"},ready:{pct:100,stepId:"ul-s-ready",subtitle:"Usage analysis ready"},error:{pct:100,stepId:"ul-s-ready",subtitle:"Analysis completed with errors"},"curation:error":{pct:85,stepId:"ul-s-crunch",subtitle:"Curation analysis skipped"}};function lo(t="Loading usage analysis..."){let e=document.getElementById("root");if(!e)return;co=!0;let o=Ut.map((n,r)=>{let s=r===0,i=s?"ul-step ul-active":"ul-step",a=s?'<span class="ul-spin">\u21BB</span>':"\u25CB";return`<div class="${i}" id="${n.id}"><span class="ul-ico">${a}</span><span class="ul-lbl">${c(n.label)}</span><span class="ul-cnt" id="${n.id}-cnt"></span></div>`}).join("");e.innerHTML=`${Hr}
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
</div>`}function $n(t){let e=document.getElementById(t);if(!e)return;e.className="ul-step ul-done";let o=e.querySelector(".ul-ico");o&&(o.innerHTML='<span class="ul-pop">\u2713</span>')}function Ur(t){let e=document.getElementById(t);if(!e)return;e.className="ul-step ul-active";let o=e.querySelector(".ul-ico");o&&(o.innerHTML='<span class="ul-spin">\u21BB</span>')}function Or(t,e){let o=document.getElementById(`${t}-cnt`);o&&(o.textContent=e)}var Ot=0,co=!1;function jr(t,e){for(let o=Ot;o<t;o++)$n(Ut[o].id);t>Ot&&(Ot=t),e<100?Ur(Ut[t].id):$n(Ut[t].id)}function Wr(t){return typeof t.count=="number"?`${t.count}`:typeof t.skills=="number"?`${t.skills} skills`:typeof t.availableTools=="number"?`${t.availableTools} tools`:""}function Fr(){let t=document.getElementById("root");return t?t.querySelector("#usage-loading-card")?!0:co?(lo("Building Usage Analysis"),Ot=0,!0):!1:!1}function qr(t){if(!Fr())return;let e=typeof t?.stage=="string"?t.stage:"",o=Nr[e];if(!o)return;let n=o.pct,r=document.getElementById("ul-fill");r&&(r.classList.remove("ul-indeterminate"),r.style.width=`${Math.max(n,3)}%`);let s=document.getElementById("ul-pct");s&&(s.textContent=n===100?"100%":`${n}%`);let i=document.getElementById("ul-subtitle");i&&(i.textContent=o.subtitle);let a=Ut.findIndex(p=>p.id===o.stepId);a>=0&&jr(a,n);let l=t?.details;if(l&&typeof l=="object"){let p=Wr(l);p&&Or(o.stepId,`(${p})`)}}function Qe(){fe!==null&&(clearTimeout(fe),fe=null)}function po(){let t=document.createElement("button");return t.textContent="\u{1F504} Refresh",t.style.cssText="padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;",t.addEventListener("click",()=>f.postMessage({command:"refresh"})),t}function Hn(t){let e=document.getElementById("root");if(!e)return;let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="font-size: 24px; margin-bottom: 12px;",n.innerHTML=H("\u274C","Error");let r=document.createElement("div");r.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",r.textContent=t,o.append(n,r,po()),e.textContent="",e.append(o)}var to=!1,jt=null,eo=!1,Wt=null,Kr={xhigh:"Extra High"};function Vr(t){return Kr[t]??t}var Ft=j("__TOOL_NAMES__")??null,Gr=j("__AUTOMATIC_TOOLS__")??[],Jr=new Set(Gr.map(t=>t.toLowerCase()));function Nn(t){return Ft?Ft[t]??Ft[t.toLowerCase()]??_o(t)??t:t}function Ge(t){let e=Nn(t),o=e.indexOf(":");return o!==-1?e.substring(o+1).trim():e}function Yr(t){let e=new Set;Object.entries(t.today.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.last30Days.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.month.mcpTools.byTool).forEach(([n])=>e.add(n)),Object.entries(t.today.toolCalls.byTool).forEach(([n])=>e.add(n)),Object.entries(t.last30Days.toolCalls.byTool).forEach(([n])=>e.add(n)),Object.entries(t.month.toolCalls.byTool).forEach(([n])=>e.add(n));let o=new Set(t.suppressedUnknownTools??[]);return Array.from(e).filter(n=>!Ft?.[n]&&!Ft?.[n.toLowerCase()]&&!zo(n)&&!o.has(n)).sort()}function Xr(t){let e="https://github.com/rajbos/ai-engineering-fluency",o=encodeURIComponent("Add missing friendly names for tools"),n=t.map(i=>`- \`${i}\``).join(`
`),r=encodeURIComponent(`## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${n}

Please add friendly names for these tools to improve the user experience.`),s=encodeURIComponent("MCP Toolnames");return`${e}/issues/new?title=${o}&body=${r}&labels=${s}`}var Zr=[{label:"\u{1F4AC} Ask Mode",key:"ask",gradient:"linear-gradient(90deg, #3b82f6, #60a5fa)"},{label:"\u270F\uFE0F Edit Mode",key:"edit",gradient:"linear-gradient(90deg, #10b981, #34d399)"},{label:"\u{1F916} Agent Mode",key:"agent",gradient:"linear-gradient(90deg, #7c3aed, #a855f7)"},{label:"\u{1F4CB} Plan Mode",key:"plan",gradient:"linear-gradient(90deg, #f59e0b, #fbbf24)"},{label:"\u26A1 Custom Agent",key:"customAgent",gradient:"linear-gradient(90deg, #ec4899, #f472b6)"},{label:"\u{1F5A5}\uFE0F CLI",key:"cli",gradient:"linear-gradient(90deg, #06b6d4, #22d3ee)"}];function Qr(t,e,o,n){let r=o>0?e/o*100:0;return`
<div class="bar-item">
<div class="bar-label"><span>${t}</span><span><strong>${g(e)}</strong> (${Y(r,0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${r.toFixed(1)}%; background: ${n};"></div></div>
</div>`}function An(t,e){let o=t.ask+t.edit+t.agent+t.plan+t.customAgent+t.cli,n=Zr.map(({label:r,key:s,gradient:i})=>Qr(r,t[s],o,i)).join("");return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${e}</h4>
<div class="bar-chart">${n}
</div>
</div>`}function ts(t){return`
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${$(t.averageModelsPerSession,1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${Y(t.switchingFrequency,0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${g(t.maxModelsPerSession||0)}</div>
</div>
</div>`}function es(t,e,o,n){return`
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
</div>`}function os(t){return t.totalRequests<=0?"":`
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${t.lowCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${g(t.lowCostRequests)} (${Y(t.lowCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.mediumCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${g(t.mediumCostRequests)} (${Y(t.mediumCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.highCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${g(t.highCostRequests)} (${Y(t.highCostRequests/t.totalRequests*100)})</span>
</div>
`:""}
${t.unknownRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${g(t.unknownRequests)} (${Y(t.unknownRequests/t.totalRequests*100)})</span>
</div>
`:""}
</div>`}function ns(t){return t.mixedCostSessions<=0?"":`
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${g(t.mixedCostSessions)}</span>
</div>`}function Je(t,e,o,n,r,s){return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${t}</h4>
${ts(e)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${es(o,n,r,s)}
${os(e)}
${ns(e)}
</div>
</div>`}function En(t,e,o,n,r){let s=document.querySelector(t);if(!s)return;let i=r>0?Math.round(n/r*100):0,a=`${o} ${n}/${r} repos (${i}%)`,l=s.querySelector(`.${e}`);if(l)l.textContent=a;else{Array.from(s.children).forEach(d=>{let u=d;!u.classList.contains("section-title")&&!u.classList.contains("section-subtitle")&&u.remove()});let p=document.createElement("div");p.className=e,p.style.cssText="margin-top:8px; font-size:12px; color:var(--text-secondary);",p.textContent=a,s.appendChild(p)}}function rs(t){let e=t.missedPotential||U?.missedPotential||[];return e.length===0?`
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${H("\u2705")} No other AI tool configs missing a Copilot counterpart
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
                ${H("\u26A0\uFE0F")} Missed Potential: Non-Copilot Instruction Files
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
    `}function K(t,e=10,o=Nn){let n=Object.entries(t).sort(([,s],[,i])=>i-s).slice(0,e);return n.length===0?'<div style="color: var(--text-muted);">No tools used yet</div>':`
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${n.map(([s,i],a)=>{let l=c(o(s)),p=c(s),d=Jr.has(s.toLowerCase())?'<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>':"";return`
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${a+1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${p}">${l}</strong>${d}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${g(i)}</td>
		    </tr>`}).join("")}
			</tbody>
		</table>`}var uo=[{id:"interactions",label:"Turns",sortKey:"interactions",align:"right",render:t=>({html:g(t.interactions)})},{id:"toolCalls",label:"Tools",sortKey:"toolCalls",align:"right",render:t=>({html:g(t.toolCalls)})},{id:"inputTokens",label:"Input",sortKey:"inputTokens",align:"right",render:t=>({html:g(t.inputTokens)})},{id:"outputTokens",label:"Output",sortKey:"outputTokens",align:"right",render:t=>({html:g(t.outputTokens)})},{id:"thinkingTokens",label:"Thinking",sortKey:"thinkingTokens",align:"right",render:t=>({html:g(t.thinkingTokens)})},{id:"cachedTokens",label:"Cached",sortKey:"cachedTokens",align:"right",render:t=>({html:g(t.cachedTokens)})},{id:"totalTokens",label:"Total",sortKey:"totalTokens",align:"right",render:t=>({html:g(t.totalTokens)})},{id:"estimatedCost",label:"Cost",sortKey:"estimatedCost",align:"right",render:t=>({html:t.estimatedCost>0?`$${t.estimatedCost.toFixed(4)}`:"\u2014"})},{id:"editor",label:"Editor",sortKey:"editor",align:"left",render:t=>({html:c(t.editor||"unknown")})},{id:"workspace",label:"Workspace",sortKey:"workspace",align:"left",cellStyle:"max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:t=>{let e=c(t.workspace||"\u2014");return{html:e,title:e}}},{id:"models",label:"Models",align:"left",cellStyle:"font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:t=>{let e=t.models.map(o=>c(St(o))).join(", ")||"\u2014";return{html:e,title:e}}},{id:"durationMs",label:"Duration",sortKey:"durationMs",align:"right",cellStyle:"white-space:nowrap;",render:t=>{let e=t.activeDurationMs??t.durationMs,o=t.durationMs!==void 0?`Wall time: ${Se(t.durationMs)}`:void 0;return{html:Se(e),...o?{title:o}:{}}}},{id:"lastActivity",label:"Last Active",sortKey:"lastActivity",align:"right",cellStyle:"white-space:nowrap;",render:t=>({html:t.lastActivity?P==="today"?new Date(t.lastActivity).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!ye}):new Date(t.lastActivity).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!ye}):"\u2014"})}],Un=uo.map(t=>t.id),vt="interactions",qt="desc",go=[],ye=!0,P="today",oo=[],xt={},kt=new Set(Un);function ss(){f.postMessage({command:"saveSessionColumnSettings",settings:{enabledColumns:Array.from(kt)}})}function Rn(t){return vt!==t?"":qt==="desc"?" \u25BC":" \u25B2"}var is={title:(t,e)=>(t.title||"").localeCompare(e.title||""),editor:(t,e)=>(t.editor||"").localeCompare(e.editor||""),workspace:(t,e)=>(t.workspace||"").localeCompare(e.workspace||""),durationMs:(t,e)=>(t.activeDurationMs??t.durationMs??-1)-(e.activeDurationMs??e.durationMs??-1),lastActivity:(t,e)=>(t.lastActivity||"").localeCompare(e.lastActivity||"")};function as(t,e){let o=is[vt];return o?o(t,e):t[vt]-e[vt]}function ls(t){return[...t].sort((e,o)=>{let n=as(e,o);return qt==="desc"?-n:n})}function no(t){return go=t,!t||t.length===0?`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${P==="today"?"No sessions recorded today yet.":"No sessions recorded in this period."}</div>`:`<div id="sessions-table-container">${mo(t)}</div>`}function mo(t){let e=ls(t),o=uo.filter(s=>kt.has(s.id)),n=e.map((s,i)=>{let a=c(s.title||"Untitled session"),l=c(s.filePath||""),p=o.map(d=>{let{html:u,title:h}=d.render(s),k=d.align==="right"?"text-align:right;":"",T=h!==void 0?` title="${h}"`:"";return`<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${k}${d.cellStyle||""}"${T}>${u}</td>`}).join("");return`<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${i+1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${a}&quot;"><a href="#" class="session-title-link" data-file="${l}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${a}</a></td>
			${p}
		</tr>`}).join(""),r=o.map(s=>{let i=s.align==="right"?" text-align:right;":"";return s.sortKey?`<th class="sortable" data-sort="${s.sortKey}" style="padding:6px 8px;${i}">${s.label}${Rn(s.sortKey)}</th>`:`<th style="padding:6px 8px;${i}">${s.label}</th>`}).join("");return`
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${Rn("title")}</th>
					${r}
				</tr>
			</thead>
			<tbody>
				${n}
			</tbody>
		</table>
		</div>`}function ds(){return`
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">\u2699 Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${uo.map(e=>`
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${e.id}"${kt.has(e.id)?" checked":""} />
			<span>${e.label}</span>
		</label>`).join("")}
			</div>
		</div>`}function On(){let t=document.getElementById("sessions-panel-body");t&&(t.addEventListener("click",e=>{let o=e.target.closest("a.session-title-link");if(o){e.preventDefault();let i=o.getAttribute("data-file");i&&f.postMessage({command:"openSessionFile",file:i});return}let n=e.target.closest("th.sortable");if(!n)return;let r=n.getAttribute("data-sort");if(!r)return;vt===r?qt=qt==="desc"?"asc":"desc":(vt=r,qt="desc");let s=document.getElementById("sessions-table-container");s&&(s.innerHTML=mo(go))}),jn(),cs())}var Mn=!1;function cs(){let t=document.getElementById("sessions-columns-toggle"),e=document.getElementById("sessions-columns-menu");!t||!e||(t.addEventListener("click",o=>{o.stopPropagation(),e.style.display=e.style.display==="none"?"block":"none"}),e.addEventListener("click",o=>o.stopPropagation()),e.addEventListener("change",o=>{let n=o.target,r=n.getAttribute("data-column");if(!r)return;n.checked?kt.add(r):kt.delete(r);let s=document.getElementById("sessions-table-container");s&&(s.innerHTML=mo(go)),ss()}),Mn||(Mn=!0,document.addEventListener("click",()=>{let o=document.getElementById("sessions-columns-menu");o&&(o.style.display="none")})))}function jn(){let t=document.getElementById("sessions-lookback-wrapper");if(!t)return;t.replaceChildren();let{wrapper:e}=Ce({id:"sessions-lookback",selected:P,disabled:["allTime"],disabledTitle:"All-time sessions are not loaded yet",label:"",onChange:o=>{P=o,ro()}});t.append(e),P!=="today"&&!xt[P]&&ro()}function ro(){let t=document.getElementById("sessions-panel-body");if(!t)return;if(P==="today"){t.innerHTML=no(oo);return}let e=xt[P];if(e){t.innerHTML=no(e);return}t.innerHTML=`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${Zt[P]}\u2026</div>`,f.postMessage({command:"loadRecentSessions",period:P})}function ps(t){let e=t.period;if(!e)return;let o=Array.isArray(t.sessions)?t.sessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"):[];xt[e]=o,P===e&&ro()}function V(t,e){let o={...t};for(let n of e)n in o||(o[n]=0);return o}function v(t){let e=Number(t);return Number.isFinite(e)?e:0}function us(t){let e=t&&typeof t=="object"?t:{};return{ask:v(e.ask),edit:v(e.edit),agent:v(e.agent),plan:v(e.plan),customAgent:v(e.customAgent),cli:v(e.cli)}}function gs(t){let e=t&&typeof t=="object"?t:{};return{file:v(e.file),selection:v(e.selection),implicitSelection:v(e.implicitSelection),symbol:v(e.symbol),codebase:v(e.codebase),workspace:v(e.workspace),terminal:v(e.terminal),vscode:v(e.vscode),terminalLastCommand:v(e.terminalLastCommand),terminalSelection:v(e.terminalSelection),clipboard:v(e.clipboard),changes:v(e.changes),outputPanel:v(e.outputPanel),problemsPanel:v(e.problemsPanel),pullRequest:v(e.pullRequest),byKind:e.byKind??{},copilotInstructions:v(e.copilotInstructions),agentsMd:v(e.agentsMd),byPath:e.byPath??{}}}function ge(t){let e=t&&typeof t=="object"?t:{},o=e.toolCalls&&typeof e.toolCalls=="object"?e.toolCalls:{},n=e.mcpTools&&typeof e.mcpTools=="object"?e.mcpTools:{};return{sessions:v(e.sessions),modeUsage:us(e.modeUsage),contextReferences:gs(e.contextReferences),toolCalls:{total:v(o.total),byTool:o.byTool??{}},mcpTools:{total:v(n.total),byServer:n.byServer??{},byTool:n.byTool??{}},modelSwitching:{modelsPerSession:[],totalSessions:0,averageModelsPerSession:0,maxModelsPerSession:0,minModelsPerSession:0,switchingFrequency:0,standardModels:[],premiumModels:[],unknownModels:[],mixedTierSessions:0,lowCostModels:[],mediumCostModels:[],highCostModels:[],mixedCostSessions:0,standardRequests:0,premiumRequests:0,lowCostRequests:0,mediumCostRequests:0,highCostRequests:0,unknownRequests:0,totalRequests:0,...e.modelSwitching??{}},thinkingEffortUsage:e.thinkingEffortUsage,modelEfficiency:e.modelEfficiency}}function Wn(t){return t.filter(e=>e&&typeof e=="object"&&typeof e.id=="string").map(e=>({id:String(e.id),category:typeof e.category=="string"?e.category:"general",severity:["tip","opportunity","celebration"].includes(e.severity)?e.severity:"tip",title:typeof e.title=="string"?e.title:"",body:typeof e.body=="string"?e.body:"",actionLabel:typeof e.actionLabel=="string"?e.actionLabel:void 0,actionCommand:typeof e.actionCommand=="string"?e.actionCommand:void 0,status:["new","seen","dismissed","snoozed","done"].includes(e.status)?e.status:"new",allowToast:!!e.allowToast}))}function ms(t){if(!t||typeof t!="object")return null;let e=t;return{windowDays:typeof e.windowDays=="number"?e.windowDays:30,availableTools:Array.isArray(e.availableTools)?e.availableTools:[],usedTools:Array.isArray(e.usedTools)?e.usedTools:[],unusedTools:Array.isArray(e.unusedTools)?e.unusedTools:[],underusedMcpServers:Array.isArray(e.underusedMcpServers)?e.underusedMcpServers:[],underusedAgentPlugins:Array.isArray(e.underusedAgentPlugins)?e.underusedAgentPlugins:[],estimatedPromptBloat:e.estimatedPromptBloat&&typeof e.estimatedPromptBloat=="object"?e.estimatedPromptBloat:{totalTokens:0,byServer:{}},recommendations:Array.isArray(e.recommendations)?e.recommendations:[]}}function fs(t){if(!t||typeof t!="object")return dt("sanitize-invalid-root","sanitizeStats.invalidRoot"),null;try{let e={today:ge(t.today),last30Days:ge(t.last30Days),month:ge(t.month),lastMonth:ge(t.lastMonth),lastUpdated:typeof t.lastUpdated=="string"?t.lastUpdated:"",backendConfigured:!!t.backendConfigured,locale:typeof t.locale=="string"?t.locale:void 0,currentWorkspacePaths:Array.isArray(t.currentWorkspacePaths)?t.currentWorkspacePaths.filter(r=>typeof r=="string"):void 0,suppressedUnknownTools:Array.isArray(t.suppressedUnknownTools)?t.suppressedUnknownTools.filter(r=>typeof r=="string"):void 0},o=Mo(t.customizationMatrix);o&&(e.customizationMatrix=o),Array.isArray(t.missedPotential)&&(e.missedPotential=t.missedPotential.filter(r=>r&&typeof r=="object"&&typeof r.workspacePath=="string")),Array.isArray(t.todaySessions)&&(e.todaySessions=t.todaySessions.filter(r=>r&&typeof r=="object"&&typeof r.interactions=="number")),Array.isArray(t.insights)&&(e.insights=Wn(t.insights));let n=ms(t.curationAnalysis);return n?(e.curationAnalysis=n,G("sanitizeStats.curation.present",{availableTools:n.availableTools.length,unusedTools:n.unusedTools.length,unusedServers:n.underusedMcpServers.filter(r=>r&&r.usedToolCount===0).length})):dt("sanitize-no-curation","sanitizeStats.curation.missing"),e}catch(e){return dt("sanitize-error","sanitizeStats.error",{error:e instanceof Error?e.message:String(e)}),null}}function O(){let t=document.getElementById("worktree-controls");t&&(t.innerHTML=Yn())}function z(){let t=document.getElementById("worktree-results");t&&(t.innerHTML=Zn())}function wt(){let t=document.getElementById("worktree-progress-area");t&&(t.innerHTML=Jn())}function Fn(){Ve||(Ve=!0,requestAnimationFrame(()=>{Ve=!1,z()}))}function qn(){let t=document.getElementById("worktree-root-input"),e=t?.value.trim();e&&(M.some(o=>o.toLowerCase()===e.toLowerCase())||M.push(e),t&&(t.value=""),O())}function bs(){M.length===0||E||J||(E=!0,D=[],Gt=null,R={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},et=[],O(),z(),f.postMessage({command:"scanWorktrees",rootPaths:M}))}function hs(){if(J||pt||E)return;let t=Xn();t.length!==0&&(pt=!0,z(),f.postMessage({command:"cleanupPushedWorktrees",worktrees:t.map(e=>({path:e.path,branch:e.branch,repoLabel:e.repoLabel}))}))}function ys(t){return t.id==="btn-browse-worktree-root"?(f.postMessage({command:"pickWorktreeRoot"}),!0):t.id==="btn-add-worktree-root"?(qn(),!0):t.id==="btn-scan-worktrees"?(bs(),!0):t.id==="btn-cancel-worktree-scan"?(f.postMessage({command:"cancelWorktreeScan"}),!0):t.id==="btn-cleanup-pushed-worktrees"?(hs(),!0):t.id==="btn-cancel-cleanup"?(f.postMessage({command:"cancelCleanupPushedWorktrees"}),!0):!1}function vs(t){if(t.closest("#btn-toggle-worktree-roots"))return Ht=!Ht,O(),!0;if(t.classList.contains("worktree-remove-root")){let e=Number(t.getAttribute("data-index"));return isNaN(e)||(M.splice(e,1),O()),!0}return!1}function xs(t,e){let o=e.closest(".worktree-reveal-link");if(o){t.preventDefault();let r=decodeURIComponent(o.getAttribute("data-path")||"");return r&&f.postMessage({command:"revealPath",path:r}),!0}let n=e.closest(".worktree-delete-link");if(n){t.preventDefault();let r=decodeURIComponent(n.getAttribute("data-path")||""),s=decodeURIComponent(n.getAttribute("data-branch")||""),i=decodeURIComponent(n.getAttribute("data-repo")||""),a=n.getAttribute("data-pushed")||"?";return r&&f.postMessage({command:"deleteWorktree",path:r,branch:s,repoLabel:i,pushed:a}),!0}return!1}function ks(t){let e=t.closest("[data-wt-sort]");if(!e)return!1;let o=e.getAttribute("data-wt-sort");return o&&(Jt===o?Nt=Nt==="desc"?"asc":"desc":(Jt=o,Nt=o==="repo"?"asc":"desc"),z()),!0}function ws(t){let e=t.closest(".worktree-repo-row");if(!e)return!1;let o=e.getAttribute("data-repo")??"";return he.has(o)?he.delete(o):he.add(o),z(),!0}function Cs(t){return ks(t)?!0:ws(t)}function Ts(t){let e=t.target;e&&(ys(e)||vs(e)||xs(t,e)||Cs(e))}function Ss(){let t=document.getElementById("tab-panel-worktrees");t&&(t.addEventListener("click",Ts),t.addEventListener("keydown",e=>{e.target?.id==="worktree-root-input"&&e.key==="Enter"&&(e.preventDefault(),qn())}))}function $s(t){let e=t??{},o=String(e.pushed??"?"),n=o==="yes"||o==="no"?o:"?";return{path:String(e.path??""),repoLabel:String(e.repoLabel??"Unknown"),branch:String(e.branch??"?"),lastCommit:String(e.lastCommit??"?"),lastCommitDate:e.lastCommitDate?String(e.lastCommitDate):null,pushed:n,files:C(e.files),folders:C(e.folders),bytes:C(e.bytes)}}function As(t){if(!t.folderPath)return;let e=String(t.folderPath);M.some(o=>o.toLowerCase()===e.toLowerCase())||M.push(e),O()}function Es(t){if(E||!Array.isArray(t.roots))return;let e=!1;for(let o of t.roots){if(typeof o!="string")continue;let n=o.trim();n&&(M.some(r=>r.toLowerCase()===n.toLowerCase())||(M.push(n),e=!0))}e&&O()}function Rs(){E=!0,D=[],Gt=null,R={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},O(),z()}function Ms(t){R={...R,root:String(t.root||""),checked:0,total:0,phase:"walking",dirsScanned:0},wt()}function Ps(t){R={...R,root:String(t.root??R.root),phase:"walking",dirsScanned:C(t.dirsScanned),elapsedMs:C(t.elapsedMs)},wt()}function _s(t){R={...R,total:C(t.count),phase:"checking"},wt()}function zs(t){Gt=`Skipped "${t.root}": ${t.reason||"not accessible"}`,O()}function Is(t){R={root:String(t.root??R.root),checked:C(t.checked),total:t.total!==void 0?C(t.total):R.total,foundCount:C(t.foundCount),elapsedMs:C(t.elapsedMs)},wt()}function Ls(t){t.worktree&&(D.push($s(t.worktree)),Fn())}function Bs(t){let e=String(t.path??"");if(!e)return;let o=D.findIndex(n=>n.path===e);o!==-1&&(D.splice(o,1),z())}function Ds(){pt=!1,z()}function Hs(t){pt=!1,J=!0,ao={processed:0,total:C(t.total)},et=[],z()}function Ns(t){ao={processed:C(t.processed),total:C(t.total)};let e=t.status,o=e==="deleted"||e==="skipped"?e:"error";et.push({path:String(t.path??""),branch:String(t.branch??"?"),repoLabel:String(t.repoLabel??""),status:o,reason:typeof t.reason=="string"?t.reason:void 0}),z()}function Us(){J=!1,z()}function Os(){J=!1,pt=!1,z()}function js(t){R={...R,phase:"enriching",enriched:0,enrichTotal:C(t.total),elapsedMs:C(t.elapsedMs)},wt()}function Ws(t){R={...R,phase:"enriching",enriched:C(t.enriched),enrichTotal:C(t.total),elapsedMs:C(t.elapsedMs)},wt()}function Fs(t){let e=String(t.path??"");if(!e)return;let o=D.find(r=>r.path===e);if(!o)return;o.files=C(t.files),o.folders=C(t.folders),o.bytes=C(t.bytes);let n=String(t.pushed??"?");o.pushed=n==="yes"||n==="no"?n:"?",Fn()}function qs(){E=!1,O(),z()}function Ks(){E=!1,O()}var Vs={worktreeRootPicked:As,worktreeRootsDiscovered:Es,worktreeScanStarted:()=>Rs(),worktreeScanRootStarted:Ms,worktreeScanWalkProgress:Ps,worktreeScanRootMarkersFound:_s,worktreeScanRootSkipped:zs,worktreeScanProgress:Is,worktreeFound:Ls,worktreeEnrichStarted:js,worktreeEnrichProgress:Ws,worktreeEnriched:Fs,worktreeDeleted:Bs,worktreeScanComplete:()=>qs(),worktreeScanCancelled:()=>Ks(),cleanupDeclined:()=>Ds(),cleanupStarted:Hs,cleanupWorktreeResult:Ns,cleanupComplete:()=>Us(),cleanupCancelled:()=>Os()};function Gs(t){let e=Vs[t.command];e&&e(t)}function Js(){let t=document.querySelectorAll(".tab-button");t.forEach(e=>{e.addEventListener("click",()=>{let o=e.getAttribute("data-tab");if(!o)return;A=o,t.forEach(r=>r.classList.toggle("active",r.getAttribute("data-tab")===o)),document.querySelectorAll(".tab-panel").forEach(r=>{r.style.display="none"});let n=document.getElementById(`tab-panel-${o}`);n&&(n.style.display="block"),o==="repos"&&!to&&(to=!0,f.postMessage({command:"loadRepoPrStats"})),o==="agent"&&!eo&&(eo=!0,f.postMessage({command:"loadAgentSessions"})),o==="insights"&&io.filter(r=>r.status==="new").forEach(r=>f.postMessage({command:"insightAction",id:r.id,action:"seen"}))})})}function B(t){let e=Number(t);return Number.isFinite(e)&&e>=0?e:0}function so(t){let e=typeof t=="string"?t.trim():"";try{let o=new URL(e);if(o.protocol==="http:"||o.protocol==="https:")return o.toString()}catch{}return"#"}function Ys(t){let e=t&&typeof t=="object"?t:{},o=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"||typeof e.since=="number"?e.since:Date.now(),repos:o.map(n=>{let r=n&&typeof n=="object"?n:{},s=Array.isArray(r.aiDetails)?r.aiDetails:[];return{repoUrl:so(r.repoUrl),owner:c(typeof r.owner=="string"?r.owner:""),repo:c(typeof r.repo=="string"?r.repo:""),error:typeof r.error=="string"?c(r.error):"",totalPrs:B(r.totalPrs),aiAuthoredPrs:B(r.aiAuthoredPrs),aiReviewRequestedPrs:B(r.aiReviewRequestedPrs),aiDetails:s.map(i=>{let a=i&&typeof i=="object"?i:{},l=["copilot","claude","openai","other-ai"],p=["author","reviewer-requested"],d=l.includes(a.aiType)?a.aiType:"other-ai",u=p.includes(a.role)?a.role:"author";return{number:B(a.number),title:c(typeof a.title=="string"?a.title:""),url:so(a.url),aiType:d,role:u}})}})}}function Xs(t){let e=c(new Date(t.since).toLocaleDateString());if(!t.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;if(t.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let o={copilot:"\u{1F916} Copilot",claude:"\u{1F9E0} Claude",openai:"\u2728 Codex","other-ai":"\u{1F916} AI"},n="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",r=`${n} text-align: center;`,s=t.repos.map(i=>{let a=`<a href="${c(i.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${c(i.owner)}/${c(i.repo)}</a>`;if(i.error)return`<tr>
				<td style="${n} font-family:'Courier New',monospace; font-size:12px;">${a}</td>
				<td colspan="3" style="${n} color:var(--text-secondary); font-style:italic; font-size:12px;">${c(i.error)}</td>
			</tr>`;let l="";if(i.aiDetails.length>0){let p=i.aiDetails.map(d=>`<li><a href="${c(d.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${d.number} ${c(d.title)}</a> \u2014 ${o[d.aiType]??c(String(d.aiType))} (${d.role==="author"?"authored":"review requested"})</li>`).join("");l=`
				<details style="margin-top:4px; font-size:11px;">
					<summary style="cursor:pointer; color:var(--text-secondary);">Show ${i.aiDetails.length} detail(s)</summary>
					<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${p}</ul>
				</details>`}return`<tr>
			<td style="${n} font-family:'Courier New',monospace; font-size:12px;">${a}${l}</td>
			<td style="${r} font-weight:600;">${i.totalPrs}</td>
			<td style="${r}">${i.aiAuthoredPrs>0?`<span style="font-weight:600;">${i.aiAuthoredPrs}</span>`:"0"}</td>
			<td style="${r}">${i.aiReviewRequestedPrs>0?`<span style="font-weight:600;">${i.aiReviewRequestedPrs}</span>`:"0"}</td>
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
					${s}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2020 Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			\u{1F916} Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`}function Zs(t){let e=t&&typeof t=="object"?t:{},o=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"?c(e.since):new Date(Date.now()-720*60*60*1e3).toISOString(),fetchedAt:typeof e.fetchedAt=="string"?e.fetchedAt:"",totalTasks:B(e.totalTasks),totalSessions:B(e.totalSessions),totalCredits:B(e.totalCredits),repos:o.map(n=>{let r=n&&typeof n=="object"?n:{},s=c(typeof r.owner=="string"?r.owner:""),i=c(typeof r.repo=="string"?r.repo:"");return{owner:s,repo:i,repoUrl:so(`https://github.com/${s}/${i}`),totalTasks:B(r.totalTasks),totalSessions:B(r.totalSessions),totalCredits:B(r.totalCredits),tasksScanned:B(r.tasksScanned),tasksTotal:B(r.tasksTotal),partial:!!r.partial,error:typeof r.error=="string"?c(r.error):void 0}})}}function Kn(t){let e=document.querySelector("#repos-pr-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${Xs(t)}
	`)}function Qs(t,e,o){return t.repos.map(n=>{let r=`<a href="${n.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${n.owner}/${n.repo}</a>`;if(n.error)return`<tr>
        <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${r}</td>
        <td colspan="3" style="${e} color:var(--text-secondary); font-style:italic; font-size:12px;">${n.error}</td>
      </tr>`;let s=n.partial?` <span title="Showing ${n.tasksScanned} of ${n.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${n.tasksScanned}/${n.tasksTotal} tasks scanned)</span>`:"";return`<tr>
      <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${r}${s}</td>
      <td style="${o} font-weight:600;">${n.totalTasks}</td>
      <td style="${o} font-weight:600;">${n.totalSessions}</td>
      <td style="${o}">${n.totalCredits>0?n.totalCredits.toFixed(1):"\u2014"}</td>
    </tr>`}).join("")}function ti(t){if(!t.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;if(t.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let e=new Date(t.since).toLocaleDateString(),o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,r=t.repos.reduce((a,l)=>(l.error||(a.tasks+=l.totalTasks,a.sessions+=l.totalSessions,a.credits+=l.totalCredits),a),{tasks:0,sessions:0,credits:0}),s=t.repos.some(a=>a.partial&&!a.error),i=Qs(t,o,n);return`
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.credits>0?r.credits.toFixed(1):"\u2014"}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${e} to now.
			${s?"<strong>Note:</strong> Some repos were capped at 50 tasks \u2014 totals may be lower bounds. ":""}
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
		</div>`}function Vn(t){let e=document.querySelector("#agent-sessions-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${ti(t)}
	`)}function ei(t){if(!t||!t.workspaces||t.workspaces.length===0)return`
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;let e=t.workspaces.map(o=>{let n=o.typeStatuses??{},r=Object.values(n).every(i=>i==="\u274C"),s=(t.customizationTypes??[]).map(i=>{let a=n[i.id]||"\u2753";return`
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${H(a,a==="\u2705"?"Present and fresh":a==="\u26A0\uFE0F"?"Present but stale":a==="\u274C"?"Missing":"Status unknown")}
				</td>`}).join("");return`
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${c(o.workspaceName)}${r?` <span style="font-family: sans-serif; vertical-align: middle;">${H("\u26A0\uFE0F","No customization files")}</span>`:""}
				</td>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center; color: var(--link-color); font-weight: 600;">
					${o.sessionCount}
				</td>
				${s}
			</tr>`}).join("");return`
		<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				\u{1F6E0}\uFE0F Copilot Customization Files
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				Showing ${t.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${t.workspacesWithIssues>0?`<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${H("\u26A0\uFE0F")} ${t.workspacesWithIssues} workspace(s) have no customization files.</span>`:`<span style="display:inline-flex;align-items:center;gap:4px;">${H("\u2705")} All workspaces have up-to-date customizations.</span>`}
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
					<span style="display:inline-flex;align-items:center;gap:4px;">${H("\u2705")} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${H("\u26A0\uFE0F")} = Present but Stale</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${H("\u274C")} = Missing</span>
				</div>
			</div>
		</div>`}function oi(t){let e=t.last30Days.modelSwitching,o=t.today.modelSwitching;if((e.totalRequests??0)===0&&(o.totalRequests??0)===0)return"";function n(r){let s=r.totalRequests??0;if(s===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let a=[{label:"\u{1F49A} Low cost",count:r.lowCostRequests??0,color:"#4ade80"},{label:"\u{1F535} Medium cost",count:r.mediumCostRequests??0,color:"var(--link-color)"},{label:"\u{1F4B8} High cost",count:r.highCostRequests??0,color:"var(--warning-fg)"},{label:"\u2753 Unknown",count:r.unknownRequests??0,color:"var(--text-muted)"}].filter(p=>p.count>0).map(p=>{let d=s>0?Math.round(p.count/s*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${p.color};">${p.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${d}%; background: ${p.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${g(p.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${d}%)</span></span>
			</div>`}).join(""),l=(r.mixedCostSessions??0)>0?`<div style="font-size: 11px; color: var(--link-color); margin-top: 6px;">\u{1F500} ${g(r.mixedCostSessions)} mixed-cost session${r.mixedCostSessions!==1?"s":""}</div>`:"";return`${a}<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${g(s)} total requests</div>${l}`}return`
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
		</div>`}function ni(t){return t.last30Days.thinkingEffortUsage||t.today.thinkingEffortUsage||t.month.thinkingEffortUsage?`
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Ye(t.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Ye(t.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Ye(t.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`:""}function Ye(t){let e=["minimal","low","medium","high","max","xhigh"];if(!t||t.sessionCount===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.values(t.byEffort).reduce((r,s)=>r+s,0);return`
		${e.filter(r=>t.byEffort[r]>0).concat(Object.keys(t.byEffort).filter(r=>!e.includes(r)&&t.byEffort[r]>0)).map(r=>{let s=t.byEffort[r]||0,i=o>0?Math.round(s/o*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${c(Vr(r))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${i}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${s} <span style="color: var(--text-secondary); font-weight: 400;">(${i}%)</span></span>
			</div>`}).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${t.sessionCount} session${t.sessionCount!==1?"s":""} \xB7 ${t.switchCount} effort switch${t.switchCount!==1?"es":""}</div>
	`}function ri(t){return{allToolKeys:[...new Set([...Object.keys(t.today.toolCalls.byTool),...Object.keys(t.last30Days.toolCalls.byTool),...Object.keys(t.month.toolCalls.byTool)])].sort(),allMcpToolKeys:[...new Set([...Object.keys(t.today.mcpTools.byTool),...Object.keys(t.last30Days.mcpTools.byTool),...Object.keys(t.month.mcpTools.byTool)])].sort(),allMcpServerKeys:[...new Set([...Object.keys(t.today.mcpTools.byServer),...Object.keys(t.last30Days.mcpTools.byServer),...Object.keys(t.month.mcpTools.byServer)])].sort(),allStandardModels:[...new Set([...t.today.modelSwitching.standardModels,...t.last30Days.modelSwitching.standardModels,...t.month.modelSwitching.standardModels])].sort(),allHighCostModels:[...new Set([...t.today.modelSwitching.highCostModels,...t.last30Days.modelSwitching.highCostModels,...t.month.modelSwitching.highCostModels])].sort(),allLowCostModels:[...new Set([...t.today.modelSwitching.lowCostModels,...t.last30Days.modelSwitching.lowCostModels,...t.month.modelSwitching.lowCostModels])].sort(),allMediumCostModels:[...new Set([...t.today.modelSwitching.mediumCostModels,...t.last30Days.modelSwitching.mediumCostModels,...t.month.modelSwitching.mediumCostModels])].sort(),allUnknownModels:[...new Set([...t.today.modelSwitching.unknownModels,...t.last30Days.modelSwitching.unknownModels,...t.month.modelSwitching.unknownModels])].sort()}}function si(t,e){return`
		<div id="tab-panel-health" class="tab-panel"${A!=="health"?' style="display:none"':""}>
			${t}
			${rs(e)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					\u{1F3D7}\uFE0F Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${N&&N.workspaces&&N.workspaces.length>0?`
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;">Analyze All Repositories (${N.workspaces.length})</vscode-button>
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
		</div>`}function ii(t,e,o){return`
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${ea(t)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.today.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${K(V(t.today.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.last30Days.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${K(V(t.last30Days.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(t.month.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${K(V(t.month.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${K(V(t.today.mcpTools.byTool,e),10,Ge)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${K(V(t.last30Days.mcpTools.byTool,e),10,Ge)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${K(V(t.month.mcpTools.byTool,e),10,Ge)}</div></div>
						</div>
					`:""}
				</div>
			</div>
		</div>`}function ai(t,e,o){let n=t.length-e.length,r=e.length>0?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",s=e.length>0?"rgba(251,191,36,0.4)":"rgba(74,222,128,0.4)",i=e.length>0?"#fbbf24":"#4ade80",a=o.totalTokens,l=o.byServer.skill??0,p=o.byServer.builtin??0,d=a-l-p,u=T=>T>=1e3?`~${Math.round(T/1e3)}K`:`~${T}`,h=d+l,k=[];return d>0&&k.push(`${u(d)} MCP`),l>0&&k.push(`${u(l)} skills`),`<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${g(t.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${g(n)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${r}; border:1px solid ${s}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
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
	</div>`}function li(t){if(t.extensionId)return"Extension";if(!t.configFiles||t.configFiles.length===0)return"Settings";let e=new Set;for(let o of t.configFiles){let n=o.replace(/\\/g,"/");n.includes("/.vscode/")?e.add("Workspace"):n.includes("/.vs/")?e.add("Workspace (VS)"):n.includes("/.cursor/")?e.add("Workspace (Cursor)"):n.endsWith("/.mcp.json")?e.add(n.split("/").slice(-2).join("/")):e.add("Config file")}return[...e].join(", ")}function di(t,e){return t.configFiles&&t.configFiles.length===1?` <button class="curation-file-btn" data-command="openFile" data-path="${c(t.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(t.configFiles[0])}">open</button>`:t.configFiles&&t.configFiles.length>1?` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(t.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(e)}">open</button>`:t.extensionId?` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(t.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${c(t.extensionId)}">open</button>`:' <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>'}function ci(t){return t.extensionId?`<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(t.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${c(t.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`:!t.configFiles||t.configFiles.length===0?'<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>':t.configFiles.length===1?`<button class="curation-file-btn" data-command="openFile" data-path="${c(t.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(t.configFiles[0])}">Change Tools</button>`:`<button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(t.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${t.configFiles.length} config files">Change Tools</button>`}function pi(t,e){let o=e.byServer[t.server]??0,n=li(t),r=t.configFiles?.join(`
`)??t.extensionId??"",s=di(t,r),i=ci(t),a=t.availableToolCount===0;return`<tr class="${t.usedToolCount>0?"mcp-has-usage":""}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(t.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${c(r)}">${c(n)}${s}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?'<em style="color:var(--text-secondary)">not connected</em>':t.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?"\u2014":t.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${o>0?`~${o.toLocaleString()} tokens`:"\u2014"}</td>
		<td style="padding:5px 8px; font-size:12px;">${i}</td>
	</tr>`}function ui(t){let e=[...new Set(t.filter(r=>!r.extensionId).flatMap(r=>r.configFiles??[]))],o=e.find(r=>r.replace(/\\/g,"/").endsWith(".vscode/mcp.json"))??e[0];if(!o)return"<code>.vscode/mcp.json</code>";let n=o.replace(/\\/g,"/").split("/").slice(-3).join("/");return`<button class="curation-file-btn" data-command="openFile" data-path="${c(o)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(o)}">${c(n)}</button>`}function gi(t,e,o){let n=[...t].sort((l,p)=>{let d=l.usedToolCount===0?0:l.usedToolCount<l.availableToolCount?1:2,u=p.usedToolCount===0?0:p.usedToolCount<p.availableToolCount?1:2;return d!==u?d-u:l.usedToolCount-p.usedToolCount});if(n.length===0)return"";let r=n.map(l=>pi(l,e)).join(""),s=ui(n),i=n.filter(l=>l.usedToolCount>0).length,a=n.length-i;return`<details style="margin-top:12px;" open>
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
				<tbody>${r}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">\u{1F4A1} Open ${s} to disable file-configured servers, or use <em>Manage Extension</em> to disable or uninstall an MCP-providing extension. (VS Code does not expose per-server picker state to extensions, so servers you disabled in the chat tool picker may still appear here.)</div>
		</div>
	</details>`}function mi(t){if(t.length===0)return"";let e=t.map(o=>{let n=o.configFiles?.[0],r=n?`<button class="curation-file-btn" data-command="openFile" data-path="${c(n)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${c(n)}">View skill</button>`:"\u2014",s="\u2014",i="";o.pluginName?(s=`Plugin: ${o.pluginName}`,i=` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(o.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`):o.skillPath&&(o.skillPath.startsWith(".github/skills")?s="Workspace (.github)":o.skillPath.startsWith(".claude/skills")?s="Workspace (.claude)":o.skillPath.startsWith(".agents/skills")?s="Workspace (.agents)":s="User (~)");let a=Math.round((o.name.length+o.description.length+10)/4);return`<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(o.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s)}${i}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(o.description)}">${c(o.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${a.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${r}</td>
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
	</details>`}function fi(t,e){if(t.length===0)return"";let o=t.map(s=>{let i=`<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(s.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${c(s.pluginName)}">Manage Plugin</button>`;return`<tr class="${s.usedSkillCount===0?"":"plugin-has-usage"}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${s.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${s.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${i}</td>
		</tr>`}).join(""),n=t.filter(s=>s.usedSkillCount===0).length,r=t.length-n;return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F9E9} Agent Plugins in Last ${e} Days (${t.length})
		</summary>
		<style>#plugin-hide-toggle:checked ~ .plugin-table-wrap .plugin-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="plugin-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="plugin-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide plugins with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${n} with no usage \xB7 ${r} with usage</span>
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
	</details>`}function bi(t,e){if(t.length===0)return"";let o=e.byServer.builtin??0,n=t.map(s=>{let i=Math.round((s.name.length+(s.description?.length??0)+10)/4);return`<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(s.description??"")}">${c(s.description??"\u2014")}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${i} tokens</td>
		</tr>`}).join(""),r=s=>s>=1e3?`~${Math.round(s/1e3)}K`:`~${s}`;return`<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F527} Built-in VS Code Tools (${t.length}) \u2014 ${r(o)} tokens overhead, not actionable
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
	</details>`}function hi(t){try{if(!t||t.availableTools.length===0)return dt("render-hidden-empty","buildCurationSectionHtml.hidden",{hasCurationObject:!!t,availableTools:t?.availableTools?.length??0}),"";let{availableTools:e,unusedTools:o,underusedMcpServers:n,underusedAgentPlugins:r,estimatedPromptBloat:s,windowDays:i}=t,a=o.filter(p=>p.source==="skill"),l=e.filter(p=>p.source==="builtin");return G("buildCurationSectionHtml.render",{availableTools:e.length,unusedTools:o.length,unusedSkills:a.length,mcpServers:n.length}),`
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${i} days)</div>
				${ai(e,o,s)}
				${gi(n,s,i)}
				${fi(r,i)}
				${bi(l,s)}
				${mi(a)}
			</div>`}catch(e){return G("buildCurationSectionHtml.error",{error:e instanceof Error?e.message:String(e)}),`
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`}}function yi(){return`
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
		</div>`}function ve(t){let e={tip:"rgba(96,165,250,0.12)",opportunity:"rgba(251,191,36,0.12)",celebration:"rgba(74,222,128,0.12)"},o={tip:"rgba(96,165,250,0.5)",opportunity:"rgba(251,191,36,0.5)",celebration:"rgba(74,222,128,0.5)"},n={tip:"rgba(96,165,250,0.85)",opportunity:"rgba(251,191,36,0.85)",celebration:"rgba(74,222,128,0.85)"},r=e[t.severity]??e.tip,s=o[t.severity]??o.tip,i=n[t.severity]??n.tip,a=t.status==="new",l=t.status==="done",p=t.actionLabel?`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="execute" data-command="${c(t.actionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${s}; border-radius:5px;
				background:${r}; color:var(--text-primary);">${c(t.actionLabel)}</button>`:"",d=l?'<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>':`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${s}; border-radius:5px;
				background:${i}; color:#0d1117;">\u2713 Done</button>`,u=l?"":`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${s}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>`,h=l?"":`<button class="insight-action-btn" data-insight-id="${c(t.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>`;return`
		<div class="insight-card" data-insight-id="${c(t.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${r}; border:1px solid ${s};
			${a?"box-shadow:0 2px 8px "+r+";":""}
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
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${s}; padding-top:10px;">
				${d}
				${u}
			</div>
		</div>`}function vi(t){let e=t.filter(i=>i.status!=="dismissed"),o=e.filter(i=>i.status==="new"),n=e.filter(i=>i.status!=="new"&&i.status!=="done"),r=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(ve).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,s=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(ve).join("")}
		</div>`:"";return`
		<div id="tab-panel-insights" class="tab-panel"${A!=="insights"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F4A1}</span><span>Insights</span></div>
				<div class="section-subtitle">
					Personalized tips based on your usage patterns. Tips are data-driven \u2014 they only appear when relevant to how you code with AI.
				</div>
				<div id="insights-container" style="margin-top:16px;">
					${r}
					${s}
				</div>
			</div>
		</div>`}function xi(t){let e=document.querySelector('.tab-button[data-tab="insights"]');if(!e)return;let o=t.filter(s=>s.status==="new").length,n=o>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${o}</span>`:"",r='<span class="codicon codicon-lightbulb"></span> Insights';e.innerHTML=r+n}function ki(t){let e=document.getElementById("insights-container");if(!e)return;io=t;let o=t.filter(i=>i.status==="new"),n=t.filter(i=>i.status!=="new"&&i.status!=="dismissed"&&i.status!=="done"),r=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(ve).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,s=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(ve).join("")}
		</div>`:"";e.innerHTML=r+s,Gn(),xi(t)}function wi(t){if(t)try{let e=JSON.parse(t);f.postMessage({command:"openFileFromList",paths:e})}catch(e){G("wireCurationButtons.badPathsJson",{error:e instanceof Error?e.message:String(e)})}}function Ci(t){let e=t.getAttribute("data-command");if(e)if(e==="openFile"){let o=t.getAttribute("data-path");o&&f.postMessage({command:"openFile",path:o})}else if(e==="openFileFromList")wi(t.getAttribute("data-paths"));else if(e==="manageExtension"){let o=t.getAttribute("data-extension-id");o&&f.postMessage({command:"manageExtension",extensionId:o})}else if(e==="openAgentPlugins"){let o=t.getAttribute("data-plugin-name")??"";f.postMessage({command:"openAgentPlugins",pluginName:o})}else f.postMessage({command:e})}function Ti(){try{let t=document.getElementById("section-tool-curation");if(!t){dt("wire-no-section","wireCurationButtons.noSection");return}let e=t.querySelectorAll(".curation-file-btn");G("wireCurationButtons.bind",{buttons:e.length}),e.forEach(o=>{o.addEventListener("click",()=>{try{Ci(o)}catch(n){G("wireCurationButtons.clickError",{error:n instanceof Error?n.message:String(n)})}})})}catch(t){G("wireCurationButtons.error",{error:t instanceof Error?t.message:String(t)})}}function Gn(){let t=document.getElementById("insights-container");t&&t.querySelectorAll(".insight-action-btn").forEach(e=>{e.addEventListener("click",()=>{let o=e.getAttribute("data-insight-id"),n=e.getAttribute("data-action");if(!(!o||!n))if(n==="execute"){let r=e.getAttribute("data-command");r&&f.postMessage({command:r})}else f.postMessage({command:"insightAction",id:o,action:n})})})}function Si(t,e,o,n,r,s,i,a,l,p,d,u,h,k){return`
		<style>${To}</style>
		<style>${So}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${xo("btn-usage",!!t.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!q}" aria-controls="about-info-body">
					<span>\u{1F4CB} About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${q?"\u25B8":"\u25BE"}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${q?' style="display:none"':""}>
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
				<button class="tab-button ${A==="worktrees"?"active":""}" data-tab="worktrees"><span class="codicon codicon-git-branch"></span> Worktrees</button>
				<button class="tab-button ${A==="insights"?"active":""}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(t.insights??[]).filter(T=>T.status==="new").length>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(t.insights??[]).filter(T=>T.status==="new").length}</span>`:""}</button>
			</div>

			${Ni(t)}
			${Fi(t,o,n,r,s,i)}
			${da(t,a,l,p,d,u,h,k)}
			${si(e,t)}
			${yi()}
			${Hi()}
			${vi(t.insights??[])}
			<div class="footer">
				Last updated: ${c(new Date(t.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`}function $i(){if(M.length===0)return'<div style="color: var(--text-muted); font-size: 12px; margin: 8px 0;">No root folders added yet. Add a folder to scan for worktrees.</div>';let t=M.length>2,e=!t||Ht,o=t?`<button class="worktree-roots-toggle" id="btn-toggle-worktree-roots" aria-expanded="${Ht}"><span class="worktree-caret">${Ht?"\u25BC":"\u25B6"}</span>${M.length} root folders found</button>`:"",n=e?`<div class="worktree-roots-list">${M.map((r,s)=>`<div class="worktree-root-item"><span title="${c(r)}">${c(r)}</span><button class="button secondary worktree-remove-root" data-index="${s}" ${E?"disabled":""}>\u2715</button></div>`).join("")}</div>`:"";return o+n}function Ai(t,e){let o=t.enriched??0,n=t.enrichTotal??0,r=n>0?Math.round(o/n*100):0;return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F4E6} Computing sizes &amp; push status\u2026</div>
      <div>${o} / ${n} worktree${n===1?"":"s"} analyzed (${e}s)</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${r}%;"></div></div>
    </div>`}function Ei(t,e){let o=t.phase==="walking",n=o?"\u{1F50D} Scanning folder\u2026":"\u23F3 Checking markers\u2026",r=t.dirsScanned??0,s=o?`Exploring for git worktrees \u2014 ${r} folder${r===1?"":"s"} scanned (${e}s)`:`${t.checked} / ${t.total||"?"} .git markers checked \u2014 ${t.foundCount} worktree${t.foundCount===1?"":"s"} found so far (${e}s)`,i=o?100:t.total>0?Math.round(t.checked/t.total*100):0,a=o?"worktree-progress-fill indeterminate":"worktree-progress-fill";return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">${n}</div>
      <div>Folder: <span style="font-family: var(--vscode-editor-font-family, monospace);">${c(t.root||"\u2026")}</span></div>
      <div>${s}</div>
      <div class="worktree-progress-bar"><div class="${a}" style="width: ${i}%;"></div></div>
    </div>`}function Jn(){if(!E)return"";let t=R,e=(t.elapsedMs/1e3).toFixed(1);return t.phase==="enriching"?Ai(t,e):Ei(t,e)}function Yn(){return`
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Root Folders</span></div>
      <div id="worktree-roots-list">${$i()}</div>
      <div class="folder-input-row" style="margin-top: 8px;">
        <input
          type="text"
          id="worktree-root-input"
          class="folder-input"
          placeholder="Paste a root folder path here, e.g. C:\\code\\repos"
          ${E?"disabled":""}
        />
        <button class="button secondary" id="btn-browse-worktree-root" ${E?"disabled":""}>\u{1F4C2} Browse\u2026</button>
        <button class="button secondary" id="btn-add-worktree-root" ${E?"disabled":""}>\u2795 Add</button>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-scan-worktrees" ${E||J||M.length===0?"disabled":""}>\u{1F50D} Scan for Worktrees</button>
        ${E?'<button class="button secondary" id="btn-cancel-worktree-scan">\u2715 Cancel</button>':""}
      </div>
      ${Gt?`<div class="info-box" style="margin-top: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);"><div>\u26A0\uFE0F ${c(Gt)}</div></div>`:""}
      <div id="worktree-progress-area">${Jn()}</div>
    </div>`}function Ri(t){let e=new Map;for(let o of t){let n=o.repoLabel||"Unknown";e.has(n)||e.set(n,[]),e.get(n).push(o)}return e}function we(t){return t.bytes<0}function Yt(t){return t.bytes>0?t.bytes:0}function Mi(t){let e=we(t),o=a=>`<span class="worktree-pending">${E?a:"\u2014"}</span>`,n=t.pushed==="yes"?"\u2705":t.pushed==="no"?"\u{1F534}":"\u2753",r=e?o("checking\u2026"):`${n} ${c(t.pushed)}`,s=e?o("\u2026"):c(String(t.files)),i=e?o("computing\u2026"):`<span title="${t.bytes.toLocaleString()} bytes">${Qt(t.bytes)}</span>`;return`<tr>
    <td title="${c(t.path)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c(t.path)}</td>
    <td>${c(t.branch)}</td>
    <td>${c(t.lastCommit)}</td>
    <td>${r}</td>
    <td>${s}</td>
    <td>${i}</td>
    <td>
      <a href="#" class="worktree-reveal-link" data-path="${encodeURIComponent(t.path)}">Open</a>
      <a href="#" class="worktree-delete-link" data-path="${encodeURIComponent(t.path)}" data-branch="${encodeURIComponent(t.branch)}" data-repo="${encodeURIComponent(t.repoLabel)}" data-pushed="${c(t.pushed)}" title="Remove via git worktree remove (asks for confirmation)">\u{1F5D1}\uFE0F Delete</a>
    </td>
  </tr>`}function Pi(t){return`<div class="table-container">
    <table class="session-table">
      <thead><tr><th>Path</th><th>Branch</th><th>Last Commit</th><th>Pushed</th><th>Files</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody>${[...t].sort((n,r)=>Yt(r)-Yt(n)).map(Mi).join("")}</tbody>
    </table>
  </div>`}function _i(t){let e=t.reduce((r,s)=>r+Yt(s),0),o=t.some(we),n=`<span title="${e.toLocaleString()} bytes">${Qt(e)}</span>`;return o?`${n} <span class="worktree-pending">\u2026</span>`:n}function zi(t,e){let o=he.has(t),n=o?"\u25BC":"\u25B6",r=c(t),s=`<tr class="worktree-repo-row${o?" expanded":""}" data-repo="${r}" aria-expanded="${o}">
    <td><span class="worktree-caret">${n}</span> ${c(t)}</td>
    <td>${e.length}</td>
    <td>${_i(e)}</td>
  </tr>`,i=`<tr class="worktree-repo-details" data-repo="${r}"${o?"":' style="display: none;"'}>
    <td colspan="3">${Pi(e)}</td>
  </tr>`;return s+i}function Xe(t){return Jt!==t?"":Nt==="desc"?" \u25BC":" \u25B2"}function Ii(t){return t.reduce((e,o)=>e+Yt(o),0)}function Li(t,e){let o=Nt==="desc"?-1:1;if(Jt==="repo")return o*t[0].localeCompare(e[0]);let n=s=>Jt==="count"?s.length:Ii(s),r=n(t[1])-n(e[1]);return r!==0?o*r:t[0].localeCompare(e[0])}function Xn(){return D.filter(t=>t.pushed==="yes"&&!we(t))}function Bi(){let t=Xn().length,e=J||pt||E||t===0,o=pt?"\u23F3 Waiting\u2026":`\u{1F9F9} Clean Up (${t})`;return`<div class="summary-card worktree-cleanup-card">
    <div class="summary-label">Pushed Worktrees</div>
    <div class="worktree-cleanup-card-actions">
      <button class="button secondary" id="btn-cleanup-pushed-worktrees" ${e?"disabled":""}>${o}</button>
      ${J?'<button class="button secondary" id="btn-cancel-cleanup">\u2715</button>':""}
    </div>
  </div>`}function Pn(){let t=et.filter(o=>o.status!=="deleted");return t.length===0?"":`<div class="worktree-cleanup-log">${t.map(o=>`<div class="worktree-cleanup-log-row">
      <span>${o.status==="skipped"?"\u23ED\uFE0F":"\u274C"}</span>
      <span class="worktree-cleanup-log-branch">${c(o.branch)}</span>
      <span class="worktree-cleanup-log-repo">${c(o.repoLabel)}</span>
      <span class="worktree-cleanup-log-reason">${c(o.reason||"")}</span>
    </div>`).join("")}</div>`}function Di(){if(J){let{processed:n,total:r}=ao,s=r>0?Math.round(n/r*100):0;return`<div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F9F9} Cleaning up pushed worktrees\u2026</div>
      <div>${n} / ${r} processed</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${s}%;"></div></div>
    </div>${Pn()}`}if(et.length===0)return"";let t=et.filter(n=>n.status==="deleted").length,e=et.filter(n=>n.status==="skipped").length,o=et.filter(n=>n.status==="error").length;return`<div class="info-box" style="margin-top: 12px;">
    <div class="info-box-title">\u{1F9F9} Cleanup finished</div>
    <div>\u2705 ${t} deleted \xB7 \u23ED\uFE0F ${e} skipped (uncommitted/unpushed) \xB7 ${o>0?`\u274C ${o} error${o===1?"":"s"}`:"0 errors"}</div>
  </div>${Pn()}`}function Zn(){if(D.length===0)return E?'<div style="padding: 16px; color: var(--text-muted);">Discovering worktrees\u2026</div>':'<div style="padding: 16px; color: var(--text-muted);">No worktrees found yet. Add root folders above and click Scan.</div>';let t=Ri(D),e=D.reduce((l,p)=>l+Yt(p),0),o=D.some(we),n=`${Qt(e)}${o?' <span class="worktree-pending">\u2026</span>':""}`,r=`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F333} Worktrees</div><div class="summary-value">${D.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4E6} Repositories</div><div class="summary-value">${t.size}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4BE} Total Size</div><div class="summary-value" title="${e.toLocaleString()} bytes">${n}</div></div>
    ${Bi()}
  </div>`,i=[...t.entries()].sort(Li).map(([l,p])=>zi(l,p)).join(""),a=`<div class="table-container">
    <table class="session-table worktree-repo-table">
      <thead><tr>
        <th class="sortable" data-wt-sort="repo">Repository${Xe("repo")}</th>
        <th class="sortable" data-wt-sort="count">Worktrees${Xe("count")}</th>
        <th class="sortable" data-wt-sort="size">Size${Xe("size")}</th>
      </tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`;return r+Di()+a}function Hi(){return`
    <div id="tab-panel-worktrees" class="tab-panel"${A!=="worktrees"?' style="display:none"':""}>
      <div class="info-box">
        <div class="info-box-title">\u{1F333} Worktree Discovery</div>
        <div>
          Scans folders for uncleaned git worktrees and reports disk usage grouped by repository (based on each
          worktree's git remote). Add one or more root folders below, then click Scan. Results stream in as they're found.
        </div>
      </div>
      <div id="worktree-controls">${Yn()}</div>
      <div id="worktree-results">${Zn()}</div>
    </div>`}function Ni(t){Array.isArray(t.todaySessions)&&(oo=t.todaySessions);let e=P==="today"?oo:xt[P],o=e?no(e):`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${Zt[P]}\u2026</div>`;return`
		<div id="tab-panel-sessions" class="tab-panel"${A!=="sessions"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>\u{1F4CB}</span><span>Recent Sessions</span>
					<span id="sessions-lookback-wrapper" style="margin-left:auto;"></span>
					${ds()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period \u2014 sorted by number of interactions (most active first).</div>
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${o}
				</div>
			</div>
		</div>`}function Ui(t){let e=$(t.pctAvailable,1),o=$(100-t.pctAvailable,1),n=Math.min(100-t.pctAvailable,100),r=n>90?"var(--error-color, #f14c4c)":n>75?"var(--warning-color, #cca700)":"var(--accent-color, #4d9cf8)";return`
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
				<div style="height:100%; width:100%; background:${r}; border-radius:4px; transform-origin:left; transform:scaleX(${$(n/100,4)});"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 \xB7 Budget = $${$(t.budgetUsd,2)}/month
			</div>
		</div>`}function Oi(t){let e=Object.values(t).reduce((n,r)=>n+r,0);return`
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${Object.entries(t).sort(([,n],[,r])=>r-n).map(([n,r])=>`
			<tr>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${c(n)}</td>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${$(r,2)}</td>
			</tr>`).join("")}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${$(e,2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function ji(t,e,o){if(!t)return`
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				\u2139\uFE0F No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions \u2014 it cannot see web chat, cloud agent, or review agent usage.
			</div>`;if(e<=0)return"";let n=t.usedAiCredits*.01,r=n-e,s=Math.round(r*100),i=s>0?`<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${$(r,2)} (${g(s)} credits)</span></div>`:"",a=o>.001?`<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${$(o,2)}</span></div>`:"",l=s>0?'<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">\u2139\uFE0F The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> \u2014 all counted against your AI Credit budget.</div>':'<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">\u2705 Extension-tracked Copilot usage matches the API \u2014 no significant untracked usage from web chat, cloud agent, or review agent.</div>';return`
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${$(n,2)} (${g(t.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${$(e,2)} (${g(Math.round(e*100))} credits)</span></div>
				${i}${a}
			</div>
			${l}
		</div>`}function Wi(t){let e=t.copilotApiBalance,o=t.monthBillingGroupCosts;if(!e&&(!o||Object.keys(o).length===0))return"";let n=o?.["GitHub Copilot"]??0,s=(o?Object.values(o).reduce((p,d)=>p+d,0):0)-n,i=e?Ui(e):"",a=o&&Object.keys(o).length>0?Oi(o):"",l=ji(e,n,s);return`
		<div class="section">
			<div class="section-title"><span>\u{1F4B3}</span><span>Copilot Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs.</div>
			${i}
			${a}
			${l}
		</div>`}function Fi(t,e,o,n,r,s){let i=oi(t),a=Wi(t);return`
		<div id="tab-panel-activity" class="tab-panel"${A!=="activity"?' style="display:none"':""}>
			${n}
			${a}
			<!-- Mode Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${An(t.today.modeUsage,"\u{1F4C5} Today")}
					${An(t.last30Days.modeUsage,"\u{1F4CA} Last 30 Days")}
				</div>
			</div>
			${ta(t,r,s)}
			${e}
			${i}
			${sa(t)}
			${o}
			${Xi(t)}
		</div>`}var qi=j("__MODEL_PRICING__"),Ki=qi?.pricing??{};function Qn(t){let e=null;for(let o of t){let n=Ao(o,Ki);n&&(!e||n.thresholdTokens<e.thresholdTokens)&&(e={...n,model:o})}return e}function Vi(t){let e=t*4/1048576,o=Math.round(t/10/1e3);return`\u2248${$(e,1)} MB of code (~${g(o)}K lines)`}function Gi(t,e){let o=t/e.thresholdTokens*100,n=Math.min(o,100),r=o>100?"var(--error-color, #f14c4c)":o>=70?"var(--warning-color, #cca700)":"var(--success-color, #89d185)",s=c(St(e.model)),i=`above it, input billing goes $${e.defaultInputCostPerMillion.toFixed(2)} \u2192 $${e.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;return`
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${g(t)} tokens \u2014 ${$(o,0)}% of the ${g(e.thresholdTokens)}-token default tier for ${s}</span>
				<span>${g(e.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${$(n,0)}%; background:${r}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${Vi(e.thresholdTokens)}; ${i}.</div>
		</div>`}function fo(t,e,o,n){return`
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${n?` title="${n}"`:""}>${t}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${e}</div>
			${o?`<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${o}</div>`:""}
		</div>`}function Ji(t){if(t.maxRequestInputTokens<=0)return"";let e=Qn(t.maxRequestModels),o=c(t.maxRequestModels.map(r=>St(r)).join(", ")||"\u2014"),n=e?`${$(t.maxRequestInputTokens/e.thresholdTokens*100,0)}% of the ${g(e.thresholdTokens)}-token price line \xB7 ${o}`:`${o} \u2014 no long-context surcharge for ${t.maxRequestModels.length>1?"these models":"this model"}`;return fo("\u{1F4CF} Largest request",`${g(t.maxRequestInputTokens)} input tokens`,n,"The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period")}function Yi(t){if((t.maxReachedTokens??0)<=0)return"";let e=t.maxReachedWindowLimit,o=e?`${g(t.maxReachedTokens)} of ${g(e)} (${$(t.maxReachedTokens/e*100,0)}%)`:g(t.maxReachedTokens);return fo("\u{1FA9F} Fullest CLI window",o,void 0,"The highest context fill recorded for a Copilot CLI session in this period, versus its window limit")}function Ze(t){if(!(!!t&&(t.maxRequestInputTokens>0||(t.maxReachedTokens??0)>0||Object.keys(t.tierCounts).length>0)))return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.entries(t.tierCounts),n=o.reduce((s,[,i])=>s+i,0),r=o.length>0?fo("\u{1FA9C} Context tiers",o.map(([s,i])=>`${c(s)} \xD7${i}`).join(", "),`${n} Copilot CLI session${n===1?"":"s"} grouped by chosen window size \u2014 "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,"Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier"):"";return Ji(t)+Yi(t)+r}function Xi(t){let e=t.last30Days.contextWindow,o=e&&e.maxRequestInputTokens>0?Qn(e.maxRequestModels):null,n=e&&o?Gi(e.maxRequestInputTokens,o):"";return`
		<div class="section">
			<div class="section-title"><span>\u{1FA9F}</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Ze(t.today.contextWindow)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Ze(e)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Ze(t.lastMonth.contextWindow)}
				</div>
			</div>
			${n}
		</div>`}function me(t,e=""){let o=t>0?"":" ctx-ref-zero";return`<td class="${`ctx-ref-num${e?" "+e:""}${o}`}">${t}</td>`}function _n(t,e,o){let i=[t,e,o],a=Math.max(...i),l=i.map((u,h)=>{let k=2+h*(56/(i.length-1)),T=a===0?18:2+(1-u/a)*16;return`${k.toFixed(1)},${T.toFixed(1)}`}).join(" "),d=a===0?"var(--text-muted)":o>=e&&e>=t?"var(--link-color)":o<=e&&e<=t?"#f87171":"var(--text-secondary)";return`<td class="ctx-ref-spark"><svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><polyline points="${l}" fill="none" stroke="${d}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${i.map((u,h)=>{let k=2+h*(56/(i.length-1)),T=a===0?18:2+(1-u/a)*16;return`<circle cx="${k.toFixed(1)}" cy="${T.toFixed(1)}" r="2" fill="${d}"/>`}).join("")}</svg></td>`}function Zi(t,e){return`
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
					${t.slice().sort((n,r)=>r.last30-n.last30).map(n=>`<tr${n.title?` title="${c(n.title)}"`:""}><td class="ctx-ref-name">${n.label}</td>${me(n.today,n.today>0?"ctx-ref-today-active":"")}${me(n.month)}${me(n.lastMonth)}${me(n.last30)}${_n(n.lastMonth,n.month,n.today)}</tr>`).join("")}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${e.today}</td>
						<td class="ctx-ref-num">${e.month}</td>
						<td class="ctx-ref-num">${e.lastMonth}</td>
						<td class="ctx-ref-num">${e.last30}</td>
						<td class="ctx-ref-spark">${_n(e.lastMonth,e.month,e.today).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,"")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function Qi(t,e,o){let n=d=>d||0,r=[{label:"\u{1F4C4} #file",get:d=>d.file},{label:"\u2702\uFE0F #selection",get:d=>d.selection},{label:"\u2728 Implicit Selection",title:"Text selected in your editor providing passive context to Copilot",get:d=>d.implicitSelection},{label:"\u{1F524} #symbol",get:d=>d.symbol},{label:"\u{1F5C2}\uFE0F #codebase",get:d=>d.codebase},{label:"\u{1F4C1} @workspace",get:d=>d.workspace},{label:"\u{1F4BB} @terminal",get:d=>d.terminal},{label:"\u{1F527} @vscode",get:d=>d.vscode},{label:"\u2328\uFE0F #terminalLastCommand",title:"Last command run in the terminal",get:d=>n(d.terminalLastCommand)},{label:"\u{1F5B1}\uFE0F #terminalSelection",title:"Selected terminal output",get:d=>n(d.terminalSelection)},{label:"\u{1F4CB} #clipboard",title:"Clipboard contents",get:d=>n(d.clipboard)},{label:"\u{1F4DD} #changes",title:"Uncommitted git changes",get:d=>n(d.changes)},{label:"\u{1F4E4} #outputPanel",title:"Output panel contents",get:d=>n(d.outputPanel)},{label:"\u26A0\uFE0F #problemsPanel",title:"Problems panel contents",get:d=>n(d.problemsPanel)},{label:"\u{1F500} #pr",title:"Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary",get:d=>n(d.pullRequest)},{label:"\u{1F4F7} Images",title:"Pasted images and vision context detected in session logs",get:d=>n(d.byKind["copilot.image"])},{label:"\u{1F4CB} Prompt Files",title:".github/prompts/ prompt file uses detected in session logs",get:d=>n(d.byKind.promptFile)},{label:"\u{1F4D0} Code Lines",title:"Total lines of code referenced via #file: range selections",get:d=>n(d.codeContextLines)},{label:"\u{1F3AF} Custom Prompts",title:"Custom /command prompt uses detected in session logs",get:d=>n(d.byKind.prompt)},{label:"\u{1F4CB} Copilot Instructions",title:"copilot-instructions.md file references detected in session logs",get:d=>d.copilotInstructions},{label:"\u{1F916} Agents.md",title:"agents.md file references detected in session logs",get:d=>d.agentsMd}],s=t.last30Days.contextReferences,i=t.month.contextReferences,a=t.lastMonth.contextReferences,l=t.today.contextReferences,p=r.map(d=>({label:d.label,title:d.title,last30:d.get(s),month:d.get(i),lastMonth:d.get(a),today:d.get(l)}));return Zi(p,{last30:o,month:Ct(i),lastMonth:Ct(a),today:e})}function ta(t,e,o){let n=Object.keys(t.last30Days.contextReferences.byKind).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(t.last30Days.contextReferences.byKind).sort(([,s],[,i])=>i-s).slice(0,5).map(([s,i])=>`<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${c(s)}:</span> ${i}</div>`).join("")}
			</div>
		</div>
	`:"",r=Object.keys(t.last30Days.contextReferences.byPath).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(t.last30Days.contextReferences.byPath).sort(([,s],[,i])=>i-s).slice(0,10).map(([s,i])=>`<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${i}\xD7</span> ${c(s)}</div>`).join("")}
			</div>
		</div>
	`:"";return`
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${Qi(t,e,o)}
			${n}
			${r}
		</div>`}function ea(t){let e=Yr(t);if(e.length===0)return"";let o=Xr(e);return`
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${e.map(r=>{let s=(t.today.toolCalls.byTool[r]||0)+(t.today.mcpTools.byTool[r]||0),i=(t.last30Days.toolCalls.byTool[r]||0)+(t.last30Days.mcpTools.byTool[r]||0),a=(t.month.toolCalls.byTool[r]||0)+(t.month.mcpTools.byTool[r]||0),l=[];s>0&&l.push(`${s} today`),i>s&&l.push(`${i} in the last 30d`),a>i&&l.push(`${a} this month`);let p=l.length>0?`<span style="color:var(--text-muted);"> (${l.join(" | ")})</span>`:"",d=`<button data-suppress-tool="${c(r)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${c(r)}">\u{1F507}</button>`;return`<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${c(r)}${p}${d}</span>`}).join(" ")}
			</div>
			<a href="${c(o)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`}var oa={today:"today",last30:"last30Days",currentMonth:"month"},zn="last30",tr="last30Days",xe="calls",Kt="desc",er={},bo=!0;function In(t){return t===null?"\u2014":t>=.01?wo(t):`$${t.toFixed(2)}`}function Ln(t){return t===null?"\u2014":Y(t*100)}function Bn(t){return t===null?"\u2014":$(t,2)}var ke=[{sortKey:"model",label:"Model",title:"Model identifier",align:"left",sortValue:t=>t.model,render:t=>c(St(t.model))},{sortKey:"calls",label:"Turns",title:"User-request turns attributed to this model",align:"right",sortValue:t=>t.counters.calls,render:t=>t.counters.calls>0?g(t.counters.calls):"\u2014"},{sortKey:"editTurns",label:"Edit turns",title:"Turns containing at least one file-edit tool call",align:"right",sortValue:t=>t.counters.editTurns,render:t=>t.counters.calls>0?g(t.counters.editTurns):"\u2014"},{sortKey:"oneShotRate",label:"One-shot edit rate",title:"Share of edit turns completed without retries or self-corrections",align:"right",sortValue:t=>t.rates.oneShotRate,render:t=>Ln(t.rates.oneShotRate)},{sortKey:"retryRate",label:"Retries/edit",title:"Average immediate same-file retries per edit turn",align:"right",sortValue:t=>t.rates.retryRate,render:t=>Bn(t.rates.retryRate)},{sortKey:"selfCorrectionRate",label:"Self-corr/edit",title:"Average self-corrections (re-edits after other tool calls) per edit turn",align:"right",sortValue:t=>t.rates.selfCorrectionRate,render:t=>Bn(t.rates.selfCorrectionRate)},{sortKey:"costPerCall",label:"Cost/turn",title:"Average estimated cost per turn (provider rates)",align:"right",sortValue:t=>t.rates.costPerCall,render:t=>In(t.rates.costPerCall)},{sortKey:"costPerEdit",label:"Cost/edit",title:"Average estimated cost per edit turn (provider rates)",align:"right",sortValue:t=>t.rates.costPerEdit,render:t=>In(t.rates.costPerEdit)},{sortKey:"outputTokensPerCall",label:"Out tok/turn",title:"Average output tokens per turn",align:"right",sortValue:t=>t.rates.outputTokensPerCall,render:t=>t.rates.outputTokensPerCall===null?"\u2014":ko(Math.round(t.rates.outputTokensPerCall))},{sortKey:"cacheHitRate",label:"Cache hit",title:"Cache-read share of input tokens",align:"right",sortValue:t=>t.rates.cacheHitRate,render:t=>Ln(t.rates.cacheHitRate)}];function na(t){return xe!==t?"":Kt==="desc"?" \u25BC":" \u25B2"}function ra(t){let e=Object.entries(t).map(([n,r])=>({model:n,counters:r,rates:Eo(r)})),o=ke.find(n=>n.sortKey===xe)??ke[1];return e.sort((n,r)=>{let s=o.sortValue(n),i=o.sortValue(r);if(s===null&&i===null)return 0;if(s===null)return 1;if(i===null)return-1;let a=typeof s=="string"||typeof i=="string"?String(s).localeCompare(String(i)):s-i;return Kt==="desc"?-a:a}),e}function or(){let t=er[tr];if(!t||Object.keys(t).length===0)return'<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No per-model efficiency data recorded for this period yet.</div>';let e=ra(t),o="";if(bo){let s=Ro(t);if(s!==null){let i=e.length;e=e.filter(l=>l.counters.calls>s);let a=i-e.length;a>0&&(o=`<div style="color:var(--text-secondary); font-size:11px; padding:4px 8px 2px;">${a} model${a===1?"":"s"} hidden (\u2264${s} turn${s===1?"":"s"})</div>`)}}let n=e.map(s=>`<tr>${ke.map(a=>`<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${a.align==="right"?"text-align:right;":""}">${a.render(s)}</td>`).join("")}</tr>`).join("");return`
		<div style="overflow-x:auto;">
		<table style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">${ke.map(s=>{let i=s.align==="right"?" text-align:right;":"";return`<th class="sortable" data-eff-sort="${s.sortKey}" title="${s.title}" style="padding:6px 8px; cursor:pointer;${i}">${s.label}${na(s.sortKey)}</th>`}).join("")}</tr>
			</thead>
			<tbody>${n}</tbody>
		</table>
		</div>
		${o}`}function sa(t){return er={today:t.today.modelEfficiency,last30Days:t.last30Days.modelEfficiency,month:t.month.modelEfficiency},`
		<div class="section" id="section-model-efficiency">
			<div class="section-title"><span>\u{1F3AF}</span><span>Model Efficiency</span></div>
			<div class="section-subtitle">Compare models on quality and efficiency, not just cost \u2014 one-shot edit rate, retries, self-corrections, per-turn cost, and cache hit rate. Retry/self-correction detection needs structured tool-call data, so some editors show token metrics only.</div>
			<div id="model-efficiency-controls" style="display:flex; gap:6px; flex-wrap:wrap; margin:8px 0;"><span id="model-efficiency-period-selector"></span></div>
			<div style="margin:2px 0 8px 0;">
				<label style="display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--text-secondary); cursor:pointer;" title="Shows only models above the 25th-percentile turn count (Q1). Uncheck to see all models.">
					<input type="checkbox" id="eff-filter-low-usage"${bo?" checked":""} style="cursor:pointer;">
					Hide low-usage models
				</label>
			</div>
			<div id="model-efficiency-table">${or()}</div>
		</div>`}function ia(){let t=document.getElementById("model-efficiency-period-selector");if(!t)return;t.replaceChildren();let{wrapper:e}=Ce({selected:zn,disabled:["last7","allTime"],disabledTitle:"Not available for model efficiency",label:"",onChange:o=>{let n=oa[o];n&&(zn=o,tr=n,ho())}});t.append(e)}function ho(){let t=document.getElementById("model-efficiency-table");t&&(t.innerHTML=or())}function aa(t){let e=t.getAttribute("data-eff-sort");e&&(xe===e?Kt=Kt==="desc"?"asc":"desc":(xe=e,Kt=e==="model"?"asc":"desc"),ho())}function la(){let t=document.getElementById("section-model-efficiency");t&&(t.addEventListener("click",e=>{let n=e.target.closest("th[data-eff-sort]");n&&aa(n)}),t.addEventListener("change",e=>{let o=e.target;o.id==="eff-filter-low-usage"&&(bo=o.checked,ho())}))}function da(t,e,o,n,r,s,i,a){return`
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
						${K(V(t.today.toolCalls.byTool,e),10)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(t.last30Days.toolCalls.total)}</div>
							${K(V(t.last30Days.toolCalls.byTool,e),10)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(t.month.toolCalls.total)}</div>
							${K(V(t.month.toolCalls.byTool,e),10)}
						</div>
					</div>
				</div>
			</div>

			${ii(t,o,n)}
			${hi(be??t.curationAnalysis)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${Je("\u{1F4C5} Today",t.today.modelSwitching,s,i,r,a)}
					${Je("\u{1F4C6} Last 30 Days",t.last30Days.modelSwitching,s,i,r,a)}
					${Je("\u{1F4C5} Previous Month",t.month.modelSwitching,s,i,r,a)}
				</div>
			</div>
		</div>`}function nr(t){let e=document.getElementById("root");if(!e)return;let o=t.customizationMatrix??U?.customizationMatrix??null;N=o??null,(!N||N.workspaces.length===0)&&(_=null),Array.isArray(t.currentWorkspacePaths)&&(Dn=t.currentWorkspacePaths),t.curationAnalysis?(be=t.curationAnalysis,G("renderLayout.curation.cached",{availableTools:be.availableTools.length,unusedTools:be.unusedTools.length})):dt("render-no-curation-update","renderLayout.curation.notProvidedInUpdate");let n=ei(o),r=ri(t),s=Ct(t.today.contextReferences),i=Ct(t.last30Days.contextReferences),a=ni(t),l=`
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${g(t.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${g(t.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${g(t.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${g(t.lastMonth.sessions)}</div></div>
			</div>
		</div>`;e.innerHTML=Si(t,n,"",a,l,s,i,r.allToolKeys,r.allMcpToolKeys,r.allMcpServerKeys,r.allHighCostModels,r.allLowCostModels,r.allMediumCostModels,r.allUnknownModels),pa(),ca(),ua(),Ti(),ot(),Js(),la(),ia(),jn(),Ss(),ga(),io=t.insights??[],Gn()}function ca(){let t=document.getElementById("about-info-toggle"),e=document.getElementById("about-info-body");if(!t||!e)return;let o=t.querySelector(".info-box-chevron"),n=()=>{q=!q,e.style.display=q?"none":"",t.setAttribute("aria-expanded",String(!q)),o&&(o.textContent=q?"\u25B8":"\u25BE"),f.setState({...f.getState()??{},aboutCollapsed:q})};t.addEventListener("click",n),t.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),n())})}function pa(){document.getElementById("btn-refresh")?.addEventListener("click",()=>{f.postMessage({command:"refresh"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{f.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{f.postMessage({command:"showChart"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{f.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{f.postMessage({command:"showMaturity"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{f.postMessage({command:"showDashboard"})}),document.getElementById("btn-environmental")?.addEventListener("click",()=>{f.postMessage({command:"showEnvironmental"})}),Co(f)}function ua(){document.getElementById("btn-analyse-repo")?.addEventListener("click",()=>{let t=document.getElementById("btn-analyse-repo");t&&(t.disabled=!0,t.textContent="Analyzing..."),f.postMessage({command:"analyseRepository"})}),document.getElementById("btn-analyse-all")?.addEventListener("click",()=>{let t=document.getElementById("btn-analyse-all");t&&(t.disabled=!0,t.textContent="Analyzing All..."),Vt=!0,ct=!0,_=null,ot(),f.postMessage({command:"analyseAllRepositories"})}),document.getElementById("repo-list-pane")?.addEventListener("click",t=>{let o=t.target.closest(".btn-repo-action");if(!o)return;let n=o.getAttribute("data-workspace-path"),r=o.getAttribute("data-action");if(!(!n||!r)){if(r==="details"){_=n,ct=!1,ot();return}r==="analyze"&&(o.disabled=!0,o.textContent="Analyzing...",Vt=!1,f.postMessage({command:"analyseRepository",workspacePath:n}))}}),document.getElementById("repo-details-pane")?.addEventListener("click",t=>{t.target.closest("#btn-switch-repository")&&(ct=!0,ot())})}function ga(){Array.from(document.getElementsByClassName("cf-copy")).forEach(t=>{t.addEventListener("click",e=>{let o=e.currentTarget,n=o.getAttribute("data-path")||"";navigator.clipboard&&n&&navigator.clipboard.writeText(n).then(()=>{o.textContent="Copied",setTimeout(()=>{o.textContent="Copy"},1200)}).catch(()=>{f.postMessage({command:"copyFailed",path:n})})})})}function ma(t){Qe(),t.data?.locale&&Te(t.data.locale),typeof t.data?.use24HourTime=="boolean"&&(ye=t.data.use24HourTime);let e=fs(t.data);if(e){co=!1;for(let o of Object.keys(xt))delete xt[o];nr(e),On(),ot(),jt&&Kn(jt),Wt&&Vn(Wt)}else dt("update-invalid-sanitized","handleUpdateStats.sanitizeReturnedNull"),Hn("Received invalid data from the extension. Try refreshing.")}function rr(t){if(!t)return;let e=document.getElementById("unknown-mcp-tools-section");e&&(e.querySelectorAll("button[data-suppress-tool]").forEach(o=>{o.getAttribute("data-suppress-tool")===t&&o.closest("span")?.remove()}),e.querySelectorAll("button[data-suppress-tool]").length===0&&e.remove())}function fa(){A="tools",document.querySelectorAll(".tab-button").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-tab")==="tools")}),document.querySelectorAll(".tab-panel").forEach(o=>{o.style.display="none"});let t=document.getElementById("tab-panel-tools");t&&(t.style.display="block");let e=document.getElementById("unknown-mcp-tools-section");e&&(e.scrollIntoView({behavior:"smooth",block:"center"}),e.style.transition="box-shadow 0.3s ease",e.style.boxShadow="0 0 0 3px var(--vscode-focusBorder)",setTimeout(()=>{e.style.boxShadow=""},2e3))}function ba(t){jt=Ys(t),jt.authenticated||(to=!1),Kn(jt)}function ha(t){!t||typeof t!="object"||(Wt=Zs(t),Wt.authenticated||(eo=!1),Vn(Wt))}function ya(t){if(!Array.isArray(t))return;let e=Wn(t);ki(e)}function va(t){switch(t.command){case"usageLoadingProgress":return qr(t),!0;case"usageRefreshing":return Qe(),Ot=0,lo("Refreshing Usage Analysis"),!0;case"updateStatsError":return Qe(),Hn("Failed to calculate usage analysis. Check the Output panel for details."),!0}return!1}function xa(t){if(!va(t))switch(t.command){case"repoAnalysisResults":Ba(t.data,t.workspacePath);break;case"repoAnalysisError":Da(t.error,t.workspacePath);break;case"repoAnalysisBatchComplete":Ha();break;case"updateStats":ma(t);break;case"toolSuppressed":rr(t.toolName);break;case"highlightUnknownTools":fa();break;case"repoPrStatsLoaded":ba(t.data);break;case"repoPrStatsProgress":En("#repos-pr-content","repos-pr-progress","Fetching PRs\u2026",t.done,t.total);break;case"agentSessionsLoaded":ha(t.data);break;case"recentSessionsLoaded":ps(t);break;case"agentSessionsProgress":En("#agent-sessions-content","agent-sessions-progress","Fetching agent sessions\u2026",t.done,t.total);break;case"updateInsights":ya(t.insights);break;case"switchTab":ka(t);break;default:Gs(t);break}}function ka(t){if(document.querySelector(`.tab-button[data-tab="${String(t.tab)}"]`)?.click(),t.anchor){let o=document.getElementById(String(t.anchor));o&&setTimeout(()=>o.scrollIntoView({behavior:"smooth",block:"start"}),50)}}$o(t=>{xa(t)});function wa(t){return N?.workspaces.find(o=>o.workspacePath===t)?.workspaceName||t}function Ca(t){let e=Xt.get(t);if(e?.data?.summary){let o=nt(e.data.summary.percentage);return`${Math.round(o)}%`}return e?.error?"Error":"\u2014"}function nt(t){let e=typeof t=="number"?t:Number(t);return Number.isFinite(e)?e:0}var Ta={"git-repo":"https://docs.github.com/en/get-started/using-git/about-git",gitignore:"https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files","env-example":"https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",editorconfig:"https://editorconfig.org/",linter:"https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",formatter:"https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide","type-safety":"https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries","commit-messages":"https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits","conventional-commits":"https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets","ci-config":"https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",scripts:"https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs","task-runner":"https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",devcontainer:"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",dockerfile:"https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry","version-pinning":"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",license:"https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"},Sa={versionControl:"\u{1F504} Version Control",codeQuality:"\u2728 Code Quality",cicd:"\u{1F680} CI/CD",environment:"\u{1F527} Environment",documentation:"\u{1F4DA} Documentation"};function $a(t){let e=m("div");e.setAttribute("style","display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");let o=m("div");o.setAttribute("style","font-size: 14px; font-weight: 600; color: var(--text-primary);"),o.textContent="\u{1F4CA} Repository Hygiene Score";let n=m("div");return n.setAttribute("style","font-size: 24px; font-weight: 700; color: var(--link-color);"),n.textContent=`${Math.round(nt(t.percentage))}%`,e.append(o,n),e}function Aa(t){let e=m("div");e.setAttribute("style","display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");let o=[{count:t.passedChecks,label:"Passed",cardStyle:"text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--success-fg);"},{count:t.warningChecks,label:"Warnings",cardStyle:"text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--warning-fg);"},{count:t.failedChecks,label:"Failed",cardStyle:"text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: #ef4444;"}];for(let n of o){let r=m("div");r.setAttribute("style",n.cardStyle);let s=m("div");s.setAttribute("style",n.countStyle),s.textContent=String(nt(n.count));let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--text-secondary);"),i.textContent=n.label,r.append(s,i),e.appendChild(r)}return e}function Ea(t){let e=t?.status==="pass"||t?.status==="warning"?t.status:"fail";return{status:e,emoji:e==="pass"?"\u2705":e==="warning"?"\u26A0\uFE0F":"\u274C",color:e==="pass"?"#22c55e":e==="warning"?"#f59e0b":"#ef4444"}}function Ra(t,e){let o=m("div");o.setAttribute("style","flex: 1;");let n=m("div");n.setAttribute("style",`font-size: 12px; font-weight: 600; color: ${e};`),n.textContent=typeof t?.label=="string"?t.label:"";let r=m("div");if(r.setAttribute("style","font-size: 11px; color: var(--text-secondary); margin-top: 2px;"),r.textContent=typeof t?.detail=="string"?t.detail:"",o.append(n,r),typeof t?.hint=="string"&&t.hint.length>0){let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;"),i.textContent=`\u{1F4A1} ${t.hint}`,o.appendChild(i)}let s=Ta[typeof t?.id=="string"?t.id:""];if(s){let i=m("a");i.setAttribute("href",s),i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;"),i.setAttribute("title","View official documentation"),i.textContent="\u{1F4D6} View documentation",o.appendChild(i)}return o}function Ma(t){let{emoji:e,color:o}=Ea(t),n=m("div");n.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");let r=m("span");r.setAttribute("style","flex-shrink: 0; padding-top: 1px;"),r.innerHTML=H(e);let s=m("span");return s.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),s.textContent=`+${nt(t?.weight)}`,n.append(r,Ra(t,o),s),n}function Pa(t,e,o){let n=m("div");n.setAttribute("style","margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let r=m("div");r.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");let s=m("span");s.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),s.textContent=Sa[t]||t;let i=o?.categories?.[t],a=m("span");a.setAttribute("style","font-size: 11px; color: var(--link-color); font-weight: 600;"),a.textContent=`${Math.round(nt(i?.percentage))}%`,r.append(s,a),n.appendChild(r);for(let l of e)n.appendChild(Ma(l));return n}function _a(t){let e=m("div");e.setAttribute("style","margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let o=m("div");o.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");let n=m("span");n.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),n.textContent="\u{1F4A1} Top Recommendations",o.appendChild(n),e.appendChild(o);for(let r of t.slice(0,5)){let s=r?.priority==="high"||r?.priority==="medium"?r.priority:"low",i=s==="high"?"#ef4444":s==="medium"?"#f59e0b":"#60a5fa",a=m("div");a.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");let l=m("span");l.setAttribute("style",`font-size: 10px; font-weight: 600; color: ${i}; min-width: 50px;`),l.textContent=String(s).toUpperCase();let p=m("div");p.setAttribute("style","flex: 1;");let d=m("div");d.setAttribute("style","font-size: 11px; color: var(--text-primary);"),d.textContent=typeof r?.action=="string"?r.action:"";let u=m("div");u.setAttribute("style","font-size: 10px; color: var(--text-muted); margin-top: 2px;"),u.textContent=typeof r?.impact=="string"?r.impact:"",p.append(d,u);let h=m("span");h.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),h.textContent=`+${nt(r?.weight)}`,a.append(l,p,h),e.appendChild(a)}return e}function za(t,e){let o=m("div");o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");let n=m("div");n.setAttribute("style","font-size: 11px; color: var(--text-secondary); flex: 1;"),n.textContent="Let Copilot help you fix the identified issues in this repository.";let r=document.createElement("vscode-button");return r.setAttribute("style","min-width: 180px;"),r.textContent="\u{1F916} Ask Copilot to Improve",r.addEventListener("click",()=>{let i=`Please help me improve this repository by addressing the following best practice issues:

${t.map(l=>`- ${l.label}: ${l.detail||""}${l.hint?` (${l.hint})`:""}`).join(`
`)}

For each issue, please provide specific steps or code changes to fix it.`;if(!e||Dn.some(l=>l.toLowerCase()===e.toLowerCase()))f.postMessage({command:"openCopilotChatWithPrompt",prompt:i});else{let l=e.split(/[/\\]/).filter(Boolean).pop()??e;o.replaceChildren(),o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");let p=m("div");p.setAttribute("style","font-size: 11px; color: var(--warning-fg);"),p.textContent=`\u26A0\uFE0F Open "${l}" in VS Code first, then paste this prompt into Copilot Chat:`;let d=m("pre");d.setAttribute("style","font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;"),d.textContent=i;let u=document.createElement("vscode-button");u.setAttribute("appearance","secondary"),u.textContent="\u{1F4CB} Copy prompt",u.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{u.textContent="\u2705 Copied!",setTimeout(()=>{u.textContent="\u{1F4CB} Copy prompt"},2e3)})}),o.append(p,d,u)}}),o.append(n,r),o}function sr(t,e){let o=t?.summary||{},n=Array.isArray(t?.checks)?t.checks:[],r=Array.isArray(t?.recommendations)?[...t.recommendations]:[],s=m("div");s.appendChild($a(o)),s.appendChild(Aa(o));let i=m("div");i.setAttribute("style","font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;"),i.textContent=`Score: ${nt(o.totalScore)} / ${nt(o.maxScore)} points`,s.appendChild(i);let a={high:1,medium:2,low:3};r.sort((d,u)=>(a[d?.priority]||99)-(a[u?.priority]||99));let l={};for(let d of n){let u=typeof d?.category=="string"&&d.category.length>0?d.category:"other";l[u]||(l[u]=[]),l[u].push(d)}for(let[d,u]of Object.entries(l))s.appendChild(Pa(d,u,o));r.length>0&&s.appendChild(_a(r));let p=n.filter(d=>d?.status==="fail"||d?.status==="warning");return p.length>0&&s.appendChild(za(p,e)),s}function Ia(t,e,o){let n={sessions:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",interactions:"width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",score:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"},r=`
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${n.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${n.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${n.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 80px; flex-shrink: 0;"></div>
		</div>
	`;t.innerHTML=r+e.map((s,i)=>{let l=!!Xt.get(s.workspacePath)?.data?.summary,p=Ca(s.workspacePath),d=l?"Details":"Analyze",u=l?"details":"analyze",h=_===s.workspacePath&&o,k=Number(s.sessionCount)||0,T=Number(s.interactionCount)||0;return`
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${i<e.length-1?"1px solid var(--border-subtle)":"none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c(s.workspacePath)}">
						${c(s.workspaceName)}
					</div>
				</div>
				<div style="${n.sessions}">${k}</div>
				<div style="${n.interactions}">${T}</div>
				<div style="${n.score}">${c(p)}</div>
				<vscode-button class="btn-repo-action" data-action="${u}" data-workspace-path="${c(s.workspacePath)}" ${h?'disabled="true"':""} style="min-width: 80px; flex-shrink: 0;">
					${d}
				</vscode-button>
			</div>
		`}).join("")}function La(t,e,o){t.replaceChildren();let n=m("div","repo-details-card");n.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");let r=m("div","repo-details-card-header");r.setAttribute("style","display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");let s=m("div");s.setAttribute("style","font-size: 12px; color: var(--text-secondary);"),s.textContent="Repository: ";let i=m("span");i.setAttribute("style","color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;"),i.textContent=o,s.appendChild(i);let a=document.createElement("vscode-button");a.id="btn-switch-repository",a.setAttribute("style","min-width: 120px;"),a.textContent="Switch Repository",r.append(s,a),n.append(r,sr(e.data,_??void 0)),t.appendChild(n)}function ot(){let t=document.getElementById("repo-list-pane"),e=document.getElementById("repo-list-pane-container"),o=document.getElementById("repo-details-pane"),n=document.getElementById("repo-details-pane-container");if(!t||!e||!o||!n||!N)return;let r=!!_&&!ct,s=r?N.workspaces.filter(l=>l.workspacePath===_):N.workspaces;if(e.classList.remove("repo-hygiene-pane-collapsed"),n.classList.toggle("repo-hygiene-pane-collapsed",!r),Ia(t,s,r),!r||!_){o.replaceChildren();return}let i=wa(_),a=Xt.get(_);if(a?.data){La(o,a,i);return}if(a?.error){o.innerHTML=`
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
	`}function Ba(t,e){if(e){Xt.set(e,{data:t,error:void 0}),Vt||(_=e,ct=!1),ot();return}let o=document.getElementById("btn-analyse-repo");o&&(o.disabled=!1,o.textContent="Analyze Repo for Best Practices");let n=document.getElementById("repo-analysis-results");if(n){n.replaceChildren();let r=m("div","repo-analysis-card");r.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;"),r.appendChild(sr(t,e)),n.appendChild(r)}}function Da(t,e){if(e){Xt.set(e,{data:void 0,error:t}),Vt||(_=e,ct=!1),ot();return}let o=document.getElementById("btn-analyse-repo");o&&(o.disabled=!1,o.textContent="Analyze Repo for Best Practices");let n=document.getElementById("repo-analysis-results");n&&(n.innerHTML=`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${c(t)}</div>
			</div>
		`)}function Ha(){Vt=!1,ct=!0,_=null,ot();let t=document.getElementById("btn-analyse-all");if(t){t.disabled=!1;let o=U?.customizationMatrix?.workspaces?.length||0;t.textContent=`Analyze All Repositories (${o})`}}async function Na(){if(await Promise.resolve().then(()=>(Tn(),Cn)),!U){lo("Loading usage analysis..."),fe=setTimeout(()=>{let e=document.getElementById("root");if(e&&e.querySelector("#usage-loading-card")){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;",n.textContent="\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.",o.append(n,po()),e.textContent="",e.append(o)}},3e4);return}Te(U.locale),ye=U.use24HourTime!==!1;let t=U.sessionColumnSettings?.enabledColumns;if(Array.isArray(t)){let e=t.filter(o=>Un.includes(o));kt=new Set(e)}nr(U),On(),document.addEventListener("click",e=>{let n=e.target.getAttribute("data-suppress-tool");n&&(rr(n),f.postMessage({command:"suppressUnknownTool",toolName:n}))})}Na().catch(t=>{console.error("[Usage Analysis] Bootstrap failed:",t);let e=document.getElementById("root");if(e){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",n.textContent="Failed to initialize usage analysis. Please try refreshing.",o.append(n,po()),e.textContent="",e.append(o)}});})();
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
