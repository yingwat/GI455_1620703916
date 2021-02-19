var websocket = require('ws');

var callbackInitServer = ()=>{
    console.log("Server Conect.")
};
var wss = new websocket.Server({port:41234},callbackInitServer);

var wsList = [];
var roomList = [];

wss.on("connection",(ws)=>{
    
    console.log("Client Connected.");

    var toJsonObj = {
        roomName:"",
        data:""
    }
    
    ws.on("message", (data)=>{
        console.log("send from client :"+ data);
        
        toJsonObj = JSON.parse(data);
        
        if(toJsonObj.eventName == "CreateRoom")
        {
            console.log("client request CreateRoom:"+ toJsonObj.data);
            
            var isFoundRoom = false;
            for(var i = 0; i < roomList.length; i++)
            {
                if(roomList[i].roomName == toJsonObj.data)
                {
                    isFoundRoom = true;
                    break;
                }
            }
            
            if(isFoundRoom == true)
            {
                ws.send("CreateRoomFail")
                
                console.log("client create room fail.");
            }
            else
            {
                var newRoom = {
                    roomName: toJsonObj.data,
                    wsList: []
                }

                newRoom.wsList.push(ws);

                roomList.push(newRoom);

                var callbackMsg = {
                    eventName:"CreateRoom",
                    data:toJsonObj.data
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);
                
                console.log("client create room success.");
            }
            wsList.push(ws)
        }
        else if(toJsonObj.eventName == "JoinRoom")
        {
            var isJoinRoom = false;
            for(var i = 0; i < roomList.length; i++)
            {
                if(roomList[i].roomName == toJsonObj.data)
                {
                    isJoinRoom = true;
                    break;
                }
            }

            if(isJoinRoom == true)
            {
                /*var joinRoom = {
                    roomName: toJsonObj.data,
                    wsList: []
                }

                joinRoom.wsList.push(ws);

                roomList.push(joinRoom);


                var callbackMsg = {
                    eventName:"JoinRoom",
                    data:toJsonObj.data
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);

                console.log("client request JoinRoom");*/
                /*var callbackMsg = {
                    eventName:"JoinRoom",
                    data:"fail"
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);
                
                console.log("client join room fail.");*/
                var joinRoom = {
                    roomName: toJsonObj.roomName,
                    wsList: []
                }

                joinRoom.wsList.push(ws);

                roomList.push(joinRoom);

                ws.send("JoinRoomSuccess");

                console.log("client join room success.");
            }
            else
            {
                /*var callbackMsg = {
                    eventName:"JoinRoom",
                    data:"fail"
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);

                console.log("client join room fail.");*/
                /*var joinRoom = {
                    roomName: toJsonObj.data,
                    wsList: []
                }

                joinRoom.wsList.push(ws);

                roomList.push(joinRoom);


                var callbackMsg = {
                    eventName:"JoinRoom",
                    data:toJsonObj.data
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);

                console.log("client request JoinRoom");*/
                ws.send("JoinRoomFail")

                console.log("client join room fail.");
            }
           
        }
        else if(toJsonObj.eventName == "LeaveRoom")
        {
            
            var isLeaveSuccess = false;
            for(var i = 0; i < roomList.length; i++)
            {
                for(var j = 0; j < roomList[i].wsList.length; j++)
                {
                    if(ws == roomList[i].wsList[j])
                    {
                        roomList[i].wsList.splice(j, 1);

                        if(roomList[i].wsList.length <= 0)
                        {
                            roomList.splice(i, 1);
                        }
                        isLeaveSuccess = true;
                        break;
                    }
                }
            }
            
            if(isLeaveSuccess)
            {
                var callbackMsg = {
                    eventName:"LeaveRoom",
                    data:"success"
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);
                

                console.log("leave room success");
            }
            else
            {
                
                var callbackMsg = {
                    eventName:"LeaveRoom",
                    data:"fail"
                }
                var toJsonStr = JSON.stringify(callbackMsg);
                ws.send(toJsonStr);
                
                console.log("leave room fail");
            }
        }
    });

    //wsList.push(ws)
    
    ws.on("close", ()=>{
        console.log("client disconnected.");

       
        for(var i = 0; i < roomList.length; i++)
        {
            for(var j = 0; j < roomList[i].wsList.length; j++)
            {
                if(ws == roomList[i].wsList[j])
                {
                    roomList[i].wsList.splice(j, 1);

                    if(roomList[i].wsList.length <= 0)
                    {
                        roomList.splice(i, 1);
                    }
                    break;
                }
            }
        }
    });
});

/*function ArrayRemove(arr, value)
{
    return arr.filter((element)=>{
        return element != value;
    });
}*/

function Broadcast(data)
{
    /*for(var i = 0; i < websocketList.length; i++)
    {
        websocketList[i].send(data);
    }*/
    
}
