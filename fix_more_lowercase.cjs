const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/([a-zA-Z0-9_\.]+)((?:\.[a-zA-Z0-9_]+)?\.[a-zA-Z0-9_]+)\.toLowerCase\(\)/g, (match, p1, p2) => {
    // skip our safe string wrap
    if (match.includes("String(")) return match;
    if (match.includes("?.")) return match;
    return `String(${p1}${p2} || '').toLowerCase()`;
});

fs.writeFileSync('main.js', code);
