function serialize(obj){
    var k = Object.keys(obj);
    var s = "";
    for(var i=0;i<k.length;i++) {
        //console.log(k[i] + "->" + obj[k[i]]);
        s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
        if (i != k.length -1) s += "&";
    }
    return s;
};

function get_formparms(formname, fieldname_filter)
{
    var form_parms = {};
    var myform = document.forms[formname];
    for (i=0; i < myform.elements.length; i++) {
        var fname = myform.elements[i].name;
        if (fieldname_filter !== undefined && 
                (fname.match(fieldname_filter) != null)){
            continue;
        }
        if (myform.elements[i].type == 'select-multiple') {
            var name = myform.elements[i].name;
            var $select = $('#' + name);
            var vals = [];
            $('#' + name + ' :selected').each(function() {
                vals.push($(this).val());
            });
            form_parms[name] = vals;
        }
        //added code for checkbox value
        else if(myform.elements[i].type=="checkbox") {
            if($(myform.elements[i]).is(":checked")) {
                var name = myform.elements[i].name;
				if(name!="") {
					var $select = $('[name=' + name+'][type=checkbox]');
					form_parms[name] = $select.val();
				}
            }
        }
        else if (myform.elements[i].type != 'button') {
            form_parms[myform.elements[i].name] = myform.elements[i].value;
        } 
    }
    return form_parms;
}

function mychkstatus(resp, okstr, errstr)
{
    var $msg="";
    //alert("returned status = " + JSON.stringify(resp));

    if (resp['status'] != 'ok') {
        $('#console').html('');
        $msg += resp['status'] + "<br>\n";
        var prefix = (errstr === undefined) ? "Error" : errstr;
        console.log(prefix + ": " + $msg);
        $('#console').html($msg);
        return false;
    }
    else if (okstr !== undefined) {
        $('#console').html(okstr + "<br>\n");
    }
    return true;
}

function getEpochTimeFromDateString(d) {
	var t = new Date(d);
	return d.getTime()/1000;
}
			
function getDateFromEpochTime(t,isUTC) {
	var utcSeconds = t;
	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	if(isUTC) {
		utcSeconds = utcSeconds + d.getTimezoneOffset()*60
	}
	d.setUTCSeconds(utcSeconds);
	return d;
}
