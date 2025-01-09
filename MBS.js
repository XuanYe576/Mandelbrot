class MandelbrotShader {
    constructor() {
        this.sunTime = 0;        // Time of day (0 to 12)
        this.waterChaos = 50;    // Chaos level of water (0 to 100)
        this.zoom = 1;           // Zoom level
        this.centerX = 0;        // Center X of Mandelbrot view
        this.centerY = 0;        // Center Y of Mandelbrot view
        this.maxIterations = 500;
        this.iterationScaler = 0.5; // Scaler for dynamic iteration control, default is 1
        this.baseResolution = { width: window.innerWidth, height: window.innerHeight };
    }

    setupCanvas() {
        createCanvas(this.baseResolution.width, this.baseResolution.height);
        noLoop();
    }

    drawMandelbrot() {
        loadPixels();
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let uvX = (x - width / 2) / (0.5 * this.zoom * width) + this.centerX;
                let uvY = (y - height / 2) / (0.5 * this.zoom * height) + this.centerY;

                let frequency = map(this.sunTime, 0, 12, 5, 15) + map(mouseX, 0, width, 0, 10);
                let amplitude = 0.01 + 0.01 * (this.waterChaos / 100.0) + 0.005 * dist(mouseX, mouseY, width / 2, height / 2) / max(width, height);
                let wave = sin(frequency * dist(uvX, uvY, 0, 0) - this.sunTime);
                uvX += amplitude * wave * (uvX / dist(uvX, uvY, 0, 0));
                uvY += amplitude * wave * (uvY / dist(uvX, uvY, 0, 0));

                let zx = 0;
                let zy = 0;
                let i = 0;
                let maxIter = int(this.maxIterations * this.iterationScaler);
                while (i < maxIter && zx * zx + zy * zy < 4) {
                    let tmp = zx * zx - zy * zy + uvX;
                    zy = 2.0 * zx * zy + uvY;
                    zx = tmp;
                    i++;
                }

                let hueVal = map(i, 0, maxIter, 0, 360);
                let brightness = i === maxIter ? 0 : 255;
                let col = color(hueVal, 255, brightness);
                let pix = (x + y * width) * 4;
                pixels[pix + 0] = red(col);
                pixels[pix + 1] = green(col);
                pixels[pix + 2] = blue(col);
                pixels[pix + 3] = 255;
            }
        }
        updatePixels();
    }

    handleKeyPress(keyCode) {
        if (keyCode === UP_ARROW) {
            this.waterChaos = constrain(this.waterChaos + 5, 0, 100);
        } else if (keyCode === DOWN_ARROW) {
            this.waterChaos = constrain(this.waterChaos - 5, 0, 100);
        } else if (keyCode === LEFT_ARROW) {
            this.sunTime = constrain(this.sunTime - 1, 0, 12);
        } else if (keyCode === RIGHT_ARROW) {
            this.sunTime = constrain(this.sunTime + 1, 0, 12);
        }
        redraw();
    }

    handleMouseMove() {
        redraw();
    }

    handleScroll(event) {
        let zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= zoomFactor;
        this.iterationScaler *= zoomFactor;
        this.maxIterations = int(this.maxIterations * zoomFactor);

        if (this.zoom > 1.5) {
            resizeCanvas(width * 2, height * 2);
        } else {
            resizeCanvas(this.baseResolution.width, this.baseResolution.height);
        }

        redraw();
    }
}

let mandelbrotShader;

function setup() {
    mandelbrotShader = new MandelbrotShader();
    mandelbrotShader.setupCanvas();
    colorMode(HSB, 360, 255, 255);
}

function draw() {
    mandelbrotShader.drawMandelbrot();
}

function keyPressed() {
    mandelbrotShader.handleKeyPress(keyCode);
}

function mouseMoved() {
    mandelbrotShader.handleMouseMove();
}

function mouseWheel(event) {
    mandelbrotShader.handleScroll(event);
}
