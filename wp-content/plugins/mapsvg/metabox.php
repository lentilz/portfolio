test
<div class="bootstrap-iso" id="mapsvg-metabox">
    <div class="mapsvg-metabox-form"></div>
    <div class="mapsvg-metabox-map">
        <div id="mapsvg-<?php echo $metaboxadmin_options['id']?>"></div>
    </div>
    <input type="hidden" name="mapsvg_id" value="<?php echo $metaboxadmin_options['id']?>" />
</div>

<script type="text/javascript">
    jQuery(document).ready(function(){
        window.mapsvgMetabox = new MapSVG.MetaboxAdmin({
            containerId: 'mapsvg-metabox',
            dataObject : <?php echo  $metaboxadmin_options['dataObject'] ? json_encode($metaboxadmin_options['dataObject']) : '{}'?>,
            mapOptions : <?php echo  $metaboxadmin_options['options'] ? $metaboxadmin_options['options'] : '{}'?>,
            mapSchema : <?php echo  $metaboxadmin_options['schema'] ? $metaboxadmin_options['schema'] : '[]'?>,
            mapId : "<?php echo $metaboxadmin_options['id']?>",
            mapContainerId: '<?php echo 'mapsvg-'.$metaboxadmin_options['id']?>',
            mapTitle: "<?php echo addslashes($metaboxadmin_options['title'])?>",
            markerImages : <?php echo (isset($metaboxadmin_options['markers']) ? json_encode($metaboxadmin_options['markers']) : '[]')?>
        });
    })
</script>