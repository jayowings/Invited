const fs = require('fs');

let existing = [];

// Read the text file
const urls = fs.readFileSync('urls.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

// Build JSON array
const newPhotos = urls.map((url, i) => ({
  id: `photo-${String(1 + i).padStart(3, '0')}`,
  url: url,
  title: `Photo ${1 + i}`,
  story: "",
  likes: 0,
  date: "2025-01-17"
}));

const combined = [...existing, ...newPhotos];

// Write to output file
fs.writeFileSync('photos.json', JSON.stringify(combined, null, 2));

console.log("photos.json created with", newPhotos.length, "entries.");