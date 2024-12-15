#include <ArduinoJson.h>

// Project variables
int photoResistorValue = 0;
int potentiometerValue = 0;
int buttonState = 0;
int buttonClickCount = 0;
int prevButtonState = 0;

void sendData() {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject A5 = data.createNestedObject("A5");
  JsonObject A7 = data.createNestedObject("A7");
  JsonObject D5 = data.createNestedObject("D5");

  A5["value"] = photoResistorValue;
  A7["value"] = potentiometerValue;
  D5["isPressed"] = buttonState;
  D5["count"] = buttonClickCount;

  String resTxt = "";
  serializeJson(resJson, resTxt);

  Serial.println(resTxt);
}

void setup() {
  // Serial setup
  Serial.begin(9600);
  while (!Serial) {}

  // Pin setup
  pinMode(A5, INPUT);
  pinMode(A7, INPUT);
  pinMode(D5, INPUT_PULLUP); // Button with pull-up resistor
}

void loop() {
  // Read sensor values
  photoResistorValue = analogRead(A5);
  potentiometerValue = analogRead(A7);
  buttonState = !digitalRead(D5); // Active low

  // Count button clicks
  if (buttonState && buttonState != prevButtonState) {
    buttonClickCount++;
  }
  prevButtonState = buttonState;

  // Check if there's a request for data and send new data
  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) {
      Serial.flush();
      sendData();
    }
  }

  delay(10);
}
