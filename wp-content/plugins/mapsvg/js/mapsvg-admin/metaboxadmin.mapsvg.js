(function($, window, MapSVG){
    MetaboxAdmin = function(options){
        this.mapOptions = options.mapOptions;
        this.isMetabox = true;
        this.mapSchema = options.mapSchema;
        this.mapId = options.mapId;
        this.view = $('#'+options.containerId);
        this.mapContainerId = options.mapContainerId;
        this.$map = $('#'+options.mapContainerId);
        this.mapTitle = options.mapTitle;
        this.markerImages = options.markerImages;
        window.markerImages = options.markerImages;
        window.defaultMarkerImage = window.markerImages[0].url;

        this.dataObject = options.dataObject || {};
        this.postTypes = options.postTypes || [];
        this.init();
    };
    MapSVG.MetaboxAdmin = MetaboxAdmin;

    MetaboxAdmin.prototype.init = function(){
        var _this = this;

        var mediaUploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose images',
            button: {
                text: 'Choose images'
            },
            multiple: true
        });

        this.mapOptions.afterLoad = function(){
            if(_this.dataObject.marker)
                _this.dataObject.marker = this.markerAdd(_this.dataObject.marker);
            _this.formBuilder = new MapSVG.FormBuilder(_this.mapSchema, false, _this.mapsvg, mediaUploader, _this.dataObject, _this, 'mapsvg');
            _this.formBuilder.on('update',  function(data){ _this.updateDataObject(data) });
            _this.formBuilder.view.appendTo(_this.view.find('.mapsvg-metabox-form'));
        };
        this.mapsvg = this.$map.mapSvg(this.mapOptions);

    };
    MetaboxAdmin.prototype.getPostTypes = function(){
        return this.postTypes;
    }
})(jQuery, window, MapSVG);