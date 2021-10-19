using UnityEngine;
using System.Collections;

[System.Serializable]
/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* globals */
 // meters
/* scratchpad */
[UnityEngine.RequireComponent(typeof(TextMesh))]
public partial class Prompt : MonoBehaviour
{
    private static Prompt instance;
    private float MESSAGE_DISTANCE;
    private TextMesh messageText;
    public virtual void Start()
    {
        this.messageText = (TextMesh) this.GetComponent(typeof(TextMesh));
        if (this.messageText)
        {
            this.messageText.text = "";
        }
    }

    public static Prompt Instance()
    {
        if (Prompt.instance == null)
        {
            Prompt.instance = (Prompt) UnityEngine.Object.FindObjectOfType(typeof(Prompt));
        }
        return Prompt.instance;
    }

    /* 
countdownInfo = [ level : float, timeLeft : float ]
*/
    public virtual void ShowCountdown(object[] countdownInfo)
    {
        if (this.messageText)
        {
            int levelsLeft = (int) countdownInfo[0];
            int timeLeft = (int) countdownInfo[1];
            string levelText = levelsLeft > 1 ? levelsLeft + " levels remaining." : "Final level!\nDon't chicken out now.\n";
            this.messageText.text = ((levelText + "\nLevel starts in ") + timeLeft) + "..";
        }
    }

    public virtual void ShowRoundOver(bool gameover)
    {
        if (this.messageText)
        {
            if (Random.value > 0.5f)
            {
                this.messageText.text = gameover ? "You're zombie chow!\n\nFor guns 'n glory: pull trigger\nFor work and worry: escape" : "For guns 'n glory: pull trigger\nFor work and worry: escape";
            }
            else
            {
                this.messageText.text = gameover ? "Aw crap!\n\nHeroes: pull trigger\nQuitters: escape" : "Heroes: pull trigger\nQuitters: escape";
            }
        }
    }

    public virtual IEnumerator ShowMegaKill(int killCount)
    {
        switch (killCount)
        {
            case 1:
                if (this.messageText)
                {
                    this.messageText.text = "Double Kill!";
                }
                yield return new WaitForSeconds(0.9f);
                this.Hide();
                break;
            case 2:
                if (this.messageText)
                {
                    this.messageText.text = "Triple Kill!";
                }
                yield return new WaitForSeconds(0.9f);
                this.Hide();
                break;
            default:
                if (this.messageText)
                {
                    this.messageText.text = "Mega Kill!";
                }
                yield return new WaitForSeconds(0.9f);
                this.Hide();
                break;
        }
    }

    public virtual void Hide()
    {
        if (this.messageText)
        {
            this.messageText.text = "";
        }
    }

    public virtual void SetActive(bool state)
    {
        this.messageText.gameObject.SetActive(state);
    }

    public Prompt()
    {
        this.MESSAGE_DISTANCE = 4.5f;
    }

}