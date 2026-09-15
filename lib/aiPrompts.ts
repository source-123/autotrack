import { Vehicle, Maintenance, Insurance, Inspection, Fuel, Currency } from "../types";
import { formatDate, formatMileage, formatMoney } from "./utils";

type Lang = "fr" | "ar";

/**
 * Construit le contexte complet de l'utilisateur pour l'IA.
 */
export function buildUserContext(
  vehicles: Vehicle[],
  maintenances: Maintenance[],
  insurances: Insurance[],
  inspections: Inspection[],
  fuels: Fuel[],
  currency: Currency
): string {
  if (vehicles.length === 0) {
    return "L'utilisateur n'a encore aucun véhicule enregistré.";
  }

  const lines: string[] = [];

  for (const v of vehicles) {
    lines.push(`=== VÉHICULE: ${v.brand} ${v.model} (${v.plate}) ===`);
    lines.push(`- Année: ${v.year}`);
    lines.push(`- Kilométrage actuel: ${formatMileage(v.mileage)}`);
    lines.push(`- Carburant: ${v.fuel}`);
    if (v.vin) lines.push(`- VIN: ${v.vin}`);

    // Entretiens
    const vm = maintenances.filter((m) => m.vehicleId === v.id);
    if (vm.length > 0) {
      lines.push(`\nEntretiens (${vm.length}):`);
      for (const m of vm.slice(0, 15)) {
        lines.push(`  - ${formatDate(m.date)} | ${m.type.replace("_", " ")} | ${formatMileage(m.mileage)} | ${formatMoney(m.cost, currency)}${m.garage ? " | " + m.garage : ""}${m.nextDueMileage ? " | Prochain: " + formatMileage(m.nextDueMileage) : ""}${m.nextDueDate ? " | Prochaine date: " + formatDate(m.nextDueDate) : ""}`);
      }
    }

    // Assurance
    const vi = insurances.filter((i) => i.vehicleId === v.id);
    if (vi.length > 0) {
      lines.push(`\nAssurances:`);
      for (const i of vi) {
        lines.push(`  - ${i.company} | ${formatDate(i.startDate)} → ${formatDate(i.endDate)} | ${formatMoney(i.cost, currency)} | ${i.type}`);
      }
    }

    // Visite technique
    const vv = inspections.filter((i) => i.vehicleId === v.id);
    if (vv.length > 0) {
      lines.push(`\nVisites techniques:`);
      for (const i of vv) {
        lines.push(`  - ${formatDate(i.date)} | Expire: ${formatDate(i.expiryDate)} | ${i.result === "pass" ? "Favorable" : "Défavorable"} | ${formatMoney(i.cost, currency)}`);
      }
    }

    // Carburant
    const vf = fuels.filter((f) => f.vehicleId === v.id);
    if (vf.length > 0) {
      const sorted = [...vf].sort((a, b) => a.mileage - b.mileage);
      let liters = 0;
      let km = 0;
      for (let i = 1; i < sorted.length; i++) {
        const d = sorted[i].mileage - sorted[i - 1].mileage;
        if (d > 0 && sorted[i].fullTank) {
          km += d;
          liters += sorted[i].liters;
        }
      }
      const conso = km > 0 ? (liters / km) * 100 : 0;
      const totalFuel = vf.reduce((s, f) => s + f.totalCost, 0);
      lines.push(`\nCarburant (${vf.length} pleins):`);
      lines.push(`  - Consommation moyenne: ${conso > 0 ? conso.toFixed(1) + " L/100km" : "non calculable"}`);
      lines.push(`  - Total dépensé carburant: ${formatMoney(totalFuel, currency)}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Prompt système pour l'Assistant IA (chat général).
 */
export function getAssistantPrompt(lang: Lang, userContext: string): string {
  if (lang === "ar") {
    return `أنت "أوتو"، مساعد ذكي متخصص في صيانة السيارات داخل تطبيق "كار أوتوتريك".

مهمتك: مساعدة المستخدم في متابعة وصيانة سيارته بطريقة بسيطة وودية.

قواعد مهمة:
1. أجب دائماً بالعربية الفصحى المبسطة.
2. استخدم المعلومات أدناه عن سيارات المستخدم للإجابة على أسئلته.
3. كن عملياً ومحدداً — لا تعطي إجابات عامة.
4. إذا سأل عن سعر، اذكر متوسط الأسعار في تونس بالدينار.
5. إذا لاحظت شيء مهم (موعد قريب، تكلفة مرتفعة، استهلاك غير طبيعي)، اذكره.
6. لا تفتري معلومات غير موجودة — إذا كنت لا تعرف، قل ذلك.
7. كن موجزاً: 2-4 جمل كافية عادة.
8. لا تذكر أنك ذكاء اصطناعي — تصرف كمساعد بشري خبير.

معلومات سيارات المستخدم:
${userContext}

تذكر: التطبيق مخصص للسوق التونسي.`;
  }

  return `Tu es "Auto", un assistant intelligent expert en entretien automobile dans l'app "Car Autotrack".

Ton rôle : aider l'utilisateur à suivre et entretenir son véhicule de manière simple et amicale.

Règles importantes :
1. Réponds TOUJOURS en français.
2. Utilise les informations ci-dessous sur les véhicules de l'utilisateur pour répondre.
3. Sois pratique et spécifique — pas de réponses vagues.
4. Si on te demande un prix, donne des ordres de grandeur en DT (Tunisie).
5. Si tu remarques quelque chose d'important (échéance proche, coût élevé, conso anormale), mentionne-le.
6. N'invente pas d'infos — si tu ne sais pas, dis-le.
7. Sois concis : 2-4 phrases suffisent généralement.
8. Ne mentionne pas que tu es une IA — comporte-toi comme un assistant humain expert.

Informations sur les véhicules de l'utilisateur :
${userContext}

Rappel : l'app est pour le marché tunisien.`;

}

/**
 * Prompt pour la prédiction IA (analyse d'un véhicule).
 */
export function getPredictionPrompt(lang: Lang): string {
  if (lang === "ar") {
    return `أنت خبير تشخيص سيارات. ستحصل على بيانات كاملة عن سيارة واحدة.
حلّل البيانات وأعطني تقريراً منظماً بهذا الشكل بالضبط:

1. **الحالة العامة** (سطر واحد)
2. **⚠️ تنبيهات عاجلة** (2-3 نقاط كحد أقصى)
3. **📅 مواعيد قادمة** (بناءً على العداد والتواريخ)
4. **💰 توقعات المصروفات** للسنة القادمة
5. **💡 نصيحة** (واحدة فقط، الأهم)

كن واقعياً. استخدم أرقام حقيقية من البيانات. لا تخترع معلومات.`;
  }

  return `Tu es un expert en diagnostic automobile. Tu vas recevoir les données complètes d'un véhicule.
Analyse ces données et donne un rapport structuré EXACTEMENT au format suivant en français :

1. **État général** (une seule ligne)
2. **⚠️ Alertes importantes** (2-3 points max, les plus critiques)
3. **📅 Prochaines échéances** (basées sur le km et les dates)
4. **💰 Prévisions de coûts** pour l'année à venir
5. **💡 Conseil** (un seul, le plus important)

Sois réaliste. Utilise les chiffres réels des données. N'invente rien.`;
}
