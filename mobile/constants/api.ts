import Constants from "expo-constants";

const debuggerHost =
  Constants.expoConfig?.hostUri ||
  Constants.manifest?.debuggerHost;

const host = debuggerHost?.split(":").shift();

export const API_URL = `http://${host}:5000/api`;