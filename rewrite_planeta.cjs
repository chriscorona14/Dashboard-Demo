const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace standard terms safely
code = code.replace(/AGUA PLANETA AZUL/g, 'Total Portafolio');
code = code.replace(/PLANETA AZUL/g, 'PORTAFOLIO');
code = code.replace(/Planeta Azul/g, 'Dashboard Data');
code = code.replace(/Planeta azul/g, 'Dashboard Data');
code = code.replace(/MAQUILAS/g, 'Producto B');
code = code.replace(/BEBIDAS/g, 'Producto C');

// Replace CEO Mappings
code = code.replace(/const CEO_MAPPINGS = \[([\s\S]*?)\];/, `const CEO_MAPPINGS = [
      { Producto: "TOTAL", match: null, isParent: false },
      { Producto: "Total Portafolio", match: null, isParent: true, parentId: null },
      { Producto: "Producto 1", match: ["Producto 1"], parentId: "Total Portafolio" },
      { Producto: "Producto 2", match: ["Producto 2"], parentId: "Total Portafolio" },
      { Producto: "Producto 3", match: ["Producto 3"], parentId: "Total Portafolio" },
      { Producto: "Producto 4", match: ["Producto 4"], parentId: "Total Portafolio" },
      { Producto: "Producto 5", match: ["Producto 5"], parentId: "Total Portafolio" }
    ];`);

fs.writeFileSync('main.js', code);
