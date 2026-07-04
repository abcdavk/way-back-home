import { world, LocationWaypoint, WaypointTextureSelector, WaypointTexture, Player, PlayerWaypoint, system, Vector3 } from "@minecraft/server"

// function sharedWaypoint(player: Player) {
//   const textureSelector: WaypointTextureSelector = {
//     textureBoundsList: [
//       {
//         lowerBound: 0,
//         texture: {
//           iconHeight: 1,
//           iconWidth: 1,
//           path: "textures/items/iron_sword",
//         }
//       }
//     ]
//   };

//   const waypoint = new LocationWaypoint(
//     { dimension: player.dimension, x: 100, y: 64, z: 100 },
//     textureSelector
//   );

//   player.locatorBar.addWaypoint(waypoint);
// }

system.run(() => {
  for (const player of world.getPlayers()) {
    // sharedWaypoint(player);
  }
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  // sharedWaypoint(player)
});