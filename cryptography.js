const crypto = require('crypto');
const { promisify } = require('util');
const fs = require('fs');

const sc = promisify(crypto.scrypt);

async function hash(password) {
  const KEY_LENGTH = 32;
  const salt = crypto.randomBytes(KEY_LENGTH);
  const derivedKey = await sc(password, salt, KEY_LENGTH);
  return [ salt.toString('hex'), derivedKey.toString('hex') ].join(':');
}

async function verify(password, hash) {
  const KEY_LENGTH = 32;
  const [saltHex, keyHex] = hash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const key = Buffer.from(keyHex, 'hex');
  const derivedKey = await sc(password, salt, KEY_LENGTH);
  return crypto.timingSafeEqual(derivedKey, key);
}

const aesGcmCipher = {
  ALGO: 'aes-256-gcm',
  KEY_LENGTH: 32,
  NONCE_LENGTH: 12,
  TAG_LENGTH: 16,
  encrypt: function (clearMesg) {
    let key = crypto.randomBytes(this.KEY_LENGTH);
    let nonce = crypto.randomBytes(this.NONCE_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGO, key, nonce);

    let encMesg = cipher.update(clearMesg, 'utf8', 'hex');
    encMesg += cipher.final('hex');
    let tag = cipher.getAuthTag();

    return key.toString('hex') + nonce.toString('hex') + tag.toString('hex') + encMesg;
  },
  decrypt: function (encMass) {
    let key = Buffer.from(encMass.substr(0, this.KEY_LENGTH * 2), 'hex');
    let nonce = Buffer.from(encMass.substr(this.KEY_LENGTH * 2, this.NONCE_LENGTH * 2), 'hex');
    let tag = Buffer.from(encMass.substr(this.KEY_LENGTH * 2 + this.NONCE_LENGTH * 2, this.TAG_LENGTH * 2), 'hex');
    let encMesg = encMass.substr(this.KEY_LENGTH * 2 + this.NONCE_LENGTH * 2 + this.TAG_LENGTH * 2)

    const decipher = crypto.createDecipheriv(this.ALGO, key, nonce);

    decipher.setAuthTag(tag);
    let decMesg = decipher.update(encMesg, 'hex', 'utf8');
    decMesg += decipher.final('utf8');
    return decMesg;
  }
}

const aesCfbCipher = {
  ALGO: 'aes-256-cfb',
  IV_LENGTH: 16,
  KEY_LENGTH: 32,
  encryptFile: function (input, output, callback) {
    const inStream = fs.createReadStream(input);

    fs.access(output, err => {
      if (!err) fs.rmSync(output)
    });

    const outStream = fs.createWriteStream(output, { flags: 'a' });

    let key = crypto.randomBytes(this.KEY_LENGTH);
    let iv = crypto.randomBytes(this.IV_LENGTH);

    outStream.write(key);
    outStream.write(iv);
    const encCipher = crypto.createCipheriv(this.ALGO, key, iv);

    inStream.pipe(encCipher).pipe(outStream);
    outStream.on('finish', () => {
      typeof callback === 'function' && callback();
    });
  },
  decryptFile: function (input, output, callback) {
    const inStream = fs.createReadStream(input, { start: this.KEY_LENGTH + this.IV_LENGTH });
    const outStream = fs.createWriteStream(output);

    fs.open(input, 'r', (err, fd) => {
      if (err) throw err;
      fs.read(fd, Buffer.alloc(this.KEY_LENGTH + this.IV_LENGTH), 0, this.KEY_LENGTH + this.IV_LENGTH, 0, (err, bytesRead, buffer) => {
        let key = buffer.slice(0, this.KEY_LENGTH);
        let iv = buffer.slice(this.KEY_LENGTH, this.KEY_LENGTH + this.IV_LENGTH);

        fs.close(fd, err => {
          if (err) throw err;
        });

        const decCipher = crypto.createDecipheriv(this.ALGO, key, iv);
        inStream.pipe(decCipher).pipe(outStream);

        outStream.on('finish', () => {
          typeof callback === 'function' && callback();
        });
      });
    });
  },
}

module.exports = { hash, verify, aesGcmCipher, aesCfbCipher };
