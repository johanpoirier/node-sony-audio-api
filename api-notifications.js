const WebSocketClient = require('websocket').client;

const SYSTEM_NOTIFICATIONS_ID = 10;
const POWER_STATUS_ID = 11;

class ApiNotifications {

    constructor(endpoint) {
        this.endpoint = endpoint;
        this.connection = null;
        this.subscribers = {};
        this.subscribers[POWER_STATUS_ID] = [];
    }

    start() {
        return new Promise((resolve, reject) => {
            const client = new WebSocketClient();

            client.on('connectFailed', error => {
                console.log('Connect Error: ' + error.toString());
                reject("Connect Error: " + error.toString());
            });

            client.on('connect', connection => {
                this.connection = connection;
                resolve();

                console.log('WebSocket Client Connected');

                connection.on('error', error => console.log("Connection Error: " + error.toString()));
                connection.on('close', () => console.log('WebSocket Connection Closed'));

                connection.on('message', message => {
                    if (message.type === 'utf8') {
                        const msg = JSON.parse(message.utf8Data);
                        console.log(`Received message ${msg.id}`, msg.result);
                    } else {
                        console.dir(message);
                    }
                });
            });

            client.connect(`ws://${this.endpoint}/sony/system`);
        });
    }

    subscribeToPowerChange(callback) {
        if (!this.connection) {
            console.error('No ws connection available');
            return;
        }
        if (!this.connection.connected) {
            console.error('Not connected to ws');
            return;
        }

        const onPowerStatusMessage = message => {
            if (message.type === 'utf8') {
                const msg = JSON.parse(message.utf8Data);
                if (msg.id === SYSTEM_NOTIFICATIONS_ID) {
                    const allSystemNotifications = msg.result[0].disabled.concat(msg.result[0].enabled);
                    const enable = [];
                    const disable = [];

                    allSystemNotifications.forEach(item => item.name === 'notifyPowerStatus' ? enable.push(item) : disable.push(item));
                    this.connection.sendUTF(JSON.stringify(switchNotifications(POWER_STATUS_ID, disable, enable)));
                } else if (msg.id === POWER_STATUS_ID) {
                    this.subscribers[POWER_STATUS_ID].push(callback);
                }
            }
        };

        this.connection.on('message', onPowerStatusMessage);
        this.connection.sendUTF(JSON.stringify(switchNotifications(SYSTEM_NOTIFICATIONS_ID, [], [])));
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

module.exports = ApiNotifications;
