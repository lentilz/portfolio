(function() {
    tinymce.PluginManager.add( 'mapsvg', function( editor, url ) {

        // Add Button to Visual Editor Toolbar
        editor.addButton('mapsvg', {
            title: 'Insert MapSVG',
            cmd: 'mapsvg',
            image: url + '/mce-button.png'
        });

        var mapsvgMaps;
        // Add Command when Button Clicked

        var link = jQuery('<a href="#TB_inline?width=100%&height=auto&inlineId=mapsvg-choose-map" class="thickbox"></a>').appendTo('body');

        function showModal(){
            link.trigger('click');
        }

        jQuery('body').on('click','.mapsvg-insert-shortcode',function(){
            var id = jQuery(this).data('id');
            var title = jQuery(this).data('title');
            editor.execCommand('mceInsertContent', false, '[mapsvg id="'+id+'" title="'+title+'"]');
            tb_remove();
        });

        editor.addCommand('mapsvg', function() {

            if(mapsvgMaps)
                return showModal();

            jQuery.get(ajaxurl, {
                action: 'mapsvg_get_maps',
                format: 'json'
            }, function(data){
                mapsvgMaps = data;
                var box = jQuery('<div id="mapsvg-choose-map" style="display:none;"><div class="wrap"><h1>MapSVG maps ' +
                    '<a href="/wp-admin/admin.php?page=mapsvg-config" target="_blank" class="page-title-action">Add New</a>' +
                    '</h1><div class="mapsvg-maps-list"></div></div></div>');
                data.forEach(function(item, index){
                    box.find('.mapsvg-maps-list').append('<a data-id="'+item.id+'" data-title="'+item.title+'" href="#" class="mapsvg-insert-shortcode">'+item.title+'</a>');
                });
                jQuery('body').append(box);
                showModal();
            },'json');
        });
    });
})();

