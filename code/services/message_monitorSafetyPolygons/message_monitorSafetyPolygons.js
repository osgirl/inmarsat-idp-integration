//var testPayload="{\"name\":\"3c:ce:5f:c9:c8:06\",\"firstname\":\"Terry\",\"lastname\":\"Boon\",\"phone\":\"303-912-9535\",\"lat\":41.15,\"long\":-100.828,\"icon\":\"https://image.flaticon.com/icons/svg/10/10522.svg\",\"lastupdate\":\"2017-10-24T03:24:28.044Z\"}";
var _assetData, _assetPoint;
var SENDALERTS=true;
function message_monitorSafetyPolygons(req, resp){
    //Environment Setup
    ClearBlade.init(req);
    log("message_monitorSafetyPolygons");
    _resp=resp;
    var geoObj = new geo('polar');
    //_assetData=JSON.parse(testPayload);
    _assetData=JSON.parse(req.params.body);
    //log(_assetData);
    //Asset Point
    log(JSON.stringify(_assetData));
    _assetPoint=geoObj.Point(_assetData.lat, _assetData.lng);

    //Build Polygons
    var query = ClearBlade.Query({collectionName:GEOFENCETABLE});
    query.fetch(function(err, data){
        if(err) {
            log("Error: " + data);
            _resp.error(data);
        }
        else {
            //log(data);
            polygons={};
            for (var i=0;i<data.DATA.length;i++) {
                var p=JSON.parse(data.DATA[i].polygon);
                var points=[];
                for (var j=0;j<p.length;j++){
                    points.push(geoObj.Point(p[j][1], p[j][0]));
                }
                log(JSON.stringify(points));
                if (geoObj.Within(geoObj.Polygon(points),_assetPoint)) {
                    var msg = ClearBlade.Messaging();
                    _assetData.areaname=data.DATA[i].name;
                    log('alert');
                    msg.publish("alert/"+data.DATA[i].name, JSON.stringify(_assetData));
                    smsMsg="Area Encroachment: " + _assetData.areaname;
                    //sendSMS(smsMsg);
                }
            }
            //_resp.success(polygons);
        }
    });
}

function sendSMS(msg){
    // TODO Send SMS 
}