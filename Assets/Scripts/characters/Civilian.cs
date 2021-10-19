using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class Civilian : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* globals */
    private static float MOVE_SPEED;
    /* scratchpad */
    private int moveDir;
    private int origX;
    public virtual void Start()
    {
        this.origX = (int) this.transform.position.x;
    }

    public virtual void FixedUpdate()
    {
        this.transform.position = this.transform.position - new Vector3(Civilian.MOVE_SPEED * this.moveDir, 0, 0);
        if (Mathf.Abs(this.transform.position.x - this.origX) > 180)
        {
            UnityEngine.Object.Destroy(this.gameObject);
        }
    }

    public virtual void SetMoveDir(object dir)
    {
        this.moveDir = (int) dir;
    }

    public Civilian()
    {
        this.moveDir = -1;
        this.origX = -1;
    }

    static Civilian()
    {
        Civilian.MOVE_SPEED = 0.35f;
    }

}