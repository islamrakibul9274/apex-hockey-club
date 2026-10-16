/** Freely usable Pexels photos. Never restores the previous Unsplash set. */
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";

const photos = [
  ["hero-action", 8974837, "Ron Lach", "person-playing-ice-hockey"],
  [
    "hero-puck",
    6847470,
    "Tima Miroshnichenko",
    "close-up-shot-of-a-hockey-puck-and-hockey-stick",
  ],
  [
    "arena-empty",
    6469031,
    "Tony Schnagl",
    "top-view-of-men-playing-ice-hockey",
  ],
  ["team-action", 8974835, "Ron Lach", "people-playing-ice-hockey-on-ice-rink"],
  ["team-duel", 8975015, "Ron Lach", "young-men-playing-ice-hockey-in-a-rink"],
  ["player-gear", 6468939, "Tony Schnagl", "light-man-people-night"],
  ["goalie-kneel", 6468747, "Tony Schnagl", "men-playing-ice-hockey"],
  [
    "goalie-watch",
    6847273,
    "Tima Miroshnichenko",
    "a-hockey-player-in-the-ice-rink",
  ],
  [
    "sticks-lean",
    6468598,
    "Tony Schnagl",
    "people-standing-on-an-ice-rink-while-wearing-figure-skates",
  ],
  ["jersey-rw", 6557325, "Tima Miroshnichenko", "a-person-playing-hockey"],
  [
    "match-board",
    6468942,
    "Tony Schnagl",
    "a-man-in-black-jacket-playing-ice-hockey",
  ],
  ["skater-red", 8971929, "Ron Lach", "hands-sport-getting-ready-game"],
];
await mkdir("public/images", { recursive: true });
for (const [name, id] of photos) {
  const response = await fetch(
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`,
  );
  if (!response.ok) throw new Error(`Photo ${id}: HTTP ${response.status}`);
  const source = Buffer.from(await response.arrayBuffer());
  for (const [role, width, height] of [
    ["wide", 1600, 900],
    ["card", 1000, 750],
    ["thumb", 480, 480],
    ...(name === "hero-action" ? [["portrait", 1200, 1500]] : []),
  ]) {
    await sharp(source)
      .resize(width, height, { fit: "cover", position: "attention" })
      .webp({ quality: 82, effort: 6 })
      .toFile(`public/images/${name}-${role}.webp`);
  }
  console.log(`Downloaded and cropped ${name}`);
}
const rows = photos
  .map(
    ([name, id, author, slug]) =>
      `| \`${name}-*\` | ${author} | [Pexels ${id}](https://www.pexels.com/photo/${slug}-${id}/) |`,
  )
  .join("\n");
await writeFile(
  "public/images/ATTRIBUTION.md",
  `# Photography attribution\n\nNew photography selected for the October 2026 redesign, replacing the complete previous image set. Photos are free to use and modify under the [Pexels License](https://www.pexels.com/license/). They are stored locally as optimized WebP crops. These are illustrative stock photographs; the people and venues pictured are not presented as Apex staff or facilities.\n\nExisting filenames are retained for compatibility with stored MongoDB records. No database updates are required.\n\n| Local file family | Photographer | Source |\n|---|---|---|\n${rows}\n\nRegenerate with \`bash scripts/fetch-images.sh\`. Each family has wide (1600×900), card (1000×750), and thumb (480×480) crops; hero-action also has a portrait (1200×1500).\n`,
);
