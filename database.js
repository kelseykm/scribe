//Written by kelseykm

const sqlite3 = require('sqlite3');
const path = require('path');

const sqlite3V = sqlite3.verbose()

const DATABASE = path.join(process.env.PWD, 'db', 'scribeDB.sqlite3');

const db = new sqlite3V.Database(DATABASE, err => {
  if (err) console.error(err);
});

db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
  let tableCount = 0;
  for (let index = 0; index < tables.length; index++){
    if (
      tables[index].name === 'users' ||
      tables[index].name === 'notes' ||
      tables[index].name === 'topics'
    ) tableCount++;
    if (tableCount > 2) return;
  }
  createTables();
});

function createTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER,
      username	TINYTEXT NOT NULL,
      email	TINYTEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      creation_time DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
      PRIMARY KEY(id AUTOINCREMENT))`, err => {
        if (err) console.error(err);
      });

    db.run(`CREATE TABLE IF NOT EXISTS topics (
      user_id INTEGER NOT NULL,
      topic_name TINYTEXT NOT NULL,
      creation_time DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
      CONSTRAINT unique_topics UNIQUE(user_id, topic_name),
      FOREIGN KEY(user_id) REFERENCES user(id))`, err => {
        if (err) console.error(err);
      });

    db.run(`CREATE TABLE IF NOT EXISTS notes (
      user_id INTEGER NOT NULL,
      topic_name	TINYTEXT NOT NULL,
      entry_name	TEXT NOT NULL,
      text_note_entry	MEDIUMTEXT,
      voice_note_entry	TEXT UNIQUE,
      creation_time DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
      CONSTRAINT unique_topics UNIQUE(user_id, topic_name, entry_name),
      FOREIGN KEY(user_id) REFERENCES user(id),
      FOREIGN KEY(topic_name) REFERENCES topics(topic_name))`, err => {
        if (err) console.error(err);
      });
    });
}

module.exports = db;
