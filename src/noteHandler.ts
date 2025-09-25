import { Sprite } from "pixi.js";
import { ManiaHitObject } from "./osuParser.ts";
import { Notes } from "./app/ui/Playfield/Notes";
import { grading } from "./grading.ts";

type Note = Sprite;
type holdNote = {
  obj: ManiaHitObject;
  Note: Note[];
  hit?: number;
};

export class noteHandler {
  public notes: Notes;
  public scrollSpeed: number;
  public spawnOffset: number;
  public spawnOffsetPx: number; // in pixels
  public hitLineY: number = (1440 / 6) * 5 + 103; // y position of the hit line
  public upcomingNotes: { obj: ManiaHitObject; Note: Note[] }[] = [];
  public nextNoteIndex: number = 0;
  public hitObjects: ManiaHitObject[] = [];
  public activeHoldNotes: (holdNote[] | undefined)[] = [
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  private grade: grading;

  init(
    notes: Notes,
    grade: grading,
    hitObjects: ManiaHitObject[] = [],
    scrollSpeed?: number,
  ) {
    this.notes = notes;
    this.grade = grade;
    this.hitObjects = hitObjects.sort((a, b) => a.time - b.time);
    this.scrollSpeed = scrollSpeed ?? 500;
    this.spawnOffset = (this.hitLineY / this.scrollSpeed) * 1000;
    this.spawnOffsetPx = (this.spawnOffset / 1000) * this.scrollSpeed;
    this.nextNoteIndex = 0;
  }

  // not my best code but it works
  create(obj: ManiaHitObject) {
    if (obj.endTime) {
      const noteParts: Sprite[] = [];

      const duration = obj.endTime - obj.time;
      const holdLengthPx = (duration / 1000) * this.scrollSpeed;
      const holdHeightPx = 256 * 0.8; // very elegant

      const head = this.notes.spawn(obj.column, "head");
      head.anchor.y = 0;
      head.position.y = this.hitLineY - this.spawnOffsetPx - 103;

      noteParts.push(head);

      const holdCount = Math.ceil(holdLengthPx / holdHeightPx);

      let leftover = 0;

      for (let i = 0; i < holdCount; i++) {
        const holdPart = this.notes.spawn(obj.column, "hold");
        holdPart.anchor.y = 1;
        holdPart.position.y =
          this.hitLineY - this.spawnOffsetPx - i * holdHeightPx;
        if (i === holdCount - 1) {
          leftover = holdLengthPx - holdHeightPx * (holdCount - 1);
          holdPart.scale.y = (leftover / holdHeightPx / 5) * 4; // i despise myself sometimes
        }
        noteParts.push(holdPart);
      }
      const tail = this.notes.spawn(obj.column, "tail");

      tail.anchor.y = 0;
      tail.rotation = Math.PI;
      tail.scale.x = -0.8;
      tail.position.y = this.hitLineY - this.spawnOffsetPx - holdLengthPx + 103;
      noteParts.push(tail);

      this.upcomingNotes.push({ obj, Note: noteParts });
    } else {
      const full = this.notes.spawn(obj.column, "full");
      this.upcomingNotes.push({ obj, Note: [full] });
    }
  }

  update(audioPos: number, deltaMS: number) {
    while (
      this.nextNoteIndex < this.hitObjects.length &&
      this.hitObjects[this.nextNoteIndex].time <= audioPos + this.spawnOffset
    ) {
      const obj = this.hitObjects[this.nextNoteIndex];
      console.log(obj);
      this.create(obj);
      this.nextNoteIndex++;
    }

    const deltaS = deltaMS / 1000;
    for (const upcoming of this.upcomingNotes) {
      for (const sprite of upcoming.Note) {
        if (!sprite.destroyed) {
          sprite.position.y += this.scrollSpeed * deltaS;

          const noteTime = upcoming.obj.endTime ?? upcoming.obj.time;
          if (audioPos >= noteTime + this.grade.maxError[5]) {
            this.grade.miss(upcoming);
          }
        }
      }
    }
    this.shrinkActiveHoldNotes(deltaS);
  } // 0 1 2 3 4, How many indents are in my store.

  shrinkActiveHoldNotes(deltaS: number) {
    for (const key in this.activeHoldNotes) {
      const active = this.activeHoldNotes[key];
      if (!active) continue;

      const { Note, head, tail } = active;

      const movingParts = Note.filter((s) => s !== head && !s.destroyed);

      for (const sprite of movingParts) {
        sprite.position.y += this.scrollSpeed * deltaS;

        const overHitLine = sprite.position.y + sprite.height / 2 - this.hitLineY;
        if (overHitLine > 0) {
          const shrinkAmount = overHitLine / sprite.height;
          sprite.scale.y = Math.max(sprite.scale.y - shrinkAmount, 0);
          sprite.alpha = Math.max(sprite.alpha - shrinkAmount, 0);

          sprite.position.y -= shrinkAmount * sprite.height;

          if (sprite.scale.y <= 0) {
            this.notes.removeChild(sprite);
            sprite.destroy();
          }
        }
      }

      if (movingParts.every((s) => s.destroyed) && tail && !tail.destroyed) {
        this.notes.removeChild(tail);
        tail.destroy();
      }

      if (Note.every((s) => s.destroyed)) {
        this.activeHoldNotes[key] = undefined;
      }
    }
  }

  destroy(upcoming: { obj: ManiaHitObject; Note: Note[] }) {
    this.upcomingNotes = this.upcomingNotes.filter((note) => note !== upcoming);

    for (const sprite of upcoming.Note) {
      if (!sprite.destroyed) {
        this.notes.removeChild(sprite);
        sprite.destroy();
      }
    }
  }
}
