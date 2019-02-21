(function($, window){
    var MapSVGAdminFiltersStructureController = function(container, admin, mapsvg, filtersService){
        this.name = 'filters-structure';
        this.scrollable = false;
        MapSVGAdminController.call(this, container, admin, mapsvg);
        this.filtersSchema = this.mapsvg.filtersSchema;
    };
    window.MapSVGAdminFiltersStructureController = MapSVGAdminFiltersStructureController;
    MapSVG.extend(MapSVGAdminFiltersStructureController, window.MapSVGAdminController);


    MapSVGAdminFiltersStructureController.prototype.viewLoaded = function(){
        var _this = this;
    };
    MapSVGAdminFiltersStructureController.prototype.viewDidAppear = function(){
        var _this = this;
        _this.formBuilder = new MapSVG.FormBuilder({
                schema: _this.filtersSchema.getSchema(),
                editMode: true,
                filtersMode: true,
                mapsvg: _this.mapsvg,
                admin: _this.admin,
                container: this.contentView,
                template: 'form-builder-filters',
                types: ['select'],
                events: {
                    saveSchema: function(options){
                        if(_this.mapsvg.id){
                            _this.filtersSchema.setSchema(options);
                            $.growl.notice({title: '', message: 'Settings saved'});
                            _this.admin.save();
                        }else{
                            _this.admin.save().done(function(){
                                _this.filtersSchema.setSchema(options);
                            });
                        }
                    },
                    load: function(){
                        setTimeout(function () {
                            $('#mapsvg-btn-filters-structure').tooltip('show').tooltip('hide');
                        }, 200);
                    }

                }
        });
    };
    MapSVGAdminFiltersStructureController.prototype.viewDidDisappear = function(){
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
        this.formBuilder && this.formBuilder.destroy();
    };

    MapSVGAdminFiltersStructureController.prototype.setEventHandlers = function(){
        var _this = this;
    };

})(jQuery, window);