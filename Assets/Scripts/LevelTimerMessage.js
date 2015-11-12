#pragma strict

/* dependencies */
public var endgameBloodSplatter : GameObject;
public var googleAnalytics : GoogleAnalyticsV3;


/* globals */
private var MESSAGE_DISTANCE : float = 4.5f; // meters


/* scratchpad */
private var levelMessageText : TextMesh;
private var cam : GameObject;


@script RequireComponent(TextMesh)
function Start() {
	levelMessageText = GetComponent(TextMesh);
	cam = GameObject.Find("Main Camera Right");
	if (levelMessageText) levelMessageText.text = '';
}

/* 
countdownInfo = [ level : float, timeLeft : float ]
*/
function ShowCountdown(countdownInfo : Array) {
	SetPosition();
	if (levelMessageText) {
		var levelsLeft : int = countdownInfo[0];
		var timeLeft : int = countdownInfo[1];
		var levelText = (levelsLeft > 1 ? levelsLeft + ' levels remaining.' : "Final level!\nDon't chicken out now.\n");
		levelMessageText.text = levelText + "\nLevel starts in " + timeLeft + '..';
	} else if (googleAnalytics) {
		googleAnalytics.LogException("LevelTimerMessage: ShowCountdown(): levelMessageText is null", true);
	}
}

@script RequireComponent(AudioSource)
function ShowRoundOver(gameover : boolean) {
	SetPosition();
	if (levelMessageText) {
		if (Random.value > 0.5) {
			levelMessageText.text = (gameover ? "You're zombie chow!\n\nFor guns 'n glory: pull trigger\nFor work and worry: escape" : "For guns 'n glory: pull trigger\nFor work and worry: escape");
		} else {
			levelMessageText.text = (gameover ? "Aw crap!\n\nHeroes: pull trigger\nQuitters: escape" : "Heroes: pull trigger\nQuitters: escape");
		}
	} else if (googleAnalytics) {
		googleAnalytics.LogException("LevelTimerMessage: ShowRoundOver(): levelMessageText is null", true);
	}
	
	if (endgameBloodSplatter) endgameBloodSplatter.SetActive(true);
	else if (googleAnalytics) googleAnalytics.LogException("LevelTimerMessage: ShowRoundOver(): endgameBloodSplatter is null", false);
	
	if (GetComponent.<AudioSource>()) GetComponent.<AudioSource>().Play();
	else if (googleAnalytics) googleAnalytics.LogException("LevelTimerMessage: ShowRoundOver(): audio is null", false);
}

function ShowMegaKill(killCount : int) {
	SetPosition();
	switch (killCount) {
		case 1:
			if (levelMessageText) levelMessageText.text = "Double Kill!";
			else if (googleAnalytics) googleAnalytics.LogException("LevelTimerMessage: ShowMegaKill(): levelMessageText is null [1]", true);
			
			yield WaitForSeconds(0.9);
			Hide();
		break;
		
		case 2:
			if (levelMessageText) levelMessageText.text = "Triple Kill!";
			else if (googleAnalytics) googleAnalytics.LogException("LevelTimerMessage: ShowMegaKill(): levelMessageText is null [2]", true);
			
			yield WaitForSeconds(0.9);
			Hide();
		break;
		
		default:
			if (levelMessageText) levelMessageText.text = "Mega Kill!";
			else if (googleAnalytics) googleAnalytics.LogException("LevelTimerMessage: ShowMegaKill(): levelMessageText is null [3]", true);
			
			yield WaitForSeconds(0.9);
			Hide();
	}
}

private function SetPosition() {
	/*if (cam) {
		var ray : Ray = new Ray(cam.transform.position, cam.transform.forward);
		transform.position = ray.GetPoint(MESSAGE_DISTANCE);
		transform.LookAt(cam.transform.position);
		transform.RotateAround(transform.position, transform.up, 180);
	}*/
}

function Hide() {
	if (levelMessageText) {
		levelMessageText.text = '';
	} else if (googleAnalytics) {
		googleAnalytics.LogException("LevelTimerMessage: Hide(): levelMessageText is null", true);
	}
}