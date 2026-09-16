/**
 * ⚙️ CONFIGURATION PREMIUM
 * Modifie ici le numéro WhatsApp et les prix
 */

export const PREMIUM_CONFIG = {
  // 📱 Numéro WhatsApp (format international sans + ni espaces)
  whatsappNumber: "21622310333",
  
  // 💰 Prix (en DT - Dinar Tunisien)
  prices: {
    monthly: 15,
    yearly: 99,
    lifetime: 199,
  },
  
  // 🎨 Couleurs
  colors: {
    gold: "#f59e0b",
    goldDark: "#b45309",
    green: "#10b981",
  },
};

/**
 * Ouvre WhatsApp avec un message pré-rempli pour contacter le support.
 */
export function buildWhatsAppUrl(
  userEmail: string,
  plan: "monthly" | "yearly" | "lifetime" | "info",
  language: "fr" | "ar"
) {
  const planNames = {
    monthly: language === "ar" ? "شهري" : "Mensuel",
    yearly: language === "ar" ? "سنوي" : "Annuel",
    lifetime: language === "ar" ? "مدى الحياة" : "À vie",
    info: language === "ar" ? "معلومات" : "Informations",
  };

  const planPrices = {
    monthly: PREMIUM_CONFIG.prices.monthly,
    yearly: PREMIUM_CONFIG.prices.yearly,
    lifetime: PREMIUM_CONFIG.prices.lifetime,
    info: 0,
  };

  const message =
    language === "ar"
      ? `مرحباً، أريد تفعيل النسخة المميزة من Car Autotrack.

📧 حسابي: ${userEmail}
💰 الخطة: ${planNames[plan]} - ${planPrices[plan] > 0 ? planPrices[plan] + " دينار" : "استفسار"}

يرجى إرسال تفاصيل الدفع. شكراً!`
      : `Bonjour, je souhaite activer la version Premium de Car Autotrack.

📧 Mon compte : ${userEmail}
💰 Formule : ${planNames[plan]} - ${planPrices[plan] > 0 ? planPrices[plan] + " DT" : "Demande d'info"}

Merci de m'envoyer les détails de paiement !`;

  return `https://wa.me/${PREMIUM_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Vérifie si l'utilisateur est Premium.
 */
export function isPremium(_user: any): boolean {
  return false;
}
