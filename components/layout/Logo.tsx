import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

// Brand logo image (winged DLL mark + "Dees Language Lounge" wordmark baked in),
// on a transparent PNG so it sits on the dark canvas. `compact` renders it a
// touch smaller for tight chrome.
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center focus-gold rounded-icon"
      aria-label={`${site.name} — home`}
    >
      <Image
        src="/images/logo_280x134.png"
        alt={site.name}
        width={280}
        height={134}
        priority
        className={compact ? "h-12 w-auto" : "h-14 w-auto md:h-24"}
      />
    </Link>
  );
}
