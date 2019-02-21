(function($, window){
    var MapSVGAdminTemplatesController = function(container, admin, mapsvg){
        this.name = 'templates';
        this.disableHorizontalScroll = true;
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminTemplatesController = MapSVGAdminTemplatesController;
    MapSVG.extend(MapSVGAdminTemplatesController, window.MapSVGAdminController);


    MapSVGAdminTemplatesController.prototype.viewDidAppear = function(){
        this.setHints();
    };

    MapSVGAdminTemplatesController.prototype.viewLoaded = function(){
        var _this = this;
        _this.setEditor();
        $(window).on('resize.codemirror.tmpl',function(){
            _this.resizeEditor();
        });
    };

    MapSVGAdminTemplatesController.prototype.setEventHandlers = function() {
        var _this = this;
        this.toolbarView.find('select').select2().on("change",function () {
            _this.setEditor();
        });
    };


    MapSVGAdminTemplatesController.prototype.setEditor = function(){

        var _this = this;
        this.view.find('#mapsvg-template-container').empty();

        this.template = this.toolbarView.find('select').val();
        var textarea = $('<textarea id="mapsvg-template-textarea" class="form-control" rows="8" name="templates['+this.template+']" data-live="change"></textarea>');
        textarea.val(this.mapsvg.getData().options.templates[this.template]);
        this.view.find('#mapsvg-template-container').append(textarea);

        _this.setHints();


        this.editor = CodeMirror.fromTextArea(textarea[0], {mode: {name: "handlebars", base: "text/html"}, matchBrackets: true, lineNumbers: true});
        this.editor.on('change', this.setTextareaValue);
        // When an @ is typed, activate completion
        this.editor.on("inputRead", function(editor, change) {
            if (change.text[0] == "{")
                editor.showHint({completeSingle: false});
        });
        _this.resizeEditor();

    };

    MapSVGAdminTemplatesController.prototype.resizeEditor = function(){
        this.view.find('.CodeMirror')[0].CodeMirror.setSize(null, this.contentWrap.height());
        this.view.find('.CodeMirror').height(this.contentWrap.height());
    };


    MapSVGAdminTemplatesController.prototype.getRegionHints = function(child){

        var prefix = child ? 'regions.0.' : '';
        var fields = [];
        var _this = this;

        fields.push('{'+prefix+'id'+'}}');
        fields.push('{'+prefix+'title'+'}}');

        this.mapsvg.regionsDatabase.getSchema().forEach(function(obj) {
            if(obj.type == 'image') {
                fields.push('{' + prefix + obj.name + '.0.thumbnail}}');
                fields.push('{' + prefix + obj.name + '.0.medium}}');
                fields.push('{' + prefix + obj.name + '.0.full}}');
            }else if(obj.type == 'post'){
                fields.push('{'+prefix+'post.post_title}}');
                fields.push('{'+prefix+'post.content}}');
                fields.push('{'+prefix+'post.url}}');
            }else if(obj.type == 'select' || obj.type == 'radio' || obj.type == 'status') {
                fields.push('{'+prefix+obj.name+'_text}}');
                fields.push('{'+prefix+obj.name+'}}');
            } else {
                fields.push('{' + prefix + obj.name + '}}');
            }

        });
        if(!child)
            fields = fields.concat(_this.getDBHints(true));

        return fields;
    };
    MapSVGAdminTemplatesController.prototype.getDBHints = function(child){

        var prefix = child ? 'objects.0.' : '';
        var fields = [];
        fields.push('{'+prefix+'id'+'}}');

        var _this = this;

        this.mapsvg.database.getSchema().forEach(function(obj){
            if(obj.type == 'post'){
                fields.push('{'+prefix+'post.post_title}}');
                fields.push('{'+prefix+'post.post_content}}');
                fields.push('{'+prefix+'post.url}}');
            }else if(obj.type == 'marker'){
                if(_this.mapsvg.getData().mapIsGeo){
                    fields.push('{marker.geoCoords.[0]}}');
                    fields.push('{marker.geoCoords.[1]}}');
                }
            }else if(obj.type == 'image'){
                fields.push('{'+prefix+obj.name+'.0.thumbnail}}');
                fields.push('{'+prefix+obj.name+'.0.medium}}');
                fields.push('{'+prefix+obj.name+'.0.full}}');
            }else if(obj.type == 'region') {
                if(!child)
                    fields = fields.concat(_this.getRegionHints(true));
            }else if(obj.type == 'select' || obj.type == 'radio') {
                fields.push('{'+prefix+obj.name+'_text}}');
                fields.push('{'+prefix+obj.name+'}}');
            }else{
                fields.push('{'+prefix+obj.name+'}}');
            }
        });

        return fields;
    };


    MapSVGAdminTemplatesController.prototype.setHints = function(){
        var addPostFields = false;
        var addRegionFields = false;
        var fields;

        if(this.template == 'popoverRegion' ||
           this.template == 'tooltipRegion'||
           this.template == 'detailsViewRegion' ||
           (this.template == 'directoryItem' && this.mapsvg.getData().options.menu.source == 'regions')
        ){
            fields = this.getRegionHints();
        }else{
            fields = this.getDBHints();

        }

        var commands = [];
        var arr = fields.concat(commands);
        CodeMirror.registerHelper("hintWords", "xml", arr);
    };

    MapSVGAdminTemplatesController.prototype.setTextareaValue = function(codemirror, changeobj){
        var handler =  codemirror.getValue();
        var textarea = $(codemirror.getTextArea());
        textarea.val(handler).trigger('change');
    };


    MapSVGAdminTemplatesController.prototype.init = function(){

    }
})(jQuery, window);