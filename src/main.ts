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

import { audioManager } from "./audioAPI.ts";

// import UI components
import { LoadScreen } from "./app/screens/LoadScreen.ts";
import { Playfield } from "./app/ui/Playfield.ts";
import { DebugHUD } from "./app/ui/DebugHUD.ts";
import { Background } from "./app/ui/Background.ts";

const selectedMap = "Chronomia";

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

  const container = new Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // UI Components extending container class:
  const loadScreen = new LoadScreen();
  const songBackground = new Background();
  const playfield = new Playfield(app.renderer.width, app.renderer.height);
  const debugHUD = new DebugHUD();

  // The order in which components are initialized.
  const UIComponents = [
    songBackground,
    playfield,
    debugHUD,
    loadScreen,
    container,
  ];
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
    await loadScreen.hide();
    registerCallbacks();
    console.log("finished loading");
  }
  await loadAssets();

  async function loadSong(name: string) {
    await audio.loadAudio(`assets/preload/Maps/${name}/audio.mp3`); // yes this is real
  }

  async function getAssets(name: string) {
    sheet = Assets.get("texture.json") as Spritesheet;
    for (const frameName in sheet.textures) {
      const texture: Texture = sheet.textures[frameName];
      const sprite = new Sprite(texture);
      sprite.label = frameName; // keep track of which frame it came from
      sprites.push(sprite);
    }

    //map specific assets
    const bgTexture = Assets.get(`${name}_bg.png`);
    if (bgTexture) {
      songBackground.setTexture(bgTexture);
      app.stage.addChildAt(songBackground, 0);
      _resizeUIComponents();
    }
  }

  // const arrow = new Sprite(sheet.textures["down.png"]);
  // arrow.x = app.screen.width / 2;
  // arrow.y = app.screen.height / 2;
  // container.addChild(arrow);

  // Move the container to the center

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

  function _startMap() {
    startSong();
  }

  //callbacks
  function registerCallbacks() {
    window.addEventListener("resize", _resizeUIComponents);
    document.addEventListener("fullscreenchange", _resizeUIComponents);
    window.addEventListener("click", _startMap);
  }
})();
