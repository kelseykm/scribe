//Written by kelseykm

const express = require('express');
const db = require('../database.js');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/');
	else next();
}

router.use(ensureLogin);

router.get('/', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', req.session.user.id, err => {
    if (err) console.error(err);

    db.run('DELETE FROM topics WHERE user_id = ?', req.session.user.id, err => {
      if (err) console.error(err);

			db.all('SELECT * FROM notes WHERE user_id = ?', req.session.user.id, (err, rows) => {
				if (err) console.error(err);
				for (let index = 0; index < rows.length; index++){
					let filepath;
					if (rows[index]['text_note_entry']) {
						filepath = path.join(process.env.PWD, 'db', 'text_notes', rows[index]['text_note_entry']);
					} else {
						filepath = path.join(process.env.PWD, 'db', 'voice_notes', rows[index]['voice_note_entry']);
					}
					fs.rm(filepath, err => {
						if (err) console.error(err);
					});
				}
				db.run('DELETE FROM notes WHERE user_id = ?', req.session.user.id, err => {
					if(err) console.error(err);
					res.redirect('/logout');
				});
			});
    });
  });
});

module.exports = router;
