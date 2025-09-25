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
import { osuParser, ManiaMap } from "./osuParser.ts";

// import UI components
import { LoadScreen } from "./app/screens/LoadScreen.ts";
import { Playfield } from "./app/ui/Playfield/";
import { DebugHUD } from "./app/ui/DebugHUD.ts";
import { Background } from "./app/ui/Background.ts";

const selectedMap = "test";
const difficulty = "Beginner";
const scrollSpeed = 3000;

(async () => {
  // Create a new application
  const app = new Application();
  const audio = new audioManager();
  const input = new inputHandler();
  const notes = new noteHandler();
  const grade = new grading(); // bind our noteHandler

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window });
  initDevtools({ app });

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
  const debugHUD = new DebugHUD();

  // The order in which components are initialized.
  const UIComponents = [songBackground, playfield, debugHUD, loadScreen];
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
  });

  const gameTicker = new Ticker();
  gameTicker.maxFPS = 0;

  let audioPos = 0;
  // looking for notes just in time :D
  gameTicker.add((gameTicker) => {
    audioPos = audio.getPosition() * 1000;
    notes.update(audioPos, gameTicker.deltaMS);
    debugHUD.update(gameTicker, audioPos, notes.nextNoteIndex);
  });

  function startSong() {
    if (gameTicker.started) return;
    gameTicker.start();
    audio.play();
  }

  function _startMap() {
    startSong();
  }

  //callbacks
  function registerCallbacks() {
    window.addEventListener("resize", _resizeUIComponents);
    document.addEventListener("fullscreenchange", _resizeUIComponents);
    window.addEventListener("click", _startMap);
    input.onInput((index, name, state) => {
      playfield.keys?.update(name, state);
      grade.check(index, state, audioPos);
      playfield.grade?.show(grade.getLatest());
    });
  }
})();
