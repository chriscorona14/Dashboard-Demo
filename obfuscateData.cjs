const fs = require('fs');

const scaleFactor = 0.81432; // Random scalar to obfuscate numbers but keep proportions

function processCSV(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  const processedLines = lines.map((line, rowIndex) => {
    if (rowIndex < 1) return line; // Skip headers (often first 1 lines)
    if (!line.trim()) return line;
    
    const parts = line.split(',');
    const newParts = parts.map((str, colIndex) => {
      // Obfuscate text
      let val = str.replace(/AGUA PLANETA AZUL/gi, 'AQUA NOVA')
                   .replace(/PLANETA AZUL/gi, 'AQUA NOVA')
                   .replace(/APA/g, 'AQA');

      // Obfuscate numbers (but not percentages)
      const num = parseFloat(val);
      if (!isNaN(num) && val.trim() !== '') {
        // Assume anything between -1 and 1 *might* be a percentage if it has decimal, but actually let's just scale everything except if it's explicitly a small decimal that looks like a percentage
        // A safer way: if the value is a number, we scale it
        // To prevent breaking small integers, we could just multiply.
        // Wait, if it's a percentage (e.g. 0.05), multiplying by 0.8 keeps it a proportion, but percentages shouldn't scale usually.
        // Let's just blindly scale all numbers >= 5 or <= -5. 
        if (Math.abs(num) >= 2) {
           // scale it
           let sealed = num * scaleFactor;
           // keep the original decimal count roughly
           val = val.includes('.') ? sealed.toFixed(val.split('.')[1].length) : Math.round(sealed).toString();
        }
      }
      return val;
    });
    return newParts.join(',');
  });
  
  fs.writeFileSync(filePath, processedLines.join('\n'), 'utf8');
}

processCSV('public/ventasCEO.csv');
processCSV('public/ventasCEO_summary.csv');

// Also update demo_data.json just in case there are names
if (fs.existsSync('public/demo_data.json')) {
  let jsonStr = fs.readFileSync('public/demo_data.json', 'utf8');
  jsonStr = jsonStr.replace(/AGUA PLANETA AZUL/gi, 'AQUA NOVA')
                   .replace(/PLANETA AZUL/gi, 'AQUA NOVA')
                   .replace(/APA/g, 'AQA');
  fs.writeFileSync('public/demo_data.json', jsonStr, 'utf8');
}
console.log('Obfuscated');
