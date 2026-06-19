const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/activeView\.i\(d \|\| ''\)\.startsWith/g, "activeView.id?.startsWith");

fs.writeFileSync('main.js', code);
