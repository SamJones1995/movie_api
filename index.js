const express = require('express'),
      morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = ('uuid');
const app = express();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const cors = require('cors');


const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;


app.use(cors());

//mongoose.connect('mongodb://localhost:27017/myHorrorDB', {useNewUrlParser: true, useUnifiedTopology: true }); // local environment
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');



app.use(express.static('public'));
app.use(morgan('common'));

/**
 * homepage
 * @method GET
 * @returns string - "Welcome to myHorror"
 */

app.get('/',(req,res) => {
  res.send('Welcome to myHorror!');
});

/**
 * show list of all horror movie data
 * @method GET
 * @param {string} endpoint - endpoint to fetch movies "url/horrormovies" 
 * @returns authentication JWT
 */ 
app.get('/horrorMovies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then(function (movies)  {
      res.status(201).json(movies);
    })
    .catch(function (err)  {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * show one movie's data by name
 * @method GET 
 * @param {string} endpoint - endpoint to fetch single movie "url/horrormovies/:Title"
 * @returns authentication JWT
 */ 
app.get('/horrorMovies/:Title', passport.authenticate('jwt', { session: false }), (req,res) => {
  Movies.findOne( {Title: req.params.Title} )
    .then((movieTitle) => {
      res.status(201).json(movieTitle);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * show a subgenre and description
 * @method GET
 * @param {string} endpoint - endpoint to fetch genre "url/horrorMovies/Genres/:Name"
 * @returns authentication JWT
 */ 
app.get('/horrorMovies/Genres/:Name', passport.authenticate('jwt', { session: false }), (req,res) => {
  Movies.find({'Genre.Name': req.params.Name})
  .then((GenreName) => {
    res.status(201).json(GenreName)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }) ;
});

/**
 * show a director and description
 * @method GET
 * @param {string} endpoint - endpoint to fetch director "url/horrorMovies/Directors/:Name"
 * @returns authentication JWT
 */ 
app.get('/horrorMovies/Directors/:Name', passport.authenticate('jwt', { session: false }), (req,res) => {
  Movies.find({'Director.Name': req.params.Name})
    .then((Directors) => {
      res.status(201).json(Directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Register user
 * @method POST
 * @param {string} endpoint - endpoint to add user. "url/users"
 * @param {string} Username - choosen by user
 * @param {string} Password - user's password
 * @param {string} email - user's e-mail adress
 * @param {string} Birthdate - user's birthday
 * @returns {object} - new user
 * @requires auth no authentication - public
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Password', 'Password must be 8 characters long').isLength({min: 8}),
    check('email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username }) //search to see if User already exists
    .then((user) => {
      if(user) { //if use is found send below response
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            email: req.body.email,
            Birthdate: req.body.Birthdate
          })
          .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.log(error);
            res.status(500).send('Erorr:' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error:' + error);
    });
});

/**
 * Get all users
 * @method GET
 * @param {string} endpoint - endpoint to fetch users "url/users" 
 * @requires authentication JWT
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req,res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

/**
 * Get a user by username
 * @method GET
 * @param {string} endpoint - endpoint to fetch single user "url/users/:Username" 
 * @requires authentication JWT
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req,res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

/**
  * Update user by username
  * @method PUT
  * @param {string} endpoint - endpoint to add user. "url/users/:Usename"
  * @param {string} Username - required
  * @param {string} Password - user's new password
  * @param {string} email - user's new e-mail adress
  * @param {string} Birthdate - user's new birthday
  * @returns {string} - returns success/error message
  * @requires authentication JWT
  */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
[
  check('Username', 'Username is required, minimum of 5 characters').isLength({min: 5}).optional(),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric().optional(),
  check('Password', 'Password is required').not().isEmpty().optional(),
  check('Password', 'Password must be 8 characters long').isLength({min: 8}).optional(),
  check('email', 'Email does not appear to be valid').isEmail().optional()
],
(req,res) => {
  // check validation result
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
  return res.status(422).json({errors: validationErrors.array()});
  }
    // hash the updated password
  const hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
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

/**
 * Add movie to favorites
 * @method POST
 * @param {string} endpoint - endpoint to add movies to favorites "url/users/:Username/movies/:MovieID"
 * @param {string} MovieID, Username - both are required
 * @returns {string} - returns success/error message
 * @requires authentication JWT
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req,res) => {
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

/**
 * Delete movie from favorites
 * @method DELETE
 * @param {string} endpoint - endpoint to remove movies from favorites "url/users/:Username/movies/:MovieID"
 * @param {string} Title Username - both are required
 * @returns {string} - returns success/error message
 * @requires authentication JWT
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * Delete user profile
 * @method DELETE
 * @param {string} endpoint - endpoint to delete user data "url/users/:Username"
 * @param {string} Title Username - both are required
 * @returns {string} - returns success/error message
 * @requires authentication JWT
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req,res) => {
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



/**
 * @method GET
 * @returns - documentation.html
 */
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
