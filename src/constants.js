export const CATEGORIES = [
  { id: 'salary', name: 'راتب أساسي', color: '#10b981', bgColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: 'Briefcase' },
  { id: 'center', name: 'سنتر / أكاديمية', color: '#3b82f6', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: 'GraduationCap' },
  { id: 'students', name: 'طلبة أونلاين', color: '#8b5cf6', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: 'Users' },
  { id: 'private', name: 'شغل خاص / فريلانس', color: '#f59e0b', bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: 'Laptop' },
  { id: 'investments', name: 'استثمارات وأرباح', color: '#06b6d4', bgColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: 'TrendingUp' },
  { id: 'bonus', name: 'مكافآت وحوافز', color: '#ec4899', bgColor: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300', icon: 'Award' },
  { id: 'other', name: 'مصادر أخرى', color: '#64748b', bgColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', icon: 'CircleDollarSign' },
];

export const DEFAULT_JOBS = [
  {
    id: 'job-company',
    title: 'وظيفة الشركة',
    category: 'salary',
    type: 'fixed',
    defaultAmount: 15000,
    color: '#10b981',
    icon: 'Building2',
    description: 'الراتب الأساسي الثابت من الشركة'
  },
  {
    id: 'job-center',
    title: 'سنتر التدريب / الأكاديمية',
    category: 'center',
    type: 'fixed',
    defaultAmount: 2000,
    color: '#3b82f6',
    icon: 'GraduationCap',
    description: 'مستحقات التدريس بالسنتر'
  },
  {
    id: 'job-online',
    title: 'تدريس أونلاين (طلبة)',
    category: 'students',
    type: 'students',
    defaultAmount: 0,
    color: '#8b5cf6',
    icon: 'Users',
    description: 'مدفوعات اشتراكات الطلاب الشهرية (تجميعي تلقائي)'
  },
  {
    id: 'job-private',
    title: 'شغل خاص / فريلانس',
    category: 'private',
    type: 'variable',
    defaultAmount: 0,
    color: '#f59e0b',
    icon: 'Briefcase',
    description: 'مشاريع واستشارات خاصة خارج الدوام'
  }
];

// Clean - Zero dummy students
export const INITIAL_STUDENTS = [];

export const DEFAULT_CURRENCY = { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' };

export const CURRENCIES = [
  DEFAULT_CURRENCY,
  { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
  { code: 'EUR', symbol: '€', name: 'يورو' },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي' },
];

export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Clean - Zero dummy incomes
export const INITIAL_DATA = [];

export const WITHDRAWAL_REASONS = [
  'مصاريف شخصية وعائلية',
  'إيجار وفواتير',
  'التزامات وأقساط',
  'سحب نقدي (كاش)',
  'مشتريات وتجهيزات عمل',
  'طوارئ وعلاج',
  'أخرى'
];

export const GRADE_OPTIONS = [
  'أولى ثانوي',
  'تانية ثانوي'
];

// Handles standard, Eastern Arabic (١٢٣), and comma-formatted numbers
export const parseNumberInput = (value) => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let cleaned = String(value).trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(arabicNumerals[i], String(i));
    cleaned = cleaned.replaceAll(persianNumerals[i], String(i));
  }
  cleaned = cleaned.replace(/,/g, '').replace(/\s/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};


