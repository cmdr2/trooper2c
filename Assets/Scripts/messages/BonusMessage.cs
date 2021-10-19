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
public partial class BonusMessage : MonoBehaviour
{
    private static BonusMessage instance;
    private static float MESSAGE_DISTANCE;
    private TextMesh bonusMessageText;
    public virtual void Start()
    {
        this.bonusMessageText = (TextMesh) this.GetComponent(typeof(TextMesh));
        if (this.bonusMessageText)
        {
            this.bonusMessageText.text = "";
        }
    }

    public static BonusMessage Instance()
    {
        if (BonusMessage.instance == null)
        {
            BonusMessage.instance = (BonusMessage) UnityEngine.Object.FindObjectOfType(typeof(BonusMessage));
        }
        return BonusMessage.instance;
    }

    public virtual void Show(object[] bonuses)
    {
        if (this.bonusMessageText)
        {
            this.bonusMessageText.text = ((("Skill Bonus: " + bonuses[0]) + "!\n") + "Difficulty Bonus: ") + bonuses[1];
        }
    }

    public virtual void Hide()
    {
        if (this.bonusMessageText)
        {
            this.bonusMessageText.text = "";
        }
    }

    static BonusMessage()
    {
        BonusMessage.MESSAGE_DISTANCE = 4.5f;
    }

}