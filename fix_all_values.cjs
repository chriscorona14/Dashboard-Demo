const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace all instances of .values[ to .values?.[
code = code.replace(/\.values\[/g, ".values?.[");

// Also replace pptoValues[
code = code.replace(/\.pptoValues\[/g, ".pptoValues?.[");

fs.writeFileSync('main.js', code);
