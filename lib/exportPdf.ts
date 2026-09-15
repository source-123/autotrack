import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import {
  Vehicle, Maintenance, Insurance, Inspection, Fuel, VehicleDocument, Currency,
} from "../types";
import { formatDate, formatMileage, formatMoney, currencySymbol } from "./utils";

type Lang = "fr" | "ar";

type ExportData = {
  vehicle: Vehicle;
  maintenances: Maintenance[];
  insurances: Insurance[];
  inspections: Inspection[];
  fuels: Fuel[];
  documents: VehicleDocument[];
  currency: Currency;
  language: Lang;
};

const LABELS = {
  fr: {
    title: "CARNET D'ENTRETIEN",
    subtitle: "Historique complet du véhicule",
    brand: "Marque",
    year: "Année",
    plate: "Immatriculation",
    mileage: "Kilométrage",
    fuel: "Carburant",
    totalSpent: "Total dépensé",
    entries: "Entrées totales",
    avgConsumption: "Consommation moyenne",
    maintenance: "Entretiens",
    insurance: "Assurances",
    inspection: "Visites techniques",
    fuelSection: "Pleins de carburant",
    documents: "Documents",
    date: "Date",
    type: "Type",
    cost: "Coût",
    garage: "Garage",
    km: "Km",
    company: "Compagnie",
    endDate: "Fin",
    result: "Résultat",
    startDate: "Début",
    liters: "Litres",
    pricePerLiter: "Prix/L",
    category: "Catégorie",
    expiry: "Expiration",
    generatedOn: "Généré le",
    noEntries: "Aucune entrée",
    confidential: "Document confidentiel",
    ok: "Favorable",
    ko: "Défavorable",
    liters100km: "L/100km",
  },
  ar: {
    title: "سجل الصيانة",
    subtitle: "التاريخ الكامل للسيارة",
    brand: "الماركة",
    year: "السنة",
    plate: "اللوحة",
    mileage: "العداد",
    fuel: "الوقود",
    totalSpent: "إجمالي المصروف",
    entries: "إجمالي الإدخالات",
    avgConsumption: "متوسط الاستهلاك",
    maintenance: "الصيانة",
    insurance: "التأمين",
    inspection: "الفحص الفني",
    fuelSection: "تعبات الوقود",
    documents: "المستندات",
    date: "التاريخ",
    type: "النوع",
    cost: "التكلفة",
    garage: "الورشة",
    km: "كم",
    company: "الشركة",
    endDate: "النهاية",
    result: "النتيجة",
    startDate: "البداية",
    liters: "لترات",
    pricePerLiter: "السعر/لتر",
    category: "الفئة",
    expiry: "الانتهاء",
    generatedOn: "تم الإنشاء في",
    noEntries: "لا توجد إدخالات",
    confidential: "مستند سري",
    ok: "مقبول",
    ko: "مرفوض",
    liters100km: "لتر/100كم",
  },
};

function esc(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Convertit une URL d'image en base64 pour l'inclure dans le PDF
 * (résout les problèmes CORS sur ImgBB / Firebase Storage)
 */
async function imageToBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Impossible de convertir l'image en base64:", e);
    return null;
  }
}

function buildHtml(data: ExportData, photoBase64: string | null): string {
  const { vehicle, maintenances, insurances, inspections, fuels, documents, currency, language } = data;
  const L = LABELS[language];
  const sym = currencySymbol(currency);
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const align = isRTL ? "right" : "left";

  const totalSpent =
    maintenances.reduce((s, m) => s + m.cost, 0) +
    insurances.reduce((s, i) => s + i.cost, 0) +
    inspections.reduce((s, i) => s + i.cost, 0) +
    fuels.reduce((s, f) => s + f.totalCost, 0);

  const totalEntries =
    maintenances.length + insurances.length + inspections.length + fuels.length + documents.length;

  const sortedFuels = [...fuels].sort((a, b) => a.mileage - b.mileage);
  let totalLiters = 0;
  let totalKm = 0;
  for (let i = 1; i < sortedFuels.length; i++) {
    const km = sortedFuels[i].mileage - sortedFuels[i - 1].mileage;
    if (km > 0 && sortedFuels[i].fullTank) {
      totalKm += km;
      totalLiters += sortedFuels[i].liters;
    }
  }
  const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;

  const fmtMoney = (v: number) => `${v.toLocaleString("fr-FR")} ${sym}`;

  const tableHTML = (headers: string[], rows: (string | number)[][]) => {
    if (rows.length === 0) return "";
    return `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `;
  };

  const maintenanceRows = [...maintenances]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((m) => [
      formatDate(m.date),
      esc(m.type.replace("_", " ")),
      formatMileage(m.mileage),
      fmtMoney(m.cost),
      esc(m.garage || "-"),
    ]);

  const insuranceRows = [...insurances]
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
    .map((i) => [esc(i.company), formatDate(i.startDate), formatDate(i.endDate), fmtMoney(i.cost)]);

  const inspectionRows = [...inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((i) => [
      formatDate(i.date),
      formatDate(i.expiryDate),
      `<span class="badge ${i.result === "pass" ? "ok" : "ko"}">${i.result === "pass" ? L.ok : L.ko}</span>`,
      fmtMoney(i.cost),
    ]);

  const fuelRows = [...fuels]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50)
    .map((f) => [
      formatDate(f.date),
      formatMileage(f.mileage),
      `${f.liters} L`,
      `${f.pricePerLiter} ${sym}`,
      fmtMoney(f.totalCost),
    ]);

  const documentRows = documents.map((d) => [
    formatDate(d.date),
    esc(d.title),
    esc(d.category.replace("_", " ")),
    d.expiryDate ? formatDate(d.expiryDate) : "-",
  ]);

  // Image à utiliser : base64 en priorité, sinon URL directe
  const photoSrc = photoBase64 || vehicle.photoUri || "";

  return `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${language}">
    <head>
      <meta charset="utf-8" />
      <title>${L.title} - ${vehicle.plate}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
          font-size: 11px;
          line-height: 1.5;
          direction: ${dir};
          text-align: ${align};
          padding: 20px 24px;
          background: #ffffff;
        }

        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 14px;
          margin-bottom: 22px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-left h1 {
          color: #2563eb;
          font-size: 22px;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 800;
        }
        .header-left .sub { color: #64748b; font-size: 11px; }
        .header-right { text-align: ${isRTL ? "left" : "right"}; }
        .header-right .brand {
          color: #2563eb;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .header-right .brand span { color: #dc2626; }
        .header-right .date {
          color: #94a3b8;
          font-size: 9px;
          margin-top: 3px;
        }

        .vehicle-hero {
          display: flex;
          gap: 16px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          align-items: center;
        }
        .vehicle-hero .photo {
          width: 160px;
          height: 110px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          flex-shrink: 0;
          display: block;
        }
        .vehicle-hero .info { flex: 1; }
        .vehicle-hero .name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .vehicle-hero .plate {
          display: inline-block;
          background: #1e293b;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .vehicle-hero .meta { color: #475569; font-size: 11px; margin-top: 4px; }
        .vehicle-hero .meta strong { color: #0f172a; }

        .summary { display: flex; gap: 10px; margin-bottom: 24px; }
        .summary-card {
          flex: 1;
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
        }
        .summary-card .label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .summary-card .value {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .summary-card.primary {
          background: #2563eb;
          border-color: #2563eb;
        }
        .summary-card.primary .label { color: #bfdbfe; }
        .summary-card.primary .value { color: #ffffff; }

        h2 {
          color: #0f172a;
          font-size: 13px;
          font-weight: 800;
          margin: 22px 0 10px;
          padding: 6px 12px;
          background: #f1f5f9;
          border-${isRTL ? "right" : "left"}: 4px solid #2563eb;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h2 .count {
          font-size: 10px;
          background: #2563eb;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }
        thead { background: #0f172a; }
        th {
          color: #ffffff;
          text-align: ${align};
          padding: 8px 10px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        td {
          padding: 7px 10px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        tbody tr:nth-child(even) td { background: #fafbfc; }
        tbody tr:last-child td { border-bottom: none; }

        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .badge.ok { background: #d1fae5; color: #047857; }
        .badge.ko { background: #fee2e2; color: #b91c1c; }

        .empty {
          text-align: center;
          color: #94a3b8;
          padding: 18px;
          font-style: italic;
          font-size: 10px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 6px;
        }

        .footer {
          margin-top: 32px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 9px;
          color: #94a3b8;
        }
        .footer .logo {
          color: #2563eb;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 3px;
        }

        .section-block { page-break-inside: avoid; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>

      <div class="header">
        <div class="header-left">
          <h1>${L.title}</h1>
          <div class="sub">${L.subtitle}</div>
        </div>
        <div class="header-right">
          <div class="brand">CAR <span>AUTOTRACK</span></div>
          <div class="date">${L.generatedOn} ${new Date().toLocaleDateString("fr-FR")}</div>
        </div>
      </div>

      <div class="vehicle-hero">
        ${photoSrc ? `<img class="photo" src="${photoSrc}" alt="vehicle" />` : ""}
        <div class="info">
          <div class="name">${esc(vehicle.brand)} ${esc(vehicle.model)}</div>
          <div class="plate">${esc(vehicle.plate)}</div>
          <div class="meta">${L.year}: <strong>${vehicle.year}</strong> &nbsp;•&nbsp; ${L.mileage}: <strong>${formatMileage(vehicle.mileage)}</strong></div>
          <div class="meta">${L.fuel}: <strong>${esc(vehicle.fuel)}</strong>${vehicle.vin ? ` &nbsp;•&nbsp; VIN: <strong>${esc(vehicle.vin)}</strong>` : ""}</div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-card primary">
          <div class="label">${L.totalSpent}</div>
          <div class="value">${fmtMoney(totalSpent)}</div>
        </div>
        <div class="summary-card">
          <div class="label">${L.entries}</div>
          <div class="value">${totalEntries}</div>
        </div>
        ${avgConsumption > 0 ? `
        <div class="summary-card">
          <div class="label">${L.avgConsumption}</div>
          <div class="value">${avgConsumption.toFixed(1)} ${L.liters100km}</div>
        </div>` : ""}
      </div>

      <div class="section-block">
        <h2><span>🔧 ${L.maintenance}</span><span class="count">${maintenances.length}</span></h2>
        ${maintenanceRows.length > 0 ? tableHTML([L.date, L.type, L.km, L.cost, L.garage], maintenanceRows) : `<div class="empty">${L.noEntries}</div>`}
      </div>

      <div class="section-block">
        <h2><span>🛡️ ${L.insurance}</span><span class="count">${insurances.length}</span></h2>
        ${insuranceRows.length > 0 ? tableHTML([L.company, L.startDate, L.endDate, L.cost], insuranceRows) : `<div class="empty">${L.noEntries}</div>`}
      </div>

      <div class="section-block">
        <h2><span>📋 ${L.inspection}</span><span class="count">${inspections.length}</span></h2>
        ${inspectionRows.length > 0 ? tableHTML([L.date, L.expiry, L.result, L.cost], inspectionRows) : `<div class="empty">${L.noEntries}</div>`}
      </div>

      ${fuels.length > 0 ? `
      <div class="section-block">
        <h2><span>⛽ ${L.fuelSection}</span><span class="count">${fuels.length}</span></h2>
        ${tableHTML([L.date, L.km, L.liters, L.pricePerLiter, L.cost], fuelRows)}
        ${fuels.length > 50 ? `<div class="empty">+ ${fuels.length - 50} ${L.noEntries}</div>` : ""}
      </div>` : ""}

      ${documents.length > 0 ? `
      <div class="section-block">
        <h2><span>📄 ${L.documents}</span><span class="count">${documents.length}</span></h2>
        ${tableHTML([L.date, L.type, L.category, L.expiry], documentRows)}
      </div>` : ""}

      <div class="footer">
        <div class="logo">CAR AUTOTRACK</div>
        <div>${L.confidential} • ${new Date().getFullYear()}</div>
      </div>

    </body>
    </html>
  `;
}

export async function exportVehicleToPdf(data: ExportData): Promise<void> {
  // 1. Convertir la photo en base64 pour qu'elle s'affiche même sans CORS
  let photoBase64: string | null = null;
  if (data.vehicle.photoUri) {
    photoBase64 = await imageToBase64(data.vehicle.photoUri);
  }

  // 2. Générer le HTML avec la photo
  const html = buildHtml(data, photoBase64);

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (!win) {
      throw new Error("Popup bloquée. Autorise les popups pour ce site.");
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 800);
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: LABELS[data.language].title,
      UTI: "com.adobe.pdf",
    });
  }
}
