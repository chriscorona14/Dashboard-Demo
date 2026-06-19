const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js', 'worker.js', 'costoUnitarioEngine.js'].forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  const lines = code.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('?.(')) {
      console.log(f, i+1, l);
    }
  });
});
