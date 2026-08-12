"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/whatsapp";
import { isPortalPath } from "@/lib/chrome";

// Floating WhatsApp button on every marketing page. Bottom-right, iOS safe-area
// aware. Hidden in the authenticated portal (which has its own support model).
export function WhatsAppWidget() {
  const pathname = usePathname() || "/";
  const href = whatsappLink({ context: "the website" });

  if (isPortalPath(pathname)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-gold"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current" aria-hidden="true">
        <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.59 4.46 1.71 6.402L3.2 28.8l6.57-1.72a12.74 12.74 0 0 0 6.233 1.588h.005c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.332-6.635-3.75-9.052A12.72 12.72 0 0 0 16.003 3.2zm0 2.133c2.83 0 5.49 1.103 7.49 3.104a10.53 10.53 0 0 1 3.104 7.49c0 5.885-4.788 10.667-10.667 10.667h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4.005 1.05 1.07-3.905-.252-.4a10.56 10.56 0 0 1-1.62-5.7c0-5.885 4.787-10.666 10.67-10.666zm-3.86 5.72c-.183 0-.48.068-.732.343-.252.274-.96.938-.96 2.286 0 1.348.983 2.65 1.12 2.834.137.183 1.933 2.952 4.686 4.14.653.282 1.163.45 1.56.577.655.208 1.252.178 1.724.108.526-.078 1.62-.662 1.848-1.302.228-.64.228-1.188.16-1.302-.068-.114-.252-.183-.526-.32-.274-.137-1.62-.8-1.872-.892-.252-.09-.435-.137-.618.138-.183.274-.71.89-.87 1.073-.16.183-.32.206-.594.069-.274-.138-1.156-.426-2.202-1.36-.814-.726-1.364-1.622-1.524-1.896-.16-.274-.017-.422.12-.56.123-.122.274-.32.412-.48.137-.16.183-.274.274-.457.092-.183.046-.343-.023-.48-.068-.138-.618-1.49-.847-2.04-.223-.535-.45-.462-.618-.47l-.526-.01z" />
      </svg>
    </a>
  );
}
