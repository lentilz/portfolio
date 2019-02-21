<style>
    #growls.default {
        top: 32px;
        right: -2px;
    }
</style>

<?php if(isset($mapsvg_error)) {?>
    <div class="alert alert-danger">
        <?php echo esc_html($mapsvg_error); ?>
    </div>
<?php }?>
<?php if(isset($mapsvg_notice)) {?>
    <div class="alert alert-info">
        <?php echo $mapsvg_notice; ?>
    </div>
<?php }?>

<div class="">
    <div style="margin-bottom: 15px;">

    </div>

    <div style="margin-bottom: 15px;">

    </div>
    <div style="margin-bottom: 15px;">
    </div>


</div>


<div id="mapsvg-google-map-fullscreen-wrap" style="display: none;">
    <div id="mapsvg-google-map-fullscreen"></div>
    <div id="mapsvg-google-map-fullscreen-controls" class="well">
        <div style="margin-bottom: 10px;">
            <input type="text" class="form-control typeahead" onclick="this.focus();this.select()" id="mapsvg-gm-address-search" placeholder="Enter address..." />
<!--            <span class="input-group-btn">-->
<!--              <button class="btn btn-default" type="button"><i class="fa fa-search"></i></button>-->
<!--            </span>-->
        </div><!-- /input-group -->
        <a class="btn btn-default" id="mapsvg-gm-download">Download SVG</a>
        <button class="btn btn-default" id="mapsvg-gm-close">Close</button>
    </div>
</div>


<!--<div class="row" style="margin-bottom: 20px;">-->
<!--    <div class="col-sm-3" style="text-align: center;">-->
    <div class="well" style="overflow: hidden; padding-bottom: 9px;">
        <div class="mb">
        <form method="POST" style="margin: 0 auto;">
            <a href="" id="hidden-link" style="display: none;"></a>
            <select class="form-control select-map-list span2" id="mapsvg-svg-file-select" style="width: 250px;">
                <option value="">New SVG map</option>
                <?php if(isset($maps)) foreach($maps as $m){?>
                    <option data-link="?page=mapsvg-config&map_id=new&package=<?php echo esc_attr($m['package']);?>&path=<?php echo esc_attr($m['path_true'])?>"><?php echo esc_html($m['path_fake'])?></option>
                <?php }?>
            </select>
        </form>
        </div>
<!--    </div>-->
<!--    <div class="col-sm-2" style="text-align: center;">-->
        <div class="mb">
        <a id="new-google-map" href="?page=mapsvg-config&map_id=new&package=default&path=geo-calibrated/empty.svg&gmap=true&noheader=true" class="btn btn-default">New Google Map</a>
        </div>
<!--    </div>-->
<!--    <div class="col-sm-2" style="text-align: center;">-->
        <div class="mb">
            <form  style="display: block; margin: 0 auto;" enctype="multipart/form-data" method="POST" id="image_file_uploader_form">
                <div class="btn btn-default btn-file" data-loading-text="Uploading...">
                    New Image Map <input type="file" name="svg_file" id="image_file_uploader" />
                </div>
                <input type="hidden" name="upload_image" />
                <input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce('upload_image')?>"/>
            </form>
        </div>
<!--    </div>-->
<!--    <div class="col-sm-2" style="text-align: center;">-->
        <div class="mb">
        <form  style="display: block; margin: 0 auto;" enctype="multipart/form-data" method="POST" id="svg_file_uploader_form">
            <div class="btn btn-default btn-file" data-loading-text="Uploading...">
                Upload SVG<input type="file" name="svg_file" id="svg_file_uploader" accept="image/*" />
            </div>
            <input type="hidden" name="upload_svg" />
            <input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce('upload_map')?>"/>
        </form>
        </div>
<!--    </div>-->
<!--    <div class="col-sm-3" style="text-align: center;">-->
        <div class="mb">
        <form  style="display: block; margin: 0 auto;" enctype="multipart/form-data" method="POST">
            <div class="btn btn-default btn-file" id="download_gmap" >
                Download SVG with Google map
            </div>

<!--            <input type="hidden" name="upload_svg" />-->
<!--            <input type="hidden" name="_wpnonce" value="--><?php //echo wp_create_nonce('upload_map')?><!--"/>-->
        </form>
        </div>
        <div class="mb">
        <form  style="display: block; margin: 0 auto;" enctype="multipart/form-data" method="POST" id="svg_file_uploader_form">
<!--            <label style="display: inline-block;">Google API Key</label> <input class="form-control" style="width: 200px; display: inline-block;"/>-->
<!---->
            <div class="btn btn-default btn-file" id="api-key" data-toggle="modal" data-target="#myModal">
                Google API <i class="fa fa-key"></i>
            </div>
            <!-- Modal -->
            <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title" id="myModalLabel">Google API Keys</h4>
                        </div>
                        <div class="modal-body">

                            <p class="help-block">
                                You need to get access to 2 Google APIs to be able to add Markers and use Google Maps: <b>Maps API</b> and <b>Geocoding API</b>.
                                <br />
                                <br />
                                If you don't plan to use HTTP/IP restrictions for your API keys (which prevents your keys from being stolen)
                                then you can use one single API key for both APIs.
                                <br />
                                <br />
                                If you want to add restrctions for more safety - create first key for <b>Maps API</b>, restrict it by HTTP,
                                then create a second key for <b>Geocoding API</b> and restrict it by IP. Please note that <b>Geocoding API</b> wouldn't work
                                with HTTP-restriction - that's why you need 2 separate keys.
                                <a href="https://developers.google.com/maps/documentation/embed/get-api-key">Get Google API keys</a>.
                            </p>

                            <div class="form-group">
                                <label>Maps API key</label>
                                <input class="form-control" value="<?php echo $mapsvg_google_api_key ?>" id="mapsvg-google-api-key"/>
                                <p class="help-block">This key is used for Google Maps.</p>
                            </div>
                            <div class="form-group">
                                <label>Geocoding API key</label>
                                <input class="form-control" value="<?php echo $mapsvg_google_geocoding_api_key?$mapsvg_google_geocoding_api_key:$mapsvg_google_api_key ?>" id="mapsvg-google-geocoding-api-key"/>
                                <p class="help-block">
                                    This key is used to convert address to coordinates, to add markers and search for a location on Google Map.
                                </p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="save-api-key">Save</button>
                        </div>
                    </div>
                </div>
            </div>
<!--            <input type="hidden" name="upload_svg" />-->
<!--            <input type="hidden" name="_wpnonce" value="--><?php //echo wp_create_nonce('upload_map')?><!--"/>-->
        </form>
        </div>
    </div>
<!--</div>-->
<style>
    .mb {
        float: left;
        margin-right: 10px;
        margin-bottom: 10px;
    }
</style>


<?php if(isset($generated_maps) && count($generated_maps)>0){?>
    <!-- MENU -->
    <table class="table table-striped" id="mapsvg-table-maps">
        <thead>
        <th style="width: 30%">Map title</th>
        <th style="width: 20%">Shortcode</th>
        <th>Actions</th>
        </thead>
        <tbody id="mapsvg-table">
        <?php foreach($generated_maps as $m){?>
            <?php setup_postdata($m);?>
            <tr data-id="<?php echo $m->ID?>" data-title="<?php echo $m->post_title?>">
                <td class="mapsvg-map-title"><a href="?page=mapsvg-config&map_id=<?php echo $m->ID?>"><?php echo $m->post_title?></a></td>
                <td class="mapsvg-shortcode">[mapsvg id="<?php echo $m->ID?>"]</td>
                <td class="mapsvg-action-buttons">
                    <!--                        <a href="?page=mapsvg-config&map_id=--><?php //echo $m->ID?><!--" class="btn btn-small btn-info mapsvg-button-edit">Edit</a>-->
                    <a href="#" class="btn btn-sm btn-default mapsvg-copy" data-nonce="<?php echo wp_create_nonce('ajax_mapsvg_copy-'.$m->ID)?>">Duplicate</a>
                    <a href="#" class="btn btn-sm btn-default mapsvg-delete" data-nonce="<?php echo wp_create_nonce('ajax_mapsvg_delete-'.$m->ID)?>">Delete</a>
                    <?php if(isset($m->can_update_to)){?>
                        <a href="#" class="btn btn-sm btn-default mapsvg-update" data-update-to="<?php echo $m->can_update_to?>">Update</a>&nbsp;&nbsp;
                    <?php }?>
                </td>
            </tr>
        <?php }?>
        </tbody>
    </table>
<?php }?>


