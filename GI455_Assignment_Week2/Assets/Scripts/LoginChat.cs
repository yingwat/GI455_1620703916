using UnityEngine;
using UnityEngine.SceneManagement;

namespace Login
{ 
  public class LoginChat : MonoBehaviour
  {
      public void CheckLogin()
      {
          SceneManager.LoadScene("ChatScenes");
      }
  }  
}

