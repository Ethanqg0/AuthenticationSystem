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
  },
  {
    username: 'Kyle',
    title: 'Post 3'
  },
  {
    username: 'Jim',
    title: 'Post 4'
  }
];

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts);
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Received token:', token);

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log('Error during verification:', err);
    console.log('User:', user);

    if (err) {
      const result = verifyToken(token);
      console.log('Verification result:', result);

      if (result.status === 401) {
        return res.sendStatus(401);
      } else if (result.status === 403) {
        return res.sendStatus(403);
      }

      req.user = result.user;

      // Update the response with the new access token
      res.setHeader('Authorization', 'Bearer ' + result.accessToken);
    } else {
      req.user = user;
    }
    next();
  });
}


function verifyToken(refreshToken) {
  console.log('Verifying refresh token:', refreshToken);

  if (refreshToken == null) return { status: 401 };

  let user;
  try {
    user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log('Decoded user from refresh token:', user);
  } catch (err) {
    console.log('Error during refresh token verification:', err);
    return { status: 403 };
  }

  const accessToken = generateAccessToken({ name: user.name });
  console.log('Generated new access token:', accessToken);

  return { status: 200, user: { name: user.name }, accessToken: accessToken };
}


function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}



app.listen(3000);