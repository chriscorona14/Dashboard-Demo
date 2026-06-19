const fs = require('fs');
['main.js', 'resumenComercialEngine.js', 'financialEngine.js', 'processResumenCFData.js', 'worker.js', 'costoUnitarioEngine.js'].forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  code.split('\n').forEach((l, i) => {
    // Search for variable followed immediately by parenthesis without operator
    if (/\]\s*\(/.test(l)) {
       console.log("MATCH 1:", file, i+1, l);
    }
    if (/\w\s+\(/.test(l) && !/(if|for|while|switch|catch|return|typeof|function|await|yield)\s+\(/.test(l)) {
       // too many matches probably, let's look for known missing dot issues
    }
    if (/\.\s*\(/.test(l)) {
       console.log("MATCH DOT PAREN:", file, i+1, l);
    }
  });
});
