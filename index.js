const express = require('express');
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

//get documentation 
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.listen(8080, () =>{
  console.log('This app is listening on port 8080.');
});
