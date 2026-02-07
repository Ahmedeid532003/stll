# خطوات رفع موقع Stella على Netlify (مفصّلة)

دليل خطوة بخطوة لرفع المشروع على Netlify عبر GitHub.

---

## ما تحتاجه قبل البدء

- المشروع موجود في المجلد: `c:\Users\DELL\OneDrive\Documents\stll`
- متصفح (Chrome أو Edge)
- حساب على **GitHub** (أو تنشئ واحداً)
- حساب على **Netlify** (أو تنشئ واحداً وربطه بـ GitHub)

---

# الجزء الأول: رفع المشروع على GitHub

## الخطوة 1 — إنشاء حساب GitHub (لو عندك حساب اذهب للخطوة 2)

1. افتح المتصفح وادخل: **https://github.com**
2. اضغط **Sign up**.
3. أدخل بريدك الإلكتروني، كلمة مرور، واسم مستخدم (مثلاً: `yourname`).
4. أكمل التسجيل واحفظ **اسم المستخدم** — ستحتاجه لاحقاً.

---

## الخطوة 2 — إنشاء ريبو (مستودع) جديد على GitHub

1. بعد تسجيل الدخول، اضغط الزر الأخضر **New** أو **New repository**.
2. في الصفحة الجديدة:
   - **Repository name:** اكتب اسماً للمشروع، مثلاً: `stella` أو `stella-shop` (بدون مسافات، إنجليزي فقط).
   - **Description:** اختياري (مثلاً: موقع Stella مستلزمات حريمى).
   - اختر **Public**.
   - **مهم:** لا تضف README ولا .gitignore — اترك كل الخيارات **بدون علامة**.
3. اضغط **Create repository**.
4. بعد إنشاء الريبو، **لا** تنفّذ أوامر من صفحة GitHub — سننفذها من جهازك.

---

## الخطوة 3 — فتح الطرفية والذهاب لمجلد المشروع

1. على جهازك اضغط **Win + R** واكتب `powershell` ثم Enter (أو ابحث عن **PowerShell** في قائمة ابدأ).
2. في الطرفية اكتب الأمر التالي ثم Enter:

```powershell
cd "c:\Users\DELL\OneDrive\Documents\stll"
```

3. تأكد أن المسار ينتهي بـ `\stll`.

---

## الخطوة 4 — تهيئة Git وربط المشروع بالريبو

نفّذ الأوامر **واحداً تلو الآخر** بالترتيب. استبدل **اسمك-على-GitHub** و **اسم-الريبو** باسمك الحقيقي واسم الريبو اللي أنشأته (مثلاً: `yourname` و `stella`).

**أ) لو المشروع لم يُربط بـ Git من قبل:**

```powershell
git init
```

```powershell
git add .
```

```powershell
git commit -m "رفع مشروع Stella"
```

```powershell
git branch -M main
```

```powershell
git remote add origin https://github.com/اسمك-على-GitHub/اسم-الريبو.git
```

**مثال:** لو اسمك على GitHub `ahmed` والريبو اسمه `stella`:

```powershell
git remote add origin https://github.com/ahmed/stella.git
```

**ب) لو ظهرت رسالة "remote origin already exists":**

معناها إن الـ origin مضاف من قبل. عدّل الرابط فقط:

```powershell
git remote set-url origin https://github.com/اسمك-على-GitHub/اسم-الريبو.git
```

ثم تحقق من الرابط:

```powershell
git remote -v
```

يجب أن ترى الرابط الصحيح مع **اسمك** و **اسم الريبو**.

---

## الخطوة 5 — رفع الكود على GitHub (Push)

```powershell
git push -u origin main
```

- **لو نجح:** ستظهر رسالة مثل "Branch 'main' set up to track remote branch 'main'". ادخل إلى صفحة الريبو على GitHub وتأكد أن الملفات ظهرت.
- **لو ظهر "Repository not found":**
  - تأكد من **اسم المستخدم** و **اسم الريبو** في الرابط (بدون مسافات).
  - تأكد أن الريبو موجود على GitHub (الخطوة 2).
  - صحّح الرابط: `git remote set-url origin https://github.com/الاسم-الصحيح/الريبو.git` ثم `git push -u origin main` مرة أخرى.
- **لو طلب منك Username و Password:**
  - **Username:** اسم المستخدم على GitHub.
  - **Password:** GitHub لا يقبل كلمة المرور العادية. تحتاج **Personal Access Token**:
    1. ادخل GitHub → **Settings** (إعدادات حسابك).
    2. من القائمة اليسرى: **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
    3. **Generate new token** → اختر **repo** (كل الصلاحيات تحتها).
    4. انسخ الـ Token (يظهر مرة واحدة فقط).
    5. في الطرفية مكان **Password** الصق الـ Token.

بعد نجاح **git push** انتهى الجزء الأول — المشروع الآن على GitHub.

---

# الجزء الثاني: النشر على Netlify

## الخطوة 6 — الدخول إلى Netlify وربط GitHub

1. افتح المتصفح وادخل: **https://app.netlify.com**
2. اضغط **Sign up** أو **Log in**.
3. اختر **Sign in with GitHub** (أو **Sign up with GitHub**).
4. إذا طُلب منك، اضغط **Authorize Netlify** أو **Configure** لتمكين Netlify من الوصول إلى ريبوهاتك.

---

## الخطوة 7 — إنشاء موقع جديد من GitHub

1. من الصفحة الرئيسية في Netlify اضغط **Add new site** أو **Add site**.
2. اختر **Import an existing project**.
3. اضغط **Deploy with GitHub** أو على أيقونة **GitHub**.
4. إذا ظهرت قائمة بالريبوهات:
   - ابحث عن ريبو المشروع (الاسم اللي أنشأته، مثلاً `stella`) واضغط **Select** أو **Configure** بجانبه.
5. إذا طُلب منك **تثبيت Netlify على GitHub** أو **Configure GitHub app**:
   - اختر **All repositories** أو **Only select repositories** واختر ريبو المشروع.
   - اضغط **Save** أو **Install**.

---

## الخطوة 8 — إعدادات البناء (مهمة)

في الشاشة اللي تظهر قبل النشر تأكد من التالي:

| الحقل | القيمة | ملاحظة |
|-------|--------|--------|
| **Branch to deploy** | `main` | الفرع اللي رفعت عليه الكود. |
| **Build command** | `npm run build` | يظهر تلقائياً من ملف `netlify.toml` — **اتركه**. |
| **Publish directory** | (فارغ أو يحدده البلجن) | **لا تغيّره** — بلجن Next.js يضبطه. |
| **Base directory** | اتركه **فارغاً** | |
| **Environment variables** | لا تضف شيئاً في البداية | |

**لا** تختر "Deploy manually" — يجب أن يكون **Import from Git** → **GitHub**.

اضغط **Deploy site** أو **Deploy [اسم-الموقع]**.

---

## الخطوة 9 — انتظار انتهاء البناء

1. بعد الضغط على Deploy ستنتقل لصفحة الموقع وسترى **Building** أو **Deploy in progress**.
2. انتظر حتى ينتهي (عادة 2–5 دقائق):
   - **Published** أو **Site is live** = النشر نجح.
   - **Failed** = البناء فشل:
     - اضغط على الـ Deploy الفاشل ثم **Deploy log**.
     - ابحث عن سطر فيه `error` أو `Error` وانسخه (أو صورة الشاشة) لحل المشكلة.

---

## الخطوة 10 — فتح الموقع والتحقق

1. بعد **Published** ستظهر رسالة **Site is live** ورابط مثل:  
   `https://اسم-عشوائي.netlify.app`
2. اضغط الرابط أو انسخه وافتحه في المتصفح.
3. يجب أن تفتح **الصفحة الرئيسية** لموقع Stella (مستلزمات حريمى، منتجات، إلخ).
4. جرّب: `/cart`، `/admin` — يجب أن تعمل أو تظهر صفحة 404 خاصة بالموقع.

---

## الخطوة 11 (اختياري) — تغيير اسم الموقع

1. من لوحة الموقع على Netlify: **Site configuration** أو **Domain settings**.
2. تحت **Domain management** اضغط **Options** أو **Edit** بجانب الرابط الحالي.
3. اختر **Edit site name** واكتب اسماً مثل: `stella-shop` فيصبح الرابط: `https://stella-shop.netlify.app`
4. احفظ إن وجد زر حفظ.

---

# تحديث الموقع بعد أي تعديل

بعد ما تغيّر أي شيء في المشروع على جهازك:

```powershell
cd "c:\Users\DELL\OneDrive\Documents\stll"
git add .
git commit -m "وصف التعديل"
git push
```

Netlify سيكتشف الـ push تلقائياً ويعيد البناء والنشر. انتظر حتى يظهر **Published** ثم حدّث الصفحة في المتصفح.

---

# حل المشاكل الشائعة

## "Repository not found" عند git push

- **السبب:** الرابط في `origin` غلط أو الريبو غير موجود.
- **الحل:** أنشئ الريبو من GitHub (الخطوة 2)، ثم:
  ```powershell
  git remote set-url origin https://github.com/اسمك-الحقيقي/اسم-الريبو.git
  git push -u origin main
  ```

## "The current branch main has no upstream branch"

- **الحل:**
  ```powershell
  git push -u origin main
  ```

## Deploy فشل (Failed) على Netlify

- افتح **Deploys** → الـ Deploy الفاشل → **Deploy log**.
- ابحث عن سطر فيه `error` أو `Error`.
- جرّب تشغيل البناء محلياً: من مجلد المشروع نفّذ `npm run build`. أي خطأ يظهر هو نفسه تقريباً على Netlify — أصلحه ثم اعمل `git add .` و `git commit -m "إصلاح البناء"` و `git push`.

## الموقع يفتح لكن بدون منتجات (فارغ)

- تأكد أن مجلد **data** مرفوع مع المشروع على GitHub (ملفات مثل `data/products.json`, `data/sections.json` موجودة في الريبو).
- لو كانت `data` في `.gitignore`، أزل سطر `data` من `.gitignore` ثم:
  ```powershell
  git add .
  git commit -m "إضافة مجلد data"
  git push
  ```

## تنبيه: البيانات على الخطة المجانية

على الخطة المجانية في Netlify، ملفات المشروع (مجلد `data/`) **لا تُحفظ بشكل دائم** بين عمليات إعادة النشر في بعض الحالات. أي منتجات أو طلبات تُضاف من لوحة الأدمن قد تُفقد عند إعادة النشر. للحفاظ على البيانات بشكل دائم تحتاج لاحقاً قاعدة بيانات (مثل Supabase أو MongoDB) وتخزين ملفات (مثل Cloudinary) للصور.

---

# ملخص سريع (مرجع)

| # | ماذا تفعل |
|---|-----------|
| 1 | حساب GitHub + إنشاء ريبو جديد (بدون README) |
| 2 | من مجلد المشروع: `git init` → `git add .` → `git commit -m "رفع مشروع Stella"` → `git branch -M main` |
| 3 | `git remote add origin https://github.com/اسمك/اسم-الريبو.git` (أو `set-url` لو موجود) |
| 4 | `git push -u origin main` |
| 5 | Netlify: Sign in with GitHub → Add new site → Import from Git → GitHub → اختر الريبو |
| 6 | Branch: main، لا تغيّر Build command ولا Publish directory → Deploy site |
| 7 | انتظر Published ثم افتح الرابط |

بعد اتباع هذه الخطوات بالترتيب، رفع موقع Stella على Netlify يتم بنجاح. لو واجهت رسالة خطأ محددة، انسخها مع رقم الخطوة وسنحدد الحل.
