const Api = require('./api')
//const ApiNotifications = require('./api-notifications');

if (!process.env.DEVICE_IP) {
  console.log('Please set the IP address of your Sony audio device like this: DEVICE_IP=192.168.X.X node index.js');
  process.exit();
}

const api = new Api(`http://${process.env.DEVICE_IP}:10000/sony`);

// Power Status
api.getPowerStatus().then(console.log);

// Spotify Mode
// api.setVolume(0)
//   .then(() => api.setMusicSoundField())
//   .then(() => api.setNightModeOff())
//   .then(() => api.setVoiceUp(0))
//   .then(() => api.setVolume(8))
//   .then(() => api.audioService());

// TV Mode
// api.setVolume(0)
//   .then(() => api.setClearAudioPlusSoundField())
//   .then(() => api.setNightModeOff())
//   .then(() => api.setVoiceUp(2))
//   .then(() => api.hdmiSource(1))
//   .then(() => api.setVolume(45));

// const listenToPowerStatusChange = async function() {
//   const apiNotifications = new ApiNotifications(`${process.env.DEVICE_IP}:10000`);
//   await apiNotifications.start();
//
//   apiNotifications.subscribeToPowerChange(data => {
//     console.log(`Power status changed to '${data.pop().status}'`);
//   });
// };
//
// listenToPowerStatusChange().catch(console.error);
