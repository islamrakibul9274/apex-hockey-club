/**
 * Central image manifest.
 *
 * Every photograph lives in /public/images as three consistent WebP crops
 * (wide 16:9, card 4:3, thumb 1:1), so cards and banners never letterbox.
 * Components reference a role here rather than hard-coding a filename, which
 * keeps aspect ratios consistent and makes swapping imagery a one-line change.
 *
 * Sources are Unsplash, stored in-repo rather than hotlinked. See
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
  return `/images/${key}-${role}.webp`;
}

/**
 * Intrinsic dimensions of each crop, so next/image can reserve space and the
 * page does not shift while images load.
 */
export const IMG_DIMENSIONS: Record<ImageRole, { width: number; height: number }> = {
  wide: { width: 1600, height: 900 },
  card: { width: 1000, height: 750 },
  thumb: { width: 480, height: 480 },
};

/** Descriptive alt text. Decorative images must use alt="" instead. */
export const IMG_ALT: Record<ImageKey, string> = {
  heroAction: "Ice hockey player in an orange jersey carrying the puck past the net",
  heroPuck: "Skater driving the puck across the ice during a practice session",
  arena: "Empty indoor ice hockey arena with green seating above the rink",
  teamAction: "Two teams contesting the puck along the boards in a full rink",
  teamDuel: "Players battling for position in front of the goal",
  playerGear: "Player in full protective gear skating through the defensive zone",
  goalieKneel: "Goalie kneeling in front of the net during a stoppage",
  goalieWatch: "Goalie in an orange jersey watching play develop behind him",
  sticks: "Two composite hockey sticks resting against a rink wall",
  jersey: "Player in a red and white jersey standing on the ice",
  matchBoard: "Players gathered along the boards during a match",
  skater: "Wide view of a match in progress from the stands",
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