import { usb } from "usb";
import drivelist from "drivelist";
import { SingleBar, Presets } from "cli-progress";
import fs from "fs";
import ftpClient from "ftp-client";

import keypress from "keypress";

keypress(process.stdin);

import path from "path";
import { fileURLToPath } from "url";

const client = new ftpClient({
    host: "127.0.0.1",
    user: "ok",
    password: "okok",
});

client.connect(() => {
    console.log("connected to server");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPhotos = "DCIM/100CANON";

const upload = () => {
    client.upload(
        "photos/**",
        "/photos",
        {
            baseDir: "photos",
            overwrite: "all",
        },
        (result) => {
            console.log(result);
            result.uploadedFiles.forEach((file) => {
                fs.rmSync(`${__dirname}/${file}`);
            });
        }
    );
}

const usbListener = async (_) => {
    const removableDrives = (await drivelist.list()).filter(
        (dev) => (dev.isRemovable || dev.isUSB) && dev.error === null
    );
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

    client.connect(() => {upload()});
    
};

usb.addListener("attach", usbListener);

process.stdin.on("keypress", usbListener);
