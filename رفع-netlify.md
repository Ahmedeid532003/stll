# رفع المشروع على Netlify

## 1. التأكد من الإعدادات المحلية

- المشروع يستخدم البورت **3000** عند التشغيل: `npm run dev`
- ملف الإعداد **netlify.toml** موجود في جذر المشروع ويُستخدم تلقائياً عند الربط مع Netlify

---

## 2. رفع الكود على GitHub

1. أنشئ ريبو جديداً على [github.com](https://github.com) (مثلاً اسمه `sutra`).
2. من مجلد المشروع في الطرفية:

```bash
git init
git add .
git commit -m "رفع مشروع SUTRA"
git branch -M main
git remote add origin https://github.com/اسم-المستخدم/اسم-الريبو.git
git push -u origin main
```

(غيّر `اسم-المستخدم` و `اسم-الريبو` حسب ريبوك.)

---

## 3. الربط والنشر على Netlify

1. ادخل إلى [app.netlify.com](https://app.netlify.com) وسجّل الدخول.
2. **Add new site** → **Import an existing project**.
3. اختر **GitHub** واسمح بالوصول، ثم اختر ريبو المشروع.
4. لا تغيّر الإعدادات (Netlify يقرأ **netlify.toml**):
   - Build command: `npm run build`
   - Publish directory: يحددها البلجن تلقائياً
5. اضغط **Deploy site**.

بعد انتهاء البناء، الموقع يكون على رابط مثل:  
`https://اسم-موقعك.netlify.app`

---

## 4. تنبيه مهم

- **البيانات والملفات** (مجلدات `data/` و `public/uploads`) **لا تُحفظ** بين النشرات على الخطة المجانية. أي منتجات أو طلبات أو صور مرفوعة قد تُفقد عند إعادة النشر.
- لاحقاً يمكن ربط قاعدة بيانات (مثل Supabase) وتخزين ملفات (مثل Cloudinary) حتى تبقى البيانات دائمة.

---

## ملخص الملفات المستخدمة في الرفع

| الملف / الإعداد | الوظيفة |
|-----------------|----------|
| **netlify.toml** | أمر البناء، إصدار Node، واستخدام بلجن Next.js |
| **package.json** | `npm run build` يستخدمه Netlify للبناء |

لا تحتاج لإنشاء أي ملفات إضافية للرفع؛ الموجود في المشروع كافٍ.
