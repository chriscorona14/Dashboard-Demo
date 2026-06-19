const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/(\w+)\.\(concept \|\| ''\)\.toLowerCase\(\)/g, "String($1.concept || '').toLowerCase()");

fs.writeFileSync('main.js', code);
