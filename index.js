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
