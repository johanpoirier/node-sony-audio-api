const request = require('request-promise-native');

class Api {

  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  powerOn() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/system`,
      body: {
        id: 1,
        method: 'setPowerStatus',
        params: [{status: 'active'}],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        log('Already powered on');
      }
    });
  }

  powerOff() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/system`,
      body: {
        id: 1,
        method: 'setPowerStatus',
        params: [{status: 'off'}],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        log('Already powered off');
      }
    });
  }

  getPowerStatus() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/system`,
      body: {
        method: 'getPowerStatus',
        params: [],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Getting power status');
  }

  setSource(scheme = 'extInput', device = 'btAudio', port = null) {
    if (!Object.keys(Api.INPUTS).includes(scheme)) {
      return Promise.reject(new Error(`Unknown device resource scheme: ${scheme}.`));
    }
    if (!Api.INPUTS[scheme].includes(device)) {
      return Promise.reject(new Error(`Unknown device resource uri: ${scheme}:${device}.`));
    }

    let deviceResourceUri = `${scheme}:${device}`;
    if (port !== null) {
      deviceResourceUri += `?port=${port}`;
    }

    const options = {
      method: 'POST',
      uri: `${this.endpoint}/avContent`,
      body: {
        method: 'setPlayContent',
        params: [
          {
            output: '',
            uri: deviceResourceUri
          }
        ],
        version: '1.2'
      },
      json: true
    };

    return requestAndResponse(options, `Switching to ${deviceResourceUri}`);
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

  bluetoothAudioSource() {
    return this.setSource('extInput', 'btAudio');
  }

  dnlaAudioSource() {
    return this.setSource('dlna', 'audio');
  }

  playNextContent() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/avContent`,
      body: {
        method: 'setPlayNextContent',
        params: [{
          output: ''
        }],
        version: '1.0'
      },
      json: true
    };

    return requestAndResponse(options, 'Play next content');
  }

  getPlayingContentInfo() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/avContent`,
      body: {
        method: 'getPlayingContentInfo',
        params: [{
          output: ''
        }],
        version: '1.2'
      },
      json: true
    };

    return requestAndResponse(options, 'Playing content info');
  }

  getVolume() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'getVolumeInformation',
        params: [{
          output: ''
        }],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Getting volume');
  }

  setVolume(volume) {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'setAudioVolume',
        params: [{
          volume: `${volume}`
        }],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Setting volume');
  }

  mute() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'setAudioMute',
        params: [{
          mute: 'on'
        }],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Muting');
  }

  unmute() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'setAudioMute',
        params: [{
          mute: 'off'
        }],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Unmuting');
  }

  getAllSoundSettings() {
    return this.getSoundSettings('');
  }

  getSoundSettings(target) {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'getSoundSettings',
        params: [{target}],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, 'Getting sound settings');
  }

  setSoundSetting(target, value) {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'setSoundSettings',
        params: [{
          settings: [{
            target,
            value
          }]
        }],
        version: '1.1'
      },
      json: true
    };

    return requestAndResponse(options, `Setting sound setting ${target}=${value}`);
  }

  setMusicSoundField() {
    return this.setSoundSetting('soundField', 'music');
  }

  setMovieSoundField() {
    return this.setSoundSetting('soundField', 'movie');
  }

  setClearAudioPlusSoundField() {
    return this.setSoundSetting('soundField', 'clearAudio');
  }

  setVoiceUp(value) {
    if (value < 1 || value > 3) {
      value = 1;
    }
    return this.setSoundSetting('voice', `type${value}`);
  }

  setNightModeOn() {
    return this.setSoundSetting('nightMode', 'on');
  }

  setNightModeOff() {
    return this.setSoundSetting('nightMode', 'off');
  }
}

async function requestAndResponse(options, label) {
  options.body['id'] = 1;
  const response = await request(options);
  if (response.error) {
    throw new Error(`${label}: ${JSON.stringify(response.error)}`);
  }
  return response.result;
}

Api.INPUTS = {
  extInput: ['bd-dvd', 'btAudio', 'game', 'hdmi', 'line', 'sat-catv', 'source', 'tv', 'video', 'airPlay'],
  dlna: ['music'],
  storage: ['usb1'],
  radio: ['fm'],
  netService: ['audio'],
  multiroom: ['audio'],
  cast: ['audio']
};

module.exports = Api;

function log(message) {
  const now = (new Date()).toISOString();
  console.log(`${now} [api] ${message}`);
}
