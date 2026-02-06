# رفع SUTRA على Netlify

## الخطوات

### 1. رفع المشروع على GitHub
- أنشئ ريبو جديد على [github.com](https://github.com)
- ارفع المشروع:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/اسم-المستخدم/اسم-الريبو.git
git push -u origin main
```

### 2. الربط مع Netlify
1. ادخل إلى [app.netlify.com](https://app.netlify.com) وسجّل أو سجّل دخولك.
2. اضغط **Add new site** → **Import an existing project**.
3. اختر **GitHub** واسمح لـ Netlify بالوصول للريبو.
4. اختر ريبو المشروع (sutra).
5. الإعدادات:
   - **Build command:** `npm run build` (يُملأ تلقائياً)
   - **Publish directory:** يتركه البلجن (لا تغيّره)
   - **Base directory:** اتركه فارغاً
6. اضغط **Deploy site**.

### 3. بعد النشر
- ستحصل على رابط مثل: `https://اسم-عشوائي.netlify.app`
- يمكنك تغيير الاسم من **Site settings** → **Domain management** → **Edit** (مثلاً `sutra.netlify.app`).

---

## ⚠️ تنبيه: البيانات والملفات

على الخطة المجانية في Netlify:
- **ملفات المشروع (data/، public/uploads):** لا تُحفظ بين عمليات النشر. أي منتجات أو طلبات أو صور مرفوعة محلياً ستُفقد عند إعادة النشر أو إعادة تشغيل الموقع.
- للحفاظ على البيانات تحتاج لاحقاً إلى:
  - قاعدة بيانات (مثل Supabase أو MongoDB Atlas) للمنتجات والطلبات والأقسام.
  - تخزين ملفات (مثل Cloudinary أو Supabase Storage) للصور المرفوعة.

حالياً الموقع سيعمل بعد الرفع، لكن أي بيانات تُضاف من لوحة الأدمن لن تبقى بعد إعادة النشر ما لم تربط قاعدة بيانات وتخزين ملفات.
