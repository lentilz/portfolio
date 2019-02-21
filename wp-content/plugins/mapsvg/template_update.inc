<!-- FORM -->

<table id="mapsvg-table-maps" class="table table-striped" style="height: 325px;" width="824">

    <table id="mapsvg-table-maps" class="table table-striped" width="100%">

        <div id="mapsvg-panels" class="stretch  mapsvg-can-update">

            <div class="mapsvg-panel mapsvg-panel-left stretch" id="mapsvg-container">

                <div class="alert alert-info" role="alert" id="mapsvg-can-update-message" style="">
                    <div class="mapsvg-center-vertical">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>
                        Update to version <?php echo $can_update_to?> is required.<br /><br />
                        <button class="btn btn-default mapsvg-update" data-update-to="<?php echo $can_update_to;?>">Update to 3.2.0</button>
                    </div>
                </div>

                <div class="btn-group" data-toggle="buttons" id="mapsvg-map-mode">
                    <label class="btn btn-default btn-xs active" data-mode="preview">
                        <input type="radio" name="mapsvg_map_mode" value="preview" autocomplete="off" checked> Preview
                    </label>
                    <label class="btn btn-default btn-xs" data-mode="editRegions">
                        <input type="radio" name="mapsvg_map_mode" value="editRegions" autocomplete="off"> Edit regions
                    </label>
                    <label class="btn btn-default btn-xs" data-mode="editData">
                        <input type="radio" name="mapsvg_map_mode" value="editData" autocomplete="off"> Edit data
                    </label>
                    <label class="btn btn-default btn-xs disabled" data-mode="editMarkers">
                        <input type="radio" name="mapsvg_map_mode" value="editMarkers" autocomplete="off"> Edit markers
                    </label>
                </div>
                <div id="mapsvg" class="stretch"></div>
            </div>

            <div class="stretch mapsvg-panel mapsvg-panel-right">

                <ul class="nav nav-tabs" id="myTab">
                    <li role="presentation" class="dropdown active">
                        <a class="dropdown-toggle active" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-bars"></i> <span class="menu-name">Menu</span> <span class="caret"></span>
                        </a>
                        <ul class="dropdown-menu">
                            <li class="active"><a href="#tab_settings">Settings</a></li>
                            <li><a href="#tab_colors">Colors</a></li>
                            <li><a href="#tab_regions">Regions</a></li>
                            <!--                        <li><a href="#tab_markers">Markers</a></li>-->
                            <li><a href="#tab_database">Database</a></li>
                            <li><a href="#tab_directory">Directory</a></li>
                            <li><a href="#tab_details">Details view</a></li>
                            <li><a href="#tab_filters">Filters</a></li>
                            <li><a href="#tab_actions">Actions</a></li>
                            <li><a href="#tab_templates">Templates</a></li>
                            <li><a href="#tab_events">JavaScript</a></li>
                            <li><a href="#tab_css">CSS</a></li>
                        </ul>
                    </li>
                </ul>

                <div id="mapsvg-mapform-container" class="stretch mapsvg-scrollable-content">
                    <div class="tab-content" id="mapsvg-tabs">
                        <div class="tab-pane active" id="tab_settings" data-controller="settings"></div>
                        <div class="tab-pane" id="tab_colors" data-controller="colors"></div>
                        <div class="tab-pane" id="tab_regions" data-controller="regions"></div>
                        <div class="tab-pane tab-markers" id="tab_markers" data-controller="markers"></div>
                        <div class="tab-pane" id="tab_database" data-controller="database"></div>
                        <div class="tab-pane" id="tab_directory" data-controller="directory"></div>
                        <div class="tab-pane" id="tab_details" data-controller="details"></div>
                        <div class="tab-pane" id="tab_filters" data-controller="filters"></div>
                        <div class="tab-pane" id="tab_actions" data-controller="actions"></div>
                        <div class="tab-pane" id="tab_templates" data-controller="templates"></div>
                        <div class="tab-pane" id="tab_events" data-controller="javascript"></div>
                        <div class="tab-pane" id="tab_css" data-controller="css"></div>
                    </div>
                </div>

            </div>
        </div>