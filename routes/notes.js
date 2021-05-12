//Written by kelseykm

const express = require('express');
const db = require('../database.js');
const path = require('path');
const fs = require('fs');

const router = express.Router();

function ensureLogin(req, res, next) {
	if (!req.session.user) res.redirect('/');
	else next();
}

router.use(ensureLogin);

router.get("/", (req, res) => {
	res.send("received");
});

router.post('/deletenote', (req, res) => {
  db.get('SELECT * FROM notes WHERE user_id = ? AND topic_name = ? AND entry_name = ?',
  [ req.session.user.id, req.body.topicName, req.body.entryName ], (err, row) => {
    if (err) console.error(err);
    if (!row) return res.status(400).json({message: "Note does not exist"});

    db.run('DELETE FROM notes WHERE user_id = ? AND topic_name = ? AND entry_name = ?',
    [ req.session.user.id, req.body.topicName, req.body.entryName ], err => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: "Note deletion failed"});
      } else {
				let filepath;
				if (row['text_note_entry']) {
					filepath = path.join(process.env.PWD, 'db', 'text_notes', row['text_note_entry']);
				} else {
					filepath = path.join(process.env.PWD, 'db', 'voice_notes', row['voice_note_entry']);
				}
      	fs.rm(filepath, err => {
					if (err) console.error(err);
				});
      }
    });
  });
});

module.exports = router;
