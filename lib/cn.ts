// Tiny classnames joiner — avoids a dependency for conditional class merging.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
