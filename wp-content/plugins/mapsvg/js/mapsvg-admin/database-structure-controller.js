(function($, window){
    var MapSVGAdminDatabaseStructureController = function(container, admin, mapsvg, databaseService){
        this.name = 'database-structure';
        this.scrollable = false;
        this.database = mapsvg.getDatabaseService();
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminDatabaseStructureController = MapSVGAdminDatabaseStructureController;
    MapSVG.extend(MapSVGAdminDatabaseStructureController, window.MapSVGAdminController);


    MapSVGAdminDatabaseStructureController.prototype.viewDidAppear = function(){
        var _this = this;
        MapSVGAdminController.prototype.viewDidAppear.call(this);
        _this.formBuilder = new MapSVG.FormBuilder({
                schema: _this.database.getSchema(),
                editMode: true,
                mapsvg: _this.mapsvg,
                admin: _this.admin,
                container: this.contentView,
                events: {
                    saveSchema: function(options){
                        var prevSchema = _this.database.schema.get();

                        if(_this.mapsvg.id){
                            _this.database.saveSchema(options).done(function(){
                                $.growl.notice({title: "", message: 'Settings saved'});
                                _this.admin.save();
                            }).fail(function(){
                                $.growl.error({title: "Server error", message: 'Can\'t save settings'});

                            });
                        }else{
                            _this.admin.save().done(function(){
                                _this.database.map_id = _this.mapsvg.id;
                                _this.database.saveSchema(options).done(function(){
                                }).fail(function(){
                                    $.growl.error({title: "Error", message: 'Can\'t save settings'});
                                });
                            }).fail(function(){
                                $.growl.error({title: "Error", message: 'Can\'t save settings'});
                            });
                        }
                    },
                    load: function(){
                        setTimeout(function () {
                            $('#mapsvg-btn-database-structure').tooltip('show').tooltip('hide');
                        }, 200);
                    }

                }
        });

        // _this.formBuilder.view.appendTo(this.contentView);
    };
    MapSVGAdminDatabaseStructureController.prototype.viewDidDisappear = function(){
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
        this.formBuilder && this.formBuilder.destroy();
    };

    MapSVGAdminDatabaseStructureController.prototype.setEventHandlers = function(){
        var _this = this;
    };

})(jQuery, window);