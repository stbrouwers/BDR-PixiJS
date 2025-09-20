import {
  Application,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Graphics,
  Ticker,
  Texture,
} from "pixi.js";

import { initDevtools } from "@pixi/devtools";

import manifest from "./assets/manifest.json";
import smanifest from "./assets/songs-manifest.json";

import { audioManager } from "./audioAPI.ts";

// import UI components
import { LoadScreen } from "./app/screens/LoadScreen.ts";
import { Playfield } from "./app/ui/Playfield.ts";
import { DebugHUD } from "./app/ui/DebugHUD.ts";
import { Background } from "./app/ui/Background.ts";

const selectedMap = "Gaminggta5";

(async () => {
  // Create a new application
  const app = new Application();
  const audio = new audioManager();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });
  initDevtools({ app });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);
  document.body.id = "app";

  const loadScreen = new LoadScreen();
  app.stage.addChild(loadScreen);
  loadScreen.resize(app.screen.width, app.screen.height);

  async function loadAssets() {
    Assets.addBundle("genericAssets", manifest);
    let preload;
    try {
      preload = await Assets.loadBundle("genericAssets");
    } catch (error) {
      console.error("Error loading assets:", error);
    }

    //debugging info
    for (const key in preload) {
      console.log(`Loading asset for ${key}`);
    }

    await loadSong(selectedMap);
    await getAssets(selectedMap);
    loadScreen.hide();
    registerCallbacks();
    console.log("finished loading");
  }
  loadAssets();

  async function loadSong(name: string) {
    await audio.loadAudio(`assets/preload/Maps/${name}/audio.mp3`); // yes this is real
  }

  let sheet: Spritesheet;
  const sprites: Sprite[] = [];

  let songBackground: Background;

  async function getAssets(name: string) {
    sheet = Assets.get("texture.json") as Spritesheet;
    for (const frameName in sheet.textures) {
      const texture: Texture = sheet.textures[frameName];
      const sprite = new Sprite(texture);
      sprite.label = frameName; // keep track of which frame it came from
      sprites.push(sprite);
    }

    //map specific assets
    const tex = Assets.get(`${name}_bg.png`);
    if (tex) {
      songBackground = new Background(tex);
      app.stage.addChildAt(songBackground, 0);
      _resizeUI();
    }
  }

  const container = new Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  const playfield = new Playfield(app.screen.height);

  // const arrow = new Sprite(sheet.textures["down.png"]);
  // arrow.x = app.screen.width / 2;
  // arrow.y = app.screen.height / 2;
  // container.addChild(arrow);

  // Move the container to the center

  const debugHUD = new DebugHUD();

  // Listen for animate update
  app.ticker.add((ticker) => {
    debugHUD.updateFPS(app.ticker.FPS);
  });

  const gameTicker = new Ticker();
  gameTicker.maxFPS = 0;

  gameTicker.add((gameTicker) => {
    debugHUD.update(gameTicker, audio.getPosition());
  });

  function startSong() {
    if (gameTicker.started) return;
    gameTicker.start();
    audio.play();
  }

  // initialize UI elements
  const uiElements = [container, playfield, debugHUD];

  function initializeUIElements() {
    for (const element of uiElements) {
      app.stage.addChild(element);
    }
  }
  initializeUIElements();

  function _resizeUI() {
    playfield.resize(app.screen.height);
    playfield.x = app.screen.width / 2;
    playfield.y = app.screen.height / 2;
    playfield.pivot.x = playfield.width / 2;
    playfield.pivot.y = playfield.height / 2;
    debugHUD.resize(app.screen.width);

    if (songBackground) {
      songBackground.resize(app.screen.width, app.screen.height);
    }
  }
  _resizeUI();

  function _startMap() {
    startSong();
  }

  //callbacks
  function registerCallbacks() {
    window.addEventListener("resize", _resizeUI);
    window.addEventListener("click", _startMap);
  }
})();
