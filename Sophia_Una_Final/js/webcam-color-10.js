let colorToMatch;
let tolerance = 5;
let brushSize = 15;
let ellipses = []; // Array to store information about ellipses
let display1;
let display2;
let toggleCounter = 1;


let video;
let paintCanvas;

function setup() {
    // Create the paint canvas inside the canvas-container
    let canvasContainer = select('#canvas-container');
    let canvasWidth = canvasContainer.width;
    let canvasHeight = canvasContainer.height;

    // Create the paint canvas
    paintCanvas = createGraphics(canvasWidth, canvasHeight);
    paintCanvas.parent(canvasContainer);

    // Apply styles to the paint canvas
    paintCanvas.style('flex-grow', '1');
    paintCanvas.style('display', 'flex');
    paintCanvas.style('justify-content', 'center');
    paintCanvas.style('align-items', 'center');
    paintCanvas.style('height', '100%');

    navigator.mediaDevices.enumerateDevices().then(gotDevices);

    let videoCanvas = createCanvas(288, 216);

    video = createCapture(VIDEO);
    video.size(288, 216);
    video.hide();
    videoCanvas.parent('camera-feed');

    colorToMatch = color(255, 0, 0);

    frameRate(10);

    display1 = createGraphics(288, 216);
    display1.parent('display-canvas-container1');
    display1.style('display', 'inline');

    display2 = createGraphics(288, 216);
    display2.parent('display-canvas-container2');
    display2.style('display', 'inline');

    select('#render-button-1').mousePressed(() => renderCapture(display1, 'canvas-container'));
    select('#render-button-2').mousePressed(() => renderCapture(display2, 'canvas-container'));
}

const devices = [];

function draw() {
    image(video, 0, 0);
    //image(paintCanvas, video.width, 0, video.width, video.height);

    let firstPX = findColor(video, colorToMatch, tolerance);

    if (firstPX !== undefined) {
        let mappedX = map(firstPX.x, 0, video.width, 0, paintCanvas.width);
        let mappedY = map(firstPX.y, 0, video.height, 0, paintCanvas.height);

        paintCanvas.noStroke();
        paintCanvas.fill(colorToMatch);

        let colorCategory = getColorCategory(colorToMatch);
        
        if (colorCategory === 'red') {
            // Draw red long ellipses
            for (let i = 0; i < 10; i++) {
                paintCanvas.ellipse(mappedX, mappedY, brushSize, brushSize*4);
            }
        } else if (colorCategory === 'orange') {
            // Draw orange circles
            paintCanvas.ellipse(mappedX, mappedY, brushSize);
        } else if (colorCategory === 'yellow') {
            // Draw yellow flowers
            paintCanvas.push();
            paintCanvas.strokeWeight(1);
            paintCanvas.stroke(255, 247, 0, 50);
            paintCanvas.translate(mappedX, mappedY);
            for (let i = 0; i < 10; i++) {
                paintCanvas.ellipse(0, 30, 15, 60);
                paintCanvas.rotate(PI / 5);
            }
            paintCanvas.pop();
        } else if (colorCategory === 'green') {
            // Draw green quads
            paintCanvas.quad(mappedX, mappedY, mappedX + brushSize, mappedY, mappedX + brushSize, mappedY + brushSize, mappedX, mappedY + brushSize);
        } else if (colorCategory === 'cyan') {
            // Draw cyan long rects
            paintCanvas.rect(mappedX, mappedY, brushSize, brushSize*2);
        } else if (colorCategory === 'blue') {
            // Draw blue triangles
            paintCanvas.triangle(mappedX, mappedY, mappedX + brushSize, mappedY, mappedX + brushSize / 2, mappedY - brushSize);
        } else if (colorCategory === 'purple') {
            // Draw purple hollow circles
            paintCanvas.ellipse(mappedX, mappedY, brushSize/10);
        } else if (colorCategory === 'pink') {
            // Draw pink fat circles
            paintCanvas.ellipse(mappedX, mappedY, brushSize*2, brushSize);
        } else {
            // Draw regular ellipse if color is not categorized
            paintCanvas.ellipse(mappedX, mappedY, brushSize, brushSize);
            ellipses.push({ x: mappedX, y: mappedY, type: "regular" }); // Store ellipse information
        }
        
        // Reset rotation
        paintCanvas.resetMatrix();

        //console.log(ellipses); // Log the ellipses array
    }
}




//----------------------------------helper function---------------------------------

function mousePressed() {
    if (mouseX < video.width && mouseY < video.height) {
        let selectedColor = video.get(mouseX, mouseY);
        colorToMatch = selectedColor;
    }
}

function findColor(input, c, tolerance) {
    input.loadPixels();
    for (let y = 0; y < input.height; y++) {
        for (let x = 0; x < input.width; x++) {
            let index = (y * input.width + x) * 4;
            let r = input.pixels[index];
            let g = input.pixels[index + 1];
            let b = input.pixels[index + 2];

            if (r >= red(c) - tolerance && r <= red(c) + tolerance &&
                g >= green(c) - tolerance && g <= green(c) + tolerance &&
                b >= blue(c) - tolerance && b <= blue(c) + tolerance) {
                return createVector(x, y);
            }
        }
    }
}

function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        if (deviceInfo.kind == 'videoinput') {
            devices.push({
                label: deviceInfo.label,
                id: deviceInfo.deviceId
            });
        }
    }

    let constraints = {
        video: {
            deviceId: {
                exact: devices[0].id
            }
        }
    };

    video = createCapture(constraints);
    video.size(288, 216);
    video.hide();
}

function getColorCategory(c) {
    let h = hue(c);
    let s = saturation(c);
    let b = brightness(c);

    if ((s > 10 && s <= 100) && (b > 10 && b < 90)) {
        if (h >= 330 || h < 15) {
            return 'red';
        } else if (h >= 15 && h < 30) {
            return 'orange';
        } else if (h >= 30 && h < 65) {
            return 'yellow';
        } else if (h >= 65 && h < 145) {
            return 'green';
        } else if (h >= 145 && h < 180) {
            return 'cyan';
        } else if (h >= 180 && h < 250) {
            return 'blue';
        } else if (h >= 250 && h < 285) {
            return 'purple';
        } else if (h >= 285 && h < 330) {
            return 'pink';
        }
    }

    return 'unknown';
}


function keyPressed() {
    if (key === 'p') {
        // Increment the counter each time 'p' is pressed
        toggleCounter++;

        // Pause the video feed and capture the frame
        //pvideo.pause();
        captureFrame();

        // Use modulo operator to toggle between 0 and 1
        let displayIndex = toggleCounter % 2;

        if (displayIndex === 0) {
            displayFrame(display1); // Display the frame on display1 for even counts
        } else {
            displayFrame(display2); // Display the frame on display2 for odd counts
        }

    } else if (key === 'r') {
        video.play(); // Resume the video feed
    }
}

function captureFrame() {
    video.loadPixels();
    let img = video.get(); // Capture the current frame from the video
    return img; // Return the captured frame
}

function displayFrame(display) {
    let img = captureFrame(); // Capture the current frame from the video
    if (img) {
        display.image(img, 0, 0, display.width, display.height); // Display the image on the specified canvas
    } else {
        console.log('Captured frame is null or undefined');
    }
}

function renderCapture(display, targetContainerId) {
    let img = display.get(); // Get the image from the display canvas
    img.loadPixels(); // Load the image pixels to manipulate

    // Apply posterize effect
    let levels = 5; // Adjust the number of levels as needed
    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];
        img.pixels[i] = floor(r / 255 * levels) * (255 / levels);
        img.pixels[i + 1] = floor(g / 255 * levels) * (255 / levels);
        img.pixels[i + 2] = floor(b / 255 * levels) * (255 / levels);
    }
    img.updatePixels();

    // Use the main paint canvas to draw the posterized image
    paintCanvas.clear(); // Clear the existing contents of the paint canvas
    paintCanvas.image(img, 0, 0, paintCanvas.width, paintCanvas.height); // Draw the posterized image
}
