const fs = require('fs');
let c = fs.readFileSync('resumenComercialEngine.js', 'utf8');

const replacements = [
  ['BOTELLONES 5G', 'CATEGORÍA 1'],
  ['BOTELLAS', 'CATEGORÍA 2'],
  ['APA BOTELLA 0.5 LTS (x20)', 'CATEGORÍA 2.1'],
  ['APA BOTELLA 1.5 LTS (x12)', 'CATEGORÍA 2.2'],
  ['APA OTROS', 'CATEGORÍA 2.3'],
  ['APA 100% RPET 0.5LTS (x12)', 'CATEGORÍA 2.3.1'],
  ['APA BOTELLA 0.5LTS (x12)', 'CATEGORÍA 2.3.2'],
  ['APA BOTELLA 5LTS (x4)', 'CATEGORÍA 2.3.3'],
  ['APA BOTELLA 8 VASOS 1.89 LTS', 'CATEGORÍA 2.3.4'],
  ['APA SPORT 0.71 LTS', 'CATEGORÍA 2.3.5'],
  ['APA TETRA PACK 0.5 LTS', 'CATEGORÍA 2.3.6'],
  ['MAQUILA AGUA 0.5 LTS', 'CATEGORÍA 2.4'],
  ['MAQUILA AGUA 1.5 LTS', 'CATEGORÍA 2.5'],
  ['MAQUILA OTROS', 'CATEGORÍA 2.6'],
  ['MAQUILA 100% RPET 0.5LTS', 'CATEGORÍA 2.6.1'],
  ['MAQUILA BOTELLA 5LTS', 'CATEGORÍA 2.6.2'],
  ['OTRAS MAQUILAS', 'CATEGORÍA 2.6.3'],
  ['BEBIDAS', 'CATEGORÍA 2.7'],
  ['PA SABOR 0.5 LTS', 'CATEGORÍA 2.7.1'],
  ['HIDRACTIVE PLUS', 'CATEGORÍA 2.7.2'],
  ['HELADOS BON & OTROS', 'CATEGORÍA 3']
];

replacements.forEach(([o, n]) => {
  // Solo la propiedad label
  const regex = new RegExp(`label: '${o.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}'`, 'g');
  c = c.replace(regex, `label: '${n}'`);
});

fs.writeFileSync('resumenComercialEngine.js', c);
console.log("Labels replaced!");
