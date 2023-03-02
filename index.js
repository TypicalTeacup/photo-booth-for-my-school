import { usb } from "usb";
import drivelist from "drivelist";
import { SingleBar, Presets } from "cli-progress";
import fs from "fs";

const pathToPhotos = "DCIM";
console.log(await drivelist.list());

usb.addListener("attach", async (_) => {
    console.log("usb connected");
    const removableDrives = (await drivelist.list()).filter(
        (dev) => (dev.isRemovable || dev.isUSB) && dev.error === null
    );
    console.log(removableDrives.length);
    if (removableDrives.length === 0) return;
    console.log(`found ${removableDrives[0].description}`);
    const mp = removableDrives[0].mountpoints[0].path;
    const fullPath = `${mp}${pathToPhotos}`;
    let storageFiles;
    try {
        storageFiles = fs.readdirSync(fullPath);
    } catch {
        console.log("a weź się pierdol")
        return
    }
    
    const bar = new SingleBar({ clearOnComplete: true }, Presets.legacy);
    bar.start(storageFiles.length, 0);
    let fileProgress = 0;
    storageFiles.forEach((filename) => {
        try {
            fs.cpSync(`${fullPath}/${filename}`, `./server/public/photos/${filename}`, {});
            fs.rmSync(`${fullPath}/${filename}`);
            bar.update(++fileProgress);
        } catch {
            console.log("chuj");
        }
    });
    bar.stop();

});
