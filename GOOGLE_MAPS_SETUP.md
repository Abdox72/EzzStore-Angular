# إعداد خريطة Google Maps لتتبع الطلبات

هذا الدليل يشرح كيفية إعداد مفتاح Google Maps API لاستخدامه في ميزة تتبع الطلبات.

## الحصول على مفتاح Google Maps API

1. قم بزيارة [Google Cloud Console](https://console.cloud.google.com/)
2. قم بإنشاء مشروع جديد أو اختر مشروع موجود
3. من القائمة الجانبية، انتقل إلى "APIs & Services" > "Library"
4. ابحث عن "Maps JavaScript API" وقم بتفعيلها
5. انتقل إلى "APIs & Services" > "Credentials"
6. انقر على "Create Credentials" > "API Key"
7. سيتم إنشاء مفتاح API جديد. انسخ هذا المفتاح

## تقييد مفتاح API (مهم للأمان)

1. في صفحة Credentials، انقر على المفتاح الذي تم إنشاؤه
2. تحت "Application restrictions"، اختر "HTTP referrers"
3. أضف النطاقات التي ستستخدم المفتاح (مثل `localhost:4200/*` للتطوير المحلي و`yourdomain.com/*` للإنتاج)
4. تحت "API restrictions"، اختر "Restrict key"
5. حدد "Maps JavaScript API" فقط
6. احفظ التغييرات

## إضافة المفتاح إلى المشروع

1. افتح ملف `src/environments/environment.ts` للتطوير المحلي و `src/environments/environment.prod.ts` للإنتاج
2. أضف مفتاح API الخاص بك إلى كائن `google.mapsApiKey`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  google: {
    clientId: '...',
    mapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
  },
  // ... باقي الإعدادات
};
```

## تفعيل الفوترة (مطلوب لاستخدام Google Maps API)

لاحظ أن Google Maps API تتطلب تفعيل الفوترة في حساب Google Cloud الخاص بك. ومع ذلك، توفر Google طبقة مجانية سخية تسمح بعدد كبير من طلبات الخريطة شهريًا دون أي تكلفة.

1. في Google Cloud Console، انتقل إلى "Billing"
2. قم بربط حساب فوترة بمشروعك
3. يمكنك تعيين تنبيهات الميزانية لتجنب أي رسوم غير متوقعة

## اختبار التكامل

بعد إضافة المفتاح، يجب أن تعمل خريطة تتبع الطلبات بشكل صحيح. يمكنك اختبار ذلك عن طريق:

1. تشغيل التطبيق محليًا
2. الانتقال إلى صفحة تتبع الطلبات لطلب تم شحنه
3. التأكد من ظهور الخريطة وعرض مسار الشحن بشكل صحيح

## استكشاف الأخطاء وإصلاحها

إذا واجهت مشاكل في تحميل الخريطة:

1. تحقق من وحدة تحكم المتصفح للأخطاء
2. تأكد من أن مفتاح API صحيح وتم إضافته بشكل صحيح
3. تأكد من تفعيل Maps JavaScript API في Google Cloud Console
4. تأكد من أن قيود المفتاح تسمح بالوصول من النطاق الذي تستخدمه