const Api = require('./api');

if (!process.env.DEVICE_IP) {
  console.log('Please set the IP address of your Sony audio device like this: DEVICE_IP=192.168.X.X node index.js');
  process.exit();
}

const api = new Api(`http://${process.env.DEVICE_IP}:10000/sony`);

// Power On + Volume + Audio Service
// api.powerOn()
//   .then(() => api.setVolume(8))
//   .then(() => api.audioService())
//   .catch(error => console.log('Something gone very bad', error));

// Power Status
api.getPowerStatus().then(console.log);

// Sound setting
api.setClearAudioPlusSoundField().then(console.log);