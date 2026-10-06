# NEYQORA

Kişisel yapay zekâ asistanı.

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

## Sonraki aşamalar

- Kalıcı hafıza iyileştirmeleri
- Dosya analizi
- Ses ve görüntü
- Takvim, e-posta ve otomasyon