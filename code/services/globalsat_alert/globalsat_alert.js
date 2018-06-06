function globalsat_alert(req, resp){
    //This erases the messages from the messagequeue to prevent overrunning storage on the micro instance.
    //Executed via a timer every 24 hours.
    var fName = "CodeService-globalsat_alert";
    log(fName + " triggered");
    
    ClearBlade.init({request: req});
    var msg = ClearBlade.Messaging();
    var msgTopic = "new_location";

    var callback = function (err, data) {
        if (err) {
            var errMsg = fname + " ERROR: " + JSON.stringify(data);
            log(errMsg);
            resp.error(errMsg);
        } else {
            // TODO: check body for data.event against "help", "fall_advisory", "low_battery" to create alerts on Portal
            if (data.length > 0) {
                resp.success(data);
            } else {
                resp.success("No data to retrieve");
            }
        }
    };
    
    var timeStamp = new Date().getTime() / 1000;
    var count = 10;
    log("Calling getMsgHistory with " + timeStamp);
    msg.getMsgHistory(msgTopic, timeStamp, count, callback);
}