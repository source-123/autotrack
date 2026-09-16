import { LogBox } from "react-native";

LogBox.ignoreLogs([
  // Expo Router
  "The action 'GO_BACK' was not handled by any navigator",

  // Notifications web
  "[expo-notifications] Listening to push token changes is not yet fully supported on web",

  // Styles dépréciés web
  '"shadow*" style props are deprecated',

  // Accessibilité web
  "Blocked aria-hidden",

  // Touch events web
  "Cannot record touch end without a touch start",

  // Images lazy loading
  "[Intervention] Images loaded lazily",

  // Animated sur web
  "Animated: `useNativeDriver` is not supported",

  // Firebase / Google Sign-In sur Codespaces (COOP)
  "Cross-Origin-Opener-Policy policy would block the window.closed call",
]);
