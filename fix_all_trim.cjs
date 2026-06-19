const fs = require('fs');

function fixFile(file) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        // Replace something.trim() with something?.trim() where possible if we have a way...
        // Let's replace .trim() with ?.trim() globally instead! Wait, replacing all `.trim()` with `?.trim()` is safe if using modern JS/TS.
        code = code.replace(/\.trim\(\)/g, "?.trim()");
        // Wait, what if it's already ?.trim()?
        code = code.replace(/\?\?\.\trim\(\)/g, "?.trim()"); // fix double ??
        fs.writeFileSync(file, code);
    }
}

fixFile('main.js');
fixFile('resumenComercialEngine.js');
fixFile('financialEngine.js');
fixFile('processResumenCFData.js');
