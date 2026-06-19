const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js', 'worker.js', 'costoUnitarioEngine.js'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // Just use acorn to be strictly ES module compliant without hacks!
  const ast = require('acorn').parse(code, { ecmaVersion: 2022, sourceType: "module" });
  console.log(file, "is OK");
});
