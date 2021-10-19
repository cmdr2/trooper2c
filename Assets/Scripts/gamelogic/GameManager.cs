using UnityEngine;
using System.Collections;

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* dependencies */
/* globals */
 // meters
 // seconds
 // equal to enemy hitpoints
/* scratchpad */
public enum GameState
{
    SPLASH_SCREEN = 0,
    IN_LEVEL = 1,
    FAILED_LEVEL = 2,
    FAILED_GAME = 3,
    WON_LEVEL = 4,
    WON_GAME = 5
}

[System.Serializable]
public partial class GameManager : MonoBehaviour
{
    private static GameManager instance;
    public GameObject gameoverMysticalParticles;
    public GameObject LookBehindMessage;
    public GameObject endgameBloodSplatter;
    public GameObject introScreen;
    public GameObject victoryScreen;
    public GameObject sightline;
    private static float MESSAGE_DISTANCE;
    private static float HEALTH_CHECK_INTERVAL;
    private static int MAX_LIVES;
    private static float INITIAL_SCORE_PER_ENEMY;
    private int lives;
    private int level;
    public GameState gameState;
    private float nextHealthCheckTime;
    private GameObject cam;
    private GameObject introScreen2;
    private GameObject victoryScreen2;
    public virtual void Start()
    {
        GameManager.instance = this;
        Screen.sleepTimeout = SleepTimeout.NeverSleep;
        Metrics.LogScreen("Splash");
        this.cam = GameObject.Find("Main Camera Right");
        this.CreateDuplicateIntroScreen();
    }

    public static GameManager Instance()
    {
        if (GameManager.instance == null)
        {
            GameManager.instance = (GameManager) UnityEngine.Object.FindObjectOfType(typeof(GameManager));
        }
        return GameManager.instance;
    }

    public virtual void Update()
    {
        /* healthcheck stuff */
        if (Time.time >= this.nextHealthCheckTime)
        {
            Metrics.LogEvent("Application", "HealthCheckPing");
            this.nextHealthCheckTime = Time.time + GameManager.HEALTH_CHECK_INTERVAL;
        }
        bool triggered = Cardboard.SDK.CardboardTriggered || Input.GetButtonDown("Fire1");
        if (triggered && (this.gameState == GameState.SPLASH_SCREEN))
        {
            this.StartGame();
        }
        else
        {
            if (triggered && (((this.gameState == GameState.FAILED_LEVEL) || (this.gameState == GameState.FAILED_GAME)) || (this.gameState == GameState.WON_GAME)))
            {
                this.RestartGame();
            }
        }
    }

    private void StartGame()
    {
        this.gameState = GameState.IN_LEVEL;
        this.sightline.SetActive(true);
        this.introScreen.SetActive(false);
        if (this.introScreen2)
        {
            this.introScreen2.SetActive(false);
        }
        // enable score, bonus and level
        Score.Instance().gameObject.SetActive(true);
        BonusMessage.Instance().gameObject.SetActive(true);
        Prompt.Instance().gameObject.SetActive(true);
        this.StartCoroutine(this.NextWave());
        Score.Instance().SetLives(this.lives);
    }

    private void RestartGame()
    {
        this.gameState = GameState.IN_LEVEL;
        this.sightline.SetActive(true);
        this.victoryScreen.SetActive(false);
        if (this.victoryScreen2)
        {
            this.victoryScreen2.SetActive(false);
        }
        this.endgameBloodSplatter.SetActive(false);
        Prompt.Instance().Hide();
        Gun.Instance().GameOver(false);
        if (this.lives <= 0)
        {
            this.lives = GameManager.MAX_LIVES;
            this.level = this.level > 3 ? this.level - 3 : 0; // 2 level penalty
            Score.Instance().SetLevelScore(0);
            Score.Instance().SetScore(0);
            Score.Instance().SetLives(this.lives);
            Metrics.LogEvent("Business", "CustomerInitiatedReplay");
            Metrics.LogEvent("Replay", "Replay Game");
        }
        else
        {
            this.level--; // back to old level, since we incremented in NewWave()
            Score.Instance().SetLevelScore(0);
            Score.Instance().AddScore(EnemySpawnManager.Instance().levelScore);
            Metrics.LogEvent("Business", "CustomerInitiatedReplay");
            Metrics.LogEvent("Replay", "Replay Level " + (this.level + 1));
        }
        this.StartCoroutine(this.NextWave());
    }

    public virtual IEnumerator LevelComplete(int enemiesKilledThisWave, int enemiesSpawnedThisWave, int enemyCountThisWave, int bulletsShotThisWave)
    {
        this.ApplyBonus(enemiesKilledThisWave, enemiesSpawnedThisWave, enemyCountThisWave, bulletsShotThisWave);
        Score.Instance().AddScore(EnemySpawnManager.Instance().levelScore);
        Score.Instance().SetLevelScore(0);
        if (this.level >= 14) // won the game
        {
            this.gameState = GameState.WON_GAME;
            this.sightline.SetActive(false);
            this.lives = 0;
            // hide bonus screen
            BonusMessage.Instance().Hide();
            // show victory screen
            this.victoryScreen.SetActive(true);
            this.CreateDuplicateVictoryScreen();
            // analytics
            Metrics.LogScreen("Victory");
        }
        else
        {
            // maybe play some music
            this.gameState = GameState.WON_LEVEL;
            this.sightline.SetActive(true);
            yield return new WaitForSeconds(3);
            this.StartCoroutine(this.NextWave());
        }
    }

    public virtual void LevelFailed()
    {
        if ((this.gameState != GameState.FAILED_LEVEL) && (this.gameState != GameState.FAILED_GAME))
        {
            this.gameState = GameState.FAILED_LEVEL;
            this.sightline.SetActive(false);
            this.lives--;
            Score.Instance().AddLives(-1);
            if (this.lives > 0)
            {
                this.gameState = GameState.FAILED_LEVEL;
                Prompt.Instance().ShowRoundOver(false);
                this.endgameBloodSplatter.SetActive(true);
                this.GetComponent<AudioSource>().Play();
                Metrics.LogScreen("Failed Level " + this.level);
            }
            else
            {
                this.gameState = GameState.FAILED_GAME;
                Prompt.Instance().ShowRoundOver(true);
                this.endgameBloodSplatter.SetActive(true);
                this.GetComponent<AudioSource>().Play();
                if (this.gameoverMysticalParticles)
                {
                    this.gameoverMysticalParticles.SetActive(true);
                }
                Metrics.LogScreen("Game Over");
            }
            EnemySpawnManager.Instance().DestroyAllEnemies();
        }
    }

    private IEnumerator NextWave()
    {
        this.level++;
        BonusMessage.Instance().Hide();
        this.gameoverMysticalParticles.SetActive(false);
        Prompt.Instance().ShowCountdown(new object[] {15 - this.level, 3});
        yield return new WaitForSeconds(1);
        Prompt.Instance().ShowCountdown(new object[] {15 - this.level, 2});
        yield return new WaitForSeconds(1);
        Prompt.Instance().ShowCountdown(new object[] {15 - this.level, 1});
        yield return new WaitForSeconds(1);
        Prompt.Instance().Hide();
        this.gameState = GameState.IN_LEVEL;
        EnemySpawnManager.Instance().SpawnWave(this.level); // here be new munsters!
        Metrics.LogScreen("Level " + this.level);
        if (this.level == 1)
        {
            this.LookBehindMessage.SetActive(true);
            this.StartCoroutine(this.HideLookBehindAfterTimeout());
        }
    }

    private void ApplyBonus(int enemiesKilledThisWave, int enemiesSpawnedThisWave, int enemyCountThisWave, int bulletsShotThisWave)
    {
        int skillBonus = 0;
        int difficultyBonus = 0;
        difficultyBonus = (int) ((enemyCountThisWave * GameManager.INITIAL_SCORE_PER_ENEMY) + LevelInfo.GetMagicDifficultyBonus(this.level));
        if ((enemiesKilledThisWave > 0) && (bulletsShotThisWave > 0))
        {
            skillBonus = (int) Mathf.Round(Mathf.Pow(((enemiesKilledThisWave * 1f) / bulletsShotThisWave) * Mathf.Sqrt(difficultyBonus), 2) * 100);
        }
        Score.Instance().AddScore(skillBonus);
        Score.Instance().AddScore(difficultyBonus);
        BonusMessage.Instance().Show(new object[] {skillBonus, difficultyBonus});
    }

    private void CreateDuplicateIntroScreen() // behind player
    {
        if (this.cam)
        {
            Ray ray = new Ray(this.cam.transform.position, this.cam.transform.forward);
            this.introScreen.transform.position = ray.GetPoint(GameManager.MESSAGE_DISTANCE);
            this.introScreen.transform.LookAt(this.cam.transform.position);
            this.introScreen.transform.RotateAround(this.introScreen.transform.position, this.introScreen.transform.up, 180);
            this.introScreen2 = UnityEngine.Object.Instantiate(this.introScreen);
            Ray ray2 = new Ray(this.cam.transform.position, -this.cam.transform.forward);
            this.introScreen2.transform.position = ray2.GetPoint(GameManager.MESSAGE_DISTANCE);
            this.introScreen2.transform.LookAt(this.cam.transform.position);
            this.introScreen2.transform.RotateAround(this.introScreen2.transform.position, this.introScreen2.transform.up, 180);
        }
    }

    private void CreateDuplicateVictoryScreen() // behind player
    {
        if (this.cam)
        {
            Ray ray = new Ray(this.cam.transform.position, this.cam.transform.forward);
            this.victoryScreen.transform.position = ray.GetPoint(GameManager.MESSAGE_DISTANCE);
            this.victoryScreen.transform.LookAt(this.cam.transform.position);
            this.victoryScreen.transform.RotateAround(this.victoryScreen.transform.position, this.victoryScreen.transform.up, 180);
            this.victoryScreen2 = UnityEngine.Object.Instantiate(this.victoryScreen);
            Ray ray2 = new Ray(this.cam.transform.position, -this.cam.transform.forward);
            this.victoryScreen2.transform.position = ray2.GetPoint(GameManager.MESSAGE_DISTANCE);
            this.victoryScreen2.transform.LookAt(this.cam.transform.position);
            this.victoryScreen2.transform.RotateAround(this.victoryScreen2.transform.position, this.victoryScreen2.transform.up, 180);
        }
    }

    private IEnumerator HideLookBehindAfterTimeout()
    {
        yield return new WaitForSeconds(2);
        this.LookBehindMessage.SetActive(false);
    }

    public GameManager()
    {
        this.lives = GameManager.MAX_LIVES;
        this.gameState = GameState.SPLASH_SCREEN;
        this.nextHealthCheckTime = -1;
    }

    static GameManager()
    {
        GameManager.MESSAGE_DISTANCE = 4.5f;
        GameManager.HEALTH_CHECK_INTERVAL = 5;
        GameManager.MAX_LIVES = 3;
        GameManager.INITIAL_SCORE_PER_ENEMY = 6;
    }

}