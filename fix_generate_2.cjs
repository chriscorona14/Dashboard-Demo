const fs = require('fs');
let code = fs.readFileSync('generate_demo_data.cjs', 'utf8');

const regex = /fullRows:\s*\[([\s\S]*?)\]\n\s*\}\,\n\s*ppto:\s*\{/m;

const replacement = `fullRows: [
          {cuenta:"Ingresos Operativos",type:"Ingresos",concept: "Ingresos Brutos", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 1.05 }},
          {cuenta:"Ingresos",type:"Ingresos",concept: "  Descuentos", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * -0.05 }},
          {cuenta:"Ingresos Operativos",type:"Ingresos",concept: "Ventas Netas", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos EVP", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.55 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos BT5", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.32 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos Otros", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.13 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "Costo de Venta", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs }},
          {cuenta:"Margen Bruto",type:"Margen Bruto",concept: "Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: margenBruto }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "  Gastos Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: gAdmin }},
          {cuenta:"Gastos de Mercadeo",type:"OPEX",concept: "  Gastos de Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: gMercadeo }},
          {cuenta:"Gastos de Ventas",type:"OPEX",concept: "  Gastos de Ventas (Comercial)", values: { [\`\${nombresMeses[i]} \${year}\`]: gVentas }},
          {cuenta:"Gastos de Logística",type:"OPEX",concept: "  Gastos de Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: gLogistica }},
          {cuenta:"Total GGADM", type:"OPEX",concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: opex }},
          {cuenta:"Otros Ingresos",type:"Ingresos",concept: "Otros Ingresos Operacionales", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 0.01 }},
          {cuenta:"EBITDA",type:"EBITDA",concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) }},
          {cuenta:"Depreciación y Amortización",type:"D&A",concept: "  Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da }},
          {cuenta:"EBIT", type:"EBIT",concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) - da }},
          {cuenta:"Intereses Netos",type:"Financiero",concept: "  Intereses Netos", values: { [\`\${nombresMeses[i]} \${year}\`]: intereses }},
          {cuenta:"Diferencial Cambiario",type:"Financiero",concept: "  Diferencial Cambiario", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 0.005 }},
          {cuenta:"Ingresos Extraordinarios",type:"Financiero",concept: "  Ingresos Extraordinarios", values: { [\`\${nombresMeses[i]} \${year}\`]: 0 }},
          {cuenta:"EBT", type:"Utilidad",concept: "EBT", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) - da - intereses - (ingresos * 0.005) }},
          {cuenta:"Impuestos", type:"Utilidad",concept: "  Impuestos Sobre la Renta", values: { [\`\${nombresMeses[i]} \${year}\`]: impuestos }},
          {cuenta:"Utilidad Neta",type:"Utilidad",concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: utilidad + (ingresos * 0.01) - (ingresos * 0.005) }},
          {cuenta:"% Margen Bruto",type:"Margen Bruto",concept: "% Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: margenBruto / ingresos }},
          {cuenta:"% Margen EBITDA",type:"EBITDA",concept: "% Margen EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: (ebitda + (ingresos * 0.01)) / ingresos }}
        ]
      },
      ppto: {`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    
    // Also inject PPTO
    const regex2 = /ppto:\s*\{\s*pnl:\s*\{\s*fullRows:\s*\[([\s\S]*?)\]\n\s*\}\n\s*\}/m;
    const replacement2 = `ppto: {
        pnl: {
          fullRows: [
            { concept: "Ingresos Brutos", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * 1.05 } },
            { concept: "  Descuentos", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * -0.05 } },
            { concept: "Ventas Netas", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto } },
            { concept: "  Costos EVP", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoCogs * 0.55 } },
            { concept: "  Costos BT5", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoCogs * 0.32 } },
            { concept: "  Costos Otros", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoCogs * 0.13 } },
            { concept: "Costo de Venta", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoCogs } },
            { concept: "Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto - pptoCogs } },
            { concept: "  Gastos Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin } },
            { concept: "  Gastos de Ventas (Comercial)", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGVentas } },
            { concept: "  Gastos de Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGMercadeo } },
            { concept: "  Gastos de Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGLogistica } },
            { concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica } },
            { concept: "Otros Ingresos Operacionales", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * 0.01 } },
            { concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) } },
            { concept: "  Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da } },
            { concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) - da } },
            { concept: "  Intereses Netos", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoIntereses } },
            { concept: "  Diferencial Cambiario", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * 0.005 } },
            { concept: "  Ingresos Extraordinarios", values: { [\`\${nombresMeses[i]} \${year}\`]: 0 } },
            { concept: "EBT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) - da - pptoIntereses - (ppto * 0.005) } },
            { concept: "  Impuestos Sobre la Renta", values: { [\`\${nombresMeses[i]} \${year}\`]: impuestos } },
            { concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoUtilidad + (ppto * 0.01) - (ppto * 0.005) } },
            { concept: "% Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: (ppto - pptoCogs) / ppto } },
            { concept: "% Margen EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: (pptoEbitda + (ppto * 0.01)) / ppto } }
          ]
        }
      }`;
    if(regex2.test(code)){
        code = code.replace(regex2, replacement2);
        console.log("Replaced fullRows PPTO successfully");
    } else {
        console.log("Failed to match PPTO");
    }
    fs.writeFileSync('generate_demo_data.cjs', code);
    console.log("Replaced fullRows successfully");
} else {
    console.log("Regex not matched: fullRows");
}
