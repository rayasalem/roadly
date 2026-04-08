/**
 * خطط تأمين تجريبية لعرض المقارنة وطلب التأمين (يمكن ربطها لاحقاً بـ API).
 */
export type InsurancePlan = {
  id: string;
  name: string;
  priceYear: number;
  coverage: string[];
  featured?: boolean;
};

export const MOCK_INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'basic',
    name: 'تأمين أساسي',
    priceYear: 199,
    coverage: ['تغطية طرف ثالث', 'حد أقصى ٥٠٬٠٠٠ د.أ', 'مساعدة على الطريق'],
  },
  {
    id: 'plus',
    name: 'تأمين بلس',
    priceYear: 349,
    featured: true,
    coverage: ['كل مزايا الأساسي', 'تغطية جزئية للمركبة', 'بديل تنقل ٧ أيام'],
  },
  {
    id: 'full',
    name: 'تأمين شامل',
    priceYear: 549,
    coverage: ['تغطية شاملة للمركبة', 'بديل تنقل ١٤ يوماً', 'أولوية في المطالبات'],
  },
];
