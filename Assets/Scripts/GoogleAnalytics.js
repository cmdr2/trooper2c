#pragma strict

var googleAnalytics : GoogleAnalyticsV3;

function Start () {
	if (googleAnalytics) googleAnalytics.StartSession();
}