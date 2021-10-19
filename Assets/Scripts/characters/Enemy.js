#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

/* dependencies */
public var bloodSplatter : ParticleSystem;


/* globals */
private static var MAX_HEALTH : int = 3;
private static var BOSS_MAX_HEALTH : int = 40;
private static var MINIBOSS_MAX_HEALTH : int = 20;
private static var GROAN_AUDIO_PRIORITY : int = 3;
private static var DIE_AUDIO_PRIORITY : int = 4;
private static var TIME_STEP : float = 0.16; // 6 steps per second
private static var SPEED : float = 0.3;


/* scratchpad */
private var isBoss : boolean = false;
private var isMiniBoss : boolean = false;
private var currentHealth : int = MAX_HEALTH;
private var dead = false;
private var groanAudio : AudioSource;
private var dieAudio : AudioSource;
private var nextMoveTime : float;


@script RequireComponent(AudioSource)
function Start () {
	Physics.IgnoreLayerCollision(8, 8); // between Enemy
	Physics.IgnoreLayerCollision(8, 10); // between Enemy and his hands
	
	nextMoveTime = Time.time;
	
	if (bloodSplatter) bloodSplatter.Stop();// = false;
	
	var audioSources : Component[] = GetComponents(AudioSource);
	groanAudio = getPriorityAudio(audioSources, GROAN_AUDIO_PRIORITY);
	dieAudio = getPriorityAudio(audioSources, DIE_AUDIO_PRIORITY);
	
	Groan();
}


@script RequireComponent(AudioSource)
function FixedUpdate () {
	if (dead) { // stop moving
		if (groanAudio) groanAudio.Stop();
		
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
		nextMoveTime = Time.time + TIME_STEP;
		transform.position -= SPEED * path.normalized;
		transform.rotation = Quaternion.LookRotation( Vector3(transform.position.x, 0, transform.position.z), Vector3(0, 1, 0) );
	}
}


function OnCollisionEnter(collision : Collision) {
	if (!dead && collision.gameObject.CompareTag("Player")) {
		PlayerDied();
	}
}


private function PlayerDied() {
	// stop enemy movements
	// and show failed - retry? screen
	GameManager.Instance().LevelFailed();
	 
	// prevent player gunfire
	Gun.Instance().GameOver(true);
}


public function SetBossMode() {
	currentHealth = BOSS_MAX_HEALTH;
	isBoss = true;
	isMiniBoss = false;
}


public function SetMiniBossMode() {
	currentHealth = MINIBOSS_MAX_HEALTH;
	isMiniBoss = true;
	isBoss = false;
}


/*
Array(damage, hit.point.x, hit.point.y, hit.point.z,
        direction.x, direction.y, direction.z)
*/
public function OnBulletHit(bulletInfo : Array) {
	if (dead) {
		return;
	}
	
	if (--currentHealth <= 0) {
		dead = true;
		EnemySpawnManager.Instance().EnemyKilled(isMiniBoss, isBoss);
	}
	
	if (bulletInfo) {
		var point : Vector3 = Vector3(bulletInfo[1], bulletInfo[2], bulletInfo[3]);

		if (currentHealth <= 0) {
			if (groanAudio) groanAudio.Stop();
			
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
		} else {
			// show blood splatter out from impact
			if (bloodSplatter) {
				bloodSplatter.transform.position = point;
				bloodSplatter.Emit(1000);
				yield WaitForSeconds(0.03);
				bloodSplatter.Stop();//emit = false;
			}
		}
	}
}


private function getPriorityAudio(audioSources : Component[], priority : int) {
	for (var i = 0; i < audioSources.length; i++) {
		var source : AudioSource = (audioSources[i] as AudioSource);
		if (source && source.priority == priority) {
			return source;
		}
	}
	
	return null;
}


private function Groan() {
	yield WaitForSeconds(1.3 * Random.value);
	
	if (groanAudio)
		groanAudio.Play();
}