const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace .values[ accesses with ?.values?.[
code = code.replace(/row\.values\[period\.date\]/g, "row.values?.[period.date]");
code = code.replace(/r\.values\[period\.date\]/g, "r.values?.[period.date]");
code = code.replace(/numRow\.values\[period\.date\]/g, "numRow.values?.[period.date]");
code = code.replace(/pptoRow\.values\[period\.date\]/g, "pptoRow.values?.[period.date]");
code = code.replace(/r\.values\[item\.date\]/g, "r.values?.[item.date]");
code = code.replace(/r\.values\[lastItem\.date\]/g, "r.values?.[lastItem.date]");
code = code.replace(/localRow\.values\[item\.date\]/g, "localRow.values?.[item.date]");
code = code.replace(/currentRateRow\.values\[item\.date\]/g, "currentRateRow.values?.[item.date]");
code = code.replace(/usdRow\.values\[item\.date\]/g, "usdRow.values?.[item.date]");

fs.writeFileSync('main.js', code);
