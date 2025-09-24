# My attempt at making a DDR browser game

## Adding maps (What your assets folder should look like)

> [!IMPORTANT]  
> Filenames for audio (`audio.mp3`) and backgrounds (`bg.png`) are hardcoded!  
>  
> Keep osu! level files the original name, but change the extension!  
> *(e.g. `xi - ANiMA (Kuo Kyoka) [DECADE's 4K Lv.20].txt`)*  
>  
> `generateManifest.js` will extract **{MapName}** from the folder, and **[DifficultyName]** from the brackets within **{LevelFileName}**.


```
└── public
    └── assets
        ├── generateManifest.js
        └── preload
            └── Maps
                └── {MapName}
                    ├── audio.mp3
                    ├── bg.png
                    ├── {LevelFileName}.txt
└── src
    └── assets
        ├── manifest.json
```

> [!WARNING]  
> After adding or renaming assets, run `generateManifest.js`.  
> Replace the contents of `/src/assets/manifest.json` with the one you just generated.
