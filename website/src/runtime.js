// Relative URLs work both at a domain root and below a static-hosting subpath.
export function assetUrl(path) {
  return `${import.meta.env?.BASE_URL ?? "./"}${path.replace(/^\/+/, "")}`;
}

export function isWorldVisible(object) {
  for (let node = object; node; node = node.parent) {
    if (!node.visible) return false;
  }
  return true;
}

export function parseSavedConfiguration(raw, parts) {
  const fallback = { version: "7", equippedKits: {}, paint: new Map() };
  try {
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || Array.isArray(saved))
      return fallback;
    const entries = saved.equippedKits;
    const equippedKits =
      entries && typeof entries === "object" && !Array.isArray(entries)
        ? Object.fromEntries(
            Object.entries(entries).filter(([region, key]) =>
              parts.some(
                (part) =>
                  part.region === region && (part.key || "bastion") === key,
              ),
            ),
          )
        : {};
    const paint = new Map();
    if (Array.isArray(saved.paint)) {
      for (const entry of saved.paint) {
        if (
          entry &&
          typeof entry.name === "string" &&
          typeof entry.color === "string" &&
          /^[0-9a-f]{6}$/i.test(entry.color)
        ) {
          paint.set(entry.name, entry.color);
        }
      }
    }
    return {
      version: saved.version === "85" ? "85" : "7",
      equippedKits,
      paint,
    };
  } catch {
    return fallback;
  }
}

export function readSavedConfiguration(parts) {
  try {
    return parseSavedConfiguration(
      localStorage.getItem("armor-workshop-v1"),
      parts,
    );
  } catch {
    // Private browsing and storage policies must not prevent the workshop opening.
    return parseSavedConfiguration(null, parts);
  }
}
