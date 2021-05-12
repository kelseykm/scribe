//Written by kelseykm

const express = require('express');
const db = require('../database.js');
const { verify } = require('../cryptography.js');

const router = express.Router();

function ensureFields(req, res, next) {
	if (!req.body.password || !req.body.email)
	return res.render('login', {
		my: {
			login: true,
			title: 'Scribe - Log In',
			message: "Email and password must be supplied"
		},
		layout: 'auth'
	});
	next();
}

router.get('/', (req, res) => {
	res.render('login', {
		my: {
			login: true,
			title: 'Scribe - Log In'
		},
		layout: 'auth'
	});
});

router.post('/', ensureFields, (req, res) => {
	db.get('SELECT * FROM users WHERE email = ?', req.body.email, async (err, row) => {
		if (!row)	return res.render('login', {
			my: {
				login: true,
				title: 'Scribe - Log In',
				message: "User does not exist"
			},
			layout: 'auth'
		});

		if (await verify(req.body.password, row.password)) {
			req.session.user = { username: row.username, id: row.id };
			return res.redirect('/');
		}

		res.render('login', {
			my: {
				login: true,
				title: 'Scribe - Log In',
				message: "Wrong password"
			},
			layout: 'auth'
		});
	});
});

module.exports = router;
