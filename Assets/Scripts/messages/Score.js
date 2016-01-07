#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var instance : Score;

/* scratchpad */
private var scoreText : TextMesh;
private var score : int = 0;
private var levelScore : int = 0;
private var lives : int = 0;


@script RequireComponent(TextMesh)
function Start () {
	scoreText = GetComponent(TextMesh);
	Render();
}


public static function Instance() : Score {
	if (instance == null) {
		instance = UnityEngine.Object.FindObjectOfType(Score);
	}
	return instance;
}


public function AddScore(amount : int) {
	SetScore(score + amount);
}


public function AddLives(amount : int) {
	SetLives(lives + amount);
}


public function SetScore(amount : int) {
	score = (amount < 0 ? 0 : amount);
	Render();
}


public function SetLevelScore(amount : int) {
	levelScore = (amount < 0 ? 0 : amount);
	Render();
}


public function SetLives(amount : int) {
	lives = (amount < 0 ? 0 : amount);
	Render();
}


private function Render() {
	if (scoreText) {
		if (score + levelScore > 0) {
			scoreText.text = 'Score: ' + (score + levelScore);
		} else {
			scoreText.text = '';
		}
	} else {
		Metrics.LogException("Score: Render(): scoreText is null", true);
	}
}