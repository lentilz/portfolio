<?php if($mapsvg_page=='edit' || $mapsvg_page=='update'){?>
    <script type="text/javascript">
        jQuery('body').addClass('mapsvg-edit-screen');
    </script>
<?php }?>
<!--<iframe src="about:blank" class="stretch" id="stretchIframe" scrolling="no" style="width: 100%;height:100%;z-index: -1;"></iframe>-->
<div class="mapsvg-dashboard <?php if($mapsvg_page=='edit' || $mapsvg_page=='update'){?>fixed<?php }?>" id="mapsvg-admin">
    <?php if($mapsvg_page=='index'){?>
        <div class="row">
            <div class="col-sm-6">
                <h1 style="margin-bottom: 20px;">MapSVG <sup><?php echo MAPSVG_VERSION;?></sup></h1>
            </div>
            <div class="col-sm-6" style="text-align: right; line-height: 72px;">
                <a href="http://mapsvg.com/tutorials" target="_blank">Tutorials</a> | <a  target="_blank" href="https://codecanyon.net/item/mapsvg-responsive-vector-maps-floorplans-with-directory-search-filters/2547255/support">Support</a>
            </div>
        </div>
    <?php }else{?>
        <div id="mapsvg-nav-header" <?php if($can_update_to){?> class="mapsvg-can-update"<?php }?>>
            <h2>
                <a href="<?php echo admin_url('admin.php?page=mapsvg-config')?>">MapSVG</a> <sup><?php echo MAPSVG_VERSION;?></sup>  &rarr; <span id="map-page-title"> <?php echo $title;?></span> <small id="mapsvg-shortcode" style="float: none; width: auto; display: inline-block;"><?php if(isset($map_id) && $map_id!='new'){?>[mapsvg id="<?php echo $map_id?>"]<?php }?></small>
            </h2>

            <div class="pull-right" id="mapsvg-top-buttons">
                <button id="mapsvg-save" class="btn btn-sm btn-primary" data-loading-text="Saving..." >Save &nbsp;<span class="mapsvg-hotkey-mac">⌘S</span><span class="mapsvg-hotkey-others">Ctrl+S</span></button>
                <button id="mapsvg-save-svg" class="btn btn-sm btn-primary" style="display: none;" data-loading-text="Saving..." >Save SVG file&nbsp;<span class="mapsvg-hotkey-mac">⌘S</span><span class="mapsvg-hotkey-others">Ctrl+S</span></button>
                <div class="btn-group" data-toggle="buttons" id="mapsvg-view-buttons">
                    <label class="btn btn-sm btn-default active" id="mapsvg-panels-view-left">
                        <i class="fa fa-map-o"></i>
                        <input type="checkbox" autocomplete="off" checked name="left">
                    </label>
                    <label class="btn btn-sm btn-default active" id="mapsvg-panels-view-right">
                        <i class="fa fa-sliders"></i>
                        <input type="checkbox" autocomplete="off" checked name="right">
                    </label>
                </div>
                <div class="btn-group" data-toggle="buttons" id="mapsvg-map-mode-2">
                    <label class="btn btn-default btn-sm active" data-mode="preview">
                        <input type="radio" name="mapsvg_map_mode" value="preview" autocomplete="off" checked> Settings
                    </label>
                    <label class="btn btn-default btn-sm" data-mode="draw">
                        <input type="radio" name="mapsvg_map_mode" value="draw" autocomplete="off"> Draw
                    </label>
                </div>

            </div>
        </div>
    <?php }?>

