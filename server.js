//Written by kelseykm

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const connectSqlite3 = require('connect-sqlite3');
const path = require('path');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const { aesGcmCipher, aesCfbCipher } = require('./cryptography.js');

const loginRoutes = require('./routes/login.js');
const logoutRoutes = require('./routes/logout.js');
const signupRoutes = require('./routes/signup.js');
const homeRoutes = require('./routes/home.js');
const topicsRoutes = require('./routes/topics.js');
const notesRoutes = require('./routes/notes.js');
const deleteAccountRoutes = require('./routes/deleteaccount.js');
const changeusernameRoutes = require('./routes/changeusername.js');
const changepasswordRoutes = require('./routes/changepassword.js');

dotenv.config();
const app = express();
const SQLiteStore = connectSqlite3(session);

const tempDir = path.join(process.env.PWD, 'db', 'tmp');

//View Engine
let hbs = exphbs.create({
	defaultLayout: 'main',
	extname: '.hbs',
	helpers: {
		cat: (str, obj) => str + obj.toString(),
		catcode: (str, obj) => str + encodeURIComponent(obj.toString()),
		readFile: obj => aesGcmCipher.decrypt(
			fs.readFileSync(
				path.join(process.env.PWD, 'db', 'text_notes', obj.toString())
			).toString('utf-8')
		),
	}
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer({ dest: tempDir }).single('voice-note-entry'));
app.use(session({
	store: new SQLiteStore({ db: 'sessionsDB.sqlite3', dir: path.join(process.env.PWD, 'db') }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
	genid: req => crypto.createHash('sha256').update(crypto.randomBytes(512)).digest('hex'),
  cookie: {
		secure: true,
		saveUninitialized: false,
		maxAge: 1000*3600*24 //1 day in ms
	}
}));
app.use(express.static(path.join(process.env.PWD, 'public')));

app.use('/signup', signupRoutes);
app.use('/login', loginRoutes);
app.use('/home', homeRoutes);
app.use('/topics', topicsRoutes);
app.use('/notes', notesRoutes);
app.use('/logout', logoutRoutes);
app.use('/deleteaccount', deleteAccountRoutes);
app.use('/changeusername', changeusernameRoutes);
app.use('/changepassword', changepasswordRoutes);

//Routes
app.get('/', (req, res) => {
	if (req.session.user) return res.redirect('/home');
	res.redirect('/login');
});

app.get('/db/voice_notes/:filename', (req, res) => {
	if (!req.session.user) return res.redirect('/');
	aesCfbCipher.decryptFile(
		path.join(process.env.PWD, `/db/voice_notes/${req.params.filename}`),
		path.join(tempDir, req.params.filename)
	);
	setTimeout(() => {
		res.sendFile(path.join(tempDir, req.params.filename));
		fs.rm(path.join(tempDir, req.params.filename));
	}, 1500);
});

//Start server
https.createServer({
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
    passphrase: process.env.KEY_PASSPHRASE
}, app)
.listen(process.env.PORT);
