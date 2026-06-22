const fs = require('fs');
let code = fs.readFileSync('generate_demo_data.cjs', 'utf8');

code = code.replace(/for \(let i = 0; i < 12; i\+\+\) \{[\s\S]*?globalFinancialData\.push\(monthObj\);\n\}/m, `
for (let year of [2025, 2026]) {
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

    // We keep the old shape for renderPreliminaryView but we fix pnl fullRows
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
        ]
      },
      ppto: {
        pnl: {
          fullRows: [
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
          ]
        }
      }
    };
    globalFinancialData.push(monthObj);
  }
}
`);

fs.writeFileSync('generate_demo_data.cjs', code);
