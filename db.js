var sensitive = require('./sensitive'); //checkout add: exists

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	url = sensitive.db_url;

mongoose.connect(url);

settingsSchema = new Schema({
	ID    : Number,
    DS    : Boolean,
    AD    : Boolean,
    AI    : Boolean,
    CA    : Boolean
});

settingsModel = mongoose.model('Settings', settingsSchema);

var functions = 
{
	exists: function(id, exists_callback)
	{
		settingsModel.count({'ID': id}, function (err, count)
		{ 
			if(err)
			{
				console.log("Checking the existance of query failed: " + err);
				exists_callback(false);
			}
			else
			{
			    if(count>0){
			        exists_callback(true);
			    }
			    else
			    {
			    	exists_callback(false);
			    }
			}
		});
	},

	add: function(id, add_callback)
	{
			new settingsModel({
			    ID : id,
			    DS    : true,
			    AD    : true,
			    AI    : true,
			    CA    : true
			}).save(function(err)
			{
				if(err)
				{
					console.log("Adding a query failed: " + err);
					add_callback(false);
				}
				else
				{
					add_callback(true);
				}
			});
	},

	get_students: function(callback_one)
	{
		settingsModel.find({})
		.exec(function(err, result)
		{
			if(err)
			{
				console.log("Fetching a query failed: " + err);
				callback_one(false);
			}
			else
			{
				callback_one(result);
			}
		});
	},

	get_active: function(id, callback_two)
	{
		settingsModel.find({'ID' : id})
		.exec(function(err, result)
		{
			if(err)
			{
				console.log("Fetching a query failed: " + err);
				callback_two(false);
			}
			else
			{
				the_output = '';

				if (result[0].DS === true)
				{
					the_output = the_output + '\n' + 'ساختمان داده';
				}
				if (result[0].AD === true)
				{
					the_output = the_output + '\n' + 'طراحی الگوریتم';
				}
				if (result[0].AI === true)
				{
					the_output = the_output + '\n' + 'هوش مصنوعی';
				}
				if (result[0].CA === true)
				{
					the_output = the_output + '\n' + 'معماری کامپیوتر';
				}
				if(the_output==='')
				{
					the_output = '(در حال حاضر هیچ درسی برای شما فعال نیست)'
				}

				callback_two(the_output);
			}
		});
	},

	get_deactive: function(id, callback_three)
	{
		settingsModel.find({'ID' : id})
		.exec(function(err, result)
		{
			if(err)
			{
				console.log("Fetching a query failed: " + err);
				callback_three(false);
			}
			else
			{
				the_output = '';
				if (result[0].DS === false)
				{
					the_output = the_output + '\n' + 'ساختمان داده';
				}
				if (result[0].AD === false)
				{
					the_output = the_output + '\n' + 'طراحی الگوریتم';
				}
				if (result[0].AI === false)
				{
					the_output = the_output + '\n' + 'هوش مصنوعی';
				}
				if (result[0].CA === false)
				{
					the_output = the_output + '\n' + 'معماری کامپیوتر';
				}
				if(the_output==='')
				{
					the_output = '(در حال حاضر همه دروس برای شما فعال هستند)'
				}

				callback_three(the_output);
			}
		});
	},

	set_settings: function(id, ds, ad, ai, ca, callback_four)
	{
		// if(functions.exists(id) === false)
		// {
		// 	console.log("Trying to remove non existing query failed");
		// 	callback_four(false);
		// }
		// else
		// {
			settingsModel.update({ID : id}, { $set: { DS: ds, AD:ad, AI:ai, CA:ca }}, {}, function(err, count)
			{
				if(err || count!==1)
				{
					console.log("Removal of a query failed: " + err);
					callback_four(false);
				}
				else
				{
					callback_four(true);
				}
			});
		// }
	},

	remove: function(id, callback_five)
	{
		settingsModel.remove({ ID: id }, function(err)
		{
		    if (err)
		    {
		        console.log("remove query failed: " + err);
		        callback_five(false);
		    }
		    else
		    {
		        callback_five(true);
		    }
		});
	}
}

module.exports = functions;