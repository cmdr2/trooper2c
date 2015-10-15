#pragma strict

/* globals */
private static var METRICS_LEVEL_URL = "http://me.cmdr2.org/Trooper-2c/metrics_level";
public static var VERBOSE = "verbose";
public static var NORMAL = "normal";

/* scratchpad */
public static var level : String = NORMAL;

function Start () {
	var www : WWW = new WWW(METRICS_LEVEL_URL);
	
	yield www;
	
	if (www.text.CompareTo(VERBOSE) == 0) {
		level = VERBOSE;
	} else if (www.text.CompareTo(NORMAL) == 0) {
		level = NORMAL;
	}
}