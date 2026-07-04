import { RGBA } from "@minecraft/server";
import { colors } from "../const/colors";

const DEFAULT_COLOR = colors.find(c => c.id === 15)!.color;

export function getColorById(id: number): RGBA {
  return colors.find(c => c.id === id)?.color ?? DEFAULT_COLOR;
}

export function getColorByName(name: string): RGBA {
  return colors.find(c => c.display === name)?.color ?? DEFAULT_COLOR;
}