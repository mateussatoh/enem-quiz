// Every DDD currently assigned by Anatel.
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Accepts optional +55 prefix. Returns national digits (DDD + number) or null. */
export function normalizeBrazilianPhone(value: string): string | null {
  let digits = onlyDigits(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  if (!VALID_DDDS.has(Number(digits.slice(0, 2)))) return null;
  // Mobile numbers have 9 digits and start with 9; landlines have 8 and start with 2-5.
  const local = digits.slice(2);
  if (local.length === 9 && !local.startsWith("9")) return null;
  if (local.length === 8 && !/^[2-5]/.test(local)) return null;
  return digits;
}

/** Progressive mask for inputs: "(11) 98765-4321" / "(11) 3456-7890". */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = rest.length === 9 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
