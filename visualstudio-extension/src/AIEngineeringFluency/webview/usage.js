"use strict";(()=>{var ei=Object.defineProperty;var y=(e,t,o)=>()=>{if(o)throw o[0];try{return e&&(t=e(e=0)),t}catch(n){throw o=[n],n}};var ti=(e,t)=>{for(var o in t)ei(e,o,{get:t[o],enumerable:!0})};var Dt,Lt,Mo,sr,Ve,It,ge,ir,_o,Po=y(()=>{Dt=globalThis,Lt=Dt.ShadowRoot&&(Dt.ShadyCSS===void 0||Dt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Mo=Symbol(),sr=new WeakMap,Ve=class{constructor(t,o,n){if(this._$cssResult$=!0,n!==Mo)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=o}get styleSheet(){let t=this.o,o=this.t;if(Lt&&t===void 0){let n=o!==void 0&&o.length===1;n&&(t=sr.get(o)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&sr.set(o,t))}return t}toString(){return this.cssText}},It=e=>new Ve(typeof e=="string"?e:e+"",void 0,Mo),ge=(e,...t)=>{let o=e.length===1?e[0]:t.reduce((n,r,s)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[s+1],e[0]);return new Ve(o,e,Mo)},ir=(e,t)=>{if(Lt)e.adoptedStyleSheets=t.map(o=>o instanceof CSSStyleSheet?o:o.styleSheet);else for(let o of t){let n=document.createElement("style"),r=Dt.litNonce;r!==void 0&&n.setAttribute("nonce",r),n.textContent=o.cssText,e.appendChild(n)}},_o=Lt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let o="";for(let n of t.cssRules)o+=n.cssText;return It(o)})(e):e});var Wi,qi,Ki,Gi,Vi,Yi,ne,ar,Ji,Xi,Ye,Je,Ut,lr,J,Xe=y(()=>{Po();Po();({is:Wi,defineProperty:qi,getOwnPropertyDescriptor:Ki,getOwnPropertyNames:Gi,getOwnPropertySymbols:Vi,getPrototypeOf:Yi}=Object),ne=globalThis,ar=ne.trustedTypes,Ji=ar?ar.emptyScript:"",Xi=ne.reactiveElementPolyfillSupport,Ye=(e,t)=>e,Je={toAttribute(e,t){switch(t){case Boolean:e=e?Ji:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let o=e;switch(t){case Boolean:o=e!==null;break;case Number:o=e===null?null:Number(e);break;case Object:case Array:try{o=JSON.parse(e)}catch{o=null}}return o}},Ut=(e,t)=>!Wi(e,t),lr={attribute:!0,type:String,converter:Je,reflect:!1,useDefault:!1,hasChanged:Ut};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),ne.litPropertyMetadata??(ne.litPropertyMetadata=new WeakMap);J=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,o=lr){if(o.state&&(o.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((o=Object.create(o)).wrapped=!0),this.elementProperties.set(t,o),!o.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(t,n,o);r!==void 0&&qi(this.prototype,t,r)}}static getPropertyDescriptor(t,o,n){let{get:r,set:s}=Ki(this.prototype,t)??{get(){return this[o]},set(i){this[o]=i}};return{get:r,set(i){let a=r?.call(this);s?.call(this,i),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??lr}static _$Ei(){if(this.hasOwnProperty(Ye("elementProperties")))return;let t=Yi(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ye("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ye("properties"))){let o=this.properties,n=[...Gi(o),...Vi(o)];for(let r of n)this.createProperty(r,o[r])}let t=this[Symbol.metadata];if(t!==null){let o=litPropertyMetadata.get(t);if(o!==void 0)for(let[n,r]of o)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[o,n]of this.elementProperties){let r=this._$Eu(o,n);r!==void 0&&this._$Eh.set(r,o)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let o=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let r of n)o.unshift(_o(r))}else t!==void 0&&o.push(_o(t));return o}static _$Eu(t,o){let n=o.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,o=this.constructor.elementProperties;for(let n of o.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ir(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,o,n){this._$AK(t,n)}_$ET(t,o){let n=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,n);if(r!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:Je).toAttribute(o,n.type);this._$Em=t,s==null?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,o){let n=this.constructor,r=n._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let s=n.getPropertyOptions(r),i=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Je;this._$Em=r;let a=i.fromAttribute(o,s.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(t,o,n,r=!1,s){if(t!==void 0){let i=this.constructor;if(r===!1&&(s=this[t]),n??(n=i.getPropertyOptions(t)),!((n.hasChanged??Ut)(s,o)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,o,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,o,{useDefault:n,reflect:r,wrapped:s},i){n&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,i??o??this[t]),s!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(o=void 0),this._$AL.set(t,o)),r===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(o){Promise.reject(o)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[r,s]of this._$Ep)this[r]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:i}=s,a=this[r];i!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,s,a)}}let t=!1,o=this._$AL;try{t=this.shouldUpdate(o),t?(this.willUpdate(o),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(o)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(o)}willUpdate(t){}_$AE(t){this._$EO?.forEach(o=>o.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(o=>this._$ET(o,this[o]))),this._$EM()}updated(t){}firstUpdated(t){}};J.elementStyles=[],J.shadowRootOptions={mode:"open"},J[Ye("elementProperties")]=new Map,J[Ye("finalized")]=new Map,Xi?.({ReactiveElement:J}),(ne.reactiveElementVersions??(ne.reactiveElementVersions=[])).push("2.1.2")});function vr(e,t){if(!Oo(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return dr!==void 0?dr.createHTML(t):t}function we(e,t,o=e,n){if(t===O)return t;let r=n!==void 0?o._$Co?.[n]:o._$Cl,s=tt(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),s===void 0?r=void 0:(r=new s(e),r._$AT(e,o,n)),n!==void 0?(o._$Co??(o._$Co=[]))[n]=r:o._$Cl=r),r!==void 0&&(t=we(e,r._$AS(e,t.values),r,n)),t}var Qe,cr,zt,dr,br,re,yr,Zi,be,et,tt,Oo,Qi,Do,Ze,ur,pr,fe,gr,fr,hr,No,X,kp,Cp,O,$,mr,me,ea,ot,Lo,nt,Te,Io,Uo,zo,Bo,ta,xr,Se=y(()=>{Qe=globalThis,cr=e=>e,zt=Qe.trustedTypes,dr=zt?zt.createPolicy("lit-html",{createHTML:e=>e}):void 0,br="$lit$",re=`lit$${Math.random().toFixed(9).slice(2)}$`,yr="?"+re,Zi=`<${yr}>`,be=document,et=()=>be.createComment(""),tt=e=>e===null||typeof e!="object"&&typeof e!="function",Oo=Array.isArray,Qi=e=>Oo(e)||typeof e?.[Symbol.iterator]=="function",Do=`[ 	
\f\r]`,Ze=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ur=/-->/g,pr=/>/g,fe=RegExp(`>|${Do}(?:([^\\s"'>=/]+)(${Do}*=${Do}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gr=/'/g,fr=/"/g,hr=/^(?:script|style|textarea|title)$/i,No=e=>(t,...o)=>({_$litType$:e,strings:t,values:o}),X=No(1),kp=No(2),Cp=No(3),O=Symbol.for("lit-noChange"),$=Symbol.for("lit-nothing"),mr=new WeakMap,me=be.createTreeWalker(be,129);ea=(e,t)=>{let o=e.length-1,n=[],r,s=t===2?"<svg>":t===3?"<math>":"",i=Ze;for(let a=0;a<o;a++){let l=e[a],u,d,p=-1,b=0;for(;b<l.length&&(i.lastIndex=b,d=i.exec(l),d!==null);)b=i.lastIndex,i===Ze?d[1]==="!--"?i=ur:d[1]!==void 0?i=pr:d[2]!==void 0?(hr.test(d[2])&&(r=RegExp("</"+d[2],"g")),i=fe):d[3]!==void 0&&(i=fe):i===fe?d[0]===">"?(i=r??Ze,p=-1):d[1]===void 0?p=-2:(p=i.lastIndex-d[2].length,u=d[1],i=d[3]===void 0?fe:d[3]==='"'?fr:gr):i===fr||i===gr?i=fe:i===ur||i===pr?i=Ze:(i=fe,r=void 0);let h=i===fe&&e[a+1].startsWith("/>")?" ":"";s+=i===Ze?l+Zi:p>=0?(n.push(u),l.slice(0,p)+br+l.slice(p)+re+h):l+re+(p===-2?a:h)}return[vr(e,s+(e[o]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},ot=class e{constructor({strings:t,_$litType$:o},n){let r;this.parts=[];let s=0,i=0,a=t.length-1,l=this.parts,[u,d]=ea(t,o);if(this.el=e.createElement(u,n),me.currentNode=this.el.content,o===2||o===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=me.nextNode())!==null&&l.length<a;){if(r.nodeType===1){if(r.hasAttributes())for(let p of r.getAttributeNames())if(p.endsWith(br)){let b=d[i++],h=r.getAttribute(p).split(re),T=/([.?@])?(.*)/.exec(b);l.push({type:1,index:s,name:T[2],strings:h,ctor:T[1]==="."?Io:T[1]==="?"?Uo:T[1]==="@"?zo:Te}),r.removeAttribute(p)}else p.startsWith(re)&&(l.push({type:6,index:s}),r.removeAttribute(p));if(hr.test(r.tagName)){let p=r.textContent.split(re),b=p.length-1;if(b>0){r.textContent=zt?zt.emptyScript:"";for(let h=0;h<b;h++)r.append(p[h],et()),me.nextNode(),l.push({type:2,index:++s});r.append(p[b],et())}}}else if(r.nodeType===8)if(r.data===yr)l.push({type:2,index:s});else{let p=-1;for(;(p=r.data.indexOf(re,p+1))!==-1;)l.push({type:7,index:s}),p+=re.length-1}s++}}static createElement(t,o){let n=be.createElement("template");return n.innerHTML=t,n}};Lo=class{constructor(t,o){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=o}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:o},parts:n}=this._$AD,r=(t?.creationScope??be).importNode(o,!0);me.currentNode=r;let s=me.nextNode(),i=0,a=0,l=n[0];for(;l!==void 0;){if(i===l.index){let u;l.type===2?u=new nt(s,s.nextSibling,this,t):l.type===1?u=new l.ctor(s,l.name,l.strings,this,t):l.type===6&&(u=new Bo(s,this,t)),this._$AV.push(u),l=n[++a]}i!==l?.index&&(s=me.nextNode(),i++)}return me.currentNode=be,r}p(t){let o=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,o),o+=n.strings.length-2):n._$AI(t[o])),o++}},nt=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,o,n,r){this.type=2,this._$AH=$,this._$AN=void 0,this._$AA=t,this._$AB=o,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,o=this._$AM;return o!==void 0&&t?.nodeType===11&&(t=o.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,o=this){t=we(this,t,o),tt(t)?t===$||t==null||t===""?(this._$AH!==$&&this._$AR(),this._$AH=$):t!==this._$AH&&t!==O&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Qi(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==$&&tt(this._$AH)?this._$AA.nextSibling.data=t:this.T(be.createTextNode(t)),this._$AH=t}$(t){let{values:o,_$litType$:n}=t,r=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=ot.createElement(vr(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(o);else{let s=new Lo(r,this),i=s.u(this.options);s.p(o),this.T(i),this._$AH=s}}_$AC(t){let o=mr.get(t.strings);return o===void 0&&mr.set(t.strings,o=new ot(t)),o}k(t){Oo(this._$AH)||(this._$AH=[],this._$AR());let o=this._$AH,n,r=0;for(let s of t)r===o.length?o.push(n=new e(this.O(et()),this.O(et()),this,this.options)):n=o[r],n._$AI(s),r++;r<o.length&&(this._$AR(n&&n._$AB.nextSibling,r),o.length=r)}_$AR(t=this._$AA.nextSibling,o){for(this._$AP?.(!1,!0,o);t!==this._$AB;){let n=cr(t).nextSibling;cr(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},Te=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,o,n,r,s){this.type=1,this._$AH=$,this._$AN=void 0,this.element=t,this.name=o,this._$AM=r,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=$}_$AI(t,o=this,n,r){let s=this.strings,i=!1;if(s===void 0)t=we(this,t,o,0),i=!tt(t)||t!==this._$AH&&t!==O,i&&(this._$AH=t);else{let a=t,l,u;for(t=s[0],l=0;l<s.length-1;l++)u=we(this,a[n+l],o,l),u===O&&(u=this._$AH[l]),i||(i=!tt(u)||u!==this._$AH[l]),u===$?t=$:t!==$&&(t+=(u??"")+s[l+1]),this._$AH[l]=u}i&&!r&&this.j(t)}j(t){t===$?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Io=class extends Te{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===$?void 0:t}},Uo=class extends Te{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==$)}},zo=class extends Te{constructor(t,o,n,r,s){super(t,o,n,r,s),this.type=5}_$AI(t,o=this){if((t=we(this,t,o,0)??$)===O)return;let n=this._$AH,r=t===$&&n!==$||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==$&&(n===$||r);r&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Bo=class{constructor(t,o,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=o,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){we(this,t)}},ta=Qe.litHtmlPolyfillSupport;ta?.(ot,nt),(Qe.litHtmlVersions??(Qe.litHtmlVersions=[])).push("3.3.3");xr=(e,t,o)=>{let n=o?.renderBefore??t,r=n._$litPart$;if(r===void 0){let s=o?.renderBefore??null;n._$litPart$=r=new nt(t.insertBefore(et(),s),s,void 0,o??{})}return r._$AI(e),r}});var rt,se,oa,kr=y(()=>{Xe();Xe();Se();Se();rt=globalThis,se=class extends J{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var o;let t=super.createRenderRoot();return(o=this.renderOptions).renderBefore??(o.renderBefore=t.firstChild),t}update(t){let o=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xr(o,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};se._$litElement$=!0,se.finalized=!0,rt.litElementHydrateSupport?.({LitElement:se});oa=rt.litElementPolyfillSupport;oa?.({LitElement:se});(rt.litElementVersions??(rt.litElementVersions=[])).push("4.2.2")});var Cr=y(()=>{});var ie=y(()=>{Xe();Se();kr();Cr()});var wr=y(()=>{});function k(e){return(t,o)=>typeof o=="object"?ra(e,t,o):((n,r,s)=>{let i=r.hasOwnProperty(s);return r.constructor.createProperty(s,n),i?Object.getOwnPropertyDescriptor(r,s):void 0})(e,t,o)}var na,ra,Fo=y(()=>{Xe();na={attribute:!0,type:String,converter:Je,reflect:!1,hasChanged:Ut},ra=(e=na,t,o)=>{let{kind:n,metadata:r}=o,s=globalThis.litPropertyMetadata.get(r);if(s===void 0&&globalThis.litPropertyMetadata.set(r,s=new Map),n==="setter"&&((e=Object.create(e)).wrapped=!0),s.set(o.name,e),n==="accessor"){let{name:i}=o;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(i,l,e,!0,a)},init(a){return a!==void 0&&this.C(i,void 0,e,a),a}}}if(n==="setter"){let{name:i}=o;return function(a){let l=this[i];t.call(this,a),this.requestUpdate(i,l,e,!0,a)}}throw Error("Unsupported decorator location: "+n)}});function Ho(e){return k({...e,state:!0,attribute:!1})}var Tr=y(()=>{Fo();});var Sr=y(()=>{});var $e=y(()=>{});var $r=y(()=>{$e();});var Ar=y(()=>{$e();});var Rr=y(()=>{$e();});var Er=y(()=>{$e();});var Mr=y(()=>{$e();});var jo=y(()=>{wr();Fo();Tr();Sr();$r();Ar();Rr();Er();Mr()});var Ot,Nt,Ae,Wo=y(()=>{Ot={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Nt=e=>(...t)=>({_$litDirective$:e,values:t}),Ae=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,o,n){this._$Ct=t,this._$AM=o,this._$Ci=n}_$AS(t,o){return this.update(t,o)}update(t,o){return this.render(...o)}}});var Ft,_r=y(()=>{Se();Wo();Ft=Nt(class extends Ae{constructor(e){if(super(e),e.type!==Ot.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(n=>n!=="")));for(let n in t)t[n]&&!this.nt?.has(n)&&this.st.add(n);return this.render(t)}let o=e.element.classList;for(let n of this.st)n in t||(o.remove(n),this.st.delete(n));for(let n in t){let r=!!t[n];r===this.st.has(n)||this.nt?.has(n)||(r?(o.add(n),this.st.add(n)):(o.remove(n),this.st.delete(n)))}return O}})});var qo=y(()=>{_r()});var Ht,Pr,Dr,Re,jt,Ko=y(()=>{ie();Ht="2.5.1",Pr="__vscodeElements_disableRegistryWarning__",Dr=(e,t)=>{console.warn(t?`[VSCode Elements] ${e}
%o`:`${e}
%o`,t)},Re=class extends se{get version(){return Ht}warn(t){Dr(t,this)}},jt=e=>t=>{if(!customElements.get(e)){customElements.define(e,t);return}if(Pr in window)return;let r=document.createElement(e)?.version,s="";r?r!==Ht?(s+="is already registered by a different version of VSCode Elements. ",s+=`This version is "${Ht}", while the other one is "${r}".`):s+=`is already registered by the same version of VSCode Elements (${Ht}).`:s+="is already registered by an unknown custom element handler class.",Dr(`The custom element "${e}" ${s}
To suppress this warning, set window.${Pr} to true`)}});var Ee,Lr=y(()=>{Se();Ee=e=>e??$});var Go=y(()=>{Lr()});var Ir=y(()=>{Wo()});var Vo,Ur,zr=y(()=>{ie();Ir();Vo=class extends Ae{constructor(t){if(super(t),this._prevProperties={},t.type!==Ot.PROPERTY||t.name!=="style")throw new Error("The `stylePropertyMap` directive must be used in the `style` property")}update(t,[o]){return Object.entries(o).forEach(([n,r])=>{this._prevProperties[n]!==r&&(n.startsWith("--")?t.element.style.setProperty(n,r):t.element.style[n]=r,this._prevProperties[n]=r)}),O}render(t){return O}},Ur=Nt(Vo)});var Wt,Yo=y(()=>{ie();Wt=ge`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`});var sa,Br,Or=y(()=>{ie();Yo();sa=[Wt,ge`
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
  `],Br=sa});var ye,st,N,Nr=y(()=>{ie();jo();qo();Go();Ko();zr();Or();ye=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},N=st=class extends Re{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=t=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:t}}))}}connectedCallback(){super.connectedCallback();let{href:t,nonce:o}=this._getStylesheetConfig();st.stylesheetHref=t,st.nonce=o}_getStylesheetConfig(){if(typeof document>"u")return{nonce:void 0,href:void 0};let t=document.getElementById("vscode-codicon-stylesheet"),o=t?.getAttribute("href")||void 0,n=t?.nonce||void 0;if(!t){let r='To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';r+="See https://vscode-elements.github.io/components/icon/ for more details.",this.warn(r)}return{nonce:n,href:o}}render(){let{stylesheetHref:t,nonce:o}=st,n=X`<span
      class=${Ft({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}
      .style=${Ur({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}
    ></span>`,r=this.actionIcon?X` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${n}
        </button>`:X` <span class="icon" aria-hidden="true" role="presentation"
          >${n}</span
        >`;return X`
      <link
        rel="stylesheet"
        href=${Ee(t)}
        nonce=${Ee(o)}
      />
      ${r}
    `}};N.styles=Br;N.stylesheetHref="";N.nonce="";ye([k()],N.prototype,"label",void 0);ye([k({type:String})],N.prototype,"name",void 0);ye([k({type:Number})],N.prototype,"size",void 0);ye([k({type:Boolean,reflect:!0})],N.prototype,"spin",void 0);ye([k({type:Number,attribute:"spin-duration"})],N.prototype,"spinDuration",void 0);ye([k({type:Boolean,reflect:!0,attribute:"action-icon"})],N.prototype,"actionIcon",void 0);N=st=ye([jt("vscode-icon")],N)});var Fr=y(()=>{Nr()});function Hr(){return navigator.userAgent.indexOf("Linux")>-1?'system-ui, "Ubuntu", "Droid Sans", sans-serif':navigator.userAgent.indexOf("Mac")>-1?"-apple-system, BlinkMacSystemFont, sans-serif":navigator.userAgent.indexOf("Windows")>-1?'"Segoe WPC", "Segoe UI", sans-serif':"sans-serif"}var jr=y(()=>{});var ia,aa,Wr,qr=y(()=>{ie();Yo();jr();ia=It(Hr()),aa=[Wt,ge`
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
      font-family: var(--vscode-font-family, ${ia});
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
  `],Wr=aa});var R,w,Kr=y(()=>{ie();jo();qo();Ko();Fr();qr();Go();R=function(e,t,o,n){var r=arguments.length,s=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(s=(r<3?i(s):r>3?i(t,o,s):i(t,o))||s);return r>3&&s&&Object.defineProperty(t,o,s),s},w=class extends Re{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.block=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.iconOnly=!1,this.type="button",this.value="",this._prevTabindex=0,this._hasContentBefore=!1,this._hasContentAfter=!1,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then(()=>{this.focus(),this.requestUpdate()})),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(t){super.update(t),t.has("value")&&this._internals.setFormValue(this.value),t.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){this.type==="submit"&&this._internals.form&&this._internals.form.requestSubmit(),this.type==="reset"&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(t){if((t.key==="Enter"||t.key===" ")&&!this.hasAttribute("disabled")){let o=new MouseEvent("click",{bubbles:!0,cancelable:!0});o.synthetic=!0,this.dispatchEvent(o),this._executeAction()}}_handleClick(t){t.synthetic||this.hasAttribute("disabled")||this._executeAction()}_handleSlotChange(t){let o=t.target;o.name==="content-before"&&(this._hasContentBefore=o.assignedElements().length>0),o.name==="content-after"&&(this._hasContentAfter=o.assignedElements().length>0)}render(){let t=this.icon!=="",o=this.iconAfter!=="",n={base:!0,"icon-only":this.iconOnly,"has-content-before":this._hasContentBefore,"has-content-after":this._hasContentAfter},r=t?X`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${Ee(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>`:$,s=o?X`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${Ee(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>`:$;return X`
      <div
        class=${Ft(n)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${r}
        <slot></slot>
        ${s}
        <slot name="content-after"></slot>
      </div>
    `}};w.styles=Wr;w.formAssociated=!0;R([k({type:Boolean,reflect:!0})],w.prototype,"autofocus",void 0);R([k({type:Number,reflect:!0})],w.prototype,"tabIndex",void 0);R([k({type:Boolean,reflect:!0})],w.prototype,"secondary",void 0);R([k({type:Boolean,reflect:!0})],w.prototype,"block",void 0);R([k({reflect:!0})],w.prototype,"role",void 0);R([k({type:Boolean,reflect:!0})],w.prototype,"disabled",void 0);R([k()],w.prototype,"icon",void 0);R([k({type:Boolean,reflect:!0,attribute:"icon-spin"})],w.prototype,"iconSpin",void 0);R([k({type:Number,reflect:!0,attribute:"icon-spin-duration"})],w.prototype,"iconSpinDuration",void 0);R([k({attribute:"icon-after"})],w.prototype,"iconAfter",void 0);R([k({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],w.prototype,"iconAfterSpin",void 0);R([k({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],w.prototype,"iconAfterSpinDuration",void 0);R([k({type:Boolean,reflect:!0})],w.prototype,"focused",void 0);R([k({type:String,reflect:!0})],w.prototype,"name",void 0);R([k({type:Boolean,reflect:!0,attribute:"icon-only"})],w.prototype,"iconOnly",void 0);R([k({reflect:!0})],w.prototype,"type",void 0);R([k()],w.prototype,"value",void 0);R([Ho()],w.prototype,"_hasContentBefore",void 0);R([Ho()],w.prototype,"_hasContentAfter",void 0);w=R([jt("vscode-button")],w)});var Gr={};ti(Gr,{VscodeButton:()=>w});var Vr=y(()=>{Kr()});function x(e,t){e&&(e.innerHTML=t)}function m(e,t,o){let n=document.createElement(e);return t&&(n.className=t),o!==void 0&&(n.textContent=o),n}var St={today:"Today",last7:"Last 7 days",last14:"Last 14 days",last30:"Last 30 days",last90:"Last 90 days",currentMonth:"Current month",lastMonth:"Previous month",thisWeek:"This week",allTime:"All time"},oi=["today","last7","last30","last90","currentMonth","allTime"];function xn(e,t,o){t===o&&(e.selected=!0)}function bo(e){let t=m("div","period-selector");t.style.display="inline-flex",t.style.alignItems="center",t.style.gap="4px";let o=e.label??"Time window:";if(o){let i=m("span","period-selector-label",o);i.style.fontSize="11px",i.style.color="var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))",t.append(i)}let n=document.createElement("select");n.className="period-selector-select",e.id&&(n.id=e.id),n.style.background="var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))",n.style.color="var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))",n.style.border="1px solid var(--border-subtle, #555555)",n.style.borderRadius="4px",n.style.padding="4px 8px",n.style.fontSize="13px",n.style.cursor="pointer",n.style.minHeight="24px";let r=new Set(e.disabled??[]),s=e.periods??oi;for(let i of s){let a=document.createElement("option");a.value=i,a.textContent=St[i],xn(a,i,e.selected),r.has(i)&&(a.disabled=!0,e.disabledTitle&&(a.title=e.disabledTitle)),n.append(a)}for(let i of e.extraOptions??[]){let a=document.createElement("option");a.value=i.value,a.textContent=i.label,i.title&&(a.title=i.title),xn(a,i.value,e.selected),i.disabled&&(a.disabled=!0),n.append(a)}return n.addEventListener("change",()=>{e.onChange(n.value)}),t.append(n),{wrapper:t,select:n}}var yo={"nav.btnRefresh":"Refresh","nav.btnDetails":"Details","nav.btnChart":"Chart","nav.btnUsage":"Usage Analysis","nav.btnDiagnostics":"Diagnostics","nav.btnMaturity":"Fluency Score","nav.btnDashboard":"Team Dashboard","nav.btnLevelViewer":"Level Viewer","nav.btnEnvironmental":"Environmental Impact","nav.btnEfficiency":"Efficiency","share.exportTitle":"AI Engineering Fluency Score","share.exportReportLabel":"Report"},kn={...yo};function Cn(e){let t={};for(let[o,n]of Object.entries(e))typeof n=="string"&&n!==o&&(t[o]=n);kn={...yo,...t}}function wn(e){return kn[e]||yo[e]||e}var ni="en";function Tn(e){ni=e}var ri={"btn-refresh":{id:"btn-refresh",labelKey:"nav.btnRefresh",icon:"refresh",appearance:"primary"},"btn-details":{id:"btn-details",labelKey:"nav.btnDetails",icon:"robot",iconColor:"#c37bff",appearance:"secondary"},"btn-chart":{id:"btn-chart",labelKey:"nav.btnChart",icon:"graph-line",iconColor:"#60a5fa",appearance:"secondary"},"btn-usage":{id:"btn-usage",labelKey:"nav.btnUsage",icon:"graph",iconColor:"#22d3ee",appearance:"secondary"},"btn-diagnostics":{id:"btn-diagnostics",labelKey:"nav.btnDiagnostics",icon:"search",iconColor:"#fb7185",appearance:"secondary"},"btn-maturity":{id:"btn-maturity",labelKey:"nav.btnMaturity",icon:"target",iconColor:"#fbbf24",appearance:"secondary"},"btn-dashboard":{id:"btn-dashboard",labelKey:"nav.btnDashboard",icon:"organization",iconColor:"#818cf8",appearance:"secondary"},"btn-level-viewer":{id:"btn-level-viewer",labelKey:"nav.btnLevelViewer",icon:"list-tree",iconColor:"#94a3b8",appearance:"secondary"},"btn-environmental":{id:"btn-environmental",labelKey:"nav.btnEnvironmental",icon:"globe",iconColor:"#4ade80",appearance:"secondary"},"btn-efficiency":{id:"btn-efficiency",labelKey:"nav.btnEfficiency",icon:"dashboard",iconColor:"#f472b6",appearance:"secondary"}},Sn=new Proxy({},{get(e,t){let o=ri[t];if(!o)return;let{labelKey:n,...r}=o;return{...r,label:wn(n)}}});var si=["btn-refresh","btn-details","btn-chart","btn-usage","btn-maturity","btn-efficiency","btn-environmental","btn-diagnostics","btn-dashboard"];function ii(e,t){return si.filter(o=>o!=="btn-dashboard"||t).map(o=>({...Sn[o],active:o===e}))}function ai(e){let t=typeof e=="string"?Sn[e]:e;if(t.hidden)return"";let o=t.appearance?` appearance="${t.appearance}"`:"",n=t.active?' class="nav-active" disabled aria-current="page"':"",r=t.iconColor?` style="--icon-accent:${t.iconColor}"`:"",s=t.icon?`<span class="codicon codicon-${t.icon} nav-icon"${r}></span>`:"";return`<vscode-button id="${t.id}"${o}${n}>${s}${t.label}</vscode-button>`}function $n(e,t){return ii(e,t).map(o=>ai(o)).join(`
`)}function je(e){return e.file+e.selection+e.implicitSelection+e.symbol+e.codebase+e.workspace+e.terminal+e.vscode+e.copilotInstructions+e.agentsMd+(e.terminalLastCommand||0)+(e.terminalSelection||0)+(e.clipboard||0)+(e.changes||0)+(e.outputPanel||0)+(e.problemsPanel||0)+(e.pullRequest||0)}function G(e){let t=globalThis.window;return t?t[e]:void 0}var li=G("__TOKEN_ESTIMATORS__"),Cu=li?.estimators??{},We,ci=!0;function ho(e){We=e}function C(e,t){return new Intl.NumberFormat(We,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}function oe(e,t=1){return`${C(e,t)}%`}function g(e){return e.toLocaleString(We)}function qe(e){return ci?new Intl.NumberFormat(We,{notation:"compact",maximumFractionDigits:1}).format(e):g(e)}function vo(e){return new Intl.NumberFormat(We,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(e)}function c(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function P(e,t,o=n=>console.error(n)){try{return t()}catch(n){let r=n instanceof Error?n.message:String(n);return o(`[usage-webview] Section "${e}" failed to render: ${r}`),`<div class="section" style="border-color: rgba(239, 68, 68, 0.3);">
			<div class="section-title"><span>\u26A0\uFE0F</span><span>${c(e)}</span></div>
			<div style="color: var(--text-secondary); font-size: 12px; padding: 8px 0;">
				This section couldn't be displayed due to an unexpected error. Other sections are unaffected \u2014 try refreshing the dashboard.
			</div>
		</div>`}}function Ke(e){let t=Number(e);if(!Number.isFinite(t)||t<0)return"N/A";if(t<1024)return`${t} B`;let o=["KB","MB","GB","TB","PB"],n=t/1024,r=0;for(;n>=1024&&r<o.length-1;)n/=1024,r++;let s=r===0?1:2;return`${n.toFixed(s)} ${o[r]}`}function xo(e){if(e===void 0||!Number.isFinite(e)||e<0)return"\u2014";let t=Math.round(e/6e4);if(t<1)return"<1m";if(t<60)return`${t}m`;let o=Math.floor(t/60),n=t%60;return`${o}h ${String(n).padStart(2,"0")}m`}function ko(e){try{let t=Date.now(),o=new Date(e).getTime();if(!Number.isFinite(o))return"Unknown";let n=t-o;if(n<0)return"Just now";let r=Math.floor(n/1e3),s=Math.floor(r/60),i=Math.floor(s/60),a=Math.floor(i/24);return a>0?`${a} day${a!==1?"s":""} ago`:i>0?`${i} hour${i!==1?"s":""} ago`:s>0?`${s} minute${s!==1?"s":""} ago`:`${r} second${r!==1?"s":""} ago`}catch{return"Unknown"}}function di(e){let t=[],o=e.location?.origin;o&&o!=="null"&&t.push(o);let n=e.location?.href,r=n?/^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(n):null;return r&&!t.includes(r[0])&&t.push(r[0]),t}function ui(e,t,o){return e==null||e===t||e===t.parent||e===t.top?!0:!!o&&di(t).includes(o)}function $t(e,t){window.addEventListener("message",o=>{if(!ui(o.source,window,o.origin)){t?.(o);return}e(o.data)})}function An(e){return`ext-point-${e}`}function Rn(e,t){let o=document.querySelector(".button-row");if(!o)return;let n=new Set(t.map(r=>r.id));for(let r of Array.from(o.querySelectorAll('[id^="ext-point-"]'))){let s=r.id.slice(10);n.has(s)||r.remove()}for(let r of t){if(document.getElementById(An(r.id)))continue;let s=document.createElement("vscode-button");s.id=An(r.id),s.textContent=r.label,s.addEventListener("click",()=>{e.postMessage({command:"extensionPointAction",buttonId:r.id})}),o.append(s)}}function En(e){Rn(e,window.__EXTENSION_POINT_BUTTONS__??[]),!window.__extensionPointButtonsListenerRegistered__&&(window.__extensionPointButtonsListenerRegistered__=!0,$t(t=>{t?.command==="extensionPointButtonsUpdated"&&Array.isArray(t.buttons)&&Rn(e,t.buttons)}))}var At=["last7","last30","currentMonth"],pi=["interactions","toolCalls","inputTokens","outputTokens","thinkingTokens","cachedTokens","totalTokens","estimatedCost"],gi=["truncationCount","maxRequestInputTokens","contextWindowLimit","contextReachedTokens","durationMs","activeDurationMs","subAgentCalls"],fi=["contextTier","workspace"];function Mn(e){return typeof e=="number"&&Number.isFinite(e)}function mi(e){if(!e||typeof e!="object")return!1;let t=e;return t.title!==null&&typeof t.title!="string"||typeof t.filePath!="string"||typeof t.editor!="string"||typeof t.lastActivity!="string"||!Array.isArray(t.models)||!t.models.every(o=>typeof o=="string")||!pi.every(o=>Mn(t[o]))||!gi.every(o=>t[o]===void 0||Mn(t[o]))?!1:fi.every(o=>t[o]===void 0||typeof t[o]=="string")}function Co(e){if(!e||typeof e!="object")return;let t=e,o={};for(let n of At){let r=t[n];if(!Array.isArray(r))return;o[n]=r.filter(mi)}return o}function V(e){return typeof e=="number"&&Number.isFinite(e)?e:0}function wo(e){return typeof e=="number"&&Number.isFinite(e)?e:void 0}function _n(e){if(!e||typeof e!="object")return;let t=e,o={};if(t.tierCounts&&typeof t.tierCounts=="object")for(let[s,i]of Object.entries(t.tierCounts))o[s]=V(i);let n=wo(t.maxReachedTokens),r=wo(t.maxReachedWindowLimit);return{maxRequestInputTokens:V(t.maxRequestInputTokens),maxRequestModels:Array.isArray(t.maxRequestModels)?t.maxRequestModels.filter(s=>typeof s=="string"):[],tierCounts:o,...n!==void 0?{maxReachedTokens:n}:{},...r!==void 0?{maxReachedWindowLimit:r}:{}}}function Pn(e){if(!e||typeof e!="object")return;let t=e,o=wo(t.worstFillPercent);return{sessionsConsidered:V(t.sessionsConsidered),sessionsCompacted:V(t.sessionsCompacted),sessionsNearLimit:V(t.sessionsNearLimit),sessionsWithFillData:V(t.sessionsWithFillData),...o!==void 0?{worstFillPercent:o}:{}}}function Dn(e){if(!e||typeof e!="object")return;let t=e,o=t.bySource&&typeof t.bySource=="object"?t.bySource:{};return{total:V(t.total),bySource:{copilotCli:V(o.copilotCli),claude:V(o.claude)}}}function Ln(e){return!!e&&(e.maxRequestInputTokens>0||(e.maxReachedTokens??0)>0||Object.keys(e.tierCounts).length>0)}var In=`/**
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
`;var Un=`* {
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

.automatic-compactions-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin: 0 0 14px;
	padding: 10px 12px;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	background: var(--list-hover-bg);
}

.automatic-compactions-label {
	font-size: 13px;
	font-weight: 700;
	color: var(--text-primary);
}

.automatic-compactions-detail {
	margin-top: 2px;
	font-size: 11px;
	color: var(--text-secondary);
}

.automatic-compactions-value {
	font-size: 24px;
	font-weight: 700;
	color: var(--text-primary);
	font-variant-numeric: tabular-nums;
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

.model-leaderboard-other {
	margin-top: 8px;
}

.model-leaderboard-other > summary {
	cursor: pointer;
	user-select: none;
	font-size: 12px;
	color: var(--text-secondary);
	padding: 4px 0;
}

.model-leaderboard-other > summary:hover {
	color: var(--link-color);
}

.model-leaderboard-other[open] > summary {
	margin-bottom: 6px;
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

/* Recent Sessions pill filter bar (Editor / Vendor / Model / HydraFusion) */
.session-filter-bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px 12px;
	margin-bottom: 10px;
}

.session-filter-group {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;
}

.session-filter-group-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-secondary);
	margin-right: 2px;
}

.session-filter-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-family: inherit;
	font-size: 11px;
	padding: 3px 10px;
	border-radius: 999px;
	border: 1px solid var(--border-subtle);
	background: var(--bg-tertiary);
	color: var(--text-primary);
	cursor: pointer;
	transition: background 0.1s ease, border-color 0.1s ease;
}

.session-filter-pill:hover {
	background: var(--list-hover-bg);
	border-color: var(--link-color);
}

.session-filter-pill.active {
	background: var(--vscode-badge-background, var(--accent-color));
	border-color: var(--vscode-badge-background, var(--accent-color));
	color: var(--vscode-badge-foreground, var(--bg-primary));
}

.session-filter-pill-count {
	opacity: 0.75;
	font-size: 10px;
}

.session-filter-pill-clear {
	background: transparent;
	border-style: dashed;
	color: var(--text-secondary);
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

.worktree-cleanup-log-details {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	flex: 1;
}

.worktree-cleanup-log-headline {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	align-items: baseline;
}

.worktree-cleanup-log-branch {
	font-weight: 600;
	font-family: var(--vscode-editor-font-family, monospace);
}

.worktree-cleanup-log-repo {
	color: var(--text-muted);
}

.worktree-cleanup-log-path {
	color: var(--text-muted);
	font-size: 11px;
	word-break: break-all;
}

.worktree-cleanup-log-reason {
	color: var(--text-muted);
	font-size: 11px;
	word-break: break-word;
}

.worktree-cleanup-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 6px;
}

.worktree-cleanup-chip {
	padding: 2px 8px;
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-tertiary);
	color: var(--text-secondary);
	font-size: 11px;
	white-space: nowrap;
}

/* Facts that block or endanger a cleanup (unpushed commits, dirty tree, missing remote). */
.worktree-cleanup-chip.danger {
	border-color: var(--vscode-errorForeground, #f14c4c);
	color: var(--vscode-errorForeground, #f14c4c);
}

.worktree-cleanup-log-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
}

.worktree-cleanup-log-actions .button {
	padding: 3px 10px;
	font-size: 11px;
}

.worktree-repo-actions {
	white-space: nowrap;
}

.worktree-repo-cleanup-btn {
	font-size: 12px;
	padding: 4px 10px;
	font-weight: normal;
}
`;var hi=G("__MODEL_PRICING__"),To={};for(let[e,t]of Object.entries(hi?.pricing??{}))t.displayNames&&t.displayNames.length>0&&(To[e]=t.displayNames[0]);var vi=" (Custom)";function Rt(e){try{return decodeURIComponent(e)}catch{return e}}function So(e){let t=e.split("/");if(!(t.length!==3||t.some(o=>o.trim()==="")))return{source:Rt(t[0]),providerName:Rt(t[1]),modelId:Rt(t[2])}}var Et=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i;function pe(e){let t=[],o=i=>{i&&!t.includes(i)&&t.push(i)},n=i=>{o(i),o(i.replace(/(\d+)-(\d+)(?=-|$)/,"$1.$2"))},r=e.replace(/^copilot\//,"");n(r);let s=So(r);return s&&n(s.modelId),Et.test(r)&&n(r.replace(Et,"")),t}function $o(e){let t=So(e);return t?`${t.providerName}${vi}`:void 0}function Y(e){for(let o of pe(e))if(To[o])return To[o];let t=So(e);return t?t.modelId:Et.test(e)?e.replace(Et,""):Rt(e)}var Hu=1/1e11;function ki(e){if(!e)return null;let t=/([\d.]+)\s*([KkMm])?/.exec(e);if(!t)return null;let o=parseFloat(t[1]);if(!isFinite(o)||o<=0)return null;let n=(t[2]??"").toUpperCase();return Math.round(o*(n==="M"?1e6:n==="K"?1e3:1))}function zn(e,t={}){let o=Ci(e,t);if(!o){let s=e.toLowerCase();for(let[i,a]of Object.entries(t))if(s.includes(i.toLowerCase())||i.toLowerCase().includes(s)){o=a;break}}let n=o?.copilotPricing?.longContext;if(!n)return null;let r=ki(n.threshold);return r?{thresholdTokens:r,defaultInputCostPerMillion:o.copilotPricing.inputCostPerMillion,longContextInputCostPerMillion:n.inputCostPerMillion}:null}function Ci(e,t){for(let o of pe(e)){let n=t[o];if(n)return n}}function Bn(e){return{oneShotRate:e.editTurns>0?e.oneShotEditTurns/e.editTurns:null,retryRate:e.editTurns>0?e.retries/e.editTurns:null,selfCorrectionRate:e.editTurns>0?e.selfCorrections/e.editTurns:null,costPerCall:e.calls>0?e.cost/e.calls:null,costPerEdit:e.editTurns>0?e.cost/e.editTurns:null,outputTokensPerCall:e.calls>0?e.outputTokens/e.calls:null,toolCallsPerCall:e.calls>0?(e.toolCalls??0)/e.calls:null,cacheHitRate:e.inputTokens>0?Math.min(1,e.cachedReadTokens/e.inputTokens):null}}function On(e){let t=Object.values(e).map(o=>o.calls).sort((o,n)=>o-n);return t.length<4?null:t[Math.floor((t.length-1)*.25)]}function Nn(e){let t=Object.entries(e).map(([s,i])=>({model:s,calls:i.calls})).sort((s,i)=>i.calls-s.calls),o=-1,n=1;for(let s=1;s<t.length;s++){let i=t[s-1].calls;if(i<=0)continue;let a=t[s].calls/i;a<n&&(n=a,o=s)}let r=o===-1?0:t.length-o;return o===-1||n>=.5||r<2?new Set:new Set(t.slice(o).map(s=>s.model))}var Ti=[["anthropic","Anthropic"],["claude","Anthropic"],["codestral","Mistral AI"],["devstral","Mistral AI"],["gemini","Google"],["goldeneye","xAI"],["google","Google"],["gpt","OpenAI"],["grok","xAI"],["magistral","Mistral AI"],["mai-","Microsoft"],["ministral","Mistral AI"],["mistral","Mistral AI"],["o1","OpenAI"],["o3","OpenAI"],["o4","OpenAI"],["pixtral","Mistral AI"],["qwen","Alibaba"],["raptor","xAI"]];function Ce(e){let t=$o(e);if(t)return t;let o=pe(e).flatMap(n=>Ti.filter(([r])=>n.toLowerCase().startsWith(r))).at(0);return o?o[1]:"Other"}var Si=5;function Fn(e){return e.type!=="user-correction"?0:e.escalated?3:e.intensity==="strong"?2:1}function $i(e,t=Si){let o=e.sessions.flatMap((n,r)=>n.moments.map(s=>({moment:s,sessionIndex:r})));return o.sort((n,r)=>Fn(r.moment)-Fn(n.moment)||n.sessionIndex-r.sessionIndex||r.moment.turnNumber-n.moment.turnNumber),o.slice(0,t).map(n=>n.moment)}var Ai={"user-correction":e=>`You corrected the agent: "${e.snippet}"`,"agent-self-correction":e=>`The agent had to backtrack mid-task: "${e.snippet}"`,"tool-error":e=>`A tool call failed${e.tool?` (${e.tool})`:""}: "${e.snippet}"`,"edit-retry":e=>`The agent immediately re-edited ${e.file??"a file"} it had just edited: "${e.snippet}"`,"edit-self-correction":e=>`The agent went back to re-edit ${e.file??"a file"} it had already edited earlier in the same turn: "${e.snippet}"`};function Hn(e){let o=$i(e).map((n,r)=>`${r+1}. ${Ai[n.type](n)}`);return[`While working in this workspace ("${e.repository}"), I or the AI had to correct course to get things done correctly. Examples from recent sessions:`,"",...o,"","Please review this workspace's current setup \u2014 instructions files (e.g. .github/copilot-instructions.md, AGENTS.md), custom instructions, and prompt/chat-mode files \u2014 and propose specific, concrete changes that would prevent these kinds of corrections from being needed again. Base your suggestions on what is actually present in this repository rather than generic advice."].join(`
`)}var Ri=new Set(["\u2705","\u26A0\uFE0F","\u274C"]);function Mt(e){let t=Number(e);return Number.isFinite(t)?t:0}function jn(e){if(!e||typeof e!="object")return;let t=e,o=Array.isArray(t.customizationTypes)?t.customizationTypes.filter(r=>!!r&&typeof r=="object").map(r=>({id:typeof r.id=="string"?r.id:"",icon:typeof r.icon=="string"?r.icon:"",label:typeof r.label=="string"?r.label:""})).filter(r=>r.id!==""):[],n=Array.isArray(t.workspaces)?t.workspaces.filter(r=>!!r&&typeof r=="object").map(r=>{let s=r.typeStatuses&&typeof r.typeStatuses=="object"?r.typeStatuses:{},i={};for(let[a,l]of Object.entries(s))i[a]=Ri.has(l)?l:"\u274C";return{workspacePath:typeof r.workspacePath=="string"?r.workspacePath:"",workspaceName:typeof r.workspaceName=="string"?r.workspaceName:"",sessionCount:Mt(r.sessionCount),interactionCount:Mt(r.interactionCount),typeStatuses:i}}):[];return{customizationTypes:o,workspaces:n,totalWorkspaces:Mt(t.totalWorkspaces),workspacesWithIssues:Mt(t.workspacesWithIssues)}}function Ge(e){return typeof e=="number"&&Number.isFinite(e)?e:0}function Ei(e){if(!e||typeof e!="object")return null;let t=e;return{budgetUsd:Ge(t.budgetUsd),budgetAiCredits:Ge(t.budgetAiCredits),remainingAiCredits:Ge(t.remainingAiCredits),usedAiCredits:Ge(t.usedAiCredits),pctAvailable:Ge(t.pctAvailable)}}function Mi(e){if(!e||typeof e!="object")return null;let t={};for(let[o,n]of Object.entries(e))typeof n=="number"&&Number.isFinite(n)&&(t[o]=n);return t}function Wn(e,t){if(!t||typeof t!="object")return;let o=t,n=Ei(o.copilotApiBalance);n&&(e.copilotApiBalance=n);let r=Mi(o.monthBillingGroupCosts);r&&(e.monthBillingGroupCosts=r)}function _i(e,t){if(!t)return 0;let o=e["GitHub Copilot"]??0;return Math.max(0,t.usedAiCredits*.01-o)}function qn(e,t){let o=_i(e,t),n="GitHub Copilot"in e,r=Object.values(e).reduce((a,l)=>a+l,0)+o,s=o>.001?`<tr>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary);">GitHub Copilot - other sessions (remote or different environment)</td>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary); text-align:right;">$${C(o,2)}</td>
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
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${c(a==="GitHub Copilot"?"GitHub Copilot - local sessions":a)}</td>
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${C(l,2)}</td>
				</tr>${a==="GitHub Copilot"?s:""}`).join("")+(n?"":s)}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${C(r,2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}var Pi=3600*1e3;function Di(e){return e==="account"||e==="both"?e:"workspace"}function _(e){let t=Number(e);return Number.isFinite(t)&&t>=0?t:0}function _t(e){let t=typeof e=="string"?e.trim():"";try{let o=new URL(t);if(o.protocol==="http:"||o.protocol==="https:")return o.toString()}catch{}return"#"}function Kn(e){let t=e&&typeof e=="object"?e:{},o=Array.isArray(t.repos)?t.repos:[];return{authenticated:!!t.authenticated,since:typeof t.since=="string"?c(t.since):new Date(Date.now()-720*60*60*1e3).toISOString(),fetchedAt:typeof t.fetchedAt=="string"?t.fetchedAt:"",totalTasks:_(t.totalTasks),totalSessions:_(t.totalSessions),totalCredits:_(t.totalCredits),totalPremiumRequests:_(t.totalPremiumRequests),accountTasksAvailable:!!t.accountTasksAvailable,refreshIntervalMs:_(t.refreshIntervalMs)||Pi,accountTasksError:typeof t.accountTasksError=="string"?c(t.accountTasksError):void 0,partial:!!t.partial,repos:o.map(n=>{let r=n&&typeof n=="object"?n:{},s=c(typeof r.owner=="string"?r.owner:""),i=c(typeof r.repo=="string"?r.repo:""),a=!!r.unassigned||!s||!i;return{owner:s,repo:i,repoUrl:a?"#":_t(`https://github.com/${s}/${i}`),totalTasks:_(r.totalTasks),totalSessions:_(r.totalSessions),totalCredits:_(r.totalCredits),totalPremiumRequests:_(r.totalPremiumRequests),tasksScanned:_(r.tasksScanned),tasksTotal:_(r.tasksTotal),partial:!!r.partial,discovery:Di(r.discovery),unassigned:a,error:typeof r.error=="string"?c(r.error):void 0}})}}var Li=new Set(["activity","sessions","tools","health","repos","agent","worktrees","insights","corrections"]);function Gn(e){return Li.has(String(e))}function Ao(e,t){if(!Number.isFinite(e)||e<=0||!Number.isFinite(t)||t<=0)return 5;let o=Math.min(e/t,1);return 5+Math.sqrt(o)*11}function Pt(e,t,o,n){let r=Math.max(18,Array.from(e.label).length*6),s=n==="start"?t:n==="end"?t-r:t-r/2;return{x:t,y:o,textAnchor:n,bounds:{left:s,right:s+r,top:o-10,bottom:o-10+12}}}var Ii=5,Vn=15;function Ui(e,t){let o=e.y<(t.top+t.bottom)/2,n=[];for(let r=0;r<Ii;r++){let s=e.y+18+r*Vn,i=e.y-10-r*Vn;n.push(...o?[s,i]:[i,s])}return n}function zi(e,t){let o=e.x+e.radius+4,n=e.x-e.radius-4,r=e.y-e.radius-6,s=e.y+e.radius+12,i=Ui(e,t);return[...i.map(a=>Pt(e,o,a,"start")),...i.map(a=>Pt(e,n,a,"end")),Pt(e,e.x,r,"middle"),Pt(e,e.x,s,"middle")]}function Bi(e,t){return e.left<t.right+2&&e.right+2>t.left&&e.top<t.bottom+2&&e.bottom+2>t.top}function Oi(e,t){let o=Math.max(e.left,Math.min(t.x,e.right)),n=Math.max(e.top,Math.min(t.y,e.bottom)),r=t.x-o,s=t.y-n;return r*r+s*s<(t.radius+2)**2}function Yn(e,t,o,n){let r=e.bounds,s=Math.max(0,n.left-r.left)+Math.max(0,r.right-n.right)+Math.max(0,n.top-r.top)+Math.max(0,r.bottom-n.bottom),i=t.filter(l=>Bi(r,l.bounds)).length,a=o.filter(l=>Oi(r,l)).length;return s*1e4+a*1e3+i*100}function Jn(e,t){let o=[];for(let n of e){let s=zi(n,t).reduce((i,a)=>Yn(a,o,e,t)<Yn(i,o,e,t)?a:i);o.push(s)}return o}function Xn(e,t=Ni){return o=>{e({command:"usageWebviewReady",reason:o,hasGitHubActivityContainers:t()})}}function Ni(){return typeof document>"u"?!1:!!(document.querySelector("#repos-pr-content")&&document.querySelector("#agent-sessions-content"))}function Zn(e,t,o,n){e&&o(e),t&&n(t)}var er=/^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;function tr(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function or(e){let t=er.exec(e);if(t)return`Claude MCP: M365 Connector - ${tr(t[1])}`}function nr(e){return er.test(e)}var Fi=[{displayName:"GitHub MCP",keywords:["github"],actions:new Set(["actions_list","add_comment_to_pending_review","add_issue_comment","add_reply_to_pull_request_comment","assign_copilot_to_issue","create_or_update_file","create_pull_request","create_repository","get_commit","get_file_contents","get_job_logs","get_label","get_latest_release","get_me","get_release_by_tag","get_repository_tree","get_tag","issue_read","issue_write","label_write","list_branches","list_code_scanning_alerts","list_commits","list_issue_fields","list_issue_types","list_issues","list_label","list_pull_requests","list_tags","projects_list","pull_request_read","pull_request_review_write","request_copilot_review","search_code","search_issues","search_pull_requests","search_repositories","search_users","semantic_issue_similarity_search","semantic_issues_search","sub_issue_write","update_pull_request"])},{displayName:"Playwright MCP",keywords:["playwright"],actions:new Set(["browser_click","browser_close","browser_console_messages","browser_evaluate","browser_fill_form","browser_find","browser_hover","browser_install","browser_navigate","browser_network_request","browser_network_requests","browser_press_key","browser_resize","browser_run_code","browser_run_code_unsafe","browser_snapshot","browser_tabs","browser_take_screenshot","browser_type","browser_wait_for"])},{displayName:"Context7 MCP",keywords:["context7"],actions:new Set(["get_library_docs","query_docs","resolve_library_id"])},{displayName:"Tavily MCP",keywords:["tavily"],actions:new Set(["tavily_crawl","tavily_extract","tavily_research","tavily_search","crawl","extract","research","search"])},{displayName:"Microsoft Docs MCP",keywords:["microsoft_doc","microsoftdocs","microsoft_learn"],actions:new Set(["docs_fetch","docs_search","code_sample_search"])},{displayName:"Claude Browser MCP",keywords:["claude_browser","claude_in_chrome"],actions:new Set(["computer","find","get_page_text","javascript_tool","navigate","preview_list","preview_logs","preview_start","preview_stop","read_console_messages","read_network_requests","read_page","resize_window","tabs_close","tabs_context","tabs_create","tabs_select"])}];function Hi(e){return e.toLowerCase().replace(/[.-]/g,"_")}function Ro(e){let t=Hi(e);for(let o of Fi)if(o.keywords.some(n=>t.includes(n))){for(let n of o.actions)if(t===n||t.endsWith(`_${n}`))return`${o.displayName}: ${tr(n)}`}}function rr(e){return Ro(e)!==void 0}function ji(e){return e.replace(/(?<=[a-z0-9])(?=[A-Z])/g,"_").replace(/(?<=[A-Z])(?=[A-Z][a-z])/g,"_")}function Qn(e){return ji(e).toLowerCase().replace(/[.-]/g,"_")}function Eo(e,t){if(t[e])return t[e];let o=e.toLowerCase();if(t[o])return t[o];let n=Qn(e);for(let r of Object.keys(t))if(Qn(r)===n)return t[r]}function j(e,t){let o=t?` title="${c(t)}"`:"",n="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";return e==="\u2705"?`<span style="${n}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${o} aria-label="${c(t??"Present and fresh")}">\u2713</span>`:e==="\u26A0\uFE0F"?`<span style="${n}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${o} aria-label="${c(t??"Present but stale")}">!</span>`:`<span style="${n}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${o} aria-label="${c(t??"Missing")}">\u2715</span>`}var f=acquireVsCodeApi(),vs=Xn(e=>f.postMessage(e)),Yr=new Set,Z=f.getState()?.aboutCollapsed??!1;function te(e,t){try{f.postMessage({command:"traceUsageCuration",stage:e,details:t??{}})}catch{}}function ve(e,t,o){Yr.has(e)||(Yr.add(e),te(t,o))}var E=G("__INITIAL_USAGE__");if(E?.localization){Cn(E.localization);let e=E.localization.__language__||"en";Tn(e)}var H=null,wt=new Map,Ie=new Set,B=null,xe=!1,Zt=!1,ke=!1,mt=!1,xs=[],S="activity",Gt=null,Vt=null,cn=[],F=null,uo,Yt=null,I=E?.worktreeScanRoots?[...E.worktreeScanRoots]:[],L=E?.worktreeBackgroundScan?E.worktreeBackgroundScan.worktrees.map(mn):[],at=E?.worktreeBackgroundScan?{scannedAt:E.worktreeBackgroundScan.scannedAt,totalBytes:E.worktreeBackgroundScan.totalBytes}:null,M=!1,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},bt=null,Jo=!1,Jt=new Set,lt=!1,yt="count",ct="desc",q=!1,ce=!1,dn={processed:0,total:0},le=[];function A(e){return Number(e??0)||0}var la=`
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
</style>`,dt=[{id:"ul-s-start",label:"Starting usage analysis"},{id:"ul-s-tools",label:"Collecting runtime tools"},{id:"ul-s-mcp",label:"Discovering MCP servers"},{id:"ul-s-skills",label:"Scanning skill directories"},{id:"ul-s-crunch",label:"Computing curation analysis"},{id:"ul-s-ready",label:"Ready!"}],ca={start:{pct:5,stepId:"ul-s-start",subtitle:"Starting usage analysis\u2026"},"curation:start":{pct:20,stepId:"ul-s-tools",subtitle:"Collecting tools and skills\u2026"},"curation:runtimeTools":{pct:32,stepId:"ul-s-tools",subtitle:"Collected runtime tools"},"curation:mcpJson":{pct:44,stepId:"ul-s-mcp",subtitle:"Scanning MCP config files\u2026"},"curation:mcpSources":{pct:55,stepId:"ul-s-mcp",subtitle:"Collected MCP servers"},"curation:skillsScanStart":{pct:63,stepId:"ul-s-skills",subtitle:"Scanning skill directories\u2026"},"curation:skillsScanDone":{pct:75,stepId:"ul-s-skills",subtitle:"Skill discovery complete"},"curation:analyzing":{pct:85,stepId:"ul-s-crunch",subtitle:"Analyzing tool usage patterns\u2026"},"curation:done":{pct:96,stepId:"ul-s-crunch",subtitle:"Curation analysis complete"},ready:{pct:100,stepId:"ul-s-ready",subtitle:"Usage analysis ready"},error:{pct:100,stepId:"ul-s-ready",subtitle:"Analysis completed with errors"},"curation:error":{pct:85,stepId:"ul-s-crunch",subtitle:"Curation analysis skipped"}};function un(e="Loading usage analysis..."){let t=document.getElementById("root");if(!t)return;pn=!0;let o=dt.map((n,r)=>{let s=r===0,i=s?"ul-step ul-active":"ul-step",a=s?'<span class="ul-spin">\u21BB</span>':"\u25CB";return`<div class="${i}" id="${n.id}"><span class="ul-ico">${a}</span><span class="ul-lbl">${c(n.label)}</span><span class="ul-cnt" id="${n.id}-cnt"></span></div>`}).join("");x(t,`${la}
<div id="usage-loading-wrap">
  <div id="usage-loading-card">
    <div id="ul-header">
      <div>
        <div id="ul-badge">\u{1F4CA} Analyzing Usage Data</div>
        <div id="ul-title">${c(e)}</div>
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
</div>`)}function Jr(e){let t=document.getElementById(e);if(!t)return;t.className="ul-step ul-done";let o=t.querySelector(".ul-ico");o&&x(o,'<span class="ul-pop">\u2713</span>')}function da(e){let t=document.getElementById(e);if(!t)return;t.className="ul-step ul-active";let o=t.querySelector(".ul-ico");o&&x(o,'<span class="ul-spin">\u21BB</span>')}function ua(e,t){let o=document.getElementById(`${e}-cnt`);o&&(o.textContent=t)}var ut=0,pn=!1;function pa(e,t){for(let o=ut;o<e;o++)Jr(dt[o].id);e>ut&&(ut=e),t<100?da(dt[e].id):Jr(dt[e].id)}function ga(e){return typeof e.count=="number"?`${e.count}`:typeof e.skills=="number"?`${e.skills} skills`:typeof e.availableTools=="number"?`${e.availableTools} tools`:""}function fa(){let e=document.getElementById("root");return e?e.querySelector("#usage-loading-card")?!0:pn?(un("Building Usage Analysis"),ut=0,!0):!1:!1}function ma(e){if(!fa())return;let t=typeof e?.stage=="string"?e.stage:"",o=ca[t];if(!o)return;let n=o.pct,r=document.getElementById("ul-fill");r&&(r.classList.remove("ul-indeterminate"),r.style.width=`${Math.max(n,3)}%`);let s=document.getElementById("ul-pct");s&&(s.textContent=n===100?"100%":`${n}%`);let i=document.getElementById("ul-subtitle");i&&(i.textContent=o.subtitle);let a=dt.findIndex(u=>u.id===o.stepId);a>=0&&pa(a,n);let l=e?.details;if(l&&typeof l=="object"){let u=ga(l);u&&ua(o.stepId,`(${u})`)}}function nn(){Vt!==null&&(clearTimeout(Vt),Vt=null)}function po(){let e=document.createElement("button");return e.textContent="\u{1F504} Refresh",e.style.cssText="padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;",e.addEventListener("click",()=>f.postMessage({command:"refresh"})),e}function ks(e){let t=document.getElementById("root");if(!t)return;let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="font-size: 24px; margin-bottom: 12px;",x(n,j("\u274C","Error"));let r=document.createElement("div");r.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",r.textContent=e,o.append(n,r,po()),t.textContent="",t.append(o)}var Qt=!1,_e=null,eo=!1,it=null,ba={xhigh:"Extra High"};function ya(e){return ba[e]??e}var to=G("__TOOL_NAMES__")??null,ha=G("__AUTOMATIC_TOOLS__")??[],Xr=new Set(ha.map(e=>e.toLowerCase()));function pt(e){return to?Eo(e,to)??or(e)??Ro(e)??e:e}function Xo(e){let t=pt(e),o=t.indexOf(":");return o!==-1?t.substring(o+1).trim():t}function va(e){let t=new Set;Object.entries(e.today.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.entries(e.last30Days.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.entries(e.month.mcpTools.byTool).forEach(([n])=>t.add(n)),Object.keys(e.today.mcpTools.byServer).forEach(n=>t.add(n)),Object.keys(e.last30Days.mcpTools.byServer).forEach(n=>t.add(n)),Object.keys(e.month.mcpTools.byServer).forEach(n=>t.add(n)),Object.entries(e.today.toolCalls.byTool).forEach(([n])=>t.add(n)),Object.entries(e.last30Days.toolCalls.byTool).forEach(([n])=>t.add(n)),Object.entries(e.month.toolCalls.byTool).forEach(([n])=>t.add(n));let o=new Set(e.suppressedUnknownTools??[]);return Array.from(t).filter(n=>!(to&&Eo(n,to))&&!nr(n)&&!rr(n)&&!o.has(n)).sort()}function xa(e){let t="https://github.com/rajbos/ai-engineering-fluency",o=encodeURIComponent("Add missing friendly names for tools"),n=e.map(i=>`- \`${i}\``).join(`
`),r=encodeURIComponent(`## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${n}

Please add friendly names for these tools to improve the user experience.`),s=encodeURIComponent("MCP Toolnames");return`${t}/issues/new?title=${o}&body=${r}&labels=${s}`}var ka=[{label:"\u{1F4AC} Ask Mode",key:"ask",gradient:"linear-gradient(90deg, #3b82f6, #60a5fa)"},{label:"\u270F\uFE0F Edit Mode",key:"edit",gradient:"linear-gradient(90deg, #10b981, #34d399)"},{label:"\u{1F916} Agent Mode",key:"agent",gradient:"linear-gradient(90deg, #7c3aed, #a855f7)"},{label:"\u{1F4CB} Plan Mode",key:"plan",gradient:"linear-gradient(90deg, #f59e0b, #fbbf24)"},{label:"\u26A1 Custom Agent",key:"customAgent",gradient:"linear-gradient(90deg, #ec4899, #f472b6)"},{label:"\u{1F5A5}\uFE0F CLI",key:"cli",gradient:"linear-gradient(90deg, #06b6d4, #22d3ee)"},{label:"\u2728 Copilot App",key:"cliApp",gradient:"linear-gradient(90deg, #6366f1, #818cf8)"},{label:"\u{1F5A5}\uFE0F Claude Desktop",key:"claudeDesktop",gradient:"linear-gradient(90deg, #d97706, #f59e0b)"},{label:"\u{1F9E9} Claude (VS Code)",key:"claudeVsCode",gradient:"linear-gradient(90deg, #ea580c, #fb923c)"}];function Ca(e,t,o,n){let r=o>0?t/o*100:0;return`
<div class="bar-item">
<div class="bar-label"><span>${e}</span><span><strong>${g(t)}</strong> (${oe(r,0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${r.toFixed(1)}%; background: ${n};"></div></div>
</div>`}function Zr(e,t){let o=e.ask+e.edit+e.agent+e.plan+e.customAgent+e.cli+(e.cliApp??0)+(e.claudeDesktop??0)+(e.claudeVsCode??0),n=ka.map(({label:r,key:s,gradient:i})=>Ca(r,e[s]??0,o,i)).join("");return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${t}</h4>
<div class="bar-chart">${n}
</div>
</div>`}function wa(e){return`
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${C(e.averageModelsPerSession,1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${oe(e.switchingFrequency,0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${g(e.maxModelsPerSession||0)}</div>
</div>
</div>`}function Ta(e,t,o,n){return`
<div style="min-height: 110px;">
${e.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">\u{1F49A} Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${e.map(c).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${t.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${t.map(c).join(", ")}</span>
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
</div>`}function Sa(e){return e.totalRequests<=0?"":`
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${e.lowCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${g(e.lowCostRequests)} (${oe(e.lowCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.mediumCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${g(e.mediumCostRequests)} (${oe(e.mediumCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.highCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${g(e.highCostRequests)} (${oe(e.highCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.unknownRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${g(e.unknownRequests)} (${oe(e.unknownRequests/e.totalRequests*100)})</span>
</div>
`:""}
</div>`}function $a(e){return e.mixedCostSessions<=0?"":`
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${g(e.mixedCostSessions)}</span>
</div>`}function Zo(e,t,o,n,r,s){return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${e}</h4>
${wa(t)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${Ta(o,n,r,s)}
${Sa(t)}
${$a(t)}
</div>
</div>`}function Qr(e,t,o,n,r){let s=document.querySelector(e);if(!s)return;let i=r>0?Math.round(n/r*100):0,a=`${o} ${n}/${r} repos (${i}%)`,l=s.querySelector(`.${t}`);if(l)l.textContent=a;else{Array.from(s.children).forEach(d=>{let p=d;!p.classList.contains("section-title")&&!p.classList.contains("section-subtitle")&&p.remove()});let u=document.createElement("div");u.className=t,u.style.cssText="margin-top:8px; font-size:12px; color:var(--text-secondary);",u.textContent=a,s.appendChild(u)}}function Aa(e){let t=e.missedPotential||E?.missedPotential||[];return t.length===0?`
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
    `}function Q(e,t=10,o=pt,n=!1){let s=(n&&ht?Object.entries(e).filter(([a])=>!Xr.has(a.toLowerCase())):Object.entries(e)).sort(([,a],[,l])=>l-a).slice(0,t);return s.length===0?n&&ht?'<div style="color: var(--text-muted);">No purposeful tools used yet (automatic tool calls are hidden)</div>':'<div style="color: var(--text-muted);">No tools used yet</div>':`
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${s.map(([a,l],u)=>{let d=c(o(a)),p=c(a),b=Xr.has(a.toLowerCase())?'<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>':"";return`
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${u+1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${p}">${d}</strong>${b}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${g(l)}</td>
		    </tr>`}).join("")}
			</tbody>
		</table>`}function ae(e){return{html:qe(e),title:g(e)}}function gn(e){return pe(e).some(t=>t.toLowerCase().replace(/[-_. ]/g,"").startsWith("hydrafusion"))}function rn(e){return e.activeDurationMs?e.activeDurationMs:e.durationMs}var fn=[{id:"interactions",label:"Turns",sortKey:"interactions",align:"right",render:e=>ae(e.interactions)},{id:"toolCalls",label:"Tools",sortKey:"toolCalls",align:"right",render:e=>ae(e.toolCalls)},{id:"subAgentCalls",label:"Sub-Agents",sortKey:"subAgentCalls",align:"right",render:e=>e.subAgentCalls?{...ae(e.subAgentCalls),title:`${g(e.subAgentCalls)} sub-agent tool call${e.subAgentCalls===1?"":"s"} detected in this session`}:{html:"\u2014",title:"No sub-agent calls detected in this session"}},{id:"inputTokens",label:"Input",sortKey:"inputTokens",align:"right",render:e=>ae(e.inputTokens)},{id:"outputTokens",label:"Output",sortKey:"outputTokens",align:"right",render:e=>ae(e.outputTokens)},{id:"thinkingTokens",label:"Thinking",sortKey:"thinkingTokens",align:"right",render:e=>ae(e.thinkingTokens)},{id:"cachedTokens",label:"Cached",sortKey:"cachedTokens",align:"right",render:e=>ae(e.cachedTokens)},{id:"totalTokens",label:"Total",sortKey:"totalTokens",align:"right",render:e=>ae(e.totalTokens)},{id:"estimatedCost",label:"Cost",sortKey:"estimatedCost",align:"right",render:e=>e.estimatedCost>0?{html:vo(e.estimatedCost),title:`$${e.estimatedCost.toFixed(4)}`}:{html:"\u2014"}},{id:"editor",label:"Editor",sortKey:"editor",align:"left",render:e=>({html:c(e.editor||"unknown")})},{id:"workspace",label:"Workspace",sortKey:"workspace",align:"left",cellStyle:"max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:e=>{let t=c(e.workspace||"\u2014");return{html:t,title:t}}},{id:"models",label:"Models",align:"left",cellStyle:"font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;",render:e=>{let t=e.models.map(o=>c(Y(o))).join(", ")||"\u2014";return{html:t,title:t}}},{id:"durationMs",label:"Duration",sortKey:"durationMs",align:"right",cellStyle:"white-space:nowrap;",render:e=>{let t=rn(e),o=e.durationMs!==void 0?`Wall time: ${xo(e.durationMs)}`:void 0;return{html:xo(t),...o?{title:o}:{}}}},{id:"lastActivity",label:"Last Active",sortKey:"lastActivity",align:"right",cellStyle:"white-space:nowrap;",render:e=>({html:e.lastActivity?U==="today"?new Date(e.lastActivity).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!no}):new Date(e.lastActivity).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hour12:!no}):"\u2014"})}],Cs=fn.map(e=>e.id),De="interactions",gt="desc",oo=[],no=!0,ht=!0,U="today",sn=[],Ue={},ze=new Set(Cs),Be=new Set,Oe=new Set,Ne=new Set,Le=!1;function Ra(){f.postMessage({command:"saveSessionColumnSettings",settings:{enabledColumns:Array.from(ze)}})}function Ea(e){return!(Le&&!e.models.some(gn)||Be.size>0&&!Be.has(e.editor||"unknown")||Ne.size>0&&!e.models.some(t=>Ne.has(t))||Oe.size>0&&!e.models.some(t=>Oe.has(Ce(t))))}function Ma(){return Le||Be.size>0||Oe.size>0||Ne.size>0}function _a(e){let t=new Map,o=new Map,n=new Map,r=0;for(let i of e){let a=i.editor||"unknown";t.set(a,(t.get(a)||0)+1);let l=new Set,u=!1;for(let d of i.models)n.set(d,(n.get(d)||0)+1),l.add(Ce(d)),gn(d)&&(u=!0);for(let d of l)o.set(d,(o.get(d)||0)+1);u&&r++}let s=(i,a)=>Array.from(i.entries()).map(([l,u])=>({value:l,label:a(l),count:u})).sort((l,u)=>u.count-l.count||l.label.localeCompare(u.label));return{editors:s(t,i=>i),vendors:s(o,i=>i),models:s(n,Y),hydraFusionCount:r}}function Qo(e,t,o,n){if(o.length===0)return"";let r=o.map(({value:s,label:i,count:a})=>{let l=n.has(s),u=c(i);return`<button type="button" class="session-filter-pill${l?" active":""}" data-filter-type="${t}" data-filter-value="${c(s)}" aria-pressed="${l}" title="${u}: ${a} session${a===1?"":"s"}">${u} <span class="session-filter-pill-count">${a}</span></button>`}).join("");return`<div class="session-filter-group"><span class="session-filter-group-label">${c(e)}:</span>${r}</div>`}function Pa(e){if(!e||e.length===0)return"";let t=_a(e);if(t.editors.length===0&&t.vendors.length===0&&t.models.length===0)return"";let o=[];if(t.hydraFusionCount>0){let r=Le;o.push(`<div class="session-filter-group"><button type="button" class="session-filter-pill session-filter-pill-hydrafusion${r?" active":""}" data-filter-type="hydrafusion" data-filter-value="true" aria-pressed="${r}" title="Show only sessions that used HydraFusion">\u26A1 HydraFusion <span class="session-filter-pill-count">${t.hydraFusionCount}</span></button></div>`)}o.push(Qo("Editor","editor",t.editors,Be)),o.push(Qo("Vendor","vendor",t.vendors,Oe)),o.push(Qo("Model","model",t.models,Ne));let n=Ma()?'<button type="button" id="sessions-filter-clear" class="session-filter-pill session-filter-pill-clear">\u2715 Clear filters</button>':"";return`<div class="session-filter-bar">${o.filter(Boolean).join("")}${n}</div>`}function Da(e){if(e.closest("#sessions-filter-clear"))return Be.clear(),Oe.clear(),Ne.clear(),Le=!1,!0;let o=e.closest(".session-filter-pill");if(!o)return!1;let n=o.getAttribute("data-filter-type"),r=o.getAttribute("data-filter-value");if(n==="hydrafusion")return Le=!Le,!0;if(!r)return!1;let s=n==="editor"?Be:n==="vendor"?Oe:n==="model"?Ne:void 0;return s?(s.has(r)?s.delete(r):s.add(r),!0):!1}function es(e){return De!==e?"":gt==="desc"?" \u25BC":" \u25B2"}var La={title:(e,t)=>(e.title||"").localeCompare(t.title||""),editor:(e,t)=>(e.editor||"").localeCompare(t.editor||""),workspace:(e,t)=>(e.workspace||"").localeCompare(t.workspace||""),durationMs:(e,t)=>(rn(e)??-1)-(rn(t)??-1),subAgentCalls:(e,t)=>(e.subAgentCalls??0)-(t.subAgentCalls??0),lastActivity:(e,t)=>(e.lastActivity||"").localeCompare(t.lastActivity||"")};function Ia(e,t){let o=La[De];return o?o(e,t):e[De]-t[De]}function Ua(e){return[...e].sort((t,o)=>{let n=Ia(t,o);return gt==="desc"?-n:n})}function an(e){return oo=e,!e||e.length===0?`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${U==="today"?"No sessions recorded today yet.":"No sessions recorded in this period."}</div>`:`<div id="sessions-table-container">${ro(e)}</div>`}function ro(e){let t=Pa(e),o=e.filter(Ea),n=Ua(o),r=fn.filter(a=>ze.has(a.id));if(n.length===0)return`${t}<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No sessions match the selected filters.</div>`;let s=n.map((a,l)=>{let u=c(a.title||"Untitled session"),d=c(a.filePath||""),p=a.models.some(gn)?'<span class="hydrafusion-session-badge" title="This session used HydraFusion" style="display:inline-block; margin-right:4px; padding:1px 5px; border:1px solid var(--vscode-badge-background, var(--accent-color)); border-radius:999px; background:var(--vscode-badge-background, var(--accent-color)); color:var(--vscode-badge-foreground, var(--bg-primary)); font-size:10px; font-weight:600; line-height:14px; vertical-align:middle;">HydraFusion</span>':"",b=r.map(h=>{let{html:T,title:ue}=h.render(a),fo=h.align==="right"?"text-align:right;":"",mo=ue!==void 0?` title="${ue}"`:"";return`<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${fo}${h.cellStyle||""}"${mo}>${T}</td>`}).join("");return`<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${l+1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${u}&quot;"><a href="#" class="session-title-link" data-file="${d}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${p}${u}</a></td>
			${b}
		</tr>`}).join(""),i=r.map(a=>{let l=a.align==="right"?" text-align:right;":"";return a.sortKey?`<th class="sortable" data-sort="${a.sortKey}" style="padding:6px 8px;${l}">${a.label}${es(a.sortKey)}</th>`:`<th style="padding:6px 8px;${l}">${a.label}</th>`}).join("");return`
		${t}
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${es("title")}</th>
					${i}
				</tr>
			</thead>
			<tbody>
				${s}
			</tbody>
		</table>
		</div>`}function za(){return`
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">\u2699 Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${fn.map(t=>`
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${t.id}"${ze.has(t.id)?" checked":""} />
			<span>${t.label}</span>
		</label>`).join("")}
			</div>
		</div>`}function ws(){let e=document.getElementById("sessions-panel-body");e&&(e.addEventListener("click",t=>{let o=t.target.closest("a.session-title-link");if(o){t.preventDefault();let i=o.getAttribute("data-file");i&&f.postMessage({command:"openSessionFile",file:i});return}if(Da(t.target)){let i=document.getElementById("sessions-table-container");i&&x(i,ro(oo));return}let n=t.target.closest("th.sortable");if(!n)return;let r=n.getAttribute("data-sort");if(!r)return;De===r?gt=gt==="desc"?"asc":"desc":(De=r,gt="desc");let s=document.getElementById("sessions-table-container");s&&x(s,ro(oo))}),Ts(),Ba())}var ts=!1;function Ba(){let e=document.getElementById("sessions-columns-toggle"),t=document.getElementById("sessions-columns-menu");!e||!t||(e.addEventListener("click",o=>{o.stopPropagation(),t.style.display=t.style.display==="none"?"block":"none"}),t.addEventListener("click",o=>o.stopPropagation()),t.addEventListener("change",o=>{let n=o.target,r=n.getAttribute("data-column");if(!r)return;n.checked?ze.add(r):ze.delete(r);let s=document.getElementById("sessions-table-container");s&&x(s,ro(oo)),Ra()}),ts||(ts=!0,document.addEventListener("click",()=>{let o=document.getElementById("sessions-columns-menu");o&&(o.style.display="none")})))}function Ts(){let e=document.getElementById("sessions-lookback-wrapper");if(!e)return;e.replaceChildren();let{wrapper:t}=bo({id:"sessions-lookback",selected:U,disabled:["allTime"],disabledTitle:"All-time sessions are not loaded yet",label:"",onChange:o=>{U=o,ln()}});e.append(t),U!=="today"&&!Ue[U]&&ln()}function ln(){let e=document.getElementById("sessions-panel-body");if(!e)return;if(U==="today"){x(e,an(sn));return}let t=Ue[U];if(t){x(e,an(t));return}x(e,`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${St[U]}\u2026</div>`),f.postMessage({command:"loadRecentSessions",period:U})}function Oa(e){let t=e.period;if(!t)return;let o=Array.isArray(e.sessions)?e.sessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"):[];Ue[t]=o,U===t&&ln()}function Ss(e){for(let o of At)delete Ue[o];let t=Co(e);if(t)for(let o of At)Ue[o]=t[o]}function ee(e,t){let o={...e};for(let n of t)n in o||(o[n]=0);return o}function v(e){let t=Number(e);return Number.isFinite(t)?t:0}function Na(e){let t=e&&typeof e=="object"?e:{};return{ask:v(t.ask),edit:v(t.edit),agent:v(t.agent),plan:v(t.plan),customAgent:v(t.customAgent),cli:v(t.cli),cliApp:v(t.cliApp),claudeDesktop:v(t.claudeDesktop),claudeVsCode:v(t.claudeVsCode)}}function Fa(e){let t=e&&typeof e=="object"?e:{};return{file:v(t.file),selection:v(t.selection),implicitSelection:v(t.implicitSelection),symbol:v(t.symbol),codebase:v(t.codebase),workspace:v(t.workspace),terminal:v(t.terminal),vscode:v(t.vscode),terminalLastCommand:v(t.terminalLastCommand),terminalSelection:v(t.terminalSelection),clipboard:v(t.clipboard),changes:v(t.changes),outputPanel:v(t.outputPanel),problemsPanel:v(t.problemsPanel),pullRequest:v(t.pullRequest),byKind:t.byKind??{},copilotInstructions:v(t.copilotInstructions),agentsMd:v(t.agentsMd),byPath:t.byPath??{}}}function qt(e){let t=e&&typeof e=="object"?e:{},o=t.toolCalls&&typeof t.toolCalls=="object"?t.toolCalls:{},n=t.mcpTools&&typeof t.mcpTools=="object"?t.mcpTools:{};return{sessions:v(t.sessions),modeUsage:Na(t.modeUsage),contextReferences:Fa(t.contextReferences),toolCalls:{total:v(o.total),byTool:o.byTool??{}},mcpTools:{total:v(n.total),byServer:n.byServer??{},byTool:n.byTool??{}},modelSwitching:{modelsPerSession:[],totalSessions:0,averageModelsPerSession:0,maxModelsPerSession:0,minModelsPerSession:0,switchingFrequency:0,standardModels:[],premiumModels:[],unknownModels:[],mixedTierSessions:0,lowCostModels:[],mediumCostModels:[],highCostModels:[],mixedCostSessions:0,standardRequests:0,premiumRequests:0,lowCostRequests:0,mediumCostRequests:0,highCostRequests:0,unknownRequests:0,totalRequests:0,...t.modelSwitching??{}},thinkingEffortUsage:t.thinkingEffortUsage,modelEfficiency:t.modelEfficiency,contextWindow:_n(t.contextWindow),contextPressure:Pn(t.contextPressure)}}function $s(e){return e.filter(t=>t&&typeof t=="object"&&typeof t.id=="string").map(t=>({id:String(t.id),category:typeof t.category=="string"?t.category:"general",severity:["tip","opportunity","celebration"].includes(t.severity)?t.severity:"tip",title:typeof t.title=="string"?t.title:"",body:typeof t.body=="string"?t.body:"",actionLabel:typeof t.actionLabel=="string"?t.actionLabel:void 0,actionCommand:typeof t.actionCommand=="string"?t.actionCommand:void 0,secondaryActionLabel:typeof t.secondaryActionLabel=="string"?t.secondaryActionLabel:void 0,secondaryActionCommand:typeof t.secondaryActionCommand=="string"?t.secondaryActionCommand:void 0,status:["new","seen","dismissed","snoozed","done"].includes(t.status)?t.status:"new",allowToast:!!t.allowToast}))}var As=["user-correction","edit-retry","edit-self-correction","tool-error","agent-self-correction"],Ha=[...As,"escalated"];function ja(e){return!e||typeof e!="object"||!As.includes(e.type)||typeof e.snippet!="string"?null:{type:e.type,turnNumber:typeof e.turnNumber=="number"?e.turnNumber:0,timestamp:typeof e.timestamp=="string"?e.timestamp:null,snippet:e.snippet,tool:typeof e.tool=="string"?e.tool:void 0,file:typeof e.file=="string"?e.file:void 0,retried:e.retried===!0?!0:void 0,matchedPattern:typeof e.matchedPattern=="string"?e.matchedPattern:void 0,intensity:e.intensity==="strong"?"strong":void 0,escalated:e.escalated===!0?!0:void 0,corroboratedBy:["tool-error","edit-retry","user-correction"].includes(e.corroboratedBy)?e.corroboratedBy:void 0}}function Rs(e){let t=o=>typeof o=="number"&&isFinite(o)&&o>=0?o:0;return{userCorrections:t(e?.userCorrections),editRetries:t(e?.editRetries),editSelfCorrections:t(e?.editSelfCorrections),toolErrors:t(e?.toolErrors),toolErrorsRetried:t(e?.toolErrorsRetried),agentSelfCorrections:t(e?.agentSelfCorrections),escalatedUserCorrections:t(e?.escalatedUserCorrections)}}function Wa(e){if(!e||typeof e!="object"||typeof e.file!="string"||!Array.isArray(e.moments))return null;let t=e.moments.map(ja).filter(o=>o!==null);return t.length===0?null:{file:e.file,title:typeof e.title=="string"?e.title:null,lastInteraction:typeof e.lastInteraction=="string"?e.lastInteraction:null,moments:t,totalMoments:typeof e.totalMoments=="number"&&isFinite(e.totalMoments)?Math.max(t.length,e.totalMoments):t.length}}function qa(e){if(!e||typeof e!="object"||typeof e.repository!="string"||!Array.isArray(e.sessions))return null;let t=e.sessions.map(Wa).filter(o=>o!==null);return t.length===0?null:{repository:e.repository,sessions:t,counts:Rs(e.counts),sessionsWithMoments:typeof e.sessionsWithMoments=="number"?e.sessionsWithMoments:t.length}}function Ka(e){if(!e||typeof e!="object"||!Array.isArray(e.repos))return null;let t=e.repos.map(qa).filter(o=>o!==null);return t.length===0?null:{sessionsPerRepo:typeof e.sessionsPerRepo=="number"?e.sessionsPerRepo:25,repos:t,counts:Rs(e.counts),sessionsWithMoments:typeof e.sessionsWithMoments=="number"?e.sessionsWithMoments:t.reduce((o,n)=>o+n.sessionsWithMoments,0)}}function Ga(e){if(!e||typeof e!="object"||typeof e.representativePrompt!="string"||typeof e.sessionCount!="number"||!Array.isArray(e.sessions))return null;let t=e.sessions.filter(o=>o&&typeof o=="object"&&typeof o.file=="string").map(o=>({file:o.file,title:typeof o.title=="string"?o.title:null,lastInteraction:typeof o.lastInteraction=="string"?o.lastInteraction:null,repository:typeof o.repository=="string"?o.repository:void 0}));return t.length===0?null:{representativePrompt:e.representativePrompt,sessionCount:t.length,repositories:Array.isArray(e.repositories)?e.repositories.filter(o=>typeof o=="string"):[],sessions:t,sharedKeywords:Array.isArray(e.sharedKeywords)?e.sharedKeywords.filter(o=>typeof o=="string"):[]}}function Va(e){if(!e||typeof e!="object"||!Array.isArray(e.clusters))return null;let t=e.clusters.map(Ga).filter(o=>o!==null);return t.length===0?null:{minClusterSize:typeof e.minClusterSize=="number"?e.minClusterSize:2,sessionsScanned:typeof e.sessionsScanned=="number"?e.sessionsScanned:0,clusters:t}}function Ya(e){if(!e||typeof e!="object")return null;let t=e;return{windowDays:typeof t.windowDays=="number"?t.windowDays:30,availableTools:Array.isArray(t.availableTools)?t.availableTools:[],usedTools:Array.isArray(t.usedTools)?t.usedTools:[],unusedTools:Array.isArray(t.unusedTools)?t.unusedTools:[],underusedMcpServers:Array.isArray(t.underusedMcpServers)?t.underusedMcpServers:[],underusedAgentPlugins:Array.isArray(t.underusedAgentPlugins)?t.underusedAgentPlugins:[],estimatedPromptBloat:t.estimatedPromptBloat&&typeof t.estimatedPromptBloat=="object"?t.estimatedPromptBloat:{totalTokens:0,byServer:{}},recommendations:Array.isArray(t.recommendations)?t.recommendations:[]}}function Ja(e,t){Object.prototype.hasOwnProperty.call(t??{},"correctionReport")&&(e.correctionReport=Ka(t.correctionReport)),e.repeatedTasks=Va(t.repeatedTasks),e.autoCompactionsLast7Days=Dn(t?.autoCompactionsLast7Days)}function Xa(e,t){Array.isArray(t.todaySessions)&&(e.todaySessions=t.todaySessions.filter(n=>n&&typeof n=="object"&&typeof n.interactions=="number"));let o=Co(t.recentSessions);o&&(e.recentSessions=o)}function Za(e){if(!e||typeof e!="object")return ve("sanitize-invalid-root","sanitizeStats.invalidRoot"),null;try{let t={today:qt(e.today),last30Days:qt(e.last30Days),month:qt(e.month),lastMonth:qt(e.lastMonth),lastUpdated:typeof e.lastUpdated=="string"?e.lastUpdated:"",backendConfigured:!!e.backendConfigured,locale:typeof e.locale=="string"?e.locale:void 0,currentWorkspacePaths:Array.isArray(e.currentWorkspacePaths)?e.currentWorkspacePaths.filter(r=>typeof r=="string"):void 0,suppressedUnknownTools:Array.isArray(e.suppressedUnknownTools)?e.suppressedUnknownTools.filter(r=>typeof r=="string"):void 0},o=jn(e.customizationMatrix);o&&(t.customizationMatrix=o),Array.isArray(e.missedPotential)&&(t.missedPotential=e.missedPotential.filter(r=>r&&typeof r=="object"&&typeof r.workspacePath=="string")),Xa(t,e),Array.isArray(e.insights)&&(t.insights=$s(e.insights)),Ja(t,e);let n=Ya(e.curationAnalysis);return n?(t.curationAnalysis=n,te("sanitizeStats.curation.present",{availableTools:n.availableTools.length,unusedTools:n.unusedTools.length,unusedServers:n.underusedMcpServers.filter(r=>r&&r.usedToolCount===0).length})):ve("sanitize-no-curation","sanitizeStats.curation.missing"),Wn(t,e),t}catch(t){return ve("sanitize-error","sanitizeStats.error",{error:t instanceof Error?t.message:String(t)}),null}}function K(){let e=document.getElementById("worktree-controls");e&&x(e,Ns())}function z(){let e=document.getElementById("worktree-results");e&&x(e,Hs())}function He(){let e=document.getElementById("worktree-progress-area");e&&x(e,Os())}function Es(){Jo||(Jo=!0,requestAnimationFrame(()=>{Jo=!1,z()}))}function Ms(){let e=document.getElementById("worktree-root-input"),t=e?.value.trim();t&&(I.some(o=>o.toLowerCase()===t.toLowerCase())||I.push(t),e&&(e.value=""),K())}function Qa(){I.length===0||M||q||(M=!0,L=[],at=null,bt=null,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},le=[],K(),z(),f.postMessage({command:"scanWorktrees",rootPaths:I}))}function os(e){if(q||ce||M)return;let t=Fs(e);t.length!==0&&(ce=!0,z(),f.postMessage({command:"cleanupPushedWorktrees",worktrees:t.map(o=>({path:o.path,branch:o.branch,repoLabel:o.repoLabel})),repoLabel:e}))}function el(e){if(e.id==="btn-browse-worktree-root")return f.postMessage({command:"pickWorktreeRoot"}),!0;if(e.id==="btn-add-worktree-root")return Ms(),!0;if(e.id==="btn-scan-worktrees")return Qa(),!0;if(e.id==="btn-cancel-worktree-scan")return f.postMessage({command:"cancelWorktreeScan"}),!0;if(e.id==="btn-cleanup-pushed-worktrees")return os(),!0;if(e.id==="btn-cancel-cleanup")return f.postMessage({command:"cancelCleanupPushedWorktrees"}),!0;let t=e.closest(".worktree-repo-cleanup-btn");if(t){let o=decodeURIComponent(t.getAttribute("data-repo")||"");return o&&os(o),!0}return!1}function tl(e){if(e.closest("#btn-toggle-worktree-roots"))return lt=!lt,K(),!0;if(e.classList.contains("worktree-remove-root")){let t=Number(e.getAttribute("data-index"));return isNaN(t)||(I.splice(t,1),K()),!0}return!1}function ol(e,t){let o=t.closest(".worktree-open-editor-btn");if(o){e.preventDefault();let s=decodeURIComponent(o.getAttribute("data-path")||"");return s&&f.postMessage({command:"openWorktreeInEditor",path:s}),!0}let n=t.closest(".worktree-reveal-link, .worktree-reveal-btn");if(n){e.preventDefault();let s=decodeURIComponent(n.getAttribute("data-path")||"");return s&&f.postMessage({command:"revealPath",path:s}),!0}let r=t.closest(".worktree-delete-link, .worktree-delete-btn");if(r){e.preventDefault();let s=decodeURIComponent(r.getAttribute("data-path")||""),i=decodeURIComponent(r.getAttribute("data-branch")||""),a=decodeURIComponent(r.getAttribute("data-repo")||""),l=r.getAttribute("data-pushed")||"?";return s&&f.postMessage({command:"deleteWorktree",path:s,branch:i,repoLabel:a,pushed:l}),!0}return!1}function nl(e){let t=e.closest("[data-wt-sort]");if(!t)return!1;let o=t.getAttribute("data-wt-sort");return o&&(yt===o?ct=ct==="desc"?"asc":"desc":(yt=o,ct=o==="repo"?"asc":"desc"),z()),!0}function rl(e){let t=e.closest(".worktree-repo-row");if(!t)return!1;let o=t.getAttribute("data-repo")??"";return Jt.has(o)?Jt.delete(o):Jt.add(o),z(),!0}function sl(e){return nl(e)?!0:rl(e)}function il(e){let t=e.target;t&&(el(t)||tl(t)||ol(e,t)||sl(t))}function al(){let e=document.getElementById("tab-panel-worktrees");e&&(e.addEventListener("click",il),e.addEventListener("keydown",t=>{t.target?.id==="worktree-root-input"&&t.key==="Enter"&&(t.preventDefault(),Ms())}))}function mn(e){let t=e??{},o=String(t.pushed??"?"),n=o==="yes"||o==="no"?o:"?";return{path:String(t.path??""),repoLabel:String(t.repoLabel??"Unknown"),branch:String(t.branch??"?"),lastCommit:String(t.lastCommit??"?"),lastCommitDate:t.lastCommitDate?String(t.lastCommitDate):null,pushed:n,files:A(t.files),folders:A(t.folders),bytes:A(t.bytes)}}function ll(e){if(!e.folderPath)return;let t=String(e.folderPath);I.some(o=>o.toLowerCase()===t.toLowerCase())||I.push(t),K()}function cl(e){if(M||!Array.isArray(e.roots))return;let t=!1;for(let o of e.roots){if(typeof o!="string")continue;let n=o.trim();n&&(I.some(r=>r.toLowerCase()===n.toLowerCase())||(I.push(n),t=!0))}t&&K()}function dl(){M=!0,L=[],bt=null,D={root:"",checked:0,total:0,foundCount:0,elapsedMs:0},K(),z()}function ul(e){D={...D,root:String(e.root||""),checked:0,total:0,phase:"walking",dirsScanned:0},He()}function pl(e){D={...D,root:String(e.root??D.root),phase:"walking",dirsScanned:A(e.dirsScanned),elapsedMs:A(e.elapsedMs)},He()}function gl(e){D={...D,total:A(e.count),phase:"checking"},He()}function fl(e){bt=`Skipped "${e.root}": ${e.reason||"not accessible"}`,K()}function ml(e){D={root:String(e.root??D.root),checked:A(e.checked),total:e.total!==void 0?A(e.total):D.total,foundCount:A(e.foundCount),elapsedMs:A(e.elapsedMs)},He()}function bl(e){e.worktree&&(L.push(mn(e.worktree)),Es())}function yl(e){let t=String(e.path??"");if(!t)return;let o=L.findIndex(n=>n.path===t);o!==-1&&(L.splice(o,1),z())}function hl(){ce=!1,z()}function vl(e){ce=!1,q=!0,dn={processed:0,total:A(e.total)},le=[],z()}function xl(e){dn={processed:A(e.processed),total:A(e.total)};let t=e.status,o=t==="deleted"||t==="skipped"?t:"error";le.push({path:String(e.path??""),branch:String(e.branch??"?"),repoLabel:String(e.repoLabel??""),status:o,reason:typeof e.reason=="string"?e.reason:void 0,diagnostics:kl(e.diagnostics)}),z()}function kl(e){if(!e||typeof e!="object")return;let t=e,o=r=>typeof r=="string"&&r?r:void 0,n=r=>typeof r=="number"&&Number.isFinite(r)?r:void 0;return{lastModified:o(t.lastModified),lastCommitDate:o(t.lastCommitDate),lastCommitRelative:o(t.lastCommitRelative),remoteBranch:o(t.remoteBranch),remoteStatus:t.remoteStatus==="tracked"||t.remoteStatus==="gone"||t.remoteStatus==="none"?t.remoteStatus:void 0,ahead:n(t.ahead),behind:n(t.behind),modifiedFiles:n(t.modifiedFiles),untrackedFiles:n(t.untrackedFiles)}}function Cl(){q=!1,z()}function wl(){q=!1,ce=!1,z()}function Tl(e){D={...D,phase:"enriching",enriched:0,enrichTotal:A(e.total),elapsedMs:A(e.elapsedMs)},He()}function Sl(e){D={...D,phase:"enriching",enriched:A(e.enriched),enrichTotal:A(e.total),elapsedMs:A(e.elapsedMs)},He()}function $l(e){let t=String(e.path??"");if(!t)return;let o=L.find(r=>r.path===t);if(!o)return;o.files=A(e.files),o.folders=A(e.folders),o.bytes=A(e.bytes);let n=String(e.pushed??"?");o.pushed=n==="yes"||n==="no"?n:"?",Es()}function Al(){M=!1,K(),z()}function Rl(){M=!1,K()}function El(e){if(M||q)return;L=(Array.isArray(e.worktrees)?e.worktrees:[]).map(mn),at={scannedAt:String(e.scannedAt??""),totalBytes:A(e.totalBytes)},K(),z()}var Ml={worktreeRootPicked:ll,worktreeRootsDiscovered:cl,worktreeScanStarted:()=>dl(),worktreeScanRootStarted:ul,worktreeScanWalkProgress:pl,worktreeScanRootMarkersFound:gl,worktreeScanRootSkipped:fl,worktreeScanProgress:ml,worktreeFound:bl,worktreeEnrichStarted:Tl,worktreeEnrichProgress:Sl,worktreeEnriched:$l,worktreeDeleted:yl,worktreeScanComplete:()=>Al(),worktreeScanCancelled:()=>Rl(),worktreeBackgroundResults:El,cleanupDeclined:()=>hl(),cleanupStarted:vl,cleanupWorktreeResult:xl,cleanupComplete:()=>Cl(),cleanupCancelled:()=>wl()};function _l(e){let t=Ml[e.command];t&&t(e)}function ns(e){f.postMessage({command:"viewTabOpened",view:"usage",tab:e})}function Pl(){let e=document.querySelectorAll(".tab-button");ns(S),e.forEach(t=>{t.addEventListener("click",()=>{let o=t.getAttribute("data-tab");if(!o)return;S=o,ns(o),e.forEach(r=>r.classList.toggle("active",r.getAttribute("data-tab")===o)),document.querySelectorAll(".tab-panel").forEach(r=>{r.style.display="none"});let n=document.getElementById(`tab-panel-${o}`);n&&(n.style.display="block"),o==="repos"&&!Qt&&(Qt=!0,f.postMessage({command:"loadRepoPrStats"})),o==="agent"&&!eo&&(eo=!0,f.postMessage({command:"loadAgentSessions"})),o==="insights"&&cn.filter(r=>r.status==="new").forEach(r=>f.postMessage({command:"insightAction",id:r.id,action:"seen"}))})})}function Dl(e){let t=e&&typeof e=="object"?e:{},o=Array.isArray(t.repos)?t.repos:[];return{authenticated:!!t.authenticated,since:typeof t.since=="string"||typeof t.since=="number"?t.since:Date.now(),error:typeof t.error=="string"?c(t.error):void 0,fetchedAt:typeof t.fetchedAt=="string"?t.fetchedAt:"",refreshIntervalMs:_(t.refreshIntervalMs),repos:o.map(n=>{let r=n&&typeof n=="object"?n:{},s=Array.isArray(r.aiDetails)?r.aiDetails:[];return{repoUrl:_t(r.repoUrl),owner:c(typeof r.owner=="string"?r.owner:""),repo:c(typeof r.repo=="string"?r.repo:""),error:typeof r.error=="string"?c(r.error):"",totalPrs:_(r.totalPrs),aiAuthoredPrs:_(r.aiAuthoredPrs),aiReviewRequestedPrs:_(r.aiReviewRequestedPrs),userAuthoredPrs:_(r.userAuthoredPrs),userMergedPrs:_(r.userMergedPrs),aiDetails:s.map(i=>{let a=i&&typeof i=="object"?i:{},l=["copilot","claude","openai","other-ai"],u=["author","reviewer-requested"],d=l.includes(a.aiType)?a.aiType:"other-ai",p=u.includes(a.role)?a.role:"author";return{number:_(a.number),title:c(typeof a.title=="string"?a.title:""),url:_t(a.url),aiType:d,role:p}})}})}}var Ll={copilot:"\u{1F916} Copilot",claude:"\u{1F9E0} Claude",openai:"\u2728 Codex","other-ai":"\u{1F916} AI"};function Il(e,t,o){let n=`<a href="${c(e.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${c(e.owner)}/${c(e.repo)}</a>`;if(e.error)return`<tr>
			<td style="${t} font-family:'Courier New',monospace; font-size:12px;">${n}</td>
			<td colspan="4" style="${t} color:var(--text-secondary); font-style:italic; font-size:12px;">${c(e.error)}</td>
		</tr>`;let r="";if(e.aiDetails.length>0){let i=e.aiDetails.map(a=>`<li><a href="${c(a.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${a.number} ${c(a.title)}</a> \u2014 ${Ll[a.aiType]??c(String(a.aiType))} (${a.role==="author"?"authored":"review requested"})</li>`).join("");r=`
			<details style="margin-top:4px; font-size:11px;">
				<summary style="cursor:pointer; color:var(--text-secondary);">Show ${e.aiDetails.length} detail(s)</summary>
				<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${i}</ul>
			</details>`}let s=(e.userAuthoredPrs??0)>0?`<span style="font-weight:600;">${e.userMergedPrs??0} / ${e.userAuthoredPrs}</span>`:"0";return`<tr>
		<td style="${t} font-family:'Courier New',monospace; font-size:12px;">${n}${r}</td>
		<td style="${o} font-weight:600;">${e.totalPrs}</td>
		<td style="${o}">${s}</td>
		<td style="${o}">${e.aiAuthoredPrs>0?`<span style="font-weight:600;">${e.aiAuthoredPrs}</span>`:"0"}</td>
		<td style="${o}">${e.aiReviewRequestedPrs>0?`<span style="font-weight:600;">${e.aiReviewRequestedPrs}</span>`:"0"}</td>
	</tr>`}function rs(e){let t="margin-bottom:12px; padding:8px 10px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:11px; color:var(--text-secondary);";if(!e.fetchedAt)return`<div style="${t}">\u{1F552} <strong>Not fetched yet.</strong> The snapshot is refreshed hourly by the main VS Code window \u2014 it will appear here once that first refresh completes.</div>`;let o=Date.parse(e.fetchedAt),n=Number.isFinite(o)&&e.refreshIntervalMs?new Date(o+e.refreshIntervalMs).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"unknown";return`<div style="${t}">
    \u{1F552} Updated <strong>${c(ko(e.fetchedAt))}</strong> \xB7 next refresh after ${c(n)}.
    Cached and refreshed at most once an hour, by a single VS Code window, to keep GitHub API usage low.
  </div>`}function Ul(e){let t=c(new Date(e.since).toLocaleDateString());if(e.error)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u26A0\uFE0F Failed to load repository PR activity</strong><br/>
				${e.error}<br/>
				Switch to another tab and back to retry \u2014 details are in the extension Output channel.
			</div>`;if(!e.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;if(e.repos.length===0)return`${rs(e)}
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,r=e.repos.map(s=>Il(s,o,n)).join("");return`
		${rs(e)}
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
					${r}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2020 Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			\u{1F916} Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`}function _s(e){let t=document.querySelector("#repos-pr-content");return t?(x(t,`
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${Ul(e)}
	`),!0):!1}function zl(e){let t="font-family:'Courier New',monospace; font-size:12px;";if(e.unassigned)return`<span style="${t} color:var(--text-secondary);" title="Tasks the agents API reported without a repository \u2014 typically ad-hoc sessions started from cloud chat">no repository (cloud chat)</span>`;let o=`<a href="${e.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); ${t}">${e.owner}/${e.repo}</a>`,n=e.discovery==="account"?' <span title="Found through your account-wide agent tasks \u2014 this repo is not open in any workspace folder" style="color:var(--text-muted); font-size:10px;">(not in workspace)</span>':"";return`${o}${n}`}function Bl(e,t,o){return e.repos.map(n=>{let r=zl(n);if(n.error)return`<tr>
        <td style="${t}">${r}</td>
        <td colspan="3" style="${t} color:var(--text-secondary); font-style:italic; font-size:12px;">${n.error}</td>
      </tr>`;let s=n.partial?` <span title="Showing ${n.tasksScanned} of ${n.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${n.tasksScanned}/${n.tasksTotal} tasks scanned)</span>`:"",i=n.totalCredits>0?n.totalCredits.toFixed(1):n.totalPremiumRequests>0?`${n.totalPremiumRequests.toFixed(1)} PR`:"\u2014";return`<tr>
      <td style="${t}">${r}${s}</td>
      <td style="${o} font-weight:600;">${n.totalTasks}</td>
      <td style="${o} font-weight:600;">${n.totalSessions}</td>
      <td style="${o}">${i}</td>
    </tr>`}).join("")}function ss(e){let t="margin-bottom:12px; padding:8px 10px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:11px; color:var(--text-secondary);";if(!e.fetchedAt)return`<div style="${t}">\u{1F552} <strong>Not fetched yet.</strong> The snapshot is refreshed hourly by the main VS Code window \u2014 it will appear here once that first refresh completes.</div>`;let o=Date.parse(e.fetchedAt),n=Number.isFinite(o)?new Date(o+e.refreshIntervalMs).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"unknown";return`<div style="${t}">
    \u{1F552} Updated <strong>${c(ko(e.fetchedAt))}</strong> \xB7 next refresh after ${c(n)}.
    Cached and refreshed at most once an hour, by a single VS Code window, to keep GitHub API usage low.
  </div>`}function Ol(e){if(!e.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;if(e.repos.length===0)return`${ss(e)}
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No cloud agent tasks found \u2014 neither in your workspace repositories nor anywhere else in your account.
			</div>`;let t=new Date(e.since).toLocaleDateString(),o="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",n=`${o} text-align: center;`,r=e.repos.reduce((l,u)=>(u.error||(l.tasks+=u.totalTasks,l.sessions+=u.totalSessions,l.credits+=u.totalCredits,l.premiumRequests+=u.totalPremiumRequests),l),{tasks:0,sessions:0,credits:0,premiumRequests:0}),s=e.repos.some(l=>l.partial&&!l.error),i=Bl(e,o,n),a="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;";return`
		${ss(e)}
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.credits>0?r.credits.toFixed(1):"\u2014"}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
			${r.premiumRequests>0?`
			<div style="${a}">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${r.premiumRequests.toFixed(1)}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;" title="Sessions that ran before the June 2026 switch to AI credits are billed in premium requests">Premium Requests</div>
			</div>`:""}
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${t} to now.
			${s?"<strong>Note:</strong> Some repos were capped \u2014 totals are lower bounds. ":""}
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
		</div>`}function Ps(e){let t=document.querySelector("#agent-sessions-content");return t?(x(t,`
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${Ol(e)}
	`),!0):!1}function Nl(e){if(!e||!e.workspaces||e.workspaces.length===0)return`
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;let t=e.workspaces.map(o=>{let n=o.typeStatuses??{},r=Object.values(n).every(i=>i==="\u274C"),s=(e.customizationTypes??[]).map(i=>{let a=n[i.id]||"\u2753";return`
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${j(a,a==="\u2705"?"Present and fresh":a==="\u26A0\uFE0F"?"Present but stale":a==="\u274C"?"Missing":"Status unknown")}
				</td>`}).join("");return`
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${c(o.workspaceName)}${r?` <span style="font-family: sans-serif; vertical-align: middle;">${j("\u26A0\uFE0F","No customization files")}</span>`:""}
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
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${c(o.label)}">
									${c(o.icon)}
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
						<span>${c(o.icon)} ${c(o.label)}</span>
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
		</div>`}function Fl(e){let t=e.last30Days.modelSwitching,o=e.today.modelSwitching;if((t.totalRequests??0)===0&&(o.totalRequests??0)===0)return"";function n(r){let s=r.totalRequests??0;if(s===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let a=[{label:"\u{1F49A} Low cost",count:r.lowCostRequests??0,color:"#4ade80"},{label:"\u{1F535} Medium cost",count:r.mediumCostRequests??0,color:"var(--link-color)"},{label:"\u{1F4B8} High cost",count:r.highCostRequests??0,color:"var(--warning-fg)"},{label:"\u2753 Unknown",count:r.unknownRequests??0,color:"var(--text-muted)"}].filter(u=>u.count>0).map(u=>{let d=s>0?Math.round(u.count/s*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${u.color};">${u.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${d}%; background: ${u.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${g(u.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${d}%)</span></span>
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
					${n(t)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${n(e.month.modelSwitching)}
				</div>
			</div>
		</div>`}function Hl(e){return e.last30Days.thinkingEffortUsage||e.today.thinkingEffortUsage||e.month.thinkingEffortUsage?`
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${en(e.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${en(e.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${en(e.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`:""}function en(e){let t=["minimal","low","medium","high","max","xhigh"];if(!e||e.sessionCount===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let o=Object.values(e.byEffort).reduce((r,s)=>r+s,0);return`
		${t.filter(r=>e.byEffort[r]>0).concat(Object.keys(e.byEffort).filter(r=>!t.includes(r)&&e.byEffort[r]>0)).map(r=>{let s=e.byEffort[r]||0,i=o>0?Math.round(s/o*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${c(ya(r))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${i}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${s} <span style="color: var(--text-secondary); font-weight: 400;">(${i}%)</span></span>
			</div>`}).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${e.sessionCount} session${e.sessionCount!==1?"s":""} \xB7 ${e.switchCount} effort switch${e.switchCount!==1?"es":""}</div>
	`}function jl(e){return{allToolKeys:[...new Set([...Object.keys(e.today.toolCalls.byTool),...Object.keys(e.last30Days.toolCalls.byTool),...Object.keys(e.month.toolCalls.byTool)])].sort(),allMcpToolKeys:[...new Set([...Object.keys(e.today.mcpTools.byTool),...Object.keys(e.last30Days.mcpTools.byTool),...Object.keys(e.month.mcpTools.byTool)])].sort(),allMcpServerKeys:[...new Set([...Object.keys(e.today.mcpTools.byServer),...Object.keys(e.last30Days.mcpTools.byServer),...Object.keys(e.month.mcpTools.byServer)])].sort(),allStandardModels:[...new Set([...e.today.modelSwitching.standardModels,...e.last30Days.modelSwitching.standardModels,...e.month.modelSwitching.standardModels])].sort(),allHighCostModels:[...new Set([...e.today.modelSwitching.highCostModels,...e.last30Days.modelSwitching.highCostModels,...e.month.modelSwitching.highCostModels])].sort(),allLowCostModels:[...new Set([...e.today.modelSwitching.lowCostModels,...e.last30Days.modelSwitching.lowCostModels,...e.month.modelSwitching.lowCostModels])].sort(),allMediumCostModels:[...new Set([...e.today.modelSwitching.mediumCostModels,...e.last30Days.modelSwitching.mediumCostModels,...e.month.modelSwitching.mediumCostModels])].sort(),allUnknownModels:[...new Set([...e.today.modelSwitching.unknownModels,...e.last30Days.modelSwitching.unknownModels,...e.month.modelSwitching.unknownModels])].sort()}}function Wl(e,t){return`
		<div id="tab-panel-health" class="tab-panel"${S!=="health"?' style="display:none"':""}>
			${e}
			${Aa(t)}

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
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;" ${ke?'disabled="true" appearance="secondary"':""}>${ke?"Analyzing All...":`Analyze All Repositories (${H.workspaces.length})`}</vscode-button>
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
					<vscode-button id="btn-analyse-repo" ${mt?'disabled="true" appearance="secondary"':""}>${mt?"Analyzing...":"Analyze Repo for Best Practices"}</vscode-button>
					<div id="repo-analysis-results" class="repo-hygiene-results" style="margin-top: 12px;"></div>
				`}
			</div>
		</div>`}function ql(e,t,o){return`
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${ld(e)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.today.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Q(ee(e.today.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.last30Days.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Q(ee(e.last30Days.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${g(e.month.mcpTools.total)}</div>
						${o.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Q(ee(e.month.mcpTools.byServer,o),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Q(ee(e.today.mcpTools.byTool,t),10,Xo)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Q(ee(e.last30Days.mcpTools.byTool,t),10,Xo)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${t.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Q(ee(e.month.mcpTools.byTool,t),10,Xo)}</div></div>
						</div>
					`:""}
				</div>
			</div>
		</div>`}function Kl(e,t,o){let n=e.length-t.length,r=t.length>0?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",s=t.length>0?"rgba(251,191,36,0.4)":"rgba(74,222,128,0.4)",i=t.length>0?"#fbbf24":"#4ade80",a=o.totalTokens,l=o.byServer.skill??0,u=o.byServer.builtin??0,d=a-l-u,p=T=>T>=1e3?`~${Math.round(T/1e3)}K`:`~${T}`,b=d+l,h=[];return d>0&&h.push(`${p(d)} MCP`),l>0&&h.push(`${p(l)} skills`),`<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${g(e.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${g(n)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${r}; border:1px solid ${s}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:${i};">${g(t.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Unused</div>
		</div>
		${b>0?`<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center;" title="Overhead you can reduce by disabling unused MCP servers or removing unused skills">
			<div style="font-size:20px; font-weight:700; color:#f87171;">${p(b)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Actionable overhead</div>
			${h.length>0?`<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${c(h.join(" + "))}</div>`:""}
		</div>`:""}
		${u>0?`<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center; opacity:0.7;" title="Overhead from VS Code built-in tools \u2014 cannot be disabled">
			<div style="font-size:20px; font-weight:700; color:var(--text-secondary);">${p(u)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Built-in overhead</div>
			<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">not actionable</div>
		</div>`:""}
	</div>`}function Gl(e){if(e.extensionId)return"Extension";if(!e.configFiles||e.configFiles.length===0)return"Settings";let t=new Set;for(let o of e.configFiles){let n=o.replace(/\\/g,"/");n.includes("/.vscode/")?t.add("Workspace"):n.includes("/.vs/")?t.add("Workspace (VS)"):n.includes("/.cursor/")?t.add("Workspace (Cursor)"):n.endsWith("/.mcp.json")?t.add(n.split("/").slice(-2).join("/")):t.add("Config file")}return[...t].join(", ")}function Vl(e,t){return e.configFiles&&e.configFiles.length===1?` <button class="curation-file-btn" data-command="openFile" data-path="${c(e.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(e.configFiles[0])}">open</button>`:e.configFiles&&e.configFiles.length>1?` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(e.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(t)}">open</button>`:e.extensionId?` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(e.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${c(e.extensionId)}">open</button>`:' <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>'}function Yl(e){return e.extensionId?`<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${c(e.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${c(e.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`:!e.configFiles||e.configFiles.length===0?'<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>':e.configFiles.length===1?`<button class="curation-file-btn" data-command="openFile" data-path="${c(e.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${c(e.configFiles[0])}">Change Tools</button>`:`<button class="curation-file-btn" data-command="openFileFromList" data-paths="${c(JSON.stringify(e.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${e.configFiles.length} config files">Change Tools</button>`}function Jl(e,t){let o=t.byServer[e.server]??0,n=Gl(e),r=e.configFiles?.join(`
`)??e.extensionId??"",s=Vl(e,r),i=Yl(e),a=e.availableToolCount===0;return`<tr class="${e.usedToolCount>0?"mcp-has-usage":""}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(e.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${c(r)}">${c(n)}${s}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?'<em style="color:var(--text-secondary)">not connected</em>':e.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${a?"\u2014":e.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${o>0?`~${o.toLocaleString()} tokens`:"\u2014"}</td>
		<td style="padding:5px 8px; font-size:12px;">${i}</td>
	</tr>`}function Xl(e){let t=[...new Set(e.filter(r=>!r.extensionId).flatMap(r=>r.configFiles??[]))],o=t.find(r=>r.replace(/\\/g,"/").endsWith(".vscode/mcp.json"))??t[0];if(!o)return"<code>.vscode/mcp.json</code>";let n=o.replace(/\\/g,"/").split("/").slice(-3).join("/");return`<button class="curation-file-btn" data-command="openFile" data-path="${c(o)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${c(o)}">${c(n)}</button>`}function Zl(e,t,o){let n=[...e].sort((l,u)=>{let d=l.usedToolCount===0?0:l.usedToolCount<l.availableToolCount?1:2,p=u.usedToolCount===0?0:u.usedToolCount<u.availableToolCount?1:2;return d!==p?d-p:l.usedToolCount-u.usedToolCount});if(n.length===0)return"";let r=n.map(l=>Jl(l,t)).join(""),s=Xl(n),i=n.filter(l=>l.usedToolCount>0).length,a=n.length-i;return`<details style="margin-top:12px;" open>
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
	</details>`}function Ql(e){if(e.length===0)return"";let t=e.map(o=>{let n=o.configFiles?.[0],r=n?`<button class="curation-file-btn" data-command="openFile" data-path="${c(n)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${c(n)}">View skill</button>`:"\u2014",s="\u2014",i="";o.pluginName?(s=`Plugin: ${o.pluginName}`,i=` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(o.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`):o.skillPath&&(o.skillPath.startsWith(".github/skills")?s="Workspace (.github)":o.skillPath.startsWith(".claude/skills")?s="Workspace (.claude)":o.skillPath.startsWith(".agents/skills")?s="Workspace (.agents)":s="User (~)");let a=Math.round((o.name.length+o.description.length+10)/4);return`<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(o.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s)}${i}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(o.description)}">${c(o.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${a.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${r}</td>
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
	</details>`}function ec(e,t){if(e.length===0)return"";let o=e.map(s=>{let i=`<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${c(s.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${c(s.pluginName)}">Manage Plugin</button>`;return`<tr class="${s.usedSkillCount===0?"":"plugin-has-usage"}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${s.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${s.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${i}</td>
		</tr>`}).join(""),n=e.filter(s=>s.usedSkillCount===0).length,r=e.length-n;return`<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F9E9} Agent Plugins in Last ${t} Days (${e.length})
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
	</details>`}function tc(e,t){if(e.length===0)return"";let o=t.byServer.builtin??0,n=e.map(s=>{let i=Math.round((s.name.length+(s.description?.length??0)+10)/4);return`<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${c(s.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c(s.description??"")}">${c(s.description??"\u2014")}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${i} tokens</td>
		</tr>`}).join(""),r=s=>s>=1e3?`~${Math.round(s/1e3)}K`:`~${s}`;return`<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			\u{1F527} Built-in VS Code Tools (${e.length}) \u2014 ${r(o)} tokens overhead, not actionable
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
	</details>`}function oc(e){try{if(!e||e.availableTools.length===0)return ve("render-hidden-empty","buildCurationSectionHtml.hidden",{hasCurationObject:!!e,availableTools:e?.availableTools?.length??0}),"";let{availableTools:t,unusedTools:o,underusedMcpServers:n,underusedAgentPlugins:r,estimatedPromptBloat:s,windowDays:i}=e,a=o.filter(u=>u.source==="skill"),l=t.filter(u=>u.source==="builtin");return te("buildCurationSectionHtml.render",{availableTools:t.length,unusedTools:o.length,unusedSkills:a.length,mcpServers:n.length}),`
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${i} days)</div>
				${Kl(t,o,s)}
				${Zl(n,s,i)}
				${ec(r,i)}
				${tc(l,s)}
				${Ql(a)}
			</div>`}catch(t){return te("buildCurationSectionHtml.error",{error:t instanceof Error?t.message:String(t)}),`
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>\u2702\uFE0F</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`}}function nc(){return`
		<div id="tab-panel-repos" class="tab-panel"${S!=="repos"?' style="display:none"':""}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories \u2014 authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">${Qt?"Fetching repository PRs\u2026":"Loading\u2026 (sign in with GitHub to see data)"}</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${S!=="agent"?' style="display:none"':""}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">${eo?"Loading cloud agent snapshot\u2026":"Loading\u2026 (sign in with GitHub to see data)"}</div>
			</div>
		</div>`}function rc(e,t,o){let n=e.actionLabel?`<button class="insight-action-btn" data-insight-id="${c(e.id)}" data-action="execute" data-command="${c(e.actionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${o}; border-radius:5px;
				background:${t}; color:var(--text-primary);">${c(e.actionLabel)}</button>`:"",r=e.secondaryActionLabel?`<button class="insight-action-btn" data-insight-id="${c(e.id)}" data-action="execute" data-command="${c(e.secondaryActionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer; margin-left:8px;
				border:1px solid ${o}; border-radius:5px;
				background:transparent; color:var(--text-primary);">${c(e.secondaryActionLabel)}</button>`:"";return n||r?`<div style="margin-top:12px;">${n}${r}</div>`:""}function so(e){let t={tip:"rgba(96,165,250,0.12)",opportunity:"rgba(251,191,36,0.12)",celebration:"rgba(74,222,128,0.12)"},o={tip:"rgba(96,165,250,0.5)",opportunity:"rgba(251,191,36,0.5)",celebration:"rgba(74,222,128,0.5)"},n={tip:"rgba(96,165,250,0.85)",opportunity:"rgba(251,191,36,0.85)",celebration:"rgba(74,222,128,0.85)"},r=t[e.severity]??t.tip,s=o[e.severity]??o.tip,i=n[e.severity]??n.tip,a=e.status==="new",l=e.status==="done",u=rc(e,r,s),d=l?'<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>':`<button class="insight-action-btn" data-insight-id="${c(e.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${s}; border-radius:5px;
				background:${i}; color:#0d1117;">\u2713 Done</button>`,p=l?"":`<button class="insight-action-btn" data-insight-id="${c(e.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${s}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>`,b=l?"":`<button class="insight-action-btn" data-insight-id="${c(e.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>`;return`
		<div class="insight-card" data-insight-id="${c(e.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${r}; border:1px solid ${s};
			${a?"box-shadow:0 2px 8px "+r+";":""}
			${l?"opacity:0.45;":""}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${a?`<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${i}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>`:""}
						${c(e.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${c(e.body)}</div>
					${u}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${b}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${s}; padding-top:10px;">
				${d}
				${p}
			</div>
		</div>`}function sc(e){let t=e.filter(i=>i.status!=="dismissed"),o=t.filter(i=>i.status==="new"),n=t.filter(i=>i.status!=="new"&&i.status!=="done"),r=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(so).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,s=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(so).join("")}
		</div>`:"";return`
		<div id="tab-panel-insights" class="tab-panel"${S!=="insights"?' style="display:none"':""}>
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
		</div>`}function ic(e){return!e||e.sessionsWithMoments===0?"":` <span style="background:rgba(251,191,36,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${e.sessionsWithMoments}</span>`}function ac(e){return`<button class="tab-button ${S==="corrections"?"active":""}" data-tab="corrections"><span class="codicon codicon-debug-restart"></span> Corrections${ic(e)}</button>`}function lc(e){let t=e.title||e.file.split(/[\\/]/).pop()||e.file,o=e.lastInteraction?new Date(e.lastInteraction):null,n=o&&!isNaN(o.getTime())?o.toLocaleDateString():"",r=e.repository?` \xB7 ${e.repository}`:"";return`<div style="font-size:11px; color:var(--text-secondary); padding:2px 0; overflow-wrap:anywhere;">${c(t)}${c(n?` \xB7 ${n}`:"")}${c(r)}</div>`}function cc(e){let t=e.sharedKeywords.length>0?`<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">${e.sharedKeywords.map(o=>`<span style="font-size:10px; padding:1px 7px; border-radius:8px; background:var(--bg-tertiary); color:var(--text-secondary);">${c(o)}</span>`).join("")}</div>`:"";return`
		<div style="margin-top:10px; padding:12px 14px; border-radius:8px; background:var(--bg-tertiary); border:1px solid var(--border-color, transparent);">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<span style="flex-shrink:0; font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.5); color:var(--text-primary); white-space:nowrap;">${e.sessionCount}\xD7 repeated</span>
				<div style="flex:1; min-width:0; font-size:12px; color:var(--text-primary); font-style:italic; overflow-wrap:anywhere;">&ldquo;${c(e.representativePrompt)}&rdquo;</div>
			</div>
			${t}
			<details style="margin-top:8px;">
				<summary style="font-size:11px; color:var(--text-secondary); cursor:pointer;">Sessions (${e.sessions.length})</summary>
				<div style="margin-top:4px;">${e.sessions.map(lc).join("")}</div>
			</details>
		</div>`}function dc(e){return!e||e.clusters.length===0?"":`
		<div class="section" id="section-skill-suggestions">
			<div class="section-title"><span>\u{1F9E9}</span><span>Skill Suggestions</span></div>
			<div class="section-subtitle">
				Tasks you keep prompting for across sessions (first prompt per session, ${e.sessionsScanned} sessions scanned).
				A repeated task is a good candidate for a reusable skill, prompt file, or custom agent.
			</div>
			${e.clusters.map(cc).join("")}
		</div>`}var uc={"user-correction":{label:"You corrected the agent",color:"rgba(251,191,36,0.85)"},"tool-error":{label:"Tool failed",color:"rgba(248,113,113,0.85)"},"edit-retry":{label:"Edit retry",color:"rgba(251,146,60,0.85)"},"edit-self-correction":{label:"Edit self-correction",color:"rgba(251,146,60,0.85)"},"agent-self-correction":{label:"Agent caught itself",color:"rgba(96,165,250,0.85)"}};function pc(e,t){let o=uc[e.type]??{label:e.type,color:"rgba(148,163,184,0.85)"},n=e.timestamp?new Date(e.timestamp):null,r=n&&!isNaN(n.getTime())?n.toLocaleString():"",s=e.type==="tool-error"?`tool \`${e.tool??"?"}\`${e.retried?" \u2014 retried shortly after":""}`:e.matchedPattern?`matched ${e.matchedPattern}`:"",i=e.escalated?'<span title="Clustered with an earlier correction a few turns back" style="flex-shrink:0; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; border:1px solid rgba(248,113,113,0.85); color:var(--text-primary); background:rgba(248,113,113,0.12); white-space:nowrap;">\u{1F4C8} escalating</span>':"",a=e.intensity==="strong"?'<span title="Shouting / repeated punctuation / an intensifier like &quot;again&quot;" style="flex-shrink:0; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; border:1px solid rgba(248,113,113,0.85); color:var(--text-primary); background:rgba(248,113,113,0.12); white-space:nowrap;">\u{1F525} intense</span>':"";return`
		<button type="button" class="correction-moment" data-correction-file="${c(t)}" data-correction-turn="${e.turnNumber}" title="Open this turn in the session log viewer" style="display:flex; width:100%; gap:10px; align-items:flex-start; padding:8px 0; border:0; border-bottom:1px solid var(--bg-tertiary); background:none; color:inherit; cursor:pointer; text-align:left;">
			<span style="flex-shrink:0; font-size:10px; font-weight:700; letter-spacing:0.03em; padding:2px 8px; border-radius:10px; border:1px solid ${o.color}; color:var(--text-primary); background:${o.color.replace("0.85","0.12")}; white-space:nowrap;">${c(o.label)}</span>
			${i}${a}
			<div style="flex:1; min-width:0;">
				<div style="font-size:12px; color:var(--text-primary); opacity:0.9; overflow-wrap:anywhere;">${c(e.snippet)}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">
					turn ${e.turnNumber}${s?` \xB7 ${c(s)}`:""}${r?` \xB7 ${c(r)}`:""}
				</div>
			</div>
		</button>`}function gc(e,t){let o=e.title||e.file.split(/[\\/]/).pop()||e.file,n=e.lastInteraction?new Date(e.lastInteraction):null,r=n&&!isNaN(n.getTime())?n.toLocaleDateString():"",s=e.totalMoments??e.moments.length,i=s>e.moments.length?` \xB7 showing ${e.moments.length} of ${s} moments`:"";return`
		<div style="margin:10px 0 4px; padding:10px 12px; background:var(--bg-tertiary); border-radius:6px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-primary); overflow-wrap:anywhere;">
				${c(o)}${r||i?` <span style="font-weight:400; color:var(--text-secondary);">${r?`\xB7 ${c(r)}`:""}${c(i)}</span>`:""}
			</div>
			${t.map(a=>pc(a,e.file)).join("")}
		</div>`}function fc(e){let t=c(e);return`
		<div style="display:flex; gap:6px;">
			<button type="button" class="correction-ask-copilot" data-correction-repo="${t}"
				title="Send these correction examples to Copilot Chat and ask how to improve this workspace's setup"
				style="font-size:11px; padding:3px 10px; border-radius:5px; border:1px solid var(--vscode-focusBorder); background:var(--vscode-button-secondaryBackground); color:var(--text-primary); cursor:pointer;">\u{1F916} Ask Copilot to fix this</button>
			<button type="button" class="correction-copy-prompt" data-correction-repo="${t}"
				title="Copy the same prompt to paste into another workspace's Copilot Chat"
				style="font-size:11px; padding:3px 10px; border-radius:5px; border:1px solid transparent; background:var(--bg-tertiary); color:var(--text-primary); cursor:pointer;">\u{1F4CB} Copy prompt</button>
		</div>`}var Ds={"user-correction":"User corrections","tool-error":"Tool errors","edit-retry":"Edit retries","edit-self-correction":"Edit self-corrections","agent-self-correction":"Agent self-corrections",escalated:"Escalating corrections"};function Ls(e,t){return t?t==="escalated"?e.escalated===!0:e.type===t:!0}function Is(){return'<button type="button" class="correction-clear-filter" title="Show every correction moment again" style="font-size:11px; padding:2px 10px; border-radius:10px; border:1px solid var(--border-color, transparent); background:var(--bg-tertiary); color:var(--text-primary); cursor:pointer;">\u2715 Clear filter</button>'}function Me(e,t,o,n){if(e<=0)return"";let r=F===o,s=r?"var(--vscode-focusBorder)":n??"transparent",i=r?"var(--vscode-button-secondaryBackground, var(--bg-tertiary))":n?n.replace("0.85","0.12"):"var(--bg-tertiary)",a=r?`Showing only ${t} \u2014 select again to clear`:`Show only ${t}`;return`<button type="button" data-correction-filter="${o}" aria-pressed="${r}" title="${c(a)}" style="font-size:11px; font-weight:${r?"700":"400"}; padding:2px 10px; border-radius:10px; border:1px solid ${s}; background:${i}; color:var(--text-primary); cursor:pointer; box-shadow:${r?"0 0 0 1px var(--vscode-focusBorder)":"none"};">${e} ${c(t)}${r?" \u2715":""}</button>`}function mc(e){return[Me(e.userCorrections,"user corrections","user-correction"),Me(e.toolErrors,"tool errors","tool-error"),Me(e.editRetries,"edit retries","edit-retry"),Me(e.editSelfCorrections,"edit self-corrections","edit-self-correction"),Me(e.agentSelfCorrections,"agent self-corrections","agent-self-correction"),Me(e.escalatedUserCorrections,"\u{1F4C8} escalating","escalated","rgba(248,113,113,0.85)")].filter(Boolean).join(" ")}function bc(e){let t=e.repos.flatMap(r=>r.sessions.flatMap(s=>s.moments)),o=t.filter(r=>Ls(r,F)).length,n=F?`Showing <strong>${o}</strong> of <strong>${t.length}</strong> listed correction moments \u2014 filtered by <strong>${c(Ds[F])}</strong>`:`Showing all <strong>${t.length}</strong> listed correction moments \u2014 no filter active`;return`
		<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:10px; padding:6px 10px; border-radius:6px; background:var(--bg-tertiary); border-left:3px solid ${F?"var(--vscode-focusBorder)":"transparent"}; font-size:11px; color:var(--text-secondary);">
			<span id="corrections-filter-status">${n}</span>
			${F?Is():""}
		</div>`}function yc(e,t){let o=e.sessions.map(s=>({session:s,moments:s.moments.filter(i=>Ls(i,t))})).filter(({moments:s})=>s.length>0);if(o.length===0)return"";let n=o.reduce((s,{moments:i})=>s+i.length,0),r=t?`\u2014 ${o.length} of ${e.sessions.length} session${e.sessions.length!==1?"s":""} match \xB7 ${n} moment${n!==1?"s":""}`:`\u2014 ${o.length} session${o.length!==1?"s":""} with moments \xB7 ${n} moment${n!==1?"s":""}`;return`
	<div style="margin-top:18px;">
		<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
			<div style="font-size:12px; font-weight:700; color:var(--text-primary);">
				${c(e.repository)}
				<span style="font-weight:400; color:var(--text-secondary);">${c(r)}</span>
			</div>
			${fc(e.repository)}
		</div>
		${o.map(({session:s,moments:i})=>gc(s,i)).join("")}
	</div>`}function Us(e){if(typeof e>"u")return`
		<div id="tab-panel-corrections" class="tab-panel"${S!=="corrections"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F501}</span><span>Corrections</span></div>
				<div class="section-subtitle">Moments where the agent corrected itself after an error, or you had to correct the agent.</div>
				<div style="margin-top:16px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
					\u23F3 Scanning recent sessions for correction moments\u2026
				</div>
			</div>
		</div>`;if(!e||e.repos.length===0)return`
		<div id="tab-panel-corrections" class="tab-panel"${S!=="corrections"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F501}</span><span>Corrections</span></div>
				<div class="section-subtitle">Moments where the agent corrected itself after an error, or you had to correct the agent.</div>
				<div style="margin-top:16px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
					\u2728 No correction moments detected in your recent sessions \u2014 nice and smooth!
				</div>
			</div>
		</div>`;let t=mc(e.counts),o=e.repos.map(s=>yc(s,F)).join(""),n=bc(e),r=F&&!o?`<div style="margin-top:16px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
				No <strong>${c(Ds[F].toLowerCase())}</strong> appear in the detail sample below.
				The pill counts cover every detected moment, while each long session only lists a capped sample of its moments \u2014 so a counted moment can sit outside this list.
				<div style="margin-top:10px;">${Is()}</div>
			</div>`:"";return`
		<div id="tab-panel-corrections" class="tab-panel"${S!=="corrections"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F501}</span><span>Corrections</span></div>
				<div class="section-subtitle">
					Moments where the agent corrected itself after an error, or you had to correct the agent \u2014
					heuristic detection over each repository's ${e.sessionsPerRepo} most recent sessions with detected moments \u2014
					sessions without corrections are not listed. Summary counts include all detected moments; long sessions show a capped detail sample.
					Pattern-based matches are candidates, not verdicts; open the session in the log viewer for full context.
				</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:12px;">Filter the list below \u2014 select a pill to drill down, select it again to clear.</div>
				<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">${t}</div>
				${n}
				${o}
				${r}
			</div>
		</div>`}function is(e){let t=uo?.repos.find(o=>o.repository===e);return t?Hn(t):null}function hc(e){let t=e.closest("button.correction-ask-copilot");if(t){let n=t.getAttribute("data-correction-repo"),r=n?is(n):null;return r&&f.postMessage({command:"openCopilotChatWithPrompt",prompt:r}),!0}let o=e.closest("button.correction-copy-prompt");if(o){let n=o.getAttribute("data-correction-repo"),r=n?is(n):null;return r&&navigator.clipboard.writeText(r).then(()=>{let s=o.textContent;o.textContent="\u2705 Copied!",setTimeout(()=>{o.textContent=s},2e3)}),!0}return!1}function zs(){let e=document.getElementById("tab-panel-corrections");e&&e.addEventListener("click",t=>{let o=t.target;if(o.closest("button.correction-clear-filter")){F=null,as();return}let n=o.closest("button[data-correction-filter]");if(n){let a=n.getAttribute("data-correction-filter");if(!a||!Ha.includes(a))return;F=F===a?null:a,as();return}if(hc(o))return;let r=o.closest("button.correction-moment");if(!r)return;let s=r.getAttribute("data-correction-file"),i=Number(r.getAttribute("data-correction-turn"));s&&Number.isSafeInteger(i)&&i>0&&f.postMessage({command:"openSessionFile",file:s,turnNumber:i})})}function as(){let e=document.getElementById("tab-panel-corrections");e&&(x(e,Us(uo)),zs())}function vc(e){let t=document.querySelector('.tab-button[data-tab="insights"]');if(!t)return;let o=e.filter(s=>s.status==="new").length,n=o>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${o}</span>`:"";x(t,'<span class="codicon codicon-lightbulb"></span> Insights'+n)}function xc(e){let t=document.getElementById("insights-container");if(!t)return;cn=e;let o=e.filter(i=>i.status==="new"),n=e.filter(i=>i.status!=="new"&&i.status!=="dismissed"&&i.status!=="done"),r=o.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${o.map(so).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,s=n.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${n.map(so).join("")}
		</div>`:"";x(t,r+s),Bs(),vc(e)}function kc(e){if(e)try{let t=JSON.parse(e);f.postMessage({command:"openFileFromList",paths:t})}catch(t){te("wireCurationButtons.badPathsJson",{error:t instanceof Error?t.message:String(t)})}}function Cc(e){let t=e.getAttribute("data-command");if(t)if(t==="openFile"){let o=e.getAttribute("data-path");o&&f.postMessage({command:"openFile",path:o})}else if(t==="openFileFromList")kc(e.getAttribute("data-paths"));else if(t==="manageExtension"){let o=e.getAttribute("data-extension-id");o&&f.postMessage({command:"manageExtension",extensionId:o})}else if(t==="openAgentPlugins"){let o=e.getAttribute("data-plugin-name")??"";f.postMessage({command:"openAgentPlugins",pluginName:o})}else f.postMessage({command:t})}function wc(){try{let e=document.getElementById("section-tool-curation");if(!e){ve("wire-no-section","wireCurationButtons.noSection");return}let t=e.querySelectorAll(".curation-file-btn");te("wireCurationButtons.bind",{buttons:t.length}),t.forEach(o=>{o.addEventListener("click",()=>{try{Cc(o)}catch(n){te("wireCurationButtons.clickError",{error:n instanceof Error?n.message:String(n)})}})})}catch(e){te("wireCurationButtons.error",{error:e instanceof Error?e.message:String(e)})}}function Bs(){let e=document.getElementById("insights-container");e&&e.querySelectorAll(".insight-action-btn").forEach(t=>{t.addEventListener("click",()=>{let o=t.getAttribute("data-insight-id"),n=t.getAttribute("data-action");if(!(!o||!n))if(n==="execute"){let r=t.getAttribute("data-command");r&&f.postMessage({command:r})}else f.postMessage({command:"insightAction",id:o,action:n})})})}function Tc(e,t,o,n,r,s,i,a,l,u,d,p,b,h){return`
		<style>${In}</style>
		<style>${Un}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${$n("btn-usage",!!e.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!Z}" aria-controls="about-info-body">
					<span>\u{1F4CB} About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${Z?"\u25B8":"\u25BE"}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${Z?' style="display:none"':""}>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${S==="activity"?"active":""}" data-tab="activity"><span class="codicon codicon-pulse"></span> My Activity</button>
				<button class="tab-button ${S==="sessions"?"active":""}" data-tab="sessions"><span class="codicon codicon-history"></span> Recent Sessions</button>
				<button class="tab-button ${S==="tools"?"active":""}" data-tab="tools"><span class="codicon codicon-tools"></span> Tools &amp; Integrations</button>
				<button class="tab-button ${S==="health"?"active":""}" data-tab="health"><span class="codicon codicon-server-environment"></span> Workspace Health</button>
				<button class="tab-button ${S==="repos"?"active":""}" data-tab="repos"><span class="codicon codicon-git-pull-request"></span> Repository PRs</button>
				<button class="tab-button ${S==="agent"?"active":""}" data-tab="agent"><span class="codicon codicon-cloud"></span> Cloud Agent</button>
				<button class="tab-button ${S==="worktrees"?"active":""}" data-tab="worktrees"><span class="codicon codicon-git-branch"></span> Worktrees</button>
				<button class="tab-button ${S==="insights"?"active":""}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(e.insights??[]).filter(T=>T.status==="new").length>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(e.insights??[]).filter(T=>T.status==="new").length}</span>`:""}</button>
				${ac(e.correctionReport)}
			</div>

			${P("Recent Sessions",()=>qc(e))}
			${P("My Activity",()=>Yc(e,o,n,r,s,i))}
			${P("Tools & Integrations",()=>Rd(e,a,l,u,d,p,b,h))}
			${P("Workspace Health",()=>Wl(t,e))}
			${P("Repository PRs & Cloud Agent",()=>nc())}
			${P("Worktrees",()=>jc())}
			${P("Insights",()=>sc(e.insights??[]))}
			${P("Corrections",()=>Us(e.correctionReport))}
			<div class="footer">
				Last updated: ${c(new Date(e.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`}function Sc(){if(I.length===0)return'<div style="color: var(--text-muted); font-size: 12px; margin: 8px 0;">No root folders added yet. Add a folder to scan for worktrees.</div>';let e=I.length>2,t=!e||lt,o=e?`<button class="worktree-roots-toggle" id="btn-toggle-worktree-roots" aria-expanded="${lt}"><span class="worktree-caret">${lt?"\u25BC":"\u25B6"}</span>${I.length} root folders found</button>`:"",n=t?`<div class="worktree-roots-list">${I.map((r,s)=>`<div class="worktree-root-item"><span title="${c(r)}">${c(r)}</span><button class="button secondary worktree-remove-root" data-index="${s}" ${M?"disabled":""}>\u2715</button></div>`).join("")}</div>`:"";return o+n}function $c(e,t){let o=e.enriched??0,n=e.enrichTotal??0,r=n>0?Math.round(o/n*100):0;return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F4E6} Computing sizes &amp; push status\u2026</div>
      <div>${o} / ${n} worktree${n===1?"":"s"} analyzed (${t}s)</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${r}%;"></div></div>
    </div>`}function Ac(e,t){let o=e.phase==="walking",n=o?"\u{1F50D} Scanning folder\u2026":"\u23F3 Checking markers\u2026",r=e.dirsScanned??0,s=o?`Exploring for git worktrees \u2014 ${r} folder${r===1?"":"s"} scanned (${t}s)`:`${e.checked} / ${e.total||"?"} .git markers checked \u2014 ${e.foundCount} worktree${e.foundCount===1?"":"s"} found so far (${t}s)`,i=o?100:e.total>0?Math.round(e.checked/e.total*100):0,a=o?"worktree-progress-fill indeterminate":"worktree-progress-fill";return`
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">${n}</div>
      <div>Folder: <span style="font-family: var(--vscode-editor-font-family, monospace);">${c(e.root||"\u2026")}</span></div>
      <div>${s}</div>
      <div class="worktree-progress-bar"><div class="${a}" style="width: ${i}%;"></div></div>
    </div>`}function Os(){if(!M)return"";let e=D,t=(e.elapsedMs/1e3).toFixed(1);return e.phase==="enriching"?$c(e,t):Ac(e,t)}function Rc(){if(!at||M||L.length===0)return"";let e=c(new Date(at.scannedAt).toLocaleString()),t=Ke(at.totalBytes),o=L.length;return`<div class="info-box" style="margin-top: 12px;"><div>\u{1F333} Found automatically by the daily background scan: ${t} across ${o} worktree${o===1?"":"s"}, last checked ${e}. Scan again for the latest.</div></div>`}function Ns(){return`
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Root Folders</span></div>
      <div id="worktree-roots-list">${Sc()}</div>
      <div class="folder-input-row" style="margin-top: 8px;">
        <input
          type="text"
          id="worktree-root-input"
          class="folder-input"
          placeholder="Paste a root folder path here, e.g. C:\\code\\repos"
          ${M?"disabled":""}
        />
        <button class="button secondary" id="btn-browse-worktree-root" ${M?"disabled":""}>\u{1F4C2} Browse\u2026</button>
        <button class="button secondary" id="btn-add-worktree-root" ${M?"disabled":""}>\u2795 Add</button>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-scan-worktrees" ${M||q||I.length===0?"disabled":""}>\u{1F50D} Scan for Worktrees</button>
        ${M?'<button class="button secondary" id="btn-cancel-worktree-scan">\u2715 Cancel</button>':""}
      </div>
      ${Rc()}
      ${bt?`<div class="info-box" style="margin-top: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);"><div>\u26A0\uFE0F ${c(bt)}</div></div>`:""}
      <div id="worktree-progress-area">${Os()}</div>
    </div>`}function Ec(e){let t=new Map;for(let o of e){let n=o.repoLabel||"Unknown";t.has(n)||t.set(n,[]),t.get(n).push(o)}return t}function Tt(e){return e.bytes<0}function vt(e){return e.bytes>0?e.bytes:0}function Mc(e){let t=Tt(e),o=a=>`<span class="worktree-pending">${M?a:"\u2014"}</span>`,n=e.pushed==="yes"?"\u2705":e.pushed==="no"?"\u{1F534}":"\u2753",r=t?o("checking\u2026"):`${n} ${c(e.pushed)}`,s=t?o("\u2026"):c(String(e.files)),i=t?o("computing\u2026"):`<span title="${e.bytes.toLocaleString()} bytes">${Ke(e.bytes)}</span>`;return`<tr>
    <td title="${c(e.path)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c(e.path)}</td>
    <td>${c(e.branch)}</td>
    <td>${c(e.lastCommit)}</td>
    <td>${r}</td>
    <td>${s}</td>
    <td>${i}</td>
    <td>
      <a href="#" class="worktree-reveal-link" data-path="${encodeURIComponent(e.path)}">Open</a>
      <a href="#" class="worktree-delete-link" data-path="${encodeURIComponent(e.path)}" data-branch="${encodeURIComponent(e.branch)}" data-repo="${encodeURIComponent(e.repoLabel)}" data-pushed="${c(e.pushed)}" title="Remove via git worktree remove (asks for confirmation)">\u{1F5D1}\uFE0F Delete</a>
    </td>
  </tr>`}function _c(e){return`<div class="table-container">
    <table class="session-table">
      <thead><tr><th>Path</th><th>Branch</th><th>Last Commit</th><th>Pushed</th><th>Files</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody>${[...e].sort((n,r)=>vt(r)-vt(n)).map(Mc).join("")}</tbody>
    </table>
  </div>`}function Pc(e){let t=e.reduce((r,s)=>r+vt(s),0),o=e.some(Tt),n=`<span title="${t.toLocaleString()} bytes">${Ke(t)}</span>`;return o?`${n} <span class="worktree-pending">\u2026</span>`:n}function Dc(e,t){let o=t.filter(r=>r.pushed==="yes"&&!Tt(r)).length,n=q||ce||M||o===0;return`<button type="button" class="button secondary worktree-repo-cleanup-btn" data-repo="${encodeURIComponent(e)}"
    title="Remove this repository's pushed worktrees via git worktree remove (asks for confirmation)" ${n?"disabled":""}
    >\u{1F9F9} Clean up (${o})</button>`}function Lc(e,t){let o=Jt.has(e),n=o?"\u25BC":"\u25B6",r=c(e),s=`<tr class="worktree-repo-row${o?" expanded":""}" data-repo="${r}" aria-expanded="${o}">
    <td><span class="worktree-caret">${n}</span> ${c(e)}</td>
    <td>${t.length}</td>
    <td>${Pc(t)}</td>
    <td class="worktree-repo-actions">${Dc(e,t)}</td>
  </tr>`,i=`<tr class="worktree-repo-details" data-repo="${r}"${o?"":' style="display: none;"'}>
    <td colspan="4">${_c(t)}</td>
  </tr>`;return s+i}function tn(e){return yt!==e?"":ct==="desc"?" \u25BC":" \u25B2"}function Ic(e){return e.reduce((t,o)=>t+vt(o),0)}function Uc(e,t){let o=ct==="desc"?-1:1;if(yt==="repo")return o*e[0].localeCompare(t[0]);let n=s=>yt==="count"?s.length:Ic(s),r=n(e[1])-n(t[1]);return r!==0?o*r:e[0].localeCompare(t[0])}function Fs(e){return L.filter(t=>t.pushed==="yes"&&!Tt(t)&&(e===void 0||t.repoLabel===e))}function zc(){let e=Fs().length,t=q||ce||M||e===0,o=ce?"\u23F3 Waiting\u2026":`\u{1F9F9} Clean Up (${e})`;return`<div class="summary-card worktree-cleanup-card">
    <div class="summary-label">Pushed Worktrees</div>
    <div class="worktree-cleanup-card-actions">
      <button class="button secondary" id="btn-cleanup-pushed-worktrees" ${t?"disabled":""}>${o}</button>
      ${q?'<button class="button secondary" id="btn-cancel-cleanup">\u2715</button>':""}
    </div>
  </div>`}function ls(e){if(!e)return"";let t=new Date(e);return isNaN(t.getTime())?"":t.toLocaleString()}function he(e,t,o,n=!1){return`<span class="worktree-cleanup-chip${n?" danger":""}" title="${c(o)}">${e} ${c(t)}</span>`}function Bc(e){let t=[],o=ls(e.lastModified);o&&t.push(he("\u{1F552}",`Last updated: ${o}`,"Newest file modification at the worktree root"));let n=ls(e.lastCommitDate)||"Last commit on the checked-out branch";return(e.lastCommitRelative||e.lastCommitDate)&&t.push(he("\u{1F4DD}",`Last commit: ${e.lastCommitRelative||n}`,n)),t}function Oc(e){let t=[];if(e.remoteStatus==="none"?t.push(he("\u26A0\uFE0F","Remote: none (never pushed)","This branch was never pushed \u2014 it has no upstream tracking branch",!0)):e.remoteStatus==="gone"?t.push(he("\u26A0\uFE0F",`Remote: ${e.remoteBranch??"unknown"} (gone)`,"The upstream branch no longer exists on the remote (deleted or pruned)",!0)):e.remoteStatus==="tracked"&&e.remoteBranch&&t.push(he("\u{1F310}",`Remote: ${e.remoteBranch}`,"Upstream tracking branch")),e.ahead===void 0&&e.behind===void 0)return t;let o=e.ahead??0,n=e.behind??0,r=o===0&&n===0;return t.push(he(r?"\u2705":"\u{1F500}",`Push status: ${r?"up to date":`${o} ahead \xB7 ${n} behind`}`,"Commits on this branch compared with its upstream",o>0)),t}function Nc(e){if(e.modifiedFiles===void 0&&e.untrackedFiles===void 0)return[];let t=e.modifiedFiles??0,o=e.untrackedFiles??0,n=t===0&&o===0;return[he(n?"\u2705":"\u270F\uFE0F",`Changes: ${n?"clean":`${t} modified \xB7 ${o} untracked`}`,"Uncommitted work in this worktree",!n)]}function Fc(e){if(!e)return"";let t=[...Bc(e),...Oc(e),...Nc(e)];return t.length===0?"":`<div class="worktree-cleanup-chips">${t.join("")}</div>`}function Hc(e){let t=encodeURIComponent(e.path);return`<div class="worktree-cleanup-log-actions">
      <button type="button" class="button secondary worktree-open-editor-btn" data-path="${t}" title="Open this worktree folder in a new VS Code window so you can commit, push, or clean it up">\u{1F4BB} Open in VS Code</button>
      <button type="button" class="button secondary worktree-reveal-btn" data-path="${t}" title="Show this folder in the OS file explorer">\u{1F4C2} Reveal folder</button>
      <button type="button" class="button secondary worktree-delete-btn" data-path="${t}" data-branch="${encodeURIComponent(e.branch)}" data-repo="${encodeURIComponent(e.repoLabel)}" data-pushed="?" title="Try removing it again \u2014 you will be asked to confirm, and to force-delete if it still has uncommitted changes">\u{1F5D1}\uFE0F Delete anyway\u2026</button>
    </div>`}function cs(){let e=le.filter(o=>o.status!=="deleted");return e.length===0?"":`<div class="worktree-cleanup-log">${e.map(o=>`<div class="worktree-cleanup-log-row">
      <span>${o.status==="skipped"?"\u23ED\uFE0F":"\u274C"}</span>
      <div class="worktree-cleanup-log-details">
        <div class="worktree-cleanup-log-headline">
          <span class="worktree-cleanup-log-branch">${c(o.branch)}</span>
          <span class="worktree-cleanup-log-repo">${c(o.repoLabel)}</span>
        </div>
        <div class="worktree-cleanup-log-path">${c(o.path)}</div>
        <div class="worktree-cleanup-log-reason">${c(o.reason||"")}</div>
        ${Fc(o.diagnostics)}
        ${Hc(o)}
      </div>
    </div>`).join("")}</div>`}function ds(){if(q){let{processed:n,total:r}=dn,s=r>0?Math.round(n/r*100):0;return`<div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">\u{1F9F9} Cleaning up pushed worktrees\u2026</div>
      <div>${n} / ${r} processed</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${s}%;"></div></div>
    </div>${cs()}`}if(le.length===0)return"";let e=le.filter(n=>n.status==="deleted").length,t=le.filter(n=>n.status==="skipped").length,o=le.filter(n=>n.status==="error").length;return`<div class="info-box" style="margin-top: 12px;">
    <div class="info-box-title">\u{1F9F9} Cleanup finished</div>
    <div>\u2705 ${e} deleted \xB7 \u23ED\uFE0F ${t} skipped (uncommitted/unpushed) \xB7 ${o>0?`\u274C ${o} error${o===1?"":"s"}`:"0 errors"}</div>
  </div>${cs()}`}function Hs(){if(L.length===0)return M?'<div style="padding: 16px; color: var(--text-muted);">Discovering worktrees\u2026</div>':'<div style="padding: 16px; color: var(--text-muted);">No worktrees found yet. Add root folders above and click Scan.</div>'+ds();let e=Ec(L),t=L.reduce((l,u)=>l+vt(u),0),o=L.some(Tt),n=`${Ke(t)}${o?' <span class="worktree-pending">\u2026</span>':""}`,r=`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F333} Worktrees</div><div class="summary-value">${L.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4E6} Repositories</div><div class="summary-value">${e.size}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4BE} Total Size</div><div class="summary-value" title="${t.toLocaleString()} bytes">${n}</div></div>
    ${zc()}
  </div>`,i=[...e.entries()].sort(Uc).map(([l,u])=>Lc(l,u)).join(""),a=`<div class="table-container">
    <table class="session-table worktree-repo-table">
      <thead><tr>
        <th class="sortable" data-wt-sort="repo">Repository${tn("repo")}</th>
        <th class="sortable" data-wt-sort="count">Worktrees${tn("count")}</th>
        <th class="sortable" data-wt-sort="size">Size${tn("size")}</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>${i}</tbody>
    </table>
  </div>`;return r+ds()+a}function jc(){return`
    <div id="tab-panel-worktrees" class="tab-panel"${S!=="worktrees"?' style="display:none"':""}>
      <div class="info-box">
        <div class="info-box-title">\u{1F333} Worktree Discovery</div>
        <div>
          Scans folders for uncleaned git worktrees and reports disk usage grouped by repository (based on each
          worktree's git remote). Add one or more root folders below, then click Scan. Results stream in as they're found.
        </div>
      </div>
      <div id="worktree-controls">${Ns()}</div>
      <div id="worktree-results">${Hs()}</div>
    </div>`}function Wc(e){let t=e.filter(n=>(n.subAgentCalls??0)>0).length;if(t===0)return"";let o=e.reduce((n,r)=>n+(r.subAgentCalls??0),0);return`<div style="margin-top:8px; font-size:12px; color:var(--text-secondary);" title="Sessions that delegated work to sub-agents (task/read_agent/write_agent/list_agents, runSubagent, delegate_*, \u2026)">
		\u{1F916} <strong>${t}</strong> session${t===1?"":"s"} used sub-agents (${g(o)} sub-agent call${o===1?"":"s"}) in this period
	</div>`}function qc(e){Array.isArray(e.todaySessions)&&(sn=e.todaySessions);let t=U==="today"?sn:Ue[U],o=t?an(t):`<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${St[U]}\u2026</div>`,n=t?Wc(t):"";return`
		<div id="tab-panel-sessions" class="tab-panel"${S!=="sessions"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>\u{1F4CB}</span><span>Recent Sessions</span>
					<span id="sessions-lookback-wrapper" style="margin-left:auto;"></span>
					${za()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period \u2014 sorted by number of interactions (most active first).</div>
				${n}
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${o}
				</div>
			</div>
		</div>`}function Kc(e,t){let o=e.usedAiCredits*.01,n=Math.max(0,Math.min(t,o)),r=Math.max(0,o-n),s=e.budgetUsd,i=s>0?Math.min(100,n/s*100):0,a=s>0?Math.min(100-i,r/s*100):0,l=i+a,u=C(100-e.pctAvailable,1),d=C(e.pctAvailable,1),p=l>90?"var(--error-color, #f14c4c)":l>75?"var(--warning-color, #cca700)":"var(--accent-color, #4d9cf8)",b=i>0?`<div style="height:100%; width:${C(i,4)}%; background:${p};"></div>`:"",h=a>0?`<div title="Usage the API reports but this device has no local session data for" style="height:100%; width:${C(a,4)}%; background:${p}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 6px);"></div>`:"",T=a>0?`<div style="display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-secondary); margin-top:6px;">
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${p}; margin-right:4px; vertical-align:middle;"></span>Tracked here (${C(i,1)}%)</span>
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${p}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px); margin-right:4px; vertical-align:middle;"></span>Other devices/cloud (${C(a,1)}%)</span>
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
				<span>${u}% used</span><span>${d}% available</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden; display:flex;">
				${b}${h}
			</div>
			${T}
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 \xB7 Budget = $${C(e.budgetUsd,2)}/month
			</div>
		</div>`}function Gc(e,t,o){if(!e)return`
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				\u2139\uFE0F No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions \u2014 it cannot see web chat, cloud agent, or review agent usage.
			</div>`;if(t<=0)return"";let n=e.usedAiCredits*.01,r=n-t,s=Math.round(r*100),i=s>0?`<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${C(r,2)} (${g(s)} credits)</span></div>`:"",a=o>.001?`<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${C(o,2)}</span></div>`:"",l=s>0?'<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">\u2139\uFE0F The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> \u2014 all counted against your AI Credit budget.</div>':'<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">\u2705 Extension-tracked Copilot usage matches the API \u2014 no significant untracked usage from web chat, cloud agent, or review agent.</div>';return`
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${C(n,2)} (${g(e.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${C(t,2)} (${g(Math.round(t*100))} credits)</span></div>
				${i}${a}
			</div>
			${l}
		</div>`}function Vc(e){let t=e.copilotApiBalance,o=e.monthBillingGroupCosts;if(!t&&(!o||Object.keys(o).length===0))return"";let n=o?.["GitHub Copilot"]??0,s=(o?Object.values(o).reduce((u,d)=>u+d,0):0)-n,i=t?Kc(t,n):"",a=o&&Object.keys(o).length>0?qn(o,t):"",l=Gc(t,n,s);return`
		<div class="section">
			<div class="section-title"><span>\u{1F4B3}</span><span>AI Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs, alongside estimated costs from other AI providers.</div>
			${i}
			${a}
			${l}
		</div>`}function Yc(e,t,o,n,r,s){let i=P("Model Cost",()=>Fl(e)),a=P("AI Billing Coverage",()=>Vc(e)),l=P("Interaction Modes",()=>`
			<div class="section" id="section-interaction-modes">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using AI assistants: Ask (chat), Edit (code edits), Agent (autonomous tasks), Plan, Custom Agent, CLI (terminal), Copilot App (desktop-app CLI sessions), Claude Desktop, or Claude (VS Code)</div>
				<div class="two-column">
					${Zr(e.today.modeUsage,"\u{1F4C5} Today")}
					${Zr(e.last30Days.modeUsage,"\u{1F4CA} Last 30 Days")}
				</div>
			</div>`),u=P("Context References",()=>ad(e,r,s)),d=P("Model Efficiency",()=>Td(e)),p=P("Context Window",()=>rd(e));return`
		<div id="tab-panel-activity" class="tab-panel"${S!=="activity"?' style="display:none"':""}>
			${n}
			${a}
			<!-- Mode Usage Section -->
			${l}
			${u}
			${t}
			${i}
			${d}
			${o}
			${p}
		</div>`}var Jc=G("__MODEL_PRICING__"),Xc=Jc?.pricing??{};function js(e){let t=null;for(let o of e){let n=zn(o,Xc);n&&(!t||n.thresholdTokens<t.thresholdTokens)&&(t={...n,model:o})}return t}function Zc(e){let t=e*4/1048576,o=Math.round(e/10/1e3);return`\u2248${C(t,1)} MB of code (~${g(o)}K lines)`}function Qc(e,t){let o=e/t.thresholdTokens*100,n=Math.min(o,100),r=o>100?"var(--error-color, #f14c4c)":o>=70?"var(--warning-color, #cca700)":"var(--success-color, #89d185)",s=c(Y(t.model)),i=`above it, input billing goes $${t.defaultInputCostPerMillion.toFixed(2)} \u2192 $${t.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;return`
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${g(e)} tokens \u2014 ${C(o,0)}% of the ${g(t.thresholdTokens)}-token default tier for ${s}</span>
				<span>${g(t.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${C(n,0)}%; background:${r}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${Zc(t.thresholdTokens)}; ${i}.</div>
		</div>`}function xt(e,t,o,n){return`
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${n?` title="${n}"`:""}>${e}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${t}</div>
			${o?`<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${o}</div>`:""}
		</div>`}function ed(e){if(e.maxRequestInputTokens<=0)return"";let t=js(e.maxRequestModels),o=c(e.maxRequestModels.map(r=>Y(r)).join(", ")||"\u2014"),n=t?`${C(e.maxRequestInputTokens/t.thresholdTokens*100,0)}% of the ${g(t.thresholdTokens)}-token price line \xB7 ${o}`:`${o} \u2014 no long-context surcharge for ${e.maxRequestModels.length>1?"these models":"this model"}`;return xt("\u{1F4CF} Largest request",`${g(e.maxRequestInputTokens)} input tokens`,n,"The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period")}function td(e){if((e.maxReachedTokens??0)<=0)return"";let t=e.maxReachedWindowLimit,o=t?`${g(e.maxReachedTokens)} of ${g(t)} (${C(e.maxReachedTokens/t*100,0)}%)`:g(e.maxReachedTokens);return xt("\u{1FA9F} Fullest CLI window",o,void 0,"The highest context fill recorded for a Copilot CLI session in this period, versus its window limit")}function od(e){if(!e)return"";let t=e.sessionsConsidered>0?xt("\u{1F5DC}\uFE0F Sessions compacted",`${g(e.sessionsCompacted)} of ${g(e.sessionsConsidered)}`,e.sessionsCompacted>0?`${C(e.sessionsCompacted/e.sessionsConsidered*100,0)}% of sessions with context data lost earlier turns to automatic compaction`:"No session ran out of context window in this period","Sessions where the client automatically compacted or truncated the history at least once, counted per session rather than per compaction event"):"",o=e.sessionsWithFillData>0?xt("\u26A0\uFE0F Sessions near the limit",`${g(e.sessionsNearLimit)} of ${g(e.sessionsWithFillData)}`,e.worstFillPercent?`Fullest session reached ${e.worstFillPercent}% of its window`:void 0,"Copilot CLI sessions that filled at least 80% of their context window without compacting \u2014 the early-warning band before context starts getting dropped"):"";return t+o}function on(e,t){let o=Ln(e),n=od(t);if(!o&&!n)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';if(!o)return n;let r=Object.entries(e.tierCounts),s=r.reduce((a,[,l])=>a+l,0),i=r.length>0?xt("\u{1FA9C} Context tiers",r.map(([a,l])=>`${c(a)} \xD7${l}`).join(", "),`${s} Copilot CLI session${s===1?"":"s"} grouped by chosen window size \u2014 "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,"Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier"):"";return ed(e)+td(e)+i+n}function nd(e){if(!e)return"";let o=[["GitHub Copilot CLI",e.bySource.copilotCli],["Claude",e.bySource.claude]].filter(([,r])=>r>0).map(([r,s])=>`${c(r)} \xD7${g(s)}`);return`
		<div class="automatic-compactions-card"
			title="Automatic compactions remove earlier messages to fit the context window and can affect response quality.">
			<div>
				<div class="automatic-compactions-label">\u21A9 Automatic compactions (last 7 days)</div>
				<div class="automatic-compactions-detail">${o.length>0?o.join(", "):"No automatic compactions detected"}</div>
			</div>
			<div class="automatic-compactions-value">${g(e.total)}</div>
		</div>`}function rd(e){let t=e.last30Days.contextWindow,o=t&&t.maxRequestInputTokens>0?js(t.maxRequestModels):null,n=t&&o?Qc(t.maxRequestInputTokens,o):"";return`
		<div class="section">
			<div class="section-title"><span>\u{1FA9F}</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${on(e.today.contextWindow,e.today.contextPressure)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${on(t,e.last30Days.contextPressure)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${on(e.lastMonth.contextWindow,e.lastMonth.contextPressure)}
				</div>
			</div>
			${nd(e.autoCompactionsLast7Days)}
			${n}
		</div>`}function Kt(e,t=""){let o=e>0?"":" ctx-ref-zero";return`<td class="${`ctx-ref-num${t?" "+t:""}${o}`}">${e}</td>`}function us(e,t,o){let i=[e,t,o],a=Math.max(...i),l=i.map((p,b)=>{let h=2+b*(56/(i.length-1)),T=a===0?18:2+(1-p/a)*16;return`${h.toFixed(1)},${T.toFixed(1)}`}).join(" "),d=a===0?"var(--text-muted)":o>=t&&t>=e?"var(--link-color)":o<=t&&t<=e?"#f87171":"var(--text-secondary)";return`<td class="ctx-ref-spark"><svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><polyline points="${l}" fill="none" stroke="${d}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${i.map((p,b)=>{let h=2+b*(56/(i.length-1)),T=a===0?18:2+(1-p/a)*16;return`<circle cx="${h.toFixed(1)}" cy="${T.toFixed(1)}" r="2" fill="${d}"/>`}).join("")}</svg></td>`}function sd(e,t){return`
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
					${e.slice().sort((n,r)=>r.last30-n.last30).map(n=>`<tr${n.title?` title="${c(n.title)}"`:""}><td class="ctx-ref-name">${n.label}</td>${Kt(n.today,n.today>0?"ctx-ref-today-active":"")}${Kt(n.month)}${Kt(n.lastMonth)}${Kt(n.last30)}${us(n.lastMonth,n.month,n.today)}</tr>`).join("")}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${t.today}</td>
						<td class="ctx-ref-num">${t.month}</td>
						<td class="ctx-ref-num">${t.lastMonth}</td>
						<td class="ctx-ref-num">${t.last30}</td>
						<td class="ctx-ref-spark">${us(t.lastMonth,t.month,t.today).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,"")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function id(e,t,o){let n=d=>d||0,r=[{label:"\u{1F4C4} #file",get:d=>d.file},{label:"\u2702\uFE0F #selection",get:d=>d.selection},{label:"\u2728 Implicit Selection",title:"Text selected in your editor providing passive context to Copilot",get:d=>d.implicitSelection},{label:"\u{1F524} #symbol",get:d=>d.symbol},{label:"\u{1F5C2}\uFE0F #codebase",get:d=>d.codebase},{label:"\u{1F4C1} @workspace",get:d=>d.workspace},{label:"\u{1F4BB} @terminal",get:d=>d.terminal},{label:"\u{1F527} @vscode",get:d=>d.vscode},{label:"\u2328\uFE0F #terminalLastCommand",title:"Last command run in the terminal",get:d=>n(d.terminalLastCommand)},{label:"\u{1F5B1}\uFE0F #terminalSelection",title:"Selected terminal output",get:d=>n(d.terminalSelection)},{label:"\u{1F4CB} #clipboard",title:"Clipboard contents",get:d=>n(d.clipboard)},{label:"\u{1F4DD} #changes",title:"Uncommitted git changes",get:d=>n(d.changes)},{label:"\u{1F4E4} #outputPanel",title:"Output panel contents",get:d=>n(d.outputPanel)},{label:"\u26A0\uFE0F #problemsPanel",title:"Problems panel contents",get:d=>n(d.problemsPanel)},{label:"\u{1F500} #pr",title:"Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary",get:d=>n(d.pullRequest)},{label:"\u{1F4F7} Images",title:"Pasted images and vision context detected in session logs",get:d=>n(d.byKind["copilot.image"])},{label:"\u{1F4CB} Prompt Files",title:".github/prompts/ prompt file uses detected in session logs",get:d=>n(d.byKind.promptFile)},{label:"\u{1F4D0} Code Lines",title:"Total lines of code referenced via #file: range selections",get:d=>n(d.codeContextLines)},{label:"\u{1F3AF} Custom Prompts",title:"Custom /command prompt uses detected in session logs",get:d=>n(d.byKind.prompt)},{label:"\u{1F4CB} Copilot Instructions",title:"copilot-instructions.md file references detected in session logs",get:d=>d.copilotInstructions},{label:"\u{1F916} Agents.md",title:"agents.md file references detected in session logs",get:d=>d.agentsMd}],s=e.last30Days.contextReferences,i=e.month.contextReferences,a=e.lastMonth.contextReferences,l=e.today.contextReferences,u=r.map(d=>({label:d.label,title:d.title,last30:d.get(s),month:d.get(i),lastMonth:d.get(a),today:d.get(l)}));return sd(u,{last30:o,month:je(i),lastMonth:je(a),today:t})}function ad(e,t,o){let n=Object.keys(e.last30Days.contextReferences.byKind).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(e.last30Days.contextReferences.byKind).sort(([,s],[,i])=>i-s).slice(0,5).map(([s,i])=>`<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${c(s)}:</span> ${i}</div>`).join("")}
			</div>
		</div>
	`:"",r=Object.keys(e.last30Days.contextReferences.byPath).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(e.last30Days.contextReferences.byPath).sort(([,s],[,i])=>i-s).slice(0,10).map(([s,i])=>`<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${i}\xD7</span> ${c(s)}</div>`).join("")}
			</div>
		</div>
	`:"";return`
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${id(e,t,o)}
			${n}
			${r}
		</div>`}function ld(e){let t=va(e);if(t.length===0)return"";let o=xa(t);return`
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${t.map(r=>{let s=(e.today.toolCalls.byTool[r]||0)+(e.today.mcpTools.byTool[r]||0),i=(e.last30Days.toolCalls.byTool[r]||0)+(e.last30Days.mcpTools.byTool[r]||0),a=(e.month.toolCalls.byTool[r]||0)+(e.month.mcpTools.byTool[r]||0),l=[];s>0&&l.push(`${s} today`),i>s&&l.push(`${i} in the last 30d`),a>i&&l.push(`${a} this month`);let u=l.length>0?`<span style="color:var(--text-muted);"> (${l.join(" | ")})</span>`:"",d=`<button data-suppress-tool="${c(r)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${c(r)}">\u{1F507}</button>`;return`<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${c(r)}${u}${d}</span>`}).join(" ")}
			</div>
			<a href="${c(o)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`}var cd={today:"today",last30:"last30Days",currentMonth:"month"},ps="last30",Ws="last30Days",io="cost",bn="calls",go="vendor",ao="calls",ft="desc",qs={},yn=!0,Ks=!1;function hn(e){return e===null?"\u2014":e>=.01?vo(e):`$${e.toFixed(3)}`}function kt(e){return e===null?"\u2014":oe(e*100)}function Xt(e){return e===null?"\u2014":C(e,1)}var Ct=[{key:"cost",label:"Cost",axisLabel:"Average cost per turn",value:e=>e.rates.costPerCall,format:hn},{key:"outputTokens",label:"Output tokens",axisLabel:"Average output tokens per turn",value:e=>e.rates.outputTokensPerCall,format:e=>e===null?"\u2014":qe(Math.round(e))},{key:"toolSteps",label:"Tool steps",axisLabel:"Average tool steps per turn",value:e=>e.rates.toolCallsPerCall,format:Xt}],lo=[{key:"calls",label:"Local use",value:e=>e.counters.calls,format:e=>`${g(e??0)} turns`},...Ct.map(({key:e,label:t,value:o,format:n})=>({key:e,label:t,value:o,format:n}))];function dd(e,t){let o=t>0?e.counters.calls/t:0;return`<div class="model-use-cell">
		<div class="model-use-track" aria-hidden="true"><span style="width:${Math.max(2,o*100).toFixed(1)}%"></span></div>
		<strong>${kt(o)}</strong>
		<span>${g(e.counters.calls)} turns</span>
	</div>`}var co=[{sortKey:"model",label:"Model",title:"Model identifier",sortValue:e=>e.model,render:e=>c(Y(e.model))},{sortKey:"calls",label:"Local use",title:"Share of user-request turns attributed to this model",sortValue:e=>e.counters.calls,render:dd},{sortKey:"oneShotRate",label:"One-shot",title:"Share of edit turns completed without retries or self-corrections",sortValue:e=>e.rates.oneShotRate,render:e=>kt(e.rates.oneShotRate)},{sortKey:"retryRate",label:"Retries/edit",title:"Average immediate same-file retries per edit turn",sortValue:e=>e.rates.retryRate,render:e=>Xt(e.rates.retryRate)},{sortKey:"selfCorrectionRate",label:"Self-corr/edit",title:"Average re-edits after intervening tool calls per edit turn",sortValue:e=>e.rates.selfCorrectionRate,render:e=>Xt(e.rates.selfCorrectionRate)},{sortKey:"costPerCall",label:"Avg cost",title:"Average estimated provider cost per user-request turn",sortValue:e=>e.rates.costPerCall,render:e=>hn(e.rates.costPerCall)},{sortKey:"outputTokensPerCall",label:"Out tok",title:"Average output tokens per user-request turn",sortValue:e=>e.rates.outputTokensPerCall,render:e=>e.rates.outputTokensPerCall===null?"\u2014":qe(Math.round(e.rates.outputTokensPerCall))},{sortKey:"toolCallsPerCall",label:"Steps",title:"Average tool invocations per user-request turn",sortValue:e=>e.rates.toolCallsPerCall,render:e=>Xt(e.rates.toolCallsPerCall)},{sortKey:"cacheHitRate",label:"Cache hit",title:"Cache-read share of input tokens",sortValue:e=>e.rates.cacheHitRate,render:e=>kt(e.rates.cacheHitRate)}];function ud(e){return ao!==e?"":ft==="desc"?" \u25BC":" \u25B2"}function pd(e,t,o){let n=o.sortValue(e),r=o.sortValue(t);if(n===null&&r===null)return 0;if(n===null)return 1;if(r===null)return-1;let s=typeof n=="string"||typeof r=="string"?String(n).localeCompare(String(r)):n-r;return ft==="desc"?-s:s}function gd(e){let t=Object.entries(e).map(([n,r])=>({model:n,counters:r,rates:Bn(r)})),o=co.find(n=>n.sortKey===ao)??co[1];return t.sort((n,r)=>pd(n,r,o))}function fd(e,t){if(!yn)return{rows:e,hiddenNote:""};let o=On(t);if(o===null)return{rows:e,hiddenNote:""};let n=e.filter(l=>l.counters.calls>o),r=e.length-n.length,s=r===1?"model":"models",i=o===1?"turn":"turns",a=r>0?`${r} low-usage ${s} hidden (\u2264${o} ${i})`:"";return{rows:n,hiddenNote:a}}var gs=["--stage-1-color","--stage-2-color","--stage-3-color","--stage-4-color","--success-fg","--warning-fg","--link-color"],md={Anthropic:"--warning-fg",OpenAI:"--success-fg",Google:"--stage-3-color","Mistral AI":"--stage-2-color",xAI:"--stage-4-color",Alibaba:"--stage-1-color",Microsoft:"--link-color"};function fs(e){let t=0;for(let o=0;o<e.length;o++)t=(t<<5)-t+e.charCodeAt(o)|0;return`var(${gs[Math.abs(t)%gs.length]})`}function vn(e){if(go==="model")return fs(e);let t=Ce(e),o=md[t];return o?`var(${o})`:fs(t)}function bd(e,t){return e.key==="cost"?hn(t):e.key==="outputTokens"?qe(Math.round(t)):C(t,1)}function yd(e,t){let o=[0,.25,.5,.75,1].map(r=>{let s=76+r*760;return`<line x1="${s}" y1="24" x2="${s}" y2="286"></line><text x="${s}" y="310" text-anchor="middle">${c(bd(e,t*r))}</text>`}).join(""),n=[0,.25,.5,.75,1].map(r=>{let s=286-r*262;return`<line x1="76" y1="${s}" x2="836" y2="${s}"></line><text x="64" y="${s+4}" text-anchor="end">${Math.round(r*100)}%</text>`}).join("");return`<g class="efficiency-grid">${o}${n}</g>`}function hd(e,t,o,n,r,s){let i=t.value(e)??0,a=o.value(e)??0,l=e.rates.oneShotRate??0,u=76+i/n*760,d=286-l*262,p=Ao(a,r),b=vn(e.model),h=Y(e.model),T=c(h),ue=`${h}: ${kt(l)} one-shot edit rate, ${t.format(i)} ${t.axisLabel.toLowerCase()}, bubble sized by ${o.label.toLowerCase()}: ${o.format(a)}`;return`<g class="efficiency-point" style="--model-color:${b}" tabindex="0" role="img" aria-label="${c(ue)}">
		<circle cx="${u.toFixed(1)}" cy="${d.toFixed(1)}" r="${p.toFixed(1)}"><title>${c(ue)}</title></circle>
		<text x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}" text-anchor="${s.textAnchor}">${T}</text>
	</g>`}function vd(e){return go!=="vendor"?"":`<div class="efficiency-vendor-legend" aria-label="Model vendor colors">${[...new Set(e.map(n=>Ce(n.model)))].sort().map(n=>{let r=e.find(s=>Ce(s.model)===n)?.model??"";return`<span class="efficiency-legend-item" style="--model-color:${vn(r)}"><span aria-hidden="true"></span>${c(n)}</span>`}).join("")}</div>`}function xd(e){let t=Ct.find(u=>u.key===io)??Ct[0],o=lo.find(u=>u.key===bn)??lo[0],n=e.filter(u=>u.rates.oneShotRate!==null&&t.value(u)!==null).sort((u,d)=>d.counters.calls-u.counters.calls).slice(0,12);if(n.length===0)return'<div class="model-leaderboard-empty"><strong>No comparable edit data yet.</strong><span>The chart appears after local sessions record both a model and structured edit turns.</span></div>';let r=Math.max(...n.map(u=>t.value(u)??0),1e-4)*1.08,s=Math.max(...n.map(u=>o.value(u)??0),0),i=n.map(u=>{let d=t.value(u)??0,p=o.value(u)??0;return{x:76+d/r*760,y:286-(u.rates.oneShotRate??0)*262,radius:Ao(p,s),label:Y(u.model)}}),a=Jn(i,{left:76,right:836,top:24,bottom:286}),l=n.map((u,d)=>hd(u,t,o,r,s,a[d])).join("");return`<div class="efficiency-chart-wrap">
		<svg class="efficiency-chart" viewBox="0 0 900 350" role="img" aria-label="One-shot edit rate compared with ${c(t.axisLabel.toLowerCase())}; bubble size represents ${c(o.label.toLowerCase())}">
			${yd(t,r)}
			<text class="efficiency-axis-title" x="456" y="344" text-anchor="middle">${c(t.axisLabel)}</text>
			<text class="efficiency-axis-title" x="17" y="155" text-anchor="middle" transform="rotate(-90 17 155)">One-shot edit rate</text>
			<text class="efficiency-chart-hint" x="836" y="17" text-anchor="end">higher is better \u2191</text>
			${l}
		</svg>
	</div>${vd(n)}`}function kd(){let e=Ct.map(n=>`<button class="efficiency-metric-button${n.key===io?" active":""}" type="button" data-eff-metric="${n.key}" aria-pressed="${n.key===io}">${n.label}</button>`).join(""),t=lo.map(n=>`<option value="${n.key}"${n.key===bn?" selected":""}>${n.label}</option>`).join(""),o=[{value:"vendor",label:"Vendor"},{value:"model",label:"Model"}].map(n=>`<option value="${n.value}"${n.value===go?" selected":""}>${n.label}</option>`).join("");return`<div class="efficiency-chart-controls">
		<div class="efficiency-control"><span>X-axis</span><div class="efficiency-metric-selector" role="group" aria-label="Efficiency comparison metric">${e}</div></div>
		<label class="efficiency-control"><span>Bubble size</span><select id="eff-bubble-metric">${t}</select></label>
		<label class="efficiency-control"><span>Color by</span><select id="eff-color-mode">${o}</select></label>
	</div>`}function ms(e,t){return e.map(o=>{let n=co.map(r=>`<td>${r.render(o,t)}</td>`).join("");return`<tr style="--model-color:${vn(o.model)}">${n}</tr>`}).join("")}function Cd(){return co.map(e=>`<th class="sortable" data-eff-sort="${e.sortKey}" title="${e.title}">${e.label}${ud(e.sortKey)}</th>`).join("")}function wd(e,t,o){let n=o.size>0?e.filter(d=>!o.has(d.model)):e,r=o.size>0?e.filter(d=>o.has(d.model)):[],s=Cd(),i=`<div class="model-leaderboard-table-wrap"><table class="model-leaderboard-table"><thead><tr>${s}</tr></thead><tbody>${ms(n,t)}</tbody></table></div>`;if(r.length===0)return i;let a=r.reduce((d,p)=>d+p.counters.calls,0),l=t>0?a/t:0,u=`<div class="model-leaderboard-table-wrap"><table class="model-leaderboard-table"><thead><tr>${s}</tr></thead><tbody>${ms(r,t)}</tbody></table></div>`;return`${i}<details class="model-leaderboard-other" id="model-leaderboard-other"${Ks?" open":""}>
		<summary>Other models (${r.length}, ${kt(l)} of turns)</summary>
		${u}
	</details>`}function Gs(){let e=qs[Ws];if(!e||Object.keys(e).length===0)return'<div class="model-leaderboard-empty"><strong>No per-model efficiency data for this period.</strong><span>Run local agent sessions with model and tool-call metadata, then refresh the dashboard.</span></div>';let t=gd(e),o=t.reduce((a,l)=>a+l.counters.calls,0),n=fd(t,e),r=n.hiddenNote?`<span class="model-leaderboard-filter-note">${n.hiddenNote}</span>`:"",s=Object.fromEntries(n.rows.map(a=>[a.model,a.counters])),i=Nn(s);return`<div class="efficiency-chart-header"><div><strong>Efficiency frontier</strong><span>One-shot edit rate is a local quality proxy, not a benchmark pass rate.</span></div>${kd()}</div>
		${xd(n.rows)}
		<div class="model-leaderboard-heading"><div><strong>Most used models locally</strong><span>Ranked by your local turns; all averages use the same selected period.</span></div>${r}</div>
		${wd(n.rows,o,i)}`}function Td(e){return qs={today:e.today.modelEfficiency,last30Days:e.last30Days.modelEfficiency,month:e.month.modelEfficiency},`<div class="section" id="section-model-efficiency">
		<div class="section-title"><span>\u{1F3AF}</span><span>Local Model Leaderboard</span></div>
		<div class="section-subtitle">Compare the models in your own sessions by local usage, one-shot edits, cost, output tokens, and tool steps. Exactness depends on what each editor records; missing structured data is shown as unavailable rather than estimated.</div>
		<div class="model-leaderboard-controls">
			<span id="model-efficiency-period-selector"></span>
			<label class="model-leaderboard-filter" title="Show only models above the 25th-percentile local turn count.">
				<input type="checkbox" id="eff-filter-low-usage"${yn?" checked":""}>
				Hide low-usage models
			</label>
		</div>
		<div id="model-efficiency-content">${Gs()}</div>
	</div>`}function Sd(){let e=document.getElementById("model-efficiency-period-selector");if(!e)return;e.replaceChildren();let{wrapper:t}=bo({selected:ps,disabled:["last7","last90","allTime"],disabledTitle:"Not available for model efficiency",label:"",onChange:o=>{let n=cd[o];n&&(ps=o,Ws=n,Pe())}});e.append(t)}function Pe(){let e=document.getElementById("model-efficiency-content");e&&x(e,Gs())}function $d(e){let t=e.getAttribute("data-eff-sort");t&&(ao===t?ft=ft==="desc"?"asc":"desc":(ao=t,ft=t==="model"?"asc":"desc"),Pe())}function Ad(){let e=document.getElementById("section-model-efficiency");e&&(e.addEventListener("toggle",t=>{let o=t.target;o.id==="model-leaderboard-other"&&(Ks=o.open)},!0),e.addEventListener("click",t=>{let o=t.target,n=o.closest("th[data-eff-sort]");if(n){$d(n);return}let r=o.closest("button[data-eff-metric]")?.dataset.effMetric;r&&Ct.some(s=>s.key===r)&&(io=r,Pe())}),e.addEventListener("change",t=>{let o=t.target;o.id==="eff-filter-low-usage"?(yn=o.checked,Pe()):o.id==="eff-bubble-metric"&&lo.some(n=>n.key===o.value)?(bn=o.value,Pe()):o.id==="eff-color-mode"&&(o.value==="vendor"||o.value==="model")&&(go=o.value,Pe())}))}function Rd(e,t,o,n,r,s,i,a){return`
		<div id="tab-panel-tools" class="tab-panel"${S!=="tools"?' style="display:none"':""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions${ht?' (automatic tool calls hidden \u2014 disable "Hide Automatic Tool Calls" in settings to show them)':""}</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.today.toolCalls.total)}</div>
						${Q(ee(e.today.toolCalls.byTool,t),10,pt,!0)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.last30Days.toolCalls.total)}</div>
							${Q(ee(e.last30Days.toolCalls.byTool,t),10,pt,!0)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${g(e.month.toolCalls.total)}</div>
							${Q(ee(e.month.toolCalls.byTool,t),10,pt,!0)}
						</div>
					</div>
				</div>
			</div>

			${ql(e,o,n)}
			${oc(Yt??e.curationAnalysis)}
			${dc(e.repeatedTasks??null)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${Zo("\u{1F4C5} Today",e.today.modelSwitching,s,i,r,a)}
					${Zo("\u{1F4C6} Last 30 Days",e.last30Days.modelSwitching,s,i,r,a)}
					${Zo("\u{1F4C5} Previous Month",e.month.modelSwitching,s,i,r,a)}
				</div>
			</div>
		</div>`}function Ed(e,t){try{return x(e,t()),!0}catch(o){let n=o instanceof Error?o.message:String(o);return console.error(`[usage-webview] renderLayout failed: ${n}`),x(e,`<div style="padding: 32px; text-align: center; font-size: 14px;">
			<div style="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;">\u26A0\uFE0F Something went wrong rendering the dashboard.</div>
			${po().outerHTML}
		</div>`),!1}}function Md(e){let t=e.customizationMatrix??E?.customizationMatrix??null;return H=t??null,(!H||H.workspaces.length===0)&&(B=null),Array.isArray(e.currentWorkspacePaths)&&(xs=e.currentWorkspacePaths),e.curationAnalysis?(Yt=e.curationAnalysis,te("renderLayout.curation.cached",{availableTools:Yt.availableTools.length,unusedTools:Yt.unusedTools.length})):ve("render-no-curation-update","renderLayout.curation.notProvidedInUpdate"),t}function Vs(e){let t=document.getElementById("root");if(!t)return;let o=Md(e);uo=e.correctionReport;let n=P("Workspace Customization",()=>Nl(o)),r=jl(e),s=je(e.today.contextReferences),i=je(e.last30Days.contextReferences),a=P("Thinking Effort",()=>Hl(e)),l=`
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${g(e.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${g(e.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${g(e.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${g(e.lastMonth.sessions)}</div></div>
			</div>
		</div>`;Ed(t,()=>Tc(e,n,"",a,l,s,i,r.allToolKeys,r.allMcpToolKeys,r.allMcpServerKeys,r.allHighCostModels,r.allLowCostModels,r.allMediumCostModels,r.allUnknownModels))&&(Pd(),_d(),Dd(),wc(),W(),Pl(),Ad(),Sd(),Ts(),al(),Ld(),zs(),cn=e.insights??[],Bs(),Js(),Zn(_e,it,_s,Ps),vs("layout-rendered"))}function _d(){let e=document.getElementById("about-info-toggle"),t=document.getElementById("about-info-body");if(!e||!t)return;let o=e.querySelector(".info-box-chevron"),n=()=>{Z=!Z,t.style.display=Z?"none":"",e.setAttribute("aria-expanded",String(!Z)),o&&(o.textContent=Z?"\u25B8":"\u25BE"),f.setState({...f.getState()??{},aboutCollapsed:Z})};e.addEventListener("click",n),e.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),n())})}function Pd(){document.getElementById("btn-refresh")?.addEventListener("click",()=>{f.postMessage({command:"refresh"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{f.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{f.postMessage({command:"showChart"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{f.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{f.postMessage({command:"showMaturity"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{f.postMessage({command:"showDashboard"})}),document.getElementById("btn-environmental")?.addEventListener("click",()=>{f.postMessage({command:"showEnvironmental"})}),document.getElementById("btn-efficiency")?.addEventListener("click",()=>{f.postMessage({command:"showEfficiency"})}),En(f)}function bs(e,t){e&&(e.disabled=!0,e.textContent=t,e.setAttribute("appearance","secondary"))}function Dd(){document.getElementById("btn-analyse-repo")?.addEventListener("click",()=>{let e=document.getElementById("btn-analyse-repo");mt=!0,bs(e,"Analyzing..."),f.postMessage({command:"analyseRepository"})}),document.getElementById("btn-analyse-all")?.addEventListener("click",()=>{let e=document.getElementById("btn-analyse-all");bs(e,"Analyzing All..."),ke=!0,xe=!0,B=null;for(let t of H?.workspaces??[])t.workspacePath.startsWith("<unresolved:")||Ie.add(t.workspacePath);W(),f.postMessage({command:"analyseAllRepositories"})}),document.getElementById("repo-list-pane")?.addEventListener("click",e=>{let t=e.target;if(t.closest("#btn-show-other-workspaces")){Zt=!0,W();return}if(t.closest("#btn-collapse-other-workspaces")){Zt=!1,W();return}let o=t.closest(".btn-repo-action");if(!o)return;let n=o.getAttribute("data-workspace-path"),r=o.getAttribute("data-action");if(!(!n||!r)){if(r==="details"){B=n,xe=!1,W();return}r==="analyze"&&(Ie.add(n),ke=!1,W(),f.postMessage({command:"analyseRepository",workspacePath:n}))}}),document.getElementById("repo-details-pane")?.addEventListener("click",e=>{e.target.closest("#btn-switch-repository")&&(xe=!0,W())})}function Ld(){Array.from(document.getElementsByClassName("cf-copy")).forEach(e=>{e.addEventListener("click",t=>{let o=t.currentTarget,n=o.getAttribute("data-path")||"";navigator.clipboard&&n&&navigator.clipboard.writeText(n).then(()=>{o.textContent="Copied",setTimeout(()=>{o.textContent="Copy"},1200)}).catch(()=>{f.postMessage({command:"copyFailed",path:n})})})})}function Id(e){nn(),e.data?.locale&&ho(e.data.locale),typeof e.data?.use24HourTime=="boolean"&&(no=e.data.use24HourTime),typeof e.data?.hideAutomaticToolCalls=="boolean"&&(ht=e.data.hideAutomaticToolCalls);let t=Za(e.data);t?(pn=!1,Object.prototype.hasOwnProperty.call(e.data??{},"correctionReport")||(t.correctionReport=uo),Ss(t.recentSessions),Vs(t),ws(),W()):(ve("update-invalid-sanitized","handleUpdateStats.sanitizeReturnedNull"),ks("Received invalid data from the extension. Try refreshing."))}function Ys(e){if(!e)return;let t=document.getElementById("unknown-mcp-tools-section");t&&(t.querySelectorAll("button[data-suppress-tool]").forEach(o=>{o.getAttribute("data-suppress-tool")===e&&o.closest("span")?.remove()}),t.querySelectorAll("button[data-suppress-tool]").length===0&&t.remove())}function Ud(){S="tools",document.querySelectorAll(".tab-button").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-tab")==="tools")}),document.querySelectorAll(".tab-panel").forEach(o=>{o.style.display="none"});let e=document.getElementById("tab-panel-tools");e&&(e.style.display="block");let t=document.getElementById("unknown-mcp-tools-section");t&&(t.scrollIntoView({behavior:"smooth",block:"center"}),t.style.transition="box-shadow 0.3s ease",t.style.boxShadow="0 0 0 3px var(--vscode-focusBorder)",setTimeout(()=>{t.style.boxShadow=""},2e3))}function zd(e){_e=Dl(e),_e.authenticated||(Qt=!1),_s(_e)||Fe("repoPrStatsLoaded.notRendered",{repos:_e.repos.length,authenticated:_e.authenticated})}function Bd(e){!e||typeof e!="object"||(it=Kn(e),it.authenticated||(eo=!1),Ps(it)||Fe("agentSessionsLoaded.notRendered",{authenticated:it.authenticated}))}function Od(e){if(!Array.isArray(e))return;let t=$s(e);xc(t)}function Nd(e){switch(e.command){case"usageLoadingProgress":return ma(e),!0;case"usageRefreshing":return nn(),ut=0,un("Refreshing Usage Analysis"),!0;case"updateStatsError":return nn(),ks("Failed to calculate usage analysis. Check the Output panel for details."),!0}return!1}function Fd(e){switch(e.command){case"repoAnalysisResults":try{su(e.data,e.workspacePath)}catch(t){console.error("Failed to render repo analysis results",t),hs(t instanceof Error?t.message:String(t),e.workspacePath)}return!0;case"repoAnalysisError":return hs(e.error,e.workspacePath),!0;case"repoAnalysisBatchComplete":return iu(),!0}return!1}function Hd(e){if(!Nd(e)&&!Fd(e))switch(e.command){case"updateStats":Id(e);break;case"toolSuppressed":Ys(e.toolName);break;case"highlightUnknownTools":Ud();break;case"repoPrStatsLoaded":zd(e.data);break;case"repoPrStatsProgress":Qr("#repos-pr-content","repos-pr-progress","Fetching PRs\u2026",e.done,e.total);break;case"agentSessionsLoaded":Bd(e.data);break;case"recentSessionsLoaded":Oa(e);break;case"agentSessionsProgress":Qr("#agent-sessions-content","agent-sessions-progress","Fetching agent sessions\u2026",e.done,e.total);break;case"updateInsights":Od(e.insights);break;case"switchTab":jd(e);break;default:_l(e);break}}function jd(e){let t=String(e.tab);if(!Gn(t))return;S=t,Gt=typeof e.anchor=="string"&&e.anchor?e.anchor:null,document.querySelector(`.tab-button[data-tab="${t}"]`)?.click(),Js()}function Js(){if(!Gt)return;let e=document.getElementById(Gt);e&&(Gt=null,setTimeout(()=>e.scrollIntoView({behavior:"smooth",block:"start"}),50))}var ys=20;function Fe(e,t){ys<=0||(ys--,f.postMessage({command:"usageWebviewTrace",stage:e,details:t}))}$t(e=>{try{Hd(e)}catch(t){Fe("handleExtensionMessage.threw",{command:String(e?.command??""),error:t instanceof Error?t.message:String(t)})}},e=>{Fe("message-rejected-untrusted",{command:String(e?.data?.command??"(none)"),origin:e.origin,ownOrigin:location.origin,href:String(location.href).slice(0,120)})});window.addEventListener("error",e=>{Fe("window.error",{message:String(e.message).slice(0,200)})});window.addEventListener("unhandledrejection",e=>{Fe("unhandledRejection",{reason:String(e?.reason).slice(0,200)})});vs("listener-registered");function Wd(e){return H?.workspaces.find(o=>o.workspacePath===e)?.workspaceName||e}function qd(e){let t=wt.get(e);if(t?.data?.summary){let o=de(t.data.summary.percentage);return`${Math.round(o)}%`}return t?.error?"Error":"\u2014"}function de(e){let t=typeof e=="number"?e:Number(e);return Number.isFinite(t)?t:0}var Kd={"git-repo":"https://docs.github.com/en/get-started/using-git/about-git",gitignore:"https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files","env-example":"https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",editorconfig:"https://editorconfig.org/",linter:"https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",formatter:"https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide","type-safety":"https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries","commit-messages":"https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits","conventional-commits":"https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets","ci-config":"https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",scripts:"https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs","task-runner":"https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",devcontainer:"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",dockerfile:"https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry","version-pinning":"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",license:"https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"},Gd={versionControl:"\u{1F504} Version Control",codeQuality:"\u2728 Code Quality",cicd:"\u{1F680} CI/CD",environment:"\u{1F527} Environment",documentation:"\u{1F4DA} Documentation"};function Vd(e){let t=m("div");t.setAttribute("style","display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");let o=m("div");o.setAttribute("style","font-size: 14px; font-weight: 600; color: var(--text-primary);"),o.textContent="\u{1F4CA} Repository Hygiene Score";let n=m("div");return n.setAttribute("style","font-size: 24px; font-weight: 700; color: var(--link-color);"),n.textContent=`${Math.round(de(e.percentage))}%`,t.append(o,n),t}function Yd(e){let t=m("div");t.setAttribute("style","display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");let o=[{count:e.passedChecks,label:"Passed",cardStyle:"text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--success-fg);"},{count:e.warningChecks,label:"Warnings",cardStyle:"text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--warning-fg);"},{count:e.failedChecks,label:"Failed",cardStyle:"text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: #ef4444;"}];for(let n of o){let r=m("div");r.setAttribute("style",n.cardStyle);let s=m("div");s.setAttribute("style",n.countStyle),s.textContent=String(de(n.count));let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--text-secondary);"),i.textContent=n.label,r.append(s,i),t.appendChild(r)}return t}function Jd(e){let t=e?.status==="pass"||e?.status==="warning"?e.status:"fail";return{status:t,emoji:t==="pass"?"\u2705":t==="warning"?"\u26A0\uFE0F":"\u274C",color:t==="pass"?"#22c55e":t==="warning"?"#f59e0b":"#ef4444"}}function Xd(e,t){let o=m("div");o.setAttribute("style","flex: 1;");let n=m("div");n.setAttribute("style",`font-size: 12px; font-weight: 600; color: ${t};`),n.textContent=typeof e?.label=="string"?e.label:"";let r=m("div");if(r.setAttribute("style","font-size: 11px; color: var(--text-secondary); margin-top: 2px;"),r.textContent=typeof e?.detail=="string"?e.detail:"",o.append(n,r),typeof e?.hint=="string"&&e.hint.length>0){let i=m("div");i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;"),i.textContent=`\u{1F4A1} ${e.hint}`,o.appendChild(i)}let s=Kd[typeof e?.id=="string"?e.id:""];if(s){let i=m("a");i.setAttribute("href",s),i.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;"),i.setAttribute("title","View official documentation"),i.textContent="\u{1F4D6} View documentation",o.appendChild(i)}return o}function Zd(e){let{emoji:t,color:o}=Jd(e),n=m("div");n.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");let r=m("span");r.setAttribute("style","flex-shrink: 0; padding-top: 1px;"),x(r,j(t));let s=m("span");return s.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),s.textContent=`+${de(e?.weight)}`,n.append(r,Xd(e,o),s),n}function Qd(e,t,o){let n=m("div");n.setAttribute("style","margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let r=m("div");r.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");let s=m("span");s.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),s.textContent=Gd[e]||e;let i=o?.categories?.[e],a=m("span");a.setAttribute("style","font-size: 11px; color: var(--link-color); font-weight: 600;"),a.textContent=`${Math.round(de(i?.percentage))}%`,r.append(s,a),n.appendChild(r);for(let l of t)n.appendChild(Zd(l));return n}function eu(e){let t=m("div");t.setAttribute("style","margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let o=m("div");o.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");let n=m("span");n.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),n.textContent="\u{1F4A1} Top Recommendations",o.appendChild(n),t.appendChild(o);for(let r of e.slice(0,5)){let s=r?.priority==="high"||r?.priority==="medium"?r.priority:"low",i=s==="high"?"#ef4444":s==="medium"?"#f59e0b":"#60a5fa",a=m("div");a.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");let l=m("span");l.setAttribute("style",`font-size: 10px; font-weight: 600; color: ${i}; min-width: 50px;`),l.textContent=String(s).toUpperCase();let u=m("div");u.setAttribute("style","flex: 1;");let d=m("div");d.setAttribute("style","font-size: 11px; color: var(--text-primary);"),d.textContent=typeof r?.action=="string"?r.action:"";let p=m("div");p.setAttribute("style","font-size: 10px; color: var(--text-muted); margin-top: 2px;"),p.textContent=typeof r?.impact=="string"?r.impact:"",u.append(d,p);let b=m("span");b.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),b.textContent=`+${de(r?.weight)}`,a.append(l,u,b),t.appendChild(a)}return t}function tu(e,t){let o=m("div");o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");let n=m("div");n.setAttribute("style","font-size: 11px; color: var(--text-secondary); flex: 1;"),n.textContent="Let Copilot help you fix the identified issues in this repository.";let r=document.createElement("vscode-button");return r.setAttribute("style","min-width: 180px;"),r.textContent="\u{1F916} Ask Copilot to Improve",r.addEventListener("click",()=>{let i=`Please help me improve this repository by addressing the following best practice issues:

${e.map(l=>`- ${l.label}: ${l.detail||""}${l.hint?` (${l.hint})`:""}`).join(`
`)}

For each issue, please provide specific steps or code changes to fix it.`;if(!t||xs.some(l=>l.toLowerCase()===t.toLowerCase()))f.postMessage({command:"openCopilotChatWithPrompt",prompt:i});else{let l=t.split(/[/\\]/).filter(Boolean).pop()??t;o.replaceChildren(),o.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");let u=m("div");u.setAttribute("style","font-size: 11px; color: var(--warning-fg);"),u.textContent=`\u26A0\uFE0F Open "${l}" in VS Code first, then paste this prompt into Copilot Chat:`;let d=m("pre");d.setAttribute("style","font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;"),d.textContent=i;let p=document.createElement("vscode-button");p.setAttribute("appearance","secondary"),p.textContent="\u{1F4CB} Copy prompt",p.addEventListener("click",()=>{navigator.clipboard.writeText(i).then(()=>{p.textContent="\u2705 Copied!",setTimeout(()=>{p.textContent="\u{1F4CB} Copy prompt"},2e3)})}),o.append(u,d,p)}}),o.append(n,r),o}function Xs(e,t){let o=e?.summary||{},n=Array.isArray(e?.checks)?e.checks:[],r=Array.isArray(e?.recommendations)?[...e.recommendations]:[],s=m("div");s.appendChild(Vd(o)),s.appendChild(Yd(o));let i=m("div");i.setAttribute("style","font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;"),i.textContent=`Score: ${de(o.totalScore)} / ${de(o.maxScore)} points`,s.appendChild(i);let a={high:1,medium:2,low:3};r.sort((d,p)=>(a[d?.priority]||99)-(a[p?.priority]||99));let l={};for(let d of n){let p=typeof d?.category=="string"&&d.category.length>0?d.category:"other";l[p]||(l[p]=[]),l[p].push(d)}for(let[d,p]of Object.entries(l))s.appendChild(Qd(d,p,o));r.length>0&&s.appendChild(eu(r));let u=n.filter(d=>d?.status==="fail"||d?.status==="warning");return u.length>0&&s.appendChild(tu(u,t)),s}function ou(e){if(e.length<=6)return{visible:e,otherWorkspaces:[]};let t=[...e].sort((r,s)=>(Number(s.sessionCount)||0)-(Number(r.sessionCount)||0)),o=-1,n=1;for(let r=1;r<=t.length-3;r++){let s=Number(t[r-1].sessionCount)||0,i=Number(t[r].sessionCount)||0;if(s<=0)continue;let a=s/Math.max(i,1);a>n&&(n=a,o=r)}return o<1||n<2?{visible:t,otherWorkspaces:[]}:{visible:t.slice(0,o),otherWorkspaces:t.slice(o)}}function nu(e,t,o,n=[],r=!1){let s={sessions:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",interactions:"width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",score:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"},i=`
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${s.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${s.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${s.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 110px; flex-shrink: 0;"></div>
		</div>
	`;x(e,i+t.map((a,l)=>{let u=wt.get(a.workspacePath),d=Ie.has(a.workspacePath),p=!!u?.data?.summary,b=qd(a.workspacePath),h=d?"Analyzing\u2026":p?"Details":"Analyze",T=p&&!d?"details":"analyze",ue=B===a.workspacePath&&o,fo=d||ue,mo=d?' appearance="secondary"':"",Zs=Number(a.sessionCount)||0,Qs=Number(a.interactionCount)||0;return`
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${l<t.length-1?"1px solid var(--border-subtle)":"none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c(a.workspacePath)}">
						${c(a.workspaceName)}
					</div>
				</div>
				<div style="${s.sessions}">${Zs}</div>
				<div style="${s.interactions}">${Qs}</div>
				<div style="${s.score}">${c(b)}</div>
				<vscode-button class="btn-repo-action" data-action="${T}" data-workspace-path="${c(a.workspacePath)}" ${fo?'disabled="true"':""}${mo} style="width: 110px; flex-shrink: 0;">
					${h}
				</vscode-button>
			</div>
		`}).join("")+(n.length>0?`
		<div class="repo-item repo-item-other" style="padding: 6px 12px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 12px; font-style: italic; color: var(--text-secondary);">
				Other (${n.length} repositor${n.length===1?"y":"ies"} with low activity)
			</div>
			<div style="${s.sessions}">${n.reduce((a,l)=>a+(Number(l.sessionCount)||0),0)}</div>
			<div style="${s.interactions}">${n.reduce((a,l)=>a+(Number(l.interactionCount)||0),0)}</div>
			<div style="${s.score}">\u2014</div>
			<vscode-button id="btn-show-other-workspaces" appearance="secondary" style="width: 110px; flex-shrink: 0;">Show all</vscode-button>
		</div>
	`:Zt&&!o&&r?`
		<div class="repo-item repo-item-other" style="padding: 6px 12px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: flex-end;">
			<vscode-button id="btn-collapse-other-workspaces" appearance="secondary" style="width: 110px; flex-shrink: 0;">Show less</vscode-button>
		</div>
	`:""))}function ru(e,t,o){e.replaceChildren();let n=m("div","repo-details-card");n.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");let r=m("div","repo-details-card-header");r.setAttribute("style","display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");let s=m("div");s.setAttribute("style","font-size: 12px; color: var(--text-secondary);"),s.textContent="Repository: ";let i=m("span");i.setAttribute("style","color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;"),i.textContent=o,s.appendChild(i);let a=document.createElement("vscode-button");a.id="btn-switch-repository",a.setAttribute("style","min-width: 120px;"),a.textContent="Switch Repository",r.append(s,a),n.append(r,Xs(t.data,B??void 0)),e.appendChild(n)}function W(){let e=document.getElementById("repo-list-pane"),t=document.getElementById("repo-list-pane-container"),o=document.getElementById("repo-details-pane"),n=document.getElementById("repo-details-pane-container");if(!e||!t||!o||!n||!H)return;let r=!!B&&!xe,s=ou(H.workspaces),i=s.otherWorkspaces.length>0,a,l=[];if(r?a=H.workspaces.filter(p=>p.workspacePath===B):Zt||!i?a=s.visible.concat(s.otherWorkspaces):(a=s.visible,l=s.otherWorkspaces),t.classList.remove("repo-hygiene-pane-collapsed"),n.classList.toggle("repo-hygiene-pane-collapsed",!r),nu(e,a,r,l,i),!r||!B){o.replaceChildren();return}let u=Wd(B),d=wt.get(B);if(d?.data){ru(o,d,u);return}if(d?.error){x(o,`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${c(u)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${c(d.error)}</div>
			</div>
		`);return}x(o,`
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${c(u)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`)}function su(e,t){if(t){Ie.delete(t),wt.set(t,{data:e,error:void 0}),ke||(B=t,xe=!1),W();return}let o=document.getElementById("btn-analyse-repo");o&&(mt=!1,o.disabled=!1,o.textContent="Analyze Repo for Best Practices",o.removeAttribute("appearance"));let n=document.getElementById("repo-analysis-results");if(n){n.replaceChildren();let r=m("div","repo-analysis-card");r.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;"),r.appendChild(Xs(e,t)),n.appendChild(r)}}function hs(e,t){if(t){Ie.delete(t),wt.set(t,{data:void 0,error:e}),ke||(B=t,xe=!1),W();return}let o=document.getElementById("btn-analyse-repo");o&&(mt=!1,o.disabled=!1,o.textContent="Analyze Repo for Best Practices",o.removeAttribute("appearance"));let n=document.getElementById("repo-analysis-results");n&&x(n,`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${c(e)}</div>
			</div>
		`)}function iu(){ke=!1,xe=!0,B=null,Ie.clear(),W();let e=document.getElementById("btn-analyse-all");if(e){e.disabled=!1,e.removeAttribute("appearance");let o=E?.customizationMatrix?.workspaces?.length||0;e.textContent=`Analyze All Repositories (${o})`}}async function au(){if(await Promise.resolve().then(()=>(Vr(),Gr)),!E){un("Loading usage analysis..."),Vt=setTimeout(()=>{let t=document.getElementById("root");if(t&&t.querySelector("#usage-loading-card")){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;",n.textContent="\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.",o.append(n,po()),t.textContent="",t.append(o)}},3e4);return}ho(E.locale),no=E.use24HourTime!==!1,ht=E.hideAutomaticToolCalls!==!1,Ss(E.recentSessions);let e=E.sessionColumnSettings?.enabledColumns;if(Array.isArray(e)){let t=e.filter(o=>Cs.includes(o));ze=new Set(t)}Vs(E),ws(),document.addEventListener("click",t=>{let n=t.target.getAttribute("data-suppress-tool");n&&(Ys(n),f.postMessage({command:"suppressUnknownTool",toolName:n}))})}au().catch(e=>{console.error("[Usage Analysis] Bootstrap failed:",e);let t=document.getElementById("root");if(t){let o=document.createElement("div");o.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let n=document.createElement("div");n.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",n.textContent="Failed to initialize usage analysis. Please try refreshing.",o.append(n,po()),t.textContent="",t.append(o)}});})();
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
