#pragma strict

/* dependencies */
var googleAnalytics : GoogleAnalyticsV3;
/* / */

//static var instance : BonusMessage;
var bonusMessageText : UI.Text;

@script RequireComponent(UI.Text)
function Start() {
//	instance = this;
	bonusMessageText = GetComponent(UI.Text);
	if (bonusMessageText) bonusMessageText.text = '';
	else if (googleAnalytics) googleAnalytics.LogException("BonusMessage: Start(): bonusMessageText is null", true);
}

function Show(bonuses : Array) {
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