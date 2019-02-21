(function($, window){
    var MapSVGAdminDatabaseListController = function(container, admin, mapsvg){
        var _this = this;
        this.name = 'database-list';
        this.database = mapsvg.getDatabaseService();
        this.database.on('schemaChange',function(){
            _this.redrawDataList();
        });
        _this.database.on('dataLoaded',function(){
            _this.redrawDataList();
        });

        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminDatabaseListController = MapSVGAdminDatabaseListController;
    MapSVG.extend(MapSVGAdminDatabaseListController, window.MapSVGAdminController);


    MapSVGAdminDatabaseListController.prototype.viewLoaded = function(){
        var _this = this;
        // this.databaseTimestamp = Date.now();

        _this.redrawDataList();
        _this.btnAdd = $('#mapsvg-btn-data-add');
    };

    MapSVGAdminDatabaseListController.prototype.viewDidAppear = function(){
        MapSVGAdminController.prototype.viewDidAppear.call(this);
        if(this.databaseTimestamp < this.database.lastChangeTime){
            this.redrawDataList();
        }
    };
    MapSVGAdminDatabaseListController.prototype.viewDidDisappear = function(){
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
        this.closeFormHandler();
    };


    MapSVGAdminDatabaseListController.prototype.setEventHandlers = function(){
        var _this = this;

        $('#mapsvg-data-search-cols').on('click', 'li a' ,function(e){
            e.preventDefault();
            var field = $(this).text();
            $(this).closest('.input-group').find('.mapsvg-serch-field').text(field);
            _this.searchField = field;
        });



        this.toolbarView.on('click','.mapsvg-data-cols a',function(e){
            e.preventDefault();

            $(this).closest('li').toggleClass('active');

            var schema =  _this.database.getSchema();
            var field  = $(this).data('field');

            for (var i in schema){
                if(field == schema[i].name)
                    schema[i].visible = !schema[i].visible;
            }
            _this.database.saveSchema(schema);
        });

        $('#mapsvg-btn-data-add').on('click',function(e){
            e.preventDefault();
            _this.editDataObject();
        });

        this.view.on('click','.mapsvg-data-row',function(e){
            if(!$(this).hasClass('active')){
                _this.editDataObject($(this).data('id'));
            }
        }).on('click','.mapsvg-data-delete',function(e){
            e.preventDefault();
            e.stopPropagation();
            var row = $(this).closest('tr');
            _this.deleteDataRow(row);
        }).on('click','.mapsvg-data-copy',function(e){
            e.preventDefault();
            e.stopPropagation();
            _this.copyDataObject($(this).closest('tr').data('id'));
        });
    };

    MapSVGAdminDatabaseListController.prototype.getTemplateData = function(){
        var _this = this;
        return {
            fields: _this.getDataFieldsForTemplate(true),
            data: _this.database.getLoaded()
        };

    };

    MapSVGAdminDatabaseListController.prototype.getDataFieldsForTemplate = function (onlyVisible) {
        var _this = this;
        var _fields = [{name: 'id', visible: true, type: 'id'}];
        var schema = this.database.getSchema();
        if(schema){
            schema.forEach(function(obj){
                if(onlyVisible){
                    if(obj.visible)
                        return _fields.push(obj);
                }else{
                    return _fields.push(obj);
                }
            });
        }
        for(var i in _fields){
            if(_fields[i].type == 'region'){
                _fields[i].options = [];
                _fields[i].optionsDict = {};
                _this.mapsvg.getData().regions.forEach(function(region){
                    _fields[i].options.push({id: region.id, title: region.title});
                    _fields[i].optionsDict[region.id] = region.title ? region.title : region.id;
                });
            }
        }
        
        return _fields;
    };

    MapSVGAdminDatabaseListController.prototype.redrawDataList = function(){
        var _this = this;

        _this.redraw();

        var fieldsAll = _this.database.getColumns();
        if(fieldsAll.length < 2){
            $('#mapsvg-data-list-table').hide();
            $('#mapsvg-setup-database-msg').show();
        }
        var colsList = _this.toolbarView.find('.mapsvg-data-cols');
        colsList.empty();
        fieldsAll.forEach(function(field){
            colsList.append( $('<li class="'+(field.visible?'active':'')+'"><a href="#" data-field="'+field.name+'">'+field.name+'</a></li>') );
        });

        var pager = this.mapsvg.getPagination(function(){ _this.redrawDataList(); });
        this.view.find('.mapsvg-pagination-container').html(pager);

    };

    MapSVGAdminDatabaseListController.prototype.addDataRow = function(obj){
        var _this = this;
        var d = {
            fields: _this.database.getColumns({visible: true}),
            params: obj
        };
        for(var i in d.fields){
            if(d.fields[i].type == 'region'){
                d.fields[i].options = [];
                d.fields[i].optionsDict = {};
                _this.mapsvg.getData().regions.forEach(function(region){
                    d.fields[i].options.push({id: region.id, title: region.title});
                    d.fields[i].optionsDict[region.id] = region.title ? region.title : region.id;
                });
            }
        }
        var row = $(_this.templates.item(d));
        this.view.find('#mapsvg-data-list-table tbody').prepend(row);
        return row;
    };

    MapSVGAdminDatabaseListController.prototype.updateDataRow = function(obj, row){
        var _this = this;
        var d = {
            fields: _this.database.getColumns({visible: true}),
            params: obj
        };
        for(var i in d.fields){
            if(d.fields[i].type == 'region'){
                d.fields[i].options = [];
                d.fields[i].optionsDict = {};
                _this.mapsvg.getData().regions.forEach(function(region){
                    d.fields[i].options.push({id: region.id, title: region.title});
                    d.fields[i].optionsDict[region.id] = region.title ? region.title : region.id;
                });
            }
        }

        var newRow = $(_this.templates.item(d));
        row = row || $('#mapsvg-data-'+obj.id);
        row.replaceWith( newRow );
        newRow.addClass('mapsvg-row-updated');

        setTimeout(function(){
            newRow.removeClass('mapsvg-row-updated');
        }, 2600);

    };

    MapSVGAdminDatabaseListController.prototype.deleteDataRow = function(row){
        var _this = this;
        var id = row.data('id');
        var object = this.database.getLoadedObject(id);
        if(object.marker)
            _this.mapsvg.markerDelete(object.marker);
        this.database.delete(id);
        row.fadeOut(300, function(){
            row.remove();
        });
    };

    MapSVGAdminDatabaseListController.prototype.editDataObject = function(object, scrollTo, closeOnSave){

        var _this = this;

        var newRecord = !(object && object.id);
        closeOnSave = closeOnSave !== true ? (newRecord?false:true) : true;

        object = object || {};
        if(typeof object == 'string' || typeof object == 'number')
            object = _this.database.getLoadedObject(object);

        _this.btnAdd.addClass('disabled');

        if(_this.tableDataActiveRow)
            _this.tableDataActiveRow.removeClass('mapsvg-row-selected');


        if(object && object.id){
            newRecord = false;
            _this.updateScroll();
            _this.tableDataActiveRow = $('#mapsvg-data-'+object.id);
            _this.tableDataActiveRow.addClass('mapsvg-row-selected');
            if(scrollTo)
                _this.contentWrap.data('jsp').scrollToElement(_this.tableDataActiveRow, true, false);
        }

        if(!_this.admin.mediaUploader) {
            _this.admin.mediaUploader = wp.media.frames.file_frame = wp.media({
                title: 'Choose images',
                button: {
                    text: 'Choose images'
                },
                multiple: true
            });
        }

        if(_this.formBuilder){
            _this.formBuilder.destroy();
            _this.formBuilder = null;
            _this.formBuilderRow && _this.formBuilderRow.remove();
        }
        if(_this.formContainer)
            _this.formContainer.empty().remove();


        _this.formContainer = $('<div class="mapsvg-modal-edit"></div>');
        this.view.append(_this.formContainer);

        var marker_id = object.marker && object.marker.id ? object.marker.id : '';
        // _this.mapsvg.hideMarkersExceptOne(marker_id);

        _this.formBuilder = new MapSVG.FormBuilder({
            container: _this.formContainer,
            schema: _this.database.getSchema(),
            editMode: false,
            mapsvg: _this.mapsvg,
            mediaUploader: _this.admin.mediaUploader,
            data: object,
            admin: _this.admin,
            closeOnSave: closeOnSave,
            events: {
                save: function(data){
                    if(newRecord){
                        _this.saveDataObject(data);
                        _this.formBuilder.redraw();
                        _this.mapsvg.hideMarkersExceptOne();
                    }else{
                        _this.updateDataObject(data);
                    }
                    if(closeOnSave)
                        this.close();
                },
                close: function(){ _this.closeFormHandler(); },
                init: function(data){
                    var id = data.marker ? data.marker.id : null;
                    _this.mapsvg.hideMarkersExceptOne(id);
                }
            }
        });
    };

    MapSVGAdminDatabaseListController.prototype.copyDataObject = function(id){
        var _this = this;

        var object = {};
        $.extend(object, _this.database.getLoadedObject(id));
        object.id = null;
        // delete object.id;

        if(object.marker && object.marker.id){
            var m = _this.mapsvg.getMarker(object.marker.id).getOptions();
            m.id = null;
            object.marker = _this.mapsvg.markerAdd(m).getOptions();
        }

        _this.editDataObject(object, false, true);

    };

    MapSVGAdminDatabaseListController.prototype.saveDataObject = function (object){
        var _this = this;
        var row = this.addDataRow(object);
        this.database.create(object).done(function(obj){
            obj = _this.database.getLoadedObject(obj.id);
            _this.updateDataRow(obj, row);
            if(obj.marker){
                obj.marker = _this.mapsvg.getMarker(obj.marker.id);
                obj.marker.setId('marker_'+obj.id);
                obj.marker.setObject(obj);
            }
            // _this.mapsvg.reloadDataObjects();
            _this.mapsvg.showMarkers();
            // _this.mapsvg.hideMarkersExceptOne();

        }).fail(function(){
            $.growl.error({title: 'Server error', message: 'Can\'t create object'});
            row.remove();
        });
    };
    MapSVGAdminDatabaseListController.prototype.updateDataObject = function (obj){
        var _this = this;

        this.database.update(obj).fail(function(){
            $.growl.error({title: 'Server error', message: 'Can\'t update object'});
        });
        if(obj.marker){
            var marker = _this.mapsvg.getMarker(obj.marker.id);
            marker.setId('marker_'+obj.id);
            marker.setObject(obj);
        }
        this.closeFormHandler();
        this.updateDataRow(obj);
    };
    MapSVGAdminDatabaseListController.prototype.closeFormHandler = function (){
        var _this = this;
        _this.btnAdd.removeClass('disabled');
        _this.mapsvg.showMarkers();

        if(_this.formBuilder){
            _this.formBuilder.destroy();
            _this.formBuilder = null;
            _this.formContainer.empty().remove();
            // _this.formBuilderRow && _this.formBuilderRow.remove();
            _this.tableDataActiveRow && _this.tableDataActiveRow.removeClass('mapsvg-row-selected');
            _this.tableDataActiveRow && !_this.tableDataActiveRow.hasClass('mapsvg-row-updated') && _this.tableDataActiveRow.addClass('mapsvg-row-closed');
            setTimeout(function(){
                _this.tableDataActiveRow && !_this.tableDataActiveRow.hasClass('mapsvg-row-updated') && _this.tableDataActiveRow.removeClass('mapsvg-row-closed');
            }, 1600);
            // WP Media Uploader inserts a.browser links, remove them:
            $('a.browser').remove();


            if(_this.admin.getData().mode=='editMarkers'){
                _this.admin.setPreviousMode();
            }
        }


        this.updateScroll();
    };


})(jQuery, window);