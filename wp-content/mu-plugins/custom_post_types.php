<?php
/**
* Plugin Name: Custom Post Types
* Description: Custom Post Types
* Version: 1.0.0
* Author: Lentie Ward>
*/

function custom_post_type() {
  global $wp_post_types;

  // Rename "Posts" to "Portfolio"
  $labels = &$wp_post_types['post']->labels;
  $menu_icon = &$wp_post_types['post']->menu_icon;
  $labels->name = __( 'Portfolio' );
  $labels->singular_name = __( 'Portfolio' );
  $labels->all_items = __( 'Portfolio Items' );
  $labels->add_new = __( 'Add Portfolio Item' );
  $labels->add_new_item = __( 'Add Portfolio Item' );
  $labels->edit = __( 'Edit' );
  $labels->edit_item = __( 'Edit Item');
  $labels->new_item = __( 'New Portfolio Item' );
  $labels->view_item = __( 'View Portfolio Item' );
  $labels->search_items = __( 'Search Portfolio' );
  $labels->menu_item = __( 'Portfolio' );
  $labels->name_admin_bar = __( 'Portfolio Items' );
  $menu_icon = 'dashicons-desktop';
}

add_action( 'init', 'custom_post_type');

function custom_post_labels() {
  global $menu;
  global $submenu;

  $menu[5][0] = __( 'Portfolio' );
  $submenu['edit.php'][5][0] = 'Portfolio Items';
  $submenu['edit.php'][10][0] = 'Add Portfolio Item';
  $submenu['edit.php'][16][0] = 'Portfolio Tags';
  echo '';
}

add_action( 'admin_menu', 'custom_post_labels' );
