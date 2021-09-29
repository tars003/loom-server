#include <Arduino.h>
#include <WiFi.h>
#include "time.h"
#include <BLEAdvertisedDevice.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include "ESPAsyncWebServer.h"

const char *ssid = "Binod";
const char *password = "maigareebhun";
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800;
const int daylightOffset_sec = 0;
const int PIN = 2;
const int CUTOFF = -60;
bool led = false;


void printLocalTime()
{
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
  {
    Serial.println("Failed to obtain time");
    return;
  }
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
}

struct data
{
  String stationId;
  String tagId;
  String dateTimeString;
  boolean status;
};

void setup()
{
  Serial.begin(115200);

  //connect to WiFi
  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("CONNECTED");

  //init and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  printLocalTime();
  BLEDevice::init("");
}

void loop()
{
  data livedata;
  led = !led;
  BLEScan *scan = BLEDevice::getScan();
  scan->setActiveScan(true);
  BLEScanResults results = scan->start(1);
  livedata.stationId = "Panasonic";
  livedata.tagId = "Tag1";
  for (int i = 0; i < results.getCount(); i++)
  {
    BLEAdvertisedDevice device = results.getDevice(i);
    int rssi = device.getRSSI();
    //Serial.println("Scanning");
    //Serial.println(device.getName().c_str());
    if (!strcmp(device.getName().c_str(), "Panasonic"))
    {
      livedata.dateTimeString = "";
      if (rssi <= -80)
      {
        livedata.status = "False";
      }
      else
      {
        livedata.status = "True";
      }
      //Serial.println(rssi);
      //printLocalTime();
      //Serial.println("Again");
    }
  }
}