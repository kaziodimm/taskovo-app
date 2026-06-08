export function BrandMark({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? "brand-mark brand-mark-large" : "brand-mark"} aria-hidden="true">
      <span className="brand-skyline" />
      <span className="brand-building brand-building-left" />
      <span className="brand-building brand-building-right" />
      <span className="brand-road-left" />
      <span className="brand-road-right" />
      <span className="brand-road-line" />
      <span className="brand-person" />
    </span>
  );
}
