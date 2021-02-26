var websocket = require("ws");
const sqlite3 = require("sqlite3").verbose();

var callbackInitServer = () => {
  console.log("Server Conect.");
};

let db = new sqlite3.Database(
  "./database/chatDB.db",
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) throw err;

    console.log("Connected to database");

    var sqlSelect = "SELECT UserID, Password, Name FROM UserData";

    db.all(sqlSelect, (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        console.table(rows);
      }
    });
  }
);

var wss = new websocket.Server({ port: 41234 }, callbackInitServer);

var wsList = [];
var roomList = [];

wss.on("connection", (ws) => {
  console.log("Client Connected.");

  var toJsonObj = {
    eventName: "",
    data: "",
  };

  ws.on("message", (data) => {
    console.log("send from client :" + data);

    toJsonObj = JSON.parse(data);

    console.log(toJsonObj.eventName);

    if (toJsonObj.eventName == "CreateRoom") {
      console.log("client request CreateRoom:" + toJsonObj.data);

      var isFoundRoom = false;
      for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomName == toJsonObj.data) {
          isFoundRoom = true;
          break;
        }
      }

      if (isFoundRoom == true) {
        ws.send("CreateRoomFail");

        console.log("client create room fail.");
      } else {
        var newRoom = {
          roomName: toJsonObj.data,
          wsList: [],
        };

        newRoom.wsList.push(ws);

        roomList.push(newRoom);

        var callbackMsg = {
          eventName: "CreateRoom",
          data: toJsonObj.data,
        };
        var toJsonStr = JSON.stringify(callbackMsg);
        ws.send(toJsonStr);

        console.log("client create room success.");
      }
      for (var i = 0; i < roomList.length; i++) {
        console.log(
          `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
        );
      }

      //wsList.push(ws);
    } else if (toJsonObj.eventName == "JoinRoom") {
      var isJoinRoom = false;

      var roomindex;

      for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomName == toJsonObj.data) {
          isJoinRoom = true;
          roomindex = i;
          break;
        }
      }

      if (isJoinRoom == true) {

        var JoinRoom = {
          eventName: "JoinRoom",
          data:toJsonObj.data
        };

        roomList[roomindex].wsList.push(ws);

        ws.send(JSON.stringify(JoinRoom));

        console.log("client join room success.");
      } else {
        var JoinRoom = {
          eventName: "JoinRoom",
          data:"fail"
        };
        ws.send(JSON.stringify(JoinRoom));

        console.log("client join room fail.");
      }
      for (var i = 0; i < roomList.length; i++) {
        console.log(
          `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
        );
      }
    } else if (toJsonObj.eventName == "LeaveRoom") {
      var isLeaveSuccess = false;
      for (var i = 0; i < roomList.length; i++) {
        for (var j = 0; j < roomList[i].wsList.length; j++) {
          if (ws == roomList[i].wsList[j]) {
            roomList[i].wsList.splice(j, 1);

            if (roomList[i].wsList.length <= 0) {
              roomList.splice(i, 1);
            }
            isLeaveSuccess = true;
            break;
          }
        }
      }

      if (isLeaveSuccess) {
        var callbackMsg = {
          eventName: "LeaveRoom",
          data: "success",
        };
        var toJsonStr = JSON.stringify(callbackMsg);
        ws.send(toJsonStr);

        console.log("leave room success");
      } else {
        var callbackMsg = {
          eventName: "LeaveRoom",
          data: "fail",
        };
        var toJsonStr = JSON.stringify(callbackMsg);
        ws.send(toJsonStr);

        console.log("leave room fail");
      }
    } else if (toJsonObj.eventName == "Register") {
      var splitData = toJsonObj.data.split("#");
      var UserID = splitData[0];
      var password = splitData[1];
      var name = splitData[2];

      console.log(UserID + password + name);
      var sqlInsert = `INSERT INTO UserData (UserID, Password, Name) VALUES ('${UserID}','${password}','${name}')`;

      db.all(sqlInsert, (err, rows) => {
        if (err) {
          callbackMsg.data = "fail";
        } else {
          var callbackMsg = { eventName: "Register", data: rows };
          if (rows.length > 0) {
            var toJsonStr = JSON.stringify(callbackMsg);
            ws.send(toJsonStr);
          } else {
            callbackMsg.data = rows;
            var toJsonStr = JSON.stringify(callbackMsg);
            ws.send(toJsonStr);
          }
        }

        /*if(err)
                {
                    var callbackMsg = {
                        eventName:"Register",
                        data:"fail"
                    }

                    var toJsonStr = JSON.stringify(callbackMsg);
                }
                else
                {
                    console(rows);
                    if(rows.length >0)
                    {
                        var i; 
                        db.all("INSERT INTO chatDB (UserID, Password, Name) VALUES ('"+userID+"','"+password+"','"+name+"')");
                    }
                }*/
      });
    } else if (toJsonObj.eventName == "Login") {
      var callbackMsg = {
        eventName: "Login",
        data: "",
      };

      var splitData = toJsonObj.data.split("#");
      var userId = splitData[0].toString();
      var password = splitData[1].toString();

      db.all(
        `SELECT * FROM UserData WHERE USerID = '${userId}' AND Password = '${password}' `,
        (err, rows) => {
          if (err) {
            callbackMsg.data = "fail";
          } else {
            console.log(userId + password);
            console.log(rows);
            if (!rows.length) {
              callbackMsg.data = rows[0].Name;
              var toJsonStr = JSON.stringify(callbackMsg);
              ws.send(toJsonStr);
            } else {
              callbackMsg.data = rows[0].Name;
              var toJsonStr = JSON.stringify(callbackMsg);
              ws.send(toJsonStr);
            }
            console.log(toJsonStr);
          }
        }
      );
    } else if (toJsonObj.eventName == "SendMessage") {
      var callbackMsg = {
        eventName: "SendMessage",
        data: toJsonObj.data,
      };
      Broadcast(ws, JSON.stringify(callbackMsg));
    }
  });

  //wsList.push(ws)

  ws.on("close", () => {
    console.log("client disconnected.");

    for (var i = 0; i < roomList.length; i++) {
      for (var j = 0; j < roomList[i].wsList.length; j++) {
        if (ws == roomList[i].wsList[j]) {
          roomList[i].wsList.splice(j, 1);

          if (roomList[i].wsList.length <= 0) {
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

function Broadcast(ws, message) {
  var selecRoomIndex = -1;
  for (var i = 0; i < roomList.length; i++) {
    for (var j = 0; j < roomList[i].wsList.length; j++) {
      if (ws == roomList[i].wsList[j]) {
        selecRoomIndex = i;
        break;
      }
    }
  }

  for (var i = 0; i < roomList[selecRoomIndex].wsList.length; i++) {
    var callbackMsg = {
      eventName: "SendMessage",
      data: message,
    };
    roomList[selecRoomIndex].wsList[i].send(message);
  }
  for (var i = 0; i < roomList.length; i++) {
    console.log(
      `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
    );
  }
}
