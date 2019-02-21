(function($, window){
    var MapSVGAdminLayersController = function(container, admin, mapsvg){
        this.name = 'layers';
        this.scrollable = false;
        this.isParent = true;
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminLayersController = MapSVGAdminLayersController;
    MapSVG.extend(MapSVGAdminLayersController, window.MapSVGAdminController);

    MapSVGAdminLayersController.prototype.viewLoaded = function() {
        var _this = this;
        this.controllers.list                  = new MapSVGAdminLayersListController('mapsvg-layers-list', _this.admin, _this.mapsvg);
        this.controllers.list.toolbarView      = this.toolbarView;
    };

    MapSVGAdminLayersController.prototype.viewDidAppear = function() {
        MapSVGAdminController.prototype.viewDidAppear.call(this);
        var _this = this;
    };
    MapSVGAdminLayersController.prototype.viewDidDisappear = function() {
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
    };

    MapSVGAdminLayersController.prototype.setEventHandlers = function(){
        var _this = this;

    };

})(jQuery, window);