const fs = require('fs');

function fixFile(file) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/rows\[i\]\.\(concept \|\| ''\)\?\.trim\(\)/g, "(rows[i].concept || '')?.trim()");
        code = code.replace(/\.\(concept \|\| ''\)\?\.trim\(\)/g, "?.trim()");
        fs.writeFileSync(file, code);
    }
}

fixFile('main.js');
