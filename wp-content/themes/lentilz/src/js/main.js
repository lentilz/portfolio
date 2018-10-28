(function () {
   'use strict';
}());

import jquery from 'jquery';
require('./vendor/modernizr.js');

import scrollReveal from './modules/scrollReveal.js';

(function($) {
  // Init scroll reveal Elements
  scrollReveal();
})(jquery);
