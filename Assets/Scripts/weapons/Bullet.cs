using UnityEngine;
using System.Collections;

[System.Serializable]
public partial class Bullet : MonoBehaviour
{
    /**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */
    /* dependencies */
    public LayerMask layerMask;
    /* globals */
    private static float SPEED;
    private static float SECONDS_UNTIL_DESTROY;
    private static float BULLET_FORCE_MAGNITUDE;
    private static float SECONDS_UNTIL_VISIBLE;
    /* scratchpad */
    private Vector3 previousPosition;
    private float minimumExtent;
    private float sqrMinimumExtent;
    private MeshRenderer meshRenderer;
    private float startTime;
    public virtual void Start()
    {
        this.startTime = Time.time;
        this.meshRenderer = (MeshRenderer) this.GetComponent(typeof(MeshRenderer));
        this.meshRenderer.enabled = false;
        EnemySpawnManager.Instance().BulletShot();
    }

    public virtual void Awake()
    {
        this.previousPosition = this.gameObject.transform.position;
        this.minimumExtent = Mathf.Min(Mathf.Min(this.GetComponent<Collider>().bounds.extents.x, this.GetComponent<Collider>().bounds.extents.y), this.GetComponent<Collider>().bounds.extents.z);
        this.sqrMinimumExtent = this.minimumExtent * this.minimumExtent;
    }

    public virtual void FixedUpdate()
    {
        RaycastHit hitInfo = default(RaycastHit);
        // Show bullet if visible
        if (!this.meshRenderer.enabled && ((Time.time - this.startTime) >= Bullet.SECONDS_UNTIL_VISIBLE))
        {
            this.meshRenderer.enabled = true;
        }
        // Move forward
        this.gameObject.transform.position = this.gameObject.transform.position + (Bullet.SPEED * this.gameObject.transform.forward);
        Vector3 movementThisStep = this.gameObject.transform.position - this.previousPosition;
        float movementSqrMagnitude = movementThisStep.sqrMagnitude;
        if (movementSqrMagnitude > this.sqrMinimumExtent)
        {
            float movementMagnitude = movementThisStep.magnitude;
            if (Physics.Raycast(this.previousPosition, movementThisStep, out hitInfo, movementMagnitude, this.layerMask.value))
            {
                this.OnBulletHit(hitInfo, movementThisStep.normalized);
            }
        }
        this.previousPosition = this.gameObject.transform.position;
        // Destroy bullet if expired
        if ((Time.time - this.startTime) >= Bullet.SECONDS_UNTIL_DESTROY)
        {
            UnityEngine.Object.Destroy(this.gameObject);
        }
    }

    public virtual void OnBulletHit(RaycastHit hit, Vector3 direction)
    {
        // Destroy the bullet
        if (this.gameObject)
        {
            UnityEngine.Object.Destroy(this.gameObject);
        }
        // Destroy the enemy and update score
        if ((((hit.collider != null)) && (hit.collider.gameObject != null)) && hit.collider.gameObject.CompareTag("Enemy"))
        {
            Enemy enemy = (Enemy) hit.collider.gameObject.GetComponent(typeof(Enemy));
            this.StartCoroutine(enemy.OnBulletHit(new object[] {1, hit.point.x, hit.point.y, hit.point.z, direction.x, direction.y, direction.z}));
            //		hit.collider.gameObject.SendMessage("OnBulletHit", Array(1, hit.point.x, hit.point.y, hit.point.z,
            //																	direction.x, direction.y, direction.z));
            hit.rigidbody.AddForceAtPosition(Bullet.BULLET_FORCE_MAGNITUDE * direction, hit.point, ForceMode.Impulse);
        }
    }

    static Bullet()
    {
        Bullet.SPEED = 3;
        Bullet.SECONDS_UNTIL_DESTROY = 4;
        Bullet.BULLET_FORCE_MAGNITUDE = 120;
        Bullet.SECONDS_UNTIL_VISIBLE = 0.005f;
    }

}