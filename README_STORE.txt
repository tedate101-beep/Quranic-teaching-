رفع الملفات (كلها في نفس المجلد على استضافة HTTPS):
index.html  progress.html  tajweed.html  certificate.js  manifest.json  sw.js  icon-192.png  icon-512.png

تحويله لتطبيق أندرويد / آيفون (Capacitor):
1) npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npm i @capacitor-community/speech-recognition @capacitor/filesystem @capacitor/share
2) npx cap init "المصحف المعلّم" com.wm.mushaf --web-dir=www   (ضع الملفات داخل مجلد www)
3) npx cap add android && npx cap add ios && npx cap sync
4) أندرويد: أضف في AndroidManifest.xml  <uses-permission android:name="android.permission.RECORD_AUDIO"/>
   آيفون (Info.plist): NSMicrophoneUsageDescription و NSSpeechRecognitionUsageDescription
5) npx cap open android  /  npx cap open ios  ثم Build > Generate Signed Bundle (Google Play) أو Archive (App Store)

ملاحظة: الكود يكتشف Capacitor تلقائيًا ويستخدم التسميع الأصلي وحفظ الشهادة الأصلي بدل المتصفح.
