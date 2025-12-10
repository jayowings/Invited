console.log('script loaded'); //check it works

const picsContainer = document.querySelector('.pics');
let originalPics = []; //make the thing, will fill it later
let pics = [];
let index = 1;
let timer;
let visibleSlides = 3;
let size;
window.addEventListener('resize', handleResize);
popupSetup();

//Home page
function initSlideshow(){
  picsContainer.style.transform = `translateX(-${index * size}%)`;
  picsContainer.addEventListener('transitionend', () => {
    const total = pics.length;
    const numClones = Math.ceil(visibleSlides + 1);
    
    if (index >= total - numClones) {
      picsContainer.style.transition = 'none';
      index = numClones;
      picsContainer.style.transform = `translateX(-${index * size}%)`;
    }
    if (index < numClones) {
      picsContainer.style.transition = 'none';
      index = total - numClones - 1;
      picsContainer.style.transform = `translateX(-${index * size}%)`;
    }
  });
  document.querySelector('.next').addEventListener('click', () => { nextPic(); resetTimer(); });
  document.querySelector('.prev').addEventListener('click', () => { prevPic(); resetTimer(); });

  loadPhotos();
}

async function loadPhotos() {
    const response = await fetch('/photos.json');
    const data = await response.json();
    const totalPhotos = data.length;

    const startIndex = Math.floor(Math.random() * totalPhotos);

    const maxSlides = 25;
    const slideshowPhotos = []; //starts empty

    for(let i = 0; i < maxSlides; i++){
        slideshowPhotos.push(
          data[(startIndex + i) % totalPhotos]
        );
    }

    //create elements
    originalPics = slideshowPhotos.map(photo => {
        const div = document.createElement('div');
        div.className = 'pic';

        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.title || "";
        img.addEventListener("click", () => {
            openPopup(photo.url, photo.title);
        });
        div.appendChild(img);
        return div;
    });

    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();

    startSlideshowSystem();
    console.log("Error occurred in creating slideshow or accessing photos", err);
}

function updatePics() {//progress slides
    picsContainer.style.transition = 'transform 0.6s ease';
    picsContainer.style.transform = `translateX(-${index * size}%)`;
    pics.forEach((pic, i) => {
        pic.classList.toggle('active', i === index);
    });
} 

function startSlideshow() { //initial timer set
    timer = setInterval(nextPic, 3000);
}

function resetTimer() {
    clearInterval(timer);
    startSlideshow();
}

function nextPic() { //trigger move forward
    if (index >= pics.length - visibleSlides - 1) return;
    index++;
    updatePics();
}

function prevPic() { //trigger move backward
    if (index <= 0) return;
    index--;
    updatePics();
}

function calculateSize() { //decide how many slides for the screen size
  if (window.innerWidth < 600) visibleSlides = 1;
  else if (window.innerWidth < 900) visibleSlides = 2;
  else visibleSlides = 3;
  let visibleWithHalf = visibleSlides + 1;

  //adaptive gap for screen sizes
  const gap = parseFloat(getComputedStyle(picsContainer).gap) || 0;
  const totalGapSpace = (visibleWithHalf - 1) * gap;
  const containerWidth = picsContainer.offsetWidth;

  const effectiveWidthPercent = ((containerWidth - totalGapSpace) / containerWidth) * 100;
  size = effectiveWidthPercent / visibleWithHalf;

  pics.forEach(pic => pic.style.flex = `0 0 ${size}%`);

  //reset slides
  picsContainer.style.transition = 'none';
  picsContainer.style.transform = `translateX(-${index * size}%)`;
}

function handleResize() { //decide how many slides for new screen size
  const prevVisible = visibleSlides;
  if (window.innerWidth < 600) visibleSlides = 1;
  else if (window.innerWidth < 900) visibleSlides = 2;
  else visibleSlides = 3;

  if (visibleSlides !== prevVisible) {//check for change and update only if necessary
    rebuildClones();
  }
  calculateSize();
}

function rebuildClones(){ //give buffer before and after for continuous slideshow
  picsContainer.innerHTML = ''; //reset picsContainer
  const numClones = Math.ceil(visibleSlides + 1); //cover an extra picture
  const clonesBefore = originalPics.slice(-numClones).map(pic => pic.cloneNode(true));
  const clonesAfter = originalPics.slice(0, numClones).map(pic => pic.cloneNode(true));
  
  clonesBefore.forEach(clone => clone.classList.add('clone'));
  clonesAfter.forEach(clone => clone.classList.add('clone'));
  
  picsContainer.append(...clonesBefore, ...originalPics, ...clonesAfter); //refill picsContainer
  
  pics = Array.from(document.querySelectorAll('.pic'));
  index = numClones; //place at the start
}

function startSlideshowSystem(){ //easy restart call
  rebuildClones();
  calculateSize();
  updatePics();
  startSlideshow();
}

//Gallery page
async function initGalleryPage(){
    const response = await fetch('/photos.json');
    const photos = await response.json();

    const container = document.getElementById('galleryGrid');

    const screenWidth = window.innerWidth;
    let columns;
    if (screenWidth >= 1200) {
        columns = 4; // desktop large
    } else if (screenWidth >= 900) {
        columns = 3; // tablet landscape
    } else if (screenWidth >= 600) {
        columns = 2; // tablet portrait
    } else {
        columns = 1; // mobile
    }
    let remainingColumns = columns;

    let currentRow = createRow(columns);
    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'gallery-image';

        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.title || "";
        img.loading = "lazy"; // good for performance

        //TODO highlighted image seperate page

        card.appendChild(img);

        //detect orientation
        img.onload = () => {
            card.addEventListener("click", () => {
                openPopup(photo.url, photo.title);
            });
            currentRow.appendChild(card);
            if (img.naturalWidth > img.naturalHeight) {
                remainingColumns = remainingColumns - 2;
                if(remainingColumns < 0) {
                    currentRow.style.gridTemplateColumns = `repeat(${columns+1}, 1fr)`;
                    remainingColumns++;
                }
                card.classList.add('landscape');
            } else {
                remainingColumns--;
                card.classList.add('portrait');
            };
            if(remainingColumns == 0){
                container.appendChild(currentRow);
                currentRow = createRow(columns);
                remainingColumns = columns;
            }
        };
    });
}

function createRow(columns) {
    const div = document.createElement("div");
    div.classList.add("gallery-row");
    div.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    return div;
}

function columnReorder(){
    const gallery = document.getElementById("galleryGrid");
    const screenWidth = window.innerWidth;

    let columns;

    if (screenWidth >= 1200) {
        columns = 5; // desktop large
    } else if (screenWidth >= 900) {
        columns = 4; // tablet landscape
    } else if (screenWidth >= 600) {
        columns = 3; // tablet portrait
    } else {
        columns = 1; // mobile
    }

    gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function openPopup(url, title = "") {
    const box = document.querySelector(".popup");
    const img = document.querySelector(".enlarged");

    img.src = url;
    img.alt = title;

    box.classList.remove("hidden");
}

function closePopup() {
    document.querySelector(".popup").classList.add("hidden");
}

function popupSetup(){
    //close with esc
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePopup();
    });

    //close on click away
    const box = document.querySelector(".popup");
    box.addEventListener("click", (e) => {
        if (e.target === box) closePopup();
    });
}