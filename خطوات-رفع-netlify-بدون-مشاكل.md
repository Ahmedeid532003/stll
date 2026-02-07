# خطوات رفع المشروع على Netlify بدون مشاكل (تفصيل واضح)

---

## قبل ما تبدأ

- المشروع جاهز على جهازك في المجلد: `c:\Users\DELL\OneDrive\Desktop\s`
- تحتاج: متصفح، وحساب (أو تنشئ واحد) على **GitHub** و **Netlify**
- **مهم:** النشر على Netlify يكون عبر **ربط GitHub** وليس رفع ملف يدوي (لأن المشروع Next.js يحتاج بناء على السيرفر)

---

# الجزء الأول: رفع المشروع على GitHub

## الخطوة 1 — إنشاء/فتح حساب GitHub

1. افتح المتصفح وادخل: **https://github.com**
2. لو ماعندكش حساب: اضغط **Sign up** واكتب بريدك وكلمة مرور وأنشئ حساب.
3. لو عندك حساب: اضغط **Sign in** وسجّل الدخول.
4. بعد الدخول، اضغط على **صورتك** أعلى اليمين واكتب اسم المستخدم (Username) اللي تحت الصورة — **احفظه** (مثلاً: `sara2024`) — هتحتاجه في الرابط.

---

## الخطوة 2 — إنشاء ريبو جديد على GitHub

1. من الصفحة الرئيسية لـ GitHub اضغط الزر الأخضر **New** (أو **New repository**).
2. في الصفحة الجديدة:
   - **Repository name:** اكتب اسم للمشروع، مثلاً: `sutra` أو `sutra0` (بدون مسافات).
   - **Description:** اختياري (مثلاً: موقع ملابس SUTRA).
   - **Public** ← تأكد إنه مختار.
   - **لا** تضع علامة على "Add a README" ولا "Add .gitignore" — اترك كل الخيارات بدون علامة.
3. اضغط **Create repository**.
4. بعد ما ينفتح الريبو، **لا** تنفّذ أي أوامر من صفحة GitHub — سننفذها من جهازك في الطرفية.

---

## الخطوة 3 — فتح الطرفية والذهاب لمجلد المشروع

1. على جهازك، افتح **PowerShell** أو **Command Prompt**:
   - من قائمة ابدأ ابحث عن **PowerShell** أو **cmd** وافتحه.
2. اكتب الأمر التالي ثم اضغط **Enter** (لتغيير المجلد لمشروعك):

   ```powershell
   cd c:\Users\DELL\OneDrive\Desktop\s
   ```

3. تأكد أنك داخل المجلد الصحيح — يجب أن ترى مساراً ينتهي بـ `\s` أو `Desktop\s`.

---

## الخطوة 4 — تهيئة Git وربط المشروع بالريبو (لو أول مرة)

نفّذ الأوامر **واحداً تلو الآخر** بالترتيب. استبدل **اسمك-على-GitHub** و **اسم-الريبو** بالقيم الحقيقية (مثلاً `sara2024` و `sutra0`).

**أ) لو المشروع لم يُربط بـ Git من قبل (لم تنفّذ `git init` سابقاً):**

```powershell
git init
```

```powershell
git add .
```

```powershell
git commit -m "رفع مشروع SUTRA"
```

```powershell
git branch -M main
```

```powershell
git remote add origin https://github.com/اسمك-على-GitHub/اسم-الريبو.git
```

**مثال حقيقي:** لو اسمك على GitHub `sara2024` والريبو اسمه `sutra0`:

```powershell
git remote add origin https://github.com/sara2024/sutra0.git
```

**ب) لو ظهرت رسالة "remote origin already exists":**

معناها إن الـ origin مضاف من قبل. عدّل الرابط فقط (باستبدال اسمك واسم الريبو):

```powershell
git remote set-url origin https://github.com/اسمك-على-GitHub/اسم-الريبو.git
```

ثم تأكد من الرابط:

```powershell
git remote -v
```

يجب أن ترى سطرين يبدآن بـ `origin` والرابط يحتوي **اسمك الحقيقي** و **اسم الريبو الحقيقي** وليس كلمات مثل "اسم-المستخدم".

---

## الخطوة 5 — رفع الكود على GitHub (Push)

نفّذ:

```powershell
git push -u origin main
```

- **لو نجح:** ستظهر رسالة مثل "Branch 'main' set up to track remote branch 'main'". بعدها ادخل إلى صفحة الريبو على GitHub وتأكد أن الملفات ظهرت.
- **لو ظهر "Repository not found":**
  - تأكد أنك كتبت **اسم المستخدم** و **اسم الريبو** بشكل صحيح في الرابط (بدون مسافات، حروف إنجليزي).
  - تأكد أن الريبو **موجود** على GitHub (أنشئه من الخطوة 2 إن لم يكن موجوداً).
  - عدّل الرابط بـ: `git remote set-url origin https://github.com/الاسم-الصحيح/الريبو.git` ثم جرّب `git push -u origin main` مرة أخرى.
- **لو ظهر طلب تسجيل دخول (Username/Password):**
  - **Username:** اكتب اسم المستخدم على GitHub.
  - **Password:** لا تكتب كلمة مرور الحساب — GitHub يطلب **Personal Access Token**. من GitHub: **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token**، اختر صلاحية **repo**، انسخ الـ token واستخدمه مكان كلمة المرور في الطرفية.

بعد نجاح **git push**، انتهى الجزء الأول — المشروع الآن على GitHub.

---

# الجزء الثاني: النشر على Netlify

## الخطوة 6 — الدخول إلى Netlify وربط GitHub

1. افتح المتصفح وادخل: **https://app.netlify.com**
2. اضغط **Sign up** أو **Log in**.
3. اختر **Sign in with GitHub** (أو **Sign up with GitHub**) حتى تربط حسابك بـ GitHub مرة واحدة.
4. إذا طُلب منك، اضغط **Authorize Netlify** أو **Configure** لتمكين Netlify من الوصول إلى ريبوهاتك.

---

## الخطوة 7 — إنشاء موقع جديد من GitHub

1. من الصفحة الرئيسية في Netlify اضغط الزر الأخضر **Add new site** (أو **Add site**).
2. من القائمة اختر **Import an existing project**.
3. اضغط **Deploy with GitHub** أو على أيقونة **GitHub**.
4. إذا ظهرت قائمة بالريبوهات:
   - ابحث عن ريبو المشروع (الاسم اللي أنشأته، مثلاً `sutra0`) واضغط عليه أو اضغط **Select** أو **Configure** بجانبه.
5. إذا طُلب منك **تثبيت Netlify على GitHub** أو **Configure GitHub app**:
   - اختر **All repositories** أو **Only select repositories** واختر ريبو المشروع.
   - اضغط **Save** أو **Install**.

---

## الخطوة 8 — إعدادات البناء (مهم — لا تغيّرها إلا للضرورة)

في الشاشة اللي تظهر قبل النشر:

| الحقل | القيمة الصحيحة | ملاحظة |
|------|----------------|--------|
| **Branch to deploy** | `main` | الفرع اللي رفعت عليه الكود. |
| **Build command** | `npm run build` | يظهر تلقائياً من ملف `netlify.toml` — اتركه. |
| **Publish directory** | (فارغ أو يحدده البلجن) | **لا** تغيّره — بلجن Next.js يضبطه. |
| **Base directory** | اتركه **فارغاً** | |
| **Environment variables** | لا تضف شيئاً في البداية | |

- **لا** تختر "Deploy manually" ولا تسحب مجلد — يجب أن يكون **Import from Git** → **GitHub** كما في الخطوة 7.

اضغط **Deploy site** (أو **Deploy [اسم-الموقع]**).

---

## الخطوة 9 — انتظار انتهاء البناء

1. بعد الضغط على Deploy، ستنتقل لصفحة الموقع وسترى **Building** أو **Deploy in progress**.
2. انتظر حتى ينتهي (عادة 2–5 دقائق):
   - **Published** أو **Site is live** = النشر نجح.
   - **Failed** = البناء فشل — اضغط على الـ Deploy الفاشل ثم **Deploy log** وابحث عن السطر الذي يبدأ بـ `error` أو `Error` وانسخه (أو صورة الشاشة) لحل المشكلة لاحقاً.

---

## الخطوة 10 — فتح الموقع والتحقق

1. بعد **Published**، ستظهر في أعلى الصفحة رسالة مثل **Site is live** ورابط مثل:  
   `https://اسم-عشوائي.netlify.app`
2. اضغط الرابط أو انسخه وافتحه في المتصفح.
3. يجب أن تفتح **الصفحة الرئيسية** للموقع (تصميم SUTRA، منتجات، إلخ).
4. جرّب روابط مثل: `/cart` أو `/admin` — يجب أن تعمل أو تظهر صفحة 404 خاصة بالموقع وليس رسالة Netlify فقط.

---

## الخطوة 11 (اختياري) — تغيير اسم الموقع

1. من لوحة الموقع على Netlify: **Site configuration** أو **Domain settings**.
2. تحت **Domain management** أو **Custom domains** اضغط **Options** أو **Edit** بجانب الرابط الحالي.
3. اختر **Edit site name** واكتب اسماً مثل: `sutra` فيصبح الرابط: `https://sutra.netlify.app`
4. احفظ إن وجد زر حفظ.

---

# حل المشاكل الشائعة

## المشكلة: "Repository not found" عند git push

- **السبب:** الرابط في `origin` غلط (اسم مستخدم أو ريبو غير صحيح)، أو الريبو غير موجود.
- **الحل:** أنشئ الريبو من GitHub (الخطوة 2)، ثم صحّح الرابط:
  ```powershell
  git remote set-url origin https://github.com/اسمك-الحقيقي/اسم-الريبو.git
  git push -u origin main
  ```

## المشكلة: "The current branch main has no upstream branch"

- **الحل:** نفّذ مرة واحدة:
  ```powershell
  git push -u origin main
  ```

## المشكلة: Deploy فاشل (Failed) على Netlify

- افتح **Deploys** → الـ Deploy الفاشل → **Deploy log**.
- ابحث عن سطر فيه `error` أو `Error` (أحياناً في نهاية الـ log).
- إذا كان الخطأ عن **prop-types** أو **type definition**: تأكد أن المشروع يحتوي على `@types/prop-types` في `package.json` (تم إضافته سابقاً).
- إذا كان خطأ في **بناء Next.js**: شغّل محلياً `npm run build` في مجلد المشروع — أي خطأ يظهر هو نفسه تقريباً على Netlify؛ أصلحه ثم اعمل `git add .` و `git commit -m "إصلاح البناء"` و `git push`.

## المشكلة: الموقع يفتح "Page not found" (404)

- إذا كانت **الصفحة الرئيسية** (/) تعطي 404: غالباً النشر لم يكتمل أو تم النشر اليدوي (سحب مجلد) بدل GitHub. الحل: استخدم **Import from Git** → **GitHub** كما في الخطوات 7–8، وتأكد أن الـ Deploy **Published**.
- إذا كانت **صفحات أخرى** (مثل /cart) تعطي 404: تأكد أنك تربط من GitHub وليس Deploy manually؛ مع الربط من GitHub وبلجن Next.js يجب أن تعمل كل المسارات.

## المشكلة: الموقع يفتح لكن بدون منتجات (فارغ)

- تأكد أن مجلد **data** مرفوع مع المشروع على GitHub (ملفات مثل `data/products.json`, `data/sections.json` موجودة في الريبو). لو كانت `data` في `.gitignore` سابقاً، أزل تجاهلها واعمل commit و push من جديد.

---

# ملخص سريع (مرجع)

| المرحلة | ماذا تفعل |
|--------|-----------|
| 1 | حساب GitHub + إنشاء ريبو جديد (بدون README) |
| 2 | من مجلد المشروع: `git init` → `git add .` → `git commit -m "..."` → `git branch -M main` |
| 3 | `git remote add origin https://github.com/اسمك/الريبو.git` (أو `set-url` لو موجود) |
| 4 | `git push -u origin main` |
| 5 | Netlify: Sign in with GitHub → Add new site → Import from Git → GitHub → اختر الريبو |
| 6 | Branch: main، لا تغيّر Build command ولا Publish directory → Deploy site |
| 7 | انتظر Published ثم افتح الرابط |

بعد اتباع هذه الخطوات بالترتيب، رفع المشروع على Netlify يتم بدون مشاكل في الغالب. إذا واجهت رسالة خطأ محددة، انسخها مع رقم الخطوة التي كنت فيها وسنحدد الحل بدقة.
