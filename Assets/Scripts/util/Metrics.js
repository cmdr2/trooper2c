#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

import System.IO;
import System.Collections.Generic;
import System.Text;

/* globals */
private static var PLAYER_FILE = "Player";


/* scratchpad */
private static var googleAnalytics : GoogleAnalyticsV3;
private static var sessionId = "";
private static var userId = "";


function Start () {
	googleAnalytics = GetComponent(GoogleAnalyticsV3);
	googleAnalytics.StartSession();
	
	PLAYER_FILE = Application.persistentDataPath + Path.DirectorySeparatorChar + "Player";
	
	sessionId = guid();
	
	if (File.Exists(PLAYER_FILE)) {
		var sr = new StreamReader(PLAYER_FILE);
		userId = sr.ReadLine();
		if (googleAnalytics) {
			LogEvent("Application", "ReturnUser");
		}
	}
	
	if (userId.Trim().Equals("")) {
		userId = "U" + guid();
		var sw = new StreamWriter(PLAYER_FILE);
		sw.Write(userId);
		sw.Close();
	}
	
	var t : System.TimeSpan = System.DateTime.UtcNow - new System.DateTime(1970, 1, 1);
	var secondsSinceEpoch : int = t.TotalSeconds;
	if (googleAnalytics) {
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory("UserSessions").SetEventAction(userId).SetEventValue(1) );
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory("Sessions").SetEventAction(secondsSinceEpoch + ":" + googleAnalytics.bundleVersion + ":" + userId + ":" + sessionId) );
		LogEvent("Application", "Platform-" + Application.platform);
	}
}


/* utilities */
private function s4() {
    return Mathf.Floor((1 + Random.value) * 0x10000)
      .ToString()
      .Substring(1);
}

private function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4();
}


public static function LogScreen(screenName) {
	if (googleAnalytics) {
		googleAnalytics.LogScreen(screenName + "");
		googleAnalytics.LogScreen(screenName + ":" + sessionId);
	}
}


public static function LogEvent(category, action) {
	if (googleAnalytics) {
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory(category).SetEventAction(action) );
		googleAnalytics.LogEvent( new EventHitBuilder().SetEventCategory(category + ":" + sessionId).SetEventAction(action) );
	}
}


public static function LogException(message, fatal : boolean) {
	if (googleAnalytics) {
		googleAnalytics.LogException(message, fatal);
		googleAnalytics.LogException(message + ":" + sessionId, fatal);
	}
}