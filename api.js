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
        id: 55,
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
        id: 55,
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
      method: 'GET',
      uri: `${this.endpoint}/system`,
      body: {
        method: 'getPowerStatus',
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Getting power status failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  audioService() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/avContent`,
      body: {
        id: 47,
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

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Switching to audio service failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  getVolume() {
    const options = {
      method: 'GET',
      uri: `${this.endpoint}/audio`,
      body: {
        id: 33,
        method: 'getVolumeInformation',
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Getting volume failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  setVolume(volume) {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        id: 98,
        method: 'setAudioVolume',
        params: [{ volume: `${volume}` }],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Setting volume failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  mute() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        id: 601,
        method: 'setAudioMute',
        params: [{ mute: 'on' }],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Muting failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  unmute() {
    const options = {
      method: 'POST',
      uri: `${this.endpoint}/audio`,
      body: {
        id: 601,
        method: 'setAudioMute',
        params: [{ mute: 'off' }],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Unmuting failed: ${JSON.stringify(response.error)}`);
      }
    });
  }

  getAllSoundSettings() {
    return this.getSoundSettings('');
  }

  getSoundSettings(target) {
    const options = {
      method: 'GET',
      uri: `${this.endpoint}/audio`,
      body: {
        method: 'getSoundSettings',
        params:[ { target } ],
        version: '1.1'
      },
      json: true
    };

    return request(options).then(response => {
      if (response.error) {
        return Promise.reject(`Getting sound settings failed: ${JSON.stringify(response.error)}`);
      }
    });
  }
}

module.exports = Api;
