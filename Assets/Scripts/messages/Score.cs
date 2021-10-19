using UnityEngine;
using System.Collections;

[System.Serializable]
/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* scratchpad */
[UnityEngine.RequireComponent(typeof(TextMesh))]
public partial class Score : MonoBehaviour
{
    private static Score instance;
    private TextMesh scoreText;
    private int score;
    private int levelScore;
    private int lives;
    public virtual void Start()
    {
        this.scoreText = (TextMesh) this.GetComponent(typeof(TextMesh));
        this.Render();
    }

    public static Score Instance()
    {
        if (Score.instance == null)
        {
            Score.instance = (Score) UnityEngine.Object.FindObjectOfType(typeof(Score));
        }
        return Score.instance;
    }

    public virtual void AddScore(int amount)
    {
        this.SetScore(this.score + amount);
    }

    public virtual void AddLives(int amount)
    {
        this.SetLives(this.lives + amount);
    }

    public virtual void SetScore(int amount)
    {
        this.score = amount < 0 ? 0 : amount;
        this.Render();
    }

    public virtual void SetLevelScore(int amount)
    {
        this.levelScore = amount < 0 ? 0 : amount;
        this.Render();
    }

    public virtual void SetLives(int amount)
    {
        this.lives = amount < 0 ? 0 : amount;
        this.Render();
    }

    private void Render()
    {
        if (this.scoreText)
        {
            if ((this.score + this.levelScore) > 0)
            {
                this.scoreText.text = "Score: " + (this.score + this.levelScore);
            }
            else
            {
                this.scoreText.text = "";
            }
        }
        else
        {
            Metrics.LogException("Score: Render(): scoreText is null", true);
        }
    }

}