/**
 * خدمات تجريبية موحدة — للأدمن وربطها بالمزودين.
 * نفس التصنيفات: mechanic | tow | rental.
 */
export type MockServiceCategory = 'mechanic' | 'tow' | 'rental';

export type MockService = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: MockServiceCategory;
};

export const MOCK_SERVICES: MockService[] = [
  { id: 's-m1', nameAr: 'إصلاح الإطارات', nameEn: 'Tire repair', category: 'mechanic' },
  { id: 's-m2', nameAr: 'تشخيص المحرك', nameEn: 'Engine diagnostic', category: 'mechanic' },
  { id: 's-m3', nameAr: 'تغيير الزيت', nameEn: 'Oil change', category: 'mechanic' },
  { id: 's-m4', nameAr: 'خدمة البطارية', nameEn: 'Battery service', category: 'mechanic' },
  { id: 's-t1', nameAr: 'سحب إلى الورشة', nameEn: 'Tow to garage', category: 'tow' },
  { id: 's-t2', nameAr: 'مساعدة على الطريق', nameEn: 'Roadside assistance', category: 'tow' },
  { id: 's-t3', nameAr: 'سحب مسافات طويلة', nameEn: 'Long-distance tow', category: 'tow' },
  { id: 's-r1', nameAr: 'تأجير يومي', nameEn: 'Daily rental', category: 'rental' },
  { id: 's-r2', nameAr: 'تأجير أسبوعي', nameEn: 'Weekly rental', category: 'rental' },
  { id: 's-r3', nameAr: 'سيارات فاخرة', nameEn: 'Luxury vehicles', category: 'rental' },
];
