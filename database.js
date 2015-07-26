var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/alien-empire-db';
// var url = 'mongodb://Zebbeni:wakkawakka1984$@apollo.modulusmongo.net:27017/heHuqy5b';

MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		console.log('Connection established to', url);

		//if 'users' collection already exists, it will be selected. If not, this line will create it.
		var collection = db.collection('users-db');

		collection.update({name: 'users'}, {$set: {num_users: 0, enabled: false } }, function( err, numUpdated) {
			if (err) {
				console.log(err);
			} else if (numUpdated) {
				console.log('Updated successfully %d documents.', numUpdated);
			} else {
				console.log('No document found with defined "find" criteria!');
			}
		});

		// collection.remove({});
		// collection.remove();

		// db.close();

		collection.find({}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			} else if ( result ){
				console.log(result);
			} else {
				console.log('No document(s) found with defined "find" criteria!');
			}
			db.close();
		});
	}
});