import { Alert, Platform } from "react-native";

/**
 * Affiche un dialogue de confirmation compatible web + natif.
 * Sur web : utilise window.confirm (les Alert.alert n'ont pas de boutons fonctionnels)
 * Sur natif : utilise Alert.alert classique
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", style: "destructive", onPress: onConfirm },
    ]);
  }
}
