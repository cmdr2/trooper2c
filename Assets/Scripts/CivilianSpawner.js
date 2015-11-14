﻿#pragma strict

/* dependencies */
public var Civilian : GameObject;


/* globals */
private static var COUNT : int = 10;
private static var SPAWN_INTERVAL : float = 5; // seconds


/* scratchpad */
private var nextSpawnTime : float = -1; // seconds


function Start () {
}

function Spawn() {
	var moveDir;
	var x;
	for (var i = 0; i < COUNT; i++) {
		moveDir = 1;
		if (Random.value > 0.5) {
			moveDir = -1;
		}
		x = 0;
		if (moveDir == 1) {
			x = Random.Range(27, 35);
		} else {
			x = Random.Range(-85, -105);
		}
		
		var pos : Vector3 = Vector3(x, 2, Random.Range(-163, -219));
		var civilian : GameObject = Instantiate(Civilian, pos, Quaternion.identity);
		civilian.SendMessage("SetMoveDir", moveDir);
		civilian.transform.parent = transform;
	}
	
	for (i = 0; i < COUNT; i++) {
		moveDir = 1;
		if (Random.value > 0.5) {
			moveDir = -1;
		}
		x = 0;
		if (moveDir == 1) {
			x = Random.Range(75, 92);
		} else {
			x = Random.Range(-110, -130);
		}
		
		pos = Vector3(x, 2, Random.Range(140, 167));
		civilian = Instantiate(Civilian, pos, Quaternion.identity);
		civilian.SendMessage("SetMoveDir", moveDir);
		civilian.transform.parent = transform;
	}
}


function Update () {
	if (Time.time > nextSpawnTime) {
		nextSpawnTime = Time.time + Random.Range(SPAWN_INTERVAL - 2, SPAWN_INTERVAL + 2);
		Spawn();
	}
}