var upgrader = require('upgrader');

module.exports = function(creep) {

    if(creep.carry.energy == 0) {
      creep.moveTo(creep.room.storage);
      creep.room.storage.transferEnergy(creep);
    } else {
        if(creep.memory.myTargetId == null) {
            creep.memory.myTargetId = newTarget(creep);
            console.log('New Target for ' + creep.name + ': ' + creep.memory.myTargetId);
        }

        var target = Game.getObjectById(creep.memory.myTargetId);
        if(target == null) {
            console.log('No target, temporary upgarder');
            upgrader(creep);
            return;
        }

      var res = creep.moveTo(target);

            // Is a construction site
      if(target.progress != null) {
          if (target.progress < target.progressTotal) {
              if (creep.pos.isNearTo(target)) {
                  creep.say(completedPretty(target) + '%');
                  creep.build(target);
              }
          } else {
              console.log('clearing target ' + creep.name);
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
            console.log('clearing target ' + creep.name);
            creep.memory.myTargetId = null;
        }

    }
}

function needsRepair(target) {
    return target.hits < (target.hitsMax / 2);
}

function newTarget(creep) {
    var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    var site = null;

    if(constructionSites.length) {
        site =  constructionSites[0];
    }

    var structures = creep.room.find(FIND_STRUCTURES);
    var options = [];

    for(var i in structures) {
        var s = structures[i];
        var target = null;

        if (s.hits == null) {
            continue;
        } else if (needsRepair(s)) {
            if (s.structureType == STRUCTURE_RAMPART) {
                if (target != null && target.structureType == STRUCTURE_RAMPART && target.hits < s.hits) {
                    continue;
                }
                target = s;
            } if (s.structureType == STRUCTURE_ROAD && ( target == null || target.structureType != STRUCTURE_RAMPART)) {
                target = s;
            } if (target == null || s.structureType == STRUCTURE_WALL && (target == null || [STRUCTURE_RAMPART, STRUCTURE_ROAD].indexOf(target.structureType) == -1)) {
                target = s;
            }
        }
    }

        if (target == null && site != null) {
            return site.id;
        } else if (target != null && target.hits < (target.hitsMax / 4)) {
            return target.id;
        } else if (site != null) {
            return site.id
        } else if (target != null) {
            return target.id;
        }
        console.log('failed to find target');
        return null;
}

function completedPretty(target) {
    if (target.hits != null) {
        return parseInt((target.hits / target.hitsMax) * 100);
    }
    return parseInt((target.progress / target.progressTotal) * 100);
}

