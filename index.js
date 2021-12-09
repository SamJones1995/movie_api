const express = require('express'),
      morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = ('uuid');
const app = express();

const mongoose = require('mongoose');



const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myHorrorDB', {useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');



app.use(express.static('public'));
app.use(morgan('common'));



app.get('/',(req,res) => {
  res.send('Welcome to myHorror!');
});

//show list of all horror movie data
app.get('/horrorMovies', passport.authenticate('jwt', { session: false }), (req,res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//show one movie's data by name
app.get('/horrorMovies/:Title', (req,res) => {
  Movies.findOne( {Title: req.params.Title} )
    .then((movieTitle) => {
      res.status(201).json(movieTitle);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//show a subgenre and description
app.get('/horrorMovies/Genres/:Name', (req,res) => {
  Movies.find({'Genre.Name': req.params.Name})
  .then((GenreName) => {
    res.status(201).json(GenreName)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }) ;
});

//show a director's movies by name
app.get('/horrorMovies/Directors/:Name', (req,res) => {
  Movies.find({'Director.Name': req.params.Name})
    .then((Directors) => {
      res.status(201).json(Directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
            email: req.body.email,
            Birthdate: req.body.Birthdate
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
app.put('/users/:Username', (req,res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      email: req.body.email,
      Birthdate: req.body.Birthdate
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
app.post('/users/:Username/movies/:MovieID', (req,res) => {
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

//Allow user to remove movie from list of favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // ensures that the updated document is returned
  (err, removeFavorite) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(removeFavorite);
    }
  });
});

//Allow user to delete user account
app.delete('/users/:Username', (req,res) => {
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
