var scripts       = document.getElementsByTagName('script');
var myScript      = scripts[scripts.length - 1].src.split('/');
myScript.pop();
// var pluginJSURL   =  myScript.join('/')+'/';
// myScript.pop();
var pluginRootURL =  myScript.join('/')+'/';


(function($, MapSVG, window){

    MapSVG.parseBoolean = function (string) {
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
    };

    function extend(sub, base) {
        sub.prototype = Object.create(base.prototype);
        sub.prototype.constructor = sub;
    }

    function Form(options){
        this.title = options.title;
        this.fields = options.fields;
    }
    Form.prototype.inputToObject = function(formattedValue) {

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

    function FormElement(options, formBuilder){

        options = options || {};

        var _this = this;

        this.formBuilder = formBuilder;
        this.images      = [];
        this.type        = options.type;
        this.value       = options.value;
        this.searchable  = MapSVG.parseBoolean(options.searchable);

        this.databaseFields = this.formBuilder.mapsvg.database.getSchema().map(function(obj){
            if(obj.type =='text' || obj.type =='region' || obj.type =='textarea' || obj.type =='post' || obj.type =='select' || obj.type =='radio' || obj.type =='checkbox'){
                if(obj.type == 'post'){
                    return 'Object.post.post_title';
                }else{
                    return 'Object.'+obj.name;
                }
            }
        });
        this.regionFields = this.formBuilder.mapsvg.regionsDatabase.getSchema().map(function(obj){
            if(obj.type =='status' || obj.type =='text' || obj.type =='textarea' || obj.type =='post' || obj.type =='select' || obj.type =='radio' || obj.type =='checkbox'){
                return 'Region.' + obj.name;
            }
        });

        this.db_type = 'varchar(255)';

        if(this.type == 'region') {
            this.options = this.formBuilder.getRegionsList();
            this.label = 'Regions';
            this.name = 'regions';
            this.db_type = 'text';
        }else if(this.type == 'textarea') {
            this.autobr = options.autobr;
            this.html = options.html;
            this.db_type = 'text';
        }else if(this.type == 'marker'){
            this.options = this.formBuilder.getMarkersList();
            this.marker = this.value || null;
            this.name = 'marker';
            this.db_type = 'text';
            this.isLink = options.isLink!==undefined ? MapSVG.parseBoolean(options.isLink) : false;
            this.urlField = options.urlField || null;
        }else if(this.type == 'post'){
            if(_this.formBuilder.admin) this.post_types = this.formBuilder.admin.getPostTypes();
            this.post_type = options.post_type || this.post_types[0];
            this.add_fields = MapSVG.parseBoolean(options.add_fields);
            this.db_type = 'int(11)';
            this.name = 'post_id';
            this.post_id = options.post_id;
            this.post = options.post;
        }else if(this.type == 'checkbox'){
            this.db_type = 'tinyint(1)';
            this.checkboxLabel = options.checkboxLabel;
            this.checkboxValue = options.checkboxValue;
        }else if(this.type == 'radio' || this.type == 'select'){
            this.options = options.options || [
                    {label: 'Option one', name: 'option_one', value: 1},
                    {label: 'Option two', name: 'option_two', value: 2}
                ];
            if(this.type=='select'){
                this.multiselect = options.multiselect;
                this.optionsGrouped = options.optionsGrouped;
                this.db_type = this.multiselect ? 'text' : 'varchar(255)';
            }
            this.optionsDict = options.optionsDict || {};
            if(!this.optionsDict){
                this.options.forEach(function(o){
                    _this.optionsDict[o.value] = o.label;
                });
            }

        }else if(this.type=='image') {
            this.button_text = options.button_text || 'Browse...';
            this.db_type = 'text';
            this.label       = options.label || 'Images';
            this.name        = options.name || 'images';
        }else if(this.type == 'status'){
            this.label = options.label || 'Status';

            this.name = 'status';
            this.options = options.options || [
                    {label: 'Enabled', value: 1, color: '', disabled: false},
                    {label: 'Disabled', value: 0,  color: '', disabled: true}
                ];
        }else if(this.type == 'date'){
            if(_this.formBuilder.admin)
                this.languages = ['en-GB','ar','az','bg','bs','ca','cs','cy','da','de','el','es','et','eu','fa','fi','fo','fr','gl','he','hr','hu','hy','id','is','it','ja','ka','kh','kk','kr','lt','lv','mk','ms','nb','nl','nl-BE','no','pl','pt-BR','pt','ro','rs','rs-latin','ru','sk','sl','sq','sr','sr-latin','sv','sw','th','tr','uk','vi','zh-CN','zh-TW'];
            this.db_type = 'varchar(50)';
            this.language = options.language;
        }

        this.label       = this.label || (options.label === undefined ? 'Label' : options.label);
        this.name        = this.name  || options.name  || 'label';


        this.help = options.help || '';
        this.placeholder = options.placeholder;

        var t = this.type;

        if(t == 'marker' && _this.formBuilder.mapsvg.isGeo()){
            t = 'marker-geo';
        }

        if(this.formBuilder.filtersMode){
            this.parameterName = options.parameterName || '';
            this.parameterNameShort = this.parameterName.split('.')[1];
            this.placeholder = options.placeholder || 'Any';
            this.templates = {
                result: Handlebars.compile($('#mapsvg-filters-tmpl-'+t+'-view').html())
            };
            this.views = {
                result: $(this.templates.result(this.get()))
            };
        }else{
            this.templates = {
                result: Handlebars.compile($('#mapsvg-data-tmpl-'+t+'-view').html())
            };
            this.views = {
                result: $(this.templates.result(this.get()))
            };
        }

        this.views.result.data('formElement',this);

        if($().select2){
            this.views.result.find('select').css({width: '100%', display: 'block'})
                .select2()
                .on('select2:focus',function(){
                    $(this).select2('open');
                });
        }
        // if($().colorpicker) {
        //     this.views.result.find('.cpicker').colorpicker().on('changeColor.colorpicker', function (event) {
        //         var input = $(this).find('input');
        //         if (input.val() == '')
        //             $(this).find('i').css({'background-color': ''});
        //     });
            // this.views.edit && this.views.edit.find('.cpicker').colorpicker().on('changeColor.colorpicker', function (event) {
            //     var input = $(this).find('input');
            //     if (input.val() == '')
            //         $(this).find('i').css({'background-color': ''});
            // });

        // }
        // if(this.autobr){
        //     this.value = this.value.replace(/\n/g,'<br />');
        //     var updateTextarea = function(codemirror, changeobj){
        //         var css = codemirror.getValue();
        //         _this.admin.mapsvgCss = css;
        //         _this.admin.mapsvgCssChanged = true;
        //         _this.mapsvg.setCss(css);
        //     };
        //     this.editors.css.on('change',setCss);
        //
        //
        // }
        if(this.html){
            var txt = this.views.result.find('textarea')[0];
            this.editor = CodeMirror.fromTextArea(txt, {mode: {name: "handlebars", base: "text/html"}, matchBrackets: true, lineNumbers: true});
            if(_this.formBuilder.admin)
                this.editor.on('change', this.setTextareaValue);
        }

        if(this.type=='image'){
            this.images = this.value || [];
            this.redrawImages();
        }

        if(this.type=='marker'){
            this.templates.marker = Handlebars.compile($('#mapsvg-data-tmpl-marker').html());
            this.marker && _this.renderMarker(this.marker);
        }
        this.setEventHandlers();
    }
    FormElement.prototype.setTextareaValue = function(codemirror, changeobj){
        var handler =  codemirror.getValue();
        var textarea = $(codemirror.getTextArea());
        textarea.val(handler).trigger('change');
    };


    FormElement.prototype.setEventHandlers = function() {
        var _this = this;

        if (this.formBuilder.editMode) {
            this.views.result.on('click', function () {
                _this.formBuilder.edit(_this);
            });
        } else  {
            if(this.type == 'image'){
                var imageDOM = _this.views.result.find('.mapsvg-data-images');

                // When a file is selected, grab the URL and set it as the text field's value
                this.formBuilder.mediaUploader.on('select', function() {
                    if(_this.formBuilder.mediaUploaderFor !== _this)
                        return false;
                    var attachments = _this.formBuilder.mediaUploader.state().get('selection').toJSON();
                    attachments.forEach(function(img){
                        var image = {sizes: {}};
                        for (var type in img.sizes){
                            image[type] = img.sizes[type].url.replace('http://','//').replace('https://','//');
                            image.sizes[type] = {width: img.sizes[type].width, height: img.sizes[type].height};
                        }
                        if(!image.thumbnail){
                            image.thumbnail = image.full;
                            image.sizes.thumbnail = {width: img.sizes.full.width, height: img.sizes.full.height};
                        }
                        if(!image.medium){
                            image.medium = image.full;
                            image.sizes.medium = {width: img.sizes.full.width, height: img.sizes.full.height};
                        }
                        //image.title = img.title;
                        //image.description = img.description;
                        _this.images.push(image);
                    });
                    _this.redrawImages();
                });
                _this.views.result.on('click','.mapsvg-upload-image', function(e) {
                    e.preventDefault();
                    // Open the uploader dialog
                    _this.formBuilder.mediaUploaderFor = _this;
                    _this.formBuilder.mediaUploader.open();
                });
                _this.views.result.on('click','.mapsvg-image-delete', function(e) {
                    e.preventDefault();
                    $(this).closest('.mapsvg-thumbnail-wrap').remove();
                    _this.images = [];
                    _this.views.result.find('img').each(function(i, image){
                        _this.images.push($(image).data('image'));
                    });
                    _this.views.result.find('input').val(JSON.stringify(_this.images));
                });

                _this.sortable = new Sortable(imageDOM[0], {
                    animation: 150,
                    onStart: function(){
                        $('#mapsvg-data-form-view').addClass('sorting');
                    },
                    onEnd: function(evt){
                        _this.images = [];
                        _this.views.result.find('img').each(function(i, image){
                            _this.images.push($(image).data('image'));
                        });
                        _this.views.result.find('input').val(JSON.stringify(_this.images));
                    }
                });

            }
            if(this.type == 'post'){

                _this.views.result.find(".mapsvg-find-post").select2({
                    ajax: {
                        url: ajaxurl+'?action=mapsvg_search_posts&post_type='+_this.post_type,
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                query: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function (data, params) {
                            // parse the results into the format expected by Select2
                            // since we are using custom formatting functions we do not need to
                            // alter the remote JSON data, except to indicate that infinite
                            // scrolling can be used
                            params.page = params.page || 1;

                            return {
                                results: data,
                                pagination: {
                                    more: false //(params.page * 30) < data.total_count
                                }
                            };
                        },
                        cache: true
                    },
                    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
                    minimumInputLength: 1,
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
                }).on('select2:select',function(e){
                    _this.post = e.params.data;
                    _this.views.result.find(".mapsvg-post-id").text(_this.post.ID);
                    _this.views.result.find(".mapsvg-post-url").text(_this.post.url).attr('href', _this.post.url);
                    _this.views.result.find('input[name="post_id"]').val(_this.post.ID);
                });

                function formatRepo (repo) {
                    if (repo.loading) return repo.text;

                    var markup = "<div class='select2-result-repository clearfix'>" +
                        repo.post_title + "</div>";

                    return markup;
                }

                function formatRepoSelection (repo) {
                    return repo.post_title || repo.text;
                }

                // var locations = new Bloodhound({
                //     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('formatted_address'),
                //     queryTokenizer: Bloodhound.tokenizers.whitespace,
                //     remote: {
                //         url: ajaxurl+'?action=mapsvg_search_posts&query=%QUERY%&post_type='+_this.post_type,
                //         wildcard: '%QUERY%',
                //         transform: function(response) {
                //             return response;
                //         },
                //         rateLimitWait: 600
                //     }
                // });
                // var tH = _this.views.result.find('.typeahead').typeahead(null, {
                //     name: 'post_choose',
                //     display: 'post_title',
                //     source: locations,
                //     minLength: 2
                // }).on('typeahead:select',function(ev,item){
                //     var src = $('#mapsvg-geocode img').attr('src');
                //     _this.views.result.find('input[name="post_id"]').val(item.id);
                //
                // });
            }
            if(this.type == 'marker'){
                // Google geocoding
                if(_this.formBuilder.mapsvg.isGeo()){

                    // this.views.result.find('.mapsvg-marker-image-btn-trigger img').attr('src', window.defaultMarkerImage || window.mapsvgMarkerImages[0].url);

                    var locations = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('formatted_address'),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        remote: {
                            url: ajaxurl+'?action=mapsvg_geocoding&address=%QUERY%',
                            wildcard: '%QUERY%',
                            transform: function(response) {
                                if(response.error_message){
                                    alert(response.error_message);
                                }
                                return response.results;
                            },
                            rateLimitWait: 600
                        }
                    });
                    var thContainer = this.views.result.find('.typeahead');
                    var tH = thContainer.typeahead(null, {
                        name: 'mapsvg-addresses',
                        display: 'formatted_address',
                        source: locations,
                        minLength: 2
                    });
                    thContainer.on('typeahead:select',function(ev,item){
                        _this.marker && _this.deleteMarker();

                        var newMarker = {
                            geoCoords: [item.geometry.location.lat,item.geometry.location.lng],
                            attached: true, // all "attached" to database markers are deleted before saving map settings
                            isLink: _this.isLink,
                            urlField: _this.urlField
                        };
                        if(window.defaultMarkerImage){
                            newMarker.src = window.defaultMarkerImage
                        }
                        _this.formBuilder.mapsvg.markerAdd(newMarker,
                            function(marker){
                                _this.marker = marker;
                                _this.formBuilder.mapsvg.setEditingMarker(marker.id);
                                _this.formBuilder.marker = marker;
                                _this.renderMarker(marker);
                            }
                        );
                        thContainer.typeahead('val', '');

                    });
                }

                // _this.views.result.on('click','.mapsvg-link-btn',function(e){
                //     e.preventDefault();
                //     var cont = $(this).parent();
                //     var btn = $(this);
                //     var row = $(this).closest('tr');
                //     var marker_id = _this.marker.id;
                //     var marker = _this.formBuilder.mapsvg.getMarker(marker_id);
                //     var oldUrl = marker.href;
                //     var input = $('<input class="link-editable form-control" value="'+(marker.href||'')+'"/>');
                //     cont.append(input);
                //     btn.addClass('opened');
                //     input.select();
                //     input.on('blur',function(){
                //         var newUrl = $(this).val();
                //         if(newUrl!=oldUrl){
                //             marker.update({href: newUrl});
                //             if(newUrl.length)
                //                 btn.addClass('active');
                //             else
                //                 btn.removeClass('active');
                //         }
                //         $(this).off().remove();
                //         btn.removeClass('opened')
                //     }).on('keypress', function(e){
                //         if (e.which == 13 || event.keyCode == 13) {
                //             e.preventDefault();
                //             $(this).blur().trigger('blur');
                //         }
                //     });
                // });

                // _this.views.result.on('change','.mapsvg-marker-id',function(){
                //     _this.formBuilder.markerIdChanged = true;
                // });
                // _this.views.result.on('keypress','.mapsvg-marker-id',function(e){
                //     if (e.which == 13 || event.keyCode == 13) {
                //         e.preventDefault();
                //         // todo check id
                //         _this.marker.update($(this).val());
                //         $(this).blur();
                //     }
                // });

                _this.views.result.on('click','.mapsvg-marker-image-btn-trigger',function(e){
                    $(this).toggleClass('active');
                    _this.toggleMarkerSelector.call(_this, $(this), e);
                });

                _this.views.result.on('click','.mapsvg-marker-delete',function(e){
                    e.preventDefault();
                    _this.deleteMarker();

                })
            }

        }
    };


    FormElement.prototype.toggleMarkerSelector = function(jQueryObj, e){
        e.preventDefault();
        var _this = this;
        if(_this.markerSelector && _this.markerSelector.is(':visible')){
            _this.markerSelector.hide();
            return;
        }
        if(_this.markerSelector && _this.markerSelector.not(':visible')){
            _this.markerSelector.show();
            return;
        }

        _this.markerImageButton = jQueryObj.find('img');
        var currentImage = _this.markerImageButton.attr('src');
        var images = window.markerImages.map(function(image){
            return '<button class="btn btn-default mapsvg-marker-image-btn mapsvg-marker-image-btn-choose '+(currentImage==image.url?'active':'')+'"><img src="'+image.url+'" /></button>';
        });

        if(!_this.markerSelector){
            _this.markerSelector = _this.views.result.find('.mapsvg-marker-image-selector');
        }

        // delete previous marker image selector and reset events
        if(_this.markerSelector){
            _this.markerSelector.empty();
        }

        // create new markers image selector
        // _this.markerSelector = jQueryObj;
        _this.formBuilder.markerSelector = _this.markerSelector;

        // attach Marker object to the selector
        if(_this.formBuilder.marker){
            _this.markerSelector.data('marker', _this.formBuilder.marker);
        }else{
            _this.markerSelector.data('marker', null);
        }

        _this.markerSelector.html(images.join(''));

        // show popover with selector
        // _this.markerSelector.popover({
        //     // container: '#mapsvg-popover-iso',
        //     content: images.join(''),
        //     html: true,
        //     placement: 'bottom',
        //     template: '<div class="popover mapsvg-markers-list" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
        // }).popover('show');
        // // set event handlers on image choose
        _this.markerSelector.on('click', '.mapsvg-marker-image-btn-choose',function(e){
            e.preventDefault();
            var src = $(this).find('img').attr('src');

            if(_this.formBuilder.marker){
                var marker = _this.formBuilder.mapsvg.getMarker(_this.formBuilder.marker.id);
                marker.setSrc(src);
            }
            _this.markerSelector.hide();
            _this.views.result.find('.mapsvg-marker-image-btn-trigger').toggleClass('active',false);
            _this.markerImageButton.attr('src',src);
            window.defaultMarkerImage = src;
        });
    };

    FormElement.prototype.deleteMarker = function(){
        var _this = this;
        if(this.formBuilder.marker)
            _this.formBuilder.mapsvg.markerDelete(this.formBuilder.marker);
        delete this.formBuilder.marker;
        _this.views.result.find('.mapsvg-marker-hidden-input').val('');
        _this.views.result.find('.mapsvg-new-marker').hide();
        _this.views.result.find('.mapsvg-marker-id').attr('disabled','disabled');
    };
    FormElement.prototype.renderMarker = function(_marker){
        var _this = this;
        var marker = this.formBuilder.mapsvg.getMarker(_marker.id) || this.formBuilder.marker;
        if(!marker)
            return;
        if(marker){
            _this.views.result.find('.mapsvg-marker-hidden-input').val(JSON.stringify(marker.getOptions()));
            _this.views.result.find('.mapsvg-new-marker').show().html( this.templates.marker(marker) );
            marker.onChange = function(){
                _this.renderMarker(marker);
            };
        }
    };
    FormElement.prototype.redrawImages = function(){
        var _this = this;
        var imageDOM = _this.views.result.find('.mapsvg-data-images');
        imageDOM.empty();
        this.images && this.images.forEach(function(image){
            var img = $('<img class="mapsvg-data-thumbnail" />').attr('src',image.thumbnail).data('image',image);
            var imgContainer = $('<div class="mapsvg-thumbnail-wrap"></div>').data('image',image);
            imgContainer.append(img);
            imgContainer.append('<i class="fa fa-times  mapsvg-image-delete"></i>');
            imageDOM.append(imgContainer);
        });
        _this.views.result.find('input').val(JSON.stringify(this.images));
    };
    FormElement.prototype.setEditorEventHandlers = function(){
        var _this = this;
        this.views.edit.on('click', 'button.mapsvg-remove', function(){
            _this.views.result.empty().remove();
            _this.views.edit.empty().remove();
            _this.formBuilder.delete(_this);
        }).on('keyup change paste','.mapsvg-edit-status-row input',function(){
            _this.mayBeAddStatusRow();
        });


        this.views.edit.on('click', '.mapsvg-filter-insert-options',function(){
            var objType = _this.parameterName.split('.')[0];
            var fieldName   = _this.parameterName.split('.')[1];
            var field;
            if(objType == 'Object'){
                field = _this.formBuilder.mapsvg.database.getSchemaField(fieldName);
            }else{
                field = _this.formBuilder.mapsvg.regionsDatabase.getSchemaField(fieldName);
            }
            if(field && field.options){
                var options;
                if(fieldName == 'regions') {
                    if(field.options[0].title && field.options[0].title.length)
                        field.options.sort(function(a, b) {
                            if (a.title < b.title)
                                return -1;
                            if (a.title > b.title)
                                return 1;
                            return 0;
                        });
                    options = field.options.map(function(o){  return (o.title||o.id)+':'+o.id});
                }else{
                    options = field.options.map(function(o){  return o.label+':'+o.value});
                }
                $(this).closest('.form-group').find('textarea').val(options.join("\n")).trigger('change');
            }
        });

        this.views.edit.on('keyup change paste', 'input, textarea, select, radio', function(){
            var prop = $(this).attr('name');

            var array = $(this).data('array');
            if(array){
                var param = $(this).data('param');
                var index = $(this).closest('tr').index();
                _this.options[index] = _this.options[index] || {label: '',value: '', color: '', disabled: false};
                _this.options[index][param] = $(this).is(':checkbox') ? $(this).prop('checked') : $(this).val();
            }else if(prop == 'label' || prop == 'name') {
                return false;
            }else{
                var value;
                value = ($(this).attr('type') == 'checkbox') ? $(this).prop('checked') : $(this).val();
                if($(this).attr('type') == 'radio'){
                    var name = $(this).attr('name');
                    value = $('input[name="'+name+'"]:checked').val();
                }
                _this.update(prop,value);
            }
        });
        this.views.edit.on('keyup change paste', 'input[name="label"]', function(){
            if(!_this.nameChanged){
                var str = $(this).val();
                str = str.toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
                _this.views.edit.find('input[name="name"]').val(str);
                // _this.update('name',str);
                _this.label = $(this).val();
                if(_this.type != 'region')
                    _this.name = str;
                _this.views.result.find('label').first().html(_this.label);
                if(!_this.formBuilder.filtersMode){
                    _this.views.result.find('label').first().append('<div class="field-name">'+_this.name+'</div>');
                }

            }
        });
        this.views.edit.on('keyup change paste', 'input[name="name"]', function(){
            if(this.value){
                if (this.value.match(/[^a-zA-Z0-9_]/g)) {
                    this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
                    $(this).trigger('change');
                }
                if (this.value[0].match(/[^a-zA-Z_]/g)) {
                    this.value = this.value[0].replace(/[^a-zA-Z_]/g, '')+this.value.slice(1);
                    $(this).trigger('change');
                }
            }
            if(_this.type != 'region')
                _this.name = this.value;
            _this.views.result.find('label').html(_this.label+'<div class="field-name">'+_this.name+'</div>');
            _this.nameChanged = true;
        });
    };
    FormElement.prototype.getEditor = function(){

        // if(!this.views.edit){
            if(!this.formBuilder.filtersMode){
                this.templates.edit = this.templates.edit || Handlebars.compile($('#mapsvg-data-tmpl-'+this.type+'-control').html());
            }else {
                this.templates.edit = this.templates.edit || Handlebars.compile($('#mapsvg-filters-tmpl-' + this.type + '-control').html());
            }
            this.views.edit = $(this.templates.edit(this.get()));
        // }
        return this.views.edit;
    };
    FormElement.prototype.destroyEditor = function(){
        // this.views.edit.find('select').select2('destroy');
        this.views.edit.empty().remove();
    };
    FormElement.prototype.initEditor = function(){
        var _this = this;
        this.views.edit.find('input').first().select();
        if($().select2)
            this.views.edit.find('select').css({width: '100%', display: 'block'}).select2();
        if(this.type == 'status'){
            _this.views.edit.find('.cpicker').colorpicker().on('changeColor.colorpicker', function(event){
                var input = $(this).find('input');
                var index = $(this).closest('tr').index();
                if(input.val() == '')
                    $(this).find('i').css({'background-color': ''});
                _this.options[index] = _this.options[index] || {label: '',value: '', color: '', disabled: false};
                _this.options[index]['color'] = input.val();
            });
            _this.mayBeAddStatusRow();
        }
        this.views.edit.find('.mapsvg-onoff').bootstrapToggle({
            onstyle: 'default',
            offstyle: 'default'
        });
        this.setEditorEventHandlers();
    };
    FormElement.prototype.mayBeAddStatusRow = function(){
        var _this = this;
        this.templates.editStatusRow = this.templates.editStatusRow || $($('#mapsvg-edit-status-row').html());
        // if there's something in the last status edit field, add +1 status row
        var z = _this.views.edit.find('.mapsvg-edit-status-label:last-child');
        if(z && z.last() && z.last().val() && z.last().val().trim().length){
            var newRow = this.templates.editStatusRow.clone();
            newRow.insertAfter(_this.views.edit.find('.mapsvg-edit-status-row:last-child'));
            newRow.find('.cpicker').colorpicker().on('changeColor.colorpicker', function(event){
                var input = $(this).find('input');
                var index = $(this).closest('tr').index();
                if(input.val() == '')
                    $(this).find('i').css({'background-color': ''});
                _this.options[index] = _this.options[index] || {label: '',value: '', color: '', disabled: false};
                _this.options[index]['color'] = input.val();
            });
        }
        var rows = _this.views.edit.find('.mapsvg-edit-status-row');
        var row1 = rows.eq( rows.length-2 );
        var row2 = rows.eq( rows.length-1 );

        if( row1.length && row2.length &&
        !(row1.find('input:eq(0)').val().trim() || row1.find('input:eq(1)').val().trim() || row1.find('input:eq(2)').val().trim())
        &&
        !(row2.find('input:eq(0)').val().trim() || row2.find('input:eq(1)').val().trim() || row2.find('input:eq(2)').val().trim())
        ){
            row2.remove();
        }
    };
    FormElement.prototype.getSchema = function() {

        var _this = this;

        var data = {
            type: this.type,
            db_type: this.db_type,
            label: this.label,
            name: this.name,
            value: this.value,
            searchable: MapSVG.parseBoolean(this.searchable)

        };

        if(this.type == 'select'){
            data.multiselect = MapSVG.parseBoolean(this.multiselect);
            if(data.multiselect)
                data.db_type = 'text';
            data.optionsGrouped = this.optionsGrouped;
        }

        if (this.options) {
            var opts = $.extend(true, {},{options: this.options});
            data.options = opts.options;
            data.optionsDict = {};
            if (data.type == 'region') {
                data.options.forEach(function (option) {
                    data.optionsDict[option.id] = option.title || option.id;
                });
            } else if (_this.type == 'status'){
                data.options.forEach(function (option, index) {
                    if(data.options[index].value===''){
                        data.options.splice(index,1);
                    }else{
                        data.options[index].disabled = MapSVG.parseBoolean(data.options[index].disabled);
                        data.optionsDict[option.value] = option;
                    }
                });
            } else {
                data.options.forEach(function (option) {
                    data.optionsDict[option.value] = _this.type == 'status' ? option : option.label;
                });
            }
        }

        if (this.help) {
            data.help = this.help;
        }
        if (this.button_text) {
            data.button_text = this.button_text;
        }
        if (this.type == 'marker') {
            data.isLink = MapSVG.parseBoolean(this.isLink);
            data.urlField = this.urlField;
        }
        if (this.type == 'post') {
            data.post_type = this.post_type;
            data.add_fields = this.add_fields;
        }
        if (this.type == 'date') {
            data.language = this.language;
        }
        if(this.type == 'textarea'){
            data.autobr = this.autobr;
            data.html = this.html;
        }

        if(this.checkboxLabel){
            data.checkboxLabel = this.checkboxLabel;
        }
        if(this.checkboxValue){
            data.checkboxValue = this.checkboxValue;
        }
        if(this.formBuilder.filtersMode){
            data.parameterName = this.parameterName;
            data.parameterNameShort = this.parameterName.split('.')[1];
            data.placeholder = this.placeholder;
        }
        data.visible = this.visible === undefined ? true : this.visible;
        return data;
    };
    FormElement.prototype.get = function(){

        var data = this.getSchema();
        // Add namespace to names
        data._name = data.name;
        if(this.formBuilder.namespace){
            data.name = this.name.split('[')[0];
            var suffix = this.name.split('[')[1] || '';
            if(suffix)
                suffix = '['+suffix;
            data.name = this.formBuilder.namespace+'['+data.name+']'+suffix
        }
        if(this.type == 'post'){
            if(this.formBuilder.admin)
                data.post_types = this.formBuilder.admin.getPostTypes();
            data.post_type = this.post_type;
            data.post = this.post;
            data.add_fields = this.add_fields || 0;
        }
        if(this.type == 'date'){
            if(this.formBuilder.admin)
                data.languages = this.languages;
            data.language = this.language;
        }
        if(this.type == 'marker'){
            data.marker = this.marker;
            data.isLink = this.isLink;
            data.urlField = this.urlField;
            data.fields = this.formBuilder.mapsvg.database.getColumns({type: 'text'});
        }
        if(this.type == 'textarea') {
            data.html = this.html;
        }
        data.databaseFields = this.databaseFields;
        data.regionFields = this.regionFields;
        data.placeholder = this.placeholder;
        return data;
    };
    FormElement.prototype.update = function(prop, value){
        var _this = this;
        if(prop=='options'){
            var options = [];
            value = value.split("\n").forEach(function(row){
                row = row.trim().split(':');
                if(_this.type=='checkbox' && row.length == 3){
                    options.push({
                        label: row[0],
                        name: row[1],
                        value: row[2]
                    });
                }else if((_this.type=='radio' || _this.type=='select') && row.length==2){
                    options.push({
                        label: row[0],
                        value: row[1]
                    });
                }
            });
            this.options = options;
        }else{
            this[prop] = value;
        }
        if(prop == 'parameterName'){
            this.views.edit.find('.mapsvg-filter-param-name').text(value);
        }
        this.redraw();
    };
    FormElement.prototype.redraw = function(){
        var _this = this;
        var newView = $(this.templates.result(this.get()));
        this.views.result.html(newView.html());
        if($().select2){
            this.views.result.find('select').css({width: '100%', display: 'block'})
                .select2()
                .on('select2:focus',function(){
                    $(this).select2('open');
                });
        }
        if($().colorpicker) {
            this.views.edit && this.views.edit.find('.cpicker').colorpicker().on('changeColor.colorpicker', function (event) {
                var input = $(this).find('input');
                if (input.val() == '')
                    $(this).find('i').css({'background-color': ''});
            });
        }

    };

    var FormBuilder = function(options) {

        // schema, editMode, mapsvg, mediaUploader, data, admin, namespace

        var _this = this;


        // options
        this.container     = options.container;
        this.namespace     = options.namespace;
        this.mediaUploader = options.mediaUploader;
        this.schema        = options.schema || [];
        this.editMode      = options.editMode == undefined ? false : options.editMode;
        this.filtersMode   = options.filtersMode == undefined ? false : options.filtersMode;
        this.admin         = options.admin;
        this.mapsvg        = options.mapsvg;
        this.data          = options.data || {};
        this.eventHandlers = options.events;
        this.template      = 'form-builder';
        this.closeOnSave   = options.closeOnSave !== true ? false : true;
        this.newRecord     = options.newRecord !== true ? false : true;
        // this.id            = this.data.id || null;


        this.types         = options.types || ['text', 'textarea', 'checkbox', 'radio', 'select', 'image', 'region', 'marker', 'post', 'date'];

        this.templates = {};
        this.elements = {};
        this.view = $('<div />').attr('id','mapsvg-form-builder');
        if(this.editMode)
            this.view.addClass('full-flex');
        // this.eventHandlers = {};

        this.formControls = [];

        if(!MapSVG.templatesLoaded[this.template]){
            $.get(MapSVG.urls.templates + _this.template+'.hbs?'+Math.random(), function (data) {
                $(data).appendTo('body');
                MapSVG.templatesLoaded[_this.template] = true;
                if(!_this.filtersMode) {
                    Handlebars.registerPartial('dataMarkerPartial', $('#mapsvg-data-tmpl-marker').html());
                }
                _this.init();
            });
        }else{
            this.init();
        }
    };

    FormBuilder.prototype.init = function(){

        var _this = this;
        MapSVG.formBuilder = this;

        if(_this.editMode){
            var templateUI = Handlebars.compile($('#mapsvg-form-editor-tmpl-ui').html());
            _this.view.append( templateUI({types: this.types}) );
            _this.view.addClass('edit');
        }else{
            // if(!this.filtersMode)
                _this.view.append($('<div id="mapsvg-data-form-view" class="form-horizontal"></div>'));
        }

        _this.elements = {
            buttons: {
                text: _this.view.find('#mapsvg-data-btn-text'),
                textarea: _this.view.find('#mapsvg-data-btn-textarea'),
                checkbox: _this.view.find('#mapsvg-data-btn-checkbox'),
                radio: _this.view.find('#mapsvg-data-btn-radio'),
                select: _this.view.find('#mapsvg-data-btn-select'),
                image: _this.view.find('#mapsvg-data-btn-image'),
                region: _this.view.find('#mapsvg-data-btn-region'),
                marker: _this.view.find('#mapsvg-data-btn-marker'),
                saveSchema: _this.view.find('#mapsvg-data-btn-save-schema')
            },
            containers: {
                buttons_add: _this.view.find('#mapsvg-data-buttons-add'),
                form_view: _this.view.find('#mapsvg-data-form-view'),
                form_edit: _this.view.find('#mapsvg-data-form-edit')
            }
        };

        _this.redraw();
    };

    FormBuilder.prototype.viewDidLoad = function(){
        _this.formControls.forEach(function(control) {
            if(control.html){
                var txt = control.views.result.find('textarea')[0];
                control.htmlEditor = CodeMirror.fromTextArea(txt, {mode: {name: "handlebars", base: "text/html"}, matchBrackets: true, lineNumbers: true});
            }
        });
    };

    FormBuilder.prototype.setEventHandlers = function(){

        var _this = this;

        $(window).off('keydown.form.mapsvg').on('keydown.form.mapsvg', function(e) {
            if(MapSVG.formBuilder){
                if((e.metaKey||e.ctrlKey) && e.keyCode == 13)
                    MapSVG.formBuilder.save();
                else if(e.keyCode == 27)
                    MapSVG.formBuilder.close();
            }
        });


        if(this.editMode){
            this.view.on('click','#mapsvg-data-buttons-add button',function(e){
                e.preventDefault();
                var type = $(this).data('create');
                _this.add({type: type});
            });
            this.view.on('click','#mapsvg-data-btn-save-schema', function(e){
                e.preventDefault();
                var fields = _this.getSchema();
                var counts = {};
                _this.formControls.forEach(function(elem) { counts[elem.name] = (counts[elem.name] || 0) +1; });

                $('#mapsvg-data-form-view .form-group').removeClass('has-error');
                var errors = [];

                var reservedFields = ['id','title','lat','lon','marker','marker_id','regions','region_id','post_id', 'post','post_title','post_url', 'keywords','status'];
                var reservedFieldsToTypes = {'regions':'region','status':'status','post_id':'post','marker':'marker'};

                var errUnique, errEmpty;

                _this.formControls.forEach(function(formElement, index){
                    var err = false;

                    // If that's not Form Builder for Filters (when there is no "name" parameter)
                    // we should check if names are non-empty and unique
                    if(!_this.filtersMode){
                        if(counts[formElement.name] > 1){
                            if(!errUnique){
                                errUnique = 'Field names should be unique';
                                errors.push(errUnique);
                                err = true;
                            }
                        }else if(formElement.name.length===0){
                            if(!errEmpty){
                                errEmpty = 'Field name can\'t be empty';
                                errors.push(errEmpty);
                                err = true;
                            }
                        }else if(reservedFields.indexOf(formElement.name)!=-1){
                            // if reserved field name is for proper type of object then it's OK
                            if(!reservedFieldsToTypes[formElement.name] || (reservedFieldsToTypes[formElement.name] && reservedFieldsToTypes[formElement.name]!=formElement.type)){
                                var msg = 'Field name "'+formElement.name+'" is reserved, please set another name';
                                errors.push(msg);
                                err = true;
                            }
                        }
                    }


                    if(formElement.options && formElement.type != 'region' && formElement.type != 'marker'){
                        var vals = _.pluck(formElement.options, 'value');
                        if(vals.length != _.uniq(vals).length){
                            errors.push('Check "Options" list - values should not repeat');
                            err = true;
                        }

                    }

                    err && formElement.views.result.addClass('has-error');
                });

                if(errors.length == 0)
                    _this.eventHandlers.saveSchema && _this.eventHandlers.saveSchema(fields);
                else
                    $.growl.error({title: "Errors", message: errors.join('<br />')});

            });
            setTimeout(function(){
                var el = document.getElementById('mapsvg-data-form-view');
                _this.sortable = new Sortable(el, {
                    animation: 150,
                    onStart: function(){
                        $('#mapsvg-data-form-view').addClass('sorting');
                    },
                    onEnd: function(){
                        setTimeout(function(){
                            $('#mapsvg-data-form-view').removeClass('sorting');
                            _this.formControls = [];
                            $(el).find('.form-group').each(function(index, elem){
                                _this.formControls.push($(elem).data('formElement'));
                            });
                        },500);
                    }
                });
            },1000);
        }else{
            // Save
            _this.view.on('click','button.btn-save',function(e){
                e.preventDefault();
                _this.save();
            });
            // Close
            _this.view.on('click','button.btn-close',function(e){
                e.preventDefault();
                _this.close();
            });
        }
        new MapSVG.ResizeSensor(this.view[0], function(){
            _this.scrollApi && _this.scrollApi.reinitialise();
        });


    };
    FormBuilder.prototype.save = function(){

        var _this = this;


        if(_this.marker){
            var m = _this.mapsvg.getEditingMarker();
            m.onChange = null;
            _this.marker = m.getOptions();
            _this.mapsvg.unsetEditingMarker();
        }

        var data = _this.getData();


        _this.eventHandlers.save && _this.eventHandlers.save.call(_this, data);

        // if(!newRecord){
        // }else{
        //     _this.redraw();
        //     _this.saved = true;
        // }
    };
    FormBuilder.prototype.getData = function(){

        var _this = this;
        var data = _this.toJSON(true);

        _this.formControls.forEach(function(control){
            if(control.type == 'image'){
                data[control.name] = [];
                if(control.images && control.images.length && control.images[0]!=null){
                    var newList = [];
                    control.views.result.find('.mapsvg-thumbnail-wrap').each(function(index, el){
                        var imageData = $(el).data('image');
                        newList.push(imageData);
                    });
                    control.images = newList;
                    data[control.name] = data[control.name].concat(control.images);
                }
            }

            if(control.type == 'marker'){
                if(_this.marker)
                    data[control.name] = _this.marker;
                else
                    data[control.name] = '';
            }
            if(control.type == 'post'){
                data.post = control.post;
            }
            if(control.type == 'region') {
                if (data.regions && typeof data.regions == 'object' && data.regions.length) {
                    data.regions = data.regions.map(function (region_id) {
                        return {id: region_id, title: _this.mapsvg.getRegion(region_id).title}
                    });
                } else {
                    data.regions = '';
                }
            }
            if(control.type == 'select' && control.multiselect && data[control.name] && data[control.name].length) {
                data[control.name] = data[control.name].map(function(value){
                    return {value: value, label: control.optionsDict[value]};
                });
            }
        });

        if(_this.data.id != undefined){
            data.id = _this.data.id;
        }

        delete data.marker_id;

        return data;
    };
    FormBuilder.prototype.getDataJSON = function(){
        var _this = this;
        var data = _this.toJSON(true);
        _this.formControls.forEach(function(control){
            if(control.type == 'image'){
                data[control.name] = [];
                if(control.images && control.images.length && control.images[0]!=null){
                    var newList = [];
                    _this.view.find('.mapsvg-thumbnail-wrap').each(function(index, el){
                        var imageData = $(el).data('image');
                        newList.push(imageData);
                    });
                    control.images = newList;
                    data[control.name] = data[control.name].concat(control.images);
                }
            }
            if(control.type == 'marker'){
                data[control.name] = control.marker.getOptions();
            }
        });

        // if(_this.marker){
        //     var new_id = _this.view.find('.mapsvg-marker-id').val();
        //     var check = {};
        //     if(_this.markerIdChanged)
        //         check = _this.mapsvg.checkId(new_id);
        //     if(check.error){
        //         $().message('Please change Marker ID.<br /> '+check.error+'.');
        //         _this.view.find('.mapsvg-marker-id').focus().select();
        //         return false;
        //     }else{
        //         _this.marker.setId(new_id);
        //         _this.mapsvg.updateMarkersDict();
        //     }
        // }
        if(_this.data.id != undefined){
            data.id = _this.data.id;
        }
        return data;
    };
    FormBuilder.prototype.redraw = function(formElement){
        var _this = this;

        delete _this.marker;

        _this.container.empty();
        _this.elements.containers.form_view.empty();
        _this.formControls = [];

        if(_this.data && _this.data.id){
            _this.add({type: 'id', label: 'ID', name: 'id', value: _this.data.id});
        }

        if(_this.data && _this.data._title){
            _this.add({type: 'title', label: 'Title', name: 'title', value: _this.data._title});
        }


        _this.schema && _this.schema.length && _this.schema.forEach(function(elem){
            // Don't add "WP Post" input field in Metabox mode
            if(_this.admin && _this.admin.isMetabox && elem.type == 'post'){

            }else{
                elem.value = _this.data ? _this.data[elem.name] : elem.value!==undefined?elem.value:null ;

                if(elem.type=='marker' && !_this.editMode){

                    // add Marker Object into formElement
                    if(elem.value && elem.value.id){
                        _this.marker = _this.mapsvg.getMarker(elem.value.id).getOptions();
                        _this.mapsvg.setEditingMarker(_this.marker.id);
                    }
                    _this.admin && _this.admin.setMode && _this.admin.setMode('editMarkers');
                    _this.admin && _this.admin.enableMarkersMode(true);

                    _this.mapsvg.setMarkerEditHandler(function(){
                        _this.marker = this.getOptions();
                        _this.mapsvg.setEditingMarker(this.id);
                        formElement.renderMarker(_this.marker);
                    });

                }else if(elem.type == 'post'){
                    elem.post = _this.data['post'];
                }

                var formElement = _this.add(elem);
            }
        });

        if(!_this.editMode){
            if(this.schema.length == 0){
                _this.add({type: 'empty'});
            }else{
                if(_this.admin && !_this.admin.isMetabox){
                    _this.add({type: 'save'});
                }
                // if(_this.filtersMode){
                //     _this.add({type: 'ok'});
                // }
            }
        }

        if(!_this.editMode && !_this.filtersMode){

            var nano = $('<div class="nano"></div>');
            var nanoContent = $('<div class="nano-content"></div>');
            nano.append(nanoContent);
            nanoContent.html(this.view);
            _this.container.html(nano);
            nano.jScrollPane();
            _this.scrollApi = nano.data('jsp');
        }else{
            _this.container.html(this.view);
        }


        _this.eventHandlers.load && _this.eventHandlers.load();

        if (!this.editMode)
            this.view.find('input:visible,textarea:visible').not('.tt-hint').first().focus();

        var cm  = this.container.find('.CodeMirror');

        cm.each(function(index, el){
            el && el.CodeMirror.refresh();
        });
        _this.setEventHandlers();
        _this.eventHandlers.init && _this.eventHandlers.init(_this.data);

    };
    FormBuilder.prototype.delete = function(formElement){
        var _this = this;
        _this.formControls.forEach(function(fc, index){
            if(fc === formElement){
                _this.formControls.splice(index,1);
                _this.structureChanged = true;
            }
        });
    };
    FormBuilder.prototype.add = function(params){
        var _this = this;

        if(['region','marker','post','status'].indexOf(params.type)!=-1){
            var repeat = false;
            _this.formControls.forEach(function(control){
                if(control.type == params.type)
                    repeat = true;
            });
            if (repeat) {
                $.growl.error({title: 'Error', message: 'You can add only 1 "'+MapSVG.ucfirst(params.type)+'" field'});

                return;
            }
        }

        if(params.type == 'date'){
            MapSVG.datepicker = MapSVG.datepicker || {};
            // if(!MapSVG.datepicker[params.language]){
            //     $.get(mapsvg_paths.root+'js/datepicker-locales/bootstrap-datepicker.'+(params.language||'en-GB')+'.min.js', function(data){
            //        eval(data);
            //     });
            //     // var script = document.createElement('script');
            //     // script.src = mapsvg_paths.root+'js/datepicker-locales/bootstrap-datepicker.'+params.language+'.min.js';
            //     MapSVG.datepicker[params.language] = true;
            // }
        }
        var formElement = new FormElement(params, _this);
        _this.formControls.push(formElement);
        _this.elements.containers.form_view.append(formElement.views.result);
        if(this.editMode)
            this.edit(formElement);
        return formElement;
    };
    FormBuilder.prototype.edit = function(formElement){
        var _this = this;

        // destroy previous editor
        _this.currentlyEditing && _this.currentlyEditing.destroyEditor();

        // create new  editor
        _this.elements.containers.form_edit.append(formElement.getEditor());
        // setTimeout(function(){
            formElement.initEditor();
            _this.currentlyEditing = formElement;
            _this.elements.containers.form_view.find('.form-group.active').removeClass('active');
            formElement.views.result.addClass('active');
        // }, 500);
    };
    FormBuilder.prototype.get = function(){
        return this.formControls.map(function(c){
            return c.get();
        });
    };
    FormBuilder.prototype.getSchema = function(){
        return this.formControls.map(function(c){
            return c.getSchema();
        });
    };
    FormBuilder.prototype.close = function(){
        var _this = this;

        // $('body').off('keydown.mapsvg');

        if(!_this.saved){
            if(_this.data.id == undefined && _this.marker){
                var marker = _this.mapsvg.getMarker(_this.marker.id);
                marker.onChange = null;
                _this.mapsvg.markerDelete(_this.marker);
            }

            if(_this.marker){
                var editingMarker = _this.mapsvg.getEditingMarker();
                if (editingMarker){
                    editingMarker.update(_this.marker);
                    _this.mapsvg.unsetEditingMarker();
                }
            }
        }

        _this.markerSelector && _this.markerSelector.popover('destroy');
        if($().select2){
            var sel = _this.view.find('.mapsvg-select2');
            if(sel.length){
                sel.select2('destroy');
            }
        }

        var cm = _this.view.find('.CodeMirror');
        if(cm.length){
            cm.empty().remove();
        }



        _this.admin && _this.admin.enableMarkersMode(false);
        MapSVG.formBuilder = null;
        _this.eventHandlers.close && _this.eventHandlers.close();

    };
    FormBuilder.prototype.destroy = function(){
        this.view.empty().remove();
        this.sortable = null;
    };

    FormBuilder.prototype.on = function(event, handler){
        this.eventHandlers[event] = handler;
    };
    FormBuilder.prototype.toJSON = function(addEmpty) {

        var obj = {};

        function add(obj, name, value){
            if(!addEmpty && !value)
                return false;
            if(name.length == 1) {
                obj[name[0]] = value;
            }else{
                if(obj[name[0]] == null)
                    obj[name[0]] = {};
                add(obj[name[0]], name.slice(1), value);
            }
        }

        this.elements.containers.form_view.find('input, textarea, select').each(function(){
            if( !$(this).data('skip')
                &&
                !$(this).prop('disabled')
                &&
                $(this).attr('name')
                &&
                !( !addEmpty && $(this).attr('type')=='checkbox' && $(this).attr('checked')==undefined)
                &&
                !( $(this).attr('type')=='radio' && $(this).attr('checked')==undefined))
                {
                var value;
                if($(this).attr('type')=='checkbox'){
                    value = $(this).prop('checked');
                }else{
                    value = $(this).val();
                }
                add(obj, $(this).attr('name').replace(/]/g, '').split('['), value);
            }
        });

        return obj;
    };
    FormBuilder.prototype.getRegionsList = function(){
        return this.mapsvg.getData().regions.map(function(region){
            return {id: region.id, title: region.title};
        });
    };
    FormBuilder.prototype.getMarkersList = function(){
        return this.mapsvg.getData().markers.map(function(marker){
            return {id: marker.id};
        });
    };

    function FormElementEditor($Object){
        this.form = $Object;
    }

    // window.FormBuilder = FormBuilder;
    MapSVG.FormBuilder = FormBuilder;


})(jQuery, MapSVG, window);