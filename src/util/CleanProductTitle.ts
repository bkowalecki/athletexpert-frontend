// src/util/CleanProductTitle.ts

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeBasicEntities(input: string): string {
  return input
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&");
}

const BLACKLIST = [
  "women's",
  "men's",
  "unisex",
  "quick dry",
  "premium",
  "lightweight",
  "official",
  "durable",
  "exclusive",
  "usa",
  "mesh",
  "liner",
  "core",
  "gear",
  "equipment",
  "training",
  "athletic",
  "gym",
  "track",
  "workout",
  "zip pocket",
  "with",
  "for",
];

const CleanProductTitle = (title: string): string => {
  if (!title) return "";

  let cleaned = decodeBasicEntities(title);

  // Split on common delimiters and take the first segment
  cleaned = cleaned.split("|")[0].split(" - ")[0].split(" — ")[0].trim();

  // Remove size/dimension noise (e.g., 3', 7", 10″)
  cleaned = cleaned.replace(/\b\d+['’″"]{1,2}\b/g, "");

  // Remove blacklist phrases/words (case-insensitive)
  for (const term of BLACKLIST) {
    const rx = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
    cleaned = cleaned.replace(rx, "").trim();
  }

  // Collapse whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  // Optional: cap to first 6 words
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length > 6) cleaned = words.slice(0, 6).join(" ");

  // Capitalize first letter
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
};

export default CleanProductTitle;
