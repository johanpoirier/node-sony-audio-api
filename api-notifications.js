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
        const client = new WebSocketClient();

        client.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });

        client.on('connect', function (connection) {
            this.connection = connection;

            console.log('WebSocket Client Connected');

            connection.on('error', function (error) {
                console.log("Connection Error: " + error.toString());
            });

            connection.on('close', function () {
                console.log('WebSocket Connection Closed');
            });

            connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    const msg = JSON.parse(message.utf8Data);

                    if (msg.id === POWER_STATUS_ID) {
                        if (this.subscribers[POWER_STATUS_ID]) {
                            this.subscribers[POWER_STATUS_ID].forEach(subscriber => subscriber(msg));
                        }
                    } else {
                        console.log("Received: '" + message.utf8Data + "'");
                    }
                }
            });
        });

        client.connect(`ws://${this.endpoint}/sony/avContent`);
    }

    subscribeToPowerChange(callback) {
        if (this.connection && this.connection.connected) {
            this.subscribers[POWER_STATUS_ID].push(callback);
            connection.sendUTF(JSON.stringify(switchNotifications(POWER_STATUS_ID, [], [{
                name: 'notifyPowerStatus',
                version: '1.0'
            }])));
        }
    }
}

function switchNotifications(id, disable, enable) {
    return {
        "method": "switchNotifications",
        "id": id,
        "params": [{
            "disabled": disable,
            "enabled": enable
        }],
        "version": "1.0"
    }
}

module.exports = ApiNotifications;
