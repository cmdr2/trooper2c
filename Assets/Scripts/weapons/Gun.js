#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : Gun;

/* dependencies */
public var Bullet : GameObject;
public var muzzleFlash : ParticleSystem;
public var light1 : GameObject;
public var light2 : GameObject;
public var light3 : GameObject;


/* globals */
private var FIRE_RATE : float = 0.232 * 3;
private var MIN_FIRE_SOUND_DURATION : float = 0.232 * 3; // seconds
private var SIGHTLINE_DISTANCE : float = 30; // meters


/* scratchpad */
private var gameOver : boolean = false;

private var nextFire : float = 0.0;
private var fireSoundDuration : float = MIN_FIRE_SOUND_DURATION;

private var fireSoundStartTime : float = 0.0;

private var muzzleTimer : float = 0.0;
private var muzzleCooler : float = 0.1;
private var bulletQueueCount : int = 0;
private var isFiring : boolean = false;


function Awake() {
	MuzzleFlash(false);
}


public static function Instance() : Gun {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(Gun);
	}
	return instance;
}


@script RequireComponent(AudioSource)
function Update () {
	if (gameOver) {
		if (GetComponent.<AudioSource>()) {
			if (GetComponent.<AudioSource>().isPlaying) GetComponent.<AudioSource>().Stop();
		}
	} else {
		var triggered : boolean = Cardboard.SDK.CardboardTriggered || Input.GetButton("Fire1");
		if (GameManager.Instance().gameState == GameState.IN_LEVEL && triggered && Time.time > nextFire && Time.time > fireSoundDuration) {
			nextFire = Time.time + FIRE_RATE * 0.3;
			Fire();
		}
		
		if (Input.GetButtonUp("Fire1")) {
			bulletQueueCount = 3;
		}
	}
}


private function MuzzleFlash(on : boolean) {
	if (on) {
		if (muzzleFlash) muzzleFlash.Emit(100);
	} else {
		if (muzzleFlash) muzzleFlash.Stop();// = false;
	}
	if (light1) light1.SetActive(on);
	if (light2) light2.SetActive(on);
	if (light3) light3.SetActive(on);
}


private function Fire() {
	if (isFiring) {
		bulletQueueCount += 3;
	} else {
		isFiring = true;
		if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Play();
		bulletQueueCount = 9;
		while (bulletQueueCount > 0) {
			if (gameOver) {
				bulletQueueCount = 0;
				break;
			}
			bulletQueueCount--;
			MuzzleFlash(true);
			Instantiate(Bullet, transform.position, transform.rotation);
			yield WaitForSeconds(0.03);
			MuzzleFlash(false);
			
			yield WaitForSeconds(0.04);
		}
		isFiring = false;
		if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Stop();
	}
}


private function StartGunSound() {
	//  if still playing previous single-fire "3 bullet" sound
	if (Time.time - fireSoundStartTime < fireSoundDuration) {
		fireSoundStartTime = Time.time;
	} else {
		fireSoundStartTime = Time.time;
		fireSoundDuration = MIN_FIRE_SOUND_DURATION;
		
		if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Play();
	}
}


private function StopGunSound() {
	// play atleast 3 bullet sounds for single-fire
	var timeLeft = fireSoundDuration - (Time.time - fireSoundStartTime);
	while ( timeLeft > 0 ) {
		yield WaitForSeconds(timeLeft);
		timeLeft = fireSoundDuration - (Time.time - fireSoundStartTime);
	}
	
	
	if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Stop();
}


public function GameOver() {
	GameOver(true);
}


public function GameOver(over) {
	gameOver = over;
}