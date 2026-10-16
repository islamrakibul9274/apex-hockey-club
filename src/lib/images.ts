/**
 * Central image manifest.
 *
 * Every photograph lives in /public/images as three consistent WebP crops
 * (wide 16:9, card 4:3, thumb 1:1), so cards and banners never letterbox.
 * Components reference a role here rather than hard-coding a filename, which
 * keeps aspect ratios consistent and makes swapping imagery a one-line change.
 *
 * Sources are Pexels, stored in-repo rather than hotlinked. See
 * public/images/ATTRIBUTION.md.
 */

export type ImageRole = "wide" | "card" | "thumb";

export const IMG = {
  heroAction: "hero-action",
  heroPuck: "hero-puck",
  arena: "arena-empty",
  teamAction: "team-action",
  teamDuel: "team-duel",
  playerGear: "player-gear",
  goalieKneel: "goalie-kneel",
  goalieWatch: "goalie-watch",
  sticks: "sticks-lean",
  jersey: "jersey-rw",
  matchBoard: "match-board",
  skater: "skater-red",
} as const;

/** Key of the IMG map, e.g. "heroAction". */
export type ImageKey = keyof typeof IMG;

/** Returns the path for a photo at a given crop. */
export function img(key: ImageKey, role: ImageRole = "card"): string {
  return `/images/${IMG[key]}-${role}.webp`;
}

/**
 * Intrinsic dimensions of each crop, so next/image can reserve space and the
 * page does not shift while images load.
 */
export const IMG_DIMENSIONS: Record<
  ImageRole,
  { width: number; height: number }
> = {
  wide: { width: 1600, height: 900 },
  card: { width: 1000, height: 750 },
  thumb: { width: 480, height: 480 },
};

/** Descriptive alt text. Decorative images must use alt="" instead. */
export const IMG_ALT: Record<ImageKey, string> = {
  heroAction: "Young hockey player in full gear skating on an indoor rink",
  heroPuck: "Hockey stick blade and black pucks on the ice",
  arena: "Overhead view of hockey players and a referee at a face-off",
  teamAction: "Ice hockey players approaching the goal during a game",
  teamDuel: "Hockey players defending their goal on an indoor rink",
  playerGear: "Hockey player wearing a helmet and gloves at a rink",
  goalieKneel: "Hockey players practising on an indoor ice rink",
  goalieWatch: "Player in a red jersey standing on an ice rink",
  sticks: "Close view of hockey skates, sticks, and goalie pads on the ice",
  jersey: "Hockey player manoeuvring a stick and puck on the ice",
  matchBoard: "Hockey player carving a turn through ice spray",
  skater: "Player tying the laces of a black hockey skate",
};

/**
 * Responsive `sizes` hints. Telling next/image the real rendered width is what
 * stops it downloading a desktop-sized file for a phone.
 */
export const SIZES = {
  hero: "100vw",
  banner: "(max-width: 768px) 100vw, 66vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  tile: "(max-width: 640px) 50vw, 25vw",
  thumb: "96px",
} as const;
/** Version local photo requests so returning visitors do not see the old cached image set. */
export function freshImage(source: string): string {
  if (!source.startsWith("/images/")) return source;
  const separator = source.includes("?") ? "&" : "?";
  return `${source}${separator}v=20261016`;
}
