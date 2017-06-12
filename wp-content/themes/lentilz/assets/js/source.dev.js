'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! Magnific Popup - v1.0.0 - 2015-01-03
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2015 Dmitry Semenov; */
;(function(factory){
if(typeof define==='function'&&define.amd){
// AMD. Register as an anonymous module.
define(['jquery'],factory);
}else if((typeof exports==='undefined'?'undefined':_typeof(exports))==='object'){
// Node/CommonJS
factory(require('jquery'));
}else{
// Browser globals
factory(window.jQuery||window.Zepto);
}
})(function($){

/*>>core*/
/**
 *
 * Magnific Popup Core JS file
 *
 */


/**
 * Private static constants
 */
var CLOSE_EVENT='Close',
BEFORE_CLOSE_EVENT='BeforeClose',
AFTER_CLOSE_EVENT='AfterClose',
BEFORE_APPEND_EVENT='BeforeAppend',
MARKUP_PARSE_EVENT='MarkupParse',
OPEN_EVENT='Open',
CHANGE_EVENT='Change',
NS='mfp',
EVENT_NS='.'+NS,
READY_CLASS='mfp-ready',
REMOVING_CLASS='mfp-removing',
PREVENT_CLOSE_CLASS='mfp-prevent-close';


/**
 * Private vars
 */
/*jshint -W079 */
var mfp,// As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
MagnificPopup=function MagnificPopup(){},
_isJQ=!!window.jQuery,
_prevStatus,
_window=$(window),
_document,
_prevContentType,
_wrapClasses,
_currPopupType;


/**
 * Private functions
 */
var _mfpOn=function _mfpOn(name,f){
mfp.ev.on(NS+name+EVENT_NS,f);
},
_getEl=function _getEl(className,appendTo,html,raw){
var el=document.createElement('div');
el.className='mfp-'+className;
if(html){
el.innerHTML=html;
}
if(!raw){
el=$(el);
if(appendTo){
el.appendTo(appendTo);
}
}else if(appendTo){
appendTo.appendChild(el);
}
return el;
},
_mfpTrigger=function _mfpTrigger(e,data){
mfp.ev.triggerHandler(NS+e,data);

if(mfp.st.callbacks){
// converts "mfpEventName" to "eventName" callback and triggers it if it's present
e=e.charAt(0).toLowerCase()+e.slice(1);
if(mfp.st.callbacks[e]){
mfp.st.callbacks[e].apply(mfp,$.isArray(data)?data:[data]);
}
}
},
_getCloseBtn=function _getCloseBtn(type){
if(type!==_currPopupType||!mfp.currTemplate.closeBtn){
mfp.currTemplate.closeBtn=$(mfp.st.closeMarkup.replace('%title%',mfp.st.tClose));
_currPopupType=type;
}
return mfp.currTemplate.closeBtn;
},
// Initialize Magnific Popup only when called at least once
_checkInstance=function _checkInstance(){
if(!$.magnificPopup.instance){
/*jshint -W020 */
mfp=new MagnificPopup();
mfp.init();
$.magnificPopup.instance=mfp;
}
},
// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
supportsTransitions=function supportsTransitions(){
var s=document.createElement('p').style,// 's' for style. better to create an element if body yet to exist
v=['ms','O','Moz','Webkit'];// 'v' for vendor

if(s['transition']!==undefined){
return true;
}

while(v.length){
if(v.pop()+'Transition'in s){
return true;
}
}

return false;
};



/**
 * Public functions
 */
MagnificPopup.prototype={

constructor:MagnificPopup,

/**
     * Initializes Magnific Popup plugin.
     * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
     */
init:function init(){
var appVersion=navigator.appVersion;
mfp.isIE7=appVersion.indexOf("MSIE 7.")!==-1;
mfp.isIE8=appVersion.indexOf("MSIE 8.")!==-1;
mfp.isLowIE=mfp.isIE7||mfp.isIE8;
mfp.isAndroid=/android/gi.test(appVersion);
mfp.isIOS=/iphone|ipad|ipod/gi.test(appVersion);
mfp.supportsTransition=supportsTransitions();

// We disable fixed positioned lightbox on devices that don't handle it nicely.
// If you know a better way of detecting this - let me know.
mfp.probablyMobile=mfp.isAndroid||mfp.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
_document=$(document);

mfp.popupsCache={};
},

/**
     * Opens popup
     * @param  data [description]
     */
open:function open(data){

var i;

if(data.isObj===false){
// convert jQuery collection to array to avoid conflicts later
mfp.items=data.items.toArray();

mfp.index=0;
var items=data.items,
item;
for(i=0;i<items.length;i++){
item=items[i];
if(item.parsed){
item=item.el[0];
}
if(item===data.el[0]){
mfp.index=i;
break;
}
}
}else{
mfp.items=$.isArray(data.items)?data.items:[data.items];
mfp.index=data.index||0;
}

// if popup is already opened - we just update the content
if(mfp.isOpen){
mfp.updateItemHTML();
return;
}

mfp.types=[];
_wrapClasses='';
if(data.mainEl&&data.mainEl.length){
mfp.ev=data.mainEl.eq(0);
}else{
mfp.ev=_document;
}

if(data.key){
if(!mfp.popupsCache[data.key]){
mfp.popupsCache[data.key]={};
}
mfp.currTemplate=mfp.popupsCache[data.key];
}else{
mfp.currTemplate={};
}



mfp.st=$.extend(true,{},$.magnificPopup.defaults,data);
mfp.fixedContentPos=mfp.st.fixedContentPos==='auto'?!mfp.probablyMobile:mfp.st.fixedContentPos;

if(mfp.st.modal){
mfp.st.closeOnContentClick=false;
mfp.st.closeOnBgClick=false;
mfp.st.showCloseBtn=false;
mfp.st.enableEscapeKey=false;
}


// Building markup
// main containers are created only once
if(!mfp.bgOverlay){

// Dark overlay
mfp.bgOverlay=_getEl('bg').on('click'+EVENT_NS,function(){
mfp.close();
});

mfp.wrap=_getEl('wrap').attr('tabindex',-1).on('click'+EVENT_NS,function(e){
if(mfp._checkIfClose(e.target)){
mfp.close();
}
});

mfp.container=_getEl('container',mfp.wrap);
}

mfp.contentContainer=_getEl('content');
if(mfp.st.preloader){
mfp.preloader=_getEl('preloader',mfp.container,mfp.st.tLoading);
}


// Initializing modules
var modules=$.magnificPopup.modules;
for(i=0;i<modules.length;i++){
var n=modules[i];
n=n.charAt(0).toUpperCase()+n.slice(1);
mfp['init'+n].call(mfp);
}
_mfpTrigger('BeforeOpen');


if(mfp.st.showCloseBtn){
// Close button
if(!mfp.st.closeBtnInside){
mfp.wrap.append(_getCloseBtn());
}else{
_mfpOn(MARKUP_PARSE_EVENT,function(e,template,values,item){
values.close_replaceWith=_getCloseBtn(item.type);
});
_wrapClasses+=' mfp-close-btn-in';
}
}

if(mfp.st.alignTop){
_wrapClasses+=' mfp-align-top';
}



if(mfp.fixedContentPos){
mfp.wrap.css({
overflow:mfp.st.overflowY,
overflowX:'hidden',
overflowY:mfp.st.overflowY});

}else{
mfp.wrap.css({
top:_window.scrollTop(),
position:'absolute'});

}
if(mfp.st.fixedBgPos===false||mfp.st.fixedBgPos==='auto'&&!mfp.fixedContentPos){
mfp.bgOverlay.css({
height:_document.height(),
position:'absolute'});

}



if(mfp.st.enableEscapeKey){
// Close on ESC key
_document.on('keyup'+EVENT_NS,function(e){
if(e.keyCode===27){
mfp.close();
}
});
}

_window.on('resize'+EVENT_NS,function(){
mfp.updateSize();
});


if(!mfp.st.closeOnContentClick){
_wrapClasses+=' mfp-auto-cursor';
}

if(_wrapClasses)
mfp.wrap.addClass(_wrapClasses);


// this triggers recalculation of layout, so we get it once to not to trigger twice
var windowHeight=mfp.wH=_window.height();


var windowStyles={};

if(mfp.fixedContentPos){
if(mfp._hasScrollBar(windowHeight)){
var s=mfp._getScrollbarSize();
if(s){
windowStyles.marginRight=s;
}
}
}

if(mfp.fixedContentPos){
if(!mfp.isIE7){
windowStyles.overflow='hidden';
}else{
// ie7 double-scroll bug
$('body, html').css('overflow','hidden');
}
}



var classesToadd=mfp.st.mainClass;
if(mfp.isIE7){
classesToadd+=' mfp-ie7';
}
if(classesToadd){
mfp._addClassToMFP(classesToadd);
}

// add content
mfp.updateItemHTML();

_mfpTrigger('BuildControls');

// remove scrollbar, add margin e.t.c
$('html').css(windowStyles);

// add everything to DOM
mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo||$(document.body));

// Save last focused element
mfp._lastFocusedEl=document.activeElement;

// Wait for next cycle to allow CSS transition
setTimeout(function(){

if(mfp.content){
mfp._addClassToMFP(READY_CLASS);
mfp._setFocus();
}else{
// if content is not defined (not loaded e.t.c) we add class only for BG
mfp.bgOverlay.addClass(READY_CLASS);
}

// Trap the focus in popup
_document.on('focusin'+EVENT_NS,mfp._onFocusIn);

},16);

mfp.isOpen=true;
mfp.updateSize(windowHeight);
_mfpTrigger(OPEN_EVENT);

return data;
},

/**
     * Closes the popup
     */
close:function close(){
if(!mfp.isOpen)return;
_mfpTrigger(BEFORE_CLOSE_EVENT);

mfp.isOpen=false;
// for CSS3 animation
if(mfp.st.removalDelay&&!mfp.isLowIE&&mfp.supportsTransition){
mfp._addClassToMFP(REMOVING_CLASS);
setTimeout(function(){
mfp._close();
},mfp.st.removalDelay);
}else{
mfp._close();
}
},

/**
     * Helper for close() function
     */
_close:function _close(){
_mfpTrigger(CLOSE_EVENT);

var classesToRemove=REMOVING_CLASS+' '+READY_CLASS+' ';

mfp.bgOverlay.detach();
mfp.wrap.detach();
mfp.container.empty();

if(mfp.st.mainClass){
classesToRemove+=mfp.st.mainClass+' ';
}

mfp._removeClassFromMFP(classesToRemove);

if(mfp.fixedContentPos){
var windowStyles={marginRight:''};
if(mfp.isIE7){
$('body, html').css('overflow','');
}else{
windowStyles.overflow='';
}
$('html').css(windowStyles);
}

_document.off('keyup'+EVENT_NS+' focusin'+EVENT_NS);
mfp.ev.off(EVENT_NS);

// clean up DOM elements that aren't removed
mfp.wrap.attr('class','mfp-wrap').removeAttr('style');
mfp.bgOverlay.attr('class','mfp-bg');
mfp.container.attr('class','mfp-container');

// remove close button from target element
if(mfp.st.showCloseBtn&&(
!mfp.st.closeBtnInside||mfp.currTemplate[mfp.currItem.type]===true)){
if(mfp.currTemplate.closeBtn)
mfp.currTemplate.closeBtn.detach();
}


if(mfp._lastFocusedEl){
$(mfp._lastFocusedEl).focus();// put tab focus back
}
mfp.currItem=null;
mfp.content=null;
mfp.currTemplate=null;
mfp.prevHeight=0;

_mfpTrigger(AFTER_CLOSE_EVENT);
},

updateSize:function updateSize(winHeight){

if(mfp.isIOS){
// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
var zoomLevel=document.documentElement.clientWidth/window.innerWidth;
var height=window.innerHeight*zoomLevel;
mfp.wrap.css('height',height);
mfp.wH=height;
}else{
mfp.wH=winHeight||_window.height();
}
// Fixes #84: popup incorrectly positioned with position:relative on body
if(!mfp.fixedContentPos){
mfp.wrap.css('height',mfp.wH);
}

_mfpTrigger('Resize');

},

/**
     * Set content of popup based on current index
     */
updateItemHTML:function updateItemHTML(){
var item=mfp.items[mfp.index];

// Detach and perform modifications
mfp.contentContainer.detach();

if(mfp.content)
mfp.content.detach();

if(!item.parsed){
item=mfp.parseEl(mfp.index);
}

var type=item.type;

_mfpTrigger('BeforeChange',[mfp.currItem?mfp.currItem.type:'',type]);
// BeforeChange event works like so:
// _mfpOn('BeforeChange', function(e, prevType, newType) { });

mfp.currItem=item;





if(!mfp.currTemplate[type]){
var markup=mfp.st[type]?mfp.st[type].markup:false;

// allows to modify markup
_mfpTrigger('FirstMarkupParse',markup);

if(markup){
mfp.currTemplate[type]=$(markup);
}else{
// if there is no markup found we just define that template is parsed
mfp.currTemplate[type]=true;
}
}

if(_prevContentType&&_prevContentType!==item.type){
mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
}

var newContent=mfp['get'+type.charAt(0).toUpperCase()+type.slice(1)](item,mfp.currTemplate[type]);
mfp.appendContent(newContent,type);

item.preloaded=true;

_mfpTrigger(CHANGE_EVENT,item);
_prevContentType=item.type;

// Append container back after its content changed
mfp.container.prepend(mfp.contentContainer);

_mfpTrigger('AfterChange');
},


/**
     * Set HTML content of popup
     */
appendContent:function appendContent(newContent,type){
mfp.content=newContent;

if(newContent){
if(mfp.st.showCloseBtn&&mfp.st.closeBtnInside&&
mfp.currTemplate[type]===true){
// if there is no markup, we just append close button element inside
if(!mfp.content.find('.mfp-close').length){
mfp.content.append(_getCloseBtn());
}
}else{
mfp.content=newContent;
}
}else{
mfp.content='';
}

_mfpTrigger(BEFORE_APPEND_EVENT);
mfp.container.addClass('mfp-'+type+'-holder');

mfp.contentContainer.append(mfp.content);
},




/**
     * Creates Magnific Popup data object based on given data
     * @param  {int} index Index of item to parse
     */
parseEl:function parseEl(index){
var item=mfp.items[index],
type;

if(item.tagName){
item={el:$(item)};
}else{
type=item.type;
item={data:item,src:item.src};
}

if(item.el){
var types=mfp.types;

// check for 'mfp-TYPE' class
for(var i=0;i<types.length;i++){
if(item.el.hasClass('mfp-'+types[i])){
type=types[i];
break;
}
}

item.src=item.el.attr('data-mfp-src');
if(!item.src){
item.src=item.el.attr('href');
}
}

item.type=type||mfp.st.type||'inline';
item.index=index;
item.parsed=true;
mfp.items[index]=item;
_mfpTrigger('ElementParse',item);

return mfp.items[index];
},


/**
     * Initializes single popup or a group of popups
     */
addGroup:function addGroup(el,options){
var eHandler=function eHandler(e){
e.mfpEl=this;
mfp._openClick(e,el,options);
};

if(!options){
options={};
}

var eName='click.magnificPopup';
options.mainEl=el;

if(options.items){
options.isObj=true;
el.off(eName).on(eName,eHandler);
}else{
options.isObj=false;
if(options.delegate){
el.off(eName).on(eName,options.delegate,eHandler);
}else{
options.items=el;
el.off(eName).on(eName,eHandler);
}
}
},
_openClick:function _openClick(e,el,options){
var midClick=options.midClick!==undefined?options.midClick:$.magnificPopup.defaults.midClick;


if(!midClick&&(e.which===2||e.ctrlKey||e.metaKey)){
return;
}

var disableOn=options.disableOn!==undefined?options.disableOn:$.magnificPopup.defaults.disableOn;

if(disableOn){
if($.isFunction(disableOn)){
if(!disableOn.call(mfp)){
return true;
}
}else{// else it's number
if(_window.width()<disableOn){
return true;
}
}
}

if(e.type){
e.preventDefault();

// This will prevent popup from closing if element is inside and popup is already opened
if(mfp.isOpen){
e.stopPropagation();
}
}


options.el=$(e.mfpEl);
if(options.delegate){
options.items=el.find(options.delegate);
}
mfp.open(options);
},


/**
     * Updates text on preloader
     */
updateStatus:function updateStatus(status,text){

if(mfp.preloader){
if(_prevStatus!==status){
mfp.container.removeClass('mfp-s-'+_prevStatus);
}

if(!text&&status==='loading'){
text=mfp.st.tLoading;
}

var data={
status:status,
text:text};

// allows to modify status
_mfpTrigger('UpdateStatus',data);

status=data.status;
text=data.text;

mfp.preloader.html(text);

mfp.preloader.find('a').on('click',function(e){
e.stopImmediatePropagation();
});

mfp.container.addClass('mfp-s-'+status);
_prevStatus=status;
}
},


/*
        "Private" helpers that aren't private at all
     */
// Check to close popup or not
// "target" is an element that was clicked
_checkIfClose:function _checkIfClose(target){

if($(target).hasClass(PREVENT_CLOSE_CLASS)){
return;
}

var closeOnContent=mfp.st.closeOnContentClick;
var closeOnBg=mfp.st.closeOnBgClick;

if(closeOnContent&&closeOnBg){
return true;
}else{

// We close the popup if click is on close button or on preloader. Or if there is no content.
if(!mfp.content||$(target).hasClass('mfp-close')||mfp.preloader&&target===mfp.preloader[0]){
return true;
}

// if click is outside the content
if(target!==mfp.content[0]&&!$.contains(mfp.content[0],target)){
if(closeOnBg){
// last check, if the clicked element is in DOM, (in case it's removed onclick)
if($.contains(document,target)){
return true;
}
}
}else if(closeOnContent){
return true;
}

}
return false;
},
_addClassToMFP:function _addClassToMFP(cName){
mfp.bgOverlay.addClass(cName);
mfp.wrap.addClass(cName);
},
_removeClassFromMFP:function _removeClassFromMFP(cName){
this.bgOverlay.removeClass(cName);
mfp.wrap.removeClass(cName);
},
_hasScrollBar:function _hasScrollBar(winHeight){
return(mfp.isIE7?_document.height():document.body.scrollHeight)>(winHeight||_window.height());
},
_setFocus:function _setFocus(){
(mfp.st.focus?mfp.content.find(mfp.st.focus).eq(0):mfp.wrap).focus();
},
_onFocusIn:function _onFocusIn(e){
if(e.target!==mfp.wrap[0]&&!$.contains(mfp.wrap[0],e.target)){
mfp._setFocus();
return false;
}
},
_parseMarkup:function _parseMarkup(template,values,item){
var arr;
if(item.data){
values=$.extend(item.data,values);
}
_mfpTrigger(MARKUP_PARSE_EVENT,[template,values,item]);

$.each(values,function(key,value){
if(value===undefined||value===false){
return true;
}
arr=key.split('_');
if(arr.length>1){
var el=template.find(EVENT_NS+'-'+arr[0]);

if(el.length>0){
var attr=arr[1];
if(attr==='replaceWith'){
if(el[0]!==value[0]){
el.replaceWith(value);
}
}else if(attr==='img'){
if(el.is('img')){
el.attr('src',value);
}else{
el.replaceWith('<img src="'+value+'" class="'+el.attr('class')+'" />');
}
}else{
el.attr(arr[1],value);
}
}

}else{
template.find(EVENT_NS+'-'+key).html(value);
}
});
},

_getScrollbarSize:function _getScrollbarSize(){
// thx David
if(mfp.scrollbarSize===undefined){
var scrollDiv=document.createElement("div");
scrollDiv.style.cssText='width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
document.body.appendChild(scrollDiv);
mfp.scrollbarSize=scrollDiv.offsetWidth-scrollDiv.clientWidth;
document.body.removeChild(scrollDiv);
}
return mfp.scrollbarSize;
}};

/* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup={
instance:null,
proto:MagnificPopup.prototype,
modules:[],

open:function open(options,index){
_checkInstance();

if(!options){
options={};
}else{
options=$.extend(true,{},options);
}


options.isObj=true;
options.index=index||0;
return this.instance.open(options);
},

close:function close(){
return $.magnificPopup.instance&&$.magnificPopup.instance.close();
},

registerModule:function registerModule(name,module){
if(module.options){
$.magnificPopup.defaults[name]=module.options;
}
$.extend(this.proto,module.proto);
this.modules.push(name);
},

defaults:{

// Info about options is in docs:
// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

disableOn:0,

key:null,

midClick:false,

mainClass:'',

preloader:true,

focus:'',// CSS selector of input to focus after popup is opened

closeOnContentClick:false,

closeOnBgClick:true,

closeBtnInside:true,

showCloseBtn:true,

enableEscapeKey:true,

modal:false,

alignTop:false,

removalDelay:0,

prependTo:null,

fixedContentPos:'auto',

fixedBgPos:'auto',

overflowY:'auto',

closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',

tClose:'Close (Esc)',

tLoading:'Loading...'}};






$.fn.magnificPopup=function(options){
_checkInstance();

var jqEl=$(this);

// We call some API method of first param is a string
if(typeof options==="string"){

if(options==='open'){
var items,
itemOpts=_isJQ?jqEl.data('magnificPopup'):jqEl[0].magnificPopup,
index=parseInt(arguments[1],10)||0;

if(itemOpts.items){
items=itemOpts.items[index];
}else{
items=jqEl;
if(itemOpts.delegate){
items=items.find(itemOpts.delegate);
}
items=items.eq(index);
}
mfp._openClick({mfpEl:items},jqEl,itemOpts);
}else{
if(mfp.isOpen)
mfp[options].apply(mfp,Array.prototype.slice.call(arguments,1));
}

}else{
// clone options obj
options=$.extend(true,{},options);

/*
         * As Zepto doesn't support .data() method for objects
         * and it works only in normal browsers
         * we assign "options" object directly to the DOM element. FTW!
         */
if(_isJQ){
jqEl.data('magnificPopup',options);
}else{
jqEl[0].magnificPopup=options;
}

mfp.addGroup(jqEl,options);

}
return jqEl;
};


//Quick benchmark
/*
var start = performance.now(),
    i,
    rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


/*>>core*/

/*>>inline*/

var INLINE_NS='inline',
_hiddenClass,
_inlinePlaceholder,
_lastInlineElement,
_putInlineElementsBack=function _putInlineElementsBack(){
if(_lastInlineElement){
_inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
_lastInlineElement=null;
}
};

$.magnificPopup.registerModule(INLINE_NS,{
options:{
hiddenClass:'hide',// will be appended with `mfp-` prefix
markup:'',
tNotFound:'Content not found'},

proto:{

initInline:function initInline(){
mfp.types.push(INLINE_NS);

_mfpOn(CLOSE_EVENT+'.'+INLINE_NS,function(){
_putInlineElementsBack();
});
},

getInline:function getInline(item,template){

_putInlineElementsBack();

if(item.src){
var inlineSt=mfp.st.inline,
el=$(item.src);

if(el.length){

// If target element has parent - we replace it with placeholder and put it back after popup is closed
var parent=el[0].parentNode;
if(parent&&parent.tagName){
if(!_inlinePlaceholder){
_hiddenClass=inlineSt.hiddenClass;
_inlinePlaceholder=_getEl(_hiddenClass);
_hiddenClass='mfp-'+_hiddenClass;
}
// replace target inline element with placeholder
_lastInlineElement=el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
}

mfp.updateStatus('ready');
}else{
mfp.updateStatus('error',inlineSt.tNotFound);
el=$('<div>');
}

item.inlineElement=el;
return el;
}

mfp.updateStatus('ready');
mfp._parseMarkup(template,{},item);
return template;
}}});



/*>>inline*/

/*>>ajax*/
var AJAX_NS='ajax',
_ajaxCur,
_removeAjaxCursor=function _removeAjaxCursor(){
if(_ajaxCur){
$(document.body).removeClass(_ajaxCur);
}
},
_destroyAjaxRequest=function _destroyAjaxRequest(){
_removeAjaxCursor();
if(mfp.req){
mfp.req.abort();
}
};

$.magnificPopup.registerModule(AJAX_NS,{

options:{
settings:null,
cursor:'mfp-ajax-cur',
tError:'<a href="%url%">The content</a> could not be loaded.'},


proto:{
initAjax:function initAjax(){
mfp.types.push(AJAX_NS);
_ajaxCur=mfp.st.ajax.cursor;

_mfpOn(CLOSE_EVENT+'.'+AJAX_NS,_destroyAjaxRequest);
_mfpOn('BeforeChange.'+AJAX_NS,_destroyAjaxRequest);
},
getAjax:function getAjax(item){

if(_ajaxCur){
$(document.body).addClass(_ajaxCur);
}

mfp.updateStatus('loading');

var opts=$.extend({
url:item.src,
success:function success(data,textStatus,jqXHR){
var temp={
data:data,
xhr:jqXHR};


_mfpTrigger('ParseAjax',temp);

mfp.appendContent($(temp.data),AJAX_NS);

item.finished=true;

_removeAjaxCursor();

mfp._setFocus();

setTimeout(function(){
mfp.wrap.addClass(READY_CLASS);
},16);

mfp.updateStatus('ready');

_mfpTrigger('AjaxContentAdded');
},
error:function error(){
_removeAjaxCursor();
item.finished=item.loadError=true;
mfp.updateStatus('error',mfp.st.ajax.tError.replace('%url%',item.src));
}},
mfp.st.ajax.settings);

mfp.req=$.ajax(opts);

return'';
}}});









/*>>ajax*/

/*>>image*/
var _imgInterval,
_getTitle=function _getTitle(item){
if(item.data&&item.data.title!==undefined)
return item.data.title;

var src=mfp.st.image.titleSrc;

if(src){
if($.isFunction(src)){
return src.call(mfp,item);
}else if(item.el){
return item.el.attr(src)||'';
}
}
return'';
};

$.magnificPopup.registerModule('image',{

options:{
markup:'<div class="mfp-figure">'+
'<div class="mfp-close"></div>'+
'<figure>'+
'<div class="mfp-img"></div>'+
'<figcaption>'+
'<div class="mfp-bottom-bar">'+
'<div class="mfp-title"></div>'+
'<div class="mfp-counter"></div>'+
'</div>'+
'</figcaption>'+
'</figure>'+
'</div>',
cursor:'mfp-zoom-out-cur',
titleSrc:'title',
verticalFit:true,
tError:'<a href="%url%">The image</a> could not be loaded.'},


proto:{
initImage:function initImage(){
var imgSt=mfp.st.image,
ns='.image';

mfp.types.push('image');

_mfpOn(OPEN_EVENT+ns,function(){
if(mfp.currItem.type==='image'&&imgSt.cursor){
$(document.body).addClass(imgSt.cursor);
}
});

_mfpOn(CLOSE_EVENT+ns,function(){
if(imgSt.cursor){
$(document.body).removeClass(imgSt.cursor);
}
_window.off('resize'+EVENT_NS);
});

_mfpOn('Resize'+ns,mfp.resizeImage);
if(mfp.isLowIE){
_mfpOn('AfterChange',mfp.resizeImage);
}
},
resizeImage:function resizeImage(){
var item=mfp.currItem;
if(!item||!item.img)return;

if(mfp.st.image.verticalFit){
var decr=0;
// fix box-sizing in ie7/8
if(mfp.isLowIE){
decr=parseInt(item.img.css('padding-top'),10)+parseInt(item.img.css('padding-bottom'),10);
}
item.img.css('max-height',mfp.wH-decr);
}
},
_onImageHasSize:function _onImageHasSize(item){
if(item.img){

item.hasSize=true;

if(_imgInterval){
clearInterval(_imgInterval);
}

item.isCheckingImgSize=false;

_mfpTrigger('ImageHasSize',item);

if(item.imgHidden){
if(mfp.content)
mfp.content.removeClass('mfp-loading');

item.imgHidden=false;
}

}
},

/**
         * Function that loops until the image has size to display elements that rely on it asap
         */
findImageSize:function findImageSize(item){

var counter=0,
img=item.img[0],
mfpSetInterval=function mfpSetInterval(delay){

if(_imgInterval){
clearInterval(_imgInterval);
}
// decelerating interval that checks for size of an image
_imgInterval=setInterval(function(){
if(img.naturalWidth>0){
mfp._onImageHasSize(item);
return;
}

if(counter>200){
clearInterval(_imgInterval);
}

counter++;
if(counter===3){
mfpSetInterval(10);
}else if(counter===40){
mfpSetInterval(50);
}else if(counter===100){
mfpSetInterval(500);
}
},delay);
};

mfpSetInterval(1);
},

getImage:function getImage(item,template){

var guard=0,

// image load complete handler
onLoadComplete=function onLoadComplete(){
if(item){
if(item.img[0].complete){
item.img.off('.mfploader');

if(item===mfp.currItem){
mfp._onImageHasSize(item);

mfp.updateStatus('ready');
}

item.hasSize=true;
item.loaded=true;

_mfpTrigger('ImageLoadComplete');

}else
{
// if image complete check fails 200 times (20 sec), we assume that there was an error.
guard++;
if(guard<200){
setTimeout(onLoadComplete,100);
}else{
onLoadError();
}
}
}
},

// image error handler
onLoadError=function onLoadError(){
if(item){
item.img.off('.mfploader');
if(item===mfp.currItem){
mfp._onImageHasSize(item);
mfp.updateStatus('error',imgSt.tError.replace('%url%',item.src));
}

item.hasSize=true;
item.loaded=true;
item.loadError=true;
}
},
imgSt=mfp.st.image;


var el=template.find('.mfp-img');
if(el.length){
var img=document.createElement('img');
img.className='mfp-img';
if(item.el&&item.el.find('img').length){
img.alt=item.el.find('img').attr('alt');
}
item.img=$(img).on('load.mfploader',onLoadComplete).on('error.mfploader',onLoadError);
img.src=item.src;

// without clone() "error" event is not firing when IMG is replaced by new IMG
// TODO: find a way to avoid such cloning
if(el.is('img')){
item.img=item.img.clone();
}

img=item.img[0];
if(img.naturalWidth>0){
item.hasSize=true;
}else if(!img.width){
item.hasSize=false;
}
}

mfp._parseMarkup(template,{
title:_getTitle(item),
img_replaceWith:item.img},
item);

mfp.resizeImage();

if(item.hasSize){
if(_imgInterval)clearInterval(_imgInterval);

if(item.loadError){
template.addClass('mfp-loading');
mfp.updateStatus('error',imgSt.tError.replace('%url%',item.src));
}else{
template.removeClass('mfp-loading');
mfp.updateStatus('ready');
}
return template;
}

mfp.updateStatus('loading');
item.loading=true;

if(!item.hasSize){
item.imgHidden=true;
template.addClass('mfp-loading');
mfp.findImageSize(item);
}

return template;
}}});





/*>>image*/

/*>>zoom*/
var hasMozTransform,
getHasMozTransform=function getHasMozTransform(){
if(hasMozTransform===undefined){
hasMozTransform=document.createElement('p').style.MozTransform!==undefined;
}
return hasMozTransform;
};

$.magnificPopup.registerModule('zoom',{

options:{
enabled:false,
easing:'ease-in-out',
duration:300,
opener:function opener(element){
return element.is('img')?element:element.find('img');
}},


proto:{

initZoom:function initZoom(){
var zoomSt=mfp.st.zoom,
ns='.zoom',
image;

if(!zoomSt.enabled||!mfp.supportsTransition){
return;
}

var duration=zoomSt.duration,
getElToAnimate=function getElToAnimate(image){
var newImg=image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
transition='all '+zoomSt.duration/1000+'s '+zoomSt.easing,
cssObj={
position:'fixed',
zIndex:9999,
left:0,
top:0,
'-webkit-backface-visibility':'hidden'},

t='transition';

cssObj['-webkit-'+t]=cssObj['-moz-'+t]=cssObj['-o-'+t]=cssObj[t]=transition;

newImg.css(cssObj);
return newImg;
},
showMainContent=function showMainContent(){
mfp.content.css('visibility','visible');
},
openTimeout,
animatedImg;

_mfpOn('BuildControls'+ns,function(){
if(mfp._allowZoom()){

clearTimeout(openTimeout);
mfp.content.css('visibility','hidden');

// Basically, all code below does is clones existing image, puts in on top of the current one and animated it

image=mfp._getItemToZoom();

if(!image){
showMainContent();
return;
}

animatedImg=getElToAnimate(image);

animatedImg.css(mfp._getOffset());

mfp.wrap.append(animatedImg);

openTimeout=setTimeout(function(){
animatedImg.css(mfp._getOffset(true));
openTimeout=setTimeout(function(){

showMainContent();

setTimeout(function(){
animatedImg.remove();
image=animatedImg=null;
_mfpTrigger('ZoomAnimationEnded');
},16);// avoid blink when switching images

},duration);// this timeout equals animation duration

},16);// by adding this timeout we avoid short glitch at the beginning of animation


// Lots of timeouts...
}
});
_mfpOn(BEFORE_CLOSE_EVENT+ns,function(){
if(mfp._allowZoom()){

clearTimeout(openTimeout);

mfp.st.removalDelay=duration;

if(!image){
image=mfp._getItemToZoom();
if(!image){
return;
}
animatedImg=getElToAnimate(image);
}


animatedImg.css(mfp._getOffset(true));
mfp.wrap.append(animatedImg);
mfp.content.css('visibility','hidden');

setTimeout(function(){
animatedImg.css(mfp._getOffset());
},16);
}

});

_mfpOn(CLOSE_EVENT+ns,function(){
if(mfp._allowZoom()){
showMainContent();
if(animatedImg){
animatedImg.remove();
}
image=null;
}
});
},

_allowZoom:function _allowZoom(){
return mfp.currItem.type==='image';
},

_getItemToZoom:function _getItemToZoom(){
if(mfp.currItem.hasSize){
return mfp.currItem.img;
}else{
return false;
}
},

// Get element postion relative to viewport
_getOffset:function _getOffset(isLarge){
var el;
if(isLarge){
el=mfp.currItem.img;
}else{
el=mfp.st.zoom.opener(mfp.currItem.el||mfp.currItem);
}

var offset=el.offset();
var paddingTop=parseInt(el.css('padding-top'),10);
var paddingBottom=parseInt(el.css('padding-bottom'),10);
offset.top-=$(window).scrollTop()-paddingTop;


/*

            Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

             */
var obj={
width:el.width(),
// fix Zepto height+padding issue
height:(_isJQ?el.innerHeight():el[0].offsetHeight)-paddingBottom-paddingTop};


// I hate to do this, but there is no another option
if(getHasMozTransform()){
obj['-moz-transform']=obj['transform']='translate('+offset.left+'px,'+offset.top+'px)';
}else{
obj.left=offset.left;
obj.top=offset.top;
}
return obj;
}}});






/*>>zoom*/

/*>>iframe*/

var IFRAME_NS='iframe',
_emptyPage='//about:blank',

_fixIframeBugs=function _fixIframeBugs(isShowing){
if(mfp.currTemplate[IFRAME_NS]){
var el=mfp.currTemplate[IFRAME_NS].find('iframe');
if(el.length){
// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
if(!isShowing){
el[0].src=_emptyPage;
}

// IE8 black screen bug fix
if(mfp.isIE8){
el.css('display',isShowing?'block':'none');
}
}
}
};

$.magnificPopup.registerModule(IFRAME_NS,{

options:{
markup:'<div class="mfp-iframe-scaler">'+
'<div class="mfp-close"></div>'+
'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
'</div>',

srcAction:'iframe_src',

// we don't care and support only one default type of URL by default
patterns:{
youtube:{
index:'youtube.com',
id:'v=',
src:'//www.youtube.com/embed/%id%?autoplay=1'},

vimeo:{
index:'vimeo.com/',
id:'/',
src:'//player.vimeo.com/video/%id%?autoplay=1'},

gmaps:{
index:'//maps.google.',
src:'%id%&output=embed'}}},




proto:{
initIframe:function initIframe(){
mfp.types.push(IFRAME_NS);

_mfpOn('BeforeChange',function(e,prevType,newType){
if(prevType!==newType){
if(prevType===IFRAME_NS){
_fixIframeBugs();// iframe if removed
}else if(newType===IFRAME_NS){
_fixIframeBugs(true);// iframe is showing
}
}// else {
// iframe source is switched, don't do anything
//}
});

_mfpOn(CLOSE_EVENT+'.'+IFRAME_NS,function(){
_fixIframeBugs();
});
},

getIframe:function getIframe(item,template){
var embedSrc=item.src;
var iframeSt=mfp.st.iframe;

$.each(iframeSt.patterns,function(){
if(embedSrc.indexOf(this.index)>-1){
if(this.id){
if(typeof this.id==='string'){
embedSrc=embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length,embedSrc.length);
}else{
embedSrc=this.id.call(this,embedSrc);
}
}
embedSrc=this.src.replace('%id%',embedSrc);
return false;// break;
}
});

var dataObj={};
if(iframeSt.srcAction){
dataObj[iframeSt.srcAction]=embedSrc;
}
mfp._parseMarkup(template,dataObj,item);

mfp.updateStatus('ready');

return template;
}}});





/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId=function _getLoopedId(index){
var numSlides=mfp.items.length;
if(index>numSlides-1){
return index-numSlides;
}else if(index<0){
return numSlides+index;
}
return index;
},
_replaceCurrTotal=function _replaceCurrTotal(text,curr,total){
return text.replace(/%curr%/gi,curr+1).replace(/%total%/gi,total);
};

$.magnificPopup.registerModule('gallery',{

options:{
enabled:false,
arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
preload:[0,2],
navigateByImgClick:true,
arrows:true,

tPrev:'Previous (Left arrow key)',
tNext:'Next (Right arrow key)',
tCounter:'%curr% of %total%'},


proto:{
initGallery:function initGallery(){

var gSt=mfp.st.gallery,
ns='.mfp-gallery',
supportsFastClick=Boolean($.fn.mfpFastClick);

mfp.direction=true;// true - next, false - prev

if(!gSt||!gSt.enabled)return false;

_wrapClasses+=' mfp-gallery';

_mfpOn(OPEN_EVENT+ns,function(){

if(gSt.navigateByImgClick){
mfp.wrap.on('click'+ns,'.mfp-img',function(){
if(mfp.items.length>1){
mfp.next();
return false;
}
});
}

_document.on('keydown'+ns,function(e){
if(e.keyCode===37){
mfp.prev();
}else if(e.keyCode===39){
mfp.next();
}
});
});

_mfpOn('UpdateStatus'+ns,function(e,data){
if(data.text){
data.text=_replaceCurrTotal(data.text,mfp.currItem.index,mfp.items.length);
}
});

_mfpOn(MARKUP_PARSE_EVENT+ns,function(e,element,values,item){
var l=mfp.items.length;
values.counter=l>1?_replaceCurrTotal(gSt.tCounter,item.index,l):'';
});

_mfpOn('BuildControls'+ns,function(){
if(mfp.items.length>1&&gSt.arrows&&!mfp.arrowLeft){
var markup=gSt.arrowMarkup,
arrowLeft=mfp.arrowLeft=$(markup.replace(/%title%/gi,gSt.tPrev).replace(/%dir%/gi,'left')).addClass(PREVENT_CLOSE_CLASS),
arrowRight=mfp.arrowRight=$(markup.replace(/%title%/gi,gSt.tNext).replace(/%dir%/gi,'right')).addClass(PREVENT_CLOSE_CLASS);

var eName=supportsFastClick?'mfpFastClick':'click';
arrowLeft[eName](function(){
mfp.prev();
});
arrowRight[eName](function(){
mfp.next();
});

// Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
if(mfp.isIE7){
_getEl('b',arrowLeft[0],false,true);
_getEl('a',arrowLeft[0],false,true);
_getEl('b',arrowRight[0],false,true);
_getEl('a',arrowRight[0],false,true);
}

mfp.container.append(arrowLeft.add(arrowRight));
}
});

_mfpOn(CHANGE_EVENT+ns,function(){
if(mfp._preloadTimeout)clearTimeout(mfp._preloadTimeout);

mfp._preloadTimeout=setTimeout(function(){
mfp.preloadNearbyImages();
mfp._preloadTimeout=null;
},16);
});


_mfpOn(CLOSE_EVENT+ns,function(){
_document.off(ns);
mfp.wrap.off('click'+ns);

if(mfp.arrowLeft&&supportsFastClick){
mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
}
mfp.arrowRight=mfp.arrowLeft=null;
});

},
next:function next(){
mfp.direction=true;
mfp.index=_getLoopedId(mfp.index+1);
mfp.updateItemHTML();
},
prev:function prev(){
mfp.direction=false;
mfp.index=_getLoopedId(mfp.index-1);
mfp.updateItemHTML();
},
goTo:function goTo(newIndex){
mfp.direction=newIndex>=mfp.index;
mfp.index=newIndex;
mfp.updateItemHTML();
},
preloadNearbyImages:function preloadNearbyImages(){
var p=mfp.st.gallery.preload,
preloadBefore=Math.min(p[0],mfp.items.length),
preloadAfter=Math.min(p[1],mfp.items.length),
i;

for(i=1;i<=(mfp.direction?preloadAfter:preloadBefore);i++){
mfp._preloadItem(mfp.index+i);
}
for(i=1;i<=(mfp.direction?preloadBefore:preloadAfter);i++){
mfp._preloadItem(mfp.index-i);
}
},
_preloadItem:function _preloadItem(index){
index=_getLoopedId(index);

if(mfp.items[index].preloaded){
return;
}

var item=mfp.items[index];
if(!item.parsed){
item=mfp.parseEl(index);
}

_mfpTrigger('LazyLoad',item);

if(item.type==='image'){
item.img=$('<img class="mfp-img" />').on('load.mfploader',function(){
item.hasSize=true;
}).on('error.mfploader',function(){
item.hasSize=true;
item.loadError=true;
_mfpTrigger('LazyLoadError',item);
}).attr('src',item.src);
}


item.preloaded=true;
}}});



/*
Touch Support that might be implemented some day

addSwipeGesture: function() {
    var startX,
        moved,
        multipleTouches;

        return;

    var namespace = '.mfp',
        addEventNames = function(pref, down, move, up, cancel) {
            mfp._tStart = pref + down + namespace;
            mfp._tMove = pref + move + namespace;
            mfp._tEnd = pref + up + namespace;
            mfp._tCancel = pref + cancel + namespace;
        };

    if(window.navigator.msPointerEnabled) {
        addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
    } else if('ontouchstart' in window) {
        addEventNames('touch', 'start', 'move', 'end', 'cancel');
    } else {
        return;
    }
    _window.on(mfp._tStart, function(e) {
        var oE = e.originalEvent;
        multipleTouches = moved = false;
        startX = oE.pageX || oE.changedTouches[0].pageX;
    }).on(mfp._tMove, function(e) {
        if(e.originalEvent.touches.length > 1) {
            multipleTouches = e.originalEvent.touches.length;
        } else {
            //e.preventDefault();
            moved = true;
        }
    }).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
        if(moved && !multipleTouches) {
            var oE = e.originalEvent,
                diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

            if(diff > 20) {
                mfp.next();
            } else if(diff < -20) {
                mfp.prev();
            }
        }
    });
},
*/


/*>>gallery*/

/*>>retina*/

var RETINA_NS='retina';

$.magnificPopup.registerModule(RETINA_NS,{
options:{
replaceSrc:function replaceSrc(item){
return item.src.replace(/\.\w+$/,function(m){return'@2x'+m;});
},
ratio:1// Function or number.  Set to 1 to disable.
},
proto:{
initRetina:function initRetina(){
if(window.devicePixelRatio>1){

var st=mfp.st.retina,
ratio=st.ratio;

ratio=!isNaN(ratio)?ratio:ratio();

if(ratio>1){
_mfpOn('ImageHasSize'+'.'+RETINA_NS,function(e,item){
item.img.css({
'max-width':item.img[0].naturalWidth/ratio,
'width':'100%'});

});
_mfpOn('ElementParse'+'.'+RETINA_NS,function(e,item){
item.src=st.replaceSrc(item,ratio);
});
}
}

}}});



/*>>retina*/

/*>>fastclick*/
/**
 * FastClick event implementation. (removes 300ms delay on touch devices)
 * Based on https://developers.google.com/mobile/articles/fast_buttons
 *
 * You may use it outside the Magnific Popup by calling just:
 *
 * $('.your-el').mfpFastClick(function() {
 *     console.log('Clicked!');
 * });
 *
 * To unbind:
 * $('.your-el').destroyMfpFastClick();
 *
 *
 * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
 * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
 *
 */

(function(){
var ghostClickDelay=1000,
supportsTouch='ontouchstart'in window,
unbindTouchMove=function unbindTouchMove(){
_window.off('touchmove'+ns+' touchend'+ns);
},
eName='mfpFastClick',
ns='.'+eName;


// As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
$.fn.mfpFastClick=function(callback){

return $(this).each(function(){

var elem=$(this),
lock;

if(supportsTouch){

var timeout,
startX,
startY,
pointerMoved,
point,
numPointers;

elem.on('touchstart'+ns,function(e){
pointerMoved=false;
numPointers=1;

point=e.originalEvent?e.originalEvent.touches[0]:e.touches[0];
startX=point.clientX;
startY=point.clientY;

_window.on('touchmove'+ns,function(e){
point=e.originalEvent?e.originalEvent.touches:e.touches;
numPointers=point.length;
point=point[0];
if(Math.abs(point.clientX-startX)>10||
Math.abs(point.clientY-startY)>10){
pointerMoved=true;
unbindTouchMove();
}
}).on('touchend'+ns,function(e){
unbindTouchMove();
if(pointerMoved||numPointers>1){
return;
}
lock=true;
e.preventDefault();
clearTimeout(timeout);
timeout=setTimeout(function(){
lock=false;
},ghostClickDelay);
callback();
});
});

}

elem.on('click'+ns,function(){
if(!lock){
callback();
}
});
});
};

$.fn.destroyMfpFastClick=function(){
$(this).off('touchstart'+ns+' click'+ns);
if(supportsTouch)_window.off('touchmove'+ns+' touchend'+ns);
};
})();

/*>>fastclick*/
_checkInstance();});
'use strict';//
// Meerkat JS
// jquery.meerkat.1.3.js
// ==========================
jQuery.fn.extend({

meerkat:function meerkat(options){

var defaults={
background:'none',
opacity:null,
height:'auto',
width:'100%',
position:'bottom',
close:'.close',
dontShowAgain:'#dont-show',
dontShowAgainAuto:false,
animationIn:'none',
animationOut:null,
easingIn:'swing',
easingOut:'swing',
animationSpeed:'normal',
cookieExpires:0,
removeCookie:'.removeCookie',
delay:0,
onMeerkatShow:function onMeerkatShow(){},
timer:null};


var settings=jQuery.extend(defaults,options);


if(jQuery.easing.def){
settings.easingIn=settings.easingIn;
settings.easingOut=settings.easingOut;
}else{
settings.easingIn='swing';
settings.easingOut='swing';
}

if(settings.animationOut===null){
settings.animationOut=settings.animationIn;
}

settings.delay=settings.delay*1000;
if(settings.timer!=null){
settings.timer=settings.timer*1000;
}

function createCookie(name,value,days){
if(days){
var date=new Date();
date.setTime(date.getTime()+days*24*60*60*1000);
var expires="; expires="+date.toGMTString();
}else
{
var expires="";
}
document.cookie=name+"="+value+expires+"; path=/";
}

function readCookie(name){
var nameEQ=name+"=";
var ca=document.cookie.split(';');
for(var i=0;i<ca.length;i++){
var c=ca[i];
while(c.charAt(0)===' '){c=c.substring(1,c.length);}
if(c.indexOf(nameEQ)===0)return c.substring(nameEQ.length,c.length);
}
return null;
}

function eraseCookie(name){
createCookie(name,"",-1);
}
jQuery(settings.removeCookie).click(function(){eraseCookie('meerkat');});

return this.each(function(){
var element=jQuery(this);
if(readCookie('meerkat')!="dontshow"){var


animateMeerkat=function animateMeerkat(showOrHide,fadeOrSlide){
var meerkatWrap=jQuery('#meerkat-wrap');
if(fadeOrSlide==="slide"){
if(settings.position==="left"||settings.position==="right"){
var animationType='width';
}else{
var animationType='height';
}
}else{
var animationType="opacity";
}
var animationProperty={};
animationProperty[animationType]=showOrHide;

if(showOrHide==="show"){
if(fadeOrSlide!=="none"){
if(settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).animate(animationProperty,settings.animationSpeed,settings.easingIn);
}else{
jQuery(meerkatWrap).hide().animate(animationProperty,settings.animationSpeed,settings.easingIn);
}
}else if(fadeOrSlide==="none"&&settings.delay>0){
jQuery(meerkatWrap).hide().delay(settings.delay).show(0);
}else{
jQuery(meerkatWrap).show();
}
jQuery(element).show(0);
}

if(showOrHide==="hide"){
if(fadeOrSlide!=="none"){
if(settings.timer!==null){
jQuery(meerkatWrap).delay(settings.timer).animate(animationProperty,settings.animationSpeed,settings.easingOut,
function(){
jQuery(this).destroyMeerkat();
if(settings.dontShowAgainAuto===true){createCookie('meerkat','dontshow',settings.cookieExpires);}
});
}
jQuery(settings.close).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){jQuery(this).destroyMeerkat();});
return false;
});
jQuery(settings.dontShowAgain).click(function(){
jQuery(meerkatWrap).stop().animate(animationProperty,settings.animationSpeed,settings.easingOut,function(){jQuery(this).destroyMeerkat();});
createCookie('meerkat','dontshow',settings.cookieExpires);
return false;
});
}else if(fadeOrSlide==="none"&&settings.timer!==null){
jQuery(meerkatWrap).delay(settings.timer).hide(0).queue(function(){
jQuery(this).destroyMeerkat();
});
}else{
jQuery(settings.close).click(function(){
jQuery(meerkatWrap).hide().queue(function(){
jQuery(this).destroyMeerkat();
});
return false;
});
jQuery(settings.dontShowAgain).click(function(){
jQuery(meerkatWrap).hide().queue(function(){
jQuery(this).destroyMeerkat();
});
createCookie('meerkat','dontshow',settings.cookieExpires);
return false;
});
}
}
};settings.onMeerkatShow.call(this);


jQuery('html, body').css({'margin':'0','height':'100%'});
jQuery(element).wrap('<div id="meerkat-wrap"><div id="meerkat-container"></div></div>');
jQuery('#meerkat-wrap').css({'position':'fixed','z-index':'10000','width':settings.width,'height':settings.height}).css(settings.position,"0");
jQuery('#meerkat-container').css({'background':settings.background,'height':settings.height});

if(settings.position==="left"||settings.position==="right"){jQuery('#meerkat-wrap').css("top",0);}

if(settings.opacity!=null){
jQuery("#meerkat-wrap").prepend('<div class="opacity-layer"></div>');
jQuery('#meerkat-container').css({'background':'transparent','z-index':'2','position':'relative'});
jQuery(".opacity-layer").css({
'position':'absolute',
'top':'0',
'height':'100%',
'width':'100%',
'background':settings.background,
"opacity":settings.opacity});


}
if(jQuery.browser.msie&&jQuery.browser.version<=6){
jQuery('#meerkat-wrap').css({'position':'absolute','bottom':'-1px','z-index':'0'});
if(jQuery('#ie6-content-container').length==0){
jQuery('body').children().
filter(function(index){
return jQuery(this).attr('id')!='meerkat-wrap';
}).
wrapAll('<div id="ie6-content-container"></div>');
jQuery('html, body').css({'height':'100%','width':'100%','overflow':'hidden'});
jQuery('#ie6-content-container').css({'overflow':'auto','width':'100%','height':'100%','position':'absolute'});
var bgProperties=document.body.currentStyle.backgroundColor+" ";
bgProperties+=document.body.currentStyle.backgroundImage+" ";
bgProperties+=document.body.currentStyle.backgroundRepeat+" ";
bgProperties+=document.body.currentStyle.backgroundAttachment+" ";
bgProperties+=document.body.currentStyle.backgroundPositionX+" ";
bgProperties+=document.body.currentStyle.backgroundPositionY;
jQuery("body").css({'background':'none'});
jQuery("#ie6-content-container").css({'background':bgProperties});
}
var ie6ContentContainer=document.getElementById('ie6-content-container');
if(ie6ContentContainer.clientHeight<ie6ContentContainer.scrollHeight&&settings.position!='left'){
jQuery('#meerkat-wrap').css({'right':'17px'});
}
}

switch(settings.animationIn){

case"slide":
animateMeerkat("show","slide");
break;
case"fade":
animateMeerkat("show","fade");
break;
case"none":
animateMeerkat("show","none");
break;
default:
alert('The animationIn option only accepts "slide", "fade", or "none"');}


switch(settings.animationOut){

case"slide":
animateMeerkat("hide","slide");
break;

case"fade":
animateMeerkat("hide","fade");
break;

case"none":
if(settings.timer!=null){
jQuery('#meerkat-wrap').delay(settings.timer).hide(0).queue(function(){
jQuery(this).destroyMeerkat();
});
}
jQuery(settings.close).click(function(){
jQuery('#meerkat-wrap').hide().queue(function(){
jQuery(this).destroyMeerkat();
});
});
jQuery(settings.dontShowAgain).click(function(){
jQuery('#meerkat-wrap').hide().queue(function(){
jQuery(this).destroyMeerkat();
});
createCookie('meerkat','dontshow',settings.cookieExpires);
});
break;

default:
alert('The animationOut option only accepts "slide", "fade", or "none"');}

}else{
jQuery(element).hide();
}
});
},
destroyMeerkat:function destroyMeerkat(){
jQuery('#meerkat-wrap').replaceWith(jQuery('#meerkat-container').contents().hide());
}});
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! Picturefill - v2.3.1 - 2015-04-09
* http://scottjehl.github.io/picturefill
* Copyright (c) 2015 https://github.com/scottjehl/picturefill/blob/master/Authors.txt; Licensed MIT */
window.matchMedia||(window.matchMedia=function(){"use strict";var a=window.styleMedia||window.media;if(!a){var b=document.createElement("style"),c=document.getElementsByTagName("script")[0],d=null;b.type="text/css",b.id="matchmediajs-test",c.parentNode.insertBefore(b,c),d="getComputedStyle"in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function matchMedium(a){var c="@media "+a+"{ #matchmediajs-test { width: 1px; } }";return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,"1px"===d.width;}};}return function(b){return{matches:a.matchMedium(b||"all"),media:b||"all"};};}()),function(a,b,c){"use strict";function d(b){"object"==(typeof module==="undefined"?"undefined":_typeof(module))&&"object"==_typeof(module.exports)?module.exports=b:"function"==typeof define&&define.amd&&define("picturefill",function(){return b;}),"object"==(typeof a==="undefined"?"undefined":_typeof(a))&&(a.picturefill=b);}function e(a){var b,c,d,e,f,i=a||{};b=i.elements||g.getAllElements();for(var j=0,k=b.length;k>j;j++){if(c=b[j],d=c.parentNode,e=void 0,f=void 0,"IMG"===c.nodeName.toUpperCase()&&(c[g.ns]||(c[g.ns]={}),i.reevaluate||!c[g.ns].evaluated)){if(d&&"PICTURE"===d.nodeName.toUpperCase()){if(g.removeVideoShim(d),e=g.getMatch(c,d),e===!1)continue;}else e=void 0;(d&&"PICTURE"===d.nodeName.toUpperCase()||!g.sizesSupported&&c.srcset&&h.test(c.srcset))&&g.dodgeSrcset(c),e?(f=g.processSourceSet(e),g.applyBestCandidate(f,c)):(f=g.processSourceSet(c),(void 0===c.srcset||c[g.ns].srcset)&&g.applyBestCandidate(f,c)),c[g.ns].evaluated=!0;}}}function f(){function c(){clearTimeout(d),d=setTimeout(h,60);}g.initTypeDetects(),e();var d,f=setInterval(function(){return e(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(f):void 0;},250),h=function h(){e({reevaluate:!0});};a.addEventListener?a.addEventListener("resize",c,!1):a.attachEvent&&a.attachEvent("onresize",c);}if(a.HTMLPictureElement)return void d(function(){});b.createElement("picture");var g=a.picturefill||{},h=/\s+\+?\d+(e\d+)?w/;g.ns="picturefill",function(){g.srcsetSupported="srcset"in c,g.sizesSupported="sizes"in c,g.curSrcSupported="currentSrc"in c;}(),g.trim=function(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"");},g.makeUrl=function(){var a=b.createElement("a");return function(b){return a.href=b,a.href;};}(),g.restrictsMixedContent=function(){return"https:"===a.location.protocol;},g.matchesMedia=function(b){return a.matchMedia&&a.matchMedia(b).matches;},g.getDpr=function(){return a.devicePixelRatio||1;},g.getWidthFromLength=function(a){var c;if(!a||a.indexOf("%")>-1!=!1||!(parseFloat(a)>0||a.indexOf("calc(")>-1))return!1;a=a.replace("vw","%"),g.lengthEl||(g.lengthEl=b.createElement("div"),g.lengthEl.style.cssText="border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden",g.lengthEl.className="helper-from-picturefill-js"),g.lengthEl.style.width="0px";try{g.lengthEl.style.width=a;}catch(d){}return b.body.appendChild(g.lengthEl),c=g.lengthEl.offsetWidth,0>=c&&(c=!1),b.body.removeChild(g.lengthEl),c;},g.detectTypeSupport=function(b,c){var d=new a.Image();return d.onerror=function(){g.types[b]=!1,e();},d.onload=function(){g.types[b]=1===d.width,e();},d.src=c,"pending";},g.types=g.types||{},g.initTypeDetects=function(){g.types["image/jpeg"]=!0,g.types["image/gif"]=!0,g.types["image/png"]=!0,g.types["image/svg+xml"]=b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1"),g.types["image/webp"]=g.detectTypeSupport("image/webp","data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");},g.verifyTypeSupport=function(a){var b=a.getAttribute("type");if(null===b||""===b)return!0;var c=g.types[b];return"string"==typeof c&&"pending"!==c?(g.types[b]=g.detectTypeSupport(b,c),"pending"):"function"==typeof c?(c(),"pending"):c;},g.parseSize=function(a){var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]};},g.findWidthFromSourceSize=function(c){for(var d,e=g.trim(c).split(/\s*,\s*/),f=0,h=e.length;h>f;f++){var i=e[f],j=g.parseSize(i),k=j.length,l=j.media;if(k&&(!l||g.matchesMedia(l))&&(d=g.getWidthFromLength(k)))break;}return d||Math.max(a.innerWidth||0,b.documentElement.clientWidth);},g.parseSrcset=function(a){for(var b=[];""!==a;){a=a.replace(/^\s+/g,"");var c,d=a.search(/\s/g),e=null;if(-1!==d){c=a.slice(0,d);var f=c.slice(-1);if((","===f||""===c)&&(c=c.replace(/,+$/,""),e=""),a=a.slice(d+1),null===e){var g=a.indexOf(",");-1!==g?(e=a.slice(0,g),a=a.slice(g+1)):(e=a,a="");}}else c=a,a="";(c||e)&&b.push({url:c,descriptor:e});}return b;},g.parseDescriptor=function(a,b){var c,d=b||"100vw",e=a&&a.replace(/(^\s+|\s+$)/g,""),f=g.findWidthFromSourceSize(d);if(e)for(var h=e.split(" "),i=h.length-1;i>=0;i--){var j=h[i],k=j&&j.slice(j.length-1);if("h"!==k&&"w"!==k||g.sizesSupported){if("x"===k){var l=j&&parseFloat(j,10);c=l&&!isNaN(l)?l:1;}}else c=parseFloat(parseInt(j,10)/f);}return c||1;},g.getCandidatesFromSourceSet=function(a,b){for(var c=g.parseSrcset(a),d=[],e=0,f=c.length;f>e;e++){var h=c[e];d.push({url:h.url,resolution:g.parseDescriptor(h.descriptor,b)});}return d;},g.dodgeSrcset=function(a){a.srcset&&(a[g.ns].srcset=a.srcset,a.srcset="",a.setAttribute("data-pfsrcset",a[g.ns].srcset));},g.processSourceSet=function(a){var b=a.getAttribute("srcset"),c=a.getAttribute("sizes"),d=[];return"IMG"===a.nodeName.toUpperCase()&&a[g.ns]&&a[g.ns].srcset&&(b=a[g.ns].srcset),b&&(d=g.getCandidatesFromSourceSet(b,c)),d;},g.backfaceVisibilityFix=function(a){var b=a.style||{},c="webkitBackfaceVisibility"in b,d=b.zoom;c&&(b.zoom=".999",c=a.offsetWidth,b.zoom=d);},g.setIntrinsicSize=function(){var c={},d=function d(a,b,c){b&&a.setAttribute("width",parseInt(b/c,10));};return function(e,f){var h;e[g.ns]&&!a.pfStopIntrinsicSize&&(void 0===e[g.ns].dims&&(e[g.ns].dims=e.getAttribute("width")||e.getAttribute("height")),e[g.ns].dims||(f.url in c?d(e,c[f.url],f.resolution):(h=b.createElement("img"),h.onload=function(){if(c[f.url]=h.width,!c[f.url])try{b.body.appendChild(h),c[f.url]=h.width||h.offsetWidth,b.body.removeChild(h);}catch(a){}e.src===f.url&&d(e,c[f.url],f.resolution),e=null,h.onload=null,h=null;},h.src=f.url)));};}(),g.applyBestCandidate=function(a,b){var c,d,e;a.sort(g.ascendingSort),d=a.length,e=a[d-1];for(var f=0;d>f;f++){if(c=a[f],c.resolution>=g.getDpr()){e=c;break;}}e&&(e.url=g.makeUrl(e.url),b.src!==e.url&&(g.restrictsMixedContent()&&"http:"===e.url.substr(0,"http:".length).toLowerCase()?void 0!==window.console&&console.warn("Blocked mixed content image "+e.url):(b.src=e.url,g.curSrcSupported||(b.currentSrc=b.src),g.backfaceVisibilityFix(b))),g.setIntrinsicSize(b,e));},g.ascendingSort=function(a,b){return a.resolution-b.resolution;},g.removeVideoShim=function(a){var b=a.getElementsByTagName("video");if(b.length){for(var c=b[0],d=c.getElementsByTagName("source");d.length;){a.insertBefore(d[0],c);}c.parentNode.removeChild(c);}},g.getAllElements=function(){for(var a=[],c=b.getElementsByTagName("img"),d=0,e=c.length;e>d;d++){var f=c[d];("PICTURE"===f.parentNode.nodeName.toUpperCase()||null!==f.getAttribute("srcset")||f[g.ns]&&null!==f[g.ns].srcset)&&a.push(f);}return a;},g.getMatch=function(a,b){for(var c,d=b.childNodes,e=0,f=d.length;f>e;e++){var h=d[e];if(1===h.nodeType){if(h===a)return c;if("SOURCE"===h.nodeName.toUpperCase()){null!==h.getAttribute("src")&&void 0!==(typeof console==="undefined"?"undefined":_typeof(console))&&console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");var i=h.getAttribute("media");if(h.getAttribute("srcset")&&(!i||g.matchesMedia(i))){var j=g.verifyTypeSupport(h);if(j===!0){c=h;break;}if("pending"===j)return!1;}}}}return c;},f(),e._=g,d(e);}(window,window.document,new window.Image());
"use strict";/*! http://mths.be/placeholder v2.0.8 by @mathias */
!function(a,b,c){function d(a){var b={},d=/^jQuery\d+$/;return c.each(a.attributes,function(a,c){c.specified&&!d.test(c.name)&&(b[c.name]=c.value);}),b;}function e(a,b){var d=this,e=c(d);if(d.value==e.attr("placeholder")&&e.hasClass("placeholder"))if(e.data("placeholder-password")){if(e=e.hide().next().show().attr("id",e.removeAttr("id").data("placeholder-id")),a===!0)return e[0].value=b;e.focus();}else d.value="",e.removeClass("placeholder"),d==g()&&d.select();}function f(){var a,b=this,f=c(b),g=this.id;if(""==b.value){if("password"==b.type){if(!f.data("placeholder-textinput")){try{a=f.clone().attr({type:"text"});}catch(h){a=c("<input>").attr(c.extend(d(this),{type:"text"}));}a.removeAttr("name").data({"placeholder-password":f,"placeholder-id":g}).bind("focus.placeholder",e),f.data({"placeholder-textinput":a,"placeholder-id":g}).before(a);}f=f.removeAttr("id").hide().prev().attr("id",g).show();}f.addClass("placeholder"),f[0].value=f.attr("placeholder");}else f.removeClass("placeholder");}function g(){try{return b.activeElement;}catch(a){}}var h,i,j="[object OperaMini]"==Object.prototype.toString.call(a.operamini),k="placeholder"in b.createElement("input")&&!j,l="placeholder"in b.createElement("textarea")&&!j,m=c.fn,n=c.valHooks,o=c.propHooks;k&&l?(i=m.placeholder=function(){return this;},i.input=i.textarea=!0):(i=m.placeholder=function(){var a=this;return a.filter((k?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":e,"blur.placeholder":f}).data("placeholder-enabled",!0).trigger("blur.placeholder"),a;},i.input=k,i.textarea=l,h={get:function get(a){var b=c(a),d=b.data("placeholder-password");return d?d[0].value:b.data("placeholder-enabled")&&b.hasClass("placeholder")?"":a.value;},set:function set(a,b){var d=c(a),h=d.data("placeholder-password");return h?h[0].value=b:d.data("placeholder-enabled")?(""==b?(a.value=b,a!=g()&&f.call(a)):d.hasClass("placeholder")?e.call(a,!0,b)||(a.value=b):a.value=b,d):a.value=b;}},k||(n.input=h,o.value=h),l||(n.textarea=h,o.value=h),c(function(){c(b).delegate("form","submit.placeholder",function(){var a=c(".placeholder",this).each(e);setTimeout(function(){a.each(f);},10);});}),c(a).bind("beforeunload.placeholder",function(){c(".placeholder").each(function(){this.value="";});}));}(undefined,document,jQuery);
"use strict";var _typeof2=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;})({1:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};!function($){

"use strict";

var FOUNDATION_VERSION='6.3.1';

// Global Foundation object
// This is attached to the window, or used as a module for AMD/Browserify
var Foundation={
version:FOUNDATION_VERSION,

/**
                                  * Stores initialized plugins.
                                  */
_plugins:{},

/**
                   * Stores generated unique ids for plugin instances
                   */
_uuids:[],

/**
                 * Returns a boolean for RTL support
                 */
rtl:function rtl(){
return $('html').attr('dir')==='rtl';
},
/**
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
plugin:function plugin(_plugin,name){
// Object key to use when adding to global Foundation object
// Examples: Foundation.Reveal, Foundation.OffCanvas
var className=name||functionName(_plugin);
// Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
// Examples: data-reveal, data-off-canvas
var attrName=hyphenate(className);

// Add to the Foundation object and the plugins list (for reflowing)
this._plugins[attrName]=this[className]=_plugin;
},
/**
        * @function
        * Populates the _uuids array with pointers to each individual plugin instance.
        * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
        * Also fires the initialization event for each plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @param {String} name - the name of the plugin, passed as a camelCased string.
        * @fires Plugin#init
        */
registerPlugin:function registerPlugin(plugin,name){
var pluginName=name?hyphenate(name):functionName(plugin.constructor).toLowerCase();
plugin.uuid=this.GetYoDigits(6,pluginName);

if(!plugin.$element.attr('data-'+pluginName)){plugin.$element.attr('data-'+pluginName,plugin.uuid);}
if(!plugin.$element.data('zfPlugin')){plugin.$element.data('zfPlugin',plugin);}
/**
                                                                                          * Fires when the plugin has initialized.
                                                                                          * @event Plugin#init
                                                                                          */
plugin.$element.trigger('init.zf.'+pluginName);

this._uuids.push(plugin.uuid);

return;
},
/**
        * @function
        * Removes the plugins uuid from the _uuids array.
        * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
        * Also fires the destroyed event for the plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#destroyed
        */
unregisterPlugin:function unregisterPlugin(plugin){
var pluginName=hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

this._uuids.splice(this._uuids.indexOf(plugin.uuid),1);
plugin.$element.removeAttr('data-'+pluginName).removeData('zfPlugin')
/**
                                                                               * Fires when the plugin has been destroyed.
                                                                               * @event Plugin#destroyed
                                                                               */.
trigger('destroyed.zf.'+pluginName);
for(var prop in plugin){
plugin[prop]=null;//clean up script to prep for garbage collection.
}
return;
},

/**
        * @function
        * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
        * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
        * @default If no argument is passed, reflow all currently active plugins.
        */
reInit:function reInit(plugins){
var isJQ=plugins instanceof $;
try{
if(isJQ){
plugins.each(function(){
$(this).data('zfPlugin')._init();
});
}else{
var type=typeof plugins==='undefined'?'undefined':_typeof(plugins),
_this=this,
fns={
'object':function object(plgs){
plgs.forEach(function(p){
p=hyphenate(p);
$('[data-'+p+']').foundation('_init');
});
},
'string':function string(){
plugins=hyphenate(plugins);
$('[data-'+plugins+']').foundation('_init');
},
'undefined':function undefined(){
this['object'](Object.keys(_this._plugins));
}};

fns[type](plugins);
}
}catch(err){
console.error(err);
}finally{
return plugins;
}
},

/**
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
GetYoDigits:function GetYoDigits(length,namespace){
length=length||6;
return Math.round(Math.pow(36,length+1)-Math.random()*Math.pow(36,length)).toString(36).slice(1)+(namespace?'-'+namespace:'');
},
/**
        * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
        * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
        * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
        */
reflow:function reflow(elem,plugins){

// If plugins is undefined, just grab everything
if(typeof plugins==='undefined'){
plugins=Object.keys(this._plugins);
}
// If plugins is a string, convert it to an array with one item
else if(typeof plugins==='string'){
plugins=[plugins];
}

var _this=this;

// Iterate through each plugin
$.each(plugins,function(i,name){
// Get the current plugin
var plugin=_this._plugins[name];

// Localize the search to all elements inside elem, as well as elem itself, unless elem === document
var $elem=$(elem).find('[data-'+name+']').addBack('[data-'+name+']');

// For each plugin found, initialize it
$elem.each(function(){
var $el=$(this),
opts={};
// Don't double-dip on plugins
if($el.data('zfPlugin')){
console.warn("Tried to initialize "+name+" on an element that already has a Foundation plugin.");
return;
}

if($el.attr('data-options')){
var thing=$el.attr('data-options').split(';').forEach(function(e,i){
var opt=e.split(':').map(function(el){return el.trim();});
if(opt[0])opts[opt[0]]=parseValue(opt[1]);
});
}
try{
$el.data('zfPlugin',new plugin($(this),opts));
}catch(er){
console.error(er);
}finally{
return;
}
});
});
},
getFnName:functionName,
transitionend:function transitionend($elem){
var transitions={
'transition':'transitionend',
'WebkitTransition':'webkitTransitionEnd',
'MozTransition':'transitionend',
'OTransition':'otransitionend'};

var elem=document.createElement('div'),
end;

for(var t in transitions){
if(typeof elem.style[t]!=='undefined'){
end=transitions[t];
}
}
if(end){
return end;
}else{
end=setTimeout(function(){
$elem.triggerHandler('transitionend',[$elem]);
},1);
return'transitionend';
}
}};


Foundation.util={
/**
                       * Function for applying a debounce effect to a function call.
                       * @function
                       * @param {Function} func - Function to be called at end of timeout.
                       * @param {Number} delay - Time in ms to delay the call of `func`.
                       * @returns function
                       */
throttle:function throttle(func,delay){
var timer=null;

return function(){
var context=this,args=arguments;

if(timer===null){
timer=setTimeout(function(){
func.apply(context,args);
timer=null;
},delay);
}
};
}};


// TODO: consider not making this a jQuery function
// TODO: need way to reflow vs. re-initialize
/**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
var foundation=function foundation(method){
var type=typeof method==='undefined'?'undefined':_typeof(method),
$meta=$('meta.foundation-mq'),
$noJS=$('.no-js');

if(!$meta.length){
$('<meta class="foundation-mq">').appendTo(document.head);
}
if($noJS.length){
$noJS.removeClass('no-js');
}

if(type==='undefined'){//needs to initialize the Foundation object, or an individual plugin.
Foundation.MediaQuery._init();
Foundation.reflow(this);
}else if(type==='string'){//an individual method to invoke on a plugin or group of plugins
var args=Array.prototype.slice.call(arguments,1);//collect all the arguments, if necessary
var plugClass=this.data('zfPlugin');//determine the class of plugin

if(plugClass!==undefined&&plugClass[method]!==undefined){//make sure both the class and method exist
if(this.length===1){//if there's only one, call it directly.
plugClass[method].apply(plugClass,args);
}else{
this.each(function(i,el){//otherwise loop through the jQuery collection and invoke the method on each
plugClass[method].apply($(el).data('zfPlugin'),args);
});
}
}else{//error for no class or no method
throw new ReferenceError("We're sorry, '"+method+"' is not an available method for "+(plugClass?functionName(plugClass):'this element')+'.');
}
}else{//error for invalid argument type
throw new TypeError('We\'re sorry, '+type+' is not a valid parameter. You must use a string representing the method you wish to invoke.');
}
return this;
};

window.Foundation=Foundation;
$.fn.foundation=foundation;

// Polyfill for requestAnimationFrame
(function(){
if(!Date.now||!window.Date.now)
window.Date.now=Date.now=function(){return new Date().getTime();};

var vendors=['webkit','moz'];
for(var i=0;i<vendors.length&&!window.requestAnimationFrame;++i){
var vp=vendors[i];
window.requestAnimationFrame=window[vp+'RequestAnimationFrame'];
window.cancelAnimationFrame=window[vp+'CancelAnimationFrame']||
window[vp+'CancelRequestAnimationFrame'];
}
if(/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)||
!window.requestAnimationFrame||!window.cancelAnimationFrame){
var lastTime=0;
window.requestAnimationFrame=function(callback){
var now=Date.now();
var nextTime=Math.max(lastTime+16,now);
return setTimeout(function(){callback(lastTime=nextTime);},
nextTime-now);
};
window.cancelAnimationFrame=clearTimeout;
}
/**
       * Polyfill for performance.now, required by rAF
       */
if(!window.performance||!window.performance.now){
window.performance={
start:Date.now(),
now:function now(){return Date.now()-this.start;}};

}
})();
if(!Function.prototype.bind){
Function.prototype.bind=function(oThis){
if(typeof this!=='function'){
// closest thing possible to the ECMAScript 5
// internal IsCallable function
throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
}

var aArgs=Array.prototype.slice.call(arguments,1),
fToBind=this,
fNOP=function fNOP(){},
fBound=function fBound(){
return fToBind.apply(this instanceof fNOP?
this:
oThis,
aArgs.concat(Array.prototype.slice.call(arguments)));
};

if(this.prototype){
// native functions don't have a prototype
fNOP.prototype=this.prototype;
}
fBound.prototype=new fNOP();

return fBound;
};
}
// Polyfill to get the name of a function in IE9
function functionName(fn){
if(Function.prototype.name===undefined){
var funcNameRegex=/function\s([^(]{1,})\(/;
var results=funcNameRegex.exec(fn.toString());
return results&&results.length>1?results[1].trim():"";
}else
if(fn.prototype===undefined){
return fn.constructor.name;
}else
{
return fn.prototype.constructor.name;
}
}
function parseValue(str){
if('true'===str)return true;else
if('false'===str)return false;else
if(!isNaN(str*1))return parseFloat(str);
return str;
}
// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str){
return str.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
}

}(jQuery);

},{}],2:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

!function($){

/**
                * Drilldown module.
                * @module foundation.drilldown
                * @requires foundation.util.keyboard
                * @requires foundation.util.motion
                * @requires foundation.util.nest
                */var

Drilldown=function(){
/**
                            * Creates a new instance of a drilldown menu.
                            * @class
                            * @param {jQuery} element - jQuery object to make into an accordion menu.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
function Drilldown(element,options){_classCallCheck(this,Drilldown);
this.$element=element;
this.options=$.extend({},Drilldown.defaults,this.$element.data(),options);

Foundation.Nest.Feather(this.$element,'drilldown');

this._init();

Foundation.registerPlugin(this,'Drilldown');
Foundation.Keyboard.register('Drilldown',{
'ENTER':'open',
'SPACE':'open',
'ARROW_RIGHT':'next',
'ARROW_UP':'up',
'ARROW_DOWN':'down',
'ARROW_LEFT':'previous',
'ESCAPE':'close',
'TAB':'down',
'SHIFT_TAB':'up'});

}

/**
       * Initializes the drilldown by creating jQuery collections of elements
       * @private
       */_createClass(Drilldown,[{key:'_init',value:function _init()
{
this.$submenuAnchors=this.$element.find('li.is-drilldown-submenu-parent').children('a');
this.$submenus=this.$submenuAnchors.parent('li').children('[data-submenu]');
this.$menuItems=this.$element.find('li').not('.js-drilldown-back').attr('role','menuitem').find('a');
this.$element.attr('data-mutate',this.$element.attr('data-drilldown')||Foundation.GetYoDigits(6,'drilldown'));

this._prepareMenu();
this._registerEvents();

this._keyboardEvents();
}

/**
         * prepares drilldown menu by setting attributes to links and elements
         * sets a min height to prevent content jumping
         * wraps the element if not already wrapped
         * @private
         * @function
         */},{key:'_prepareMenu',value:function _prepareMenu()
{
var _this=this;
// if(!this.options.holdOpen){
//   this._menuLinkEvents();
// }
this.$submenuAnchors.each(function(){
var $link=$(this);
var $sub=$link.parent();
if(_this.options.parentLink){
$link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
}
$link.data('savedHref',$link.attr('href')).removeAttr('href').attr('tabindex',0);
$link.children('[data-submenu]').
attr({
'aria-hidden':true,
'tabindex':0,
'role':'menu'});

_this._events($link);
});
this.$submenus.each(function(){
var $menu=$(this),
$back=$menu.find('.js-drilldown-back');
if(!$back.length){
switch(_this.options.backButtonPosition){
case"bottom":
$menu.append(_this.options.backButton);
break;
case"top":
$menu.prepend(_this.options.backButton);
break;
default:
console.error("Unsupported backButtonPosition value '"+_this.options.backButtonPosition+"'");}

}
_this._back($menu);
});

this.$submenus.addClass('invisible');
if(!this.options.autoHeight){
this.$submenus.addClass('drilldown-submenu-cover-previous');
}

// create a wrapper on element if it doesn't exist.
if(!this.$element.parent().hasClass('is-drilldown')){
this.$wrapper=$(this.options.wrapper).addClass('is-drilldown');
if(this.options.animateHeight)this.$wrapper.addClass('animate-height');
this.$element.wrap(this.$wrapper);
}
// set wrapper
this.$wrapper=this.$element.parent();
this.$wrapper.css(this._getMaxDims());
}},{key:'_resize',value:function _resize()

{
this.$wrapper.css({'max-width':'none','min-height':'none'});
// _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
this.$wrapper.css(this._getMaxDims());
}

/**
         * Adds event handlers to elements in the menu.
         * @function
         * @private
         * @param {jQuery} $elem - the current menu item to add handlers to.
         */},{key:'_events',value:function _events(
$elem){
var _this=this;

$elem.off('click.zf.drilldown').
on('click.zf.drilldown',function(e){
if($(e.target).parentsUntil('ul','li').hasClass('is-drilldown-submenu-parent')){
e.stopImmediatePropagation();
e.preventDefault();
}

// if(e.target !== e.currentTarget.firstElementChild){
//   return false;
// }
_this._show($elem.parent('li'));

if(_this.options.closeOnClick){
var $body=$('body');
$body.off('.zf.drilldown').on('click.zf.drilldown',function(e){
if(e.target===_this.$element[0]||$.contains(_this.$element[0],e.target)){return;}
e.preventDefault();
_this._hideAll();
$body.off('.zf.drilldown');
});
}
});
this.$element.on('mutateme.zf.trigger',this._resize.bind(this));
}

/**
         * Adds event handlers to the menu element.
         * @function
         * @private
         */},{key:'_registerEvents',value:function _registerEvents()
{
if(this.options.scrollTop){
this._bindHandler=this._scrollTop.bind(this);
this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown',this._bindHandler);
}
}

/**
         * Scroll to Top of Element or data-scroll-top-element
         * @function
         * @fires Drilldown#scrollme
         */},{key:'_scrollTop',value:function _scrollTop()
{
var _this=this;
var $scrollTopElement=_this.options.scrollTopElement!=''?$(_this.options.scrollTopElement):_this.$element,
scrollPos=parseInt($scrollTopElement.offset().top+_this.options.scrollTopOffset);
$('html, body').stop(true).animate({scrollTop:scrollPos},_this.options.animationDuration,_this.options.animationEasing,function(){
/**
                                                                                                                                                    * Fires after the menu has scrolled
                                                                                                                                                    * @event Drilldown#scrollme
                                                                                                                                                    */
if(this===$('html')[0])_this.$element.trigger('scrollme.zf.drilldown');
});
}

/**
         * Adds keydown event listener to `li`'s in the menu.
         * @private
         */},{key:'_keyboardEvents',value:function _keyboardEvents()
{
var _this=this;

this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown',function(e){
var $element=$(this),
$elements=$element.parent('li').parent('ul').children('li').children('a'),
$prevElement,
$nextElement;

$elements.each(function(i){
if($(this).is($element)){
$prevElement=$elements.eq(Math.max(0,i-1));
$nextElement=$elements.eq(Math.min(i+1,$elements.length-1));
return;
}
});

Foundation.Keyboard.handleKey(e,'Drilldown',{
next:function next(){
if($element.is(_this.$submenuAnchors)){
_this._show($element.parent('li'));
$element.parent('li').one(Foundation.transitionend($element),function(){
$element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
});
return true;
}
},
previous:function previous(){
_this._hide($element.parent('li').parent('ul'));
$element.parent('li').parent('ul').one(Foundation.transitionend($element),function(){
setTimeout(function(){
$element.parent('li').parent('ul').parent('li').children('a').first().focus();
},1);
});
return true;
},
up:function up(){
$prevElement.focus();
// Don't tap focus on first element in root ul
return!$element.is(_this.$element.find('> li:first-child > a'));
},
down:function down(){
$nextElement.focus();
// Don't tap focus on last element in root ul
return!$element.is(_this.$element.find('> li:last-child > a'));
},
close:function close(){
// Don't close on element in root ul
if(!$element.is(_this.$element.find('> li > a'))){
_this._hide($element.parent().parent());
$element.parent().parent().siblings('a').focus();
}
},
open:function open(){
if(!$element.is(_this.$menuItems)){// not menu item means back button
_this._hide($element.parent('li').parent('ul'));
$element.parent('li').parent('ul').one(Foundation.transitionend($element),function(){
setTimeout(function(){
$element.parent('li').parent('ul').parent('li').children('a').first().focus();
},1);
});
return true;
}else if($element.is(_this.$submenuAnchors)){
_this._show($element.parent('li'));
$element.parent('li').one(Foundation.transitionend($element),function(){
$element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
});
return true;
}
},
handled:function handled(preventDefault){
if(preventDefault){
e.preventDefault();
}
e.stopImmediatePropagation();
}});

});// end keyboardAccess
}

/**
         * Closes all open elements, and returns to root menu.
         * @function
         * @fires Drilldown#closed
         */},{key:'_hideAll',value:function _hideAll()
{
var $elem=this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
if(this.options.autoHeight)this.$wrapper.css({height:$elem.parent().closest('ul').data('calcHeight')});
$elem.one(Foundation.transitionend($elem),function(e){
$elem.removeClass('is-active is-closing');
});
/**
             * Fires when the menu is fully closed.
             * @event Drilldown#closed
             */
this.$element.trigger('closed.zf.drilldown');
}

/**
         * Adds event listener for each `back` button, and closes open menus.
         * @function
         * @fires Drilldown#back
         * @param {jQuery} $elem - the current sub-menu to add `back` event.
         */},{key:'_back',value:function _back(
$elem){
var _this=this;
$elem.off('click.zf.drilldown');
$elem.children('.js-drilldown-back').
on('click.zf.drilldown',function(e){
e.stopImmediatePropagation();
// console.log('mouseup on back');
_this._hide($elem);

// If there is a parent submenu, call show
var parentSubMenu=$elem.parent('li').parent('ul').parent('li');
if(parentSubMenu.length){
_this._show(parentSubMenu);
}
});
}

/**
         * Adds event listener to menu items w/o submenus to close open menus on click.
         * @function
         * @private
         */},{key:'_menuLinkEvents',value:function _menuLinkEvents()
{
var _this=this;
this.$menuItems.not('.is-drilldown-submenu-parent').
off('click.zf.drilldown').
on('click.zf.drilldown',function(e){
// e.stopImmediatePropagation();
setTimeout(function(){
_this._hideAll();
},0);
});
}

/**
         * Opens a submenu.
         * @function
         * @fires Drilldown#open
         * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
         */},{key:'_show',value:function _show(
$elem){
if(this.options.autoHeight)this.$wrapper.css({height:$elem.children('[data-submenu]').data('calcHeight')});
$elem.attr('aria-expanded',true);
$elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden',false);
/**
                                                                                                                     * Fires when the submenu has opened.
                                                                                                                     * @event Drilldown#open
                                                                                                                     */
this.$element.trigger('open.zf.drilldown',[$elem]);
}},{key:'_hide',

/**
                            * Hides a submenu
                            * @function
                            * @fires Drilldown#hide
                            * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
                            */value:function _hide(
$elem){
if(this.options.autoHeight)this.$wrapper.css({height:$elem.parent().closest('ul').data('calcHeight')});
var _this=this;
$elem.parent('li').attr('aria-expanded',false);
$elem.attr('aria-hidden',true).addClass('is-closing');
$elem.addClass('is-closing').
one(Foundation.transitionend($elem),function(){
$elem.removeClass('is-active is-closing');
$elem.blur().addClass('invisible');
});
/**
             * Fires when the submenu has closed.
             * @event Drilldown#hide
             */
$elem.trigger('hide.zf.drilldown',[$elem]);
}

/**
         * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
         * Prevents content jumping.
         * @function
         * @private
         */},{key:'_getMaxDims',value:function _getMaxDims()
{
var maxHeight=0,result={},_this=this;
this.$submenus.add(this.$element).each(function(){
var numOfElems=$(this).children('li').length;
var height=Foundation.Box.GetDimensions(this).height;
maxHeight=height>maxHeight?height:maxHeight;
if(_this.options.autoHeight){
$(this).data('calcHeight',height);
if(!$(this).hasClass('is-drilldown-submenu'))result['height']=height;
}
});

if(!this.options.autoHeight)result['min-height']=maxHeight+'px';

result['max-width']=this.$element[0].getBoundingClientRect().width+'px';

return result;
}

/**
         * Destroys the Drilldown Menu
         * @function
         */},{key:'destroy',value:function destroy()
{
if(this.options.scrollTop)this.$element.off('.zf.drilldown',this._bindHandler);
this._hideAll();
this.$element.off('mutateme.zf.trigger');
Foundation.Nest.Burn(this.$element,'drilldown');
this.$element.unwrap().
find('.js-drilldown-back, .is-submenu-parent-item').remove().
end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').
end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
this.$submenuAnchors.each(function(){
$(this).off('.zf.drilldown');
});

this.$submenus.removeClass('drilldown-submenu-cover-previous');

this.$element.find('a').each(function(){
var $link=$(this);
$link.removeAttr('tabindex');
if($link.data('savedHref')){
$link.attr('href',$link.data('savedHref')).removeData('savedHref');
}else{return;}
});
Foundation.unregisterPlugin(this);
}}]);return Drilldown;}();


Drilldown.defaults={
/**
                          * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
                          * @option
                          * @type {string}
                          * @default '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'
                          */
backButton:'<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
/**
                                                                                * Position the back button either at the top or bottom of drilldown submenus. Can be `'left'` or `'bottom'`.
                                                                                * @option
                                                                                * @type {string}
                                                                                * @default top
                                                                                */
backButtonPosition:'top',
/**
                                * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
                                * @option
                                * @type {string}
                                * @default '<div></div>'
                                */
wrapper:'<div></div>',
/**
                             * Adds the parent link to the submenu.
                             * @option
                             * @type {boolean}
                             * @default false
                             */
parentLink:false,
/**
                        * Allow the menu to return to root list on body click.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
closeOnClick:false,
/**
                          * Allow the menu to auto adjust height.
                          * @option
                          * @type {boolean}
                          * @default false
                          */
autoHeight:false,
/**
                        * Animate the auto adjust height.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
animateHeight:false,
/**
                           * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
                           * @option
                           * @type {boolean}
                           * @default false
                           */
scrollTop:false,
/**
                       * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
                       * @option
                       * @type {string}
                       * @default ''
                       */
scrollTopElement:'',
/**
                           * ScrollTop offset
                           * @option
                           * @type {number}
                           * @default 0
                           */
scrollTopOffset:0,
/**
                         * Scroll animation duration
                         * @option
                         * @type {number}
                         * @default 500
                         */
animationDuration:500,
/**
                             * Scroll animation easing. Can be `'swing'` or `'linear'`.
                             * @option
                             * @type {string}
                             * @see {@link https://api.jquery.com/animate|JQuery animate}
                             * @default 'swing'
                             */
animationEasing:'swing'
// holdOpen: false
};

// Window exports
Foundation.plugin(Drilldown,'Drilldown');

}(jQuery);

},{}],3:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

!function($){

/**
                * DropdownMenu module.
                * @module foundation.dropdown-menu
                * @requires foundation.util.keyboard
                * @requires foundation.util.box
                * @requires foundation.util.nest
                */var

DropdownMenu=function(){
/**
                               * Creates a new instance of DropdownMenu.
                               * @class
                               * @fires DropdownMenu#init
                               * @param {jQuery} element - jQuery object to make into a dropdown menu.
                               * @param {Object} options - Overrides to the default plugin settings.
                               */
function DropdownMenu(element,options){_classCallCheck(this,DropdownMenu);
this.$element=element;
this.options=$.extend({},DropdownMenu.defaults,this.$element.data(),options);

Foundation.Nest.Feather(this.$element,'dropdown');
this._init();

Foundation.registerPlugin(this,'DropdownMenu');
Foundation.Keyboard.register('DropdownMenu',{
'ENTER':'open',
'SPACE':'open',
'ARROW_RIGHT':'next',
'ARROW_UP':'up',
'ARROW_DOWN':'down',
'ARROW_LEFT':'previous',
'ESCAPE':'close'});

}

/**
       * Initializes the plugin, and calls _prepareMenu
       * @private
       * @function
       */_createClass(DropdownMenu,[{key:'_init',value:function _init()
{
var subs=this.$element.find('li.is-dropdown-submenu-parent');
this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

this.$menuItems=this.$element.find('[role="menuitem"]');
this.$tabs=this.$element.children('[role="menuitem"]');
this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

if(this.$element.hasClass(this.options.rightClass)||this.options.alignment==='right'||Foundation.rtl()||this.$element.parents('.top-bar-right').is('*')){
this.options.alignment='right';
subs.addClass('opens-left');
}else{
subs.addClass('opens-right');
}
this.changed=false;
this._events();
}},{key:'_isVertical',value:function _isVertical()

{
return this.$tabs.css('display')==='block';
}

/**
         * Adds event listeners to elements within the menu
         * @private
         * @function
         */},{key:'_events',value:function _events()
{
var _this=this,
hasTouch='ontouchstart'in window||typeof window.ontouchstart!=='undefined',
parClass='is-dropdown-submenu-parent';

// used for onClick and in the keyboard handlers
var handleClickFn=function handleClickFn(e){
var $elem=$(e.target).parentsUntil('ul','.'+parClass),
hasSub=$elem.hasClass(parClass),
hasClicked=$elem.attr('data-is-click')==='true',
$sub=$elem.children('.is-dropdown-submenu');

if(hasSub){
if(hasClicked){
if(!_this.options.closeOnClick||!_this.options.clickOpen&&!hasTouch||_this.options.forceFollow&&hasTouch){return;}else
{
e.stopImmediatePropagation();
e.preventDefault();
_this._hide($elem);
}
}else{
e.preventDefault();
e.stopImmediatePropagation();
_this._show($sub);
$elem.add($elem.parentsUntil(_this.$element,'.'+parClass)).attr('data-is-click',true);
}
}
};

if(this.options.clickOpen||hasTouch){
this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu',handleClickFn);
}

// Handle Leaf element Clicks
if(_this.options.closeOnClickInside){
this.$menuItems.on('click.zf.dropdownmenu',function(e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);
if(!hasSub){
_this._hide();
}
});
}

if(!this.options.disableHover){
this.$menuItems.on('mouseenter.zf.dropdownmenu',function(e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);

if(hasSub){
clearTimeout($elem.data('_delay'));
$elem.data('_delay',setTimeout(function(){
_this._show($elem.children('.is-dropdown-submenu'));
},_this.options.hoverDelay));
}
}).on('mouseleave.zf.dropdownmenu',function(e){
var $elem=$(this),
hasSub=$elem.hasClass(parClass);
if(hasSub&&_this.options.autoclose){
if($elem.attr('data-is-click')==='true'&&_this.options.clickOpen){return false;}

clearTimeout($elem.data('_delay'));
$elem.data('_delay',setTimeout(function(){
_this._hide($elem);
},_this.options.closingTime));
}
});
}
this.$menuItems.on('keydown.zf.dropdownmenu',function(e){
var $element=$(e.target).parentsUntil('ul','[role="menuitem"]'),
isTab=_this.$tabs.index($element)>-1,
$elements=isTab?_this.$tabs:$element.siblings('li').add($element),
$prevElement,
$nextElement;

$elements.each(function(i){
if($(this).is($element)){
$prevElement=$elements.eq(i-1);
$nextElement=$elements.eq(i+1);
return;
}
});

var nextSibling=function nextSibling(){
if(!$element.is(':last-child')){
$nextElement.children('a:first').focus();
e.preventDefault();
}
},prevSibling=function prevSibling(){
$prevElement.children('a:first').focus();
e.preventDefault();
},openSub=function openSub(){
var $sub=$element.children('ul.is-dropdown-submenu');
if($sub.length){
_this._show($sub);
$element.find('li > a:first').focus();
e.preventDefault();
}else{return;}
},closeSub=function closeSub(){
//if ($element.is(':first-child')) {
var close=$element.parent('ul').parent('li');
close.children('a:first').focus();
_this._hide(close);
e.preventDefault();
//}
};
var functions={
open:openSub,
close:function close(){
_this._hide(_this.$element);
_this.$menuItems.find('a:first').focus();// focus to first element
e.preventDefault();
},
handled:function handled(){
e.stopImmediatePropagation();
}};


if(isTab){
if(_this._isVertical()){// vertical menu
if(Foundation.rtl()){// right aligned
$.extend(functions,{
down:nextSibling,
up:prevSibling,
next:closeSub,
previous:openSub});

}else{// left aligned
$.extend(functions,{
down:nextSibling,
up:prevSibling,
next:openSub,
previous:closeSub});

}
}else{// horizontal menu
if(Foundation.rtl()){// right aligned
$.extend(functions,{
next:prevSibling,
previous:nextSibling,
down:openSub,
up:closeSub});

}else{// left aligned
$.extend(functions,{
next:nextSibling,
previous:prevSibling,
down:openSub,
up:closeSub});

}
}
}else{// not tabs -> one sub
if(Foundation.rtl()){// right aligned
$.extend(functions,{
next:closeSub,
previous:openSub,
down:nextSibling,
up:prevSibling});

}else{// left aligned
$.extend(functions,{
next:openSub,
previous:closeSub,
down:nextSibling,
up:prevSibling});

}
}
Foundation.Keyboard.handleKey(e,'DropdownMenu',functions);

});
}

/**
         * Adds an event handler to the body to close any dropdowns on a click.
         * @function
         * @private
         */},{key:'_addBodyHandler',value:function _addBodyHandler()
{
var $body=$(document.body),
_this=this;
$body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').
on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu',function(e){
var $link=_this.$element.find(e.target);
if($link.length){return;}

_this._hide();
$body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
});
}

/**
         * Opens a dropdown pane, and checks for collisions first.
         * @param {jQuery} $sub - ul element that is a submenu to show
         * @function
         * @private
         * @fires DropdownMenu#show
         */},{key:'_show',value:function _show(
$sub){
var idx=this.$tabs.index(this.$tabs.filter(function(i,el){
return $(el).find($sub).length>0;
}));
var $sibs=$sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
this._hide($sibs,idx);
$sub.css('visibility','hidden').addClass('js-dropdown-active').
parent('li.is-dropdown-submenu-parent').addClass('is-active');
var clear=Foundation.Box.ImNotTouchingYou($sub,null,true);
if(!clear){
var oldClass=this.options.alignment==='left'?'-right':'-left',
$parentLi=$sub.parent('.is-dropdown-submenu-parent');
$parentLi.removeClass('opens'+oldClass).addClass('opens-'+this.options.alignment);
clear=Foundation.Box.ImNotTouchingYou($sub,null,true);
if(!clear){
$parentLi.removeClass('opens-'+this.options.alignment).addClass('opens-inner');
}
this.changed=true;
}
$sub.css('visibility','');
if(this.options.closeOnClick){this._addBodyHandler();}
/**
                                                                  * Fires when the new dropdown pane is visible.
                                                                  * @event DropdownMenu#show
                                                                  */
this.$element.trigger('show.zf.dropdownmenu',[$sub]);
}

/**
         * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
         * @function
         * @param {jQuery} $elem - element with a submenu to hide
         * @param {Number} idx - index of the $tabs collection to hide
         * @private
         */},{key:'_hide',value:function _hide(
$elem,idx){
var $toClose;
if($elem&&$elem.length){
$toClose=$elem;
}else if(idx!==undefined){
$toClose=this.$tabs.not(function(i,el){
return i===idx;
});
}else
{
$toClose=this.$element;
}
var somethingToClose=$toClose.hasClass('is-active')||$toClose.find('.is-active').length>0;

if(somethingToClose){
$toClose.find('li.is-active').add($toClose).attr({
'data-is-click':false}).
removeClass('is-active');

$toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

if(this.changed||$toClose.find('opens-inner').length){
var oldClass=this.options.alignment==='left'?'right':'left';
$toClose.find('li.is-dropdown-submenu-parent').add($toClose).
removeClass('opens-inner opens-'+this.options.alignment).
addClass('opens-'+oldClass);
this.changed=false;
}
/**
             * Fires when the open menus are closed.
             * @event DropdownMenu#hide
             */
this.$element.trigger('hide.zf.dropdownmenu',[$toClose]);
}
}

/**
         * Destroys the plugin.
         * @function
         */},{key:'destroy',value:function destroy()
{
this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').
removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
$(document.body).off('.zf.dropdownmenu');
Foundation.Nest.Burn(this.$element,'dropdown');
Foundation.unregisterPlugin(this);
}}]);return DropdownMenu;}();


/**
                                      * Default settings for plugin
                                      */
DropdownMenu.defaults={
/**
                             * Disallows hover events from opening submenus
                             * @option
                             * @type {boolean}
                             * @default false
                             */
disableHover:false,
/**
                          * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
autoclose:true,
/**
                      * Amount of time to delay opening a submenu on hover event.
                      * @option
                      * @type {number}
                      * @default 50
                      */
hoverDelay:50,
/**
                     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
                     * @option
                     * @type {boolean}
                     * @default false
                     */
clickOpen:false,
/**
                       * Amount of time to delay closing a submenu on a mouseleave event.
                       * @option
                       * @type {number}
                       * @default 500
                       */

closingTime:500,
/**
                       * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
                       * @option
                       * @type {string}
                       * @default 'left'
                       */
alignment:'left',
/**
                        * Allow clicks on the body to close any open submenus.
                        * @option
                        * @type {boolean}
                        * @default true
                        */
closeOnClick:true,
/**
                         * Allow clicks on leaf anchor links to close any open submenus.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
closeOnClickInside:true,
/**
                               * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
                               * @option
                               * @type {string}
                               * @default 'vertical'
                               */
verticalClass:'vertical',
/**
                                * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
                                * @option
                                * @type {string}
                                * @default 'align-right'
                                */
rightClass:'align-right',
/**
                                * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
                                * @option
                                * @type {boolean}
                                * @default true
                                */
forceFollow:true};


// Window exports
Foundation.plugin(DropdownMenu,'DropdownMenu');

}(jQuery);

},{}],4:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

!function($){

/**
                * OffCanvas module.
                * @module foundation.offcanvas
                * @requires foundation.util.keyboard
                * @requires foundation.util.mediaQuery
                * @requires foundation.util.triggers
                * @requires foundation.util.motion
                */var

OffCanvas=function(){
/**
                            * Creates a new instance of an off-canvas wrapper.
                            * @class
                            * @fires OffCanvas#init
                            * @param {Object} element - jQuery object to initialize.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
function OffCanvas(element,options){_classCallCheck(this,OffCanvas);
this.$element=element;
this.options=$.extend({},OffCanvas.defaults,this.$element.data(),options);
this.$lastTrigger=$();
this.$triggers=$();

this._init();
this._events();

Foundation.registerPlugin(this,'OffCanvas');
Foundation.Keyboard.register('OffCanvas',{
'ESCAPE':'close'});


}

/**
       * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
       * @function
       * @private
       */_createClass(OffCanvas,[{key:'_init',value:function _init()
{
var id=this.$element.attr('id');

this.$element.attr('aria-hidden','true');

this.$element.addClass('is-transition-'+this.options.transition);

// Find triggers that affect this element and add aria-expanded to them
this.$triggers=$(document).
find('[data-open="'+id+'"], [data-close="'+id+'"], [data-toggle="'+id+'"]').
attr('aria-expanded','false').
attr('aria-controls',id);

// Add an overlay over the content if necessary
if(this.options.contentOverlay===true){
var overlay=document.createElement('div');
var overlayPosition=$(this.$element).css("position")==='fixed'?'is-overlay-fixed':'is-overlay-absolute';
overlay.setAttribute('class','js-off-canvas-overlay '+overlayPosition);
this.$overlay=$(overlay);
if(overlayPosition==='is-overlay-fixed'){
$('body').append(this.$overlay);
}else{
this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
}
}

this.options.isRevealed=this.options.isRevealed||new RegExp(this.options.revealClass,'g').test(this.$element[0].className);

if(this.options.isRevealed===true){
this.options.revealOn=this.options.revealOn||this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
this._setMQChecker();
}
if(!this.options.transitionTime===true){
this.options.transitionTime=parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration)*1000;
}
}

/**
         * Adds event handlers to the off-canvas wrapper and the exit overlay.
         * @function
         * @private
         */},{key:'_events',value:function _events()
{
this.$element.off('.zf.trigger .zf.offcanvas').on({
'open.zf.trigger':this.open.bind(this),
'close.zf.trigger':this.close.bind(this),
'toggle.zf.trigger':this.toggle.bind(this),
'keydown.zf.offcanvas':this._handleKeyboard.bind(this)});


if(this.options.closeOnClick===true){
var $target=this.options.contentOverlay?this.$overlay:$('[data-off-canvas-content]');
$target.on({'click.zf.offcanvas':this.close.bind(this)});
}
}

/**
         * Applies event listener for elements that will reveal at certain breakpoints.
         * @private
         */},{key:'_setMQChecker',value:function _setMQChecker()
{
var _this=this;

$(window).on('changed.zf.mediaquery',function(){
if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
_this.reveal(true);
}else{
_this.reveal(false);
}
}).one('load.zf.offcanvas',function(){
if(Foundation.MediaQuery.atLeast(_this.options.revealOn)){
_this.reveal(true);
}
});
}

/**
         * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
         * @param {Boolean} isRevealed - true if element should be revealed.
         * @function
         */},{key:'reveal',value:function reveal(
isRevealed){
var $closer=this.$element.find('[data-close]');
if(isRevealed){
this.close();
this.isRevealed=true;
this.$element.attr('aria-hidden','false');
this.$element.off('open.zf.trigger toggle.zf.trigger');
if($closer.length){$closer.hide();}
}else{
this.isRevealed=false;
this.$element.attr('aria-hidden','true');
this.$element.on({
'open.zf.trigger':this.open.bind(this),
'toggle.zf.trigger':this.toggle.bind(this)});

if($closer.length){
$closer.show();
}
}
}

/**
         * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
         * @private
         */},{key:'_stopScrolling',value:function _stopScrolling(
event){
return false;
}

// Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
// Only really works for y, not sure how to extend to x or if we need to.
},{key:'_recordScrollable',value:function _recordScrollable(event){
var elem=this;// called from event handler context with this as elem

// If the element is scrollable (content overflows), then...
if(elem.scrollHeight!==elem.clientHeight){
// If we're at the top, scroll down one pixel to allow scrolling up
if(elem.scrollTop===0){
elem.scrollTop=1;
}
// If we're at the bottom, scroll up one pixel to allow scrolling down
if(elem.scrollTop===elem.scrollHeight-elem.clientHeight){
elem.scrollTop=elem.scrollHeight-elem.clientHeight-1;
}
}
elem.allowUp=elem.scrollTop>0;
elem.allowDown=elem.scrollTop<elem.scrollHeight-elem.clientHeight;
elem.lastY=event.originalEvent.pageY;
}},{key:'_stopScrollPropagation',value:function _stopScrollPropagation(

event){
var elem=this;// called from event handler context with this as elem
var up=event.pageY<elem.lastY;
var down=!up;
elem.lastY=event.pageY;

if(up&&elem.allowUp||down&&elem.allowDown){
event.stopPropagation();
}else{
event.preventDefault();
}
}

/**
         * Opens the off-canvas menu.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         * @fires OffCanvas#opened
         */},{key:'open',value:function open(
event,trigger){
if(this.$element.hasClass('is-open')||this.isRevealed){return;}
var _this=this;

if(trigger){
this.$lastTrigger=trigger;
}

if(this.options.forceTo==='top'){
window.scrollTo(0,0);
}else if(this.options.forceTo==='bottom'){
window.scrollTo(0,document.body.scrollHeight);
}

/**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#opened
           */
_this.$element.addClass('is-open');

this.$triggers.attr('aria-expanded','true');
this.$element.attr('aria-hidden','false').
trigger('opened.zf.offcanvas');

// If `contentScroll` is set to false, add class and disable scrolling on touch devices.
if(this.options.contentScroll===false){
$('body').addClass('is-off-canvas-open').on('touchmove',this._stopScrolling);
this.$element.on('touchstart',this._recordScrollable);
this.$element.on('touchmove',this._stopScrollPropagation);
}

if(this.options.contentOverlay===true){
this.$overlay.addClass('is-visible');
}

if(this.options.closeOnClick===true&&this.options.contentOverlay===true){
this.$overlay.addClass('is-closable');
}

if(this.options.autoFocus===true){
this.$element.one(Foundation.transitionend(this.$element),function(){
_this.$element.find('a, button').eq(0).focus();
});
}

if(this.options.trapFocus===true){
this.$element.siblings('[data-off-canvas-content]').attr('tabindex','-1');
Foundation.Keyboard.trapFocus(this.$element);
}
}

/**
         * Closes the off-canvas menu.
         * @function
         * @param {Function} cb - optional cb to fire after closure.
         * @fires OffCanvas#closed
         */},{key:'close',value:function close(
cb){
if(!this.$element.hasClass('is-open')||this.isRevealed){return;}

var _this=this;

_this.$element.removeClass('is-open');

this.$element.attr('aria-hidden','true')
/**
                                                   * Fires when the off-canvas menu opens.
                                                   * @event OffCanvas#closed
                                                   */.
trigger('closed.zf.offcanvas');

// If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
if(this.options.contentScroll===false){
$('body').removeClass('is-off-canvas-open').off('touchmove',this._stopScrolling);
this.$element.off('touchstart',this._recordScrollable);
this.$element.off('touchmove',this._stopScrollPropagation);
}

if(this.options.contentOverlay===true){
this.$overlay.removeClass('is-visible');
}

if(this.options.closeOnClick===true&&this.options.contentOverlay===true){
this.$overlay.removeClass('is-closable');
}

this.$triggers.attr('aria-expanded','false');

if(this.options.trapFocus===true){
this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
Foundation.Keyboard.releaseFocus(this.$element);
}
}

/**
         * Toggles the off-canvas menu open or closed.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         */},{key:'toggle',value:function toggle(
event,trigger){
if(this.$element.hasClass('is-open')){
this.close(event,trigger);
}else
{
this.open(event,trigger);
}
}

/**
         * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
         * @function
         * @private
         */},{key:'_handleKeyboard',value:function _handleKeyboard(
e){var _this2=this;
Foundation.Keyboard.handleKey(e,'OffCanvas',{
close:function close(){
_this2.close();
_this2.$lastTrigger.focus();
return true;
},
handled:function handled(){
e.stopPropagation();
e.preventDefault();
}});

}

/**
         * Destroys the offcanvas plugin.
         * @function
         */},{key:'destroy',value:function destroy()
{
this.close();
this.$element.off('.zf.trigger .zf.offcanvas');
this.$overlay.off('.zf.offcanvas');

Foundation.unregisterPlugin(this);
}}]);return OffCanvas;}();


OffCanvas.defaults={
/**
                          * Allow the user to click outside of the menu to close it.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
closeOnClick:true,

/**
                         * Adds an overlay on top of `[data-off-canvas-content]`.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
contentOverlay:true,

/**
                           * Enable/disable scrolling of the main content when an off canvas panel is open.
                           * @option
                           * @type {boolean}
                           * @default true
                           */
contentScroll:true,

/**
                          * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
                          * @option
                          * @type {number}
                          * @default 0
                          */
transitionTime:0,

/**
                        * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
                        * @option
                        * @type {string}
                        * @default push
                        */
transition:'push',

/**
                         * Force the page to scroll to top or bottom on open.
                         * @option
                         * @type {?string}
                         * @default null
                         */
forceTo:null,

/**
                    * Allow the offcanvas to remain open for certain breakpoints.
                    * @option
                    * @type {boolean}
                    * @default false
                    */
isRevealed:false,

/**
                        * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
                        * @option
                        * @type {?string}
                        * @default null
                        */
revealOn:null,

/**
                     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
                     * @option
                     * @type {boolean}
                     * @default true
                     */
autoFocus:true,

/**
                      * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
                      * @option
                      * @type {string}
                      * @default reveal-for-
                      * @todo improve the regex testing for this.
                      */
revealClass:'reveal-for-',

/**
                                 * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
                                 * @option
                                 * @type {boolean}
                                 * @default false
                                 */
trapFocus:false};


// Window exports
Foundation.plugin(OffCanvas,'OffCanvas');

}(jQuery);

},{}],5:[function(require,module,exports){
'use strict';var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}

!function($){

/**
                * ResponsiveMenu module.
                * @module foundation.responsiveMenu
                * @requires foundation.util.triggers
                * @requires foundation.util.mediaQuery
                */var

ResponsiveMenu=function(){
/**
                                 * Creates a new instance of a responsive menu.
                                 * @class
                                 * @fires ResponsiveMenu#init
                                 * @param {jQuery} element - jQuery object to make into a dropdown menu.
                                 * @param {Object} options - Overrides to the default plugin settings.
                                 */
function ResponsiveMenu(element,options){_classCallCheck(this,ResponsiveMenu);
this.$element=$(element);
this.rules=this.$element.data('responsive-menu');
this.currentMq=null;
this.currentPlugin=null;

this._init();
this._events();

Foundation.registerPlugin(this,'ResponsiveMenu');
}

/**
       * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
       * @function
       * @private
       */_createClass(ResponsiveMenu,[{key:'_init',value:function _init()
{
// The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
if(typeof this.rules==='string'){
var rulesTree={};

// Parse rules from "classes" pulled from data attribute
var rules=this.rules.split(' ');

// Iterate through every rule found
for(var i=0;i<rules.length;i++){
var rule=rules[i].split('-');
var ruleSize=rule.length>1?rule[0]:'small';
var rulePlugin=rule.length>1?rule[1]:rule[0];

if(MenuPlugins[rulePlugin]!==null){
rulesTree[ruleSize]=MenuPlugins[rulePlugin];
}
}

this.rules=rulesTree;
}

if(!$.isEmptyObject(this.rules)){
this._checkMediaQueries();
}
// Add data-mutate since children may need it.
this.$element.attr('data-mutate',this.$element.attr('data-mutate')||Foundation.GetYoDigits(6,'responsive-menu'));
}

/**
         * Initializes events for the Menu.
         * @function
         * @private
         */},{key:'_events',value:function _events()
{
var _this=this;

$(window).on('changed.zf.mediaquery',function(){
_this._checkMediaQueries();
});
// $(window).on('resize.zf.ResponsiveMenu', function() {
//   _this._checkMediaQueries();
// });
}

/**
         * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
         * @function
         * @private
         */},{key:'_checkMediaQueries',value:function _checkMediaQueries()
{
var matchedMq,_this=this;
// Iterate through each rule and find the last matching rule
$.each(this.rules,function(key){
if(Foundation.MediaQuery.atLeast(key)){
matchedMq=key;
}
});

// No match? No dice
if(!matchedMq)return;

// Plugin already initialized? We good
if(this.currentPlugin instanceof this.rules[matchedMq].plugin)return;

// Remove existing plugin-specific CSS classes
$.each(MenuPlugins,function(key,value){
_this.$element.removeClass(value.cssClass);
});

// Add the CSS class for the new plugin
this.$element.addClass(this.rules[matchedMq].cssClass);

// Create an instance of the new plugin
if(this.currentPlugin)this.currentPlugin.destroy();
this.currentPlugin=new this.rules[matchedMq].plugin(this.$element,{});
}

/**
         * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
         * @function
         */},{key:'destroy',value:function destroy()
{
this.currentPlugin.destroy();
$(window).off('.zf.ResponsiveMenu');
Foundation.unregisterPlugin(this);
}}]);return ResponsiveMenu;}();


ResponsiveMenu.defaults={};

// The plugin matches the plugin classes with these plugin instances.
var MenuPlugins={
dropdown:{
cssClass:'dropdown',
plugin:Foundation._plugins['dropdown-menu']||null},

drilldown:{
cssClass:'drilldown',
plugin:Foundation._plugins['drilldown']||null},

accordion:{
cssClass:'accordion-menu',
plugin:Foundation._plugins['accordion-menu']||null}};



// Window exports
Foundation.plugin(ResponsiveMenu,'ResponsiveMenu');

}(jQuery);

},{}],6:[function(require,module,exports){
'use strict';

!function($){

Foundation.Box={
ImNotTouchingYou:ImNotTouchingYou,
GetDimensions:GetDimensions,
GetOffsets:GetOffsets};


/**
                               * Compares the dimensions of an element to a container and determines collision events with container.
                               * @function
                               * @param {jQuery} element - jQuery object to test for collisions.
                               * @param {jQuery} parent - jQuery object to use as bounding container.
                               * @param {Boolean} lrOnly - set to true to check left and right values only.
                               * @param {Boolean} tbOnly - set to true to check top and bottom values only.
                               * @default if no parent object passed, detects collisions with `window`.
                               * @returns {Boolean} - true if collision free, false if a collision in any direction.
                               */
function ImNotTouchingYou(element,parent,lrOnly,tbOnly){
var eleDims=GetDimensions(element),
top,bottom,left,right;

if(parent){
var parDims=GetDimensions(parent);

bottom=eleDims.offset.top+eleDims.height<=parDims.height+parDims.offset.top;
top=eleDims.offset.top>=parDims.offset.top;
left=eleDims.offset.left>=parDims.offset.left;
right=eleDims.offset.left+eleDims.width<=parDims.width+parDims.offset.left;
}else
{
bottom=eleDims.offset.top+eleDims.height<=eleDims.windowDims.height+eleDims.windowDims.offset.top;
top=eleDims.offset.top>=eleDims.windowDims.offset.top;
left=eleDims.offset.left>=eleDims.windowDims.offset.left;
right=eleDims.offset.left+eleDims.width<=eleDims.windowDims.width;
}

var allDirs=[bottom,top,left,right];

if(lrOnly){
return left===right===true;
}

if(tbOnly){
return top===bottom===true;
}

return allDirs.indexOf(false)===-1;
};

/**
      * Uses native methods to return an object of dimension values.
      * @function
      * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
      * @returns {Object} - nested object of integer pixel values
      * TODO - if element is window, return only those values.
      */
function GetDimensions(elem,test){
elem=elem.length?elem[0]:elem;

if(elem===window||elem===document){
throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
}

var rect=elem.getBoundingClientRect(),
parRect=elem.parentNode.getBoundingClientRect(),
winRect=document.body.getBoundingClientRect(),
winY=window.pageYOffset,
winX=window.pageXOffset;

return{
width:rect.width,
height:rect.height,
offset:{
top:rect.top+winY,
left:rect.left+winX},

parentDims:{
width:parRect.width,
height:parRect.height,
offset:{
top:parRect.top+winY,
left:parRect.left+winX}},


windowDims:{
width:winRect.width,
height:winRect.height,
offset:{
top:winY,
left:winX}}};



}

/**
     * Returns an object of top and left integer pixel values for dynamically rendered elements,
     * such as: Tooltip, Reveal, and Dropdown
     * @function
     * @param {jQuery} element - jQuery object for the element being positioned.
     * @param {jQuery} anchor - jQuery object for the element's anchor point.
     * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
     * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
     * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
     * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
     * TODO alter/rewrite to work with `em` values as well/instead of pixels
     */
function GetOffsets(element,anchor,position,vOffset,hOffset,isOverflow){
var $eleDims=GetDimensions(element),
$anchorDims=anchor?GetDimensions(anchor):null;

switch(position){
case'top':
return{
left:Foundation.rtl()?$anchorDims.offset.left-$eleDims.width+$anchorDims.width:$anchorDims.offset.left,
top:$anchorDims.offset.top-($eleDims.height+vOffset)};

break;
case'left':
return{
left:$anchorDims.offset.left-($eleDims.width+hOffset),
top:$anchorDims.offset.top};

break;
case'right':
return{
left:$anchorDims.offset.left+$anchorDims.width+hOffset,
top:$anchorDims.offset.top};

break;
case'center top':
return{
left:$anchorDims.offset.left+$anchorDims.width/2-$eleDims.width/2,
top:$anchorDims.offset.top-($eleDims.height+vOffset)};

break;
case'center bottom':
return{
left:isOverflow?hOffset:$anchorDims.offset.left+$anchorDims.width/2-$eleDims.width/2,
top:$anchorDims.offset.top+$anchorDims.height+vOffset};

break;
case'center left':
return{
left:$anchorDims.offset.left-($eleDims.width+hOffset),
top:$anchorDims.offset.top+$anchorDims.height/2-$eleDims.height/2};

break;
case'center right':
return{
left:$anchorDims.offset.left+$anchorDims.width+hOffset+1,
top:$anchorDims.offset.top+$anchorDims.height/2-$eleDims.height/2};

break;
case'center':
return{
left:$eleDims.windowDims.offset.left+$eleDims.windowDims.width/2-$eleDims.width/2,
top:$eleDims.windowDims.offset.top+$eleDims.windowDims.height/2-$eleDims.height/2};

break;
case'reveal':
return{
left:($eleDims.windowDims.width-$eleDims.width)/2,
top:$eleDims.windowDims.offset.top+vOffset};

case'reveal full':
return{
left:$eleDims.windowDims.offset.left,
top:$eleDims.windowDims.offset.top};

break;
case'left bottom':
return{
left:$anchorDims.offset.left,
top:$anchorDims.offset.top+$anchorDims.height+vOffset};

break;
case'right bottom':
return{
left:$anchorDims.offset.left+$anchorDims.width+hOffset-$eleDims.width,
top:$anchorDims.offset.top+$anchorDims.height+vOffset};

break;
default:
return{
left:Foundation.rtl()?$anchorDims.offset.left-$eleDims.width+$anchorDims.width:$anchorDims.offset.left+hOffset,
top:$anchorDims.offset.top+$anchorDims.height+vOffset};}


}

}(jQuery);

},{}],7:[function(require,module,exports){
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function($){

var keyCodes={
9:'TAB',
13:'ENTER',
27:'ESCAPE',
32:'SPACE',
37:'ARROW_LEFT',
38:'ARROW_UP',
39:'ARROW_RIGHT',
40:'ARROW_DOWN'};


var commands={};

var Keyboard={
keys:getKeyCodes(keyCodes),

/**
                                  * Parses the (keyboard) event and returns a String that represents its key
                                  * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
                                  * @param {Event} event - the event generated by the event handler
                                  * @return String key - String that represents the key pressed
                                  */
parseKey:function parseKey(event){
var key=keyCodes[event.which||event.keyCode]||String.fromCharCode(event.which).toUpperCase();

// Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
key=key.replace(/\W+/,'');

if(event.shiftKey)key='SHIFT_'+key;
if(event.ctrlKey)key='CTRL_'+key;
if(event.altKey)key='ALT_'+key;

// Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
key=key.replace(/_$/,'');

return key;
},

/**
        * Handles the given (keyboard) event
        * @param {Event} event - the event generated by the event handler
        * @param {String} component - Foundation component's name, e.g. Slider or Reveal
        * @param {Objects} functions - collection of functions that are to be executed
        */
handleKey:function handleKey(event,component,functions){
var commandList=commands[component],
keyCode=this.parseKey(event),
cmds,
command,
fn;

if(!commandList)return console.warn('Component not defined!');

if(typeof commandList.ltr==='undefined'){// this component does not differentiate between ltr and rtl
cmds=commandList;// use plain list
}else{// merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
if(Foundation.rtl())cmds=$.extend({},commandList.ltr,commandList.rtl);else

cmds=$.extend({},commandList.rtl,commandList.ltr);
}
command=cmds[keyCode];

fn=functions[command];
if(fn&&typeof fn==='function'){// execute function  if exists
var returnValue=fn.apply();
if(functions.handled||typeof functions.handled==='function'){// execute function when event was handled
functions.handled(returnValue);
}
}else{
if(functions.unhandled||typeof functions.unhandled==='function'){// execute function when event was not handled
functions.unhandled();
}
}
},

/**
        * Finds all focusable elements within the given `$element`
        * @param {jQuery} $element - jQuery object to search within
        * @return {jQuery} $focusable - all focusable elements within `$element`
        */
findFocusable:function findFocusable($element){
if(!$element){return false;}
return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function(){
if(!$(this).is(':visible')||$(this).attr('tabindex')<0){return false;}//only have visible elements and those that have a tabindex greater or equal 0
return true;
});
},

/**
        * Returns the component name name
        * @param {Object} component - Foundation component, e.g. Slider or Reveal
        * @return String componentName
        */

register:function register(componentName,cmds){
commands[componentName]=cmds;
},

/**
        * Traps the focus in the given element.
        * @param  {jQuery} $element  jQuery object to trap the foucs into.
        */
trapFocus:function trapFocus($element){
var $focusable=Foundation.Keyboard.findFocusable($element),
$firstFocusable=$focusable.eq(0),
$lastFocusable=$focusable.eq(-1);

$element.on('keydown.zf.trapfocus',function(event){
if(event.target===$lastFocusable[0]&&Foundation.Keyboard.parseKey(event)==='TAB'){
event.preventDefault();
$firstFocusable.focus();
}else
if(event.target===$firstFocusable[0]&&Foundation.Keyboard.parseKey(event)==='SHIFT_TAB'){
event.preventDefault();
$lastFocusable.focus();
}
});
},
/**
        * Releases the trapped focus from the given element.
        * @param  {jQuery} $element  jQuery object to release the focus for.
        */
releaseFocus:function releaseFocus($element){
$element.off('keydown.zf.trapfocus');
}};


/*
          * Constants for easier comparing.
          * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
          */
function getKeyCodes(kcs){
var k={};
for(var kc in kcs){k[kcs[kc]]=kcs[kc];}
return k;
}

Foundation.Keyboard=Keyboard;

}(jQuery);

},{}],8:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};

!function($){

// Default set of media queries
var defaultQueries={
'default':'only screen',
landscape:'only screen and (orientation: landscape)',
portrait:'only screen and (orientation: portrait)',
retina:'only screen and (-webkit-min-device-pixel-ratio: 2),'+
'only screen and (min--moz-device-pixel-ratio: 2),'+
'only screen and (-o-min-device-pixel-ratio: 2/1),'+
'only screen and (min-device-pixel-ratio: 2),'+
'only screen and (min-resolution: 192dpi),'+
'only screen and (min-resolution: 2dppx)'};


var MediaQuery={
queries:[],

current:'',

/**
                  * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
                  * @function
                  * @private
                  */
_init:function _init(){
var self=this;
var extractedStyles=$('.foundation-mq').css('font-family');
var namedQueries;

namedQueries=parseStyleToObject(extractedStyles);

for(var key in namedQueries){
if(namedQueries.hasOwnProperty(key)){
self.queries.push({
name:key,
value:'only screen and (min-width: '+namedQueries[key]+')'});

}
}

this.current=this._getCurrentSize();

this._watcher();
},

/**
        * Checks if the screen is at least as wide as a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
        */
atLeast:function atLeast(size){
var query=this.get(size);

if(query){
return window.matchMedia(query).matches;
}

return false;
},

/**
        * Checks if the screen matches to a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
        */
is:function is(size){
size=size.trim().split(' ');
if(size.length>1&&size[1]==='only'){
if(size[0]===this._getCurrentSize())return true;
}else{
return this.atLeast(size[0]);
}
return false;
},

/**
        * Gets the media query of a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to get.
        * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
        */
get:function get(size){
for(var i in this.queries){
if(this.queries.hasOwnProperty(i)){
var query=this.queries[i];
if(size===query.name)return query.value;
}
}

return null;
},

/**
        * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
        * @function
        * @private
        * @returns {String} Name of the current breakpoint.
        */
_getCurrentSize:function _getCurrentSize(){
var matched;

for(var i=0;i<this.queries.length;i++){
var query=this.queries[i];

if(window.matchMedia(query.value).matches){
matched=query;
}
}

if((typeof matched==='undefined'?'undefined':_typeof(matched))==='object'){
return matched.name;
}else{
return matched;
}
},

/**
        * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
        * @function
        * @private
        */
_watcher:function _watcher(){var _this=this;
$(window).on('resize.zf.mediaquery',function(){
var newSize=_this._getCurrentSize(),currentSize=_this.current;

if(newSize!==currentSize){
// Change the current media query
_this.current=newSize;

// Broadcast the media query change on the window
$(window).trigger('changed.zf.mediaquery',[newSize,currentSize]);
}
});
}};


Foundation.MediaQuery=MediaQuery;

// matchMedia() polyfill - Test a CSS media type/query in JS.
// Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
window.matchMedia||(window.matchMedia=function(){
'use strict';

// For browsers that support matchMedium api such as IE 9 and webkit
var styleMedia=window.styleMedia||window.media;

// For those that don't support matchMedium
if(!styleMedia){
var style=document.createElement('style'),
script=document.getElementsByTagName('script')[0],
info=null;

style.type='text/css';
style.id='matchmediajs-test';

script&&script.parentNode&&script.parentNode.insertBefore(style,script);

// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
info='getComputedStyle'in window&&window.getComputedStyle(style,null)||style.currentStyle;

styleMedia={
matchMedium:function matchMedium(media){
var text='@media '+media+'{ #matchmediajs-test { width: 1px; } }';

// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
if(style.styleSheet){
style.styleSheet.cssText=text;
}else{
style.textContent=text;
}

// Test if media query is true or false
return info.width==='1px';
}};

}

return function(media){
return{
matches:styleMedia.matchMedium(media||'all'),
media:media||'all'};

};
}());

// Thank you: https://github.com/sindresorhus/query-string
function parseStyleToObject(str){
var styleObject={};

if(typeof str!=='string'){
return styleObject;
}

str=str.trim().slice(1,-1);// browsers re-quote string style values

if(!str){
return styleObject;
}

styleObject=str.split('&').reduce(function(ret,param){
var parts=param.replace(/\+/g,' ').split('=');
var key=parts[0];
var val=parts[1];
key=decodeURIComponent(key);

// missing `=` should be `null`:
// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
val=val===undefined?null:decodeURIComponent(val);

if(!ret.hasOwnProperty(key)){
ret[key]=val;
}else if(Array.isArray(ret[key])){
ret[key].push(val);
}else{
ret[key]=[ret[key],val];
}
return ret;
},{});

return styleObject;
}

Foundation.MediaQuery=MediaQuery;

}(jQuery);

},{}],9:[function(require,module,exports){
'use strict';

!function($){

/**
                * Motion module.
                * @module foundation.motion
                */

var initClasses=['mui-enter','mui-leave'];
var activeClasses=['mui-enter-active','mui-leave-active'];

var Motion={
animateIn:function animateIn(element,animation,cb){
animate(true,element,animation,cb);
},

animateOut:function animateOut(element,animation,cb){
animate(false,element,animation,cb);
}};


function Move(duration,elem,fn){
var anim,prog,start=null;
// console.log('called');

if(duration===0){
fn.apply(elem);
elem.trigger('finished.zf.animate',[elem]).triggerHandler('finished.zf.animate',[elem]);
return;
}

function move(ts){
if(!start)start=ts;
// console.log(start, ts);
prog=ts-start;
fn.apply(elem);

if(prog<duration){anim=window.requestAnimationFrame(move,elem);}else
{
window.cancelAnimationFrame(anim);
elem.trigger('finished.zf.animate',[elem]).triggerHandler('finished.zf.animate',[elem]);
}
}
anim=window.requestAnimationFrame(move);
}

/**
     * Animates an element in or out using a CSS transition class.
     * @function
     * @private
     * @param {Boolean} isIn - Defines if the animation is in or out.
     * @param {Object} element - jQuery or HTML object to animate.
     * @param {String} animation - CSS class to use.
     * @param {Function} cb - Callback to run when animation is finished.
     */
function animate(isIn,element,animation,cb){
element=$(element).eq(0);

if(!element.length)return;

var initClass=isIn?initClasses[0]:initClasses[1];
var activeClass=isIn?activeClasses[0]:activeClasses[1];

// Set up the animation
reset();

element.
addClass(animation).
css('transition','none');

requestAnimationFrame(function(){
element.addClass(initClass);
if(isIn)element.show();
});

// Start the animation
requestAnimationFrame(function(){
element[0].offsetWidth;
element.
css('transition','').
addClass(activeClass);
});

// Clean up the animation when it finishes
element.one(Foundation.transitionend(element),finish);

// Hides the element (for out animations), resets the element, and runs a callback
function finish(){
if(!isIn)element.hide();
reset();
if(cb)cb.apply(element);
}

// Resets transitions and removes motion-specific classes
function reset(){
element[0].style.transitionDuration=0;
element.removeClass(initClass+' '+activeClass+' '+animation);
}
}

Foundation.Move=Move;
Foundation.Motion=Motion;

}(jQuery);

},{}],10:[function(require,module,exports){
'use strict';

!function($){

var Nest={
Feather:function Feather(menu){var type=arguments.length>1&&arguments[1]!==undefined?arguments[1]:'zf';
menu.attr('role','menubar');

var items=menu.find('li').attr({'role':'menuitem'}),
subMenuClass='is-'+type+'-submenu',
subItemClass=subMenuClass+'-item',
hasSubClass='is-'+type+'-submenu-parent';

items.each(function(){
var $item=$(this),
$sub=$item.children('ul');

if($sub.length){
$item.
addClass(hasSubClass).
attr({
'aria-haspopup':true,
'aria-label':$item.children('a:first').text()});

// Note:  Drilldowns behave differently in how they hide, and so need
// additional attributes.  We should look if this possibly over-generalized
// utility (Nest) is appropriate when we rework menus in 6.4
if(type==='drilldown'){
$item.attr({'aria-expanded':false});
}

$sub.
addClass('submenu '+subMenuClass).
attr({
'data-submenu':'',
'role':'menu'});

if(type==='drilldown'){
$sub.attr({'aria-hidden':true});
}
}

if($item.parent('[data-submenu]').length){
$item.addClass('is-submenu-item '+subItemClass);
}
});

return;
},

Burn:function Burn(menu,type){
var//items = menu.find('li'),
subMenuClass='is-'+type+'-submenu',
subItemClass=subMenuClass+'-item',
hasSubClass='is-'+type+'-submenu-parent';

menu.
find('>li, .menu, .menu > li').
removeClass(subMenuClass+' '+subItemClass+' '+hasSubClass+' is-submenu-item submenu is-active').
removeAttr('data-submenu').css('display','');

// console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
//           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
//           .removeAttr('data-submenu'));
// items.each(function(){
//   var $item = $(this),
//       $sub = $item.children('ul');
//   if($item.parent('[data-submenu]').length){
//     $item.removeClass('is-submenu-item ' + subItemClass);
//   }
//   if($sub.length){
//     $item.removeClass('has-submenu');
//     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
//   }
// });
}};


Foundation.Nest=Nest;

}(jQuery);

},{}],11:[function(require,module,exports){
'use strict';

!function($){

function Timer(elem,options,cb){
var _this=this,
duration=options.duration,//options is an object for easily adding features later.
nameSpace=Object.keys(elem.data())[0]||'timer',
remain=-1,
start,
timer;

this.isPaused=false;

this.restart=function(){
remain=-1;
clearTimeout(timer);
this.start();
};

this.start=function(){
this.isPaused=false;
// if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
clearTimeout(timer);
remain=remain<=0?duration:remain;
elem.data('paused',false);
start=Date.now();
timer=setTimeout(function(){
if(options.infinite){
_this.restart();//rerun the timer.
}
if(cb&&typeof cb==='function'){cb();}
},remain);
elem.trigger('timerstart.zf.'+nameSpace);
};

this.pause=function(){
this.isPaused=true;
//if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
clearTimeout(timer);
elem.data('paused',true);
var end=Date.now();
remain=remain-(end-start);
elem.trigger('timerpaused.zf.'+nameSpace);
};
}

/**
     * Runs a callback function when images are fully loaded.
     * @param {Object} images - Image(s) to check if loaded.
     * @param {Func} callback - Function to execute when image is fully loaded.
     */
function onImagesLoaded(images,callback){
var self=this,
unloaded=images.length;

if(unloaded===0){
callback();
}

images.each(function(){
// Check if image is loaded
if(this.complete||this.readyState===4||this.readyState==='complete'){
singleImageLoaded();
}
// Force load the image
else{
// fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
var src=$(this).attr('src');
$(this).attr('src',src+(src.indexOf('?')>=0?'&':'?')+new Date().getTime());
$(this).one('load',function(){
singleImageLoaded();
});
}
});

function singleImageLoaded(){
unloaded--;
if(unloaded===0){
callback();
}
}
}

Foundation.Timer=Timer;
Foundation.onImagesLoaded=onImagesLoaded;

}(jQuery);

},{}],12:[function(require,module,exports){
'use strict';//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function($){

$.spotSwipe={
version:'1.0.0',
enabled:'ontouchstart'in document.documentElement,
preventDefault:false,
moveThreshold:75,
timeThreshold:200};


var startPosX,
startPosY,
startTime,
elapsedTime,
isMoving=false;

function onTouchEnd(){
//  alert(this);
this.removeEventListener('touchmove',onTouchMove);
this.removeEventListener('touchend',onTouchEnd);
isMoving=false;
}

function onTouchMove(e){
if($.spotSwipe.preventDefault){e.preventDefault();}
if(isMoving){
var x=e.touches[0].pageX;
var y=e.touches[0].pageY;
var dx=startPosX-x;
var dy=startPosY-y;
var dir;
elapsedTime=new Date().getTime()-startTime;
if(Math.abs(dx)>=$.spotSwipe.moveThreshold&&elapsedTime<=$.spotSwipe.timeThreshold){
dir=dx>0?'left':'right';
}
// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
//   dir = dy > 0 ? 'down' : 'up';
// }
if(dir){
e.preventDefault();
onTouchEnd.call(this);
$(this).trigger('swipe',dir).trigger('swipe'+dir);
}
}
}

function onTouchStart(e){
if(e.touches.length==1){
startPosX=e.touches[0].pageX;
startPosY=e.touches[0].pageY;
isMoving=true;
startTime=new Date().getTime();
this.addEventListener('touchmove',onTouchMove,false);
this.addEventListener('touchend',onTouchEnd,false);
}
}

function init(){
this.addEventListener&&this.addEventListener('touchstart',onTouchStart,false);
}

function teardown(){
this.removeEventListener('touchstart',onTouchStart);
}

$.event.special.swipe={setup:init};

$.each(['left','up','down','right'],function(){
$.event.special['swipe'+this]={setup:function setup(){
$(this).on('swipe',$.noop);
}};
});
})(jQuery);
/****************************************************
             * Method for adding psuedo drag events to elements *
             ***************************************************/
!function($){
$.fn.addTouch=function(){
this.each(function(i,el){
$(el).bind('touchstart touchmove touchend touchcancel',function(){
//we pass the original event object because the jQuery event
//object is normalized to w3c specs and does not provide the TouchList
handleTouch(event);
});
});

var handleTouch=function handleTouch(event){
var touches=event.changedTouches,
first=touches[0],
eventTypes={
touchstart:'mousedown',
touchmove:'mousemove',
touchend:'mouseup'},

type=eventTypes[event.type],
simulatedEvent;


if('MouseEvent'in window&&typeof window.MouseEvent==='function'){
simulatedEvent=new window.MouseEvent(type,{
'bubbles':true,
'cancelable':true,
'screenX':first.screenX,
'screenY':first.screenY,
'clientX':first.clientX,
'clientY':first.clientY});

}else{
simulatedEvent=document.createEvent('MouseEvent');
simulatedEvent.initMouseEvent(type,true,true,window,1,first.screenX,first.screenY,first.clientX,first.clientY,false,false,false,false,0/*left*/,null);
}
first.target.dispatchEvent(simulatedEvent);
};
};
}(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/

},{}],13:[function(require,module,exports){
'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};

!function($){

var MutationObserver=function(){
var prefixes=['WebKit','Moz','O','Ms',''];
for(var i=0;i<prefixes.length;i++){
if(prefixes[i]+'MutationObserver'in window){
return window[prefixes[i]+'MutationObserver'];
}
}
return false;
}();

var triggers=function triggers(el,type){
el.data(type).split(' ').forEach(function(id){
$('#'+id)[type==='close'?'trigger':'triggerHandler'](type+'.zf.trigger',[el]);
});
};
// Elements with [data-open] will reveal a plugin that supports it when clicked.
$(document).on('click.zf.trigger','[data-open]',function(){
triggers($(this),'open');
});

// Elements with [data-close] will close a plugin that supports it when clicked.
// If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
$(document).on('click.zf.trigger','[data-close]',function(){
var id=$(this).data('close');
if(id){
triggers($(this),'close');
}else
{
$(this).trigger('close.zf.trigger');
}
});

// Elements with [data-toggle] will toggle a plugin that supports it when clicked.
$(document).on('click.zf.trigger','[data-toggle]',function(){
var id=$(this).data('toggle');
if(id){
triggers($(this),'toggle');
}else{
$(this).trigger('toggle.zf.trigger');
}
});

// Elements with [data-closable] will respond to close.zf.trigger events.
$(document).on('close.zf.trigger','[data-closable]',function(e){
e.stopPropagation();
var animation=$(this).data('closable');

if(animation!==''){
Foundation.Motion.animateOut($(this),animation,function(){
$(this).trigger('closed.zf');
});
}else{
$(this).fadeOut().trigger('closed.zf');
}
});

$(document).on('focus.zf.trigger blur.zf.trigger','[data-toggle-focus]',function(){
var id=$(this).data('toggle-focus');
$('#'+id).triggerHandler('toggle.zf.trigger',[$(this)]);
});

/**
      * Fires once after all other scripts have loaded
      * @function
      * @private
      */
$(window).on('load',function(){
checkListeners();
});

function checkListeners(){
eventsListener();
resizeListener();
scrollListener();
mutateListener();
closemeListener();
}

//******** only fires this function once on load, if there's something to watch ********
function closemeListener(pluginName){
var yetiBoxes=$('[data-yeti-box]'),
plugNames=['dropdown','tooltip','reveal'];

if(pluginName){
if(typeof pluginName==='string'){
plugNames.push(pluginName);
}else if((typeof pluginName==='undefined'?'undefined':_typeof(pluginName))==='object'&&typeof pluginName[0]==='string'){
plugNames.concat(pluginName);
}else{
console.error('Plugin names must be strings');
}
}
if(yetiBoxes.length){
var listeners=plugNames.map(function(name){
return'closeme.zf.'+name;
}).join(' ');

$(window).off(listeners).on(listeners,function(e,pluginId){
var plugin=e.namespace.split('.')[0];
var plugins=$('[data-'+plugin+']').not('[data-yeti-box="'+pluginId+'"]');

plugins.each(function(){
var _this=$(this);

_this.triggerHandler('close.zf.trigger',[_this]);
});
});
}
}

function resizeListener(debounce){
var timer=void 0,
$nodes=$('[data-resize]');
if($nodes.length){
$(window).off('resize.zf.trigger').
on('resize.zf.trigger',function(e){
if(timer){clearTimeout(timer);}

timer=setTimeout(function(){

if(!MutationObserver){//fallback for IE 9
$nodes.each(function(){
$(this).triggerHandler('resizeme.zf.trigger');
});
}
//trigger all listening elements and signal a resize event
$nodes.attr('data-events',"resize");
},debounce||10);//default time to emit resize event
});
}
}

function scrollListener(debounce){
var timer=void 0,
$nodes=$('[data-scroll]');
if($nodes.length){
$(window).off('scroll.zf.trigger').
on('scroll.zf.trigger',function(e){
if(timer){clearTimeout(timer);}

timer=setTimeout(function(){

if(!MutationObserver){//fallback for IE 9
$nodes.each(function(){
$(this).triggerHandler('scrollme.zf.trigger');
});
}
//trigger all listening elements and signal a scroll event
$nodes.attr('data-events',"scroll");
},debounce||10);//default time to emit scroll event
});
}
}

function mutateListener(debounce){
var $nodes=$('[data-mutate]');
if($nodes.length&&MutationObserver){
//trigger all listening elements and signal a mutate event
//no IE 9 or 10
$nodes.each(function(){
$(this).triggerHandler('mutateme.zf.trigger');
});
}
}

function eventsListener(){
if(!MutationObserver){return false;}
var nodes=document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

//element callback
var listeningElementsMutation=function listeningElementsMutation(mutationRecordsList){
var $target=$(mutationRecordsList[0].target);

//trigger the event handler for the element depending on type
switch(mutationRecordsList[0].type){

case"attributes":
if($target.attr("data-events")==="scroll"&&mutationRecordsList[0].attributeName==="data-events"){
$target.triggerHandler('scrollme.zf.trigger',[$target,window.pageYOffset]);
}
if($target.attr("data-events")==="resize"&&mutationRecordsList[0].attributeName==="data-events"){
$target.triggerHandler('resizeme.zf.trigger',[$target]);
}
if(mutationRecordsList[0].attributeName==="style"){
$target.closest("[data-mutate]").attr("data-events","mutate");
$target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger',[$target.closest("[data-mutate]")]);
}
break;

case"childList":
$target.closest("[data-mutate]").attr("data-events","mutate");
$target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger',[$target.closest("[data-mutate]")]);
break;

default:
return false;
//nothing
}
};

if(nodes.length){
//for each element that needs to listen for resizing, scrolling, or mutation add a single observer
for(var i=0;i<=nodes.length-1;i++){
var elementObserver=new MutationObserver(listeningElementsMutation);
elementObserver.observe(nodes[i],{attributes:true,childList:true,characterData:false,subtree:true,attributeFilter:["data-events","style"]});
}
}
}

// ------------------------------------

// [PH]
// Foundation.CheckWatchers = checkWatchers;
Foundation.IHearYou=checkListeners;
// Foundation.ISeeYou = scrollListener;
// Foundation.IFeelYou = closemeListener;

}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }

},{}],14:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';

// Foundation Core
require('foundation-sites/js/foundation.core.js');

require('foundation-sites/js/foundation.util.box.js');
require('foundation-sites/js/foundation.util.keyboard.js');
require('foundation-sites/js/foundation.util.mediaQuery.js');
require('foundation-sites/js/foundation.util.motion.js');
require('foundation-sites/js/foundation.util.nest.js');
require('foundation-sites/js/foundation.util.timerAndImageLoader.js');
require('foundation-sites/js/foundation.util.touch.js');
require('foundation-sites/js/foundation.util.triggers.js');

require('foundation-sites/js/foundation.drilldown.js');
require('foundation-sites/js/foundation.dropdownMenu.js');
require('foundation-sites/js/foundation.responsiveMenu.js');
require('foundation-sites/js/foundation.offcanvas.js');

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);
var _prepinputs=require('modules/prepinputs.js');var _prepinputs2=_interopRequireDefault(_prepinputs);
var _socialShare=require('modules/socialShare.js');var _socialShare2=_interopRequireDefault(_socialShare);
var _carousel=require('modules/carousel.js');var _carousel2=_interopRequireDefault(_carousel);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}// Foundation Plugins. Add or remove as needed for your site
// Foundation Utilities
(function($){
// Initialize Foundation
$(document).foundation();

// Prepare form inputs
(0,_prepinputs2.default)();
// Initialize social share functionality
// Replace the empty string parameter with your Facebook ID
(0,_socialShare2.default)('');

// Initialize carousels
(0,_carousel2.default)();

// Initialize Plugins
$('.magnific-trigger').magnificPopup({
type:'inline'});


$('.meerkat-cta').meerkat({
background:'rgb(21, 76, 102) repeat-x left top',
height:'120px',
width:'100%',
position:'bottom',
close:'.close-meerkat',
dontShowAgain:'.dont-show',
animationIn:'fade',
animationSpeed:500,
opacity:0.9});

})(_jquery2.default);

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"foundation-sites/js/foundation.core.js":1,"foundation-sites/js/foundation.drilldown.js":2,"foundation-sites/js/foundation.dropdownMenu.js":3,"foundation-sites/js/foundation.offcanvas.js":4,"foundation-sites/js/foundation.responsiveMenu.js":5,"foundation-sites/js/foundation.util.box.js":6,"foundation-sites/js/foundation.util.keyboard.js":7,"foundation-sites/js/foundation.util.mediaQuery.js":8,"foundation-sites/js/foundation.util.motion.js":9,"foundation-sites/js/foundation.util.nest.js":10,"foundation-sites/js/foundation.util.timerAndImageLoader.js":11,"foundation-sites/js/foundation.util.touch.js":12,"foundation-sites/js/foundation.util.triggers.js":13,"modules/carousel.js":15,"modules/prepinputs.js":16,"modules/socialShare.js":17}],15:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);
require('vendor/jquery.slick.js');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var carousel=function carousel(){
(0,_jquery2.default)('.js-carousel').slick({
adaptiveHeight:true,
dots:false,
centerMode:true,
slidesToShow:1,
arrows:true,
centerPadding:'0px',
infinite:false,
prevArrow:'<button type="button" class="tiny">'+
'<i class="fa fa-chevron-left"></i></button>',
nextArrow:'<button type="button" class="tiny">'+
'<i class="fa fa-chevron-right"></i></button>'});

};exports.default=

carousel;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{"vendor/jquery.slick.js":18}],16:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var prepinputs=function prepinputs(){
(0,_jquery2.default)('input, textarea').placeholder().
filter('[type="text"], [type="email"], [type="tel"], [type="password"]').
addClass('text').end().
filter('[type="checkbox"]').addClass('checkbox').end().
filter('[type="radio"]').addClass('radiobutton').end().
filter('[type="submit"]').addClass('submit').end().
filter('[type="image"]').addClass('buttonImage');
};exports.default=

prepinputs;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}],17:[function(require,module,exports){
(function(global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports,"__esModule",{value:true});

var _jquery=typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null;var _jquery2=_interopRequireDefault(_jquery);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}

var socialShare=function socialShare(fbId){
var $body=(0,_jquery2.default)('body');

// Facebook sharing with the SDK
_jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function(){
$body.on('click.sharer-fb','.sharer-fb',function(e){
var $link=(0,_jquery2.default)(e.currentTarget);
var options={
method:'feed',
display:'popup'};

var newUrl=$link.data('redirect-to')?
$link.data('redirect-to'):null;

e.preventDefault();

window.FB.init({
appId:fbId,
xfbml:false,
version:'v2.0',
status:false,
cookie:true});


if($link.data('title')){
options.name=$link.data('title');
}

if($link.data('url')){
options.link=$link.data('url');
}

if($link.data('picture')){
options.picture=$link.data('picture');
}

if($link.data('description')){
options.description=$link.data('description');
}

window.FB.ui(options,function(response){
if(newUrl){
window.location.href=newUrl;
}
});
});
});

// Twitter sharing
$body.on('click.sharer-tw','.sharer-tw',function(e){
var $link=(0,_jquery2.default)(e.currentTarget);
var url=$link.data('url');
var text=$link.data('description');
var via=$link.data('source');
var twitterURL='https://twitter.com/share?url='+encodeURIComponent(url);

e.preventDefault();

if(text){
twitterURL+='&text='+encodeURIComponent(text);
}
if(via){
twitterURL+='&via='+encodeURIComponent(via);
}
window.open(twitterURL,'tweet',
'width=500,height=384,menubar=no,status=no,toolbar=no');
});

// LinkedIn sharing
$body.on('click.sharer-li','.sharer-li',function(e){
var $link=(0,_jquery2.default)(e.target);
var url=$link.data('url');
var title=$link.data('title');
var summary=$link.data('description');
var source=$link.data('source');
var linkedinURL='https://www.linkedin.com/shareArticle?mini=true&url='+
encodeURIComponent(url);

e.preventDefault();

if(title){
linkedinURL+='&title='+encodeURIComponent(title);
}else{
linkedinURL+='&title=';
}

if(summary){
linkedinURL+='&summary='+
encodeURIComponent(summary.substring(0,256));
}

if(source){
linkedinURL+='&source='+encodeURIComponent(source);
}

window.open(linkedinURL,'linkedin',
'width=520,height=570,menubar=no,status=no,toolbar=no');
});
};exports.default=

socialShare;

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}],18:[function(require,module,exports){
(function(global){
'use strict';var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};/*
                                                                                                                                                                                                                                                                                            _ _      _       _
                                                                                                                                                                                                                                                                                        ___| (_) ___| | __  (_)___
                                                                                                                                                                                                                                                                                       / __| | |/ __| |/ /  | / __|
                                                                                                                                                                                                                                                                                       \__ \ | | (__|   < _ | \__ \
                                                                                                                                                                                                                                                                                       |___/_|_|\___|_|\_(_)/ |___/
                                                                                                                                                                                                                                                                                                          |__/
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        Version: 1.5.0
                                                                                                                                                                                                                                                                                         Author: Ken Wheeler
                                                                                                                                                                                                                                                                                        Website: http://kenwheeler.github.io
                                                                                                                                                                                                                                                                                           Docs: http://kenwheeler.github.io/slick
                                                                                                                                                                                                                                                                                           Repo: http://github.com/kenwheeler/slick
                                                                                                                                                                                                                                                                                         Issues: http://github.com/kenwheeler/slick/issues
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory){
'use strict';
if(typeof define==='function'&&define.amd){
define(['jquery'],factory);
}else if(typeof exports!=='undefined'){
module.exports=factory(typeof window!=="undefined"?window['jQuery']:typeof global!=="undefined"?global['jQuery']:null);
}else{
factory(jQuery);
}

})(function($){
'use strict';
var Slick=window.Slick||{};

Slick=function(){

var instanceUid=0;

function Slick(element,settings){

var _=this,
dataSettings,responsiveSettings,breakpoint;

_.defaults={
accessibility:true,
adaptiveHeight:false,
appendArrows:$(element),
appendDots:$(element),
arrows:true,
asNavFor:null,
prevArrow:'<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
nextArrow:'<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
autoplay:false,
autoplaySpeed:3000,
centerMode:false,
centerPadding:'50px',
cssEase:'ease',
customPaging:function customPaging(slider,i){
return'<button type="button" data-role="none">'+(i+1)+'</button>';
},
dots:false,
dotsClass:'slick-dots',
draggable:true,
easing:'linear',
edgeFriction:0.35,
fade:false,
focusOnSelect:false,
infinite:true,
initialSlide:0,
lazyLoad:'ondemand',
mobileFirst:false,
pauseOnHover:true,
pauseOnDotsHover:false,
respondTo:'window',
responsive:null,
rows:1,
rtl:false,
slide:'',
slidesPerRow:1,
slidesToShow:1,
slidesToScroll:1,
speed:500,
swipe:true,
swipeToSlide:false,
touchMove:true,
touchThreshold:5,
useCSS:true,
variableWidth:false,
vertical:false,
verticalSwiping:false,
waitForAnimate:true};


_.initials={
animating:false,
dragging:false,
autoPlayTimer:null,
currentDirection:0,
currentLeft:null,
currentSlide:0,
direction:1,
$dots:null,
listWidth:null,
listHeight:null,
loadIndex:0,
$nextArrow:null,
$prevArrow:null,
slideCount:null,
slideWidth:null,
$slideTrack:null,
$slides:null,
sliding:false,
slideOffset:0,
swipeLeft:null,
$list:null,
touchObject:{},
transformsEnabled:false};


$.extend(_,_.initials);

_.activeBreakpoint=null;
_.animType=null;
_.animProp=null;
_.breakpoints=[];
_.breakpointSettings=[];
_.cssTransitions=false;
_.hidden='hidden';
_.paused=false;
_.positionProp=null;
_.respondTo=null;
_.rowCount=1;
_.shouldClick=true;
_.$slider=$(element);
_.$slidesCache=null;
_.transformType=null;
_.transitionType=null;
_.visibilityChange='visibilitychange';
_.windowWidth=0;
_.windowTimer=null;

dataSettings=$(element).data('slick')||{};

_.options=$.extend({},_.defaults,dataSettings,settings);

_.currentSlide=_.options.initialSlide;

_.originalSettings=_.options;
responsiveSettings=_.options.responsive||null;

if(responsiveSettings&&responsiveSettings.length>-1){
_.respondTo=_.options.respondTo||'window';
for(breakpoint in responsiveSettings){
if(responsiveSettings.hasOwnProperty(breakpoint)){
_.breakpoints.push(responsiveSettings[
breakpoint].breakpoint);
_.breakpointSettings[responsiveSettings[
breakpoint].breakpoint]=
responsiveSettings[breakpoint].settings;
}
}
_.breakpoints.sort(function(a,b){
if(_.options.mobileFirst===true){
return a-b;
}else{
return b-a;
}
});
}

if(typeof document.mozHidden!=='undefined'){
_.hidden='mozHidden';
_.visibilityChange='mozvisibilitychange';
}else if(typeof document.msHidden!=='undefined'){
_.hidden='msHidden';
_.visibilityChange='msvisibilitychange';
}else if(typeof document.webkitHidden!=='undefined'){
_.hidden='webkitHidden';
_.visibilityChange='webkitvisibilitychange';
}

_.autoPlay=$.proxy(_.autoPlay,_);
_.autoPlayClear=$.proxy(_.autoPlayClear,_);
_.changeSlide=$.proxy(_.changeSlide,_);
_.clickHandler=$.proxy(_.clickHandler,_);
_.selectHandler=$.proxy(_.selectHandler,_);
_.setPosition=$.proxy(_.setPosition,_);
_.swipeHandler=$.proxy(_.swipeHandler,_);
_.dragHandler=$.proxy(_.dragHandler,_);
_.keyHandler=$.proxy(_.keyHandler,_);
_.autoPlayIterator=$.proxy(_.autoPlayIterator,_);

_.instanceUid=instanceUid++;

// A simple way to check for HTML strings
// Strict HTML recognition (must start with <)
// Extracted from jQuery v1.11 source
_.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/;

_.init();

_.checkResponsive(true);

}

return Slick;

}();

Slick.prototype.addSlide=Slick.prototype.slickAdd=function(markup,index,addBefore){

var _=this;

if(typeof index==='boolean'){
addBefore=index;
index=null;
}else if(index<0||index>=_.slideCount){
return false;
}

_.unload();

if(typeof index==='number'){
if(index===0&&_.$slides.length===0){
$(markup).appendTo(_.$slideTrack);
}else if(addBefore){
$(markup).insertBefore(_.$slides.eq(index));
}else{
$(markup).insertAfter(_.$slides.eq(index));
}
}else{
if(addBefore===true){
$(markup).prependTo(_.$slideTrack);
}else{
$(markup).appendTo(_.$slideTrack);
}
}

_.$slides=_.$slideTrack.children(this.options.slide);

_.$slideTrack.children(this.options.slide).detach();

_.$slideTrack.append(_.$slides);

_.$slides.each(function(index,element){
$(element).attr('data-slick-index',index);
});

_.$slidesCache=_.$slides;

_.reinit();

};

Slick.prototype.animateHeight=function(){
var _=this;
if(_.options.slidesToShow===1&&_.options.adaptiveHeight===true&&_.options.vertical===false){
var targetHeight=_.$slides.eq(_.currentSlide).outerHeight(true);
_.$list.animate({
height:targetHeight},
_.options.speed);
}
};

Slick.prototype.animateSlide=function(targetLeft,callback){

var animProps={},
_=this;

_.animateHeight();

if(_.options.rtl===true&&_.options.vertical===false){
targetLeft=-targetLeft;
}
if(_.transformsEnabled===false){
if(_.options.vertical===false){
_.$slideTrack.animate({
left:targetLeft},
_.options.speed,_.options.easing,callback);
}else{
_.$slideTrack.animate({
top:targetLeft},
_.options.speed,_.options.easing,callback);
}

}else{

if(_.cssTransitions===false){
if(_.options.rtl===true){
_.currentLeft=-_.currentLeft;
}
$({
animStart:_.currentLeft}).
animate({
animStart:targetLeft},
{
duration:_.options.speed,
easing:_.options.easing,
step:function step(now){
now=Math.ceil(now);
if(_.options.vertical===false){
animProps[_.animType]='translate('+
now+'px, 0px)';
_.$slideTrack.css(animProps);
}else{
animProps[_.animType]='translate(0px,'+
now+'px)';
_.$slideTrack.css(animProps);
}
},
complete:function complete(){
if(callback){
callback.call();
}
}});


}else{

_.applyTransition();
targetLeft=Math.ceil(targetLeft);

if(_.options.vertical===false){
animProps[_.animType]='translate3d('+targetLeft+'px, 0px, 0px)';
}else{
animProps[_.animType]='translate3d(0px,'+targetLeft+'px, 0px)';
}
_.$slideTrack.css(animProps);

if(callback){
setTimeout(function(){

_.disableTransition();

callback.call();
},_.options.speed);
}

}

}

};

Slick.prototype.asNavFor=function(index){
var _=this,
asNavFor=_.options.asNavFor!==null?$(_.options.asNavFor).slick('getSlick'):null;
if(asNavFor!==null)asNavFor.slideHandler(index,true);
};

Slick.prototype.applyTransition=function(slide){

var _=this,
transition={};

if(_.options.fade===false){
transition[_.transitionType]=_.transformType+' '+_.options.speed+'ms '+_.options.cssEase;
}else{
transition[_.transitionType]='opacity '+_.options.speed+'ms '+_.options.cssEase;
}

if(_.options.fade===false){
_.$slideTrack.css(transition);
}else{
_.$slides.eq(slide).css(transition);
}

};

Slick.prototype.autoPlay=function(){

var _=this;

if(_.autoPlayTimer){
clearInterval(_.autoPlayTimer);
}

if(_.slideCount>_.options.slidesToShow&&_.paused!==true){
_.autoPlayTimer=setInterval(_.autoPlayIterator,
_.options.autoplaySpeed);
}

};

Slick.prototype.autoPlayClear=function(){

var _=this;
if(_.autoPlayTimer){
clearInterval(_.autoPlayTimer);
}

};

Slick.prototype.autoPlayIterator=function(){

var _=this;

if(_.options.infinite===false){

if(_.direction===1){

if(_.currentSlide+1===_.slideCount-
1){
_.direction=0;
}

_.slideHandler(_.currentSlide+_.options.slidesToScroll);

}else{

if(_.currentSlide-1===0){

_.direction=1;

}

_.slideHandler(_.currentSlide-_.options.slidesToScroll);

}

}else{

_.slideHandler(_.currentSlide+_.options.slidesToScroll);

}

};

Slick.prototype.buildArrows=function(){

var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){

_.$prevArrow=$(_.options.prevArrow);
_.$nextArrow=$(_.options.nextArrow);

if(_.htmlExpr.test(_.options.prevArrow)){
_.$prevArrow.appendTo(_.options.appendArrows);
}

if(_.htmlExpr.test(_.options.nextArrow)){
_.$nextArrow.appendTo(_.options.appendArrows);
}

if(_.options.infinite!==true){
_.$prevArrow.addClass('slick-disabled');
}

}

};

Slick.prototype.buildDots=function(){

var _=this,
i,dotString;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){

dotString='<ul class="'+_.options.dotsClass+'">';

for(i=0;i<=_.getDotCount();i+=1){
dotString+='<li>'+_.options.customPaging.call(this,_,i)+'</li>';
}

dotString+='</ul>';

_.$dots=$(dotString).appendTo(
_.options.appendDots);

_.$dots.find('li').first().addClass('slick-active').attr('aria-hidden','false');

}

};

Slick.prototype.buildOut=function(){

var _=this;

_.$slides=_.$slider.children(
':not(.slick-cloned)').addClass(
'slick-slide');
_.slideCount=_.$slides.length;

_.$slides.each(function(index,element){
$(element).attr('data-slick-index',index);
});

_.$slidesCache=_.$slides;

_.$slider.addClass('slick-slider');

_.$slideTrack=_.slideCount===0?
$('<div class="slick-track"/>').appendTo(_.$slider):
_.$slides.wrapAll('<div class="slick-track"/>').parent();

_.$list=_.$slideTrack.wrap(
'<div aria-live="polite" class="slick-list"/>').parent();
_.$slideTrack.css('opacity',0);

if(_.options.centerMode===true||_.options.swipeToSlide===true){
_.options.slidesToScroll=1;
}

$('img[data-lazy]',_.$slider).not('[src]').addClass('slick-loading');

_.setupInfinite();

_.buildArrows();

_.buildDots();

_.updateDots();

if(_.options.accessibility===true){
_.$list.prop('tabIndex',0);
}

_.setSlideClasses(typeof this.currentSlide==='number'?this.currentSlide:0);

if(_.options.draggable===true){
_.$list.addClass('draggable');
}

};

Slick.prototype.buildRows=function(){

var _=this,a,b,c,newSlides,numOfSlides,originalSlides,slidesPerSection;

newSlides=document.createDocumentFragment();
originalSlides=_.$slider.children();

if(_.options.rows>1){
slidesPerSection=_.options.slidesPerRow*_.options.rows;
numOfSlides=Math.ceil(
originalSlides.length/slidesPerSection);


for(a=0;a<numOfSlides;a++){
var slide=document.createElement('div');
for(b=0;b<_.options.rows;b++){
var row=document.createElement('div');
for(c=0;c<_.options.slidesPerRow;c++){
var target=a*slidesPerSection+(b*_.options.slidesPerRow+c);
if(originalSlides.get(target)){
row.appendChild(originalSlides.get(target));
}
}
slide.appendChild(row);
}
newSlides.appendChild(slide);
};
_.$slider.html(newSlides);
_.$slider.children().children().children().
width(100/_.options.slidesPerRow+"%").
css({'display':'inline-block'});
};

};

Slick.prototype.checkResponsive=function(initial){

var _=this,
breakpoint,targetBreakpoint,respondToWidth;
var sliderWidth=_.$slider.width();
var windowWidth=window.innerWidth||$(window).width();
if(_.respondTo==='window'){
respondToWidth=windowWidth;
}else if(_.respondTo==='slider'){
respondToWidth=sliderWidth;
}else if(_.respondTo==='min'){
respondToWidth=Math.min(windowWidth,sliderWidth);
}

if(_.originalSettings.responsive&&_.originalSettings.
responsive.length>-1&&_.originalSettings.responsive!==null){

targetBreakpoint=null;

for(breakpoint in _.breakpoints){
if(_.breakpoints.hasOwnProperty(breakpoint)){
if(_.originalSettings.mobileFirst===false){
if(respondToWidth<_.breakpoints[breakpoint]){
targetBreakpoint=_.breakpoints[breakpoint];
}
}else{
if(respondToWidth>_.breakpoints[breakpoint]){
targetBreakpoint=_.breakpoints[breakpoint];
}
}
}
}

if(targetBreakpoint!==null){
if(_.activeBreakpoint!==null){
if(targetBreakpoint!==_.activeBreakpoint){
_.activeBreakpoint=
targetBreakpoint;
if(_.breakpointSettings[targetBreakpoint]==='unslick'){
_.unslick();
}else{
_.options=$.extend({},_.originalSettings,
_.breakpointSettings[
targetBreakpoint]);
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}
}else{
_.activeBreakpoint=targetBreakpoint;
if(_.breakpointSettings[targetBreakpoint]==='unslick'){
_.unslick();
}else{
_.options=$.extend({},_.originalSettings,
_.breakpointSettings[
targetBreakpoint]);
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}
}else{
if(_.activeBreakpoint!==null){
_.activeBreakpoint=null;
_.options=_.originalSettings;
if(initial===true)
_.currentSlide=_.options.initialSlide;
_.refresh();
}
}

}

};

Slick.prototype.changeSlide=function(event,dontAnimate){

var _=this,
$target=$(event.target),
indexOffset,slideOffset,unevenOffset;

// If target is a link, prevent default action.
$target.is('a')&&event.preventDefault();

unevenOffset=_.slideCount%_.options.slidesToScroll!==0;
indexOffset=unevenOffset?0:(_.slideCount-_.currentSlide)%_.options.slidesToScroll;

switch(event.data.message){

case'previous':
slideOffset=indexOffset===0?_.options.slidesToScroll:_.options.slidesToShow-indexOffset;
if(_.slideCount>_.options.slidesToShow){
_.slideHandler(_.currentSlide-slideOffset,false,dontAnimate);
}
break;

case'next':
slideOffset=indexOffset===0?_.options.slidesToScroll:indexOffset;
if(_.slideCount>_.options.slidesToShow){
_.slideHandler(_.currentSlide+slideOffset,false,dontAnimate);
}
break;

case'index':
var index=event.data.index===0?0:
event.data.index||$(event.target).parent().index()*_.options.slidesToScroll;

_.slideHandler(_.checkNavigable(index),false,dontAnimate);
break;

default:
return;}


};

Slick.prototype.checkNavigable=function(index){

var _=this,
navigables,prevNavigable;

navigables=_.getNavigableIndexes();
prevNavigable=0;
if(index>navigables[navigables.length-1]){
index=navigables[navigables.length-1];
}else{
for(var n in navigables){
if(index<navigables[n]){
index=prevNavigable;
break;
}
prevNavigable=navigables[n];
}
}

return index;
};

Slick.prototype.cleanUpEvents=function(){

var _=this;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
$('li',_.$dots).off('click.slick',_.changeSlide);
}

if(_.options.dots===true&&_.options.pauseOnDotsHover===true&&_.options.autoplay===true){
$('li',_.$dots).
off('mouseenter.slick',_.setPaused.bind(_,true)).
off('mouseleave.slick',_.setPaused.bind(_,false));
}

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow&&_.$prevArrow.off('click.slick',_.changeSlide);
_.$nextArrow&&_.$nextArrow.off('click.slick',_.changeSlide);
}

_.$list.off('touchstart.slick mousedown.slick',_.swipeHandler);
_.$list.off('touchmove.slick mousemove.slick',_.swipeHandler);
_.$list.off('touchend.slick mouseup.slick',_.swipeHandler);
_.$list.off('touchcancel.slick mouseleave.slick',_.swipeHandler);

_.$list.off('click.slick',_.clickHandler);

if(_.options.autoplay===true){
$(document).off(_.visibilityChange,_.visibility);
}

_.$list.off('mouseenter.slick',_.setPaused.bind(_,true));
_.$list.off('mouseleave.slick',_.setPaused.bind(_,false));

if(_.options.accessibility===true){
_.$list.off('keydown.slick',_.keyHandler);
}

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().off('click.slick',_.selectHandler);
}

$(window).off('orientationchange.slick.slick-'+_.instanceUid,_.orientationChange);

$(window).off('resize.slick.slick-'+_.instanceUid,_.resize);

$('[draggable!=true]',_.$slideTrack).off('dragstart',_.preventDefault);

$(window).off('load.slick.slick-'+_.instanceUid,_.setPosition);
$(document).off('ready.slick.slick-'+_.instanceUid,_.setPosition);
};

Slick.prototype.cleanUpRows=function(){

var _=this,originalSlides;

if(_.options.rows>1){
originalSlides=_.$slides.children().children();
originalSlides.removeAttr('style');
_.$slider.html(originalSlides);
}

};

Slick.prototype.clickHandler=function(event){

var _=this;

if(_.shouldClick===false){
event.stopImmediatePropagation();
event.stopPropagation();
event.preventDefault();
}

};

Slick.prototype.destroy=function(){

var _=this;

_.autoPlayClear();

_.touchObject={};

_.cleanUpEvents();

$('.slick-cloned',_.$slider).remove();

if(_.$dots){
_.$dots.remove();
}
if(_.$prevArrow&&_typeof(_.options.prevArrow)!=='object'){
_.$prevArrow.remove();
}
if(_.$nextArrow&&_typeof(_.options.nextArrow)!=='object'){
_.$nextArrow.remove();
}

if(_.$slides){
_.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
attr('aria-hidden','true').
removeAttr('data-slick-index').
css({
position:'',
left:'',
top:'',
zIndex:'',
opacity:'',
width:''});


_.$slider.html(_.$slides);
}

_.cleanUpRows();

_.$slider.removeClass('slick-slider');
_.$slider.removeClass('slick-initialized');

};

Slick.prototype.disableTransition=function(slide){

var _=this,
transition={};

transition[_.transitionType]='';

if(_.options.fade===false){
_.$slideTrack.css(transition);
}else{
_.$slides.eq(slide).css(transition);
}

};

Slick.prototype.fadeSlide=function(slideIndex,callback){

var _=this;

if(_.cssTransitions===false){

_.$slides.eq(slideIndex).css({
zIndex:1000});


_.$slides.eq(slideIndex).animate({
opacity:1},
_.options.speed,_.options.easing,callback);

}else{

_.applyTransition(slideIndex);

_.$slides.eq(slideIndex).css({
opacity:1,
zIndex:1000});


if(callback){
setTimeout(function(){

_.disableTransition(slideIndex);

callback.call();
},_.options.speed);
}

}

};

Slick.prototype.filterSlides=Slick.prototype.slickFilter=function(filter){

var _=this;

if(filter!==null){

_.unload();

_.$slideTrack.children(this.options.slide).detach();

_.$slidesCache.filter(filter).appendTo(_.$slideTrack);

_.reinit();

}

};

Slick.prototype.getCurrent=Slick.prototype.slickCurrentSlide=function(){

var _=this;
return _.currentSlide;

};

Slick.prototype.getDotCount=function(){

var _=this;

var breakPoint=0;
var counter=0;
var pagerQty=0;

if(_.options.infinite===true){
pagerQty=Math.ceil(_.slideCount/_.options.slidesToScroll);
}else if(_.options.centerMode===true){
pagerQty=_.slideCount;
}else{
while(breakPoint<_.slideCount){
++pagerQty;
breakPoint=counter+_.options.slidesToShow;
counter+=_.options.slidesToScroll<=_.options.slidesToShow?_.options.slidesToScroll:_.options.slidesToShow;
}
}

return pagerQty-1;

};

Slick.prototype.getLeft=function(slideIndex){

var _=this,
targetLeft,
verticalHeight,
verticalOffset=0,
targetSlide;

_.slideOffset=0;
verticalHeight=_.$slides.first().outerHeight();

if(_.options.infinite===true){
if(_.slideCount>_.options.slidesToShow){
_.slideOffset=_.slideWidth*_.options.slidesToShow*-1;
verticalOffset=verticalHeight*_.options.slidesToShow*-1;
}
if(_.slideCount%_.options.slidesToScroll!==0){
if(slideIndex+_.options.slidesToScroll>_.slideCount&&_.slideCount>_.options.slidesToShow){
if(slideIndex>_.slideCount){
_.slideOffset=(_.options.slidesToShow-(slideIndex-_.slideCount))*_.slideWidth*-1;
verticalOffset=(_.options.slidesToShow-(slideIndex-_.slideCount))*verticalHeight*-1;
}else{
_.slideOffset=_.slideCount%_.options.slidesToScroll*_.slideWidth*-1;
verticalOffset=_.slideCount%_.options.slidesToScroll*verticalHeight*-1;
}
}
}
}else{
if(slideIndex+_.options.slidesToShow>_.slideCount){
_.slideOffset=(slideIndex+_.options.slidesToShow-_.slideCount)*_.slideWidth;
verticalOffset=(slideIndex+_.options.slidesToShow-_.slideCount)*verticalHeight;
}
}

if(_.slideCount<=_.options.slidesToShow){
_.slideOffset=0;
verticalOffset=0;
}

if(_.options.centerMode===true&&_.options.infinite===true){
_.slideOffset+=_.slideWidth*Math.floor(_.options.slidesToShow/2)-_.slideWidth;
}else if(_.options.centerMode===true){
_.slideOffset=0;
_.slideOffset+=_.slideWidth*Math.floor(_.options.slidesToShow/2);
}

if(_.options.vertical===false){
targetLeft=slideIndex*_.slideWidth*-1+_.slideOffset;
}else{
targetLeft=slideIndex*verticalHeight*-1+verticalOffset;
}

if(_.options.variableWidth===true){

if(_.slideCount<=_.options.slidesToShow||_.options.infinite===false){
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex);
}else{
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex+_.options.slidesToShow);
}

targetLeft=targetSlide[0]?targetSlide[0].offsetLeft*-1:0;

if(_.options.centerMode===true){
if(_.options.infinite===false){
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex);
}else{
targetSlide=_.$slideTrack.children('.slick-slide').eq(slideIndex+_.options.slidesToShow+1);
}
targetLeft=targetSlide[0]?targetSlide[0].offsetLeft*-1:0;
targetLeft+=(_.$list.width()-targetSlide.outerWidth())/2;
}
}

return targetLeft;

};

Slick.prototype.getOption=Slick.prototype.slickGetOption=function(option){

var _=this;

return _.options[option];

};

Slick.prototype.getNavigableIndexes=function(){

var _=this,
breakPoint=0,
counter=0,
indexes=[],
max;

if(_.options.infinite===false){
max=_.slideCount-_.options.slidesToShow+1;
if(_.options.centerMode===true)max=_.slideCount;
}else{
breakPoint=_.options.slidesToScroll*-1;
counter=_.options.slidesToScroll*-1;
max=_.slideCount*2;
}

while(breakPoint<max){
indexes.push(breakPoint);
breakPoint=counter+_.options.slidesToScroll;
counter+=_.options.slidesToScroll<=_.options.slidesToShow?_.options.slidesToScroll:_.options.slidesToShow;
}

return indexes;

};

Slick.prototype.getSlick=function(){

return this;

};

Slick.prototype.getSlideCount=function(){

var _=this,
slidesTraversed,swipedSlide,centerOffset;

centerOffset=_.options.centerMode===true?_.slideWidth*Math.floor(_.options.slidesToShow/2):0;

if(_.options.swipeToSlide===true){
_.$slideTrack.find('.slick-slide').each(function(index,slide){
if(slide.offsetLeft-centerOffset+$(slide).outerWidth()/2>_.swipeLeft*-1){
swipedSlide=slide;
return false;
}
});

slidesTraversed=Math.abs($(swipedSlide).attr('data-slick-index')-_.currentSlide)||1;

return slidesTraversed;

}else{
return _.options.slidesToScroll;
}

};

Slick.prototype.goTo=Slick.prototype.slickGoTo=function(slide,dontAnimate){

var _=this;

_.changeSlide({
data:{
message:'index',
index:parseInt(slide)}},

dontAnimate);

};

Slick.prototype.init=function(){

var _=this;

if(!$(_.$slider).hasClass('slick-initialized')){

$(_.$slider).addClass('slick-initialized');
_.buildRows();
_.buildOut();
_.setProps();
_.startLoad();
_.loadSlider();
_.initializeEvents();
_.updateArrows();
_.updateDots();
}

_.$slider.trigger('init',[_]);

};

Slick.prototype.initArrowEvents=function(){

var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.on('click.slick',{
message:'previous'},
_.changeSlide);
_.$nextArrow.on('click.slick',{
message:'next'},
_.changeSlide);
}

};

Slick.prototype.initDotEvents=function(){

var _=this;

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){
$('li',_.$dots).on('click.slick',{
message:'index'},
_.changeSlide);
}

if(_.options.dots===true&&_.options.pauseOnDotsHover===true&&_.options.autoplay===true){
$('li',_.$dots).
on('mouseenter.slick',_.setPaused.bind(_,true)).
on('mouseleave.slick',_.setPaused.bind(_,false));
}

};

Slick.prototype.initializeEvents=function(){

var _=this;

_.initArrowEvents();

_.initDotEvents();

_.$list.on('touchstart.slick mousedown.slick',{
action:'start'},
_.swipeHandler);
_.$list.on('touchmove.slick mousemove.slick',{
action:'move'},
_.swipeHandler);
_.$list.on('touchend.slick mouseup.slick',{
action:'end'},
_.swipeHandler);
_.$list.on('touchcancel.slick mouseleave.slick',{
action:'end'},
_.swipeHandler);

_.$list.on('click.slick',_.clickHandler);

if(_.options.autoplay===true){
$(document).on(_.visibilityChange,_.visibility.bind(_));
}

_.$list.on('mouseenter.slick',_.setPaused.bind(_,true));
_.$list.on('mouseleave.slick',_.setPaused.bind(_,false));

if(_.options.accessibility===true){
_.$list.on('keydown.slick',_.keyHandler);
}

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().on('click.slick',_.selectHandler);
}

$(window).on('orientationchange.slick.slick-'+_.instanceUid,_.orientationChange.bind(_));

$(window).on('resize.slick.slick-'+_.instanceUid,_.resize.bind(_));

$('[draggable!=true]',_.$slideTrack).on('dragstart',_.preventDefault);

$(window).on('load.slick.slick-'+_.instanceUid,_.setPosition);
$(document).on('ready.slick.slick-'+_.instanceUid,_.setPosition);

};

Slick.prototype.initUI=function(){

var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){

_.$prevArrow.show();
_.$nextArrow.show();

}

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){

_.$dots.show();

}

if(_.options.autoplay===true){

_.autoPlay();

}

};

Slick.prototype.keyHandler=function(event){

var _=this;

if(event.keyCode===37&&_.options.accessibility===true){
_.changeSlide({
data:{
message:'previous'}});


}else if(event.keyCode===39&&_.options.accessibility===true){
_.changeSlide({
data:{
message:'next'}});


}

};

Slick.prototype.lazyLoad=function(){

var _=this,
loadRange,cloneRange,rangeStart,rangeEnd;

function loadImages(imagesScope){
$('img[data-lazy]',imagesScope).each(function(){
var image=$(this),
imageSource=$(this).attr('data-lazy'),
imageToLoad=document.createElement('img');

imageToLoad.onload=function(){
image.animate({
opacity:1},
200);
};
imageToLoad.src=imageSource;

image.
css({
opacity:0}).

attr('src',imageSource).
removeAttr('data-lazy').
removeClass('slick-loading');
});
}

if(_.options.centerMode===true){
if(_.options.infinite===true){
rangeStart=_.currentSlide+(_.options.slidesToShow/2+1);
rangeEnd=rangeStart+_.options.slidesToShow+2;
}else{
rangeStart=Math.max(0,_.currentSlide-(_.options.slidesToShow/2+1));
rangeEnd=2+(_.options.slidesToShow/2+1)+_.currentSlide;
}
}else{
rangeStart=_.options.infinite?_.options.slidesToShow+_.currentSlide:_.currentSlide;
rangeEnd=rangeStart+_.options.slidesToShow;
if(_.options.fade===true){
if(rangeStart>0)rangeStart--;
if(rangeEnd<=_.slideCount)rangeEnd++;
}
}

loadRange=_.$slider.find('.slick-slide').slice(rangeStart,rangeEnd);
loadImages(loadRange);

if(_.slideCount<=_.options.slidesToShow){
cloneRange=_.$slider.find('.slick-slide');
loadImages(cloneRange);
}else
if(_.currentSlide>=_.slideCount-_.options.slidesToShow){
cloneRange=_.$slider.find('.slick-cloned').slice(0,_.options.slidesToShow);
loadImages(cloneRange);
}else if(_.currentSlide===0){
cloneRange=_.$slider.find('.slick-cloned').slice(_.options.slidesToShow*-1);
loadImages(cloneRange);
}

};

Slick.prototype.loadSlider=function(){

var _=this;

_.setPosition();

_.$slideTrack.css({
opacity:1});


_.$slider.removeClass('slick-loading');

_.initUI();

if(_.options.lazyLoad==='progressive'){
_.progressiveLazyLoad();
}

};

Slick.prototype.next=Slick.prototype.slickNext=function(){

var _=this;

_.changeSlide({
data:{
message:'next'}});



};

Slick.prototype.orientationChange=function(){

var _=this;

_.checkResponsive();
_.setPosition();

};

Slick.prototype.pause=Slick.prototype.slickPause=function(){

var _=this;

_.autoPlayClear();
_.paused=true;

};

Slick.prototype.play=Slick.prototype.slickPlay=function(){

var _=this;

_.paused=false;
_.autoPlay();

};

Slick.prototype.postSlide=function(index){

var _=this;

_.$slider.trigger('afterChange',[_,index]);

_.animating=false;

_.setPosition();

_.swipeLeft=null;

if(_.options.autoplay===true&&_.paused===false){
_.autoPlay();
}

};

Slick.prototype.prev=Slick.prototype.slickPrev=function(){

var _=this;

_.changeSlide({
data:{
message:'previous'}});



};

Slick.prototype.preventDefault=function(e){
e.preventDefault();
};

Slick.prototype.progressiveLazyLoad=function(){

var _=this,
imgCount,targetImage;

imgCount=$('img[data-lazy]',_.$slider).length;

if(imgCount>0){
targetImage=$('img[data-lazy]',_.$slider).first();
targetImage.attr('src',targetImage.attr('data-lazy')).removeClass('slick-loading').load(function(){
targetImage.removeAttr('data-lazy');
_.progressiveLazyLoad();

if(_.options.adaptiveHeight===true){
_.setPosition();
}
}).
error(function(){
targetImage.removeAttr('data-lazy');
_.progressiveLazyLoad();
});
}

};

Slick.prototype.refresh=function(){

var _=this,
currentSlide=_.currentSlide;

_.destroy();

$.extend(_,_.initials);

_.init();

_.changeSlide({
data:{
message:'index',
index:currentSlide}},

false);

};

Slick.prototype.reinit=function(){

var _=this;

_.$slides=_.$slideTrack.children(_.options.slide).addClass(
'slick-slide');

_.slideCount=_.$slides.length;

if(_.currentSlide>=_.slideCount&&_.currentSlide!==0){
_.currentSlide=_.currentSlide-_.options.slidesToScroll;
}

if(_.slideCount<=_.options.slidesToShow){
_.currentSlide=0;
}

_.setProps();

_.setupInfinite();

_.buildArrows();

_.updateArrows();

_.initArrowEvents();

_.buildDots();

_.updateDots();

_.initDotEvents();

if(_.options.focusOnSelect===true){
$(_.$slideTrack).children().on('click.slick',_.selectHandler);
}

_.setSlideClasses(0);

_.setPosition();

_.$slider.trigger('reInit',[_]);

};

Slick.prototype.resize=function(){

var _=this;

if($(window).width()!==_.windowWidth){
clearTimeout(_.windowDelay);
_.windowDelay=window.setTimeout(function(){
_.windowWidth=$(window).width();
_.checkResponsive();
_.setPosition();
},50);
}
};

Slick.prototype.removeSlide=Slick.prototype.slickRemove=function(index,removeBefore,removeAll){

var _=this;

if(typeof index==='boolean'){
removeBefore=index;
index=removeBefore===true?0:_.slideCount-1;
}else{
index=removeBefore===true?--index:index;
}

if(_.slideCount<1||index<0||index>_.slideCount-1){
return false;
}

_.unload();

if(removeAll===true){
_.$slideTrack.children().remove();
}else{
_.$slideTrack.children(this.options.slide).eq(index).remove();
}

_.$slides=_.$slideTrack.children(this.options.slide);

_.$slideTrack.children(this.options.slide).detach();

_.$slideTrack.append(_.$slides);

_.$slidesCache=_.$slides;

_.reinit();

};

Slick.prototype.setCSS=function(position){

var _=this,
positionProps={},
x,y;

if(_.options.rtl===true){
position=-position;
}
x=_.positionProp=='left'?Math.ceil(position)+'px':'0px';
y=_.positionProp=='top'?Math.ceil(position)+'px':'0px';

positionProps[_.positionProp]=position;

if(_.transformsEnabled===false){
_.$slideTrack.css(positionProps);
}else{
positionProps={};
if(_.cssTransitions===false){
positionProps[_.animType]='translate('+x+', '+y+')';
_.$slideTrack.css(positionProps);
}else{
positionProps[_.animType]='translate3d('+x+', '+y+', 0px)';
_.$slideTrack.css(positionProps);
}
}

};

Slick.prototype.setDimensions=function(){

var _=this;

if(_.options.vertical===false){
if(_.options.centerMode===true){
_.$list.css({
padding:'0px '+_.options.centerPadding});

}
}else{
_.$list.height(_.$slides.first().outerHeight(true)*_.options.slidesToShow);
if(_.options.centerMode===true){
_.$list.css({
padding:_.options.centerPadding+' 0px'});

}
}

_.listWidth=_.$list.width();
_.listHeight=_.$list.height();


if(_.options.vertical===false&&_.options.variableWidth===false){
_.slideWidth=Math.ceil(_.listWidth/_.options.slidesToShow);
_.$slideTrack.width(Math.ceil(_.slideWidth*_.$slideTrack.children('.slick-slide').length));

}else if(_.options.variableWidth===true){
_.$slideTrack.width(5000*_.slideCount);
}else{
_.slideWidth=Math.ceil(_.listWidth);
_.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true)*_.$slideTrack.children('.slick-slide').length));
}

var offset=_.$slides.first().outerWidth(true)-_.$slides.first().width();
if(_.options.variableWidth===false)_.$slideTrack.children('.slick-slide').width(_.slideWidth-offset);

};

Slick.prototype.setFade=function(){

var _=this,
targetLeft;

_.$slides.each(function(index,element){
targetLeft=_.slideWidth*index*-1;
if(_.options.rtl===true){
$(element).css({
position:'relative',
right:targetLeft,
top:0,
zIndex:800,
opacity:0});

}else{
$(element).css({
position:'relative',
left:targetLeft,
top:0,
zIndex:800,
opacity:0});

}
});

_.$slides.eq(_.currentSlide).css({
zIndex:900,
opacity:1});


};

Slick.prototype.setHeight=function(){

var _=this;

if(_.options.slidesToShow===1&&_.options.adaptiveHeight===true&&_.options.vertical===false){
var targetHeight=_.$slides.eq(_.currentSlide).outerHeight(true);
_.$list.css('height',targetHeight);
}

};

Slick.prototype.setOption=Slick.prototype.slickSetOption=function(option,value,refresh){

var _=this;
_.options[option]=value;

if(refresh===true){
_.unload();
_.reinit();
}

};

Slick.prototype.setPosition=function(){

var _=this;

_.setDimensions();

_.setHeight();

if(_.options.fade===false){
_.setCSS(_.getLeft(_.currentSlide));
}else{
_.setFade();
}

_.$slider.trigger('setPosition',[_]);

};

Slick.prototype.setProps=function(){

var _=this,
bodyStyle=document.body.style;

_.positionProp=_.options.vertical===true?'top':'left';

if(_.positionProp==='top'){
_.$slider.addClass('slick-vertical');
}else{
_.$slider.removeClass('slick-vertical');
}

if(bodyStyle.WebkitTransition!==undefined||
bodyStyle.MozTransition!==undefined||
bodyStyle.msTransition!==undefined){
if(_.options.useCSS===true){
_.cssTransitions=true;
}
}

if(bodyStyle.OTransform!==undefined){
_.animType='OTransform';
_.transformType='-o-transform';
_.transitionType='OTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.webkitPerspective===undefined)_.animType=false;
}
if(bodyStyle.MozTransform!==undefined){
_.animType='MozTransform';
_.transformType='-moz-transform';
_.transitionType='MozTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.MozPerspective===undefined)_.animType=false;
}
if(bodyStyle.webkitTransform!==undefined){
_.animType='webkitTransform';
_.transformType='-webkit-transform';
_.transitionType='webkitTransition';
if(bodyStyle.perspectiveProperty===undefined&&bodyStyle.webkitPerspective===undefined)_.animType=false;
}
if(bodyStyle.msTransform!==undefined){
_.animType='msTransform';
_.transformType='-ms-transform';
_.transitionType='msTransition';
if(bodyStyle.msTransform===undefined)_.animType=false;
}
if(bodyStyle.transform!==undefined&&_.animType!==false){
_.animType='transform';
_.transformType='transform';
_.transitionType='transition';
}
_.transformsEnabled=_.animType!==null&&_.animType!==false;

};


Slick.prototype.setSlideClasses=function(index){

var _=this,
centerOffset,allSlides,indexOffset,remainder;

_.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden','true').removeClass('slick-center');
allSlides=_.$slider.find('.slick-slide');

if(_.options.centerMode===true){

centerOffset=Math.floor(_.options.slidesToShow/2);

if(_.options.infinite===true){

if(index>=centerOffset&&index<=_.slideCount-1-centerOffset){
_.$slides.slice(index-centerOffset,index+centerOffset+1).addClass('slick-active').attr('aria-hidden','false');
}else{
indexOffset=_.options.slidesToShow+index;
allSlides.slice(indexOffset-centerOffset+1,indexOffset+centerOffset+2).addClass('slick-active').attr('aria-hidden','false');
}

if(index===0){
allSlides.eq(allSlides.length-1-_.options.slidesToShow).addClass('slick-center');
}else if(index===_.slideCount-1){
allSlides.eq(_.options.slidesToShow).addClass('slick-center');
}

}

_.$slides.eq(index).addClass('slick-center');

}else{

if(index>=0&&index<=_.slideCount-_.options.slidesToShow){
_.$slides.slice(index,index+_.options.slidesToShow).addClass('slick-active').attr('aria-hidden','false');
}else if(allSlides.length<=_.options.slidesToShow){
allSlides.addClass('slick-active').attr('aria-hidden','false');
}else{
remainder=_.slideCount%_.options.slidesToShow;
indexOffset=_.options.infinite===true?_.options.slidesToShow+index:index;
if(_.options.slidesToShow==_.options.slidesToScroll&&_.slideCount-index<_.options.slidesToShow){
allSlides.slice(indexOffset-(_.options.slidesToShow-remainder),indexOffset+remainder).addClass('slick-active').attr('aria-hidden','false');
}else{
allSlides.slice(indexOffset,indexOffset+_.options.slidesToShow).addClass('slick-active').attr('aria-hidden','false');
}
}

}

if(_.options.lazyLoad==='ondemand'){
_.lazyLoad();
}

};

Slick.prototype.setupInfinite=function(){

var _=this,
i,slideIndex,infiniteCount;

if(_.options.fade===true){
_.options.centerMode=false;
}

if(_.options.infinite===true&&_.options.fade===false){

slideIndex=null;

if(_.slideCount>_.options.slidesToShow){

if(_.options.centerMode===true){
infiniteCount=_.options.slidesToShow+1;
}else{
infiniteCount=_.options.slidesToShow;
}

for(i=_.slideCount;i>_.slideCount-
infiniteCount;i-=1){
slideIndex=i-1;
$(_.$slides[slideIndex]).clone(true).attr('id','').
attr('data-slick-index',slideIndex-_.slideCount).
prependTo(_.$slideTrack).addClass('slick-cloned');
}
for(i=0;i<infiniteCount;i+=1){
slideIndex=i;
$(_.$slides[slideIndex]).clone(true).attr('id','').
attr('data-slick-index',slideIndex+_.slideCount).
appendTo(_.$slideTrack).addClass('slick-cloned');
}
_.$slideTrack.find('.slick-cloned').find('[id]').each(function(){
$(this).attr('id','');
});

}

}

};

Slick.prototype.setPaused=function(paused){

var _=this;

if(_.options.autoplay===true&&_.options.pauseOnHover===true){
_.paused=paused;
_.autoPlayClear();
}
};

Slick.prototype.selectHandler=function(event){

var _=this;

var targetElement=$(event.target).is('.slick-slide')?
$(event.target):
$(event.target).parents('.slick-slide');

var index=parseInt(targetElement.attr('data-slick-index'));

if(!index)index=0;

if(_.slideCount<=_.options.slidesToShow){
_.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden','true');
_.$slides.eq(index).addClass('slick-active').attr("aria-hidden","false");
if(_.options.centerMode===true){
_.$slider.find('.slick-slide').removeClass('slick-center');
_.$slides.eq(index).addClass('slick-center');
}
_.asNavFor(index);
return;
}
_.slideHandler(index);

};

Slick.prototype.slideHandler=function(index,sync,dontAnimate){

var targetSlide,animSlide,oldSlide,slideLeft,targetLeft=null,
_=this;

sync=sync||false;

if(_.animating===true&&_.options.waitForAnimate===true){
return;
}

if(_.options.fade===true&&_.currentSlide===index){
return;
}

if(_.slideCount<=_.options.slidesToShow){
return;
}

if(sync===false){
_.asNavFor(index);
}

targetSlide=index;
targetLeft=_.getLeft(targetSlide);
slideLeft=_.getLeft(_.currentSlide);

_.currentLeft=_.swipeLeft===null?slideLeft:_.swipeLeft;

if(_.options.infinite===false&&_.options.centerMode===false&&(index<0||index>_.getDotCount()*_.options.slidesToScroll)){
if(_.options.fade===false){
targetSlide=_.currentSlide;
if(dontAnimate!==true){
_.animateSlide(slideLeft,function(){
_.postSlide(targetSlide);
});
}else{
_.postSlide(targetSlide);
}
}
return;
}else if(_.options.infinite===false&&_.options.centerMode===true&&(index<0||index>_.slideCount-_.options.slidesToScroll)){
if(_.options.fade===false){
targetSlide=_.currentSlide;
if(dontAnimate!==true){
_.animateSlide(slideLeft,function(){
_.postSlide(targetSlide);
});
}else{
_.postSlide(targetSlide);
}
}
return;
}

if(_.options.autoplay===true){
clearInterval(_.autoPlayTimer);
}

if(targetSlide<0){
if(_.slideCount%_.options.slidesToScroll!==0){
animSlide=_.slideCount-_.slideCount%_.options.slidesToScroll;
}else{
animSlide=_.slideCount+targetSlide;
}
}else if(targetSlide>=_.slideCount){
if(_.slideCount%_.options.slidesToScroll!==0){
animSlide=0;
}else{
animSlide=targetSlide-_.slideCount;
}
}else{
animSlide=targetSlide;
}

_.animating=true;

_.$slider.trigger("beforeChange",[_,_.currentSlide,animSlide]);

oldSlide=_.currentSlide;
_.currentSlide=animSlide;

_.setSlideClasses(_.currentSlide);

_.updateDots();
_.updateArrows();

if(_.options.fade===true){
if(dontAnimate!==true){
_.fadeSlide(animSlide,function(){
_.postSlide(animSlide);
});
}else{
_.postSlide(animSlide);
}
_.animateHeight();
return;
}

if(dontAnimate!==true){
_.animateSlide(targetLeft,function(){
_.postSlide(animSlide);
});
}else{
_.postSlide(animSlide);
}

};

Slick.prototype.startLoad=function(){

var _=this;

if(_.options.arrows===true&&_.slideCount>_.options.slidesToShow){

_.$prevArrow.hide();
_.$nextArrow.hide();

}

if(_.options.dots===true&&_.slideCount>_.options.slidesToShow){

_.$dots.hide();

}

_.$slider.addClass('slick-loading');

};

Slick.prototype.swipeDirection=function(){

var xDist,yDist,r,swipeAngle,_=this;

xDist=_.touchObject.startX-_.touchObject.curX;
yDist=_.touchObject.startY-_.touchObject.curY;
r=Math.atan2(yDist,xDist);

swipeAngle=Math.round(r*180/Math.PI);
if(swipeAngle<0){
swipeAngle=360-Math.abs(swipeAngle);
}

if(swipeAngle<=45&&swipeAngle>=0){
return _.options.rtl===false?'left':'right';
}
if(swipeAngle<=360&&swipeAngle>=315){
return _.options.rtl===false?'left':'right';
}
if(swipeAngle>=135&&swipeAngle<=225){
return _.options.rtl===false?'right':'left';
}
if(_.options.verticalSwiping===true){
if(swipeAngle>=35&&swipeAngle<=135){
return'left';
}else{
return'right';
}
}

return'vertical';

};

Slick.prototype.swipeEnd=function(event){

var _=this,
slideCount;

_.dragging=false;

_.shouldClick=_.touchObject.swipeLength>10?false:true;

if(_.touchObject.curX===undefined){
return false;
}

if(_.touchObject.edgeHit===true){
_.$slider.trigger("edge",[_,_.swipeDirection()]);
}

if(_.touchObject.swipeLength>=_.touchObject.minSwipe){

switch(_.swipeDirection()){
case'left':
slideCount=_.options.swipeToSlide?_.checkNavigable(_.currentSlide+_.getSlideCount()):_.currentSlide+_.getSlideCount();
_.slideHandler(slideCount);
_.currentDirection=0;
_.touchObject={};
_.$slider.trigger("swipe",[_,"left"]);
break;

case'right':
slideCount=_.options.swipeToSlide?_.checkNavigable(_.currentSlide-_.getSlideCount()):_.currentSlide-_.getSlideCount();
_.slideHandler(slideCount);
_.currentDirection=1;
_.touchObject={};
_.$slider.trigger("swipe",[_,"right"]);
break;}

}else{
if(_.touchObject.startX!==_.touchObject.curX){
_.slideHandler(_.currentSlide);
_.touchObject={};
}
}

};

Slick.prototype.swipeHandler=function(event){

var _=this;

if(_.options.swipe===false||'ontouchend'in document&&_.options.swipe===false){
return;
}else if(_.options.draggable===false&&event.type.indexOf('mouse')!==-1){
return;
}

_.touchObject.fingerCount=event.originalEvent&&event.originalEvent.touches!==undefined?
event.originalEvent.touches.length:1;

_.touchObject.minSwipe=_.listWidth/_.options.
touchThreshold;

if(_.options.verticalSwiping===true){
_.touchObject.minSwipe=_.listHeight/_.options.
touchThreshold;
}

switch(event.data.action){

case'start':
_.swipeStart(event);
break;

case'move':
_.swipeMove(event);
break;

case'end':
_.swipeEnd(event);
break;}



};

Slick.prototype.swipeMove=function(event){

var _=this,
edgeWasHit=false,
curLeft,swipeDirection,swipeLength,positionOffset,touches;

touches=event.originalEvent!==undefined?event.originalEvent.touches:null;

if(!_.dragging||touches&&touches.length!==1){
return false;
}

curLeft=_.getLeft(_.currentSlide);

_.touchObject.curX=touches!==undefined?touches[0].pageX:event.clientX;
_.touchObject.curY=touches!==undefined?touches[0].pageY:event.clientY;

_.touchObject.swipeLength=Math.round(Math.sqrt(
Math.pow(_.touchObject.curX-_.touchObject.startX,2)));

if(_.options.verticalSwiping===true){
_.touchObject.swipeLength=Math.round(Math.sqrt(
Math.pow(_.touchObject.curY-_.touchObject.startY,2)));
}

swipeDirection=_.swipeDirection();

if(swipeDirection==='vertical'){
return;
}

if(event.originalEvent!==undefined&&_.touchObject.swipeLength>4){
event.preventDefault();
}

positionOffset=(_.options.rtl===false?1:-1)*(_.touchObject.curX>_.touchObject.startX?1:-1);
if(_.options.verticalSwiping===true){
positionOffset=_.touchObject.curY>_.touchObject.startY?1:-1;
}


swipeLength=_.touchObject.swipeLength;

_.touchObject.edgeHit=false;

if(_.options.infinite===false){
if(_.currentSlide===0&&swipeDirection==="right"||_.currentSlide>=_.getDotCount()&&swipeDirection==="left"){
swipeLength=_.touchObject.swipeLength*_.options.edgeFriction;
_.touchObject.edgeHit=true;
}
}

if(_.options.vertical===false){
_.swipeLeft=curLeft+swipeLength*positionOffset;
}else{
_.swipeLeft=curLeft+swipeLength*(_.$list.height()/_.listWidth)*positionOffset;
}
if(_.options.verticalSwiping===true){
_.swipeLeft=curLeft+swipeLength*positionOffset;
}

if(_.options.fade===true||_.options.touchMove===false){
return false;
}

if(_.animating===true){
_.swipeLeft=null;
return false;
}

_.setCSS(_.swipeLeft);

};

Slick.prototype.swipeStart=function(event){

var _=this,
touches;

if(_.touchObject.fingerCount!==1||_.slideCount<=_.options.slidesToShow){
_.touchObject={};
return false;
}

if(event.originalEvent!==undefined&&event.originalEvent.touches!==undefined){
touches=event.originalEvent.touches[0];
}

_.touchObject.startX=_.touchObject.curX=touches!==undefined?touches.pageX:event.clientX;
_.touchObject.startY=_.touchObject.curY=touches!==undefined?touches.pageY:event.clientY;

_.dragging=true;

};

Slick.prototype.unfilterSlides=Slick.prototype.slickUnfilter=function(){

var _=this;

if(_.$slidesCache!==null){

_.unload();

_.$slideTrack.children(this.options.slide).detach();

_.$slidesCache.appendTo(_.$slideTrack);

_.reinit();

}

};

Slick.prototype.unload=function(){

var _=this;

$('.slick-cloned',_.$slider).remove();
if(_.$dots){
_.$dots.remove();
}
if(_.$prevArrow&&_typeof(_.options.prevArrow)!=='object'){
_.$prevArrow.remove();
}
if(_.$nextArrow&&_typeof(_.options.nextArrow)!=='object'){
_.$nextArrow.remove();
}
_.$slides.removeClass('slick-slide slick-active slick-visible').attr("aria-hidden","true").css('width','');

};

Slick.prototype.unslick=function(){

var _=this;
_.destroy();

};

Slick.prototype.updateArrows=function(){

var _=this,
centerOffset;

centerOffset=Math.floor(_.options.slidesToShow/2);

if(_.options.arrows===true&&_.options.infinite!==
true&&_.slideCount>_.options.slidesToShow){
_.$prevArrow.removeClass('slick-disabled');
_.$nextArrow.removeClass('slick-disabled');
if(_.currentSlide===0){
_.$prevArrow.addClass('slick-disabled');
_.$nextArrow.removeClass('slick-disabled');
}else if(_.currentSlide>=_.slideCount-_.options.slidesToShow&&_.options.centerMode===false){
_.$nextArrow.addClass('slick-disabled');
_.$prevArrow.removeClass('slick-disabled');
}else if(_.currentSlide>=_.slideCount-1&&_.options.centerMode===true){
_.$nextArrow.addClass('slick-disabled');
_.$prevArrow.removeClass('slick-disabled');
}
}

};

Slick.prototype.updateDots=function(){

var _=this;

if(_.$dots!==null){

_.$dots.find('li').removeClass('slick-active').attr("aria-hidden","true");
_.$dots.find('li').eq(Math.floor(_.currentSlide/_.options.slidesToScroll)).addClass('slick-active').attr("aria-hidden","false");

}

};

Slick.prototype.visibility=function(){

var _=this;

if(document[_.hidden]){
_.paused=true;
_.autoPlayClear();
}else{
_.paused=false;
_.autoPlay();
}

};

$.fn.slick=function(){
var _=this,
opt=arguments[0],
args=Array.prototype.slice.call(arguments,1),
l=_.length,
i=0,
ret;
for(i;i<l;i++){
if((typeof opt==='undefined'?'undefined':_typeof(opt))=='object'||typeof opt=='undefined')
_[i].slick=new Slick(_[i],opt);else

ret=_[i].slick[opt].apply(_[i].slick,args);
if(typeof ret!='undefined')return ret;
}
return _;
};

});

}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});

},{}]},{},[14]);