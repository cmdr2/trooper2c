#pragma strict

var scoreText : UI.Text;

/* dependencies */
var googleAnalytics : GoogleAnalyticsV3;
/* / */

//static var instance : Score;

var score : int = 0;
var levelScore : int = 0;
var lives : int = 0;

@script RequireComponent(UI.Text)
function Start () {
	scoreText = GetComponent(UI.Text);
//	instance = this;
	Render();
}

function AddScore(amount : int) {
	SetScore(score + amount);
}

function AddLives(amount : int) {
	SetLives(lives + amount);
}

function SetScore(amount : int) {
	score = (amount < 0 ? 0 : amount);
	Render();
}

function SetLevelScore(amount : int) {
	levelScore = (amount < 0 ? 0 : amount);
	Render();
}

function SetLives(amount : int) {
	lives = (amount < 0 ? 0 : amount);
	Render();
}

function Render() {
	if (scoreText) {
		scoreText.text = 'Score: ' + (score + levelScore);// + "\n" +
						 //'Lives: ' + lives;
	} else if (googleAnalytics) {
		googleAnalytics.LogException("Score: Render(): scoreText is null", true);
	}
}