(function($, window){
    var MapSVGAdminFiltersSettingsController = function(container, admin, mapsvg){
        this.name = 'filters-settings';
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminFiltersSettingsController = MapSVGAdminFiltersSettingsController;
    MapSVG.extend(MapSVGAdminFiltersSettingsController, window.MapSVGAdminController);


    MapSVGAdminFiltersSettingsController.prototype.viewLoaded = function(){
    };

    MapSVGAdminFiltersSettingsController.prototype.setEventHandlers = function(){
    };


})(jQuery, window);