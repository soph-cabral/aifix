let colorToMatch;
let tolerance = 5;
let brushSize = 15;
let ellipses = []; // Array to store information about ellipses
let display1;
let display2;
let toggleCounter = 1;
let device = 0;

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
    // paintcanvas white background
    //paintCanvas.background(255);

    // Apply styles to the paint canvas
    paintCanvas.style('flex-grow', '1');
    paintCanvas.style('display', 'flex');
    paintCanvas.style('justify-content', 'center');
    paintCanvas.style('align-items', 'center');
    paintCanvas.style('height', '100%');
    paintCanvas.elt.style.width = '100%';
    paintCanvas.elt.style.height = '100%';

    
    navigator.mediaDevices.enumerateDevices().then(gotDevices);

    let videoCanvas = createCanvas(288, 216);

    video = createCapture(VIDEO);
    video.size(288, 216);
    video.hide();
    videoCanvas.parent('camera-feed');

    colorToMatch = color(255, 0, 0, 0);

    frameRate(24);

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

        // paintCanvas.noStroke();
        paintCanvas.fill(255, 255, 255, 20);
        paintCanvas.strokeWeight(1);
        paintCanvas.stroke(color(red(colorToMatch), green(colorToMatch), blue(colorToMatch), 150));
        //paintCanvas.noFill();

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
            paintCanvas.strokeWeight(0.5);
            paintCanvas.stroke(colorToMatch);
            paintCanvas.translate(mappedX, mappedY);
            for (let i = 0; i < 10; i++) {
                paintCanvas.ellipse(0, 20, 5, 30);
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
            paintCanvas.ellipse(mappedX, mappedY, brushSize/2);
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
                exact: devices[device].id
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

    if ((s <= 10) && (0 <= b < 10)) {
        return 'shadows';
    } else if ((s > 5 && s <= 100) && (b > 10 && b < 90)) {
        if (h >= 330 || h < 15) {
            return 'red';
        } else if (h >= 15 && h < 30) {
            return 'orange';
        } else if (h >= 30 && h < 65) {
            return 'yellow';
        } else if (h >= 65 && h < 145) {
            return 'green';
        } else if (h >= 145 && h < 190) {
            return 'cyan';
        } else if (h >= 190 && h < 245) {
            return 'blue';
        } else if (h >= 245 && h < 285) {
            return 'purple';
        } else if (h >= 285 && h < 330) {
            return 'pink';
        }
    } else if ((s <= 10) && (b >= 90)) {
        return 'bright';
    } else {
        return 'unknown';
    }
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


//-----------------------------------render!-----------------------------------------
function renderCapture(display, targetContainerId) {
    let img = display.get(); // Get the image from the display canvas
    img.loadPixels(); // Load the image pixels to manipulate

    for (let i = 3; i < img.pixels.length; i += 4) {
        img.pixels[i] = 160; // Set alpha value here 
    }
    // Apply posterize effect
    let levels = 8; // Adjust the number of levels as needed
    for (let i = 0; i < img.pixels.length; i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];
        img.pixels[i] = floor(r / 255 * levels) * (255 / levels);
        img.pixels[i + 1] = floor(g / 255 * levels) * (255 / levels);
        img.pixels[i + 2] = floor(b / 255 * levels) * (255 / levels);
    }
    img.updatePixels();

    // ------------------------------Apply edge detection and overlay edges------------------------------
    let edgeMat = createGraphics(img.width, img.height);
    edgeMat.loadPixels();
    for (let y = 1; y < img.height - 1; y++) {
        for (let x = 1; x < img.width - 1; x++) {
            let sobelX = 0;
            let sobelY = 0;

            // Sobel operator kernels for edge detection
            let kernelX = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
            let kernelY = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];

            // Convolve the image with the Sobel kernels
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    let index = 4 * ((y + j) * img.width + (x + i));
                    let brightness = (img.pixels[index] + img.pixels[index + 1] + img.pixels[index + 2]) / 3;
                    sobelX += brightness * kernelX[j + 1][i + 1];
                    sobelY += brightness * kernelY[j + 1][i + 1];
                }
            }

            let magnitude = sqrt(sobelX * sobelX + sobelY * sobelY);
            let edgeThreshold = 100; // Adjust this value as needed
            let index = 4 * (y * img.width + x);
            if (magnitude > edgeThreshold) {
                edgeMat.pixels[index] = 80; // Set edge pixel to white
                edgeMat.pixels[index + 1] = 80;
                edgeMat.pixels[index + 2] = 80;
                edgeMat.pixels[index + 3] = 200; 
            }
        }
    }

    edgeMat.updatePixels();

    let aspectRatio = img.width / img.height;

    // Determine the maximum size that fits within the paintCanvas while maintaining the aspect ratio
    let maxWidth = paintCanvas.width;
    let maxHeight = paintCanvas.height;
    if (aspectRatio > 1) {
        maxHeight = Math.floor(maxWidth / aspectRatio);
    } else {
        maxWidth = Math.floor(maxHeight * aspectRatio);
    }

    // Calculate the top-left corner position to center the image
    let x = (paintCanvas.width - maxWidth) / 2;
    let y = (paintCanvas.height - maxHeight) / 2;

    // Draw the image and edge detection result on the paintCanvas
    paintCanvas.image(img, x, y, maxWidth, maxHeight);
    paintCanvas.blend(edgeMat, x, y, maxWidth, maxHeight, x, y, maxWidth, maxHeight, BLEND);

    // ------------------------------Apply the image pixels to the paint canvas based on colors

    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let c = img.get(x, y); // Get the color of the current pixel
            let colorCategory = getColorCategory(c);
            let mappedX = map(x, 0, img.width, 0, paintCanvas.width);
            let mappedY = map(y, 0, img.height, 0, paintCanvas.height);

            // Draw shapes based on the color category
            if (colorCategory === 'red') {
                // Pulse size varies based on frame count
                let pulseSize = sin(frameCount * 0.1) * 5; // Creates a pulsing effect

                // Dynamically change the size based on position
                let dynamicSize = map(mappedX, 0, width, -5, 5); // Adjust the map range as needed

                paintCanvas.push();
                paintCanvas.strokeWeight(0.5);
                paintCanvas.noFill();
                paintCanvas.stroke(235, 64, 52, 40); // Red color
                // Draw ellipse with dynamic size adjustments
                paintCanvas.ellipse(mappedX, mappedY, brushSize + pulseSize + dynamicSize, (brushSize / 2) + pulseSize + dynamicSize);
                paintCanvas.pop();
            } else if (colorCategory === 'orange') {
                let particles = [];
                for (let i = 0; i < 15; i++) {
                    particles.push({
                        x: mappedX + random(-50, 50),
                        y: mappedY + random(-50, 50),
                        size: random(1, 3)
                    });
                }
                particles.forEach(p => {
                    paintCanvas.push();
                    paintCanvas.fill(255, 140, 0, 30);
                    paintCanvas.noStroke();
                    paintCanvas.ellipse(p.x, p.y, p.size);
                    paintCanvas.pop();
                });
            } else if (colorCategory === 'yellow') {
                // Draw yellow flowers
                paintCanvas.push();
                paintCanvas.strokeWeight(1);
                //no fill
                paintCanvas.noFill();
                paintCanvas.stroke(255, 213, 0, 30);
                paintCanvas.translate(mappedX, mappedY);
                for (let i = 0; i < 10; i++) {
                    paintCanvas.ellipse(0, 10, 4, 8);
                    paintCanvas.rotate(PI / 5);
                }
                paintCanvas.pop();
            } else if (colorCategory === 'green') {
                // Draw organic-looking grass with curves
                paintCanvas.push();
                let grassCount = 5;  
                let bladeWidth = max(brushSize / 10, 1); 
                let bladeHeight = brushSize/2; 
                let colorVariation = 20;  // Slight color variation for natural effect

                for (let i = 0; i < grassCount; i++) {
                    let bladeX = mappedX + random(-brushSize / 2, brushSize / 2); 
                    let bladeY = mappedY;
                    let curveHeight = random(bladeHeight * 0.8, bladeHeight * 1.2);  // Vary blade height
                    let curveBend = random(-5, 5);  // Amount of curve bending
                    let rotation = radians(random(-5, 5));  // Rotation angle in degrees

                    paintCanvas.translate(bladeX, bladeY);
                    paintCanvas.rotate(rotation);
                    let bladeColor = color(53 + random(-colorVariation, colorVariation), 191 + random(-colorVariation, colorVariation), 74 + random(-colorVariation, colorVariation), 60);

                    paintCanvas.stroke(bladeColor);
                    paintCanvas.strokeWeight(bladeWidth);
                    paintCanvas.noFill();

                    // Draw a curved blade of grass using Bezier
                    paintCanvas.beginShape();
                    paintCanvas.vertex(0, 0);
                    paintCanvas.bezierVertex(curveBend, -curveHeight * 0.2, curveBend, -curveHeight * 0.2, 0, -curveHeight);
                    paintCanvas.endShape();
         
                    paintCanvas.rotate(-rotation); 
                    paintCanvas.translate(-bladeX, -bladeY);  // Reset translation for next blade
                }

                paintCanvas.pop();
            } else if (colorCategory === 'cyan') {
                // Draw cyan long rects
                paintCanvas.push();
                paintCanvas.strokeWeight(1);
                paintCanvas.noFill();
                paintCanvas.stroke(34, 212, 194, 40);
                paintCanvas.rect(mappedX, mappedY, brushSize, brushSize * 2);
                paintCanvas.pop();
            } else if (colorCategory === 'blue') {
                // Draw blue cloud
                paintCanvas.push();
                paintCanvas.fill(34 + random(-10, 10), 129 + random(-10, 10), 212 + random(-10, 10), 10);  
                paintCanvas.noStroke();  // No borders for a softer appearance

                // Main cloud body - multiple overlapping ellipses
                paintCanvas.ellipse(mappedX, mappedY, brushSize * 1.2, brushSize * 0.6);
                paintCanvas.ellipse(mappedX + brushSize * 0.6, mappedY - brushSize * 0.2, brushSize * 1.0, brushSize * 0.6);
                paintCanvas.ellipse(mappedX - brushSize * 0.6, mappedY - brushSize * 0.1, brushSize * 0.8, brushSize * 0.5);
                paintCanvas.ellipse(mappedX, mappedY - brushSize * 0.4, brushSize * 0.9, brushSize * 0.6);
                
                // Additional puffs to add fullness
                paintCanvas.ellipse(mappedX + brushSize * 1.0, mappedY - brushSize * 0.5, brushSize * 0.7, brushSize * 0.4);
                paintCanvas.ellipse(mappedX - brushSize * 1.0, mappedY - brushSize * 0.3, brushSize * 0.5, brushSize * 0.3);

                paintCanvas.pop();
            } else if (colorCategory === 'purple') {
                let angleStep = PI / 20; // Defines the step of rotation between each ellipse
                for (let i = 0; i < 10; i++) {
                    paintCanvas.push();
                    paintCanvas.translate(mappedX, mappedY);
                    paintCanvas.rotate(i * angleStep);
                    paintCanvas.strokeWeight(0.5);
                    paintCanvas.noFill();
                    paintCanvas.stroke(183, 0, 255, 30);
                    paintCanvas.ellipse(0, 0, brushSize, brushSize / 2);
                    paintCanvas.pop();
                }
            } else if (colorCategory === 'pink') {
                // Draw pink fat circles
                paintCanvas.push();
                paintCanvas.strokeWeight(1);
                paintCanvas.noFill();
                paintCanvas.stroke(247, 183, 231, 40);
                paintCanvas.ellipse(mappedX, mappedY, brushSize * 2, brushSize);
                paintCanvas.pop();
            } else if (colorCategory === 'shadows') {
                // Draw black circles
                paintCanvas.push();
                paintCanvas.strokeWeight(0.1);
                paintCanvas.noFill();
                paintCanvas.stroke(50, 50, 50, 120);
                paintCanvas.ellipse(mappedX, mappedY, brushSize, brushSize);
                paintCanvas.pop();
            } else if (colorCategory === 'bright') {
                // Draw white rect
                paintCanvas.push();
                paintCanvas.strokeWeight(0.5);
                paintCanvas.noFill();
                paintCanvas.stroke(240, 240, 240, 200);
                paintCanvas.rect(mappedX, mappedY, brushSize*2, brushSize*2);
                paintCanvas.pop();
            }
            else {
                // Draw regular ellipse if color is not categorized
                paintCanvas.push();
                paintCanvas.strokeWeight(.1);
                paintCanvas.stroke(120, 120, 120, 80);
                paintCanvas.noFill(); 
                paintCanvas.ellipse(mappedX, mappedY, brushSize/2, brushSize/2);
                paintCanvas.pop();
            }
        }
    }
}


