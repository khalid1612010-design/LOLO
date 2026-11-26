/**
 * data.js — Phase 1 sample content layer.
 * Clearly labeled SAMPLE data. Phase 4 replaces this module's
 * fetch logic with Supabase queries WITHOUT changing the UI renderers.
 * Never present this sample data as real clients/results.
 */
export const SETTINGS = {
  name: "KHALED MOHAMED",
  title_en: "Web Developer",
  title_ar: "مطوّر ويب",
  whatsapp: "201000000000", // SAMPLE — replace via Dashboard > Settings
  email: "hello@khaledmohamed.dev", // SAMPLE
  linkedin: "https://linkedin.com/in/khaledmohamed", // SAMPLE
  github: "https://github.com/khaledmohamed", // SAMPLE
  telegram: "",
  seoTitle: "KHALED MOHAMED — Web Developer",
  seoDescription: "Modern websites and digital solutions for businesses.",
};

export const PROJECTS = [
  {
    id: "sample-booking",
    slug: "sample-booking-system",
    title_en: "Sample — Booking System for a Service Business",
    title_ar: "نموذج — نظام حجز لأعمال خدمية",
    category_en: "Web Application",
    category_ar: "تطبيق ويب",
    short_en: "SAMPLE project: a booking flow with availability, admin confirmation and WhatsApp notifications.",
    short_ar: "مشروع نموذجي: تدفق حجز مع التوفر وتأكيد الإدارة وإشعارات واتساب.",
    overview_en: "Sample case study placeholder. Replace with a real project from the dashboard.",
    overview_ar: "نص نموذجي لدراسة الحالة. استبدله بمشروع حقيقي من لوحة التحكم.",
    challenge_en: "Sample challenge text — describe the real business problem here.",
    challenge_ar: "نص نموذجي للتحدي — اكتب مشكلة العمل الحقيقية هنا.",
    solution_en: "Sample solution text — describe what was built and why.",
    solution_ar: "نص نموذجي للحل — صف ما تم بناؤه ولماذا.",
    role_en: "Design & development, database, admin panel.",
    role_ar: "التصميم والتطوير وقاعدة البيانات ولوحة الإدارة.",
    tech: ["HTML", "CSS", "JavaScript", "Supabase"],
    outcome_en: "Sample outcome — only publish verified results.",
    outcome_ar: "نتيجة نموذجية — انشر النتائج الموثقة فقط.",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    client: "",
    image: "",
    gallery: [],
    videoUrl: "",
    published: true,
    order: 1,
    sample: true,
  },
  {
    id: "sample-dashboard",
    slug: "sample-admin-dashboard",
    title_en: "Sample — Admin Dashboard & CMS",
    title_ar: "نموذج — لوحة إدارة ونظام محتوى",
    category_en: "Web Application",
    category_ar: "تطبيق ويب",
    short_en: "SAMPLE project: a private dashboard to manage content, orders and settings.",
    short_ar: "مشروع نموذجي: لوحة خاصة لإدارة المحتوى والطلبات والإعدادات.",
    overview_en: "Sample case study placeholder.",
    overview_ar: "نص نموذجي لدراسة الحالة.",
    challenge_en: "Sample challenge text.",
    challenge_ar: "نص نموذجي للتحدي.",
    solution_en: "Sample solution text.",
    solution_ar: "نص نموذجي للحل.",
    role_en: "Full frontend + Supabase backend.",
    role_ar: "الواجهة الأمامية وخلفية Supabase بالكامل.",
    tech: ["JavaScript", "Supabase", "CSS"],
    outcome_en: "",
    outcome_ar: "",
    liveUrl: "https://example.com",
    githubUrl: "",
    client: "",
    image: "",
    gallery: [],
    videoUrl: "",
    published: true,
    order: 2,
    sample: true,
  },
  {
    id: "sample-landing",
    slug: "sample-landing-page",
    title_en: "Sample — Multilingual Business Website",
    title_ar: "نموذج — موقع أعمال متعدد اللغات",
    category_en: "Business Website",
    category_ar: "موقع أعمال",
    short_en: "SAMPLE project: a fast EN/AR business website with contact-to-WhatsApp flow.",
    short_ar: "مشروع نموذجي: موقع أعمال سريع بالعربية والإنجليزية مع تحويل التواصل إلى واتساب.",
    overview_en: "Sample case study placeholder.",
    overview_ar: "نص نموذجي لدراسة الحالة.",
    challenge_en: "Sample challenge text.",
    challenge_ar: "نص نموذجي للتحدي.",
    solution_en: "Sample solution text.",
    solution_ar: "نص نموذجي للحل.",
    role_en: "Design, development, bilingual setup.",
    role_ar: "التصميم والتطوير وإعداد تعدد اللغات.",
    tech: ["HTML", "CSS", "JavaScript"],
    outcome_en: "",
    outcome_ar: "",
    liveUrl: "https://example.com",
    githubUrl: "",
    client: "",
    image: "",
    gallery: [],
    videoUrl: "",
    published: true,
    order: 3,
    sample: true,
  },
];

export const SERVICES = [
  { id: "s1", category_en: "Websites", category_ar: "المواقع الإلكترونية", order: 1, items: [
    { en: "Business websites", ar: "مواقع أعمال" }, { en: "Personal websites", ar: "مواقع شخصية" },
    { en: "Portfolio websites", ar: "مواقع أعمال سابقة" }, { en: "Landing pages", ar: "صفحات هبوط" },
    { en: "Brand websites", ar: "مواقع علامات تجارية" }, { en: "Multilingual websites", ar: "مواقع متعددة اللغات" } ] },
  { id: "s2", category_en: "Web Applications", category_ar: "تطبيقات الويب", order: 2, items: [
    { en: "Booking systems", ar: "أنظمة الحجز" }, { en: "Admin dashboards", ar: "لوحات إدارة" },
    { en: "Request & order systems", ar: "أنظمة الطلبات" }, { en: "Database-powered apps", ar: "تطبيقات بقواعد بيانات" },
    { en: "Content management systems", ar: "أنظمة إدارة المحتوى" }, { en: "Progressive web apps (when appropriate)", ar: "تطبيقات ويب تقدمية (عند الحاجة)" } ] },
  { id: "s3", category_en: "Website Improvement", category_ar: "تحسين المواقع", order: 3, items: [
    { en: "UI/UX improvements", ar: "تحسين الواجهة والتجربة" }, { en: "Responsive fixes", ar: "إصلاح التجاوب" },
    { en: "Performance improvements", ar: "تحسين الأداء" }, { en: "SEO basics", ar: "أساسيات SEO" },
    { en: "Website redesign", ar: "إعادة تصميم المواقع" }, { en: "Bug fixing", ar: "إصلاح الأخطاء" } ] },
  { id: "s4", category_en: "Integrations", category_ar: "التكاملات", order: 4, items: [
    { en: "Supabase integrations", ar: "تكامل Supabase" }, { en: "WhatsApp integrations", ar: "تكامل واتساب" },
    { en: "Database integrations", ar: "تكامل قواعد البيانات" }, { en: "Simple workflow automation", ar: "أتمتة سير عمل بسيطة" },
    { en: "Simple AI integrations", ar: "تكاملات ذكاء اصطناعي بسيطة" } ] },
];

export const EXPERIENCE = [
  {
    id: "exp-1",
    role_en: "Web Developer at a Marketing Agency",
    role_ar: "مطوّر ويب في وكالة تسويق",
    org_en: "Marketing Agency",
    org_ar: "وكالة تسويق",
    period_en: "",
    period_ar: "",
    desc_en: "Worked in a real marketing and business environment, developing websites and digital solutions while learning how websites support marketing goals — from presenting a business professionally to guiding visitors toward contact and conversion.",
    desc_ar: "عملت في بيئة تسويق وأعمال حقيقية، وطوّرت مواقع وحلولًا رقمية مع فهم كيفية دعم المواقع لأهداف التسويق — من عرض العمل باحترافية إلى توجيه الزوار نحو التواصل والتحويل.",
    points_en: [
      "Understanding client requirements and business needs",
      "Connecting website design and functionality with practical business objectives",
      "Building websites and digital solutions in a real agency workflow",
    ],
    points_ar: [
      "فهم متطلبات العملاء واحتياجات الأعمال",
      "ربط تصميم الموقع ووظائفه بالأهداف العملية للعمل",
      "بناء مواقع وحلول رقمية ضمن سير عمل وكالة حقيقي",
    ],
    order: 1,
  },
];

export const WHY = [
  { en: "Understanding business requirements", ar: "فهم متطلبات العمل", d_en: "I start from your goals, not from templates.", d_ar: "أبدأ من أهدافك، لا من القوالب." },
  { en: "Clear communication", ar: "تواصل واضح", d_en: "Honest updates and simple explanations.", d_ar: "تحديثات صادقة وشرح بسيط." },
  { en: "Custom solutions", ar: "حلول مخصصة", d_en: "Built around your workflow, not generic.", d_ar: "مبنية حول سير عملك، لا عامة." },
  { en: "Responsive development", ar: "تطوير متجاوب", d_en: "Works beautifully on every device.", d_ar: "يعمل بشكل ممتاز على كل جهاز." },
  { en: "Practical functionality", ar: "وظائف عملية", d_en: "Features that serve real users.", d_ar: "مزايا تخدم مستخدمين حقيقيين." },
  { en: "Clean, maintainable code", ar: "كود نظيف وقابل للصيانة", d_en: "Organized so it can grow with you.", d_ar: "منظّم لينمو معك." },
  { en: "Focus on usability", ar: "تركيز على سهولة الاستخدام", d_en: "Simple, fast, and easy to use.", d_ar: "بسيط وسريع وسهل الاستخدام." },
];

export const TECH = ["HTML", "CSS", "JavaScript", "Supabase", "Git & GitHub", "Vercel"];

export const TESTIMONIALS = []; // Hidden until real testimonials are added via dashboard
export const ACHIEVEMENTS = []; // Hidden until verified items are added
export const CERTIFICATES = []; // Hidden until verified items are added
