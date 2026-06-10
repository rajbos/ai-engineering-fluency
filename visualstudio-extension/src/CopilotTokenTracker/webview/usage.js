"use strict";(()=>{var Hm=Object.defineProperty;var c=(o,e)=>()=>(o&&(e=o(o=0)),e);var Bm=(o,e)=>{for(var t in e)Hm(o,t,{get:e[t],enumerable:!0})};function wi(){let o=new WeakMap;return function(e){let t=o.get(e);if(t===void 0){let i=Reflect.getPrototypeOf(e);for(;t===void 0&&i!==null;)t=o.get(i),i=Reflect.getPrototypeOf(i);t=t===void 0?[]:t.slice(0),o.set(e,t)}return t}}var Ze,el,io,Ge,bt=c(()=>{Ze=(function(){if(typeof globalThis<"u")return globalThis;if(typeof global<"u")return global;if(typeof self<"u")return self;if(typeof window<"u")return window;try{return new Function("return this")()}catch{return{}}})();Ze.trustedTypes===void 0&&(Ze.trustedTypes={createPolicy:(o,e)=>e});el={configurable:!1,enumerable:!1,writable:!1};Ze.FAST===void 0&&Reflect.defineProperty(Ze,"FAST",Object.assign({value:Object.create(null)},el));io=Ze.FAST;if(io.getById===void 0){let o=Object.create(null);Reflect.defineProperty(io,"getById",Object.assign({value(e,t){let i=o[e];return i===void 0&&(i=t?o[e]=t():null),i}},el))}Ge=Object.freeze([])});var or,tl,ir,jo,sr,ki,y,Ve=c(()=>{bt();or=Ze.FAST.getById(1,()=>{let o=[],e=[];function t(){if(e.length)throw e.shift()}function i(n){try{n.call()}catch(l){e.push(l),setTimeout(t,0)}}function s(){let l=0;for(;l<o.length;)if(i(o[l]),l++,l>1024){for(let p=0,h=o.length-l;p<h;p++)o[p]=o[p+l];o.length-=l,l=0}o.length=0}function r(n){o.length<1&&Ze.requestAnimationFrame(s),o.push(n)}return Object.freeze({enqueue:r,process:s})}),tl=Ze.trustedTypes.createPolicy("fast-html",{createHTML:o=>o}),ir=tl,jo=`fast-${Math.random().toString(36).substring(2,8)}`,sr=`${jo}{`,ki=`}${jo}`,y=Object.freeze({supportsAdoptedStyleSheets:Array.isArray(document.adoptedStyleSheets)&&"replace"in CSSStyleSheet.prototype,setHTMLPolicy(o){if(ir!==tl)throw new Error("The HTML policy can only be set once.");ir=o},createHTML(o){return ir.createHTML(o)},isMarker(o){return o&&o.nodeType===8&&o.data.startsWith(jo)},extractDirectiveIndexFromMarker(o){return parseInt(o.data.replace(`${jo}:`,""))},createInterpolationPlaceholder(o){return`${sr}${o}${ki}`},createCustomAttributePlaceholder(o,e){return`${o}="${this.createInterpolationPlaceholder(e)}"`},createBlockPlaceholder(o){return`<!--${jo}:${o}-->`},queueUpdate:or.enqueue,processUpdates:or.process,nextUpdate(){return new Promise(or.enqueue)},setAttribute(o,e,t){t==null?o.removeAttribute(e):o.setAttribute(e,t)},setBooleanAttribute(o,e,t){t?o.setAttribute(e,""):o.removeAttribute(e)},removeChildNodes(o){for(let e=o.firstChild;e!==null;e=o.firstChild)o.removeChild(e)},createTemplateWalker(o){return document.createTreeWalker(o,133,null,!1)}})});var Ft,ko,Wo=c(()=>{Ft=class{constructor(e,t){this.sub1=void 0,this.sub2=void 0,this.spillover=void 0,this.source=e,this.sub1=t}has(e){return this.spillover===void 0?this.sub1===e||this.sub2===e:this.spillover.indexOf(e)!==-1}subscribe(e){let t=this.spillover;if(t===void 0){if(this.has(e))return;if(this.sub1===void 0){this.sub1=e;return}if(this.sub2===void 0){this.sub2=e;return}this.spillover=[this.sub1,this.sub2,e],this.sub1=void 0,this.sub2=void 0}else t.indexOf(e)===-1&&t.push(e)}unsubscribe(e){let t=this.spillover;if(t===void 0)this.sub1===e?this.sub1=void 0:this.sub2===e&&(this.sub2=void 0);else{let i=t.indexOf(e);i!==-1&&t.splice(i,1)}}notify(e){let t=this.spillover,i=this.source;if(t===void 0){let s=this.sub1,r=this.sub2;s!==void 0&&s.handleChange(i,e),r!==void 0&&r.handleChange(i,e)}else for(let s=0,r=t.length;s<r;++s)t[s].handleChange(i,e)}},ko=class{constructor(e){this.subscribers={},this.sourceSubscribers=null,this.source=e}notify(e){var t;let i=this.subscribers[e];i!==void 0&&i.notify(e),(t=this.sourceSubscribers)===null||t===void 0||t.notify(e)}subscribe(e,t){var i;if(t){let s=this.subscribers[t];s===void 0&&(this.subscribers[t]=s=new Ft(this.source)),s.subscribe(e)}else this.sourceSubscribers=(i=this.sourceSubscribers)!==null&&i!==void 0?i:new Ft(this.source),this.sourceSubscribers.subscribe(e)}unsubscribe(e,t){var i;if(t){let s=this.subscribers[t];s!==void 0&&s.unsubscribe(e)}else(i=this.sourceSubscribers)===null||i===void 0||i.unsubscribe(e)}}});function m(o,e){w.defineProperty(o,e)}function il(o,e,t){return Object.assign({},t,{get:function(){return w.trackVolatile(),t.get.apply(this)}})}var w,ol,Ot,zt,lt=c(()=>{Ve();bt();Wo();w=io.getById(2,()=>{let o=/(:|&&|\|\||if)/,e=new WeakMap,t=y.queueUpdate,i,s=h=>{throw new Error("Must call enableArrayObservation before observing arrays.")};function r(h){let u=h.$fastController||e.get(h);return u===void 0&&(Array.isArray(h)?u=s(h):e.set(h,u=new ko(h))),u}let n=wi();class l{constructor(u){this.name=u,this.field=`_${u}`,this.callback=`${u}Changed`}getValue(u){return i!==void 0&&i.watch(u,this.name),u[this.field]}setValue(u,f){let v=this.field,T=u[v];if(T!==f){u[v]=f;let A=u[this.callback];typeof A=="function"&&A.call(u,T,f),r(u).notify(this.name)}}}class p extends Ft{constructor(u,f,v=!1){super(u,f),this.binding=u,this.isVolatileBinding=v,this.needsRefresh=!0,this.needsQueue=!0,this.first=this,this.last=null,this.propertySource=void 0,this.propertyName=void 0,this.notifier=void 0,this.next=void 0}observe(u,f){this.needsRefresh&&this.last!==null&&this.disconnect();let v=i;i=this.needsRefresh?this:void 0,this.needsRefresh=this.isVolatileBinding;let T=this.binding(u,f);return i=v,T}disconnect(){if(this.last!==null){let u=this.first;for(;u!==void 0;)u.notifier.unsubscribe(this,u.propertyName),u=u.next;this.last=null,this.needsRefresh=this.needsQueue=!0}}watch(u,f){let v=this.last,T=r(u),A=v===null?this.first:{};if(A.propertySource=u,A.propertyName=f,A.notifier=T,T.subscribe(this,f),v!==null){if(!this.needsRefresh){let te;i=void 0,te=v.propertySource[v.propertyName],i=this,u===te&&(this.needsRefresh=!0)}v.next=A}this.last=A}handleChange(){this.needsQueue&&(this.needsQueue=!1,t(this))}call(){this.last!==null&&(this.needsQueue=!0,this.notify(this))}records(){let u=this.first;return{next:()=>{let f=u;return f===void 0?{value:void 0,done:!0}:(u=u.next,{value:f,done:!1})},[Symbol.iterator]:function(){return this}}}}return Object.freeze({setArrayObserverFactory(h){s=h},getNotifier:r,track(h,u){i!==void 0&&i.watch(h,u)},trackVolatile(){i!==void 0&&(i.needsRefresh=!0)},notify(h,u){r(h).notify(u)},defineProperty(h,u){typeof u=="string"&&(u=new l(u)),n(h).push(u),Reflect.defineProperty(h,u.name,{enumerable:!0,get:function(){return u.getValue(this)},set:function(f){u.setValue(this,f)}})},getAccessors:n,binding(h,u,f=this.isVolatileBinding(h)){return new p(h,u,f)},isVolatileBinding(h){return o.test(h.toString())}})});ol=io.getById(3,()=>{let o=null;return{get(){return o},set(e){o=e}}}),Ot=class{constructor(){this.index=0,this.length=0,this.parent=null,this.parentContext=null}get event(){return ol.get()}get isEven(){return this.index%2===0}get isOdd(){return this.index%2!==0}get isFirst(){return this.index===0}get isInMiddle(){return!this.isFirst&&!this.isLast}get isLast(){return this.index===this.length-1}static setEvent(e){ol.set(e)}};w.defineProperty(Ot.prototype,"index");w.defineProperty(Ot.prototype,"length");zt=Object.seal(new Ot)});var Ht,So,Bt,Nt=c(()=>{Ve();Ht=class{constructor(){this.targetIndex=0}},So=class extends Ht{constructor(){super(...arguments),this.createPlaceholder=y.createInterpolationPlaceholder}},Bt=class extends Ht{constructor(e,t,i){super(),this.name=e,this.behavior=t,this.options=i}createPlaceholder(e){return y.createCustomAttributePlaceholder(this.name,e)}createBehavior(e){return new this.behavior(e,this.options)}}});function Xm(o,e){this.source=o,this.context=e,this.bindingObserver===null&&(this.bindingObserver=w.binding(this.binding,this,this.isBindingVolatile)),this.updateTarget(this.bindingObserver.observe(o,e))}function Jm(o,e){this.source=o,this.context=e,this.target.addEventListener(this.targetName,this)}function Zm(){this.bindingObserver.disconnect(),this.source=null,this.context=null}function Km(){this.bindingObserver.disconnect(),this.source=null,this.context=null;let o=this.target.$fastView;o!==void 0&&o.isComposed&&(o.unbind(),o.needsBindOnly=!0)}function ef(){this.target.removeEventListener(this.targetName,this),this.source=null,this.context=null}function tf(o){y.setAttribute(this.target,this.targetName,o)}function of(o){y.setBooleanAttribute(this.target,this.targetName,o)}function sf(o){if(o==null&&(o=""),o.create){this.target.textContent="";let e=this.target.$fastView;e===void 0?e=o.create():this.target.$fastTemplate!==o&&(e.isComposed&&(e.remove(),e.unbind()),e=o.create()),e.isComposed?e.needsBindOnly&&(e.needsBindOnly=!1,e.bind(this.source,this.context)):(e.isComposed=!0,e.bind(this.source,this.context),e.insertBefore(this.target),this.target.$fastView=e,this.target.$fastTemplate=o)}else{let e=this.target.$fastView;e!==void 0&&e.isComposed&&(e.isComposed=!1,e.remove(),e.needsBindOnly?e.needsBindOnly=!1:e.unbind()),this.target.textContent=o}}function rf(o){this.target[this.targetName]=o}function nf(o){let e=this.classVersions||Object.create(null),t=this.target,i=this.version||0;if(o!=null&&o.length){let s=o.split(/\s+/);for(let r=0,n=s.length;r<n;++r){let l=s[r];l!==""&&(e[l]=i,t.classList.add(l))}}if(this.classVersions=e,this.version=i+1,i!==0){i-=1;for(let s in e)e[s]===i&&t.classList.remove(s)}}var so,rr,Si=c(()=>{Ve();lt();Nt();so=class extends So{constructor(e){super(),this.binding=e,this.bind=Xm,this.unbind=Zm,this.updateTarget=tf,this.isBindingVolatile=w.isVolatileBinding(this.binding)}get targetName(){return this.originalTargetName}set targetName(e){if(this.originalTargetName=e,e!==void 0)switch(e[0]){case":":if(this.cleanedTargetName=e.substr(1),this.updateTarget=rf,this.cleanedTargetName==="innerHTML"){let t=this.binding;this.binding=(i,s)=>y.createHTML(t(i,s))}break;case"?":this.cleanedTargetName=e.substr(1),this.updateTarget=of;break;case"@":this.cleanedTargetName=e.substr(1),this.bind=Jm,this.unbind=ef;break;default:this.cleanedTargetName=e,e==="class"&&(this.updateTarget=nf);break}}targetAtContent(){this.updateTarget=sf,this.unbind=Km}createBehavior(e){return new rr(e,this.binding,this.isBindingVolatile,this.bind,this.unbind,this.updateTarget,this.cleanedTargetName)}},rr=class{constructor(e,t,i,s,r,n,l){this.source=null,this.context=null,this.bindingObserver=null,this.target=e,this.binding=t,this.isBindingVolatile=i,this.bind=s,this.unbind=r,this.updateTarget=n,this.targetName=l}handleChange(){this.updateTarget(this.bindingObserver.observe(this.source,this.context))}handleEvent(e){Ot.setEvent(e);let t=this.binding(this.source,this.context);Ot.setEvent(null),t!==!0&&e.preventDefault()}}});function af(o){if(o.length===1)return o[0];let e,t=o.length,i=o.map(n=>typeof n=="string"?()=>n:(e=n.targetName||e,n.binding)),s=(n,l)=>{let p="";for(let h=0;h<t;++h)p+=i[h](n,l);return p},r=new so(s);return r.targetName=e,r}function rl(o,e){let t=e.split(sr);if(t.length===1)return null;let i=[];for(let s=0,r=t.length;s<r;++s){let n=t[s],l=n.indexOf(ki),p;if(l===-1)p=n;else{let h=parseInt(n.substring(0,l));i.push(o.directives[h]),p=n.substring(l+lf)}p!==""&&i.push(p)}return i}function sl(o,e,t=!1){let i=e.attributes;for(let s=0,r=i.length;s<r;++s){let n=i[s],l=n.value,p=rl(o,l),h=null;p===null?t&&(h=new so(()=>l),h.targetName=n.name):h=af(p),h!==null&&(e.removeAttributeNode(n),s--,r--,o.addFactory(h))}}function cf(o,e,t){let i=rl(o,e.textContent);if(i!==null){let s=e;for(let r=0,n=i.length;r<n;++r){let l=i[r],p=r===0?e:s.parentNode.insertBefore(document.createTextNode(""),s.nextSibling);typeof l=="string"?p.textContent=l:(p.textContent=" ",o.captureContentBinding(l)),s=p,o.targetIndex++,p!==e&&t.nextNode()}o.targetIndex--}}function nl(o,e){let t=o.content;document.adoptNode(t);let i=ar.borrow(e);sl(i,o,!0);let s=i.behaviorFactories;i.reset();let r=y.createTemplateWalker(t),n;for(;n=r.nextNode();)switch(i.targetIndex++,n.nodeType){case 1:sl(i,n);break;case 3:cf(i,n,r);break;case 8:y.isMarker(n)&&i.addFactory(e[y.extractDirectiveIndexFromMarker(n)])}let l=0;(y.isMarker(t.firstChild)||t.childNodes.length===1&&e.length)&&(t.insertBefore(document.createComment(""),t.firstChild),l=-1);let p=i.behaviorFactories;return i.release(),{fragment:t,viewBehaviorFactories:p,hostBehaviorFactories:s,targetOffset:l}}var nr,ar,lf,lr=c(()=>{Ve();Si();nr=null,ar=class o{addFactory(e){e.targetIndex=this.targetIndex,this.behaviorFactories.push(e)}captureContentBinding(e){e.targetAtContent(),this.addFactory(e)}reset(){this.behaviorFactories=[],this.targetIndex=-1}release(){nr=this}static borrow(e){let t=nr||new o;return t.directives=e,t.reset(),nr=null,t}};lf=ki.length});var cr,Po,Pi=c(()=>{cr=document.createRange(),Po=class{constructor(e,t){this.fragment=e,this.behaviors=t,this.source=null,this.context=null,this.firstChild=e.firstChild,this.lastChild=e.lastChild}appendTo(e){e.appendChild(this.fragment)}insertBefore(e){if(this.fragment.hasChildNodes())e.parentNode.insertBefore(this.fragment,e);else{let t=this.lastChild;if(e.previousSibling===t)return;let i=e.parentNode,s=this.firstChild,r;for(;s!==t;)r=s.nextSibling,i.insertBefore(s,e),s=r;i.insertBefore(t,e)}}remove(){let e=this.fragment,t=this.lastChild,i=this.firstChild,s;for(;i!==t;)s=i.nextSibling,e.appendChild(i),i=s;e.appendChild(t)}dispose(){let e=this.firstChild.parentNode,t=this.lastChild,i=this.firstChild,s;for(;i!==t;)s=i.nextSibling,e.removeChild(i),i=s;e.removeChild(t);let r=this.behaviors,n=this.source;for(let l=0,p=r.length;l<p;++l)r[l].unbind(n)}bind(e,t){let i=this.behaviors;if(this.source!==e)if(this.source!==null){let s=this.source;this.source=e,this.context=t;for(let r=0,n=i.length;r<n;++r){let l=i[r];l.unbind(s),l.bind(e,t)}}else{this.source=e,this.context=t;for(let s=0,r=i.length;s<r;++s)i[s].bind(e,t)}}unbind(){if(this.source===null)return;let e=this.behaviors,t=this.source;for(let i=0,s=e.length;i<s;++i)e[i].unbind(t);this.source=null}static disposeContiguousBatch(e){if(e.length!==0){cr.setStartBefore(e[0].firstChild),cr.setEndAfter(e[e.length-1].lastChild),cr.deleteContents();for(let t=0,i=e.length;t<i;++t){let s=e[t],r=s.behaviors,n=s.source;for(let l=0,p=r.length;l<p;++l)r[l].unbind(n)}}}}});function k(o,...e){let t=[],i="";for(let s=0,r=o.length-1;s<r;++s){let n=o[s],l=e[s];if(i+=n,l instanceof $i){let p=l;l=()=>p}if(typeof l=="function"&&(l=new so(l)),l instanceof So){let p=df.exec(n);p!==null&&(l.targetName=p[2])}l instanceof Ht?(i+=l.createPlaceholder(t.length),t.push(l)):i+=l}return i+=o[o.length-1],new $i(i,t)}var $i,df,al=c(()=>{Ve();lt();lr();Pi();Nt();Si();$i=class{constructor(e,t){this.behaviorCount=0,this.hasHostBehaviors=!1,this.fragment=null,this.targetOffset=0,this.viewBehaviorFactories=null,this.hostBehaviorFactories=null,this.html=e,this.directives=t}create(e){if(this.fragment===null){let h,u=this.html;if(typeof u=="string"){h=document.createElement("template"),h.innerHTML=y.createHTML(u);let v=h.content.firstElementChild;v!==null&&v.tagName==="TEMPLATE"&&(h=v)}else h=u;let f=nl(h,this.directives);this.fragment=f.fragment,this.viewBehaviorFactories=f.viewBehaviorFactories,this.hostBehaviorFactories=f.hostBehaviorFactories,this.targetOffset=f.targetOffset,this.behaviorCount=this.viewBehaviorFactories.length+this.hostBehaviorFactories.length,this.hasHostBehaviors=this.hostBehaviorFactories.length>0}let t=this.fragment.cloneNode(!0),i=this.viewBehaviorFactories,s=new Array(this.behaviorCount),r=y.createTemplateWalker(t),n=0,l=this.targetOffset,p=r.nextNode();for(let h=i.length;n<h;++n){let u=i[n],f=u.targetIndex;for(;p!==null;)if(l===f){s[n]=u.createBehavior(p);break}else p=r.nextNode(),l++}if(this.hasHostBehaviors){let h=this.hostBehaviorFactories;for(let u=0,f=h.length;u<f;++u,++n)s[n]=h[u].createBehavior(e)}return new Po(t,s)}render(e,t,i){typeof t=="string"&&(t=document.getElementById(t)),i===void 0&&(i=t);let s=this.create(i);return s.bind(e,zt),s.appendTo(t),s}},df=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/});function ur(o){return o.map(e=>e instanceof re?ur(e.styles):[e]).reduce((e,t)=>e.concat(t),[])}function ll(o){return o.map(e=>e instanceof re?e.behaviors:null).reduce((e,t)=>t===null?e:(e===null&&(e=[]),e.concat(t)),null)}function cl(o){let e=[],t=[];return o.forEach(i=>(i[Ti]?e:t).push(i)),{prepend:e,append:t}}function uf(){return`fast-style-class-${++pf}`}var re,Ti,dl,pl,dr,pf,pr,Mi=c(()=>{Ve();re=class{constructor(){this.targets=new WeakSet}addStylesTo(e){this.targets.add(e)}removeStylesFrom(e){this.targets.delete(e)}isAttachedTo(e){return this.targets.has(e)}withBehaviors(...e){return this.behaviors=this.behaviors===null?e:this.behaviors.concat(e),this}};re.create=(()=>{if(y.supportsAdoptedStyleSheets){let o=new Map;return e=>new dr(e,o)}return o=>new pr(o)})();Ti=Symbol("prependToAdoptedStyleSheets");dl=(o,e)=>{let{prepend:t,append:i}=cl(e);o.adoptedStyleSheets=[...t,...o.adoptedStyleSheets,...i]},pl=(o,e)=>{o.adoptedStyleSheets=o.adoptedStyleSheets.filter(t=>e.indexOf(t)===-1)};if(y.supportsAdoptedStyleSheets)try{document.adoptedStyleSheets.push(),document.adoptedStyleSheets.splice(),dl=(o,e)=>{let{prepend:t,append:i}=cl(e);o.adoptedStyleSheets.splice(0,0,...t),o.adoptedStyleSheets.push(...i)},pl=(o,e)=>{for(let t of e){let i=o.adoptedStyleSheets.indexOf(t);i!==-1&&o.adoptedStyleSheets.splice(i,1)}}}catch{}dr=class extends re{constructor(e,t){super(),this.styles=e,this.styleSheetCache=t,this._styleSheets=void 0,this.behaviors=ll(e)}get styleSheets(){if(this._styleSheets===void 0){let e=this.styles,t=this.styleSheetCache;this._styleSheets=ur(e).map(i=>{if(i instanceof CSSStyleSheet)return i;let s=t.get(i);return s===void 0&&(s=new CSSStyleSheet,s.replaceSync(i),t.set(i,s)),s})}return this._styleSheets}addStylesTo(e){dl(e,this.styleSheets),super.addStylesTo(e)}removeStylesFrom(e){pl(e,this.styleSheets),super.removeStylesFrom(e)}},pf=0;pr=class extends re{constructor(e){super(),this.styles=e,this.behaviors=null,this.behaviors=ll(e),this.styleSheets=ur(e),this.styleClass=uf()}addStylesTo(e){let t=this.styleSheets,i=this.styleClass;e=this.normalizeTarget(e);for(let s=0;s<t.length;s++){let r=document.createElement("style");r.innerHTML=t[s],r.className=i,e.append(r)}super.addStylesTo(e)}removeStylesFrom(e){e=this.normalizeTarget(e);let t=e.querySelectorAll(`.${this.styleClass}`);for(let i=0,s=t.length;i<s;++i)e.removeChild(t[i]);super.removeStylesFrom(e)}isAttachedTo(e){return super.isAttachedTo(this.normalizeTarget(e))}normalizeTarget(e){return e===document?document.body:e}}});function d(o,e){let t;function i(s,r){arguments.length>1&&(t.property=r),Qo.locate(s.constructor).push(t)}if(arguments.length>1){t={},i(o,e);return}return t=o===void 0?{}:o,i}var Qo,ro,E,Ii,hr=c(()=>{lt();Ve();bt();Qo=Object.freeze({locate:wi()}),ro={toView(o){return o?"true":"false"},fromView(o){return!(o==null||o==="false"||o===!1||o===0)}},E={toView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e.toString()},fromView(o){if(o==null)return null;let e=o*1;return isNaN(e)?null:e}},Ii=class o{constructor(e,t,i=t.toLowerCase(),s="reflect",r){this.guards=new Set,this.Owner=e,this.name=t,this.attribute=i,this.mode=s,this.converter=r,this.fieldName=`_${t}`,this.callbackName=`${t}Changed`,this.hasCallback=this.callbackName in e.prototype,s==="boolean"&&r===void 0&&(this.converter=ro)}setValue(e,t){let i=e[this.fieldName],s=this.converter;s!==void 0&&(t=s.fromView(t)),i!==t&&(e[this.fieldName]=t,this.tryReflectToAttribute(e),this.hasCallback&&e[this.callbackName](i,t),e.$fastController.notify(this.name))}getValue(e){return w.track(e,this.name),e[this.fieldName]}onAttributeChangedCallback(e,t){this.guards.has(e)||(this.guards.add(e),this.setValue(e,t),this.guards.delete(e))}tryReflectToAttribute(e){let t=this.mode,i=this.guards;i.has(e)||t==="fromView"||y.queueUpdate(()=>{i.add(e);let s=e[this.fieldName];switch(t){case"reflect":let r=this.converter;y.setAttribute(e,this.attribute,r!==void 0?r.toView(s):s);break;case"boolean":y.setBooleanAttribute(e,this.attribute,s);break}i.delete(e)})}static collect(e,...t){let i=[];t.push(Qo.locate(e));for(let s=0,r=t.length;s<r;++s){let n=t[s];if(n!==void 0)for(let l=0,p=n.length;l<p;++l){let h=n[l];typeof h=="string"?i.push(new o(e,h)):i.push(new o(e,h.property,h.attribute,h.mode,h.converter))}}return i}}});var ul,hl,mr,ct,Ri=c(()=>{bt();lt();Mi();hr();ul={mode:"open"},hl={},mr=io.getById(4,()=>{let o=new Map;return Object.freeze({register(e){return o.has(e.type)?!1:(o.set(e.type,e),!0)},getByType(e){return o.get(e)}})}),ct=class{constructor(e,t=e.definition){typeof t=="string"&&(t={name:t}),this.type=e,this.name=t.name,this.template=t.template;let i=Ii.collect(e,t.attributes),s=new Array(i.length),r={},n={};for(let l=0,p=i.length;l<p;++l){let h=i[l];s[l]=h.attribute,r[h.name]=h,n[h.attribute]=h}this.attributes=i,this.observedAttributes=s,this.propertyLookup=r,this.attributeLookup=n,this.shadowOptions=t.shadowOptions===void 0?ul:t.shadowOptions===null?void 0:Object.assign(Object.assign({},ul),t.shadowOptions),this.elementOptions=t.elementOptions===void 0?hl:Object.assign(Object.assign({},hl),t.elementOptions),this.styles=t.styles===void 0?void 0:Array.isArray(t.styles)?re.create(t.styles):t.styles instanceof re?t.styles:re.create([t.styles])}get isDefined(){return!!mr.getByType(this.type)}define(e=customElements){let t=this.type;if(mr.register(this)){let i=this.attributes,s=t.prototype;for(let r=0,n=i.length;r<n;++r)w.defineProperty(s,i[r]);Reflect.defineProperty(t,"observedAttributes",{value:this.observedAttributes,enumerable:!0})}return e.get(this.name)||e.define(this.name,t,this.elementOptions),this}};ct.forType=mr.getByType});function fr(o){return o.shadowRoot||ml.get(o)||null}var ml,hf,Ai,gr=c(()=>{Ve();Wo();lt();Ri();ml=new WeakMap,hf={bubbles:!0,composed:!0,cancelable:!0};Ai=class o extends ko{constructor(e,t){super(e),this.boundObservables=null,this.behaviors=null,this.needsInitialization=!0,this._template=null,this._styles=null,this._isConnected=!1,this.$fastController=this,this.view=null,this.element=e,this.definition=t;let i=t.shadowOptions;if(i!==void 0){let r=e.attachShadow(i);i.mode==="closed"&&ml.set(e,r)}let s=w.getAccessors(e);if(s.length>0){let r=this.boundObservables=Object.create(null);for(let n=0,l=s.length;n<l;++n){let p=s[n].name,h=e[p];h!==void 0&&(delete e[p],r[p]=h)}}}get isConnected(){return w.track(this,"isConnected"),this._isConnected}setIsConnected(e){this._isConnected=e,w.notify(this,"isConnected")}get template(){return this._template}set template(e){this._template!==e&&(this._template=e,this.needsInitialization||this.renderTemplate(e))}get styles(){return this._styles}set styles(e){this._styles!==e&&(this._styles!==null&&this.removeStyles(this._styles),this._styles=e,!this.needsInitialization&&e!==null&&this.addStyles(e))}addStyles(e){let t=fr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.append(e);else if(!e.isAttachedTo(t)){let i=e.behaviors;e.addStylesTo(t),i!==null&&this.addBehaviors(i)}}removeStyles(e){let t=fr(this.element)||this.element.getRootNode();if(e instanceof HTMLStyleElement)t.removeChild(e);else if(e.isAttachedTo(t)){let i=e.behaviors;e.removeStylesFrom(t),i!==null&&this.removeBehaviors(i)}}addBehaviors(e){let t=this.behaviors||(this.behaviors=new Map),i=e.length,s=[];for(let r=0;r<i;++r){let n=e[r];t.has(n)?t.set(n,t.get(n)+1):(t.set(n,1),s.push(n))}if(this._isConnected){let r=this.element;for(let n=0;n<s.length;++n)s[n].bind(r,zt)}}removeBehaviors(e,t=!1){let i=this.behaviors;if(i===null)return;let s=e.length,r=[];for(let n=0;n<s;++n){let l=e[n];if(i.has(l)){let p=i.get(l)-1;p===0||t?i.delete(l)&&r.push(l):i.set(l,p)}}if(this._isConnected){let n=this.element;for(let l=0;l<r.length;++l)r[l].unbind(n)}}onConnectedCallback(){if(this._isConnected)return;let e=this.element;this.needsInitialization?this.finishInitialization():this.view!==null&&this.view.bind(e,zt);let t=this.behaviors;if(t!==null)for(let[i]of t)i.bind(e,zt);this.setIsConnected(!0)}onDisconnectedCallback(){if(!this._isConnected)return;this.setIsConnected(!1);let e=this.view;e!==null&&e.unbind();let t=this.behaviors;if(t!==null){let i=this.element;for(let[s]of t)s.unbind(i)}}onAttributeChangedCallback(e,t,i){let s=this.definition.attributeLookup[e];s!==void 0&&s.onAttributeChangedCallback(this.element,i)}emit(e,t,i){return this._isConnected?this.element.dispatchEvent(new CustomEvent(e,Object.assign(Object.assign({detail:t},hf),i))):!1}finishInitialization(){let e=this.element,t=this.boundObservables;if(t!==null){let s=Object.keys(t);for(let r=0,n=s.length;r<n;++r){let l=s[r];e[l]=t[l]}this.boundObservables=null}let i=this.definition;this._template===null&&(this.element.resolveTemplate?this._template=this.element.resolveTemplate():i.template&&(this._template=i.template||null)),this._template!==null&&this.renderTemplate(this._template),this._styles===null&&(this.element.resolveStyles?this._styles=this.element.resolveStyles():i.styles&&(this._styles=i.styles||null)),this._styles!==null&&this.addStyles(this._styles),this.needsInitialization=!1}renderTemplate(e){let t=this.element,i=fr(t)||t;this.view!==null?(this.view.dispose(),this.view=null):this.needsInitialization||y.removeChildNodes(i),e&&(this.view=e.render(t,i,t))}static forCustomElement(e){let t=e.$fastController;if(t!==void 0)return t;let i=ct.forType(e.constructor);if(i===void 0)throw new Error("Missing FASTElement definition.");return e.$fastController=new o(e,i)}}});function fl(o){return class extends o{constructor(){super(),Ai.forCustomElement(this)}$emit(e,t,i){return this.$fastController.emit(e,t,i)}connectedCallback(){this.$fastController.onConnectedCallback()}disconnectedCallback(){this.$fastController.onDisconnectedCallback()}attributeChangedCallback(e,t,i){this.$fastController.onAttributeChangedCallback(e,t,i)}}}var Gt,gl=c(()=>{gr();Ri();Gt=Object.assign(fl(HTMLElement),{from(o){return fl(o)},define(o,e){return new ct(o,e).define().type}})});var no,br=c(()=>{no=class{createCSS(){return""}createBehavior(){}}});function mf(o,e){let t=[],i="",s=[];for(let r=0,n=o.length-1;r<n;++r){i+=o[r];let l=e[r];if(l instanceof no){let p=l.createBehavior();l=l.createCSS(),p&&s.push(p)}l instanceof re||l instanceof CSSStyleSheet?(i.trim()!==""&&(t.push(i),i=""),t.push(l)):i+=l}return i+=o[o.length-1],i.trim()!==""&&t.push(i),{styles:t,behaviors:s}}function M(o,...e){let{styles:t,behaviors:i}=mf(o,e),s=re.create(t);return i.length&&s.withBehaviors(...i),s}var bl=c(()=>{br();Mi()});function qe(o,e,t){return{index:o,removed:e,addedCount:t}}function ff(o,e,t,i,s,r){let n=r-s+1,l=t-e+1,p=new Array(n),h,u;for(let f=0;f<n;++f)p[f]=new Array(l),p[f][0]=f;for(let f=0;f<l;++f)p[0][f]=f;for(let f=1;f<n;++f)for(let v=1;v<l;++v)o[e+v-1]===i[s+f-1]?p[f][v]=p[f-1][v-1]:(h=p[f-1][v]+1,u=p[f][v-1]+1,p[f][v]=h<u?h:u);return p}function gf(o){let e=o.length-1,t=o[0].length-1,i=o[e][t],s=[];for(;e>0||t>0;){if(e===0){s.push(vr),t--;continue}if(t===0){s.push(yr),e--;continue}let r=o[e-1][t-1],n=o[e-1][t],l=o[e][t-1],p;n<l?p=n<r?n:r:p=l<r?l:r,p===r?(r===i?s.push(yl):(s.push(xl),i=r),e--,t--):p===n?(s.push(yr),e--,i=n):(s.push(vr),t--,i=l)}return s.reverse(),s}function bf(o,e,t){for(let i=0;i<t;++i)if(o[i]!==e[i])return i;return t}function vf(o,e,t){let i=o.length,s=e.length,r=0;for(;r<t&&o[--i]===e[--s];)r++;return r}function yf(o,e,t,i){return e<t||i<o?-1:e===t||i===o?0:o<t?e<i?e-t:i-t:i<e?i-o:e-o}function xr(o,e,t,i,s,r){let n=0,l=0,p=Math.min(t-e,r-s);if(e===0&&s===0&&(n=bf(o,i,p)),t===o.length&&r===i.length&&(l=vf(o,i,p-n)),e+=n,s+=n,t-=l,r-=l,t-e===0&&r-s===0)return Ge;if(e===t){let A=qe(e,[],0);for(;s<r;)A.removed.push(i[s++]);return[A]}else if(s===r)return[qe(e,[],t-e)];let h=gf(ff(o,e,t,i,s,r)),u=[],f,v=e,T=s;for(let A=0;A<h.length;++A)switch(h[A]){case yl:f!==void 0&&(u.push(f),f=void 0),v++,T++;break;case xl:f===void 0&&(f=qe(v,[],0)),f.addedCount++,v++,f.removed.push(i[T]),T++;break;case vr:f===void 0&&(f=qe(v,[],0)),f.addedCount++,v++;break;case yr:f===void 0&&(f=qe(v,[],0)),f.removed.push(i[T]),T++;break}return f!==void 0&&u.push(f),u}function xf(o,e,t,i){let s=qe(e,t,i),r=!1,n=0;for(let l=0;l<o.length;l++){let p=o[l];if(p.index+=n,r)continue;let h=yf(s.index,s.index+s.removed.length,p.index,p.index+p.addedCount);if(h>=0){o.splice(l,1),l--,n-=p.addedCount-p.removed.length,s.addedCount+=p.addedCount-h;let u=s.removed.length+p.removed.length-h;if(!s.addedCount&&!u)r=!0;else{let f=p.removed;if(s.index<p.index){let v=s.removed.slice(0,p.index-s.index);vl.apply(v,f),f=v}if(s.index+s.removed.length>p.index+p.addedCount){let v=s.removed.slice(p.index+p.addedCount-s.index);vl.apply(f,v)}s.removed=f,p.index<s.index&&(s.index=p.index)}}else if(s.index<p.index){r=!0,o.splice(l,0,s),l++;let u=s.addedCount-s.removed.length;p.index+=u,n+=u}}r||o.push(s)}function Cf(o){let e=[];for(let t=0,i=o.length;t<i;t++){let s=o[t];xf(e,s.index,s.removed,s.addedCount)}return e}function Cl(o,e){let t=[],i=Cf(e);for(let s=0,r=i.length;s<r;++s){let n=i[s];if(n.addedCount===1&&n.removed.length===1){n.removed[0]!==o[n.index]&&t.push(n);continue}t=t.concat(xr(o,n.index,n.index+n.addedCount,n.removed,0,n.removed.length))}return t}var yl,xl,vr,yr,vl,_l=c(()=>{bt();yl=0,xl=1,vr=2,yr=3;vl=Array.prototype.push});function Cr(o,e){let t=o.index,i=e.length;return t>i?t=i-o.addedCount:t<0&&(t=i+o.removed.length+t-o.addedCount),t<0&&(t=0),o.index=t,o}function kl(){if(wl)return;wl=!0,w.setArrayObserverFactory(p=>new _r(p));let o=Array.prototype;if(o.$fastPatch)return;Reflect.defineProperty(o,"$fastPatch",{value:1,enumerable:!1});let e=o.pop,t=o.push,i=o.reverse,s=o.shift,r=o.sort,n=o.splice,l=o.unshift;o.pop=function(){let p=this.length>0,h=e.apply(this,arguments),u=this.$fastController;return u!==void 0&&p&&u.addSplice(qe(this.length,[h],0)),h},o.push=function(){let p=t.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(Cr(qe(this.length-arguments.length,[],arguments.length),this)),p},o.reverse=function(){let p,h=this.$fastController;h!==void 0&&(h.flush(),p=this.slice());let u=i.apply(this,arguments);return h!==void 0&&h.reset(p),u},o.shift=function(){let p=this.length>0,h=s.apply(this,arguments),u=this.$fastController;return u!==void 0&&p&&u.addSplice(qe(0,[h],0)),h},o.sort=function(){let p,h=this.$fastController;h!==void 0&&(h.flush(),p=this.slice());let u=r.apply(this,arguments);return h!==void 0&&h.reset(p),u},o.splice=function(){let p=n.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(Cr(qe(+arguments[0],p,arguments.length>2?arguments.length-2:0),this)),p},o.unshift=function(){let p=l.apply(this,arguments),h=this.$fastController;return h!==void 0&&h.addSplice(Cr(qe(0,[],arguments.length),this)),p}}var wl,_r,Sl=c(()=>{Ve();_l();Wo();lt();wl=!1;_r=class extends Ft{constructor(e){super(e),this.oldCollection=void 0,this.splices=void 0,this.needsQueue=!0,this.call=this.flush,Reflect.defineProperty(e,"$fastController",{value:this,enumerable:!1})}subscribe(e){this.flush(),super.subscribe(e)}addSplice(e){this.splices===void 0?this.splices=[e]:this.splices.push(e),this.needsQueue&&(this.needsQueue=!1,y.queueUpdate(this))}reset(e){this.oldCollection=e,this.needsQueue&&(this.needsQueue=!1,y.queueUpdate(this))}flush(){let e=this.splices,t=this.oldCollection;if(e===void 0&&t===void 0)return;this.needsQueue=!0,this.splices=void 0,this.oldCollection=void 0;let i=t===void 0?Cl(this.source,e):xr(this.source,0,this.source.length,t,0,t.length);this.notify(i)}}});function Z(o){return new Bt("fast-ref",wr,o)}var wr,Pl=c(()=>{Nt();wr=class{constructor(e,t){this.target=e,this.propertyName=t}bind(e){e[this.propertyName]=this.target}unbind(){}}});var kr,$l=c(()=>{kr=o=>typeof o=="function"});function Tl(o){return o===void 0?_f:kr(o)?o:()=>o}function ao(o,e,t){let i=kr(o)?o:()=>o,s=Tl(e),r=Tl(t);return(n,l)=>i(n,l)?s(n,l):r(n,l)}var _f,Ml=c(()=>{$l();_f=()=>null});function wf(o,e,t,i){o.bind(e[t],i)}function kf(o,e,t,i){let s=Object.create(i);s.index=t,s.length=e.length,o.bind(e[t],s)}var ay,Sr,vt,Il=c(()=>{Ve();lt();Sl();bt();Nt();Pi();ay=Object.freeze({positioning:!1,recycle:!0});Sr=class{constructor(e,t,i,s,r,n){this.location=e,this.itemsBinding=t,this.templateBinding=s,this.options=n,this.source=null,this.views=[],this.items=null,this.itemsObserver=null,this.originalContext=void 0,this.childContext=void 0,this.bindView=wf,this.itemsBindingObserver=w.binding(t,this,i),this.templateBindingObserver=w.binding(s,this,r),n.positioning&&(this.bindView=kf)}bind(e,t){this.source=e,this.originalContext=t,this.childContext=Object.create(t),this.childContext.parent=e,this.childContext.parentContext=this.originalContext,this.items=this.itemsBindingObserver.observe(e,this.originalContext),this.template=this.templateBindingObserver.observe(e,this.originalContext),this.observeItems(!0),this.refreshAllViews()}unbind(){this.source=null,this.items=null,this.itemsObserver!==null&&this.itemsObserver.unsubscribe(this),this.unbindAllViews(),this.itemsBindingObserver.disconnect(),this.templateBindingObserver.disconnect()}handleChange(e,t){e===this.itemsBinding?(this.items=this.itemsBindingObserver.observe(this.source,this.originalContext),this.observeItems(),this.refreshAllViews()):e===this.templateBinding?(this.template=this.templateBindingObserver.observe(this.source,this.originalContext),this.refreshAllViews(!0)):this.updateViews(t)}observeItems(e=!1){if(!this.items){this.items=Ge;return}let t=this.itemsObserver,i=this.itemsObserver=w.getNotifier(this.items),s=t!==i;s&&t!==null&&t.unsubscribe(this),(s||e)&&i.subscribe(this)}updateViews(e){let t=this.childContext,i=this.views,s=this.bindView,r=this.items,n=this.template,l=this.options.recycle,p=[],h=0,u=0;for(let f=0,v=e.length;f<v;++f){let T=e[f],A=T.removed,te=0,le=T.index,Et=le+T.addedCount,Dt=i.splice(T.index,A.length),Om=u=p.length+Dt.length;for(;le<Et;++le){let Ha=i[le],zm=Ha?Ha.firstChild:this.location,wo;l&&u>0?(te<=Om&&Dt.length>0?(wo=Dt[te],te++):(wo=p[h],h++),u--):wo=n.create(),i.splice(le,0,wo),s(wo,r,le,t),wo.insertBefore(zm)}Dt[te]&&p.push(...Dt.slice(te))}for(let f=h,v=p.length;f<v;++f)p[f].dispose();if(this.options.positioning)for(let f=0,v=i.length;f<v;++f){let T=i[f].context;T.length=v,T.index=f}}refreshAllViews(e=!1){let t=this.items,i=this.childContext,s=this.template,r=this.location,n=this.bindView,l=t.length,p=this.views,h=p.length;if((l===0||e||!this.options.recycle)&&(Po.disposeContiguousBatch(p),h=0),h===0){this.views=p=new Array(l);for(let u=0;u<l;++u){let f=s.create();n(f,t,u,i),p[u]=f,f.insertBefore(r)}}else{let u=0;for(;u<l;++u)if(u<h){let v=p[u];n(v,t,u,i)}else{let v=s.create();n(v,t,u,i),p.push(v),v.insertBefore(r)}let f=p.splice(u,h-u);for(u=0,l=f.length;u<l;++u)f[u].dispose()}}unbindAllViews(){let e=this.views;for(let t=0,i=e.length;t<i;++t)e[t].unbind()}},vt=class extends Ht{constructor(e,t,i){super(),this.itemsBinding=e,this.templateBinding=t,this.options=i,this.createPlaceholder=y.createBlockPlaceholder,kl(),this.isItemsBindingVolatile=w.isVolatileBinding(e),this.isTemplateBindingVolatile=w.isVolatileBinding(t)}createBehavior(e){return new Sr(e,this.itemsBinding,this.isItemsBindingVolatile,this.templateBinding,this.isTemplateBindingVolatile,this.options)}}});function lo(o){return o?function(e,t,i){return e.nodeType===1&&e.matches(o)}:function(e,t,i){return e.nodeType===1}}var $o,Ei=c(()=>{lt();bt();$o=class{constructor(e,t){this.target=e,this.options=t,this.source=null}bind(e){let t=this.options.property;this.shouldUpdate=w.getAccessors(e).some(i=>i.name===t),this.source=e,this.updateTarget(this.computeNodes()),this.shouldUpdate&&this.observe()}unbind(){this.updateTarget(Ge),this.source=null,this.shouldUpdate&&this.disconnect()}handleEvent(){this.updateTarget(this.computeNodes())}computeNodes(){let e=this.getNodes();return this.options.filter!==void 0&&(e=e.filter(this.options.filter)),e}updateTarget(e){this.source[this.options.property]=e}}});function ee(o){return typeof o=="string"&&(o={property:o}),new Bt("fast-slotted",Pr,o)}var Pr,Rl=c(()=>{Nt();Ei();Pr=class extends $o{constructor(e,t){super(e,t)}observe(){this.target.addEventListener("slotchange",this)}disconnect(){this.target.removeEventListener("slotchange",this)}getNodes(){return this.target.assignedNodes(this.options)}}});function Di(o){return typeof o=="string"&&(o={property:o}),new Bt("fast-children",$r,o)}var $r,Al=c(()=>{Nt();Ei();$r=class extends $o{constructor(e,t){super(e,t),this.observer=null,t.childList=!0}observe(){this.observer===null&&(this.observer=new MutationObserver(this.handleEvent.bind(this))),this.observer.observe(this.target,this.options)}disconnect(){this.observer.disconnect()}getNodes(){return"subtree"in this.options?Array.from(this.target.querySelectorAll(this.options.selector)):Array.from(this.target.childNodes)}}});var g=c(()=>{bt();al();gl();Ri();hr();gr();lr();Mi();bl();br();Pi();lt();Wo();Ve();Si();Nt();Pl();Ml();Il();Rl();Al();Ei()});var N,Ue,je,Vy,qy,ve=c(()=>{g();N=class{handleStartContentChange(){this.startContainer.classList.toggle("start",this.start.assignedNodes().length>0)}handleEndContentChange(){this.endContainer.classList.toggle("end",this.end.assignedNodes().length>0)}},Ue=(o,e)=>k`
    <span
        part="end"
        ${Z("endContainer")}
        class=${t=>e.end?"end":void 0}
    >
        <slot name="end" ${Z("end")} @slotchange="${t=>t.handleEndContentChange()}">
            ${e.end||""}
        </slot>
    </span>
`,je=(o,e)=>k`
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
`,Vy=k`
    <span part="end" ${Z("endContainer")}>
        <slot
            name="end"
            ${Z("end")}
            @slotchange="${o=>o.handleEndContentChange()}"
        ></slot>
    </span>
`,qy=k`
    <span part="start" ${Z("startContainer")}>
        <slot
            name="start"
            ${Z("start")}
            @slotchange="${o=>o.handleStartContentChange()}"
        ></slot>
    </span>
`});var El=c(()=>{});function a(o,e,t,i){var s=arguments.length,r=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(n=o[l])&&(r=(s<3?n(r):s>3?n(e,t,r):n(e,t))||r);return s>3&&r&&Object.defineProperty(e,t,r),r}var S=c(()=>{});function Yo(o){let e=o.slice(),t=Object.keys(o),i=t.length,s;for(let r=0;r<i;++r)s=t[r],Ul(s)||(e[s]=o[s]);return e}function Ll(o){return e=>Reflect.getOwnMetadata(o,e)}function zi(o){return function(e){let t=function(i,s,r){V.inject(t)(i,s,r)};return t.$isResolver=!0,t.resolve=function(i,s){return o(e,i,s)},t}}function Tf(o){return function(e,t){t=!!t;let i=function(s,r,n){V.inject(i)(s,r,n)};return i.$isResolver=!0,i.resolve=function(s,r){return o(e,s,r,t)},i}}function Dr(o,e,t){V.inject(Dr)(o,e,t)}function Gl(o,e){return e.getFactory(o).construct(e)}function Ol(o){return this.get(o)}function Mf(o,e){return e(o)}function Oi(o){return typeof o.register=="function"}function Rf(o){return Oi(o)&&typeof o.registerInRequestor=="boolean"}function zl(o){return Rf(o)&&o.registerInRequestor}function Af(o){return o.prototype!==void 0}function ql(o){return function(e,t,i){if(Rr.has(i))return Rr.get(i);let s=o(e,t,i);return Rr.set(i,s),s}}function Li(o){if(o==null)throw new Error("key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?")}function Hl(o,e,t){if(o instanceof Se&&o.strategy===4){let i=o.state,s=i.length,r=new Array(s);for(;s--;)r[s]=i[s].resolve(e,t);return r}return[o.resolve(e,t)]}function Nl(o){return typeof o=="object"&&o!==null||typeof o=="function"}function Ul(o){switch(typeof o){case"number":return o>=0&&(o|0)===o;case"string":{let e=Fi[o];if(e!==void 0)return e;let t=o.length;if(t===0)return Fi[o]=!1;let i=0;for(let s=0;s<t;++s)if(i=o.charCodeAt(s),s===0&&i===48&&t>1||i<48||i>57)return Fi[o]=!1;return Fi[o]=!0}default:return!1}}var Tr,Ar,Sf,Mr,Dl,Fl,V,Pf,Yy,$f,Xy,Jy,Zy,Ky,ex,Se,Er,If,Ef,Vl,Ir,Xo,Rr,co,Bl,Df,Fi,Hi=c(()=>{g();Tr=new Map;"metadata"in Reflect||(Reflect.metadata=function(o,e){return function(t){Reflect.defineMetadata(o,e,t)}},Reflect.defineMetadata=function(o,e,t){let i=Tr.get(t);i===void 0&&Tr.set(t,i=new Map),i.set(o,e)},Reflect.getOwnMetadata=function(o,e){let t=Tr.get(e);if(t!==void 0)return t.get(o)});Ar=class{constructor(e,t){this.container=e,this.key=t}instance(e){return this.registerResolver(0,e)}singleton(e){return this.registerResolver(1,e)}transient(e){return this.registerResolver(2,e)}callback(e){return this.registerResolver(3,e)}cachedCallback(e){return this.registerResolver(3,ql(e))}aliasTo(e){return this.registerResolver(5,e)}registerResolver(e,t){let{container:i,key:s}=this;return this.container=this.key=void 0,i.registerResolver(s,new Se(s,e,t))}};Sf=Object.freeze({none(o){throw Error(`${o.toString()} not registered, did you forget to add @singleton()?`)},singleton(o){return new Se(o,1,o)},transient(o){return new Se(o,2,o)}}),Mr=Object.freeze({default:Object.freeze({parentLocator:()=>null,responsibleForOwnerRequests:!1,defaultResolver:Sf.singleton})}),Dl=new Map;Fl=null,V=Object.freeze({createContainer(o){return new Xo(null,Object.assign({},Mr.default,o))},findResponsibleContainer(o){let e=o.$$container$$;return e&&e.responsibleForOwnerRequests?e:V.findParentContainer(o)},findParentContainer(o){let e=new CustomEvent(Vl,{bubbles:!0,composed:!0,cancelable:!0,detail:{container:void 0}});return o.dispatchEvent(e),e.detail.container||V.getOrCreateDOMContainer()},getOrCreateDOMContainer(o,e){return o?o.$$container$$||new Xo(o,Object.assign({},Mr.default,e,{parentLocator:V.findParentContainer})):Fl||(Fl=new Xo(null,Object.assign({},Mr.default,e,{parentLocator:()=>null})))},getDesignParamtypes:Ll("design:paramtypes"),getAnnotationParamtypes:Ll("di:paramtypes"),getOrCreateAnnotationParamTypes(o){let e=this.getAnnotationParamtypes(o);return e===void 0&&Reflect.defineMetadata("di:paramtypes",e=[],o),e},getDependencies(o){let e=Dl.get(o);if(e===void 0){let t=o.inject;if(t===void 0){let i=V.getDesignParamtypes(o),s=V.getAnnotationParamtypes(o);if(i===void 0)if(s===void 0){let r=Object.getPrototypeOf(o);typeof r=="function"&&r!==Function.prototype?e=Yo(V.getDependencies(r)):e=[]}else e=Yo(s);else if(s===void 0)e=Yo(i);else{e=Yo(i);let r=s.length,n;for(let h=0;h<r;++h)n=s[h],n!==void 0&&(e[h]=n);let l=Object.keys(s);r=l.length;let p;for(let h=0;h<r;++h)p=l[h],Ul(p)||(e[p]=s[p])}}else e=Yo(t);Dl.set(o,e)}return e},defineProperty(o,e,t,i=!1){let s=`$di_${e}`;Reflect.defineProperty(o,e,{get:function(){let r=this[s];if(r===void 0&&(r=(this instanceof HTMLElement?V.findResponsibleContainer(this):V.getOrCreateDOMContainer()).get(t),this[s]=r,i&&this instanceof Gt)){let l=this.$fastController,p=()=>{let u=V.findResponsibleContainer(this).get(t),f=this[s];u!==f&&(this[s]=r,l.notify(e))};l.subscribe({handleChange:p},"isConnected")}return r}})},createInterface(o,e){let t=typeof o=="function"?o:e,i=typeof o=="string"?o:o&&"friendlyName"in o&&o.friendlyName||Bl,s=typeof o=="string"?!1:o&&"respectConnection"in o&&o.respectConnection||!1,r=function(n,l,p){if(n==null||new.target!==void 0)throw new Error(`No registration for interface: '${r.friendlyName}'`);if(l)V.defineProperty(n,l,r,s);else{let h=V.getOrCreateAnnotationParamTypes(n);h[p]=r}};return r.$isInterface=!0,r.friendlyName=i??"(anonymous)",t!=null&&(r.register=function(n,l){return t(new Ar(n,l??r))}),r.toString=function(){return`InterfaceSymbol<${r.friendlyName}>`},r},inject(...o){return function(e,t,i){if(typeof i=="number"){let s=V.getOrCreateAnnotationParamTypes(e),r=o[0];r!==void 0&&(s[i]=r)}else if(t)V.defineProperty(e,t,o[0]);else{let s=i?V.getOrCreateAnnotationParamTypes(i.value):V.getOrCreateAnnotationParamTypes(e),r;for(let n=0;n<o.length;++n)r=o[n],r!==void 0&&(s[n]=r)}}},transient(o){return o.register=function(t){return co.transient(o,o).register(t)},o.registerInRequestor=!1,o},singleton(o,e=$f){return o.register=function(i){return co.singleton(o,o).register(i)},o.registerInRequestor=e.scoped,o}}),Pf=V.createInterface("Container");Yy=V.inject,$f={scoped:!1};Xy=Tf((o,e,t,i)=>t.getAll(o,i)),Jy=zi((o,e,t)=>()=>t.get(o)),Zy=zi((o,e,t)=>{if(t.has(o,!0))return t.get(o)});Dr.$isResolver=!0;Dr.resolve=()=>{};Ky=zi((o,e,t)=>{let i=Gl(o,e),s=new Se(o,0,i);return t.registerResolver(o,s),i}),ex=zi((o,e,t)=>Gl(o,e));Se=class{constructor(e,t,i){this.key=e,this.strategy=t,this.state=i,this.resolving=!1}get $isResolver(){return!0}register(e){return e.registerResolver(this.key,this)}resolve(e,t){switch(this.strategy){case 0:return this.state;case 1:{if(this.resolving)throw new Error(`Cyclic dependency found: ${this.state.name}`);return this.resolving=!0,this.state=e.getFactory(this.state).construct(t),this.strategy=0,this.resolving=!1,this.state}case 2:{let i=e.getFactory(this.state);if(i===null)throw new Error(`Resolver for ${String(this.key)} returned a null factory`);return i.construct(t)}case 3:return this.state(e,t,this);case 4:return this.state[0].resolve(e,t);case 5:return t.get(this.state);default:throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`)}}getFactory(e){var t,i,s;switch(this.strategy){case 1:case 2:return e.getFactory(this.state);case 5:return(s=(i=(t=e.getResolver(this.state))===null||t===void 0?void 0:t.getFactory)===null||i===void 0?void 0:i.call(t,e))!==null&&s!==void 0?s:null;default:return null}}};Er=class{constructor(e,t){this.Type=e,this.dependencies=t,this.transformers=null}construct(e,t){let i;return t===void 0?i=new this.Type(...this.dependencies.map(Ol,e)):i=new this.Type(...this.dependencies.map(Ol,e),...t),this.transformers==null?i:this.transformers.reduce(Mf,i)}registerTransformer(e){(this.transformers||(this.transformers=[])).push(e)}},If={$isResolver:!0,resolve(o,e){return e}};Ef=new Set(["Array","ArrayBuffer","Boolean","DataView","Date","Error","EvalError","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakSet"]),Vl="__DI_LOCATE_PARENT__",Ir=new Map,Xo=class o{constructor(e,t){this.owner=e,this.config=t,this._parent=void 0,this.registerDepth=0,this.context=null,e!==null&&(e.$$container$$=this),this.resolvers=new Map,this.resolvers.set(Pf,If),e instanceof Node&&e.addEventListener(Vl,i=>{i.composedPath()[0]!==this.owner&&(i.detail.container=this,i.stopImmediatePropagation())})}get parent(){return this._parent===void 0&&(this._parent=this.config.parentLocator(this.owner)),this._parent}get depth(){return this.parent===null?0:this.parent.depth+1}get responsibleForOwnerRequests(){return this.config.responsibleForOwnerRequests}registerWithContext(e,...t){return this.context=e,this.register(...t),this.context=null,this}register(...e){if(++this.registerDepth===100)throw new Error("Unable to autoregister dependency");let t,i,s,r,n,l=this.context;for(let p=0,h=e.length;p<h;++p)if(t=e[p],!!Nl(t))if(Oi(t))t.register(this,l);else if(Af(t))co.singleton(t,t).register(this);else for(i=Object.keys(t),r=0,n=i.length;r<n;++r)s=t[i[r]],Nl(s)&&(Oi(s)?s.register(this,l):this.register(s));return--this.registerDepth,this}registerResolver(e,t){Li(e);let i=this.resolvers,s=i.get(e);return s==null?i.set(e,t):s instanceof Se&&s.strategy===4?s.state.push(t):i.set(e,new Se(e,4,[s,t])),t}registerTransformer(e,t){let i=this.getResolver(e);if(i==null)return!1;if(i.getFactory){let s=i.getFactory(this);return s==null?!1:(s.registerTransformer(t),!0)}return!1}getResolver(e,t=!0){if(Li(e),e.resolve!==void 0)return e;let i=this,s;for(;i!=null;)if(s=i.resolvers.get(e),s==null){if(i.parent==null){let r=zl(e)?this:i;return t?this.jitRegister(e,r):null}i=i.parent}else return s;return null}has(e,t=!1){return this.resolvers.has(e)?!0:t&&this.parent!=null?this.parent.has(e,!0):!1}get(e){if(Li(e),e.$isResolver)return e.resolve(this,this);let t=this,i;for(;t!=null;)if(i=t.resolvers.get(e),i==null){if(t.parent==null){let s=zl(e)?this:t;return i=this.jitRegister(e,s),i.resolve(t,this)}t=t.parent}else return i.resolve(t,this);throw new Error(`Unable to resolve key: ${String(e)}`)}getAll(e,t=!1){Li(e);let i=this,s=i,r;if(t){let n=Ge;for(;s!=null;)r=s.resolvers.get(e),r!=null&&(n=n.concat(Hl(r,s,i))),s=s.parent;return n}else for(;s!=null;)if(r=s.resolvers.get(e),r==null){if(s=s.parent,s==null)return Ge}else return Hl(r,s,i);return Ge}getFactory(e){let t=Ir.get(e);if(t===void 0){if(Df(e))throw new Error(`${e.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);Ir.set(e,t=new Er(e,V.getDependencies(e)))}return t}registerFactory(e,t){Ir.set(e,t)}createChild(e){return new o(null,Object.assign({},this.config,e,{parentLocator:()=>this}))}jitRegister(e,t){if(typeof e!="function")throw new Error(`Attempted to jitRegister something that is not a constructor: '${e}'. Did you forget to register this dependency?`);if(Ef.has(e.name))throw new Error(`Attempted to jitRegister an intrinsic type: ${e.name}. Did you forget to add @inject(Key)`);if(Oi(e)){let i=e.register(t);if(!(i instanceof Object)||i.resolve==null){let s=t.resolvers.get(e);if(s!=null)return s;throw new Error("A valid resolver was not returned from the static register method")}return i}else{if(e.$isInterface)throw new Error(`Attempted to jitRegister an interface: ${e.friendlyName}`);{let i=this.config.defaultResolver(e,t);return t.resolvers.set(e,i),i}}}},Rr=new WeakMap;co=Object.freeze({instance(o,e){return new Se(o,0,e)},singleton(o,e){return new Se(o,1,e)},transient(o,e){return new Se(o,2,e)},callback(o,e){return new Se(o,3,e)},cachedCallback(o,e){return new Se(o,3,ql(e))},aliasTo(o,e){return new Se(e,5,o)}});Bl="(anonymous)";Df=(function(){let o=new WeakMap,e=!1,t="",i=0;return function(s){return e=o.get(s),e===void 0&&(t=s.toString(),i=t.length,e=i>=29&&i<=100&&t.charCodeAt(i-1)===125&&t.charCodeAt(i-2)<=32&&t.charCodeAt(i-3)===93&&t.charCodeAt(i-4)===101&&t.charCodeAt(i-5)===100&&t.charCodeAt(i-6)===111&&t.charCodeAt(i-7)===99&&t.charCodeAt(i-8)===32&&t.charCodeAt(i-9)===101&&t.charCodeAt(i-10)===118&&t.charCodeAt(i-11)===105&&t.charCodeAt(i-12)===116&&t.charCodeAt(i-13)===97&&t.charCodeAt(i-14)===110&&t.charCodeAt(i-15)===88,o.set(s,e)),e}})(),Fi={}});function jl(o){return`${o.toLowerCase()}:presentation`}var Bi,Gi,Ni,Vi=c(()=>{g();Hi();Bi=new Map,Gi=Object.freeze({define(o,e,t){let i=jl(o);Bi.get(i)===void 0?Bi.set(i,e):Bi.set(i,!1),t.register(co.instance(i,e))},forTag(o,e){let t=jl(o),i=Bi.get(t);return i===!1?V.findResponsibleContainer(e).get(t):i||null}}),Ni=class{constructor(e,t){this.template=e||null,this.styles=t===void 0?null:Array.isArray(t)?re.create(t):t instanceof re?t:re.create([t])}applyTo(e){let t=e.$fastController;t.template===null&&(t.template=this.template),t.styles===null&&(t.styles=this.styles)}}});function Jo(o,e,t){return typeof o=="function"?o(e,t):o}var b,Lr,$=c(()=>{S();g();Vi();b=class o extends Gt{constructor(){super(...arguments),this._presentation=void 0}get $presentation(){return this._presentation===void 0&&(this._presentation=Gi.forTag(this.tagName,this)),this._presentation}templateChanged(){this.template!==void 0&&(this.$fastController.template=this.template)}stylesChanged(){this.styles!==void 0&&(this.$fastController.styles=this.styles)}connectedCallback(){this.$presentation!==null&&this.$presentation.applyTo(this),super.connectedCallback()}static compose(e){return(t={})=>new Lr(this===o?class extends o{}:this,e,t)}};a([m],b.prototype,"template",void 0);a([m],b.prototype,"styles",void 0);Lr=class{constructor(e,t,i){this.type=e,this.elementDefinition=t,this.overrideDefinition=i,this.definition=Object.assign(Object.assign({},this.elementDefinition),this.overrideDefinition)}register(e,t){let i=this.definition,s=this.overrideDefinition,n=`${i.prefix||t.elementPrefix}-${i.baseName}`;t.tryDefineElement({name:n,type:this.type,baseClass:this.elementDefinition.baseClass,callback:l=>{let p=new Ni(Jo(i.template,l,i),Jo(i.styles,l,i));l.definePresentation(p);let h=Jo(i.shadowOptions,l,i);l.shadowRootMode&&(h?s.shadowOptions||(h.mode=l.shadowRootMode):h!==null&&(h={mode:l.shadowRootMode})),l.defineElement({elementOptions:Jo(i.elementOptions,l,i),shadowOptions:h,attributes:Jo(i.attributes,l,i)})}})}}});function I(o,...e){let t=Qo.locate(o);e.forEach(i=>{Object.getOwnPropertyNames(i.prototype).forEach(r=>{r!=="constructor"&&Object.defineProperty(o.prototype,r,Object.getOwnPropertyDescriptor(i.prototype,r))}),Qo.locate(i).forEach(r=>t.push(r))})}var fe=c(()=>{g()});var yt,Fr=c(()=>{S();g();$();ve();fe();yt=class extends b{constructor(){super(...arguments),this.headinglevel=2,this.expanded=!1,this.clickHandler=e=>{this.expanded=!this.expanded,this.change()},this.change=()=>{this.$emit("change")}}};a([d({attribute:"heading-level",mode:"fromView",converter:E})],yt.prototype,"headinglevel",void 0);a([d({mode:"boolean"})],yt.prototype,"expanded",void 0);a([d],yt.prototype,"id",void 0);I(yt,N)});var Wl=c(()=>{El();Fr()});var Ql=c(()=>{});var q,Yl=c(()=>{q={horizontal:"horizontal",vertical:"vertical"}});function Xl(o,e){let t=o.length;for(;t--;)if(e(o[t],t,o))return t;return-1}var Jl=c(()=>{});var Zl=c(()=>{});function qi(){return!!(typeof window<"u"&&window.document&&window.document.createElement)}var Kl=c(()=>{});var ec=c(()=>{});var tc=c(()=>{});var oc=c(()=>{});var Or=c(()=>{Kl();ec();tc();oc()});function dt(...o){return o.every(e=>e instanceof HTMLElement)}function ic(o,e){return!o||!e||!dt(o)?void 0:Array.from(o.querySelectorAll(e)).filter(i=>i.offsetParent!==null)}function Lf(){let o=document.querySelector('meta[property="csp-nonce"]');return o?o.getAttribute("content"):null}function sc(){if(typeof po=="boolean")return po;if(!qi())return po=!1,po;let o=document.createElement("style"),e=Lf();e!==null&&o.setAttribute("nonce",e),document.head.appendChild(o);try{o.sheet.insertRule("foo:focus-visible {color:inherit}",0),po=!0}catch{po=!1}finally{document.head.removeChild(o)}return po}var po,rc=c(()=>{Or()});var zr,Hr,xt,Ct,Br,Nr,nc=c(()=>{zr="focus",Hr="focusin",xt="focusout",Ct="keydown",Br="resize",Nr="scroll"});var ac=c(()=>{});var lc,X,xe,Ce,J,oe,Ie,ce,de,cc,dc,pc,Re,Vt,uc,hc,qt,mc=c(()=>{(function(o){o[o.alt=18]="alt",o[o.arrowDown=40]="arrowDown",o[o.arrowLeft=37]="arrowLeft",o[o.arrowRight=39]="arrowRight",o[o.arrowUp=38]="arrowUp",o[o.back=8]="back",o[o.backSlash=220]="backSlash",o[o.break=19]="break",o[o.capsLock=20]="capsLock",o[o.closeBracket=221]="closeBracket",o[o.colon=186]="colon",o[o.colon2=59]="colon2",o[o.comma=188]="comma",o[o.ctrl=17]="ctrl",o[o.delete=46]="delete",o[o.end=35]="end",o[o.enter=13]="enter",o[o.equals=187]="equals",o[o.equals2=61]="equals2",o[o.equals3=107]="equals3",o[o.escape=27]="escape",o[o.forwardSlash=191]="forwardSlash",o[o.function1=112]="function1",o[o.function10=121]="function10",o[o.function11=122]="function11",o[o.function12=123]="function12",o[o.function2=113]="function2",o[o.function3=114]="function3",o[o.function4=115]="function4",o[o.function5=116]="function5",o[o.function6=117]="function6",o[o.function7=118]="function7",o[o.function8=119]="function8",o[o.function9=120]="function9",o[o.home=36]="home",o[o.insert=45]="insert",o[o.menu=93]="menu",o[o.minus=189]="minus",o[o.minus2=109]="minus2",o[o.numLock=144]="numLock",o[o.numPad0=96]="numPad0",o[o.numPad1=97]="numPad1",o[o.numPad2=98]="numPad2",o[o.numPad3=99]="numPad3",o[o.numPad4=100]="numPad4",o[o.numPad5=101]="numPad5",o[o.numPad6=102]="numPad6",o[o.numPad7=103]="numPad7",o[o.numPad8=104]="numPad8",o[o.numPad9=105]="numPad9",o[o.numPadDivide=111]="numPadDivide",o[o.numPadDot=110]="numPadDot",o[o.numPadMinus=109]="numPadMinus",o[o.numPadMultiply=106]="numPadMultiply",o[o.numPadPlus=107]="numPadPlus",o[o.openBracket=219]="openBracket",o[o.pageDown=34]="pageDown",o[o.pageUp=33]="pageUp",o[o.period=190]="period",o[o.print=44]="print",o[o.quote=222]="quote",o[o.scrollLock=145]="scrollLock",o[o.shift=16]="shift",o[o.space=32]="space",o[o.tab=9]="tab",o[o.tilde=192]="tilde",o[o.windowsLeft=91]="windowsLeft",o[o.windowsOpera=219]="windowsOpera",o[o.windowsRight=92]="windowsRight"})(lc||(lc={}));X="ArrowDown",xe="ArrowLeft",Ce="ArrowRight",J="ArrowUp",oe="Enter",Ie="Escape",ce="Home",de="End",cc="F2",dc="PageDown",pc="PageUp",Re=" ",Vt="Tab",uc="Backspace",hc="Delete",qt={ArrowDown:X,ArrowLeft:xe,ArrowRight:Ce,ArrowUp:J}});var D,Gr=c(()=>{(function(o){o.ltr="ltr",o.rtl="rtl"})(D||(D={}))});function fc(o,e,t){return t<o?e:t>e?o:t}function Ut(o,e,t){return Math.min(Math.max(t,o),e)}function Zo(o,e,t=0){return[e,t]=[e,t].sort((i,s)=>i-s),e<=o&&o<t}var gc=c(()=>{});function Oe(o=""){return`${o}${Ff++}`}var Ff,bc=c(()=>{Ff=0});var vc=c(()=>{});var To,yc=c(()=>{Or();Gr();To=class o{static getScrollLeft(e,t){return t===D.rtl?o.getRtlScrollLeftConverter(e):e.scrollLeft}static setScrollLeft(e,t,i){if(i===D.rtl){o.setRtlScrollLeftConverter(e,t);return}e.scrollLeft=t}static initialGetRtlScrollConverter(e){return o.initializeRtlScrollConverters(),o.getRtlScrollLeftConverter(e)}static directGetRtlScrollConverter(e){return e.scrollLeft}static invertedGetRtlScrollConverter(e){return-Math.abs(e.scrollLeft)}static reverseGetRtlScrollConverter(e){return e.scrollLeft-(e.scrollWidth-e.clientWidth)}static initialSetRtlScrollConverter(e,t){o.initializeRtlScrollConverters(),o.setRtlScrollLeftConverter(e,t)}static directSetRtlScrollConverter(e,t){e.scrollLeft=t}static invertedSetRtlScrollConverter(e,t){e.scrollLeft=Math.abs(t)}static reverseSetRtlScrollConverter(e,t){let i=e.scrollWidth-e.clientWidth;e.scrollLeft=i+t}static initializeRtlScrollConverters(){if(!qi()){o.applyDirectScrollConverters();return}let e=o.getTestElement();document.body.appendChild(e),o.checkForScrollType(e),document.body.removeChild(e)}static checkForScrollType(e){o.isReverse(e)?o.applyReverseScrollConverters():o.isDirect(e)?o.applyDirectScrollConverters():o.applyInvertedScrollConverters()}static isReverse(e){return e.scrollLeft>0}static isDirect(e){return e.scrollLeft=-1,e.scrollLeft<0}static applyDirectScrollConverters(){o.setRtlScrollLeftConverter=o.directSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.directGetRtlScrollConverter}static applyInvertedScrollConverters(){o.setRtlScrollLeftConverter=o.invertedSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.invertedGetRtlScrollConverter}static applyReverseScrollConverters(){o.setRtlScrollLeftConverter=o.reverseSetRtlScrollConverter,o.getRtlScrollLeftConverter=o.reverseGetRtlScrollConverter}static getTestElement(){let e=document.createElement("div");return e.appendChild(document.createTextNode("ABCD")),e.dir="rtl",e.style.fontSize="14px",e.style.width="4px",e.style.height="1px",e.style.position="absolute",e.style.top="-1000px",e.style.overflow="scroll",e}};To.getRtlScrollLeftConverter=To.initialGetRtlScrollConverter;To.setRtlScrollLeftConverter=To.initialSetRtlScrollConverter});var xc,Cc=c(()=>{(function(o){o.Canvas="Canvas",o.CanvasText="CanvasText",o.LinkText="LinkText",o.VisitedText="VisitedText",o.ActiveText="ActiveText",o.ButtonFace="ButtonFace",o.ButtonText="ButtonText",o.Field="Field",o.FieldText="FieldText",o.Highlight="Highlight",o.HighlightText="HighlightText",o.GrayText="GrayText"})(xc||(xc={}))});var L=c(()=>{Yl();Jl();Zl();rc();nc();ac();mc();Gr();gc();bc();vc();yc();Cc()});var _c,Ui,wc=c(()=>{S();g();L();$();Fr();_c={single:"single",multi:"multi"},Ui=class extends b{constructor(){super(...arguments),this.expandmode=_c.multi,this.activeItemIndex=0,this.change=()=>{this.$emit("change",this.activeid)},this.setItems=()=>{var e;this.accordionItems.length!==0&&(this.accordionIds=this.getItemIds(),this.accordionItems.forEach((t,i)=>{t instanceof yt&&(t.addEventListener("change",this.activeItemChange),this.isSingleExpandMode()&&(this.activeItemIndex!==i?t.expanded=!1:t.expanded=!0));let s=this.accordionIds[i];t.setAttribute("id",typeof s!="string"?`accordion-${i+1}`:s),this.activeid=this.accordionIds[this.activeItemIndex],t.addEventListener("keydown",this.handleItemKeyDown),t.addEventListener("focus",this.handleItemFocus)}),this.isSingleExpandMode()&&((e=this.findExpandedItem())!==null&&e!==void 0?e:this.accordionItems[0]).setAttribute("aria-disabled","true"))},this.removeItemListeners=e=>{e.forEach((t,i)=>{t.removeEventListener("change",this.activeItemChange),t.removeEventListener("keydown",this.handleItemKeyDown),t.removeEventListener("focus",this.handleItemFocus)})},this.activeItemChange=e=>{if(e.defaultPrevented||e.target!==e.currentTarget)return;e.preventDefault();let t=e.target;this.activeid=t.getAttribute("id"),this.isSingleExpandMode()&&(this.resetItems(),t.expanded=!0,t.setAttribute("aria-disabled","true"),this.accordionItems.forEach(i=>{!i.hasAttribute("disabled")&&i.id!==this.activeid&&i.removeAttribute("aria-disabled")})),this.activeItemIndex=Array.from(this.accordionItems).indexOf(t),this.change()},this.handleItemKeyDown=e=>{if(e.target===e.currentTarget)switch(this.accordionIds=this.getItemIds(),e.key){case J:e.preventDefault(),this.adjust(-1);break;case X:e.preventDefault(),this.adjust(1);break;case ce:this.activeItemIndex=0,this.focusItem();break;case de:this.activeItemIndex=this.accordionItems.length-1,this.focusItem();break}},this.handleItemFocus=e=>{if(e.target===e.currentTarget){let t=e.target,i=this.activeItemIndex=Array.from(this.accordionItems).indexOf(t);this.activeItemIndex!==i&&i!==-1&&(this.activeItemIndex=i,this.activeid=this.accordionIds[this.activeItemIndex])}}}accordionItemsChanged(e,t){this.$fastController.isConnected&&(this.removeItemListeners(e),this.setItems())}findExpandedItem(){for(let e=0;e<this.accordionItems.length;e++)if(this.accordionItems[e].getAttribute("expanded")==="true")return this.accordionItems[e];return null}resetItems(){this.accordionItems.forEach((e,t)=>{e.expanded=!1})}getItemIds(){return this.accordionItems.map(e=>e.getAttribute("id"))}isSingleExpandMode(){return this.expandmode===_c.single}adjust(e){this.activeItemIndex=fc(0,this.accordionItems.length-1,this.activeItemIndex+e),this.focusItem()}focusItem(){let e=this.accordionItems[this.activeItemIndex];e instanceof yt&&e.expandbutton.focus()}};a([d({attribute:"expand-mode"})],Ui.prototype,"expandmode",void 0);a([m],Ui.prototype,"accordionItems",void 0)});var kc=c(()=>{Ql();wc()});var Sc,Pc=c(()=>{g();ve();Sc=(o,e)=>k`
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
        ${je(o,e)}
        <span class="content" part="content">
            <slot ${ee("defaultSlottedContent")}></slot>
        </span>
        ${Ue(o,e)}
    </a>
`});var F,Ko=c(()=>{S();g();F=class{};a([d({attribute:"aria-atomic"})],F.prototype,"ariaAtomic",void 0);a([d({attribute:"aria-busy"})],F.prototype,"ariaBusy",void 0);a([d({attribute:"aria-controls"})],F.prototype,"ariaControls",void 0);a([d({attribute:"aria-current"})],F.prototype,"ariaCurrent",void 0);a([d({attribute:"aria-describedby"})],F.prototype,"ariaDescribedby",void 0);a([d({attribute:"aria-details"})],F.prototype,"ariaDetails",void 0);a([d({attribute:"aria-disabled"})],F.prototype,"ariaDisabled",void 0);a([d({attribute:"aria-errormessage"})],F.prototype,"ariaErrormessage",void 0);a([d({attribute:"aria-flowto"})],F.prototype,"ariaFlowto",void 0);a([d({attribute:"aria-haspopup"})],F.prototype,"ariaHaspopup",void 0);a([d({attribute:"aria-hidden"})],F.prototype,"ariaHidden",void 0);a([d({attribute:"aria-invalid"})],F.prototype,"ariaInvalid",void 0);a([d({attribute:"aria-keyshortcuts"})],F.prototype,"ariaKeyshortcuts",void 0);a([d({attribute:"aria-label"})],F.prototype,"ariaLabel",void 0);a([d({attribute:"aria-labelledby"})],F.prototype,"ariaLabelledby",void 0);a([d({attribute:"aria-live"})],F.prototype,"ariaLive",void 0);a([d({attribute:"aria-owns"})],F.prototype,"ariaOwns",void 0);a([d({attribute:"aria-relevant"})],F.prototype,"ariaRelevant",void 0);a([d({attribute:"aria-roledescription"})],F.prototype,"ariaRoledescription",void 0)});var uo=c(()=>{Ko();ve()});var _e,ho,Vr=c(()=>{S();g();$();uo();fe();_e=class extends b{constructor(){super(...arguments),this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{var t;(t=this.control)===null||t===void 0||t.focus()})}}connectedCallback(){super.connectedCallback(),this.handleUnsupportedDelegatesFocus()}};a([d],_e.prototype,"download",void 0);a([d],_e.prototype,"href",void 0);a([d],_e.prototype,"hreflang",void 0);a([d],_e.prototype,"ping",void 0);a([d],_e.prototype,"referrerpolicy",void 0);a([d],_e.prototype,"rel",void 0);a([d],_e.prototype,"target",void 0);a([d],_e.prototype,"type",void 0);a([m],_e.prototype,"defaultSlottedContent",void 0);ho=class{};a([d({attribute:"aria-expanded"})],ho.prototype,"ariaExpanded",void 0);I(ho,F);I(_e,N,ho)});var $c=c(()=>{Pc();Vr()});var Tc=c(()=>{});var ze,jt=c(()=>{L();ze=o=>{let e=o.closest("[dir]");return e!==null&&e.dir==="rtl"?D.rtl:D.ltr}});var ji,Mc=c(()=>{g();ji=class{constructor(){this.intersectionDetector=null,this.observedElements=new Map,this.requestPosition=(e,t)=>{var i;if(this.intersectionDetector!==null){if(this.observedElements.has(e)){(i=this.observedElements.get(e))===null||i===void 0||i.push(t);return}this.observedElements.set(e,[t]),this.intersectionDetector.observe(e)}},this.cancelRequestPosition=(e,t)=>{let i=this.observedElements.get(e);if(i!==void 0){let s=i.indexOf(t);s!==-1&&i.splice(s,1)}},this.initializeIntersectionDetector=()=>{Ze.IntersectionObserver&&(this.intersectionDetector=new IntersectionObserver(this.handleIntersection,{root:null,rootMargin:"0px",threshold:[0,1]}))},this.handleIntersection=e=>{if(this.intersectionDetector===null)return;let t=[],i=[];e.forEach(s=>{var r;(r=this.intersectionDetector)===null||r===void 0||r.unobserve(s.target);let n=this.observedElements.get(s.target);n!==void 0&&(n.forEach(l=>{let p=t.indexOf(l);p===-1&&(p=t.length,t.push(l),i.push([])),i[p].push(s)}),this.observedElements.delete(s.target))}),t.forEach((s,r)=>{s(i[r])})},this.initializeIntersectionDetector()}}});var ie,Ic=c(()=>{S();g();L();$();jt();Mc();ie=class o extends b{constructor(){super(...arguments),this.anchor="",this.viewport="",this.horizontalPositioningMode="uncontrolled",this.horizontalDefaultPosition="unset",this.horizontalViewportLock=!1,this.horizontalInset=!1,this.horizontalScaling="content",this.verticalPositioningMode="uncontrolled",this.verticalDefaultPosition="unset",this.verticalViewportLock=!1,this.verticalInset=!1,this.verticalScaling="content",this.fixedPlacement=!1,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.initialLayoutComplete=!1,this.resizeDetector=null,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.pendingPositioningUpdate=!1,this.pendingReset=!1,this.currentDirection=D.ltr,this.regionVisible=!1,this.forceUpdate=!1,this.updateThreshold=.5,this.update=()=>{this.pendingPositioningUpdate||this.requestPositionUpdates()},this.startObservers=()=>{this.stopObservers(),this.anchorElement!==null&&(this.requestPositionUpdates(),this.resizeDetector!==null&&(this.resizeDetector.observe(this.anchorElement),this.resizeDetector.observe(this)))},this.requestPositionUpdates=()=>{this.anchorElement===null||this.pendingPositioningUpdate||(o.intersectionService.requestPosition(this,this.handleIntersection),o.intersectionService.requestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.requestPosition(this.viewportElement,this.handleIntersection),this.pendingPositioningUpdate=!0)},this.stopObservers=()=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,o.intersectionService.cancelRequestPosition(this,this.handleIntersection),this.anchorElement!==null&&o.intersectionService.cancelRequestPosition(this.anchorElement,this.handleIntersection),this.viewportElement!==null&&o.intersectionService.cancelRequestPosition(this.viewportElement,this.handleIntersection)),this.resizeDetector!==null&&this.resizeDetector.disconnect()},this.getViewport=()=>typeof this.viewport!="string"||this.viewport===""?document.documentElement:document.getElementById(this.viewport),this.getAnchor=()=>document.getElementById(this.anchor),this.handleIntersection=e=>{this.pendingPositioningUpdate&&(this.pendingPositioningUpdate=!1,this.applyIntersectionEntries(e)&&this.updateLayout())},this.applyIntersectionEntries=e=>{let t=e.find(r=>r.target===this),i=e.find(r=>r.target===this.anchorElement),s=e.find(r=>r.target===this.viewportElement);return t===void 0||s===void 0||i===void 0?!1:!this.regionVisible||this.forceUpdate||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0||this.isRectDifferent(this.anchorRect,i.boundingClientRect)||this.isRectDifferent(this.viewportRect,s.boundingClientRect)||this.isRectDifferent(this.regionRect,t.boundingClientRect)?(this.regionRect=t.boundingClientRect,this.anchorRect=i.boundingClientRect,this.viewportElement===document.documentElement?this.viewportRect=new DOMRectReadOnly(s.boundingClientRect.x+document.documentElement.scrollLeft,s.boundingClientRect.y+document.documentElement.scrollTop,s.boundingClientRect.width,s.boundingClientRect.height):this.viewportRect=s.boundingClientRect,this.updateRegionOffset(),this.forceUpdate=!1,!0):!1},this.updateRegionOffset=()=>{this.anchorRect&&this.regionRect&&(this.baseHorizontalOffset=this.baseHorizontalOffset+(this.anchorRect.left-this.regionRect.left)+(this.translateX-this.baseHorizontalOffset),this.baseVerticalOffset=this.baseVerticalOffset+(this.anchorRect.top-this.regionRect.top)+(this.translateY-this.baseVerticalOffset))},this.isRectDifferent=(e,t)=>Math.abs(e.top-t.top)>this.updateThreshold||Math.abs(e.right-t.right)>this.updateThreshold||Math.abs(e.bottom-t.bottom)>this.updateThreshold||Math.abs(e.left-t.left)>this.updateThreshold,this.handleResize=e=>{this.update()},this.reset=()=>{this.pendingReset&&(this.pendingReset=!1,this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.viewportElement===null&&(this.viewportElement=this.getViewport()),this.currentDirection=ze(this),this.startObservers())},this.updateLayout=()=>{let e,t;if(this.horizontalPositioningMode!=="uncontrolled"){let r=this.getPositioningOptions(this.horizontalInset);if(this.horizontalDefaultPosition==="center")t="center";else if(this.horizontalDefaultPosition!=="unset"){let v=this.horizontalDefaultPosition;if(v==="start"||v==="end"){let T=ze(this);if(T!==this.currentDirection){this.currentDirection=T,this.initialize();return}this.currentDirection===D.ltr?v=v==="start"?"left":"right":v=v==="start"?"right":"left"}switch(v){case"left":t=this.horizontalInset?"insetStart":"start";break;case"right":t=this.horizontalInset?"insetEnd":"end";break}}let n=this.horizontalThreshold!==void 0?this.horizontalThreshold:this.regionRect!==void 0?this.regionRect.width:0,l=this.anchorRect!==void 0?this.anchorRect.left:0,p=this.anchorRect!==void 0?this.anchorRect.right:0,h=this.anchorRect!==void 0?this.anchorRect.width:0,u=this.viewportRect!==void 0?this.viewportRect.left:0,f=this.viewportRect!==void 0?this.viewportRect.right:0;(t===void 0||this.horizontalPositioningMode!=="locktodefault"&&this.getAvailableSpace(t,l,p,h,u,f)<n)&&(t=this.getAvailableSpace(r[0],l,p,h,u,f)>this.getAvailableSpace(r[1],l,p,h,u,f)?r[0]:r[1])}if(this.verticalPositioningMode!=="uncontrolled"){let r=this.getPositioningOptions(this.verticalInset);if(this.verticalDefaultPosition==="center")e="center";else if(this.verticalDefaultPosition!=="unset")switch(this.verticalDefaultPosition){case"top":e=this.verticalInset?"insetStart":"start";break;case"bottom":e=this.verticalInset?"insetEnd":"end";break}let n=this.verticalThreshold!==void 0?this.verticalThreshold:this.regionRect!==void 0?this.regionRect.height:0,l=this.anchorRect!==void 0?this.anchorRect.top:0,p=this.anchorRect!==void 0?this.anchorRect.bottom:0,h=this.anchorRect!==void 0?this.anchorRect.height:0,u=this.viewportRect!==void 0?this.viewportRect.top:0,f=this.viewportRect!==void 0?this.viewportRect.bottom:0;(e===void 0||this.verticalPositioningMode!=="locktodefault"&&this.getAvailableSpace(e,l,p,h,u,f)<n)&&(e=this.getAvailableSpace(r[0],l,p,h,u,f)>this.getAvailableSpace(r[1],l,p,h,u,f)?r[0]:r[1])}let i=this.getNextRegionDimension(t,e),s=this.horizontalPosition!==t||this.verticalPosition!==e;if(this.setHorizontalPosition(t,i),this.setVerticalPosition(e,i),this.updateRegionStyle(),!this.initialLayoutComplete){this.initialLayoutComplete=!0,this.requestPositionUpdates();return}this.regionVisible||(this.regionVisible=!0,this.style.removeProperty("pointer-events"),this.style.removeProperty("opacity"),this.classList.toggle("loaded",!0),this.$emit("loaded",this,{bubbles:!1})),this.updatePositionClasses(),s&&this.$emit("positionchange",this,{bubbles:!1})},this.updateRegionStyle=()=>{this.style.width=this.regionWidth,this.style.height=this.regionHeight,this.style.transform=`translate(${this.translateX}px, ${this.translateY}px)`},this.updatePositionClasses=()=>{this.classList.toggle("top",this.verticalPosition==="start"),this.classList.toggle("bottom",this.verticalPosition==="end"),this.classList.toggle("inset-top",this.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.verticalPosition==="insetEnd"),this.classList.toggle("vertical-center",this.verticalPosition==="center"),this.classList.toggle("left",this.horizontalPosition==="start"),this.classList.toggle("right",this.horizontalPosition==="end"),this.classList.toggle("inset-left",this.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.horizontalPosition==="insetEnd"),this.classList.toggle("horizontal-center",this.horizontalPosition==="center")},this.setHorizontalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.horizontalScaling){case"anchor":case"fill":i=this.horizontalViewportLock?this.viewportRect.width:t.width,this.regionWidth=`${i}px`;break;case"content":i=this.regionRect.width,this.regionWidth="unset";break}let s=0;switch(e){case"start":this.translateX=this.baseHorizontalOffset-i,this.horizontalViewportLock&&this.anchorRect.left>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.right));break;case"insetStart":this.translateX=this.baseHorizontalOffset-i+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right>this.viewportRect.right&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.right));break;case"insetEnd":this.translateX=this.baseHorizontalOffset,this.horizontalViewportLock&&this.anchorRect.left<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.left-this.viewportRect.left));break;case"end":this.translateX=this.baseHorizontalOffset+this.anchorRect.width,this.horizontalViewportLock&&this.anchorRect.right<this.viewportRect.left&&(this.translateX=this.translateX-(this.anchorRect.right-this.viewportRect.left));break;case"center":if(s=(this.anchorRect.width-i)/2,this.translateX=this.baseHorizontalOffset+s,this.horizontalViewportLock){let r=this.anchorRect.left+s,n=this.anchorRect.right-s;r<this.viewportRect.left&&!(n>this.viewportRect.right)?this.translateX=this.translateX-(r-this.viewportRect.left):n>this.viewportRect.right&&!(r<this.viewportRect.left)&&(this.translateX=this.translateX-(n-this.viewportRect.right))}break}this.horizontalPosition=e},this.setVerticalPosition=(e,t)=>{if(e===void 0||this.regionRect===void 0||this.anchorRect===void 0||this.viewportRect===void 0)return;let i=0;switch(this.verticalScaling){case"anchor":case"fill":i=this.verticalViewportLock?this.viewportRect.height:t.height,this.regionHeight=`${i}px`;break;case"content":i=this.regionRect.height,this.regionHeight="unset";break}let s=0;switch(e){case"start":this.translateY=this.baseVerticalOffset-i,this.verticalViewportLock&&this.anchorRect.top>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.bottom));break;case"insetStart":this.translateY=this.baseVerticalOffset-i+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom>this.viewportRect.bottom&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.bottom));break;case"insetEnd":this.translateY=this.baseVerticalOffset,this.verticalViewportLock&&this.anchorRect.top<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.top-this.viewportRect.top));break;case"end":this.translateY=this.baseVerticalOffset+this.anchorRect.height,this.verticalViewportLock&&this.anchorRect.bottom<this.viewportRect.top&&(this.translateY=this.translateY-(this.anchorRect.bottom-this.viewportRect.top));break;case"center":if(s=(this.anchorRect.height-i)/2,this.translateY=this.baseVerticalOffset+s,this.verticalViewportLock){let r=this.anchorRect.top+s,n=this.anchorRect.bottom-s;r<this.viewportRect.top&&!(n>this.viewportRect.bottom)?this.translateY=this.translateY-(r-this.viewportRect.top):n>this.viewportRect.bottom&&!(r<this.viewportRect.top)&&(this.translateY=this.translateY-(n-this.viewportRect.bottom))}}this.verticalPosition=e},this.getPositioningOptions=e=>e?["insetStart","insetEnd"]:["start","end"],this.getAvailableSpace=(e,t,i,s,r,n)=>{let l=t-r,p=n-(t+s);switch(e){case"start":return l;case"insetStart":return l+s;case"insetEnd":return p+s;case"end":return p;case"center":return Math.min(l,p)*2+s}},this.getNextRegionDimension=(e,t)=>{let i={height:this.regionRect!==void 0?this.regionRect.height:0,width:this.regionRect!==void 0?this.regionRect.width:0};return e!==void 0&&this.horizontalScaling==="fill"?i.width=this.getAvailableSpace(e,this.anchorRect!==void 0?this.anchorRect.left:0,this.anchorRect!==void 0?this.anchorRect.right:0,this.anchorRect!==void 0?this.anchorRect.width:0,this.viewportRect!==void 0?this.viewportRect.left:0,this.viewportRect!==void 0?this.viewportRect.right:0):this.horizontalScaling==="anchor"&&(i.width=this.anchorRect!==void 0?this.anchorRect.width:0),t!==void 0&&this.verticalScaling==="fill"?i.height=this.getAvailableSpace(t,this.anchorRect!==void 0?this.anchorRect.top:0,this.anchorRect!==void 0?this.anchorRect.bottom:0,this.anchorRect!==void 0?this.anchorRect.height:0,this.viewportRect!==void 0?this.viewportRect.top:0,this.viewportRect!==void 0?this.viewportRect.bottom:0):this.verticalScaling==="anchor"&&(i.height=this.anchorRect!==void 0?this.anchorRect.height:0),i},this.startAutoUpdateEventListeners=()=>{window.addEventListener(Br,this.update,{passive:!0}),window.addEventListener(Nr,this.update,{passive:!0,capture:!0}),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.observe(this.viewportElement)},this.stopAutoUpdateEventListeners=()=>{window.removeEventListener(Br,this.update),window.removeEventListener(Nr,this.update),this.resizeDetector!==null&&this.viewportElement!==null&&this.resizeDetector.unobserve(this.viewportElement)}}anchorChanged(){this.initialLayoutComplete&&(this.anchorElement=this.getAnchor())}viewportChanged(){this.initialLayoutComplete&&(this.viewportElement=this.getViewport())}horizontalPositioningModeChanged(){this.requestReset()}horizontalDefaultPositionChanged(){this.updateForAttributeChange()}horizontalViewportLockChanged(){this.updateForAttributeChange()}horizontalInsetChanged(){this.updateForAttributeChange()}horizontalThresholdChanged(){this.updateForAttributeChange()}horizontalScalingChanged(){this.updateForAttributeChange()}verticalPositioningModeChanged(){this.requestReset()}verticalDefaultPositionChanged(){this.updateForAttributeChange()}verticalViewportLockChanged(){this.updateForAttributeChange()}verticalInsetChanged(){this.updateForAttributeChange()}verticalThresholdChanged(){this.updateForAttributeChange()}verticalScalingChanged(){this.updateForAttributeChange()}fixedPlacementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}autoUpdateModeChanged(e,t){this.$fastController.isConnected&&this.initialLayoutComplete&&(e==="auto"&&this.stopAutoUpdateEventListeners(),t==="auto"&&this.startAutoUpdateEventListeners())}anchorElementChanged(){this.requestReset()}viewportElementChanged(){this.$fastController.isConnected&&this.initialLayoutComplete&&this.initialize()}connectedCallback(){super.connectedCallback(),this.autoUpdateMode==="auto"&&this.startAutoUpdateEventListeners(),this.initialize()}disconnectedCallback(){super.disconnectedCallback(),this.autoUpdateMode==="auto"&&this.stopAutoUpdateEventListeners(),this.stopObservers(),this.disconnectResizeDetector()}adoptedCallback(){this.initialize()}disconnectResizeDetector(){this.resizeDetector!==null&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.handleResize)}updateForAttributeChange(){this.$fastController.isConnected&&this.initialLayoutComplete&&(this.forceUpdate=!0,this.update())}initialize(){this.initializeResizeDetector(),this.anchorElement===null&&(this.anchorElement=this.getAnchor()),this.requestReset()}requestReset(){this.$fastController.isConnected&&this.pendingReset===!1&&(this.setInitialState(),y.queueUpdate(()=>this.reset()),this.pendingReset=!0)}setInitialState(){this.initialLayoutComplete=!1,this.regionVisible=!1,this.translateX=0,this.translateY=0,this.baseHorizontalOffset=0,this.baseVerticalOffset=0,this.viewportRect=void 0,this.regionRect=void 0,this.anchorRect=void 0,this.verticalPosition=void 0,this.horizontalPosition=void 0,this.style.opacity="0",this.style.pointerEvents="none",this.forceUpdate=!1,this.style.position=this.fixedPlacement?"fixed":"absolute",this.updatePositionClasses(),this.updateRegionStyle()}};ie.intersectionService=new ji;a([d],ie.prototype,"anchor",void 0);a([d],ie.prototype,"viewport",void 0);a([d({attribute:"horizontal-positioning-mode"})],ie.prototype,"horizontalPositioningMode",void 0);a([d({attribute:"horizontal-default-position"})],ie.prototype,"horizontalDefaultPosition",void 0);a([d({attribute:"horizontal-viewport-lock",mode:"boolean"})],ie.prototype,"horizontalViewportLock",void 0);a([d({attribute:"horizontal-inset",mode:"boolean"})],ie.prototype,"horizontalInset",void 0);a([d({attribute:"horizontal-threshold"})],ie.prototype,"horizontalThreshold",void 0);a([d({attribute:"horizontal-scaling"})],ie.prototype,"horizontalScaling",void 0);a([d({attribute:"vertical-positioning-mode"})],ie.prototype,"verticalPositioningMode",void 0);a([d({attribute:"vertical-default-position"})],ie.prototype,"verticalDefaultPosition",void 0);a([d({attribute:"vertical-viewport-lock",mode:"boolean"})],ie.prototype,"verticalViewportLock",void 0);a([d({attribute:"vertical-inset",mode:"boolean"})],ie.prototype,"verticalInset",void 0);a([d({attribute:"vertical-threshold"})],ie.prototype,"verticalThreshold",void 0);a([d({attribute:"vertical-scaling"})],ie.prototype,"verticalScaling",void 0);a([d({attribute:"fixed-placement",mode:"boolean"})],ie.prototype,"fixedPlacement",void 0);a([d({attribute:"auto-update-mode"})],ie.prototype,"autoUpdateMode",void 0);a([m],ie.prototype,"anchorElement",void 0);a([m],ie.prototype,"viewportElement",void 0);a([m],ie.prototype,"initialLayoutComplete",void 0)});var qr,Ur,jr,Wr,Rc,Qr,Ac,Ec=c(()=>{qr={horizontalDefaultPosition:"center",horizontalPositioningMode:"locktodefault",horizontalInset:!1,horizontalScaling:"anchor"},Ur=Object.assign(Object.assign({},qr),{verticalDefaultPosition:"top",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),jr=Object.assign(Object.assign({},qr),{verticalDefaultPosition:"bottom",verticalPositioningMode:"locktodefault",verticalInset:!1,verticalScaling:"content"}),Wr=Object.assign(Object.assign({},qr),{verticalPositioningMode:"dynamic",verticalInset:!1,verticalScaling:"content"}),Rc=Object.assign(Object.assign({},Ur),{verticalScaling:"fill"}),Qr=Object.assign(Object.assign({},jr),{verticalScaling:"fill"}),Ac=Object.assign(Object.assign({},Wr),{verticalScaling:"fill"})});var Yr=c(()=>{Tc();Ic();Ec()});var Dc=c(()=>{});var Mo,Lc=c(()=>{S();g();$();Mo=class extends b{connectedCallback(){super.connectedCallback(),this.shape||(this.shape="circle")}};a([d],Mo.prototype,"fill",void 0);a([d],Mo.prototype,"color",void 0);a([d],Mo.prototype,"link",void 0);a([d],Mo.prototype,"shape",void 0)});var Fc=c(()=>{Dc();Lc()});var Wi,Oc=c(()=>{g();Wi=(o,e)=>k`
    <template class="${t=>t.circular?"circular":""}">
        <div class="control" part="control" style="${t=>t.generateBadgeStyle()}">
            <slot></slot>
        </div>
    </template>
`});var _t,zc=c(()=>{S();g();$();_t=class extends b{constructor(){super(...arguments),this.generateBadgeStyle=()=>{if(!this.fill&&!this.color)return;let e=`background-color: var(--badge-fill-${this.fill});`,t=`color: var(--badge-color-${this.color});`;return this.fill&&!this.color?e:this.color&&!this.fill?t:`${t} ${e}`}}};a([d({attribute:"fill"})],_t.prototype,"fill",void 0);a([d({attribute:"color"})],_t.prototype,"color",void 0);a([d({mode:"boolean"})],_t.prototype,"circular",void 0)});var Hc=c(()=>{Oc();zc()});var Bc=c(()=>{});var mo,Xr=c(()=>{S();g();Vr();uo();fe();mo=class extends _e{constructor(){super(...arguments),this.separator=!0}};a([m],mo.prototype,"separator",void 0);I(mo,N,ho)});var Nc=c(()=>{Bc();Xr()});var Gc=c(()=>{});var Jr,Vc=c(()=>{S();g();Xr();$();Jr=class extends b{slottedBreadcrumbItemsChanged(){if(this.$fastController.isConnected){if(this.slottedBreadcrumbItems===void 0||this.slottedBreadcrumbItems.length===0)return;let e=this.slottedBreadcrumbItems[this.slottedBreadcrumbItems.length-1];this.slottedBreadcrumbItems.forEach(t=>{let i=t===e;this.setItemSeparator(t,i),this.setAriaCurrent(t,i)})}}setItemSeparator(e,t){e instanceof mo&&(e.separator=!t)}findChildWithHref(e){var t,i;return e.childElementCount>0?e.querySelector("a[href]"):!((t=e.shadowRoot)===null||t===void 0)&&t.childElementCount?(i=e.shadowRoot)===null||i===void 0?void 0:i.querySelector("a[href]"):null}setAriaCurrent(e,t){let i=this.findChildWithHref(e);i===null&&e.hasAttribute("href")&&e instanceof mo?t?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current"):i!==null&&(t?i.setAttribute("aria-current","page"):i.removeAttribute("aria-current"))}};a([m],Jr.prototype,"slottedBreadcrumbItems",void 0)});var qc=c(()=>{Gc();Vc()});var Uc,jc=c(()=>{g();ve();Uc=(o,e)=>k`
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
        ${je(o,e)}
        <span class="content" part="content">
            <slot ${ee("defaultSlottedContent")}></slot>
        </span>
        ${Ue(o,e)}
    </button>
`});function ue(o){let e=class extends o{constructor(...t){super(...t),this.dirtyValue=!1,this.disabled=!1,this.proxyEventsToBlock=["change","click"],this.proxyInitialized=!1,this.required=!1,this.initialValue=this.initialValue||"",this.elementInternals||(this.formResetCallback=this.formResetCallback.bind(this))}static get formAssociated(){return Yc}get validity(){return this.elementInternals?this.elementInternals.validity:this.proxy.validity}get form(){return this.elementInternals?this.elementInternals.form:this.proxy.form}get validationMessage(){return this.elementInternals?this.elementInternals.validationMessage:this.proxy.validationMessage}get willValidate(){return this.elementInternals?this.elementInternals.willValidate:this.proxy.willValidate}get labels(){if(this.elementInternals)return Object.freeze(Array.from(this.elementInternals.labels));if(this.proxy instanceof HTMLElement&&this.proxy.ownerDocument&&this.id){let t=this.proxy.labels,i=Array.from(this.proxy.getRootNode().querySelectorAll(`[for='${this.id}']`)),s=t?i.concat(Array.from(t)):i;return Object.freeze(s)}else return Ge}valueChanged(t,i){this.dirtyValue=!0,this.proxy instanceof HTMLElement&&(this.proxy.value=this.value),this.currentValue=this.value,this.setFormValue(this.value),this.validate()}currentValueChanged(){this.value=this.currentValue}initialValueChanged(t,i){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}disabledChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.disabled=this.disabled),y.queueUpdate(()=>this.classList.toggle("disabled",this.disabled))}nameChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.name=this.name)}requiredChanged(t,i){this.proxy instanceof HTMLElement&&(this.proxy.required=this.required),y.queueUpdate(()=>this.classList.toggle("required",this.required)),this.validate()}get elementInternals(){if(!Yc)return null;let t=Xc.get(this);return t||(t=this.attachInternals(),Xc.set(this,t)),t}connectedCallback(){super.connectedCallback(),this.addEventListener("keypress",this._keypressHandler),this.value||(this.value=this.initialValue,this.dirtyValue=!1),this.elementInternals||(this.attachProxy(),this.form&&this.form.addEventListener("reset",this.formResetCallback))}disconnectedCallback(){super.disconnectedCallback(),this.proxyEventsToBlock.forEach(t=>this.proxy.removeEventListener(t,this.stopPropagation)),!this.elementInternals&&this.form&&this.form.removeEventListener("reset",this.formResetCallback)}checkValidity(){return this.elementInternals?this.elementInternals.checkValidity():this.proxy.checkValidity()}reportValidity(){return this.elementInternals?this.elementInternals.reportValidity():this.proxy.reportValidity()}setValidity(t,i,s){this.elementInternals?this.elementInternals.setValidity(t,i,s):typeof i=="string"&&this.proxy.setCustomValidity(i)}formDisabledCallback(t){this.disabled=t}formResetCallback(){this.value=this.initialValue,this.dirtyValue=!1}attachProxy(){var t;this.proxyInitialized||(this.proxyInitialized=!0,this.proxy.style.display="none",this.proxyEventsToBlock.forEach(i=>this.proxy.addEventListener(i,this.stopPropagation)),this.proxy.disabled=this.disabled,this.proxy.required=this.required,typeof this.name=="string"&&(this.proxy.name=this.name),typeof this.value=="string"&&(this.proxy.value=this.value),this.proxy.setAttribute("slot",Wc),this.proxySlot=document.createElement("slot"),this.proxySlot.setAttribute("name",Wc)),(t=this.shadowRoot)===null||t===void 0||t.appendChild(this.proxySlot),this.appendChild(this.proxy)}detachProxy(){var t;this.removeChild(this.proxy),(t=this.shadowRoot)===null||t===void 0||t.removeChild(this.proxySlot)}validate(t){this.proxy instanceof HTMLElement&&this.setValidity(this.proxy.validity,this.proxy.validationMessage,t)}setFormValue(t,i){this.elementInternals&&this.elementInternals.setFormValue(t,i||t)}_keypressHandler(t){switch(t.key){case oe:if(this.form instanceof HTMLFormElement){let i=this.form.querySelector("[type=submit]");i?.click()}break}}stopPropagation(t){t.stopPropagation()}};return d({mode:"boolean"})(e.prototype,"disabled"),d({mode:"fromView",attribute:"value"})(e.prototype,"initialValue"),d({attribute:"current-value"})(e.prototype,"currentValue"),d(e.prototype,"name"),d({mode:"boolean"})(e.prototype,"required"),m(e.prototype,"value"),e}function Io(o){class e extends ue(o){}class t extends e{constructor(...s){super(s),this.dirtyChecked=!1,this.checkedAttribute=!1,this.checked=!1,this.dirtyChecked=!1}checkedAttributeChanged(){this.defaultChecked=this.checkedAttribute}defaultCheckedChanged(){this.dirtyChecked||(this.checked=this.defaultChecked,this.dirtyChecked=!1)}checkedChanged(s,r){this.dirtyChecked||(this.dirtyChecked=!0),this.currentChecked=this.checked,this.updateForm(),this.proxy instanceof HTMLInputElement&&(this.proxy.checked=this.checked),s!==void 0&&this.$emit("change"),this.validate()}currentCheckedChanged(s,r){this.checked=this.currentChecked}updateForm(){let s=this.checked?this.value:null;this.setFormValue(s,s)}connectedCallback(){super.connectedCallback(),this.updateForm()}formResetCallback(){super.formResetCallback(),this.checked=!!this.checkedAttribute,this.dirtyChecked=!1}}return d({attribute:"checked",mode:"boolean"})(t.prototype,"checkedAttribute"),d({attribute:"current-checked",converter:ro})(t.prototype,"currentChecked"),m(t.prototype,"defaultChecked"),m(t.prototype,"checked"),t}var Wc,Qc,Yc,Xc,Ae=c(()=>{g();L();Wc="form-associated-proxy",Qc="ElementInternals",Yc=Qc in window&&"setFormValue"in window[Qc].prototype,Xc=new WeakMap});var Zr,Qi,Jc=c(()=>{Ae();$();Zr=class extends b{},Qi=class extends ue(Zr){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Ee,Ro,Zc=c(()=>{S();g();uo();fe();Jc();Ee=class extends Qi{constructor(){super(...arguments),this.handleClick=e=>{var t;this.disabled&&((t=this.defaultSlottedContent)===null||t===void 0?void 0:t.length)<=1&&e.stopPropagation()},this.handleSubmission=()=>{if(!this.form)return;let e=this.proxy.isConnected;e||this.attachProxy(),typeof this.form.requestSubmit=="function"?this.form.requestSubmit(this.proxy):this.proxy.click(),e||this.detachProxy()},this.handleFormReset=()=>{var e;(e=this.form)===null||e===void 0||e.reset()},this.handleUnsupportedDelegatesFocus=()=>{var e;window.ShadowRoot&&!window.ShadowRoot.prototype.hasOwnProperty("delegatesFocus")&&(!((e=this.$fastController.definition.shadowOptions)===null||e===void 0)&&e.delegatesFocus)&&(this.focus=()=>{this.control.focus()})}}formactionChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formAction=this.formaction)}formenctypeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formEnctype=this.formenctype)}formmethodChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formMethod=this.formmethod)}formnovalidateChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formNoValidate=this.formnovalidate)}formtargetChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.formTarget=this.formtarget)}typeChanged(e,t){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type),t==="submit"&&this.addEventListener("click",this.handleSubmission),e==="submit"&&this.removeEventListener("click",this.handleSubmission),t==="reset"&&this.addEventListener("click",this.handleFormReset),e==="reset"&&this.removeEventListener("click",this.handleFormReset)}validate(){super.validate(this.control)}connectedCallback(){var e;super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.handleUnsupportedDelegatesFocus();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.addEventListener("click",this.handleClick)})}disconnectedCallback(){var e;super.disconnectedCallback();let t=Array.from((e=this.control)===null||e===void 0?void 0:e.children);t&&t.forEach(i=>{i.removeEventListener("click",this.handleClick)})}};a([d({mode:"boolean"})],Ee.prototype,"autofocus",void 0);a([d({attribute:"form"})],Ee.prototype,"formId",void 0);a([d],Ee.prototype,"formaction",void 0);a([d],Ee.prototype,"formenctype",void 0);a([d],Ee.prototype,"formmethod",void 0);a([d({mode:"boolean"})],Ee.prototype,"formnovalidate",void 0);a([d],Ee.prototype,"formtarget",void 0);a([d],Ee.prototype,"type",void 0);a([m],Ee.prototype,"defaultSlottedContent",void 0);Ro=class{};a([d({attribute:"aria-expanded"})],Ro.prototype,"ariaExpanded",void 0);a([d({attribute:"aria-pressed"})],Ro.prototype,"ariaPressed",void 0);I(Ro,F);I(Ee,N,Ro)});var Kc=c(()=>{jc();Zc()});var Yi,Kr=c(()=>{Yi=class{constructor(e){if(this.dayFormat="numeric",this.weekdayFormat="long",this.monthFormat="long",this.yearFormat="numeric",this.date=new Date,e)for(let t in e){let i=e[t];t==="date"?this.date=this.getDateObject(i):this[t]=i}}getDateObject(e){if(typeof e=="string"){let t=e.split(/[/-]/);return t.length<3?new Date:new Date(parseInt(t[2],10),parseInt(t[0],10)-1,parseInt(t[1],10))}else if("day"in e&&"month"in e&&"year"in e){let{day:t,month:i,year:s}=e;return new Date(s,i-1,t)}return e}getDate(e=this.date,t={weekday:this.weekdayFormat,month:this.monthFormat,day:this.dayFormat,year:this.yearFormat},i=this.locale){let s=this.getDateObject(e);if(!s.getTime())return"";let r=Object.assign({timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone},t);return new Intl.DateTimeFormat(i,r).format(s)}getDay(e=this.date.getDate(),t=this.dayFormat,i=this.locale){return this.getDate({month:1,day:e,year:2020},{day:t},i)}getMonth(e=this.date.getMonth()+1,t=this.monthFormat,i=this.locale){return this.getDate({month:e,day:2,year:2020},{month:t},i)}getYear(e=this.date.getFullYear(),t=this.yearFormat,i=this.locale){return this.getDate({month:2,day:2,year:e},{year:t},i)}getWeekday(e=0,t=this.weekdayFormat,i=this.locale){let s=`1-${e+1}-2017`;return this.getDate(s,{weekday:t},i)}getWeekdays(e=this.weekdayFormat,t=this.locale){return Array(7).fill(null).map((i,s)=>this.getWeekday(s,e,t))}}});var He,ed=c(()=>{S();g();L();$();Kr();He=class extends b{constructor(){super(...arguments),this.dateFormatter=new Yi,this.readonly=!1,this.locale="en-US",this.month=new Date().getMonth()+1,this.year=new Date().getFullYear(),this.dayFormat="numeric",this.weekdayFormat="short",this.monthFormat="long",this.yearFormat="numeric",this.minWeeks=0,this.disabledDates="",this.selectedDates="",this.oneDayInMs=864e5}localeChanged(){this.dateFormatter.locale=this.locale}dayFormatChanged(){this.dateFormatter.dayFormat=this.dayFormat}weekdayFormatChanged(){this.dateFormatter.weekdayFormat=this.weekdayFormat}monthFormatChanged(){this.dateFormatter.monthFormat=this.monthFormat}yearFormatChanged(){this.dateFormatter.yearFormat=this.yearFormat}getMonthInfo(e=this.month,t=this.year){let i=p=>new Date(p.getFullYear(),p.getMonth(),1).getDay(),s=p=>{let h=new Date(p.getFullYear(),p.getMonth()+1,1);return new Date(h.getTime()-this.oneDayInMs).getDate()},r=new Date(t,e-1),n=new Date(t,e),l=new Date(t,e-2);return{length:s(r),month:e,start:i(r),year:t,previous:{length:s(l),month:l.getMonth()+1,start:i(l),year:l.getFullYear()},next:{length:s(n),month:n.getMonth()+1,start:i(n),year:n.getFullYear()}}}getDays(e=this.getMonthInfo(),t=this.minWeeks){t=t>10?10:t;let{start:i,length:s,previous:r,next:n}=e,l=[],p=1-i;for(;p<s+1||l.length<t||l[l.length-1].length%7!==0;){let{month:h,year:u}=p<1?r:p>s?n:e,f=p<1?r.length+p:p>s?p-s:p,v=`${h}-${f}-${u}`,T=this.dateInString(v,this.disabledDates),A=this.dateInString(v,this.selectedDates),te={day:f,month:h,year:u,disabled:T,selected:A},le=l[l.length-1];l.length===0||le.length%7===0?l.push([te]):le.push(te),p++}return l}dateInString(e,t){let i=t.split(",").map(s=>s.trim());return e=typeof e=="string"?e:`${e.getMonth()+1}-${e.getDate()}-${e.getFullYear()}`,i.some(s=>s===e)}getDayClassNames(e,t){let{day:i,month:s,year:r,disabled:n,selected:l}=e,p=t===`${s}-${i}-${r}`,h=this.month!==s;return["day",p&&"today",h&&"inactive",n&&"disabled",l&&"selected"].filter(Boolean).join(" ")}getWeekdayText(){let e=this.dateFormatter.getWeekdays().map(t=>({text:t}));if(this.weekdayFormat!=="long"){let t=this.dateFormatter.getWeekdays("long");e.forEach((i,s)=>{i.abbr=t[s]})}return e}handleDateSelect(e,t){e.preventDefault,this.$emit("dateselected",t)}handleKeydown(e,t){return e.key===oe&&this.handleDateSelect(e,t),!0}};a([d({mode:"boolean"})],He.prototype,"readonly",void 0);a([d],He.prototype,"locale",void 0);a([d({converter:E})],He.prototype,"month",void 0);a([d({converter:E})],He.prototype,"year",void 0);a([d({attribute:"day-format",mode:"fromView"})],He.prototype,"dayFormat",void 0);a([d({attribute:"weekday-format",mode:"fromView"})],He.prototype,"weekdayFormat",void 0);a([d({attribute:"month-format",mode:"fromView"})],He.prototype,"monthFormat",void 0);a([d({attribute:"year-format",mode:"fromView"})],He.prototype,"yearFormat",void 0);a([d({attribute:"min-weeks",converter:E})],He.prototype,"minWeeks",void 0);a([d({attribute:"disabled-dates"})],He.prototype,"disabledDates",void 0);a([d({attribute:"selected-dates"})],He.prototype,"selectedDates",void 0)});var fo,Ke,wt,Xi=c(()=>{fo={none:"none",default:"default",sticky:"sticky"},Ke={default:"default",columnHeader:"columnheader",rowHeader:"rowheader"},wt={default:"default",header:"header",stickyHeader:"sticky-header"}});var pe,en=c(()=>{S();g();L();$();Xi();pe=class extends b{constructor(){super(...arguments),this.rowType=wt.default,this.rowData=null,this.columnDefinitions=null,this.isActiveRow=!1,this.cellsRepeatBehavior=null,this.cellsPlaceholder=null,this.focusColumnIndex=0,this.refocusOnLoad=!1,this.updateRowStyle=()=>{this.style.gridTemplateColumns=this.gridTemplateColumns}}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowStyle()}rowTypeChanged(){this.$fastController.isConnected&&this.updateItemTemplate()}rowDataChanged(){if(this.rowData!==null&&this.isActiveRow){this.refocusOnLoad=!0;return}}cellItemTemplateChanged(){this.updateItemTemplate()}headerCellItemTemplateChanged(){this.updateItemTemplate()}connectedCallback(){super.connectedCallback(),this.cellsRepeatBehavior===null&&(this.cellsPlaceholder=document.createComment(""),this.appendChild(this.cellsPlaceholder),this.updateItemTemplate(),this.cellsRepeatBehavior=new vt(e=>e.columnDefinitions,e=>e.activeCellItemTemplate,{positioning:!0}).createBehavior(this.cellsPlaceholder),this.$fastController.addBehaviors([this.cellsRepeatBehavior])),this.addEventListener("cell-focused",this.handleCellFocus),this.addEventListener(xt,this.handleFocusout),this.addEventListener(Ct,this.handleKeydown),this.updateRowStyle(),this.refocusOnLoad&&(this.refocusOnLoad=!1,this.cellElements.length>this.focusColumnIndex&&this.cellElements[this.focusColumnIndex].focus())}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("cell-focused",this.handleCellFocus),this.removeEventListener(xt,this.handleFocusout),this.removeEventListener(Ct,this.handleKeydown)}handleFocusout(e){this.contains(e.target)||(this.isActiveRow=!1,this.focusColumnIndex=0)}handleCellFocus(e){this.isActiveRow=!0,this.focusColumnIndex=this.cellElements.indexOf(e.target),this.$emit("row-focused",this)}handleKeydown(e){if(e.defaultPrevented)return;let t=0;switch(e.key){case xe:t=Math.max(0,this.focusColumnIndex-1),this.cellElements[t].focus(),e.preventDefault();break;case Ce:t=Math.min(this.cellElements.length-1,this.focusColumnIndex+1),this.cellElements[t].focus(),e.preventDefault();break;case ce:e.ctrlKey||(this.cellElements[0].focus(),e.preventDefault());break;case de:e.ctrlKey||(this.cellElements[this.cellElements.length-1].focus(),e.preventDefault());break}}updateItemTemplate(){this.activeCellItemTemplate=this.rowType===wt.default&&this.cellItemTemplate!==void 0?this.cellItemTemplate:this.rowType===wt.default&&this.cellItemTemplate===void 0?this.defaultCellItemTemplate:this.headerCellItemTemplate!==void 0?this.headerCellItemTemplate:this.defaultHeaderCellItemTemplate}};a([d({attribute:"grid-template-columns"})],pe.prototype,"gridTemplateColumns",void 0);a([d({attribute:"row-type"})],pe.prototype,"rowType",void 0);a([m],pe.prototype,"rowData",void 0);a([m],pe.prototype,"columnDefinitions",void 0);a([m],pe.prototype,"cellItemTemplate",void 0);a([m],pe.prototype,"headerCellItemTemplate",void 0);a([m],pe.prototype,"rowIndex",void 0);a([m],pe.prototype,"isActiveRow",void 0);a([m],pe.prototype,"activeCellItemTemplate",void 0);a([m],pe.prototype,"defaultCellItemTemplate",void 0);a([m],pe.prototype,"defaultHeaderCellItemTemplate",void 0);a([m],pe.prototype,"cellElements",void 0)});function Of(o){let e=o.tagFor(pe);return k`
    <${e}
        :rowData="${t=>t}"
        :cellItemTemplate="${(t,i)=>i.parent.cellItemTemplate}"
        :headerCellItemTemplate="${(t,i)=>i.parent.headerCellItemTemplate}"
    ></${e}>
`}var td,od=c(()=>{g();en();td=(o,e)=>{let t=Of(o),i=o.tagFor(pe);return k`
        <template
            role="grid"
            tabindex="0"
            :rowElementTag="${()=>i}"
            :defaultRowItemTemplate="${t}"
            ${Di({property:"rowElements",filter:lo("[role=row]")})}
        >
            <slot></slot>
        </template>
    `}});var he,id=c(()=>{S();g();L();$();Xi();he=class o extends b{constructor(){super(),this.noTabbing=!1,this.generateHeader=fo.default,this.rowsData=[],this.columnDefinitions=null,this.focusRowIndex=0,this.focusColumnIndex=0,this.rowsPlaceholder=null,this.generatedHeader=null,this.isUpdatingFocus=!1,this.pendingFocusUpdate=!1,this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!0,this.generatedGridTemplateColumns="",this.focusOnCell=(e,t,i)=>{if(this.rowElements.length===0){this.focusRowIndex=0,this.focusColumnIndex=0;return}let s=Math.max(0,Math.min(this.rowElements.length-1,e)),n=this.rowElements[s].querySelectorAll('[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'),l=Math.max(0,Math.min(n.length-1,t)),p=n[l];i&&this.scrollHeight!==this.clientHeight&&(s<this.focusRowIndex&&this.scrollTop>0||s>this.focusRowIndex&&this.scrollTop<this.scrollHeight-this.clientHeight)&&p.scrollIntoView({block:"center",inline:"center"}),p.focus()},this.onChildListChange=(e,t)=>{e&&e.length&&(e.forEach(i=>{i.addedNodes.forEach(s=>{s.nodeType===1&&s.getAttribute("role")==="row"&&(s.columnDefinitions=this.columnDefinitions)})}),this.queueRowIndexUpdate())},this.queueRowIndexUpdate=()=>{this.rowindexUpdateQueued||(this.rowindexUpdateQueued=!0,y.queueUpdate(this.updateRowIndexes))},this.updateRowIndexes=()=>{let e=this.gridTemplateColumns;if(e===void 0){if(this.generatedGridTemplateColumns===""&&this.rowElements.length>0){let t=this.rowElements[0];this.generatedGridTemplateColumns=new Array(t.cellElements.length).fill("1fr").join(" ")}e=this.generatedGridTemplateColumns}this.rowElements.forEach((t,i)=>{let s=t;s.rowIndex=i,s.gridTemplateColumns=e,this.columnDefinitionsStale&&(s.columnDefinitions=this.columnDefinitions)}),this.rowindexUpdateQueued=!1,this.columnDefinitionsStale=!1}}static generateTemplateColumns(e){let t="";return e.forEach(i=>{t=`${t}${t===""?"":" "}1fr`}),t}noTabbingChanged(){this.$fastController.isConnected&&(this.noTabbing?this.setAttribute("tabIndex","-1"):this.setAttribute("tabIndex",this.contains(document.activeElement)||this===document.activeElement?"-1":"0"))}generateHeaderChanged(){this.$fastController.isConnected&&this.toggleGeneratedHeader()}gridTemplateColumnsChanged(){this.$fastController.isConnected&&this.updateRowIndexes()}rowsDataChanged(){this.columnDefinitions===null&&this.rowsData.length>0&&(this.columnDefinitions=o.generateColumns(this.rowsData[0])),this.$fastController.isConnected&&this.toggleGeneratedHeader()}columnDefinitionsChanged(){if(this.columnDefinitions===null){this.generatedGridTemplateColumns="";return}this.generatedGridTemplateColumns=o.generateTemplateColumns(this.columnDefinitions),this.$fastController.isConnected&&(this.columnDefinitionsStale=!0,this.queueRowIndexUpdate())}headerCellItemTemplateChanged(){this.$fastController.isConnected&&this.generatedHeader!==null&&(this.generatedHeader.headerCellItemTemplate=this.headerCellItemTemplate)}focusRowIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}focusColumnIndexChanged(){this.$fastController.isConnected&&this.queueFocusUpdate()}connectedCallback(){super.connectedCallback(),this.rowItemTemplate===void 0&&(this.rowItemTemplate=this.defaultRowItemTemplate),this.rowsPlaceholder=document.createComment(""),this.appendChild(this.rowsPlaceholder),this.toggleGeneratedHeader(),this.rowsRepeatBehavior=new vt(e=>e.rowsData,e=>e.rowItemTemplate,{positioning:!0}).createBehavior(this.rowsPlaceholder),this.$fastController.addBehaviors([this.rowsRepeatBehavior]),this.addEventListener("row-focused",this.handleRowFocus),this.addEventListener(zr,this.handleFocus),this.addEventListener(Ct,this.handleKeydown),this.addEventListener(xt,this.handleFocusOut),this.observer=new MutationObserver(this.onChildListChange),this.observer.observe(this,{childList:!0}),this.noTabbing&&this.setAttribute("tabindex","-1"),y.queueUpdate(this.queueRowIndexUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("row-focused",this.handleRowFocus),this.removeEventListener(zr,this.handleFocus),this.removeEventListener(Ct,this.handleKeydown),this.removeEventListener(xt,this.handleFocusOut),this.observer.disconnect(),this.rowsPlaceholder=null,this.generatedHeader=null}handleRowFocus(e){this.isUpdatingFocus=!0;let t=e.target;this.focusRowIndex=this.rowElements.indexOf(t),this.focusColumnIndex=t.focusColumnIndex,this.setAttribute("tabIndex","-1"),this.isUpdatingFocus=!1}handleFocus(e){this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}handleFocusOut(e){(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabIndex",this.noTabbing?"-1":"0")}handleKeydown(e){if(e.defaultPrevented)return;let t,i=this.rowElements.length-1,s=this.offsetHeight+this.scrollTop,r=this.rowElements[i];switch(e.key){case J:e.preventDefault(),this.focusOnCell(this.focusRowIndex-1,this.focusColumnIndex,!0);break;case X:e.preventDefault(),this.focusOnCell(this.focusRowIndex+1,this.focusColumnIndex,!0);break;case pc:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex===0){this.focusOnCell(0,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex-1,t;t>=0;t--){let n=this.rowElements[t];if(n.offsetTop<this.scrollTop){this.scrollTop=n.offsetTop+n.clientHeight-this.clientHeight;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case dc:if(e.preventDefault(),this.rowElements.length===0){this.focusOnCell(0,0,!1);break}if(this.focusRowIndex>=i||r.offsetTop+r.offsetHeight<=s){this.focusOnCell(i,this.focusColumnIndex,!1);return}for(t=this.focusRowIndex+1,t;t<=i;t++){let n=this.rowElements[t];if(n.offsetTop+n.offsetHeight>s){let l=0;this.generateHeader===fo.sticky&&this.generatedHeader!==null&&(l=this.generatedHeader.clientHeight),this.scrollTop=n.offsetTop-l;break}}this.focusOnCell(t,this.focusColumnIndex,!1);break;case ce:e.ctrlKey&&(e.preventDefault(),this.focusOnCell(0,0,!0));break;case de:e.ctrlKey&&this.columnDefinitions!==null&&(e.preventDefault(),this.focusOnCell(this.rowElements.length-1,this.columnDefinitions.length-1,!0));break}}queueFocusUpdate(){this.isUpdatingFocus&&(this.contains(document.activeElement)||this===document.activeElement)||this.pendingFocusUpdate===!1&&(this.pendingFocusUpdate=!0,y.queueUpdate(()=>this.updateFocus()))}updateFocus(){this.pendingFocusUpdate=!1,this.focusOnCell(this.focusRowIndex,this.focusColumnIndex,!0)}toggleGeneratedHeader(){if(this.generatedHeader!==null&&(this.removeChild(this.generatedHeader),this.generatedHeader=null),this.generateHeader!==fo.none&&this.rowsData.length>0){let e=document.createElement(this.rowElementTag);this.generatedHeader=e,this.generatedHeader.columnDefinitions=this.columnDefinitions,this.generatedHeader.gridTemplateColumns=this.gridTemplateColumns,this.generatedHeader.rowType=this.generateHeader===fo.sticky?wt.stickyHeader:wt.header,(this.firstChild!==null||this.rowsPlaceholder!==null)&&this.insertBefore(e,this.firstChild!==null?this.firstChild:this.rowsPlaceholder);return}}};he.generateColumns=o=>Object.getOwnPropertyNames(o).map((e,t)=>({columnDataKey:e,gridColumn:`${t}`}));a([d({attribute:"no-tabbing",mode:"boolean"})],he.prototype,"noTabbing",void 0);a([d({attribute:"generate-header"})],he.prototype,"generateHeader",void 0);a([d({attribute:"grid-template-columns"})],he.prototype,"gridTemplateColumns",void 0);a([m],he.prototype,"rowsData",void 0);a([m],he.prototype,"columnDefinitions",void 0);a([m],he.prototype,"rowItemTemplate",void 0);a([m],he.prototype,"cellItemTemplate",void 0);a([m],he.prototype,"headerCellItemTemplate",void 0);a([m],he.prototype,"focusRowIndex",void 0);a([m],he.prototype,"focusColumnIndex",void 0);a([m],he.prototype,"defaultRowItemTemplate",void 0);a([m],he.prototype,"rowElementTag",void 0);a([m],he.prototype,"rowElements",void 0)});var zf,Hf,We,tn=c(()=>{S();g();L();$();Xi();zf=k`
    <template>
        ${o=>o.rowData===null||o.columnDefinition===null||o.columnDefinition.columnDataKey===null?null:o.rowData[o.columnDefinition.columnDataKey]}
    </template>
`,Hf=k`
    <template>
        ${o=>o.columnDefinition===null?null:o.columnDefinition.title===void 0?o.columnDefinition.columnDataKey:o.columnDefinition.title}
    </template>
`,We=class extends b{constructor(){super(...arguments),this.cellType=Ke.default,this.rowData=null,this.columnDefinition=null,this.isActiveCell=!1,this.customCellView=null,this.updateCellStyle=()=>{this.style.gridColumn=this.gridColumn}}cellTypeChanged(){this.$fastController.isConnected&&this.updateCellView()}gridColumnChanged(){this.$fastController.isConnected&&this.updateCellStyle()}columnDefinitionChanged(e,t){this.$fastController.isConnected&&this.updateCellView()}connectedCallback(){var e;super.connectedCallback(),this.addEventListener(Hr,this.handleFocusin),this.addEventListener(xt,this.handleFocusout),this.addEventListener(Ct,this.handleKeydown),this.style.gridColumn=`${((e=this.columnDefinition)===null||e===void 0?void 0:e.gridColumn)===void 0?0:this.columnDefinition.gridColumn}`,this.updateCellView(),this.updateCellStyle()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Hr,this.handleFocusin),this.removeEventListener(xt,this.handleFocusout),this.removeEventListener(Ct,this.handleKeydown),this.disconnectCellView()}handleFocusin(e){if(!this.isActiveCell){switch(this.isActiveCell=!0,this.cellType){case Ke.columnHeader:if(this.columnDefinition!==null&&this.columnDefinition.headerCellInternalFocusQueue!==!0&&typeof this.columnDefinition.headerCellFocusTargetCallback=="function"){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus()}break;default:if(this.columnDefinition!==null&&this.columnDefinition.cellInternalFocusQueue!==!0&&typeof this.columnDefinition.cellFocusTargetCallback=="function"){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus()}break}this.$emit("cell-focused",this)}}handleFocusout(e){this!==document.activeElement&&!this.contains(document.activeElement)&&(this.isActiveCell=!1)}handleKeydown(e){if(!(e.defaultPrevented||this.columnDefinition===null||this.cellType===Ke.default&&this.columnDefinition.cellInternalFocusQueue!==!0||this.cellType===Ke.columnHeader&&this.columnDefinition.headerCellInternalFocusQueue!==!0))switch(e.key){case oe:case cc:if(this.contains(document.activeElement)&&document.activeElement!==this)return;switch(this.cellType){case Ke.columnHeader:if(this.columnDefinition.headerCellFocusTargetCallback!==void 0){let t=this.columnDefinition.headerCellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break;default:if(this.columnDefinition.cellFocusTargetCallback!==void 0){let t=this.columnDefinition.cellFocusTargetCallback(this);t!==null&&t.focus(),e.preventDefault()}break}break;case Ie:this.contains(document.activeElement)&&document.activeElement!==this&&(this.focus(),e.preventDefault());break}}updateCellView(){if(this.disconnectCellView(),this.columnDefinition!==null)switch(this.cellType){case Ke.columnHeader:this.columnDefinition.headerCellTemplate!==void 0?this.customCellView=this.columnDefinition.headerCellTemplate.render(this,this):this.customCellView=Hf.render(this,this);break;case void 0:case Ke.rowHeader:case Ke.default:this.columnDefinition.cellTemplate!==void 0?this.customCellView=this.columnDefinition.cellTemplate.render(this,this):this.customCellView=zf.render(this,this);break}}disconnectCellView(){this.customCellView!==null&&(this.customCellView.dispose(),this.customCellView=null)}};a([d({attribute:"cell-type"})],We.prototype,"cellType",void 0);a([d({attribute:"grid-column"})],We.prototype,"gridColumn",void 0);a([m],We.prototype,"rowData",void 0);a([m],We.prototype,"columnDefinition",void 0)});function Bf(o){let e=o.tagFor(We);return k`
    <${e}
        cell-type="${t=>t.isRowHeader?"rowheader":void 0}"
        grid-column="${(t,i)=>i.index+1}"
        :rowData="${(t,i)=>i.parent.rowData}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}function Nf(o){let e=o.tagFor(We);return k`
    <${e}
        cell-type="columnheader"
        grid-column="${(t,i)=>i.index+1}"
        :columnDefinition="${t=>t}"
    ></${e}>
`}var sd,rd=c(()=>{g();tn();sd=(o,e)=>{let t=Bf(o),i=Nf(o);return k`
        <template
            role="row"
            class="${s=>s.rowType!=="default"?s.rowType:""}"
            :defaultCellItemTemplate="${t}"
            :defaultHeaderCellItemTemplate="${i}"
            ${Di({property:"cellElements",filter:lo('[role="cell"],[role="gridcell"],[role="columnheader"],[role="rowheader"]')})}
        >
            <slot ${ee("slottedCellElements")}></slot>
        </template>
    `}});var nd,ad=c(()=>{g();nd=(o,e)=>k`
        <template
            tabindex="-1"
            role="${t=>!t.cellType||t.cellType==="default"?"gridcell":t.cellType}"
            class="
            ${t=>t.cellType==="columnheader"?"column-header":t.cellType==="rowheader"?"row-header":""}
            "
        >
            <slot></slot>
        </template>
    `});var ld=c(()=>{od();id();rd();en();ad();tn()});var Nw,cd=c(()=>{g();Nw=k`
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
`});var dd=c(()=>{ed();cd();Kr()});var pd=c(()=>{});var ud=c(()=>{});var hd=c(()=>{pd();ud()});var md,fd=c(()=>{g();md=(o,e)=>k`
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
            <slot ${ee("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var on,Ji,gd=c(()=>{Ae();$();on=class extends b{},Ji=class extends Io(on){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var go,bd=c(()=>{S();g();L();gd();go=class extends Ji{constructor(){super(),this.initialValue="on",this.indeterminate=!1,this.keypressHandler=e=>{this.readOnly||e.key===Re&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.indeterminate&&(this.indeterminate=!1),this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}};a([d({attribute:"readonly",mode:"boolean"})],go.prototype,"readOnly",void 0);a([m],go.prototype,"defaultSlottedNodes",void 0);a([m],go.prototype,"indeterminate",void 0)});var vd=c(()=>{fd();bd()});function sn(o){return dt(o)&&(o.getAttribute("role")==="option"||o instanceof HTMLOptionElement)}var Qe,Wt,rn=c(()=>{S();g();L();$();Ko();ve();fe();Qe=class extends b{constructor(e,t,i,s){super(),this.defaultSelected=!1,this.dirtySelected=!1,this.selected=this.defaultSelected,this.dirtyValue=!1,e&&(this.textContent=e),t&&(this.initialValue=t),i&&(this.defaultSelected=i),s&&(this.selected=s),this.proxy=new Option(`${this.textContent}`,this.initialValue,this.defaultSelected,this.selected),this.proxy.disabled=this.disabled}checkedChanged(e,t){if(typeof t=="boolean"){this.ariaChecked=t?"true":"false";return}this.ariaChecked=null}contentChanged(e,t){this.proxy instanceof HTMLOptionElement&&(this.proxy.textContent=this.textContent),this.$emit("contentchange",null,{bubbles:!0})}defaultSelectedChanged(){this.dirtySelected||(this.selected=this.defaultSelected,this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.defaultSelected))}disabledChanged(e,t){this.ariaDisabled=this.disabled?"true":"false",this.proxy instanceof HTMLOptionElement&&(this.proxy.disabled=this.disabled)}selectedAttributeChanged(){this.defaultSelected=this.selectedAttribute,this.proxy instanceof HTMLOptionElement&&(this.proxy.defaultSelected=this.defaultSelected)}selectedChanged(){this.ariaSelected=this.selected?"true":"false",this.dirtySelected||(this.dirtySelected=!0),this.proxy instanceof HTMLOptionElement&&(this.proxy.selected=this.selected)}initialValueChanged(e,t){this.dirtyValue||(this.value=this.initialValue,this.dirtyValue=!1)}get label(){var e;return(e=this.value)!==null&&e!==void 0?e:this.text}get text(){var e,t;return(t=(e=this.textContent)===null||e===void 0?void 0:e.replace(/\s+/g," ").trim())!==null&&t!==void 0?t:""}set value(e){let t=`${e??""}`;this._value=t,this.dirtyValue=!0,this.proxy instanceof HTMLOptionElement&&(this.proxy.value=t),w.notify(this,"value")}get value(){var e;return w.track(this,"value"),(e=this._value)!==null&&e!==void 0?e:this.text}get form(){return this.proxy?this.proxy.form:null}};a([m],Qe.prototype,"checked",void 0);a([m],Qe.prototype,"content",void 0);a([m],Qe.prototype,"defaultSelected",void 0);a([d({mode:"boolean"})],Qe.prototype,"disabled",void 0);a([d({attribute:"selected",mode:"boolean"})],Qe.prototype,"selectedAttribute",void 0);a([m],Qe.prototype,"selected",void 0);a([d({attribute:"value",mode:"fromView"})],Qe.prototype,"initialValue",void 0);Wt=class{};a([m],Wt.prototype,"ariaChecked",void 0);a([m],Wt.prototype,"ariaPosInSet",void 0);a([m],Wt.prototype,"ariaSelected",void 0);a([m],Wt.prototype,"ariaSetSize",void 0);I(Wt,F);I(Qe,N,Wt)});var ge,Ye,bo=c(()=>{S();g();L();$();rn();Ko();fe();ge=class o extends b{constructor(){super(...arguments),this._options=[],this.selectedIndex=-1,this.selectedOptions=[],this.shouldSkipFocus=!1,this.typeaheadBuffer="",this.typeaheadExpired=!0,this.typeaheadTimeout=-1}get firstSelectedOption(){var e;return(e=this.selectedOptions[0])!==null&&e!==void 0?e:null}get hasSelectableOptions(){return this.options.length>0&&!this.options.every(e=>e.disabled)}get length(){var e,t;return(t=(e=this.options)===null||e===void 0?void 0:e.length)!==null&&t!==void 0?t:0}get options(){return w.track(this,"options"),this._options}set options(e){this._options=e,w.notify(this,"options")}get typeAheadExpired(){return this.typeaheadExpired}set typeAheadExpired(e){this.typeaheadExpired=e}clickHandler(e){let t=e.target.closest("option,[role=option]");if(t&&!t.disabled)return this.selectedIndex=this.options.indexOf(t),!0}focusAndScrollOptionIntoView(e=this.firstSelectedOption){this.contains(document.activeElement)&&e!==null&&(e.focus(),requestAnimationFrame(()=>{e.scrollIntoView({block:"nearest"})}))}focusinHandler(e){!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}getTypeaheadMatches(){let e=this.typeaheadBuffer.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),t=new RegExp(`^${e}`,"gi");return this.options.filter(i=>i.text.trim().match(t))}getSelectableIndex(e=this.selectedIndex,t){let i=e>t?-1:e<t?1:0,s=e+i,r=null;switch(i){case-1:{r=this.options.reduceRight((n,l,p)=>!n&&!l.disabled&&p<s?l:n,r);break}case 1:{r=this.options.reduce((n,l,p)=>!n&&!l.disabled&&p>s?l:n,r);break}}return this.options.indexOf(r)}handleChange(e,t){t==="selected"&&(o.slottedOptionFilter(e)&&(this.selectedIndex=this.options.indexOf(e)),this.setSelectedOptions())}handleTypeAhead(e){this.typeaheadTimeout&&window.clearTimeout(this.typeaheadTimeout),this.typeaheadTimeout=window.setTimeout(()=>this.typeaheadExpired=!0,o.TYPE_AHEAD_TIMEOUT_MS),!(e.length>1)&&(this.typeaheadBuffer=`${this.typeaheadExpired?"":this.typeaheadBuffer}${e}`)}keydownHandler(e){if(this.disabled)return!0;this.shouldSkipFocus=!1;let t=e.key;switch(t){case ce:{e.shiftKey||(e.preventDefault(),this.selectFirstOption());break}case X:{e.shiftKey||(e.preventDefault(),this.selectNextOption());break}case J:{e.shiftKey||(e.preventDefault(),this.selectPreviousOption());break}case de:{e.preventDefault(),this.selectLastOption();break}case Vt:return this.focusAndScrollOptionIntoView(),!0;case oe:case Ie:return!0;case Re:if(this.typeaheadExpired)return!0;default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){return this.shouldSkipFocus=!this.contains(document.activeElement),!0}multipleChanged(e,t){this.ariaMultiSelectable=t?"true":null}selectedIndexChanged(e,t){var i;if(!this.hasSelectableOptions){this.selectedIndex=-1;return}if(!((i=this.options[this.selectedIndex])===null||i===void 0)&&i.disabled&&typeof e=="number"){let s=this.getSelectableIndex(e,t),r=s>-1?s:e;this.selectedIndex=r,t===r&&this.selectedIndexChanged(t,r);return}this.setSelectedOptions()}selectedOptionsChanged(e,t){var i;let s=t.filter(o.slottedOptionFilter);(i=this.options)===null||i===void 0||i.forEach(r=>{let n=w.getNotifier(r);n.unsubscribe(this,"selected"),r.selected=s.includes(r),n.subscribe(this,"selected")})}selectFirstOption(){var e,t;this.disabled||(this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>!i.disabled))!==null&&t!==void 0?t:-1)}selectLastOption(){this.disabled||(this.selectedIndex=Xl(this.options,e=>!e.disabled))}selectNextOption(){!this.disabled&&this.selectedIndex<this.options.length-1&&(this.selectedIndex+=1)}selectPreviousOption(){!this.disabled&&this.selectedIndex>0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){var e,t;this.selectedIndex=(t=(e=this.options)===null||e===void 0?void 0:e.findIndex(i=>i.defaultSelected))!==null&&t!==void 0?t:-1}setSelectedOptions(){var e,t,i;!((e=this.options)===null||e===void 0)&&e.length&&(this.selectedOptions=[this.options[this.selectedIndex]],this.ariaActiveDescendant=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.id)!==null&&i!==void 0?i:"",this.focusAndScrollOptionIntoView())}slottedOptionsChanged(e,t){this.options=t.reduce((s,r)=>(sn(r)&&s.push(r),s),[]);let i=`${this.options.length}`;this.options.forEach((s,r)=>{s.id||(s.id=Oe("option-")),s.ariaPosInSet=`${r+1}`,s.ariaSetSize=i}),this.$fastController.isConnected&&(this.setSelectedOptions(),this.setDefaultSelectedOption())}typeaheadBufferChanged(e,t){if(this.$fastController.isConnected){let i=this.getTypeaheadMatches();if(i.length){let s=this.options.indexOf(i[0]);s>-1&&(this.selectedIndex=s)}this.typeaheadExpired=!1}}};ge.slottedOptionFilter=o=>sn(o)&&!o.hidden;ge.TYPE_AHEAD_TIMEOUT_MS=1e3;a([d({mode:"boolean"})],ge.prototype,"disabled",void 0);a([m],ge.prototype,"selectedIndex",void 0);a([m],ge.prototype,"selectedOptions",void 0);a([m],ge.prototype,"slottedOptions",void 0);a([m],ge.prototype,"typeaheadBuffer",void 0);Ye=class{};a([m],Ye.prototype,"ariaActiveDescendant",void 0);a([m],Ye.prototype,"ariaDisabled",void 0);a([m],Ye.prototype,"ariaExpanded",void 0);a([m],Ye.prototype,"ariaMultiSelectable",void 0);I(Ye,F);I(ge,Ye)});var pt,Zi=c(()=>{pt={above:"above",below:"below"}});var nn,Ki,yd=c(()=>{Ae();bo();nn=class extends ge{},Ki=class extends ue(nn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ei,an=c(()=>{ei={inline:"inline",list:"list",both:"both",none:"none"}});var kt,Ao,xd=c(()=>{S();g();L();bo();ve();Zi();fe();yd();an();kt=class extends Ki{constructor(){super(...arguments),this._value="",this.filteredOptions=[],this.filter="",this.forcedPosition=!1,this.listboxId=Oe("listbox-"),this.maxHeight=0,this.open=!1}formResetCallback(){super.formResetCallback(),this.setDefaultSelectedOption(),this.updateValue()}validate(){super.validate(this.control)}get isAutocompleteInline(){return this.autocomplete===ei.inline||this.isAutocompleteBoth}get isAutocompleteList(){return this.autocomplete===ei.list||this.isAutocompleteBoth}get isAutocompleteBoth(){return this.autocomplete===ei.both}openChanged(){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),y.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}get options(){return w.track(this,"options"),this.filteredOptions.length?this.filteredOptions:this._options}set options(e){this._options=e,w.notify(this,"options")}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}get value(){return w.track(this,"value"),this._value}set value(e){var t,i,s;let r=`${this._value}`;if(this.$fastController.isConnected&&this.options){let n=this.options.findIndex(h=>h.text.toLowerCase()===e.toLowerCase()),l=(t=this.options[this.selectedIndex])===null||t===void 0?void 0:t.text,p=(i=this.options[n])===null||i===void 0?void 0:i.text;this.selectedIndex=l!==p?n:this.selectedIndex,e=((s=this.firstSelectedOption)===null||s===void 0?void 0:s.text)||e}r!==e&&(this._value=e,super.valueChanged(r,e),w.notify(this,"value"))}clickHandler(e){let t=e.target.closest("option,[role=option]");if(!(this.disabled||t?.disabled)){if(this.open){if(e.composedPath()[0]===this.control)return;t&&(this.selectedOptions=[t],this.control.value=t.text,this.clearSelectionRange(),this.updateValue(!0))}return this.open=!this.open,this.open&&this.control.focus(),!0}}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.value&&(this.initialValue=this.value)}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}filterOptions(){(!this.autocomplete||this.autocomplete===ei.none)&&(this.filter="");let e=this.filter.toLowerCase();this.filteredOptions=this._options.filter(t=>t.text.toLowerCase().startsWith(this.filter.toLowerCase())),this.isAutocompleteList&&(!this.filteredOptions.length&&!e&&(this.filteredOptions=this._options),this._options.forEach(t=>{t.hidden=!this.filteredOptions.includes(t)}))}focusAndScrollOptionIntoView(){this.contains(document.activeElement)&&(this.control.focus(),this.firstSelectedOption&&requestAnimationFrame(()=>{var e;(e=this.firstSelectedOption)===null||e===void 0||e.scrollIntoView({block:"nearest"})}))}focusoutHandler(e){if(this.syncValue(),!this.open)return!0;let t=e.relatedTarget;if(this.isSameNode(t)){this.focus();return}(!this.options||!this.options.includes(t))&&(this.open=!1)}inputHandler(e){if(this.filter=this.control.value,this.filterOptions(),this.isAutocompleteInline||(this.selectedIndex=this.options.map(t=>t.text).indexOf(this.control.value)),e.inputType.includes("deleteContent")||!this.filter.length)return!0;this.isAutocompleteList&&!this.open&&(this.open=!0),this.isAutocompleteInline&&(this.filteredOptions.length?(this.selectedOptions=[this.filteredOptions[0]],this.selectedIndex=this.options.indexOf(this.firstSelectedOption),this.setInlineSelection()):this.selectedIndex=-1)}keydownHandler(e){let t=e.key;if(e.ctrlKey||e.shiftKey)return!0;switch(t){case"Enter":{this.syncValue(),this.isAutocompleteInline&&(this.filter=this.value),this.open=!1,this.clearSelectionRange();break}case"Escape":{if(this.isAutocompleteInline||(this.selectedIndex=-1),this.open){this.open=!1;break}this.value="",this.control.value="",this.filter="",this.filterOptions();break}case"Tab":{if(this.setInputToSelection(),!this.open)return!0;e.preventDefault(),this.open=!1;break}case"ArrowUp":case"ArrowDown":{if(this.filterOptions(),!this.open){this.open=!0;break}this.filteredOptions.length>0&&super.keydownHandler(e),this.isAutocompleteInline&&this.setInlineSelection();break}default:return!0}}keyupHandler(e){switch(e.key){case"ArrowLeft":case"ArrowRight":case"Backspace":case"Delete":case"Home":case"End":{this.filter=this.control.value,this.selectedIndex=-1,this.filterOptions();break}}}selectedIndexChanged(e,t){if(this.$fastController.isConnected){if(t=Ut(-1,this.options.length-1,t),t!==this.selectedIndex){this.selectedIndex=t;return}super.selectedIndexChanged(e,t)}}selectPreviousOption(){!this.disabled&&this.selectedIndex>=0&&(this.selectedIndex=this.selectedIndex-1)}setDefaultSelectedOption(){if(this.$fastController.isConnected&&this.options){let e=this.options.findIndex(t=>t.getAttribute("selected")!==null||t.selected);this.selectedIndex=e,!this.dirtyValue&&this.firstSelectedOption&&(this.value=this.firstSelectedOption.text),this.setSelectedOptions()}}setInputToSelection(){this.firstSelectedOption&&(this.control.value=this.firstSelectedOption.text,this.control.focus())}setInlineSelection(){this.firstSelectedOption&&(this.setInputToSelection(),this.control.setSelectionRange(this.filter.length,this.control.value.length,"backward"))}syncValue(){var e;let t=this.selectedIndex>-1?(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text:this.control.value;this.updateValue(this.value!==t)}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?pt.above:pt.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===pt.above?~~e.top:~~i}selectedOptionsChanged(e,t){this.$fastController.isConnected&&this._options.forEach(i=>{i.selected=t.includes(i)})}slottedOptionsChanged(e,t){super.slottedOptionsChanged(e,t),this.updateValue()}updateValue(e){var t;this.$fastController.isConnected&&(this.value=((t=this.firstSelectedOption)===null||t===void 0?void 0:t.text)||this.control.value,this.control.value=this.value),e&&this.$emit("change")}clearSelectionRange(){let e=this.control.value.length;this.control.setSelectionRange(e,e)}};a([d({attribute:"autocomplete",mode:"fromView"})],kt.prototype,"autocomplete",void 0);a([m],kt.prototype,"maxHeight",void 0);a([d({attribute:"open",mode:"boolean"})],kt.prototype,"open",void 0);a([d],kt.prototype,"placeholder",void 0);a([d({attribute:"position"})],kt.prototype,"positionAttribute",void 0);a([m],kt.prototype,"position",void 0);Ao=class{};a([m],Ao.prototype,"ariaAutoComplete",void 0);a([m],Ao.prototype,"ariaControls",void 0);I(Ao,Ye);I(kt,N,Ao)});var Cd=c(()=>{});var _d=c(()=>{xd();an();Cd()});function ti(o){let e=o.parentElement;if(e)return e;{let t=o.getRootNode();if(t.host instanceof HTMLElement)return t.host}return null}var es=c(()=>{});function wd(o,e){let t=e;for(;t!==null;){if(t===o)return!0;t=ti(t)}return!1}var kd=c(()=>{es()});function Gf(o){return o instanceof Gt}var ut,oi,cn,dn,pn,ts,un,Qt,ln,Vf,vo,hn=c(()=>{S();g();ut=document.createElement("div");oi=class{setProperty(e,t){y.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){y.queueUpdate(()=>this.target.removeProperty(e))}},cn=class extends oi{constructor(e){super();let t=new CSSStyleSheet;t[Ti]=!0,this.target=t.cssRules[t.insertRule(":host{}")].style,e.$fastController.addStyles(re.create([t]))}},dn=class extends oi{constructor(){super();let e=new CSSStyleSheet;this.target=e.cssRules[e.insertRule(":root{}")].style,document.adoptedStyleSheets=[...document.adoptedStyleSheets,e]}},pn=class extends oi{constructor(){super(),this.style=document.createElement("style"),document.head.appendChild(this.style);let{sheet:e}=this.style;if(e){let t=e.insertRule(":root{}",e.cssRules.length);this.target=e.cssRules[t].style}}},ts=class{constructor(e){this.store=new Map,this.target=null;let t=e.$fastController;this.style=document.createElement("style"),t.addStyles(this.style),w.getNotifier(t).subscribe(this,"isConnected"),this.handleChange(t,"isConnected")}targetChanged(){if(this.target!==null)for(let[e,t]of this.store.entries())this.target.setProperty(e,t)}setProperty(e,t){this.store.set(e,t),y.queueUpdate(()=>{this.target!==null&&this.target.setProperty(e,t)})}removeProperty(e){this.store.delete(e),y.queueUpdate(()=>{this.target!==null&&this.target.removeProperty(e)})}handleChange(e,t){let{sheet:i}=this.style;if(i){let s=i.insertRule(":host{}",i.cssRules.length);this.target=i.cssRules[s].style}else this.target=null}};a([m],ts.prototype,"target",void 0);un=class{constructor(e){this.target=e.style}setProperty(e,t){y.queueUpdate(()=>this.target.setProperty(e,t))}removeProperty(e){y.queueUpdate(()=>this.target.removeProperty(e))}},Qt=class o{setProperty(e,t){o.properties[e]=t;for(let i of o.roots.values())vo.getOrCreate(o.normalizeRoot(i)).setProperty(e,t)}removeProperty(e){delete o.properties[e];for(let t of o.roots.values())vo.getOrCreate(o.normalizeRoot(t)).removeProperty(e)}static registerRoot(e){let{roots:t}=o;if(!t.has(e)){t.add(e);let i=vo.getOrCreate(this.normalizeRoot(e));for(let s in o.properties)i.setProperty(s,o.properties[s])}}static unregisterRoot(e){let{roots:t}=o;if(t.has(e)){t.delete(e);let i=vo.getOrCreate(o.normalizeRoot(e));for(let s in o.properties)i.removeProperty(s)}}static normalizeRoot(e){return e===ut?document:e}};Qt.roots=new Set;Qt.properties={};ln=new WeakMap,Vf=y.supportsAdoptedStyleSheets?cn:ts,vo=Object.freeze({getOrCreate(o){if(ln.has(o))return ln.get(o);let e;return o===ut?e=new Qt:o instanceof Document?e=y.supportsAdoptedStyleSheets?new dn:new pn:Gf(o)?e=new Vf(o):e=new un(o),ln.set(o,e),e}})});function qf(o){return et.from(o)}var et,mn,fn,gn,ii,si,Pe,ri,bn=c(()=>{S();g();es();kd();hn();hn();et=class o extends no{constructor(e){super(),this.subscribers=new WeakMap,this._appliedTo=new Set,this.name=e.name,e.cssCustomPropertyName!==null&&(this.cssCustomProperty=`--${e.cssCustomPropertyName}`,this.cssVar=`var(${this.cssCustomProperty})`),this.id=o.uniqueId(),o.tokensById.set(this.id,this)}get appliedTo(){return[...this._appliedTo]}static from(e){return new o({name:typeof e=="string"?e:e.name,cssCustomPropertyName:typeof e=="string"?e:e.cssCustomPropertyName===void 0?e.name:e.cssCustomPropertyName})}static isCSSDesignToken(e){return typeof e.cssCustomProperty=="string"}static isDerivedDesignTokenValue(e){return typeof e=="function"}static getTokenById(e){return o.tokensById.get(e)}getOrCreateSubscriberSet(e=this){return this.subscribers.get(e)||this.subscribers.set(e,new Set)&&this.subscribers.get(e)}createCSS(){return this.cssVar||""}getValueFor(e){let t=Pe.getOrCreate(e).get(this);if(t!==void 0)return t;throw new Error(`Value could not be retrieved for token named "${this.name}". Ensure the value is set for ${e} or an ancestor of ${e}.`)}setValueFor(e,t){return this._appliedTo.add(e),t instanceof o&&(t=this.alias(t)),Pe.getOrCreate(e).set(this,t),this}deleteValueFor(e){return this._appliedTo.delete(e),Pe.existsFor(e)&&Pe.getOrCreate(e).delete(this),this}withDefault(e){return this.setValueFor(ut,e),this}subscribe(e,t){let i=this.getOrCreateSubscriberSet(t);t&&!Pe.existsFor(t)&&Pe.getOrCreate(t),i.has(e)||i.add(e)}unsubscribe(e,t){let i=this.subscribers.get(t||this);i&&i.has(e)&&i.delete(e)}notify(e){let t=Object.freeze({token:this,target:e});this.subscribers.has(this)&&this.subscribers.get(this).forEach(i=>i.handleChange(t)),this.subscribers.has(e)&&this.subscribers.get(e).forEach(i=>i.handleChange(t))}alias(e){return(t=>e.getValueFor(t))}};et.uniqueId=(()=>{let o=0;return()=>(o++,o.toString(16))})();et.tokensById=new Map;mn=class{startReflection(e,t){e.subscribe(this,t),this.handleChange({token:e,target:t})}stopReflection(e,t){e.unsubscribe(this,t),this.remove(e,t)}handleChange(e){let{token:t,target:i}=e;this.add(t,i)}add(e,t){vo.getOrCreate(t).setProperty(e.cssCustomProperty,this.resolveCSSValue(Pe.getOrCreate(t).get(e)))}remove(e,t){vo.getOrCreate(t).removeProperty(e.cssCustomProperty)}resolveCSSValue(e){return e&&typeof e.createCSS=="function"?e.createCSS():e}},fn=class{constructor(e,t,i){this.source=e,this.token=t,this.node=i,this.dependencies=new Set,this.observer=w.binding(e,this,!1),this.observer.handleChange=this.observer.call,this.handleChange()}disconnect(){this.observer.disconnect()}handleChange(){try{this.node.store.set(this.token,this.observer.observe(this.node.target,zt))}catch(e){console.error(e)}}},gn=class{constructor(){this.values=new Map}set(e,t){this.values.get(e)!==t&&(this.values.set(e,t),w.getNotifier(this).notify(e.id))}get(e){return w.track(this,e.id),this.values.get(e)}delete(e){this.values.delete(e),w.getNotifier(this).notify(e.id)}all(){return this.values.entries()}},ii=new WeakMap,si=new WeakMap,Pe=class o{constructor(e){this.target=e,this.store=new gn,this.children=[],this.assignedValues=new Map,this.reflecting=new Set,this.bindingObservers=new Map,this.tokenValueChangeHandler={handleChange:(t,i)=>{let s=et.getTokenById(i);s&&(s.notify(this.target),this.updateCSSTokenReflection(t,s))}},ii.set(e,this),w.getNotifier(this.store).subscribe(this.tokenValueChangeHandler),e instanceof Gt?e.$fastController.addBehaviors([this]):e.isConnected&&this.bind()}static getOrCreate(e){return ii.get(e)||new o(e)}static existsFor(e){return ii.has(e)}static findParent(e){if(ut!==e.target){let t=ti(e.target);for(;t!==null;){if(ii.has(t))return ii.get(t);t=ti(t)}return o.getOrCreate(ut)}return null}static findClosestAssignedNode(e,t){let i=t;do{if(i.has(e))return i;i=i.parent?i.parent:i.target!==ut?o.getOrCreate(ut):null}while(i!==null);return null}get parent(){return si.get(this)||null}updateCSSTokenReflection(e,t){if(et.isCSSDesignToken(t)){let i=this.parent,s=this.isReflecting(t);if(i){let r=i.get(t),n=e.get(t);r!==n&&!s?this.reflectToCSS(t):r===n&&s&&this.stopReflectToCSS(t)}else s||this.reflectToCSS(t)}}has(e){return this.assignedValues.has(e)}get(e){let t=this.store.get(e);if(t!==void 0)return t;let i=this.getRaw(e);if(i!==void 0)return this.hydrate(e,i),this.get(e)}getRaw(e){var t;return this.assignedValues.has(e)?this.assignedValues.get(e):(t=o.findClosestAssignedNode(e,this))===null||t===void 0?void 0:t.getRaw(e)}set(e,t){et.isDerivedDesignTokenValue(this.assignedValues.get(e))&&this.tearDownBindingObserver(e),this.assignedValues.set(e,t),et.isDerivedDesignTokenValue(t)?this.setupBindingObserver(e,t):this.store.set(e,t)}delete(e){this.assignedValues.delete(e),this.tearDownBindingObserver(e);let t=this.getRaw(e);t?this.hydrate(e,t):this.store.delete(e)}bind(){let e=o.findParent(this);e&&e.appendChild(this);for(let t of this.assignedValues.keys())t.notify(this.target)}unbind(){this.parent&&si.get(this).removeChild(this);for(let e of this.bindingObservers.keys())this.tearDownBindingObserver(e)}appendChild(e){e.parent&&si.get(e).removeChild(e);let t=this.children.filter(i=>e.contains(i));si.set(e,this),this.children.push(e),t.forEach(i=>e.appendChild(i)),w.getNotifier(this.store).subscribe(e);for(let[i,s]of this.store.all())e.hydrate(i,this.bindingObservers.has(i)?this.getRaw(i):s),e.updateCSSTokenReflection(e.store,i)}removeChild(e){let t=this.children.indexOf(e);if(t!==-1&&this.children.splice(t,1),w.getNotifier(this.store).unsubscribe(e),e.parent!==this)return!1;let i=si.delete(e);for(let[s]of this.store.all())e.hydrate(s,e.getRaw(s)),e.updateCSSTokenReflection(e.store,s);return i}contains(e){return wd(this.target,e.target)}reflectToCSS(e){this.isReflecting(e)||(this.reflecting.add(e),o.cssCustomPropertyReflector.startReflection(e,this.target))}stopReflectToCSS(e){this.isReflecting(e)&&(this.reflecting.delete(e),o.cssCustomPropertyReflector.stopReflection(e,this.target))}isReflecting(e){return this.reflecting.has(e)}handleChange(e,t){let i=et.getTokenById(t);i&&(this.hydrate(i,this.getRaw(i)),this.updateCSSTokenReflection(this.store,i))}hydrate(e,t){if(!this.has(e)){let i=this.bindingObservers.get(e);et.isDerivedDesignTokenValue(t)?i?i.source!==t&&(this.tearDownBindingObserver(e),this.setupBindingObserver(e,t)):this.setupBindingObserver(e,t):(i&&this.tearDownBindingObserver(e),this.store.set(e,t))}}setupBindingObserver(e,t){let i=new fn(t,e,this);return this.bindingObservers.set(e,i),i}tearDownBindingObserver(e){return this.bindingObservers.has(e)?(this.bindingObservers.get(e).disconnect(),this.bindingObservers.delete(e),!0):!1}};Pe.cssCustomPropertyReflector=new mn;a([m],Pe.prototype,"children",void 0);ri=Object.freeze({create:qf,notifyConnection(o){return!o.isConnected||!Pe.existsFor(o)?!1:(Pe.getOrCreate(o).bind(),!0)},notifyDisconnection(o){return o.isConnected||!Pe.existsFor(o)?!1:(Pe.getOrCreate(o).unbind(),!0)},registerRoot(o=ut){Qt.registerRoot(o)},unregisterRoot(o=ut){Qt.unregisterRoot(o)}})});function Uf(o,e,t){return typeof o=="string"?{name:o,type:e,callback:t}:o}var vn,yn,os,Eo,ni,Cn,is,xn,Sd=c(()=>{g();$();Hi();bn();Vi();vn=Object.freeze({definitionCallbackOnly:null,ignoreDuplicate:Symbol()}),yn=new Map,os=new Map,Eo=null,ni=V.createInterface(o=>o.cachedCallback(e=>(Eo===null&&(Eo=new is(null,e)),Eo))),Cn=Object.freeze({tagFor(o){return os.get(o)},responsibleFor(o){let e=o.$$designSystem$$;return e||V.findResponsibleContainer(o).get(ni)},getOrCreate(o){if(!o)return Eo===null&&(Eo=V.getOrCreateDOMContainer().get(ni)),Eo;let e=o.$$designSystem$$;if(e)return e;let t=V.getOrCreateDOMContainer(o);if(t.has(ni,!1))return t.get(ni);{let i=new is(o,t);return t.register(co.instance(ni,i)),i}}});is=class{constructor(e,t){this.owner=e,this.container=t,this.designTokensInitialized=!1,this.prefix="fast",this.shadowRootMode=void 0,this.disambiguate=()=>vn.definitionCallbackOnly,e!==null&&(e.$$designSystem$$=this)}withPrefix(e){return this.prefix=e,this}withShadowRootMode(e){return this.shadowRootMode=e,this}withElementDisambiguation(e){return this.disambiguate=e,this}withDesignTokenRoot(e){return this.designTokenRoot=e,this}register(...e){let t=this.container,i=[],s=this.disambiguate,r=this.shadowRootMode,n={elementPrefix:this.prefix,tryDefineElement(l,p,h){let u=Uf(l,p,h),{name:f,callback:v,baseClass:T}=u,{type:A}=u,te=f,le=yn.get(te),Et=!0;for(;le;){let Dt=s(te,A,le);switch(Dt){case vn.ignoreDuplicate:return;case vn.definitionCallbackOnly:Et=!1,le=void 0;break;default:te=Dt,le=yn.get(te);break}}Et&&((os.has(A)||A===b)&&(A=class extends A{}),yn.set(te,A),os.set(A,te),T&&os.set(T,te)),i.push(new xn(t,te,A,r,v,Et))}};this.designTokensInitialized||(this.designTokensInitialized=!0,this.designTokenRoot!==null&&ri.registerRoot(this.designTokenRoot)),t.registerWithContext(n,...e);for(let l of i)l.callback(l),l.willDefine&&l.definition!==null&&l.definition.define();return this}},xn=class{constructor(e,t,i,s,r,n){this.container=e,this.name=t,this.type=i,this.shadowRootMode=s,this.callback=r,this.willDefine=n,this.definition=null}definePresentation(e){Gi.define(this.name,e,this.container)}defineElement(e){this.definition=new ct(this.type,Object.assign(Object.assign({},e),{name:this.name}))}tagFor(e){return Cn.tagFor(e)}}});var Pd=c(()=>{});var $d=c(()=>{Sd();Vi();Pd()});var Td=c(()=>{Hi()});var Md=c(()=>{});var Rd,jf,Ad,ai,_n,Wf,Ed,Qf,Yf,Xf,Jf,Zf,Kf,Id,eg,tg,Dd,og,wn,ig,kn,Sn=c(()=>{Rd=["input","select","textarea","a[href]","button","[tabindex]:not(slot)","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])',"details>summary:first-of-type","details"],jf=Rd.join(","),Ad=typeof Element>"u",ai=Ad?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,_n=!Ad&&Element.prototype.getRootNode?function(o){return o.getRootNode()}:function(o){return o.ownerDocument},Wf=function(e,t){return e.tabIndex<0&&(t||/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||e.isContentEditable)&&isNaN(parseInt(e.getAttribute("tabindex"),10))?0:e.tabIndex},Ed=function(e){return e.tagName==="INPUT"},Qf=function(e){return Ed(e)&&e.type==="hidden"},Yf=function(e){var t=e.tagName==="DETAILS"&&Array.prototype.slice.apply(e.children).some(function(i){return i.tagName==="SUMMARY"});return t},Xf=function(e,t){for(var i=0;i<e.length;i++)if(e[i].checked&&e[i].form===t)return e[i]},Jf=function(e){if(!e.name)return!0;var t=e.form||_n(e),i=function(l){return t.querySelectorAll('input[type="radio"][name="'+l+'"]')},s;if(typeof window<"u"&&typeof window.CSS<"u"&&typeof window.CSS.escape=="function")s=i(window.CSS.escape(e.name));else try{s=i(e.name)}catch(n){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",n.message),!1}var r=Xf(s,e.form);return!r||r===e},Zf=function(e){return Ed(e)&&e.type==="radio"},Kf=function(e){return Zf(e)&&!Jf(e)},Id=function(e){var t=e.getBoundingClientRect(),i=t.width,s=t.height;return i===0&&s===0},eg=function(e,t){var i=t.displayCheck,s=t.getShadowRoot;if(getComputedStyle(e).visibility==="hidden")return!0;var r=ai.call(e,"details>summary:first-of-type"),n=r?e.parentElement:e;if(ai.call(n,"details:not([open]) *"))return!0;var l=_n(e).host,p=l?.ownerDocument.contains(l)||e.ownerDocument.contains(e);if(!i||i==="full"){if(typeof s=="function"){for(var h=e;e;){var u=e.parentElement,f=_n(e);if(u&&!u.shadowRoot&&s(u)===!0)return Id(e);e.assignedSlot?e=e.assignedSlot:!u&&f!==e.ownerDocument?e=f.host:e=u}e=h}if(p)return!e.getClientRects().length}else if(i==="non-zero-area")return Id(e);return!1},tg=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName==="FIELDSET"&&t.disabled){for(var i=0;i<t.children.length;i++){var s=t.children.item(i);if(s.tagName==="LEGEND")return ai.call(t,"fieldset[disabled] *")?!0:!s.contains(e)}return!0}t=t.parentElement}return!1},Dd=function(e,t){return!(t.disabled||Qf(t)||eg(t,e)||Yf(t)||tg(t))},og=function(e,t){return!(Kf(t)||Wf(t)<0||!Dd(e,t))},wn=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ai.call(e,jf)===!1?!1:og(t,e)},ig=Rd.concat("iframe").join(","),kn=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return ai.call(e,ig)===!1?!1:Dd(t,e)}});var Yt,Ld=c(()=>{S();g();L();Sn();$();Yt=class o extends b{constructor(){super(...arguments),this.modal=!0,this.hidden=!1,this.trapFocus=!0,this.trapFocusChanged=()=>{this.$fastController.isConnected&&this.updateTrapFocus()},this.isTrappingFocus=!1,this.handleDocumentKeydown=e=>{if(!e.defaultPrevented&&!this.hidden)switch(e.key){case Ie:this.dismiss(),e.preventDefault();break;case Vt:this.handleTabKeyDown(e);break}},this.handleDocumentFocus=e=>{!e.defaultPrevented&&this.shouldForceFocus(e.target)&&(this.focusFirstElement(),e.preventDefault())},this.handleTabKeyDown=e=>{if(!this.trapFocus||this.hidden)return;let t=this.getTabQueueBounds();if(t.length!==0){if(t.length===1){t[0].focus(),e.preventDefault();return}e.shiftKey&&e.target===t[0]?(t[t.length-1].focus(),e.preventDefault()):!e.shiftKey&&e.target===t[t.length-1]&&(t[0].focus(),e.preventDefault())}},this.getTabQueueBounds=()=>{let e=[];return o.reduceTabbableItems(e,this)},this.focusFirstElement=()=>{let e=this.getTabQueueBounds();e.length>0?e[0].focus():this.dialog instanceof HTMLElement&&this.dialog.focus()},this.shouldForceFocus=e=>this.isTrappingFocus&&!this.contains(e),this.shouldTrapFocus=()=>this.trapFocus&&!this.hidden,this.updateTrapFocus=e=>{let t=e===void 0?this.shouldTrapFocus():e;t&&!this.isTrappingFocus?(this.isTrappingFocus=!0,document.addEventListener("focusin",this.handleDocumentFocus),y.queueUpdate(()=>{this.shouldForceFocus(document.activeElement)&&this.focusFirstElement()})):!t&&this.isTrappingFocus&&(this.isTrappingFocus=!1,document.removeEventListener("focusin",this.handleDocumentFocus))}}dismiss(){this.$emit("dismiss"),this.$emit("cancel")}show(){this.hidden=!1}hide(){this.hidden=!0,this.$emit("close")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.handleDocumentKeydown),this.notifier=w.getNotifier(this),this.notifier.subscribe(this,"hidden"),this.updateTrapFocus()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.handleDocumentKeydown),this.updateTrapFocus(!1),this.notifier.unsubscribe(this,"hidden")}handleChange(e,t){t==="hidden"&&this.updateTrapFocus()}static reduceTabbableItems(e,t){return t.getAttribute("tabindex")==="-1"?e:wn(t)||o.isFocusableFastElement(t)&&o.hasTabbableShadow(t)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceTabbableItems,[])):e}static isFocusableFastElement(e){var t,i;return!!(!((i=(t=e.$fastController)===null||t===void 0?void 0:t.definition.shadowOptions)===null||i===void 0)&&i.delegatesFocus)}static hasTabbableShadow(e){var t,i;return Array.from((i=(t=e.shadowRoot)===null||t===void 0?void 0:t.querySelectorAll("*"))!==null&&i!==void 0?i:[]).some(s=>wn(s))}};a([d({mode:"boolean"})],Yt.prototype,"modal",void 0);a([d({mode:"boolean"})],Yt.prototype,"hidden",void 0);a([d({attribute:"trap-focus",mode:"boolean"})],Yt.prototype,"trapFocus",void 0);a([d({attribute:"aria-describedby"})],Yt.prototype,"ariaDescribedby",void 0);a([d({attribute:"aria-labelledby"})],Yt.prototype,"ariaLabelledby",void 0);a([d({attribute:"aria-label"})],Yt.prototype,"ariaLabel",void 0)});var Fd=c(()=>{Md();Ld()});var Od=c(()=>{});var ss,zd=c(()=>{S();g();$();ss=class extends b{connectedCallback(){super.connectedCallback(),this.setup()}disconnectedCallback(){super.disconnectedCallback(),this.details.removeEventListener("toggle",this.onToggle)}show(){this.details.open=!0}hide(){this.details.open=!1}toggle(){this.details.open=!this.details.open}setup(){this.onToggle=this.onToggle.bind(this),this.details.addEventListener("toggle",this.onToggle),this.expanded&&this.show()}onToggle(){this.expanded=this.details.open,this.$emit("toggle")}};a([d({mode:"boolean"})],ss.prototype,"expanded",void 0);a([d],ss.prototype,"title",void 0)});var Hd=c(()=>{Od();zd()});var Bd,Nd=c(()=>{g();Bd=(o,e)=>k`
    <template role="${t=>t.role}" aria-orientation="${t=>t.orientation}"></template>
`});var rs,Gd=c(()=>{rs={separator:"separator",presentation:"presentation"}});var Do,Vd=c(()=>{S();g();L();$();Gd();Do=class extends b{constructor(){super(...arguments),this.role=rs.separator,this.orientation=q.horizontal}};a([d],Do.prototype,"role",void 0);a([d],Do.prototype,"orientation",void 0)});var qd=c(()=>{Nd();Vd()});var Ud,jd=c(()=>{Ud={next:"next",previous:"previous"}});var Wd=c(()=>{});var li,Qd=c(()=>{S();g();$();jd();li=class extends b{constructor(){super(...arguments),this.hiddenFromAT=!0,this.direction=Ud.next}keyupHandler(e){if(!this.hiddenFromAT){let t=e.key;(t==="Enter"||t==="Space")&&this.$emit("click",e),t==="Escape"&&this.blur()}}};a([d({mode:"boolean"})],li.prototype,"disabled",void 0);a([d({attribute:"aria-hidden",converter:ro})],li.prototype,"hiddenFromAT",void 0);a([d],li.prototype,"direction",void 0)});var Yd=c(()=>{Wd();Qd()});var Xd=c(()=>{Ae()});var Jd=c(()=>{$()});var Zd,Kd=c(()=>{g();ve();Zd=(o,e)=>k`
    <template
        aria-checked="${t=>t.ariaChecked}"
        aria-disabled="${t=>t.ariaDisabled}"
        aria-posinset="${t=>t.ariaPosInSet}"
        aria-selected="${t=>t.ariaSelected}"
        aria-setsize="${t=>t.ariaSetSize}"
        class="${t=>[t.checked&&"checked",t.selected&&"selected",t.disabled&&"disabled"].filter(Boolean).join(" ")}"
        role="option"
    >
        ${je(o,e)}
        <span class="content" part="content">
            <slot ${ee("content")}></slot>
        </span>
        ${Ue(o,e)}
    </template>
`});var ep=c(()=>{rn();Kd()});var yo,Pn=c(()=>{S();g();L();bo();yo=class extends ge{constructor(){super(...arguments),this.activeIndex=-1,this.rangeStartIndex=-1}get activeOption(){return this.options[this.activeIndex]}get checkedOptions(){var e;return(e=this.options)===null||e===void 0?void 0:e.filter(t=>t.checked)}get firstSelectedOptionIndex(){return this.options.indexOf(this.firstSelectedOption)}activeIndexChanged(e,t){var i,s;this.ariaActiveDescendant=(s=(i=this.options[t])===null||i===void 0?void 0:i.id)!==null&&s!==void 0?s:"",this.focusAndScrollOptionIntoView()}checkActiveIndex(){if(!this.multiple)return;let e=this.activeOption;e&&(e.checked=!0)}checkFirstOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex+1),this.options.forEach((t,i)=>{t.checked=Zo(i,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex=0,this.checkActiveIndex()}checkLastOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Zo(i,this.rangeStartIndex,this.options.length)})):this.uncheckAllOptions(),this.activeIndex=this.options.length-1,this.checkActiveIndex()}connectedCallback(){super.connectedCallback(),this.addEventListener("focusout",this.focusoutHandler)}disconnectedCallback(){this.removeEventListener("focusout",this.focusoutHandler),super.disconnectedCallback()}checkNextOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.options.forEach((t,i)=>{t.checked=Zo(i,this.rangeStartIndex,this.activeIndex+1)})):this.uncheckAllOptions(),this.activeIndex+=this.activeIndex<this.options.length-1?1:0,this.checkActiveIndex()}checkPreviousOption(e=!1){e?(this.rangeStartIndex===-1&&(this.rangeStartIndex=this.activeIndex),this.checkedOptions.length===1&&(this.rangeStartIndex+=1),this.options.forEach((t,i)=>{t.checked=Zo(i,this.activeIndex,this.rangeStartIndex)})):this.uncheckAllOptions(),this.activeIndex-=this.activeIndex>0?1:0,this.checkActiveIndex()}clickHandler(e){var t;if(!this.multiple)return super.clickHandler(e);let i=(t=e.target)===null||t===void 0?void 0:t.closest("[role=option]");if(!(!i||i.disabled))return this.uncheckAllOptions(),this.activeIndex=this.options.indexOf(i),this.checkActiveIndex(),this.toggleSelectedForAllCheckedOptions(),!0}focusAndScrollOptionIntoView(){super.focusAndScrollOptionIntoView(this.activeOption)}focusinHandler(e){if(!this.multiple)return super.focusinHandler(e);!this.shouldSkipFocus&&e.target===e.currentTarget&&(this.uncheckAllOptions(),this.activeIndex===-1&&(this.activeIndex=this.firstSelectedOptionIndex!==-1?this.firstSelectedOptionIndex:0),this.checkActiveIndex(),this.setSelectedOptions(),this.focusAndScrollOptionIntoView()),this.shouldSkipFocus=!1}focusoutHandler(e){this.multiple&&this.uncheckAllOptions()}keydownHandler(e){if(!this.multiple)return super.keydownHandler(e);if(this.disabled)return!0;let{key:t,shiftKey:i}=e;switch(this.shouldSkipFocus=!1,t){case ce:{this.checkFirstOption(i);return}case X:{this.checkNextOption(i);return}case J:{this.checkPreviousOption(i);return}case de:{this.checkLastOption(i);return}case Vt:return this.focusAndScrollOptionIntoView(),!0;case Ie:return this.uncheckAllOptions(),this.checkActiveIndex(),!0;case Re:if(e.preventDefault(),this.typeAheadExpired){this.toggleSelectedForAllCheckedOptions();return}default:return t.length===1&&this.handleTypeAhead(`${t}`),!0}}mousedownHandler(e){if(e.offsetX>=0&&e.offsetX<=this.scrollWidth)return super.mousedownHandler(e)}multipleChanged(e,t){var i;this.ariaMultiSelectable=t?"true":null,(i=this.options)===null||i===void 0||i.forEach(s=>{s.checked=t?!1:void 0}),this.setSelectedOptions()}setSelectedOptions(){if(!this.multiple){super.setSelectedOptions();return}this.$fastController.isConnected&&this.options&&(this.selectedOptions=this.options.filter(e=>e.selected),this.focusAndScrollOptionIntoView())}sizeChanged(e,t){var i;let s=Math.max(0,parseInt((i=t?.toFixed())!==null&&i!==void 0?i:"",10));s!==t&&y.queueUpdate(()=>{this.size=s})}toggleSelectedForAllCheckedOptions(){let e=this.checkedOptions.filter(i=>!i.disabled),t=!e.every(i=>i.selected);e.forEach(i=>i.selected=t),this.selectedIndex=this.options.indexOf(e[e.length-1]),this.setSelectedOptions()}typeaheadBufferChanged(e,t){if(!this.multiple){super.typeaheadBufferChanged(e,t);return}if(this.$fastController.isConnected){let i=this.getTypeaheadMatches(),s=this.options.indexOf(i[0]);s>-1&&(this.activeIndex=s,this.uncheckAllOptions(),this.checkActiveIndex()),this.typeAheadExpired=!1}}uncheckAllOptions(e=!1){this.options.forEach(t=>t.checked=this.multiple?!1:void 0),e||(this.rangeStartIndex=-1)}};a([m],yo.prototype,"activeIndex",void 0);a([d({mode:"boolean"})],yo.prototype,"multiple",void 0);a([d({converter:E})],yo.prototype,"size",void 0)});var tp=c(()=>{});var op=c(()=>{bo();Pn();tp()});var Lo,ip=c(()=>{S();L();g();$();Lo=class extends b{constructor(){super(...arguments),this.optionElements=[]}menuElementsChanged(){this.updateOptions()}headerElementsChanged(){this.updateOptions()}footerElementsChanged(){this.updateOptions()}updateOptions(){this.optionElements.splice(0,this.optionElements.length),this.addSlottedListItems(this.headerElements),this.addSlottedListItems(this.menuElements),this.addSlottedListItems(this.footerElements),this.$emit("optionsupdated",{bubbles:!1})}addSlottedListItems(e){e!==void 0&&e.forEach(t=>{t.nodeType===1&&t.getAttribute("role")==="listitem"&&(t.id=t.id||Oe("option-"),this.optionElements.push(t))})}};a([m],Lo.prototype,"menuElements",void 0);a([m],Lo.prototype,"headerElements",void 0);a([m],Lo.prototype,"footerElements",void 0);a([m],Lo.prototype,"suggestionsAvailableText",void 0)});var sg,Fo,$n=c(()=>{S();g();$();sg=k`
    <template>
        ${o=>o.value}
    </template>
`,Fo=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){super.disconnectedCallback(),this.disconnectView()}handleClick(e){return e.defaultPrevented||this.handleInvoked(),!1}handleInvoked(){this.$emit("pickeroptioninvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:sg.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};a([d({attribute:"value"})],Fo.prototype,"value",void 0);a([m],Fo.prototype,"contentsTemplate",void 0)});var sp=c(()=>{});var rg,Oo,Tn=c(()=>{S();g();L();$();rg=k`
    <template>
        ${o=>o.value}
    </template>
`,Oo=class extends b{contentsTemplateChanged(){this.$fastController.isConnected&&this.updateView()}connectedCallback(){super.connectedCallback(),this.updateView()}disconnectedCallback(){this.disconnectView(),super.disconnectedCallback()}handleKeyDown(e){return e.defaultPrevented?!1:e.key===oe?(this.handleInvoke(),!1):!0}handleClick(e){return e.defaultPrevented||this.handleInvoke(),!1}handleInvoke(){this.$emit("pickeriteminvoked")}updateView(){var e,t;this.disconnectView(),this.customView=(t=(e=this.contentsTemplate)===null||e===void 0?void 0:e.render(this,this))!==null&&t!==void 0?t:rg.render(this,this)}disconnectView(){var e;(e=this.customView)===null||e===void 0||e.dispose(),this.customView=void 0}};a([d({attribute:"value"})],Oo.prototype,"value",void 0);a([m],Oo.prototype,"contentsTemplate",void 0)});var rp=c(()=>{});var Mn,ns,np=c(()=>{Ae();$();Mn=class extends b{},ns=class extends ue(Mn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ng,O,ap=c(()=>{S();g();L();Yr();$n();Tn();np();ng=k`
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
`,O=class extends ns{constructor(){super(...arguments),this.selection="",this.filterSelected=!0,this.filterQuery=!0,this.noSuggestionsText="No suggestions available",this.suggestionsAvailableText="Suggestions available",this.loadingText="Loading suggestions",this.menuPlacement="bottom-fill",this.showLoading=!1,this.optionsList=[],this.filteredOptionsList=[],this.flyoutOpen=!1,this.menuFocusIndex=-1,this.showNoOptions=!1,this.selectedItems=[],this.inputElementView=null,this.handleTextInput=e=>{this.query=this.inputElement.value},this.handleInputClick=e=>{e.preventDefault(),this.toggleFlyout(!0)},this.setRegionProps=()=>{if(this.flyoutOpen){if(this.region===null||this.region===void 0){y.queueUpdate(this.setRegionProps);return}this.region.anchorElement=this.inputElement}},this.configLookup={top:Ur,bottom:jr,tallest:Wr,"top-fill":Rc,"bottom-fill":Qr,"tallest-fill":Ac}}selectionChanged(){this.$fastController.isConnected&&(this.handleSelectionChange(),this.proxy instanceof HTMLInputElement&&(this.proxy.value=this.selection,this.validate()))}optionsChanged(){this.optionsList=this.options.split(",").map(e=>e.trim()).filter(e=>e!=="")}menuPlacementChanged(){this.$fastController.isConnected&&this.updateMenuConfig()}showLoadingChanged(){this.$fastController.isConnected&&y.queueUpdate(()=>{this.setFocusedOption(0)})}listItemTemplateChanged(){this.updateListItemTemplate()}defaultListItemTemplateChanged(){this.updateListItemTemplate()}menuOptionTemplateChanged(){this.updateOptionTemplate()}defaultMenuOptionTemplateChanged(){this.updateOptionTemplate()}optionsListChanged(){this.updateFilteredOptions()}queryChanged(){this.$fastController.isConnected&&(this.inputElement.value!==this.query&&(this.inputElement.value=this.query),this.updateFilteredOptions(),this.$emit("querychange",{bubbles:!1}))}filteredOptionsListChanged(){this.$fastController.isConnected&&(this.showNoOptions=this.filteredOptionsList.length===0&&this.menuElement.querySelectorAll('[role="listitem"]').length===0,this.setFocusedOption(this.showNoOptions?-1:0))}flyoutOpenChanged(){this.flyoutOpen?(y.queueUpdate(this.setRegionProps),this.$emit("menuopening",{bubbles:!1})):this.$emit("menuclosing",{bubbles:!1})}showNoOptionsChanged(){this.$fastController.isConnected&&y.queueUpdate(()=>{this.setFocusedOption(0)})}connectedCallback(){super.connectedCallback(),this.listElement=document.createElement(this.selectedListTag),this.appendChild(this.listElement),this.itemsPlaceholderElement=document.createComment(""),this.listElement.append(this.itemsPlaceholderElement),this.inputElementView=ng.render(this,this.listElement);let e=this.menuTag.toUpperCase();this.menuElement=Array.from(this.children).find(t=>t.tagName===e),this.menuElement===void 0&&(this.menuElement=document.createElement(this.menuTag),this.appendChild(this.menuElement)),this.menuElement.id===""&&(this.menuElement.id=Oe("listbox-")),this.menuId=this.menuElement.id,this.optionsPlaceholder=document.createComment(""),this.menuElement.append(this.optionsPlaceholder),this.updateMenuConfig(),y.queueUpdate(()=>this.initialize())}disconnectedCallback(){super.disconnectedCallback(),this.toggleFlyout(!1),this.inputElement.removeEventListener("input",this.handleTextInput),this.inputElement.removeEventListener("click",this.handleInputClick),this.inputElementView!==null&&(this.inputElementView.dispose(),this.inputElementView=null)}focus(){this.inputElement.focus()}initialize(){this.updateListItemTemplate(),this.updateOptionTemplate(),this.itemsRepeatBehavior=new vt(e=>e.selectedItems,e=>e.activeListItemTemplate,{positioning:!0}).createBehavior(this.itemsPlaceholderElement),this.inputElement.addEventListener("input",this.handleTextInput),this.inputElement.addEventListener("click",this.handleInputClick),this.$fastController.addBehaviors([this.itemsRepeatBehavior]),this.menuElement.suggestionsAvailableText=this.suggestionsAvailableText,this.menuElement.addEventListener("optionsupdated",this.handleMenuOptionsUpdated),this.optionsRepeatBehavior=new vt(e=>e.filteredOptionsList,e=>e.activeMenuOptionTemplate,{positioning:!0}).createBehavior(this.optionsPlaceholder),this.$fastController.addBehaviors([this.optionsRepeatBehavior]),this.handleSelectionChange()}toggleFlyout(e){if(this.flyoutOpen!==e){if(e&&document.activeElement===this.inputElement){this.flyoutOpen=e,y.queueUpdate(()=>{this.menuElement!==void 0?this.setFocusedOption(0):this.disableMenu()});return}this.flyoutOpen=!1,this.disableMenu()}}handleMenuOptionsUpdated(e){e.preventDefault(),this.flyoutOpen&&this.setFocusedOption(0)}handleKeyDown(e){if(e.defaultPrevented)return!1;switch(e.key){case X:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.min(this.menuFocusIndex+1,this.menuElement.optionElements.length-1):0;this.setFocusedOption(t)}return!1}case J:{if(!this.flyoutOpen)this.toggleFlyout(!0);else{let t=this.flyoutOpen?Math.max(this.menuFocusIndex-1,0):0;this.setFocusedOption(t)}return!1}case Ie:return this.toggleFlyout(!1),!1;case oe:return this.menuFocusIndex!==-1&&this.menuElement.optionElements.length>this.menuFocusIndex&&this.menuElement.optionElements[this.menuFocusIndex].click(),!1;case Ce:return document.activeElement!==this.inputElement?(this.incrementFocusedItem(1),!1):!0;case xe:return this.inputElement.selectionStart===0?(this.incrementFocusedItem(-1),!1):!0;case hc:case uc:{if(document.activeElement===null)return!0;if(document.activeElement===this.inputElement)return this.inputElement.selectionStart===0?(this.selection=this.selectedItems.slice(0,this.selectedItems.length-1).toString(),this.toggleFlyout(!1),!1):!0;let t=Array.from(this.listElement.children),i=t.indexOf(document.activeElement);return i>-1?(this.selection=this.selectedItems.splice(i,1).toString(),y.queueUpdate(()=>{t[Math.min(t.length,i)].focus()}),!1):!0}}return this.toggleFlyout(!0),!0}handleFocusIn(e){return!1}handleFocusOut(e){return(this.menuElement===void 0||!this.menuElement.contains(e.relatedTarget))&&this.toggleFlyout(!1),!1}handleSelectionChange(){this.selectedItems.toString()!==this.selection&&(this.selectedItems=this.selection===""?[]:this.selection.split(","),this.updateFilteredOptions(),y.queueUpdate(()=>{this.checkMaxItems()}),this.$emit("selectionchange",{bubbles:!1}))}handleRegionLoaded(e){y.queueUpdate(()=>{this.setFocusedOption(0),this.$emit("menuloaded",{bubbles:!1})})}checkMaxItems(){if(this.inputElement!==void 0)if(this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected){if(document.activeElement===this.inputElement){let e=Array.from(this.listElement.querySelectorAll("[role='listitem']"));e[e.length-1].focus()}this.inputElement.hidden=!0}else this.inputElement.hidden=!1}handleItemInvoke(e){if(e.defaultPrevented)return!1;if(e.target instanceof Oo){let i=Array.from(this.listElement.querySelectorAll("[role='listitem']")).indexOf(e.target);if(i!==-1){let s=this.selectedItems.slice();s.splice(i,1),this.selection=s.toString(),y.queueUpdate(()=>this.incrementFocusedItem(0))}return!1}return!0}handleOptionInvoke(e){return e.defaultPrevented?!1:e.target instanceof Fo?(e.target.value!==void 0&&(this.selection=`${this.selection}${this.selection===""?"":","}${e.target.value}`),this.inputElement.value="",this.query="",this.inputElement.focus(),this.toggleFlyout(!1),!1):!0}incrementFocusedItem(e){if(this.selectedItems.length===0){this.inputElement.focus();return}let t=Array.from(this.listElement.querySelectorAll("[role='listitem']"));if(document.activeElement!==null){let i=t.indexOf(document.activeElement);i===-1&&(i=t.length);let s=Math.min(t.length,Math.max(0,i+e));s===t.length?this.maxSelected!==void 0&&this.selectedItems.length>=this.maxSelected?t[s-1].focus():this.inputElement.focus():t[s].focus()}}disableMenu(){var e,t,i;this.menuFocusIndex=-1,this.menuFocusOptionId=void 0,(e=this.inputElement)===null||e===void 0||e.removeAttribute("aria-activedescendant"),(t=this.inputElement)===null||t===void 0||t.removeAttribute("aria-owns"),(i=this.inputElement)===null||i===void 0||i.removeAttribute("aria-expanded")}setFocusedOption(e){if(!this.flyoutOpen||e===-1||this.showNoOptions||this.showLoading){this.disableMenu();return}if(this.menuElement.optionElements.length===0)return;this.menuElement.optionElements.forEach(i=>{i.setAttribute("aria-selected","false")}),this.menuFocusIndex=e,this.menuFocusIndex>this.menuElement.optionElements.length-1&&(this.menuFocusIndex=this.menuElement.optionElements.length-1),this.menuFocusOptionId=this.menuElement.optionElements[this.menuFocusIndex].id,this.inputElement.setAttribute("aria-owns",this.menuId),this.inputElement.setAttribute("aria-expanded","true"),this.inputElement.setAttribute("aria-activedescendant",this.menuFocusOptionId);let t=this.menuElement.optionElements[this.menuFocusIndex];t.setAttribute("aria-selected","true"),this.menuElement.scrollTo(0,t.offsetTop)}updateListItemTemplate(){var e;this.activeListItemTemplate=(e=this.listItemTemplate)!==null&&e!==void 0?e:this.defaultListItemTemplate}updateOptionTemplate(){var e;this.activeMenuOptionTemplate=(e=this.menuOptionTemplate)!==null&&e!==void 0?e:this.defaultMenuOptionTemplate}updateFilteredOptions(){this.filteredOptionsList=this.optionsList.slice(0),this.filterSelected&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>this.selectedItems.indexOf(e)===-1)),this.filterQuery&&this.query!==""&&this.query!==void 0&&(this.filteredOptionsList=this.filteredOptionsList.filter(e=>e.indexOf(this.query)!==-1))}updateMenuConfig(){let e=this.configLookup[this.menuPlacement];e===null&&(e=Qr),this.menuConfig=Object.assign(Object.assign({},e),{autoUpdateMode:"auto",fixedPlacement:!0,horizontalViewportLock:!1,verticalViewportLock:!1})}};a([d({attribute:"selection"})],O.prototype,"selection",void 0);a([d({attribute:"options"})],O.prototype,"options",void 0);a([d({attribute:"filter-selected",mode:"boolean"})],O.prototype,"filterSelected",void 0);a([d({attribute:"filter-query",mode:"boolean"})],O.prototype,"filterQuery",void 0);a([d({attribute:"max-selected"})],O.prototype,"maxSelected",void 0);a([d({attribute:"no-suggestions-text"})],O.prototype,"noSuggestionsText",void 0);a([d({attribute:"suggestions-available-text"})],O.prototype,"suggestionsAvailableText",void 0);a([d({attribute:"loading-text"})],O.prototype,"loadingText",void 0);a([d({attribute:"label"})],O.prototype,"label",void 0);a([d({attribute:"labelledby"})],O.prototype,"labelledBy",void 0);a([d({attribute:"placeholder"})],O.prototype,"placeholder",void 0);a([d({attribute:"menu-placement"})],O.prototype,"menuPlacement",void 0);a([m],O.prototype,"showLoading",void 0);a([m],O.prototype,"listItemTemplate",void 0);a([m],O.prototype,"defaultListItemTemplate",void 0);a([m],O.prototype,"activeListItemTemplate",void 0);a([m],O.prototype,"menuOptionTemplate",void 0);a([m],O.prototype,"defaultMenuOptionTemplate",void 0);a([m],O.prototype,"activeMenuOptionTemplate",void 0);a([m],O.prototype,"listItemContentsTemplate",void 0);a([m],O.prototype,"menuOptionContentsTemplate",void 0);a([m],O.prototype,"optionsList",void 0);a([m],O.prototype,"query",void 0);a([m],O.prototype,"filteredOptionsList",void 0);a([m],O.prototype,"flyoutOpen",void 0);a([m],O.prototype,"menuId",void 0);a([m],O.prototype,"selectedListTag",void 0);a([m],O.prototype,"menuTag",void 0);a([m],O.prototype,"menuFocusIndex",void 0);a([m],O.prototype,"menuFocusOptionId",void 0);a([m],O.prototype,"showNoOptions",void 0);a([m],O.prototype,"menuConfig",void 0);a([m],O.prototype,"selectedItems",void 0)});var lp=c(()=>{});var cp=c(()=>{});var dp=c(()=>{});var pp=c(()=>{});var up=c(()=>{rp();ap();lp();ip();cp();$n();dp();sp();pp();Tn()});var De,In,hp=c(()=>{De={menuitem:"menuitem",menuitemcheckbox:"menuitemcheckbox",menuitemradio:"menuitemradio"},In={[De.menuitem]:"menuitem",[De.menuitemcheckbox]:"menuitemcheckbox",[De.menuitemradio]:"menuitemradio"}});var Le,mp=c(()=>{S();g();L();$();ve();jt();fe();hp();Le=class extends b{constructor(){super(...arguments),this.role=De.menuitem,this.hasSubmenu=!1,this.currentDirection=D.ltr,this.focusSubmenuOnLoad=!1,this.handleMenuItemKeyDown=e=>{if(e.defaultPrevented)return!1;switch(e.key){case oe:case Re:return this.invoke(),!1;case Ce:return this.expandAndFocus(),!1;case xe:if(this.expanded)return this.expanded=!1,this.focus(),!1}return!0},this.handleMenuItemClick=e=>(e.defaultPrevented||this.disabled||this.invoke(),!1),this.submenuLoaded=()=>{this.focusSubmenuOnLoad&&(this.focusSubmenuOnLoad=!1,this.hasSubmenu&&(this.submenu.focus(),this.setAttribute("tabindex","-1")))},this.handleMouseOver=e=>(this.disabled||!this.hasSubmenu||this.expanded||(this.expanded=!0),!1),this.handleMouseOut=e=>(!this.expanded||this.contains(document.activeElement)||(this.expanded=!1),!1),this.expandAndFocus=()=>{this.hasSubmenu&&(this.focusSubmenuOnLoad=!0,this.expanded=!0)},this.invoke=()=>{if(!this.disabled)switch(this.role){case De.menuitemcheckbox:this.checked=!this.checked;break;case De.menuitem:this.updateSubmenu(),this.hasSubmenu?this.expandAndFocus():this.$emit("change");break;case De.menuitemradio:this.checked||(this.checked=!0);break}},this.updateSubmenu=()=>{this.submenu=this.domChildren().find(e=>e.getAttribute("role")==="menu"),this.hasSubmenu=this.submenu!==void 0}}expandedChanged(e){if(this.$fastController.isConnected){if(this.submenu===void 0)return;this.expanded===!1?this.submenu.collapseExpandedItem():this.currentDirection=ze(this),this.$emit("expanded-change",this,{bubbles:!1})}}checkedChanged(e,t){this.$fastController.isConnected&&this.$emit("change")}connectedCallback(){super.connectedCallback(),y.queueUpdate(()=>{this.updateSubmenu()}),this.startColumnCount||(this.startColumnCount=1),this.observer=new MutationObserver(this.updateSubmenu)}disconnectedCallback(){super.disconnectedCallback(),this.submenu=void 0,this.observer!==void 0&&(this.observer.disconnect(),this.observer=void 0)}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}};a([d({mode:"boolean"})],Le.prototype,"disabled",void 0);a([d({mode:"boolean"})],Le.prototype,"expanded",void 0);a([m],Le.prototype,"startColumnCount",void 0);a([d],Le.prototype,"role",void 0);a([d({mode:"boolean"})],Le.prototype,"checked",void 0);a([m],Le.prototype,"submenuRegion",void 0);a([m],Le.prototype,"hasSubmenu",void 0);a([m],Le.prototype,"currentDirection",void 0);a([m],Le.prototype,"submenu",void 0);I(Le,N)});var fp=c(()=>{});var Rn=c(()=>{fp();mp()});var gp=c(()=>{});var as,bp=c(()=>{S();g();L();Rn();$();as=class o extends b{constructor(){super(...arguments),this.expandedItem=null,this.focusIndex=-1,this.isNestedMenu=()=>this.parentElement!==null&&dt(this.parentElement)&&this.parentElement.getAttribute("role")==="menuitem",this.handleFocusOut=e=>{if(!this.contains(e.relatedTarget)&&this.menuItems!==void 0){this.collapseExpandedItem();let t=this.menuItems.findIndex(this.isFocusableElement);this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.menuItems[t].setAttribute("tabindex","0"),this.focusIndex=t}},this.handleItemFocus=e=>{let t=e.target;this.menuItems!==void 0&&t!==this.menuItems[this.focusIndex]&&(this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.handleExpandedChanged=e=>{if(e.defaultPrevented||e.target===null||this.menuItems===void 0||this.menuItems.indexOf(e.target)<0)return;e.preventDefault();let t=e.target;if(this.expandedItem!==null&&t===this.expandedItem&&t.expanded===!1){this.expandedItem=null;return}t.expanded&&(this.expandedItem!==null&&this.expandedItem!==t&&(this.expandedItem.expanded=!1),this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.expandedItem=t,this.focusIndex=this.menuItems.indexOf(t),t.setAttribute("tabindex","0"))},this.removeItemListeners=()=>{this.menuItems!==void 0&&this.menuItems.forEach(e=>{e.removeEventListener("expanded-change",this.handleExpandedChanged),e.removeEventListener("focus",this.handleItemFocus)})},this.setItems=()=>{let e=this.domChildren();this.removeItemListeners(),this.menuItems=e;let t=this.menuItems.filter(this.isMenuItemElement);t.length&&(this.focusIndex=0);function i(r){let n=r.getAttribute("role"),l=r.querySelector("[slot=start]");return n!==De.menuitem&&l===null||n===De.menuitem&&l!==null?1:n!==De.menuitem&&l!==null?2:0}let s=t.reduce((r,n)=>{let l=i(n);return r>l?r:l},0);t.forEach((r,n)=>{r.setAttribute("tabindex",n===0?"0":"-1"),r.addEventListener("expanded-change",this.handleExpandedChanged),r.addEventListener("focus",this.handleItemFocus),(r instanceof Le||"startColumnCount"in r)&&(r.startColumnCount=s)})},this.changeHandler=e=>{if(this.menuItems===void 0)return;let t=e.target,i=this.menuItems.indexOf(t);if(i!==-1&&t.role==="menuitemradio"&&t.checked===!0){for(let r=i-1;r>=0;--r){let n=this.menuItems[r],l=n.getAttribute("role");if(l===De.menuitemradio&&(n.checked=!1),l==="separator")break}let s=this.menuItems.length-1;for(let r=i+1;r<=s;++r){let n=this.menuItems[r],l=n.getAttribute("role");if(l===De.menuitemradio&&(n.checked=!1),l==="separator")break}}},this.isMenuItemElement=e=>dt(e)&&o.focusableElementRoles.hasOwnProperty(e.getAttribute("role")),this.isFocusableElement=e=>this.isMenuItemElement(e)}itemsChanged(e,t){this.$fastController.isConnected&&this.menuItems!==void 0&&this.setItems()}connectedCallback(){super.connectedCallback(),y.queueUpdate(()=>{this.setItems()}),this.addEventListener("change",this.changeHandler)}disconnectedCallback(){super.disconnectedCallback(),this.removeItemListeners(),this.menuItems=void 0,this.removeEventListener("change",this.changeHandler)}focus(){this.setFocus(0,1)}collapseExpandedItem(){this.expandedItem!==null&&(this.expandedItem.expanded=!1,this.expandedItem=null)}handleMenuKeyDown(e){if(!(e.defaultPrevented||this.menuItems===void 0))switch(e.key){case X:this.setFocus(this.focusIndex+1,1);return;case J:this.setFocus(this.focusIndex-1,-1);return;case de:this.setFocus(this.menuItems.length-1,-1);return;case ce:this.setFocus(0,1);return;default:return!0}}domChildren(){return Array.from(this.children).filter(e=>!e.hasAttribute("hidden"))}setFocus(e,t){if(this.menuItems!==void 0)for(;e>=0&&e<this.menuItems.length;){let i=this.menuItems[e];if(this.isFocusableElement(i)){this.focusIndex>-1&&this.menuItems.length>=this.focusIndex-1&&this.menuItems[this.focusIndex].setAttribute("tabindex","-1"),this.focusIndex=e,i.setAttribute("tabindex","0"),i.focus();break}e+=t}}};as.focusableElementRoles=In;a([m],as.prototype,"items",void 0)});var vp=c(()=>{gp();bp()});var yp=c(()=>{});var An,ls,xp=c(()=>{Ae();$();An=class extends b{},ls=class extends ue(An){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var cs,Cp=c(()=>{cs={email:"email",password:"password",tel:"tel",text:"text",url:"url"}});var we,Xt,ds=c(()=>{S();g();uo();fe();xp();Cp();we=class extends ls{constructor(){super(...arguments),this.type=cs.text}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}typeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.type=this.type,this.validate())}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type",this.type),this.validate(),this.autofocus&&y.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.value=this.control.value}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};a([d({attribute:"readonly",mode:"boolean"})],we.prototype,"readOnly",void 0);a([d({mode:"boolean"})],we.prototype,"autofocus",void 0);a([d],we.prototype,"placeholder",void 0);a([d],we.prototype,"type",void 0);a([d],we.prototype,"list",void 0);a([d({converter:E})],we.prototype,"maxlength",void 0);a([d({converter:E})],we.prototype,"minlength",void 0);a([d],we.prototype,"pattern",void 0);a([d({converter:E})],we.prototype,"size",void 0);a([d({mode:"boolean"})],we.prototype,"spellcheck",void 0);a([m],we.prototype,"defaultSlottedNodes",void 0);Xt=class{};I(Xt,F);I(we,N,Xt)});var En,ps,_p=c(()=>{Ae();$();En=class extends b{},ps=class extends ue(En){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var $e,wp=c(()=>{S();g();L();ve();fe();ds();_p();$e=class extends ps{constructor(){super(...arguments),this.hideStep=!1,this.step=1,this.isUserInput=!1}maxChanged(e,t){var i;this.max=Math.max(t,(i=this.min)!==null&&i!==void 0?i:t);let s=Math.min(this.min,this.max);this.min!==void 0&&this.min!==s&&(this.min=s),this.value=this.getValidValue(this.value)}minChanged(e,t){var i;this.min=Math.min(t,(i=this.max)!==null&&i!==void 0?i:t);let s=Math.max(this.min,this.max);this.max!==void 0&&this.max!==s&&(this.max=s),this.value=this.getValidValue(this.value)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){this.value=this.getValidValue(t),t===this.value&&(this.control&&!this.isUserInput&&(this.control.value=this.value),super.valueChanged(e,this.value),e!==void 0&&!this.isUserInput&&(this.$emit("input"),this.$emit("change")),this.isUserInput=!1)}validate(){super.validate(this.control)}getValidValue(e){var t,i;let s=parseFloat(parseFloat(e).toPrecision(12));return isNaN(s)?s="":(s=Math.min(s,(t=this.max)!==null&&t!==void 0?t:s),s=Math.max(s,(i=this.min)!==null&&i!==void 0?i:s).toString()),s}stepUp(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:this.step:e+this.step;this.value=t.toString()}stepDown(){let e=parseFloat(this.value),t=isNaN(e)?this.min>0?this.min:this.max<0?this.max:this.min?0:0-this.step:e-this.step;this.value=t.toString()}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","number"),this.validate(),this.control.value=this.value,this.autofocus&&y.queueUpdate(()=>{this.focus()})}select(){this.control.select(),this.$emit("select")}handleTextInput(){this.control.value=this.control.value.replace(/[^0-9\-+e.]/g,""),this.isUserInput=!0,this.value=this.control.value}handleChange(){this.$emit("change")}handleKeyDown(e){switch(e.key){case J:return this.stepUp(),!1;case X:return this.stepDown(),!1}return!0}handleBlur(){this.control.value=this.value}};a([d({attribute:"readonly",mode:"boolean"})],$e.prototype,"readOnly",void 0);a([d({mode:"boolean"})],$e.prototype,"autofocus",void 0);a([d({attribute:"hide-step",mode:"boolean"})],$e.prototype,"hideStep",void 0);a([d],$e.prototype,"placeholder",void 0);a([d],$e.prototype,"list",void 0);a([d({converter:E})],$e.prototype,"maxlength",void 0);a([d({converter:E})],$e.prototype,"minlength",void 0);a([d({converter:E})],$e.prototype,"size",void 0);a([d({converter:E})],$e.prototype,"step",void 0);a([d({converter:E})],$e.prototype,"max",void 0);a([d({converter:E})],$e.prototype,"min",void 0);a([m],$e.prototype,"defaultSlottedNodes",void 0);I($e,N,Xt)});var kp=c(()=>{yp();wp()});var Sp,Pp,$p=c(()=>{g();Sp=44,Pp=(o,e)=>k`
    <template
        role="progressbar"
        aria-valuenow="${t=>t.value}"
        aria-valuemin="${t=>t.min}"
        aria-valuemax="${t=>t.max}"
        class="${t=>t.paused?"paused":""}"
    >
        ${ao(t=>typeof t.value=="number",k`
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
                        style="stroke-dasharray: ${t=>Sp*t.percentComplete/100}px ${Sp}px"
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
`});var Tp=c(()=>{$p()});var St,Mp=c(()=>{S();g();$();St=class extends b{constructor(){super(...arguments),this.percentComplete=0}valueChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}minChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}maxChanged(){this.$fastController.isConnected&&this.updatePercentComplete()}connectedCallback(){super.connectedCallback(),this.updatePercentComplete()}updatePercentComplete(){let e=typeof this.min=="number"?this.min:0,t=typeof this.max=="number"?this.max:100,i=typeof this.value=="number"?this.value:0,s=t-e;this.percentComplete=s===0?0:Math.fround((i-e)/s*100)}};a([d({converter:E})],St.prototype,"value",void 0);a([d({converter:E})],St.prototype,"min",void 0);a([d({converter:E})],St.prototype,"max",void 0);a([d({mode:"boolean"})],St.prototype,"paused",void 0);a([m],St.prototype,"percentComplete",void 0)});var Ip=c(()=>{});var Rp=c(()=>{Mp();Ip()});var Ap,Ep=c(()=>{g();L();Ap=(o,e)=>k`
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
            class="positioning-region ${t=>t.orientation===q.horizontal?"horizontal":"vertical"}"
            part="positioning-region"
        >
            <slot
                ${ee({property:"slottedRadioButtons",filter:lo("[role=radio]")})}
            ></slot>
        </div>
    </template>
`});var tt,Dp=c(()=>{S();g();L();jt();$();tt=class extends b{constructor(){super(...arguments),this.orientation=q.horizontal,this.radioChangeHandler=e=>{let t=e.target;t.checked&&(this.slottedRadioButtons.forEach(i=>{i!==t&&(i.checked=!1,this.isInsideFoundationToolbar||i.setAttribute("tabindex","-1"))}),this.selectedRadio=t,this.value=t.value,t.setAttribute("tabindex","0"),this.focusedRadio=t),e.stopPropagation()},this.moveToRadioByIndex=(e,t)=>{let i=e[t];this.isInsideToolbar||(i.setAttribute("tabindex","0"),i.readOnly?this.slottedRadioButtons.forEach(s=>{s!==i&&s.setAttribute("tabindex","-1")}):(i.checked=!0,this.selectedRadio=i)),this.focusedRadio=i,i.focus()},this.moveRightOffGroup=()=>{var e;(e=this.nextElementSibling)===null||e===void 0||e.focus()},this.moveLeftOffGroup=()=>{var e;(e=this.previousElementSibling)===null||e===void 0||e.focus()},this.focusOutHandler=e=>{let t=this.slottedRadioButtons,i=e.target,s=i!==null?t.indexOf(i):0,r=this.focusedRadio?t.indexOf(this.focusedRadio):-1;return(r===0&&s===r||r===t.length-1&&r===s)&&(this.selectedRadio?(this.focusedRadio=this.selectedRadio,this.isInsideFoundationToolbar||(this.selectedRadio.setAttribute("tabindex","0"),t.forEach(n=>{n!==this.selectedRadio&&n.setAttribute("tabindex","-1")}))):(this.focusedRadio=t[0],this.focusedRadio.setAttribute("tabindex","0"),t.forEach(n=>{n!==this.focusedRadio&&n.setAttribute("tabindex","-1")}))),!0},this.clickHandler=e=>{let t=e.target;if(t){let i=this.slottedRadioButtons;t.checked||i.indexOf(t)===0?(t.setAttribute("tabindex","0"),this.selectedRadio=t):(t.setAttribute("tabindex","-1"),this.selectedRadio=null),this.focusedRadio=t}e.preventDefault()},this.shouldMoveOffGroupToTheRight=(e,t,i)=>e===t.length&&this.isInsideToolbar&&i===Ce,this.shouldMoveOffGroupToTheLeft=(e,t)=>(this.focusedRadio?e.indexOf(this.focusedRadio)-1:0)<0&&this.isInsideToolbar&&t===xe,this.checkFocusedRadio=()=>{this.focusedRadio!==null&&!this.focusedRadio.readOnly&&!this.focusedRadio.checked&&(this.focusedRadio.checked=!0,this.focusedRadio.setAttribute("tabindex","0"),this.focusedRadio.focus(),this.selectedRadio=this.focusedRadio)},this.moveRight=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)+1:1,this.shouldMoveOffGroupToTheRight(i,t,e.key)){this.moveRightOffGroup();return}else i===t.length&&(i=0);for(;i<t.length&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;if(i+1>=t.length){if(this.isInsideToolbar)break;i=0}else i+=1}else{this.moveToRadioByIndex(t,i);break}},this.moveLeft=e=>{let t=this.slottedRadioButtons,i=0;if(i=this.focusedRadio?t.indexOf(this.focusedRadio)-1:0,i=i<0?t.length-1:i,this.shouldMoveOffGroupToTheLeft(t,e.key)){this.moveLeftOffGroup();return}for(;i>=0&&t.length>1;)if(t[i].disabled){if(this.focusedRadio&&i===t.indexOf(this.focusedRadio))break;i-1<0?i=t.length-1:i-=1}else{this.moveToRadioByIndex(t,i);break}},this.keydownHandler=e=>{let t=e.key;if(t in qt&&this.isInsideFoundationToolbar)return!0;switch(t){case oe:{this.checkFocusedRadio();break}case Ce:case X:{this.direction===D.ltr?this.moveRight(e):this.moveLeft(e);break}case xe:case J:{this.direction===D.ltr?this.moveLeft(e):this.moveRight(e);break}default:return!0}}}readOnlyChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.readOnly?e.readOnly=!0:e.readOnly=!1})}disabledChanged(){this.slottedRadioButtons!==void 0&&this.slottedRadioButtons.forEach(e=>{this.disabled?e.disabled=!0:e.disabled=!1})}nameChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.setAttribute("name",this.name)})}valueChanged(){this.slottedRadioButtons&&this.slottedRadioButtons.forEach(e=>{e.value===this.value&&(e.checked=!0,this.selectedRadio=e)}),this.$emit("change")}slottedRadioButtonsChanged(e,t){this.slottedRadioButtons&&this.slottedRadioButtons.length>0&&this.setupRadioButtons()}get parentToolbar(){return this.closest('[role="toolbar"]')}get isInsideToolbar(){var e;return(e=this.parentToolbar)!==null&&e!==void 0?e:!1}get isInsideFoundationToolbar(){var e;return!!(!((e=this.parentToolbar)===null||e===void 0)&&e.$fastController)}connectedCallback(){super.connectedCallback(),this.direction=ze(this),this.setupRadioButtons()}disconnectedCallback(){this.slottedRadioButtons.forEach(e=>{e.removeEventListener("change",this.radioChangeHandler)})}setupRadioButtons(){let e=this.slottedRadioButtons.filter(s=>s.hasAttribute("checked")),t=e?e.length:0;if(t>1){let s=e[t-1];s.checked=!0}let i=!1;if(this.slottedRadioButtons.forEach(s=>{this.name!==void 0&&s.setAttribute("name",this.name),this.disabled&&(s.disabled=!0),this.readOnly&&(s.readOnly=!0),this.value&&this.value===s.value?(this.selectedRadio=s,this.focusedRadio=s,s.checked=!0,s.setAttribute("tabindex","0"),i=!0):(this.isInsideFoundationToolbar||s.setAttribute("tabindex","-1"),s.checked=!1),s.addEventListener("change",this.radioChangeHandler)}),this.value===void 0&&this.slottedRadioButtons.length>0){let s=this.slottedRadioButtons.filter(n=>n.hasAttribute("checked")),r=s!==null?s.length:0;if(r>0&&!i){let n=s[r-1];n.checked=!0,this.focusedRadio=n,n.setAttribute("tabindex","0")}else this.slottedRadioButtons[0].setAttribute("tabindex","0"),this.focusedRadio=this.slottedRadioButtons[0]}}};a([d({attribute:"readonly",mode:"boolean"})],tt.prototype,"readOnly",void 0);a([d({attribute:"disabled",mode:"boolean"})],tt.prototype,"disabled",void 0);a([d],tt.prototype,"name",void 0);a([d],tt.prototype,"value",void 0);a([d],tt.prototype,"orientation",void 0);a([m],tt.prototype,"childItems",void 0);a([m],tt.prototype,"slottedRadioButtons",void 0)});var Lp=c(()=>{Ep();Dp()});var Fp,Op=c(()=>{g();Fp=(o,e)=>k`
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
            <slot ${ee("defaultSlottedNodes")}></slot>
        </label>
    </template>
`});var Dn,us,zp=c(()=>{Ae();$();Dn=class extends b{},us=class extends Io(Dn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var xo,Hp=c(()=>{S();g();L();zp();xo=class extends us{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(e.key===Re){!this.checked&&!this.readOnly&&(this.checked=!0);return}return!0},this.proxy.setAttribute("type","radio")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}defaultCheckedChanged(){var e;this.$fastController.isConnected&&!this.dirtyChecked&&(this.isInsideRadioGroup()||(this.checked=(e=this.defaultChecked)!==null&&e!==void 0?e:!1,this.dirtyChecked=!1))}connectedCallback(){var e,t;super.connectedCallback(),this.validate(),((e=this.parentElement)===null||e===void 0?void 0:e.getAttribute("role"))!=="radiogroup"&&this.getAttribute("tabindex")===null&&(this.disabled||this.setAttribute("tabindex","0")),this.checkedAttribute&&(this.dirtyChecked||this.isInsideRadioGroup()||(this.checked=(t=this.defaultChecked)!==null&&t!==void 0?t:!1,this.dirtyChecked=!1))}isInsideRadioGroup(){return this.closest("[role=radiogroup]")!==null}clickHandler(e){!this.disabled&&!this.readOnly&&!this.checked&&(this.checked=!0)}};a([d({attribute:"readonly",mode:"boolean"})],xo.prototype,"readOnly",void 0);a([m],xo.prototype,"name",void 0);a([m],xo.prototype,"defaultSlottedNodes",void 0)});var Bp=c(()=>{Op();Hp()});var Pt,Np=c(()=>{S();g();$();Pt=class extends b{constructor(){super(...arguments),this.framesPerSecond=60,this.updatingItems=!1,this.speed=600,this.easing="ease-in-out",this.flippersHiddenFromAT=!1,this.scrolling=!1,this.resizeDetector=null}get frameTime(){return 1e3/this.framesPerSecond}scrollingChanged(e,t){if(this.scrollContainer){let i=this.scrolling==!0?"scrollstart":"scrollend";this.$emit(i,this.scrollContainer.scrollLeft)}}get isRtl(){return this.scrollItems.length>1&&this.scrollItems[0].offsetLeft>this.scrollItems[1].offsetLeft}connectedCallback(){super.connectedCallback(),this.initializeResizeDetector()}disconnectedCallback(){this.disconnectResizeDetector(),super.disconnectedCallback()}scrollItemsChanged(e,t){t&&!this.updatingItems&&y.queueUpdate(()=>this.setStops())}disconnectResizeDetector(){this.resizeDetector&&(this.resizeDetector.disconnect(),this.resizeDetector=null)}initializeResizeDetector(){this.disconnectResizeDetector(),this.resizeDetector=new window.ResizeObserver(this.resized.bind(this)),this.resizeDetector.observe(this)}updateScrollStops(){this.updatingItems=!0;let e=this.scrollItems.reduce((t,i)=>i instanceof HTMLSlotElement?t.concat(i.assignedElements()):(t.push(i),t),[]);this.scrollItems=e,this.updatingItems=!1}setStops(){this.updateScrollStops();let{scrollContainer:e}=this,{scrollLeft:t}=e,{width:i,left:s}=e.getBoundingClientRect();this.width=i;let r=0,n=this.scrollItems.map((l,p)=>{let{left:h,width:u}=l.getBoundingClientRect(),f=Math.round(h+t-s),v=Math.round(f+u);return this.isRtl?-v:(r=v,p===0?0:f)}).concat(r);n=this.fixScrollMisalign(n),n.sort((l,p)=>Math.abs(l)-Math.abs(p)),this.scrollStops=n,this.setFlippers()}validateStops(e=!0){let t=()=>!!this.scrollStops.find(i=>i>0);return!t()&&e&&this.setStops(),t()}fixScrollMisalign(e){if(this.isRtl&&e.some(t=>t>0)){e.sort((i,s)=>s-i);let t=e[0];e=e.map(i=>i-t)}return e}setFlippers(){var e,t;let i=this.scrollContainer.scrollLeft;if((e=this.previousFlipperContainer)===null||e===void 0||e.classList.toggle("disabled",i===0),this.scrollStops){let s=Math.abs(this.scrollStops[this.scrollStops.length-1]);(t=this.nextFlipperContainer)===null||t===void 0||t.classList.toggle("disabled",this.validateStops(!1)&&Math.abs(i)+this.width>=s)}}scrollInView(e,t=0,i){var s;if(typeof e!="number"&&e&&(e=this.scrollItems.findIndex(r=>r===e||r.contains(e))),e!==void 0){i=i??t;let{scrollContainer:r,scrollStops:n,scrollItems:l}=this,{scrollLeft:p}=this.scrollContainer,{width:h}=r.getBoundingClientRect(),u=n[e],{width:f}=l[e].getBoundingClientRect(),v=u+f,T=p+t>u;if(T||p+h-i<v){let te=(s=[...n].sort((le,Et)=>T?Et-le:le-Et).find(le=>T?le+t<u:le+h-(i??0)>v))!==null&&s!==void 0?s:0;this.scrollToPosition(te)}}}keyupHandler(e){switch(e.key){case"ArrowLeft":this.scrollToPrevious();break;case"ArrowRight":this.scrollToNext();break}}scrollToPrevious(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex((r,n)=>r>=e&&(this.isRtl||n===this.scrollStops.length-1||this.scrollStops[n+1]>e)),i=Math.abs(this.scrollStops[t+1]),s=this.scrollStops.findIndex(r=>Math.abs(r)+this.width>i);(s>=t||s===-1)&&(s=t>0?t-1:0),this.scrollToPosition(this.scrollStops[s],e)}scrollToNext(){this.validateStops();let e=this.scrollContainer.scrollLeft,t=this.scrollStops.findIndex(r=>Math.abs(r)>=Math.abs(e)),i=this.scrollStops.findIndex(r=>Math.abs(e)+this.width<=Math.abs(r)),s=t;i>t+2?s=i-2:t<this.scrollStops.length-2&&(s=t+1),this.scrollToPosition(this.scrollStops[s],e)}scrollToPosition(e,t=this.scrollContainer.scrollLeft){var i;if(this.scrolling)return;this.scrolling=!0;let s=(i=this.duration)!==null&&i!==void 0?i:`${Math.abs(e-t)/this.speed}s`;this.content.style.setProperty("transition-duration",s);let r=parseFloat(getComputedStyle(this.content).getPropertyValue("transition-duration")),n=h=>{h&&h.target!==h.currentTarget||(this.content.style.setProperty("transition-duration","0s"),this.content.style.removeProperty("transform"),this.scrollContainer.style.setProperty("scroll-behavior","auto"),this.scrollContainer.scrollLeft=e,this.setFlippers(),this.content.removeEventListener("transitionend",n),this.scrolling=!1)};if(r===0){n();return}this.content.addEventListener("transitionend",n);let l=this.scrollContainer.scrollWidth-this.scrollContainer.clientWidth,p=this.scrollContainer.scrollLeft-Math.min(e,l);this.isRtl&&(p=this.scrollContainer.scrollLeft+Math.min(Math.abs(e),l)),this.content.style.setProperty("transition-property","transform"),this.content.style.setProperty("transition-timing-function",this.easing),this.content.style.setProperty("transform",`translateX(${p}px)`)}resized(){this.resizeTimeout&&(this.resizeTimeout=clearTimeout(this.resizeTimeout)),this.resizeTimeout=setTimeout(()=>{this.width=this.scrollContainer.offsetWidth,this.setFlippers()},this.frameTime)}scrolled(){this.scrollTimeout&&(this.scrollTimeout=clearTimeout(this.scrollTimeout)),this.scrollTimeout=setTimeout(()=>{this.setFlippers()},this.frameTime)}};a([d({converter:E})],Pt.prototype,"speed",void 0);a([d],Pt.prototype,"duration",void 0);a([d],Pt.prototype,"easing",void 0);a([d({attribute:"flippers-hidden-from-at",converter:ro})],Pt.prototype,"flippersHiddenFromAT",void 0);a([m],Pt.prototype,"scrolling",void 0);a([m],Pt.prototype,"scrollItems",void 0);a([d({attribute:"view"})],Pt.prototype,"view",void 0)});var Gp=c(()=>{});var Vp=c(()=>{Np();Gp()});function qp(o,e,t){return o.nodeType!==Node.TEXT_NODE?!0:typeof o.nodeValue=="string"&&!!o.nodeValue.trim().length}var Ln=c(()=>{});var Up=c(()=>{});var Fn,hs,jp=c(()=>{Ae();$();Fn=class extends b{},hs=class extends ue(Fn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var Be,ms,Wp=c(()=>{S();g();uo();fe();jp();Be=class extends hs{readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly,this.validate())}autofocusChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.autofocus=this.autofocus,this.validate())}placeholderChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.placeholder=this.placeholder)}listChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.setAttribute("list",this.list),this.validate())}maxlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.maxLength=this.maxlength,this.validate())}minlengthChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.minLength=this.minlength,this.validate())}patternChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.pattern=this.pattern,this.validate())}sizeChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.size=this.size)}spellcheckChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.spellcheck=this.spellcheck)}connectedCallback(){super.connectedCallback(),this.validate(),this.autofocus&&y.queueUpdate(()=>{this.focus()})}validate(){super.validate(this.control)}handleTextInput(){this.value=this.control.value}handleClearInput(){this.value="",this.control.focus(),this.handleChange()}handleChange(){this.$emit("change")}};a([d({attribute:"readonly",mode:"boolean"})],Be.prototype,"readOnly",void 0);a([d({mode:"boolean"})],Be.prototype,"autofocus",void 0);a([d],Be.prototype,"placeholder",void 0);a([d],Be.prototype,"list",void 0);a([d({converter:E})],Be.prototype,"maxlength",void 0);a([d({converter:E})],Be.prototype,"minlength",void 0);a([d],Be.prototype,"pattern",void 0);a([d({converter:E})],Be.prototype,"size",void 0);a([d({mode:"boolean"})],Be.prototype,"spellcheck",void 0);a([m],Be.prototype,"defaultSlottedNodes",void 0);ms=class{};I(ms,F);I(Be,N,ms)});var Qp=c(()=>{Up();Wp()});var On,fs,Yp=c(()=>{Pn();Ae();On=class extends yo{},fs=class extends ue(On){constructor(){super(...arguments),this.proxy=document.createElement("select")}}});var ot,ci,Xp=c(()=>{S();g();L();bo();ve();fe();Yp();Zi();ot=class extends fs{constructor(){super(...arguments),this.open=!1,this.forcedPosition=!1,this.listboxId=Oe("listbox-"),this.maxHeight=0}openChanged(e,t){if(this.collapsible){if(this.open){this.ariaControls=this.listboxId,this.ariaExpanded="true",this.setPositioning(),this.focusAndScrollOptionIntoView(),this.indexWhenOpened=this.selectedIndex,y.queueUpdate(()=>this.focus());return}this.ariaControls="",this.ariaExpanded="false"}}get collapsible(){return!(this.multiple||typeof this.size=="number")}get value(){return w.track(this,"value"),this._value}set value(e){var t,i,s,r,n,l,p;let h=`${this._value}`;if(!((t=this._options)===null||t===void 0)&&t.length){let u=this._options.findIndex(T=>T.value===e),f=(s=(i=this._options[this.selectedIndex])===null||i===void 0?void 0:i.value)!==null&&s!==void 0?s:null,v=(n=(r=this._options[u])===null||r===void 0?void 0:r.value)!==null&&n!==void 0?n:null;(u===-1||f!==v)&&(e="",this.selectedIndex=u),e=(p=(l=this.firstSelectedOption)===null||l===void 0?void 0:l.value)!==null&&p!==void 0?p:e}h!==e&&(this._value=e,super.valueChanged(h,e),w.notify(this,"value"),this.updateDisplayValue())}updateValue(e){var t,i;this.$fastController.isConnected&&(this.value=(i=(t=this.firstSelectedOption)===null||t===void 0?void 0:t.value)!==null&&i!==void 0?i:""),e&&(this.$emit("input"),this.$emit("change",this,{bubbles:!0,composed:void 0}))}selectedIndexChanged(e,t){super.selectedIndexChanged(e,t),this.updateValue()}positionChanged(e,t){this.positionAttribute=t,this.setPositioning()}setPositioning(){let e=this.getBoundingClientRect(),i=window.innerHeight-e.bottom;this.position=this.forcedPosition?this.positionAttribute:e.top>i?pt.above:pt.below,this.positionAttribute=this.forcedPosition?this.positionAttribute:this.position,this.maxHeight=this.position===pt.above?~~e.top:~~i}get displayValue(){var e,t;return w.track(this,"displayValue"),(t=(e=this.firstSelectedOption)===null||e===void 0?void 0:e.text)!==null&&t!==void 0?t:""}disabledChanged(e,t){super.disabledChanged&&super.disabledChanged(e,t),this.ariaDisabled=this.disabled?"true":"false"}formResetCallback(){this.setProxyOptions(),super.setDefaultSelectedOption(),this.selectedIndex===-1&&(this.selectedIndex=0)}clickHandler(e){if(!this.disabled){if(this.open){let t=e.target.closest("option,[role=option]");if(t&&t.disabled)return}return super.clickHandler(e),this.open=this.collapsible&&!this.open,!this.open&&this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0),!0}}focusoutHandler(e){var t;if(super.focusoutHandler(e),!this.open)return!0;let i=e.relatedTarget;if(this.isSameNode(i)){this.focus();return}!((t=this.options)===null||t===void 0)&&t.includes(i)||(this.open=!1,this.indexWhenOpened!==this.selectedIndex&&this.updateValue(!0))}handleChange(e,t){super.handleChange(e,t),t==="value"&&this.updateValue()}slottedOptionsChanged(e,t){this.options.forEach(i=>{w.getNotifier(i).unsubscribe(this,"value")}),super.slottedOptionsChanged(e,t),this.options.forEach(i=>{w.getNotifier(i).subscribe(this,"value")}),this.setProxyOptions(),this.updateValue()}mousedownHandler(e){var t;return e.offsetX>=0&&e.offsetX<=((t=this.listbox)===null||t===void 0?void 0:t.scrollWidth)?super.mousedownHandler(e):this.collapsible}multipleChanged(e,t){super.multipleChanged(e,t),this.proxy&&(this.proxy.multiple=t)}selectedOptionsChanged(e,t){var i;super.selectedOptionsChanged(e,t),(i=this.options)===null||i===void 0||i.forEach((s,r)=>{var n;let l=(n=this.proxy)===null||n===void 0?void 0:n.options.item(r);l&&(l.selected=s.selected)})}setDefaultSelectedOption(){var e;let t=(e=this.options)!==null&&e!==void 0?e:Array.from(this.children).filter(ge.slottedOptionFilter),i=t?.findIndex(s=>s.hasAttribute("selected")||s.selected||s.value===this.value);if(i!==-1){this.selectedIndex=i;return}this.selectedIndex=0}setProxyOptions(){this.proxy instanceof HTMLSelectElement&&this.options&&(this.proxy.options.length=0,this.options.forEach(e=>{let t=e.proxy||(e instanceof HTMLOptionElement?e.cloneNode():null);t&&this.proxy.options.add(t)}))}keydownHandler(e){super.keydownHandler(e);let t=e.key||e.key.charCodeAt(0);switch(t){case Re:{e.preventDefault(),this.collapsible&&this.typeAheadExpired&&(this.open=!this.open);break}case ce:case de:{e.preventDefault();break}case oe:{e.preventDefault(),this.open=!this.open;break}case Ie:{this.collapsible&&this.open&&(e.preventDefault(),this.open=!1);break}case Vt:return this.collapsible&&this.open&&(e.preventDefault(),this.open=!1),!0}return!this.open&&this.indexWhenOpened!==this.selectedIndex&&(this.updateValue(!0),this.indexWhenOpened=this.selectedIndex),!(t===X||t===J)}connectedCallback(){super.connectedCallback(),this.forcedPosition=!!this.positionAttribute,this.addEventListener("contentchange",this.updateDisplayValue)}disconnectedCallback(){this.removeEventListener("contentchange",this.updateDisplayValue),super.disconnectedCallback()}sizeChanged(e,t){super.sizeChanged(e,t),this.proxy&&(this.proxy.size=t)}updateDisplayValue(){this.collapsible&&w.notify(this,"displayValue")}};a([d({attribute:"open",mode:"boolean"})],ot.prototype,"open",void 0);a([il],ot.prototype,"collapsible",null);a([m],ot.prototype,"control",void 0);a([d({attribute:"position"})],ot.prototype,"positionAttribute",void 0);a([m],ot.prototype,"position",void 0);a([m],ot.prototype,"maxHeight",void 0);ci=class{};a([m],ci.prototype,"ariaControls",void 0);I(ci,Ye);I(ot,N,ci)});var Jp,Zp=c(()=>{g();bo();ve();Jp=(o,e)=>k`
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
        ${ao(t=>t.collapsible,k`
                <div
                    class="control"
                    part="control"
                    ?disabled="${t=>t.disabled}"
                    ${Z("control")}
                >
                    ${je(o,e)}
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
                    ${Ue(o,e)}
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
                ${ee({filter:ge.slottedOptionFilter,flatten:!0,property:"slottedOptions"})}
            ></slot>
        </div>
    </template>
`});var Kp=c(()=>{Xp();Zi();Zp()});var eu=c(()=>{});var zo,tu=c(()=>{S();g();$();zo=class extends b{constructor(){super(...arguments),this.shape="rect"}};a([d],zo.prototype,"fill",void 0);a([d],zo.prototype,"shape",void 0);a([d],zo.prototype,"pattern",void 0);a([d({mode:"boolean"})],zo.prototype,"shimmer",void 0)});var ou=c(()=>{eu();tu()});var iu=c(()=>{});function di(o,e,t,i){let s=Ut(0,1,(o-e)/(t-e));return i===D.rtl&&(s=1-s),s}var zn=c(()=>{L()});var gs,ht,su=c(()=>{S();g();L();zn();$();gs={min:0,max:0,direction:D.ltr,orientation:q.horizontal,disabled:!1},ht=class extends b{constructor(){super(...arguments),this.hideMark=!1,this.sliderDirection=D.ltr,this.getSliderConfiguration=()=>{if(!this.isSliderConfig(this.parentNode))this.sliderDirection=gs.direction||D.ltr,this.sliderOrientation=gs.orientation||q.horizontal,this.sliderMaxPosition=gs.max,this.sliderMinPosition=gs.min;else{let e=this.parentNode,{min:t,max:i,direction:s,orientation:r,disabled:n}=e;n!==void 0&&(this.disabled=n),this.sliderDirection=s||D.ltr,this.sliderOrientation=r||q.horizontal,this.sliderMaxPosition=i,this.sliderMinPosition=t}},this.positionAsStyle=()=>{let e=this.sliderDirection?this.sliderDirection:D.ltr,t=di(Number(this.position),Number(this.sliderMinPosition),Number(this.sliderMaxPosition)),i=Math.round((1-t)*100),s=Math.round(t*100);return Number.isNaN(s)&&Number.isNaN(i)&&(i=50,s=50),this.sliderOrientation===q.horizontal?e===D.rtl?`right: ${s}%; left: ${i}%;`:`left: ${s}%; right: ${i}%;`:`top: ${s}%; bottom: ${i}%;`}}positionChanged(){this.positionStyle=this.positionAsStyle()}sliderOrientationChanged(){}connectedCallback(){super.connectedCallback(),this.getSliderConfiguration(),this.positionStyle=this.positionAsStyle(),this.notifier=w.getNotifier(this.parentNode),this.notifier.subscribe(this,"orientation"),this.notifier.subscribe(this,"direction"),this.notifier.subscribe(this,"max"),this.notifier.subscribe(this,"min")}disconnectedCallback(){super.disconnectedCallback(),this.notifier.unsubscribe(this,"orientation"),this.notifier.unsubscribe(this,"direction"),this.notifier.unsubscribe(this,"max"),this.notifier.unsubscribe(this,"min")}handleChange(e,t){switch(t){case"direction":this.sliderDirection=e.direction;break;case"orientation":this.sliderOrientation=e.orientation;break;case"max":this.sliderMaxPosition=e.max;break;case"min":this.sliderMinPosition=e.min;break;default:break}this.positionStyle=this.positionAsStyle()}isSliderConfig(e){return e.max!==void 0&&e.min!==void 0}};a([m],ht.prototype,"positionStyle",void 0);a([d],ht.prototype,"position",void 0);a([d({attribute:"hide-mark",mode:"boolean"})],ht.prototype,"hideMark",void 0);a([d({attribute:"disabled",mode:"boolean"})],ht.prototype,"disabled",void 0);a([m],ht.prototype,"sliderOrientation",void 0);a([m],ht.prototype,"sliderMinPosition",void 0);a([m],ht.prototype,"sliderMaxPosition",void 0);a([m],ht.prototype,"sliderDirection",void 0)});var ru=c(()=>{iu();su()});var nu=c(()=>{});var Hn,bs,au=c(()=>{Ae();$();Hn=class extends b{},bs=class extends ue(Hn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ag,ye,lu=c(()=>{S();g();L();jt();zn();au();ag={singleValue:"single-value"},ye=class extends bs{constructor(){super(...arguments),this.direction=D.ltr,this.isDragging=!1,this.trackWidth=0,this.trackMinWidth=0,this.trackHeight=0,this.trackLeft=0,this.trackMinHeight=0,this.valueTextFormatter=()=>null,this.min=0,this.max=10,this.step=1,this.orientation=q.horizontal,this.mode=ag.singleValue,this.keypressHandler=e=>{if(!this.readOnly){if(e.key===ce)e.preventDefault(),this.value=`${this.min}`;else if(e.key===de)e.preventDefault(),this.value=`${this.max}`;else if(!e.shiftKey)switch(e.key){case Ce:case J:e.preventDefault(),this.increment();break;case xe:case X:e.preventDefault(),this.decrement();break}}},this.setupTrackConstraints=()=>{let e=this.track.getBoundingClientRect();this.trackWidth=this.track.clientWidth,this.trackMinWidth=this.track.clientLeft,this.trackHeight=e.bottom,this.trackMinHeight=e.top,this.trackLeft=this.getBoundingClientRect().left,this.trackWidth===0&&(this.trackWidth=1)},this.setupListeners=(e=!1)=>{let t=`${e?"remove":"add"}EventListener`;this[t]("keydown",this.keypressHandler),this[t]("mousedown",this.handleMouseDown),this.thumb[t]("mousedown",this.handleThumbMouseDown,{passive:!0}),this.thumb[t]("touchstart",this.handleThumbMouseDown,{passive:!0}),e&&(this.handleMouseDown(null),this.handleThumbMouseDown(null))},this.initialValue="",this.handleThumbMouseDown=e=>{if(e){if(this.readOnly||this.disabled||e.defaultPrevented)return;e.target.focus()}let t=`${e!==null?"add":"remove"}EventListener`;window[t]("mouseup",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove,{passive:!0}),window[t]("touchmove",this.handleMouseMove,{passive:!0}),window[t]("touchend",this.handleWindowMouseUp),this.isDragging=e!==null},this.handleMouseMove=e=>{if(this.readOnly||this.disabled||e.defaultPrevented)return;let t=window.TouchEvent&&e instanceof TouchEvent?e.touches[0]:e,i=this.orientation===q.horizontal?t.pageX-document.documentElement.scrollLeft-this.trackLeft:t.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`},this.calculateNewValue=e=>{let t=di(e,this.orientation===q.horizontal?this.trackMinWidth:this.trackMinHeight,this.orientation===q.horizontal?this.trackWidth:this.trackHeight,this.direction),i=(this.max-this.min)*t+this.min;return this.convertToConstrainedValue(i)},this.handleWindowMouseUp=e=>{this.stopDragging()},this.stopDragging=()=>{this.isDragging=!1,this.handleMouseDown(null),this.handleThumbMouseDown(null)},this.handleMouseDown=e=>{let t=`${e!==null?"add":"remove"}EventListener`;if((e===null||!this.disabled&&!this.readOnly)&&(window[t]("mouseup",this.handleWindowMouseUp),window.document[t]("mouseleave",this.handleWindowMouseUp),window[t]("mousemove",this.handleMouseMove),e)){e.preventDefault(),this.setupTrackConstraints(),e.target.focus();let i=this.orientation===q.horizontal?e.pageX-document.documentElement.scrollLeft-this.trackLeft:e.pageY-document.documentElement.scrollTop;this.value=`${this.calculateNewValue(i)}`}},this.convertToConstrainedValue=e=>{isNaN(e)&&(e=this.min);let t=e-this.min,i=Math.round(t/this.step),s=t-i*(this.stepMultiplier*this.step)/this.stepMultiplier;return t=s>=Number(this.step)/2?t-s+Number(this.step):t-s,t+this.min}}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly)}get valueAsNumber(){return parseFloat(super.value)}set valueAsNumber(e){this.value=e.toString()}valueChanged(e,t){super.valueChanged(e,t),this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction),this.$emit("change")}minChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.min=`${this.min}`),this.validate()}maxChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.max=`${this.max}`),this.validate()}stepChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.step=`${this.step}`),this.updateStepMultiplier(),this.validate()}orientationChanged(){this.$fastController.isConnected&&this.setThumbPositionForOrientation(this.direction)}connectedCallback(){super.connectedCallback(),this.proxy.setAttribute("type","range"),this.direction=ze(this),this.updateStepMultiplier(),this.setupTrackConstraints(),this.setupListeners(),this.setupDefaultValue(),this.setThumbPositionForOrientation(this.direction)}disconnectedCallback(){this.setupListeners(!0)}increment(){let e=this.direction!==D.rtl&&this.orientation!==q.vertical?Number(this.value)+Number(this.step):Number(this.value)-Number(this.step),t=this.convertToConstrainedValue(e),i=t<Number(this.max)?`${t}`:`${this.max}`;this.value=i}decrement(){let e=this.direction!==D.rtl&&this.orientation!==q.vertical?Number(this.value)-Number(this.step):Number(this.value)+Number(this.step),t=this.convertToConstrainedValue(e),i=t>Number(this.min)?`${t}`:`${this.min}`;this.value=i}setThumbPositionForOrientation(e){let i=(1-di(Number(this.value),Number(this.min),Number(this.max),e))*100;this.orientation===q.horizontal?this.position=this.isDragging?`right: ${i}%; transition: none;`:`right: ${i}%; transition: all 0.2s ease;`:this.position=this.isDragging?`bottom: ${i}%; transition: none;`:`bottom: ${i}%; transition: all 0.2s ease;`}updateStepMultiplier(){let e=this.step+"",t=this.step%1?e.length-e.indexOf(".")-1:0;this.stepMultiplier=Math.pow(10,t)}get midpoint(){return`${this.convertToConstrainedValue((this.max+this.min)/2)}`}setupDefaultValue(){if(typeof this.value=="string")if(this.value.length===0)this.initialValue=this.midpoint;else{let e=parseFloat(this.value);!Number.isNaN(e)&&(e<this.min||e>this.max)&&(this.value=this.midpoint)}}};a([d({attribute:"readonly",mode:"boolean"})],ye.prototype,"readOnly",void 0);a([m],ye.prototype,"direction",void 0);a([m],ye.prototype,"isDragging",void 0);a([m],ye.prototype,"position",void 0);a([m],ye.prototype,"trackWidth",void 0);a([m],ye.prototype,"trackMinWidth",void 0);a([m],ye.prototype,"trackHeight",void 0);a([m],ye.prototype,"trackLeft",void 0);a([m],ye.prototype,"trackMinHeight",void 0);a([m],ye.prototype,"valueTextFormatter",void 0);a([d({converter:E})],ye.prototype,"min",void 0);a([d({converter:E})],ye.prototype,"max",void 0);a([d({converter:E})],ye.prototype,"step",void 0);a([d],ye.prototype,"orientation",void 0);a([d],ye.prototype,"mode",void 0)});var cu=c(()=>{nu();lu()});var du=c(()=>{});var Bn,vs,pu=c(()=>{Ae();$();Bn=class extends b{},vs=class extends Io(Bn){constructor(){super(...arguments),this.proxy=document.createElement("input")}}});var ys,uu=c(()=>{S();g();L();pu();ys=class extends vs{constructor(){super(),this.initialValue="on",this.keypressHandler=e=>{if(!this.readOnly)switch(e.key){case oe:case Re:this.checked=!this.checked;break}},this.clickHandler=e=>{!this.disabled&&!this.readOnly&&(this.checked=!this.checked)},this.proxy.setAttribute("type","checkbox")}readOnlyChanged(){this.proxy instanceof HTMLInputElement&&(this.proxy.readOnly=this.readOnly),this.readOnly?this.classList.add("readonly"):this.classList.remove("readonly")}checkedChanged(e,t){super.checkedChanged(e,t),this.checked?this.classList.add("checked"):this.classList.remove("checked")}};a([d({attribute:"readonly",mode:"boolean"})],ys.prototype,"readOnly",void 0);a([m],ys.prototype,"defaultSlottedNodes",void 0)});var hu=c(()=>{du();uu()});var mu,fu=c(()=>{g();mu=(o,e)=>k`
    <template slot="tabpanel" role="tabpanel">
        <slot></slot>
    </template>
`});var xs,gu=c(()=>{$();xs=class extends b{}});var bu=c(()=>{fu();gu()});var vu,yu=c(()=>{g();vu=(o,e)=>k`
    <template slot="tab" role="tab" aria-disabled="${t=>t.disabled}">
        <slot></slot>
    </template>
`});var pi,xu=c(()=>{S();g();$();pi=class extends b{};a([d({mode:"boolean"})],pi.prototype,"disabled",void 0)});var Cu=c(()=>{yu();xu()});var _u,wu=c(()=>{g();ve();_u=(o,e)=>k`
    <template class="${t=>t.orientation}">
        ${je(o,e)}
        <div class="tablist" part="tablist" role="tablist">
            <slot class="tab" name="tab" part="tab" ${ee("tabs")}></slot>

            ${ao(t=>t.showActiveIndicator,k`
                    <div
                        ${Z("activeIndicatorRef")}
                        class="activeIndicator"
                        part="activeIndicator"
                    ></div>
                `)}
        </div>
        ${Ue(o,e)}
        <div class="tabpanel" part="tabpanel">
            <slot name="tabpanel" ${ee("tabpanels")}></slot>
        </div>
    </template>
`});var Cs,Xe,ku=c(()=>{S();g();L();ve();fe();$();Cs={vertical:"vertical",horizontal:"horizontal"},Xe=class extends b{constructor(){super(...arguments),this.orientation=Cs.horizontal,this.activeindicator=!0,this.showActiveIndicator=!0,this.prevActiveTabIndex=0,this.activeTabIndex=0,this.ticking=!1,this.change=()=>{this.$emit("change",this.activetab)},this.isDisabledElement=e=>e.getAttribute("aria-disabled")==="true",this.isHiddenElement=e=>e.hasAttribute("hidden"),this.isFocusableElement=e=>!this.isDisabledElement(e)&&!this.isHiddenElement(e),this.setTabs=()=>{let e="gridColumn",t="gridRow",i=this.isHorizontal()?e:t;this.activeTabIndex=this.getActiveIndex(),this.showActiveIndicator=!1,this.tabs.forEach((s,r)=>{if(s.slot==="tab"){let n=this.activeTabIndex===r&&this.isFocusableElement(s);this.activeindicator&&this.isFocusableElement(s)&&(this.showActiveIndicator=!0);let l=this.tabIds[r],p=this.tabpanelIds[r];s.setAttribute("id",l),s.setAttribute("aria-selected",n?"true":"false"),s.setAttribute("aria-controls",p),s.addEventListener("click",this.handleTabClick),s.addEventListener("keydown",this.handleTabKeyDown),s.setAttribute("tabindex",n?"0":"-1"),n&&(this.activetab=s,this.activeid=l)}s.style[e]="",s.style[t]="",s.style[i]=`${r+1}`,this.isHorizontal()?s.classList.remove("vertical"):s.classList.add("vertical")})},this.setTabPanels=()=>{this.tabpanels.forEach((e,t)=>{let i=this.tabIds[t],s=this.tabpanelIds[t];e.setAttribute("id",s),e.setAttribute("aria-labelledby",i),this.activeTabIndex!==t?e.setAttribute("hidden",""):e.removeAttribute("hidden")})},this.handleTabClick=e=>{let t=e.currentTarget;t.nodeType===1&&this.isFocusableElement(t)&&(this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=this.tabs.indexOf(t),this.setComponent())},this.handleTabKeyDown=e=>{if(this.isHorizontal())switch(e.key){case xe:e.preventDefault(),this.adjustBackward(e);break;case Ce:e.preventDefault(),this.adjustForward(e);break}else switch(e.key){case J:e.preventDefault(),this.adjustBackward(e);break;case X:e.preventDefault(),this.adjustForward(e);break}switch(e.key){case ce:e.preventDefault(),this.adjust(-this.activeTabIndex);break;case de:e.preventDefault(),this.adjust(this.tabs.length-this.activeTabIndex-1);break}},this.adjustForward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)+1:1,i===t.length&&(i=0);i<t.length&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else{if(this.activetab&&i===t.indexOf(this.activetab))break;i+1>=t.length?i=0:i+=1}},this.adjustBackward=e=>{let t=this.tabs,i=0;for(i=this.activetab?t.indexOf(this.activetab)-1:0,i=i<0?t.length-1:i;i>=0&&t.length>1;)if(this.isFocusableElement(t[i])){this.moveToTabByIndex(t,i);break}else i-1<0?i=t.length-1:i-=1},this.moveToTabByIndex=(e,t)=>{let i=e[t];this.activetab=i,this.prevActiveTabIndex=this.activeTabIndex,this.activeTabIndex=t,i.focus(),this.setComponent()}}orientationChanged(){this.$fastController.isConnected&&(this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}activeidChanged(e,t){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.prevActiveTabIndex=this.tabs.findIndex(i=>i.id===e),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabsChanged(){this.$fastController.isConnected&&this.tabs.length<=this.tabpanels.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}tabpanelsChanged(){this.$fastController.isConnected&&this.tabpanels.length<=this.tabs.length&&(this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.setTabs(),this.setTabPanels(),this.handleActiveIndicatorPosition())}getActiveIndex(){return this.activeid!==void 0?this.tabIds.indexOf(this.activeid)===-1?0:this.tabIds.indexOf(this.activeid):0}getTabIds(){return this.tabs.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`tab-${Oe()}`})}getTabPanelIds(){return this.tabpanels.map(e=>{var t;return(t=e.getAttribute("id"))!==null&&t!==void 0?t:`panel-${Oe()}`})}setComponent(){this.activeTabIndex!==this.prevActiveTabIndex&&(this.activeid=this.tabIds[this.activeTabIndex],this.focusTab(),this.change())}isHorizontal(){return this.orientation===Cs.horizontal}handleActiveIndicatorPosition(){this.showActiveIndicator&&this.activeindicator&&this.activeTabIndex!==this.prevActiveTabIndex&&(this.ticking?this.ticking=!1:(this.ticking=!0,this.animateActiveIndicator()))}animateActiveIndicator(){this.ticking=!0;let e=this.isHorizontal()?"gridColumn":"gridRow",t=this.isHorizontal()?"translateX":"translateY",i=this.isHorizontal()?"offsetLeft":"offsetTop",s=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`;let r=this.activeIndicatorRef[i];this.activeIndicatorRef.style[e]=`${this.prevActiveTabIndex+1}`;let n=r-s;this.activeIndicatorRef.style.transform=`${t}(${n}px)`,this.activeIndicatorRef.classList.add("activeIndicatorTransition"),this.activeIndicatorRef.addEventListener("transitionend",()=>{this.ticking=!1,this.activeIndicatorRef.style[e]=`${this.activeTabIndex+1}`,this.activeIndicatorRef.style.transform=`${t}(0px)`,this.activeIndicatorRef.classList.remove("activeIndicatorTransition")})}adjust(e){let t=this.tabs.filter(n=>this.isFocusableElement(n)),i=t.indexOf(this.activetab),s=Ut(0,t.length-1,i+e),r=this.tabs.indexOf(t[s]);r>-1&&this.moveToTabByIndex(this.tabs,r)}focusTab(){this.tabs[this.activeTabIndex].focus()}connectedCallback(){super.connectedCallback(),this.tabIds=this.getTabIds(),this.tabpanelIds=this.getTabPanelIds(),this.activeTabIndex=this.getActiveIndex()}};a([d],Xe.prototype,"orientation",void 0);a([d],Xe.prototype,"activeid",void 0);a([m],Xe.prototype,"tabs",void 0);a([m],Xe.prototype,"tabpanels",void 0);a([d({mode:"boolean"})],Xe.prototype,"activeindicator",void 0);a([m],Xe.prototype,"activeIndicatorRef",void 0);a([m],Xe.prototype,"showActiveIndicator",void 0);I(Xe,N)});var Su=c(()=>{wu();ku()});var Nn,_s,Pu=c(()=>{Ae();$();Nn=class extends b{},_s=class extends ue(Nn){constructor(){super(...arguments),this.proxy=document.createElement("textarea")}}});var Ho,$u=c(()=>{Ho={none:"none",both:"both",horizontal:"horizontal",vertical:"vertical"}});var be,Gn=c(()=>{S();g();ds();fe();Pu();$u();be=class extends _s{constructor(){super(...arguments),this.resize=Ho.none,this.cols=20,this.handleTextInput=()=>{this.value=this.control.value}}readOnlyChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.readOnly=this.readOnly)}autofocusChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.autofocus=this.autofocus)}listChanged(){this.proxy instanceof HTMLTextAreaElement&&this.proxy.setAttribute("list",this.list)}maxlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.maxLength=this.maxlength)}minlengthChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.minLength=this.minlength)}spellcheckChanged(){this.proxy instanceof HTMLTextAreaElement&&(this.proxy.spellcheck=this.spellcheck)}select(){this.control.select(),this.$emit("select")}handleChange(){this.$emit("change")}validate(){super.validate(this.control)}};a([d({mode:"boolean"})],be.prototype,"readOnly",void 0);a([d],be.prototype,"resize",void 0);a([d({mode:"boolean"})],be.prototype,"autofocus",void 0);a([d({attribute:"form"})],be.prototype,"formId",void 0);a([d],be.prototype,"list",void 0);a([d({converter:E})],be.prototype,"maxlength",void 0);a([d({converter:E})],be.prototype,"minlength",void 0);a([d],be.prototype,"name",void 0);a([d],be.prototype,"placeholder",void 0);a([d({converter:E,mode:"fromView"})],be.prototype,"cols",void 0);a([d({converter:E,mode:"fromView"})],be.prototype,"rows",void 0);a([d({mode:"boolean"})],be.prototype,"spellcheck",void 0);a([m],be.prototype,"defaultSlottedNodes",void 0);I(be,Xt)});var Tu,Mu=c(()=>{g();Gn();Tu=(o,e)=>k`
    <template
        class="
            ${t=>t.readOnly?"readonly":""}
            ${t=>t.resize!==Ho.none?`resize-${t.resize}`:""}"
    >
        <label
            part="label"
            for="control"
            class="${t=>t.defaultSlottedNodes&&t.defaultSlottedNodes.length?"label":"label label__hidden"}"
        >
            <slot ${ee("defaultSlottedNodes")}></slot>
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
`});var Iu=c(()=>{Mu();Gn()});var Ru,Au=c(()=>{g();ve();Ln();Ru=(o,e)=>k`
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
                ${ee({property:"defaultSlottedNodes",filter:qp})}
            ></slot>
        </label>
        <div class="root" part="root">
            ${je(o,e)}
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
            ${Ue(o,e)}
        </div>
    </template>
`});var Eu=c(()=>{Au();ds()});var Du=c(()=>{});function Lu(o){let e=o.getRootNode();return e instanceof ShadowRoot?e.activeElement:document.activeElement}var Fu=c(()=>{});var Ou,Jt,Bo,zu=c(()=>{S();g();L();Sn();$();Ko();ve();fe();jt();Fu();Ou=Object.freeze({[qt.ArrowUp]:{[q.vertical]:-1},[qt.ArrowDown]:{[q.vertical]:1},[qt.ArrowLeft]:{[q.horizontal]:{[D.ltr]:-1,[D.rtl]:1}},[qt.ArrowRight]:{[q.horizontal]:{[D.ltr]:1,[D.rtl]:-1}}}),Jt=class o extends b{constructor(){super(...arguments),this._activeIndex=0,this.direction=D.ltr,this.orientation=q.horizontal}get activeIndex(){return w.track(this,"activeIndex"),this._activeIndex}set activeIndex(e){this.$fastController.isConnected&&(this._activeIndex=Ut(0,this.focusableElements.length-1,e),w.notify(this,"activeIndex"))}slottedItemsChanged(){this.$fastController.isConnected&&this.reduceFocusableElements()}mouseDownHandler(e){var t;let i=(t=this.focusableElements)===null||t===void 0?void 0:t.findIndex(s=>s.contains(e.target));return i>-1&&this.activeIndex!==i&&this.setFocusedElement(i),!0}childItemsChanged(e,t){this.$fastController.isConnected&&this.reduceFocusableElements()}connectedCallback(){super.connectedCallback(),this.direction=ze(this)}focusinHandler(e){let t=e.relatedTarget;!t||this.contains(t)||this.setFocusedElement()}getDirectionalIncrementer(e){var t,i,s,r,n;return(n=(s=(i=(t=Ou[e])===null||t===void 0?void 0:t[this.orientation])===null||i===void 0?void 0:i[this.direction])!==null&&s!==void 0?s:(r=Ou[e])===null||r===void 0?void 0:r[this.orientation])!==null&&n!==void 0?n:0}keydownHandler(e){let t=e.key;if(!(t in qt)||e.defaultPrevented||e.shiftKey)return!0;let i=this.getDirectionalIncrementer(t);if(!i)return!e.target.closest("[role=radiogroup]");let s=this.activeIndex+i;return this.focusableElements[s]&&e.preventDefault(),this.setFocusedElement(s),!0}get allSlottedItems(){return[...this.start.assignedElements(),...this.slottedItems,...this.end.assignedElements()]}reduceFocusableElements(){var e;let t=(e=this.focusableElements)===null||e===void 0?void 0:e[this.activeIndex];this.focusableElements=this.allSlottedItems.reduce(o.reduceFocusableItems,[]);let i=this.focusableElements.indexOf(t);this.activeIndex=Math.max(0,i),this.setFocusableElements()}setFocusedElement(e=this.activeIndex){this.activeIndex=e,this.setFocusableElements(),this.focusableElements[this.activeIndex]&&this.contains(Lu(this))&&this.focusableElements[this.activeIndex].focus()}static reduceFocusableItems(e,t){var i,s,r,n;let l=t.getAttribute("role")==="radio",p=(s=(i=t.$fastController)===null||i===void 0?void 0:i.definition.shadowOptions)===null||s===void 0?void 0:s.delegatesFocus,h=Array.from((n=(r=t.shadowRoot)===null||r===void 0?void 0:r.querySelectorAll("*"))!==null&&n!==void 0?n:[]).some(u=>kn(u));return!t.hasAttribute("disabled")&&!t.hasAttribute("hidden")&&(kn(t)||l||p||h)?(e.push(t),e):t.childElementCount?e.concat(Array.from(t.children).reduce(o.reduceFocusableItems,[])):e}setFocusableElements(){this.$fastController.isConnected&&this.focusableElements.length>0&&this.focusableElements.forEach((e,t)=>{e.tabIndex=this.activeIndex===t?0:-1})}};a([m],Jt.prototype,"direction",void 0);a([d],Jt.prototype,"orientation",void 0);a([m],Jt.prototype,"slottedItems",void 0);a([m],Jt.prototype,"slottedLabel",void 0);a([m],Jt.prototype,"childItems",void 0);Bo=class{};a([d({attribute:"aria-labelledby"})],Bo.prototype,"ariaLabelledby",void 0);a([d({attribute:"aria-label"})],Bo.prototype,"ariaLabel",void 0);I(Bo,F);I(Jt,N,Bo)});var Hu=c(()=>{Du();zu()});var Bu=c(()=>{});var Te,Nu=c(()=>{Te={top:"top",right:"right",bottom:"bottom",left:"left",start:"start",end:"end",topLeft:"top-left",topRight:"top-right",bottomLeft:"bottom-left",bottomRight:"bottom-right",topStart:"top-start",topEnd:"top-end",bottomStart:"bottom-start",bottomEnd:"bottom-end"}});var ne,Gu=c(()=>{S();g();L();jt();$();Nu();ne=class extends b{constructor(){super(...arguments),this.anchor="",this.delay=300,this.autoUpdateMode="anchor",this.anchorElement=null,this.viewportElement=null,this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.horizontalInset="false",this.verticalInset="false",this.horizontalScaling="content",this.verticalScaling="content",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition=void 0,this.tooltipVisible=!1,this.currentDirection=D.ltr,this.showDelayTimer=null,this.hideDelayTimer=null,this.isAnchorHoveredFocused=!1,this.isRegionHovered=!1,this.handlePositionChange=e=>{this.classList.toggle("top",this.region.verticalPosition==="start"),this.classList.toggle("bottom",this.region.verticalPosition==="end"),this.classList.toggle("inset-top",this.region.verticalPosition==="insetStart"),this.classList.toggle("inset-bottom",this.region.verticalPosition==="insetEnd"),this.classList.toggle("center-vertical",this.region.verticalPosition==="center"),this.classList.toggle("left",this.region.horizontalPosition==="start"),this.classList.toggle("right",this.region.horizontalPosition==="end"),this.classList.toggle("inset-left",this.region.horizontalPosition==="insetStart"),this.classList.toggle("inset-right",this.region.horizontalPosition==="insetEnd"),this.classList.toggle("center-horizontal",this.region.horizontalPosition==="center")},this.handleRegionMouseOver=e=>{this.isRegionHovered=!0},this.handleRegionMouseOut=e=>{this.isRegionHovered=!1,this.startHideDelayTimer()},this.handleAnchorMouseOver=e=>{if(this.tooltipVisible){this.isAnchorHoveredFocused=!0;return}this.startShowDelayTimer()},this.handleAnchorMouseOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.handleAnchorFocusIn=e=>{this.startShowDelayTimer()},this.handleAnchorFocusOut=e=>{this.isAnchorHoveredFocused=!1,this.clearShowDelayTimer(),this.startHideDelayTimer()},this.startHideDelayTimer=()=>{this.clearHideDelayTimer(),this.tooltipVisible&&(this.hideDelayTimer=window.setTimeout(()=>{this.updateTooltipVisibility()},60))},this.clearHideDelayTimer=()=>{this.hideDelayTimer!==null&&(clearTimeout(this.hideDelayTimer),this.hideDelayTimer=null)},this.startShowDelayTimer=()=>{if(!this.isAnchorHoveredFocused){if(this.delay>1){this.showDelayTimer===null&&(this.showDelayTimer=window.setTimeout(()=>{this.startHover()},this.delay));return}this.startHover()}},this.startHover=()=>{this.isAnchorHoveredFocused=!0,this.updateTooltipVisibility()},this.clearShowDelayTimer=()=>{this.showDelayTimer!==null&&(clearTimeout(this.showDelayTimer),this.showDelayTimer=null)},this.getAnchor=()=>{let e=this.getRootNode();return e instanceof ShadowRoot?e.getElementById(this.anchor):document.getElementById(this.anchor)},this.handleDocumentKeydown=e=>{!e.defaultPrevented&&this.tooltipVisible&&e.key===Ie&&(this.isAnchorHoveredFocused=!1,this.updateTooltipVisibility(),this.$emit("dismiss"))},this.updateTooltipVisibility=()=>{if(this.visible===!1)this.hideTooltip();else if(this.visible===!0){this.showTooltip();return}else{if(this.isAnchorHoveredFocused||this.isRegionHovered){this.showTooltip();return}this.hideTooltip()}},this.showTooltip=()=>{this.tooltipVisible||(this.currentDirection=ze(this),this.tooltipVisible=!0,document.addEventListener("keydown",this.handleDocumentKeydown),y.queueUpdate(this.setRegionProps))},this.hideTooltip=()=>{this.tooltipVisible&&(this.clearHideDelayTimer(),this.region!==null&&this.region!==void 0&&(this.region.removeEventListener("positionchange",this.handlePositionChange),this.region.viewportElement=null,this.region.anchorElement=null,this.region.removeEventListener("mouseover",this.handleRegionMouseOver),this.region.removeEventListener("mouseout",this.handleRegionMouseOut)),document.removeEventListener("keydown",this.handleDocumentKeydown),this.tooltipVisible=!1)},this.setRegionProps=()=>{this.tooltipVisible&&(this.region.viewportElement=this.viewportElement,this.region.anchorElement=this.anchorElement,this.region.addEventListener("positionchange",this.handlePositionChange),this.region.addEventListener("mouseover",this.handleRegionMouseOver,{passive:!0}),this.region.addEventListener("mouseout",this.handleRegionMouseOut,{passive:!0}))}}visibleChanged(){this.$fastController.isConnected&&(this.updateTooltipVisibility(),this.updateLayout())}anchorChanged(){this.$fastController.isConnected&&(this.anchorElement=this.getAnchor())}positionChanged(){this.$fastController.isConnected&&this.updateLayout()}anchorElementChanged(e){if(this.$fastController.isConnected){if(e!=null&&(e.removeEventListener("mouseover",this.handleAnchorMouseOver),e.removeEventListener("mouseout",this.handleAnchorMouseOut),e.removeEventListener("focusin",this.handleAnchorFocusIn),e.removeEventListener("focusout",this.handleAnchorFocusOut)),this.anchorElement!==null&&this.anchorElement!==void 0){this.anchorElement.addEventListener("mouseover",this.handleAnchorMouseOver,{passive:!0}),this.anchorElement.addEventListener("mouseout",this.handleAnchorMouseOut,{passive:!0}),this.anchorElement.addEventListener("focusin",this.handleAnchorFocusIn,{passive:!0}),this.anchorElement.addEventListener("focusout",this.handleAnchorFocusOut,{passive:!0});let t=this.anchorElement.id;this.anchorElement.parentElement!==null&&this.anchorElement.parentElement.querySelectorAll(":hover").forEach(i=>{i.id===t&&this.startShowDelayTimer()})}this.region!==null&&this.region!==void 0&&this.tooltipVisible&&(this.region.anchorElement=this.anchorElement),this.updateLayout()}}viewportElementChanged(){this.region!==null&&this.region!==void 0&&(this.region.viewportElement=this.viewportElement),this.updateLayout()}connectedCallback(){super.connectedCallback(),this.anchorElement=this.getAnchor(),this.updateTooltipVisibility()}disconnectedCallback(){this.hideTooltip(),this.clearShowDelayTimer(),this.clearHideDelayTimer(),super.disconnectedCallback()}updateLayout(){switch(this.verticalPositioningMode="locktodefault",this.horizontalPositioningMode="locktodefault",this.position){case Te.top:case Te.bottom:this.verticalDefaultPosition=this.position,this.horizontalDefaultPosition="center";break;case Te.right:case Te.left:case Te.start:case Te.end:this.verticalDefaultPosition="center",this.horizontalDefaultPosition=this.position;break;case Te.topLeft:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="left";break;case Te.topRight:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="right";break;case Te.bottomLeft:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="left";break;case Te.bottomRight:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="right";break;case Te.topStart:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="start";break;case Te.topEnd:this.verticalDefaultPosition="top",this.horizontalDefaultPosition="end";break;case Te.bottomStart:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="start";break;case Te.bottomEnd:this.verticalDefaultPosition="bottom",this.horizontalDefaultPosition="end";break;default:this.verticalPositioningMode="dynamic",this.horizontalPositioningMode="dynamic",this.verticalDefaultPosition=void 0,this.horizontalDefaultPosition="center";break}}};a([d({mode:"boolean"})],ne.prototype,"visible",void 0);a([d],ne.prototype,"anchor",void 0);a([d],ne.prototype,"delay",void 0);a([d],ne.prototype,"position",void 0);a([d({attribute:"auto-update-mode"})],ne.prototype,"autoUpdateMode",void 0);a([d({attribute:"horizontal-viewport-lock"})],ne.prototype,"horizontalViewportLock",void 0);a([d({attribute:"vertical-viewport-lock"})],ne.prototype,"verticalViewportLock",void 0);a([m],ne.prototype,"anchorElement",void 0);a([m],ne.prototype,"viewportElement",void 0);a([m],ne.prototype,"verticalPositioningMode",void 0);a([m],ne.prototype,"horizontalPositioningMode",void 0);a([m],ne.prototype,"horizontalInset",void 0);a([m],ne.prototype,"verticalInset",void 0);a([m],ne.prototype,"horizontalScaling",void 0);a([m],ne.prototype,"verticalScaling",void 0);a([m],ne.prototype,"verticalDefaultPosition",void 0);a([m],ne.prototype,"horizontalDefaultPosition",void 0);a([m],ne.prototype,"tooltipVisible",void 0);a([m],ne.prototype,"currentDirection",void 0)});var Vu=c(()=>{Bu();Gu()});var qu=c(()=>{});function $t(o){return dt(o)&&o.getAttribute("role")==="treeitem"}var se,Vn=c(()=>{S();g();L();ve();fe();$();se=class extends b{constructor(){super(...arguments),this.expanded=!1,this.focusable=!1,this.isNestedItem=()=>$t(this.parentElement),this.handleExpandCollapseButtonClick=e=>{!this.disabled&&!e.defaultPrevented&&(this.expanded=!this.expanded)},this.handleFocus=e=>{this.setAttribute("tabindex","0")},this.handleBlur=e=>{this.setAttribute("tabindex","-1")}}expandedChanged(){this.$fastController.isConnected&&this.$emit("expanded-change",this)}selectedChanged(){this.$fastController.isConnected&&this.$emit("selected-change",this)}itemsChanged(e,t){this.$fastController.isConnected&&this.items.forEach(i=>{$t(i)&&(i.nested=!0)})}static focusItem(e){e.focusable=!0,e.focus()}childItemLength(){let e=this.childItems.filter(t=>$t(t));return e?e.length:0}};a([d({mode:"boolean"})],se.prototype,"expanded",void 0);a([d({mode:"boolean"})],se.prototype,"selected",void 0);a([d({mode:"boolean"})],se.prototype,"disabled",void 0);a([m],se.prototype,"focusable",void 0);a([m],se.prototype,"childItems",void 0);a([m],se.prototype,"items",void 0);a([m],se.prototype,"nested",void 0);a([m],se.prototype,"renderCollapsedChildren",void 0);I(se,N)});var Uu=c(()=>{qu();Vn()});var ju=c(()=>{});var ui,Wu=c(()=>{S();g();L();Vn();$();ui=class extends b{constructor(){super(...arguments),this.currentFocused=null,this.handleFocus=e=>{if(!(this.slottedTreeItems.length<1)){if(e.target===this){this.currentFocused===null&&(this.currentFocused=this.getValidFocusableItem()),this.currentFocused!==null&&se.focusItem(this.currentFocused);return}this.contains(e.target)&&(this.setAttribute("tabindex","-1"),this.currentFocused=e.target)}},this.handleBlur=e=>{e.target instanceof HTMLElement&&(e.relatedTarget===null||!this.contains(e.relatedTarget))&&this.setAttribute("tabindex","0")},this.handleKeyDown=e=>{if(e.defaultPrevented)return;if(this.slottedTreeItems.length<1)return!0;let t=this.getVisibleNodes();switch(e.key){case ce:t.length&&se.focusItem(t[0]);return;case de:t.length&&se.focusItem(t[t.length-1]);return;case xe:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof se&&i.childItemLength()>0&&i.expanded?i.expanded=!1:i instanceof se&&i.parentElement instanceof se&&se.focusItem(i.parentElement)}return!1;case Ce:if(e.target&&this.isFocusableElement(e.target)){let i=e.target;i instanceof se&&i.childItemLength()>0&&!i.expanded?i.expanded=!0:i instanceof se&&i.childItemLength()>0&&this.focusNextNode(1,e.target)}return;case X:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(1,e.target);return;case J:e.target&&this.isFocusableElement(e.target)&&this.focusNextNode(-1,e.target);return;case oe:this.handleClick(e);return}return!0},this.handleSelectedChange=e=>{if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!$t(e.target))return!0;let t=e.target;t.selected?(this.currentSelected&&this.currentSelected!==t&&(this.currentSelected.selected=!1),this.currentSelected=t):!t.selected&&this.currentSelected===t&&(this.currentSelected=null)},this.setItems=()=>{let e=this.treeView.querySelector("[aria-selected='true']");this.currentSelected=e,(this.currentFocused===null||!this.contains(this.currentFocused))&&(this.currentFocused=this.getValidFocusableItem()),this.nested=this.checkForNestedItems(),this.getVisibleNodes().forEach(i=>{$t(i)&&(i.nested=this.nested)})},this.isFocusableElement=e=>$t(e),this.isSelectedElement=e=>e.selected}slottedTreeItemsChanged(){this.$fastController.isConnected&&this.setItems()}connectedCallback(){super.connectedCallback(),this.setAttribute("tabindex","0"),y.queueUpdate(()=>{this.setItems()})}handleClick(e){if(e.defaultPrevented)return;if(!(e.target instanceof Element)||!$t(e.target))return!0;let t=e.target;t.disabled||(t.selected=!t.selected)}focusNextNode(e,t){let i=this.getVisibleNodes();if(!i)return;let s=i[i.indexOf(t)+e];dt(s)&&se.focusItem(s)}getValidFocusableItem(){let e=this.getVisibleNodes(),t=e.findIndex(this.isSelectedElement);return t===-1&&(t=e.findIndex(this.isFocusableElement)),t!==-1?e[t]:null}checkForNestedItems(){return this.slottedTreeItems.some(e=>$t(e)&&e.querySelector("[role='treeitem']"))}getVisibleNodes(){return ic(this,"[role='treeitem']")||[]}};a([d({attribute:"render-collapsed-nodes"})],ui.prototype,"renderCollapsedNodes",void 0);a([m],ui.prototype,"currentSelected",void 0);a([m],ui.prototype,"slottedTreeItems",void 0)});var Qu=c(()=>{ju();Wu()});var qn,hi,CI,_I,wI,Yu=c(()=>{qn=class{constructor(e){this.listenerCache=new WeakMap,this.query=e}bind(e){let{query:t}=this,i=this.constructListener(e);i.bind(t)(),t.addListener(i),this.listenerCache.set(e,i)}unbind(e){let t=this.listenerCache.get(e);t&&(this.query.removeListener(t),this.listenerCache.delete(e))}},hi=class o extends qn{constructor(e,t){super(e),this.styles=t}static with(e){return t=>new o(e,t)}constructListener(e){let t=!1,i=this.styles;return function(){let{matches:r}=this;r&&!t?(e.$fastController.addStyles(i),t=r):!r&&t&&(e.$fastController.removeStyles(i),t=r)}}unbind(e){super.unbind(e),e.$fastController.removeStyles(this.styles)}},CI=hi.with(window.matchMedia("(forced-colors)")),_I=hi.with(window.matchMedia("(prefers-color-scheme: dark)")),wI=hi.with(window.matchMedia("(prefers-color-scheme: light)"))});var Xu=c(()=>{});var Me,Ju=c(()=>{Me="not-allowed"});function H(o){return`${lg}:host{display:${o}}`}var lg,Zu=c(()=>{lg=":host([hidden]){display:none}"});var j,Ku=c(()=>{L();j=sc()?"focus-visible":"focus"});var eh=c(()=>{Ju();Zu();Ku()});var th=c(()=>{fe();es();Yu();Xu();eh();jt();Ln()});var z=c(()=>{Wl();kc();$c();Yr();Fc();Hc();Nc();qc();Kc();dd();hd();vd();_d();ld();$d();bn();Td();Fd();Hd();qd();Yd();Xd();Jd();ep();op();up();Rn();vp();kp();uo();Tp();Rp();Lp();Bp();Vp();Qp();Kp();ou();ru();cu();hu();bu();Cu();Su();Iu();Eu();Hu();Vu();Uu();Qu();th()});function cg(o){return Cn.getOrCreate(o).withPrefix("vscode")}var oh=c(()=>{z()});function sh(o){window.addEventListener("load",()=>{new MutationObserver(()=>{ih(o)}).observe(document.body,{attributes:!0,attributeFilter:["class"]}),ih(o)})}function ih(o){let e=getComputedStyle(document.body),t=document.querySelector("body");if(t){let i=t.getAttribute("data-vscode-theme-kind");for(let[s,r]of o){let n=e.getPropertyValue(s).toString();if(i==="vscode-high-contrast")n.length===0&&r.name.includes("background")&&(n="transparent"),r.name==="button-icon-hover-background"&&(n="transparent");else if(i==="vscode-high-contrast-light"){if(n.length===0&&r.name.includes("background"))switch(r.name){case"button-primary-hover-background":n="#0F4A85";break;case"button-secondary-hover-background":n="transparent";break;case"button-icon-hover-background":n="transparent";break}}else r.name==="contrast-active-border"&&(n="transparent");r.setValueFor(t,n)}}}var rh=c(()=>{});function x(o,e){let t=ri.create(o);if(e){if(e.includes("--fake-vscode-token")){let i="id"+Math.random().toString(16).slice(2);e=`${e}-${i}`}nh.set(e,t)}return ah||(sh(nh),ah=!0),t}var nh,ah,lh=c(()=>{z();rh();nh=new Map,ah=!1});var ch,P,ws,WR,mt,ft,_,Fe,G,K,QR,W,No,Go,U,Q,ks,Ss,YR,XR,JR,ZR,dh,ph,uh,hh,mh,Ps,$s,Vo,Un,fh,gh,jn,bh,Co,Wn,Qn,Ts,vh,yh,xh,Ch,it,Zt,_h,KR,gt,Tt,wh,kh,mi,st,eA,Sh,Mt,Ms,tA,Yn,Ph,$h,Th,Kt,Mh,oA,iA,Ih,me=c(()=>{lh();ch=x("background","--vscode-editor-background").withDefault("#1e1e1e"),P=x("border-width").withDefault(1),ws=x("contrast-active-border","--vscode-contrastActiveBorder").withDefault("#f38518"),WR=x("contrast-border","--vscode-contrastBorder").withDefault("#6fc3df"),mt=x("corner-radius").withDefault(0),ft=x("corner-radius-round").withDefault(2),_=x("design-unit").withDefault(4),Fe=x("disabled-opacity").withDefault(.4),G=x("focus-border","--vscode-focusBorder").withDefault("#007fd4"),K=x("font-family","--vscode-font-family").withDefault("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol"),QR=x("font-weight","--vscode-font-weight").withDefault("400"),W=x("foreground","--vscode-foreground").withDefault("#cccccc"),No=x("input-height").withDefault("26"),Go=x("input-min-width").withDefault("100px"),U=x("type-ramp-base-font-size","--vscode-font-size").withDefault("13px"),Q=x("type-ramp-base-line-height").withDefault("normal"),ks=x("type-ramp-minus1-font-size").withDefault("11px"),Ss=x("type-ramp-minus1-line-height").withDefault("16px"),YR=x("type-ramp-minus2-font-size").withDefault("9px"),XR=x("type-ramp-minus2-line-height").withDefault("16px"),JR=x("type-ramp-plus1-font-size").withDefault("16px"),ZR=x("type-ramp-plus1-line-height").withDefault("24px"),dh=x("scrollbarWidth").withDefault("10px"),ph=x("scrollbarHeight").withDefault("10px"),uh=x("scrollbar-slider-background","--vscode-scrollbarSlider-background").withDefault("#79797966"),hh=x("scrollbar-slider-hover-background","--vscode-scrollbarSlider-hoverBackground").withDefault("#646464b3"),mh=x("scrollbar-slider-active-background","--vscode-scrollbarSlider-activeBackground").withDefault("#bfbfbf66"),Ps=x("badge-background","--vscode-badge-background").withDefault("#4d4d4d"),$s=x("badge-foreground","--vscode-badge-foreground").withDefault("#ffffff"),Vo=x("button-border","--vscode-button-border").withDefault("transparent"),Un=x("button-icon-background").withDefault("transparent"),fh=x("button-icon-corner-radius").withDefault("5px"),gh=x("button-icon-outline-offset").withDefault(0),jn=x("button-icon-hover-background","--fake-vscode-token").withDefault("rgba(90, 93, 94, 0.31)"),bh=x("button-icon-padding").withDefault("3px"),Co=x("button-primary-background","--vscode-button-background").withDefault("#0e639c"),Wn=x("button-primary-foreground","--vscode-button-foreground").withDefault("#ffffff"),Qn=x("button-primary-hover-background","--vscode-button-hoverBackground").withDefault("#1177bb"),Ts=x("button-secondary-background","--vscode-button-secondaryBackground").withDefault("#3a3d41"),vh=x("button-secondary-foreground","--vscode-button-secondaryForeground").withDefault("#ffffff"),yh=x("button-secondary-hover-background","--vscode-button-secondaryHoverBackground").withDefault("#45494e"),xh=x("button-padding-horizontal").withDefault("11px"),Ch=x("button-padding-vertical").withDefault("4px"),it=x("checkbox-background","--vscode-checkbox-background").withDefault("#3c3c3c"),Zt=x("checkbox-border","--vscode-checkbox-border").withDefault("#3c3c3c"),_h=x("checkbox-corner-radius").withDefault(3),KR=x("checkbox-foreground","--vscode-checkbox-foreground").withDefault("#f0f0f0"),gt=x("list-active-selection-background","--vscode-list-activeSelectionBackground").withDefault("#094771"),Tt=x("list-active-selection-foreground","--vscode-list-activeSelectionForeground").withDefault("#ffffff"),wh=x("list-hover-background","--vscode-list-hoverBackground").withDefault("#2a2d2e"),kh=x("divider-background","--vscode-settings-dropdownListBorder").withDefault("#454545"),mi=x("dropdown-background","--vscode-dropdown-background").withDefault("#3c3c3c"),st=x("dropdown-border","--vscode-dropdown-border").withDefault("#3c3c3c"),eA=x("dropdown-foreground","--vscode-dropdown-foreground").withDefault("#f0f0f0"),Sh=x("dropdown-list-max-height").withDefault("200px"),Mt=x("input-background","--vscode-input-background").withDefault("#3c3c3c"),Ms=x("input-foreground","--vscode-input-foreground").withDefault("#cccccc"),tA=x("input-placeholder-foreground","--vscode-input-placeholderForeground").withDefault("#cccccc"),Yn=x("link-active-foreground","--vscode-textLink-activeForeground").withDefault("#3794ff"),Ph=x("link-foreground","--vscode-textLink-foreground").withDefault("#3794ff"),$h=x("progress-background","--vscode-progressBar-background").withDefault("#0e70c0"),Th=x("panel-tab-active-border","--vscode-panelTitle-activeBorder").withDefault("#e7e7e7"),Kt=x("panel-tab-active-foreground","--vscode-panelTitle-activeForeground").withDefault("#e7e7e7"),Mh=x("panel-tab-foreground","--vscode-panelTitle-inactiveForeground").withDefault("#e7e7e799"),oA=x("panel-view-background","--vscode-panel-background").withDefault("#1e1e1e"),iA=x("panel-view-border","--vscode-panel-border").withDefault("#80808059"),Ih=x("tag-corner-radius").withDefault("2px")});var Rh,Ah=c(()=>{g();z();me();Rh=(o,e)=>M`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${K};
		font-size: ${ks};
		line-height: ${Ss};
		text-align: center;
	}
	.control {
		align-items: center;
		background-color: ${Ps};
		border: calc(${P} * 1px) solid ${Vo};
		border-radius: 11px;
		box-sizing: border-box;
		color: ${$s};
		display: flex;
		height: calc(${_} * 4px);
		justify-content: center;
		min-width: calc(${_} * 4px + 2px);
		min-height: calc(${_} * 4px + 2px);
		padding: 3px 6px;
	}
`});var Is,Xn,Jn=c(()=>{z();Ah();Is=class extends _t{connectedCallback(){super.connectedCallback(),this.circular||(this.circular=!0)}},Xn=Is.compose({baseName:"badge",template:Wi,styles:Rh})});function Eh(o,e,t,i){var s=arguments.length,r=s<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(o,e,t,i);else for(var l=o.length-1;l>=0;l--)(n=o[l])&&(r=(s<3?n(r):s>3?n(e,t,r):n(e,t))||r);return s>3&&r&&Object.defineProperty(e,t,r),r}var Dh=c(()=>{});var dg,pg,ug,hg,Lh,Fh=c(()=>{g();z();me();dg=M`
	${H("inline-flex")} :host {
		outline: none;
		font-family: ${K};
		font-size: ${U};
		line-height: ${Q};
		color: ${Wn};
		background: ${Co};
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
		padding: ${Ch} ${xh};
		white-space: wrap;
		outline: none;
		text-decoration: none;
		border: calc(${P} * 1px) solid ${Vo};
		color: inherit;
		border-radius: inherit;
		fill: inherit;
		cursor: inherit;
		font-family: inherit;
	}
	:host(:hover) {
		background: ${Qn};
	}
	:host(:active) {
		background: ${Co};
	}
	.control:${j} {
		outline: calc(${P} * 1px) solid ${G};
		outline-offset: calc(${P} * 2px);
	}
	.control::-moz-focus-inner {
		border: 0;
	}
	:host([disabled]) {
		opacity: ${Fe};
		background: ${Co};
		cursor: ${Me};
	}
	.content {
		display: flex;
	}
	.start {
		display: flex;
	}
	::slotted(svg),
	::slotted(span) {
		width: calc(${_} * 4px);
		height: calc(${_} * 4px);
	}
	.start {
		margin-inline-end: 8px;
	}
`,pg=M`
	:host([appearance='primary']) {
		background: ${Co};
		color: ${Wn};
	}
	:host([appearance='primary']:hover) {
		background: ${Qn};
	}
	:host([appearance='primary']:active) .control:active {
		background: ${Co};
	}
	:host([appearance='primary']) .control:${j} {
		outline: calc(${P} * 1px) solid ${G};
		outline-offset: calc(${P} * 2px);
	}
	:host([appearance='primary'][disabled]) {
		background: ${Co};
	}
`,ug=M`
	:host([appearance='secondary']) {
		background: ${Ts};
		color: ${vh};
	}
	:host([appearance='secondary']:hover) {
		background: ${yh};
	}
	:host([appearance='secondary']:active) .control:active {
		background: ${Ts};
	}
	:host([appearance='secondary']) .control:${j} {
		outline: calc(${P} * 1px) solid ${G};
		outline-offset: calc(${P} * 2px);
	}
	:host([appearance='secondary'][disabled]) {
		background: ${Ts};
	}
`,hg=M`
	:host([appearance='icon']) {
		background: ${Un};
		border-radius: ${fh};
		color: ${W};
	}
	:host([appearance='icon']:hover) {
		background: ${jn};
		outline: 1px dotted ${ws};
		outline-offset: -1px;
	}
	:host([appearance='icon']) .control {
		padding: ${bh};
		border: none;
	}
	:host([appearance='icon']:active) .control:active {
		background: ${jn};
	}
	:host([appearance='icon']) .control:${j} {
		outline: calc(${P} * 1px) solid ${G};
		outline-offset: ${gh};
	}
	:host([appearance='icon'][disabled]) {
		background: ${Un};
	}
`,Lh=(o,e)=>M`
	${dg}
	${pg}
	${ug}
	${hg}
`});var fi,Zn,Kn=c(()=>{Dh();g();z();Fh();fi=class extends Ee{connectedCallback(){if(super.connectedCallback(),!this.appearance){let e=this.getAttribute("appearance");this.appearance=e}}attributeChangedCallback(e,t,i){e==="appearance"&&i==="icon"&&(this.getAttribute("aria-label")||(this.ariaLabel="Icon Button")),e==="aria-label"&&(this.ariaLabel=i),e==="disabled"&&(this.disabled=i!==null)}};Eh([d],fi.prototype,"appearance",void 0);Zn=fi.compose({baseName:"button",template:Uc,styles:Lh,shadowOptions:{delegatesFocus:!0}})});var Oh,zh=c(()=>{g();z();me();Oh=(o,e)=>M`
	${H("inline-flex")} :host {
		align-items: center;
		outline: none;
		margin: calc(${_} * 1px) 0;
		user-select: none;
		font-size: ${U};
		line-height: ${Q};
	}
	.control {
		position: relative;
		width: calc(${_} * 4px + 2px);
		height: calc(${_} * 4px + 2px);
		box-sizing: border-box;
		border-radius: calc(${_h} * 1px);
		border: calc(${P} * 1px) solid ${Zt};
		background: ${it};
		outline: none;
		cursor: pointer;
	}
	.label {
		font-family: ${K};
		color: ${W};
		padding-inline-start: calc(${_} * 2px + 2px);
		margin-inline-end: calc(${_} * 2px + 2px);
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
		fill: ${W};
		opacity: 0;
		pointer-events: none;
	}
	.indeterminate-indicator {
		border-radius: 2px;
		background: ${W};
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	:host(:enabled) .control:hover {
		background: ${it};
		border-color: ${Zt};
	}
	:host(:enabled) .control:active {
		background: ${it};
		border-color: ${G};
	}
	:host(:${j}) .control {
		border: calc(${P} * 1px) solid ${G};
	}
	:host(.disabled) .label,
	:host(.readonly) .label,
	:host(.readonly) .control,
	:host(.disabled) .control {
		cursor: ${Me};
	}
	:host(.checked:not(.indeterminate)) .checked-indicator,
	:host(.indeterminate) .indeterminate-indicator {
		opacity: 1;
	}
	:host(.disabled) {
		opacity: ${Fe};
	}
`});var Rs,ea,ta=c(()=>{z();zh();Rs=class extends go{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Checkbox")}},ea=Rs.compose({baseName:"checkbox",template:md,styles:Oh,checkedIndicator:`
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
	`})});var Hh,Bh=c(()=>{g();Hh=(o,e)=>M`
	:host {
		display: flex;
		position: relative;
		flex-direction: column;
		width: 100%;
	}
`});var Nh,Gh=c(()=>{g();me();Nh=(o,e)=>M`
	:host {
		display: grid;
		padding: calc((${_} / 4) * 1px) 0;
		box-sizing: border-box;
		width: 100%;
		background: transparent;
	}
	:host(.header) {
	}
	:host(.sticky-header) {
		background: ${ch};
		position: sticky;
		top: 0;
	}
	:host(:hover) {
		background: ${wh};
		outline: 1px dotted ${ws};
		outline-offset: -1px;
	}
`});var Vh,qh=c(()=>{g();z();me();Vh=(o,e)=>M`
	:host {
		padding: calc(${_} * 1px) calc(${_} * 3px);
		color: ${W};
		opacity: 1;
		box-sizing: border-box;
		font-family: ${K};
		font-size: ${U};
		line-height: ${Q};
		font-weight: 400;
		border: solid calc(${P} * 1px) transparent;
		border-radius: calc(${mt} * 1px);
		white-space: wrap;
		overflow-wrap: anywhere;
	}
	:host(.column-header) {
		font-weight: 600;
	}
	:host(:${j}),
	:host(:focus),
	:host(:active) {
		background: ${gt};
		border: solid calc(${P} * 1px) ${G};
		color: ${Tt};
		outline: none;
	}
	:host(:${j}) ::slotted(*),
	:host(:focus) ::slotted(*),
	:host(:active) ::slotted(*) {
		color: ${Tt} !important;
	}
`});var As,oa,Es,ia,Ds,sa,ra=c(()=>{z();Bh();Gh();qh();As=class extends he{connectedCallback(){super.connectedCallback(),this.getAttribute("aria-label")||this.setAttribute("aria-label","Data Grid")}},oa=As.compose({baseName:"data-grid",baseClass:he,template:td,styles:Hh}),Es=class extends pe{},ia=Es.compose({baseName:"data-grid-row",baseClass:pe,template:sd,styles:Nh}),Ds=class extends We{},sa=Ds.compose({baseName:"data-grid-cell",baseClass:We,template:nd,styles:Vh})});var Uh,jh=c(()=>{g();z();me();Uh=(o,e)=>M`
	${H("block")} :host {
		border: none;
		border-top: calc(${P} * 1px) solid ${kh};
		box-sizing: content-box;
		height: 0;
		margin: calc(${_} * 1px) 0;
		width: 100%;
	}
`});var Ls,na,aa=c(()=>{z();jh();Ls=class extends Do{},na=Ls.compose({baseName:"divider",template:Bd,styles:Uh})});var Wh,Qh=c(()=>{g();z();me();Wh=(o,e)=>M`
	${H("inline-flex")} :host {
		background: ${mi};
		border-radius: calc(${ft} * 1px);
		box-sizing: border-box;
		color: ${W};
		contain: contents;
		font-family: ${K};
		height: calc(${No} * 1px);
		position: relative;
		user-select: none;
		min-width: ${Go};
		outline: none;
		vertical-align: top;
	}
	.control {
		align-items: center;
		box-sizing: border-box;
		border: calc(${P} * 1px) solid ${st};
		border-radius: calc(${ft} * 1px);
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: ${U};
		line-height: ${Q};
		min-height: 100%;
		padding: 2px 6px 2px 8px;
		width: 100%;
	}
	.listbox {
		background: ${mi};
		border: calc(${P} * 1px) solid ${G};
		border-radius: calc(${ft} * 1px);
		box-sizing: border-box;
		display: inline-flex;
		flex-direction: column;
		left: 0;
		max-height: ${Sh};
		padding: 0;
		overflow-y: auto;
		position: absolute;
		width: 100%;
		z-index: 1;
	}
	.listbox[hidden] {
		display: none;
	}
	:host(:${j}) .control {
		border-color: ${G};
	}
	:host(:not([disabled]):hover) {
		background: ${mi};
		border-color: ${st};
	}
	:host(:${j}) ::slotted([aria-selected="true"][role="option"]:not([disabled])) {
		background: ${gt};
		border: calc(${P} * 1px) solid transparent;
		color: ${Tt};
	}
	:host([disabled]) {
		cursor: ${Me};
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		cursor: ${Me};
		user-select: none;
	}
	:host([disabled]:hover) {
		background: ${mi};
		color: ${W};
		fill: currentcolor;
	}
	:host(:not([disabled])) .control:active {
		border-color: ${G};
	}
	:host(:empty) .listbox {
		display: none;
	}
	:host([open]) .control {
		border-color: ${G};
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
		bottom: calc(${No} * 1px);
	}
	:host([open][position='below']) .listbox {
		top: calc(${No} * 1px);
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
		min-height: calc(${_} * 4px);
		min-width: calc(${_} * 4px);
		width: 1em;
	}
	::slotted([role='option']),
	::slotted(option) {
		flex: 0 0 auto;
	}
`});var Fs,la,ca=c(()=>{z();Qh();Fs=class extends ot{},la=Fs.compose({baseName:"dropdown",template:Jp,styles:Wh,indicator:`
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
	`})});var Yh,Xh=c(()=>{g();z();me();Yh=(o,e)=>M`
	${H("inline-flex")} :host {
		background: transparent;
		box-sizing: border-box;
		color: ${Ph};
		cursor: pointer;
		fill: currentcolor;
		font-family: ${K};
		font-size: ${U};
		line-height: ${Q};
		outline: none;
	}
	.control {
		background: transparent;
		border: calc(${P} * 1px) solid transparent;
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
		color: ${Yn};
	}
	:host(:hover) .content {
		text-decoration: underline;
	}
	:host(:active) {
		background: transparent;
		color: ${Yn};
	}
	:host(:${j}) .control,
	:host(:focus) .control {
		border: calc(${P} * 1px) solid ${G};
	}
`});var Os,da,pa=c(()=>{z();Xh();Os=class extends _e{},da=Os.compose({baseName:"link",template:Sc,styles:Yh,shadowOptions:{delegatesFocus:!0}})});var Jh,Zh=c(()=>{g();z();me();Jh=(o,e)=>M`
	${H("inline-flex")} :host {
		font-family: var(--body-font);
		border-radius: ${mt};
		border: calc(${P} * 1px) solid transparent;
		box-sizing: border-box;
		color: ${W};
		cursor: pointer;
		fill: currentcolor;
		font-size: ${U};
		line-height: ${Q};
		margin: 0;
		outline: none;
		overflow: hidden;
		padding: 0 calc((${_} / 2) * 1px)
			calc((${_} / 4) * 1px);
		user-select: none;
		white-space: nowrap;
	}
	:host(:${j}) {
		border-color: ${G};
		background: ${gt};
		color: ${W};
	}
	:host([aria-selected='true']) {
		background: ${gt};
		border: calc(${P} * 1px) solid transparent;
		color: ${Tt};
	}
	:host(:active) {
		background: ${gt};
		color: ${Tt};
	}
	:host(:not([aria-selected='true']):hover) {
		background: ${gt};
		border: calc(${P} * 1px) solid transparent;
		color: ${Tt};
	}
	:host(:not([aria-selected='true']):active) {
		background: ${gt};
		color: ${W};
	}
	:host([disabled]) {
		cursor: ${Me};
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
`});var zs,ua,ha=c(()=>{z();Zh();zs=class extends Qe{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Option")}},ua=zs.compose({baseName:"option",template:Zd,styles:Jh})});var Kh,em=c(()=>{g();z();me();Kh=(o,e)=>M`
	${H("grid")} :host {
		box-sizing: border-box;
		font-family: ${K};
		font-size: ${U};
		line-height: ${Q};
		color: ${W};
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto 1fr;
		overflow-x: auto;
	}
	.tablist {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: auto;
		column-gap: calc(${_} * 8px);
		position: relative;
		width: max-content;
		align-self: end;
		padding: calc(${_} * 1px) calc(${_} * 1px) 0;
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
		height: calc((${_} / 4) * 1px);
		justify-self: center;
		background: ${Kt};
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
`});var tm,om=c(()=>{g();z();me();tm=(o,e)=>M`
	${H("inline-flex")} :host {
		box-sizing: border-box;
		font-family: ${K};
		font-size: ${U};
		line-height: ${Q};
		height: calc(${_} * 7px);
		padding: calc(${_} * 1px) 0;
		color: ${Mh};
		fill: currentcolor;
		border-radius: calc(${mt} * 1px);
		border: solid calc(${P} * 1px) transparent;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		cursor: pointer;
	}
	:host(:hover) {
		color: ${Kt};
		fill: currentcolor;
	}
	:host(:active) {
		color: ${Kt};
		fill: currentcolor;
	}
	:host([aria-selected='true']) {
		background: transparent;
		color: ${Kt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:hover) {
		background: transparent;
		color: ${Kt};
		fill: currentcolor;
	}
	:host([aria-selected='true']:active) {
		background: transparent;
		color: ${Kt};
		fill: currentcolor;
	}
	:host(:${j}) {
		outline: none;
		border: solid calc(${P} * 1px) ${Th};
	}
	:host(:focus) {
		outline: none;
	}
	::slotted(vscode-badge) {
		margin-inline-start: calc(${_} * 2px);
	}
`});var im,sm=c(()=>{g();z();me();im=(o,e)=>M`
	${H("flex")} :host {
		color: inherit;
		background-color: transparent;
		border: solid calc(${P} * 1px) transparent;
		box-sizing: border-box;
		font-size: ${U};
		line-height: ${Q};
		padding: 10px calc((${_} + 2) * 1px);
	}
`});var Hs,ma,Bs,fa,Ns,ga,ba=c(()=>{z();em();om();sm();Hs=class extends Xe{connectedCallback(){super.connectedCallback(),this.orientation&&(this.orientation=Cs.horizontal),this.getAttribute("aria-label")||this.setAttribute("aria-label","Panels")}},ma=Hs.compose({baseName:"panels",template:_u,styles:Kh}),Bs=class extends pi{connectedCallback(){super.connectedCallback(),this.disabled&&(this.disabled=!1),this.textContent&&this.setAttribute("aria-label",this.textContent)}},fa=Bs.compose({baseName:"panel-tab",template:vu,styles:tm}),Ns=class extends xs{},ga=Ns.compose({baseName:"panel-view",template:mu,styles:im})});var rm,nm=c(()=>{g();z();me();rm=(o,e)=>M`
	${H("flex")} :host {
		align-items: center;
		outline: none;
		height: calc(${_} * 7px);
		width: calc(${_} * 7px);
		margin: 0;
	}
	.progress {
		height: 100%;
		width: 100%;
	}
	.background {
		fill: none;
		stroke: transparent;
		stroke-width: calc(${_} / 2 * 1px);
	}
	.indeterminate-indicator-1 {
		fill: none;
		stroke: ${$h};
		stroke-width: calc(${_} / 2 * 1px);
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
`});var Gs,va,ya=c(()=>{z();nm();Gs=class extends St{connectedCallback(){super.connectedCallback(),this.paused&&(this.paused=!1),this.setAttribute("aria-label","Loading"),this.setAttribute("aria-live","assertive"),this.setAttribute("role","alert")}attributeChangedCallback(e,t,i){e==="value"&&this.removeAttribute("value")}},va=Gs.compose({baseName:"progress-ring",template:Pp,styles:rm,indeterminateIndicator:`
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
	`})});var am,lm=c(()=>{g();z();me();am=(o,e)=>M`
	${H("flex")} :host {
		align-items: flex-start;
		margin: calc(${_} * 1px) 0;
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
		color: ${W};
		font-size: ${U};
		margin: calc(${_} * 1px) 0;
	}
`});var Vs,xa,Ca=c(()=>{L();z();lm();Vs=class extends tt{connectedCallback(){super.connectedCallback();let e=this.querySelector("label");if(e){let t="radio-group-"+Math.random().toString(16).slice(2);e.setAttribute("id",t),this.setAttribute("aria-labelledby",t)}}},xa=Vs.compose({baseName:"radio-group",template:Ap,styles:am})});var cm,dm=c(()=>{g();z();me();cm=(o,e)=>M`
	${H("inline-flex")} :host {
		align-items: center;
		flex-direction: row;
		font-size: ${U};
		line-height: ${Q};
		margin: calc(${_} * 1px) 0;
		outline: none;
		position: relative;
		transition: all 0.2s ease-in-out;
		user-select: none;
	}
	.control {
		background: ${it};
		border-radius: 999px;
		border: calc(${P} * 1px) solid ${Zt};
		box-sizing: border-box;
		cursor: pointer;
		height: calc(${_} * 4px);
		position: relative;
		outline: none;
		width: calc(${_} * 4px);
	}
	.label {
		color: ${W};
		cursor: pointer;
		font-family: ${K};
		margin-inline-end: calc(${_} * 2px + 2px);
		padding-inline-start: calc(${_} * 2px + 2px);
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
		background: ${W};
		border-radius: 999px;
		display: inline-block;
		inset: calc(${_} * 1px);
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
	:host(:not([disabled])) .control:hover {
		background: ${it};
		border-color: ${Zt};
	}
	:host(:not([disabled])) .control:active {
		background: ${it};
		border-color: ${G};
	}
	:host(:${j}) .control {
		border: calc(${P} * 1px) solid ${G};
	}
	:host([aria-checked='true']) .control {
		background: ${it};
		border: calc(${P} * 1px) solid ${Zt};
	}
	:host([aria-checked='true']:not([disabled])) .control:hover {
		background: ${it};
		border: calc(${P} * 1px) solid ${Zt};
	}
	:host([aria-checked='true']:not([disabled])) .control:active {
		background: ${it};
		border: calc(${P} * 1px) solid ${G};
	}
	:host([aria-checked="true"]:${j}:not([disabled])) .control {
		border: calc(${P} * 1px) solid ${G};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Me};
	}
	:host([aria-checked='true']) .checked-indicator {
		opacity: 1;
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
`});var qs,_a,wa=c(()=>{z();dm();qs=class extends xo{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Radio")}},_a=qs.compose({baseName:"radio",template:Fp,styles:cm,checkedIndicator:`
		<div part="checked-indicator" class="checked-indicator"></div>
	`})});var pm,um=c(()=>{g();z();me();pm=(o,e)=>M`
	${H("inline-block")} :host {
		box-sizing: border-box;
		font-family: ${K};
		font-size: ${ks};
		line-height: ${Ss};
	}
	.control {
		background-color: ${Ps};
		border: calc(${P} * 1px) solid ${Vo};
		border-radius: ${Ih};
		color: ${$s};
		padding: calc(${_} * 0.5px) calc(${_} * 1px);
		text-transform: uppercase;
	}
`});var Us,ka,Sa=c(()=>{z();um();Us=class extends _t{connectedCallback(){super.connectedCallback(),this.circular&&(this.circular=!1)}},ka=Us.compose({baseName:"tag",template:Wi,styles:pm})});var hm,mm=c(()=>{g();z();me();hm=(o,e)=>M`
	${H("inline-block")} :host {
		font-family: ${K};
		outline: none;
		user-select: none;
	}
	.control {
		box-sizing: border-box;
		position: relative;
		color: ${Ms};
		background: ${Mt};
		border-radius: calc(${ft} * 1px);
		border: calc(${P} * 1px) solid ${st};
		font: inherit;
		font-size: ${U};
		line-height: ${Q};
		padding: calc(${_} * 2px + 1px);
		width: 100%;
		min-width: ${Go};
		resize: none;
	}
	.control:hover:enabled {
		background: ${Mt};
		border-color: ${st};
	}
	.control:active:enabled {
		background: ${Mt};
		border-color: ${G};
	}
	.control:hover,
	.control:${j},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.control::-webkit-scrollbar {
		width: ${dh};
		height: ${ph};
	}
	.control::-webkit-scrollbar-corner {
		background: ${Mt};
	}
	.control::-webkit-scrollbar-thumb {
		background: ${uh};
	}
	.control::-webkit-scrollbar-thumb:hover {
		background: ${hh};
	}
	.control::-webkit-scrollbar-thumb:active {
		background: ${mh};
	}
	:host(:focus-within:not([disabled])) .control {
		border-color: ${G};
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
		color: ${W};
		cursor: pointer;
		font-size: ${U};
		line-height: ${Q};
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
		cursor: ${Me};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${st};
	}
`});var js,Pa,$a=c(()=>{z();mm();js=class extends be{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text area")}},Pa=js.compose({baseName:"text-area",template:Tu,styles:hm,shadowOptions:{delegatesFocus:!0}})});var fm,gm=c(()=>{g();z();me();fm=(o,e)=>M`
	${H("inline-block")} :host {
		font-family: ${K};
		outline: none;
		user-select: none;
	}
	.root {
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: row;
		color: ${Ms};
		background: ${Mt};
		border-radius: calc(${ft} * 1px);
		border: calc(${P} * 1px) solid ${st};
		height: calc(${No} * 1px);
		min-width: ${Go};
	}
	.control {
		-webkit-appearance: none;
		font: inherit;
		background: transparent;
		border: 0;
		color: inherit;
		height: calc(100% - (${_} * 1px));
		width: 100%;
		margin-top: auto;
		margin-bottom: auto;
		border: none;
		padding: 0 calc(${_} * 2px + 1px);
		font-size: ${U};
		line-height: ${Q};
	}
	.control:hover,
	.control:${j},
	.control:disabled,
	.control:active {
		outline: none;
	}
	.label {
		display: block;
		color: ${W};
		cursor: pointer;
		font-size: ${U};
		line-height: ${Q};
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
		width: calc(${_} * 4px);
		height: calc(${_} * 4px);
	}
	.start {
		margin-inline-start: calc(${_} * 2px);
	}
	.end {
		margin-inline-end: calc(${_} * 2px);
	}
	:host(:hover:not([disabled])) .root {
		background: ${Mt};
		border-color: ${st};
	}
	:host(:active:not([disabled])) .root {
		background: ${Mt};
		border-color: ${G};
	}
	:host(:focus-within:not([disabled])) .root {
		border-color: ${G};
	}
	:host([disabled]) .label,
	:host([readonly]) .label,
	:host([readonly]) .control,
	:host([disabled]) .control {
		cursor: ${Me};
	}
	:host([disabled]) {
		opacity: ${Fe};
	}
	:host([disabled]) .control {
		border-color: ${st};
	}
`});var Ws,Ta,Ma=c(()=>{z();gm();Ws=class extends we{connectedCallback(){super.connectedCallback(),this.textContent?this.setAttribute("aria-label",this.textContent):this.setAttribute("aria-label","Text field")}},Ta=Ws.compose({baseName:"text-field",template:Ru,styles:fm,shadowOptions:{delegatesFocus:!0}})});var mg,bm=c(()=>{Jn();Kn();ta();ra();aa();ca();pa();ha();ba();ya();Ca();wa();Sa();$a();Ma();mg={vsCodeBadge:Xn,vsCodeButton:Zn,vsCodeCheckbox:ea,vsCodeDataGrid:oa,vsCodeDataGridCell:sa,vsCodeDataGridRow:ia,vsCodeDivider:na,vsCodeDropdown:la,vsCodeLink:da,vsCodeOption:ua,vsCodePanels:ma,vsCodePanelTab:fa,vsCodePanelView:ga,vsCodeProgressRing:va,vsCodeRadioGroup:xa,vsCodeRadio:_a,vsCodeTag:ka,vsCodeTextArea:Pa,vsCodeTextField:Ta,register(o,...e){if(o)for(let t in this)t!=="register"&&this[t]().register(o,...e)}}});var vm={};Bm(vm,{Badge:()=>Is,Button:()=>fi,Checkbox:()=>Rs,DataGrid:()=>As,DataGridCell:()=>Ds,DataGridCellTypes:()=>Ke,DataGridRow:()=>Es,DataGridRowTypes:()=>wt,Divider:()=>Ls,DividerRole:()=>rs,Dropdown:()=>Fs,DropdownPosition:()=>pt,GenerateHeaderOptions:()=>fo,Link:()=>Os,Option:()=>zs,PanelTab:()=>Bs,PanelView:()=>Ns,Panels:()=>Hs,ProgressRing:()=>Gs,Radio:()=>qs,RadioGroup:()=>Vs,RadioGroupOrientation:()=>q,Tag:()=>Us,TextArea:()=>js,TextAreaResize:()=>Ho,TextField:()=>Ws,TextFieldType:()=>cs,allComponents:()=>mg,provideVSCodeDesignSystem:()=>cg,vsCodeBadge:()=>Xn,vsCodeButton:()=>Zn,vsCodeCheckbox:()=>ea,vsCodeDataGrid:()=>oa,vsCodeDataGridCell:()=>sa,vsCodeDataGridRow:()=>ia,vsCodeDivider:()=>na,vsCodeDropdown:()=>la,vsCodeLink:()=>da,vsCodeOption:()=>ua,vsCodePanelTab:()=>fa,vsCodePanelView:()=>ga,vsCodePanels:()=>ma,vsCodeProgressRing:()=>va,vsCodeRadio:()=>_a,vsCodeRadioGroup:()=>xa,vsCodeTag:()=>ka,vsCodeTextArea:()=>Pa,vsCodeTextField:()=>Ta});var ym=c(()=>{oh();bm();Jn();Kn();ta();ra();aa();ca();pa();ha();ba();ya();Ca();wa();Sa();$a();Ma()});function R(o,e,t){let i=document.createElement(o);return e&&(i.className=e),t!==void 0&&(i.textContent=t),i}var Nm={"btn-refresh":{id:"btn-refresh",label:"\u{1F504} Refresh",appearance:"primary"},"btn-details":{id:"btn-details",label:"\u{1F916} Details"},"btn-chart":{id:"btn-chart",label:"\u{1F4C8} Chart"},"btn-usage":{id:"btn-usage",label:"\u{1F4CA} Usage Analysis"},"btn-diagnostics":{id:"btn-diagnostics",label:"\u{1F50D} Diagnostics"},"btn-maturity":{id:"btn-maturity",label:"\u{1F3AF} Fluency Score"},"btn-dashboard":{id:"btn-dashboard",label:"\u{1F4CA} Team Dashboard"},"btn-level-viewer":{id:"btn-level-viewer",label:"\u{1F50D} Level Viewer"},"btn-environmental":{id:"btn-environmental",label:"\u{1F33F} Environmental Impact"}};function Lt(o){let e=Nm[o];if(e.hidden)return"";let t=e.appearance?` appearance="${e.appearance}"`:"";return`<vscode-button id="${e.id}"${t}>${e.label}</vscode-button>`}function Uo(o){return o.file+o.selection+o.implicitSelection+o.symbol+o.codebase+o.workspace+o.terminal+o.vscode+o.copilotInstructions+o.agentsMd+(o.terminalLastCommand||0)+(o.terminalSelection||0)+(o.clipboard||0)+(o.changes||0)+(o.outputPanel||0)+(o.problemsPanel||0)+(o.pullRequest||0)}var Ba={$schema:"http://json-schema.org/draft-07/schema#",description:"Character-to-token ratio estimators for different AI models. Used to estimate token counts from text length.",estimators:{"gpt-4":.25,"gpt-4.1":.25,"gpt-4.1-mini":.25,"gpt-4o":.25,"gpt-4o-mini":.25,"gpt-4-turbo":.25,"gpt-3.5-turbo":.25,"gpt-5":.25,"gpt-5-codex":.25,"gpt-5-mini":.25,"gpt-5.1":.25,"gpt-5.1-codex":.25,"gpt-5.1-codex-max":.25,"gpt-5.1-codex-mini":.25,"gpt-5.2":.25,"gpt-5.2-codex":.25,"gpt-5.2-pro":.25,"gpt-5.3-codex":.25,"gpt-5.4":.25,"gpt-5.4-mini":.25,"gpt-4.1-nano":.25,"gemini-2.0-flash":.25,"gemini-2.0-flash-lite":.25,"gemini-2.5-flash":.25,"gemini-2.5-flash-lite":.25,"claude-sonnet-3.5":.24,"claude-sonnet-3.7":.24,"claude-sonnet-4":.24,"claude-sonnet-4.5":.24,"claude-sonnet-4.6":.24,"claude-haiku":.24,"claude-haiku-4.5":.24,"claude-opus-4.1":.24,"claude-opus-4.5":.24,"claude-opus-4.6":.24,"claude-opus-4.6-(fast-mode)-(preview)":.24,"claude-opus-4.6-fast":.24,"gemini-2.5-pro":.25,"gemini-3-flash":.25,"gemini-3-pro":.25,"gemini-3-pro-preview":.25,"gemini-3.1-pro":.25,"gemini-3.1-flash-lite":.25,"grok-code-fast-1":.25,"raptor-mini":.25,goldeneye:.25,"o1-preview":.25,"o1-mini":.25,"o3-mini":.25,"o4-mini":.25,"gpt-5.5":.25,"mistral-large-latest":.25,"mistral-large-2512":.25,"mistral-large-2411":.25,"magistral-medium-latest":.25,"mistral-medium-latest":.25,"mistral-medium-3-5":.25,"mistral-medium-2505":.25,"mistral-small-latest":.25,"mistral-small-2503":.25,"mistral-small-2603":.25,"codestral-latest":.25,"codestral-2501":.25,"open-mistral-nemo":.25,"ministral-3b-2410":.25,"ministral-8b-2410":.25,"magistral-small-latest":.25,"devstral-medium-2507":.25,"pixtral-large-2411":.25,"gemini-3.5-flash":.25,"claude-opus-4.8":.24,"qwen2.5":.25,"mai-code-1-flash[^mai-code-1-flash]":.25,"mai-code-1-flash":.25,"claude-fable-5":.24}};var Db=Ba.estimators,Zs;function Ks(o){Zs=o}function er(o,e){return new Intl.NumberFormat(Zs,{minimumFractionDigits:e,maximumFractionDigits:e}).format(o)}function oo(o,e=1){return`${er(o,e)}%`}function B(o){return o.toLocaleString(Zs)}function C(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Na(o){let e=window.__EXTENSION_POINT_BUTTONS__??[];if(e.length===0)return;let t=document.querySelector(".button-row");if(t)for(let i of e){let s=document.createElement("vscode-button");s.id=`ext-point-${i.id}`,s.textContent=i.label,s.addEventListener("click",()=>{o.postMessage({command:"extensionPointAction",buttonId:i.id})}),t.append(s)}}var Ga=`/**
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

.button-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.nav-button {
	background: var(--button-secondary-bg);
	border: 1px solid var(--border-subtle);
	color: var(--text-primary);
	padding: 8px 12px;
	border-radius: 6px;
	font-size: 12px;
	cursor: pointer;
	transition: all 0.15s ease;
}

.nav-button:hover {
	background: var(--button-secondary-hover-bg);
}

.nav-button.primary {
	background: var(--button-bg);
	border-color: var(--button-bg);
	color: var(--button-fg);
}

.nav-button.primary:hover {
	background: var(--button-hover-bg);
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
	color: #f59e0b;
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
}`;function qa(o){return window[o]}function Ua(o){window.addEventListener("message",e=>{o(e.data)})}var ja={$schema:"http://json-schema.org/draft-07/schema#",description:"Model pricing data - costs per million tokens. Each model has direct provider/API pricing at the top level (used as a reference); models billed through GitHub Copilot AI Credits also include a `copilotPricing` block reflecting GitHub's published per-token rates (1 AI credit = $0.01).",metadata:{lastUpdated:"2026-06-10",sources:[{name:"OpenAI API Pricing",url:"https://developers.openai.com/api/docs/pricing",retrievedDate:"2026-04-24"},{name:"Mistral AI API Pricing",url:"https://pricepertoken.com/pricing-page/provider/mistral-ai",retrievedDate:"2026-05-06",note:"Cross-referenced with https://openrouter.ai/mistralai and https://ai-pricing.info/mistral"},{name:"Anthropic Claude Pricing",url:"https://www.anthropic.com/pricing",note:"Standard rates; also see https://platform.claude.com/docs/en/about-claude/pricing",retrievedDate:"2026-03-30"},{name:"Google AI Gemini API Pricing",url:"https://ai.google.dev/gemini-api/docs/pricing",retrievedDate:"2026-03-30"},{name:"xAI Grok API Pricing",url:"https://x.ai/api",retrievedDate:"2026-03-30"},{name:"GitHub Copilot Supported Models",url:"https://docs.github.com/en/copilot/reference/ai-models/supported-models",retrievedDate:"2026-03-30",note:"Source for tier/multiplier data"},{name:"GitHub Copilot Premium Requests",url:"https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests",retrievedDate:"2026-03-30",note:"Source for premium request multiplier values"},{name:"OpenRouter Model Pricing",url:"https://openrouter.ai",retrievedDate:"2026-03-30",note:"Cross-provider pricing aggregator used for verification"},{name:"GitHub Copilot Models and Pricing",url:"https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing",retrievedDate:"2026-04-27",note:"Source for the `copilotPricing` per-model block (GitHub AI Credit per-token rates)"}],disclaimer:"GitHub Copilot uses these models but pricing may differ from direct API usage. These are reference prices for cost estimation purposes only."},pricing:{"gpt-5":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5"]},"gpt-5-codex":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5 Codex (Preview)"]},"gpt-5-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GPT-5 models",tier:"standard",multiplier:0,displayNames:["GPT-5 Mini"],copilotPricing:{inputCostPerMillion:.25,cachedInputCostPerMillion:.025,outputCostPerMillion:2,releaseStatus:"GA",category:"Lightweight"}},"gpt-5.1":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1"]},"gpt-5.1-codex":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1 Codex"]},"gpt-5.1-codex-max":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.1 Codex Max"]},"gpt-5.1-codex-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GPT-5 models",tier:"premium",multiplier:.33,displayNames:["GPT-5.1 Codex Mini (Preview)"]},"gpt-5.2":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.2"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"Closing down 2026-06-01",category:"Versatile"}},"gpt-5.2-codex":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.2 Codex"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"Closing down 2026-06-01",category:"Powerful"}},"gpt-5.2-pro":{inputCostPerMillion:21,outputCostPerMillion:168,category:"GPT-5 models",tier:"premium",multiplier:1,displayNames:["GPT-5.2 Pro"]},"gpt-5.3-codex":{inputCostPerMillion:1.75,outputCostPerMillion:14,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.3 Codex"],copilotPricing:{inputCostPerMillion:1.75,cachedInputCostPerMillion:.175,outputCostPerMillion:14,releaseStatus:"GA",category:"Powerful"}},"gpt-5.4":{inputCostPerMillion:2.5,cachedInputCostPerMillion:.25,outputCostPerMillion:15,category:"GPT-5 models",tier:"standard",multiplier:1,displayNames:["GPT-5.4"],copilotPricing:{inputCostPerMillion:2.5,cachedInputCostPerMillion:.25,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"gpt-5.4-mini":{inputCostPerMillion:.75,cachedInputCostPerMillion:.075,outputCostPerMillion:4.5,category:"GPT-5 models",tier:"standard",multiplier:.33,displayNames:["GPT-5.4 mini"],copilotPricing:{inputCostPerMillion:.75,cachedInputCostPerMillion:.075,outputCostPerMillion:4.5,releaseStatus:"GA",category:"Lightweight"}},"gpt-5.4-nano":{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.25,category:"GPT-5 models",tier:"standard",multiplier:.25,displayNames:["GPT-5.4 nano"],copilotPricing:{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.25,releaseStatus:"GA",category:"Lightweight"}},"gpt-4":{inputCostPerMillion:3,outputCostPerMillion:12,category:"GPT-4 models",tier:"unknown",multiplier:1,displayNames:["GPT-4"]},"gpt-4.1":{inputCostPerMillion:2,cachedInputCostPerMillion:.5,outputCostPerMillion:8,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1"],copilotPricing:{inputCostPerMillion:2,cachedInputCostPerMillion:.5,outputCostPerMillion:8,releaseStatus:"Closing down 2026-06-01",category:"Versatile"}},"gpt-4.1-mini":{inputCostPerMillion:.4,cachedInputCostPerMillion:.1,outputCostPerMillion:1.6,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1 Mini"]},"gpt-4.1-nano":{inputCostPerMillion:.1,cachedInputCostPerMillion:.025,outputCostPerMillion:.4,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4.1 Nano"]},"gpt-4o":{inputCostPerMillion:2.5,outputCostPerMillion:10,cachedInputCostPerMillion:1.25,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o"]},"gpt-4o-mini":{inputCostPerMillion:.15,outputCostPerMillion:.6,cachedInputCostPerMillion:.075,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o-mini","GPT-4o Mini"]},"gpt-4o-mini-2024-07-18":{inputCostPerMillion:.15,outputCostPerMillion:.6,cachedInputCostPerMillion:.075,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4o-mini (2024-07-18)"]},"gpt-4-turbo":{inputCostPerMillion:10,outputCostPerMillion:30,category:"GPT-4 models",tier:"standard",multiplier:0,displayNames:["GPT-4 Turbo"]},"claude-sonnet-3.5":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"unknown",multiplier:1,displayNames:["Claude Sonnet 3.5"]},"claude-sonnet-3.7":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"unknown",multiplier:1,displayNames:["Claude Sonnet 3.7"]},"claude-sonnet-4":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"premium",multiplier:1,displayNames:["Claude Sonnet 4"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4.5":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.5"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4.6":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.6"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-sonnet-4-6":{inputCostPerMillion:3,outputCostPerMillion:15,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,category:"Claude models (Anthropic)",tier:"standard",multiplier:1,displayNames:["Claude Sonnet 4.6 (alternate format)"],copilotPricing:{inputCostPerMillion:3,cachedInputCostPerMillion:.3,cacheCreationCostPerMillion:3.75,outputCostPerMillion:15,releaseStatus:"GA",category:"Versatile"}},"claude-haiku":{inputCostPerMillion:.25,outputCostPerMillion:1.25,cachedInputCostPerMillion:.025,cacheCreationCostPerMillion:.3125,category:"Claude models (Anthropic)",tier:"standard",multiplier:0,displayNames:["Claude Haiku"]},"claude-haiku-4.5":{inputCostPerMillion:1,outputCostPerMillion:5,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:.33,displayNames:["Claude Haiku 4.5"],copilotPricing:{inputCostPerMillion:1,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,outputCostPerMillion:5,releaseStatus:"GA",category:"Versatile"}},"claude-haiku-4-5-20251001":{inputCostPerMillion:1,outputCostPerMillion:5,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:.33,displayNames:["Claude Haiku 4.5 (2025-10-01)"],copilotPricing:{inputCostPerMillion:1,cachedInputCostPerMillion:.1,cacheCreationCostPerMillion:1.25,outputCostPerMillion:5,releaseStatus:"GA",category:"Versatile"}},"claude-opus-4.1":{inputCostPerMillion:15,outputCostPerMillion:75,cachedInputCostPerMillion:1.5,cacheCreationCostPerMillion:18.75,category:"Claude models (Anthropic)",tier:"premium",multiplier:10,displayNames:["Claude Opus 4.1"]},"claude-opus-4.5":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:3,displayNames:["Claude Opus 4.5"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.6":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:3,displayNames:["Claude Opus 4.6"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.7":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:15,displayNames:["Claude Opus 4.7"],copilotPricing:{inputCostPerMillion:5,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,outputCostPerMillion:25,releaseStatus:"GA",category:"Powerful"}},"claude-opus-4.6-(fast-mode)-(preview)":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"standard",multiplier:30,displayNames:["Claude Opus 4.6 (Fast Mode Preview)"],copilotPricing:{inputCostPerMillion:30,cachedInputCostPerMillion:3,cacheCreationCostPerMillion:37.5,outputCostPerMillion:150,releaseStatus:"Public preview",category:"Powerful"}},"claude-opus-4.6-fast":{inputCostPerMillion:5,outputCostPerMillion:25,cachedInputCostPerMillion:.5,cacheCreationCostPerMillion:6.25,category:"Claude models (Anthropic)",tier:"premium",multiplier:30,displayNames:["Claude Opus 4.6 (Fast)"],copilotPricing:{inputCostPerMillion:30,cachedInputCostPerMillion:3,cacheCreationCostPerMillion:37.5,outputCostPerMillion:150,releaseStatus:"Public preview",category:"Powerful"}},"o3-mini":{inputCostPerMillion:1.1,outputCostPerMillion:4.4,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o3-mini"]},"o4-mini":{inputCostPerMillion:1.1,outputCostPerMillion:4.4,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o4-mini"]},"o1-preview":{inputCostPerMillion:15,outputCostPerMillion:60,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o1-preview"]},"o1-mini":{inputCostPerMillion:3,outputCostPerMillion:12,category:"OpenAI reasoning models",tier:"premium",multiplier:1,displayNames:["o1-mini"]},"gpt-3.5-turbo":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Legacy models",tier:"standard",multiplier:0,displayNames:["GPT-3.5-Turbo","GPT-3.5 Turbo"]},"gemini-2.5-pro":{inputCostPerMillion:1.25,outputCostPerMillion:10,category:"Google Gemini models",tier:"standard",multiplier:1,displayNames:["Gemini 2.5 Pro"],copilotPricing:{inputCostPerMillion:1.25,cachedInputCostPerMillion:.125,outputCostPerMillion:10,releaseStatus:"GA",category:"Powerful"}},"gemini-2.5-flash":{inputCostPerMillion:.3,outputCostPerMillion:2.5,category:"Google Gemini models",tier:"unknown",multiplier:1,displayNames:["Gemini 2.5 Flash"]},"gemini-2.5-flash-lite":{inputCostPerMillion:.1,outputCostPerMillion:.4,category:"Google Gemini models",tier:"unknown",multiplier:1,displayNames:["Gemini 2.5 Flash Lite"]},"gemini-2.0-flash":{inputCostPerMillion:.1,outputCostPerMillion:.4,category:"Google Gemini models",tier:"standard",multiplier:0,displayNames:["Gemini 2.0 Flash"]},"gemini-2.0-flash-lite":{inputCostPerMillion:.075,outputCostPerMillion:.3,category:"Google Gemini models",tier:"standard",multiplier:0,displayNames:["Gemini 2.0 Flash Lite"]},"gemini-3-flash":{inputCostPerMillion:.5,outputCostPerMillion:3,category:"Google Gemini models",tier:"standard",multiplier:.33,displayNames:["Gemini 3 Flash"],copilotPricing:{inputCostPerMillion:.5,cachedInputCostPerMillion:.05,outputCostPerMillion:3,releaseStatus:"Public preview",category:"Lightweight"}},"gemini-3-pro":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"premium",multiplier:1,displayNames:["Gemini 3 Pro"]},"gemini-3-pro-preview":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"premium",multiplier:1,displayNames:["Gemini 3 Pro (Preview)"]},"gemini-3.1-pro":{inputCostPerMillion:2,outputCostPerMillion:12,category:"Google Gemini models",tier:"standard",multiplier:1,displayNames:["Gemini 3.1 Pro","Gemini 3.1 Pro (Preview)"],copilotPricing:{inputCostPerMillion:2,cachedInputCostPerMillion:.2,outputCostPerMillion:12,releaseStatus:"Public preview",category:"Powerful"}},"gemini-3.1-flash-lite":{inputCostPerMillion:.25,outputCostPerMillion:1.5,category:"Google Gemini models",tier:"unknown",multiplier:.33,displayNames:["Gemini 3.1 Flash Lite"]},"grok-code-fast-1":{inputCostPerMillion:.2,outputCostPerMillion:1.5,category:"xAI Grok models",tier:"premium",multiplier:.25,displayNames:["Grok Code Fast 1"],copilotPricing:{inputCostPerMillion:.2,cachedInputCostPerMillion:.02,outputCostPerMillion:1.5,releaseStatus:"GA",category:"Lightweight"}},"raptor-mini":{inputCostPerMillion:.25,outputCostPerMillion:2,category:"GitHub Copilot fine-tuned models",tier:"standard",multiplier:0,displayNames:["Raptor Mini"],copilotPricing:{inputCostPerMillion:.25,cachedInputCostPerMillion:.025,outputCostPerMillion:2,releaseStatus:"Public preview",category:"Versatile"}},goldeneye:{inputCostPerMillion:0,outputCostPerMillion:0,category:"GitHub Copilot fine-tuned models",tier:"standard",multiplier:0,copilotPricing:{inputCostPerMillion:1.25,cachedInputCostPerMillion:.125,outputCostPerMillion:10,releaseStatus:"Public preview",category:"Powerful"}},"gpt-5.5":{inputCostPerMillion:0,outputCostPerMillion:0,category:"GPT-5 models",tier:"standard",multiplier:7.5,displayNames:["GPT-5.5"]},"mistral-large-latest":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 3"]},"mistral-large-2512":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 3 (2512)"]},"mistral-large-2411":{inputCostPerMillion:2,outputCostPerMillion:6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Large 2.1"]},"magistral-medium-latest":{inputCostPerMillion:2,outputCostPerMillion:5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Magistral Medium"]},"mistral-medium-latest":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-3-5":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-3.5":{inputCostPerMillion:1.5,outputCostPerMillion:7.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.5"]},"mistral-medium-2505":{inputCostPerMillion:.4,outputCostPerMillion:2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Medium 3.1"]},"mistral-small-latest":{inputCostPerMillion:.1,outputCostPerMillion:.3,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 3.1"]},"mistral-small-2503":{inputCostPerMillion:.075,outputCostPerMillion:.2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 3.2"]},"mistral-small-2603":{inputCostPerMillion:.15,outputCostPerMillion:.6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Small 4"]},"codestral-latest":{inputCostPerMillion:.3,outputCostPerMillion:.9,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Codestral"]},"codestral-2501":{inputCostPerMillion:.3,outputCostPerMillion:.9,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Codestral (2501)"]},"open-mistral-nemo":{inputCostPerMillion:.02,outputCostPerMillion:.03,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Mistral Nemo"]},"ministral-3b-2410":{inputCostPerMillion:.04,outputCostPerMillion:.04,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Ministral 3B"]},"ministral-8b-2410":{inputCostPerMillion:.1,outputCostPerMillion:.1,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Ministral 8B"]},"magistral-small-latest":{inputCostPerMillion:.5,outputCostPerMillion:1.5,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Magistral Small"]},"devstral-medium-2507":{inputCostPerMillion:.4,outputCostPerMillion:2,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Devstral Medium"]},"pixtral-large-2411":{inputCostPerMillion:2,outputCostPerMillion:6,category:"Mistral models",tier:"unknown",multiplier:1,displayNames:["Pixtral Large"]},"gemini-3.5-flash":{inputCostPerMillion:0,outputCostPerMillion:0,category:"Google Gemini models",tier:"standard",multiplier:14,displayNames:["Gemini 3.5 Flash"]},"claude-opus-4.8":{inputCostPerMillion:5,outputCostPerMillion:25,category:"Claude models (Anthropic)",tier:"standard",multiplier:15,displayNames:["Claude Opus 4.8"]},"qwen2.5":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["Qwen2.5"]},"mai-code-1-flash[^mai-code-1-flash]":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["MAI-Code-1-Flash[^mai-code-1-flash]"]},"mai-code-1-flash":{inputCostPerMillion:0,outputCostPerMillion:0,category:" models",tier:"standard",multiplier:0,displayNames:["MAI-Code-1-Flash"]},"claude-fable-5":{inputCostPerMillion:10,outputCostPerMillion:50,category:"Claude models (Anthropic)",tier:"standard",multiplier:0,displayNames:["Claude Fable 5"]}}};var tr={};for(let[o,e]of Object.entries(ja.pricing))e.displayNames&&e.displayNames.length>0&&(tr[o]=e.displayNames[0]);function Wa(o){if(tr[o])return tr[o];try{return decodeURIComponent(o)}catch{return o}}var jm=new Set(["\u2705","\u26A0\uFE0F","\u274C"]);function _i(o){let e=Number(o);return Number.isFinite(e)?e:0}function Qa(o){if(!o||typeof o!="object")return;let e=o,t=Array.isArray(e.customizationTypes)?e.customizationTypes.filter(s=>!!s&&typeof s=="object").map(s=>({id:typeof s.id=="string"?s.id:"",icon:typeof s.icon=="string"?s.icon:"",label:typeof s.label=="string"?s.label:""})).filter(s=>s.id!==""):[],i=Array.isArray(e.workspaces)?e.workspaces.filter(s=>!!s&&typeof s=="object").map(s=>{let r=s.typeStatuses&&typeof s.typeStatuses=="object"?s.typeStatuses:{},n={};for(let[l,p]of Object.entries(r))n[l]=jm.has(p)?p:"\u274C";return{workspacePath:typeof s.workspacePath=="string"?s.workspacePath:"",workspaceName:typeof s.workspaceName=="string"?s.workspaceName:"",sessionCount:_i(s.sessionCount),interactionCount:_i(s.interactionCount),typeStatuses:n}}):[];return{customizationTypes:t,workspaces:i,totalWorkspaces:_i(e.totalWorkspaces),workspacesWithIssues:_i(e.workspacesWithIssues)}}var Ya={unknown:"Unknown",windsurf_cascade:"Windsurf Cascade",windsurf_file_edit:"Windsurf: File Edit",windsurf_file_create:"Windsurf: File Create",windsurf_file_read:"Windsurf: File Read",windsurf_terminal:"Windsurf: Terminal",windsurf_search:"Windsurf: Search",windsurf_browser:"Windsurf: Browser",run_in_terminal:"Run In Terminal",run_shell_command:"Run Shell Command",send_to_terminal:"Send To Terminal",run_build:"Run Build",run_command_in_terminal:"Run Command In Terminal","mcp.io.github.git.assign_copilot_to_issue":"GitHub MCP (Local): Assign Copilot to Issue","mcp.io.github.git.create_or_update_file":"GitHub MCP (Local): Create/Update File",mcp_io_github_git_create_or_update_file:"GitHub MCP (Local): Create/Update File",mcp_io_github_git_assign_copilot_to_issue:"GitHub MCP (Local): Assign Copilot to Issue",mcp_io_github_git_pull_request_read:"GitHub MCP (Local): Pull Request Read",mcp_io_github_git_issue_read:"GitHub MCP (Local): Issue Read",mcp_io_github_git_issue_write:"GitHub MCP (Local): Issue Write",mcp_io_github_git_list_issues:"GitHub MCP (Local): List Issues",mcp_io_github_git_create_pull_request:"GitHub MCP (Local): Create Pull Request",mcp_io_github_git_get_file_contents:"GitHub MCP (Local): Get File Contents",mcp_io_github_git_search_code:"GitHub MCP (Local): Search Code",mcp_io_github_git_search_pull_requests:"GitHub MCP (Local): Search Pull Requests",mcp_io_github_git_get_release_by_tag:"GitHub MCP (Local): Get Release By Tag",mcp_io_github_git_search_issues:"GitHub MCP (Local): Search Issues",mcp_io_github_git_add_issue_comment:"GitHub MCP (Local): Add Issue Comment",mcp_io_github_git_list_pull_requests:"GitHub MCP (Local): List Pull Requests",mcp_io_github_git_get_commit:"GitHub MCP (Local): Get Commit",mcp_io_github_git_list_commits:"GitHub MCP (Local): List Commits",mcp_io_github_git_list_code_scanning_alerts:"GitHub MCP (Local): List Code Scanning Alerts",mcp_io_github_git_get_repository_tree:"GitHub MCP (Local): Get Repository Tree",mcp_io_github_git_get_job_logs:"GitHub MCP (Local): Get Job Logs",mcp_io_github_git_list_tags:"GitHub MCP (Local): List Tags",mcp_io_github_git_search_repositories:"GitHub MCP (Local): Search Repositories",mcp_io_github_git_create_repository:"GitHub MCP (Local): Create Repository",mcp_io_github_git_search_users:"GitHub MCP (Local): Search Users",mcp_io_github_git_get_latest_release:"GitHub MCP (Local): Get Latest Release",mcp_io_github_git_get_tag:"GitHub MCP (Local): Get Tag",mcp_github_github_assign_copilot_to_issue:"GitHub MCP (Remote): Assign Copilot to Issue",mcp_github_github_issue_read:"GitHub MCP (Remote): Issue Read",mcp_github_github_issue_write:"GitHub MCP (Remote): Issue Write",mcp_github_github_list_issues:"GitHub MCP (Remote): List Issues",mcp_github_get_file_contents:"GitHub MCP (Remote): Get File Contents",mcp_github_get_latest_release:"GitHub MCP (Remote): Get Latest Release",mcp_github_get_release_by_tag:"GitHub MCP (Remote): Get Release By Tag",mcp_github_list_releases:"GitHub MCP (Remote): List Releases",mcp_github_list_tags:"GitHub MCP (Remote): List Tags",mcp_github_search_code:"GitHub MCP (Remote): Search Code",mcp_github_search_issues:"GitHub MCP (Remote): Search Issues",mcp_github_issue_write:"GitHub MCP (Remote): Issue Write",mcp_github_list_issues:"GitHub MCP (Remote): List Issues",mcp_github_create_pull_request:"GitHub MCP (Remote): Create Pull Request",mcp_github_pull_request_read:"GitHub MCP (Remote): Pull Request Read",mcp_github_list_branches:"MCP GitHub List Branches",mcp_github_update_pull_request:"MCP GitHub Update Pull Request","github-mcp-server-get_file_contents":"GitHub MCP: Get File Contents","github-mcp-server-get_job_logs":"GitHub MCP: Get Job Logs","github-mcp-server-list_commits":"GitHub MCP: List Commits","github-mcp-server-search_code":"GitHub MCP: Search Code","github-mcp-server-actions_list":"GitHub MCP: Actions List","github-mcp-server-list_issues":"GitHub MCP: List Issues","github-mcp-server-search_repositories":"GitHub MCP: Search Repositories","github-mcp-server-list_branches":"GitHub MCP: List Branches","github-mcp-server-issue_read":"GitHub MCP: Issue Read","github-mcp-server-issue_write":"GitHub MCP: Issue Write","github-mcp-server-pull_request_read":"GitHub MCP: Pull Request Read","github-mcp-server-search_issues":"GitHub MCP: Search Issues","github-mcp-server-search_users":"GitHub MCP: Search Users","github-mcp-server-sub_issue_write":"GitHub MCP: Sub Issue Write","github-mcp-server-list_pull_requests":"GitHub MCP Server List Pull Requests","github-mcp-server-search_pull_requests":"GitHub MCP (Remote): Search Pull Requests","github-actions_get":"GitHub Actions: Get","github-actions_list":"GitHub Actions: List","github-create_pull_request":"GitHub: Create Pull Request","github-get_commit":"GitHub: Get Commit","github-get_file_contents":"GitHub: Get File Contents","github-get_job_logs":"GitHub: Get Job Logs","github-get_latest_release":"GitHub: Get Latest Release","github-get_me":"GitHub: Get Me","github-get_release_by_tag":"GitHub: Get Release By Tag","github-get_repository_tree":"GitHub: Get Repository Tree","github-get_teams":"GitHub: Get Teams","github-github_support_docs_search":"GitHub: GitHub Support Docs Search","github-issue_read":"GitHub: Issue Read","github-list_code_scanning_alerts":"GitHub: List Code Scanning Alerts","github-list_dependabot_alerts":"GitHub: List Dependabot Alerts","github-list_tags":"GitHub: List Tags","github-pull_request_read":"GitHub: Pull Request Read","github-pull_request_review_write":"GitHub: Pull Request Review Write","github-search_code":"GitHub: Search Code","github-search_pull_requests":"GitHub: Search Pull Requests","github-search_repositories":"GitHub: Search Repositories","github-update_pull_request":"GitHub: Update Pull Request","mcp_github-code-s_get_code_scanning_alert":"GitHub MCP (Code Scanning): Get Alert","mcp_github-code-s_list_code_scanning_alerts":"GitHub MCP (Code Scanning): List Alerts",mcp_com_microsoft_get_bestpractices:"GitHub MCP: Get Best Practices",mcp_microsoft_doc_microsoft_code_sample_search:"Microsoft Docs MCP: Code Sample Search",mcp_microsoft_doc_microsoft_docs_search:"Microsoft Docs MCP: Docs Search",mcp_microsoftdocs_microsoft_code_sample_search:"Microsoft Docs MCP: Code Sample Search",mcp_microsoftdocs_microsoft_docs_fetch:"Microsoft Docs MCP: Docs Fetch",mcp_microsoftdocs_microsoft_docs_search:"Microsoft Docs MCP: Docs Search",Microsoft_Learn_microsoft_docs_search:"Microsoft Learn: Docs Search","microsoft-learn-microsoft_docs_search":"Microsoft Learn: Docs Search",mcp_gitkraken_git_add_or_commit:"GitKraken MCP: Git Add or Commit",mcp_gitkraken_git_status:"GitKraken MCP: Git Status",mcp_gitkraken_git_branch:"GitKraken MCP: Git Branch",mcp_gitkraken_git_checkout:"GitKraken MCP: Git Checkout",mcp_gitkraken_git_log_or_diff:"GitKraken MCP: Git Log or Diff",mcp_gitkraken_gitkraken_workspace_list:"GitKraken MCP: List Workspaces",mcp_gitkraken_git_push:"GitKraken MCP: Git Push",mcp_gitkraken_gitlens_commit_composer:"GitKraken MCP: GitLens Commit Composer",mcp_git_git_log:"Git MCP: Git Log",mcp_git_git_show:"Git MCP: Git Show",mcp_git_git_diff_staged:"Git MCP: Git Diff Staged",mcp_pencil_batch_design:"Pencil MCP: Batch Design",mcp_pencil_get_editor_state:"Pencil MCP: Get Editor State",mcp_pencil_get_guidelines:"Pencil MCP: Get Guidelines",mcp_pencil_get_screenshot:"Pencil MCP: Get Screenshot",mcp_pencil_snapshot_layout:"Pencil MCP: Snapshot Layout",mcp_figma_get_design_context:"Figma MCP: Get Design Context",mcp_figma_get_screenshot:"Figma MCP: Get Screenshot",mcp_figma_get_variable_defs:"Figma MCP: Get Variable Defs",mcp_azure_aks:"Azure MCP: AKS",mcp_azure_mcp_azureterraformbestpractices:"Azure MCP: Azure Terraform Best Practices",mcp_azure_mcp_documentation:"Azure MCP: Documentation",mcp_azure_mcp_get_bestpractices:"Azure MCP: Get Best Practices",mcp_azure_mcp_group_list:"Azure MCP: Group List",mcp_azure_mcp_storage:"Azure MCP: Storage",mcp_azure_mcp_subscription_list:"Azure MCP: Subscription List",mcp_azure_mcp_pricing:"Azure MCP: Pricing",mcp_azure_mcp_get_azure_bestpractices:"Azure MCP: Get Azure Best Practices","azure-mcp-azureterraformbestpractices":"Azure MCP: Azure Terraform Best Practices","azure-mcp-documentation":"Azure MCP: Documentation","azure-mcp-extension_cli_generate":"Azure MCP: Extension CLI Generate","azure-mcp-get_azure_bestpractices":"Azure MCP: Get Azure Best Practices","azure-mcp-group_list":"Azure MCP: Group List","azure-mcp-subscription_list":"Azure MCP: Subscription List",mcp_bicep_format_bicep_file:"Bicep MCP: Format Bicep File",mcp_bicep_get_az_resource_type_schema:"Bicep MCP: Get Az Resource Type Schema",mcp_bicep_get_bicep_best_practices:"Bicep MCP: Get Bicep Best Practices",mcp_bicep_get_bicep_file_diagnostics:"Bicep MCP: Get Bicep File Diagnostics",mcp_bicep_list_az_resource_types_for_provider:"Bicep MCP: List Az Resource Types For Provider","azure_bicep-get_azure_verified_module":"Azure Bicep: Get Azure Verified Module","azure_development-recommend_custom_modes":"Azure Development: Recommend Custom Modes","azure_resources-query_azure_resource_graph":"Azure Resources: Query Azure Resource Graph",azureResources_getAzureActivityLog:"Azure Resources: Get Azure Activity Log","azure_auth-get_auth_context":"Azure Auth: Get Auth Context","azure_auth-set_auth_context":"Azure Auth: Set Auth Context","ms-azuretools.azure-agent":"Azure Agent",manage_todo_list:"Manage TODO List",copilot_readFile:"Read File",copilot_viewImage:"Copilot View Image",opilot_findFiles:"Find Files",copilot_writeFile:"Write File",copilot_applyPatch:"Apply Patch",copilot_findTextInFiles:"Find Text In Files",copilot_findFiles:"Find Files",copilot_replaceString:"Replace String",copilot_createFile:"Create File",copilot_listDirectory:"List Directory",copilot_fetchWebPage:"Fetch Web Page",copilot_getErrors:"Get Errors",copilot_multiReplaceString:"Multi Replace String",copilot_searchCodebase:"Search Codebase",get_terminal_output:"Get Terminal Output",run_task:"Run Task: Investigate",await_terminal:"Await Terminal command","github.copilot.editsAgent":"GitHub Copilot Edits Agent",todoList:"TODO List",terminal:"Terminal",terminal_last_command:"Terminal Last Command",github_pull_request:"GitHub Pull Request",github_repo:"GitHub Repository",editFiles:"Edit Files",listFiles:"List Files",list_issues:"List Issues",search_subagent:"Search Subagent",execution_subagent:"Execution Subagent",apply_patch:"Apply Patch",ask_questions:"Ask Questions",AskUserQuestion:"Ask User Question",ask_user_question:"Ask User Question",copilot_askQuestions:"Ask Questions",copilot_createAndRunTask:"Create And Run Task",copilot_createDirectory:"Create Directory",copilot_createNewJupyterNotebook:"Create New Jupyter Notebook",copilot_createNewWorkspace:"Create New Workspace",copilot_editFiles:"Edit Files",copilot_editNotebook:"Edit Notebook",copilot_findTestFiles:"Find Test Files",copilot_getChangedFiles:"Get Changed Files",copilot_getDocInfo:"Get Doc Info",copilot_getNotebookSummary:"Get Notebook Summary",copilot_getProjectSetupInfo:"Get Project Setup Info",copilot_getSearchResults:"Get Search Results",copilot_getVSCodeAPI:"Get VSCode API",copilot_githubRepo:"GitHub Repository",copilot_githubTextSearch:"GitHub Text Search",copilot_resolveMemoryFileUri:"Resolve Memory File URI",copilot_insertEdit:"Insert Edit",copilot_installExtension:"Install Extension",copilot_memory:"Memory",copilot_openIntegratedBrowser:"Open Integrated Browser",copilot_openSimpleBrowser:"Open Simple Browser",copilot_readNotebookCellOutput:"Read Notebook Cell Output",copilot_readProjectStructure:"Read Project Structure",copilot_runNotebookCell:"Run Notebook Cell",copilot_runInTerminal:"Run In Terminal",copilot_runTests1:"Run Tests",copilot_runVscodeCommand:"Run VSCode Command",copilot_searchWorkspaceSymbols:"Search Workspace Symbols",copilot_switchAgent:"Switch Agent",copilot_testFailure:"Test Failure",copilot_toolReplay:"Tool Replay",create_and_run_task:"Create And Run Task",create_directory:"Create Directory",create_file:"Create File",remove_file:"Remove File",create_new_jupyter_notebook:"Create New Jupyter Notebook",create_new_workspace:"Create New Workspace",create_virtual_environment:"Create Virtual Environment",edit_files:"Edit Files",edit_file:"Edit File",edit_notebook_file:"Edit Notebook File",fetch_webpage:"Fetch Webpage",file_search:"File Search",get_changed_files:"Get Changed Files",get_doc_info:"Get Doc Info",get_errors:"Get Errors",get_project_setup_info:"Get Project Setup Info",get_files_in_project:"Get Files In Project",get_projects_in_solution:"Get Projects In Solution",configure_python_environment:"Configure Python Environment",get_python_executable_details:"Get Python Executable Details",get_search_view_results:"Get Search View Results",get_task_output:"Get Task Output",get_output_window_logs:"Get Output Window Logs",job_output:"Job Output",get_vscode_api:"Get VSCode API",grep_search:"Grep Search",insert_edit_into_file:"Insert Edit Into File",install_extension:"Install Extension",install_python_packages:"Install Python Packages",list_dir:"List Dir",list_directory:"List Directory",ls:"Ls",memory:"Memory",multi_replace_string_in_file:"Multi Replace String In File",open_integrated_browser:"Open Integrated Browser",open_simple_browser:"Open Simple Browser",read_file:"Read File",view_image:"View Image",read_notebook_cell_output:"Read Notebook Cell Output",read_project_structure:"Read Project Structure",replace_string_in_file:"Replace String In File","setup.agent":"Setup Agent",selectEnvironment:"Select Environment",run_notebook_cell:"Run Notebook Cell",run_vscode_command:"Run VSCode Command",runSubagent:"Run Subagent",renderMermaidDiagram:"Render Mermaid Diagram",runTests:"Run Tests",search_workspace_symbols:"Search Workspace Symbols",semantic_search:"Semantic Search",switch_agent:"Switch Agent",terminal_selection:"Terminal Selection",test_failure:"Test Failure",test_search:"Test Search",tool_replay:"Tool Replay",tool_search:"Tool Search",vscode_askQuestions:"VSCode Ask Questions",vscode_get_confirmation:"VSCode Get Confirmation",vscode_get_confirmation_with_options:"VSCode Get Confirmation With Options",vscode_get_terminal_confirmation:"VSCode Get Terminal Confirmation",vscode_get_modified_files_confirmation:"VSCode Get Modified Files Confirmation",vscode_listCodeUsages:"VSCode List Code Usages",vscode_renameSymbol:"VSCode Rename Symbol","mcp_io_github_ups_get-library-docs":"Context7 MCP: Get Library Docs","mcp_io_github_ups_query-docs":"Context7 MCP: Query Docs","mcp_io_github_ups_resolve-library-id":"Context7 MCP: Resolve Library ID","mcp_context7_get-library-docs":"Context7 MCP: Get Library Docs","mcp_context7_query-docs":"Context7 MCP: Query Docs","mcp_context7_resolve-library-id":"Context7 MCP: Resolve Library ID",mcp_microsoft_pla_browser_evaluate:"Playwright MCP: Browser Evaluate",mcp_microsoft_pla_browser_install:"Playwright MCP: Browser Install",mcp_microsoft_pla_browser_navigate:"Playwright MCP: Browser Navigate",mcp_microsoft_pla_browser_run_code:"Playwright MCP: Browser Run Code",mcp_microsoft_pla_browser_click:"Playwright MCP: Browser Click",mcp_microsoft_pla_browser_fill_form:"Playwright MCP: Browser Fill Form",mcp_microsoft_pla_browser_press_key:"Playwright MCP: Browser Press Key",mcp_microsoft_pla_browser_resize:"Playwright MCP: Browser Resize",mcp_microsoft_pla_browser_snapshot:"Playwright MCP: Browser Snapshot",mcp_microsoft_pla_browser_tabs:"Playwright MCP: Browser Tabs",mcp_microsoft_pla_browser_take_screenshot:"Playwright MCP: Browser Take Screenshot",mcp_microsoft_pla_browser_type:"Playwright MCP: Browser Type",mcp_microsoft_pla_browser_console_messages:"MCP Microsoft Playwright Browser Console Messages",mcp_microsoft_pla_browser_wait_for:"Mcp Microsoft Pla Browser Wait For",mcp_playwright_browser_click:"Playwright MCP: Browser Click",mcp_playwright_browser_navigate:"Playwright MCP: Browser Navigate",mcp_playwright_browser_snapshot:"Playwright MCP: Browser Snapshot",mcp_playwright_browser_take_screenshot:"Playwright MCP: Browser Take Screenshot","microsoft-playwright-mcp-browser_evaluate":"Playwright MCP: Browser Evaluate","microsoft-playwright-mcp-browser_navigate":"Playwright MCP: Browser Navigate","microsoft-playwright-mcp-browser_snapshot":"Playwright MCP: Browser Snapshot",mcp_pylance_mcp_s_pylanceDocString:"Pylance MCP: Pylance Doc String",mcp_pylance_mcp_s_pylanceRunCodeSnippet:"Pylance MCP: Run Code Snippet",mcp_pylance_mcp_s_pylanceWorkspaceRoots:"Pylance MCP: Workspace Roots",mcp_pylance_mcp_s_pylanceFileSyntaxErrors:"Pylance MCP: File Syntax Errors",mcp_pylance_mcp_s_pylanceSyntaxErrors:"Pylance MCP: Syntax Errors","mcp_chrome-devtoo_click":"Chrome DevTools MCP: Click","mcp_chrome-devtoo_evaluate_script":"Chrome DevTools MCP: Evaluate Script","mcp_chrome-devtoo_fill":"Chrome DevTools MCP: Fill","mcp_chrome-devtoo_get_network_request":"Chrome DevTools MCP: Get Network Request","mcp_chrome-devtoo_list_console_messages":"Chrome DevTools MCP: List Console Messages","mcp_chrome-devtoo_list_pages":"Chrome DevTools MCP: List Pages","mcp_chrome-devtoo_navigate_page":"Chrome DevTools MCP: Navigate Page","mcp_chrome-devtoo_new_page":"Chrome DevTools MCP: New Page","mcp_chrome-devtoo_select_page":"Chrome DevTools MCP: Select Page","mcp_chrome-devtoo_take_screenshot":"Chrome DevTools MCP: Take Screenshot","mcp_chrome-devtoo_fill_form":"Chrome DevTools MCP: Fill Form","mcp_chrome-devtoo_hover":"Chrome DevTools MCP: Hover","mcp_chrome-devtoo_list_network_requests":"Chrome DevTools MCP: List Network Requests","mcp_chrome-devtoo_press_key":"Chrome DevTools MCP: Press Key","mcp_chrome-devtoo_take_snapshot":"Chrome DevTools MCP: Take Snapshot","mcp_chrome-devtoo_wait_for":"Chrome DevTools MCP: Wait For","mcp_chrome-devtoo_close_page":"Chrome DevTools MCP: Close Page","mcp_chrome-devtoo_lighthouse_audit":"Chrome DevTools MCP: Lighthouse Audit","mcp_chrome-devtoo_performance_analyze_insight":"Chrome DevTools MCP: Performance Analyze Insight","mcp_chrome-devtoo_performance_start_trace":"Chrome DevTools MCP: Performance Start Trace","mcp_chrome-devtoo_resize_page":"Chrome DevTools MCP: Resize Page","mcp_chrome-devtoo_type_text":"Chrome DevTools MCP: Type Text",mcp_chrome_devtoo_click:"Chrome DevTools MCP: Click",mcp_chrome_devtoo_evaluate_script:"Chrome DevTools MCP: Evaluate Script",mcp_chrome_devtoo_fill:"Chrome DevTools MCP: Fill",mcp_chrome_devtoo_get_console_message:"Chrome DevTools MCP: Get Console Message",mcp_chrome_devtoo_get_network_request:"Chrome DevTools MCP: Get Network Request",mcp_chrome_devtoo_list_console_messages:"Chrome DevTools MCP: List Console Messages",mcp_chrome_devtoo_list_network_requests:"Chrome DevTools MCP: List Network Requests",mcp_chrome_devtoo_list_pages:"Chrome DevTools MCP: List Pages",mcp_chrome_devtoo_navigate_page:"Chrome DevTools MCP: Navigate Page",mcp_chrome_devtoo_new_page:"Chrome DevTools MCP: New Page",mcp_chrome_devtoo_take_snapshot:"Chrome DevTools MCP: Take Snapshot",mcp_chrome_devtoo_wait_for:"Chrome DevTools MCP: Wait For",mcp_io_github_chr_click:"Chrome DevTools MCP: Click",mcp_io_github_chr_emulate:"Chrome DevTools MCP: Emulate",mcp_io_github_chr_evaluate_script:"Chrome DevTools MCP: Evaluate Script",mcp_io_github_chr_list_network_requests:"Chrome DevTools MCP: List Network Requests",mcp_io_github_chr_list_pages:"Chrome DevTools MCP: List Pages",mcp_io_github_chr_navigate_page:"Chrome DevTools MCP: Navigate Page",mcp_io_github_chr_new_page:"Chrome DevTools MCP: New Page",mcp_io_github_chr_resize_page:"Chrome DevTools MCP: Resize Page",mcp_io_github_chr_select_page:"Chrome DevTools MCP: Select Page",mcp_io_github_chr_take_snapshot:"Chrome DevTools MCP: Take Snapshot",mcp_oraios_serena_activate_project:"Serena: Activate Project",mcp_oraios_serena_check_onboarding_performed:"Serena: Check Onboarding Performed",mcp_oraios_serena_create_text_file:"Serena: Create Text File",mcp_oraios_serena_delete_lines:"Serena: Delete Lines",mcp_oraios_serena_delete_memory:"Serena: Delete Memory",mcp_oraios_serena_edit_memory:"Serena: Edit Memory",mcp_oraios_serena_execute_shell_command:"Serena: Execute Shell Command",mcp_oraios_serena_find_file:"Serena: Find File",mcp_oraios_serena_find_referencing_symbols:"Serena: Find Referencing Symbols",mcp_oraios_serena_find_symbol:"Serena: Find Symbol",mcp_oraios_serena_get_current_config:"Serena: Get Current Config",mcp_oraios_serena_get_symbols_overview:"Serena: Get Symbols Overview",mcp_oraios_serena_initial_instructions:"Serena: Initial Instructions",mcp_oraios_serena_insert_after_symbol:"Serena: Insert After Symbol",mcp_oraios_serena_insert_at_line:"Serena: Insert At Line",mcp_oraios_serena_insert_before_symbol:"Serena: Insert Before Symbol",mcp_oraios_serena_jet_brains_find_referencing_symbols:"Serena: JetBrains Find Referencing Symbols",mcp_oraios_serena_jet_brains_find_symbol:"Serena: JetBrains Find Symbol",mcp_oraios_serena_jet_brains_get_symbols_overview:"Serena: JetBrains Get Symbols Overview",mcp_oraios_serena_jet_brains_type_hierarchy:"Serena: JetBrains Type Hierarchy",mcp_oraios_serena_list_dir:"Serena: List Dir",mcp_oraios_serena_list_memories:"Serena: List Memories",mcp_oraios_serena_onboarding:"Serena: Onboarding",mcp_oraios_serena_open_dashboard:"Serena: Open Dashboard",mcp_oraios_serena_prepare_for_new_conversation:"Serena: Prepare For New Conversation",mcp_oraios_serena_read_file:"Serena: Read File",mcp_oraios_serena_read_memory:"Serena: Read Memory",mcp_oraios_serena_remove_project:"Serena: Remove Project",mcp_oraios_serena_rename_symbol:"Serena: Rename Symbol",mcp_oraios_serena_replace_content:"Serena: Replace Content",mcp_oraios_serena_replace_lines:"Serena: Replace Lines",mcp_oraios_serena_replace_symbol_body:"Serena: Replace Symbol Body",mcp_oraios_serena_restart_language_server:"Serena: Restart Language Server",mcp_oraios_serena_search_for_pattern:"Serena: Search For Pattern",mcp_oraios_serena_summarize_changes:"Serena: Summarize Changes",mcp_oraios_serena_switch_modes:"Serena: Switch Modes",mcp_oraios_serena_think_about_collected_information:"Serena: Think About Collected Information",mcp_oraios_serena_think_about_task_adherence:"Serena: Think About Task Adherence",mcp_oraios_serena_think_about_whether_you_are_done:"Serena: Think About Whether You Are Done",mcp_oraios_serena_write_memory:"Serena: Write Memory","mcp_visuals-mcp_display_image":"Visuals MCP: Display Image","mcp_laravel-boost_tinker":"Laravel Boost MCP: Tinker",bash:"Bash",Bash:"Bash",code_search:"Code Search",detect_memories:"Detect Memories",dismiss_deployment_notifications:"Dismiss Deployment Notifications",get_currentfile:"Get Current File",get_file:"Get File",get_symbols_by_name:"Get Symbols By Name","claude-code":"Claude Code","copilot-cloud-agent":"Copilot Cloud Agent",agent:"Agent",copilotcli:"Copilot CLI","github.copilot.default":"GitHub Copilot Default","github.copilot.workspace":"GitHub Copilot Workspace","github.copilot.vscode":"GitHub Copilot VSCode","github.copilot-dynamic.platform":"GitHub Copilot Dynamic: Platform",glob:"Glob",file_glob_search:"File Glob Search",grep:"Grep",kill_terminal:"Kill Terminal",read:"Read",view:"View",vscode_editFile_internal:"VSCode Edit File (Internal)",vscode_fetchWebPage_internal:"VSCode Fetch Web Page (Internal)",vscode_searchExtensions_internal:"VSCode Search Extensions (Internal)","vscode-websearchforcopilot_webSearch":"VSCode WebSearch for Copilot: Web Search",Build_CMakeTools:"CMake Tools: Build",ListBuildTargets_CMakeTools:"CMake Tools: List Build Targets",ListTests_CMakeTools:"CMake Tools: List Tests",RunCtest_CMakeTools:"CMake Tools: Run CTest","nuget_get-nuget-solver":"NuGet: Get NuGet Solver",webfetch:"Web Fetch",web_fetch:"Web Fetch",write:"Write",edit:"Edit",search_replace:"Search Replace",write_file:"Write File",multiedit:"Multi Edit",question:"Question",skill:"Skill",read_skill:"Read Skill",task:"Task",todowrite:"Todo Write",TodoWrite:"Todo Write",todos:"Todos",todo:"Todo",websearch:"Web Search",WebSearch:"Web Search",click_element:"Click Element",navigate_page:"Navigate Page",open_browser_page:"Open Browser Page",read_page:"Read Page",run_playwright_code:"Run Playwright Code",screenshot_page:"Screenshot Page",type_in_page:"Type in Page",task_complete:"Task Complete","pdf-utilities.pdf":"PDF Utilities: PDF","container-tools_get-config":"Container Tools: Get Config","github-pull-request_activePullRequest":"GitHub Pull Request: Active Pull Request","github-pull-request_currentActivePullRequest":"GitHub Pull Request: Current Active Pull Request","github-pull-request_issue_fetch":"GitHub Pull Request: Issue Fetch","github-pull-request_pullRequestStatusChecks":"GitHub Pull Request: Pull Request Status Checks","github-pull-request_pullRequestInViewport":"GitHub MCP (Remote): Pull Request In Viewport","mcp_powerbi-model_connection_operations":"Power BI MCP: Connection Operations",MiniMax_web_search:"MiniMax: Web Search",dingDocuments_get_document_content:"Ding Documents: Get Document Content",dingDocuments_list_nodes:"Ding Documents: List Nodes",dingDocuments_search_documents:"Ding Documents: Search Documents",fetch_fetch:"Fetch: Fetch",mcp__Claude_in_Chrome__computer:"Claude in Chrome MCP: Computer",mcp__Claude_in_Chrome__navigate:"Claude in Chrome MCP: Navigate",mcp__Claude_in_Chrome__browser_batch:"Claude in Chrome MCP: Browser Batch",mcp__Claude_in_Chrome__get_page_text:"Claude in Chrome MCP: Get Page Text",mcp__Claude_in_Chrome__tabs_context_mcp:"Claude in Chrome MCP: Tabs Context",mcp__Claude_in_Chrome__tabs_create_mcp:"Claude in Chrome MCP: Tabs Create",mcp__Claude_in_Chrome__javascript_tool:"Claude in Chrome MCP: Javascript Tool",mcp__Claude_in_Chrome__read_console_messages:"Claude in Chrome MCP: Read Console Messages",mcp__Claude_in_Chrome__read_network_requests:"Claude in Chrome MCP: Read Network Requests",mcp__Claude_in_Chrome:"Claude in Chrome MCP",mcp__Claude_in_Chrome__find:"Claude in Chrome MCP: Find",mcp__Claude_in_Chrome__form_input:"Claude in Chrome MCP: Form Input",mcp__Claude_in_Chrome__list_connected_browsers:"Claude in Chrome MCP: List Connected Browsers",mcp__Claude_in_Chrome__read_page:"Claude in Chrome MCP: Read Page",mcp__Claude_in_Chrome__select_browser:"Claude in Chrome MCP: Select Browser",mcp__cowork__allow_cowork_file_delete:"Cowork MCP: Allow Cowork File Delete",mcp__cowork__present_files:"Cowork MCP: Present Files",mcp__cowork__request_cowork_directory:"Cowork MCP: Request Cowork Directory","mcp__cowork-onboarding__show_onboarding_role_picker":"Cowork Onboarding MCP: Show Onboarding Role Picker",TaskOutput:"Task Output",TaskStop:"Task Stop",mcp__plugins__search_plugins:"Plugins MCP: Search Plugins",mcp__plugins__suggest_plugin_install:"Plugins MCP: Suggest Plugin Install",mcp__workspace__bash:"Workspace MCP: Bash",mcp__workspace__web_fetch:"Workspace MCP: Web Fetch","mcp__mcp-registry__search_mcp_registry":"MCP Registry: Search MCP Registry",Agent:"Agent",Edit:"Edit",Glob:"Glob",Grep:"Grep",NotebookEdit:"Notebook Edit",Read:"Read",Skill:"Skill",TaskCreate:"Task Create",TaskUpdate:"Task Update",ToolSearch:"Tool Search",Write:"Write","mcp__claude_ai_Context7__resolve-library-id":"Context7 MCP (Claude): Resolve Library ID",mcp__claude_ai_Excalidraw__create_view:"Excalidraw MCP (Claude): Create View",mcp__claude_ai_Excalidraw__read_me:"Excalidraw MCP (Claude): Read Me","mcp__claude_ai_Notion__notion-create-pages":"Notion MCP (Claude): Create Pages","mcp__claude_ai_Notion__notion-fetch":"Notion MCP (Claude): Fetch","mcp__claude_ai_Notion__notion-search":"Notion MCP (Claude): Search","mcp__claude_ai_Notion__notion-update-page":"Notion MCP (Claude): Update Page","mcp__context7__query-docs":"Context7 MCP: Query Docs","mcp__context7__resolve-library-id":"Context7 MCP: Resolve Library ID","mcp__databricks-sql-allscopes__authenticate":"Databricks SQL MCP: Authenticate","mcp__databricks-sql-allscopes__complete_authentication":"Databricks SQL MCP: Complete Authentication","mcp__databricks-sql__authenticate":"Databricks SQL MCP: Authenticate",mcp__playwright__browser_evaluate:"Playwright MCP: Browser Evaluate",mcp__playwright__browser_navigate:"Playwright MCP: Browser Navigate","mcp__plugin_context7_context7__query-docs":"Context7 MCP: Query Docs","mcp__plugin_context7_context7__resolve-library-id":"Context7 MCP: Resolve Library ID","mcp__shopify-dev-mcp__learn_shopify_api":"Shopify Dev MCP: Learn Shopify API","mcp__shopify-dev-mcp__search_docs_chunks":"Shopify Dev MCP: Search Docs Chunks","mcp__shopify-dev-mcp__validate_graphql_codeblocks":"Shopify Dev MCP: Validate GraphQL Codeblocks",invalid:"Invalid",rename_session:"Rename Session",update_topic:"Update Topic",rename_branch:"Rename Branch",report_intent:"Report Intent",create_pull_request:"Create Pull Request",update_pull_request:"Update Pull Request",powershell:"PowerShell",ask_user:"Ask User",sql:"SQL",show_file:"Show File",exit_plan_mode:"Exit Plan Mode",get_changes_overview:"Get Changes Overview",annotate_diff_line:"Annotate Diff",add_pr_review_comment:"Add PR Review Comment",remove_pr_review_comment:"Remove PR Review Comment",reply_to_comment:"Reply to Comment",open_pr_session:"Open PR Session",open_issue_session:"Open Issue Session",create_session:"Create Session",list_sessions_and_chats:"List Sessions & Chats",list_projects:"List Projects",get_session:"Get Session",navigate_to:"Navigate To",delete_item:"Delete Item",send_session_message:"Send Session Message",send_chat_message:"Send Chat Message",read_agent:"Read Agent",write_agent:"Write Agent",list_agents:"List Agents",discover_widgets:"Discover Widgets",render_widget:"Render Widget",clear_widget:"Clear Widget",extensions_manage:"Extensions Manage",extensions_reload:"Extensions Reload",create:"Create",fetch_copilot_cli_documentation:"Fetch Copilot CLI Documentation",generate_findings:"Generate Findings",generate_topics:"Generate Topics",list_bash:"List Bash",read_bash:"Read Bash",write_bash:"Write Bash",stop_bash:"Stop Bash",list_powershell:"List PowerShell",read_powershell:"Read PowerShell",render_widget_inbox:"Render Widget Inbox",rg:"Ripgrep",stop_powershell:"Stop PowerShell",store_memory:"Store Memory",web_search:"Web Search",write_powershell:"Write PowerShell",slidev_chooseEntry:"Slidev: Choose Entry",slidev_getPreviewPort:"Slidev: Get Preview Port",clarify_requirements:"Clarify Requirements",get_tests:"Get Tests","ide-get_diagnostics":"IDE: Get Diagnostics","ide-get_selection":"IDE: Get Selection",plan:"Plan",signal_plan_ready:"Signal Plan Ready",update_plan_progress:"Update Plan Progress",EnterPlanMode:"Enter Plan Mode",ExitPlanMode:"Exit Plan Mode",mcp_reload:"MCP: Reload",mcp_validate:"MCP: Validate",stop_agent:"Stop Agent","workiq-accept_eula":"WorkIQ: Accept EULA","workiq-ask_work_iq":"WorkIQ: Ask Work IQ","mcp_ado-remote-mc_core_list_projects":"Azure DevOps MCP: Core List Projects","mcp_ado-remote-mc_repo_branch":"Azure DevOps MCP: Repo Branch","mcp_ado-remote-mc_repo_pull_request":"Azure DevOps MCP: Repo Pull Request","mcp_ado-remote-mc_repo_pull_request_thread":"Azure DevOps MCP: Repo Pull Request Thread","mcp_ado-remote-mc_repo_pull_request_write":"Azure DevOps MCP: Repo Pull Request Write","mcp_ado-remote-mc_repo_repository":"Azure DevOps MCP: Repo Repository","mcp_ado-remote-mc_search_workitem":"Azure DevOps MCP: Search Work Item","mcp_ado-remote-mc_wit_get_work_item":"Azure DevOps MCP: Get Work Item","mcp_ado-remote-mc_wit_work_item":"Azure DevOps MCP: Work Item","mcp_ado-remote-mc_wit_work_item_comment_write":"Azure DevOps MCP: Work Item Comment Write","mcp_ado-remote-mc_wit_work_item_link_write":"Azure DevOps MCP: Work Item Link Write","mcp_ado-remote-mc_wit_work_item_write":"Azure DevOps MCP: Work Item Write",mssql_list_servers:"MSSQL: List Servers",add_loaded_assembly:"Add Loaded Assembly",analyze_symbol:"Analyze Symbol",search_decompiled_symbols:"Search Decompiled Symbols",get_classification_rubric:"Get Classification Rubric",get_weather:"Get Weather",mcp_azure_mcp_search:"Azure MCP: Search",mcp_gitnexus_context:"GitNexus MCP: Context",mcp_gitnexus_cypher:"GitNexus MCP: Cypher",mcp_gitnexus_detect_changes:"GitNexus MCP: Detect Changes",mcp_gitnexus_impact:"GitNexus MCP: Impact",mcp_gitnexus_list_repos:"GitNexus MCP: List Repos",mcp_gitnexus_query:"GitNexus MCP: Query",slidev_getSlideContent:"Slidev: Get Slide Content",mcp__GitLab__get_mcp_server_version:"GitLab MCP: Get MCP Server Version",mcp__plugin_figma_figma__get_design_context:"Figma MCP: Get Design Context",mcp__plugin_figma_figma__get_metadata:"Figma MCP: Get Metadata",mcp__plugin_figma_figma__get_screenshot:"Figma MCP: Get Screenshot",mcp_io_github_tav_tavily_extract:"MCP Io GitHub Tavily Extract",mcp_io_github_tav_tavily_search:"MCP Io GitHub Tavily Search",browser_wait_for:"Browser Wait For",copilot_sessionStoreSql:"Copilot Session Store Sql",explore_subagent:"Explore Subagent","github.copilot.terminalPanel":"Github Copilot Terminal Panel",handle_dialog:"Handle Dialog",run_subagent:"Run Subagent",testFailure:"Test Failure","mcp_angular-cli_get_best_practices":"Angular MCP: Get Best Practices","mcp_angular-cli_list_projects":"Angular MCP: Get Project List",mcp_azure_mcp_extension_cli_generate:"Azure MCP (Local): Generate",mcp_playwright_browser_console_messages:"Playwright MCP: Browser Console Messages",mcp_com_figma_mcp_get_design_context:"Figma MCP (Local): Get Design Context",mcp_com_figma_mcp_get_screenshot:"Figma MCP (Local): Get Screenshot",mcp__Bicep__get_bicep_best_practices:"Bicep MCP: Get Bicep Best Practices","mcp__microsoft-docs-learn__microsoft_docs_fetch":"Microsoft Learn MCP: Microsoft Docs Fetch","mcp__microsoft-docs-learn__microsoft_docs_search":"Microsoft Learn MCP: Microsoft Docs Search",mcp__azure__subscription_list:"Azure MCP: Subscription List",mcp__bicep__get_bicep_file_diagnostics:"Bicep MCP: File Diagnostics",mcp__linear__authenticate:"Linear MCP: Authenticate",mcp__linear__get_issue:"Linear MCP: Get Issue",mcp__linear__list_issues:"Linear MCP: List Issues",mcp__linear__list_teams:"Linear MCP: List Teams",mcp__linear__save_issue:"Linear MCP: Save Issue",mcp_workiq_accept_eula:"WorkIQ Accept EULA",mcp_workiq_ask_work_iq:"WorkIQ Ask Work IQ","mcp_microsoft-lea_microsoft_code_sample_search":"Microsoft Docs MCP (Local): Search Code Sample","mcp_microsoft-lea_microsoft_docs_search":"Microsoft Docs MCP (Remote): Search Docs","mcp_upstash_conte_query-docs":"MCP Upstash: Query Docs","mcp_upstash_conte_resolve-library-id":"MCP Upstash: Resolve Library ID",mcp__Bicep__list_avm_metadata:"MCP  Bicep: List Azure Verified Module Metadata",google_research:"Google Research",task_execution:"Task Execution",tool_search_tool_regex:"Tool Search",FindDatabaseObjectsThat:"Find Database Objects That",GetTableColumnNames:"Get Table Column Names",SchemaStore_getSchema:"Schema Store Get Schema",SchemaStore_searchSchemas:"Schema Store Search Schemas",SearchSchemasForOnePartName:"Search Schemas For One Part Name",ValidateGeneratedTSQL:"Validate Generated T-SQL",aspire_execute_resource_command:"Aspire Execute Resource Command",aspire_get_doc:"Aspire Get Doc",aspire_list_console_logs:"Aspire List Console Logs",aspire_list_resources:"Aspire List Resources",aspire_list_structured_logs:"Aspire List Structured Logs",aspire_search_docs:"Aspire Search Docs",codesearch:"CodeSearch","context-engine_context_search":"Context Engine Context Search","context7_query-docs":"Context7 Query Docs","context7_resolve-library-id":"Context7 Resolve Library ID",playwright_browser_navigate:"Playwright Browser Navigate",run_tests:"Run Tests","azure-subscription_list":"Azure Subscription List",debugger_evaluate_expressions:"Debugger Evaluate Expressions",debugger_get_output_window_text:"Debugger Get Output Window Text",get_symbols:"Get Symbols",lookup_vs:"Lookup VS",search_web:"Search Web","aspire-get_doc":"Get Doc","aspire-search_docs":"Search Docs",vote_memory:"Vote Memory",create_issue:"Issue Create",save_workflow:"Workflow Save","context-mode_ctx_execute":"Context Mode: Execute","mcp_context-mode_ctx_batch_execute":"Context Mode: Batch Execute","mcp_context-mode_ctx_execute":"Context Mode: Execute","mcp_context-mode_ctx_search":"Context Mode: Search",mcp_github_issue_read:"GitHub MCP (Remote): Issue Read",mcp_github_search_repositories:"GitHub MCP (Remote): Search Repositories",mcp_io_github_tav_tavily_map:"Tavily MCP: Map","mcp_lean-ctx_ctx_call":"Lean Context: Call","mcp_lean-ctx_ctx_discover_tools":"Lean Context: Discover Tools","mcp_lean-ctx_ctx_edit":"Lean Context: Edit","mcp_lean-ctx_ctx_graph":"Lean Context: Graph","mcp_lean-ctx_ctx_knowledge":"Lean Context: Knowledge","mcp_lean-ctx_ctx_multi_read":"Lean Context: Multi Read","mcp_lean-ctx_ctx_overview":"Lean Context: Overview","mcp_lean-ctx_ctx_read":"Lean Context: Read","mcp_lean-ctx_ctx_search":"Lean Context: Search","mcp_lean-ctx_ctx_session":"Lean Context: Session","mcp_lean-ctx_ctx_shell":"Lean Context: Shell","mcp_lean-ctx_ctx_tree":"Lean Context: Tree","mcp_mcp-server-ti_get_current_time":"Time MCP: Get Current Time",mcp_playwright_browser_close:"Playwright MCP: Browser Close",mcp_playwright_browser_evaluate:"Playwright MCP: Browser Evaluate",mcp_playwright_browser_fill_form:"Playwright MCP: Browser Fill Form",mcp_playwright_browser_network_request:"Playwright MCP: Browser Network Request",mcp_playwright_browser_network_requests:"Playwright MCP: Browser Network Requests",mcp_playwright_browser_press_key:"Playwright MCP: Browser Press Key",mcp_playwright_browser_resize:"Playwright MCP: Browser Resize",mcp_playwright_browser_run_code_unsafe:"Playwright MCP: Browser Run Code Unsafe",mcp_playwright_browser_type:"Playwright MCP: Browser Type",mcp_playwright_browser_wait_for:"Playwright MCP: Browser Wait For",mcp_pylance_mcp_s_pylancePythonEnvironments:"Pylance MCP: Python Environments","mcp_spec-gen_get_architecture_overview":"Spec Gen MCP: Get Architecture Overview","mcp_spec-gen_get_call_graph":"Spec Gen MCP: Get Call Graph",mcp_specgen_analyze_codebase:"Spec Gen MCP: Analyze Codebase",mcp_specgen_get_function_body:"Spec Gen MCP: Get Function Body",mcp_specgen_get_spec:"Spec Gen MCP: Get Spec",mcp_specgen_list_spec_domains:"Spec Gen MCP: List Spec Domains",mcp_specgen_orient:"Spec Gen MCP: Orient",mcp_specgen_search_code:"Spec Gen MCP: Search Code",mcp_specgen_search_specs:"Spec Gen MCP: Search Specs",mcp_stitch_apply_design_system:"Stitch: Apply Design System",mcp_stitch_create_design_system:"Stitch: Create Design System",mcp_stitch_create_project:"Stitch: Create Project",mcp_stitch_edit_screens:"Stitch: Edit Screens",mcp_stitch_generate_screen_from_text:"Stitch: Generate Screen From Text",mcp_stitch_get_project:"Stitch: Get Project",mcp_stitch_get_screen:"Stitch: Get Screen",mcp_stitch_list_design_systems:"Stitch: List Design Systems",mcp_stitch_list_projects:"Stitch: List Projects",mcp_stitch_list_screens:"Stitch: List Screens",mcp_symdex_build_context_pack:"Symdex: Build Context Pack",mcp_symdex_get_callees:"Symdex: Get Callees",mcp_symdex_get_callers:"Symdex: Get Callers",mcp_symdex_get_file_outline:"Symdex: Get File Outline",mcp_symdex_get_file_tree:"Symdex: Get File Tree",mcp_symdex_get_graph_diagram:"Symdex: Get Graph Diagram",mcp_symdex_get_index_status:"Symdex: Get Index Status",mcp_symdex_get_repo_outline:"Symdex: Get Repo Outline",mcp_symdex_get_repo_stats:"Symdex: Get Repo Stats",mcp_symdex_index_folder:"Symdex: Index Folder",mcp_symdex_list_repos:"Symdex: List Repos",mcp_symdex_search_routes:"Symdex: Search Routes",mcp_symdex_search_symbols:"Symdex: Search Symbols",mcp_symdex_search_text:"Symdex: Search Text",mcp_tavily_tavily_crawl:"Tavily: Crawl",mcp_tavily_tavily_extract:"Tavily: Extract",mcp_tavily_tavily_search:"Tavily: Search",mcp_time_get_current_time:"Time: Get Current Time",mcp_trueline_trueline_outline:"Trueline: Outline",mcp_trueline_trueline_read:"Trueline: Read",mcp_trueline_trueline_search:"Trueline: Search",mcp_zettelkasten_zk_create_link:"Zettelkasten: Create Link",mcp_zettelkasten_zk_create_note:"Zettelkasten: Create Note",mcp_zettelkasten_zk_get_note:"Zettelkasten: Get Note",mcp_zettelkasten_zk_remove_link:"Zettelkasten: Remove Link",mcp_zettelkasten_zk_search_notes:"Zettelkasten: Search Notes",mcp_zettelkasten_zk_update_note:"Zettelkasten: Update Note",copilot_listCodeUsages:"Copilot: List Code Usages",create_new_file:"Windsurf: File Create",edit_existing_file:"Windsurf: File Edit","github.copilot.editingSession":"GitHub MCP (Local): Assign Copilot to Issue",mssql_connect:"SQL Server Connection",mssql_disconnect:"SQL Server Disconnection",mssql_list_tables:"SQL Server Tables List",mssql_run_query:"SQL Server Query Execution",run_terminal_command:"Terminal Command Run",single_find_and_replace:"Find and Replace",mcp_io_github_git_add_comment_to_pending_review:"GitHub MCP (Local): Add Comment To Pending Review",mcp_io_github_git_add_reply_to_pull_request_comment:"GitHub MCP (Local): Add Reply To Pull Request Comment",mcp_io_github_git_pull_request_review_write:"GitHub MCP (Local): Pull Request Review Write",mcp_aikido_aikido_full_scan:"Aikido MCP: Full Scan",mcp_aikido_aikido_issues_list:"Aikido MCP: Issues List",mcp_com_atlassian_addCommentToJiraIssue:"Atlassian MCP: Add Comment To Jira Issue",mcp_com_atlassian_atlassianUserInfo:"Atlassian MCP: User Info",mcp_com_atlassian_createConfluencePage:"Atlassian MCP: Create Confluence Page",mcp_com_atlassian_getAccessibleAtlassianResources:"Atlassian MCP: Get Accessible Atlassian Resources",mcp_com_atlassian_getConfluencePage:"Atlassian MCP: Get Confluence Page",mcp_com_atlassian_getConfluencePageFooterComments:"Atlassian MCP: Get Confluence Page Footer Comments",mcp_com_atlassian_getConfluenceSpaces:"Atlassian MCP: Get Confluence Spaces",mcp_com_atlassian_getJiraIssue:"Atlassian MCP: Get Jira Issue",mcp_com_atlassian_search:"Atlassian MCP: Search",mcp_com_atlassian_searchJiraIssuesUsingJql:"Atlassian MCP: Search Jira Issues Using JQL",mcp_com_atlassian_updateConfluencePage:"Atlassian MCP: Update Confluence Page",mcp_sonarqube_analyze_code_snippet:"SonarQube MCP: Analyze Code Snippet",mcp_sonarqube_get_project_quality_gate_status:"SonarQube MCP: Get Project Quality Gate Status",mcp_sonarqube_search_my_sonarqube_projects:"SonarQube MCP: Search My SonarQube Projects",mcp_sonarqube_search_security_hotspots:"SonarQube MCP: Search Security Hotspots",mcp_sonarqube_search_sonar_issues_in_projects:"SonarQube MCP: Search Sonar Issues In Projects",sonarqube_analyze_file:"SonarQube: Analyze File","azure-bicepschema":"Azure Bicep Schema","azure-documentation":"Azure Documentation","azure-extension_cli_generate":"Azure Extension CLI Generate","azure-get_azure_bestpractices":"Get Azure Best Practices",__auto_compact__:"Auto Compact",mcp_github_get_teams:"GitHub MCP (Remote): Get Teams",mcp_github_list_issue_types:"GitHub MCP (Remote): List Issue Types",mcp_github_mcp_se_issue_write:"GitHub MCP (Remote): Write Issue",mcp_github_mcp_se_list_issues:"GitHub MCP (Remote): List Issues",mcp_github_mcp_se_list_label:"GitHub MCP (Remote): List Labels",mcp_github_mcp_se_search_issues:"GitHub MCP (Remote): Search Issues",mcp_github_search_users:"GitHub MCP (Remote): Search Users",mcp_github_semantic_issue_similarity_search:"GitHub MCP (Remote): Semantic Issue Similarity Search",codebase:"Codebase",invoke_subagent:"Invoke Subagent",list_permissions:"List Permissions",manage_task:"Manage Task",mcp__ccd_session__mark_chapter:"CCD Session: Mark Chapter",multi_replace_file_content:"Multi-Replace File Content",read_currently_open_file:"Read Currently Open File",replace_file_content:"Replace File Content",run_command:"Run Command",schedule:"Schedule",send_message:"Send Message",view_file:"View File",write_to_file:"Write To File",glob_search:"Glob Search","azure-devops_core_list_projects":"Azure DevOps Core List Projects","azure-devops_repo_get_file_content":"Azure DevOps Repo Get File Content","azure-devops_repo_list_repos_by_project":"Azure DevOps Repo List Repos By Project","azure-devops_search_code":"Azure DevOps Search Code","azure-devops_wit_get_work_item":"Azure DevOps Wit Get Work Item","azure-devops_wit_query_by_wiql":"Azure DevOps Wit Query By WIQL",mcp_microsoft_azu_wit_get_work_items_batch_by_ids:"Microsoft Azure DevOps MCP (Local): Get Work Items Batch by IDs",mcp_microsoft_azu_wit_get_work_items_for_iteration:"Microsoft Azure DevOps MCP (Local): Get Work Items for Iteration",mcp_microsoft_azu_wit_update_work_items_batch:"Microsoft Azure DevOps MCP (Local): Update Work Items Batch",mcp_microsoft_azu_wit_work_items_link:"Microsoft Azure DevOps MCP (Local): Link Work Items",mcp_microsoft_azu_work_list_iterations:"Microsoft Azure DevOps MCP (Local): List Iterations","microsoft_azure-devops-mcp_core_list_projects":"Azure DevOps Core List Projects","microsoft_azure-devops-mcp_search_workitem":"Azure DevOps Search Work Item","microsoft_azure-devops-mcp_wit_get_work_item":"Microsoft Azure DevOps MCP (Local): Get Work Item",mcp_com_microsoft_get_azure_bestpractices:"Microsoft Docs MCP: Get Azure Best Practices",mcp_github_enterp_create_branch:"GitHub MCP (Remote): Create Branch",mcp_github_enterp_get_latest_release:"GitHub MCP (Remote): Get Latest Release",mcp_github_enterp_pull_request_read:"GitHub MCP (Remote): Pull Request Read",handoff:"Handoff",mcp_ado_search_workitem:"ADO Search Workitem",mcp_ado_wit_add_artifact_link:"ADO Wit Add Artifact Link",mcp_ado_wit_add_child_work_items:"ADO Wit Add Child Work Items",mcp_ado_wit_add_work_item_comment:"ADO Wit Add Work Item Comment",mcp_ado_wit_create_work_item:"ADO Wit Create Work Item",mcp_ado_wit_get_work_item:"ADO Wit Get Work Item",mcp_ado_wit_get_work_item_type:"MCP Ado Wit Get Work Item Type",mcp_ado_wit_get_work_items_batch_by_ids:"MCP Ado Wit Get Work Items Batch By Ids",mcp_ado_wit_list_work_item_comments:"ADO Wit List Work Item Comments",mcp_ado_wit_my_work_items:"ADO Wit My Work Items",mcp_ado_wit_update_work_item:"ADO Wit Update Work Item",mcp_ado_wit_update_work_items_batch:"ADO Wit Update Work Items Batch",mcp_ado_wit_work_item_unlink:"ADO Wit Work Item Unlink",mcp_ado_wit_work_items_link:"ADO Wit Work Items Link",mcp_azure_devops__search_workitem:"Azure DevOps Search Workitem",mcp_github_add_issue_comment:"GitHub Add Issue Comment",mcp_github_create_branch:"GitHub Create Branch",mcp_github_list_commits:"GitHub List Commits",mcp_github_list_pull_requests:"GitHub List Pull Requests",mcp_github_push_files:"GitHub Push Files","mcp_hashline-edit_grep":"Hashline Edit Grep",mcp_raindrop_create_bookmarks:"RainDrop Create Bookmarks","mcp_symdex-mcp_semantic_search":"Symdex MCP Semantic Search","mcp_tavily-global_tavily-search":"Tavily Global Tavily-Search","mcp_tavily_tavily-extract":"Tavily Tavily-Extract","mcp_tavily_tavily-search":"Tavily Tavily-Search",mcp_tavily_tavily_research:"Tavily Tavily-Research",session_store_sql:"SQL Session Store","azure-advisor":"Azure Advisor","azure-devops-core_list_projects":"Azure DevOps Core List Projects","azure-devops-wit_work_item":"Azure DevOps Work Item","azure-devops-wit_work_item_write":"Azure DevOps Work Item Write","azure-group_resource_list":"Azure Group Resource List","azure-sql":"Azure SQL",ScheduleWakeup:"Scheduled Wakeup",mcp__ccd_session__spawn_task:"Spawn Task",mcp_figma_mcp_ser_get_design_context:"Figma MCP (Local): Get Design Context",mcp_figma_mcp_ser_get_libraries:"Figma MCP (Local): Get Libraries",mcp_figma_mcp_ser_get_metadata:"Figma MCP (Local): Get Metadata",mcp_figma_mcp_ser_search_design_system:"Figma MCP (Local): Search Design System","azure-devops-repo_file":"Azure DevOps: File","azure-devops-repo_pull_request":"Azure DevOps: Pull Request","azure-devops-repo_repository":"Azure DevOps: Repository","azure-devops-search_code":"Azure DevOps: Search Code","azure-devops-search_workitem":"Azure DevOps: Work Item","azure-devops-wiki":"Azure DevOps: Wiki","azure-devops-wiki_upsert_page":"Azure DevOps: Wiki Upsert Page","azure-devops-wit_work_item_comment_write":"Azure DevOps: Work Item Comment Write",invoke_canvas_action:"Canvas Action",list_canvas_capabilities:"List Canvas Capabilities",open_canvas:"Open Canvas",subagent:"Subagent",workiq_search_files:"WorkIQ Search Files",workiq_get_email:"Workiq Get Email",workiq_list_emails:"Workiq List Emails"};var Xa=["read_file","copilot_readFile","read","view","view_image","copilot_viewImage","list_dir","list_directory","ls","copilot_listDirectory","find_files","file_search","file_glob_search","copilot_findFiles","opilot_findFiles","copilot_findTextInFiles","copilot_findTestFiles","test_search","grep_search","grep","glob","rg","semantic_search","copilot_searchCodebase","code_search","copilot_getSearchResults","copilot_githubTextSearch","get_search_view_results","search_workspace_symbols","copilot_searchWorkspaceSymbols","vscode_listCodeUsages","get_symbols_by_name","get_errors","copilot_getErrors","get_changed_files","copilot_getChangedFiles","read_project_structure","copilot_readProjectStructure","get_doc_info","copilot_getDocInfo","get_vscode_api","copilot_getVSCodeAPI","get_project_setup_info","copilot_getProjectSetupInfo","get_files_in_project","get_projects_in_solution","get_python_executable_details","get_currentfile","get_file","vscode_get_confirmation","vscode_get_confirmation_with_options","vscode_get_terminal_confirmation","vscode_get_modified_files_confirmation","memory","copilot_memory","copilot_resolveMemoryFileUri","detect_memories","todo","tool_replay","copilot_toolReplay","tool_search","get_task_output","get_output_window_logs","job_output","get_terminal_output","await_terminal","terminal_selection","terminal_last_command","read_notebook_cell_output","copilot_readNotebookCellOutput","copilot_getNotebookSummary","test_failure","copilot_testFailure","ask_questions","AskUserQuestion","ask_user_question","copilot_askQuestions","switch_agent","copilot_switchAgent","bash","vscode_editFile_internal","vscode_fetchWebPage_internal","vscode_searchExtensions_internal","fetch_copilot_cli_documentation","generate_findings","generate_topics","list_bash","read_bash","write_bash","stop_bash","list_powershell","read_powershell","clarify_requirements","get_tests","ide-get_diagnostics","plan","signal_plan_ready","update_plan_progress","EnterPlanMode","ExitPlanMode","stop_agent","mcp_reload","mcp_validate","add_loaded_assembly","analyze_symbol","search_decompiled_symbols","search_web"];var Ja=/^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;function Ym(o){return o.replace(/_/g," ").replace(/\b\w/g,e=>e.toUpperCase())}function Za(o){let e=Ja.exec(o);if(e)return`Claude MCP: M365 Connector - ${Ym(e[1])}`}function Ka(o){return Ja.test(o)}function nt(o,e){let t=e?` title="${C(e)}"`:"",i="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;";return o==="\u2705"?`<span style="${i}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${t} aria-label="${C(e??"Present and fresh")}">\u2713</span>`:o==="\u26A0\uFE0F"?`<span style="${i}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${t} aria-label="${C(e??"Present but stale")}">!</span>`:`<span style="${i}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${t} aria-label="${C(e??"Missing")}">\u2715</span>`}var ae=acquireVsCodeApi(),It=qa("__INITIAL_USAGE__"),at=null,Ci=new Map,Ne=null,_o=!1,xi=!1,wm=[],ke="activity",Xs=null,Fa=[];function km(){Xs!==null&&(clearTimeout(Xs),Xs=null)}function Oa(){let o=document.createElement("button");return o.textContent="\u{1F504} Refresh",o.style.cssText="padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;",o.addEventListener("click",()=>ae.postMessage({command:"refresh"})),o}function Sm(o){let e=document.getElementById("root");if(!e)return;let t=document.createElement("div");t.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let i=document.createElement("div");i.style.cssText="font-size: 24px; margin-bottom: 12px;",i.innerHTML=nt("\u274C","Error");let s=document.createElement("div");s.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",s.textContent=o,t.append(i,s,Oa()),e.textContent="",e.append(t)}var Ea=!1,gi=null,Da=!1,bi=null,fg={xhigh:"Extra High"};function gg(o){return fg[o]??o}var vi=Ya||null,bg=new Set(Xa.map(o=>o.toLowerCase()));function Pm(o){return vi?vi[o]??vi[o.toLowerCase()]??Za(o)??o:o}function Ia(o){let e=Pm(o),t=e.indexOf(":");return t!==-1?e.substring(t+1).trim():e}function vg(o){let e=new Set;Object.entries(o.today.mcpTools.byTool).forEach(([i])=>e.add(i)),Object.entries(o.last30Days.mcpTools.byTool).forEach(([i])=>e.add(i)),Object.entries(o.month.mcpTools.byTool).forEach(([i])=>e.add(i)),Object.entries(o.today.toolCalls.byTool).forEach(([i])=>e.add(i)),Object.entries(o.last30Days.toolCalls.byTool).forEach(([i])=>e.add(i)),Object.entries(o.month.toolCalls.byTool).forEach(([i])=>e.add(i));let t=new Set(o.suppressedUnknownTools??[]);return Array.from(e).filter(i=>!vi?.[i]&&!vi?.[i.toLowerCase()]&&!Ka(i)&&!t.has(i)).sort()}function yg(o){let e="https://github.com/rajbos/ai-engineering-fluency",t=encodeURIComponent("Add missing friendly names for tools"),i=o.map(n=>`- \`${n}\``).join(`
`),s=encodeURIComponent(`## Unknown Tools Found

The following tools were detected but don't have friendly display names:

${i}

Please add friendly names for these tools to improve the user experience.`),r=encodeURIComponent("MCP Toolnames");return`${e}/issues/new?title=${t}&body=${s}&labels=${r}`}var xg=[{label:"\u{1F4AC} Ask Mode",key:"ask",gradient:"linear-gradient(90deg, #3b82f6, #60a5fa)"},{label:"\u270F\uFE0F Edit Mode",key:"edit",gradient:"linear-gradient(90deg, #10b981, #34d399)"},{label:"\u{1F916} Agent Mode",key:"agent",gradient:"linear-gradient(90deg, #7c3aed, #a855f7)"},{label:"\u{1F4CB} Plan Mode",key:"plan",gradient:"linear-gradient(90deg, #f59e0b, #fbbf24)"},{label:"\u26A1 Custom Agent",key:"customAgent",gradient:"linear-gradient(90deg, #ec4899, #f472b6)"},{label:"\u{1F5A5}\uFE0F CLI",key:"cli",gradient:"linear-gradient(90deg, #06b6d4, #22d3ee)"}];function Cg(o,e,t,i){let s=t>0?e/t*100:0;return`
<div class="bar-item">
<div class="bar-label"><span>${o}</span><span><strong>${B(e)}</strong> (${oo(s,0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${s.toFixed(1)}%; background: ${i};"></div></div>
</div>`}function xm(o,e){let t=o.ask+o.edit+o.agent+o.plan+o.customAgent+o.cli,i=xg.map(({label:s,key:r,gradient:n})=>Cg(s,o[r],t,n)).join("");return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${e}</h4>
<div class="bar-chart">${i}
</div>
</div>`}function Ra(o,e,t,i,s,r){return`
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${o}</h4>
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${er(e.averageModelsPerSession,1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${oo(e.switchingFrequency,0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${B(e.maxModelsPerSession||0)}</div>
</div>
</div>
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
<div style="min-height: 110px;">
${t.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">\u{1F49A} Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${t.map(C).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${i.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${i.map(C).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${s.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${s.map(C).join(", ")}</span>
</div>
`:'<div style="margin-bottom: 6px; height: 21px;"></div>'}
${r.length>0?`
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">\u2753 Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${r.map(C).join(", ")}</span>
</div>
`:""}
</div>
${e.totalRequests>0?`
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${e.lowCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">\u{1F49A} Low cost: </span>
<span style="color: var(--text-primary);">${B(e.lowCostRequests)} (${oo(e.lowCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.mediumCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F7E1} Medium cost: </span>
<span style="color: var(--text-primary);">${B(e.mediumCostRequests)} (${oo(e.mediumCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.highCostRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u{1F4B8} High cost: </span>
<span style="color: var(--text-primary);">${B(e.highCostRequests)} (${oo(e.highCostRequests/e.totalRequests*100)})</span>
</div>
`:""}
${e.unknownRequests>0?`
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${B(e.unknownRequests)} (${oo(e.unknownRequests/e.totalRequests*100)})</span>
</div>
`:""}
</div>
`:""}
${e.mixedCostSessions>0?`
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed cost sessions: ${B(e.mixedCostSessions)}</span>
</div>
`:""}
</div>
</div>`}function Cm(o,e,t,i,s){let r=document.querySelector(o);if(!r)return;let n=s>0?Math.round(i/s*100):0,l=`${t} ${i}/${s} repos (${n}%)`,p=r.querySelector(`.${e}`);if(p)p.textContent=l;else{Array.from(r.children).forEach(u=>{let f=u;!f.classList.contains("section-title")&&!f.classList.contains("section-subtitle")&&f.remove()});let h=document.createElement("div");h.className=e,h.style.cssText="margin-top:8px; font-size:12px; color:var(--text-secondary);",h.textContent=l,r.appendChild(h)}}function _g(o){let e=o.missedPotential||It?.missedPotential||[];return e.length===0?`
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${nt("\u2705")} No other AI tool configs missing a Copilot counterpart
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
                ${nt("\u26A0\uFE0F")} Missed Potential: Non-Copilot Instruction Files
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
                        ${e.map(t=>`
                            <tr style="background: rgba(251, 191, 36, 0.05);">
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); font-family: 'Courier New', monospace; font-size: 12px;">
                                    ${C(t.workspaceName)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${B(t.sessionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${B(t.interactionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        ${t.nonCopilotFiles.map(i=>`
                                            <div style="font-size: 11px; display: flex; align-items: center; gap: 6px;">
                                                <span>${C(i.icon||"\u{1F4C4}")}</span>
                                                <span style="font-weight: 500;">${C(i.label||"")}:</span>
                                                <span style="font-family: monospace; color: var(--text-muted);">${C(i.relativePath)}</span>
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
    `}function Rt(o,e=10,t=Pm){let i=Object.entries(o).sort(([,r],[,n])=>n-r).slice(0,e);return i.length===0?'<div style="color: var(--text-muted);">No tools used yet</div>':`
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${i.map(([r,n],l)=>{let p=C(t(r)),h=C(r),u=bg.has(r.toLowerCase())?'<span class="auto-badge" title="Automatic tool \u2014 Copilot uses this internally and it does not count toward fluency scoring">auto</span>':"";return`
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${l+1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${h}">${p}</strong>${u}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${B(n)}</td>
		    </tr>`}).join("")}
			</tbody>
		</table>`}var qo="interactions",yi="desc",$m=[],za=!0;function rt(o){return qo!==o?"":yi==="desc"?" \u25BC":" \u25B2"}function wg(o){return[...o].sort((e,t)=>{let i=0;switch(qo){case"title":i=(e.title||"").localeCompare(t.title||"");break;case"editor":i=(e.editor||"").localeCompare(t.editor||"");break;case"lastActivity":i=(e.lastActivity||"").localeCompare(t.lastActivity||"");break;default:i=e[qo]-t[qo];break}return yi==="desc"?-i:i})}function kg(o){return $m=o,!o||o.length===0?'<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No sessions recorded today yet.</div>':`<div id="sessions-table-container">${Tm(o)}</div>`}function Tm(o){let t=wg(o).map((i,s)=>{let r=C(i.title||"Untitled session"),n=C(i.filePath||""),l=i.models.map(f=>C(Wa(f))).join(", ")||"\u2014",p=C(i.editor||"unknown"),h=i.estimatedCost>0?`$${i.estimatedCost.toFixed(4)}`:"\u2014",u=i.lastActivity?new Date(i.lastActivity).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!za}):"\u2014";return`<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${s+1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${r}&quot;"><a href="#" class="session-title-link" data-file="${n}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${r}</a></td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.interactions)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.toolCalls)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.inputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.outputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.thinkingTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.cachedTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${B(i.totalTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${h}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px;">${p}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l}">${l}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; white-space:nowrap; text-align:right;">${u}</td>
		</tr>`}).join("");return`
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${rt("title")}</th>
					<th class="sortable" data-sort="interactions" style="padding:6px 8px; text-align:right;">Turns${rt("interactions")}</th>
					<th class="sortable" data-sort="toolCalls" style="padding:6px 8px; text-align:right;">Tools${rt("toolCalls")}</th>
					<th class="sortable" data-sort="inputTokens" style="padding:6px 8px; text-align:right;">Input${rt("inputTokens")}</th>
					<th class="sortable" data-sort="outputTokens" style="padding:6px 8px; text-align:right;">Output${rt("outputTokens")}</th>
					<th class="sortable" data-sort="thinkingTokens" style="padding:6px 8px; text-align:right;">Thinking${rt("thinkingTokens")}</th>
					<th class="sortable" data-sort="cachedTokens" style="padding:6px 8px; text-align:right;">Cached${rt("cachedTokens")}</th>
					<th class="sortable" data-sort="totalTokens" style="padding:6px 8px; text-align:right;">Total${rt("totalTokens")}</th>
					<th class="sortable" data-sort="estimatedCost" style="padding:6px 8px; text-align:right;">Cost${rt("estimatedCost")}</th>
					<th class="sortable" data-sort="editor" style="padding:6px 8px;">Editor${rt("editor")}</th>
					<th style="padding:6px 8px;">Models</th>
					<th class="sortable" data-sort="lastActivity" style="padding:6px 8px; text-align:right;">Last Active${rt("lastActivity")}</th>
				</tr>
			</thead>
			<tbody>
				${t}
			</tbody>
		</table>
		</div>`}function Mm(){let o=document.getElementById("sessions-table-container");o&&o.addEventListener("click",e=>{let t=e.target.closest("a.session-title-link");if(t){e.preventDefault();let r=t.getAttribute("data-file");r&&ae.postMessage({command:"openSessionFile",file:r});return}let i=e.target.closest("th.sortable");if(!i)return;let s=i.getAttribute("data-sort");s&&(qo===s?yi=yi==="desc"?"asc":"desc":(qo=s,yi="desc"),o.innerHTML=Tm($m))})}function At(o,e){let t={...o};for(let i of e)i in t||(t[i]=0);return t}function Y(o){let e=Number(o);return Number.isFinite(e)?e:0}function Sg(o){let e=o&&typeof o=="object"?o:{};return{ask:Y(e.ask),edit:Y(e.edit),agent:Y(e.agent),plan:Y(e.plan),customAgent:Y(e.customAgent),cli:Y(e.cli)}}function Pg(o){let e=o&&typeof o=="object"?o:{};return{file:Y(e.file),selection:Y(e.selection),implicitSelection:Y(e.implicitSelection),symbol:Y(e.symbol),codebase:Y(e.codebase),workspace:Y(e.workspace),terminal:Y(e.terminal),vscode:Y(e.vscode),terminalLastCommand:Y(e.terminalLastCommand),terminalSelection:Y(e.terminalSelection),clipboard:Y(e.clipboard),changes:Y(e.changes),outputPanel:Y(e.outputPanel),problemsPanel:Y(e.problemsPanel),pullRequest:Y(e.pullRequest),byKind:e.byKind??{},copilotInstructions:Y(e.copilotInstructions),agentsMd:Y(e.agentsMd),byPath:e.byPath??{}}}function Qs(o){let e=o&&typeof o=="object"?o:{},t=e.toolCalls&&typeof e.toolCalls=="object"?e.toolCalls:{},i=e.mcpTools&&typeof e.mcpTools=="object"?e.mcpTools:{};return{sessions:Y(e.sessions),modeUsage:Sg(e.modeUsage),contextReferences:Pg(e.contextReferences),toolCalls:{total:Y(t.total),byTool:t.byTool??{}},mcpTools:{total:Y(i.total),byServer:i.byServer??{},byTool:i.byTool??{}},modelSwitching:{modelsPerSession:[],totalSessions:0,averageModelsPerSession:0,maxModelsPerSession:0,minModelsPerSession:0,switchingFrequency:0,standardModels:[],premiumModels:[],unknownModels:[],mixedTierSessions:0,lowCostModels:[],mediumCostModels:[],highCostModels:[],mixedCostSessions:0,standardRequests:0,premiumRequests:0,lowCostRequests:0,mediumCostRequests:0,highCostRequests:0,unknownRequests:0,totalRequests:0,...e.modelSwitching??{}},thinkingEffortUsage:e.thinkingEffortUsage}}function Im(o){return o.filter(e=>e&&typeof e=="object"&&typeof e.id=="string").map(e=>({id:String(e.id),category:typeof e.category=="string"?e.category:"general",severity:["tip","opportunity","celebration"].includes(e.severity)?e.severity:"tip",title:typeof e.title=="string"?e.title:"",body:typeof e.body=="string"?e.body:"",actionLabel:typeof e.actionLabel=="string"?e.actionLabel:void 0,actionCommand:typeof e.actionCommand=="string"?e.actionCommand:void 0,status:["new","seen","dismissed","snoozed","done"].includes(e.status)?e.status:"new",allowToast:!!e.allowToast}))}function $g(o){if(!o||typeof o!="object")return null;try{let e={today:Qs(o.today),last30Days:Qs(o.last30Days),month:Qs(o.month),lastMonth:Qs(o.lastMonth),lastUpdated:typeof o.lastUpdated=="string"?o.lastUpdated:"",backendConfigured:!!o.backendConfigured,locale:typeof o.locale=="string"?o.locale:void 0,currentWorkspacePaths:Array.isArray(o.currentWorkspacePaths)?o.currentWorkspacePaths.filter(i=>typeof i=="string"):void 0,suppressedUnknownTools:Array.isArray(o.suppressedUnknownTools)?o.suppressedUnknownTools.filter(i=>typeof i=="string"):void 0},t=Qa(o.customizationMatrix);return t&&(e.customizationMatrix=t),Array.isArray(o.missedPotential)&&(e.missedPotential=o.missedPotential.filter(i=>i&&typeof i=="object"&&typeof i.workspacePath=="string")),Array.isArray(o.todaySessions)&&(e.todaySessions=o.todaySessions.filter(i=>i&&typeof i=="object"&&typeof i.interactions=="number")),Array.isArray(o.insights)&&(e.insights=Im(o.insights)),e}catch{return null}}function Tg(){let o=document.querySelectorAll(".tab-button");o.forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-tab");if(!t)return;ke=t,o.forEach(s=>s.classList.toggle("active",s.getAttribute("data-tab")===t)),document.querySelectorAll(".tab-panel").forEach(s=>{s.style.display="none"});let i=document.getElementById(`tab-panel-${t}`);i&&(i.style.display="block"),t==="repos"&&!Ea&&(Ea=!0,ae.postMessage({command:"loadRepoPrStats"})),t==="agent"&&!Da&&(Da=!0,ae.postMessage({command:"loadAgentSessions"})),t==="insights"&&Fa.filter(s=>s.status==="new").forEach(s=>ae.postMessage({command:"insightAction",id:s.id,action:"seen"}))})})}function Je(o){let e=Number(o);return Number.isFinite(e)&&e>=0?e:0}function La(o){let e=typeof o=="string"?o.trim():"";try{let t=new URL(e);if(t.protocol==="http:"||t.protocol==="https:")return t.toString()}catch{}return"#"}function Mg(o){let e=o&&typeof o=="object"?o:{},t=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"||typeof e.since=="number"?e.since:Date.now(),repos:t.map(i=>{let s=i&&typeof i=="object"?i:{},r=Array.isArray(s.aiDetails)?s.aiDetails:[];return{repoUrl:La(s.repoUrl),owner:C(typeof s.owner=="string"?s.owner:""),repo:C(typeof s.repo=="string"?s.repo:""),error:typeof s.error=="string"?C(s.error):"",totalPrs:Je(s.totalPrs),aiAuthoredPrs:Je(s.aiAuthoredPrs),aiReviewRequestedPrs:Je(s.aiReviewRequestedPrs),aiDetails:r.map(n=>{let l=n&&typeof n=="object"?n:{},p=["copilot","claude","openai","other-ai"],h=["author","reviewer-requested"],u=p.includes(l.aiType)?l.aiType:"other-ai",f=h.includes(l.role)?l.role:"author";return{number:Je(l.number),title:C(typeof l.title=="string"?l.title:""),url:La(l.url),aiType:u,role:f}})}})}}function Ig(o){let e=C(new Date(o.since).toLocaleDateString());if(!o.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;if(o.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let t={copilot:"\u{1F916} Copilot",claude:"\u{1F9E0} Claude",openai:"\u2728 Codex","other-ai":"\u{1F916} AI"},i="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",s=`${i} text-align: center;`,r=o.repos.map(n=>{let l=`<a href="${C(n.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${C(n.owner)}/${C(n.repo)}</a>`;if(n.error)return`<tr>
				<td style="${i} font-family:'Courier New',monospace; font-size:12px;">${l}</td>
				<td colspan="3" style="${i} color:var(--text-secondary); font-style:italic; font-size:12px;">${C(n.error)}</td>
			</tr>`;let p="";if(n.aiDetails.length>0){let h=n.aiDetails.map(u=>`<li><a href="${C(u.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${u.number} ${C(u.title)}</a> \u2014 ${t[u.aiType]??C(String(u.aiType))} (${u.role==="author"?"authored":"review requested"})</li>`).join("");p=`
				<details style="margin-top:4px; font-size:11px;">
					<summary style="cursor:pointer; color:var(--text-secondary);">Show ${n.aiDetails.length} detail(s)</summary>
					<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${h}</ul>
				</details>`}return`<tr>
			<td style="${i} font-family:'Courier New',monospace; font-size:12px;">${l}${p}</td>
			<td style="${s} font-weight:600;">${n.totalPrs}</td>
			<td style="${s}">${n.aiAuthoredPrs>0?`<span style="font-weight:600;">${n.aiAuthoredPrs}</span>`:"0"}</td>
			<td style="${s}">${n.aiReviewRequestedPrs>0?`<span style="font-weight:600;">${n.aiReviewRequestedPrs}</span>`:"0"}</td>
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
		</div>`}function Rg(o){let e=o&&typeof o=="object"?o:{},t=Array.isArray(e.repos)?e.repos:[];return{authenticated:!!e.authenticated,since:typeof e.since=="string"?C(e.since):new Date(Date.now()-720*60*60*1e3).toISOString(),fetchedAt:typeof e.fetchedAt=="string"?e.fetchedAt:"",totalTasks:Je(e.totalTasks),totalSessions:Je(e.totalSessions),totalCredits:Je(e.totalCredits),repos:t.map(i=>{let s=i&&typeof i=="object"?i:{},r=C(typeof s.owner=="string"?s.owner:""),n=C(typeof s.repo=="string"?s.repo:"");return{owner:r,repo:n,repoUrl:La(`https://github.com/${r}/${n}`),totalTasks:Je(s.totalTasks),totalSessions:Je(s.totalSessions),totalCredits:Je(s.totalCredits),tasksScanned:Je(s.tasksScanned),tasksTotal:Je(s.tasksTotal),partial:!!s.partial,error:typeof s.error=="string"?C(s.error):void 0}})}}function Rm(o){let e=document.querySelector("#repos-pr-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${Ig(o)}
	`)}function Ag(o,e,t){return o.repos.map(i=>{let s=`<a href="${i.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${i.owner}/${i.repo}</a>`;if(i.error)return`<tr>
        <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${s}</td>
        <td colspan="3" style="${e} color:var(--text-secondary); font-style:italic; font-size:12px;">${i.error}</td>
      </tr>`;let r=i.partial?` <span title="Showing ${i.tasksScanned} of ${i.tasksTotal} tasks \u2014 capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${i.tasksScanned}/${i.tasksTotal} tasks scanned)</span>`:"";return`<tr>
      <td style="${e} font-family:'Courier New',monospace; font-size:12px;">${s}${r}</td>
      <td style="${t} font-weight:600;">${i.totalTasks}</td>
      <td style="${t} font-weight:600;">${i.totalSessions}</td>
      <td style="${t}">${i.totalCredits>0?i.totalCredits.toFixed(1):"\u2014"}</td>
    </tr>`}).join("")}function Eg(o){if(!o.authenticated)return`
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>\u{1F512} GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;if(o.repos.length===0)return`
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;let e=new Date(o.since).toLocaleDateString(),t="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);",i=`${t} text-align: center;`,s=o.repos.reduce((l,p)=>(p.error||(l.tasks+=p.totalTasks,l.sessions+=p.totalSessions,l.credits+=p.totalCredits),l),{tasks:0,sessions:0,credits:0}),r=o.repos.some(l=>l.partial&&!l.error),n=Ag(o,t,i);return`
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
				<tbody>${n}</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			\u2139\uFE0F <strong>No double-counting:</strong> These are cloud agent sessions only. CLI/remote sessions and local IDE chat sessions (shown in "My Activity") are excluded.<br/>
			\u2139\uFE0F <strong>Action minutes</strong> (GitHub Actions compute used by the agent) are not shown here \u2014 they require additional per-branch API calls.
		</div>`}function Am(o){let e=document.querySelector("#agent-sessions-content");e&&(e.innerHTML=`
		<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> \u2014 they are separate from these cloud agent sessions.
		</div>
		${Eg(o)}
	`)}function Dg(o){if(!o||!o.workspaces||o.workspaces.length===0)return`
			<div class="section">
				<div class="section-title"><span>\u{1F6E0}\uFE0F</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;let e=o.workspaces.map(t=>{let i=t.typeStatuses??{},s=Object.values(i).every(n=>n==="\u274C"),r=(o.customizationTypes??[]).map(n=>{let l=i[n.id]||"\u2753";return`
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${nt(l,l==="\u2705"?"Present and fresh":l==="\u26A0\uFE0F"?"Present but stale":l==="\u274C"?"Missing":"Status unknown")}
				</td>`}).join("");return`
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${C(t.workspaceName)}${s?` <span style="font-family: sans-serif; vertical-align: middle;">${nt("\u26A0\uFE0F","No customization files")}</span>`:""}
				</td>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center; color: var(--link-color); font-weight: 600;">
					${t.sessionCount}
				</td>
				${r}
			</tr>`}).join("");return`
		<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				\u{1F6E0}\uFE0F Copilot Customization Files
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				Showing ${o.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${o.workspacesWithIssues>0?`<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${nt("\u26A0\uFE0F")} ${o.workspacesWithIssues} workspace(s) have no customization files.</span>`:`<span style="display:inline-flex;align-items:center;gap:4px;">${nt("\u2705")} All workspaces have up-to-date customizations.</span>`}
			</div>
			<div class="customization-matrix-container">
				<table class="customization-matrix">
					<thead>
						<tr>
							<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">\u{1F4C2} Workspace</th>
							<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Sessions</th>
							${(o.customizationTypes??[]).map(t=>`
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${C(t.label)}">
									${C(t.icon)}
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
					${(o.customizationTypes??[]).map(t=>`
						<span>${C(t.icon)} ${C(t.label)}</span>
					`).join("")}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${nt("\u2705")} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${nt("\u26A0\uFE0F")} = Present but Stale</span>
					<span style="color: var(--text-muted);">\u2022</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${nt("\u274C")} = Missing</span>
				</div>
			</div>
		</div>`}function Lg(o){let e=o.last30Days.modelSwitching,t=o.today.modelSwitching;if((e.totalRequests??0)===0&&(t.totalRequests??0)===0)return"";function i(s){let r=s.totalRequests??0;if(r===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let l=[{label:"\u{1F49A} Low cost",count:s.lowCostRequests??0,color:"#4ade80"},{label:"\u{1F535} Medium cost",count:s.mediumCostRequests??0,color:"var(--link-color)"},{label:"\u{1F4B8} High cost",count:s.highCostRequests??0,color:"var(--warning-fg)"},{label:"\u2753 Unknown",count:s.unknownRequests??0,color:"var(--text-muted)"}].filter(h=>h.count>0).map(h=>{let u=r>0?Math.round(h.count/r*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${h.color};">${h.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${u}%; background: ${h.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${B(h.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${u}%)</span></span>
			</div>`}).join(""),p=(s.mixedCostSessions??0)>0?`<div style="font-size: 11px; color: var(--link-color); margin-top: 6px;">\u{1F500} ${B(s.mixedCostSessions)} mixed-cost session${s.mixedCostSessions!==1?"s":""}</div>`:"";return`${l}<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${B(r)} total requests</div>${p}`}return`
		<!-- Model Cost Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4B0}</span><span>Model Cost Usage</span></div>
			<div class="section-subtitle">Request distribution across cost levels \u2014 low (&lt;$2/M tokens), medium ($2\u20135/M), high (\u2265$5/M)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${i(t)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${i(e)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${i(o.month.modelSwitching)}
				</div>
			</div>
		</div>`}function Fg(o){return o.last30Days.thinkingEffortUsage||o.today.thinkingEffortUsage||o.month.thinkingEffortUsage?`
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4A1}</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					${Aa(o.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					${Aa(o.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					${Aa(o.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`:""}function Aa(o){let e=["minimal","low","medium","high","max","xhigh"];if(!o||o.sessionCount===0)return'<div style="color: var(--text-muted); font-size: 11px;">No data</div>';let t=Object.values(o.byEffort).reduce((s,r)=>s+r,0);return`
		${e.filter(s=>o.byEffort[s]>0).concat(Object.keys(o.byEffort).filter(s=>!e.includes(s)&&o.byEffort[s]>0)).map(s=>{let r=o.byEffort[s]||0,n=t>0?Math.round(r/t*100):0;return`<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${C(gg(s))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${n}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${r} <span style="color: var(--text-secondary); font-weight: 400;">(${n}%)</span></span>
			</div>`}).join("")}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${o.sessionCount} session${o.sessionCount!==1?"s":""} \xB7 ${o.switchCount} effort switch${o.switchCount!==1?"es":""}</div>
	`}function Og(o){return{allToolKeys:[...new Set([...Object.keys(o.today.toolCalls.byTool),...Object.keys(o.last30Days.toolCalls.byTool),...Object.keys(o.month.toolCalls.byTool)])],allMcpToolKeys:[...new Set([...Object.keys(o.today.mcpTools.byTool),...Object.keys(o.last30Days.mcpTools.byTool),...Object.keys(o.month.mcpTools.byTool)])],allMcpServerKeys:[...new Set([...Object.keys(o.today.mcpTools.byServer),...Object.keys(o.last30Days.mcpTools.byServer),...Object.keys(o.month.mcpTools.byServer)])],allStandardModels:[...new Set([...o.today.modelSwitching.standardModels,...o.last30Days.modelSwitching.standardModels,...o.month.modelSwitching.standardModels])],allHighCostModels:[...new Set([...o.today.modelSwitching.highCostModels,...o.last30Days.modelSwitching.highCostModels,...o.month.modelSwitching.highCostModels])],allLowCostModels:[...new Set([...o.today.modelSwitching.lowCostModels,...o.last30Days.modelSwitching.lowCostModels,...o.month.modelSwitching.lowCostModels])],allMediumCostModels:[...new Set([...o.today.modelSwitching.mediumCostModels,...o.last30Days.modelSwitching.mediumCostModels,...o.month.modelSwitching.mediumCostModels])],allUnknownModels:[...new Set([...o.today.modelSwitching.unknownModels,...o.last30Days.modelSwitching.unknownModels,...o.month.modelSwitching.unknownModels])]}}function zg(o,e){return`
		<div id="tab-panel-health" class="tab-panel"${ke!=="health"?' style="display:none"':""}>
			${o}
			${_g(e)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					\u{1F3D7}\uFE0F Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${at&&at.workspaces&&at.workspaces.length>0?`
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;">Analyze All Repositories (${at.workspaces.length})</vscode-button>
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
		</div>`}function Hg(o,e,t){return`
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F50C}</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${Xg(o)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${B(o.today.mcpTools.total)}</div>
						${t.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Rt(At(o.today.mcpTools.byServer,t),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${B(o.last30Days.mcpTools.total)}</div>
						${t.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Rt(At(o.last30Days.mcpTools.byServer,t),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${B(o.month.mcpTools.total)}</div>
						${t.length>0?`
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${Rt(At(o.month.mcpTools.byServer,t),200)}</div></div>
						`:'<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Rt(At(o.today.mcpTools.byTool,e),10,Ia)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Rt(At(o.last30Days.mcpTools.byTool,e),10,Ia)}</div></div>
						</div>
					`:""}
				</div>
				<div>
					${e.length>0?`
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${Rt(At(o.month.mcpTools.byTool,e),10,Ia)}</div></div>
						</div>
					`:""}
				</div>
			</div>
		</div>`}function Bg(){return`
		<div id="tab-panel-repos" class="tab-panel"${ke!=="repos"?' style="display:none"':""}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>\u{1F916}</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories \u2014 authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${ke!=="agent"?' style="display:none"':""}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>\u{1F916}</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading\u2026 (sign in with GitHub to see data)</div>
			</div>
		</div>`}function Js(o){let e={tip:"rgba(96,165,250,0.12)",opportunity:"rgba(251,191,36,0.12)",celebration:"rgba(74,222,128,0.12)"},t={tip:"rgba(96,165,250,0.5)",opportunity:"rgba(251,191,36,0.5)",celebration:"rgba(74,222,128,0.5)"},i={tip:"rgba(96,165,250,0.85)",opportunity:"rgba(251,191,36,0.85)",celebration:"rgba(74,222,128,0.85)"},s=e[o.severity]??e.tip,r=t[o.severity]??t.tip,n=i[o.severity]??i.tip,l=o.status==="new",p=o.status==="done",h=o.actionLabel?`<button class="insight-action-btn" data-insight-id="${C(o.id)}" data-action="execute" data-command="${C(o.actionCommand??"")}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${s}; color:var(--text-primary);">${C(o.actionLabel)}</button>`:"",u=p?'<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">\u2713 Done</span>':`<button class="insight-action-btn" data-insight-id="${C(o.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:${n}; color:#0d1117;">\u2713 Done</button>`,f=p?"":`<button class="insight-action-btn" data-insight-id="${C(o.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${r}; border-radius:5px;
				background:transparent; color:var(--text-primary);">\u23F8 Snooze</button>`,v=p?"":`<button class="insight-action-btn" data-insight-id="${C(o.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">\u2715</button>`;return`
		<div class="insight-card" data-insight-id="${C(o.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${s}; border:1px solid ${r};
			${l?"box-shadow:0 2px 8px "+s+";":""}
			${p?"opacity:0.45;":""}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${l?`<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${n}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>`:""}
						${C(o.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${C(o.body)}</div>
					${h?`<div style="margin-top:12px;">${h}</div>`:""}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${v}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${r}; padding-top:10px;">
				${u}
				${f}
			</div>
		</div>`}function Ng(o){let e=o.filter(n=>n.status!=="dismissed"),t=e.filter(n=>n.status==="new"),i=e.filter(n=>n.status!=="new"&&n.status!=="done"),s=t.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${t.map(Js).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=i.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${i.map(Js).join("")}
		</div>`:"";return`
		<div id="tab-panel-insights" class="tab-panel"${ke!=="insights"?' style="display:none"':""}>
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
		</div>`}function Gg(o){let e=document.querySelector('.tab-button[data-tab="insights"]');if(!e)return;let t=o.filter(r=>r.status==="new").length,i=t>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${t}</span>`:"",s="\u{1F4A1} Insights";e.innerHTML=s+i}function Vg(o){let e=document.getElementById("insights-container");if(!e)return;Fa=o;let t=o.filter(n=>n.status==="new"),i=o.filter(n=>n.status!=="new"&&n.status!=="dismissed"&&n.status!=="done"),s=t.length>0?`<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">\u2728 For You</div>
			${t.map(Js).join("")}
		</div>`:`<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			\u{1F389} No new insights right now \u2014 keep using Copilot and check back later!
		</div>`,r=i.length>0?`<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${i.map(Js).join("")}
		</div>`:"";e.innerHTML=s+r,Em(),Gg(o)}function Em(){let o=document.getElementById("insights-container");o&&o.querySelectorAll(".insight-action-btn").forEach(e=>{e.addEventListener("click",()=>{let t=e.getAttribute("data-insight-id"),i=e.getAttribute("data-action");if(!(!t||!i))if(i==="execute"){let s=e.getAttribute("data-command");s&&ae.postMessage({command:s})}else ae.postMessage({command:"insightAction",id:t,action:i})})})}function qg(o,e,t,i,s,r,n,l,p,h,u,f,v,T){return`
		<style>${Ga}</style>
		<style>${Va}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">\u{1F4CA}</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${Lt("btn-refresh")}
				${Lt("btn-details")}
				${Lt("btn-chart")}
				${Lt("btn-environmental")}
				${Lt("btn-diagnostics")}
				${Lt("btn-maturity")}
				${o.backendConfigured?Lt("btn-dashboard"):""}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title">\u{1F4CB} About This Dashboard</div>
				<div>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${ke==="activity"?"active":""}" data-tab="activity">\u{1F4CA} My Activity</button>
				<button class="tab-button ${ke==="sessions"?"active":""}" data-tab="sessions">\u{1F4CB} Today's Sessions</button>
				<button class="tab-button ${ke==="tools"?"active":""}" data-tab="tools">\u{1F527} Tools &amp; Integrations</button>
				<button class="tab-button ${ke==="health"?"active":""}" data-tab="health">\u{1F3D7}\uFE0F Workspace Health</button>
				<button class="tab-button ${ke==="repos"?"active":""}" data-tab="repos">\u{1F916} Repository PRs</button>
				<button class="tab-button ${ke==="agent"?"active":""}" data-tab="agent">\u{1F916} Cloud Agent</button>
				<button class="tab-button ${ke==="insights"?"active":""}" data-tab="insights">\u{1F4A1} Insights${(o.insights??[]).filter(A=>A.status==="new").length>0?` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(o.insights??[]).filter(A=>A.status==="new").length}</span>`:""}</button>
			</div>

			${Ug(o)}
			${jg(o,t,i,s,r,n)}
			${Jg(o,l,p,h,u,f,v,T)}
			${zg(e,o)}
			${Bg()}
			${Ng(o.insights??[])}
			<div class="footer">
				Last updated: ${C(new Date(o.lastUpdated).toLocaleString())} \xB7 Updates every 5 minutes
			</div>
		</div>
`}function Ug(o){return`
		<div id="tab-panel-sessions" class="tab-panel"${ke!=="sessions"?' style="display:none"':""}>
			<div class="section">
				<div class="section-title"><span>\u{1F4CB}</span><span>Today's Sessions</span></div>
				<div class="section-subtitle">Individual session breakdown for today \u2014 sorted by number of interactions (most active first).</div>
				<div style="margin-top: 12px;">
					${kg(o.todaySessions||[])}
				</div>
			</div>
		</div>`}function jg(o,e,t,i,s,r){let n=Lg(o);return`
		<div id="tab-panel-activity" class="tab-panel"${ke!=="activity"?' style="display:none"':""}>
			${i}
			<!-- Mode Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F3AF}</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${xm(o.today.modeUsage,"\u{1F4C5} Today")}
					${xm(o.last30Days.modeUsage,"\u{1F4CA} Last 30 Days")}
				</div>
			</div>
			${Yg(o,s,r)}
			${e}
			${n}
			${t}
		</div>`}function Ys(o,e=""){let t=o>0?"":" ctx-ref-zero";return`<td class="${`ctx-ref-num${e?" "+e:""}${t}`}">${o}</td>`}function _m(o,e,t){let n=[o,e,t],l=Math.max(...n),p=n.map((f,v)=>{let T=2+v*(56/(n.length-1)),A=l===0?18:2+(1-f/l)*16;return`${T.toFixed(1)},${A.toFixed(1)}`}).join(" "),u=l===0?"var(--text-muted)":t>=e&&e>=o?"var(--link-color)":t<=e&&e<=o?"#f87171":"var(--text-secondary)";return`<td class="ctx-ref-spark"><svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><polyline points="${p}" fill="none" stroke="${u}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${n.map((f,v)=>{let T=2+v*(56/(n.length-1)),A=l===0?18:2+(1-f/l)*16;return`<circle cx="${T.toFixed(1)}" cy="${A.toFixed(1)}" r="2" fill="${u}"/>`}).join("")}</svg></td>`}function Wg(o,e){return`
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
					${o.slice().sort((i,s)=>s.last30-i.last30).map(i=>`<tr${i.title?` title="${C(i.title)}"`:""}><td class="ctx-ref-name">${i.label}</td>${Ys(i.today,i.today>0?"ctx-ref-today-active":"")}${Ys(i.month)}${Ys(i.lastMonth)}${Ys(i.last30)}${_m(i.lastMonth,i.month,i.today)}</tr>`).join("")}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">\u{1F4CA} Total References</td>
						<td class="ctx-ref-num">${e.today}</td>
						<td class="ctx-ref-num">${e.month}</td>
						<td class="ctx-ref-num">${e.lastMonth}</td>
						<td class="ctx-ref-num">${e.last30}</td>
						<td class="ctx-ref-spark">${_m(e.lastMonth,e.month,e.today).replace(/^<td[^>]*>/,"").replace(/<\/td>$/,"")}</td>
					</tr>
				</tfoot>
			</table>
		</div>`}function Qg(o,e,t){let i=u=>u||0,s=[{label:"\u{1F4C4} #file",get:u=>u.file},{label:"\u2702\uFE0F #selection",get:u=>u.selection},{label:"\u2728 Implicit Selection",title:"Text selected in your editor providing passive context to Copilot",get:u=>u.implicitSelection},{label:"\u{1F524} #symbol",get:u=>u.symbol},{label:"\u{1F5C2}\uFE0F #codebase",get:u=>u.codebase},{label:"\u{1F4C1} @workspace",get:u=>u.workspace},{label:"\u{1F4BB} @terminal",get:u=>u.terminal},{label:"\u{1F527} @vscode",get:u=>u.vscode},{label:"\u2328\uFE0F #terminalLastCommand",title:"Last command run in the terminal",get:u=>i(u.terminalLastCommand)},{label:"\u{1F5B1}\uFE0F #terminalSelection",title:"Selected terminal output",get:u=>i(u.terminalSelection)},{label:"\u{1F4CB} #clipboard",title:"Clipboard contents",get:u=>i(u.clipboard)},{label:"\u{1F4DD} #changes",title:"Uncommitted git changes",get:u=>i(u.changes)},{label:"\u{1F4E4} #outputPanel",title:"Output panel contents",get:u=>i(u.outputPanel)},{label:"\u26A0\uFE0F #problemsPanel",title:"Problems panel contents",get:u=>i(u.problemsPanel)},{label:"\u{1F500} #pr",title:"Pull request context references (#pr / #pullRequest) \u2014 Copilot PR chat understanding, review, and summary",get:u=>i(u.pullRequest)},{label:"\u{1F4F7} Images",title:"Pasted images and vision context detected in session logs",get:u=>i(u.byKind["copilot.image"])},{label:"\u{1F4CB} Prompt Files",title:".github/prompts/ prompt file uses detected in session logs",get:u=>i(u.byKind.promptFile)},{label:"\u{1F4D0} Code Lines",title:"Total lines of code referenced via #file: range selections",get:u=>i(u.codeContextLines)},{label:"\u{1F3AF} Custom Prompts",title:"Custom /command prompt uses detected in session logs",get:u=>i(u.byKind.prompt)},{label:"\u{1F4CB} Copilot Instructions",title:"copilot-instructions.md file references detected in session logs",get:u=>u.copilotInstructions},{label:"\u{1F916} Agents.md",title:"agents.md file references detected in session logs",get:u=>u.agentsMd}],r=o.last30Days.contextReferences,n=o.month.contextReferences,l=o.lastMonth.contextReferences,p=o.today.contextReferences,h=s.map(u=>({label:u.label,title:u.title,last30:u.get(r),month:u.get(n),lastMonth:u.get(l),today:u.get(p)}));return Wg(h,{last30:t,month:Uo(n),lastMonth:Uo(l),today:e})}function Yg(o,e,t){let i=Object.keys(o.last30Days.contextReferences.byKind).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4CE} Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(o.last30Days.contextReferences.byKind).sort(([,r],[,n])=>n-r).slice(0,5).map(([r,n])=>`<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${C(r)}:</span> ${n}</div>`).join("")}
			</div>
		</div>
	`:"",s=Object.keys(o.last30Days.contextReferences.byPath).length>0?`
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">\u{1F4C1} Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(o.last30Days.contextReferences.byPath).sort(([,r],[,n])=>n-r).slice(0,10).map(([r,n])=>`<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${n}\xD7</span> ${C(r)}</div>`).join("")}
			</div>
		</div>
	`:"";return`
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F517}</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${Qg(o,e,t)}
			${i}
			${s}
		</div>`}function Xg(o){let e=vg(o);if(e.length===0)return"";let t=yg(e);return`
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${e.map(s=>{let r=(o.today.toolCalls.byTool[s]||0)+(o.today.mcpTools.byTool[s]||0),n=(o.last30Days.toolCalls.byTool[s]||0)+(o.last30Days.mcpTools.byTool[s]||0),l=(o.month.toolCalls.byTool[s]||0)+(o.month.mcpTools.byTool[s]||0),p=[];r>0&&p.push(`${r} today`),n>r&&p.push(`${n} in the last 30d`),l>n&&p.push(`${l} this month`);let h=p.length>0?`<span style="color:var(--text-muted);"> (${p.join(" | ")})</span>`:"",u=`<button data-suppress-tool="${C(s)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${C(s)}">\u{1F507}</button>`;return`<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${C(s)}${h}${u}</span>`}).join(" ")}
			</div>
			<a href="${C(t)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>\u{1F4DD}</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`}function Jg(o,e,t,i,s,r,n,l){return`
		<div id="tab-panel-tools" class="tab-panel"${ke!=="tools"?' style="display:none"':""}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F527}</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${B(o.today.toolCalls.total)}</div>
						${Rt(At(o.today.toolCalls.byTool,e),10)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C6} Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${B(o.last30Days.toolCalls.total)}</div>
							${Rt(At(o.last30Days.toolCalls.byTool,e),10)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">\u{1F4C5} Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${B(o.month.toolCalls.total)}</div>
							${Rt(At(o.month.toolCalls.byTool,e),10)}
						</div>
					</div>
				</div>
			</div>

			${Hg(o,t,i)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>\u{1F500}</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${Ra("\u{1F4C5} Today",o.today.modelSwitching,r,n,s,l)}
					${Ra("\u{1F4C6} Last 30 Days",o.last30Days.modelSwitching,r,n,s,l)}
					${Ra("\u{1F4C5} Previous Month",o.month.modelSwitching,r,n,s,l)}
				</div>
			</div>
		</div>`}function Dm(o){let e=document.getElementById("root");if(!e)return;let t=o.customizationMatrix??It?.customizationMatrix??null;at=t??null,(!at||at.workspaces.length===0)&&(Ne=null),Array.isArray(o.currentWorkspacePaths)&&(wm=o.currentWorkspacePaths);let i=Dg(t),s=Og(o),r=Uo(o.today.contextReferences),n=Uo(o.last30Days.contextReferences),l=Fg(o),p=`
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>\u{1F4C8}</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Today Sessions</div><div class="stat-value">${B(o.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C6} Last 30 Days Sessions</div><div class="stat-value">${B(o.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} This Month Sessions</div><div class="stat-value">${B(o.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">\u{1F4C5} Last Month Sessions</div><div class="stat-value">${B(o.lastMonth.sessions)}</div></div>
			</div>
		</div>`;e.innerHTML=qg(o,i,"",l,p,r,n,s.allToolKeys,s.allMcpToolKeys,s.allMcpServerKeys,s.allHighCostModels,s.allLowCostModels,s.allMediumCostModels,s.allUnknownModels),Zg(),Kg(),eo(),Tg(),eb(),Fa=o.insights??[],Em()}function Zg(){document.getElementById("btn-refresh")?.addEventListener("click",()=>{ae.postMessage({command:"refresh"})}),document.getElementById("btn-details")?.addEventListener("click",()=>{ae.postMessage({command:"showDetails"})}),document.getElementById("btn-chart")?.addEventListener("click",()=>{ae.postMessage({command:"showChart"})}),document.getElementById("btn-diagnostics")?.addEventListener("click",()=>{ae.postMessage({command:"showDiagnostics"})}),document.getElementById("btn-maturity")?.addEventListener("click",()=>{ae.postMessage({command:"showMaturity"})}),document.getElementById("btn-dashboard")?.addEventListener("click",()=>{ae.postMessage({command:"showDashboard"})}),document.getElementById("btn-environmental")?.addEventListener("click",()=>{ae.postMessage({command:"showEnvironmental"})}),Na(ae)}function Kg(){document.getElementById("btn-analyse-repo")?.addEventListener("click",()=>{let o=document.getElementById("btn-analyse-repo");o&&(o.disabled=!0,o.textContent="Analyzing..."),ae.postMessage({command:"analyseRepository"})}),document.getElementById("btn-analyse-all")?.addEventListener("click",()=>{let o=document.getElementById("btn-analyse-all");o&&(o.disabled=!0,o.textContent="Analyzing All..."),xi=!0,_o=!0,Ne=null,eo(),ae.postMessage({command:"analyseAllRepositories"})}),document.getElementById("repo-list-pane")?.addEventListener("click",o=>{let t=o.target.closest(".btn-repo-action");if(!t)return;let i=t.getAttribute("data-workspace-path"),s=t.getAttribute("data-action");if(!(!i||!s)){if(s==="details"){Ne=i,_o=!1,eo();return}s==="analyze"&&(t.disabled=!0,t.textContent="Analyzing...",xi=!1,ae.postMessage({command:"analyseRepository",workspacePath:i}))}}),document.getElementById("repo-details-pane")?.addEventListener("click",o=>{o.target.closest("#btn-switch-repository")&&(_o=!0,eo())})}function eb(){Array.from(document.getElementsByClassName("cf-copy")).forEach(o=>{o.addEventListener("click",e=>{let t=e.currentTarget,i=t.getAttribute("data-path")||"";navigator.clipboard&&i&&navigator.clipboard.writeText(i).then(()=>{t.textContent="Copied",setTimeout(()=>{t.textContent="Copy"},1200)}).catch(()=>{ae.postMessage({command:"copyFailed",path:i})})})})}function tb(o){km(),o.data?.locale&&Ks(o.data.locale),typeof o.data?.use24HourTime=="boolean"&&(za=o.data.use24HourTime);let e=$g(o.data);e?(Dm(e),Mm(),eo(),gi&&Rm(gi),bi&&Am(bi)):Sm("Received invalid data from the extension. Try refreshing.")}function Lm(o){if(!o)return;let e=document.getElementById("unknown-mcp-tools-section");e&&(e.querySelectorAll("button[data-suppress-tool]").forEach(t=>{t.getAttribute("data-suppress-tool")===o&&t.closest("span")?.remove()}),e.querySelectorAll("button[data-suppress-tool]").length===0&&e.remove())}function ob(){ke="tools",document.querySelectorAll(".tab-button").forEach(t=>{t.classList.toggle("active",t.getAttribute("data-tab")==="tools")}),document.querySelectorAll(".tab-panel").forEach(t=>{t.style.display="none"});let o=document.getElementById("tab-panel-tools");o&&(o.style.display="block");let e=document.getElementById("unknown-mcp-tools-section");e&&(e.scrollIntoView({behavior:"smooth",block:"center"}),e.style.transition="box-shadow 0.3s ease",e.style.boxShadow="0 0 0 3px var(--vscode-focusBorder)",setTimeout(()=>{e.style.boxShadow=""},2e3))}function ib(o){gi=Mg(o),gi.authenticated||(Ea=!1),Rm(gi)}function sb(o){!o||typeof o!="object"||(bi=Rg(o),bi.authenticated||(Da=!1),Am(bi))}function rb(o){if(!Array.isArray(o))return;let e=Im(o);Vg(e)}Ua(o=>{switch(o.command){case"repoAnalysisResults":xb(o.data,o.workspacePath);break;case"repoAnalysisError":Cb(o.error,o.workspacePath);break;case"repoAnalysisBatchComplete":_b();break;case"updateStats":tb(o);break;case"updateStatsError":km(),Sm("Failed to calculate usage analysis. Check the Output panel for details.");break;case"toolSuppressed":Lm(o.toolName);break;case"highlightUnknownTools":ob();break;case"repoPrStatsLoaded":ib(o.data);break;case"repoPrStatsProgress":Cm("#repos-pr-content","repos-pr-progress","Fetching PRs\u2026",o.done,o.total);break;case"agentSessionsLoaded":sb(o.data);break;case"agentSessionsProgress":Cm("#agent-sessions-content","agent-sessions-progress","Fetching agent sessions\u2026",o.done,o.total);break;case"updateInsights":rb(o.insights);break;case"switchTab":{document.querySelector(`.tab-button[data-tab="${String(o.tab)}"]`)?.click();break}}});function nb(o){return at?.workspaces.find(t=>t.workspacePath===o)?.workspaceName||o}function ab(o){let e=Ci.get(o);if(e?.data?.summary){let t=to(e.data.summary.percentage);return`${Math.round(t)}%`}return e?.error?"Error":"\u2014"}function to(o){let e=typeof o=="number"?o:Number(o);return Number.isFinite(e)?e:0}var lb={"git-repo":"https://docs.github.com/en/get-started/using-git/about-git",gitignore:"https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files","env-example":"https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions",editorconfig:"https://editorconfig.org/",linter:"https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning",formatter:"https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide","type-safety":"https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries","commit-messages":"https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits","conventional-commits":"https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets","ci-config":"https://docs.github.com/en/actions/about-github-actions/understanding-github-actions",scripts:"https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs","task-runner":"https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts",devcontainer:"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration",dockerfile:"https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry","version-pinning":"https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces",license:"https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository"},cb={versionControl:"\u{1F504} Version Control",codeQuality:"\u2728 Code Quality",cicd:"\u{1F680} CI/CD",environment:"\u{1F527} Environment",documentation:"\u{1F4DA} Documentation"};function db(o){let e=R("div");e.setAttribute("style","display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;");let t=R("div");t.setAttribute("style","font-size: 14px; font-weight: 600; color: var(--text-primary);"),t.textContent="\u{1F4CA} Repository Hygiene Score";let i=R("div");return i.setAttribute("style","font-size: 24px; font-weight: 700; color: var(--link-color);"),i.textContent=`${Math.round(to(o.percentage))}%`,e.append(t,i),e}function pb(o){let e=R("div");e.setAttribute("style","display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;");let t=[{count:o.passedChecks,label:"Passed",cardStyle:"text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--success-fg);"},{count:o.warningChecks,label:"Warnings",cardStyle:"text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: var(--warning-fg);"},{count:o.failedChecks,label:"Failed",cardStyle:"text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;",countStyle:"font-size: 18px; font-weight: 600; color: #ef4444;"}];for(let i of t){let s=R("div");s.setAttribute("style",i.cardStyle);let r=R("div");r.setAttribute("style",i.countStyle),r.textContent=String(to(i.count));let n=R("div");n.setAttribute("style","font-size: 10px; color: var(--text-secondary);"),n.textContent=i.label,s.append(r,n),e.appendChild(s)}return e}function ub(o){let e=o?.status==="pass"||o?.status==="warning"?o.status:"fail";return{status:e,emoji:e==="pass"?"\u2705":e==="warning"?"\u26A0\uFE0F":"\u274C",color:e==="pass"?"#22c55e":e==="warning"?"#f59e0b":"#ef4444"}}function hb(o,e){let t=R("div");t.setAttribute("style","flex: 1;");let i=R("div");i.setAttribute("style",`font-size: 12px; font-weight: 600; color: ${e};`),i.textContent=typeof o?.label=="string"?o.label:"";let s=R("div");if(s.setAttribute("style","font-size: 11px; color: var(--text-secondary); margin-top: 2px;"),s.textContent=typeof o?.detail=="string"?o.detail:"",t.append(i,s),typeof o?.hint=="string"&&o.hint.length>0){let n=R("div");n.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;"),n.textContent=`\u{1F4A1} ${o.hint}`,t.appendChild(n)}let r=lb[typeof o?.id=="string"?o.id:""];if(r){let n=R("a");n.setAttribute("href",r),n.setAttribute("style","font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;"),n.setAttribute("title","View official documentation"),n.textContent="\u{1F4D6} View documentation",t.appendChild(n)}return t}function mb(o){let{emoji:e,color:t}=ub(o),i=R("div");i.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;");let s=R("span");s.setAttribute("style","flex-shrink: 0; padding-top: 1px;"),s.innerHTML=nt(e);let r=R("span");return r.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),r.textContent=`+${to(o?.weight)}`,i.append(s,hb(o,t),r),i}function fb(o,e,t){let i=R("div");i.setAttribute("style","margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let s=R("div");s.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;");let r=R("span");r.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),r.textContent=cb[o]||o;let n=t?.categories?.[o],l=R("span");l.setAttribute("style","font-size: 11px; color: var(--link-color); font-weight: 600;"),l.textContent=`${Math.round(to(n?.percentage))}%`,s.append(r,l),i.appendChild(s);for(let p of e)i.appendChild(mb(p));return i}function gb(o){let e=R("div");e.setAttribute("style","margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;");let t=R("div");t.setAttribute("style","padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);");let i=R("span");i.setAttribute("style","font-size: 12px; font-weight: 600; color: var(--text-primary);"),i.textContent="\u{1F4A1} Top Recommendations",t.appendChild(i),e.appendChild(t);for(let s of o.slice(0,5)){let r=s?.priority==="high"||s?.priority==="medium"?s.priority:"low",n=r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#60a5fa",l=R("div");l.setAttribute("style","padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;");let p=R("span");p.setAttribute("style",`font-size: 10px; font-weight: 600; color: ${n}; min-width: 50px;`),p.textContent=String(r).toUpperCase();let h=R("div");h.setAttribute("style","flex: 1;");let u=R("div");u.setAttribute("style","font-size: 11px; color: var(--text-primary);"),u.textContent=typeof s?.action=="string"?s.action:"";let f=R("div");f.setAttribute("style","font-size: 10px; color: var(--text-muted); margin-top: 2px;"),f.textContent=typeof s?.impact=="string"?s.impact:"",h.append(u,f);let v=R("span");v.setAttribute("style","font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;"),v.textContent=`+${to(s?.weight)}`,l.append(p,h,v),e.appendChild(l)}return e}function bb(o,e){let t=R("div");t.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;");let i=R("div");i.setAttribute("style","font-size: 11px; color: var(--text-secondary); flex: 1;"),i.textContent="Let Copilot help you fix the identified issues in this repository.";let s=document.createElement("vscode-button");return s.setAttribute("style","min-width: 180px;"),s.textContent="\u{1F916} Ask Copilot to Improve",s.addEventListener("click",()=>{let n=`Please help me improve this repository by addressing the following best practice issues:

${o.map(p=>`- ${p.label}: ${p.detail||""}${p.hint?` (${p.hint})`:""}`).join(`
`)}

For each issue, please provide specific steps or code changes to fix it.`;if(!e||wm.some(p=>p.toLowerCase()===e.toLowerCase()))ae.postMessage({command:"openCopilotChatWithPrompt",prompt:n});else{let p=e.split(/[/\\]/).filter(Boolean).pop()??e;t.replaceChildren(),t.setAttribute("style","margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;");let h=R("div");h.setAttribute("style","font-size: 11px; color: var(--warning-fg);"),h.textContent=`\u26A0\uFE0F Open "${p}" in VS Code first, then paste this prompt into Copilot Chat:`;let u=R("pre");u.setAttribute("style","font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;"),u.textContent=n;let f=document.createElement("vscode-button");f.setAttribute("appearance","secondary"),f.textContent="\u{1F4CB} Copy prompt",f.addEventListener("click",()=>{navigator.clipboard.writeText(n).then(()=>{f.textContent="\u2705 Copied!",setTimeout(()=>{f.textContent="\u{1F4CB} Copy prompt"},2e3)})}),t.append(h,u,f)}}),t.append(i,s),t}function Fm(o,e){let t=o?.summary||{},i=Array.isArray(o?.checks)?o.checks:[],s=Array.isArray(o?.recommendations)?[...o.recommendations]:[],r=R("div");r.appendChild(db(t)),r.appendChild(pb(t));let n=R("div");n.setAttribute("style","font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;"),n.textContent=`Score: ${to(t.totalScore)} / ${to(t.maxScore)} points`,r.appendChild(n);let l={high:1,medium:2,low:3};s.sort((u,f)=>(l[u?.priority]||99)-(l[f?.priority]||99));let p={};for(let u of i){let f=typeof u?.category=="string"&&u.category.length>0?u.category:"other";p[f]||(p[f]=[]),p[f].push(u)}for(let[u,f]of Object.entries(p))r.appendChild(fb(u,f,t));s.length>0&&r.appendChild(gb(s));let h=i.filter(u=>u?.status==="fail"||u?.status==="warning");return h.length>0&&r.appendChild(bb(h,e)),r}function vb(o,e,t){let i={sessions:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",interactions:"width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);",score:"width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);"},s=`
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${i.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${i.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${i.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 80px; flex-shrink: 0;"></div>
		</div>
	`;o.innerHTML=s+e.map((r,n)=>{let p=!!Ci.get(r.workspacePath)?.data?.summary,h=ab(r.workspacePath),u=p?"Details":"Analyze",f=p?"details":"analyze",v=Ne===r.workspacePath&&t,T=Number(r.sessionCount)||0,A=Number(r.interactionCount)||0;return`
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${n<e.length-1?"1px solid var(--border-subtle)":"none"}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${C(r.workspacePath)}">
						${C(r.workspaceName)}
					</div>
				</div>
				<div style="${i.sessions}">${T}</div>
				<div style="${i.interactions}">${A}</div>
				<div style="${i.score}">${C(h)}</div>
				<vscode-button class="btn-repo-action" data-action="${f}" data-workspace-path="${C(r.workspacePath)}" ${v?'disabled="true"':""} style="min-width: 80px; flex-shrink: 0;">
					${u}
				</vscode-button>
			</div>
		`}).join("")}function yb(o,e,t){o.replaceChildren();let i=R("div","repo-details-card");i.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;");let s=R("div","repo-details-card-header");s.setAttribute("style","display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;");let r=R("div");r.setAttribute("style","font-size: 12px; color: var(--text-secondary);"),r.textContent="Repository: ";let n=R("span");n.setAttribute("style","color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;"),n.textContent=t,r.appendChild(n);let l=document.createElement("vscode-button");l.id="btn-switch-repository",l.setAttribute("style","min-width: 120px;"),l.textContent="Switch Repository",s.append(r,l),i.append(s,Fm(e.data,Ne??void 0)),o.appendChild(i)}function eo(){let o=document.getElementById("repo-list-pane"),e=document.getElementById("repo-list-pane-container"),t=document.getElementById("repo-details-pane"),i=document.getElementById("repo-details-pane-container");if(!o||!e||!t||!i||!at)return;let s=!!Ne&&!_o,r=s?at.workspaces.filter(p=>p.workspacePath===Ne):at.workspaces;if(e.classList.remove("repo-hygiene-pane-collapsed"),i.classList.toggle("repo-hygiene-pane-collapsed",!s),vb(o,r,s),!s||!Ne){t.replaceChildren();return}let n=nb(Ne),l=Ci.get(Ne);if(l?.data){yb(t,l,n);return}if(l?.error){t.innerHTML=`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${C(n)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${C(l.error)}</div>
			</div>
		`;return}t.innerHTML=`
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${C(n)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`}function xb(o,e){if(e){Ci.set(e,{data:o,error:void 0}),xi||(Ne=e,_o=!1),eo();return}let t=document.getElementById("btn-analyse-repo");t&&(t.disabled=!1,t.textContent="Analyze Repo for Best Practices");let i=document.getElementById("repo-analysis-results");if(i){i.replaceChildren();let s=R("div","repo-analysis-card");s.setAttribute("style","padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;"),s.appendChild(Fm(o,e)),i.appendChild(s)}}function Cb(o,e){if(e){Ci.set(e,{data:void 0,error:o}),xi||(Ne=e,_o=!1),eo();return}let t=document.getElementById("btn-analyse-repo");t&&(t.disabled=!1,t.textContent="Analyze Repo for Best Practices");let i=document.getElementById("repo-analysis-results");i&&(i.innerHTML=`
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">\u274C Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${C(o)}</div>
			</div>
		`)}function _b(){xi=!1,_o=!0,Ne=null,eo();let o=document.getElementById("btn-analyse-all");if(o){o.disabled=!1;let t=It?.customizationMatrix?.workspaces?.length||0;o.textContent=`Analyze All Repositories (${t})`}}async function wb(){let{provideVSCodeDesignSystem:o,vsCodeButton:e}=await Promise.resolve().then(()=>(ym(),vm));if(o().register(e()),!It){let t=document.getElementById("root");t&&(t.innerHTML='<div style="padding: 32px; text-align: center; color: var(--vscode-foreground); opacity: 0.7; font-size: 14px;">\u23F3 Loading usage analysis\u2026</div>'),Xs=setTimeout(()=>{let i=document.getElementById("root");if(i&&i.innerHTML.includes("Loading usage analysis")){let s=document.createElement("div");s.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let r=document.createElement("div");r.style.cssText="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;",r.textContent="\u23F3 Taking longer than expected\u2026 Session files may be large or the scan is still in progress.",s.append(r,Oa()),i.textContent="",i.append(s)}},3e4);return}console.log("[Usage Analysis] Browser default locale:",Intl.DateTimeFormat().resolvedOptions().locale),console.log("[Usage Analysis] Received locale from extension:",It.locale),console.log("[Usage Analysis] Test format 1234567.89 with received locale:",new Intl.NumberFormat(It.locale).format(123456789e-2)),Ks(It.locale),za=It.use24HourTime!==!1,Dm(It),Mm(),document.addEventListener("click",t=>{let s=t.target.getAttribute("data-suppress-tool");s&&(Lm(s),ae.postMessage({command:"suppressUnknownTool",toolName:s}))})}wb().catch(o=>{console.error("[Usage Analysis] Bootstrap failed:",o);let e=document.getElementById("root");if(e){let t=document.createElement("div");t.style.cssText="padding: 32px; text-align: center; font-size: 14px;";let i=document.createElement("div");i.style.cssText="color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;",i.textContent="Failed to initialize usage analysis. Please try refreshing.",t.append(i,Oa()),e.textContent="",e.append(t)}});})();
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
