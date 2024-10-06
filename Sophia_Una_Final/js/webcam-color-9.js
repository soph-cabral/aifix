let colorToMatch;
let tolerance = 5;
let brushSize = 20;
let ellipses = []; // Array to store information about ellipses
let display1;
let display2;


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
                paintCanvas.ellipse(0, 30, 20, 80);
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
                exact: devices[1].id
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
        if (h >= 325 || h < 25) {
            return 'red';
        } else if (h >= 25 && h < 40) {
            return 'orange';
        } else if (h >= 40 && h < 70) {
            return 'yellow';
        } else if (h >= 70 && h < 145) {
            return 'green';
        } else if (h >= 145 && h < 180) {
            return 'cyan';
        } else if (h >= 180 && h < 260) {
            return 'blue';
        } else if (h >= 260 && h < 285) {
            return 'purple';
        } else if (h >= 285 && h < 325) {
            return 'pink';
        }
    }

    return 'unknown';
}

function keyPressed() {
    if (key === 'p') {
        // video.pause(); // Pause the video feed
        captureFrame(); // Call function to capture and display the frame in display1
    } else if (key === 'r') {
        video.play(); // Resume the video feed
    }
}

function captureFrame() {
    // console.log('captureFrame() called');
    let img = video.get(); // Capture the current frame from the video
    // console.log('Captured frame:', img);
    if (img) {
        display1.image(img, 0, 0, display1.width, display1.height); // Display the image directly on the display1 canvas
        display2.image(img, 0, 0, display2.width, display2.height); // Display the image directly on the display1 canvas
    } else {
        console.log('Captured frame is null or undefined');
    }
}