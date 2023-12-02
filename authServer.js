/*
  Why do we need a refresh token?

  Our current tokens have no expiration date, so they are valid forever.
  This is a security risk because if someone gets a hold of your token, they can use it forever.

  1) invalidate users tokens that shouldnt have access
  2) move your authentication separate to your main server
*/
require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

// normally want to store refreshTokens in a database or a cache like redis
// can you cache multiple tokens? yes, in a list
// will be emptied out when the server restarts
let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401) // 
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403) // if the refresh token is not in the list of refresh tokens, then it is not valid
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User

  const username = req.body.username
  const user = { name: username }

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

app.listen(4000)