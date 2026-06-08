import { BrandMark } from "@/components/BrandMark";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      ["Zadat úkol", "/zadat-ukol"],
      ["Kategorie", "/kategorie"],
      ["Poskytovatelé", "/poskytovatele"],
      ["Aktuální úkoly", "/tasks"],
    ],
  },
  {
    title: "Pro poskytovatele",
    links: [
      ["Registrace", "/registrace-poskytovatel"],
      ["Dashboard", "/poskytovatel/dashboard"],
      ["Výplaty", "/vyplaty"],
      ["Podmínky", "/podminky-pro-poskytovatele"],
    ],
  },
  {
    title: "Důvěra",
    links: [
      ["Bezpečnost", "/bezpecnost"],
      ["Kontakt", "/kontakt"],
      ["Ochrana údajů", "/ochrana-osobnich-udaju"],
      ["Cookies", "/cookies"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a className="brand" href="/">
          <BrandMark />
          <span className="brand-copy">
            <strong>Taskovo</strong>
            <small>Pomoc. Rychle. Spolehlivě.</small>
          </span>
        </a>
        <p>Český marketplace pro lokální úkoly, služby a ověřenou pomoc v okolí. Taskovo je zprostředkovatelská platforma, ne zaměstnavatel poskytovatelů.</p>
      </div>
      <div className="footer-columns">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
