# NEYQORA Mobile

Capacitor 7 tabanlı Android/iOS uygulama kabuğu.

- App ID: `com.neyqora.assistant`
- Production URL: `https://neyqora.kosseofficial.workers.dev`
- `NEYQORA_APP_URL` ile yalnızca HTTPS hedefi değiştirilebilir.
- Native özellik köprüsü: titreşim, paylaşım, kamera, dosya sistemi, klavye, ağ durumu, yerel bildirim ve push bildirimleri.
- `neyqora://open?view=chat-view` deep link'i uygulamayı ilgili görünüme yönlendirebilir.
- Android CI: debug APK + release AAB üretir.
- iOS CI: imzasız Simulator `.app` paketi üretir.
- CI, production `/api/health` endpoint'ini, Capacitor yapılandırmasını, native plugin sözleşmesini ve deep-link yapılandırmasını doğrular.

## Push bildirimleri

Uygulama açıldığında web köprüsü native Push Notifications API'sini kullanabilir. Gerçek cihaz push teslimatı için platform sağlayıcı yapılandırması ayrıca gerekir:

- Android: Firebase/FCM `google-services.json` ve uygulama Firebase projesine bağlanmalıdır.
- iOS: Apple Push Notification entitlement, APNs anahtarı/sertifikası ve imzalı provisioning profile gerekir.
- Bu gizli materyaller repoya eklenmez; GitHub Secrets/Environment üzerinden release pipeline'a aktarılmalıdır.

## Release

CI şu anda güvenli bir imzasız release AAB ve iOS Simulator build'i doğrular. Store release imzalama anahtarları repoya yazılmaz. İmzalı mağaza paketleri için Android keystore ve iOS signing/provisioning secret'ları GitHub Environment'a bağlanarak release workflow'una eklenebilir.

## Deep link

- Android intent filter: `neyqora://open`
- iOS URL scheme: `neyqora://`
- Örnek: `neyqora://open?view=chat-view`

Mağaza imzalama/sertifika bilgileri repoya konmaz.
