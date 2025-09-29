# BMC Creator - Business Model Canvas

تطبيق تفاعلي لإنشاء وتحرير Business Model Canvas مع دعم MongoDB لحفظ البيانات.

## المميزات الجديدة ✨

### 1. **Sidebar قابل للفتح والإغلاق**

- Sidebar يبدأ مغلق بشكل افتراضي
- يمكن فتحه وإغلاقه من أي شاشة
- زر الإغلاق موجود دائماً

### 2. **البيانات في ملف خارجي**

- البيانات الآن في ملف `data.js` منفصل
- يتم حفظ البيانات في MongoDB أول مرة تلقائياً
- بعد ذلك يتم جلبها من قاعدة البيانات

### 3. **Theme Toggle كأيقونة**

- أيقونة القمر/الشمس في أعلى اليمين
- تبديل سريع بين الوضع الفاتح والداكن
- بدون نص - أيقونة فقط

### 4. **حفظ حقيقي في MongoDB**

- يتصل بـ MongoDB Atlas
- حفظ تلقائي عند أي تعديل
- Fallback إلى localStorage إذا لم يكن Backend متاح

### 5. **تصدير محسّن للصور و PDF**

- جودة عالية (scale: 2)
- دعم الـ Dark Mode في التصدير
- رسائل تأكيد واضحة

### 6. **Resize للـ Sections في وضع التعديل**

- يمكن تغيير حجم أي section
- فقط عند تفعيل Edit Mode
- حد أدنى للعرض والارتفاع

### 7. **تغيير ألوان الـ Sections**

- 9 ألوان مختلفة للاختيار
- يتم تطبيق اللون مباشرة
- يتم حفظ اللون الجديد

## التثبيت والتشغيل 🚀

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. تشغيل الـ Backend

```bash
npm start
```

أو للتطوير مع Auto-reload:

```bash
npm run dev
```

الـ Backend سيعمل على: `http://localhost:3000`

### 3. فتح التطبيق

افتح ملف `index.html` في المتصفح أو استخدم Live Server.

## البنية 📁

```
├── index.html          # الواجهة الرئيسية
├── data.js            # بيانات Canvas الافتراضية
├── server.js          # Backend API
├── package.json       # Dependencies
└── README.md          # هذا الملف
```

## استخدام التطبيق 📖

### تفعيل وضع التعديل

1. اضغط على "Enable Edit Mode" من Sidebar
2. أدخل كلمة المرور: `owner123`
3. الآن يمكنك التعديل

### إضافة عنصر جديد

- اضغط على زر `+` في أي section

### تعديل عنصر

- مرر فوق أي عنصر واضغط على أيقونة التعديل
- يمكنك تغيير النص واللون

### تغيير حجم Section

- في وضع التعديل، اسحب من الزاوية السفلية اليمنى لأي section

### حذف عنصر

- مرر فوق العنصر واضغط على أيقونة الحذف

### التصدير

- **Export as Image**: يصدر Canvas كصورة PNG
- **Export as PDF**: يصدر Canvas كملف PDF
- **Export JSON**: يصدر البيانات كملف JSON

### الحفظ والتحميل

- **Save to Database**: يحفظ في MongoDB (تلقائي عند التعديل)
- **Load from Database**: يحمل آخر نسخة محفوظة

## API Endpoints 🔌

### POST `/api/save`

حفظ بيانات Canvas

```json
{
  "projectName": "اسم المشروع",
  "canvasData": {},
  "sections": []
}
```

### GET `/api/load?projectName=اسم_المشروع`

تحميل بيانات Canvas

### GET `/api/projects`

الحصول على جميع المشاريع

### DELETE `/api/delete/:projectName`

حذف مشروع

## ملاحظات مهمة 📌

1. **كلمة المرور**: غير `owner123` في ملف `index.html` للأمان
2. **MongoDB**: تأكد من صحة connection string في `server.js`
3. **CORS**: الـ Backend مفعل عليه CORS لأي domain
4. **Local Storage**: يتم استخدامه كـ backup إذا لم يكن Backend متاح

## التطوير المستقبلي 🔮

- [ ] Multi-user support
- [ ] مشاريع متعددة
- [ ] تاريخ التعديلات
- [ ] مشاركة عبر رابط
- [ ] Templates جاهزة
- [ ] تصدير كـ PowerPoint

## الدعم الفني 💬

لأي استفسارات أو مشاكل، يمكنك:

- فتح Issue على GitHub
- مراجعة Console للأخطاء
- التحقق من اتصال MongoDB

---

صنع بـ ❤️ للمشاريع الريادية
