import { Sprite, Spritesheet } from "pixi.js";
import { ManiaHitObject } from "./osuParser.ts";
import { Notes } from "./app/ui/Playfield/Notes";

type NoteCallback = (note: ManiaHitObject) => void; // i refuse to loop through notes all existing notes every frame.
type Note = Sprite; // single note or long note (array of sprites)

export class noteHandler {
  public notes: Notes;
  public scrollSpeed: number;
  public spawnOffset: number;
  public spawnOffsetPx: number; // in pixels
  public hitLineY: number = (1440 / 6) * 5; // y position of the hit line

  private upcomingNotes: { obj: ManiaHitObject; Note: Note[] }[] = [];
  private onHitCallbacks: NoteCallback[] = [];
  private hitObjects: ManiaHitObject[] = [];
  private nextNoteIndex: number = 0;

  init(notes: Notes, hitObjects: ManiaHitObject[] = [], scrollSpeed?: number) {
    this.notes = notes;
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
      const headHoldFix = this.notes.spawn(obj.column, "hold");
      head.position.y = this.hitLineY - this.spawnOffsetPx;
      headHoldFix.position.y =
        this.hitLineY - this.spawnOffsetPx - holdHeightPx / 2;

      noteParts.push(head, headHoldFix);

      const holdCount = Math.ceil(holdLengthPx / holdHeightPx); // +2 so head and tail connect

      for (let i = 0; i < holdCount; i++) {
        const holdPart = this.notes.spawn(obj.column, "hold");
        holdPart.position.y =
          this.hitLineY - this.spawnOffsetPx - (i + 1) * holdHeightPx;
        noteParts.push(holdPart);
      }
      const tailHoldFix = this.notes.spawn(obj.column, "hold");
      const tail = this.notes.spawn(obj.column, "tail");

      tailHoldFix.position.y =
        this.hitLineY - this.spawnOffsetPx - holdCount * holdHeightPx;
      tail.position.y =
        this.hitLineY -
        this.spawnOffsetPx -
        (holdCount + 1) * holdHeightPx +
        holdHeightPx / 2;
      tail.rotation = Math.PI;
      tail.scale.x = -0.8;
      noteParts.push(tailHoldFix, tail);

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
    for (const { Note } of this.upcomingNotes) {
      Note.forEach((sprite) => {
        sprite.position.y += this.scrollSpeed * deltaS;
      });
    }
  }
}
