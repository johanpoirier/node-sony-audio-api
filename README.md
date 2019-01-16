## What's this?

This is a partial implementation of the Sony Audio API for node.js.
You can find the official API reference on the Sony website: https://developer.sony.com/develop/audio-control-api/hardware-overview/api-references

## Tech stuff

The API is based on Promises.

## Usage

```javascript
const api = new Api(`http://${process.env.DEVICE_IP}:10000/sony`);

api.setVolume(0)
  .then(() => api.setClearAudioPlusSoundField())
  .then(() => api.setNightModeOff())
  .then(() => api.setVoiceUp(2))
  .then(() => api.setVolume(50));
```
