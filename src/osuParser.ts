export type ManiaHitObject = {
  column: number; // 0-based index (0 = leftmost)
  time: number; // milliseconds
  type: "hit" | "hold";
  endTime?: number; // only for hold notes
};

export type ManiaMap = {
  circleSize: number;
  overallDifficulty: number;
  hitObjects: ManiaHitObject[];
};

export function osuParser(osuText: string): ManiaMap {
  const lines = osuText.split(/\r?\n/);
  let overallDifficulty = 5; // default 5
  let circleSize = 4; // default 4K
  const hitObjects: ManiaHitObject[] = [];

  let inDifficulty = false;
  let inHitObjects = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//")) continue;

    if (trimmed.startsWith("[Difficulty]")) {
      inDifficulty = true;
      inHitObjects = false;
      continue;
    } else if (trimmed.startsWith("[HitObjects]")) {
      inDifficulty = false;
      inHitObjects = true;
      continue;
    } else if (trimmed.startsWith("[")) {
      inDifficulty = false;
      inHitObjects = false;
      continue;
    }

    if (inDifficulty) {
      const [key, value] = trimmed.split(":");
      if (key === "CircleSize") circleSize = parseInt(value, 10);
      if (key === "OverallDifficulty") overallDifficulty = parseInt(value);
    }

    if (inHitObjects) {
      // format: x, y, time, type, hitSound, addition
      const parts = trimmed.split(",");
      if (parts.length < 5) continue;

      const x = parseInt(parts[0], 10);
      const time = parseInt(parts[2], 10);
      const type = parseInt(parts[3], 10);
      const addition = parts[5];

      // map x to column
      const column = Math.floor((x / 512) * circleSize);

      if (type & 128) {
        // hold note
        const endTime = parseInt(addition.split(":")[0], 10);
        hitObjects.push({ column, time, type: "hold", endTime });
      } else {
        // normal hit
        hitObjects.push({ column, time, type: "hit" });
      }
    }
  }

  return { circleSize, overallDifficulty, hitObjects };
}
