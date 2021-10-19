using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class MetricsLevel : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* globals */
    private static string METRICS_LEVEL_URL;
    public static string VERBOSE;
    public static string NORMAL;
    /* scratchpad */
    public static string level;
    public virtual IEnumerator Start()
    {
        WWW www = new WWW(MetricsLevel.METRICS_LEVEL_URL);
        yield return www;
        if (www.text.CompareTo(MetricsLevel.VERBOSE) == 0)
        {
            MetricsLevel.level = MetricsLevel.VERBOSE;
        }
        else
        {
            if (www.text.CompareTo(MetricsLevel.NORMAL) == 0)
            {
                MetricsLevel.level = MetricsLevel.NORMAL;
            }
        }
    }

    static MetricsLevel()
    {
        MetricsLevel.METRICS_LEVEL_URL = "http://me.cmdr2.org/Trooper-2c/metrics_level";
        MetricsLevel.VERBOSE = "verbose";
        MetricsLevel.NORMAL = "normal";
        MetricsLevel.level = MetricsLevel.NORMAL;
    }

}