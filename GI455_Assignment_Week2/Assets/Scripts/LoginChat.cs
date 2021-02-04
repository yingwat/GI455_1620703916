using System;
using System.Collections;
using System.Collections.Generic;
using Chat;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using WebSocketSharp;

namespace Login
{ 
  public class LoginChat : MonoBehaviour
  {
      public InputField IPaddress;
      public InputField Port;
      public InputField UserName;
      public static string username;
      public static string ipaddress;
      public static string port;
      private WebSocket websocket;
      
      
      
      public void CheckLogin()
      {
          username  = UserName.text;
          ipaddress = IPaddress.text;
          port = Port.text;
          if (IPaddress.text != null && Port.text != null)
          {
              SceneManager.LoadScene("ChatScenes");
          }
          else
          {
              Debug.Log("IPaddress or Port incorrect");
          }
          
      }
  }  
}

