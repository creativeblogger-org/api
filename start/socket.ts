import Ws from 'App/Services/Ws';
Ws.boot()

Ws.io.on("connection", (socket) => {
    socket.emit("connected", "slt")

    socket.on("ok", (data: string) => {
        console.log(data);
    })
})
