import { world } from "@minecraft/server";
import { WaybackManager } from "../wayback/manager";
import { WaybackCreateOptions } from "../const/manager";
import { playerAddWayback } from "../wayback/locator";

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (itemStack.typeId !== "minecraft:stick") return;

  const manager = new WaybackManager(player);

  for (let j = 1; j < 8; j++) {
    const options: WaybackCreateOptions = {
      label: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      location: {
        x: player.location.x + (j + 1),
        y: player.location.y,
        z: player.location.z,
      },
      dimension: "minecraft:overworld",
      appearance: {
        icon: j,
        color: Math.floor(Math.random() * 16), // 0-15
        visible: true,
      },
    };

    const wayback = manager.create(options);
    playerAddWayback(player, wayback);
  }
});
