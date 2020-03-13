
//Très bon script en allant d'un record référencé à un autre :

	var gr = new GlideRecord("wm_order");
	gr.addQuery("initiated_from", current.sys_id);
	gr.query();
	while (gr.next()) {
		if (gr.state == '20' || gr.state == '21') {
			
			var gp = new GlideRecord("u_internal_closure_codes");
			if (gp.get(gr.u_close_code)) {
				
				// Closed Complete or Closed Incomplete
				if (gp.u_resolved_state == '3' || gp.u_resolved_state == '4') {

					gr.state = gp.u_resolved_state;
					
					gr.update();
				}
				
			}
			
		}
	} 











if (current.first_name.nil() && current.last_name.nil() && !current.name.nil()) {
  var names = current.name.toString().split(" ");
  if (names.length > 1) {
    current.first_name = names[0];
    names.shift();
    current.last_name = names.join(" ");
  } else 
    current.last_name = names[0];
}  



javascript:if (!current.u_product_type.nil() && !current.u_customer_site.nil()) {

	if (current.company == gs.getProperty('td.de.company.sysid')){

		var probType = new TDFieldServiceUtils2().getProbType(current.u_customer_site); 
		
		 "active=1^u_product_type=" + current.u_product_type + "^" + probType;

		} 
	else {

		"active=1^u_product_type=" + current.u_product_type;

		 }

		}



	else {

		if(current.company == gs.getProperty('td.de.company.sysid') &&!current.u_customer_site.nil()) {

			new TDFieldServiceUtils2().getProbType(current.u_customer_site);

		 }

		else "active=-1";

		 }






/**
 * Author: Serge.Lawson.external@ts.fujitsu.com
 * Description: Reports the WO Work notes on the parent Incident
 */
(function executeRule(current, previous /*null when async*/) {
	
	var gr = new GlideRecord("incident");
	gr.addQuery("number", current.initiated_from.number);
	gr.query();
	if (gr.next()) {
		gr.work_notes = 'Form work order ' + current.number + ' *** ' + current.work_notes.getJournalEntry(1);
		gr.update();
	}
	
})(current, previous);


/**
 * Author: Serge.Lawson.external@ts.fujitsu.com
 * Description: Display BR to Create g_scratchpad that will be used on Client Scripts
 **/
(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.total_fr_sysID = gs.getProperty('td.fr.company.sysid');  // TOTAL FR Sys_ID
	g_scratchpad.total_de_sysID = gs.getProperty('td.de.company.sysid'); // TOTAL DE Sys_ID	
	g_scratchpad.total_fuji_sysID = gs.getProperty('td.fuji.company.sysid'); // TOTAL DE Sys_ID	
})(current, previous);

/**
 * Author: serge.lawson@gmail.com
 * Description: Automatically loads the default Priority, Short description and Description (defined on the Problem type) on the INC
 * Modified By Elyes GAZBOUR : New need Add The Site ID to the Short Description
 **/

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var company = g_form.getValue('company');
	
	// If company is TOTAL DE and Problem Type is not empty
	//if (newValue != '' && company == g_scratchpad.total_de_sysID) { // Set the excpetion for France not Germany (D.D 12/06/2017)
	if (newValue != '' && company != g_scratchpad.total_fr_sysID) {	
	
		var ga = new GlideAjax('TDFieldServiceUtils2');
		ga.addParam('sysparm_name','getDescriptions');
		ga.addParam('sysparm_probtype', newValue);
		ga.addParam('sysparm_SiteSysId', g_form.getValue('u_customer_site'));
		ga.getXML(function (serverResponse) {
			
			var response = serverResponse.responseXML.getElementsByTagName("response");
			var short_desc = response[0].getAttribute("value");
			var desc = response[1].getAttribute("value");
			var priority = response[2].getAttribute("value");
			
			// Load the Priority
			if (priority != '') {
				g_form.setValue('priority', priority );
			}
			
			// Load the Short description
			if (short_desc != '') {
				g_form.setValue('short_description', short_desc);
			}
			
			// Load the Description
			if (desc != '') {
				g_form.setValue('description', desc );
			}
			
		});
		
	}
	
}


/**
 * Author: Serge.Lawson.external@ts.fujitsu.com
 * Description: Automatically set the state of the new INC to Active if the current view is ServiceStation_DiagCode
 */

(function executeRule(current, previous /*null when async*/) {
	var current_view = RP.getParameterValue('sysparm_view');
	//gs.log('VIEW: ' + current_view, 'SLA');

	if (current_view == 'ServiceStation_DiagCode') {
		current.state = '2';
		current.update();
	}	
})(current, previous);



/**
 * Author: Serge.Lawson.external@ts.fujitsu.com
 * Description: Automatically generates a Crisis alert to the Maintenance group when a pre-defined (in the System Property 'td.de.crisis.max.number.inc') number of incidents with the same Diagnostic Code crisis allowed have been submitten within 1 hour.
 */
(function executeRule(current, previous /*null when async*/) {
	
	// Get the defined max number of inc of the save Diag Code withing a Crisis is declared for DE scope
	var limitde = gs.getProperty('td.de.crisis.max.number.inc');
	
	// Get the defined max number of inc of the save Diag Code withing a Crisis is declared for FR scope
	var limitfr = gs.getProperty('td.fr.crisis.max.number.inc');
	
	// Calculate the beginning date/time of the delay based on the Opened date/time of the last incident (-1 hour)
	var opened = current.opened_at.dateNumericValue();
	opened = opened - 3600*1000;
	var delay = new GlideDateTime();
	delay.setValue(opened);
	
	var gr = new GlideRecord("incident");
	gr.addActiveQuery();
	gr.addQuery("company", current.company);
	gr.addQuery("u_problem_type", current.u_problem_type);
	gr.addQuery("u_problem_type.u_crisis_allowed", true);
	gr.addQuery("opened_at", '>', delay);
	gr.query();
	
	// Get the number of records with the same Diag code opened during this delay (1 hour)
	var nbinc = gr.getRowCount();
	
	//gs.log('OPENED DATE TIME: ' + current.opened_at,'SLA');
	//gs.log('1 HOUR BEFORE OPENED DATE TIME: ' + delay,'SLA');
	//gs.log('NUMBER OF INC: ' + gr.getRowCount(), 'SLA');
	if (nbinc == 0) {}
	
	if (current.company == gs.getProperty('td.de.company.sysid') && nbinc >= limitde) {
		// Sent the Crisis notification to Germany Maintenance Group
		gs.eventQueue("td.de.crisis.load.event", current, gs.getUserID(), gs.getUserName());
	}
	
	if (current.company == gs.getProperty('td.fr.company.sysid') && nbinc >= limitfr) {
		// Sent the Crisis notification to France Service Desk
		gs.eventQueue("td.fr.crisis.load.event", current, gs.getUserID(), gs.getUserName());
	}
	
})(current, previous);



/**
 * Author: Serge.Lawson.external@ts.fujitsu.com
 * Description: Update Categorization and create or not new WO depending on the new Diagnostic Type
 *
 */

function onBefore(current, previous) {
	
	var closeWOT = true;
	var site_name = current.u_customer_site.location.name;
	var probtypelabel = current.u_new_diagnostic_code.u_label;
	var short_desc = current.u_new_diagnostic_code.u_short_description;
	if (short_desc != '') {short_desc = site_name +' - '+ short_desc;} else {short_desc = site_name +' - '+ probtypelabel;}
		var desc = current.u_new_diagnostic_code.u_description;
	if (desc != '') {/*** Do nothing ***/} else {desc = probtypelabel;}
		var updateMsg = gs.getMessage("Categorization updated - from {0}", current.parent.ref_wm_order.u_problem_type.u_label) + gs.getMessage("To {0}", probtypelabel) + '\'';
	
	
	var contractor = new TDFieldServiceUtils2().getContractor(current.u_new_diagnostic_code.u_sort_field);
	
	/***** If the Contractor linked to the new Diag code corresponds to the same as the current Assignment Group *****/
	if (current.assignment_group == contractor) {
		
		/***** Update the INC, WO and WOT with the new Diagnostic code *****/
		var updateDiagCode = new TDFieldServiceUtils2().updateDiagCode('ALL');
		if (!updateDiagCode.nil()) {
			current.u_new_diagnostic_code = '';
			current.short_description = short_desc;
			current.description = desc;
			current.work_notes = updateMsg;
			gs.addInfoMessage(updateMsg);
		}
		
		closeWOT = false;
		
	} else {
		
		if ((current.assignment_group == gs.getProperty('td.de.osiris.field.group') && contractor != gs.getProperty('td.de.osiris.field.group')) || (current.assignment_group != gs.getProperty('td.de.osiris.field.group') && contractor != gs.getProperty('td.de.osiris.field.group'))) {
			
			/***** Create a new WO with the new Diagnostic code *****/
			var setNewDiagCode = new TDFieldServiceUtils2().setNewDiagCode();
			
			if (!setNewDiagCode.nil()) {
				current.u_new_diagnostic_code = '';
				current.work_notes = updateMsg;
				
				// Redirect to the newly created WO
				if (gs.isInteractive()){
					action.setRedirectURL("wm_order.do?sys_id=" + setNewDiagCode);
					gs.addInfoMessage(gs.getMessage("New WO created after a request of Diagnostic code change on {0}", current.number + ' (' + current.parent.number + ')'));
				}
			}
			
		}
		
		if (current.assignment_group != gs.getProperty('td.de.osiris.field.group') && contractor == gs.getProperty('td.de.osiris.field.group')) {
			
			/***** Update the parent INC with the new Diagnostic code *****/
			var updateDiagCodeINC = new TDFieldServiceUtils2().updateDiagCode('INC');
			
			if (!updateDiagCodeINC.nil()) {
				current.u_new_diagnostic_code = '';
				current.work_notes = updateMsg;
				
				// Redirect to the parent updated INC
				if (gs.isInteractive()){
					action.setRedirectURL("incident.do?sys_id=" + updateDiagCodeINC);
					gs.addInfoMessage(updateMsg);
				}
			}
		}
		

	}
	
	
	
	/***** WOT closure *****/
	if (closeWOT == true) {
		current.state = SMConstants.TASK_CLOSED_INCOMPLETE;
		current.active = false;
		current.closed_by = gs.getUserID();
		current.closed_at = gs.nowDateTime();
		current.u_close_code = gs.getProperty('td.de.close.code.new.diag.code');
		if (!current.close_notes.nil()) {
			current.close_notes = current.close_notes + '\n' + gs.getMessage('td.wot.new.categ.contractor');
		} else {
			current.close_notes = gs.getMessage('td.wot.new.categ.contractor');
		}
	}
}