import { LogBox } from "react-native";

LogBox.ignoreLogs([
  // Expo Router : GO_BACK sans historique (inoffensif)
  "The action 'GO_BACK' was not handled by any navigator",

  // Notifications sur web
  "[expo-notifications] Listening to push token changes is not yet fully supported on web",

  // Style shadow déprécié (web uniquement)
  '"shadow*" style props are deprecated',

  // Accessibilité web
  "Blocked aria-hidden",

  // React Native Web
  "Cannot record touch end without a touch start",

  // Images lazy (Chrome)
  "[Intervention] Images loaded lazily",
]);
