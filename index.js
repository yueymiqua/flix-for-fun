const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const app = express();
const { check, validationResult } = require('express-validator');
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use(cors());
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');
// Imports the model names definied in the models.js file (they were exported at the bottom of file)
const Movies = Models.Movie;
const Users = Models.User;

// Allows Mongoose to connect your database(FlixForFunDB) so it can perform CRUD operations on the documents it contains from within your REST API
// FOR CONNECTING TO LOCAL HOST
// mongoose.connect('mongodb://localhost:27017/FlixForFun', { useNewUrlParser: true, useUnifiedTopology: true})
// FOR CONNECTING TO PaaS
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true})

app.get('/', (req, res) => {
  res.send('Welcome to Flix-For-Fun!');
})

// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).res('Error: ' + err);
    });
});

// get all movies by Title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne( {  Title: req.params.Title } )
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// find genre description by genre name(ex. 'Thriller')
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne( { 'Genre.Name': req.params.Name} )
  .then((movie) => {
    res.status(200).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// find director info by director name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false}), (req, res) => {
  Movies.findOne( { 'Director.Name': req.params.Name } )
  .then((movie) => {
    res.status(200).json(movie.Director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//Add a user (expecting a JSON format with ID: integer, Username: string, Password: string, Email: string, Birthday: date)
app.post('/users', 
  // Using express validator to check user's input fields
  [
    check('Username', 'Username must be minimum 5 characters').isLength({min: 5}),
    check('Username', 'Username cannot contain non-alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Not a valid email address - incorrect format').isEmail(),
    check('Birthday', 'Not a valid date -- enter as YYYY-MM-DD').isDate()
  ], (req, res) => {

    // check the validator objects for errors
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // hashing the password entered from Password field
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword, // Adding the hashed password to mongoDB database
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne( { Username: req.params.Username } )
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update a user's info by Username (Expecting a JSON file with Username: string(REQUIRED), Password: string(REQUIRED), Email: string(REQUIRED, and Birthday: Date))
app.put('/users/:Username', passport.authenticate('jwt', { session: false}),
[
  check('Username', 'Username must be minimum 5 characters').isLength({min: 5}),
  check('Username', 'Username cannot contain non-alphanumeric characters').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Not a valid email address - incorrect format').isEmail(),
  check('Birthday', 'Not a valid date -- enter as YYYY-MM-DD').isDate()
], (req, res) => { 
 
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Remove a movie to a user's list of favorites
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

// For listening on local port(8080)
// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080')
// });