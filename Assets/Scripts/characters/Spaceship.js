#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

/* globals */
private static var MOVE_SPEED : float = 4;
private static var Z_TRANSLATE : int = 0;
private static var X_TRANSLATE : int = 1;


/* scratchpad */
private var mode : int = Z_TRANSLATE;


function Start () {
	Reset();
}


function FixedUpdate () {
	if (mode == Z_TRANSLATE) {
		transform.position -= Vector3(0, 0, MOVE_SPEED);
		if (transform.position.z < -1600) {
			Reset();
		}
	} else {
		transform.position -= Vector3(MOVE_SPEED, 0, 0);
		if (transform.position.x < -1600) {
			Reset();
		}
	}
}


private function Reset() {
	var d : float = Random.Range(-150, 150);

	if (Random.value > 0.5) {
		mode = X_TRANSLATE;
		transform.position = Vector3(800, Random.Range(100, 800), d);
	} else {
		mode = Z_TRANSLATE;
		transform.position = Vector3(d, Random.Range(100, 800), 800);
	}
}