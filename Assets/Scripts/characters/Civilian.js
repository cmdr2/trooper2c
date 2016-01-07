#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

/* globals */
private static var MOVE_SPEED : float = 0.35;


/* scratchpad */
private var moveDir : int = -1;
private var origX = -1;


function Start () {
	origX = transform.position.x;
}


function FixedUpdate () {
	transform.position -= Vector3(MOVE_SPEED * moveDir, 0, 0);
	if (Mathf.Abs(transform.position.x - origX) > 180) {
		Destroy(this.gameObject);
	}
}


public function SetMoveDir(dir) {
	moveDir = dir;
}