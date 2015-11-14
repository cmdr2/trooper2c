#pragma strict

import System.IO;
import System.Collections.Generic;
import System.Text;

static var instance : EnemySpawnManager;

/* dependencies */
public var Enemy : GameObject;
public var BossEnemy : GameObject;
public var MiniBossEnemy : GameObject;
public var MegaBossEnemy : GameObject;
public var _BonusMessage : GameObject;
public var LookBehindMessage : GameObject;
public var _LevelTimerMessage : GameObject;
public var _Score : GameObject;
public var endgameBloodSplatter : GameObject;
public var _gameoverMysticalParticles : GameObject;
public var introScreen : GameObject;
public var victoryScreen : GameObject;
public var _sightline : GameObject;

public var _googleAnalytics : GoogleAnalyticsV3;

// hack
private static var BonusMessage : GameObject;
private static var LevelTimerMessage : GameObject;
private static var Score : GameObject;
private static var gameoverMysticalParticles : GameObject;
private static var sightline : GameObject;
private static var googleAnalytics : GoogleAnalyticsV3;


/* globals */
private var healthCheckInterval : float = 5; // seconds
private static var megaKillIntervalB : float = 0.25; // seconds
private static var enemyKillScore : int = 12;
private static var bossKillScore : int = 150;
private static var miniBossKillScore : int = 50;
private var initialScorePerEnemy : float = 6; // equal to enemy hitpoints
private var spawnMonitorIntervalA = 1; // seconds
private static var maxLives : int = 3;
private static var PLAYER_FILE = "Player";
private var MESSAGE_DISTANCE : float = 4.5f; // meters


/* scratchpad */
private static var sessionId = "";
private static var userId = "";

private static var enemies = Array();
private static var gameOver = false;

private static var enemiesSpawnedThisWave : float = 10;
private static var enemiesKilledThisWave : float = 0;
private static var bulletsShotThisWave : float = 0;

private static var megaKillCurrCount : int = 0;
private static var lastKillTime : float = 0;

private static var levelScore : int = 0;
private static var lives : int = maxLives;

private static var level : int = 0;

private var gameStarted : boolean = false;
public static var gameInProgress : boolean = false;
private var enemyCountThisWave : int = 0;
private var isSpawning = 0;
private var nextSpawnMonitorTime = 0;
private var nextHealthCheckTime : float = -1;
private var triggered : boolean = false;
private var cam : GameObject;
private var introScreen2 : GameObject;
private var victoryScreen2 : GameObject;


function GetLevelSpawnCount(levelNumber : int) {
	switch (levelNumber) {
		case 1:
			return 3;
		case 2:
			return 5;
		case 3:
			return 7;
		case 4:
			return 7;
		case 5:
			return 11;
		case 6:
			return 13;
		case 7:
			return 14;
		case 8:
			return 9;
		case 9:
			return 15;
		case 10:
			return 18;
		case 11:
			return 20;
		case 12:
			return 22;
		case 13:
			return 24;
		case 14:
			return 28;
		default:
			return 28;
	}
}

function GetLevelSpawnRadius(levelNumber : int) {
	switch (levelNumber) {
		case 1:
			return Array("24", "30");
		case 2:
			return Array("24", "30");
		case 3:
			return Array("24", "30");
		case 4:
			return Array("24", "34");
		case 5:
			return Array("24", "31");
		case 6:
			return Array("25", "31");
		case 7:
			return Array("25", "35");
		case 8:
			return Array("20", "26");
		case 9:
			return Array("20", "26");
		case 10:
			return Array("21", "28");
		case 11:
			return Array("19", "32");
		case 12:
			return Array("18", "38");
		case 13:
			return Array("17", "40");
		case 14:
			return Array("20", "46");
		default:
			return Array("18.5", "46");
	}
}

function GetMagicLevelDifficultyBonus(levelNumber : int) {
	switch (levelNumber) {
		case 1:
			return 0;
		case 2:
			return 20;
		case 3:
			return 30;
		case 4:
			return 80;
		case 5:
			return 110;
		case 6:
			return 205;
		case 7:
			return 300;
		case 8:
			return 0;
		case 9:
			return 40;
		case 10:
			return 60;
		case 11:
			return 160;
		case 12:
			return 220;
		case 13:
			return 410;
		case 14:
			return 600;
		default:
			return 600;
	}
}

function Awake() {
	instance = this;
	
	PLAYER_FILE = Application.persistentDataPath + Path.DirectorySeparatorChar + "Player";
	
	sessionId = guid();
	
	BonusMessage = _BonusMessage;
	LevelTimerMessage = _LevelTimerMessage;
	Score = _Score;
	gameoverMysticalParticles = _gameoverMysticalParticles;
	googleAnalytics = _googleAnalytics;
	sightline = _sightline;
	Physics.IgnoreLayerCollision(8, 8); // between Enemy
	Physics.IgnoreLayerCollision(8, 10); // between Enemy and his hands
	gameoverMysticalParticles.SetActive(false);
	
	Screen.sleepTimeout = SleepTimeout.NeverSleep;
	
	gaLogScreen("Splash");
	
	cam = GameObject.Find("Main Camera Right");
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
	
	if (File.Exists(PLAYER_FILE)) {
		var sr = new StreamReader(PLAYER_FILE);
		userId = sr.ReadLine();
		if (googleAnalytics) {
			gaLogEvent("Application", "ReturnUser");
		}
	}
	
	if (userId.Trim().Equals("")) {
		userId = "U" + guid();
		var sw = new StreamWriter(PLAYER_FILE);
		sw.Write(userId);
		sw.Close();
	}
	
	var t : System.TimeSpan = System.DateTime.UtcNow - new System.DateTime(1970, 1, 1);
	var secondsSinceEpoch : int = t.TotalSeconds;
	if (googleAnalytics) {
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory("UserSessions").SetEventAction(userId).SetEventValue(1) );
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory("Sessions").SetEventAction(secondsSinceEpoch + ":" + googleAnalytics.bundleVersion + ":" + userId + ":" + sessionId) );
		gaLogEvent("Application", "Platform-" + Application.platform);
	}
}

function NewWave(newGame : boolean) {
	print("Starting wave.. " + Time.time);
	if (!newGame) {
		print("Going to sleep for 3");
		yield WaitForSeconds(3);
		print("done");
	} else {
		print("not sleeping");
	}
	print("Yielded for 3 seconds");
	if (BonusMessage) BonusMessage.SendMessage("Hide");
	else gaLogException("SpawnManager: NewWave(): BonusMessage is null.", true);
	
	print("Told bonus message to bugger off");
	level++;
	
	if (gameoverMysticalParticles) gameoverMysticalParticles.SetActive(false);
	else gaLogException("SpawnManager: NewWave(): gameoverMysticalParticles is null", false);
	
	var enemyCount : int = GetLevelSpawnCount(level);
	var spawnRadius = GetLevelSpawnRadius(level);
	enemyCountThisWave = enemyCount;
	
	print("Starting countdown.. " + Time.time);
	
	if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowCountdown", new Array(15 - level, 3));
	else gaLogException("SpawnManager: NewWave(): LevelTimerMessage is null [1]", true);
	
	yield WaitForSeconds(1);
	
	if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowCountdown", new Array(15 - level, 2));
	else gaLogException("SpawnManager: NewWave(): LevelTimerMessage is null [1]", true);
	
	yield WaitForSeconds(1);
	
	if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowCountdown", new Array(15 - level, 1));
	else gaLogException("SpawnManager: NewWave(): LevelTimerMessage is null [1]", true);
	
	yield WaitForSeconds(1);
	
	if (LevelTimerMessage) LevelTimerMessage.SendMessage("Hide");
	else gaLogException("SpawnManager: NewWave(): LevelTimerMessage is null [4]", true);
	
	enemiesSpawnedThisWave = enemyCount;
	enemiesKilledThisWave = 0;
	bulletsShotThisWave = 0;
	
	print("Spawning.. " + enemyCount + ", " + Time.time);
	DestroyAllEnemies();
	
	if (Enemy) {
		for (var i = 1; i <= enemyCount; i++) {
			var radius = Random.Range(float.Parse(spawnRadius[0]), float.Parse(spawnRadius[1]));
			var sector = parseInt(i * 4 / enemyCount) + 1;
			
			var angle = Random.Range( ((sector - 1) * Mathf.PI) / 2, (sector * Mathf.PI) / 2 );
			
			var position : Vector3 = Vector3(radius * Mathf.Cos(angle), 1.3, radius * Mathf.Sin(angle));
			var rotation : Quaternion = Quaternion.identity;
	//		rotation.SetLookRotation( Vector3(-position.x, 0, -position.z), Vector3(0, 1, 0) );
			
			var enemy : GameObject = Instantiate(Enemy, position, rotation);
	//		enemy.SendMessage("SetTheta", angle);
	//		enemy.SendMessage("SetRadius", radius);
			
			if (enemy) {
				if (enemies) enemies.Push(enemy);
				else gaLogException("SpawnManager: NewWave(): enemies is null [1]", true);
			} else {
				gaLogException("SpawnManager: NewWave(): Enemy instantiated is null", true);
			}
		}
	}
	
	// spawn boss at farthest point in level 7
	if (BossEnemy && level == 7) {
		var bossAngle = Random.Range(0, 2 * Mathf.PI);
		var bossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(bossAngle), 10.3, float.Parse(spawnRadius[1]) * Mathf.Sin(bossAngle));
		var boss : GameObject = Instantiate(BossEnemy, bossPosition, Quaternion.identity);
		
		if (boss) boss.SendMessage("SetBossMode");
		else gaLogException("SpawnManager: NewWave(): boss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(boss);
		else gaLogException("SpawnManager: NewWave(): enemies is null [2]", true);
	}
	
	// spawn megaboss at farthest point in level 14
	if (MegaBossEnemy && level == 14) {
		var megabossAngle = Random.Range(0, 2 * Mathf.PI);
		var megabossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(megabossAngle), 11, float.Parse(spawnRadius[1]) * Mathf.Sin(megabossAngle));
		var megaboss : GameObject = Instantiate(MegaBossEnemy, megabossPosition, Quaternion.identity);
		
		if (megaboss) megaboss.SendMessage("SetBossMode");
		else gaLogException("SpawnManager: NewWave(): boss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(megaboss);
		else gaLogException("SpawnManager: NewWave(): enemies is null [2]", true);
	}
	
	// spawn boss at farthest point in level 4
	if (MiniBossEnemy && (level == 4 || level == 10)) {
		var minibossAngle = Random.Range(0, 2 * Mathf.PI);
		var minibossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(minibossAngle), 0.1, float.Parse(spawnRadius[1]) * Mathf.Sin(minibossAngle));
		var miniboss : GameObject = Instantiate(MiniBossEnemy, minibossPosition, Quaternion.identity);
		
		if (miniboss) miniboss.SendMessage("SetMiniBossMode");
		else gaLogException("SpawnManager: NewWave(): miniboss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(miniboss);
		else gaLogException("SpawnManager: NewWave(): enemies is null [2]", true);
	}
	
	SetLevelScore(0);
	
	
//		var avgFPS : int = parseInt(totalLevelFPS / totalLevelFrameCount);
	gaLogScreen("Level " + level);
	
	if (level == 1) {
		LookBehindMessage.SetActive(true);
		HideLookBehindAfterTimeout();
	}
}

function ApplyBonus() {
	var skillBonus : int = 0;
	var difficultyBonus : int = 0;
	
	difficultyBonus = enemyCountThisWave * initialScorePerEnemy + GetMagicLevelDifficultyBonus(level);

	if (enemiesKilledThisWave > 0 && bulletsShotThisWave > 0) {
		skillBonus = Mathf.Round( Mathf.Pow( (enemiesKilledThisWave / bulletsShotThisWave) * Mathf.Sqrt(difficultyBonus), 2) * 100 );
	}
	
	if (Score) {
		Score.SendMessage("AddScore", skillBonus);
		Score.SendMessage("AddScore", difficultyBonus);
	} else {
		gaLogException("SpawnManager: ApplyBonus(): Score is null", true);
	}
	
	if (BonusMessage) BonusMessage.SendMessage("Show", Array(skillBonus, difficultyBonus));
	else gaLogException("SpawnManager: ApplyBonus(): BonusMessage is null", true);
}

function FixedUpdate () {
	if (Time.time > nextSpawnMonitorTime) {
		nextSpawnMonitorTime = Time.time + spawnMonitorIntervalA;
		
		if (enemiesKilledThisWave >= enemiesSpawnedThisWave) { // won the level
			ApplyBonus();
			enemiesKilledThisWave = 0;
			if (Score) {
				Score.SendMessage("AddScore", levelScore);
				Score.SendMessage("SetLevelScore", 0);
			} else {
				gaLogException("SpawnManager: FixedUpdate(): Score is null", true);
			}
			
			if (level >= 14) { // won the game
				gameOver = true;
				sightline.SetActive(false);
				gameInProgress = false;
				lives = 0;
				
				// hide bonus screen
				if (BonusMessage) BonusMessage.SendMessage("Hide");
				else gaLogException("SpawnManager: FixedUpdate(): BonusMessage is null", true);
				
				// show victory screen
				victoryScreen.SetActive(true);
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
				
				// analytics
				gaLogScreen("Victory");
				
				// maybe play some music
			} else {
				gameInProgress = true;
				sightline.SetActive(true);
				NewWave(false);
				print("Spawned new");
			}
		}
	}
}

function Update() {
	triggered = Cardboard.SDK.CardboardTriggered || Input.GetButtonDown("Fire1");

    /* healthcheck stuff */
    if (Time.time >= nextHealthCheckTime) {
    	gaLogEvent("Application", "HealthCheckPing");
    	nextHealthCheckTime = Time.time + healthCheckInterval;
    }
    /* /healthcheck stuff */

	if (!gameInProgress && gameOver && triggered) { // restart game
		gameInProgress = true;
		sightline.SetActive(true);
		
		victoryScreen.SetActive(false);
		if (victoryScreen2) {
			victoryScreen2.SetActive(false);
		}
		endgameBloodSplatter.SetActive(false);
		if (LevelTimerMessage) LevelTimerMessage.SendMessage("Hide");
		else gaLogException("SpawnManager: Update(): LevelTimerMessage is null [1]", true);
		
		gameOver = false;
		Gun.GameOver(false);
		if (lives <= 0) {
			lives = maxLives;
			level = (level > 3 ? level - 3 : 0); // 2 level penalty
			if (Score) {
				Score.SendMessage("SetLevelScore", 0);
				Score.SendMessage("SetScore", 0);
				Score.SendMessage("SetLives", lives);
			} else {
				gaLogException("SpawnManager: Update(): Score is null [1]", true);
			}
			
			gaLogEvent("Business", "CustomerInitiatedReplay");
			gaLogEvent("Replay", "Replay Game");
		} else {
			level--; // back to old level, since we incremented in NewWave()
			if (Score) {
				Score.SendMessage("SetLevelScore", 0);
				Score.SendMessage("AddScore", levelScore);
			} else {
				gaLogException("SpawnManager: Update(): Score is null [2]", true);
			}
			
			gaLogEvent("Business", "CustomerInitiatedReplay");
			gaLogEvent("Replay", "Replay Level " + (level+1));
		}
		
		NewWave(true);
	} else if (!gameInProgress && !gameStarted && triggered) { // start game
		gameInProgress = true;
		sightline.SetActive(true);
		
		introScreen.SetActive(false);
		if (introScreen2) {
			introScreen2.SetActive(false);
		}
		
		// enable score, bonus and level
		if (Score) Score.SetActive(true);
		else gaLogException("SpawnManager: Update(): Score is null [3]", true);
		
		if (BonusMessage) BonusMessage.SetActive(true);
		else gaLogException("SpawnManager: Update(): BonusMessage is null", true);
		
		if (LevelTimerMessage) LevelTimerMessage.SetActive(true);
		else gaLogException("SpawnManager: Update(): LevelTimerMessage is null [2]", true);
		
		NewWave(true);
		
		if (Score) Score.SendMessage("SetLives", lives);
		else gaLogException("SpawnManager: Update(): Score is null [4]", true);
	}
	
	if (Input.GetKey(KeyCode.Escape)) {
		if (googleAnalytics) {
			gaLogEvent("Application", "Quit");
			googleAnalytics.DispatchHits();
		}
		Application.Quit();
	}
}

private function HideLookBehindAfterTimeout() {
	yield WaitForSeconds(2);
	LookBehindMessage.SetActive(false);
}

static function SetLevelScore(score : int) {
	levelScore = (score < 0 ? 0 : score);
	
	if (Score) Score.SendMessage("SetLevelScore", levelScore);
	else gaLogException("SpawnManager: SetLevelScore(): Score is null", true);
}

static function DestroyAllEnemies() {
	if (enemies) {
		for (var enemy : GameObject in enemies) {
			Destroy(enemy);
		}
	}
	
	enemies = Array();
}

static function EndRound() {
	if (!gameOver) {
		gameOver = true;
		sightline.SetActive(false);
		gameInProgress = false;
		lives--;
		if (Score) Score.SendMessage("AddLives", -1);
		else gaLogException("SpawnManager: EndRound(): Score is null", true);
		
		if (lives > 0) {
			if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowRoundOver", false);
			else gaLogException("SpawnManager: EndRound(): LevelTimerMessage is null [1]", true);
			
			gaLogScreen("Failed Level " + level);
		} else {
			if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowRoundOver", true);
			else gaLogException("SpawnManager: EndRound(): LevelTimerMessage is null [2]", true);
			
			if (gameoverMysticalParticles) gameoverMysticalParticles.SetActive(true);
			else gaLogException("SpawnManager: EndRound(): gameoverMysticalParticles is null", true);
			
			gaLogScreen("Game Over");
		}
		DestroyAllEnemies();
	}
}

static function EnemyKilled(isMiniBoss : boolean, isBoss : boolean) {
	enemiesKilledThisWave++;
	
	if (isBoss) {
		SetLevelScore(levelScore + bossKillScore);
		gaLogEvent("Achievement", "Killed Boss");
	} else if (isMiniBoss) {
		SetLevelScore(levelScore + miniBossKillScore);
		gaLogEvent("Achievement", "Killed Mini Boss");
	} else {
		SetLevelScore(levelScore + enemyKillScore);
	}
	
	megaKillCurrCount = (Time.time <= lastKillTime + megaKillIntervalB ? megaKillCurrCount + 1 : 0);
	lastKillTime = Time.time;
	
	if (megaKillCurrCount > 0) {
		if (LevelTimerMessage) LevelTimerMessage.SendMessage("ShowMegaKill", megaKillCurrCount);
		switch (megaKillCurrCount) {
			case 1:
				gaLogEvent("Achievement", "Double Kill");
			break;
			
			case 2:
				gaLogEvent("Achievement", "Triple Kill");
			break;
			
			default:
				gaLogEvent("Achievement", "Mega Kill");
		}
	}
}

static function BulletShot() {
	bulletsShotThisWave++;
	
//	SetLevelScore(levelScore + bulletUseScore);
}

function s4() {
    return Mathf.Floor((1 + Random.value) * 0x10000)
      .ToString()
      .Substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4();
}

static function gaLogScreen(screenName) {
	if (googleAnalytics) {
		googleAnalytics.LogScreen(screenName + "");
		googleAnalytics.LogScreen(screenName + ":" + sessionId);
	}
}

static function gaLogEvent(category, action) {
	if (googleAnalytics) {
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory(category).SetEventAction(action) );
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory(category + ":" + sessionId).SetEventAction(action) );
	}
}

static function gaLogException(message, fatal : boolean) {
	if (googleAnalytics) {
		googleAnalytics.LogException(message, fatal);
		googleAnalytics.LogException(message + ":" + sessionId, fatal);
	}
}