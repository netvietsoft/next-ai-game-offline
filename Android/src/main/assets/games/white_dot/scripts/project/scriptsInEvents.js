


const scriptsInEvents = {

	async Js_event_Event7_Act1(runtime, localVars)
	{
		Android["levelStartInGame"](runtime.globalVars.Levels);
		
	},

	async Js_event_Event11_Act1(runtime, localVars)
	{
		Android["levelCompleteInGame"](runtime.globalVars.Levels);
		
	},

	async Js_event_Event15_Act1(runtime, localVars)
	{
		Android["levelLoseInGame"](runtime.globalVars.Levels);
		
	},

	async Js_event_Event19_Act1(runtime, localVars)
	{
		Android["levelRestartInGame"](runtime.globalVars.Levels);
		
	},

	async Js_event_Event23_Act1(runtime, localVars)
	{
		Android["gameLoaded"]()
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

