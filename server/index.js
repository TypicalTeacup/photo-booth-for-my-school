import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.get("/api/photos", (request, result) => {
  const photoslist = fs.readdirSync(`${__dirname}/public/photos`);
  result.status(200).send(photoslist);
});

app.listen(80, () => {
  console.log(`server running on port 80`);
});
