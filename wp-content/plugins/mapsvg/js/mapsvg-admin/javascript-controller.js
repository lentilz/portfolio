(function($, window){
    var MapSVGAdminJavascriptController = function(container, admin, mapsvg){
        this.name = 'javascript';
        this.errorLines = [];
        this.disableHorizontalScroll = true;

        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminJavascriptController = MapSVGAdminJavascriptController;
    MapSVG.extend(MapSVGAdminJavascriptController, window.MapSVGAdminController);


    MapSVGAdminJavascriptController.prototype.viewLoaded = function(){
        this.setEditor();
    };
    
    MapSVGAdminJavascriptController.prototype.setEventHandlers = function(){
        var _this = this;
        this.toolbarView.find('select').select2().on("select2:select",function () {
            _this.setEditor();
        });
    };

    MapSVGAdminJavascriptController.prototype.setEditor = function(){
        var _this = this;
        this.view.find('#mapsvg-js-container').empty();
        var event = this.toolbarView.find('select').val();
        // data-validate="function" data-delay="1000" data-event="'+event+'"
        var textarea = $('<textarea id="mapsvg-js-textarea"  class="form-control" rows="8" data-live="change" name="events['+event+']"></textarea>');
        var content = this.mapsvg.getData().options.events[event];
        if(!content) content = "";
        content = content && typeof content !== "string" ? MapSVG.convertToText(this.mapsvg.getData().options.events[event]) : content;
        textarea.val(content);
        this.view.find('#mapsvg-js-container').append(textarea);
        this.editor = CodeMirror.fromTextArea(textarea[0], {mode: 'javascript', matchBrackets: true, lineNumbers: true});
        this.editor.on('change', _this.setTextareaValue);
        _this.resizeEditor();
        // waiting = setTimeout(function(){_this.resizeEditor();}, 500);


        $(window).off('resize.codemirror.js');
        $(window).on('resize.codemirror.js',function(){
            _this.resizeEditor();
        });

        /*
        var waiting;
        _this.editor.on("change", function() {
            clearTimeout(waiting);
            waiting = setTimeout(function(){_this.highlightErrors()}, 1000);
        });

        _this.highlightErrors();
        */
    };

    MapSVGAdminJavascriptController.prototype.resizeEditor = function(){
        this.view.find('.CodeMirror')[0].CodeMirror.setSize(null, this.contentWrap.height());
        this.view.find('.CodeMirror').height(this.contentWrap.height());
    };


    MapSVGAdminJavascriptController.prototype.setTextareaValue = function(codemirror, changeobj){
        var handler =  codemirror.getValue();
        var _this = this;
        var textarea = $(codemirror.getTextArea());
        // textarea.val(handler);
        textarea.val(handler).trigger('change');
        // textarea.trigger('change');
    };

    MapSVGAdminJavascriptController.prototype.highlightErrors = function(){
        var _this = this;

            var textarea = $(_this.editor.getTextArea());
            var handler =  _this.editor.getValue();
            textarea.val(handler);

            _this.editor.operation(function(){
                if(_this.error)
                    _this.editor.removeLineClass(_this.error.line-2, 'background', 'line-error');

                _this.error = _this.admin.validateInput(textarea);
                if(!(_this.error instanceof TypeError || _this.error instanceof SyntaxError )){
                    _this.error = null;
                    _this.setTextareaValue();
                }else{
                    _this.editor.addLineClass(_this.error.line-2, 'background', 'line-error');
                }
            });
    };


    
    
})(jQuery, window);