const WebSocketClient = require('websocket').client;

const POWER_STATUS_ID = 10;

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
                        console.log('Received:', msg);
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

        this.subscribers[POWER_STATUS_ID].push(callback);
        this.connection.sendUTF(JSON.stringify(switchNotifications(POWER_STATUS_ID, [], [{
            "name": "notifyPowerStatus",
            "version": "1.0"
        }])));
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
