var getErrorDefinition = function(id) {
    
    var fName = "CodeLib-getErrorDefinition";
    log (fName + " called for " + id);
    
    var coll = "idp_api_error_codes";
    
    var errName = errDesc = "unknown";
    
    var callback = function (err, qResult) {
        if (err) {
            log(fName + " ERROR: " + JSON.stringify(qResult));
        } else if (qResult.DATA.length > 0) {
            log(fName + "Fetched some data");
            errName = qResult.DATA[0].name;
            errDesc = qResult.DATA[0].description;
        } else {
            log("Undefined error ID " + id);
            errName = errDesc = "undefined";
        }
    };
    
    var qErrDef = ClearBlade.Query({collectionName:coll});
    qErrDef.equalTo("id", id);
    qErrDef.fetch(callback);
    
    return {
        name: errName,
        desc: errDesc
    };
};

var getReturnWatermark = function(access_id) {
    
    log("getWatermark called for " + access_id);
    var watermark = {};
    
    log("Attempting to fetch next_start_id as high water mark.");
    var qNextIdCallback = function(err, qResult) {
        log("qNextId response: " + JSON.stringify(qResult));
        if (err) {
            resp.error(err);
        } else if(qResult.DATA.length > 0) {
            watermark.from_id = qResult.DATA[0].next_start_id;
            log("Found next_start_id = " + _from_id + " from API call id " + qResult.DATA[0].item_id + " (" + qResult.DATA[0].call_time + ")");
        } else {
            log("No valid next_start_id found. Leaving from_id undefined.");
        }
    };
    var qNextId = ClearBlade.Query({collectionName:"IdpRestApiCalls"});
    qNextId.equalTo("api_operation", "get_return_messages");
    qNextId.equalTo("access_id", access_id);
    qNextId.notEqualTo("next_start_id", -1);
    qNextId.descending("call_time");
    qNextId.fetch(qNextIdCallback);

    if(typeof watermark.from_id === "undefined") {
        log("Attempting to fetch next_start_utc since from_id is not defined.");
        var qNextUtcCallback = function(err, qResult) {
            log("qNextUtc response: " + JSON.stringify(qResult));
            if (err) {
                resp.error(err);
            } else if(qResult.DATA.length > 0) {
                watermark.start_utc = qResult.DATA[0].next_start_utc;
                log("Found next_start_utc = " + watermark.start_utc + " from API call id " + qResult.DATA[0].item_id + " (" + qResult.DATA[0].call_time + ")");
            } else {
                watermark.start_utc = getIdpDefaultTimestamp();
                log("No valid next_start_utc found. Using " + watermark.start_utc);
            }
        };
        var qNextUtc = ClearBlade.Query({collectionName:"IdpRestApiCalls"});
        qNextUtc.equalTo("api_operation", "get_return_messages");
        qNextUtc.equalTo("access_id", access_id);
        qNextUtc.notEqualTo("next_start_utc", "");
        qNextUtc.descending("call_time");
        qNextUtc.fetch(qNextUtcCallback);
    }
    
    return watermark;
};

/*
var updateIdpRestApiCalls = function(api_operation, data) {
    
    var newRowCallback = function(err, data) {
        if(err){
            resp.error(data);
        } else {
            log("IdpRestApiCalls collection item added: " + JSON.stringify(data));
        }
    };
    
    var callTime = new Date();
    var collection = ClearBlade.Collection({collectionName:"IdpRestApiCalls"});
    var newRow = {
        "call_time": callTime,
        "api_operation": api_operation,
        "success": (data.ErrorID === 0),
        "error_id": data.ErrorID,
        "messages_count": messageCount,
        "bytes_ota": byteCount,
        "access_id": _access_id
    };
    if (api_operation === "get_return_messages") {
        var newNewRow = {
            "call_time": callTime,
            "api_operation": "get_return_messages",
            "success": (data.ErrorID === 0),
            "error_id": data.ErrorID,
            "error_string": getErrorMessage(data.ErrorID),
            "more_messages": data.More,
            "messages_count": retrievedCount,
            "bytes_ota": byteCount,
            "next_start_utc": data.NextStartUTC,
            "next_start_id": data.NextStartID,
            "access_id": mailboxes[mb_idx].access_id
        };
        log("Next Start ID: " + newRow.next_start_id + " | Next Start UTC: " + newRow.next_start_utc);
    }
    collection.create(newRow, newRowCallback);
};
*/