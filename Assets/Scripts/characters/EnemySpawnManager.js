#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : EnemySpawnManager;

/* dependencies */
public var Enemy : GameObject;
public var BossEnemy : GameObject;
public var MiniBossEnemy : GameObject;
public var MegaBossEnemy : GameObject;


/* globals */
private static var SPAWN_MONITOR_INTERVAL = 1; // seconds
private static var MEGAKILL_INTERVAL : float = 0.25; // seconds
private static var ENEMY_KILL_SCORE : int = 12;
private static var BOSS_KILL_SCORE : int = 150;
private static var MINIBOSS_KILL_SCORE : int = 50;


/* scratchpad */
private var enemies = Array();
private var enemiesSpawnedThisWave : float = 10;
private var enemiesKilledThisWave : float = 0;
private var bulletsShotThisWave : float = 0;
private var enemyCountThisWave : int = 0;

private var megaKillCurrCount : int = 0;
private var lastKillTime : float = 0;

private var nextSpawnMonitorTime = 0;
public var levelScore : int = 0;

private var isSpawning = 0;


public static function Instance() : EnemySpawnManager {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(EnemySpawnManager);
	}
	return instance;
}


function FixedUpdate () {
	if (Time.time > nextSpawnMonitorTime) {
		nextSpawnMonitorTime = Time.time + SPAWN_MONITOR_INTERVAL;
		
		if (enemiesKilledThisWave >= enemiesSpawnedThisWave) {
			var t : int = enemiesKilledThisWave;
			enemiesKilledThisWave = 0;
			
			GameManager.Instance().LevelComplete(t, enemiesSpawnedThisWave, enemyCountThisWave, bulletsShotThisWave);
		}
	}
}


public function SpawnWave(level : int) {
	var enemyCount : int = LevelInfo.GetSpawnCount(level);
	var spawnRadius : Array = LevelInfo.GetSpawnRadius(level);
	enemyCountThisWave = enemyCount;
	
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
			
			var enemy : GameObject = Instantiate(Enemy, position, rotation);
			
			if (enemy) {
				if (enemies) enemies.Push(enemy);
				else Metrics.LogException("SpawnManager: NewWave(): enemies is null [1]", true);
			} else {
				Metrics.LogException("SpawnManager: NewWave(): Enemy instantiated is null", true);
			}
		}
	}
	
	// spawn boss at farthest point in level 7
	if (BossEnemy && level == 7) {
		var bossAngle = Random.Range(0, 2 * Mathf.PI);
		var bossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(bossAngle), 10.3, float.Parse(spawnRadius[1]) * Mathf.Sin(bossAngle));
		var boss : GameObject = Instantiate(BossEnemy, bossPosition, Quaternion.identity);
		
		if (boss) boss.SendMessage("SetBossMode");
		else Metrics.LogException("SpawnManager: NewWave(): boss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(boss);
	}
	
	// spawn megaboss at farthest point in level 14
	if (MegaBossEnemy && level == 14) {
		var megabossAngle = Random.Range(0, 2 * Mathf.PI);
		var megabossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(megabossAngle), 11, float.Parse(spawnRadius[1]) * Mathf.Sin(megabossAngle));
		var megaboss : GameObject = Instantiate(MegaBossEnemy, megabossPosition, Quaternion.identity);
		
		if (megaboss) megaboss.SendMessage("SetBossMode");
		else Metrics.LogException("SpawnManager: NewWave(): boss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(megaboss);
	}
	
	// spawn boss at farthest point in level 4
	if (MiniBossEnemy && (level == 4 || level == 10)) {
		var minibossAngle = Random.Range(0, 2 * Mathf.PI);
		var minibossPosition : Vector3 = Vector3(float.Parse(spawnRadius[1]) * Mathf.Cos(minibossAngle), 0.1, float.Parse(spawnRadius[1]) * Mathf.Sin(minibossAngle));
		var miniboss : GameObject = Instantiate(MiniBossEnemy, minibossPosition, Quaternion.identity);
		
		if (miniboss) miniboss.SendMessage("SetMiniBossMode");
		else Metrics.LogException("SpawnManager: NewWave(): miniboss is null", true);
		
		enemiesSpawnedThisWave++;
		
		if (enemies) enemies.Push(miniboss);
	}
	
	SetLevelScore(0);
}


private function SetLevelScore(score : int) {
	levelScore = (score < 0 ? 0 : score);
	
	Score.Instance().SetLevelScore(levelScore);
}


public function DestroyAllEnemies() {
	if (enemies) {
		for (var enemy : GameObject in enemies) {
			Destroy(enemy);
		}
	}
	
	enemies = Array();
}


public function EnemyKilled(isMiniBoss : boolean, isBoss : boolean) {
	print(enemies.length);
	enemiesKilledThisWave++;

	if (isBoss) {
		SetLevelScore(levelScore + BOSS_KILL_SCORE);
		Metrics.LogEvent("Achievement", "Killed Boss");
	} else if (isMiniBoss) {
		SetLevelScore(levelScore + MINIBOSS_KILL_SCORE);
		Metrics.LogEvent("Achievement", "Killed Mini Boss");
	} else {
		SetLevelScore(levelScore + ENEMY_KILL_SCORE);
	}
	
	megaKillCurrCount = (Time.time <= lastKillTime + MEGAKILL_INTERVAL ? megaKillCurrCount + 1 : 0);
	lastKillTime = Time.time;
	
	if (megaKillCurrCount > 0) {
		Prompt.Instance().ShowMegaKill(megaKillCurrCount);
		switch (megaKillCurrCount) {
			case 1:
				Metrics.LogEvent("Achievement", "Double Kill");
			break;
			
			case 2:
				Metrics.LogEvent("Achievement", "Triple Kill");
			break;
			
			default:
				Metrics.LogEvent("Achievement", "Mega Kill");
		}
	}
}

public function BulletShot() {
	bulletsShotThisWave++;
}