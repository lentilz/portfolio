(function($, window){
    var MapSVGAdminSettingsController = function(container, admin, mapsvg){
        this.name = 'settings';
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminSettingsController = MapSVGAdminSettingsController;
    MapSVG.extend(MapSVGAdminSettingsController, window.MapSVGAdminController);

    MapSVGAdminSettingsController.prototype.viewLoaded = function(){
        var _this = this;

        this.view.find('.mapsvg-select2').select2();

        _this.updateGaugeFields();
        _this.mapsvg.regionsDatabase.on('schemaChange',function(){
            _this.updateGaugeFields();
        });

        zoomLimit = _this.mapsvg.getData().options.zoom.limit;

        $('#mapsvg-controls-zoomlimit').ionRangeSlider({
            type: "double",
            grid: true,
            min: -100,
            max: 100,
            from_min: -100,
            from_max: 0,
            to_min: 1,
            to_max: 100,
            onFinish: function () {
                var limit = $('#mapsvg-controls-zoomlimit').val().split(';');
                _this.mapsvg.update({zoom: {limit:[limit[0], limit[1]]}});
            },
            from: zoomLimit[0],
            to: zoomLimit[1]
        });
    };

    MapSVGAdminSettingsController.prototype.setEventHandlers = function(){
        var _this = this;



        $('#mapsvg-controls-width').on('keyup', function(e){_this.setHeight(e); });
        $('#mapsvg-controls-height').on('keyup', function(e){_this.setWidth(e); });
        $('#mapsvg-controls-ratio').on('change', function(e){_this.keepRatioClickHandler(e); });
        $('#mapsvg-controls-set-viewbox').on('click', function(e){
            e.preventDefault();
            var v = _this.mapsvg.getViewBox();
            $('#mapsvg-controls-viewbox').val(v.join(' ')).trigger('change');
        });
        $('#mapsvg-controls-reset-viewbox').on('click', function(e){
            e.preventDefault();
            var v = _this.mapsvg.getData().svgDefault.viewBox;
            $('#mapsvg-controls-viewbox').val(v.join(' ')).trigger('change');
            _this.mapsvg.viewBoxReset();
        });

        $('#mapsvg-controls-zoom').on('change',':radio',function(){
            var on = MapSVG.parseBoolean($('#mapsvg-controls-zoom :radio:checked').val());
            on ? $('#mapsvg-controls-zoom-options').show() : $('#mapsvg-controls-zoom-options').hide();
            _this.admin.updateScroll();
        });
        $('#mapsvg-controls-scroll').on('change',':radio',function(){
            var on = MapSVG.parseBoolean($('#mapsvg-controls-scroll :radio:checked').val());
            on ? $('#mapsvg-controls-scroll-options').show() : $('#mapsvg-controls-scroll-options').hide();
            _this.admin.updateScroll();
        });
        this.view.find('#mapsvg-gauge-control').on('change',':radio',function(){
            var value = MapSVG.parseBoolean($('#mapsvg-gauge-control').find(':radio:checked').val());
            if(value)
                $('#table-regions').addClass('mapsvg-gauge-on');
            else
                $('#table-regions').removeClass('mapsvg-gauge-on');

        });
        this.view.on('click','#mapsvg-set-prefix-btn',function(e){
            e.preventDefault();
            _this.admin.save().done(function(){
                window.location.reload();
            });
        });
        function change_file(package, path){
            var path_full = package == 'default' ? mapsvg_paths.maps+path : mapsvg_paths.uploads+path;
            // TODO также обновлять viewbox?
            $.get(path_full, function(xmlData){
                var $data = $(xmlData);

                // Default width/height/viewBox from SVG
                var svgTag               = $data.find('svg');
                var _data                = {svgDefault: {}};
                _data.$svg               = svgTag;

                _data.svgDefault.width   = svgTag.attr('width');
                _data.svgDefault.height  = svgTag.attr('height');
                _data.svgDefault.viewBox = svgTag.attr('viewBox');

                if(_data.svgDefault.width && _data.svgDefault.height){
                    _data.svgDefault.width   = parseFloat(_data.svgDefault.width.replace(/px/g,''));
                    _data.svgDefault.height  = parseFloat(_data.svgDefault.height.replace(/px/g,''));
                    _data.svgDefault.viewBox = _data.svgDefault.viewBox ? _data.svgDefault.viewBox.split(' ') : [0,0, _data.svgDefault.width, _data.svgDefault.height];
                }else if(_data.svgDefault.viewBox){
                    _data.svgDefault.viewBox = _data.svgDefault.viewBox.split(' ');
                    _data.svgDefault.width   = parseFloat(_data.svgDefault.viewBox[2]);
                    _data.svgDefault.height  = parseFloat(_data.svgDefault.viewBox[3]);
                }else{
                    alert('MapSVG needs width/height or viewBox parameter to be present in SVG file.')
                    return false;
                }
                _this.mapsvg.update({source: path_full, viewBox: _data.svgDefault.viewBox, width: _data.svgDefault.width, height: _data.svgDefault.height});
                _this.admin.save(true).done(function(){
                    window.location.reload();
                });
            });
        }
        this.view.on('click','#mapsvg-controls-file-remove',function(e){
            change_file('default', 'geo-calibrated/empty.svg');
        });
        this.view.on('click','#mapsvg-controls-file-reload',function(e){
            _this.mapsvg.getData().options.svgFileVersion++;
            _this.admin.save(true).done(function(){
                window.location.reload();
            });
        });
        this.view.on('click','#mapsvg-controls-file-change',function(e){
            $('#mapsvg-hidden-file-select').show();
        });
        this.view.on('click','#mapsvg-controls-file-hide',function(e){
            e.preventDefault();
            $('#mapsvg-hidden-file-select').hide();
        });
        this.view.find("#mapsvg-select2-map").select2().on("select2:select",function(){
            var package = $(this).find("option:selected").data('package');
            var path = $(this).find("option:selected").data('path');
            change_file(package, path);
        });


        this.mapsvg.on('sizeChange', function(){
            _this.admin.resizeDashboard();
        });
    };
    
    MapSVGAdminSettingsController.prototype.setWidth = function (){
        var _this = this;

        var w = $('#mapsvg-controls-width').val();
        var h = $('#mapsvg-controls-height').val();
        if($('#mapsvg-controls-ratio').is(':checked')){
            w = Math.round(h * _this.mapsvg.getData().svgDefault.width / _this.mapsvg.getData().svgDefault.height);
            $('#mapsvg-controls-width').val(w);
        }
        _this.mapsvg.viewBoxSetBySize(w,h);
        // _this.mapsvg.updateSize();
        _this.admin.resizeDashboard();
    };
    MapSVGAdminSettingsController.prototype.setHeight = function (){
        var _this = this;

        var w = $('#mapsvg-controls-width').val();
        var h = $('#mapsvg-controls-height').val();
        if($('#mapsvg-controls-ratio').is(':checked')){
            h = Math.round(w * _this.mapsvg.getData().svgDefault.height / _this.mapsvg.getData().svgDefault.width);
            $('#mapsvg-controls-height').val(h);
        }
        // _this.mapsvg.viewBoxSetBySize(w,h);
        // _this.mapsvg.updateSize();
        // _this.admin.resizeDashboard();
        _this.mapsvg.viewBoxSetBySize(w,h);
        // _this.mapsvg.updateSize();
        _this.admin.resizeDashboard();
    };
    MapSVGAdminSettingsController.prototype.keepRatioClickHandler = function (){
        var _this = this;
        if($('#mapsvg-controls-ratio').is(':checked')){
            _this.setHeight();
        }
    };
    MapSVGAdminSettingsController.prototype.setWidthViewbox = function (){
        var _this = this;
        if($('#mapsvg-controls-ratio').is(':checked'))
            var k = _this.mapsvg.getData().svgDefault.width / _this.mapsvg.getData().svgDefault.height;
        else
            var k = ($('#map_width').val() / $('#map_height').val());

        var new_width = Math.round($('#viewbox_height').val() * k);

        if (new_width > _this.mapsvg.getData().svgDefault.viewBox[2]){
            new_width  = _this.mapsvg.getData().svgDefault.viewBox[2];
            var new_height = _this.mapsvg.getData().svgDefault.viewBox[3] * k;
            $('#viewbox_height').val(new_height);
        }

        $('#viewbox_width').val(new_width);
    };
    MapSVGAdminSettingsController.prototype.setViewBoxRatio = function (){
        var _this = this;
        var mRatio = $('#map_width').val() / $('#map_height').val();
        var vRatio = $('#viewbox_width').val() / $('#viewbox_height').val();

        if(mRatio != vRatio){
            if(mRatio >= vRatio){ // viewBox is too tall
                $('#viewbox_height').val( _this.mapsvg.getData().svgDefault.viewBox[2] * mRatio ) ;
            }else{ // viewBox is too wide
                $('#viewbox_width').val( _this.mapsvg.getData().svgDefault.viewBox[3] / mRatio ) ;
            }
        }
    };
    MapSVGAdminSettingsController.prototype.setHeightViewbox = function (){
        var _this = this;

        if($('#mapsvg-controls-ratio').is(':checked'))
            var k = _this.mapsvg.getData().svgDefault.height / _this.mapsvg.getData().svgDefault.width;
        else
            var k = ($('#map_height').val() / $('#map_width').val());

        var new_height = Math.round($('#viewbox_width').val() * k);

        if (new_height > _this.mapsvg.getData().svgDefault.viewBox[3]){
            new_height  = _this.mapsvg.getData().svgDefault.viewBox[3];
            var new_width = _this.mapsvg.getData().svgDefault.viewBox[2] * k;
            $('#viewbox_width').val(new_width);
        }

        $('#viewbox_height').val(new_height);
    };

    MapSVGAdminSettingsController.prototype.updateGaugeFields = function (){
        var _this = this;
        var fields = _this.mapsvg.regionsDatabase.getSchema();
        var choroplethField = _this.mapsvg.getOptions().regionChoroplethField;
        var select = this.view.find('#mapsvg-region-data-fields').empty();
        select.append('<option></option>');
        fields.forEach(function(f){
            select.append('<option '+(choroplethField == f.name ? 'selected' :'')+'>'+f.name+'</option>');
        });
        select.trigger('change');

    };


})(jQuery, window);