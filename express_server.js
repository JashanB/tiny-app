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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

function isEmailRepeated(input) {
  for (let user of Object.keys(users)) {
    if (users[user].email === input) {
      console.log('true')
      return true;
    }
  }
  return false;
};

function generateRandomString () {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend }
  console.log(templateVars)
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
  let username = req.body.username;
  let templateVars = {username: username};
  console.log(templateVars);
  res.cookie('username', username);
  res.redirect(`/urls`);  
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  console.log('were here')
  res.redirect(`/urls`);  
});

app.post('/register', (req, res) => {
  let email = req.body.inputEmail;
  let password = req.body.inputPassword;
  let id = generateRandomString();
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (isEmailRepeated(email) === true) {
    res.sendStatus(400);
  } else {
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    console.log(users)
    res.cookie('user_id', users[id].id);
    res.redirect('/urls');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = { shortURL: variable, longURL: urlDatabase[variable], objectToSend};
  console.log(templateVars)
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  res.redirect(urlDatabase[variable]);
});

app.get('/urls', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = {urls: urlDatabase, user: objectToSend};
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  let idName = req.cookies.user_id;
  let objectToSend = users[idName];
  let templateVars = {user: objectToSend };
  res.render('urls_register', templateVars);
});





