var ITEM ="3517156b0f757200c5a59acae1050ef5"; // sys_id du cat item
var TCS ="6892268f0f24b10011b0ecd692050e36"; // sys_id de compagnie TCS
var RCSFR = "277dcf4c0fd1c38053a1de2be1050e18"; // sys_id de compagnie RCSFR


// matrixGroup(ITEM, TCS, RCSFR);
itemApprovals(ITEM, TCS, RCSFR);
// AvailableForGroup(ITEM);

// AvailableForEntities(ITEM, TCS, RCSFR);


function AvailableForEntities(ITEM, TCS, RCSFR){
	
	var rec1 = new GlideRecord("sc_cat_item");
	rec1.get(ITEM);
	var entities = rec1.u_available_for_entities;
	
	gs.log(entities.toString());
	
	if(entities.toString().indexOf(TCS) != -1 && entities.toString().indexOf(RCSFR) == -1 ) {
		
		entities = entities.toString();
		entities += ", "+RCSFR;
		rec1.u_available_for_entities = entities;
		gs.log(entities.toString());
		// 		rec1.update();
		
	}
}

function itemApprovals(ITEM, TCS, RCSFR){
	
	
	var gr = new GlideRecord("u_item_approval");
	gr.addActiveQuery();
	gr.addQuery("u_catalog_item", ITEM);
	gr.addQuery('u_entity', RCSFR);
	gr.query();
	if (gr.next()){
		gs.log("des items approvals RCSFR exisent deja");
	}
	
	else {
		
		var rec1 = new GlideRecord('u_item_approval');
		rec1.addQuery('u_catalog_item', ITEM);
		rec1.addQuery('u_entity', TCS);
		rec1.query();
		gs.log(rec1.getRowCount(), "item approvals seront duppliques");
		
		while(rec1.next())
			{
			var rec2 = new GlideRecord('u_item_approval');
			rec2.initialize();
			rec2.u_catalog_item = rec1.u_catalog_item;
			rec2.u_entity = RCSFR;
			rec2.u_default = rec1.u_default;
			rec2.u_service = rec1.u_service;
			rec2.u_level_1 = rec1.u_level_1;
			rec2.u_level_2 = rec1.u_level_2;
			rec2.u_level_3 = rec1.u_level_3;
			// 			gs.log(rec1.u_level_4, "Group");
			// 			gs.log(checkGroup(rec1.u_level_4), "Groupe créé");
			
			//rec2.u_level_4 = rec1.u_level_4;
			// 		rec2.u_level_5 = rec1.u_level_5;
			rec2.u_level_4 = checkGroup(rec1.u_level_4);
			rec2.u_level_5 = checkGroup(rec1.u_level_5);
			rec2.insert();
			//Push the record into the current update set
			// 		var um = new GlideUpdateManager2();
			// 		um.saveRecord(rec2);
		}
		
	}
	
	
	
}


function AvailableForGroup(ITEM){
	
	var queryString = "sc_avail_group.nameLIKETCS_^ORsc_avail_group.nameLIKE*_tcs^ORsc_avail_group.nameLIKE*-tcs^ORsc_avail_group.nameLIKE*tcs-";
	var rec1 = new GlideRecord('sc_cat_item_group_mtom');
	rec1.addQuery('sc_cat_item', ITEM);
	//rec1.addQuery('sc_avail_group', groupe??);
	rec1.addEncodedQuery(queryString);
	rec1.query();
	gs.log(rec1.getRowCount(), "available for group avec TCS dedans");
	
	
	while(rec1.next())
		{
		var rec2 = new GlideRecord('sc_cat_item_group_mtom');
		rec2.initialize();
		rec2.sc_cat_item = rec1.sc_cat_item;
		rec2.sc_avail_group = checkGroup(rec1.sc_avail_group);
		rec2.insert();
	}
}


function matrixGroup(ITEM, TCS, RCSFR){
	
	var rec1 = new GlideRecord('u_item_group_matrix');
	rec1.addQuery('u_item', ITEM);
	rec1.addQuery('u_entity', TCS);
	rec1.query();
	gs.log(rec1.getRowCount(), "groupes de matrices seront duppliques");
	
	while(rec1.next())
		{
		var rec2 = new GlideRecord('u_item_group_matrix');
		rec2.initialize();
		rec2.u_item = rec1.u_item;
		rec2.u_entity = RCSFR;
		rec2.u_site = rec1.u_site;
		rec2.u_id = rec1.u_id;
		rec2.u_service = rec1.u_service;
		rec2.u_isolated_network = rec1.u_isolated_network;
		// 			gs.log(rec1.u_group, "ALE");
		rec2.u_group = checkGroup(rec1.u_group);
		// 		// 		gs.log(checkGroup(rec1.u_group), "group");
		rec2.insert();
		// 		var rec3 = rec2.insert();
		// 					//Push the record into the current update set
		// 		var um = new GlideUpdateManager2();
		// 		um.saveRecord(rec3);
	}
	
}


function matrixGroup2(ITEM, TCS, RCSFR){
	
	
	var queryString = "u_groupLIKETCS_^ORu_groupLIKE*_tcs^ORu_groupLIKE*-tcs^ORu_groupLIKE*tcs-";
	// queryString tous les groupes contenant TCS
	
	
	var rec1 = new GlideRecord('u_item_group_matrix');
	
	rec1.addQuery('u_item', ITEM);
	rec1.addQuery('u_entity','!=', TCS);
	rec1.addEncodedQuery(queryString);
	rec1.query();
	gs.log(rec1.getRowCount(), "groupes de matrices contenant TCS dedans mais sans l entite TCS");
	
	while(rec1.next())
		{
		var rec2 = new GlideRecord('u_item_group_matrix');
		rec2.initialize();
		rec2.u_item = rec1.u_item;
		rec2.u_entity = rec1.u_entity;
		rec2.u_site = rec1.u_site;
		rec2.u_id = rec1.u_id;
		rec2.u_service = rec1.u_service;
		rec2.u_isolated_network = rec1.u_isolated_network;
		// 			gs.log(rec1.u_group, "ALE");
		rec2.u_group = checkGroup(rec1.u_group);
		// 		// 		gs.log(checkGroup(rec1.u_group), "group");
		
		rec2.insert();
	}
	
	
}



function checkGroup(groupID){
	
	var definitivGroup = '';
	var re = /_TCS|TCS_|-TCS|TCS-/;
	// 	var re = /-TCS|TCS-/i;
	
	
	var group = new GlideRecord('sys_user_group');
	group.get(groupID);
	var groupName = group.name + "";
	
	
	
	if(groupName.match(re)){
		
		var tempGroup = groupName.replace('TCS', 'RCSFR');
		
		var grGroup = new GlideRecord('sys_user_group');
		grGroup.addQuery('name', tempGroup);
		grGroup.query();
		if(grGroup.next()){
			definitivGroup = grGroup.getValue('sys_id');
		}else{
			grNewGroup = new GlideRecord('sys_user_group');
			grNewGroup.initialize();
			grNewGroup.name = tempGroup;
			grNewGroup.u_group_type = group.u_group_type;
			grNewGroup.manager = group.manager;
			grNewGroup.u_deputy_manager = group.u_deputy_manager;
			grNewGroup.u_license_type = group.u_license_type;
			var newGroup = grNewGroup.insert();
			addUserInGroup(groupID, newGroup);
			addRolesInGroup(groupID, newGroup);
			gs.log(grNewGroup.getDisplayValue("name"), "Groupe nouvellement créé");
			definitivGroup = newGroup;
		}
		
	} else {
		definitivGroup = group.getValue('sys_id');
		
	}
	
	return definitivGroup;
}


function addUserInGroup(oldGroup, newGroup){
	var groupe1 = oldGroup; // sys_id du groupe TCS
	var groupe2 = newGroup; // sys_id du groupe RCSFR
	var rec1 = new GlideRecord('sys_user_grmember');
	rec1.addQuery('group', groupe1);
	rec1.query();
	while(rec1.next())
		{
		var rec2 = new GlideRecord('sys_user_grmember');
		rec2.initialize();
		rec2.user = rec1.user;
		rec2.group = groupe2;
		rec2.insert();
	}
}



function addRolesInGroup(oldGroup, newGroup){
	var groupe1 = oldGroup; // sys_id du groupe TCS
	var groupe2 = newGroup; // sys_id du groupe RCSFR
	var rec1 = new GlideRecord('sys_group_has_role');
	rec1.addQuery('group', groupe1);
	rec1.query();
	while(rec1.next())
		{
		var rec2 = new GlideRecord('sys_group_has_role');
		rec2.initialize();
		rec2.role = rec1.role;
		rec2.group = groupe2;
		rec2.insert();
	}
}



metric_type.evaluation_method=survey^state=ready^sys_created_onBETWEEN@javascript:gs.daysAgoStart(2)@javascript:gs.daysAgoEnd(2)