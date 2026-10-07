import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = "https://neyqora.kosseofficial.workers.dev";
const appUrl = process.env.NEYQORA_APP_URL || productionUrl;
let parsedUrl: URL;
try {
  parsedUrl = new URL(appUrl);
} catch {
  throw new Error("NEYQORA_APP_URL must be a valid URL");
}
if (parsedUrl.protocol !== "https:") throw new Error("NEYQORA_APP_URL must use HTTPS");

const config: CapacitorConfig = {
  appId: "com.neyqora.assistant",
  appName: "NEYQORA",
  webDir: "web",
  server: {
    url: parsedUrl.toString(),
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [parsedUrl.host]
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
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
