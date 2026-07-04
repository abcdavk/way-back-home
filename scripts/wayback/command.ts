import { CommandPermissionLevel, CustomCommand, CustomCommandOrigin, CustomCommandResult, Player, system } from "@minecraft/server";
import { showWaybackMainUI } from "./ui";

export const waybackCustomCommand: CustomCommand = {
  name: "wbh:waypoint",
  description: "Open wayback menu",
  permissionLevel: CommandPermissionLevel.Any,
  cheatsRequired: false
};
  
export function waybackCommandHandler(origin: CustomCommandOrigin): CustomCommandResult | undefined {
  const player = origin.sourceEntity;
  if (!player) return;
  if (!(player instanceof Player)) return;
  
  system.run(() => showWaybackMainUI(player));
}