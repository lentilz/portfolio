<?php if(isset($mapsvg_error)) {?>
    <div class="alert alert-danger">
        <?php echo esc_html($mapsvg_error); ?>
    </div>
<?php }?>
<?php if(isset($mapsvg_notice)) {?>
    <div class="alert alert-info">
        <?php echo esc_html($mapsvg_notice); ?>
    </div>
<?php }?>

<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">New map</h3>
    </div>
    <div class="panel-body">
        <form enctype="multipart/form-data" method="POST">
            <div class="row">
                <div class="col-sm-6">
                    <div class="form-group">
                        <label class="control-label">Choose SVG file</label>
                        <a href="" id="hidden-link" style="display: none;"></a>
                        <select class="form-control select-map-list span4">
                            <option value="">...</option>
                            <?php if(isset($maps)) foreach($maps as $m){?>
                                <option data-link="?page=mapsvg-config&map_id=new&map=<?php echo esc_attr($m['url'])?>"><?php echo esc_html($m['path'])?></a></option>
                            <?php }?>
                        </select>
                    </div>

                </div>
                <div class="col-sm-6">
                    <div class="form-group">
                        <label class="control-label">Upload SVG file</label>
                        <!--                        <input type="file"  name="svg_file" id="svg_file_uploader"/>-->
                        <br />
                <span class="btn btn-primary btn-sm btn-file" data-loading-text="Uploading...">
                    Browse... <input type="file" name="svg_file" id="svg_file_uploader" />
                </span>
                        <input type="hidden" name="upload_svg" />
                        <input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce('upload_map')?>"/>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>



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
                    <a href="#" class="btn btn-sm btn-default mapsvg-copy">Duplicate</a>&nbsp;&nbsp;
                    <a href="#" class="btn btn-sm btn-default mapsvg-delete">Delete</a>
                </td>
            </tr>
        <?php }?>
        </tbody>
    </table>
<?php }?>


