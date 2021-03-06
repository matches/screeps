var util = require('common');

var buildExtension = function(creep) {

	var numExts = 0;
	var structs = creep.room.find(FIND_MY_STRUCTURES);
	structs.forEach(function(s) {
		if (structs[s].structureType == 'STRUCTURE_EXTESION') {
			numExts++;
		}
	});

	var maxExts = creep.room.memory.maxExts;
	if (typeof maxExts !== 'undefined') {
		if (numExts < maxExts) {

			// build ext.
		}
	}
}

function dlog(msg) {
	util.dlog('CONSTRUCTION', msg);
}

module.exports = function(creep) {

	// Take a look around the room for something to do

	// If we are here, seems there is no extension with energy
	// workerBee(creep);
	// return;

	if ((creep.memory.myTargetId == null)
			|| typeof Game.structures[creep.memory.myTargetId] === 'undefined') {

		creep.memory.myTargetId = constructSite(creep);
		// console.log('New Target for ' + creep.name + ': '
		// + creep.memory.myTargetId);
	}

	var target = Game.getObjectById(creep.memory.myTargetId);
	if (target === null) {
		// console.log('No target, temporary upgarder');
		upgrader(creep);
		return;
	}

	if (!creep.pos.isNearTo(target)) {
		creep.moveTo(target);
	}

	// Is a construction site
	if (target.progress >= 0) {
		if (target.progress < target.progressTotal) {
			if (creep.pos.isNearTo(target)) {
				creep.say(completedPretty(target) + '%');
				creep.build(target);
			}
		} else {
			// console.log('clearing target ' + creep.name + ' target: '
			// + target.structureType + ' ' + target.progress + '/'
			// + target.progressTotal);
			creep.memory.myTargetId = null;
		}
		return;
	}

	if (needsRepair(target)) {
		if (creep.pos.isNearTo(target)) {
			creep.say(completedPretty(target) + '%');
			creep.repair(target);
		}
	} else {
		// console.log('clearing target ' + creep.name + ' target: '
		// + target.structureType + ' ' + target.hits + '/'
		// + target.hitsMax);
		creep.memory.myTargetId = null;
	}

}

function needsRepair(target) {
	// console.log('needs repair? ' + target.hits + '/' + target.hitsMax);
	return target.hits < (target.hitsMax / 2);
}

function repairDuty(creep) {

	var structures = creep.room.find(FIND_STRUCTURES);
	var options = [];

	// TODO: can I sort structures in order of damage?
	for ( var i in structures) {
		var s = structures[i];

		var intendedPath = creep.checkPath(s);
		// Check if path exists!! Otherwise, builders can block each other

		if (s.hits === null) {
			continue;
		}

		if (s.needsRepair()) {
			creep.moveTo(s);
			creep.repair(s);
		}
	}
}

function constructionDuty(creep) {

	var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES), site = null, target = null;

	if (constructionSites.length) {
		site = constructionSites[Math.floor((Math.random() * 10)
				% constructionSites.length)]; // Try to spread out
		// construction a bit to make
		// pathing easier
	}

	var structures = creep.room.find(FIND_STRUCTURES);
	var options = [];

	for ( var i in structures) {
		var s = structures[i];

		// Check if path exists!! Otherwise, builders can block each other
		var path = creep.moveTo(s);
		if (path) {
			continue; // Can't do it for some reason.
		}
		if (creep) {
			if (s.hits === null) {
				continue;
			} else if (needsRepair(s)) {
				if (s.structureType === STRUCTURE_RAMPART) {
					if (target !== null
							&& (target.structureType == STRUCTURE_RAMPART)
							&& (target.hits < s.hits)) {
						continue;
					}
					target = s;
				}
				if ((s.structureType == STRUCTURE_ROAD)
						&& (target === null || (target.structureType != STRUCTURE_RAMPART))) {
					target = s;
				}
				if (target === null
						|| ((s.structureType == STRUCTURE_WALL) && (target === null || ([
								STRUCTURE_RAMPART, STRUCTURE_ROAD ]
								.indexOf(target.structureType) == -1)))) {
					target = s;
				}
			}
		}
	}

	if (target === null && site !== null) {
		return site.id;
	} else if (target !== null && (target.hits < (target.hitsMax / 4))) {
		return target.id;
	} else if (site !== null) {
		return site.id;
	} else if (target !== null) {
		return target.id;
	}
	// console.log('failed to find target');
	return null;
}

module.exports.upgradeController = function(creep) {

	var rc = creep.room.controller;

	if (creep.pos.isNearTo(rc) && (creep.carry.energy > 0)) {
		creep.say(completedPretty(rc) + "%");
		creep.upgradeController(rc);
	} else {
		fillTank(creep);
		creep.moveTo(rc);
	}
}

function fillTank(creep) {
	var structs = creep.room.find(FIND_MY_STRUCTURES);

	creep.say('Filling up my tank');
	while (creep.carry.energy < creep.carryCapacity) {
		for ( var i in structs) {
			var struct = structs[i];
			if ((struct.structureType == STRUCTURE_EXTENSION)
					|| (struct.structureType == 'spawn')
					|| (struct.structureType == STRUCTURE_STORAGE)) {

				if (struct.energy > 0) {
					creep.moveTo(struct);
					if (creep.pos.isNearTo(struct)) {
						struct.transferEnergy(creep);
					}
				}
			}
		}
	}
}

function completedPretty(target) {
	if (target.hits !== null) {
		return parseInt((target.hits / target.hitsMax) * 100);
	}
	return parseInt((target.progress / target.progressTotal) * 100);
}
