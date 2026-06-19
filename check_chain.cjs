const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach((l, i) => {
     if (/\?\.trim\(\)\.toLowerCase\(/.test(l)) {
        console.log("BAD: ", file, i+1, l);
     }
     if (/\?\.trim\(\)\.toUpperCase\(/.test(l)) {
        console.log("BAD: ", file, i+1, l);
     }
  });
});
