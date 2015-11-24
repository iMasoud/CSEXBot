var sensitive = require('./sensitive');

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
	exists: function(id, callback)
	{
		settingsModel.count({ID: id}, function (err, count)
		{ 
			if(err)
			{
				console.log("Checking the existance of query failed: " + err);
				callback(false);
			}
			else
			{
			    if(count>0){
			        callback(true);
			    }
			    else
			    {
			    	callback(false);
			    }
			}
		});
	},

	add: function(id, callback)
	{
		if(functions.exists(id) === false)
		{
			console.log("Trying to add existing query failed");
			callback(false);
		}
		else
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
					callback(false);
				}
				else
				{
					callback(true);
				}
			});
		}
	},

	get_students: function(callback)
	{
		settingsModel.find({})
		.exec(function(err, result)
		{
			if(err)
			{
				console.log("Fetching a query failed: " + err);
				callback(false);
			}
			else
			{
				callback(result);
			}
		});
	}

	set_settings: function(id, ds, ad, ai, ca, callback)
	{
		if(functions.exists(id) === false)
		{
			console.log("Trying to remove non existing query failed");
			callback(false);
		}
		else
		{
			settingsModel.update({ID : id}, { $set: { DS: ds, AD:ad, AI:ai, CA:ca }}, {}, function(err, count)
			{
				if(err || count!==1)
				{
					console.log("Removal of a query failed: " + err);
					callback(false);
				}
				else
				{
					callback(true);
				}
			});
		}
	},

	remove: function(id, callback)
	{
		settingsModel.remove({ ID: id }, function(err)
		{
		    if (err)
		    {
		        console.log("remove query failed: " + err);
		        callback(false);
		    }
		    else
		    {
		        callback(true);
		    }
		});
	}
}

module.exports = functions;