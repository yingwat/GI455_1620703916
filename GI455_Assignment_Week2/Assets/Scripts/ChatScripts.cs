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

        public delegate void DelegateHandle(SocketEvent result);
        public DelegateHandle OnCreateRoom;
        public DelegateHandle OnJoinRoom;
        public DelegateHandle OnLeaveRoom;
        
        public Button ButtonCreateRoom;
        public Button ButtonJoinRoom;
        public Button createRoom;
        public InputField InputCreateNameRoom;
        //public string TextCreateNameRoom;
        public InputField InputJoinNameRoom;
        //public string TextJoinNameRoom;
        public Button joinRoom;
        public Text RoomName;
        private string roomname;
        public Button LeaveRoomButtpn;
        public Text DebugErroText;
        
        public InputField InputMessage;
        public Text SendMessage;
        public Text ReadMessage;
        public Button SendButton;
        private string TextMessage;
        private string ListChat;
        private string ListText;
        private string username = LoginChat.username;
        private string ipaddress = LoginChat.ipaddress;
        private string port = LoginChat.port;
        private DateTime time = DateTime.Now;

        void Start()
        {
            websocket = new WebSocket("ws://"+ ipaddress + ":" + port +"/");

            websocket.OnMessage += OnMessage;
            
            websocket.Connect();
        }
        
        public void OpenCreateRoom()
        {
            createRoom.gameObject.SetActive(true);
            InputCreateNameRoom.gameObject.SetActive(true);
            ButtonCreateRoom.gameObject.SetActive(false);
            ButtonJoinRoom.gameObject.SetActive(false);
        }
        
        public void OpenJoinRoom()
        {
            joinRoom.gameObject.SetActive(true);
            InputJoinNameRoom.gameObject.SetActive(true);
            ButtonCreateRoom.gameObject.SetActive(false);
            ButtonJoinRoom.gameObject.SetActive(false);
        }

        public void CreateRoom(string roomName)
        {
            roomName = InputCreateNameRoom.text;
            
            SocketEvent socketEvent = new SocketEvent("CreateRoom", roomName);
                
            string toJsonStr = JsonUtility.ToJson(socketEvent);
                
            websocket.Send(toJsonStr);
                            
            CheckSendMessage(socketEvent);

            /*if (roomName == roomname)
            {
                SocketEvent socketEvent = new SocketEvent("CreateRoom", roomName);
                
                string toJsonStr = JsonUtility.ToJson(socketEvent);
                
                websocket.Send(toJsonStr);
                            
                CheckSendMessage(socketEvent);
            }
            else
            {
                DebugErroText.gameObject.SetActive(true);
                DebugErroText.text = ("Duplicate name");
            }*/
        }

        public void JoinRoom(string roomName)
        {
            
            roomName = InputJoinNameRoom.text;
            
            SocketEvent socketEvent = new SocketEvent("JoinRoom", roomName);
                                                                              
            string toJsonStr = JsonUtility.ToJson(socketEvent);
                                                                              
            websocket.Send(toJsonStr);
            CheckSendMessage(socketEvent);

            /*if (roomName == roomname)
            {
                SocketEvent socketEvent = new SocketEvent("JoinRoom", roomName);
                                                                              
                string toJsonStr = JsonUtility.ToJson(socketEvent);
                                                                              
                websocket.Send(toJsonStr);
                CheckSendMessage(socketEvent);
            }
            else
            {
                DebugErroText.gameObject.SetActive(true);
                DebugErroText.text = ("Not found ");
            }*/
        }

        public void LeaveRoom()
        {
            SocketEvent socketEvent = new SocketEvent("LeaveRoom", "success");

            string toJsonStr = JsonUtility.ToJson(socketEvent);

            websocket.Send(toJsonStr);
            
            ButtonCreateRoom.gameObject.SetActive(true);
            ButtonJoinRoom.gameObject.SetActive(true);
            
            SendMessage.gameObject.SetActive(false);
            ReadMessage.gameObject.SetActive(false);
            InputMessage.gameObject.SetActive(false);
            SendButton.gameObject.SetActive(false);
            LeaveRoomButtpn.gameObject.SetActive(false);
            RoomName.gameObject.SetActive(false);
        }
        
        public void CheckSendMessage(SocketEvent rname)
        {
            RoomName.text = rname.data;
            RoomName.gameObject.SetActive(true);
            
            joinRoom.gameObject.SetActive(false);
            InputJoinNameRoom.gameObject.SetActive(false);
            ButtonCreateRoom.gameObject.SetActive(false);
            ButtonJoinRoom.gameObject.SetActive(false);
            createRoom.gameObject.SetActive(false);
            InputCreateNameRoom.gameObject.SetActive(false);
            
            SendMessage.gameObject.SetActive(true);
            ReadMessage.gameObject.SetActive(true);
            InputMessage.gameObject.SetActive(true);
            SendButton.gameObject.SetActive(true);
            LeaveRoomButtpn.gameObject.SetActive(true);
            
            
            /*TextMessage = InputMessage.text;

            RoomName = roomName.text;
            
            ListChat  = username + ":" + TextMessage + "<size=16> ( " + time.ToString("HH:mm")+ " ) </size> " + "\n";

            websocket.Send(ListChat);*/
        }
        
        void Update()
        {
            UpdateNotifyMessage();
            
            /*
            if (ListText != null)
            {
                updatMessage();
            }*/
        }

        /*void updatMessage()
        {
            string[] temp = ListText.Split(':');
            
            if (temp[0] == username)
            {
                foreach (var i in ListText)
                {
                    SendMessage.text += i ;
                }
            }
            else
            {
                foreach (var i in ListText)
                {
                    ReadMessage.text += i ;
                }
            }
            ListText = null;
        }*/

        private void OnDestroy()
        {
            if (websocket != null)
            {
                websocket.Close();
            }
        }
        
        private void UpdateNotifyMessage()
        {
            if (string.IsNullOrEmpty(roomname) == false)
            {
                SocketEvent receiveMessageData = JsonUtility.FromJson<SocketEvent>(roomname);

                if (receiveMessageData.eventName == "CreateRoom")
                {
                    if (OnCreateRoom != null)
                        OnCreateRoom(receiveMessageData);
                }
                else if (receiveMessageData.eventName == "JoinRoom")
                {
                    if (OnJoinRoom != null)
                        OnJoinRoom(receiveMessageData);
                }
                else if(receiveMessageData.eventName == "LeaveRoom")
                {
                    if (OnLeaveRoom != null)
                        OnLeaveRoom(receiveMessageData);
                }
                roomname = "";
            }
        }

        public void OnMessage(object sender, MessageEventArgs messageEventArgs)
        {
            Debug.Log(messageEventArgs.Data);
            //ListText = messageEventArgs.Data;
            roomname = messageEventArgs.Data;
        }
    }
    
}