/* eslint-env browser */
'use strict';

import $ from 'jquery';

const socialShare = function(fbId) {
  const $body = $('body');

  // Facebook sharing with the SDK
  $.getScript('//connect.facebook.net/en_US/sdk.js').done(function() {
    $body.on('click.sharer-fb', '.sharer-fb', function(e) {
      const $link = $(e.currentTarget);
      const options = {
        method: 'feed',
        display: 'popup',
      };
      const newUrl = $link.data('redirect-to') ?
          $link.data('redirect-to') : null;

      e.preventDefault();

      window.FB.init({
        appId: fbId,
        xfbml: false,
        version: 'v2.0',
        status: false,
        cookie: true,
      });

      if ($link.data('title')) {
        options.name = $link.data('title');
      }

      if ($link.data('url')) {
        options.link = $link.data('url');
      }

      if ($link.data('picture')) {
        options.picture = $link.data('picture');
      }

      if ($link.data('description')) {
        options.description = $link.data('description');
      }

      window.FB.ui(options, function(response) {
        if (newUrl) {
          window.location.href = newUrl;
        }
      });
    });
  });

  // Twitter sharing
  $body.on('click.sharer-tw', '.sharer-tw', function(e) {
    const $link = $(e.currentTarget);
    const url = $link.data('url');
    const text = $link.data('description');
    const via = $link.data('source');
    let twitterURL = `https://twitter.com/share?url=${encodeURIComponent(url)}`;

    e.preventDefault();

    if (text) {
      twitterURL += `&text=${encodeURIComponent(text)}`;
    }
    if (via) {
      twitterURL += `&via=${encodeURIComponent(via)}`;
    }
    window.open(twitterURL, 'tweet',
        'width=500,height=384,menubar=no,status=no,toolbar=no');
  });

  // LinkedIn sharing
  $body.on('click.sharer-li', '.sharer-li', function(e) {
    const $link = $(e.target);
    const url = $link.data('url');
    const title = $link.data('title');
    const summary = $link.data('description');
    const source = $link.data('source');
    let linkedinURL = 'https://www.linkedin.com/shareArticle?mini=true&url=' +
        encodeURIComponent(url);

    e.preventDefault();

    if (title) {
      linkedinURL += `&title=${encodeURIComponent(title)}`;
    } else {
      linkedinURL += '&title=';
    }

    if (summary) {
      linkedinURL +=
          `&summary=${encodeURIComponent(summary.substring(0, 256))}`;
    }

    if (source) {
      linkedinURL += `&source=${encodeURIComponent(source)}`;
    }

    window.open(linkedinURL, 'linkedin',
        'width=520,height=570,menubar=no,status=no,toolbar=no');
  });
};

export default socialShare;
