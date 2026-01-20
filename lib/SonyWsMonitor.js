import WebSocket from 'ws'

const GET_SUBSCRIPTIONS_ID = 10
const PUSH_SUBSCRIPTIONS_ID = 11

export class SonyWsMonitor {
  constructor(ip, port) {
    this.reconnectInterval = 5000;
    this.wsEnpointUrl = `ws://${ip}:${port}/sony`;
  }

  subscribeToPowerStatus(callback) {
    this.subscribeTo('system', ['notifyPowerStatus'], (notificationName, data) => {
      if (notificationName ===  'notifyPowerStatus') {
        console.log('[WS-system] Received power status', JSON.stringify(data));
        callback(data.status)
      }
    });
  }

  subscribeToVolumeChange(callback) {
    this.subscribeTo('audio', ['notifyVolumeInformation'], (notificationName, data) => {
      if (notificationName ===  'notifyVolumeInformation') {
        console.log(`[WS-audio] Received volume information`, JSON.stringify(data));
        callback(data.volume)
      }
    })
  }

  subscribeToPlayingContent(callback) {
    this.subscribeTo('avContent', ['notifyPlayingContentInfo'], (notificationName, data) => {
      if (notificationName ===  'notifyPlayingContentInfo') {
        console.log(`[WS-avContent] Received playing content information`, JSON.stringify(data));
        callback(data)
      }
    })
  }

  subscribeTo(service, notificationNames, callback) {
    console.log(`[WS-${service}] Connecting...`);
    const ws = new WebSocket(`${this.wsEnpointUrl}/${service}`);

    ws.on('open', async () => {
      console.log(`[WS-${service}] Connected.`);

      ws.send(JSON.stringify({
        method: 'switchNotifications',
        id: GET_SUBSCRIPTIONS_ID,
        params: [{
          enabled: [],
          disabled: []
        }],
        version: '1.0'
      }))

      console.log(`[WS-${service}] Sent subscription request for ${notificationNames}`);
    })

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data);
        console.log(`[WS-${service}] Received message`, JSON.stringify(message));

        if (message.id === GET_SUBSCRIPTIONS_ID) {
          if (message.error) {
            console.error(`[WS-${service}] Subscription init failed`, message.error);
          } else {
            const enabled = []
            const disabled = []

            message.result[0].disabled.forEach((item) => {
              if (notificationNames.includes(item.name)) {
                enabled.push(item);
              } else {
                disabled.push(item)
              }
            })

            ws.send(JSON.stringify({
              method: 'switchNotifications',
              id: PUSH_SUBSCRIPTIONS_ID,
              params: [{
                enabled,
                disabled
              }],
              version: '1.0'
            }))
          }
        } else if (message.id === PUSH_SUBSCRIPTIONS_ID) {
          console.log(`[WS-${service}] Subscriptions confirmed`);
        } else {
          callback(message.method, message.params[0]);
        }
      } catch (error) {
        console.error(`[WS-${service}] Error parsing message`, error.message);
      }
    })

    ws.on('close', () => {
      console.log(`[WS-${service}] Closed. Retrying in ${this.reconnectInterval}s…`);
      setTimeout(() => this.subscribeTo(service, notificationNames, callback), this.reconnectInterval);
    });

    ws.on('error', (err) => {
      console.error(`[WS-${service}] Error: ${err.message}`);
      ws.close();
    });
  }
}