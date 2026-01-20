const WebSocketClient = require('websocket').client;

const SYSTEM_NOTIFICATIONS_MESSAGE_ID = 10;
const POWER_STATUS_MESSAGE_ID = 11;

const POWER_STATUS_METHOD = 'notifyPowerStatus';

class SonyWsMonitor {

    constructor(endpoint) {
        this.endpoint = endpoint;
        this.connection = null;
        this.subscribers = {};
        this.subscribers[POWER_STATUS_METHOD] = [];
    }

    start() {
        return new Promise((resolve, reject) => {
            const client = new WebSocketClient();

            client.on('connectFailed', error => {
                log('Connect Error: ' + error.toString());
                reject("Connect Error: " + error.toString());
            });

            client.on('connect', connection => {
                this.connection = connection;

                connection.on('error', error => log('Connection Error: ' + error.toString()));
                connection.on('close', () => log('WebSocket Connection Closed'));

                connection.on('message', message => {
                    if (message.type === 'utf8') {
                        const msg = JSON.parse(message.utf8Data);
                        if (msg.method && msg.method === POWER_STATUS_METHOD) {
                            this.subscribers[POWER_STATUS_METHOD].forEach(cb => cb(msg.params));
                        }
                    }
                    log(message);
                });

                log('WebSocket Client Connected');

                resolve();
            });

            client.connect(`ws://${this.endpoint}/sony/system`);
        });
    }

    subscribeToPowerChange(callback) {
        if (!this.connection) {
            log('No ws connection available');
            return;
        }
        if (!this.connection.connected) {
            log('Not connected to ws');
            return;
        }

        const onPowerStatusMessage = message => {
            if (message.type === 'utf8') {
                const msg = JSON.parse(message.utf8Data);
                if (msg.id === SYSTEM_NOTIFICATIONS_MESSAGE_ID) {
                    const allSystemNotifications = msg.result[0].disabled.concat(msg.result[0].enabled);
                    const enable = [];
                    const disable = [];

                    allSystemNotifications.forEach(item => item.name === 'notifyPowerStatus' ? enable.push(item) : disable.push(item));
                    this.connection.sendUTF(JSON.stringify(switchNotifications(POWER_STATUS_MESSAGE_ID, disable, enable)));
                } else if (msg.id === POWER_STATUS_MESSAGE_ID) {
                    this.subscribers[POWER_STATUS_METHOD].push(callback);
                }
            }
        };

        this.connection.on('message', onPowerStatusMessage);
        this.connection.sendUTF(JSON.stringify(switchNotifications(SYSTEM_NOTIFICATIONS_MESSAGE_ID, [], [])));
    }
}

function switchNotifications(id, disable, enable) {
    return {
        method: 'switchNotifications',
        id,
        params: [{
            disabled: disable,
            enabled: enable
        }],
        version: '1.0'
    }
}

module.exports = SonyWsMonitor;

function log(message) {
    const now = (new Date()).toISOString();
    console.log(`${now} [notifications] ${message}`);
}
