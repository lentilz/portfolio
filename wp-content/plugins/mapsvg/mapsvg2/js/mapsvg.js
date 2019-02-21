/**
 * MapSVG 6.3.1 - Interactive Map Plugin
 *
 * Author: Roman S. Stepanov
 * http://codecanyon.net/user/RomanCode/portfolio?ref=RomanCode
 *
 * MapSVG @CodeCanyon: http://codecanyon.net/item/jquery-interactive-svg-map-plugin/1694201?ref=RomanCode
 * Licenses: http://codecanyon.net/licenses/regular_extended?ref=RomanCode
 */


(function( $ ) {

    var mapSVG = {};

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function ucfirst(string){
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

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

    function safeURL(url){
        if(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)
            url = "//"+url.split("://").pop();
        return url;
    }

    function extend(sub, base) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
    }

    function MapObject(){
        this.id = "";
    }

    MapObject.prototype.getComputedStyle = function(prop, node){
      node = node || this.node[0];

      if(_p1 = node.getAttribute(prop)){
          return _p1;
      }else if(_p2 = node.getAttribute('style')){
            var s = _p2.split(';');
            var z = s.filter(function(e){
                var e = e.trim();
                var attr = e.split(':');
                if (attr[0]==prop)
                    return true;
            });
            if(z.length){
                return z[0].split(':').pop().trim();
            }
      }


      var parent = $(node).parent();
      var nodeType = parent.length ? parent[0].tagName : null;

      if (nodeType && nodeType!='svg')
        return this.getComputedStyle(prop,parent[0]);
      else
        return undefined;
    };

    MapObject.prototype.getStyle = function(prop){
        if(_p1 = this.attr(prop)){
            return _p1;

        }else if(_p2 = this.attr('style')){
            var s = _p2.split(';');
            var z = s.filter(function(e){
                var e = e.trim();
                if (e.indexOf(prop)===0)
                    return e;
            });

            return z.length ? z[0].split(':').pop().trim() : undefined;
        }
        return "";
    };
    MapObject.prototype.getCenter = function(){
            var x = this.node[0].getBoundingClientRect().left;
            var y = this.node[0].getBoundingClientRect().top;
            var w = this.node[0].getBoundingClientRect().width;
            var h = this.node[0].getBoundingClientRect().height;
            return [x+w/2,y+h/2];
    };
    MapObject.prototype.setTooltip = function(text){
        this.tooltip = text ? text :  undefined;
    };
    MapObject.prototype.setPopover = function(text){
        this.popover = text ? text :  undefined;
    };
    MapObject.prototype.setHref = function(url){
        if (this.href && this.node.parent('a').length)
            this.node.unwrap();
        this.href = url ? url : undefined;
        if (this.href){
            var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";
            var a = document.createElementNS(svgNS, "a");
            a.setAttributeNS(xlinkNS,"href",this.href);
            if(this.target)
                a.setAttribute("target",this.target);
            this.node.wrap($(a));
        }
    };
    MapObject.prototype.setTarget = function(target){
        this.target = target ? target : undefined;
        if (this.href)
            var a = this.node.parent('a')[0];
        else
            return;
        this.target ? a.setAttribute("target",target) : a.removeAttribute("target");
    };
    MapObject.prototype.setData = function(data){

        if(data){
            if(typeof data == 'string'){
                if(data.substr(0,1)=='[' || data.substr(0,1)=='{'){
                    try{
                        var tmp;
                        eval('tmp = '+data);
                        this.data = tmp;
                    }catch(err){
                        var error = "MapSVG: Error in Data object for "+this.mapsvg_type+" '"+this.id+"'. Data object was set to empty object {}.";
                        this.data = {};
                        return {_error: error};
                    }
                }else{
                    this.data = data;
                }
            }else{
                this.data = data;
            }
            return this.data;
        }else{
            this.data = undefined;
        }
    };
    MapObject.prototype.attr = function(v1,v2){
        var svgDom = this.node[0];

        if(typeof v1 == "object"){
            $.each(v1,function(key,item){
                if (typeof item == "string" || typeof item == "number"){
                    svgDom.setAttribute(key,item);
                }
            });
        }
        else if(typeof v1 == "string" && (typeof v2 == "string" || typeof v2 == "number")){
            svgDom.setAttribute(v1,v2);
        }
        else if(v2 == undefined) {
            return svgDom.getAttribute(v1);
        }
    };
    MapObject.prototype.setId = function(id){
        if(!id) return false;
        this.id = id;
        this.node[0].setAttribute('id',id);
    };


    function Region(jQueryObject, globalOptions, regionID, mapsvg){
        MapObject.call(this);

        this.node = jQueryObject;
        this.nodeType = jQueryObject[0].tagName;
        this.globalOptions = globalOptions;
        this.mapsvg = mapsvg;


        this.id = this.node.attr('id');

        if(!this.id){
            this.setId(this.nodeType+'_'+regionID.id++);
            this.autoID = true;
        }

        this.id_no_spaces = this.id.split(' ').join('_');

        this.title = this.node.attr('title');

        this.node[0].setAttribute('class','mapsvg-region');
        this.svg_style = {fill: this.getComputedStyle('fill')};

        this.svg_style.stroke = this.getComputedStyle('stroke');
        // Make stroke-width always the same:
        if(!_browser.ie)// && !_browser.firefox)
            this.node.css({'vector-effect' : 'non-scaling-stroke'});
        else{
            var w = this.getComputedStyle('stroke-width');
            w = w ? w.replace('px','') : '1';
            w = w == "1" ? 1.2 : parseFloat(w);
            this.svg_style['stroke-width'] = w;
        }

        var regionOptions  = globalOptions.regions && globalOptions.regions[this.id] ? globalOptions.regions[this.id] : null;

        this.disabled      = this.getDisabledState();
        this.disabled &&   this.attr('class',this.attr('class')+' mapsvg-disabled');

        this.default_attr  = {};
        this.selected_attr = {};
        this.hover_attr    = {};
        this.mapsvg_type   = 'region';
        var selected = false;
        if(regionOptions && regionOptions.selected){
            selected = true;
            delete regionOptions.selected;
        }
        regionOptions &&  this.update(regionOptions);
        this.setFill();
        if(selected)
            this.setSelected(true);
        this.saveState();
    }
    extend(Region, MapObject);

    Region.prototype.saveState = function(){
        this.initialState = JSON.stringify(this.getOptions());
    };
    Region.prototype.changed = function(){
        return JSON.stringify(this.getOptions()) != this.initialState;
    };
    Region.prototype.getOptions = function(forTemplate){
        var globals = this.globalOptions.regions[this.id];
        var o = {
            id: this.id,
            id_no_spaces: this.id_no_spaces,
            title: this.title,
            disabled: this.disabled === this.getDisabledState(true) ? undefined : this.disabled,
            fill: this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill,
            tooltip: this.tooltip,
            popover: this.popover,
            href: this.href,
            target: this.target,
            data: this.data,
            gaugeValue: this.gaugeValue
        };
        if(forTemplate)
            o.disabled  = this.disabled;
        $.each(o,function(key,val){
            if(val == undefined){
                delete o[key];
            }
        });
        return o;
    };

    Region.prototype.update = function(options){
        for(var key in options){
            // check if there's a setter for a property
            var setter = 'set'+ucfirst(key);
            if (setter in this)
                this[setter](options[key]);
            //else
            //    console.log('MapSVG error: - no setter Region.'+setter);
        }
    };

    Region.prototype.setFill = function(fill){

        if(fill){
            regions = {};
            regions[this.id] = {fill: fill};
            $.extend(true, this.globalOptions, {regions: regions});
        }else if(fill == "" && this.globalOptions.regions && this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill){
            //regions = {};
            //regions[this.id] = {fill: undefined};
            //$.extend(true, this.globalOptions, {regions: regions});
            delete this.globalOptions.regions[this.id].fill;
        }


        // Priority: gauge > options.fill > disabled > base > svg
        if(this.globalOptions.gauge.on && this.gaugeValue){
            var o = this.globalOptions.gauge;
            var w = (this.gaugeValue - o.min) / o.maxAdjusted;

            var rgb = {
                r: Math.round(o.colors.diffRGB.r * w + o.colors.lowRGB.r),
                g: Math.round(o.colors.diffRGB.g * w + o.colors.lowRGB.g),
                b: Math.round(o.colors.diffRGB.b * w + o.colors.lowRGB.b),
                a: Math.round(o.colors.diffRGB.a * w + o.colors.lowRGB.a)
            };
            this.default_attr['fill'] = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a+')';
        }else if(this.globalOptions.regions[this.id] && this.globalOptions.regions[this.id].fill) {
            this.default_attr['fill'] = this.globalOptions.regions[this.id].fill;
        }else if(this.disabled && this.globalOptions.colors.disabled){
            this.default_attr['fill'] = this.globalOptions.colors.disabled;
        }else if(this.globalOptions.colors.base){
            this.default_attr['fill'] = this.globalOptions.colors.base;
        }else if(this.svg_style.fill!='none'){
            this.default_attr['fill'] = this.svg_style.fill ? this.svg_style.fill : this.globalOptions.colors.baseDefault;
        }else{
            this.default_attr['fill'] = 'none';
        }


        if(isNumber(this.globalOptions.colors.selected))
            this.selected_attr['fill'] = tinycolor(this.default_attr.fill).lighten(parseFloat(this.globalOptions.colors.selected)).toRgbString();
        else
            this.selected_attr['fill'] = this.globalOptions.colors.selected;

        if(isNumber(this.globalOptions.colors.hover))
            this.hover_attr['fill'] = tinycolor(this.default_attr.fill).lighten(parseFloat(this.globalOptions.colors.hover)).toRgbString();
        else
            this.hover_attr['fill'] = this.globalOptions.colors.hover;


        this.node.css('fill',this.default_attr['fill']);
        this.fill = this.default_attr['fill'];


        if(this.svg_style.stroke!='none' && this.globalOptions.colors.stroke != undefined)
            this.node.css('stroke',this.globalOptions.colors.stroke);
        else
            this.node.css('stroke',this.svg_style.stroke);

        if(this.selected)
            this.select();

    };
    Region.prototype.setDisabled = function(on){
        on = on !== undefined ? parseBoolean(on) : this.getDisabledState(); // get default disabled state if undefined
        this.disabled = on;
        on ? this.attr('class',this.attr('class')+' mapsvg-disabled') : this.attr('class',this.attr('class').replace(' mapsvg-disabled',''));
        this.selected = false;
        this.setFill();
    };
    Region.prototype.setSelected = function(on){
        //this.selected = parseBoolean(on);
        this.mapsvg.selectRegion(this);
    };
    Region.prototype.setGaugeValue = function(val){
        this.gaugeValue = $.isNumeric(val) ? parseFloat(val) : undefined;
    };
    Region.prototype.getDisabledState = function(asDefault){
        var opts = this.globalOptions.regions[this.id];
        if(!asDefault && opts && opts.disabled !== undefined){
            return opts.disabled;
        }else if(
            this.globalOptions.disableAll || this.svg_style.fill == 'none' || this.id == 'labels' || this.id == 'Labels'
        ){
            return true;
        }else{
            return false;
        }
    };
    Region.prototype.highlight = function(){
        this.node.css({'fill' : this.hover_attr.fill});
    };
    Region.prototype.unhighlight = function(){
        this.node.css({'fill' : this.default_attr.fill});
    };
    Region.prototype.select = function(){
        this.node.css({'fill' : this.selected_attr.fill});
        this.selected = true;
    };
    Region.prototype.deselect = function(){
        this.node.css({'fill' : this.default_attr.fill});
        this.selected = false;
    };


    // MARKER
    function Marker(options, scale){

        if(!options.id || !options.src) return false;

        MapObject.call(this);

        var img = document.createElementNS('http://www.w3.org/2000/svg','image');
        img.setAttributeNS(null,'height', options.height);
        img.setAttributeNS(null,'width',  options.width);
        img.setAttributeNS('http://www.w3.org/1999/xlink','href',  options.src);
        img.setAttributeNS(null,'x',  options.x);
        img.setAttributeNS(null,'y',  options.y);
        img.setAttributeNS(null, 'visibility', 'visible');
        img.setAttribute('class','mapsvg-marker');
        this.node = $(img);

        this.src = options.src;
        this.setId(options.id);
        this.mapsvg_type = 'marker';
        this.x = parseFloat(options.x);
        this.y = parseFloat( options.y);
        this.width = parseFloat( options.width);
        this.height = parseFloat( options.height);
        this.tooltip =  options.tooltip;
        this.popover =  options.popover;
        this.href =  options.href;
        this.target =  options.target;
        this.default = {x: this.x, y:this.y, width:this.width, height: this.height};
        this.geoCoords = options.geoCoords;
        this.data = options.data;
    }
    extend(Marker, MapObject);

    Marker.prototype.getOptions = function(){
        var o = {id: this.id,
            tooltip: this.tooltip,
            popover: this.popover,
            href: this.href,
            target: this.target,
            data: this.data,
            src: this.src,
            width: this.default.width,
            height: this.default.height,
            x: this.x,
            y: this.y,
            geoCoords: this.geoCoords
        };
        $.each(o,function(key,val){
            if(val == undefined){
                delete o[key];
            }
        });
        return o;
    };

    Marker.prototype.setXY = function(x,y){
        this.x = x;
        this.y = y;
        this.node[0].setAttribute('x',  x);
        this.node[0].setAttribute('y',  y);
        this.adjustPosition(this.mapScale);
    };

    Marker.prototype.update = function(data, mapScale){
        for(var key in data){
            // check if there's a setter for a property
            var setter = 'set'+ucfirst(key);
            if (setter in this)
                this[setter](data[key],mapScale);
        }
    };
    Marker.prototype.setSrc = function(src, mapScale){
        if(!src)
            return false;
        src = safeURL(src);
        mapScale = mapScale || this.mapScale;
        var img  = new Image();
        var marker = this;
        img.onload = function(){
            marker.default.width = this.width;
            marker.default.height = this.height;

            marker.x = marker.x - (this.width - marker.width)/2;
            marker.y = marker.y - (this.height - marker.height);

            marker.attr({x: marker.x, y: marker.y, width: this.width, height: this.height});
            marker.width = this.width;
            marker.height = this.height;

            marker.node[0].setAttributeNS('http://www.w3.org/1999/xlink','href', src);
            marker.adjustPosition(mapScale);

            marker.src = src;
        };
        img.src  = src;
    };
    Marker.prototype.adjustPosition = function(mapScale){

        var w = this.default.width;
        var h = this.default.height;
        var dx = w/2 - w/(2*mapScale);
        var dy = h - h/mapScale;
        //this.x += w/2 - w/(2*mapScale);
        //this.y += h - h/mapScale;
        this.attr('width',w/(mapScale));
        this.attr('height',h/(mapScale));
        //this.attr('x',this.x);
        //this.attr('y',this.y + dx);
        this.attr('transform','translate('+dx+','+dy+')');
        this.mapScale = mapScale;
    };
    // GET MARK COORDINATES TRANSLATED TO 1:1 SCALE (used when saving new added markers)
    Marker.getDefaultCoords = function(markerX, markerY, markerWidth, markerHeight, mapScale){
        markerX       = parseFloat(markerX);
        markerY       = parseFloat(markerY);
        markerWidth   = parseFloat(markerWidth);
        markerHeight  = parseFloat(markerHeight);
        markerX       = markerX + markerWidth/(2*mapScale) - markerWidth/2;
        markerY       = markerY + markerHeight/mapScale - markerHeight;
        return [markerX, markerY];
    };
    Marker.prototype.drag = function(startCoords, scale, endCallback, clickCallback){
        _this = this;
        this.ox = this.x;
        this.oy = this.y;

        // TODO cursor
        //$('body').css('cursor','move');
        //this.node.closest('svg').css('pointer-events','none');

        $('body').on('mousemove.drag.mapsvg',function(e){
            e.preventDefault();
            //$('body').css('cursor','move');
            var mouseNew = mouseCoords(e);
            var dx = mouseNew.x - startCoords.x;
            var dy = mouseNew.y - startCoords.y;
            _this.x = _this.ox + dx/scale;
            _this.y = _this.oy + dy/scale;
            _this.attr({x:_this.x, y:_this.y});
            //_this.attr('transform','translate('+dx/scale+','+dy/scale+')');
        });
        $('body').on('mouseup.drag.mapsvg',function(e){
            e.preventDefault();
            _this.undrag();
            var mouseNew = mouseCoords(e);
            var dx = mouseNew.x - startCoords.x;
            var dy = mouseNew.y - startCoords.y;
            _this.x = _this.ox + dx/scale;
            _this.y = _this.oy + dy/scale;
            _this.attr({x:_this.x, y:_this.y});
            endCallback.call(_this);
            if(_this.ox == _this.x && _this.oy == _this.y)
                clickCallback.call(_this);
        });
    };
    Marker.prototype.undrag = function(){
        //this.node.closest('svg').css('pointer-events','auto');
        //$('body').css('cursor','default');
        $('body').off('.drag.mapsvg');
    };
    Marker.prototype.delete = function(){
        if(this.href)
            this.node.parent('a').empty().remove();
        this.node.empty().remove();
    };




    var instances = {};
    var globalID  = 0;
    var userAgent = navigator.userAgent.toLowerCase();

    // Get plugin's path
    var scripts       = document.getElementsByTagName('script');
    var myScript      = scripts[scripts.length - 1].src.split('/');
    myScript.pop();
    var pluginJSURL   =  myScript.join('/')+'/';
    myScript.pop();
    var pluginRootURL =  myScript.join('/')+'/';



    // Check for iPad/Iphone/Andriod
    var touchDevice =
        (userAgent.indexOf("ipad") > -1) ||
        (userAgent.indexOf("iphone") > -1) ||
        (userAgent.indexOf("ipod") > -1) ||
        (userAgent.indexOf("android") > -1);

    var _browser = {};

    _browser.ie = userAgent.indexOf("msie") > -1 || userAgent.indexOf("trident") > -1 || userAgent.indexOf("edge") > -1 ? {} : false;
    _browser.firefox = userAgent.indexOf("firefox") > -1;

    if (!String.prototype.trim) {
        String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
    }


    // Create function for retrieving mouse coordinates
    var mouseCoords = function(e){
        if(e.clientX){
            return {'x':e.clientX + $(document).scrollLeft(), 'y':e.clientY + $(document).scrollTop()};
        }if(e.pageX){
            return {'x':e.pageX, 'y':e.pageY};
        }else if(touchDevice){
            e = e.originalEvent;
            return e.touches && e.touches[0] ?
            {'x':e.touches[0].pageX, 'y':e.touches[0].pageY} :
            {'x':e.changedTouches[0].pageX, 'y':e.changedTouches[0].pageY};
        }
    };

    // Default options
    var defaults = {
        markerLastID        : 0,
        regionLastID        : 0,
        disableAll          : false,
        width               : null,
        height              : null,
        lockAspectRatio     : true,
        loadingText         : 'Loading map...',
        //colors              : {base: "#E1F1F1", background: "#eeeeee", hover: "#548eac", selected: "#065A85", stroke: "#7eadc0"},
        colors              : {baseDefault: "#000000", background: "#eeeeee", selected: 40, hover: 20},
        regions             : {},
        markers             : [],
        //markerGroups        : {}, // {group_id: [marker_id, marker_id2], group_id2: [...]}
        //regionGroups        : {},
        viewBox             : [],
        cursor              : 'default',
        onClick             : null,
        mouseOver           : null,
        mouseOut            : null,
        beforeLoad          : null,
        afterLoad           : null,
        zoom                : {on :false, limit: [0,10], delta: 1.2, buttons: {on: true, location: 'right'}, mousewheel: true},
        scroll              : {on: false, limit: false, background: false},
        responsive          : true,
        tooltips            : {mode: 'off', on: false, priority: 'local', position: 'bottom-right'},
        popovers            : {mode: "off", on: false, priority: 'local', position: 'top'},
        multiSelect         : false,
        gauge               : {on: false, labels: {low: "low", high: "high"}, colors: {lowRGB: null, highRGB: null, low: "#550000", high: "#ee0000"}, min: 0, max: 0},
        menu                : {on: false, containerId: "mapsvg-menu-regions", template: function(region){
    return '<li><a href="#' + region.id + '">' + (region.title||region.id) + '</a></li>'
}},
        menuMarkers         : {on: false, containerId: "mapsvg-menu-markers", template: function(marker){
        return '<li><a href="#' + marker.id + '">' + marker.id + '</a></li>'
    }}
    };

    // Default marker style
    var markerOptions = {'src': pluginRootURL+'markers/pin1_red.png'};


    /** Main Class **/
    mapSVG = function(elem, options){

        var _data;

        this.methods = {
            mouseCoords : mouseCoords,
            functionFromString: function(string){
                var func;
                var error = false;
                var fn = string;
                if(fn.indexOf("{")==-1 || fn.indexOf("function")==-1 || fn.indexOf("(")==-1){
                    return {error: "MapSVG user function error: no function body."};
                }
                var fnBody = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"));
                var params = fn.substring(fn.indexOf("(") + 1, fn.indexOf(")"));
                try{
                    func = new Function(params,fnBody);
                    success = true;
                }catch(err){
                    error = err;
                }
                if (!error)
                    return func;
                else
                    return {error: {line: error.line, text: "MapSVG user function error: (line "+error.line+"): "+error.message}};
            },
            getOptions: function(forTemplate, forWeb){
                var options = $.extend(true, {}, _data.options);
                options.viewBox = _data._viewBox;

                delete options.markers;
                //var region = {id: "", title: "", disabled: false, selected: false,
                if (forTemplate){
                    options.regions = [];
                    _data.regions.forEach(function(r){
                        options.regions.push(r.getOptions());
                    });
                    options.markers = _data.options.markers;
                }else{
                    _data.regions.forEach(function(r){
                        r.changed() && (options.regions[r.id] = r.getOptions());
                    });
                    if(_data.markers.length > 0)
                        options.markers = [];
                    _data.markers.forEach(function(m){
                        options.markers.push(m.getOptions());
                    });
                }


                if(forWeb)
                    $.each(options,function(key,val){
                        if(JSON.stringify(val)==JSON.stringify(defaults[key]))
                            delete options[key];
                    });
                return options;
            },
            // SETTERS
            update : function(options){
                for (var key in options){
                    if (key == "regions"){
                        $.each(options.regions,function(id,regionOptions){
                            var region = _this.getRegion(id);
                            region && region.update(regionOptions);
                            if(regionOptions.gaugeValue!=undefined){
                                _this.updateGaugeMinMax();
                                _this.regionsRedrawColors();
                            }
                            if(regionOptions.disabled!=undefined){
                                _this.deselectRegion(region);
                                _data.options.regions[id] = _data.options.regions[id] || {};
                                _data.options.regions[id].disabled = region.disabled;
                            }
                        });
                    }else if (key == "markers"){
                        $.each(options.markers,function(id,markerOptions){
                            var marker = _this.getMarker(id);
                            if(markerOptions.geoCoords){
                                if(typeof markerOptions.geoCoords == "string"){
                                    markerOptions.geoCoords = markerOptions.geoCoords.trim().split(',');
                                    markerOptions.geoCoords = [parseFloat(markerOptions.geoCoords[0]),parseFloat(markerOptions.geoCoords[1])];
                                }
                                if(typeof markerOptions.geoCoords == 'object' && markerOptions.geoCoords.length==2){
                                    if($.isNumeric(markerOptions.geoCoords[0]) && $.isNumeric(markerOptions.geoCoords[1])){
                                        var xy = _this.convertGeoToPixel(markerOptions.geoCoords);
                                        xy[0] = xy[0] - marker.width / 2 + .3;
                                        xy[1] = (xy[1] - marker.height) + 1.5;
                                        marker.setXY(xy[0],xy[1]);
                                    }
                                    //delete markerOptions.geoCoords;
                                }
                            }else{
                                marker && marker.update(markerOptions);
                            }


                        });
                    }else{
                        var setter = 'set'+ucfirst(key);
                        if (_this.hasOwnProperty(setter))
                            this[setter](options[key]);
                        else
                            console.log('MapSVG Error: no setter '+setter+'()');
                    }
                }
            },
            setTitle: function(title){
                title && (_data.options.title = title);
            },
            setDisableLinks: function(on){
                on = parseBoolean(on);
                if(on){
                    _data.$map.on('click.a.mapsvg','a',function(e){
                        e.preventDefault();
                    });
                }else{
                    _data.$map.off('click.a.mapsvg');
                }
                _data.disableLinks = on;
            },
            setLoadingText: function(val){_data.options.loadingText = val},
            setLockAspectRatio: function(val){ _data.options.lockAspectRatio =  parseBoolean(val);},
            setOnClick: function(h){_data.options.onClick = h || undefined;},
            setMouseOver: function(h){_data.options.mouseOver = h || undefined;},
            setMouseOut: function(h){_data.options.mouseOut = h || undefined;},
            setBeforeLoad: function(h){_data.options.beforeLoad = h || undefined;},
            setAfterLoad: function(h){_data.options.afterLoad = h || undefined;},
            setMarkerEditHandler : function(handler){
                _data.markerEditHandler = handler;
            },
            setRegionEditHandler : function(handler){
                _data.regionEditHandler = handler;
            },
            setDisableAll: function(on){
                on = parseBoolean(on);
                $.extend(true, _data.options, {disableAll:on});
                _data.regions.forEach(function(r){
                    r.setDisabled();
                });
            },
            setColors : function(colors){
                $.extend(true, _data.options, {colors:colors});
                //_data.$map.css({'background': _data.options.colors.background});
                //if(colors.stroke)
                //    _data.regions.forEach(function(r){
                //        //if (r.default_attr['stroke'] == _data.options.colors.stroke)
                //        //    r.default_attr['stroke'] = color;
                //        r.node.css('stroke',colors.stroke);
                //    });
                $.each(_data.options.colors,function(key, color){
                    if(color === null || color == "")
                        delete color[key];
                });
                if(colors.background)
                    _data.$map.css({'background': _data.options.colors.background});
                if(colors.hover)
                    _data.options.colors.hover = (colors.hover == ""+parseInt(colors.hover)) ? parseInt(colors.hover) : colors.hover;
                if(colors.selected)
                    _data.options.colors.selected = (colors.selected == ""+parseInt(colors.selected)) ? parseInt(colors.selected) : colors.selected;
                _this.regionsRedrawColors();
            },
            setTooltips : function (options) {

                if (typeof options.mode == "string" && options.mode.indexOf("function") == 0)
                    options.mode = _this.functionFromString(options.mode);

                _data.options.tooltips.on = _data.options.tooltips.mode!='off';

                $.extend(true, _data.options, {tooltips: options});

                if(!_data.mapTip){
                    _data.mapTip = $('<div />').addClass('mapsvg-tooltip');
                    $("body").append(_data.mapTip);
                }
                var event = 'mousemove.tooltip.mapsvg-'+_data.$map.attr('id');
                $('body').off(event);
                var tip = _data.mapTip[0];
                switch (_data.options.tooltips.position){
                    case 'bottom-right':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = (e.clientX + $(window).scrollLeft()) +'px';
                            tip.style.top = (e.clientY + $(window).scrollTop() + 25) +'px';
                        });
                        break;
                    case 'bottom-left':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = (e.clientX + $(window).scrollLeft() - tip.offsetWidth + 10) +'px';
                            tip.style.top = (e.clientY + $(window).scrollTop() + 25) +'px';
                        });
                        break;
                    case 'bottom':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() - tip.offsetWidth/2 + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() + 25+ 'px';
                        });
                        break;
                    case 'top':
                        //_data.mapTip.css('transform','translateX(-50%)');
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() - tip.offsetWidth/2 + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() - tip.offsetHeight - 10 + 'px';
                        });
                        break;
                    case 'top-right':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() - tip.offsetHeight - 10 + 'px';
                        });
                        break;
                    case 'top-left':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() - tip.offsetWidth + 10 + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() - tip.offsetHeight - 10 + 'px';
                        });
                        break;
                    case 'left':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() - tip.offsetWidth - 10 + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() - tip.offsetHeight/2 + 'px';
                        });
                        break;
                    case 'right':
                        $('body').on(event, function(e) {
                            window.m = mouseCoords(e);
                            tip.style.left = e.clientX + $(window).scrollLeft() + 15 + 'px';
                            tip.style.top = e.clientY + $(window).scrollTop() - tip.offsetHeight/2 + 'px';
                        });
                        break;
                }
            },
            setPopovers : function (options){
                if (typeof options.mode == "string" && options.mode.indexOf("function") == 0){
                    options.mode = _this.functionFromString(options.mode);
                }

                $.extend(true, _data.options, {popovers: options});
                _data.options.popovers.on = _data.options.popovers.mode!='off';

                if(!_data.mapPopover) {
                    _data.mapPopover = $('<div />').addClass('mapsvg-popover');
                    _data.mapPopover.closeButton = $('<div class="mapsvg-popover-close">&#10005;</div>');
                    _data.mapPopover.contentDiv = $('<div class="mapsvg-popover-content"></div>');
                    _data.mapPopover.append(_data.mapPopover.contentDiv);
                    _data.mapPopover.append(_data.mapPopover.closeButton);
                    _data.mapPopover.css({
                        width: _data.options.popovers.width + (_data.options.popovers.width == 'auto' ? '' : 'px'),
                        height: _data.options.popovers.height + (_data.options.popovers.height == 'auto' ? '' : 'px')
                    });
                    _data.mapPopover.closeButton.on('click', _this.hidePopover);
                    $("body").append(_data.mapPopover);
                }

                $('body').off('.popover.mapsvg', _this.popoverOffHandler);
                if(!touchDevice)
                    $('body').on('mousedown.popover.mapsvg', _this.popoverOffHandler);


            },
            setInitialViewBox : function(v){
                if(typeof v == 'string')
                    v = v.trim().split(' ');
                // TODO is this OK?
                _data._viewBox = [parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]), parseFloat(v[3])];
                _data.zoomLevel = 0;
            },
            setViewBox : function(v,skipAdjustments){

                if(typeof v == 'string'){
                    v = v.trim().split(' ');
                    //var coords = _this.getRegion(v).getBBox();
                    //_data.viewBox = [coords.x-5, coords.y-5, coords.width+10, coords.height+10];
                    //var isZooming = true;
                }
                var d = (v && v.length==4) ? v : _data.svgDefault.viewBox;
                var isZooming = parseInt(d[2]) != _data.viewBox[2] || parseInt(d[3]) != _data.viewBox[3];
                _data.viewBox = [parseFloat(d[0]), parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3])];

                if(!v){
                    _data._viewBox = _data.viewBox;
                    _data._scale = 1;
                }
                _data.$svg[0].setAttribute('viewBox',_data.viewBox.join(' '));

                _this.setResponsive(_data.options.responsive,true);
                if(isZooming && !skipAdjustments){
                    _data.scale = _this.getScale();
                    _this.markersAdjustPosition();
                    if(_browser.ie){// || _browser.firefox){
                        _this.mapAdjustStrokes();
                    }
                }
                return true;
            },
            redraw: function(){
                _data.$map.css({
                    width: _data.$map.width(),
                    height: _data.$map.width() / _data.whRatio
                });
                if(!_browser.ie) {
                    _data.$map.css({
                        width: 'auto',
                        height: 'auto'
                    });
                }else{
                    _data.$map.css({
                        width: 'auto'
                    });
                }
                _this.updateSize();
            },
            setSize : function( width, height, responsive ){

                // Convert strings to numbers
                _data.options.width      = parseFloat(width);
                _data.options.height     = parseFloat(height);
                _data.options.responsive = responsive!=null ? parseBoolean(responsive) : _data.options.responsive;

                // Calculate width and height
                if ((!_data.options.width && !_data.options.height)){
                    _data.options.width	 = _data.svgDefault.width;
                    _data.options.height = _data.svgDefault.height;
                }else if (!_data.options.width && _data.options.height){
                    _data.options.width	 = parseInt(_data.options.height * _data.svgDefault.width / _data.svgDefault.height);
                }else if (_data.options.width && !_data.options.height){
                    _data.options.height = parseInt(_data.options.width * _data.svgDefault.height/_data.svgDefault.width);
                }

                //if(_data.options.responsive){
                //    var maxWidth  = _data.options.width;
                //    var maxHeight = _data.options.height;
                //    _data.options.width	 = _data.svgDefault.width;
                //    _data.options.height = _data.svgDefault.height;
                //}

                _data.whRatio      = _data.options.width / _data.options.height;
                _data.scale        = _this.getScale();

                _this.setResponsive(responsive);

                if(_data.markers)
                    _this.markersAdjustPosition();

                return [_data.options.width, _data.options.height];
            },
            setResponsive : function(on,force){
                //if(parseBoolean(on)==_data.options.responsive)
                //    return false;
                on = on!=undefined ? parseBoolean(on) : _data.options.responsive;
                $(window).off('resize.mapsvg');

                if(on){
                    $(window).on('resize.mapsvg', _this.updateSize);
                    if(!_data.$map.hasClass('mapsvg-responsive')){
                        _data.$map.addClass('mapsvg-responsive');
                        _data.$map.css({
                            'width': 'auto',
                            'height': 'auto'
                        });
                    }

                    _data.$map.height(_data.$map.width()  / _data.whRatio);
                    $(window).on('resize.mapsvg', function(){
                        _data.$map.height(_data.$map.width() / _data.whRatio);
                        _this.updateSize();
                    });

                }else{
                    _data.$map.removeClass('mapsvg-responsive');
                    _data.$map.css({
                        'width': _data.options.width+'px',
                        'height': _data.options.height+'px'
                    });
                }
                $.extend(true, _data.options, {responsive: on});
                _this.updateSize();
            },
            setScroll : function(options){
                options.on != null && (options.on = parseBoolean(options.on));
                options.limit != null && (options.limit = parseBoolean(options.limit));
                $.extend(true, _data.options, {scroll: options});
                _this.setEventHandlers();
            },
            setZoom : function (options){
                options = options || {};
                options.on != undefined && (options.on = parseBoolean(options.on));
                options.mousewheel != undefined && (options.mousewheel = parseBoolean(options.mousewheel));
                options.delta && (options.delta = parseFloat(options.delta));
                if(options.limit){
                    if(typeof options.limit == 'string')
                        options.limit = options.limit.split(';');
                    options.limit = [parseInt(options.limit[0]),parseInt(options.limit[1])];
                }
                //(options.buttons && options.buttons.on) && (options.buttons.on = parseBoolean(options.buttons.on));
                $.extend(true, _data.options, {zoom: options});
                _data.$map.off('mousewheel.mapsvg');

                if(_data.options.zoom.on && _data.options.zoom.mousewheel){
                    _data.$map.on('mousewheel.mapsvg',function(event, delta, deltaX, deltaY) {
                        var d = delta > 0 ? 1 : -1;
                        _this.zoom(d);
                        return false;
                    });
                }
                _this.setZoomButtons();
            },
            setZoomButtons : function(){
                var loc = _data.options.zoom.buttons.location || 'hide';
                if(! _data.zoomButtons){

                    var buttons = $('<div />').addClass('mapsvg-buttons');

                    buttons.zoomIn = $('<div />').addClass('mapsvg-btn-zoom in');
                    var event = touchDevice? 'touchstart' : 'click';
                    buttons.zoomIn.on(event,function(e){
                        e.stopPropagation();
                        _this.zoomIn();
                    });

                    buttons.zoomOut = $('<div />').addClass('mapsvg-btn-zoom out');
                    buttons.zoomOut.on(event,function(e){
                        e.stopPropagation();
                        _this.zoomOut();
                    });
                    buttons.append(buttons.zoomIn).append(buttons.zoomOut);
                    _data.zoomButtons = buttons;
                    _data.$map.append(_data.zoomButtons);
                }
                _data.zoomButtons.removeClass('left');
                _data.zoomButtons.removeClass('right');
                loc == 'right' && _data.zoomButtons.addClass('right')
                ||
                loc == 'left' && _data.zoomButtons.addClass('left');

                (_data.options.zoom.on &&  loc!='hide') ? _data.zoomButtons.show() : _data.zoomButtons.hide();
            },
            setCursor : function(type){
                type = type == 'pointer' ? 'pointer' : 'default';
                _data.options.cursor = type;
                if(type == 'pointer')
                    _data.$map.addClass('mapsvg-cursor-pointer');
                else
                    _data.$map.removeClass('mapsvg-cursor-pointer');
            },
            setPreloaderText : function(text){
                _data.options.loadingText = text;
            },
            setMultiSelect : function (on){
                _data.options.multiSelect = parseBoolean(on);
                _this.deselectAllRegions();
            },
            setGauge : function (options){

                options = options || _data.options.gauge;
                options.on != undefined && (options.on = parseBoolean(options.on));
                $.extend(true, _data.options, {gauge: options});

                var needsRedraw = false;

                if(!_data.$gauge){
                    _data.$gauge = {};
                    _data.$gauge.gradient = $('<td>&nbsp;</td>').addClass('mapsvg-gauge-gradient');
                    _this.setGaugeGradientCSS();
                    _data.$gauge.container = $('<div />').addClass('mapsvg-gauge').hide();
                    _data.$gauge.table = $('<table />');
                    var tr = $('<tr />');
                    _data.$gauge.labelLow = $('<td>'+_data.options.gauge.labels.low+'</td>');
                    _data.$gauge.labelHigh = $('<td>'+_data.options.gauge.labels.high+'</td>');
                    tr.append(_data.$gauge.labelLow);
                    tr.append(_data.$gauge.gradient);
                    tr.append(_data.$gauge.labelHigh);
                    _data.$gauge.table.append(tr);
                    _data.$gauge.container.append(_data.$gauge.table);
                    _data.$map.append(_data.$gauge.container);
                }

                if (!_data.options.gauge.on && _data.$gauge.container.is(":visible")){
                    _data.$gauge.container.hide();
                    needsRedraw = true;
                }else if(_data.options.gauge.on && !_data.$gauge.container.is(":visible")){
                    _data.$gauge.container.show();
                    needsRedraw = true;
                }

                if(options.colors){
                    _data.options.gauge.colors.lowRGB = tinycolor(_data.options.gauge.colors.low).toRgb();
                    _data.options.gauge.colors.highRGB = tinycolor(_data.options.gauge.colors.high).toRgb();
                    _data.options.gauge.colors.diffRGB = {
                        r: _data.options.gauge.colors.highRGB.r - _data.options.gauge.colors.lowRGB.r,
                        g: _data.options.gauge.colors.highRGB.g - _data.options.gauge.colors.lowRGB.g,
                        b: _data.options.gauge.colors.highRGB.b - _data.options.gauge.colors.lowRGB.b,
                        a: _data.options.gauge.colors.highRGB.a - _data.options.gauge.colors.lowRGB.a
                    };
                    needsRedraw = true;
                    _data.$gauge && _this.setGaugeGradientCSS();
                }

                if(options.labels){
                    _data.$gauge.labelLow.html(_data.options.gauge.labels.low);
                    _data.$gauge.labelHigh.html(_data.options.gauge.labels.high);
                }

                needsRedraw && _this.redrawGauge();
            },
            redrawGauge : function(){
                _this.updateGaugeMinMax();
                _this.regionsRedrawColors();
            },
            updateGaugeMinMax : function(){
                _data.options.gauge.min = 0;
                _data.options.gauge.max = false;
                var values = [];
                _data.regions.forEach(function(r){
                    if(r.gaugeValue!=null && r.gaugeValue!=undefined) values.push(r.gaugeValue);
                });
                if(values.length>0){
                    _data.options.gauge.min = values.length == 1 ? 0 : Math.min.apply(null,values);
                    _data.options.gauge.max = Math.max.apply(null,values);
                    _data.options.gauge.maxAdjusted = _data.options.gauge.max - _data.options.gauge.min;
                }
            },
            setGaugeGradientCSS: function(){
                _data.$gauge.gradient.css({
                    background: _data.options.gauge.colors.low,
                    background: '-moz-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    background: '-webkit-gradient(linear, left top, right top, color-stop(1%,' + _data.options.gauge.colors.low + '), color-stop(100%,' + _data.options.gauge.colors.high + '))',
                    background: '-webkit-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    background: '-o-linear-gradient(left, ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100% 100%)',
                    background: '-ms-linear-gradient(left,  ' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100% 100%)',
                    background: 'linear-gradient(to right,' + _data.options.gauge.colors.low + ' 1%,' + _data.options.gauge.colors.high + ' 100%)',
                    'filter': 'progid:DXImageTransform.Microsoft.gradient( startColorstr="' + _data.options.gauge.colors.low + '", endColorstr="' + _data.options.gauge.colors.high + '",GradientType=1 )'
                });
            },
            setMenu : function(options){
                options = options || _data.options.menu;
                options.on != undefined && (options.on = parseBoolean(options.on));
                $.extend(true, _data.options, {menu: options});

                _data.$menu && _data.$menu.off('click.menu.mapsvg');


                if(_data.options.menu.on){
                    var menuContainer = $('#'+_data.options.menu.containerId);

                    if(menuContainer.length){

                        if(!_data.$menu){
                            if(!menuContainer.is('ul')){
                                _data.$menu = $('<ul />').appendTo(menuContainer);
                            }else{
                                _data.$menu = menuContainer;
                            }

                            if(!_data.$menu.hasClass('mapsvg-menu'))
                                _data.$menu.addClass('mapsvg-menu');
                        }

                        if(_data.$menu.children().length===0)
                            // Add links into navigation container
                            _data.regions.forEach(function (region, i) {
                                if(!region.disabled)
                                    _data.$menu.append(_data.options.menu.template(region));
                            });

                        _data.$menu.on('click.menu.mapsvg','a',function(e){
                            e.preventDefault();
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            var center = region.getCenter();
                            //e = {clientX: center[0], clientY: center[1]};
                            e.clientX = center[0];
                            e.clientY = center[1];

                            _this.regionClickHandler(e,region);
                        }).on('mouseover.menu.mapsvg','a',function(e){
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            if (!region.selected)
                                region.highlight();
                        }).on('mouseout.menu.mapsvg','a',function(e){
                            var regionID = $(this).attr('href').replace('#','');
                            var region = _this.getRegion(regionID);
                            if (!region.selected)
                                region.unhighlight();
                        });

                    }
                }
            },
            setMenuMarkers : function(options){
                options = options || _data.options.menuMarkers;
                options.on != undefined && (options.on = parseBoolean(options.on));
                $.extend(true, _data.options, {menuMarkers: options});

                _data.$menuMarkers && _data.$menuMarkers.off('click.menuMarkers.mapsvg');


                if(_data.options.menuMarkers.on){
                    var menuContainer = $('#'+_data.options.menuMarkers.containerId);
                    if(menuContainer.length){
                        if(!_data.$menuMarkers){
                            if(!menuContainer.is('ul')){
                                _data.$menuMarkers = $('<ul />').appendTo(menuContainer);
                            }else{
                                _data.$menuMarkers = menuContainer;
                            }

                            if(!_data.$menuMarkers.hasClass('mapsvg-menu-markers'))
                                _data.$menuMarkers.addClass('mapsvg-menu-markers');
                        }

                        if(_data.$menuMarkers.children().length===0)
                        // Add links into navigation container
                            _data.markers.forEach(function (marker, i) {
                                _data.$menuMarkers.append(_data.options.menuMarkers.template(marker));
                            });

                        _data.$menuMarkers.on('click.menuMarkers.mapsvg','a',function(e){
                            e.preventDefault();
                            var markerID = $(this).attr('href').replace('#','');
                            var marker = _this.getMarker(markerID);
                            var center = marker.getCenter();
                            e = {clientX: center[0], clientY: center[1]};
                            _this.regionClickHandler(e,marker);
                        });
                    }
                }
            },
            /*
             *
             * END SETTERS
             *
             * */
            getRegion : function(id){
                return _data.regions[_data.regionsDict[id]];
            },
            getMarker : function(id){
                return _data.markers[_data.markersDict[id]];
            },
            checkId : function(id){
                if(_this.getRegion(id))
                    return {error: "This ID is already being used by a Region"};
                else if(_this.getMarker(id))
                    return {error: "This ID is already being used by another Marker"};
                else
                    return true;

            },
            regionsRedrawColors: function(){
                _data.regions.forEach(function(region){
                    region.setFill();
                });
            },
            // destroy
            destroy : function(){
                delete instances[_data.$map.attr('id')];
                _data.$map.empty();
                return _this;
            },
            getData : function(){
                return _data;
            },
            // GET SCALE VALUE
            getScale: function(){

                var ratio_def = _data.svgDefault.width / _data.svgDefault.height;
                var ratio_new = _data.options.width / _data.options.height;
                var scale1, scale2;

                var size = [_data.$map.width(), _data.$map.height()];

                scale2 = size[0] / _data.viewBox[2];

                // if scale = 0 it means that map width = 0 which means that map is hidden.
                // so we set scale = 1 to avoid problems with marker positioning.
                // proper scale will be set after map show up
                return scale2 || 1;
            },
            updateSize : function(){
                _data.scale = _this.getScale();
                _this.markersAdjustPosition();
                if(_browser.ie){
                    _this.mapAdjustStrokes();
                }
            },
            // GET VIEBOX [x,y,width,height]
            getViewBox : function(){
                return _data.viewBox;
            },
            // SET VIEWBOX BY SIZE
            viewBoxSetBySize : function(width,height){

                _data._viewBox = _this.viewBoxGetBySize(width,height);
                _data.options.width = parseFloat(width);
                _data.options.height = parseFloat(height);

                //var v = _this.viewBoxGetBySize(width,height);
                //_data.viewBox  = $.extend([],_data._viewBox);
                //_data.scale    = _this.getScale();
                //_data.zoomLevel = 0;

                _this.setViewBox(_data._viewBox, true);

                //_data.$svgStretcher.attr('src',
                //    "data:image/svg+xml;charset=utf-8,<svg viewBox='0 0 "+_data._viewBox[2]+" "+_data._viewBox[3]+"' xmlns='http://www.w3.org/2000/svg'/>"
                //);
                //

                _data.whRatio = _data.viewBox[2] / _data.viewBox[3];
                if(!_data.options.responsive)
                    _this.setResponsive();
                //_this.updateSize();

                return _data.viewBox;
            },
            viewBoxGetBySize : function(width, height){


                var new_ratio = width / height;
                var old_ratio = _data.svgDefault.viewBox[2] / _data.svgDefault.viewBox[3];

                var vb = $.extend([],_data.svgDefault.viewBox);

                if (new_ratio != old_ratio){
                    //vb[2] = width*_data.svgDefault.viewBox[2] / _data.svgDefault.width;
                    //vb[3] = height*_data.svgDefault.viewBox[3] / _data.svgDefault.height;
                    if (new_ratio > old_ratio){
                        vb[2] = _data.svgDefault.viewBox[3] * new_ratio;
                        vb[0] = _data.svgDefault.viewBox[0] - ((vb[2] - _data.svgDefault.viewBox[2])/2);
                    }else{
                        vb[3] = _data.svgDefault.viewBox[2] / new_ratio;
                        vb[1] = _data.svgDefault.viewBox[1] - ((vb[3] - _data.svgDefault.viewBox[3])/2);
                    }

                }

                return vb;
            },
            viewBoxReset : function(toInitial){
                if(toInitial){
                    var v = _data._viewBox || _data.svgDefault.viewBox;
                    _data.zoomLevel = 0;
                    _data._scale = 1;
                    _this.setViewBox(v);
                }else{
                    _this.setViewBox();
                }
            },
            getGeoViewBox : function(){
                var v = _data.viewBox;
                var leftLon = _this.convertPixelToGeo(v[0],v[1])[1];
                var rightLon = _this.convertPixelToGeo(v[0]+v[2],v[1])[1];
                var topLat = _this.convertPixelToGeo(v[0],v[1])[0];
                var bottomLat = _this.convertPixelToGeo(v[0],v[1]+v[3])[0];
                return [leftLon, topLat, rightLon, bottomLat];
            },
            mapAdjustStrokes : function(){
                _data.regions.forEach(function(region){
                    if(region.svg_style['stroke-width']){
                        region.node.css('stroke-width', region.svg_style['stroke-width'] / _data.scale);
                    }
                });
            },
            // ZOOM
            zoomIn: function(){
                _this.zoom(1);
            },
            zoomOut: function(){
                _this.zoom(-1);
            },
            touchZoomStart : function (touchScale){

                touchZoomStart = _data._scale;
                _data.scale  = _data.scale * zoom_k;
                zoom   = _data._scale;
                _data._scale = _data._scale * zoom_k;


                var vWidth     = _data.viewBox[2];
                var vHeight    = _data.viewBox[3];
                var newViewBox = [];

                newViewBox[2]  = _data._viewBox[2] / _data._scale;
                newViewBox[3]  = _data._viewBox[3] / _data._scale;

                newViewBox[0]  = _data.viewBox[0] + (vWidth - newViewBox[2]) / 2;
                newViewBox[1]  = viewBox[1] + (vHeight - newViewBox[3]) / 2;

                _this.setViewBox(newViewBox);

            },
            touchZoomMove : function(){

            },
            touchZoomEnd : function(){

            },
            zoom : function (delta, exact){

                var vWidth     = _data.viewBox[2];
                var vHeight    = _data.viewBox[3];
                var newViewBox = [];

                if(!exact){
                    // check for zoom limit
                    var d = delta > 0 ? 1 : -1;
                    _data._zoomLevel = _data.zoomLevel;
                    _data._zoomLevel += d;
                    if(_data._zoomLevel > _data.options.zoom.limit[1] || _data._zoomLevel < _data.options.zoom.limit[0]) return false;

                    _data.zoomLevel = _data._zoomLevel;

                    var zoom_k = d * _data.options.zoom.delta;
                    if (zoom_k < 1) zoom_k = -1/zoom_k;

                    _data._scale         = _data._scale * zoom_k;
                    newViewBox[2]  = _data._viewBox[2] / _data._scale;
                    newViewBox[3]  = _data._viewBox[3] / _data._scale;
                }else{
                    _data._scale         = exact;
                    newViewBox[2]  = _data.touchZoomStartViewBox[2] / _data._scale;
                    newViewBox[3]  = _data.touchZoomStartViewBox[3] / _data._scale;
                }

                newViewBox[0]  = _data.viewBox[0] + (vWidth - newViewBox[2]) / 2;
                newViewBox[1]  = _data.viewBox[1] + (vHeight - newViewBox[3]) / 2;
                // Limit scroll to map's boundaries
                if(_data.options.scroll.limit)
                {
                    if(newViewBox[0] < _data.svgDefault.viewBox[0])
                        newViewBox[0] = _data.svgDefault.viewBox[0];
                    else if(newViewBox[0] + newViewBox[2] > _data.svgDefault.viewBox[0] + _data.svgDefault.viewBox[2])
                        newViewBox[0] = _data.svgDefault.viewBox[0]+_data.svgDefault.viewBox[2]-newViewBox[2];

                    if(newViewBox[1] < _data.svgDefault.viewBox[1])
                        newViewBox[1] = _data.svgDefault.viewBox[1];
                    else if(newViewBox[1] + newViewBox[3] > _data.svgDefault.viewBox[1] +_data.svgDefault.viewBox[3])
                        newViewBox[1] = _data.svgDefault.viewBox[1]+_data.svgDefault.viewBox[3]-newViewBox[3];
                }


                _this.setViewBox(newViewBox);

            },
            // MARK : DELETE
            markerDelete: function(marker){
                var id = marker.id;
                var test = _data.markers.splice(_data.markersDict[id],1);
                //_data.options.markers.splice(_data.markersDict[id],1);
                marker.delete();
                marker = null;
                _this.updateMarkersDict();
                if (_data.markers.length == 0)
                    _data.options.markerLastID = 0;
            },
            // MARK : ADD
            markerAdd : function(opts, create) {
                // Join default marker options with user-defined options
                var options = $.extend(true, {}, markerOptions, opts);

                if(!options.src)
                    return false;

                options.src = safeURL(options.src);

                if (options.width && options.height){
                    return _this.markerAddFinalStep(options, create);
                }else{
                    var img = new Image();
                    img.onload = function(){
                        options.width = this.width;
                        options.height = this.height;
                        return _this.markerAddFinalStep(options, create);
                    };
                    img.src = options.src;
                }
            },
            markerAddFinalStep : function(options, create){


                if (options.xy || (isNumber(options.x) && isNumber(options.y))){
                    xy = options.xy || [options.x, options.y];
                    if(create){
                        xy[0] += _data.scale < 1 ? 1 : 2; // not sure what's happening here but works good
                        xy[1] += 1;

                        //xy[0] = xy[0]/_data.scale - options.width/(2*_data.scale) + _data.viewBox[0];
                        //xy[1] = (xy[1]-options.height)/_data.scale + _data.viewBox[1];
                        //
                        //markerX       = markerX + markerWidth/(2*mapScale) - markerWidth/2;
                        //markerY       = markerY + markerHeight/mapScale - markerHeight;

                        xy[0] = xy[0]/_data.scale - options.width/2 + _data.viewBox[0];
                        xy[1] = xy[1]/_data.scale - options.height + _data.viewBox[1];


                        //xy = Marker.getDefaultCoords(xy[0],xy[1], options.width, options.height, this.getScale());


                    }
                }else if(options.geoCoords) {
                    xy = _this.convertGeoToPixel(options.geoCoords);
                    xy[0] = xy[0] - options.width / 2 + .3;
                    xy[1] = (xy[1] - options.height) + 1.5;
                }else{
                    return false;
                }

                options.x = xy[0];
                options.y = xy[1];
                options.id  = options.id || 'marker_'+(_data.options.markerLastID++);
                if(!options.geoCoords && _data.mapIsGeo){
                    options.geoCoords = _this.convertPixelToGeo(options.x + options.width/2, options.y + (options.height-1));
                }

                var marker = new Marker(options, _data.scale);

                _data.$svg.append(marker.node);
                marker.href && marker.setHref(marker.href);
                // Create a group
                // var group = marker.data('group') || 'root';
//                if(!_data.markerGroups[group])
//                    _data.markerGroups[group] = [];                
//                _data.markerGroups[group].push(marker);

                marker.adjustPosition(_data.scale);
                _data.markers.push(marker);
                _data.markersDict[marker.id] = _data.markers.length - 1;

                // Call edit window
                if(create && _data.markerEditHandler)
                    _data.markerEditHandler.call(marker);

                return marker;
            },
            markersAdjustPosition : function(){
                // We want a marker "tip" to be on bottom side (like a pin)
                // But Raphael starts to draw an image from left top corner.
                // At the same time we don't want a marker to be scaled in size when map scales;
                // Mark always should stay the same size.
                // In this case coordinates of bottom point of image will vary with map scaling.
                // So we have to calculate the offset.
                var dx, dy;
                _data.markers.forEach(function(marker){
                    marker.adjustPosition(_data.scale);
                });
            },
            // MARK MOVE & EDIT HANDLERS
            markerMoveStart : function(){
                // storing original coordinates
                this.data('ox', parseFloat(this.attr('x')));
                this.data('oy', parseFloat(this.attr('y')));
            },
            markerMove : function (dx, dy) {
                dx = dx/_data.scale;
                dy = dy/_data.scale;
                this.attr({x: this.data('ox') + dx, y: this.data('oy') + dy});
            },
            markerMoveEnd : function () {
                // if coordinates are same then it was a "click" and we should start editing
                if(this.data('ox') == this.attr('x') && this.data('oy') == this.attr('y')){
                    options.markerEditHandler.call(this);
                }
            },
            scrollStart : function (e,mapsvg){

                if($(e.target).hasClass('mapsvg-btn-zoom') || $(e.target).closest('.mapsvg-gauge').length)
                    return false;

                if(_data.editMarkers.on && $(e.target).attr('class')=='mapsvg-marker')
                    return false;
                //mapsvg.getData().$map.css('pointer-events','none');


                e.preventDefault();
                if(touchDevice){
                    var ce = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0] : e;
                }else{
                    var ce = e;
                }

                _data.scroll = {};

                // initial viewbox when scrollning started
                _data.scroll.vxi = _data.viewBox[0];
                _data.scroll.vyi = _data.viewBox[1];
                // mouse coordinates when scrollning started
                _data.scroll.x  = ce.clientX;
                _data.scroll.y  = ce.clientY;
                // mouse delta
                _data.scroll.dx = 0;
                _data.scroll.dy = 0;
                // new viewbox x/y
                _data.scroll.vx = 0;
                _data.scroll.vy = 0;

                if(!touchDevice)
                    $('body').on('mousemove.scroll.mapsvg', _this.scrollMove).on('mouseup.scroll.mapsvg', function(e){_this.scrollEnd(e,mapsvg);});
                //else
                //    $('body').on('touchmove.scroll.mapsvg', _this.scrollMove).on('touchmove.scroll.mapsvg', function(e){_this.scrollEnd(e,mapsvg);});
            },
            scrollMove :  function (e){

                e.preventDefault();

                _data.isScrolling = true;

                $('body').css({'cursor': 'move'});

                var ce = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ? e.originalEvent.touches[0] : e;

                // delta x/y
                _data.scroll.dx = (_data.scroll.x - ce.clientX);
                _data.scroll.dy = (_data.scroll.y - ce.clientY);

                // new viewBox x/y
                var vx = parseInt(_data.scroll.vxi + _data.scroll.dx /_data.scale);
                var vy = parseInt(_data.scroll.vyi + _data.scroll.dy /_data.scale);

                // Limit scroll to map's boundaries
                if(_data.options.scroll.limit){

                    if(vx < _data.svgDefault.viewBox[0])
                        vx = _data.svgDefault.viewBox[0];
                    else if(_data.viewBox[2] + vx > _data.svgDefault.viewBox[0] + _data.svgDefault.viewBox[2])
                        vx = (_data.svgDefault.viewBox[0]+_data.svgDefault.viewBox[2]-_data.viewBox[2]);

                    if(vy < _data.svgDefault.viewBox[1])
                        vy = _data.svgDefault.viewBox[1];
                    else if(_data.viewBox[3] + vy > _data.svgDefault.viewBox[1] + _data.svgDefault.viewBox[3])
                        vy = (_data.svgDefault.viewBox[1]+_data.svgDefault.viewBox[3]-_data.viewBox[3]);

                }

                _data.scroll.vx = vx;
                _data.scroll.vy = vy;


                // set new viewBox
                _this.setViewBox([_data.scroll.vx,  _data.scroll.vy, _data.viewBox[2], _data.viewBox[3]]);
                //_data.$map.css({'-webkit-transform' : 'translate('+vx+'px,'+vy+'px'});

            },
            scrollEnd : function (e,mapsvg){

                _data.isScrolling = false;

                // call regionClickHandler if mouse did not move more than 5 pixels
                if (Math.abs(_data.scroll.dx)<5 && Math.abs(_data.scroll.dy)<5){
                    if(_data.editMarkers.on)
                        _this.markerAddClickHandler(e);
                    else if (_data.region_clicked)
                        _this.regionClickHandler(e, _data.region_clicked);
                }

                $('body').css({'cursor': 'default'});

                _data.viewBox[0] = _data.scroll.vx || _data.viewBox[0];
                _data.viewBox[1] = _data.scroll.vy || _data.viewBox[1] ;

                //_data.$map.css('pointer-events','auto');

                $('body').off('.scroll.mapsvg');
            },
            // REMEMBER WHICH REGION WAS CLICKED BEFORE START PANNING
            scrollRegionClickHandler : function (e, region) {
                _data.region_clicked = region;
            },
            touchStart : function (_e,mapsvg){
                _e.preventDefault();
                var e = _e.originalEvent;
                if(_data.options.zoom && e.touches && e.touches.length == 2){
                    _data.touchZoomStartViewBox = _data.viewBox;
                    _data.touchZoomStart =  _data.scale;
                    _data.touchZoomEnd   =  1;
                }else{
                    _this.scrollStart(_e,mapsvg);
                    _data.isScrolling = true;
                }
            },
            touchMove : function (_e){
                _e.preventDefault();
                var e = _e.originalEvent;
                if(_data.options.zoom && e.touches && e.touches.length >= 2){
                    _this.zoom(null, e.scale);
                    _data.isScrolling = false;
                }else if(_data.isScrolling){
                    _this.scrollMove(_e);
                }
            },
            touchEnd : function (_e){
                _e.preventDefault();
                var e = _e.originalEvent;
                if(_data.touchZoomStart){
                    _data.touchZoomStart  = false;
                    _data.touchZoomEnd    = false;
                }else if(_data.isScrolling){
                    _this.scrollEnd(_e);
                }
            },
            markersGroupHide : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].hide();
                }
            },
            markersGroupShow : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].show();
                }
            },
            regionsGroupSelect : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].hide();
                }
            },
            regionsGroupUnselect : function(group){
                for(var i in _data.markers[group]){
                    _data.markers[group][i].show();
                }
            },
            // GET ALL MARKERS
            markersGet : function(){
                return _data.markers;
            },
            // GET SELECTED REGION OR ARRAY OF SELECTED REGIONS
            getSelected : function(){
                return _data.selected_id;
            },
            // SELECT REGION
            selectRegion :    function(id){
                if(typeof id == "string"){
                    var region = _this.getRegion(id);
                }else{
                    var region = id;
                }
                if(!region || region.disabled) return false;
                if(_data.options.multiSelect && !_data.editRegions.on){
                    if(region.selected){
                        _this.deselectRegion(region);
                        return;
                    }
                }else if(_data.selected_id.length>0){
                    _this.deselectRegion();
                }
                _data.selected_id.push(region.id);
                region.select();
            },
            deselectAllRegions : function(){
                $.each(_data.selected_id, function(index,id){
                    _this.deselectRegion(_this.getRegion(id));
                });
            },
            deselectRegion : function (region){
                if(!region)
                    region = _this.getRegion(_data.selected_id[0]);
                region.deselect();
                var i = $.inArray(region.id, _data.selected_id);
                _data.selected_id.splice(i,1);
                if(_browser.ie)//|| _browser.firefox)
                    _this.mapAdjustStrokes();
            },
            selectRegionsGroup : function(group_id){
                for(var r in _data.regionGroups[group_id]){
                    var region_id = _data.regionGroups[group_id][r].id;
                    _this.selectRegion(region_id);
                }
            },
            highlightRegionsGroup : function(group_id){
                for(var r in _data.regionGroups[group_id]){
                    var region_id = _data.regionGroups[group_id][r].id;
                    _this.highlightRegion(region_id);
                }
            },
            unhighlightRegionsGroup : function(group_id){
                for(var r in _data.regionGroups[group_id]){
                    var region_id = _data.regionGroups[group_id][r].id;
                    _this.unhighlightRegion(region_id);
                }
            },


            narrowToRegionsGroup : function(group_id){
                _data.regions.forEach(function(r){
                    if(r.group!=group_id && !r.disabled){
                        r.disabled = true;
                        r.disabledTemp = true;
                        $(r.node).addClass('mapsvg-disabled');
                    }else{
                        if(r.disabledTemp){
                            r.disabledTemp = false;
                            r.disabled = false;
                            $(r.node).removeClass('mapsvg-disabled');
                        }
                    }
                });
            },
            disableRegionsGroup : function(group_id){

            },
            enableAllRegionsGroups : function(){
                _data.regions.forEach(function(r){
                    if(r.disabledTemp){
                        r.disabledTemp = false;
                        r.disabled = false;
                        $(r.node).removeClass('mapsvg-disabled');
                    }
                });
            },
            convertGeoToPixel: function (coords){

                var lat = parseFloat(coords[0]);
                var lon = parseFloat(coords[1]);
                var x = (lon - _data.geoViewBox.leftLon) * (_data.svgDefault.width / _data.mapLonDelta);

                var lat = lat * 3.14159 / 180;
                var worldMapWidth = ((_data.svgDefault.width / _data.mapLonDelta) * 360) / (2 * 3.14159);
                var mapOffsetY = (worldMapWidth / 2 * Math.log((1 + Math.sin(_data.mapLatBottomDegree)) / (1 - Math.sin(_data.mapLatBottomDegree))));
                var y = _data.svgDefault.height - ((worldMapWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - mapOffsetY);

                x += _data.svgDefault.viewBox[0];
                y += _data.svgDefault.viewBox[1];

                return [x, y];
            },
            convertPixelToGeo: function (tx, ty){
                tx -= _data.svgDefault.viewBox[0];
                ty -= _data.svgDefault.viewBox[1];
                /* called worldMapWidth in Raphael's Code, but I think that's the radius since it's the map width or circumference divided by 2*PI  */
                var worldMapRadius = _data.svgDefault.width / _data.mapLonDelta * 360/(2 * Math.PI);
                var mapOffsetY = ( worldMapRadius / 2 * Math.log( (1 + Math.sin(_data.mapLatBottomDegree) ) / (1 - Math.sin(_data.mapLatBottomDegree))  ));
                var equatorY = _data.svgDefault.height + mapOffsetY;
                var a = (equatorY-ty)/worldMapRadius;
                var lat = 180/Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI/2);
                var long = _data.geoViewBox.leftLon+tx/_data.svgDefault.width*_data.mapLonDelta;

                return [lat,long];
            },
            // PICK COLOR FROM GRADIENT
            pickGaugeColor: function(gaugeValue) {
                var w = (gaugeValue - _data.options.gauge.min) / _data.options.gauge.maxAdjusted;
                var rgb = [
                    Math.round(_data.options.gauge.colors.diffRGB.r * w + _data.options.gauge.colors.lowRGB.r),
                    Math.round(_data.options.gauge.colors.diffRGB.g * w + _data.options.gauge.colors.lowRGB.g),
                    Math.round(_data.options.gauge.colors.diffRGB.b * w + _data.options.gauge.colors.lowRGB.b),
                    Math.round(_data.options.gauge.colors.diffRGB.a * w + _data.options.gauge.colors.lowRGB.a)
                ];
                return rgb;
            },
            // CHECK IF REGION IS DISABLED
            isRegionDisabled : function (id, svgfill){

                if(_data.options.regions[id] && (_data.options.regions[id].disabled || svgfill == 'none') ){
                    return true;
                }else if(
                    (_data.options.regions[id] == undefined || parseBoolean(_data.options.regions[id].disabled)) &&
                    (_data.options.disableAll || svgfill == 'none' || id == 'labels' || id == 'Labels')

                ){
                    return true;
                }else{
                    return false;
                }
            },
            regionClickHandler : function(e, region){

                if(!region || region.disabled) return false;

                _data.region_clicked = null;

                if(region.mapsvg_type=='region')
                    _this.selectRegion(region.id);
                if(_data.editRegions.on){
                    _data.regionEditHandler.call(region);
                    return;
                }
                _this.hidePopover();
                var popover = _this.getPopoverBody(region);
                popover && _this.showPopover(e, popover);

                if(_data.options.onClick)
                    _data.options.onClick.call(region, e, _this);

                if(region.href && !_data.disableLinks)
                    window.location.href = region.href;
            },
            fileExists : function(url){
                if(url.substr(0,4)=="data")
                    return true;
                var http = new XMLHttpRequest();
                http.open('HEAD', url, false);
                http.send();
                return http.status!=404;
            },
            getStyle : function(elem,prop){
                if (elem.currentStyle) {
                    var res= elem.currentStyle.margin;
                } else if (window.getComputedStyle) {
                    if (window.getComputedStyle.getPropertyValue){
                        var res= window.getComputedStyle(elem, null).getPropertyValue(prop)}
                    else{var res =window.getComputedStyle(elem)[prop] };
                }
                return res;
            },
            search: function(str){
                results = [];
                str = str.toLowerCase();
                _data.regions.forEach(function(r){
                    if(r.id.toLowerCase().indexOf(str) === 0 || (r.title && r.title.toLowerCase().indexOf(str) === 0))
                        results.push(r.id);
                });
                return results;
            },
            searchMarkers: function(str){
                results = [];
                str = str.toLowerCase();
                _data.markers.forEach(function(m){
                    if(m.id.toLowerCase().indexOf(str) === 0)
                        results.push(m.id);
                });
                return results;
            },
            markerAddClickHandler : function(e){
                // Don't add marker if marker was clicked
                if($(e.target).is('image')) return false;
                var mc = mouseCoords(e);
                var x = mc.x - _data.$map.offset().left;
                var y = mc.y - _data.$map.offset().top;

                if(!$.isNumeric(x) || !$.isNumeric(y))
                    return false;

                _this.markerAdd({xy: [x, y], group: _data.editMarkers.group}, true);
            },
            setMarkersEditMode : function(on){
                _data.editMarkers.on = parseBoolean(on);
                _this.deselectAllRegions();
                _this.setEventHandlers();
            },
            setRegionsEditMode : function(on){
                _data.editRegions.on = parseBoolean(on);
                _this.deselectAllRegions();
                _this.setEventHandlers();
            },
            // Adding markers
            setMarkers : function (markers){
                $.each(markers, function(i, marker){
                    _this.markerAdd(marker);
                });
            },
            setEventHandler : function(){

            },
            textBr: function(text){
                var htmls = [];
                var lines = text.split(/\n/);
                var tmpDiv = jQuery(document.createElement('div'));
                for (var i = 0 ; i < lines.length ; i++) {
                    htmls.push(tmpDiv.text(lines[i]).html());
                }
                return htmls.join("<br />");
            },
            runUserFunction : function(func){
                try{
                    func();
                }catch(error){
                    console.log("MapSVG user-defined function error: (line "+error.line+"): "+error.message);
                }
            },
            showTooltip : function(region){
                if(region.disabled)
                    return false;

                var tip;
                if (_data.options.tooltips.priority == "global"){
                    tip =
                        (typeof _data.options.tooltips.mode == "function") && _data.options.tooltips.mode.call(region,_data.mapTip, region, _this)
                        ||
                        _data.options.tooltips.mode!='off' && region[_data.options.tooltips.mode]
                        ||
                        region.tooltip
                }else{
                    tip =
                        region.tooltip
                        ||
                        (typeof _data.options.tooltips.mode == "function") && _data.options.tooltips.mode.call(region,_data.mapTip, region, _this)
                        ||
                        _data.options.tooltips.mode!='off' && region[_data.options.tooltips.mode];
                }
                if (tip){
                    _data.mapTip.html(tip);
                    _data.mapTip.addClass('mapsvg-tooltip-visible');
                }
            },
            getPopoverBody: function(region){
                var popover;
                if(_data.options.popovers.priority == 'global'){
                    popover = typeof _data.options.popovers.mode == 'function' ? _data.options.popovers.mode.call(region, _data.mapPopover, region, _this) : region.popover;
                }else{
                    popover = region.popover || (typeof _data.options.popovers.mode == 'function' ? _data.options.popovers.mode.call(region, _data.mapPopover, region, _this) : null);
                }

                return popover;
            },
            showPopover : function (e, content, pos){

                if (!pos || pos.length != 2){
                    var m   = mouseCoords(e);
                    var pos = [m.x, m.y];
                }else{
                    var scale = _this.getScale();
                    pos[0] = _data.$map.offset().left  + pos[0]*scale;
                    pos[1] = _data.$map.offset().top + pos[1]*scale;
                }

                if(content){
                    _data.mapPopover.contentDiv.html(content);
                    var nx = pos[0] - _data.mapPopover.outerWidth(false)/2;
                    var ny = pos[1] - _data.mapPopover.outerHeight(false) - 14;
                    if(nx<0) nx = 0;
                    if(ny<0) ny = 0;

                    //if(nx+_data.mapPopover.outerWidth(false) > $(window).scrollLeft() + $(window).width()) nx = ($(window).scrollLeft() + $(window).width()) - _data.mapPopover.outerWidth(false);
                    //if(ny+_data.mapPopover.outerHeight(false) > $(window).scrollTop() + $(window).height()) ny = ($(window).scrollTop() + $(window).height()) - _data.mapPopover.outerHeight(false);
                    //if(nx < $(window).scrollLeft()) nx = $(window).scrollLeft();
                    //if(ny < $(window).scrollTop()) ny = $(window).scrollTop();

                    _data.mapPopover.css('left', nx).css('top', ny);
                    //_data.mapPopover.show();
                    _data.mapPopover.addClass('mapsvg-popover-visible');
                }else{
                    _data.mapPopover.removeClass('mapsvg-popover-visible');
                }
            },
            hidePopover : function(){
                _data.mapPopover.contentDiv.empty();
                //_data.mapPopover.hide(0,function(){
                //    $('body').off('mousedown.popover.mapsvg', _this.popoverOffHandler);
                //    if(_data.options.onPopoverClose)
                //        _data.options.onPopoverClose.call(_this);
                //});
                _data.mapPopover.removeClass('mapsvg-popover-visible');
                $('body').off('mousedown.popover.mapsvg', _this.popoverOffHandler);
                if(_data.options.onPopoverClose)
                    _data.options.onPopoverClose.call(_this);
            },            // Hide tooltip
            hideTip : function (){
                _data.mapTip.removeClass('mapsvg-tooltip-visible');
                //_data.mapTip.html('');
            },
            popoverOffHandler : function(e){

                // If clicked object was popover by itself, stop.
                if($(e.target).closest('.mapsvg-popover').length)
                    return false;

                _this.hidePopover();
            },
            mouseOverHandler : function(e){
                //if (this.disabled)
                //    return false;
                if(this instanceof Region) {
                    if (!this.selected)
                        this.highlight();
                }
                _this.showTooltip(this);
                //// TODO как-то убрать
                //if(!_data.editRegions.on && !_data.editMarkers.on)
                return _data.options.mouseOver && _data.options.mouseOver.call(this, e, _this);
            },
            mouseOutHandler : function(e){
                //if (this.disabled)
                //    return false;
                if(this instanceof Region) {
                    if (!this.selected)
                        this.unhighlight();
                }
                _this.hideTip();
                //// todo remove
                //if(!_data.editRegions.on && !_data.editMarkers.on)
                return _data.options.mouseOut && _data.options.mouseOut.call(this, e, _this);
            },
            updateOptions : function(options){
                $.extend(true,_data.options,options);
            },
            updateMarkersDict : function(){
                _data.markersDict = {};
                _data.markers.forEach(function(marker, i){
                    _data.markersDict[marker.id] = i;
                });
            },
            setEventHandlers : function(){

                _data.$map.off('.common.mapsvg');

                if(_data.editMarkers.on){

                    var event2 = touchDevice ? 'touchstart.common.mapsvg' : 'mousedown.common.mapsvg';
                    _data.$map.on(event2, '.mapsvg-marker',function(e){
                        e.originalEvent.preventDefault();
                        var marker = _this.getMarker($(this).attr('id'));
                        var startCoords = mouseCoords(e);
                        marker.drag(startCoords, _data.scale, function() {
                            if (_data.mapIsGeo){
                                // TODO fix y-shift
                                this.geoCoords = _this.convertPixelToGeo(this.x + this.width / 2, this.y + (this.height-1));
                            }

                            _data.markerEditHandler.call(this,true);
                        },function(){
                            _data.markerEditHandler.call(this);
                        });
                    });
                }

                // REGIONS
                if (!touchDevice) {
                    if(!_data.editMarkers.on) {
                        _data.$map.on('mouseover.common.mapsvg', '.mapsvg-region', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOverHandler.call(_this.getRegion(id), e, _this, options);
                        }).on('mouseleave.common.mapsvg', '.mapsvg-region', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOutHandler.call(_this.getRegion(id), e, _this, options);
                        });
                    }
                    if(!_data.editRegions.on){
                        _data.$map.on('mouseover.common.mapsvg', '.mapsvg-marker', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOverHandler.call(_this.getMarker(id), e, _this, options);
                        }).on('mouseleave.common.mapsvg', '.mapsvg-marker', function (e) {
                            var id = $(this).attr('id');
                            _this.mouseOutHandler.call(_this.getMarker(id), e, _this, options);
                        });
                    }
                }

                if (!_data.options.scroll.on) {
                    var event = touchDevice ? 'touchstart.common.mapsvg' : 'click.common.mapsvg';
                    if(!_data.editMarkers.on) {
                        _data.$map.on(event, '.mapsvg-region', function (e) {
                            _this.regionClickHandler.call(_this, e, _this.getRegion($(this).attr('id')));
                        });
                        _data.$map.on(event, '.mapsvg-marker', function (e) {
                            _this.regionClickHandler.call(_this, e, _this.getMarker($(this).attr('id')));
                        });
                    }else{
                        _data.$map.on(event, function (e) {
                            _this.markerAddClickHandler(e);
                        });
                    }
                } else {
                    var event = touchDevice ? 'touchstart.common.mapsvg' : 'mousedown.common.mapsvg';
                    _data.$map.on(event, '.mapsvg-region', function (e) {
                            e.preventDefault();
                            var obj = _this.getRegion($(this).attr('id'));
                            _this.scrollRegionClickHandler.call(_this, e, obj);
                        }
                    );
                    _data.$map.on(event, '.mapsvg-marker', function (e) {
                            e.preventDefault();
                            var obj = _this.getMarker($(this).attr('id'));
                            _this.scrollRegionClickHandler.call(_this, e, obj);
                        }
                    );
                    if (!touchDevice) {
                        _data.$map.on('mousedown.common.mapsvg', function(e){_this.scrollStart(e,_this);});
                    } else {
                        _data.$map.on('touchstart.common.mapsvg', function(e){_this.touchStart(e,_this);})
                            .on('touchmove.common.mapsvg', _this.touchMove)
                            .on('touchend.common.mapsvg', _this.touchEnd);
                    }
                }
            },
            // INIT
            init: function(opts, elem) {

                if(!opts.source) {
                    throw new Error('MapSVG: please provide SVG file source.');
                    return false;
                }


                if(opts.beforeLoad)
                    try{opts.beforeLoad.call(_this);}catch(err){}

                // cut domain to avoid cross-domain errors
                if(opts.source.indexOf('//')===0)
                    opts.source = opts.source.replace(/^\/\/[^\/]+/, '').replace('//','/');
                else
                    opts.source = opts.source.replace(/^.*:\/\/[^\/]+/, '').replace('//','/');

                /** Setting _data **/
                _data  = {};
                _data.options = $.extend(true, {}, defaults, opts);
                _data.editRegions = {on:false};
                _data.editMarkers = {on:false};
                _data.map  = elem;
                _data.$map = $(elem);
                _data.whRatio = 0;
                _data.isScrolling = false;
                _data.markerOptions = {};
                _data.svgDefault = {};
                _data.refLength = 0;
                _data.scale  = 1;         // absolute scale
                _data._scale = 1;         // relative scale starting from current zoom level
                _data.selected_id    = [];
                _data.mapData        = {};
                _data.regions        = [];
                _data.regionsDict    = {};
                _data.regionID       = {id: 0};
                _data.markers        = [];
                _data.markersDict    = {};
                _data._viewBox       = []; // initial viewBox
                _data.viewBox        = []; // current viewBox
                _data.viewBoxZoom    = [];
                _data.viewBoxFind    = undefined;
                _data.zoomLevel      = 0;
                _data.scroll         = {};
                _data.geoCoordinates = false,
                    _data.geoViewBox     = {leftLon:0, topLat:0, rightLon:0, bottomLat:0},


                    // Set background
                    _data.$map.addClass('mapsvg').css('background',_data.options.colors.background);

                var loading = $('<div>'+_data.options.loadingText+'</div>').addClass('mapsvg-loading');
                _data.$map.append(loading);
                loading.css({
                    'margin-left': function () {
                        return -($(this).outerWidth(false) / 2)+'px';
                    },
                    'margin-top': function () {
                        return -($(this).outerHeight(false) / 2)+'px';
                    }
                });

                // GET the map by ajax request
                $.ajax({
                    url: _data.options.source,
                    success:  function(xmlData){

                        $data = $(xmlData);

                        // Default width/height/viewBox from SVG
                        var svgTag               = $data.find('svg');
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

                        // Get geo-coordinates view  box from SVG file
                        var geo               = svgTag.attr("mapsvg:geoViewBox");
                        if (geo) {
                            geo = geo.split(" ");
                            if (geo.length == 4){
                                _data.mapIsGeo = true;
                                _data.geoCoordinates = true;
                                var v = svgTag.attr("mapsvg:calibratedViewBox");

                                _data.geoViewBox = {leftLon: parseFloat(geo[0]),
                                    topLat: parseFloat(geo[1]),
                                    rightLon: parseFloat(geo[2]),
                                    bottomLat: parseFloat(geo[3])
                                };
                                _data.mapLonDelta = _data.geoViewBox.rightLon - _data.geoViewBox.leftLon;
                                _data.mapLatBottomDegree = _data.geoViewBox.bottomLat * 3.14159 / 180;

                            }

                        }

                        $.each(_data.svgDefault.viewBox, function(i,v){
                            _data.svgDefault.viewBox[i] = parseInt(v);
                        });

                        _data._viewBox  = (_data.options.viewBox.length==4 && _data.options.viewBox ) || _data.svgDefault.viewBox;

                        $.each(_data._viewBox, function(i,v){
                            _data._viewBox[i] = parseFloat(v);
                        });

                        svgTag.attr('preserveAspectRatio','xMidYMid meet');
                        svgTag.attr('width','100%');
                        svgTag.attr('height','100%');

                        //// Adding moving sticky draggable image on background
                        //if(_data.options.scrollBackground)
                        //    _data.background = _data.R.rect(_data.svgDefault.viewBox[0],_data.svgDefault.viewBox[1],_data.svgDefault.viewBox[2],_data.svgDefault.viewBox[3]).attr({fill: _data.options.colors.background});

                        _data.$svg.find('path, polygon, circle, ellipse, rect').each(function(index){
                            var region = new Region($(this), _data.options, _data.regionID, _this);
                            _data.regions.push(region);
                            _data.regionsDict[region.id] = index;
                            if (region.autoID){
                                _data.presentAutoID = true;
                            }
                        });

                        // Set size
                        _this.setSize(_data.options.width, _data.options.height, _data.options.responsive);

                        _data.$map.append(svgTag);

                        // Set viewBox
                        var v =  _data._viewBox;
                        _this.setViewBox(v);

                        // SET Gauge colors
                        _this.setGauge();

                        // If there are markers, put them to the map
                        var markers = _data.options.markers || _data.options.marks || [];
                        _this.setMarkers(markers);
                        //_this.setMarkersEditMode(_data.editMarkers.on);

                        // Set scrollning
                        _this.setScroll(_data.options.scroll);

                        // Set zooming by mouswheel
                        _this.setZoom(_data.options.zoom);

                        // Set tooltips
                        // tooltipsMode is deprecated, need this for backward compatibility
                        if (_data.options.tooltipsMode)
                            _data.options.tooltips.mode = _data.options.tooltipsMode;
                        _this.setTooltips(_data.options.tooltips);

                        // Set popovers
                        // popover is deprecated (now it's popover), need this for backward compatibility
                        if (_data.options.popover)
                            _data.options.popovers = _data.options.popover;
                        _this.setPopovers(_data.options.popovers);

                        if(_data.options.cursor)
                            _this.setCursor(_data.options.cursor);


                        if(_browser.ie)//|| _browser.firefox)
                            _this.mapAdjustStrokes();

                        $(document).ready(function(){
                            _this.setMenu();
                            _this.setMenuMarkers();

                        });

                        /* EVENTS */

                        _this.setEventHandlers();

                        $('#'+_data.$map.attr('id')+' [title]').each(function(){this.removeAttribute('title')});
                        $('#'+_data.$map.attr('id')+' title').remove();


                        loading.hide();


                        if(_data.options.afterLoad)
                            _data.options.afterLoad.call(_this);

                        _this.updateSize();
                    } // end of AJAX callback
                });// end of AJAX

                return _this;

            } // end of init

        }; // end of methods

        var _this = this.methods;



    }; // end of mapSVG class


    /** $.FN **/
    $.fn.mapSvg2 = function( opts ) {

        var id = $(this).attr('id');

        if(typeof opts == 'object' && instances[id] === undefined){
            instances[id] = new mapSVG(this, opts);
            return instances[id].methods.init(opts, this);
        }else if(instances[id]){
            return instances[id].methods;
        }else{
            return instances;
        }



    }; // end of $.fn.mapSvg

})( jQuery );


// Tiny color
// TinyColor v1.3.0
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function(Math) {

    var trimLeft = /^\s+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        mathRound = Math.round,
        mathMin = Math.min,
        mathMax = Math.max,
        mathRandom = Math.random;

    function tinycolor (color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
            return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._originalInput = color,
            this._r = rgb.r,
            this._g = rgb.g,
            this._b = rgb.b,
            this._a = rgb.a,
            this._roundA = mathRound(100*this._a) / 100,
            this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    }

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getOriginalInput: function() {
            return this._originalInput;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            //http://www.w3.org/TR/AERT#color-contrast
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        getLuminance: function() {
            //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
            var rgb = this.toRgb();
            var RsRGB, GsRGB, BsRGB, R, G, B;
            RsRGB = rgb.r/255;
            GsRGB = rgb.g/255;
            BsRGB = rgb.b/255;

            if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
            if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
            if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
            return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100*this._a) / 100;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
            "hsv("  + h + ", " + s + "%, " + v + "%)" :
            "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
            "hsl("  + h + ", " + s + "%, " + l + "%)" :
            "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
            "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
            "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
            "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
            "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },
        clone: function() {
            return tinycolor(this.toString());
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
    function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = Math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b and a are contained in the set [0, 255]
// Returns an 8 character hex
    function rgbaToHex(r, g, b, a) {

        var hex = [
            pad2(convertDecimalToHex(a)),
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        return hex.join("");
    }

// `equals`
// Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };

    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (hsl.h + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

// Utility Functions
// ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
    };

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
    tinycolor.isReadable = function(color1, color2, wcag2) {
        var readability = tinycolor.readability(color1, color2);
        var wcag2Parms, out;

        out = false;

        wcag2Parms = validateWCAG2Parms(wcag2);
        switch (wcag2Parms.level + wcag2Parms.size) {
            case "AAsmall":
            case "AAAlarge":
                out = readability >= 4.5;
                break;
            case "AAlarge":
                out = readability >= 3;
                break;
            case "AAAsmall":
                out = readability >= 7;
                break;
        }
        return out;

    };

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
    tinycolor.mostReadable = function(baseColor, colorList, args) {
        var bestColor = null;
        var bestScore = 0;
        var readability;
        var includeFallbackColors, level, size ;
        args = args || {};
        includeFallbackColors = args.includeFallbackColors ;
        level = args.level;
        size = args.size;

        for (var i= 0; i < colorList.length ; i++) {
            readability = tinycolor.readability(baseColor, colorList[i]);
            if (readability > bestScore) {
                bestScore = readability;
                bestColor = tinycolor(colorList[i]);
            }
        }

        if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
            return bestColor;
        }
        else {
            args.includeFallbackColors=false;
            return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
        }
    };


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

// Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

// Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

// Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((Math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

// Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

// Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

// Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

// Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

// Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

// Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
// Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            CSS_UNIT: new RegExp(CSS_UNIT),
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
    function isValidCSSUnit(color) {
        return !!matchers.CSS_UNIT.exec(color);
    }

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hsva.exec(color))) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    function validateWCAG2Parms(parms) {
        // return valid WCAG2 parms for isReadable.
        // If input parms are invalid, return {"level":"AA", "size":"small"}
        var level, size;
        parms = parms || {"level":"AA", "size":"small"};
        level = (parms.level || "AA").toUpperCase();
        size = (parms.size || "small").toLowerCase();
        if (level !== "AA" && level !== "AAA") {
            level = "AA";
        }
        if (size !== "small" && size !== "large") {
            size = "small";
        }
        return {"level":level, "size":size};
    }

// Node: Export function
    if (typeof module !== "undefined" && module.exports) {
        module.exports = tinycolor;
    }
// AMD/requirejs: Define the module
    else if (typeof define === 'function' && define.amd) {
        define(function () {return tinycolor;});
    }
// Browser: Expose to window
    else {
        window.tinycolor = tinycolor;
    }

})(Math);

