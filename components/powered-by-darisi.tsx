import Image from "next/image";

import { Button } from "@/components/ui/button";

export function PoweredByDarisi() {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="h-auto gap-1.5 px-0 text-muted-foreground/70 hover:bg-transparent hover:text-muted-foreground"
    >
      <a href="https://darisi.in" target="_blank" rel="noopener noreferrer">
        <span className="text-[10px] uppercase tracking-[0.16em]">Powered by</span>
        <Image src="/logos/darisi.svg" alt="DARISI" width={18} height={18} className="rounded-md" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">DARISI</span>
      </a>
    </Button>
  );
}
