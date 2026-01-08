# دليل رفع الكود إلى EC2 - خطوة بخطوة

هذا الدليل يشرح **جميع** طرق رفع الكود للسيرفر بالتفصيل الممل 😊

---

## 🎯 الطريقة الأسهل: استخدام PowerShell Script (موصى بها)

### الخطوة 1: تجهيز المتطلبات

```powershell
# تأكد أن عندك:
# 1. ملف المفتاح .pem (من AWS)
# 2. IP الـ EC2 Server
# 3. PowerShell (موجود في Windows أصلاً)
```

### الخطوة 2: تشغيل السكريبت

```powershell
# من مجلد المشروع
cd E:\desktop\projects\in-progress\youtube-v2

# رفع الكود
.\upload-to-ec2.ps1 -KeyPath "C:\path\to\your-key.pem" -EC2_IP "54.123.45.67"
```

### الخطوة 3: الاتصال بالسيرفر والنشر

```bash
# سيظهر لك الأوامر، انسخها وشغّلها:
ssh -i "your-key.pem" ubuntu@54.123.45.67

# ثم على السيرفر:
cd ~/youtube-v2
chmod +x deploy.sh setup-ec2.sh
./setup-ec2.sh  # أول مرة فقط
exit
# سجل دخول مرة أخرى
ssh -i "your-key.pem" ubuntu@54.123.45.67
cd ~/youtube-v2
./deploy.sh
```

**✅ خلاص! الموقع شغال على:**

```
http://YOUR-IP.nip.io
```

---

## 📦 الطريقة الثانية: Git (الأفضل للتحديثات المستمرة)

### 1. إنشاء Repository على GitHub

#### من موقع GitHub:

1. اذهب إلى https://github.com/new
2. اسم الـ repo: `youtube-downloader` (أو أي اسم)
3. اجعله Private (أو Public حسب رغبتك)
4. اضغط "Create repository"

#### رفع الكود من جهازك:

```powershell
# في مجلد المشروع (PowerShell)
cd E:\desktop\projects\in-progress\youtube-v2

# تهيئة Git (إذا لم يكن موجود)
git init

# إضافة .gitignore إذا لم يكن موجود
if (!(Test-Path .gitignore)) {
@"
node_modules
.next
.env
.env.local
*.log
.DS_Store
"@ | Out-File -FilePath .gitignore -Encoding utf8
}

# إضافة الملفات
git add .
git commit -m "Initial commit"

# ربط بـ GitHub (استبدل USERNAME بـ اسمك)
git remote add origin https://github.com/USERNAME/youtube-downloader.git
git branch -M main
git push -u origin main
```

### 2. استنساخ الكود على السيرفر

```bash
# على السيرفر (بعد SSH)
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP

# استنساخ المشروع
cd ~
git clone https://github.com/USERNAME/youtube-downloader.git youtube-v2
cd youtube-v2

# تشغيل الإعداد الأولي
chmod +x setup-ec2.sh deploy.sh
./setup-ec2.sh
# سجل خروج ودخول
exit
```

### 3. للتحديثات المستقبلية

```powershell
# على جهازك (بعد تعديل الكود):
git add .
git commit -m "Update features"
git push
```

```bash
# على السيرفر:
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP
cd ~/youtube-v2
git pull
./deploy.sh
```

---

## 💾 الطريقة الثالثة: SCP (رفع يدوي مباشر)

### باستخدام PowerShell:

```powershell
# رفع كل المشروع
scp -i "C:\path\to\your-key.pem" -r E:\desktop\projects\in-progress\youtube-v2 ubuntu@YOUR-EC2-IP:~/

# رفع ملف واحد فقط (مثلاً)
scp -i "C:\path\to\your-key.pem" E:\desktop\projects\in-progress\youtube-v2\package.json ubuntu@YOUR-EC2-IP:~/youtube-v2/
```

### باستخدام WinSCP (برنامج بواجهة رسومية):

1. حمّل WinSCP من: https://winscp.net/
2. افتح البرنامج
3. إعدادات الاتصال:
   - **File protocol:** SCP
   - **Host name:** YOUR-EC2-IP
   - **User name:** ubuntu
   - **Advanced → SSH → Authentication:** اختر ملف .pem
4. اضغط Login
5. اسحب وأفلت الملفات!

---

## 🔄 الطريقة الرابعة: rsync (الأسرع للتحديثات)

### تثبيت rsync على Windows:

```powershell
# عبر WSL (Windows Subsystem for Linux)
wsl --install
# بعد إعادة التشغيل:
wsl
sudo apt update && sudo apt install rsync -y
```

### استخدام rsync:

```bash
# من WSL أو PowerShell (مع rsync مثبت):
rsync -avz -e "ssh -i /path/to/key.pem" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  /mnt/e/desktop/projects/in-progress/youtube-v2/ \
  ubuntu@YOUR-EC2-IP:~/youtube-v2/
```

---

## 🌐 إعداد nip.io Domain

nip.io خدمة مجانية تحول IP الخاص بك إلى domain تلقائياً!

### كيف يعمل:

```
إذا IP السيرفر: 54.123.45.67
الـ Domain يكون: 54.123.45.67.nip.io
```

### الإعداد على السيرفر:

```bash
# بعد رفع الكود ونشره
# nginx.conf مُعد مسبقاً للعمل مع nip.io تلقائياً!

# فقط افتح المتصفح على:
http://YOUR-EC2-IP.nip.io
```

### مثال عملي:

```bash
# لو IP السيرفر: 3.80.45.123
# افتح: http://3.80.45.123.nip.io
```

**لا تحتاج أي إعداد DNS! 🎉**

---

## 🔍 التحقق من نجاح الرفع

### 1. تحقق من الملفات على السيرفر:

```bash
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP
cd ~/youtube-v2
ls -la

# يجب أن ترى:
# - Dockerfile
# - docker-compose.yml
# - package.json
# - app/
# - components/
# إلخ...
```

### 2. تحقق من حجم الملفات:

```bash
du -sh ~/youtube-v2
# يجب أن يكون حوالي 1-5 MB (بدون node_modules)
```

### 3. اختبر الاتصال:

```bash
# من السيرفر
curl http://localhost:3000

# من جهازك
curl http://YOUR-EC2-IP.nip.io
```

---

## ❓ حل المشاكل الشائعة

### المشكلة 1: Permission denied (publickey)

```bash
# تأكد من صلاحيات المفتاح
# على Windows (PowerShell):
icacls "C:\path\to\key.pem" /inheritance:r
icacls "C:\path\to\key.pem" /grant:r "$($env:USERNAME):(R)"

# أو استخدم:
ssh -i "key.pem" -v ubuntu@YOUR-IP
# الـ -v يعرض تفاصيل المشكلة
```

### المشكلة 2: Connection timeout

```bash
# تحقق من Security Group في AWS:
# 1. افتح EC2 Console
# 2. اختر الـ instance
# 3. Security → Security Groups
# 4. Edit inbound rules
# 5. أضف: SSH (22), HTTP (80), HTTPS (443)
```

### المشكلة 3: Host key verification failed

```powershell
# احذف المفتاح القديم
ssh-keygen -R YOUR-EC2-IP

# أو أضف -o "StrictHostKeyChecking=no"
ssh -o "StrictHostKeyChecking=no" -i "key.pem" ubuntu@YOUR-IP
```

### المشكلة 4: الملفات لم تُرفع كاملة

```bash
# تحقق من حجم الملفات
# على جهازك:
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum

# على السيرفر:
du -sh ~/youtube-v2/*

# أعد الرفع مع verbose:
scp -v -i "key.pem" -r . ubuntu@YOUR-IP:~/youtube-v2/
```

---

## 📋 Checklist سريع

قبل الرفع:

- [ ] عندك ملف .pem من AWS
- [ ] تعرف IP الـ EC2
- [ ] Security Group فاتح Port 22, 80, 443
- [ ] جربت الاتصال بـ SSH

بعد الرفع:

- [ ] الملفات موجودة في `~/youtube-v2`
- [ ] شغّلت `setup-ec2.sh` (أول مرة)
- [ ] شغّلت `deploy.sh`
- [ ] الـ containers شغالة: `docker ps`
- [ ] الموقع يفتح على `http://IP.nip.io`

---

## 🚀 الخلاصة السريعة

**أسهل طريقة:**

```powershell
# 1. من جهازك (PowerShell)
.\upload-to-ec2.ps1 -KeyPath "key.pem" -EC2_IP "YOUR-IP"

# 2. SSH للسيرفر
ssh -i "key.pem" ubuntu@YOUR-IP

# 3. نشر التطبيق
cd ~/youtube-v2
./setup-ec2.sh  # أول مرة فقط
exit && ssh -i "key.pem" ubuntu@YOUR-IP
cd ~/youtube-v2
./deploy.sh

# 4. افتح المتصفح
http://YOUR-IP.nip.io
```

**تم! 🎉**

---

## 💡 نصائح إضافية

1. **للتحديثات السريعة:** استخدم Git (أسرع وأسهل)
2. **للملفات الكبيرة:** استخدم rsync
3. **للمبتدئين:** استخدم WinSCP (واجهة رسومية)
4. **للأتمتة:** استخدم PowerShell script المرفق

---

محتاج مساعدة؟ اسأل عن أي خطوة! 😊
