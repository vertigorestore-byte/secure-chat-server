const WebSocket = require("ws");

// Render provides the port automatically
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

const rooms = {};

wss.on("connection", ws => {
    ws.on("message", msg => {
        const packet = JSON.parse(msg);

        if (packet.type === "join") {
            if (!rooms[packet.roomId]) rooms[packet.roomId] = [];
            rooms[packet.roomId].push(ws);
            return;
        }

        if (packet.type === "msg") {
            const clients = rooms[packet.roomId] || [];
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: "msg",
                        data: packet.data
                    }));
                }
            });
        }
    });

    ws.on("close", () => {
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(c => c !== ws);
        }
    });
});

console.log("Secure Relay Server running on port", port);
