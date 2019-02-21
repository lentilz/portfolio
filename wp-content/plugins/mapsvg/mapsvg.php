<?php
/*
Plugin Name: MapSVG
Plugin URI: http://codecanyon.net/item/mapsvg-interactive-vector-maps/2547255?ref=RomanCode
Description: Interactive Vector Maps (SVG), Google maps, Image maps.
Author: Roman S. Stepanov
Author URI: http://codecanyon.net/user/RomanCode
Version: 4.4.3
*/


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//error_reporting(E_ALL);
define('MAPSVG_DEBUG', false);

$upload_dir = wp_upload_dir();

define('MAPSVG_PLUGIN_URL', plugin_dir_url( __FILE__ ));
define('MAPSVG_PLUGIN_DIR', realpath(plugin_dir_path( __FILE__ )));
$parts = parse_url(MAPSVG_PLUGIN_URL);
define('MAPSVG_PLUGIN_PATH', $parts['path']);
define('MAPSVG_MAPS_DIR', realpath(MAPSVG_PLUGIN_DIR . '/maps'));
define('MAPSVG_MAPS_UPLOADS_DIR', $upload_dir['basedir'] . DIRECTORY_SEPARATOR. 'mapsvg');
define('MAPSVG_MAPS_UPLOADS_URL', $upload_dir['baseurl'] . '/mapsvg/');
define('MAPSVG_MAPS_URL', MAPSVG_PLUGIN_URL . 'maps/');
define('MAPSVG_PINS_DIR', realpath(MAPSVG_PLUGIN_DIR . '/markers'));
define('MAPSVG_PINS_URL', MAPSVG_PLUGIN_URL . 'markers/');
define('MAPSVG_VERSION', '4.4.3');
define('MAPSVG_ASSET_VERSION', '4.4.3'.(MAPSVG_DEBUG?rand():''));
define('MAPSVG_JQUERY_VERSION', '9.4.42');
define('MAPSVG_DB_VERSION', '1.0');
define('MAPSVG_TABLE_NAME',  'mapsvg');

$mapsvg_inline_script = array();
$mapsvg_page = 'index';



/**
 * Add buttons to Visual Editor
 */
function mapsvg_setup_tinymce_plugin(){
// Check if the logged in WordPress User can edit Posts or Pages
    // If not, don't register our TinyMCE plugin
    if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
        return;
    }

    // Check if the logged in WordPress User has the Visual Editor enabled
    // If not, don't register our TinyMCE plugin
    if ( get_user_option( 'rich_editing' ) !== 'true' ) {
        return;
    }

    wp_register_style('mapsvg-tinymce', MAPSVG_PLUGIN_URL . "css/mapsvg-tinymce.css");
    wp_enqueue_style('mapsvg-tinymce');

    // Setup some filters
    add_filter('mce_external_plugins', 'mapsvg_add_tinymce_plugin');
    add_filter('mce_buttons', 'mapsvg_add_tinymce_button');
    add_action('wp_footer', 'add_thickbox');

}

if ( is_admin() ) {
    add_action( 'init', 'mapsvg_setup_tinymce_plugin' );
}

/**
 * Adds a TinyMCE plugin compatible JS file to the TinyMCE / Visual Editor instance
 *
 * @param array $plugin_array Array of registered TinyMCE Plugins
 * @return array Modified array of registered TinyMCE Plugins
 */
function mapsvg_add_tinymce_plugin( $plugin_array ) {
    $plugin_array['mapsvg'] = MAPSVG_PLUGIN_URL . 'js/tinymce-mapsvg.js';
    return $plugin_array;
}

/**
 * Adds a button to the TinyMCE / Visual Editor which the user can click
 * to insert a custom CSS class.
 *
 * @param array $buttons Array of registered TinyMCE Buttons
 * @return array Modified array of registered TinyMCE Buttons
 */
function mapsvg_add_tinymce_button($buttons){
    array_push( $buttons, 'mapsvg' );
    return $buttons;
}


/**
 * Add common JS & CSS
 */
function mapsvg_add_jscss_common(){

    wp_register_style('mapsvg', MAPSVG_PLUGIN_URL . 'css/mapsvg.css', null, MAPSVG_ASSET_VERSION);
    wp_enqueue_style('mapsvg');        

    wp_register_script('jquery.mousewheel', MAPSVG_PLUGIN_URL . 'js/jquery.mousewheel.min.js',array('jquery'), '3.0.6');
    wp_enqueue_script('jquery.mousewheel', null, '3.0.6');

    wp_register_script('handlebars', MAPSVG_PLUGIN_URL . 'js/handlebars.js', null, '4.0.2');
    wp_enqueue_script('handlebars');
    wp_enqueue_script('handlebars-helpers', MAPSVG_PLUGIN_URL . 'js/handlebars-helpers.js', null, MAPSVG_ASSET_VERSION);

    wp_register_script('form.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/form.mapsvg.js', array('jquery','mapsvg'), MAPSVG_ASSET_VERSION);
    wp_enqueue_script('form.controller.admin.mapsvg');

    wp_register_script('typeahead', MAPSVG_PLUGIN_URL . 'js/typeahead.bundle.min.js', null, '1.0');
    wp_enqueue_script('typeahead');

    wp_enqueue_script('database-service.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-service.js', array('jquery', 'mapsvg'), MAPSVG_ASSET_VERSION);

    wp_register_script('nanoscroller', MAPSVG_PLUGIN_URL . 'js/jquery.nanoscroller.min.js', null, '0.8.7');
    wp_enqueue_script('nanoscroller');
    wp_register_style('nanoscroller', MAPSVG_PLUGIN_URL . 'css/nanoscroller.css');
    wp_enqueue_style('nanoscroller');



    if(MAPSVG_DEBUG)        
        wp_register_script('mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg.js', array('jquery'), rand());
    else
        wp_register_script('mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg.min.js', array('jquery'), MAPSVG_JQUERY_VERSION);

    wp_localize_script('mapsvg','mapsvg_paths', array(
        'root'      => MAPSVG_PLUGIN_PATH,
        'templates' => MAPSVG_PLUGIN_PATH.'js/mapsvg-admin/templates/',
        'maps'   => parse_url(MAPSVG_MAPS_URL, PHP_URL_PATH),
        'uploads'      => parse_url(MAPSVG_MAPS_UPLOADS_URL, PHP_URL_PATH)
    ));
    wp_enqueue_script('mapsvg');

}

/**
 * Add metabox JS & CSS
 */
function mapsvg_add_jscss_metabox(){

    wp_enqueue_media();

    wp_enqueue_script('metaboxadmin.mapsvg.js', MAPSVG_PLUGIN_URL . "js/mapsvg-admin/metaboxadmin.mapsvg.js", array('mapsvg'), MAPSVG_ASSET_VERSION);
    wp_register_script('form.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/form.mapsvg.js', array('jquery','mapsvg'), MAPSVG_ASSET_VERSION);
    wp_enqueue_script('form.controller.admin.mapsvg');

    wp_register_script('bootstrap', MAPSVG_PLUGIN_URL . "js/bootstrap.min.js", null, '3.3.6');
    wp_enqueue_script('bootstrap');

    wp_register_style('bootstrap-iso', MAPSVG_PLUGIN_URL . "css/bootstrap-iso.css", null, '3.3.6');
    wp_enqueue_style('bootstrap-iso');
    wp_register_style('fontawesome', MAPSVG_PLUGIN_URL . "css/font-awesome.min.css", null, '4.4.0');
    wp_enqueue_style('fontawesome');

    wp_enqueue_style('mapsvg-admin', MAPSVG_PLUGIN_URL . "css/main.css", null, MAPSVG_ASSET_VERSION);

    wp_register_script('select2', MAPSVG_PLUGIN_URL . 'js/select2.full.min.js', array('jquery'), '4.0.3',true);
    wp_enqueue_script('select2');
    wp_register_style('select2', MAPSVG_PLUGIN_URL . 'css/select2.min.css', null, '4.0.3');
    wp_enqueue_style('select2');


    wp_register_script('sortable', MAPSVG_PLUGIN_URL . 'js/sortable.min.js', null, '1.4.2');
    wp_enqueue_script('sortable');
}



/**
 * Add admin's JS & CSS
 */
function mapsvg_add_jscss_admin($hook_suffix){

    global $mapsvg_settings_page, $wp_version;

    // 2.x backward compatibility
    if(isset($_GET['map_id']) && !empty($_GET['map_id'])){
        $mapsvg_version = get_post_meta($_GET['map_id'], 'mapsvg_version', true);
        if(version_compare($mapsvg_version, '3.0.0', '<')){
            mapsvg_add_jscss_admin_2();
            return;
        }
    }

    // Load scripts only if we on mapSVG admin page
    if ( $mapsvg_settings_page != $hook_suffix )
        return;

    mapsvg_add_jscss_common();

    if(isset($_GET['page']) && $_GET['page']=='mapsvg-config'){

        wp_enqueue_media();

        wp_register_script('admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/admin.js', array('jquery'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('admin.mapsvg');

        wp_enqueue_script('controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/controller.js', array('mapsvg','admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('settings.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/settings-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('regions.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/regions-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('regions-list.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/regions-list-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('regions-structure.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/regions-structure-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('regions-csv.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/regions-csv-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('directory.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/directory-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('details.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/details-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('filters.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/filters-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('filters-structure.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/filters-structure-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('filters-settings.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/filters-settings-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('actions.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/actions-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('modal.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/modal-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('colors.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/colors-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('javascript.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/javascript-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('templates.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/templates-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('database.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('database-list.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-list-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('google-maps.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/google-maps.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('layers.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/layers-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('layers-list.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/layers-list-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('draw.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/draw.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('draw-region.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/draw-region-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
//        wp_enqueue_script('floors.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/floors-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
//        wp_enqueue_script('floors-list.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/floors-list-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('database-structure.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-structure-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('database-settings.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-settings-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('database-csv.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/database-csv-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('css.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/css-controller.js', array('mapsvg','admin.mapsvg','controller.admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_register_script('form.controller.admin.mapsvg', MAPSVG_PLUGIN_URL . 'js/mapsvg-admin/form.mapsvg.js', array('jquery','mapsvg','admin.mapsvg'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('form.controller.admin.mapsvg');
        
        wp_register_script('papaparse', MAPSVG_PLUGIN_URL . "js/papaparse.min.js", null, '4.6.0');
        wp_enqueue_script('papaparse');

        wp_register_script('bootstrap', MAPSVG_PLUGIN_URL . "js/bootstrap.min.js", null, '3.3.6');
        wp_enqueue_script('bootstrap');
    	wp_register_style('bootstrap', MAPSVG_PLUGIN_URL . "css/bootstrap.min.css", null, '3.3.6');
    	wp_enqueue_style('bootstrap');

        wp_register_script('bootstrap-toggle', MAPSVG_PLUGIN_URL . "js/bootstrap-toggle.min.js", null, '3.3.6');
        wp_enqueue_script('bootstrap-toggle');
        wp_register_style('bootstrap-toggle', MAPSVG_PLUGIN_URL . "css/bootstrap-toggle.min.css", null, '3.3.6');
        wp_enqueue_style('bootstrap-toggle');

        wp_register_style('fontawesome', MAPSVG_PLUGIN_URL . "css/font-awesome.min.css", null, '4.4.0');
    	wp_enqueue_style('fontawesome');
        
        wp_register_script('bootstrap-colorpicker', MAPSVG_PLUGIN_URL . 'js/bootstrap-colorpicker.min.js');
        wp_enqueue_script('bootstrap-colorpicker');
    	wp_register_style('bootstrap-colorpicker', MAPSVG_PLUGIN_URL . 'css/bootstrap-colorpicker.min.css');
        wp_enqueue_style('bootstrap-colorpicker');

        wp_enqueue_script('growl', MAPSVG_PLUGIN_URL . 'js/jquery.growl.js', array('jquery'), '4.0',true);
        wp_register_style('growl', MAPSVG_PLUGIN_URL . 'css/jquery.growl.css', null, '1.0');
        wp_enqueue_style('growl');

        wp_register_style('main.css', MAPSVG_PLUGIN_URL . 'css/main.css', null, MAPSVG_ASSET_VERSION);
    	wp_enqueue_style('main.css');


        wp_register_script('select2', MAPSVG_PLUGIN_URL . 'js/select2.full.min.js', array('jquery'), '4.0.3',true);
        wp_enqueue_script('select2');
        wp_register_style('select2', MAPSVG_PLUGIN_URL . 'css/select2.min.css');
    	wp_enqueue_style('select2');

        wp_register_script('ionslider', MAPSVG_PLUGIN_URL . 'js/ion.rangeSlider.min.js', array('jquery'), '2.1.2');
        wp_enqueue_script('ionslider');
        wp_register_style('ionslider', MAPSVG_PLUGIN_URL . 'css/ion.rangeSlider.css');
        wp_enqueue_style('ionslider');
        wp_register_style('ionslider-skin', MAPSVG_PLUGIN_URL . 'css/ion.rangeSlider.skinNice.css');
        wp_enqueue_style('ionslider-skin');

        wp_register_script('codemirror', MAPSVG_PLUGIN_URL . 'js/codemirror.js', null, '1.0');
        wp_enqueue_script('codemirror');
        wp_register_style('codemirror', MAPSVG_PLUGIN_URL . 'css/codemirror.css');
        wp_enqueue_style('codemirror');
        wp_register_script('codemirror.javascript', MAPSVG_PLUGIN_URL . 'js/codemirror.javascript.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.javascript');
        wp_register_script('codemirror.xml', MAPSVG_PLUGIN_URL . 'js/codemirror.xml.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.xml');
        wp_register_script('codemirror.css', MAPSVG_PLUGIN_URL . 'js/codemirror.css.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.css');
        wp_register_script('codemirror.htmlmixed', MAPSVG_PLUGIN_URL . 'js/codemirror.htmlmixed.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.htmlmixed');
        wp_register_script('codemirror.simple', MAPSVG_PLUGIN_URL . 'js/codemirror.simple.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.simple');
        wp_register_script('codemirror.multiplex', MAPSVG_PLUGIN_URL . 'js/codemirror.multiplex.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.multiplex');
        wp_register_script('codemirror.handlebars', MAPSVG_PLUGIN_URL . 'js/codemirror.handlebars.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.handlebars');
        wp_register_script('codemirror.hint', MAPSVG_PLUGIN_URL . 'js/codemirror.show-hint.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.hint');
        wp_register_script('codemirror.anyword-hint', MAPSVG_PLUGIN_URL . 'js/codemirror.anyword-hint.js', array('codemirror'), '1.0');
        wp_enqueue_script('codemirror.anyword-hint');
        wp_register_style('codemirror.hint.css', MAPSVG_PLUGIN_URL . 'css/codemirror.show-hint.css', array('codemirror'), '1.0');
        wp_enqueue_style('codemirror.hint.css');

//        wp_register_script('typeahead', MAPSVG_PLUGIN_URL . 'js/typeahead.bundle.min.js', null, '1.0');
//        wp_enqueue_script('typeahead');

        wp_register_script('sortable', MAPSVG_PLUGIN_URL . 'js/sortable.min.js', null, '1.4.2');
        wp_enqueue_script('sortable');

//        wp_register_script('summernote', MAPSVG_PLUGIN_URL . 'js/summernote.min.js', array('bootstrap', 'jquery'), '0.8.2');
//        wp_enqueue_script('summernote');
//        wp_register_style('summernote', MAPSVG_PLUGIN_URL . 'css/summernote.css');
//        wp_enqueue_style('summernote');

        wp_register_script('jscrollpane', MAPSVG_PLUGIN_URL . 'js/jquery.jscrollpane.min.js', null, '0.8.7');
        wp_enqueue_script('jscrollpane');
        wp_register_style('jscrollpane', MAPSVG_PLUGIN_URL . 'css/jquery.jscrollpane.css');
        wp_enqueue_style('jscrollpane');

        wp_register_script('html2canvas', MAPSVG_PLUGIN_URL . 'js/html2canvas.min.js', null, '0.5.0');
        wp_enqueue_script('html2canvas');
        
        wp_register_script('bootstrap-datepicker', MAPSVG_PLUGIN_URL . 'js/bootstrap-datepicker.min.js', array('bootstrap'), '1.6.4.2');
        wp_enqueue_script('bootstrap-datepicker');
        wp_register_script('bootstrap-datepicker-locales', MAPSVG_PLUGIN_URL . 'js/datepicker-locales/locales.js', array('bootstrap','bootstrap-datepicker'), '1.0');
        wp_enqueue_script('bootstrap-datepicker-locales');
        wp_register_style('bootstrap-datepicker', MAPSVG_PLUGIN_URL . 'css/bootstrap-datepicker.min.css', array('bootstrap'), '1.6.4.2');
        wp_enqueue_style('bootstrap-datepicker');

        wp_register_script('path-data-polyfill', MAPSVG_PLUGIN_URL . 'js/path-data-polyfill.js', null, '1.0');
        wp_enqueue_script('path-data-polyfill');
    }
     
}


/**
 * Add submenu element to Plugins
 */
$mapsvg_settings_page = '';

function mapsvg_config_page() {
    global $mapsvg_settings_page;

	if ( function_exists('add_menu_page') && current_user_can('edit_posts'))
		$mapsvg_settings_page = add_menu_page('MapSVG', 'MapSVG', 'edit_posts', 'mapsvg-config', 'mapsvg_conf', '', 66);


    add_action('admin_enqueue_scripts', 'mapsvg_add_jscss_admin',0);
}

add_action( 'admin_menu', 'mapsvg_config_page' );


/**
 * Register [mapsvg] shortcode
 */
function mapsvg_print( $atts ){
    global $mapsvg_inline_script;


    // 2.x backward compatibility
    $mapsvg_version = get_post_meta($atts['id'], 'mapsvg_version', true);
    if(version_compare($mapsvg_version, '3.0.0', '<')){
        mapsvg_add_jscss_common_2();
        return mapsvg_print_2($atts);
    }

    mapsvg_add_jscss_common();
    do_action('mapsvg_shortcode');


    $post = mapsvg_get_map($atts['id']);

    if (empty($post->ID))
    return 'Map not found, please check "id" parameter in your shortcode.';

    $data    = '<div id="mapsvg-'.$post->ID.'" class="mapsvg"></div>';
    $script  = "<script type=\"text/javascript\">";
    $script .= "jQuery(document).ready(function(){";
    $script .= "MapSVG.version = '".MAPSVG_VERSION."';\n";
    $script .= 'var mapsvg_options = '.$post->post_content.';';

    if(!empty($atts['selected'])){
      $country = str_replace(' ','_', $atts['selected']);
      $script .= 'jQuery.extend( true, mapsvg_options, {regions: {"'.$country.'": {selected: true}}} );';
    }
    $script .= 'jQuery.extend( true, mapsvg_options, {svg_file_version: '.(int)get_post_meta($post->ID, 'mapsvg_svg_file_version', true).'} );';

    $script .= 'jQuery("#mapsvg-'.$post->ID.'").mapSvg(mapsvg_options);});</script>';

    $mapsvg_inline_script[] = $script;

    $style = get_post_meta($post->ID, 'mapsvg_css', true);
    if($style){
        $style = '<style>'.$style.'</style>';
        $mapsvg_inline_script[] = $style;
    }

    add_action('wp_footer', 'script', 9998);

    return $data;
}
add_shortcode( 'mapsvg', 'mapsvg_print' );


function script(){
    global $mapsvg_inline_script;
    foreach($mapsvg_inline_script as $m){
        echo $m;
    }
}

function mapsvg_so_handle_038($content) {
    $content = str_replace(array("&#038;","&amp;"), "&", $content); // or $url = $original_url
    return $content;
}
add_filter('the_content', 'mapsvg_so_handle_038', 199, 1);


/**
 * Read JS map settings from DB
 */
function mapsvg_get_map($id, $format = 'object'){
    global $wpdb;

    $res = $wpdb->get_results(
        $wpdb->prepare("select * from $wpdb->posts WHERE ID = %d", (int)$id)
    );
    $res = $res && isset($res[0]) ? $res[0] : array();
    return $format == 'object' ? $res : json_encode($res);
}

/**
 * Save map settings as custom type post (post_type = mapsvg)
 */
function mapsvg_save( $data ){
    global $wpdb;

    // Check nonce
//    check_ajax_referer('ajax_mapsvg_save-'.$_POST['data']['map_id']);
    // Check user rights
    if(!current_user_can('edit_posts'))
        die();

    $data_js   = stripslashes($data['mapsvg_data']);
    // Decode encoded data (select / table / database - words blocked by Apache mod_sec):
    $data_js = str_replace("!mapsvg-encoded-slct", "select",   $data_js);
    $data_js = str_replace("!mapsvg-encoded-tbl",  "table",    $data_js);
    $data_js = str_replace("!mapsvg-encoded-db",   "database", $data_js);
    $data_js = str_replace("!mapsvg-encoded-vc",   "varchar", $data_js);

    $postarr = array(
    	'post_type'    => 'mapsvg',
    	'post_status'  => 'publish'
    );

    if(isset($data['title'])){
        $postarr['post_title'] = strip_tags(stripslashes($data['title']));
    }else{
        $postarr['post_title'] = "New Map";
    }


    $postarr['post_content'] = $data_js;


    if(isset($data['map_id']) && $data['map_id']!='new'){
        // UPDATE

        $postarr['ID'] = (int)$data['map_id'];

        // 2.x backward compatibility
        $mapsvg_version = get_post_meta($postarr['ID'], 'mapsvg_version', true);
        if(version_compare($mapsvg_version, '3.0.0', '<')){
            return mapsvg_save_2($data);
        }

        // PREPARE STATEMENT AND PUT INTO DB
        $wpdb->query(
            $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID = %d", array($postarr['post_title'], $postarr['post_content'], $postarr['ID']))
        );
        update_post_meta($postarr['ID'], 'mapsvg_version', MAPSVG_VERSION);

        if(isset($data['css'])){
            $data_css   = stripslashes($data['css']);
            if(!metadata_exists('post', $postarr['ID'], 'mapsvg_css')){
                $res = add_post_meta($postarr['ID'], 'mapsvg_css', $data_css);
            }else{
                $res = update_post_meta($postarr['ID'], 'mapsvg_css', $data_css);
            }
        }

        $post_id = $postarr['ID'];

        // may be reload SVG file
        mapsvg_set_regions_table($post_id, $data['source'], (isset($data['region_prefix'])?$data['region_prefix']:null));

        update_post_meta($post_id, 'mapsvg_svg_file', $data['source']);

        if(isset($data['region_prefix'])){
            update_post_meta($post_id, 'mapsvg_region_prefix', $data['region_prefix']);
        }

    }else{
        // NEW MAP
        $post_id = wp_insert_post( $postarr );
        // PREPARE STATEMENT AND PUT INTO DB
        $wpdb->query(
            $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID = %d", array($postarr['post_title'], $postarr['post_content'], $post_id))
        );
        add_post_meta($post_id, 'mapsvg_version', MAPSVG_VERSION);

        if(isset($data['css'])) {
            $data['css'] = stripslashes($data['css']);
        }else{
            $data['css'] = '';

        }
        add_post_meta($post_id, 'mapsvg_css', $data['css']);
    }

    return $post_id;
}

function mapsvg_table_name($map_id, $table){
    global $wpdb;
    return $wpdb->prefix.MAPSVG_TABLE_NAME.'_'.$table.'_'.$map_id;
}

function mapsvg_get_schema($map_id, $table){
    global $wpdb;
    $table_name = mapsvg_table_name($map_id, $table);
    return $wpdb->get_var("SELECT fields FROM ".$wpdb->prefix."mapsvg_schema WHERE table_name LIKE '%mapsvg_".$table."_".$map_id."'");
}
function _mapsvg_get_schema(){
    echo mapsvg_get_schema((int)$_GET['map_id'], $_GET['table']);
    die();
}
add_action('wp_ajax_mapsvg_get_schema', '_mapsvg_get_schema');
add_action('wp_ajax_nopriv_mapsvg_get_schema', '_mapsvg_get_schema');


function mapsvg_query(){
    global $wpdb;
    $res = $wpdb->get_results(stripslashes($_POST['query']));
    if($wpdb->last_error)
        echo $wpdb->last_error;
    else
        echo json_encode($res);
    die();
}
add_action('wp_ajax_mapsvg_query', 'mapsvg_query');



function _mapsvg_save_schema($map_id, $_table, $schema, $skip_db_update = false){
    global $wpdb;

    $table_type  = $_table;
    $table       = mapsvg_table_name($map_id, $_table);
    $schema_json = json_encode($schema);
    $prev_schema = json_decode(mapsvg_get_schema($map_id, $_table), true);
    $schema_id = $wpdb->get_var("SELECT id FROM ".$wpdb->prefix."mapsvg_schema WHERE table_name='".$table."'");

    if($schema_id)
        $wpdb->update($wpdb->prefix."mapsvg_schema", array('table_name'=>$table,'fields'=>$schema_json), array('id'=>$schema_id));
    else
        $wpdb->insert($wpdb->prefix."mapsvg_schema", array('table_name'=>$table,'fields'=>$schema_json));

    // Set connections WP Posts > Maps
    foreach($schema as $s){
        if($s['type']=='post'){
            $option_name = 'mapsvg_to_posts';
            $connections = (array)json_decode(get_site_option($option_name,'[]'));
            if($s['add_fields']=='true'){
                if(!$connections[$s['post_type']])
                    $connections[$s['post_type']] = array();
                if(!in_array($map_id,$connections[$s['post_type']])){
                    $connections[$s['post_type']][] = $map_id;
                    $connections = json_encode($connections);
                    update_site_option($option_name, $connections);
                }
            }else{
                if($connections[$s['post_type']]){
                    $post_connections = $connections[$s['post_type']];
                    $post_connections = array_diff( $post_connections, array($map_id) );
                    $connections[$s['post_type']] = $post_connections;
                    $connections = json_encode($connections);
                    update_site_option($option_name, $connections);
                }
            }
        }
    }

    // create / update mysql table
    if(!$skip_db_update)
        mapsvg_set_db($map_id, $table_type, $schema, $prev_schema);
}

function mapsvg_save_schema(){
    $schema_json = stripslashes($_POST['schema']);

    $schema_json = str_replace("!mapsvg-encoded-slct", "select",   $schema_json);
    $schema_json = str_replace("!mapsvg-encoded-tbl",  "table",    $schema_json);
    $schema_json = str_replace("!mapsvg-encoded-db",   "database", $schema_json);
    $schema_json = str_replace("!mapsvg-encoded-vc",   "varchar", $schema_json);


    $schema      = json_decode($schema_json, true);
    _mapsvg_save_schema((int)$_POST['map_id'], $_POST['table'], $schema);
    die();
}
add_action('wp_ajax_mapsvg_save_schema', 'mapsvg_save_schema');


function mapsvg_delete($id, $ajax){
    global $wpdb;

    // Check nonce
    check_ajax_referer( 'ajax_mapsvg_delete-'.$id);
    // Check user rights
    if(!current_user_can('delete_posts'))
        die();


    // 2.x backward compatibility
    $mapsvg_version = get_post_meta($id, 'mapsvg_version', true);
    if(version_compare($mapsvg_version, '3.0.0', '<')){
        return mapsvg_delete_2($id, $ajax);
    }

    wp_delete_post($id);

    $mapsvg_table = $wpdb->get_var("SHOW TABLES LIKE '".mapsvg_table_name($id, 'database')."'");

    if($mapsvg_table){
        $wpdb->query("DROP TABLE ".$mapsvg_table);
        $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id' => $id));
        $wpdb->query("DELETE FROM ".$wpdb->prefix."mapsvg_schema WHERE table_name='".$mapsvg_table."'");
    }

    $mapsvg_table = $wpdb->get_var("SHOW TABLES LIKE '".mapsvg_table_name($id, 'regions')."'");

    if($mapsvg_table){
        $wpdb->query("DROP TABLE ".$mapsvg_table);
        $wpdb->query("DELETE FROM ".$wpdb->prefix."mapsvg_schema WHERE table_name='".$mapsvg_table."'");
    }

    if(!$ajax)
        wp_redirect(admin_url('plugins.php?page=mapsvg-config'));
}

function ajax_mapsvg_update() {
    if(!empty($_POST['id']) && !empty($_POST['update_to'])){
        $params = array();
        if(isset($_POST['disabledRegions']))
            $params['disabledRegions'] = $_POST['disabledRegions'];
        if(isset($_POST['disabledColor']))
            $params['disabledColor'] = $_POST['disabledColor'];
        echo mapsvg_update_map($_POST['id'], $_POST['update_to'], $params);
    }
    die();
}
add_action('wp_ajax_mapsvg_update', 'ajax_mapsvg_update');


function mapsvg_copy($id, $new_title){
    global $wpdb;

    // Check nonce
    check_ajax_referer( 'ajax_mapsvg_copy-'.$_POST['id']);
    // Check user rights


    // 2.x backward compatibility
    $mapsvg_version = get_post_meta($id, 'mapsvg_version', true);
    if(version_compare($mapsvg_version, '3.0.0', '<')){
        return mapsvg_copy_2($id, $new_title);
    }

    $post = mapsvg_get_map($id);

    $copy_post = array(
    	'post_type'    => 'mapsvg',
    	'post_status'  => 'publish'
    );

    $new_title = stripslashes(strip_tags($new_title));
    $post_content = $post->post_content;

    $new_id = wp_insert_post($copy_post);

    $wpdb->query(
        $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID=%d", array($new_title, $post_content, $new_id))
    );

    $mapsvg_version              = get_post_meta($id, 'mapsvg_version', true);
    $mapsvg_database_schema_json = mapsvg_get_schema($id, 'database');
    $mapsvg_regions_schema_json  = mapsvg_get_schema($id, 'regions');
    $mapsvg_css                  = get_post_meta($id, 'mapsvg_css', true);
    $mapsvg_table_db             = $wpdb->get_var("SHOW TABLES LIKE '".mapsvg_table_name($id, 'database')."'");
    $mapsvg_table_regions        = $wpdb->get_var("SHOW TABLES LIKE '".mapsvg_table_name($id, 'regions')."'");


    add_post_meta($new_id, 'mapsvg_version', $mapsvg_version);
    add_post_meta($new_id, 'mapsvg_css', $mapsvg_css);

    if($mapsvg_table_db){
        $wpdb->query("CREATE TABLE ".mapsvg_table_name($new_id, 'database')." LIKE ".mapsvg_table_name($id, 'database'));
        $wpdb->query("INSERT ".mapsvg_table_name($new_id, 'database')." SELECT * FROM ".mapsvg_table_name($id, 'database'));
        $wpdb->query("INSERT INTO ".$wpdb->prefix."mapsvg_r2d  (map_id,region_id,object_id) SELECT '".$new_id."', _r2d.region_id, _r2d.object_id FROM ".$wpdb->prefix."mapsvg_r2d _r2d WHERE _r2d.map_id=".$id);
    }
    if($mapsvg_table_regions){
        $wpdb->query("CREATE TABLE ".mapsvg_table_name($new_id, 'regions')." LIKE ".mapsvg_table_name($id, 'regions'));
        $wpdb->query("INSERT ".mapsvg_table_name($new_id, 'regions')." SELECT * FROM ".mapsvg_table_name($id, 'regions'));
    }

    if($mapsvg_database_schema_json){
        $table       = mapsvg_table_name($new_id, 'database');
        $wpdb->insert($wpdb->prefix."mapsvg_schema", array('table_name'=>$table,'fields'=>$mapsvg_database_schema_json));
    }
    if($mapsvg_regions_schema_json){
        $table       = mapsvg_table_name($new_id, 'regions');
        $wpdb->insert($wpdb->prefix."mapsvg_schema", array('table_name'=>$table,'fields'=>$mapsvg_regions_schema_json));
    }

   return $new_id;
}


/**
 * Remove empty elements from an array
 */
function mapsvg_remove_empty($arr){
    foreach ($arr as $id=>$a){
        if(is_array($a)){
            $arr[$id] = mapsvg_remove_empty($a);
            if(count($arr[$id])==0) unset($arr[$id]);
        }else{
            if($arr[$id] == '') unset($arr[$id]);
        }
    }
    return $arr;
}

/**
 * Import data from excel
 */
function mapsvg_import_csv($uploaded_file){
    require(MAPSVG_PLUGIN_DIR . 'csvparser.php');
    $csv  = new MapsvgCsvParser($uploaded_file);
    return $csv->getData(); 
}



/**
 * Settings page in Admin Panel
 */
function mapsvg_conf(){

    global $mapsvg_page, $wpdb;

    // Check user rights
    if(!current_user_can('edit_posts'))
        die();

    $file         = null;
    $map_chosen   = false;
    $svg_file_path = "";
    $svg_file_url_path = "";
    if (isset($_GET['path']) && isset($_GET['package'])){
        if($_GET['package'] == 'default'){
            $svg_file_path     = MAPSVG_MAPS_DIR."/".$_GET['path'];
            $svg_file_url_path = parse_url(MAPSVG_MAPS_URL . $_GET['path'], PHP_URL_PATH);
        }elseif($_GET['package']=='uploads'){
            $svg_file_path     = MAPSVG_MAPS_UPLOADS_DIR."/".$_GET['path'];
            $svg_file_url_path = parse_url(MAPSVG_MAPS_UPLOADS_URL . $_GET['path'], PHP_URL_PATH);
        }
    }

    // If $_GET['map_id'] is set then we should get map settings from the DB
    $map_id = isset($_GET['map_id']) ? $_GET['map_id'] : null;

    // If it's new map - create it in the DB and reload the page
    if($map_id == 'new'){

        $gmap = '';
        if (isset($_GET['gmap']) && $_GET['gmap']==true){
            $key = get_option('mapsvg_google_api_key');
            $gmap = ',googleMaps: {on:true, apiKey: "'.$key.'", center: {lat: 41.99585227532726, lng: 10.688006500000029}, zoom: 1}';
        }

        $data = array('map_id'=>'new','mapsvg_data'=>'{source: "'.$svg_file_url_path.'"'.$gmap.'}');
        $id = mapsvg_save($data);

        $obj = new stdClass();
        $obj->{'1'} = array("label"=>"Enabled","value"=>'1',"color"=>"","disabled"=>false);
        $obj->{'0'} = array("label"=>"Disabled","value"=>'0',"color"=>"","disabled"=>true);

        $status_field = array('type'=>'status',
                              'db_type'=>'varchar (255)',
                              'label'=> 'Status',
                              'name'=> 'status',
                              'visible'=>true,
                              'options'=>array(
                                  $obj->{'1'},
                                  $obj->{'0'}
                              ),
                              'optionsDict' => $obj
        );


        $db_schema = array(
            array(
                'type'=>'text',
                'db_type'=>'varchar(255)',
                'name'=>'label',
                'label'=>'Label',
                'visible'=>'true'
            ),
            array(
                'type'=>'textarea',
                'db_type'=>'text',
                'name'=>'description',
                'label'=>'Description',
                'visible'=>'true',
                'html'=>'true',
                'help'=>'You can use HTML in this field'
            ),
            array(
                'type'=>'marker',
                'db_type'=>'text',
                'name'=>'marker',
                'label'=>'Marker',
                'visible'=>'true'
            ),
            array(
                'type'=>'region',
                'db_type'=>'text',
                'name'=>'regions',
                'label'=>'Regions',
                'visible'=>'true'
            ),
        );

        mapsvg_set_db($id, 'regions', array(), array());
        _mapsvg_save_schema($id, 'regions', array($status_field));

        mapsvg_set_db($id, 'database', $db_schema, array());
        _mapsvg_save_schema($id, 'database', $db_schema);

        $prefix = '';

        mapsvg_set_regions_table($id, $svg_file_url_path, $prefix);

        $regions_table = mapsvg_table_name($id, 'regions');
        $wpdb->query('UPDATE '.$regions_table.' SET status=1');


        wp_redirect(admin_url('?page=mapsvg-config&map_id='.$id));
        exit();
    }

    // Load list of available maps from MAPSVG_MAPS_DIR
    $maps = array();
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(MAPSVG_MAPS_DIR)) as $filename)
    {
        if(strpos($filename,'.svg')!==false){
            $path_s = ltrim(str_replace('\\','/',str_replace(MAPSVG_MAPS_DIR,'',$filename)),'/');
            $maps[] = array(
                "url"       => parse_url(MAPSVG_MAPS_URL . $path_s, PHP_URL_PATH),
                "path_fake" => $path_s,
                "path_true" => $path_s,
                "package"   => 'default'
            );
        }
    }
    if(is_dir(MAPSVG_MAPS_UPLOADS_DIR)){
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(MAPSVG_MAPS_UPLOADS_DIR)) as $filename)
        {
            if(strpos($filename,'.svg')!==false){
                $path_s = ltrim(str_replace('\\','/',str_replace(MAPSVG_MAPS_UPLOADS_DIR,'',$filename)),'/');

                $maps[] = array(
                    "url"       => parse_url(MAPSVG_MAPS_UPLOADS_URL . $path_s, PHP_URL_PATH),
                    "path_fake" => 'user-uploads/'.$path_s,
                    "path_true" => $path_s,
                    "package"   => 'uploads'
                );
            }
        }
    }

    sort($maps);

    $js_mapsvg_options = "";
    if($map_id && $map_id!='new'){

        // 2.x backward compatibility
        $mapsvg_version = get_post_meta($map_id, 'mapsvg_version', true);
        if(version_compare($mapsvg_version, '3.0.0', '<')){
            return mapsvg_conf_2();
        }

        $post = mapsvg_get_map($map_id);
        $js_mapsvg_options = $post->post_content;

        $mapsvg_version         = get_post_meta((int)$map_id, 'mapsvg_version', true);
        $mapsvg_schema_database = mapsvg_get_schema($map_id, 'database');
        $mapsvg_schema_regions  = mapsvg_get_schema($map_id, 'regions');
        $mapsvg_css             = get_post_meta((int)$map_id, 'mapsvg_css', true);
    }


    $title = "";
    if(($map_id && $map_id!='new')){

        $mapsvg_page = 'edit';

        // Check if update is required
        $map_version = get_post_meta($map_id, 'mapsvg_version', true);
        $map_version = explode('-', $map_version);
        $map_version = $map_version[0];
        $can_update_to = false;
        if (
            ($map_version != null && version_compare($map_version, '3.2.0', '<'))
            &&
            ($map_version != null && version_compare($map_version, '3.0.0', '>='))
        ) {
            $can_update_to = '3.2.0';
            $mapsvg_page = 'update';
        }


        $title = isset($post) && $post->post_title ? $post->post_title : "New map";

        if ($js_mapsvg_options == "" && $svg_file_url_path!="")
            $js_mapsvg_options = json_encode(array('source' => $svg_file_url_path));

        $markerImages = get_marker_images();


    }else{
        $mapsvg_page = 'index';

        if(isset($_GET['mapsvg_rollback'])){
            rollBack();
        }

        $generated_maps = get_posts(array('numberposts'=>999, 'post_type'=>'mapsvg'));
        foreach($generated_maps as &$map) {
            $map->version = get_post_meta($map->ID, 'mapsvg_version', true);
            $map->version = explode('-',$map->version);
            $map->version = $map->version[0];
            if (
                ($map->version != null && version_compare($map->version, '3.2.0', '<'))
                &&
                ($map->version != null && version_compare($map->version, '3.0.0', '>='))
            ) {
                $map->can_update_to = '3.2.0';
            }
        }

        $outdated_maps = getOutdated();
        $num = count($outdated_maps);
        if($num>0){
            // do update
            $num_updated = updateOutdatedMaps($outdated_maps);
            if ($num == 1 && $num_updated == 1)
                $mapsvg_notice = "There was 1 outdated map created in old version of MapSVG. The map was successfully updated.";
            elseif ($num == $num_updated)
                $mapsvg_notice = "There were ".$num." outdated maps created in old versions of MapSVG. All maps were successfully updated.";
            elseif ($num_updated == 0)
                $mapsvg_notice = "An error occured during update of your maps created in previous versions of MapSVG plugin. Please contact MapSVG support to get help.";
            elseif ($num != $num_updated)
                $mapsvg_notice = "There were ".$num." outdated maps created in old versions of MapSVG - and ".$num_updated." were successfully updated.";

        }

    }


    $wp_prefix = $wpdb->prefix;
    $mapsvg_version = MAPSVG_VERSION;
    $fulltext_min_word = $wpdb->get_row("show variables like 'ft_min_word_len'", OBJECT);
    $fulltext_min_word = $fulltext_min_word ? $fulltext_min_word->Value: 0;
    if(isset($post)){
        $svg_file_version = (int)get_post_meta($post->ID, 'mapsvg_svg_file_version', true);
    }

    $mapsvg_google_api_key = get_option('mapsvg_google_api_key');
    $mapsvg_google_geocoding_api_key = get_option('mapsvg_google_geocoding_api_key');
    $template = 'template_'.$mapsvg_page.'.inc';

    include(MAPSVG_PLUGIN_DIR.'/header.inc');
    include(MAPSVG_PLUGIN_DIR.'/'.$template);
    if($template == 'template_edit.inc' || 'template_update.inc'){
        include (MAPSVG_PLUGIN_DIR.'/template_handlebars.hbs');
    }
    $post_types = mapsvg_get_post_types();
    include(MAPSVG_PLUGIN_DIR.'/footer.inc');

    return true;
}


function mapsvg_maybe_reload_svg_file($map_id, $svg_file_url, $prefix){

}

function expand_tilde($path){
    if (function_exists('posix_getuid') && strpos($path, '~') !== false) {
        $info = posix_getpwuid(posix_getuid());
        $path = str_replace('~', $info['dir'], $path);
    }

    return $path;
}

function mapsvg_set_regions_table($map_id, $svg_file_path, $prefix){

    global $wpdb;

    $root = ABSPATH;
    $root = wp_normalize_path($root);

    list($junk,$important_stuff) = explode(basename(WP_CONTENT_DIR),$svg_file_path);
    $important_stuff = WP_CONTENT_DIR.$important_stuff;

    $map_svg = simplexml_load_file($important_stuff);

    $allowed_objects = array(null,'path','ellipse','rect','circle','polygon','polyline');
    $namespaces = $map_svg->getDocNamespaces();
    $map_svg->registerXPathNamespace('_ns', $namespaces['']);

    $regions = array();
    $region_ids = array();
    $region_titles = array();
    $regions_assoc = array();

    while($obj = next($allowed_objects)){
        $nodes = $map_svg->xpath('//_ns:'.$obj);

        if(!empty($nodes)){
            foreach($nodes as $o){
                if(isset($o['id']) && ! empty($o['id'])){
                    if($o['id']){
                        // strip prefix
                        if(!$prefix || ($prefix && strpos($o['id'],$prefix)===0)){
                            $rid = str_replace($prefix, '', (string)$o['id']);
                            $title     = isset($o['title']) && ! empty($o['title']) ? (string)$o['title'] : '';
                            $regions[] = "('".esc_sql($rid) ."','".esc_sql($title)."', 1)";
                            $region_ids[] = $rid;
                            $region_titles[] = esc_sql($title);
                            $regions_assoc[$rid] = $title;
                        }
                    }
                }
            }


        }
    }

    // TODO: check with prefixes

    $ids = $wpdb->get_results('SELECT id, region_title FROM '.mapsvg_table_name($map_id, 'regions'));
    $r_compare = array();
    $t_compare = array();
    foreach($ids as $id_row){
        $r_compare[] = $id_row->id;
        $t_compare[] = $id_row->region_title;
    }

    $diff = array_diff($r_compare, $region_ids);

    $table = mapsvg_table_name($map_id, 'regions');

    foreach($diff as $id){
        $wpdb->query('DELETE FROM ' . $table . ' WHERE id =\'' .$id.'\'');
    }

    //    if($region_ids != $r_compare) {
    //        $wpdb->get_results('DELETE FROM ' . mapsvg_table_name($map_id, 'regions') . ' WHERE id NOT IN (\'(' . implode('\',\'', $region_ids) . ')\')');
    //    }

    if($region_titles != $t_compare || ($region_ids != $r_compare)){
        if(!empty($regions)){
            // TODO: duplicate key set status as well
            $wpdb->query('INSERT INTO '.mapsvg_table_name($map_id, 'regions').' (id, region_title, `status`) VALUES '.implode(',',$regions).' ON DUPLICATE KEY UPDATE region_title=VALUES(region_title)');
        }
    }

}

function mapsvg_get_string_between($string, $start, $end){
    $string = ' ' . $string;
    $ini = strpos($string, $start);
    if ($ini == 0) return '';
    $ini += strlen($start);
    $len = strpos($string, $end, $ini) - $ini;
    return substr($string, $ini, $len);
}

function ajax_mapsvg_save_svg(){

    global $wpdb;

    $root = ABSPATH;
    $root = wp_normalize_path($root);
    $svg_file_path = stripslashes($_POST['filepath']);
    $body = stripslashes($_POST['body']);

    list($junk,$important_stuff) = explode("wp-content",$svg_file_path);
    $filepath = $root.'wp-content'.$important_stuff;

    $f = fopen($filepath, 'w');
    $body = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'."\n".$body;
    fwrite($f,$body);
    fclose($f);

    mapsvg_set_regions_table($_POST['map_id'], $_POST['filepath'], '');
    $map = mapsvg_get_map($_POST['map_id']);

    if(strpos($map->post_content, 'svgFileVersion:')){
        $parts1    = explode('svgFileVersion:', $map->post_content, 2);
        $parts2    = explode(',', $parts1[1], 2);
        $parts2[0] = (int)$parts2[0] + 1;
        $parts1[1] = implode(',', $parts2);
        $parts1    = implode('svgFileVersion:', $parts1);
    }else{
        $parts1    = substr_replace($map->post_content, 'svgFileVersion:2,', 1, 0);
    }
    $data = array(
      'ID'=>$map->ID,
      'post_content'=>$parts1
    );

    wp_update_post(wp_slash($data));
    die();
}
add_action('wp_ajax_mapsvg_save_svg', 'ajax_mapsvg_save_svg');

function ajax_mapsvg_svg_copy(){


    $file = $_POST['filepath'];
    $filename = basename($file);

    $actual_name = pathinfo($filename,PATHINFO_FILENAME);
    $original_name = $actual_name;
    $extension = pathinfo($filename, PATHINFO_EXTENSION);

    $i = 1;
    $final_name = $actual_name.".".$extension;
    while(file_exists(MAPSVG_MAPS_UPLOADS_DIR."/".$actual_name.".".$extension))
    {
        $actual_name = (string)$original_name.'_'.$i;
        $i++;
    }


    $newfile =  MAPSVG_MAPS_UPLOADS_DIR."/".$actual_name.".".$extension;


    $root = ABSPATH;
    $root = wp_normalize_path($root);
    list($junk,$important_stuff) = explode("wp-content", $file);
    $file = $root.'wp-content'.$important_stuff;

    $error = mapsvg_check_upload_dir();


    if(!$error){
        if(!copy($file, $newfile)){
            $error = "Failed to copy the file";
        }
    }

    if(!$error){
        $newfile = MAPSVG_MAPS_UPLOADS_URL.$actual_name.".".$extension;
        echo json_encode(array('filepath' => $newfile));
    }else{
        echo json_encode(array('error'=>$error));
    }
    die();

}
add_action('wp_ajax_mapsvg_svg_copy', 'ajax_mapsvg_svg_copy');


function get_marker_images(){
    $img_files = @scandir(MAPSVG_PINS_DIR);
    if($img_files){
        array_shift($img_files);
        array_shift($img_files);
    }
    $safeMarkerImagesURL = safeURL(MAPSVG_PINS_URL);
    $markerImages = array();
    $allowed =  array('gif','png' ,'jpg','jpeg','svg');
    foreach($img_files as $p){
        $ext = pathinfo($p, PATHINFO_EXTENSION);
        if(in_array($ext,$allowed) )
            $markerImages[] = array("url"=>$safeMarkerImagesURL.$p, "file"=>$p);
    }
    return $markerImages;
}

function mapsvg_encode_data($map_id, $table, $data){

    global $db_schema, $db_types, $db_options, $db_multi, $wpdb;

    if(!$db_schema){
        $db_schema = mapsvg_get_schema($map_id, $table);
        $db_schema = json_decode($db_schema, true);
    }

    if(!$db_types){
        $db_options = array();
        $db_multi = array();
        $db_types = array('id'=>'id');
        foreach($db_schema as $s){
            $db_types[$s['name']] = $s['type'];
            if(isset($s['options']))
                $db_options[$s['name']] = $s['optionsDict'];
            if(isset($s['multiselect']) && $s['multiselect']===true)
                $db_multi[$s['name']] = true;
        }
    }

    $_data = array();

    foreach($data as $key=>$value){
        if(isset($db_types[$key])) switch ($db_types[$key]){
            case 'region':
//                $titles = $wpdb->get_results('SELECT id, region_title as title FROM '.mapsvg_table_name($map_id, 'regions').' WHERE id IN (\''.implode('\',\'', $data[$key]).'\')');
//                echo 'SELECT id, region_title as title FROM '.mapsvg_table_name($map_id, 'regions').' WHERE id IN (\''.implode('\',\'', $data[$key]).'\')';
                $_data[$key] = json_encode($data[$key], JSON_UNESCAPED_UNICODE);
                break;
            case 'status':
                $key_text = $key.'_text';
                if(isset($db_options[$key][$value])){
                    $_data[$key] = $value;
                    $_data[$key_text] = $db_options[$key][$value]['label'];
                }else{
                    $_data[$key] = '';
                    $_data[$key_text] = '';
                }
                break;
            case 'select':
            case 'radio':
                $key_text = $key.'_text';

                if(isset($db_multi[$key]) && $db_multi[$key]) {
                    $_data[$key] = json_encode($data[$key], JSON_UNESCAPED_UNICODE);
                }else{
                    if(isset($db_options[$key][$value])){
                        $_data[$key] = $value;
                        $_data[$key_text] = $db_options[$key][$value];
                    }else {
                        $options = array_flip($db_options[$key]);
                        if(isset($options[$value])){
                            $_data[$key] = $options[$value];
                            $_data[$key_text] = $value;
                        }else {
                            $_data[$key] = '';
                            $_data[$key_text] = '';
                        }
                    }
                }
                break;
            case 'checkbox':
                $_data[$key] = (int)($data[$key] === 'true' || $data[$key] === '1');
                break;
            case 'image':
            case 'marker':
                if(is_array($data[$key]))
                    $_data[$key] = json_encode($data[$key], JSON_UNESCAPED_UNICODE);
                else
                    $_data[$key] = $data[$key];
                break;
            default:
                $_data[$key] = $value;
                break;
        }
    }

    return $_data;
}

function mapsvg_get_db_types($map_id, $table){

    $db_schema = mapsvg_get_schema($map_id, $table);

    if(empty($db_schema)){
        return false;
    }
    $db_schema = json_decode($db_schema);
    $db_types = array();
    foreach($db_schema as $s){
        $db_types[$s->name] = $s->type;
    }
    return $db_types;
}

function mapsvg_decode_data($db_types, $data){

    foreach($data as $key=>$value){
        if (isset($db_types[$key])) switch ($db_types[$key]){
            case 'select':
                if(!empty($value) && (strpos($value, '[{')===0)) {
                    $data[$key] = json_decode(stripslashes($value));
                }
                break;
            case 'region':
                if(!empty($value)) {
                    $data[$key] = json_decode(stripslashes($value));
                }
                break;
            case 'post':
                if(!empty($value)){
                    $data['post'] = get_post($value);
                    $data['post']->url = get_permalink($data['post']);
                    if (function_exists('get_fields') ) {
                        $data['post']->acf = get_fields($value);
                    }
                }
                break;
            case 'checkbox':
                $data[$key] = (bool)$data[$key];
                break;
            case 'image':
                $data[$key] = json_decode(stripslashes($value));
                break;
            case 'marker':
                $data[$key] = json_decode($value);
                break;
            default: null;
        }
    }

    return $data;
}

function mapsvg_get_keywords($map_id, $table, $data){
    $schema = json_decode(mapsvg_get_schema($_POST['map_id'], $table), true);
    $keywords = array();
    foreach($schema as $field){
        if($field['searchable']=='true' && ($field['type']=='select' || $field['type']=='radio')){
            $keywords[] = $field['optionsDict'][$data[$field['name']]];
        }
    }
    return $keywords;
}

function mapsvg_data_create(){
    global $wpdb;

    $data   = $_POST['data'] ;//array_intersect_key($_POST['data'], array('map_id','region_id','marker_id','lat','lon','post_id','params'));
    $data = stripslashes_deep($data);
    $table  = $_POST['table'];

    $_data = mapsvg_encode_data($_POST['map_id'], $table, $data);
    $wpdb->insert(mapsvg_table_name($_POST['map_id'], $table), $_data);

    // Add regions-to-dbObject relations
    $object_id = $wpdb->insert_id;

    if($object_id && isset($data['regions']) && is_array($data['regions'])){
        $regions = $data['regions'];
        $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id' => $_POST['map_id'], 'object_id'=>$object_id));
        foreach($regions as $region){
            $wpdb->insert($wpdb->prefix.'mapsvg_r2d', array('map_id'    => $_POST['map_id'],
                                                            'region_id' => $region['id'],
                                                            'object_id' => $object_id));
        }
    }
    $data['id'] = $object_id;

    if($wpdb->last_error){
        echo $wpdb->last_error;
        die();
    }


    echo json_encode($data);

    die();
}
add_action('wp_ajax_mapsvg_data_create', 'mapsvg_data_create');


function mapsvg_data_import(){
    global $wpdb;

    $data   = $_POST['data'];
    $data   = stripslashes_deep($data);
    $data   = json_decode($data, true);
    $table_type  = $_POST['table'];
    $_data  = array();
    $map_id = (int)$_POST['map_id'];
    $table = mapsvg_table_name($map_id, $table_type);
    $r2d = array();

    foreach($data as $index => $object){
        $_data[$index] = mapsvg_encode_data($map_id, $table_type, $object);
    }

    $values = array();

    $keys = array_keys($_data[0]);
    $placeholders = array_map(function($key){ return '%s'; }, $keys);

    foreach ( $_data as $object) {
        $t = $wpdb->prepare( "(".implode(',',$placeholders).")",  array_values($object) );
        $values[] = $t;
    }

    $query = "INSERT INTO ".$table." (`".implode('`,`', $keys)."`) VALUES ";
    $query .= implode( ", ", $values ).' ON DUPLICATE KEY UPDATE ';
    $k = array();
    foreach($keys as $key){
        $k[] .= '`'.$key.'`=VALUES(`'.$key.'`)';
    }
    $query .= implode(', ', $k);
    $wpdb->query($query);

    if($wpdb->last_error){
        echo $wpdb->last_error;
        die();
    }

    if($table_type=='database' && isset($_data[0]['regions'])){
        $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id' => $_POST['map_id']));
        $objects = $wpdb->get_results('SELECT id, regions FROM '.$table);
        $regions_sql_values = array();
        foreach($objects as $object){
            $regions = json_decode($object->regions);
            foreach($regions as $r){
                $regions_sql_values[] = "(".$map_id.",'".$object->id."','".$r->id."')";
            }
        }
        if(!empty($regions_sql_values)){
            $query2 = "INSERT INTO ".$wpdb->prefix.'mapsvg_r2d'." (map_id, object_id, region_id) VALUES ";
            $query2 .= implode( ", ", $regions_sql_values );
            $wpdb->query($query2);
        }

    }

    if($wpdb->last_error){
        echo $wpdb->last_error;
        die();
    }


    echo json_encode($data);

    die();
}
add_action('wp_ajax_mapsvg_data_import', 'mapsvg_data_import');

function mapsvg_data_clear(){
    global $wpdb;
    $table  = $_POST['table'];
    $map_id = $_POST['map_id'];
    $wpdb->query("DELETE FROM ".mapsvg_table_name($map_id, $table));
    $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id' => $map_id));
    echo '1';
    die();
}
add_action('wp_ajax_mapsvg_data_clear', 'mapsvg_data_clear');

function mapsvg_data_update(){
    global $wpdb;

    $data  = stripslashes_deep($_POST['data']); //array_intersect_key($_POST['data'], array('map_id','region_id','marker_id','lat','lon','post_id','params'));
    $table = $_POST['table'];

    $_data = mapsvg_encode_data($_POST['map_id'], $table, $data);
    $data = array();
    $data_id = false;

    if(isset($_data['id'])){
        $id = $_data['id'];
        unset($_data['id']);
        if(is_array($id)){
            foreach($id as $key=>$val){
                $id[$key] = esc_sql($val);
            }
        }else{
            $id = esc_sql($id);
        }
        if(!is_array($id)){
            $data_id = $wpdb->get_var("SELECT id FROM ".mapsvg_table_name($_POST['map_id'], $table)." WHERE id='".esc_sql($id)."'");
        }else{
            $data_id = true;
        }
    }

    if($data_id){

        $set = array();
        foreach($_data as $key=>$value){
            $set[] = '`'.esc_sql($key).'` = \''.esc_sql($value).'\'';
        }

        if(!is_array($id)){
            $id = array($id);
        }

//        $wpdb->update(mapsvg_table_name($_POST['map_id'], $table), mapsvg_encode_data($_POST['map_id'], $table, $data), array('id'=>esc_sql($data['id'])));
        $wpdb->query('UPDATE '.mapsvg_table_name($_POST['map_id'], $table).' SET '.implode(',',$set).' WHERE id IN (\''.implode('\',\'',$id).'\')');
    }
    else{
        $wpdb->insert(mapsvg_table_name($_POST['map_id'], $table), mapsvg_encode_data($_POST['map_id'], $table, $data));
    }

    if($table=='database' && $data_id && isset($_POST['data']['regions']) && is_array($_POST['data']['regions'])){
        $regions = $_POST['data']['regions'];
        $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id' => $_POST['map_id'], 'object_id'=>$data_id));
        foreach($regions as $region){
            $wpdb->insert($wpdb->prefix.'mapsvg_r2d', array(
                'map_id'    => $_POST['map_id'],
                'region_id' => $region['id'],
                'object_id' => $data_id));
        }
    }


    die();
}
add_action('wp_ajax_mapsvg_data_update', 'mapsvg_data_update');

function mapsvg_data_delete($id){
    global $wpdb;
    $table = $_POST['table'];
    $data = stripslashes_deep($_POST['data']);
    $wpdb->delete(mapsvg_table_name((int)$_POST['map_id'], $table), array('id'=>$data['id']));
    $wpdb->delete($wpdb->prefix.'mapsvg_r2d', array('map_id'=>$_POST['map_id'], 'object_id'=>$data['id']));
    die();
}
add_action('wp_ajax_mapsvg_data_delete', 'mapsvg_data_delete');

function mapsvg_data_get($id){
    global $wpdb;

    $id = $_POST['data']['id'];
    $table = $_POST['table'];

    $data = $wpdb->get_row('SELECT * FROM '.mapsvg_table_name($_POST['map_id'], $table).' WHERE id='.$id);
    if($db_types = mapsvg_get_db_types($_POST['map_id'], $table))
        $data = mapsvg_decode_data($_POST['map_id'], $table, $data);

    echo json_encode($data);
    die();
}
add_action('wp_ajax_mapsvg_data_get', 'mapsvg_data_get');

function mapsvg_data_get_all(){
    global $wpdb, $db_schema;

    $map_id = (int)$_GET['map_id'];
    $table  = $_GET['table'];

    $table_name = mapsvg_table_name($map_id, $table);

    if($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        echo '[]';
        die();
    }

    $filters_sql = array();
    $filter_regions = '';

    $perpage = isset($_GET['perpage']) ? (int)$_GET['perpage'] : 30;

    $page = isset($_GET['page']) && (int)$_GET['page']>=0 ? (int)$_GET['page'] : 1;

    $start = ($page-1)*$perpage;

    $filters = isset($_GET['filters']) ? $_GET['filters'] : null;
    $filterout = isset($_GET['filterout']) ? $_GET['filterout'] : null;
    $search  = isset($_GET['search']) ? $_GET['search'] : null;
    $search_fallback  = isset($_GET['searchFallback']) ? $_GET['searchFallback'] : false;

    $fields_schema = json_decode(mapsvg_get_schema($map_id, $table));
    $fields = array();
    $fields_dict = array();
    $searchable_fields = array();

    if($fields_schema) foreach($fields_schema as $fs){
        $fields_dict[$fs->name] = (array)$fs;
        $fields[] = $fs->name;
        if(isset($fs->searchable) && $fs->searchable===true){
            $searchable_fields[] = (array)$fs;
        }
    }

    if($table == 'regions'){
        $searchable_fields[] = array('name'=>'id');
        $searchable_fields[] = array('name'=>'region_title');
    }

    if(isset($filters) && !empty($filters) && is_array($filters)){
        foreach($filters as $key=>$value){
//            if(in_array($key, $fields)){
                if($value!=''){
                    if($key == 'regions'){
                        $filter_regions = 'INNER JOIN '.$wpdb->prefix.'mapsvg_r2d r2d ON r2d.map_id='.$map_id.' AND r2d.object_id=id AND r2d.region_id=\''.esc_sql($value).'\'';
                    }else{
                        if(isset($fields_dict[$key]['multiselect']) && $fields_dict[$key]['multiselect'] === true){
//                            $filters_sql[] = 'MATCH (`'.$key.'`) AGAINST (\''.esc_sql($fields_dict[$key]['optionsDict']->{$value}).'*\' IN BOOLEAN MODE)';
                            $filters_sql[] = '`'.$key.'` LIKE \'%"'.esc_sql($value).'"%\'';
                        }else{
                            $filters_sql[] = '`'.$key.'`=\''.esc_sql($value).'\'';
                        }
                    }
                }
//            }
        }
    }
    if(isset($filterout) && !empty($filterout) && is_array($filterout)){
        foreach($filterout as $key=>$value){
            if($value!=''){
                $filters_sql[] = '`'.$key.'`!=\''.esc_sql($value).'\'';
            }
        }
    }
    if(isset($search) && !empty($search)){

//        $searchable_fields = $wpdb->get_var("SELECT GROUP_CONCAT( DISTINCT column_name )
//        FROM information_schema.STATISTICS
//        WHERE table_schema =  '".$wpdb->dbname."'
//        AND table_name =  '".mapsvg_table_name($map_id, $table)."'
//        AND index_type =  'FULLTEXT'
//        LIMIT 0 , 30");

//        $searchable_fields = array();
//        $schema = json_decode(mapsvg_get_schema($map_id, $table), true);
//        foreach($schema as $field){
//            if(isset($field['searchable']) && $field['searchable']===true){
//                $searchable_fields[] = $field;
//            }
//        }


        $like_fields = array();
        if($searchable_fields){
            if(isset($search_fallback) && $search_fallback){
//                $searchable_fields = explode(',',$searchable_fields);
                foreach($searchable_fields as $f){
                    if((isset($f['type']) && $f['type'] == 'region') || (isset($f['multiselect'])&&$f['multiselect']===true))
                        $like_fields[] = '`'.$f['name'].'` LIKE \'%"'.esc_sql($search).'%\'';
                    else
                        $like_fields[] = '`'.$f['name'].'` REGEXP \'(^| )'.esc_sql($search).'\'';
                }
                $filters_sql[] = '('.implode(' OR ', $like_fields).')';
            }else{
                $_search = array();
//                $searchable_fields = explode(',',$searchable_fields);
                $match = array();
                foreach($searchable_fields as $index=>$f){
                    if((isset($f['type']) && $f['type'] == 'region') || (isset($f['multiselect'])&&$f['multiselect']===true)){
                        $_search[] = '`'.$f['name'].'` LIKE \'%"'.esc_sql($search).'%\'';
                    }else{
                        $match[] = $f['name'];
                    }
                }
                if(count($match))
                    $_search[] = 'MATCH ('.implode(',',$match).') AGAINST (\''.esc_sql($search).'*\' IN BOOLEAN MODE)';
                $filters_sql[] = implode(' OR ', $_search);

            }
        }
    }

    if($filters_sql)
        $filters_sql = ' WHERE '.implode(' AND ', $filters_sql);
    else
        $filters_sql = '';

//    echo $filters_sql;
//    die();

    $sortBy = 'id';
    $sortDir = 'DESC';

    if(isset($_GET['sortBy']) && !empty($_GET['sortBy'])){
        $sortBy = $table == 'regions' && $_GET['sortBy'] == 'title' ? 'region_title' : $_GET['sortBy'];
//       if(in_array($_sortBy, $fields)){
//           $sortBy = $_sortBy;
//       }
    }
    if(isset($_GET['sortDir']) && !empty($_GET['sortDir'])){
       if(in_array(strtolower($_GET['sortDir']), array('desc','asc'))){
           $sortDir = $_GET['sortDir'];
       }
    }

    $region_title = $table == 'regions' ? ', REPLACE(id,\' \',\'_\') as id_no_spaces,  `region_title` as `title` ' : '';

    $query = 'SELECT *'.$region_title.' FROM '.mapsvg_table_name($map_id, $table).'
    '.$filter_regions.'  
    '.$filters_sql.'     
    ORDER BY '.$sortBy.' '.$sortDir;


    if($perpage > 0){
        // for pagination, take +1 record to make sure there are more for the next page, then drop extra record
        $perpage++;
        $query .= ' LIMIT '.$start.','.$perpage;
    }
    
    $data = $wpdb->get_results($query, ARRAY_A);
    if($db_types = mapsvg_get_db_types($map_id, $table))
        foreach ($data as $index=>$object){
            $data[$index] = mapsvg_decode_data($db_types, $object);
        }


//    if(isset($data[0]['post']))
//    foreach ($data as $index=>$object){
//        $data[$index] = mapsvg_decode_data($db_types, $object);
//    }

        //    if($wpdb->last_error){
//        echo $query."\n\n";
//        echo $wpdb->last_error;
//        die();
//    }

    $data = $data ? $data : array();
    echo json_encode($data);
    die();
}
add_action('wp_ajax_mapsvg_data_get_all', 'mapsvg_data_get_all');
add_action('wp_ajax_nopriv_mapsvg_data_get_all', 'mapsvg_data_get_all');


//function mapsvg_data_search(){
//    global $wpdb;
//    $query = $_GET['query'];
//    $map_id = (int)$_GET['map_id'];
//    $table  = $_GET['table'];
//    $data = $wpdb->get_results('SELECT * FROM '.mapsvg_table_name($map_id, $table).' m WHERE label LIKE \''.$query.'%\' LIMIT 10;');
//    foreach ($data as $index=>$object){
//        $data[$index] = mapsvg_decode_data($map_id, $object);
//    }
//
//    echo json_encode($data);
//    die();
//
//}
//add_action('wp_ajax_mapsvg_data_search', 'mapsvg_data_search');


function ajax_mapsvg_save() {
    if(isset($_POST['data']))
        echo $post_id = mapsvg_save($_POST['data']);
	die();
}
add_action('wp_ajax_mapsvg_save', 'ajax_mapsvg_save');


function ajax_mapsvg_delete() {
    if(isset($_POST['id']))
        mapsvg_delete($_POST['id'], true);
	die();
}
add_action('wp_ajax_mapsvg_delete', 'ajax_mapsvg_delete');

function ajax_mapsvg_copy() {
    if(!empty($_POST['id']) && !empty($_POST['new_name']))
        echo mapsvg_copy($_POST['id'], $_POST['new_name']);
	die();
}
add_action('wp_ajax_mapsvg_copy', 'ajax_mapsvg_copy');

function mapsvg_get() {
    if(isset($_GET['id'])){
        $post = mapsvg_get_map($_GET['id']);
        if (get_post_type($post)!='mapsvg'){
            echo 'Post type must be "mapsvg"';
            die();
        }
        
        $mapsvg_options = $post->post_content;
    }
        echo $mapsvg_options;

	die();
}
add_action('wp_ajax_mapsvg_get', 'mapsvg_get');
add_action( 'wp_ajax_nopriv_mapsvg_get', 'mapsvg_get' ); 


$mapsvg_try = 0;

function ajax_mapsvg_get_coords($addr = false){
    global $mapsvg_try;

    $addrs = $_POST['data'] ? $_POST['data'] : array($addr);

    if(!empty($addrs)){
        $res = array();
        foreach($addrs as $id=>$a) {
            $data = json_decode(file_get_contents('http://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($a['location']) . '&sensor=false'), true);
            if ($data['status'] == 'OK') {
                $mapsvg_try = 0;
                $res[$id] = array('index='=> $addrs['index'], 'coords'=>$data['results'][0]['geometry']['location']);
            } elseif ($data['status'] == 'ZERO_RESULTS') {
                $mapsvg_try = 0;
                $res[$id] = array('index'=>$addrs['index'], 'coords'=>array('lat'=>'', 'lng'=>''));
            }elseif($mapsvg_try < 3){
                $mapsvg_try++;
                sleep(1);
                $res[$id] = ajax_mapsvg_get_coords($a);
            }else{
                $mapsvg_try = 0;
                $res[$id] = array('index'=>$addrs['index'], 'coords'=>array('lat'=>'', 'lng'=>''));
            }
        }
    }

    if($addr)
        return $res[0];
    else
        echo json_encode($res);

    die();
}
add_action('wp_ajax_mapsvg_get_coords', 'ajax_mapsvg_get_coords');
add_action('wp_ajax_mapsvg_import', 'ajax_mapsvg_import');

/**
 *  Register mapSVG post type
 */
function reg_mapsvg_post_type(){
    $post_args = array(
        'labels' => array(
            'name' => 'MapSVG',
            'singular_name' => 'mapSVG map'),
        'description' => 'Allows you to insert a map to any page of your website',
        'public' => false,
        'show_ui' => false,
        'exclude_from_search' => true,
        'can_export' => true
    );

    register_post_type('mapsvg', $post_args);
}
add_action('init','reg_mapsvg_post_type');

function cleanArray($arr){
    foreach($arr as $k=>$v) {
        if(is_array($v))
            $arr[$k] = cleanArray($v);
        else
            $arr[$k] = trim(htmlspecialchars(strip_tags($v)));
    }
    return $arr;
}

add_action('wp_head','mapsvg_ajaxurl');
function mapsvg_ajaxurl() {
    $url = '';
    if ( is_admin() )
        $url = admin_url( 'admin-ajax.php' );
    else
        $url = site_url( 'wp-admin/admin-ajax.php' );
    ?>
        <script type="text/javascript">
        var ajaxurl = '<?php echo $url; ?>';
        </script>
    <?php
}

function mapsvg_get_post () {

    $pid        = intval($_POST['post_id']);
    $the_query  = new WP_Query(array('p' => $pid));
    $format     = $_POST['format']  == 'html' ? 'html' : 'json';

    if ($the_query->have_posts()) {
        while ( $the_query->have_posts() ) {
            $the_query->the_post();

            if($format == 'html'){
                $data = '
                    <div class="post-container">
                        <div id="project-content">
                            <h1 class="entry-title">'.get_the_title().'</h1>
                            <div class="entry-content">'.get_the_content().'</div>
                        </div>
                    </div>
                ';
            }else{
                $data = json_encode(array("title"=>get_the_title(),"content"=>get_the_content()));
            }

        }
    }
    else {
        echo __('Didnt find anything', THEME_NAME);
    }
    wp_reset_postdata();


    echo $data;
}

add_action ( 'wp_ajax_nopriv_load-content', 'mapsvg_get_post' );
add_action ( 'wp_ajax_load-content', 'mapsvg_get_post' );

function mapsvg_get_maps () {
//    $data = get_posts(array('numberposts'=>999, 'post_type'=>'mapsvg');
//    echo json_encode($data);
    $args = array( 'post_type' => 'mapsvg');
    $loop = new WP_Query( $args );
    $array = array();

    while ( $loop->have_posts() ) : $loop->the_post();

        $array[] = array(
            'id' => get_the_ID(),
            'title' => get_the_title()
        );

    endwhile;

    wp_reset_query();
    ob_clean();
    echo json_encode($array);
    die();
}

add_action ( 'wp_ajax_mapsvg_get_maps', 'mapsvg_get_maps' );

function mapsvg_search_posts(){
    global $wpdb;
    $title = $_GET['query'];
    $post_type = $_GET['post_type'];
    $results = $wpdb->get_results("SELECT id, post_title, post_content FROM $wpdb->posts WHERE post_type='".$post_type."' AND post_title LIKE '".$title."%' AND post_status='publish' LIMIT 10");
//    echo "SELECT id, post_title FROM '.$wpdb->posts.' WHERE post_type='".$post_type."' AND post_title LIKE '".$title."%' LIMIT 10";
//    echo "\n\n";
    foreach($results as $r){
        $r->url = get_permalink($r->id);
        $r->ID = $r->id;
    }
    echo json_encode($results);
    die();
}
add_action ( 'wp_ajax_mapsvg_search_posts', 'mapsvg_search_posts' );

function safeURL($url){
    if(strpos("http://",$url) === 0 || strpos("https://",$url) === 0){
        $s = explode("://", $url);
        $url = "//".array_pop($s);
    }
    return $url;
}

function getOldOptions(){
    global $wpdb;

    $r = $wpdb->get_results("
        SELECT meta_value FROM ".$wpdb->postmeta." WHERE meta_key = 'mapsvg_options'
    ");
}

function getOutdated(){
    global $wpdb;

    $r = $wpdb->get_results("
        SELECT t.pid as id, t.ver as version FROM (SELECT p.ID as pid, pm.meta_value as ver FROM ".$wpdb->posts." p
        LEFT JOIN ".$wpdb->postmeta." pm ON pm.post_id = p.ID AND pm.meta_key = 'mapsvg_version'
        WHERE p.post_type='mapsvg') t WHERE t.ver != '".MAPSVG_VERSION."' OR t.ver IS NULL
    ");

    $maps_outdated = array();

    if($r)
        foreach ( $r as $other_version ){
            if($other_version->version == null || version_compare($other_version->version, '2.0.0', '<')){
                $maps_outdated[$other_version->id] = $other_version->version ? $other_version->version : '1.6.4' ;
            }
        }


    return $maps_outdated;
}

function updateOutdatedMaps($maps){
    $i = 0;
    if($maps)
        foreach($maps as $id=>$version){
            if($version == null || version_compare($version,'2.0.0','<'))
                if(updateMapTo2($id))
                    $i++;
        }
    return $i;
}

function updateMapTo2($id){
    $d = get_post_meta($id,'mapsvg_options');
    if($d && isset($d[0]['m']))
        $data = $d[0]['m'];
    else
        return false;

    $events = array();
    if(isset($d[0]['events']))
        foreach($d[0]['events'] as $key=>$val)
            if(!empty($val))
                $events[$key] = $val;


    if(isset($data['pan'])){
        // do
        $data['scroll'] = array('on'=>($data['pan']=="1"));
        unset($data['pan']);
    }


    if(isset($data['zoom'])){
        $data['zoom'] = array('on'=>($data['zoom']=="1"));
    }else{
        $data['zoom'] = array();
    }

    if(isset($data['zoomButtons'])){
        $data['zoom']['buttons'] = array('location'=>$data['zoomButtons']['location']);
        unset($data['zoomButtons']);
    }
    if(isset($data['zoomLimit'])){
        $data['zoom']['limit'] = $data['zoomLimit'];
        unset($data['zoomLimit']);
    }
    if(isset($data['zoomDelta'])){
        unset($data['zoomDelta']);
    }
    if(isset($data['popover'])){
        unset($data['popover']);
    }

    if(isset($data['tooltipsMode'])){
        $data['tooltips'] = array('mode'=>($data['tooltipsMode']=='names'?'id':'off'));
        unset($data['tooltipsMode']);
    }

    if(isset($data['regions'])){
        if(count($data['regions'])>0){
            foreach($data['regions'] as &$r){
                if(isset($r['attr'])){
                    foreach($r['attr'] as $key=>$value){
                        if(!empty($value))
                            $r[$key] = $value;
                    }
                    unset($r['attr']);
                }
            }
        }
    }

    if(isset($data['marks'])){
        if(count($data['marks'])>0){
            $data['markers'] = $data['marks'];
            $inc = 0;
            foreach($data['markers'] as &$m){
                $m['id'] = 'marker_'.$inc;
                $inc++;
                if(isset($m['attrs'])){
                    foreach($m['attrs'] as $key=>$value){
                        if(!empty($value))
                            $m[$key] = $value;
                    }
                    unset($m['attrs']);
                }
            }
        }
        unset($data['marks']);
    }

    $data = json_encode($data);
    // We should add events to options separately as they
    // shouldn't be enclosed with quotes by json_encode
    $str = array();
    if(!empty($events)){
        foreach($events as $e=>$func)
            $str[] = $e.':'.stripslashes_deep($func);
        $events = implode(',',$str);

        $data = substr($data,0,-1).','.$events.'}';
    }

//        $data = str_replace("'","\'",$data);
    $data = addslashes($data);

//    delete_post_meta($id, 'mapsvg_options');
    mapsvg_save(array('map_id'=>$id, 'mapsvg_data'=>$data));

    return true;
}

function rollBack(){
    global $wpdb;

    $res = $wpdb->get_results("
        SELECT post_id, meta_value FROM ".$wpdb->postmeta." WHERE meta_key = 'mapsvg_options'
    ");
    foreach ( $res as $r ){
        delete_post_meta($r->post_id, 'mapsvg_version');
    }
}

function mapsvg_get_post_types(){
    global $wpdb;

    $args = array(
        '_builtin'   => false
    );

    $_post_types = get_post_types($args,'names');
    if(!$_post_types)
        $_post_types = array();

    $post_types = array();
    foreach ($_post_types as $pt){
        if($pt!='mapsvg')
            $post_types[] = $pt;
    }
    $post_types[] = 'post';
    $post_types[] = 'page';
    return $post_types;
}

function get_post_meta_keys($post_type){
    global $wpdb;

    $query = "
        SELECT DISTINCT($wpdb->postmeta.meta_key)
        FROM $wpdb->posts
        LEFT JOIN $wpdb->postmeta
        ON $wpdb->posts.ID = $wpdb->postmeta.post_id
        WHERE $wpdb->posts.post_type = '%s'
        AND $wpdb->postmeta.meta_key != ''
        AND $wpdb->postmeta.meta_key NOT RegExp '(^[_0-9].+$)'
        AND $wpdb->postmeta.meta_key NOT RegExp '(^[0-9]+$)'
    ";
    $meta_keys = $wpdb->get_col($wpdb->prepare($query, $post_type));
    return $meta_keys;
}

/* Add MapSVG Data table */
function mapsvg_set_db($map_id, $table, $schema, $prev_schema) {
    global $wpdb;


    $table_name = mapsvg_table_name($map_id, $table);

    $fields                 = array();

    if($table == 'regions')
        $fields[]               = 'id varchar(255) NOT NULL';
    else
        $fields[]               = 'id int(11) NOT NULL AUTO_INCREMENT';

    $old_searchable_fields  = array();
    $searchable_fields      = array();
    $old_keywordable_fields = array(); // for select & radio fields
    $new_field_names        = array('id');
    $primary_key            = '';
    $update_options         = array();
    $new_options            = array();
    $prev_options           = array();
    $clear_fields           = array();


    if($table == 'regions'){
        $fields[]            = 'region_title varchar(255)';
        $new_field_names[]   = 'region_title';
        $searchable_fields[] = 'id';
        $searchable_fields[] = 'region_title';
        $primary_key = 'PRIMARY KEY  (id(40))';
    }else{
        $primary_key = 'PRIMARY KEY  (id)';
    }

    foreach($schema as $field){

        if($field['type'] == 'select' && $field['multiselect']===true){
            $field['type'] = 'text';
        }

        $fields[]          = $field['name'].' '.$field['db_type'];
        $new_field_names[] = $field['name'];

        if(($field['type'] == 'select' && $field['multiselect']!==true) || $field['type'] == 'radio' || $field['type'] == 'status'){
            $fields[] = $field['name'].'_text varchar(255)';
            $new_field_names[] = $field['name'].'_text';
        }

        if(isset($field['options']) && $field['type']!='marker' && $field['type']!='region'){
            $new_options[$field['name']] = array();
            foreach($field['options'] as $o){
                $new_options[$field['name']][(string)$o['value']] = $o['label'];
            }
        }

        // Searchable fields of type text & textarea could be added into FULLTEXT index.
        // Searchable fields of type select, radio - should be added into _keywords.
        // Adding into keywords into keywords is being done after updating table structure.
        // Keywords are always FULLTEXT-ed.

        if(isset($field['searchable']) && $field['searchable'] == 'true')
            if(($field['type']=='text' || $field['type']=='textarea' || $field['type']=='region'))
                $searchable_fields[] = $field['name'];
            else
                $searchable_fields[] = $field['name'].'_text';
    }

    if(!empty($prev_schema)) foreach($prev_schema as $_field){

        if(isset($_field['options']) && $_field['type']!='marker'&&$_field['type']!='region'){
            $prev_options[$_field['name']] = array();
            foreach($_field['options'] as $_o){
                $prev_options[$_field['name']][(string)$_o['value']] = $_o['label'];
            }
            if(!isset($prev_options[$_field['name']]) || !is_array($prev_options[$_field['name']]))
                $prev_options[$_field['name']] = array();
            if(!isset($new_options[$_field['name']]) || !is_array($new_options[$_field['name']]))
                $new_options[$_field['name']] = array();

            $diff = array_diff_assoc($new_options[$_field['name']], $prev_options[$_field['name']]);

            if($diff){
                $update_options[] = array('name'             => $_field['name'],
                                          'type'             => $_field['type'],
                                          'next_multiselect' => (bool)$_field['multiselect'],
                                          'prev_multiselect' => (bool)$_field['multiselect'],
                                          'options'          => $diff
                                         );
            }

            if($_field['type']=='select' && ((bool)$_field['multiselect'] != (bool)$_field['multiselect'])){
                $clear_fields[] = $_field['name'];
            }
        }

        if(isset($_field['searchable']) && $_field['searchable'] == 'true'){
            if(($_field['type']=='text' || $_field['type']=='textarea'))
                $old_searchable_fields[] = $_field['name'];
            else
                $old_keywordable_fields[] = $_field['name'];
        }
    }


    $table_exists = $wpdb->get_var('SHOW TABLES LIKE \''.$table_name.'\'') == $table_name;
    if($table_exists && ($searchable_fields != $old_searchable_fields)){
        $index = $wpdb->get_row('SHOW INDEX FROM '.$table_name.' WHERE Key_name = \'_keywords\';', OBJECT);
        if($index)
            $wpdb->query('DROP INDEX `_keywords` ON '.$table_name);
    }

//    $charset_collate   = $wpdb->get_charset_collate();
    $charset_collate = "default character set utf8\ncollate utf8_unicode_ci";
    if(!empty($searchable_fields))
        $searchable_fields = ",\nFULLTEXT KEY _keywords (".implode($searchable_fields,',').')';
    else
        $searchable_fields = '';

    $sql = "CREATE TABLE $table_name (
".implode($fields,",\n").",
".$primary_key.$searchable_fields."
) ENGINE=MyISAM ".$charset_collate;

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );

    // DROP removed columns
    $columns = $wpdb->get_col( "DESC " . $table_name, 0 );
    foreach ( $columns as $column_name ) {
        if(!in_array($column_name, $new_field_names)){
            $wpdb->query( "ALTER TABLE $table_name DROP COLUMN $column_name" );
        }
    }

    if($update_options){
        $field = '';
        foreach($update_options as $fieldToUpdate){
            foreach($fieldToUpdate['options'] as $id=>$label){
                $data = array();
                if($fieldToUpdate['type']=='select' && ($fieldToUpdate['prev_multiselect']===true || $fieldToUpdate['next_multiselect']===true)){
                    if($fieldToUpdate['prev_multiselect']===true && $fieldToUpdate['next_multiselect']===true){
                        $prev = $prev_options[$fieldToUpdate['name']][$id];
                        $wpdb->query('UPDATE '.$table_name.' SET `'.esc_sql($fieldToUpdate['name']).'`=REPLACE(`'.esc_sql($fieldToUpdate['name']).'`, \'"label":"'.esc_sql($prev).'"\',\'"label":"'.esc_sql($label).'"\')');
                    }else{
                        $wpdb->query('UPDATE '.$table_name.' SET `'.$fieldToUpdate['name'].'`=\'\' ');
                    }
                }else{
                    $f = $fieldToUpdate['name'].'_text';
                    $data[$f] = $label;
                    $where = array();
                    $where[$fieldToUpdate['name']] = $id;
                    $wpdb->update($table_name, $data, $where);
                }
            }
        }
    }

    if($clear_fields){
        $field = '';
        foreach($clear_fields as $field){
            $wpdb->query('UPDATE '.$table_name.' SET `'.$field.'`=\'\' ');
        }
    }


//    update_post_meta($map_id, 'mapsvg_searchable_fields', json_encode($searchable_fields));
}

/* ADD META BOX TO POST TYPES */
function add_mapsvg_metabox() {
    $connections = (array)json_decode(get_site_option('mapsvg_to_posts','[]'));

    foreach($connections as $post_type=>$map_ids){
        add_meta_box('mapsvg_fields', 'MapSVG Fields', 'mapsvg_metabox_template', $post_type, 'normal', 'default');
        /* Save post meta on the 'save_post' hook. */
    }
}
//add_action( 'add_meta_boxes', 'add_mapsvg_metabox' );
//add_action( 'save_post', 'mapsvg_save_metabox_fields', 10, 2 );

/* Save the meta box's post metadata. */
function mapsvg_save_metabox_fields( $post_id, $post ) {
    global $wpdb;

    if(!$_POST['mapsvg'] && !$_POST['mapsvg_id'])
        return;


    /* Verify the nonce before proceeding. */
//    if ( !isset( $_POST['smashing_post_class_nonce'] ) || !wp_verify_nonce( $_POST['smashing_post_class_nonce'], basename( __FILE__ ) ) )
//        return $post_id;

    /* Get the post type object. */
    $post_type = get_post_type_object( $post->post_type );

    /* Check if the current user has permission to edit the post. */
//    if ( !current_user_can( $post_type->cap->edit_post, $post_id ) )
//        return $post_id;

    $data = $_POST['mapsvg'];

    $data = mapsvg_encode_data($_POST['mapsvg_id'], $data);
    $data['post_id'] = $post_id;

    $table = mapsvg_table_name($_POST['mapsvg_id'], 'database');
    $obj_id = $wpdb->get_var('SELECT id FROM '.$table.' WHERE post_id='.$post_id);

    if(!$obj_id)
        $wpdb->insert($table, $data);
    else
        $wpdb->update($table, $data, array('id'=>$obj_id));

}

function mapsvg_metabox_template( $post, $box ) {
    global $mapsvg_inline_script, $wpdb;

    mapsvg_add_jscss_common();
    mapsvg_add_jscss_metabox();

    $connections = json_decode(get_site_option('mapsvg_to_posts','[]'));

    $map_ids = $connections->{$post->post_type};
    // TODO multiple maps
    $map_id = $map_ids[1];

    $map = mapsvg_get_map($map_id);

    if (empty($map->ID))
        return 'Map with ID '.$map->ID.' not found.';


//    $object = $wpdb->get_row('SELECT * FROM '.mapsvg_table_name($map_id, 'database').' WHERE post_id='.$post->ID, ARRAY_A);
//    if($object)
//        $object = mapsvg_decode_data($map_id, $object);


    $metaboxadmin_options            = array();
    $metaboxadmin_options['title']   = $map->post_title;
//    $metaboxadmin_options['schema']  = get_post_meta((int)$map_id, 'mapsvg_schema', true);
    $metaboxadmin_options['id']      = $map->ID;
    $metaboxadmin_options['options'] = $map->post_content;
//    $metaboxadmin_options['dataObject']  = $object;
    $metaboxadmin_options['markers']  = get_marker_images();

    $style = get_post_meta($map->ID, 'mapsvg_css', true);
    if($style){
        $style = '<style>'.$style.'</style>';
        $mapsvg_inline_script[] = $style;
    }

    add_action('admin_footer', 'script', 9998);

    include(MAPSVG_PLUGIN_DIR.'/metabox.php');
};


function mapsvg_log($msg){
    global $wpdb;
    if(is_array($msg)){
        $msg = json_encode($msg);
    }
    $wpdb->insert('wp_logs', array('message'=>$msg));
}

//register_activation_hook( __FILE__, 'mapsvg_set_db' );

function mapsvg_update_db_check() {
    global $wpdb;

    $schema_table_exists = $wpdb->get_var('SHOW TABLES LIKE \''.$wpdb->prefix.'mapsvg_schema\'') == $wpdb->prefix.'mapsvg_schema';
    if(!$schema_table_exists){
        $charset_collate = "default character set utf8\ncollate utf8_unicode_ci";
        $wpdb->query("CREATE TABLE ".$wpdb->prefix."mapsvg_schema (id int(11) NOT NULL AUTO_INCREMENT, table_name VARCHAR (255) NOT NULL, fields text, PRIMARY KEY (id)) ".$charset_collate);
    }

    $r2d_table_exists = $wpdb->get_var('SHOW TABLES LIKE \''.$wpdb->prefix.'mapsvg_r2d\'') == $wpdb->prefix.'mapsvg_r2d';
    if(!$r2d_table_exists){
        $charset_collate = "default character set utf8\ncollate utf8_unicode_ci";
        $wpdb->query("CREATE TABLE ".$wpdb->prefix."mapsvg_r2d (map_id int(11) NOT NULL, region_id varchar(255) NOT NULL, object_id int(11) NOT NULL, INDEX (map_id, region_id), INDEX(map_id, object_id)) ".$charset_collate);
    }
}
add_action( 'plugins_loaded', 'mapsvg_update_db_check' );


function mapsvg_update_map($id, $update_to, $params){
    global $wpdb;

    switch ($update_to){
        case '3.2.0':

            // 1. Change region_id to regions (to allow multiple regions)
            $table = mapsvg_table_name($id, 'database');
            $regions_table = mapsvg_table_name($id, 'regions');
            if($wpdb->get_row('SHOW TABLES LIKE \''.$table.'\'') && $wpdb->get_row('SHOW COLUMNS FROM '.$table.' LIKE \'region_id\'')){
                $wpdb->query('UPDATE  '.$table.' t1, '.$regions_table.' t2 SET t1.region_id_text = CONCAT(\'[{"id": "\', t2.id, \'", "title": "\', t2.region_title,\'"}]\') WHERE t1.region_id = t2.id');
                $wpdb->query('ALTER TABLE '.$table.' DROP COLUMN `region_id`');
                $wpdb->query('ALTER TABLE '.$table.' CHANGE `region_id_text` `regions` TEXT');
            }
            $schema = $wpdb->get_var('SELECT fields FROM '.$wpdb->prefix.'mapsvg_schema WHERE table_name=\''.$table.'\'');
            if($schema){
                $schema = str_replace('"name":"region_id"','"name":"regions"',$schema);
                $wpdb->query('UPDATE '.$wpdb->prefix.'mapsvg_schema SET `fields`=\''.$schema.'\'  WHERE table_name=\''.$table.'\'');
            }


            // 2. Check if there is "status"/ "status_text" field in regions table and if there is, rename it to "_status"
            $schema = json_decode(mapsvg_get_schema($id, 'regions'), true);
            if(!$schema){
                $schema = array();
                _mapsvg_save_schema($id, 'regions', $schema);
            }else{
                $need_rename_status_field = false;
                $need_rename_status_text_field = false;
                foreach($schema as &$field){
                    if($field['name']=='status'){
                        $field['name'] = '_status';
                        $need_rename_status_field = $field['db_type'];
                    }elseif($field['name']=='status_text'){
                        $field['name'] = '_status_text';
                        $need_rename_status_text_field = $field['db_type'];
                    }
                }
                _mapsvg_save_schema($id, 'regions', $schema, true);
                if($need_rename_status_field){
                    $wpdb->query('ALTER TABLE '.$regions_table.' CHANGE `status` `_status` '.$need_rename_status_field);
                }
                if($need_rename_status_text_field){
                    $wpdb->query('ALTER TABLE '.$regions_table.' CHANGE `status_text` `_status_text` '.$need_rename_status_text_field);
                }
            }


            // 3. Add "status" field to regions table (new feature instead of "disabled" Region property)
            $disabledColor = isset($params['disabledColor']) && !empty($params['disabledColor']) ? $params['disabledColor'] : '';

            $obj = new stdClass();
            $obj->{'1'} = array("label"=>"Enabled","value"=>'1',"color"=>"","disabled"=>false);
            $obj->{'0'} = array("label"=>"Disabled","value"=>'0',"color"=> $disabledColor,"disabled"=>true);

            $status_field = array(
                'type'=>'status',
                'db_type'=>'varchar (255)',
                'label'=> 'Status',
                'name'=> 'status',
                'visible'=>true,
                'options'=>array(
                    $obj->{'1'},
                    $obj->{'0'}
                ),
                'optionsDict' => $obj
            );

            $schema[] = $status_field;
            _mapsvg_save_schema($id, 'regions', $schema);

            // 4. Get enabled/disabled status from regions and convert it into status
            $wpdb->query('UPDATE '.$regions_table.' SET status=1');

            if(isset($params['disabledRegions'])){
                foreach($params['disabledRegions'] as $d_id){
                    $wpdb->update($regions_table, array('status'=>0), array('id'=>$d_id));
                }
            }

            // 5. Update map version
            update_post_meta($id, 'mapsvg_version', '3.2.0');

            break;
        default:
            null;
    }
}

/**
 *
 *
 *
 *
 * Backward to 2.x
 *
 *
 *
 *
 */
function mapsvg_add_jscss_common_2(){

    wp_register_style('mapsvg2', MAPSVG_PLUGIN_URL . 'mapsvg2/css/mapsvg.css');
    wp_enqueue_style('mapsvg2', null, '0.9');

    wp_register_script('jquery.mousewheel', MAPSVG_PLUGIN_URL . 'mapsvg2/js/jquery.mousewheel.min.js',array('jquery'), '3.0.6');
    wp_enqueue_script('jquery.mousewheel', null, '3.0.6');

    wp_register_script('handlebars', MAPSVG_PLUGIN_URL . 'mapsvg2/js/handlebars.js', null, '4.0.2');
    wp_enqueue_script('handlebars');

    wp_register_script('typeahead', MAPSVG_PLUGIN_URL . 'mapsvg2/js/typeahead.bundle.min.js', null, '1.0');
    wp_enqueue_script('typeahead');

    wp_register_script('nanoscroller', MAPSVG_PLUGIN_URL . 'mapsvg2/js/jquery.nanoscroller.min.js', null, '0.8.7');
    wp_enqueue_script('nanoscroller');
    wp_register_style('nanoscroller', MAPSVG_PLUGIN_URL . 'mapsvg2/css/nanoscroller.css');
    wp_enqueue_style('nanoscroller');


    if(MAPSVG_DEBUG)
        wp_register_script('mapsvg2', MAPSVG_PLUGIN_URL . 'mapsvg2/js/mapsvg.js', array('jquery'), rand());
    else
        wp_register_script('mapsvg2', MAPSVG_PLUGIN_URL . 'mapsvg2/js/mapsvg.min.js', array('jquery'), MAPSVG_JQUERY_VERSION);
    wp_enqueue_script('mapsvg2');
}
function mapsvg_add_jscss_admin_2(){

    global $mapsvg_settings_page, $wp_version;

    mapsvg_add_jscss_common_2();

    if(isset($_GET['page']) && $_GET['page']=='mapsvg-config'){

        wp_register_script('admin.mapsvg', MAPSVG_PLUGIN_URL . 'mapsvg2/js/admin.js', array('jquery'), MAPSVG_ASSET_VERSION);
        wp_enqueue_script('admin.mapsvg');

        wp_register_script('bootstrap', MAPSVG_PLUGIN_URL . "mapsvg2/js/bootstrap.min.js", null, '3.3.6');
        wp_enqueue_script('bootstrap');
        wp_register_style('bootstrap', MAPSVG_PLUGIN_URL . "mapsvg2/css/bootstrap.min.css", null, '3.3.6');
        wp_enqueue_style('bootstrap');
        wp_register_style('fontawesome', MAPSVG_PLUGIN_URL . "mapsvg2/css/font-awesome.min.css", null, '4.4.0');
        wp_enqueue_style('fontawesome');

        wp_register_script('bootstrap-colorpicker', MAPSVG_PLUGIN_URL . 'mapsvg2/js/bootstrap-colorpicker.min.js');
        wp_enqueue_script('bootstrap-colorpicker');
        wp_register_style('bootstrap-colorpicker', MAPSVG_PLUGIN_URL . 'mapsvg2/css/bootstrap-colorpicker.min.css');
        wp_enqueue_style('bootstrap-colorpicker');

        wp_register_script('jquery.message', MAPSVG_PLUGIN_URL . 'mapsvg2/js/jquery.message.js', array('jquery'));
        wp_enqueue_script('jquery.message');

        wp_register_style('jquery.message.css', MAPSVG_PLUGIN_URL . 'mapsvg2/css/jquery.message.css');
        wp_enqueue_style('jquery.message.css');

        wp_register_style('main.css', MAPSVG_PLUGIN_URL . 'mapsvg2/css/main.css');
        wp_enqueue_style('main.css');

        wp_register_style('codemirror', MAPSVG_PLUGIN_URL . 'mapsvg2/css/codemirror.css');
        wp_enqueue_style('codemirror');

        wp_enqueue_script('select2', MAPSVG_PLUGIN_URL . 'mapsvg2/js/select2.min.js', array('jquery'), '4.0',true);
        wp_register_style('select2', MAPSVG_PLUGIN_URL . 'mapsvg2/css/select2.min.css');
        wp_enqueue_style('select2');

        wp_register_script('ionslider', MAPSVG_PLUGIN_URL . 'mapsvg2/js/ion.rangeSlider.min.js', array('jquery'), '2.1.2');
        wp_enqueue_script('ionslider');
        wp_register_style('ionslider', MAPSVG_PLUGIN_URL . 'mapsvg2/css/ion.rangeSlider.css');
        wp_enqueue_style('ionslider');
        wp_register_style('ionslider-skin', MAPSVG_PLUGIN_URL . 'mapsvg2/css/ion.rangeSlider.skinNice.css');
        wp_enqueue_style('ionslider-skin');

        wp_register_script('codemirror', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.js', null, '1.0');
        wp_enqueue_script('codemirror');
        wp_register_script('codemirror.javascript', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.javascript.js', null, '1.0');
        wp_enqueue_script('codemirror.javascript');
        wp_register_script('codemirror.xml', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.xml.js', null, '1.0');
        wp_enqueue_script('codemirror.xml');
        wp_register_script('codemirror.htmlmixed', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.htmlmixed.js', null, '1.0');
        wp_enqueue_script('codemirror.htmlmixed');
        wp_register_script('codemirror.simple', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.simple.js', null, '1.0');
        wp_enqueue_script('codemirror.simple');
        wp_register_script('codemirror.multiplex', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.multiplex.js', null, '1.0');
        wp_enqueue_script('codemirror.multiplex');
        wp_register_script('codemirror.handlebars', MAPSVG_PLUGIN_URL . 'mapsvg2/js/codemirror.handlebars.js', null, '1.0');
        wp_enqueue_script('codemirror.handlebars');

        if(version_compare($wp_version, "3.8", '>=')){
            wp_register_style('mapsvg-grey', MAPSVG_PLUGIN_URL . 'mapsvg2/css/grey.css');
            wp_enqueue_style('mapsvg-grey');
        }
    }

}
function mapsvg_conf_2(){
    global $mapsvg_page;

    // Check user rights
    if(!current_user_can('edit_posts'))
        die();

    $file       = null;
    $map_chosen = false;
    $svg_file_url = "";
    if (isset($_GET['map']))
        $svg_file_url = $_GET['map'];

    // If $_GET['map_id'] is set then we should get map's settings and from DB
    $map_id = isset($_GET['map_id']) ? $_GET['map_id'] : 'new';

    $js_mapsvg_options = "";
    if($map_id && $map_id!='new'){
        $post = mapsvg_get_map($map_id);
        $js_mapsvg_options = $post->post_content;

        $mapsvg_version = get_post_meta((int)$map_id, 'mapsvg_version');
    }


    $title = "";
    if($svg_file_url || ($map_id && $map_id!='new')){

        $mapsvg_page = 'edit';

        $title = isset($post) && $post->post_title ? $post->post_title : "New map";

        if ($js_mapsvg_options == "" && $svg_file_url!="")
            $js_mapsvg_options = json_encode(array('source' => $svg_file_url));

        // Load pin images
        $pin_files = @scandir(MAPSVG_PINS_DIR);
        if($pin_files){
            array_shift($pin_files);
            array_shift($pin_files);
        }

        $safeMarkerImagesURL = safeURL(MAPSVG_PINS_URL);
        $markerImages = array();
        $allowed =  array('gif','png' ,'jpg','svg','jpeg');
        foreach($pin_files as $p){
            $ext = pathinfo($p, PATHINFO_EXTENSION);
            if(in_array($ext,$allowed) )
                $markerImages[] = array("url"=>$safeMarkerImagesURL.$p, "file"=>$p);
        }
    }else{
        $mapsvg_page = 'index';
        // Load list of available maps from MAPSVG_MAPS_DIR

        $maps = array();
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(MAPSVG_MAPS_DIR)) as $filename)
        {
            if(strpos($filename,'.svg')!==false){
                $path_s = ltrim(str_replace('\\','/',str_replace(MAPSVG_MAPS_DIR,'',$filename)),'/');
                $maps[] = array(
                    "url" => MAPSVG_MAPS_URL . $path_s,
                    "path" => $path_s
                );
            }
        }
        if(is_dir(MAPSVG_MAPS_UPLOADS_DIR)){
            foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(MAPSVG_MAPS_UPLOADS_DIR)) as $filename)
            {
                if(strpos($filename,'.svg')!==false){
                    $path_s = ltrim(str_replace('\\','/',str_replace(MAPSVG_MAPS_UPLOADS_DIR,'',$filename)),'/');

                    $maps[] = array(
                        "url" => MAPSVG_MAPS_UPLOADS_URL.$path_s,
                        "path" => 'user-uploads/'.$path_s
                    );
                }
            }
        }

        if(isset($_GET['mapsvg_rollback'])){
            rollBack();
        }

        $generated_maps = get_posts(array('numberposts'=>999, 'post_type'=>'mapsvg'));

        $outdated_maps = getOutdated();
        $num = count($outdated_maps);
        if($num>0){
            // do update
            $num_updated = updateOutdatedMaps($outdated_maps);
            if ($num == 1 && $num_updated = 1)
                $mapsvg_notice = "There was 1 outdated map created in old version of MapSVG. The map was successfully updated.";
            elseif ($num == $num_updated)
                $mapsvg_notice = "There were ".$num." outdated maps created in old versions of MapSVG. All maps were successfully updated.";
            elseif ($num_updated == 0)
                $mapsvg_notice = "An error occured during update of your maps created in previous versions of MapSVG plugin. Please contact MapSVG support to get help.";
            elseif ($num != $num_updated)
                $mapsvg_notice = "There were ".$num." outdated maps created in old versions of MapSVG - and ".$num_updated." were successfully updated.";

        }

    }


    $template = 'template_'.$mapsvg_page.'.inc';

    include(MAPSVG_PLUGIN_DIR.'/mapsvg2/header.inc');
    include(MAPSVG_PLUGIN_DIR.'/mapsvg2/'.$template);
    if($template == 'template_edit.inc'){
        include (MAPSVG_PLUGIN_DIR.'/mapsvg2/template_handlebars.hbs');
    }
    include(MAPSVG_PLUGIN_DIR.'/mapsvg2/footer.inc');

    return true;
}
function mapsvg_save_2( $data ){
    global $wpdb;

    $data_js   = stripslashes($data['mapsvg_data']);

    $postarr = array(
        'post_type'    => 'mapsvg',
        'post_status'  => 'publish'
    );

    if(isset($data['title'])){
        $postarr['post_title'] = strip_tags(stripslashes($data['title']));
    }else{
        $postarr['post_title'] = "New Map";
    }

    $postarr['post_content'] = $data_js;

    if(isset($data['map_id']) && $data['map_id']!='new'){
        $postarr['ID'] = (int)$data['map_id'];
        // PREPARE STATEMENT AND PUT INTO DB
        $wpdb->query(
            $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID = %d", array($postarr['post_title'], $postarr['post_content'], $postarr['ID']))
        );
        update_post_meta($postarr['ID'], 'mapsvg_version', '2.4.1');
        $post_id = $postarr['ID'];
    }else{
        $post_id = wp_insert_post( $postarr );
        // PREPARE STATEMENT AND PUT INTO DB
        $wpdb->query(
            $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID = %d", array($postarr['post_title'], $postarr['post_content'], $post_id))
        );
        add_post_meta($post_id, 'mapsvg_version', MAPSVG_VERSION);
    }

    return $post_id;
}
function mapsvg_delete_2($id, $ajax){
    wp_delete_post($id);
    delete_post_meta($id, 'mapsvg_version');
    if(!$ajax)
        wp_redirect(admin_url('?page=mapsvg-config'));
}
function mapsvg_copy_2($id, $new_title){
    global $wpdb;

    $post = &mapsvg_get_map($id);

    $copy_post = array(
        'post_type'    => 'mapsvg',
        'post_status'  => 'publish'
    );

    $new_title = stripslashes(strip_tags($new_title));
    $post_content = $post->post_content;

    $new_id = wp_insert_post($copy_post);

    $wpdb->query(
        $wpdb->prepare("update $wpdb->posts set post_title=%s, post_content=%s WHERE ID=%d", array($new_title, $post_content, $new_id))
    );

    $version = get_post_meta($id, 'mapsvg_version', true);
    add_post_meta($new_id, 'mapsvg_version', $version);
    return $new_id;
}
function mapsvg_print_2( $atts ){
    global $mapsvg_inline_script;

    $post = mapsvg_get_map($atts['id']);

    if (empty($post->ID))
        return 'Map not found, please check "id" parameter in your shortcode.';

    $data  = '<div id="mapsvg-'.$post->ID.'" class="mapsvg"></div>';
    $script = '<script type="text/javascript">';

    if(!empty($atts['selected'])){
        $country = str_replace(' ','_', $atts['selected']);
        $script .= '
      var mapsvg_options = '.$post->post_content.';
      jQuery.extend( true, mapsvg_options, {regions: {"'.$country.'": {selected: true}}} );
      jQuery("#mapsvg-'.$post->ID.'").mapSvg2(mapsvg_options);</script>';
    }else{
        $script .= 'jQuery("#mapsvg-'.$post->ID.'").mapSvg2('.$post->post_content.');</script>';
    }
    $mapsvg_inline_script[] = $script;

    //wp_footer('script');
    add_action('wp_footer', 'script', 9999);

    //return //wp_specialchars_decode($data);
    return $data;
}

function mapsvg_download_svg()
{

    if (!isset($_POST['png']) || !isset($_POST['bounds']))
        die();

    $bounds = implode(' ',$_POST['bounds']);

    $png = $_POST['png'];
    $width = (int)$_POST['width'];
    $height = (int)$_POST['height'];
    $filename = 'mapsvg' . ($_POST['map_id']?'-'.$_POST['map_id']:'') . '.svg';
//    list($width, $height, $type, $attr) = getimagesize($png);

    $mapsvg_error = mapsvg_check_upload_dir();

    if (!$mapsvg_error) {
//        $target_file = MAPSVG_MAPS_UPLOADS_DIR . "/tmp/" . $filename;
        $target_file = MAPSVG_MAPS_UPLOADS_DIR . "/" . $filename;

        $svg = '';
        $svg .= '<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
    xmlns:mapsvg="http://mapsvg.com"
    xmlns:xlink="http://www.w3.org/1999/xlink"    
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    width="' . $width . '"
    height="' . $height . '"
    mapsvg:geoViewBox="'.$bounds.'"
>
';

        $svg .= '<image id="mapsvg-google-map-background" xlink:href="' . $png . '"  x="0" y="0" height="' . $height . '" width="' . $width . '"></image>';
        $svg .= '</svg>';

        $file = fopen($target_file, 'w');
        fwrite($file, $svg);
        fclose($svg);
        $svg_file_path = str_replace($_SERVER['DOCUMENT_ROOT'],'',MAPSVG_MAPS_UPLOADS_DIR) . DIRECTORY_SEPARATOR . $filename;;
        echo MAPSVG_PLUGIN_URL."gm_download.php?file=".$svg_file_path;
        die();
//            $path_s = ltrim(str_replace('\\','/',str_replace(MAPSVG_MAPS_UPLOADS_DIR,'',$target_file)),'/');
//            $url = '?page=mapsvg-config&map_id=new&map='.parse_url(MAPSVG_MAPS_UPLOADS_URL . $path_s, PHP_URL_PATH);
//            $svg_file_path = MAPSVG_MAPS_UPLOADS_URL. "/tmp/".$filename;;
    }
}

add_action('wp_ajax_mapsvg_download_svg', 'mapsvg_download_svg');

function mapsvg_check_upload_dir(){
    $mapsvg_error = false;
    if(!file_exists(MAPSVG_MAPS_UPLOADS_DIR)){
        if(!wp_mkdir_p(MAPSVG_MAPS_UPLOADS_DIR))
            $mapsvg_error = "Unable to create directory ".MAPSVG_MAPS_UPLOADS_DIR.". Is its parent directory writable by the server?";
    }else{
        if(!wp_is_writable(MAPSVG_MAPS_UPLOADS_DIR))
            $mapsvg_error = MAPSVG_MAPS_UPLOADS_DIR." is not writable. Please change folder permissions.";
    }
    return $mapsvg_error;
}

function mapsvg_upload () {
    $mapsvg_error = mapsvg_check_upload_dir();

    if(!$mapsvg_error){
        $filename = sanitize_file_name(basename($_POST["filename"]));
        $target_file = MAPSVG_MAPS_UPLOADS_DIR . "/".$filename;

//        $file_parts = pathinfo($_FILES['svg_file']['name']);

        $file = fopen($target_file, 'w');
        fwrite($file, stripslashes($_POST['data']));
        fclose($file);

        echo $filename;

    }
    die();
}
add_action('wp_ajax_mapsvg_upload', 'mapsvg_upload');

function mapsvg_save_google_api_key () {

    $maps_api_key = $_POST['maps_api_key'];
    $geocoding_api_key = $_POST['geocoding_api_key'];
    if($maps_api_key){
        update_option('mapsvg_google_api_key', $maps_api_key);
    }
    if($geocoding_api_key){
        update_option('mapsvg_google_geocoding_api_key', $geocoding_api_key);
    }

    echo '{"ok":true}';

    die();
}
add_action('wp_ajax_mapsvg_save_google_api_key', 'mapsvg_save_google_api_key');

function mapsvg_geocoding ($address, $return_as_array = true) {
    global $geocoding_quota_per_second, $google_geocode_api_key, $permanent_error;

    if(empty($address)){
        return false;
    }
    if(isset($permanent_error)){
        return $return_as_array ? json_decode($permanent_error, true) : $permanent_error;
    }
    if(!$geocoding_quota_per_second){
        $geocoding_quota_per_second = 1;
    }
    if(!$google_geocode_api_key){
        $google_geocode_api_key = get_option('mapsvg_google_geocoding_api_key');
        if(!$google_geocode_api_key){
            $google_geocode_api_key = get_option('mapsvg_google_api_key');
        }
    }

    if($google_geocode_api_key){
        if($geocoding_quota_per_second > 49){
            sleep(1);
            $geocoding_quota_per_second = 1;
        }
        $address = urlencode($address);
        $data = url_get_contents('https://maps.googleapis.com/maps/api/geocode/json?key='.$google_geocode_api_key.'&address=' . $address . '&sensor=false');
        if($data){
            $data_json = json_decode($data, true);
            if($data_json['status'] === 'OVER_DAILY_LIMIT' || $data_json['status'] === 'OVER_QUERY_LIMIT'){
                $permanent_error = $data;
            }
            return $return_as_array ? $data_json : $data;
        } else {
            return array('status'=>'CONNECTION_ERROR', 'error_message' => 'Can\'t connect to Google Geocoding API');
        }
    } else {
        return array('status'=>'NO_API_KEY', 'error_message' => 'No Google Geocoding API key');
    }
}
function ajax_mapsvg_geocoding () {
    // TODO check for nonce
    echo mapsvg_geocoding($_GET['address'], false);
    die();
}
add_action('wp_ajax_mapsvg_geocoding', 'ajax_mapsvg_geocoding');
add_action('wp_ajax_nopriv_mapsvg_geocoding', 'ajax_mapsvg_geocoding');

function url_get_contents ($url) {
/*    if (function_exists('curl_exec')){
        $conn = curl_init($url);
        curl_setopt($conn, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($conn, CURLOPT_FRESH_CONNECT,  true);
        curl_setopt($conn, CURLOPT_RETURNTRANSFER, 1);
        $url_get_contents_data = (curl_exec($conn));
        curl_close($conn);
    }else*/
//    if(ini_get('allow_url_fopen')){
        $url_get_contents_data = file_get_contents($url);
//    }else{
//        $url_get_contents_data = json_encode(array('error_message'=>'Please enable "allow_url_fopen" option in php.ini settings or install cURL.'));
//    }
    return $url_get_contents_data;
}


?>