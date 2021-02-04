var websocket = require('ws');

var callbackInitServer = ()=>{
    console.log("Server Conect.")
};
var wss = new websocket.Server({port:41234},callbackInitServer);

var websocketList =[];

wss.on("connection",(ws)=>{
    console.log("Client Connected.");

    websocketList.push(ws)

    ws.on("message", (data)=>{
        console.log("send from client : "+ data);
        Broadcast(data);

    })

    ws.on("close",()=>{
        console.log("Client Disconnected")
        websocketList = ArrayRemove(websocketList , ws)
    });

});

function ArrayRemove(arr, value)
{
    return arr.filter((element)=>{
        return element != value;
    });
}

function Broadcast(data)
{
    for(var i = 0; i < websocketList.length; i++)
    {
        websocketList[i].send(data);
    }
    
}
