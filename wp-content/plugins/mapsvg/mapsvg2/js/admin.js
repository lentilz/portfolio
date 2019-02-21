/**
 * MapSvg Builder javaScript
 * Version: 2.0.0
 * Author: Roman S. Stepanov
 * http://codecanyon.net/user/RomanCode/portfolio
 */


(function( $ ) {

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

    function parseBoolean (string) {
        switch (String(string).toLowerCase()) {
            case "on":
            case "true":
            case "1":
            case "yes":
            case "y":
                return true;
            case "off":
            case "false":
            case "0":
            case "no":
            case "n":
                return false;
            default:
                return undefined;
        }
    }

    function isValidURL(url) {
        return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
    }


    var WP = true; // required for proper positioning of control panel in WordPress
    var msvg;
    var editingMark;
    var _data = {}, _this = {};
    _data.optionsDelta = {};
    _data.optionsMode = {
        preview : {
            responsive: true,
            disableLinks: false
        },
        editRegions : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-1000,1000]},
            scroll: {on: true},
            onClick: null,
            mouseOver: null,
            mouseOut: null,
            tooltips: {mode: function(e,mapsvg){
                             if(this.mapsvg_type=="region")
                                    return '<b>'+this.id+'</b>'+(this.title ? (": "+this.title) : "");
                             },
                             priority: 'global'},
            popovers: {mode: function(){return false;}, priority: 'global'}
        },
        editMarkers : {
            responsive: true,
            disableLinks: true,
            zoom: {on: true, limit:[-1000,1000]},
            scroll: {on: true},
            onClick: null,
            mouseOver: null,
            mouseOut: null,
            tooltips: {mode: function(e,mapsvg){
                if(this.mapsvg_type=="marker")
                    return this.id;
            },
            priority: 'global'},
            popovers: {mode: function(){return false;}, priority: 'global'}
        }
    };
    _data.mode = "preview";


    methods = {

        setWidth : function (){
            var w = $('#mapsvg-controls-width').val();
            var h = $('#mapsvg-controls-height').val();
            if($('#mapsvg-controls-ratio').is(':checked')){
                w = Math.round(h * msvg.getData().svgDefault.width / msvg.getData().svgDefault.height);
                $('#mapsvg-controls-width').val(w);
            }
            msvg.viewBoxSetBySize(w,h);
            _this.resizeSVGCanvas();
            msvg.updateSize();
        },
        setHeight : function (){
            var w = $('#mapsvg-controls-width').val();
            var h = $('#mapsvg-controls-height').val();
            if($('#mapsvg-controls-ratio').is(':checked')){
                h = Math.round(w * msvg.getData().svgDefault.height / msvg.getData().svgDefault.width);
                $('#mapsvg-controls-height').val(h);
            }
            msvg.viewBoxSetBySize(w,h);
            _this.resizeSVGCanvas();
            msvg.updateSize();
        },
        keepRatioClickHandler : function (){
            if($('#mapsvg-controls-ratio').is(':checked')){
                methods.setHeight();
                //setViewBoxRatio();
            }
        },
        setWidthViewbox : function (){
            if($('#mapsvg-controls-ratio').is(':checked'))
                var k = msvg.getData().svgDefault.width / msvg.getData().svgDefault.height;
            else
                var k = ($('#map_width').val() / $('#map_height').val());

            var new_width = Math.round($('#viewbox_height').val() * k);

            if (new_width > msvg.getData().svgDefault.viewBox[2]){
                new_width  = msvg.getData().svgDefault.viewBox[2];
                var new_height = msvg.getData().svgDefault.viewBox[3] * k;
                $('#viewbox_height').val(new_height);
            }

            $('#viewbox_width').val(new_width);
        },
        setViewBoxRatio : function (){
            var mRatio = $('#map_width').val() / $('#map_height').val();
            var vRatio = $('#viewbox_width').val() / $('#viewbox_height').val();

            if(mRatio != vRatio){
                if(mRatio >= vRatio){ // viewBox is too tall
                    $('#viewbox_height').val( msvg.getData().svgDefault.viewBox[2] * mRatio ) ;
                }else{ // viewBox is too wide
                    $('#viewbox_width').val( msvg.getData().svgDefault.viewBox[3] / mRatio ) ;
                }
            }
                //...

        },
        setHeightViewbox : function (){

            if($('#mapsvg-controls-ratio').is(':checked'))
                var k = msvg.getData().svgDefault.height / msvg.getData().svgDefault.width;
            else
                var k = ($('#map_height').val() / $('#map_width').val());

            var new_height = Math.round($('#viewbox_width').val() * k);

            if (new_height > msvg.getData().svgDefault.viewBox[3]){
                new_height  = msvg.getData().svgDefault.viewBox[3];
                var new_width = msvg.getData().svgDefault.viewBox[2] * k;
                $('#viewbox_width').val(new_width);
            }

            $('#viewbox_height').val(new_height);
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
        showMarkersEditMap : function (){
        },
        save : function (){
            var form = $(this);
            $('#mapsvg-save')._button('loading');
            var options = msvg.getOptions(false,true);
            $.extend(true,options,_data.optionsDelta);

            var data = {mapsvg_data: _this.convertToText(options), title: options.title, map_id: _data.options.map_id};

            $.post(ajaxurl, {action: 'mapsvg_save', data: data}, function(id){
                if($.isNumeric(id)){
                    var msg = 'Settings saved';
                    $('#map-page-title').html(options.title);
                    if(_data.options.map_id=='new'){
                        $('#mapsvg-shortcode').html('[mapsvg id="'+id+'"]');
                        msg += '. Shortcode: [mapsvg id="'+id+'"]';
                        _data.options.map_id = id;
                    }
                }else{
                    msg = "Error!"
                }
                $().message(msg);
            }).always(function(){
                $('#mapsvg-save')._button('reset');
            });

            return false;
        },
        mapDelete : function(e){
            e.preventDefault();
            var table_row = $(this).closest('tr');
            var id = table_row.attr('data-id');
            table_row.fadeOut();
            $.post(ajaxurl, {action: 'mapsvg_delete', id: id}, function(){
            });
        },
        mapCopy : function(e){

            e.preventDefault();

            var table_row = $(this).closest('tr');
            var id        = table_row.attr('data-id');
            var map_title = table_row.attr('data-title');

            if(!(new_name = prompt('Enter new map title', map_title+' - copy')))
                return false;

            $.post(ajaxurl, {'action': 'mapsvg_copy', 'id': id, 'new_name': new_name}, function(new_id){
                var new_row = table_row.clone();

                var map_link = '?page=mapsvg-config&map_id='+new_id;
                new_row.attr('data-id', new_id).attr('data-title', new_name);
                new_row.find('.mapsvg-map-title a').attr('href', map_link).html(new_name);
                new_row.find('.mapsvg-action-buttons a.mapsvg-button-edit').attr('href', map_link);
                new_row.find('.mapsvg-shortcode').html('[mapsvg id="'+new_id+'"]');
                new_row.prependTo(table_row.closest('tbody'));
            });
        },
        markerEditHandler : function(updateGeoCoords){
            editingMark = this.getOptions();
            var markerForm = $('#table-markers').find('#mapsvg-marker-'+editingMark.id);
            $('#myTab a[href="#tab_markers"]').tab('show');
            if(hbData.isGeo && updateGeoCoords){
                markerForm.find('input.mapsvg-marker-geocoords').val(this.geoCoords.join(','));
                $('.nano').nanoScroller({scrollTo: markerForm});
            }else{
                if(!markerForm.length){
                    editingMark.isSafari = hbData.isSafari;
                    editingMark.markerImages = hbData.markerImages;
                    markerForm = $(_data.markerTemplate(editingMark));
                    //if(hbData.isSafari)
                    //    markerForm.find('input[type=text],input[type=number]').closest('.form-group').wrap('<form class="safarifix" />');
                    $('#table-markers').prepend(markerForm);
                    _this.updateScroll();
                    $('.nano').nanoScroller({scroll: 'top'});
                    markerForm.find('input').eq(0).focus().select();
                }else{
                    $('.nano').nanoScroller({scrollTo: markerForm});
                }
            }
        },
        regionEditHandler : function(){
            var region = this;
            var regionForm = $('#table-regions').find('#mapsvg-region-'+region.id_no_spaces.replace(/(:|\(|\)|\.|\[|\]|,|=|@)/g, '\\$1'));
            $('#myTab a[href="#tab_regions"]').tab('show');
            $('.nano').nanoScroller({scrollTo: regionForm});
            regionForm.trigger('click');
            //regionForm.find('.mapsvg-region-tooltip').focus();
        },
        resizeDashboard : function(){
           var w = _data.iframeWindow.width();
           var top = $('#wpadminbar').height();
           var left = $(window).width() - _data.iframeWindow.width();
           var h = $(window).height()-top;
           $('#mapsvg-admin').css({width: w, height: h, left: left, top : top});
            _this.resizeSVGCanvas();
           _this.updateScroll();
        },
        resizeSVGCanvas : function(){
            var l = $('#mapsvg-container');
            var v = msvg && msvg.getData().viewBox;
            if(msvg && v[3]>v[2]){
                var ratio = v[2]/v[3];
                var newWidth = ratio * l.height();
                var per = (newWidth*100)/l.width();
                //var newPercent = ((100 * v[3]* l.height() ) / v[2]) / l.width();
                $('#mapsvg').css({'width': per+'%'});
                //$('#mapsvg').addClass('mapsvg-fit');

                //$('#mapsvg').css({'margin-top':l.height()/2-$('#mapsvg-limiter').height()/2,
                //    'width': per+'%'
                //});
            }else{
                $('#mapsvg').css({width: 'auto'});
                //$('#mapsvg').removeClass('mapsvg-fit');
            }
        },
        updateScroll : function(){
            $(".nano").nanoScroller();
        },
        convertToText : function(obj) {
            //create an array that will later be joined into a string.
            var string = [];

            //is object
            //    Both arrays and objects seem to return "object"
            //    when typeof(obj) is applied to them. So instead
            //    I am checking to see if they have the property
            //    join, which normal objects don't have but
            //    arrays do.
            if (obj == undefined) {
                return String(obj);
            } else if (typeof(obj) == "object" && (obj.join == undefined)) {
                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)){
                        var key = prop.search(/[^a-zA-Z]+/) === -1 ?  prop : "'"+prop+"'";
                        string.push(key + ": " + _this.convertToText(obj[prop]));
                    }
                }
                return "{" + string.join(",") + "}";

                //is array
            } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
                for(prop in obj) {
                    string.push(_this.convertToText(obj[prop]));
                }
                return "[" + string.join(",") + "]";

                //is function
            } else if (typeof(obj) == "function") {
                string.push(obj.toString().replace('function anonymous','function'));

                //all other values can be done with JSON.stringify
            } else {
                var s = JSON.stringify(obj);
                string.push(s);
            }

            return string.join(",");
        },
        getCoordsFromAdress : function(address, callback){
            $.get('//maps.googleapis.com/maps/api/geocode/json?address='+address+'&sensor=false',function(data){
                callback(data);
            });
        },
        // Returns formatted options or MapSVGError object
        mapSvgUpdate : function(e) {
            var jQueryElem = $(this);
            if (jQueryElem.is(':radio')){
                // TODO risky. could be many other radios in a form-group
                jQueryElem = jQueryElem.closest('.form-group').find(':radio:checked');
            }
            var delay = parseInt($(this).data('delay'));
            jQueryElem.closest('.form-group').removeClass('has-error');
            if (delay){
                var t = $(this).data('timer');
                t && clearTimeout(t);
                $(this).data('timer',setTimeout(function() {
                    _this.mapSvgUpdateFinal(jQueryElem);
                }, delay));
            }else{
                _this.mapSvgUpdateFinal(jQueryElem);
            }
        },
        mapSvgUpdateFinal : function(jQueryElem){


            // Validate input field and format if necessary
            var data = _this.validateInput(jQueryElem);

            if (data instanceof TypeError){
            // If error, highlight input field
                jQueryElem.closest('.form-group').addClass('has-error');
                // TODO highlight line number in CodeMirror
            }else{
            // If no errors, check if attribute is read-only in current map mode
                for(var _key in data) {
                    var key = _key;
                }
                if (_data.optionsMode[_data.mode].hasOwnProperty(key)){
                // Attribute is read-only, save to dirty
                    $.extend(true, _data.optionsDelta, data);

                }else{
                // Attribute can be written into MapSVG instance
                    msvg.update(data);
                    if (data.disableAll !== undefined){
                        $('#table-regions .mapsvg-region-row').each(function(i,region){
                           var id = $(region).attr('data-region-id');
                            var disabled = msvg.getRegion(id).disabled;
                            var checkbox = $(this).find('.mapsvg-region-disabled').prop('checked',disabled);
                            var label = checkbox.closest('label');
                            disabled && label.addClass('active') || label.removeClass('active');
                        });
                    }

                }
            }
        },
        validateInput : function(jQueryElem){
            var val;
            if(jQueryElem.is(':checkbox')){
                if(jQueryElem.is(':checked'))
                    val = jQueryElem.attr('value') ? jQueryElem.attr('value') : true;
                else
                    val = false;
            }else{
                val = jQueryElem.val();
            }
            var validate = jQueryElem.data('validate');
            if(validate && val!=""){
                if(validate == 'function'){
                    val = val!="" ? msvg.functionFromString(val) : null;
                    if(val && val.error){
                        return new TypeError("MapSVG error: error in function", "", val.line);
                    }
                }else if(validate == 'link'){
                    if (!isValidURL(val))
                        return new TypeError('MapSVG error: wrong URL format. URL must start with "http://"');
                }else if(validate == 'number'){
                    if (!$.isNumeric(val))
                        return new TypeError('MapSVG error: value must be a number');
                }else if(validate == 'object') {
                    if(data.substr(0,1)=='[' || data.substr(0,1)=='{'){
                        try{
                            var tmp;
                            eval('tmp = '+val);
                            var val = tmp;
                        }catch(err){
                            return new TypeError("MapSVG error: wrong object format for "+jQueryElem.attr('name'));
                        }
                    }
                }
            }
            return jQueryElem.inputToObject(val);
        },
        setMode : function(mode){
            _data.mode = mode;
            msvg.update(_data.optionsDelta);
            var currentOptions = msvg.getOptions();
            _data.optionsDelta = {};
            $.each(_data.optionsMode[_data.mode],function(key, options){
                _data.optionsDelta[key] = currentOptions[key];
            });
            msvg.update(_data.optionsMode[mode]);
            if(mode=="editRegions"){
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(true);
                msvg.getData().$map.addClass('mapsvg-edit-regions');
            }else if(mode=="editMarkers"){
                msvg.setMarkersEditMode(true);
                msvg.setRegionsEditMode(false);
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
            }else{
                msvg.setMarkersEditMode(false);
                msvg.setRegionsEditMode(false);
                msvg.viewBoxReset(true);
                _this.resizeSVGCanvas();
                msvg.getData().$map.removeClass('mapsvg-edit-regions');
            }

        },
        showRegions: function(page){
            _data.pagination.regions.page = page;
            var start = (page-1)*_data.pagination.regions.perpage;
            var end = start + _data.pagination.regions.perpage - 1;
            $('#table-regions tbody').html(_data.regionListTemplate({regions: hbData.regions.slice(start,end)}));
            _data.pagination.regions.container.find('li').removeClass('active');
            _data.pagination.regions.container.find('li').eq(page-1).addClass('active');
        },
        init : function(options){

            _data.options = options;
            var onEditMapScreen = _data.options.mapsvg_options.source ? true : false;

            $(document).ready(function(){

                // Position control panel in WordPress
                if(WP && onEditMapScreen){
                    // Append an iFrame to the page.
                    _data.iframe = $('#stretchIframe');

                    // Called once the Iframe's content is loaded.
                    // The Iframe's child page BODY element.

                    // Bind the resize event. When the iframe's size changes, update its height as
                    // well as the corresponding info div.

                    _data.iframeWindow = $(_data.iframe[0].contentWindow);//iframe.contents().find('body');
                    _data.iframeWindow.on('resize',function(){
                        var elem = $(this);
                        _this.resizeDashboard();
                    });
                    $(window).on('resize',function(){
                        _this.resizeDashboard();
                    });
                    _this.resizeDashboard();
                }


                $('[data-toggle="tooltip"]').tooltip();

                if(onEditMapScreen){

                    Handlebars.registerHelper('ifeq', function(v1, v2, options) {
                        if(v1 === v2) {
                            return options.fn(this);
                        }
                        return options.inverse(this);
                    });
                    Handlebars.registerHelper('if_starts', function(v1, v2, options) {
                        if(v1 && v1.indexOf(v2) == 0) {
                            return options.fn(this);
                        }
                        return options.inverse(this);
                    });
                    Handlebars.registerHelper('if_function', function(v1, options) {
                        return (typeof v1 == "function") ? options.fn(this) : options.inverse(this);
                    });
                    Handlebars.registerHelper('if_number', function(v1, options) {
                        return $.isNumeric(v1) ? options.fn(this) : options.inverse(this);
                    });
                    Handlebars.registerHelper('if_string', function(v1, options) {
                        return (typeof v1 == "string" && !$.isNumeric(v1)) ? options.fn(this) : options.inverse(this);
                    });
                    Handlebars.registerHelper('toString', function(object) {
                        return object!=undefined ? _this.convertToText(object) : "";
                    });

                    var originalAferLoad = _data.options.mapsvg_options.afterLoad;

                    _data.options.mapsvg_options.afterLoad = function(){
                        msvg.setMarkerEditHandler(methods.markerEditHandler);
                        msvg.setRegionEditHandler(methods.regionEditHandler);
                        msvg.setAfterLoad(originalAferLoad);
                        var source = $("#mapsvg-control-panel").html();

                        hbData = msvg.getOptions(true);
                        hbData.wp_posts = _data.options.wp_posts;
                        if(msvg.getData().presentAutoID){

                            $('#mapsvg-auto-id-warning').show();
                        }

                        _this.setMode('preview');

                        hbData.isGeo = msvg.getData().mapIsGeo;
                        if(hbData.isGeo){
                            $('#mapsvg-admin').addClass('mapsvg-is-geo');
                        }
                        hbData.svgFilename = hbData.source.split('/').pop();
                        hbData.markerImages = _data.options.markerImages;

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

                        var template = Handlebars.compile(source);

                        _data.regionTemplate = Handlebars.compile($("#mapsvg-handlebars-region").html());
                        _data.regionListTemplate = Handlebars.compile($("#mapsvg-handlebars-region-list").html());
                        _data.markerTemplate = Handlebars.compile($("#mapsvg-handlebars-marker").html());

                        Handlebars.registerPartial('regionPartial',$("#mapsvg-handlebars-region").html());
                        Handlebars.registerPartial('markerPartial',$("#mapsvg-handlebars-marker").html());

                        $('#mapsvg-mapform-container .nano-content').html(template(hbData));

                        $('#mapsvg-mapform-container .mapsvg-select2').select2({
                            minimumResultsForSearch: 20
                        });


                        $('#tab_regions').on('click','.mapsvg-region-row',function(e){
                            if(!$(this).hasClass('active')){
                                if(_data.tableRegionsActiveRow){
                                    _data.tableRegionsActiveRow.removeClass('active');
                                    //_data.tableRegionsActiveRow.find('.cpicker').colorpicker('destroy');
                                    _data.tableRegionsActiveRow.find('.mapsvg-region-fields').empty().remove();
                                }
                                _data.tableRegionsActiveRow = $(this);

                                _data.tableRegionsActiveRow.addClass('active');
                                var regionID = _data.tableRegionsActiveRow.data('region-id');
                                var region = msvg.getRegion(regionID).getOptions(true);
                                _data.tableRegionsActiveRow.find('td').append(_data.regionTemplate(region));
                                _data.tableRegionsActiveRow.find('.cpicker').colorpicker().on('changeColor.colorpicker', function(event){
                                    var rid = $(event.target).closest('.mapsvg-region-row').data('region-id');
                                    var c = event.color.toRGB();
                                    var color = 'rgba('+ c.r+','+ c.g+','+ c.b+','+ c.a+')';
                                    if($(this).closest('.form-group').find('input').val() == "")
                                        color = null;
                                    msvg.getRegion(rid).setFill(color);
                                });
                                $('.nano').nanoScroller({scrollTo: _data.tableRegionsActiveRow});

                            }
                        });

                        // Wrap input into form for Safari, otherwise form will be very slow
                        if (hbData.isSafari){
                            $('#mapsvg-mapform-container input[type="text"]').closest('.form-group').wrap('<form />');
                        }
                        // Google geocoding
                        if(hbData.isGeo){
                            var bestPictures = new Bloodhound({
                                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('formatted_address'),
                                queryTokenizer: Bloodhound.tokenizers.whitespace,
                                remote: {
                                    url: '//maps.googleapis.com/maps/api/geocode/json?address=%QUERY%&sensor=true',
                                    wildcard: '%QUERY%',
                                    transform: function(response) {
                                        return response.results;
                                    },
                                    rateLimitWait: 600
                                }
                            });
                            var tH = $('#mapsvg-geocode .typeahead').typeahead(null, {
                                name: 'mapsvg-addresses',
                                display: 'formatted_address',
                                source: bestPictures,
                                minLength: 2
                            });
                            $('#mapsvg-geocode .typeahead').on('typeahead:select',function(ev,item){
                                msvg.markerAdd({geoCoords: [item.geometry.location.lat,item.geometry.location.lng]},true);
                                $('#mapsvg-geocode .typeahead').typeahead('val', '');

                            });
                        }

                        // Codemirror
                        _data.jsEditors = {};
                        _data.jsEditors.onClick    = CodeMirror.fromTextArea($('#mapsvg-event-onclick')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.mouseOver  = CodeMirror.fromTextArea($('#mapsvg-event-mouseover')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.mouseOut   = CodeMirror.fromTextArea($('#mapsvg-event-mouseout')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.beforeLoad = CodeMirror.fromTextArea($('#mapsvg-event-beforeload')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.afterLoad  = CodeMirror.fromTextArea($('#mapsvg-event-afterload')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.globalTooltips = CodeMirror.fromTextArea($('#mapsvg-global-tooltip-function')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.globalPopovers = CodeMirror.fromTextArea($('#mapsvg-global-popover-function')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.menuTemplate = CodeMirror.fromTextArea($('#mapsvg-menu-template')[0], {mode:  "javascript",lineNumbers: true});
                        _data.jsEditors.menuMarkersTemplate = CodeMirror.fromTextArea($('#mapsvg-menu-markers-template')[0], {mode:  "javascript",lineNumbers: true});

                        _data.handlebarsEditors = {};
                        _data.handlebarsEditors.tooltipsTemplate = CodeMirror.fromTextArea($('#mapsvg-post-tooltips-template')[0], {
                            mode: {name: "handlebars", base: "text/html"},
                            matchBrackets: true,
                            lineNumbers: true});
                        _data.handlebarsEditors.popoversTemplate = CodeMirror.fromTextArea($('#mapsvg-post-popovers-template')[0], {
                            mode: {name: "handlebars", base: "text/html"},
                            matchBrackets: true,
                            lineNumbers: true});

                        if(typeof hbData.tooltips.mode != 'function'){
                            _data.jsEditors.globalTooltips.getWrapperElement().style.display="none";
                        }
                        if(typeof hbData.popovers.mode != 'function'){
                            _data.jsEditors.globalPopovers.getWrapperElement().style.display = "none";
                        }

                        var setJSFunction = function(codemirror, changeobj){
                            var handler =  codemirror.getValue();
                            var textarea = $(codemirror.getTextArea());
                            textarea.val(handler).trigger('change');
                        };

                        _data.jsEditors.onClick.on('change',setJSFunction);
                        _data.jsEditors.mouseOver.on('change',setJSFunction);
                        _data.jsEditors.mouseOut.on('change',setJSFunction);
                        _data.jsEditors.beforeLoad.on('change',setJSFunction);
                        _data.jsEditors.afterLoad.on('change',setJSFunction);
                        _data.jsEditors.globalTooltips.on('change',setJSFunction);
                        _data.jsEditors.globalPopovers.on('change',setJSFunction);
                        _data.jsEditors.menuTemplate.on('change',setJSFunction);
                        _data.jsEditors.menuMarkersTemplate.on('change',setJSFunction);

                        _this.updateScroll();

                        // TODO main task!
                        $('#mapsvg-mapform-container')
                            .on('change paste','[data-live="change"]', _this.mapSvgUpdate)
                            .on('keyup paste','[data-live="keyup"]', _this.mapSvgUpdate)
                            .on('select','[data-live="select"]', _this.mapSvgUpdate)
                            .on('click','[data-live="click"]', _this.mapSvgUpdate);

                        $('#mapsvg-mapform-container').on('keypress','form.safarifix input',function(e){
                            if (e.which == 13 || event.keyCode == 13) {
                                e.preventDefault();
                            }
                        });

                        $('input.input-switch').on('click',function(){
                            if($(this).is(':checked')){
                                $(this).closest('.controls').find('.radio').next().attr('disabled','disabled');
                                $(this).parent().next().removeAttr('disabled');
                            }
                        });
                        $('#mapsvg-map-mode').on('change',' :radio',function(){
                           var mode = $('#mapsvg-map-mode :radio:checked').val();
                           _this.setMode(mode) ;
                        });

                        $('.btn-group.mapsvg-toggle-visibility').on('change',':radio',function(){
                            var parent = $(this).closest('.btn-group');
                            var on = parseBoolean(parent.find(':radio:checked').val());
                            var selector = parent.data('toggle-visibility');
                            on ? $(selector).show() : $(selector).hide();
                            if(selector=="#mapsvg-menu-group")
                                _data.jsEditors.menuTemplate.refresh();
                            if(selector=="#mapsvg-menu-markers-group")
                                _data.jsEditors.menuMarkersTemplate.refresh();
                            if(selector=="#mapsvg-tooltips-template-container")
                                _data.handlebarsEditors.tooltipsTemplate.refresh();
                            if(selector=="#mapsvg-popovers-template-container")
                                _data.handlebarsEditors.popoversTemplate.refresh();
                        });

                        // Regions
                        var searchTimer;
                        $('#mapsvg-regions-search input').on('keyup',function(){
                            searchTimer && clearTimeout(searchTimer);
                            var that = this;
                            searchTimer = setTimeout(function() {
                                $('#mapsvg-search-regions-no-matches').hide();
                                if($(that).val().length){
                                    var regions = msvg.search($(that).val());
                                    $('#table-regions tr').hide();
                                    if(regions.length > 0){
                                        for (var i in regions)
                                            $('#table-regions tr#mapsvg-region-'+regions[i]).show();
                                    }else{
                                        $('#mapsvg-search-regions-no-matches').show();
                                    }
                                }else{
                                    $('#table-regions tr').show();
                                }
                            }, 300);
                        });
                        $('#table-regions').on('mouseover','tr',function(){
                           var id = $(this).data('region-id');
                           var region = msvg.getRegion(id);
                           if(region.selected)
                               msvg.deselectRegion(region);
                            region.highlight();
                        }).on('mouseout','tr',function(){
                            var id = $(this).data('region-id');
                            var region = msvg.getRegion(id);
                            if(region.selected)
                                msvg.deselectRegion(region);
                            msvg.getRegion(id).unhighlight();
                        });

                        $('#table-regions .cpicker').colorpicker().on('changeColor.colorpicker', function(event){
                            var rid = $(event.target).closest('.mapsvg-region-row').data('region-id');
                            var color = event.color.toRGB();
                            if($(this).closest('.form-group').find('input').val() == "")
                                color = null;
                            msvg.getRegion(rid).setFill(color);
                        });

                        $('body').tooltip({
                            selector: '.mapsvg-marker-id-save-container',
                            trigger: 'hover',
                            container: 'body'
                        });

                        // MARKERS
                        $('#mapsvg-markers-search input#mapsvg-markers-search-1').on('keyup',function(){
                            var t = $(this).data('t');
                            t && clearTimeout(t);
                            var that = this;

                            $(this).data('t',setTimeout(function(){
                                var searchString = $(that).val();
                                $('#mapsvg-search-markers-no-matches').hide();
                                if(searchString.length){
                                    var markers = msvg.searchMarkers(searchString);
                                    $('#table-markers tr').hide();
                                    if(markers.length > 0){
                                        for (var i in markers)
                                            $('#table-markers tr#mapsvg-marker-'+markers[i]).show();
                                    }else{
                                        $('#mapsvg-search-markers-no-matches').show();
                                    }
                                }else{
                                    $('#table-markers tr').show();
                                }
                            },300));
                        });


                        $('#table-markers').on('click','.mapsvg-marker-id-save',function(e){

                            var text = $(this).closest('.input-group').find('input').val();
                            var row = $(this).closest('.mapsvg-marker-row');
                            var rid = row.attr('data-marker-id');
                            if(!text || text == rid)
                                return false;

                            text = text.replace(' ','_');
                            var checkId = msvg.checkId(text);
                            if(checkId.error){
                                $().message(checkId.error);
                                return false;
                            }

                            var marker = msvg.getMarker(rid);
                            marker.update({id: text});
                            msvg.updateMarkersDict();

                            marker = marker.getOptions();
                            marker.markerImages = _data.options.markerImages;

                            var markerForm = $(_data.markerTemplate(marker));
                            if(hbData.isSafari)
                                markerForm.find('input[type=text],input[type=number]').closest('.form-group').wrap('<form class="safarifix" />');
                            $(this).closest('tr').replaceWith(markerForm);
                            markerForm.find('input').eq(0).focus();

                        }).on('keypress','.mapsvg-marker-id',function(e){
                            if (e.which == 13 || event.keyCode == 13) {
                                e.preventDefault();
                                $(this).closest('.input-group').find('.mapsvg-marker-id-save').trigger('click');
                            }
                        }).on('click','.mapsvg-marker-delete',function(e){
                            var row = $(this).closest('.mapsvg-marker-row');
                            var rid = row.data('marker-id');
                            msvg.markerDelete(msvg.getMarker(rid));
                            row.fadeOut(300,function(){
                                $(this).remove();
                            });
                        });

                        $('.cpicker').colorpicker();
                        $(".select2-cpt").select2({
                            placeholder: "Choose one or more post types",
                        });
                        $(".select2-cpt").select2({
                            placeholder: "Choose one or more post types",
                        });


                        $('#myTab a').click(function (e) {
                            e.preventDefault();
                            $(this).tab('show');
                        }).on('shown.bs.tab', function (e){
                            var h = $(this).attr('href');
                            $('#mapsvg-mapform-container').removeClass('nano-shift-regions');
                            $('#mapsvg-mapform-container').removeClass('nano-shift-markers');

                            if(h=="#tab_regions")
                                $('#mapsvg-mapform-container').addClass('nano-shift-regions');
                            if(h=="#tab_markers")
                                $('#mapsvg-mapform-container').addClass('nano-shift-markers');

                            _this.updateScroll();
                        });

                        //** Switch to one of Tabs on start **//
                        if(window.location.hash && window.location.hash.substring(1,4) == 'tab'){
                            $('#myTab a[href="'+window.location.hash+'"]').tab('show');
                        }

                        /** EVENT HANDLERS **/
                        $('#mapsvg-save').on('click',_this.save);
                        //$('#mapform').on('submit', methods.saveMapSettings);
                        //$('a.btn-import').on('click',methods.chooseImportFile);
                        $('#mapsvg-controls-width').on('keyup', methods.setHeight);
                        $('#mapsvg-controls-height').on('keyup', methods.setWidth);
                        $('#mapsvg-controls-ratio').on('change', methods.keepRatioClickHandler);
                        $('#mapsvg-controls-set-viewbox').on('click', function(e){
                            e.preventDefault();
                            var v = msvg.getViewBox();
                            $('#mapsvg-controls-viewbox').val(v.join(' ')).trigger('change');
                        });
                        $('#mapsvg-controls-reset-viewbox').on('click', function(e){
                            e.preventDefault();
                            var v = msvg.getData().svgDefault.viewBox;
                            $('#mapsvg-controls-viewbox').val(v.join(' ')).trigger('change');
                            msvg.viewBoxReset();
                        });

                        zoomLimit = msvg.getData().options.zoom.limit;

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
                                msvg.update({zoom: {limit:[limit[0], limit[1]]}});
                            },
                            from: zoomLimit[0],
                            to: zoomLimit[1]
                        });
                        $('#mapsvg-controls-hover-brightness').ionRangeSlider({
                            type: "single",
                            grid: true,
                            min: -100,
                            max: 100,
                            from: $.isNumeric(hbData.colors.hover) ? hbData.colors.hover : 0
                        });
                        $('#mapsvg-controls-selected-brightness').ionRangeSlider({
                            type: "single",
                            grid: true,
                            min: -100,
                            max: 100,
                            from: $.isNumeric(hbData.colors.selected) ? hbData.colors.selected : 0
                        });


                        $('.mapsvg-color-brightness').on('change',':radio', function(){
                           var val = $(this).closest('.mapsvg-color-brightness :radio:checked').val();
                           var container = $(this).closest('.form-group');
                            if(val == 'color'){
                               container.find('.cpicker').show();
                               container.find('.irs').hide();
                           }else{
                               container.find('.cpicker').hide();
                               container.find('.irs').show();
                           }
                        });


                        if($.isNumeric(hbData.colors.selected)){
                            $('#mapsvg-colors-selected :radio').eq(0).prop('checked',false).parent().removeClass('active');
                            $('#mapsvg-colors-selected :radio').eq(1).prop('checked',true).parent().addClass('active');
                            $('#mapsvg-colors-selected .cpicker').hide();
                            $('#mapsvg-colors-selected .irs').show();
                        }else{
                            $('#mapsvg-colors-selected :radio').eq(0).prop('checked',true).parent().addClass('active');
                            $('#mapsvg-colors-selected :radio').eq(1).prop('checked',false).parent().removeClass('active');
                            $('#mapsvg-colors-selected .cpicker').show().find('input').val(hbData.colors.selected);
                            $('#mapsvg-colors-selected .irs').hide();
                        }

                        if($.isNumeric(hbData.colors.hover)){
                            $('#mapsvg-colors-hover :radio').eq(0).prop('checked',false).parent().removeClass('active');
                            $('#mapsvg-colors-hover :radio').eq(1).prop('checked',true).parent().addClass('active');
                            $('#mapsvg-colors-hover .cpicker').hide();
                            $('#mapsvg-colors-hover .irs').show();
                        }else{
                            $('#mapsvg-colors-hover :radio').eq(0).prop('checked',true).parent().addClass('active');
                            $('#mapsvg-colors-hover :radio').eq(1).prop('checked',false).parent().removeClass('active');
                            $('#mapsvg-colors-hover .cpicker').show().find('input').val(hbData.colors.hover);
                            $('#mapsvg-colors-hover .irs').hide();
                        }


                        $('#mapsvg-controls-zoom').on('change',':radio',function(){
                            var on = parseBoolean($('#mapsvg-controls-zoom :radio:checked').val());
                            on ? $('#mapsvg-controls-zoom-options').show() : $('#mapsvg-controls-zoom-options').hide();
                            _this.updateScroll();
                        });
                        $('#mapsvg-controls-scroll').on('change',':radio',function(){
                            var on = parseBoolean($('#mapsvg-controls-scroll :radio:checked').val());
                            on ? $('#mapsvg-controls-scroll-options').show() : $('#mapsvg-controls-scroll-options').hide();
                            _this.updateScroll();
                        });
                        $('#mapsvg-popovers-mode').on('change',':radio',function(){
                            var elem = $('#mapsvg-popovers-mode :radio:checked');
                            if(elem.hasClass('mapsvg-function-radio')){
                                _data.jsEditors.globalPopovers.getWrapperElement().style.display="block";
                                $(_data.jsEditors.globalPopovers.getTextArea()).val(_data.jsEditors.globalTooltips.getValue()).trigger('change');
                            }else{
                                _data.jsEditors.globalPopovers.getWrapperElement().style.display="none";
                            }
                            _this.updateScroll();
                        });
                        $('#mapsvg-tooltips-mode').on('change',':radio',function(){
                            var elem = $('#mapsvg-tooltips-mode :radio:checked');
                            if(elem.hasClass('mapsvg-function-radio')){
                                _data.jsEditors.globalTooltips.getWrapperElement().style.display="block";
                                var t = $(_data.jsEditors.globalTooltips.getTextArea()).val(_data.jsEditors.globalTooltips.getValue());
                                t.trigger('change');
                            }else{
                                _data.jsEditors.globalTooltips.getWrapperElement().style.display="none";
                            }
                            _this.updateScroll();
                        });
                        $('#mapsvg-controls-gauge').on('change',':radio',function(){
                            var on = parseBoolean($('#mapsvg-controls-gauge :radio:checked').val());
                            $('#table-regions').removeClass('mapsvg-gauge-on');
                            if(on)
                                $('#table-regions').addClass('mapsvg-gauge-on');
                            on ? $('#mapsvg-gauge-options').show() : $('#mapsvg-gauge-options').hide();
                            _this.updateScroll();
                        });
                        $('.cpicker').colorpicker().on('changeColor.colorpicker', function(event){
                            var input = $(this).find('input');
                            _this.mapSvgUpdate.call(input);
                        });
                        $('body').on('click','.disabled',function(e){
                            e.preventDefault();
                            return false;
                        });


                        $('.btn-group-checkbox').on('click','a',function(){
                            var btn = $(this);
                            var type = btn.attr('data-toggle');
                            setTimeout(function(){
                                var on = btn.hasClass('active');
                                if(on)
                                    btn.closest('.btn-group-checkbox').find('input.input-toggle-'+type).val('true');
                                else
                                    btn.closest('.btn-group-checkbox').find('input.input-toggle-'+type).val('');
                            },200);
                        });

                        _this.resizeDashboard();
                        try{ originalAferLoad(msvg) }catch(err){}
                    };

                    msvg = $("#mapsvg").mapSvg2(_data.options.mapsvg_options);
                    // TODO Вынести в отдельный плагин как расширение
                    msvg.wp = {
                        getPost : function(post_id, format, callback){
                            format = format == 'html' ? 'html' : 'json';
                            $.post(ajaxurl, {
                                action: 'mapsvg_get_post',
                                post_id: post_id,
                                format: format
                            }, function(data) {
                                if(format == '')
                                var $response   =   $(data);
                                var postdata    =   $response.filter('#postdata').html();
                                $('.TARGETDIV').html(postdata);
                            });
                        }
                    };

                    return _this;
                }else{
                    $(".select-map-list").select2().on("select2:select",function(){
                        var link = $(this).find("option:selected").data('link');
                        if (link)
                            window.location = link;
                    });

                    $('#svg_file_uploader').on('change',function(){
                        $(this).closest('form').submit();
                    });

                    $('#mapsvg-table-maps').on('click', 'a.mapsvg-delete', methods.mapDelete);
                    $('#mapsvg-table-maps').on('click', 'a.mapsvg-copy', methods.mapCopy);

                }
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