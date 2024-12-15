// Serial variables
let mSerial;
let connectButton;
let readyToReceive;

// Project variables
let circlePattern = [];

// Serial receive function
function receiveSerial() {
  let line = mSerial.readUntil("\n");
  line = trim(line);
  if (!line) return;

  if (line.charAt(0) != "{") {
    print("error: ", line);
    readyToReceive = true;
    return;
  }

  // Parse JSON data
  let data = JSON.parse(line).data;
  let photoResistor = data.A5.value;
  let potentiometer = data.A7.value;

  // Update background brightness
  background(map(photoResistor, 0, 1023, 0, 255));

  // Update circle sizes
  let newRadius = map(potentiometer, 0, 4098, 5, 50);
  for (let i = 0; i < circlePattern.length; i++) {
    circlePattern[i].size = (circlePattern[i].x + circlePattern[i].y) % 100 === 0 ? newRadius : newRadius / 2;
  }

  // Serial update
  readyToReceive = true;
}

// Connect to serial
function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    readyToReceive = true;
    connectButton.hide();
  }
}

// Setup function
function setup() {
  // Canvas setup
  createCanvas(windowWidth, windowHeight);

  // Circle pattern setup
  for (let x = 0; x < windowWidth; x += 50) {
    for (let y = 0; y < windowHeight; y += 50) {
      circlePattern.push({
        x: x,
        y: y,
        size: (x + y) % 100 === 0 ? 25 : 10
      });
    }
  }

  // Serial setup
  readyToReceive = false;
  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2, height / 2);
  connectButton.mousePressed(connectToSerial);
}

// Draw function
function draw() {
  // Draw circles
  for (let i = 0; i < circlePattern.length; i++) {
    let c = circlePattern[i];
    fill(233, 212, 0); // Fixed color for the circles
    noStroke();
    ellipse(c.x, c.y, c.size);
  }

  // Serial update: request new data
  if (mSerial.opened() && readyToReceive) {
    readyToReceive = false;
    mSerial.clear();
    mSerial.write(0xab);
  }

  // Serial update: read new data
  if (mSerial.availableBytes() > 8) {
    receiveSerial();
  }
}
