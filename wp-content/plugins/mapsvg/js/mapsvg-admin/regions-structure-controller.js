(function($, window){
    var MapSVGAdminRegionsStructureController = function(container, admin, mapsvg, databaseService){
        this.name = 'regions-structure';
        this.scrollable = false;
        this.database = mapsvg.regionsDatabase;
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminRegionsStructureController = MapSVGAdminRegionsStructureController;
    MapSVG.extend(MapSVGAdminRegionsStructureController, window.MapSVGAdminController);


    MapSVGAdminRegionsStructureController.prototype.viewDidAppear = function(){
        var _this = this;
        MapSVGAdminController.prototype.viewDidAppear.call(this);
        _this.formBuilder = new MapSVG.FormBuilder({
            schema    : _this.database.getSchema(),
            editMode  : true,
            mapsvg    : _this.mapsvg,
            admin     : _this.admin,
            container : this.contentView,
            types     : ['text', 'textarea', 'checkbox', 'radio', 'select', 'image', 'status', 'date'],
            events    : {
                saveSchema: function(options) {
                    _this.database.saveSchema(options).done(function () {
                        if(_status = _this.database.getSchemaField('status')){
                            _this.mapsvg.setRegionStatuses(_status.optionsDict);
                            _this.admin.save(true);
                        }
                        $.growl.notice({title: '', message: 'Settings saved'});

                    }).fail(function(){
                        $.growl.error({title: 'Server error', message: 'Can\'t save settings'});
                    });
                },
                load: function(){
                    setTimeout(function () {
                        $('#mapsvg-btn-regions-structure').tooltip('show').tooltip('hide');
                    }, 200);
                }
            }
        });

    };
    MapSVGAdminRegionsStructureController.prototype.viewDidDisappear = function(){
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
        this.formBuilder && this.formBuilder.destroy();
    };

    MapSVGAdminRegionsStructureController.prototype.setEventHandlers = function(){
        var _this = this;
    };

})(jQuery, window);