import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'preload');
const manifestFile = path.join(__dirname, 'manifest.json');
const songsManifestFile = path.join(__dirname, 'songs-manifest.json');

const manifest = {
    assets: {
        Generic: {},
        Songs: {}
    }
};

function processDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            processDir(fullPath);
        } else if (file.isFile()) {
            const relativePath = path.relative(baseDir, fullPath).split(path.sep).join('/');
            const jsonPath = `assets/preload/${relativePath}`;

            const filename = path.basename(file.name);
            let key = filename;

            const parts = relativePath.split('/');

            const mapsIndex = parts.indexOf('Maps');
            if (mapsIndex !== -1 && parts.length > mapsIndex + 1) {
                const mapName = parts[mapsIndex + 1];
                key = `${mapName}_${filename}`;
            } else if (parts.includes('@1x')) {
                continue; // TO DO !!!!
            }


            const ext = path.extname(filename).toLowerCase();
            if (ext === '.txt') {
                key = `${parts[mapsIndex + 1]}_${key.match(/\[([^\]]+)]/)[1]}`; // i only want the difficulty name
            }
            if (ext === '.svg') {continue;} //TO DO !!!!!

            manifest.assets.Generic[key] = jsonPath;
        }
    }
}


processDir(baseDir);

fs.writeFileSync(manifestFile, JSON.stringify(manifest.assets.Generic, null, 2), 'utf-8');
fs.writeFileSync(songsManifestFile, JSON.stringify(manifest.assets.Songs, null, 2), 'utf-8');

console.log(`Manifest generated: ${manifestFile}`);
