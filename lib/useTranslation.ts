import { useStore } from "./store";
import { translate, Lang, TranslationKey } from "./i18n";

/**
 * Hook de traduction. Utilise la langue du store (fr ou ar).
 * Usage : const { t, lang } = useTranslation();
 *         t("loginButton") => "Se connecter" ou "دخول"
 */
export function useTranslation() {
  const lang = useStore((s) => s.language) as Lang;

  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);

  return { t, lang, isRTL: lang === "ar" };
}
