# Ezz E-Commerce Frontend 🛒

![Ezz Logo](public/EZZlogo.ico)

## 📋 نظرة عامة

Ezz هو تطبيق تجارة إلكترونية حديث مبني بـ Angular 19، يوفر تجربة تسوق سلسة ومتكاملة مع واجهة مستخدم عصرية وميزات متقدمة.

## 🎥 فيديو توضيحي

<!-- أضف رابط الفيديو هنا -->
[تحميل/تشغيل الفيديو](public/freecompress-EzzStore_Demo - Made with Clipchamp.mp4)
[شاهد الفيديو على Google Drive](https://drive.google.com/drive/folders/1xfyJjqauAKvKS2ohfz2D75_HnJjYiM_O)

*أو يمكنك إضافة الفيديو مباشرة:*

```html
<video width="100%" controls>
  <source src="public/freecompress-EzzStore_Demo - Made with Clipchamp.mp4" type="video/mp4">
  متصفحك لا يدعم عرض الفيديو.
</video>
```

## ✨ الميزات الرئيسية

- 🛍️ **كتالوج المنتجات**: عرض وتصفح المنتجات مع البحث والتصفية
- 🛒 **إدارة السلة**: إضافة وحذف وتعديل المنتجات في السلة
- 💳 **الدفع المتكامل**: دعم Stripe و WhatsApp للدفع
- 👤 **إدارة المستخدمين**: تسجيل الدخول والتسجيل مع Google OAuth
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة والشاشات
- 🎨 **واجهة عصرية**: مبني بـ Angular Material
- 🔔 **الإشعارات**: نظام إشعارات تفاعلي مع ngx-toastr
- 🔐 **الأمان**: JWT authentication مع حماية الصفحات

## 🛠️ التقنيات المستخدمة

| التقنية | الإصدار | الوصف |
|---------|---------|--------|
| **Angular** | 19.2.0 | إطار العمل الأساسي |
| **TypeScript** | 5.7.2 | لغة البرمجة |
| **Angular Material** | 19.2.0 | مكتبة واجهة المستخدم |
| **RxJS** | 7.8.0 | البرمجة التفاعلية |
| **Auth0 JWT** | 5.2.0 | إدارة المصادقة |
| **ngx-toastr** | 19.0.0 | الإشعارات |

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- Angular CLI

### التثبيت

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd ezz
   ```

2. **تثبيت التبعيات**
   ```bash
   npm install
   ```

3. **تشغيل الخادم المحلي**
   ```bash
   npm start
   # أو
   ng serve --proxy-config proxy.conf.json
   ```

4. **فتح التطبيق**
   
   افتح المتصفح وانتقل إلى `http://localhost:4200/`

## 📁 هيكل المشروع

```
ezz/
├── src/
│   ├── app/
│   │   ├── components/          # مكونات التطبيق
│   │   ├── services/           # الخدمات
│   │   ├── guards/             # حماة الصفحات
│   │   ├── models/             # نماذج البيانات
│   │   └── shared/             # المكونات المشتركة
│   ├── assets/                 # الملفات الثابتة
│   ├── environments/           # إعدادات البيئة
│   └── styles.css             # الأنماط العامة
├── public/                     # الملفات العامة
├── proxy.conf.json            # إعدادات البروكسي
└── angular.json               # إعدادات Angular
```

## 🔧 الأوامر المتاحة

| الأمر | الوصف |
|-------|--------|
| `npm start` | تشغيل الخادم المحلي مع البروكسي |
| `npm run build` | بناء المشروع للإنتاج |
| `npm test` | تشغيل الاختبارات |
| `npm run watch` | بناء المشروع مع المراقبة |

## 🔗 التكامل مع الـ Backend

يتم التكامل مع الـ Backend عبر:

- **API Base URL**: `http://localhost:5000/api`
- **Proxy Configuration**: `proxy.conf.json`
- **Authentication**: JWT tokens
- **HTTP Interceptors**: لإدارة الطلبات والاستجابات

## 🎨 التخصيص

### الألوان والثيمات

يمكنك تخصيص الألوان في ملف `src/styles.css`:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### إضافة مكونات جديدة

```bash
ng generate component component-name
ng generate service service-name
ng generate guard guard-name
```

## 🧪 الاختبارات

```bash
# تشغيل اختبارات الوحدة
npm test

# تشغيل الاختبارات مع التغطية
ng test --code-coverage

# اختبارات النهاية إلى النهاية
ng e2e
```

## 📦 البناء للإنتاج

```bash
# بناء للإنتاج
npm run build

# بناء مع تحسينات إضافية
ng build --configuration production
```

الملفات المبنية ستكون في مجلد `dist/ezz/`

## 🔒 الأمان

- **JWT Authentication**: حماية الصفحات والـ API
- **Route Guards**: منع الوصول غير المصرح به
- **HTTPS**: في بيئة الإنتاج
- **Input Validation**: التحقق من صحة البيانات

## 🌐 المتصفحات المدعومة

- Chrome (آخر إصدارين)
- Firefox (آخر إصدارين)
- Safari (آخر إصدارين)
- Edge (آخر إصدارين)

## 📱 الاستجابة

التطبيق مُحسَّن للعمل على:
- 📱 الهواتف الذكية
- 📱 الأجهزة اللوحية
- 💻 أجهزة الكمبيوتر المكتبية

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم والتواصل

- 📧 البريد الإلكتروني: support@ezz.com
- 🐛 الإبلاغ عن الأخطاء: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 المناقشات: [GitHub Discussions](https://github.com/your-repo/discussions)

## 📚 موارد إضافية

- [Angular Documentation](https://angular.dev/)
- [Angular Material](https://material.angular.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

**تم تطوير هذا المشروع بـ ❤️ باستخدام Angular**
