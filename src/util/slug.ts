export function slugifySportName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
}

export function deslugifySportSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}
