function checkUserAccess(req, collection, id, callback) {
  collection
    .findById(id)
    .populate({ path: 'author', select: '_id '})
    .exec(function(err, doc) {
      if (err)
        callback(err);
      else if (!doc)
        callback(new Error("The record no longer exists"));
      else {

        const authorId = String(doc.author._id);
        const userId = String(req.user.id);

        if (authorId !== userId)
          return callback(new Error("You have no rights to delete this record"));

        callback(null, doc);
      }
    });
}

module.exports = checkUserAccess;
