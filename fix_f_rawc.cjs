const fs = require('fs');
let code = fs.readFileSync('financialEngine.js', 'utf8');
code = code.replace(/rawC\?\.trim\(\)\.toLowerCase\(\)/g, "String(rawC || '')?.trim().toLowerCase()");
fs.writeFileSync('financialEngine.js', code);
