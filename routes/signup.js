//Written by kelseykm

const express = require('express');
const db = require('../database.js');
const { hash } = require('../cryptography.js');
const emailregex = require('../utils.js');

const router = express.Router();

function ensureFields(req, res, next) {
	if (!req.body.username || !req.body.email || !req.body.password || !req.body.password1)
	return res.render('signup', {
		my: {
			title: 'Scribe - Sign Up',
			message: 'All the fields must be supplied'
		},
		layout: 'auth'
	});

	next();
}

function validateFields(req, res, next) {
	if (req.body.password !== req.body.password1)
	return res.render('signup', {
		my: {
			title: 'Scribe - Sign Up',
			message: 'Passwords do not match'
		},
		layout: 'auth'
	});
	else if (req.body.password.length < 8)
	return res.render('signup', {
		my: {
			title: 'Scribe - Sign Up',
			message: 'Password must be at least 8 characters long'
		},
		layout: 'auth'
	});

	if (!emailregex.test(req.body.email))
	return res.render('signup', {
		my: {
			title: 'Scribe - Sign Up',
			message: 'Email is malformed'
		},
		layout: 'auth'
	});

	next();
}

router.get('/', (req, res) => {
	res.render('signup', {
		my: {
			title: 'Scribe - Sign Up',
		},
		layout: 'auth'
	});
});

router.post('/', ensureFields, validateFields, async (req, res) => {
	db.get('SELECT email FROM users WHERE email = ?', req.body.email, async (err, row) => {
			if (err) console.error(err);
			if (row) return res.render('signup', {
				my: {
					title: 'Scribe - Sign Up',
					message: 'User already exists'
				},
				layout: 'auth'
			});
			else {
				db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
					[req.body.username, req.body.email, await hash(req.body.password)], err => {
						if (err) {
							console.error(err);
							return res.status(500).json({message: 'Server error'});
						}
						db.get('SELECT * FROM users WHERE email = ?', req.body.email, (err, row) => {
							if (err) console.error(err);
							req.session.user = { username: row.username, id: row.id }
							res.redirect('/');
						});
				});
			}
	});
});

module.exports = router;
