import { BrandMark } from "@/components/BrandMark";

const footerGroups = [
  {
    title: "Marketplace",
    links: [["Zadat úkol", "/zadat-ukol"], ["Kategorie", "/kategorie"], ["Taskeři", "/poskytovatele"], ["Aktuální úkoly", "/tasks"]],
  },
  {
    title: "Služby v Praze",
    links: [["Úklid Praha", "/uklid-praha"], ["Stěhování Praha", "/stehovani-praha"], ["Montáž nábytku Praha", "/montaz-nabytku-praha"], ["Doručení zásilek Praha", "/doruceni-zasilek-praha"], ["Pomoc na zahradě Praha", "/pomoc-na-zahrade-praha"]],
  },
  {
    title: "Jak to funguje",
    links: [["Pro zákazníky", "/pro-zakazniky"], ["Pro taskery", "/pro-taskery"], ["Postup platformy", "/jak-to-funguje"], ["FAQ", "/faq"]],
  },
  {
    title: "Pro taskery",
    links: [["Registrace", "/registrace-poskytovatel"], ["Dashboard", "/poskytovatel/dashboard"], ["Výplaty", "/vyplaty"], ["Podmínky", "/podminky-pro-poskytovatele"]],
  },
  {
    title: "Důvěra a právo",
    links: [["Bezpečnost", "/bezpecnost"], ["Platby", "/platby"], ["Kontakt", "/kontakt"], ["Obchodní podmínky", "/obchodni-podminky"], ["Ochrana údajů", "/ochrana-osobnich-udaju"], ["Cookies", "/cookies"]],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a className="brand" href="/"><BrandMark /><span className="brand-copy"><strong>Taskovo</strong><small>Pomoc. Rychle. Spolehlivě.</small></span></a>
        <p>Český marketplace pro lokální úkoly, služby a ověřenou pomoc v okolí. Taskovo je zprostředkovatelská platforma, ne zaměstnavatel taskerů.</p>
      </div>
      <div className="footer-columns">
        {footerGroups.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>)}
      </div>
    </footer>
  );
}
