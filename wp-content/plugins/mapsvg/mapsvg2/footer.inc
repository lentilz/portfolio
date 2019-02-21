<script type="text/javascript">
    var madmin = 1;
    jQuery(document).ready(function(){
        madmin = jQuery().mapsvgadmin('init', {
            mapsvg_options : <?php echo  isset($js_mapsvg_options) && !empty($js_mapsvg_options) ? $js_mapsvg_options : '{}'?>,
            map_id : "<?php echo $map_id?>",
            markerImages : <?php echo (isset($markerImages) ? json_encode($markerImages) : '[]')?>,
            map_title: "<?php echo addslashes($title)?>"
        });
    })
</script>

</div>