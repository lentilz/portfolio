<?php

if ( ! class_exists( 'Timber' ) ) {
  add_action( 'admin_notices', function() {
    echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
  } );
  return;
}

class PortfolioSite extends TimberSite {

  function __construct() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'menus' );
    add_action( 'init', array( $this, 'cleanup_header' ) );
    add_action( 'init', array( $this, 'add_menus' ) );
    add_filter( 'timber_context', array( $this, 'add_to_context' ) );
    add_action( 'wp_enqueue_scripts', array( $this, 'add_styles_and_scripts' ), 999 );
    add_action( 'widgets_init', array( $this, 'add_sidebars' ) );
    parent::__construct();
  }

  function cleanup_header() {
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'index_rel_link' );
    remove_action( 'wp_head', 'wp_generator' );
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
  }

  function add_to_context ( $context ) {
    $context['footer_menu'] = new TimberMenu('footer-menu');
    $context['site'] = $this;
    $context['options'] = get_fields('options');
    // $context['footer_widgets'] = Timber::get_widgets('footer_widgets');

    return $context;
  }

  function add_styles_and_scripts() {
    global $wp_styles;

    if (!is_admin()) {
      wp_deregister_script('jquery');
      wp_enqueue_script( 'jquery', get_template_directory_uri() . '/src/js/vendor/jquery.js', array(), '2.1.14', false );
      wp_enqueue_script( 'site-js', get_template_directory_uri() . '/assets/js/source.dev.js', array( 'jquery' ), '0.0.3', true );
    }
  }

  function add_sidebars() {
    register_sidebar(array(
      'id' => 'footer_widgets',
      'name' => __('Footer'),
      'description' => __('Widgets in the site global footer'),
      'before_widget' => '',
      'after_widget' => ''
    ));

  }

  function add_menus() {
    register_nav_menus(
      array(
        'footer-menu' => __( 'Footer Menu' )
      )
    );
  }

}

new PortfolioSite();

// Customize TinyMCE settings
require_once(get_template_directory() . '/custom_settings/theme_editor.php');

// Create Global Options page
if( function_exists('acf_add_options_page') ) {
  acf_add_options_page(array(
    'page_title'  => 'Global Variables',
    'menu_title'  => 'Global Variables',
    'menu_slug'   => 'global-variables',
    'capability'  => 'edit_posts',
    'redirect'    => false
  ));
}
