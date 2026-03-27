import Image from "next/image";

export function PoweredByDarisi() {
  return (
    <a
      href="https://darisi.in"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-muted-foreground/70 transition-colors hover:text-muted-foreground"
    >
      <span className="text-xs uppercase tracking-[0.2em]">Powered by</span>
      <Image src="/logos/darisi.svg" alt="DARISI" width={25} height={25} className="rounded-lg" />
      <span className="text-xs font-semibold uppercase tracking-[0.28em]">DARISI</span>
    </a>
  );
}
