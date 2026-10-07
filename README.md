# NEYQORA

Kişisel yapay zekâ asistanı.

## Sürüm

Worker API sürümü: **6.0**.

## Sistem şeması

```text
Kullanıcı
   │
   ▼
Cloudflare Worker / UI
   │
   ├── GET /api/health
   ├── POST /api/chat
   │      │
   │      ▼
   │   Router
   │      │
   │      ▼
   │   Agent Planı
   │      │
   │      ├── calculator ──► güvenli hesaplayıcı
   │      ├── weather ─────► Open-Meteo
   │      ├── web ─────────► RSS/web araması
   │      ├── coding ──────► AI + Python statik doğrulama
   │      └── project ─────► template ─► AI fallback ─► validation
   │                                      │
   │                                      ▼
   │                              test_*.py + path/safety
   │
   ├── POST /api/project ───► proje üretim API
   ├── GET /api/project/ci ─► GitHub CI sonucu
   └── GET /api/search ─────► web araması
   │
   └── D1 memories ─────────► kullanıcı hafızası
   │
   ▼
Cloudflare Workers Builds
   │
   └── GitHub Actions
        ├── Core Tests
        ├── UI Script Test
        ├── Project Tests
        ├── Smoke Test
        ├── Production Verification
        └── Issue → Project → Test → Commit
```

## Güvenlik sınırları

- Proje dosyası: en fazla 8 dosya.
- Mutlak yol, `..` ve `\` içeren yollar reddedilir.
- Python projelerinde `eval`/`exec` reddedilir.
- Python tanımlayıcılarında Türkçe karakter reddedilir.
- Üretilen Python dosyaları CI'da `py_compile` ve `test_*.py` ile doğrulanır.
- Agent planı en fazla 3 adımdır ve araç/işlem kombinasyonları allowlist ile sınırlandırılır.
- Agent toplam çalışma süresi 120 saniyedir.
- Web ve hava araması başarısız olursa kontrollü retry uygulanır.
- Kod ajanı çalıştırmadığı kodu çalıştırmış gibi raporlamaz.

## Dağıtım

Cloudflare Workers Builds, `main` dalındaki değişiklikleri otomatik olarak dağıtacak şekilde bağlandı.

## Üretim doğrulama kapıları

1. Worker health/version/router/agent
2. Agent → project tool E2E
3. Doğrudan `/api/project` sözleşmesi
4. Üretilen Python syntax + safety + test
5. Production gate

## API

- `GET /`
- `GET /api/health`
- `POST /api/chat`
- `POST /api/project`
- `GET /api/project/ci`
- `GET /api/search`
- `POST /api/auth/owner`

## Self-host hazırlık durumu

Self-host çalışma katmanı ve Docker hazırlığı repoya eklendi; **henüz sunucuya geçiş yapılmıyor**. Gerçek geçiş, ayrı bir cutover aşamasında yapılacaktır. Owner sırrı GitHub'a konmaz; sunucu secret store kullanılmalıdır.

## Sonraki aşamalar

- Kalıcı hafıza iyileştirmeleri
- Dosya analizi
- Ses ve görüntü
- Takvim, e-posta ve otomasyon

## V5.0 — Ses ve Görüntü
- Ses dosyalarını Workers AI Whisper ile Türkçe metne dönüştürme
- Görselleri Workers AI Vision ile Türkçe analiz etme
- Boyut ve MIME türü sınırları
- UI üzerinden doğrudan medya analizi

## V6.0 — Takvim, E-posta ve Otomasyon
- D1 üzerinde kullanıcıya özel takvim etkinlikleri
- E-posta taslağı oluşturma ve listeleme
- Zamanlanmış otomasyon kayıtları
- 5 dakikalık Cron ile bekleyen otomasyonları işleme
- `AUTOMATION_WEBHOOK_URL` ile harici eylem entegrasyonu
- UI üzerinden takvim, e-posta ve otomasyon yönetimi
- Owner yetkisiyle sınırsız yönetim
## AI Provider Mimarisi

NEYQORA tek bir AI arayüzü üzerinden üç çalışma modunu destekler:

- **cloud**: Cloudflare Workers AI binding.
- **local**: OpenAI-compatible yerel AI sunucusu.
- **auto**: Önce bulut, hata olursa yerel provider'a fallback.

Self-host için isteğe bağlı değişkenler:

- `AI_PROVIDER_MODE=auto|cloud|local`
- `LOCAL_AI_BASE_URL=http://127.0.0.1:11434/v1`
- `LOCAL_AI_API_KEY=`
- `LOCAL_AI_MODEL=...`
- `LOCAL_AI_TIMEOUT_MS=30000`

Tarayıcı tarafında PWA kabuğu `/manifest.webmanifest` ve `/sw.js` üzerinden kurulabilir. API çağrıları service-worker cache'ine alınmaz; çevrimdışı AI için yerel OpenAI-compatible endpoint kullanılmalıdır.

### Mobil / Web / PC yolu

```text
Mobil PWA / Web / PC
        ↓
     /api/chat
        ↓
   Agent Router
        ↓
  Unified AI Provider
     ↙        ↘
 Cloud AI    Local AI
```

Aynı API sözleşmesi korunur; ileride native mobil istemci bu backend'e doğrudan bağlanabilir.
