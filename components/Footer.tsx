import { BrandMark } from "@/components/BrandMark";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      ["Zadat ukol", "/zadat-ukol"],
      ["Kategorie", "/kategorie"],
      ["Poskytovatele", "/poskytovatele"],
      ["Aktualni ukoly", "/tasks"],
    ],
  },
  {
    title: "Pro poskytovatele",
    links: [
      ["Registrace", "/registrace-poskytovatel"],
      ["Dashboard", "/poskytovatel/dashboard"],
      ["Vyplaty", "/vyplaty"],
      ["Podminky", "/podminky-pro-poskytovatele"],
    ],
  },
  {
    title: "Duvěra",
    links: [
      ["Bezpecnost", "/bezpecnost"],
      ["Kontakt", "/kontakt"],
      ["Ochrana udaju", "/ochrana-osobnich-udaju"],
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
            <small>Pomoc. Rychle. Spolehlive.</small>
          </span>
        </a>
        <p>Cesky marketplace pro lokalni ukoly, sluzby a overenou pomoc v okoli. Taskovo je zprostredkovatelska platforma, ne zamestnavatel poskytovatelu.</p>
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
