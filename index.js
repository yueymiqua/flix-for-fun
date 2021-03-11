const express = require('express');
const morgan = require('morgan');
const app = express();

let favoriteMovies = [
  {title: 'Momento', year: '2000', director: 'Christopher Nolan'},
  {title: 'Avengers Infinity War', year: '2018', director: 'Joe/Anthony Russo'},
  {title: 'John Wick', year: '2014', director: 'Chad Stahelski'},
  {title: 'The Prestige', year: '2006', director: 'Christopher Nolan'},
  {title: 'Hot Fuzz', year: '2007', director: 'Edgar Wright'},
  {title: 'Harold & Kumar Go to White Castle', year: '2004', director: 'Danny Leiner'},
  {title: 'Onward', year: '2020', director: 'Dan Scanlon'},
  {title: 'The Conjuring', year: '2013', director: 'James Wan'},
  {title: 'Oldboy', year: '2003', director: 'Chan-wook Park'},
  {title: 'The Shining', year: '1980', director: 'Stanley Kubrick'}
];

app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Oops, An Error Occurred!')
})

app.get('/movies', (req, res) => {
  res.send(favoriteMovies);
});

app.get('/', (req, res) => {
  res.send('Welcome to Flix-For-Fun - Your Online One-stop Never-ending Supply Stream of Movies!')
});

app.listen(8080, () => {
  console.log('This app is being listened to via port 8080');
});

