const pemMatchRe = /-----BEGIN ([\w ]+)-----([A-Za-z0-9+/=\s]+)-----END ([\w ]+)-----/;
const base64TestRe = /^[A-Za-z0-9+/]+={0,2}$/;

function* Iterator(s) {
  if (typeof s !== 'string') throw new Error('invalid string');
  while (true) {
    const match = s.match(pemMatchRe);
    if (!match) break;
    const [pem, headerLabel, body, footerLabel] = match;
    s = s.substring(match.index + pem.length);
    try {
      if (headerLabel !== footerLabel) throw new Error('label mismatch');
      const label = headerLabel;
      if (label.startsWith(' ') || label.endsWith(' ')) throw new Error('invalid label');
      const base64 = body.replace(/\s/g, '');
      const data = bufferFromBase64(base64);
      yield { label, data };
    } catch (err) {
      continue;
    }
  }
}

function bufferFromBase64(base64) {
  if (!base64) throw new Error('invalid base64');
  if (base64.length % 4 !== 0) throw new Error('invalid base64');
  if (!base64TestRe.test(base64)) throw new Error('invalid base64');
  const data = Buffer.from(base64, 'base64');
  if (data.length !== Math.floor(base64.replace('=', '').length * 6 / 8)) throw new Error('invalid base64');
  return data;
}

const toPem = ({ label, data }) => `-----BEGIN ${label}-----\n${data.toString('base64').replace(/(.{64})(?!$)/g, '$1\n')}\n-----END ${label}-----\n`;

module.exports = s => [...Iterator(s)].map(toPem);
