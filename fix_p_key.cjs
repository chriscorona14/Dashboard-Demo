const fs = require('fs');
let code = fs.readFileSync('processResumenCFData.js', 'utf8');
code = code.replace(/key\?\.trim\(\)\.toUpperCase\(\)/g, "String(key || '')?.trim().toUpperCase()");
code = code.replace(/colM\?\.trim\(\)\.toUpperCase\(\)/g, "String(colM || '')?.trim().toUpperCase()");
fs.writeFileSync('processResumenCFData.js', code);
