const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// The replacement logic for renderDetailedPnL
const newFunc = `function renderDetailedPnL(data, selectedIndex = -1) {
  const headerEl = document.getElementById("pnlDetailedHeader");
  const bodyEl = document.getElementById("pnlDetailedBody");
  if (!headerEl || !bodyEl || !data || data.length === 0) return;

  const endIdx = selectedIndex >= 0 ? selectedIndex : data.length - 1;
  const startIdx = Math.max(0, endIdx - 5);

  const visibleMonths = data.slice(startIdx, endIdx + 1);
  const periods = visibleMonths.map((d) => d.date);

  headerEl.innerHTML = \`
        <tr>
            <th>Concepto / Cuenta</th>
            \${periods.map((p) => \`<th>\${p}</th>\`).join("")}
            <th style="background:#0f172a; color:white; text-align:right;">YTD Actual</th>
            <th style="background:#1e293b; color:white; text-align:right;">YTD Y-1</th>
            <th style="background:#1e293b; color:white; text-align:right;">Var YTD %</th>
        </tr>
    \`;

  let allConcepts = [];
  data.forEach((d) => {
    if (d.pnl && d.pnl.fullRows) {
      d.pnl.fullRows.forEach((row) => {
        if (!allConcepts.includes(row.concept)) {
          allConcepts.push(row.concept);
        }
      });
    }
  });

  allConcepts = allConcepts.filter((c) => {
    const nc = normalizeText(c);
    if (
      nc === "concepto" ||
      nc === "cuentas" ||
      nc === "descripcion" ||
      nc === "p&l" ||
      nc === "resultado" ||
      nc === "detalle"
    )
      return false;
    if (
      nc.includes("en mdop") ||
      nc.includes("reporte pa") ||
      nc.includes("seguimiento gerencial") ||
      nc.includes("margen operacional") ||
      nc === "margen neto" ||
      nc === "margen bruto ordinario"
    )
      return false;
    return true;
  });

  const ppeIndex = allConcepts.findIndex((c) =>
    normalizeText(c).includes("ppe acumulado"),
  );
  if (ppeIndex !== -1) {
    allConcepts = allConcepts.slice(0, ppeIndex);
  }

  if (allConcepts.length === 0) {
    bodyEl.innerHTML = \`<tr><td colspan="\${periods.length + 4}" style="text-align:center; padding:40px; color:var(--text-secondary); font-style:italic;">Por favor, sincronice el Master Financiero para visualizar el P&L Detallado.</td></tr>\`;
    return;
  }

  const targetYear = getSortYear(data[endIdx]);
  const endMonth = getSortMonth(data[endIdx]);
  
  const parseDirtyNumberForMargin = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    let cleaned = val.toString().replace(/[^0-9.-]+/g, "");
    return Number(cleaned) || 0;
  };

  bodyEl.innerHTML = allConcepts
    .map((concept) => {
      const normConcept = normalizeText(concept);
      const isPercentage =
        normConcept.includes("margen") ||
        normConcept.includes("margin") ||
        normConcept.includes("%");
      const isFX =
        normConcept === "fx" ||
        normConcept.includes("tasa de cambio") ||
        normConcept === "tasa cambio" ||
        normConcept === "tasa de cambio cierre" ||
        normConcept === "tipo de cambio" ||
        normConcept.includes("tasa proyectada");

      const isEbitdaMargin = normConcept.includes("ebitda");
      const isGrossMargin = normConcept.includes("bruto");
      const isNetMargin =
        normConcept.includes("neto") ||
        normConcept.includes("utilidad neta") ||
        normConcept.includes("resultado neto");
      const isGgadm = normConcept.includes("ggadm");

      const getAccumForYear = (yr) => {
        let numSum = 0;
        let denSum = 0;
        let normalSum = 0;
        for (let k = 0; k < data.length; k++) {
          const item = data[k];
          if (getSortYear(item) === yr && getSortMonth(item) <= endMonth) {
            let matchingRows = item.pnl?.fullRows?.filter((r) => r.concept === concept) || [];
            let rVal = matchingRows.reduce((sum, r) => sum + ((r.values || {})[item.date] || 0), 0);
            normalSum += rVal;
            
            if (isPercentage) {
               const denRows = item.pnl?.fullRows?.filter((r) => {
                   const nc = normalizeText(r.concept);
                   return nc === "ventas netas" || nc === "total ingresos" || nc === "ingresos" || nc.includes("ventas netas");
               }) || [];
               let dVal = denRows.reduce((s, r) => s + ((r.values || {})[item.date] || 0), 0) || item.kpis?.ingresos || 0;
               denSum += dVal;
               
               let nVal = 0;
               if (isEbitdaMargin) {
                   const nRows = item.pnl?.fullRows?.filter(r => {
                      const nc = normalizeText(r.concept);
                      return nc === "ebitda" || nc.includes("ebitda ") || nc.includes(" ebitda");
                   }) || [];
                   nVal = nRows.reduce((s, r) => s + ((r.values || {})[item.date] || 0), 0) || item.kpis?.ebitda || 0;
               } else if (isGrossMargin) {
                   const nRows = item.pnl?.fullRows?.filter(r => {
                      const nc = normalizeText(r.concept);
                      return nc === "margen bruto" || nc === "utilidad bruta";
                   }) || [];
                   nVal = nRows.reduce((s, r) => s + ((r.values || {})[item.date] || 0), 0) || (item.kpis?.margen_bruto * item.kpis?.ingresos) || 0;
               } else if (isNetMargin) {
                   const nRows = item.pnl?.fullRows?.filter(r => {
                      const nc = normalizeText(r.concept);
                      return nc === "utilidad neta" || nc === "ganancia del periodo" || nc === "resultado neto";
                   }) || [];
                   nVal = nRows.reduce((s, r) => s + ((r.values || {})[item.date] || 0), 0) || item.kpis?.utilidad || 0;
               } else if (isGgadm) {
                   const nRows = item.pnl?.fullRows?.filter(r => {
                      const nc = normalizeText(r.concept);
                      return nc === "total ggadm" || nc.includes("gastos administrativos");
                   }) || [];
                   nVal = nRows.reduce((s, r) => s + ((r.values || {})[item.date] || 0), 0);
               }
               numSum += nVal;
            }
          }
        }
        
        if (isPercentage) {
            if (denSum !== 0) return numSum / denSum;
            return 0;
        }
        return normalSum;
      };

      const accumActual = getAccumForYear(targetYear);
      const accumY1 = getAccumForYear(targetYear - 1);
      const isExpense = normConcept.includes("costo") || normConcept.includes("gasto") || normConcept.includes("depreciacion") || normConcept.includes("amortizacion") || normConcept.includes("intereses") || normConcept.includes("impuestos");

      const periodCells = visibleMonths
        .map((period) => {
          let matchingRows =
            period.pnl?.fullRows?.filter((r) => r.concept === concept) || [];
          let val = matchingRows.reduce(
            (sum, r) => sum + ((r.values || {})[period.date] || 0),
            0,
          );

          if (isPercentage) {
            const denRows = period.pnl?.fullRows?.filter((r) => {
               const nc = normalizeText(r.concept);
               return nc === "ventas netas" || nc === "total ingresos" || nc === "ingresos" || nc.includes("ventas netas");
            }) || [];
            let denVal = denRows.reduce((sum, r) => sum + ((r.values || {})[period.date] || 0), 0) || period.kpis?.ingresos || 0;

            let numVal = 0;
            if (isEbitdaMargin) {
              const numRow = period.pnl?.fullRows?.find(r => {
                 const nc = normalizeText(r.concept);
                 return nc === "ebitda" || nc.includes("ebitda ") || nc.includes(" ebitda");
              });
              numVal = numRow ? (numRow.values || {})[period.date] || 0 : period.kpis?.ebitda || 0;
            } else if (isGrossMargin) {
              const numRow = period.pnl?.fullRows?.find(r => {
                 const nc = normalizeText(r.concept);
                 return nc === "margen bruto" || nc === "utilidad bruta";
              });
              numVal = numRow ? (numRow.values || {})[period.date] || 0 : period.kpis?.margen_bruto * period.kpis?.ingresos || 0;
            } else if (isNetMargin) {
              const numRow = period.pnl?.fullRows?.find(r => {
                 const nc = normalizeText(r.concept);
                 return nc === "utilidad neta" || nc === "ganancia del periodo" || nc === "resultado neto";
              });
              numVal = numRow ? (numRow.values || {})[period.date] || 0 : period.kpis?.utilidad || 0;
            } else if (isGgadm) {
              const numRow = period.pnl?.fullRows?.find(r => {
                 const nc = normalizeText(r.concept);
                 return nc === "total ggadm" || nc.includes("gastos administrativos");
              });
              numVal = numRow ? (numRow.values || {})[period.date] || 0 : 0;
            }

            numVal = parseDirtyNumberForMargin(numVal);
            denVal = parseDirtyNumberForMargin(denVal);

            if ((isEbitdaMargin || isGrossMargin || isNetMargin || isGgadm) && denVal !== 0) {
              val = numVal / denVal;
            }
          }

          const color = val < 0 ? "var(--danger)" : "inherit";

          let displayVal;
          if (isPercentage) displayVal = formatPercent(val);
          else if (isFX) displayVal = val.toFixed(2);
          else displayVal = formatCurrency(val);

          let pptoRow = period.ppto?.pnl?.fullRows?.find((r) => r.concept === concept);
          let pptoVal = pptoRow ? ((pptoRow.values || {})[period.date] || 0) : 0;

          let pulseClass = "";
          let pulseTitle = "";
          if (pptoVal && pptoVal !== 0) {
            const devPct = (val - pptoVal) / Math.abs(pptoVal);
            if (Math.abs(devPct) > 0.15) {
              const isPositiveBetter = !isExpense;
              const isBetter = isPositiveBetter ? devPct > 0 : devPct < 0;
              pulseClass = isBetter ? "pulse-pos" : "pulse-neg";
              let formattedPptoVal = isPercentage ? formatPercent(pptoVal) : (isFX ? pptoVal.toFixed(2) : formatCurrency(pptoVal));
              pulseTitle = \`Desviación de \${(devPct * 100).toFixed(1)}% respecto al presupuesto (\${formattedPptoVal}) para \${concept}\`;
            }
          }

          const innerAttributes = pulseClass ? \`class="\${pulseClass}" title="\${pulseTitle}" style="display:inline-block; padding: 2px 6px;"\` : "";
          return \`<td style="text-align: right; color:\${color};"><div \${innerAttributes}>\${displayVal}</div></td>\`;
        })
        .join("");

      const isTotal =
        normConcept.includes("total") ||
        normConcept.includes("ebitda") ||
        normConcept.includes("utilidad") ||
        normConcept.includes("resultado") ||
        normConcept.includes("ggadm") ||
        normConcept.includes("ventas netas") ||
        normConcept.includes("costo de venta") ||
        normConcept.includes("ebit");

      const isSubRow =
        (concept || '')?.startsWith("  ") ||
        (concept || '')?.startsWith("\\t") ||
        normConcept.includes("costos ") ||
        normConcept.includes("gastos ") ||
        normConcept.includes("impuestos") ||
        normConcept.includes("diferencial cambiario") ||
        normConcept.includes("ingresos financieros") ||
        normConcept.includes("extraordinarios");

      const rowClass = isTotal ? "row-total" : "";
      const cellClass = isSubRow ? "row-indent" : "";

      let displayAccum = isPercentage ? formatPercent(accumActual) : (isFX ? accumActual.toFixed(2) : formatCurrency(accumActual));
      let displayY1 = isPercentage ? formatPercent(accumY1) : (isFX ? accumY1.toFixed(2) : formatCurrency(accumY1));
      
      let varYoy = 0;
      if (Math.abs(accumY1) > 0) {
         if (isPercentage) {
             varYoy = accumActual - accumY1; // difference for percentages
         } else {
             varYoy = (accumActual - accumY1) / Math.abs(accumY1);
         }
      } else if (accumActual > 0) {
         varYoy = 1;
      }
      
      let colorTotalInfo = accumActual < 0 ? "var(--danger)" : "inherit";
      let displayVarYoy = isPercentage ? (varYoy * 100).toFixed(1) + ' pts' : formatPercent(varYoy);
      
      const isPositiveBetter = !isExpense;
      let varColor = "inherit";
      if (varYoy !== 0) {
         if (isPositiveBetter) {
             varColor = varYoy > 0 ? "var(--success)" : "var(--danger)";
         } else {
             varColor = varYoy < 0 ? "var(--success)" : "var(--danger)";
         }
      }

      return \`
            <tr class="\${rowClass}">
                <td class="\${cellClass}" style="word-break: break-word;">\${concept}</td>
                \${periodCells}
                <td style="text-align: right; color:\${colorTotalInfo}; font-weight:600; background:#0f172a; color:white;">\${displayAccum}</td>
                <td style="text-align: right; font-weight:500; background:#1e293b; color:white; opacity:0.85;">\${displayY1}</td>
                <td style="text-align: right; font-weight:600; color:\${varColor}; background:#1e293b;">\${displayVarYoy}</td>
            </tr>
        \`;
    })
    .join("");
}`;

// Make sure to replace the entire old function
const regex = /function renderDetailedPnL\(data, selectedIndex = -1\) \{[\s\S]*?\n\}\n/m;
if (regex.test(code)) {
    code = code.replace(regex, newFunc + '\n');
    fs.writeFileSync('main.js', code);
    console.log('Successfully replaced renderDetailedPnL');
} else {
    console.log('Could not find renderDetailedPnL in main.js');
}
