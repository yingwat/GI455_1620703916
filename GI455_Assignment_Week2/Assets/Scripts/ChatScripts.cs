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
        private WebSocket websocket;
        public InputField InputMessage;
        public Text SendMessage;
        public Text ReadMessage;
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
            
            websocket.Send(username+" Connect \n");
        }
        
        public void CheckSendMessage()
        {
            TextMessage = InputMessage.text;
            
            ListChat  = username + ":" + TextMessage + "<size=16> ( " + time.ToString("HH:mm")+ " ) </size> " + "\n";

            websocket.Send(ListChat);
            
            
        }
        
        void Update()
        {
            if (ListText != null)
            {
                updatMessage();
            }
        }

        void updatMessage()
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
        }

        private void OnDestroy()
        {
            if (websocket != null)
            {
                websocket.Close();
            }
        }

        public void OnMessage(object sender, MessageEventArgs messageEventArgs)
        {
            Debug.Log(messageEventArgs.Data);
            ListText = messageEventArgs.Data;
        }
    }
    
}

