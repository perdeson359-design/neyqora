# NEYQORA Mobile

Capacitor 7 tabanlı Android/iOS uygulama kabuğu.

- App ID: `com.neyqora.assistant`
- Production URL: `https://neyqora.kosseofficial.workers.dev`
- `NEYQORA_APP_URL` ile yalnızca HTTPS hedefi değiştirilebilir.
- Native özellik köprüsü: titreşim, paylaşım, kamera, dosya sistemi, klavye, ağ durumu, yerel bildirim ve push bildirimleri.
- `neyqora://open?view=chat-view` deep link'i uygulamayı ilgili görünüme yönlendirebilir.
- Android CI: debug APK + imzasız release AAB üretir.
- iOS CI: imzasız Simulator `.app` paketi üretir.
- CI, production `/api/health` endpoint'ini, Capacitor yapılandırmasını, native plugin sözleşmesini ve deep-link yapılandırmasını doğrular.

## Push bildirimleri

Uygulama açıldığında web köprüsü native Push Notifications API'sini kullanabilir. Gerçek cihaz push teslimatı için platform sağlayıcı yapılandırması ayrıca gerekir:

- Android: Firebase/FCM `google-services.json` ve uygulama Firebase projesine bağlanmalıdır.
- iOS: Apple Push Notification entitlement, APNs anahtarı/sertifikası ve imzalı provisioning profile gerekir.
- Gizli materyaller repoya eklenmez; GitHub Environment/Secrets üzerinden release pipeline'a aktarılır.

## Signed store release

`.github/workflows/mobile-release.yml` manuel bir mağaza release pipeline'ıdır. Varsayılan çalıştırmada Android/iOS yayınlamaz; yalnızca açıkça seçilen hedefi işler.

GitHub'da `mobile-release` Environment oluşturulmalı ve şu secret'lar eklenmelidir:

### Android

- `ANDROID_KEYSTORE_BASE64` — Play upload keystore'un base64 içeriği.
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — Play Console erişimi olan service account JSON.

Workflow:
1. Capacitor Android projesini üretir ve sync eder.
2. `com.neyqora.assistant` ve `neyqora://open` sözleşmesini uygular.
3. Keystore'u yalnızca runner üzerinde geçici olarak açar.
4. Signed AAB üretir ve `jarsigner` ile imzayı doğrular.
5. İstenen Play track'e yükler.

### iOS

- `IOS_CERTIFICATE_P12_BASE64` — Apple Distribution sertifikasını içeren `.p12`.
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64` — App Store dağıtım provisioning profile.
- `IOS_PROFILE_NAME`
- `APPLE_TEAM_ID`
- `APPLE_API_KEY_ID`
- `APPLE_API_ISSUER_ID`
- `APPLE_API_KEY_P8_BASE64` — App Store Connect API key `.p8` dosyasının base64 içeriği.

Workflow:
1. Capacitor iOS projesini üretir ve sync eder.
2. Signing certificate ve provisioning profile'ı geçici runner ortamına kurar.
3. Release archive oluşturur.
4. App Store Connect uyumlu signed IPA üretir.
5. `codesign --verify --deep --strict` ile imzayı doğrular.
6. İstenirse TestFlight'a yükler.

### Çalıştırma

GitHub Actions → **Mobile Release** → **Run workflow**:

- İlk Android doğrulaması için `android_track=internal`.
- iOS için `ios_upload=true`.
- `production` yalnızca internal test tamamlandıktan sonra kullanılmalıdır.
- `android_version_code` her Play release'te artırılmalıdır.
- `app_version` mağaza sürüm numarasıdır.

**Önemli:** Bu repository bağlantısından gerçek sertifika/keystore/Apple hesabı oluşturulamaz. Secret değerleri sohbet içine gönderilmemelidir. Bunlar GitHub Environment'a kullanıcı tarafından güvenli biçimde eklenmelidir. Secret'lar olmadan signed store artifact üretildiği iddia edilmez.

## Deep link

- Android intent filter: `neyqora://open`
- iOS URL scheme: `neyqora://`
- Örnek: `neyqora://open?view=chat-view`

Mağaza imzalama/sertifika bilgileri repoya konmaz.
