const fs = require('fs');
let code = fs.readFileSync('resumenComercialEngine.js', 'utf8');
code = code.replace(/row\[j\]\?\.trim\(\)\.toUpperCase\(\)/g, "String(row[j] || '')?.trim().toUpperCase()");
fs.writeFileSync('resumenComercialEngine.js', code);
