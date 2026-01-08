# ============================================
# خطوات حل مشكلة YouTube Bot Detection
# ============================================

## المشكلة:
YouTube بيمنع yt-dlp ويطلب تسجيل دخول

## ✅ الحل النهائي: استخدام Cookies من Chrome

---

## الخطوة 1: تصدير Cookies من Chrome

### الطريقة A: استخدام Extension (الأسهل)

1. **افتح Chrome**

2. **نزّل Extension:**
   - رابط: https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc
   - اسم Extension: "Get cookies.txt LOCALLY"

3. **سجل دخول YouTube:**
   - روح https://youtube.com
   - سجل دخول بحسابك

4. **صدّر Cookies:**
   - اضغط على أيقونة الـ Extension في Chrome
   - اختر "youtube.com"
   - اضغط "Export"
   - احفظ الملف باسم `cookies.txt`

---

### الطريقة B: استخدام yt-dlp مباشرة (من جهازك)

```powershell
# على جهازك (Windows)
yt-dlp --cookies-from-browser chrome --cookies cookies.txt "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

---

## الخطوة 2: رفع Cookies للسيرفر

```powershell
# من PowerShell على جهازك
scp -i "C:\Users\Mohamed\Documents\youtube-down.pem" cookies.txt ubuntu@16.170.171.138:~/youtube-down/
```

---

## الخطوة 3: تحديث الكود ونشره

```bash
# SSH للسيرفر
ssh -i "C:\Users\Mohamed\Documents\youtube-down.pem" ubuntu@16.170.171.138

# التأكد من وجود ملف cookies
cd ~/youtube-down
ls -la cookies.txt

# يجب أن يظهر الملف، مثلاً:
# -rw-r--r-- 1 ubuntu ubuntu 5234 Jan  8 12:00 cookies.txt

# تحديث الكود من GitHub
git pull

# نشر التطبيق
./deploy.sh
```

---

## الخطوة 4: اختبار الموقع

افتح المتصفح:
```
http://16.170.171.138.nip.io
```

جرب تنزيل فيديو - المفروض يشتغل! ✅

---

## 🔄 تحديث Cookies لاحقاً

Cookies بتنتهي صلاحيتها. لو الموقع رجع يديك نفس الخطأ:

```powershell
# 1. صدّر cookies جديدة من Chrome (الطريقة A)
# 2. ارفعها للسيرفر
scp -i "C:\Users\Mohamed\Documents\youtube-down.pem" cookies.txt ubuntu@16.170.171.138:~/youtube-down/

# 3. أعد تشغيل التطبيق
ssh -i "C:\Users\Mohamed\Documents\youtube-down.pem" ubuntu@16.170.171.138
cd ~/youtube-down
docker compose -f docker-compose.prod.yml restart youtube-downloader
```

---

## 📝 ملاحظات مهمة

1. **Cookies تنتهي صلاحيتها** بعد فترة (أيام/أسابيع)
2. **لا ترفع cookies على GitHub** (حساس وخاص)
3. **احذر من مشاركة cookies.txt** مع أي حد
4. **لو سجلت خروج من YouTube**، الـ cookies مش هتشتغل

---

## ❓ استكشاف المشاكل

### المشكلة: cookies.txt مش موجود على السيرفر
```bash
# تحقق من المسار
ls -la ~/youtube-down/cookies.txt
# لو مش موجود، ارفعه تاني
```

### المشكلة: لسه نفس الخطأ
```bash
# تأكد إن الـ container شايف الملف
docker exec youtube-downloader ls -la /app/cookies.txt
# لو مش موجود، أعد النشر
./deploy.sh
```

### المشكلة: Cookies expired
```bash
# صدّر cookies جديدة من Chrome
# ارفعها وأعد تشغيل
scp cookies.txt ubuntu@IP:~/youtube-down/
ssh ubuntu@IP "cd youtube-down && docker compose -f docker-compose.prod.yml restart"
```

---

## ✅ الخلاصة السريعة

1. نزّل Extension "Get cookies.txt LOCALLY"
2. سجل دخول YouTube في Chrome
3. صدّر cookies.txt
4. ارفعه للسيرفر: `scp cookies.txt ubuntu@IP:~/youtube-down/`
5. على السيرفر: `git pull && ./deploy.sh`
6. جرب الموقع!

---

**بالتوفيق! 🚀**
