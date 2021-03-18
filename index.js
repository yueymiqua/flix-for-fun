const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const morgan = require('morgan');
app.use(morgan('common'));
app.use(express.static('public'));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');
// Imports the model names definied in the models.js file (they were exported at the bottom of file)
const Movies = Models.Movie;
const Users = Models.User;
// Allows Mongoose to connect your database(FlixForFun) so it can perform CRUD operations on the documents
//it contains from within your REST API
mongoose.connect('mongodb://localhost:27017/FlixForFun', { useNewUrlParser: true, useUnifiedTopology: true})

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
app.post('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
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

app.listen(8080, () => {
  console.log('This app is being listened to via port 8080');
});


// let favoriteMovies = [
//   {title: 'Momento', year: '2000', director: 'Christopher Nolan'},
//   {title: 'Avengers Infinity War', year: '2018', director: 'Joe/Anthony Russo'},
//   {title: 'John Wick', year: '2014', director: 'Chad Stahelski'},
//   {title: 'The Prestige', year: '2006', director: 'Christopher Nolan'},
//   {title: 'Hot Fuzz', year: '2007', director: 'Edgar Wright'},
//   {title: 'Harold & Kumar Go to White Castle', year: '2004', director: 'Danny Leiner'},
//   {title: 'Onward', year: '2020', director: 'Dan Scanlon'},
//   {title: 'The Conjuring', year: '2013', director: 'James Wan'},
//   {title: 'Oldboy', year: '2003', director: 'Chan-wook Park'},
//   {title: 'The Shining', year: '1980', director: 'Stanley Kubrick'}
// ];

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Oops, An Error Occurred!')
// })

// app.get('/movies', (req, res) => {
//   res.send(favoriteMovies);
// });

// app.get('/', (req, res) => {
//   res.send('Welcome to Flix-For-Fun - Your Online One-stop Never-ending Supply Stream of Movies!')
// });