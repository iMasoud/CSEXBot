var telegram = require('telegram-bot-api');
var fs = require('fs');
var util = require('util');
var keyboards = require('./keyboards'); //contains keyboards of bot and Strings of them
var Sessions = require('./Sessions'); //ADT
var texts = require('./texts'); //String Resource
var sensitive = require('./sensitive'); //Sensitive Data: bot token and teacher's chat id

/* following makes a copy of each console.log(); to "debug.log" file */
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'});
var log_stdout = process.stdout;
console.log = function(d) { 
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};
/* end */

var teacher = sensitive.teacher;

var api = new telegram(
    {
        token: sensitive.token,
        updates:
        {
            enabled: true,
            get_interval: 1000
        }
    });

api.on('message', function(message)
{
    if(message.chat.id === teacher)
    {
        api.sendMessage({
            chat_id: teacher,
            text: texts.teacher
        }, function(err, message)
        {
            console.log(err);
            console.log(message);
        });
    }
    else
    {
        if (Sessions.exists(message.chat.id))
        {
            step = Sessions.get_step(message.chat.id);
        }
        else
        {
            Sessions.add(message.chat.id);
            step = 0;
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_choose_from_main_menu,
                reply_markup: JSON.stringify(keyboards.main_menu)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        is_text = message.text ? true : false;
    
        is_doc = message.document ? true : false;
    
        is_photo = message.photo ? true : false;
    
        console.log(message);
    
        if (!is_text && !is_photo && !is_doc)
        {
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.unexpected_format
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if((is_photo || is_doc) && step!==3)
        {
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.unexpected_photo_or_doc
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if((is_photo || is_doc) && step===3)
        {
            if(is_photo)
            {
                Sessions.add_file(message.chat.id, message.photo[message.photo.length-1].file_id, is_photo);
            }
            else
            {
                Sessions.add_file(message.chat.id, message.document.file_id, is_photo);
            }
        }
    
        else if (step === 0 && message.text === "/start")
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_choose_from_main_menu,
                reply_markup: JSON.stringify(keyboards.main_menu)
            }, function(final_err, final_msg)
            {
                console.log(final_err);
                console.log(final_msg);
    
                Sessions.set_step(message.chat.id, 0);
            });
        }
    
        else if (step === 3 && message.text === texts.ui_no_more_files && Sessions.get_files(message.chat.id).length>0)
        {
            Sessions.set_step(message.chat.id, 4);
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_are_you_sure + '\n'
                + 'نام و نام خانوادگی: ' + Sessions.get_name(message.chat.id) + '\n'
                + 'درس: ' + Sessions.get_lesson(message.chat.id),
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, msg)
            {
                console.log(err);
                console.log(msg);
    
                for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                {
                    if(Sessions.get_is_photo(message.chat.id)[i])
                    {
                        api.sendPhoto({
                            chat_id: message.chat.id,
                            photo: Sessions.get_files(message.chat.id)[i].toString()
                        }, function(err, data)
                        {
                            console.log(err);
                            console.log(util.inspect(data, false, null));
                        });
                    }
                    else
                    {
                        api.sendDocument({
                            chat_id: message.chat.id,
                            document: Sessions.get_files(message.chat.id)[i].toString()
                        }, function(err, data)
                        {
                            console.log(err);
                            console.log(util.inspect(data, false, null));
                        });
                    }
                }
            });
        }
    
        else if (step === 3 && message.text === texts.ui_no_more_files && Sessions.get_files(message.chat.id).length<=0)
        {
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_you_did_not_sent_any_files,
                reply_markup: JSON.stringify(keyboards.send_files)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if(step === 0 && message.text === keyboards.ui_send_exercise)
        {
            Sessions.set_step(message.chat.id, 1);
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_enter_name
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if(step === 1)
        {
            Sessions.set_name(message.chat.id, message.text);
            Sessions.set_step(message.chat.id, 2);
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_choose_lesson,
                reply_markup: JSON.stringify(keyboards.lessons)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if(step === 2 && (message.text === keyboards.ui_data_structures || message.text === keyboards.ui_design_algorithm || message.text === keyboards.ui_computer_arcitecture || message.text === keyboards.ui_ai))
        {
            Sessions.set_lesson(message.chat.id, message.text);
            Sessions.set_step(message.chat.id, 3);
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_start_sending_files,
                reply_markup: JSON.stringify(keyboards.send_files)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    
        else if(step === 4 && message.text === keyboards.ui_confirm)
        {
            api.sendMessage({
                chat_id: teacher,
                text: texts.ui_here_is_new_exercise + '\n'
                + 'درس: ' + Sessions.get_lesson(message.chat.id) + '\n'
                + 'نام و نام خانوادگی: ' + Sessions.get_name(message.chat.id) + '\n'
                + '(شامل فایل های زیر:)'
            }, function(err, msg)
            {
                console.log(err);
                console.log(msg);
    
                for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                {
                    if(Sessions.get_is_photo(message.chat.id)[i])
                    {
                        api.sendPhoto({
                            chat_id: teacher,
                            photo: Sessions.get_files(message.chat.id)[i].toString(),
                            reply_to_message_id: msg.message_id
                        }, function(err, data)
                        {
                            console.log(err);
                            console.log(util.inspect(data, false, null));
    
                            j=parseInt(i);
                            j++;
                            if((j<Sessions.get_files(message.chat.id).length)?false:true)                        
                            {
                                Sessions.remove(message.chat.id);
                                Sessions.add(message.chat.id);
                                
                                api.sendMessage({
                                    chat_id: message.chat.id,
                                    text: texts.ui_success
                                }, function(next_err, msg)
                                {
                                    console.log(next_err);
                                    console.log(msg);
                        
                                    api.sendMessage({
                                        chat_id: message.chat.id,
                                        text: texts.ui_choose_from_main_menu,
                                        reply_markup: JSON.stringify(keyboards.main_menu)
                                    }, function(final_err, final_msg)
                                    {
                                        console.log(final_err);
                                        console.log(final_msg);
                        
                                        Sessions.set_step(message.chat.id, 0);
                                    });
                                });
                            }
                        });
                    }
                    else
                    {
                        api.sendDocument({
                            chat_id: teacher,
                            document: Sessions.get_files(message.chat.id)[i].toString(),
                            reply_to_message_id:msg.message_id
                        }, function(err, data)
                        {
                            console.log(err);
                            console.log(util.inspect(data, false, null));
    
                            j=parseInt(i);
                            j++;
                            if((j<Sessions.get_files(message.chat.id).length)?false:true)
                            {
                                Sessions.remove(message.chat.id);
                                Sessions.add(message.chat.id);
                                
                                api.sendMessage({
                                    chat_id: message.chat.id,
                                    text: texts.ui_success
                                }, function(next_err, msg)
                                {
                                    console.log(next_err);
                                    console.log(msg);
                        
                                    api.sendMessage({
                                        chat_id: message.chat.id,
                                        text: texts.ui_choose_from_main_menu,
                                        reply_markup: JSON.stringify(keyboards.main_menu)
                                    }, function(final_err, final_msg)
                                    {
                                        console.log(final_err);
                                        console.log(final_msg);
                        
                                        Sessions.set_step(message.chat.id, 0);
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    
        else if(step === 4 && message.text === keyboards.ui_cancel)
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
    
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.cancelled
            }, function(err, msg)
            {
                console.log(err);
                console.log(msg);
    
                api.sendMessage({
                    chat_id: message.chat.id,
                    text: texts.ui_choose_from_main_menu,
                    reply_markup: JSON.stringify(keyboards.main_menu)
                }, function(err, message)
                {
                    console.log(err);
                    console.log(message);
                });
            });
        }
    
        else if(message.text === keyboards.ui_help || message.text === '/help')
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
            
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.help_text
            }, function(help_err, help_message)
            {
                console.log(help_err);
                console.log(help_message);
                
                api.sendPhoto({
                    chat_id: message.chat.id,
                    photo: 'AgADBAADTqgxG9jjkQY3Stx5Sj3TtMZhcTAABNFSlF0FNVe6dVABAAEC'
                }, function(photo_err, photo_data)
                {
                    console.log(photo_err);
                    console.log(util.inspect(photo_data, false, null));
                    
                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_choose_from_main_menu,
                        reply_markup: JSON.stringify(keyboards.main_menu)
                    }, function(err, msg)
                    {
                        console.log(err);
                        console.log(msg);
                    });
                });
            });
        }
    
        else if(message.text === "/stop")
        {
            Sessions.remove(message.chat.id);
        }
    
        else
        {
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.undefined_text
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }
    }
});

