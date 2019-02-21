(function($, window){
    var MapSVGAdminMarkersController = function(container, admin, mapsvg){
        this.name = 'markers';
        MapSVGAdminController.call(this, container, admin, mapsvg);
    };
    window.MapSVGAdminMarkersController = MapSVGAdminMarkersController;
    MapSVG.extend(MapSVGAdminMarkersController, window.MapSVGAdminController);


    MapSVGAdminMarkersController.prototype.setEventHandlers = function(){
        var _this = this;

        // Google geocoding
        if(this.admin.hbData.isGeo){
            var locations = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('formatted_address'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: '//maps.googleapis.com/maps/api/geocode/json?address=%QUERY%&sensor=true',
                    wildcard: '%QUERY%',
                    transform: function(response) {
                        return response.results;
                    },
                    rateLimitWait: 600
                }
            });
            var tH = $('#mapsvg-geocode .typeahead').typeahead(null, {
                name: 'mapsvg-addresses',
                display: 'formatted_address',
                source: locations,
                minLength: 2
            });
            $('#mapsvg-geocode .typeahead').on('typeahead:select',function(ev,item){
                var src = $('#mapsvg-geocode img').attr('src');
                _this.mapsvg.markerAdd({src: src, geoCoords: [item.geometry.location.lat,item.geometry.location.lng]},true);
                $('#mapsvg-geocode .typeahead').typeahead('val', '');

            });
        }

        this.view.on('click','a.editable',function(){
            var cont = $(this).parent();
            var link = $(this);
            var width = link.width();

            $(this).hide();
            var _text = $(this).text();
            var row = $(this).closest('tr');
            var marker_id = row.data('marker-id');
            var marker = _this.mapsvg.getMarker(marker_id);
            var input = $('<input class="editable" value="'+_text+'"/>');
            input.width(width);
            input.insertBefore($(this));
            input.select();
            var field = link.data('field');

            input.on('blur',function(){

                text = $(this).val();

                if(_text!=text){
                    if(field == 'id') {
                        text = text.replace(' ', '_');
                        var checkId = _this.mapsvg.checkId(text);
                        if(checkId.error){
                            $().message(checkId.error);
                            return false;
                        }
                    }
                    var update = {};
                    update[field] = text;
                    link.html(text);
                    marker.update(update);

                    if(field == 'id'){
                        _this.mapsvg.updateMarkersDict();
                        row.attr('id','mapsvg-marker-'+text);
                        row.data('marker-id', text);
                    }else if(field=='geoCoords'){

                    }
                }
                link.show();

                $(this).off().remove();
            }).on('keypress', function(e){
                if (e.which == 13 || event.keyCode == 13) {
                    e.preventDefault();
                    $(this).blur().trigger('blur');
                }
            });

        }).on('click','.mapsvg-marker-delete',function(e){
            e.preventDefault();
            var row = $(this).closest('tr');
            var rid = row.data('marker-id');
            var marker = _this.mapsvg.getMarker(rid);
            _this.mapsvg.markerDelete(marker);
            row.fadeOut(300,function(){
                $(this).remove();
            });
        });


        $('#mapsvg-geocode .mapsvg-marker-image-btn-trigger img').attr('src',window.markerImages[0].url);




        this.view.on('click','.mapsvg-link-btn',function(e){
            e.preventDefault();
            var cont = $(this).parent();
            var btn = $(this);
            var row = $(this).closest('tr');
            var marker_id = row.data('marker-id');
            var marker = _this.mapsvg.getMarker(marker_id);
            var oldUrl = marker.href;
            var input = $('<input class="link-editable form-control" value="'+(marker.href||'')+'"/>');
            // input.css({
            //     top: btn.offset().top +'px',
            //     left: (btn.offset().left - 350) +'px'
            // });
            cont.append(input);
            btn.addClass('opened');
            input.select();
            input.on('blur',function(){
                var newUrl = $(this).val();
                if(newUrl!=oldUrl){
                    marker.update({href: newUrl});
                    if(newUrl.length)
                        btn.addClass('active');
                    else
                        btn.removeClass('active');
                }
                $(this).off().remove();
                btn.removeClass('opened')
            }).on('keypress', function(e){
                if (e.which == 13 || event.keyCode == 13) {
                    e.preventDefault();
                    $(this).blur().trigger('blur');
                }
            });
        });


        $('#mapsvg-markers-search input#mapsvg-markers-search-1').on('keyup',function(){
            var t = $(this).data('t');
            t && clearTimeout(t);
            var that = this;

            $(this).data('t',setTimeout(function(){
                var searchString = $(that).val();
                $('#mapsvg-search-markers-no-matches').hide();
                if(searchString.length){
                    var markers = _this.mapsvg.searchMarkers(searchString);
                    $('#table-markers tr').hide();
                    if(markers.length > 0){
                        for (var i in markers)
                            $('#table-markers tr#mapsvg-marker-'+markers[i]).show();
                    }else{
                        $('#mapsvg-search-markers-no-matches').show();
                    }
                }else{
                    $('#table-markers tr').show();
                }
            },300));
        });

        // this.view.on('click','.mapsvg-data-btn',function(e){
        //     e.preventDefault();
        //     var id = $(this).closest('tr').data('marker-id');
        //     $('#mapsvg-tabs-menu a[href="#tab_database"]').tab('show');
        //     $('#mapsvg-data-search').val(id).trigger('keyup');
        // })

    };

    MapSVGAdminMarkersController.prototype.addMarker = function(marker){
        var markerRow = $(this.templates.item(marker));
        $('#table-markers').prepend(markerRow);
    }

})(jQuery, window);