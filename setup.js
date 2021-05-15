const fs = require('fs');
const path = require('path');

const requiredDirs = [ 'certs', 'db', 'db/voice_notes', 'db/text_notes', 'db/tmp' ];

for (let dir of requiredDirs) {
  let dirpath = path.join(process.env.PWD, dir);
  fs.access(dirpath, accessErr => {
    if (accessErr) {
      fs.mkdir(dirpath, mkdirErr => {
        if (mkdirErr) console.error(mkdirErr);
      });
    }
  });
}
