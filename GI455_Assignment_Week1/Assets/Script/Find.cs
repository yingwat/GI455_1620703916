using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.Linq;

public class Find : MonoBehaviour
{
    private string TextName;
    public GameObject InputText;
    public GameObject OutputText;
    public Text TextShow;
    public string[] TextData;

    private void Start()
    {
        foreach (string textshow in TextData)
        {
            TextShow.text += textshow + "\n";
        }
    }

    public void CheckTextData()
    {
        TextName = InputText.GetComponent<Text>().text;
        
            if (TextData.Contains(TextName))
            {
                OutputText.GetComponent<Text>().text = "[ " + "<color=green>" + TextName + "</color>" + " ]" + " is found.";
            }
            else
            {
                OutputText.GetComponent<Text>().text = "[ " + "<color=red>" +TextName + "</color>" + " ]" + " is not found.";
            }
        
    }
}
