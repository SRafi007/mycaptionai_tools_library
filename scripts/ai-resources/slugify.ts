import slugifyPackage from "slugify";

export function makeSlug(input: string): string {
  return slugifyPackage(input, {
    lower: true,
    strict: true,
    trim: true,
  }).slice(0, 120);
}
