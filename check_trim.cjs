const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((l, i) => {
     // match .trim( but NOT ?.trim(
     if (/[^\?]\.trim\(/.test(l)) {
        console.log(file, i+1, l);
     }
  });
});
