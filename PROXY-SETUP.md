# إعداد Proxy لتجاوز حظر AWS IPs

## المشكلة
YouTube يحظر AWS datacenter IPs تلقائيًا لأنها معروفة كـ bot IPs.

## الحل: استخدام Residential Proxy

### 1. خدمات Proxy الموصى بها

#### خيار 1: Bright Data (Luminati) - الأفضل
- **السعر:** من $500/شهر لـ 20GB
- **الموقع:** https://brightdata.com/
- **المميزات:** Residential IPs عالية الجودة، success rate عالي
- **التسجيل:** 7 أيام trial مجاني

#### خيار 2: Smartproxy - متوسط التكلفة
- **السعر:** من $12.5/GB
- **الموقع:** https://smartproxy.com/
- **المميزات:** سعر معقول، residential IPs

#### خيار 3: WebShare - رخيص
- **السعر:** من $2.99/شهر لـ 10 proxies
- **الموقع:** https://www.webshare.io/
- **المميزات:** رخيص جدًا، لكن datacenter proxies (قد لا تنجح مع YouTube)

#### خيار 4: ProxyMesh - مناسب للتجربة
- **السعر:** من $10/شهر
- **الموقع:** https://proxymesh.com/
- **Trial:** 100 requests مجاني

### 2. كيفية إعداد Proxy

بعد الاشتراك في أي خدمة، ستحصل على:
- Proxy host (مثال: `proxy.example.com`)
- Port (مثال: `8080`)
- Username
- Password

### 3. إضافة Proxy للسيرفر

#### الطريقة 1: عبر docker-compose.prod.yml
```bash
# على السيرفر
cd ~/youtube-down
nano docker-compose.prod.yml
```

احذف الـ `#` من قبل السطور دي وضع بيانات الـ proxy:
```yaml
environment:
  HTTP_PROXY: "http://username:password@proxy-host:port"
  HTTPS_PROXY: "http://username:password@proxy-host:port"
```

مثال:
```yaml
environment:
  HTTP_PROXY: "http://user123:pass456@gate.smartproxy.com:7000"
  HTTPS_PROXY: "http://user123:pass456@gate.smartproxy.com:7000"
```

#### الطريقة 2: عبر .env file
```bash
# على السيرفر
cd ~/youtube-down
nano .env
```

أضف:
```
HTTP_PROXY=http://username:password@proxy-host:port
HTTPS_PROXY=http://username:password@proxy-host:port
```

ثم في `docker-compose.prod.yml`:
```yaml
environment:
  - HTTP_PROXY=${HTTP_PROXY}
  - HTTPS_PROXY=${HTTPS_PROXY}
```

### 4. إعادة التشغيل
```bash
./deploy.sh
```

## حلول بديلة مجانية (غير موصى بها)

### 1. Free Proxy Lists
- **المشكلة:** غير مستقرة، بطيئة، معظمها محظورة من YouTube
- **مواقع:** 
  - https://free-proxy-list.net/
  - https://www.proxy-list.download/

### 2. استخدام Cloudflare Workers
يمكن إنشاء proxy بسيط عبر Cloudflare Workers:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }
  
  const response = await fetch(targetUrl, {
    headers: request.headers,
    method: request.method,
    body: request.body
  })
  
  return response
}
```

لكن **لن يعمل مع yt-dlp** لأنه يحتاج SOCKS/HTTP proxy حقيقي.

## اختبار Proxy

بعد الإعداد، اختبر الـ proxy:

```bash
# على السيرفر
docker exec -it youtube-downloader sh

# داخل الـ container
apk add curl
curl -x "http://username:password@proxy-host:port" https://api.ipify.org?format=json
```

يجب أن يرجع IP مختلف عن IP السيرفر.

## التكلفة المتوقعة

لو عندك 1000 request يوميًا:
- كل video ~2-5 MB data
- شهريًا: ~150GB
- التكلفة على Smartproxy: ~$1,875/شهر
- التكلفة على Bright Data: ~$3,750/شهر

**غير عملي!**

## الحل النهائي الموصى به

بدل استخدام proxy مكلف، استخدم **external API**:

### Cobalt API (مجاني تمامًا)
```typescript
// في lib/cobalt.ts
async function downloadVideo(url: string) {
  const response = await fetch('https://api.cobalt.tools/api/json', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      vCodec: 'h264',
      vQuality: '1080',
      aFormat: 'mp3',
      isAudioOnly: false,
    }),
  });
  
  const data = await response.json();
  return data.url; // Direct download URL
}
```

**مميزات Cobalt:**
- ✅ مجاني 100%
- ✅ يدعم YouTube, Twitter, Instagram, TikTok
- ✅ لا يحتاج proxy
- ✅ جودة عالية
- ✅ سريع جدًا

هل تريد أن أقوم بتطبيق Cobalt API بدلاً من yt-dlp؟
