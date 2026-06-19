const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js', 'worker.js', 'costoUnitarioEngine.js'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import\s+.*?;/g, "");
  code = code.replace(/export\s+/g, "");
  try {
     new Function(code);
  } catch (e) {
     console.log("SYNTAX ERROR IN", file, ":", e.message);
  }
});
