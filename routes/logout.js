//Written by kelseykm

const express = require('express');

const router = express.Router();

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/');
	else next();
}

router.get('/', ensureLogin, (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
