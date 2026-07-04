import { DimensionLocation, LocationWaypoint, Player, system, TextPrimitive, WaypointTextureSelector, world } from "@minecraft/server";
import { Wayback } from "../const/manager";
import { playerLocatorBars } from "../const/locator";
import { WaybackManager } from "./manager";
import { colors, RGBA_TRANSPARENT } from "../const/colors";
import { locatorIcons, locatorLetters } from "../const/icons";

const playerFloatingTexts = new Map<string, TextPrimitive[]>

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
    playerLocatorBars.delete(player.id);
    playerClearWayback(player);
    system.run(() => playerAddWayback(player, wayback));
  }
}

export function playerClearWayback(player: Player) {
  playerClearFloatingText(player);
  playerClearLocator(player);
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

  const floatingTexts = playerFloatingTexts.get(player.id);
  if (floatingTexts !== undefined) {
    floatingTexts.push(waybackIcon);
    floatingTexts.push(waybackLabel);
    playerFloatingTexts.set(player.id, floatingTexts);
  } else {
    playerFloatingTexts.set(player.id, [ waybackIcon, waybackLabel ]);
  }
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

export function playerClearFloatingText(player: Player) {
  const floatingTexts = playerFloatingTexts.get(player.id);
  if (floatingTexts === undefined) return
  floatingTexts.forEach(text => world.primitiveShapesManager.removeText(text));    
}

export function playerClearLocator(player: Player) {
  player.locatorBar.removeAllWaypoints();
}