const express = require('express'),
      morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myHorrorDB', {useNewUrlParser: true, useUnifiedTopology: true });

let horrorMovies = [
  {
    title:  'The Ritual',
    director: 'David Bruckner'
  },
  {
    title: 'The Ring',
    director: 'Gore Verbinski'
  }
]

let users = [
  {
    username: 'Test1',
    password: 'Test1',
    favorites: {
      name: 'movie1'
    }
  }
]

let subgenres = [
  {
    name: 'Body horror',
    description: 'Closely related to gore, films in the body horror subgenre may feature scenes of the human body that has been severely altered.'
  }
]

let directors = [
  {
    name: 'David Bruckner',
    bio: 'David Bruckner (born c. 1977) is an American film director. With Jacob Gentry and Dan Bush, he co-wrote and co-directed The Signal (2007).',
    birthyear: '1977',
    deathyear: 'N/A'
  }
]

app.get('/',(req,res) => {
  res.send('Welcome to myHorror!');
});

//show list of all horror movie data
app.get('/horrorMovies',(req,res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//show one movie's data by name
app.get('/horrorMovies/:title', (req,res) => {
  res.json(horrorMovies.find( (horrorMovie) =>
    { return horrorMovie.title === req.params.title}));
});

//show a subgenre and description
app.get('/subgenres/:name', (req,res) => {
  res.json(subgenres.find( (subgenre) =>
    {return subgenre.name === req.params.name}));
});

//show a director's information by name
app.get('/directors/:name', (req,res) => {
  res.json(directors.find( (director) =>
    {return director.name === req.params.name}));
});

//Allow new user to register
app.post('/users', (req,res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if(user) {
        return res.status(400).send(req.body.Username + 'already exists');
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
          res.status(500).send('Erorr:' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error:' + error);
    });
});

//Get all users
app.get('/users', (req,res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Get a user by username
app.get('/users/:Username', (req,res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//Allow user to update info by username
app.put('/users/:username', (req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, //this line ensures the updated document is returned to the user
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Allow user to add movie to list of favorites
app.post('/users/:username/favorites/:title', (req,res) => {
  res.send('Successful POST request for adding new favorite movie');
});

//Allow user to remove movie from list of favorites
app.delete('/users/:username/favorites/:title', (req, res) => {
  res.send('Successful DELETE request for favorites item');
});

//Allow user to delete user account
app.delete('/users/:username', (req,res) => {
  res.send('Successful DELETE request for user account');
});

//middleware
app.use(express.static('public'));
app.use(morgan('common'));

//get documentation
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

app.listen(8080, () =>{
  console.log('This app is listening on port 8080.');
});
