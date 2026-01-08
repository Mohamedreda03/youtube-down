# 🚀 رفع المشروع على GitHub ثم نشره على EC2

## الطريقة الأسهل والأفضل!

---

## 1️⃣ رفع الكود على GitHub

### الخطوة 1: إنشاء Repository على GitHub
1. اذهب إلى https://github.com/new
2. اسم الـ Repository: `youtube-downloader` (أو أي اسم تحبه)
3. اختر **Private** (عشان الكود مايكونش عام)
4. **لا** تضيف README أو .gitignore (موجودين عندنا)
5. اضغط **Create repository**

---

### الخطوة 2: رفع الكود من جهازك

```powershell
# افتح PowerShell في مجلد المشروع
cd E:\desktop\projects\in-progress\youtube-v2

# تهيئة Git (إذا لم يكن موجود)
git init

# إضافة جميع الملفات
git add .

# عمل Commit
git commit -m "Initial commit - YouTube Downloader"

# ربط بـ GitHub (استبدل YOUR_USERNAME باسم حسابك)
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader.git

# رفع الكود
git branch -M main
git push -u origin main
```

**ملاحظة:** لو طلب منك اسم مستخدم وكلمة مرور:
- اسم المستخدم: اسم حسابك على GitHub
- كلمة المرور: استخدم **Personal Access Token** بدل كلمة المرور العادية
  - اذهب إلى: https://github.com/settings/tokens
  - اضغط "Generate new token (classic)"
  - اختر الصلاحيات: `repo`
  - انسخ الـ Token واستخدمه بدل كلمة المرور

---

## 2️⃣ تنزيل الكود على EC2 Server

### SSH للسيرفر
```powershell
ssh -i "C:\Users\Mohamed\Documents\youtube-down.pem" ubuntu@16.170.171.138
```

---

### بعد الدخول للسيرفر، نفّذ الأوامر دي:

```bash
# 1. تحديث النظام
sudo apt update

# 2. تثبيت Git (إذا لم يكن موجود)
sudo apt install git -y

# 3. استنساخ المشروع من GitHub
# استبدل YOUR_USERNAME باسم حسابك
git clone https://github.com/YOUR_USERNAME/youtube-downloader.git youtube-v2

# 4. الدخول للمشروع
cd youtube-v2

# 5. إعطاء صلاحيات للسكريبتات
chmod +x setup-ec2.sh deploy.sh

# 6. تشغيل الإعداد الأولي (سيثبت Docker والمتطلبات)
./setup-ec2.sh
```

---

### بعد انتهاء setup-ec2.sh:

```bash
# سيطلب منك تسجيل الخروج - اكتب:
exit

# سجل دخول مرة أخرى:
ssh -i "C:\Users\Mohamed\Documents\youtube-down.pem" ubuntu@16.170.171.138

# ارجع للمشروع
cd youtube-v2

# نشر التطبيق
./deploy.sh
```

---

## 3️⃣ افتح الموقع! 🎉

```
http://16.170.171.138.nip.io
```

---

## 🔄 للتحديثات المستقبلية (سهلة جداً!)

### على جهازك (بعد تعديل الكود):
```powershell
cd E:\desktop\projects\in-progress\youtube-v2
git add .
git commit -m "وصف التعديلات"
git push
```

### على السيرفر:
```bash
ssh -i "C:\Users\Mohamed\Documents\youtube-down.pem" ubuntu@16.170.171.138
cd youtube-v2
git pull
./deploy.sh
```

**خلاص! التحديثات نزلت وطبّقت 🚀**

---

## 📋 إذا كان الـ Repository Private

إذا اخترت Private repository، السيرفر محتاج صلاحية للوصول:

### الطريقة 1: استخدام Personal Access Token
```bash
# على السيرفر، بدل الأمر clone:
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/youtube-downloader.git youtube-v2
```

### الطريقة 2: استخدام SSH Key (أفضل)
```bash
# على السيرفر:
# 1. إنشاء SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
# اضغط Enter 3 مرات (استخدم الإعدادات الافتراضية)

# 2. عرض المفتاح العام
cat ~/.ssh/id_ed25519.pub

# 3. انسخ المفتاح كله واذهب إلى:
# https://github.com/settings/keys
# اضغط "New SSH key" والصق المفتاح

# 4. استنسخ المشروع بـ SSH
git clone git@github.com:YOUR_USERNAME/youtube-downloader.git youtube-v2
```

---

## ✅ الخلاصة السريعة

1. **على جهازك:** ارفع الكود على GitHub
2. **على السيرفر:** استنسخ من GitHub وشغّل `./setup-ec2.sh` ثم `./deploy.sh`
3. **افتح:** `http://16.170.171.138.nip.io`
4. **للتحديثات:** `git push` من جهازك، `git pull && ./deploy.sh` على السيرفر

**سهلة وسريعة! 🎯**
