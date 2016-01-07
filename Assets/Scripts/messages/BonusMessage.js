#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : BonusMessage;

/* globals */
private static var MESSAGE_DISTANCE : float = 4.5f; // meters


/* scratchpad */
private var bonusMessageText : TextMesh;


@script RequireComponent(TextMesh)
function Start() {
	bonusMessageText = GetComponent(TextMesh);
	if (bonusMessageText) bonusMessageText.text = '';
}


public static function Instance() : BonusMessage {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(BonusMessage);
	}
	return instance;
}


public function Show(bonuses : Array) {
	if (bonusMessageText) {
		bonusMessageText.text = 'Skill Bonus: ' + bonuses[0] + "!\n" +
								'Difficulty Bonus: ' + bonuses[1];
	}
}


public function Hide() {
	if (bonusMessageText) {
		bonusMessageText.text = '';
	}
}