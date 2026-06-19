const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/MAQUILA AGUA/g, 'Variante B');
code = code.replace(/MAQUILA/g, 'Producto B');
code = code.replace(/APA /g, 'Variante ');

fs.writeFileSync('main.js', code);
