const express = require('express'),
      morgan = require('morgan');
const app = express();


let topHorror = [
  {
    title:  'The Ritual',
    director: 'David Bruckner'
  }
]

app.get('/',(req,res) => {
  res.send('Welcome to myHorror!');
});

app.get('/movies',(req,res) => {
  res.json(topHorror);
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
