const fs = require('fs');

const { log } = console;

const ingresosMeses = [
  125, 118.5, 132, 128, 135.5, 140,
  138, 145, 142, 148.5, 155, 165
];

const pptoMeses = [
  128, 122, 130, 132, 133, 138.5,
  140, 142, 145, 146, 152, 160
];

const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

let currentDeuda = 480;
let currentEfectivo = 65;

let bancosInfo = {
  "Banco Popular": { val: 200, end: 175, tasa: 0.145 },
  "Banco Santa Cruz": { val: 140, end: 125, tasa: 0.130 },
  "Scotiabank": { val: 100, end: 85, tasa: 0.115 },
  "Loganville": { val: 40, end: 35, tasa: 0.100 }
};

let previousAccumEbitda = 0; // For cumulative/LTM things, let's keep it simple

const globalFinancialData = [];


for (let year of [2025, 2026]) {
  for (let i = 0; i < 12; i++) {
    let mesN = String(i + 1).padStart(2, '0');
    let scale = year === 2025 ? 0.9 : 1.0;
    
    // Complex seasonality to simulate real company
    let seasonality = 1.0;
    if (i === 10 || i === 11) seasonality = 1.35; // Nov-Dec peak
    if (i === 0 || i === 1) seasonality = 0.85;   // Jan-Feb low
    if (i === 6 || i === 7) seasonality = 1.15;   // Summer bump
    
    let ingresos = (ingresosMeses[i] * 10) * scale * seasonality; // Larger scale
    let ppto = (pptoMeses[i] * 10) * scale * seasonality;
    let aa = ingresos * 0.88;
    
    let cogs = ingresos * 0.45; // 45% margin base
    let pptoCogs = ppto * 0.45;
    
    let gAdminPersonal = ingresos * 0.05;
    let gAdminSeguros = ingresos * 0.01;
    let gAdminServicios = ingresos * 0.02;
    let gAdminHonorarios = ingresos * 0.02;
    let gAdminOtros = ingresos * 0.02;
    let gAdmin = gAdminPersonal + gAdminSeguros + gAdminServicios + gAdminHonorarios + gAdminOtros; 
    
    let gMercadeo = ingresos * 0.08;
    let gVentas = ingresos * 0.09; 
    let gLogistica = ingresos * 0.05;
    let opex = gAdmin + gMercadeo + gVentas + gLogistica;
    
    let pptoGAdmin = ppto * 0.12;
    let pptoGMercadeo = ppto * 0.08;
    let pptoGVentas = ppto * 0.09;
    let pptoGLogistica = ppto * 0.05;
    
    let ebitda = ingresos - cogs - opex;
    let pptoEbitda = ppto - pptoCogs - (pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica);
    
    let daGasto = ingresos * 0.02;
    let daCosto = ingresos * 0.02;
    let da = daGasto + daCosto;
    let ebit = ebitda - da;
    
    let intereses = ingresos * 0.025;
    let pptoIntereses = ppto * 0.025;
    
    // Diferencial cambiario: oscila suavemente entre -0.8 y +1.2 (impacto USD sobre CxP)
    const dcPattern = [0.8, -0.3, 1.1, 0.5, -0.6, 0.9, 0.2, -0.4, 1.0, 0.7, -0.2, 1.2];
    let diferencialCambiario = dcPattern[i];
    let ebt = ebit - intereses + diferencialCambiario;
    
    let impuestos = ebt > 0 ? ebt * 0.27 : 0;
    
    let utilidad = ebt - impuestos;
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

    // Indicadores de días — deterministas, varían ligeramente mes a mes
    const dsoBase = [32,31,33,30,31,30,29,31,30,28,30,29];
    const dioBase = [26,25,27,24,26,25,23,26,25,22,24,23];
    const dpoBase = [42,41,43,40,42,41,39,42,41,38,40,39];
    const dso = dsoBase[i];
    const dio = dioBase[i];
    const dpo = dpoBase[i];
    const ccc = dso + dio - dpo;
    
    let change = operating + capex + financing;
    
    let beginning = currentEfectivo;
    currentEfectivo += change;
    let ending = currentEfectivo;
    
    let aaUtilidad = aa * 0.13;
    // Tasa USD determinista: crece suavemente de 59.0 (Ene-2025) a 61.8 (Dic-2026)
    // 24 meses en total = paso de ~0.12 por mes
    const globalMonthIndex = (year - 2025) * 12 + i;
    let tasaDolar = parseFloat((59.0 + globalMonthIndex * 0.116).toFixed(2));

    
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
      date: `${nombresMeses[i]} ${year}`,
      Periodo: `${mesN}-${year}`,
      sortDate: `${year}-${mesN}-01T00:00:00.000Z`,
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
      
      deudaMetrics: {
        tasaDop: 0.12,
        tasaUsd: 0.08,
        tasaCambio: tasaDolar,
        deudaNetaUsd: parseFloat(((currentDeudaForMonth - ending) / tasaDolar).toFixed(2)),
        deudaNetaBancUSD: parseFloat((totalBancos / tasaDolar).toFixed(2)),
        covenantLean: 1.5,
        apalancamiento: currentDeudaForMonth / (ebitda * 12),
        capacidadPago: (ebitda * 12) / (intereses * 12),
        razonCorriente: 1.2,
        cajaEfectivo: ending,
        deudaTotal: currentDeudaForMonth,
        debtDetail: {
          bancaTotal: currentDeudaForMonth * 0.8,
          relacionadaTotal: currentDeudaForMonth * 0.2,
          deudaTotal: currentDeudaForMonth,
          efectivo: ending,
          deudaNeta: currentDeudaForMonth - ending,
          deudaNetaUSD: (currentDeudaForMonth - ending) / tasaDolar,
          bancos: {
            "Banco Popular": parseFloat(thisMonthBancos["Banco Popular"].toFixed(2)),
            "Banco Santa Cruz": parseFloat(thisMonthBancos["Banco Santa Cruz"].toFixed(2)),
            "Scotiabank": parseFloat(thisMonthBancos["Scotiabank"].toFixed(2)),
            "Loganville": parseFloat(thisMonthBancos["Loganville"].toFixed(2))
          },
          tasasPorBanco: {
            "Banco Popular": bancosInfo["Banco Popular"].tasa,
            "Banco Santa Cruz": bancosInfo["Banco Santa Cruz"].tasa,
            "Scotiabank": bancosInfo["Scotiabank"].tasa,
            "Loganville": bancosInfo["Loganville"].tasa
          }
        }
      },

      balance: {
        deudaTotal: currentDeudaForMonth,
        ebitdaLTM: ebitda * 12, 
        efectivo: ending,
        roa: 0.12,
        roe: 0.18,
        ccc: ccc,
        fullRows: [
          { concept: "ACTIVOS" },
          { concept: "  Activo Corriente" },
          { concept: "    Efectivo", values: { [`${nombresMeses[i]} ${year}`]: ending } },
          { concept: "    Efectivo y Equivalentes", values: { [`${nombresMeses[i]} ${year}`]: ending } },
          { concept: "    Cuentas por Cobrar", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.12 } },
          { concept: "    Inventarios", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.20 } },
          { concept: "    Cuentas por Cobrar Relacionadas", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.02 } },
          { concept: "    Cuentas por Cobrar Empleados", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.01 } },
          { concept: "    Gastos Pagados por Adelantado", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.05 } },
          { concept: "    Otros Activos Corrientes", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.02 } },
          { concept: "  Total Activo Corriente", values: { [`${nombresMeses[i]} ${year}`]: ending + (ingresos * 0.12) + (cogs * 0.20) + (ingresos * 0.02) + (opex * 0.08) } },
          
          { concept: "  Activo No Corriente" },
          { concept: "    Activos Fijos Netos", values: { [`${nombresMeses[i]} ${year}`]: 420 } },
          { concept: "    Activos Intangibles", values: { [`${nombresMeses[i]} ${year}`]: 80 } },
          { concept: "    Depreciacion Acumulada", values: { [`${nombresMeses[i]} ${year}`]: -105 } },
          { concept: "    Inversiones a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 150 } },
          { concept: "    Impuestos Diferidos Activos", values: { [`${nombresMeses[i]} ${year}`]: 12 } },
          { concept: "    Otros Activos a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "  Total Activo No Corriente", values: { [`${nombresMeses[i]} ${year}`]: 420 + 80 - 105 + 150 + 12 + 25 } },
          { concept: "Total Activos", values: { [`${nombresMeses[i]} ${year}`]: ending + (ingresos * 0.12) + (cogs * 0.20) + (ingresos * 0.02) + (opex * 0.08) + 420 + 80 - 105 + 150 + 12 + 25 } },

          { concept: "PASIVOS" },
          { concept: "  Pasivo Corriente" },
          { concept: "    Cuentas por Pagar Bancarias", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "    Cuentas por Pagar Proveedores", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.15 } },
          { concept: "    Deuda CP", values: { [`${nombresMeses[i]} ${year}`]: 60 } },
          { concept: "    Cuentas por Pagar Relacionadas", values: { [`${nombresMeses[i]} ${year}`]: 15 } },
          { concept: "    Retenciones y Acumulaciones por Pagar", values: { [`${nombresMeses[i]} ${year}`]: 8 } },
          { concept: "    Impuestos por Pagar", values: { [`${nombresMeses[i]} ${year}`]: 18 } },
          { concept: "    Beneficios a Empleados", values: { [`${nombresMeses[i]} ${year}`]: 12 } },
          { concept: "  Total Pasivo Corriente", values: { [`${nombresMeses[i]} ${year}`]: 25 + (cogs * 0.15) + 60 + 15 + 8 + 18 + 12 } },
          
          { concept: "  Pasivo No Corriente" },
          { concept: "    Deuda LP", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - 60 } },
          { concept: "    Cuentas por Pagar Relacionadas LP", values: { [`${nombresMeses[i]} ${year}`]: 45 } },
          { concept: "    Impuestos Diferidos Pasivos", values: { [`${nombresMeses[i]} ${year}`]: 22 } },
          { concept: "    Provisiones a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 14 } },
          { concept: "  Total Pasivo No Corriente", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - 60 + 45 + 22 + 14 } },
          { concept: "Total Pasivos", values: { [`${nombresMeses[i]} ${year}`]: 25 + (cogs * 0.15) + 60 + 15 + 8 + 18 + 12 + (currentDeudaForMonth - 60) + 45 + 22 + 14 } },

          { concept: "PATRIMONIO" },
          { concept: "  Capital Social", values: { [`${nombresMeses[i]} ${year}`]: 300 } },
          { concept: "  Prima en Emision de Acciones", values: { [`${nombresMeses[i]} ${year}`]: 50 } },
          { concept: "  Reserva Legal", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "  Resultados Acumulados", values: { [`${nombresMeses[i]} ${year}`]: ending + currentDeudaForMonth * 0.1 } },
          { concept: "  Beneficio Neto del Periodo", values: { [`${nombresMeses[i]} ${year}`]: utilidad } },
          { concept: "Total Patrimonio", values: { [`${nombresMeses[i]} ${year}`]: 300 + 50 + 25 + ending + currentDeudaForMonth * 0.1 + utilidad } },
          { concept: "Total Pasivo y Patrimonio", values: { [`${nombresMeses[i]} ${year}`]: (25 + (cogs * 0.15) + 60 + 15 + 8 + 18 + 12 + (currentDeudaForMonth - 60) + 45 + 22 + 14) + (300 + 50 + 25 + ending + currentDeudaForMonth * 0.1 + utilidad) } },

          { concept: "INDICADORES COVENANT" },
          { concept: "Deuda Bruta", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth } },
          { concept: "Deuda Total", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth } },
          { concept: "Efectivo", values: { [`${nombresMeses[i]} ${year}`]: ending } },
          { concept: "Deuda Neta", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - ending } },
          { concept: "EBITDA R12", values: { [`${nombresMeses[i]} ${year}`]: ebitda * 12 } },
          { concept: "Apalancamiento (Deuda Total / EBITDA R12)", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth / (ebitda * 12) } },
          { concept: "Deuda Neta / EBITDA R12", values: { [`${nombresMeses[i]} ${year}`]: (currentDeudaForMonth - ending) / (ebitda * 12) } },
          { concept: "Capacidad de Pago", values: { [`${nombresMeses[i]} ${year}`]: (ebitda * 12) / (intereses * 12) } },
          { concept: "Razon Corriente", values: { [`${nombresMeses[i]} ${year}`]: (ending + (ingresos * 0.12) + (cogs * 0.20) + (ingresos * 0.02) + (opex * 0.05)) / ((cogs * 0.15) + 60 + 15 + 8 + 12) } }
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
        bancos: thisMonthBancos,
        dso: dso,
        dio: dio,
        dpo: dpo,
        ccc: ccc
      },

      wcFullRows: [
        { concept: "Cuentas por Cobrar (CxC)" },
        { concept: "  Clientes Locales", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.10 } },
        { concept: "  Clientes del Exterior", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.02 } },
        { concept: "  Total Cuentas por Cobrar", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.12 } },
        { isSpacer: true },
        
        { concept: "Inventarios" },
        { concept: "  Inventarios Producto 1", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.12 } },
        { concept: "    MP/ME", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.05 } },
        { concept: "    PT", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.06 } },
        { concept: "    Otros Inventarios", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "  Inventarios Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.08 } },
        { concept: "    MP/ME Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.03 } },
        { concept: "    PT Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.04 } },
        { concept: "    Otros Inventarios Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { isSpacer: true },
        
        { concept: "Costos Acumulados" },
        { concept: "  Costos Producto 1", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.60 } },
        { concept: "    Costo Producto 3", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.10 } },
        { concept: "    Costo Producto 4", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.15 } },
        { concept: "    Costo MP/ME", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.15 } },
        { concept: "    Costo PT", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.15 } },
        { concept: "    Costo Otros Inventarios", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.05 } },
        { concept: "  Costos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.40 } },
        { concept: "    Costo MP/ME Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.10 } },
        { concept: "    Costo PT Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.25 } },
        { concept: "    Costo Otros Inventarios Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.05 } },
        { isSpacer: true },

        { concept: "DIO" },
        { concept: "  DIO Producto 1", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.12) / (cogs * 0.60) } },
        { concept: "    DIO Producto 1 MP/ME", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.05) / (cogs * 0.15) } },
        { concept: "    DIO Producto 1 PT", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.06) / (cogs * 0.15) } },
        { concept: "    DIO Producto 1 Otros Inventarios", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.01) / (cogs * 0.05) } },
        { concept: "  DIO Producto 2", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.08) / (cogs * 0.40) } },
        { concept: "    DIO Producto 2 MP/ME", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.03) / (cogs * 0.10) } },
        { concept: "    DIO Producto 2 PT", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.04) / (cogs * 0.25) } },
        { concept: "    DIO Producto 2 Otros Inventarios", values: { [`${nombresMeses[i]} ${year}`]: 30 * (cogs * 0.01) / (cogs * 0.05) } },
        { isSpacer: true },

        { concept: "Otros Activos" },
        { concept: "  Otros Activos Producto 1", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.15 } },
        { concept: "    Impuestos", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.03 } },
        { concept: "    Activos Diferidos", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.02 } },
        { concept: "    Exhibidores y Mejoras en Terceros", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.05 } },
        { concept: "    Arrendamiento y Energía", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.02 } },
        { concept: "    Seguros y Fianzas", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.01 } },
        { concept: "    Depósitos y Garantías", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.01 } },
        { concept: "    ITBIS Pagado", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.01 } },
        { concept: "  Otros Activos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.10 } },
        { concept: "    Impuestos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.02 } },
        { concept: "    Activos Diferidos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.06 } },
        { concept: "    Seguros y Fianzas Producto 2", values: { [`${nombresMeses[i]} ${year}`]: opex * 0.02 } },
        { isSpacer: true },

        { concept: "Pasivos Acumulados" },
        { concept: "  Pasivos Acumulados Producto 1", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.10 } },
        { concept: "    Bono de Ley", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Bono de Desempeño", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Regalía", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Honorarios", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Cesantía", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Impuestos", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.02 } },
        { concept: "    Otros Pasivos Acumulados", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Gastos Navidad", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.005 } },
        { concept: "    Otras CxP", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { concept: "    Anticipos Clientes", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.005 } },
        { concept: "  Pasivos Acumulados Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.05 } },
        { concept: "    Impuestos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.02 } },
        { concept: "    Anticipos Clientes Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.02 } },
        { concept: "    Otras CxP Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.01 } },
        { isSpacer: true },

        { concept: "Total CxP", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.15 } },
        { concept: "  DOP", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.10 } },
        { concept: "  EUR", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.02 } },
        { concept: "  USD", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.03 } },
        { concept: "CxP en DOP", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.10 } },
        { concept: "CxP en EUR", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.02 } },
        { concept: "CxP en USD", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.03 } },
        { isSpacer: true },

        { concept: "Var tasa MoM USD", values: { [`${nombresMeses[i]} ${year}`]: 0.01 } },
        { concept: "Impacto de tasa Operacional", values: { [`${nombresMeses[i]} ${year}`]: 2.5 } },
        { concept: "Tasa USD", values: { [`${nombresMeses[i]} ${year}`]: tasaDolar } },
        { concept: "Tasa EUR", values: { [`${nombresMeses[i]} ${year}`]: parseFloat((tasaDolar * 1.075).toFixed(2)) } },
        { isSpacer: true },
        { concept: "Working Capital Neto", values: { [`${nombresMeses[i]} ${year}`]: (ingresos * 0.12) + (cogs * 0.20) - (cogs * 0.15) } },
        { isSpacer: true },
        { concept: "Indicadores (Días)" },
        { concept: "  DSO (Días de Cobro)", values: { [`${nombresMeses[i]} ${year}`]: ((ingresos * 0.12) / ingresos) * 30 } },
        { concept: "  DPO (Días de Pago)", values: { [`${nombresMeses[i]} ${year}`]: ((cogs * 0.15) / cogs) * 30 } },
        { concept: "  CCC (Ciclo de Conversión)", values: { [`${nombresMeses[i]} ${year}`]: (((ingresos * 0.12) / ingresos) * 30) + (((cogs * 0.20) / cogs) * 30) - (((cogs * 0.15) / cogs) * 30) } }
      ],
      
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
          "Producto 1": { ventas: ingresos * 0.55, costos: cogs * 0.55 },
          "Producto 2": { ventas: ingresos * 0.32, costos: cogs * 0.32 },
          "Producto 3": { ventas: ingresos * 0.10, costos: cogs * 0.10 },
          "Otros Ingresos": { ventas: ingresos * 0.03, costos: cogs * 0.03 }
        },
        fullRows: [
          {cuenta:"Ingresos Operativos",type:"Ingresos",concept: "Ventas Netas", values: { [`${nombresMeses[i]} ${year}`]: ingresos }},
          {cuenta:"Ingresos",type:"Ingresos",concept: "Descuento sobre ventas", values: { [`${nombresMeses[i]} ${year}`]: ingresos * -0.05 }},
          {cuenta:"Ingresos",type:"Ingresos",concept: "Devoluciones sobre ventas", values: { [`${nombresMeses[i]} ${year}`]: ingresos * -0.02 }},
          
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos Producto 1", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.55 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.32 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "  Costos Otros", values: { [`${nombresMeses[i]} ${year}`]: cogs * 0.13 }},
          {cuenta:"Costo de Ventas",type:"Costo de Ventas",concept: "Costo de Ventas", values: { [`${nombresMeses[i]} ${year}`]: cogs }},
          
          {cuenta:"Margen Bruto",type:"Margen Bruto",concept: "Utilidad Bruta", values: { [`${nombresMeses[i]} ${year}`]: margenBruto }},
          
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Gastos de Personal", values: { [`${nombresMeses[i]} ${year}`]: gAdminPersonal }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Seguros", values: { [`${nombresMeses[i]} ${year}`]: gAdminSeguros }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Servicios Basicos", values: { [`${nombresMeses[i]} ${year}`]: gAdminServicios }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Honorarios Profesionales", values: { [`${nombresMeses[i]} ${year}`]: gAdminHonorarios }},
          {cuenta:"Gastos Administrativos",type:"OPEX",concept: "Otros Gastos", values: { [`${nombresMeses[i]} ${year}`]: gAdminOtros }},
          
          {cuenta:"Gastos de Mercadeo",type:"OPEX",concept: "Mercadeo y Ventas", values: { [`${nombresMeses[i]} ${year}`]: gMercadeo }},
          {cuenta:"Gastos de Ventas",type:"OPEX",concept: "Gastos de Ventas (Comercial)", values: { [`${nombresMeses[i]} ${year}`]: gVentas }},
          {cuenta:"Gastos de Logística",type:"OPEX",concept: "Combustibles", values: { [`${nombresMeses[i]} ${year}`]: gLogistica * 0.6 }},
          {cuenta:"Gastos de Logística",type:"OPEX",concept: "Mantenimiento y Reparación", values: { [`${nombresMeses[i]} ${year}`]: gLogistica * 0.4 }},
          
          {cuenta:"Total GGADM", type:"OPEX",concept: "GGADM", values: { [`${nombresMeses[i]} ${year}`]: opex }},
          
          {cuenta:"Otros Ingresos",type:"Ingresos",concept: "Otros Ingresos Operacionales", values: { [`${nombresMeses[i]} ${year}`]: ingresos * 0.01 }},
          {cuenta:"EBITDA",type:"EBITDA",concept: "EBITDA", values: { [`${nombresMeses[i]} ${year}`]: ebitda + (ingresos * 0.01) }},
          
          {cuenta:"Depreciación y Amortización",type:"D&A",concept: "Depreciacion y Amortizacion Gasto", values: { [`${nombresMeses[i]} ${year}`]: daGasto }},
          {cuenta:"Depreciación y Amortización",type:"D&A",concept: "Depreciacion y Amortizacion Costo", values: { [`${nombresMeses[i]} ${year}`]: daCosto }},
          {cuenta:"Depreciación y Amortización",type:"D&A",concept: "Depreciación y Amortización", values: { [`${nombresMeses[i]} ${year}`]: da }},
          
          {cuenta:"EBIT", type:"EBIT",concept: "EBIT", values: { [`${nombresMeses[i]} ${year}`]: ebitda + (ingresos * 0.01) - da }},
          {cuenta:"Intereses Netos",type:"Financiero",concept: "Ingreso (gasto) de Interés", values: { [`${nombresMeses[i]} ${year}`]: intereses }},
          {cuenta:"Diferencial Cambiario",type:"Financiero",concept: "Diferencial Cambiario", values: { [`${nombresMeses[i]} ${year}`]: diferencialCambiario }},
          {cuenta:"Ingresos Extraordinarios",type:"Financiero",concept: "Gastos Extraordinarios", values: { [`${nombresMeses[i]} ${year}`]: 0 }},
          
          {cuenta:"EBT", type:"Utilidad",concept: "Ingreso Antes de Impuestos", values: { [`${nombresMeses[i]} ${year}`]: ebt }},
          {cuenta:"Impuestos", type:"Utilidad",concept: "Impuestos", values: { [`${nombresMeses[i]} ${year}`]: impuestos }},
          {cuenta:"Utilidad Neta",type:"Utilidad",concept: "Beneficio Neto", values: { [`${nombresMeses[i]} ${year}`]: utilidad }},
          
          {cuenta:"% Margen Bruto",type:"Margen Bruto",concept: "Gross margin", values: { [`${nombresMeses[i]} ${year}`]: margenBruto / ingresos }},
          {cuenta:"% Margen EBITDA",type:"EBITDA",concept: "EBITDA margin", values: { [`${nombresMeses[i]} ${year}`]: (ebitda + (ingresos * 0.01)) / ingresos }},
          {cuenta:"% Margen EBIT",type:"EBITDA",concept: "EBIT margin", values: { [`${nombresMeses[i]} ${year}`]: (ebit) / ingresos }},
          {cuenta:"% Margen Neto",type:"EBITDA",concept: "Margen Neto", values: { [`${nombresMeses[i]} ${year}`]: utilidad / ingresos }},
          {cuenta:"Tasa de Cierre",type:"Otros",concept: "Tasa de cierre USD", values: { [`${nombresMeses[i]} ${year}`]: tasaDolar }}
        ]
      },
      ppto: {
        kpis: {
          ingresos:  ppto,
          ebitda:    pptoEbitda,
          cashflow:  operating * 0.95,
          utilidad:  pptoUtilidad,
        },
        pnl: {
          categorias: {
            "Ingresos":          ppto,
            "Costo de Ventas":   pptoCogs,
            "Margen Bruto":      ppto - pptoCogs,
            "OPEX":              pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica,
            "EBITDA":            pptoEbitda,
            "Depreciación":      da,
            "EBIT":              pptoEbitda - da,
            "Impuestos":         (pptoEbitda - da - pptoIntereses) * 0.27,
            "Utilidad Neta":     pptoUtilidad,
          },
          segments: {
            "Producto 1": { ventas: ppto * 0.55, costos: pptoCogs * 0.55 },
            "Producto 2": { ventas: ppto * 0.32, costos: pptoCogs * 0.32 },
            "Producto 3": { ventas: ppto * 0.10, costos: pptoCogs * 0.10 },
            "Otros Ingresos": { ventas: ppto * 0.03, costos: pptoCogs * 0.03 },
          },
          opexDetalle: {
            "Gastos Administrativos": pptoGAdmin,
            "Gastos de Mercadeo":     pptoGMercadeo,
            "Gastos de Ventas (Comercial)": pptoGVentas,
            "Gastos de Logística":    pptoGLogistica,
          },
          fullRows: [
            { concept: "Ingresos Brutos", values: { [`${nombresMeses[i]} ${year}`]: ppto * 1.05 } },
            { concept: "  Descuentos", values: { [`${nombresMeses[i]} ${year}`]: ppto * -0.05 } },
            { concept: "Ventas Netas", values: { [`${nombresMeses[i]} ${year}`]: ppto } },
            { concept: "  Costos Producto 1", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs * 0.55 } },
            { concept: "  Costos Producto 2", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs * 0.32 } },
            { concept: "  Costos Otros", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs * 0.13 } },
            { concept: "Costo de Venta", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs } },
            { concept: "Margen Bruto", values: { [`${nombresMeses[i]} ${year}`]: ppto - pptoCogs } },
            { concept: "Gastos Administrativos", values: { [`${nombresMeses[i]} ${year}`]: pptoGAdmin } },
            { concept: "Gastos de Ventas (Comercial)", values: { [`${nombresMeses[i]} ${year}`]: pptoGVentas } },
            { concept: "Gastos de Mercadeo", values: { [`${nombresMeses[i]} ${year}`]: pptoGMercadeo } },
            { concept: "Gastos de Logistica", values: { [`${nombresMeses[i]} ${year}`]: pptoGLogistica } },
            { concept: "Total GGADM", values: { [`${nombresMeses[i]} ${year}`]: pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica } },
            { concept: "Otros Ingresos Operacionales", values: { [`${nombresMeses[i]} ${year}`]: ppto * 0.01 } },
            { concept: "EBITDA", values: { [`${nombresMeses[i]} ${year}`]: pptoEbitda + (ppto * 0.01) } },
            { concept: "Depreciacion", values: { [`${nombresMeses[i]} ${year}`]: da } },
            { concept: "EBIT", values: { [`${nombresMeses[i]} ${year}`]: pptoEbitda + (ppto * 0.01) - da } },
            { concept: "Intereses Netos", values: { [`${nombresMeses[i]} ${year}`]: pptoIntereses } },
            { concept: "Diferencial Cambiario", values: { [`${nombresMeses[i]} ${year}`]: ppto * 0.005 } },
            { concept: "Ingresos Extraordinarios", values: { [`${nombresMeses[i]} ${year}`]: 0 } },
            { concept: "EBT", values: { [`${nombresMeses[i]} ${year}`]: pptoEbitda + (ppto * 0.01) - da - pptoIntereses - (ppto * 0.005) } },
            { concept: "Impuestos Sobre la Renta", values: { [`${nombresMeses[i]} ${year}`]: impuestos } },
            { concept: "Utilidad Neta", values: { [`${nombresMeses[i]} ${year}`]: pptoUtilidad + (ppto * 0.01) - (ppto * 0.005) } },
            { concept: "% Margen Bruto", values: { [`${nombresMeses[i]} ${year}`]: (ppto - pptoCogs) / ppto } },
            { concept: "% Margen EBITDA", values: { [`${nombresMeses[i]} ${year}`]: (pptoEbitda + (ppto * 0.01)) / ppto } },
            { concept: "Tasa de Cierre", values: { [`${nombresMeses[i]} ${year}`]: tasaDolar - 0.5 } }
          ]
        },
        balance: {
          fullRows: [
          { concept: "ACTIVOS" },
          { concept: "  Activo Corriente" },
          { concept: "    Efectivo", values: { [`${nombresMeses[i]} ${year}`]: ending * 1.05 } },
          { concept: "    Efectivo y Equivalentes", values: { [`${nombresMeses[i]} ${year}`]: ending * 1.05 } },
          { concept: "    Cuentas por Cobrar", values: { [`${nombresMeses[i]} ${year}`]: ppto * 0.12 } },
          { concept: "    Inventarios", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs * 0.20 } },
          { concept: "    Cuentas por Cobrar Relacionadas", values: { [`${nombresMeses[i]} ${year}`]: ppto * 0.02 } },
          { concept: "    Cuentas por Cobrar Empleados", values: { [`${nombresMeses[i]} ${year}`]: (pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.01 } },
          { concept: "    Gastos Pagados por Adelantado", values: { [`${nombresMeses[i]} ${year}`]: (pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.05 } },
          { concept: "    Otros Activos Corrientes", values: { [`${nombresMeses[i]} ${year}`]: (pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.02 } },
          { concept: "  Total Activo Corriente", values: { [`${nombresMeses[i]} ${year}`]: (ending * 1.05) + (ppto * 0.12) + (pptoCogs * 0.20) + (ppto * 0.02) + ((pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.08) } },
          
          { concept: "  Activo No Corriente" },
          { concept: "    Activos Fijos Netos", values: { [`${nombresMeses[i]} ${year}`]: 422 } },
          { concept: "    Activos Intangibles", values: { [`${nombresMeses[i]} ${year}`]: 80 } },
          { concept: "    Depreciacion Acumulada", values: { [`${nombresMeses[i]} ${year}`]: -105 } },
          { concept: "    Inversiones a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 150 } },
          { concept: "    Impuestos Diferidos Activos", values: { [`${nombresMeses[i]} ${year}`]: 12 } },
          { concept: "    Otros Activos a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "  Total Activo No Corriente", values: { [`${nombresMeses[i]} ${year}`]: 422 + 80 - 105 + 150 + 12 + 25 } },
          { concept: "Total Activos", values: { [`${nombresMeses[i]} ${year}`]: (ending * 1.05) + (ppto * 0.12) + (pptoCogs * 0.20) + (ppto * 0.02) + ((pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.08) + 422 + 80 - 105 + 150 + 12 + 25 } },

          { concept: "PASIVOS" },
          { concept: "  Pasivo Corriente" },
          { concept: "    Cuentas por Pagar Bancarias", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "    Cuentas por Pagar Proveedores", values: { [`${nombresMeses[i]} ${year}`]: pptoCogs * 0.15 } },
          { concept: "    Deuda CP", values: { [`${nombresMeses[i]} ${year}`]: 60 } },
          { concept: "    Cuentas por Pagar Relacionadas", values: { [`${nombresMeses[i]} ${year}`]: 15 } },
          { concept: "    Retenciones y Acumulaciones por Pagar", values: { [`${nombresMeses[i]} ${year}`]: 8 } },
          { concept: "    Impuestos por Pagar", values: { [`${nombresMeses[i]} ${year}`]: 18 } },
          { concept: "    Beneficios a Empleados", values: { [`${nombresMeses[i]} ${year}`]: 12 } },
          { concept: "  Total Pasivo Corriente", values: { [`${nombresMeses[i]} ${year}`]: 25 + (pptoCogs * 0.15) + 60 + 15 + 8 + 18 + 12 } },
          
          { concept: "  Pasivo No Corriente" },
          { concept: "    Deuda LP", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - 60 } },
          { concept: "    Cuentas por Pagar Relacionadas LP", values: { [`${nombresMeses[i]} ${year}`]: 45 } },
          { concept: "    Impuestos Diferidos Pasivos", values: { [`${nombresMeses[i]} ${year}`]: 22 } },
          { concept: "    Provisiones a Largo Plazo", values: { [`${nombresMeses[i]} ${year}`]: 14 } },
          { concept: "  Total Pasivo No Corriente", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - 60 + 45 + 22 + 14 } },
          { concept: "Total Pasivos", values: { [`${nombresMeses[i]} ${year}`]: 25 + (pptoCogs * 0.15) + 60 + 15 + 8 + 18 + 12 + (currentDeudaForMonth - 60) + 45 + 22 + 14 } },

          { concept: "PATRIMONIO" },
          { concept: "  Capital Social", values: { [`${nombresMeses[i]} ${year}`]: 300 } },
          { concept: "  Prima en Emision de Acciones", values: { [`${nombresMeses[i]} ${year}`]: 50 } },
          { concept: "  Reserva Legal", values: { [`${nombresMeses[i]} ${year}`]: 25 } },
          { concept: "  Resultados Acumulados", values: { [`${nombresMeses[i]} ${year}`]: (ending + currentDeudaForMonth * 0.1) * 1.05 } },
          { concept: "  Beneficio Neto del Periodo", values: { [`${nombresMeses[i]} ${year}`]: pptoUtilidad } },
          { concept: "Total Patrimonio", values: { [`${nombresMeses[i]} ${year}`]: 300 + 50 + 25 + (ending + currentDeudaForMonth * 0.1) * 1.05 + pptoUtilidad } },
          { concept: "Total Pasivo y Patrimonio", values: { [`${nombresMeses[i]} ${year}`]: (25 + (pptoCogs * 0.15) + 60 + 15 + 8 + 18 + 12 + (currentDeudaForMonth - 60) + 45 + 22 + 14) + (300 + 50 + 25 + (ending + currentDeudaForMonth * 0.1) * 1.05 + pptoUtilidad) } },

          { concept: "INDICADORES COVENANT" },
          { concept: "Deuda Bruta", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth } },
          { concept: "Deuda Total", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth } },
          { concept: "Efectivo", values: { [`${nombresMeses[i]} ${year}`]: ending * 1.05 } },
          { concept: "Deuda Neta", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth - (ending * 1.05) } },
          { concept: "EBITDA R12", values: { [`${nombresMeses[i]} ${year}`]: pptoEbitda * 12 } },
          { concept: "Apalancamiento (Deuda Total / EBITDA R12)", values: { [`${nombresMeses[i]} ${year}`]: currentDeudaForMonth / (pptoEbitda * 12) } },
          { concept: "Deuda Neta / EBITDA R12", values: { [`${nombresMeses[i]} ${year}`]: (currentDeudaForMonth - (ending * 1.05)) / (pptoEbitda * 12) } },
          { concept: "Capacidad de Pago", values: { [`${nombresMeses[i]} ${year}`]: (pptoEbitda * 12) / (pptoIntereses * 12) } },
          { concept: "Razon Corriente", values: { [`${nombresMeses[i]} ${year}`]: ((ending * 1.05) + (ppto * 0.12) + (pptoCogs * 0.20) + (ppto * 0.02) + ((pptoGAdmin + pptoGMercadeo + pptoGVentas + pptoGLogistica) * 0.08)) / (25 + (pptoCogs * 0.15) + 60 + 15 + 8 + 18 + 12) } }
          ]
        }
      }
    };
    globalFinancialData.push(monthObj);
  }
}


/* ceoData generation */
const productosCeo = [
  { p: "CATEGORÍA 2.1", vb: 850, mb: 12.75, gr: 1.08 },
  { p: "CATEGORÍA 2.2", vb: 620, mb: 11.16, gr: 1.06 },
  { p: "CATEGORÍA 1", vb: 310, mb: 8.68, gr: 1.10 },
  { p: "CATEGORÍA 2.3.1", vb: 150, mb: 5.40, gr: 1.05 },
  { p: "CATEGORÍA 2.3.2", vb: 95, mb: 4.75, gr: 1.15 },
  { p: "CATEGORÍA 2.3.3", vb: 210, mb: 9.75, gr: 1.02 },
  { p: "CATEGORÍA 2.3.4", vb: 140, mb: 6.45, gr: 1.08 },
  { p: "CATEGORÍA 2.3.5", vb: 110, mb: 5.80, gr: 1.12 },
  { p: "CATEGORÍA 2.3.6", vb: 80, mb: 4.20, gr: 1.05 },
  { p: "CATEGORÍA 2.4", vb: 250, mb: 4.50, gr: 1.03 },
  { p: "CATEGORÍA 2.5", vb: 120, mb: 3.20, gr: 1.02 },
  { p: "CATEGORÍA 2.6.1", vb: 90, mb: 2.10, gr: 1.01 },
  { p: "CATEGORÍA 2.6.2", vb: 70, mb: 2.80, gr: 1.02 },
  { p: "CATEGORÍA 2.6.3", vb: 45, mb: 1.50, gr: 1.01 },
  { p: "CATEGORÍA 2.7.1", vb: 180, mb: 7.50, gr: 1.15 },
  { p: "CATEGORÍA 2.7.2", vb: 130, mb: 8.20, gr: 1.20 },
  { p: "CATEGORÍA 3", vb: 60, mb: 3.10, gr: 1.08 }
];
const estacionalidad = [0.92, 0.88, 0.97, 0.95, 1.00, 1.05, 1.03, 1.08, 1.05, 1.10, 1.15, 1.22];

const ceoData = [];

function createRow(prodName, tipo, id, parentId, hasChildren) {
    return { Producto: prodName, Tipo: tipo, id: id, parentId: parentId, hasChildren: hasChildren, values: {}, pptoValues: {}, FY2024: 0, PO26: 0 };
}

let rTotalVol = createRow("TOTAL COMPAÑÍA", "Volumen", `total-0`, null, true);
let rTotalMon = createRow("TOTAL COMPAÑÍA", "Monto (MM DOP)", `total-1`, null, true);
let rTotalPre = createRow("TOTAL COMPAÑÍA", "Precio Unitario", `total-2`, null, true);
rTotalPre._volRef = rTotalVol; rTotalPre._monRef = rTotalMon;
ceoData.push(rTotalVol, rTotalMon, rTotalPre);

let groupsList = [];
for(let i=0; i<3; i++) {
   let gVol = createRow(`GRUPO ${i+1}`, "Volumen", `g${i+1}-0`, "total-0", true);
   let gMon = createRow(`GRUPO ${i+1}`, "Monto (MM DOP)", `g${i+1}-1`, "total-1", true);
   let gPre = createRow(`GRUPO ${i+1}`, "Precio Unitario", `g${i+1}-2`, "total-2", true);
   gPre._volRef = gVol; gPre._monRef = gMon;
   groupsList.push({vol: gVol, mon: gMon, pre: gPre});
   ceoData.push(gVol, gMon, gPre);
}

let idCount = 0;
for (const prod of productosCeo) {
  idCount++;
  let gIdx = 1; 
  if (prod.p.includes("CATEGORÍA 1")) gIdx = 0;
  else if (prod.p.includes("CATEGORÍA 3")) gIdx = 2;
  
  let gVol = groupsList[gIdx].vol;
  let gMon = groupsList[gIdx].mon;
  let gPre = groupsList[gIdx].pre;

  let rowVol = createRow(prod.p, "Volumen", `p-${idCount}-0`, gVol.id, false);
  let rowMonto = createRow(prod.p, "Monto (MM DOP)", `p-${idCount}-1`, gMon.id, false);
  let rowPrecio = createRow(prod.p, "Precio Unitario", `p-${idCount}-2`, gPre.id, false);
  rowPrecio._volRef = rowVol; rowPrecio._monRef = rowMonto;
  
  let fyVol = 0, fyMon = 0, pptoVol = 0, pptoMon = 0;
  for (let m = 0; m < 12; m++) {
     let mesStr = `2026-${String(m+1).padStart(2, '0')}`;
     let mesStrY1 = `2025-${String(m+1).padStart(2, '0')}`;
     let e = estacionalidad[m];
     let v = prod.vb * e; 
     let mo = prod.mb * e;
     let vy1 = v * 0.9;
     let moy1 = mo * 0.9;

     rowVol.values[mesStr] = v;
     rowMonto.values[mesStr] = mo;
     rowVol.values[mesStrY1] = vy1;
     rowMonto.values[mesStrY1] = moy1;

     fyVol += vy1;
     fyMon += moy1;
     
     let pv = v * prod.gr;
     let pvm = mo * prod.gr;
     rowVol.pptoValues[mesStr] = pv;
     rowMonto.pptoValues[mesStr] = pvm;
     pptoVol += pv;
     pptoMon += pvm;
     
     // add to group
     gVol.values[mesStr] = (gVol.values[mesStr] || 0) + v;
     gMon.values[mesStr] = (gMon.values[mesStr] || 0) + mo;
     gVol.values[mesStrY1] = (gVol.values[mesStrY1] || 0) + vy1;
     gMon.values[mesStrY1] = (gMon.values[mesStrY1] || 0) + moy1;
     
     gVol.pptoValues[mesStr] = (gVol.pptoValues[mesStr] || 0) + pv;
     gMon.pptoValues[mesStr] = (gMon.pptoValues[mesStr] || 0) + pvm;
     
     // add to total
     rTotalVol.values[mesStr] = (rTotalVol.values[mesStr] || 0) + v;
     rTotalMon.values[mesStr] = (rTotalMon.values[mesStr] || 0) + mo;
     rTotalVol.values[mesStrY1] = (rTotalVol.values[mesStrY1] || 0) + vy1;
     rTotalMon.values[mesStrY1] = (rTotalMon.values[mesStrY1] || 0) + moy1;
     
     rTotalVol.pptoValues[mesStr] = (rTotalVol.pptoValues[mesStr] || 0) + pv;
     rTotalMon.pptoValues[mesStr] = (rTotalMon.pptoValues[mesStr] || 0) + pvm;
  }
  rowVol.FY2024 = fyVol; rowVol.PO26 = pptoVol;
  rowMonto.FY2024 = fyMon; rowMonto.PO26 = pptoMon;
  
  gVol.FY2024 += fyVol; gVol.PO26 += pptoVol;
  gMon.FY2024 += fyMon; gMon.PO26 += pptoMon;
  
  rTotalVol.FY2024 += fyVol; rTotalVol.PO26 += pptoVol;
  rTotalMon.FY2024 += fyMon; rTotalMon.PO26 += pptoMon;
  
  ceoData.push(rowVol, rowMonto, rowPrecio);
}

// Calculate ratios
for (let row of ceoData) {
   if (row.Tipo === "Precio Unitario" && row._volRef && row._monRef) {
       for(let k in row._volRef.values) {
           row.values[k] = row._volRef.values[k] ? row._monRef.values[k] / row._volRef.values[k] : 0;
       }
       for(let k in row._volRef.pptoValues) {
           row.pptoValues[k] = row._volRef.pptoValues[k] ? row._monRef.pptoValues[k] / row._volRef.pptoValues[k] : 0;
       }
       row.FY2024 = row._volRef.FY2024 ? row._monRef.FY2024 / row._volRef.FY2024 : 0;
       row.PO26 = row._volRef.PO26 ? row._monRef.PO26 / row._volRef.PO26 : 0;
   }
   // Clean up refs for JSON serialization
   delete row._volRef;
   delete row._monRef;
}

/* comercialData generation */
const canales = [
 {n:"Supermercados", w:0.35},
 {n:"Distribuidores", w:0.30},
 {n:"Canal Directo", w:0.20},
 {n:"Institucional", w:0.12},
 {n:"E-Commerce", w:0.03}
];
const rowsComercial = [];
// Para 5 canales x 5 productos x 12 meses
for (let c of canales) {
  for (let p of productosCeo) {
     for (let m=0; m<12; m++) {
        let e = estacionalidad[m];
        let mo = p.mb * e; // total company expected for this product
        let v = p.vb * e; // volume
        let baseIngreso = (mo * 1000000) * c.w; // let's scale to match 'monto' closely, maybe 1M scalar? Or keep actual numbers? 'Monto' above was in Millions. Let's multiply by 1M or keep real. Prompt says "Contribución = Ingresos * 0.38".
        // Keep it scaled, let's say "Ingresos" is actual values.
        let vItem = v * c.w;
        let cItem = baseIngreso * 0.38;
        
        rowsComercial.push({
           Mes: m+1, Year: 2026, Canal: c.n, Categoria: p.p, Volumen: vItem, Ingresos: baseIngreso, Contribucion: cItem
        });
        
        let vItem25 = vItem / p.gr;
        let baseIngreso25 = baseIngreso / p.gr;
        let cItem25 = baseIngreso25 * 0.38;

        rowsComercial.push({
           Mes: m+1, Year: 2025, Canal: c.n, Categoria: p.p, Volumen: vItem25, Ingresos: baseIngreso25, Contribucion: cItem25
        });
     }
  }
}
const comercialDataObj = {
  columns: ["Mes", "Year", "Canal", "Categoria", "Volumen", "Ingresos", "Contribucion"],
  rows: rowsComercial
};

const finalObj = {
  globalFinancialData,
  ceoData,
  comercialData: comercialDataObj,
  cxpStandaloneData: {}
};

// Generate cxpStandaloneData
const cxpLabels = [];
const cxpPeriods = [];
const cxpBalGen = [];
const cxpCXP = [];
const cxpProv = [];
const cxpCorriente = [];
const cxpAging = {
  "0_30": [], "31_60": [], "61_90": [], "91_120": [], "121_150": [], "151_180": [], "180Mas": []
};
const cxpTop14Names = Array.from({length: 14}, (_, i) => `Proveedor ${i + 1}`);
const cxpTop14Saldos = {};
cxpTop14Names.forEach(n => cxpTop14Saldos[n] = []);
const cxpOtros = [];
const cxpTotal = [];
const cxpCostosYTD = [];
const cxpDPO = [];

let cytd = 0;
for (let j = 0; j < 24; j++) {
  const is2026 = j >= 12;
  const i = is2026 ? j - 12 : j;
  const year = is2026 ? 2026 : 2025;
  const month = i + 1;
  const monthStr = month.toString().padStart(2, "0");
  
  cxpLabels.push(`${nombresMeses[i]}-${year}`);
  cxpPeriods.push(`${month}/${year}`);
  
  // Saldo CxP crece ligeramente durante el año, baja en Diciembre (pago navideño)
  const cxpSeasonality = [1.02,0.98,1.05,1.00,1.03,1.05,1.01,1.06,1.03,1.07,1.10,0.92];
  const baseVal = 310000000 * cxpSeasonality[i];
  cxpBalGen.push(baseVal);
  cxpCXP.push(baseVal * 0.95);
  cxpProv.push(baseVal * 0.05);
  cxpCorriente.push(baseVal * 0.50);
  
  cxpAging["0_30"].push(baseVal * 0.20);
  cxpAging["31_60"].push(baseVal * 0.15);
  cxpAging["61_90"].push(baseVal * 0.05);
  cxpAging["91_120"].push(baseVal * 0.03);
  cxpAging["121_150"].push(baseVal * 0.01);
  cxpAging["151_180"].push(baseVal * 0.005);
  cxpAging["180Mas"].push(baseVal * 0.005);
  
  // Costos acumulados crecen mes a mes proporcionalmente
  const costoBase = [82,80,86,83,87,90,88,93,90,95,100,88]; // en millones
  let currentCost = costoBase[i] * 1000000;
  if (i === 0) cytd = currentCost;
  else cytd += currentCost;
  cxpCostosYTD.push(cytd);
  cxpDPO.push(Math.round(baseVal / (cytd / 30)));
  
  let allocated = 0;
  cxpTop14Names.forEach((name, idx) => {
    let alloc = baseVal * (0.05 - (idx * 0.003));
    cxpTop14Saldos[name].push(alloc);
    allocated += alloc;
  });
  cxpOtros.push(baseVal - allocated);
  cxpTotal.push(baseVal);
}

finalObj.cxpStandaloneData = {
  labels: cxpLabels,
  periods: cxpPeriods,
  BalanceGeneral: cxpBalGen,
  CXP: cxpCXP,
  Provisionales: cxpProv,
  Corriente: cxpCorriente,
  Aging: cxpAging,
  Top14Names: cxpTop14Names,
  Top14Saldos: cxpTop14Saldos,
  OtrosProveedores: cxpOtros,
  Total: cxpTotal,
  CostosYTD: cxpCostosYTD,
  DPO: cxpDPO,
  _isObfuscated: true
};

fs.writeFileSync('./public/demo_data.json', JSON.stringify(finalObj, null, 2));

log("Done generating demo_data.json");
