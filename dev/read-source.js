'use strict';
const fs = require('node:fs');

// Source guards parse lines and literal blocks. CRLF and LF must mean the same thing,
// including on existing Windows checkouts created before .gitattributes was added.
module.exports = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
