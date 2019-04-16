/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/
mself=null;
Module.register('MMM-TT', {

	// Default values
	defaults: {
		showJams: true,						// Show Traffic jams
		showConstructions: true,			// Show Constructions
		showRadars: true,					// Show Radar controles
		preferredRoads: ['A1', 'A2'],				// Display only preferred roads - All is everything, other "A1",A2",..
		maxWidth: "500px",					// Max width wrapper
		animationSpeed: 1000, 				// fade in and out speed
		initialLoadDelay: 1000,
		retryDelay: 2500,
		updateInterval: 10 * 60 * 1000		// every 10 minutes
	},

	MTR: null,			
	// Create lists of jams, construction-zones and radar positions, with their road name	
	jams : [],
	constructions : [],
	radars : [],	
	// Define stylesheet
	getStyles: function () {
		return ["MMM-TT.css"];
	},  

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},
	
	start: function () {
    mself=this;
		Log.info("Starting module: " + this.name);
		requiresVersion: "2.1.0",	
			
		// Set locales
		this.url = "https://www.anwb.nl/feeds/gethf"
		this.MTR = [];			// <-- Create empty MyTraffic array
		this.scheduleUpdate();       	// <-- When the module updates (see below)
	},

	getDom: function () {
		
		// creating the wrapper
		var wrapper = document.createElement("div");
		wrapper.className = "wrapper";
		wrapper.style.maxWidth = this.config.maxWidth;
	
		// The loading sequence
    if (!this.loaded) {
            wrapper.innerHTML = "Loading....";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
    }	


/*		for (var road of MTR.roadEntries){
  			for (var jam of road.events.trafficJams){
			jams.push({name: road.road, jam})			
			}
  			for (var construction of road.events.roadWorks){
    			constructions.push({name: road.road,construction})
  			}
  			for (var radar of road.events.radars){
    			radars.push({name: road.road,radar})
  			}
		} */ 
	
		//Display Traffic Jam information
		if (this.config.showJams != false) {
	   for (var j of this.jams) {	
  			   
			var warnWrapper = document.createElement("div");
			var icon = document.createElement("div");
			icon.classList.add('trafficicon-jam', 'small-icon');
			var event = document.createElement("div");
			event.className = "description xsmall";
			var information = document.createElement("div");
			information.className = "description bold"
			if (typeof j.jam.startDate !== "undefined") {
				information.innerHTML = j.name + " - " + j.jam.startDate + " - " + (j.jam.distance/1000) + "KM";
				} else {
				information.innerHTML = j.name;
				}
			var description = document.createElement("div");
			description.className.add = "description xsmall";
			description.innerHTML = j.jam.description;
			var horLine = document.createElement("hr");
			event.appendChild(information);
			event.appendChild(description);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(event);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(horLine); 
		  }
	  }
			   
		//Display Traffic Camera (Radar) information
		if (this.config.showRadars != false) {		
		  for (var r of this.radars) {	
        var warnWrapper = document.createElement("div");
        var icon = document.createElement("div");
        icon.classList.add('trafficicon-camera', 'small-icon');
        var event = document.createElement("div");
        event.className = "description xsmall";
        var information = document.createElement("div");
        information.className = "description bold"
        information.innerHTML = r.radar.location;
        var description = document.createElement("div");
        description.className.add = "description xsmall";
        description.innerHTML = r.radar.description;
        var horLine = document.createElement("hr");
        event.appendChild(information);
        event.appendChild(description);
        warnWrapper.appendChild(icon);
        warnWrapper.appendChild(event);
        wrapper.appendChild(warnWrapper);
        wrapper.appendChild(horLine); 
		   }
		}
				
		//Display Traffic Constructions information
		if (this.config.showConstructions != false) {		
		  for (var c of this.constructions) {	
        var warnWrapper = document.createElement("div");
        var icon = document.createElement("div");
        icon.classList.add('trafficicon-construction', 'small-icon');
        var event = document.createElement("div");
        event.className = "description xsmall";
        var information = document.createElement("div");
        information.className = "description bold"
        information.innerHTML = c.name + " - " + c.construction.startDate + " t/m " + c.construction.stopDate;
        var description = document.createElement("div");
        description.className.add = "description xsmall";
        description.innerHTML = c.construction.description;
        var horLine = document.createElement("hr");
        event.appendChild(information);
        event.appendChild(description);
        warnWrapper.appendChild(icon);
        warnWrapper.appendChild(event);
        wrapper.appendChild(warnWrapper);
        wrapper.appendChild(horLine);
		   }
		}	
		return wrapper;
	}, // <-- closes the getDom function from above
		
	
	// this processes your data
	processTRAFFIC: function (data) { 
		mself.MTR = data; 
    mself.jams=[]
    mself.constructions=[]
    mself.radars=[]
    for (var road of mself.MTR.roadEntries){
      if(mself.config.preferredRoads === 'ALL' || road.road === mself.config.preferredRoads ||
      (typeof mself.config.preferredRoads ==='array' && mself.config.preferredRoads.includes(road.road))){ 
        for (var j1 of road.events.trafficJams){  
            Log.log("pushing entry for road="+ road.road)        
            mself.jams.push({name: road.road, jam:j1})
          }
        for (var construction of road.events.roadWorks){
          mself.constructions.push({name: road.road,construction:construction})
        }
        for (var radar of road.events.radars){
          mself.radars.push({name: road.road,radar:radar})
        }
      }
		}
//		console.log(mself.MTR); // uncomment to see if you're getting data (in dev console)
		mself.loaded = true;

	},
	
	// this tells module when to update
	scheduleUpdate: function () { 
		setInterval(() => {
		   this.getTRAFFIC();
		}, this.config.updateInterval);
		this.getTRAFFIC();
		var self = this;
	},
	  
	// this asks node_helper for data
	getTRAFFIC: function() { 
		this.sendSocketNotification('GET_MYTRAFFIC', this.url);
	},
	
	// this gets data from node_helper
	socketNotificationReceived: function(notification, payload) { 
		if (notification === "MYTRAFFIC_RESULT") {
		    this.processTRAFFIC(payload);
        mself.updateDom(100);
		}
		//this.updateDom(this.config.initialLoadDelay);
	},
});
