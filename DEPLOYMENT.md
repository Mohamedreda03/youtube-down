# دليل رفع الموقع على AWS EC2 باستخدام Docker

هذا الدليل يشرح خطوة بخطوة كيفية رفع موقع YouTube Downloader على AWS EC2 باستخدام Docker.

## متطلبات السيرفر المقترحة

### الحد الأدنى (للاختبار):

- **Instance Type:** t3.medium
- **CPU:** 2 vCPU
- **RAM:** 4 GB
- **Storage:** 30 GB SSD
- **⚠️ تحذير:** مناسب فقط للاختبار أو الاستخدام الخفيف

### المقترح للإنتاج:

- **Instance Type:** t3.large أو c6i.xlarge
- **CPU:** 4 vCPU
- **RAM:** 8-16 GB
- **Storage:** 50-100 GB NVMe SSD
- **Bandwidth:** 100+ Mbps
- **✅ موصى به** للأداء الممتاز مع تحميلات متزامنة

---

## الخطوة 1: إعداد EC2 Instance

### 1.1 إنشاء Instance جديدة

```bash
# من لوحة تحكم AWS EC2:
1. اضغط "Launch Instance"
2. اختر AMI: Ubuntu Server 24.04 LTS (أو 22.04)
3. Instance Type: t3.medium (أو أعلى)
4. Storage: 30 GB GP3 SSD (على الأقل)
5. Security Group: افتح Ports:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3000 (اختياري للاختبار المباشر)
6. Create/Select Key Pair للـ SSH
```

### 1.2 الاتصال بالسيرفر

```bash
# من جهازك المحلي (PowerShell أو Terminal)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

---

## الخطوة 2: تثبيت المتطلبات على السيرفر

### 2.1 تحديث النظام

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 تثبيت Docker

```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# إضافة المستخدم الحالي لمجموعة docker
sudo usermod -aG docker $USER

# تفعيل Docker للبدء التلقائي
sudo systemctl enable docker
sudo systemctl start docker

# إعادة تسجيل الدخول لتطبيق الصلاحيات
exit
# ثم سجل دخول مرة أخرى
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### 2.3 تثبيت Docker Compose

```bash
# تثبيت أحدث إصدار
sudo apt install docker-compose-plugin -y

# التحقق من التثبيت
docker compose version
```

### 2.4 تثبيت Git

```bash
sudo apt install git -y
```

---

## الخطوة 3: رفع الكود إلى السيرفر

### ⚡ الطريقة الأسهل: استخدام PowerShell Script (موصى بها)

```powershell
# من مجلد المشروع على جهازك (PowerShell)
cd E:\desktop\projects\in-progress\youtube-v2

# رفع الكود تلقائياً
.\upload-to-ec2.ps1 -KeyPath "C:\path\to\your-key.pem" -EC2_IP "YOUR-EC2-IP"
```

### الطريقة 2: استخدام Git (للتحديثات المستمرة)

```bash
# على جهازك: ارفع الكود على GitHub أولاً
cd E:\desktop\projects\in-progress\youtube-v2
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/youtube-v2.git
git push -u origin main

# ثم على السيرفر: استنسخ المشروع
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP
cd ~
git clone https://github.com/YOUR_USERNAME/youtube-v2.git
cd youtube-v2
```

### الطريقة 3: رفع الملفات يدوياً عبر SCP

```powershell
# من جهازك المحلي (PowerShell)
cd E:\desktop\projects\in-progress\youtube-v2

# رفع الملفات
scp -i "your-key.pem" -r . ubuntu@YOUR-EC2-IP:~/youtube-v2/
```

**📖 لمزيد من التفاصيل، راجع [UPLOAD-GUIDE.md](UPLOAD-GUIDE.md)**

---

## الخطوة 4: بناء وتشغيل التطبيق

### 4.1 إنشاء ملف البيئة

```bash
# إنشاء ملف .env من المثال
cp .env.example .env

# تعديل الإعدادات (اختياري)
nano .env
```

### 4.2 بناء الـ Docker Image

```bash
# بناء الـ Image (قد يستغرق 5-10 دقائق)
docker compose -f docker-compose.prod.yml build

# أو استخدام الملف الأساسي للتجربة
docker compose build
```

### 4.3 تشغيل التطبيق

```bash
# تشغيل مع nginx (إنتاج)
docker compose -f docker-compose.prod.yml up -d

# أو تشغيل بدون nginx (للاختبار)
docker compose up -d
```

### 4.4 التحقق من التشغيل

```bash
# عرض الـ containers الشغالة
docker ps

# عرض الـ logs
docker compose -f docker-compose.prod.yml logs -f

# اختبار الموقع
curl http://localhost

# من المتصفح
http://YOUR_EC2_PUBLIC_IP
```

---

## الخطوة 5: إعداد Domain Name و SSL (اختياري)

### 5.1 استخدام nip.io (مجاني وفوري - موصى به للبداية)

```bash
# nip.io يحول IP تلقائياً إلى domain
# مثال: إذا IP السيرفر 54.123.45.67
# الـ Domain يكون: http://54.123.45.67.nip.io

# nginx.conf مُعد مسبقاً للعمل مع nip.io تلقائياً!
# فقط 3 تثبيت SSL مجاني باستخدام Certbot (للـ domains الخاصة فقط)
http://YOUR-EC2-IP.nip.io
```

**✅ لا تحتاج أي إعداد إضافي! nginx.conf جاهز للعمل مع nip.io**

### 5.2 ربط Domain خاص (اختياري)

```bash
# إذا كان عندك domain خاص (مثل yourdomain.com)
# من DNS Provider (Cloudflare, Namecheap, إلخ):
1. أضف A Record يشير إلى EC2 Public IP
2. انتظر نشر DNS (5-60 دقيقة)
3. عدّل nginx.conf وضع اسم الـ domain بدل ~^.*\.nip\.io$
```

### 5.2 تثبيت SSL مجاني باستخدام Certbot

```bash
# تثبيت Certbot
sudo a4t install certbot python3-certbot-nginx -y

# إيقاف الـ containers مؤقتاً
docker compose -f docker-compose.prod.yml down

# الحصول على شهادة SSL
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# تعديل nginx.conf لإضافة SSL
# (سأضيف مثال في الملف)

# إعادة التشغيل
docker compose -f docker-compose.prod.yml up -d
```

### 5.3 تحديث nginx.conf للـ SSL

```nginx
# أضف هذا في nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # باقي الإعدادات...
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## الخطوة 6: الصيانة والمراقبة

### 6.1 أوامر مفيدة

```bash
# عرض حالة الـ containers
docker compose -f docker-compose.prod.yml ps

# عرض الـ logs
docker compose -f docker-compose.prod.yml logs -f youtube-downloader

# إعادة تشغيل التطبيق
docker compose -f docker-compose.prod.yml restart

# إيقاف التطبيق
docker compose -f docker-compose.prod.yml down

# تحديث التطبيق (بعد تغيير الكود)
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### 6.2 مراقبة الموارد

```bash
# عرض استخدام CPU/RAM
docker stats

# عرض مساحة القرص
df -h

# عرض logs النظام
sudo journalctl -u docker -f
```

### 6.3 النسخ الاحتياطي

```bash
# عمل backup للـ volumes (إذا كنت تخزن بيانات)
docker run --rm -v youtube-v2_downloads:/data -v $(pwd):/backup \
  alpine tar czf /backup/downloads-backup.tar.gz /data

# backup لقاعدة البيانات (إذا أضفت واحدة لاحقاً)
```

---

## الخطوة 7: التحسينات والأمان

### 7.1 إعداد Firewall

```bash
# تفعيل UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 7.2 Auto-renewal لشهادة SSL

```bash
# Certbot يضيف cron job تلقائياً، للتحقق:
sudo certbot renew --dry-run
```

### 7.3 تحديد حدود الموارد

```bash
# عدّل docker-compose.prod.yml:
# - للـ instance 4GB RAM: limits memory: 3G
# - للـ instance 8GB RAM: limits memory: 6G
```

### 7.4 مراقبة تلقائية (اختياري)

```bash
# تثبيت monitoring tools
# - Prometheus + Grafana
# - CloudWatch (AWS native)
# - Netdata (سهل وسريع)
curl -Ss 'https://my-netdata.io/kickstart.sh' | bash
```

---

## استكشاف المشاكل الشائعة

### المشكلة 1: التطبيق لا يعمل

```bash
# تحقق من الـ logs
docker compose -f docker-compose.prod.yml logs

# تحقق من الـ port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

# أعد البناء
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### المشكلة 2: نفاد الذاكرة

```bash
# تقليل عدد العمليات المتزامنة
# قلّل limits في docker-compose.prod.yml

# أو ترقية الـ instance لـ 8GB RAM
```

### المشكلة 3: التحميل بطيء

```bash
# تحقق من سرعة الشبكة
sudo apt install speedtest-cli -y
speedtest-cli

# تحقق من CPU/RAM
htop

# ترقية الـ instance إذا لزم الأمر
```

---

## الخلاصة

✅ **للبدء السريع:**

```bash
# على السيرفر
cd ~/apps/youtube-v2
docker compose -f docker-compose.prod.yml up -d
```

✅ **للتحديث:**

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

✅ **للمراقبة:**

```bash
docker compose -f docker-compose.prod.yml logs -f
docker stats
```

---

## الدعم والمساعدة

إذا واجهت أي مشكلة:

1. تحقق من الـ logs أولاً
2. تأكد من فتح الـ ports في Security Group
3. تأكد من كفاية موارد السيرفر
4. راجع قسم استكشاف المشاكل أعلاه

**بالتوفيق! 🚀**
