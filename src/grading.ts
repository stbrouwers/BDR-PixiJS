import { ManiaMap, ManiaHitObject } from "./osuParser.ts";
import { noteHandler } from "./noteHandler.ts";
import { Notes } from "./app/ui/Playfield";
import { Sprite } from "pixi.js";

type Note = Sprite;

export class grading {
  private notes: noteHandler;
  private totalNotes: number;
  private maxScore = 1000000;

  public maxError: number[] = [16, 64, 97, 127, 151, 188];
  public hitValue = [320, 300, 200, 100, 50, 0];
  public grades: string[] = [
    "MARVELOUS",
    "PERFECT",
    "GREAT",
    "GOOD",
    "BAD",
    "MISS",
  ];

  public latestGrade : string = undefined;
  public score: number = 0;

  init(Notes: noteHandler, difficulty: number) {
    this.notes = Notes;
    this.totalNotes = this.notes.hitObjects.length;
    for (let i = 1; i < 5; i++) this.maxError[i] -= 3 * difficulty;
    for (let i = 0; i < this.hitValue.length; i++) {
      this.hitValue[i] = (this.hitValue[i] / this.totalNotes) * this.maxScore;
    }
  }

  check(index: number, state: boolean, audioPos: number) {
    if (!this.notes) return null;

    const upcoming = this.notes.upcomingNotes;

    for (const { obj, Note } of upcoming) {
      if (obj.column !== index) continue;
      const difference = audioPos - obj.time;
      let judgement = undefined;

      if (obj.endTime) {
        if (state && audioPos >= obj.time && audioPos <= obj.endTime) {
          judgement = "HOLD";
        } else if (audioPos > obj.endTime && !state) {
          judgement = "MISS";
        }
      } else {
        if (!state) continue;
        for (let i = 0; i < this.maxError.length; i++) {
          if (Math.abs(difference) <= this.maxError[i]) {
            judgement = this.grades[i];
            break;
          }
        }
      }
      if (judgement) this.hit(judgement, { obj, Note });
    }
  }

  private hit(judgement: string, note: { obj: ManiaHitObject; Note: Note[] }) {
    this.score += this.hitValue[Object.keys(this.grades).indexOf(judgement)]; // yes
    this.latestGrade = judgement;
    this.notes.destroy(note);
  }

  getLatest() {
    return this.latestGrade;
  }

  miss() {}
}
