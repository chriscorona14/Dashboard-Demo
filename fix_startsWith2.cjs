const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/catUpper\.startsWith/g, "(catUpper || '').startsWith");
code = code.replace(/headerText\.startsWith/g, "(headerText || '').startsWith");
code = code.replace(/k\.startsWith/g, "(k || '').startsWith");
code = code.replace(/d\.startsWith/g, "(d || '').startsWith");
code = code.replace(/row\.startsWith/g, "(row || '').startsWith");
code = code.replace(/str\.startsWith/g, "(str || '').startsWith");

fs.writeFileSync('main.js', code);
