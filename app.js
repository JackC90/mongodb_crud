const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Joi = require('joi');

app.use(bodyParser.json());

const path = require('path');

const db = require('./db');
const collection = 'todo';

const schema = Joi.object().keys({
  todo: Joi.string().required()
})

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getTodos', (req,res) => {
  db.getDB().collection(collection).find({}).toArray((err, documents) => {
    if (err) {
      console.log(err);
    } else {
      console.log(documents);
      res.json(documents);
    }
  })
});

app.post('/', (req, res) => {
  const userInput = req.body;
  Joi.validate(userInput, schema, (err, result) => {
    if (err) {
      const error = new Error('Invalid input');
      error.status = 400;
      next(error);
    } else {
      db.getDB().collection(collection).insertOne(
        userInput,
        (err, result) => {
          if (err) {
            const error = new Error('Failed insert');
            error.status = 400;
            next(error);
          } else {
            res.json({
              result,
              document: result.ops[0],
              msg: 'Successfully inserted element',
              error: null,
            });
          }
        }
      );
    }
  })
})

app.put('/:id', (req, res) => {
  const todoId = req.params.id;
  const userInput = req.body;

  db.getDB().collection(collection).findOneAndUpdate(
    { _id: db.getPrimaryKey(todoId) },
    { $set: { todo: userInput.todo } },
    { returnOriginal: false },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
})

app.delete('/:id', (req, res) => {
  const todoId = req.params.id;

  db.getDB().collection(collection).findOneAndDelete(
    { _id: db.getPrimaryKey(todoId) },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.json(result);
      }
    }
  );
})

app.use((err, req, res, next) => {
  res.status(err.status >= 100 && err.status < 600 ? err.code : 500).json({
    error: {
      message: err.message,
    }
  });
})

db.connect((err) => {
  if (err) {
    console.log('unable to connect to database');
    process.exit(1);
  } else {
    app.listen(3000, () => {
      console.log('connected to database, app listening to port 3000')
    });
  }
});