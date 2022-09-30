const express = require('express');
const usersRouter = express.Router();

const { createUser } = require('../db')

const jwt = require('jsonwebtoken');



const { getAllUsers, getUserByUserName } = require('../db');

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    })
})

usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({
      name: "MissingCridentialsError",
      message: "Please supply both a username and password"
    })
  }

  try {
    const user = await getUserByUserName(username);
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
    if (user && user.password == password) {
      res.send({
        message: "you're logged in!",
        token: token
      })
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or Password is incorrect"
      })
    }

  } catch (err) {
    console.error(err);
    next(err)
  }

})

usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUserName(username);

    if (_user) {
      next({
        name: 'User Exists Error',
        message: 'A user by that name already exists'
      })
    }

    const user = await createUser({ username, password, name, location});

    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    })

    res.send({
      message: "thank you for signing up",
      token
    });
  } catch ({name, message}) {
    next({name, message})
  }
})

module.exports = usersRouter;