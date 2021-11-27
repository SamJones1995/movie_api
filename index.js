const express = require('express'),
      morgan = require('morgan');
const app = express();


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
    password: 'Test1'
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
  res.json(horrorMovies);
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
  let newUser = req.body;

  if(!newUser.name) {
    const message = 'Missing username';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

//Allow user to update username
app.put('/users/:username', (req,res) => {
  let user = users.find((user) => { return user.name === req.params.name});

  if (user) {
    user.username[req.params.username] = parseInt(req.params.grade);
    res.status(201).send('User ' + req.params.username + ' was updated. ');
  } else {
    res.status(404).send('User ' + req.params.name + ' was not found.');
  }
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
