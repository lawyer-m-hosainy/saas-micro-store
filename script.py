import os, re
base_dir = r'c:\Users\mhosa\Downloads\micro-saas-store\src'
def read(f): return open(os.path.join(base_dir, f), encoding='utf-8').read()
def write(f, c): open(os.path.join(base_dir, f), 'w', encoding='utf-8').write(c)

# 1. & 21. OrderTracking.tsx
f = 'components/OrderTracking.tsx'
c = read(f)
c = c.replace('o.buyerPhone.includes(query)', 'o.buyerPhone === query')
c = c.replace('o.id.toLowerCase() === query', 'o.id.toLowerCase() === query.toLowerCase()')
c = c.replace('01142099605', '{SUPPORT_PHONE}')
c = c.replace('2{SUPPORT_PHONE}', '2${SUPPORT_PHONE}')
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Key', 'FileText', 'ExternalLink']]) + ' } from \'lucide-react\';', c)
c = c.replace('import { LicenseCertificateModal', 'import { SUPPORT_PHONE } from \'../config/constants\';\nimport { LicenseCertificateModal', 1)
write(f, c)

# 2. CheckoutModal.tsx
f = 'components/CheckoutModal.tsx'
c = read(f)
c = c.replace('import { useCurrency', 'import { SUPPORT_PHONE, WHATSAPP_NUMBER, DEPLOYMENT_FEE_EGP, DEPLOYMENT_FEE_USD } from \'../config/constants\';\nimport { useCurrency', 1)
c = c.replace("'01142099605'", 'SUPPORT_PHONE')
c = c.replace('https://wa.me/201142099605', 'https://wa.me/${WHATSAPP_NUMBER}')
c = c.replace('deploymentFeeEgp = 490', 'deploymentFeeEgp = DEPLOYMENT_FEE_EGP')
c = c.replace('deploymentFeeUsd = 15', 'deploymentFeeUsd = DEPLOYMENT_FEE_USD')
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Sparkles', 'ShieldCheck']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 3. FloatingSupportWidget.tsx
f = 'components/FloatingSupportWidget.tsx'
c = read(f)
c = c.replace('import { MessageCircle', 'import { WHATSAPP_NUMBER } from \'../config/constants\';\nimport { MessageCircle', 1)
c = c.replace('https://wa.me/201000000000', 'https://wa.me/${WHATSAPP_NUMBER}')
c = re.sub(r'const quickQuestions = \[.*?\];', '', c, flags=re.DOTALL)
c = c.replace('export function FloatingSupportWidget() {', 'const quickQuestions = [\n    \'كيف استلم الكود المصدري بعد الدفع؟\',\n    \'هل يمكنني إعادة بيع الأداة باسمي وعلامتي التجارية؟\',\n    \'ما هي طرق الدفع المتاحة في مصر والعالم العربي؟\',\n    \'هل يتطلب تشغيل الأداة خوادم باهظة شهرياً؟\'\n  ];\n\nexport function FloatingSupportWidget() {')
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Shield', 'Sparkles', 'HelpCircle', 'PhoneCall']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 4. AdBanner.tsx
f = 'components/AdBanner.tsx'
c = read(f)
c = c.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { WHATSAPP_NUMBER } from '../config/constants';", 1)
c = c.replace('https://wa.me/201000000000', 'https://wa.me/${WHATSAPP_NUMBER}')
c = re.sub(r'const adPackages = \[.*?\];', '', c, flags=re.DOTALL)
c = c.replace('export function AdvertiseModal({ isOpen, onClose }: AdvertiseModalProps) {', 'const adPackages = [\n    {\n      title: \'بانر الشريط العلوي (Top Ribbon)\',\n      placement: \'يظهر في أعلى كل صفحات المتجر للزوار\',\n      views: \'+75,000 مشاهدة شهرياً\',\n      price: \'1,500 ج.م / شهر\',\n      features: [\'ظهور دائم وثابت\', \'رابط مباشر لموقعك\', \'تقرير نقرات أسبوعي\']\n    },\n    {\n      title: \'بطاقة أداة مميزة (Sponsored In-Feed)\',\n      placement: \'بين أول صف في شبكة منتجات الـ SaaS\',\n      views: \'+50,000 ظهور مخصص\',\n      price: \'2,200 ج.م / شهر\',\n      popular: true,\n      features: [\'تصميم متناسق عالي التحويل\', \'وسام \"برعاية\" مميز\', \'زر شراء/استعراض مباشر\']\n    },\n    {\n      title: \'حزمة الشريك الاستراتيجي الشاملة\',\n      placement: \'شريط علوي + بطاقة منتج + رعاية في الرادار\',\n      views: \'+120,000 تفاعل كامل\',\n      price: \'3,800 ج.م / شهر\',\n      features: [\'أعلى أولوية ظهور\', \'تغطية شاملة للمنصة\', \'إبراز في النشرة البريدية\']\n    }\n  ];\n\nexport function AdvertiseModal({ isOpen, onClose }: AdvertiseModalProps) {')
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['TrendingUp', 'Layers', 'Mail', 'Eye']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 5. AdminDashboard.tsx
f = 'components/AdminDashboard.tsx'
c = read(f)
c = c.replace('import { LicenseCertificateModal', "import { SUPPORT_PHONE, WHATSAPP_NUMBER } from '../config/constants';\nimport { LicenseCertificateModal", 1)
c = c.replace('01142099605', '{SUPPORT_PHONE}')
c = c.replace("'2' + order.buyerPhone.replace(/^0+/, '')", "(() => { const cleanPhone = order.buyerPhone.replace(/^\\+/, '').replace(/^00/, ''); return cleanPhone.startsWith('20') ? cleanPhone : '20' + cleanPhone.replace(/^0+/, ''); })()")
c = c.replace('onDeleteProduct(product.id)', "if (window.confirm('هل أنت متأكد من حذف هذه الأداة؟')) onDeleteProduct(product.id)")
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['TrendingUp', 'Users', 'Filter', 'Edit3', 'Sparkles', 'BarChart3', 'Calendar', 'Tag', 'MessageCircle', 'AlertCircle']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 6. SaaSROICalculator.tsx
f = 'components/SaaSROICalculator.tsx'
c = read(f)
c = c.replace('const [monthlyPricePerClient, setMonthlyPricePerClient] = useState<number>(isEgp ? 350 : 15);', "const [monthlyPricePerClient, setMonthlyPricePerClient] = useState<number>(isEgp ? 350 : 15);\n\n  React.useEffect(() => {\n    setMonthlyPricePerClient(isEgp ? 350 : 15);\n  }, [isEgp]);")
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['DollarSign', 'CheckCircle2', 'HelpCircle']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 7. LandingPage.tsx
f = 'components/LandingPage.tsx'
c = read(f)
c = c.replace('const representativeProduct = products.find(p => p.id === bundle.productIds[0]) || products[0];\n            onBuyProduct({', "const representativeProduct = products.find(p => p.id === bundle.productIds[0]) || products[0];\n            if (!representativeProduct) return;\n            onBuyProduct({")
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Zap', 'Code2', 'Download', 'Lock', 'Play', 'Star', 'Coins', 'Globe2', 'MessageSquare', 'TrendingUp', 'Cpu']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 8. LicenseCertificateModal.tsx
f = 'components/LicenseCertificateModal.tsx'
c = read(f)
c = c.replace("import React, { useState } from 'react';", "import React, { useState, useMemo } from 'react';")
c = re.sub(r'const licenseKey = `EGY-SAAS-\$\{product\.id\.toUpperCase\(\)\}-\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 9\)\.toUpperCase\(\)\}-2026`;', "const licenseKey = useMemo(() => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let key = 'MSS-'; for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { key += chars.charAt(Math.floor(Math.random() * chars.length)); } if (i < 3) key += '-'; } return key; }, [product?.id]);", c)
c = c.replace('const [copied, setCopied] = useState(false);\n  ', '')
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['Download', 'FileText', 'Sparkles', 'Building', 'User', 'Key']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 9. DemoViewer.tsx
f = 'components/DemoViewer.tsx'
c = read(f)
c = c.replace('import { GenericToolSimulator', "import ErrorBoundary from './ErrorBoundary';\nimport { GenericToolSimulator", 1)
c = c.replace('{renderToolDemo()}', '<ErrorBoundary>{renderToolDemo()}</ErrorBoundary>')
c = re.sub(r'import React, \{ useState \} from \'react\';', "import React from 'react';", c)
c = re.sub(r'import\s*\{\s*([^}]+)\}\s*from\s*\'lucide-react\';', lambda m: 'import { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip() not in ['PlayCircle']]) + ' } from \'lucide-react\';', c)
write(f, c)

# 10. main.tsx
f = 'main.tsx'
c = read(f)
c = c.replace("import App from './App.tsx';", "import App from './App';\nimport ErrorBoundary from './components/ErrorBoundary';")
c = c.replace("createRoot(document.getElementById('root')!).render(", "const rootElement = document.getElementById('root');\nif (!rootElement) throw new Error('Root element not found');\ncreateRoot(rootElement).render(")
c = c.replace('<App />', '<ErrorBoundary><App /></ErrorBoundary>')
write(f, c)
