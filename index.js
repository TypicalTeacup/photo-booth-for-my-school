import { usb } from "usb";
import drivelist from "drivelist";
import { SingleBar, Presets } from "cli-progress";
import fs from "fs";
import ftpClient from "ftp-client";

import path from "path";
import { fileURLToPath } from "url";

const client = new ftpClient({
    host: "192.168.31.17",
    user: "pi",
    password: "raspberry",
});

client.connect(() => {
    console.log("connected to server");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPhotos = "DCIM";
console.log(await drivelist.list());

usb.addListener("attach", async (_) => {
    console.log("usb connected");
    console.log(await drivelist.list());
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
        console.log("a spadaj śmiecui");
        return;
    }

    const copyBar = new SingleBar({ clearOnComplete: true }, Presets.legacy);
    copyBar.start(storageFiles.length, 0);
    let fileProgress = 0;
    storageFiles.forEach((filename) => {
        try {
            fs.cpSync(`${fullPath}/${filename}`, `./photos/${filename}`, {});
            fs.rmSync(`${fullPath}/${filename}`);
            copyBar.update(++fileProgress);
        } catch {
            console.log("coś się poszło jeboć");
        }
    });
    copyBar.stop();

    console.log("odłączaj teraz");
    client.connect(() => {
        console.log("connected to server");
        client.upload(
            "photos/**",
            "/var/www/html/photos",
            {
                baseDir: "photos",
                overwrite: "all",
            },
            (result) => {
                result.uploadedFiles.forEach((file) => {
                    fs.rmSync(`${__dirname}/${file}`);
                });
            }
        );
    });
});
