import { ManiaHitObject } from "./osuParser.ts";
import { noteHandler } from "./noteHandler.ts";
import { Sprite } from "pixi.js";

type Note = Sprite;

export class grading {
  private notes: noteHandler;
  private totalNotes: number;
  private maxScore = 1000000;

  private missCallbacks: (() => void)[] = [];

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

  public latestGrade: string = undefined;
  public score: number = 0;
  public combo: number = 0;

  init(Notes: noteHandler, difficulty: number) {
    this.notes = Notes;
    this.totalNotes = this.notes.hitObjects.length;
    for (let i = 1; i < 5; i++) this.maxError[i] -= 3 * difficulty;

    const noteWorth = this.maxScore / this.totalNotes;
    for (let i = 0; i < this.hitValue.length; i++) {
      this.hitValue[i] = (this.hitValue[i] / this.hitValue[0]) * noteWorth;
    }
    console.log(this.hitValue);
  }

  private grade(audioPos: number, objTime: number): string | undefined {
    const difference = audioPos - objTime;

    for (let i = 0; i < this.maxError.length; i++) {
      if (Math.abs(difference) <= this.maxError[i]) {
        return this.grades[i];
      }
    }
    return undefined;
  }

  check(index: number, state: boolean, audioPos: number) {
    if (!this.notes) return null;

    const upcoming = this.notes.upcomingNotes;

    for (const up of upcoming) {
      const { obj, Note } = up;
      if (obj.column !== index) continue;

      if (obj.endTime) {
        if (state) {
          if (obj.time - this.maxError[5] > audioPos) break;
          const judgement = this.grade(audioPos, obj.time);
          if (judgement && judgement !== "MISS") {
            this.award(judgement);
            this.notes.activeHoldNotes[obj.column] = {
              obj,
              Note,
              hit: audioPos, // and i know you're stealing
            };
            this.latestGrade = judgement;
            this.notes.upcomingNotes = this.notes.upcomingNotes.filter(
              (n) => n !== up,
            );
          } else {
            this.miss(up);
          }
        } else {
          const active = this.notes.activeHoldNotes[obj.column];
          if (!active) return null;

          const judgement = this.grade(audioPos, active.obj.endTime);
          if (judgement && judgement !== "MISS") {
            this.hit(judgement, active); // destroy here
          } else {
            this.miss(active);
          }
          this.notes.activeHoldNotes[obj.column] = undefined;
        }
        return;
      }

      if (!state) break;
      if (obj.time - this.maxError[5] > audioPos) break;
      const j = this.grade(audioPos, obj.time);
      if (j && j !== "MISS") {
        return this.hit(j, up);
      } else {
        this.miss(up);
      }
    }
  }

  private award(judgement: string) {
    const idx = this.grades.indexOf(judgement);
    if (idx < 0) return;
    this.score += Math.ceil(this.hitValue[idx]);
    this.combo += 1;
  }

  private hit(judgement: string, note: { obj: ManiaHitObject; Note: Note[] }) {
    this.award(judgement);
    this.latestGrade = judgement;
    this.notes.destroy(note);
  }

  onMiss(cb: () => void) {
    this.missCallbacks.push(cb);
  }

  miss(note: { obj: ManiaHitObject; Note: Note[] }) {
    this.combo = 0;
    this.latestGrade = "MISS";
    this.notes.destroy(note);

    for (const cb of this.missCallbacks) {
      cb();
    }
  }

  getLatest(): string {
    return this.latestGrade;
  }
}
