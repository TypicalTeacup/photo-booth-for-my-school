import { usb } from "usb";
import drivelist from "drivelist";
import fs from "fs";

const pathToPhotos = "DCIM";

usb.addListener("attach", async (_) => {
    console.log("usb connected");
    const removableDrives = (await drivelist.list()).filter(
        (dev) => dev.isRemovable && dev.error === null
    );
    if (removableDrives.length === 0) return;
    console.log(`found ${removableDrives[0].description}`);
    const mp = removableDrives[0].mountpoints[0].path;
    const fullPath = `${mp}${pathToPhotos}`;
    const storageFiles = fs.readdirSync(fullPath);
    console.log(storageFiles);
    storageFiles.forEach((filename) => {
        fs.cpSync(`${fullPath}/${filename}`, `./photos/${filename}`, {});
        fs.rmSync(`${fullPath}/${filename}`);
    });
});
