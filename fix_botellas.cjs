const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/BOTELLON 18\.9/g, 'Tipo 1');
code = code.replace(/BOTELLON/g, 'Tipo 1');
code = code.replace(/BOTELLA 0\.5/g, 'Tipo 2');
code = code.replace(/BOTELLA 1\.5/g, 'Tipo 3');
code = code.replace(/BOTELLA/g, 'Tipo');
code = code.replace(/FUNDETA|FUNDA/g, 'Tipo 4');
code = code.replace(/GALON|VENDINGS|OTROS/g, 'Otros');

fs.writeFileSync('main.js', code);
