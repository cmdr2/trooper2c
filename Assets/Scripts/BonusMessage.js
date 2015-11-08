#pragma strict

/* dependencies */
public var googleAnalytics : GoogleAnalyticsV3;


/* globals */
private var MESSAGE_DISTANCE : float = 4.5f; // meters


/* scratchpad */
private var bonusMessageText : TextMesh;
private var cam : GameObject;


@script RequireComponent(TextMesh)
function Start() {
	bonusMessageText = GetComponent(TextMesh);
	cam = GameObject.Find("Main Camera Right");
	if (bonusMessageText) bonusMessageText.text = '';
	else if (googleAnalytics) googleAnalytics.LogException("BonusMessage: Start(): bonusMessageText is null", true);
}

function Show(bonuses : Array) {
	/*if (cam) {
		var ray : Ray = new Ray(cam.transform.position, cam.transform.forward);
		transform.position = ray.GetPoint(MESSAGE_DISTANCE);
		transform.LookAt(cam.transform.position);
		transform.RotateAround(transform.position, transform.up, 180);
	}*/
	if (bonusMessageText) {
		bonusMessageText.text = 'Skill Bonus: ' + bonuses[0] + "!\n" +
								'Difficulty Bonus: ' + bonuses[1];
	} else if (googleAnalytics) {
		googleAnalytics.LogException("BonusMessage: Show(): bonusMessageText is null", true);
	}
}

function Hide() {
	if (bonusMessageText) {
		bonusMessageText.text = '';
	} else if (googleAnalytics) {
		googleAnalytics.LogException("BonusMessage: Hide(): bonusMessageText is null", true);
	}
}