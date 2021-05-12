//Written by kelseykm

const express = require('express');
const crypto = require('crypto');
const db = require('../database.js');
const fs = require('fs');
const path = require('path');
const { aesGcmCipher, aesCfbCipher } = require('../cryptography.js');

const router = express.Router();
const textNotesDir = path.join(process.env.PWD, 'db', 'text_notes');

function saveText(entry) {
	let filename = crypto.randomUUID();
	let pathToFile = path.join(textNotesDir, filename);
	fs.writeFile(pathToFile, aesGcmCipher.encrypt(entry), err => {
		if (err) console.error(err);
	});
	return filename;
}

function ensureLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({
    message: "Unauthorized. Ensure you're logged in"
  });
	next();
}

function ensureTopicName(req, res, next) {
  if (!req.body.topicName) return res.status(400).json({
    message: "topicName must be included"
  });
  next();
}

function ensureFields(req, res, next) {
	if (!req.body["topic-name"] || !req.body["entry-name"])
	return res.status(400).json({message: "All the fields must be supplied"});

	if (!req.body["text-note-entry"] && !req.file) {
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
						message: "Cannot save empty note",
						showBread: true,
						title: 'Scribe - ' + req.params.topicName,
						topics: topicRows,
						topicName: req.params.topicName,
						username: req.session.user.username,
					},
				});
			});
		});
	} else next();
}

router.use(ensureLogin);
router.use(['/savetopic', '/deletetopic'], ensureTopicName);

router.get('/topic/:topicName', (req, res) => {
	db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time', req.session.user.id, (err, topicRows) => {
		if (err) console.error(err);

		db.get('SELECT topic_name FROM topics WHERE user_id = ? AND topic_name = ?',
	  [ req.session.user.id, req.params.topicName ], (err, row) => {
	    if (err) console.error(err);
	    if (!row) return res.render('home', {
				my: {
					message: `Topic not found: ${req.params.topicName}`,
					showBread: true,
					title: 'Scribe - Home',
					topics: topicRows,
					username: req.session.user.username,
				},
			});

			db.all('SELECT * FROM notes WHERE user_id = ? AND topic_name = ? ORDER BY creation_time',
			[req.session.user.id, req.params.topicName], (err, entryRows) => {
				if (err) {
					console.error(err);
					return res.status(500).json({message: "Server Error"})
				}

				res.render('home', {
					my: {
						entries: entryRows,
						showBread: true,
						title: 'Scribe - ' + req.params.topicName,
						topics: topicRows,
						topicName: req.params.topicName,
						username: req.session.user.username,
					},
				});
			});
		});
	});
});

router.post('/topic/:topicName', ensureFields, (req, res) => {
	let textNoteEntry = req.body["text-note-entry"] ? saveText(req.body["text-note-entry"]) : null;
	let voiceNoteEntry = req.file ? req.file["filename"] : null;

	if (req.file) {
		aesCfbCipher.encryptFile(
			`/tmp/${req.file["filename"]}`,
			path.join(process.env.PWD, `/db/voice_notes/${req.file["filename"]}`)
		)
	}

	db.get('SELECT entry_name FROM notes WHERE user_id = ? AND topic_name = ? AND entry_name = ?',
	[req.session.user.id, req.body["topic-name"], req.body["entry-name"]], (err, row) => {
		if (err) console.error(err);
		if (row) {
			db.all('SELECT topic_name FROM topics WHERE user_id = ? ORDER BY creation_time', req.session.user.id, (err, topicRows) => {
				if (err) console.error(err);

				db.all('SELECT * FROM notes WHERE user_id = ? AND topic_name = ? ORDER BY creation_time',
				[req.session.user.id, req.params.topicName], (err, entryRows) => {
					if (err) {
						console.error(err);
					}

					res.render('home', {
						my: {
							entries: entryRows,
							message: "A note with that entry name already exists",
							showBread: true,
							title: 'Scribe - ' + req.params.topicName,
							topics: topicRows,
							topicName: req.params.topicName,
							username: req.session.user.username,
						},
					});
				});
			});
		}	else {
			db.run('INSERT INTO notes (user_id, topic_name, entry_name, text_note_entry, voice_note_entry) VALUES (?, ?, ?, ?, ?)',
			[req.session.user.id, req.body["topic-name"], req.body["entry-name"], textNoteEntry, voiceNoteEntry],
			err => {
				if (err) {
					console.error(err);
					res.status(500).json({message: "Server error. Note not created"});
				} else res.redirect(req.originalUrl);
			});
		}
	});
});

router.post('/savetopic', (req, res) => {
  db.get('SELECT topic_name FROM topics WHERE user_id = ? AND topic_name = ?',
  [ req.session.user.id, req.body.topicName ], (err, row) => {
    if (err) console.error(err);
    if (row) return res.status(400).json({message: "Topic exists"});

    db.run('INSERT INTO topics (user_id, topic_name) VALUES (?, ?)',
    [ req.session.user.id, req.body.topicName ], err => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: "Topic creation failed"});
      }
      res.status(201).json({message: "Topic created"});
    });
  });
});

router.post('/deletetopic', (req, res) => {
  db.get('SELECT topic_name FROM topics WHERE user_id = ? AND topic_name = ?',
  [ req.session.user.id, req.body.topicName ], (err, row) => {
    if (err) console.error(err);
    if (!row) return res.status(400).json({message: "Topic does not exist"});

    db.run('DELETE FROM topics WHERE user_id = ? AND topic_name = ?',
    [ req.session.user.id, req.body.topicName ], err => {
      if (err) {
        console.error(err);
        return res.status(500).json({message: "Topic deletion failed"});
      }

			db.all('SELECT * FROM notes WHERE user_id = ? AND topic_name = ?',
			[ req.session.user.id, req.body.topicName ], (err, rows) => {
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
				db.run('DELETE FROM notes WHERE user_id = ? AND topic_name = ?',
				[ req.session.user.id, req.body.topicName ], err => {
					if(err) console.error(err);
					res.status(200).json({message: "Topic deleted"});
				});
			});
    });
  });
});

module.exports = router;
