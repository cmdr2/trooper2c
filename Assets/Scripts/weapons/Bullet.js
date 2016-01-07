#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

/* dependencies */
public var layerMask : LayerMask;


/* globals */
private static var SPEED : float = 3;
private static var SECONDS_UNTIL_DESTROY : float = 4;
private static var BULLET_FORCE_MAGNITUDE : float = 120;
private static var SECONDS_UNTIL_VISIBLE : float = 0.005;


/* scratchpad */
private var previousPosition : Vector3;
private var minimumExtent : float;
private var sqrMinimumExtent : float;
private var meshRenderer : MeshRenderer;
private var startTime : float;


function Start () {
	startTime = Time.time;
	
	meshRenderer = GetComponent(MeshRenderer);
	meshRenderer.enabled = false;
	
	EnemySpawnManager.Instance().BulletShot();
}


function Awake () {
	previousPosition = this.gameObject.transform.position;
	minimumExtent = Mathf.Min(
							Mathf.Min(GetComponent.<Collider>().bounds.extents.x, GetComponent.<Collider>().bounds.extents.y),
							GetComponent.<Collider>().bounds.extents.z
					);
	sqrMinimumExtent = minimumExtent * minimumExtent;
}


function FixedUpdate () {
	// Show bullet if visible
	if (!meshRenderer.enabled && Time.time - startTime >= SECONDS_UNTIL_VISIBLE) {
		meshRenderer.enabled = true;
	}

	// Move forward
	this.gameObject.transform.position += SPEED * this.gameObject.transform.forward;
	
	var movementThisStep : Vector3 = this.gameObject.transform.position - previousPosition;
	var movementSqrMagnitude = movementThisStep.sqrMagnitude;
	if (movementSqrMagnitude > sqrMinimumExtent) {
		var movementMagnitude = movementThisStep.magnitude;
	
		var hitInfo : RaycastHit;
		if (Physics.Raycast(previousPosition, movementThisStep, hitInfo, movementMagnitude, layerMask.value)) {
			OnBulletHit(hitInfo, movementThisStep.normalized);
		}
	}
	
	previousPosition = this.gameObject.transform.position;
	
	// Destroy bullet if expired
	if (Time.time - startTime >= SECONDS_UNTIL_DESTROY) {
		Destroy(this.gameObject);
	}
}


function OnBulletHit (hit : RaycastHit, direction : Vector3) {
	// Destroy the bullet
	if (this.gameObject) Destroy(this.gameObject);
	
	// Destroy the enemy and update score
	if (hit != null && hit.collider != null && hit.collider.gameObject != null && hit.collider.gameObject.CompareTag("Enemy")) {
		var enemy : Enemy = hit.collider.gameObject.GetComponent(Enemy);
		enemy.OnBulletHit(Array(1, hit.point.x, hit.point.y, hit.point.z,
																	direction.x, direction.y, direction.z));
//		hit.collider.gameObject.SendMessage("OnBulletHit", Array(1, hit.point.x, hit.point.y, hit.point.z,
//																	direction.x, direction.y, direction.z));
		
		hit.rigidbody.AddForceAtPosition(BULLET_FORCE_MAGNITUDE * direction, hit.point, ForceMode.Impulse);
	}
}