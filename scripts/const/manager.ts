import { Vector3 } from "@minecraft/server";

export const WAYBACK_PROPERTY = "wbh:waybacks";

export interface Wayback {
  id: string;
  label: string;
  location: Vector3;
  dimension: string;
  createdAt: number;
  appearance: WaybackAppearance;
}

export interface WaybackAppearance {
  icon: number;
  color: number;
  visible: boolean;
  floatingText?: boolean;
}

export interface WaybackCreateOptions {
  label: string;
  location: Vector3;
  dimension?: string;
  appearance: WaybackAppearance;
}

export interface WaybackUpdateOptions {
  label?: string;
  location?: Vector3;
  dimension?: string;
  appearance?: WaybackAppearance;
}
