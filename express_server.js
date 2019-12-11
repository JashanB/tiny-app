const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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
  let cookie = req.cookies.userName;
  //console.log(user)
  let templateVars = {username: cookie};
  console.log(cookie);
  res.render('urls_new', templateVars);
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
  let variable = req.params.shortURL;
  urlDatabase[variable] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls`);  
});

app.post('/login', (req, res) => {
  let userName = req.body.username;
  console.log(userName);
  let templateVars = {username: userName};
  console.log(templateVars);
  res.cookie('username', userName);
  res.redirect(`/urls`);  
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  console.log('were here')
  res.redirect(`/urls`);  
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let cookie = req.cookies.username;
  let templateVars = { shortURL: variable, longURL: urlDatabase[variable], username: cookie};
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  res.redirect(urlDatabase[variable]);
});

app.get('/urls', (req, res) => {
  let cookie = req.cookies.username;
  let templateVars = {urls: urlDatabase, username: cookie};
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




