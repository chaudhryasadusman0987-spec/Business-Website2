// Swatch colours for the rental fleet's "available colours" list.
//
// The dashboard stores colours as free text ("Gunmetal Grey", "Pearl White"),
// so the dot next to each name is looked up here rather than stored. Anything
// unrecognised falls back to a neutral grey — an unknown colour still renders a
// dot, it just does not pretend to know the shade.
//
// Shared by the listing cards (VehicleGrid) and the detail modal so both draw
// the same swatch for the same word.

const COLOUR_HEX: Record<string, string> = {
  White: "#f5f5f5",
  "Pearl White": "#f0f0ee",
  Silver: "#c0c0c0",
  Grey: "#808080",
  "Dark Grey": "#404040",
  "Gunmetal Grey": "#2c3539",
  Black: "#1a1a1a",
  Red: "#cc2200",
  Blue: "#1a4a8a",
  "Dark Blue": "#0d2b5e",
  Gold: "#c8a84b",
  "Champagne Gold": "#c4a35a",
  Bronze: "#8c6239",
  Orange: "#e06010",
  Green: "#2d6a30",
  Purple: "#6b2f8a",
  Beige: "#d4c5a9",
  Maroon: "#7d1c1c",
  Brown: "#6b4423",
}

export function getColourHex(colour: string): string {
  const key = colour.trim()
  if (COLOUR_HEX[key]) return COLOUR_HEX[key]
  // Case- and spacing-insensitive second pass, so "gunmetal grey" typed in the
  // dashboard still gets its swatch.
  const norm = key.toLowerCase().replace(/\s+/g, " ")
  const hit = Object.keys(COLOUR_HEX).find((k) => k.toLowerCase() === norm)
  return hit ? COLOUR_HEX[hit] : "#cccccc"
}

/** The colour names the dashboard offers as a hint. */
export const KNOWN_COLOURS = Object.keys(COLOUR_HEX)
