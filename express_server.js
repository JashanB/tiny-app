const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helper');
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "ex1" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "ex2" }
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
      return true;
    }
  }
  return false;
}

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function urlsForUser(id) {
  let object = {};
  for (let key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      object[key] = {longURL: urlDatabase[key].longURL, userID: id};
    }
  }
  return object;
}

// const getUserByEmail = function(email, database) {
//   let user;
//   for (let key of Object.keys(database)) {
//     if (database[key].email === email) {
//       user = database[key];
//     }
//   }
//   return user;
// };

app.listen(PORT, () => {
  console.log(`Example app is listening on ${PORT}!`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.session.user_id;
  if (idName === urlDatabase[variable].userID) {
    delete urlDatabase[variable];
    res.redirect('/urls');
  } else if (idName === undefined) {
    res.status(400).send('400 user not logged in');
  } else if (urlDatabase[variable].userID !== idName) {
    res.status(400).send('user does not have access to this url');
  }
});

app.post('/urls', (req, res) => {
  let random = generateRandomString();
  let idName = req.session.user_id;
  let long = req.body['longURL'];
  if (idName === undefined) {
    res.status(400).send('400 user not logged in');
  } else {
    urlDatabase[random] = { longURL: long, userID: idName };
    res.redirect(`/urls/${random}`);
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  let variable = req.params.shortURL;
  let long = req.body['longURL'];
  let idName = req.session.user_id;
  if (idName === urlDatabase[variable].userID) {
    urlDatabase[variable] = { longURL: long, userID: idName };
    res.redirect(`/urls`);
  } else if (idName === undefined) {
    res.status(400).send('400 user not logged in');
  } else if (urlDatabase[variable].userID !== idName) {
    res.status(400).send('400 User does not have access to this URL');
  }
});

app.post('/login', (req, res) => {
  let eEmail = req.body.loginEmail;
  let pPassword = req.body.loginPassword;
  let hashed = 'b';
  if (isEmailRepeated(eEmail) === false) {
    return res.status(403).send('403 email not registered');
  }
  let user = getUserByEmail(eEmail, users);
  let verifiedEmail = user.email;
  if (verifiedEmail !== undefined) {
    hashed = user.password;
  }
  if (bcrypt.compareSync(pPassword, hashed) === false) {
    res.status(403).send('403 password does not match');
  } else {
    req.session.user_id = user.id;
    res.redirect(`/urls`);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post('/register', (req, res) => {
  let email = req.body.registerEmail;
  let password = req.body.registerPassword;
  let hashed = bcrypt.hashSync(password, 10);
  let id = generateRandomString();
  if (email === '' || password === '') {
    res.status(400).send('400 email or password fields empty');
  } else if (isEmailRepeated(email) === true) {
    res.status(400).send('400 email already exists');
  } else {
    users[id] = {
      id: id,
      email: email,
      password: hashed
    };
    req.session.user_id = users[id].id;
    res.redirect('/urls');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  if (urlDatabase[variable] === undefined) {
    res.status(400).send('400 URL for given ID does not exist');
  } else if (urlDatabase[variable].longURL === '') {
    res.status(400).send('400 URL was not inputed');
  } else {
    res.redirect(urlDatabase[variable].longURL);
  }
});

app.get('/urls/new', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let variable = req.params.shortURL;
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  if (idName === undefined) {
    res.status(400).send('400 User not logged in');
  } else if (idName !== urlDatabase[variable].userID) {
    res.status(400).send('400 URL for given ID does not exist');
  } else {
    let templateVars = { shortURL: variable, longURL: urlDatabase[variable].longURL, user: objectToSend };
    res.render('urls_show', templateVars);
  }
});

app.get('/urls', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let objectWithURLs = urlsForUser(idName);
  let templateVars = { urls: objectWithURLs, user: objectToSend };
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.render('urls_index', templateVars);
  }
});

app.get('/register', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  if (idName === undefined) {
    res.render('urls_register', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let idName = req.session.user_id;
  let objectToSend = users[idName];
  let templateVars = { user: objectToSend };
  if (idName === undefined) {
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/', (req, res) => {
  let idName = req.session.user_id;
  if (idName === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});




