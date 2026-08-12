import { Logo } from "@/components/layout/Logo";

// Shared centered-card layout for the auth pages (/login, /forgot-password).
// The site header and footer come from the root layout; this only centers a
// max-w-[440px] column with the brand logo above the page's content.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-16 md:py-24">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </main>
  );
}
