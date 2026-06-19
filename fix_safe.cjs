const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// For string properties we can write safely:
// obj.values && obj.values[prop]
code = code.replace(/([a-zA-Z0-9_$]+)\.values(?:\[|\?\.\[)([^\]]+)\](?!\s*=|\s*\/=|\s*\+=|\s*-=|\s*\*=|\])/g, "(($1.values || {})[$2])");

code = code.replace(/([a-zA-Z0-9_$]+)\.pptoValues(?:\[|\?\.\[)([^\]]+)\](?!\s*=|\s*\/=|\s*\+=|\s*-=|\s*\*=|\])/g, "(($1.pptoValues || {})[$2])");

// Also replace `.label.toLowerCase()` safely:
code = code.replace(/\.label\.toLowerCase\(\)/g, "?.label?.toLowerCase() || ''");
code = code.replace(/concept\.toLowerCase\(\)/g, "(concept || '').toLowerCase()");

// Let's protect concept and rw.concept
code = code.replace(/rw\.concept\.toLowerCase\(\)/g, "String(rw.concept || '').toLowerCase()");
code = code.replace(/r\.concept\.toLowerCase\(\)/g, "String(r.concept || '').toLowerCase()");
code = code.replace(/String\(c\)\.toLowerCase\(\)/g, "String(c || '').toLowerCase()");
code = code.replace(/String\(rw\.concept\)\.toLowerCase\(\)/g, "String(rw.concept || '').toLowerCase()");
code = code.replace(/row\.label\.toLowerCase\(\)/g, "String(row.label || '').toLowerCase()");

fs.writeFileSync('main.js', code);
