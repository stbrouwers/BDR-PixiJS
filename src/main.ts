import {
  Application,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Ticker,
  Texture,
} from "pixi.js";

import { initDevtools } from "@pixi/devtools";

import manifest from "./assets/manifest.json";

import { audioManager } from "./audioManager.ts";
import { inputHandler } from "./inputHandler.ts";
import { noteHandler } from "./noteHandler.ts";
import { grading } from "./grading.ts";
import { osuParser } from "./osuParser.ts";

// import UI components
import { LoadScreen } from "./app/screens/LoadScreen.ts";
import { Playfield } from "./app/ui/Playfield/";
import { Score } from "./app/ui/Score.ts";
import { DebugHUD } from "./app/ui/DebugHUD.ts";
import { Background } from "./app/ui/Background.ts";

// Game settings (controls are found in inputHandler.ts)
// Check readme.md for a tutorial on how to add your own maps.
const selectedMap = "Chronomia";
const difficulty = "Normal"; //you can choose from: Beginner, Normal, Hyper, Another, Black Another
const scrollSpeed = 2000; // pixels per second
const volume = 0.4;
const offsetms = 103; //-60 for my headphones

(async () => {
  // Create a new application
  const app = new Application();
  const audio = new audioManager();
  const input = new inputHandler();
  const notes = new noteHandler();
  const grade = new grading(); // bind our noteHandler

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window });
  await initDevtools({ app });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);
  document.body.id = "app";

  const container = new Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  app.stage.addChild(container);

  // UI Components extending container class:
  const loadScreen = new LoadScreen();
  const songBackground = new Background();
  const playfield = new Playfield(app.renderer.width, app.renderer.height);
  const score = new Score();
  const debugHUD = new DebugHUD();

  // The order in which components are initialized.
  const UIComponents = [songBackground, playfield, score, loadScreen];
  UIComponents.forEach((component) => app.stage.addChild(component));

  // Resize function for all UI components that require it. (resize?)
  function _resizeUIComponents() {
    UIComponents.forEach((component) =>
      component.resize?.(app.renderer.width, app.renderer.height),
    );
  }
  _resizeUIComponents();

  // Variables in which assets will be stored
  let sheet: Spritesheet;
  const sprites: Sprite[] = [];

  // hardcoded loadingscreen before gta 6
  async function loadAssets() {
    Assets.addBundle("genericAssets", manifest);
    let preload;
    try {
      preload = await Assets.loadBundle("genericAssets");
      loadScreen.onLoad(60);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
    //debugging info
    for (const key in preload) {
      console.log(`Loading asset for ${key}`);
    }

    await audio.loadAudio(`assets/preload/Maps/${selectedMap}/audio.mp3`); // pixi doesn't parse my audio if i load it in my bundle ):
    loadScreen.onLoad(70);
    await getAssets(selectedMap);
    loadScreen.onLoad(90);
    await loadMap(selectedMap, difficulty);
    loadScreen.onLoad(100);
    loadScreen.hide();

    registerCallbacks();
    console.log("finished loading");
  }
  await loadAssets();

  async function getAssets(name: string) {
    sheet = Assets.get("texture.json") as Spritesheet;
    for (const frameName in sheet.textures) {
      const texture: Texture = sheet.textures[frameName];
      const sprite = new Sprite(texture);
      sprite.label = frameName; // keep track of which frame it came from
      sprites.push(sprite);
    }
    setSkin(sheet);

    //map specific assets
    const bgTexture = Assets.get(`${name}_bg.png`);
    if (bgTexture) {
      songBackground.setTexture(bgTexture);
      app.stage.addChildAt(songBackground, 0);
      _resizeUIComponents();
    }
  }

  async function loadMap(name: string, diff: string) {
    const mapData = Assets.get(`${name}_${diff}`);
    if (mapData) {
      const parsedMapData = osuParser(mapData as string);
      notes.init(playfield.notes, grade, parsedMapData.hitObjects, scrollSpeed); // more warcrimes
      grade.init(notes, parsedMapData.overallDifficulty);
    }
  }

  function setSkin(skin: Spritesheet) {
    playfield.skin(skin);
  }

  app.ticker.add(() => {
    debugHUD.updateFPS(app.ticker.FPS);
    observer.observe(appContainer);
  });

  const gameTicker = new Ticker();
  gameTicker.maxFPS = 0;

  let audioPos = 0;
  // looking for notes just in time :D
  gameTicker.add((gameTicker) => {
    audioPos = audio.getPosition() * 1000 - offsetms;
    notes.update(audioPos, gameTicker.deltaMS);
    // debugHUD.update(gameTicker, audioPos, notes.nextNoteIndex);
  });

  function startSong() {
    if (gameTicker.started) return;
    gameTicker.start();
    audio.play(volume);
  }

  function _startMap() {
    startSong();
  }

  function _updateGameInfo() {
    score.update(grade.score);
    playfield.combo?.update(grade.combo);
    playfield.grade?.show(grade.getLatest());
  }

  // window.resize callback doesn't cut it sadly
  const appContainer = document.getElementById("app");
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      _resizeUIComponents();
    }
  });

  //callbacks
  function registerCallbacks() {
    window.addEventListener("click", _startMap);
    input.onInput((index, name, state) => {
      playfield.keys?.update(name, state);
      grade.check(index, state, audioPos);
      _updateGameInfo();
    });

    grade.onMiss(() => {
      _updateGameInfo();
    });
  }
})();
