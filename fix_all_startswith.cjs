const fs = require('fs');

function fixFile(file) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/\.startsWith/g, "?.startsWith");
        fs.writeFileSync(file, code);
    }
}

fixFile('resumenComercialEngine.js');
fixFile('processResumenCFData.js');
fixFile('financialEngine.js');
fixFile('main.js');
