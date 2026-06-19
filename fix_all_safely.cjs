const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// For string properties we can write safely:
// obj.values && obj.values[prop]
code = code.replace(/([a-zA-Z0-9_\.]+)\.values\[([^\]]+)\]/g, "(($1.values || {})[$2])");
code = code.replace(/([a-zA-Z0-9_\.]+)\.values\?\.\\[([^\]]+)\]/g, "(($1.values || {})[$2])");

code = code.replace(/([a-zA-Z0-9_\.]+)\.pptoValues\[([^\]]+)\]/g, "(($1.pptoValues || {})[$2])");
code = code.replace(/([a-zA-Z0-9_\.]+)\.pptoValues\?\.\\[([^\]]+)\]/g, "(($1.pptoValues || {})[$2])");

fs.writeFileSync('main.js', code);
