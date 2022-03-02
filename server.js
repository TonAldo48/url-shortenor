require('dotenv').config();
const express = require('express');
const cors = require('cors');
var dns = require('dns');
const URL = require('url').URL;

const app = express();

var bodyParser = require('body-parser');

mongoose = require('mongoose');
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/', bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const { Schema } = mongoose;

const linksSchema = new Schema({
  originalURL: String,
  shortenedURL: Number,
})

const Link = mongoose.model('Links', linksSchema);

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res, next) => {
  const originalURL = req.body.url;
  console.log(`user sent this url ${req.body.url}`)

  if (originalURL.startsWith('https://') || originalURL.startsWith('http://')) {
    console.log('starts with')
    next();
  } else {
    res.json({error: 'invalid url'})
    console.log('does not start with')
  }
  
}, (req, res) => {
  var shortenedURL = Math.floor(Math.random() * 100000);

  var newLink = new Link({
    originalURL: req.body.url,
    shortenedURL: shortenedURL,
  })

  newLink.save((err, data) => {
    if (err) { console.log(err) }
    res.json({
      original_url: data.originalURL,
      short_url: data.shortenedURL,
    })
  })
})

// 54613

app.get('/api/shorturl/:urlnum', (req, res) => {
  var url = parseInt(req.params.urlnum);
  console.log('got url')

  Link.findOne({ shortenedURL: url }, (err, found) => {
    if (err) return console.log(err);
    console.log(found);
    res.redirect(found.originalURL);
  })

})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
