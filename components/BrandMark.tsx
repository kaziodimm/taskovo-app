export function BrandMark({ large = false }: { large?: boolean }) {
  return <img className={large ? "brand-mark brand-mark-large" : "brand-mark"} src="/taskovo-logo.svg" alt="" aria-hidden="true" />;
}
