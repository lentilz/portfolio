<?php if($mapsvg_page=='edit'){?>
    <script type="text/javascript">
        jQuery('body').addClass('mapsvg-edit-screen');
    </script>
<?php }?>
<iframe src="about:blank" class="stretch" id="stretchIframe" scrolling="no" style="width: 100%;height:100%;z-index: -1;"></iframe>
<div class="mapsvg-dashboard <?php if($mapsvg_page=='edit'){?>fixed<?php }?>" id="mapsvg-admin">

    <?php if($mapsvg_page=='index'){?>
        <h1 style="margin-bottom: 20px;">MapSVG <sup><strike><?php echo MAPSVG_VERSION;?></strike> <span style="color: red">2.4.1</span></sup></h1>
    <?php }else{?>
        <div id="mapsvg-nav-header">
            <h2>
                <a href="<?php echo admin_url('admin.php?page=mapsvg-config')?>">MapSVG</a> <sup><strike><?php echo MAPSVG_VERSION;?></strike> <span style="color: #c00;">2.4.1 (compatibility mode)</span></sup>  &rarr; <span id="map-page-title"> <?php echo $title;?></span> <small id="mapsvg-shortcode"><?php if(isset($map_id) && $map_id!='new'){?>[mapsvg id="<?php echo $map_id?>"]<?php }?></small>
            </h2>

            <div class="pull-right">
<!--                <div id="mapsvg-shortcode">-->
<!--                    shortcode [mapsvg id=12]-->
<!--                </div>-->
                <button id="mapsvg-save" class="btn btn-sm btn-primary" data-loading-text="Saving..." >Save</button>
            </div>
        </div>
    <?php }?>

