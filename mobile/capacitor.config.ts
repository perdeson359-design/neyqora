import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = "https://neyqora.kosseofficial.workers.dev";
const appUrl = process.env.NEYQORA_APP_URL || productionUrl;
if (!/^https:\/\//.test(appUrl)) throw new Error("NEYQORA_APP_URL must use HTTPS");

const config: CapacitorConfig = {
  appId: "com.neyqora.assistant",
  appName: "NEYQORA",
  webDir: "web",
  server: {
    url: appUrl,
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["neyqora.kosseofficial.workers.dev"]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 350,
      launchAutoHide: true,
      backgroundColor: "#070b14"
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#070b14"
    }
  }
};

export default config;
