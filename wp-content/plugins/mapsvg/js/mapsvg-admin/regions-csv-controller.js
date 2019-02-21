(function($, window){
    var MapSVGAdminRegionsCsvController = function(container, admin, mapsvg){
        this.name = 'regions-csv';
        this.database = mapsvg.regionsDatabase;
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminRegionsCsvController = MapSVGAdminRegionsCsvController;
    MapSVG.extend(MapSVGAdminRegionsCsvController, window.MapSVGAdminController);


    MapSVGAdminRegionsCsvController.prototype.setEventHandlers = function(){
        var _this = this;
        this.view.find('#mapsvg-btn-r-csv-upload').on('click', function(){
            var btn = $(this);
            if($('#mapsvg-r-csv-file')[0].files[0]){
                btn._button('loading');
                Papa.parse($('#mapsvg-r-csv-file')[0].files[0], {
                    header: true,
                    complete: function(results) {
                        if(results.errors.length === 0){
                            _this.import(results.data);
                        }else{
                            var text = "Errors: \n";
                            text += results.errors.map(function(e){ return e.message+(e.row!==undefined? ' (row: '+e.row+')' : ''); }).slice(0,5).join("\n");
                            if(results.errors.length > 5){
                                text += "\n...and "+(results.errors.length-5)+" more. ";
                            }
                            alert(text);
                        }
                    }
                });
            } else {
                $.growl.error({title: '', message: 'Please choose a file'});
            }
        });
    };

    MapSVGAdminRegionsCsvController.prototype.import = function(data){
        var _this = this;
        var btn = $('#mapsvg-btn-r-csv-upload');
        btn._button('loading');
        var res = _this.database.import(data).done(function(data){
            $.growl.notice({title: '', message: 'File uploaded'});
        }).always(function(){
            btn._button('reset');
        }).fail(function(){
            $.growl.error({title: '', message: 'Server error'});
        });
    };


})(jQuery, window);