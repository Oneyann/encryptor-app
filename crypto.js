const crypto = require('crypto');

const ITERATIONS = 100_000;
const KEY_LEN = 32;   // AES-256
const SALT_LEN = 16;
const IV_LEN = 16;
const ALGO = 'aes-256-cbc';

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, 'sha256');
}

function encryptBuffer(buffer, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return Buffer.concat([salt, iv, encrypted]);
}

function decryptBuffer(data, password) {
  if (data.length < SALT_LEN + IV_LEN + 16) {
    throw new Error('Файл повреждён или имеет неверный формат');
  }
  const salt = data.subarray(0, SALT_LEN);
  const iv = data.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const ciphertext = data.subarray(SALT_LEN + IV_LEN);

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function encryptText(text, password) {
  return encryptBuffer(Buffer.from(text, 'utf8'), password).toString('base64');
}

function decryptText(b64, password) {
  const data = Buffer.from(b64.trim(), 'base64');
  return decryptBuffer(data, password).toString('utf8');
}

module.exports = {
  encryptBuffer,
  decryptBuffer,
  encryptText,
  decryptText,
  SALT_LEN,
  IV_LEN
};