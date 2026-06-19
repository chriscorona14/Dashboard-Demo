const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/\.values\?\.(?:\[)([^\]]+)\]( )?\/=/g, ".values[$1] /=");
code = code.replace(/\.pptoValues\?\.(?:\[)([^\]]+)\]( )?\/=/g, ".pptoValues[$1] /=");

fs.writeFileSync('main.js', code);
