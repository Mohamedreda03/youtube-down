# YouTube Downloader - Quick Start 🚀

## رفع الموقع على EC2 في 3 خطوات فقط!

### 1️⃣ رفع الكود للسيرفر

```powershell
# من PowerShell على جهازك
cd E:\desktop\projects\in-progress\youtube-v2
.\upload-to-ec2.ps1 -KeyPath "C:\path\to\your-key.pem" -EC2_IP "YOUR-IP"
```

### 2️⃣ تسجيل الدخول ونشر التطبيق

```bash
# SSH للسيرفر
ssh -i "your-key.pem" ubuntu@YOUR-IP

# إعداد السيرفر (أول مرة فقط)
cd ~/youtube-v2
chmod +x setup-ec2.sh deploy.sh
./setup-ec2.sh

# سجل خروج ودخول مرة أخرى
exit
ssh -i "your-key.pem" ubuntu@YOUR-IP

# نشر التطبيق
cd ~/youtube-v2
./deploy.sh
```

### 3️⃣ افتح الموقع!

```
http://YOUR-EC2-IP.nip.io
```

**مثال:** إذا IP السيرفر `54.123.45.67`  
افتح: `http://54.123.45.67.nip.io`

---

## 📚 مستندات إضافية

- **[UPLOAD-GUIDE.md](UPLOAD-GUIDE.md)** - جميع طرق رفع الكود بالتفصيل
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - الدليل الكامل للنشر والصيانة

---

## ⚡ أوامر سريعة

```bash
# عرض حالة التطبيق
docker ps

# عرض الـ logs
docker compose -f docker-compose.prod.yml logs -f

# إعادة التشغيل
docker compose -f docker-compose.prod.yml restart

# تحديث التطبيق
git pull
./deploy.sh
```

---

## 🆘 مشاكل شائعة

**لا يمكن الاتصال بالسيرفر؟**

- تأكد من فتح Ports 22, 80, 443 في Security Group

**الموقع لا يفتح؟**

- تحقق من أن الـ containers شغالة: `docker ps`
- شاهد الـ logs: `docker logs youtube-downloader`

**نسيت IP السيرفر؟**

```bash
# على السيرفر
curl ifconfig.me
```

---

بالتوفيق! 🎉
