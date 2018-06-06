function message_publishPolygons(req, resp){
    ClearBlade.init(req);
    var msg = ClearBlade.Messaging();
    var callback = function (err, data) {
        if (err) {
        	resp.error("fetch error : " + JSON.stringify(data));
        } else {
            msg.publish(GEOFENCETOPIC, JSON.stringify(data.DATA));
        }
    };

   	var col = ClearBlade.Collection({collectionName:GEOFENCETABLE});
    col.fetch(callback);
}