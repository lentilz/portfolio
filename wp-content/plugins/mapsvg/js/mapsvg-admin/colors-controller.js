(function($, window){
    var MapSVGAdminColorsController = function(container, admin, mapsvg){
        this.name = 'colors';
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminColorsController = MapSVGAdminColorsController;
    MapSVG.extend(MapSVGAdminColorsController, window.MapSVGAdminController);


    MapSVGAdminColorsController.prototype.setEventHandlers = function(){
        var _this = this;

        var selected = _this.mapsvg.getData().options.colors.selected;
        var hover = _this.mapsvg.getData().options.colors.hover;

        $('#mapsvg-controls-hover-brightness').ionRangeSlider({
            type: "single",
            grid: true,
            min: -100,
            max: 100,
            from: $.isNumeric(hover) ? hover : 0
        });
        $('#mapsvg-controls-selected-brightness').ionRangeSlider({
            type: "single",
            grid: true,
            min: -100,
            max: 100,
            from: $.isNumeric(selected) ? selected : 0
        });


        $('.mapsvg-color-brightness').on('change',':radio', function(){
            var val = $(this).closest('.mapsvg-color-brightness :radio:checked').val();
            var container = $(this).closest('.form-group');
            if(val == 'color'){
                container.find('.cpicker').show();
                container.find('.irs').hide();
            }else{
                container.find('.cpicker').hide();
                container.find('.irs').show();
            }
        });

        if($.isNumeric(selected)){
            $('#mapsvg-colors-selected :radio').eq(0).prop('checked',false).parent().removeClass('active');
            $('#mapsvg-colors-selected :radio').eq(1).prop('checked',true).parent().addClass('active');
            $('#mapsvg-colors-selected .cpicker').hide();
            $('#mapsvg-colors-selected .irs').show();
        }else{
            $('#mapsvg-colors-selected :radio').eq(0).prop('checked',true).parent().addClass('active');
            $('#mapsvg-colors-selected :radio').eq(1).prop('checked',false).parent().removeClass('active');
            $('#mapsvg-colors-selected .cpicker').show().find('input').val(selected);
            $('#mapsvg-colors-selected .irs').hide();
        }

        if($.isNumeric(hover)){
            $('#mapsvg-colors-hover :radio').eq(0).prop('checked',false).parent().removeClass('active');
            $('#mapsvg-colors-hover :radio').eq(1).prop('checked',true).parent().addClass('active');
            $('#mapsvg-colors-hover .cpicker').hide();
            $('#mapsvg-colors-hover .irs').show();
        }else{
            $('#mapsvg-colors-hover :radio').eq(0).prop('checked',true).parent().addClass('active');
            $('#mapsvg-colors-hover :radio').eq(1).prop('checked',false).parent().removeClass('active');
            $('#mapsvg-colors-hover .cpicker').show().find('input').val(hover);
            $('#mapsvg-colors-hover .irs').hide();
        }


        $('#mapsvg-controls-gauge').on('change',':radio',function(){
            var on = MapSVG.parseBoolean($('#mapsvg-controls-gauge :radio:checked').val());
            $('#table-regions').removeClass('mapsvg-gauge-on');
            if(on)
                $('#table-regions').addClass('mapsvg-gauge-on');
            on ? $('#mapsvg-gauge-options').show() : $('#mapsvg-gauge-options').hide();
            _this.admin.updateScroll();
        });

        _this.view.find('.cpicker').colorpicker().on('changeColor.colorpicker', function(event){
            var input = $(this).find('input');
            if(input.val() == '')
                $(this).find('i').css({'background-color': ''});
            _this.formToObjectUpdate({target: input[0]});
        });


    }

})(jQuery, window);