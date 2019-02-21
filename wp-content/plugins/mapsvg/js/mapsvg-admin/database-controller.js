(function($, window){
    var MapSVGAdminDatabaseController = function(container, admin, mapsvg){
        this.name = 'database';
        this.scrollable = false;
        this.isParent = true;
        this.database = mapsvg.getDatabaseService();

        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminDatabaseController = MapSVGAdminDatabaseController;
    MapSVG.extend(MapSVGAdminDatabaseController, window.MapSVGAdminController);

    MapSVGAdminDatabaseController.prototype.viewLoaded = function() {
        var _this = this;
        this.controllers.list      = new MapSVGAdminDatabaseListController('mapsvg-data-list', _this.admin, _this.mapsvg);
        this.controllers.structure = new MapSVGAdminDatabaseStructureController('mapsvg-data-structure', _this.admin, _this.mapsvg);
        this.controllers.settings  = new MapSVGAdminDatabaseSettingsController('mapsvg-data-settings', _this.admin, _this.mapsvg);
        this.controllers.csv       = new MapSVGAdminDatabaseCsvController('mapsvg-data-csv', _this.admin, _this.mapsvg);
        this.controllers.csv.toolbarView = this.toolbarView;
        this.controllers.list.toolbarView = this.toolbarView;
        this.controllers.structure.toolbarView = this.toolbarView;
        this.controllers.settings.toolbarView = this.toolbarView;
        _this.activeController = this.controllers.list;
        MapSVGAdminController.prototype.viewLoaded.call(this);
    };

    MapSVGAdminDatabaseController.prototype.viewDidAppear = function() {
        MapSVGAdminController.prototype.viewDidAppear.call(this);
        var _this = this;
        if(_this.activeController && _this.activeController instanceof  MapSVGAdminDatabaseStructureController){
            _this.admin.rememberPanelsState();
            _this.admin.togglePanel('left', false);
        }
    };
    MapSVGAdminDatabaseController.prototype.viewDidDisappear = function() {
        MapSVGAdminController.prototype.viewDidDisappear.call(this);
        this.admin.restorePanelsState();
    };

    MapSVGAdminDatabaseController.prototype.setEventHandlers = function(){
        var _this = this;

        _this.database.on('dataLoaded',function(){
            _this.setFilters();
        });

        this.view.on('click', '.mapsvg-filter-delete',function(){
            var filterField = $(this).data('filter');
            delete _this.mapsvg.database.query.filters[filterField];
            _this.mapsvg.loadDataObjects();
            _this.setFilters();
           _this.controllers.list.redrawDataList();
        });

        this.toolbarView.on('keyup.menu.mapsvg', '#mapsvg-data-search',function () {
            _this.mapsvg.database.query.search = $(this).val();
            _this.mapsvg.loadDataObjects();
            _this.setFilters();
            _this.controllers.list.redrawDataList();
        });

        $('#mapsvg-data-menu a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        }).on('shown.bs.tab', function (e){

            var container = $($(this).attr('href'));
            var controller = container.data('controller');
            _this.activeController = controller;
            controller.viewDidAppear();

            var previousTabId = $(e.relatedTarget).attr('href');
            if(previousTabId){
                var prevControllerName = $(previousTabId).attr('data-controller');
                _this.controllers[prevControllerName].viewDidDisappear();
            }


            if($(this).attr('href') == '#mapsvg-data-structure') {
                _this.admin.rememberPanelsState();
                _this.admin.togglePanel('left', false);
            }else{
                _this.admin.restorePanelsState();
            }

            if($(this).attr('href') == '#mapsvg-data-list'){
                $('.mapsvg-toolbar-buttons').show();
            }
        });
    };
    MapSVGAdminDatabaseController.prototype.setFilters = function (filters){
        var _this = this;
        var filters = this.toolbarView.find('.mapsvg-toolbar-filters').empty();
        if(_this.mapsvg.database.query.filters && Object.keys(_this.mapsvg.database.query.filters).length > 0){
            for(var field_name in _this.mapsvg.database.query.filters){
                filters.append('<div class="mapsvg-filter-tag">'+field_name+': '+_this.mapsvg.database.query.filters[field_name]+' <span class="mapsvg-filter-delete" data-filter="'+field_name+'">×</span></div>');
            }
            // this.view.addClass('mapsvg-with-filter');
        }else{
            // this.view.removeClass('mapsvg-with-filter');
        }

        var elem = document.getElementById("mapsvg-admin-controller-database");
        elem.style.display='none';
        elem.offsetHeight; // no need to store this anywhere, the reference is enough
        elem.style.display='flex';

        // this.updateTopShift();
    };

})(jQuery, window);