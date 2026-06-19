const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js', 'worker.js', 'costoUnitarioEngine.js'].forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  let errCount = 0;
  code.split('\n').forEach((l, i) => {
     if (l.includes('.trim()') || l.includes('?.trim()') || l.includes('?.startsWith') || l.includes('?.toUpperCase') || l.includes('?.toLowerCase')) {
        // do not log all to prevent large output
        // just check for invalid syntax via new Function
        try {
           new Function("return " + l);
        } catch (e) {
           if (e.message.includes('Unexpected token')) {
               console.log(file, i+1, l, e.message);
               errCount++;
           }
        }
     }
  });
});
