
// TESTS POUR UN CLIENT SCRIPT PAR RAPPORT AU FORMULAIRE INCIDENT (les getControl, les gel etc...)


function onLoad() {
   //Type appropriate comment here, and begin script below
	
	g_form.getControl('number').style.backgroundColor = 'brown';

	
 	gel('incident.number').style.backgroundColor = '#B40486';
// 	$('label.incident.number').setStyle({color: '#B40486'});
	$('label.incident.number').style.color = 'yellow';
	gel('label.incident.number').style.color = '#87E990'; 
	
	
	
g_form.getControl('sys_display.incident.business_service').placeholder = "Ecrivez votre business service";
	
	gel('sys_display.incident.business_service').placeholder = "blablaBLABLABLABLABLA";
	
	var numb = g_form.getControl('short_description');
	numb.placeholder = "Enter a name for this Export Set";
	
// 		var numberLabel = $('label.incident.number');
// 	numberLabel.setStyle({color: 'green'});
	
		var number = $('incident.number');
	number.setStyle({color: 'yellow'});
   
	var callerLabel = $('label.incident.caller_id');
	callerLabel.setStyle({color: 'blue'});
	
	var callerField = $('sys_display.incident.caller_id');
	callerField.setStyle({backgroundColor: "red"});
}


 


 

 