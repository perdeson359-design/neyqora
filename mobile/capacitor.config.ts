import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.neyqora.assistant",
  appName: "NEYQORA",
  webDir: "web",
  server: {
    url: process.env.NEYQORA_APP_URL || "https://neyqora.kosseofficial.workers.dev",
    cleartext: false,
    androidScheme: "https"
  },
  plugins: {
    SplashScreen: { launchShowDuration: 350, launchAutoHide: true, backgroundColor: "#070b14" },
    StatusBar: { style: "DARK", backgroundColor: "#070b14" }
  }
};
export default config;
