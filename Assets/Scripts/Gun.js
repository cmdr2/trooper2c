#pragma strict

static var instance : Gun;

/* dependencies */
var Score : GameObject;
var Bullet : GameObject;
var muzzleFlash : ParticleEmitter;
var light1 : GameObject;
var light2 : GameObject;
var light3 : GameObject;

var googleAnalytics : GoogleAnalyticsV3;

/* globals */
//var fireRateF : float = 0.232 * 3; // ~4.3 shots per second x 3 bullets = ~12 bullets/sec
private var fireRateF : float = 0.232 * 3; // ~4.3 shots per second x 3 bullets = ~12 bullets/sec
private var minFireSoundDuration : float = 0.232 * 3; // seconds

/* scratchpad */
static var gameOver = false;

private var nextFire : float = 0.0;
private var fireSoundDuration : float = minFireSoundDuration;

private var fireSoundStartTime : float = 0.0;

private var muzzleTimer : float = 0.0;
private var muzzleCooler : float = 0.1;
private var bulletQueueCount : int = 0;
private var isFiring : boolean = false;

function Awake() {
	MuzzleFlash(false);
}

function MuzzleFlash(on : boolean) {
	if (on) {
		if (muzzleFlash) muzzleFlash.Emit();
		else if (googleAnalytics) googleAnalytics.LogException("Gun: MuzzleFlash(): muzzleFlash is null [1]", false);
	} else {
		if (muzzleFlash) muzzleFlash.emit = false;
		else if (googleAnalytics) googleAnalytics.LogException("Gun: MuzzleFlash(): muzzleFlash is null [2]", false);
	}
	if (light1) light1.SetActive(on);
	else if (googleAnalytics) googleAnalytics.LogException("Gun: MuzzleFlash(): light1 is null [1]", false);
	
	if (light2) light2.SetActive(on);
	else if (googleAnalytics) googleAnalytics.LogException("Gun: MuzzleFlash(): light2 is null [1]", false);
	
	if (light3) light3.SetActive(on);
	else if (googleAnalytics) googleAnalytics.LogException("Gun: MuzzleFlash(): light3 is null [1]", false);
}

function Fire() {
	if (isFiring) {
		bulletQueueCount += 3;
	} else {
		isFiring = true;
//		StartGunSound();
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
//		StopGunSound();
	}
}

function StartGunSound() {
	//  if still playing previous single-fire "3 bullet" sound
	if (Time.time - fireSoundStartTime < fireSoundDuration) {
		fireSoundStartTime = Time.time;
	} else {
		fireSoundStartTime = Time.time;
		fireSoundDuration = minFireSoundDuration;
		
		if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Play();
		else if (googleAnalytics) googleAnalytics.LogException("Gun: StartGunSound(): audio is null", false);
	}
}

function StopGunSound() {
	// play atleast 3 bullet sounds for single-fire
	var timeLeft = fireSoundDuration - (Time.time - fireSoundStartTime);
	while ( timeLeft > 0 ) {
		yield WaitForSeconds(timeLeft);
		timeLeft = fireSoundDuration - (Time.time - fireSoundStartTime);
	}
	
	
	if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Stop();
	else if (googleAnalytics) googleAnalytics.LogException("Gun: StopGunSound(): audio is null", false);
}

@script RequireComponent(AudioSource)
function Update () {
	if (gameOver) {
		if (GetComponent.<AudioSource>()) {
			if (GetComponent.<AudioSource>().isPlaying) GetComponent.<AudioSource>().Stop();
		} else if (googleAnalytics) {
			googleAnalytics.LogException("Gun: Update(): audio is null", false);
		}
	} else {
		// Keep firing while the left mouse button is kept pressed
//		if (Input.GetButton("Fire1") && Time.time > nextFire) {
		var triggered : boolean = /*Cardboard.SDK.CardboardTriggered || */Input.GetButton("Fire1");
		if (EnemySpawnManager.gameInProgress && triggered/* && Time.time > nextFire*/ && Time.time > fireSoundDuration) {
			nextFire = Time.time + fireRateF * 0.3;
			Fire();
		}
		
		if (Input.GetButtonUp("Fire1")) {
			bulletQueueCount = 6;
		}
		
		// Start gun sound at first frame of fire button
		/*if (Input.GetButtonDown("Fire1")) {
			StartGunSound();
		}
		
		// Stop gun sound at last frame of fire button
		if (Input.GetButtonUp("Fire1")) {
			StopGunSound();
		}*/
	}
}

static function GameOver() {
	GameOver(true);
}

static function GameOver(over) {
	gameOver = over;
}