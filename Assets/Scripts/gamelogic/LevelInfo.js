#pragma strict

/**
 * @author: cmdr2 <secondary.cmdr2@gmail.com>
 */

private static var levelInfo : Array = Array(
	Array(3, Array("24", "30"), 0),
	Array(5, Array("24", "30"), 20),
	Array(7, Array("24", "30"), 30),
	Array(7, Array("24", "34"), 80),
	Array(11, Array("24", "31"), 110),
	Array(13, Array("25", "31"), 205),
	Array(14, Array("25", "35"), 300),
	Array(9, Array("20", "26"), 0),
	Array(15, Array("20", "26"), 40),
	Array(18, Array("21", "28"), 60),
	Array(20, Array("19", "32"), 160),
	Array(22, Array("18", "38"), 220),
	Array(24, Array("17", "40"), 410),
	Array(28, Array("20", "46"), 600)
);


public static function GetSpawnCount(levelNumber : int) : int {
	var l : Array = levelInfo[levelNumber - 1];
	return l[0];
}


public static function GetSpawnRadius(levelNumber : int) : Array {
	var l : Array = levelInfo[levelNumber - 1];
	return l[1];
}


public static function GetMagicDifficultyBonus(levelNumber : int) : int {
	var l : Array = levelInfo[levelNumber - 1];
	return l[2];
}