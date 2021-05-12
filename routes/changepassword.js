//Written by kelseykm

const express = require('express');
const db = require('../database.js');
const { hash, verify } = require('../cryptography.js');

const router = express.Router();

function validateFields(req, res, next) {
  db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time',
  req.session.user.id, (err, topicRows) => {
		if (err) console.error(err);

    if (!req.body["old-password"] || !req.body.password || !req.body.password1)
			res.render('home', {
				my: {
					message: "All the fields must be supplied",
					showBread: true,
					title: 'Scribe - Home',
					topics: topicRows,
					username: req.session.user.username,
				},
			});
    else if (req.body.password !== req.body.password1)
      res.render('home', {
        my: {
          message: "Passwords do not match",
          showBread: true,
          title: 'Scribe - Home',
          topics: topicRows,
          username: req.session.user.username,
        },
      });
    else if (req.body.password.length < 8)
      res.render('home', {
        my: {
          message: "Password must be at least 8 characters long",
          showBread: true,
          title: 'Scribe - Home',
          topics: topicRows,
          username: req.session.user.username,
        },
      });
    else db.get('SELECT * FROM users WHERE id = ?', req.session.user.id, async (err, row) => {
  		if (!(await verify(req.body["old-password"], row.password)))
      res.render('home', {
        my: {
          message: "Wrong old password",
          showBread: true,
          title: 'Scribe - Home',
          topics: topicRows,
          username: req.session.user.username,
        },
      });
      else next();
    });
  });
}

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/login');
	else next();
}

router.use(ensureLogin);

router.post('/', validateFields, async (req, res) => {
  db.run('UPDATE users SET password = ? WHERE id = ?',
  [ await hash(req.body.password), req.session.user.id ], err => {
    if (err) console.error(err);
    db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time',
    req.session.user.id, (err, topicRows) => {
  		if (err) console.error(err);
      res.render('home', {
        my: {
          message: "Password change successful",
          showBread: true,
          title: 'Scribe - Home',
          topics: topicRows,
          username: req.session.user.username,
        },
      });
    });
  });
});

module.exports = router;
