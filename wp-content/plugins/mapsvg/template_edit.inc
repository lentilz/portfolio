<!-- FORM -->

<table id="mapsvg-table-maps" class="table table-striped" style="height: 325px;" width="824">

<table id="mapsvg-table-maps" class="table table-striped" width="100%">

<div id="mapsvg-panels" class="stretch">

        <div class="mapsvg-panel mapsvg-panel-left stretch" id="mapsvg-container">

            <div class="alert alert-warning alert-dismissible" id="mapsvg-auto-id-warning" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <strong>Warning!</strong> Some objects in SVG file are missing their IDs.
                MapSVG generated IDs but please note that if you will edit SVG file later and add/remove some objects,
                it would change objects order and ID references would be lost.
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

            <div id="mapsvg-sizer">
                <div id="mapsvg"></div>
            </div>

        </div>

        <div class="stretch mapsvg-panel mapsvg-panel-right">

            <ul class="nav nav-tabs" id="mapsvg-tabs-menu">
                <li role="presentation" class="dropdown active">
                    <a class="dropdown-toggle active" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                        <i class="fa fa-bars"></i> <span class="menu-name">Menu</span> <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li class="active"><a href="#tab_settings">Settings</a></li>
                        <li><a href="#tab_colors">Colors</a></li>
                        <li><a href="#tab_regions">Regions</a></li>
                        <li><a href="#tab_database">Database</a></li>
                        <li><a href="#tab_layers">Groups</a></li>
                        <li><a href="#tab_google_maps">Google maps</a></li>
                        <li><a href="#tab_directory">Directory</a></li>
                        <li><a href="#tab_details">Details view</a></li>
                        <li><a href="#tab_filters">Filters</a></li>
                        <li><a href="#tab_actions">Actions</a></li>
                        <li><a href="#gallery">Gallery</a></li>
                        <li><a href="#tab_templates">Templates</a></li>
                        <li><a href="#tab_events">JavaScript</a></li>
                        <li><a href="#tab_css">CSS</a></li>
                        <li class="mapsvg-draw-menu-item"><a href="#tab_draw_region">SVG Object</a></li>
                    </ul>
                </li>
            </ul>

            <div id="mapsvg-mapform-container" class="stretch mapsvg-scrollable-content">
                <div class="tab-content" id="mapsvg-tabs">
                    <div class="tab-pane active" id="tab_settings" data-controller="settings"></div>
                    <div class="tab-pane" id="tab_colors" data-controller="colors"></div>
                    <div class="tab-pane" id="tab_regions" data-controller="regions"></div>
                    <div class="tab-pane" id="tab_google_maps" data-controller="googleMaps"></div>
                    <div class="tab-pane tab-markers" id="tab_markers" data-controller="markers"></div>
                    <div class="tab-pane" id="tab_database" data-controller="database"></div>
<!--                    <div class="tab-pane" id="tab_floors" data-controller="floors"></div>-->
                    <div class="tab-pane" id="tab_layers" data-controller="layers"></div>
                    <div class="tab-pane" id="tab_directory" data-controller="directory"></div>
                    <div class="tab-pane" id="tab_details" data-controller="details"></div>
                    <div class="tab-pane" id="tab_filters" data-controller="filters"></div>
                    <div class="tab-pane" id="tab_actions" data-controller="actions"></div>
                    <div class="tab-pane" id="tab_templates" data-controller="templates"></div>
                    <div class="tab-pane" id="tab_events" data-controller="javascript"></div>
                    <div class="tab-pane" id="tab_css" data-controller="css"></div>
                    <div class="tab-pane mapsvg-draw-controller" id="tab_draw_region" data-controller="drawRegion"></div>
                    <div class="tab-pane" id="gallery" data-controller="gallery">
                        <div class="mapsvg-view-padding">
                            <div class="well">
                                Get MapSVG.Gallery add-on: <a href="http://mapsvg.com/add-ons/gallery" target="_blank">mapsvg.com/add-ons/gallery</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
</div>