const sqlite = require("sqlite3").verbose();
var websocket = require("ws");

var callbackInitServer = () => {
  console.log("Fralyst Server is running.");
};

var wss = new websocket.Server({ port: 5500 }, callbackInitServer);

var wsList = [];
var roomList = [];

// var username = "test001";
// var name = "test1";
// var password = "123456";

// let db = new sqlite.Database(
//   "./DB/chatDB.db",
//   sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE,
//   (err) => {
//     if (err) throw err;

//     console.log("Connected to database");

//     var sqlSelect = `SELECT * FROM UserData WHERE UserID = '${username}' AND Password = '${password}' `;
//     var sqlInsert = `INSERT INTO UserData (UserID, Password, Name) VALUES ('${username}', '${password}', '${name}')`;

//     db.all(
//       sqlSelect,
//       (err, rows) => {
//         if (err) {
//           console.log(err);
//         }
//         console.log(rows);
//         // console.table(rows);
//         // console.log(`${id} ${password}`);
//       }
//     );
//   }
// );

wss.on("connection", (ws) => {
  {
    ws.on("message", (data) => {
      // console.log(data);

      var toJSON = JSON.parse(data);

      // console.log(toJSON["eventName"]);
      // console.log(toJSON.eventName);

      if (toJSON.eventName == "CreateRoom") {
        console.log("Client request CreateRoom [" + toJSON.data + "]");
        var isFoundRoom = false;
        for (var i = 0; i < roomList.length; i++) {
          if (roomList[i].roomName == toJSON.data) {
            isFoundRoom = true;
            break;
          }
        }

        if (isFoundRoom) {
          //callback to client roomname is exist
          console.log("Room is exist");
          console.log("Create Room failed");
          var resultData = {
            eventName: toJSON.eventName,
            data: toJSON.data,
            status: "fail",
          };

          var jsonToStr = JSON.stringify(resultData);
          ws.send(jsonToStr);
        } else {
          //create room
          var newRoom = {
            roomName: toJSON.data,
            wsList: [],
          };

          newRoom.wsList.push(ws);

          roomList.push(newRoom);

          var resultData = {
            eventName: toJSON.eventName,
            data: toJSON.data,
            status: "success",
          };

          var jsonToStr = JSON.stringify(resultData);

          console.log("Room is not exist");
          console.log("Create Room : " + newRoom.roomName);

          ws.send(jsonToStr);

          for (var i = 0; i < roomList.length; i++) {
            console.log(
              `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
            );
          }
        }
      } else if (toJSON.eventName == "JoinRoom") {
        console.log("Client request to Join Room [" + toJSON.data + "]");
        var isRoomExist = false;
        var roomindex;
        for (var i = 0; i < roomList.length; i++) {
          if (roomList[i].roomName == toJSON.data) {
            isRoomExist = true;
            roomindex = i;
            break;
          }
        }

        if (isRoomExist) {
          console.log("Join Room [" + toJSON.data + "] success");
          roomList[roomindex].wsList.push(ws);

          var resultData = {
            eventName: toJSON.eventName,
            data: toJSON.data,
            status: "success",
          };

          var jsonToStr = JSON.stringify(resultData);
          ws.send(jsonToStr);
        } else {
          console.log("Join Room [" + toJSON.roomName + "] failed");
          var resultData = {
            eventName: toJSON.eventName,
            data: toJSON.data,
            status: "fail",
          };

          var jsonToStr = JSON.stringify(resultData);
          ws.send(jsonToStr);
        }
        for (var i = 0; i < roomList.length; i++) {
          console.log(
            `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
          );
        }
      } else if (toJSON.eventName == "LeaveRoom") {
        console.log("Client request to Leave Room [" + toJSON.data + "]");
        var isLeave = false;
        for (var i = 0; i < roomList.length; i++) {
          for (var j = 0; j < roomList[i].wsList.length; j++) {
            if (ws == roomList[i].wsList[j]) {
              roomList[i].wsList.splice(j, 1);
              if (roomList[i].wsList.length <= 0) {
                roomList.splice(i, 1);
              }
              isLeave = true;
              break;
            }
          }
        }
        var resultData = {
          eventName: toJSON.eventName,
          data: toJSON.data,
          status: "success",
        };
        var jsonToStr = JSON.stringify(resultData);
        ws.send(jsonToStr);
        if (isLeave) {
          console.log("Leave room [ success ]");
        } else {
          console.log("Leave room [ failed ]");
        }
        for (var i = 0; i < roomList.length; i++) {
          console.log(
            `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
          );
        }
      } else if (toJSON.eventName == "SendMessage") {
        console.log(toJSON.data);
        var resultData = {
          eventName: toJSON.eventName,
          data: toJSON.data,
          status: "success",
        };
        var jsonToStr = JSON.stringify(resultData);
        Broadcast(ws, jsonToStr);
      } else if (toJSON.eventName == "Login") {
        var userCheck = JSON.parse(toJSON.data);
        console.log(userCheck);
        let db = new sqlite.Database(
          "./database/chatDB.db",
          sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE,
          (err) => {
            if (err) throw err;

            console.log("Connected to database");

            var sqlSelect = `SELECT * FROM UserData WHERE UserID = '${userCheck.username}' AND Password = '${userCheck.password}' `;
            var sqlInsert = `INSERT INTO UserData (UserID, Password, Name) VALUES ('${userCheck.username}', '${userCheck.password}', '${userCheck.name}')`;

            db.all(sqlSelect, (err, rows) => {
              if (err) {
                console.log(err);
              } else {
                // console.log(rows);
                if (!rows.length) {
                  var resultData = {
                    eventName: toJSON.eventName,
                    data: rows,
                    status: "fail",
                  };
                  var jsonToStr = JSON.stringify(resultData);
                  ws.send(jsonToStr);
                  // console.log(resultData);
                } else {
                  // var displayName = rows[0].Name;
                  // console.log(displayName);
                  var resultData = {
                    eventName: toJSON.eventName,
                    data: rows[0].Name,
                    status: "success",
                  };
                  var jsonToStr = JSON.stringify(resultData);
                  ws.send(jsonToStr);
                  // console.log(resultData);
                }
                // console.table(rows);
                // console.log(`${id} ${password}`);
              }
            });
          }
        );
      } else if (toJSON.eventName == "Register") {
        var userCheck = JSON.parse(toJSON.data);
        console.log(userCheck);
        let db = new sqlite.Database(
          "./DB/chatDB.db",
          sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE,
          (err) => {
            if (err) throw err;

            console.log("Connected to database");

            // var sqlSelect = `SELECT * FROM UserData WHERE UserID = '${userCheck.username}' AND Password = '${userCheck.password}' `;
            var sqlInsert = `INSERT INTO UserData (UserID, Password, Name) VALUES ('${userCheck.username}', '${userCheck.password}', '${userCheck.displayname}')`;

            db.all(sqlInsert, (err, rows) => {
              if (err) {
                console.log(err);
              } else {
                // console.log(rows);
                if (!rows.length) {
                  var resultData = {
                    eventName: toJSON.eventName,
                    data: rows,
                    status: "success",
                  };
                  var jsonToStr = JSON.stringify(resultData);
                  ws.send(jsonToStr);
                  // console.log(resultData);
                } else {
                  // var displayName = rows[0].Name;
                  // console.log(displayName);
                  var resultData = {
                    eventName: toJSON.eventName,
                    data: rows,
                    status: "fail",
                  };
                  var jsonToStr = JSON.stringify(resultData);
                  ws.send(jsonToStr);
                  // console.log(resultData);
                }
                // console.table(rows);
                // console.log(`${id} ${password}`);
              }
            });
          }
        );
      }
    });
  }

  console.log("client connected.");
  wsList.push(ws);

  ws.on("close", () => {
    console.log("client disconnected.");
    for (var i = 0; i < roomList.length; i++) {
      for (var j = 0; j < roomList[i].wsList.length; j++) {
        if (ws == roomList[i].wsList[j]) {
          roomList[i].wsList.splice(j, 1);
          if (roomList[i].wsList.length <= 0) {
            roomList.splice(i, 1);
          }
          isLeave = true;
          break;
        }
      }
    }

    for (var i = 0; i < roomList.length; i++) {
      console.log(
        `ws in [${roomList[i].roomName}] is ${roomList[i].wsList.length}`
      );
    }
  });
});

function ArrayRemove(arr, value) {
  return arr.filter((element) => {
    return element != value;
  });
}

function Broadcast(ws, message) {
  var selecttRoomIndex = -1;
  for (var i = 0; i < roomList.length; i++) {
    for (var j = 0; j < roomList[i].wsList.length; j++) {
      if (ws == roomList[i].wsList[j]) {
        selecttRoomIndex = i;
        break;
      }
    }
  }

  for (var i = 0; i < roomList[selecttRoomIndex].wsList.length; i++) {
    var callbackMsg = {
      eventName: "SendMessage",
      data: message,
      status: "success",
    };
    roomList[selecttRoomIndex].wsList[i].send(message);
  }
}
