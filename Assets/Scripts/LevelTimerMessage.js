#pragma strict

/* dependencies */
var endgameBloodSplatter : GameObject;

var googleAnalytics : GoogleAnalyticsV3;
/* / */

//static var instance : LevelTimerMessage;
var levelMessageText : UI.Text;

@script RequireComponent(UI.Text)
function Start() {
//	instance = this;
	levelMessageText = GetComponent(UI.Text);
	if (levelMessageText) levelMessageText.text = '';
}

/* 
countdownInfo = [ level : float, timeLeft : float ]
*/
function ShowCountdown(countdownInfo : Array) {
	if (levelMessageText) {
		var levelsLeft : int = countdownInfo[0];
		var levelText = (levelsLeft > 1 ? levelsLeft + ' levels remaining.' : "Final level!\nDon't chicken out now.\n");
		levelMessageText.text = levelText + "\nLevel starts in " + countdownInfo[1] + '..';
	} else if (googleAnalytics) {
		googleAnalytics.LogException("LevelTimerMessage: ShowCountdown(): levelMessageText is null", true);
	}
}

@script RequireComponent(AudioSource)
function ShowRoundOver(gameover : boolean) {
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

function Hide() {
	if (levelMessageText) {
		levelMessageText.text = '';
	} else if (googleAnalytics) {
		googleAnalytics.LogException("LevelTimerMessage: Hide(): levelMessageText is null", true);
	}
}