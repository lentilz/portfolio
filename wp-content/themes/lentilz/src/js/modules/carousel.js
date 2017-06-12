/* eslint-env browser */
'use strict';

import $ from 'jquery';
import 'vendor/jquery.slick.js';

const carousel = function() {
  $('.js-carousel').slick({
    adaptiveHeight: true,
    dots: false,
    centerMode: true,
    slidesToShow: 1,
    arrows: true,
    centerPadding: '0px',
    infinite: false,
    prevArrow: '<button type="button" class="tiny">' +
        '<i class="fa fa-chevron-left"></i></button>',
    nextArrow: '<button type="button" class="tiny">' +
        '<i class="fa fa-chevron-right"></i></button>',
  });
};

export default carousel;
