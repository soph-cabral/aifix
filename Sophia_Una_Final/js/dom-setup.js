// DOM setup
// A collection of functions that set up the DOM elements for the drawing UI.

// BUTTONS
const clearButton = document.getElementById("clear-canvas-button");
clearButton.onclick = function () {
  console.log("Clearing canvas...");
  paintCanvas.clear();
  background(255);
  buffer?.background(255);
}

const saveButton = document.getElementById("save-canvas-button");
saveButton.onclick = function () {
    console.log("Saving canvas...");
    const filename = "canvas-" + getYYYYMMDD_HHMMSS();
    saveCanvas(paintCanvas.elt, filename, "png");
}

// UTILITY FUNCTIONS

/**
 * A function that returns the current time in the format of YYYYMMDD_HHMMSS, 
 * padding with 0s if necessary.
 * @returns 
 */
function getYYYYMMDD_HHMMSS() {
  const now = new Date();
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * A function that pads a positive number with a 0 if it is less than 10.
 * @param {*} num 
 * @returns 
 */
function pad(num) {
  return (num > -1 && num < 10) ? `0${num}` : `${num}`;
}