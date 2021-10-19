using UnityEngine;
using System.Collections;

[System.Serializable]
/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* dependencies */
/* globals */
 // seconds
 // meters
/* scratchpad */
[UnityEngine.RequireComponent(typeof(AudioSource))]
public partial class Gun : MonoBehaviour
{
    private static Gun instance;
    public GameObject Bullet;
    public ParticleSystem muzzleFlash;
    public GameObject light1;
    public GameObject light2;
    public GameObject light3;
    private float FIRE_RATE;
    private float MIN_FIRE_SOUND_DURATION;
    private float SIGHTLINE_DISTANCE;
    private bool gameOver;
    private float nextFire;
    private float fireSoundDuration;
    private float fireSoundStartTime;
    private float muzzleTimer;
    private float muzzleCooler;
    private int bulletQueueCount;
    private bool isFiring;
    public virtual void Awake()
    {
        this.MuzzleFlash(false);
    }

    public static Gun Instance()
    {
        if (Gun.instance == null)
        {
            Gun.instance = (Gun) UnityEngine.Object.FindObjectOfType(typeof(Gun));
        }
        return Gun.instance;
    }

    public virtual void Update()
    {
        if (this.gameOver)
        {
            if (this.GetComponent<AudioSource>())
            {
                if (this.GetComponent<AudioSource>().isPlaying)
                {
                    this.GetComponent<AudioSource>().Stop();
                }
            }
        }
        else
        {
            bool triggered = Cardboard.SDK.CardboardTriggered || Input.GetButton("Fire1");
            if ((((GameManager.Instance().gameState == GameState.IN_LEVEL) && triggered) && (Time.time > this.nextFire)) && (Time.time > this.fireSoundDuration))
            {
                this.nextFire = Time.time + (this.FIRE_RATE * 0.3f);
                this.StartCoroutine(this.Fire());
            }
            if (Input.GetButtonUp("Fire1"))
            {
                this.bulletQueueCount = 3;
            }
        }
    }

    private void MuzzleFlash(bool on)
    {
        if (on)
        {
            if (this.muzzleFlash)
            {
                this.muzzleFlash.Emit(100);
            }
        }
        else
        {
            if (this.muzzleFlash)
            {
                this.muzzleFlash.Stop();// = false;
            }
        }
        if (this.light1)
        {
            this.light1.SetActive(on);
        }
        if (this.light2)
        {
            this.light2.SetActive(on);
        }
        if (this.light3)
        {
            this.light3.SetActive(on);
        }
    }

    private IEnumerator Fire()
    {
        if (this.isFiring)
        {
            this.bulletQueueCount = this.bulletQueueCount + 3;
        }
        else
        {
            this.isFiring = true;
            if (this.GetComponent<AudioSource>())
            {
                this.GetComponent<AudioSource>().Play();
            }
            this.bulletQueueCount = 9;
            while (this.bulletQueueCount > 0)
            {
                if (this.gameOver)
                {
                    this.bulletQueueCount = 0;
                    break;
                }
                this.bulletQueueCount--;
                this.MuzzleFlash(true);
                UnityEngine.Object.Instantiate(this.Bullet, this.transform.position, this.transform.rotation);
                yield return new WaitForSeconds(0.03f);
                this.MuzzleFlash(false);
                yield return new WaitForSeconds(0.04f);
            }
            this.isFiring = false;
            if (this.GetComponent<AudioSource>())
            {
                this.GetComponent<AudioSource>().Stop();
            }
        }
    }

    private void StartGunSound()
    {
        //  if still playing previous single-fire "3 bullet" sound
        if ((Time.time - this.fireSoundStartTime) < this.fireSoundDuration)
        {
            this.fireSoundStartTime = Time.time;
        }
        else
        {
            this.fireSoundStartTime = Time.time;
            this.fireSoundDuration = this.MIN_FIRE_SOUND_DURATION;
            if (this.GetComponent<AudioSource>())
            {
                this.GetComponent<AudioSource>().Play();
            }
        }
    }

    private IEnumerator StopGunSound()
    {
        // play atleast 3 bullet sounds for single-fire
        float timeLeft = this.fireSoundDuration - (Time.time - this.fireSoundStartTime);
        while (timeLeft > 0)
        {
            yield return new WaitForSeconds(timeLeft);
            timeLeft = this.fireSoundDuration - (Time.time - this.fireSoundStartTime);
        }
        if (this.GetComponent<AudioSource>())
        {
            this.GetComponent<AudioSource>().Stop();
        }
    }

    public virtual void GameOver()
    {
        this.GameOver(true);
    }

    public virtual void GameOver(object over)
    {
        this.gameOver = (bool) over;
    }

    public Gun()
    {
        this.FIRE_RATE = 0.232f * 3;
        this.MIN_FIRE_SOUND_DURATION = 0.232f * 3;
        this.SIGHTLINE_DISTANCE = 30;
        this.fireSoundDuration = this.MIN_FIRE_SOUND_DURATION;
        this.muzzleCooler = 0.1f;
    }

}