const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
  const {name, email, password, password2} = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({
      msg: 'Please fill in all fields!'
    });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({
      msg: 'Passwords does not match!'
    });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({
      msg: 'Passwords should be at least 6 characters long!'
    });
  }

  if (errors.length > 0) {
    res.render('register', {
      ...req.body,
      errors: errors,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({
          msg: 'This e-mail is already registered!'
        });

        res.render('register', {
          ...req.body,
          errors: errors,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }

            newUser.password = hash;

            newUser.save()
              .then(user => {
                req.flash('success_msg', 'You are now registered and can log in!');
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out!');
  res.redirect('/users/login');
});

module.exports = router;