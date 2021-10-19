using UnityEngine;
using System.Collections;

[System.Serializable]
/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* dependencies */
/* globals */
 // 6 steps per second
/* scratchpad */
[UnityEngine.RequireComponent(typeof(AudioSource))]
 // between Enemy
 // between Enemy and his hands
// = false;
[UnityEngine.RequireComponent(typeof(AudioSource))]
public partial class Enemy : MonoBehaviour
{
    public ParticleSystem bloodSplatter;
    private static int MAX_HEALTH;
    private static int BOSS_MAX_HEALTH;
    private static int MINIBOSS_MAX_HEALTH;
    private static int GROAN_AUDIO_PRIORITY;
    private static int DIE_AUDIO_PRIORITY;
    private static float TIME_STEP;
    private static float SPEED;
    private bool isBoss;
    private bool isMiniBoss;
    private int currentHealth;
    private bool dead;
    private AudioSource groanAudio;
    private AudioSource dieAudio;
    private float nextMoveTime;
    public virtual void Start()
    {
        Physics.IgnoreLayerCollision(8, 8);
        Physics.IgnoreLayerCollision(8, 10);
        this.nextMoveTime = Time.time;
        if (this.bloodSplatter)
        {
            this.bloodSplatter.Stop();
        }
        Component[] audioSources = this.GetComponents(typeof(AudioSource));
        this.groanAudio = this.getPriorityAudio(audioSources, Enemy.GROAN_AUDIO_PRIORITY);
        this.dieAudio = this.getPriorityAudio(audioSources, Enemy.DIE_AUDIO_PRIORITY);
        this.StartCoroutine(this.Groan());
    }

    public virtual void FixedUpdate()
    {
        if (this.dead) // stop moving
        {
            if (this.groanAudio)
            {
                this.groanAudio.Stop();
            }
            return;
        }
        Vector3 path = new Vector3(this.transform.position.x, 0, this.transform.position.z);
        if (path.magnitude < 1)
        {
            this.dead = true; // I'm kinda like a bee, die after I sting, ya know?
            this.GetComponent<Rigidbody>().velocity = Vector3.zero;
            this.PlayerDied();
            return;
        }
        if (Time.time > this.nextMoveTime)
        {
            this.nextMoveTime = Time.time + Enemy.TIME_STEP;
            this.transform.position = this.transform.position - (Enemy.SPEED * path.normalized);
            this.transform.rotation = Quaternion.LookRotation(new Vector3(this.transform.position.x, 0, this.transform.position.z), new Vector3(0, 1, 0));
        }
    }

    public virtual void OnCollisionEnter(Collision collision)
    {
        if (!this.dead && collision.gameObject.CompareTag("Player"))
        {
            this.PlayerDied();
        }
    }

    private void PlayerDied()
    {
        // stop enemy movements
        // and show failed - retry? screen
        GameManager.Instance().LevelFailed();
        // prevent player gunfire
        Gun.Instance().GameOver(true);
    }

    public virtual void SetBossMode()
    {
        this.currentHealth = Enemy.BOSS_MAX_HEALTH;
        this.isBoss = true;
        this.isMiniBoss = false;
    }

    public virtual void SetMiniBossMode()
    {
        this.currentHealth = Enemy.MINIBOSS_MAX_HEALTH;
        this.isMiniBoss = true;
        this.isBoss = false;
    }

    /*
Array(damage, hit.point.x, hit.point.y, hit.point.z,
        direction.x, direction.y, direction.z)
*/
    public virtual IEnumerator OnBulletHit(object[] bulletInfo)
    {
        if (this.dead)
        {
            yield break;
        }
        if (--this.currentHealth <= 0)
        {
            this.dead = true;
            EnemySpawnManager.Instance().EnemyKilled(this.isMiniBoss, this.isBoss);
        }
        if (bulletInfo != null)
        {
            Vector3 point = new Vector3((float)bulletInfo[1], (float)bulletInfo[2], (float)bulletInfo[3]);
            if (this.currentHealth <= 0)
            {
                if (this.groanAudio)
                {
                    this.groanAudio.Stop();
                }
                Vector3 direction = new Vector3((float)bulletInfo[4], (float)bulletInfo[5], (float)bulletInfo[6]);
                this.GetComponent<Rigidbody>().AddForceAtPosition(200 * direction, point, ForceMode.Impulse);
                Vector3 enemyHead = this.transform.position + new Vector3(0, this.transform.lossyScale.y / 2, 0);
                if (this.isBoss) // the bossman must fall!
                {
                    this.GetComponent<Rigidbody>().AddForceAtPosition(1500 * direction, enemyHead, ForceMode.Impulse);
                }
                else
                {
                    if (this.isMiniBoss)
                    {
                        this.GetComponent<Rigidbody>().AddForceAtPosition(700 * direction, enemyHead, ForceMode.Impulse);
                    }
                }
                if (this.dieAudio)
                {
                    this.dieAudio.volume = 10;
                    this.dieAudio.Play();
                }
            }
            else
            {
                // show blood splatter out from impact
                if (this.bloodSplatter)
                {
                    this.bloodSplatter.transform.position = point;
                    this.bloodSplatter.Emit(1000);
                    yield return new WaitForSeconds(0.03f);
                    this.bloodSplatter.Stop();//emit = false;
                }
            }
        }
    }

    private AudioSource getPriorityAudio(Component[] audioSources, int priority)
    {
        int i = 0;
        while (i < audioSources.Length)
        {
            AudioSource source = audioSources[i] as AudioSource;
            if (source && (source.priority == priority))
            {
                return source;
            }
            i++;
        }
        return null;
    }

    private IEnumerator Groan()
    {
        yield return new WaitForSeconds(1.3f * Random.value);
        if (this.groanAudio)
        {
            this.groanAudio.Play();
        }
    }

    public Enemy()
    {
        this.currentHealth = Enemy.MAX_HEALTH;
    }

    static Enemy()
    {
        Enemy.MAX_HEALTH = 3;
        Enemy.BOSS_MAX_HEALTH = 40;
        Enemy.MINIBOSS_MAX_HEALTH = 20;
        Enemy.GROAN_AUDIO_PRIORITY = 3;
        Enemy.DIE_AUDIO_PRIORITY = 4;
        Enemy.TIME_STEP = 0.16f;
        Enemy.SPEED = 0.3f;
    }

}