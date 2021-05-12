//Written by kelseykm

const express = require('express');
const db = require('../database.js');

const router = express.Router();

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/login');
	else next();
}

router.use(ensureLogin);

router.get('/', (req, res) => {
	db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time', req.session.user.id, (err, rows) => {
		res.render('home', {
			my: {
				showBread: true,
				title: 'Scribe - Home',
				topics: rows,
				username: req.session.user.username,
			},
		});
	});
});

module.exports = router;
