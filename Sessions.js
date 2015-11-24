/**
 * Created by masoud on 10/27/15.
 */

var sensitive = require('./sensitive'); //Sensitive Data: bot token and teacher_chat_id's chat id
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

        if(id == sensitive.teacher)
        {
            Sessions[id].news = " ";
        }
        else
        {
            Sessions[id].SDS = true;
            Sessions[id].SAD = true;
            Sessions[id].SAI = true;
            Sessions[id].SCA = true;
        }

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
    },

    set_news : function(id, news)
    {
        if(id == sensitive.teacher)
        {
            Sessions[id].news = news;
            return true;
        }
        else
        {
            return false;
        }
    },

    get_news : function(id)
    {
        if(id == sensitive.teacher)
        {
            return Sessions[id].news;
        }
        else
        {
            return false;
        }
    },

    set_SDS : function(id, sds)
    {
        if(id != sensitive.teacher)
        {
            Sessions[id].SDS = sds;
            return true;
        }
        else
        {
            return false;
        }
    },

    get_SDS : function(id)
    {
        if(id != sensitive.teacher)
        {
            return Sessions[id].SDS;
        }
        else
        {
            return false;
        }
    },

    set_SAD : function(id, sad)
    {
        if(id != sensitive.teacher)
        {
            Sessions[id].SAD = sad;
            return true;
        }
        else
        {
            return false;
        }
    },

    get_SAD : function(id)
    {
        if(id != sensitive.teacher)
        {
            return Sessions[id].SAD;
        }
        else
        {
            return false;
        }
    },

    set_SAI : function(id, sai)
    {
        if(id != sensitive.teacher)
        {
            Sessions[id].SAI = sai;
            return true;
        }
        else
        {
            return false;
        }
    },

    get_SAI : function(id)
    {
        if(id != sensitive.teacher)
        {
            return Sessions[id].SAI;
        }
        else
        {
            return false;
        }
    },

    set_SCA : function(id, sca)
    {
        if(id != sensitive.teacher)
        {
            Sessions[id].SCA = sca;
            return true;
        }
        else
        {
            return false;
        }
    },

    get_SCA : function(id)
    {
        if(id != sensitive.teacher)
        {
            return Sessions[id].SCA;
        }
        else
        {
            return false;
        }
    },

    get_active : function(id)
    {
        if(id != sensitive.teacher)
        {
            the_output = '';
            if (functions.get_SDS(id) === true)
            {
                the_output = the_output + '\n' + 'ساختمان داده';
            }
            if (functions.get_SAD(id) === true)
            {
                the_output = the_output + '\n' + 'طراحی الگوریتم';
            }
            if (functions.get_SAI(id) === true)
            {
                the_output = the_output + '\n' + 'هوش مصنوعی';
            }
            if (functions.get_SCA(id) === true)
            {
                the_output = the_output + '\n' + 'معماری کامپیوتر';
            }
            if(the_output==='')
            {
                the_output = '(در حال حاضر هیچ درسی برای شما فعال نیست)'
            }
            return the_output;
        }
        else
        {
            return false;
        }
    },

    get_deactive : function(id)
    {
        if(id != sensitive.teacher)
        {
            the_output = '';
            if (functions.get_SDS(id) === false)
            {
                the_output = the_output + '\n' + 'ساختمان داده';
            }
            if (functions.get_SAD(id) === false)
            {
                the_output = the_output + '\n' + 'طراحی الگوریتم';
            }
            if (functions.get_SAI(id) === false)
            {
                the_output = the_output + '\n' + 'هوش مصنوعی';
            }
            if (functions.get_SCA(id) === false)
            {
                the_output = the_output + '\n' + 'معماری کامپیوتر';
            }
            if(the_output==='')
            {
                the_output = '(در حال حاضر همه دروس برای شما فعال هستند)'
            }
            return the_output;
        }
        else
        {
            return false;
        }
    },
}

module.exports = functions;