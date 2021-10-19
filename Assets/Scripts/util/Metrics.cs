using System.IO;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class Metrics : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* globals */
    private static string PLAYER_FILE;
    /* scratchpad */
    private static GoogleAnalyticsV3 googleAnalytics;
    private static string sessionId;
    private static string userId;
    public virtual void Start()
    {
        Metrics.googleAnalytics = (GoogleAnalyticsV3) this.GetComponent(typeof(GoogleAnalyticsV3));
        Metrics.googleAnalytics.StartSession();
        Metrics.PLAYER_FILE = (Application.persistentDataPath + Path.DirectorySeparatorChar) + "Player";
        Metrics.sessionId = this.guid();
        if (File.Exists(Metrics.PLAYER_FILE))
        {
            StreamReader sr = new StreamReader(Metrics.PLAYER_FILE);
            Metrics.userId = sr.ReadLine();
            if (Metrics.googleAnalytics)
            {
                Metrics.LogEvent("Application", "ReturnUser");
            }
        }
        if (Metrics.userId.Trim().Equals(""))
        {
            Metrics.userId = "U" + this.guid();
            StreamWriter sw = new StreamWriter(Metrics.PLAYER_FILE);
            sw.Write(Metrics.userId);
            sw.Close();
        }
        System.TimeSpan t = System.DateTime.UtcNow - new System.DateTime(1970, 1, 1);
        int secondsSinceEpoch = (int) t.TotalSeconds;
        if (Metrics.googleAnalytics)
        {
            Metrics.googleAnalytics.LogEvent(new EventHitBuilder().SetEventCategory("UserSessions").SetEventAction(Metrics.userId).SetEventValue(1));
            Metrics.googleAnalytics.LogEvent(new EventHitBuilder().SetEventCategory("Sessions").SetEventAction((((((secondsSinceEpoch + ":") + Metrics.googleAnalytics.bundleVersion) + ":") + Metrics.userId) + ":") + Metrics.sessionId));
            Metrics.LogEvent("Application", "Platform-" + Application.platform);
        }
    }

    /* utilities */
    private string s4()
    {
        return Mathf.Floor((1 + Random.value) * 65536).ToString().Substring(1);
    }

    private string guid()
    {
        return ((((this.s4() + this.s4()) + "-") + this.s4()) + "-") + this.s4();
    }

    public static void LogScreen(object screenName)
    {
        if (Metrics.googleAnalytics)
        {
            Metrics.googleAnalytics.LogScreen(screenName + "");
            Metrics.googleAnalytics.LogScreen((screenName + ":") + Metrics.sessionId);
        }
    }

    public static void LogEvent(object category, object action)
    {
        if (Metrics.googleAnalytics)
        {
            Metrics.googleAnalytics.LogEvent(new EventHitBuilder().SetEventCategory((string) category).SetEventAction((string) action));
            Metrics.googleAnalytics.LogEvent(new EventHitBuilder().SetEventCategory((category + ":") + Metrics.sessionId).SetEventAction((string) action));
        }
    }

    public static void LogException(object message, bool fatal)
    {
        if (Metrics.googleAnalytics)
        {
            Metrics.googleAnalytics.LogException((string) message, fatal);
            Metrics.googleAnalytics.LogException((message + ":") + Metrics.sessionId, fatal);
        }
    }

    static Metrics()
    {
        Metrics.PLAYER_FILE = "Player";
        Metrics.sessionId = "";
        Metrics.userId = "";
    }

}