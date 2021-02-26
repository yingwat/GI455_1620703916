const sqlite = require("sqlite3").verbose();
var websocket = require("ws");

var callbackInitServer = () => {
  console.log("Fralyst Server is running.");
};

var wss = new websocket.Server({ port: 5500 }, callbackInitServer);

var wsList = [];
var roomList = [];

let db = new sqlite.Database(
  "./DB/chatDB.db",
  sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE,
  (err) => {
    if (err) throw err;

    console.log("Connected to database");
  }
);

wss.on("connection", (ws) => {
  {
    ws.on("message", (data) => {
      // console.log(data);

      var toJSON = JSON.parse(data);

      // console.log(toJSON["eventName"]);
      // console.log(toJSON.eventName);

      switch (toJSON.eventName) {
        case "CreateRoom":
          CreateRoom(ws, toJSON.eventName, toJSON.data);
          break;
        case "JoinRoom":
          JoinRoom(ws, toJSON.eventName, toJSON.data);
          break;
        case "LeaveRoom":
          LeaveRoom(ws, toJSON.eventName, toJSON.data);
          break;
        case "SendMessage":
          SendMessage(ws, toJSON.eventName, toJSON.data);
          break;
        case "Login":
          Login(ws, toJSON.eventName, toJSON.data);
          break;
        case "Register":
          Register(ws, toJSON.eventName, toJSON.data);
          break;
        default:
          console.log("Error case");
      }

      return toJSON;
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

function CreateRoom(ws, eventName, roomName) {
  console.log("Client request CreateRoom [" + roomName + "]");
  var isFoundRoom = false;
  for (var i = 0; i < roomList.length; i++) {
    if (roomList[i].roomName == roomName) {
      isFoundRoom = true;
      break;
    }
  }

  if (isFoundRoom) {
    //callback to client roomname is exist
    console.log("Room is exist");
    console.log("Create Room failed");
    var resultData = {
      eventName: eventName,
      data: roomName,
      status: "fail",
    };

    var jsonToStr = JSON.stringify(resultData);
    ws.send(jsonToStr);
  } else {
    //create room
    var newRoom = {
      roomName: roomName,
      wsList: [],
    };

    newRoom.wsList.push(ws);

    roomList.push(newRoom);

    var resultData = {
      eventName: eventName,
      data: roomName,
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
}

function JoinRoom(ws, eventName, roomName) {
  console.log("Client request to Join Room [" + roomName + "]");
  var isRoomExist = false;
  var roomindex;
  for (var i = 0; i < roomList.length; i++) {
    if (roomList[i].roomName == roomName) {
      isRoomExist = true;
      roomindex = i;
      break;
    }
  }

  if (isRoomExist) {
    console.log("Join Room [" + roomName + "] success");
    roomList[roomindex].wsList.push(ws);

    var resultData = {
      eventName: eventName,
      data: roomName,
      status: "success",
    };

    var jsonToStr = JSON.stringify(resultData);
    ws.send(jsonToStr);
  } else {
    console.log("Join Room [" + roomName + "] failed");
    var resultData = {
      eventName: eventName,
      data: roomName,
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
}

function LeaveRoom(ws, eventName, roomName) {
  console.log("Client request to Leave Room [" + roomName + "]");
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
    eventName: eventName,
    data: roomName,
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
}

function SendMessage(ws, eventName, message) {
  console.log(message);
  var resultData = {
    eventName: eventName,
    data: message,
    status: "success",
  };
  var jsonToStr = JSON.stringify(resultData);
  Broadcast(ws, jsonToStr);
}

function Login(ws, eventName, data) {
  var userCheck = JSON.parse(data);
  console.log(userCheck);

  var sqlSelect = `SELECT * FROM UserData WHERE UserID = '${userCheck.username}' AND Password = '${userCheck.password}' `;

  db.all(sqlSelect, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(rows);
      if (!rows.length) {
        var resultData = {
          eventName: eventName,
          data: rows,
          status: "fail",
        };
        var jsonToStr = JSON.stringify(resultData);
        ws.send(jsonToStr);
        // console.log(resultData);
      } else {
        // var displayName = rows[0].Name;
        // console.log(displayName);
        var userdata = JSON.stringify(rows[0])
        var resultData = {
          eventName: eventName,
          data: userdata,
          status: "success",
        };
        console.log(resultData.data);
        var jsonToStr = JSON.stringify(resultData);
        ws.send(jsonToStr);
        // console.log(resultData);
      }
      // console.table(rows);
      // console.log(`${id} ${password}`);
    }
  });
}

function Register(ws, eventName, data) {
  var userCheck = JSON.parse(data);
  console.log(userCheck);
  
  var sqlInsert = `INSERT INTO UserData (UserID, Password, Name) VALUES ('${userCheck.username}', '${userCheck.password}', '${userCheck.displayname}')`;

  db.all(sqlInsert, (err, rows) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(rows);
      if (!rows.length) {
        var resultData = {
          eventName: eventName,
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
          eventName: eventName,
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

