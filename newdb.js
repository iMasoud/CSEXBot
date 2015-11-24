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
	exists: function(id)
	{
		settingsModel.count({ID: id}, function (err, count)
		{ 
			if(err)
			{
				console.log("Checking the existance of query failed: " + err);
				return false;
			}
			else
			{
			    if(count>0){
			        return true;
			    }
			    else
			    {
			    	return false;
			    }
			}
		});
	},

	add: function(id)
	{
		settingsModel.count({ID: id}, function (err, count)
		{ 
			if(err)
			{
				console.log("Adding document failed in existance check: " + err);
				//return false;
			}
			else
			{
			    if(count>0){
			    	//console.log("Adding document failed because it already exists.");
			        //return false;
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
							console.log("Adding a document failed: " + err);
							//return false;
						}
						// else
						// {
						// 	return true;
						// }
					});
			    }
			}
		});
	},

	get_settings: function(id)
	{
		settingsModel.count({ID: id}, function (err, count)
		{ 
			if(err)
			{
				console.log("Gettings document failed in existance check: " + err);
				//return false;
			}
			else
			{
			    if(count>0){
			        return true;
			    }
			    else
			    {
			    	return false;
			    }
			}
		});




		if(functions.exists(id) === false)
		{
			console.log("Trying to fetch non existing query failed");
			return false;
		}
		else
		{
			settingsModel.find({ID : id})
			.exec(function(err, result)
			{
				if(err)
				{
					console.log("Fetching a query failed: " + err);
					return false;
				}
				else
				{
					return result;
				}
			});
		}
	},

	set_settings: function(id, ds, ad, ai, ca)
	{
		if(functions.exists(id) === false)
		{
			console.log("Trying to remove non existing query failed");
			return false;
		}
		else
		{
			settingsModel.update({ID : id}, { $set: { DS: ds, AD:ad, AI:ai, CA:ca }}, {}, function(err, count)
			{
				if(err || count!==1)
				{
					console.log("Removal of a query failed: " + err);
					return false;
				}
				else
				{
					return true;
				}
			});
		}
	},

	// remove: function(id)
	// {
	// 	settingsModel.remove({ ID: id }, function(err)
	// 	{
	// 	    if (err)
	// 	    {
	// 	        console.log("remove query failed: " + err);
	// 	        return false;
	// 	    }
	// 	    else
	// 	    {
	// 	        return true;
	// 	    }
	// 	});
	// }
}

module.exports = functions;