const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/concept\.startsWith/g, "(concept || '').startsWith");
code = code.replace(/firstCell\.startsWith/g, "(firstCell || '').startsWith");
code = code.replace(/norm\.startsWith/g, "(norm || '').startsWith");

fs.writeFileSync('main.js', code);
