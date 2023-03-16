import { usb } from "usb";
import drivelist from "drivelist";
import { SingleBar, Presets } from "cli-progress";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendFile = async (filename) => {
    const form = new FormData();
    form.append("photo", fs.readFileSync(filename));

    const options = {
        method: "POST",
        url: "http://localhost/public/api/send",
        headers: {
            "Content-Type":
                "multipart/form-data; boundary=---011000010111000001101001",
        },
        data: "[form]",
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
};

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
});

const sendBar = new SingleBar({ clearOnComplete: true }, Presets.legacy);
const localPhotos = fs.readdirSync(`${__dirname}/photos`);
let sendProgress = 0;
localPhotos.forEach(async (filename) => {
    // TODO: przesyłanko
    console.log(await sendFile(`${__dirname}/photos/${filename}`));
    sendBar.update(++sendProgress);
});
sendBar.stop();
