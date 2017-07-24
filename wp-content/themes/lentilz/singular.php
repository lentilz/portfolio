<?php
/**
* Single entry template. Used for posts and other individual content items.
*
* To override for a particular post type, create a template named single-[post_type]
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'single-' . $post->ID . '.twig', 'single-' . $post->post_type . '.twig', 'single.twig' );

$context['post'] = $post;
$context['pagination'] = Timber::get_pagination();

if ( is_front_page() ) {
  array_unshift( $templates, 'home.twig' );
}

$context['prev_page'] = get_previous_post();
$context['next_page'] = get_next_post();

Timber::render( $templates, $context );
