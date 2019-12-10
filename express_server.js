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

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let variable = req.params.shortURL;
  delete urlDatabase[variable];
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => { 
  let random = generateRandomString();
  urlDatabase[random] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls/${random}`);  
});

app.post('/urls/:shortURL/update', (req, res) => { 
  let random = generateRandomString();
  urlDatabase[random] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls`);  
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let templateVars = { shortURL: variable, longURL: urlDatabase[variable]};
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  res.redirect(urlDatabase[variable]);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});

function generateRandomString () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};




