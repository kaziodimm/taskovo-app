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
};

export const cities = ["Praha", "Brno", "Ostrava", "Plzen", "Olomouc", "Liberec", "Ceske Budejovice", "Hradec Kralove"];

export const marketplaceCategories: MarketplaceCategory[] = [
  {
    slug: "uklid",
    title: "Uklid domacnosti",
    shortTitle: "Uklid",
    summary: "Jednorazovy i pravidelny uklid bytu, domu nebo kancelare.",
    description: "Najdete overene poskytovatele pro bezny uklid, myti koupelny, kuchyne, podlah, oken i pripravu bytu pred navstevou nebo pronajmem.",
    icon: "CL",
    averagePrice: "od 350 Kc/h",
    responseTime: "nabidky obvykle do 25 minut",
    examples: ["Uklid 2+kk", "Uklid po stehovani", "Mytí oken", "Pravidelny tydenni uklid"],
  },
  {
    slug: "stehovani",
    title: "Stehovani a odnos veci",
    shortTitle: "Stehovani",
    summary: "Pomoc s krabicemi, nabytkem, odnos do sklepa nebo odvoz veci.",
    description: "Pro mensi stehovani, odnos tezkych veci, vyklizeni a pomoc tam, kde nepotrebujete velkou stehovaci firmu.",
    icon: "MV",
    averagePrice: "od 500 Kc/h",
    responseTime: "rychle terminy ve mestech",
    examples: ["Odnos pracky", "Prevoz krabic", "Vyklizeni sklepa", "Pomoc s nakladkou"],
  },
  {
    slug: "montaz-nabytku",
    title: "Montaz nabytku",
    shortTitle: "Montaz",
    summary: "Skrine, postele, police, stoly a drobne domaci instalace.",
    description: "Vyberte si cloveka, ktery umi smontovat nabytek, pripevnit police, zkontrolovat dily a uklidit obaly po praci.",
    icon: "MT",
    averagePrice: "od 450 Kc/h",
    responseTime: "casto jeste dnes",
    examples: ["IKEA skrin", "Postel a komoda", "Police na zed", "Kancelarsky stul"],
  },
  {
    slug: "doruceni",
    title: "Doruceni a vyzvednuti",
    shortTitle: "Doruceni",
    summary: "Baliky, nakupy, dokumenty, vyzvednuti z vydejnich mist.",
    description: "Pro lidi, kteri nemaji cas nebo moznost jezdit po meste. Zadate trasu, cas a rozpoctovy limit.",
    icon: "DL",
    averagePrice: "od 180 Kc",
    responseTime: "nabidky v radech minut",
    examples: ["Vyzvednout balik", "Dovezt nakup", "Predat dokumenty", "Vyzvednout leky"],
  },
  {
    slug: "zahrada",
    title: "Pomoc na zahrade",
    shortTitle: "Zahrada",
    summary: "Sekani, hrabani, drobna udrzba a sezonni prace.",
    description: "Taskovo umi spojit majitele zahrad s lidmi v okoli pro pravidelnou nebo jednorazovou pomoc venku.",
    icon: "GR",
    averagePrice: "od 300 Kc/h",
    responseTime: "podle sezony a pocasi",
    examples: ["Sekani travy", "Hrabani listi", "Odvoz vetvi", "Uklid terasy"],
  },
  {
    slug: "opravy",
    title: "Opravy v domacnosti",
    shortTitle: "Opravy",
    summary: "Drobne opravy, instalace, vymeny a domaci udrzba.",
    description: "Pro male prace, ktere nechcete resit pres zname: dvirka, kliky, silikon, zavesy, svetla nebo drobne opravy.",
    icon: "FX",
    averagePrice: "od 450 Kc/h",
    responseTime: "overeni podle typu prace",
    examples: ["Oprava kliky", "Montaz garnyze", "Vymena tesneni", "Drobna elektroinstalace"],
  },
];

export const featuredProviders: FeaturedProvider[] = [
  {
    id: "jan-k",
    name: "Jan Kral",
    city: "Praha",
    rating: 4.9,
    reviews: 128,
    completedTasks: 312,
    priceFrom: "350 Kc/h",
    categories: ["Montaz", "Stehovani", "Opravy"],
    verified: true,
    responseTime: "odpovida do 12 min",
    bio: "OSVC s vlastnim naradim a autem. Nejvic bere montaz nabytku, police a mensi stehovani po Praze.",
  },
  {
    id: "petra-s",
    name: "Petra Svobodova",
    city: "Brno",
    rating: 4.8,
    reviews: 94,
    completedTasks: 221,
    priceFrom: "320 Kc/h",
    categories: ["Uklid", "Pomoc seniorum", "Doruceni"],
    verified: true,
    responseTime: "odpovida do 20 min",
    bio: "Pecliva pomoc pro domacnosti, seniory a pravidelne uklidy. Ma recenze od opakovanych klientu.",
  },
  {
    id: "marek-v",
    name: "Marek Vavra",
    city: "Olomouc",
    rating: 4.7,
    reviews: 61,
    completedTasks: 147,
    priceFrom: "250 Kc/h",
    categories: ["Doruceni", "Zahrada", "Odvoz veci"],
    verified: true,
    responseTime: "odpovida do 18 min",
    bio: "Flexibilni kuryr a pomocnik pro mensi mesta. Vhodny pro nakupy, baliky, zahradu a odnos veci.",
  },
];

export const trustBadges = [
  "Overeni poskytovatele",
  "Bezpecna platba",
  "Recenze od zakazniku",
  "Zadne skryte poplatky",
];

export const faqs = [
  {
    question: "Je Taskovo zamestnavatel poskytovatelu?",
    answer: "Ne. Taskovo je zprostredkovatelska platforma. Poskytovatele vystupuji jako nezavisle osoby, OSVC nebo firmy a odpovidaji za sve sluzby, dane a opravneni.",
  },
  {
    question: "Jak si klient vybere poskytovatele?",
    answer: "Klient zada ukol, porovna nabidky, profily, cenu, hodnoceni a sam potvrdi, komu ukol pridelí.",
  },
  {
    question: "Proc je to vhodne i mimo Prahu a Brno?",
    answer: "V mensich mestech casto nejsou organizovane sluzby ani rychla lokalni pomoc. Marketplace muze spojit poptavku s lidmi, kteri uz hledaji privydelek v okoli.",
  },
  {
    question: "Kdy se budou resit platby a vyplaty?",
    answer: "Zakladni struktura je pripravena. V dalsi fazi se prida Stripe, rezervace platby, potvrzeni dokonceni a vyplata poskytovateli.",
  },
];

export const legalPages = {
  "obchodni-podminky": {
    title: "Obchodni podminky",
    lead: "Pravidla pro klienty, poptavky, nabidky, platby, reklamace a pouzivani platformy Taskovo.",
  },
  "podminky-pro-poskytovatele": {
    title: "Podminky pro poskytovatele",
    lead: "Poskytovatele jsou nezavisli OSVC nebo firmy. Platforma nezaklada pracovněpravni vztah ani neridi zpusob provedeni sluzby.",
  },
  "ochrana-osobnich-udaju": {
    title: "Ochrana osobnich udaju",
    lead: "Zakladni informace o zpracovani kontaktu, profilu, komunikace, plateb a bezpecnostnich zaznamu.",
  },
  cookies: {
    title: "Cookies",
    lead: "Informace o technickych, analytickych a marketingovych cookies, ktere budou zapojeny az podle produkcni konfigurace.",
  },
};
