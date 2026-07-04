import { RGBA } from "@minecraft/server";

export const RGBA_TRANSPARENT = { red: 0, green: 0, blue: 0, alpha: 0 };

export interface ColorData {
  id: number;
  display: string;
  color: RGBA;
  backgroundColor: RGBA;
}

export const colors: ColorData[] = [
  {
    id: 0,
    display: "Black",
    color: { red: 0, green: 0, blue: 0, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 1,
    display: "Dark Blue",
    color: { red: 0, green: 0, blue: 0.666667, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 2,
    display: "Dark Green",
    color: { red: 0, green: 0.666667, blue: 0, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 3,
    display: "Dark Aqua",
    color: { red: 0, green: 0.666667, blue: 0.666667, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 4,
    display: "Dark Red",
    color: { red: 0.666667, green: 0, blue: 0, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 5,
    display: "Dark Purple",
    color: { red: 0.666667, green: 0, blue: 0.666667, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 6,
    display: "Gold",
    color: { red: 1, green: 0.666667, blue: 0, alpha: 1 },
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.3 },
  },
  {
    id: 7,
    display: "Gray",
    color: { red: 0.666667, green: 0.666667, blue: 0.666667, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 8,
    display: "Dark Gray",
    color: { red: 0.333333, green: 0.333333, blue: 0.333333, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 9,
    display: "Blue",
    color: { red: 0.333333, green: 0.333333, blue: 1, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 10,
    display: "Green",
    color: { red: 0.333333, green: 1, blue: 0.333333, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 11,
    display: "Aqua",
    color: { red: 0.333333, green: 1, blue: 1, alpha: 1 },
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.3 },
  },
  {
    id: 12,
    display: "Red",
    color: { red: 1, green: 0.333333, blue: 0.333333, alpha: 1 },
    backgroundColor: { red: 1, green: 1, blue: 1, alpha: 0.3 },
  },
  {
    id: 13,
    display: "Light Purple",
    color: { red: 1, green: 0.333333, blue: 1, alpha: 1 },
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.3 },
  },
  {
    id: 14,
    display: "Yellow",
    color: { red: 1, green: 1, blue: 0.333333, alpha: 1 },
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.3 },
  },
  {
    id: 15,
    display: "White",
    color: { red: 1, green: 1, blue: 1, alpha: 1 },
    backgroundColor: { red: 0, green: 0, blue: 0, alpha: 0.3 },
  },
];