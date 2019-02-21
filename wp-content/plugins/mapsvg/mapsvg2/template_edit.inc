<!-- FORM -->

<table id="mapsvg-table-maps" class="table table-striped" style="height: 325px;" width="824">

<table id="mapsvg-table-maps" class="table table-striped" width="100%">

<div id="mapsvg-panels" class="stretch">

        <div class="mapsvg-panel-left stretch" id="mapsvg-container">

            <div class="alert alert-warning alert-dismissible" id="mapsvg-auto-id-warning" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <strong>Warning!</strong> Some objects in SVG file are missing their IDs.
                MapSVG generated IDs but please note that if you will edit SVG file later and add/remove some objects,
                it would change objects order and ID references would be lost.
            </div>

            <div class="btn-group" data-toggle="buttons" id="mapsvg-map-mode">
                <label class="btn btn-default btn-xs active">
                    <input type="radio" name="mapsvg_map_mode" value="preview" autocomplete="off" checked> Preview
                </label>
                <label class="btn btn-default btn-xs">
                    <input type="radio" name="mapsvg_map_mode" value="editRegions" autocomplete="off"> Edit regions
                </label>
                <label class="btn btn-default btn-xs">
                    <input type="radio" name="mapsvg_map_mode" value="editMarkers" autocomplete="off"> Edit markers
                </label>
            </div>
            <div id="mapsvg" class="stretch"></div>
        </div>

        <div class="stretch mapsvg-panel-right">

            <ul class="nav nav-tabs" id="myTab">
                <li class="active"><a href="#tab_settings">Settings</a></li>
                <li><a href="#tab_colors">Colors</a></li>
                <li><a href="#tab_regions">Regions</a></li>
                <li><a href="#tab_markers">Markers</a></li>
                <li><a href="#tab_events">JavaScript</a></li>
<!--                <li><a href="#tab_posts">Posts</a></li>-->
            </ul>

            <div id="mapsvg-mapform-container" class="stretch mapsvg-scrollable-content nano">
                <div id="mapsvg-search-placeholder">

                    <div id="mapsvg-regions-search">
                        <div class="input-group">
                            <span class="input-group-addon" id="basic-addon1"><i class="fa fa-search"></i></span>
                            <input  onClick="this.select();" type="text" class="form-control" placeholder="Search regions by ID/Title" aria-describedby="basic-addon1" autocomplete="off"/>
                        </div>
                    </div>

                    <div id="mapsvg-markers-search">
                        <div class="input-group" style="margin-bottom: 10px;">
                            <span class="input-group-addon" id="basic-addon2"><i class="fa fa-search"></i></span>
                            <input id="mapsvg-markers-search-1" onClick="this.select();" type="text" class="form-control" placeholder="Search markers by ID" aria-describedby="basic-addon2" autocomplete="off"/>
                        </div>
                        <div id="mapsvg-geocode">
                            <input type="text" class="form-control typeahead" placeholder="New marker: enter address or coordinates"/>
                        </div>
                    </div>



                </div>
                <div class="nano-content">

                </div>
            </div>
        </div>
</div>

<form id="form-import" method="post" enctype="multipart/form-data" style="position:  absolute; top: -9999px; left: -9999px;">
    <input type="hidden" name="import_objects" value=""/>
    <input type="hidden" name="import" value="1"/>
    <input type="file" id="mapsvg-choose-import-file" name="csv"/>
</form>

<div class="modal fade" id="mapsvg-modal-marker" style="display: none">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Edit marker</h4>
            </div>

            <div class="modal-body">
            <form class="form-horizontal" id="markerForm" action="" method="post">
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Image
                    </label>
                    <div class="col-sm-9">
                        <select name="marker[src]" id="marker-attrs-src">
                            <?php foreach($pin_files as $p){?>
                                <option value="<?php echo MAPSVG_PINS_URL.$p?>"><?php echo $p?></option>
                            <?php }?>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Tooltip
                    </label>
                    <div class="col-sm-9">
                        <textarea id="marker-tooltip" name="marker[tooltip]" placeholder="Any HTML content"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Popover
                    </label>
                    <div class="col-sm-9">
                        <textarea id="marker-popover" name="marker[popover]" placeholder="Any HTML content"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        URL
                    </label>
                    <div class="col-sm-9">
                        <input type="text" id="marker-attrs-href" name="marker[href]"   placeholder="http://"/>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        URL Target
                    </label>
                    <div class="col-sm-9">
                        <input type="text" id="marker-attrs-target" name="marker[target]"   placeholder="blank"/>
                    </div>
                </div>
                <input type="hidden" id="markerModalState" value="1"/>
            </form>
        </div>
            <div class="modal-footer">
                <a href="#" id="markerCancel" class="btn" data-dismiss="modal">Close</a>
                <a href="#" id="markerDelete" class="btn btn-danger" data-dismiss="modal">Remove marker</a>
                <a href="#" id="markerSave" class="btn btn-primary" data-dismiss="modal">Save changes</a>
            </div>
         </div>
    </div>
</div>

<div class="modal" id="mapsvg-modal-region" style="display: none;">
        <div class="modal-header">
            <h3>Edit region</h3>
        </div>
        <div class="modal-body">
            <form class="form-horizontal" id="regionForm" action="" method="post">
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Color
                    </label>
                    <div class="col-sm-9">
                        <input type=""/>
                    </div>
                </div>

                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Tooltip
                    </label>
                    <div class="col-sm-9">
                        <textarea id="region-tooltip" name="region[tooltip]" placeholder="Any HTML content"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        Popover
                    </label>
                    <div class="col-sm-9">
                        <textarea id="region-popover" name="region[popover]" placeholder="Any HTML content"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        URL
                    </label>
                    <div class="col-sm-9">
                        <input type="text" id="region-attrs-href" name="region[attrs][href]"   placeholder="http://"/>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">
                        URL Target
                    </label>
                    <div class="col-sm-9">
                        <input type="text" id="region-attrs-target" name="region[attrs][target]"   placeholder="blank"/>
                    </div>
                </div>
                <input type="hidden" id="markerModalState" value="1"/>
            </form>
        </div>
        <div class="modal-footer">
            <a href="#" id="markerCancel" class="btn" data-dismiss="modal">Close</a>
            <a href="#" id="markerDelete" class="btn btn-danger" data-dismiss="modal">Remove marker</a>
            <a href="#" id="markerSave" class="btn btn-primary" data-dismiss="modal">Save changes</a>
        </div>
    </div>
