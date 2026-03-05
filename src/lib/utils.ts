export function generateId(): string {
  return crypto.randomUUID();
}

export function cn(...classes: ReadonlyArray<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}
