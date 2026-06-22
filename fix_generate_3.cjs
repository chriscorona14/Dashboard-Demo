const fs = require('fs');
let code = fs.readFileSync('generate_demo_data.cjs', 'utf8');

const targetPnlRows = `        fullRows: [
          // Mock structure for Preliminar
          {cuenta:"Ingresos Operativos",type:"Ingresos",Real:ingresos,PPTO:ppto,AA:aa,YoY: (ingresos-aa)/aa, PPTO_Var: (ingresos-ppto)/ppto, concept: "Ventas Netas", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",Real:cogs,PPTO:pptoCogs,AA:aa*0.40,YoY: cogs!==0?(cogs-aa*0.40)/(aa*0.40):0, PPTO_Var: cogs!==0?(cogs-pptoCogs)/pptoCogs:0, concept: "Costo de Venta", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs }},
          {cuenta:"Margen Bruto",type:"Margen Bruto",Real:margenBruto,PPTO:ppto-pptoCogs,AA:aa*0.60,YoY:0,PPTO_Var:0, concept: "Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: margenBruto }},
          {cuenta:"Gastos Administrativos",type:"OPEX",Real:gAdmin,PPTO:pptoGAdmin,AA:aa*0.10,YoY:(gAdmin-(aa*0.10))/(aa*0.10),PPTO_Var:(gAdmin-pptoGAdmin)/pptoGAdmin, concept: "Gastos de Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: gAdmin }},
          {cuenta:"Gastos de Mercadeo",type:"OPEX",Real:gMercadeo,PPTO:pptoGMercadeo,AA:aa*0.09,YoY:(gMercadeo-(aa*0.09))/(aa*0.09),PPTO_Var:(gMercadeo-pptoGMercadeo)/pptoGMercadeo, concept: "Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: gMercadeo }},
          {cuenta:"Gastos de Ventas",type:"OPEX",Real:gVentas,PPTO:pptoGVentas,AA:aa*0.07,YoY:(gVentas-(aa*0.07))/(aa*0.07),PPTO_Var:(gVentas-pptoGVentas)/pptoGVentas, concept: "Gastos de Ventas", values: { [\`\${nombresMeses[i]} \${year}\`]: gVentas }},
          {cuenta:"Gastos de Logística",type:"OPEX",Real:gLogistica,PPTO:pptoGLogistica,AA:aa*0.04,YoY:(gLogistica-(aa*0.04))/(aa*0.04),PPTO_Var:(gLogistica-pptoGLogistica)/pptoGLogistica, concept: "Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: gLogistica }},
          {cuenta:"Total GGADM", type:"OPEX",Real:opex,PPTO:pptoGAdmin+pptoGMercadeo+pptoGVentas+pptoGLogistica,AA:aa*0.30,YoY:0,PPTO_Var:0, concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: opex }},
          {cuenta:"EBITDA",type:"EBITDA",Real:ebitda,PPTO:pptoEbitda,AA:aa*0.30,YoY:(ebitda-(aa*0.3))/((aa*0.3)||1),PPTO_Var:(ebitda-pptoEbitda)/pptoEbitda, concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda }},
          {cuenta:"Depreciación y Amortización",type:"D&A",Real:da,PPTO:ppto*0.035,AA:aa*0.035,YoY:0,PPTO_Var:0, concept: "Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da }},
          {cuenta:"EBIT", type:"EBIT", Real:ebitda-da, PPTO: pptoEbitda-da, AA:aa*0.30-da, YoY:0,PPTO_Var:0, concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda-da }},
          {cuenta:"Intereses Netos",type:"Financiero",Real:-intereses,PPTO:-pptoIntereses,AA:-aa*0.020,YoY:0,PPTO_Var:0, concept: "Intereses", values: { [\`\${nombresMeses[i]} \${year}\`]: intereses }},
          {cuenta:"Utilidad Neta",type:"Utilidad",Real:utilidad,PPTO:ppto*0.13,AA:aaUtilidad,YoY:(utilidad-aaUtilidad)/aaUtilidad,PPTO_Var:(utilidad-(ppto*0.13))/(ppto*0.13), concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: utilidad }}
        ]`;

const replacementPnlRows = `        fullRows: [
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
        ]`;

code = code.replace(targetPnlRows, replacementPnlRows);

const targetPptoRows = `          fullRows: [
            { concept: "Ventas Netas", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto } },
            { concept: "Costo de Venta", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoCogs } },
            { concept: "Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto - pptoCogs } },
            { concept: "Gastos de Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin } },
            { concept: "Gastos de Ventas", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGVentas } },
            { concept: "Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGMercadeo } },
            { concept: "Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGLogistica } },
            { concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica } },
            { concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda } },
            { concept: "Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da } },
            { concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda - da } },
            { concept: "Intereses", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoIntereses } },
            { concept: "EBT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda - da - pptoIntereses } },
            { concept: "Impuestos", values: { [\`\${nombresMeses[i]} \${year}\`]: impuestos } },
            { concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoUtilidad } }
          ]`;

const replacementPptoRows = `          fullRows: [
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
          ]`;

code = code.replace(targetPptoRows, replacementPptoRows);

fs.writeFileSync('generate_demo_data.cjs', code);
console.log("Success");
