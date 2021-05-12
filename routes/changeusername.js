//Written by kelseykm

const express = require('express');
const db = require('../database.js');

const router = express.Router();

function ensureFields(req, res, next) {
	if (!req.body["new-username"]) {
    db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time', req.session.user.id, (err, topicRows) => {
			if (err) console.error(err);

			db.all('SELECT * FROM notes WHERE user_id = ? AND topic_name = ? ORDER BY creation_time',
			[req.session.user.id, req.params.topicName], (err, entryRows) => {
				if (err) {
					console.error(err);
					return res.status(500).json({message: "Server Error"})
				}

				res.render('home', {
					my: {
						entries: entryRows,
						message: "New username not supplied",
						showBread: true,
						title: 'Scribe - Home',
						topics: topicRows,
						username: req.session.user.username,
					},
				});
			});
		});
  }
	else next();
}

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/login');
	else next();
}

router.use(ensureLogin);

router.post('/', ensureFields, async (req, res) => {
  db.run('UPDATE users SET username = ? WHERE id = ?',
  [ req.body["new-username"], req.session.user.id ], err => {
    if (err) console.error(err);
    req.session.user.username = req.body["new-username"];
    db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time', req.session.user.id, (err, topicRows) => {
  		if (err) console.error(err);
      res.render('home', {
        my: {
          message: "Username change successful",
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
