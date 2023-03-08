import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js";
const searchbar = document.querySelector("#search");
const photosDiv = document.querySelector("#photos");

// silnik wyszukiwania
let fuse = new Fuse();

let allPhotos;
let photos;

// pobiera listę zdjęć z serwera, potem wyświetla
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

/*
przykładowy element:
<a class="photolink" href="photos/zdj.jpg" target="_blank">
    <img loading="lazy" src="photos/zdj.jpg" />
</a>
*/
const renderPhotos = () => {
    photosDiv.innerHTML = "";
    photos.forEach((photo) => {
        const link = document.createElement("a");
        link.classList.add("photolink");
        link.href = `photos/${photo}`;
        link.target = "_blank";

        const image = document.createElement("img");
        image.src = `photos/${photo}`;
        // żeby się nie ładowało jak nie trzeba
        image.loading = "lazy";
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
