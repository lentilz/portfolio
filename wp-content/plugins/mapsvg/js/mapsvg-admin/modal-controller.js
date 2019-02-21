(function($, window){
    var MapSVGAdminModalController = function(container, admin, mapsvg){
        this.name = 'modal';
        this.content = '';
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminModalController = MapSVGAdminModalController;
    MapSVG.extend(MapSVGAdminModalController, window.MapSVGAdminController);

    MapSVGAdminModalController.prototype.setContent = function(content){
        this.content = content;
    };
    MapSVGAdminModalController.prototype.getTemplateData = function(){

        return {content: this.content};
    };


})(jQuery, window);