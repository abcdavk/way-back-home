import { world, LocationWaypoint, WaypointTextureSelector, WaypointTexture, Player, PlayerWaypoint, system, Vector3 } from "@minecraft/server"
import { waybackCommandHandler, waybackCustomCommand } from "./wayback/command";
import { playerRefreshWayback } from "./wayback/locator";

system.run(() => {
  for (const player of world.getPlayers()) {
    playerRefreshWayback(player);
  }
});

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (initialSpawn) playerRefreshWayback(player);
});

system.beforeEvents.startup.subscribe(({ customCommandRegistry: ccr }) => {
  ccr.registerCommand(waybackCustomCommand, waybackCommandHandler);
});