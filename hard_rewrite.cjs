const fs = require('fs');

let code = fs.readFileSync('generate_demo_data.cjs', 'utf8');

// The prefix is lines 1 through 31
let prefix = code.split('for (let year of [2025, 2026]) {')[0];

// The suffix is everything starting from "/* ceoData generation */"
let suffix = '/* ceoData generation */' + code.split('/* ceoData generation */')[1];

let middle = `for (let year of [2025, 2026]) {
  for (let i = 0; i < 12; i++) {
    let mesN = String(i + 1).padStart(2, '0');
    let scale = year === 2025 ? 0.9 : 1.0;
    
    let ingresos = ingresosMeses[i] * scale;
    let ppto = pptoMeses[i] * scale;
    let aa = ingresos * 0.88;
    
    let cogs = ingresos * 0.40;
    let pptoCogs = ppto * 0.40;
    
    let gAdmin = ingresos * 0.10;
    let gMercadeo = ingresos * 0.09;
    let gVentas = ingresos * 0.07;
    let gLogistica = ingresos * 0.04;
    let opex = gAdmin + gMercadeo + gVentas + gLogistica;
    
    let pptoGAdmin = ppto * 0.10;
    let pptoGMercadeo = ppto * 0.09;
    let pptoGVentas = ppto * 0.07;
    let pptoGLogistica = ppto * 0.04;
    
    let ebitda = ingresos - cogs - opex;
    let pptoEbitda = ppto - pptoCogs - (pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica);
    
    let da = ingresos * 0.035;
    let ebit = ebitda - da;
    
    let intereses = ingresos * 0.020;
    let pptoIntereses = ppto * 0.020;
    
    let impuestos = (ebitda - da - intereses) * 0.27;
    if (impuestos < 0) impuestos = 0;
    
    let utilidad = ebitda - da - intereses - impuestos;
    let pptoUtilidad = pptoEbitda - da - pptoIntereses - impuestos;
    
    let margenBruto = ingresos - cogs;
    
    let wc_cxc = -(ingresos * 0.05);
    let wc_inv = -(cogs * 0.10);
    let wc_cxp = cogs * 0.02;
    let wc = wc_cxc + wc_inv + wc_cxp;
    let cf_taxes = -impuestos;
    let operating = ebitda + wc + cf_taxes;
    
    let capex = -12.0 * scale;
    let netDebtFlow = -5.0 * scale; 
    let interestFlow = -intereses;
    let financing = netDebtFlow + interestFlow;
    
    let change = operating + capex + financing;
    
    let beginning = currentEfectivo;
    currentEfectivo += change;
    let ending = currentEfectivo;
    
    let aaUtilidad = aa * 0.13;
    
    // Update deuda monthly
    let thisMonthBancos = {};
    let totalBancos = 0;
    for (const k of Object.keys(bancosInfo)) {
       let b = bancosInfo[k];
       let step = (b.val - b.end) / 12; 
       let v = year === 2025 ? b.val * 1.1 : b.val - step * (i + 1);
       thisMonthBancos[k] = v;
       totalBancos += v;
    }
    let currentDeudaForMonth = totalBancos; 

    const monthObj = {
      date: \`\${nombresMeses[i]} \${year}\`,
      Periodo: \`\${mesN}-\${year}\`,
      sortDate: \`\${year}-\${mesN}-01T00:00:00.000Z\`,
      _isMock: true,
      
      kpis: {
        ingresos: ingresos,
        ebitda: ebitda,
        cashflow: change,
        utilidadNeta: utilidad,
        margenBruto: margenBruto / ingresos,
        realIngresos: ingresos,
        pptoIngresos: ppto,
        varIngresos: ppto !== 0 ? (ingresos - ppto) / ppto : 0,
        ebitdaRate: ebitda / ingresos,
        realEbitda: ebitda,
        pptoEbitda: pptoEbitda,
        margen_bruto: margenBruto / ingresos,
        utilidad: utilidad
      },
      
      trend: {
        ingresos: ingresos, ebitda: ebitda,
        cashflow: change, utilidadNeta: utilidad
      },
      
      balance: {
        deudaTotal: currentDeudaForMonth,
        ebitdaLTM: ebitda * 12, 
        efectivo: ending,
        roa: 0.12,
        roe: 0.18,
        ccc: 30 + 25 - 40,
        fullRows: [
          {cuenta:"Efectivo y Equivalentes",group:"Activo Corriente",Real:ending,PPTO:ending*1.05},
          {cuenta:"Cuentas por Cobrar",group:"Activo Corriente",Real:ingresos*0.12,PPTO:ppto*0.12},
          {cuenta:"Inventarios",group:"Activo Corriente",Real:cogs*0.20,PPTO:pptoCogs*0.20},
          {cuenta:"Activos Fijos Netos",group:"Activo No Corriente",Real:420,PPTO:422},
          {cuenta:"Cuentas por Pagar",group:"Pasivo Corriente",Real:cogs*0.15,PPTO:pptoCogs*0.15},
          {cuenta:"Deuda CP",group:"Pasivo Corriente",Real:60,PPTO:60},
          {cuenta:"Deuda LP",group:"Pasivo No Corriente",Real:currentDeudaForMonth-60,PPTO:currentDeudaForMonth-60},
          {cuenta:"Capital Social",group:"Patrimonio",Real:300,PPTO:300},
          {cuenta:"Utilidades Acumuladas",group:"Patrimonio",Real:ending + currentDeudaForMonth * 0.1, PPTO:(ending + currentDeudaForMonth * 0.1) * 1.05} 
        ]
      },
      
      cashflowDetail: {
        beginning: beginning,
        cxc: wc_cxc,
        inv: wc_inv,
        cxp: wc_cxp,
        wc: wc,
        taxes: cf_taxes,
        extraordinary: 0,
        operating: operating,
        capex: capex,
        netDebt: netDebtFlow,
        interest: interestFlow,
        dividends: 0,
        financing: financing,
        change: change,
        ending: ending,
        bancos: thisMonthBancos
      },
      
      pnl: {
        categorias: {
          "Ingresos": ingresos,
          "Costo de Ventas": cogs,
          "Margen Bruto": margenBruto,
          "OPEX": opex,
          "EBITDA": ebitda,
          "Depreciación": da,
          "EBIT": ebit,
          "Impuestos": impuestos,
          "Utilidad Neta": utilidad
        },
        opexDetalle: {
          "Gastos Administrativos": gAdmin,
          "Gastos de Mercadeo": gMercadeo,
          "Gastos de Ventas": gVentas,
          "Gastos de Logística": gLogistica
        },
        segments: {
          "EVP": { ventas: ingresos * 0.55, costos: cogs * 0.55 },
          "BT5": { ventas: ingresos * 0.32, costos: cogs * 0.32 },
          "BON": { ventas: ingresos * 0.10, costos: cogs * 0.10 },
          "Otros Ingresos": { ventas: ingresos * 0.03, costos: cogs * 0.03 }
        },
        fullRows: [
          {cuenta:"Ingresos Operativos",type:"Ingresos",concept: "Ingresos Brutos", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 1.05 }},
          {cuenta:"Ingresos",type:"Ingresos",concept: "  Descuentos", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * -0.05 }},
          {cuenta:"Ingresos Operativos",type:"Ingresos",concept: "Ventas Netas", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos EVP", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.55 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos BT5", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.32 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos Otros", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs * 0.13 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "Costo de Venta", values: { [\`\${nombresMeses[i]} \${year}\`]: cogs }},
          {cuenta:"Margen Bruto",type:"Margen Bruto",concept: "Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: margenBruto }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Gastos Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: gAdmin }},
          {cuenta:"Gastos de Mercadeo",type:"OPEX",concept: "Gastos de Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: gMercadeo }},
          {cuenta:"Gastos de Ventas",type:"OPEX",concept: "Gastos de Ventas (Comercial)", values: { [\`\${nombresMeses[i]} \${year}\`]: gVentas }},
          {cuenta:"Gastos de Logística",type:"OPEX",concept: "Gastos de Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: gLogistica }},
          {cuenta:"Total GGADM", type:"OPEX",concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: opex }},
          {cuenta:"Otros Ingresos",type:"Ingresos",concept: "Otros Ingresos Operacionales", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 0.01 }},
          {cuenta:"EBITDA",type:"EBITDA",concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) }},
          {cuenta:"Depreciación y Amortización",type:"D&A",concept: "Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da }},
          {cuenta:"EBIT", type:"EBIT",concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) - da }},
          {cuenta:"Intereses Netos",type:"Financiero",concept: "Intereses Netos", values: { [\`\${nombresMeses[i]} \${year}\`]: intereses }},
          {cuenta:"Diferencial Cambiario",type:"Financiero",concept: "Diferencial Cambiario", values: { [\`\${nombresMeses[i]} \${year}\`]: ingresos * 0.005 }},
          {cuenta:"Ingresos Extraordinarios",type:"Financiero",concept: "Ingresos Extraordinarios", values: { [\`\${nombresMeses[i]} \${year}\`]: 0 }},
          {cuenta:"EBT", type:"Utilidad",concept: "EBT", values: { [\`\${nombresMeses[i]} \${year}\`]: ebitda + (ingresos * 0.01) - da - intereses - (ingresos * 0.005) }},
          {cuenta:"Impuestos", type:"Utilidad",concept: "Impuestos Sobre la Renta", values: { [\`\${nombresMeses[i]} \${year}\`]: impuestos }},
          {cuenta:"Utilidad Neta",type:"Utilidad",concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: utilidad + (ingresos * 0.01) - (ingresos * 0.005) }},
          {cuenta:"% Margen Bruto",type:"Margen Bruto",concept: "% Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: margenBruto / ingresos }},
          {cuenta:"% Margen EBITDA",type:"EBITDA",concept: "% Margen EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: (ebitda + (ingresos * 0.01)) / ingresos }}
        ]
      },
      ppto: {
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
            { concept: "Gastos Administrativos", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin } },
            { concept: "Gastos de Ventas (Comercial)", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGVentas } },
            { concept: "Gastos de Mercadeo", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGMercadeo } },
            { concept: "Gastos de Logistica", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGLogistica } },
            { concept: "Total GGADM", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica } },
            { concept: "Otros Ingresos Operacionales", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * 0.01 } },
            { concept: "EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) } },
            { concept: "Depreciacion", values: { [\`\${nombresMeses[i]} \${year}\`]: da } },
            { concept: "EBIT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) - da } },
            { concept: "Intereses Netos", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoIntereses } },
            { concept: "Diferencial Cambiario", values: { [\`\${nombresMeses[i]} \${year}\`]: ppto * 0.005 } },
            { concept: "Ingresos Extraordinarios", values: { [\`\${nombresMeses[i]} \${year}\`]: 0 } },
            { concept: "EBT", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoEbitda + (ppto * 0.01) - da - pptoIntereses - (ppto * 0.005) } },
            { concept: "Impuestos Sobre la Renta", values: { [\`\${nombresMeses[i]} \${year}\`]: impuestos } },
            { concept: "Utilidad Neta", values: { [\`\${nombresMeses[i]} \${year}\`]: pptoUtilidad + (ppto * 0.01) - (ppto * 0.005) } },
            { concept: "% Margen Bruto", values: { [\`\${nombresMeses[i]} \${year}\`]: (ppto - pptoCogs) / ppto } },
            { concept: "% Margen EBITDA", values: { [\`\${nombresMeses[i]} \${year}\`]: (pptoEbitda + (ppto * 0.01)) / ppto } }
          ]
        }
      }
    };
    globalFinancialData.push(monthObj);
  }
}
\n\n`;

fs.writeFileSync('generate_demo_data.cjs', prefix + middle + suffix);
console.log("Rewrite complete.");
