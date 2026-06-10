"use strict";(()=>{var Hp=Object.defineProperty;var l=(i,e)=>()=>(i&&(e=i(i=0)),e);var zp=(i,e)=>{for(var t in e)Hp(i,t,{get:e[t],enumerable:!0})};function to(){let i=new WeakMap;return function(e){let t=i.get(e);if(t===void 0){let o=Reflect.getPrototypeOf(e);for(;t===void 0&&o!==null;)t=i.get(o),o=Reflect.getPrototypeOf(o);t=t===void 0?[]:t.slice(0),i.set(e,t)}return t}}var We,ga,jt,Be,lt=l(()=>{We=(function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}})();We.trustedTypes===void 0&&(We.trustedTypes={createPolicy:(i,e)=>e});ga={configurable:!1,enumerable:!1,writable:!1};We.FAST===void 0&&Reflect.defineProperty(We,"FAST",Object.assign({value:Object.create(null)},ga));jt=We.FAST;if(jt.getById===void 0){let i=Object.create(null);Reflect.defineProperty(jt,"getById",Object.assign({value(e,t){let o=i[e];return o===void 0&&(o=t?i[e]=t():null),o}},ga))}Be=Object.freeze([])});var Fr,ba,Lr,Di,Pr,io,v,_e=l(()=>{lt();Fr=We.FAST.getById(1,()=>{let i=[],e=[];function t(){if(e.length)throw e.shift()}function o(a){try{a.call()}catch(d){e.push(d),setTimeout(t,0)}}function r(){let d=0;for(;d<i.length;)if(o(i[d]),d++,d>1024){for(let h=0,p=i.length-d;h<p;h++)i[h]=i[h+d];i.length-=d,d=0}i.length=0}function s(a){i.length<1&&We.requestAnimationFrame(r),i.push(a)}return Object.freeze({enqueue:s,process:r})}),ba=We.trustedTypes.createPolicy("fast-html",{createHTML:i=>i}),Lr=ba,Di=`fast-${Math.random().toString(36).substring(2,8)}`,Pr=`${Di}{`,io=`}${Di}`,v=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(i){if(Lr!==ba)throw new Error("The HTML policy can only be set once.");Lr=i},createHTML(i){return Lr.createHTML(i)},isMarker(i){return i&&i.nodeType===8&&i.data.startsWith(Di)},extractDirectiveIndexFromMarker(i){return parseInt(i.data.replace(`${Di}:`,""))},createInterpolationPlaceholder(i){return`${Pr}${i}${io}`},createCustomAttributePlaceholder(i,e){return`${i}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(i){return`<!--${Di}:${i}-->`},queueUpdate:Fr.enqueue,processUpdates:Fr.process,nextUpdate(){return new Promise(Fr.enqueue)},setAttribute(i,e,t){t==null?i.removeAttribute(e):i.setAttribute(e,t)},setBooleanAttribute(i,e,t){t?i.setAttribute(e,""):i.removeAttribute(e)},removeChildNodes(i){for(let e=i.firstChild;e!==null;e=i.firstChild)i.removeChild(e)},createTemplateWalker(i){return document.createTreeWalker(i,133,null,!1)}})});var It,di,Ai=l(()=>{It=class{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.spillover===void 0?this.sub1===e||this.sub2===e:this.spillover.indexOf(e)!==-1}subscribe(e){let t=this.spillover;if(t===void 0){if(this.has(e))return;if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.sub1=void 0,this.sub2=void 0}else t.indexOf(e)===-1&&t.push(e)}unsubscribe(e){let t=this.spillover;if(t===void 0)this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0);else{let o=t.indexOf(e);o!==-1&&t.splice(o,1)}}notify(e){let t=this.spillover,o=this.source;if(t===void 0){let r=this.sub1,s=this.sub2;r!==void 0&&r.handleChange(o,e),s!==void 0&&s.handleChange(o,e)}else for(let r=0,s=t.length;r<s;++r)t[r].handleChange(o,e)}},di=class{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;let o=this.subscribers[e];o!==void 0&&o.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var o;if(t){let r=this.subscribers[t];r===void 0&&(this.subscribers[t]=r=new It(this.source)),r.subscribe(e)}else this.sourceSubscribers=(o=this.sourceSubscribers)!==null&&o!==void 0?o:new It(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var o;if(t){let r=this.subscribers[t];r!==void 0&&r.unsubscribe(e)}else(o=this.sourceSubscribers)===null||o===void 0||o.unsubscribe(e)}}});function u(i,e){C.defineProperty(i,e)}function ya(i,e,t){return Object.assign({},t,{get:function(){return C.trackVolatile(),t.get.apply(this)}})}var C,va,Tt,St,Ke=l(()=>{_e();lt();Ai();C=jt.getById(2,()=>{let i=/(:|&&|\|\||if)/,e=new WeakMap,t=v.queueUpdate,o,r=p=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function s(p){let f=p.$fastController||e.get(p);return f===void 0&&(Array.isArray(p)?f=r(p):e.set(p,f=new di(p))),f}let a=to();class d{constructor(f){this.name=f,this.field=`_${f}`,this.callback=`${f}Changed`}getValue(f){return o!==void 0&&o.watch(f,this.name),f[this.field]}setValue(f,m){let y=this.field,O=f[y];if(O!==m){f[y]=m;let M=f[this.callback];typeof M=="function"&&M.call(f,O,m),s(f).notify(this.name)}}}class h extends It{constructor(f,m,y=!1){super(f,m),this.binding=f,this.isVolatileBinding=y,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(f,m){this.needsRefresh&&this.last!==null&&this.disconnect();let y=o;o=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;let O=this.binding(f,m);return o=y,O}disconnect(){if(this.last!==null){let f=this.first;for(;f!==void 0;)f.notifier.unsubscribe(this,f.propertyName),f=f.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(f,m){let y=this.last,O=s(f),M=y===null?this.first:{};if(M.propertySource=f,M.propertyName=m,M.notifier=O,O.subscribe(this,m),y!==null){if(!this.needsRefresh){let K;o=void 0,K=y.propertySource[y.propertyName],o=this,f===K&&(this.needsRefresh=!0)}y.next=M}this.last=M}handleChange(){this.needsQueue&&(this.needsQueue=!1,t(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let f=this.first;return{next:()=>{let m=f;return m===void 0?{value:void 0,done:!0}:(f=f.next,{value:m,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(p){r=p},getNotifier:s,track(p,f){o!==void 0&&o.watch(p,f)},trackVolatile(){o!==void 0&&(o.needsRefresh=!0)},notify(p,f){s(p).notify(f)},defineProperty(p,f){typeof f=="string"&&(f=new d(f)),a(p).push(f),Reflect.defineProperty(p,f.name,{enumerable:!0,get:function(){return f.getValue(this)},set:function(m){f.setValue(this,m)}})},getAccessors:a,binding(p,f,m=this.isVolatileBinding(p)){return new h(p,f,m)},isVolatileBinding(p){return i.test(p.toString())}})});va=jt.getById(3,()=>{let i=null;return{get(){return i},set(e){i=e}}}),Tt=class{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return va.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){va.set(e)}};C.defineProperty(Tt.prototype,"index");C.defineProperty(Tt.prototype,"length");St=Object.seal(new Tt)});var Et,hi,Rt,Ot=l(()=>{_e();Et=class{constructor(){this.targetIndex=0}},hi=class extends Et{constructor(){super(...arguments),this.createPlaceholder=v.createInterpolationPlaceholder}},Rt=class extends Et{constructor(e,t,o){super(),this.name=e,this.behavior=t,this.options=o}createPlaceholder(e){return v.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}});function Wp(i,e){this.source=i,this.context=e,this.bindingObserver===null&&(this.bindingObserver=C.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(i,e))}function Gp(i,e){this.source=i,this.context=e,this.target.addEventListener(this.targetName,this)}function Yp(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function Xp(){this.bindingObserver.disconnect(),this.source=null,this.context=null;let i=this.target.$fastView;i!==void 0&&i.isComposed&&(i.unbind(),i.needsBindOnly=!0)}function Qp(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function Zp(i){v.setAttribute(this.target,this.targetName,i)}function Jp(i){v.setBooleanAttribute(this.target,this.targetName,i)}function Kp(i){if(i==null&&(i=""),i.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=i.create():this.target.$fastTemplate!==i&&(e.isComposed&&(e.remove(),e.unbind()),e=i.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=i)}else{let e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=i}}function ef(i){this.target[this.targetName]=i}function tf(i){let e=this.classVersions||Object.create(null),t=this.target,o=this.version||0;if(i!=null&&i.length){let r=i.split(/\s+/);for(let s=0,a=r.length;s<a;++s){let d=r[s];d!==""&&(e[d]=o,t.classList.add(d))}}if(this.classVersions=e,this.version=o+1,o!==0){o-=1;for(let r in e)e[r]===o&&t.classList.remove(r)}}var qt,Mr,oo=l(()=>{_e();Ke();Ot();qt=class extends hi{constructor(e){super(),this.binding=e,this.bind=Wp,this.unbind=Yp,this.updateTarget=Zp,this.isBindingVolatile=C.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=ef,this.cleanedTargetName==="innerHTML"){let t=this.binding;this.binding=(o,r)=>v.createHTML(t(o,r))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=Jp;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=Gp,this.unbind=Qp;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=tf);break}}targetAtContent(){this.updateTarget=Kp,this.unbind=Xp}createBehavior(e){return new Mr(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}},Mr=class{constructor(e,t,o,r,s,a,d){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=o,this.bind=r,this.unbind=s,this.updateTarget=a,this.targetName=d}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){Tt.setEvent(e);let t=this.binding(this.source,this.context);Tt.setEvent(null),t!==!0&&e.preventDefault()}}});function of(i){if(i.length===1)return i[0];let e,t=i.length,o=i.map(a=>typeof a=="string"?()=>a:(e=a.targetName||e,a.binding)),r=(a,d)=>{let h="";for(let p=0;p<t;++p)h+=o[p](a,d);return h},s=new qt(r);return s.targetName=e,s}function wa(i,e){let t=e.split(Pr);if(t.length===1)return null;let o=[];for(let r=0,s=t.length;r<s;++r){let a=t[r],d=a.indexOf(io),h;if(d===-1)h=a;else{let p=parseInt(a.substring(0,d));o.push(i.directives[p]),h=a.substring(d+rf)}h!==""&&o.push(h)}return o}function xa(i,e,t=!1){let o=e.attributes;for(let r=0,s=o.length;r<s;++r){let a=o[r],d=a.value,h=wa(i,d),p=null;h===null?t&&(p=new qt(()=>d),p.targetName=a.name):p=of(h),p!==null&&(e.removeAttributeNode(a),r--,s--,i.addFactory(p))}}function nf(i,e,t){let o=wa(i,e.textContent);if(o!==null){let r=e;for(let s=0,a=o.length;s<a;++s){let d=o[s],h=s===0?e:r.parentNode.insertBefore(document.createTextNode(""),r.nextSibling);typeof d=="string"?h.textContent=d:(h.textContent=" ",i.captureContentBinding(d)),r=h,i.targetIndex++,h!==e&&t.nextNode()}i.targetIndex--}}function Ca(i,e){let t=i.content;document.adoptNode(t);let o=_r.borrow(e);xa(o,i,!0);let r=o.behaviorFactories;o.reset();let s=v.createTemplateWalker(t),a;for(;a=s.nextNode();)switch(o.targetIndex++,a.nodeType){case 1:xa(o,a);break;case 3:nf(o,a,s);break;case 8:v.isMarker(a)&&o.addFactory(e[v.extractDirectiveIndexFromMarker(a)])}let d=0;(v.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),d=-1);let h=o.behaviorFactories;return o.release(),{fragment:t,viewBehaviorFactories:h,hostBehaviorFactories:r,targetOffset:d}}var Br,_r,rf,Vr=l(()=>{_e();oo();Br=null,_r=class i{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){Br=this}static borrow(e){let t=Br||new i;return t.directives=e,t.reset(),Br=null,t}};rf=io.length});var Hr,ui,ro=l(()=>{Hr=document.createRange(),ui=class{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{let t=this.lastChild;if(e.previousSibling===t)return;let o=e.parentNode,r=this.firstChild,s;for(;r!==t;)s=r.nextSibling,o.insertBefore(r,e),r=s;o.insertBefore(t,e)}}remove(){let e=this.fragment,t=this.lastChild,o=this.firstChild,r;for(;o!==t;)r=o.nextSibling,e.appendChild(o),o=r;e.appendChild(t)}dispose(){let e=this.firstChild.parentNode,t=this.lastChild,o=this.firstChild,r;for(;o!==t;)r=o.nextSibling,e.removeChild(o),o=r;e.removeChild(t);let s=this.behaviors,a=this.source;for(let d=0,h=s.length;d<h;++d)s[d].unbind(a)}bind(e,t){let o=this.behaviors;if(this.source!==e)if(this.source!==null){let r=this.source;this.source=e,this.context=t;for(let s=0,a=o.length;s<a;++s){let d=o[s];d.unbind(r),d.bind(e,t)}}else{this.source=e,this.context=t;for(let r=0,s=o.length;r<s;++r)o[r].bind(e,t)}}unbind(){if(this.source===null)return;let e=this.behaviors,t=this.source;for(let o=0,r=e.length;o<r;++o)e[o].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){Hr.setStartBefore(e[0].firstChild),Hr.setEndAfter(e[e.length-1].lastChild),Hr.deleteContents();for(let t=0,o=e.length;t<o;++t){let r=e[t],s=r.behaviors,a=r.source;for(let d=0,h=s.length;d<h;++d)s[d].unbind(a)}}}}});function k(i,...e){let t=[],o="";for(let r=0,s=i.length-1;r<s;++r){let a=i[r],d=e[r];if(o+=a,d instanceof no){let h=d;d=()=>h}if(typeof d=="function"&&(d=new qt(d)),d instanceof hi){let h=sf.exec(a);h!==null&&(d.targetName=h[2])}d instanceof Et?(o+=d.createPlaceholder(t.length),t.push(d)):o+=d}return o+=i[i.length-1],new no(o,t)}var no,sf,ka=l(()=>{_e();Ke();Vr();ro();Ot();oo();no=class{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let p,f=this.html;if(typeof f=="string"){p=document.createElement("template"),p.innerHTML=v.createHTML(f);let y=p.content.firstElementChild;y!==null&&y.tagName==="TEMPLATE"&&(p=y)}else p=f;let m=Ca(p,this.directives);this.fragment=m.fragment,this.viewBehaviorFactories=m.viewBehaviorFactories,this.hostBehaviorFactories=m.hostBehaviorFactories,this.targetOffset=m.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}let t=this.fragment.cloneNode(!0),o=this.viewBehaviorFactories,r=new Array(this.behaviorCount),s=v.createTemplateWalker(t),a=0,d=this.targetOffset,h=s.nextNode();for(let p=o.length;a<p;++a){let f=o[a],m=f.targetIndex;for(;h!==null;)if(d===m){r[a]=f.createBehavior(h);break}else h=s.nextNode(),d++}if(this.hasHostBehaviors){let p=this.hostBehaviorFactories;for(let f=0,m=p.length;f<m;++f,++a)r[a]=p[f].createBehavior(e)}return new ui(t,r)}render(e,t,o){typeof t=="string"&&(t=document.getElementById(t)),o===void 0&&(o=t);let r=this.create(o);return r.bind(e,St),r.appendTo(t),r}},sf=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/});function Ur(i){return i.map(e=>e instanceof oe?Ur(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function $a(i){return i.map(e=>e instanceof oe?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}function Ia(i){let e=[],t=[];return i.forEach(o=>(o[so]?e:t).push(o)),{prepend:e,append:t}}function lf(){return`fast-style-class-${++af}`}var oe,so,Ta,Sa,zr,af,Nr,ao=l(()=>{_e();oe=class{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}};oe.create=(()=>{if(v.supportsAdoptedStyleSheets){let i=new Map;return e=>new zr(e,i)}return i=>new Nr(i)})();so=Symbol("prependToAdoptedStyleSheets");Ta=(i,e)=>{let{prepend:t,append:o}=Ia(e);i.adoptedStyleSheets=[...t,...i.adoptedStyleSheets,...o]},Sa=(i,e)=>{i.adoptedStyleSheets=i.adoptedStyleSheets.filter(t=>e.indexOf(t)===-1)};if(v.supportsAdoptedStyleSheets)try{document.adoptedStyleSheets.push(),document.adoptedStyleSheets.splice(),Ta=(i,e)=>{let{prepend:t,append:o}=Ia(e);i.adoptedStyleSheets.splice(0,0,...t),i.adoptedStyleSheets.push(...o)},Sa=(i,e)=>{for(let t of e){let o=i.adoptedStyleSheets.indexOf(t);o!==-1&&i.adoptedStyleSheets.splice(o,1)}}}catch{}zr=class extends oe{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=$a(e)}get styleSheets(){if(this._styleSheets===void 0){let e=this.styles,t=this.styleSheetCache;this._styleSheets=Ur(e).map(o=>{if(o instanceof CSSStyleSheet)return o;let r=t.get(o);return r===void 0&&(r=new CSSStyleSheet,r.replaceSync(o),t.set(o,r)),r})}return this._styleSheets}addStylesTo(e){Ta(e,this.styleSheets),super.addStylesTo(e)}removeStylesFrom(e){Sa(e,this.styleSheets),super.removeStylesFrom(e)}},af=0;Nr=class extends oe{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=$a(e),this.styleSheets=Ur(e),this.styleClass=lf()}addStylesTo(e){let t=this.styleSheets,o=this.styleClass;e=this.normalizeTarget(e);for(let r=0;r<t.length;r++){let s=document.createElement("style");s.innerHTML=t[r],s.className=o,e.append(s)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);let t=e.querySelectorAll(`.${this.styleClass}`);for(let o=0,r=t.length;o<r;++o)e.removeChild(t[o]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}});function c(i,e){let t;function o(r,s){arguments.length>1&&(t.property=s),Fi.locate(r.constructor).push(t)}if(arguments.length>1){t={},o(i,e);return}return t=i===void 0?{}:i,o}var Fi,Wt,R,lo,jr=l(()=>{Ke();_e();lt();Fi=Object.freeze({locate:to()}),Wt={toView(i){return i?"true":"false"},fromView(i){return!(i==null||i==="false"||i===!1||i===0)}},R={toView(i){if(i==null)return null;let e=i*1;return isNaN(e)?null:e.toString()},fromView(i){if(i==null)return null;let e=i*1;return isNaN(e)?null:e}},lo=class i{constructor(e,t,o=t.toLowerCase(),r="reflect",s){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=o,this.mode=r,this.converter=s,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,r==="boolean"&&s===void 0&&(this.converter=Wt)}setValue(e,t){let o=e[this.fieldName],r=this.converter;r!==void 0&&(t=r.fromView(t)),o!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](o,t),e.$fastController.notify(this.name))}getValue(e){return C.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){let t=this.mode,o=this.guards;o.has(e)||t==="fromView"||v.queueUpdate(()=>{o.add(e);let r=e[this.fieldName];switch(t){case"reflect":let s=this.converter;v.setAttribute(e,this.attribute,s!==void 0?s.toView(r):r);break;case"boolean":v.setBooleanAttribute(e,this.attribute,r);break}o.delete(e)})}static collect(e,...t){let o=[];t.push(Fi.locate(e));for(let r=0,s=t.length;r<s;++r){let a=t[r];if(a!==void 0)for(let d=0,h=a.length;d<h;++d){let p=a[d];typeof p=="string"?o.push(new i(e,p)):o.push(new i(e,p.property,p.attribute,p.mode,p.converter))}}return o}}});var Ea,Ra,qr,et,co=l(()=>{lt();Ke();ao();jr();Ea={mode:"open"},Ra={},qr=jt.getById(4,()=>{let i=new Map;return Object.freeze({register(e){return i.has(e.type)?!1:(i.set(e.type,e),!0)},getByType(e){return i.get(e)}})}),et=class{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;let o=lo.collect(e,t.attributes),r=new Array(o.length),s={},a={};for(let d=0,h=o.length;d<h;++d){let p=o[d];r[d]=p.attribute,s[p.name]=p,a[p.attribute]=p}this.attributes=o,this.observedAttributes=r,this.propertyLookup=s,this.attributeLookup=a,this.shadowOptions=t.shadowOptions===void 0?Ea:t.shadowOptions===null?void 0:Object.assign(Object.assign({},Ea),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?Ra:Object.assign(Object.assign({},Ra),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?oe.create(t.styles):t.styles instanceof oe?t.styles:oe.create([t.styles])}get isDefined(){return!!qr.getByType(this.type)}define(e=customElements){let t=this.type;if(qr.register(this)){let o=this.attributes,r=t.prototype;for(let s=0,a=o.length;s<a;++s)C.defineProperty(r,o[s]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}};et.forType=qr.getByType});function Wr(i){return i.shadowRoot||Oa.get(i)||null}var Oa,cf,ho,Gr=l(()=>{_e();Ai();Ke();co();Oa=new WeakMap,cf={bubbles:!0,composed:!0,cancelable:!0};ho=class i extends di{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;let o=t.shadowOptions;if(o!==void 0){let s=e.attachShadow(o);o.mode==="closed"&&Oa.set(e,s)}let r=C.getAccessors(e);if(r.length>0){let s=this.boundObservables=Object.create(null);for(let a=0,d=r.length;a<d;++a){let h=r[a].name,p=e[h];p!==void 0&&(delete e[h],s[h]=p)}}}get isConnected(){return C.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,C.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){let t=Wr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){let o=e.behaviors;e.addStylesTo(t),o!==null&&this.addBehaviors(o)}}removeStyles(e){let t=Wr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){let o=e.behaviors;e.removeStylesFrom(t),o!==null&&this.removeBehaviors(o)}}addBehaviors(e){let t=this.behaviors||(this.behaviors=new Map),o=e.length,r=[];for(let s=0;s<o;++s){let a=e[s];t.has(a)?t.set(a,t.get(a)+1):(t.set(a,1),r.push(a))}if(this._isConnected){let s=this.element;for(let a=0;a<r.length;++a)r[a].bind(s,St)}}removeBehaviors(e,t=!1){let o=this.behaviors;if(o===null)return;let r=e.length,s=[];for(let a=0;a<r;++a){let d=e[a];if(o.has(d)){let h=o.get(d)-1;h===0||t?o.delete(d)&&s.push(d):o.set(d,h)}}if(this._isConnected){let a=this.element;for(let d=0;d<s.length;++d)s[d].unbind(a)}}onConnectedCallback(){if(this._isConnected)return;let e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,St);let t=this.behaviors;if(t!==null)for(let[o]of t)o.bind(e,St);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);let e=this.view;e!==null&&e.unbind();let t=this.behaviors;if(t!==null){let o=this.element;for(let[r]of t)r.unbind(o)}}onAttributeChangedCallback(e,t,o){let r=this.definition.attributeLookup[e];r!==void 0&&r.onAttributeChangedCallback(this.element,o)}emit(e,t,o){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},cf),o))):!1}finishInitialization(){let e=this.element,t=this.boundObservables;if(t!==null){let r=Object.keys(t);for(let s=0,a=r.length;s<a;++s){let d=r[s];e[d]=t[d]}this.boundObservables=null}let o=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():o.template&&(this._template=o.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():o.styles&&(this._styles=o.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){let t=this.element,o=Wr(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||v.removeChildNodes(o),e&&(this.view=e.render(t,o,t))}static forCustomElement(e){let t=e.$fastController;if(t!==void 0)return t;let o=et.forType(e.constructor);if(o===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new i(e,o)}}});function Da(i){return class extends i{constructor(){super(),ho.forCustomElement(this)}$emit(e,t,o){return this.$fastController.emit(e,t,o)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,o){this.$fastController.onAttributeChangedCallback(e,t,o)}}}var Dt,Aa=l(()=>{Gr();co();Dt=Object.assign(Da(HTMLElement),{from(i){return Da(i)},define(i,e){return new et(i,e).define().type}})});var Gt,Yr=l(()=>{Gt=class{createCSS(){return""}createBehavior(){}}});function df(i,e){let t=[],o="",r=[];for(let s=0,a=i.length-1;s<a;++s){o+=i[s];let d=e[s];if(d instanceof Gt){let h=d.createBehavior();d=d.createCSS(),h&&r.push(h)}d instanceof oe||d instanceof CSSStyleSheet?(o.trim()!==""&&(t.push(o),o=""),t.push(d)):o+=d}return o+=i[i.length-1],o.trim()!==""&&t.push(o),{styles:t,behaviors:r}}function S(i,...e){let{styles:t,behaviors:o}=df(i,e),r=oe.create(t);return o.length&&r.withBehaviors(...o),r}var Fa=l(()=>{Yr();ao()});function Ve(i,e,t){return{index:i,removed:e,addedCount:t}}function hf(i,e,t,o,r,s){let a=s-r+1,d=t-e+1,h=new Array(a),p,f;for(let m=0;m<a;++m)h[m]=new Array(d),h[m][0]=m;for(let m=0;m<d;++m)h[0][m]=m;for(let m=1;m<a;++m)for(let y=1;y<d;++y)i[e+y-1]===o[r+m-1]?h[m][y]=h[m-1][y-1]:(p=h[m-1][y]+1,f=h[m][y-1]+1,h[m][y]=p<f?p:f);return h}function uf(i){let e=i.length-1,t=i[0].length-1,o=i[e][t],r=[];for(;e>0||t>0;){if(e===0){r.push(Xr),t--;continue}if(t===0){r.push(Qr),e--;continue}let s=i[e-1][t-1],a=i[e-1][t],d=i[e][t-1],h;a<d?h=a<s?a:s:h=d<s?d:s,h===s?(s===o?r.push(Pa):(r.push(Ma),o=s),e--,t--):h===a?(r.push(Qr),e--,o=a):(r.push(Xr),t--,o=d)}return r.reverse(),r}function pf(i,e,t){for(let o=0;o<t;++o)if(i[o]!==e[o])return o;return t}function ff(i,e,t){let o=i.length,r=e.length,s=0;for(;s<t&&i[--o]===e[--r];)s++;return s}function mf(i,e,t,o){return e<t||o<i?-1:e===t||o===i?0:i<t?e<o?e-t:o-t:o<e?o-i:e-i}function Zr(i,e,t,o,r,s){let a=0,d=0,h=Math.min(t-e,s-r);if(e===0&&r===0&&(a=pf(i,o,h)),t===i.length&&s===o.length&&(d=ff(i,o,h-a)),e+=a,r+=a,t-=d,s-=d,t-e===0&&s-r===0)return Be;if(e===t){let M=Ve(e,[],0);for(;r<s;)M.removed.push(o[r++]);return[M]}else if(r===s)return[Ve(e,[],t-e)];let p=uf(hf(i,e,t,o,r,s)),f=[],m,y=e,O=r;for(let M=0;M<p.length;++M)switch(p[M]){case Pa:m!==void 0&&(f.push(m),m=void 0),y++,O++;break;case Ma:m===void 0&&(m=Ve(y,[],0)),m.addedCount++,y++,m.removed.push(o[O]),O++;break;case Xr:m===void 0&&(m=Ve(y,[],0)),m.addedCount++,y++;break;case Qr:m===void 0&&(m=Ve(y,[],0)),m.removed.push(o[O]),O++;break}return m!==void 0&&f.push(m),f}function gf(i,e,t,o){let r=Ve(e,t,o),s=!1,a=0;for(let d=0;d<i.length;d++){let h=i[d];if(h.index+=a,s)continue;let p=mf(r.index,r.index+r.removed.length,h.index,h.index+h.addedCount);if(p>=0){i.splice(d,1),d--,a-=h.addedCount-h.removed.length,r.addedCount+=h.addedCount-p;let f=r.removed.length+h.removed.length-p;if(!r.addedCount&&!f)s=!0;else{let m=h.removed;if(r.index<h.index){let y=r.removed.slice(0,h.index-r.index);La.apply(y,m),m=y}if(r.index+r.removed.length>h.index+h.addedCount){let y=r.removed.slice(h.index+h.addedCount-r.index);La.apply(m,y)}r.removed=m,h.index<r.index&&(r.index=h.index)}}else if(r.index<h.index){s=!0,i.splice(d,0,r),d++;let f=r.addedCount-r.removed.length;h.index+=f,a+=f}}s||i.push(r)}function bf(i){let e=[];for(let t=0,o=i.length;t<o;t++){let r=i[t];gf(e,r.index,r.removed,r.addedCount)}return e}function Ba(i,e){let t=[],o=bf(e);for(let r=0,s=o.length;r<s;++r){let a=o[r];if(a.addedCount===1&&a.removed.length===1){a.removed[0]!==i[a.index]&&t.push(a);continue}t=t.concat(Zr(i,a.index,a.index+a.addedCount,a.removed,0,a.removed.length))}return t}var Pa,Ma,Xr,Qr,La,_a=l(()=>{lt();Pa=0,Ma=1,Xr=2,Qr=3;La=Array.prototype.push});function Jr(i,e){let t=i.index,o=e.length;return t>o?t=o-i.addedCount:t<0&&(t=o+i.removed.length+t-i.addedCount),t<0&&(t=0),i.index=t,i}function Ha(){if(Va)return;Va=!0,C.setArrayObserverFactory(h=>new Kr(h));let i=Array.prototype;if(i.$fastPatch)return;Reflect.defineProperty(i,"$fastPatch",{value:1,enumerable:!1});let e=i.pop,t=i.push,o=i.reverse,r=i.shift,s=i.sort,a=i.splice,d=i.unshift;i.pop=function(){let h=this.length>0,p=e.apply(this,arguments),f=this.$fastController;return f!==void 0&&h&&f.addSplice(Ve(this.length,[p],0)),p},i.push=function(){let h=t.apply(this,arguments),p=this.$fastController;return p!==void 0&&p.addSplice(Jr(Ve(this.length-arguments.length,[],arguments.length),this)),h},i.reverse=function(){let h,p=this.$fastController;p!==void 0&&(p.flush(),h=this.slice());let f=o.apply(this,arguments);return p!==void 0&&p.reset(h),f},i.shift=function(){let h=this.length>0,p=r.apply(this,arguments),f=this.$fastController;return f!==void 0&&h&&f.addSplice(Ve(0,[p],0)),p},i.sort=function(){let h,p=this.$fastController;p!==void 0&&(p.flush(),h=this.slice());let f=s.apply(this,arguments);return p!==void 0&&p.reset(h),f},i.splice=function(){let h=a.apply(this,arguments),p=this.$fastController;return p!==void 0&&p.addSplice(Jr(Ve(+arguments[0],h,arguments.length>2?arguments.length-2:0),this)),h},i.unshift=function(){let h=d.apply(this,arguments),p=this.$fastController;return p!==void 0&&p.addSplice(Jr(Ve(0,[],arguments.length),this)),h}}var Va,Kr,za=l(()=>{_e();_a();Ai();Ke();Va=!1;Kr=class extends It{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}subscribe(e){this.flush(),super.subscribe(e)}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,v.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,v.queueUpdate(this))}flush(){let e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;let o=t===void 0?Ba(this.source,e):Zr(this.source,0,this.source.length,t,0,t.length);this.notify(o)}}});function X(i){return new Rt("fast-ref",en,i)}var en,Na=l(()=>{Ot();en=class{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}});var tn,Ua=l(()=>{tn=i=>typeof i=="function"});function ja(i){return i===void 0?vf:tn(i)?i:()=>i}function Yt(i,e,t){let o=tn(i)?i:()=>i,r=ja(e),s=ja(t);return(a,d)=>o(a,d)?r(a,d):s(a,d)}var vf,qa=l(()=>{Ua();vf=()=>null});function yf(i,e,t,o){i.bind(e[t],o)}function xf(i,e,t,o){let r=Object.create(o);r.index=t,r.length=e.length,i.bind(e[t],r)}var rb,on,ct,Wa=l(()=>{_e();Ke();za();lt();Ot();ro();rb=Object.freeze({positioning:!1,recycle:!0});on=class{constructor(e,t,o,r,s,a){this.location=e,this.itemsBinding=t,this.templateBinding=r,this.options=a,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=yf,this.itemsBindingObserver=C.binding(t,this,o),this.templateBindingObserver=C.binding(r,this,s),a.positioning&&(this.bindView=xf)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=Be;return}let t=this.itemsObserver,o=this.itemsObserver=C.getNotifier(this.items),r=t!==o;r&&t!==null&&t.unsubscribe(this),(r||e)&&o.subscribe(this)}updateViews(e){let t=this.childContext,o=this.views,r=this.bindView,s=this.items,a=this.template,d=this.options.recycle,h=[],p=0,f=0;for(let m=0,y=e.length;m<y;++m){let O=e[m],M=O.removed,K=0,ne=O.index,wt=ne+O.addedCount,Ct=o.splice(O.index,M.length),_p=f=h.length+Ct.length;for(;ne<wt;++ne){let aa=o[ne],Vp=aa?aa.firstChild:this.location,li;d&&f>0?(K<=_p&&Ct.length>0?(li=Ct[K],K++):(li=h[p],p++),f--):li=a.create(),o.splice(ne,0,li),r(li,s,ne,t),li.insertBefore(Vp)}Ct[K]&&h.push(...Ct.slice(K))}for(let m=p,y=h.length;m<y;++m)h[m].dispose();if(this.options.positioning)for(let m=0,y=o.length;m<y;++m){let O=o[m].context;O.length=y,O.index=m}}refreshAllViews(e=!1){let t=this.items,o=this.childContext,r=this.template,s=this.location,a=this.bindView,d=t.length,h=this.views,p=h.length;if((d===0||e||!this.options.recycle)&&(ui.disposeContiguousBatch(h),p=0),p===0){this.views=h=new Array(d);for(let f=0;f<d;++f){let m=r.create();a(m,t,f,o),h[f]=m,m.insertBefore(s)}}else{let f=0;for(;f<d;++f)if(f<p){let y=h[f];a(y,t,f,o)}else{let y=r.create();a(y,t,f,o),h.push(y),y.insertBefore(s)}let m=h.splice(f,p-f);for(f=0,d=m.length;f<d;++f)m[f].dispose()}}unbindAllViews(){let e=this.views;for(let t=0,o=e.length;t<o;++t)e[t].unbind()}},ct=class extends Et{constructor(e,t,o){super(),this.itemsBinding=e,this.templateBinding=t,this.options=o,this.createPlaceholder=v.createBlockPlaceholder,Ha(),this.isItemsBindingVolatile=C.isVolatileBinding(e),this.isTemplateBindingVolatile=C.isVolatileBinding(t)}createBehavior(e){return new on(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}});function Xt(i){return i?function(e,t,o){return e.nodeType===1&&e.matches(i)}:function(e,t,o){return e.nodeType===1}}var pi,uo=l(()=>{Ke();lt();pi=class{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){let t=this.options.property;this.shouldUpdate=C.getAccessors(e).some(o=>o.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(Be),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}});function J(i){return typeof i=="string"&&(i={property:i}),new Rt("fast-slotted",rn,i)}var rn,Ga=l(()=>{Ot();uo();rn=class extends pi{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}});function po(i){return typeof i=="string"&&(i={property:i}),new Rt("fast-children",nn,i)}var nn,Ya=l(()=>{Ot();uo();nn=class extends pi{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}});var g=l(()=>{lt();ka();Aa();co();jr();Gr();Vr();ao();Fa();Yr();ro();Ke();Ai();_e();oo();Ot();Na();qa();Wa();Ga();Ya();uo()});var _,He,ze,Hb,zb,me=l(()=>{g();_=class{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}},He=(i,e)=>k`
    <span
        part="end"
        ${X("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${X("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,ze=(i,e)=>k`
    <span
        part="start"
        ${X("startContainer")}
        class="${t=>e.start?"start":void 0}"
    >
        <slot
            name="start"
            ${X("start")}
            @slotchange="${t=>t.handleStartContentChange()}"
        >
            ${e.start||""}
        </slot>
    </span>
`,Hb=k`
    <span part="end" ${X("endContainer")}>
        <slot
            name="end"
            ${X("end")}
            @slotchange="${i=>i.handleEndContentChange()}"
        ></slot>
    </span>
`,zb=k`
    <span part="start" ${X("startContainer")}>
        <slot
            name="start"
            ${X("start")}
            @slotchange="${i=>i.handleStartContentChange()}"
        ></slot>
    </span>
`});var Xa=l(()=>{});function n(i,e,t,o){var r=arguments.length,s=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(i,e,t,o);else for(var d=i.length-1;d>=0;d--)(a=i[d])&&(s=(r<3?a(s):r>3?a(e,t,s):a(e,t))||s);return r>3&&s&&Object.defineProperty(e,t,s),s}var $=l(()=>{});function Li(i){let e=i.slice(),t=Object.keys(i),o=t.length,r;for(let s=0;s<o;++s)r=t[s],al(r)||(e[r]=i[r]);return e}function Za(i){return e=>Reflect.getOwnMetadata(i,e)}function bo(i){return function(e){let t=function(o,r,s){H.inject(t)(o,r,s)};return t.$isResolver=!0,t.resolve=function(o,r){return i(e,o,r)},t}}function $f(i){return function(e,t){t=!!t;let o=function(r,s,a){H.inject(o)(r,s,a)};return o.$isResolver=!0,o.resolve=function(r,s){return i(e,r,s,t)},o}}function un(i,e,t){H.inject(un)(i,e,t)}function rl(i,e){return e.getFactory(i).construct(e)}function Ka(i){return this.get(i)}function If(i,e){return e(i)}function go(i){return typeof i.register=="function"}function Sf(i){return go(i)&&typeof i.registerInRequestor=="boolean"}function el(i){return Sf(i)&&i.registerInRequestor}function Ef(i){return i.prototype!==void 0}function sl(i){return function(e,t,o){if(cn.has(o))return cn.get(o);let r=i(e,t,o);return cn.set(o,r),r}}function fo(i){if(i==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function tl(i,e,t){if(i instanceof we&&i.strategy===4){let o=i.state,r=o.length,s=new Array(r);for(;r--;)s[r]=o[r].resolve(e,t);return s}return[i.resolve(e,t)]}function ol(i){return typeof i=="object"&&i!==null||typeof i=="function"}function al(i){switch(typeof i){case"number":return i>=0&&(i|0)===i;case"string":{let e=mo[i];if(e!==void 0)return e;let t=i.length;if(t===0)return mo[i]=!1;let o=0;for(let r=0;r<t;++r)if(o=i.charCodeAt(r),r===0&&o===48&&t>1||o<48||o>57)return mo[i]=!1;return mo[i]=!0}default:return!1}}var sn,dn,wf,an,Qa,Ja,H,Cf,Wb,kf,Gb,Yb,Xb,Qb,Zb,we,hn,Tf,Rf,nl,ln,Pi,cn,Qt,il,Of,mo,vo=l(()=>{g();sn=new Map;"metadata"in Reflect||(Reflect.metadata=function(i,e){return function(t){Reflect.defineMetadata(i,e,t)}},Reflect.defineMetadata=function(i,e,t){let o=sn.get(t);o===void 0&&sn.set(t,o=new Map),o.set(i,e)},Reflect.getOwnMetadata=function(i,e){let t=sn.get(e);if(t!==void 0)return t.get(i)});dn=class{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,sl(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){let{container:o,key:r}=this;return this.container=this.key=void 0,o.registerResolver(r,new we(r,e,t))}};wf=Object.freeze({none(i){throw Error(`${i.toString()} not registered, did you forget to add @singleton()?`)},singleton(i){return new we(i,1,i)},transient(i){return new we(i,2,i)}}),an=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:wf.singleton})}),Qa=new Map;Ja=null,H=Object.freeze({createContainer(i){return new Pi(null,Object.assign({},an.default,i))},findResponsibleContainer(i){let e=i.$$container$$;return e&&e.responsibleForOwnerRequests?e:H.findParentContainer(i)},findParentContainer(i){let e=new CustomEvent(nl,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return i.dispatchEvent(e),e.detail.container||H.getOrCreateDOMContainer()},getOrCreateDOMContainer(i,e){return i?i.$$container$$||new Pi(i,Object.assign({},an.default,e,{parentLocator:H.findParentContainer})):Ja||(Ja=new Pi(null,Object.assign({},an.default,e,{parentLocator:()=>null})))},getDesignParamtypes:Za("design:paramtypes"),getAnnotationParamtypes:Za("di:paramtypes"),getOrCreateAnnotationParamTypes(i){let e=this.getAnnotationParamtypes(i);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],i),e},getDependencies(i){let e=Qa.get(i);if(e===void 0){let t=i.inject;if(t===void 0){let o=H.getDesignParamtypes(i),r=H.getAnnotationParamtypes(i);if(o===void 0)if(r===void 0){let s=Object.getPrototypeOf(i);typeof s=="function"&&s!==Function.prototype?e=Li(H.getDependencies(s)):e=[]}else e=Li(r);else if(r===void 0)e=Li(o);else{e=Li(o);let s=r.length,a;for(let p=0;p<s;++p)a=r[p],a!==void 0&&(e[p]=a);let d=Object.keys(r);s=d.length;let h;for(let p=0;p<s;++p)h=d[p],al(h)||(e[h]=r[h])}}else e=Li(t);Qa.set(i,e)}return e},defineProperty(i,e,t,o=!1){let r=`$di_${e}`;Reflect.defineProperty(i,e,{get:function(){let s=this[r];if(s===void 0&&(s=(this instanceof HTMLElement?H.findResponsibleContainer(this):H.getOrCreateDOMContainer()).get(t),this[r]=s,o&&this instanceof Dt)){let d=this.$fastController,h=()=>{let f=H.findResponsibleContainer(this).get(t),m=this[r];f!==m&&(this[r]=s,d.notify(e))};d.subscribe({handleChange:h},"isConnected")}return s}})},createInterface(i,e){let t=typeof i=="function"?i:e,o=typeof i=="string"?i:i&&"friendlyName"in i&&i.friendlyName||il,r=typeof i=="string"?!1:i&&"respectConnection"in i&&i.respectConnection||!1,s=function(a,d,h){if(a==null||new.target!==void 0)throw new Error(`No registration for interface: '${s.friendlyName}'`);if(d)H.defineProperty(a,d,s,r);else{let p=H.getOrCreateAnnotationParamTypes(a);p[h]=s}};return s.$isInterface=!0,s.friendlyName=o??"(anonymous)",t!=null&&(s.register=function(a,d){return t(new dn(a,d??s))}),s.toString=function(){return`InterfaceSymbol<${s.friendlyName}>`},s},inject(...i){return function(e,t,o){if(typeof o=="number"){let r=H.getOrCreateAnnotationParamTypes(e),s=i[0];s!==void 0&&(r[o]=s)}else if(t)H.defineProperty(e,t,i[0]);else{let r=o?H.getOrCreateAnnotationParamTypes(o.value):H.getOrCreateAnnotationParamTypes(e),s;for(let a=0;a<i.length;++a)s=i[a],s!==void 0&&(r[a]=s)}}},transient(i){return i.register=function(t){return Qt.transient(i,i).register(t)},i.registerInRequestor=!1,i},singleton(i,e=kf){return i.register=function(o){return Qt.singleton(i,i).register(o)},i.registerInRequestor=e.scoped,i}}),Cf=H.createInterface("Container");Wb=H.inject,kf={scoped:!1};Gb=$f((i,e,t,o)=>t.getAll(i,o)),Yb=bo((i,e,t)=>()=>t.get(i)),Xb=bo((i,e,t)=>{if(t.has(i,!0))return t.get(i)});un.$isResolver=!0;un.resolve=()=>{};Qb=bo((i,e,t)=>{let o=rl(i,e),r=new we(i,0,o);return t.registerResolver(i,r),o}),Zb=bo((i,e,t)=>rl(i,e));we=class{constructor(e,t,o){this.key=e,this.strategy=t,this.state=o,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{let o=e.getFactory(this.state);if(o===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return o.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,o,r;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(r=(o=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||o===void 0?void 0:o.call(t,e))!==null&&r!==void 0?r:null;default:return null}}};hn=class{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let o;return t===void 0?o=new this.Type(...this.dependencies.map(Ka,e)):o=new this.Type(...this.dependencies.map(Ka,e),...t),this.transformers==null?o:this.transformers.reduce(If,o)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}},Tf={$isResolver:!0,resolve(i,e){return e}};Rf=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),nl="__DI_LOCATE_PARENT__",ln=new Map,Pi=class i{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(Cf,Tf),e instanceof Node&&e.addEventListener(nl,o=>{o.composedPath()[0]!==this.owner&&(o.detail.container=this,o.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,o,r,s,a,d=this.context;for(let h=0,p=e.length;h<p;++h)if(t=e[h],!!ol(t))if(go(t))t.register(this,d);else if(Ef(t))Qt.singleton(t,t).register(this);else for(o=Object.keys(t),s=0,a=o.length;s<a;++s)r=t[o[s]],ol(r)&&(go(r)?r.register(this,d):this.register(r));return--this.registerDepth,this}registerResolver(e,t){fo(e);let o=this.resolvers,r=o.get(e);return r==null?o.set(e,t):r instanceof we&&r.strategy===4?r.state.push(t):o.set(e,new we(e,4,[r,t])),t}registerTransformer(e,t){let o=this.getResolver(e);if(o==null)return!1;if(o.getFactory){let r=o.getFactory(this);return r==null?!1:(r.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(fo(e),e.resolve!==void 0)return e;let o=this,r;for(;o!=null;)if(r=o.resolvers.get(e),r==null){if(o.parent==null){let s=el(e)?this:o;return t?this.jitRegister(e,s):null}o=o.parent}else return r;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(fo(e),e.$isResolver)return e.resolve(this,this);let t=this,o;for(;t!=null;)if(o=t.resolvers.get(e),o==null){if(t.parent==null){let r=el(e)?this:t;return o=this.jitRegister(e,r),o.resolve(t,this)}t=t.parent}else return o.resolve(t,this);throw new Error(`Unable to resolve key: ${String(e)}`)}getAll(e,t=!1){fo(e);let o=this,r=o,s;if(t){let a=Be;for(;r!=null;)s=r.resolvers.get(e),s!=null&&(a=a.concat(tl(s,r,o))),r=r.parent;return a}else for(;r!=null;)if(s=r.resolvers.get(e),s==null){if(r=r.parent,r==null)return Be}else return tl(s,r,o);return Be}getFactory(e){let t=ln.get(e);if(t===void 0){if(Of(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);ln.set(e,t=new hn(e,H.getDependencies(e)))}return t}registerFactory(e,t){ln.set(e,t)}createChild(e){return new i(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(Rf.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(go(e)){let o=e.register(t);if(!(o instanceof Object)||o.resolve==null){let r=t.resolvers.get(e);if(r!=null)return r;throw new Error("A valid resolver was not returned from the static register method")}return o}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{let o=this.config.defaultResolver(e,t);return t.resolvers.set(e,o),o}}}},cn=new WeakMap;Qt=Object.freeze({instance(i,e){return new we(i,0,e)},singleton(i,e){return new we(i,1,e)},transient(i,e){return new we(i,2,e)},callback(i,e){return new we(i,3,e)},cachedCallback(i,e){return new we(i,3,sl(e))},aliasTo(i,e){return new we(e,5,i)}});il="(anonymous)";Of=(function(){let i=new WeakMap,e=!1,t="",o=0;return function(r){return e=i.get(r),e===void 0&&(t=r.toString(),o=t.length,e=o>=29&&o<=100&&t.charCodeAt(o-1)===125&&t.charCodeAt(o-2)<=32&&t.charCodeAt(o-3)===93&&t.charCodeAt(o-4)===101&&t.charCodeAt(o-5)===100&&t.charCodeAt(o-6)===111&&t.charCodeAt(o-7)===99&&t.charCodeAt(o-8)===32&&t.charCodeAt(o-9)===101&&t.charCodeAt(o-10)===118&&t.charCodeAt(o-11)===105&&t.charCodeAt(o-12)===116&&t.charCodeAt(o-13)===97&&t.charCodeAt(o-14)===110&&t.charCodeAt(o-15)===88,i.set(r,e)),e}})(),mo={}});function ll(i){return`${i.toLowerCase()}:presentation`}var yo,wo,xo,Co=l(()=>{g();vo();yo=new Map,wo=Object.freeze({define(i,e,t){let o=ll(i);yo.get(o)===void 0?yo.set(o,e):yo.set(o,!1),t.register(Qt.instance(o,e))},forTag(i,e){let t=ll(i),o=yo.get(t);return o===!1?H.findResponsibleContainer(e).get(t):o||null}}),xo=class{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?oe.create(t):t instanceof oe?t:oe.create([t])}applyTo(e){let t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}});function Mi(i,e,t){return typeof i=="function"?i(e,t):i}var b,pn,T=l(()=>{$();g();Co();b=class i extends Dt{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=wo.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new pn(this===i?class extends i{}:this,e,t)}};n([u],b.prototype,"template",void 0);n([u],b.prototype,"styles",void 0);pn=class{constructor(e,t,o){this.type=e,this.elementDefinition=t,this.overrideDefinition=o,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){let o=this.definition,r=this.overrideDefinition,a=`${o.prefix||t.elementPrefix}-${o.baseName}`;t.tryDefineElement({name:a,type:this.type,baseClass:this.elementDefinition.baseClass,callback:d=>{let h=new xo(Mi(o.template,d,o),Mi(o.styles,d,o));d.definePresentation(h);let p=Mi(o.shadowOptions,d,o);d.shadowRootMode&&(p?r.shadowOptions||(p.mode=d.shadowRootMode):p!==null&&(p={mode:d.shadowRootMode})),d.defineElement({elementOptions:Mi(o.elementOptions,d,o),shadowOptions:p,attributes:Mi(o.attributes,d,o)})}})}}});function E(i,...e){let t=Fi.locate(i);e.forEach(o=>{Object.getOwnPropertyNames(o.prototype).forEach(s=>{s!=="constructor"&&Object.defineProperty(i.prototype,s,Object.getOwnPropertyDescriptor(o.prototype,s))}),Fi.locate(o).forEach(s=>t.push(s))})}var ue=l(()=>{g()});var dt,fn=l(()=>{$();g();T();me();ue();dt=class extends b{constructor(){super(...arguments),this.headinglevel=2,this.expanded=!1,this.clickHandler=e=>{this.expanded=!this.expanded,this.change()},this.change=()=>{this.$emit("change")}}};n([c({attribute:"heading-level",mode:"fromView",converter:R})],dt.prototype,"headinglevel",void 0);n([c({mode:"boolean"})],dt.prototype,"expanded",void 0);n([c],dt.prototype,"id",void 0);E(dt,_)});var cl=l(()=>{Xa();fn()});var dl=l(()=>{});var z,hl=l(()=>{z={horizontal:"horizontal",vertical:"vertical"}});function ul(i,e){let t=i.length;for(;t--;)if(e(i[t],t,i))return t;return-1}var pl=l(()=>{});var fl=l(()=>{});function ko(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}var ml=l(()=>{});var gl=l(()=>{});var bl=l(()=>{});var vl=l(()=>{});var mn=l(()=>{ml();gl();bl();vl()});function tt(...i){return i.every(e=>e instanceof HTMLElement)}function yl(i,e){return!i||!e||!tt(i)?void 0:Array.from(i.querySelectorAll(e)).filter(o=>o.offsetParent!==null)}function Df(){let i=document.querySelector('meta[property="csp-nonce"]');return i?i.getAttribute("content"):null}function xl(){if(typeof Zt=="boolean")return Zt;if(!ko())return Zt=!1,Zt;let i=document.createElement("style"),e=Df();e!==null&&i.setAttribute("nonce",e),document.head.appendChild(i);try{i.sheet.insertRule("foo:focus-visible {color:inherit}",0),Zt=!0}catch{Zt=!1}finally{document.head.removeChild(i)}return Zt}var Zt,wl=l(()=>{mn()});var gn,bn,ht,ut,vn,yn,Cl=l(()=>{gn="focus",bn="focusin",ht="focusout",ut="keydown",vn="resize",yn="scroll"});var kl=l(()=>{});var $l,W,be,ve,G,ee,Te,se,ae,Il,Tl,Sl,Se,At,El,Rl,Ft,Ol=l(()=>{(function(i){i[i.alt=18]="alt",i[i.arrowDown=40]="arrowDown",i[i.arrowLeft=37]="arrowLeft",i[i.arrowRight=39]="arrowRight",i[i.arrowUp=38]="arrowUp",i[i.back=8]="back",i[i.backSlash=220]="backSlash",i[i.break=19]="break",i[i.capsLock=20]="capsLock",i[i.closeBracket=221]="closeBracket",i[i.colon=186]="colon",i[i.colon2=59]="colon2",i[i.comma=188]="comma",i[i.ctrl=17]="ctrl",i[i.delete=46]="delete",i[i.end=35]="end",i[i.enter=13]="enter",i[i.equals=187]="equals",i[i.equals2=61]="equals2",i[i.equals3=107]="equals3",i[i.escape=27]="escape",i[i.forwardSlash=191]="forwardSlash",i[i.function1=112]="function1",i[i.function10=121]="function10",i[i.function11=122]="function11",i[i.function12=123]="function12",i[i.function2=113]="function2",i[i.function3=114]="function3",i[i.function4=115]="function4",i[i.function5=116]="function5",i[i.function6=117]="function6",i[i.function7=118]="function7",i[i.function8=119]="function8",i[i.function9=120]="function9",i[i.home=36]="home",i[i.insert=45]="insert",i[i.menu=93]="menu",i[i.minus=189]="minus",i[i.minus2=109]="minus2",i[i.numLock=144]="numLock",i[i.numPad0=96]="numPad0",i[i.numPad1=97]="numPad1",i[i.numPad2=98]="numPad2",i[i.numPad3=99]="numPad3",i[i.numPad4=100]="numPad4",i[i.numPad5=101]="numPad5",i[i.numPad6=102]="numPad6",i[i.numPad7=103]="numPad7",i[i.numPad8=104]="numPad8",i[i.numPad9=105]="numPad9",i[i.numPadDivide=111]="numPadDivide",i[i.numPadDot=110]="numPadDot",i[i.numPadMinus=109]="numPadMinus",i[i.numPadMultiply=106]="numPadMultiply",i[i.numPadPlus=107]="numPadPlus",i[i.openBracket=219]="openBracket",i[i.pageDown=34]="pageDown",i[i.pageUp=33]="pageUp",i[i.period=190]="period",i[i.print=44]="print",i[i.quote=222]="quote",i[i.scrollLock=145]="scrollLock",i[i.shift=16]="shift",i[i.space=32]="space",i[i.tab=9]="tab",i[i.tilde=192]="tilde",i[i.windowsLeft=91]="windowsLeft",i[i.windowsOpera=219]="windowsOpera",i[i.windowsRight=92]="windowsRight"})($l||($l={}));W="ArrowDown",be="ArrowLeft",ve="ArrowRight",G="ArrowUp",ee="Enter",Te="Escape",se="Home",ae="End",Il="F2",Tl="PageDown",Sl="PageUp",Se=" ",At="Tab",El="Backspace",Rl="Delete",Ft={ArrowDown:W,ArrowLeft:be,ArrowRight:ve,ArrowUp:G}});var D,xn=l(()=>{(function(i){i.ltr="ltr",i.rtl="rtl"})(D||(D={}))});function Dl(i,e,t){return t<i?e:t>e?i:t}function Lt(i,e,t){return Math.min(Math.max(t,i),e)}function Bi(i,e,t=0){return[e,t]=[e,t].sort((o,r)=>o-r),e<=i&&i<t}var Al=l(()=>{});function Fe(i=""){return`${i}${Af++}`}var Af,Fl=l(()=>{Af=0});var Ll=l(()=>{});var fi,Pl=l(()=>{mn();xn();fi=class i{static getScrollLeft(e,t){return t===D.rtl?i.getRtlScrollLeftConverter(e):e.scrollLeft}static setScrollLeft(e,t,o){if(o===D.rtl){i.setRtlScrollLeftConverter(e,t);return}e.scrollLeft=t}static initialGetRtlScrollConverter(e){return i.initializeRtlScrollConverters(),i.getRtlScrollLeftConverter(e)}static directGetRtlScrollConverter(e){return e.scrollLeft}static invertedGetRtlScrollConverter(e){return-Math.abs(e.scrollLeft)}static reverseGetRtlScrollConverter(e){return e.scrollLeft-(e.scrollWidth-e.clientWidth)}static initialSetRtlScrollConverter(e,t){i.initializeRtlScrollConverters(),i.setRtlScrollLeftConverter(e,t)}static directSetRtlScrollConverter(e,t){e.scrollLeft=t}static invertedSetRtlScrollConverter(e,t){e.scrollLeft=Math.abs(t)}static reverseSetRtlScrollConverter(e,t){let o=e.scrollWidth-e.clientWidth;e.scrollLeft=o+t}static initializeRtlScrollConverters(){if(!ko()){i.applyDirectScrollConverters();return}let e=i.getTestElement();document.body.appendChild(e),i.checkForScrollType(e),document.body.removeChild(e)}static checkForScrollType(e){i.isReverse(e)?i.applyReverseScrollConverters():i.isDirect(e)?i.applyDirectScrollConverters():i.applyInvertedScrollConverters()}static isReverse(e){return e.scrollLeft>0}static isDirect(e){return e.scrollLeft=-1,e.scrollLeft<0}static applyDirectScrollConverters(){i.setRtlScrollLeftConverter=i.directSetRtlScrollConverter,i.getRtlScrollLeftConverter=i.directGetRtlScrollConverter}static applyInvertedScrollConverters(){i.setRtlScrollLeftConverter=i.invertedSetRtlScrollConverter,i.getRtlScrollLeftConverter=i.invertedGetRtlScrollConverter}static applyReverseScrollConverters(){i.setRtlScrollLeftConverter=i.reverseSetRtlScrollConverter,i.getRtlScrollLeftConverter=i.reverseGetRtlScrollConverter}static getTestElement(){let e=document.createElement("div");return e.appendChild(document.createTextNode("ABCD")),e.dir="rtl",e.style.fontSize="14px",e.style.width="4px",e.style.height="1px",e.style.position="absolute",e.style.top="-1000px",e.style.overflow="scroll",e}};fi.getRtlScrollLeftConverter=fi.initialGetRtlScrollConverter;fi.setRtlScrollLeftConverter=fi.initialSetRtlScrollConverter});var Ml,Bl=l(()=>{(function(i){i.Canvas="Canvas",i.CanvasText="CanvasText",i.LinkText="LinkText",i.VisitedText="VisitedText",i.ActiveText="ActiveText",i.ButtonFace="ButtonFace",i.ButtonText="ButtonText",i.Field="Field",i.FieldText="FieldText",i.Highlight="Highlight",i.HighlightText="HighlightText",i.GrayText="GrayText"})(Ml||(Ml={}))});var A=l(()=>{hl();pl();fl();wl();Cl();kl();Ol();xn();Al();Fl();Ll();Pl();Bl()});var _l,$o,Vl=l(()=>{$();g();A();T();fn();_l={single:"single",multi:"multi"},$o=class extends b{constructor(){super(...arguments),this.expandmode=_l.multi,this.activeItemIndex=0,this.change=()=>{this.$emit("change",this.activeid)},this.setItems=()=>{var e;this.accordionItems.length!==0&&(this.accordionIds=this.getItemIds(),this.accordionItems.forEach((t,o)=>{t instanceof dt&&(t.addEventListener("change",this.activeItemChange),this.isSingleExpandMode()&&(this.activeItemIndex!==o?t.expanded=!1:t.expanded=!0));let r=this.accordionIds[o];t.setAttribute("id",typeof r!="string"?`accordion-${o+1}`:r),this.activeid=this.accordionIds[this.activeItemIndex],t.addEventListener("keydown",this.handleItemKeyDown),t.addEventListener("focus",this.handleItemFocus)}),this.isSingleExpandMode()&&((e=this.findExpandedItem())!==null&&e!==void 0?e:this.accordionItems[0]).setAttribute("aria-disabled","true"))},this.removeItemListeners=e=>{e.forEach((t,o)=>{t.removeEventListener("change",this.activeItemChange),t.removeEventListener("keydown",this.handleItemKeyDown),t.removeEventListener("focus",this.handleItemFocus)})},this.activeItemChange=e=>{if(e.defaultPrevented||e.target!==e.currentTarget)return;e.preventDefault();let t=e.target;this.activeid=t.getAttribute("id"),this.isSingleExpandMode()&&(this.resetItems(),t.expanded=!0,t.setAttribute("aria-disabled","true"),this.accordionItems.forEach(o=>{!o.hasAttribute("disabled")&&o.id!==this.activeid&&o.removeAttribute("aria-disabled")})),this.activeItemIndex=Array.from(this.accordionItems).indexOf(t),this.change()},this.handleItemKeyDown=e=>{if(e.target===e.currentTarget)switch(this.accordionIds=this.getItemIds(),e.key){case G:e.preventDefault(),this.adjust(-1);break;case W:e.preventDefault(),this.adjust(1);break;case se:this.activeItemIndex=0,this.focusItem();break;case ae:this.activeItemIndex=this.accordionItems.length-1,this.focusItem();break}},this.handleItemFocus=e=>{if(e.target===e.currentTarget){let t=e.target,o=this.activeItemIndex=Array.from(this.accordionItems).indexOf(t);this.activeItemIndex!==o&&o!==-1&&(this.activeItemIndex=o,this.activeid=this.accordionIds[this.activeItemIndex])}}}accordionItemsChanged(e,t){this.$fastController.isConnected&&(this.removeItemListeners(e),this.setItems())}findExpandedItem(){for(let e=0;e<this.accordionItems.length;e++)if(this.accordionItems[e].getAttribute("expanded")==="true")return this.accordionItems[e];return null}resetItems(){this.accordionItems.forEach((e,t)=>{e.expanded=!1})}getItemIds(){return this.accordionItems.map(e=>e.getAttribute("id"))}isSingleExpandMode(){return this.expandmode===_l.single}adjust(e){this.activeItemIndex=Dl(0,this.accordionItems.length-1,this.activeItemIndex+e),this.focusItem()}focusItem(){let e=this.accordionItems[this.activeItemIndex];e instanceof dt&&e.expandbutton.focus()}};n([c({attribute:"expand-mode"})],$o.prototype,"expandmode",void 0);n([u],$o.prototype,"accordionItems",void 0)});var Hl=l(()=>{dl();Vl()});var zl,Nl=l(()=>{g();me();zl=(i,e)=>k`
    <a
        class="control"
        part="control"
        download="${t=>t.download}"
        href="${t=>t.href}"
        hreflang="${t=>t.hreflang}"
        ping="${t=>t.ping}"
        referrerpolicy="${t=>t.referrerpolicy}"
        rel="${t=>t.rel}"
        target="${t=>t.target}"
        type="${t=>t.type}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${X("control")}
    >
        ${ze(i,e)}
        <span class="content" part="content">
            <slot ${J("defaultSlottedContent")}></slot>
        </span>
        ${He(i,e)}
    </a>
`});var F,_i=l(()=>{$();g();F=class{};n([c({attribute:"aria-atomic"})],F.prototype,"ariaAtomic",void 0);n([c({attribute:"aria-busy"})],F.prototype,"ariaBusy",void 0);n([c({attribute:"aria-controls"})],F.prototype,"ariaControls",void 0);n([c({attribute:"aria-current"})],F.prototype,"ariaCurrent",void 0);n([c({attribute:"aria-describedby"})],F.prototype,"ariaDescribedby",void 0);n([c({attribute:"aria-details"})],F.prototype,"ariaDetails",void 0);n([c({attribute:"aria-disabled"})],F.prototype,"ariaDisabled",void 0);n([c({attribute:"aria-errormessage"})],F.prototype,"ariaErrormessage",void 0);n([c({attribute:"aria-flowto"})],F.prototype,"ariaFlowto",void 0);n([c({attribute:"aria-haspopup"})],F.prototype,"ariaHaspopup",void 0);n([c({attribute:"aria-hidden"})],F.prototype,"ariaHidden",void 0);n([c({attribute:"aria-invalid"})],F.prototype,"ariaInvalid",void 0);n([c({attribute:"aria-keyshortcuts"})],F.prototype,"ariaKeyshortcuts",void 0);n([c({attribute:"aria-label"})],F.prototype,"ariaLabel",void 0);n([c({attribute:"aria-labelledby"})],F.prototype,"ariaLabelledby",void 0);n([c({attribute:"aria-live"})],F.prototype,"ariaLive",void 0);n([c({attribute:"aria-owns"})],F.prototype,"ariaOwns",void 0);n([c({attribute:"aria-relevant"})],F.prototype,"ariaRelevant",void 0);n([c({attribute:"aria-roledescription"})],F.prototype,"ariaRoledescription",void 0)});var Jt=l(()=>{_i();me()});var ye,Kt,wn=l(()=>{$();g();T();Jt();ue();ye=class extends b{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{var t;(t=this.control)===null||t===void 0||t.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}};n([c],ye.prototype,"download",void 0);n([c],ye.prototype,"href",void 0);n([c],ye.prototype,"hreflang",void 0);n([c],ye.prototype,"ping",void 0);n([c],ye.prototype,"referrerpolicy",void 0);n([c],ye.prototype,"rel",void 0);n([c],ye.prototype,"target",void 0);n([c],ye.prototype,"type",void 0);n([u],ye.prototype,"defaultSlottedContent",void 0);Kt=class{};n([c({attribute:"aria-expanded"})],Kt.prototype,"ariaExpanded",void 0);E(Kt,F);E(ye,_,Kt)});var Ul=l(()=>{Nl();wn()});var jl=l(()=>{});var Le,Pt=l(()=>{A();Le=i=>{let e=i.closest("[dir]");return e!==null&&e.dir==="rtl"?D.rtl:D.ltr}});var Io,ql=l(()=>{g();Io=class{constructor(){this.intersectionDetector=null,this.observedElements=new Map,this.requestPosition=(e,t)=>{var o;if(this.intersectionDetector!==null){if(this.observedElements.has(e)){(o=this.observedElements.get(e))===null||o===void 0||o.push(t);return}this.observedElements.set(e,[t]),this.intersectionDetector.observe(e)}},this.cancelRequestPosition=(e,t)=>{let o=this.observedElements.get(e);if(o!==void 0){let r=o.indexOf(t);r!==-1&&o.splice(r,1)}},this.initializeIntersectionDetector=()=>{We.IntersectionObserver&&(this.intersectionDetector=new IntersectionObserver(this.handleIntersection,{root:null,rootMargin:"0px",threshold:[0,1]}))},this.handleIntersection=e=>{if(this.intersectionDetector===null)return;let t=[],o=[];e.forEach(r=>{var s;(s=this.intersectionDetector)===null||s===void 0||s.unobserve(r.target);let a=this.observedElements.get(r.target);a!==void 0&&(a.forEach(d=>{let h=t.indexOf(d);h===-1&&(h=t.length,t.push(d),o.push([])),o[h].push(r)}),this.observedElements.delete(r.target))}),t.forEach((r,s)=>{r(o[s])})},this.initializeIntersectionDetector()}}});var te,Wl=l(()=>{$();g();A();T();Pt();ql();te=class i extends b{constructor(){super(...arguments),this.anchor="",this.viewport="",this.horizontalPositioningMode="uncontrolled",this.horizontalDefaultPosition="unset",this.horizontalViewportLock=!1,this.horizontalInset=!1,this.horizontalScaling="content",this.verticalPositioningMode="uncontrolled",this.verticalDefaultPosition="unset",this.verticalViewportLock=!1,this.verticalInset=!1,this.verticalScaling="content",this.fixedPlacement=!1,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.initialLayoutComplete=!1,this.resizeDetector=null,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.pendingPositioningUpdate=!1,this.pendingReset=!1,this.currentDirection=D.ltr,this.regionVisible=!1,this.forceUpdate=!1,this.updateThreshold=.5,this.update=()=>{this.pendingPositioningUpdate||this.requestPositionUpdates()},this.startObservers=()=>{this.stopObservers(),this.anchorElement!==null&&(this.requestPositionUpdates(),this.resizeDetector!==null&&(this.resizeDetector.observe(this.anchorElement),this.resizeDetector.observe(this)))},this.requestPositionUpdates=()=>{this.anchorElement===null||this.pendingPositioningUpdate||(i.intersectionService.requestPosition(this,this.handleIntersection),i.intersectionService.requestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&i.intersectionService.requestPosition(this.viewportElement,this.handleIntersection),this.pendingPositioningUpdate=!0)},this.stopObservers=()=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,i.intersectionService.cancelRequestPosition(this,this.handleIntersection),this.anchorElement!==null&&i.intersectionService.cancelRequestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&i.intersectionService.cancelRequestPosition(this.viewportElement,this.handleIntersection)),this.resizeDetector!==null&&this.resizeDetector.disconnect()},this.getViewport=()=>typeof this.viewport!="string"||this.viewport===""?document.documentElement:document.getElementById(this.viewport),this.getAnchor=()=>document.getElementById(this.anchor),this.handleIntersection=e=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,this.applyIntersectionEntries(e)&&this.updateLayout())},this.applyIntersectionEntries=e=>{let t=e.find(s=>s.target===this),o=e.find(s=>s.target===this.anchorElement),r=e.find(s=>s.target===this.viewportElement);return t===void 0||r===void 0||o===void 0?!1:!this.regionVisible||this.forceUpdate||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0||this.isRectDifferent(this.anchorRect,o.boundingClientRect)||this.isRectDifferent(this.viewportRect,r.boundingClientRect)||this.isRectDifferent(this.regionRect,t.boundingClientRect)?(this.regionRect=t.boundingClientRect,this.anchorRect=o.boundingClientRect,this.viewportElement===document.documentElement?this.viewportRect=new DOMRectReadOnly(r.boundingClientRect.x+document.documentElement.scrollLeft,r.boundingClientRect.y+document.documentElement.scrollTop,r.boundingClientRect.width,r.boundingClientRect.height):this.viewportRect=r.boundingClientRect,this.updateRegionOffset(),this.forceUpdate=!1,!0):!1},this.updateRegionOffset=()=>{this.anchorRect&&this.regionRect&&(this.baseHorizontalOffset=this.baseHorizontalOffset+(this.anchorRect.left-this.regionRect.left)+(this.translateX-this.baseHorizontalOffset),this.baseVerticalOffset=this.baseVerticalOffset+(this.anchorRect.top-this.regionRect.top)+(this.translateY-this.baseVerticalOffset))},this.isRectDifferent=(e,t)=>Math.abs(e.top-t.top)>this.updateThreshold||Math.abs(e.right-t.right)>this.updateThreshold||Math.abs(e.bottom-t.bottom)>this.updateThreshold||Math.abs(e.left-t.left)>this.updateThreshold,this.handleResize=e=>{this.update()},this.reset=()=>{this.pendingReset&&(this.pendingReset=!1,this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.viewportElement===null&&(this.viewportElement=this.getViewport()),this.currentDirection=Le(this),this.startObservers())},this.updateLayout=()=>{let e,t;if(this.horizontalPositioningMode!=="uncontrolled"){let s=this.getPositioningOptions(this.horizontalInset);if(this.horizontalDefaultPosition==="center")t="center";else if(this.horizontalDefaultPosition!=="unset"){let y=this.horizontalDefaultPosition;if(y==="start"||y==="end"){let O=Le(this);if(O!==this.currentDirection){this.currentDirection=O,this.initialize();return}this.currentDirection===D.ltr?y=y==="start"?"left":"right":y=y==="start"?"right":"left"}switch(y){case"left":t=this.horizontalInset?"insetStart":"start";break;case"right":t=this.horizontalInset?"insetEnd":"end";break}}let a=this.horizontalThreshold!==void 0?this.horizontalThreshold:this.regionRect!==void 0?this.regionRect.width:0,d=this.anchorRect!==void 0?this.anchorRect.left:0,h=this.anchorRect!==void 0?this.anchorRect.right:0,p=this.anchorRect!==void 0?this.anchorRect.width:0,f=this.viewportRect!==void 0?this.viewportRect.left:0,m=this.viewportRect!==void 0?this.viewportRect.right:0;(t===void 0||this.horizontalPositioningMode!=="locktodefault"&&this.getAvailableSpace(t,d,h,p,f,m)<a)&&(t=this.getAvailableSpace(s[0],d,h,p,f,m)>this.getAvailableSpace(s[1],d,h,p,f,m)?s[0]:s[1])}if(this.verticalPositioningMode!=="uncontrolled"){let s=this.getPositioningOptions(this.verticalInset);if(this.verticalDefaultPosition==="center")e="center";else if(this.verticalDefaultPosition!=="unset")switch(this.verticalDefaultPosition){case"top":e=this.verticalInset?"insetStart":"start";break;case"bottom":e=this.verticalInset?"insetEnd":"end";break}let a=this.verticalThreshold!==void 0?this.verticalThreshold:this.regionRect!==void 0?this.regionRect.height:0,d=this.anchorRect!==void 0?this.anchorRect.top:0,h=this.anchorRect!==void 0?this.anchorRect.bottom:0,p=this.anchorRect!==void 0?this.anchorRect.height:0,f=this.viewportRect!==void 0?this.viewportRect.top:0,m=this.viewportRect!==void 0?this.viewportRect.bottom:0;(e===void 0||this.verticalPositioningMode!=="locktodefault"&&this.getAvailableSpace(e,d,h,p,f,m)<a)&&(e=this.getAvailableSpace(s[0],d,h,p,f,m)>this.getAvailableSpace(s[1],d,h,p,f,m)?s[0]:s[1])}let o=this.getNextRegionDimension(t,e),r=this.horizontalPosition!==t||this.verticalPosition!==e;if(this.setHorizontalPosition(t,o),this.setVerticalPosition(e,o),this.updateRegionStyle(),!this.initialLayoutComplete){this.initialLayoutComplete=!0,this.requestPositionUpdates();return}this.regionVisible||(this.regionVisible=!0,this.style.removeProperty("pointer-events"),this.style.removeProperty("opacity"),this.classList.toggle("loaded",!0),this.$emit("loaded",this,{bubbles:!1})),this.updatePositionClasses(),r&&this.$emit("positionchange",this,{bubbles:!1})},this.updateRegionStyle=()=>{this.style.width=this.regionWidth,this.style.height=this.regionHeight,this.style.transform=`translate(${this.translateX}px, ${this.translateY}px)`},this.updatePositionClasses=()=>{this.classList.toggle("top",this.verticalPosition==="start"),this.classList.toggle("bottom",this.verticalPosition==="end"),this.classList.toggle("inset-top",this.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.verticalPosition==="insetEnd"),this.classList.toggle("vertical-center",this.verticalPosition==="center"),this.classList.toggle("left",this.horizontalPosition==="start"),this.classList.toggle("right",this.horizontalPosition==="end"),this.classList.toggle("inset-left",this.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.horizontalPosition==="insetEnd"),this.classList.toggle("horizontal-center",this.horizontalPosition==="center")},this.setHorizontalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let o=0;switch(this.horizontalScaling){case"anchor":case"fill":o=this.horizontalViewportLock?this.viewportRect.width:t.width,this.regionWidth=`${o}px`;break;case"content":o=this.regionRect.width,this.regionWidth="unset";break}let r=0;switch(e){case"start":this.translateX=this.baseHorizontalOffset-o,this.horizontalViewportLock&&this.anchorRect.left>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.right));break;case"insetStart":this.translateX=this.baseHorizontalOffset-o+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.right));break;case"insetEnd":this.translateX=this.baseHorizontalOffset,this.horizontalViewportLock&&this.anchorRect.left<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.left));break;case"end":this.translateX=this.baseHorizontalOffset+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.left));break;case"center":if(r=(this.anchorRect.width-o)/2,this.translateX=this.baseHorizontalOffset+r,this.horizontalViewportLock){let s=this.anchorRect.left+r,a=this.anchorRect.right-r;s<this.viewportRect.left&&!(a>this.viewportRect.right)?this.translateX=this.translateX-(s-this.viewportRect.left):a>this.viewportRect.right&&!(s<this.viewportRect.left)&&(this.translateX=this.translateX-(a-this.viewportRect.right))}break}this.horizontalPosition=e},this.setVerticalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let o=0;switch(this.verticalScaling){case"anchor":case"fill":o=this.verticalViewportLock?this.viewportRect.height:t.height,this.regionHeight=`${o}px`;break;case"content":o=this.regionRect.height,this.regionHeight="unset";break}let r=0;switch(e){case"start":this.translateY=this.baseVerticalOffset-o,this.verticalViewportLock&&this.anchorRect.top>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.bottom));break;case"insetStart":this.translateY=this.baseVerticalOffset-o+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.bottom));break;case"insetEnd":this.translateY=this.baseVerticalOffset,this.verticalViewportLock&&this.anchorRect.top<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.top));break;case"end":this.translateY=this.baseVerticalOffset+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.top));break;case"center":if(r=(this.anchorRect.height-o)/2,this.translateY=this.baseVerticalOffset+r,this.verticalViewportLock){let s=this.anchorRect.top+r,a=this.anchorRect.bottom-r;s<this.viewportRect.top&&!(a>this.viewportRect.bottom)?this.translateY=this.translateY-(s-this.viewportRect.top):a>this.viewportRect.bottom&&!(s<this.viewportRect.top)&&(this.translateY=this.translateY-(a-this.viewportRect.bottom))}}this.verticalPosition=e},this.getPositioningOptions=e=>e?["insetStart","insetEnd"]:["start","end"],this.getAvailableSpace=(e,t,o,r,s,a)=>{let d=t-s,h=a-(t+r);switch(e){case"start":return d;case"insetStart":return d+r;case"insetEnd":return h+r;case"end":return h;case"center":return Math.min(d,h)*2+r}},this.getNextRegionDimension=(e,t)=>{let o={height:this.regionRect!==void 0?this.regionRect.height:0,width:this.regionRect!==void 0?this.regionRect.width:0};return e!==void 0&&this.horizontalScaling==="fill"?o.width=this.getAvailableSpace(e,this.anchorRect!==void 0?this.anchorRect.left:0,this.anchorRect!==void 0?this.anchorRect.right:0,this.anchorRect!==void 0?this.anchorRect.width:0,this.viewportRect!==void 0?this.viewportRect.left:0,this.viewportRect!==void 0?this.viewportRect.right:0):this.horizontalScaling==="anchor"&&(o.width=this.anchorRect!==void 0?this.anchorRect.width:0),t!==void 0&&this.verticalScaling==="fill"?o.height=this.getAvailableSpace(t,this.anchorRect!==void 0?this.anchorRect.top:0,this.anchorRect!==void 0?this.anchorRect.bottom:0,this.anchorRect!==void 0?this.anchorRect.height:0,this.viewportRect!==void 0?this.viewportRect.top:0,this.viewportRect!==void 0?this.viewportRect.bottom:0):this.verticalScaling==="anchor"&&(o.height=this.anchorRect!==void 0?this.anchorRect.height:0),o},this.startAutoUpdateEventListeners=()=>{window.addEventListener(vn,this.update,{passive:!0}),window.addEventListener(yn,this.update,{passive:!0,capture:!0}),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.observe(this.viewportElement)},this.stopAutoUpdateEventListeners=()=>{window.removeEventListener(vn,this.update),window.removeEventListener(yn,this.update),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.unobserve(this.viewportElement)}}anchorChanged(){this.initialLayoutComplete&&(this.anchorElement=this.getAnchor())}viewportChanged(){this.initialLayoutComplete&&(this.viewportElement=this.getViewport())}horizontalPositioningModeChanged(){this.requestReset()}horizontalDefaultPositionChanged(){this.updateForAttributeChange()}horizontalViewportLockChanged(){this.updateForAttributeChange()}horizontalInsetChanged(){this.updateForAttributeChange()}horizontalThresholdChanged(){this.updateForAttributeChange()}horizontalScalingChanged(){this.updateForAttributeChange()}verticalPositioningModeChanged(){this.requestReset()}verticalDefaultPositionChanged(){this.updateForAttributeChange()}verticalViewportLockChanged(){this.updateForAttributeChange()}verticalInsetChanged(){this.updateForAttributeChange()}verticalThresholdChanged(){this.updateForAttributeChange()}verticalScalingChanged(){this.updateForAttributeChange()}fixedPlacementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}autoUpdateModeChanged(e,t){this.$fastController.isConnected&&this.initialLayoutComplete&&(e==="auto"&&this.stopAutoUpdateEventListeners(),t==="auto"&&this.startAutoUpdateEventListeners())}anchorElementChanged(){this.requestReset()}viewportElementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}connectedCallback(){super.connectedCallback(),this.autoUpdateMode==="auto"&&this.startAutoUpdateEventListeners(),this.initialize()}disconnectedCallback(){super.disconnectedCallback(),this.autoUpdateMode==="auto"&&this.stopAutoUpdateEventListeners(),this.stopObservers(),this.disconnectResizeDetector()}adoptedCallback(){this.initialize()}disconnectResizeDetector(){this.resizeDetector!==null&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.handleResize)}updateForAttributeChange(){this.$fastController.isConnected&&this.initialLayoutComplete&&(this.forceUpdate=!0,this.update())}initialize(){this.initializeResizeDetector(),this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.requestReset()}requestReset(){this.$fastController.isConnected&&this.pendingReset===!1&&(this.setInitialState(),v.queueUpdate(()=>this.reset()),this.pendingReset=!0)}setInitialState(){this.initialLayoutComplete=!1,this.regionVisible=!1,this.translateX=0,this.translateY=0,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.viewportRect=void 0,this.regionRect=void 0,this.anchorRect=void 0,this.verticalPosition=void 0,this.horizontalPosition=void 0,this.style.opacity="0",this.style.pointerEvents="none",this.forceUpdate=!1,this.style.position=this.fixedPlacement?"fixed":"absolute",this.updatePositionClasses(),this.updateRegionStyle()}};te.intersectionService=new Io;n([c],te.prototype,"anchor",void 0);n([c],te.prototype,"viewport",void 0);n([c({attribute:"horizontal-positioning-mode"})],te.prototype,"horizontalPositioningMode",void 0);n([c({attribute:"horizontal-default-position"})],te.prototype,"horizontalDefaultPosition",void 0);n([c({attribute:"horizontal-viewport-lock",mode:"boolean"})],te.prototype,"horizontalViewportLock",void 0);n([c({attribute:"horizontal-inset",mode:"boolean"})],te.prototype,"horizontalInset",void 0);n([c({attribute:"horizontal-threshold"})],te.prototype,"horizontalThreshold",void 0);n([c({attribute:"horizontal-scaling"})],te.prototype,"horizontalScaling",void 0);n([c({attribute:"vertical-positioning-mode"})],te.prototype,"verticalPositioningMode",void 0);n([c({attribute:"vertical-default-position"})],te.prototype,"verticalDefaultPosition",void 0);n([c({attribute:"vertical-viewport-lock",mode:"boolean"})],te.prototype,"verticalViewportLock",void 0);n([c({attribute:"vertical-inset",mode:"boolean"})],te.prototype,"verticalInset",void 0);n([c({attribute:"vertical-threshold"})],te.prototype,"verticalThreshold",void 0);n([c({attribute:"vertical-scaling"})],te.prototype,"verticalScaling",void 0);n([c({attribute:"fixed-placement",mode:"boolean"})],te.prototype,"fixedPlacement",void 0);n([c({attribute:"auto-update-mode"})],te.prototype,"autoUpdateMode",void 0);n([u],te.prototype,"anchorElement",void 0);n([u],te.prototype,"viewportElement",void 0);n([u],te.prototype,"initialLayoutComplete",void 0)});var Cn,kn,$n,In,Gl,Tn,Yl,Xl=l(()=>{Cn={horizontalDefaultPosition:"center",horizontalPositioningMode:"locktodefault",horizontalInset:!1,horizontalScaling:"anchor"},kn=Object.assign(Object.assign({},Cn),{verticalDefaultPosition:"top",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),$n=Object.assign(Object.assign({},Cn),{verticalDefaultPosition:"bottom",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),In=Object.assign(Object.assign({},Cn),{verticalPositioningMode:"dynamic",verticalInset:!1,verticalScaling:"content"}),Gl=Object.assign(Object.assign({},kn),{verticalScaling:"fill"}),Tn=Object.assign(Object.assign({},$n),{verticalScaling:"fill"}),Yl=Object.assign(Object.assign({},In),{verticalScaling:"fill"})});var Sn=l(()=>{jl();Wl();Xl()});var Ql=l(()=>{});var mi,Zl=l(()=>{$();g();T();mi=class extends b{connectedCallback(){super.connectedCallback(),this.shape||(this.shape="circle")}};n([c],mi.prototype,"fill",void 0);n([c],mi.prototype,"color",void 0);n([c],mi.prototype,"link",void 0);n([c],mi.prototype,"shape",void 0)});var Jl=l(()=>{Ql();Zl()});var To,Kl=l(()=>{g();To=(i,e)=>k`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`});var pt,ec=l(()=>{$();g();T();pt=class extends b{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;let e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}};n([c({attribute:"fill"})],pt.prototype,"fill",void 0);n([c({attribute:"color"})],pt.prototype,"color",void 0);n([c({mode:"boolean"})],pt.prototype,"circular",void 0)});var tc=l(()=>{Kl();ec()});var ic=l(()=>{});var ei,En=l(()=>{$();g();wn();Jt();ue();ei=class extends ye{constructor(){super(...arguments),this.separator=!0}};n([u],ei.prototype,"separator",void 0);E(ei,_,Kt)});var oc=l(()=>{ic();En()});var rc=l(()=>{});var Rn,nc=l(()=>{$();g();En();T();Rn=class extends b{slottedBreadcrumbItemsChanged(){if(this.$fastController.isConnected){if(this.slottedBreadcrumbItems===void 0||this.slottedBreadcrumbItems.length===0)return;let e=this.slottedBreadcrumbItems[this.slottedBreadcrumbItems.length-1];this.slottedBreadcrumbItems.forEach(t=>{let o=t===e;this.setItemSeparator(t,o),this.setAriaCurrent(t,o)})}}setItemSeparator(e,t){e instanceof ei&&(e.separator=!t)}findChildWithHref(e){var t,o;return e.childElementCount>0?e.querySelector("a[href]"):!((t=e.shadowRoot)===null||t===void 0)&&t.childElementCount?(o=e.shadowRoot)===null||o===void 0?void 0:o.querySelector("a[href]"):null}setAriaCurrent(e,t){let o=this.findChildWithHref(e);o===null&&e.hasAttribute("href")&&e instanceof ei?t?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current"):o!==null&&(t?o.setAttribute("aria-current","page"):o.removeAttribute("aria-current"))}};n([u],Rn.prototype,"slottedBreadcrumbItems",void 0)});var sc=l(()=>{rc();nc()});var ac,lc=l(()=>{g();me();ac=(i,e)=>k`
    <button
        class="control"
        part="control"
        ?autofocus="${t=>t.autofocus}"
        ?disabled="${t=>t.disabled}"
        form="${t=>t.formId}"
        formaction="${t=>t.formaction}"
        formenctype="${t=>t.formenctype}"
        formmethod="${t=>t.formmethod}"
        formnovalidate="${t=>t.formnovalidate}"
        formtarget="${t=>t.formtarget}"
        name="${t=>t.name}"
        type="${t=>t.type}"
        value="${t=>t.value}"
        aria-atomic="${t=>t.ariaAtomic}"
        aria-busy="${t=>t.ariaBusy}"
        aria-controls="${t=>t.ariaControls}"
        aria-current="${t=>t.ariaCurrent}"
        aria-describedby="${t=>t.ariaDescribedby}"
        aria-details="${t=>t.ariaDetails}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-errormessage="${t=>t.ariaErrormessage}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-flowto="${t=>t.ariaFlowto}"
        aria-haspopup="${t=>t.ariaHaspopup}"
        aria-hidden="${t=>t.ariaHidden}"
        aria-invalid="${t=>t.ariaInvalid}"
        aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
        aria-label="${t=>t.ariaLabel}"
        aria-labelledby="${t=>t.ariaLabelledby}"
        aria-live="${t=>t.ariaLive}"
        aria-owns="${t=>t.ariaOwns}"
        aria-pressed="${t=>t.ariaPressed}"
        aria-relevant="${t=>t.ariaRelevant}"
        aria-roledescription="${t=>t.ariaRoledescription}"
        ${X("control")}
    >
        ${ze(i,e)}
        <span class="content" part="content">
            <slot ${J("defaultSlottedContent")}></slot>
        </span>
        ${He(i,e)}
    </button>
`});function ce(i){let e=class extends i{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return hc}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){let t=this.proxy.labels,o=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),r=t?o.concat(Array.from(t)):o;return Object.freeze(r)}else return Be}valueChanged(t,o){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,o){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,o){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),v.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,o){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,o){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),v.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!hc)return null;let t=uc.get(this);return t||(t=this.attachInternals(),uc.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){super.disconnectedCallback(),this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,o,r){this.elementInternals?this.elementInternals.setValidity(t,o,r):typeof o=="string"&&this.proxy.setCustomValidity(o)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(o=>this.proxy.addEventListener(o,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",cc),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",cc)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(t){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage,t)}setFormValue(t,o){this.elementInternals&&this.elementInternals.setFormValue(t,o||t)}_keypressHandler(t){switch(t.key){case ee:if(this.form instanceof HTMLFormElement){let o=this.form.querySelector("[type=submit]");o?.click()}break}}stopPropagation(t){t.stopPropagation()}};return c({mode:"boolean"})(e.prototype,"disabled"),c({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),c({attribute:"current-value"})(e.prototype,"currentValue"),c(e.prototype,"name"),c({mode:"boolean"})(e.prototype,"required"),u(e.prototype,"value"),e}function gi(i){class e extends ce(i){}class t extends e{constructor(...r){super(r),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(r,s){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),r!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(r,s){this.checked=this.currentChecked}updateForm(){let r=this.checked?this.value:null;this.setFormValue(r,r)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return c({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),c({attribute:"current-checked",converter:Wt})(t.prototype,"currentChecked"),u(t.prototype,"defaultChecked"),u(t.prototype,"checked"),t}var cc,dc,hc,uc,Ee=l(()=>{g();A();cc="form-associated-proxy",dc="ElementInternals",hc=dc in window&&"setFormValue"in window[dc].prototype,uc=new WeakMap});var On,So,pc=l(()=>{Ee();T();On=class extends b{},So=class extends ce(On){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Re,bi,fc=l(()=>{$();g();Jt();ue();pc();Re=class extends So{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;let e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}validate(){super.validate(this.control)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(o=>{o.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(o=>{o.removeEventListener("click",this.handleClick)})}};n([c({mode:"boolean"})],Re.prototype,"autofocus",void 0);n([c({attribute:"form"})],Re.prototype,"formId",void 0);n([c],Re.prototype,"formaction",void 0);n([c],Re.prototype,"formenctype",void 0);n([c],Re.prototype,"formmethod",void 0);n([c({mode:"boolean"})],Re.prototype,"formnovalidate",void 0);n([c],Re.prototype,"formtarget",void 0);n([c],Re.prototype,"type",void 0);n([u],Re.prototype,"defaultSlottedContent",void 0);bi=class{};n([c({attribute:"aria-expanded"})],bi.prototype,"ariaExpanded",void 0);n([c({attribute:"aria-pressed"})],bi.prototype,"ariaPressed",void 0);E(bi,F);E(Re,_,bi)});var mc=l(()=>{lc();fc()});var Eo,Dn=l(()=>{Eo=class{constructor(e){if(this.dayFormat="numeric",this.weekdayFormat="long",this.monthFormat="long",this.yearFormat="numeric",this.date=new Date,e)for(let t in e){let o=e[t];t==="date"?this.date=this.getDateObject(o):this[t]=o}}getDateObject(e){if(typeof e=="string"){let t=e.split(/[/-]/);return t.length<3?new Date:new Date(parseInt(t[2],10),parseInt(t[0],10)-1,parseInt(t[1],10))}else if("day"in e&&"month"in e&&"year"in e){let{day:t,month:o,year:r}=e;return new Date(r,o-1,t)}return e}getDate(e=this.date,t={weekday:this.weekdayFormat,month:this.monthFormat,day:this.dayFormat,year:this.yearFormat},o=this.locale){let r=this.getDateObject(e);if(!r.getTime())return"";let s=Object.assign({timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},t);return new Intl.DateTimeFormat(o,s).format(r)}getDay(e=this.date.getDate(),t=this.dayFormat,o=this.locale){return this.getDate({month:1,day:e,year:2020},{day:t},o)}getMonth(e=this.date.getMonth()+1,t=this.monthFormat,o=this.locale){return this.getDate({month:e,day:2,year:2020},{month:t},o)}getYear(e=this.date.getFullYear(),t=this.yearFormat,o=this.locale){return this.getDate({month:2,day:2,year:e},{year:t},o)}getWeekday(e=0,t=this.weekdayFormat,o=this.locale){let r=`1-${e+1}-2017`;return this.getDate(r,{weekday:t},o)}getWeekdays(e=this.weekdayFormat,t=this.locale){return Array(7).fill(null).map((o,r)=>this.getWeekday(r,e,t))}}});var Pe,gc=l(()=>{$();g();A();T();Dn();Pe=class extends b{constructor(){super(...arguments),this.dateFormatter=new Eo,this.readonly=!1,this.locale="en-US",this.month=new Date().getMonth()+1,this.year=new Date().getFullYear(),this.dayFormat="numeric",this.weekdayFormat="short",this.monthFormat="long",this.yearFormat="numeric",this.minWeeks=0,this.disabledDates="",this.selectedDates="",this.oneDayInMs=864e5}localeChanged(){this.dateFormatter.locale=this.locale}dayFormatChanged(){this.dateFormatter.dayFormat=this.dayFormat}weekdayFormatChanged(){this.dateFormatter.weekdayFormat=this.weekdayFormat}monthFormatChanged(){this.dateFormatter.monthFormat=this.monthFormat}yearFormatChanged(){this.dateFormatter.yearFormat=this.yearFormat}getMonthInfo(e=this.month,t=this.year){let o=h=>new Date(h.getFullYear(),h.getMonth(),1).getDay(),r=h=>{let p=new Date(h.getFullYear(),h.getMonth()+1,1);return new Date(p.getTime()-this.oneDayInMs).getDate()},s=new Date(t,e-1),a=new Date(t,e),d=new Date(t,e-2);return{length:r(s),month:e,start:o(s),year:t,previous:{length:r(d),month:d.getMonth()+1,start:o(d),year:d.getFullYear()},next:{length:r(a),month:a.getMonth()+1,start:o(a),year:a.getFullYear()}}}getDays(e=this.getMonthInfo(),t=this.minWeeks){t=t>10?10:t;let{start:o,length:r,previous:s,next:a}=e,d=[],h=1-o;for(;h<r+1||d.length<t||d[d.length-1].length%7!==0;){let{month:p,year:f}=h<1?s:h>r?a:e,m=h<1?s.length+h:h>r?h-r:h,y=`${p}-${m}-${f}`,O=this.dateInString(y,this.disabledDates),M=this.dateInString(y,this.selectedDates),K={day:m,month:p,year:f,disabled:O,selected:M},ne=d[d.length-1];d.length===0||ne.length%7===0?d.push([K]):ne.push(K),h++}return d}dateInString(e,t){let o=t.split(",").map(r=>r.trim());return e=typeof e=="string"?e:`${e.getMonth()+1}-${e.getDate()}-${e.getFullYear()}`,o.some(r=>r===e)}getDayClassNames(e,t){let{day:o,month:r,year:s,disabled:a,selected:d}=e,h=t===`${r}-${o}-${s}`,p=this.month!==r;return["day",h&&"today",p&&"inactive",a&&"disabled",d&&"selected"].filter(Boolean).join(" ")}getWeekdayText(){let e=this.dateFormatter.getWeekdays().map(t=>({text:t}));if(this.weekdayFormat!=="long"){let t=this.dateFormatter.getWeekdays("long");e.forEach((o,r)=>{o.abbr=t[r]})}return e}handleDateSelect(e,t){e.preventDefault,this.$emit("dateselected",t)}handleKeydown(e,t){return e.key===ee&&this.handleDateSelect(e,t),!0}};n([c({mode:"boolean"})],Pe.prototype,"readonly",void 0);n([c],Pe.prototype,"locale",void 0);n([c({converter:R})],Pe.prototype,"month",void 0);n([c({converter:R})],Pe.prototype,"year",void 0);n([c({attribute:"day-format",mode:"fromView"})],Pe.prototype,"dayFormat",void 0);n([c({attribute:"weekday-format",mode:"fromView"})],Pe.prototype,"weekdayFormat",void 0);n([c({attribute:"month-format",mode:"fromView"})],Pe.prototype,"monthFormat",void 0);n([c({attribute:"year-format",mode:"fromView"})],Pe.prototype,"yearFormat",void 0);n([c({attribute:"min-weeks",converter:R})],Pe.prototype,"minWeeks",void 0);n([c({attribute:"disabled-dates"})],Pe.prototype,"disabledDates",void 0);n([c({attribute:"selected-dates"})],Pe.prototype,"selectedDates",void 0)});var ti,Ge,ft,Ro=l(()=>{ti={none:"none",default:"default",sticky:"sticky"},Ge={default:"default",columnHeader:"columnheader",rowHeader:"rowheader"},ft={default:"default",header:"header",stickyHeader:"sticky-header"}});var le,An=l(()=>{$();g();A();T();Ro();le=class extends b{constructor(){super(...arguments),this.rowType=ft.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new ct(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(ht,this.handleFocusout),this.addEventListener(ut,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(ht,this.handleFocusout),this.removeEventListener(ut,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case be:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case ve:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case se:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case ae:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===ft.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===ft.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}};n([c({attribute:"grid-template-columns"})],le.prototype,"gridTemplateColumns",void 0);n([c({attribute:"row-type"})],le.prototype,"rowType",void 0);n([u],le.prototype,"rowData",void 0);n([u],le.prototype,"columnDefinitions",void 0);n([u],le.prototype,"cellItemTemplate",void 0);n([u],le.prototype,"headerCellItemTemplate",void 0);n([u],le.prototype,"rowIndex",void 0);n([u],le.prototype,"isActiveRow",void 0);n([u],le.prototype,"activeCellItemTemplate",void 0);n([u],le.prototype,"defaultCellItemTemplate",void 0);n([u],le.prototype,"defaultHeaderCellItemTemplate",void 0);n([u],le.prototype,"cellElements",void 0)});function Ff(i){let e=i.tagFor(le);return k`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,o)=>o.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,o)=>o.parent.headerCellItemTemplate}"
    ></${e}>
`}var bc,vc=l(()=>{g();An();bc=(i,e)=>{let t=Ff(i),o=i.tagFor(le);return k`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>o}"
            :defaultRowItemTemplate="${t}"
            ${po({property:"rowElements",filter:Xt("[role=row]")})}
        >
            <slot></slot>
        </template>
    `}});var de,yc=l(()=>{$();g();A();T();Ro();de=class i extends b{constructor(){super(),this.noTabbing=!1,this.generateHeader=ti.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,o)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}let r=Math.max(0,Math.min(this.rowElements.length-1,e)),a=this.rowElements[r].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),d=Math.max(0,Math.min(a.length-1,t)),h=a[d];o&&this.scrollHeight!==this.clientHeight&&(r<this.focusRowIndex&&this.scrollTop>0||r>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&h.scrollIntoView({block:"center",inline:"center"}),h.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(o=>{o.addedNodes.forEach(r=>{r.nodeType===1&&r.getAttribute("role")==="row"&&(r.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,v.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){let t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,o)=>{let r=t;r.rowIndex=o,r.gridTemplateColumns=e,this.columnDefinitionsStale&&(r.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(o=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=i.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=i.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new ct(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(gn,this.handleFocus),this.addEventListener(ut,this.handleKeydown),this.addEventListener(ht,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),v.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(gn,this.handleFocus),this.removeEventListener(ut,this.handleKeydown),this.removeEventListener(ht,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;let t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t,o=this.rowElements.length-1,r=this.offsetHeight+this.scrollTop,s=this.rowElements[o];switch(e.key){case G:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case W:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case Sl:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){let a=this.rowElements[t];if(a.offsetTop<this.scrollTop){this.scrollTop=a.offsetTop+a.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case Tl:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=o||s.offsetTop+s.offsetHeight<=r){this.focusOnCell(o,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=o;t++){let a=this.rowElements[t];if(a.offsetTop+a.offsetHeight>r){let d=0;this.generateHeader===ti.sticky&&this.generatedHeader!==null&&(d=this.generatedHeader.clientHeight),this.scrollTop=a.offsetTop-d;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case se:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case ae:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,v.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==ti.none&&this.rowsData.length>0){let e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===ti.sticky?ft.stickyHeader:ft.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}};de.generateColumns=i=>Object.getOwnPropertyNames(i).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));n([c({attribute:"no-tabbing",mode:"boolean"})],de.prototype,"noTabbing",void 0);n([c({attribute:"generate-header"})],de.prototype,"generateHeader",void 0);n([c({attribute:"grid-template-columns"})],de.prototype,"gridTemplateColumns",void 0);n([u],de.prototype,"rowsData",void 0);n([u],de.prototype,"columnDefinitions",void 0);n([u],de.prototype,"rowItemTemplate",void 0);n([u],de.prototype,"cellItemTemplate",void 0);n([u],de.prototype,"headerCellItemTemplate",void 0);n([u],de.prototype,"focusRowIndex",void 0);n([u],de.prototype,"focusColumnIndex",void 0);n([u],de.prototype,"defaultRowItemTemplate",void 0);n([u],de.prototype,"rowElementTag",void 0);n([u],de.prototype,"rowElements",void 0)});var Lf,Pf,Ne,Fn=l(()=>{$();g();A();T();Ro();Lf=k`
    <template>
        ${i=>i.rowData===null||i.columnDefinition===null||i.columnDefinition.columnDataKey===null?null:i.rowData[i.columnDefinition.columnDataKey]}
    </template>
`,Pf=k`
    <template>
        ${i=>i.columnDefinition===null?null:i.columnDefinition.title===void 0?i.columnDefinition.columnDataKey:i.columnDefinition.title}
    </template>
`,Ne=class extends b{constructor(){super(...arguments),this.cellType=Ge.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(bn,this.handleFocusin),this.addEventListener(ht,this.handleFocusout),this.addEventListener(ut,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(bn,this.handleFocusin),this.removeEventListener(ht,this.handleFocusout),this.removeEventListener(ut,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case Ge.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===Ge.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===Ge.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case ee:case Il:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case Ge.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case Te:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case Ge.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=Pf.render(this,this);break;case void 0:case Ge.rowHeader:case Ge.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=Lf.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}};n([c({attribute:"cell-type"})],Ne.prototype,"cellType",void 0);n([c({attribute:"grid-column"})],Ne.prototype,"gridColumn",void 0);n([u],Ne.prototype,"rowData",void 0);n([u],Ne.prototype,"columnDefinition",void 0)});function Mf(i){let e=i.tagFor(Ne);return k`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,o)=>o.index+1}"
        :rowData="${(t,o)=>o.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function Bf(i){let e=i.tagFor(Ne);return k`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,o)=>o.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}var xc,wc=l(()=>{g();Fn();xc=(i,e)=>{let t=Mf(i),o=Bf(i);return k`
        <template
            role="row"
            class="${r=>r.rowType!=="default"?r.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${o}"
            ${po({property:"cellElements",filter:Xt('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${J("slottedCellElements")}></slot>
        </template>
    `}});var Cc,kc=l(()=>{g();Cc=(i,e)=>k`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `});var $c=l(()=>{vc();yc();wc();An();kc();Fn()});var _0,Ic=l(()=>{g();_0=k`
    <div
        class="title"
        part="title"
        aria-label="${i=>i.dateFormatter.getDate(`${i.month}-2-${i.year}`,{month:"long",year:"numeric"})}"
    >
        <span part="month">
            ${i=>i.dateFormatter.getMonth(i.month)}
        </span>
        <span part="year">${i=>i.dateFormatter.getYear(i.year)}</span>
    </div>
`});var Tc=l(()=>{gc();Ic();Dn()});var Sc=l(()=>{});var Ec=l(()=>{});var Rc=l(()=>{Sc();Ec()});var Oc,Dc=l(()=>{g();Oc=(i,e)=>k`
    <template
        role="checkbox"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        tabindex="${t=>t.disabled?null:0}"
        @keypress="${(t,o)=>t.keypressHandler(o.event)}"
        @click="${(t,o)=>t.clickHandler(o.event)}"
        class="${t=>t.readOnly?"readonly":""} ${t=>t.checked?"checked":""} ${t=>t.indeterminate?"indeterminate":""}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
            <slot name="indeterminate-indicator">
                ${e.indeterminateIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${J("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var Ln,Oo,Ac=l(()=>{Ee();T();Ln=class extends b{},Oo=class extends gi(Ln){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ii,Fc=l(()=>{$();g();A();Ac();ii=class extends Oo{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{this.readOnly||e.key===Se&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}};n([c({attribute:"readonly",mode:"boolean"})],ii.prototype,"readOnly",void 0);n([u],ii.prototype,"defaultSlottedNodes",void 0);n([u],ii.prototype,"indeterminate",void 0)});var Lc=l(()=>{Dc();Fc()});function Pn(i){return tt(i)&&(i.getAttribute("role")==="option"||i instanceof HTMLOptionElement)}var Ue,Mt,Mn=l(()=>{$();g();A();T();_i();me();ue();Ue=class extends b{constructor(e,t,o,r){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),o&&(this.defaultSelected=o),r&&(this.selected=r),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){let t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),C.notify(this,"value")}get value(){var e;return C.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}};n([u],Ue.prototype,"checked",void 0);n([u],Ue.prototype,"content",void 0);n([u],Ue.prototype,"defaultSelected",void 0);n([c({mode:"boolean"})],Ue.prototype,"disabled",void 0);n([c({attribute:"selected",mode:"boolean"})],Ue.prototype,"selectedAttribute",void 0);n([u],Ue.prototype,"selected",void 0);n([c({attribute:"value",mode:"fromView"})],Ue.prototype,"initialValue",void 0);Mt=class{};n([u],Mt.prototype,"ariaChecked",void 0);n([u],Mt.prototype,"ariaPosInSet",void 0);n([u],Mt.prototype,"ariaSelected",void 0);n([u],Mt.prototype,"ariaSetSize",void 0);E(Mt,F);E(Ue,_,Mt)});var pe,je,oi=l(()=>{$();g();A();T();Mn();_i();ue();pe=class i extends b{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return C.track(this,"options"),this._options}set options(e){this._options=e,C.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){let t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){let e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(o=>o.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){let o=e>t?-1:e<t?1:0,r=e+o,s=null;switch(o){case-1:{s=this.options.reduceRight((a,d,h)=>!a&&!d.disabled&&h<r?d:a,s);break}case 1:{s=this.options.reduce((a,d,h)=>!a&&!d.disabled&&h>r?d:a,s);break}}return this.options.indexOf(s)}handleChange(e,t){t==="selected"&&(i.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions())}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,i.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;let t=e.key;switch(t){case se:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case W:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case G:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case ae:{e.preventDefault(),this.selectLastOption();break}case At:return this.focusAndScrollOptionIntoView(),!0;case ee:case Te:return!0;case Se:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var o;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(!((o=this.options[this.selectedIndex])===null||o===void 0)&&o.disabled&&typeof e=="number"){let r=this.getSelectableIndex(e,t),s=r>-1?r:e;this.selectedIndex=s,t===s&&this.selectedIndexChanged(t,s);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var o;let r=t.filter(i.slottedOptionFilter);(o=this.options)===null||o===void 0||o.forEach(s=>{let a=C.getNotifier(s);a.unsubscribe(this,"selected"),s.selected=r.includes(s),a.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(o=>!o.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=ul(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(o=>o.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,o;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(o=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&o!==void 0?o:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((r,s)=>(Pn(s)&&r.push(s),r),[]);let o=`${this.options.length}`;this.options.forEach((r,s)=>{r.id||(r.id=Fe("option-")),r.ariaPosInSet=`${s+1}`,r.ariaSetSize=o}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){let o=this.getTypeaheadMatches();if(o.length){let r=this.options.indexOf(o[0]);r>-1&&(this.selectedIndex=r)}this.typeaheadExpired=!1}}};pe.slottedOptionFilter=i=>Pn(i)&&!i.hidden;pe.TYPE_AHEAD_TIMEOUT_MS=1e3;n([c({mode:"boolean"})],pe.prototype,"disabled",void 0);n([u],pe.prototype,"selectedIndex",void 0);n([u],pe.prototype,"selectedOptions",void 0);n([u],pe.prototype,"slottedOptions",void 0);n([u],pe.prototype,"typeaheadBuffer",void 0);je=class{};n([u],je.prototype,"ariaActiveDescendant",void 0);n([u],je.prototype,"ariaDisabled",void 0);n([u],je.prototype,"ariaExpanded",void 0);n([u],je.prototype,"ariaMultiSelectable",void 0);E(je,F);E(pe,je)});var it,Do=l(()=>{it={above:"above",below:"below"}});var Bn,Ao,Pc=l(()=>{Ee();oi();Bn=class extends pe{},Ao=class extends ce(Bn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Vi,_n=l(()=>{Vi={inline:"inline",list:"list",both:"both",none:"none"}});var mt,vi,Mc=l(()=>{$();g();A();oi();me();Do();ue();Pc();_n();mt=class extends Ao{constructor(){super(...arguments),this._value="",this.filteredOptions=[],this.filter="",this.forcedPosition=!1,this.listboxId=Fe("listbox-"),this.maxHeight=0,this.open=!1}formResetCallback(){super.formResetCallback(),this.setDefaultSelectedOption(),this.updateValue()}validate(){super.validate(this.control)}get isAutocompleteInline(){return this.autocomplete===Vi.inline||this.isAutocompleteBoth}get isAutocompleteList(){return this.autocomplete===Vi.list||this.isAutocompleteBoth}get isAutocompleteBoth(){return this.autocomplete===Vi.both}openChanged(){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),v.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}get options(){return C.track(this,"options"),this.filteredOptions.length?this.filteredOptions:this._options}set options(e){this._options=e,C.notify(this,"options")}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}get value(){return C.track(this,"value"),this._value}set value(e){var t,o,r;let s=`${this._value}`;if(this.$fastController.isConnected&&this.options){let a=this.options.findIndex(p=>p.text.toLowerCase()===e.toLowerCase()),d=(t=this.options[this.selectedIndex])===null||t===void 0?void 0:t.text,h=(o=this.options[a])===null||o===void 0?void 0:o.text;this.selectedIndex=d!==h?a:this.selectedIndex,e=((r=this.firstSelectedOption)===null||r===void 0?void 0:r.text)||e}s!==e&&(this._value=e,super.valueChanged(s,e),C.notify(this,"value"))}clickHandler(e){let t=e.target.closest("option,[role=option]");if(!(this.disabled||t?.disabled)){if(this.open){if(e.composedPath()[0]===this.control)return;t&&(this.selectedOptions=[t],this.control.value=t.text,this.clearSelectionRange(),this.updateValue(!0))}return this.open=!this.open,this.open&&this.control.focus(),!0}}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.value&&(this.initialValue=this.value)}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}filterOptions(){(!this.autocomplete||this.autocomplete===Vi.none)&&(this.filter="");let e=this.filter.toLowerCase();this.filteredOptions=this._options.filter(t=>t.text.toLowerCase().startsWith(this.filter.toLowerCase())),this.isAutocompleteList&&(!this.filteredOptions.length&&!e&&(this.filteredOptions=this._options),this._options.forEach(t=>{t.hidden=!this.filteredOptions.includes(t)}))}focusAndScrollOptionIntoView(){this.contains(document.activeElement)&&(this.control.focus(),this.firstSelectedOption&&requestAnimationFrame(()=>{var e;(e=this.firstSelectedOption)===null||e===void 0||e.scrollIntoView({block:"nearest"})}))}focusoutHandler(e){if(this.syncValue(),!this.open)return!0;let t=e.relatedTarget;if(this.isSameNode(t)){this.focus();return}(!this.options||!this.options.includes(t))&&(this.open=!1)}inputHandler(e){if(this.filter=this.control.value,this.filterOptions(),this.isAutocompleteInline||(this.selectedIndex=this.options.map(t=>t.text).indexOf(this.control.value)),e.inputType.includes("deleteContent")||!this.filter.length)return!0;this.isAutocompleteList&&!this.open&&(this.open=!0),this.isAutocompleteInline&&(this.filteredOptions.length?(this.selectedOptions=[this.filteredOptions[0]],this.selectedIndex=this.options.indexOf(this.firstSelectedOption),this.setInlineSelection()):this.selectedIndex=-1)}keydownHandler(e){let t=e.key;if(e.ctrlKey||e.shiftKey)return!0;switch(t){case"Enter":{this.syncValue(),this.isAutocompleteInline&&(this.filter=this.value),this.open=!1,this.clearSelectionRange();break}case"Escape":{if(this.isAutocompleteInline||(this.selectedIndex=-1),this.open){this.open=!1;break}this.value="",this.control.value="",this.filter="",this.filterOptions();break}case"Tab":{if(this.setInputToSelection(),!this.open)return!0;e.preventDefault(),this.open=!1;break}case"ArrowUp":case"ArrowDown":{if(this.filterOptions(),!this.open){this.open=!0;break}this.filteredOptions.length>0&&super.keydownHandler(e),this.isAutocompleteInline&&this.setInlineSelection();break}default:return!0}}keyupHandler(e){switch(e.key){case"ArrowLeft":case"ArrowRight":case"Backspace":case"Delete":case"Home":case"End":{this.filter=this.control.value,this.selectedIndex=-1,this.filterOptions();break}}}selectedIndexChanged(e,t){if(this.$fastController.isConnected){if(t=Lt(-1,this.options.length-1,t),t!==this.selectedIndex){this.selectedIndex=t;return}super.selectedIndexChanged(e,t)}}selectPreviousOption(){!this.disabled&&this.selectedIndex>=0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){if(this.$fastController.isConnected&&this.options){let e=this.options.findIndex(t=>t.getAttribute("selected")!==null||t.selected);this.selectedIndex=e,!this.dirtyValue&&this.firstSelectedOption&&(this.value=this.firstSelectedOption.text),this.setSelectedOptions()}}setInputToSelection(){this.firstSelectedOption&&(this.control.value=this.firstSelectedOption.text,this.control.focus())}setInlineSelection(){this.firstSelectedOption&&(this.setInputToSelection(),this.control.setSelectionRange(this.filter.length,this.control.value.length,"backward"))}syncValue(){var e;let t=this.selectedIndex>-1?(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text:this.control.value;this.updateValue(this.value!==t)}setPositioning(){let e=this.getBoundingClientRect(),o=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>o?it.above:it.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===it.above?~~e.top:~~o}selectedOptionsChanged(e,t){this.$fastController.isConnected&&this._options.forEach(o=>{o.selected=t.includes(o)})}slottedOptionsChanged(e,t){super.slottedOptionsChanged(e,t),this.updateValue()}updateValue(e){var t;this.$fastController.isConnected&&(this.value=((t=this.firstSelectedOption)===null||t===void 0?void 0:t.text)||this.control.value,this.control.value=this.value),e&&this.$emit("change")}clearSelectionRange(){let e=this.control.value.length;this.control.setSelectionRange(e,e)}};n([c({attribute:"autocomplete",mode:"fromView"})],mt.prototype,"autocomplete",void 0);n([u],mt.prototype,"maxHeight",void 0);n([c({attribute:"open",mode:"boolean"})],mt.prototype,"open",void 0);n([c],mt.prototype,"placeholder",void 0);n([c({attribute:"position"})],mt.prototype,"positionAttribute",void 0);n([u],mt.prototype,"position",void 0);vi=class{};n([u],vi.prototype,"ariaAutoComplete",void 0);n([u],vi.prototype,"ariaControls",void 0);E(vi,je);E(mt,_,vi)});var Bc=l(()=>{});var _c=l(()=>{Mc();_n();Bc()});function Hi(i){let e=i.parentElement;if(e)return e;{let t=i.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}var Fo=l(()=>{});function Vc(i,e){let t=e;for(;t!==null;){if(t===i)return!0;t=Hi(t)}return!1}var Hc=l(()=>{Fo()});function _f(i){return i instanceof Dt}var ot,zi,Hn,zn,Nn,Lo,Un,Bt,Vn,Vf,ri,jn=l(()=>{$();g();ot=document.createElement("div");zi=class{setProperty(e,t){v.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){v.queueUpdate(()=>this.target.removeProperty(e))}},Hn=class extends zi{constructor(e){super();let t=new CSSStyleSheet;t[so]=!0,this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(oe.create([t]))}},zn=class extends zi{constructor(){super();let e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}},Nn=class extends zi{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);let{sheet:e}=this.style;if(e){let t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}},Lo=class{constructor(e){this.store=new Map,this.target=null;let t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),C.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(let[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),v.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),v.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){let{sheet:o}=this.style;if(o){let r=o.insertRule(":host{}",o.cssRules.length);this.target=o.cssRules[r].style}else this.target=null}};n([u],Lo.prototype,"target",void 0);Un=class{constructor(e){this.target=e.style}setProperty(e,t){v.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){v.queueUpdate(()=>this.target.removeProperty(e))}},Bt=class i{setProperty(e,t){i.properties[e]=t;for(let o of i.roots.values())ri.getOrCreate(i.normalizeRoot(o)).setProperty(e,t)}removeProperty(e){delete i.properties[e];for(let t of i.roots.values())ri.getOrCreate(i.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){let{roots:t}=i;if(!t.has(e)){t.add(e);let o=ri.getOrCreate(this.normalizeRoot(e));for(let r in i.properties)o.setProperty(r,i.properties[r])}}static unregisterRoot(e){let{roots:t}=i;if(t.has(e)){t.delete(e);let o=ri.getOrCreate(i.normalizeRoot(e));for(let r in i.properties)o.removeProperty(r)}}static normalizeRoot(e){return e===ot?document:e}};Bt.roots=new Set;Bt.properties={};Vn=new WeakMap,Vf=v.supportsAdoptedStyleSheets?Hn:Lo,ri=Object.freeze({getOrCreate(i){if(Vn.has(i))return Vn.get(i);let e;return i===ot?e=new Bt:i instanceof Document?e=v.supportsAdoptedStyleSheets?new zn:new Nn:_f(i)?e=new Vf(i):e=new Un(i),Vn.set(i,e),e}})});function Hf(i){return Ye.from(i)}var Ye,qn,Wn,Gn,Ni,Ui,Ce,ji,Yn=l(()=>{$();g();Fo();Hc();jn();jn();Ye=class i extends Gt{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=i.uniqueId(),i.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new i({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return i.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){let t=Ce.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof i&&(t=this.alias(t)),Ce.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),Ce.existsFor(e)&&Ce.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(ot,e),this}subscribe(e,t){let o=this.getOrCreateSubscriberSet(t);t&&!Ce.existsFor(t)&&Ce.getOrCreate(t),o.has(e)||o.add(e)}unsubscribe(e,t){let o=this.subscribers.get(t||this);o&&o.has(e)&&o.delete(e)}notify(e){let t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(o=>o.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(o=>o.handleChange(t))}alias(e){return(t=>e.getValueFor(t))}};Ye.uniqueId=(()=>{let i=0;return()=>(i++,i.toString(16))})();Ye.tokensById=new Map;qn=class{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){let{token:t,target:o}=e;this.add(t,o)}add(e,t){ri.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(Ce.getOrCreate(t).get(e)))}remove(e,t){ri.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}},Wn=class{constructor(e,t,o){this.source=e,this.token=t,this.node=o,this.dependencies=new Set,this.observer=C.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){try{this.node.store.set(this.token,this.observer.observe(this.node.target,St))}catch(e){console.error(e)}}},Gn=class{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),C.getNotifier(this).notify(e.id))}get(e){return C.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e),C.getNotifier(this).notify(e.id)}all(){return this.values.entries()}},Ni=new WeakMap,Ui=new WeakMap,Ce=class i{constructor(e){this.target=e,this.store=new Gn,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,o)=>{let r=Ye.getTokenById(o);r&&(r.notify(this.target),this.updateCSSTokenReflection(t,r))}},Ni.set(e,this),C.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof Dt?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return Ni.get(e)||new i(e)}static existsFor(e){return Ni.has(e)}static findParent(e){if(ot!==e.target){let t=Hi(e.target);for(;t!==null;){if(Ni.has(t))return Ni.get(t);t=Hi(t)}return i.getOrCreate(ot)}return null}static findClosestAssignedNode(e,t){let o=t;do{if(o.has(e))return o;o=o.parent?o.parent:o.target!==ot?i.getOrCreate(ot):null}while(o!==null);return null}get parent(){return Ui.get(this)||null}updateCSSTokenReflection(e,t){if(Ye.isCSSDesignToken(t)){let o=this.parent,r=this.isReflecting(t);if(o){let s=o.get(t),a=e.get(t);s!==a&&!r?this.reflectToCSS(t):s===a&&r&&this.stopReflectToCSS(t)}else r||this.reflectToCSS(t)}}has(e){return this.assignedValues.has(e)}get(e){let t=this.store.get(e);if(t!==void 0)return t;let o=this.getRaw(e);if(o!==void 0)return this.hydrate(e,o),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=i.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){Ye.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),Ye.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);let t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){let e=i.findParent(this);e&&e.appendChild(this);for(let t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&Ui.get(this).removeChild(this);for(let e of this.bindingObservers.keys())this.tearDownBindingObserver(e)}appendChild(e){e.parent&&Ui.get(e).removeChild(e);let t=this.children.filter(o=>e.contains(o));Ui.set(e,this),this.children.push(e),t.forEach(o=>e.appendChild(o)),C.getNotifier(this.store).subscribe(e);for(let[o,r]of this.store.all())e.hydrate(o,this.bindingObservers.has(o)?this.getRaw(o):r),e.updateCSSTokenReflection(e.store,o)}removeChild(e){let t=this.children.indexOf(e);if(t!==-1&&this.children.splice(t,1),C.getNotifier(this.store).unsubscribe(e),e.parent!==this)return!1;let o=Ui.delete(e);for(let[r]of this.store.all())e.hydrate(r,e.getRaw(r)),e.updateCSSTokenReflection(e.store,r);return o}contains(e){return Vc(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),i.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),i.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){let o=Ye.getTokenById(t);o&&(this.hydrate(o,this.getRaw(o)),this.updateCSSTokenReflection(this.store,o))}hydrate(e,t){if(!this.has(e)){let o=this.bindingObservers.get(e);Ye.isDerivedDesignTokenValue(t)?o?o.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(o&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){let o=new Wn(t,e,this);return this.bindingObservers.set(e,o),o}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}};Ce.cssCustomPropertyReflector=new qn;n([u],Ce.prototype,"children",void 0);ji=Object.freeze({create:Hf,notifyConnection(i){return!i.isConnected||!Ce.existsFor(i)?!1:(Ce.getOrCreate(i).bind(),!0)},notifyDisconnection(i){return i.isConnected||!Ce.existsFor(i)?!1:(Ce.getOrCreate(i).unbind(),!0)},registerRoot(i=ot){Bt.registerRoot(i)},unregisterRoot(i=ot){Bt.unregisterRoot(i)}})});function zf(i,e,t){return typeof i=="string"?{name:i,type:e,callback:t}:i}var Xn,Qn,Po,yi,qi,Jn,Mo,Zn,zc=l(()=>{g();T();vo();Yn();Co();Xn=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),Qn=new Map,Po=new Map,yi=null,qi=H.createInterface(i=>i.cachedCallback(e=>(yi===null&&(yi=new Mo(null,e)),yi))),Jn=Object.freeze({tagFor(i){return Po.get(i)},responsibleFor(i){let e=i.$$designSystem$$;return e||H.findResponsibleContainer(i).get(qi)},getOrCreate(i){if(!i)return yi===null&&(yi=H.getOrCreateDOMContainer().get(qi)),yi;let e=i.$$designSystem$$;if(e)return e;let t=H.getOrCreateDOMContainer(i);if(t.has(qi,!1))return t.get(qi);{let o=new Mo(i,t);return t.register(Qt.instance(qi,o)),o}}});Mo=class{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>Xn.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){let t=this.container,o=[],r=this.disambiguate,s=this.shadowRootMode,a={elementPrefix:this.prefix,tryDefineElement(d,h,p){let f=zf(d,h,p),{name:m,callback:y,baseClass:O}=f,{type:M}=f,K=m,ne=Qn.get(K),wt=!0;for(;ne;){let Ct=r(K,M,ne);switch(Ct){case Xn.ignoreDuplicate:return;case Xn.definitionCallbackOnly:wt=!1,ne=void 0;break;default:K=Ct,ne=Qn.get(K);break}}wt&&((Po.has(M)||M===b)&&(M=class extends M{}),Qn.set(K,M),Po.set(M,K),O&&Po.set(O,K)),o.push(new Zn(t,K,M,s,y,wt))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&ji.registerRoot(this.designTokenRoot)),t.registerWithContext(a,...e);for(let d of o)d.callback(d),d.willDefine&&d.definition!==null&&d.definition.define();return this}},Zn=class{constructor(e,t,o,r,s,a){this.container=e,this.name=t,this.type=o,this.shadowRootMode=r,this.callback=s,this.willDefine=a,this.definition=null}definePresentation(e){wo.define(this.name,e,this.container)}defineElement(e){this.definition=new et(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return Jn.tagFor(e)}}});var Nc=l(()=>{});var Uc=l(()=>{zc();Co();Nc()});var jc=l(()=>{vo()});var qc=l(()=>{});var Gc,Nf,Yc,Wi,Kn,Uf,Xc,jf,qf,Wf,Gf,Yf,Xf,Wc,Qf,Zf,Qc,Jf,es,Kf,ts,is=l(()=>{Gc=["input","select","textarea","a[href]","button","[tabindex]:not(slot)","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])',"details>summary:first-of-type","details"],Nf=Gc.join(","),Yc=typeof Element>"u",Wi=Yc?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,Kn=!Yc&&Element.prototype.getRootNode?function(i){return i.getRootNode()}:function(i){return i.ownerDocument},Uf=function(e,t){return e.tabIndex<0&&(t||/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||e.isContentEditable)&&isNaN(parseInt(e.getAttribute("tabindex"),10))?0:e.tabIndex},Xc=function(e){return e.tagName==="INPUT"},jf=function(e){return Xc(e)&&e.type==="hidden"},qf=function(e){var t=e.tagName==="DETAILS"&&Array.prototype.slice.apply(e.children).some(function(o){return o.tagName==="SUMMARY"});return t},Wf=function(e,t){for(var o=0;o<e.length;o++)if(e[o].checked&&e[o].form===t)return e[o]},Gf=function(e){if(!e.name)return!0;var t=e.form||Kn(e),o=function(d){return t.querySelectorAll('input[type="radio"][name="'+d+'"]')},r;if(typeof window<"u"&&typeof window.CSS<"u"&&typeof window.CSS.escape=="function")r=o(window.CSS.escape(e.name));else try{r=o(e.name)}catch(a){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",a.message),!1}var s=Wf(r,e.form);return!s||s===e},Yf=function(e){return Xc(e)&&e.type==="radio"},Xf=function(e){return Yf(e)&&!Gf(e)},Wc=function(e){var t=e.getBoundingClientRect(),o=t.width,r=t.height;return o===0&&r===0},Qf=function(e,t){var o=t.displayCheck,r=t.getShadowRoot;if(getComputedStyle(e).visibility==="hidden")return!0;var s=Wi.call(e,"details>summary:first-of-type"),a=s?e.parentElement:e;if(Wi.call(a,"details:not([open]) *"))return!0;var d=Kn(e).host,h=d?.ownerDocument.contains(d)||e.ownerDocument.contains(e);if(!o||o==="full"){if(typeof r=="function"){for(var p=e;e;){var f=e.parentElement,m=Kn(e);if(f&&!f.shadowRoot&&r(f)===!0)return Wc(e);e.assignedSlot?e=e.assignedSlot:!f&&m!==e.ownerDocument?e=m.host:e=f}e=p}if(h)return!e.getClientRects().length}else if(o==="non-zero-area")return Wc(e);return!1},Zf=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName==="FIELDSET"&&t.disabled){for(var o=0;o<t.children.length;o++){var r=t.children.item(o);if(r.tagName==="LEGEND")return Wi.call(t,"fieldset[disabled] *")?!0:!r.contains(e)}return!0}t=t.parentElement}return!1},Qc=function(e,t){return!(t.disabled||jf(t)||Qf(t,e)||qf(t)||Zf(t))},Jf=function(e,t){return!(Xf(t)||Uf(t)<0||!Qc(e,t))},es=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return Wi.call(e,Nf)===!1?!1:Jf(t,e)},Kf=Gc.concat("iframe").join(","),ts=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return Wi.call(e,Kf)===!1?!1:Qc(t,e)}});var _t,Zc=l(()=>{$();g();A();is();T();_t=class i extends b{constructor(){super(...arguments),this.modal=!0,this.hidden=!1,this.trapFocus=!0,this.trapFocusChanged=()=>{this.$fastController.isConnected&&this.updateTrapFocus()},this.isTrappingFocus=!1,this.handleDocumentKeydown=e=>{if(!e.defaultPrevented&&!this.hidden)switch(e.key){case Te:this.dismiss(),e.preventDefault();break;case At:this.handleTabKeyDown(e);break}},this.handleDocumentFocus=e=>{!e.defaultPrevented&&this.shouldForceFocus(e.target)&&(this.focusFirstElement(),e.preventDefault())},this.handleTabKeyDown=e=>{if(!this.trapFocus||this.hidden)return;let t=this.getTabQueueBounds();if(t.length!==0){if(t.length===1){t[0].focus(),e.preventDefault();return}e.shiftKey&&e.target===t[0]?(t[t.length-1].focus(),e.preventDefault()):!e.shiftKey&&e.target===t[t.length-1]&&(t[0].focus(),e.preventDefault())}},this.getTabQueueBounds=()=>{let e=[];return i.reduceTabbableItems(e,this)},this.focusFirstElement=()=>{let e=this.getTabQueueBounds();e.length>0?e[0].focus():this.dialog instanceof HTMLElement&&this.dialog.focus()},this.shouldForceFocus=e=>this.isTrappingFocus&&!this.contains(e),this.shouldTrapFocus=()=>this.trapFocus&&!this.hidden,this.updateTrapFocus=e=>{let t=e===void 0?this.shouldTrapFocus():e;t&&!this.isTrappingFocus?(this.isTrappingFocus=!0,document.addEventListener("focusin",this.handleDocumentFocus),v.queueUpdate(()=>{this.shouldForceFocus(document.activeElement)&&this.focusFirstElement()})):!t&&this.isTrappingFocus&&(this.isTrappingFocus=!1,document.removeEventListener("focusin",this.handleDocumentFocus))}}dismiss(){this.$emit("dismiss"),this.$emit("cancel")}show(){this.hidden=!1}hide(){this.hidden=!0,this.$emit("close")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleDocumentKeydown),this.notifier=C.getNotifier(this),this.notifier.subscribe(this,"hidden"),this.updateTrapFocus()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleDocumentKeydown),this.updateTrapFocus(!1),this.notifier.unsubscribe(this,"hidden")}handleChange(e,t){t==="hidden"&&this.updateTrapFocus()}static reduceTabbableItems(e,t){return t.getAttribute("tabindex")==="-1"?e:es(t)||i.isFocusableFastElement(t)&&i.hasTabbableShadow(t)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(i.reduceTabbableItems,[])):e}static isFocusableFastElement(e){var t,o;return!!(!((o=(t=e.$fastController)===null||t===void 0?void 0:t.definition.shadowOptions)===null||o===void 0)&&o.delegatesFocus)}static hasTabbableShadow(e){var t,o;return Array.from((o=(t=e.shadowRoot)===null||t===void 0?void 0:t.querySelectorAll("*"))!==null&&o!==void 0?o:[]).some(r=>es(r))}};n([c({mode:"boolean"})],_t.prototype,"modal",void 0);n([c({mode:"boolean"})],_t.prototype,"hidden",void 0);n([c({attribute:"trap-focus",mode:"boolean"})],_t.prototype,"trapFocus",void 0);n([c({attribute:"aria-describedby"})],_t.prototype,"ariaDescribedby",void 0);n([c({attribute:"aria-labelledby"})],_t.prototype,"ariaLabelledby",void 0);n([c({attribute:"aria-label"})],_t.prototype,"ariaLabel",void 0)});var Jc=l(()=>{qc();Zc()});var Kc=l(()=>{});var Bo,ed=l(()=>{$();g();T();Bo=class extends b{connectedCallback(){super.connectedCallback(),this.setup()}disconnectedCallback(){super.disconnectedCallback(),this.details.removeEventListener("toggle",this.onToggle)}show(){this.details.open=!0}hide(){this.details.open=!1}toggle(){this.details.open=!this.details.open}setup(){this.onToggle=this.onToggle.bind(this),this.details.addEventListener("toggle",this.onToggle),this.expanded&&this.show()}onToggle(){this.expanded=this.details.open,this.$emit("toggle")}};n([c({mode:"boolean"})],Bo.prototype,"expanded",void 0);n([c],Bo.prototype,"title",void 0)});var td=l(()=>{Kc();ed()});var id,od=l(()=>{g();id=(i,e)=>k`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`});var _o,rd=l(()=>{_o={separator:"separator",presentation:"presentation"}});var xi,nd=l(()=>{$();g();A();T();rd();xi=class extends b{constructor(){super(...arguments),this.role=_o.separator,this.orientation=z.horizontal}};n([c],xi.prototype,"role",void 0);n([c],xi.prototype,"orientation",void 0)});var sd=l(()=>{od();nd()});var ad,ld=l(()=>{ad={next:"next",previous:"previous"}});var cd=l(()=>{});var Gi,dd=l(()=>{$();g();T();ld();Gi=class extends b{constructor(){super(...arguments),this.hiddenFromAT=!0,this.direction=ad.next}keyupHandler(e){if(!this.hiddenFromAT){let t=e.key;(t==="Enter"||t==="Space")&&this.$emit("click",e),t==="Escape"&&this.blur()}}};n([c({mode:"boolean"})],Gi.prototype,"disabled",void 0);n([c({attribute:"aria-hidden",converter:Wt})],Gi.prototype,"hiddenFromAT",void 0);n([c],Gi.prototype,"direction",void 0)});var hd=l(()=>{cd();dd()});var ud=l(()=>{Ee()});var pd=l(()=>{T()});var fd,md=l(()=>{g();me();fd=(i,e)=>k`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${ze(i,e)}
        <span class="content" part="content">
            <slot ${J("content")}></slot>
        </span>
        ${He(i,e)}
    </template>
`});var gd=l(()=>{Mn();md()});var ni,os=l(()=>{$();g();A();oi();ni=class extends pe{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var o,r;this.ariaActiveDescendant=(r=(o=this.options[t])===null||o===void 0?void 0:o.id)!==null&&r!==void 0?r:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;let e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,o)=>{t.checked=Bi(o,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,o)=>{t.checked=Bi(o,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,o)=>{t.checked=Bi(o,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,o)=>{t.checked=Bi(o,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);let o=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!o||o.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(o),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;let{key:t,shiftKey:o}=e;switch(this.shouldSkipFocus=!1,t){case se:{this.checkFirstOption(o);return}case W:{this.checkNextOption(o);return}case G:{this.checkPreviousOption(o);return}case ae:{this.checkLastOption(o);return}case At:return this.focusAndScrollOptionIntoView(),!0;case Te:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Se:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var o;this.ariaMultiSelectable=t?"true":null,(o=this.options)===null||o===void 0||o.forEach(r=>{r.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var o;let r=Math.max(0,parseInt((o=t?.toFixed())!==null&&o!==void 0?o:"",10));r!==t&&v.queueUpdate(()=>{this.size=r})}toggleSelectedForAllCheckedOptions(){let e=this.checkedOptions.filter(o=>!o.disabled),t=!e.every(o=>o.selected);e.forEach(o=>o.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){let o=this.getTypeaheadMatches(),r=this.options.indexOf(o[0]);r>-1&&(this.activeIndex=r,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}};n([u],ni.prototype,"activeIndex",void 0);n([c({mode:"boolean"})],ni.prototype,"multiple",void 0);n([c({converter:R})],ni.prototype,"size",void 0)});var bd=l(()=>{});var vd=l(()=>{oi();os();bd()});var wi,yd=l(()=>{$();A();g();T();wi=class extends b{constructor(){super(...arguments),this.optionElements=[]}menuElementsChanged(){this.updateOptions()}headerElementsChanged(){this.updateOptions()}footerElementsChanged(){this.updateOptions()}updateOptions(){this.optionElements.splice(0,this.optionElements.length),this.addSlottedListItems(this.headerElements),this.addSlottedListItems(this.menuElements),this.addSlottedListItems(this.footerElements),this.$emit("optionsupdated",{bubbles:!1})}addSlottedListItems(e){e!==void 0&&e.forEach(t=>{t.nodeType===1&&t.getAttribute("role")==="listitem"&&(t.id=t.id||Fe("option-"),this.optionElements.push(t))})}};n([u],wi.prototype,"menuElements",void 0);n([u],wi.prototype,"headerElements",void 0);n([u],wi.prototype,"footerElements",void 0);n([u],wi.prototype,"suggestionsAvailableText",void 0)});var em,Ci,rs=l(()=>{$();g();T();em=k`
    <template>
        ${i=>i.value}
    </template>
`,Ci=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){super.disconnectedCallback(),this.disconnectView()}handleClick(e){return e.defaultPrevented||this.handleInvoked(),!1}handleInvoked(){this.$emit("pickeroptioninvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:em.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};n([c({attribute:"value"})],Ci.prototype,"value",void 0);n([u],Ci.prototype,"contentsTemplate",void 0)});var xd=l(()=>{});var tm,ki,ns=l(()=>{$();g();A();T();tm=k`
    <template>
        ${i=>i.value}
    </template>
`,ki=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){this.disconnectView(),super.disconnectedCallback()}handleKeyDown(e){return e.defaultPrevented?!1:e.key===ee?(this.handleInvoke(),!1):!0}handleClick(e){return e.defaultPrevented||this.handleInvoke(),!1}handleInvoke(){this.$emit("pickeriteminvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:tm.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};n([c({attribute:"value"})],ki.prototype,"value",void 0);n([u],ki.prototype,"contentsTemplate",void 0)});var wd=l(()=>{});var ss,Vo,Cd=l(()=>{Ee();T();ss=class extends b{},Vo=class extends ce(ss){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var im,L,kd=l(()=>{$();g();A();Sn();rs();ns();Cd();im=k`
    <input
        slot="input-region"
        role="combobox"
        type="text"
        autocapitalize="off"
        autocomplete="off"
        haspopup="list"
        aria-label="${i=>i.label}"
        aria-labelledby="${i=>i.labelledBy}"
        placeholder="${i=>i.placeholder}"
        ${X("inputElement")}
    ></input>
`,L=class extends Vo{constructor(){super(...arguments),this.selection="",this.filterSelected=!0,this.filterQuery=!0,this.noSuggestionsText="No suggestions available",this.suggestionsAvailableText="Suggestions available",this.loadingText="Loading suggestions",this.menuPlacement="bottom-fill",this.showLoading=!1,this.optionsList=[],this.filteredOptionsList=[],this.flyoutOpen=!1,this.menuFocusIndex=-1,this.showNoOptions=!1,this.selectedItems=[],this.inputElementView=null,this.handleTextInput=e=>{this.query=this.inputElement.value},this.handleInputClick=e=>{e.preventDefault(),this.toggleFlyout(!0)},this.setRegionProps=()=>{if(this.flyoutOpen){if(this.region===null||this.region===void 0){v.queueUpdate(this.setRegionProps);return}this.region.anchorElement=this.inputElement}},this.configLookup={top:kn,bottom:$n,tallest:In,"top-fill":Gl,"bottom-fill":Tn,"tallest-fill":Yl}}selectionChanged(){this.$fastController.isConnected&&(this.handleSelectionChange(),this.proxy instanceof HTMLInputElement&&(this.proxy.value=this.selection,this.validate()))}optionsChanged(){this.optionsList=this.options.split(",").map(e=>e.trim()).filter(e=>e!=="")}menuPlacementChanged(){this.$fastController.isConnected&&this.updateMenuConfig()}showLoadingChanged(){this.$fastController.isConnected&&v.queueUpdate(()=>{this.setFocusedOption(0)})}listItemTemplateChanged(){this.updateListItemTemplate()}defaultListItemTemplateChanged(){this.updateListItemTemplate()}menuOptionTemplateChanged(){this.updateOptionTemplate()}defaultMenuOptionTemplateChanged(){this.updateOptionTemplate()}optionsListChanged(){this.updateFilteredOptions()}queryChanged(){this.$fastController.isConnected&&(this.inputElement.value!==this.query&&(this.inputElement.value=this.query),this.updateFilteredOptions(),this.$emit("querychange",{bubbles:!1}))}filteredOptionsListChanged(){this.$fastController.isConnected&&(this.showNoOptions=this.filteredOptionsList.length===0&&this.menuElement.querySelectorAll('[role="listitem"]').length===0,this.setFocusedOption(this.showNoOptions?-1:0))}flyoutOpenChanged(){this.flyoutOpen?(v.queueUpdate(this.setRegionProps),this.$emit("menuopening",{bubbles:!1})):this.$emit("menuclosing",{bubbles:!1})}showNoOptionsChanged(){this.$fastController.isConnected&&v.queueUpdate(()=>{this.setFocusedOption(0)})}connectedCallback(){super.connectedCallback(),this.listElement=document.createElement(this.selectedListTag),this.appendChild(this.listElement),this.itemsPlaceholderElement=document.createComment(""),this.listElement.append(this.itemsPlaceholderElement),this.inputElementView=im.render(this,this.listElement);let e=this.menuTag.toUpperCase();this.menuElement=Array.from(this.children).find(t=>t.tagName===e),this.menuElement===void 0&&(this.menuElement=document.createElement(this.menuTag),this.appendChild(this.menuElement)),this.menuElement.id===""&&(this.menuElement.id=Fe("listbox-")),this.menuId=this.menuElement.id,this.optionsPlaceholder=document.createComment(""),this.menuElement.append(this.optionsPlaceholder),this.updateMenuConfig(),v.queueUpdate(()=>this.initialize())}disconnectedCallback(){super.disconnectedCallback(),this.toggleFlyout(!1),this.inputElement.removeEventListener("input",this.handleTextInput),this.inputElement.removeEventListener("click",this.handleInputClick),this.inputElementView!==null&&(this.inputElementView.dispose(),this.inputElementView=null)}focus(){this.inputElement.focus()}initialize(){this.updateListItemTemplate(),this.updateOptionTemplate(),this.itemsRepeatBehavior=new ct(e=>e.selectedItems,e=>e.activeListItemTemplate,{positioning:!0}).createBehavior(this.itemsPlaceholderElement),this.inputElement.addEventListener("input",this.handleTextInput),this.inputElement.addEventListener("click",this.handleInputClick),this.$fastController.addBehaviors([this.itemsRepeatBehavior]),this.menuElement.suggestionsAvailableText=this.suggestionsAvailableText,this.menuElement.addEventListener("optionsupdated",this.handleMenuOptionsUpdated),this.optionsRepeatBehavior=new ct(e=>e.filteredOptionsList,e=>e.activeMenuOptionTemplate,{positioning:!0}).createBehavior(this.optionsPlaceholder),this.$fastController.addBehaviors([this.optionsRepeatBehavior]),this.handleSelectionChange()}toggleFlyout(e){if(this.flyoutOpen!==e){if(e&&document.activeElement===this.inputElement){this.flyoutOpen=e,v.queueUpdate(()=>{this.menuElement!==void 0?this.setFocusedOption(0):this.disableMenu()});return}this.flyoutOpen=!1,this.disableMenu()}}handleMenuOptionsUpdated(e){e.preventDefault(),this.flyoutOpen&&this.setFocusedOption(0)}handleKeyDown(e){if(e.defaultPrevented)return!1;switch(e.key){case W:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.min(this.menuFocusIndex+1,this.menuElement.optionElements.length-1):0;this.setFocusedOption(t)}return!1}case G:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.max(this.menuFocusIndex-1,0):0;this.setFocusedOption(t)}return!1}case Te:return this.toggleFlyout(!1),!1;case ee:return this.menuFocusIndex!==-1&&this.menuElement.optionElements.length>this.menuFocusIndex&&this.menuElement.optionElements[this.menuFocusIndex].click(),!1;case ve:return document.activeElement!==this.inputElement?(this.incrementFocusedItem(1),!1):!0;case be:return this.inputElement.selectionStart===0?(this.incrementFocusedItem(-1),!1):!0;case Rl:case El:{if(document.activeElement===null)return!0;if(document.activeElement===this.inputElement)return this.inputElement.selectionStart===0?(this.selection=this.selectedItems.slice(0,this.selectedItems.length-1).toString(),this.toggleFlyout(!1),!1):!0;let t=Array.from(this.listElement.children),o=t.indexOf(document.activeElement);return o>-1?(this.selection=this.selectedItems.splice(o,1).toString(),v.queueUpdate(()=>{t[Math.min(t.length,o)].focus()}),!1):!0}}return this.toggleFlyout(!0),!0}handleFocusIn(e){return!1}handleFocusOut(e){return(this.menuElement===void 0||!this.menuElement.contains(e.relatedTarget))&&this.toggleFlyout(!1),!1}handleSelectionChange(){this.selectedItems.toString()!==this.selection&&(this.selectedItems=this.selection===""?[]:this.selection.split(","),this.updateFilteredOptions(),v.queueUpdate(()=>{this.checkMaxItems()}),this.$emit("selectionchange",{bubbles:!1}))}handleRegionLoaded(e){v.queueUpdate(()=>{this.setFocusedOption(0),this.$emit("menuloaded",{bubbles:!1})})}checkMaxItems(){if(this.inputElement!==void 0)if(this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected){if(document.activeElement===this.inputElement){let e=Array.from(this.listElement.querySelectorAll("[role='listitem']"));e[e.length-1].focus()}this.inputElement.hidden=!0}else this.inputElement.hidden=!1}handleItemInvoke(e){if(e.defaultPrevented)return!1;if(e.target instanceof ki){let o=Array.from(this.listElement.querySelectorAll("[role='listitem']")).indexOf(e.target);if(o!==-1){let r=this.selectedItems.slice();r.splice(o,1),this.selection=r.toString(),v.queueUpdate(()=>this.incrementFocusedItem(0))}return!1}return!0}handleOptionInvoke(e){return e.defaultPrevented?!1:e.target instanceof Ci?(e.target.value!==void 0&&(this.selection=`${this.selection}${this.selection===""?"":","}${e.target.value}`),this.inputElement.value="",this.query="",this.inputElement.focus(),this.toggleFlyout(!1),!1):!0}incrementFocusedItem(e){if(this.selectedItems.length===0){this.inputElement.focus();return}let t=Array.from(this.listElement.querySelectorAll("[role='listitem']"));if(document.activeElement!==null){let o=t.indexOf(document.activeElement);o===-1&&(o=t.length);let r=Math.min(t.length,Math.max(0,o+e));r===t.length?this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected?t[r-1].focus():this.inputElement.focus():t[r].focus()}}disableMenu(){var e,t,o;this.menuFocusIndex=-1,this.menuFocusOptionId=void 0,(e=this.inputElement)===null||e===void 0||e.removeAttribute("aria-activedescendant"),(t=this.inputElement)===null||t===void 0||t.removeAttribute("aria-owns"),(o=this.inputElement)===null||o===void 0||o.removeAttribute("aria-expanded")}setFocusedOption(e){if(!this.flyoutOpen||e===-1||this.showNoOptions||this.showLoading){this.disableMenu();return}if(this.menuElement.optionElements.length===0)return;this.menuElement.optionElements.forEach(o=>{o.setAttribute("aria-selected","false")}),this.menuFocusIndex=e,this.menuFocusIndex>this.menuElement.optionElements.length-1&&(this.menuFocusIndex=this.menuElement.optionElements.length-1),this.menuFocusOptionId=this.menuElement.optionElements[this.menuFocusIndex].id,this.inputElement.setAttribute("aria-owns",this.menuId),this.inputElement.setAttribute("aria-expanded","true"),this.inputElement.setAttribute("aria-activedescendant",this.menuFocusOptionId);let t=this.menuElement.optionElements[this.menuFocusIndex];t.setAttribute("aria-selected","true"),this.menuElement.scrollTo(0,t.offsetTop)}updateListItemTemplate(){var e;this.activeListItemTemplate=(e=this.listItemTemplate)!==null&&e!==void 0?e:this.defaultListItemTemplate}updateOptionTemplate(){var e;this.activeMenuOptionTemplate=(e=this.menuOptionTemplate)!==null&&e!==void 0?e:this.defaultMenuOptionTemplate}updateFilteredOptions(){this.filteredOptionsList=this.optionsList.slice(0),this.filterSelected&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>this.selectedItems.indexOf(e)===-1)),this.filterQuery&&this.query!==""&&this.query!==void 0&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>e.indexOf(this.query)!==-1))}updateMenuConfig(){let e=this.configLookup[this.menuPlacement];e===null&&(e=Tn),this.menuConfig=Object.assign(Object.assign({},e),{autoUpdateMode:"auto",fixedPlacement:!0,horizontalViewportLock:!1,verticalViewportLock:!1})}};n([c({attribute:"selection"})],L.prototype,"selection",void 0);n([c({attribute:"options"})],L.prototype,"options",void 0);n([c({attribute:"filter-selected",mode:"boolean"})],L.prototype,"filterSelected",void 0);n([c({attribute:"filter-query",mode:"boolean"})],L.prototype,"filterQuery",void 0);n([c({attribute:"max-selected"})],L.prototype,"maxSelected",void 0);n([c({attribute:"no-suggestions-text"})],L.prototype,"noSuggestionsText",void 0);n([c({attribute:"suggestions-available-text"})],L.prototype,"suggestionsAvailableText",void 0);n([c({attribute:"loading-text"})],L.prototype,"loadingText",void 0);n([c({attribute:"label"})],L.prototype,"label",void 0);n([c({attribute:"labelledby"})],L.prototype,"labelledBy",void 0);n([c({attribute:"placeholder"})],L.prototype,"placeholder",void 0);n([c({attribute:"menu-placement"})],L.prototype,"menuPlacement",void 0);n([u],L.prototype,"showLoading",void 0);n([u],L.prototype,"listItemTemplate",void 0);n([u],L.prototype,"defaultListItemTemplate",void 0);n([u],L.prototype,"activeListItemTemplate",void 0);n([u],L.prototype,"menuOptionTemplate",void 0);n([u],L.prototype,"defaultMenuOptionTemplate",void 0);n([u],L.prototype,"activeMenuOptionTemplate",void 0);n([u],L.prototype,"listItemContentsTemplate",void 0);n([u],L.prototype,"menuOptionContentsTemplate",void 0);n([u],L.prototype,"optionsList",void 0);n([u],L.prototype,"query",void 0);n([u],L.prototype,"filteredOptionsList",void 0);n([u],L.prototype,"flyoutOpen",void 0);n([u],L.prototype,"menuId",void 0);n([u],L.prototype,"selectedListTag",void 0);n([u],L.prototype,"menuTag",void 0);n([u],L.prototype,"menuFocusIndex",void 0);n([u],L.prototype,"menuFocusOptionId",void 0);n([u],L.prototype,"showNoOptions",void 0);n([u],L.prototype,"menuConfig",void 0);n([u],L.prototype,"selectedItems",void 0)});var $d=l(()=>{});var Id=l(()=>{});var Td=l(()=>{});var Sd=l(()=>{});var Ed=l(()=>{wd();kd();$d();yd();Id();rs();Td();xd();Sd();ns()});var Oe,as,Rd=l(()=>{Oe={menuitem:"menuitem",menuitemcheckbox:"menuitemcheckbox",menuitemradio:"menuitemradio"},as={[Oe.menuitem]:"menuitem",[Oe.menuitemcheckbox]:"menuitemcheckbox",[Oe.menuitemradio]:"menuitemradio"}});var De,Od=l(()=>{$();g();A();T();me();Pt();ue();Rd();De=class extends b{constructor(){super(...arguments),this.role=Oe.menuitem,this.hasSubmenu=!1,this.currentDirection=D.ltr,this.focusSubmenuOnLoad=!1,this.handleMenuItemKeyDown=e=>{if(e.defaultPrevented)return!1;switch(e.key){case ee:case Se:return this.invoke(),!1;case ve:return this.expandAndFocus(),!1;case be:if(this.expanded)return this.expanded=!1,this.focus(),!1}return!0},this.handleMenuItemClick=e=>(e.defaultPrevented||this.disabled||this.invoke(),!1),this.submenuLoaded=()=>{this.focusSubmenuOnLoad&&(this.focusSubmenuOnLoad=!1,this.hasSubmenu&&(this.submenu.focus(),this.setAttribute("tabindex","-1")))},this.handleMouseOver=e=>(this.disabled||!this.hasSubmenu||this.expanded||(this.expanded=!0),!1),this.handleMouseOut=e=>(!this.expanded||this.contains(document.activeElement)||(this.expanded=!1),!1),this.expandAndFocus=()=>{this.hasSubmenu&&(this.focusSubmenuOnLoad=!0,this.expanded=!0)},this.invoke=()=>{if(!this.disabled)switch(this.role){case Oe.menuitemcheckbox:this.checked=!this.checked;break;case Oe.menuitem:this.updateSubmenu(),this.hasSubmenu?this.expandAndFocus():this.$emit("change");break;case Oe.menuitemradio:this.checked||(this.checked=!0);break}},this.updateSubmenu=()=>{this.submenu=this.domChildren().find(e=>e.getAttribute("role")==="menu"),this.hasSubmenu=this.submenu!==void 0}}expandedChanged(e){if(this.$fastController.isConnected){if(this.submenu===void 0)return;this.expanded===!1?this.submenu.collapseExpandedItem():this.currentDirection=Le(this),this.$emit("expanded-change",this,{bubbles:!1})}}checkedChanged(e,t){this.$fastController.isConnected&&this.$emit("change")}connectedCallback(){super.connectedCallback(),v.queueUpdate(()=>{this.updateSubmenu()}),this.startColumnCount||(this.startColumnCount=1),this.observer=new MutationObserver(this.updateSubmenu)}disconnectedCallback(){super.disconnectedCallback(),this.submenu=void 0,this.observer!==void 0&&(this.observer.disconnect(),this.observer=void 0)}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}};n([c({mode:"boolean"})],De.prototype,"disabled",void 0);n([c({mode:"boolean"})],De.prototype,"expanded",void 0);n([u],De.prototype,"startColumnCount",void 0);n([c],De.prototype,"role",void 0);n([c({mode:"boolean"})],De.prototype,"checked",void 0);n([u],De.prototype,"submenuRegion",void 0);n([u],De.prototype,"hasSubmenu",void 0);n([u],De.prototype,"currentDirection",void 0);n([u],De.prototype,"submenu",void 0);E(De,_)});var Dd=l(()=>{});var ls=l(()=>{Dd();Od()});var Ad=l(()=>{});var Ho,Fd=l(()=>{$();g();A();ls();T();Ho=class i extends b{constructor(){super(...arguments),this.expandedItem=null,this.focusIndex=-1,this.isNestedMenu=()=>this.parentElement!==null&&tt(this.parentElement)&&this.parentElement.getAttribute("role")==="menuitem",this.handleFocusOut=e=>{if(!this.contains(e.relatedTarget)&&this.menuItems!==void 0){this.collapseExpandedItem();let t=this.menuItems.findIndex(this.isFocusableElement);this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.menuItems[t].setAttribute("tabindex","0"),this.focusIndex=t}},this.handleItemFocus=e=>{let t=e.target;this.menuItems!==void 0&&t!==this.menuItems[this.focusIndex]&&(this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.handleExpandedChanged=e=>{if(e.defaultPrevented||e.target===null||this.menuItems===void 0||this.menuItems.indexOf(e.target)<0)return;e.preventDefault();let t=e.target;if(this.expandedItem!==null&&t===this.expandedItem&&t.expanded===!1){this.expandedItem=null;return}t.expanded&&(this.expandedItem!==null&&this.expandedItem!==t&&(this.expandedItem.expanded=!1),this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.expandedItem=t,this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.removeItemListeners=()=>{this.menuItems!==void 0&&this.menuItems.forEach(e=>{e.removeEventListener("expanded-change",this.handleExpandedChanged),e.removeEventListener("focus",this.handleItemFocus)})},this.setItems=()=>{let e=this.domChildren();this.removeItemListeners(),this.menuItems=e;let t=this.menuItems.filter(this.isMenuItemElement);t.length&&(this.focusIndex=0);function o(s){let a=s.getAttribute("role"),d=s.querySelector("[slot=start]");return a!==Oe.menuitem&&d===null||a===Oe.menuitem&&d!==null?1:a!==Oe.menuitem&&d!==null?2:0}let r=t.reduce((s,a)=>{let d=o(a);return s>d?s:d},0);t.forEach((s,a)=>{s.setAttribute("tabindex",a===0?"0":"-1"),s.addEventListener("expanded-change",this.handleExpandedChanged),s.addEventListener("focus",this.handleItemFocus),(s instanceof De||"startColumnCount"in s)&&(s.startColumnCount=r)})},this.changeHandler=e=>{if(this.menuItems===void 0)return;let t=e.target,o=this.menuItems.indexOf(t);if(o!==-1&&t.role==="menuitemradio"&&t.checked===!0){for(let s=o-1;s>=0;--s){let a=this.menuItems[s],d=a.getAttribute("role");if(d===Oe.menuitemradio&&(a.checked=!1),d==="separator")break}let r=this.menuItems.length-1;for(let s=o+1;s<=r;++s){let a=this.menuItems[s],d=a.getAttribute("role");if(d===Oe.menuitemradio&&(a.checked=!1),d==="separator")break}}},this.isMenuItemElement=e=>tt(e)&&i.focusableElementRoles.hasOwnProperty(e.getAttribute("role")),this.isFocusableElement=e=>this.isMenuItemElement(e)}itemsChanged(e,t){this.$fastController.isConnected&&this.menuItems!==void 0&&this.setItems()}connectedCallback(){super.connectedCallback(),v.queueUpdate(()=>{this.setItems()}),this.addEventListener("change",this.changeHandler)}disconnectedCallback(){super.disconnectedCallback(),this.removeItemListeners(),this.menuItems=void 0,this.removeEventListener("change",this.changeHandler)}focus(){this.setFocus(0,1)}collapseExpandedItem(){this.expandedItem!==null&&(this.expandedItem.expanded=!1,this.expandedItem=null)}handleMenuKeyDown(e){if(!(e.defaultPrevented||this.menuItems===void 0))switch(e.key){case W:this.setFocus(this.focusIndex+1,1);return;case G:this.setFocus(this.focusIndex-1,-1);return;case ae:this.setFocus(this.menuItems.length-1,-1);return;case se:this.setFocus(0,1);return;default:return!0}}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}setFocus(e,t){if(this.menuItems!==void 0)for(;e>=0&&e<this.menuItems.length;){let o=this.menuItems[e];if(this.isFocusableElement(o)){this.focusIndex>-1&&this.menuItems.length>=this.focusIndex-1&&this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=e,o.setAttribute("tabindex","0"),o.focus();break}e+=t}}};Ho.focusableElementRoles=as;n([u],Ho.prototype,"items",void 0)});var Ld=l(()=>{Ad();Fd()});var Pd=l(()=>{});var cs,zo,Md=l(()=>{Ee();T();cs=class extends b{},zo=class extends ce(cs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var No,Bd=l(()=>{No={email:"email",password:"password",tel:"tel",text:"text",url:"url"}});var xe,Vt,Uo=l(()=>{$();g();Jt();ue();Md();Bd();xe=class extends zo{constructor(){super(...arguments),this.type=No.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&v.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};n([c({attribute:"readonly",mode:"boolean"})],xe.prototype,"readOnly",void 0);n([c({mode:"boolean"})],xe.prototype,"autofocus",void 0);n([c],xe.prototype,"placeholder",void 0);n([c],xe.prototype,"type",void 0);n([c],xe.prototype,"list",void 0);n([c({converter:R})],xe.prototype,"maxlength",void 0);n([c({converter:R})],xe.prototype,"minlength",void 0);n([c],xe.prototype,"pattern",void 0);n([c({converter:R})],xe.prototype,"size",void 0);n([c({mode:"boolean"})],xe.prototype,"spellcheck",void 0);n([u],xe.prototype,"defaultSlottedNodes",void 0);Vt=class{};E(Vt,F);E(xe,_,Vt)});var ds,jo,_d=l(()=>{Ee();T();ds=class extends b{},jo=class extends ce(ds){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ke,Vd=l(()=>{$();g();A();me();ue();Uo();_d();ke=class extends jo{constructor(){super(...arguments),this.hideStep=!1,this.step=1,this.isUserInput=!1}maxChanged(e,t){var o;this.max=Math.max(t,(o=this.min)!==null&&o!==void 0?o:t);let r=Math.min(this.min,this.max);this.min!==void 0&&this.min!==r&&(this.min=r),this.value=this.getValidValue(this.value)}minChanged(e,t){var o;this.min=Math.min(t,(o=this.max)!==null&&o!==void 0?o:t);let r=Math.max(this.min,this.max);this.max!==void 0&&this.max!==r&&(this.max=r),this.value=this.getValidValue(this.value)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){this.value=this.getValidValue(t),t===this.value&&(this.control&&!this.isUserInput&&(this.control.value=this.value),super.valueChanged(e,this.value),e!==void 0&&!this.isUserInput&&(this.$emit("input"),this.$emit("change")),this.isUserInput=!1)}validate(){super.validate(this.control)}getValidValue(e){var t,o;let r=parseFloat(parseFloat(e).toPrecision(12));return isNaN(r)?r="":(r=Math.min(r,(t=this.max)!==null&&t!==void 0?t:r),r=Math.max(r,(o=this.min)!==null&&o!==void 0?o:r).toString()),r}stepUp(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:this.step:e+this.step;this.value=t.toString()}stepDown(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:0-this.step:e-this.step;this.value=t.toString()}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","number"),this.validate(),this.control.value=this.value,this.autofocus&&v.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.control.value=this.control.value.replace(/[^0-9\-+e.]/g,""),this.isUserInput=!0,this.value=this.control.value}handleChange(){this.$emit("change")}handleKeyDown(e){switch(e.key){case G:return this.stepUp(),!1;case W:return this.stepDown(),!1}return!0}handleBlur(){this.control.value=this.value}};n([c({attribute:"readonly",mode:"boolean"})],ke.prototype,"readOnly",void 0);n([c({mode:"boolean"})],ke.prototype,"autofocus",void 0);n([c({attribute:"hide-step",mode:"boolean"})],ke.prototype,"hideStep",void 0);n([c],ke.prototype,"placeholder",void 0);n([c],ke.prototype,"list",void 0);n([c({converter:R})],ke.prototype,"maxlength",void 0);n([c({converter:R})],ke.prototype,"minlength",void 0);n([c({converter:R})],ke.prototype,"size",void 0);n([c({converter:R})],ke.prototype,"step",void 0);n([c({converter:R})],ke.prototype,"max",void 0);n([c({converter:R})],ke.prototype,"min",void 0);n([u],ke.prototype,"defaultSlottedNodes",void 0);E(ke,_,Vt)});var Hd=l(()=>{Pd();Vd()});var zd,Nd,Ud=l(()=>{g();zd=44,Nd=(i,e)=>k`
    <template
        role="progressbar"
        aria-valuenow="${t=>t.value}"
        aria-valuemin="${t=>t.min}"
        aria-valuemax="${t=>t.max}"
        class="${t=>t.paused?"paused":""}"
    >
        ${Yt(t=>typeof t.value=="number",k`
                <svg
                    class="progress"
                    part="progress"
                    viewBox="0 0 16 16"
                    slot="determinate"
                >
                    <circle
                        class="background"
                        part="background"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                    <circle
                        class="determinate"
                        part="determinate"
                        style="stroke-dasharray: ${t=>zd*t.percentComplete/100}px ${zd}px"
                        cx="8px"
                        cy="8px"
                        r="7px"
                    ></circle>
                </svg>
            `,k`
                <slot name="indeterminate" slot="indeterminate">
                    ${e.indeterminateIndicator||""}
                </slot>
            `)}
    </template>
`});var jd=l(()=>{Ud()});var gt,qd=l(()=>{$();g();T();gt=class extends b{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){let e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,o=typeof this.value=="number"?this.value:0,r=t-e;this.percentComplete=r===0?0:Math.fround((o-e)/r*100)}};n([c({converter:R})],gt.prototype,"value",void 0);n([c({converter:R})],gt.prototype,"min",void 0);n([c({converter:R})],gt.prototype,"max",void 0);n([c({mode:"boolean"})],gt.prototype,"paused",void 0);n([u],gt.prototype,"percentComplete",void 0)});var Wd=l(()=>{});var Gd=l(()=>{qd();Wd()});var Yd,Xd=l(()=>{g();A();Yd=(i,e)=>k`
    <template
        role="radiogroup"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @click="${(t,o)=>t.clickHandler(o.event)}"
        @keydown="${(t,o)=>t.keydownHandler(o.event)}"
        @focusout="${(t,o)=>t.focusOutHandler(o.event)}"
    >
        <slot name="label"></slot>
        <div
            class="positioning-region ${t=>t.orientation===z.horizontal?"horizontal":"vertical"}"
            part="positioning-region"
        >
            <slot
                ${J({property:"slottedRadioButtons",filter:Xt("[role=radio]")})}
            ></slot>
        </div>
    </template>
`});var Xe,Qd=l(()=>{$();g();A();Pt();T();Xe=class extends b{constructor(){super(...arguments),this.orientation=z.horizontal,this.radioChangeHandler=e=>{let t=e.target;t.checked&&(this.slottedRadioButtons.forEach(o=>{o!==t&&(o.checked=!1,this.isInsideFoundationToolbar||o.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{let o=e[t];this.isInsideToolbar||(o.setAttribute("tabindex","0"),o.readOnly?this.slottedRadioButtons.forEach(r=>{r!==o&&r.setAttribute("tabindex","-1")}):(o.checked=!0,this.selectedRadio=o)),this.focusedRadio=o,o.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{let t=this.slottedRadioButtons,o=e.target,r=o!==null?t.indexOf(o):0,s=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(s===0&&r===s||s===t.length-1&&s===r)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.selectedRadio&&a.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.focusedRadio&&a.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{let t=e.target;if(t){let o=this.slottedRadioButtons;t.checked||o.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,o)=>e===t.length&&this.isInsideToolbar&&o===ve,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===be,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{let t=this.slottedRadioButtons,o=0;if(o=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(o,t,e.key)){this.moveRightOffGroup();return}else o===t.length&&(o=0);for(;o<t.length&&t.length>1;)if(t[o].disabled){if(this.focusedRadio&&o===t.indexOf(this.focusedRadio))break;if(o+1>=t.length){if(this.isInsideToolbar)break;o=0}else o+=1}else{this.moveToRadioByIndex(t,o);break}},this.moveLeft=e=>{let t=this.slottedRadioButtons,o=0;if(o=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,o=o<0?t.length-1:o,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;o>=0&&t.length>1;)if(t[o].disabled){if(this.focusedRadio&&o===t.indexOf(this.focusedRadio))break;o-1<0?o=t.length-1:o-=1}else{this.moveToRadioByIndex(t,o);break}},this.keydownHandler=e=>{let t=e.key;if(t in Ft&&this.isInsideFoundationToolbar)return!0;switch(t){case ee:{this.checkFocusedRadio();break}case ve:case W:{this.direction===D.ltr?this.moveRight(e):this.moveLeft(e);break}case be:case G:{this.direction===D.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.value===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=Le(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){let e=this.slottedRadioButtons.filter(r=>r.hasAttribute("checked")),t=e?e.length:0;if(t>1){let r=e[t-1];r.checked=!0}let o=!1;if(this.slottedRadioButtons.forEach(r=>{this.name!==void 0&&r.setAttribute("name",this.name),this.disabled&&(r.disabled=!0),this.readOnly&&(r.readOnly=!0),this.value&&this.value===r.value?(this.selectedRadio=r,this.focusedRadio=r,r.checked=!0,r.setAttribute("tabindex","0"),o=!0):(this.isInsideFoundationToolbar||r.setAttribute("tabindex","-1"),r.checked=!1),r.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){let r=this.slottedRadioButtons.filter(a=>a.hasAttribute("checked")),s=r!==null?r.length:0;if(s>0&&!o){let a=r[s-1];a.checked=!0,this.focusedRadio=a,a.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}};n([c({attribute:"readonly",mode:"boolean"})],Xe.prototype,"readOnly",void 0);n([c({attribute:"disabled",mode:"boolean"})],Xe.prototype,"disabled",void 0);n([c],Xe.prototype,"name",void 0);n([c],Xe.prototype,"value",void 0);n([c],Xe.prototype,"orientation",void 0);n([u],Xe.prototype,"childItems",void 0);n([u],Xe.prototype,"slottedRadioButtons",void 0)});var Zd=l(()=>{Xd();Qd()});var Jd,Kd=l(()=>{g();Jd=(i,e)=>k`
    <template
        role="radio"
        class="${t=>t.checked?"checked":""} ${t=>t.readOnly?"readonly":""}"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @keypress="${(t,o)=>t.keypressHandler(o.event)}"
        @click="${(t,o)=>t.clickHandler(o.event)}"
    >
        <div part="control" class="control">
            <slot name="checked-indicator">
                ${e.checkedIndicator||""}
            </slot>
        </div>
        <label
            part="label"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${J("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var hs,qo,eh=l(()=>{Ee();T();hs=class extends b{},qo=class extends gi(hs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var si,th=l(()=>{$();g();A();eh();si=class extends qo{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(e.key===Se){!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}};n([c({attribute:"readonly",mode:"boolean"})],si.prototype,"readOnly",void 0);n([u],si.prototype,"name",void 0);n([u],si.prototype,"defaultSlottedNodes",void 0)});var ih=l(()=>{Kd();th()});var bt,oh=l(()=>{$();g();T();bt=class extends b{constructor(){super(...arguments),this.framesPerSecond=60,this.updatingItems=!1,this.speed=600,this.easing="ease-in-out",this.flippersHiddenFromAT=!1,this.scrolling=!1,this.resizeDetector=null}get frameTime(){return 1e3/this.framesPerSecond}scrollingChanged(e,t){if(this.scrollContainer){let o=this.scrolling==!0?"scrollstart":"scrollend";this.$emit(o,this.scrollContainer.scrollLeft)}}get isRtl(){return this.scrollItems.length>1&&this.scrollItems[0].offsetLeft>this.scrollItems[1].offsetLeft}connectedCallback(){super.connectedCallback(),this.initializeResizeDetector()}disconnectedCallback(){this.disconnectResizeDetector(),super.disconnectedCallback()}scrollItemsChanged(e,t){t&&!this.updatingItems&&v.queueUpdate(()=>this.setStops())}disconnectResizeDetector(){this.resizeDetector&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.resized.bind(this)),this.resizeDetector.observe(this)}updateScrollStops(){this.updatingItems=!0;let e=this.scrollItems.reduce((t,o)=>o instanceof HTMLSlotElement?t.concat(o.assignedElements()):(t.push(o),t),[]);this.scrollItems=e,this.updatingItems=!1}setStops(){this.updateScrollStops();let{scrollContainer:e}=this,{scrollLeft:t}=e,{width:o,left:r}=e.getBoundingClientRect();this.width=o;let s=0,a=this.scrollItems.map((d,h)=>{let{left:p,width:f}=d.getBoundingClientRect(),m=Math.round(p+t-r),y=Math.round(m+f);return this.isRtl?-y:(s=y,h===0?0:m)}).concat(s);a=this.fixScrollMisalign(a),a.sort((d,h)=>Math.abs(d)-Math.abs(h)),this.scrollStops=a,this.setFlippers()}validateStops(e=!0){let t=()=>!!this.scrollStops.find(o=>o>0);return!t()&&e&&this.setStops(),t()}fixScrollMisalign(e){if(this.isRtl&&e.some(t=>t>0)){e.sort((o,r)=>r-o);let t=e[0];e=e.map(o=>o-t)}return e}setFlippers(){var e,t;let o=this.scrollContainer.scrollLeft;if((e=this.previousFlipperContainer)===null||e===void 0||e.classList.toggle("disabled",o===0),this.scrollStops){let r=Math.abs(this.scrollStops[this.scrollStops.length-1]);(t=this.nextFlipperContainer)===null||t===void 0||t.classList.toggle("disabled",this.validateStops(!1)&&Math.abs(o)+this.width>=r)}}scrollInView(e,t=0,o){var r;if(typeof e!="number"&&e&&(e=this.scrollItems.findIndex(s=>s===e||s.contains(e))),e!==void 0){o=o??t;let{scrollContainer:s,scrollStops:a,scrollItems:d}=this,{scrollLeft:h}=this.scrollContainer,{width:p}=s.getBoundingClientRect(),f=a[e],{width:m}=d[e].getBoundingClientRect(),y=f+m,O=h+t>f;if(O||h+p-o<y){let K=(r=[...a].sort((ne,wt)=>O?wt-ne:ne-wt).find(ne=>O?ne+t<f:ne+p-(o??0)>y))!==null&&r!==void 0?r:0;this.scrollToPosition(K)}}}keyupHandler(e){switch(e.key){case"ArrowLeft":this.scrollToPrevious();break;case"ArrowRight":this.scrollToNext();break}}scrollToPrevious(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex((s,a)=>s>=e&&(this.isRtl||a===this.scrollStops.length-1||this.scrollStops[a+1]>e)),o=Math.abs(this.scrollStops[t+1]),r=this.scrollStops.findIndex(s=>Math.abs(s)+this.width>o);(r>=t||r===-1)&&(r=t>0?t-1:0),this.scrollToPosition(this.scrollStops[r],e)}scrollToNext(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex(s=>Math.abs(s)>=Math.abs(e)),o=this.scrollStops.findIndex(s=>Math.abs(e)+this.width<=Math.abs(s)),r=t;o>t+2?r=o-2:t<this.scrollStops.length-2&&(r=t+1),this.scrollToPosition(this.scrollStops[r],e)}scrollToPosition(e,t=this.scrollContainer.scrollLeft){var o;if(this.scrolling)return;this.scrolling=!0;let r=(o=this.duration)!==null&&o!==void 0?o:`${Math.abs(e-t)/this.speed}s`;this.content.style.setProperty("transition-duration",r);let s=parseFloat(getComputedStyle(this.content).getPropertyValue("transition-duration")),a=p=>{p&&p.target!==p.currentTarget||(this.content.style.setProperty("transition-duration","0s"),this.content.style.removeProperty("transform"),this.scrollContainer.style.setProperty("scroll-behavior","auto"),this.scrollContainer.scrollLeft=e,this.setFlippers(),this.content.removeEventListener("transitionend",a),this.scrolling=!1)};if(s===0){a();return}this.content.addEventListener("transitionend",a);let d=this.scrollContainer.scrollWidth-this.scrollContainer.clientWidth,h=this.scrollContainer.scrollLeft-Math.min(e,d);this.isRtl&&(h=this.scrollContainer.scrollLeft+Math.min(Math.abs(e),d)),this.content.style.setProperty("transition-property","transform"),this.content.style.setProperty("transition-timing-function",this.easing),this.content.style.setProperty("transform",`translateX(${h}px)`)}resized(){this.resizeTimeout&&(this.resizeTimeout=clearTimeout(this.resizeTimeout)),this.resizeTimeout=setTimeout(()=>{this.width=this.scrollContainer.offsetWidth,this.setFlippers()},this.frameTime)}scrolled(){this.scrollTimeout&&(this.scrollTimeout=clearTimeout(this.scrollTimeout)),this.scrollTimeout=setTimeout(()=>{this.setFlippers()},this.frameTime)}};n([c({converter:R})],bt.prototype,"speed",void 0);n([c],bt.prototype,"duration",void 0);n([c],bt.prototype,"easing",void 0);n([c({attribute:"flippers-hidden-from-at",converter:Wt})],bt.prototype,"flippersHiddenFromAT",void 0);n([u],bt.prototype,"scrolling",void 0);n([u],bt.prototype,"scrollItems",void 0);n([c({attribute:"view"})],bt.prototype,"view",void 0)});var rh=l(()=>{});var nh=l(()=>{oh();rh()});function sh(i,e,t){return i.nodeType!==Node.TEXT_NODE?!0:typeof i.nodeValue=="string"&&!!i.nodeValue.trim().length}var us=l(()=>{});var ah=l(()=>{});var ps,Wo,lh=l(()=>{Ee();T();ps=class extends b{},Wo=class extends ce(ps){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Me,Go,ch=l(()=>{$();g();Jt();ue();lh();Me=class extends Wo{readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.validate(),this.autofocus&&v.queueUpdate(()=>{this.focus()})}validate(){super.validate(this.control)}handleTextInput(){this.value=this.control.value}handleClearInput(){this.value="",this.control.focus(),this.handleChange()}handleChange(){this.$emit("change")}};n([c({attribute:"readonly",mode:"boolean"})],Me.prototype,"readOnly",void 0);n([c({mode:"boolean"})],Me.prototype,"autofocus",void 0);n([c],Me.prototype,"placeholder",void 0);n([c],Me.prototype,"list",void 0);n([c({converter:R})],Me.prototype,"maxlength",void 0);n([c({converter:R})],Me.prototype,"minlength",void 0);n([c],Me.prototype,"pattern",void 0);n([c({converter:R})],Me.prototype,"size",void 0);n([c({mode:"boolean"})],Me.prototype,"spellcheck",void 0);n([u],Me.prototype,"defaultSlottedNodes",void 0);Go=class{};E(Go,F);E(Me,_,Go)});var dh=l(()=>{ah();ch()});var fs,Yo,hh=l(()=>{os();Ee();fs=class extends ni{},Yo=class extends ce(fs){constructor(){super(...arguments),this.proxy=document.createElement("select")}}});var Qe,Yi,uh=l(()=>{$();g();A();oi();me();ue();hh();Do();Qe=class extends Yo{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.listboxId=Fe("listbox-"),this.maxHeight=0}openChanged(e,t){if(this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,v.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return C.track(this,"value"),this._value}set value(e){var t,o,r,s,a,d,h;let p=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){let f=this._options.findIndex(O=>O.value===e),m=(r=(o=this._options[this.selectedIndex])===null||o===void 0?void 0:o.value)!==null&&r!==void 0?r:null,y=(a=(s=this._options[f])===null||s===void 0?void 0:s.value)!==null&&a!==void 0?a:null;(f===-1||m!==y)&&(e="",this.selectedIndex=f),e=(h=(d=this.firstSelectedOption)===null||d===void 0?void 0:d.value)!==null&&h!==void 0?h:e}p!==e&&(this._value=e,super.valueChanged(p,e),C.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,o;this.$fastController.isConnected&&(this.value=(o=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&o!==void 0?o:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}setPositioning(){let e=this.getBoundingClientRect(),o=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>o?it.above:it.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===it.above?~~e.top:~~o}get displayValue(){var e,t;return C.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){let t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;let o=e.relatedTarget;if(this.isSameNode(o)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(o)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(o=>{C.getNotifier(o).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(o=>{C.getNotifier(o).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var o;super.selectedOptionsChanged(e,t),(o=this.options)===null||o===void 0||o.forEach((r,s)=>{var a;let d=(a=this.proxy)===null||a===void 0?void 0:a.options.item(s);d&&(d.selected=r.selected)})}setDefaultSelectedOption(){var e;let t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(pe.slottedOptionFilter),o=t?.findIndex(r=>r.hasAttribute("selected")||r.selected||r.value===this.value);if(o!==-1){this.selectedIndex=o;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{let t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);let t=e.key||e.key.charCodeAt(0);switch(t){case Se:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case se:case ae:{e.preventDefault();break}case ee:{e.preventDefault(),this.open=!this.open;break}case Te:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case At:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t===W||t===G)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&C.notify(this,"displayValue")}};n([c({attribute:"open",mode:"boolean"})],Qe.prototype,"open",void 0);n([ya],Qe.prototype,"collapsible",null);n([u],Qe.prototype,"control",void 0);n([c({attribute:"position"})],Qe.prototype,"positionAttribute",void 0);n([u],Qe.prototype,"position",void 0);n([u],Qe.prototype,"maxHeight",void 0);Yi=class{};n([u],Yi.prototype,"ariaControls",void 0);E(Yi,je);E(Qe,_,Yi)});var ph,fh=l(()=>{g();oi();me();ph=(i,e)=>k`
    <template
        class="${t=>[t.collapsible&&"collapsible",t.collapsible&&t.open&&"open",t.disabled&&"disabled",t.collapsible&&t.position].filter(Boolean).join(" ")}"
        aria-activedescendant="${t=>t.ariaActiveDescendant}"
        aria-controls="${t=>t.ariaControls}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-expanded="${t=>t.ariaExpanded}"
        aria-haspopup="${t=>t.collapsible?"listbox":null}"
        aria-multiselectable="${t=>t.ariaMultiSelectable}"
        ?open="${t=>t.open}"
        role="combobox"
        tabindex="${t=>t.disabled?null:"0"}"
        @click="${(t,o)=>t.clickHandler(o.event)}"
        @focusin="${(t,o)=>t.focusinHandler(o.event)}"
        @focusout="${(t,o)=>t.focusoutHandler(o.event)}"
        @keydown="${(t,o)=>t.keydownHandler(o.event)}"
        @mousedown="${(t,o)=>t.mousedownHandler(o.event)}"
    >
        ${Yt(t=>t.collapsible,k`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${X("control")}
                >
                    ${ze(i,e)}
                    <slot name="button-container">
                        <div class="selected-value" part="selected-value">
                            <slot name="selected-value">${t=>t.displayValue}</slot>
                        </div>
                        <div aria-hidden="true" class="indicator" part="indicator">
                            <slot name="indicator">
                                ${e.indicator||""}
                            </slot>
                        </div>
                    </slot>
                    ${He(i,e)}
                </div>
            `)}
        <div
            class="listbox"
            id="${t=>t.listboxId}"
            part="listbox"
            role="listbox"
            ?disabled="${t=>t.disabled}"
            ?hidden="${t=>t.collapsible?!t.open:!1}"
            ${X("listbox")}
        >
            <slot
                ${J({filter:pe.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`});var mh=l(()=>{uh();Do();fh()});var gh=l(()=>{});var $i,bh=l(()=>{$();g();T();$i=class extends b{constructor(){super(...arguments),this.shape="rect"}};n([c],$i.prototype,"fill",void 0);n([c],$i.prototype,"shape",void 0);n([c],$i.prototype,"pattern",void 0);n([c({mode:"boolean"})],$i.prototype,"shimmer",void 0)});var vh=l(()=>{gh();bh()});var yh=l(()=>{});function Xi(i,e,t,o){let r=Lt(0,1,(i-e)/(t-e));return o===D.rtl&&(r=1-r),r}var ms=l(()=>{A()});var Xo,rt,xh=l(()=>{$();g();A();ms();T();Xo={min:0,max:0,direction:D.ltr,orientation:z.horizontal,disabled:!1},rt=class extends b{constructor(){super(...arguments),this.hideMark=!1,this.sliderDirection=D.ltr,this.getSliderConfiguration=()=>{if(!this.isSliderConfig(this.parentNode))this.sliderDirection=Xo.direction||D.ltr,this.sliderOrientation=Xo.orientation||z.horizontal,this.sliderMaxPosition=Xo.max,this.sliderMinPosition=Xo.min;else{let e=this.parentNode,{min:t,max:o,direction:r,orientation:s,disabled:a}=e;a!==void 0&&(this.disabled=a),this.sliderDirection=r||D.ltr,this.sliderOrientation=s||z.horizontal,this.sliderMaxPosition=o,this.sliderMinPosition=t}},this.positionAsStyle=()=>{let e=this.sliderDirection?this.sliderDirection:D.ltr,t=Xi(Number(this.position),Number(this.sliderMinPosition),Number(this.sliderMaxPosition)),o=Math.round((1-t)*100),r=Math.round(t*100);return Number.isNaN(r)&&Number.isNaN(o)&&(o=50,r=50),this.sliderOrientation===z.horizontal?e===D.rtl?`right: ${r}%; left: ${o}%;`:`left: ${r}%; right: ${o}%;`:`top: ${r}%; bottom: ${o}%;`}}positionChanged(){this.positionStyle=this.positionAsStyle()}sliderOrientationChanged(){}connectedCallback(){super.connectedCallback(),this.getSliderConfiguration(),this.positionStyle=this.positionAsStyle(),this.notifier=C.getNotifier(this.parentNode),this.notifier.subscribe(this,"orientation"),this.notifier.subscribe(this,"direction"),this.notifier.subscribe(this,"max"),this.notifier.subscribe(this,"min")}disconnectedCallback(){super.disconnectedCallback(),this.notifier.unsubscribe(this,"orientation"),this.notifier.unsubscribe(this,"direction"),this.notifier.unsubscribe(this,"max"),this.notifier.unsubscribe(this,"min")}handleChange(e,t){switch(t){case"direction":this.sliderDirection=e.direction;break;case"orientation":this.sliderOrientation=e.orientation;break;case"max":this.sliderMaxPosition=e.max;break;case"min":this.sliderMinPosition=e.min;break;default:break}this.positionStyle=this.positionAsStyle()}isSliderConfig(e){return e.max!==void 0&&e.min!==void 0}};n([u],rt.prototype,"positionStyle",void 0);n([c],rt.prototype,"position",void 0);n([c({attribute:"hide-mark",mode:"boolean"})],rt.prototype,"hideMark",void 0);n([c({attribute:"disabled",mode:"boolean"})],rt.prototype,"disabled",void 0);n([u],rt.prototype,"sliderOrientation",void 0);n([u],rt.prototype,"sliderMinPosition",void 0);n([u],rt.prototype,"sliderMaxPosition",void 0);n([u],rt.prototype,"sliderDirection",void 0)});var wh=l(()=>{yh();xh()});var Ch=l(()=>{});var gs,Qo,kh=l(()=>{Ee();T();gs=class extends b{},Qo=class extends ce(gs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var om,ge,$h=l(()=>{$();g();A();Pt();ms();kh();om={singleValue:"single-value"},ge=class extends Qo{constructor(){super(...arguments),this.direction=D.ltr,this.isDragging=!1,this.trackWidth=0,this.trackMinWidth=0,this.trackHeight=0,this.trackLeft=0,this.trackMinHeight=0,this.valueTextFormatter=()=>null,this.min=0,this.max=10,this.step=1,this.orientation=z.horizontal,this.mode=om.singleValue,this.keypressHandler=e=>{if(!this.readOnly){if(e.key===se)e.preventDefault(),this.value=`${this.min}`;else if(e.key===ae)e.preventDefault(),this.value=`${this.max}`;else if(!e.shiftKey)switch(e.key){case ve:case G:e.preventDefault(),this.increment();break;case be:case W:e.preventDefault(),this.decrement();break}}},this.setupTrackConstraints=()=>{let e=this.track.getBoundingClientRect();this.trackWidth=this.track.clientWidth,this.trackMinWidth=this.track.clientLeft,this.trackHeight=e.bottom,this.trackMinHeight=e.top,this.trackLeft=this.getBoundingClientRect().left,this.trackWidth===0&&(this.trackWidth=1)},this.setupListeners=(e=!1)=>{let t=`${e?"remove":"add"}EventListener`;this[t]("keydown",this.keypressHandler),this[t]("mousedown",this.handleMouseDown),this.thumb[t]("mousedown",this.handleThumbMouseDown,{passive:!0}),this.thumb[t]("touchstart",this.handleThumbMouseDown,{passive:!0}),e&&(this.handleMouseDown(null),this.handleThumbMouseDown(null))},this.initialValue="",this.handleThumbMouseDown=e=>{if(e){if(this.readOnly||this.disabled||e.defaultPrevented)return;e.target.focus()}let t=`${e!==null?"add":"remove"}EventListener`;window[t]("mouseup",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove,{passive:!0}),window[t]("touchmove",this.handleMouseMove,{passive:!0}),window[t]("touchend",this.handleWindowMouseUp),this.isDragging=e!==null},this.handleMouseMove=e=>{if(this.readOnly||this.disabled||e.defaultPrevented)return;let t=window.TouchEvent&&e instanceof TouchEvent?e.touches[0]:e,o=this.orientation===z.horizontal?t.pageX-document.documentElement.scrollLeft-this.trackLeft:t.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(o)}`},this.calculateNewValue=e=>{let t=Xi(e,this.orientation===z.horizontal?this.trackMinWidth:this.trackMinHeight,this.orientation===z.horizontal?this.trackWidth:this.trackHeight,this.direction),o=(this.max-this.min)*t+this.min;return this.convertToConstrainedValue(o)},this.handleWindowMouseUp=e=>{this.stopDragging()},this.stopDragging=()=>{this.isDragging=!1,this.handleMouseDown(null),this.handleThumbMouseDown(null)},this.handleMouseDown=e=>{let t=`${e!==null?"add":"remove"}EventListener`;if((e===null||!this.disabled&&!this.readOnly)&&(window[t]("mouseup",this.handleWindowMouseUp),window.document[t]("mouseleave",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove),e)){e.preventDefault(),this.setupTrackConstraints(),e.target.focus();let o=this.orientation===z.horizontal?e.pageX-document.documentElement.scrollLeft-this.trackLeft:e.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(o)}`}},this.convertToConstrainedValue=e=>{isNaN(e)&&(e=this.min);let t=e-this.min,o=Math.round(t/this.step),r=t-o*(this.stepMultiplier*this.step)/this.stepMultiplier;return t=r>=Number(this.step)/2?t-r+Number(this.step):t-r,t+this.min}}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){super.valueChanged(e,t),this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction),this.$emit("change")}minChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.min=`${this.min}`),this.validate()}maxChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.max=`${this.max}`),this.validate()}stepChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.step=`${this.step}`),this.updateStepMultiplier(),this.validate()}orientationChanged(){this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","range"),this.direction=Le(this),this.updateStepMultiplier(),this.setupTrackConstraints(),this.setupListeners(),this.setupDefaultValue(),this.setThumbPositionForOrientation(this.direction)}disconnectedCallback(){this.setupListeners(!0)}increment(){let e=this.direction!==D.rtl&&this.orientation!==z.vertical?Number(this.value)+Number(this.step):Number(this.value)-Number(this.step),t=this.convertToConstrainedValue(e),o=t<Number(this.max)?`${t}`:`${this.max}`;this.value=o}decrement(){let e=this.direction!==D.rtl&&this.orientation!==z.vertical?Number(this.value)-Number(this.step):Number(this.value)+Number(this.step),t=this.convertToConstrainedValue(e),o=t>Number(this.min)?`${t}`:`${this.min}`;this.value=o}setThumbPositionForOrientation(e){let o=(1-Xi(Number(this.value),Number(this.min),Number(this.max),e))*100;this.orientation===z.horizontal?this.position=this.isDragging?`right: ${o}%; transition: none;`:`right: ${o}%; transition: all 0.2s ease;`:this.position=this.isDragging?`bottom: ${o}%; transition: none;`:`bottom: ${o}%; transition: all 0.2s ease;`}updateStepMultiplier(){let e=this.step+"",t=this.step%1?e.length-e.indexOf(".")-1:0;this.stepMultiplier=Math.pow(10,t)}get midpoint(){return`${this.convertToConstrainedValue((this.max+this.min)/2)}`}setupDefaultValue(){if(typeof this.value=="string")if(this.value.length===0)this.initialValue=this.midpoint;else{let e=parseFloat(this.value);!Number.isNaN(e)&&(e<this.min||e>this.max)&&(this.value=this.midpoint)}}};n([c({attribute:"readonly",mode:"boolean"})],ge.prototype,"readOnly",void 0);n([u],ge.prototype,"direction",void 0);n([u],ge.prototype,"isDragging",void 0);n([u],ge.prototype,"position",void 0);n([u],ge.prototype,"trackWidth",void 0);n([u],ge.prototype,"trackMinWidth",void 0);n([u],ge.prototype,"trackHeight",void 0);n([u],ge.prototype,"trackLeft",void 0);n([u],ge.prototype,"trackMinHeight",void 0);n([u],ge.prototype,"valueTextFormatter",void 0);n([c({converter:R})],ge.prototype,"min",void 0);n([c({converter:R})],ge.prototype,"max",void 0);n([c({converter:R})],ge.prototype,"step",void 0);n([c],ge.prototype,"orientation",void 0);n([c],ge.prototype,"mode",void 0)});var Ih=l(()=>{Ch();$h()});var Th=l(()=>{});var bs,Zo,Sh=l(()=>{Ee();T();bs=class extends b{},Zo=class extends gi(bs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Jo,Eh=l(()=>{$();g();A();Sh();Jo=class extends Zo{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(!this.readOnly)switch(e.key){case ee:case Se:this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly),this.readOnly?this.classList.add("readonly"):this.classList.remove("readonly")}checkedChanged(e,t){super.checkedChanged(e,t),this.checked?this.classList.add("checked"):this.classList.remove("checked")}};n([c({attribute:"readonly",mode:"boolean"})],Jo.prototype,"readOnly",void 0);n([u],Jo.prototype,"defaultSlottedNodes",void 0)});var Rh=l(()=>{Th();Eh()});var Oh,Dh=l(()=>{g();Oh=(i,e)=>k`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`});var Ko,Ah=l(()=>{T();Ko=class extends b{}});var Fh=l(()=>{Dh();Ah()});var Lh,Ph=l(()=>{g();Lh=(i,e)=>k`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`});var Qi,Mh=l(()=>{$();g();T();Qi=class extends b{};n([c({mode:"boolean"})],Qi.prototype,"disabled",void 0)});var Bh=l(()=>{Ph();Mh()});var _h,Vh=l(()=>{g();me();_h=(i,e)=>k`
    <template class="${t=>t.orientation}">
        ${ze(i,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${J("tabs")}></slot>

            ${Yt(t=>t.showActiveIndicator,k`
                    <div
                        ${X("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${He(i,e)}
        <div class="tabpanel" part="tabpanel">
            <slot name="tabpanel" ${J("tabpanels")}></slot>
        </div>
    </template>
`});var er,qe,Hh=l(()=>{$();g();A();me();ue();T();er={vertical:"vertical",horizontal:"horizontal"},qe=class extends b{constructor(){super(...arguments),this.orientation=er.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isHiddenElement=e=>e.hasAttribute("hidden"),this.isFocusableElement=e=>!this.isDisabledElement(e)&&!this.isHiddenElement(e),this.setTabs=()=>{let e="gridColumn",t="gridRow",o=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((r,s)=>{if(r.slot==="tab"){let a=this.activeTabIndex===s&&this.isFocusableElement(r);this.activeindicator&&this.isFocusableElement(r)&&(this.showActiveIndicator=!0);let d=this.tabIds[s],h=this.tabpanelIds[s];r.setAttribute("id",d),r.setAttribute("aria-selected",a?"true":"false"),r.setAttribute("aria-controls",h),r.addEventListener("click",this.handleTabClick),r.addEventListener("keydown",this.handleTabKeyDown),r.setAttribute("tabindex",a?"0":"-1"),a&&(this.activetab=r,this.activeid=d)}r.style[e]="",r.style[t]="",r.style[o]=`${s+1}`,this.isHorizontal()?r.classList.remove("vertical"):r.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{let o=this.tabIds[t],r=this.tabpanelIds[t];e.setAttribute("id",r),e.setAttribute("aria-labelledby",o),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{let t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case be:e.preventDefault(),this.adjustBackward(e);break;case ve:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case G:e.preventDefault(),this.adjustBackward(e);break;case W:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case se:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case ae:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{let t=this.tabs,o=0;for(o=this.activetab?t.indexOf(this.activetab)+1:1,o===t.length&&(o=0);o<t.length&&t.length>1;)if(this.isFocusableElement(t[o])){this.moveToTabByIndex(t,o);break}else{if(this.activetab&&o===t.indexOf(this.activetab))break;o+1>=t.length?o=0:o+=1}},this.adjustBackward=e=>{let t=this.tabs,o=0;for(o=this.activetab?t.indexOf(this.activetab)-1:0,o=o<0?t.length-1:o;o>=0&&t.length>1;)if(this.isFocusableElement(t[o])){this.moveToTabByIndex(t,o);break}else o-1<0?o=t.length-1:o-=1},this.moveToTabByIndex=(e,t)=>{let o=e[t];this.activetab=o,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,o.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(o=>o.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${Fe()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${Fe()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===er.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;let e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",o=this.isHorizontal()?"offsetLeft":"offsetTop",r=this.activeIndicatorRef[o];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;let s=this.activeIndicatorRef[o];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;let a=s-r;this.activeIndicatorRef.style.transform=`${t}(${a}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){let t=this.tabs.filter(a=>this.isFocusableElement(a)),o=t.indexOf(this.activetab),r=Lt(0,t.length-1,o+e),s=this.tabs.indexOf(t[r]);s>-1&&this.moveToTabByIndex(this.tabs,s)}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}};n([c],qe.prototype,"orientation",void 0);n([c],qe.prototype,"activeid",void 0);n([u],qe.prototype,"tabs",void 0);n([u],qe.prototype,"tabpanels",void 0);n([c({mode:"boolean"})],qe.prototype,"activeindicator",void 0);n([u],qe.prototype,"activeIndicatorRef",void 0);n([u],qe.prototype,"showActiveIndicator",void 0);E(qe,_)});var zh=l(()=>{Vh();Hh()});var vs,tr,Nh=l(()=>{Ee();T();vs=class extends b{},tr=class extends ce(vs){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}});var Ii,Uh=l(()=>{Ii={none:"none",both:"both",horizontal:"horizontal",vertical:"vertical"}});var fe,ys=l(()=>{$();g();Uo();ue();Nh();Uh();fe=class extends tr{constructor(){super(...arguments),this.resize=Ii.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};n([c({mode:"boolean"})],fe.prototype,"readOnly",void 0);n([c],fe.prototype,"resize",void 0);n([c({mode:"boolean"})],fe.prototype,"autofocus",void 0);n([c({attribute:"form"})],fe.prototype,"formId",void 0);n([c],fe.prototype,"list",void 0);n([c({converter:R})],fe.prototype,"maxlength",void 0);n([c({converter:R})],fe.prototype,"minlength",void 0);n([c],fe.prototype,"name",void 0);n([c],fe.prototype,"placeholder",void 0);n([c({converter:R,mode:"fromView"})],fe.prototype,"cols",void 0);n([c({converter:R,mode:"fromView"})],fe.prototype,"rows",void 0);n([c({mode:"boolean"})],fe.prototype,"spellcheck",void 0);n([u],fe.prototype,"defaultSlottedNodes",void 0);E(fe,Vt)});var jh,qh=l(()=>{g();ys();jh=(i,e)=>k`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==Ii.none?`resize-${t.resize}`:""}"
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${J("defaultSlottedNodes")}></slot>
        </label>
        <textarea
            part="control"
            class="control"
            id="control"
            ?autofocus="${t=>t.autofocus}"
            cols="${t=>t.cols}"
            ?disabled="${t=>t.disabled}"
            form="${t=>t.form}"
            list="${t=>t.list}"
            maxlength="${t=>t.maxlength}"
            minlength="${t=>t.minlength}"
            name="${t=>t.name}"
            placeholder="${t=>t.placeholder}"
            ?readonly="${t=>t.readOnly}"
            ?required="${t=>t.required}"
            rows="${t=>t.rows}"
            ?spellcheck="${t=>t.spellcheck}"
            :value="${t=>t.value}"
            aria-atomic="${t=>t.ariaAtomic}"
            aria-busy="${t=>t.ariaBusy}"
            aria-controls="${t=>t.ariaControls}"
            aria-current="${t=>t.ariaCurrent}"
            aria-describedby="${t=>t.ariaDescribedby}"
            aria-details="${t=>t.ariaDetails}"
            aria-disabled="${t=>t.ariaDisabled}"
            aria-errormessage="${t=>t.ariaErrormessage}"
            aria-flowto="${t=>t.ariaFlowto}"
            aria-haspopup="${t=>t.ariaHaspopup}"
            aria-hidden="${t=>t.ariaHidden}"
            aria-invalid="${t=>t.ariaInvalid}"
            aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
            aria-label="${t=>t.ariaLabel}"
            aria-labelledby="${t=>t.ariaLabelledby}"
            aria-live="${t=>t.ariaLive}"
            aria-owns="${t=>t.ariaOwns}"
            aria-relevant="${t=>t.ariaRelevant}"
            aria-roledescription="${t=>t.ariaRoledescription}"
            @input="${(t,o)=>t.handleTextInput()}"
            @change="${t=>t.handleChange()}"
            ${X("control")}
        ></textarea>
    </template>
`});var Wh=l(()=>{qh();ys()});var Gh,Yh=l(()=>{g();me();us();Gh=(i,e)=>k`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
        "
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot
                ${J({property:"defaultSlottedNodes",filter:sh})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${ze(i,e)}
            <input
                class="control"
                part="control"
                id="control"
                @input="${t=>t.handleTextInput()}"
                @change="${t=>t.handleChange()}"
                ?autofocus="${t=>t.autofocus}"
                ?disabled="${t=>t.disabled}"
                list="${t=>t.list}"
                maxlength="${t=>t.maxlength}"
                minlength="${t=>t.minlength}"
                pattern="${t=>t.pattern}"
                placeholder="${t=>t.placeholder}"
                ?readonly="${t=>t.readOnly}"
                ?required="${t=>t.required}"
                size="${t=>t.size}"
                ?spellcheck="${t=>t.spellcheck}"
                :value="${t=>t.value}"
                type="${t=>t.type}"
                aria-atomic="${t=>t.ariaAtomic}"
                aria-busy="${t=>t.ariaBusy}"
                aria-controls="${t=>t.ariaControls}"
                aria-current="${t=>t.ariaCurrent}"
                aria-describedby="${t=>t.ariaDescribedby}"
                aria-details="${t=>t.ariaDetails}"
                aria-disabled="${t=>t.ariaDisabled}"
                aria-errormessage="${t=>t.ariaErrormessage}"
                aria-flowto="${t=>t.ariaFlowto}"
                aria-haspopup="${t=>t.ariaHaspopup}"
                aria-hidden="${t=>t.ariaHidden}"
                aria-invalid="${t=>t.ariaInvalid}"
                aria-keyshortcuts="${t=>t.ariaKeyshortcuts}"
                aria-label="${t=>t.ariaLabel}"
                aria-labelledby="${t=>t.ariaLabelledby}"
                aria-live="${t=>t.ariaLive}"
                aria-owns="${t=>t.ariaOwns}"
                aria-relevant="${t=>t.ariaRelevant}"
                aria-roledescription="${t=>t.ariaRoledescription}"
                ${X("control")}
            />
            ${He(i,e)}
        </div>
    </template>
`});var Xh=l(()=>{Yh();Uo()});var Qh=l(()=>{});function Zh(i){let e=i.getRootNode();return e instanceof ShadowRoot?e.activeElement:document.activeElement}var Jh=l(()=>{});var Kh,Ht,Ti,eu=l(()=>{$();g();A();is();T();_i();me();ue();Pt();Jh();Kh=Object.freeze({[Ft.ArrowUp]:{[z.vertical]:-1},[Ft.ArrowDown]:{[z.vertical]:1},[Ft.ArrowLeft]:{[z.horizontal]:{[D.ltr]:-1,[D.rtl]:1}},[Ft.ArrowRight]:{[z.horizontal]:{[D.ltr]:1,[D.rtl]:-1}}}),Ht=class i extends b{constructor(){super(...arguments),this._activeIndex=0,this.direction=D.ltr,this.orientation=z.horizontal}get activeIndex(){return C.track(this,"activeIndex"),this._activeIndex}set activeIndex(e){this.$fastController.isConnected&&(this._activeIndex=Lt(0,this.focusableElements.length-1,e),C.notify(this,"activeIndex"))}slottedItemsChanged(){this.$fastController.isConnected&&this.reduceFocusableElements()}mouseDownHandler(e){var t;let o=(t=this.focusableElements)===null||t===void 0?void 0:t.findIndex(r=>r.contains(e.target));return o>-1&&this.activeIndex!==o&&this.setFocusedElement(o),!0}childItemsChanged(e,t){this.$fastController.isConnected&&this.reduceFocusableElements()}connectedCallback(){super.connectedCallback(),this.direction=Le(this)}focusinHandler(e){let t=e.relatedTarget;!t||this.contains(t)||this.setFocusedElement()}getDirectionalIncrementer(e){var t,o,r,s,a;return(a=(r=(o=(t=Kh[e])===null||t===void 0?void 0:t[this.orientation])===null||o===void 0?void 0:o[this.direction])!==null&&r!==void 0?r:(s=Kh[e])===null||s===void 0?void 0:s[this.orientation])!==null&&a!==void 0?a:0}keydownHandler(e){let t=e.key;if(!(t in Ft)||e.defaultPrevented||e.shiftKey)return!0;let o=this.getDirectionalIncrementer(t);if(!o)return!e.target.closest("[role=radiogroup]");let r=this.activeIndex+o;return this.focusableElements[r]&&e.preventDefault(),this.setFocusedElement(r),!0}get allSlottedItems(){return[...this.start.assignedElements(),...this.slottedItems,...this.end.assignedElements()]}reduceFocusableElements(){var e;let t=(e=this.focusableElements)===null||e===void 0?void 0:e[this.activeIndex];this.focusableElements=this.allSlottedItems.reduce(i.reduceFocusableItems,[]);let o=this.focusableElements.indexOf(t);this.activeIndex=Math.max(0,o),this.setFocusableElements()}setFocusedElement(e=this.activeIndex){this.activeIndex=e,this.setFocusableElements(),this.focusableElements[this.activeIndex]&&this.contains(Zh(this))&&this.focusableElements[this.activeIndex].focus()}static reduceFocusableItems(e,t){var o,r,s,a;let d=t.getAttribute("role")==="radio",h=(r=(o=t.$fastController)===null||o===void 0?void 0:o.definition.shadowOptions)===null||r===void 0?void 0:r.delegatesFocus,p=Array.from((a=(s=t.shadowRoot)===null||s===void 0?void 0:s.querySelectorAll("*"))!==null&&a!==void 0?a:[]).some(f=>ts(f));return!t.hasAttribute("disabled")&&!t.hasAttribute("hidden")&&(ts(t)||d||h||p)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(i.reduceFocusableItems,[])):e}setFocusableElements(){this.$fastController.isConnected&&this.focusableElements.length>0&&this.focusableElements.forEach((e,t)=>{e.tabIndex=this.activeIndex===t?0:-1})}};n([u],Ht.prototype,"direction",void 0);n([c],Ht.prototype,"orientation",void 0);n([u],Ht.prototype,"slottedItems",void 0);n([u],Ht.prototype,"slottedLabel",void 0);n([u],Ht.prototype,"childItems",void 0);Ti=class{};n([c({attribute:"aria-labelledby"})],Ti.prototype,"ariaLabelledby",void 0);n([c({attribute:"aria-label"})],Ti.prototype,"ariaLabel",void 0);E(Ti,F);E(Ht,_,Ti)});var tu=l(()=>{Qh();eu()});var iu=l(()=>{});var $e,ou=l(()=>{$e={top:"top",right:"right",bottom:"bottom",left:"left",start:"start",end:"end",topLeft:"top-left",topRight:"top-right",bottomLeft:"bottom-left",bottomRight:"bottom-right",topStart:"top-start",topEnd:"top-end",bottomStart:"bottom-start",bottomEnd:"bottom-end"}});var re,ru=l(()=>{$();g();A();Pt();T();ou();re=class extends b{constructor(){super(...arguments),this.anchor="",this.delay=300,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.horizontalInset="false",this.verticalInset="false",this.horizontalScaling="content",this.verticalScaling="content",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition=void 0,this.tooltipVisible=!1,this.currentDirection=D.ltr,this.showDelayTimer=null,this.hideDelayTimer=null,this.isAnchorHoveredFocused=!1,this.isRegionHovered=!1,this.handlePositionChange=e=>{this.classList.toggle("top",this.region.verticalPosition==="start"),this.classList.toggle("bottom",this.region.verticalPosition==="end"),this.classList.toggle("inset-top",this.region.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.region.verticalPosition==="insetEnd"),this.classList.toggle("center-vertical",this.region.verticalPosition==="center"),this.classList.toggle("left",this.region.horizontalPosition==="start"),this.classList.toggle("right",this.region.horizontalPosition==="end"),this.classList.toggle("inset-left",this.region.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.region.horizontalPosition==="insetEnd"),this.classList.toggle("center-horizontal",this.region.horizontalPosition==="center")},this.handleRegionMouseOver=e=>{this.isRegionHovered=!0},this.handleRegionMouseOut=e=>{this.isRegionHovered=!1,this.startHideDelayTimer()},this.handleAnchorMouseOver=e=>{if(this.tooltipVisible){this.isAnchorHoveredFocused=!0;return}this.startShowDelayTimer()},this.handleAnchorMouseOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.handleAnchorFocusIn=e=>{this.startShowDelayTimer()},this.handleAnchorFocusOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.startHideDelayTimer=()=>{this.clearHideDelayTimer(),this.tooltipVisible&&(this.hideDelayTimer=window.setTimeout(()=>{this.updateTooltipVisibility()},60))},this.clearHideDelayTimer=()=>{this.hideDelayTimer!==null&&(clearTimeout(this.hideDelayTimer),this.hideDelayTimer=null)},this.startShowDelayTimer=()=>{if(!this.isAnchorHoveredFocused){if(this.delay>1){this.showDelayTimer===null&&(this.showDelayTimer=window.setTimeout(()=>{this.startHover()},this.delay));return}this.startHover()}},this.startHover=()=>{this.isAnchorHoveredFocused=!0,this.updateTooltipVisibility()},this.clearShowDelayTimer=()=>{this.showDelayTimer!==null&&(clearTimeout(this.showDelayTimer),this.showDelayTimer=null)},this.getAnchor=()=>{let e=this.getRootNode();return e instanceof ShadowRoot?e.getElementById(this.anchor):document.getElementById(this.anchor)},this.handleDocumentKeydown=e=>{!e.defaultPrevented&&this.tooltipVisible&&e.key===Te&&(this.isAnchorHoveredFocused=!1,this.updateTooltipVisibility(),this.$emit("dismiss"))},this.updateTooltipVisibility=()=>{if(this.visible===!1)this.hideTooltip();else if(this.visible===!0){this.showTooltip();return}else{if(this.isAnchorHoveredFocused||this.isRegionHovered){this.showTooltip();return}this.hideTooltip()}},this.showTooltip=()=>{this.tooltipVisible||(this.currentDirection=Le(this),this.tooltipVisible=!0,document.addEventListener("keydown",this.handleDocumentKeydown),v.queueUpdate(this.setRegionProps))},this.hideTooltip=()=>{this.tooltipVisible&&(this.clearHideDelayTimer(),this.region!==null&&this.region!==void 0&&(this.region.removeEventListener("positionchange",this.handlePositionChange),this.region.viewportElement=null,this.region.anchorElement=null,this.region.removeEventListener("mouseover",this.handleRegionMouseOver),this.region.removeEventListener("mouseout",this.handleRegionMouseOut)),document.removeEventListener("keydown",this.handleDocumentKeydown),this.tooltipVisible=!1)},this.setRegionProps=()=>{this.tooltipVisible&&(this.region.viewportElement=this.viewportElement,this.region.anchorElement=this.anchorElement,this.region.addEventListener("positionchange",this.handlePositionChange),this.region.addEventListener("mouseover",this.handleRegionMouseOver,{passive:!0}),this.region.addEventListener("mouseout",this.handleRegionMouseOut,{passive:!0}))}}visibleChanged(){this.$fastController.isConnected&&(this.updateTooltipVisibility(),this.updateLayout())}anchorChanged(){this.$fastController.isConnected&&(this.anchorElement=this.getAnchor())}positionChanged(){this.$fastController.isConnected&&this.updateLayout()}anchorElementChanged(e){if(this.$fastController.isConnected){if(e!=null&&(e.removeEventListener("mouseover",this.handleAnchorMouseOver),e.removeEventListener("mouseout",this.handleAnchorMouseOut),e.removeEventListener("focusin",this.handleAnchorFocusIn),e.removeEventListener("focusout",this.handleAnchorFocusOut)),this.anchorElement!==null&&this.anchorElement!==void 0){this.anchorElement.addEventListener("mouseover",this.handleAnchorMouseOver,{passive:!0}),this.anchorElement.addEventListener("mouseout",this.handleAnchorMouseOut,{passive:!0}),this.anchorElement.addEventListener("focusin",this.handleAnchorFocusIn,{passive:!0}),this.anchorElement.addEventListener("focusout",this.handleAnchorFocusOut,{passive:!0});let t=this.anchorElement.id;this.anchorElement.parentElement!==null&&this.anchorElement.parentElement.querySelectorAll(":hover").forEach(o=>{o.id===t&&this.startShowDelayTimer()})}this.region!==null&&this.region!==void 0&&this.tooltipVisible&&(this.region.anchorElement=this.anchorElement),this.updateLayout()}}viewportElementChanged(){this.region!==null&&this.region!==void 0&&(this.region.viewportElement=this.viewportElement),this.updateLayout()}connectedCallback(){super.connectedCallback(),this.anchorElement=this.getAnchor(),this.updateTooltipVisibility()}disconnectedCallback(){this.hideTooltip(),this.clearShowDelayTimer(),this.clearHideDelayTimer(),super.disconnectedCallback()}updateLayout(){switch(this.verticalPositioningMode="locktodefault",this.horizontalPositioningMode="locktodefault",this.position){case $e.top:case $e.bottom:this.verticalDefaultPosition=this.position,this.horizontalDefaultPosition="center";break;case $e.right:case $e.left:case $e.start:case $e.end:this.verticalDefaultPosition="center",this.horizontalDefaultPosition=this.position;break;case $e.topLeft:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="left";break;case $e.topRight:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="right";break;case $e.bottomLeft:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="left";break;case $e.bottomRight:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="right";break;case $e.topStart:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="start";break;case $e.topEnd:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="end";break;case $e.bottomStart:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="start";break;case $e.bottomEnd:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="end";break;default:this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition="center";break}}};n([c({mode:"boolean"})],re.prototype,"visible",void 0);n([c],re.prototype,"anchor",void 0);n([c],re.prototype,"delay",void 0);n([c],re.prototype,"position",void 0);n([c({attribute:"auto-update-mode"})],re.prototype,"autoUpdateMode",void 0);n([c({attribute:"horizontal-viewport-lock"})],re.prototype,"horizontalViewportLock",void 0);n([c({attribute:"vertical-viewport-lock"})],re.prototype,"verticalViewportLock",void 0);n([u],re.prototype,"anchorElement",void 0);n([u],re.prototype,"viewportElement",void 0);n([u],re.prototype,"verticalPositioningMode",void 0);n([u],re.prototype,"horizontalPositioningMode",void 0);n([u],re.prototype,"horizontalInset",void 0);n([u],re.prototype,"verticalInset",void 0);n([u],re.prototype,"horizontalScaling",void 0);n([u],re.prototype,"verticalScaling",void 0);n([u],re.prototype,"verticalDefaultPosition",void 0);n([u],re.prototype,"horizontalDefaultPosition",void 0);n([u],re.prototype,"tooltipVisible",void 0);n([u],re.prototype,"currentDirection",void 0)});var nu=l(()=>{iu();ru()});var su=l(()=>{});function vt(i){return tt(i)&&i.getAttribute("role")==="treeitem"}var ie,xs=l(()=>{$();g();A();me();ue();T();ie=class extends b{constructor(){super(...arguments),this.expanded=!1,this.focusable=!1,this.isNestedItem=()=>vt(this.parentElement),this.handleExpandCollapseButtonClick=e=>{!this.disabled&&!e.defaultPrevented&&(this.expanded=!this.expanded)},this.handleFocus=e=>{this.setAttribute("tabindex","0")},this.handleBlur=e=>{this.setAttribute("tabindex","-1")}}expandedChanged(){this.$fastController.isConnected&&this.$emit("expanded-change",this)}selectedChanged(){this.$fastController.isConnected&&this.$emit("selected-change",this)}itemsChanged(e,t){this.$fastController.isConnected&&this.items.forEach(o=>{vt(o)&&(o.nested=!0)})}static focusItem(e){e.focusable=!0,e.focus()}childItemLength(){let e=this.childItems.filter(t=>vt(t));return e?e.length:0}};n([c({mode:"boolean"})],ie.prototype,"expanded",void 0);n([c({mode:"boolean"})],ie.prototype,"selected",void 0);n([c({mode:"boolean"})],ie.prototype,"disabled",void 0);n([u],ie.prototype,"focusable",void 0);n([u],ie.prototype,"childItems",void 0);n([u],ie.prototype,"items",void 0);n([u],ie.prototype,"nested",void 0);n([u],ie.prototype,"renderCollapsedChildren",void 0);E(ie,_)});var au=l(()=>{su();xs()});var lu=l(()=>{});var Zi,cu=l(()=>{$();g();A();xs();T();Zi=class extends b{constructor(){super(...arguments),this.currentFocused=null,this.handleFocus=e=>{if(!(this.slottedTreeItems.length<1)){if(e.target===this){this.currentFocused===null&&(this.currentFocused=this.getValidFocusableItem()),this.currentFocused!==null&&ie.focusItem(this.currentFocused);return}this.contains(e.target)&&(this.setAttribute("tabindex","-1"),this.currentFocused=e.target)}},this.handleBlur=e=>{e.target instanceof HTMLElement&&(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabindex","0")},this.handleKeyDown=e=>{if(e.defaultPrevented)return;if(this.slottedTreeItems.length<1)return!0;let t=this.getVisibleNodes();switch(e.key){case se:t.length&&ie.focusItem(t[0]);return;case ae:t.length&&ie.focusItem(t[t.length-1]);return;case be:if(e.target&&this.isFocusableElement(e.target)){let o=e.target;o instanceof ie&&o.childItemLength()>0&&o.expanded?o.expanded=!1:o instanceof ie&&o.parentElement instanceof ie&&ie.focusItem(o.parentElement)}return!1;case ve:if(e.target&&this.isFocusableElement(e.target)){let o=e.target;o instanceof ie&&o.childItemLength()>0&&!o.expanded?o.expanded=!0:o instanceof ie&&o.childItemLength()>0&&this.focusNextNode(1,e.target)}return;case W:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(1,e.target);return;case G:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(-1,e.target);return;case ee:this.handleClick(e);return}return!0},this.handleSelectedChange=e=>{if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!vt(e.target))return!0;let t=e.target;t.selected?(this.currentSelected&&this.currentSelected!==t&&(this.currentSelected.selected=!1),this.currentSelected=t):!t.selected&&this.currentSelected===t&&(this.currentSelected=null)},this.setItems=()=>{let e=this.treeView.querySelector("[aria-selected='true']");this.currentSelected=e,(this.currentFocused===null||!this.contains(this.currentFocused))&&(this.currentFocused=this.getValidFocusableItem()),this.nested=this.checkForNestedItems(),this.getVisibleNodes().forEach(o=>{vt(o)&&(o.nested=this.nested)})},this.isFocusableElement=e=>vt(e),this.isSelectedElement=e=>e.selected}slottedTreeItemsChanged(){this.$fastController.isConnected&&this.setItems()}connectedCallback(){super.connectedCallback(),this.setAttribute("tabindex","0"),v.queueUpdate(()=>{this.setItems()})}handleClick(e){if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!vt(e.target))return!0;let t=e.target;t.disabled||(t.selected=!t.selected)}focusNextNode(e,t){let o=this.getVisibleNodes();if(!o)return;let r=o[o.indexOf(t)+e];tt(r)&&ie.focusItem(r)}getValidFocusableItem(){let e=this.getVisibleNodes(),t=e.findIndex(this.isSelectedElement);return t===-1&&(t=e.findIndex(this.isFocusableElement)),t!==-1?e[t]:null}checkForNestedItems(){return this.slottedTreeItems.some(e=>vt(e)&&e.querySelector("[role='treeitem']"))}getVisibleNodes(){return yl(this,"[role='treeitem']")||[]}};n([c({attribute:"render-collapsed-nodes"})],Zi.prototype,"renderCollapsedNodes",void 0);n([u],Zi.prototype,"currentSelected",void 0);n([u],Zi.prototype,"slottedTreeItems",void 0)});var du=l(()=>{lu();cu()});var ws,Ji,v1,y1,x1,hu=l(()=>{ws=class{constructor(e){this.listenerCache=new WeakMap,this.query=e}bind(e){let{query:t}=this,o=this.constructListener(e);o.bind(t)(),t.addListener(o),this.listenerCache.set(e,o)}unbind(e){let t=this.listenerCache.get(e);t&&(this.query.removeListener(t),this.listenerCache.delete(e))}},Ji=class i extends ws{constructor(e,t){super(e),this.styles=t}static with(e){return t=>new i(e,t)}constructListener(e){let t=!1,o=this.styles;return function(){let{matches:s}=this;s&&!t?(e.$fastController.addStyles(o),t=s):!s&&t&&(e.$fastController.removeStyles(o),t=s)}}unbind(e){super.unbind(e),e.$fastController.removeStyles(this.styles)}},v1=Ji.with(window.matchMedia("(forced-colors)")),y1=Ji.with(window.matchMedia("(prefers-color-scheme: dark)")),x1=Ji.with(window.matchMedia("(prefers-color-scheme: light)"))});var uu=l(()=>{});var Ie,pu=l(()=>{Ie="not-allowed"});function B(i){return`${rm}:host{display:${i}}`}var rm,fu=l(()=>{rm=":host([hidden]){display:none}"});var U,mu=l(()=>{A();U=xl()?"focus-visible":"focus"});var gu=l(()=>{pu();fu();mu()});var bu=l(()=>{ue();Fo();hu();uu();gu();Pt();us()});var P=l(()=>{cl();Hl();Ul();Sn();Jl();tc();oc();sc();mc();Tc();Rc();Lc();_c();$c();Uc();Yn();jc();Jc();td();sd();hd();ud();pd();gd();vd();Ed();ls();Ld();Hd();Jt();jd();Gd();Zd();ih();nh();dh();mh();vh();wh();Ih();Rh();Fh();Bh();zh();Wh();Xh();tu();nu();au();du();bu()});function nm(i){return Jn.getOrCreate(i).withPrefix("vscode")}var vu=l(()=>{P()});function xu(i){window.addEventListener("load",()=>{new MutationObserver(()=>{yu(i)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),yu(i)})}function yu(i){let e=getComputedStyle(document.body),t=document.querySelector("body");if(t){let o=t.getAttribute("data-vscode-theme-kind");for(let[r,s]of i){let a=e.getPropertyValue(r).toString();if(o==="vscode-high-contrast")a.length===0&&s.name.includes("background")&&(a="transparent"),s.name==="button-icon-hover-background"&&(a="transparent");else if(o==="vscode-high-contrast-light"){if(a.length===0&&s.name.includes("background"))switch(s.name){case"button-primary-hover-background":a="#0F4A85";break;case"button-secondary-hover-background":a="transparent";break;case"button-icon-hover-background":a="transparent";break}}else s.name==="contrast-active-border"&&(a="transparent");s.setValueFor(t,a)}}}var wu=l(()=>{});function x(i,e){let t=ji.create(i);if(e){if(e.includes("--fake-vscode-token")){let o="id"+Math.random().toString(16).slice(2);e=`${e}-${o}`}Cu.set(e,t)}return ku||(xu(Cu),ku=!0),t}var Cu,ku,$u=l(()=>{P();wu();Cu=new Map,ku=!1});var Iu,I,ir,jR,nt,st,w,Ae,V,Q,qR,j,Si,Ei,N,q,or,rr,WR,GR,YR,XR,Tu,Su,Eu,Ru,Ou,nr,sr,Ri,Cs,Du,Au,ks,Fu,ai,$s,Is,ar,Lu,Pu,Mu,Bu,Ze,zt,_u,QR,at,yt,Vu,Hu,Ki,Je,ZR,zu,xt,lr,JR,Ts,Nu,Uu,ju,Nt,qu,KR,eO,Wu,he=l(()=>{$u();Iu=x("background","--vscode-editor-background").withDefault("#1e1e1e"),I=x("border-width").withDefault(1),ir=x("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518"),jR=x("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df"),nt=x("corner-radius").withDefault(0),st=x("corner-radius-round").withDefault(2),w=x("design-unit").withDefault(4),Ae=x("disabled-opacity").withDefault(.4),V=x("focus-border","--vscode-focusBorder").withDefault("#007fd4"),Q=x("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol"),qR=x("font-weight","--vscode-font-weight").withDefault("400"),j=x("foreground","--vscode-foreground").withDefault("#cccccc"),Si=x("input-height").withDefault("26"),Ei=x("input-min-width").withDefault("100px"),N=x("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),q=x("type-ramp-base-line-height").withDefault("normal"),or=x("type-ramp-minus1-font-size").withDefault("11px"),rr=x("type-ramp-minus1-line-height").withDefault("16px"),WR=x("type-ramp-minus2-font-size").withDefault("9px"),GR=x("type-ramp-minus2-line-height").withDefault("16px"),YR=x("type-ramp-plus1-font-size").withDefault("16px"),XR=x("type-ramp-plus1-line-height").withDefault("24px"),Tu=x("scrollbarWidth").withDefault("10px"),Su=x("scrollbarHeight").withDefault("10px"),Eu=x("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),Ru=x("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),Ou=x("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),nr=x("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),sr=x("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),Ri=x("button-border","--vscode-button-border").withDefault("transparent"),Cs=x("button-icon-background").withDefault("transparent"),Du=x("button-icon-corner-radius").withDefault("5px"),Au=x("button-icon-outline-offset").withDefault(0),ks=x("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),Fu=x("button-icon-padding").withDefault("3px"),ai=x("button-primary-background","--vscode-button-background").withDefault("#0e639c"),$s=x("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),Is=x("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),ar=x("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),Lu=x("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),Pu=x("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),Mu=x("button-padding-horizontal").withDefault("11px"),Bu=x("button-padding-vertical").withDefault("4px"),Ze=x("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),zt=x("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),_u=x("checkbox-corner-radius").withDefault(3),QR=x("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0"),at=x("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),yt=x("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),Vu=x("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),Hu=x("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),Ki=x("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),Je=x("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c"),ZR=x("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0"),zu=x("dropdown-list-max-height").withDefault("200px"),xt=x("input-background","--vscode-input-background").withDefault("#3c3c3c"),lr=x("input-foreground","--vscode-input-foreground").withDefault("#cccccc"),JR=x("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc"),Ts=x("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),Nu=x("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),Uu=x("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),ju=x("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Nt=x("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),qu=x("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799"),KR=x("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e"),eO=x("panel-view-border","--vscode-panel-border").withDefault("#80808059"),Wu=x("tag-corner-radius").withDefault("2px")});var Gu,Yu=l(()=>{g();P();he();Gu=(i,e)=>S`
	${B("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${Q};
		font-size: ${or};
		line-height: ${rr};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${nr};
		border: calc(${I} * 1px) solid ${Ri};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${sr};
		display: flex;
		height: calc(${w} * 4px);
		justify-content: center;
		min-width: calc(${w} * 4px + 2px);
		min-height: calc(${w} * 4px + 2px);
		padding: 3px 6px;
	}
`});var cr,Ss,Es=l(()=>{P();Yu();cr=class extends pt{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}},Ss=cr.compose({baseName:"badge",template:To,styles:Gu})});function Xu(i,e,t,o){var r=arguments.length,s=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(i,e,t,o);else for(var d=i.length-1;d>=0;d--)(a=i[d])&&(s=(r<3?a(s):r>3?a(e,t,s):a(e,t))||s);return r>3&&s&&Object.defineProperty(e,t,s),s}var Qu=l(()=>{});var sm,am,lm,cm,Zu,Ju=l(()=>{g();P();he();sm=S`
	${B("inline-flex")} :host {
		outline: none;
		font-family: ${Q};
		font-size: ${N};
		line-height: ${q};
		color: ${$s};
		background: ${ai};
		border-radius: calc(${st} * 1px);
		fill: currentColor;
		cursor: pointer;
	}
	.control {
		background: transparent;
		height: inherit;
		flex-grow: 1;
		box-sizing: border-box;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		padding: ${Bu} ${Mu};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${I} * 1px) solid ${Ri};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${Is};
	}
	:host(:active) {
		background: ${ai};
	}
	.control:${U} {
		outline: calc(${I} * 1px) solid ${V};
		outline-offset: calc(${I} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Ae};
		background: ${ai};
		cursor: ${Ie};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${w} * 4px);
		height: calc(${w} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`,am=S`
	:host([appearance='primary']) {
		background: ${ai};
		color: ${$s};
	}
	:host([appearance='primary']:hover) {
		background: ${Is};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${ai};
	}
	:host([appearance='primary']) .control:${U} {
		outline: calc(${I} * 1px) solid ${V};
		outline-offset: calc(${I} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${ai};
	}
`,lm=S`
	:host([appearance='secondary']) {
		background: ${ar};
		color: ${Lu};
	}
	:host([appearance='secondary']:hover) {
		background: ${Pu};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${ar};
	}
	:host([appearance='secondary']) .control:${U} {
		outline: calc(${I} * 1px) solid ${V};
		outline-offset: calc(${I} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${ar};
	}
`,cm=S`
	:host([appearance='icon']) {
		background: ${Cs};
		border-radius: ${Du};
		color: ${j};
	}
	:host([appearance='icon']:hover) {
		background: ${ks};
		outline: 1px dotted ${ir};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${Fu};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${ks};
	}
	:host([appearance='icon']) .control:${U} {
		outline: calc(${I} * 1px) solid ${V};
		outline-offset: ${Au};
	}
	:host([appearance='icon'][disabled]) {
		background: ${Cs};
	}
`,Zu=(i,e)=>S`
	${sm}
	${am}
	${lm}
	${cm}
`});var eo,Rs,Os=l(()=>{Qu();g();P();Ju();eo=class extends Re{connectedCallback(){if(super.connectedCallback(),!this.appearance){let e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,o){e==="appearance"&&o==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=o),e==="disabled"&&(this.disabled=o!==null)}};Xu([c],eo.prototype,"appearance",void 0);Rs=eo.compose({baseName:"button",template:ac,styles:Zu,shadowOptions:{delegatesFocus:!0}})});var Ku,ep=l(()=>{g();P();he();Ku=(i,e)=>S`
	${B("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${w} * 1px) 0;
		user-select: none;
		font-size: ${N};
		line-height: ${q};
	}
	.control {
		position: relative;
		width: calc(${w} * 4px + 2px);
		height: calc(${w} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${_u} * 1px);
		border: calc(${I} * 1px) solid ${zt};
		background: ${Ze};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${Q};
		color: ${j};
		padding-inline-start: calc(${w} * 2px + 2px);
		margin-inline-end: calc(${w} * 2px + 2px);
		cursor: pointer;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.checked-indicator {
		width: 100%;
		height: 100%;
		display: block;
		fill: ${j};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${j};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${Ze};
		border-color: ${zt};
	}
	:host(:enabled) .control:active {
		background: ${Ze};
		border-color: ${V};
	}
	:host(:${U}) .control {
		border: calc(${I} * 1px) solid ${V};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${Ie};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${Ae};
	}
`});var dr,Ds,As=l(()=>{P();ep();dr=class extends ii{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}},Ds=dr.compose({baseName:"checkbox",template:Oc,styles:Ku,checkedIndicator:`
		<svg 
			part="checked-indicator"
			class="checked-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
			/>
		</svg>
	`,indeterminateIndicator:`
		<div part="indeterminate-indicator" class="indeterminate-indicator"></div>
	`})});var tp,ip=l(()=>{g();tp=(i,e)=>S`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`});var op,rp=l(()=>{g();he();op=(i,e)=>S`
	:host {
		display: grid;
		padding: calc((${w} / 4) * 1px) 0;
		box-sizing: border-box;
		width: 100%;
		background: transparent;
	}
	:host(.header) {
	}
	:host(.sticky-header) {
		background: ${Iu};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${Vu};
		outline: 1px dotted ${ir};
		outline-offset: -1px;
	}
`});var np,sp=l(()=>{g();P();he();np=(i,e)=>S`
	:host {
		padding: calc(${w} * 1px) calc(${w} * 3px);
		color: ${j};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${Q};
		font-size: ${N};
		line-height: ${q};
		font-weight: 400;
		border: solid calc(${I} * 1px) transparent;
		border-radius: calc(${nt} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
	}
	:host(:${U}),
	:host(:focus),
	:host(:active) {
		background: ${at};
		border: solid calc(${I} * 1px) ${V};
		color: ${yt};
		outline: none;
	}
	:host(:${U}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${yt} !important;
	}
`});var hr,Fs,ur,Ls,pr,Ps,Ms=l(()=>{P();ip();rp();sp();hr=class extends de{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}},Fs=hr.compose({baseName:"data-grid",baseClass:de,template:bc,styles:tp}),ur=class extends le{},Ls=ur.compose({baseName:"data-grid-row",baseClass:le,template:xc,styles:op}),pr=class extends Ne{},Ps=pr.compose({baseName:"data-grid-cell",baseClass:Ne,template:Cc,styles:np})});var ap,lp=l(()=>{g();P();he();ap=(i,e)=>S`
	${B("block")} :host {
		border: none;
		border-top: calc(${I} * 1px) solid ${Hu};
		box-sizing: content-box;
		height: 0;
		margin: calc(${w} * 1px) 0;
		width: 100%;
	}
`});var fr,Bs,_s=l(()=>{P();lp();fr=class extends xi{},Bs=fr.compose({baseName:"divider",template:id,styles:ap})});var cp,dp=l(()=>{g();P();he();cp=(i,e)=>S`
	${B("inline-flex")} :host {
		background: ${Ki};
		border-radius: calc(${st} * 1px);
		box-sizing: border-box;
		color: ${j};
		contain: contents;
		font-family: ${Q};
		height: calc(${Si} * 1px);
		position: relative;
		user-select: none;
		min-width: ${Ei};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${I} * 1px) solid ${Je};
		border-radius: calc(${st} * 1px);
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: ${N};
		line-height: ${q};
		min-height: 100%;
		padding: 2px 6px 2px 8px;
		width: 100%;
	}
	.listbox {
		background: ${Ki};
		border: calc(${I} * 1px) solid ${V};
		border-radius: calc(${st} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${zu};
		padding: 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${U}) .control {
		border-color: ${V};
	}
	:host(:not([disabled]):hover) {
		background: ${Ki};
		border-color: ${Je};
	}
	:host(:${U}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${at};
		border: calc(${I} * 1px) solid transparent;
		color: ${yt};
	}
	:host([disabled]) {
		cursor: ${Ie};
		opacity: ${Ae};
	}
	:host([disabled]) .control {
		cursor: ${Ie};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${Ki};
		color: ${j};
		fill: currentcolor;
	}
	:host(:not([disabled])) .control:active {
		border-color: ${V};
	}
	:host(:empty) .listbox {
		display: none;
	}
	:host([open]) .control {
		border-color: ${V};
	}
	:host([open][position='above']) .listbox {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	:host([open][position='below']) .listbox {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
	:host([open][position='above']) .listbox {
		bottom: calc(${Si} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${Si} * 1px);
	}
	.selected-value {
		flex: 1 1 auto;
		font-family: inherit;
		overflow: hidden;
		text-align: start;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.indicator {
		flex: 0 0 auto;
		margin-inline-start: 1em;
	}
	slot[name='listbox'] {
		display: none;
		width: 100%;
	}
	:host([open]) slot[name='listbox'] {
		display: flex;
		position: absolute;
	}
	.end {
		margin-inline-start: auto;
	}
	.start,
	.end,
	.indicator,
	.select-indicator,
	::slotted(svg),
	::slotted(span) {
		fill: currentcolor;
		height: 1em;
		min-height: calc(${w} * 4px);
		min-width: calc(${w} * 4px);
		width: 1em;
	}
	::slotted([role='option']),
	::slotted(option) {
		flex: 0 0 auto;
	}
`});var mr,Vs,Hs=l(()=>{P();dp();mr=class extends Qe{},Vs=mr.compose({baseName:"dropdown",template:ph,styles:cp,indicator:`
		<svg 
			class="select-indicator"
			part="select-indicator"
			width="16" 
			height="16" 
			viewBox="0 0 16 16" 
			xmlns="http://www.w3.org/2000/svg" 
			fill="currentColor"
		>
			<path 
				fill-rule="evenodd" 
				clip-rule="evenodd" 
				d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
			/>
		</svg>
	`})});var hp,up=l(()=>{g();P();he();hp=(i,e)=>S`
	${B("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${Nu};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${Q};
		font-size: ${N};
		line-height: ${q};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${I} * 1px) solid transparent;
		border-radius: calc(${nt} * 1px);
		box-sizing: border-box;
		color: inherit;
		cursor: inherit;
		fill: inherit;
		font-family: inherit;
		height: inherit;
		padding: 0;
		outline: none;
		text-decoration: none;
		word-break: break-word;
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host(:hover) {
		color: ${Ts};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${Ts};
	}
	:host(:${U}) .control,
	:host(:focus) .control {
		border: calc(${I} * 1px) solid ${V};
	}
`});var gr,zs,Ns=l(()=>{P();up();gr=class extends ye{},zs=gr.compose({baseName:"link",template:zl,styles:hp,shadowOptions:{delegatesFocus:!0}})});var pp,fp=l(()=>{g();P();he();pp=(i,e)=>S`
	${B("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${nt};
		border: calc(${I} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${j};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${N};
		line-height: ${q};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${w} / 2) * 1px)
			calc((${w} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${U}) {
		border-color: ${V};
		background: ${at};
		color: ${j};
	}
	:host([aria-selected='true']) {
		background: ${at};
		border: calc(${I} * 1px) solid transparent;
		color: ${yt};
	}
	:host(:active) {
		background: ${at};
		color: ${yt};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${at};
		border: calc(${I} * 1px) solid transparent;
		color: ${yt};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${at};
		color: ${j};
	}
	:host([disabled]) {
		cursor: ${Ie};
		opacity: ${Ae};
	}
	:host([disabled]:hover) {
		background-color: inherit;
	}
	.content {
		grid-column-start: 2;
		justify-self: start;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`});var br,Us,js=l(()=>{P();fp();br=class extends Ue{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}},Us=br.compose({baseName:"option",template:fd,styles:pp})});var mp,gp=l(()=>{g();P();he();mp=(i,e)=>S`
	${B("grid")} :host {
		box-sizing: border-box;
		font-family: ${Q};
		font-size: ${N};
		line-height: ${q};
		color: ${j};
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr;
		overflow-x: auto;
	}
	.tablist {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: auto;
		column-gap: calc(${w} * 8px);
		position: relative;
		width: max-content;
		align-self: end;
		padding: calc(${w} * 1px) calc(${w} * 1px) 0;
		box-sizing: border-box;
	}
	.start,
	.end {
		align-self: center;
	}
	.activeIndicator {
		grid-row: 2;
		grid-column: 1;
		width: 100%;
		height: calc((${w} / 4) * 1px);
		justify-self: center;
		background: ${Nt};
		margin: 0;
		border-radius: calc(${nt} * 1px);
	}
	.activeIndicatorTransition {
		transition: transform 0.01s linear;
	}
	.tabpanel {
		grid-row: 2;
		grid-column-start: 1;
		grid-column-end: 4;
		position: relative;
	}
`});var bp,vp=l(()=>{g();P();he();bp=(i,e)=>S`
	${B("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${Q};
		font-size: ${N};
		line-height: ${q};
		height: calc(${w} * 7px);
		padding: calc(${w} * 1px) 0;
		color: ${qu};
		fill: currentcolor;
		border-radius: calc(${nt} * 1px);
		border: solid calc(${I} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Nt};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Nt};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Nt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Nt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Nt};
		fill: currentcolor;
	}
	:host(:${U}) {
		outline: none;
		border: solid calc(${I} * 1px) ${ju};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${w} * 2px);
	}
`});var yp,xp=l(()=>{g();P();he();yp=(i,e)=>S`
	${B("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${I} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${N};
		line-height: ${q};
		padding: 10px calc((${w} + 2) * 1px);
	}
`});var vr,qs,yr,Ws,xr,Gs,Ys=l(()=>{P();gp();vp();xp();vr=class extends qe{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=er.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}},qs=vr.compose({baseName:"panels",template:_h,styles:mp}),yr=class extends Qi{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}},Ws=yr.compose({baseName:"panel-tab",template:Lh,styles:bp}),xr=class extends Ko{},Gs=xr.compose({baseName:"panel-view",template:Oh,styles:yp})});var wp,Cp=l(()=>{g();P();he();wp=(i,e)=>S`
	${B("flex")} :host {
		align-items: center;
		outline: none;
		height: calc(${w} * 7px);
		width: calc(${w} * 7px);
		margin: 0;
	}
	.progress {
		height: 100%;
		width: 100%;
	}
	.background {
		fill: none;
		stroke: transparent;
		stroke-width: calc(${w} / 2 * 1px);
	}
	.indeterminate-indicator-1 {
		fill: none;
		stroke: ${Uu};
		stroke-width: calc(${w} / 2 * 1px);
		stroke-linecap: square;
		transform-origin: 50% 50%;
		transform: rotate(-90deg);
		transition: all 0.2s ease-in-out;
		animation: spin-infinite 2s linear infinite;
	}
	@keyframes spin-infinite {
		0% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(0deg);
		}
		50% {
			stroke-dasharray: 21.99px 21.99px;
			transform: rotate(450deg);
		}
		100% {
			stroke-dasharray: 0.01px 43.97px;
			transform: rotate(1080deg);
		}
	}
`});var wr,Xs,Qs=l(()=>{P();Cp();wr=class extends gt{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,o){e==="value"&&this.removeAttribute("value")}},Xs=wr.compose({baseName:"progress-ring",template:Nd,styles:wp,indeterminateIndicator:`
		<svg class="progress" part="progress" viewBox="0 0 16 16">
			<circle
				class="background"
				part="background"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
			<circle
				class="indeterminate-indicator-1"
				part="indeterminate-indicator-1"
				cx="8px"
				cy="8px"
				r="7px"
			></circle>
		</svg>
	`})});var kp,$p=l(()=>{g();P();he();kp=(i,e)=>S`
	${B("flex")} :host {
		align-items: flex-start;
		margin: calc(${w} * 1px) 0;
		flex-direction: column;
	}
	.positioning-region {
		display: flex;
		flex-wrap: wrap;
	}
	:host([orientation='vertical']) .positioning-region {
		flex-direction: column;
	}
	:host([orientation='horizontal']) .positioning-region {
		flex-direction: row;
	}
	::slotted([slot='label']) {
		color: ${j};
		font-size: ${N};
		margin: calc(${w} * 1px) 0;
	}
`});var Cr,Zs,Js=l(()=>{A();P();$p();Cr=class extends Xe{connectedCallback(){super.connectedCallback();let e=this.querySelector("label");if(e){let t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}},Zs=Cr.compose({baseName:"radio-group",template:Yd,styles:kp})});var Ip,Tp=l(()=>{g();P();he();Ip=(i,e)=>S`
	${B("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${N};
		line-height: ${q};
		margin: calc(${w} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${Ze};
		border-radius: 999px;
		border: calc(${I} * 1px) solid ${zt};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${w} * 4px);
		position: relative;
		outline: none;
		width: calc(${w} * 4px);
	}
	.label {
		color: ${j};
		cursor: pointer;
		font-family: ${Q};
		margin-inline-end: calc(${w} * 2px + 2px);
		padding-inline-start: calc(${w} * 2px + 2px);
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.control,
	.checked-indicator {
		flex-shrink: 0;
	}
	.checked-indicator {
		background: ${j};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${w} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${Ze};
		border-color: ${zt};
	}
	:host(:not([disabled])) .control:active {
		background: ${Ze};
		border-color: ${V};
	}
	:host(:${U}) .control {
		border: calc(${I} * 1px) solid ${V};
	}
	:host([aria-checked='true']) .control {
		background: ${Ze};
		border: calc(${I} * 1px) solid ${zt};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${Ze};
		border: calc(${I} * 1px) solid ${zt};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${Ze};
		border: calc(${I} * 1px) solid ${V};
	}
	:host([aria-checked="true"]:${U}:not([disabled])) .control {
		border: calc(${I} * 1px) solid ${V};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ie};
	}
	:host([aria-checked='true']) .checked-indicator {
		opacity: 1;
	}
	:host([disabled]) {
		opacity: ${Ae};
	}
`});var kr,Ks,ea=l(()=>{P();Tp();kr=class extends si{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}},Ks=kr.compose({baseName:"radio",template:Jd,styles:Ip,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`})});var Sp,Ep=l(()=>{g();P();he();Sp=(i,e)=>S`
	${B("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${Q};
		font-size: ${or};
		line-height: ${rr};
	}
	.control {
		background-color: ${nr};
		border: calc(${I} * 1px) solid ${Ri};
		border-radius: ${Wu};
		color: ${sr};
		padding: calc(${w} * 0.5px) calc(${w} * 1px);
		text-transform: uppercase;
	}
`});var $r,ta,ia=l(()=>{P();Ep();$r=class extends pt{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}},ta=$r.compose({baseName:"tag",template:To,styles:Sp})});var Rp,Op=l(()=>{g();P();he();Rp=(i,e)=>S`
	${B("inline-block")} :host {
		font-family: ${Q};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${lr};
		background: ${xt};
		border-radius: calc(${st} * 1px);
		border: calc(${I} * 1px) solid ${Je};
		font: inherit;
		font-size: ${N};
		line-height: ${q};
		padding: calc(${w} * 2px + 1px);
		width: 100%;
		min-width: ${Ei};
		resize: none;
	}
	.control:hover:enabled {
		background: ${xt};
		border-color: ${Je};
	}
	.control:active:enabled {
		background: ${xt};
		border-color: ${V};
	}
	.control:hover,
	.control:${U},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${Tu};
		height: ${Su};
	}
	.control::-webkit-scrollbar-corner {
		background: ${xt};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${Eu};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${Ru};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${Ou};
	}
	:host(:focus-within:not([disabled])) .control {
		border-color: ${V};
	}
	:host([resize='both']) .control {
		resize: both;
	}
	:host([resize='horizontal']) .control {
		resize: horizontal;
	}
	:host([resize='vertical']) .control {
		resize: vertical;
	}
	.label {
		display: block;
		color: ${j};
		cursor: pointer;
		font-size: ${N};
		line-height: ${q};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ie};
	}
	:host([disabled]) {
		opacity: ${Ae};
	}
	:host([disabled]) .control {
		border-color: ${Je};
	}
`});var Ir,oa,ra=l(()=>{P();Op();Ir=class extends fe{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}},oa=Ir.compose({baseName:"text-area",template:jh,styles:Rp,shadowOptions:{delegatesFocus:!0}})});var Dp,Ap=l(()=>{g();P();he();Dp=(i,e)=>S`
	${B("inline-block")} :host {
		font-family: ${Q};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${lr};
		background: ${xt};
		border-radius: calc(${st} * 1px);
		border: calc(${I} * 1px) solid ${Je};
		height: calc(${Si} * 1px);
		min-width: ${Ei};
	}
	.control {
		-webkit-appearance: none;
		font: inherit;
		background: transparent;
		border: 0;
		color: inherit;
		height: calc(100% - (${w} * 1px));
		width: 100%;
		margin-top: auto;
		margin-bottom: auto;
		border: none;
		padding: 0 calc(${w} * 2px + 1px);
		font-size: ${N};
		line-height: ${q};
	}
	.control:hover,
	.control:${U},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${j};
		cursor: pointer;
		font-size: ${N};
		line-height: ${q};
		margin-bottom: 2px;
	}
	.label__hidden {
		display: none;
		visibility: hidden;
	}
	.start,
	.end {
		display: flex;
		margin: auto;
		fill: currentcolor;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${w} * 4px);
		height: calc(${w} * 4px);
	}
	.start {
		margin-inline-start: calc(${w} * 2px);
	}
	.end {
		margin-inline-end: calc(${w} * 2px);
	}
	:host(:hover:not([disabled])) .root {
		background: ${xt};
		border-color: ${Je};
	}
	:host(:active:not([disabled])) .root {
		background: ${xt};
		border-color: ${V};
	}
	:host(:focus-within:not([disabled])) .root {
		border-color: ${V};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Ie};
	}
	:host([disabled]) {
		opacity: ${Ae};
	}
	:host([disabled]) .control {
		border-color: ${Je};
	}
`});var Tr,na,sa=l(()=>{P();Ap();Tr=class extends xe{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}},na=Tr.compose({baseName:"text-field",template:Gh,styles:Dp,shadowOptions:{delegatesFocus:!0}})});var dm,Fp=l(()=>{Es();Os();As();Ms();_s();Hs();Ns();js();Ys();Qs();Js();ea();ia();ra();sa();dm={vsCodeBadge:Ss,vsCodeButton:Rs,vsCodeCheckbox:Ds,vsCodeDataGrid:Fs,vsCodeDataGridCell:Ps,vsCodeDataGridRow:Ls,vsCodeDivider:Bs,vsCodeDropdown:Vs,vsCodeLink:zs,vsCodeOption:Us,vsCodePanels:qs,vsCodePanelTab:Ws,vsCodePanelView:Gs,vsCodeProgressRing:Xs,vsCodeRadioGroup:Zs,vsCodeRadio:Ks,vsCodeTag:ta,vsCodeTextArea:oa,vsCodeTextField:na,register(i,...e){if(i)for(let t in this)t!=="register"&&this[t]().register(i,...e)}}});var Lp={};zp(Lp,{Badge:()=>cr,Button:()=>eo,Checkbox:()=>dr,DataGrid:()=>hr,DataGridCell:()=>pr,DataGridCellTypes:()=>Ge,DataGridRow:()=>ur,DataGridRowTypes:()=>ft,Divider:()=>fr,DividerRole:()=>_o,Dropdown:()=>mr,DropdownPosition:()=>it,GenerateHeaderOptions:()=>ti,Link:()=>gr,Option:()=>br,PanelTab:()=>yr,PanelView:()=>xr,Panels:()=>vr,ProgressRing:()=>wr,Radio:()=>kr,RadioGroup:()=>Cr,RadioGroupOrientation:()=>z,Tag:()=>$r,TextArea:()=>Ir,TextAreaResize:()=>Ii,TextField:()=>Tr,TextFieldType:()=>No,allComponents:()=>dm,provideVSCodeDesignSystem:()=>nm,vsCodeBadge:()=>Ss,vsCodeButton:()=>Rs,vsCodeCheckbox:()=>Ds,vsCodeDataGrid:()=>Fs,vsCodeDataGridCell:()=>Ps,vsCodeDataGridRow:()=>Ls,vsCodeDivider:()=>Bs,vsCodeDropdown:()=>Vs,vsCodeLink:()=>zs,vsCodeOption:()=>Us,vsCodePanelTab:()=>Ws,vsCodePanelView:()=>Gs,vsCodePanels:()=>qs,vsCodeProgressRing:()=>Xs,vsCodeRadio:()=>Ks,vsCodeRadioGroup:()=>Zs,vsCodeTag:()=>ta,vsCodeTextArea:()=>oa,vsCodeTextField:()=>na});var Pp=l(()=>{vu();Fp();Es();Os();As();Ms();_s();Hs();Ns();js();Ys();Qs();Js();ea();ia();ra();sa()});function Z(i,e,t){let o=document.createElement(i);return e&&(o.className=e),t!==void 0&&(o.textContent=t),o}function kt(i,e,t){let o=document.createElement("vscode-button");if(typeof i=="string")o.id=i,o.textContent=e||"",t&&o.setAttribute("appearance",t);else{let r=i;o.id=r.id,o.textContent=r.label,r.appearance&&o.setAttribute("appearance",r.appearance),r.hidden&&(o.hidden=!0)}return o}var $t={"btn-refresh":{id:"btn-refresh",label:"\u{1F504} Refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"\u{1F916} Details"},"btn-chart":{id:"btn-chart",label:"\u{1F4C8} Chart"},"btn-usage":{id:"btn-usage",label:"\u{1F4CA} Usage Analysis"},"btn-diagnostics":{id:"btn-diagnostics",label:"\u{1F50D} Diagnostics"},"btn-maturity":{id:"btn-maturity",label:"\u{1F3AF} Fluency Score"},"btn-dashboard":{id:"btn-dashboard",label:"\u{1F4CA} Team Dashboard"},"btn-level-viewer":{id:"btn-level-viewer",label:"\u{1F50D} Level Viewer"},"btn-environmental":{id:"btn-environmental",label:"\u{1F33F} Environmental Impact"}};var la={$schema:"http://json-schema.org/draft-07/schema#",description:"Character-to-token ratio estimators for different AI models. Used to estimate token counts from text length.",estimators:{"gpt-4":.25,"gpt-4.1":.25,"gpt-4.1-mini":.25,"gpt-4o":.25,"gpt-4o-mini":.25,"gpt-4-turbo":.25,"gpt-3.5-turbo":.25,"gpt-5":.25,"gpt-5-codex":.25,"gpt-5-mini":.25,"gpt-5.1":.25,"gpt-5.1-codex":.25,"gpt-5.1-codex-max":.25,"gpt-5.1-codex-mini":.25,"gpt-5.2":.25,"gpt-5.2-codex":.25,"gpt-5.2-pro":.25,"gpt-5.3-codex":.25,"gpt-5.4":.25,"gpt-5.4-mini":.25,"gpt-4.1-nano":.25,"gemini-2.0-flash":.25,"gemini-2.0-flash-lite":.25,"gemini-2.5-flash":.25,"gemini-2.5-flash-lite":.25,"claude-sonnet-3.5":.24,"claude-sonnet-3.7":.24,"claude-sonnet-4":.24,"claude-sonnet-4.5":.24,"claude-sonnet-4.6":.24,"claude-haiku":.24,"claude-haiku-4.5":.24,"claude-opus-4.1":.24,"claude-opus-4.5":.24,"claude-opus-4.6":.24,"claude-opus-4.6-(fast-mode)-(preview)":.24,"claude-opus-4.6-fast":.24,"gemini-2.5-pro":.25,"gemini-3-flash":.25,"gemini-3-pro":.25,"gemini-3-pro-preview":.25,"gemini-3.1-pro":.25,"gemini-3.1-flash-lite":.25,"grok-code-fast-1":.25,"raptor-mini":.25,goldeneye:.25,"o1-preview":.25,"o1-mini":.25,"o3-mini":.25,"o4-mini":.25,"gpt-5.5":.25,"mistral-large-latest":.25,"mistral-large-2512":.25,"mistral-large-2411":.25,"magistral-medium-latest":.25,"mistral-medium-latest":.25,"mistral-medium-3-5":.25,"mistral-medium-2505":.25,"mistral-small-latest":.25,"mistral-small-2503":.25,"mistral-small-2603":.25,"codestral-latest":.25,"codestral-2501":.25,"open-mistral-nemo":.25,"ministral-3b-2410":.25,"ministral-8b-2410":.25,"magistral-small-latest":.25,"devstral-medium-2507":.25,"pixtral-large-2411":.25,"gemini-3.5-flash":.25,"claude-opus-4.8":.24,"qwen2.5":.25,"mai-code-1-flash[^mai-code-1-flash]":.25,"mai-code-1-flash":.25,"claude-fable-5":.24}};var _m=la.estimators,Ar,ca=!0;function da(i){ca=i}function ci(i,e){return new Intl.NumberFormat(Ar,{minimumFractionDigits:e,maximumFractionDigits:e}).format(i)}function Up(i){return i.toLocaleString(Ar)}function Oi(i){return ca?new Intl.NumberFormat(Ar,{notation:"compact",maximumFractionDigits:1}).format(i):Up(i)}function ha(i){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let t=document.querySelector(".button-row");if(t)for(let o of e){let r=document.createElement("vscode-button");r.id=`ext-point-${o.id}`,r.textContent=o.label,r.addEventListener("click",()=>{i.postMessage({command:"extensionPointAction",buttonId:o.id})}),t.append(r)}}var ua=`/**
 * Shared theme variables for all webview panels
 * Uses VS Code theme tokens for automatic light/dark theme support
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
	
	/* Shadow for cards */
	--shadow-color: rgb(0, 0, 0, 0.16);
	--shadow-hover-color: rgb(0, 0, 0, 0.24);
}

/* Light theme adjustments */
body[data-vscode-theme-kind="vscode-light"],
body[data-vscode-theme-kind="vscode-high-contrast-light"] {
	--shadow-color: rgb(0, 0, 0, 0.08);
	--shadow-hover-color: rgb(0, 0, 0, 0.12);
}

/* High contrast mode adjustments */
body[data-vscode-theme-kind="vscode-high-contrast"],
body[data-vscode-theme-kind="vscode-high-contrast-light"] {
	--border-color: var(--vscode-contrastBorder);
	--border-subtle: var(--vscode-contrastBorder);
}
`;var pa=`body {
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

.button-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
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
`;function fa(i){return window[i]}function ma(i){window.addEventListener("message",e=>{i(e.data)})}var hm=120,um=20,pm=41,fm=180,mm=8,gm=3,bm=8,vm=50,ym=.25,xm=150,wm=12,Cm=2,Ut=acquireVsCodeApi(),Mp=fa("__INITIAL_ENVIRONMENTAL__");function Sr(i){return i/30*365.25}function Y(i){return i<.001?ci(i,6):i<1?ci(i,4):i<=100?ci(i,2):i<=1e3?ci(i,1):ci(Math.round(i),0)}function Er(i){return i>=1e3?`${Y(i/1e3)} kg`:`${Y(i)} g`}var Rr=i=>[{icon:"\u{1F697}",text:`${Y(i/hm)} km driving (EU petrol car)`},{icon:"\u{1F682}",text:`${Y(i/pm)} km by train (EU intercity)`},{icon:"\u2708\uFE0F",text:`${Y(i/fm)} km flying (economy, short-haul)`},{icon:"\u{1FAD6}",text:`${Y(i/um)} kettle boils`},{icon:"\u{1F4F1}",text:`${Y(i/mm)} smartphone charges`},{icon:"\u{1F4A1}",text:`${Y(i/gm)} hours of LED lighting (10 W)`}],Or=i=>[{icon:"\u2615",text:`${Y(i/ym)} mugs of tea/coffee`},{icon:"\u{1F6BF}",text:`${Y(i/bm)} shower minutes`},{icon:"\u{1F455}",text:`${Y(i/vm)} washing machine loads`},{icon:"\u{1F6C1}",text:`${Y(i/xm)} standard bathtubs`},{icon:"\u{1F37D}\uFE0F",text:`${Y(i/wm)} dishwasher cycles`},{icon:"\u{1F4A7}",text:`${Y(i/Cm)} days of drinking water`}],Dr=i=>{let e=i*365.25;return i>=1?[{icon:"\u{1F333}",text:`${Y(i)} \xD7 a tree's full annual CO\u2082 absorption`},{icon:"\u{1F332}",text:`Plant ${Math.ceil(i)} trees to fully offset this per year`}]:[{icon:"\u{1F333}",text:`${Y(i*100)} % of one tree's annual absorption`},{icon:"\u{1F4C5}",text:`1 tree absorbs this CO\u2082 in about ${Y(e)} days`}]};function Bp(i){da(i.compactNumbers!==!1);let e=document.getElementById("root");if(!e)return;let t=Sr(i.last30Days.co2),o=Sr(i.last30Days.waterUsage),r=Sr(i.last30Days.treesEquivalent),s=Math.round(Sr(i.last30Days.tokens)),a=new Date(i.lastUpdated);e.replaceChildren();let d=document.createElement("style");d.textContent=ua;let h=document.createElement("style");h.textContent=pa;let p=Z("div","container"),f=Z("div","header"),m=Z("div","title","\u{1F33F} Environmental Impact"),y=Z("div","button-row");y.append(kt($t["btn-refresh"]),kt($t["btn-details"]),kt($t["btn-chart"]),kt($t["btn-usage"]),kt($t["btn-diagnostics"]),kt($t["btn-maturity"])),i.backendConfigured&&y.append(kt($t["btn-dashboard"])),f.append(m,y);let O=Z("div","footer",`Last updated: ${a.toLocaleString()} \xB7 Updates every 5 minutes`),M=Z("div","sections");M.append(Im(i,s,t,o,r)),M.append(Tm()),p.append(f,M,O),e.append(d,h,p),Sm()}function km(i,e,t){let o=Z("div","analogy-col");if(o.append(Z("div","analogy-col-header",i)),o.append(Z("div","metric-primary-value",e)),t)for(let r of t){let s=Z("div","analogy-item");s.append(Z("span","analogy-icon",r.icon));let a=document.createElement("span");a.textContent=r.text,s.append(a),o.append(s)}return o}function $m(i,e){let t=Z("div","metric-card"),o=Z("div","metric-card-header"),r=Z("span","metric-card-icon",e.icon);r.style.color=e.color,o.append(r,Z("span","metric-card-label",e.label)),t.append(o);let s=Z("div","analogy-grid");for(let[a,d,h]of i)s.append(km(a,d,h));return t.append(s),t}function Im(i,e,t,o,r){let s=Z("div","section"),a=Z("h3");a.textContent="\u{1F30D} Impact at a Glance",s.append(a);let d=Z("p","section-intro");d.textContent="All figures are estimates based on average data center energy and water consumption figures. Analogies use European averages. Treat these as order-of-magnitude indicators, not precise measurements.",s.append(d);let h=[[["\u{1F4C5} Today",Oi(i.today.tokens),null],["\u{1F4C8} Last 30 Days",Oi(i.last30Days.tokens),null],["\u{1F4C6} Previous Month",Oi(i.lastMonth.tokens),null],["\u{1F30D} Projected Year",Oi(e),null]],[["\u{1F4C5} Today",Er(i.today.co2),Rr(i.today.co2)],["\u{1F4C8} Last 30 Days",Er(i.last30Days.co2),Rr(i.last30Days.co2)],["\u{1F4C6} Previous Month",Er(i.lastMonth.co2),Rr(i.lastMonth.co2)],["\u{1F30D} Projected Year",Er(t),Rr(t)]],[["\u{1F4C5} Today",`${Y(i.today.waterUsage)} L`,Or(i.today.waterUsage)],["\u{1F4C8} Last 30 Days",`${Y(i.last30Days.waterUsage)} L`,Or(i.last30Days.waterUsage)],["\u{1F4C6} Previous Month",`${Y(i.lastMonth.waterUsage)} L`,Or(i.lastMonth.waterUsage)],["\u{1F30D} Projected Year",`${Y(o)} L`,Or(o)]],[["\u{1F4C5} Today",`${Y(i.today.treesEquivalent)} \u{1F333}`,Dr(i.today.treesEquivalent)],["\u{1F4C8} Last 30 Days",`${Y(i.last30Days.treesEquivalent)} \u{1F333}`,Dr(i.last30Days.treesEquivalent)],["\u{1F4C6} Previous Month",`${Y(i.lastMonth.treesEquivalent)} \u{1F333}`,Dr(i.lastMonth.treesEquivalent)],["\u{1F30D} Projected Year",`${Y(r)} \u{1F333}`,Dr(r)]]],p=[{icon:"\u{1F7E3}",label:"Tokens (total)",color:"#c37bff"},{icon:"\u{1F331}",label:"Estimated CO\u2082",color:"#7fe36f"},{icon:"\u{1F4A7}",label:"Estimated Water",color:"#6fc3ff"},{icon:"\u{1F333}",label:"Tree equivalent",color:"#9de67f"}],f=Z("div","metric-cards");return h.forEach((m,y)=>f.append($m(m,p[y]))),s.append(f),s}function Tm(){let i=Z("div","section"),e=Z("h3");e.textContent="\u{1F4A1} Calculation & Estimates",i.append(e);let t=document.createElement("ul");return t.className="notes",["Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) under Usage Based Billing.","Estimated CO\u2082 is based on ~0.2 g CO\u2082e per 1,000 tokens (average data center energy mix and PUE).","Estimated water usage is based on ~0.3 L per 1,000 tokens (data center cooling estimates).","Tree equivalent represents the fraction of a single mature tree's annual CO\u2082 absorption (~21 kg/year).","CO\u2082 analogies: petrol car \u2248 120 g/km \xB7 intercity train \u2248 41 g/km \xB7 economy flight \u2248 180 g/km (ICAO avg.) \xB7 smartphone charge \u2248 8 g \xB7 LED bulb \u2248 3 g/hr (10 W, EU grid) \xB7 kettle boil \u2248 20 g.","Water analogies: shower \u2248 8 L/min \xB7 washing machine \u2248 50 L \xB7 standard bathtub \u2248 150 L \xB7 dishwasher \u2248 12 L \xB7 mug of tea \u2248 250 mL \xB7 daily drinking water \u2248 2 L/person.","All analogies are order-of-magnitude estimates. Actual values depend on your region's energy mix and device efficiency."].forEach(r=>{let s=document.createElement("li");s.textContent=r,t.append(s)}),i.append(t),i}function Sm(){document.getElementById("btn-refresh")?.addEventListener("click",()=>Ut.postMessage({command:"refresh"})),document.getElementById("btn-details")?.addEventListener("click",()=>Ut.postMessage({command:"showDetails"})),document.getElementById("btn-chart")?.addEventListener("click",()=>Ut.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>Ut.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>Ut.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>Ut.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>Ut.postMessage({command:"showDashboard"})),ha(Ut)}ma(i=>{i.command==="updateStats"&&Bp(i.data)});async function Em(){let{provideVSCodeDesignSystem:i,vsCodeButton:e}=await Promise.resolve().then(()=>(Pp(),Lp));if(i().register(e()),Mp)Bp(Mp);else{let t=document.getElementById("root");if(t){t.textContent="";let o=document.createElement("div");o.style.padding="16px",o.style.color="#e7e7e7",o.textContent="No data available.",t.append(o)}}}Em();})();
/*! Bundled license information:

tslib/tslib.es6.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)

tabbable/dist/index.esm.js:
  (*!
  * tabbable 5.3.3
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  *)
*/
