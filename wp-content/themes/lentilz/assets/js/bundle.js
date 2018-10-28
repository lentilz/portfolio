(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////             /////    /////
/////             /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
         /////    /////
         /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////

/**
 * ScrollReveal
 * ------------
 * Version : 3.3.6
 * Website : scrollrevealjs.org
 * Repo    : github.com/jlmakes/scrollreveal.js
 * Author  : Julian Lloyd (@jlmakes)
 */

;(function () {
  'use strict'

  var sr
  var _requestAnimationFrame

  function ScrollReveal (config) {
    // Support instantiation without the `new` keyword.
    if (typeof this === 'undefined' || Object.getPrototypeOf(this) !== ScrollReveal.prototype) {
      return new ScrollReveal(config)
    }

    sr = this // Save reference to instance.
    sr.version = '3.3.6'
    sr.tools = new Tools() // *required utilities

    if (sr.isSupported()) {
      sr.tools.extend(sr.defaults, config || {})

      sr.defaults.container = _resolveContainer(sr.defaults)

      sr.store = {
        elements: {},
        containers: []
      }

      sr.sequences = {}
      sr.history = []
      sr.uid = 0
      sr.initialized = false
    } else if (typeof console !== 'undefined' && console !== null) {
      // Note: IE9 only supports console if devtools are open.
      console.log('ScrollReveal is not supported in this browser.')
    }

    return sr
  }

  /**
   * Configuration
   * -------------
   * This object signature can be passed directly to the ScrollReveal constructor,
   * or as the second argument of the `reveal()` method.
   */

  ScrollReveal.prototype.defaults = {
    // 'bottom', 'left', 'top', 'right'
    origin: 'bottom',

    // Can be any valid CSS distance, e.g. '5rem', '10%', '20vw', etc.
    distance: '20px',

    // Time in milliseconds.
    duration: 500,
    delay: 0,

    // Starting angles in degrees, will transition from these values to 0 in all axes.
    rotate: { x: 0, y: 0, z: 0 },

    // Starting opacity value, before transitioning to the computed opacity.
    opacity: 0,

    // Starting scale value, will transition from this value to 1
    scale: 0.9,

    // Accepts any valid CSS easing, e.g. 'ease', 'ease-in-out', 'linear', etc.
    easing: 'cubic-bezier(0.6, 0.2, 0.1, 1)',

    // `<html>` is the default reveal container. You can pass either:
    // DOM Node, e.g. document.querySelector('.fooContainer')
    // Selector, e.g. '.fooContainer'
    container: window.document.documentElement,

    // true/false to control reveal animations on mobile.
    mobile: true,

    // true:  reveals occur every time elements become visible
    // false: reveals occur once as elements become visible
    reset: false,

    // 'always' — delay for all reveal animations
    // 'once'   — delay only the first time reveals occur
    // 'onload' - delay only for animations triggered by first load
    useDelay: 'always',

    // Change when an element is considered in the viewport. The default value
    // of 0.20 means 20% of an element must be visible for its reveal to occur.
    viewFactor: 0.2,

    // Pixel values that alter the container boundaries.
    // e.g. Set `{ top: 48 }`, if you have a 48px tall fixed toolbar.
    // --
    // Visual Aid: https://scrollrevealjs.org/assets/viewoffset.png
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },

    // Callbacks that fire for each triggered element reveal, and reset.
    beforeReveal: function (domEl) {},
    beforeReset: function (domEl) {},

    // Callbacks that fire for each completed element reveal, and reset.
    afterReveal: function (domEl) {},
    afterReset: function (domEl) {}
  }

  /**
   * Check if client supports CSS Transform and CSS Transition.
   * @return {boolean}
   */
  ScrollReveal.prototype.isSupported = function () {
    var style = document.documentElement.style
    return 'WebkitTransition' in style && 'WebkitTransform' in style ||
      'transition' in style && 'transform' in style
  }

  /**
   * Creates a reveal set, a group of elements that will animate when they
   * become visible. If [interval] is provided, a new sequence is created
   * that will ensure elements reveal in the order they appear in the DOM.
   *
   * @param {Node|NodeList|string} [target]   The node, node list or selector to use for animation.
   * @param {Object}               [config]   Override the defaults for this reveal set.
   * @param {number}               [interval] Time between sequenced element animations (milliseconds).
   * @param {boolean}              [sync]     Used internally when updating reveals for async content.
   *
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.reveal = function (target, config, interval, sync) {
    var container
    var elements
    var elem
    var elemId
    var sequence
    var sequenceId

    // No custom configuration was passed, but a sequence interval instead.
    // let’s shuffle things around to make sure everything works.
    if (config !== undefined && typeof config === 'number') {
      interval = config
      config = {}
    } else if (config === undefined || config === null) {
      config = {}
    }

    container = _resolveContainer(config)
    elements = _getRevealElements(target, container)

    if (!elements.length) {
      console.log('ScrollReveal: reveal on "' + target + '" failed, no elements found.')
      return sr
    }

    // Prepare a new sequence if an interval is passed.
    if (interval && typeof interval === 'number') {
      sequenceId = _nextUid()

      sequence = sr.sequences[sequenceId] = {
        id: sequenceId,
        interval: interval,
        elemIds: [],
        active: false
      }
    }

    // Begin main loop to configure ScrollReveal elements.
    for (var i = 0; i < elements.length; i++) {
      // Check if the element has already been configured and grab it from the store.
      elemId = elements[i].getAttribute('data-sr-id')
      if (elemId) {
        elem = sr.store.elements[elemId]
      } else {
        // Otherwise, let’s do some basic setup.
        elem = {
          id: _nextUid(),
          domEl: elements[i],
          seen: false,
          revealing: false
        }
        elem.domEl.setAttribute('data-sr-id', elem.id)
      }

      // Sequence only setup
      if (sequence) {
        elem.sequence = {
          id: sequence.id,
          index: sequence.elemIds.length
        }

        sequence.elemIds.push(elem.id)
      }

      // New or existing element, it’s time to update its configuration, styles,
      // and send the updates to our store.
      _configure(elem, config, container)
      _style(elem)
      _updateStore(elem)

      // We need to make sure elements are set to visibility: visible, even when
      // on mobile and `config.mobile === false`, or if unsupported.
      if (sr.tools.isMobile() && !elem.config.mobile || !sr.isSupported()) {
        elem.domEl.setAttribute('style', elem.styles.inline)
        elem.disabled = true
      } else if (!elem.revealing) {
        // Otherwise, proceed normally.
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial
        )
      }
    }

    // Each `reveal()` is recorded so that when calling `sync()` while working
    // with asynchronously loaded content, it can re-trace your steps but with
    // all your new elements now in the DOM.

    // Since `reveal()` is called internally by `sync()`, we don’t want to
    // record or intiialize each reveal during syncing.
    if (!sync && sr.isSupported()) {
      _record(target, config, interval)

      // We push initialization to the event queue using setTimeout, so that we can
      // give ScrollReveal room to process all reveal calls before putting things into motion.
      // --
      // Philip Roberts - What the heck is the event loop anyway? (JSConf EU 2014)
      // https://www.youtube.com/watch?v=8aGhZQkoFbQ
      if (sr.initTimeout) {
        window.clearTimeout(sr.initTimeout)
      }
      sr.initTimeout = window.setTimeout(_init, 0)
    }

    return sr
  }

  /**
   * Re-runs `reveal()` for each record stored in history, effectively capturing
   * any content loaded asynchronously that matches existing reveal set targets.
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.sync = function () {
    if (sr.history.length && sr.isSupported()) {
      for (var i = 0; i < sr.history.length; i++) {
        var record = sr.history[i]
        sr.reveal(record.target, record.config, record.interval, true)
      }
      _init()
    } else {
      console.log('ScrollReveal: sync failed, no reveals found.')
    }
    return sr
  }

  /**
   * Private Methods
   * ---------------
   */

  function _resolveContainer (config) {
    if (config && config.container) {
      if (typeof config.container === 'string') {
        return window.document.documentElement.querySelector(config.container)
      } else if (sr.tools.isNode(config.container)) {
        return config.container
      } else {
        console.log('ScrollReveal: invalid container "' + config.container + '" provided.')
        console.log('ScrollReveal: falling back to default container.')
      }
    }
    return sr.defaults.container
  }

  /**
   * check to see if a node or node list was passed in as the target,
   * otherwise query the container using target as a selector.
   *
   * @param {Node|NodeList|string} [target]    client input for reveal target.
   * @param {Node}                 [container] parent element for selector queries.
   *
   * @return {array} elements to be revealed.
   */
  function _getRevealElements (target, container) {
    if (typeof target === 'string') {
      return Array.prototype.slice.call(container.querySelectorAll(target))
    } else if (sr.tools.isNode(target)) {
      return [target]
    } else if (sr.tools.isNodeList(target)) {
      return Array.prototype.slice.call(target)
    }
    return []
  }

  /**
   * A consistent way of creating unique IDs.
   * @returns {number}
   */
  function _nextUid () {
    return ++sr.uid
  }

  function _configure (elem, config, container) {
    // If a container was passed as a part of the config object,
    // let’s overwrite it with the resolved container passed in.
    if (config.container) config.container = container
    // If the element hasn’t already been configured, let’s use a clone of the
    // defaults extended by the configuration passed as the second argument.
    if (!elem.config) {
      elem.config = sr.tools.extendClone(sr.defaults, config)
    } else {
      // Otherwise, let’s use a clone of the existing element configuration extended
      // by the configuration passed as the second argument.
      elem.config = sr.tools.extendClone(elem.config, config)
    }

    // Infer CSS Transform axis from origin string.
    if (elem.config.origin === 'top' || elem.config.origin === 'bottom') {
      elem.config.axis = 'Y'
    } else {
      elem.config.axis = 'X'
    }
  }

  function _style (elem) {
    var computed = window.getComputedStyle(elem.domEl)

    if (!elem.styles) {
      elem.styles = {
        transition: {},
        transform: {},
        computed: {}
      }

      // Capture any existing inline styles, and add our visibility override.
      // --
      // See section 4.2. in the Documentation:
      // https://github.com/jlmakes/scrollreveal.js#42-improve-user-experience
      elem.styles.inline = elem.domEl.getAttribute('style') || ''
      elem.styles.inline += '; visibility: visible; '

      // grab the elements existing opacity.
      elem.styles.computed.opacity = computed.opacity

      // grab the elements existing transitions.
      if (!computed.transition || computed.transition === 'all 0s ease 0s') {
        elem.styles.computed.transition = ''
      } else {
        elem.styles.computed.transition = computed.transition + ', '
      }
    }

    // Create transition styles
    elem.styles.transition.instant = _generateTransition(elem, 0)
    elem.styles.transition.delayed = _generateTransition(elem, elem.config.delay)

    // Generate transform styles, first with the webkit prefix.
    elem.styles.transform.initial = ' -webkit-transform:'
    elem.styles.transform.target = ' -webkit-transform:'
    _generateTransform(elem)

    // And again without any prefix.
    elem.styles.transform.initial += 'transform:'
    elem.styles.transform.target += 'transform:'
    _generateTransform(elem)
  }

  function _generateTransition (elem, delay) {
    var config = elem.config

    return '-webkit-transition: ' + elem.styles.computed.transition +
      '-webkit-transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; ' +

      'transition: ' + elem.styles.computed.transition +
      'transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; '
  }

  function _generateTransform (elem) {
    var config = elem.config
    var cssDistance
    var transform = elem.styles.transform

    // Let’s make sure our our pixel distances are negative for top and left.
    // e.g. origin = 'top' and distance = '25px' starts at `top: -25px` in CSS.
    if (config.origin === 'top' || config.origin === 'left') {
      cssDistance = /^-/.test(config.distance)
        ? config.distance.substr(1)
        : '-' + config.distance
    } else {
      cssDistance = config.distance
    }

    if (parseInt(config.distance)) {
      transform.initial += ' translate' + config.axis + '(' + cssDistance + ')'
      transform.target += ' translate' + config.axis + '(0)'
    }
    if (config.scale) {
      transform.initial += ' scale(' + config.scale + ')'
      transform.target += ' scale(1)'
    }
    if (config.rotate.x) {
      transform.initial += ' rotateX(' + config.rotate.x + 'deg)'
      transform.target += ' rotateX(0)'
    }
    if (config.rotate.y) {
      transform.initial += ' rotateY(' + config.rotate.y + 'deg)'
      transform.target += ' rotateY(0)'
    }
    if (config.rotate.z) {
      transform.initial += ' rotateZ(' + config.rotate.z + 'deg)'
      transform.target += ' rotateZ(0)'
    }
    transform.initial += '; opacity: ' + config.opacity + ';'
    transform.target += '; opacity: ' + elem.styles.computed.opacity + ';'
  }

  function _updateStore (elem) {
    var container = elem.config.container

    // If this element’s container isn’t already in the store, let’s add it.
    if (container && sr.store.containers.indexOf(container) === -1) {
      sr.store.containers.push(elem.config.container)
    }

    // Update the element stored with our new element.
    sr.store.elements[elem.id] = elem
  }

  function _record (target, config, interval) {
    // Save the `reveal()` arguments that triggered this `_record()` call, so we
    // can re-trace our steps when calling the `sync()` method.
    var record = {
      target: target,
      config: config,
      interval: interval
    }
    sr.history.push(record)
  }

  function _init () {
    if (sr.isSupported()) {
      // Initial animate call triggers valid reveal animations on first load.
      // Subsequent animate calls are made inside the event handler.
      _animate()

      // Then we loop through all container nodes in the store and bind event
      // listeners to each.
      for (var i = 0; i < sr.store.containers.length; i++) {
        sr.store.containers[i].addEventListener('scroll', _handler)
        sr.store.containers[i].addEventListener('resize', _handler)
      }

      // Let’s also do a one-time binding of window event listeners.
      if (!sr.initialized) {
        window.addEventListener('scroll', _handler)
        window.addEventListener('resize', _handler)
        sr.initialized = true
      }
    }
    return sr
  }

  function _handler () {
    _requestAnimationFrame(_animate)
  }

  function _setActiveSequences () {
    var active
    var elem
    var elemId
    var sequence

    // Loop through all sequences
    sr.tools.forOwn(sr.sequences, function (sequenceId) {
      sequence = sr.sequences[sequenceId]
      active = false

      // For each sequenced elemenet, let’s check visibility and if
      // any are visible, set it’s sequence to active.
      for (var i = 0; i < sequence.elemIds.length; i++) {
        elemId = sequence.elemIds[i]
        elem = sr.store.elements[elemId]
        if (_isElemVisible(elem) && !active) {
          active = true
        }
      }

      sequence.active = active
    })
  }

  function _animate () {
    var delayed
    var elem

    _setActiveSequences()

    // Loop through all elements in the store
    sr.tools.forOwn(sr.store.elements, function (elemId) {
      elem = sr.store.elements[elemId]
      delayed = _shouldUseDelay(elem)

      // Let’s see if we should revealand if so,
      // trigger the `beforeReveal` callback and
      // determine whether or not to use delay.
      if (_shouldReveal(elem)) {
        elem.config.beforeReveal(elem.domEl)
        if (delayed) {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.delayed
          )
        } else {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.instant
          )
        }

        // Let’s queue the `afterReveal` callback
        // and mark the element as seen and revealing.
        _queueCallback('reveal', elem, delayed)
        elem.revealing = true
        elem.seen = true

        if (elem.sequence) {
          _queueNextInSequence(elem, delayed)
        }
      } else if (_shouldReset(elem)) {
        //Otherwise reset our element and
        // trigger the `beforeReset` callback.
        elem.config.beforeReset(elem.domEl)
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial +
          elem.styles.transition.instant
        )
        // And queue the `afterReset` callback.
        _queueCallback('reset', elem)
        elem.revealing = false
      }
    })
  }

  function _queueNextInSequence (elem, delayed) {
    var elapsed = 0
    var delay = 0
    var sequence = sr.sequences[elem.sequence.id]

    // We’re processing a sequenced element, so let's block other elements in this sequence.
    sequence.blocked = true

    // Since we’re triggering animations a part of a sequence after animations on first load,
    // we need to check for that condition and explicitly add the delay to our timer.
    if (delayed && elem.config.useDelay === 'onload') {
      delay = elem.config.delay
    }

    // If a sequence timer is already running, capture the elapsed time and clear it.
    if (elem.sequence.timer) {
      elapsed = Math.abs(elem.sequence.timer.started - new Date())
      window.clearTimeout(elem.sequence.timer)
    }

    // Start a new timer.
    elem.sequence.timer = { started: new Date() }
    elem.sequence.timer.clock = window.setTimeout(function () {
      // Sequence interval has passed, so unblock the sequence and re-run the handler.
      sequence.blocked = false
      elem.sequence.timer = null
      _handler()
    }, Math.abs(sequence.interval) + delay - elapsed)
  }

  function _queueCallback (type, elem, delayed) {
    var elapsed = 0
    var duration = 0
    var callback = 'after'

    // Check which callback we’re working with.
    switch (type) {
      case 'reveal':
        duration = elem.config.duration
        if (delayed) {
          duration += elem.config.delay
        }
        callback += 'Reveal'
        break

      case 'reset':
        duration = elem.config.duration
        callback += 'Reset'
        break
    }

    // If a timer is already running, capture the elapsed time and clear it.
    if (elem.timer) {
      elapsed = Math.abs(elem.timer.started - new Date())
      window.clearTimeout(elem.timer.clock)
    }

    // Start a new timer.
    elem.timer = { started: new Date() }
    elem.timer.clock = window.setTimeout(function () {
      // The timer completed, so let’s fire the callback and null the timer.
      elem.config[callback](elem.domEl)
      elem.timer = null
    }, duration - elapsed)
  }

  function _shouldReveal (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return sequence.active &&
        !sequence.blocked &&
        !elem.revealing &&
        !elem.disabled
    }
    return _isElemVisible(elem) &&
      !elem.revealing &&
      !elem.disabled
  }

  function _shouldUseDelay (elem) {
    var config = elem.config.useDelay
    return config === 'always' ||
      (config === 'onload' && !sr.initialized) ||
      (config === 'once' && !elem.seen)
  }

  function _shouldReset (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return !sequence.active &&
        elem.config.reset &&
        elem.revealing &&
        !elem.disabled
    }
    return !_isElemVisible(elem) &&
      elem.config.reset &&
      elem.revealing &&
      !elem.disabled
  }

  function _getContainer (container) {
    return {
      width: container.clientWidth,
      height: container.clientHeight
    }
  }

  function _getScrolled (container) {
    // Return the container scroll values, plus the its offset.
    if (container && container !== window.document.documentElement) {
      var offset = _getOffset(container)
      return {
        x: container.scrollLeft + offset.left,
        y: container.scrollTop + offset.top
      }
    } else {
      // Otherwise, default to the window object’s scroll values.
      return {
        x: window.pageXOffset,
        y: window.pageYOffset
      }
    }
  }

  function _getOffset (domEl) {
    var offsetTop = 0
    var offsetLeft = 0

      // Grab the element’s dimensions.
    var offsetHeight = domEl.offsetHeight
    var offsetWidth = domEl.offsetWidth

    // Now calculate the distance between the element and its parent, then
    // again for the parent to its parent, and again etc... until we have the
    // total distance of the element to the document’s top and left origin.
    do {
      if (!isNaN(domEl.offsetTop)) {
        offsetTop += domEl.offsetTop
      }
      if (!isNaN(domEl.offsetLeft)) {
        offsetLeft += domEl.offsetLeft
      }
      domEl = domEl.offsetParent
    } while (domEl)

    return {
      top: offsetTop,
      left: offsetLeft,
      height: offsetHeight,
      width: offsetWidth
    }
  }

  function _isElemVisible (elem) {
    var offset = _getOffset(elem.domEl)
    var container = _getContainer(elem.config.container)
    var scrolled = _getScrolled(elem.config.container)
    var vF = elem.config.viewFactor

      // Define the element geometry.
    var elemHeight = offset.height
    var elemWidth = offset.width
    var elemTop = offset.top
    var elemLeft = offset.left
    var elemBottom = elemTop + elemHeight
    var elemRight = elemLeft + elemWidth

    return confirmBounds() || isPositionFixed()

    function confirmBounds () {
      // Define the element’s functional boundaries using its view factor.
      var top = elemTop + elemHeight * vF
      var left = elemLeft + elemWidth * vF
      var bottom = elemBottom - elemHeight * vF
      var right = elemRight - elemWidth * vF

      // Define the container functional boundaries using its view offset.
      var viewTop = scrolled.y + elem.config.viewOffset.top
      var viewLeft = scrolled.x + elem.config.viewOffset.left
      var viewBottom = scrolled.y - elem.config.viewOffset.bottom + container.height
      var viewRight = scrolled.x - elem.config.viewOffset.right + container.width

      return top < viewBottom &&
        bottom > viewTop &&
        left < viewRight &&
        right > viewLeft
    }

    function isPositionFixed () {
      return (window.getComputedStyle(elem.domEl).position === 'fixed')
    }
  }

  /**
   * Utilities
   * ---------
   */

  function Tools () {}

  Tools.prototype.isObject = function (object) {
    return object !== null && typeof object === 'object' && object.constructor === Object
  }

  Tools.prototype.isNode = function (object) {
    return typeof window.Node === 'object'
      ? object instanceof window.Node
      : object && typeof object === 'object' &&
        typeof object.nodeType === 'number' &&
        typeof object.nodeName === 'string'
  }

  Tools.prototype.isNodeList = function (object) {
    var prototypeToString = Object.prototype.toString.call(object)
    var regex = /^\[object (HTMLCollection|NodeList|Object)\]$/

    return typeof window.NodeList === 'object'
      ? object instanceof window.NodeList
      : object && typeof object === 'object' &&
        regex.test(prototypeToString) &&
        typeof object.length === 'number' &&
        (object.length === 0 || this.isNode(object[0]))
  }

  Tools.prototype.forOwn = function (object, callback) {
    if (!this.isObject(object)) {
      throw new TypeError('Expected "object", but received "' + typeof object + '".')
    } else {
      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          callback(property)
        }
      }
    }
  }

  Tools.prototype.extend = function (target, source) {
    this.forOwn(source, function (property) {
      if (this.isObject(source[property])) {
        if (!target[property] || !this.isObject(target[property])) {
          target[property] = {}
        }
        this.extend(target[property], source[property])
      } else {
        target[property] = source[property]
      }
    }.bind(this))
    return target
  }

  Tools.prototype.extendClone = function (target, source) {
    return this.extend(this.extend({}, target), source)
  }

  Tools.prototype.isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * Polyfills
   * --------
   */

  _requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }

  /**
   * Module Wrapper
   * --------------
   */
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function () {
      return ScrollReveal
    })
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal
  } else {
    window.ScrollReveal = ScrollReveal
  }
})();

},{}],2:[function(require,module,exports){
(function (global){
'use strict';



var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);


var _scrollReveal = require('./modules/scrollReveal.js');var _scrollReveal2 = _interopRequireDefault(_scrollReveal);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}(function () {'use strict';})();require('./vendor/modernizr.js');

(function ($) {
  // Init scroll reveal Elements
  (0, _scrollReveal2.default)();
})(_jquery2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./modules/scrollReveal.js":3,"./vendor/modernizr.js":4}],3:[function(require,module,exports){
/* Animate reveal elements on scroll */
/* global window, sr */

'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _scrollreveal = require('scrollreveal');var _scrollreveal2 = _interopRequireDefault(_scrollreveal);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var scrollReveal = function scrollReveal() {
  window.sr = (0, _scrollreveal2.default)({
    duration: 900,
    afterReveal: function afterReveal(el) {
      el.classList.add('js-revealed');
    } });


  sr.reveal('.js-reveal');
};exports.default =

scrollReveal;

},{"scrollreveal":1}],4:[function(require,module,exports){
"use strict";var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /*! modernizr 3.5.0 (Custom Build) | MIT *
                                                                                                                                                                                                                                                                                        * https://modernizr.com/download/?-applicationcache-audio-backgroundsize-borderimage-borderradius-boxshadow-canvas-canvastext-cssanimations-csscolumns-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-flexbox-fontface-generatedcontent-geolocation-hashchange-history-hsla-indexeddb-inlinesvg-input-inputtypes-localstorage-multiplebgs-opacity-postmessage-rgba-sessionstorage-smil-svg-svgclippaths-textshadow-touchevents-video-webgl-websockets-websqldatabase-webworkers-addtest-domprefixes-hasevent-mq-prefixed-prefixes-setclasses-shiv-testallprops-testprop-teststyles !*/
!function (e, t, n) {function r(e, t) {return (typeof e === "undefined" ? "undefined" : _typeof(e)) === t;}function a() {var e, t, n, a, o, i, s;for (var c in w) {if (w.hasOwnProperty(c)) {if (e = [], t = w[c], t.name && (e.push(t.name.toLowerCase()), t.options && t.options.aliases && t.options.aliases.length)) for (n = 0; n < t.options.aliases.length; n++) {e.push(t.options.aliases[n].toLowerCase());}for (a = r(t.fn, "function") ? t.fn() : t.fn, o = 0; o < e.length; o++) {i = e[o], s = i.split("."), 1 === s.length ? Modernizr[s[0]] = a : (!Modernizr[s[0]] || Modernizr[s[0]] instanceof Boolean || (Modernizr[s[0]] = new Boolean(Modernizr[s[0]])), Modernizr[s[0]][s[1]] = a), T.push((a ? "" : "no-") + s.join("-"));}}}}function o(e) {var t = _.className,n = Modernizr._config.classPrefix || "";if (P && (t = t.baseVal), Modernizr._config.enableJSClass) {var r = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");t = t.replace(r, "$1" + n + "js$2");}Modernizr._config.enableClasses && (t += " " + n + e.join(" " + n), P ? _.className.baseVal = t : _.className = t);}function i(e, t) {if ("object" == (typeof e === "undefined" ? "undefined" : _typeof(e))) for (var n in e) {A(e, n) && i(n, e[n]);} else {e = e.toLowerCase();var r = e.split("."),a = Modernizr[r[0]];if (2 == r.length && (a = a[r[1]]), "undefined" != typeof a) return Modernizr;t = "function" == typeof t ? t() : t, 1 == r.length ? Modernizr[r[0]] = t : (!Modernizr[r[0]] || Modernizr[r[0]] instanceof Boolean || (Modernizr[r[0]] = new Boolean(Modernizr[r[0]])), Modernizr[r[0]][r[1]] = t), o([(t && 0 != t ? "" : "no-") + r.join("-")]), Modernizr._trigger(e, t);}return Modernizr;}function s() {return "function" != typeof t.createElement ? t.createElement(arguments[0]) : P ? t.createElementNS.call(t, "http://www.w3.org/2000/svg", arguments[0]) : t.createElement.apply(t, arguments);}function c(e) {return e.replace(/([a-z])-([a-z])/g, function (e, t, n) {return t + n.toUpperCase();}).replace(/^-/, "");}function l(e, t) {return !!~("" + e).indexOf(t);}function d() {var e = t.body;return e || (e = s(P ? "svg" : "body"), e.fake = !0), e;}function u(e, n, r, a) {var o,i,c,l,u = "modernizr",f = s("div"),p = d();if (parseInt(r, 10)) for (; r--;) {c = s("div"), c.id = a ? a[r] : u + (r + 1), f.appendChild(c);}return o = s("style"), o.type = "text/css", o.id = "s" + u, (p.fake ? p : f).appendChild(o), p.appendChild(f), o.styleSheet ? o.styleSheet.cssText = e : o.appendChild(t.createTextNode(e)), f.id = u, p.fake && (p.style.background = "", p.style.overflow = "hidden", l = _.style.overflow, _.style.overflow = "hidden", _.appendChild(p)), i = n(f, e), p.fake ? (p.parentNode.removeChild(p), _.style.overflow = l, _.offsetHeight) : f.parentNode.removeChild(f), !!i;}function f(e, t) {return function () {return e.apply(t, arguments);};}function p(e, t, n) {var a;for (var o in e) {if (e[o] in t) return n === !1 ? e[o] : (a = t[e[o]], r(a, "function") ? f(a, n || t) : a);}return !1;}function m(e) {return e.replace(/([A-Z])/g, function (e, t) {return "-" + t.toLowerCase();}).replace(/^ms-/, "-ms-");}function h(t, n, r) {var a;if ("getComputedStyle" in e) {a = getComputedStyle.call(e, t, n);var o = e.console;if (null !== a) r && (a = a.getPropertyValue(r));else if (o) {var i = o.error ? "error" : "log";o[i].call(o, "getComputedStyle returning null, its possible modernizr test results are inaccurate");}} else a = !n && t.currentStyle && t.currentStyle[r];return a;}function g(t, r) {var a = t.length;if ("CSS" in e && "supports" in e.CSS) {for (; a--;) {if (e.CSS.supports(m(t[a]), r)) return !0;}return !1;}if ("CSSSupportsRule" in e) {for (var o = []; a--;) {o.push("(" + m(t[a]) + ":" + r + ")");}return o = o.join(" or "), u("@supports (" + o + ") { #modernizr { position: absolute; } }", function (e) {return "absolute" == h(e, null, "position");});}return n;}function v(e, t, a, o) {function i() {u && (delete G.style, delete G.modElem);}if (o = r(o, "undefined") ? !1 : o, !r(a, "undefined")) {var d = g(e, a);if (!r(d, "undefined")) return d;}for (var u, f, p, m, h, v = ["modernizr", "tspan", "samp"]; !G.style && v.length;) {u = !0, G.modElem = s(v.shift()), G.style = G.modElem.style;}for (p = e.length, f = 0; p > f; f++) {if (m = e[f], h = G.style[m], l(m, "-") && (m = c(m)), G.style[m] !== n) {if (o || r(a, "undefined")) return i(), "pfx" == t ? m : !0;try {G.style[m] = a;} catch (y) {}if (G.style[m] != h) return i(), "pfx" == t ? m : !0;}}return i(), !1;}function y(e, t, n, a, o) {var i = e.charAt(0).toUpperCase() + e.slice(1),s = (e + " " + q.join(i + " ") + i).split(" ");return r(t, "string") || r(t, "undefined") ? v(s, t, a, o) : (s = (e + " " + N.join(i + " ") + i).split(" "), p(s, t, n));}function b(e, t) {var n = e.deleteDatabase(t);n.onsuccess = function () {i("indexeddb.deletedatabase", !0);}, n.onerror = function () {i("indexeddb.deletedatabase", !1);};}function x(e, t, r) {return y(e, n, n, t, r);}var T = [],w = [],S = { _version: "3.5.0", _config: { classPrefix: "", enableClasses: !0, enableJSClass: !0, usePrefixes: !0 }, _q: [], on: function on(e, t) {var n = this;setTimeout(function () {t(n[e]);}, 0);}, addTest: function addTest(e, t, n) {w.push({ name: e, fn: t, options: n });}, addAsyncTest: function addAsyncTest(e) {w.push({ name: null, fn: e });} },Modernizr = function Modernizr() {};Modernizr.prototype = S, Modernizr = new Modernizr(), Modernizr.addTest("applicationcache", "applicationCache" in e), Modernizr.addTest("geolocation", "geolocation" in navigator), Modernizr.addTest("history", function () {var t = navigator.userAgent;return -1 === t.indexOf("Android 2.") && -1 === t.indexOf("Android 4.0") || -1 === t.indexOf("Mobile Safari") || -1 !== t.indexOf("Chrome") || -1 !== t.indexOf("Windows Phone") || "file:" === location.protocol ? e.history && "pushState" in e.history : !1;}), Modernizr.addTest("postmessage", "postMessage" in e), Modernizr.addTest("svg", !!t.createElementNS && !!t.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect);var C = !1;try {C = "WebSocket" in e && 2 === e.WebSocket.CLOSING;} catch (E) {}Modernizr.addTest("websockets", C), Modernizr.addTest("localstorage", function () {var e = "modernizr";try {return localStorage.setItem(e, e), localStorage.removeItem(e), !0;} catch (t) {return !1;}}), Modernizr.addTest("sessionstorage", function () {var e = "modernizr";try {return sessionStorage.setItem(e, e), sessionStorage.removeItem(e), !0;} catch (t) {return !1;}}), Modernizr.addTest("websqldatabase", "openDatabase" in e), Modernizr.addTest("webworkers", "Worker" in e);var k = S._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];S._prefixes = k;var _ = t.documentElement,P = "svg" === _.nodeName.toLowerCase();P || !function (e, t) {function n(e, t) {var n = e.createElement("p"),r = e.getElementsByTagName("head")[0] || e.documentElement;return n.innerHTML = "x<style>" + t + "</style>", r.insertBefore(n.lastChild, r.firstChild);}function r() {var e = b.elements;return "string" == typeof e ? e.split(" ") : e;}function a(e, t) {var n = b.elements;"string" != typeof n && (n = n.join(" ")), "string" != typeof e && (e = e.join(" ")), b.elements = n + " " + e, l(t);}function o(e) {var t = y[e[g]];return t || (t = {}, v++, e[g] = v, y[v] = t), t;}function i(e, n, r) {if (n || (n = t), u) return n.createElement(e);r || (r = o(n));var a;return a = r.cache[e] ? r.cache[e].cloneNode() : h.test(e) ? (r.cache[e] = r.createElem(e)).cloneNode() : r.createElem(e), !a.canHaveChildren || m.test(e) || a.tagUrn ? a : r.frag.appendChild(a);}function s(e, n) {if (e || (e = t), u) return e.createDocumentFragment();n = n || o(e);for (var a = n.frag.cloneNode(), i = 0, s = r(), c = s.length; c > i; i++) {a.createElement(s[i]);}return a;}function c(e, t) {t.cache || (t.cache = {}, t.createElem = e.createElement, t.createFrag = e.createDocumentFragment, t.frag = t.createFrag()), e.createElement = function (n) {return b.shivMethods ? i(n, e, t) : t.createElem(n);}, e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + r().join().replace(/[\w\-:]+/g, function (e) {return t.createElem(e), t.frag.createElement(e), 'c("' + e + '")';}) + ");return n}")(b, t.frag);}function l(e) {e || (e = t);var r = o(e);return !b.shivCSS || d || r.hasCSS || (r.hasCSS = !!n(e, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")), u || c(e, r), e;}var d,u,f = "3.7.3",p = e.html5 || {},m = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,h = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g = "_html5shiv",v = 0,y = {};!function () {try {var e = t.createElement("a");e.innerHTML = "<xyz></xyz>", d = "hidden" in e, u = 1 == e.childNodes.length || function () {t.createElement("a");var e = t.createDocumentFragment();return "undefined" == typeof e.cloneNode || "undefined" == typeof e.createDocumentFragment || "undefined" == typeof e.createElement;}();} catch (n) {d = !0, u = !0;}}();var b = { elements: p.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video", version: f, shivCSS: p.shivCSS !== !1, supportsUnknownElements: u, shivMethods: p.shivMethods !== !1, type: "default", shivDocument: l, createElement: i, createDocumentFragment: s, addElements: a };e.html5 = b, l(t), "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = b);}("undefined" != typeof e ? e : this, t);var z = "Moz O ms Webkit",N = S._config.usePrefixes ? z.toLowerCase().split(" ") : [];S._domPrefixes = N;var A;!function () {var e = {}.hasOwnProperty;A = r(e, "undefined") || r(e.call, "undefined") ? function (e, t) {return t in e && r(e.constructor.prototype[t], "undefined");} : function (t, n) {return e.call(t, n);};}(), S._l = {}, S.on = function (e, t) {this._l[e] || (this._l[e] = []), this._l[e].push(t), Modernizr.hasOwnProperty(e) && setTimeout(function () {Modernizr._trigger(e, Modernizr[e]);}, 0);}, S._trigger = function (e, t) {if (this._l[e]) {var n = this._l[e];setTimeout(function () {var e, r;for (e = 0; e < n.length; e++) {(r = n[e])(t);}}, 0), delete this._l[e];}}, Modernizr._q.push(function () {S.addTest = i;});var R = function () {function e(e, t) {var a;return e ? (t && "string" != typeof t || (t = s(t || "div")), e = "on" + e, a = e in t, !a && r && (t.setAttribute || (t = s("div")), t.setAttribute(e, ""), a = "function" == typeof t[e], t[e] !== n && (t[e] = n), t.removeAttribute(e)), a) : !1;}var r = !("onblur" in t.documentElement);return e;}();S.hasEvent = R, Modernizr.addTest("hashchange", function () {return R("hashchange", e) === !1 ? !1 : t.documentMode === n || t.documentMode > 7;}), Modernizr.addTest("audio", function () {var e = s("audio"),t = !1;try {t = !!e.canPlayType, t && (t = new Boolean(t), t.ogg = e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), t.mp3 = e.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/, ""), t.opus = e.canPlayType('audio/ogg; codecs="opus"') || e.canPlayType('audio/webm; codecs="opus"').replace(/^no$/, ""), t.wav = e.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), t.m4a = (e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")).replace(/^no$/, ""));} catch (n) {}return t;}), Modernizr.addTest("canvas", function () {var e = s("canvas");return !(!e.getContext || !e.getContext("2d"));}), Modernizr.addTest("canvastext", function () {return Modernizr.canvas === !1 ? !1 : "function" == typeof s("canvas").getContext("2d").fillText;}), Modernizr.addTest("video", function () {var e = s("video"),t = !1;try {t = !!e.canPlayType, t && (t = new Boolean(t), t.ogg = e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), t.h264 = e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), t.webm = e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""), t.vp9 = e.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ""), t.hls = e.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ""));} catch (n) {}return t;}), Modernizr.addTest("webgl", function () {var t = s("canvas"),n = "probablySupportsContext" in t ? "probablySupportsContext" : "supportsContext";return n in t ? t[n]("webgl") || t[n]("experimental-webgl") : "WebGLRenderingContext" in e;}), Modernizr.addTest("cssgradients", function () {for (var e, t = "background-image:", n = "gradient(linear,left top,right bottom,from(#9f9),to(white));", r = "", a = 0, o = k.length - 1; o > a; a++) {e = 0 === a ? "to " : "", r += t + k[a] + "linear-gradient(" + e + "left top, #9f9, white);";}Modernizr._config.usePrefixes && (r += t + "-webkit-" + n);var i = s("a"),c = i.style;return c.cssText = r, ("" + c.backgroundImage).indexOf("gradient") > -1;}), Modernizr.addTest("multiplebgs", function () {var e = s("a").style;return e.cssText = "background:url(https://),url(https://),red url(https://)", /(url\s*\(.*?){3}/.test(e.background);}), Modernizr.addTest("opacity", function () {var e = s("a").style;return e.cssText = k.join("opacity:.55;"), /^0.55$/.test(e.opacity);}), Modernizr.addTest("rgba", function () {var e = s("a").style;return e.cssText = "background-color:rgba(150,255,150,.5)", ("" + e.backgroundColor).indexOf("rgba") > -1;}), Modernizr.addTest("inlinesvg", function () {var e = s("div");return e.innerHTML = "<svg/>", "http://www.w3.org/2000/svg" == ("undefined" != typeof SVGRect && e.firstChild && e.firstChild.namespaceURI);});var $ = s("input"),M = "autocomplete autofocus list placeholder max min multiple pattern required step".split(" "),O = {};Modernizr.input = function (t) {for (var n = 0, r = t.length; r > n; n++) {O[t[n]] = !!(t[n] in $);}return O.list && (O.list = !(!s("datalist") || !e.HTMLDataListElement)), O;}(M);var j = "search tel url email datetime date month week time datetime-local number range color".split(" "),L = {};Modernizr.inputtypes = function (e) {for (var r, a, o, i = e.length, s = "1)", c = 0; i > c; c++) {$.setAttribute("type", r = e[c]), o = "text" !== $.type && "style" in $, o && ($.value = s, $.style.cssText = "position:absolute;visibility:hidden;", /^range$/.test(r) && $.style.WebkitAppearance !== n ? (_.appendChild($), a = t.defaultView, o = a.getComputedStyle && "textfield" !== a.getComputedStyle($, null).WebkitAppearance && 0 !== $.offsetHeight, _.removeChild($)) : /^(search|tel)$/.test(r) || (o = /^(url|email)$/.test(r) ? $.checkValidity && $.checkValidity() === !1 : $.value != s)), L[e[c]] = !!o;}return L;}(j), Modernizr.addTest("hsla", function () {var e = s("a").style;return e.cssText = "background-color:hsla(120,40%,100%,.5)", l(e.backgroundColor, "rgba") || l(e.backgroundColor, "hsla");});var B = "CSS" in e && "supports" in e.CSS,D = "supportsCSS" in e;Modernizr.addTest("supports", B || D);var F = {}.toString;Modernizr.addTest("svgclippaths", function () {return !!t.createElementNS && /SVGClipPath/.test(F.call(t.createElementNS("http://www.w3.org/2000/svg", "clipPath")));}), Modernizr.addTest("smil", function () {return !!t.createElementNS && /SVGAnimate/.test(F.call(t.createElementNS("http://www.w3.org/2000/svg", "animate")));});var I = function () {var t = e.matchMedia || e.msMatchMedia;return t ? function (e) {var n = t(e);return n && n.matches || !1;} : function (t) {var n = !1;return u("@media " + t + " { #modernizr { position: absolute; } }", function (t) {n = "absolute" == (e.getComputedStyle ? e.getComputedStyle(t, null) : t.currentStyle).position;}), n;};}();S.mq = I;var V = S.testStyles = u;Modernizr.addTest("touchevents", function () {var n;if ("ontouchstart" in e || e.DocumentTouch && t instanceof DocumentTouch) n = !0;else {var r = ["@media (", k.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");V(r, function (e) {n = 9 === e.offsetTop;});}return n;});var W = function () {var e = navigator.userAgent,t = e.match(/w(eb)?osbrowser/gi),n = e.match(/windows phone/gi) && e.match(/iemobile\/([0-9])+/gi) && parseFloat(RegExp.$1) >= 9;return t || n;}();W ? Modernizr.addTest("fontface", !1) : V('@font-face {font-family:"font";src:url("https://")}', function (e, n) {var r = t.getElementById("smodernizr"),a = r.sheet || r.styleSheet,o = a ? a.cssRules && a.cssRules[0] ? a.cssRules[0].cssText : a.cssText || "" : "",i = /src/i.test(o) && 0 === o.indexOf(n.split(" ")[0]);Modernizr.addTest("fontface", i);}), V('#modernizr{font:0/0 a}#modernizr:after{content:":)";visibility:hidden;font:7px/1 a}', function (e) {Modernizr.addTest("generatedcontent", e.offsetHeight >= 6);});var q = S._config.usePrefixes ? z.split(" ") : [];S._cssomPrefixes = q;var H = function H(t) {var r,a = k.length,o = e.CSSRule;if ("undefined" == typeof o) return n;if (!t) return !1;if (t = t.replace(/^@/, ""), r = t.replace(/-/g, "_").toUpperCase() + "_RULE", r in o) return "@" + t;for (var i = 0; a > i; i++) {var s = k[i],c = s.toUpperCase() + "_" + r;if (c in o) return "@-" + s.toLowerCase() + "-" + t;}return !1;};S.atRule = H;var U = { elem: s("modernizr") };Modernizr._q.push(function () {delete U.elem;});var G = { style: U.elem.style };Modernizr._q.unshift(function () {delete G.style;});var J = S.testProp = function (e, t, r) {return v([e], n, t, r);};Modernizr.addTest("textshadow", J("textShadow", "1px 1px")), S.testAllProps = y;var Z = S.prefixed = function (e, t, n) {return 0 === e.indexOf("@") ? H(e) : (-1 != e.indexOf("-") && (e = c(e)), t ? y(e, t, n) : y(e, "pfx"));};Modernizr.addAsyncTest(function () {var t;try {t = Z("indexedDB", e);} catch (n) {}if (t) {var r = "modernizr-" + Math.random(),a = t.open(r);a.onerror = function () {a.error && "InvalidStateError" === a.error.name ? i("indexeddb", !1) : (i("indexeddb", !0), b(t, r));}, a.onsuccess = function () {i("indexeddb", !0), b(t, r);};} else i("indexeddb", !1);}), S.testAllProps = x, Modernizr.addTest("cssanimations", x("animationName", "a", !0)), Modernizr.addTest("backgroundsize", x("backgroundSize", "100%", !0)), Modernizr.addTest("borderimage", x("borderImage", "url() 1", !0)), Modernizr.addTest("borderradius", x("borderRadius", "0px", !0)), Modernizr.addTest("boxshadow", x("boxShadow", "1px 1px", !0)), function () {Modernizr.addTest("csscolumns", function () {var e = !1,t = x("columnCount");try {e = !!t, e && (e = new Boolean(e));} catch (n) {}return e;});for (var e, t, n = ["Width", "Span", "Fill", "Gap", "Rule", "RuleColor", "RuleStyle", "RuleWidth", "BreakBefore", "BreakAfter", "BreakInside"], r = 0; r < n.length; r++) {e = n[r].toLowerCase(), t = x("column" + n[r]), ("breakbefore" === e || "breakafter" === e || "breakinside" == e) && (t = t || x(n[r])), Modernizr.addTest("csscolumns." + e, t);}}(), Modernizr.addTest("flexbox", x("flexBasis", "1px", !0)), Modernizr.addTest("cssreflections", x("boxReflect", "above", !0)), Modernizr.addTest("csstransforms", function () {return -1 === navigator.userAgent.indexOf("Android 2.") && x("transform", "scale(1)", !0);}), Modernizr.addTest("csstransforms3d", function () {var e = !!x("perspective", "1px", !0),t = Modernizr._config.usePrefixes;if (e && (!t || "webkitPerspective" in _.style)) {var n,r = "#modernizr{width:0;height:0}";Modernizr.supports ? n = "@supports (perspective: 1px)" : (n = "@media (transform-3d)", t && (n += ",(-webkit-transform-3d)")), n += "{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}", V(r + n, function (t) {e = 7 === t.offsetWidth && 18 === t.offsetHeight;});}return e;}), Modernizr.addTest("csstransitions", x("transition", "all", !0)), a(), o(T), delete S.addTest, delete S.addAsyncTest;for (var K = 0; K < Modernizr._q.length; K++) {Modernizr._q[K]();}e.Modernizr = Modernizr;}(window, document);

},{}]},{},[2]);
