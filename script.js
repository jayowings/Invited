console.log('script loaded');

const picsContainer = document.querySelector('.pics');
let originalPics = Array.from(document.querySelectorAll('.pic'));
let pics = [];
let index = 1;
let timer;
let visibleSlides = 3;
let size;

function rebuildClones(){
  picsContainer.innerHTML = '';
  const numClones = Math.ceil(visibleSlides + 1);
  const clonesBefore = originalPics.slice(-numClones).map(pic => pic.cloneNode(true));
  const clonesAfter = originalPics.slice(0, numClones).map(pic => pic.cloneNode(true));
  
  clonesBefore.forEach(clone => clone.classList.add('clone'));
  clonesAfter.forEach(clone => clone.classList.add('clone'));
  
  picsContainer.append(...clonesBefore, ...originalPics, ...clonesAfter);
  
  pics = Array.from(document.querySelectorAll('.pic'));
  index = numClones;
}

function calculateSize() {
  if (window.innerWidth < 600) visibleSlides = 1;
  else if (window.innerWidth < 900) visibleSlides = 2;
  else visibleSlides = 3;
  let visibleWithHalf = visibleSlides + 1;

  const gap = parseFloat(getComputedStyle(picsContainer).gap) || 0;
  const totalGapSpace = (visibleWithHalf - 1) * gap;
  const containerWidth = picsContainer.offsetWidth;

  const effectiveWidthPercent = ((containerWidth - totalGapSpace) / containerWidth) * 100;
  size = effectiveWidthPercent / visibleWithHalf;

  pics.forEach(pic => pic.style.flex = `0 0 ${size}%`);

  picsContainer.style.transition = 'none';
  picsContainer.style.transform = `translateX(-${index * size}%)`;
}

function updatePics() {
    picsContainer.style.transition = 'transform 0.6s ease';
    picsContainer.style.transform = `translateX(-${index * size}%)`;
    pics.forEach((pic, i) => {
        pic.classList.toggle('active', i === index);
    });
} 

picsContainer.style.transform = `translateX(-${index * size}%)`;

function nextPic() {
    if (index >= pics.length - visibleSlides - 1) return;
    index++;
    updatePics();
}

function prevPic() {
    if (index <= 0) return;
    index--;
    updatePics();
}

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

function startSlideshow() {
    timer = setInterval(nextPic, 3000);
}

function resetTimer() {
    clearInterval(timer);
    startSlideshow();
}

function handleResize() {
  const prevVisible = visibleSlides;
  if (window.innerWidth < 600) visibleSlides = 1;
  else if (window.innerWidth < 900) visibleSlides = 2;
  else visibleSlides = 3;

  if (visibleSlides !== prevVisible) {
    rebuildClones();
  }
  calculateSize();
}

window.addEventListener('resize', handleResize);

rebuildClones();
calculateSize();
updatePics();
startSlideshow();