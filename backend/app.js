const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req,res) => {
  res.send('Hello, Express!');
})

app.get('/login',function(req,res) {
  res.sendFile('/Users/ethangutierrez/AuthenticationSystem/backend/index.html');
});