const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');
code = code.replace(/r\?\.trim\(\)\.toLowerCase\(\) === kw/g, "(r.concept || '')?.trim().toLowerCase() === kw");
fs.writeFileSync('main.js', code);
