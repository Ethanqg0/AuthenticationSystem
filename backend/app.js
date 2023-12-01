/*
  Authorization vs Authentication
  - Authentication: Verifying who the user is and logging them in
  - Authentication: Ensuring that the user who is requesting is the user who logged in, thus controlling access to resources

  This is critical for web applications that have multiple users and resources that should only be accessed by certain users.
    For example, an admin user should be able to access the admin dashboard, but a regular user should not.
    Another example, a user should only be able to delete their own profile page, but not the profile page of other users.

  JWT ensures that the token is valid and hasn't been changed/tampered with. If it has been changed, it would change the user data and the signature would be invalid.
  As soon as the data is changed, the signature immediately becomes invalid. 
  In other words, in order for JWT to work, all you need to do is provide the secret key,
  then, the signature is automatically generated and verified for you and will handle the rest.
*/

/*
  Add refreshing tokens because access tokens are short lived and should expire. They normally last for 15 minutes.
*/

require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
];

const validUsers = ["Kyle", "Jim"];

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts);
});

app.post('/login', (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
  res.json({ accessToken: accessToken })
}); 

// middleware function
function authenticateToken(req, res, next) {
  // Bearer Token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null ) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden, invalid token
    req.user = user;
    next();
  })
}

app.listen(3000);

