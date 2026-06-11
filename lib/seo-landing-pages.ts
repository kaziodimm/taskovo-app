export type SeoLandingPage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  category: string;
  city: string;
  averageBudget: string;
  responseTime: string;
  taskerCta: string;
  clientCta: string;
  examples: string[];
  districts: string[];
  trust: string[];
  steps: { title: string; text: string }[];
  faq: { question: string; answer: string }[];
};

export const seoLandingPages: Record<string, SeoLandingPage> = {
  uklidPraha: {
    slug: "uklid-praha",
    title: "Uklid Praha",
    metaTitle: "Uklid Praha | Overeni taskeri na uklid | Taskovo",
    metaDescription: "Najdete pomoc s uklidem v Praze. Taskovo propojuje klienty s nezavislymi taskery, OSVC nebo firmami. Klient si taskera vybira samostatne.",
    h1: "Uklid v Praze bez hledani po skupinach",
    lead: "Zadejte uklid bytu, domu, kancelare nebo jednorazovou pomoc po stehovani. Taskovo vam pomuze porovnat nabidky nezavislych taskeru v Praze.",
    category: "Uklid",
    city: "Praha",
    averageBudget: "700-2 500 Kc",
    responseTime: "pilotne podle dostupnosti taskeru",
    taskerCta: "Nabidnout uklid",
    clientCta: "Zadat uklid",
    examples: ["pravidelny uklid bytu", "jednorazovy generalni uklid", "uklid po stehovani", "myti koupelny a kuchyne", "uklid kancelare"],
    districts: ["Vinohrady", "Zizkov", "Smichov", "Karlin", "Dejvice", "Nusle"],
    trust: ["overena totoznost v dalsi fazi", "recenze po kazdem ukolu", "bezpecna komunikace v objednavce", "klient vybira taskera samostatne"],
    steps: [
      { title: "Popiste uklid", text: "Napiste misto, rozsah prace, termin a orientacni rozpocet." },
      { title: "Porovnejte nabidky", text: "Taskeri poslou cenu, zpravu a dostupnost." },
      { title: "Vyberte taskera", text: "Rozhodnuti je vzdy na klientovi. Taskovo pouze zprostredkuje kontakt." },
    ],
    faq: [
      { question: "Je Taskovo uklidova firma?", answer: "Ne. Taskovo je zprostredkovatelska platforma. Uklid provadi nezavisly tasker, OSVC nebo firma." },
      { question: "Muzu si vybrat konkretniho taskera?", answer: "Ano. Klient porovna nabidky a samostatne vybere taskera, ktery mu vyhovuje." },
      { question: "Ukaze se kontakt hned?", answer: "Kontakt se zobrazi az po vyberu taskera, aby domluva zustala u konkretni objednavky." },
    ],
  },
  stehovaniPraha: {
    slug: "stehovani-praha",
    title: "Stehovani Praha",
    metaTitle: "Stehovani Praha | Pomoc se stehovanim | Taskovo",
    metaDescription: "Zadejte stehovani v Praze a porovnejte nabidky nezavislych taskeru. Taskovo je pouze zprostredkovatelska platforma.",
    h1: "Stehovani v Praze s jasnou domluvou",
    lead: "Potrebujete odnest nabytek, prevezt krabice nebo pomoci s mensim stehovanim? Taskovo soustredi poptavku a nabidky na jednom miste.",
    category: "Stehovani",
    city: "Praha",
    averageBudget: "1 000-5 000 Kc",
    responseTime: "podle velikosti ukolu a auta",
    taskerCta: "Nabidnout stehovani",
    clientCta: "Zadat stehovani",
    examples: ["mensi stehovani bytu", "odvoz skrini nebo pohovky", "vyneseni do patra", "prevoz krabic", "pomoc pri vyklizeni"],
    districts: ["Andel", "Letna", "Vrsovice", "Holesovice", "Pankrac", "Zlicin"],
    trust: ["jasne zadani predem", "fotky jen v detailu objednavky", "nabidky podle realneho rozsahu", "tasker neni zamestnanec Taskovo"],
    steps: [
      { title: "Zadejte objem", text: "Uvedte pocet kusu, patro, vytah, trasu a potrebu auta." },
      { title: "Dostanete nabidky", text: "Taskeri poslou cenu a popis, jak ukol zvladnou." },
      { title: "Domluvte detail", text: "Po vyberu taskera se otevre soukroma domluva u objednavky." },
    ],
    faq: [
      { question: "Zajistuje Taskovo auto?", answer: "Taskovo auto neposkytuje. Tasker v nabidce uvede, zda ma vlastni auto nebo dodavku." },
      { question: "Je mozne vlozit fotky nabytku?", answer: "Ano. Fotky se zobrazuji na detailu objednavky, ne v seznamu vsech ukolu." },
      { question: "Kdo odpovida za provedeni prace?", answer: "Praci provadi nezavisly tasker nebo firma, kterou si klient vybere." },
    ],
  },
  montazPraha: {
    slug: "montaz-nabytku-praha",
    title: "Montaz nabytku Praha",
    metaTitle: "Montaz nabytku Praha | Skladani IKEA a police | Taskovo",
    metaDescription: "Najdete taskera na montaz nabytku v Praze. Police, skrine, postele, stoly a drobne opravy pres zprostredkovatelskou platformu Taskovo.",
    h1: "Montaz nabytku v Praze bez zbytecneho obvolavani",
    lead: "Zadejte, co je potreba smontovat, pridejte termin a rozpocet. Taskeri poslou nabidky a klient si sam vybere nejvhodnejsi profil.",
    category: "Montaz nabytku",
    city: "Praha",
    averageBudget: "600-3 000 Kc",
    responseTime: "casto vhodne na stejny nebo dalsi den",
    taskerCta: "Nabidnout montaz",
    clientCta: "Zadat montaz",
    examples: ["montaz police", "skladani skrine", "postel nebo stul", "pripevneni na zed", "drobne domaci opravy"],
    districts: ["Zizkov", "Vinohrady", "Prosek", "Stodulky", "Chodov", "Modrany"],
    trust: ["domluva v detailu objednavky", "jasna cena pred vyberem", "profil taskera pred rozhodnutim", "recenze po dokonceni"],
    steps: [
      { title: "Popiste nabytek", text: "Uvedte typ, znacku, pocet kusu a zda je potreba vrtani." },
      { title: "Porovnejte cenu", text: "Nabidky ukazi cenu, zpravu a dostupnost taskera." },
      { title: "Potvrdte dokonceni", text: "Po praci klient potvrdi hotovy ukol a pozdeji prida recenzi." },
    ],
    faq: [
      { question: "Musi mit tasker vlastni naradi?", answer: "Klient to uvede v zadani. Tasker v nabidce potvrdi, zda vlastni naradi ma." },
      { question: "Muzu upravit zadani po odeslani?", answer: "U otevrenych ukolu muze klient zadani upravit, dokud neni vybran tasker." },
      { question: "Je Taskovo poskytovatel montaze?", answer: "Ne. Taskovo pouze propojuje klienty s nezavislymi taskery." },
    ],
  },
  doruceniPraha: {
    slug: "doruceni-zasilek-praha",
    title: "Doruceni zasilek Praha",
    metaTitle: "Doruceni zasilek Praha | Kuryrni pomoc pres Taskovo",
    metaDescription: "Potrebujete dorucit zasilku po Praze? Taskovo propojuje klienty s nezavislymi taskery pro jednorazove kuryrni ukoly.",
    h1: "Doruceni zasilek po Praze jako lokalni ukol",
    lead: "Kdyz nepotrebujete velkou kuryrni firmu, ale konkretni pomoc s vyzvednutim, nakupem nebo dorucenim, muzete ukol zadat na Taskovo.",
    category: "Doruceni",
    city: "Praha",
    averageBudget: "300-1 500 Kc",
    responseTime: "podle trasy a casu vyzvednuti",
    taskerCta: "Nabidnout doruceni",
    clientCta: "Zadat doruceni",
    examples: ["vyzvednuti baliku", "doruceni dokumentu", "nakup a dovoz", "prevoz mensi veci", "pomoc seniorum s pochuzkou"],
    districts: ["Centrum", "Karlin", "Vinohrady", "Smichov", "Dejvice", "Pankrac"],
    trust: ["kontakt az po vyberu", "zpravy u objednavky", "jasna trasa a termin", "Taskovo neni dopravce"],
    steps: [
      { title: "Zadejte trasu", text: "Napiste odkud, kam, kdy a co se prevazi." },
      { title: "Vyberte nabidku", text: "Taskeri poslou cenu a casovou dostupnost." },
      { title: "Sledujte domluvu", text: "Detail objednavky drzi zpravy a dalsi kroky pohromade." },
    ],
    faq: [
      { question: "Je Taskovo kuryrni sluzba?", answer: "Ne. Taskovo je platforma, ktera zprostredkuje kontakt mezi klientem a nezavislym taskerem." },
      { question: "Lze zadat nakup a dovoz?", answer: "Ano, pokud popis ukolu jasne uvadi obchod, seznam veci, adresu a rozpocet." },
      { question: "Kdy uvidim kontakt taskera?", answer: "Kontakt se zobrazi po vyberu nabidky klientem." },
    ],
  },
  zahradaPraha: {
    slug: "pomoc-na-zahrade-praha",
    title: "Pomoc na zahrade Praha",
    metaTitle: "Pomoc na zahrade Praha | Sekani, uklid zahrady | Taskovo",
    metaDescription: "Zadejte pomoc na zahrade v Praze a okoli. Sekani, uklid listi, drobne prace a jednorazova vypomoc pres nezavisle taskery.",
    h1: "Pomoc na zahrade v Praze a okoli",
    lead: "Od sekani travy po jednorazovy uklid zahrady. Taskovo pomaha dat poptavku na jedno misto a ziskat nabidky od lidi, kteri praci umi vzit.",
    category: "Zahrada",
    city: "Praha",
    averageBudget: "800-4 000 Kc",
    responseTime: "podle pocasi, rozsahu a vybaveni",
    taskerCta: "Nabidnout praci na zahrade",
    clientCta: "Zadat zahradu",
    examples: ["sekani travy", "uklid listi", "strihani keru", "odvoz zeleneho odpadu", "jednorazova vypomoc kolem domu"],
    districts: ["Praha 4", "Praha 5", "Praha 6", "Praha 9", "Hostivar", "Suchdol"],
    trust: ["rozsah prace predem", "tasker uvede vybaveni", "domluva pres objednavku", "klient rozhoduje o vyberu"],
    steps: [
      { title: "Popiste zahradu", text: "Uvedte velikost, typ prace, pristup a zda je potreba vlastni vybaveni." },
      { title: "Porovnejte taskery", text: "Nabidky ukazi cenu, dostupnost a zkusenosti." },
      { title: "Potvrdte praci", text: "Po dokonceni klient potvrdi vysledek a pozdeji prida recenzi." },
    ],
    faq: [
      { question: "Musi mit tasker vlastni techniku?", answer: "Zalezi na zadani. Tasker v nabidce uvede, zda ma sekacku, naradi nebo auto." },
      { question: "Funguje to i mimo centrum Prahy?", answer: "Ano, stranka cilm na Prahu a okoli. V pilotu bude dostupnost zaviset na poctu taskeru." },
      { question: "Zamestnava Taskovo zahradniky?", answer: "Ne. Taskovo nezamestnava taskery a praci primo neposkytuje." },
    ],
  },
};
