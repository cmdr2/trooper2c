#pragma strict

/* dependencies */
var fpsCounter : UI.Text;

/* globals */
var updateInterval = 0.5;

/* scratchpad */
private var showFPS : boolean = false;

private var accum = 0.0; // FPS accumulated over the interval
private var frames = 0; // Frames drawn over the interval
private var timeleft : float; // Left time for current interval

private var badFrames : Hashtable = new Hashtable(); // keyed off timeCounter

@script RequireComponent(UI.Text)
function Start () {
	fpsCounter = GetComponent(UI.Text);
	timeleft = updateInterval;
}

function Update () {
	if (Input.GetKeyDown(KeyCode.F)) {
		showFPS = !showFPS;
	}

	timeleft -= Time.deltaTime;
    accum += Time.timeScale/Time.deltaTime;
    ++frames;
 
    // Interval ended - update GUI text and start new interval
    if (timeleft <= 0.0) {
        var fps : float = (accum/frames);
        var tc : int = Mathf.FloorToInt(Time.time);
        
        if (fps < 57) {
        	if (badFrames.ContainsKey(tc)) {
        		var x : Array = badFrames[tc];
        		x.Push(fps.ToString("f1"));
        		badFrames[tc] = x;
        	} else {
        		x = Array();
        		x[0] = fps.ToString("f1");
        		badFrames[tc] = x;
        	}
        }
		if (tc != 0 && tc % 30 == 0 && MetricsLevel.level.CompareTo(MetricsLevel.VERBOSE) == 0) {
			EnemySpawnManager.gaLogEvent("Application", "BadFrames@" + tc + ":" + getBadFrames());
		}
        
        if (fpsCounter && showFPS) fpsCounter.text = fps.ToString("f1") + " fps";
        timeleft = updateInterval;
        accum = 0.0;
        frames = 0;
    }
    
    if (!showFPS) {
    	fpsCounter.text = "";
    }
}

private function getBadFrames() {
	var fData = "{";
	for (var i = 0; i < 600; i++) {
		if (badFrames.ContainsKey(i)) {
			fData += i + ': "' + badFrames[i] + '",';
		}
	}
	fData += "}";
	return fData;
}