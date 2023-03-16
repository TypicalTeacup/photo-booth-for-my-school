import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js";
const searchbar = document.querySelector("#search");
const photosDiv = document.querySelector("#photos");

let fuse = new Fuse();
let allPhotos;
let photos;

const fetchPhotos = () => {
    fetch(`http://${window.location.host}/api/photos`)
        .then((r) => r.json())
        .then((apiPhotos) => {
            allPhotos = apiPhotos;
            photos = apiPhotos;
            fuse.setCollection(allPhotos);
            renderPhotos();
        });
};
fetchPhotos();

document.querySelector("#refresh").addEventListener("click", () => {
    fetchPhotos();
    searchbar.value = "";
});

const renderPhotos = () => {
    photosDiv.innerHTML = "";
    photos.forEach((photo) => {
        const link = document.createElement("a");
        link.classList.add("photolink");
        link.href = `photos/${photo}`;
        link.target = "_blank";

        const image = document.createElement("img");
        image.loading = "lazy";
        image.src = `photos/${photo}`;
        link.appendChild(image);

        photosDiv.appendChild(link);
    });
};

searchbar.addEventListener("input", () => {
    const value = searchbar.value;
    if (value == "") {
        photos = allPhotos;
    } else {
        photos = fuse.search(value).map((obj) => obj.item);
    }
    renderPhotos();
});
