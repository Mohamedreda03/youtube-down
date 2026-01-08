# حل مشكلة YouTube Bot Detection

YouTube بيكتشف yt-dlp كـ bot ويطلب تسجيل دخول. الحل:

## ✅ التحديث اللي عملته:

أضفت cookies extraction من Chrome تلقائياً:
```typescript
'--cookies-from-browser', 'chrome'
```

---

## 📝 الخطوات للتطبيق:

### 1️⃣ على جهازك المحلي (للتطوير):

1. **افتح Chrome وسجل دخول YouTube**
2. **شغّل التطبيق:**
   ```powershell
   npm run dev
   ```

الآن yt-dlp هياخد الـ cookies من Chrome تلقائياً!

---

### 2️⃣ على السيرفر (Production):

**المشكلة:** السيرفر مافيهوش Chrome أو cookies

**الحل A - استخدام cookies file:**

```bash
# 1. على جهازك - صدّر cookies من Chrome
# استخدم Extension زي: "Get cookies.txt LOCALLY"
# رابط: https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc

# 2. ارفع ملف cookies.txt للسيرفر
scp -i "C:\Users\Mohamed\Documents\youtube-down.pem" cookies.txt ubuntu@16.170.171.138:~/youtube-down/

# 3. على السيرفر - حدّث المتغيرات
nano ~/youtube-down/.env

# أضف السطر ده:
YTDLP_COOKIES_FILE=/app/cookies.txt

# 4. حدّث docker-compose.prod.yml
nano ~/youtube-down/docker-compose.prod.yml

# أضف في volumes:
volumes:
  - ./cookies.txt:/app/cookies.txt:ro
```

**الحل B - تعطيل cookies (قد يفشل مع بعض الفيديوهات):**

عدّل الكود ليستخدم fallback بدون cookies إذا فشل.

---

## 🚀 النشر السريع:

```powershell
# على جهازك
cd E:\desktop\projects\in-progress\youtube-v2
git add .
git commit -m "Add bot detection bypass with cookies"
git push
```

```bash
# على السيرفر
cd ~/youtube-down
git pull
./deploy.sh
```

---

## 🔧 الحل الأفضل (موصى به):

**استخدم cookies file من Chrome:**

1. نزّل Extension: https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc
2. افتح YouTube وأنت مسجل دخول
3. اضغط على الـ Extension → Export cookies for youtube.com
4. احفظ الملف كـ `cookies.txt`
5. ارفعه للسيرفر واستخدمه في التطبيق

---

عاوز أطبق الحل الكامل مع cookies file؟
