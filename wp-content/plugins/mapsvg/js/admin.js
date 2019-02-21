/**
 * MapSvg Builder javaScript
 * Version: 2.0.0
 * Author: Roman S. Stepanov
 * http://codecanyon.net/user/RomanCode/portfolio
 */
(function( $ ) {

    if(!$._button)
        $._button = $.button;

    $.fn.inputToObject = function(formattedValue) {

        var obj = {};

        function add(obj, name, value){
            //if(!addEmpty && !value)
            //    return false;
            if(name.length == 1) {
                obj[name[0]] = value;
            }else{
                if(obj[name[0]] == null)
                    obj[name[0]] = {};
                add(obj[name[0]], name.slice(1), value);
            }
        }

        if($(this).attr('name') && !($(this).attr('type')=='radio' && !$(this).prop('checked'))){
            add(obj, $(this).attr('name').replace(/]/g, '').split('['), formattedValue);
        }

        return obj;
    };

    MapSVG.isMac = function(){
        return navigator.platform.toUpperCase().indexOf('MAC')>=0;
    };
    MapSVG.isValidURL = function(url) {
        return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
    };


    var WP = true; // required for proper positioning of control panel in WordPress
    var msvg;
    var editingMark;
    var _data = {}, _this = {};
    _data.optionsDelta = {};
    _data.optionsMode = {
        preview : {
            responsive: true,
            disableLinks: true
        },
        editRegions : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-1000,1000]},
            scroll: {on: true},
            onClick: null,
            mouseOver: null,
            mouseOut: null,
            tooltips: {
                on: true
            },
            templates: {
                tooltipRegion: '<b>{{id}}</b>{{#if title}}: {{title}} {{/if}}'
            },
            popovers: {
                on : false
            },
            actions: {
                region: {
                    click: {
                        showDetails: false,
                        filterDirectory: false,
                        loadObjects: false,
                        showPopover: false,
                        goToLink: false
                    }
                },
                marker: {
                    click: {
                        showDetails: false,
                        showPopover: false,
                        goToLink: false
                    }
                }
            }
        },
        draw : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-10,10]},
            scroll: {on: true, spacebar: true},
            mouseOver: null,
            mouseOut: null,
            colorsIgnore: true,
            // colors: {
            //     base: ''
            // },
            tooltips: {
                on: false
            },
            popovers: {
                on : false
            },
            actions: {
                region: {
                    click: {
                        showDetails: false,
                        filterDirectory: false,
                        loadObjects: false,
                        showPopover: false,
                        goToLink: false
                    }
                },
                marker: {
                    click: {
                        showDetails: false,
                        showPopover: false,
                        goToLink: false
                    }
                }
            }
        },
        editData : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-1000,1000]},
            scroll: {on: true},
            actions: {
                region: {
                    click: {
                        showDetails: false,
                        filterDirectory: true,
                        loadObjects: false,
                        showPopover: false,
                        goToLink: false
                    }
                },
                marker: {
                    click: {
                        showDetails: false,
                        showPopover: false,
                        goToLink: false
                    }
                }
            },
            // onClick: function(){
            //     var region = this;
            //     $('#mapsvg-tabs-menu a[href="#tab_database"]').tab('show');
            //     var filter = {};
            //     if(region.mapsvg_type == 'region'){
            //         filter.region_id = region.id;
            //     }else if(region.mapsvg_type == 'marker'){
            //         filter.id = region.databaseObject.id;
            //
            //     }
            //     _data.controllers.database.setFilters(filter);
            // },
            // mouseOver: null,
            // mouseOut: null,
            tooltips: {
                on: true
            },
            templates: {
                tooltipRegion: '<b>{{id}}</b> Data objects: {{data.length}}',
                tooltipMarker: 'DB Object id: <b>{{id}}</b> (Click to edit)',
            },
            popovers: {
                on : false
            }
        },
        editMarkers : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-1000,1000]},
            scroll: {on: true},
            onClick: null,
            mouseOver: null,
            mouseOut: null,
            tooltips: {
                on: true
            },
            templates: {
                tooltipMarker: 'DB Object id: <b>{{id}}</b> (Click to edit)',
            },
            popovers: {
                on: false
            },
            actions: {
                region: {
                    click: {
                        showDetails: false,
                        filterDirectory: true,
                        loadObjects: false,
                        showPopover: false,
                        goToLink: false
                    }
                },
                marker: {
                    click: {
                        showDetails: false,
                        showPopover: false,
                        goToLink: false
                    }
                }
            }
        }
    };
    _data.mode = "preview";


    methods = {

        getData : function(){
          return _data;
        },
        getMapId: function(){
          return _data.options.map_id;
        },
        selectCheckbox : function (){
            c = $(this).attr('checked') ? true : false;
            $('.region_select').removeAttr('checked');
            if(c)
                $(this).attr('checked','true');
        },
        disableAll : function (){
            c = $(this).attr('checked') ? true : false;
            if(c)
                $('.region_disable').attr('checked','true');
            else
                $('.region_disable').removeAttr('checked');
        },
        save : function (skipMessage){
            var form = $(this);
            $('#mapsvg-save')._button('loading');
            var options = msvg.getOptions(false, null, _data.optionsDelta);
            var data = {mapsvg_data: MapSVG.convertToText(options), title: options.title, map_id: _data.options.map_id, region_prefix: options.regionPrefix, source: options.source };
            // Apache mod_sec blocks requests with the following words:
            // table, select, database. Encode those words to decode them later in PHP to prevent blocking:
            data.mapsvg_data = data.mapsvg_data.replace(/select/g,"!mapsvg-encoded-slct");
            data.mapsvg_data = data.mapsvg_data.replace(/table/g,"!mapsvg-encoded-tbl");
            data.mapsvg_data = data.mapsvg_data.replace(/database/g,"!mapsvg-encoded-db");
            data.mapsvg_data = data.mapsvg_data.replace(/varchar/g,"!mapsvg-encoded-vc");

            if(_this.mapsvgCssChanged)
                data.css = _this.mapsvgCss;

            return $.post(ajaxurl, {action: 'mapsvg_save',_wpnonce: _data.options._wpnonce, data: data}, function(id){
                if($.isNumeric(id)){
                    var t = _data.options._wpnonce.split('-');
                    t[1] = id;
                    _data.options._wpnonce = t.join('-');
                    var msg = 'Settings saved';
                    $('#map-page-title').html(options.title);
                    if(_data.options.map_id=='new'){
                        $('#mapsvg-shortcode').html('[mapsvg id="'+id+'"]');
                        msg += '. Shortcode: [mapsvg id="'+id+'"]';
                        _data.options.map_id = id;
                        msvg.id = id;
                    }
                }else{
                    msg = "Error!"
                }
                !skipMessage && $.growl.notice({title: "", message: msg});
            }).always(function(){
                $('#mapsvg-save')._button('reset');
            }).fail(function(){
                $.growl.error({message: 'Server error: settings were not saved'});
            });
        },

        mapDelete : function(e){
            e.preventDefault();

            var nonce     = $(this).data('nonce');
            var table_row = $(this).closest('tr');
            var id = table_row.attr('data-id');
            table_row.fadeOut();
            $.post(ajaxurl, {action: 'mapsvg_delete', _wpnonce: nonce, id: id}, function(){
            });
        },
        mapCopy : function(e){

            e.preventDefault();

            var nonce     = $(this).data('nonce');
            var table_row = $(this).closest('tr');
            var id        = table_row.attr('data-id');
            var map_title = table_row.attr('data-title');

            if(!(new_name = prompt('Enter new map title', map_title+' - copy')))
                return false;

            $.post(ajaxurl, {'action': 'mapsvg_copy', _wpnonce: nonce, 'id': id, 'new_name': new_name}, function(new_id){
                var new_row = table_row.clone();

                var map_link = '?page=mapsvg-config&map_id='+new_id;
                new_row.attr('data-id', new_id).attr('data-title', new_name);
                new_row.find('.mapsvg-map-title a').attr('href', map_link).html(new_name);
                new_row.find('.mapsvg-action-buttons a.mapsvg-button-edit').attr('href', map_link);
                new_row.find('.mapsvg-shortcode').html('[mapsvg id="'+new_id+'"]');
                new_row.prependTo(table_row.closest('tbody'));
            });
        },
        mapUpdate : function(e){
            e.preventDefault();
            var btn = $(this);
            var table_row = $(this).closest('tr');
            var map_id = table_row.length ? table_row.attr('data-id') : msvg.id;

            var update_to = $(this).data('update-to');
            jQuery.get(ajaxurl, {action: "mapsvg_get", id: map_id}, function (data) {
                var disabledRegions = [];
                eval('var options = ' + data);
                if(options.regions){
                    for (var id in options.regions){
                        if(options.regions[id].disabled)
                            disabledRegions.push(id);
                    }
                }
                $.post(ajaxurl, {action: 'mapsvg_update',
                                 id: map_id,
                                 update_to: update_to,
                                 disabledRegions: disabledRegions,
                                 disabledColor: options.colors && options.colors.disabled!==undefined? options.colors.disabled : ''
                }, function(){
                    btn.fadeOut();
                    if(!table_row.length)
                        window.location.reload();
                }).fail(function(){
                    $.growl.error({title: "Server Error", message: 'Can\'t update the map'});
                });
            });

        },
        markerEditHandler : function(updateGeoCoords){
            editingMark = this.getOptions();
            // var markerForm = $('#table-markers').find('#mapsvg-marker-'+editingMark.id);
            // $('#mapsvg-tabs-menu a[href="#tab_markers"]').tab('show');
            if(hbData.isGeo && updateGeoCoords){
                // if(markerForm.length)
                //     markerForm.find('.mapsvg-marker-geocoords a').html(this.geoCoords.join(','));
                if(editingMark.attached && editingMark.dataId){
                    var obj = msvg.database.getLoadedObject(editingMark.dataId);
                    msvg.database.update(obj);
                }
                // $('.nano').nanoScroller({scrollTo: markerForm});
            }else{
                // if(!markerForm.length){
                //     editingMark.isSafari = hbData.isSafari;
                    // _data.controllers.markers.addMarker(editingMark);
                    // _this.updateScroll();
                    // $('.nano').nanoScroller({scroll: 'top'});
                // }else{
                //     $('.nano').nanoScroller({scrollTo: markerForm});
                // }
            }
        },
        regionEditHandler : function(){
            var region = this;
            var row = $('#mapsvg-region-'+region.id_no_spaces);
            $('#mapsvg-tabs-menu a[href="#tab_regions"]').tab('show');
            _data.controllers.regions.controllers.list.editRegion(region, true);
        },
        dataEditHandler : function(){
            var region = this;
            $('#mapsvg-tabs-menu a[href="#tab_database"]').tab('show');
            var filter = {};
            if(region instanceof Region){
                filter.region_id = region.id;
            }else if(region instanceof Marker){
                filter.id = region.object.id;
            }
            _data.controllers.database.controllers.list.setFilters(filter);
        },
        resizeDashboard : function(){
           // var w = _data.iframeWindow.width();
           var w = $('#wpbody-content').width();
           var top = $('#wpadminbar').height();
           var left = $(window).width() - w;
           var h = $(window).height()-top;
            $('#mapsvg-admin').css({width: w, height: h, left: left, top : top});
            _this.resizeSVGCanvas();
           // _this.updateScroll();
        },
        resizeSVGCanvas : function(){

            if(!msvg){
                return;
            }

            var l = $('#mapsvg-container');
            var v = msvg && msvg.getData().viewBox;


            var mapRatio = v[2]/v[3];
            var containerRatio = l.width() / l.height();

            // if(Math.round(v[3]*msvg.getScale()) >= l.height()){
            if(mapRatio < containerRatio){
                var newWidth = mapRatio * l.height();
                var per = Math.round((newWidth*100)/l.width())-1;
                $('#mapsvg-sizer').css({width: per+'%'});
                // msvg.getData().$wrap.css({width: per+'%'});
            }else{
                $('#mapsvg-sizer').css({width: 'auto'});
                // msvg.getData().$wrap.css({width: 'auto'});
            }
        },
        setPreviousMode : function(){
            if(_data.previousMode)
                _this.setMode(_data.previousMode);
        },
        setMode : function(mode, dontSwitchTab){
            if(_data.mode == mode)
                return;

            if(_data.mode == 'draw'){
                if(_data.controllers.draw.changed && !confirm('Changes in SVG file will be lost. Continue?')){
                    jQuery('#mapsvg-map-mode-2 label').toggleClass('active',false);
                    jQuery('#mapsvg-map-mode-2 input').prop('checked',false);
                    jQuery('#mapsvg-map-mode-2 [data-mode="draw"]').toggleClass('active',true);
                    jQuery('#mapsvg-map-mode-2 [data-mode="draw"] input').prop('checked',true);
                    return;
                }else{
                    _data.controllers.draw.revert();
                }
                _this.unloadController(_data.controllers.draw);
            }

            _data.previousMode = _data.mode;
            _data.mode = mode;
            // save settings from previous "dirty" state
            msvg.update(_data.optionsDelta);
            // get current all saved settings
            var currentOptions = msvg.getOptions();
            _data.optionsDelta = {};
            // remember all settings which are going to be changed in mode
            // into options delta
            $.each(_data.optionsMode[_data.mode],function(key, options){
                _data.optionsDelta[key] = currentOptions[key] !== undefined ? currentOptions[key] : null;
            });

            msvg.update(_data.optionsMode[mode]);
            var _mode = mode;
            $('#mapsvg-map-mode').find('label').removeClass('active').find('input').prop('checked',false);
            var btn = $('#mapsvg-map-mode').find('label[data-mode="'+_mode+'"]');
            btn.addClass('active');

            $('body').off('click.switchTab');

            msvg.off('zoom');


            if (mode=="editRegions") {
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(true);
                msvg.setDataEditMode(false);
                _this.setDrawMode(false);
                msvg.getData().$map.addClass('mapsvg-edit-regions');
                // !dontSwitchTab && $('#mapsvg-tabs-menu a[href="#tab_regions"]').tab('show');
                $('body').on('click.switchTab','.mapsvg-region', function(){
                    $('#mapsvg-tabs-menu a[href="#tab_regions"]').tab('show');
                });
            } else if(mode=="draw") {
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(false);
                msvg.setDataEditMode(false);
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
                _this.setDrawMode(true);
            } else if(mode=="editMarkers") {
                msvg.setMarkersEditMode(true);
                msvg.setRegionsEditMode(false);
                msvg.setDataEditMode(false);
                _this.setDrawMode(false);
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
                // !dontSwitchTab && $('#mapsvg-tabs-menu a[href="#tab_markers"]').tab('show');
            } else if(mode=="editData") {
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(false);
                msvg.setDataEditMode(true);
                _this.setDrawMode(false);
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
                $('body').on('click.switchTab','.mapsvg-region',function(){
                    $('#mapsvg-tabs-menu a[href="#tab_database"]').tab('show');
                });
                $('body').on('click.switchTab','.mapsvg-marker',function(){
                    $('#mapsvg-tabs-menu a[href="#tab_database"]').tab('show');
                    var marker = msvg.getMarker($(this).prop('id'));
                    _data.controllers.database.controllers.list.editDataObject(marker.object.id, true);
                });
            } else {
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(false);
                msvg.setDataEditMode(false);
                // msvg.viewBoxReset(true);
                _this.setDrawMode(false);
                _this.resizeSVGCanvas();
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
            }
            $('#mapsvg-admin').attr('data-mode', mode);
            if(_data.previousMode=='draw'){
                _this.loadController('tab_settings','settings');
            }
        },
        setDrawMode : function(on){
          var _this = this;
          if(on){
              if(!_data.controllers.draw){
                  _data.controllers.draw = new MapSVGAdminDrawController('mapsvg-container', _this, msvg);
                  _data.controllers.draw.viewDidAppear();
              }else{
                  _data.controllers.draw.show();
                  _data.controllers.draw.viewDidAppear();
              }
          }else{
              _data.controllers.draw && _data.controllers.draw.close();
          }
        },
        enableMarkersMode : function(on) {
            var mode = $('#mapsvg-map-mode').find('[data-mode="editMarkers"]');
            if(on){
                $('#mapsvg-map-mode').find('label').addClass('disabled');
                mode.removeClass('disabled').find('input');
            }else{
                // if(_data.mode == 'editMarkers')
                //     _this.setMode('preview');
                $('#mapsvg-map-mode').find('label').removeClass('disabled');
                mode.addClass('disabled').find('input');
            }
        },
        addHandlebarsMethods : function(){

        },
        getPostTypes : function(){
            return _data.options.post_types;
        },
        togglePanel : function(panelName, visibility){
            if(!visibility)
                $('#mapsvg-panels').addClass('hide-'+panelName);
            else
                $('#mapsvg-panels').removeClass('hide-'+panelName);

            var btn = $('#mapsvg-panels-view-'+panelName);
            if(btn.hasClass('active') != visibility){
                if(visibility)
                    btn.addClass('active');
                else
                    btn.removeClass('active');
                btn.prop('checked',visibility);
            }

        },
        rememberPanelsState : function(){
            _data.panelsState = {};
            _data.panelsState.left = !$('#mapsvg-panels').hasClass('hide-left');
            _data.panelsState.right = !$('#mapsvg-panels').hasClass('hide-right');
        },
        restorePanelsState : function(){
            for(var panelName in _data.panelsState){
                _this.togglePanel(panelName, _data.panelsState[panelName]);
            }
            _data.panelsState = {};
        },
        setEventHandlers : function(){

            $('body').on('mousewheel','.jspContainer',
                    function(e) {
                        e.preventDefault();
                    }
                );

            $(window).on('keydown.save.mapsvg', function(e) {
                if((e.metaKey||e.ctrlKey) && e.keyCode == 83){
                    e.preventDefault();
                    _data.mode != 'draw' ? _this.save() : _data.controllers.draw.saveSvg();
                }
            });

            _data.view.on('click', '#mapsvg-save', function(){_this.save()})
                      .on('change', '#mapsvg-map-mode :radio',function(){
                        var mode = $('#mapsvg-map-mode :radio:checked').val();
                        _this.setMode(mode);
                      }).on('click','button',function(e) {
                        e.preventDefault();
                      });
            _data.view.on('change', '#mapsvg-map-mode-2 :radio',function() {
                var mode = $('#mapsvg-map-mode-2 :radio:checked').val();
                _this.setMode(mode);
            });
            $('#mapsvg-view-buttons').on('change','[type="checkbox"]',function(){
                var visible = $(this).prop('checked');
                var name = $(this).attr('name');
                _this.togglePanel(name, visible);
            });

            $('#mapsvg-tabs-menu').on('click', 'a', function(e){
                e.preventDefault();
                $(this).tab('show');
            });

            $('#mapsvg-tabs-menu').on('shown.bs.tab', 'a', function (e){
                $('#mapsvg-tabs-menu .menu-name').html( $(this).text() );
                var h = $(this).attr('href');
                _this.resizeDashboard();
                var controllerContainer = $(h);
                var containerId = h.replace('#','');
                var controller = controllerContainer.attr('data-controller');
                _this.loadController(containerId, controller);
            });
        },
        addController: function(menuTitle, controllerName, menuPositionAfter){
            if(!$('#'+controllerName).length){
                var menu = $('#mapsvg-tabs-menu .dropdown-menu');
                var after = menu.find('a[href="#'+menuPositionAfter+'"]').parent();
                $('<li><a href="#'+controllerName+'">'+menuTitle+'</a></li>').insertAfter(after);
                $('#mapsvg-tabs').append('<div class="tab-pane" id="'+controllerName+'" data-controller="'+controllerName+'"></div>');
            }
        },
        loadController: function(containerId, controllerName){

            if(_data.currentController && _data.currentController == _data.controllers[controllerName])
                return;

            if(!_data.controllers[controllerName]){
                var capitalized = controllerName.charAt(0).toUpperCase() + controllerName.slice(1);
                _data.controllers[controllerName] =  new window['MapSVGAdmin'+capitalized+'Controller'](containerId, _this, msvg);
            }

            _data.currentController && _data.currentController.viewDidDisappear();
            _data.currentController = _data.controllers[controllerName];
            _data.currentController.viewDidAppear();

            if(!$('#'+containerId).attr('data-controller')){
                $('#'+containerId).attr('data-controller', controllerName);
            }
            if(!$('#'+containerId).hasClass('active')){
                $('#mapsvg-tabs-menu a[href="#'+containerId+'"]').tab('show');
            }

            return _data.currentController;
        },
        unloadController: function(controllerObjectOrName){
            if (typeof controllerObjectOrName != 'string')
                controllerObjectOrName = controllerObjectOrName.nameCamel();
            _data.controllers[controllerObjectOrName].destroy();
            _data.controllers[controllerObjectOrName] = null;
            _data.currentController = null;

            if(controllerObjectOrName == 'draw'){
                _data.controllers['drawRegion'] = null;
            }
        },
        init : function(options){

            if(MapSVG.isMac()){
                $('body').addClass('mapsvg-os-mac');
            }else{
                $('body').addClass('mapsvg-os-other');
            }

            _data.options = options;
            _data.controllers = {};
            _data.view = $('#mapsvg-admin');

            var onEditMapScreen = _data.options.mapsvg_options.source ? true : false;

            $(document).ready(function(){

                // Position control panel in WordPress
                if(WP && onEditMapScreen){
                    // Append an iFrame to the page.
                    // _data.iframe = $('#stretchIframe');

                    // Called once the Iframe's content is loaded.
                    // The Iframe's child page BODY element.
                    // Bind the resize event. When the iframe's size changes, update its height as
                    // well as the corresponding info div.
                    new MapSVG.ResizeSensor($('#adminmenuwrap')[0], function(){
                        setTimeout(function(){
                            _this.resizeDashboard();
                        },200);
                    });
                    new MapSVG.ResizeSensor($('#wpwrap')[0], function(){
                        setTimeout(function(){
                            _this.resizeDashboard();
                        },200);
                    });
                    new MapSVG.ResizeSensor($('#mapsvg')[0], function(){
                        setTimeout(function(){
                            _this.resizeDashboard();
                        },200);
                    });
                    // _data.iframeWindow = $(_data.iframe[0].contentWindow);//iframe.contents().find('body');
                    // _data.iframeWindow.on('resize',function(){
                    //     var elem = $(this);
                    //     _this.resizeDashboard();
                    // });
                    // $(window).on('resize',function(){
                    //     _this.resizeDashboard();
                    // });
                    _this.resizeDashboard();
                }

                _data.view.tooltip({
                    selector: '.toggle-tooltip'
                });

                $('body')
                    .on('click', '.mapsvg-update', methods.mapUpdate);


                if(onEditMapScreen){

                    _this.addHandlebarsMethods();

                    var originalAferLoad = _data.options.mapsvg_options.afterLoad;

                    _data.options.mapsvg_options.backend = true;

                    // Load control panel after the map loads
                    _data.options.mapsvg_options.afterLoad = function(){

                        if(!window.m){
                            window.m = msvg;
                        }

                        msvg.database.setSchema(_data.options.mapsvg_schema_database);
                        msvg.regionsDatabase.setSchema(_data.options.mapsvg_schema_regions);

                        msvg.setMarkerEditHandler(methods.markerEditHandler);
                        msvg.setRegionEditHandler(methods.regionEditHandler);
                        msvg.setAfterLoad(originalAferLoad);
                        // var source = $("#mapsvg-control-panel").html();

                        hbData = msvg.getOptions(true);
                        _this.hbData = hbData;
                        if(msvg.getData().presentAutoID){
                            $('#mapsvg-auto-id-warning').show();
                        }

                        _this.setMode('preview');

                        hbData.isGeo = msvg.getData().mapIsGeo;
                        if(hbData.isGeo){
                            $('#mapsvg-admin').addClass('mapsvg-is-geo');
                        }
                        window.markerImages = _data.options.markerImages || [];
                        window.defaultMarkerImage = (_data.options.markerImages && _data.options.markerImages.length)
                            ? _data.options.markerImages[0].url : '';

                        // Safary is laggy when there are many input fields in a form. We'll need
                        // to wrap each input with <form /> tag
                        hbData.isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                            navigator.userAgent && !navigator.userAgent.match('CriOS');
                        hbData.title = _data.options.map_title;
                        if(!hbData.title){
                            hbData.title = hbData.svgFilename.split('.');
                            hbData.title.pop();
                            hbData.title = hbData.title.join('.');
                            hbData.title = hbData.title.charAt(0).toUpperCase() + hbData.title.substr(1);
                        }

                        msvg.update({title: hbData.title});

                        if(_data.options.mapsvg_options.extension &&  $().mapSvg.extensions && $().mapSvg.extensions[_data.options.mapsvg_options.extension]){
                            var ext = $().mapSvg.extensions[_data.options.mapsvg_options.extension];
                            ext && ext.backend(msvg, _this);
                        }

                        // Preload
                        _data.controllers.settings = new MapSVGAdminSettingsController('tab_settings', _this, msvg);
                        _data.controllers.database = new MapSVGAdminDatabaseController('tab_database', _this, msvg);
                        _data.controllers.regions = new MapSVGAdminRegionsController('tab_regions', _this, msvg);

                        _data.view.find('.mapsvg-select2').select2({
                            minimumResultsForSearch: 20
                        });
                        $(document).on('focus', '.select2-selection--single', function(e) {
                            select2_open = $(this).parent().parent().prev('select');
                            select2_open.select2('open');
                        });

                        // Wrap input into form for Safari, otherwise form will be very slow
                        if (hbData.isSafari){
                            _data.view.find('input[type="text"]').closest('.form-group').wrap('<form />');
                        }

                        _this.setEventHandlers();
                        _this.resizeDashboard();

                        try {
                            originalAferLoad(msvg);
                        } catch(err){

                        }

                        if(_data.options.mapsvg_options.extension &&  $().mapSvg.extensions && $().mapSvg.extensions[_data.options.mapsvg_options.extension]){
                            var ext = $().mapSvg.extensions[_data.options.mapsvg_options.extension];
                            ext && ext.backendAfterLoad(msvg);
                        }

                    };

                    _data.options.mapsvg_options.db_map_id = _this.getMapId();
                    _data.options.mapsvg_options.editMode = true;
                    if(!_data.options.mapsvg_options.googleMaps){
                        _data.options.mapsvg_options.googleMaps = {};
                    }
                    if(!_data.options.mapsvg_options.googleMaps.apiKey && _data.options.mapsvg_google_api_key){
                        _data.options.mapsvg_options.googleMaps = {apiKey: _data.options.mapsvg_google_api_key};
                    }
                    _data.options.mapsvg_options.googleMaps.apiKey = _data.options.mapsvg_google_api_key;
                    msvg = $("#mapsvg").mapSvg(_data.options.mapsvg_options);
                    return _this;

                }else{
                    $(".select-map-list").select2().on("select2:select",function(){
                        var link = $(this).find("option:selected").data('link');
                        if (link)
                            window.location = link+'&noheader=true';
                    });

                    var files = [];
                    $('#svg_file_uploader').on('change',function(event){
                         $.each(event.target.files, function(index, file) {
                                if(file.type.indexOf('svg')==-1){
                                    alert('You can upload only SVG files');
                                    return false;
                                }
                                var reader = new FileReader();
                                reader.onload = function(event) {
                                    object = {};
                                    object.filename = file.name;
                                    object.data = event.target.result;
                                    var data = $('<div>' + object.data + '</div>');
                                    var gm = data.find('#mapsvg-google-map-background');
                                    if(gm.length){
                                        var remove = confirm('Remove Google Maps background image from SVG file?');
                                        if(remove)
                                            data.find('#mapsvg-google-map-background').remove();
                                    }
                                    object.data = data.html();
                                    object.data.replace('<!--?xml', '<?xml');
                                    object.data.replace('"no"?-->', '"no"?>');
                                    object.data.replace('mapsvg:geoviewbox', 'mapsvg:geoViewBox');

                                    files.push(object);
                                    $("#svg_file_uploader_form").submit();
                                };
                                reader.readAsText(file);
                         });
                    });
                    $("#svg_file_uploader_form").on('submit', function(form) {
                        $.each(files, function(index, file) {
                            $.ajax({
                                url: ajaxurl,
                                type: 'POST',
                                data: {action: 'mapsvg_upload', filename: file.filename, data: file.data}
                            }).done(function(filename, status, xhr) {
                                    $.growl.notice({title: "", message: 'File uploaded'});
                                    var o = $('#mapsvg-svg-file-select').find('[data-link="?page=mapsvg-config&map_id=new&package=uploads&path='+filename+'"]');
                                    if(!o.length)
                                        $('#mapsvg-svg-file-select').append('<option data-link="?page=mapsvg-config&map_id=new&package=uploads&path='+filename+'">user-uploads/'+filename+'</option>');
                                });
                        });
                        files = [];
                        form.preventDefault();
                    });

                    var imgfiles = [];

                    $('#image_file_uploader').on('change',function(event){
                         $.each(event.target.files, function(index, file) {
                                 if(['image/png','image/jpeg'].indexOf(file.type)==-1){
                                     alert('Supported file types: png / jpeg');
                                     return false;
                                 }

                                var reader = new FileReader();
                                reader.onload = function(event) {

                                    var pngBase64 = event.target.result;
                                    var image = new Image();

                                    image.onload = function() {
                                        object = {};
                                        var timestamp = new Date().valueOf();
                                        object.filename = file.name+'_'+timestamp+'.svg';
                                        object.data = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'+"\n"+
                                            '<svg ' +
                                            'xmlns:mapsvg="http://mapsvg.com" ' +
                                            'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
                                            'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
                                            'xmlns:cc="http://creativecommons.org/ns#" ' +
                                            'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
                                            'xmlns:svg="http://www.w3.org/2000/svg" ' +
                                            'xmlns="http://www.w3.org/2000/svg" ' +
                                            'version="1.1" ' +
                                            'width="' + this.width + '" ' +
                                            'height="' + this.height + '"> ' +
                                            '<image id="mapsvg-image-background" class="mapsvg-image-background" xlink:href="' + pngBase64 + '"  x="0" y="0" height="' + this.height + '" width="' + this.width + '"></image>' +
                                            '</svg>';
                                        imgfiles.push(object);
                                        $("#image_file_uploader_form").submit();
                                    };
                                    image.src = pngBase64;
                                };
                                reader.readAsDataURL(file);
                         });
                    });
                    $("#image_file_uploader_form").on('submit', function(form) {
                        $.each(imgfiles, function(index, file) {
                            $.ajax({
                                url: ajaxurl,
                                type: 'POST',
                                data: {action: 'mapsvg_upload', filename: file.filename, data: file.data}
                            }).done(function(data, status, xhr) {
                                window.location.href = '?page=mapsvg-config&map_id=new&package=uploads&path='+file.filename+'&noheader=true';
                            });
                        });
                        imgfiles = [];
                        form.preventDefault();
                    });

                    $("#new-google-map").on('click', function(e) {
                        // e.preventDefault();
                        if(!_data.options.mapsvg_google_api_key){
                            $('#myModal').modal().show();
                            return false;
                        }
                    });
                    $("#download_gmap").on('click', function() {
                        if(!_data.options.mapsvg_google_api_key){
                            $('#myModal').modal().show();
                        }else{
                            _this.showGoogleMapDownloader();
                        }
                    });

                    $("#save-api-key").on('click', function() {
                        var key = $('#mapsvg-google-api-key').val();
                        var key2 = $('#mapsvg-google-geocoding-api-key').val();
                        if(key && key.length){
                            $.post(ajaxurl, {action: 'mapsvg_save_google_api_key', maps_api_key: key, geocoding_api_key: key2}).done(function(data){
                                data = JSON.parse(data);
                                if(data.ok){
                                    $('#myModal').modal('hide');
                                    _data.options.mapsvg_google_api_key = key;
                                }else{
                                    alert("Error");
                                }
                            });
                        }
                    });


                    $('#mapsvg-table-maps')
                        .on('click', 'a.mapsvg-delete', methods.mapDelete)
                        .on('click', 'a.mapsvg-copy', methods.mapCopy);
                }
          });
            return _this;
        },
        showGoogleMapDownloader: function(){
            // _this.mapsvg.initGoogleMaps.done(function(googleMaps){
            if(!_this.googleMapsFullscreenWrapper){
                _this.googleMapsFullscreenWrapper = $('#mapsvg-google-map-fullscreen-wrap');
                // _this.googleMapsFullscreen = $('<div id="mapsvg-google-map-fullscreen"></div>').appendTo(_this.googleMapsFullscreenWrapper);
                // _this.googleMapsFullscreenControls = $('<div id="mapsvg-google-map-fullscreen-controls" class="well">Zoom-in to desired area and click the button:<br /> <a class="btn btn-default" id="mapsvg-gm-download">Download SVG file</a></div>').appendTo(_this.googleMapsFullscreenWrapper);
                _this.googleMapsFullscreenWrapper.on('click','#mapsvg-gm-download', function(e){
                    e.preventDefault();
                    var link = $(this);
                    var _w = window;

                    // blank space fix
                    /*
                    var transform=$(".gm-style>div:first>div").css("transform")
                    var comp=transform.split(",") //split up the transform matrix
                    var mapleft=parseFloat(comp[4]) //get left value
                    var maptop=parseFloat(comp[5])  //get top value
                    $(".gm-style>div:first>div").css({ //get the map container. not sure if stable
                        "transform":"none",
                        "left":mapleft,
                        "top":maptop
                    });
                    */



                    html2canvas($('#mapsvg-google-map-fullscreen > div > div.gm-style > div:nth-child(1)')[0], {
                        useCORS: true,
                        onrendered: function(canvas) {

                            var dataUrl = canvas.toDataURL("image/png");
                            var bounds = _this.gm.getBounds().toJSON();
                            bounds = [bounds.west, bounds.north, bounds.east, bounds.south];

                            $.post(ajaxurl, {action: 'mapsvg_download_svg', png: dataUrl, bounds: bounds, width: canvas.width, height: canvas.height}).done(function(data){
                                location.href=(data);
                            });
                            // blank space fix back
                            /*
                            $(".gm-style>div:first>div").css({
                                left:0,
                                top:0,
                                "transform":transform
                            })*/
                        }
                    });
                }).on('click','#mapsvg-gm-close', function(){
                    _this.googleMapsFullscreenWrapper.hide();
                    $('body').css('overflow', 'auto');
                });
            }

            _this.googleMapsFullscreenWrapper.show();
            $('body').css('overflow', 'hidden');

            if(!_this.gmloaded){


                var locations = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('formatted_address'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: ajaxurl+'?action=mapsvg_geocoding&address=%QUERY%',
                        // url: 'https://maps.googleapis.com/maps/api/geocode/json?key='+_data.options.mapsvg_google_api_key+'&address=%QUERY%&sensor=true',
                        wildcard: '%QUERY%',
                        transform: function(response) {
                            if(response.error_message){
                                alert(response.error_message);
                            }
                            return response.results;
                        },
                        rateLimitWait: 500
                    }
                });
                var thContainer = _this.googleMapsFullscreenWrapper.find('#mapsvg-gm-address-search');
                var tH = thContainer.typeahead(null, {
                    name: 'mapsvg-addresses',
                    display: 'formatted_address',
                    source: locations,
                    minLength: 2
                });
                thContainer.on('typeahead:select',function(ev,item){
                    var b = item.geometry.bounds ? item.geometry.bounds : item.geometry.viewport;
                    var bounds = new google.maps.LatLngBounds(b.southwest, b.northeast);
                    _this.gm.fitBounds(bounds);
                });
                // $('#mapsvg-gm-address-search').on('focus', function(){
                //     $(this).select();
                // });

                _this.gmapikey = _data.options.mapsvg_google_api_key;
                window.gm_authFailure = function() {
                    if(MapSVG.GoogleMapBadApiKey){
                        MapSVG.GoogleMapBadApiKey();
                    }else{
                        alert("Google Maps API key is incorrect.");
                    }
                };
                _data.googleMapsScript = document.createElement('script');
                _data.googleMapsScript.onload = function(){
                    // _data.googleMaps.loaded = true;
                    // if(typeof callback == 'function')
                    //     callback();
                    _this.loadgm();
                };

                _data.googleMapsScript.src = 'https://maps.googleapis.com/maps/api/js?key='+_this.gmapikey;//+'&callback=initMap';

                document.head.appendChild(_data.googleMapsScript);
                _this.gmloaded = true;
            }else{
                _this.loadgm();
            }



            // });
        },
        loadgm: function(){
            _this.gm = new google.maps.Map($('#mapsvg-google-map-fullscreen')[0], {
                zoom: 2,
                center: new google.maps.LatLng(-34.397, 150.644),
                mapTypeId: 'roadmap',
                fullscreenControl: false,
                // keyboardShortcuts: true,
                mapTypeControl: true,
                scaleControl: true,
                scrollwheel: true,
                streetViewControl: false,
                zoomControl: true
            });
        }
  };

  _this = methods;

  /** $.FN **/
  $.fn.mapsvgadmin = function( opts ) {

    if ( methods[opts] ) {
      return methods[opts].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof opts === 'object') {
      return methods.init.apply( this, arguments );
    }else if (!opts){
        return methods;
    } else {
      $.error( 'Method ' +  method + ' does not exist on mapSvg plugin' );
    }
  };

})( jQuery );