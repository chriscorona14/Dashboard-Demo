const fs = require('fs');

function fixFile(file) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        // We replace any concept.trim() with (concept || '').trim()
        code = code.replace(/concept\.trim\(\)/g, "(concept || '').trim()");
        code = code.replace(/r\.concept\.trim\(\)/g, "(r.concept || '').trim()");
        code = code.replace(/url\.trim\(\)/g, "(url || '').trim()");
        code = code.replace(/searchInput\.value\.trim\(\)/g, "(searchInput.value || '').trim()");
        code = code.replace(/n\.trim\(\)/g, "(n || '').trim()");
        
        // Also fix any other unprotected calls to trim where undefined could be encountered in other files
        
        fs.writeFileSync(file, code);
    }
}

fixFile('main.js');
