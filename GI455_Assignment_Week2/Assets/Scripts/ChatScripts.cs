using System;
using System.Collections;
using System.Collections.Generic;
using Login;
using UnityEngine;
using UnityEngine.UI;
using WebSocketSharp;

namespace Chat
{
    public class ChatScripts : MonoBehaviour
    {
        public struct SocketEvent
        {
            public string eventName;
            public string data;

            public SocketEvent(string eventName, string data)
            {
                this.eventName = eventName;
                this.data = data;
            }
        }

        private WebSocket websocket;
        
        public InputField InputCreateNameRoom;

        
        public InputField InputJoinNameRoom;
        
        public Text RoomName;

        private string roomName;
        private string temp;

        public Button LeaveRoomButton;
        public Text DebugErroText;

        public InputField InputUserID;
        public InputField InputPassword;

        public InputField InputCreateUserID;
        public InputField InputCreatePassword;
        public InputField InputCreateRePassword;
        public InputField InputCreateName;


        public GameObject CreateRoomScenes;
        public GameObject LoginScense;
        public GameObject RegisterScence;
        public GameObject JoinRoomScenes;
        public GameObject ChatScence;
        public GameObject LobbyScence;

        public Text Username;
        public string Outname;

        public InputField InputMessage;
        public Text SendMessage;
        public Text ReadMessage;
        public Button SendButton;
        private string TextMessage;
        private string ListChat;
        private string ListText;
        //private DateTime time = DateTime.Now;

        void Start()
        {
            //var url = "127.0.0.1:5500";
            var url = "127.0.0.1:41234";
            //var url = "gi455-305013.an.r.appspot.com";
            websocket = new WebSocket("ws://" + url + "/");

            websocket.OnMessage += OnMessage;

            websocket.Connect();

            LoginScense.gameObject.SetActive(true);
        }

        public void OpenCreateRoom()
        {
            CreateRoomScenes.gameObject.SetActive(true);
            LobbyScence.gameObject.SetActive(false);
        }

        public void OpenJoinRoom()
        {
            JoinRoomScenes.gameObject.SetActive(true);
            LobbyScence.gameObject.SetActive(false);
        }

        public void LoginLobby()
        {
            var userid = InputUserID.text;
            var password = InputPassword.text;
            
            if (userid == "" || password == "") 
            {
                DebugErroText.text = "Please input all field";
            }
            else
            {
                SocketEvent socketEvent = new SocketEvent("Login", userid + "#" + password);
                               
                string toJsonStr = JsonUtility.ToJson(socketEvent);

                websocket.Send(toJsonStr);
            }
        }

        public void GotoRegister()
        {
            LoginScense.gameObject.SetActive(false);
            RegisterScence.gameObject.SetActive(true);
        }

        public void RegisterUser()
        {
            var userid = InputCreateUserID.text;
            var password = InputCreatePassword.text;
            var repassword = InputCreateRePassword.text;
            var name = InputCreateName.text;

            if (userid == "" || password == "" || name == "" || repassword == "")
            {
                DebugErroText.text = "Please input all field";
            }
            else if (password != repassword)
            {
                DebugErroText.text = "Passwords do not match ";
            }
            else if (password == repassword)
            {
                SocketEvent socketEvent = new SocketEvent("Register", userid + "#" + password + "#" + name);

                string toJsonStr = JsonUtility.ToJson(socketEvent);

                websocket.Send(toJsonStr);
            }
        }

        public void CreateRoom(string roomName)
        {
            roomName = InputCreateNameRoom.text;
          
            SocketEvent socketEvent = new SocketEvent("CreateRoom", roomName);

            string toJsonStr = JsonUtility.ToJson(socketEvent);

            websocket.Send(toJsonStr);
            
        }


        public void JoinRoom(string roomName)
        {
            roomName = InputJoinNameRoom.text;
            
            SocketEvent socketEvent = new SocketEvent("JoinRoom", roomName);

            string toJsonStr = JsonUtility.ToJson(socketEvent);

            websocket.Send(toJsonStr);
        }

        public void LeaveRoom()
        {
            SocketEvent socketEvent = new SocketEvent("LeaveRoom", "success");

            string toJsonStr = JsonUtility.ToJson(socketEvent);

            websocket.Send(toJsonStr);
            
        }

        public void CheckSendMessage()
        {
            //RoomName.text = rname.data;

            LobbyScence.gameObject.SetActive(false);
            CreateRoomScenes.gameObject.SetActive(false);
            JoinRoomScenes.gameObject.SetActive(false);
            
            ChatScence.gameObject.SetActive(true);
            LeaveRoomButton.gameObject.SetActive(true);

            TextMessage = InputMessage.text;
            
            ListChat  = Outname + ":" + TextMessage;
            
            Debug.Log(Outname + TextMessage + "\n");
            
            SocketEvent sendchat = new SocketEvent("SendMessage", ListChat);
            
            string toJsonStr = JsonUtility.ToJson(sendchat);
            
            websocket.Send(toJsonStr);
            
        }

        void Update()
        {
            UpdateNotifyMessage();
            
            if (ListText != null)
            {
                updatMessage();
            }
        }

        void updatMessage()
        {
            string[] tempp = ListText.Split(':');
            
            if (tempp[0] == Outname)
            {
                SendMessage.text += ListText + "\n";
                SendMessage.text += "\n";
                /*foreach (var i in ListText)
                {
                    SendMessage.text += i ;
                    ReadMessage.text += "\n" ;
                }*/
            }
            else
            {
                ReadMessage.text += "\n";
                ReadMessage.text += ListText + "\n";
                /*foreach (var i in ListText)
                {
                    SendMessage.text += "\n" ;
                    ReadMessage.text +=  i ;
                }*/
            }
            ListText = null;
        }

        private void OnDestroy()
        {
            if (websocket != null)
            {
                websocket.Close();
            }
        }

        private void UpdateNotifyMessage()
        {
            if (string.IsNullOrEmpty(temp) == false)
            {
                SocketEvent receiveMessageData = JsonUtility.FromJson<SocketEvent>(temp);

                if (receiveMessageData.eventName == "CreateRoom")
                {
                    ChatScence.SetActive(true);
                    CreateRoomScenes.SetActive(false);
                    LeaveRoomButton.gameObject.SetActive(true);

                    roomName = receiveMessageData.data;
                    RoomName.text = roomName;
                }
                else if (receiveMessageData.eventName == "JoinRoom")
                {
                    ChatScence.SetActive(true);
                    JoinRoomScenes.SetActive(false);
                    LeaveRoomButton.gameObject.SetActive(true);
                    
                    roomName = receiveMessageData.data;
                    RoomName.text = roomName;
                }
                else if (receiveMessageData.eventName == "LeaveRoom")
                {
                    ChatScence.SetActive(false);
                    LobbyScence.SetActive(true);
                }
                else if (receiveMessageData.eventName == "Login")
                {
                    LobbyScence.SetActive(true);
                    LoginScense.SetActive(false);
                    DebugErroText.text = " ";
                    
                    Outname = receiveMessageData.data;
                    Username.text = Outname;
                }
                else if (receiveMessageData.eventName == "Register")
                {
                    RegisterScence.gameObject.SetActive(false);
                    LoginScense.SetActive(true);
                    DebugErroText.text = " ";
                }
                else if (receiveMessageData.eventName == "SendMessage")
                {
                    ListText = receiveMessageData.data;
                }
                temp = "";
            }
        }


        public void OnMessage(object sender, MessageEventArgs messageEventArgs)
        {
            temp = messageEventArgs.Data;
            Debug.Log(temp);
        }
    }
}