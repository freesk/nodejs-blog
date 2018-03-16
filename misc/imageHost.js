var request = require('request');
var fs = require('fs');

var imageHost = {};

imageHost.upload = function(path, callback) {

	fs.readFile(path, function(err, data) {
	  if (err) return callback(err);

	  // encode to base64
	  var encodedImage = new Buffer(data, 'binary').toString('base64');

		var options = {
			method: 'POST',
			url: "https://api.imgur.com/3/image",
			headers: {
				'Authorization': "Bearer <your_access_token>"
			},
			type: "base64",
			album: "aSxRw",
			body: encodedImage
		};

		request(options, function(err, res, body) {
				if (err) return callback(err);

				let obj;

				try {
					obj = JSON.parse(res.body);
					if (obj.status !== 200)
						return callback(new Error("Cannot upload the image"));

				} catch (e) {
					return callback(e);
				}

				console.dir(obj);

				callback(null, obj.data.link);

		});

	});

};

imageHost.delete = function(id, callback) {
	var options = {
		method: 'DELETE',
		url: "https://api.imgur.com/3/image/" + id,
		headers: {
			'Authorization': "Bearer <your_access_token>"
		}
	};

	request(options, function(err, res, body) {
		if (err) return callback(err);
		let obj;
		try {
			obj = JSON.parse(res.body);
			if (obj.status !== 200)
				return callback(new Error("Cannot delete the image"));
		} catch (e) {
			return callback(e);
		}

		console.dir(obj);

		callback(null);

	});

}

// imageHost.upload("image.jpg", function(err, imgUrl) {
// 	if (err) return callback(err.message);
//
// 	console.log(imgUrl);
// });

// imageHost.delete("Uk23O6O", function(err) {
// 	if (err) return callback(err.message);
//
// 	console.log(imgUrl);
// });

module.exports = imageHost;
