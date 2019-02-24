<?php

/**
* Remove mapsvg button from TinyMCE primary toolbar
*/
function mapsvgRemoveButton (){
  function mapsvg_mce_button($buttons)
  {
      $remove = array('mapsvg');

      return array_diff($buttons, $remove);
  }

  add_filter('mce_buttons', 'mapsvg_mce_button');
}

// PLUGIN adds the button after init in mapsvg_setup_tinymce_plugin function  (http://seawonders.com/wp-content/plugins/mapsvg/mapsvg.php_24042018),
// So, remove after after init
if ( is_admin() ) {
  add_action( 'init', 'mapsvgRemoveButton' );
}
