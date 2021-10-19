using UnityEngine;
using System.Collections;

[System.Serializable]
/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
/* dependencies */
/* globals */
/* scratchpad */
 // FPS accumulated over the interval
 // Frames drawn over the interval
 // Left time for current interval
 // keyed off timeCounter
[UnityEngine.RequireComponent(typeof(UnityEngine.UI.Text))]
public partial class FPSCounter : MonoBehaviour
{
    public UnityEngine.UI.Text fpsCounter;
    private static float updateInterval;
    private bool showFPS;
    private float accum;
    private int frames;
    private float timeleft;
    //private Hashtable badFrames;
    public virtual void Start()
    {
        this.fpsCounter = (UnityEngine.UI.Text) this.GetComponent(typeof(UnityEngine.UI.Text));
        this.timeleft = FPSCounter.updateInterval;
    }

    public virtual void Update()
    {
        if (Input.GetKeyDown(KeyCode.F))
        {
            this.showFPS = !this.showFPS;
        }
        this.timeleft = this.timeleft - Time.deltaTime;
        this.accum = this.accum + (Time.timeScale / Time.deltaTime);
        ++this.frames;
        // Interval ended - update GUI text and start new interval
        if (this.timeleft <= 0f)
        {
            float fps = this.accum / this.frames;
            int tc = Mathf.FloorToInt(Time.time);
            /*if (fps < 57)
            {
                if (this.badFrames.ContainsKey(tc))
                {
                    object[] x = (object[]) this.badFrames[tc];
                    x.Push(fps.ToString("f1"));
                    this.badFrames[tc] = x;
                }
                else
                {
                    x = new object[0];
                    x[0] = fps.ToString("f1");
                    this.badFrames[tc] = x;
                }
            }
            if (((tc != 0) && ((tc % 30) == 0)) && (MetricsLevel.level.CompareTo(MetricsLevel.VERBOSE) == 0))
            {
                Metrics.LogEvent("Application", (("BadFrames@" + tc) + ":") + this.getBadFrames());
            }*/
            if (this.fpsCounter && this.showFPS)
            {
                this.fpsCounter.text = fps.ToString("f1") + " fps";
            }
            this.timeleft = FPSCounter.updateInterval;
            this.accum = 0f;
            this.frames = 0;
        }
        if (!this.showFPS)
        {
            this.fpsCounter.text = "";
        }
    }

    /*private string getBadFrames()
    {
        string fData = "{";
        int i = 0;
        while (i < 600)
        {
            if (this.badFrames.ContainsKey(i))
            {
                fData = fData + (((i + ": \"") + this.badFrames[i]) + "\",");
            }
            i++;
        }
        fData = fData + "}";
        return fData;
    }*/

    public FPSCounter()
    {
        //this.badFrames = new Hashtable();
    }

    static FPSCounter()
    {
        FPSCounter.updateInterval = 0.5f;
    }

}