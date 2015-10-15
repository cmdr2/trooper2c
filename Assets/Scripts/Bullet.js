#pragma strict

/* dependencies */
public var layerMask : LayerMask;

/* globals */
private static var speedC : float = 3;
private static var secondsUntilDestroy : float = 4;
private static var bulletForceMagnitudeI : float = 120;
private static var secondsUntilVisible : float = 0.005;

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
	
	if (EnemySpawnManager) EnemySpawnManager.BulletShot();
}

function Awake () {
	previousPosition = this.gameObject.transform.position;
	minimumExtent = Mathf.Min(Mathf.Min(GetComponent.<Collider>().bounds.extents.x, GetComponent.<Collider>().bounds.extents.y), GetComponent.<Collider>().bounds.extents.z);
	sqrMinimumExtent = minimumExtent * minimumExtent;
}

function FixedUpdate () {
	// Show bullet if visible
	if (!meshRenderer.enabled && Time.time - startTime >= secondsUntilVisible) {
		meshRenderer.enabled = true;
	}

	// Move forward
	this.gameObject.transform.position += speedC * this.gameObject.transform.forward;
	
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
	if (Time.time - startTime >= secondsUntilDestroy) {
		Destroy(this.gameObject);
	}
}

function OnBulletHit (hit : RaycastHit, direction : Vector3) {
	// Destroy the bullet
	if (this.gameObject) Destroy(this.gameObject);
//	else if (googleAnalytics) googleAnalytics.LogException("Bullet: OnBulletHit(): this.gameObject is null", false);
	
	// Destroy the enemy and update score
	if (hit != null && hit.collider != null && hit.collider.gameObject != null && hit.collider.gameObject.CompareTag("Enemy")) {
//		if (!hit.collider.rigidbody.useGravity) {
//			hit.collider.rigidbody.useGravity = true;
			hit.collider.gameObject.SendMessage("OnBulletHit", Array(1, hit.point.x, hit.point.y, hit.point.z,
																		direction.x, direction.y, direction.z));
//		}
		
		hit.rigidbody.AddForceAtPosition(bulletForceMagnitudeI * direction, hit.point, ForceMode.Impulse);
	}
}