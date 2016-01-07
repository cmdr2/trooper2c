#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : GameManager;

/* dependencies */
public var gameoverMysticalParticles : GameObject;
public var LookBehindMessage : GameObject;
public var endgameBloodSplatter : GameObject;
public var introScreen : GameObject;
public var victoryScreen : GameObject;
public var sightline : GameObject;


/* globals */
private static var MESSAGE_DISTANCE : float = 4.5f; // meters
private static var HEALTH_CHECK_INTERVAL : float = 5; // seconds
private static var MAX_LIVES : int = 3;
private static var INITIAL_SCORE_PER_ENEMY : float = 6; // equal to enemy hitpoints


/* scratchpad */
private var lives : int = MAX_LIVES;
private var level : int = 0;

public var gameState : GameState = GameState.SPLASH_SCREEN;

private var nextHealthCheckTime : float = -1;
private var cam : GameObject;
private var introScreen2 : GameObject;
private var victoryScreen2 : GameObject;


public enum GameState {
	SPLASH_SCREEN, IN_LEVEL, FAILED_LEVEL, FAILED_GAME, WON_LEVEL, WON_GAME
};


function Start () {
	instance = this;
	
	Screen.sleepTimeout = SleepTimeout.NeverSleep;
	
	Metrics.LogScreen("Splash");
	
	cam = GameObject.Find("Main Camera Right");
	CreateDuplicateIntroScreen();
}


public static function Instance() : GameManager {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(GameManager);
	}
	return instance;
}


function Update () {
    /* healthcheck stuff */
    if (Time.time >= nextHealthCheckTime) {
    	Metrics.LogEvent("Application", "HealthCheckPing");
    	nextHealthCheckTime = Time.time + HEALTH_CHECK_INTERVAL;
    }
    
    var triggered : boolean = Cardboard.SDK.CardboardTriggered || Input.GetButtonDown("Fire1");
    
    if (triggered && gameState == GameState.SPLASH_SCREEN) {
		StartGame();
	} else if (triggered && (gameState == GameState.FAILED_LEVEL || gameState == GameState.FAILED_GAME || gameState == GameState.WON_GAME)) {
		RestartGame();
	}
}


private function StartGame() : void {
	gameState = GameState.IN_LEVEL;
		
	sightline.SetActive(true);
	introScreen.SetActive(false);
	if (introScreen2) {
		introScreen2.SetActive(false);
	}
	
	// enable score, bonus and level
	Score.Instance().gameObject.SetActive(true);
	BonusMessage.Instance().gameObject.SetActive(true);
	Prompt.Instance().gameObject.SetActive(true);
	
	NextWave();
	
	Score.Instance().SetLives(lives);
}


private function RestartGame() : void {
	gameState = GameState.IN_LEVEL;
	sightline.SetActive(true);
	
	victoryScreen.SetActive(false);
	if (victoryScreen2) {
		victoryScreen2.SetActive(false);
	}
	endgameBloodSplatter.SetActive(false);
	Prompt.Instance().Hide();
	Gun.Instance().GameOver(false);
	
	if (lives <= 0) {
		lives = MAX_LIVES;
		level = (level > 3 ? level - 3 : 0); // 2 level penalty
		Score.Instance().SetLevelScore(0);
		Score.Instance().SetScore(0);
		Score.Instance().SetLives(lives);
		
		Metrics.LogEvent("Business", "CustomerInitiatedReplay");
		Metrics.LogEvent("Replay", "Replay Game");
	} else {
		level--; // back to old level, since we incremented in NewWave()
		Score.Instance().SetLevelScore(0);
		Score.Instance().AddScore(EnemySpawnManager.Instance().levelScore);
		
		Metrics.LogEvent("Business", "CustomerInitiatedReplay");
		Metrics.LogEvent("Replay", "Replay Level " + (level+1));
	}
	
	NextWave();
}


public function LevelComplete(enemiesKilledThisWave : int,
				enemiesSpawnedThisWave : int,
				enemyCountThisWave : int,
				bulletsShotThisWave : int) : IEnumerator {
				
	ApplyBonus(enemiesKilledThisWave, enemiesSpawnedThisWave, enemyCountThisWave, bulletsShotThisWave);
	
	Score.Instance().AddScore(EnemySpawnManager.Instance().levelScore);
	Score.Instance().SetLevelScore(0);
	
	if (level >= 14) { // won the game
		gameState = GameState.WON_GAME;
		sightline.SetActive(false);
		lives = 0;
		
		// hide bonus screen
		BonusMessage.Instance().Hide();
		
		// show victory screen
		victoryScreen.SetActive(true);
		CreateDuplicateVictoryScreen();
		
		// analytics
		Metrics.LogScreen("Victory");
		
		// maybe play some music
	} else {
		gameState = GameState.WON_LEVEL;
		sightline.SetActive(true);
		
		yield WaitForSeconds(3);
		NextWave();
	}
}


public function LevelFailed() : void {
	if (gameState != GameState.FAILED_LEVEL && gameState != GameState.FAILED_GAME) {
		gameState = GameState.FAILED_LEVEL;
		sightline.SetActive(false);
		lives--;
		Score.Instance().AddLives(-1);
		
		if (lives > 0) {
			gameState = GameState.FAILED_LEVEL;
			Prompt.Instance().ShowRoundOver(false);
			
			endgameBloodSplatter.SetActive(true);
			GetComponent.<AudioSource>().Play();
			
			Metrics.LogScreen("Failed Level " + level);
		} else {
			gameState = GameState.FAILED_GAME;
			Prompt.Instance().ShowRoundOver(true);
			
			endgameBloodSplatter.SetActive(true);
			GetComponent.<AudioSource>().Play();
			
			if (gameoverMysticalParticles) gameoverMysticalParticles.SetActive(true);
			
			Metrics.LogScreen("Game Over");
		}
		EnemySpawnManager.Instance().DestroyAllEnemies();
	}
}


private function NextWave() : IEnumerator {
	level++;
	
	BonusMessage.Instance().Hide();
	gameoverMysticalParticles.SetActive(false);
	
	Prompt.Instance().ShowCountdown( new Array(15 - level, 3) );
	yield WaitForSeconds(1);
	Prompt.Instance().ShowCountdown( new Array(15 - level, 2) );
	yield WaitForSeconds(1);
	Prompt.Instance().ShowCountdown( new Array(15 - level, 1) );
	yield WaitForSeconds(1);
	Prompt.Instance().Hide();
	
	gameState = GameState.IN_LEVEL;
	
	
	EnemySpawnManager.Instance().SpawnWave(level); // here be new munsters!
	
	
	Metrics.LogScreen("Level " + level);
	
	if (level == 1) {
		LookBehindMessage.SetActive(true);
		HideLookBehindAfterTimeout();
	}
}


private function ApplyBonus(enemiesKilledThisWave : int,
				enemiesSpawnedThisWave : int,
				enemyCountThisWave : int,
				bulletsShotThisWave : int) : void {
	
	var skillBonus : int = 0;
	var difficultyBonus : int = 0;
	
	difficultyBonus = enemyCountThisWave * INITIAL_SCORE_PER_ENEMY + LevelInfo.GetMagicDifficultyBonus(level);

	if (enemiesKilledThisWave > 0 && bulletsShotThisWave > 0) {
		skillBonus = Mathf.Round(
			Mathf.Pow(
				(enemiesKilledThisWave * 1f / bulletsShotThisWave) * Mathf.Sqrt(difficultyBonus)
			, 2) * 100
		);
	}
	
	Score.Instance().AddScore(skillBonus);
	Score.Instance().AddScore(difficultyBonus);
	
	BonusMessage.Instance().Show( Array(skillBonus, difficultyBonus) );
}


private function CreateDuplicateIntroScreen() : void { // behind player
	if (cam) {
		var ray : Ray = new Ray(cam.transform.position, cam.transform.forward);
		introScreen.transform.position = ray.GetPoint(MESSAGE_DISTANCE);
		introScreen.transform.LookAt(cam.transform.position);
		introScreen.transform.RotateAround(introScreen.transform.position, introScreen.transform.up, 180);
		
		introScreen2 = Instantiate(introScreen);
		var ray2 : Ray = new Ray(cam.transform.position, -cam.transform.forward);
		introScreen2.transform.position = ray2.GetPoint(MESSAGE_DISTANCE);
		introScreen2.transform.LookAt(cam.transform.position);
		introScreen2.transform.RotateAround(introScreen2.transform.position, introScreen2.transform.up, 180);
	}
}


private function CreateDuplicateVictoryScreen() : void { // behind player
	if (cam) {
		var ray : Ray = new Ray(cam.transform.position, cam.transform.forward);
		victoryScreen.transform.position = ray.GetPoint(MESSAGE_DISTANCE);
		victoryScreen.transform.LookAt(cam.transform.position);
		victoryScreen.transform.RotateAround(victoryScreen.transform.position, victoryScreen.transform.up, 180);
		
		victoryScreen2 = Instantiate(victoryScreen);
		var ray2 : Ray = new Ray(cam.transform.position, -cam.transform.forward);
		victoryScreen2.transform.position = ray2.GetPoint(MESSAGE_DISTANCE);
		victoryScreen2.transform.LookAt(cam.transform.position);
		victoryScreen2.transform.RotateAround(victoryScreen2.transform.position, victoryScreen2.transform.up, 180);
	}
}


private function HideLookBehindAfterTimeout() : IEnumerator {
	yield WaitForSeconds(2);
	LookBehindMessage.SetActive(false);
}