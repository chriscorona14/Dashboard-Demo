const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// A catch-all pattern for anything.toLowerCase() that isn't `String(...)`, `...?.toLowerCase()`
// We will replace things like `d.date.toLowerCase()` -> `String(d.date || '').toLowerCase()`
// and `cat.toLowerCase()` -> `String(cat || '').toLowerCase()`
code = code.replace(/([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\.toLowerCase\(\)/g, (match, expr) => {
    if (expr === 'String') return match; // skip String(...).toLowerCase()
    if (expr.endsWith('?')) return match;
    return `String(${expr} || '').toLowerCase()`;
});

// Since some toLowerCase() were `[key].toLowerCase()` or similar, let's fix any that remain:
code = code.replace(/([a-zA-Z0-9_]+)\(\)\.toLowerCase\(\)/g, (match, expr) => {
    return `String(${expr}() || '').toLowerCase()`; // like .toString().toLowerCase()
});


fs.writeFileSync('main.js', code);
