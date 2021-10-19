using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class Spaceship : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* globals */
    private static float MOVE_SPEED;
    private static int Z_TRANSLATE;
    private static int X_TRANSLATE;
    /* scratchpad */
    private int mode;
    public virtual void Start()
    {
        this.Reset();
    }

    public virtual void FixedUpdate()
    {
        if (this.mode == Spaceship.Z_TRANSLATE)
        {
            this.transform.position = this.transform.position - new Vector3(0, 0, Spaceship.MOVE_SPEED);
            if (this.transform.position.z < -1600)
            {
                this.Reset();
            }
        }
        else
        {
            this.transform.position = this.transform.position - new Vector3(Spaceship.MOVE_SPEED, 0, 0);
            if (this.transform.position.x < -1600)
            {
                this.Reset();
            }
        }
    }

    private void Reset()
    {
        float d = Random.Range(-150, 150);
        if (Random.value > 0.5f)
        {
            this.mode = Spaceship.X_TRANSLATE;
            this.transform.position = new Vector3(800, Random.Range(100, 800), d);
        }
        else
        {
            this.mode = Spaceship.Z_TRANSLATE;
            this.transform.position = new Vector3(d, Random.Range(100, 800), 800);
        }
    }

    public Spaceship()
    {
        this.mode = Spaceship.Z_TRANSLATE;
    }

    static Spaceship()
    {
        Spaceship.MOVE_SPEED = 4;
        Spaceship.X_TRANSLATE = 1;
    }

}