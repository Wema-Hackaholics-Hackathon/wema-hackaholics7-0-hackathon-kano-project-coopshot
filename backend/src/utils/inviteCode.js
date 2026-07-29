const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

function generateInviteCode(length = 7) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

module.exports = generateInviteCode;
