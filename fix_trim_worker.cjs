const fs = require('fs');

function fixFile(file) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/\.trim\(\)/g, "?.trim()");
        fs.writeFileSync(file, code);
    }
}

fixFile('worker.js');
fixFile('costoUnitarioEngine.js');
