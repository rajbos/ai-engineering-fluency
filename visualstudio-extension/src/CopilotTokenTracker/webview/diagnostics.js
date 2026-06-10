"use strict";(()=>{var Af=Object.defineProperty;var c=(o,e)=>()=>(o&&(e=o(o=0)),e);var Ff=(o,e)=>{for(var t in e)Af(o,t,{get:e[t],enumerable:!0})};function gi(){let o=new WeakMap;return function(e){let t=o.get(e);if(t===void 0){let i=Reflect.getPrototypeOf(e);for(;t===void 0&&i!==null;)t=o.get(i),i=Reflect.getPrototypeOf(i);t=t===void 0?[]:t.slice(0),o.set(e,t)}return t}}var Ye,ja,jt,ze,dt=c(()=>{Ye=(function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}})();Ye.trustedTypes===void 0&&(Ye.trustedTypes={createPolicy:(o,e)=>e});ja={configurable:!1,enumerable:!1,writable:!1};Ye.FAST===void 0&&Reflect.defineProperty(Ye,"FAST",Object.assign({value:Object.create(null)},ja));jt=Ye.FAST;if(jt.getById===void 0){let o=Object.create(null);Reflect.defineProperty(jt,"getById",Object.assign({value(e,t){let i=o[e];return i===void 0&&(i=t?o[e]=t():null),i}},ja))}ze=Object.freeze([])});var Qn,qa,Xn,No,Zn,vi,y,He=c(()=>{dt();Qn=Ye.FAST.getById(1,()=>{let o=[],e=[];function t(){if(e.length)throw e.shift()}function i(a){try{a.call()}catch(l){e.push(l),setTimeout(t,0)}}function n(){let l=0;for(;l<o.length;)if(i(o[l]),l++,l>1024){for(let u=0,h=o.length-l;u<h;u++)o[u]=o[u+l];o.length-=l,l=0}o.length=0}function s(a){o.length<1&&Ye.requestAnimationFrame(n),o.push(a)}return Object.freeze({enqueue:s,process:n})}),qa=Ye.trustedTypes.createPolicy("fast-html",{createHTML:o=>o}),Xn=qa,No=`fast-${Math.random().toString(36).substring(2,8)}`,Zn=`${No}{`,vi=`}${No}`,y=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(o){if(Xn!==qa)throw new Error("The HTML policy can only be set once.");Xn=o},createHTML(o){return Xn.createHTML(o)},isMarker(o){return o&&o.nodeType===8&&o.data.startsWith(No)},extractDirectiveIndexFromMarker(o){return parseInt(o.data.replace(`${No}:`,""))},createInterpolationPlaceholder(o){return`${Zn}${o}${vi}`},createCustomAttributePlaceholder(o,e){return`${o}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(o){return`<!--${No}:${o}-->`},queueUpdate:Qn.enqueue,processUpdates:Qn.process,nextUpdate(){return new Promise(Qn.enqueue)},setAttribute(o,e,t){t==null?o.removeAttribute(e):o.setAttribute(e,t)},setBooleanAttribute(o,e,t){t?o.setAttribute(e,""):o.removeAttribute(e)},removeChildNodes(o){for(let e=o.firstChild;e!==null;e=o.firstChild)o.removeChild(e)},createTemplateWalker(o){return document.createTreeWalker(o,133,null,!1)}})});var It,uo,Vo=c(()=>{It=class{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.spillover===void 0?this.sub1===e||this.sub2===e:this.spillover.indexOf(e)!==-1}subscribe(e){let t=this.spillover;if(t===void 0){if(this.has(e))return;if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.sub1=void 0,this.sub2=void 0}else t.indexOf(e)===-1&&t.push(e)}unsubscribe(e){let t=this.spillover;if(t===void 0)this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0);else{let i=t.indexOf(e);i!==-1&&t.splice(i,1)}}notify(e){let t=this.spillover,i=this.source;if(t===void 0){let n=this.sub1,s=this.sub2;n!==void 0&&n.handleChange(i,e),s!==void 0&&s.handleChange(i,e)}else for(let n=0,s=t.length;n<s;++n)t[n].handleChange(i,e)}},uo=class{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;let i=this.subscribers[e];i!==void 0&&i.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var i;if(t){let n=this.subscribers[t];n===void 0&&(this.subscribers[t]=n=new It(this.source)),n.subscribe(e)}else this.sourceSubscribers=(i=this.sourceSubscribers)!==null&&i!==void 0?i:new It(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var i;if(t){let n=this.subscribers[t];n!==void 0&&n.unsubscribe(e)}else(i=this.sourceSubscribers)===null||i===void 0||i.unsubscribe(e)}}});function p(o,e){C.defineProperty(o,e)}function Wa(o,e,t){return Object.assign({},t,{get:function(){return C.trackVolatile(),t.get.apply(this)}})}var C,Ga,Tt,Et,tt=c(()=>{He();dt();Vo();C=jt.getById(2,()=>{let o=/(:|&&|\|\||if)/,e=new WeakMap,t=y.queueUpdate,i,n=h=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function s(h){let f=h.$fastController||e.get(h);return f===void 0&&(Array.isArray(h)?f=n(h):e.set(h,f=new uo(h))),f}let a=gi();class l{constructor(f){this.name=f,this.field=`_${f}`,this.callback=`${f}Changed`}getValue(f){return i!==void 0&&i.watch(f,this.name),f[this.field]}setValue(f,m){let b=this.field,S=f[b];if(S!==m){f[b]=m;let E=f[this.callback];typeof E=="function"&&E.call(f,S,m),s(f).notify(this.name)}}}class u extends It{constructor(f,m,b=!1){super(f,m),this.binding=f,this.isVolatileBinding=b,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(f,m){this.needsRefresh&&this.last!==null&&this.disconnect();let b=i;i=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;let S=this.binding(f,m);return i=b,S}disconnect(){if(this.last!==null){let f=this.first;for(;f!==void 0;)f.notifier.unsubscribe(this,f.propertyName),f=f.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(f,m){let b=this.last,S=s(f),E=b===null?this.first:{};if(E.propertySource=f,E.propertyName=m,E.notifier=S,S.subscribe(this,m),b!==null){if(!this.needsRefresh){let J;i=void 0,J=b.propertySource[b.propertyName],i=this,f===J&&(this.needsRefresh=!0)}b.next=E}this.last=E}handleChange(){this.needsQueue&&(this.needsQueue=!1,t(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let f=this.first;return{next:()=>{let m=f;return m===void 0?{value:void 0,done:!0}:(f=f.next,{value:m,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(h){n=h},getNotifier:s,track(h,f){i!==void 0&&i.watch(h,f)},trackVolatile(){i!==void 0&&(i.needsRefresh=!0)},notify(h,f){s(h).notify(f)},defineProperty(h,f){typeof f=="string"&&(f=new l(f)),a(h).push(f),Reflect.defineProperty(h,f.name,{enumerable:!0,get:function(){return f.getValue(this)},set:function(m){f.setValue(this,m)}})},getAccessors:a,binding(h,f,m=this.isVolatileBinding(h)){return new u(h,f,m)},isVolatileBinding(h){return o.test(h.toString())}})});Ga=jt.getById(3,()=>{let o=null;return{get(){return o},set(e){o=e}}}),Tt=class{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return Ga.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){Ga.set(e)}};C.defineProperty(Tt.prototype,"index");C.defineProperty(Tt.prototype,"length");Et=Object.seal(new Tt)});var Rt,ho,Dt,At=c(()=>{He();Rt=class{constructor(){this.targetIndex=0}},ho=class extends Rt{constructor(){super(...arguments),this.createPlaceholder=y.createInterpolationPlaceholder}},Dt=class extends Rt{constructor(e,t,i){super(),this.name=e,this.behavior=t,this.options=i}createPlaceholder(e){return y.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}});function zf(o,e){this.source=o,this.context=e,this.bindingObserver===null&&(this.bindingObserver=C.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(o,e))}function Hf(o,e){this.source=o,this.context=e,this.target.addEventListener(this.targetName,this)}function Nf(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function Vf(){this.bindingObserver.disconnect(),this.source=null,this.context=null;let o=this.target.$fastView;o!==void 0&&o.isComposed&&(o.unbind(),o.needsBindOnly=!0)}function _f(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function Uf(o){y.setAttribute(this.target,this.targetName,o)}function jf(o){y.setBooleanAttribute(this.target,this.targetName,o)}function qf(o){if(o==null&&(o=""),o.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=o.create():this.target.$fastTemplate!==o&&(e.isComposed&&(e.remove(),e.unbind()),e=o.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=o)}else{let e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=o}}function Gf(o){this.target[this.targetName]=o}function Wf(o){let e=this.classVersions||Object.create(null),t=this.target,i=this.version||0;if(o!=null&&o.length){let n=o.split(/\s+/);for(let s=0,a=n.length;s<a;++s){let l=n[s];l!==""&&(e[l]=i,t.classList.add(l))}}if(this.classVersions=e,this.version=i+1,i!==0){i-=1;for(let n in e)e[n]===i&&t.classList.remove(n)}}var qt,Jn,yi=c(()=>{He();tt();At();qt=class extends ho{constructor(e){super(),this.binding=e,this.bind=zf,this.unbind=Nf,this.updateTarget=Uf,this.isBindingVolatile=C.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=Gf,this.cleanedTargetName==="innerHTML"){let t=this.binding;this.binding=(i,n)=>y.createHTML(t(i,n))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=jf;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=Hf,this.unbind=_f;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=Wf);break}}targetAtContent(){this.updateTarget=qf,this.unbind=Vf}createBehavior(e){return new Jn(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}},Jn=class{constructor(e,t,i,n,s,a,l){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=i,this.bind=n,this.unbind=s,this.updateTarget=a,this.targetName=l}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){Tt.setEvent(e);let t=this.binding(this.source,this.context);Tt.setEvent(null),t!==!0&&e.preventDefault()}}});function Yf(o){if(o.length===1)return o[0];let e,t=o.length,i=o.map(a=>typeof a=="string"?()=>a:(e=a.targetName||e,a.binding)),n=(a,l)=>{let u="";for(let h=0;h<t;++h)u+=i[h](a,l);return u},s=new qt(n);return s.targetName=e,s}function Qa(o,e){let t=e.split(Zn);if(t.length===1)return null;let i=[];for(let n=0,s=t.length;n<s;++n){let a=t[n],l=a.indexOf(vi),u;if(l===-1)u=a;else{let h=parseInt(a.substring(0,l));i.push(o.directives[h]),u=a.substring(l+Qf)}u!==""&&i.push(u)}return i}function Ya(o,e,t=!1){let i=e.attributes;for(let n=0,s=i.length;n<s;++n){let a=i[n],l=a.value,u=Qa(o,l),h=null;u===null?t&&(h=new qt(()=>l),h.targetName=a.name):h=Yf(u),h!==null&&(e.removeAttributeNode(a),n--,s--,o.addFactory(h))}}function Xf(o,e,t){let i=Qa(o,e.textContent);if(i!==null){let n=e;for(let s=0,a=i.length;s<a;++s){let l=i[s],u=s===0?e:n.parentNode.insertBefore(document.createTextNode(""),n.nextSibling);typeof l=="string"?u.textContent=l:(u.textContent=" ",o.captureContentBinding(l)),n=u,o.targetIndex++,u!==e&&t.nextNode()}o.targetIndex--}}function Xa(o,e){let t=o.content;document.adoptNode(t);let i=es.borrow(e);Ya(i,o,!0);let n=i.behaviorFactories;i.reset();let s=y.createTemplateWalker(t),a;for(;a=s.nextNode();)switch(i.targetIndex++,a.nodeType){case 1:Ya(i,a);break;case 3:Xf(i,a,s);break;case 8:y.isMarker(a)&&i.addFactory(e[y.extractDirectiveIndexFromMarker(a)])}let l=0;(y.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),l=-1);let u=i.behaviorFactories;return i.release(),{fragment:t,viewBehaviorFactories:u,hostBehaviorFactories:n,targetOffset:l}}var Kn,es,Qf,ts=c(()=>{He();yi();Kn=null,es=class o{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){Kn=this}static borrow(e){let t=Kn||new o;return t.directives=e,t.reset(),Kn=null,t}};Qf=vi.length});var os,po,xi=c(()=>{os=document.createRange(),po=class{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{let t=this.lastChild;if(e.previousSibling===t)return;let i=e.parentNode,n=this.firstChild,s;for(;n!==t;)s=n.nextSibling,i.insertBefore(n,e),n=s;i.insertBefore(t,e)}}remove(){let e=this.fragment,t=this.lastChild,i=this.firstChild,n;for(;i!==t;)n=i.nextSibling,e.appendChild(i),i=n;e.appendChild(t)}dispose(){let e=this.firstChild.parentNode,t=this.lastChild,i=this.firstChild,n;for(;i!==t;)n=i.nextSibling,e.removeChild(i),i=n;e.removeChild(t);let s=this.behaviors,a=this.source;for(let l=0,u=s.length;l<u;++l)s[l].unbind(a)}bind(e,t){let i=this.behaviors;if(this.source!==e)if(this.source!==null){let n=this.source;this.source=e,this.context=t;for(let s=0,a=i.length;s<a;++s){let l=i[s];l.unbind(n),l.bind(e,t)}}else{this.source=e,this.context=t;for(let n=0,s=i.length;n<s;++n)i[n].bind(e,t)}}unbind(){if(this.source===null)return;let e=this.behaviors,t=this.source;for(let i=0,n=e.length;i<n;++i)e[i].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){os.setStartBefore(e[0].firstChild),os.setEndAfter(e[e.length-1].lastChild),os.deleteContents();for(let t=0,i=e.length;t<i;++t){let n=e[t],s=n.behaviors,a=n.source;for(let l=0,u=s.length;l<u;++l)s[l].unbind(a)}}}}});function k(o,...e){let t=[],i="";for(let n=0,s=o.length-1;n<s;++n){let a=o[n],l=e[n];if(i+=a,l instanceof wi){let u=l;l=()=>u}if(typeof l=="function"&&(l=new qt(l)),l instanceof ho){let u=Zf.exec(a);u!==null&&(l.targetName=u[2])}l instanceof Rt?(i+=l.createPlaceholder(t.length),t.push(l)):i+=l}return i+=o[o.length-1],new wi(i,t)}var wi,Zf,Za=c(()=>{He();tt();ts();xi();At();yi();wi=class{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let h,f=this.html;if(typeof f=="string"){h=document.createElement("template"),h.innerHTML=y.createHTML(f);let b=h.content.firstElementChild;b!==null&&b.tagName==="TEMPLATE"&&(h=b)}else h=f;let m=Xa(h,this.directives);this.fragment=m.fragment,this.viewBehaviorFactories=m.viewBehaviorFactories,this.hostBehaviorFactories=m.hostBehaviorFactories,this.targetOffset=m.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}let t=this.fragment.cloneNode(!0),i=this.viewBehaviorFactories,n=new Array(this.behaviorCount),s=y.createTemplateWalker(t),a=0,l=this.targetOffset,u=s.nextNode();for(let h=i.length;a<h;++a){let f=i[a],m=f.targetIndex;for(;u!==null;)if(l===m){n[a]=f.createBehavior(u);break}else u=s.nextNode(),l++}if(this.hasHostBehaviors){let h=this.hostBehaviorFactories;for(let f=0,m=h.length;f<m;++f,++a)n[a]=h[f].createBehavior(e)}return new po(t,n)}render(e,t,i){typeof t=="string"&&(t=document.getElementById(t)),i===void 0&&(i=t);let n=this.create(i);return n.bind(e,Et),n.appendTo(t),n}},Zf=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/});function ss(o){return o.map(e=>e instanceof ie?ss(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function Ja(o){return o.map(e=>e instanceof ie?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}function Ka(o){let e=[],t=[];return o.forEach(i=>(i[Ci]?e:t).push(i)),{prepend:e,append:t}}function Kf(){return`fast-style-class-${++Jf}`}var ie,Ci,el,tl,is,Jf,ns,ki=c(()=>{He();ie=class{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}};ie.create=(()=>{if(y.supportsAdoptedStyleSheets){let o=new Map;return e=>new is(e,o)}return o=>new ns(o)})();Ci=Symbol("prependToAdoptedStyleSheets");el=(o,e)=>{let{prepend:t,append:i}=Ka(e);o.adoptedStyleSheets=[...t,...o.adoptedStyleSheets,...i]},tl=(o,e)=>{o.adoptedStyleSheets=o.adoptedStyleSheets.filter(t=>e.indexOf(t)===-1)};if(y.supportsAdoptedStyleSheets)try{document.adoptedStyleSheets.push(),document.adoptedStyleSheets.splice(),el=(o,e)=>{let{prepend:t,append:i}=Ka(e);o.adoptedStyleSheets.splice(0,0,...t),o.adoptedStyleSheets.push(...i)},tl=(o,e)=>{for(let t of e){let i=o.adoptedStyleSheets.indexOf(t);i!==-1&&o.adoptedStyleSheets.splice(i,1)}}}catch{}is=class extends ie{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=Ja(e)}get styleSheets(){if(this._styleSheets===void 0){let e=this.styles,t=this.styleSheetCache;this._styleSheets=ss(e).map(i=>{if(i instanceof CSSStyleSheet)return i;let n=t.get(i);return n===void 0&&(n=new CSSStyleSheet,n.replaceSync(i),t.set(i,n)),n})}return this._styleSheets}addStylesTo(e){el(e,this.styleSheets),super.addStylesTo(e)}removeStylesFrom(e){tl(e,this.styleSheets),super.removeStylesFrom(e)}},Jf=0;ns=class extends ie{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=Ja(e),this.styleSheets=ss(e),this.styleClass=Kf()}addStylesTo(e){let t=this.styleSheets,i=this.styleClass;e=this.normalizeTarget(e);for(let n=0;n<t.length;n++){let s=document.createElement("style");s.innerHTML=t[n],s.className=i,e.append(s)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);let t=e.querySelectorAll(`.${this.styleClass}`);for(let i=0,n=t.length;i<n;++i)e.removeChild(t[i]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}});function d(o,e){let t;function i(n,s){arguments.length>1&&(t.property=s),_o.locate(n.constructor).push(t)}if(arguments.length>1){t={},i(o,e);return}return t=o===void 0?{}:o,i}var _o,Gt,F,$i,rs=c(()=>{tt();He();dt();_o=Object.freeze({locate:gi()}),Gt={toView(o){return o?"true":"false"},fromView(o){return!(o==null||o==="false"||o===!1||o===0)}},F={toView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e.toString()},fromView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e}},$i=class o{constructor(e,t,i=t.toLowerCase(),n="reflect",s){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=i,this.mode=n,this.converter=s,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,n==="boolean"&&s===void 0&&(this.converter=Gt)}setValue(e,t){let i=e[this.fieldName],n=this.converter;n!==void 0&&(t=n.fromView(t)),i!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](i,t),e.$fastController.notify(this.name))}getValue(e){return C.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){let t=this.mode,i=this.guards;i.has(e)||t==="fromView"||y.queueUpdate(()=>{i.add(e);let n=e[this.fieldName];switch(t){case"reflect":let s=this.converter;y.setAttribute(e,this.attribute,s!==void 0?s.toView(n):n);break;case"boolean":y.setBooleanAttribute(e,this.attribute,n);break}i.delete(e)})}static collect(e,...t){let i=[];t.push(_o.locate(e));for(let n=0,s=t.length;n<s;++n){let a=t[n];if(a!==void 0)for(let l=0,u=a.length;l<u;++l){let h=a[l];typeof h=="string"?i.push(new o(e,h)):i.push(new o(e,h.property,h.attribute,h.mode,h.converter))}}return i}}});var ol,il,as,ot,Si=c(()=>{dt();tt();ki();rs();ol={mode:"open"},il={},as=jt.getById(4,()=>{let o=new Map;return Object.freeze({register(e){return o.has(e.type)?!1:(o.set(e.type,e),!0)},getByType(e){return o.get(e)}})}),ot=class{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;let i=$i.collect(e,t.attributes),n=new Array(i.length),s={},a={};for(let l=0,u=i.length;l<u;++l){let h=i[l];n[l]=h.attribute,s[h.name]=h,a[h.attribute]=h}this.attributes=i,this.observedAttributes=n,this.propertyLookup=s,this.attributeLookup=a,this.shadowOptions=t.shadowOptions===void 0?ol:t.shadowOptions===null?void 0:Object.assign(Object.assign({},ol),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?il:Object.assign(Object.assign({},il),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?ie.create(t.styles):t.styles instanceof ie?t.styles:ie.create([t.styles])}get isDefined(){return!!as.getByType(this.type)}define(e=customElements){let t=this.type;if(as.register(this)){let i=this.attributes,n=t.prototype;for(let s=0,a=i.length;s<a;++s)C.defineProperty(n,i[s]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}};ot.forType=as.getByType});function ls(o){return o.shadowRoot||nl.get(o)||null}var nl,em,Ii,cs=c(()=>{He();Vo();tt();Si();nl=new WeakMap,em={bubbles:!0,composed:!0,cancelable:!0};Ii=class o extends uo{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;let i=t.shadowOptions;if(i!==void 0){let s=e.attachShadow(i);i.mode==="closed"&&nl.set(e,s)}let n=C.getAccessors(e);if(n.length>0){let s=this.boundObservables=Object.create(null);for(let a=0,l=n.length;a<l;++a){let u=n[a].name,h=e[u];h!==void 0&&(delete e[u],s[u]=h)}}}get isConnected(){return C.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,C.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){let t=ls(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){let i=e.behaviors;e.addStylesTo(t),i!==null&&this.addBehaviors(i)}}removeStyles(e){let t=ls(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){let i=e.behaviors;e.removeStylesFrom(t),i!==null&&this.removeBehaviors(i)}}addBehaviors(e){let t=this.behaviors||(this.behaviors=new Map),i=e.length,n=[];for(let s=0;s<i;++s){let a=e[s];t.has(a)?t.set(a,t.get(a)+1):(t.set(a,1),n.push(a))}if(this._isConnected){let s=this.element;for(let a=0;a<n.length;++a)n[a].bind(s,Et)}}removeBehaviors(e,t=!1){let i=this.behaviors;if(i===null)return;let n=e.length,s=[];for(let a=0;a<n;++a){let l=e[a];if(i.has(l)){let u=i.get(l)-1;u===0||t?i.delete(l)&&s.push(l):i.set(l,u)}}if(this._isConnected){let a=this.element;for(let l=0;l<s.length;++l)s[l].unbind(a)}}onConnectedCallback(){if(this._isConnected)return;let e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,Et);let t=this.behaviors;if(t!==null)for(let[i]of t)i.bind(e,Et);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);let e=this.view;e!==null&&e.unbind();let t=this.behaviors;if(t!==null){let i=this.element;for(let[n]of t)n.unbind(i)}}onAttributeChangedCallback(e,t,i){let n=this.definition.attributeLookup[e];n!==void 0&&n.onAttributeChangedCallback(this.element,i)}emit(e,t,i){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},em),i))):!1}finishInitialization(){let e=this.element,t=this.boundObservables;if(t!==null){let n=Object.keys(t);for(let s=0,a=n.length;s<a;++s){let l=n[s];e[l]=t[l]}this.boundObservables=null}let i=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():i.template&&(this._template=i.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():i.styles&&(this._styles=i.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){let t=this.element,i=ls(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||y.removeChildNodes(i),e&&(this.view=e.render(t,i,t))}static forCustomElement(e){let t=e.$fastController;if(t!==void 0)return t;let i=ot.forType(e.constructor);if(i===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new o(e,i)}}});function sl(o){return class extends o{constructor(){super(),Ii.forCustomElement(this)}$emit(e,t,i){return this.$fastController.emit(e,t,i)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,i){this.$fastController.onAttributeChangedCallback(e,t,i)}}}var Ft,rl=c(()=>{cs();Si();Ft=Object.assign(sl(HTMLElement),{from(o){return sl(o)},define(o,e){return new ot(o,e).define().type}})});var Wt,ds=c(()=>{Wt=class{createCSS(){return""}createBehavior(){}}});function tm(o,e){let t=[],i="",n=[];for(let s=0,a=o.length-1;s<a;++s){i+=o[s];let l=e[s];if(l instanceof Wt){let u=l.createBehavior();l=l.createCSS(),u&&n.push(u)}l instanceof ie||l instanceof CSSStyleSheet?(i.trim()!==""&&(t.push(i),i=""),t.push(l)):i+=l}return i+=o[o.length-1],i.trim()!==""&&t.push(i),{styles:t,behaviors:n}}function D(o,...e){let{styles:t,behaviors:i}=tm(o,e),n=ie.create(t);return i.length&&n.withBehaviors(...i),n}var al=c(()=>{ds();ki()});function Ne(o,e,t){return{index:o,removed:e,addedCount:t}}function om(o,e,t,i,n,s){let a=s-n+1,l=t-e+1,u=new Array(a),h,f;for(let m=0;m<a;++m)u[m]=new Array(l),u[m][0]=m;for(let m=0;m<l;++m)u[0][m]=m;for(let m=1;m<a;++m)for(let b=1;b<l;++b)o[e+b-1]===i[n+m-1]?u[m][b]=u[m-1][b-1]:(h=u[m-1][b]+1,f=u[m][b-1]+1,u[m][b]=h<f?h:f);return u}function im(o){let e=o.length-1,t=o[0].length-1,i=o[e][t],n=[];for(;e>0||t>0;){if(e===0){n.push(us),t--;continue}if(t===0){n.push(hs),e--;continue}let s=o[e-1][t-1],a=o[e-1][t],l=o[e][t-1],u;a<l?u=a<s?a:s:u=l<s?l:s,u===s?(s===i?n.push(cl):(n.push(dl),i=s),e--,t--):u===a?(n.push(hs),e--,i=a):(n.push(us),t--,i=l)}return n.reverse(),n}function nm(o,e,t){for(let i=0;i<t;++i)if(o[i]!==e[i])return i;return t}function sm(o,e,t){let i=o.length,n=e.length,s=0;for(;s<t&&o[--i]===e[--n];)s++;return s}function rm(o,e,t,i){return e<t||i<o?-1:e===t||i===o?0:o<t?e<i?e-t:i-t:i<e?i-o:e-o}function ps(o,e,t,i,n,s){let a=0,l=0,u=Math.min(t-e,s-n);if(e===0&&n===0&&(a=nm(o,i,u)),t===o.length&&s===i.length&&(l=sm(o,i,u-a)),e+=a,n+=a,t-=l,s-=l,t-e===0&&s-n===0)return ze;if(e===t){let E=Ne(e,[],0);for(;n<s;)E.removed.push(i[n++]);return[E]}else if(n===s)return[Ne(e,[],t-e)];let h=im(om(o,e,t,i,n,s)),f=[],m,b=e,S=n;for(let E=0;E<h.length;++E)switch(h[E]){case cl:m!==void 0&&(f.push(m),m=void 0),b++,S++;break;case dl:m===void 0&&(m=Ne(b,[],0)),m.addedCount++,b++,m.removed.push(i[S]),S++;break;case us:m===void 0&&(m=Ne(b,[],0)),m.addedCount++,b++;break;case hs:m===void 0&&(m=Ne(b,[],0)),m.removed.push(i[S]),S++;break}return m!==void 0&&f.push(m),f}function am(o,e,t,i){let n=Ne(e,t,i),s=!1,a=0;for(let l=0;l<o.length;l++){let u=o[l];if(u.index+=a,s)continue;let h=rm(n.index,n.index+n.removed.length,u.index,u.index+u.addedCount);if(h>=0){o.splice(l,1),l--,a-=u.addedCount-u.removed.length,n.addedCount+=u.addedCount-h;let f=n.removed.length+u.removed.length-h;if(!n.addedCount&&!f)s=!0;else{let m=u.removed;if(n.index<u.index){let b=n.removed.slice(0,u.index-n.index);ll.apply(b,m),m=b}if(n.index+n.removed.length>u.index+u.addedCount){let b=n.removed.slice(u.index+u.addedCount-n.index);ll.apply(m,b)}n.removed=m,u.index<n.index&&(n.index=u.index)}}else if(n.index<u.index){s=!0,o.splice(l,0,n),l++;let f=n.addedCount-n.removed.length;u.index+=f,a+=f}}s||o.push(n)}function lm(o){let e=[];for(let t=0,i=o.length;t<i;t++){let n=o[t];am(e,n.index,n.removed,n.addedCount)}return e}function ul(o,e){let t=[],i=lm(e);for(let n=0,s=i.length;n<s;++n){let a=i[n];if(a.addedCount===1&&a.removed.length===1){a.removed[0]!==o[a.index]&&t.push(a);continue}t=t.concat(ps(o,a.index,a.index+a.addedCount,a.removed,0,a.removed.length))}return t}var cl,dl,us,hs,ll,hl=c(()=>{dt();cl=0,dl=1,us=2,hs=3;ll=Array.prototype.push});function fs(o,e){let t=o.index,i=e.length;return t>i?t=i-o.addedCount:t<0&&(t=i+o.removed.length+t-o.addedCount),t<0&&(t=0),o.index=t,o}function fl(){if(pl)return;pl=!0,C.setArrayObserverFactory(u=>new ms(u));let o=Array.prototype;if(o.$fastPatch)return;Reflect.defineProperty(o,"$fastPatch",{value:1,enumerable:!1});let e=o.pop,t=o.push,i=o.reverse,n=o.shift,s=o.sort,a=o.splice,l=o.unshift;o.pop=function(){let u=this.length>0,h=e.apply(this,arguments),f=this.$fastController;return f!==void 0&&u&&f.addSplice(Ne(this.length,[h],0)),h},o.push=function(){let u=t.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(fs(Ne(this.length-arguments.length,[],arguments.length),this)),u},o.reverse=function(){let u,h=this.$fastController;h!==void 0&&(h.flush(),u=this.slice());let f=i.apply(this,arguments);return h!==void 0&&h.reset(u),f},o.shift=function(){let u=this.length>0,h=n.apply(this,arguments),f=this.$fastController;return f!==void 0&&u&&f.addSplice(Ne(0,[h],0)),h},o.sort=function(){let u,h=this.$fastController;h!==void 0&&(h.flush(),u=this.slice());let f=s.apply(this,arguments);return h!==void 0&&h.reset(u),f},o.splice=function(){let u=a.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(fs(Ne(+arguments[0],u,arguments.length>2?arguments.length-2:0),this)),u},o.unshift=function(){let u=l.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(fs(Ne(0,[],arguments.length),this)),u}}var pl,ms,ml=c(()=>{He();hl();Vo();tt();pl=!1;ms=class extends It{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}subscribe(e){this.flush(),super.subscribe(e)}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,y.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,y.queueUpdate(this))}flush(){let e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;let i=t===void 0?ul(this.source,e):ps(this.source,0,this.source.length,t,0,t.length);this.notify(i)}}});function X(o){return new Dt("fast-ref",bs,o)}var bs,bl=c(()=>{At();bs=class{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}});var gs,gl=c(()=>{gs=o=>typeof o=="function"});function vl(o){return o===void 0?cm:gs(o)?o:()=>o}function Yt(o,e,t){let i=gs(o)?o:()=>o,n=vl(e),s=vl(t);return(a,l)=>i(a,l)?n(a,l):s(a,l)}var cm,yl=c(()=>{gl();cm=()=>null});function dm(o,e,t,i){o.bind(e[t],i)}function um(o,e,t,i){let n=Object.create(i);n.index=t,n.length=e.length,o.bind(e[t],n)}var Gv,vs,ut,xl=c(()=>{He();tt();ml();dt();At();xi();Gv=Object.freeze({positioning:!1,recycle:!0});vs=class{constructor(e,t,i,n,s,a){this.location=e,this.itemsBinding=t,this.templateBinding=n,this.options=a,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=dm,this.itemsBindingObserver=C.binding(t,this,i),this.templateBindingObserver=C.binding(n,this,s),a.positioning&&(this.bindView=um)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=ze;return}let t=this.itemsObserver,i=this.itemsObserver=C.getNotifier(this.items),n=t!==i;n&&t!==null&&t.unsubscribe(this),(n||e)&&i.subscribe(this)}updateViews(e){let t=this.childContext,i=this.views,n=this.bindView,s=this.items,a=this.template,l=this.options.recycle,u=[],h=0,f=0;for(let m=0,b=e.length;m<b;++m){let S=e[m],E=S.removed,J=0,se=S.index,kt=se+S.addedCount,$t=i.splice(S.index,E.length),Rf=f=u.length+$t.length;for(;se<kt;++se){let La=i[se],Df=La?La.firstChild:this.location,lo;l&&f>0?(J<=Rf&&$t.length>0?(lo=$t[J],J++):(lo=u[h],h++),f--):lo=a.create(),i.splice(se,0,lo),n(lo,s,se,t),lo.insertBefore(Df)}$t[J]&&u.push(...$t.slice(J))}for(let m=h,b=u.length;m<b;++m)u[m].dispose();if(this.options.positioning)for(let m=0,b=i.length;m<b;++m){let S=i[m].context;S.length=b,S.index=m}}refreshAllViews(e=!1){let t=this.items,i=this.childContext,n=this.template,s=this.location,a=this.bindView,l=t.length,u=this.views,h=u.length;if((l===0||e||!this.options.recycle)&&(po.disposeContiguousBatch(u),h=0),h===0){this.views=u=new Array(l);for(let f=0;f<l;++f){let m=n.create();a(m,t,f,i),u[f]=m,m.insertBefore(s)}}else{let f=0;for(;f<l;++f)if(f<h){let b=u[f];a(b,t,f,i)}else{let b=n.create();a(b,t,f,i),u.push(b),b.insertBefore(s)}let m=u.splice(f,h-f);for(f=0,l=m.length;f<l;++f)m[f].dispose()}}unbindAllViews(){let e=this.views;for(let t=0,i=e.length;t<i;++t)e[t].unbind()}},ut=class extends Rt{constructor(e,t,i){super(),this.itemsBinding=e,this.templateBinding=t,this.options=i,this.createPlaceholder=y.createBlockPlaceholder,fl(),this.isItemsBindingVolatile=C.isVolatileBinding(e),this.isTemplateBindingVolatile=C.isVolatileBinding(t)}createBehavior(e){return new vs(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}});function Qt(o){return o?function(e,t,i){return e.nodeType===1&&e.matches(o)}:function(e,t,i){return e.nodeType===1}}var fo,Ti=c(()=>{tt();dt();fo=class{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){let t=this.options.property;this.shouldUpdate=C.getAccessors(e).some(i=>i.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(ze),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}});function K(o){return typeof o=="string"&&(o={property:o}),new Dt("fast-slotted",ys,o)}var ys,wl=c(()=>{At();Ti();ys=class extends fo{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}});function Ei(o){return typeof o=="string"&&(o={property:o}),new Dt("fast-children",xs,o)}var xs,Cl=c(()=>{At();Ti();xs=class extends fo{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}});var g=c(()=>{dt();Za();rl();Si();rs();cs();ts();ki();al();ds();xi();tt();Vo();He();yi();At();bl();yl();xl();wl();Cl();Ti()});var N,Ve,_e,Ey,Ry,be=c(()=>{g();N=class{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}},Ve=(o,e)=>k`
    <span
        part="end"
        ${X("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${X("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,_e=(o,e)=>k`
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
`,Ey=k`
    <span part="end" ${X("endContainer")}>
        <slot
            name="end"
            ${X("end")}
            @slotchange="${o=>o.handleEndContentChange()}"
        ></slot>
    </span>
`,Ry=k`
    <span part="start" ${X("startContainer")}>
        <slot
            name="start"
            ${X("start")}
            @slotchange="${o=>o.handleStartContentChange()}"
        ></slot>
    </span>
`});var kl=c(()=>{});function r(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(a=o[l])&&(s=(n<3?a(s):n>3?a(e,t,s):a(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s}var I=c(()=>{});function Uo(o){let e=o.slice(),t=Object.keys(o),i=t.length,n;for(let s=0;s<i;++s)n=t[s],Ml(n)||(e[n]=o[n]);return e}function Sl(o){return e=>Reflect.getOwnMetadata(o,e)}function Fi(o){return function(e){let t=function(i,n,s){_.inject(t)(i,n,s)};return t.$isResolver=!0,t.resolve=function(i,n){return o(e,i,n)},t}}function mm(o){return function(e,t){t=!!t;let i=function(n,s,a){_.inject(i)(n,s,a)};return i.$isResolver=!0,i.resolve=function(n,s){return o(e,n,s,t)},i}}function Ts(o,e,t){_.inject(Ts)(o,e,t)}function Fl(o,e){return e.getFactory(o).construct(e)}function Tl(o){return this.get(o)}function bm(o,e){return e(o)}function Ai(o){return typeof o.register=="function"}function vm(o){return Ai(o)&&typeof o.registerInRequestor=="boolean"}function El(o){return vm(o)&&o.registerInRequestor}function ym(o){return o.prototype!==void 0}function Ll(o){return function(e,t,i){if($s.has(i))return $s.get(i);let n=o(e,t,i);return $s.set(i,n),n}}function Ri(o){if(o==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function Rl(o,e,t){if(o instanceof Ce&&o.strategy===4){let i=o.state,n=i.length,s=new Array(n);for(;n--;)s[n]=i[n].resolve(e,t);return s}return[o.resolve(e,t)]}function Al(o){return typeof o=="object"&&o!==null||typeof o=="function"}function Ml(o){switch(typeof o){case"number":return o>=0&&(o|0)===o;case"string":{let e=Di[o];if(e!==void 0)return e;let t=o.length;if(t===0)return Di[o]=!1;let i=0;for(let n=0;n<t;++n)if(i=o.charCodeAt(n),n===0&&i===48&&t>1||i<48||i>57)return Di[o]=!1;return Di[o]=!0}default:return!1}}var ws,Ss,hm,Cs,$l,Il,_,pm,Ly,fm,My,Py,By,zy,Hy,Ce,Is,gm,xm,Ol,ks,jo,$s,Xt,Dl,wm,Di,Oi=c(()=>{g();ws=new Map;"metadata"in Reflect||(Reflect.metadata=function(o,e){return function(t){Reflect.defineMetadata(o,e,t)}},Reflect.defineMetadata=function(o,e,t){let i=ws.get(t);i===void 0&&ws.set(t,i=new Map),i.set(o,e)},Reflect.getOwnMetadata=function(o,e){let t=ws.get(e);if(t!==void 0)return t.get(o)});Ss=class{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,Ll(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){let{container:i,key:n}=this;return this.container=this.key=void 0,i.registerResolver(n,new Ce(n,e,t))}};hm=Object.freeze({none(o){throw Error(`${o.toString()} not registered, did you forget to add @singleton()?`)},singleton(o){return new Ce(o,1,o)},transient(o){return new Ce(o,2,o)}}),Cs=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:hm.singleton})}),$l=new Map;Il=null,_=Object.freeze({createContainer(o){return new jo(null,Object.assign({},Cs.default,o))},findResponsibleContainer(o){let e=o.$$container$$;return e&&e.responsibleForOwnerRequests?e:_.findParentContainer(o)},findParentContainer(o){let e=new CustomEvent(Ol,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return o.dispatchEvent(e),e.detail.container||_.getOrCreateDOMContainer()},getOrCreateDOMContainer(o,e){return o?o.$$container$$||new jo(o,Object.assign({},Cs.default,e,{parentLocator:_.findParentContainer})):Il||(Il=new jo(null,Object.assign({},Cs.default,e,{parentLocator:()=>null})))},getDesignParamtypes:Sl("design:paramtypes"),getAnnotationParamtypes:Sl("di:paramtypes"),getOrCreateAnnotationParamTypes(o){let e=this.getAnnotationParamtypes(o);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],o),e},getDependencies(o){let e=$l.get(o);if(e===void 0){let t=o.inject;if(t===void 0){let i=_.getDesignParamtypes(o),n=_.getAnnotationParamtypes(o);if(i===void 0)if(n===void 0){let s=Object.getPrototypeOf(o);typeof s=="function"&&s!==Function.prototype?e=Uo(_.getDependencies(s)):e=[]}else e=Uo(n);else if(n===void 0)e=Uo(i);else{e=Uo(i);let s=n.length,a;for(let h=0;h<s;++h)a=n[h],a!==void 0&&(e[h]=a);let l=Object.keys(n);s=l.length;let u;for(let h=0;h<s;++h)u=l[h],Ml(u)||(e[u]=n[u])}}else e=Uo(t);$l.set(o,e)}return e},defineProperty(o,e,t,i=!1){let n=`$di_${e}`;Reflect.defineProperty(o,e,{get:function(){let s=this[n];if(s===void 0&&(s=(this instanceof HTMLElement?_.findResponsibleContainer(this):_.getOrCreateDOMContainer()).get(t),this[n]=s,i&&this instanceof Ft)){let l=this.$fastController,u=()=>{let f=_.findResponsibleContainer(this).get(t),m=this[n];f!==m&&(this[n]=s,l.notify(e))};l.subscribe({handleChange:u},"isConnected")}return s}})},createInterface(o,e){let t=typeof o=="function"?o:e,i=typeof o=="string"?o:o&&"friendlyName"in o&&o.friendlyName||Dl,n=typeof o=="string"?!1:o&&"respectConnection"in o&&o.respectConnection||!1,s=function(a,l,u){if(a==null||new.target!==void 0)throw new Error(`No registration for interface: '${s.friendlyName}'`);if(l)_.defineProperty(a,l,s,n);else{let h=_.getOrCreateAnnotationParamTypes(a);h[u]=s}};return s.$isInterface=!0,s.friendlyName=i??"(anonymous)",t!=null&&(s.register=function(a,l){return t(new Ss(a,l??s))}),s.toString=function(){return`InterfaceSymbol<${s.friendlyName}>`},s},inject(...o){return function(e,t,i){if(typeof i=="number"){let n=_.getOrCreateAnnotationParamTypes(e),s=o[0];s!==void 0&&(n[i]=s)}else if(t)_.defineProperty(e,t,o[0]);else{let n=i?_.getOrCreateAnnotationParamTypes(i.value):_.getOrCreateAnnotationParamTypes(e),s;for(let a=0;a<o.length;++a)s=o[a],s!==void 0&&(n[a]=s)}}},transient(o){return o.register=function(t){return Xt.transient(o,o).register(t)},o.registerInRequestor=!1,o},singleton(o,e=fm){return o.register=function(i){return Xt.singleton(o,o).register(i)},o.registerInRequestor=e.scoped,o}}),pm=_.createInterface("Container");Ly=_.inject,fm={scoped:!1};My=mm((o,e,t,i)=>t.getAll(o,i)),Py=Fi((o,e,t)=>()=>t.get(o)),By=Fi((o,e,t)=>{if(t.has(o,!0))return t.get(o)});Ts.$isResolver=!0;Ts.resolve=()=>{};zy=Fi((o,e,t)=>{let i=Fl(o,e),n=new Ce(o,0,i);return t.registerResolver(o,n),i}),Hy=Fi((o,e,t)=>Fl(o,e));Ce=class{constructor(e,t,i){this.key=e,this.strategy=t,this.state=i,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{let i=e.getFactory(this.state);if(i===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return i.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,i,n;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(n=(i=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||i===void 0?void 0:i.call(t,e))!==null&&n!==void 0?n:null;default:return null}}};Is=class{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let i;return t===void 0?i=new this.Type(...this.dependencies.map(Tl,e)):i=new this.Type(...this.dependencies.map(Tl,e),...t),this.transformers==null?i:this.transformers.reduce(bm,i)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}},gm={$isResolver:!0,resolve(o,e){return e}};xm=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),Ol="__DI_LOCATE_PARENT__",ks=new Map,jo=class o{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(pm,gm),e instanceof Node&&e.addEventListener(Ol,i=>{i.composedPath()[0]!==this.owner&&(i.detail.container=this,i.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,i,n,s,a,l=this.context;for(let u=0,h=e.length;u<h;++u)if(t=e[u],!!Al(t))if(Ai(t))t.register(this,l);else if(ym(t))Xt.singleton(t,t).register(this);else for(i=Object.keys(t),s=0,a=i.length;s<a;++s)n=t[i[s]],Al(n)&&(Ai(n)?n.register(this,l):this.register(n));return--this.registerDepth,this}registerResolver(e,t){Ri(e);let i=this.resolvers,n=i.get(e);return n==null?i.set(e,t):n instanceof Ce&&n.strategy===4?n.state.push(t):i.set(e,new Ce(e,4,[n,t])),t}registerTransformer(e,t){let i=this.getResolver(e);if(i==null)return!1;if(i.getFactory){let n=i.getFactory(this);return n==null?!1:(n.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(Ri(e),e.resolve!==void 0)return e;let i=this,n;for(;i!=null;)if(n=i.resolvers.get(e),n==null){if(i.parent==null){let s=El(e)?this:i;return t?this.jitRegister(e,s):null}i=i.parent}else return n;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(Ri(e),e.$isResolver)return e.resolve(this,this);let t=this,i;for(;t!=null;)if(i=t.resolvers.get(e),i==null){if(t.parent==null){let n=El(e)?this:t;return i=this.jitRegister(e,n),i.resolve(t,this)}t=t.parent}else return i.resolve(t,this);throw new Error(`Unable to resolve key: ${String(e)}`)}getAll(e,t=!1){Ri(e);let i=this,n=i,s;if(t){let a=ze;for(;n!=null;)s=n.resolvers.get(e),s!=null&&(a=a.concat(Rl(s,n,i))),n=n.parent;return a}else for(;n!=null;)if(s=n.resolvers.get(e),s==null){if(n=n.parent,n==null)return ze}else return Rl(s,n,i);return ze}getFactory(e){let t=ks.get(e);if(t===void 0){if(wm(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);ks.set(e,t=new Is(e,_.getDependencies(e)))}return t}registerFactory(e,t){ks.set(e,t)}createChild(e){return new o(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(xm.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(Ai(e)){let i=e.register(t);if(!(i instanceof Object)||i.resolve==null){let n=t.resolvers.get(e);if(n!=null)return n;throw new Error("A valid resolver was not returned from the static register method")}return i}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{let i=this.config.defaultResolver(e,t);return t.resolvers.set(e,i),i}}}},$s=new WeakMap;Xt=Object.freeze({instance(o,e){return new Ce(o,0,e)},singleton(o,e){return new Ce(o,1,e)},transient(o,e){return new Ce(o,2,e)},callback(o,e){return new Ce(o,3,e)},cachedCallback(o,e){return new Ce(o,3,Ll(e))},aliasTo(o,e){return new Ce(e,5,o)}});Dl="(anonymous)";wm=(function(){let o=new WeakMap,e=!1,t="",i=0;return function(n){return e=o.get(n),e===void 0&&(t=n.toString(),i=t.length,e=i>=29&&i<=100&&t.charCodeAt(i-1)===125&&t.charCodeAt(i-2)<=32&&t.charCodeAt(i-3)===93&&t.charCodeAt(i-4)===101&&t.charCodeAt(i-5)===100&&t.charCodeAt(i-6)===111&&t.charCodeAt(i-7)===99&&t.charCodeAt(i-8)===32&&t.charCodeAt(i-9)===101&&t.charCodeAt(i-10)===118&&t.charCodeAt(i-11)===105&&t.charCodeAt(i-12)===116&&t.charCodeAt(i-13)===97&&t.charCodeAt(i-14)===110&&t.charCodeAt(i-15)===88,o.set(n,e)),e}})(),Di={}});function Pl(o){return`${o.toLowerCase()}:presentation`}var Li,Pi,Mi,Bi=c(()=>{g();Oi();Li=new Map,Pi=Object.freeze({define(o,e,t){let i=Pl(o);Li.get(i)===void 0?Li.set(i,e):Li.set(i,!1),t.register(Xt.instance(i,e))},forTag(o,e){let t=Pl(o),i=Li.get(t);return i===!1?_.findResponsibleContainer(e).get(t):i||null}}),Mi=class{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?ie.create(t):t instanceof ie?t:ie.create([t])}applyTo(e){let t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}});function qo(o,e,t){return typeof o=="function"?o(e,t):o}var v,Es,R=c(()=>{I();g();Bi();v=class o extends Ft{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=Pi.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new Es(this===o?class extends o{}:this,e,t)}};r([p],v.prototype,"template",void 0);r([p],v.prototype,"styles",void 0);Es=class{constructor(e,t,i){this.type=e,this.elementDefinition=t,this.overrideDefinition=i,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){let i=this.definition,n=this.overrideDefinition,a=`${i.prefix||t.elementPrefix}-${i.baseName}`;t.tryDefineElement({name:a,type:this.type,baseClass:this.elementDefinition.baseClass,callback:l=>{let u=new Mi(qo(i.template,l,i),qo(i.styles,l,i));l.definePresentation(u);let h=qo(i.shadowOptions,l,i);l.shadowRootMode&&(h?n.shadowOptions||(h.mode=l.shadowRootMode):h!==null&&(h={mode:l.shadowRootMode})),l.defineElement({elementOptions:qo(i.elementOptions,l,i),shadowOptions:h,attributes:qo(i.attributes,l,i)})}})}}});function A(o,...e){let t=_o.locate(o);e.forEach(i=>{Object.getOwnPropertyNames(i.prototype).forEach(s=>{s!=="constructor"&&Object.defineProperty(o.prototype,s,Object.getOwnPropertyDescriptor(i.prototype,s))}),_o.locate(i).forEach(s=>t.push(s))})}var pe=c(()=>{g()});var ht,Rs=c(()=>{I();g();R();be();pe();ht=class extends v{constructor(){super(...arguments),this.headinglevel=2,this.expanded=!1,this.clickHandler=e=>{this.expanded=!this.expanded,this.change()},this.change=()=>{this.$emit("change")}}};r([d({attribute:"heading-level",mode:"fromView",converter:F})],ht.prototype,"headinglevel",void 0);r([d({mode:"boolean"})],ht.prototype,"expanded",void 0);r([d],ht.prototype,"id",void 0);A(ht,N)});var Bl=c(()=>{kl();Rs()});var zl=c(()=>{});var U,Hl=c(()=>{U={horizontal:"horizontal",vertical:"vertical"}});function Nl(o,e){let t=o.length;for(;t--;)if(e(o[t],t,o))return t;return-1}var Vl=c(()=>{});var _l=c(()=>{});function zi(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}var Ul=c(()=>{});var jl=c(()=>{});var ql=c(()=>{});var Gl=c(()=>{});var Ds=c(()=>{Ul();jl();ql();Gl()});function it(...o){return o.every(e=>e instanceof HTMLElement)}function Wl(o,e){return!o||!e||!it(o)?void 0:Array.from(o.querySelectorAll(e)).filter(i=>i.offsetParent!==null)}function Cm(){let o=document.querySelector('meta[property="csp-nonce"]');return o?o.getAttribute("content"):null}function Yl(){if(typeof Zt=="boolean")return Zt;if(!zi())return Zt=!1,Zt;let o=document.createElement("style"),e=Cm();e!==null&&o.setAttribute("nonce",e),document.head.appendChild(o);try{o.sheet.insertRule("foo:focus-visible {color:inherit}",0),Zt=!0}catch{Zt=!1}finally{document.head.removeChild(o)}return Zt}var Zt,Ql=c(()=>{Ds()});var As,Fs,pt,ft,Os,Ls,Xl=c(()=>{As="focus",Fs="focusin",pt="focusout",ft="keydown",Os="resize",Ls="scroll"});var Zl=c(()=>{});var Jl,Y,ve,ye,Q,ee,Te,re,ae,Kl,ec,tc,Ee,Ot,oc,ic,Lt,nc=c(()=>{(function(o){o[o.alt=18]="alt",o[o.arrowDown=40]="arrowDown",o[o.arrowLeft=37]="arrowLeft",o[o.arrowRight=39]="arrowRight",o[o.arrowUp=38]="arrowUp",o[o.back=8]="back",o[o.backSlash=220]="backSlash",o[o.break=19]="break",o[o.capsLock=20]="capsLock",o[o.closeBracket=221]="closeBracket",o[o.colon=186]="colon",o[o.colon2=59]="colon2",o[o.comma=188]="comma",o[o.ctrl=17]="ctrl",o[o.delete=46]="delete",o[o.end=35]="end",o[o.enter=13]="enter",o[o.equals=187]="equals",o[o.equals2=61]="equals2",o[o.equals3=107]="equals3",o[o.escape=27]="escape",o[o.forwardSlash=191]="forwardSlash",o[o.function1=112]="function1",o[o.function10=121]="function10",o[o.function11=122]="function11",o[o.function12=123]="function12",o[o.function2=113]="function2",o[o.function3=114]="function3",o[o.function4=115]="function4",o[o.function5=116]="function5",o[o.function6=117]="function6",o[o.function7=118]="function7",o[o.function8=119]="function8",o[o.function9=120]="function9",o[o.home=36]="home",o[o.insert=45]="insert",o[o.menu=93]="menu",o[o.minus=189]="minus",o[o.minus2=109]="minus2",o[o.numLock=144]="numLock",o[o.numPad0=96]="numPad0",o[o.numPad1=97]="numPad1",o[o.numPad2=98]="numPad2",o[o.numPad3=99]="numPad3",o[o.numPad4=100]="numPad4",o[o.numPad5=101]="numPad5",o[o.numPad6=102]="numPad6",o[o.numPad7=103]="numPad7",o[o.numPad8=104]="numPad8",o[o.numPad9=105]="numPad9",o[o.numPadDivide=111]="numPadDivide",o[o.numPadDot=110]="numPadDot",o[o.numPadMinus=109]="numPadMinus",o[o.numPadMultiply=106]="numPadMultiply",o[o.numPadPlus=107]="numPadPlus",o[o.openBracket=219]="openBracket",o[o.pageDown=34]="pageDown",o[o.pageUp=33]="pageUp",o[o.period=190]="period",o[o.print=44]="print",o[o.quote=222]="quote",o[o.scrollLock=145]="scrollLock",o[o.shift=16]="shift",o[o.space=32]="space",o[o.tab=9]="tab",o[o.tilde=192]="tilde",o[o.windowsLeft=91]="windowsLeft",o[o.windowsOpera=219]="windowsOpera",o[o.windowsRight=92]="windowsRight"})(Jl||(Jl={}));Y="ArrowDown",ve="ArrowLeft",ye="ArrowRight",Q="ArrowUp",ee="Enter",Te="Escape",re="Home",ae="End",Kl="F2",ec="PageDown",tc="PageUp",Ee=" ",Ot="Tab",oc="Backspace",ic="Delete",Lt={ArrowDown:Y,ArrowLeft:ve,ArrowRight:ye,ArrowUp:Q}});var O,Ms=c(()=>{(function(o){o.ltr="ltr",o.rtl="rtl"})(O||(O={}))});function sc(o,e,t){return t<o?e:t>e?o:t}function Mt(o,e,t){return Math.min(Math.max(t,o),e)}function Go(o,e,t=0){return[e,t]=[e,t].sort((i,n)=>i-n),e<=o&&o<t}var rc=c(()=>{});function Le(o=""){return`${o}${km++}`}var km,ac=c(()=>{km=0});var lc=c(()=>{});var mo,cc=c(()=>{Ds();Ms();mo=class o{static getScrollLeft(e,t){return t===O.rtl?o.getRtlScrollLeftConverter(e):e.scrollLeft}static setScrollLeft(e,t,i){if(i===O.rtl){o.setRtlScrollLeftConverter(e,t);return}e.scrollLeft=t}static initialGetRtlScrollConverter(e){return o.initializeRtlScrollConverters(),o.getRtlScrollLeftConverter(e)}static directGetRtlScrollConverter(e){return e.scrollLeft}static invertedGetRtlScrollConverter(e){return-Math.abs(e.scrollLeft)}static reverseGetRtlScrollConverter(e){return e.scrollLeft-(e.scrollWidth-e.clientWidth)}static initialSetRtlScrollConverter(e,t){o.initializeRtlScrollConverters(),o.setRtlScrollLeftConverter(e,t)}static directSetRtlScrollConverter(e,t){e.scrollLeft=t}static invertedSetRtlScrollConverter(e,t){e.scrollLeft=Math.abs(t)}static reverseSetRtlScrollConverter(e,t){let i=e.scrollWidth-e.clientWidth;e.scrollLeft=i+t}static initializeRtlScrollConverters(){if(!zi()){o.applyDirectScrollConverters();return}let e=o.getTestElement();document.body.appendChild(e),o.checkForScrollType(e),document.body.removeChild(e)}static checkForScrollType(e){o.isReverse(e)?o.applyReverseScrollConverters():o.isDirect(e)?o.applyDirectScrollConverters():o.applyInvertedScrollConverters()}static isReverse(e){return e.scrollLeft>0}static isDirect(e){return e.scrollLeft=-1,e.scrollLeft<0}static applyDirectScrollConverters(){o.setRtlScrollLeftConverter=o.directSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.directGetRtlScrollConverter}static applyInvertedScrollConverters(){o.setRtlScrollLeftConverter=o.invertedSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.invertedGetRtlScrollConverter}static applyReverseScrollConverters(){o.setRtlScrollLeftConverter=o.reverseSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.reverseGetRtlScrollConverter}static getTestElement(){let e=document.createElement("div");return e.appendChild(document.createTextNode("ABCD")),e.dir="rtl",e.style.fontSize="14px",e.style.width="4px",e.style.height="1px",e.style.position="absolute",e.style.top="-1000px",e.style.overflow="scroll",e}};mo.getRtlScrollLeftConverter=mo.initialGetRtlScrollConverter;mo.setRtlScrollLeftConverter=mo.initialSetRtlScrollConverter});var dc,uc=c(()=>{(function(o){o.Canvas="Canvas",o.CanvasText="CanvasText",o.LinkText="LinkText",o.VisitedText="VisitedText",o.ActiveText="ActiveText",o.ButtonFace="ButtonFace",o.ButtonText="ButtonText",o.Field="Field",o.FieldText="FieldText",o.Highlight="Highlight",o.HighlightText="HighlightText",o.GrayText="GrayText"})(dc||(dc={}))});var L=c(()=>{Hl();Vl();_l();Ql();Xl();Zl();nc();Ms();rc();ac();lc();cc();uc()});var hc,Hi,pc=c(()=>{I();g();L();R();Rs();hc={single:"single",multi:"multi"},Hi=class extends v{constructor(){super(...arguments),this.expandmode=hc.multi,this.activeItemIndex=0,this.change=()=>{this.$emit("change",this.activeid)},this.setItems=()=>{var e;this.accordionItems.length!==0&&(this.accordionIds=this.getItemIds(),this.accordionItems.forEach((t,i)=>{t instanceof ht&&(t.addEventListener("change",this.activeItemChange),this.isSingleExpandMode()&&(this.activeItemIndex!==i?t.expanded=!1:t.expanded=!0));let n=this.accordionIds[i];t.setAttribute("id",typeof n!="string"?`accordion-${i+1}`:n),this.activeid=this.accordionIds[this.activeItemIndex],t.addEventListener("keydown",this.handleItemKeyDown),t.addEventListener("focus",this.handleItemFocus)}),this.isSingleExpandMode()&&((e=this.findExpandedItem())!==null&&e!==void 0?e:this.accordionItems[0]).setAttribute("aria-disabled","true"))},this.removeItemListeners=e=>{e.forEach((t,i)=>{t.removeEventListener("change",this.activeItemChange),t.removeEventListener("keydown",this.handleItemKeyDown),t.removeEventListener("focus",this.handleItemFocus)})},this.activeItemChange=e=>{if(e.defaultPrevented||e.target!==e.currentTarget)return;e.preventDefault();let t=e.target;this.activeid=t.getAttribute("id"),this.isSingleExpandMode()&&(this.resetItems(),t.expanded=!0,t.setAttribute("aria-disabled","true"),this.accordionItems.forEach(i=>{!i.hasAttribute("disabled")&&i.id!==this.activeid&&i.removeAttribute("aria-disabled")})),this.activeItemIndex=Array.from(this.accordionItems).indexOf(t),this.change()},this.handleItemKeyDown=e=>{if(e.target===e.currentTarget)switch(this.accordionIds=this.getItemIds(),e.key){case Q:e.preventDefault(),this.adjust(-1);break;case Y:e.preventDefault(),this.adjust(1);break;case re:this.activeItemIndex=0,this.focusItem();break;case ae:this.activeItemIndex=this.accordionItems.length-1,this.focusItem();break}},this.handleItemFocus=e=>{if(e.target===e.currentTarget){let t=e.target,i=this.activeItemIndex=Array.from(this.accordionItems).indexOf(t);this.activeItemIndex!==i&&i!==-1&&(this.activeItemIndex=i,this.activeid=this.accordionIds[this.activeItemIndex])}}}accordionItemsChanged(e,t){this.$fastController.isConnected&&(this.removeItemListeners(e),this.setItems())}findExpandedItem(){for(let e=0;e<this.accordionItems.length;e++)if(this.accordionItems[e].getAttribute("expanded")==="true")return this.accordionItems[e];return null}resetItems(){this.accordionItems.forEach((e,t)=>{e.expanded=!1})}getItemIds(){return this.accordionItems.map(e=>e.getAttribute("id"))}isSingleExpandMode(){return this.expandmode===hc.single}adjust(e){this.activeItemIndex=sc(0,this.accordionItems.length-1,this.activeItemIndex+e),this.focusItem()}focusItem(){let e=this.accordionItems[this.activeItemIndex];e instanceof ht&&e.expandbutton.focus()}};r([d({attribute:"expand-mode"})],Hi.prototype,"expandmode",void 0);r([p],Hi.prototype,"accordionItems",void 0)});var fc=c(()=>{zl();pc()});var mc,bc=c(()=>{g();be();mc=(o,e)=>k`
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
        ${_e(o,e)}
        <span class="content" part="content">
            <slot ${K("defaultSlottedContent")}></slot>
        </span>
        ${Ve(o,e)}
    </a>
`});var P,Wo=c(()=>{I();g();P=class{};r([d({attribute:"aria-atomic"})],P.prototype,"ariaAtomic",void 0);r([d({attribute:"aria-busy"})],P.prototype,"ariaBusy",void 0);r([d({attribute:"aria-controls"})],P.prototype,"ariaControls",void 0);r([d({attribute:"aria-current"})],P.prototype,"ariaCurrent",void 0);r([d({attribute:"aria-describedby"})],P.prototype,"ariaDescribedby",void 0);r([d({attribute:"aria-details"})],P.prototype,"ariaDetails",void 0);r([d({attribute:"aria-disabled"})],P.prototype,"ariaDisabled",void 0);r([d({attribute:"aria-errormessage"})],P.prototype,"ariaErrormessage",void 0);r([d({attribute:"aria-flowto"})],P.prototype,"ariaFlowto",void 0);r([d({attribute:"aria-haspopup"})],P.prototype,"ariaHaspopup",void 0);r([d({attribute:"aria-hidden"})],P.prototype,"ariaHidden",void 0);r([d({attribute:"aria-invalid"})],P.prototype,"ariaInvalid",void 0);r([d({attribute:"aria-keyshortcuts"})],P.prototype,"ariaKeyshortcuts",void 0);r([d({attribute:"aria-label"})],P.prototype,"ariaLabel",void 0);r([d({attribute:"aria-labelledby"})],P.prototype,"ariaLabelledby",void 0);r([d({attribute:"aria-live"})],P.prototype,"ariaLive",void 0);r([d({attribute:"aria-owns"})],P.prototype,"ariaOwns",void 0);r([d({attribute:"aria-relevant"})],P.prototype,"ariaRelevant",void 0);r([d({attribute:"aria-roledescription"})],P.prototype,"ariaRoledescription",void 0)});var Jt=c(()=>{Wo();be()});var xe,Kt,Ps=c(()=>{I();g();R();Jt();pe();xe=class extends v{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{var t;(t=this.control)===null||t===void 0||t.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}};r([d],xe.prototype,"download",void 0);r([d],xe.prototype,"href",void 0);r([d],xe.prototype,"hreflang",void 0);r([d],xe.prototype,"ping",void 0);r([d],xe.prototype,"referrerpolicy",void 0);r([d],xe.prototype,"rel",void 0);r([d],xe.prototype,"target",void 0);r([d],xe.prototype,"type",void 0);r([p],xe.prototype,"defaultSlottedContent",void 0);Kt=class{};r([d({attribute:"aria-expanded"})],Kt.prototype,"ariaExpanded",void 0);A(Kt,P);A(xe,N,Kt)});var gc=c(()=>{bc();Ps()});var vc=c(()=>{});var Me,Pt=c(()=>{L();Me=o=>{let e=o.closest("[dir]");return e!==null&&e.dir==="rtl"?O.rtl:O.ltr}});var Ni,yc=c(()=>{g();Ni=class{constructor(){this.intersectionDetector=null,this.observedElements=new Map,this.requestPosition=(e,t)=>{var i;if(this.intersectionDetector!==null){if(this.observedElements.has(e)){(i=this.observedElements.get(e))===null||i===void 0||i.push(t);return}this.observedElements.set(e,[t]),this.intersectionDetector.observe(e)}},this.cancelRequestPosition=(e,t)=>{let i=this.observedElements.get(e);if(i!==void 0){let n=i.indexOf(t);n!==-1&&i.splice(n,1)}},this.initializeIntersectionDetector=()=>{Ye.IntersectionObserver&&(this.intersectionDetector=new IntersectionObserver(this.handleIntersection,{root:null,rootMargin:"0px",threshold:[0,1]}))},this.handleIntersection=e=>{if(this.intersectionDetector===null)return;let t=[],i=[];e.forEach(n=>{var s;(s=this.intersectionDetector)===null||s===void 0||s.unobserve(n.target);let a=this.observedElements.get(n.target);a!==void 0&&(a.forEach(l=>{let u=t.indexOf(l);u===-1&&(u=t.length,t.push(l),i.push([])),i[u].push(n)}),this.observedElements.delete(n.target))}),t.forEach((n,s)=>{n(i[s])})},this.initializeIntersectionDetector()}}});var te,xc=c(()=>{I();g();L();R();Pt();yc();te=class o extends v{constructor(){super(...arguments),this.anchor="",this.viewport="",this.horizontalPositioningMode="uncontrolled",this.horizontalDefaultPosition="unset",this.horizontalViewportLock=!1,this.horizontalInset=!1,this.horizontalScaling="content",this.verticalPositioningMode="uncontrolled",this.verticalDefaultPosition="unset",this.verticalViewportLock=!1,this.verticalInset=!1,this.verticalScaling="content",this.fixedPlacement=!1,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.initialLayoutComplete=!1,this.resizeDetector=null,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.pendingPositioningUpdate=!1,this.pendingReset=!1,this.currentDirection=O.ltr,this.regionVisible=!1,this.forceUpdate=!1,this.updateThreshold=.5,this.update=()=>{this.pendingPositioningUpdate||this.requestPositionUpdates()},this.startObservers=()=>{this.stopObservers(),this.anchorElement!==null&&(this.requestPositionUpdates(),this.resizeDetector!==null&&(this.resizeDetector.observe(this.anchorElement),this.resizeDetector.observe(this)))},this.requestPositionUpdates=()=>{this.anchorElement===null||this.pendingPositioningUpdate||(o.intersectionService.requestPosition(this,this.handleIntersection),o.intersectionService.requestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.requestPosition(this.viewportElement,this.handleIntersection),this.pendingPositioningUpdate=!0)},this.stopObservers=()=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,o.intersectionService.cancelRequestPosition(this,this.handleIntersection),this.anchorElement!==null&&o.intersectionService.cancelRequestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.cancelRequestPosition(this.viewportElement,this.handleIntersection)),this.resizeDetector!==null&&this.resizeDetector.disconnect()},this.getViewport=()=>typeof this.viewport!="string"||this.viewport===""?document.documentElement:document.getElementById(this.viewport),this.getAnchor=()=>document.getElementById(this.anchor),this.handleIntersection=e=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,this.applyIntersectionEntries(e)&&this.updateLayout())},this.applyIntersectionEntries=e=>{let t=e.find(s=>s.target===this),i=e.find(s=>s.target===this.anchorElement),n=e.find(s=>s.target===this.viewportElement);return t===void 0||n===void 0||i===void 0?!1:!this.regionVisible||this.forceUpdate||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0||this.isRectDifferent(this.anchorRect,i.boundingClientRect)||this.isRectDifferent(this.viewportRect,n.boundingClientRect)||this.isRectDifferent(this.regionRect,t.boundingClientRect)?(this.regionRect=t.boundingClientRect,this.anchorRect=i.boundingClientRect,this.viewportElement===document.documentElement?this.viewportRect=new DOMRectReadOnly(n.boundingClientRect.x+document.documentElement.scrollLeft,n.boundingClientRect.y+document.documentElement.scrollTop,n.boundingClientRect.width,n.boundingClientRect.height):this.viewportRect=n.boundingClientRect,this.updateRegionOffset(),this.forceUpdate=!1,!0):!1},this.updateRegionOffset=()=>{this.anchorRect&&this.regionRect&&(this.baseHorizontalOffset=this.baseHorizontalOffset+(this.anchorRect.left-this.regionRect.left)+(this.translateX-this.baseHorizontalOffset),this.baseVerticalOffset=this.baseVerticalOffset+(this.anchorRect.top-this.regionRect.top)+(this.translateY-this.baseVerticalOffset))},this.isRectDifferent=(e,t)=>Math.abs(e.top-t.top)>this.updateThreshold||Math.abs(e.right-t.right)>this.updateThreshold||Math.abs(e.bottom-t.bottom)>this.updateThreshold||Math.abs(e.left-t.left)>this.updateThreshold,this.handleResize=e=>{this.update()},this.reset=()=>{this.pendingReset&&(this.pendingReset=!1,this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.viewportElement===null&&(this.viewportElement=this.getViewport()),this.currentDirection=Me(this),this.startObservers())},this.updateLayout=()=>{let e,t;if(this.horizontalPositioningMode!=="uncontrolled"){let s=this.getPositioningOptions(this.horizontalInset);if(this.horizontalDefaultPosition==="center")t="center";else if(this.horizontalDefaultPosition!=="unset"){let b=this.horizontalDefaultPosition;if(b==="start"||b==="end"){let S=Me(this);if(S!==this.currentDirection){this.currentDirection=S,this.initialize();return}this.currentDirection===O.ltr?b=b==="start"?"left":"right":b=b==="start"?"right":"left"}switch(b){case"left":t=this.horizontalInset?"insetStart":"start";break;case"right":t=this.horizontalInset?"insetEnd":"end";break}}let a=this.horizontalThreshold!==void 0?this.horizontalThreshold:this.regionRect!==void 0?this.regionRect.width:0,l=this.anchorRect!==void 0?this.anchorRect.left:0,u=this.anchorRect!==void 0?this.anchorRect.right:0,h=this.anchorRect!==void 0?this.anchorRect.width:0,f=this.viewportRect!==void 0?this.viewportRect.left:0,m=this.viewportRect!==void 0?this.viewportRect.right:0;(t===void 0||this.horizontalPositioningMode!=="locktodefault"&&this.getAvailableSpace(t,l,u,h,f,m)<a)&&(t=this.getAvailableSpace(s[0],l,u,h,f,m)>this.getAvailableSpace(s[1],l,u,h,f,m)?s[0]:s[1])}if(this.verticalPositioningMode!=="uncontrolled"){let s=this.getPositioningOptions(this.verticalInset);if(this.verticalDefaultPosition==="center")e="center";else if(this.verticalDefaultPosition!=="unset")switch(this.verticalDefaultPosition){case"top":e=this.verticalInset?"insetStart":"start";break;case"bottom":e=this.verticalInset?"insetEnd":"end";break}let a=this.verticalThreshold!==void 0?this.verticalThreshold:this.regionRect!==void 0?this.regionRect.height:0,l=this.anchorRect!==void 0?this.anchorRect.top:0,u=this.anchorRect!==void 0?this.anchorRect.bottom:0,h=this.anchorRect!==void 0?this.anchorRect.height:0,f=this.viewportRect!==void 0?this.viewportRect.top:0,m=this.viewportRect!==void 0?this.viewportRect.bottom:0;(e===void 0||this.verticalPositioningMode!=="locktodefault"&&this.getAvailableSpace(e,l,u,h,f,m)<a)&&(e=this.getAvailableSpace(s[0],l,u,h,f,m)>this.getAvailableSpace(s[1],l,u,h,f,m)?s[0]:s[1])}let i=this.getNextRegionDimension(t,e),n=this.horizontalPosition!==t||this.verticalPosition!==e;if(this.setHorizontalPosition(t,i),this.setVerticalPosition(e,i),this.updateRegionStyle(),!this.initialLayoutComplete){this.initialLayoutComplete=!0,this.requestPositionUpdates();return}this.regionVisible||(this.regionVisible=!0,this.style.removeProperty("pointer-events"),this.style.removeProperty("opacity"),this.classList.toggle("loaded",!0),this.$emit("loaded",this,{bubbles:!1})),this.updatePositionClasses(),n&&this.$emit("positionchange",this,{bubbles:!1})},this.updateRegionStyle=()=>{this.style.width=this.regionWidth,this.style.height=this.regionHeight,this.style.transform=`translate(${this.translateX}px, ${this.translateY}px)`},this.updatePositionClasses=()=>{this.classList.toggle("top",this.verticalPosition==="start"),this.classList.toggle("bottom",this.verticalPosition==="end"),this.classList.toggle("inset-top",this.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.verticalPosition==="insetEnd"),this.classList.toggle("vertical-center",this.verticalPosition==="center"),this.classList.toggle("left",this.horizontalPosition==="start"),this.classList.toggle("right",this.horizontalPosition==="end"),this.classList.toggle("inset-left",this.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.horizontalPosition==="insetEnd"),this.classList.toggle("horizontal-center",this.horizontalPosition==="center")},this.setHorizontalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.horizontalScaling){case"anchor":case"fill":i=this.horizontalViewportLock?this.viewportRect.width:t.width,this.regionWidth=`${i}px`;break;case"content":i=this.regionRect.width,this.regionWidth="unset";break}let n=0;switch(e){case"start":this.translateX=this.baseHorizontalOffset-i,this.horizontalViewportLock&&this.anchorRect.left>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.right));break;case"insetStart":this.translateX=this.baseHorizontalOffset-i+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.right));break;case"insetEnd":this.translateX=this.baseHorizontalOffset,this.horizontalViewportLock&&this.anchorRect.left<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.left));break;case"end":this.translateX=this.baseHorizontalOffset+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.left));break;case"center":if(n=(this.anchorRect.width-i)/2,this.translateX=this.baseHorizontalOffset+n,this.horizontalViewportLock){let s=this.anchorRect.left+n,a=this.anchorRect.right-n;s<this.viewportRect.left&&!(a>this.viewportRect.right)?this.translateX=this.translateX-(s-this.viewportRect.left):a>this.viewportRect.right&&!(s<this.viewportRect.left)&&(this.translateX=this.translateX-(a-this.viewportRect.right))}break}this.horizontalPosition=e},this.setVerticalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.verticalScaling){case"anchor":case"fill":i=this.verticalViewportLock?this.viewportRect.height:t.height,this.regionHeight=`${i}px`;break;case"content":i=this.regionRect.height,this.regionHeight="unset";break}let n=0;switch(e){case"start":this.translateY=this.baseVerticalOffset-i,this.verticalViewportLock&&this.anchorRect.top>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.bottom));break;case"insetStart":this.translateY=this.baseVerticalOffset-i+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.bottom));break;case"insetEnd":this.translateY=this.baseVerticalOffset,this.verticalViewportLock&&this.anchorRect.top<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.top));break;case"end":this.translateY=this.baseVerticalOffset+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.top));break;case"center":if(n=(this.anchorRect.height-i)/2,this.translateY=this.baseVerticalOffset+n,this.verticalViewportLock){let s=this.anchorRect.top+n,a=this.anchorRect.bottom-n;s<this.viewportRect.top&&!(a>this.viewportRect.bottom)?this.translateY=this.translateY-(s-this.viewportRect.top):a>this.viewportRect.bottom&&!(s<this.viewportRect.top)&&(this.translateY=this.translateY-(a-this.viewportRect.bottom))}}this.verticalPosition=e},this.getPositioningOptions=e=>e?["insetStart","insetEnd"]:["start","end"],this.getAvailableSpace=(e,t,i,n,s,a)=>{let l=t-s,u=a-(t+n);switch(e){case"start":return l;case"insetStart":return l+n;case"insetEnd":return u+n;case"end":return u;case"center":return Math.min(l,u)*2+n}},this.getNextRegionDimension=(e,t)=>{let i={height:this.regionRect!==void 0?this.regionRect.height:0,width:this.regionRect!==void 0?this.regionRect.width:0};return e!==void 0&&this.horizontalScaling==="fill"?i.width=this.getAvailableSpace(e,this.anchorRect!==void 0?this.anchorRect.left:0,this.anchorRect!==void 0?this.anchorRect.right:0,this.anchorRect!==void 0?this.anchorRect.width:0,this.viewportRect!==void 0?this.viewportRect.left:0,this.viewportRect!==void 0?this.viewportRect.right:0):this.horizontalScaling==="anchor"&&(i.width=this.anchorRect!==void 0?this.anchorRect.width:0),t!==void 0&&this.verticalScaling==="fill"?i.height=this.getAvailableSpace(t,this.anchorRect!==void 0?this.anchorRect.top:0,this.anchorRect!==void 0?this.anchorRect.bottom:0,this.anchorRect!==void 0?this.anchorRect.height:0,this.viewportRect!==void 0?this.viewportRect.top:0,this.viewportRect!==void 0?this.viewportRect.bottom:0):this.verticalScaling==="anchor"&&(i.height=this.anchorRect!==void 0?this.anchorRect.height:0),i},this.startAutoUpdateEventListeners=()=>{window.addEventListener(Os,this.update,{passive:!0}),window.addEventListener(Ls,this.update,{passive:!0,capture:!0}),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.observe(this.viewportElement)},this.stopAutoUpdateEventListeners=()=>{window.removeEventListener(Os,this.update),window.removeEventListener(Ls,this.update),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.unobserve(this.viewportElement)}}anchorChanged(){this.initialLayoutComplete&&(this.anchorElement=this.getAnchor())}viewportChanged(){this.initialLayoutComplete&&(this.viewportElement=this.getViewport())}horizontalPositioningModeChanged(){this.requestReset()}horizontalDefaultPositionChanged(){this.updateForAttributeChange()}horizontalViewportLockChanged(){this.updateForAttributeChange()}horizontalInsetChanged(){this.updateForAttributeChange()}horizontalThresholdChanged(){this.updateForAttributeChange()}horizontalScalingChanged(){this.updateForAttributeChange()}verticalPositioningModeChanged(){this.requestReset()}verticalDefaultPositionChanged(){this.updateForAttributeChange()}verticalViewportLockChanged(){this.updateForAttributeChange()}verticalInsetChanged(){this.updateForAttributeChange()}verticalThresholdChanged(){this.updateForAttributeChange()}verticalScalingChanged(){this.updateForAttributeChange()}fixedPlacementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}autoUpdateModeChanged(e,t){this.$fastController.isConnected&&this.initialLayoutComplete&&(e==="auto"&&this.stopAutoUpdateEventListeners(),t==="auto"&&this.startAutoUpdateEventListeners())}anchorElementChanged(){this.requestReset()}viewportElementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}connectedCallback(){super.connectedCallback(),this.autoUpdateMode==="auto"&&this.startAutoUpdateEventListeners(),this.initialize()}disconnectedCallback(){super.disconnectedCallback(),this.autoUpdateMode==="auto"&&this.stopAutoUpdateEventListeners(),this.stopObservers(),this.disconnectResizeDetector()}adoptedCallback(){this.initialize()}disconnectResizeDetector(){this.resizeDetector!==null&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.handleResize)}updateForAttributeChange(){this.$fastController.isConnected&&this.initialLayoutComplete&&(this.forceUpdate=!0,this.update())}initialize(){this.initializeResizeDetector(),this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.requestReset()}requestReset(){this.$fastController.isConnected&&this.pendingReset===!1&&(this.setInitialState(),y.queueUpdate(()=>this.reset()),this.pendingReset=!0)}setInitialState(){this.initialLayoutComplete=!1,this.regionVisible=!1,this.translateX=0,this.translateY=0,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.viewportRect=void 0,this.regionRect=void 0,this.anchorRect=void 0,this.verticalPosition=void 0,this.horizontalPosition=void 0,this.style.opacity="0",this.style.pointerEvents="none",this.forceUpdate=!1,this.style.position=this.fixedPlacement?"fixed":"absolute",this.updatePositionClasses(),this.updateRegionStyle()}};te.intersectionService=new Ni;r([d],te.prototype,"anchor",void 0);r([d],te.prototype,"viewport",void 0);r([d({attribute:"horizontal-positioning-mode"})],te.prototype,"horizontalPositioningMode",void 0);r([d({attribute:"horizontal-default-position"})],te.prototype,"horizontalDefaultPosition",void 0);r([d({attribute:"horizontal-viewport-lock",mode:"boolean"})],te.prototype,"horizontalViewportLock",void 0);r([d({attribute:"horizontal-inset",mode:"boolean"})],te.prototype,"horizontalInset",void 0);r([d({attribute:"horizontal-threshold"})],te.prototype,"horizontalThreshold",void 0);r([d({attribute:"horizontal-scaling"})],te.prototype,"horizontalScaling",void 0);r([d({attribute:"vertical-positioning-mode"})],te.prototype,"verticalPositioningMode",void 0);r([d({attribute:"vertical-default-position"})],te.prototype,"verticalDefaultPosition",void 0);r([d({attribute:"vertical-viewport-lock",mode:"boolean"})],te.prototype,"verticalViewportLock",void 0);r([d({attribute:"vertical-inset",mode:"boolean"})],te.prototype,"verticalInset",void 0);r([d({attribute:"vertical-threshold"})],te.prototype,"verticalThreshold",void 0);r([d({attribute:"vertical-scaling"})],te.prototype,"verticalScaling",void 0);r([d({attribute:"fixed-placement",mode:"boolean"})],te.prototype,"fixedPlacement",void 0);r([d({attribute:"auto-update-mode"})],te.prototype,"autoUpdateMode",void 0);r([p],te.prototype,"anchorElement",void 0);r([p],te.prototype,"viewportElement",void 0);r([p],te.prototype,"initialLayoutComplete",void 0)});var Bs,zs,Hs,Ns,wc,Vs,Cc,kc=c(()=>{Bs={horizontalDefaultPosition:"center",horizontalPositioningMode:"locktodefault",horizontalInset:!1,horizontalScaling:"anchor"},zs=Object.assign(Object.assign({},Bs),{verticalDefaultPosition:"top",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),Hs=Object.assign(Object.assign({},Bs),{verticalDefaultPosition:"bottom",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),Ns=Object.assign(Object.assign({},Bs),{verticalPositioningMode:"dynamic",verticalInset:!1,verticalScaling:"content"}),wc=Object.assign(Object.assign({},zs),{verticalScaling:"fill"}),Vs=Object.assign(Object.assign({},Hs),{verticalScaling:"fill"}),Cc=Object.assign(Object.assign({},Ns),{verticalScaling:"fill"})});var _s=c(()=>{vc();xc();kc()});var $c=c(()=>{});var bo,Sc=c(()=>{I();g();R();bo=class extends v{connectedCallback(){super.connectedCallback(),this.shape||(this.shape="circle")}};r([d],bo.prototype,"fill",void 0);r([d],bo.prototype,"color",void 0);r([d],bo.prototype,"link",void 0);r([d],bo.prototype,"shape",void 0)});var Ic=c(()=>{$c();Sc()});var Vi,Tc=c(()=>{g();Vi=(o,e)=>k`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`});var mt,Ec=c(()=>{I();g();R();mt=class extends v{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;let e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}};r([d({attribute:"fill"})],mt.prototype,"fill",void 0);r([d({attribute:"color"})],mt.prototype,"color",void 0);r([d({mode:"boolean"})],mt.prototype,"circular",void 0)});var Rc=c(()=>{Tc();Ec()});var Dc=c(()=>{});var eo,Us=c(()=>{I();g();Ps();Jt();pe();eo=class extends xe{constructor(){super(...arguments),this.separator=!0}};r([p],eo.prototype,"separator",void 0);A(eo,N,Kt)});var Ac=c(()=>{Dc();Us()});var Fc=c(()=>{});var js,Oc=c(()=>{I();g();Us();R();js=class extends v{slottedBreadcrumbItemsChanged(){if(this.$fastController.isConnected){if(this.slottedBreadcrumbItems===void 0||this.slottedBreadcrumbItems.length===0)return;let e=this.slottedBreadcrumbItems[this.slottedBreadcrumbItems.length-1];this.slottedBreadcrumbItems.forEach(t=>{let i=t===e;this.setItemSeparator(t,i),this.setAriaCurrent(t,i)})}}setItemSeparator(e,t){e instanceof eo&&(e.separator=!t)}findChildWithHref(e){var t,i;return e.childElementCount>0?e.querySelector("a[href]"):!((t=e.shadowRoot)===null||t===void 0)&&t.childElementCount?(i=e.shadowRoot)===null||i===void 0?void 0:i.querySelector("a[href]"):null}setAriaCurrent(e,t){let i=this.findChildWithHref(e);i===null&&e.hasAttribute("href")&&e instanceof eo?t?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current"):i!==null&&(t?i.setAttribute("aria-current","page"):i.removeAttribute("aria-current"))}};r([p],js.prototype,"slottedBreadcrumbItems",void 0)});var Lc=c(()=>{Fc();Oc()});var Mc,Pc=c(()=>{g();be();Mc=(o,e)=>k`
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
        ${_e(o,e)}
        <span class="content" part="content">
            <slot ${K("defaultSlottedContent")}></slot>
        </span>
        ${Ve(o,e)}
    </button>
`});function de(o){let e=class extends o{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return Hc}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){let t=this.proxy.labels,i=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),n=t?i.concat(Array.from(t)):i;return Object.freeze(n)}else return ze}valueChanged(t,i){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,i){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),y.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),y.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!Hc)return null;let t=Nc.get(this);return t||(t=this.attachInternals(),Nc.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){super.disconnectedCallback(),this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,i,n){this.elementInternals?this.elementInternals.setValidity(t,i,n):typeof i=="string"&&this.proxy.setCustomValidity(i)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(i=>this.proxy.addEventListener(i,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",Bc),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",Bc)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(t){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage,t)}setFormValue(t,i){this.elementInternals&&this.elementInternals.setFormValue(t,i||t)}_keypressHandler(t){switch(t.key){case ee:if(this.form instanceof HTMLFormElement){let i=this.form.querySelector("[type=submit]");i?.click()}break}}stopPropagation(t){t.stopPropagation()}};return d({mode:"boolean"})(e.prototype,"disabled"),d({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),d({attribute:"current-value"})(e.prototype,"currentValue"),d(e.prototype,"name"),d({mode:"boolean"})(e.prototype,"required"),p(e.prototype,"value"),e}function go(o){class e extends de(o){}class t extends e{constructor(...n){super(n),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(n,s){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),n!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(n,s){this.checked=this.currentChecked}updateForm(){let n=this.checked?this.value:null;this.setFormValue(n,n)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return d({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),d({attribute:"current-checked",converter:Gt})(t.prototype,"currentChecked"),p(t.prototype,"defaultChecked"),p(t.prototype,"checked"),t}var Bc,zc,Hc,Nc,Re=c(()=>{g();L();Bc="form-associated-proxy",zc="ElementInternals",Hc=zc in window&&"setFormValue"in window[zc].prototype,Nc=new WeakMap});var qs,_i,Vc=c(()=>{Re();R();qs=class extends v{},_i=class extends de(qs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var De,vo,_c=c(()=>{I();g();Jt();pe();Vc();De=class extends _i{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;let e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}validate(){super.validate(this.control)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.removeEventListener("click",this.handleClick)})}};r([d({mode:"boolean"})],De.prototype,"autofocus",void 0);r([d({attribute:"form"})],De.prototype,"formId",void 0);r([d],De.prototype,"formaction",void 0);r([d],De.prototype,"formenctype",void 0);r([d],De.prototype,"formmethod",void 0);r([d({mode:"boolean"})],De.prototype,"formnovalidate",void 0);r([d],De.prototype,"formtarget",void 0);r([d],De.prototype,"type",void 0);r([p],De.prototype,"defaultSlottedContent",void 0);vo=class{};r([d({attribute:"aria-expanded"})],vo.prototype,"ariaExpanded",void 0);r([d({attribute:"aria-pressed"})],vo.prototype,"ariaPressed",void 0);A(vo,P);A(De,N,vo)});var Uc=c(()=>{Pc();_c()});var Ui,Gs=c(()=>{Ui=class{constructor(e){if(this.dayFormat="numeric",this.weekdayFormat="long",this.monthFormat="long",this.yearFormat="numeric",this.date=new Date,e)for(let t in e){let i=e[t];t==="date"?this.date=this.getDateObject(i):this[t]=i}}getDateObject(e){if(typeof e=="string"){let t=e.split(/[/-]/);return t.length<3?new Date:new Date(parseInt(t[2],10),parseInt(t[0],10)-1,parseInt(t[1],10))}else if("day"in e&&"month"in e&&"year"in e){let{day:t,month:i,year:n}=e;return new Date(n,i-1,t)}return e}getDate(e=this.date,t={weekday:this.weekdayFormat,month:this.monthFormat,day:this.dayFormat,year:this.yearFormat},i=this.locale){let n=this.getDateObject(e);if(!n.getTime())return"";let s=Object.assign({timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},t);return new Intl.DateTimeFormat(i,s).format(n)}getDay(e=this.date.getDate(),t=this.dayFormat,i=this.locale){return this.getDate({month:1,day:e,year:2020},{day:t},i)}getMonth(e=this.date.getMonth()+1,t=this.monthFormat,i=this.locale){return this.getDate({month:e,day:2,year:2020},{month:t},i)}getYear(e=this.date.getFullYear(),t=this.yearFormat,i=this.locale){return this.getDate({month:2,day:2,year:e},{year:t},i)}getWeekday(e=0,t=this.weekdayFormat,i=this.locale){let n=`1-${e+1}-2017`;return this.getDate(n,{weekday:t},i)}getWeekdays(e=this.weekdayFormat,t=this.locale){return Array(7).fill(null).map((i,n)=>this.getWeekday(n,e,t))}}});var Pe,jc=c(()=>{I();g();L();R();Gs();Pe=class extends v{constructor(){super(...arguments),this.dateFormatter=new Ui,this.readonly=!1,this.locale="en-US",this.month=new Date().getMonth()+1,this.year=new Date().getFullYear(),this.dayFormat="numeric",this.weekdayFormat="short",this.monthFormat="long",this.yearFormat="numeric",this.minWeeks=0,this.disabledDates="",this.selectedDates="",this.oneDayInMs=864e5}localeChanged(){this.dateFormatter.locale=this.locale}dayFormatChanged(){this.dateFormatter.dayFormat=this.dayFormat}weekdayFormatChanged(){this.dateFormatter.weekdayFormat=this.weekdayFormat}monthFormatChanged(){this.dateFormatter.monthFormat=this.monthFormat}yearFormatChanged(){this.dateFormatter.yearFormat=this.yearFormat}getMonthInfo(e=this.month,t=this.year){let i=u=>new Date(u.getFullYear(),u.getMonth(),1).getDay(),n=u=>{let h=new Date(u.getFullYear(),u.getMonth()+1,1);return new Date(h.getTime()-this.oneDayInMs).getDate()},s=new Date(t,e-1),a=new Date(t,e),l=new Date(t,e-2);return{length:n(s),month:e,start:i(s),year:t,previous:{length:n(l),month:l.getMonth()+1,start:i(l),year:l.getFullYear()},next:{length:n(a),month:a.getMonth()+1,start:i(a),year:a.getFullYear()}}}getDays(e=this.getMonthInfo(),t=this.minWeeks){t=t>10?10:t;let{start:i,length:n,previous:s,next:a}=e,l=[],u=1-i;for(;u<n+1||l.length<t||l[l.length-1].length%7!==0;){let{month:h,year:f}=u<1?s:u>n?a:e,m=u<1?s.length+u:u>n?u-n:u,b=`${h}-${m}-${f}`,S=this.dateInString(b,this.disabledDates),E=this.dateInString(b,this.selectedDates),J={day:m,month:h,year:f,disabled:S,selected:E},se=l[l.length-1];l.length===0||se.length%7===0?l.push([J]):se.push(J),u++}return l}dateInString(e,t){let i=t.split(",").map(n=>n.trim());return e=typeof e=="string"?e:`${e.getMonth()+1}-${e.getDate()}-${e.getFullYear()}`,i.some(n=>n===e)}getDayClassNames(e,t){let{day:i,month:n,year:s,disabled:a,selected:l}=e,u=t===`${n}-${i}-${s}`,h=this.month!==n;return["day",u&&"today",h&&"inactive",a&&"disabled",l&&"selected"].filter(Boolean).join(" ")}getWeekdayText(){let e=this.dateFormatter.getWeekdays().map(t=>({text:t}));if(this.weekdayFormat!=="long"){let t=this.dateFormatter.getWeekdays("long");e.forEach((i,n)=>{i.abbr=t[n]})}return e}handleDateSelect(e,t){e.preventDefault,this.$emit("dateselected",t)}handleKeydown(e,t){return e.key===ee&&this.handleDateSelect(e,t),!0}};r([d({mode:"boolean"})],Pe.prototype,"readonly",void 0);r([d],Pe.prototype,"locale",void 0);r([d({converter:F})],Pe.prototype,"month",void 0);r([d({converter:F})],Pe.prototype,"year",void 0);r([d({attribute:"day-format",mode:"fromView"})],Pe.prototype,"dayFormat",void 0);r([d({attribute:"weekday-format",mode:"fromView"})],Pe.prototype,"weekdayFormat",void 0);r([d({attribute:"month-format",mode:"fromView"})],Pe.prototype,"monthFormat",void 0);r([d({attribute:"year-format",mode:"fromView"})],Pe.prototype,"yearFormat",void 0);r([d({attribute:"min-weeks",converter:F})],Pe.prototype,"minWeeks",void 0);r([d({attribute:"disabled-dates"})],Pe.prototype,"disabledDates",void 0);r([d({attribute:"selected-dates"})],Pe.prototype,"selectedDates",void 0)});var to,Qe,bt,ji=c(()=>{to={none:"none",default:"default",sticky:"sticky"},Qe={default:"default",columnHeader:"columnheader",rowHeader:"rowheader"},bt={default:"default",header:"header",stickyHeader:"sticky-header"}});var le,Ws=c(()=>{I();g();L();R();ji();le=class extends v{constructor(){super(...arguments),this.rowType=bt.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new ut(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(pt,this.handleFocusout),this.addEventListener(ft,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(pt,this.handleFocusout),this.removeEventListener(ft,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case ve:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case ye:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case re:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case ae:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===bt.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===bt.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}};r([d({attribute:"grid-template-columns"})],le.prototype,"gridTemplateColumns",void 0);r([d({attribute:"row-type"})],le.prototype,"rowType",void 0);r([p],le.prototype,"rowData",void 0);r([p],le.prototype,"columnDefinitions",void 0);r([p],le.prototype,"cellItemTemplate",void 0);r([p],le.prototype,"headerCellItemTemplate",void 0);r([p],le.prototype,"rowIndex",void 0);r([p],le.prototype,"isActiveRow",void 0);r([p],le.prototype,"activeCellItemTemplate",void 0);r([p],le.prototype,"defaultCellItemTemplate",void 0);r([p],le.prototype,"defaultHeaderCellItemTemplate",void 0);r([p],le.prototype,"cellElements",void 0)});function $m(o){let e=o.tagFor(le);return k`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,i)=>i.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,i)=>i.parent.headerCellItemTemplate}"
    ></${e}>
`}var qc,Gc=c(()=>{g();Ws();qc=(o,e)=>{let t=$m(o),i=o.tagFor(le);return k`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>i}"
            :defaultRowItemTemplate="${t}"
            ${Ei({property:"rowElements",filter:Qt("[role=row]")})}
        >
            <slot></slot>
        </template>
    `}});var ue,Wc=c(()=>{I();g();L();R();ji();ue=class o extends v{constructor(){super(),this.noTabbing=!1,this.generateHeader=to.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,i)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}let n=Math.max(0,Math.min(this.rowElements.length-1,e)),a=this.rowElements[n].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),l=Math.max(0,Math.min(a.length-1,t)),u=a[l];i&&this.scrollHeight!==this.clientHeight&&(n<this.focusRowIndex&&this.scrollTop>0||n>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&u.scrollIntoView({block:"center",inline:"center"}),u.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(i=>{i.addedNodes.forEach(n=>{n.nodeType===1&&n.getAttribute("role")==="row"&&(n.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,y.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){let t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,i)=>{let n=t;n.rowIndex=i,n.gridTemplateColumns=e,this.columnDefinitionsStale&&(n.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(i=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=o.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=o.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new ut(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(As,this.handleFocus),this.addEventListener(ft,this.handleKeydown),this.addEventListener(pt,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),y.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(As,this.handleFocus),this.removeEventListener(ft,this.handleKeydown),this.removeEventListener(pt,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;let t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t,i=this.rowElements.length-1,n=this.offsetHeight+this.scrollTop,s=this.rowElements[i];switch(e.key){case Q:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case Y:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case tc:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){let a=this.rowElements[t];if(a.offsetTop<this.scrollTop){this.scrollTop=a.offsetTop+a.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case ec:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=i||s.offsetTop+s.offsetHeight<=n){this.focusOnCell(i,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=i;t++){let a=this.rowElements[t];if(a.offsetTop+a.offsetHeight>n){let l=0;this.generateHeader===to.sticky&&this.generatedHeader!==null&&(l=this.generatedHeader.clientHeight),this.scrollTop=a.offsetTop-l;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case re:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case ae:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,y.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==to.none&&this.rowsData.length>0){let e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===to.sticky?bt.stickyHeader:bt.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}};ue.generateColumns=o=>Object.getOwnPropertyNames(o).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));r([d({attribute:"no-tabbing",mode:"boolean"})],ue.prototype,"noTabbing",void 0);r([d({attribute:"generate-header"})],ue.prototype,"generateHeader",void 0);r([d({attribute:"grid-template-columns"})],ue.prototype,"gridTemplateColumns",void 0);r([p],ue.prototype,"rowsData",void 0);r([p],ue.prototype,"columnDefinitions",void 0);r([p],ue.prototype,"rowItemTemplate",void 0);r([p],ue.prototype,"cellItemTemplate",void 0);r([p],ue.prototype,"headerCellItemTemplate",void 0);r([p],ue.prototype,"focusRowIndex",void 0);r([p],ue.prototype,"focusColumnIndex",void 0);r([p],ue.prototype,"defaultRowItemTemplate",void 0);r([p],ue.prototype,"rowElementTag",void 0);r([p],ue.prototype,"rowElements",void 0)});var Sm,Im,Ue,Ys=c(()=>{I();g();L();R();ji();Sm=k`
    <template>
        ${o=>o.rowData===null||o.columnDefinition===null||o.columnDefinition.columnDataKey===null?null:o.rowData[o.columnDefinition.columnDataKey]}
    </template>
`,Im=k`
    <template>
        ${o=>o.columnDefinition===null?null:o.columnDefinition.title===void 0?o.columnDefinition.columnDataKey:o.columnDefinition.title}
    </template>
`,Ue=class extends v{constructor(){super(...arguments),this.cellType=Qe.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(Fs,this.handleFocusin),this.addEventListener(pt,this.handleFocusout),this.addEventListener(ft,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Fs,this.handleFocusin),this.removeEventListener(pt,this.handleFocusout),this.removeEventListener(ft,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case Qe.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===Qe.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===Qe.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case ee:case Kl:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case Qe.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case Te:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case Qe.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=Im.render(this,this);break;case void 0:case Qe.rowHeader:case Qe.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=Sm.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}};r([d({attribute:"cell-type"})],Ue.prototype,"cellType",void 0);r([d({attribute:"grid-column"})],Ue.prototype,"gridColumn",void 0);r([p],Ue.prototype,"rowData",void 0);r([p],Ue.prototype,"columnDefinition",void 0)});function Tm(o){let e=o.tagFor(Ue);return k`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,i)=>i.index+1}"
        :rowData="${(t,i)=>i.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function Em(o){let e=o.tagFor(Ue);return k`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,i)=>i.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}var Yc,Qc=c(()=>{g();Ys();Yc=(o,e)=>{let t=Tm(o),i=Em(o);return k`
        <template
            role="row"
            class="${n=>n.rowType!=="default"?n.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${i}"
            ${Ei({property:"cellElements",filter:Qt('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${K("slottedCellElements")}></slot>
        </template>
    `}});var Xc,Zc=c(()=>{g();Xc=(o,e)=>k`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `});var Jc=c(()=>{Gc();Wc();Qc();Ws();Zc();Ys()});var IC,Kc=c(()=>{g();IC=k`
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
`});var ed=c(()=>{jc();Kc();Gs()});var td=c(()=>{});var od=c(()=>{});var id=c(()=>{td();od()});var nd,sd=c(()=>{g();nd=(o,e)=>k`
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
`});var Qs,qi,rd=c(()=>{Re();R();Qs=class extends v{},qi=class extends go(Qs){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var oo,ad=c(()=>{I();g();L();rd();oo=class extends qi{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{this.readOnly||e.key===Ee&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}};r([d({attribute:"readonly",mode:"boolean"})],oo.prototype,"readOnly",void 0);r([p],oo.prototype,"defaultSlottedNodes",void 0);r([p],oo.prototype,"indeterminate",void 0)});var ld=c(()=>{sd();ad()});function Xs(o){return it(o)&&(o.getAttribute("role")==="option"||o instanceof HTMLOptionElement)}var je,Bt,Zs=c(()=>{I();g();L();R();Wo();be();pe();je=class extends v{constructor(e,t,i,n){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),i&&(this.defaultSelected=i),n&&(this.selected=n),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){let t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),C.notify(this,"value")}get value(){var e;return C.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}};r([p],je.prototype,"checked",void 0);r([p],je.prototype,"content",void 0);r([p],je.prototype,"defaultSelected",void 0);r([d({mode:"boolean"})],je.prototype,"disabled",void 0);r([d({attribute:"selected",mode:"boolean"})],je.prototype,"selectedAttribute",void 0);r([p],je.prototype,"selected",void 0);r([d({attribute:"value",mode:"fromView"})],je.prototype,"initialValue",void 0);Bt=class{};r([p],Bt.prototype,"ariaChecked",void 0);r([p],Bt.prototype,"ariaPosInSet",void 0);r([p],Bt.prototype,"ariaSelected",void 0);r([p],Bt.prototype,"ariaSetSize",void 0);A(Bt,P);A(je,N,Bt)});var fe,qe,io=c(()=>{I();g();L();R();Zs();Wo();pe();fe=class o extends v{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return C.track(this,"options"),this._options}set options(e){this._options=e,C.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){let t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){let e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(i=>i.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){let i=e>t?-1:e<t?1:0,n=e+i,s=null;switch(i){case-1:{s=this.options.reduceRight((a,l,u)=>!a&&!l.disabled&&u<n?l:a,s);break}case 1:{s=this.options.reduce((a,l,u)=>!a&&!l.disabled&&u>n?l:a,s);break}}return this.options.indexOf(s)}handleChange(e,t){t==="selected"&&(o.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions())}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,o.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;let t=e.key;switch(t){case re:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case Y:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case Q:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case ae:{e.preventDefault(),this.selectLastOption();break}case Ot:return this.focusAndScrollOptionIntoView(),!0;case ee:case Te:return!0;case Ee:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var i;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(!((i=this.options[this.selectedIndex])===null||i===void 0)&&i.disabled&&typeof e=="number"){let n=this.getSelectableIndex(e,t),s=n>-1?n:e;this.selectedIndex=s,t===s&&this.selectedIndexChanged(t,s);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var i;let n=t.filter(o.slottedOptionFilter);(i=this.options)===null||i===void 0||i.forEach(s=>{let a=C.getNotifier(s);a.unsubscribe(this,"selected"),s.selected=n.includes(s),a.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>!i.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=Nl(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>i.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,i;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&i!==void 0?i:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((n,s)=>(Xs(s)&&n.push(s),n),[]);let i=`${this.options.length}`;this.options.forEach((n,s)=>{n.id||(n.id=Le("option-")),n.ariaPosInSet=`${s+1}`,n.ariaSetSize=i}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){let i=this.getTypeaheadMatches();if(i.length){let n=this.options.indexOf(i[0]);n>-1&&(this.selectedIndex=n)}this.typeaheadExpired=!1}}};fe.slottedOptionFilter=o=>Xs(o)&&!o.hidden;fe.TYPE_AHEAD_TIMEOUT_MS=1e3;r([d({mode:"boolean"})],fe.prototype,"disabled",void 0);r([p],fe.prototype,"selectedIndex",void 0);r([p],fe.prototype,"selectedOptions",void 0);r([p],fe.prototype,"slottedOptions",void 0);r([p],fe.prototype,"typeaheadBuffer",void 0);qe=class{};r([p],qe.prototype,"ariaActiveDescendant",void 0);r([p],qe.prototype,"ariaDisabled",void 0);r([p],qe.prototype,"ariaExpanded",void 0);r([p],qe.prototype,"ariaMultiSelectable",void 0);A(qe,P);A(fe,qe)});var nt,Gi=c(()=>{nt={above:"above",below:"below"}});var Js,Wi,cd=c(()=>{Re();io();Js=class extends fe{},Wi=class extends de(Js){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Yo,Ks=c(()=>{Yo={inline:"inline",list:"list",both:"both",none:"none"}});var gt,yo,dd=c(()=>{I();g();L();io();be();Gi();pe();cd();Ks();gt=class extends Wi{constructor(){super(...arguments),this._value="",this.filteredOptions=[],this.filter="",this.forcedPosition=!1,this.listboxId=Le("listbox-"),this.maxHeight=0,this.open=!1}formResetCallback(){super.formResetCallback(),this.setDefaultSelectedOption(),this.updateValue()}validate(){super.validate(this.control)}get isAutocompleteInline(){return this.autocomplete===Yo.inline||this.isAutocompleteBoth}get isAutocompleteList(){return this.autocomplete===Yo.list||this.isAutocompleteBoth}get isAutocompleteBoth(){return this.autocomplete===Yo.both}openChanged(){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),y.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}get options(){return C.track(this,"options"),this.filteredOptions.length?this.filteredOptions:this._options}set options(e){this._options=e,C.notify(this,"options")}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}get value(){return C.track(this,"value"),this._value}set value(e){var t,i,n;let s=`${this._value}`;if(this.$fastController.isConnected&&this.options){let a=this.options.findIndex(h=>h.text.toLowerCase()===e.toLowerCase()),l=(t=this.options[this.selectedIndex])===null||t===void 0?void 0:t.text,u=(i=this.options[a])===null||i===void 0?void 0:i.text;this.selectedIndex=l!==u?a:this.selectedIndex,e=((n=this.firstSelectedOption)===null||n===void 0?void 0:n.text)||e}s!==e&&(this._value=e,super.valueChanged(s,e),C.notify(this,"value"))}clickHandler(e){let t=e.target.closest("option,[role=option]");if(!(this.disabled||t?.disabled)){if(this.open){if(e.composedPath()[0]===this.control)return;t&&(this.selectedOptions=[t],this.control.value=t.text,this.clearSelectionRange(),this.updateValue(!0))}return this.open=!this.open,this.open&&this.control.focus(),!0}}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.value&&(this.initialValue=this.value)}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}filterOptions(){(!this.autocomplete||this.autocomplete===Yo.none)&&(this.filter="");let e=this.filter.toLowerCase();this.filteredOptions=this._options.filter(t=>t.text.toLowerCase().startsWith(this.filter.toLowerCase())),this.isAutocompleteList&&(!this.filteredOptions.length&&!e&&(this.filteredOptions=this._options),this._options.forEach(t=>{t.hidden=!this.filteredOptions.includes(t)}))}focusAndScrollOptionIntoView(){this.contains(document.activeElement)&&(this.control.focus(),this.firstSelectedOption&&requestAnimationFrame(()=>{var e;(e=this.firstSelectedOption)===null||e===void 0||e.scrollIntoView({block:"nearest"})}))}focusoutHandler(e){if(this.syncValue(),!this.open)return!0;let t=e.relatedTarget;if(this.isSameNode(t)){this.focus();return}(!this.options||!this.options.includes(t))&&(this.open=!1)}inputHandler(e){if(this.filter=this.control.value,this.filterOptions(),this.isAutocompleteInline||(this.selectedIndex=this.options.map(t=>t.text).indexOf(this.control.value)),e.inputType.includes("deleteContent")||!this.filter.length)return!0;this.isAutocompleteList&&!this.open&&(this.open=!0),this.isAutocompleteInline&&(this.filteredOptions.length?(this.selectedOptions=[this.filteredOptions[0]],this.selectedIndex=this.options.indexOf(this.firstSelectedOption),this.setInlineSelection()):this.selectedIndex=-1)}keydownHandler(e){let t=e.key;if(e.ctrlKey||e.shiftKey)return!0;switch(t){case"Enter":{this.syncValue(),this.isAutocompleteInline&&(this.filter=this.value),this.open=!1,this.clearSelectionRange();break}case"Escape":{if(this.isAutocompleteInline||(this.selectedIndex=-1),this.open){this.open=!1;break}this.value="",this.control.value="",this.filter="",this.filterOptions();break}case"Tab":{if(this.setInputToSelection(),!this.open)return!0;e.preventDefault(),this.open=!1;break}case"ArrowUp":case"ArrowDown":{if(this.filterOptions(),!this.open){this.open=!0;break}this.filteredOptions.length>0&&super.keydownHandler(e),this.isAutocompleteInline&&this.setInlineSelection();break}default:return!0}}keyupHandler(e){switch(e.key){case"ArrowLeft":case"ArrowRight":case"Backspace":case"Delete":case"Home":case"End":{this.filter=this.control.value,this.selectedIndex=-1,this.filterOptions();break}}}selectedIndexChanged(e,t){if(this.$fastController.isConnected){if(t=Mt(-1,this.options.length-1,t),t!==this.selectedIndex){this.selectedIndex=t;return}super.selectedIndexChanged(e,t)}}selectPreviousOption(){!this.disabled&&this.selectedIndex>=0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){if(this.$fastController.isConnected&&this.options){let e=this.options.findIndex(t=>t.getAttribute("selected")!==null||t.selected);this.selectedIndex=e,!this.dirtyValue&&this.firstSelectedOption&&(this.value=this.firstSelectedOption.text),this.setSelectedOptions()}}setInputToSelection(){this.firstSelectedOption&&(this.control.value=this.firstSelectedOption.text,this.control.focus())}setInlineSelection(){this.firstSelectedOption&&(this.setInputToSelection(),this.control.setSelectionRange(this.filter.length,this.control.value.length,"backward"))}syncValue(){var e;let t=this.selectedIndex>-1?(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text:this.control.value;this.updateValue(this.value!==t)}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?nt.above:nt.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===nt.above?~~e.top:~~i}selectedOptionsChanged(e,t){this.$fastController.isConnected&&this._options.forEach(i=>{i.selected=t.includes(i)})}slottedOptionsChanged(e,t){super.slottedOptionsChanged(e,t),this.updateValue()}updateValue(e){var t;this.$fastController.isConnected&&(this.value=((t=this.firstSelectedOption)===null||t===void 0?void 0:t.text)||this.control.value,this.control.value=this.value),e&&this.$emit("change")}clearSelectionRange(){let e=this.control.value.length;this.control.setSelectionRange(e,e)}};r([d({attribute:"autocomplete",mode:"fromView"})],gt.prototype,"autocomplete",void 0);r([p],gt.prototype,"maxHeight",void 0);r([d({attribute:"open",mode:"boolean"})],gt.prototype,"open",void 0);r([d],gt.prototype,"placeholder",void 0);r([d({attribute:"position"})],gt.prototype,"positionAttribute",void 0);r([p],gt.prototype,"position",void 0);yo=class{};r([p],yo.prototype,"ariaAutoComplete",void 0);r([p],yo.prototype,"ariaControls",void 0);A(yo,qe);A(gt,N,yo)});var ud=c(()=>{});var hd=c(()=>{dd();Ks();ud()});function Qo(o){let e=o.parentElement;if(e)return e;{let t=o.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}var Yi=c(()=>{});function pd(o,e){let t=e;for(;t!==null;){if(t===o)return!0;t=Qo(t)}return!1}var fd=c(()=>{Yi()});function Rm(o){return o instanceof Ft}var st,Xo,tr,or,ir,Qi,nr,zt,er,Dm,no,sr=c(()=>{I();g();st=document.createElement("div");Xo=class{setProperty(e,t){y.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){y.queueUpdate(()=>this.target.removeProperty(e))}},tr=class extends Xo{constructor(e){super();let t=new CSSStyleSheet;t[Ci]=!0,this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(ie.create([t]))}},or=class extends Xo{constructor(){super();let e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}},ir=class extends Xo{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);let{sheet:e}=this.style;if(e){let t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}},Qi=class{constructor(e){this.store=new Map,this.target=null;let t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),C.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(let[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),y.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),y.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){let{sheet:i}=this.style;if(i){let n=i.insertRule(":host{}",i.cssRules.length);this.target=i.cssRules[n].style}else this.target=null}};r([p],Qi.prototype,"target",void 0);nr=class{constructor(e){this.target=e.style}setProperty(e,t){y.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){y.queueUpdate(()=>this.target.removeProperty(e))}},zt=class o{setProperty(e,t){o.properties[e]=t;for(let i of o.roots.values())no.getOrCreate(o.normalizeRoot(i)).setProperty(e,t)}removeProperty(e){delete o.properties[e];for(let t of o.roots.values())no.getOrCreate(o.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){let{roots:t}=o;if(!t.has(e)){t.add(e);let i=no.getOrCreate(this.normalizeRoot(e));for(let n in o.properties)i.setProperty(n,o.properties[n])}}static unregisterRoot(e){let{roots:t}=o;if(t.has(e)){t.delete(e);let i=no.getOrCreate(o.normalizeRoot(e));for(let n in o.properties)i.removeProperty(n)}}static normalizeRoot(e){return e===st?document:e}};zt.roots=new Set;zt.properties={};er=new WeakMap,Dm=y.supportsAdoptedStyleSheets?tr:Qi,no=Object.freeze({getOrCreate(o){if(er.has(o))return er.get(o);let e;return o===st?e=new zt:o instanceof Document?e=y.supportsAdoptedStyleSheets?new or:new ir:Rm(o)?e=new Dm(o):e=new nr(o),er.set(o,e),e}})});function Am(o){return Xe.from(o)}var Xe,rr,ar,lr,Zo,Jo,ke,Ko,cr=c(()=>{I();g();Yi();fd();sr();sr();Xe=class o extends Wt{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=o.uniqueId(),o.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new o({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return o.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){let t=ke.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof o&&(t=this.alias(t)),ke.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),ke.existsFor(e)&&ke.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(st,e),this}subscribe(e,t){let i=this.getOrCreateSubscriberSet(t);t&&!ke.existsFor(t)&&ke.getOrCreate(t),i.has(e)||i.add(e)}unsubscribe(e,t){let i=this.subscribers.get(t||this);i&&i.has(e)&&i.delete(e)}notify(e){let t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(i=>i.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(i=>i.handleChange(t))}alias(e){return(t=>e.getValueFor(t))}};Xe.uniqueId=(()=>{let o=0;return()=>(o++,o.toString(16))})();Xe.tokensById=new Map;rr=class{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){let{token:t,target:i}=e;this.add(t,i)}add(e,t){no.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(ke.getOrCreate(t).get(e)))}remove(e,t){no.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}},ar=class{constructor(e,t,i){this.source=e,this.token=t,this.node=i,this.dependencies=new Set,this.observer=C.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){try{this.node.store.set(this.token,this.observer.observe(this.node.target,Et))}catch(e){console.error(e)}}},lr=class{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),C.getNotifier(this).notify(e.id))}get(e){return C.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e),C.getNotifier(this).notify(e.id)}all(){return this.values.entries()}},Zo=new WeakMap,Jo=new WeakMap,ke=class o{constructor(e){this.target=e,this.store=new lr,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,i)=>{let n=Xe.getTokenById(i);n&&(n.notify(this.target),this.updateCSSTokenReflection(t,n))}},Zo.set(e,this),C.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof Ft?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return Zo.get(e)||new o(e)}static existsFor(e){return Zo.has(e)}static findParent(e){if(st!==e.target){let t=Qo(e.target);for(;t!==null;){if(Zo.has(t))return Zo.get(t);t=Qo(t)}return o.getOrCreate(st)}return null}static findClosestAssignedNode(e,t){let i=t;do{if(i.has(e))return i;i=i.parent?i.parent:i.target!==st?o.getOrCreate(st):null}while(i!==null);return null}get parent(){return Jo.get(this)||null}updateCSSTokenReflection(e,t){if(Xe.isCSSDesignToken(t)){let i=this.parent,n=this.isReflecting(t);if(i){let s=i.get(t),a=e.get(t);s!==a&&!n?this.reflectToCSS(t):s===a&&n&&this.stopReflectToCSS(t)}else n||this.reflectToCSS(t)}}has(e){return this.assignedValues.has(e)}get(e){let t=this.store.get(e);if(t!==void 0)return t;let i=this.getRaw(e);if(i!==void 0)return this.hydrate(e,i),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=o.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){Xe.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),Xe.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);let t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){let e=o.findParent(this);e&&e.appendChild(this);for(let t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&Jo.get(this).removeChild(this);for(let e of this.bindingObservers.keys())this.tearDownBindingObserver(e)}appendChild(e){e.parent&&Jo.get(e).removeChild(e);let t=this.children.filter(i=>e.contains(i));Jo.set(e,this),this.children.push(e),t.forEach(i=>e.appendChild(i)),C.getNotifier(this.store).subscribe(e);for(let[i,n]of this.store.all())e.hydrate(i,this.bindingObservers.has(i)?this.getRaw(i):n),e.updateCSSTokenReflection(e.store,i)}removeChild(e){let t=this.children.indexOf(e);if(t!==-1&&this.children.splice(t,1),C.getNotifier(this.store).unsubscribe(e),e.parent!==this)return!1;let i=Jo.delete(e);for(let[n]of this.store.all())e.hydrate(n,e.getRaw(n)),e.updateCSSTokenReflection(e.store,n);return i}contains(e){return pd(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),o.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),o.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){let i=Xe.getTokenById(t);i&&(this.hydrate(i,this.getRaw(i)),this.updateCSSTokenReflection(this.store,i))}hydrate(e,t){if(!this.has(e)){let i=this.bindingObservers.get(e);Xe.isDerivedDesignTokenValue(t)?i?i.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(i&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){let i=new ar(t,e,this);return this.bindingObservers.set(e,i),i}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}};ke.cssCustomPropertyReflector=new rr;r([p],ke.prototype,"children",void 0);Ko=Object.freeze({create:Am,notifyConnection(o){return!o.isConnected||!ke.existsFor(o)?!1:(ke.getOrCreate(o).bind(),!0)},notifyDisconnection(o){return o.isConnected||!ke.existsFor(o)?!1:(ke.getOrCreate(o).unbind(),!0)},registerRoot(o=st){zt.registerRoot(o)},unregisterRoot(o=st){zt.unregisterRoot(o)}})});function Fm(o,e,t){return typeof o=="string"?{name:o,type:e,callback:t}:o}var dr,ur,Xi,xo,ei,pr,Zi,hr,md=c(()=>{g();R();Oi();cr();Bi();dr=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),ur=new Map,Xi=new Map,xo=null,ei=_.createInterface(o=>o.cachedCallback(e=>(xo===null&&(xo=new Zi(null,e)),xo))),pr=Object.freeze({tagFor(o){return Xi.get(o)},responsibleFor(o){let e=o.$$designSystem$$;return e||_.findResponsibleContainer(o).get(ei)},getOrCreate(o){if(!o)return xo===null&&(xo=_.getOrCreateDOMContainer().get(ei)),xo;let e=o.$$designSystem$$;if(e)return e;let t=_.getOrCreateDOMContainer(o);if(t.has(ei,!1))return t.get(ei);{let i=new Zi(o,t);return t.register(Xt.instance(ei,i)),i}}});Zi=class{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>dr.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){let t=this.container,i=[],n=this.disambiguate,s=this.shadowRootMode,a={elementPrefix:this.prefix,tryDefineElement(l,u,h){let f=Fm(l,u,h),{name:m,callback:b,baseClass:S}=f,{type:E}=f,J=m,se=ur.get(J),kt=!0;for(;se;){let $t=n(J,E,se);switch($t){case dr.ignoreDuplicate:return;case dr.definitionCallbackOnly:kt=!1,se=void 0;break;default:J=$t,se=ur.get(J);break}}kt&&((Xi.has(E)||E===v)&&(E=class extends E{}),ur.set(J,E),Xi.set(E,J),S&&Xi.set(S,J)),i.push(new hr(t,J,E,s,b,kt))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&Ko.registerRoot(this.designTokenRoot)),t.registerWithContext(a,...e);for(let l of i)l.callback(l),l.willDefine&&l.definition!==null&&l.definition.define();return this}},hr=class{constructor(e,t,i,n,s,a){this.container=e,this.name=t,this.type=i,this.shadowRootMode=n,this.callback=s,this.willDefine=a,this.definition=null}definePresentation(e){Pi.define(this.name,e,this.container)}defineElement(e){this.definition=new ot(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return pr.tagFor(e)}}});var bd=c(()=>{});var gd=c(()=>{md();Bi();bd()});var vd=c(()=>{Oi()});var yd=c(()=>{});var wd,Om,Cd,ti,fr,Lm,kd,Mm,Pm,Bm,zm,Hm,Nm,xd,Vm,_m,$d,Um,mr,jm,br,gr=c(()=>{wd=["input","select","textarea","a[href]","button","[tabindex]:not(slot)","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])',"details>summary:first-of-type","details"],Om=wd.join(","),Cd=typeof Element>"u",ti=Cd?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,fr=!Cd&&Element.prototype.getRootNode?function(o){return o.getRootNode()}:function(o){return o.ownerDocument},Lm=function(e,t){return e.tabIndex<0&&(t||/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||e.isContentEditable)&&isNaN(parseInt(e.getAttribute("tabindex"),10))?0:e.tabIndex},kd=function(e){return e.tagName==="INPUT"},Mm=function(e){return kd(e)&&e.type==="hidden"},Pm=function(e){var t=e.tagName==="DETAILS"&&Array.prototype.slice.apply(e.children).some(function(i){return i.tagName==="SUMMARY"});return t},Bm=function(e,t){for(var i=0;i<e.length;i++)if(e[i].checked&&e[i].form===t)return e[i]},zm=function(e){if(!e.name)return!0;var t=e.form||fr(e),i=function(l){return t.querySelectorAll('input[type="radio"][name="'+l+'"]')},n;if(typeof window<"u"&&typeof window.CSS<"u"&&typeof window.CSS.escape=="function")n=i(window.CSS.escape(e.name));else try{n=i(e.name)}catch(a){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",a.message),!1}var s=Bm(n,e.form);return!s||s===e},Hm=function(e){return kd(e)&&e.type==="radio"},Nm=function(e){return Hm(e)&&!zm(e)},xd=function(e){var t=e.getBoundingClientRect(),i=t.width,n=t.height;return i===0&&n===0},Vm=function(e,t){var i=t.displayCheck,n=t.getShadowRoot;if(getComputedStyle(e).visibility==="hidden")return!0;var s=ti.call(e,"details>summary:first-of-type"),a=s?e.parentElement:e;if(ti.call(a,"details:not([open]) *"))return!0;var l=fr(e).host,u=l?.ownerDocument.contains(l)||e.ownerDocument.contains(e);if(!i||i==="full"){if(typeof n=="function"){for(var h=e;e;){var f=e.parentElement,m=fr(e);if(f&&!f.shadowRoot&&n(f)===!0)return xd(e);e.assignedSlot?e=e.assignedSlot:!f&&m!==e.ownerDocument?e=m.host:e=f}e=h}if(u)return!e.getClientRects().length}else if(i==="non-zero-area")return xd(e);return!1},_m=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName==="FIELDSET"&&t.disabled){for(var i=0;i<t.children.length;i++){var n=t.children.item(i);if(n.tagName==="LEGEND")return ti.call(t,"fieldset[disabled] *")?!0:!n.contains(e)}return!0}t=t.parentElement}return!1},$d=function(e,t){return!(t.disabled||Mm(t)||Vm(t,e)||Pm(t)||_m(t))},Um=function(e,t){return!(Nm(t)||Lm(t)<0||!$d(e,t))},mr=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ti.call(e,Om)===!1?!1:Um(t,e)},jm=wd.concat("iframe").join(","),br=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ti.call(e,jm)===!1?!1:$d(t,e)}});var Ht,Sd=c(()=>{I();g();L();gr();R();Ht=class o extends v{constructor(){super(...arguments),this.modal=!0,this.hidden=!1,this.trapFocus=!0,this.trapFocusChanged=()=>{this.$fastController.isConnected&&this.updateTrapFocus()},this.isTrappingFocus=!1,this.handleDocumentKeydown=e=>{if(!e.defaultPrevented&&!this.hidden)switch(e.key){case Te:this.dismiss(),e.preventDefault();break;case Ot:this.handleTabKeyDown(e);break}},this.handleDocumentFocus=e=>{!e.defaultPrevented&&this.shouldForceFocus(e.target)&&(this.focusFirstElement(),e.preventDefault())},this.handleTabKeyDown=e=>{if(!this.trapFocus||this.hidden)return;let t=this.getTabQueueBounds();if(t.length!==0){if(t.length===1){t[0].focus(),e.preventDefault();return}e.shiftKey&&e.target===t[0]?(t[t.length-1].focus(),e.preventDefault()):!e.shiftKey&&e.target===t[t.length-1]&&(t[0].focus(),e.preventDefault())}},this.getTabQueueBounds=()=>{let e=[];return o.reduceTabbableItems(e,this)},this.focusFirstElement=()=>{let e=this.getTabQueueBounds();e.length>0?e[0].focus():this.dialog instanceof HTMLElement&&this.dialog.focus()},this.shouldForceFocus=e=>this.isTrappingFocus&&!this.contains(e),this.shouldTrapFocus=()=>this.trapFocus&&!this.hidden,this.updateTrapFocus=e=>{let t=e===void 0?this.shouldTrapFocus():e;t&&!this.isTrappingFocus?(this.isTrappingFocus=!0,document.addEventListener("focusin",this.handleDocumentFocus),y.queueUpdate(()=>{this.shouldForceFocus(document.activeElement)&&this.focusFirstElement()})):!t&&this.isTrappingFocus&&(this.isTrappingFocus=!1,document.removeEventListener("focusin",this.handleDocumentFocus))}}dismiss(){this.$emit("dismiss"),this.$emit("cancel")}show(){this.hidden=!1}hide(){this.hidden=!0,this.$emit("close")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleDocumentKeydown),this.notifier=C.getNotifier(this),this.notifier.subscribe(this,"hidden"),this.updateTrapFocus()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleDocumentKeydown),this.updateTrapFocus(!1),this.notifier.unsubscribe(this,"hidden")}handleChange(e,t){t==="hidden"&&this.updateTrapFocus()}static reduceTabbableItems(e,t){return t.getAttribute("tabindex")==="-1"?e:mr(t)||o.isFocusableFastElement(t)&&o.hasTabbableShadow(t)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceTabbableItems,[])):e}static isFocusableFastElement(e){var t,i;return!!(!((i=(t=e.$fastController)===null||t===void 0?void 0:t.definition.shadowOptions)===null||i===void 0)&&i.delegatesFocus)}static hasTabbableShadow(e){var t,i;return Array.from((i=(t=e.shadowRoot)===null||t===void 0?void 0:t.querySelectorAll("*"))!==null&&i!==void 0?i:[]).some(n=>mr(n))}};r([d({mode:"boolean"})],Ht.prototype,"modal",void 0);r([d({mode:"boolean"})],Ht.prototype,"hidden",void 0);r([d({attribute:"trap-focus",mode:"boolean"})],Ht.prototype,"trapFocus",void 0);r([d({attribute:"aria-describedby"})],Ht.prototype,"ariaDescribedby",void 0);r([d({attribute:"aria-labelledby"})],Ht.prototype,"ariaLabelledby",void 0);r([d({attribute:"aria-label"})],Ht.prototype,"ariaLabel",void 0)});var Id=c(()=>{yd();Sd()});var Td=c(()=>{});var Ji,Ed=c(()=>{I();g();R();Ji=class extends v{connectedCallback(){super.connectedCallback(),this.setup()}disconnectedCallback(){super.disconnectedCallback(),this.details.removeEventListener("toggle",this.onToggle)}show(){this.details.open=!0}hide(){this.details.open=!1}toggle(){this.details.open=!this.details.open}setup(){this.onToggle=this.onToggle.bind(this),this.details.addEventListener("toggle",this.onToggle),this.expanded&&this.show()}onToggle(){this.expanded=this.details.open,this.$emit("toggle")}};r([d({mode:"boolean"})],Ji.prototype,"expanded",void 0);r([d],Ji.prototype,"title",void 0)});var Rd=c(()=>{Td();Ed()});var Dd,Ad=c(()=>{g();Dd=(o,e)=>k`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`});var Ki,Fd=c(()=>{Ki={separator:"separator",presentation:"presentation"}});var wo,Od=c(()=>{I();g();L();R();Fd();wo=class extends v{constructor(){super(...arguments),this.role=Ki.separator,this.orientation=U.horizontal}};r([d],wo.prototype,"role",void 0);r([d],wo.prototype,"orientation",void 0)});var Ld=c(()=>{Ad();Od()});var Md,Pd=c(()=>{Md={next:"next",previous:"previous"}});var Bd=c(()=>{});var oi,zd=c(()=>{I();g();R();Pd();oi=class extends v{constructor(){super(...arguments),this.hiddenFromAT=!0,this.direction=Md.next}keyupHandler(e){if(!this.hiddenFromAT){let t=e.key;(t==="Enter"||t==="Space")&&this.$emit("click",e),t==="Escape"&&this.blur()}}};r([d({mode:"boolean"})],oi.prototype,"disabled",void 0);r([d({attribute:"aria-hidden",converter:Gt})],oi.prototype,"hiddenFromAT",void 0);r([d],oi.prototype,"direction",void 0)});var Hd=c(()=>{Bd();zd()});var Nd=c(()=>{Re()});var Vd=c(()=>{R()});var _d,Ud=c(()=>{g();be();_d=(o,e)=>k`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${_e(o,e)}
        <span class="content" part="content">
            <slot ${K("content")}></slot>
        </span>
        ${Ve(o,e)}
    </template>
`});var jd=c(()=>{Zs();Ud()});var so,vr=c(()=>{I();g();L();io();so=class extends fe{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var i,n;this.ariaActiveDescendant=(n=(i=this.options[t])===null||i===void 0?void 0:i.id)!==null&&n!==void 0?n:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;let e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,i)=>{t.checked=Go(i,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Go(i,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Go(i,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,i)=>{t.checked=Go(i,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);let i=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!i||i.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(i),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;let{key:t,shiftKey:i}=e;switch(this.shouldSkipFocus=!1,t){case re:{this.checkFirstOption(i);return}case Y:{this.checkNextOption(i);return}case Q:{this.checkPreviousOption(i);return}case ae:{this.checkLastOption(i);return}case Ot:return this.focusAndScrollOptionIntoView(),!0;case Te:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Ee:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var i;this.ariaMultiSelectable=t?"true":null,(i=this.options)===null||i===void 0||i.forEach(n=>{n.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var i;let n=Math.max(0,parseInt((i=t?.toFixed())!==null&&i!==void 0?i:"",10));n!==t&&y.queueUpdate(()=>{this.size=n})}toggleSelectedForAllCheckedOptions(){let e=this.checkedOptions.filter(i=>!i.disabled),t=!e.every(i=>i.selected);e.forEach(i=>i.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){let i=this.getTypeaheadMatches(),n=this.options.indexOf(i[0]);n>-1&&(this.activeIndex=n,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}};r([p],so.prototype,"activeIndex",void 0);r([d({mode:"boolean"})],so.prototype,"multiple",void 0);r([d({converter:F})],so.prototype,"size",void 0)});var qd=c(()=>{});var Gd=c(()=>{io();vr();qd()});var Co,Wd=c(()=>{I();L();g();R();Co=class extends v{constructor(){super(...arguments),this.optionElements=[]}menuElementsChanged(){this.updateOptions()}headerElementsChanged(){this.updateOptions()}footerElementsChanged(){this.updateOptions()}updateOptions(){this.optionElements.splice(0,this.optionElements.length),this.addSlottedListItems(this.headerElements),this.addSlottedListItems(this.menuElements),this.addSlottedListItems(this.footerElements),this.$emit("optionsupdated",{bubbles:!1})}addSlottedListItems(e){e!==void 0&&e.forEach(t=>{t.nodeType===1&&t.getAttribute("role")==="listitem"&&(t.id=t.id||Le("option-"),this.optionElements.push(t))})}};r([p],Co.prototype,"menuElements",void 0);r([p],Co.prototype,"headerElements",void 0);r([p],Co.prototype,"footerElements",void 0);r([p],Co.prototype,"suggestionsAvailableText",void 0)});var qm,ko,yr=c(()=>{I();g();R();qm=k`
    <template>
        ${o=>o.value}
    </template>
`,ko=class extends v{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){super.disconnectedCallback(),this.disconnectView()}handleClick(e){return e.defaultPrevented||this.handleInvoked(),!1}handleInvoked(){this.$emit("pickeroptioninvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:qm.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};r([d({attribute:"value"})],ko.prototype,"value",void 0);r([p],ko.prototype,"contentsTemplate",void 0)});var Yd=c(()=>{});var Gm,$o,xr=c(()=>{I();g();L();R();Gm=k`
    <template>
        ${o=>o.value}
    </template>
`,$o=class extends v{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){this.disconnectView(),super.disconnectedCallback()}handleKeyDown(e){return e.defaultPrevented?!1:e.key===ee?(this.handleInvoke(),!1):!0}handleClick(e){return e.defaultPrevented||this.handleInvoke(),!1}handleInvoke(){this.$emit("pickeriteminvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:Gm.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};r([d({attribute:"value"})],$o.prototype,"value",void 0);r([p],$o.prototype,"contentsTemplate",void 0)});var Qd=c(()=>{});var wr,en,Xd=c(()=>{Re();R();wr=class extends v{},en=class extends de(wr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Wm,B,Zd=c(()=>{I();g();L();_s();yr();xr();Xd();Wm=k`
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
        ${X("inputElement")}
    ></input>
`,B=class extends en{constructor(){super(...arguments),this.selection="",this.filterSelected=!0,this.filterQuery=!0,this.noSuggestionsText="No suggestions available",this.suggestionsAvailableText="Suggestions available",this.loadingText="Loading suggestions",this.menuPlacement="bottom-fill",this.showLoading=!1,this.optionsList=[],this.filteredOptionsList=[],this.flyoutOpen=!1,this.menuFocusIndex=-1,this.showNoOptions=!1,this.selectedItems=[],this.inputElementView=null,this.handleTextInput=e=>{this.query=this.inputElement.value},this.handleInputClick=e=>{e.preventDefault(),this.toggleFlyout(!0)},this.setRegionProps=()=>{if(this.flyoutOpen){if(this.region===null||this.region===void 0){y.queueUpdate(this.setRegionProps);return}this.region.anchorElement=this.inputElement}},this.configLookup={top:zs,bottom:Hs,tallest:Ns,"top-fill":wc,"bottom-fill":Vs,"tallest-fill":Cc}}selectionChanged(){this.$fastController.isConnected&&(this.handleSelectionChange(),this.proxy instanceof HTMLInputElement&&(this.proxy.value=this.selection,this.validate()))}optionsChanged(){this.optionsList=this.options.split(",").map(e=>e.trim()).filter(e=>e!=="")}menuPlacementChanged(){this.$fastController.isConnected&&this.updateMenuConfig()}showLoadingChanged(){this.$fastController.isConnected&&y.queueUpdate(()=>{this.setFocusedOption(0)})}listItemTemplateChanged(){this.updateListItemTemplate()}defaultListItemTemplateChanged(){this.updateListItemTemplate()}menuOptionTemplateChanged(){this.updateOptionTemplate()}defaultMenuOptionTemplateChanged(){this.updateOptionTemplate()}optionsListChanged(){this.updateFilteredOptions()}queryChanged(){this.$fastController.isConnected&&(this.inputElement.value!==this.query&&(this.inputElement.value=this.query),this.updateFilteredOptions(),this.$emit("querychange",{bubbles:!1}))}filteredOptionsListChanged(){this.$fastController.isConnected&&(this.showNoOptions=this.filteredOptionsList.length===0&&this.menuElement.querySelectorAll('[role="listitem"]').length===0,this.setFocusedOption(this.showNoOptions?-1:0))}flyoutOpenChanged(){this.flyoutOpen?(y.queueUpdate(this.setRegionProps),this.$emit("menuopening",{bubbles:!1})):this.$emit("menuclosing",{bubbles:!1})}showNoOptionsChanged(){this.$fastController.isConnected&&y.queueUpdate(()=>{this.setFocusedOption(0)})}connectedCallback(){super.connectedCallback(),this.listElement=document.createElement(this.selectedListTag),this.appendChild(this.listElement),this.itemsPlaceholderElement=document.createComment(""),this.listElement.append(this.itemsPlaceholderElement),this.inputElementView=Wm.render(this,this.listElement);let e=this.menuTag.toUpperCase();this.menuElement=Array.from(this.children).find(t=>t.tagName===e),this.menuElement===void 0&&(this.menuElement=document.createElement(this.menuTag),this.appendChild(this.menuElement)),this.menuElement.id===""&&(this.menuElement.id=Le("listbox-")),this.menuId=this.menuElement.id,this.optionsPlaceholder=document.createComment(""),this.menuElement.append(this.optionsPlaceholder),this.updateMenuConfig(),y.queueUpdate(()=>this.initialize())}disconnectedCallback(){super.disconnectedCallback(),this.toggleFlyout(!1),this.inputElement.removeEventListener("input",this.handleTextInput),this.inputElement.removeEventListener("click",this.handleInputClick),this.inputElementView!==null&&(this.inputElementView.dispose(),this.inputElementView=null)}focus(){this.inputElement.focus()}initialize(){this.updateListItemTemplate(),this.updateOptionTemplate(),this.itemsRepeatBehavior=new ut(e=>e.selectedItems,e=>e.activeListItemTemplate,{positioning:!0}).createBehavior(this.itemsPlaceholderElement),this.inputElement.addEventListener("input",this.handleTextInput),this.inputElement.addEventListener("click",this.handleInputClick),this.$fastController.addBehaviors([this.itemsRepeatBehavior]),this.menuElement.suggestionsAvailableText=this.suggestionsAvailableText,this.menuElement.addEventListener("optionsupdated",this.handleMenuOptionsUpdated),this.optionsRepeatBehavior=new ut(e=>e.filteredOptionsList,e=>e.activeMenuOptionTemplate,{positioning:!0}).createBehavior(this.optionsPlaceholder),this.$fastController.addBehaviors([this.optionsRepeatBehavior]),this.handleSelectionChange()}toggleFlyout(e){if(this.flyoutOpen!==e){if(e&&document.activeElement===this.inputElement){this.flyoutOpen=e,y.queueUpdate(()=>{this.menuElement!==void 0?this.setFocusedOption(0):this.disableMenu()});return}this.flyoutOpen=!1,this.disableMenu()}}handleMenuOptionsUpdated(e){e.preventDefault(),this.flyoutOpen&&this.setFocusedOption(0)}handleKeyDown(e){if(e.defaultPrevented)return!1;switch(e.key){case Y:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.min(this.menuFocusIndex+1,this.menuElement.optionElements.length-1):0;this.setFocusedOption(t)}return!1}case Q:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.max(this.menuFocusIndex-1,0):0;this.setFocusedOption(t)}return!1}case Te:return this.toggleFlyout(!1),!1;case ee:return this.menuFocusIndex!==-1&&this.menuElement.optionElements.length>this.menuFocusIndex&&this.menuElement.optionElements[this.menuFocusIndex].click(),!1;case ye:return document.activeElement!==this.inputElement?(this.incrementFocusedItem(1),!1):!0;case ve:return this.inputElement.selectionStart===0?(this.incrementFocusedItem(-1),!1):!0;case ic:case oc:{if(document.activeElement===null)return!0;if(document.activeElement===this.inputElement)return this.inputElement.selectionStart===0?(this.selection=this.selectedItems.slice(0,this.selectedItems.length-1).toString(),this.toggleFlyout(!1),!1):!0;let t=Array.from(this.listElement.children),i=t.indexOf(document.activeElement);return i>-1?(this.selection=this.selectedItems.splice(i,1).toString(),y.queueUpdate(()=>{t[Math.min(t.length,i)].focus()}),!1):!0}}return this.toggleFlyout(!0),!0}handleFocusIn(e){return!1}handleFocusOut(e){return(this.menuElement===void 0||!this.menuElement.contains(e.relatedTarget))&&this.toggleFlyout(!1),!1}handleSelectionChange(){this.selectedItems.toString()!==this.selection&&(this.selectedItems=this.selection===""?[]:this.selection.split(","),this.updateFilteredOptions(),y.queueUpdate(()=>{this.checkMaxItems()}),this.$emit("selectionchange",{bubbles:!1}))}handleRegionLoaded(e){y.queueUpdate(()=>{this.setFocusedOption(0),this.$emit("menuloaded",{bubbles:!1})})}checkMaxItems(){if(this.inputElement!==void 0)if(this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected){if(document.activeElement===this.inputElement){let e=Array.from(this.listElement.querySelectorAll("[role='listitem']"));e[e.length-1].focus()}this.inputElement.hidden=!0}else this.inputElement.hidden=!1}handleItemInvoke(e){if(e.defaultPrevented)return!1;if(e.target instanceof $o){let i=Array.from(this.listElement.querySelectorAll("[role='listitem']")).indexOf(e.target);if(i!==-1){let n=this.selectedItems.slice();n.splice(i,1),this.selection=n.toString(),y.queueUpdate(()=>this.incrementFocusedItem(0))}return!1}return!0}handleOptionInvoke(e){return e.defaultPrevented?!1:e.target instanceof ko?(e.target.value!==void 0&&(this.selection=`${this.selection}${this.selection===""?"":","}${e.target.value}`),this.inputElement.value="",this.query="",this.inputElement.focus(),this.toggleFlyout(!1),!1):!0}incrementFocusedItem(e){if(this.selectedItems.length===0){this.inputElement.focus();return}let t=Array.from(this.listElement.querySelectorAll("[role='listitem']"));if(document.activeElement!==null){let i=t.indexOf(document.activeElement);i===-1&&(i=t.length);let n=Math.min(t.length,Math.max(0,i+e));n===t.length?this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected?t[n-1].focus():this.inputElement.focus():t[n].focus()}}disableMenu(){var e,t,i;this.menuFocusIndex=-1,this.menuFocusOptionId=void 0,(e=this.inputElement)===null||e===void 0||e.removeAttribute("aria-activedescendant"),(t=this.inputElement)===null||t===void 0||t.removeAttribute("aria-owns"),(i=this.inputElement)===null||i===void 0||i.removeAttribute("aria-expanded")}setFocusedOption(e){if(!this.flyoutOpen||e===-1||this.showNoOptions||this.showLoading){this.disableMenu();return}if(this.menuElement.optionElements.length===0)return;this.menuElement.optionElements.forEach(i=>{i.setAttribute("aria-selected","false")}),this.menuFocusIndex=e,this.menuFocusIndex>this.menuElement.optionElements.length-1&&(this.menuFocusIndex=this.menuElement.optionElements.length-1),this.menuFocusOptionId=this.menuElement.optionElements[this.menuFocusIndex].id,this.inputElement.setAttribute("aria-owns",this.menuId),this.inputElement.setAttribute("aria-expanded","true"),this.inputElement.setAttribute("aria-activedescendant",this.menuFocusOptionId);let t=this.menuElement.optionElements[this.menuFocusIndex];t.setAttribute("aria-selected","true"),this.menuElement.scrollTo(0,t.offsetTop)}updateListItemTemplate(){var e;this.activeListItemTemplate=(e=this.listItemTemplate)!==null&&e!==void 0?e:this.defaultListItemTemplate}updateOptionTemplate(){var e;this.activeMenuOptionTemplate=(e=this.menuOptionTemplate)!==null&&e!==void 0?e:this.defaultMenuOptionTemplate}updateFilteredOptions(){this.filteredOptionsList=this.optionsList.slice(0),this.filterSelected&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>this.selectedItems.indexOf(e)===-1)),this.filterQuery&&this.query!==""&&this.query!==void 0&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>e.indexOf(this.query)!==-1))}updateMenuConfig(){let e=this.configLookup[this.menuPlacement];e===null&&(e=Vs),this.menuConfig=Object.assign(Object.assign({},e),{autoUpdateMode:"auto",fixedPlacement:!0,horizontalViewportLock:!1,verticalViewportLock:!1})}};r([d({attribute:"selection"})],B.prototype,"selection",void 0);r([d({attribute:"options"})],B.prototype,"options",void 0);r([d({attribute:"filter-selected",mode:"boolean"})],B.prototype,"filterSelected",void 0);r([d({attribute:"filter-query",mode:"boolean"})],B.prototype,"filterQuery",void 0);r([d({attribute:"max-selected"})],B.prototype,"maxSelected",void 0);r([d({attribute:"no-suggestions-text"})],B.prototype,"noSuggestionsText",void 0);r([d({attribute:"suggestions-available-text"})],B.prototype,"suggestionsAvailableText",void 0);r([d({attribute:"loading-text"})],B.prototype,"loadingText",void 0);r([d({attribute:"label"})],B.prototype,"label",void 0);r([d({attribute:"labelledby"})],B.prototype,"labelledBy",void 0);r([d({attribute:"placeholder"})],B.prototype,"placeholder",void 0);r([d({attribute:"menu-placement"})],B.prototype,"menuPlacement",void 0);r([p],B.prototype,"showLoading",void 0);r([p],B.prototype,"listItemTemplate",void 0);r([p],B.prototype,"defaultListItemTemplate",void 0);r([p],B.prototype,"activeListItemTemplate",void 0);r([p],B.prototype,"menuOptionTemplate",void 0);r([p],B.prototype,"defaultMenuOptionTemplate",void 0);r([p],B.prototype,"activeMenuOptionTemplate",void 0);r([p],B.prototype,"listItemContentsTemplate",void 0);r([p],B.prototype,"menuOptionContentsTemplate",void 0);r([p],B.prototype,"optionsList",void 0);r([p],B.prototype,"query",void 0);r([p],B.prototype,"filteredOptionsList",void 0);r([p],B.prototype,"flyoutOpen",void 0);r([p],B.prototype,"menuId",void 0);r([p],B.prototype,"selectedListTag",void 0);r([p],B.prototype,"menuTag",void 0);r([p],B.prototype,"menuFocusIndex",void 0);r([p],B.prototype,"menuFocusOptionId",void 0);r([p],B.prototype,"showNoOptions",void 0);r([p],B.prototype,"menuConfig",void 0);r([p],B.prototype,"selectedItems",void 0)});var Jd=c(()=>{});var Kd=c(()=>{});var eu=c(()=>{});var tu=c(()=>{});var ou=c(()=>{Qd();Zd();Jd();Wd();Kd();yr();eu();Yd();tu();xr()});var Ae,Cr,iu=c(()=>{Ae={menuitem:"menuitem",menuitemcheckbox:"menuitemcheckbox",menuitemradio:"menuitemradio"},Cr={[Ae.menuitem]:"menuitem",[Ae.menuitemcheckbox]:"menuitemcheckbox",[Ae.menuitemradio]:"menuitemradio"}});var Fe,nu=c(()=>{I();g();L();R();be();Pt();pe();iu();Fe=class extends v{constructor(){super(...arguments),this.role=Ae.menuitem,this.hasSubmenu=!1,this.currentDirection=O.ltr,this.focusSubmenuOnLoad=!1,this.handleMenuItemKeyDown=e=>{if(e.defaultPrevented)return!1;switch(e.key){case ee:case Ee:return this.invoke(),!1;case ye:return this.expandAndFocus(),!1;case ve:if(this.expanded)return this.expanded=!1,this.focus(),!1}return!0},this.handleMenuItemClick=e=>(e.defaultPrevented||this.disabled||this.invoke(),!1),this.submenuLoaded=()=>{this.focusSubmenuOnLoad&&(this.focusSubmenuOnLoad=!1,this.hasSubmenu&&(this.submenu.focus(),this.setAttribute("tabindex","-1")))},this.handleMouseOver=e=>(this.disabled||!this.hasSubmenu||this.expanded||(this.expanded=!0),!1),this.handleMouseOut=e=>(!this.expanded||this.contains(document.activeElement)||(this.expanded=!1),!1),this.expandAndFocus=()=>{this.hasSubmenu&&(this.focusSubmenuOnLoad=!0,this.expanded=!0)},this.invoke=()=>{if(!this.disabled)switch(this.role){case Ae.menuitemcheckbox:this.checked=!this.checked;break;case Ae.menuitem:this.updateSubmenu(),this.hasSubmenu?this.expandAndFocus():this.$emit("change");break;case Ae.menuitemradio:this.checked||(this.checked=!0);break}},this.updateSubmenu=()=>{this.submenu=this.domChildren().find(e=>e.getAttribute("role")==="menu"),this.hasSubmenu=this.submenu!==void 0}}expandedChanged(e){if(this.$fastController.isConnected){if(this.submenu===void 0)return;this.expanded===!1?this.submenu.collapseExpandedItem():this.currentDirection=Me(this),this.$emit("expanded-change",this,{bubbles:!1})}}checkedChanged(e,t){this.$fastController.isConnected&&this.$emit("change")}connectedCallback(){super.connectedCallback(),y.queueUpdate(()=>{this.updateSubmenu()}),this.startColumnCount||(this.startColumnCount=1),this.observer=new MutationObserver(this.updateSubmenu)}disconnectedCallback(){super.disconnectedCallback(),this.submenu=void 0,this.observer!==void 0&&(this.observer.disconnect(),this.observer=void 0)}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}};r([d({mode:"boolean"})],Fe.prototype,"disabled",void 0);r([d({mode:"boolean"})],Fe.prototype,"expanded",void 0);r([p],Fe.prototype,"startColumnCount",void 0);r([d],Fe.prototype,"role",void 0);r([d({mode:"boolean"})],Fe.prototype,"checked",void 0);r([p],Fe.prototype,"submenuRegion",void 0);r([p],Fe.prototype,"hasSubmenu",void 0);r([p],Fe.prototype,"currentDirection",void 0);r([p],Fe.prototype,"submenu",void 0);A(Fe,N)});var su=c(()=>{});var kr=c(()=>{su();nu()});var ru=c(()=>{});var tn,au=c(()=>{I();g();L();kr();R();tn=class o extends v{constructor(){super(...arguments),this.expandedItem=null,this.focusIndex=-1,this.isNestedMenu=()=>this.parentElement!==null&&it(this.parentElement)&&this.parentElement.getAttribute("role")==="menuitem",this.handleFocusOut=e=>{if(!this.contains(e.relatedTarget)&&this.menuItems!==void 0){this.collapseExpandedItem();let t=this.menuItems.findIndex(this.isFocusableElement);this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.menuItems[t].setAttribute("tabindex","0"),this.focusIndex=t}},this.handleItemFocus=e=>{let t=e.target;this.menuItems!==void 0&&t!==this.menuItems[this.focusIndex]&&(this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.handleExpandedChanged=e=>{if(e.defaultPrevented||e.target===null||this.menuItems===void 0||this.menuItems.indexOf(e.target)<0)return;e.preventDefault();let t=e.target;if(this.expandedItem!==null&&t===this.expandedItem&&t.expanded===!1){this.expandedItem=null;return}t.expanded&&(this.expandedItem!==null&&this.expandedItem!==t&&(this.expandedItem.expanded=!1),this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.expandedItem=t,this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.removeItemListeners=()=>{this.menuItems!==void 0&&this.menuItems.forEach(e=>{e.removeEventListener("expanded-change",this.handleExpandedChanged),e.removeEventListener("focus",this.handleItemFocus)})},this.setItems=()=>{let e=this.domChildren();this.removeItemListeners(),this.menuItems=e;let t=this.menuItems.filter(this.isMenuItemElement);t.length&&(this.focusIndex=0);function i(s){let a=s.getAttribute("role"),l=s.querySelector("[slot=start]");return a!==Ae.menuitem&&l===null||a===Ae.menuitem&&l!==null?1:a!==Ae.menuitem&&l!==null?2:0}let n=t.reduce((s,a)=>{let l=i(a);return s>l?s:l},0);t.forEach((s,a)=>{s.setAttribute("tabindex",a===0?"0":"-1"),s.addEventListener("expanded-change",this.handleExpandedChanged),s.addEventListener("focus",this.handleItemFocus),(s instanceof Fe||"startColumnCount"in s)&&(s.startColumnCount=n)})},this.changeHandler=e=>{if(this.menuItems===void 0)return;let t=e.target,i=this.menuItems.indexOf(t);if(i!==-1&&t.role==="menuitemradio"&&t.checked===!0){for(let s=i-1;s>=0;--s){let a=this.menuItems[s],l=a.getAttribute("role");if(l===Ae.menuitemradio&&(a.checked=!1),l==="separator")break}let n=this.menuItems.length-1;for(let s=i+1;s<=n;++s){let a=this.menuItems[s],l=a.getAttribute("role");if(l===Ae.menuitemradio&&(a.checked=!1),l==="separator")break}}},this.isMenuItemElement=e=>it(e)&&o.focusableElementRoles.hasOwnProperty(e.getAttribute("role")),this.isFocusableElement=e=>this.isMenuItemElement(e)}itemsChanged(e,t){this.$fastController.isConnected&&this.menuItems!==void 0&&this.setItems()}connectedCallback(){super.connectedCallback(),y.queueUpdate(()=>{this.setItems()}),this.addEventListener("change",this.changeHandler)}disconnectedCallback(){super.disconnectedCallback(),this.removeItemListeners(),this.menuItems=void 0,this.removeEventListener("change",this.changeHandler)}focus(){this.setFocus(0,1)}collapseExpandedItem(){this.expandedItem!==null&&(this.expandedItem.expanded=!1,this.expandedItem=null)}handleMenuKeyDown(e){if(!(e.defaultPrevented||this.menuItems===void 0))switch(e.key){case Y:this.setFocus(this.focusIndex+1,1);return;case Q:this.setFocus(this.focusIndex-1,-1);return;case ae:this.setFocus(this.menuItems.length-1,-1);return;case re:this.setFocus(0,1);return;default:return!0}}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}setFocus(e,t){if(this.menuItems!==void 0)for(;e>=0&&e<this.menuItems.length;){let i=this.menuItems[e];if(this.isFocusableElement(i)){this.focusIndex>-1&&this.menuItems.length>=this.focusIndex-1&&this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=e,i.setAttribute("tabindex","0"),i.focus();break}e+=t}}};tn.focusableElementRoles=Cr;r([p],tn.prototype,"items",void 0)});var lu=c(()=>{ru();au()});var cu=c(()=>{});var $r,on,du=c(()=>{Re();R();$r=class extends v{},on=class extends de($r){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var nn,uu=c(()=>{nn={email:"email",password:"password",tel:"tel",text:"text",url:"url"}});var we,Nt,sn=c(()=>{I();g();Jt();pe();du();uu();we=class extends on{constructor(){super(...arguments),this.type=nn.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&y.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};r([d({attribute:"readonly",mode:"boolean"})],we.prototype,"readOnly",void 0);r([d({mode:"boolean"})],we.prototype,"autofocus",void 0);r([d],we.prototype,"placeholder",void 0);r([d],we.prototype,"type",void 0);r([d],we.prototype,"list",void 0);r([d({converter:F})],we.prototype,"maxlength",void 0);r([d({converter:F})],we.prototype,"minlength",void 0);r([d],we.prototype,"pattern",void 0);r([d({converter:F})],we.prototype,"size",void 0);r([d({mode:"boolean"})],we.prototype,"spellcheck",void 0);r([p],we.prototype,"defaultSlottedNodes",void 0);Nt=class{};A(Nt,P);A(we,N,Nt)});var Sr,rn,hu=c(()=>{Re();R();Sr=class extends v{},rn=class extends de(Sr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var $e,pu=c(()=>{I();g();L();be();pe();sn();hu();$e=class extends rn{constructor(){super(...arguments),this.hideStep=!1,this.step=1,this.isUserInput=!1}maxChanged(e,t){var i;this.max=Math.max(t,(i=this.min)!==null&&i!==void 0?i:t);let n=Math.min(this.min,this.max);this.min!==void 0&&this.min!==n&&(this.min=n),this.value=this.getValidValue(this.value)}minChanged(e,t){var i;this.min=Math.min(t,(i=this.max)!==null&&i!==void 0?i:t);let n=Math.max(this.min,this.max);this.max!==void 0&&this.max!==n&&(this.max=n),this.value=this.getValidValue(this.value)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){this.value=this.getValidValue(t),t===this.value&&(this.control&&!this.isUserInput&&(this.control.value=this.value),super.valueChanged(e,this.value),e!==void 0&&!this.isUserInput&&(this.$emit("input"),this.$emit("change")),this.isUserInput=!1)}validate(){super.validate(this.control)}getValidValue(e){var t,i;let n=parseFloat(parseFloat(e).toPrecision(12));return isNaN(n)?n="":(n=Math.min(n,(t=this.max)!==null&&t!==void 0?t:n),n=Math.max(n,(i=this.min)!==null&&i!==void 0?i:n).toString()),n}stepUp(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:this.step:e+this.step;this.value=t.toString()}stepDown(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:0-this.step:e-this.step;this.value=t.toString()}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","number"),this.validate(),this.control.value=this.value,this.autofocus&&y.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.control.value=this.control.value.replace(/[^0-9\-+e.]/g,""),this.isUserInput=!0,this.value=this.control.value}handleChange(){this.$emit("change")}handleKeyDown(e){switch(e.key){case Q:return this.stepUp(),!1;case Y:return this.stepDown(),!1}return!0}handleBlur(){this.control.value=this.value}};r([d({attribute:"readonly",mode:"boolean"})],$e.prototype,"readOnly",void 0);r([d({mode:"boolean"})],$e.prototype,"autofocus",void 0);r([d({attribute:"hide-step",mode:"boolean"})],$e.prototype,"hideStep",void 0);r([d],$e.prototype,"placeholder",void 0);r([d],$e.prototype,"list",void 0);r([d({converter:F})],$e.prototype,"maxlength",void 0);r([d({converter:F})],$e.prototype,"minlength",void 0);r([d({converter:F})],$e.prototype,"size",void 0);r([d({converter:F})],$e.prototype,"step",void 0);r([d({converter:F})],$e.prototype,"max",void 0);r([d({converter:F})],$e.prototype,"min",void 0);r([p],$e.prototype,"defaultSlottedNodes",void 0);A($e,N,Nt)});var fu=c(()=>{cu();pu()});var mu,bu,gu=c(()=>{g();mu=44,bu=(o,e)=>k`
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
                        style="stroke-dasharray: ${t=>mu*t.percentComplete/100}px ${mu}px"
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
`});var vu=c(()=>{gu()});var vt,yu=c(()=>{I();g();R();vt=class extends v{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){let e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,i=typeof this.value=="number"?this.value:0,n=t-e;this.percentComplete=n===0?0:Math.fround((i-e)/n*100)}};r([d({converter:F})],vt.prototype,"value",void 0);r([d({converter:F})],vt.prototype,"min",void 0);r([d({converter:F})],vt.prototype,"max",void 0);r([d({mode:"boolean"})],vt.prototype,"paused",void 0);r([p],vt.prototype,"percentComplete",void 0)});var xu=c(()=>{});var wu=c(()=>{yu();xu()});var Cu,ku=c(()=>{g();L();Cu=(o,e)=>k`
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
                ${K({property:"slottedRadioButtons",filter:Qt("[role=radio]")})}
            ></slot>
        </div>
    </template>
`});var Ze,$u=c(()=>{I();g();L();Pt();R();Ze=class extends v{constructor(){super(...arguments),this.orientation=U.horizontal,this.radioChangeHandler=e=>{let t=e.target;t.checked&&(this.slottedRadioButtons.forEach(i=>{i!==t&&(i.checked=!1,this.isInsideFoundationToolbar||i.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{let i=e[t];this.isInsideToolbar||(i.setAttribute("tabindex","0"),i.readOnly?this.slottedRadioButtons.forEach(n=>{n!==i&&n.setAttribute("tabindex","-1")}):(i.checked=!0,this.selectedRadio=i)),this.focusedRadio=i,i.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{let t=this.slottedRadioButtons,i=e.target,n=i!==null?t.indexOf(i):0,s=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(s===0&&n===s||s===t.length-1&&s===n)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.selectedRadio&&a.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(a=>{a!==this.focusedRadio&&a.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{let t=e.target;if(t){let i=this.slottedRadioButtons;t.checked||i.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,i)=>e===t.length&&this.isInsideToolbar&&i===ye,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===ve,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(i,t,e.key)){this.moveRightOffGroup();return}else i===t.length&&(i=0);for(;i<t.length&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;if(i+1>=t.length){if(this.isInsideToolbar)break;i=0}else i+=1}else{this.moveToRadioByIndex(t,i);break}},this.moveLeft=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,i=i<0?t.length-1:i,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;i>=0&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;i-1<0?i=t.length-1:i-=1}else{this.moveToRadioByIndex(t,i);break}},this.keydownHandler=e=>{let t=e.key;if(t in Lt&&this.isInsideFoundationToolbar)return!0;switch(t){case ee:{this.checkFocusedRadio();break}case ye:case Y:{this.direction===O.ltr?this.moveRight(e):this.moveLeft(e);break}case ve:case Q:{this.direction===O.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.value===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=Me(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){let e=this.slottedRadioButtons.filter(n=>n.hasAttribute("checked")),t=e?e.length:0;if(t>1){let n=e[t-1];n.checked=!0}let i=!1;if(this.slottedRadioButtons.forEach(n=>{this.name!==void 0&&n.setAttribute("name",this.name),this.disabled&&(n.disabled=!0),this.readOnly&&(n.readOnly=!0),this.value&&this.value===n.value?(this.selectedRadio=n,this.focusedRadio=n,n.checked=!0,n.setAttribute("tabindex","0"),i=!0):(this.isInsideFoundationToolbar||n.setAttribute("tabindex","-1"),n.checked=!1),n.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){let n=this.slottedRadioButtons.filter(a=>a.hasAttribute("checked")),s=n!==null?n.length:0;if(s>0&&!i){let a=n[s-1];a.checked=!0,this.focusedRadio=a,a.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}};r([d({attribute:"readonly",mode:"boolean"})],Ze.prototype,"readOnly",void 0);r([d({attribute:"disabled",mode:"boolean"})],Ze.prototype,"disabled",void 0);r([d],Ze.prototype,"name",void 0);r([d],Ze.prototype,"value",void 0);r([d],Ze.prototype,"orientation",void 0);r([p],Ze.prototype,"childItems",void 0);r([p],Ze.prototype,"slottedRadioButtons",void 0)});var Su=c(()=>{ku();$u()});var Iu,Tu=c(()=>{g();Iu=(o,e)=>k`
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
`});var Ir,an,Eu=c(()=>{Re();R();Ir=class extends v{},an=class extends go(Ir){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ro,Ru=c(()=>{I();g();L();Eu();ro=class extends an{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(e.key===Ee){!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}};r([d({attribute:"readonly",mode:"boolean"})],ro.prototype,"readOnly",void 0);r([p],ro.prototype,"name",void 0);r([p],ro.prototype,"defaultSlottedNodes",void 0)});var Du=c(()=>{Tu();Ru()});var yt,Au=c(()=>{I();g();R();yt=class extends v{constructor(){super(...arguments),this.framesPerSecond=60,this.updatingItems=!1,this.speed=600,this.easing="ease-in-out",this.flippersHiddenFromAT=!1,this.scrolling=!1,this.resizeDetector=null}get frameTime(){return 1e3/this.framesPerSecond}scrollingChanged(e,t){if(this.scrollContainer){let i=this.scrolling==!0?"scrollstart":"scrollend";this.$emit(i,this.scrollContainer.scrollLeft)}}get isRtl(){return this.scrollItems.length>1&&this.scrollItems[0].offsetLeft>this.scrollItems[1].offsetLeft}connectedCallback(){super.connectedCallback(),this.initializeResizeDetector()}disconnectedCallback(){this.disconnectResizeDetector(),super.disconnectedCallback()}scrollItemsChanged(e,t){t&&!this.updatingItems&&y.queueUpdate(()=>this.setStops())}disconnectResizeDetector(){this.resizeDetector&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.resized.bind(this)),this.resizeDetector.observe(this)}updateScrollStops(){this.updatingItems=!0;let e=this.scrollItems.reduce((t,i)=>i instanceof HTMLSlotElement?t.concat(i.assignedElements()):(t.push(i),t),[]);this.scrollItems=e,this.updatingItems=!1}setStops(){this.updateScrollStops();let{scrollContainer:e}=this,{scrollLeft:t}=e,{width:i,left:n}=e.getBoundingClientRect();this.width=i;let s=0,a=this.scrollItems.map((l,u)=>{let{left:h,width:f}=l.getBoundingClientRect(),m=Math.round(h+t-n),b=Math.round(m+f);return this.isRtl?-b:(s=b,u===0?0:m)}).concat(s);a=this.fixScrollMisalign(a),a.sort((l,u)=>Math.abs(l)-Math.abs(u)),this.scrollStops=a,this.setFlippers()}validateStops(e=!0){let t=()=>!!this.scrollStops.find(i=>i>0);return!t()&&e&&this.setStops(),t()}fixScrollMisalign(e){if(this.isRtl&&e.some(t=>t>0)){e.sort((i,n)=>n-i);let t=e[0];e=e.map(i=>i-t)}return e}setFlippers(){var e,t;let i=this.scrollContainer.scrollLeft;if((e=this.previousFlipperContainer)===null||e===void 0||e.classList.toggle("disabled",i===0),this.scrollStops){let n=Math.abs(this.scrollStops[this.scrollStops.length-1]);(t=this.nextFlipperContainer)===null||t===void 0||t.classList.toggle("disabled",this.validateStops(!1)&&Math.abs(i)+this.width>=n)}}scrollInView(e,t=0,i){var n;if(typeof e!="number"&&e&&(e=this.scrollItems.findIndex(s=>s===e||s.contains(e))),e!==void 0){i=i??t;let{scrollContainer:s,scrollStops:a,scrollItems:l}=this,{scrollLeft:u}=this.scrollContainer,{width:h}=s.getBoundingClientRect(),f=a[e],{width:m}=l[e].getBoundingClientRect(),b=f+m,S=u+t>f;if(S||u+h-i<b){let J=(n=[...a].sort((se,kt)=>S?kt-se:se-kt).find(se=>S?se+t<f:se+h-(i??0)>b))!==null&&n!==void 0?n:0;this.scrollToPosition(J)}}}keyupHandler(e){switch(e.key){case"ArrowLeft":this.scrollToPrevious();break;case"ArrowRight":this.scrollToNext();break}}scrollToPrevious(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex((s,a)=>s>=e&&(this.isRtl||a===this.scrollStops.length-1||this.scrollStops[a+1]>e)),i=Math.abs(this.scrollStops[t+1]),n=this.scrollStops.findIndex(s=>Math.abs(s)+this.width>i);(n>=t||n===-1)&&(n=t>0?t-1:0),this.scrollToPosition(this.scrollStops[n],e)}scrollToNext(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex(s=>Math.abs(s)>=Math.abs(e)),i=this.scrollStops.findIndex(s=>Math.abs(e)+this.width<=Math.abs(s)),n=t;i>t+2?n=i-2:t<this.scrollStops.length-2&&(n=t+1),this.scrollToPosition(this.scrollStops[n],e)}scrollToPosition(e,t=this.scrollContainer.scrollLeft){var i;if(this.scrolling)return;this.scrolling=!0;let n=(i=this.duration)!==null&&i!==void 0?i:`${Math.abs(e-t)/this.speed}s`;this.content.style.setProperty("transition-duration",n);let s=parseFloat(getComputedStyle(this.content).getPropertyValue("transition-duration")),a=h=>{h&&h.target!==h.currentTarget||(this.content.style.setProperty("transition-duration","0s"),this.content.style.removeProperty("transform"),this.scrollContainer.style.setProperty("scroll-behavior","auto"),this.scrollContainer.scrollLeft=e,this.setFlippers(),this.content.removeEventListener("transitionend",a),this.scrolling=!1)};if(s===0){a();return}this.content.addEventListener("transitionend",a);let l=this.scrollContainer.scrollWidth-this.scrollContainer.clientWidth,u=this.scrollContainer.scrollLeft-Math.min(e,l);this.isRtl&&(u=this.scrollContainer.scrollLeft+Math.min(Math.abs(e),l)),this.content.style.setProperty("transition-property","transform"),this.content.style.setProperty("transition-timing-function",this.easing),this.content.style.setProperty("transform",`translateX(${u}px)`)}resized(){this.resizeTimeout&&(this.resizeTimeout=clearTimeout(this.resizeTimeout)),this.resizeTimeout=setTimeout(()=>{this.width=this.scrollContainer.offsetWidth,this.setFlippers()},this.frameTime)}scrolled(){this.scrollTimeout&&(this.scrollTimeout=clearTimeout(this.scrollTimeout)),this.scrollTimeout=setTimeout(()=>{this.setFlippers()},this.frameTime)}};r([d({converter:F})],yt.prototype,"speed",void 0);r([d],yt.prototype,"duration",void 0);r([d],yt.prototype,"easing",void 0);r([d({attribute:"flippers-hidden-from-at",converter:Gt})],yt.prototype,"flippersHiddenFromAT",void 0);r([p],yt.prototype,"scrolling",void 0);r([p],yt.prototype,"scrollItems",void 0);r([d({attribute:"view"})],yt.prototype,"view",void 0)});var Fu=c(()=>{});var Ou=c(()=>{Au();Fu()});function Lu(o,e,t){return o.nodeType!==Node.TEXT_NODE?!0:typeof o.nodeValue=="string"&&!!o.nodeValue.trim().length}var Tr=c(()=>{});var Mu=c(()=>{});var Er,ln,Pu=c(()=>{Re();R();Er=class extends v{},ln=class extends de(Er){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Be,cn,Bu=c(()=>{I();g();Jt();pe();Pu();Be=class extends ln{readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.validate(),this.autofocus&&y.queueUpdate(()=>{this.focus()})}validate(){super.validate(this.control)}handleTextInput(){this.value=this.control.value}handleClearInput(){this.value="",this.control.focus(),this.handleChange()}handleChange(){this.$emit("change")}};r([d({attribute:"readonly",mode:"boolean"})],Be.prototype,"readOnly",void 0);r([d({mode:"boolean"})],Be.prototype,"autofocus",void 0);r([d],Be.prototype,"placeholder",void 0);r([d],Be.prototype,"list",void 0);r([d({converter:F})],Be.prototype,"maxlength",void 0);r([d({converter:F})],Be.prototype,"minlength",void 0);r([d],Be.prototype,"pattern",void 0);r([d({converter:F})],Be.prototype,"size",void 0);r([d({mode:"boolean"})],Be.prototype,"spellcheck",void 0);r([p],Be.prototype,"defaultSlottedNodes",void 0);cn=class{};A(cn,P);A(Be,N,cn)});var zu=c(()=>{Mu();Bu()});var Rr,dn,Hu=c(()=>{vr();Re();Rr=class extends so{},dn=class extends de(Rr){constructor(){super(...arguments),this.proxy=document.createElement("select")}}});var Je,ii,Nu=c(()=>{I();g();L();io();be();pe();Hu();Gi();Je=class extends dn{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.listboxId=Le("listbox-"),this.maxHeight=0}openChanged(e,t){if(this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,y.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return C.track(this,"value"),this._value}set value(e){var t,i,n,s,a,l,u;let h=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){let f=this._options.findIndex(S=>S.value===e),m=(n=(i=this._options[this.selectedIndex])===null||i===void 0?void 0:i.value)!==null&&n!==void 0?n:null,b=(a=(s=this._options[f])===null||s===void 0?void 0:s.value)!==null&&a!==void 0?a:null;(f===-1||m!==b)&&(e="",this.selectedIndex=f),e=(u=(l=this.firstSelectedOption)===null||l===void 0?void 0:l.value)!==null&&u!==void 0?u:e}h!==e&&(this._value=e,super.valueChanged(h,e),C.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,i;this.$fastController.isConnected&&(this.value=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&i!==void 0?i:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?nt.above:nt.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===nt.above?~~e.top:~~i}get displayValue(){var e,t;return C.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){let t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;let i=e.relatedTarget;if(this.isSameNode(i)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(i)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(i=>{C.getNotifier(i).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(i=>{C.getNotifier(i).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var i;super.selectedOptionsChanged(e,t),(i=this.options)===null||i===void 0||i.forEach((n,s)=>{var a;let l=(a=this.proxy)===null||a===void 0?void 0:a.options.item(s);l&&(l.selected=n.selected)})}setDefaultSelectedOption(){var e;let t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(fe.slottedOptionFilter),i=t?.findIndex(n=>n.hasAttribute("selected")||n.selected||n.value===this.value);if(i!==-1){this.selectedIndex=i;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{let t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);let t=e.key||e.key.charCodeAt(0);switch(t){case Ee:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case re:case ae:{e.preventDefault();break}case ee:{e.preventDefault(),this.open=!this.open;break}case Te:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case Ot:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t===Y||t===Q)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&C.notify(this,"displayValue")}};r([d({attribute:"open",mode:"boolean"})],Je.prototype,"open",void 0);r([Wa],Je.prototype,"collapsible",null);r([p],Je.prototype,"control",void 0);r([d({attribute:"position"})],Je.prototype,"positionAttribute",void 0);r([p],Je.prototype,"position",void 0);r([p],Je.prototype,"maxHeight",void 0);ii=class{};r([p],ii.prototype,"ariaControls",void 0);A(ii,qe);A(Je,N,ii)});var Vu,_u=c(()=>{g();io();be();Vu=(o,e)=>k`
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
        ${Yt(t=>t.collapsible,k`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${X("control")}
                >
                    ${_e(o,e)}
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
                    ${Ve(o,e)}
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
                ${K({filter:fe.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`});var Uu=c(()=>{Nu();Gi();_u()});var ju=c(()=>{});var So,qu=c(()=>{I();g();R();So=class extends v{constructor(){super(...arguments),this.shape="rect"}};r([d],So.prototype,"fill",void 0);r([d],So.prototype,"shape",void 0);r([d],So.prototype,"pattern",void 0);r([d({mode:"boolean"})],So.prototype,"shimmer",void 0)});var Gu=c(()=>{ju();qu()});var Wu=c(()=>{});function ni(o,e,t,i){let n=Mt(0,1,(o-e)/(t-e));return i===O.rtl&&(n=1-n),n}var Dr=c(()=>{L()});var un,rt,Yu=c(()=>{I();g();L();Dr();R();un={min:0,max:0,direction:O.ltr,orientation:U.horizontal,disabled:!1},rt=class extends v{constructor(){super(...arguments),this.hideMark=!1,this.sliderDirection=O.ltr,this.getSliderConfiguration=()=>{if(!this.isSliderConfig(this.parentNode))this.sliderDirection=un.direction||O.ltr,this.sliderOrientation=un.orientation||U.horizontal,this.sliderMaxPosition=un.max,this.sliderMinPosition=un.min;else{let e=this.parentNode,{min:t,max:i,direction:n,orientation:s,disabled:a}=e;a!==void 0&&(this.disabled=a),this.sliderDirection=n||O.ltr,this.sliderOrientation=s||U.horizontal,this.sliderMaxPosition=i,this.sliderMinPosition=t}},this.positionAsStyle=()=>{let e=this.sliderDirection?this.sliderDirection:O.ltr,t=ni(Number(this.position),Number(this.sliderMinPosition),Number(this.sliderMaxPosition)),i=Math.round((1-t)*100),n=Math.round(t*100);return Number.isNaN(n)&&Number.isNaN(i)&&(i=50,n=50),this.sliderOrientation===U.horizontal?e===O.rtl?`right: ${n}%; left: ${i}%;`:`left: ${n}%; right: ${i}%;`:`top: ${n}%; bottom: ${i}%;`}}positionChanged(){this.positionStyle=this.positionAsStyle()}sliderOrientationChanged(){}connectedCallback(){super.connectedCallback(),this.getSliderConfiguration(),this.positionStyle=this.positionAsStyle(),this.notifier=C.getNotifier(this.parentNode),this.notifier.subscribe(this,"orientation"),this.notifier.subscribe(this,"direction"),this.notifier.subscribe(this,"max"),this.notifier.subscribe(this,"min")}disconnectedCallback(){super.disconnectedCallback(),this.notifier.unsubscribe(this,"orientation"),this.notifier.unsubscribe(this,"direction"),this.notifier.unsubscribe(this,"max"),this.notifier.unsubscribe(this,"min")}handleChange(e,t){switch(t){case"direction":this.sliderDirection=e.direction;break;case"orientation":this.sliderOrientation=e.orientation;break;case"max":this.sliderMaxPosition=e.max;break;case"min":this.sliderMinPosition=e.min;break;default:break}this.positionStyle=this.positionAsStyle()}isSliderConfig(e){return e.max!==void 0&&e.min!==void 0}};r([p],rt.prototype,"positionStyle",void 0);r([d],rt.prototype,"position",void 0);r([d({attribute:"hide-mark",mode:"boolean"})],rt.prototype,"hideMark",void 0);r([d({attribute:"disabled",mode:"boolean"})],rt.prototype,"disabled",void 0);r([p],rt.prototype,"sliderOrientation",void 0);r([p],rt.prototype,"sliderMinPosition",void 0);r([p],rt.prototype,"sliderMaxPosition",void 0);r([p],rt.prototype,"sliderDirection",void 0)});var Qu=c(()=>{Wu();Yu()});var Xu=c(()=>{});var Ar,hn,Zu=c(()=>{Re();R();Ar=class extends v{},hn=class extends de(Ar){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Ym,ge,Ju=c(()=>{I();g();L();Pt();Dr();Zu();Ym={singleValue:"single-value"},ge=class extends hn{constructor(){super(...arguments),this.direction=O.ltr,this.isDragging=!1,this.trackWidth=0,this.trackMinWidth=0,this.trackHeight=0,this.trackLeft=0,this.trackMinHeight=0,this.valueTextFormatter=()=>null,this.min=0,this.max=10,this.step=1,this.orientation=U.horizontal,this.mode=Ym.singleValue,this.keypressHandler=e=>{if(!this.readOnly){if(e.key===re)e.preventDefault(),this.value=`${this.min}`;else if(e.key===ae)e.preventDefault(),this.value=`${this.max}`;else if(!e.shiftKey)switch(e.key){case ye:case Q:e.preventDefault(),this.increment();break;case ve:case Y:e.preventDefault(),this.decrement();break}}},this.setupTrackConstraints=()=>{let e=this.track.getBoundingClientRect();this.trackWidth=this.track.clientWidth,this.trackMinWidth=this.track.clientLeft,this.trackHeight=e.bottom,this.trackMinHeight=e.top,this.trackLeft=this.getBoundingClientRect().left,this.trackWidth===0&&(this.trackWidth=1)},this.setupListeners=(e=!1)=>{let t=`${e?"remove":"add"}EventListener`;this[t]("keydown",this.keypressHandler),this[t]("mousedown",this.handleMouseDown),this.thumb[t]("mousedown",this.handleThumbMouseDown,{passive:!0}),this.thumb[t]("touchstart",this.handleThumbMouseDown,{passive:!0}),e&&(this.handleMouseDown(null),this.handleThumbMouseDown(null))},this.initialValue="",this.handleThumbMouseDown=e=>{if(e){if(this.readOnly||this.disabled||e.defaultPrevented)return;e.target.focus()}let t=`${e!==null?"add":"remove"}EventListener`;window[t]("mouseup",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove,{passive:!0}),window[t]("touchmove",this.handleMouseMove,{passive:!0}),window[t]("touchend",this.handleWindowMouseUp),this.isDragging=e!==null},this.handleMouseMove=e=>{if(this.readOnly||this.disabled||e.defaultPrevented)return;let t=window.TouchEvent&&e instanceof TouchEvent?e.touches[0]:e,i=this.orientation===U.horizontal?t.pageX-document.documentElement.scrollLeft-this.trackLeft:t.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`},this.calculateNewValue=e=>{let t=ni(e,this.orientation===U.horizontal?this.trackMinWidth:this.trackMinHeight,this.orientation===U.horizontal?this.trackWidth:this.trackHeight,this.direction),i=(this.max-this.min)*t+this.min;return this.convertToConstrainedValue(i)},this.handleWindowMouseUp=e=>{this.stopDragging()},this.stopDragging=()=>{this.isDragging=!1,this.handleMouseDown(null),this.handleThumbMouseDown(null)},this.handleMouseDown=e=>{let t=`${e!==null?"add":"remove"}EventListener`;if((e===null||!this.disabled&&!this.readOnly)&&(window[t]("mouseup",this.handleWindowMouseUp),window.document[t]("mouseleave",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove),e)){e.preventDefault(),this.setupTrackConstraints(),e.target.focus();let i=this.orientation===U.horizontal?e.pageX-document.documentElement.scrollLeft-this.trackLeft:e.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`}},this.convertToConstrainedValue=e=>{isNaN(e)&&(e=this.min);let t=e-this.min,i=Math.round(t/this.step),n=t-i*(this.stepMultiplier*this.step)/this.stepMultiplier;return t=n>=Number(this.step)/2?t-n+Number(this.step):t-n,t+this.min}}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){super.valueChanged(e,t),this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction),this.$emit("change")}minChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.min=`${this.min}`),this.validate()}maxChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.max=`${this.max}`),this.validate()}stepChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.step=`${this.step}`),this.updateStepMultiplier(),this.validate()}orientationChanged(){this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","range"),this.direction=Me(this),this.updateStepMultiplier(),this.setupTrackConstraints(),this.setupListeners(),this.setupDefaultValue(),this.setThumbPositionForOrientation(this.direction)}disconnectedCallback(){this.setupListeners(!0)}increment(){let e=this.direction!==O.rtl&&this.orientation!==U.vertical?Number(this.value)+Number(this.step):Number(this.value)-Number(this.step),t=this.convertToConstrainedValue(e),i=t<Number(this.max)?`${t}`:`${this.max}`;this.value=i}decrement(){let e=this.direction!==O.rtl&&this.orientation!==U.vertical?Number(this.value)-Number(this.step):Number(this.value)+Number(this.step),t=this.convertToConstrainedValue(e),i=t>Number(this.min)?`${t}`:`${this.min}`;this.value=i}setThumbPositionForOrientation(e){let i=(1-ni(Number(this.value),Number(this.min),Number(this.max),e))*100;this.orientation===U.horizontal?this.position=this.isDragging?`right: ${i}%; transition: none;`:`right: ${i}%; transition: all 0.2s ease;`:this.position=this.isDragging?`bottom: ${i}%; transition: none;`:`bottom: ${i}%; transition: all 0.2s ease;`}updateStepMultiplier(){let e=this.step+"",t=this.step%1?e.length-e.indexOf(".")-1:0;this.stepMultiplier=Math.pow(10,t)}get midpoint(){return`${this.convertToConstrainedValue((this.max+this.min)/2)}`}setupDefaultValue(){if(typeof this.value=="string")if(this.value.length===0)this.initialValue=this.midpoint;else{let e=parseFloat(this.value);!Number.isNaN(e)&&(e<this.min||e>this.max)&&(this.value=this.midpoint)}}};r([d({attribute:"readonly",mode:"boolean"})],ge.prototype,"readOnly",void 0);r([p],ge.prototype,"direction",void 0);r([p],ge.prototype,"isDragging",void 0);r([p],ge.prototype,"position",void 0);r([p],ge.prototype,"trackWidth",void 0);r([p],ge.prototype,"trackMinWidth",void 0);r([p],ge.prototype,"trackHeight",void 0);r([p],ge.prototype,"trackLeft",void 0);r([p],ge.prototype,"trackMinHeight",void 0);r([p],ge.prototype,"valueTextFormatter",void 0);r([d({converter:F})],ge.prototype,"min",void 0);r([d({converter:F})],ge.prototype,"max",void 0);r([d({converter:F})],ge.prototype,"step",void 0);r([d],ge.prototype,"orientation",void 0);r([d],ge.prototype,"mode",void 0)});var Ku=c(()=>{Xu();Ju()});var eh=c(()=>{});var Fr,pn,th=c(()=>{Re();R();Fr=class extends v{},pn=class extends go(Fr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var fn,oh=c(()=>{I();g();L();th();fn=class extends pn{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(!this.readOnly)switch(e.key){case ee:case Ee:this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly),this.readOnly?this.classList.add("readonly"):this.classList.remove("readonly")}checkedChanged(e,t){super.checkedChanged(e,t),this.checked?this.classList.add("checked"):this.classList.remove("checked")}};r([d({attribute:"readonly",mode:"boolean"})],fn.prototype,"readOnly",void 0);r([p],fn.prototype,"defaultSlottedNodes",void 0)});var ih=c(()=>{eh();oh()});var nh,sh=c(()=>{g();nh=(o,e)=>k`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`});var mn,rh=c(()=>{R();mn=class extends v{}});var ah=c(()=>{sh();rh()});var lh,ch=c(()=>{g();lh=(o,e)=>k`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`});var si,dh=c(()=>{I();g();R();si=class extends v{};r([d({mode:"boolean"})],si.prototype,"disabled",void 0)});var uh=c(()=>{ch();dh()});var hh,ph=c(()=>{g();be();hh=(o,e)=>k`
    <template class="${t=>t.orientation}">
        ${_e(o,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${K("tabs")}></slot>

            ${Yt(t=>t.showActiveIndicator,k`
                    <div
                        ${X("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${Ve(o,e)}
        <div class="tabpanel" part="tabpanel">
            <slot name="tabpanel" ${K("tabpanels")}></slot>
        </div>
    </template>
`});var bn,Ge,fh=c(()=>{I();g();L();be();pe();R();bn={vertical:"vertical",horizontal:"horizontal"},Ge=class extends v{constructor(){super(...arguments),this.orientation=bn.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isHiddenElement=e=>e.hasAttribute("hidden"),this.isFocusableElement=e=>!this.isDisabledElement(e)&&!this.isHiddenElement(e),this.setTabs=()=>{let e="gridColumn",t="gridRow",i=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((n,s)=>{if(n.slot==="tab"){let a=this.activeTabIndex===s&&this.isFocusableElement(n);this.activeindicator&&this.isFocusableElement(n)&&(this.showActiveIndicator=!0);let l=this.tabIds[s],u=this.tabpanelIds[s];n.setAttribute("id",l),n.setAttribute("aria-selected",a?"true":"false"),n.setAttribute("aria-controls",u),n.addEventListener("click",this.handleTabClick),n.addEventListener("keydown",this.handleTabKeyDown),n.setAttribute("tabindex",a?"0":"-1"),a&&(this.activetab=n,this.activeid=l)}n.style[e]="",n.style[t]="",n.style[i]=`${s+1}`,this.isHorizontal()?n.classList.remove("vertical"):n.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{let i=this.tabIds[t],n=this.tabpanelIds[t];e.setAttribute("id",n),e.setAttribute("aria-labelledby",i),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{let t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case ve:e.preventDefault(),this.adjustBackward(e);break;case ye:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case Q:e.preventDefault(),this.adjustBackward(e);break;case Y:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case re:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case ae:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)+1:1,i===t.length&&(i=0);i<t.length&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else{if(this.activetab&&i===t.indexOf(this.activetab))break;i+1>=t.length?i=0:i+=1}},this.adjustBackward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)-1:0,i=i<0?t.length-1:i;i>=0&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else i-1<0?i=t.length-1:i-=1},this.moveToTabByIndex=(e,t)=>{let i=e[t];this.activetab=i,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,i.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(i=>i.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${Le()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${Le()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===bn.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;let e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",i=this.isHorizontal()?"offsetLeft":"offsetTop",n=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;let s=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;let a=s-n;this.activeIndicatorRef.style.transform=`${t}(${a}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){let t=this.tabs.filter(a=>this.isFocusableElement(a)),i=t.indexOf(this.activetab),n=Mt(0,t.length-1,i+e),s=this.tabs.indexOf(t[n]);s>-1&&this.moveToTabByIndex(this.tabs,s)}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}};r([d],Ge.prototype,"orientation",void 0);r([d],Ge.prototype,"activeid",void 0);r([p],Ge.prototype,"tabs",void 0);r([p],Ge.prototype,"tabpanels",void 0);r([d({mode:"boolean"})],Ge.prototype,"activeindicator",void 0);r([p],Ge.prototype,"activeIndicatorRef",void 0);r([p],Ge.prototype,"showActiveIndicator",void 0);A(Ge,N)});var mh=c(()=>{ph();fh()});var Or,gn,bh=c(()=>{Re();R();Or=class extends v{},gn=class extends de(Or){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}});var Io,gh=c(()=>{Io={none:"none",both:"both",horizontal:"horizontal",vertical:"vertical"}});var me,Lr=c(()=>{I();g();sn();pe();bh();gh();me=class extends gn{constructor(){super(...arguments),this.resize=Io.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};r([d({mode:"boolean"})],me.prototype,"readOnly",void 0);r([d],me.prototype,"resize",void 0);r([d({mode:"boolean"})],me.prototype,"autofocus",void 0);r([d({attribute:"form"})],me.prototype,"formId",void 0);r([d],me.prototype,"list",void 0);r([d({converter:F})],me.prototype,"maxlength",void 0);r([d({converter:F})],me.prototype,"minlength",void 0);r([d],me.prototype,"name",void 0);r([d],me.prototype,"placeholder",void 0);r([d({converter:F,mode:"fromView"})],me.prototype,"cols",void 0);r([d({converter:F,mode:"fromView"})],me.prototype,"rows",void 0);r([d({mode:"boolean"})],me.prototype,"spellcheck",void 0);r([p],me.prototype,"defaultSlottedNodes",void 0);A(me,Nt)});var vh,yh=c(()=>{g();Lr();vh=(o,e)=>k`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==Io.none?`resize-${t.resize}`:""}"
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
            ${X("control")}
        ></textarea>
    </template>
`});var xh=c(()=>{yh();Lr()});var wh,Ch=c(()=>{g();be();Tr();wh=(o,e)=>k`
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
                ${K({property:"defaultSlottedNodes",filter:Lu})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${_e(o,e)}
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
            ${Ve(o,e)}
        </div>
    </template>
`});var kh=c(()=>{Ch();sn()});var $h=c(()=>{});function Sh(o){let e=o.getRootNode();return e instanceof ShadowRoot?e.activeElement:document.activeElement}var Ih=c(()=>{});var Th,Vt,To,Eh=c(()=>{I();g();L();gr();R();Wo();be();pe();Pt();Ih();Th=Object.freeze({[Lt.ArrowUp]:{[U.vertical]:-1},[Lt.ArrowDown]:{[U.vertical]:1},[Lt.ArrowLeft]:{[U.horizontal]:{[O.ltr]:-1,[O.rtl]:1}},[Lt.ArrowRight]:{[U.horizontal]:{[O.ltr]:1,[O.rtl]:-1}}}),Vt=class o extends v{constructor(){super(...arguments),this._activeIndex=0,this.direction=O.ltr,this.orientation=U.horizontal}get activeIndex(){return C.track(this,"activeIndex"),this._activeIndex}set activeIndex(e){this.$fastController.isConnected&&(this._activeIndex=Mt(0,this.focusableElements.length-1,e),C.notify(this,"activeIndex"))}slottedItemsChanged(){this.$fastController.isConnected&&this.reduceFocusableElements()}mouseDownHandler(e){var t;let i=(t=this.focusableElements)===null||t===void 0?void 0:t.findIndex(n=>n.contains(e.target));return i>-1&&this.activeIndex!==i&&this.setFocusedElement(i),!0}childItemsChanged(e,t){this.$fastController.isConnected&&this.reduceFocusableElements()}connectedCallback(){super.connectedCallback(),this.direction=Me(this)}focusinHandler(e){let t=e.relatedTarget;!t||this.contains(t)||this.setFocusedElement()}getDirectionalIncrementer(e){var t,i,n,s,a;return(a=(n=(i=(t=Th[e])===null||t===void 0?void 0:t[this.orientation])===null||i===void 0?void 0:i[this.direction])!==null&&n!==void 0?n:(s=Th[e])===null||s===void 0?void 0:s[this.orientation])!==null&&a!==void 0?a:0}keydownHandler(e){let t=e.key;if(!(t in Lt)||e.defaultPrevented||e.shiftKey)return!0;let i=this.getDirectionalIncrementer(t);if(!i)return!e.target.closest("[role=radiogroup]");let n=this.activeIndex+i;return this.focusableElements[n]&&e.preventDefault(),this.setFocusedElement(n),!0}get allSlottedItems(){return[...this.start.assignedElements(),...this.slottedItems,...this.end.assignedElements()]}reduceFocusableElements(){var e;let t=(e=this.focusableElements)===null||e===void 0?void 0:e[this.activeIndex];this.focusableElements=this.allSlottedItems.reduce(o.reduceFocusableItems,[]);let i=this.focusableElements.indexOf(t);this.activeIndex=Math.max(0,i),this.setFocusableElements()}setFocusedElement(e=this.activeIndex){this.activeIndex=e,this.setFocusableElements(),this.focusableElements[this.activeIndex]&&this.contains(Sh(this))&&this.focusableElements[this.activeIndex].focus()}static reduceFocusableItems(e,t){var i,n,s,a;let l=t.getAttribute("role")==="radio",u=(n=(i=t.$fastController)===null||i===void 0?void 0:i.definition.shadowOptions)===null||n===void 0?void 0:n.delegatesFocus,h=Array.from((a=(s=t.shadowRoot)===null||s===void 0?void 0:s.querySelectorAll("*"))!==null&&a!==void 0?a:[]).some(f=>br(f));return!t.hasAttribute("disabled")&&!t.hasAttribute("hidden")&&(br(t)||l||u||h)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceFocusableItems,[])):e}setFocusableElements(){this.$fastController.isConnected&&this.focusableElements.length>0&&this.focusableElements.forEach((e,t)=>{e.tabIndex=this.activeIndex===t?0:-1})}};r([p],Vt.prototype,"direction",void 0);r([d],Vt.prototype,"orientation",void 0);r([p],Vt.prototype,"slottedItems",void 0);r([p],Vt.prototype,"slottedLabel",void 0);r([p],Vt.prototype,"childItems",void 0);To=class{};r([d({attribute:"aria-labelledby"})],To.prototype,"ariaLabelledby",void 0);r([d({attribute:"aria-label"})],To.prototype,"ariaLabel",void 0);A(To,P);A(Vt,N,To)});var Rh=c(()=>{$h();Eh()});var Dh=c(()=>{});var Se,Ah=c(()=>{Se={top:"top",right:"right",bottom:"bottom",left:"left",start:"start",end:"end",topLeft:"top-left",topRight:"top-right",bottomLeft:"bottom-left",bottomRight:"bottom-right",topStart:"top-start",topEnd:"top-end",bottomStart:"bottom-start",bottomEnd:"bottom-end"}});var ne,Fh=c(()=>{I();g();L();Pt();R();Ah();ne=class extends v{constructor(){super(...arguments),this.anchor="",this.delay=300,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.horizontalInset="false",this.verticalInset="false",this.horizontalScaling="content",this.verticalScaling="content",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition=void 0,this.tooltipVisible=!1,this.currentDirection=O.ltr,this.showDelayTimer=null,this.hideDelayTimer=null,this.isAnchorHoveredFocused=!1,this.isRegionHovered=!1,this.handlePositionChange=e=>{this.classList.toggle("top",this.region.verticalPosition==="start"),this.classList.toggle("bottom",this.region.verticalPosition==="end"),this.classList.toggle("inset-top",this.region.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.region.verticalPosition==="insetEnd"),this.classList.toggle("center-vertical",this.region.verticalPosition==="center"),this.classList.toggle("left",this.region.horizontalPosition==="start"),this.classList.toggle("right",this.region.horizontalPosition==="end"),this.classList.toggle("inset-left",this.region.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.region.horizontalPosition==="insetEnd"),this.classList.toggle("center-horizontal",this.region.horizontalPosition==="center")},this.handleRegionMouseOver=e=>{this.isRegionHovered=!0},this.handleRegionMouseOut=e=>{this.isRegionHovered=!1,this.startHideDelayTimer()},this.handleAnchorMouseOver=e=>{if(this.tooltipVisible){this.isAnchorHoveredFocused=!0;return}this.startShowDelayTimer()},this.handleAnchorMouseOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.handleAnchorFocusIn=e=>{this.startShowDelayTimer()},this.handleAnchorFocusOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.startHideDelayTimer=()=>{this.clearHideDelayTimer(),this.tooltipVisible&&(this.hideDelayTimer=window.setTimeout(()=>{this.updateTooltipVisibility()},60))},this.clearHideDelayTimer=()=>{this.hideDelayTimer!==null&&(clearTimeout(this.hideDelayTimer),this.hideDelayTimer=null)},this.startShowDelayTimer=()=>{if(!this.isAnchorHoveredFocused){if(this.delay>1){this.showDelayTimer===null&&(this.showDelayTimer=window.setTimeout(()=>{this.startHover()},this.delay));return}this.startHover()}},this.startHover=()=>{this.isAnchorHoveredFocused=!0,this.updateTooltipVisibility()},this.clearShowDelayTimer=()=>{this.showDelayTimer!==null&&(clearTimeout(this.showDelayTimer),this.showDelayTimer=null)},this.getAnchor=()=>{let e=this.getRootNode();return e instanceof ShadowRoot?e.getElementById(this.anchor):document.getElementById(this.anchor)},this.handleDocumentKeydown=e=>{!e.defaultPrevented&&this.tooltipVisible&&e.key===Te&&(this.isAnchorHoveredFocused=!1,this.updateTooltipVisibility(),this.$emit("dismiss"))},this.updateTooltipVisibility=()=>{if(this.visible===!1)this.hideTooltip();else if(this.visible===!0){this.showTooltip();return}else{if(this.isAnchorHoveredFocused||this.isRegionHovered){this.showTooltip();return}this.hideTooltip()}},this.showTooltip=()=>{this.tooltipVisible||(this.currentDirection=Me(this),this.tooltipVisible=!0,document.addEventListener("keydown",this.handleDocumentKeydown),y.queueUpdate(this.setRegionProps))},this.hideTooltip=()=>{this.tooltipVisible&&(this.clearHideDelayTimer(),this.region!==null&&this.region!==void 0&&(this.region.removeEventListener("positionchange",this.handlePositionChange),this.region.viewportElement=null,this.region.anchorElement=null,this.region.removeEventListener("mouseover",this.handleRegionMouseOver),this.region.removeEventListener("mouseout",this.handleRegionMouseOut)),document.removeEventListener("keydown",this.handleDocumentKeydown),this.tooltipVisible=!1)},this.setRegionProps=()=>{this.tooltipVisible&&(this.region.viewportElement=this.viewportElement,this.region.anchorElement=this.anchorElement,this.region.addEventListener("positionchange",this.handlePositionChange),this.region.addEventListener("mouseover",this.handleRegionMouseOver,{passive:!0}),this.region.addEventListener("mouseout",this.handleRegionMouseOut,{passive:!0}))}}visibleChanged(){this.$fastController.isConnected&&(this.updateTooltipVisibility(),this.updateLayout())}anchorChanged(){this.$fastController.isConnected&&(this.anchorElement=this.getAnchor())}positionChanged(){this.$fastController.isConnected&&this.updateLayout()}anchorElementChanged(e){if(this.$fastController.isConnected){if(e!=null&&(e.removeEventListener("mouseover",this.handleAnchorMouseOver),e.removeEventListener("mouseout",this.handleAnchorMouseOut),e.removeEventListener("focusin",this.handleAnchorFocusIn),e.removeEventListener("focusout",this.handleAnchorFocusOut)),this.anchorElement!==null&&this.anchorElement!==void 0){this.anchorElement.addEventListener("mouseover",this.handleAnchorMouseOver,{passive:!0}),this.anchorElement.addEventListener("mouseout",this.handleAnchorMouseOut,{passive:!0}),this.anchorElement.addEventListener("focusin",this.handleAnchorFocusIn,{passive:!0}),this.anchorElement.addEventListener("focusout",this.handleAnchorFocusOut,{passive:!0});let t=this.anchorElement.id;this.anchorElement.parentElement!==null&&this.anchorElement.parentElement.querySelectorAll(":hover").forEach(i=>{i.id===t&&this.startShowDelayTimer()})}this.region!==null&&this.region!==void 0&&this.tooltipVisible&&(this.region.anchorElement=this.anchorElement),this.updateLayout()}}viewportElementChanged(){this.region!==null&&this.region!==void 0&&(this.region.viewportElement=this.viewportElement),this.updateLayout()}connectedCallback(){super.connectedCallback(),this.anchorElement=this.getAnchor(),this.updateTooltipVisibility()}disconnectedCallback(){this.hideTooltip(),this.clearShowDelayTimer(),this.clearHideDelayTimer(),super.disconnectedCallback()}updateLayout(){switch(this.verticalPositioningMode="locktodefault",this.horizontalPositioningMode="locktodefault",this.position){case Se.top:case Se.bottom:this.verticalDefaultPosition=this.position,this.horizontalDefaultPosition="center";break;case Se.right:case Se.left:case Se.start:case Se.end:this.verticalDefaultPosition="center",this.horizontalDefaultPosition=this.position;break;case Se.topLeft:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="left";break;case Se.topRight:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="right";break;case Se.bottomLeft:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="left";break;case Se.bottomRight:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="right";break;case Se.topStart:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="start";break;case Se.topEnd:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="end";break;case Se.bottomStart:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="start";break;case Se.bottomEnd:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="end";break;default:this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition="center";break}}};r([d({mode:"boolean"})],ne.prototype,"visible",void 0);r([d],ne.prototype,"anchor",void 0);r([d],ne.prototype,"delay",void 0);r([d],ne.prototype,"position",void 0);r([d({attribute:"auto-update-mode"})],ne.prototype,"autoUpdateMode",void 0);r([d({attribute:"horizontal-viewport-lock"})],ne.prototype,"horizontalViewportLock",void 0);r([d({attribute:"vertical-viewport-lock"})],ne.prototype,"verticalViewportLock",void 0);r([p],ne.prototype,"anchorElement",void 0);r([p],ne.prototype,"viewportElement",void 0);r([p],ne.prototype,"verticalPositioningMode",void 0);r([p],ne.prototype,"horizontalPositioningMode",void 0);r([p],ne.prototype,"horizontalInset",void 0);r([p],ne.prototype,"verticalInset",void 0);r([p],ne.prototype,"horizontalScaling",void 0);r([p],ne.prototype,"verticalScaling",void 0);r([p],ne.prototype,"verticalDefaultPosition",void 0);r([p],ne.prototype,"horizontalDefaultPosition",void 0);r([p],ne.prototype,"tooltipVisible",void 0);r([p],ne.prototype,"currentDirection",void 0)});var Oh=c(()=>{Dh();Fh()});var Lh=c(()=>{});function xt(o){return it(o)&&o.getAttribute("role")==="treeitem"}var oe,Mr=c(()=>{I();g();L();be();pe();R();oe=class extends v{constructor(){super(...arguments),this.expanded=!1,this.focusable=!1,this.isNestedItem=()=>xt(this.parentElement),this.handleExpandCollapseButtonClick=e=>{!this.disabled&&!e.defaultPrevented&&(this.expanded=!this.expanded)},this.handleFocus=e=>{this.setAttribute("tabindex","0")},this.handleBlur=e=>{this.setAttribute("tabindex","-1")}}expandedChanged(){this.$fastController.isConnected&&this.$emit("expanded-change",this)}selectedChanged(){this.$fastController.isConnected&&this.$emit("selected-change",this)}itemsChanged(e,t){this.$fastController.isConnected&&this.items.forEach(i=>{xt(i)&&(i.nested=!0)})}static focusItem(e){e.focusable=!0,e.focus()}childItemLength(){let e=this.childItems.filter(t=>xt(t));return e?e.length:0}};r([d({mode:"boolean"})],oe.prototype,"expanded",void 0);r([d({mode:"boolean"})],oe.prototype,"selected",void 0);r([d({mode:"boolean"})],oe.prototype,"disabled",void 0);r([p],oe.prototype,"focusable",void 0);r([p],oe.prototype,"childItems",void 0);r([p],oe.prototype,"items",void 0);r([p],oe.prototype,"nested",void 0);r([p],oe.prototype,"renderCollapsedChildren",void 0);A(oe,N)});var Mh=c(()=>{Lh();Mr()});var Ph=c(()=>{});var ri,Bh=c(()=>{I();g();L();Mr();R();ri=class extends v{constructor(){super(...arguments),this.currentFocused=null,this.handleFocus=e=>{if(!(this.slottedTreeItems.length<1)){if(e.target===this){this.currentFocused===null&&(this.currentFocused=this.getValidFocusableItem()),this.currentFocused!==null&&oe.focusItem(this.currentFocused);return}this.contains(e.target)&&(this.setAttribute("tabindex","-1"),this.currentFocused=e.target)}},this.handleBlur=e=>{e.target instanceof HTMLElement&&(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabindex","0")},this.handleKeyDown=e=>{if(e.defaultPrevented)return;if(this.slottedTreeItems.length<1)return!0;let t=this.getVisibleNodes();switch(e.key){case re:t.length&&oe.focusItem(t[0]);return;case ae:t.length&&oe.focusItem(t[t.length-1]);return;case ve:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof oe&&i.childItemLength()>0&&i.expanded?i.expanded=!1:i instanceof oe&&i.parentElement instanceof oe&&oe.focusItem(i.parentElement)}return!1;case ye:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof oe&&i.childItemLength()>0&&!i.expanded?i.expanded=!0:i instanceof oe&&i.childItemLength()>0&&this.focusNextNode(1,e.target)}return;case Y:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(1,e.target);return;case Q:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(-1,e.target);return;case ee:this.handleClick(e);return}return!0},this.handleSelectedChange=e=>{if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!xt(e.target))return!0;let t=e.target;t.selected?(this.currentSelected&&this.currentSelected!==t&&(this.currentSelected.selected=!1),this.currentSelected=t):!t.selected&&this.currentSelected===t&&(this.currentSelected=null)},this.setItems=()=>{let e=this.treeView.querySelector("[aria-selected='true']");this.currentSelected=e,(this.currentFocused===null||!this.contains(this.currentFocused))&&(this.currentFocused=this.getValidFocusableItem()),this.nested=this.checkForNestedItems(),this.getVisibleNodes().forEach(i=>{xt(i)&&(i.nested=this.nested)})},this.isFocusableElement=e=>xt(e),this.isSelectedElement=e=>e.selected}slottedTreeItemsChanged(){this.$fastController.isConnected&&this.setItems()}connectedCallback(){super.connectedCallback(),this.setAttribute("tabindex","0"),y.queueUpdate(()=>{this.setItems()})}handleClick(e){if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!xt(e.target))return!0;let t=e.target;t.disabled||(t.selected=!t.selected)}focusNextNode(e,t){let i=this.getVisibleNodes();if(!i)return;let n=i[i.indexOf(t)+e];it(n)&&oe.focusItem(n)}getValidFocusableItem(){let e=this.getVisibleNodes(),t=e.findIndex(this.isSelectedElement);return t===-1&&(t=e.findIndex(this.isFocusableElement)),t!==-1?e[t]:null}checkForNestedItems(){return this.slottedTreeItems.some(e=>xt(e)&&e.querySelector("[role='treeitem']"))}getVisibleNodes(){return Wl(this,"[role='treeitem']")||[]}};r([d({attribute:"render-collapsed-nodes"})],ri.prototype,"renderCollapsedNodes",void 0);r([p],ri.prototype,"currentSelected",void 0);r([p],ri.prototype,"slottedTreeItems",void 0)});var zh=c(()=>{Ph();Bh()});var Pr,ai,rD,aD,lD,Hh=c(()=>{Pr=class{constructor(e){this.listenerCache=new WeakMap,this.query=e}bind(e){let{query:t}=this,i=this.constructListener(e);i.bind(t)(),t.addListener(i),this.listenerCache.set(e,i)}unbind(e){let t=this.listenerCache.get(e);t&&(this.query.removeListener(t),this.listenerCache.delete(e))}},ai=class o extends Pr{constructor(e,t){super(e),this.styles=t}static with(e){return t=>new o(e,t)}constructListener(e){let t=!1,i=this.styles;return function(){let{matches:s}=this;s&&!t?(e.$fastController.addStyles(i),t=s):!s&&t&&(e.$fastController.removeStyles(i),t=s)}}unbind(e){super.unbind(e),e.$fastController.removeStyles(this.styles)}},rD=ai.with(window.matchMedia("(forced-colors)")),aD=ai.with(window.matchMedia("(prefers-color-scheme: dark)")),lD=ai.with(window.matchMedia("(prefers-color-scheme: light)"))});var Nh=c(()=>{});var Ie,Vh=c(()=>{Ie="not-allowed"});function H(o){return`${Qm}:host{display:${o}}`}var Qm,_h=c(()=>{Qm=":host([hidden]){display:none}"});var q,Uh=c(()=>{L();q=Yl()?"focus-visible":"focus"});var jh=c(()=>{Vh();_h();Uh()});var qh=c(()=>{pe();Yi();Hh();Nh();jh();Pt();Tr()});var z=c(()=>{Bl();fc();gc();_s();Ic();Rc();Ac();Lc();Uc();ed();id();ld();hd();Jc();gd();cr();vd();Id();Rd();Ld();Hd();Nd();Vd();jd();Gd();ou();kr();lu();fu();Jt();vu();wu();Su();Du();Ou();zu();Uu();Gu();Qu();Ku();ih();ah();uh();mh();xh();kh();Rh();Oh();Mh();zh();qh()});function Xm(o){return pr.getOrCreate(o).withPrefix("vscode")}var Gh=c(()=>{z()});function Yh(o){window.addEventListener("load",()=>{new MutationObserver(()=>{Wh(o)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),Wh(o)})}function Wh(o){let e=getComputedStyle(document.body),t=document.querySelector("body");if(t){let i=t.getAttribute("data-vscode-theme-kind");for(let[n,s]of o){let a=e.getPropertyValue(n).toString();if(i==="vscode-high-contrast")a.length===0&&s.name.includes("background")&&(a="transparent"),s.name==="button-icon-hover-background"&&(a="transparent");else if(i==="vscode-high-contrast-light"){if(a.length===0&&s.name.includes("background"))switch(s.name){case"button-primary-hover-background":a="#0F4A85";break;case"button-secondary-hover-background":a="transparent";break;case"button-icon-hover-background":a="transparent";break}}else s.name==="contrast-active-border"&&(a="transparent");s.setValueFor(t,a)}}}var Qh=c(()=>{});function x(o,e){let t=Ko.create(o);if(e){if(e.includes("--fake-vscode-token")){let i="id"+Math.random().toString(16).slice(2);e=`${e}-${i}`}Xh.set(e,t)}return Zh||(Yh(Xh),Zh=!0),t}var Xh,Zh,Jh=c(()=>{z();Qh();Xh=new Map,Zh=!1});var Kh,T,vn,FA,at,lt,w,Oe,V,Z,OA,G,Eo,Ro,j,W,yn,xn,LA,MA,PA,BA,ep,tp,op,ip,np,wn,Cn,Do,Br,sp,rp,zr,ap,ao,Hr,Nr,kn,lp,cp,dp,up,Ke,_t,hp,zA,ct,wt,pp,fp,li,et,HA,mp,Ct,$n,NA,Vr,bp,gp,vp,Ut,yp,VA,_A,xp,he=c(()=>{Jh();Kh=x("background","--vscode-editor-background").withDefault("#1e1e1e"),T=x("border-width").withDefault(1),vn=x("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518"),FA=x("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df"),at=x("corner-radius").withDefault(0),lt=x("corner-radius-round").withDefault(2),w=x("design-unit").withDefault(4),Oe=x("disabled-opacity").withDefault(.4),V=x("focus-border","--vscode-focusBorder").withDefault("#007fd4"),Z=x("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol"),OA=x("font-weight","--vscode-font-weight").withDefault("400"),G=x("foreground","--vscode-foreground").withDefault("#cccccc"),Eo=x("input-height").withDefault("26"),Ro=x("input-min-width").withDefault("100px"),j=x("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),W=x("type-ramp-base-line-height").withDefault("normal"),yn=x("type-ramp-minus1-font-size").withDefault("11px"),xn=x("type-ramp-minus1-line-height").withDefault("16px"),LA=x("type-ramp-minus2-font-size").withDefault("9px"),MA=x("type-ramp-minus2-line-height").withDefault("16px"),PA=x("type-ramp-plus1-font-size").withDefault("16px"),BA=x("type-ramp-plus1-line-height").withDefault("24px"),ep=x("scrollbarWidth").withDefault("10px"),tp=x("scrollbarHeight").withDefault("10px"),op=x("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),ip=x("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),np=x("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),wn=x("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),Cn=x("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),Do=x("button-border","--vscode-button-border").withDefault("transparent"),Br=x("button-icon-background").withDefault("transparent"),sp=x("button-icon-corner-radius").withDefault("5px"),rp=x("button-icon-outline-offset").withDefault(0),zr=x("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),ap=x("button-icon-padding").withDefault("3px"),ao=x("button-primary-background","--vscode-button-background").withDefault("#0e639c"),Hr=x("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),Nr=x("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),kn=x("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),lp=x("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),cp=x("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),dp=x("button-padding-horizontal").withDefault("11px"),up=x("button-padding-vertical").withDefault("4px"),Ke=x("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),_t=x("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),hp=x("checkbox-corner-radius").withDefault(3),zA=x("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0"),ct=x("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),wt=x("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),pp=x("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),fp=x("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),li=x("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),et=x("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c"),HA=x("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0"),mp=x("dropdown-list-max-height").withDefault("200px"),Ct=x("input-background","--vscode-input-background").withDefault("#3c3c3c"),$n=x("input-foreground","--vscode-input-foreground").withDefault("#cccccc"),NA=x("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc"),Vr=x("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),bp=x("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),gp=x("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),vp=x("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Ut=x("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),yp=x("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799"),VA=x("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e"),_A=x("panel-view-border","--vscode-panel-border").withDefault("#80808059"),xp=x("tag-corner-radius").withDefault("2px")});var wp,Cp=c(()=>{g();z();he();wp=(o,e)=>D`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${Z};
		font-size: ${yn};
		line-height: ${xn};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${wn};
		border: calc(${T} * 1px) solid ${Do};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${Cn};
		display: flex;
		height: calc(${w} * 4px);
		justify-content: center;
		min-width: calc(${w} * 4px + 2px);
		min-height: calc(${w} * 4px + 2px);
		padding: 3px 6px;
	}
`});var Sn,_r,Ur=c(()=>{z();Cp();Sn=class extends mt{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}},_r=Sn.compose({baseName:"badge",template:Vi,styles:wp})});function kp(o,e,t,i){var n=arguments.length,s=n<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(a=o[l])&&(s=(n<3?a(s):n>3?a(e,t,s):a(e,t))||s);return n>3&&s&&Object.defineProperty(e,t,s),s}var $p=c(()=>{});var Zm,Jm,Km,eb,Sp,Ip=c(()=>{g();z();he();Zm=D`
	${H("inline-flex")} :host {
		outline: none;
		font-family: ${Z};
		font-size: ${j};
		line-height: ${W};
		color: ${Hr};
		background: ${ao};
		border-radius: calc(${lt} * 1px);
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
		padding: ${up} ${dp};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${T} * 1px) solid ${Do};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${Nr};
	}
	:host(:active) {
		background: ${ao};
	}
	.control:${q} {
		outline: calc(${T} * 1px) solid ${V};
		outline-offset: calc(${T} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Oe};
		background: ${ao};
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
`,Jm=D`
	:host([appearance='primary']) {
		background: ${ao};
		color: ${Hr};
	}
	:host([appearance='primary']:hover) {
		background: ${Nr};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${ao};
	}
	:host([appearance='primary']) .control:${q} {
		outline: calc(${T} * 1px) solid ${V};
		outline-offset: calc(${T} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${ao};
	}
`,Km=D`
	:host([appearance='secondary']) {
		background: ${kn};
		color: ${lp};
	}
	:host([appearance='secondary']:hover) {
		background: ${cp};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${kn};
	}
	:host([appearance='secondary']) .control:${q} {
		outline: calc(${T} * 1px) solid ${V};
		outline-offset: calc(${T} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${kn};
	}
`,eb=D`
	:host([appearance='icon']) {
		background: ${Br};
		border-radius: ${sp};
		color: ${G};
	}
	:host([appearance='icon']:hover) {
		background: ${zr};
		outline: 1px dotted ${vn};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${ap};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${zr};
	}
	:host([appearance='icon']) .control:${q} {
		outline: calc(${T} * 1px) solid ${V};
		outline-offset: ${rp};
	}
	:host([appearance='icon'][disabled]) {
		background: ${Br};
	}
`,Sp=(o,e)=>D`
	${Zm}
	${Jm}
	${Km}
	${eb}
`});var ci,jr,qr=c(()=>{$p();g();z();Ip();ci=class extends De{connectedCallback(){if(super.connectedCallback(),!this.appearance){let e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,i){e==="appearance"&&i==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=i),e==="disabled"&&(this.disabled=i!==null)}};kp([d],ci.prototype,"appearance",void 0);jr=ci.compose({baseName:"button",template:Mc,styles:Sp,shadowOptions:{delegatesFocus:!0}})});var Tp,Ep=c(()=>{g();z();he();Tp=(o,e)=>D`
	${H("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${w} * 1px) 0;
		user-select: none;
		font-size: ${j};
		line-height: ${W};
	}
	.control {
		position: relative;
		width: calc(${w} * 4px + 2px);
		height: calc(${w} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${hp} * 1px);
		border: calc(${T} * 1px) solid ${_t};
		background: ${Ke};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${Z};
		color: ${G};
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
		fill: ${G};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${G};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${Ke};
		border-color: ${_t};
	}
	:host(:enabled) .control:active {
		background: ${Ke};
		border-color: ${V};
	}
	:host(:${q}) .control {
		border: calc(${T} * 1px) solid ${V};
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
		opacity: ${Oe};
	}
`});var In,Gr,Wr=c(()=>{z();Ep();In=class extends oo{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}},Gr=In.compose({baseName:"checkbox",template:nd,styles:Tp,checkedIndicator:`
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
	`})});var Rp,Dp=c(()=>{g();Rp=(o,e)=>D`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`});var Ap,Fp=c(()=>{g();he();Ap=(o,e)=>D`
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
		background: ${Kh};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${pp};
		outline: 1px dotted ${vn};
		outline-offset: -1px;
	}
`});var Op,Lp=c(()=>{g();z();he();Op=(o,e)=>D`
	:host {
		padding: calc(${w} * 1px) calc(${w} * 3px);
		color: ${G};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${Z};
		font-size: ${j};
		line-height: ${W};
		font-weight: 400;
		border: solid calc(${T} * 1px) transparent;
		border-radius: calc(${at} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
	}
	:host(:${q}),
	:host(:focus),
	:host(:active) {
		background: ${ct};
		border: solid calc(${T} * 1px) ${V};
		color: ${wt};
		outline: none;
	}
	:host(:${q}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${wt} !important;
	}
`});var Tn,Yr,En,Qr,Rn,Xr,Zr=c(()=>{z();Dp();Fp();Lp();Tn=class extends ue{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}},Yr=Tn.compose({baseName:"data-grid",baseClass:ue,template:qc,styles:Rp}),En=class extends le{},Qr=En.compose({baseName:"data-grid-row",baseClass:le,template:Yc,styles:Ap}),Rn=class extends Ue{},Xr=Rn.compose({baseName:"data-grid-cell",baseClass:Ue,template:Xc,styles:Op})});var Mp,Pp=c(()=>{g();z();he();Mp=(o,e)=>D`
	${H("block")} :host {
		border: none;
		border-top: calc(${T} * 1px) solid ${fp};
		box-sizing: content-box;
		height: 0;
		margin: calc(${w} * 1px) 0;
		width: 100%;
	}
`});var Dn,Jr,Kr=c(()=>{z();Pp();Dn=class extends wo{},Jr=Dn.compose({baseName:"divider",template:Dd,styles:Mp})});var Bp,zp=c(()=>{g();z();he();Bp=(o,e)=>D`
	${H("inline-flex")} :host {
		background: ${li};
		border-radius: calc(${lt} * 1px);
		box-sizing: border-box;
		color: ${G};
		contain: contents;
		font-family: ${Z};
		height: calc(${Eo} * 1px);
		position: relative;
		user-select: none;
		min-width: ${Ro};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${T} * 1px) solid ${et};
		border-radius: calc(${lt} * 1px);
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
		background: ${li};
		border: calc(${T} * 1px) solid ${V};
		border-radius: calc(${lt} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${mp};
		padding: 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${q}) .control {
		border-color: ${V};
	}
	:host(:not([disabled]):hover) {
		background: ${li};
		border-color: ${et};
	}
	:host(:${q}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${ct};
		border: calc(${T} * 1px) solid transparent;
		color: ${wt};
	}
	:host([disabled]) {
		cursor: ${Ie};
		opacity: ${Oe};
	}
	:host([disabled]) .control {
		cursor: ${Ie};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${li};
		color: ${G};
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
		bottom: calc(${Eo} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${Eo} * 1px);
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
`});var An,ea,ta=c(()=>{z();zp();An=class extends Je{},ea=An.compose({baseName:"dropdown",template:Vu,styles:Bp,indicator:`
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
	`})});var Hp,Np=c(()=>{g();z();he();Hp=(o,e)=>D`
	${H("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${bp};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${Z};
		font-size: ${j};
		line-height: ${W};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${T} * 1px) solid transparent;
		border-radius: calc(${at} * 1px);
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
		color: ${Vr};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${Vr};
	}
	:host(:${q}) .control,
	:host(:focus) .control {
		border: calc(${T} * 1px) solid ${V};
	}
`});var Fn,oa,ia=c(()=>{z();Np();Fn=class extends xe{},oa=Fn.compose({baseName:"link",template:mc,styles:Hp,shadowOptions:{delegatesFocus:!0}})});var Vp,_p=c(()=>{g();z();he();Vp=(o,e)=>D`
	${H("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${at};
		border: calc(${T} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${G};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${j};
		line-height: ${W};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${w} / 2) * 1px)
			calc((${w} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${q}) {
		border-color: ${V};
		background: ${ct};
		color: ${G};
	}
	:host([aria-selected='true']) {
		background: ${ct};
		border: calc(${T} * 1px) solid transparent;
		color: ${wt};
	}
	:host(:active) {
		background: ${ct};
		color: ${wt};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${ct};
		border: calc(${T} * 1px) solid transparent;
		color: ${wt};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${ct};
		color: ${G};
	}
	:host([disabled]) {
		cursor: ${Ie};
		opacity: ${Oe};
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
`});var On,na,sa=c(()=>{z();_p();On=class extends je{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}},na=On.compose({baseName:"option",template:_d,styles:Vp})});var Up,jp=c(()=>{g();z();he();Up=(o,e)=>D`
	${H("grid")} :host {
		box-sizing: border-box;
		font-family: ${Z};
		font-size: ${j};
		line-height: ${W};
		color: ${G};
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
		background: ${Ut};
		margin: 0;
		border-radius: calc(${at} * 1px);
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
`});var qp,Gp=c(()=>{g();z();he();qp=(o,e)=>D`
	${H("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${Z};
		font-size: ${j};
		line-height: ${W};
		height: calc(${w} * 7px);
		padding: calc(${w} * 1px) 0;
		color: ${yp};
		fill: currentcolor;
		border-radius: calc(${at} * 1px);
		border: solid calc(${T} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Ut};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Ut};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Ut};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Ut};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Ut};
		fill: currentcolor;
	}
	:host(:${q}) {
		outline: none;
		border: solid calc(${T} * 1px) ${vp};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${w} * 2px);
	}
`});var Wp,Yp=c(()=>{g();z();he();Wp=(o,e)=>D`
	${H("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${T} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${j};
		line-height: ${W};
		padding: 10px calc((${w} + 2) * 1px);
	}
`});var Ln,ra,Mn,aa,Pn,la,ca=c(()=>{z();jp();Gp();Yp();Ln=class extends Ge{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=bn.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}},ra=Ln.compose({baseName:"panels",template:hh,styles:Up}),Mn=class extends si{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}},aa=Mn.compose({baseName:"panel-tab",template:lh,styles:qp}),Pn=class extends mn{},la=Pn.compose({baseName:"panel-view",template:nh,styles:Wp})});var Qp,Xp=c(()=>{g();z();he();Qp=(o,e)=>D`
	${H("flex")} :host {
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
		stroke: ${gp};
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
`});var Bn,da,ua=c(()=>{z();Xp();Bn=class extends vt{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,i){e==="value"&&this.removeAttribute("value")}},da=Bn.compose({baseName:"progress-ring",template:bu,styles:Qp,indeterminateIndicator:`
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
	`})});var Zp,Jp=c(()=>{g();z();he();Zp=(o,e)=>D`
	${H("flex")} :host {
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
		color: ${G};
		font-size: ${j};
		margin: calc(${w} * 1px) 0;
	}
`});var zn,ha,pa=c(()=>{L();z();Jp();zn=class extends Ze{connectedCallback(){super.connectedCallback();let e=this.querySelector("label");if(e){let t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}},ha=zn.compose({baseName:"radio-group",template:Cu,styles:Zp})});var Kp,ef=c(()=>{g();z();he();Kp=(o,e)=>D`
	${H("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${j};
		line-height: ${W};
		margin: calc(${w} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${Ke};
		border-radius: 999px;
		border: calc(${T} * 1px) solid ${_t};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${w} * 4px);
		position: relative;
		outline: none;
		width: calc(${w} * 4px);
	}
	.label {
		color: ${G};
		cursor: pointer;
		font-family: ${Z};
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
		background: ${G};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${w} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${Ke};
		border-color: ${_t};
	}
	:host(:not([disabled])) .control:active {
		background: ${Ke};
		border-color: ${V};
	}
	:host(:${q}) .control {
		border: calc(${T} * 1px) solid ${V};
	}
	:host([aria-checked='true']) .control {
		background: ${Ke};
		border: calc(${T} * 1px) solid ${_t};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${Ke};
		border: calc(${T} * 1px) solid ${_t};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${Ke};
		border: calc(${T} * 1px) solid ${V};
	}
	:host([aria-checked="true"]:${q}:not([disabled])) .control {
		border: calc(${T} * 1px) solid ${V};
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
		opacity: ${Oe};
	}
`});var Hn,fa,ma=c(()=>{z();ef();Hn=class extends ro{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}},fa=Hn.compose({baseName:"radio",template:Iu,styles:Kp,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`})});var tf,of=c(()=>{g();z();he();tf=(o,e)=>D`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${Z};
		font-size: ${yn};
		line-height: ${xn};
	}
	.control {
		background-color: ${wn};
		border: calc(${T} * 1px) solid ${Do};
		border-radius: ${xp};
		color: ${Cn};
		padding: calc(${w} * 0.5px) calc(${w} * 1px);
		text-transform: uppercase;
	}
`});var Nn,ba,ga=c(()=>{z();of();Nn=class extends mt{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}},ba=Nn.compose({baseName:"tag",template:Vi,styles:tf})});var nf,sf=c(()=>{g();z();he();nf=(o,e)=>D`
	${H("inline-block")} :host {
		font-family: ${Z};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${$n};
		background: ${Ct};
		border-radius: calc(${lt} * 1px);
		border: calc(${T} * 1px) solid ${et};
		font: inherit;
		font-size: ${j};
		line-height: ${W};
		padding: calc(${w} * 2px + 1px);
		width: 100%;
		min-width: ${Ro};
		resize: none;
	}
	.control:hover:enabled {
		background: ${Ct};
		border-color: ${et};
	}
	.control:active:enabled {
		background: ${Ct};
		border-color: ${V};
	}
	.control:hover,
	.control:${q},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${ep};
		height: ${tp};
	}
	.control::-webkit-scrollbar-corner {
		background: ${Ct};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${op};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${ip};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${np};
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
		color: ${G};
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
		cursor: ${Ie};
	}
	:host([disabled]) {
		opacity: ${Oe};
	}
	:host([disabled]) .control {
		border-color: ${et};
	}
`});var Vn,va,ya=c(()=>{z();sf();Vn=class extends me{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}},va=Vn.compose({baseName:"text-area",template:vh,styles:nf,shadowOptions:{delegatesFocus:!0}})});var rf,af=c(()=>{g();z();he();rf=(o,e)=>D`
	${H("inline-block")} :host {
		font-family: ${Z};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${$n};
		background: ${Ct};
		border-radius: calc(${lt} * 1px);
		border: calc(${T} * 1px) solid ${et};
		height: calc(${Eo} * 1px);
		min-width: ${Ro};
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
		font-size: ${j};
		line-height: ${W};
	}
	.control:hover,
	.control:${q},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${G};
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
		background: ${Ct};
		border-color: ${et};
	}
	:host(:active:not([disabled])) .root {
		background: ${Ct};
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
		opacity: ${Oe};
	}
	:host([disabled]) .control {
		border-color: ${et};
	}
`});var _n,xa,wa=c(()=>{z();af();_n=class extends we{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}},xa=_n.compose({baseName:"text-field",template:wh,styles:rf,shadowOptions:{delegatesFocus:!0}})});var tb,lf=c(()=>{Ur();qr();Wr();Zr();Kr();ta();ia();sa();ca();ua();pa();ma();ga();ya();wa();tb={vsCodeBadge:_r,vsCodeButton:jr,vsCodeCheckbox:Gr,vsCodeDataGrid:Yr,vsCodeDataGridCell:Xr,vsCodeDataGridRow:Qr,vsCodeDivider:Jr,vsCodeDropdown:ea,vsCodeLink:oa,vsCodeOption:na,vsCodePanels:ra,vsCodePanelTab:aa,vsCodePanelView:la,vsCodeProgressRing:da,vsCodeRadioGroup:ha,vsCodeRadio:fa,vsCodeTag:ba,vsCodeTextArea:va,vsCodeTextField:xa,register(o,...e){if(o)for(let t in this)t!=="register"&&this[t]().register(o,...e)}}});var cf={};Ff(cf,{Badge:()=>Sn,Button:()=>ci,Checkbox:()=>In,DataGrid:()=>Tn,DataGridCell:()=>Rn,DataGridCellTypes:()=>Qe,DataGridRow:()=>En,DataGridRowTypes:()=>bt,Divider:()=>Dn,DividerRole:()=>Ki,Dropdown:()=>An,DropdownPosition:()=>nt,GenerateHeaderOptions:()=>to,Link:()=>Fn,Option:()=>On,PanelTab:()=>Mn,PanelView:()=>Pn,Panels:()=>Ln,ProgressRing:()=>Bn,Radio:()=>Hn,RadioGroup:()=>zn,RadioGroupOrientation:()=>U,Tag:()=>Nn,TextArea:()=>Vn,TextAreaResize:()=>Io,TextField:()=>_n,TextFieldType:()=>nn,allComponents:()=>tb,provideVSCodeDesignSystem:()=>Xm,vsCodeBadge:()=>_r,vsCodeButton:()=>jr,vsCodeCheckbox:()=>Gr,vsCodeDataGrid:()=>Yr,vsCodeDataGridCell:()=>Xr,vsCodeDataGridRow:()=>Qr,vsCodeDivider:()=>Jr,vsCodeDropdown:()=>ea,vsCodeLink:()=>oa,vsCodeOption:()=>na,vsCodePanelTab:()=>aa,vsCodePanelView:()=>la,vsCodePanels:()=>ra,vsCodeProgressRing:()=>da,vsCodeRadio:()=>fa,vsCodeRadioGroup:()=>ha,vsCodeTag:()=>ba,vsCodeTextArea:()=>va,vsCodeTextField:()=>xa});var df=c(()=>{Gh();lf();Ur();qr();Wr();Zr();Kr();ta();ia();sa();ca();ua();pa();ma();ga();ya();wa()});var Of={"btn-refresh":{id:"btn-refresh",label:"\u{1F504} Refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"\u{1F916} Details"},"btn-chart":{id:"btn-chart",label:"\u{1F4C8} Chart"},"btn-usage":{id:"btn-usage",label:"\u{1F4CA} Usage Analysis"},"btn-diagnostics":{id:"btn-diagnostics",label:"\u{1F50D} Diagnostics"},"btn-maturity":{id:"btn-maturity",label:"\u{1F3AF} Fluency Score"},"btn-dashboard":{id:"btn-dashboard",label:"\u{1F4CA} Team Dashboard"},"btn-level-viewer":{id:"btn-level-viewer",label:"\u{1F50D} Level Viewer"},"btn-environmental":{id:"btn-environmental",label:"\u{1F33F} Environmental Impact"}};function St(o){let e=Of[o];if(e.hidden)return"";let t=e.appearance?` appearance="${e.appearance}"`:"";return`<vscode-button id="${e.id}"${t}>${e.label}</vscode-button>`}function Ma(o){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let t=document.querySelector(".button-row");if(t)for(let i of e){let n=document.createElement("vscode-button");n.id=`ext-point-${i.id}`,n.textContent=i.label,n.addEventListener("click",()=>{o.postMessage({command:"extensionPointAction",buttonId:i.id})}),t.append(n)}}var Pa={$schema:"http://json-schema.org/draft-07/schema#",description:"Character-to-token ratio estimators for different AI models. Used to estimate token counts from text length.",estimators:{"gpt-4":.25,"gpt-4.1":.25,"gpt-4.1-mini":.25,"gpt-4o":.25,"gpt-4o-mini":.25,"gpt-4-turbo":.25,"gpt-3.5-turbo":.25,"gpt-5":.25,"gpt-5-codex":.25,"gpt-5-mini":.25,"gpt-5.1":.25,"gpt-5.1-codex":.25,"gpt-5.1-codex-max":.25,"gpt-5.1-codex-mini":.25,"gpt-5.2":.25,"gpt-5.2-codex":.25,"gpt-5.2-pro":.25,"gpt-5.3-codex":.25,"gpt-5.4":.25,"gpt-5.4-mini":.25,"gpt-4.1-nano":.25,"gemini-2.0-flash":.25,"gemini-2.0-flash-lite":.25,"gemini-2.5-flash":.25,"gemini-2.5-flash-lite":.25,"claude-sonnet-3.5":.24,"claude-sonnet-3.7":.24,"claude-sonnet-4":.24,"claude-sonnet-4.5":.24,"claude-sonnet-4.6":.24,"claude-haiku":.24,"claude-haiku-4.5":.24,"claude-opus-4.1":.24,"claude-opus-4.5":.24,"claude-opus-4.6":.24,"claude-opus-4.6-(fast-mode)-(preview)":.24,"claude-opus-4.6-fast":.24,"gemini-2.5-pro":.25,"gemini-3-flash":.25,"gemini-3-pro":.25,"gemini-3-pro-preview":.25,"gemini-3.1-pro":.25,"gemini-3.1-flash-lite":.25,"grok-code-fast-1":.25,"raptor-mini":.25,goldeneye:.25,"o1-preview":.25,"o1-mini":.25,"o3-mini":.25,"o4-mini":.25,"gpt-5.5":.25,"mistral-large-latest":.25,"mistral-large-2512":.25,"mistral-large-2411":.25,"magistral-medium-latest":.25,"mistral-medium-latest":.25,"mistral-medium-3-5":.25,"mistral-medium-2505":.25,"mistral-small-latest":.25,"mistral-small-2503":.25,"mistral-small-2603":.25,"codestral-latest":.25,"codestral-2501":.25,"open-mistral-nemo":.25,"ministral-3b-2410":.25,"ministral-8b-2410":.25,"magistral-small-latest":.25,"devstral-medium-2507":.25,"pixtral-large-2411":.25,"gemini-3.5-flash":.25,"claude-opus-4.8":.24,"qwen2.5":.25,"mai-code-1-flash[^mai-code-1-flash]":.25,"mai-code-1-flash":.25,"claude-fable-5":.24}};var Ba={"VS Code":"\u{1F499}","VS Code Insiders":"\u{1F49A}","VS Code Exploration":"\u{1F9EA}","VS Code Server":"\u2601\uFE0F","VS Code Server (Insiders)":"\u2601\uFE0F",VSCodium:"\u{1F537}",Cursor:"\u{1F5B1}\uFE0F","Copilot CLI":"\u{1F916}",OpenCode:"\u{1F7E2}","Visual Studio":"\u{1FA9F}","Claude Code":"\u{1F7E0}","Claude Desktop Cowork":"\u{1F7E0}","Mistral Vibe":"\u{1F525}","Gemini CLI":"\u{1F48E}",Antigravity:"\u{1F680}",JetBrains:"\u{1F9E9}",Crush:"\u{1F9BE}",Windsurf:"\u{1F3C4}",Continue:"\u25B6\uFE0F",Pi:"\u03C0",Unknown:"\u2753"};function za(o){return Ba[o]??"\u{1F4DD}"}var Ig=Pa.estimators;function co(o){return za(o)}function $(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Yn(o){let e=Number(o);return!Number.isFinite(e)||e<0?"N/A":e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/(1024*1024)).toFixed(2)} MB`}function mi(o){try{let e=Date.now(),t=new Date(o).getTime(),i=e-t;if(i<0)return"Just now";let n=Math.floor(i/1e3),s=Math.floor(n/60),a=Math.floor(s/60),l=Math.floor(a/24);return l>0?`${l} day${l!==1?"s":""} ago`:a>0?`${a} hour${a!==1?"s":""} ago`:s>0?`${s} minute${s!==1?"s":""} ago`:`${n} second${n!==1?"s":""} ago`}catch{return"Unknown"}}function Ha(o,e){return{restore(){let t=o.getState();return{...e,...t??{}}},save(t){o.setState(t)},patch(t){let i=o.getState()??{...e},n={...e,...i,...t};return o.setState(n),n}}}var Na=`/**
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
`;var Va=`* {
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


.button-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
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

.tab {
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

.tab:hover {
	color: var(--text-primary);
	background: var(--list-hover-bg);
}

.tab.active {
	color: var(--link-color);
	border-bottom-color: var(--link-color);
}

.tab-content {
	display: none;
}

.tab-content.active {
	display: block;
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

.context-ref-filter {
	cursor: pointer;
	padding: 2px 6px;
	border-radius: 3px;
	margin: 2px 0;
	transition: all 0.2s;
}

.context-ref-filter:hover {
	background: rgb(79, 195, 247, 0.2);
	color: var(--link-color);
}

.context-ref-filter.active {
	background: rgb(79, 195, 247, 0.3);
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
	color: var(--fg-muted, #ccc);
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
	color: #9bb0d8;
}

.tool-type-badge.alternative {
	background: rgba(100, 200, 120, 0.2);
	color: #7ecf8e;
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
	color: #7ecf8e;
}

.ratio-worse {
	color: #e06c75;
}

.ratio-neutral {
	color: var(--fg-muted, #ccc);
}

.inline-link {
	background: none;
	border: none;
	padding: 0;
	color: var(--link-color, #4fc1ff);
	cursor: pointer;
	font-size: inherit;
	text-decoration: underline;
	text-underline-offset: 2px;
}

.inline-link:hover {
	opacity: 0.8;
}


.session-table tr:hover {
	background: rgb(255, 255, 255, 0.03);
}

.editor-badge {
	background: var(--list-active-bg);
	padding: 2px 6px;
	border-radius: 3px;
	font-size: 10px;
	color: var(--list-active-fg);
	white-space: nowrap;
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
	color: #b89dff;
	border: 1px solid rgba(100, 60, 180, 0.4);
	cursor: pointer;
}

.hierarchy-parent:hover {
	background: rgba(100, 60, 180, 0.35);
	color: #d0b8ff;
}

.hierarchy-children {
	background: rgba(30, 120, 80, 0.2);
	color: #7adbb0;
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
	color: rgba(30, 120, 80, 0.7);
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


`;function _a(o){return window[o]}function bi(o){return o.file+o.selection+o.implicitSelection+o.symbol+o.codebase+o.workspace+o.terminal+o.vscode+o.copilotInstructions+o.agentsMd+(o.terminalLastCommand||0)+(o.terminalSelection||0)+(o.clipboard||0)+(o.changes||0)+(o.outputPanel||0)+(o.problemsPanel||0)+(o.pullRequest||0)}var Bf=[{key:"file",full:"#file",abbr:"#file"},{key:"selection",full:"#selection",abbr:"#sel"},{key:"implicitSelection",full:"implicit",abbr:"impl"},{key:"symbol",full:"#symbol",abbr:"#sym"},{key:"codebase",full:"#codebase",abbr:"#cb"},{key:"workspace",full:"@workspace",abbr:"@ws"},{key:"terminal",full:"@terminal",abbr:"@term"},{key:"vscode",full:"@vscode",abbr:"@vsc"},{key:"terminalLastCommand",full:"#terminalLastCommand",abbr:"#termLC"},{key:"terminalSelection",full:"#terminalSelection",abbr:"#termSel"},{key:"clipboard",full:"#clipboard",abbr:"#clip"},{key:"changes",full:"#changes",abbr:"#chg"},{key:"outputPanel",full:"#outputPanel",abbr:"#out"},{key:"problemsPanel",full:"#problemsPanel",abbr:"#prob"},{key:"pullRequest",full:"#pr",abbr:"#pr"},{key:"copilotInstructions",full:"\u{1F4CB} instructions",abbr:"\u{1F4CB} inst"},{key:"agentsMd",full:"\u{1F916} agents",abbr:"\u{1F916} ag"}];function Ua(o,e=!1){let t=[];for(let i of Bf){let n=o[i.key]||0;if(n>0){let s=e?i.abbr:i.full;t.push(`${s}: ${n}`)}}return t.length>0?t.join(", "):"None"}var ob="Loading...",ib=/Session File Locations \(first 20\):[\s\S]*?(?=\n\s*\n|={70})/,nb=`\u23F3 Loading diagnostic data...

This may take a few moments depending on the number of session files.
The view will automatically update when data is ready.`,M=acquireVsCodeApi(),uf=_a("__INITIAL_DIAGNOSTICS__"),Bo=Ha(M,{activeTab:void 0,activeSubtab:void 0}),Fo="lastInteraction",Oo="desc",zo=null,Lo=null,ui=!0,jn="avg",Mo="desc",Ca,qn=[],Gn=!0,hi,Po;function gf(o){return o.replace(ib,"")}function pi(o){if(!o)return"N/A";try{return $(new Date(o).toLocaleString())}catch{return $(o)}}function hf(o){if(o==null)return"0";let e=Number(o);return Number.isFinite(e)?Math.floor(e).toString():"0"}function Ho(o){let e=Number(o??0);return!Number.isFinite(e)||e===0?"0":e>=1e9?`${(e/1e9).toFixed(1)}B`:e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:Math.floor(e).toString()}function sb(o,e){let t=document.createElement("tr");o.exists||(t.style.opacity="0.5");let i=document.createElement("td");i.textContent=o.exists?"\u2705":"\u274C",i.style.textAlign="center";let n=document.createElement("td"),s=document.createElement("span");s.className=Wn(o.source),s.textContent=`${co(o.source)} ${o.source}`,n.appendChild(s);let a=document.createElement("td");a.setAttribute("title",o.path),a.style.fontFamily="var(--vscode-editor-font-family, monospace)",a.style.fontSize="12px",a.textContent=o.path,t.append(i,n,a),e.appendChild(t)}function rb(o,e){let t=o.some(u=>u.exists),i=document.createElement("tr");t||(i.style.opacity="0.5");let n=document.createElement("td");n.textContent=t?"\u2705":"\u274C",n.style.textAlign="center";let s=document.createElement("td"),a=document.createElement("span");a.className=Wn("Crush"),a.textContent=`${co("Crush")} Crush`,s.appendChild(a);let l=document.createElement("td");l.style.fontFamily="var(--vscode-editor-font-family, monospace)",l.style.fontSize="12px",l.style.lineHeight="1.6";for(let u of o){let h=document.createElement("div");h.style.opacity=u.exists?"1":"0.5",h.title=u.path,h.textContent=`${u.exists?"\u2705":"\u274C"} ${u.path}`,l.appendChild(h)}i.append(n,s,l),e.appendChild(i)}function ab(o){let e=document.createElement("div");e.className="candidate-paths-table";let t=document.createElement("h4");t.textContent="Scanned Paths (all candidate locations):",e.appendChild(t);let i=document.createElement("p");i.style.cssText="color: #999; font-size: 12px; margin: 4px 0 8px 0;",i.textContent="These are all the paths the extension checks for session files. Paths marked with \u2705 exist on this system.",e.appendChild(i);let n=document.createElement("table");n.className="session-table",e.appendChild(n);let s=document.createElement("thead"),a=document.createElement("tr");for(let m of["Status","Source","Path"]){let b=document.createElement("th");b.textContent=m,a.appendChild(b)}s.appendChild(a),n.appendChild(s);let l=document.createElement("tbody");n.appendChild(l);let u=[...o].sort((m,b)=>m.exists!==b.exists?m.exists?-1:1:m.source.localeCompare(b.source)),h=u.filter(m=>m.source.toLowerCase().includes("crush")),f=u.filter(m=>!m.source.toLowerCase().includes("crush"));for(let m of f)sb(m,l);return h.length>0&&rb(h,l),e}function lb(o){let e=o.split(/[/\\]/);return e[e.length-1]}function cb(o){if(!o)return"";let e=o.replace(/\.git$/,"");if(e.includes("@")&&e.includes(":")){let i=e.lastIndexOf(":"),n=e.lastIndexOf("@");if(i>n)return e.substring(i+1)}try{if(e.includes("://")){let i=new URL(e),n=i.pathname.split("/").filter(s=>s);return n.length>=2?`${n[n.length-2]}/${n[n.length-1]}`:i.pathname.replace(/^\//,"")}}catch{}let t=e.split("/").filter(i=>i);return t.length>=2?`${t[t.length-2]}/${t[t.length-1]}`:e}function Wn(o){let e=o.toLowerCase();return e.includes("visual studio")?"editor-badge editor-badge-vs":e.includes("jetbrains")?"editor-badge editor-badge-jetbrains":e.includes("mistral")?"editor-badge editor-badge-mistral-vibe":e.includes("antigravity")?"editor-badge editor-badge-antigravity":e.includes("gemini")?"editor-badge editor-badge-gemini-cli":e.includes("crush")?"editor-badge editor-badge-crush":e.includes("cursor")?"editor-badge editor-badge-cursor":e==="pi"?"editor-badge editor-badge-pi":"editor-badge"}function pf(o,e){switch(e){case"size":return o.size||0;case"tokens":return o.tokens||0;case"interactions":return o.interactions||0;case"contextRefs":return bi(o.contextReferences);default:return 0}}function db(o,e){if(Fo==="lastInteraction"){let n=o.lastInteraction,s=e.lastInteraction;if(!n&&!s)return 0;if(!n)return 1;if(!s)return-1;let a=new Date(n).getTime(),l=new Date(s).getTime();return Oo==="desc"?l-a:a-l}let t=pf(o,Fo),i=pf(e,Fo);return t===0&&i===0?0:Oo==="desc"?i-t:t-i}function ub(o){let e=[...o].sort(db),t=new Map;for(let s of e)t.set(s.file,s);let i=new Set,n=[];for(let s of e)if(!i.has(s.file)&&(n.push(s),i.add(s.file),s.childInfo&&s.childInfo.length>0))for(let a of s.childInfo){if(!a.sessionFile)continue;let l=t.get(a.sessionFile);l&&!i.has(l.file)&&(n.push(l),i.add(l.file))}return n}function di(o){return Fo!==o?"":Oo==="desc"?" \u25BC":" \u25B2"}function hb(o){let e={};for(let t of o){let i=t.editorSource||"Unknown";e[i]||(e[i]={count:0,interactions:0}),e[i].count++,e[i].interactions+=t.interactions}return e}function pb(o){return o==null?"":$(String(o))}function fb(o){let e=zo?o.filter(i=>i.editorSource===zo):o;Lo&&(e=e.filter(i=>{let n=i.contextReferences[Lo];return typeof n=="number"&&n>0}));let t=e.filter(i=>i.interactions===0).length;return ui&&t===e.length&&e.length>0&&(ui=!1),ui&&(e=e.filter(i=>i.interactions>0)),{filteredFiles:e,zeroInteractionCount:t}}function mb(o){return o.reduce((e,t)=>{let i=t.contextReferences;return e.file+=i.file,e.symbol+=i.symbol,e.selection+=i.selection,e.implicitSelection+=i.implicitSelection,e.codebase+=i.codebase,e.workspace+=i.workspace,e.terminal+=i.terminal,e.vscode+=i.vscode,e.copilotInstructions+=i.copilotInstructions,e.agentsMd+=i.agentsMd,e},{file:0,symbol:0,selection:0,implicitSelection:0,codebase:0,workspace:0,terminal:0,vscode:0,copilotInstructions:0,agentsMd:0})}function bb(o,e,t){return`<div class="editor-filter-panels">
    <div class="editor-panel ${zo===null?"active":""}" data-editor=""><div class="editor-panel-icon">\u{1F310}</div><div class="editor-panel-name">All Editors</div><div class="editor-panel-stats">${o.length} sessions</div></div>
    ${t.map(i=>`<div class="editor-panel ${zo===i?"active":""}" data-editor="${$(i)}"><div class="editor-panel-icon">${co(i)}</div><div class="editor-panel-name">${$(i)}</div><div class="editor-panel-stats">${e[i].count} sessions \xB7 ${e[i].interactions} interactions</div></div>`).join("")}
  </div>`}function gb(o,e,t,i,n,s){let a=(l,u,h)=>n[l]>0?`<div class="context-ref-filter ${Lo===l?"active":""}" data-ref-type="${l}">${u} ${h} ${n[l]}</div>`:"";return`<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">\u{1F4C1} ${zo?"Filtered":"Total"} Sessions</div><div class="summary-value">${o.length}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4AC} Interactions</div><div class="summary-value">${e}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1FA99} Tokens</div><div class="summary-value" title="${t.toLocaleString()} tokens">${Ho(t)}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F517} Context References</div><div class="summary-value">${pb(i)}</div><div class="summary-sub">${i===0?"None":""}${a("file","","#file")}${a("symbol","","#sym")}${a("implicitSelection","","implicit")}${a("copilotInstructions","\u{1F4CB}","instructions")}${a("agentsMd","\u{1F916}","agents")}${a("workspace","","@workspace")}${a("vscode","","@vscode")}</div></div>
    <div class="summary-card"><div class="summary-label">\u{1F4C5} Time Range</div><div class="summary-value">Last 14 days</div></div>
  </div>
  <div class="filter-options"><label class="empty-sessions-toggle"><input type="checkbox" id="hide-empty-sessions" ${ui?"checked":""}>Hide sessions with 0 interactions${s>0?`<span class="hidden-count">(${s} hidden)</span>`:""}</label></div>`}function vb(o){let e="";if(o.parentInfo){let t=$(o.parentInfo.name.length>30?o.parentInfo.name.substring(0,30)+"\u2026":o.parentInfo.name),i=o.parentInfo.sessionFile?` href="#" class="session-hierarchy-badge hierarchy-parent session-file-link" data-file="${encodeURIComponent(o.parentInfo.sessionFile)}"`:' class="session-hierarchy-badge hierarchy-parent"';e+=`<a${i} title="Parent session: ${$(o.parentInfo.name)}">\u2191 Parent: ${t}</a>`}if(o.totalChildCount&&o.totalChildCount>0){let t=o.totalChildCount,i=t===1?"1 child session":`${t} child sessions`;e+=`<span class="session-hierarchy-badge hierarchy-children" title="${i}">\u2193 ${t} ${t===1?"Child":"Children"}</span>`}return e?`<div class="session-hierarchy-badges">${e}</div>`:""}function yb(o){let e=o.map((t,i)=>{let n=t.editorName||t.editorSource,s=!!t.parentInfo,a=t.title?`<a href="#" class="session-file-link" data-file="${encodeURIComponent(t.file)}" title="${$(t.title)}">${$(t.title.length>40?t.title.substring(0,40)+"...":t.title)}</a>`:`<a href="#" class="session-file-link empty-session-link" data-file="${encodeURIComponent(t.file)}" title="Empty session">(Empty session)</a>`,l=s?`<span class="child-title-indent">${a}</span>`:a,u=vb(t),h=t.repository?$(cb(t.repository)):t.file.includes("session-store.db")?'<span style="color: #888; font-style: italic;">No workspace</span>':'<span style="color: #666;">\u2014</span>',f=t.repository?$(t.repository):t.file.includes("session-store.db")?"Chat session \u2014 no workspace connected":"No repository detected",m=(t.editorName||t.editorSource||"Unknown")==="Unknown";return`<tr${s?' class="child-session-row"':""}><td>${i+1}</td><td><span class="${Wn(n)}" title="${$(t.editorSource)}">${co(n)} ${$(n)}</span></td><td class="session-title" title="${t.title?$(t.title):"Empty session"}">${u}${l}</td><td class="repository-cell" title="${f}">${h}</td><td>${Yn(t.size)}</td><td title="${Number(t.tokens||0).toLocaleString()} tokens">${Ho(t.tokens)}</td><td>${hf(t.interactions)}</td><td title="${$(Ua(t.contextReferences))}">${hf(bi(t.contextReferences))}</td><td>${pi(t.lastInteraction)}</td><td><a href="#" class="view-formatted-link" data-file="${encodeURIComponent(t.file)}" title="View formatted JSONL file">\u{1F4C4} View</a>${m?` <a href="#" class="report-editor-link" data-path="${encodeURIComponent(t.file)}" title="Report this unknown path so we can add editor support">\u{1F4E2} Report</a>`:""}</td></tr>`}).join("");return`<div class="table-container"><table class="session-table"><thead><tr><th>#</th><th>Editor</th><th>Title</th><th>Repository</th><th class="sortable" data-sort="size">Size${di("size")}</th><th class="sortable" data-sort="tokens">Tokens${di("tokens")}</th><th class="sortable" data-sort="interactions">Interactions${di("interactions")}</th><th class="sortable" data-sort="contextRefs">Context Refs${di("contextRefs")}</th><th class="sortable" data-sort="lastInteraction">Last Interaction${di("lastInteraction")}</th><th>Actions</th></tr></thead><tbody>${e}</tbody></table></div>`}function vf(o,e=!1){if(e)return'<div class="loading-state"><div class="loading-spinner">\u23F3</div><div class="loading-text">Loading session files...</div><div class="loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>';if(o.length===0)return'<p style="color: #999;">No session files with activity in the last 14 days.</p>';let t=hb(o),i=Object.keys(t).sort(),{filteredFiles:n,zeroInteractionCount:s}=fb(o),a=n.reduce((m,b)=>m+Number(b.interactions||0),0),l=n.reduce((m,b)=>m+Number(b.tokens||0),0),u=n.reduce((m,b)=>m+bi(b.contextReferences),0),h=mb(n),f=ub(n);return`${bb(o,t,i)}${gb(n,a,l,u,h,s)}${yb(f)}`}function ff(o,e,t){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${$(e)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="number" class="debug-counter-input" data-key="${$(o)}" value="${t}" min="0" step="1"
          style="width:70px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 2px 6px; font-family: var(--vscode-editor-font-family, monospace);" />
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-counter-set" data-key="${$(o)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}function xb(o,e,t){let i=t?`\u2705 ${$(t)}`:"\u274C (not set)";return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${$(e)}</td>
      <td style="padding: 6px 8px 6px 0;" colspan="2">
        <span style="font-family: var(--vscode-editor-font-family, monospace);">${i}</span>
      </td>
    </tr>`}function wb(o,e,t){return`
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${$(e)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="checkbox" class="debug-flag-input" data-key="${$(o)}" ${t?"checked":""} />
        <span style="margin-left:6px; font-family: var(--vscode-editor-font-family, monospace);">${t?"\u2705 true":"\u274C false"}</span>
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-flag-set" data-key="${$(o)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`}function Cb(o){let e=o??{openCount:0,unknownMcpOpenCount:0,fluencyBannerDismissed:!1,unknownMcpDismissedVersion:""};return`
    <div id="tab-debug" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">\u{1F41B} Debug \u2014 Global State Counters</div>
        <div>Visible only when a debugger is attached. Edit counters and dismissed flags stored in VS Code global state, then click Set to apply. Changes take effect immediately.</div>
      </div>
      <div class="cache-details">
        <h4>Notification Counters</h4>
        <table><tbody>
          ${ff("extension.openCount","extension.openCount (fluency banner threshold: 5)",e.openCount)}
          ${ff("extension.unknownMcpOpenCount","extension.unknownMcpOpenCount (unknown MCP threshold: 8)",e.unknownMcpOpenCount)}
        </tbody></table>
        <h4 style="margin-top:16px;">Dismissed Flags</h4>
        <table><tbody>
          ${wb("news.fluencyScoreBanner.v1.dismissed","news.fluencyScoreBanner.v1.dismissed",e.fluencyBannerDismissed)}
          ${xb("news.unknownMcpTools.dismissedVersion","news.unknownMcpTools.dismissedVersion",e.unknownMcpDismissedVersion)}
        </tbody></table>
        <div style="margin-top: 16px;">
          <button class="button secondary" id="btn-reset-debug-counters"><span>\u{1F504}</span><span>Reset All Counters &amp; Dismissed Flags</span></button>
        </div>
      </div>
    </div>`}function Sa(o){let e=o?.authenticated||!1,t=o?.username||"",i=e?"#2d6a4f":"#666";return`
<div class="info-box">
  <div class="info-box-title">\u{1F511} GitHub Authentication</div>
  <div>
    Authenticate with GitHub to unlock additional features in future releases.
  </div>
</div>

<div class="summary-cards">
  <div class="summary-card" style="border-left: 4px solid ${i};">
    <div class="summary-label">${e?"\u2705":"\u26AA"} Status</div>
    <div class="summary-value" style="font-size: 16px; color: ${i};">${e?"Authenticated":"Not Authenticated"}</div>
  </div>
  ${e?`
  <div class="summary-card">
    <div class="summary-label">\u{1F464} Logged in as</div>
    <div class="summary-value" style="font-size: 16px;">${$(t)}</div>
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
  `}function yf(o,e){return o?{color:"#2d6a4f",icon:"\u2705",text:"Configured & Enabled"}:e?{color:"#d97706",icon:"\u26A0\uFE0F",text:"Enabled but Not Configured"}:{color:"#666",icon:"\u26AA",text:"Disabled"}}function kb(o){return o.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Storage Account</td><td>${$(o.storageAccount)}</td></tr><tr><td style="font-weight: 600;">Subscription ID</td><td>${$(o.subscriptionId)}</td></tr><tr><td style="font-weight: 600;">Resource Group</td><td>${$(o.resourceGroup)}</td></tr><tr><td style="font-weight: 600;">Aggregation Table</td><td>${$(o.aggTable)}</td></tr><tr><td style="font-weight: 600;">Events Table</td><td>${$(o.eventsTable)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4BB} Unique Devices</div><div class="summary-value">${$(String(o.deviceCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Based on workspace IDs</div></div><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${$(String(o.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u2601\uFE0F Cloud Records</div><div class="summary-value">${o.recordCount!==null?$(String(o.recordCount)):"\u2014"}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Azure Storage records</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Sync Status</div><div class="summary-value" style="font-size: 14px;">${o.lastSyncTime?pi(o.lastSyncTime):"Never"}</div></div></div></div>`:'<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Azure Storage</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">To enable cloud synchronization, configure an Azure Storage account via the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Azure subscription with Storage Account access</li><li>Appropriate permissions (Storage Table Data Contributor or Storage Account Key)</li><li>VS Code signed in with your Azure account (for Entra ID auth)</li></ul></div>'}function $b(o){let{color:e,icon:t,text:i}=yf(o.isConfigured,o.enabled);return`<div class="info-box"><div class="info-box-title">\u2601\uFE0F Azure Storage Backend</div><div>Sync your token usage data to Azure Storage Tables for team-wide reporting and multi-device access.</div></div>
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${e};"><div class="summary-label">${t} Status</div><div class="summary-value" style="font-size: 16px; color: ${e};">${i}</div></div><div class="summary-card"><div class="summary-label">\u{1F510} Auth Mode</div><div class="summary-value" style="font-size: 16px;">${o.authMode==="entraId"?"Entra ID":"Shared Key"}</div></div><div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${$(o.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${o.lastSyncTime?mi(o.lastSyncTime):"Never"}</div></div></div>
    ${kb(o)}
    <div class="button-group"><button class="button" id="btn-configure-backend"><span>${o.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${o.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function Sb(o,e){let t=e?"#d97706":o?.authenticated?"#2d6a4f":"#666",i=e?"\u26A0\uFE0F":o?.authenticated?"\u2705":"\u26AA",n=e?"Not Authenticated":o?.authenticated?$(o.username||"Authenticated"):"Not Authenticated";return`<div class="summary-card" style="border-left: 4px solid ${t};"><div class="summary-label">${i} GitHub Auth</div><div class="summary-value" style="font-size: 14px; color: ${t};">${n}</div></div>`}function Ib(o){return o.isConfigured?`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4CA} Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Server URL</td><td>${$(o.endpointUrl)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F4C8} Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">\u{1F4C1} Total Sessions</div><div class="summary-value">${$(String(o.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">\u{1F504} Last Sync</div><div class="summary-value" style="font-size: 14px;">${o.lastSyncTime?pi(o.lastSyncTime):"Never"}</div></div></div></div>`:`<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">\u{1F680} Get Started with Team Server</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">Deploy the sharing server and configure its URL in the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Deploy the sharing server (see the <code>sharing-server/</code> folder in the repository)</li><li>Enter the server's base URL in the Backend configuration panel</li><li>Data syncs automatically every 5 minutes once configured</li></ul></div>`}function Tb(o,e){let{color:t,icon:i,text:n}=yf(o.isConfigured,o.enabled),s=o.isConfigured&&!e?.authenticated;return`<div class="info-box"><div class="info-box-title">\u{1F5A5}\uFE0F Team Server Backend</div><div>Sync your token usage data to a self-hosted team server for team-wide reporting.</div></div>
    ${s?'<button id="btn-team-server-auth-warning" style="width: 100%; margin-bottom: 16px; padding: 12px 16px; background: rgba(217, 119, 6, 0.15); border: 1px solid #d97706; border-radius: 6px; display: flex; gap: 10px; align-items: center; cursor: pointer; text-align: left;" title="Click to sign in to GitHub"><span style="font-size: 18px; flex-shrink: 0;">\u26A0\uFE0F</span><div style="flex: 1;"><div style="color: #fbbf24; font-weight: 600; font-size: 13px; margin-bottom: 4px;">GitHub Authentication Required</div><div style="color: #d4a017; font-size: 12px;">Team server sync will not run until you sign in to GitHub. <strong style="color: #fbbf24;">Click here to sign in.</strong></div></div><span style="color: #fbbf24; font-size: 18px; flex-shrink: 0;">\u2192</span></button>':""}
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${t};"><div class="summary-label">${i} Status</div><div class="summary-value" style="font-size: 16px; color: ${t};">${n}</div></div>${Sb(e,s)}<div class="summary-card"><div class="summary-label">\u{1F465} Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${$(o.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">\u{1F552} Last Sync</div><div class="summary-value" style="font-size: 14px;">${o.lastSyncTime?mi(o.lastSyncTime):"Never"}</div></div></div>
    ${Ib(o)}
    <div class="button-group"><button class="button" id="btn-configure-backend-team"><span>${o.isConfigured?"\u2699\uFE0F":"\u{1F527}"}</span><span>${o.isConfigured?"Manage Backend":"Configure Backend"}</span></button></div>`}function Ia(o,e){return o?`
    <div class="subtab-bar">
      <button class="subtab active" data-subtab="backend-azure">\u2601\uFE0F Azure Storage</button>
      <button class="subtab" data-subtab="backend-teamserver">\u{1F5A5}\uFE0F Team Server</button>
    </div>
    <div id="subtab-backend-azure" class="subtab-content active">
      ${$b(o.azure)}
    </div>
    <div id="subtab-backend-teamserver" class="subtab-content">
      ${Tb(o.teamServer,e)}
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
    `}function Eb(){return`
    <div class="info-box">
      <div class="info-box-title">\u{1F52C} Path Analyzer</div>
      <div>
        Analyze any folder to find session files and inspect their content.
        This helps troubleshoot why the extension isn't finding your AI tool's session files,
        or verify that files from another OS would be recognized.
      </div>
    </div>
    <div class="section">
      <div class="section-title">\u{1F4C1} Folder Selection</div>
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
          <option value="copilot-chat">\u{1F499} GitHub Copilot Chat (VS Code)</option>
          <option value="copilot-cli">\u{1F916} GitHub Copilot CLI</option>
          <option value="claude-code">\u{1F7E3} Claude Code (.jsonl only)</option>
          <option value="gemini-cli">\u{1F48E} Gemini CLI (.jsonl only)</option>
          <option value="antigravity">\u{1F680} Antigravity (.jsonl only)</option>
          <option value="continue">\u26A1 Continue</option>
          <option value="opencode">\u{1F7E2} OpenCode (JSON format only \u2014 DB not supported)</option>
          <option value="mistral-vibe">\u{1F525} Mistral Vibe</option>
          <option value="claude-desktop">\u{1F5A5}\uFE0F Claude Desktop</option>
        </select>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-analyze-folder">\u{1F50D} Analyze</button>
      </div>
    </div>
    <div id="folder-analysis-results"></div>
  `}function Rb(o,e,t){let i=o.interactions>0||o.tokens>0,n=o.file.startsWith(t)?o.file.slice(t.length).replace(/^[/\\]/,""):lb(o.file),s=Number(o.interactions),a=s>0?`<strong>${$(String(s))}</strong>`:'<span style="color: var(--text-muted);">0</span>',l=Number(o.tokens),u=l>0?`<strong title="${$(String(l.toLocaleString()))} tokens">${$(String(Ho(l)))}</strong>`:'<span style="color: var(--text-muted);">0</span>';return`
    <tr style="${i?"":"opacity: 0.45;"}">
      <td>${e+1}</td>
      <td title="${$(o.file)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${$(n)}</td>
      <td>${$(String(Yn(o.size)))}</td>
      <td>${a}</td>
      <td>${u}</td>
      <td>${pi(o.modified)}</td>
    </tr>`}function Db(o,e,t,i,n){let s=o.filter(b=>b.interactions>0||b.tokens>0),a=o.reduce((b,S)=>b+Number(S.interactions),0),l=o.reduce((b,S)=>b+Number(S.tokens),0),u=[...o].sort((b,S)=>{let E=b.interactions*1e3+b.tokens;return S.interactions*1e3+S.tokens-E}),h=i?`<div class="info-box" style="margin-bottom: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);">
        <div>\u26A0\uFE0F Scan limit reached (500 files). Results may be incomplete. Try a more specific subfolder.</div>
      </div>`:"",f=`
    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
      <div style="font-size: 36px; margin-bottom: 12px;">\u{1F4ED}</div>
      <div style="font-size: 14px;">No matching files found in this folder.</div>
      <div style="font-size: 12px; margin-top: 8px;">Try a different folder path or tool type.</div>
    </div>`,m=u.map((b,S)=>Rb(b,S,n)).join("");return`
    <div class="section" style="margin-top: 0;">
      <div class="section-title">\u{1F4CA} Analysis Results</div>
      ${h}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">\u{1F4C4} Files Scanned</div>
          <div class="summary-value">${$(String(e))}${i?"+":""}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u2705 With Sessions</div>
          <div class="summary-value">${s.length}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${o.length-s.length} empty / unknown</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1F4AC} Interactions</div>
          <div class="summary-value">${$(String(a))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">\u{1FA99} Tokens</div>
          <div class="summary-value" title="${$(String(l.toLocaleString()))} tokens">${$(String(Ho(l)))}</div>
        </div>
        ${t>0?`
        <div class="summary-card" style="border-left: 3px solid #d97706;">
          <div class="summary-label">\u26A0\uFE0F Unreadable</div>
          <div class="summary-value" style="color: #d97706;">${$(String(t))}</div>
        </div>`:""}
      </div>
      ${o.length===0?f:`
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
            <tbody>${m}</tbody>
          </table>
        </div>`}
    </div>`}function xf(o){let e=[],t=new Map;for(let i of o||[]){let n=String(i.dir||"").replace(/\\/g,"/"),s=n.match(/^(.*\/\.copilot\/jb)\/[^/]+\/?$/);if(s){let a=s[1],l=t.get(a);if(l)l.count+=i.count;else{let u=n.length-a.length,h=i.dir.slice(0,i.dir.length-u);t.set(a,{dir:h,count:i.count,editorName:i.editorName||"JetBrains"})}}else e.push(i)}for(let i of t.values())e.push(i);return e}function Ab(){let o=window;return o.process?.env?.HOME||o.process?.env?.USERPROFILE||""}function Fb(o,e){let t=o.dir;e&&t.startsWith(e)&&(t=t.replace(e,"~"));let i=o.editorName||"Unknown",n=document.createElement("tr"),s=document.createElement("td");s.setAttribute("title",o.dir),s.textContent=t,n.appendChild(s);let a=document.createElement("td"),l=document.createElement("span");l.className=Wn(i),l.textContent=`${co(i)} ${i}`,a.appendChild(l),n.appendChild(a);let u=document.createElement("td");u.textContent=String(o.count),n.appendChild(u);let h=document.createElement("td"),f=document.createElement("a");if(f.href="#",f.className="reveal-link",f.setAttribute("data-path",encodeURIComponent(o.dir)),f.textContent="Open directory",h.appendChild(f),i==="Unknown"){let m=document.createElement("a");m.href="#",m.className="report-editor-link",m.setAttribute("data-path",encodeURIComponent(o.dir)),m.setAttribute("title","Report this unknown path so we can add editor support"),m.textContent="\u{1F4E2} Report",h.appendChild(document.createTextNode(" ")),h.appendChild(m)}return n.appendChild(h),n}function wf(o){let e=[...o].sort((S,E)=>E.count-S.count),t=e.reduce((S,E)=>S+E.count,0),i=Ab(),n=document.createElement("div");n.className="session-folders-table";let s=document.createElement("h4");s.textContent="Main Session Folders (by editor root):",n.appendChild(s);let a=document.createElement("table");a.className="session-table",n.appendChild(a);let l=document.createElement("thead");a.appendChild(l);let u=document.createElement("tr");l.appendChild(u);for(let S of["Folder","Editor","# of Sessions","Open"]){let E=document.createElement("th");E.textContent=S,u.appendChild(E)}let h=document.createElement("tbody");a.appendChild(h);for(let S of e)h.appendChild(Fb(S,i));let f=document.createElement("tr");f.style.borderTop="2px solid #5a5a5a",f.style.fontWeight="600",f.style.background="rgba(255, 255, 255, 0.05)";let m=document.createElement("td");m.setAttribute("colspan","2"),m.style.textAlign="right",m.style.paddingRight="16px",m.textContent="Total:",f.appendChild(m);let b=document.createElement("td");return b.textContent=String(t),f.appendChild(b),f.appendChild(document.createElement("td")),h.appendChild(f),n}function Cf(){document.querySelectorAll(".open-storage-link").forEach(o=>{o.addEventListener("click",e=>{e.preventDefault();let t=decodeURIComponent(o.getAttribute("data-path")||"");t&&M.postMessage({command:"revealPath",path:t})})})}function Ta(){document.getElementById("btn-authenticate-github")?.addEventListener("click",()=>{M.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-sign-out-github")?.addEventListener("click",()=>{M.postMessage({command:"signOutGitHub"})})}function Ea(o){let e=document.querySelector(`.subtab[data-subtab="${o}"]`),t=document.getElementById(`subtab-${o}`);if(e&&t){let i=e.closest(".subtab-bar");return i&&i.querySelectorAll(".subtab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(n=>n.classList.remove("active")),e.classList.add("active"),t.classList.add("active"),!0}return!1}function ka(o){let e=document.querySelector(`.tab[data-tab="${o}"]`),t=document.getElementById(`tab-${o}`);return e&&t?(document.querySelectorAll(".tab").forEach(i=>i.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(i=>i.classList.remove("active")),e.classList.add("active"),t.classList.add("active"),!0):!1}function kf(){document.querySelectorAll(".sortable").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-sort");e&&(Fo===e?Oo=Oo==="desc"?"asc":"desc":(Fo=e,Oo="desc"),fi())})})}function $f(){document.querySelectorAll(".editor-panel").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-editor");zo=e===""?null:e,fi()})})}function Sf(){document.querySelectorAll(".context-ref-filter").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-ref-type");Lo===e?Lo=null:Lo=e,fi()})})}function If(){let o=document.getElementById("hide-empty-sessions");o&&o.addEventListener("change",()=>{ui=o.checked,fi()})}function Ra(){document.getElementById("btn-configure-backend")?.addEventListener("click",()=>{M.postMessage({command:"configureBackend"})}),document.getElementById("btn-configure-backend-team")?.addEventListener("click",()=>{Bo.patch({activeTab:"backend",activeSubtab:"backend-teamserver"}),M.postMessage({command:"configureTeamServer"})}),document.getElementById("btn-team-server-auth-warning")?.addEventListener("click",()=>{M.postMessage({command:"authenticateGitHub"})}),document.getElementById("btn-open-settings")?.addEventListener("click",()=>{M.postMessage({command:"openSettings"})}),document.getElementById("btn-open-display-settings")?.addEventListener("click",()=>{M.postMessage({command:"openDisplaySettings"})})}function Ob(){document.getElementById("select-show-tokens")?.addEventListener("change",o=>{let e=o.target.value;M.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showTokens",value:e})}),document.getElementById("select-show-cost")?.addEventListener("change",o=>{let e=o.target.value;M.postMessage({command:"updateDisplaySetting",key:"display.statusBar.showCost",value:e})}),document.getElementById("input-monthly-budget")?.addEventListener("change",o=>{let e=o.target,t=parseFloat(e.value),i=isNaN(t)?0:Math.min(99999,Math.max(0,Math.round(t*100)/100));e.value=i.toString(),M.postMessage({command:"updateDisplaySetting",key:"display.statusBar.monthlyBudget",value:i})})}function Da(){document.querySelectorAll(".subtab").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-subtab");if(!e)return;let t=o.closest(".subtab-bar");t&&t.querySelectorAll(".subtab").forEach(i=>i.classList.remove("active")),document.querySelectorAll(".subtab-content").forEach(i=>i.classList.remove("active")),o.classList.add("active"),document.getElementById(`subtab-${e}`)?.classList.add("active"),Bo.patch({activeSubtab:e})})})}function fi(){let o=document.getElementById("session-table-container");o&&(o.innerHTML=vf(qn,Gn),Gn||(kf(),$f(),Sf(),If(),Tf()))}function Lb(){document.querySelectorAll(".tool-analysis-table").forEach(o=>{let e=o.getAttribute("data-rows");if(!e)return;let t=JSON.parse(decodeURIComponent(e)),i=o.getAttribute("data-baseline"),n=i?parseFloat(i):NaN,s=o.querySelector("tbody");s&&(s.innerHTML=Fa(t,n));let a=o.querySelector("thead");a&&(a.innerHTML=Oa())}),Aa()}function Aa(){document.querySelectorAll(".tool-sortable").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-sort");e&&(jn===e?Mo=Mo==="desc"?"asc":"desc":(jn=e,Mo=e==="tool"?"asc":"desc"),Lb())})}),document.getElementById("btn-open-tool-families-settings")?.addEventListener("click",()=>{M.postMessage({command:"openToolFamiliesSettings"})})}function Tf(){document.querySelectorAll(".session-file-link").forEach(o=>{o.addEventListener("click",e=>{e.preventDefault();let t=decodeURIComponent(o.getAttribute("data-file")||"");M.postMessage({command:"openSessionFile",file:t})})}),document.querySelectorAll(".view-formatted-link").forEach(o=>{o.addEventListener("click",e=>{e.preventDefault();let t=decodeURIComponent(o.getAttribute("data-file")||"");M.postMessage({command:"openFormattedJsonlFile",file:t})})}),document.querySelectorAll(".reveal-link").forEach(o=>{o.addEventListener("click",e=>{e.preventDefault();let t=decodeURIComponent(o.getAttribute("data-path")||"");M.postMessage({command:"revealPath",path:t})})}),document.querySelectorAll(".report-editor-link").forEach(o=>{o.addEventListener("click",e=>{e.preventDefault();let t=decodeURIComponent(o.getAttribute("data-path")||"");M.postMessage({command:"reportNewEditorPath",path:t})})})}function $a(){let o=document.getElementById("tab-cache");if(o){let e=o.querySelectorAll(".summary-card");if(e.length>=4){let t=e[0]?.querySelector(".summary-value");t&&(t.textContent="0");let i=e[1]?.querySelector(".summary-value");i&&(i.textContent="0 MB");let n=e[2]?.querySelector(".summary-value");n&&(n.textContent="Never");let s=e[3]?.querySelector(".summary-value");s&&(s.textContent="N/A")}}}function Mb(){document.getElementById("btn-browse-folder")?.addEventListener("click",()=>{M.postMessage({command:"pickFolder"})}),document.getElementById("btn-analyze-folder")?.addEventListener("click",()=>{let o=document.getElementById("folder-path-input"),e=document.getElementById("tool-type-select"),t=o?.value.trim()??"";if(!t){o&&(o.style.borderColor="#d97706",o.focus());return}o&&(o.style.borderColor="");let i=document.getElementById("btn-analyze-folder");i&&(i.disabled=!0,i.innerHTML="<span>\u23F3</span><span>Analyzing\u2026</span>");let n=document.getElementById("folder-analysis-results");n&&(n.innerHTML=`
          <div class="analyzer-loading">
            <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
            <span>Scanning files\u2026</span>
          </div>`),M.postMessage({command:"analyzeFolder",folderPath:t,toolType:e?.value??"auto"})})}function Pb(){document.querySelectorAll(".tab").forEach(o=>{o.addEventListener("click",()=>{let e=o.getAttribute("data-tab");e&&ka(e)&&Bo.patch({activeTab:e})})})}function Bb(o){o.style.background="#d97706",o.innerHTML="<span>\u23F3</span><span>Clearing...</span>",o instanceof HTMLButtonElement&&(o.disabled=!0),$a(),M.postMessage({command:"clearCache"})}function zb(o){let e=o.getAttribute("data-key"),i=o.closest("tr")?.querySelector(".debug-counter-input");if(e&&i){let n=parseInt(i.value,10);isNaN(n)||M.postMessage({command:"setDebugCounter",key:e,value:n})}}function Hb(o){let e=o.getAttribute("data-key"),i=o.closest("tr")?.querySelector(".debug-flag-input");e&&i&&M.postMessage({command:"setDebugFlag",key:e,value:i.checked})}function Nb(o){let e=o.target;e&&((e.id==="btn-clear-cache"||e.id==="btn-clear-cache-tab")&&Bb(e),e.id==="btn-reset-debug-counters"&&M.postMessage({command:"resetDebugCounters"}),e.classList.contains("debug-counter-set")&&zb(e),e.classList.contains("debug-flag-set")&&Hb(e))}function Vb(){document.getElementById("btn-refresh")?.addEventListener("click",()=>M.postMessage({command:"refresh"})),document.getElementById("btn-chart")?.addEventListener("click",()=>M.postMessage({command:"showChart"})),document.getElementById("btn-usage")?.addEventListener("click",()=>M.postMessage({command:"showUsageAnalysis"})),document.getElementById("btn-details")?.addEventListener("click",()=>M.postMessage({command:"showDetails"})),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>M.postMessage({command:"showDiagnostics"})),document.getElementById("btn-maturity")?.addEventListener("click",()=>M.postMessage({command:"showMaturity"})),document.getElementById("btn-dashboard")?.addEventListener("click",()=>M.postMessage({command:"showDashboard"})),document.getElementById("btn-environmental")?.addEventListener("click",()=>M.postMessage({command:"showEnvironmental"})),Ma(M)}function _b(){document.getElementById("btn-copy")?.addEventListener("click",()=>{M.postMessage({command:"copyReport"})}),document.getElementById("btn-issue")?.addEventListener("click",()=>{M.postMessage({command:"openIssue"})}),document.getElementById("btn-clear-cache")?.addEventListener("click",()=>{let o=document.getElementById("btn-clear-cache");o&&(o.style.background="#d97706",o.innerHTML="<span>\u23F3</span><span>Clearing...</span>",o.disabled=!0),$a(),M.postMessage({command:"clearCache"})}),document.getElementById("btn-clear-cache-tab")?.addEventListener("click",()=>{let o=document.getElementById("btn-clear-cache-tab");o&&(o.style.background="#d97706",o.innerHTML="<span>\u23F3</span><span>Clearing...</span>",o.disabled=!0),$a(),M.postMessage({command:"clearCache"})}),document.addEventListener("click",Nb),Vb()}function Ub(o){if(!o.report)return;let e=document.getElementById("tab-report");if(!e)return;let t=gf(o.report),i=e.querySelector(".report-content");i&&(i.textContent=t)}function jb(o){if(!o.backendStorageInfo){console.warn("diagnosticDataLoaded received but backendStorageInfo is missing or undefined");return}hi=o.backendStorageInfo,o.githubAuth!==void 0&&(Po=o.githubAuth);let e=document.getElementById("tab-backend");if(!e)return;let i=e.querySelector(".subtab.active")?.getAttribute("data-subtab")??Bo.restore().activeSubtab;e.innerHTML=Ia(hi,Po),Ra(),Da(),i&&(Ea(i),Bo.patch({activeSubtab:i}))}function qb(o){if(!o.sessionFolders||o.sessionFolders.length===0)return;let e=document.getElementById("tab-report");if(!e)return;let t=xf(o.sessionFolders),i=wf(t),n=e.querySelector(".session-folders-table");if(n)n.replaceWith(i);else{let s=e.querySelector(".report-content");s?s.insertAdjacentElement("afterend",i):e.appendChild(i)}Cf()}function Gb(o){if(!o.candidatePaths||o.candidatePaths.length===0)return;let e=document.getElementById("tab-report");if(!e)return;e.querySelector(".candidate-paths-table")?.remove();let t=ab(o.candidatePaths),i=e.querySelector(".session-folders-table");if(i)i.insertAdjacentElement("afterend",t);else{let n=e.querySelector(".report-content");n?n.insertAdjacentElement("afterend",t):e.appendChild(t)}}function Wb(o){if(Ub(o),jb(o),qb(o),Gb(o),o.githubAuth!==void 0){let e=document.getElementById("tab-github");e&&(e.innerHTML=Sa(o.githubAuth),Ta())}if(o.toolFamilies&&(Ca=o.toolFamilies),o.toolCallStats!==void 0){let e=document.getElementById("tab-tool-analysis");if(e){let t=e.classList.contains("active"),i=Ef(o.toolCallStats,Ca),n=document.createElement("div");n.innerHTML=i;let s=n.firstElementChild;s&&(t&&s.classList.add("active"),e.replaceWith(s),Aa())}}}function Yb(o){Po=o.githubAuth;let e=document.getElementById("tab-github");e&&(e.innerHTML=Sa(Po),Ta());let t=document.getElementById("tab-backend");if(t&&hi){let n=t.querySelector(".subtab.active")?.getAttribute("data-subtab");t.innerHTML=Ia(hi,Po),Ra(),Da(),n&&Ea(n)}}function Qb(o){console.error("Error loading diagnostic data:",o.error);let e=document.getElementById("root");if(e){let t=document.createElement("div");t.style.cssText="color: #ff6b6b; padding: 20px; text-align: center;",t.innerHTML=`
<h3>\u26A0\uFE0F Error Loading Diagnostic Data</h3>
<p>${$(o.error||"Unknown error")}</p>
`,e.insertBefore(t,e.firstChild)}}function mf(o){return!o||typeof o!="object"?{}:Object.fromEntries(Object.entries(o).map(([e,t])=>[e,Number(t??0)||0]))}function ce(o){return Number(o??0)||0}function Ao(o){return o==null?void 0:String(o)}function bf(o){return o==null?null:String(o)}function Xb(o){return{file:ce(o.file),symbol:ce(o.symbol),selection:ce(o.selection),implicitSelection:ce(o.implicitSelection),codebase:ce(o.codebase),workspace:ce(o.workspace),terminal:ce(o.terminal),vscode:ce(o.vscode),terminalLastCommand:ce(o.terminalLastCommand),terminalSelection:ce(o.terminalSelection),clipboard:ce(o.clipboard),changes:ce(o.changes),outputPanel:ce(o.outputPanel),problemsPanel:ce(o.problemsPanel),pullRequest:ce(o.pullRequest),byKind:mf(o.byKind),copilotInstructions:ce(o.copilotInstructions),agentsMd:ce(o.agentsMd),byPath:mf(o.byPath)}}function Zb(o){if(Array.isArray(o.childInfo))return o.childInfo.filter(e=>!!e&&typeof e=="object").map(e=>({uuid:String(e.uuid??""),name:String(e.name??""),sessionFile:Ao(e.sessionFile)}))}function Jb(o){if(!o.parentInfo||typeof o.parentInfo!="object")return;let e=o.parentInfo;return{uuid:String(e.uuid??""),name:String(e.name??""),sessionFile:Ao(e.sessionFile)}}function Kb(o){let e=o??{},t=e.contextReferences??{};return{file:String(e.file??e.sessionFile??""),editorSource:String(e.editorSource??""),editorRoot:Ao(e.editorRoot),editorName:Ao(e.editorName),title:Ao(e.title),repository:Ao(e.repository),size:ce(e.size),modified:String(e.modified??""),tokens:ce(e.tokens),interactions:ce(e.interactions),firstInteraction:bf(e.firstInteraction),lastInteraction:bf(e.lastInteraction),contextReferences:Xb(t),parentInfo:Jb(e),childInfo:Zb(e),totalChildCount:e.totalChildCount===null||e.totalChildCount===void 0?void 0:Number(e.totalChildCount)}}function eg(o){return Array.isArray(o)?o.map(Kb):[]}function tg(o){qn=eg(o.detailedSessionFiles),Gn=!1;let e=document.querySelector('.tab[data-tab="sessions"]');e&&(e.textContent=`\u{1F4C1} Session Files (${qn.length})`),fi()}function og(){let o=document.getElementById("btn-clear-cache"),e=document.getElementById("btn-clear-cache-tab");o&&(o.style.background="#2d6a4f",o.innerHTML="<span>\u2705</span><span>Cache Cleared</span>",o.disabled=!1),e&&(e.style.background="#2d6a4f",e.innerHTML="<span>\u2705</span><span>Cache Cleared</span>",e.disabled=!1),setTimeout(()=>{o&&(o.style.background="",o.innerHTML="<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>"),e&&(e.style.background="",e.innerHTML="<span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span>")},2e3)}function ig(o,e){if(e.length<4)return;let t=e[0]?.querySelector(".summary-value");t&&(t.textContent=String(o.size));let i=e[1]?.querySelector(".summary-value");i&&(i.textContent=`${o.sizeInMB.toFixed(2)} MB`);let n=e[2]?.querySelector(".summary-value");n&&(n.textContent=new Date(o.lastUpdated).toLocaleString());let s=e[3]?.querySelector(".summary-value");s&&(s.textContent="0 seconds ago")}function ng(o){if(!o.cacheInfo)return;let e=document.getElementById("tab-cache");e&&ig(o.cacheInfo,e.querySelectorAll(".summary-card"))}function sg(o){let e=document.getElementById("folder-path-input");e&&o.folderPath&&(e.value=o.folderPath,e.style.borderColor="")}function rg(o){let e=document.getElementById("btn-analyze-folder");e&&(e.disabled=!1,e.innerHTML="<span>\u{1F50D}</span><span>Analyze</span>");let t=document.getElementById("folder-analysis-results");t&&(o.error?t.innerHTML=`
        <div class="info-box" style="border-color: #d97706; background: rgba(217,119,6,0.08); margin-top: 12px;">
          <div class="info-box-title">\u26A0\uFE0F Analysis Error</div>
          <div>${$(o.error)}</div>
        </div>`:t.innerHTML=Db(o.files||[],o.totalScanned||0,o.parseErrors||0,o.truncated||!1,$(String(o.folderPath||""))))}function ag(){window.addEventListener("message",o=>{let e=o.data;e.command==="diagnosticDataLoaded"?Wb(e):e.command==="githubAuthUpdated"?Yb(e):e.command==="diagnosticDataError"?Qb(e):e.command==="sessionFilesLoaded"&&e.detailedSessionFiles?tg(e):e.command==="cacheCleared"?og():e.command==="cacheRefreshed"?ng(e):e.command==="folderPicked"?sg(e):e.command==="folderAnalysisResult"&&rg(e)})}function lg(o){return`
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
<div class="summary-value">${o.cacheInfo?.size||0}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F4BE} Cache Size</div>
<div class="summary-value">${o.cacheInfo?.sizeInMB?o.cacheInfo.sizeInMB.toFixed(2)+" MB":"N/A"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u{1F552} Last Updated</div>
<div class="summary-value" style="font-size: 14px;">${o.cacheInfo?.lastUpdated?pi(o.cacheInfo.lastUpdated):"Never"}</div>
</div>
<div class="summary-card">
<div class="summary-label">\u23F1\uFE0F Cache Age</div>
<div class="summary-value" style="font-size: 14px;">${o.cacheInfo?.lastUpdated?mi(o.cacheInfo.lastUpdated):"N/A"}</div>
</div>
</div>
<div class="cache-location">
<h4>Storage Location</h4>
<div class="location-box">
<code>${$(o.cacheInfo?.location||"VS Code Global State")}</code>
${o.cacheInfo?.storagePath?` <a href="#" class="open-storage-link" data-path="${encodeURIComponent(o.cacheInfo.storagePath)}">Open storage location</a>`:""}
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
<button class="button secondary" id="btn-clear-cache-tab"><span>\u{1F5D1}\uFE0F</span><span>Clear Cache</span></button>
</div>
</div>
</div>`}function We(o,e){return o===e?"selected":""}function cg(o){return`<div class="backend-card">
<h4>\u{1F4CA} API Quota Information</h4>
${o.quotaEntitlements?`<p>
${o.quotaEntitlements.premium_interactions?`<strong>Premium Interactions:</strong> $${o.quotaEntitlements.premium_interactions.toFixed(2)}/month<br/>`:""}${o.quotaEntitlements.completions?`<strong>Completions:</strong> $${o.quotaEntitlements.completions.toFixed(2)}/month<br/>`:""}
    </p>`:'<p class="hint">No quota information available from the API yet. Sign out and back in to refresh.</p>'}
</div>`}function dg(o){let e=o.displaySettings?.showTokens??"both",t=o.displaySettings?.showCost??"none",i=Math.round((o.displaySettings?.monthlyBudget??0)*100)/100;return`
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
    <option value="none" ${We(e,"none")}>None</option>
    <option value="today" ${We(e,"today")}>Today only</option>
    <option value="last30days" ${We(e,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${We(e,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${We(e,"both")}>Today + last 30 days (default)</option>
    <option value="todayAndCurrentMonth" ${We(e,"todayAndCurrentMonth")}>Today + current calendar month</option>
  </select>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">\u{1F4B0} Estimated cost (USD):</label>
  <select id="select-show-cost" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${We(t,"none")}>None (hidden)</option>
    <option value="today" ${We(t,"today")}>Today only</option>
    <option value="last30days" ${We(t,"last30days")}>Last 30 days only</option>
    <option value="currentMonth" ${We(t,"currentMonth")}>Current calendar month only</option>
    <option value="both" ${We(t,"both")}>Today + last 30 days</option>
    <option value="todayAndCurrentMonth" ${We(t,"todayAndCurrentMonth")}>Today + current calendar month</option>
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
  <input id="input-monthly-budget" type="number" min="0" max="99999" step="0.01" value="${i}" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 100px;" />
</div>
<p class="hint">Budget coloring uses the current calendar month's estimated cost. Set to 0 to disable.</p>
${o.quotaEntitlements&&o.quotaEntitlements.premium_interactions?`<p class="hint" style="color: #90ee90;"><strong>\u2139\uFE0F API-driven budget:</strong> Your premium_interactions quota entitlement is <strong>$${o.quotaEntitlements.premium_interactions.toFixed(2)}</strong>/month. If the budget above is 0 or empty, this API value will be used as your effective budget.</p>`:""}
</div>
${cg(o)}
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
</div>`}function Un(o){return jn!==o?' <span class="sort-hint">\u2195</span>':Mo==="desc"?" \u25BC":" \u25B2"}function ug(o){let e=o.reduce((i,n)=>i+n.calls,0),t=o.reduce((i,n)=>i+n.totalTokens,0);return e>0?t/e:NaN}function hg(o){return[...o].sort((e,t)=>{let i,n;switch(jn){case"tool":i=e.tool.toLowerCase(),n=t.tool.toLowerCase();break;case"calls":i=e.calls,n=t.calls;break;case"total":i=e.totalTokens,n=t.totalTokens;break;default:i=e.calls>0?e.totalTokens/e.calls:0,n=t.calls>0?t.totalTokens/t.calls:0;break}return i<n?Mo==="desc"?1:-1:i>n?Mo==="desc"?-1:1:0})}function pg(o,e){let t=o.calls>0?Math.round(o.totalTokens/o.calls):0,i='<td class="tool-ratio">\u2014</td>';if(!o.isBuiltIn&&!isNaN(e)&&e>0&&o.calls>0){let s=o.totalTokens/o.calls/e,a=Math.round(s*100);i=`<td class="tool-ratio ${s<.85?"ratio-better":s>1.15?"ratio-worse":"ratio-neutral"}" title="${a}% of built-in average">${a}%</td>`}else o.isBuiltIn&&(i='<td class="tool-ratio tool-builtin-label">baseline</td>');let n=o.isBuiltIn?' <span class="tool-type-badge built-in">built-in</span>':' <span class="tool-type-badge alternative">alt</span>';return`<tr><td>${$(o.tool)}${n}</td><td>${$(String(o.calls))}</td><td>${Ho(o.totalTokens)}</td><td>${Ho(t)}</td>${i}</tr>`}function Fa(o,e=NaN){return hg(o).map(t=>pg(t,e)).join("")}function Oa(){return`<tr>
<th class="tool-sortable" data-sort="tool">Tool${Un("tool")}</th>
<th class="tool-sortable" data-sort="calls">Calls${Un("calls")}</th>
<th class="tool-sortable" data-sort="total">Total Output Tokens${Un("total")}</th>
<th class="tool-sortable" data-sort="avg">Avg Tokens / Call${Un("avg")}</th>
<th>vs Built-in</th>
</tr>`}function fg(o,e,t,i){let n=(b,S)=>b.filter(E=>e[E]!==void 0&&(t[E]||0)>0&&!i.has(E)).map(E=>(i.add(E),{tool:E,totalTokens:e[E],calls:t[E]||0,isBuiltIn:S})),s=n(o.builtIn,!0),a=n(o.alternatives,!1),l=[...s,...a];if(l.length===0)return{html:"",rows:[]};let u=ug(s),h=encodeURIComponent(JSON.stringify(l)),f=o.description?` <span class="hint">${$(o.description)}</span>`:"";return{html:`
<div class="tool-family-section">
<h4 class="tool-family-heading">${$(o.name)}${f}</h4>
<table class="session-table tool-analysis-table" data-rows="${h}" data-baseline="${isNaN(u)?"":String(u)}">
<thead>${Oa()}</thead>
<tbody>${Fa(l,u)}</tbody>
</table>
</div>`,rows:l}}function Ef(o,e){if(!o||!o.outputTokensByTool||Object.keys(o.outputTokensByTool).length===0)return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Track how many tokens each tool produces as output over the last 30 days. Data is collected as you use the extension \u2014 no output token data has been recorded yet.</div>
</div>
</div>`;let t=o.outputTokensByTool,i=o.byTool,n=new Set,s="";if(e&&e.length>0)for(let l of e){let{html:u}=fg(l,t,i,n);s+=u}let a=Object.entries(t).filter(([l])=>!n.has(l)&&(i[l]||0)>0).map(([l,u])=>({tool:l,totalTokens:u,calls:i[l]||0,isBuiltIn:!1}));if(a.length>0){let l=encodeURIComponent(JSON.stringify(a));s+=`
<div class="tool-family-section">
<h4 class="tool-family-heading">Other Tools</h4>
<table class="session-table tool-analysis-table" data-rows="${l}" data-baseline="">
<thead>${Oa()}</thead>
<tbody>${Fa(a,NaN)}</tbody>
</table>
</div>`}return`<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F527} Tool Output Token Analysis</div>
<div>Tokens produced by each tool's output over the last 30 days. Tools are grouped by family. <strong>vs Built-in</strong> shows how an alternative compares to the pooled baseline \u2014 green is more token-efficient. Click column headers to sort within each group. <button class="inline-link" id="btn-open-tool-families-settings">Configure tool families \u2197</button></div>
</div>
${s}
</div>`}function mg(o){return`<div id="tab-report" class="tab-content active">
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
</div>
<div class="report-content">${o}</div>
</div>`}function bg(o,e,t){return`
<style>${Na}</style>
<style>${Va}</style>
<div class="container">
<div class="header">
<div class="header-left">
<span class="header-icon">\u{1F50D}</span>
<span class="header-title">Diagnostic Report</span>
</div>
<div class="button-row">
${St("btn-refresh")}
${St("btn-details")}
${St("btn-chart")}
${St("btn-usage")}
${St("btn-environmental")}
${St("btn-maturity")}
${o?.backendConfigured?St("btn-dashboard"):""}
</div>
</div>

<div class="tabs">
<button class="tab active" data-tab="report">\u{1F4CB} Report</button>
<button class="tab" data-tab="sessions">\u{1F4C1} Session Files (${e.length})</button>
<button class="tab" data-tab="cache">\u{1F4BE} Cache</button>
<button class="tab" data-tab="backend">\u2601\uFE0F Backend Storage</button>
<button class="tab" data-tab="github">\u{1F511} GitHub Auth</button>
<button class="tab" data-tab="display">\u2699\uFE0F Settings</button>
<button class="tab" data-tab="path-analyzer">\u{1F52C} Path Analyzer</button>
<button class="tab" data-tab="tool-analysis">\u{1F527} Tool Analysis</button>
${o.isDebugMode?'<button class="tab" data-tab="debug">\u{1F41B} Debug</button>':""}
</div>

${mg(t)}

<div id="tab-sessions" class="tab-content">
<div class="info-box">
<div class="info-box-title">\u{1F4C1} Session File Analysis</div>
<div>
This tab shows session files with activity in the last 14 days from all detected editors. </br>
Click on an editor panel to filter, click column headers to sort, and click a file name to open it.
</div>
</div>
<div id="session-table-container">${vf(e,e.length===0)}</div>
</div>

${lg(o)}
<div id="tab-backend" class="tab-content">
${Ia(o.backendStorageInfo,o.githubAuth)}
</div>

<div id="tab-github" class="tab-content">
${Sa(o.githubAuth)}
</div>
${dg(o)}
${o.isDebugMode?Cb(o.globalStateCounters):""}
<div id="tab-path-analyzer" class="tab-content">
${Eb()}
</div>
${Ef(o.toolCallStats,o.toolFamilies)}
</div>
`}function gg(o){let e=document.getElementById("root");if(!e)return;let t=o.detailedSessionFiles||[];qn=t,Gn=t.length===0,hi=o.backendStorageInfo,Po=o.githubAuth,o.toolFamilies&&(Ca=o.toolFamilies);let n=o.report===ob?nb.trim():gf($(o.report));e.innerHTML=bg(o,t,n);let s=xf(o.sessionFolders||[]);if(s.length>0){let u=document.getElementById("tab-report")?.querySelector(".report-content");u&&u.insertAdjacentElement("afterend",wf(s))}ag(),Pb(),kf(),$f(),Sf(),If(),Ra(),Da(),Tf(),Cf(),Ta(),Mb(),_b(),Ob(),Aa();let a=Bo.restore();a?.activeTab&&!ka(a.activeTab)&&ka("report"),a?.activeSubtab&&Ea(a.activeSubtab)}async function vg(){let{provideVSCodeDesignSystem:o,vsCodeButton:e}=await Promise.resolve().then(()=>(df(),cf));if(o().register(e()),!uf){let t=document.getElementById("root");t&&(t.textContent="No data available.");return}gg(uf)}vg();})();
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
