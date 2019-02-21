<script type="text/javascript">
    var mapsvg_fulltext_min_word = <?php echo $fulltext_min_word ? $fulltext_min_word : 'undefined' ?>;
//    MapSVG.admin
//    jQuery(document).ready(function(){
        MapSVG.version = '<?php echo MAPSVG_VERSION?>';
        MapSVG.svgFiles = <?php echo json_encode($maps)?>;
        var mapsvg_options = <?php echo  isset($js_mapsvg_options) && !empty($js_mapsvg_options) ? $js_mapsvg_options : '{}'?>;
        MapSVG.admin  = jQuery().mapsvgadmin('init', {
            post_types: <?php echo isset($post_types) ? json_encode($post_types) : '[]' ?>,
            mapsvg_options : mapsvg_options,
            mapsvg_google_api_key: <?php echo $mapsvg_google_api_key ? '"'.$mapsvg_google_api_key.'"' : 'undefined' ?>,
            mapsvg_google_geocoding_api_key: <?php echo $mapsvg_google_geocoding_api_key?'"'.$mapsvg_google_geocoding_api_key.'"':($mapsvg_google_api_key ? '"'.$mapsvg_google_api_key.'"' : 'undefined') ?>,
            mapsvg_schema_database : <?php echo  isset($mapsvg_schema_database) && !empty($mapsvg_schema_database) ? $mapsvg_schema_database : '[]'?>,
            mapsvg_schema_regions : <?php echo  isset($mapsvg_schema_regions) && !empty($mapsvg_schema_regions) ? $mapsvg_schema_regions : '[]'?>,
            mapsvg_css: '<?php echo  isset($mapsvg_css) ? str_replace("'", "\'", str_replace("\n","\\n",$mapsvg_css)) : ''?>',
            map_id : "<?php echo $map_id?>",
            wp_prefix: "<?php echo $wp_prefix?>",
            markerImages : <?php echo (isset($markerImages) ? json_encode($markerImages) : '[]')?>,
            map_title: "<?php echo addslashes($title)?>",
            _wpnonce: '<?php echo wp_create_nonce('ajax_mapsvg_save-'.$map_id)?>'
        });
//    })
</script>

</div>