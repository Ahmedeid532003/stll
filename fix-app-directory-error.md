# حل خطأ: Couldn't find any pages or app directory

الخطأ يعني أن Netlify يشغّل البناء من مجلد لا يحتوي على `src/app` أو `app`.

## السبب المحتمل

1. **مجلد `src` غير مرفوع على GitHub** — Netlify يبني من الكود على GitHub، فلو `src/` غير موجود هناك، البناء يفشل.
2. **إعداد Base directory في Netlify** — لو كان مضبوطاً على مجلد فرعي خاطئ، البناء يجرى من مكان لا يوجد فيه `src/app`.

---

## الخطوة 1 — التأكد أن `src/app` على GitHub

1. افتح: **https://github.com/Ahmedeid532003/stll**
2. تأكد أنك على الفرع **main**.
3. افتح المجلد **src** ثم **app** — يجب أن ترى: `layout.tsx`, `page.tsx`, مجلدات `api`, `cart`, `product`, إلخ.

**لو مجلد `src` أو `src/app` غير ظاهر:**

من مجلد المشروع على جهازك نفّذ:

```powershell
cd "c:\Users\DELL\OneDrive\Documents\stll"
git add src/
git status
git commit -m "إضافة مجلد src/app للنشر"
git push origin main
```

ثم حدّث صفحة GitHub وتأكد أن `src` وبداخله `app` ظهروا.

---

## الخطوة 2 — إعداد Base directory في Netlify

1. ادخل **https://app.netlify.com** وافتح موقعك (Stella).
2. من القائمة: **Site configuration** (أو **Site settings**).
3. من القائمة الجانبية: **Build & deploy** → **Build settings**.
4. اضغط **Edit settings** بجانب "Build settings".
5. في **Base directory** اترك الحقل **فارغاً** (أو اكتب نقطة واحدة فقط: `.`).
6. احفظ (Save).

---

## الخطوة 3 — إعادة النشر

1. من **Deploys** اضغط **Trigger deploy** → **Deploy site** (أو **Clear cache and deploy site**).
2. انتظر حتى ينتهي البناء.

بعد التأكد من الخطوتين 1 و 2، البناء يفترض أن ينجح لأن Next.js سيجد `src/app`.
