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
        params: [{ status: 'active' }],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        console.log('Already powered on');
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
        params: [{ status: 'off' }],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        console.log('Already powered off');
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

  audioService() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/avContent`,
      body: {
        method: 'setPlayContent',
        params: [
          {
            output: '',
            uri: 'netService:audio'
          }
        ],
        version: '1.2'
      },
      json: true
    };

    return requestAndResponse(options, 'Switching to audio service');
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
        params: [],
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
        params: [{ volume: `${volume}` }],
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
        params: [{ mute: 'on' }],
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
        params: [{ mute: 'off' }],
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
        params: [{ target }],
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
    if (value < 0 || value > 2) {
      value = 0;
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

function requestAndResponse(options, label) {
  options.body['id'] = 1;
  return request(options).then(response => {
    if (response.error) {
      return Promise.reject(`${label}: ${JSON.stringify(response.error)}`);
    }
    return response.result;
  });
}

module.exports = Api;
