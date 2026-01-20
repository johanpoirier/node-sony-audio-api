const SET_AUDIO_VOLUME_ID = 20
const SET_SOURCE_ID = 21
const SET_SOUND_SETTING_ID = 22

const INPUTS = {
  extInput: ['bd-dvd', 'btAudio', 'game', 'hdmi', 'line', 'sat-catv', 'source', 'tv', 'video', 'airPlay'],
  dlna: ['music'],
  storage: ['usb1'],
  radio: ['fm'],
  netService: ['audio'],
  multiroom: ['audio'],
  cast: ['audio']
};

export class SonyRpcApi {
  constructor(ip, port) {
    this.endpoint = `http://${ip}:${port}/sony`;
  }

  async powerOn() {
    const options = {
      body: JSON.stringify({
        id: 1,
        method: 'setPowerStatus',
        params: [{status: 'active'}],
        version: '1.1'
      }),
      method: 'POST',
    };

    const response = await fetch(`${this.endpoint}/system`, options)

    if (!response.ok) {
      log('Already powered on')
    }
  }

  async powerOff() {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        id: 1,
        method: 'setPowerStatus',
        params: [{status: 'off'}],
        version: '1.1'
      })
    };

    const response = await fetch(`${this.endpoint}/system`, options)
    if (!response.ok) {
      log('Already powered off');
    }
  }

  async getPowerStatus() {
    const options = {
      body: JSON.stringify({
        id: 1,
        method: 'getPowerStatus',
        params: [],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    const response = await fetch(`${this.endpoint}/system`, options)
    const data = await response.json()

    return data.result[0].status
  }


  async setSource(scheme = 'extInput', device = 'btAudio', port = null) {
    if (!Object.keys(INPUTS).includes(scheme)) {
      return Promise.reject(new Error(`Unknown device resource scheme: ${scheme}.`));
    }
    if (!INPUTS[scheme].includes(device)) {
      return Promise.reject(new Error(`Unknown device resource uri: ${scheme}:${device}.`));
    }

    let deviceResourceUri = `${scheme}:${device}`;
    if (port !== null) {
      deviceResourceUri += `?port=${port}`;
    }

    const options = {
      body: JSON.stringify({
        id: SET_SOURCE_ID,
        method: 'setPlayContent',
        params: [
          {
            output: '',
            uri: deviceResourceUri
          }
        ],
        version: '1.2'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    const response = await fetch(`${this.endpoint}/avContent`, options)
    if (!response.ok) {
      log('setPlayContent failed')
    }
  }


  audioService() {
    return this.setSource('netService', 'audio');
  }

  hdmiSource(port = 1) {
    if (port < 1 || port > 4) {
      port = 1;
    }

    return this.setSource('extInput', 'hdmi', port);
  }

  tvSource() {
    return this.setSource('extInput', 'tv');
  }

//   bluetoothAudioSource() {
//     return this.setSource('extInput', 'btAudio');
//   }
//
//   dnlaAudioSource() {
//     return this.setSource('dlna', 'audio');
//   }
//
//   playNextContent() {
//     const options = {
//       method: 'POST',
//       uri: `${this.endpoint}/avContent`,
//       body: {
//         method: 'setPlayNextContent',
//         params: [{
//           output: ''
//         }],
//         version: '1.0'
//       },
//       json: true
//     };
//
//     return requestAndResponse(options, 'Play next content');
//   }

  async getPlayingContentInfo() {
    const options = {
      body: JSON.stringify({
        id: 2,
        method: 'getPlayingContentInfo',
        params: [{
          output: ''
        }],
        version: '1.2'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }

    const response = await fetch(`${this.endpoint}/avContent`, options)
    const data = await response.json()

    return data.result[0][0].uri
  }

  async getVolumeInformation() {
    const options = {
      body: JSON.stringify({
        id: 3,
        method: 'getVolumeInformation',
        params: [{
          output: ''
        }],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }

    const response = await fetch(`${this.endpoint}/audio`, options)
    const data = await response.json()

    return data.result[0][0]
  }

  async setVolume(volume) {
    const options = {
      body: JSON.stringify({
        id: SET_AUDIO_VOLUME_ID,
        method: 'setAudioVolume',
        params: [{
          volume: `${volume}`
        }],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    }

    const response = await fetch(`${this.endpoint}/audio`, options)

    log(options.body)
    if (!response.ok) {
      log('setAudioVolume failed')
    }
  }

  async mute() {
    const options = {
      body: JSON.stringify({
        method: 'setAudioMute',
        params: [{
          mute: 'on'
        }],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    };

    const response = await fetch(`${this.endpoint}/audio`, options)

    log(options.body)
    if (!response.ok) {
      log('setAudioMute on failed')
    }
  }

  async unmute() {
    const options = {
      body: JSON.stringify({
        method: 'setAudioMute',
        params: [{
          mute: 'off'
        }],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    };

    const response = await fetch(`${this.endpoint}/audio`, options)

    log(options.body)
    if (!response.ok) {
      log('setAudioMute off failed')
    }
  }

//   getAllSoundSettings() {
//     return this.getSoundSettings('');
//   }
//
//   getSoundSettings(target) {
//     const options = {
//       method: 'POST',
//       uri: `${this.endpoint}/audio`,
//       body: {
//         method: 'getSoundSettings',
//         params: [{target}],
//         version: '1.1'
//       },
//       json: true
//     };
//
//     return requestAndResponse(options, 'Getting sound settings');
//   }

  async setSoundSetting(target, value) {
    const options = {
      body: JSON.stringify({
        id: SET_SOUND_SETTING_ID,
        method: 'setSoundSettings',
        params: [{
          settings: [{
            target,
            value
          }]
        }],
        version: '1.1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST'
    }

    const response = await fetch(`${this.endpoint}/audio`, options)

    if (!response.ok) {
      log('setSoundSettings failed')
    }
  }

  setMusicSoundField() {
    return this.setSoundSetting('soundField', 'music');
  }

  setMovieSoundField() {
    return this.setSoundSetting('soundField', 'movie');
  }

//   setClearAudioPlusSoundField() {
//     return this.setSoundSetting('soundField', 'clearAudio');
//   }

  setVoiceUp(value) {
    if (value < 1 || value > 3) {
      value = 1;
    }
    return this.setSoundSetting('voice', `type${value}`);
  }

//   setNightModeOn() {
//     return this.setSoundSetting('nightMode', 'on');
//   }
//
//   setNightModeOff() {
//     return this.setSoundSetting('nightMode', 'off');
//   }
// }
}

function log(message) {
  const now = (new Date()).toISOString();
  console.log(`${now} [api] ${message}`);
}
