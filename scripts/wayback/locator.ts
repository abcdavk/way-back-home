import { DimensionLocation, LocationWaypoint, Player, WaypointTextureSelector, world } from "@minecraft/server";
import { Wayback } from "../const/manager";
import { playerLocatorBars } from "../const/locator";

export function playerAddLocator(player: Player, wayback: Wayback): boolean {
  if (!wayback.appearance.visible) return false;

  const dimension = world.getDimension(wayback.dimension);
  const dimesionLocation: DimensionLocation = {
    dimension,
    x: wayback.location.x,
    y: wayback.location.y,
    z: wayback.location.z,
  }

  const textureSelector: WaypointTextureSelector = {
    textureBoundsList: [
      {
        lowerBound: 0,
        texture: {
          iconHeight: 1,
          iconWidth: 1,
          path: wayback.appearance.icon,
        }
      }
    ]
  };

  const waypoint = new LocationWaypoint(
    dimesionLocation,
    textureSelector
  );

  const locatorBars = playerLocatorBars.get(player.id);

  if (locatorBars === undefined) playerLocatorBars.set(player.id, [ wayback.id ]);
  if (locatorBars) {
    if (locatorBars.find(v => v === wayback.id)) {
      console.log("Waypoint already added.")
      return false;
    } else {
      locatorBars.push(wayback.id);
      playerLocatorBars.set(player.id, locatorBars)
    }
  }

  player.locatorBar.addWaypoint(waypoint);
  console.log("Waypoint added!")

  return true;
}

export function playerRemoveLocator(player: Player, wayback: Wayback) {
  const dimension = world.getDimension(wayback.dimension);

  const dimesionLocation: DimensionLocation = {
    dimension,
    x: wayback.location.x,
    y: wayback.location.y,
    z: wayback.location.z,
  }

  const textureSelector: WaypointTextureSelector = {
    textureBoundsList: [
      {
        lowerBound: 0,
        texture: {
          iconHeight: 1,
          iconWidth: 1,
          path: wayback.appearance.icon,
        }
      }
    ]
  };

  const waypoint = new LocationWaypoint(
    dimesionLocation,
    textureSelector
  );

  const locatorBars = playerLocatorBars.get(player.id);
  if (locatorBars === undefined) return;
  if (locatorBars) {
    if (locatorBars.find(v => v === wayback.id)) {
      console.log("Waypoint not found.")
      return false;
    } else {
      const index = locatorBars.findIndex(v => v === wayback.id);

      if (index === -1) {
        return false;
      }

      locatorBars.splice(index, 1);
      playerLocatorBars.set(player.id, locatorBars);
    }
  }

  player.locatorBar.removeWaypoint(waypoint);
}

export function playerClearLocator(player: Player) {
  player.locatorBar.removeAllWaypoints();
  playerLocatorBars.delete(player.id);
}