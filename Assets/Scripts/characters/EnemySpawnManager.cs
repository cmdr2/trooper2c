using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[System.Serializable]
public partial class EnemySpawnManager : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    private static EnemySpawnManager instance;
    /* dependencies */
    public GameObject Enemy;
    public GameObject BossEnemy;
    public GameObject MiniBossEnemy;
    public GameObject MegaBossEnemy;
    /* globals */
    private static int SPAWN_MONITOR_INTERVAL; // seconds
    private static float MEGAKILL_INTERVAL; // seconds
    private static int ENEMY_KILL_SCORE;
    private static int BOSS_KILL_SCORE;
    private static int MINIBOSS_KILL_SCORE;
    /* scratchpad */
    private List<GameObject> enemies = new List<GameObject>();
    private float enemiesSpawnedThisWave;
    private float enemiesKilledThisWave;
    private float bulletsShotThisWave;
    private int enemyCountThisWave;
    private int megaKillCurrCount;
    private float lastKillTime;
    private int nextSpawnMonitorTime;
    public int levelScore;
    private int isSpawning;
    public static EnemySpawnManager Instance()
    {
        if (EnemySpawnManager.instance == null)
        {
            EnemySpawnManager.instance = (EnemySpawnManager) UnityEngine.Object.FindObjectOfType(typeof(EnemySpawnManager));
        }
        return EnemySpawnManager.instance;
    }

    public virtual void FixedUpdate()
    {
        if (Time.time > this.nextSpawnMonitorTime)
        {
            this.nextSpawnMonitorTime = (int) (Time.time + EnemySpawnManager.SPAWN_MONITOR_INTERVAL);
            if (this.enemiesKilledThisWave >= this.enemiesSpawnedThisWave)
            {
                int t = (int) this.enemiesKilledThisWave;
                this.enemiesKilledThisWave = 0;
                this.StartCoroutine(GameManager.Instance().LevelComplete(t, (int) this.enemiesSpawnedThisWave, this.enemyCountThisWave, (int) this.bulletsShotThisWave));
            }
        }
    }

    public virtual void SpawnWave(int level)
    {
        int enemyCount = LevelInfo.GetSpawnCount(level);
        float[] spawnRadius = LevelInfo.GetSpawnRadius(level);
        this.enemyCountThisWave = enemyCount;
        this.enemiesSpawnedThisWave = enemyCount;
        this.enemiesKilledThisWave = 0;
        this.bulletsShotThisWave = 0;
        MonoBehaviour.print((("Spawning.. " + enemyCount) + ", ") + Time.time);
        this.DestroyAllEnemies();
        if (this.Enemy)
        {
            int i = 1;
            while (i <= enemyCount)
            {
                float radius = Random.Range(spawnRadius[0], spawnRadius[1]);
                int sector = UnityScript.Lang.UnityBuiltins.parseInt((i * 4) / enemyCount) + 1;
                float angle = Random.Range(((sector - 1) * Mathf.PI) / 2, (sector * Mathf.PI) / 2);
                Vector3 position = new Vector3(radius * Mathf.Cos(angle), 1.3f, radius * Mathf.Sin(angle));
                Quaternion rotation = Quaternion.identity;
                GameObject enemy = UnityEngine.Object.Instantiate(this.Enemy, position, rotation);
                if (enemy)
                {
                    if (this.enemies != null)
                    {
                        this.enemies.Add(enemy);
                    }
                    else
                    {
                        Metrics.LogException("SpawnManager: NewWave(): enemies is null [1]", true);
                    }
                }
                else
                {
                    Metrics.LogException("SpawnManager: NewWave(): Enemy instantiated is null", true);
                }
                i++;
            }
        }
        // spawn boss at farthest point in level 7
        if (this.BossEnemy && (level == 7))
        {
            float bossAngle = Random.Range(0, 2 * Mathf.PI);
            Vector3 bossPosition = new Vector3(spawnRadius[1] * Mathf.Cos(bossAngle), 10.3f, spawnRadius[1] * Mathf.Sin(bossAngle));
            GameObject boss = UnityEngine.Object.Instantiate(this.BossEnemy, bossPosition, Quaternion.identity);
            if (boss)
            {
                boss.SendMessage("SetBossMode");
            }
            else
            {
                Metrics.LogException("SpawnManager: NewWave(): boss is null", true);
            }
            this.enemiesSpawnedThisWave++;
            if (this.enemies != null)
            {
                this.enemies.Add(boss);
            }
        }
        // spawn megaboss at farthest point in level 14
        if (this.MegaBossEnemy && (level == 14))
        {
            float megabossAngle = Random.Range(0, 2 * Mathf.PI);
            Vector3 megabossPosition = new Vector3(spawnRadius[1] * Mathf.Cos(megabossAngle), 11, spawnRadius[1] * Mathf.Sin(megabossAngle));
            GameObject megaboss = UnityEngine.Object.Instantiate(this.MegaBossEnemy, megabossPosition, Quaternion.identity);
            if (megaboss)
            {
                megaboss.SendMessage("SetBossMode");
            }
            else
            {
                Metrics.LogException("SpawnManager: NewWave(): boss is null", true);
            }
            this.enemiesSpawnedThisWave++;
            if (this.enemies != null)
            {
                this.enemies.Add(megaboss);
            }
        }
        // spawn boss at farthest point in level 4
        if (this.MiniBossEnemy && ((level == 4) || (level == 10)))
        {
            float minibossAngle = Random.Range(0, 2 * Mathf.PI);
            Vector3 minibossPosition = new Vector3(spawnRadius[1] * Mathf.Cos(minibossAngle), 0.1f, spawnRadius[1] * Mathf.Sin(minibossAngle));
            GameObject miniboss = UnityEngine.Object.Instantiate(this.MiniBossEnemy, minibossPosition, Quaternion.identity);
            if (miniboss)
            {
                miniboss.SendMessage("SetMiniBossMode");
            }
            else
            {
                Metrics.LogException("SpawnManager: NewWave(): miniboss is null", true);
            }
            this.enemiesSpawnedThisWave++;
            if (this.enemies != null)
            {
                this.enemies.Add(miniboss);
            }
        }
        this.SetLevelScore(0);
    }

    private void SetLevelScore(int score)
    {
        this.levelScore = score < 0 ? 0 : score;
        Score.Instance().SetLevelScore(this.levelScore);
    }

    public virtual void DestroyAllEnemies()
    {
        if (this.enemies != null)
        {
            foreach (GameObject enemy in this.enemies)
            {
                UnityEngine.Object.Destroy(enemy);
            }
        }
        this.enemies.Clear();
    }

    public virtual void EnemyKilled(bool isMiniBoss, bool isBoss)
    {
        //MonoBehaviour.print(this.enemies.Length);
        this.enemiesKilledThisWave++;
        if (isBoss)
        {
            this.SetLevelScore(this.levelScore + EnemySpawnManager.BOSS_KILL_SCORE);
            Metrics.LogEvent("Achievement", "Killed Boss");
        }
        else
        {
            if (isMiniBoss)
            {
                this.SetLevelScore(this.levelScore + EnemySpawnManager.MINIBOSS_KILL_SCORE);
                Metrics.LogEvent("Achievement", "Killed Mini Boss");
            }
            else
            {
                this.SetLevelScore(this.levelScore + EnemySpawnManager.ENEMY_KILL_SCORE);
            }
        }
        this.megaKillCurrCount = Time.time <= (this.lastKillTime + EnemySpawnManager.MEGAKILL_INTERVAL) ? this.megaKillCurrCount + 1 : 0;
        this.lastKillTime = Time.time;
        if (this.megaKillCurrCount > 0)
        {
            this.StartCoroutine(Prompt.Instance().ShowMegaKill(this.megaKillCurrCount));
            switch (this.megaKillCurrCount)
            {
                case 1:
                    Metrics.LogEvent("Achievement", "Double Kill");
                    break;
                case 2:
                    Metrics.LogEvent("Achievement", "Triple Kill");
                    break;
                default:
                    Metrics.LogEvent("Achievement", "Mega Kill");
                    break;
            }
        }
    }

    public virtual void BulletShot()
    {
        this.bulletsShotThisWave++;
    }

    public EnemySpawnManager()
    {
        this.enemies.Clear();
        this.enemiesSpawnedThisWave = 10;
    }

    static EnemySpawnManager()
    {
        EnemySpawnManager.SPAWN_MONITOR_INTERVAL = 1;
        EnemySpawnManager.MEGAKILL_INTERVAL = 0.25f;
        EnemySpawnManager.ENEMY_KILL_SCORE = 12;
        EnemySpawnManager.BOSS_KILL_SCORE = 150;
        EnemySpawnManager.MINIBOSS_KILL_SCORE = 50;
    }

}