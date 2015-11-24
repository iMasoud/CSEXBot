var telegram = require('telegram-bot-api');
var fs = require('fs');
var util = require('util');
var keyboards = require('./keyboards'); //contains keyboards of bot and Strings of them
var Sessions = require('./Sessions'); //ADT
var texts = require('./texts'); //String Resource
var sensitive = require('./sensitive'); //Sensitive Data: bot token and teacher's chat id
var db = require('./db'); //The database connection and functions

/* following makes a copy of each console.log(); to "debug.log" file */
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'});
var log_stdout = process.stdout;
console.log = function(d) { 
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};
/* end */

var teacher_chat_id = sensitive.teacher;

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
    if(message.chat.id == teacher_chat_id)
    {
        if (Sessions.exists(message.chat.id))
        {
            step = Sessions.get_step(message.chat.id);
        }
        else
        {
            Sessions.add(message.chat.id);
            step = 0;
        }

        db.exists(message.chat.id, function(callback)
        {
            if(callback === false)
            {
                db.add(message.chat.id, function(callback_two)
                {
                    
                });
            }
        });

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
                text: texts.unexpected_photo_or_doc + '\n'
                + texts.admin_files_only_on_exercise
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if((is_photo || is_doc) && Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise && step===3)
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

        else if((is_photo || is_doc) && Sessions.get_name(message.chat.id) === keyboards.ui_share_news && step===3)
        {
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_admin_no_files_in_news,
                reply_markup: JSON.stringify(keyboards.admin_main_menu)
            }, function(final_err, final_msg)
            {
                console.log(final_err);
                console.log(final_msg);
            });
        }

        else if(Sessions.get_name(message.chat.id) === keyboards.ui_share_news && step===3)
        {
            Sessions.set_news(message.chat.id, message.text);
            
            Sessions.set_step(message.chat.id, 4);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_admin_are_you_sure_news + '\n'
                + 'درس: ' + Sessions.get_lesson(message.chat.id) + '\n'
                + Sessions.get_news(message.chat.id),
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, msg)
            {
                console.log(err);
                console.log(msg);
            });
        }

        else if (step === 0 && message.text === "/start")
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
            step = 0;
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_choose_from_main_menu,
                reply_markup: JSON.stringify(keyboards.admin_main_menu)
            }, function(final_err, final_msg)
            {
                console.log(final_err);
                console.log(final_msg);
            });
        }

        else if (step === 3 && Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise && message.text === texts.ui_no_more_files && Sessions.get_files(message.chat.id).length>0)
        {
            Sessions.set_step(message.chat.id, 4);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_are_you_sure + '\n'
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

        else if (step === 3 && Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise && message.text === texts.ui_no_more_files && Sessions.get_files(message.chat.id).length<=0)
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

        else if(step === 0 && message.text === keyboards.ui_admin_menu_share)
        {
            Sessions.set_step(message.chat.id, 1);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_admin_what_to_share,
                reply_markup: JSON.stringify(keyboards.admin_news_or_exercise)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 1 && (message.text === keyboards.ui_share_exercise || message.text === keyboards.ui_share_news))
        {
            Sessions.set_name(message.chat.id, message.text);
            Sessions.set_step(message.chat.id, 2);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.admin_ui_choose_lesson,
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

            if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
            {
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
            else
            {
                api.sendMessage({
                    chat_id: message.chat.id,
                    text: texts.ui_admin_send_news
                }, function(err, message)
                {
                    console.log(err);
                    console.log(message);
                });
            }
    
        }

        else if(step === 4 && message.text === keyboards.ui_confirm)
        {
            switch(Sessions.get_lesson(message.chat.id))
            {
                case keyboards.ui_data_structures:
                    db.get_students(function(result)
                    {
                        for(var j=0; j<result.length; j++)
                        {
                            if(result[j].DS === true)
                            {
                                console.log("\n\n\n\n\n\n\n\n\n" + typeof(result[j].ID) + " : " + result[j].ID + "\n\n\n\n\n\n\n")
                                api.sendMessage({
                                    chat_id: result[j].ID,
                                    text: ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?texts.deliver_news:texts.deliver_exercise) + '\n'
                                    + 'درس: ساختمان داده' + '\n'
                                    + ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?Sessions.get_news(message.chat.id):'')
                                }, function(err, msg)
                                {
                                    console.log(err);
                                    console.log(msg);

                                    if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
                                    {
                                        for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                                        {
                                            if(Sessions.get_is_photo(message.chat.id)[i])
                                            {
                                                api.sendPhoto({
                                                    chat_id: result[j].ID,
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
                                                    chat_id: result[j].ID,
                                                    document: Sessions.get_files(message.chat.id)[i].toString()
                                                }, function(err, data)
                                                {
                                                    console.log(err);
                                                    console.log(util.inspect(data, false, null));
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    break;
                case keyboards.ui_design_algorithm:
                    db.get_students(function(result)
                    {
                        for(var j=0; j<result.length; j++)
                        {
                            if(result[j].DA === true)
                            {
                                api.sendMessage({
                                    chat_id: result[j].ID,
                                    text: ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?texts.deliver_news:texts.deliver_exercise) + '\n'
                                    + 'درس: طراحی الگوریتم' + '\n'
                                    + ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?Sessions.get_news(message.chat.id):'')
                                }, function(err, msg)
                                {
                                    console.log(err);
                                    console.log(msg);

                                    if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
                                    {
                                        for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                                        {
                                            if(Sessions.get_is_photo(message.chat.id)[i])
                                            {
                                                api.sendPhoto({
                                                    chat_id: result[j].ID,
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
                                                    chat_id: result[j].ID,
                                                    document: Sessions.get_files(message.chat.id)[i].toString()
                                                }, function(err, data)
                                                {
                                                    console.log(err);
                                                    console.log(util.inspect(data, false, null));
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    break;
                case keyboards.ui_computer_arcitecture:
                    db.get_students(function(result)
                    {
                        for(var j=0; j<result.length; j++)
                        {
                            if(result[j].CA === true)
                            {
                                api.sendMessage({
                                    chat_id: result[j].ID,
                                    text: ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?texts.deliver_news:texts.deliver_exercise) + '\n'
                                    + 'درس: معماری کامپیوتر' + '\n'
                                    + ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?Sessions.get_news(message.chat.id):'')
                                }, function(err, msg)
                                {
                                    console.log(err);
                                    console.log(msg);

                                    if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
                                    {
                                        for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                                        {
                                            if(Sessions.get_is_photo(message.chat.id)[i])
                                            {
                                                api.sendPhoto({
                                                    chat_id: result[j].ID,
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
                                                    chat_id: result[j].ID,
                                                    document: Sessions.get_files(message.chat.id)[i].toString()
                                                }, function(err, data)
                                                {
                                                    console.log(err);
                                                    console.log(util.inspect(data, false, null));
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    break;
                case keyboards.ui_ai:
                    db.get_students(function(result)
                    {
                        for(var j=0; j<result.length; j++)
                        {
                            if(result[j].AI === true)
                            {
                                api.sendMessage({
                                    chat_id: result[j].ID,
                                    text: ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?texts.deliver_news:texts.deliver_exercise) + '\n'
                                    + 'درس: هوش مصنوعی' + '\n'
                                    + ((Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)?Sessions.get_news(message.chat.id):'')
                                }, function(err, msg)
                                {
                                    console.log(err);
                                    console.log(msg);

                                    if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
                                    {
                                        for (var i = 0; i < Sessions.get_files(message.chat.id).length; i++)
                                        {
                                            if(Sessions.get_is_photo(message.chat.id)[i])
                                            {
                                                api.sendPhoto({
                                                    chat_id: result[j].ID,
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
                                                    chat_id: result[j].ID,
                                                    document: Sessions.get_files(message.chat.id)[i].toString()
                                                }, function(err, data)
                                                {
                                                    console.log(err);
                                                    console.log(util.inspect(data, false, null));
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });
                    break;
            }

            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);

            step = 0;

            if(Sessions.get_name(message.chat.id) === keyboards.ui_share_exercise)
            {
                api.sendMessage({
                    chat_id: message.chat.id,
                    text: texts.admin_exercise_sent
                }, function(err, msg)
                {
                    console.log(err);
                    console.log(msg);

                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_choose_from_main_menu,
                        reply_markup: JSON.stringify(keyboards.admin_main_menu)
                    }, function(second_err, second_message)
                    {
                        console.log(second_err);
                        console.log(second_message);
                    });
                });
            }
            else
            {
                api.sendMessage({
                    chat_id: message.chat.id,
                    text: texts.admin_news_sent
                }, function(err, msg)
                {
                    console.log(err);
                    console.log(msg);

                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_choose_from_main_menu,
                        reply_markup: JSON.stringify(keyboards.admin_main_menu)
                    }, function(second_err, second_message)
                    {
                        console.log(second_err);
                        console.log(second_message);
                    });
                });
            }
                
        }

        else if(step === 4 && message.text === keyboards.ui_cancel)
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);

            step = 0;

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.admin_cancelled
            }, function(err, message)
            {
                console.log(err);
                console.log(message);

                api.sendMessage({
                    chat_id: message.chat.id,
                    text: texts.ui_choose_from_main_menu,
                    reply_markup: JSON.stringify(keyboards.admin_main_menu)
                }, function(second_err, second_message)
                {
                    console.log(second_err);
                    console.log(second_message);
                });
            });
        }

        else if(message.text === keyboards.ui_admin_menu_help || message.text === '/help')
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
            step = 0;
            
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.admin_help_text
            }, function(help_err, help_message)
            {
                console.log(help_err);
                console.log(help_message);
                
                api.sendPhoto({
                    chat_id: message.chat.id,
                    photo: 'AgADBAADjqgxG9jjkQbwuoe4kVfi4kVdizAABB40wmTFGiTNVD0BAAEC'
                }, function(photo_err, photo_data)
                {
                    console.log(photo_err);
                    console.log(util.inspect(photo_data, false, null));
                    
                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_choose_from_main_menu,
                        reply_markup: JSON.stringify(keyboards.admin_main_menu)
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
        }

        db.exists(message.chat.id, function(bot_exists_callback)
        {
            if(bot_exists_callback === false)
            {
                db.add(message.chat.id, function(callback_two)
                {
                    
                });
            }
        });
    
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
                chat_id: teacher_chat_id,
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
                            chat_id: teacher_chat_id,
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
                            chat_id: teacher_chat_id,
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
            step = 0;
            
            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.help_text
            }, function(help_err, help_message)
            {
                console.log(help_err);
                console.log(help_message);
                
                api.sendPhoto({
                    chat_id: message.chat.id,
                    photo: 'AgADBAADjqgxG9jjkQbwuoe4kVfi4kVdizAABB40wmTFGiTNVD0BAAEC'
                }, function(photo_err, photo_data)
                {
                    console.log(photo_err);
                    console.log(util.inspect(photo_data, false, null));
                    
                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.help_text_two
                    }, function(err, msg)
                    {
                        console.log(err);
                        console.log(msg);

                        api.sendMessage({
                            chat_id: message.chat.id,
                            text: texts.ui_choose_from_main_menu,
                            reply_markup: JSON.stringify(keyboards.main_menu)
                        }, function(err_two, msg_two)
                        {
                            console.log(err_two);
                            console.log(msg_two);
                        });
                    });
                });
            });
        }

        else if(step === 0 && message.text === keyboards.ui_settings)
        {
            Sessions.set_step(message.chat.id, 10);

            the_active = '';
            the_deactive = '';

            db.get_active(message.chat.id, function(callback)
            {
                the_active = callback;
                db.get_deactive(message.chat.id, function(callback_two)
                {
                    the_deactive = callback_two;

                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_here_is_your_settings + '\n'
                        + the_active + '\n'
                        + texts.ui_here_is_your_settings_two + '\n'
                        + the_deactive + '\n'
                        + texts.ui_here_is_your_settings_three,
                        reply_markup: JSON.stringify(keyboards.settings_menu)
                    }, function(err, message)
                    {
                        console.log(err);
                        console.log(message);
                    });
                });
            });
    
        }

        else if(step === 10 && message.text === keyboards.ui_settings_back_to_main_menu)
        {
            Sessions.remove(message.chat.id);
            Sessions.add(message.chat.id);
            step = 0;

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_choose_from_main_menu,
                reply_markup: JSON.stringify(keyboards.main_menu)
            }, function(err_two, msg_two)
            {
                console.log(err_two);
                console.log(msg_two);
            });
    
        }


        else if(step === 10 && message.text === keyboards.ui_settings_do_it)
        {
            Sessions.set_step(message.chat.id, 11);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_settings_question_one,
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 11 && (message.text === keyboards.ui_confirm || message.text === keyboards.ui_cancel))
        {
            Sessions.set_step(message.chat.id, 12);

            is_true = false;

            if(message.text === keyboards.ui_confirm)
            {
                is_true = true;
            }

            Sessions.set_SDS(message.chat.id, is_true);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_settings_question_two,
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 12 && (message.text === keyboards.ui_confirm || message.text === keyboards.ui_cancel))
        {
            Sessions.set_step(message.chat.id, 13);

            is_true = false;

            if(message.text === keyboards.ui_confirm)
            {
                is_true = true;
            }

            Sessions.set_SAD(message.chat.id, is_true);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_settings_question_three,
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 13 && (message.text === keyboards.ui_confirm || message.text === keyboards.ui_cancel))
        {
            Sessions.set_step(message.chat.id, 14);

            is_true = false;

            if(message.text === keyboards.ui_confirm)
            {
                is_true = true;
            }

            Sessions.set_SAI(message.chat.id, is_true);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_settings_question_four,
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 14 && (message.text === keyboards.ui_confirm || message.text === keyboards.ui_cancel))
        {
            Sessions.set_step(message.chat.id, 15);

            is_true = false;

            if(message.text === keyboards.ui_confirm)
            {
                is_true = true;
            }

            Sessions.set_SCA(message.chat.id, is_true);

            the_active = Sessions.get_active(message.chat.id);
            the_deactive = Sessions.get_deactive(message.chat.id);

            api.sendMessage({
                chat_id: message.chat.id,
                text: texts.ui_settings_sure + '\n'
                + Sessions.get_active(message.chat.id) + '\n'
                +texts.ui_settings_sure_two + '\n'
                + Sessions.get_deactive(message.chat.id) + '\n'
                +texts.ui_settings_sure_three,
                reply_markup: JSON.stringify(keyboards.sure)
            }, function(err, message)
            {
                console.log(err);
                console.log(message);
            });
        }

        else if(step === 15 && (message.text === keyboards.ui_confirm || message.text === keyboards.ui_cancel))
        {
            is_true = false;

            if(message.text === keyboards.ui_confirm)
            {
                is_true = true;
            }

            if(is_true)
            {
                db.set_settings(message.chat.id,
                    Sessions.get_SDS(message.chat.id),
                    Sessions.get_SAD(message.chat.id),
                    Sessions.get_SAI(message.chat.id),
                    Sessions.get_SCA(message.chat.id),
                    function(callback)
                {
                    api.sendMessage({
                        chat_id: message.chat.id,
                        text: texts.ui_settings_changed
                    }, function(err, message)
                    {
                        console.log(err);
                        console.log(message);

                        api.sendMessage({
                            chat_id: message.chat.id,
                            text: texts.ui_choose_from_main_menu,
                            reply_markup: JSON.stringify(keyboards.main_menu)
                        }, function(err, message)
                        {
                            console.log(err);
                            console.log(message);

                            Sessions.remove(message.chat.id);
                            Sessions.add(message.chat.id);
                        });
                    });
                });
            }
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

