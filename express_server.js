const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app is listening on ${PORT}!`)
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let templateVars = { shortURL: variable, longURL: urlDatabase['longURL']};
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  let random = generateRandomString();
  urlDatabase['shortURL'] = random;
  urlDatabase['longURL'] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls/${random}`);  
});

function generateRandomString () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

app.get('/u/:shortUrl', (req, res) => {
  res.redirect(urlDatabase['longURL']);
});
