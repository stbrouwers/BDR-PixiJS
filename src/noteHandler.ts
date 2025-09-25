import { Sprite, Spritesheet } from "pixi.js";
import { ManiaHitObject } from "./osuParser.ts";
import { Notes } from "./app/ui/Playfield/Notes";
import { grading } from "./grading.ts";

type NoteCallback = (note: ManiaHitObject) => void; // i refuse to loop through notes all existing notes every frame.
type Note = Sprite;

export class noteHandler {
  public notes: Notes;
  public scrollSpeed: number;
  public spawnOffset: number;
  public spawnOffsetPx: number; // in pixels
  public hitLineY: number = (1440 / 6) * 5; // y position of the hit line
  public upcomingNotes: { obj: ManiaHitObject; Note: Note[] }[] = [];
  public nextNoteIndex: number = 0;
  public hitObjects: ManiaHitObject[] = [];

  private onHitCallbacks: NoteCallback[] = [];
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
          console.log(
            `leftover: ${leftover} leftover/holdHeightPx: ${leftover / holdHeightPx}`,
          );
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
    console.log(this.upcomingNotes);
  }

  onHit(callback: NoteCallback) {
    this.onHitCallbacks.push(callback);
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
    for (const upcoming of [...this.upcomingNotes]) {  // copy to avoid iterating over destroyed notes, because it kinda crashes when you do that.
      for (const sprite of upcoming.Note) {
        if (sprite.destroyed) continue; // safety
        sprite.position.y += this.scrollSpeed * deltaS;
      }

      if (
        audioPos >=
        (upcoming.obj.endTime ?? upcoming.obj.time) + this.grade.maxError[5]
      ) {
        this.grade.miss();
        this.destroy(upcoming);
      }
    }
  }

  destroy(upcoming: { obj: ManiaHitObject; Note: Note[] }) {
    this.upcomingNotes = this.upcomingNotes.filter((note) => note !== upcoming);
    // find original note and remove it :D
    for (const sprite of upcoming.Note) {
      if (sprite.destroyed) continue; // safety
      this.notes.removeChild(sprite);
      sprite.destroy();
    }
  }
}
