using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class LevelInfo : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    private static object[] levelInfo;
    public static int GetSpawnCount(int levelNumber)
    {
        object[] l = (object[]) LevelInfo.levelInfo[levelNumber - 1];
        return (int)l[0];
    }

    public static float[] GetSpawnRadius(int levelNumber)
    {
        object[] l = (object[]) LevelInfo.levelInfo[levelNumber - 1];
        return (float[])l[1];
    }

    public static int GetMagicDifficultyBonus(int levelNumber)
    {
        object[] l = (object[]) LevelInfo.levelInfo[levelNumber - 1];
        return (int)l[2];
    }

    static LevelInfo()
    {
        LevelInfo.levelInfo = new object[] {
            new object[] { 3, new float[] { 24, 30 }, 0 },
            new object[] { 5, new float[] { 24, 30 }, 20 },
            new object[] { 7, new float[] { 24, 30 }, 30 },
            new object[] { 7, new float[] { 24, 34 }, 80 },
            new object[] { 11, new float[] { 24, 31 }, 110 },
            new object[] { 13, new float[] { 25, 31 }, 205 },
            new object[] { 14, new float[] { 25, 35 }, 300 },
            new object[] { 9, new float[] { 20, 26 }, 0 },
            new object[] { 15, new float[] { 20, 26 }, 40 },
            new object[] { 18, new float[] { 21, 28 }, 60 },
            new object[] { 20, new float[] { 19, 32 }, 160 },
            new object[] { 22, new float[] { 18, 38 }, 220 },
            new object[] { 24, new float[] { 17, 40 }, 410 },
            new object[] { 28, new float[] { 20, 46 }, 600 }
        };
    }

}