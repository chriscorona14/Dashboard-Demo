const fs = require('fs');
let code = fs.readFileSync('resumenComercialEngine.js', 'utf8');
code = code.replace(/key\?\.trim\(\)\.toUpperCase\(\)/g, "(key || '')?.trim().toUpperCase()");
fs.writeFileSync('resumenComercialEngine.js', code);
