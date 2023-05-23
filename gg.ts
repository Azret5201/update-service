import crypto from 'crypto';
import md5 from 'md5';

function QP01Hash(value: string, SALT: string | null = null): string {
  if (!SALT) {
    SALT = crypto.createHash('sha256').update(crypto.randomBytes(512)).digest('hex');
  }

  const HASHQP = crypto
    .createHash('sha256')
    .update(
      crypto
        .createHash('sha256')
        .update(
          SALT +
            crypto
              .createHash('sha256')
              .update(SALT + value)
              .digest('hex'),
        )
        .digest('hex') + SALT,
    )
    .digest('hex');

  return '$QP01$' + SALT + '$' + HASHQP;
}

function checkHash(hash: string, passwd: string, fallback = true): boolean {
  if (typeof hash !== 'string' || hash === '' || hash === undefined || hash === null) {
    return false;
  }

  let res = checkQP01Hash(hash, passwd);

  if (res === false && fallback === true) {
    if (hash === md5(passwd)) {
      res = true;
    }
  }

  return res;
}

function checkQP01Hash(hash: string, passwd: string): boolean {
  if (typeof hash !== 'string' || hash === '' || hash === undefined || hash === null) {
    return false;
  }

  if (hash.length === 135 && hash.substring(0, 6) === '$QP01$' && hash.charAt(70) === '$') {
    const SALT = hash.substring(6, 70);
    if (hash === QP01Hash(passwd, SALT)) {
      return true;
    }
  }

  return false;
}
