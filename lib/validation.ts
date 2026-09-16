/**
 * Validation email/password avec messages d'erreur.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email requis";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim())) return "Email invalide";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Mot de passe requis";
  if (password.length < 6) return "Minimum 6 caractères";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Nom requis";
  if (name.trim().length < 2) return "Minimum 2 caractères";
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return "Confirmation requise";
  if (password !== confirm) return "Les mots de passe ne correspondent pas";
  return null;
}
