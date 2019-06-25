const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const dbname = 'crud_mongodb';
const url = 'mongodb://localhost:27017';
const mongoOptions = { useNewUrlParser: true };

const state = {
  db: null,
};

const connect = (cb) => {
  if (state.db)
  {
    // If there is DB connection, use callback.
    cb();
  } else {
    // If no DB connection, connect to Mongo client
    MongoClient.connect(url, mongoOptions, (err, client) => {
      if (err)
        eb(err);
      else {
        state.db = client.db(dbname);
        cb();
      }
    });
  }
}

const getPrimaryKey = (_id) => {
  return ObjectID(_id);
}

const getDB = () => {
  return state.db;
}

module.exports = {
  connect,
  getPrimaryKey,
  getDB,
};