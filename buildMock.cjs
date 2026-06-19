const fs = require("fs");
const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const globalFinancialData = [];

let baseCash = 5.0;
let baseDeudaTotal = 12.0;

for (let i = 0; i < 12; i++) {
  const ingresos = 10.0 + Math.random() * 2.0;
  const pptoIngresos = 10.5;
  const realIngresos = ingresos;
  const varIngresos = ingresos / pptoIngresos - 1;
  const cogs = ingresos * 0.4;
  const margenBruto = ingresos - cogs;
  const opex = ingresos * 0.25;
  const ebitda = margenBruto - opex;
  const utilidadNeta = ebitda * 0.6;
  const ebitdaRate = ebitda / ingresos;

  const opCash = ebitda * 0.8;
  const invCash = -1.0;
  const finCash = -0.5;
  const cashNet = opCash + invCash + finCash;
  baseCash += cashNet;

  baseDeudaTotal -= 0.2;

  globalFinancialData.push({
    date: `${months[i]} 2026`,
    Periodo: `${String(i + 1).padStart(2, "0")}-2026`,
    sortDate: new Date(2026, i, 1).toISOString(),
    kpis: {
      ingresos,
      ebitda,
      cashflow: cashNet,
      utilidadNeta,
      margenBruto: margenBruto / ingresos,
      realIngresos,
      pptoIngresos,
      varIngresos,
      ebitdaRate,
      realEbitda: ebitda,
      pptoEbitda: ebitda * 0.95,
    },
    trend: { ingresos, ebitda, cashflow: cashNet, utilidadNeta },
    balance: {
      deudaTotal: baseDeudaTotal,
      ebitdaLTM: ebitda * 12,
      efectivo: baseCash,
      roa: 0.15,
      roe: 0.2,
      ccc: 45,
    },
    cashflowDetail: {
      ending: baseCash,
      ops: opCash,
      inv: invCash,
      fin: finCash,
      beg: baseCash - cashNet,
    },
    pnl: {
      categorias: {
        Ingresos: ingresos,
        "Costo de Ventas": cogs,
        "Margen Bruto": margenBruto,
        OPEX: opex,
        EBITDA: ebitda,
        Depreciación: ebitda * 0.1,
        EBIT: ebitda * 0.9,
        Impuestos: ebitda * 0.15,
        "Utilidad Neta": utilidadNeta,
      },
      opexDetalle: {
        "Gastos Administrativos": opex * 0.4,
        "Gastos de Mercadeo": opex * 0.4,
        "Gastos Generales": opex * 0.2,
      },
      segments: {
        "Producto 1": ingresos * 0.4,
        "Producto 2": ingresos * 0.2,
        "Producto 3": ingresos * 0.2,
        "Producto 4": ingresos * 0.1,
        "Producto 5": ingresos * 0.1,
      },
      fullRows: [
        {
          cuenta: "Ingresos Operativos",
          type: "Ingresos",
          Real: ingresos,
          PPTO: pptoIngresos,
          AA: ingresos * 0.9,
          YoY: 0.1,
          PPTO_Var: 0.05,
        },
        {
          cuenta: "Costo Directo",
          type: "Costo de Ventas",
          Real: cogs,
          PPTO: cogs * 1.05,
          AA: cogs * 0.9,
          YoY: 0.1,
          PPTO_Var: 0.05,
        },
        {
          cuenta: "Sueldos y Salarios",
          type: "OPEX",
          Real: opex * 0.4,
          PPTO: opex * 0.4,
          AA: opex * 0.35,
          YoY: 0.1,
          PPTO_Var: 0.05,
        },
      ],
    },
    _isMock: true,
  });
}

const ceoData = [
  {
    Producto: "Total Portafolio",
    Tipo: "Volumen",
    id: "Total_Portafolio",
    parentId: null,
    hasChildren: true,
    values: {},
    pptoValues: {},
    FY2024: 0,
    PO26: 0,
  },
  {
    Producto: "Total Portafolio",
    Tipo: "Monto",
    id: "Total_Portafolio",
    parentId: null,
    hasChildren: true,
    values: {},
    pptoValues: {},
    FY2024: 0,
    PO26: 0,
  },
];

const productBases = [
  { name: "Producto 1", baseVol: 3.0, baseMonto: 30.0, growth: 1.1 },
  { name: "Producto 2", baseVol: 2.5, baseMonto: 25.0, growth: 1.05 },
  { name: "Producto 3", baseVol: 1.0, baseMonto: 10.0, growth: 1.08 },
  { name: "Producto 4", baseVol: 0.5, baseMonto: 5.0, growth: 1.15 },
  { name: "Producto 5", baseVol: 0.3, baseMonto: 3.0, growth: 1.2 },
];

productBases.forEach((pb, idx) => {
  ceoData.push({
    Producto: pb.name,
    Tipo: "Volumen",
    id: pb.name.replace(/[^a-zA-Z0-9]/g, "_"),
    parentId: "Total_Portafolio",
    hasChildren: false,
    values: {},
    pptoValues: {},
    FY2024: Math.round(pb.baseVol * 12 * 0.9),
    PO26: Math.round(pb.baseVol * 12 * pb.growth),
  });
  ceoData.push({
    Producto: pb.name,
    Tipo: "Monto",
    id: pb.name.replace(/[^a-zA-Z0-9]/g, "_"),
    parentId: "Total_Portafolio",
    hasChildren: false,
    values: {},
    pptoValues: {},
    FY2024: Math.round(pb.baseMonto * 12 * 0.9),
    PO26: Math.round(pb.baseMonto * 12 * pb.growth),
  });
});

for (let i = 0; i < 12; i++) {
  const key = `2026-${String(i + 1).padStart(2, "0")}`;

  let totalVol = 0;
  let totalVolPpto = 0;
  let totalMonto = 0;
  let totalMontoPpto = 0;

  productBases.forEach((pb, idx) => {
    const volIdx = 2 + idx * 2;
    const montoIdx = 3 + idx * 2;

    const v = pb.baseVol + Math.random() * (pb.baseVol * 0.2);
    const vp = pb.baseVol * pb.growth;
    const m = pb.baseMonto + Math.random() * (pb.baseMonto * 0.2);
    const mp = pb.baseMonto * pb.growth;

    ceoData[volIdx].values[key] = v;
    ceoData[volIdx].pptoValues[key] = vp;
    ceoData[montoIdx].values[key] = m;
    ceoData[montoIdx].pptoValues[key] = mp;

    totalVol += v;
    totalVolPpto += vp;
    totalMonto += m;
    totalMontoPpto += mp;
  });

  // Totals
  ceoData[0].values[key] = totalVol;
  ceoData[0].pptoValues[key] = totalVolPpto;
  ceoData[1].values[key] = totalMonto;
  ceoData[1].pptoValues[key] = totalMontoPpto;
}

const comercialData = [];
const canales = ["Supermercados", "Distribuidores", "Directo", "E-commerce"];
const productos = [
  "Producto 1",
  "Producto 2",
  "Producto 3",
  "Producto 4",
  "Producto 5",
];

for (let i = 0; i < 12; i++) {
  canales.forEach((canal) => {
    productos.forEach((prod) => {
      comercialData.push({
        Mes: i + 1,
        Year: 2026,
        Canal: canal,
        Categoria: prod,
        Volumen: 5.0 + Math.random() * 2.0,
        Ingresos: 1.0 + Math.random() * 0.5,
        Contribucion: 0.2 + Math.random() * 0.1,
      });
    });
  });
}

const demoData = {
  globalFinancialData,
  ceoData,
  comercialData: {
    columns: Object.keys(comercialData[0]),
    rows: comercialData,
  },
};

fs.writeFileSync("public/demo_data.json", JSON.stringify(demoData, null, 2));
console.log("Done");
