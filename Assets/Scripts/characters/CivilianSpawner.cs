using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class CivilianSpawner : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* dependencies */
    public GameObject Civilian1;
    public GameObject Civilian2;
    public GameObject Civilian3;
    public GameObject Civilian4;
    /* globals */
    private static int COUNT;
    private static float SPAWN_INTERVAL; // seconds
    /* scratchpad */
    private float nextSpawnTime; // seconds
    public virtual void Update()
    {
        if (Time.time > this.nextSpawnTime)
        {
            this.nextSpawnTime = Time.time + Random.Range(CivilianSpawner.SPAWN_INTERVAL - 2, CivilianSpawner.SPAWN_INTERVAL + 2);
            this.Spawn();
        }
    }

    private void Spawn()
    {
        int moveDir;
        float x;
        int i = 0;
        while (i < CivilianSpawner.COUNT)
        {
            moveDir = 1;
            if (Random.value > 0.5f)
            {
                moveDir = -1;
            }
            x = 0;
            if (moveDir == 1)
            {
                x = Random.Range(27, 35);
            }
            else
            {
                x = Random.Range(-130, -165);
            }
            Vector3 pos = new Vector3(x, 2, Random.Range(-163, -219));
            GameObject civilian = UnityEngine.Object.Instantiate(this.GetCivilian(), pos, Quaternion.identity);
            civilian.SendMessage("SetMoveDir", moveDir);
            civilian.transform.parent = this.transform;
            i++;
        }
        i = 0;
        while (i < CivilianSpawner.COUNT)
        {
            moveDir = 1;
            if (Random.value > 0.5f)
            {
                moveDir = -1;
            }
            x = 0;
            if (moveDir == 1)
            {
                x = Random.Range(92, 120);
            }
            else
            {
                x = Random.Range(-110, -130);
            }
            var pos = new Vector3(x, 2, Random.Range(140, 167));
            var civilian = UnityEngine.Object.Instantiate(this.GetCivilian(), pos, Quaternion.identity);
            civilian.SendMessage("SetMoveDir", moveDir);
            civilian.transform.parent = this.transform;
            i++;
        }
    }

    private GameObject GetCivilian()
    {
        int i = Mathf.FloorToInt(Random.Range(0, 4));
        if (i == 0)
        {
            return this.Civilian1;
        }
        else
        {
            if (i == 1)
            {
                return this.Civilian2;
            }
            else
            {
                if (i == 2)
                {
                    return this.Civilian3;
                }
                else
                {
                    return this.Civilian4;
                }
            }
        }
    }

    public CivilianSpawner()
    {
        this.nextSpawnTime = -1;
    }

    static CivilianSpawner()
    {
        CivilianSpawner.COUNT = 10;
        CivilianSpawner.SPAWN_INTERVAL = 5;
    }

}