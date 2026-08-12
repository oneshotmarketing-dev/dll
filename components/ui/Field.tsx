import { cn } from "@/lib/cn";

// Shared form-control primitives. Dark surface, 12px radius, hairline border,
// gold focus ring (DESIGN.md §4 form controls). Correct mobile input types.

const controlBase =
  "w-full rounded-input bg-surface border border-hairline text-ink placeholder:text-muted px-4 py-3 text-base transition-colors focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold";

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-ink">
      {children}
      {required ? <span className="text-gold"> *</span> : null}
    </label>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-error" style={{ color: "#ffb4ab" }}>
      {message}
    </p>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, "min-h-[44px]", className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-[120px] resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlBase, "min-h-[44px] appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}
