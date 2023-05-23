import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import md5 from 'md5';

export function generateToken(userId: number): string {
  const token = jwt.sign({ userId }, 'secret', { expiresIn: '1h' });
  return token;
}

export function QP01Hash(value: string, SALT: string | null = null): string {
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

export function checkHash(hash: string, passwd: string, fallback = true): boolean {
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

export function checkQP01Hash(hash: string, passwd: string): boolean {
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

console.log(
  checkHash(
    '$QP01$426309972bfd184c36fdb8286e1094b1a711474fb72227c2df5de9d6e8ddd140$1b15179dc552b7a5f58aed977ce31656c890698c24e35904ce4d3214aa94e577',
    '0123456789',
  ),
);
