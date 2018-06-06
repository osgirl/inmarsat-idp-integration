
function time(unix_timestamp) {
    return new Date(unix_timestamp * 1e3).toISOString();
}

function roundToSix(num) {    
    return +(Math.round(num + "e+6")  + "e-6");
}

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    var hex = array[i].toString(16).toUpperCase();
    if (hex.length < 2) hex = '0' + hex;
    result += hex;
  }
  log("bin2String:result=" + result);
  return result;
}

var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	decode: function (input) {
		// remove b64 padding
		log("Base64Binary:decode:parsing: " + input);
		input = input.replace("=", "");

		var bytes = parseInt((input.length / 4) * 3, 10);
		//log("Base64Binary:decode:bytes=" + bytes);
		
		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;
		
		uarray = new Uint8Array(bytes);
		
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}
		
		return uarray;	
	}
};

function getModemLocation(mobile_id, msgPayload) {
    
    log("Called getModemLocation");
    
    var location = {
        "mobile_id": mobile_id,
    };
    
    var fields = JSON.parse(msgPayload).Fields;
    for (var f=0; f < fields.length; f++) {
        log("Assessing field name: " + fields[f].Name + " | value: " + fields[f].Value);
        switch (fields[f].Name) {
            case "timestamp":
                location.timestamp = time(fields[f].Value);
                break;
            case "latitude":
                location.lat = roundToSix(Number(fields[f].Value) / 60000);  //TODO: round to 6 decimal places
                break;
            case "longitude":
                location.lng = roundToSix(Number(fields[f].Value) / 60000);
                break;
            case "altitude":
                location.alt = Number(fields[f].Value);
                break;
            case "speed":
                location.spd = Number(fields[f].Value);
                break;
            case "heading":
                location.hdg = Number(fields[f].Value) * 2;
                break;
            default:
                log("Unknown field: " + fields[f].Name);
        }
    }
    log("getModemLocation returning:" + JSON.stringify(location));
    return location;
}

function getGlobalSatLocation(timestamp, msgPayload) {
    
    log("Called getGlobalSatLocation");
    
    var location = {
        "alt": 0,
        "spd": 0,
        "hdg": 0,
    };
    
    var fields = JSON.parse(msgPayload).Fields;
    for (var f=0; f < fields.length; f++) {
        log("Assessing field name: " + fields[f].Name + " | value: " + fields[f].Value);
        switch (fields[f].Name) {
            case "lora_mac":
                //var byteArray = Base64Binary.decode(fields[f].Value);
                location.mobile_id = bin2String(Base64Binary.decode(fields[f].Value));
                break;
            case "timestamp":
                location.timestamp = time(fields[f].Value);
                break;
            case "latitude":
                location.lat = roundToSix(Number(fields[f].Value) / 1000000);  //TODO: round to 6 decimal places
                break;
            case "longitude":
                location.lng = roundToSix(Number(fields[f].Value) / 1000000);
                break;
            case "altitude":
                location.alt = Number(fields[f].Value);
                break;
            case "speed":
                location.spd = Number(fields[f].Value);
                break;
            case "heading":
                location.hdg = Number(fields[f].Value) * 2;
                break;
            case "battery_level":
                location.bat = Number(fields[f].Value);
                break;
            case "report_type":
                switch (fields[f].Value) {
                    case "periodic":
                        location.event = "PeriodicReport";
                        break;
                    case "motion_static":
                        location.event = "MotionStatic";
                        break;
                    case "motion_moving":
                        location.event = "MotionMoving";
                        break;
                    case "motion_start":
                        location.event = "MotionStart";
                        break;
                    case "motion_stop":
                        location.event = "MotionStop";
                        break;
                    case "low_battery":
                        location.event = "LowBattery";
                        break;
                    case "power_off_bat":
                        location.event = "PowerOffBattery";
                        break;
                    case "fall_advisory":
                        location.event = "Fall";
                        break;
                    case "power_off_temp":
                        location.event = "PowerOffTemp";
                        break;
                    case "power_on_temp":
                        location.event = "PowerOnTemp";
                        break;
                    case "help":
                        location.event = "Help"
                        break;
                }
            default:
                log("Unknown field: " + fields[f].Name);
        }
    }
    log("getGlobalSatLocation returning:" + JSON.stringify(location));
    return location;
}

function unixTsToRfc(unixtimestamp) {
    // TODO unix conversion to readable
}