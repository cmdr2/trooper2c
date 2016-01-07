#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : Prompt;

/* globals */
private var MESSAGE_DISTANCE : float = 4.5f; // meters


/* scratchpad */
private var messageText : TextMesh;


@script RequireComponent(TextMesh)
function Start() {
	messageText = GetComponent(TextMesh);
	if (messageText) messageText.text = '';
}


public static function Instance() : Prompt {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(Prompt);
	}
	return instance;
}


/* 
countdownInfo = [ level : float, timeLeft : float ]
*/
public function ShowCountdown(countdownInfo : Array) {
	if (messageText) {
		var levelsLeft : int = countdownInfo[0];
		var timeLeft : int = countdownInfo[1];
		var levelText = (levelsLeft > 1 ? levelsLeft + ' levels remaining.' : "Final level!\nDon't chicken out now.\n");
		messageText.text = levelText + "\nLevel starts in " + timeLeft + '..';
	}
}


public function ShowRoundOver(gameover : boolean) {
	if (messageText) {
		if (Random.value > 0.5) {
			messageText.text = (gameover ? "You're zombie chow!\n\nFor guns 'n glory: pull trigger\nFor work and worry: escape" : "For guns 'n glory: pull trigger\nFor work and worry: escape");
		} else {
			messageText.text = (gameover ? "Aw crap!\n\nHeroes: pull trigger\nQuitters: escape" : "Heroes: pull trigger\nQuitters: escape");
		}
	}
}


public function ShowMegaKill(killCount : int) {
	switch (killCount) {
		case 1:
			if (messageText) messageText.text = "Double Kill!";
			
			yield WaitForSeconds(0.9);
			Hide();
		break;
		
		case 2:
			if (messageText) messageText.text = "Triple Kill!";
			
			yield WaitForSeconds(0.9);
			Hide();
		break;
		
		default:
			if (messageText) messageText.text = "Mega Kill!";
			
			yield WaitForSeconds(0.9);
			Hide();
	}
}


public function Hide() {
	if (messageText) {
		messageText.text = '';
	}
}


public function SetActive(state : boolean) {
	messageText.gameObject.SetActive(state);
}