import { LogBox } from "react-native";

// Warning connu et inoffensif : Expo Router tente un GO_BACK sans historique
// (arrive surtout sur web après redirection d'authentification)
LogBox.ignoreLogs([
  "The action 'GO_BACK' was not handled by any navigator",
  "Non-serializable values were found in the navigation state",
]);
