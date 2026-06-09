export type MarketplaceCategory = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  icon: string;
  averagePrice: string;
  responseTime: string;
  examples: string[];
};

export type FeaturedProvider = {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  completedTasks: number;
  priceFrom: string;
  categories: string[];
  verified: boolean;
  responseTime: string;
  bio: string;
  avatarUrl?: string | null;
};

export const cities = ["Praha", "Brno", "Ostrava", "Plzeň", "Olomouc", "Liberec", "České Budějovice", "Hradec Králové"];

export const marketplaceCategories: MarketplaceCategory[] = [
  {
    slug: "uklid",
    title: "Úklid domácnosti",
    shortTitle: "Úklid",
    summary: "Jednorázový i pravidelný úklid bytu, domu nebo kanceláře.",
    description: "Najděte ověřené poskytovatele pro běžný úklid, koupelnu, kuchyň, podlahy, okna i přípravu bytu před návštěvou nebo pronájmem.",
    icon: "CL",
    averagePrice: "od 350 Kč/h",
    responseTime: "nabídky obvykle do 25 minut",
    examples: ["Úklid 2+kk", "Úklid po stěhování", "Mytí oken", "Pravidelný týdenní úklid"],
  },
  {
    slug: "stehovani",
    title: "Stěhování a odnos věcí",
    shortTitle: "Stěhování",
    summary: "Pomoc s krabicemi, nábytkem, odnos do sklepa nebo odvoz věcí.",
    description: "Pro menší stěhování, odnos těžkých věcí, vyklízení a pomoc tam, kde nepotřebujete velkou stěhovací firmu.",
    icon: "MV",
    averagePrice: "od 500 Kč/h",
    responseTime: "rychlé termíny ve městech",
    examples: ["Odnos pračky", "Převoz krabic", "Vyklízení sklepa", "Pomoc s nakládkou"],
  },
  {
    slug: "montaz-nabytku",
    title: "Montáž nábytku",
    shortTitle: "Montáž",
    summary: "Skříně, postele, police, stoly a drobné domácí instalace.",
    description: "Vyberte si člověka, který umí smontovat nábytek, připevnit police, zkontrolovat díly a uklidit obaly po práci.",
    icon: "MT",
    averagePrice: "od 450 Kč/h",
    responseTime: "často ještě dnes",
    examples: ["Skříň IKEA", "Postel a komoda", "Police na zeď", "Kancelářský stůl"],
  },
  {
    slug: "doruceni",
    title: "Doručení a vyzvednutí",
    shortTitle: "Doručení",
    summary: "Balíky, nákupy, dokumenty, vyzvednutí z výdejních míst.",
    description: "Pro lidi, kteří nemají čas nebo možnost jezdit po městě. Zadáte trasu, čas a rozpočet.",
    icon: "DL",
    averagePrice: "od 180 Kč",
    responseTime: "nabídky v řádu minut",
    examples: ["Vyzvednout balík", "Dovézt nákup", "Předat dokumenty", "Vyzvednout léky"],
  },
  {
    slug: "zahrada",
    title: "Pomoc na zahradě",
    shortTitle: "Zahrada",
    summary: "Sekání, hrabání, drobná údržba a sezónní práce.",
    description: "Taskovo propojí majitele zahrad s lidmi v okolí pro pravidelnou nebo jednorázovou pomoc venku.",
    icon: "GR",
    averagePrice: "od 300 Kč/h",
    responseTime: "podle sezóny a počasí",
    examples: ["Sekání trávy", "Hrabání listí", "Odvoz větví", "Úklid terasy"],
  },
  {
    slug: "opravy",
    title: "Opravy v domácnosti",
    shortTitle: "Opravy",
    summary: "Drobné opravy, instalace, výměny a domácí údržba.",
    description: "Pro menší práce, které nechcete řešit přes známé: dvířka, kliky, silikon, závěsy, světla nebo drobné opravy.",
    icon: "FX",
    averagePrice: "od 450 Kč/h",
    responseTime: "ověření podle typu práce",
    examples: ["Oprava kliky", "Montáž garnýže", "Výměna těsnění", "Drobná elektroinstalace"],
  },
];

export const featuredProviders: FeaturedProvider[] = [
  {
    id: "jan-k",
    name: "Jan Král",
    city: "Praha",
    rating: 4.9,
    reviews: 128,
    completedTasks: 312,
    priceFrom: "350 Kč/h",
    categories: ["Montáž", "Stěhování", "Opravy"],
    verified: true,
    responseTime: "odpovídá do 12 min",
    bio: "OSVČ s vlastním nářadím a autem. Nejčastěji řeší montáž nábytku, police a menší stěhování po Praze.",
  },
  {
    id: "petra-s",
    name: "Petra Svobodová",
    city: "Brno",
    rating: 4.8,
    reviews: 94,
    completedTasks: 221,
    priceFrom: "320 Kč/h",
    categories: ["Úklid", "Pomoc seniorům", "Doručení"],
    verified: true,
    responseTime: "odpovídá do 20 min",
    bio: "Pečlivá pomoc pro domácnosti, seniory a pravidelné úklidy. Má recenze od opakovaných klientů.",
  },
  {
    id: "marek-v",
    name: "Marek Vávra",
    city: "Olomouc",
    rating: 4.7,
    reviews: 61,
    completedTasks: 147,
    priceFrom: "250 Kč/h",
    categories: ["Doručení", "Zahrada", "Odvoz věcí"],
    verified: true,
    responseTime: "odpovídá do 18 min",
    bio: "Flexibilní kurýr a pomocník pro menší města. Vhodný pro nákupy, balíky, zahradu a odnos věcí.",
  },
];

export const trustBadges = [
  "Ověření poskytovatelé",
  "Bezpečná platba",
  "Recenze od zákazníků",
  "Žádné skryté poplatky",
];

export const faqs = [
  {
    question: "Je Taskovo zaměstnavatel poskytovatelů?",
    answer: "Ne. Taskovo je zprostředkovatelská platforma. Poskytovatelé vystupují jako nezávislé osoby, OSVČ nebo firmy a odpovídají za své služby, daně a oprávnění.",
  },
  {
    question: "Jak si klient vybere poskytovatele?",
    answer: "Klient zadá úkol, porovná nabídky, profily, cenu a hodnocení. Potom sám potvrdí, komu úkol přidělí.",
  },
  {
    question: "Proč je to vhodné i mimo Prahu a Brno?",
    answer: "V menších městech často nejsou organizované služby ani rychlá lokální pomoc. Marketplace může spojit poptávku s lidmi, kteří už hledají přivýdělek v okolí.",
  },
  {
    question: "Kdy se budou řešit platby a výplaty?",
    answer: "Základní struktura je připravená. V další fázi přidáme Stripe, rezervaci platby, potvrzení dokončení a výplatu poskytovateli.",
  },
];

export const legalPages = {
  "obchodni-podminky": {
    title: "Obchodní podmínky",
    lead: "Pravidla pro klienty, poptávky, nabídky, platby, reklamace a používání platformy Taskovo.",
  },
  "podminky-pro-poskytovatele": {
    title: "Podmínky pro poskytovatele",
    lead: "Poskytovatelé jsou nezávislí OSVČ nebo firmy. Platforma nezakládá pracovněprávní vztah ani neřídí způsob provedení služby.",
  },
  "ochrana-osobnich-udaju": {
    title: "Ochrana osobních údajů",
    lead: "Základní informace o zpracování kontaktů, profilů, komunikace, plateb a bezpečnostních záznamů.",
  },
  cookies: {
    title: "Cookies",
    lead: "Informace o technických, analytických a marketingových cookies, které budou zapojeny až podle produkční konfigurace.",
  },
};
