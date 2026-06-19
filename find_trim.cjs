const fs = require('fs');

['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js'].forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const lines = code.split('\n');
    lines.forEach((l, i) => {
       if (l.includes('.trim') && !l.includes('?.trim')) {
           console.log(file, ':', i+1, ':', l.trim());
       }
    });
});
