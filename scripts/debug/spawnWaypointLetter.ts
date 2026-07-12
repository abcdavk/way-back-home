import { world } from "@minecraft/server";
import { WaybackManager } from "../wayback/manager";
import { WaybackCreateOptions } from "../const/manager";
import { playerAddWayback } from "../wayback/locator";

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (itemStack.typeId !== "minecraft:blaze_rod") return;

  const manager = new WaybackManager(player);

  for (let i = 0; i < 26; i++) {
    const options: WaybackCreateOptions = {
      label: String.fromCharCode(65 + i), // A-Z
      location: {
        x: player.location.x + (i + 1),
        y: player.location.y,
        z: player.location.z,
      },
      dimension: "minecraft:overworld",
      appearance: {
        icon: 0, // 0 = A, 1 = B, ..., 25 = Z
        color: Math.floor(Math.random() * 16), // 0-15
        visible: true,
        floatingText: true,
      },
    };

    const wayback = manager.create(options);
    playerAddWayback(player, wayback);
  }
});
