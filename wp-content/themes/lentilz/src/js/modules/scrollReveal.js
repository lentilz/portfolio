/* Animate reveal elements on scroll */
/* global window, sr */

'use strict';

import scrollreveal from 'scrollreveal';

const scrollReveal = function() {
  window.sr = scrollreveal({
    duration: 900,
    afterReveal: function(el) {
      el.classList.add('js-revealed');
    },
  });

  sr.reveal('.js-reveal');
};

export default scrollReveal;
