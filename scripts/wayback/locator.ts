import { DimensionLocation, LocationWaypoint, Player, TextPrimitive, WaypointTextureSelector, world } from "@minecraft/server";
import { Wayback } from "../const/manager";
import { playerLocatorBars } from "../const/locator";
import { WaybackManager } from "./manager";
import { colors, RGBA_TRANSPARENT } from "../const/colors";
import { locatorIcons, locatorLetters } from "../const/icons";

export function getLocatorBarIconPath(
  label: string,
  icon: number,
  color: number,
) {
  if (icon === 0) {
    const letter = getLocatorLetter(label);
    return `textures/locator/letters/${letter}/${color}`;
  }

  return `textures/locator/${locatorIcons[icon]}/${color}`;
}

function getLocatorLetter(label: string): string {
  const letter = label.trim().charAt(0).toUpperCase();

  return locatorLetters.indexOf(letter) !== -1
    ? letter
    : "@";
}

export function playerRefreshWayback(player: Player) {
  const manager = new WaybackManager(player);
  for (const wayback of manager.getAll()) {
    playerAddWayback(player, wayback);
  }
}

export function playerAddWayback(player: Player, wayback: Wayback) {
  if (!wayback.appearance.visible) return;
  playerAddLocatorBar(player, wayback);
  playerAddFloatingText(player, wayback);
}

export function playerAddFloatingText(player: Player, wayback: Wayback) {
  const dimension = world.getDimension(wayback.dimension);

  const waybackIcon = new TextPrimitive({
    dimension,
    x: wayback.location.x,
    y: wayback.location.y + 1,
    z: wayback.location.z,
  }, wayback.label.charAt(0).toUpperCase());
  waybackIcon.visibleTo = [ player ];
  waybackIcon.scale = 2.5;
  waybackIcon.maximumRenderDistance = 64;
  waybackIcon.color = colors[wayback.appearance.color].color;
  waybackIcon.backgroundColorOverride = colors[wayback.appearance.color].backgroundColor;

  const waybackLabel = new TextPrimitive({
    dimension,
    x: wayback.location.x,
    y: wayback.location.y,
    z: wayback.location.z,
  }, wayback.label);
  waybackLabel.visibleTo = [ player ];
  waybackLabel.maximumRenderDistance = 24;
  waybackLabel.backgroundColorOverride = RGBA_TRANSPARENT;

  world.primitiveShapesManager.addText(waybackIcon);
  world.primitiveShapesManager.addText(waybackLabel);
}

export function playerAddLocatorBar(player: Player, wayback: Wayback) {
  if (player.locatorBar.count >= player.locatorBar.maxCount) return;
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
          path: getLocatorBarIconPath(wayback.label, wayback.appearance.icon, wayback.appearance.color),
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
    if (locatorBars.find(v => v !== wayback.id)) {
      locatorBars.push(wayback.id);
      playerLocatorBars.set(player.id, locatorBars)
    }
  }

  player.locatorBar.addWaypoint(waypoint);
}

export function playerRemoveLocatorBar(player: Player, wayback: Wayback) {
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
          path: getLocatorBarIconPath(wayback.label, wayback.appearance.icon, wayback.appearance.color),
        }
      }
    ]
  };

  const waypoint = new LocationWaypoint(
    dimesionLocation,
    textureSelector,
    { red: 1, green: 0, blue: 0 }
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