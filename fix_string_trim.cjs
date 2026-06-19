const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/\.String\(trim\(\) \|\| ""\)/g, ".trim()");

fs.writeFileSync('main.js', code);
