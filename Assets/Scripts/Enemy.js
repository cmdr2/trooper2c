#pragma strict

/* dependencies */
var bloodSplatter : ParticleEmitter;
/* / */

var maxHealth : int = 3;
var bossMaxHealth : int = 60;
var miniBossMaxHealth : int = 20;
var isBoss : boolean = false;
var isMiniBoss : boolean = false;
private var currentHealth : int = maxHealth;

var dead = false;

var GROAN_AUDIO_PRIORITY : int = 3;
var DIE_AUDIO_PRIORITY : int = 4;

var groanAudio : AudioSource;
var dieAudio : AudioSource;

function OnCollisionEnter(collision : Collision) {
	if (!dead && collision.gameObject.CompareTag("Player")) {
		PlayerDied();
	}
}

function PlayerDied() {
	// stop enemy movements
	// and show failed - retry? screen
	if (EnemySpawnManager) EnemySpawnManager.EndRound();
//	else GoogleAnalyticsExceptionProxy("Enemy: PlayerDied(): EnemySpawnManager is null", true);
	 
	// prevent player gunfire
	if (Gun) Gun.GameOver(true);
//	else if (googleAnalytics) googleAnalytics.LogException("Enemy: PlayerDied(): Gun is null", false);
}

function SetBossMode() {
	maxHealth = bossMaxHealth;
	currentHealth = bossMaxHealth;
	isBoss = true;
	isMiniBoss = false;
}

function SetMiniBossMode() {
	maxHealth = miniBossMaxHealth;
	currentHealth = miniBossMaxHealth;
	isMiniBoss = true;
	isBoss = false;
}

/*
Array(damage, hit.point.x, hit.point.y, hit.point.z,
        direction.x, direction.y, direction.z)
*/
function OnBulletHit(bulletInfo : Array) {
	if (dead) return;
	
	if (--currentHealth <= 0) {
		dead = true;
		if (EnemySpawnManager) EnemySpawnManager.EnemyKilled(isMiniBoss, isBoss);
//		else if (googleAnalytics) googleAnalytics.LogException("Enemy: OnBulletHit(): EnemySpawnManager is null", true);
	}
	
	if (bulletInfo) {
		var point : Vector3 = Vector3(bulletInfo[1], bulletInfo[2], bulletInfo[3]);

		if (currentHealth <= 0) {
			if (groanAudio) groanAudio.Stop();
//			else if (googleAnalytics) googleAnalytics.LogException("Enemy: OnBulletHit(): groanAudio is null", false);
			
			var direction : Vector3 = Vector3(bulletInfo[4], bulletInfo[5], bulletInfo[6]);
			GetComponent.<Rigidbody>().AddForceAtPosition( 200 * direction, point, ForceMode.Impulse);
			var enemyHead : Vector3 = transform.position + Vector3(0, transform.lossyScale.y / 2, 0);
			if (isBoss) { // the bossman must fall!
				GetComponent.<Rigidbody>().AddForceAtPosition( 1500 * direction, enemyHead, ForceMode.Impulse);
			} else if (isMiniBoss) {
				GetComponent.<Rigidbody>().AddForceAtPosition( 700 * direction, enemyHead, ForceMode.Impulse);
			}
			if (dieAudio) {
				dieAudio.volume = 10;
				dieAudio.Play();
			}
//			 else if (googleAnalytics) googleAnalytics.LogException("Enemy: OnBulletHit(): dieAudio is null", false);
		} else {
			// show blood splatter out from impact
			if (bloodSplatter) {
				bloodSplatter.transform.position = point;
				bloodSplatter.Emit();
				yield WaitForSeconds(0.03);
				bloodSplatter.emit = false;
			} 
//			else if (googleAnalytics) googleAnalytics.LogException("Enemy: OnBulletHit(): bloodSplatter is null", false);
		}
	}
}

function getPriorityAudio(audioSources : Component[], priority : int) {
	for (var i = 0; i < audioSources.length; i++) {
		var source : AudioSource = (audioSources[i] as AudioSource);
		if (source && source.priority == priority) {
			return source;
		}
	}
	
	return null;
}


// zombie type
var timeStepA : float = 0.16; // 6 steps per second
var speedD : float = 0.3;
var nextMoveTime : float;

@script RequireComponent(AudioSource)
function Start () {
	nextMoveTime = Time.time;
	
	if (bloodSplatter) bloodSplatter.emit = false;
//	else if (googleAnalytics) googleAnalytics.LogException("Enemy: Start(): bloodSplatter is null", false);
	
	var audioSources : Component[] = GetComponents(AudioSource);
	groanAudio = getPriorityAudio(audioSources, GROAN_AUDIO_PRIORITY);
	dieAudio = getPriorityAudio(audioSources, DIE_AUDIO_PRIORITY);
	
	Groan();
}

function Groan() {
	yield WaitForSeconds(1.3 * Random.value);
	
	if (groanAudio)
		groanAudio.Play();
//	else if (googleAnalytics) googleAnalytics.LogException("Enemy: Groan(): groanAudio is null", false);
}

@script RequireComponent(AudioSource)
function FixedUpdate () {
	if (dead) { // stop moving
//		rigidbody.velocity = Vector3.zero;
		if (groanAudio) groanAudio.Stop();
//		else if (googleAnalytics) googleAnalytics.LogException("Enemy: FixedUpdate(): groanAudio is null", false);
		
		return;
	}
	
	var path : Vector3 = Vector3(transform.position.x, 0, transform.position.z);
	if (path.magnitude < 1) {
		dead = true; // I'm kinda like a bee, die after I sting, ya know?
		GetComponent.<Rigidbody>().velocity = Vector3.zero;
		PlayerDied();
		return;
	}

	if (Time.time > nextMoveTime) {
		nextMoveTime = Time.time + timeStepA;
		transform.position -= speedD * path.normalized;
		transform.rotation = Quaternion.LookRotation( Vector3(transform.position.x, 0, transform.position.z), Vector3(0, 1, 0) );
	}
}


// random type
/*var id : float;

var theta : float = 0.0;
var radius : float = 0.0;

var stepMinRadiusC : float = 0.8;
var stepMaxRadiusD : float = 2.6;

var stepMaxAngleI : float = 30 * Mathf.PI / 180;

var velMultiplierA : float = 1.0;
var timeToMoveB : float = 0.3;
var timeBetweenMovesB : float = 0.6;

var nextPosition : Vector3 = Vector3();
var moveEndTime : float = 0;
var nextMoveTime : float = 0;

enum MoveStates {READY_TO_MOVE, MOVING, PAUSE_AFTER_MOVE};
var moveState : MoveStates = MoveStates.READY_TO_MOVE;

function Start() {
	id = Time.realtimeSinceStartup;

	nextPosition = GetNextPosition();
}

function SetTheta (th : float) {
	theta = th;
}

function SetRadius(rad : float) {
	radius = rad;
}

function GetNextPosition() {
	var stepVector : Vector3;
	
	if (radius > 2.5) {
		var stepRadius : float = Random.Range(stepMinRadiusC, stepMaxRadiusD);
		var stepAngle : float = Random.value * stepMaxAngleI * (Random.value > 0.5 ? -1 : 1);

		theta += stepAngle;
		radius -= stepRadius;

		stepVector = Vector3(radius * Mathf.Cos(theta), 1.3, radius * Mathf.Sin(theta));
	} else if (radius > 1) {
		stepVector = Vector3(0, 1.3, 0);
	} else {
		EndGame();
	}
	
	return stepVector;
}

function FixedUpdate () {
	if (dead) { // stop moving
		rigidbody.velocity = Vector3.zero;
		return;
	}

	if (radius == 0) return;

	switch (moveState) {
		case MoveStates.READY_TO_MOVE:
			var vel : Vector3 = (nextPosition - transform.position);
			rigidbody.velocity = vel * velMultiplierA;
			moveEndTime = Time.time + timeToMoveB;
			moveState = MoveStates.MOVING;
		break;
	
		case MoveStates.MOVING:
			if (Time.time > moveEndTime) {
				nextPosition = GetNextPosition();
				nextMoveTime = Time.time + timeBetweenMovesB;
				moveState = MoveStates.PAUSE_AFTER_MOVE;
			}
		break;
		
		case MoveStates.PAUSE_AFTER_MOVE:
			rigidbody.velocity = Vector3.zero;
			if (Time.time >= nextMoveTime) {
				moveState = MoveStates.READY_TO_MOVE;
			}
		break;
		
		default:
			print("Illegal state transition!");
		break;
	}
}*/