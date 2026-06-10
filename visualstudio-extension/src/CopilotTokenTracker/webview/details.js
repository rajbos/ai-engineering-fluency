"use strict";(()=>{var pm=Object.defineProperty;var c=(o,e)=>()=>(o&&(e=o(o=0)),e);var mm=(o,e)=>{for(var t in e)pm(o,t,{get:e[t],enumerable:!0})};function gi(){let o=new WeakMap;return function(e){let t=o.get(e);if(t===void 0){let i=Reflect.getPrototypeOf(e);for(;t===void 0&&i!==null;)t=o.get(i),i=Reflect.getPrototypeOf(i);t=t===void 0?[]:t.slice(0),o.set(e,t)}return t}}var et,Ba,Zt,ze,bt=c(()=>{et=(function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}})();et.trustedTypes===void 0&&(et.trustedTypes={createPolicy:(o,e)=>e});Ba={configurable:!1,enumerable:!1,writable:!1};et.FAST===void 0&&Reflect.defineProperty(et,"FAST",Object.assign({value:Object.create(null)},Ba));Zt=et.FAST;if(Zt.getById===void 0){let o=Object.create(null);Reflect.defineProperty(Zt,"getById",Object.assign({value(e,t){let i=o[e];return i===void 0&&(i=t?o[e]=t():null),i}},Ba))}ze=Object.freeze([])});var Wn,Na,Yn,zo,Xn,bi,v,Ue=c(()=>{bt();Wn=et.FAST.getById(1,()=>{let o=[],e=[];function t(){if(e.length)throw e.shift()}function i(a){try{a.call()}catch(l){e.push(l),setTimeout(t,0)}}function n(){let l=0;for(;l<o.length;)if(i(o[l]),l++,l>1024){for(let h=0,u=o.length-l;h<u;h++)o[h]=o[h+l];o.length-=l,l=0}o.length=0}function r(a){o.length<1&&et.requestAnimationFrame(n),o.push(a)}return Object.freeze({enqueue:r,process:n})}),Na=et.trustedTypes.createPolicy("fast-html",{createHTML:o=>o}),Yn=Na,zo=`fast-${Math.random().toString(36).substring(2,8)}`,Xn=`${zo}{`,bi=`}${zo}`,v=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(o){if(Yn!==Na)throw new Error("The HTML policy can only be set once.");Yn=o},createHTML(o){return Yn.createHTML(o)},isMarker(o){return o&&o.nodeType===8&&o.data.startsWith(zo)},extractDirectiveIndexFromMarker(o){return parseInt(o.data.replace(`${zo}:`,""))},createInterpolationPlaceholder(o){return`${Xn}${o}${bi}`},createCustomAttributePlaceholder(o,e){return`${o}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(o){return`<!--${zo}:${o}-->`},queueUpdate:Wn.enqueue,processUpdates:Wn.process,nextUpdate(){return new Promise(Wn.enqueue)},setAttribute(o,e,t){t==null?o.removeAttribute(e):o.setAttribute(e,t)},setBooleanAttribute(o,e,t){t?o.setAttribute(e,""):o.removeAttribute(e)},removeChildNodes(o){for(let e=o.firstChild;e!==null;e=o.firstChild)o.removeChild(e)},createTemplateWalker(o){return document.createTreeWalker(o,133,null,!1)}})});var Rt,vo,Uo=c(()=>{Rt=class{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.spillover===void 0?this.sub1===e||this.sub2===e:this.spillover.indexOf(e)!==-1}subscribe(e){let t=this.spillover;if(t===void 0){if(this.has(e))return;if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.sub1=void 0,this.sub2=void 0}else t.indexOf(e)===-1&&t.push(e)}unsubscribe(e){let t=this.spillover;if(t===void 0)this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0);else{let i=t.indexOf(e);i!==-1&&t.splice(i,1)}}notify(e){let t=this.spillover,i=this.source;if(t===void 0){let n=this.sub1,r=this.sub2;n!==void 0&&n.handleChange(i,e),r!==void 0&&r.handleChange(i,e)}else for(let n=0,r=t.length;n<r;++n)t[n].handleChange(i,e)}},vo=class{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;let i=this.subscribers[e];i!==void 0&&i.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var i;if(t){let n=this.subscribers[t];n===void 0&&(this.subscribers[t]=n=new Rt(this.source)),n.subscribe(e)}else this.sourceSubscribers=(i=this.sourceSubscribers)!==null&&i!==void 0?i:new Rt(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var i;if(t){let n=this.subscribers[t];n!==void 0&&n.unsubscribe(e)}else(i=this.sourceSubscribers)===null||i===void 0||i.unsubscribe(e)}}});function p(o,e){w.defineProperty(o,e)}function _a(o,e,t){return Object.assign({},t,{get:function(){return w.trackVolatile(),t.get.apply(this)}})}var w,Ha,At,Ft,lt=c(()=>{Ue();bt();Uo();w=Zt.getById(2,()=>{let o=/(:|&&|\|\||if)/,e=new WeakMap,t=v.queueUpdate,i,n=u=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function r(u){let m=u.$fastController||e.get(u);return m===void 0&&(Array.isArray(u)?m=n(u):e.set(u,m=new vo(u))),m}let a=gi();class l{constructor(m){this.name=m,this.field=`_${m}`,this.callback=`${m}Changed`}getValue(m){return i!==void 0&&i.watch(m,this.name),m[this.field]}setValue(m,f){let y=this.field,$=m[y];if($!==f){m[y]=f;let I=m[this.callback];typeof I=="function"&&I.call(m,$,f),r(m).notify(this.name)}}}class h extends Rt{constructor(m,f,y=!1){super(m,f),this.binding=m,this.isVolatileBinding=y,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(m,f){this.needsRefresh&&this.last!==null&&this.disconnect();let y=i;i=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;let $=this.binding(m,f);return i=y,$}disconnect(){if(this.last!==null){let m=this.first;for(;m!==void 0;)m.notifier.unsubscribe(this,m.propertyName),m=m.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(m,f){let y=this.last,$=r(m),I=y===null?this.first:{};if(I.propertySource=m,I.propertyName=f,I.notifier=$,$.subscribe(this,f),y!==null){if(!this.needsRefresh){let N;i=void 0,N=y.propertySource[y.propertyName],i=this,m===N&&(this.needsRefresh=!0)}y.next=I}this.last=I}handleChange(){this.needsQueue&&(this.needsQueue=!1,t(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let m=this.first;return{next:()=>{let f=m;return f===void 0?{value:void 0,done:!0}:(m=m.next,{value:f,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(u){n=u},getNotifier:r,track(u,m){i!==void 0&&i.watch(u,m)},trackVolatile(){i!==void 0&&(i.needsRefresh=!0)},notify(u,m){r(u).notify(m)},defineProperty(u,m){typeof m=="string"&&(m=new l(m)),a(u).push(m),Reflect.defineProperty(u,m.name,{enumerable:!0,get:function(){return m.getValue(this)},set:function(f){m.setValue(this,f)}})},getAccessors:a,binding(u,m,f=this.isVolatileBinding(u)){return new h(u,m,f)},isVolatileBinding(u){return o.test(u.toString())}})});Ha=Zt.getById(3,()=>{let o=null;return{get(){return o},set(e){o=e}}}),At=class{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return Ha.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){Ha.set(e)}};w.defineProperty(At.prototype,"index");w.defineProperty(At.prototype,"length");Ft=Object.seal(new At)});var Lt,yo,Bt,Nt=c(()=>{Ue();Lt=class{constructor(){this.targetIndex=0}},yo=class extends Lt{constructor(){super(...arguments),this.createPlaceholder=v.createInterpolationPlaceholder}},Bt=class extends Lt{constructor(e,t,i){super(),this.name=e,this.behavior=t,this.options=i}createPlaceholder(e){return v.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}});function Cm(o,e){this.source=o,this.context=e,this.bindingObserver===null&&(this.bindingObserver=w.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(o,e))}function wm(o,e){this.source=o,this.context=e,this.target.addEventListener(this.targetName,this)}function km(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function $m(){this.bindingObserver.disconnect(),this.source=null,this.context=null;let o=this.target.$fastView;o!==void 0&&o.isComposed&&(o.unbind(),o.needsBindOnly=!0)}function Tm(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function Im(o){v.setAttribute(this.target,this.targetName,o)}function Sm(o){v.setBooleanAttribute(this.target,this.targetName,o)}function Pm(o){if(o==null&&(o=""),o.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=o.create():this.target.$fastTemplate!==o&&(e.isComposed&&(e.remove(),e.unbind()),e=o.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=o)}else{let e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=o}}function Em(o){this.target[this.targetName]=o}function Mm(o){let e=this.classVersions||Object.create(null),t=this.target,i=this.version||0;if(o!=null&&o.length){let n=o.split(/\s+/);for(let r=0,a=n.length;r<a;++r){let l=n[r];l!==""&&(e[l]=i,t.classList.add(l))}}if(this.classVersions=e,this.version=i+1,i!==0){i-=1;for(let n in e)e[n]===i&&t.classList.remove(n)}}var Jt,Qn,vi=c(()=>{Ue();lt();Nt();Jt=class extends yo{constructor(e){super(),this.binding=e,this.bind=Cm,this.unbind=km,this.updateTarget=Im,this.isBindingVolatile=w.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=Em,this.cleanedTargetName==="innerHTML"){let t=this.binding;this.binding=(i,n)=>v.createHTML(t(i,n))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=Sm;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=wm,this.unbind=Tm;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=Mm);break}}targetAtContent(){this.updateTarget=Pm,this.unbind=$m}createBehavior(e){return new Qn(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}},Qn=class{constructor(e,t,i,n,r,a,l){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=i,this.bind=n,this.unbind=r,this.updateTarget=a,this.targetName=l}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){At.setEvent(e);let t=this.binding(this.source,this.context);At.setEvent(null),t!==!0&&e.preventDefault()}}});function Dm(o){if(o.length===1)return o[0];let e,t=o.length,i=o.map(a=>typeof a=="string"?()=>a:(e=a.targetName||e,a.binding)),n=(a,l)=>{let h="";for(let u=0;u<t;++u)h+=i[u](a,l);return h},r=new Jt(n);return r.targetName=e,r}function za(o,e){let t=e.split(Xn);if(t.length===1)return null;let i=[];for(let n=0,r=t.length;n<r;++n){let a=t[n],l=a.indexOf(bi),h;if(l===-1)h=a;else{let u=parseInt(a.substring(0,l));i.push(o.directives[u]),h=a.substring(l+Om)}h!==""&&i.push(h)}return i}function Va(o,e,t=!1){let i=e.attributes;for(let n=0,r=i.length;n<r;++n){let a=i[n],l=a.value,h=za(o,l),u=null;h===null?t&&(u=new Jt(()=>l),u.targetName=a.name):u=Dm(h),u!==null&&(e.removeAttributeNode(a),n--,r--,o.addFactory(u))}}function Rm(o,e,t){let i=za(o,e.textContent);if(i!==null){let n=e;for(let r=0,a=i.length;r<a;++r){let l=i[r],h=r===0?e:n.parentNode.insertBefore(document.createTextNode(""),n.nextSibling);typeof l=="string"?h.textContent=l:(h.textContent=" ",o.captureContentBinding(l)),n=h,o.targetIndex++,h!==e&&t.nextNode()}o.targetIndex--}}function Ua(o,e){let t=o.content;document.adoptNode(t);let i=Jn.borrow(e);Va(i,o,!0);let n=i.behaviorFactories;i.reset();let r=v.createTemplateWalker(t),a;for(;a=r.nextNode();)switch(i.targetIndex++,a.nodeType){case 1:Va(i,a);break;case 3:Rm(i,a,r);break;case 8:v.isMarker(a)&&i.addFactory(e[v.extractDirectiveIndexFromMarker(a)])}let l=0;(v.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),l=-1);let h=i.behaviorFactories;return i.release(),{fragment:t,viewBehaviorFactories:h,hostBehaviorFactories:n,targetOffset:l}}var Zn,Jn,Om,Kn=c(()=>{Ue();vi();Zn=null,Jn=class o{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){Zn=this}static borrow(e){let t=Zn||new o;return t.directives=e,t.reset(),Zn=null,t}};Om=bi.length});var er,xo,yi=c(()=>{er=document.createRange(),xo=class{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{let t=this.lastChild;if(e.previousSibling===t)return;let i=e.parentNode,n=this.firstChild,r;for(;n!==t;)r=n.nextSibling,i.insertBefore(n,e),n=r;i.insertBefore(t,e)}}remove(){let e=this.fragment,t=this.lastChild,i=this.firstChild,n;for(;i!==t;)n=i.nextSibling,e.appendChild(i),i=n;e.appendChild(t)}dispose(){let e=this.firstChild.parentNode,t=this.lastChild,i=this.firstChild,n;for(;i!==t;)n=i.nextSibling,e.removeChild(i),i=n;e.removeChild(t);let r=this.behaviors,a=this.source;for(let l=0,h=r.length;l<h;++l)r[l].unbind(a)}bind(e,t){let i=this.behaviors;if(this.source!==e)if(this.source!==null){let n=this.source;this.source=e,this.context=t;for(let r=0,a=i.length;r<a;++r){let l=i[r];l.unbind(n),l.bind(e,t)}}else{this.source=e,this.context=t;for(let n=0,r=i.length;n<r;++n)i[n].bind(e,t)}}unbind(){if(this.source===null)return;let e=this.behaviors,t=this.source;for(let i=0,n=e.length;i<n;++i)e[i].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){er.setStartBefore(e[0].firstChild),er.setEndAfter(e[e.length-1].lastChild),er.deleteContents();for(let t=0,i=e.length;t<i;++t){let n=e[t],r=n.behaviors,a=n.source;for(let l=0,h=r.length;l<h;++l)r[l].unbind(a)}}}}});function k(o,...e){let t=[],i="";for(let n=0,r=o.length-1;n<r;++n){let a=o[n],l=e[n];if(i+=a,l instanceof xi){let h=l;l=()=>h}if(typeof l=="function"&&(l=new Jt(l)),l instanceof yo){let h=Am.exec(a);h!==null&&(l.targetName=h[2])}l instanceof Lt?(i+=l.createPlaceholder(t.length),t.push(l)):i+=l}return i+=o[o.length-1],new xi(i,t)}var xi,Am,ja=c(()=>{Ue();lt();Kn();yi();Nt();vi();xi=class{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let u,m=this.html;if(typeof m=="string"){u=document.createElement("template"),u.innerHTML=v.createHTML(m);let y=u.content.firstElementChild;y!==null&&y.tagName==="TEMPLATE"&&(u=y)}else u=m;let f=Ua(u,this.directives);this.fragment=f.fragment,this.viewBehaviorFactories=f.viewBehaviorFactories,this.hostBehaviorFactories=f.hostBehaviorFactories,this.targetOffset=f.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}let t=this.fragment.cloneNode(!0),i=this.viewBehaviorFactories,n=new Array(this.behaviorCount),r=v.createTemplateWalker(t),a=0,l=this.targetOffset,h=r.nextNode();for(let u=i.length;a<u;++a){let m=i[a],f=m.targetIndex;for(;h!==null;)if(l===f){n[a]=m.createBehavior(h);break}else h=r.nextNode(),l++}if(this.hasHostBehaviors){let u=this.hostBehaviorFactories;for(let m=0,f=u.length;m<f;++m,++a)n[a]=u[m].createBehavior(e)}return new xo(t,n)}render(e,t,i){typeof t=="string"&&(t=document.getElementById(t)),i===void 0&&(i=t);let n=this.create(i);return n.bind(e,Ft),n.appendTo(t),n}},Am=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/});function ir(o){return o.map(e=>e instanceof ne?ir(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function Ga(o){return o.map(e=>e instanceof ne?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}function qa(o){let e=[],t=[];return o.forEach(i=>(i[Ci]?e:t).push(i)),{prepend:e,append:t}}function Lm(){return`fast-style-class-${++Fm}`}var ne,Ci,Wa,Ya,tr,Fm,or,wi=c(()=>{Ue();ne=class{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}};ne.create=(()=>{if(v.supportsAdoptedStyleSheets){let o=new Map;return e=>new tr(e,o)}return o=>new or(o)})();Ci=Symbol("prependToAdoptedStyleSheets");Wa=(o,e)=>{let{prepend:t,append:i}=qa(e);o.adoptedStyleSheets=[...t,...o.adoptedStyleSheets,...i]},Ya=(o,e)=>{o.adoptedStyleSheets=o.adoptedStyleSheets.filter(t=>e.indexOf(t)===-1)};if(v.supportsAdoptedStyleSheets)try{document.adoptedStyleSheets.push(),document.adoptedStyleSheets.splice(),Wa=(o,e)=>{let{prepend:t,append:i}=qa(e);o.adoptedStyleSheets.splice(0,0,...t),o.adoptedStyleSheets.push(...i)},Ya=(o,e)=>{for(let t of e){let i=o.adoptedStyleSheets.indexOf(t);i!==-1&&o.adoptedStyleSheets.splice(i,1)}}}catch{}tr=class extends ne{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=Ga(e)}get styleSheets(){if(this._styleSheets===void 0){let e=this.styles,t=this.styleSheetCache;this._styleSheets=ir(e).map(i=>{if(i instanceof CSSStyleSheet)return i;let n=t.get(i);return n===void 0&&(n=new CSSStyleSheet,n.replaceSync(i),t.set(i,n)),n})}return this._styleSheets}addStylesTo(e){Wa(e,this.styleSheets),super.addStylesTo(e)}removeStylesFrom(e){Ya(e,this.styleSheets),super.removeStylesFrom(e)}},Fm=0;or=class extends ne{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=Ga(e),this.styleSheets=ir(e),this.styleClass=Lm()}addStylesTo(e){let t=this.styleSheets,i=this.styleClass;e=this.normalizeTarget(e);for(let n=0;n<t.length;n++){let r=document.createElement("style");r.innerHTML=t[n],r.className=i,e.append(r)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);let t=e.querySelectorAll(`.${this.styleClass}`);for(let i=0,n=t.length;i<n;++i)e.removeChild(t[i]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}});function d(o,e){let t;function i(n,r){arguments.length>1&&(t.property=r),jo.locate(n.constructor).push(t)}if(arguments.length>1){t={},i(o,e);return}return t=o===void 0?{}:o,i}var jo,Kt,D,ki,nr=c(()=>{lt();Ue();bt();jo=Object.freeze({locate:gi()}),Kt={toView(o){return o?"true":"false"},fromView(o){return!(o==null||o==="false"||o===!1||o===0)}},D={toView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e.toString()},fromView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e}},ki=class o{constructor(e,t,i=t.toLowerCase(),n="reflect",r){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=i,this.mode=n,this.converter=r,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,n==="boolean"&&r===void 0&&(this.converter=Kt)}setValue(e,t){let i=e[this.fieldName],n=this.converter;n!==void 0&&(t=n.fromView(t)),i!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](i,t),e.$fastController.notify(this.name))}getValue(e){return w.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){let t=this.mode,i=this.guards;i.has(e)||t==="fromView"||v.queueUpdate(()=>{i.add(e);let n=e[this.fieldName];switch(t){case"reflect":let r=this.converter;v.setAttribute(e,this.attribute,r!==void 0?r.toView(n):n);break;case"boolean":v.setBooleanAttribute(e,this.attribute,n);break}i.delete(e)})}static collect(e,...t){let i=[];t.push(jo.locate(e));for(let n=0,r=t.length;n<r;++n){let a=t[n];if(a!==void 0)for(let l=0,h=a.length;l<h;++l){let u=a[l];typeof u=="string"?i.push(new o(e,u)):i.push(new o(e,u.property,u.attribute,u.mode,u.converter))}}return i}}});var Xa,Qa,rr,ct,$i=c(()=>{bt();lt();wi();nr();Xa={mode:"open"},Qa={},rr=Zt.getById(4,()=>{let o=new Map;return Object.freeze({register(e){return o.has(e.type)?!1:(o.set(e.type,e),!0)},getByType(e){return o.get(e)}})}),ct=class{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;let i=ki.collect(e,t.attributes),n=new Array(i.length),r={},a={};for(let l=0,h=i.length;l<h;++l){let u=i[l];n[l]=u.attribute,r[u.name]=u,a[u.attribute]=u}this.attributes=i,this.observedAttributes=n,this.propertyLookup=r,this.attributeLookup=a,this.shadowOptions=t.shadowOptions===void 0?Xa:t.shadowOptions===null?void 0:Object.assign(Object.assign({},Xa),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?Qa:Object.assign(Object.assign({},Qa),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?ne.create(t.styles):t.styles instanceof ne?t.styles:ne.create([t.styles])}get isDefined(){return!!rr.getByType(this.type)}define(e=customElements){let t=this.type;if(rr.register(this)){let i=this.attributes,n=t.prototype;for(let r=0,a=i.length;r<a;++r)w.defineProperty(n,i[r]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}};ct.forType=rr.getByType});function sr(o){return o.shadowRoot||Za.get(o)||null}var Za,Bm,Ti,ar=c(()=>{Ue();Uo();lt();$i();Za=new WeakMap,Bm={bubbles:!0,composed:!0,cancelable:!0};Ti=class o extends vo{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;let i=t.shadowOptions;if(i!==void 0){let r=e.attachShadow(i);i.mode==="closed"&&Za.set(e,r)}let n=w.getAccessors(e);if(n.length>0){let r=this.boundObservables=Object.create(null);for(let a=0,l=n.length;a<l;++a){let h=n[a].name,u=e[h];u!==void 0&&(delete e[h],r[h]=u)}}}get isConnected(){return w.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,w.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){let t=sr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){let i=e.behaviors;e.addStylesTo(t),i!==null&&this.addBehaviors(i)}}removeStyles(e){let t=sr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){let i=e.behaviors;e.removeStylesFrom(t),i!==null&&this.removeBehaviors(i)}}addBehaviors(e){let t=this.behaviors||(this.behaviors=new Map),i=e.length,n=[];for(let r=0;r<i;++r){let a=e[r];t.has(a)?t.set(a,t.get(a)+1):(t.set(a,1),n.push(a))}if(this._isConnected){let r=this.element;for(let a=0;a<n.length;++a)n[a].bind(r,Ft)}}removeBehaviors(e,t=!1){let i=this.behaviors;if(i===null)return;let n=e.length,r=[];for(let a=0;a<n;++a){let l=e[a];if(i.has(l)){let h=i.get(l)-1;h===0||t?i.delete(l)&&r.push(l):i.set(l,h)}}if(this._isConnected){let a=this.element;for(let l=0;l<r.length;++l)r[l].unbind(a)}}onConnectedCallback(){if(this._isConnected)return;let e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,Ft);let t=this.behaviors;if(t!==null)for(let[i]of t)i.bind(e,Ft);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);let e=this.view;e!==null&&e.unbind();let t=this.behaviors;if(t!==null){let i=this.element;for(let[n]of t)n.unbind(i)}}onAttributeChangedCallback(e,t,i){let n=this.definition.attributeLookup[e];n!==void 0&&n.onAttributeChangedCallback(this.element,i)}emit(e,t,i){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},Bm),i))):!1}finishInitialization(){let e=this.element,t=this.boundObservables;if(t!==null){let n=Object.keys(t);for(let r=0,a=n.length;r<a;++r){let l=n[r];e[l]=t[l]}this.boundObservables=null}let i=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():i.template&&(this._template=i.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():i.styles&&(this._styles=i.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){let t=this.element,i=sr(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||v.removeChildNodes(i),e&&(this.view=e.render(t,i,t))}static forCustomElement(e){let t=e.$fastController;if(t!==void 0)return t;let i=ct.forType(e.constructor);if(i===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new o(e,i)}}});function Ja(o){return class extends o{constructor(){super(),Ti.forCustomElement(this)}$emit(e,t,i){return this.$fastController.emit(e,t,i)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,i){this.$fastController.onAttributeChangedCallback(e,t,i)}}}var Ht,Ka=c(()=>{ar();$i();Ht=Object.assign(Ja(HTMLElement),{from(o){return Ja(o)},define(o,e){return new ct(o,e).define().type}})});var eo,lr=c(()=>{eo=class{createCSS(){return""}createBehavior(){}}});function Nm(o,e){let t=[],i="",n=[];for(let r=0,a=o.length-1;r<a;++r){i+=o[r];let l=e[r];if(l instanceof eo){let h=l.createBehavior();l=l.createCSS(),h&&n.push(h)}l instanceof ne||l instanceof CSSStyleSheet?(i.trim()!==""&&(t.push(i),i=""),t.push(l)):i+=l}return i+=o[o.length-1],i.trim()!==""&&t.push(i),{styles:t,behaviors:n}}function E(o,...e){let{styles:t,behaviors:i}=Nm(o,e),n=ne.create(t);return i.length&&n.withBehaviors(...i),n}var el=c(()=>{lr();wi()});function je(o,e,t){return{index:o,removed:e,addedCount:t}}function Hm(o,e,t,i,n,r){let a=r-n+1,l=t-e+1,h=new Array(a),u,m;for(let f=0;f<a;++f)h[f]=new Array(l),h[f][0]=f;for(let f=0;f<l;++f)h[0][f]=f;for(let f=1;f<a;++f)for(let y=1;y<l;++y)o[e+y-1]===i[n+f-1]?h[f][y]=h[f-1][y-1]:(u=h[f-1][y]+1,m=h[f][y-1]+1,h[f][y]=u<m?u:m);return h}function _m(o){let e=o.length-1,t=o[0].length-1,i=o[e][t],n=[];for(;e>0||t>0;){if(e===0){n.push(cr),t--;continue}if(t===0){n.push(dr),e--;continue}let r=o[e-1][t-1],a=o[e-1][t],l=o[e][t-1],h;a<l?h=a<r?a:r:h=l<r?l:r,h===r?(r===i?n.push(ol):(n.push(il),i=r),e--,t--):h===a?(n.push(dr),e--,i=a):(n.push(cr),t--,i=l)}return n.reverse(),n}function Vm(o,e,t){for(let i=0;i<t;++i)if(o[i]!==e[i])return i;return t}function zm(o,e,t){let i=o.length,n=e.length,r=0;for(;r<t&&o[--i]===e[--n];)r++;return r}function Um(o,e,t,i){return e<t||i<o?-1:e===t||i===o?0:o<t?e<i?e-t:i-t:i<e?i-o:e-o}function hr(o,e,t,i,n,r){let a=0,l=0,h=Math.min(t-e,r-n);if(e===0&&n===0&&(a=Vm(o,i,h)),t===o.length&&r===i.length&&(l=zm(o,i,h-a)),e+=a,n+=a,t-=l,r-=l,t-e===0&&r-n===0)return ze;if(e===t){let I=je(e,[],0);for(;n<r;)I.removed.push(i[n++]);return[I]}else if(n===r)return[je(e,[],t-e)];let u=_m(Hm(o,e,t,i,n,r)),m=[],f,y=e,$=n;for(let I=0;I<u.length;++I)switch(u[I]){case ol:f!==void 0&&(m.push(f),f=void 0),y++,$++;break;case il:f===void 0&&(f=je(y,[],0)),f.addedCount++,y++,f.removed.push(i[$]),$++;break;case cr:f===void 0&&(f=je(y,[],0)),f.addedCount++,y++;break;case dr:f===void 0&&(f=je(y,[],0)),f.removed.push(i[$]),$++;break}return f!==void 0&&m.push(f),m}function jm(o,e,t,i){let n=je(e,t,i),r=!1,a=0;for(let l=0;l<o.length;l++){let h=o[l];if(h.index+=a,r)continue;let u=Um(n.index,n.index+n.removed.length,h.index,h.index+h.addedCount);if(u>=0){o.splice(l,1),l--,a-=h.addedCount-h.removed.length,n.addedCount+=h.addedCount-u;let m=n.removed.length+h.removed.length-u;if(!n.addedCount&&!m)r=!0;else{let f=h.removed;if(n.index<h.index){let y=n.removed.slice(0,h.index-n.index);tl.apply(y,f),f=y}if(n.index+n.removed.length>h.index+h.addedCount){let y=n.removed.slice(h.index+h.addedCount-n.index);tl.apply(f,y)}n.removed=f,h.index<n.index&&(n.index=h.index)}}else if(n.index<h.index){r=!0,o.splice(l,0,n),l++;let m=n.addedCount-n.removed.length;h.index+=m,a+=m}}r||o.push(n)}function Gm(o){let e=[];for(let t=0,i=o.length;t<i;t++){let n=o[t];jm(e,n.index,n.removed,n.addedCount)}return e}function nl(o,e){let t=[],i=Gm(e);for(let n=0,r=i.length;n<r;++n){let a=i[n];if(a.addedCount===1&&a.removed.length===1){a.removed[0]!==o[a.index]&&t.push(a);continue}t=t.concat(hr(o,a.index,a.index+a.addedCount,a.removed,0,a.removed.length))}return t}var ol,il,cr,dr,tl,rl=c(()=>{bt();ol=0,il=1,cr=2,dr=3;tl=Array.prototype.push});function ur(o,e){let t=o.index,i=e.length;return t>i?t=i-o.addedCount:t<0&&(t=i+o.removed.length+t-o.addedCount),t<0&&(t=0),o.index=t,o}function al(){if(sl)return;sl=!0,w.setArrayObserverFactory(h=>new pr(h));let o=Array.prototype;if(o.$fastPatch)return;Reflect.defineProperty(o,"$fastPatch",{value:1,enumerable:!1});let e=o.pop,t=o.push,i=o.reverse,n=o.shift,r=o.sort,a=o.splice,l=o.unshift;o.pop=function(){let h=this.length>0,u=e.apply(this,arguments),m=this.$fastController;return m!==void 0&&h&&m.addSplice(je(this.length,[u],0)),u},o.push=function(){let h=t.apply(this,arguments),u=this.$fastController;return u!==void 0&&u.addSplice(ur(je(this.length-arguments.length,[],arguments.length),this)),h},o.reverse=function(){let h,u=this.$fastController;u!==void 0&&(u.flush(),h=this.slice());let m=i.apply(this,arguments);return u!==void 0&&u.reset(h),m},o.shift=function(){let h=this.length>0,u=n.apply(this,arguments),m=this.$fastController;return m!==void 0&&h&&m.addSplice(je(0,[u],0)),u},o.sort=function(){let h,u=this.$fastController;u!==void 0&&(u.flush(),h=this.slice());let m=r.apply(this,arguments);return u!==void 0&&u.reset(h),m},o.splice=function(){let h=a.apply(this,arguments),u=this.$fastController;return u!==void 0&&u.addSplice(ur(je(+arguments[0],h,arguments.length>2?arguments.length-2:0),this)),h},o.unshift=function(){let h=l.apply(this,arguments),u=this.$fastController;return u!==void 0&&u.addSplice(ur(je(0,[],arguments.length),this)),h}}var sl,pr,ll=c(()=>{Ue();rl();Uo();lt();sl=!1;pr=class extends Rt{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}subscribe(e){this.flush(),super.subscribe(e)}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,v.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,v.queueUpdate(this))}flush(){let e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;let i=t===void 0?nl(this.source,e):hr(this.source,0,this.source.length,t,0,t.length);this.notify(i)}}});function Z(o){return new Bt("fast-ref",mr,o)}var mr,cl=c(()=>{Nt();mr=class{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}});var fr,dl=c(()=>{fr=o=>typeof o=="function"});function hl(o){return o===void 0?qm:fr(o)?o:()=>o}function to(o,e,t){let i=fr(o)?o:()=>o,n=hl(e),r=hl(t);return(a,l)=>i(a,l)?n(a,l):r(a,l)}var qm,ul=c(()=>{dl();qm=()=>null});function Wm(o,e,t,i){o.bind(e[t],i)}function Ym(o,e,t,i){let n=Object.create(i);n.index=t,n.length=e.length,o.bind(e[t],n)}var Eb,gr,vt,pl=c(()=>{Ue();lt();ll();bt();Nt();yi();Eb=Object.freeze({positioning:!1,recycle:!0});gr=class{constructor(e,t,i,n,r,a){this.location=e,this.itemsBinding=t,this.templateBinding=n,this.options=a,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=Wm,this.itemsBindingObserver=w.binding(t,this,i),this.templateBindingObserver=w.binding(n,this,r),a.positioning&&(this.bindView=Ym)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=ze;return}let t=this.itemsObserver,i=this.itemsObserver=w.getNotifier(this.items),n=t!==i;n&&t!==null&&t.unsubscribe(this),(n||e)&&i.subscribe(this)}updateViews(e){let t=this.childContext,i=this.views,n=this.bindView,r=this.items,a=this.template,l=this.options.recycle,h=[],u=0,m=0;for(let f=0,y=e.length;f<y;++f){let $=e[f],I=$.removed,N=0,Q=$.index,_e=Q+$.addedCount,Ze=i.splice($.index,I.length),go=m=h.length+Ze.length;for(;Q<_e;++Q){let Ve=i[Q],ve=Ve?Ve.firstChild:this.location,Je;l&&m>0?(N<=go&&Ze.length>0?(Je=Ze[N],N++):(Je=h[u],u++),m--):Je=a.create(),i.splice(Q,0,Je),n(Je,r,Q,t),Je.insertBefore(ve)}Ze[N]&&h.push(...Ze.slice(N))}for(let f=u,y=h.length;f<y;++f)h[f].dispose();if(this.options.positioning)for(let f=0,y=i.length;f<y;++f){let $=i[f].context;$.length=y,$.index=f}}refreshAllViews(e=!1){let t=this.items,i=this.childContext,n=this.template,r=this.location,a=this.bindView,l=t.length,h=this.views,u=h.length;if((l===0||e||!this.options.recycle)&&(xo.disposeContiguousBatch(h),u=0),u===0){this.views=h=new Array(l);for(let m=0;m<l;++m){let f=n.create();a(f,t,m,i),h[m]=f,f.insertBefore(r)}}else{let m=0;for(;m<l;++m)if(m<u){let y=h[m];a(y,t,m,i)}else{let y=n.create();a(y,t,m,i),h.push(y),y.insertBefore(r)}let f=h.splice(m,u-m);for(m=0,l=f.length;m<l;++m)f[m].dispose()}}unbindAllViews(){let e=this.views;for(let t=0,i=e.length;t<i;++t)e[t].unbind()}},vt=class extends Lt{constructor(e,t,i){super(),this.itemsBinding=e,this.templateBinding=t,this.options=i,this.createPlaceholder=v.createBlockPlaceholder,al(),this.isItemsBindingVolatile=w.isVolatileBinding(e),this.isTemplateBindingVolatile=w.isVolatileBinding(t)}createBehavior(e){return new gr(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}});function oo(o){return o?function(e,t,i){return e.nodeType===1&&e.matches(o)}:function(e,t,i){return e.nodeType===1}}var Co,Ii=c(()=>{lt();bt();Co=class{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){let t=this.options.property;this.shouldUpdate=w.getAccessors(e).some(i=>i.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(ze),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}});function K(o){return typeof o=="string"&&(o={property:o}),new Bt("fast-slotted",br,o)}var br,ml=c(()=>{Nt();Ii();br=class extends Co{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}});function Si(o){return typeof o=="string"&&(o={property:o}),new Bt("fast-children",vr,o)}var vr,fl=c(()=>{Nt();Ii();vr=class extends Co{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}});var g=c(()=>{bt();ja();Ka();$i();nr();ar();Kn();wi();el();lr();yi();lt();Uo();Ue();vi();Nt();cl();ul();pl();ml();fl();Ii()});var _,Ge,qe,hv,uv,fe=c(()=>{g();_=class{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}},Ge=(o,e)=>k`
    <span
        part="end"
        ${Z("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${Z("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,qe=(o,e)=>k`
    <span
        part="start"
        ${Z("startContainer")}
        class="${t=>e.start?"start":void 0}"
    >
        <slot
            name="start"
            ${Z("start")}
            @slotchange="${t=>t.handleStartContentChange()}"
        >
            ${e.start||""}
        </slot>
    </span>
`,hv=k`
    <span part="end" ${Z("endContainer")}>
        <slot
            name="end"
            ${Z("end")}
            @slotchange="${o=>o.handleEndContentChange()}"
        ></slot>
    </span>
`,uv=k`
    <span part="start" ${Z("startContainer")}>
        <slot
            name="start"
            ${Z("start")}
            @slotchange="${o=>o.handleStartContentChange()}"
        ></slot>
    </span>
`});var gl=c(()=>{});function s(o,e,t,i){var n=arguments.length,r=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(a=o[l])&&(r=(n<3?a(r):n>3?a(e,t,r):a(e,t))||r);return n>3&&r&&Object.defineProperty(e,t,r),r}var T=c(()=>{});function Go(o){let e=o.slice(),t=Object.keys(o),i=t.length,n;for(let r=0;r<i;++r)n=t[r],Pl(n)||(e[n]=o[n]);return e}function vl(o){return e=>Reflect.getOwnMetadata(o,e)}function Di(o){return function(e){let t=function(i,n,r){z.inject(t)(i,n,r)};return t.$isResolver=!0,t.resolve=function(i,n){return o(e,i,n)},t}}function Jm(o){return function(e,t){t=!!t;let i=function(n,r,a){z.inject(i)(n,r,a)};return i.$isResolver=!0,i.resolve=function(n,r){return o(e,n,r,t)},i}}function Tr(o,e,t){z.inject(Tr)(o,e,t)}function Tl(o,e){return e.getFactory(o).construct(e)}function xl(o){return this.get(o)}function Km(o,e){return e(o)}function Mi(o){return typeof o.register=="function"}function tf(o){return Mi(o)&&typeof o.registerInRequestor=="boolean"}function Cl(o){return tf(o)&&o.registerInRequestor}function of(o){return o.prototype!==void 0}function Sl(o){return function(e,t,i){if(wr.has(i))return wr.get(i);let n=o(e,t,i);return wr.set(i,n),n}}function Pi(o){if(o==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function wl(o,e,t){if(o instanceof $e&&o.strategy===4){let i=o.state,n=i.length,r=new Array(n);for(;n--;)r[n]=i[n].resolve(e,t);return r}return[o.resolve(e,t)]}function $l(o){return typeof o=="object"&&o!==null||typeof o=="function"}function Pl(o){switch(typeof o){case"number":return o>=0&&(o|0)===o;case"string":{let e=Ei[o];if(e!==void 0)return e;let t=o.length;if(t===0)return Ei[o]=!1;let i=0;for(let n=0;n<t;++n)if(i=o.charCodeAt(n),n===0&&i===48&&t>1||i<48||i>57)return Ei[o]=!1;return Ei[o]=!0}default:return!1}}var yr,kr,Xm,xr,bl,yl,z,Qm,bv,Zm,vv,yv,xv,Cv,wv,$e,$r,ef,nf,Il,Cr,qo,wr,io,kl,rf,Ei,Oi=c(()=>{g();yr=new Map;"metadata"in Reflect||(Reflect.metadata=function(o,e){return function(t){Reflect.defineMetadata(o,e,t)}},Reflect.defineMetadata=function(o,e,t){let i=yr.get(t);i===void 0&&yr.set(t,i=new Map),i.set(o,e)},Reflect.getOwnMetadata=function(o,e){let t=yr.get(e);if(t!==void 0)return t.get(o)});kr=class{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,Sl(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){let{container:i,key:n}=this;return this.container=this.key=void 0,i.registerResolver(n,new $e(n,e,t))}};Xm=Object.freeze({none(o){throw Error(`${o.toString()} not registered, did you forget to add @singleton()?`)},singleton(o){return new $e(o,1,o)},transient(o){return new $e(o,2,o)}}),xr=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:Xm.singleton})}),bl=new Map;yl=null,z=Object.freeze({createContainer(o){return new qo(null,Object.assign({},xr.default,o))},findResponsibleContainer(o){let e=o.$$container$$;return e&&e.responsibleForOwnerRequests?e:z.findParentContainer(o)},findParentContainer(o){let e=new CustomEvent(Il,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return o.dispatchEvent(e),e.detail.container||z.getOrCreateDOMContainer()},getOrCreateDOMContainer(o,e){return o?o.$$container$$||new qo(o,Object.assign({},xr.default,e,{parentLocator:z.findParentContainer})):yl||(yl=new qo(null,Object.assign({},xr.default,e,{parentLocator:()=>null})))},getDesignParamtypes:vl("design:paramtypes"),getAnnotationParamtypes:vl("di:paramtypes"),getOrCreateAnnotationParamTypes(o){let e=this.getAnnotationParamtypes(o);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],o),e},getDependencies(o){let e=bl.get(o);if(e===void 0){let t=o.inject;if(t===void 0){let i=z.getDesignParamtypes(o),n=z.getAnnotationParamtypes(o);if(i===void 0)if(n===void 0){let r=Object.getPrototypeOf(o);typeof r=="function"&&r!==Function.prototype?e=Go(z.getDependencies(r)):e=[]}else e=Go(n);else if(n===void 0)e=Go(i);else{e=Go(i);let r=n.length,a;for(let u=0;u<r;++u)a=n[u],a!==void 0&&(e[u]=a);let l=Object.keys(n);r=l.length;let h;for(let u=0;u<r;++u)h=l[u],Pl(h)||(e[h]=n[h])}}else e=Go(t);bl.set(o,e)}return e},defineProperty(o,e,t,i=!1){let n=`$di_${e}`;Reflect.defineProperty(o,e,{get:function(){let r=this[n];if(r===void 0&&(r=(this instanceof HTMLElement?z.findResponsibleContainer(this):z.getOrCreateDOMContainer()).get(t),this[n]=r,i&&this instanceof Ht)){let l=this.$fastController,h=()=>{let m=z.findResponsibleContainer(this).get(t),f=this[n];m!==f&&(this[n]=r,l.notify(e))};l.subscribe({handleChange:h},"isConnected")}return r}})},createInterface(o,e){let t=typeof o=="function"?o:e,i=typeof o=="string"?o:o&&"friendlyName"in o&&o.friendlyName||kl,n=typeof o=="string"?!1:o&&"respectConnection"in o&&o.respectConnection||!1,r=function(a,l,h){if(a==null||new.target!==void 0)throw new Error(`No registration for interface: '${r.friendlyName}'`);if(l)z.defineProperty(a,l,r,n);else{let u=z.getOrCreateAnnotationParamTypes(a);u[h]=r}};return r.$isInterface=!0,r.friendlyName=i??"(anonymous)",t!=null&&(r.register=function(a,l){return t(new kr(a,l??r))}),r.toString=function(){return`InterfaceSymbol<${r.friendlyName}>`},r},inject(...o){return function(e,t,i){if(typeof i=="number"){let n=z.getOrCreateAnnotationParamTypes(e),r=o[0];r!==void 0&&(n[i]=r)}else if(t)z.defineProperty(e,t,o[0]);else{let n=i?z.getOrCreateAnnotationParamTypes(i.value):z.getOrCreateAnnotationParamTypes(e),r;for(let a=0;a<o.length;++a)r=o[a],r!==void 0&&(n[a]=r)}}},transient(o){return o.register=function(t){return io.transient(o,o).register(t)},o.registerInRequestor=!1,o},singleton(o,e=Zm){return o.register=function(i){return io.singleton(o,o).register(i)},o.registerInRequestor=e.scoped,o}}),Qm=z.createInterface("Container");bv=z.inject,Zm={scoped:!1};vv=Jm((o,e,t,i)=>t.getAll(o,i)),yv=Di((o,e,t)=>()=>t.get(o)),xv=Di((o,e,t)=>{if(t.has(o,!0))return t.get(o)});Tr.$isResolver=!0;Tr.resolve=()=>{};Cv=Di((o,e,t)=>{let i=Tl(o,e),n=new $e(o,0,i);return t.registerResolver(o,n),i}),wv=Di((o,e,t)=>Tl(o,e));$e=class{constructor(e,t,i){this.key=e,this.strategy=t,this.state=i,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{let i=e.getFactory(this.state);if(i===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return i.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,i,n;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(n=(i=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||i===void 0?void 0:i.call(t,e))!==null&&n!==void 0?n:null;default:return null}}};$r=class{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let i;return t===void 0?i=new this.Type(...this.dependencies.map(xl,e)):i=new this.Type(...this.dependencies.map(xl,e),...t),this.transformers==null?i:this.transformers.reduce(Km,i)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}},ef={$isResolver:!0,resolve(o,e){return e}};nf=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),Il="__DI_LOCATE_PARENT__",Cr=new Map,qo=class o{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(Qm,ef),e instanceof Node&&e.addEventListener(Il,i=>{i.composedPath()[0]!==this.owner&&(i.detail.container=this,i.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,i,n,r,a,l=this.context;for(let h=0,u=e.length;h<u;++h)if(t=e[h],!!$l(t))if(Mi(t))t.register(this,l);else if(of(t))io.singleton(t,t).register(this);else for(i=Object.keys(t),r=0,a=i.length;r<a;++r)n=t[i[r]],$l(n)&&(Mi(n)?n.register(this,l):this.register(n));return--this.registerDepth,this}registerResolver(e,t){Pi(e);let i=this.resolvers,n=i.get(e);return n==null?i.set(e,t):n instanceof $e&&n.strategy===4?n.state.push(t):i.set(e,new $e(e,4,[n,t])),t}registerTransformer(e,t){let i=this.getResolver(e);if(i==null)return!1;if(i.getFactory){let n=i.getFactory(this);return n==null?!1:(n.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(Pi(e),e.resolve!==void 0)return e;let i=this,n;for(;i!=null;)if(n=i.resolvers.get(e),n==null){if(i.parent==null){let r=Cl(e)?this:i;return t?this.jitRegister(e,r):null}i=i.parent}else return n;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(Pi(e),e.$isResolver)return e.resolve(this,this);let t=this,i;for(;t!=null;)if(i=t.resolvers.get(e),i==null){if(t.parent==null){let n=Cl(e)?this:t;return i=this.jitRegister(e,n),i.resolve(t,this)}t=t.parent}else return i.resolve(t,this);throw new Error(`Unable to resolve key: ${String(e)}`)}getAll(e,t=!1){Pi(e);let i=this,n=i,r;if(t){let a=ze;for(;n!=null;)r=n.resolvers.get(e),r!=null&&(a=a.concat(wl(r,n,i))),n=n.parent;return a}else for(;n!=null;)if(r=n.resolvers.get(e),r==null){if(n=n.parent,n==null)return ze}else return wl(r,n,i);return ze}getFactory(e){let t=Cr.get(e);if(t===void 0){if(rf(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);Cr.set(e,t=new $r(e,z.getDependencies(e)))}return t}registerFactory(e,t){Cr.set(e,t)}createChild(e){return new o(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(nf.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(Mi(e)){let i=e.register(t);if(!(i instanceof Object)||i.resolve==null){let n=t.resolvers.get(e);if(n!=null)return n;throw new Error("A valid resolver was not returned from the static register method")}return i}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{let i=this.config.defaultResolver(e,t);return t.resolvers.set(e,i),i}}}},wr=new WeakMap;io=Object.freeze({instance(o,e){return new $e(o,0,e)},singleton(o,e){return new $e(o,1,e)},transient(o,e){return new $e(o,2,e)},callback(o,e){return new $e(o,3,e)},cachedCallback(o,e){return new $e(o,3,Sl(e))},aliasTo(o,e){return new $e(e,5,o)}});kl="(anonymous)";rf=(function(){let o=new WeakMap,e=!1,t="",i=0;return function(n){return e=o.get(n),e===void 0&&(t=n.toString(),i=t.length,e=i>=29&&i<=100&&t.charCodeAt(i-1)===125&&t.charCodeAt(i-2)<=32&&t.charCodeAt(i-3)===93&&t.charCodeAt(i-4)===101&&t.charCodeAt(i-5)===100&&t.charCodeAt(i-6)===111&&t.charCodeAt(i-7)===99&&t.charCodeAt(i-8)===32&&t.charCodeAt(i-9)===101&&t.charCodeAt(i-10)===118&&t.charCodeAt(i-11)===105&&t.charCodeAt(i-12)===116&&t.charCodeAt(i-13)===97&&t.charCodeAt(i-14)===110&&t.charCodeAt(i-15)===88,o.set(n,e)),e}})(),Ei={}});function El(o){return`${o.toLowerCase()}:presentation`}var Ri,Fi,Ai,Li=c(()=>{g();Oi();Ri=new Map,Fi=Object.freeze({define(o,e,t){let i=El(o);Ri.get(i)===void 0?Ri.set(i,e):Ri.set(i,!1),t.register(io.instance(i,e))},forTag(o,e){let t=El(o),i=Ri.get(t);return i===!1?z.findResponsibleContainer(e).get(t):i||null}}),Ai=class{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?ne.create(t):t instanceof ne?t:ne.create([t])}applyTo(e){let t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}});function Wo(o,e,t){return typeof o=="function"?o(e,t):o}var b,Ir,P=c(()=>{T();g();Li();b=class o extends Ht{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=Fi.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new Ir(this===o?class extends o{}:this,e,t)}};s([p],b.prototype,"template",void 0);s([p],b.prototype,"styles",void 0);Ir=class{constructor(e,t,i){this.type=e,this.elementDefinition=t,this.overrideDefinition=i,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){let i=this.definition,n=this.overrideDefinition,a=`${i.prefix||t.elementPrefix}-${i.baseName}`;t.tryDefineElement({name:a,type:this.type,baseClass:this.elementDefinition.baseClass,callback:l=>{let h=new Ai(Wo(i.template,l,i),Wo(i.styles,l,i));l.definePresentation(h);let u=Wo(i.shadowOptions,l,i);l.shadowRootMode&&(u?n.shadowOptions||(u.mode=l.shadowRootMode):u!==null&&(u={mode:l.shadowRootMode})),l.defineElement({elementOptions:Wo(i.elementOptions,l,i),shadowOptions:u,attributes:Wo(i.attributes,l,i)})}})}}});function M(o,...e){let t=jo.locate(o);e.forEach(i=>{Object.getOwnPropertyNames(i.prototype).forEach(r=>{r!=="constructor"&&Object.defineProperty(o.prototype,r,Object.getOwnPropertyDescriptor(i.prototype,r))}),jo.locate(i).forEach(r=>t.push(r))})}var ue=c(()=>{g()});var yt,Sr=c(()=>{T();g();P();fe();ue();yt=class extends b{constructor(){super(...arguments),this.headinglevel=2,this.expanded=!1,this.clickHandler=e=>{this.expanded=!this.expanded,this.change()},this.change=()=>{this.$emit("change")}}};s([d({attribute:"heading-level",mode:"fromView",converter:D})],yt.prototype,"headinglevel",void 0);s([d({mode:"boolean"})],yt.prototype,"expanded",void 0);s([d],yt.prototype,"id",void 0);M(yt,_)});var Ml=c(()=>{gl();Sr()});var Dl=c(()=>{});var U,Ol=c(()=>{U={horizontal:"horizontal",vertical:"vertical"}});function Rl(o,e){let t=o.length;for(;t--;)if(e(o[t],t,o))return t;return-1}var Al=c(()=>{});var Fl=c(()=>{});function Bi(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}var Ll=c(()=>{});var Bl=c(()=>{});var Nl=c(()=>{});var Hl=c(()=>{});var Pr=c(()=>{Ll();Bl();Nl();Hl()});function dt(...o){return o.every(e=>e instanceof HTMLElement)}function _l(o,e){return!o||!e||!dt(o)?void 0:Array.from(o.querySelectorAll(e)).filter(i=>i.offsetParent!==null)}function sf(){let o=document.querySelector('meta[property="csp-nonce"]');return o?o.getAttribute("content"):null}function Vl(){if(typeof no=="boolean")return no;if(!Bi())return no=!1,no;let o=document.createElement("style"),e=sf();e!==null&&o.setAttribute("nonce",e),document.head.appendChild(o);try{o.sheet.insertRule("foo:focus-visible {color:inherit}",0),no=!0}catch{no=!1}finally{document.head.removeChild(o)}return no}var no,zl=c(()=>{Pr()});var Er,Mr,xt,Ct,Dr,Or,Ul=c(()=>{Er="focus",Mr="focusin",xt="focusout",Ct="keydown",Dr="resize",Or="scroll"});var jl=c(()=>{});var Gl,Y,xe,Ce,X,te,Ee,se,ae,ql,Wl,Yl,Me,_t,Xl,Ql,Vt,Zl=c(()=>{(function(o){o[o.alt=18]="alt",o[o.arrowDown=40]="arrowDown",o[o.arrowLeft=37]="arrowLeft",o[o.arrowRight=39]="arrowRight",o[o.arrowUp=38]="arrowUp",o[o.back=8]="back",o[o.backSlash=220]="backSlash",o[o.break=19]="break",o[o.capsLock=20]="capsLock",o[o.closeBracket=221]="closeBracket",o[o.colon=186]="colon",o[o.colon2=59]="colon2",o[o.comma=188]="comma",o[o.ctrl=17]="ctrl",o[o.delete=46]="delete",o[o.end=35]="end",o[o.enter=13]="enter",o[o.equals=187]="equals",o[o.equals2=61]="equals2",o[o.equals3=107]="equals3",o[o.escape=27]="escape",o[o.forwardSlash=191]="forwardSlash",o[o.function1=112]="function1",o[o.function10=121]="function10",o[o.function11=122]="function11",o[o.function12=123]="function12",o[o.function2=113]="function2",o[o.function3=114]="function3",o[o.function4=115]="function4",o[o.function5=116]="function5",o[o.function6=117]="function6",o[o.function7=118]="function7",o[o.function8=119]="function8",o[o.function9=120]="function9",o[o.home=36]="home",o[o.insert=45]="insert",o[o.menu=93]="menu",o[o.minus=189]="minus",o[o.minus2=109]="minus2",o[o.numLock=144]="numLock",o[o.numPad0=96]="numPad0",o[o.numPad1=97]="numPad1",o[o.numPad2=98]="numPad2",o[o.numPad3=99]="numPad3",o[o.numPad4=100]="numPad4",o[o.numPad5=101]="numPad5",o[o.numPad6=102]="numPad6",o[o.numPad7=103]="numPad7",o[o.numPad8=104]="numPad8",o[o.numPad9=105]="numPad9",o[o.numPadDivide=111]="numPadDivide",o[o.numPadDot=110]="numPadDot",o[o.numPadMinus=109]="numPadMinus",o[o.numPadMultiply=106]="numPadMultiply",o[o.numPadPlus=107]="numPadPlus",o[o.openBracket=219]="openBracket",o[o.pageDown=34]="pageDown",o[o.pageUp=33]="pageUp",o[o.period=190]="period",o[o.print=44]="print",o[o.quote=222]="quote",o[o.scrollLock=145]="scrollLock",o[o.shift=16]="shift",o[o.space=32]="space",o[o.tab=9]="tab",o[o.tilde=192]="tilde",o[o.windowsLeft=91]="windowsLeft",o[o.windowsOpera=219]="windowsOpera",o[o.windowsRight=92]="windowsRight"})(Gl||(Gl={}));Y="ArrowDown",xe="ArrowLeft",Ce="ArrowRight",X="ArrowUp",te="Enter",Ee="Escape",se="Home",ae="End",ql="F2",Wl="PageDown",Yl="PageUp",Me=" ",_t="Tab",Xl="Backspace",Ql="Delete",Vt={ArrowDown:Y,ArrowLeft:xe,ArrowRight:Ce,ArrowUp:X}});var O,Rr=c(()=>{(function(o){o.ltr="ltr",o.rtl="rtl"})(O||(O={}))});function Jl(o,e,t){return t<o?e:t>e?o:t}function zt(o,e,t){return Math.min(Math.max(t,o),e)}function Yo(o,e,t=0){return[e,t]=[e,t].sort((i,n)=>i-n),e<=o&&o<t}var Kl=c(()=>{});function Le(o=""){return`${o}${af++}`}var af,ec=c(()=>{af=0});var tc=c(()=>{});var wo,oc=c(()=>{Pr();Rr();wo=class o{static getScrollLeft(e,t){return t===O.rtl?o.getRtlScrollLeftConverter(e):e.scrollLeft}static setScrollLeft(e,t,i){if(i===O.rtl){o.setRtlScrollLeftConverter(e,t);return}e.scrollLeft=t}static initialGetRtlScrollConverter(e){return o.initializeRtlScrollConverters(),o.getRtlScrollLeftConverter(e)}static directGetRtlScrollConverter(e){return e.scrollLeft}static invertedGetRtlScrollConverter(e){return-Math.abs(e.scrollLeft)}static reverseGetRtlScrollConverter(e){return e.scrollLeft-(e.scrollWidth-e.clientWidth)}static initialSetRtlScrollConverter(e,t){o.initializeRtlScrollConverters(),o.setRtlScrollLeftConverter(e,t)}static directSetRtlScrollConverter(e,t){e.scrollLeft=t}static invertedSetRtlScrollConverter(e,t){e.scrollLeft=Math.abs(t)}static reverseSetRtlScrollConverter(e,t){let i=e.scrollWidth-e.clientWidth;e.scrollLeft=i+t}static initializeRtlScrollConverters(){if(!Bi()){o.applyDirectScrollConverters();return}let e=o.getTestElement();document.body.appendChild(e),o.checkForScrollType(e),document.body.removeChild(e)}static checkForScrollType(e){o.isReverse(e)?o.applyReverseScrollConverters():o.isDirect(e)?o.applyDirectScrollConverters():o.applyInvertedScrollConverters()}static isReverse(e){return e.scrollLeft>0}static isDirect(e){return e.scrollLeft=-1,e.scrollLeft<0}static applyDirectScrollConverters(){o.setRtlScrollLeftConverter=o.directSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.directGetRtlScrollConverter}static applyInvertedScrollConverters(){o.setRtlScrollLeftConverter=o.invertedSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.invertedGetRtlScrollConverter}static applyReverseScrollConverters(){o.setRtlScrollLeftConverter=o.reverseSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.reverseGetRtlScrollConverter}static getTestElement(){let e=document.createElement("div");return e.appendChild(document.createTextNode("ABCD")),e.dir="rtl",e.style.fontSize="14px",e.style.width="4px",e.style.height="1px",e.style.position="absolute",e.style.top="-1000px",e.style.overflow="scroll",e}};wo.getRtlScrollLeftConverter=wo.initialGetRtlScrollConverter;wo.setRtlScrollLeftConverter=wo.initialSetRtlScrollConverter});var ic,nc=c(()=>{(function(o){o.Canvas="Canvas",o.CanvasText="CanvasText",o.LinkText="LinkText",o.VisitedText="VisitedText",o.ActiveText="ActiveText",o.ButtonFace="ButtonFace",o.ButtonText="ButtonText",o.Field="Field",o.FieldText="FieldText",o.Highlight="Highlight",o.HighlightText="HighlightText",o.GrayText="GrayText"})(ic||(ic={}))});var R=c(()=>{Ol();Al();Fl();zl();Ul();jl();Zl();Rr();Kl();ec();tc();oc();nc()});var rc,Ni,sc=c(()=>{T();g();R();P();Sr();rc={single:"single",multi:"multi"},Ni=class extends b{constructor(){super(...arguments),this.expandmode=rc.multi,this.activeItemIndex=0,this.change=()=>{this.$emit("change",this.activeid)},this.setItems=()=>{var e;this.accordionItems.length!==0&&(this.accordionIds=this.getItemIds(),this.accordionItems.forEach((t,i)=>{t instanceof yt&&(t.addEventListener("change",this.activeItemChange),this.isSingleExpandMode()&&(this.activeItemIndex!==i?t.expanded=!1:t.expanded=!0));let n=this.accordionIds[i];t.setAttribute("id",typeof n!="string"?`accordion-${i+1}`:n),this.activeid=this.accordionIds[this.activeItemIndex],t.addEventListener("keydown",this.handleItemKeyDown),t.addEventListener("focus",this.handleItemFocus)}),this.isSingleExpandMode()&&((e=this.findExpandedItem())!==null&&e!==void 0?e:this.accordionItems[0]).setAttribute("aria-disabled","true"))},this.removeItemListeners=e=>{e.forEach((t,i)=>{t.removeEventListener("change",this.activeItemChange),t.removeEventListener("keydown",this.handleItemKeyDown),t.removeEventListener("focus",this.handleItemFocus)})},this.activeItemChange=e=>{if(e.defaultPrevented||e.target!==e.currentTarget)return;e.preventDefault();let t=e.target;this.activeid=t.getAttribute("id"),this.isSingleExpandMode()&&(this.resetItems(),t.expanded=!0,t.setAttribute("aria-disabled","true"),this.accordionItems.forEach(i=>{!i.hasAttribute("disabled")&&i.id!==this.activeid&&i.removeAttribute("aria-disabled")})),this.activeItemIndex=Array.from(this.accordionItems).indexOf(t),this.change()},this.handleItemKeyDown=e=>{if(e.target===e.currentTarget)switch(this.accordionIds=this.getItemIds(),e.key){case X:e.preventDefault(),this.adjust(-1);break;case Y:e.preventDefault(),this.adjust(1);break;case se:this.activeItemIndex=0,this.focusItem();break;case ae:this.activeItemIndex=this.accordionItems.length-1,this.focusItem();break}},this.handleItemFocus=e=>{if(e.target===e.currentTarget){let t=e.target,i=this.activeItemIndex=Array.from(this.accordionItems).indexOf(t);this.activeItemIndex!==i&&i!==-1&&(this.activeItemIndex=i,this.activeid=this.accordionIds[this.activeItemIndex])}}}accordionItemsChanged(e,t){this.$fastController.isConnected&&(this.removeItemListeners(e),this.setItems())}findExpandedItem(){for(let e=0;e<this.accordionItems.length;e++)if(this.accordionItems[e].getAttribute("expanded")==="true")return this.accordionItems[e];return null}resetItems(){this.accordionItems.forEach((e,t)=>{e.expanded=!1})}getItemIds(){return this.accordionItems.map(e=>e.getAttribute("id"))}isSingleExpandMode(){return this.expandmode===rc.single}adjust(e){this.activeItemIndex=Jl(0,this.accordionItems.length-1,this.activeItemIndex+e),this.focusItem()}focusItem(){let e=this.accordionItems[this.activeItemIndex];e instanceof yt&&e.expandbutton.focus()}};s([d({attribute:"expand-mode"})],Ni.prototype,"expandmode",void 0);s([p],Ni.prototype,"accordionItems",void 0)});var ac=c(()=>{Dl();sc()});var lc,cc=c(()=>{g();fe();lc=(o,e)=>k`
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
        ${Z("control")}
    >
        ${qe(o,e)}
        <span class="content" part="content">
            <slot ${K("defaultSlottedContent")}></slot>
        </span>
        ${Ge(o,e)}
    </a>
`});var A,Xo=c(()=>{T();g();A=class{};s([d({attribute:"aria-atomic"})],A.prototype,"ariaAtomic",void 0);s([d({attribute:"aria-busy"})],A.prototype,"ariaBusy",void 0);s([d({attribute:"aria-controls"})],A.prototype,"ariaControls",void 0);s([d({attribute:"aria-current"})],A.prototype,"ariaCurrent",void 0);s([d({attribute:"aria-describedby"})],A.prototype,"ariaDescribedby",void 0);s([d({attribute:"aria-details"})],A.prototype,"ariaDetails",void 0);s([d({attribute:"aria-disabled"})],A.prototype,"ariaDisabled",void 0);s([d({attribute:"aria-errormessage"})],A.prototype,"ariaErrormessage",void 0);s([d({attribute:"aria-flowto"})],A.prototype,"ariaFlowto",void 0);s([d({attribute:"aria-haspopup"})],A.prototype,"ariaHaspopup",void 0);s([d({attribute:"aria-hidden"})],A.prototype,"ariaHidden",void 0);s([d({attribute:"aria-invalid"})],A.prototype,"ariaInvalid",void 0);s([d({attribute:"aria-keyshortcuts"})],A.prototype,"ariaKeyshortcuts",void 0);s([d({attribute:"aria-label"})],A.prototype,"ariaLabel",void 0);s([d({attribute:"aria-labelledby"})],A.prototype,"ariaLabelledby",void 0);s([d({attribute:"aria-live"})],A.prototype,"ariaLive",void 0);s([d({attribute:"aria-owns"})],A.prototype,"ariaOwns",void 0);s([d({attribute:"aria-relevant"})],A.prototype,"ariaRelevant",void 0);s([d({attribute:"aria-roledescription"})],A.prototype,"ariaRoledescription",void 0)});var ro=c(()=>{Xo();fe()});var we,so,Ar=c(()=>{T();g();P();ro();ue();we=class extends b{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{var t;(t=this.control)===null||t===void 0||t.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}};s([d],we.prototype,"download",void 0);s([d],we.prototype,"href",void 0);s([d],we.prototype,"hreflang",void 0);s([d],we.prototype,"ping",void 0);s([d],we.prototype,"referrerpolicy",void 0);s([d],we.prototype,"rel",void 0);s([d],we.prototype,"target",void 0);s([d],we.prototype,"type",void 0);s([p],we.prototype,"defaultSlottedContent",void 0);so=class{};s([d({attribute:"aria-expanded"})],so.prototype,"ariaExpanded",void 0);M(so,A);M(we,_,so)});var dc=c(()=>{cc();Ar()});var hc=c(()=>{});var Be,Ut=c(()=>{R();Be=o=>{let e=o.closest("[dir]");return e!==null&&e.dir==="rtl"?O.rtl:O.ltr}});var Hi,uc=c(()=>{g();Hi=class{constructor(){this.intersectionDetector=null,this.observedElements=new Map,this.requestPosition=(e,t)=>{var i;if(this.intersectionDetector!==null){if(this.observedElements.has(e)){(i=this.observedElements.get(e))===null||i===void 0||i.push(t);return}this.observedElements.set(e,[t]),this.intersectionDetector.observe(e)}},this.cancelRequestPosition=(e,t)=>{let i=this.observedElements.get(e);if(i!==void 0){let n=i.indexOf(t);n!==-1&&i.splice(n,1)}},this.initializeIntersectionDetector=()=>{et.IntersectionObserver&&(this.intersectionDetector=new IntersectionObserver(this.handleIntersection,{root:null,rootMargin:"0px",threshold:[0,1]}))},this.handleIntersection=e=>{if(this.intersectionDetector===null)return;let t=[],i=[];e.forEach(n=>{var r;(r=this.intersectionDetector)===null||r===void 0||r.unobserve(n.target);let a=this.observedElements.get(n.target);a!==void 0&&(a.forEach(l=>{let h=t.indexOf(l);h===-1&&(h=t.length,t.push(l),i.push([])),i[h].push(n)}),this.observedElements.delete(n.target))}),t.forEach((n,r)=>{n(i[r])})},this.initializeIntersectionDetector()}}});var oe,pc=c(()=>{T();g();R();P();Ut();uc();oe=class o extends b{constructor(){super(...arguments),this.anchor="",this.viewport="",this.horizontalPositioningMode="uncontrolled",this.horizontalDefaultPosition="unset",this.horizontalViewportLock=!1,this.horizontalInset=!1,this.horizontalScaling="content",this.verticalPositioningMode="uncontrolled",this.verticalDefaultPosition="unset",this.verticalViewportLock=!1,this.verticalInset=!1,this.verticalScaling="content",this.fixedPlacement=!1,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.initialLayoutComplete=!1,this.resizeDetector=null,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.pendingPositioningUpdate=!1,this.pendingReset=!1,this.currentDirection=O.ltr,this.regionVisible=!1,this.forceUpdate=!1,this.updateThreshold=.5,this.update=()=>{this.pendingPositioningUpdate||this.requestPositionUpdates()},this.startObservers=()=>{this.stopObservers(),this.anchorElement!==null&&(this.requestPositionUpdates(),this.resizeDetector!==null&&(this.resizeDetector.observe(this.anchorElement),this.resizeDetector.observe(this)))},this.requestPositionUpdates=()=>{this.anchorElement===null||this.pendingPositioningUpdate||(o.intersectionService.requestPosition(this,this.handleIntersection),o.intersectionService.requestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.requestPosition(this.viewportElement,this.handleIntersection),this.pendingPositioningUpdate=!0)},this.stopObservers=()=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,o.intersectionService.cancelRequestPosition(this,this.handleIntersection),this.anchorElement!==null&&o.intersectionService.cancelRequestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.cancelRequestPosition(this.viewportElement,this.handleIntersection)),this.resizeDetector!==null&&this.resizeDetector.disconnect()},this.getViewport=()=>typeof this.viewport!="string"||this.viewport===""?document.documentElement:document.getElementById(this.viewport),this.getAnchor=()=>document.getElementById(this.anchor),this.handleIntersection=e=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,this.applyIntersectionEntries(e)&&this.updateLayout())},this.applyIntersectionEntries=e=>{let t=e.find(r=>r.target===this),i=e.find(r=>r.target===this.anchorElement),n=e.find(r=>r.target===this.viewportElement);return t===void 0||n===void 0||i===void 0?!1:!this.regionVisible||this.forceUpdate||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0||this.isRectDifferent(this.anchorRect,i.boundingClientRect)||this.isRectDifferent(this.viewportRect,n.boundingClientRect)||this.isRectDifferent(this.regionRect,t.boundingClientRect)?(this.regionRect=t.boundingClientRect,this.anchorRect=i.boundingClientRect,this.viewportElement===document.documentElement?this.viewportRect=new DOMRectReadOnly(n.boundingClientRect.x+document.documentElement.scrollLeft,n.boundingClientRect.y+document.documentElement.scrollTop,n.boundingClientRect.width,n.boundingClientRect.height):this.viewportRect=n.boundingClientRect,this.updateRegionOffset(),this.forceUpdate=!1,!0):!1},this.updateRegionOffset=()=>{this.anchorRect&&this.regionRect&&(this.baseHorizontalOffset=this.baseHorizontalOffset+(this.anchorRect.left-this.regionRect.left)+(this.translateX-this.baseHorizontalOffset),this.baseVerticalOffset=this.baseVerticalOffset+(this.anchorRect.top-this.regionRect.top)+(this.translateY-this.baseVerticalOffset))},this.isRectDifferent=(e,t)=>Math.abs(e.top-t.top)>this.updateThreshold||Math.abs(e.right-t.right)>this.updateThreshold||Math.abs(e.bottom-t.bottom)>this.updateThreshold||Math.abs(e.left-t.left)>this.updateThreshold,this.handleResize=e=>{this.update()},this.reset=()=>{this.pendingReset&&(this.pendingReset=!1,this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.viewportElement===null&&(this.viewportElement=this.getViewport()),this.currentDirection=Be(this),this.startObservers())},this.updateLayout=()=>{let e,t;if(this.horizontalPositioningMode!=="uncontrolled"){let r=this.getPositioningOptions(this.horizontalInset);if(this.horizontalDefaultPosition==="center")t="center";else if(this.horizontalDefaultPosition!=="unset"){let y=this.horizontalDefaultPosition;if(y==="start"||y==="end"){let $=Be(this);if($!==this.currentDirection){this.currentDirection=$,this.initialize();return}this.currentDirection===O.ltr?y=y==="start"?"left":"right":y=y==="start"?"right":"left"}switch(y){case"left":t=this.horizontalInset?"insetStart":"start";break;case"right":t=this.horizontalInset?"insetEnd":"end";break}}let a=this.horizontalThreshold!==void 0?this.horizontalThreshold:this.regionRect!==void 0?this.regionRect.width:0,l=this.anchorRect!==void 0?this.anchorRect.left:0,h=this.anchorRect!==void 0?this.anchorRect.right:0,u=this.anchorRect!==void 0?this.anchorRect.width:0,m=this.viewportRect!==void 0?this.viewportRect.left:0,f=this.viewportRect!==void 0?this.viewportRect.right:0;(t===void 0||this.horizontalPositioningMode!=="locktodefault"&&this.getAvailableSpace(t,l,h,u,m,f)<a)&&(t=this.getAvailableSpace(r[0],l,h,u,m,f)>this.getAvailableSpace(r[1],l,h,u,m,f)?r[0]:r[1])}if(this.verticalPositioningMode!=="uncontrolled"){let r=this.getPositioningOptions(this.verticalInset);if(this.verticalDefaultPosition==="center")e="center";else if(this.verticalDefaultPosition!=="unset")switch(this.verticalDefaultPosition){case"top":e=this.verticalInset?"insetStart":"start";break;case"bottom":e=this.verticalInset?"insetEnd":"end";break}let a=this.verticalThreshold!==void 0?this.verticalThreshold:this.regionRect!==void 0?this.regionRect.height:0,l=this.anchorRect!==void 0?this.anchorRect.top:0,h=this.anchorRect!==void 0?this.anchorRect.bottom:0,u=this.anchorRect!==void 0?this.anchorRect.height:0,m=this.viewportRect!==void 0?this.viewportRect.top:0,f=this.viewportRect!==void 0?this.viewportRect.bottom:0;(e===void 0||this.verticalPositioningMode!=="locktodefault"&&this.getAvailableSpace(e,l,h,u,m,f)<a)&&(e=this.getAvailableSpace(r[0],l,h,u,m,f)>this.getAvailableSpace(r[1],l,h,u,m,f)?r[0]:r[1])}let i=this.getNextRegionDimension(t,e),n=this.horizontalPosition!==t||this.verticalPosition!==e;if(this.setHorizontalPosition(t,i),this.setVerticalPosition(e,i),this.updateRegionStyle(),!this.initialLayoutComplete){this.initialLayoutComplete=!0,this.requestPositionUpdates();return}this.regionVisible||(this.regionVisible=!0,this.style.removeProperty("pointer-events"),this.style.removeProperty("opacity"),this.classList.toggle("loaded",!0),this.$emit("loaded",this,{bubbles:!1})),this.updatePositionClasses(),n&&this.$emit("positionchange",this,{bubbles:!1})},this.updateRegionStyle=()=>{this.style.width=this.regionWidth,this.style.height=this.regionHeight,this.style.transform=`translate(${this.translateX}px, ${this.translateY}px)`},this.updatePositionClasses=()=>{this.classList.toggle("top",this.verticalPosition==="start"),this.classList.toggle("bottom",this.verticalPosition==="end"),this.classList.toggle("inset-top",this.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.verticalPosition==="insetEnd"),this.classList.toggle("vertical-center",this.verticalPosition==="center"),this.classList.toggle("left",this.horizontalPosition==="start"),this.classList.toggle("right",this.horizontalPosition==="end"),this.classList.toggle("inset-left",this.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.horizontalPosition==="insetEnd"),this.classList.toggle("horizontal-center",this.horizontalPosition==="center")},this.setHorizontalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.horizontalScaling){case"anchor":case"fill":i=this.horizontalViewportLock?this.viewportRect.width:t.width,this.regionWidth=`${i}px`;break;case"content":i=this.regionRect.width,this.regionWidth="unset";break}let n=0;switch(e){case"start":this.translateX=this.baseHorizontalOffset-i,this.horizontalViewportLock&&this.anchorRect.left>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.right));break;case"insetStart":this.translateX=this.baseHorizontalOffset-i+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.right));break;case"insetEnd":this.translateX=this.baseHorizontalOffset,this.horizontalViewportLock&&this.anchorRect.left<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.left));break;case"end":this.translateX=this.baseHorizontalOffset+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.left));break;case"center":if(n=(this.anchorRect.width-i)/2,this.translateX=this.baseHorizontalOffset+n,this.horizontalViewportLock){let r=this.anchorRect.left+n,a=this.anchorRect.right-n;r<this.viewportRect.left&&!(a>this.viewportRect.right)?this.translateX=this.translateX-(r-this.viewportRect.left):a>this.viewportRect.right&&!(r<this.viewportRect.left)&&(this.translateX=this.translateX-(a-this.viewportRect.right))}break}this.horizontalPosition=e},this.setVerticalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.verticalScaling){case"anchor":case"fill":i=this.verticalViewportLock?this.viewportRect.height:t.height,this.regionHeight=`${i}px`;break;case"content":i=this.regionRect.height,this.regionHeight="unset";break}let n=0;switch(e){case"start":this.translateY=this.baseVerticalOffset-i,this.verticalViewportLock&&this.anchorRect.top>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.bottom));break;case"insetStart":this.translateY=this.baseVerticalOffset-i+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.bottom));break;case"insetEnd":this.translateY=this.baseVerticalOffset,this.verticalViewportLock&&this.anchorRect.top<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.top));break;case"end":this.translateY=this.baseVerticalOffset+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.top));break;case"center":if(n=(this.anchorRect.height-i)/2,this.translateY=this.baseVerticalOffset+n,this.verticalViewportLock){let r=this.anchorRect.top+n,a=this.anchorRect.bottom-n;r<this.viewportRect.top&&!(a>this.viewportRect.bottom)?this.translateY=this.translateY-(r-this.viewportRect.top):a>this.viewportRect.bottom&&!(r<this.viewportRect.top)&&(this.translateY=this.translateY-(a-this.viewportRect.bottom))}}this.verticalPosition=e},this.getPositioningOptions=e=>e?["insetStart","insetEnd"]:["start","end"],this.getAvailableSpace=(e,t,i,n,r,a)=>{let l=t-r,h=a-(t+n);switch(e){case"start":return l;case"insetStart":return l+n;case"insetEnd":return h+n;case"end":return h;case"center":return Math.min(l,h)*2+n}},this.getNextRegionDimension=(e,t)=>{let i={height:this.regionRect!==void 0?this.regionRect.height:0,width:this.regionRect!==void 0?this.regionRect.width:0};return e!==void 0&&this.horizontalScaling==="fill"?i.width=this.getAvailableSpace(e,this.anchorRect!==void 0?this.anchorRect.left:0,this.anchorRect!==void 0?this.anchorRect.right:0,this.anchorRect!==void 0?this.anchorRect.width:0,this.viewportRect!==void 0?this.viewportRect.left:0,this.viewportRect!==void 0?this.viewportRect.right:0):this.horizontalScaling==="anchor"&&(i.width=this.anchorRect!==void 0?this.anchorRect.width:0),t!==void 0&&this.verticalScaling==="fill"?i.height=this.getAvailableSpace(t,this.anchorRect!==void 0?this.anchorRect.top:0,this.anchorRect!==void 0?this.anchorRect.bottom:0,this.anchorRect!==void 0?this.anchorRect.height:0,this.viewportRect!==void 0?this.viewportRect.top:0,this.viewportRect!==void 0?this.viewportRect.bottom:0):this.verticalScaling==="anchor"&&(i.height=this.anchorRect!==void 0?this.anchorRect.height:0),i},this.startAutoUpdateEventListeners=()=>{window.addEventListener(Dr,this.update,{passive:!0}),window.addEventListener(Or,this.update,{passive:!0,capture:!0}),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.observe(this.viewportElement)},this.stopAutoUpdateEventListeners=()=>{window.removeEventListener(Dr,this.update),window.removeEventListener(Or,this.update),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.unobserve(this.viewportElement)}}anchorChanged(){this.initialLayoutComplete&&(this.anchorElement=this.getAnchor())}viewportChanged(){this.initialLayoutComplete&&(this.viewportElement=this.getViewport())}horizontalPositioningModeChanged(){this.requestReset()}horizontalDefaultPositionChanged(){this.updateForAttributeChange()}horizontalViewportLockChanged(){this.updateForAttributeChange()}horizontalInsetChanged(){this.updateForAttributeChange()}horizontalThresholdChanged(){this.updateForAttributeChange()}horizontalScalingChanged(){this.updateForAttributeChange()}verticalPositioningModeChanged(){this.requestReset()}verticalDefaultPositionChanged(){this.updateForAttributeChange()}verticalViewportLockChanged(){this.updateForAttributeChange()}verticalInsetChanged(){this.updateForAttributeChange()}verticalThresholdChanged(){this.updateForAttributeChange()}verticalScalingChanged(){this.updateForAttributeChange()}fixedPlacementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}autoUpdateModeChanged(e,t){this.$fastController.isConnected&&this.initialLayoutComplete&&(e==="auto"&&this.stopAutoUpdateEventListeners(),t==="auto"&&this.startAutoUpdateEventListeners())}anchorElementChanged(){this.requestReset()}viewportElementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}connectedCallback(){super.connectedCallback(),this.autoUpdateMode==="auto"&&this.startAutoUpdateEventListeners(),this.initialize()}disconnectedCallback(){super.disconnectedCallback(),this.autoUpdateMode==="auto"&&this.stopAutoUpdateEventListeners(),this.stopObservers(),this.disconnectResizeDetector()}adoptedCallback(){this.initialize()}disconnectResizeDetector(){this.resizeDetector!==null&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.handleResize)}updateForAttributeChange(){this.$fastController.isConnected&&this.initialLayoutComplete&&(this.forceUpdate=!0,this.update())}initialize(){this.initializeResizeDetector(),this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.requestReset()}requestReset(){this.$fastController.isConnected&&this.pendingReset===!1&&(this.setInitialState(),v.queueUpdate(()=>this.reset()),this.pendingReset=!0)}setInitialState(){this.initialLayoutComplete=!1,this.regionVisible=!1,this.translateX=0,this.translateY=0,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.viewportRect=void 0,this.regionRect=void 0,this.anchorRect=void 0,this.verticalPosition=void 0,this.horizontalPosition=void 0,this.style.opacity="0",this.style.pointerEvents="none",this.forceUpdate=!1,this.style.position=this.fixedPlacement?"fixed":"absolute",this.updatePositionClasses(),this.updateRegionStyle()}};oe.intersectionService=new Hi;s([d],oe.prototype,"anchor",void 0);s([d],oe.prototype,"viewport",void 0);s([d({attribute:"horizontal-positioning-mode"})],oe.prototype,"horizontalPositioningMode",void 0);s([d({attribute:"horizontal-default-position"})],oe.prototype,"horizontalDefaultPosition",void 0);s([d({attribute:"horizontal-viewport-lock",mode:"boolean"})],oe.prototype,"horizontalViewportLock",void 0);s([d({attribute:"horizontal-inset",mode:"boolean"})],oe.prototype,"horizontalInset",void 0);s([d({attribute:"horizontal-threshold"})],oe.prototype,"horizontalThreshold",void 0);s([d({attribute:"horizontal-scaling"})],oe.prototype,"horizontalScaling",void 0);s([d({attribute:"vertical-positioning-mode"})],oe.prototype,"verticalPositioningMode",void 0);s([d({attribute:"vertical-default-position"})],oe.prototype,"verticalDefaultPosition",void 0);s([d({attribute:"vertical-viewport-lock",mode:"boolean"})],oe.prototype,"verticalViewportLock",void 0);s([d({attribute:"vertical-inset",mode:"boolean"})],oe.prototype,"verticalInset",void 0);s([d({attribute:"vertical-threshold"})],oe.prototype,"verticalThreshold",void 0);s([d({attribute:"vertical-scaling"})],oe.prototype,"verticalScaling",void 0);s([d({attribute:"fixed-placement",mode:"boolean"})],oe.prototype,"fixedPlacement",void 0);s([d({attribute:"auto-update-mode"})],oe.prototype,"autoUpdateMode",void 0);s([p],oe.prototype,"anchorElement",void 0);s([p],oe.prototype,"viewportElement",void 0);s([p],oe.prototype,"initialLayoutComplete",void 0)});var Fr,Lr,Br,Nr,mc,Hr,fc,gc=c(()=>{Fr={horizontalDefaultPosition:"center",horizontalPositioningMode:"locktodefault",horizontalInset:!1,horizontalScaling:"anchor"},Lr=Object.assign(Object.assign({},Fr),{verticalDefaultPosition:"top",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),Br=Object.assign(Object.assign({},Fr),{verticalDefaultPosition:"bottom",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),Nr=Object.assign(Object.assign({},Fr),{verticalPositioningMode:"dynamic",verticalInset:!1,verticalScaling:"content"}),mc=Object.assign(Object.assign({},Lr),{verticalScaling:"fill"}),Hr=Object.assign(Object.assign({},Br),{verticalScaling:"fill"}),fc=Object.assign(Object.assign({},Nr),{verticalScaling:"fill"})});var _r=c(()=>{hc();pc();gc()});var bc=c(()=>{});var ko,vc=c(()=>{T();g();P();ko=class extends b{connectedCallback(){super.connectedCallback(),this.shape||(this.shape="circle")}};s([d],ko.prototype,"fill",void 0);s([d],ko.prototype,"color",void 0);s([d],ko.prototype,"link",void 0);s([d],ko.prototype,"shape",void 0)});var yc=c(()=>{bc();vc()});var _i,xc=c(()=>{g();_i=(o,e)=>k`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`});var wt,Cc=c(()=>{T();g();P();wt=class extends b{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;let e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}};s([d({attribute:"fill"})],wt.prototype,"fill",void 0);s([d({attribute:"color"})],wt.prototype,"color",void 0);s([d({mode:"boolean"})],wt.prototype,"circular",void 0)});var wc=c(()=>{xc();Cc()});var kc=c(()=>{});var ao,Vr=c(()=>{T();g();Ar();ro();ue();ao=class extends we{constructor(){super(...arguments),this.separator=!0}};s([p],ao.prototype,"separator",void 0);M(ao,_,so)});var $c=c(()=>{kc();Vr()});var Tc=c(()=>{});var zr,Ic=c(()=>{T();g();Vr();P();zr=class extends b{slottedBreadcrumbItemsChanged(){if(this.$fastController.isConnected){if(this.slottedBreadcrumbItems===void 0||this.slottedBreadcrumbItems.length===0)return;let e=this.slottedBreadcrumbItems[this.slottedBreadcrumbItems.length-1];this.slottedBreadcrumbItems.forEach(t=>{let i=t===e;this.setItemSeparator(t,i),this.setAriaCurrent(t,i)})}}setItemSeparator(e,t){e instanceof ao&&(e.separator=!t)}findChildWithHref(e){var t,i;return e.childElementCount>0?e.querySelector("a[href]"):!((t=e.shadowRoot)===null||t===void 0)&&t.childElementCount?(i=e.shadowRoot)===null||i===void 0?void 0:i.querySelector("a[href]"):null}setAriaCurrent(e,t){let i=this.findChildWithHref(e);i===null&&e.hasAttribute("href")&&e instanceof ao?t?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current"):i!==null&&(t?i.setAttribute("aria-current","page"):i.removeAttribute("aria-current"))}};s([p],zr.prototype,"slottedBreadcrumbItems",void 0)});var Sc=c(()=>{Tc();Ic()});var Pc,Ec=c(()=>{g();fe();Pc=(o,e)=>k`
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
        ${Z("control")}
    >
        ${qe(o,e)}
        <span class="content" part="content">
            <slot ${K("defaultSlottedContent")}></slot>
        </span>
        ${Ge(o,e)}
    </button>
`});function ce(o){let e=class extends o{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return Oc}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){let t=this.proxy.labels,i=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),n=t?i.concat(Array.from(t)):i;return Object.freeze(n)}else return ze}valueChanged(t,i){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,i){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),v.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),v.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!Oc)return null;let t=Rc.get(this);return t||(t=this.attachInternals(),Rc.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){super.disconnectedCallback(),this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,i,n){this.elementInternals?this.elementInternals.setValidity(t,i,n):typeof i=="string"&&this.proxy.setCustomValidity(i)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(i=>this.proxy.addEventListener(i,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",Mc),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",Mc)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(t){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage,t)}setFormValue(t,i){this.elementInternals&&this.elementInternals.setFormValue(t,i||t)}_keypressHandler(t){switch(t.key){case te:if(this.form instanceof HTMLFormElement){let i=this.form.querySelector("[type=submit]");i?.click()}break}}stopPropagation(t){t.stopPropagation()}};return d({mode:"boolean"})(e.prototype,"disabled"),d({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),d({attribute:"current-value"})(e.prototype,"currentValue"),d(e.prototype,"name"),d({mode:"boolean"})(e.prototype,"required"),p(e.prototype,"value"),e}function $o(o){class e extends ce(o){}class t extends e{constructor(...n){super(n),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(n,r){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),n!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(n,r){this.checked=this.currentChecked}updateForm(){let n=this.checked?this.value:null;this.setFormValue(n,n)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return d({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),d({attribute:"current-checked",converter:Kt})(t.prototype,"currentChecked"),p(t.prototype,"defaultChecked"),p(t.prototype,"checked"),t}var Mc,Dc,Oc,Rc,De=c(()=>{g();R();Mc="form-associated-proxy",Dc="ElementInternals",Oc=Dc in window&&"setFormValue"in window[Dc].prototype,Rc=new WeakMap});var Ur,Vi,Ac=c(()=>{De();P();Ur=class extends b{},Vi=class extends ce(Ur){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Oe,To,Fc=c(()=>{T();g();ro();ue();Ac();Oe=class extends Vi{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;let e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}validate(){super.validate(this.control)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.removeEventListener("click",this.handleClick)})}};s([d({mode:"boolean"})],Oe.prototype,"autofocus",void 0);s([d({attribute:"form"})],Oe.prototype,"formId",void 0);s([d],Oe.prototype,"formaction",void 0);s([d],Oe.prototype,"formenctype",void 0);s([d],Oe.prototype,"formmethod",void 0);s([d({mode:"boolean"})],Oe.prototype,"formnovalidate",void 0);s([d],Oe.prototype,"formtarget",void 0);s([d],Oe.prototype,"type",void 0);s([p],Oe.prototype,"defaultSlottedContent",void 0);To=class{};s([d({attribute:"aria-expanded"})],To.prototype,"ariaExpanded",void 0);s([d({attribute:"aria-pressed"})],To.prototype,"ariaPressed",void 0);M(To,A);M(Oe,_,To)});var Lc=c(()=>{Ec();Fc()});var zi,jr=c(()=>{zi=class{constructor(e){if(this.dayFormat="numeric",this.weekdayFormat="long",this.monthFormat="long",this.yearFormat="numeric",this.date=new Date,e)for(let t in e){let i=e[t];t==="date"?this.date=this.getDateObject(i):this[t]=i}}getDateObject(e){if(typeof e=="string"){let t=e.split(/[/-]/);return t.length<3?new Date:new Date(parseInt(t[2],10),parseInt(t[0],10)-1,parseInt(t[1],10))}else if("day"in e&&"month"in e&&"year"in e){let{day:t,month:i,year:n}=e;return new Date(n,i-1,t)}return e}getDate(e=this.date,t={weekday:this.weekdayFormat,month:this.monthFormat,day:this.dayFormat,year:this.yearFormat},i=this.locale){let n=this.getDateObject(e);if(!n.getTime())return"";let r=Object.assign({timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},t);return new Intl.DateTimeFormat(i,r).format(n)}getDay(e=this.date.getDate(),t=this.dayFormat,i=this.locale){return this.getDate({month:1,day:e,year:2020},{day:t},i)}getMonth(e=this.date.getMonth()+1,t=this.monthFormat,i=this.locale){return this.getDate({month:e,day:2,year:2020},{month:t},i)}getYear(e=this.date.getFullYear(),t=this.yearFormat,i=this.locale){return this.getDate({month:2,day:2,year:e},{year:t},i)}getWeekday(e=0,t=this.weekdayFormat,i=this.locale){let n=`1-${e+1}-2017`;return this.getDate(n,{weekday:t},i)}getWeekdays(e=this.weekdayFormat,t=this.locale){return Array(7).fill(null).map((i,n)=>this.getWeekday(n,e,t))}}});var Ne,Bc=c(()=>{T();g();R();P();jr();Ne=class extends b{constructor(){super(...arguments),this.dateFormatter=new zi,this.readonly=!1,this.locale="en-US",this.month=new Date().getMonth()+1,this.year=new Date().getFullYear(),this.dayFormat="numeric",this.weekdayFormat="short",this.monthFormat="long",this.yearFormat="numeric",this.minWeeks=0,this.disabledDates="",this.selectedDates="",this.oneDayInMs=864e5}localeChanged(){this.dateFormatter.locale=this.locale}dayFormatChanged(){this.dateFormatter.dayFormat=this.dayFormat}weekdayFormatChanged(){this.dateFormatter.weekdayFormat=this.weekdayFormat}monthFormatChanged(){this.dateFormatter.monthFormat=this.monthFormat}yearFormatChanged(){this.dateFormatter.yearFormat=this.yearFormat}getMonthInfo(e=this.month,t=this.year){let i=h=>new Date(h.getFullYear(),h.getMonth(),1).getDay(),n=h=>{let u=new Date(h.getFullYear(),h.getMonth()+1,1);return new Date(u.getTime()-this.oneDayInMs).getDate()},r=new Date(t,e-1),a=new Date(t,e),l=new Date(t,e-2);return{length:n(r),month:e,start:i(r),year:t,previous:{length:n(l),month:l.getMonth()+1,start:i(l),year:l.getFullYear()},next:{length:n(a),month:a.getMonth()+1,start:i(a),year:a.getFullYear()}}}getDays(e=this.getMonthInfo(),t=this.minWeeks){t=t>10?10:t;let{start:i,length:n,previous:r,next:a}=e,l=[],h=1-i;for(;h<n+1||l.length<t||l[l.length-1].length%7!==0;){let{month:u,year:m}=h<1?r:h>n?a:e,f=h<1?r.length+h:h>n?h-n:h,y=`${u}-${f}-${m}`,$=this.dateInString(y,this.disabledDates),I=this.dateInString(y,this.selectedDates),N={day:f,month:u,year:m,disabled:$,selected:I},Q=l[l.length-1];l.length===0||Q.length%7===0?l.push([N]):Q.push(N),h++}return l}dateInString(e,t){let i=t.split(",").map(n=>n.trim());return e=typeof e=="string"?e:`${e.getMonth()+1}-${e.getDate()}-${e.getFullYear()}`,i.some(n=>n===e)}getDayClassNames(e,t){let{day:i,month:n,year:r,disabled:a,selected:l}=e,h=t===`${n}-${i}-${r}`,u=this.month!==n;return["day",h&&"today",u&&"inactive",a&&"disabled",l&&"selected"].filter(Boolean).join(" ")}getWeekdayText(){let e=this.dateFormatter.getWeekdays().map(t=>({text:t}));if(this.weekdayFormat!=="long"){let t=this.dateFormatter.getWeekdays("long");e.forEach((i,n)=>{i.abbr=t[n]})}return e}handleDateSelect(e,t){e.preventDefault,this.$emit("dateselected",t)}handleKeydown(e,t){return e.key===te&&this.handleDateSelect(e,t),!0}};s([d({mode:"boolean"})],Ne.prototype,"readonly",void 0);s([d],Ne.prototype,"locale",void 0);s([d({converter:D})],Ne.prototype,"month",void 0);s([d({converter:D})],Ne.prototype,"year",void 0);s([d({attribute:"day-format",mode:"fromView"})],Ne.prototype,"dayFormat",void 0);s([d({attribute:"weekday-format",mode:"fromView"})],Ne.prototype,"weekdayFormat",void 0);s([d({attribute:"month-format",mode:"fromView"})],Ne.prototype,"monthFormat",void 0);s([d({attribute:"year-format",mode:"fromView"})],Ne.prototype,"yearFormat",void 0);s([d({attribute:"min-weeks",converter:D})],Ne.prototype,"minWeeks",void 0);s([d({attribute:"disabled-dates"})],Ne.prototype,"disabledDates",void 0);s([d({attribute:"selected-dates"})],Ne.prototype,"selectedDates",void 0)});var lo,tt,kt,Ui=c(()=>{lo={none:"none",default:"default",sticky:"sticky"},tt={default:"default",columnHeader:"columnheader",rowHeader:"rowheader"},kt={default:"default",header:"header",stickyHeader:"sticky-header"}});var le,Gr=c(()=>{T();g();R();P();Ui();le=class extends b{constructor(){super(...arguments),this.rowType=kt.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new vt(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(xt,this.handleFocusout),this.addEventListener(Ct,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(xt,this.handleFocusout),this.removeEventListener(Ct,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case xe:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case Ce:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case se:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case ae:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===kt.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===kt.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}};s([d({attribute:"grid-template-columns"})],le.prototype,"gridTemplateColumns",void 0);s([d({attribute:"row-type"})],le.prototype,"rowType",void 0);s([p],le.prototype,"rowData",void 0);s([p],le.prototype,"columnDefinitions",void 0);s([p],le.prototype,"cellItemTemplate",void 0);s([p],le.prototype,"headerCellItemTemplate",void 0);s([p],le.prototype,"rowIndex",void 0);s([p],le.prototype,"isActiveRow",void 0);s([p],le.prototype,"activeCellItemTemplate",void 0);s([p],le.prototype,"defaultCellItemTemplate",void 0);s([p],le.prototype,"defaultHeaderCellItemTemplate",void 0);s([p],le.prototype,"cellElements",void 0)});function lf(o){let e=o.tagFor(le);return k`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,i)=>i.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,i)=>i.parent.headerCellItemTemplate}"
    ></${e}>
`}var Nc,Hc=c(()=>{g();Gr();Nc=(o,e)=>{let t=lf(o),i=o.tagFor(le);return k`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>i}"
            :defaultRowItemTemplate="${t}"
            ${Si({property:"rowElements",filter:oo("[role=row]")})}
        >
            <slot></slot>
        </template>
    `}});var de,_c=c(()=>{T();g();R();P();Ui();de=class o extends b{constructor(){super(),this.noTabbing=!1,this.generateHeader=lo.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,i)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}let n=Math.max(0,Math.min(this.rowElements.length-1,e)),a=this.rowElements[n].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),l=Math.max(0,Math.min(a.length-1,t)),h=a[l];i&&this.scrollHeight!==this.clientHeight&&(n<this.focusRowIndex&&this.scrollTop>0||n>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&h.scrollIntoView({block:"center",inline:"center"}),h.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(i=>{i.addedNodes.forEach(n=>{n.nodeType===1&&n.getAttribute("role")==="row"&&(n.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,v.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){let t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,i)=>{let n=t;n.rowIndex=i,n.gridTemplateColumns=e,this.columnDefinitionsStale&&(n.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(i=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=o.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=o.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new vt(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(Er,this.handleFocus),this.addEventListener(Ct,this.handleKeydown),this.addEventListener(xt,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),v.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(Er,this.handleFocus),this.removeEventListener(Ct,this.handleKeydown),this.removeEventListener(xt,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;let t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t,i=this.rowElements.length-1,n=this.offsetHeight+this.scrollTop,r=this.rowElements[i];switch(e.key){case X:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case Y:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case Yl:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){let a=this.rowElements[t];if(a.offsetTop<this.scrollTop){this.scrollTop=a.offsetTop+a.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case Wl:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=i||r.offsetTop+r.offsetHeight<=n){this.focusOnCell(i,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=i;t++){let a=this.rowElements[t];if(a.offsetTop+a.offsetHeight>n){let l=0;this.generateHeader===lo.sticky&&this.generatedHeader!==null&&(l=this.generatedHeader.clientHeight),this.scrollTop=a.offsetTop-l;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case se:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case ae:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,v.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==lo.none&&this.rowsData.length>0){let e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===lo.sticky?kt.stickyHeader:kt.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}};de.generateColumns=o=>Object.getOwnPropertyNames(o).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));s([d({attribute:"no-tabbing",mode:"boolean"})],de.prototype,"noTabbing",void 0);s([d({attribute:"generate-header"})],de.prototype,"generateHeader",void 0);s([d({attribute:"grid-template-columns"})],de.prototype,"gridTemplateColumns",void 0);s([p],de.prototype,"rowsData",void 0);s([p],de.prototype,"columnDefinitions",void 0);s([p],de.prototype,"rowItemTemplate",void 0);s([p],de.prototype,"cellItemTemplate",void 0);s([p],de.prototype,"headerCellItemTemplate",void 0);s([p],de.prototype,"focusRowIndex",void 0);s([p],de.prototype,"focusColumnIndex",void 0);s([p],de.prototype,"defaultRowItemTemplate",void 0);s([p],de.prototype,"rowElementTag",void 0);s([p],de.prototype,"rowElements",void 0)});var cf,df,We,qr=c(()=>{T();g();R();P();Ui();cf=k`
    <template>
        ${o=>o.rowData===null||o.columnDefinition===null||o.columnDefinition.columnDataKey===null?null:o.rowData[o.columnDefinition.columnDataKey]}
    </template>
`,df=k`
    <template>
        ${o=>o.columnDefinition===null?null:o.columnDefinition.title===void 0?o.columnDefinition.columnDataKey:o.columnDefinition.title}
    </template>
`,We=class extends b{constructor(){super(...arguments),this.cellType=tt.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(Mr,this.handleFocusin),this.addEventListener(xt,this.handleFocusout),this.addEventListener(Ct,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Mr,this.handleFocusin),this.removeEventListener(xt,this.handleFocusout),this.removeEventListener(Ct,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case tt.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===tt.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===tt.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case te:case ql:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case tt.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case Ee:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case tt.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=df.render(this,this);break;case void 0:case tt.rowHeader:case tt.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=cf.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}};s([d({attribute:"cell-type"})],We.prototype,"cellType",void 0);s([d({attribute:"grid-column"})],We.prototype,"gridColumn",void 0);s([p],We.prototype,"rowData",void 0);s([p],We.prototype,"columnDefinition",void 0)});function hf(o){let e=o.tagFor(We);return k`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,i)=>i.index+1}"
        :rowData="${(t,i)=>i.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function uf(o){let e=o.tagFor(We);return k`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,i)=>i.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}var Vc,zc=c(()=>{g();qr();Vc=(o,e)=>{let t=hf(o),i=uf(o);return k`
        <template
            role="row"
            class="${n=>n.rowType!=="default"?n.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${i}"
            ${Si({property:"cellElements",filter:oo('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${K("slottedCellElements")}></slot>
        </template>
    `}});var Uc,jc=c(()=>{g();Uc=(o,e)=>k`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `});var Gc=c(()=>{Hc();_c();zc();Gr();jc();qr()});var cC,qc=c(()=>{g();cC=k`
    <div
        class="title"
        part="title"
        aria-label="${o=>o.dateFormatter.getDate(`${o.month}-2-${o.year}`,{month:"long",year:"numeric"})}"
    >
        <span part="month">
            ${o=>o.dateFormatter.getMonth(o.month)}
        </span>
        <span part="year">${o=>o.dateFormatter.getYear(o.year)}</span>
    </div>
`});var Wc=c(()=>{Bc();qc();jr()});var Yc=c(()=>{});var Xc=c(()=>{});var Qc=c(()=>{Yc();Xc()});var Zc,Jc=c(()=>{g();Zc=(o,e)=>k`
    <template
        role="checkbox"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        tabindex="${t=>t.disabled?null:0}"
        @keypress="${(t,i)=>t.keypressHandler(i.event)}"
        @click="${(t,i)=>t.clickHandler(i.event)}"
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
            <slot ${K("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var Wr,ji,Kc=c(()=>{De();P();Wr=class extends b{},ji=class extends $o(Wr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var co,ed=c(()=>{T();g();R();Kc();co=class extends ji{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{this.readOnly||e.key===Me&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}};s([d({attribute:"readonly",mode:"boolean"})],co.prototype,"readOnly",void 0);s([p],co.prototype,"defaultSlottedNodes",void 0);s([p],co.prototype,"indeterminate",void 0)});var td=c(()=>{Jc();ed()});function Yr(o){return dt(o)&&(o.getAttribute("role")==="option"||o instanceof HTMLOptionElement)}var Ye,jt,Xr=c(()=>{T();g();R();P();Xo();fe();ue();Ye=class extends b{constructor(e,t,i,n){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),i&&(this.defaultSelected=i),n&&(this.selected=n),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){let t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),w.notify(this,"value")}get value(){var e;return w.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}};s([p],Ye.prototype,"checked",void 0);s([p],Ye.prototype,"content",void 0);s([p],Ye.prototype,"defaultSelected",void 0);s([d({mode:"boolean"})],Ye.prototype,"disabled",void 0);s([d({attribute:"selected",mode:"boolean"})],Ye.prototype,"selectedAttribute",void 0);s([p],Ye.prototype,"selected",void 0);s([d({attribute:"value",mode:"fromView"})],Ye.prototype,"initialValue",void 0);jt=class{};s([p],jt.prototype,"ariaChecked",void 0);s([p],jt.prototype,"ariaPosInSet",void 0);s([p],jt.prototype,"ariaSelected",void 0);s([p],jt.prototype,"ariaSetSize",void 0);M(jt,A);M(Ye,_,jt)});var pe,Xe,ho=c(()=>{T();g();R();P();Xr();Xo();ue();pe=class o extends b{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return w.track(this,"options"),this._options}set options(e){this._options=e,w.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){let t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){let e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(i=>i.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){let i=e>t?-1:e<t?1:0,n=e+i,r=null;switch(i){case-1:{r=this.options.reduceRight((a,l,h)=>!a&&!l.disabled&&h<n?l:a,r);break}case 1:{r=this.options.reduce((a,l,h)=>!a&&!l.disabled&&h>n?l:a,r);break}}return this.options.indexOf(r)}handleChange(e,t){t==="selected"&&(o.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions())}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,o.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;let t=e.key;switch(t){case se:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case Y:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case X:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case ae:{e.preventDefault(),this.selectLastOption();break}case _t:return this.focusAndScrollOptionIntoView(),!0;case te:case Ee:return!0;case Me:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var i;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(!((i=this.options[this.selectedIndex])===null||i===void 0)&&i.disabled&&typeof e=="number"){let n=this.getSelectableIndex(e,t),r=n>-1?n:e;this.selectedIndex=r,t===r&&this.selectedIndexChanged(t,r);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var i;let n=t.filter(o.slottedOptionFilter);(i=this.options)===null||i===void 0||i.forEach(r=>{let a=w.getNotifier(r);a.unsubscribe(this,"selected"),r.selected=n.includes(r),a.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>!i.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=Rl(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>i.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,i;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&i!==void 0?i:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((n,r)=>(Yr(r)&&n.push(r),n),[]);let i=`${this.options.length}`;this.options.forEach((n,r)=>{n.id||(n.id=Le("option-")),n.ariaPosInSet=`${r+1}`,n.ariaSetSize=i}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){let i=this.getTypeaheadMatches();if(i.length){let n=this.options.indexOf(i[0]);n>-1&&(this.selectedIndex=n)}this.typeaheadExpired=!1}}};pe.slottedOptionFilter=o=>Yr(o)&&!o.hidden;pe.TYPE_AHEAD_TIMEOUT_MS=1e3;s([d({mode:"boolean"})],pe.prototype,"disabled",void 0);s([p],pe.prototype,"selectedIndex",void 0);s([p],pe.prototype,"selectedOptions",void 0);s([p],pe.prototype,"slottedOptions",void 0);s([p],pe.prototype,"typeaheadBuffer",void 0);Xe=class{};s([p],Xe.prototype,"ariaActiveDescendant",void 0);s([p],Xe.prototype,"ariaDisabled",void 0);s([p],Xe.prototype,"ariaExpanded",void 0);s([p],Xe.prototype,"ariaMultiSelectable",void 0);M(Xe,A);M(pe,Xe)});var ht,Gi=c(()=>{ht={above:"above",below:"below"}});var Qr,qi,od=c(()=>{De();ho();Qr=class extends pe{},qi=class extends ce(Qr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Qo,Zr=c(()=>{Qo={inline:"inline",list:"list",both:"both",none:"none"}});var $t,Io,id=c(()=>{T();g();R();ho();fe();Gi();ue();od();Zr();$t=class extends qi{constructor(){super(...arguments),this._value="",this.filteredOptions=[],this.filter="",this.forcedPosition=!1,this.listboxId=Le("listbox-"),this.maxHeight=0,this.open=!1}formResetCallback(){super.formResetCallback(),this.setDefaultSelectedOption(),this.updateValue()}validate(){super.validate(this.control)}get isAutocompleteInline(){return this.autocomplete===Qo.inline||this.isAutocompleteBoth}get isAutocompleteList(){return this.autocomplete===Qo.list||this.isAutocompleteBoth}get isAutocompleteBoth(){return this.autocomplete===Qo.both}openChanged(){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),v.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}get options(){return w.track(this,"options"),this.filteredOptions.length?this.filteredOptions:this._options}set options(e){this._options=e,w.notify(this,"options")}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}get value(){return w.track(this,"value"),this._value}set value(e){var t,i,n;let r=`${this._value}`;if(this.$fastController.isConnected&&this.options){let a=this.options.findIndex(u=>u.text.toLowerCase()===e.toLowerCase()),l=(t=this.options[this.selectedIndex])===null||t===void 0?void 0:t.text,h=(i=this.options[a])===null||i===void 0?void 0:i.text;this.selectedIndex=l!==h?a:this.selectedIndex,e=((n=this.firstSelectedOption)===null||n===void 0?void 0:n.text)||e}r!==e&&(this._value=e,super.valueChanged(r,e),w.notify(this,"value"))}clickHandler(e){let t=e.target.closest("option,[role=option]");if(!(this.disabled||t?.disabled)){if(this.open){if(e.composedPath()[0]===this.control)return;t&&(this.selectedOptions=[t],this.control.value=t.text,this.clearSelectionRange(),this.updateValue(!0))}return this.open=!this.open,this.open&&this.control.focus(),!0}}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.value&&(this.initialValue=this.value)}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}filterOptions(){(!this.autocomplete||this.autocomplete===Qo.none)&&(this.filter="");let e=this.filter.toLowerCase();this.filteredOptions=this._options.filter(t=>t.text.toLowerCase().startsWith(this.filter.toLowerCase())),this.isAutocompleteList&&(!this.filteredOptions.length&&!e&&(this.filteredOptions=this._options),this._options.forEach(t=>{t.hidden=!this.filteredOptions.includes(t)}))}focusAndScrollOptionIntoView(){this.contains(document.activeElement)&&(this.control.focus(),this.firstSelectedOption&&requestAnimationFrame(()=>{var e;(e=this.firstSelectedOption)===null||e===void 0||e.scrollIntoView({block:"nearest"})}))}focusoutHandler(e){if(this.syncValue(),!this.open)return!0;let t=e.relatedTarget;if(this.isSameNode(t)){this.focus();return}(!this.options||!this.options.includes(t))&&(this.open=!1)}inputHandler(e){if(this.filter=this.control.value,this.filterOptions(),this.isAutocompleteInline||(this.selectedIndex=this.options.map(t=>t.text).indexOf(this.control.value)),e.inputType.includes("deleteContent")||!this.filter.length)return!0;this.isAutocompleteList&&!this.open&&(this.open=!0),this.isAutocompleteInline&&(this.filteredOptions.length?(this.selectedOptions=[this.filteredOptions[0]],this.selectedIndex=this.options.indexOf(this.firstSelectedOption),this.setInlineSelection()):this.selectedIndex=-1)}keydownHandler(e){let t=e.key;if(e.ctrlKey||e.shiftKey)return!0;switch(t){case"Enter":{this.syncValue(),this.isAutocompleteInline&&(this.filter=this.value),this.open=!1,this.clearSelectionRange();break}case"Escape":{if(this.isAutocompleteInline||(this.selectedIndex=-1),this.open){this.open=!1;break}this.value="",this.control.value="",this.filter="",this.filterOptions();break}case"Tab":{if(this.setInputToSelection(),!this.open)return!0;e.preventDefault(),this.open=!1;break}case"ArrowUp":case"ArrowDown":{if(this.filterOptions(),!this.open){this.open=!0;break}this.filteredOptions.length>0&&super.keydownHandler(e),this.isAutocompleteInline&&this.setInlineSelection();break}default:return!0}}keyupHandler(e){switch(e.key){case"ArrowLeft":case"ArrowRight":case"Backspace":case"Delete":case"Home":case"End":{this.filter=this.control.value,this.selectedIndex=-1,this.filterOptions();break}}}selectedIndexChanged(e,t){if(this.$fastController.isConnected){if(t=zt(-1,this.options.length-1,t),t!==this.selectedIndex){this.selectedIndex=t;return}super.selectedIndexChanged(e,t)}}selectPreviousOption(){!this.disabled&&this.selectedIndex>=0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){if(this.$fastController.isConnected&&this.options){let e=this.options.findIndex(t=>t.getAttribute("selected")!==null||t.selected);this.selectedIndex=e,!this.dirtyValue&&this.firstSelectedOption&&(this.value=this.firstSelectedOption.text),this.setSelectedOptions()}}setInputToSelection(){this.firstSelectedOption&&(this.control.value=this.firstSelectedOption.text,this.control.focus())}setInlineSelection(){this.firstSelectedOption&&(this.setInputToSelection(),this.control.setSelectionRange(this.filter.length,this.control.value.length,"backward"))}syncValue(){var e;let t=this.selectedIndex>-1?(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text:this.control.value;this.updateValue(this.value!==t)}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?ht.above:ht.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===ht.above?~~e.top:~~i}selectedOptionsChanged(e,t){this.$fastController.isConnected&&this._options.forEach(i=>{i.selected=t.includes(i)})}slottedOptionsChanged(e,t){super.slottedOptionsChanged(e,t),this.updateValue()}updateValue(e){var t;this.$fastController.isConnected&&(this.value=((t=this.firstSelectedOption)===null||t===void 0?void 0:t.text)||this.control.value,this.control.value=this.value),e&&this.$emit("change")}clearSelectionRange(){let e=this.control.value.length;this.control.setSelectionRange(e,e)}};s([d({attribute:"autocomplete",mode:"fromView"})],$t.prototype,"autocomplete",void 0);s([p],$t.prototype,"maxHeight",void 0);s([d({attribute:"open",mode:"boolean"})],$t.prototype,"open",void 0);s([d],$t.prototype,"placeholder",void 0);s([d({attribute:"position"})],$t.prototype,"positionAttribute",void 0);s([p],$t.prototype,"position",void 0);Io=class{};s([p],Io.prototype,"ariaAutoComplete",void 0);s([p],Io.prototype,"ariaControls",void 0);M(Io,Xe);M($t,_,Io)});var nd=c(()=>{});var rd=c(()=>{id();Zr();nd()});function Zo(o){let e=o.parentElement;if(e)return e;{let t=o.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}var Wi=c(()=>{});function sd(o,e){let t=e;for(;t!==null;){if(t===o)return!0;t=Zo(t)}return!1}var ad=c(()=>{Wi()});function pf(o){return o instanceof Ht}var ut,Jo,Kr,es,ts,Yi,os,Gt,Jr,mf,uo,is=c(()=>{T();g();ut=document.createElement("div");Jo=class{setProperty(e,t){v.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){v.queueUpdate(()=>this.target.removeProperty(e))}},Kr=class extends Jo{constructor(e){super();let t=new CSSStyleSheet;t[Ci]=!0,this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(ne.create([t]))}},es=class extends Jo{constructor(){super();let e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}},ts=class extends Jo{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);let{sheet:e}=this.style;if(e){let t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}},Yi=class{constructor(e){this.store=new Map,this.target=null;let t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),w.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(let[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),v.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),v.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){let{sheet:i}=this.style;if(i){let n=i.insertRule(":host{}",i.cssRules.length);this.target=i.cssRules[n].style}else this.target=null}};s([p],Yi.prototype,"target",void 0);os=class{constructor(e){this.target=e.style}setProperty(e,t){v.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){v.queueUpdate(()=>this.target.removeProperty(e))}},Gt=class o{setProperty(e,t){o.properties[e]=t;for(let i of o.roots.values())uo.getOrCreate(o.normalizeRoot(i)).setProperty(e,t)}removeProperty(e){delete o.properties[e];for(let t of o.roots.values())uo.getOrCreate(o.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){let{roots:t}=o;if(!t.has(e)){t.add(e);let i=uo.getOrCreate(this.normalizeRoot(e));for(let n in o.properties)i.setProperty(n,o.properties[n])}}static unregisterRoot(e){let{roots:t}=o;if(t.has(e)){t.delete(e);let i=uo.getOrCreate(o.normalizeRoot(e));for(let n in o.properties)i.removeProperty(n)}}static normalizeRoot(e){return e===ut?document:e}};Gt.roots=new Set;Gt.properties={};Jr=new WeakMap,mf=v.supportsAdoptedStyleSheets?Kr:Yi,uo=Object.freeze({getOrCreate(o){if(Jr.has(o))return Jr.get(o);let e;return o===ut?e=new Gt:o instanceof Document?e=v.supportsAdoptedStyleSheets?new es:new ts:pf(o)?e=new mf(o):e=new os(o),Jr.set(o,e),e}})});function ff(o){return ot.from(o)}var ot,ns,rs,ss,Ko,ei,Te,ti,as=c(()=>{T();g();Wi();ad();is();is();ot=class o extends eo{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=o.uniqueId(),o.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new o({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return o.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){let t=Te.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof o&&(t=this.alias(t)),Te.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),Te.existsFor(e)&&Te.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(ut,e),this}subscribe(e,t){let i=this.getOrCreateSubscriberSet(t);t&&!Te.existsFor(t)&&Te.getOrCreate(t),i.has(e)||i.add(e)}unsubscribe(e,t){let i=this.subscribers.get(t||this);i&&i.has(e)&&i.delete(e)}notify(e){let t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(i=>i.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(i=>i.handleChange(t))}alias(e){return(t=>e.getValueFor(t))}};ot.uniqueId=(()=>{let o=0;return()=>(o++,o.toString(16))})();ot.tokensById=new Map;ns=class{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){let{token:t,target:i}=e;this.add(t,i)}add(e,t){uo.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(Te.getOrCreate(t).get(e)))}remove(e,t){uo.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}},rs=class{constructor(e,t,i){this.source=e,this.token=t,this.node=i,this.dependencies=new Set,this.observer=w.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){try{this.node.store.set(this.token,this.observer.observe(this.node.target,Ft))}catch(e){console.error(e)}}},ss=class{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),w.getNotifier(this).notify(e.id))}get(e){return w.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e),w.getNotifier(this).notify(e.id)}all(){return this.values.entries()}},Ko=new WeakMap,ei=new WeakMap,Te=class o{constructor(e){this.target=e,this.store=new ss,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,i)=>{let n=ot.getTokenById(i);n&&(n.notify(this.target),this.updateCSSTokenReflection(t,n))}},Ko.set(e,this),w.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof Ht?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return Ko.get(e)||new o(e)}static existsFor(e){return Ko.has(e)}static findParent(e){if(ut!==e.target){let t=Zo(e.target);for(;t!==null;){if(Ko.has(t))return Ko.get(t);t=Zo(t)}return o.getOrCreate(ut)}return null}static findClosestAssignedNode(e,t){let i=t;do{if(i.has(e))return i;i=i.parent?i.parent:i.target!==ut?o.getOrCreate(ut):null}while(i!==null);return null}get parent(){return ei.get(this)||null}updateCSSTokenReflection(e,t){if(ot.isCSSDesignToken(t)){let i=this.parent,n=this.isReflecting(t);if(i){let r=i.get(t),a=e.get(t);r!==a&&!n?this.reflectToCSS(t):r===a&&n&&this.stopReflectToCSS(t)}else n||this.reflectToCSS(t)}}has(e){return this.assignedValues.has(e)}get(e){let t=this.store.get(e);if(t!==void 0)return t;let i=this.getRaw(e);if(i!==void 0)return this.hydrate(e,i),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=o.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){ot.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),ot.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);let t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){let e=o.findParent(this);e&&e.appendChild(this);for(let t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&ei.get(this).removeChild(this);for(let e of this.bindingObservers.keys())this.tearDownBindingObserver(e)}appendChild(e){e.parent&&ei.get(e).removeChild(e);let t=this.children.filter(i=>e.contains(i));ei.set(e,this),this.children.push(e),t.forEach(i=>e.appendChild(i)),w.getNotifier(this.store).subscribe(e);for(let[i,n]of this.store.all())e.hydrate(i,this.bindingObservers.has(i)?this.getRaw(i):n),e.updateCSSTokenReflection(e.store,i)}removeChild(e){let t=this.children.indexOf(e);if(t!==-1&&this.children.splice(t,1),w.getNotifier(this.store).unsubscribe(e),e.parent!==this)return!1;let i=ei.delete(e);for(let[n]of this.store.all())e.hydrate(n,e.getRaw(n)),e.updateCSSTokenReflection(e.store,n);return i}contains(e){return sd(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),o.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),o.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){let i=ot.getTokenById(t);i&&(this.hydrate(i,this.getRaw(i)),this.updateCSSTokenReflection(this.store,i))}hydrate(e,t){if(!this.has(e)){let i=this.bindingObservers.get(e);ot.isDerivedDesignTokenValue(t)?i?i.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(i&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){let i=new rs(t,e,this);return this.bindingObservers.set(e,i),i}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}};Te.cssCustomPropertyReflector=new ns;s([p],Te.prototype,"children",void 0);ti=Object.freeze({create:ff,notifyConnection(o){return!o.isConnected||!Te.existsFor(o)?!1:(Te.getOrCreate(o).bind(),!0)},notifyDisconnection(o){return o.isConnected||!Te.existsFor(o)?!1:(Te.getOrCreate(o).unbind(),!0)},registerRoot(o=ut){Gt.registerRoot(o)},unregisterRoot(o=ut){Gt.unregisterRoot(o)}})});function gf(o,e,t){return typeof o=="string"?{name:o,type:e,callback:t}:o}var ls,cs,Xi,So,oi,hs,Qi,ds,ld=c(()=>{g();P();Oi();as();Li();ls=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),cs=new Map,Xi=new Map,So=null,oi=z.createInterface(o=>o.cachedCallback(e=>(So===null&&(So=new Qi(null,e)),So))),hs=Object.freeze({tagFor(o){return Xi.get(o)},responsibleFor(o){let e=o.$$designSystem$$;return e||z.findResponsibleContainer(o).get(oi)},getOrCreate(o){if(!o)return So===null&&(So=z.getOrCreateDOMContainer().get(oi)),So;let e=o.$$designSystem$$;if(e)return e;let t=z.getOrCreateDOMContainer(o);if(t.has(oi,!1))return t.get(oi);{let i=new Qi(o,t);return t.register(io.instance(oi,i)),i}}});Qi=class{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>ls.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){let t=this.container,i=[],n=this.disambiguate,r=this.shadowRootMode,a={elementPrefix:this.prefix,tryDefineElement(l,h,u){let m=gf(l,h,u),{name:f,callback:y,baseClass:$}=m,{type:I}=m,N=f,Q=cs.get(N),_e=!0;for(;Q;){let Ze=n(N,I,Q);switch(Ze){case ls.ignoreDuplicate:return;case ls.definitionCallbackOnly:_e=!1,Q=void 0;break;default:N=Ze,Q=cs.get(N);break}}_e&&((Xi.has(I)||I===b)&&(I=class extends I{}),cs.set(N,I),Xi.set(I,N),$&&Xi.set($,N)),i.push(new ds(t,N,I,r,y,_e))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&ti.registerRoot(this.designTokenRoot)),t.registerWithContext(a,...e);for(let l of i)l.callback(l),l.willDefine&&l.definition!==null&&l.definition.define();return this}},ds=class{constructor(e,t,i,n,r,a){this.container=e,this.name=t,this.type=i,this.shadowRootMode=n,this.callback=r,this.willDefine=a,this.definition=null}definePresentation(e){Fi.define(this.name,e,this.container)}defineElement(e){this.definition=new ct(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return hs.tagFor(e)}}});var cd=c(()=>{});var dd=c(()=>{ld();Li();cd()});var hd=c(()=>{Oi()});var ud=c(()=>{});var md,bf,fd,ii,us,vf,gd,yf,xf,Cf,wf,kf,$f,pd,Tf,If,bd,Sf,ps,Pf,ms,fs=c(()=>{md=["input","select","textarea","a[href]","button","[tabindex]:not(slot)","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])',"details>summary:first-of-type","details"],bf=md.join(","),fd=typeof Element>"u",ii=fd?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,us=!fd&&Element.prototype.getRootNode?function(o){return o.getRootNode()}:function(o){return o.ownerDocument},vf=function(e,t){return e.tabIndex<0&&(t||/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||e.isContentEditable)&&isNaN(parseInt(e.getAttribute("tabindex"),10))?0:e.tabIndex},gd=function(e){return e.tagName==="INPUT"},yf=function(e){return gd(e)&&e.type==="hidden"},xf=function(e){var t=e.tagName==="DETAILS"&&Array.prototype.slice.apply(e.children).some(function(i){return i.tagName==="SUMMARY"});return t},Cf=function(e,t){for(var i=0;i<e.length;i++)if(e[i].checked&&e[i].form===t)return e[i]},wf=function(e){if(!e.name)return!0;var t=e.form||us(e),i=function(l){return t.querySelectorAll('input[type="radio"][name="'+l+'"]')},n;if(typeof window<"u"&&typeof window.CSS<"u"&&typeof window.CSS.escape=="function")n=i(window.CSS.escape(e.name));else try{n=i(e.name)}catch(a){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",a.message),!1}var r=Cf(n,e.form);return!r||r===e},kf=function(e){return gd(e)&&e.type==="radio"},$f=function(e){return kf(e)&&!wf(e)},pd=function(e){var t=e.getBoundingClientRect(),i=t.width,n=t.height;return i===0&&n===0},Tf=function(e,t){var i=t.displayCheck,n=t.getShadowRoot;if(getComputedStyle(e).visibility==="hidden")return!0;var r=ii.call(e,"details>summary:first-of-type"),a=r?e.parentElement:e;if(ii.call(a,"details:not([open]) *"))return!0;var l=us(e).host,h=l?.ownerDocument.contains(l)||e.ownerDocument.contains(e);if(!i||i==="full"){if(typeof n=="function"){for(var u=e;e;){var m=e.parentElement,f=us(e);if(m&&!m.shadowRoot&&n(m)===!0)return pd(e);e.assignedSlot?e=e.assignedSlot:!m&&f!==e.ownerDocument?e=f.host:e=m}e=u}if(h)return!e.getClientRects().length}else if(i==="non-zero-area")return pd(e);return!1},If=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName==="FIELDSET"&&t.disabled){for(var i=0;i<t.children.length;i++){var n=t.children.item(i);if(n.tagName==="LEGEND")return ii.call(t,"fieldset[disabled] *")?!0:!n.contains(e)}return!0}t=t.parentElement}return!1},bd=function(e,t){return!(t.disabled||yf(t)||Tf(t,e)||xf(t)||If(t))},Sf=function(e,t){return!($f(t)||vf(t)<0||!bd(e,t))},ps=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ii.call(e,bf)===!1?!1:Sf(t,e)},Pf=md.concat("iframe").join(","),ms=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ii.call(e,Pf)===!1?!1:bd(t,e)}});var qt,vd=c(()=>{T();g();R();fs();P();qt=class o extends b{constructor(){super(...arguments),this.modal=!0,this.hidden=!1,this.trapFocus=!0,this.trapFocusChanged=()=>{this.$fastController.isConnected&&this.updateTrapFocus()},this.isTrappingFocus=!1,this.handleDocumentKeydown=e=>{if(!e.defaultPrevented&&!this.hidden)switch(e.key){case Ee:this.dismiss(),e.preventDefault();break;case _t:this.handleTabKeyDown(e);break}},this.handleDocumentFocus=e=>{!e.defaultPrevented&&this.shouldForceFocus(e.target)&&(this.focusFirstElement(),e.preventDefault())},this.handleTabKeyDown=e=>{if(!this.trapFocus||this.hidden)return;let t=this.getTabQueueBounds();if(t.length!==0){if(t.length===1){t[0].focus(),e.preventDefault();return}e.shiftKey&&e.target===t[0]?(t[t.length-1].focus(),e.preventDefault()):!e.shiftKey&&e.target===t[t.length-1]&&(t[0].focus(),e.preventDefault())}},this.getTabQueueBounds=()=>{let e=[];return o.reduceTabbableItems(e,this)},this.focusFirstElement=()=>{let e=this.getTabQueueBounds();e.length>0?e[0].focus():this.dialog instanceof HTMLElement&&this.dialog.focus()},this.shouldForceFocus=e=>this.isTrappingFocus&&!this.contains(e),this.shouldTrapFocus=()=>this.trapFocus&&!this.hidden,this.updateTrapFocus=e=>{let t=e===void 0?this.shouldTrapFocus():e;t&&!this.isTrappingFocus?(this.isTrappingFocus=!0,document.addEventListener("focusin",this.handleDocumentFocus),v.queueUpdate(()=>{this.shouldForceFocus(document.activeElement)&&this.focusFirstElement()})):!t&&this.isTrappingFocus&&(this.isTrappingFocus=!1,document.removeEventListener("focusin",this.handleDocumentFocus))}}dismiss(){this.$emit("dismiss"),this.$emit("cancel")}show(){this.hidden=!1}hide(){this.hidden=!0,this.$emit("close")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleDocumentKeydown),this.notifier=w.getNotifier(this),this.notifier.subscribe(this,"hidden"),this.updateTrapFocus()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleDocumentKeydown),this.updateTrapFocus(!1),this.notifier.unsubscribe(this,"hidden")}handleChange(e,t){t==="hidden"&&this.updateTrapFocus()}static reduceTabbableItems(e,t){return t.getAttribute("tabindex")==="-1"?e:ps(t)||o.isFocusableFastElement(t)&&o.hasTabbableShadow(t)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceTabbableItems,[])):e}static isFocusableFastElement(e){var t,i;return!!(!((i=(t=e.$fastController)===null||t===void 0?void 0:t.definition.shadowOptions)===null||i===void 0)&&i.delegatesFocus)}static hasTabbableShadow(e){var t,i;return Array.from((i=(t=e.shadowRoot)===null||t===void 0?void 0:t.querySelectorAll("*"))!==null&&i!==void 0?i:[]).some(n=>ps(n))}};s([d({mode:"boolean"})],qt.prototype,"modal",void 0);s([d({mode:"boolean"})],qt.prototype,"hidden",void 0);s([d({attribute:"trap-focus",mode:"boolean"})],qt.prototype,"trapFocus",void 0);s([d({attribute:"aria-describedby"})],qt.prototype,"ariaDescribedby",void 0);s([d({attribute:"aria-labelledby"})],qt.prototype,"ariaLabelledby",void 0);s([d({attribute:"aria-label"})],qt.prototype,"ariaLabel",void 0)});var yd=c(()=>{ud();vd()});var xd=c(()=>{});var Zi,Cd=c(()=>{T();g();P();Zi=class extends b{connectedCallback(){super.connectedCallback(),this.setup()}disconnectedCallback(){super.disconnectedCallback(),this.details.removeEventListener("toggle",this.onToggle)}show(){this.details.open=!0}hide(){this.details.open=!1}toggle(){this.details.open=!this.details.open}setup(){this.onToggle=this.onToggle.bind(this),this.details.addEventListener("toggle",this.onToggle),this.expanded&&this.show()}onToggle(){this.expanded=this.details.open,this.$emit("toggle")}};s([d({mode:"boolean"})],Zi.prototype,"expanded",void 0);s([d],Zi.prototype,"title",void 0)});var wd=c(()=>{xd();Cd()});var kd,$d=c(()=>{g();kd=(o,e)=>k`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`});var Ji,Td=c(()=>{Ji={separator:"separator",presentation:"presentation"}});var Po,Id=c(()=>{T();g();R();P();Td();Po=class extends b{constructor(){super(...arguments),this.role=Ji.separator,this.orientation=U.horizontal}};s([d],Po.prototype,"role",void 0);s([d],Po.prototype,"orientation",void 0)});var Sd=c(()=>{$d();Id()});var Pd,Ed=c(()=>{Pd={next:"next",previous:"previous"}});var Md=c(()=>{});var ni,Dd=c(()=>{T();g();P();Ed();ni=class extends b{constructor(){super(...arguments),this.hiddenFromAT=!0,this.direction=Pd.next}keyupHandler(e){if(!this.hiddenFromAT){let t=e.key;(t==="Enter"||t==="Space")&&this.$emit("click",e),t==="Escape"&&this.blur()}}};s([d({mode:"boolean"})],ni.prototype,"disabled",void 0);s([d({attribute:"aria-hidden",converter:Kt})],ni.prototype,"hiddenFromAT",void 0);s([d],ni.prototype,"direction",void 0)});var Od=c(()=>{Md();Dd()});var Rd=c(()=>{De()});var Ad=c(()=>{P()});var Fd,Ld=c(()=>{g();fe();Fd=(o,e)=>k`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${qe(o,e)}
        <span class="content" part="content">
            <slot ${K("content")}></slot>
        </span>
        ${Ge(o,e)}
    </template>
`});var Bd=c(()=>{Xr();Ld()});var po,gs=c(()=>{T();g();R();ho();po=class extends pe{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var i,n;this.ariaActiveDescendant=(n=(i=this.options[t])===null||i===void 0?void 0:i.id)!==null&&n!==void 0?n:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;let e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,i)=>{t.checked=Yo(i,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Yo(i,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Yo(i,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,i)=>{t.checked=Yo(i,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);let i=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!i||i.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(i),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;let{key:t,shiftKey:i}=e;switch(this.shouldSkipFocus=!1,t){case se:{this.checkFirstOption(i);return}case Y:{this.checkNextOption(i);return}case X:{this.checkPreviousOption(i);return}case ae:{this.checkLastOption(i);return}case _t:return this.focusAndScrollOptionIntoView(),!0;case Ee:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Me:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var i;this.ariaMultiSelectable=t?"true":null,(i=this.options)===null||i===void 0||i.forEach(n=>{n.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var i;let n=Math.max(0,parseInt((i=t?.toFixed())!==null&&i!==void 0?i:"",10));n!==t&&v.queueUpdate(()=>{this.size=n})}toggleSelectedForAllCheckedOptions(){let e=this.checkedOptions.filter(i=>!i.disabled),t=!e.every(i=>i.selected);e.forEach(i=>i.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){let i=this.getTypeaheadMatches(),n=this.options.indexOf(i[0]);n>-1&&(this.activeIndex=n,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}};s([p],po.prototype,"activeIndex",void 0);s([d({mode:"boolean"})],po.prototype,"multiple",void 0);s([d({converter:D})],po.prototype,"size",void 0)});var Nd=c(()=>{});var Hd=c(()=>{ho();gs();Nd()});var Eo,_d=c(()=>{T();R();g();P();Eo=class extends b{constructor(){super(...arguments),this.optionElements=[]}menuElementsChanged(){this.updateOptions()}headerElementsChanged(){this.updateOptions()}footerElementsChanged(){this.updateOptions()}updateOptions(){this.optionElements.splice(0,this.optionElements.length),this.addSlottedListItems(this.headerElements),this.addSlottedListItems(this.menuElements),this.addSlottedListItems(this.footerElements),this.$emit("optionsupdated",{bubbles:!1})}addSlottedListItems(e){e!==void 0&&e.forEach(t=>{t.nodeType===1&&t.getAttribute("role")==="listitem"&&(t.id=t.id||Le("option-"),this.optionElements.push(t))})}};s([p],Eo.prototype,"menuElements",void 0);s([p],Eo.prototype,"headerElements",void 0);s([p],Eo.prototype,"footerElements",void 0);s([p],Eo.prototype,"suggestionsAvailableText",void 0)});var Ef,Mo,bs=c(()=>{T();g();P();Ef=k`
    <template>
        ${o=>o.value}
    </template>
`,Mo=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){super.disconnectedCallback(),this.disconnectView()}handleClick(e){return e.defaultPrevented||this.handleInvoked(),!1}handleInvoked(){this.$emit("pickeroptioninvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:Ef.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};s([d({attribute:"value"})],Mo.prototype,"value",void 0);s([p],Mo.prototype,"contentsTemplate",void 0)});var Vd=c(()=>{});var Mf,Do,vs=c(()=>{T();g();R();P();Mf=k`
    <template>
        ${o=>o.value}
    </template>
`,Do=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){this.disconnectView(),super.disconnectedCallback()}handleKeyDown(e){return e.defaultPrevented?!1:e.key===te?(this.handleInvoke(),!1):!0}handleClick(e){return e.defaultPrevented||this.handleInvoke(),!1}handleInvoke(){this.$emit("pickeriteminvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:Mf.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};s([d({attribute:"value"})],Do.prototype,"value",void 0);s([p],Do.prototype,"contentsTemplate",void 0)});var zd=c(()=>{});var ys,Ki,Ud=c(()=>{De();P();ys=class extends b{},Ki=class extends ce(ys){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Df,F,jd=c(()=>{T();g();R();_r();bs();vs();Ud();Df=k`
    <input
        slot="input-region"
        role="combobox"
        type="text"
        autocapitalize="off"
        autocomplete="off"
        haspopup="list"
        aria-label="${o=>o.label}"
        aria-labelledby="${o=>o.labelledBy}"
        placeholder="${o=>o.placeholder}"
        ${Z("inputElement")}
    ></input>
`,F=class extends Ki{constructor(){super(...arguments),this.selection="",this.filterSelected=!0,this.filterQuery=!0,this.noSuggestionsText="No suggestions available",this.suggestionsAvailableText="Suggestions available",this.loadingText="Loading suggestions",this.menuPlacement="bottom-fill",this.showLoading=!1,this.optionsList=[],this.filteredOptionsList=[],this.flyoutOpen=!1,this.menuFocusIndex=-1,this.showNoOptions=!1,this.selectedItems=[],this.inputElementView=null,this.handleTextInput=e=>{this.query=this.inputElement.value},this.handleInputClick=e=>{e.preventDefault(),this.toggleFlyout(!0)},this.setRegionProps=()=>{if(this.flyoutOpen){if(this.region===null||this.region===void 0){v.queueUpdate(this.setRegionProps);return}this.region.anchorElement=this.inputElement}},this.configLookup={top:Lr,bottom:Br,tallest:Nr,"top-fill":mc,"bottom-fill":Hr,"tallest-fill":fc}}selectionChanged(){this.$fastController.isConnected&&(this.handleSelectionChange(),this.proxy instanceof HTMLInputElement&&(this.proxy.value=this.selection,this.validate()))}optionsChanged(){this.optionsList=this.options.split(",").map(e=>e.trim()).filter(e=>e!=="")}menuPlacementChanged(){this.$fastController.isConnected&&this.updateMenuConfig()}showLoadingChanged(){this.$fastController.isConnected&&v.queueUpdate(()=>{this.setFocusedOption(0)})}listItemTemplateChanged(){this.updateListItemTemplate()}defaultListItemTemplateChanged(){this.updateListItemTemplate()}menuOptionTemplateChanged(){this.updateOptionTemplate()}defaultMenuOptionTemplateChanged(){this.updateOptionTemplate()}optionsListChanged(){this.updateFilteredOptions()}queryChanged(){this.$fastController.isConnected&&(this.inputElement.value!==this.query&&(this.inputElement.value=this.query),this.updateFilteredOptions(),this.$emit("querychange",{bubbles:!1}))}filteredOptionsListChanged(){this.$fastController.isConnected&&(this.showNoOptions=this.filteredOptionsList.length===0&&this.menuElement.querySelectorAll('[role="listitem"]').length===0,this.setFocusedOption(this.showNoOptions?-1:0))}flyoutOpenChanged(){this.flyoutOpen?(v.queueUpdate(this.setRegionProps),this.$emit("menuopening",{bubbles:!1})):this.$emit("menuclosing",{bubbles:!1})}showNoOptionsChanged(){this.$fastController.isConnected&&v.queueUpdate(()=>{this.setFocusedOption(0)})}connectedCallback(){super.connectedCallback(),this.listElement=document.createElement(this.selectedListTag),this.appendChild(this.listElement),this.itemsPlaceholderElement=document.createComment(""),this.listElement.append(this.itemsPlaceholderElement),this.inputElementView=Df.render(this,this.listElement);let e=this.menuTag.toUpperCase();this.menuElement=Array.from(this.children).find(t=>t.tagName===e),this.menuElement===void 0&&(this.menuElement=document.createElement(this.menuTag),this.appendChild(this.menuElement)),this.menuElement.id===""&&(this.menuElement.id=Le("listbox-")),this.menuId=this.menuElement.id,this.optionsPlaceholder=document.createComment(""),this.menuElement.append(this.optionsPlaceholder),this.updateMenuConfig(),v.queueUpdate(()=>this.initialize())}disconnectedCallback(){super.disconnectedCallback(),this.toggleFlyout(!1),this.inputElement.removeEventListener("input",this.handleTextInput),this.inputElement.removeEventListener("click",this.handleInputClick),this.inputElementView!==null&&(this.inputElementView.dispose(),this.inputElementView=null)}focus(){this.inputElement.focus()}initialize(){this.updateListItemTemplate(),this.updateOptionTemplate(),this.itemsRepeatBehavior=new vt(e=>e.selectedItems,e=>e.activeListItemTemplate,{positioning:!0}).createBehavior(this.itemsPlaceholderElement),this.inputElement.addEventListener("input",this.handleTextInput),this.inputElement.addEventListener("click",this.handleInputClick),this.$fastController.addBehaviors([this.itemsRepeatBehavior]),this.menuElement.suggestionsAvailableText=this.suggestionsAvailableText,this.menuElement.addEventListener("optionsupdated",this.handleMenuOptionsUpdated),this.optionsRepeatBehavior=new vt(e=>e.filteredOptionsList,e=>e.activeMenuOptionTemplate,{positioning:!0}).createBehavior(this.optionsPlaceholder),this.$fastController.addBehaviors([this.optionsRepeatBehavior]),this.handleSelectionChange()}toggleFlyout(e){if(this.flyoutOpen!==e){if(e&&document.activeElement===this.inputElement){this.flyoutOpen=e,v.queueUpdate(()=>{this.menuElement!==void 0?this.setFocusedOption(0):this.disableMenu()});return}this.flyoutOpen=!1,this.disableMenu()}}handleMenuOptionsUpdated(e){e.preventDefault(),this.flyoutOpen&&this.setFocusedOption(0)}handleKeyDown(e){if(e.defaultPrevented)return!1;switch(e.key){case Y:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.min(this.menuFocusIndex+1,this.menuElement.optionElements.length-1):0;this.setFocusedOption(t)}return!1}case X:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.max(this.menuFocusIndex-1,0):0;this.setFocusedOption(t)}return!1}case Ee:return this.toggleFlyout(!1),!1;case te:return this.menuFocusIndex!==-1&&this.menuElement.optionElements.length>this.menuFocusIndex&&this.menuElement.optionElements[this.menuFocusIndex].click(),!1;case Ce:return document.activeElement!==this.inputElement?(this.incrementFocusedItem(1),!1):!0;case xe:return this.inputElement.selectionStart===0?(this.incrementFocusedItem(-1),!1):!0;case Ql:case Xl:{if(document.activeElement===null)return!0;if(document.activeElement===this.inputElement)return this.inputElement.selectionStart===0?(this.selection=this.selectedItems.slice(0,this.selectedItems.length-1).toString(),this.toggleFlyout(!1),!1):!0;let t=Array.from(this.listElement.children),i=t.indexOf(document.activeElement);return i>-1?(this.selection=this.selectedItems.splice(i,1).toString(),v.queueUpdate(()=>{t[Math.min(t.length,i)].focus()}),!1):!0}}return this.toggleFlyout(!0),!0}handleFocusIn(e){return!1}handleFocusOut(e){return(this.menuElement===void 0||!this.menuElement.contains(e.relatedTarget))&&this.toggleFlyout(!1),!1}handleSelectionChange(){this.selectedItems.toString()!==this.selection&&(this.selectedItems=this.selection===""?[]:this.selection.split(","),this.updateFilteredOptions(),v.queueUpdate(()=>{this.checkMaxItems()}),this.$emit("selectionchange",{bubbles:!1}))}handleRegionLoaded(e){v.queueUpdate(()=>{this.setFocusedOption(0),this.$emit("menuloaded",{bubbles:!1})})}checkMaxItems(){if(this.inputElement!==void 0)if(this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected){if(document.activeElement===this.inputElement){let e=Array.from(this.listElement.querySelectorAll("[role='listitem']"));e[e.length-1].focus()}this.inputElement.hidden=!0}else this.inputElement.hidden=!1}handleItemInvoke(e){if(e.defaultPrevented)return!1;if(e.target instanceof Do){let i=Array.from(this.listElement.querySelectorAll("[role='listitem']")).indexOf(e.target);if(i!==-1){let n=this.selectedItems.slice();n.splice(i,1),this.selection=n.toString(),v.queueUpdate(()=>this.incrementFocusedItem(0))}return!1}return!0}handleOptionInvoke(e){return e.defaultPrevented?!1:e.target instanceof Mo?(e.target.value!==void 0&&(this.selection=`${this.selection}${this.selection===""?"":","}${e.target.value}`),this.inputElement.value="",this.query="",this.inputElement.focus(),this.toggleFlyout(!1),!1):!0}incrementFocusedItem(e){if(this.selectedItems.length===0){this.inputElement.focus();return}let t=Array.from(this.listElement.querySelectorAll("[role='listitem']"));if(document.activeElement!==null){let i=t.indexOf(document.activeElement);i===-1&&(i=t.length);let n=Math.min(t.length,Math.max(0,i+e));n===t.length?this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected?t[n-1].focus():this.inputElement.focus():t[n].focus()}}disableMenu(){var e,t,i;this.menuFocusIndex=-1,this.menuFocusOptionId=void 0,(e=this.inputElement)===null||e===void 0||e.removeAttribute("aria-activedescendant"),(t=this.inputElement)===null||t===void 0||t.removeAttribute("aria-owns"),(i=this.inputElement)===null||i===void 0||i.removeAttribute("aria-expanded")}setFocusedOption(e){if(!this.flyoutOpen||e===-1||this.showNoOptions||this.showLoading){this.disableMenu();return}if(this.menuElement.optionElements.length===0)return;this.menuElement.optionElements.forEach(i=>{i.setAttribute("aria-selected","false")}),this.menuFocusIndex=e,this.menuFocusIndex>this.menuElement.optionElements.length-1&&(this.menuFocusIndex=this.menuElement.optionElements.length-1),this.menuFocusOptionId=this.menuElement.optionElements[this.menuFocusIndex].id,this.inputElement.setAttribute("aria-owns",this.menuId),this.inputElement.setAttribute("aria-expanded","true"),this.inputElement.setAttribute("aria-activedescendant",this.menuFocusOptionId);let t=this.menuElement.optionElements[this.menuFocusIndex];t.setAttribute("aria-selected","true"),this.menuElement.scrollTo(0,t.offsetTop)}updateListItemTemplate(){var e;this.activeListItemTemplate=(e=this.listItemTemplate)!==null&&e!==void 0?e:this.defaultListItemTemplate}updateOptionTemplate(){var e;this.activeMenuOptionTemplate=(e=this.menuOptionTemplate)!==null&&e!==void 0?e:this.defaultMenuOptionTemplate}updateFilteredOptions(){this.filteredOptionsList=this.optionsList.slice(0),this.filterSelected&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>this.selectedItems.indexOf(e)===-1)),this.filterQuery&&this.query!==""&&this.query!==void 0&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>e.indexOf(this.query)!==-1))}updateMenuConfig(){let e=this.configLookup[this.menuPlacement];e===null&&(e=Hr),this.menuConfig=Object.assign(Object.assign({},e),{autoUpdateMode:"auto",fixedPlacement:!0,horizontalViewportLock:!1,verticalViewportLock:!1})}};s([d({attribute:"selection"})],F.prototype,"selection",void 0);s([d({attribute:"options"})],F.prototype,"options",void 0);s([d({attribute:"filter-selected",mode:"boolean"})],F.prototype,"filterSelected",void 0);s([d({attribute:"filter-query",mode:"boolean"})],F.prototype,"filterQuery",void 0);s([d({attribute:"max-selected"})],F.prototype,"maxSelected",void 0);s([d({attribute:"no-suggestions-text"})],F.prototype,"noSuggestionsText",void 0);s([d({attribute:"suggestions-available-text"})],F.prototype,"suggestionsAvailableText",void 0);s([d({attribute:"loading-text"})],F.prototype,"loadingText",void 0);s([d({attribute:"label"})],F.prototype,"label",void 0);s([d({attribute:"labelledby"})],F.prototype,"labelledBy",void 0);s([d({attribute:"placeholder"})],F.prototype,"placeholder",void 0);s([d({attribute:"menu-placement"})],F.prototype,"menuPlacement",void 0);s([p],F.prototype,"showLoading",void 0);s([p],F.prototype,"listItemTemplate",void 0);s([p],F.prototype,"defaultListItemTemplate",void 0);s([p],F.prototype,"activeListItemTemplate",void 0);s([p],F.prototype,"menuOptionTemplate",void 0);s([p],F.prototype,"defaultMenuOptionTemplate",void 0);s([p],F.prototype,"activeMenuOptionTemplate",void 0);s([p],F.prototype,"listItemContentsTemplate",void 0);s([p],F.prototype,"menuOptionContentsTemplate",void 0);s([p],F.prototype,"optionsList",void 0);s([p],F.prototype,"query",void 0);s([p],F.prototype,"filteredOptionsList",void 0);s([p],F.prototype,"flyoutOpen",void 0);s([p],F.prototype,"menuId",void 0);s([p],F.prototype,"selectedListTag",void 0);s([p],F.prototype,"menuTag",void 0);s([p],F.prototype,"menuFocusIndex",void 0);s([p],F.prototype,"menuFocusOptionId",void 0);s([p],F.prototype,"showNoOptions",void 0);s([p],F.prototype,"menuConfig",void 0);s([p],F.prototype,"selectedItems",void 0)});var Gd=c(()=>{});var qd=c(()=>{});var Wd=c(()=>{});var Yd=c(()=>{});var Xd=c(()=>{zd();jd();Gd();_d();qd();bs();Wd();Vd();Yd();vs()});var Re,xs,Qd=c(()=>{Re={menuitem:"menuitem",menuitemcheckbox:"menuitemcheckbox",menuitemradio:"menuitemradio"},xs={[Re.menuitem]:"menuitem",[Re.menuitemcheckbox]:"menuitemcheckbox",[Re.menuitemradio]:"menuitemradio"}});var Ae,Zd=c(()=>{T();g();R();P();fe();Ut();ue();Qd();Ae=class extends b{constructor(){super(...arguments),this.role=Re.menuitem,this.hasSubmenu=!1,this.currentDirection=O.ltr,this.focusSubmenuOnLoad=!1,this.handleMenuItemKeyDown=e=>{if(e.defaultPrevented)return!1;switch(e.key){case te:case Me:return this.invoke(),!1;case Ce:return this.expandAndFocus(),!1;case xe:if(this.expanded)return this.expanded=!1,this.focus(),!1}return!0},this.handleMenuItemClick=e=>(e.defaultPrevented||this.disabled||this.invoke(),!1),this.submenuLoaded=()=>{this.focusSubmenuOnLoad&&(this.focusSubmenuOnLoad=!1,this.hasSubmenu&&(this.submenu.focus(),this.setAttribute("tabindex","-1")))},this.handleMouseOver=e=>(this.disabled||!this.hasSubmenu||this.expanded||(this.expanded=!0),!1),this.handleMouseOut=e=>(!this.expanded||this.contains(document.activeElement)||(this.expanded=!1),!1),this.expandAndFocus=()=>{this.hasSubmenu&&(this.focusSubmenuOnLoad=!0,this.expanded=!0)},this.invoke=()=>{if(!this.disabled)switch(this.role){case Re.menuitemcheckbox:this.checked=!this.checked;break;case Re.menuitem:this.updateSubmenu(),this.hasSubmenu?this.expandAndFocus():this.$emit("change");break;case Re.menuitemradio:this.checked||(this.checked=!0);break}},this.updateSubmenu=()=>{this.submenu=this.domChildren().find(e=>e.getAttribute("role")==="menu"),this.hasSubmenu=this.submenu!==void 0}}expandedChanged(e){if(this.$fastController.isConnected){if(this.submenu===void 0)return;this.expanded===!1?this.submenu.collapseExpandedItem():this.currentDirection=Be(this),this.$emit("expanded-change",this,{bubbles:!1})}}checkedChanged(e,t){this.$fastController.isConnected&&this.$emit("change")}connectedCallback(){super.connectedCallback(),v.queueUpdate(()=>{this.updateSubmenu()}),this.startColumnCount||(this.startColumnCount=1),this.observer=new MutationObserver(this.updateSubmenu)}disconnectedCallback(){super.disconnectedCallback(),this.submenu=void 0,this.observer!==void 0&&(this.observer.disconnect(),this.observer=void 0)}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}};s([d({mode:"boolean"})],Ae.prototype,"disabled",void 0);s([d({mode:"boolean"})],Ae.prototype,"expanded",void 0);s([p],Ae.prototype,"startColumnCount",void 0);s([d],Ae.prototype,"role",void 0);s([d({mode:"boolean"})],Ae.prototype,"checked",void 0);s([p],Ae.prototype,"submenuRegion",void 0);s([p],Ae.prototype,"hasSubmenu",void 0);s([p],Ae.prototype,"currentDirection",void 0);s([p],Ae.prototype,"submenu",void 0);M(Ae,_)});var Jd=c(()=>{});var Cs=c(()=>{Jd();Zd()});var Kd=c(()=>{});var en,eh=c(()=>{T();g();R();Cs();P();en=class o extends b{constructor(){super(...arguments),this.expandedItem=null,this.focusIndex=-1,this.isNestedMenu=()=>this.parentElement!==null&&dt(this.parentElement)&&this.parentElement.getAttribute("role")==="menuitem",this.handleFocusOut=e=>{if(!this.contains(e.relatedTarget)&&this.menuItems!==void 0){this.collapseExpandedItem();let t=this.menuItems.findIndex(this.isFocusableElement);this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.menuItems[t].setAttribute("tabindex","0"),this.focusIndex=t}},this.handleItemFocus=e=>{let t=e.target;this.menuItems!==void 0&&t!==this.menuItems[this.focusIndex]&&(this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.handleExpandedChanged=e=>{if(e.defaultPrevented||e.target===null||this.menuItems===void 0||this.menuItems.indexOf(e.target)<0)return;e.preventDefault();let t=e.target;if(this.expandedItem!==null&&t===this.expandedItem&&t.expanded===!1){this.expandedItem=null;return}t.expanded&&(this.expandedItem!==null&&this.expandedItem!==t&&(this.expandedItem.expanded=!1),this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.expandedItem=t,this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.removeItemListeners=()=>{this.menuItems!==void 0&&this.menuItems.forEach(e=>{e.removeEventListener("expanded-change",this.handleExpandedChanged),e.removeEventListener("focus",this.handleItemFocus)})},this.setItems=()=>{let e=this.domChildren();this.removeItemListeners(),this.menuItems=e;let t=this.menuItems.filter(this.isMenuItemElement);t.length&&(this.focusIndex=0);function i(r){let a=r.getAttribute("role"),l=r.querySelector("[slot=start]");return a!==Re.menuitem&&l===null||a===Re.menuitem&&l!==null?1:a!==Re.menuitem&&l!==null?2:0}let n=t.reduce((r,a)=>{let l=i(a);return r>l?r:l},0);t.forEach((r,a)=>{r.setAttribute("tabindex",a===0?"0":"-1"),r.addEventListener("expanded-change",this.handleExpandedChanged),r.addEventListener("focus",this.handleItemFocus),(r instanceof Ae||"startColumnCount"in r)&&(r.startColumnCount=n)})},this.changeHandler=e=>{if(this.menuItems===void 0)return;let t=e.target,i=this.menuItems.indexOf(t);if(i!==-1&&t.role==="menuitemradio"&&t.checked===!0){for(let r=i-1;r>=0;--r){let a=this.menuItems[r],l=a.getAttribute("role");if(l===Re.menuitemradio&&(a.checked=!1),l==="separator")break}let n=this.menuItems.length-1;for(let r=i+1;r<=n;++r){let a=this.menuItems[r],l=a.getAttribute("role");if(l===Re.menuitemradio&&(a.checked=!1),l==="separator")break}}},this.isMenuItemElement=e=>dt(e)&&o.focusableElementRoles.hasOwnProperty(e.getAttribute("role")),this.isFocusableElement=e=>this.isMenuItemElement(e)}itemsChanged(e,t){this.$fastController.isConnected&&this.menuItems!==void 0&&this.setItems()}connectedCallback(){super.connectedCallback(),v.queueUpdate(()=>{this.setItems()}),this.addEventListener("change",this.changeHandler)}disconnectedCallback(){super.disconnectedCallback(),this.removeItemListeners(),this.menuItems=void 0,this.removeEventListener("change",this.changeHandler)}focus(){this.setFocus(0,1)}collapseExpandedItem(){this.expandedItem!==null&&(this.expandedItem.expanded=!1,this.expandedItem=null)}handleMenuKeyDown(e){if(!(e.defaultPrevented||this.menuItems===void 0))switch(e.key){case Y:this.setFocus(this.focusIndex+1,1);return;case X:this.setFocus(this.focusIndex-1,-1);return;case ae:this.setFocus(this.menuItems.length-1,-1);return;case se:this.setFocus(0,1);return;default:return!0}}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}setFocus(e,t){if(this.menuItems!==void 0)for(;e>=0&&e<this.menuItems.length;){let i=this.menuItems[e];if(this.isFocusableElement(i)){this.focusIndex>-1&&this.menuItems.length>=this.focusIndex-1&&this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=e,i.setAttribute("tabindex","0"),i.focus();break}e+=t}}};en.focusableElementRoles=xs;s([p],en.prototype,"items",void 0)});var th=c(()=>{Kd();eh()});var oh=c(()=>{});var ws,tn,ih=c(()=>{De();P();ws=class extends b{},tn=class extends ce(ws){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var on,nh=c(()=>{on={email:"email",password:"password",tel:"tel",text:"text",url:"url"}});var ke,Wt,nn=c(()=>{T();g();ro();ue();ih();nh();ke=class extends tn{constructor(){super(...arguments),this.type=on.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&v.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};s([d({attribute:"readonly",mode:"boolean"})],ke.prototype,"readOnly",void 0);s([d({mode:"boolean"})],ke.prototype,"autofocus",void 0);s([d],ke.prototype,"placeholder",void 0);s([d],ke.prototype,"type",void 0);s([d],ke.prototype,"list",void 0);s([d({converter:D})],ke.prototype,"maxlength",void 0);s([d({converter:D})],ke.prototype,"minlength",void 0);s([d],ke.prototype,"pattern",void 0);s([d({converter:D})],ke.prototype,"size",void 0);s([d({mode:"boolean"})],ke.prototype,"spellcheck",void 0);s([p],ke.prototype,"defaultSlottedNodes",void 0);Wt=class{};M(Wt,A);M(ke,_,Wt)});var ks,rn,rh=c(()=>{De();P();ks=class extends b{},rn=class extends ce(ks){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Ie,sh=c(()=>{T();g();R();fe();ue();nn();rh();Ie=class extends rn{constructor(){super(...arguments),this.hideStep=!1,this.step=1,this.isUserInput=!1}maxChanged(e,t){var i;this.max=Math.max(t,(i=this.min)!==null&&i!==void 0?i:t);let n=Math.min(this.min,this.max);this.min!==void 0&&this.min!==n&&(this.min=n),this.value=this.getValidValue(this.value)}minChanged(e,t){var i;this.min=Math.min(t,(i=this.max)!==null&&i!==void 0?i:t);let n=Math.max(this.min,this.max);this.max!==void 0&&this.max!==n&&(this.max=n),this.value=this.getValidValue(this.value)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){this.value=this.getValidValue(t),t===this.value&&(this.control&&!this.isUserInput&&(this.control.value=this.value),super.valueChanged(e,this.value),e!==void 0&&!this.isUserInput&&(this.$emit("input"),this.$emit("change")),this.isUserInput=!1)}validate(){super.validate(this.control)}getValidValue(e){var t,i;let n=parseFloat(parseFloat(e).toPrecision(12));return isNaN(n)?n="":(n=Math.min(n,(t=this.max)!==null&&t!==void 0?t:n),n=Math.max(n,(i=this.min)!==null&&i!==void 0?i:n).toString()),n}stepUp(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:this.step:e+this.step;this.value=t.toString()}stepDown(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:0-this.step:e-this.step;this.value=t.toString()}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","number"),this.validate(),this.control.value=this.value,this.autofocus&&v.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.control.value=this.control.value.replace(/[^0-9\-+e.]/g,""),this.isUserInput=!0,this.value=this.control.value}handleChange(){this.$emit("change")}handleKeyDown(e){switch(e.key){case X:return this.stepUp(),!1;case Y:return this.stepDown(),!1}return!0}handleBlur(){this.control.value=this.value}};s([d({attribute:"readonly",mode:"boolean"})],Ie.prototype,"readOnly",void 0);s([d({mode:"boolean"})],Ie.prototype,"autofocus",void 0);s([d({attribute:"hide-step",mode:"boolean"})],Ie.prototype,"hideStep",void 0);s([d],Ie.prototype,"placeholder",void 0);s([d],Ie.prototype,"list",void 0);s([d({converter:D})],Ie.prototype,"maxlength",void 0);s([d({converter:D})],Ie.prototype,"minlength",void 0);s([d({converter:D})],Ie.prototype,"size",void 0);s([d({converter:D})],Ie.prototype,"step",void 0);s([d({converter:D})],Ie.prototype,"max",void 0);s([d({converter:D})],Ie.prototype,"min",void 0);s([p],Ie.prototype,"defaultSlottedNodes",void 0);M(Ie,_,Wt)});var ah=c(()=>{oh();sh()});var lh,ch,dh=c(()=>{g();lh=44,ch=(o,e)=>k`
    <template
        role="progressbar"
        aria-valuenow="${t=>t.value}"
        aria-valuemin="${t=>t.min}"
        aria-valuemax="${t=>t.max}"
        class="${t=>t.paused?"paused":""}"
    >
        ${to(t=>typeof t.value=="number",k`
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
                        style="stroke-dasharray: ${t=>lh*t.percentComplete/100}px ${lh}px"
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
`});var hh=c(()=>{dh()});var Tt,uh=c(()=>{T();g();P();Tt=class extends b{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){let e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,i=typeof this.value=="number"?this.value:0,n=t-e;this.percentComplete=n===0?0:Math.fround((i-e)/n*100)}};s([d({converter:D})],Tt.prototype,"value",void 0);s([d({converter:D})],Tt.prototype,"min",void 0);s([d({converter:D})],Tt.prototype,"max",void 0);s([d({mode:"boolean"})],Tt.prototype,"paused",void 0);s([p],Tt.prototype,"percentComplete",void 0)});var ph=c(()=>{});var mh=c(()=>{uh();ph()});var fh,gh=c(()=>{g();R();fh=(o,e)=>k`
    <template
        role="radiogroup"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @click="${(t,i)=>t.clickHandler(i.event)}"
        @keydown="${(t,i)=>t.keydownHandler(i.event)}"
        @focusout="${(t,i)=>t.focusOutHandler(i.event)}"
    >
        <slot name="label"></slot>
        <div
            class="positioning-region ${t=>t.orientation===U.horizontal?"horizontal":"vertical"}"
            part="positioning-region"
        >
            <slot
                ${K({property:"slottedRadioButtons",filter:oo("[role=radio]")})}
            ></slot>
        </div>
    </template>
`});var it,bh=c(()=>{T();g();R();Ut();P();it=class extends b{constructor(){super(...arguments),this.orientation=U.horizontal,this.radioChangeHandler=e=>{let t=e.target;t.checked&&(this.slottedRadioButtons.forEach(i=>{i!==t&&(i.checked=!1,this.isInsideFoundationToolbar||i.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{let i=e[t];this.isInsideToolbar||(i.setAttribute("tabindex","0"),i.readOnly?this.slottedRadioButtons.forEach(n=>{n!==i&&n.setAttribute("tabindex","-1")}):(i.checked=!0,this.selectedRadio=i)),this.focusedRadio=i,i.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{let t=this.slottedRadioButtons,i=e.target,n=i!==null?t.indexOf(i):0,r=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(r===0&&n===r||r===t.length-1&&r===n)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.selectedRadio&&a.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.focusedRadio&&a.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{let t=e.target;if(t){let i=this.slottedRadioButtons;t.checked||i.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,i)=>e===t.length&&this.isInsideToolbar&&i===Ce,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===xe,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(i,t,e.key)){this.moveRightOffGroup();return}else i===t.length&&(i=0);for(;i<t.length&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;if(i+1>=t.length){if(this.isInsideToolbar)break;i=0}else i+=1}else{this.moveToRadioByIndex(t,i);break}},this.moveLeft=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,i=i<0?t.length-1:i,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;i>=0&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;i-1<0?i=t.length-1:i-=1}else{this.moveToRadioByIndex(t,i);break}},this.keydownHandler=e=>{let t=e.key;if(t in Vt&&this.isInsideFoundationToolbar)return!0;switch(t){case te:{this.checkFocusedRadio();break}case Ce:case Y:{this.direction===O.ltr?this.moveRight(e):this.moveLeft(e);break}case xe:case X:{this.direction===O.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.value===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=Be(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){let e=this.slottedRadioButtons.filter(n=>n.hasAttribute("checked")),t=e?e.length:0;if(t>1){let n=e[t-1];n.checked=!0}let i=!1;if(this.slottedRadioButtons.forEach(n=>{this.name!==void 0&&n.setAttribute("name",this.name),this.disabled&&(n.disabled=!0),this.readOnly&&(n.readOnly=!0),this.value&&this.value===n.value?(this.selectedRadio=n,this.focusedRadio=n,n.checked=!0,n.setAttribute("tabindex","0"),i=!0):(this.isInsideFoundationToolbar||n.setAttribute("tabindex","-1"),n.checked=!1),n.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){let n=this.slottedRadioButtons.filter(a=>a.hasAttribute("checked")),r=n!==null?n.length:0;if(r>0&&!i){let a=n[r-1];a.checked=!0,this.focusedRadio=a,a.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}};s([d({attribute:"readonly",mode:"boolean"})],it.prototype,"readOnly",void 0);s([d({attribute:"disabled",mode:"boolean"})],it.prototype,"disabled",void 0);s([d],it.prototype,"name",void 0);s([d],it.prototype,"value",void 0);s([d],it.prototype,"orientation",void 0);s([p],it.prototype,"childItems",void 0);s([p],it.prototype,"slottedRadioButtons",void 0)});var vh=c(()=>{gh();bh()});var yh,xh=c(()=>{g();yh=(o,e)=>k`
    <template
        role="radio"
        class="${t=>t.checked?"checked":""} ${t=>t.readOnly?"readonly":""}"
        aria-checked="${t=>t.checked}"
        aria-required="${t=>t.required}"
        aria-disabled="${t=>t.disabled}"
        aria-readonly="${t=>t.readOnly}"
        @keypress="${(t,i)=>t.keypressHandler(i.event)}"
        @click="${(t,i)=>t.clickHandler(i.event)}"
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
            <slot ${K("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var $s,sn,Ch=c(()=>{De();P();$s=class extends b{},sn=class extends $o($s){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var mo,wh=c(()=>{T();g();R();Ch();mo=class extends sn{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(e.key===Me){!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}};s([d({attribute:"readonly",mode:"boolean"})],mo.prototype,"readOnly",void 0);s([p],mo.prototype,"name",void 0);s([p],mo.prototype,"defaultSlottedNodes",void 0)});var kh=c(()=>{xh();wh()});var It,$h=c(()=>{T();g();P();It=class extends b{constructor(){super(...arguments),this.framesPerSecond=60,this.updatingItems=!1,this.speed=600,this.easing="ease-in-out",this.flippersHiddenFromAT=!1,this.scrolling=!1,this.resizeDetector=null}get frameTime(){return 1e3/this.framesPerSecond}scrollingChanged(e,t){if(this.scrollContainer){let i=this.scrolling==!0?"scrollstart":"scrollend";this.$emit(i,this.scrollContainer.scrollLeft)}}get isRtl(){return this.scrollItems.length>1&&this.scrollItems[0].offsetLeft>this.scrollItems[1].offsetLeft}connectedCallback(){super.connectedCallback(),this.initializeResizeDetector()}disconnectedCallback(){this.disconnectResizeDetector(),super.disconnectedCallback()}scrollItemsChanged(e,t){t&&!this.updatingItems&&v.queueUpdate(()=>this.setStops())}disconnectResizeDetector(){this.resizeDetector&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.resized.bind(this)),this.resizeDetector.observe(this)}updateScrollStops(){this.updatingItems=!0;let e=this.scrollItems.reduce((t,i)=>i instanceof HTMLSlotElement?t.concat(i.assignedElements()):(t.push(i),t),[]);this.scrollItems=e,this.updatingItems=!1}setStops(){this.updateScrollStops();let{scrollContainer:e}=this,{scrollLeft:t}=e,{width:i,left:n}=e.getBoundingClientRect();this.width=i;let r=0,a=this.scrollItems.map((l,h)=>{let{left:u,width:m}=l.getBoundingClientRect(),f=Math.round(u+t-n),y=Math.round(f+m);return this.isRtl?-y:(r=y,h===0?0:f)}).concat(r);a=this.fixScrollMisalign(a),a.sort((l,h)=>Math.abs(l)-Math.abs(h)),this.scrollStops=a,this.setFlippers()}validateStops(e=!0){let t=()=>!!this.scrollStops.find(i=>i>0);return!t()&&e&&this.setStops(),t()}fixScrollMisalign(e){if(this.isRtl&&e.some(t=>t>0)){e.sort((i,n)=>n-i);let t=e[0];e=e.map(i=>i-t)}return e}setFlippers(){var e,t;let i=this.scrollContainer.scrollLeft;if((e=this.previousFlipperContainer)===null||e===void 0||e.classList.toggle("disabled",i===0),this.scrollStops){let n=Math.abs(this.scrollStops[this.scrollStops.length-1]);(t=this.nextFlipperContainer)===null||t===void 0||t.classList.toggle("disabled",this.validateStops(!1)&&Math.abs(i)+this.width>=n)}}scrollInView(e,t=0,i){var n;if(typeof e!="number"&&e&&(e=this.scrollItems.findIndex(r=>r===e||r.contains(e))),e!==void 0){i=i??t;let{scrollContainer:r,scrollStops:a,scrollItems:l}=this,{scrollLeft:h}=this.scrollContainer,{width:u}=r.getBoundingClientRect(),m=a[e],{width:f}=l[e].getBoundingClientRect(),y=m+f,$=h+t>m;if($||h+u-i<y){let N=(n=[...a].sort((Q,_e)=>$?_e-Q:Q-_e).find(Q=>$?Q+t<m:Q+u-(i??0)>y))!==null&&n!==void 0?n:0;this.scrollToPosition(N)}}}keyupHandler(e){switch(e.key){case"ArrowLeft":this.scrollToPrevious();break;case"ArrowRight":this.scrollToNext();break}}scrollToPrevious(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex((r,a)=>r>=e&&(this.isRtl||a===this.scrollStops.length-1||this.scrollStops[a+1]>e)),i=Math.abs(this.scrollStops[t+1]),n=this.scrollStops.findIndex(r=>Math.abs(r)+this.width>i);(n>=t||n===-1)&&(n=t>0?t-1:0),this.scrollToPosition(this.scrollStops[n],e)}scrollToNext(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex(r=>Math.abs(r)>=Math.abs(e)),i=this.scrollStops.findIndex(r=>Math.abs(e)+this.width<=Math.abs(r)),n=t;i>t+2?n=i-2:t<this.scrollStops.length-2&&(n=t+1),this.scrollToPosition(this.scrollStops[n],e)}scrollToPosition(e,t=this.scrollContainer.scrollLeft){var i;if(this.scrolling)return;this.scrolling=!0;let n=(i=this.duration)!==null&&i!==void 0?i:`${Math.abs(e-t)/this.speed}s`;this.content.style.setProperty("transition-duration",n);let r=parseFloat(getComputedStyle(this.content).getPropertyValue("transition-duration")),a=u=>{u&&u.target!==u.currentTarget||(this.content.style.setProperty("transition-duration","0s"),this.content.style.removeProperty("transform"),this.scrollContainer.style.setProperty("scroll-behavior","auto"),this.scrollContainer.scrollLeft=e,this.setFlippers(),this.content.removeEventListener("transitionend",a),this.scrolling=!1)};if(r===0){a();return}this.content.addEventListener("transitionend",a);let l=this.scrollContainer.scrollWidth-this.scrollContainer.clientWidth,h=this.scrollContainer.scrollLeft-Math.min(e,l);this.isRtl&&(h=this.scrollContainer.scrollLeft+Math.min(Math.abs(e),l)),this.content.style.setProperty("transition-property","transform"),this.content.style.setProperty("transition-timing-function",this.easing),this.content.style.setProperty("transform",`translateX(${h}px)`)}resized(){this.resizeTimeout&&(this.resizeTimeout=clearTimeout(this.resizeTimeout)),this.resizeTimeout=setTimeout(()=>{this.width=this.scrollContainer.offsetWidth,this.setFlippers()},this.frameTime)}scrolled(){this.scrollTimeout&&(this.scrollTimeout=clearTimeout(this.scrollTimeout)),this.scrollTimeout=setTimeout(()=>{this.setFlippers()},this.frameTime)}};s([d({converter:D})],It.prototype,"speed",void 0);s([d],It.prototype,"duration",void 0);s([d],It.prototype,"easing",void 0);s([d({attribute:"flippers-hidden-from-at",converter:Kt})],It.prototype,"flippersHiddenFromAT",void 0);s([p],It.prototype,"scrolling",void 0);s([p],It.prototype,"scrollItems",void 0);s([d({attribute:"view"})],It.prototype,"view",void 0)});var Th=c(()=>{});var Ih=c(()=>{$h();Th()});function Sh(o,e,t){return o.nodeType!==Node.TEXT_NODE?!0:typeof o.nodeValue=="string"&&!!o.nodeValue.trim().length}var Ts=c(()=>{});var Ph=c(()=>{});var Is,an,Eh=c(()=>{De();P();Is=class extends b{},an=class extends ce(Is){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var He,ln,Mh=c(()=>{T();g();ro();ue();Eh();He=class extends an{readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.validate(),this.autofocus&&v.queueUpdate(()=>{this.focus()})}validate(){super.validate(this.control)}handleTextInput(){this.value=this.control.value}handleClearInput(){this.value="",this.control.focus(),this.handleChange()}handleChange(){this.$emit("change")}};s([d({attribute:"readonly",mode:"boolean"})],He.prototype,"readOnly",void 0);s([d({mode:"boolean"})],He.prototype,"autofocus",void 0);s([d],He.prototype,"placeholder",void 0);s([d],He.prototype,"list",void 0);s([d({converter:D})],He.prototype,"maxlength",void 0);s([d({converter:D})],He.prototype,"minlength",void 0);s([d],He.prototype,"pattern",void 0);s([d({converter:D})],He.prototype,"size",void 0);s([d({mode:"boolean"})],He.prototype,"spellcheck",void 0);s([p],He.prototype,"defaultSlottedNodes",void 0);ln=class{};M(ln,A);M(He,_,ln)});var Dh=c(()=>{Ph();Mh()});var Ss,cn,Oh=c(()=>{gs();De();Ss=class extends po{},cn=class extends ce(Ss){constructor(){super(...arguments),this.proxy=document.createElement("select")}}});var nt,ri,Rh=c(()=>{T();g();R();ho();fe();ue();Oh();Gi();nt=class extends cn{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.listboxId=Le("listbox-"),this.maxHeight=0}openChanged(e,t){if(this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,v.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return w.track(this,"value"),this._value}set value(e){var t,i,n,r,a,l,h;let u=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){let m=this._options.findIndex($=>$.value===e),f=(n=(i=this._options[this.selectedIndex])===null||i===void 0?void 0:i.value)!==null&&n!==void 0?n:null,y=(a=(r=this._options[m])===null||r===void 0?void 0:r.value)!==null&&a!==void 0?a:null;(m===-1||f!==y)&&(e="",this.selectedIndex=m),e=(h=(l=this.firstSelectedOption)===null||l===void 0?void 0:l.value)!==null&&h!==void 0?h:e}u!==e&&(this._value=e,super.valueChanged(u,e),w.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,i;this.$fastController.isConnected&&(this.value=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&i!==void 0?i:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?ht.above:ht.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===ht.above?~~e.top:~~i}get displayValue(){var e,t;return w.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){let t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;let i=e.relatedTarget;if(this.isSameNode(i)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(i)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(i=>{w.getNotifier(i).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(i=>{w.getNotifier(i).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var i;super.selectedOptionsChanged(e,t),(i=this.options)===null||i===void 0||i.forEach((n,r)=>{var a;let l=(a=this.proxy)===null||a===void 0?void 0:a.options.item(r);l&&(l.selected=n.selected)})}setDefaultSelectedOption(){var e;let t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(pe.slottedOptionFilter),i=t?.findIndex(n=>n.hasAttribute("selected")||n.selected||n.value===this.value);if(i!==-1){this.selectedIndex=i;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{let t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);let t=e.key||e.key.charCodeAt(0);switch(t){case Me:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case se:case ae:{e.preventDefault();break}case te:{e.preventDefault(),this.open=!this.open;break}case Ee:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case _t:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t===Y||t===X)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&w.notify(this,"displayValue")}};s([d({attribute:"open",mode:"boolean"})],nt.prototype,"open",void 0);s([_a],nt.prototype,"collapsible",null);s([p],nt.prototype,"control",void 0);s([d({attribute:"position"})],nt.prototype,"positionAttribute",void 0);s([p],nt.prototype,"position",void 0);s([p],nt.prototype,"maxHeight",void 0);ri=class{};s([p],ri.prototype,"ariaControls",void 0);M(ri,Xe);M(nt,_,ri)});var Ah,Fh=c(()=>{g();ho();fe();Ah=(o,e)=>k`
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
        @click="${(t,i)=>t.clickHandler(i.event)}"
        @focusin="${(t,i)=>t.focusinHandler(i.event)}"
        @focusout="${(t,i)=>t.focusoutHandler(i.event)}"
        @keydown="${(t,i)=>t.keydownHandler(i.event)}"
        @mousedown="${(t,i)=>t.mousedownHandler(i.event)}"
    >
        ${to(t=>t.collapsible,k`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${Z("control")}
                >
                    ${qe(o,e)}
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
                    ${Ge(o,e)}
                </div>
            `)}
        <div
            class="listbox"
            id="${t=>t.listboxId}"
            part="listbox"
            role="listbox"
            ?disabled="${t=>t.disabled}"
            ?hidden="${t=>t.collapsible?!t.open:!1}"
            ${Z("listbox")}
        >
            <slot
                ${K({filter:pe.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`});var Lh=c(()=>{Rh();Gi();Fh()});var Bh=c(()=>{});var Oo,Nh=c(()=>{T();g();P();Oo=class extends b{constructor(){super(...arguments),this.shape="rect"}};s([d],Oo.prototype,"fill",void 0);s([d],Oo.prototype,"shape",void 0);s([d],Oo.prototype,"pattern",void 0);s([d({mode:"boolean"})],Oo.prototype,"shimmer",void 0)});var Hh=c(()=>{Bh();Nh()});var _h=c(()=>{});function si(o,e,t,i){let n=zt(0,1,(o-e)/(t-e));return i===O.rtl&&(n=1-n),n}var Ps=c(()=>{R()});var dn,pt,Vh=c(()=>{T();g();R();Ps();P();dn={min:0,max:0,direction:O.ltr,orientation:U.horizontal,disabled:!1},pt=class extends b{constructor(){super(...arguments),this.hideMark=!1,this.sliderDirection=O.ltr,this.getSliderConfiguration=()=>{if(!this.isSliderConfig(this.parentNode))this.sliderDirection=dn.direction||O.ltr,this.sliderOrientation=dn.orientation||U.horizontal,this.sliderMaxPosition=dn.max,this.sliderMinPosition=dn.min;else{let e=this.parentNode,{min:t,max:i,direction:n,orientation:r,disabled:a}=e;a!==void 0&&(this.disabled=a),this.sliderDirection=n||O.ltr,this.sliderOrientation=r||U.horizontal,this.sliderMaxPosition=i,this.sliderMinPosition=t}},this.positionAsStyle=()=>{let e=this.sliderDirection?this.sliderDirection:O.ltr,t=si(Number(this.position),Number(this.sliderMinPosition),Number(this.sliderMaxPosition)),i=Math.round((1-t)*100),n=Math.round(t*100);return Number.isNaN(n)&&Number.isNaN(i)&&(i=50,n=50),this.sliderOrientation===U.horizontal?e===O.rtl?`right: ${n}%; left: ${i}%;`:`left: ${n}%; right: ${i}%;`:`top: ${n}%; bottom: ${i}%;`}}positionChanged(){this.positionStyle=this.positionAsStyle()}sliderOrientationChanged(){}connectedCallback(){super.connectedCallback(),this.getSliderConfiguration(),this.positionStyle=this.positionAsStyle(),this.notifier=w.getNotifier(this.parentNode),this.notifier.subscribe(this,"orientation"),this.notifier.subscribe(this,"direction"),this.notifier.subscribe(this,"max"),this.notifier.subscribe(this,"min")}disconnectedCallback(){super.disconnectedCallback(),this.notifier.unsubscribe(this,"orientation"),this.notifier.unsubscribe(this,"direction"),this.notifier.unsubscribe(this,"max"),this.notifier.unsubscribe(this,"min")}handleChange(e,t){switch(t){case"direction":this.sliderDirection=e.direction;break;case"orientation":this.sliderOrientation=e.orientation;break;case"max":this.sliderMaxPosition=e.max;break;case"min":this.sliderMinPosition=e.min;break;default:break}this.positionStyle=this.positionAsStyle()}isSliderConfig(e){return e.max!==void 0&&e.min!==void 0}};s([p],pt.prototype,"positionStyle",void 0);s([d],pt.prototype,"position",void 0);s([d({attribute:"hide-mark",mode:"boolean"})],pt.prototype,"hideMark",void 0);s([d({attribute:"disabled",mode:"boolean"})],pt.prototype,"disabled",void 0);s([p],pt.prototype,"sliderOrientation",void 0);s([p],pt.prototype,"sliderMinPosition",void 0);s([p],pt.prototype,"sliderMaxPosition",void 0);s([p],pt.prototype,"sliderDirection",void 0)});var zh=c(()=>{_h();Vh()});var Uh=c(()=>{});var Es,hn,jh=c(()=>{De();P();Es=class extends b{},hn=class extends ce(Es){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Of,ge,Gh=c(()=>{T();g();R();Ut();Ps();jh();Of={singleValue:"single-value"},ge=class extends hn{constructor(){super(...arguments),this.direction=O.ltr,this.isDragging=!1,this.trackWidth=0,this.trackMinWidth=0,this.trackHeight=0,this.trackLeft=0,this.trackMinHeight=0,this.valueTextFormatter=()=>null,this.min=0,this.max=10,this.step=1,this.orientation=U.horizontal,this.mode=Of.singleValue,this.keypressHandler=e=>{if(!this.readOnly){if(e.key===se)e.preventDefault(),this.value=`${this.min}`;else if(e.key===ae)e.preventDefault(),this.value=`${this.max}`;else if(!e.shiftKey)switch(e.key){case Ce:case X:e.preventDefault(),this.increment();break;case xe:case Y:e.preventDefault(),this.decrement();break}}},this.setupTrackConstraints=()=>{let e=this.track.getBoundingClientRect();this.trackWidth=this.track.clientWidth,this.trackMinWidth=this.track.clientLeft,this.trackHeight=e.bottom,this.trackMinHeight=e.top,this.trackLeft=this.getBoundingClientRect().left,this.trackWidth===0&&(this.trackWidth=1)},this.setupListeners=(e=!1)=>{let t=`${e?"remove":"add"}EventListener`;this[t]("keydown",this.keypressHandler),this[t]("mousedown",this.handleMouseDown),this.thumb[t]("mousedown",this.handleThumbMouseDown,{passive:!0}),this.thumb[t]("touchstart",this.handleThumbMouseDown,{passive:!0}),e&&(this.handleMouseDown(null),this.handleThumbMouseDown(null))},this.initialValue="",this.handleThumbMouseDown=e=>{if(e){if(this.readOnly||this.disabled||e.defaultPrevented)return;e.target.focus()}let t=`${e!==null?"add":"remove"}EventListener`;window[t]("mouseup",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove,{passive:!0}),window[t]("touchmove",this.handleMouseMove,{passive:!0}),window[t]("touchend",this.handleWindowMouseUp),this.isDragging=e!==null},this.handleMouseMove=e=>{if(this.readOnly||this.disabled||e.defaultPrevented)return;let t=window.TouchEvent&&e instanceof TouchEvent?e.touches[0]:e,i=this.orientation===U.horizontal?t.pageX-document.documentElement.scrollLeft-this.trackLeft:t.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`},this.calculateNewValue=e=>{let t=si(e,this.orientation===U.horizontal?this.trackMinWidth:this.trackMinHeight,this.orientation===U.horizontal?this.trackWidth:this.trackHeight,this.direction),i=(this.max-this.min)*t+this.min;return this.convertToConstrainedValue(i)},this.handleWindowMouseUp=e=>{this.stopDragging()},this.stopDragging=()=>{this.isDragging=!1,this.handleMouseDown(null),this.handleThumbMouseDown(null)},this.handleMouseDown=e=>{let t=`${e!==null?"add":"remove"}EventListener`;if((e===null||!this.disabled&&!this.readOnly)&&(window[t]("mouseup",this.handleWindowMouseUp),window.document[t]("mouseleave",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove),e)){e.preventDefault(),this.setupTrackConstraints(),e.target.focus();let i=this.orientation===U.horizontal?e.pageX-document.documentElement.scrollLeft-this.trackLeft:e.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`}},this.convertToConstrainedValue=e=>{isNaN(e)&&(e=this.min);let t=e-this.min,i=Math.round(t/this.step),n=t-i*(this.stepMultiplier*this.step)/this.stepMultiplier;return t=n>=Number(this.step)/2?t-n+Number(this.step):t-n,t+this.min}}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){super.valueChanged(e,t),this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction),this.$emit("change")}minChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.min=`${this.min}`),this.validate()}maxChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.max=`${this.max}`),this.validate()}stepChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.step=`${this.step}`),this.updateStepMultiplier(),this.validate()}orientationChanged(){this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","range"),this.direction=Be(this),this.updateStepMultiplier(),this.setupTrackConstraints(),this.setupListeners(),this.setupDefaultValue(),this.setThumbPositionForOrientation(this.direction)}disconnectedCallback(){this.setupListeners(!0)}increment(){let e=this.direction!==O.rtl&&this.orientation!==U.vertical?Number(this.value)+Number(this.step):Number(this.value)-Number(this.step),t=this.convertToConstrainedValue(e),i=t<Number(this.max)?`${t}`:`${this.max}`;this.value=i}decrement(){let e=this.direction!==O.rtl&&this.orientation!==U.vertical?Number(this.value)-Number(this.step):Number(this.value)+Number(this.step),t=this.convertToConstrainedValue(e),i=t>Number(this.min)?`${t}`:`${this.min}`;this.value=i}setThumbPositionForOrientation(e){let i=(1-si(Number(this.value),Number(this.min),Number(this.max),e))*100;this.orientation===U.horizontal?this.position=this.isDragging?`right: ${i}%; transition: none;`:`right: ${i}%; transition: all 0.2s ease;`:this.position=this.isDragging?`bottom: ${i}%; transition: none;`:`bottom: ${i}%; transition: all 0.2s ease;`}updateStepMultiplier(){let e=this.step+"",t=this.step%1?e.length-e.indexOf(".")-1:0;this.stepMultiplier=Math.pow(10,t)}get midpoint(){return`${this.convertToConstrainedValue((this.max+this.min)/2)}`}setupDefaultValue(){if(typeof this.value=="string")if(this.value.length===0)this.initialValue=this.midpoint;else{let e=parseFloat(this.value);!Number.isNaN(e)&&(e<this.min||e>this.max)&&(this.value=this.midpoint)}}};s([d({attribute:"readonly",mode:"boolean"})],ge.prototype,"readOnly",void 0);s([p],ge.prototype,"direction",void 0);s([p],ge.prototype,"isDragging",void 0);s([p],ge.prototype,"position",void 0);s([p],ge.prototype,"trackWidth",void 0);s([p],ge.prototype,"trackMinWidth",void 0);s([p],ge.prototype,"trackHeight",void 0);s([p],ge.prototype,"trackLeft",void 0);s([p],ge.prototype,"trackMinHeight",void 0);s([p],ge.prototype,"valueTextFormatter",void 0);s([d({converter:D})],ge.prototype,"min",void 0);s([d({converter:D})],ge.prototype,"max",void 0);s([d({converter:D})],ge.prototype,"step",void 0);s([d],ge.prototype,"orientation",void 0);s([d],ge.prototype,"mode",void 0)});var qh=c(()=>{Uh();Gh()});var Wh=c(()=>{});var Ms,un,Yh=c(()=>{De();P();Ms=class extends b{},un=class extends $o(Ms){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var pn,Xh=c(()=>{T();g();R();Yh();pn=class extends un{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(!this.readOnly)switch(e.key){case te:case Me:this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly),this.readOnly?this.classList.add("readonly"):this.classList.remove("readonly")}checkedChanged(e,t){super.checkedChanged(e,t),this.checked?this.classList.add("checked"):this.classList.remove("checked")}};s([d({attribute:"readonly",mode:"boolean"})],pn.prototype,"readOnly",void 0);s([p],pn.prototype,"defaultSlottedNodes",void 0)});var Qh=c(()=>{Wh();Xh()});var Zh,Jh=c(()=>{g();Zh=(o,e)=>k`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`});var mn,Kh=c(()=>{P();mn=class extends b{}});var eu=c(()=>{Jh();Kh()});var tu,ou=c(()=>{g();tu=(o,e)=>k`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`});var ai,iu=c(()=>{T();g();P();ai=class extends b{};s([d({mode:"boolean"})],ai.prototype,"disabled",void 0)});var nu=c(()=>{ou();iu()});var ru,su=c(()=>{g();fe();ru=(o,e)=>k`
    <template class="${t=>t.orientation}">
        ${qe(o,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${K("tabs")}></slot>

            ${to(t=>t.showActiveIndicator,k`
                    <div
                        ${Z("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${Ge(o,e)}
        <div class="tabpanel" part="tabpanel">
            <slot name="tabpanel" ${K("tabpanels")}></slot>
        </div>
    </template>
`});var fn,Qe,au=c(()=>{T();g();R();fe();ue();P();fn={vertical:"vertical",horizontal:"horizontal"},Qe=class extends b{constructor(){super(...arguments),this.orientation=fn.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isHiddenElement=e=>e.hasAttribute("hidden"),this.isFocusableElement=e=>!this.isDisabledElement(e)&&!this.isHiddenElement(e),this.setTabs=()=>{let e="gridColumn",t="gridRow",i=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((n,r)=>{if(n.slot==="tab"){let a=this.activeTabIndex===r&&this.isFocusableElement(n);this.activeindicator&&this.isFocusableElement(n)&&(this.showActiveIndicator=!0);let l=this.tabIds[r],h=this.tabpanelIds[r];n.setAttribute("id",l),n.setAttribute("aria-selected",a?"true":"false"),n.setAttribute("aria-controls",h),n.addEventListener("click",this.handleTabClick),n.addEventListener("keydown",this.handleTabKeyDown),n.setAttribute("tabindex",a?"0":"-1"),a&&(this.activetab=n,this.activeid=l)}n.style[e]="",n.style[t]="",n.style[i]=`${r+1}`,this.isHorizontal()?n.classList.remove("vertical"):n.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{let i=this.tabIds[t],n=this.tabpanelIds[t];e.setAttribute("id",n),e.setAttribute("aria-labelledby",i),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{let t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case xe:e.preventDefault(),this.adjustBackward(e);break;case Ce:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case X:e.preventDefault(),this.adjustBackward(e);break;case Y:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case se:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case ae:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)+1:1,i===t.length&&(i=0);i<t.length&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else{if(this.activetab&&i===t.indexOf(this.activetab))break;i+1>=t.length?i=0:i+=1}},this.adjustBackward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)-1:0,i=i<0?t.length-1:i;i>=0&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else i-1<0?i=t.length-1:i-=1},this.moveToTabByIndex=(e,t)=>{let i=e[t];this.activetab=i,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,i.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(i=>i.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${Le()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${Le()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===fn.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;let e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",i=this.isHorizontal()?"offsetLeft":"offsetTop",n=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;let r=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;let a=r-n;this.activeIndicatorRef.style.transform=`${t}(${a}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){let t=this.tabs.filter(a=>this.isFocusableElement(a)),i=t.indexOf(this.activetab),n=zt(0,t.length-1,i+e),r=this.tabs.indexOf(t[n]);r>-1&&this.moveToTabByIndex(this.tabs,r)}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}};s([d],Qe.prototype,"orientation",void 0);s([d],Qe.prototype,"activeid",void 0);s([p],Qe.prototype,"tabs",void 0);s([p],Qe.prototype,"tabpanels",void 0);s([d({mode:"boolean"})],Qe.prototype,"activeindicator",void 0);s([p],Qe.prototype,"activeIndicatorRef",void 0);s([p],Qe.prototype,"showActiveIndicator",void 0);M(Qe,_)});var lu=c(()=>{su();au()});var Ds,gn,cu=c(()=>{De();P();Ds=class extends b{},gn=class extends ce(Ds){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}});var Ro,du=c(()=>{Ro={none:"none",both:"both",horizontal:"horizontal",vertical:"vertical"}});var me,Os=c(()=>{T();g();nn();ue();cu();du();me=class extends gn{constructor(){super(...arguments),this.resize=Ro.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};s([d({mode:"boolean"})],me.prototype,"readOnly",void 0);s([d],me.prototype,"resize",void 0);s([d({mode:"boolean"})],me.prototype,"autofocus",void 0);s([d({attribute:"form"})],me.prototype,"formId",void 0);s([d],me.prototype,"list",void 0);s([d({converter:D})],me.prototype,"maxlength",void 0);s([d({converter:D})],me.prototype,"minlength",void 0);s([d],me.prototype,"name",void 0);s([d],me.prototype,"placeholder",void 0);s([d({converter:D,mode:"fromView"})],me.prototype,"cols",void 0);s([d({converter:D,mode:"fromView"})],me.prototype,"rows",void 0);s([d({mode:"boolean"})],me.prototype,"spellcheck",void 0);s([p],me.prototype,"defaultSlottedNodes",void 0);M(me,Wt)});var hu,uu=c(()=>{g();Os();hu=(o,e)=>k`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==Ro.none?`resize-${t.resize}`:""}"
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${K("defaultSlottedNodes")}></slot>
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
            @input="${(t,i)=>t.handleTextInput()}"
            @change="${t=>t.handleChange()}"
            ${Z("control")}
        ></textarea>
    </template>
`});var pu=c(()=>{uu();Os()});var mu,fu=c(()=>{g();fe();Ts();mu=(o,e)=>k`
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
                ${K({property:"defaultSlottedNodes",filter:Sh})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${qe(o,e)}
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
                ${Z("control")}
            />
            ${Ge(o,e)}
        </div>
    </template>
`});var gu=c(()=>{fu();nn()});var bu=c(()=>{});function vu(o){let e=o.getRootNode();return e instanceof ShadowRoot?e.activeElement:document.activeElement}var yu=c(()=>{});var xu,Yt,Ao,Cu=c(()=>{T();g();R();fs();P();Xo();fe();ue();Ut();yu();xu=Object.freeze({[Vt.ArrowUp]:{[U.vertical]:-1},[Vt.ArrowDown]:{[U.vertical]:1},[Vt.ArrowLeft]:{[U.horizontal]:{[O.ltr]:-1,[O.rtl]:1}},[Vt.ArrowRight]:{[U.horizontal]:{[O.ltr]:1,[O.rtl]:-1}}}),Yt=class o extends b{constructor(){super(...arguments),this._activeIndex=0,this.direction=O.ltr,this.orientation=U.horizontal}get activeIndex(){return w.track(this,"activeIndex"),this._activeIndex}set activeIndex(e){this.$fastController.isConnected&&(this._activeIndex=zt(0,this.focusableElements.length-1,e),w.notify(this,"activeIndex"))}slottedItemsChanged(){this.$fastController.isConnected&&this.reduceFocusableElements()}mouseDownHandler(e){var t;let i=(t=this.focusableElements)===null||t===void 0?void 0:t.findIndex(n=>n.contains(e.target));return i>-1&&this.activeIndex!==i&&this.setFocusedElement(i),!0}childItemsChanged(e,t){this.$fastController.isConnected&&this.reduceFocusableElements()}connectedCallback(){super.connectedCallback(),this.direction=Be(this)}focusinHandler(e){let t=e.relatedTarget;!t||this.contains(t)||this.setFocusedElement()}getDirectionalIncrementer(e){var t,i,n,r,a;return(a=(n=(i=(t=xu[e])===null||t===void 0?void 0:t[this.orientation])===null||i===void 0?void 0:i[this.direction])!==null&&n!==void 0?n:(r=xu[e])===null||r===void 0?void 0:r[this.orientation])!==null&&a!==void 0?a:0}keydownHandler(e){let t=e.key;if(!(t in Vt)||e.defaultPrevented||e.shiftKey)return!0;let i=this.getDirectionalIncrementer(t);if(!i)return!e.target.closest("[role=radiogroup]");let n=this.activeIndex+i;return this.focusableElements[n]&&e.preventDefault(),this.setFocusedElement(n),!0}get allSlottedItems(){return[...this.start.assignedElements(),...this.slottedItems,...this.end.assignedElements()]}reduceFocusableElements(){var e;let t=(e=this.focusableElements)===null||e===void 0?void 0:e[this.activeIndex];this.focusableElements=this.allSlottedItems.reduce(o.reduceFocusableItems,[]);let i=this.focusableElements.indexOf(t);this.activeIndex=Math.max(0,i),this.setFocusableElements()}setFocusedElement(e=this.activeIndex){this.activeIndex=e,this.setFocusableElements(),this.focusableElements[this.activeIndex]&&this.contains(vu(this))&&this.focusableElements[this.activeIndex].focus()}static reduceFocusableItems(e,t){var i,n,r,a;let l=t.getAttribute("role")==="radio",h=(n=(i=t.$fastController)===null||i===void 0?void 0:i.definition.shadowOptions)===null||n===void 0?void 0:n.delegatesFocus,u=Array.from((a=(r=t.shadowRoot)===null||r===void 0?void 0:r.querySelectorAll("*"))!==null&&a!==void 0?a:[]).some(m=>ms(m));return!t.hasAttribute("disabled")&&!t.hasAttribute("hidden")&&(ms(t)||l||h||u)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceFocusableItems,[])):e}setFocusableElements(){this.$fastController.isConnected&&this.focusableElements.length>0&&this.focusableElements.forEach((e,t)=>{e.tabIndex=this.activeIndex===t?0:-1})}};s([p],Yt.prototype,"direction",void 0);s([d],Yt.prototype,"orientation",void 0);s([p],Yt.prototype,"slottedItems",void 0);s([p],Yt.prototype,"slottedLabel",void 0);s([p],Yt.prototype,"childItems",void 0);Ao=class{};s([d({attribute:"aria-labelledby"})],Ao.prototype,"ariaLabelledby",void 0);s([d({attribute:"aria-label"})],Ao.prototype,"ariaLabel",void 0);M(Ao,A);M(Yt,_,Ao)});var wu=c(()=>{bu();Cu()});var ku=c(()=>{});var Se,$u=c(()=>{Se={top:"top",right:"right",bottom:"bottom",left:"left",start:"start",end:"end",topLeft:"top-left",topRight:"top-right",bottomLeft:"bottom-left",bottomRight:"bottom-right",topStart:"top-start",topEnd:"top-end",bottomStart:"bottom-start",bottomEnd:"bottom-end"}});var re,Tu=c(()=>{T();g();R();Ut();P();$u();re=class extends b{constructor(){super(...arguments),this.anchor="",this.delay=300,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.horizontalInset="false",this.verticalInset="false",this.horizontalScaling="content",this.verticalScaling="content",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition=void 0,this.tooltipVisible=!1,this.currentDirection=O.ltr,this.showDelayTimer=null,this.hideDelayTimer=null,this.isAnchorHoveredFocused=!1,this.isRegionHovered=!1,this.handlePositionChange=e=>{this.classList.toggle("top",this.region.verticalPosition==="start"),this.classList.toggle("bottom",this.region.verticalPosition==="end"),this.classList.toggle("inset-top",this.region.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.region.verticalPosition==="insetEnd"),this.classList.toggle("center-vertical",this.region.verticalPosition==="center"),this.classList.toggle("left",this.region.horizontalPosition==="start"),this.classList.toggle("right",this.region.horizontalPosition==="end"),this.classList.toggle("inset-left",this.region.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.region.horizontalPosition==="insetEnd"),this.classList.toggle("center-horizontal",this.region.horizontalPosition==="center")},this.handleRegionMouseOver=e=>{this.isRegionHovered=!0},this.handleRegionMouseOut=e=>{this.isRegionHovered=!1,this.startHideDelayTimer()},this.handleAnchorMouseOver=e=>{if(this.tooltipVisible){this.isAnchorHoveredFocused=!0;return}this.startShowDelayTimer()},this.handleAnchorMouseOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.handleAnchorFocusIn=e=>{this.startShowDelayTimer()},this.handleAnchorFocusOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.startHideDelayTimer=()=>{this.clearHideDelayTimer(),this.tooltipVisible&&(this.hideDelayTimer=window.setTimeout(()=>{this.updateTooltipVisibility()},60))},this.clearHideDelayTimer=()=>{this.hideDelayTimer!==null&&(clearTimeout(this.hideDelayTimer),this.hideDelayTimer=null)},this.startShowDelayTimer=()=>{if(!this.isAnchorHoveredFocused){if(this.delay>1){this.showDelayTimer===null&&(this.showDelayTimer=window.setTimeout(()=>{this.startHover()},this.delay));return}this.startHover()}},this.startHover=()=>{this.isAnchorHoveredFocused=!0,this.updateTooltipVisibility()},this.clearShowDelayTimer=()=>{this.showDelayTimer!==null&&(clearTimeout(this.showDelayTimer),this.showDelayTimer=null)},this.getAnchor=()=>{let e=this.getRootNode();return e instanceof ShadowRoot?e.getElementById(this.anchor):document.getElementById(this.anchor)},this.handleDocumentKeydown=e=>{!e.defaultPrevented&&this.tooltipVisible&&e.key===Ee&&(this.isAnchorHoveredFocused=!1,this.updateTooltipVisibility(),this.$emit("dismiss"))},this.updateTooltipVisibility=()=>{if(this.visible===!1)this.hideTooltip();else if(this.visible===!0){this.showTooltip();return}else{if(this.isAnchorHoveredFocused||this.isRegionHovered){this.showTooltip();return}this.hideTooltip()}},this.showTooltip=()=>{this.tooltipVisible||(this.currentDirection=Be(this),this.tooltipVisible=!0,document.addEventListener("keydown",this.handleDocumentKeydown),v.queueUpdate(this.setRegionProps))},this.hideTooltip=()=>{this.tooltipVisible&&(this.clearHideDelayTimer(),this.region!==null&&this.region!==void 0&&(this.region.removeEventListener("positionchange",this.handlePositionChange),this.region.viewportElement=null,this.region.anchorElement=null,this.region.removeEventListener("mouseover",this.handleRegionMouseOver),this.region.removeEventListener("mouseout",this.handleRegionMouseOut)),document.removeEventListener("keydown",this.handleDocumentKeydown),this.tooltipVisible=!1)},this.setRegionProps=()=>{this.tooltipVisible&&(this.region.viewportElement=this.viewportElement,this.region.anchorElement=this.anchorElement,this.region.addEventListener("positionchange",this.handlePositionChange),this.region.addEventListener("mouseover",this.handleRegionMouseOver,{passive:!0}),this.region.addEventListener("mouseout",this.handleRegionMouseOut,{passive:!0}))}}visibleChanged(){this.$fastController.isConnected&&(this.updateTooltipVisibility(),this.updateLayout())}anchorChanged(){this.$fastController.isConnected&&(this.anchorElement=this.getAnchor())}positionChanged(){this.$fastController.isConnected&&this.updateLayout()}anchorElementChanged(e){if(this.$fastController.isConnected){if(e!=null&&(e.removeEventListener("mouseover",this.handleAnchorMouseOver),e.removeEventListener("mouseout",this.handleAnchorMouseOut),e.removeEventListener("focusin",this.handleAnchorFocusIn),e.removeEventListener("focusout",this.handleAnchorFocusOut)),this.anchorElement!==null&&this.anchorElement!==void 0){this.anchorElement.addEventListener("mouseover",this.handleAnchorMouseOver,{passive:!0}),this.anchorElement.addEventListener("mouseout",this.handleAnchorMouseOut,{passive:!0}),this.anchorElement.addEventListener("focusin",this.handleAnchorFocusIn,{passive:!0}),this.anchorElement.addEventListener("focusout",this.handleAnchorFocusOut,{passive:!0});let t=this.anchorElement.id;this.anchorElement.parentElement!==null&&this.anchorElement.parentElement.querySelectorAll(":hover").forEach(i=>{i.id===t&&this.startShowDelayTimer()})}this.region!==null&&this.region!==void 0&&this.tooltipVisible&&(this.region.anchorElement=this.anchorElement),this.updateLayout()}}viewportElementChanged(){this.region!==null&&this.region!==void 0&&(this.region.viewportElement=this.viewportElement),this.updateLayout()}connectedCallback(){super.connectedCallback(),this.anchorElement=this.getAnchor(),this.updateTooltipVisibility()}disconnectedCallback(){this.hideTooltip(),this.clearShowDelayTimer(),this.clearHideDelayTimer(),super.disconnectedCallback()}updateLayout(){switch(this.verticalPositioningMode="locktodefault",this.horizontalPositioningMode="locktodefault",this.position){case Se.top:case Se.bottom:this.verticalDefaultPosition=this.position,this.horizontalDefaultPosition="center";break;case Se.right:case Se.left:case Se.start:case Se.end:this.verticalDefaultPosition="center",this.horizontalDefaultPosition=this.position;break;case Se.topLeft:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="left";break;case Se.topRight:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="right";break;case Se.bottomLeft:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="left";break;case Se.bottomRight:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="right";break;case Se.topStart:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="start";break;case Se.topEnd:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="end";break;case Se.bottomStart:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="start";break;case Se.bottomEnd:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="end";break;default:this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition="center";break}}};s([d({mode:"boolean"})],re.prototype,"visible",void 0);s([d],re.prototype,"anchor",void 0);s([d],re.prototype,"delay",void 0);s([d],re.prototype,"position",void 0);s([d({attribute:"auto-update-mode"})],re.prototype,"autoUpdateMode",void 0);s([d({attribute:"horizontal-viewport-lock"})],re.prototype,"horizontalViewportLock",void 0);s([d({attribute:"vertical-viewport-lock"})],re.prototype,"verticalViewportLock",void 0);s([p],re.prototype,"anchorElement",void 0);s([p],re.prototype,"viewportElement",void 0);s([p],re.prototype,"verticalPositioningMode",void 0);s([p],re.prototype,"horizontalPositioningMode",void 0);s([p],re.prototype,"horizontalInset",void 0);s([p],re.prototype,"verticalInset",void 0);s([p],re.prototype,"horizontalScaling",void 0);s([p],re.prototype,"verticalScaling",void 0);s([p],re.prototype,"verticalDefaultPosition",void 0);s([p],re.prototype,"horizontalDefaultPosition",void 0);s([p],re.prototype,"tooltipVisible",void 0);s([p],re.prototype,"currentDirection",void 0)});var Iu=c(()=>{ku();Tu()});var Su=c(()=>{});function St(o){return dt(o)&&o.getAttribute("role")==="treeitem"}var ie,Rs=c(()=>{T();g();R();fe();ue();P();ie=class extends b{constructor(){super(...arguments),this.expanded=!1,this.focusable=!1,this.isNestedItem=()=>St(this.parentElement),this.handleExpandCollapseButtonClick=e=>{!this.disabled&&!e.defaultPrevented&&(this.expanded=!this.expanded)},this.handleFocus=e=>{this.setAttribute("tabindex","0")},this.handleBlur=e=>{this.setAttribute("tabindex","-1")}}expandedChanged(){this.$fastController.isConnected&&this.$emit("expanded-change",this)}selectedChanged(){this.$fastController.isConnected&&this.$emit("selected-change",this)}itemsChanged(e,t){this.$fastController.isConnected&&this.items.forEach(i=>{St(i)&&(i.nested=!0)})}static focusItem(e){e.focusable=!0,e.focus()}childItemLength(){let e=this.childItems.filter(t=>St(t));return e?e.length:0}};s([d({mode:"boolean"})],ie.prototype,"expanded",void 0);s([d({mode:"boolean"})],ie.prototype,"selected",void 0);s([d({mode:"boolean"})],ie.prototype,"disabled",void 0);s([p],ie.prototype,"focusable",void 0);s([p],ie.prototype,"childItems",void 0);s([p],ie.prototype,"items",void 0);s([p],ie.prototype,"nested",void 0);s([p],ie.prototype,"renderCollapsedChildren",void 0);M(ie,_)});var Pu=c(()=>{Su();Rs()});var Eu=c(()=>{});var li,Mu=c(()=>{T();g();R();Rs();P();li=class extends b{constructor(){super(...arguments),this.currentFocused=null,this.handleFocus=e=>{if(!(this.slottedTreeItems.length<1)){if(e.target===this){this.currentFocused===null&&(this.currentFocused=this.getValidFocusableItem()),this.currentFocused!==null&&ie.focusItem(this.currentFocused);return}this.contains(e.target)&&(this.setAttribute("tabindex","-1"),this.currentFocused=e.target)}},this.handleBlur=e=>{e.target instanceof HTMLElement&&(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabindex","0")},this.handleKeyDown=e=>{if(e.defaultPrevented)return;if(this.slottedTreeItems.length<1)return!0;let t=this.getVisibleNodes();switch(e.key){case se:t.length&&ie.focusItem(t[0]);return;case ae:t.length&&ie.focusItem(t[t.length-1]);return;case xe:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof ie&&i.childItemLength()>0&&i.expanded?i.expanded=!1:i instanceof ie&&i.parentElement instanceof ie&&ie.focusItem(i.parentElement)}return!1;case Ce:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof ie&&i.childItemLength()>0&&!i.expanded?i.expanded=!0:i instanceof ie&&i.childItemLength()>0&&this.focusNextNode(1,e.target)}return;case Y:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(1,e.target);return;case X:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(-1,e.target);return;case te:this.handleClick(e);return}return!0},this.handleSelectedChange=e=>{if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!St(e.target))return!0;let t=e.target;t.selected?(this.currentSelected&&this.currentSelected!==t&&(this.currentSelected.selected=!1),this.currentSelected=t):!t.selected&&this.currentSelected===t&&(this.currentSelected=null)},this.setItems=()=>{let e=this.treeView.querySelector("[aria-selected='true']");this.currentSelected=e,(this.currentFocused===null||!this.contains(this.currentFocused))&&(this.currentFocused=this.getValidFocusableItem()),this.nested=this.checkForNestedItems(),this.getVisibleNodes().forEach(i=>{St(i)&&(i.nested=this.nested)})},this.isFocusableElement=e=>St(e),this.isSelectedElement=e=>e.selected}slottedTreeItemsChanged(){this.$fastController.isConnected&&this.setItems()}connectedCallback(){super.connectedCallback(),this.setAttribute("tabindex","0"),v.queueUpdate(()=>{this.setItems()})}handleClick(e){if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!St(e.target))return!0;let t=e.target;t.disabled||(t.selected=!t.selected)}focusNextNode(e,t){let i=this.getVisibleNodes();if(!i)return;let n=i[i.indexOf(t)+e];dt(n)&&ie.focusItem(n)}getValidFocusableItem(){let e=this.getVisibleNodes(),t=e.findIndex(this.isSelectedElement);return t===-1&&(t=e.findIndex(this.isFocusableElement)),t!==-1?e[t]:null}checkForNestedItems(){return this.slottedTreeItems.some(e=>St(e)&&e.querySelector("[role='treeitem']"))}getVisibleNodes(){return _l(this,"[role='treeitem']")||[]}};s([d({attribute:"render-collapsed-nodes"})],li.prototype,"renderCollapsedNodes",void 0);s([p],li.prototype,"currentSelected",void 0);s([p],li.prototype,"slottedTreeItems",void 0)});var Du=c(()=>{Eu();Mu()});var As,ci,UE,jE,GE,Ou=c(()=>{As=class{constructor(e){this.listenerCache=new WeakMap,this.query=e}bind(e){let{query:t}=this,i=this.constructListener(e);i.bind(t)(),t.addListener(i),this.listenerCache.set(e,i)}unbind(e){let t=this.listenerCache.get(e);t&&(this.query.removeListener(t),this.listenerCache.delete(e))}},ci=class o extends As{constructor(e,t){super(e),this.styles=t}static with(e){return t=>new o(e,t)}constructListener(e){let t=!1,i=this.styles;return function(){let{matches:r}=this;r&&!t?(e.$fastController.addStyles(i),t=r):!r&&t&&(e.$fastController.removeStyles(i),t=r)}}unbind(e){super.unbind(e),e.$fastController.removeStyles(this.styles)}},UE=ci.with(window.matchMedia("(forced-colors)")),jE=ci.with(window.matchMedia("(prefers-color-scheme: dark)")),GE=ci.with(window.matchMedia("(prefers-color-scheme: light)"))});var Ru=c(()=>{});var Pe,Au=c(()=>{Pe="not-allowed"});function H(o){return`${Rf}:host{display:${o}}`}var Rf,Fu=c(()=>{Rf=":host([hidden]){display:none}"});var G,Lu=c(()=>{R();G=Vl()?"focus-visible":"focus"});var Bu=c(()=>{Au();Fu();Lu()});var Nu=c(()=>{ue();Wi();Ou();Ru();Bu();Ut();Ts()});var L=c(()=>{Ml();ac();dc();_r();yc();wc();$c();Sc();Lc();Wc();Qc();td();rd();Gc();dd();as();hd();yd();wd();Sd();Od();Rd();Ad();Bd();Hd();Xd();Cs();th();ah();ro();hh();mh();vh();kh();Ih();Dh();Lh();Hh();zh();qh();Qh();eu();nu();lu();pu();gu();wu();Iu();Pu();Du();Nu()});function Af(o){return hs.getOrCreate(o).withPrefix("vscode")}var Hu=c(()=>{L()});function Vu(o){window.addEventListener("load",()=>{new MutationObserver(()=>{_u(o)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),_u(o)})}function _u(o){let e=getComputedStyle(document.body),t=document.querySelector("body");if(t){let i=t.getAttribute("data-vscode-theme-kind");for(let[n,r]of o){let a=e.getPropertyValue(n).toString();if(i==="vscode-high-contrast")a.length===0&&r.name.includes("background")&&(a="transparent"),r.name==="button-icon-hover-background"&&(a="transparent");else if(i==="vscode-high-contrast-light"){if(a.length===0&&r.name.includes("background"))switch(r.name){case"button-primary-hover-background":a="#0F4A85";break;case"button-secondary-hover-background":a="transparent";break;case"button-icon-hover-background":a="transparent";break}}else r.name==="contrast-active-border"&&(a="transparent");r.setValueFor(t,a)}}}var zu=c(()=>{});function x(o,e){let t=ti.create(o);if(e){if(e.includes("--fake-vscode-token")){let i="id"+Math.random().toString(16).slice(2);e=`${e}-${i}`}Uu.set(e,t)}return ju||(Vu(Uu),ju=!0),t}var Uu,ju,Gu=c(()=>{L();zu();Uu=new Map,ju=!1});var qu,S,bn,fM,mt,ft,C,Fe,V,J,gM,q,Fo,Lo,j,W,vn,yn,bM,vM,yM,xM,Wu,Yu,Xu,Qu,Zu,xn,Cn,Bo,Fs,Ju,Ku,Ls,ep,fo,Bs,Ns,wn,tp,op,ip,np,rt,Xt,rp,CM,gt,Pt,sp,ap,di,st,wM,lp,Et,kn,kM,Hs,cp,dp,hp,Qt,up,$M,TM,pp,he=c(()=>{Gu();qu=x("background","--vscode-editor-background").withDefault("#1e1e1e"),S=x("border-width").withDefault(1),bn=x("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518"),fM=x("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df"),mt=x("corner-radius").withDefault(0),ft=x("corner-radius-round").withDefault(2),C=x("design-unit").withDefault(4),Fe=x("disabled-opacity").withDefault(.4),V=x("focus-border","--vscode-focusBorder").withDefault("#007fd4"),J=x("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol"),gM=x("font-weight","--vscode-font-weight").withDefault("400"),q=x("foreground","--vscode-foreground").withDefault("#cccccc"),Fo=x("input-height").withDefault("26"),Lo=x("input-min-width").withDefault("100px"),j=x("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),W=x("type-ramp-base-line-height").withDefault("normal"),vn=x("type-ramp-minus1-font-size").withDefault("11px"),yn=x("type-ramp-minus1-line-height").withDefault("16px"),bM=x("type-ramp-minus2-font-size").withDefault("9px"),vM=x("type-ramp-minus2-line-height").withDefault("16px"),yM=x("type-ramp-plus1-font-size").withDefault("16px"),xM=x("type-ramp-plus1-line-height").withDefault("24px"),Wu=x("scrollbarWidth").withDefault("10px"),Yu=x("scrollbarHeight").withDefault("10px"),Xu=x("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),Qu=x("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),Zu=x("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),xn=x("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),Cn=x("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),Bo=x("button-border","--vscode-button-border").withDefault("transparent"),Fs=x("button-icon-background").withDefault("transparent"),Ju=x("button-icon-corner-radius").withDefault("5px"),Ku=x("button-icon-outline-offset").withDefault(0),Ls=x("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),ep=x("button-icon-padding").withDefault("3px"),fo=x("button-primary-background","--vscode-button-background").withDefault("#0e639c"),Bs=x("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),Ns=x("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),wn=x("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),tp=x("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),op=x("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),ip=x("button-padding-horizontal").withDefault("11px"),np=x("button-padding-vertical").withDefault("4px"),rt=x("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),Xt=x("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),rp=x("checkbox-corner-radius").withDefault(3),CM=x("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0"),gt=x("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),Pt=x("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),sp=x("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),ap=x("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),di=x("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),st=x("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c"),wM=x("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0"),lp=x("dropdown-list-max-height").withDefault("200px"),Et=x("input-background","--vscode-input-background").withDefault("#3c3c3c"),kn=x("input-foreground","--vscode-input-foreground").withDefault("#cccccc"),kM=x("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc"),Hs=x("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),cp=x("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),dp=x("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),hp=x("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Qt=x("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),up=x("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799"),$M=x("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e"),TM=x("panel-view-border","--vscode-panel-border").withDefault("#80808059"),pp=x("tag-corner-radius").withDefault("2px")});var mp,fp=c(()=>{g();L();he();mp=(o,e)=>E`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${J};
		font-size: ${vn};
		line-height: ${yn};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${xn};
		border: calc(${S} * 1px) solid ${Bo};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${Cn};
		display: flex;
		height: calc(${C} * 4px);
		justify-content: center;
		min-width: calc(${C} * 4px + 2px);
		min-height: calc(${C} * 4px + 2px);
		padding: 3px 6px;
	}
`});var $n,_s,Vs=c(()=>{L();fp();$n=class extends wt{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}},_s=$n.compose({baseName:"badge",template:_i,styles:mp})});function gp(o,e,t,i){var n=arguments.length,r=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(a=o[l])&&(r=(n<3?a(r):n>3?a(e,t,r):a(e,t))||r);return n>3&&r&&Object.defineProperty(e,t,r),r}var bp=c(()=>{});var Ff,Lf,Bf,Nf,vp,yp=c(()=>{g();L();he();Ff=E`
	${H("inline-flex")} :host {
		outline: none;
		font-family: ${J};
		font-size: ${j};
		line-height: ${W};
		color: ${Bs};
		background: ${fo};
		border-radius: calc(${ft} * 1px);
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
		padding: ${np} ${ip};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${S} * 1px) solid ${Bo};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${Ns};
	}
	:host(:active) {
		background: ${fo};
	}
	.control:${G} {
		outline: calc(${S} * 1px) solid ${V};
		outline-offset: calc(${S} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Fe};
		background: ${fo};
		cursor: ${Pe};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${C} * 4px);
		height: calc(${C} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`,Lf=E`
	:host([appearance='primary']) {
		background: ${fo};
		color: ${Bs};
	}
	:host([appearance='primary']:hover) {
		background: ${Ns};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${fo};
	}
	:host([appearance='primary']) .control:${G} {
		outline: calc(${S} * 1px) solid ${V};
		outline-offset: calc(${S} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${fo};
	}
`,Bf=E`
	:host([appearance='secondary']) {
		background: ${wn};
		color: ${tp};
	}
	:host([appearance='secondary']:hover) {
		background: ${op};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${wn};
	}
	:host([appearance='secondary']) .control:${G} {
		outline: calc(${S} * 1px) solid ${V};
		outline-offset: calc(${S} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${wn};
	}
`,Nf=E`
	:host([appearance='icon']) {
		background: ${Fs};
		border-radius: ${Ju};
		color: ${q};
	}
	:host([appearance='icon']:hover) {
		background: ${Ls};
		outline: 1px dotted ${bn};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${ep};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${Ls};
	}
	:host([appearance='icon']) .control:${G} {
		outline: calc(${S} * 1px) solid ${V};
		outline-offset: ${Ku};
	}
	:host([appearance='icon'][disabled]) {
		background: ${Fs};
	}
`,vp=(o,e)=>E`
	${Ff}
	${Lf}
	${Bf}
	${Nf}
`});var hi,zs,Us=c(()=>{bp();g();L();yp();hi=class extends Oe{connectedCallback(){if(super.connectedCallback(),!this.appearance){let e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,i){e==="appearance"&&i==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=i),e==="disabled"&&(this.disabled=i!==null)}};gp([d],hi.prototype,"appearance",void 0);zs=hi.compose({baseName:"button",template:Pc,styles:vp,shadowOptions:{delegatesFocus:!0}})});var xp,Cp=c(()=>{g();L();he();xp=(o,e)=>E`
	${H("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${C} * 1px) 0;
		user-select: none;
		font-size: ${j};
		line-height: ${W};
	}
	.control {
		position: relative;
		width: calc(${C} * 4px + 2px);
		height: calc(${C} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${rp} * 1px);
		border: calc(${S} * 1px) solid ${Xt};
		background: ${rt};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${J};
		color: ${q};
		padding-inline-start: calc(${C} * 2px + 2px);
		margin-inline-end: calc(${C} * 2px + 2px);
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
		fill: ${q};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${q};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${rt};
		border-color: ${Xt};
	}
	:host(:enabled) .control:active {
		background: ${rt};
		border-color: ${V};
	}
	:host(:${G}) .control {
		border: calc(${S} * 1px) solid ${V};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${Pe};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${Fe};
	}
`});var Tn,js,Gs=c(()=>{L();Cp();Tn=class extends co{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}},js=Tn.compose({baseName:"checkbox",template:Zc,styles:xp,checkedIndicator:`
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
	`})});var wp,kp=c(()=>{g();wp=(o,e)=>E`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`});var $p,Tp=c(()=>{g();he();$p=(o,e)=>E`
	:host {
		display: grid;
		padding: calc((${C} / 4) * 1px) 0;
		box-sizing: border-box;
		width: 100%;
		background: transparent;
	}
	:host(.header) {
	}
	:host(.sticky-header) {
		background: ${qu};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${sp};
		outline: 1px dotted ${bn};
		outline-offset: -1px;
	}
`});var Ip,Sp=c(()=>{g();L();he();Ip=(o,e)=>E`
	:host {
		padding: calc(${C} * 1px) calc(${C} * 3px);
		color: ${q};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${J};
		font-size: ${j};
		line-height: ${W};
		font-weight: 400;
		border: solid calc(${S} * 1px) transparent;
		border-radius: calc(${mt} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
	}
	:host(:${G}),
	:host(:focus),
	:host(:active) {
		background: ${gt};
		border: solid calc(${S} * 1px) ${V};
		color: ${Pt};
		outline: none;
	}
	:host(:${G}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${Pt} !important;
	}
`});var In,qs,Sn,Ws,Pn,Ys,Xs=c(()=>{L();kp();Tp();Sp();In=class extends de{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}},qs=In.compose({baseName:"data-grid",baseClass:de,template:Nc,styles:wp}),Sn=class extends le{},Ws=Sn.compose({baseName:"data-grid-row",baseClass:le,template:Vc,styles:$p}),Pn=class extends We{},Ys=Pn.compose({baseName:"data-grid-cell",baseClass:We,template:Uc,styles:Ip})});var Pp,Ep=c(()=>{g();L();he();Pp=(o,e)=>E`
	${H("block")} :host {
		border: none;
		border-top: calc(${S} * 1px) solid ${ap};
		box-sizing: content-box;
		height: 0;
		margin: calc(${C} * 1px) 0;
		width: 100%;
	}
`});var En,Qs,Zs=c(()=>{L();Ep();En=class extends Po{},Qs=En.compose({baseName:"divider",template:kd,styles:Pp})});var Mp,Dp=c(()=>{g();L();he();Mp=(o,e)=>E`
	${H("inline-flex")} :host {
		background: ${di};
		border-radius: calc(${ft} * 1px);
		box-sizing: border-box;
		color: ${q};
		contain: contents;
		font-family: ${J};
		height: calc(${Fo} * 1px);
		position: relative;
		user-select: none;
		min-width: ${Lo};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${S} * 1px) solid ${st};
		border-radius: calc(${ft} * 1px);
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: ${j};
		line-height: ${W};
		min-height: 100%;
		padding: 2px 6px 2px 8px;
		width: 100%;
	}
	.listbox {
		background: ${di};
		border: calc(${S} * 1px) solid ${V};
		border-radius: calc(${ft} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${lp};
		padding: 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${G}) .control {
		border-color: ${V};
	}
	:host(:not([disabled]):hover) {
		background: ${di};
		border-color: ${st};
	}
	:host(:${G}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${gt};
		border: calc(${S} * 1px) solid transparent;
		color: ${Pt};
	}
	:host([disabled]) {
		cursor: ${Pe};
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		cursor: ${Pe};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${di};
		color: ${q};
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
		bottom: calc(${Fo} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${Fo} * 1px);
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
		min-height: calc(${C} * 4px);
		min-width: calc(${C} * 4px);
		width: 1em;
	}
	::slotted([role='option']),
	::slotted(option) {
		flex: 0 0 auto;
	}
`});var Mn,Js,Ks=c(()=>{L();Dp();Mn=class extends nt{},Js=Mn.compose({baseName:"dropdown",template:Ah,styles:Mp,indicator:`
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
	`})});var Op,Rp=c(()=>{g();L();he();Op=(o,e)=>E`
	${H("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${cp};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${J};
		font-size: ${j};
		line-height: ${W};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${S} * 1px) solid transparent;
		border-radius: calc(${mt} * 1px);
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
		color: ${Hs};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${Hs};
	}
	:host(:${G}) .control,
	:host(:focus) .control {
		border: calc(${S} * 1px) solid ${V};
	}
`});var Dn,ea,ta=c(()=>{L();Rp();Dn=class extends we{},ea=Dn.compose({baseName:"link",template:lc,styles:Op,shadowOptions:{delegatesFocus:!0}})});var Ap,Fp=c(()=>{g();L();he();Ap=(o,e)=>E`
	${H("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${mt};
		border: calc(${S} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${q};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${j};
		line-height: ${W};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${C} / 2) * 1px)
			calc((${C} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${G}) {
		border-color: ${V};
		background: ${gt};
		color: ${q};
	}
	:host([aria-selected='true']) {
		background: ${gt};
		border: calc(${S} * 1px) solid transparent;
		color: ${Pt};
	}
	:host(:active) {
		background: ${gt};
		color: ${Pt};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${gt};
		border: calc(${S} * 1px) solid transparent;
		color: ${Pt};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${gt};
		color: ${q};
	}
	:host([disabled]) {
		cursor: ${Pe};
		opacity: ${Fe};
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
`});var On,oa,ia=c(()=>{L();Fp();On=class extends Ye{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}},oa=On.compose({baseName:"option",template:Fd,styles:Ap})});var Lp,Bp=c(()=>{g();L();he();Lp=(o,e)=>E`
	${H("grid")} :host {
		box-sizing: border-box;
		font-family: ${J};
		font-size: ${j};
		line-height: ${W};
		color: ${q};
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr;
		overflow-x: auto;
	}
	.tablist {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: auto;
		column-gap: calc(${C} * 8px);
		position: relative;
		width: max-content;
		align-self: end;
		padding: calc(${C} * 1px) calc(${C} * 1px) 0;
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
		height: calc((${C} / 4) * 1px);
		justify-self: center;
		background: ${Qt};
		margin: 0;
		border-radius: calc(${mt} * 1px);
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
`});var Np,Hp=c(()=>{g();L();he();Np=(o,e)=>E`
	${H("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${J};
		font-size: ${j};
		line-height: ${W};
		height: calc(${C} * 7px);
		padding: calc(${C} * 1px) 0;
		color: ${up};
		fill: currentcolor;
		border-radius: calc(${mt} * 1px);
		border: solid calc(${S} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Qt};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Qt};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Qt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Qt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Qt};
		fill: currentcolor;
	}
	:host(:${G}) {
		outline: none;
		border: solid calc(${S} * 1px) ${hp};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${C} * 2px);
	}
`});var _p,Vp=c(()=>{g();L();he();_p=(o,e)=>E`
	${H("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${S} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${j};
		line-height: ${W};
		padding: 10px calc((${C} + 2) * 1px);
	}
`});var Rn,na,An,ra,Fn,sa,aa=c(()=>{L();Bp();Hp();Vp();Rn=class extends Qe{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=fn.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}},na=Rn.compose({baseName:"panels",template:ru,styles:Lp}),An=class extends ai{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}},ra=An.compose({baseName:"panel-tab",template:tu,styles:Np}),Fn=class extends mn{},sa=Fn.compose({baseName:"panel-view",template:Zh,styles:_p})});var zp,Up=c(()=>{g();L();he();zp=(o,e)=>E`
	${H("flex")} :host {
		align-items: center;
		outline: none;
		height: calc(${C} * 7px);
		width: calc(${C} * 7px);
		margin: 0;
	}
	.progress {
		height: 100%;
		width: 100%;
	}
	.background {
		fill: none;
		stroke: transparent;
		stroke-width: calc(${C} / 2 * 1px);
	}
	.indeterminate-indicator-1 {
		fill: none;
		stroke: ${dp};
		stroke-width: calc(${C} / 2 * 1px);
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
`});var Ln,la,ca=c(()=>{L();Up();Ln=class extends Tt{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,i){e==="value"&&this.removeAttribute("value")}},la=Ln.compose({baseName:"progress-ring",template:ch,styles:zp,indeterminateIndicator:`
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
	`})});var jp,Gp=c(()=>{g();L();he();jp=(o,e)=>E`
	${H("flex")} :host {
		align-items: flex-start;
		margin: calc(${C} * 1px) 0;
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
		color: ${q};
		font-size: ${j};
		margin: calc(${C} * 1px) 0;
	}
`});var Bn,da,ha=c(()=>{R();L();Gp();Bn=class extends it{connectedCallback(){super.connectedCallback();let e=this.querySelector("label");if(e){let t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}},da=Bn.compose({baseName:"radio-group",template:fh,styles:jp})});var qp,Wp=c(()=>{g();L();he();qp=(o,e)=>E`
	${H("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${j};
		line-height: ${W};
		margin: calc(${C} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${rt};
		border-radius: 999px;
		border: calc(${S} * 1px) solid ${Xt};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${C} * 4px);
		position: relative;
		outline: none;
		width: calc(${C} * 4px);
	}
	.label {
		color: ${q};
		cursor: pointer;
		font-family: ${J};
		margin-inline-end: calc(${C} * 2px + 2px);
		padding-inline-start: calc(${C} * 2px + 2px);
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
		background: ${q};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${C} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${rt};
		border-color: ${Xt};
	}
	:host(:not([disabled])) .control:active {
		background: ${rt};
		border-color: ${V};
	}
	:host(:${G}) .control {
		border: calc(${S} * 1px) solid ${V};
	}
	:host([aria-checked='true']) .control {
		background: ${rt};
		border: calc(${S} * 1px) solid ${Xt};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${rt};
		border: calc(${S} * 1px) solid ${Xt};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${rt};
		border: calc(${S} * 1px) solid ${V};
	}
	:host([aria-checked="true"]:${G}:not([disabled])) .control {
		border: calc(${S} * 1px) solid ${V};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Pe};
	}
	:host([aria-checked='true']) .checked-indicator {
		opacity: 1;
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
`});var Nn,ua,pa=c(()=>{L();Wp();Nn=class extends mo{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}},ua=Nn.compose({baseName:"radio",template:yh,styles:qp,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`})});var Yp,Xp=c(()=>{g();L();he();Yp=(o,e)=>E`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${J};
		font-size: ${vn};
		line-height: ${yn};
	}
	.control {
		background-color: ${xn};
		border: calc(${S} * 1px) solid ${Bo};
		border-radius: ${pp};
		color: ${Cn};
		padding: calc(${C} * 0.5px) calc(${C} * 1px);
		text-transform: uppercase;
	}
`});var Hn,ma,fa=c(()=>{L();Xp();Hn=class extends wt{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}},ma=Hn.compose({baseName:"tag",template:_i,styles:Yp})});var Qp,Zp=c(()=>{g();L();he();Qp=(o,e)=>E`
	${H("inline-block")} :host {
		font-family: ${J};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${kn};
		background: ${Et};
		border-radius: calc(${ft} * 1px);
		border: calc(${S} * 1px) solid ${st};
		font: inherit;
		font-size: ${j};
		line-height: ${W};
		padding: calc(${C} * 2px + 1px);
		width: 100%;
		min-width: ${Lo};
		resize: none;
	}
	.control:hover:enabled {
		background: ${Et};
		border-color: ${st};
	}
	.control:active:enabled {
		background: ${Et};
		border-color: ${V};
	}
	.control:hover,
	.control:${G},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${Wu};
		height: ${Yu};
	}
	.control::-webkit-scrollbar-corner {
		background: ${Et};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${Xu};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${Qu};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${Zu};
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
		color: ${q};
		cursor: pointer;
		font-size: ${j};
		line-height: ${W};
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
		cursor: ${Pe};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${st};
	}
`});var _n,ga,ba=c(()=>{L();Zp();_n=class extends me{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}},ga=_n.compose({baseName:"text-area",template:hu,styles:Qp,shadowOptions:{delegatesFocus:!0}})});var Jp,Kp=c(()=>{g();L();he();Jp=(o,e)=>E`
	${H("inline-block")} :host {
		font-family: ${J};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${kn};
		background: ${Et};
		border-radius: calc(${ft} * 1px);
		border: calc(${S} * 1px) solid ${st};
		height: calc(${Fo} * 1px);
		min-width: ${Lo};
	}
	.control {
		-webkit-appearance: none;
		font: inherit;
		background: transparent;
		border: 0;
		color: inherit;
		height: calc(100% - (${C} * 1px));
		width: 100%;
		margin-top: auto;
		margin-bottom: auto;
		border: none;
		padding: 0 calc(${C} * 2px + 1px);
		font-size: ${j};
		line-height: ${W};
	}
	.control:hover,
	.control:${G},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${q};
		cursor: pointer;
		font-size: ${j};
		line-height: ${W};
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
		width: calc(${C} * 4px);
		height: calc(${C} * 4px);
	}
	.start {
		margin-inline-start: calc(${C} * 2px);
	}
	.end {
		margin-inline-end: calc(${C} * 2px);
	}
	:host(:hover:not([disabled])) .root {
		background: ${Et};
		border-color: ${st};
	}
	:host(:active:not([disabled])) .root {
		background: ${Et};
		border-color: ${V};
	}
	:host(:focus-within:not([disabled])) .root {
		border-color: ${V};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Pe};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${st};
	}
`});var Vn,va,ya=c(()=>{L();Kp();Vn=class extends ke{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}},va=Vn.compose({baseName:"text-field",template:mu,styles:Jp,shadowOptions:{delegatesFocus:!0}})});var Hf,em=c(()=>{Vs();Us();Gs();Xs();Zs();Ks();ta();ia();aa();ca();ha();pa();fa();ba();ya();Hf={vsCodeBadge:_s,vsCodeButton:zs,vsCodeCheckbox:js,vsCodeDataGrid:qs,vsCodeDataGridCell:Ys,vsCodeDataGridRow:Ws,vsCodeDivider:Qs,vsCodeDropdown:Js,vsCodeLink:ea,vsCodeOption:oa,vsCodePanels:na,vsCodePanelTab:ra,vsCodePanelView:sa,vsCodeProgressRing:la,vsCodeRadioGroup:da,vsCodeRadio:ua,vsCodeTag:ma,vsCodeTextArea:ga,vsCodeTextField:va,register(o,...e){if(o)for(let t in this)t!=="register"&&this[t]().register(o,...e)}}});var tm={};mm(tm,{Badge:()=>$n,Button:()=>hi,Checkbox:()=>Tn,DataGrid:()=>In,DataGridCell:()=>Pn,DataGridCellTypes:()=>tt,DataGridRow:()=>Sn,DataGridRowTypes:()=>kt,Divider:()=>En,DividerRole:()=>Ji,Dropdown:()=>Mn,DropdownPosition:()=>ht,GenerateHeaderOptions:()=>lo,Link:()=>Dn,Option:()=>On,PanelTab:()=>An,PanelView:()=>Fn,Panels:()=>Rn,ProgressRing:()=>Ln,Radio:()=>Nn,RadioGroup:()=>Bn,RadioGroupOrientation:()=>U,Tag:()=>Hn,TextArea:()=>_n,TextAreaResize:()=>Ro,TextField:()=>Vn,TextFieldType:()=>on,allComponents:()=>Hf,provideVSCodeDesignSystem:()=>Af,vsCodeBadge:()=>_s,vsCodeButton:()=>zs,vsCodeCheckbox:()=>js,vsCodeDataGrid:()=>qs,vsCodeDataGridCell:()=>Ys,vsCodeDataGridRow:()=>Ws,vsCodeDivider:()=>Qs,vsCodeDropdown:()=>Js,vsCodeLink:()=>ea,vsCodeOption:()=>oa,vsCodePanelTab:()=>ra,vsCodePanelView:()=>sa,vsCodePanels:()=>na,vsCodeProgressRing:()=>la,vsCodeRadio:()=>ua,vsCodeRadioGroup:()=>da,vsCodeTag:()=>ma,vsCodeTextArea:()=>ga,vsCodeTextField:()=>va});var om=c(()=>{Hu();em();Vs();Us();Gs();Xs();Zs();Ks();ta();ia();aa();ca();ha();pa();fa();ba();ya()});var ka={$schema:"http://json-schema.org/draft-07/schema#",description:"Model pricing data - costs per million tokens. Each model has direct provider/API pricing at the top level (used as a reference); models billed through GitHub Copilot AI Credits also include a `copilotPricing` block reflecting GitHub's published per-token rates (1 AI credit = $0.01).",metadata:{lastUpdated:"2026-06-10",sources:[{name:"OpenAI API Pricing",url:"https://developers.openai.com/api/docs/pricing",retrievedDate:"2026-04-24"},{name:"Mistral AI API Pricing",url:"https://pricepertoken.com/pricing-page/provider/mistral-ai",retrievedDate:"2026-05-06",note:"Cross-referenced with https://openrouter.ai/mistralai and https://ai-pricing.info/mistral"},{name:"Anthropic Claude Pricing",url:"https://www.anthropic.com/pricing",note:"Standard rates; also see https://platform.claude.com/docs/en/about-claude/pricing",retrievedDate:"2026-03-30"},{name:"Google AI Gemini API Pricing",url:"https://ai.google.dev/gemini-api/docs/pricing",retrievedDate:"2026-03-30"},{name:"xAI Grok API Pricing",url:"https://x.ai/api",retrievedDate:"2026-03-30"},{name:"GitHub Copilot Supported Models",url:"https://docs.github.com/en/copilot/reference/ai-models/supported-models",retrievedDate:"2026-03-30",note:"Source for tier/multiplier data"},{name:"GitHub Copilot Premium Requests",url:"https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests",retrievedDate:"2026-03-30",note:"Source for premium request multiplier values"},{name:"OpenRouter Model Pricing",url:"https://openrouter.ai",retrievedDate:"2026-03-30",note:"Cross-provider pricing aggregator used for verification"},{name:"GitHub Copilot Models and Pricing",url:"https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing",retrievedDate:"2026-04-27",note:"Source for the `copilotPricing` per-model block (GitHub AI Credit per-token rates)"}],disclaimer:"GitHub Copilot uses these models but pricing may differ from direct API usage. These are reference prices for cost estimation purposes only."},pricing:{"gpt-5":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5"]},"gpt-5-codex":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5 Codex (Preview)"]},"gpt-5-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GPT-5 models",tier:"standard",multiplier:0,displayNames:["GPT-5 Mini"],copilotPricing:{inputCostPerMillion:.25,cachedInputCostPerMillion:.025,outputCostPerMillion:2,releaseStatus:"GA",category:"Lightweight"}},"gpt-5.1":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1"]},"gpt-5.1-codex":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1 Codex"]},"gpt-5.1-codex-max":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1 Codex Max"]},"gpt-5.1-codex-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GPT-5 models",tier:"premium",multiplier:.33,displayNames:["GPT-5.1 Codex Mini (Preview)"]},"gpt-5.2":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.2"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"Closing down 2026-06-01",category:"Versatile"}},"gpt-5.2-codex":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.2 Codex"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"Closing down 2026-06-01",category:"Powerful"}},"gpt-5.2-pro":{inputCostPerMillion:21,outputCostPerMillion:168,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.2 Pro"]},"gpt-5.3-codex":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.3 Codex"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"GA",category:"Powerful"}},"gpt-5.4":{inputCostPerMillion:2.5,cachedInputCostPerMillion:.25,outputCostPerMillion:15,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.4"],copilotPricing:{inputCostPerMillion:2.5,cachedInputCostPerMillion:.25,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"gpt-5.4-mini":{inputCostPerMillion:.75,cachedInputCostPerMillion:.075,outputCostPerMillion:4.5,category:"GPT-5 models",tier:"standard",multiplier:.33,displayNames:["GPT-5.4 mini"],copilotPricing:{inputCostPerMillion:.75,cachedInputCostPerMillion:.075,outputCostPerMillion:4.5,releaseStatus:"GA",category:"Lightweight"}},"gpt-5.4-nano":{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.25,category:"GPT-5 models",tier:"standard",multiplier:.25,displayNames:["GPT-5.4 nano"],copilotPricing:{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.25,releaseStatus:"GA",category:"Lightweight"}},"gpt-4":{inputCostPerMillion:3,outputCostPerMillion:12,category:"GPT-4 models",tier:"unknown",multiplier:1,displayNames:["GPT-4"]},"gpt-4.1":{inputCostPerMillion:2,cachedInputCostPerMillion:.5,outputCostPerMillion:8,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1"],copilotPricing:{inputCostPerMillion:2,cachedInputCostPerMillion:.5,outputCostPerMillion:8,releaseStatus:"Closing down 2026-06-01",category:"Versatile"}},"gpt-4.1-mini":{inputCostPerMillion:.4,cachedInputCostPerMillion:.1,outputCostPerMillion:1.6,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1 Mini"]},"gpt-4.1-nano":{inputCostPerMillion:.1,cachedInputCostPerMillion:.025,outputCostPerMillion:.4,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1 Nano"]},"gpt-4o":{inputCostPerMillion:2.5,outputCostPerMillion:10,cachedInputCostPerMillion:1.25,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o"]},"gpt-4o-mini":{inputCostPerMillion:.15,outputCostPerMillion:.6,cachedInputCostPerMillion:.075,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o-mini","GPT-4o Mini"]},"gpt-4o-mini-2024-07-18":{inputCostPerMillion:.15,outputCostPerMillion:.6,cachedInputCostPerMillion:.075,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o-mini (2024-07-18)"]},"gpt-4-turbo":{inputCostPerMillion:10,outputCostPerMillion:30,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4 Turbo"]},"claude-sonnet-3.5":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"unknown",multiplier:1,displayNames:["Claude Sonnet 3.5"]},"claude-sonnet-3.7":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"unknown",multiplier:1,displayNames:["Claude Sonnet 3.7"]},"claude-sonnet-4":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"premium",multiplier:1,displayNames:["Claude Sonnet 4"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4.5":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.5"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4.6":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.6"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4-6":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.6 (alternate format)"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-haiku":{inputCostPerMillion:.25,outputCostPerMillion:1.25,cachedInputCostPerMillion:.025,cacheCreationCostPerMillion:.3125,category:"Claude models (Anthropic)",tier:"standard",multiplier:0,displayNames:["Claude Haiku"]},"claude-haiku-4.5":{inputCostPerMillion:1,outputCostPerMillion:5,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:.33,displayNames:["Claude Haiku 4.5"],copilotPricing:{inputCostPerMillion:1,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,outputCostPerMillion:5,releaseStatus:"GA",category:"Versatile"}},"claude-haiku-4-5-20251001":{inputCostPerMillion:1,outputCostPerMillion:5,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:.33,displayNames:["Claude Haiku 4.5 (2025-10-01)"],copilotPricing:{inputCostPerMillion:1,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,outputCostPerMillion:5,releaseStatus:"GA",category:"Versatile"}},"claude-opus-4.1":{inputCostPerMillion:15,outputCostPerMillion:75,cachedInputCostPerMillion:1.5,cacheCreationCostPerMillion:18.75,category:"Claude models (Anthropic)",tier:"premium",multiplier:10,displayNames:["Claude Opus 4.1"]},"claude-opus-4.5":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:3,displayNames:["Claude Opus 4.5"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.6":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:3,displayNames:["Claude Opus 4.6"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.7":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:15,displayNames:["Claude Opus 4.7"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.6-(fast-mode)-(preview)":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:30,displayNames:["Claude Opus 4.6 (Fast Mode Preview)"],copilotPricing:{inputCostPerMillion:30,cachedInputCostPerMillion:3,cacheCreationCostPerMillion:37.5,outputCostPerMillion:150,releaseStatus:"Public preview",category:"Powerful"}},"claude-opus-4.6-fast":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"premium",multiplier:30,displayNames:["Claude Opus 4.6 (Fast)"],copilotPricing:{inputCostPerMillion:30,cachedInputCostPerMillion:3,cacheCreationCostPerMillion:37.5,outputCostPerMillion:150,releaseStatus:"Public preview",category:"Powerful"}},"o3-mini":{inputCostPerMillion:1.1,outputCostPerMillion:4.4,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o3-mini"]},"o4-mini":{inputCostPerMillion:1.1,outputCostPerMillion:4.4,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o4-mini"]},"o1-preview":{inputCostPerMillion:15,outputCostPerMillion:60,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o1-preview"]},"o1-mini":{inputCostPerMillion:3,outputCostPerMillion:12,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o1-mini"]},"gpt-3.5-turbo":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Legacy models",tier:"standard",multiplier:0,displayNames:["GPT-3.5-Turbo","GPT-3.5 Turbo"]},"gemini-2.5-pro":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"Google Gemini models",tier:"standard",multiplier:1,displayNames:["Gemini 2.5 Pro"],copilotPricing:{inputCostPerMillion:1.25,cachedInputCostPerMillion:.125,outputCostPerMillion:10,releaseStatus:"GA",category:"Powerful"}},"gemini-2.5-flash":{inputCostPerMillion:.3,outputCostPerMillion:2.5,category:"Google Gemini models",tier:"unknown",multiplier:1,displayNames:["Gemini 2.5 Flash"]},"gemini-2.5-flash-lite":{inputCostPerMillion:.1,outputCostPerMillion:.4,category:"Google Gemini models",tier:"unknown",multiplier:1,displayNames:["Gemini 2.5 Flash Lite"]},"gemini-2.0-flash":{inputCostPerMillion:.1,outputCostPerMillion:.4,category:"Google Gemini models",tier:"standard",multiplier:0,displayNames:["Gemini 2.0 Flash"]},"gemini-2.0-flash-lite":{inputCostPerMillion:.075,outputCostPerMillion:.3,category:"Google Gemini models",tier:"standard",multiplier:0,displayNames:["Gemini 2.0 Flash Lite"]},"gemini-3-flash":{inputCostPerMillion:.5,outputCostPerMillion:3,category:"Google Gemini models",tier:"standard",multiplier:.33,displayNames:["Gemini 3 Flash"],copilotPricing:{inputCostPerMillion:.5,cachedInputCostPerMillion:.05,outputCostPerMillion:3,releaseStatus:"Public preview",category:"Lightweight"}},"gemini-3-pro":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"premium",multiplier:1,displayNames:["Gemini 3 Pro"]},"gemini-3-pro-preview":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"premium",multiplier:1,displayNames:["Gemini 3 Pro (Preview)"]},"gemini-3.1-pro":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"standard",multiplier:1,displayNames:["Gemini 3.1 Pro","Gemini 3.1 Pro (Preview)"],copilotPricing:{inputCostPerMillion:2,cachedInputCostPerMillion:.2,outputCostPerMillion:12,releaseStatus:"Public preview",category:"Powerful"}},"gemini-3.1-flash-lite":{inputCostPerMillion:.25,outputCostPerMillion:1.5,category:"Google Gemini models",tier:"unknown",multiplier:.33,displayNames:["Gemini 3.1 Flash Lite"]},"grok-code-fast-1":{inputCostPerMillion:.2,outputCostPerMillion:1.5,category:"xAI Grok models",tier:"premium",multiplier:.25,displayNames:["Grok Code Fast 1"],copilotPricing:{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.5,releaseStatus:"GA",category:"Lightweight"}},"raptor-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GitHub Copilot fine-tuned models",tier:"standard",multiplier:0,displayNames:["Raptor Mini"],copilotPricing:{inputCostPerMillion:.25,cachedInputCostPerMillion:.025,outputCostPerMillion:2,releaseStatus:"Public preview",category:"Versatile"}},goldeneye:{inputCostPerMillion:0,outputCostPerMillion:0,category:"GitHub Copilot fine-tuned models",tier:"standard",multiplier:0,copilotPricing:{inputCostPerMillion:1.25,cachedInputCostPerMillion:.125,outputCostPerMillion:10,releaseStatus:"Public preview",category:"Powerful"}},"gpt-5.5":{inputCostPerMillion:0,outputCostPerMillion:0,category:"GPT-5 models",tier:"standard",multiplier:7.5,displayNames:["GPT-5.5"]},"mistral-large-latest":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 3"]},"mistral-large-2512":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 3 (2512)"]},"mistral-large-2411":{inputCostPerMillion:2,outputCostPerMillion:6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 2.1"]},"magistral-medium-latest":{inputCostPerMillion:2,outputCostPerMillion:5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Magistral Medium"]},"mistral-medium-latest":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-3-5":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-3.5":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-2505":{inputCostPerMillion:.4,outputCostPerMillion:2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.1"]},"mistral-small-latest":{inputCostPerMillion:.1,outputCostPerMillion:.3,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 3.1"]},"mistral-small-2503":{inputCostPerMillion:.075,outputCostPerMillion:.2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 3.2"]},"mistral-small-2603":{inputCostPerMillion:.15,outputCostPerMillion:.6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 4"]},"codestral-latest":{inputCostPerMillion:.3,outputCostPerMillion:.9,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Codestral"]},"codestral-2501":{inputCostPerMillion:.3,outputCostPerMillion:.9,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Codestral (2501)"]},"open-mistral-nemo":{inputCostPerMillion:.02,outputCostPerMillion:.03,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Nemo"]},"ministral-3b-2410":{inputCostPerMillion:.04,outputCostPerMillion:.04,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Ministral 3B"]},"ministral-8b-2410":{inputCostPerMillion:.1,outputCostPerMillion:.1,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Ministral 8B"]},"magistral-small-latest":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Magistral Small"]},"devstral-medium-2507":{inputCostPerMillion:.4,outputCostPerMillion:2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Devstral Medium"]},"pixtral-large-2411":{inputCostPerMillion:2,outputCostPerMillion:6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Pixtral Large"]},"gemini-3.5-flash":{inputCostPerMillion:0,outputCostPerMillion:0,category:"Google Gemini models",tier:"standard",multiplier:14,displayNames:["Gemini 3.5 Flash"]},"claude-opus-4.8":{inputCostPerMillion:5,outputCostPerMillion:25,category:"Claude models (Anthropic)",tier:"standard",multiplier:15,displayNames:["Claude Opus 4.8"]},"qwen2.5":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["Qwen2.5"]},"mai-code-1-flash[^mai-code-1-flash]":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["MAI-Code-1-Flash[^mai-code-1-flash]"]},"mai-code-1-flash":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["MAI-Code-1-Flash"]},"claude-fable-5":{inputCostPerMillion:10,outputCostPerMillion:50,category:"Claude models (Anthropic)",tier:"standard",multiplier:0,displayNames:["Claude Fable 5"]}}};var qn={};for(let[o,e]of Object.entries(ka.pricing))e.displayNames&&e.displayNames.length>0&&(qn[o]=e.displayNames[0]);function $a(o){if(qn[o])return qn[o];try{return decodeURIComponent(o)}catch{return o}}var Ta={$schema:"http://json-schema.org/draft-07/schema#",description:"Character-to-token ratio estimators for different AI models. Used to estimate token counts from text length.",estimators:{"gpt-4":.25,"gpt-4.1":.25,"gpt-4.1-mini":.25,"gpt-4o":.25,"gpt-4o-mini":.25,"gpt-4-turbo":.25,"gpt-3.5-turbo":.25,"gpt-5":.25,"gpt-5-codex":.25,"gpt-5-mini":.25,"gpt-5.1":.25,"gpt-5.1-codex":.25,"gpt-5.1-codex-max":.25,"gpt-5.1-codex-mini":.25,"gpt-5.2":.25,"gpt-5.2-codex":.25,"gpt-5.2-pro":.25,"gpt-5.3-codex":.25,"gpt-5.4":.25,"gpt-5.4-mini":.25,"gpt-4.1-nano":.25,"gemini-2.0-flash":.25,"gemini-2.0-flash-lite":.25,"gemini-2.5-flash":.25,"gemini-2.5-flash-lite":.25,"claude-sonnet-3.5":.24,"claude-sonnet-3.7":.24,"claude-sonnet-4":.24,"claude-sonnet-4.5":.24,"claude-sonnet-4.6":.24,"claude-haiku":.24,"claude-haiku-4.5":.24,"claude-opus-4.1":.24,"claude-opus-4.5":.24,"claude-opus-4.6":.24,"claude-opus-4.6-(fast-mode)-(preview)":.24,"claude-opus-4.6-fast":.24,"gemini-2.5-pro":.25,"gemini-3-flash":.25,"gemini-3-pro":.25,"gemini-3-pro-preview":.25,"gemini-3.1-pro":.25,"gemini-3.1-flash-lite":.25,"grok-code-fast-1":.25,"raptor-mini":.25,goldeneye:.25,"o1-preview":.25,"o1-mini":.25,"o3-mini":.25,"o4-mini":.25,"gpt-5.5":.25,"mistral-large-latest":.25,"mistral-large-2512":.25,"mistral-large-2411":.25,"magistral-medium-latest":.25,"mistral-medium-latest":.25,"mistral-medium-3-5":.25,"mistral-medium-2505":.25,"mistral-small-latest":.25,"mistral-small-2503":.25,"mistral-small-2603":.25,"codestral-latest":.25,"codestral-2501":.25,"open-mistral-nemo":.25,"ministral-3b-2410":.25,"ministral-8b-2410":.25,"magistral-small-latest":.25,"devstral-medium-2507":.25,"pixtral-large-2411":.25,"gemini-3.5-flash":.25,"claude-opus-4.8":.24,"qwen2.5":.25,"mai-code-1-flash[^mai-code-1-flash]":.25,"mai-code-1-flash":.25,"claude-fable-5":.24}};var Ia={"VS Code":"\u{1F499}","VS Code Insiders":"\u{1F49A}","VS Code Exploration":"\u{1F9EA}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Cursor:"\u{1F5B1}\uFE0F","Copilot CLI":"\u{1F916}",OpenCode:"\u{1F7E2}","Visual Studio":"\u{1FA9F}","Claude Code":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}","Mistral Vibe":"\u{1F525}","Gemini CLI":"\u{1F48E}",Antigravity:"\u{1F680}",JetBrains:"\u{1F9E9}",Crush:"\u{1F9BE}",Windsurf:"\u{1F3C4}",Continue:"\u25B6\uFE0F",Pi:"\u03C0",Unknown:"\u2753"};function Sa(o){return Ia[o]??"\u{1F4DD}"}var bm=Ta.estimators,fi,Pa=!0;function Ea(o){Pa=o}function Ma(o){return Sa(o)}function Da(o){return 1/(bm[o]??.25)}function vm(o,e){return new Intl.NumberFormat(fi,{minimumFractionDigits:e,maximumFractionDigits:e}).format(o)}function ye(o,e=1){return`${vm(o,e)}%`}function Ke(o){return o.toLocaleString(fi)}function B(o){return Pa?new Intl.NumberFormat(fi,{notation:"compact",maximumFractionDigits:1}).format(o):Ke(o)}function bo(o){return new Intl.NumberFormat(fi,{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(o)}function ee(o,e,t){let i=document.createElement(o);return e&&(i.className=e),t!==void 0&&(i.textContent=t),i}function Dt(o,e,t){let i=document.createElement("vscode-button");if(typeof o=="string")i.id=o,i.textContent=e||"",t&&i.setAttribute("appearance",t);else{let n=o;i.id=n.id,i.textContent=n.label,n.appearance&&i.setAttribute("appearance",n.appearance),n.hidden&&(i.hidden=!0)}return i}var Ot={"btn-refresh":{id:"btn-refresh",label:"\u{1F504} Refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"\u{1F916} Details"},"btn-chart":{id:"btn-chart",label:"\u{1F4C8} Chart"},"btn-usage":{id:"btn-usage",label:"\u{1F4CA} Usage Analysis"},"btn-diagnostics":{id:"btn-diagnostics",label:"\u{1F50D} Diagnostics"},"btn-maturity":{id:"btn-maturity",label:"\u{1F3AF} Fluency Score"},"btn-dashboard":{id:"btn-dashboard",label:"\u{1F4CA} Team Dashboard"},"btn-level-viewer":{id:"btn-level-viewer",label:"\u{1F50D} Level Viewer"},"btn-environmental":{id:"btn-environmental",label:"\u{1F33F} Environmental Impact"}};function Oa(o){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let t=document.querySelector(".button-row");if(t)for(let i of e){let n=document.createElement("vscode-button");n.id=`ext-point-${i.id}`,n.textContent=i.label,n.addEventListener("click",()=>{o.postMessage({command:"extensionPointAction",buttonId:i.id})}),t.append(n)}}var Ra=`/**
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
`;var Aa=`body {
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
`;function Fa(o){return window[o]}function La(o){window.addEventListener("message",e=>{o(e.data)})}var Mt=acquireVsCodeApi(),Vo=Fa("__INITIAL_DETAILS__");console.log("[CopilotTokenTracker] details webview loaded");console.log("[CopilotTokenTracker] initialData:",Vo);console.log("[CopilotTokenTracker] initialData:",Vo);var mi=Vo?.sortSettings,ui=mi?.editor?.key??"name",Ho=mi?.editor?.dir??"asc",pi=mi?.model?.key??"name",_o=mi?.model?.dir??"asc",No=mi?.modelOtherExpanded??!1;function at(o){return o/30*365.25}function be(o,e){let t=document.createElement("td");return t.className="value-right align-right",t.textContent=o,e!==void 0&&t.append(ee("div","muted",e)),t}function _f(o,e,t,i){let n=document.createElement("td"),r=document.createElement("span");r.className="metric-label";let a=document.createElement("span");a.textContent=o,t&&(a.style.color=t);let l=document.createElement("span");if(l.textContent=e,i){r.title=i,r.style.cursor="help";let h=document.createElement("span");h.textContent=" \u2139\uFE0F",h.style.cssText="font-size:0.75em; opacity:0.6;",l.append(h)}return r.append(a,l),n.append(r),n}function sm(o,e,t,i){let n=document.createElement("thead"),r=document.createElement("tr"),a=[];function l(){a.forEach((h,u)=>{h.textContent=`${o[u].icon} ${o[u].text}${im(o[u].key,e(),t())}`})}return o.forEach((h,u)=>{let m=document.createElement("th");m.className=u===0?"":"align-right",m.style.cursor="pointer",m.style.userSelect="none",m.title=`Sort by ${h.text}`;let f=ee("div","period-header");f.textContent=`${h.icon} ${h.text}${im(h.key,e(),t())}`,m.append(f),a.push(f),m.addEventListener("click",()=>{i(h.key),l()}),r.append(m)}),n.append(r),{thead:n,updateHeaders:l}}function am(o){Ea(o.compactNumbers!==!1);let e=document.getElementById("root");if(!e)return;let t=Math.round(at(o.last30Days.tokens)),i=Math.round(at(o.last30Days.sessions)),n=at(o.last30Days.co2),r=at(o.last30Days.waterUsage),a=at(o.last30Days.estimatedCost),l=at(o.last30Days.estimatedCostCopilot??0),h=at(o.last30Days.treesEquivalent);Vf(e,o,{projectedTokens:t,projectedSessions:i,projectedCo2:n,projectedWater:r,projectedCost:a,projectedCostCopilot:l,projectedTrees:h}),Jf()}function Vf(o,e,t){let i=new Date(e.lastUpdated);o.replaceChildren();let n=document.createElement("style");n.textContent=Ra;let r=document.createElement("style");r.textContent=Aa;let a=ee("div","container"),l=ee("div","header"),h=ee("div","title","AI Engineering Fluency"),u=ee("div","button-row");u.append(Dt(Ot["btn-refresh"]),Dt(Ot["btn-chart"]),Dt(Ot["btn-usage"]),Dt(Ot["btn-environmental"]),Dt(Ot["btn-diagnostics"]),Dt(Ot["btn-maturity"])),e.backendConfigured&&u.append(Dt(Ot["btn-dashboard"])),l.append(h,u);let m=ee("div","footer",`Last updated: ${i.toLocaleString()} \xB7 Updates every 5 minutes`),f=ee("div","sections");(e.today.tokens??0)===0&&(e.last30Days.tokens??0)===0&&(e.lastMonth.tokens??0)===0&&f.append(Zf()),f.append(Gf(e,t));let $=Wf(e);$&&f.append($);let I=Qf(e);I&&f.append(I),a.append(l,f,m),o.append(n,r,a)}function lm(o){return Object.values(o.modelUsage).reduce((e,t)=>e+t.inputTokens,0)}function cm(o){return Object.values(o.modelUsage).reduce((e,t)=>e+t.outputTokens,0)}function xa(o){return(o.actualTokens||0)>0}function zn(o){return xa(o)?ye((o.actualTokens-o.estimatedTokens)/o.actualTokens*100):"\u2014"}function Un(o){return xa(o)?B(lm(o)):"\u2014"}function jn(o){return xa(o)?B(cm(o)):"\u2014"}function Gn(o){let e=lm(o)+cm(o);return B(e>0?e:o.tokens)}function zf(o){return o.today.cachedTokens||o.last30Days.cachedTokens||o.month.cachedTokens||o.lastMonth.cachedTokens?[{label:"Cached tokens",icon:"\u26A1",color:"#34d399",today:B(o.today.cachedTokens||0),last30Days:B(o.last30Days.cachedTokens||0),month:B(o.month.cachedTokens||0),lastMonth:B(o.lastMonth.cachedTokens||0),projected:"\u2014"}]:[]}function Uf(o){if(!o.copilotPlan)return[];let e=o.copilotPlan,t=e.monthlyAiCreditsUsd>0?`$${e.monthlyAiCreditsUsd} credits/month`:"no credits";return[{label:`${e.planName} (${t})`,labelTooltip:`Your active GitHub Copilot subscription plan (ID: ${e.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`,icon:"\u{1F3F7}\uFE0F",color:"#60a5fa",today:"\u2014",last30Days:"\u2014",month:"\u2014",lastMonth:"\u2014",projected:"\u2014"}]}function jf(o,e){return[{label:"Tokens (input+output)",icon:"\u{1F7E3}",color:"#c37bff",today:Gn(o.today),last30Days:Gn(o.last30Days),month:Gn(o.month),lastMonth:Gn(o.lastMonth),projected:B(e.projectedTokens)},{label:"Input tokens",icon:"\u2B06\uFE0F",color:"#c37bff",today:Un(o.today),last30Days:Un(o.last30Days),month:Un(o.month),lastMonth:Un(o.lastMonth),projected:"\u2014"},{label:"Output tokens",icon:"\u2B07\uFE0F",color:"#c37bff",today:jn(o.today),last30Days:jn(o.last30Days),month:jn(o.month),lastMonth:jn(o.lastMonth),projected:"\u2014"},...zf(o),{label:"Tokens (user estimated)",icon:"\u{1F4DD}",color:"#b39ddb",today:B(o.today.estimatedTokens),last30Days:B(o.last30Days.estimatedTokens),month:B(o.month.estimatedTokens),lastMonth:B(o.lastMonth.estimatedTokens),projected:"\u2014"},{label:"Service overhead %",icon:"\u2601\uFE0F",color:"#90a4ae",today:zn(o.today),last30Days:zn(o.last30Days),month:zn(o.month),lastMonth:zn(o.lastMonth),projected:"\u2014"},{label:"Thinking tokens",icon:"\u{1F9E0}",color:"#a78bfa",today:B(o.today.thinkingTokens||0),last30Days:B(o.last30Days.thinkingTokens||0),month:B(o.month.thinkingTokens||0),lastMonth:B(o.lastMonth.thinkingTokens||0),projected:"\u2014"},{label:"Estimated cost (UBB)",labelTooltip:"Based on GitHub Copilot AI Credit rates (1 credit = $0.01) \u2014 this is what Copilot will bill you. UBB = Usage Based Billing.",icon:"\u{1F7E2}",color:"#7ce38b",today:bo(o.today.estimatedCostCopilot??0),last30Days:bo(o.last30Days.estimatedCostCopilot??0),month:bo(o.month.estimatedCostCopilot??0),lastMonth:bo(o.lastMonth.estimatedCostCopilot??0),projected:bo(e.projectedCostCopilot??0)},...Uf(o),{label:"Sessions",icon:"\u{1F4C2}",color:"#66aaff",today:Ke(o.today.sessions),last30Days:Ke(o.last30Days.sessions),month:Ke(o.month.sessions),lastMonth:Ke(o.lastMonth.sessions),projected:Ke(e.projectedSessions)},{label:"Average interactions/session",icon:"\u{1F4AC}",color:"#8ce0ff",today:Ke(o.today.avgInteractionsPerSession),last30Days:Ke(o.last30Days.avgInteractionsPerSession),month:Ke(o.month.avgInteractionsPerSession),lastMonth:Ke(o.lastMonth.avgInteractionsPerSession),projected:"\u2014"},{label:"Average tokens/session",icon:"\u{1F522}",color:"#7ce38b",today:B(o.today.avgTokensPerSession),last30Days:B(o.last30Days.avgTokensPerSession),month:B(o.month.avgTokensPerSession),lastMonth:B(o.lastMonth.avgTokensPerSession),projected:"\u2014"}]}function Gf(o,e){let t=ee("div","section");t.append(ee("h3","","AI Engineering Fluency"));let i=document.createElement("table");i.className="stats-table";let n=document.createElement("thead"),r=document.createElement("tr");[{icon:"\u{1F4CA}",text:"Metric"},{icon:"\u{1F4C5}",text:"Today"},{icon:"\u{1F4C8}",text:"Last 30 Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month"},{icon:"\u{1F4C6}",text:"Previous Month"},{icon:"\u{1F30D}",text:"Projected Year"}].forEach((h,u)=>{let m=document.createElement("th");m.className=u===0?"":"align-right";let f=ee("div","period-header");f.textContent=`${h.icon} ${h.text}`,m.append(f),r.append(m)}),n.append(r),i.append(n);let l=document.createElement("tbody");return jf(o,e).forEach(h=>{let u=document.createElement("tr");u.append(_f(h.icon,h.label,h.color,h.labelTooltip),be(h.today),be(h.last30Days),be(h.month),be(h.lastMonth),be(h.projected)),l.append(u)}),i.append(l),t.append(i),t}function im(o,e,t){return o!==e?" \u2195":t==="asc"?" \u2191":" \u2193"}function Ca(){Mt.postMessage({command:"saveSortSettings",settings:{editor:{key:ui,dir:Ho},model:{key:pi,dir:_o},modelOtherExpanded:No}})}function qf(o,e){let{editor:t,todayUsage:i,last30DaysUsage:n,monthUsage:r,lastMonthUsage:a,projectedTokens:l,projectedSessions:h}=o,u=e.today>0?i.tokens/e.today*100:0,m=e.last30Days>0?n.tokens/e.last30Days*100:0,f=e.month>0?r.tokens/e.month*100:0,y=e.lastMonth>0?a.tokens/e.lastMonth*100:0,$=document.createElement("tr");t==="JetBrains"&&($.title="JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available."),t==="Antigravity"&&($.title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."),t==="Cursor"&&($.title="Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.");let I=document.createElement("td"),N=document.createElement("span");return N.className="metric-label",N.textContent=`${Ma(t)} ${t}`,(t==="JetBrains"||t==="Antigravity"||t==="Cursor")&&(N.textContent=`${N.textContent} \u24D8`),I.append(N),$.append(I,be(B(i.tokens),`${ye(u)} \xB7 ${i.sessions} sessions`),be(B(n.tokens),`${ye(m)} \xB7 ${n.sessions} sessions`),be(B(r.tokens),`${ye(f)} \xB7 ${r.sessions} sessions`),be(B(a.tokens),`${ye(y)} \xB7 ${a.sessions} sessions`),be(B(l),`${h} sessions`)),$}function nm(o,e){let t={today:Object.values(o.today.editorUsage).reduce((r,a)=>r+a.tokens,0),last30Days:Object.values(o.last30Days.editorUsage).reduce((r,a)=>r+a.tokens,0),month:Object.values(o.month.editorUsage).reduce((r,a)=>r+a.tokens,0),lastMonth:Object.values(o.lastMonth.editorUsage).reduce((r,a)=>r+a.tokens,0)},i=e.map(r=>{let a=o.today.editorUsage[r]||{tokens:0,sessions:0},l=o.last30Days.editorUsage[r]||{tokens:0,sessions:0},h=o.month.editorUsage[r]||{tokens:0,sessions:0},u=o.lastMonth.editorUsage[r]||{tokens:0,sessions:0};return{editor:r,todayUsage:a,last30DaysUsage:l,monthUsage:h,lastMonthUsage:u,projectedTokens:Math.round(at(l.tokens)),projectedSessions:Math.round(at(l.sessions))}});i.sort((r,a)=>{let l;switch(ui){case"name":l=r.editor.localeCompare(a.editor);break;case"today":l=r.todayUsage.tokens-a.todayUsage.tokens;break;case"last30Days":l=r.last30DaysUsage.tokens-a.last30DaysUsage.tokens;break;case"month":l=r.monthUsage.tokens-a.monthUsage.tokens;break;case"lastMonth":l=r.lastMonthUsage.tokens-a.lastMonthUsage.tokens;break;case"projected":l=r.projectedTokens-a.projectedTokens;break;default:l=0}return Ho==="asc"?l:-l});let n=document.createElement("tbody");return i.forEach(r=>n.append(qf(r,t))),n}function Wf(o){let e=new Set([...Object.keys(o.today.editorUsage),...Object.keys(o.last30Days.editorUsage),...Object.keys(o.month.editorUsage),...Object.keys(o.lastMonth.editorUsage)]);if(e.size===0)return null;let t=ee("div","section"),i=ee("h3");i.textContent="\u{1F4BB} Usage by Editor",t.append(i);let n=document.createElement("table");n.className="stats-table";let r=[{icon:"\u{1F4DD}",text:"Editor",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}],{thead:a}=sm(r,()=>ui,()=>Ho,l=>{ui===l?Ho=Ho==="asc"?"desc":"asc":(ui=l,Ho=l==="name"?"asc":"desc");let h=nm(o,Array.from(e)),u=n.querySelector("tbody");u?n.replaceChild(h,u):n.append(h),Ca()});return n.append(a),n.append(nm(o,Array.from(e))),t.append(n),t}var rm=5;function dm(o,e){let t=o.today.modelUsage[e]||{inputTokens:0,outputTokens:0},i=o.last30Days.modelUsage[e]||{inputTokens:0,outputTokens:0},n=o.month.modelUsage[e]||{inputTokens:0,outputTokens:0},r=o.lastMonth.modelUsage[e]||{inputTokens:0,outputTokens:0},a=t.inputTokens+t.outputTokens,l=i.inputTokens+i.outputTokens,h=n.inputTokens+n.outputTokens,u=r.inputTokens+r.outputTokens;return{model:e,todayTotal:a,todayInputPct:a>0?t.inputTokens/a*100:0,todayOutputPct:a>0?t.outputTokens/a*100:0,last30DaysTotal:l,last30DaysInputPct:l>0?i.inputTokens/l*100:0,last30DaysOutputPct:l>0?i.outputTokens/l*100:0,monthTotal:h,monthInputPct:h>0?n.inputTokens/h*100:0,monthOutputPct:h>0?n.outputTokens/h*100:0,lastMonthTotal:u,lastMonthInputPct:u>0?r.inputTokens/u*100:0,lastMonthOutputPct:u>0?r.outputTokens/u*100:0,projected:Math.round(at(l)),charsPerToken:Da(e)}}function hm(o){o.sort((e,t)=>{let i;switch(pi){case"name":i=e.model.localeCompare(t.model);break;case"today":i=e.todayTotal-t.todayTotal;break;case"last30Days":i=e.last30DaysTotal-t.last30DaysTotal;break;case"month":i=e.monthTotal-t.monthTotal;break;case"lastMonth":i=e.lastMonthTotal-t.lastMonthTotal;break;case"projected":i=e.projected-t.projected;break;default:i=0}return _o==="asc"?i:-i})}function um(o,e){let t=document.createElement("tr");e&&(t.style.opacity="0.85");let i=document.createElement("td"),n=document.createElement("span");if(n.className="metric-label",e){let a=document.createElement("span");a.style.cssText="display:inline-block;width:12px",n.append(a)}let r=document.createElement("span");return r.style.cssText="color:#9aa0a6;font-size:11px;font-weight:500;",r.textContent=`(~${o.charsPerToken.toFixed(1)} chars/tk)`,n.append(document.createTextNode(`${$a(o.model)} `),r),i.append(n),t.append(i,be(B(o.todayTotal),`\u2191${ye(o.todayInputPct)} \u2193${ye(o.todayOutputPct)}`),be(B(o.last30DaysTotal),`\u2191${ye(o.last30DaysInputPct)} \u2193${ye(o.last30DaysOutputPct)}`),be(B(o.monthTotal),`\u2191${ye(o.monthInputPct)} \u2193${ye(o.monthOutputPct)}`),be(B(o.lastMonthTotal),`\u2191${ye(o.lastMonthInputPct)} \u2193${ye(o.lastMonthOutputPct)}`),be(B(o.projected))),t}function Yf(o,e,t,i){let n=Ve=>e.reduce((ve,Je)=>{let wa=o[Ve].modelUsage[Je]||{inputTokens:0,outputTokens:0};return{inputTokens:ve.inputTokens+wa.inputTokens,outputTokens:ve.outputTokens+wa.outputTokens}},{inputTokens:0,outputTokens:0}),r=(Ve,ve)=>ve>0?Ve/ve*100:0,a=n("today"),l=n("last30Days"),h=n("month"),u=n("lastMonth"),m=a.inputTokens+a.outputTokens,f=l.inputTokens+l.outputTokens,y=h.inputTokens+h.outputTokens,$=u.inputTokens+u.outputTokens,I=document.createElement("tr");I.style.cursor="pointer",I.style.background="var(--list-hover-bg)",I.title=No?"Collapse other models":"Expand other models";let N=document.createElement("span");N.className="metric-label";let Q=document.createElement("span");Q.style.cssText="color:var(--text-secondary);font-weight:600;",Q.textContent=`\u{1F4E6} Other (${e.length} model${e.length!==1?"s":""})`;let _e=document.createElement("span");_e.style.cssText="font-size:10px;color:var(--text-muted)",_e.textContent=` ${No?"\u25B2":"\u25BC"}`,N.append(Q,_e);let Ze=document.createElement("td");Ze.append(N);let go=(Ve,ve)=>{let Je=be(B(ve));return ve>0&&Je.append(ee("div","muted",`\u2191${ye(r(Ve.inputTokens,ve))} \u2193${ye(r(Ve.outputTokens,ve))}`)),Je};if(I.append(Ze,go(a,m),go(l,f),go(h,y),go(u,$),be(B(Math.round(at(f))))),I.addEventListener("click",()=>{No=!No,Ca(),t()}),i.append(I),No){let Ve=e.map(ve=>dm(o,ve));hm(Ve),Ve.forEach(ve=>i.append(um(ve,!0)))}}function Xf(o,e,t,i){let n=e.map(a=>dm(o,a));hm(n);let r=document.createElement("tbody");return n.forEach(a=>r.append(um(a,!1))),t.length>0&&Yf(o,t,i,r),r}function Qf(o){let e=new Set([...Object.keys(o.today.modelUsage),...Object.keys(o.last30Days.modelUsage),...Object.keys(o.month.modelUsage),...Object.keys(o.lastMonth.modelUsage)]);if(e.size===0)return null;let t=Array.from(e).sort((f,y)=>{let $=o.last30Days.modelUsage[f]||{inputTokens:0,outputTokens:0},I=o.last30Days.modelUsage[y]||{inputTokens:0,outputTokens:0};return I.inputTokens+I.outputTokens-($.inputTokens+$.outputTokens)}),i=t.slice(0,rm),n=t.slice(rm),r=ee("div","section"),a=ee("h3");a.textContent="\u{1F3AF} Model Usage (Tokens)",r.append(a);let l=document.createElement("table");l.className="stats-table";let h=[{icon:"\u{1F9E0}",text:"Model",key:"name"},{icon:"\u{1F4C5}",text:"Today",key:"today"},{icon:"\u{1F4C8}",text:"Last 30 Days",key:"last30Days"},{icon:"\u{1F5D3}\uFE0F",text:"Current Month",key:"month"},{icon:"\u{1F4C6}",text:"Previous Month",key:"lastMonth"},{icon:"\u{1F30D}",text:"Projected Year",key:"projected"}];function u(){let f=Xf(o,i,n,u),y=l.querySelector("tbody");y?l.replaceChild(f,y):l.append(f)}let{thead:m}=sm(h,()=>pi,()=>_o,f=>{pi===f?_o=_o==="asc"?"desc":"asc":(pi=f,_o=f==="name"?"asc":"desc"),u(),Ca()});return l.append(m),u(),r.append(l),r}function Zf(){let o=ee("div","section"),e=ee("div","empty-state"),t=ee("div","empty-state-title","\u{1F44B} Welcome to AI Engineering Fluency"),i=ee("p","empty-state-description","This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet."),n=document.createElement("p");n.className="empty-state-description";let r=document.createElement("strong");r.textContent="Supported tools & editors:",n.append(r);let a=document.createElement("ul");a.className="empty-state-steps",["\uFFFD\uFFFD VS Code / VS Code Insiders / VSCodium \u2014 GitHub Copilot Chat extension","\u{1F5B1}\uFE0F Cursor, \u{1F30A} Windsurf \u2014 built-in AI chat","\u{1F5A5}\uFE0F Visual Studio 2022+ \u2014 GitHub Copilot Chat extension","\u{1F7E2} OpenCode, \u{1F980} Crush \u2014 terminal-based coding agents","\u{1F916} Claude Code \u2014 Anthropic's CLI coding agent","\u{1F48E} Gemini CLI \u2014 Google's open-source CLI coding agent","\u{1F680} Antigravity \u2014 Google's Gemini-powered desktop IDE","\u03C0 Pi \u2014 Mistral-powered terminal coding agent","\u{1F4BB} Copilot CLI \u2014 GitHub Copilot in the terminal"].forEach($=>{let I=document.createElement("li");I.textContent=$,a.append(I)});let h=document.createElement("p");h.className="empty-state-description";let u=document.createElement("strong");u.textContent="To get started:",h.append(u);let m=document.createElement("ol");m.className="empty-state-steps",["Use any of the supported tools or editors listed above to interact with an AI model.","For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.","For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.","Click the \u{1F504} Refresh button above to reload the stats after your first session."].forEach($=>{let I=document.createElement("li");I.textContent=$,m.append(I)});let y=ee("div","empty-state-note","\u{1F4A1} If you have been using one of the supported tools but still see no data, open the Diagnostics panel (\u{1F50D} Diagnostics button above) to verify that session files are being discovered correctly.");return e.append(t,i,n,a,h,m,y),o.append(e),o}function Jf(){let o=document.getElementById("btn-refresh"),e=document.getElementById("btn-chart"),t=document.getElementById("btn-usage"),i=document.getElementById("btn-diagnostics");o?.addEventListener("click",()=>Mt.postMessage({command:"refresh"})),e?.addEventListener("click",()=>Mt.postMessage({command:"showChart"})),t?.addEventListener("click",()=>Mt.postMessage({command:"showUsageAnalysis"})),i?.addEventListener("click",()=>Mt.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>Mt.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>Mt.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>Mt.postMessage({command:"showEnvironmental"})),Oa(Mt)}async function Kf(){console.log("[CopilotTokenTracker] bootstrap called");let{provideVSCodeDesignSystem:o,vsCodeButton:e,vsCodeBadge:t}=await Promise.resolve().then(()=>(om(),tm));if(o().register(e(),t()),Vo)console.log("[CopilotTokenTracker] Rendering details with initialData:",Vo),am(Vo);else{console.warn("[CopilotTokenTracker] No initialData found, rendering fallback.");let i=document.getElementById("root");if(i){i.textContent="";let n=document.createElement("div");n.style.padding="16px",n.style.color="#e7e7e7",n.textContent="No data available.",i.append(n)}}}La(o=>{o.command==="updateStats"&&am(o.data)});Kf();})();
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
