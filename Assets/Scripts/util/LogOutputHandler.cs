using UnityEngine;
using System.Collections;

namespace util {

	public class LogOutputHandler : MonoBehaviour {
		/* globals */
		private static bool ENABLE_DEBUG_LOGS = false;

		
		//Register the HandleLog function on scene start to fire on debug.log events 
		void Awake(){
			Application.logMessageReceived += HandleLog;
		} 
		
		//Create a string to store log level in
		string level = "";
		
		//Capture debug.log output, send logs to Loggly
		public void HandleLog(string logString, string stackTrace, LogType type) {
			if ((type.Equals (LogType.Log) || type.Equals(LogType.Warning)) && !ENABLE_DEBUG_LOGS) {
				return;
			}

			//Initialize WWWForm and store log level as a string
			level = type.ToString ();
			var loggingForm = new WWWForm();
			
			//Add log message to WWWForm
			loggingForm.AddField("LEVEL", level);
			loggingForm.AddField("Message", logString);
			loggingForm.AddField("Stack_Trace", stackTrace);
			
			//Add any User, Game, or Device MetaData that would be useful to finding issues later 
			loggingForm.AddField("Device_Model", SystemInfo.deviceModel);
			
			//Send WWW Form to Loggly, replace TOKEN with your unique ID from Loggly
			var sendLog = new WWW("http://logs-01.loggly.com/inputs/" + LogglyCredential.TOKEN + "/tag/Unity3D/", loggingForm);
		}
	}

}