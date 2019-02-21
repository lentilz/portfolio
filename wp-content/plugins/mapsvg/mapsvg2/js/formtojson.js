/*
 * jQuery plugin - convert <form></form> data to JS object
 * Author - Roman S. Stepanov
 * http://codecanyon.net/user/RomanCode/portfolio?ref=RomanCode
 */
(function( $ ) {

    $.fn.formToJSON = function(addEmpty) {

        var obj = {};

        function add(obj, name, value){
            if(!addEmpty && !value)
                return false;
            if(name.length == 1) {
                obj[name[0]] = value;
            }else{
                if(obj[name[0]] == null)
                    obj[name[0]] = {};
                add(obj[name[0]], name.slice(1), value);
            }
        }

        $(this).find('input, textarea, select').each(function(){
            if($(this).attr('name') && !( ($(this).attr('type')=='checkbox' || $(this).attr('type')=='radio') && $(this).attr('checked')==undefined)){
                add(obj, $(this).attr('name').replace(/]/g, '').split('['), $(this).val());
            }
        });

        return obj;
    };

    $.fn.inputToObject = function(formattedValue) {

        var obj = {};

        function add(obj, name, value){
            //if(!addEmpty && !value)
            //    return false;
            if(name.length == 1) {
                obj[name[0]] = value;
            }else{
                if(obj[name[0]] == null)
                    obj[name[0]] = {};
                add(obj[name[0]], name.slice(1), value);
            }
        }

        if($(this).attr('name') && !($(this).attr('type')=='radio' && !$(this).prop('checked'))){
            add(obj, $(this).attr('name').replace(/]/g, '').split('['), formattedValue);
        }

        return obj;
    };

})(jQuery);