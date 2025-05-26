// src/utils/cleanProductTitle.ts

const CleanProductTitle = (title: string): string => {
    if (!title) return "";
  
    // Step 1: Decode basic HTML entities (just ' for now)
    let cleaned = title.replace(/&#x27;|&apos;/g, "'");
  
    // Step 2: Split on major delimiters and take the first part
    cleaned = cleaned.split("|")[0].split("-")[0].trim();
  
    // Step 3: Remove size/dimension noise (e.g., "3''", "7\"", etc.)
    cleaned = cleaned.replace(/\d+['’″"]{1,2}/g, "");
  
    // Step 4: Remove known buzzwords
    const blacklist = [
      "women's", "men's", "unisex",
      "quick dry", "premium", "lightweight", "official", "durable",
      "exclusive", "USA", "mesh", "liner", "core", "gear", "equipment",
      "training", "athletic", "gym", "track", "workout", "zip pocket", "with", "for"
    ];
  
    blacklist.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleaned = cleaned.replace(regex, "").trim();
    });
  
    // Step 5: Collapse extra spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ");
  
    // Step 6: Trim to first 6 words (optional but clean)
    const words = cleaned.split(" ");
    if (words.length > 6) {
      cleaned = words.slice(0, 6).join(" ");
    }
  
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };
  
  export default CleanProductTitle;
  