/**
 * Created by masoud on 10/27/15.
 */

var Sessions = new Array;

functions =
{
    exists : function(id)
    {
        return (typeof(Sessions[id]) === 'undefined')?false:true;
    },

    add : function(id)
    {
        Sessions[id] =
        {
            step:0,
            name: "",
            lesson: ""
        };

        Sessions[id].files = new Array;
        Sessions[id].is_photo = new Array;

        if(Sessions[id].step === 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    remove : function(id)
    {
        if (functions.exists(id))
        {
            Sessions.splice(id, 1);
            return true;
        }
        else
        {
            return false;
        }
    },

    get_step : function(id)
    {
        if (functions.exists(id))
        {
            return Sessions[id].step;
        }
        else
        {
            return -1;
        }
    },

    set_step : function(id,step) {
        if (functions.exists(id)) {
            Sessions[id].step = step;
            return true;
        }
        else {
            return false;
        }
    },

    set_name : function(id,name) {
        if (functions.exists(id)) {
            Sessions[id].name = name;
            return true;
        }
        else {
            return false;
        }
    },

    get_name : function(id)
    {
        if (functions.exists(id))
        {
            return Sessions[id].name;
        }
        else
        {
            return "";
        }
    },

    set_lesson : function(id,lesson) {
        if (functions.exists(id)) {
            Sessions[id].lesson = lesson;
            return true;
        }
        else {
            return false;
        }
    },

    get_lesson : function(id)
    {
        if (functions.exists(id))
        {
            return Sessions[id].lesson;
        }
        else
        {
            return "";
        }
    },

    add_file : function(id, file_id, is_photo)
    {
        if (functions.exists(id))
        {
            Sessions[id].files.push(file_id);
            Sessions[id].is_photo.push(is_photo);
            return true;
        }
        else
        {
            return false;
        }
    },

    clear_files : function(id)
    {
        if (functions.exists(id))
        {
            Sessions[id].files = [];
            Sessions[id].is_photo = [];
            return true;
        }
        else
        {
            return false;
        }
    },

    get_files : function(id)
    {
        if (functions.exists(id))
        {
            return Sessions[id].files;
        }
        else
        {
            return false;
        }
    },

    get_is_photo : function(id)
    {
        if (functions.exists(id))
        {
            return Sessions[id].is_photo;
        }
        else
        {
            return false;
        }
    }
}

module.exports = functions;