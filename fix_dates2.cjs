const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace standard instances
code = code.replace(/curr\.sortDate\.getMonth\(\)/g, "getSortMonth(curr)");
code = code.replace(/d\.sortDate\.getMonth\(\)/g, "getSortMonth(d)");

// For targetItem
code = code.replace(/targetItem\.sortDate\.getMonth\(\)/g, "getSortMonth(targetItem)");

// For sortDate being parsed inline
code = code.replace(/new Date\(curr\.sortDate\)\.getMonth\(\)/g, "getSortMonth(curr)");
code = code.replace(/new Date\(curr\.sortDate\)\.getFullYear\(\)/g, "getSortYear(curr)");
code = code.replace(/new Date\(d\.sortDate\)\.getFullYear\(\)/g, "getSortYear(d)");

// Custom replacements for dt in specific places
// To be safe I will use edit_file or simple replacements if needed, but the ones above are the main culprits according to `grep`.

fs.writeFileSync('main.js', code);
