import { system } from "@minecraft/server";
import { ObservableBoolean, ObservableString } from "@minecraft/server-ui";

export class ComputedBoolean extends ObservableBoolean {
  constructor(getter: () => boolean) {
    super(getter());
    
    system.runInterval(() => {
      this.setData(getter());
    });
  }
}

export class ComputedString extends ObservableString {
  constructor(getter: () => string) {
    super(getter());

    system.runInterval(() => {
      const value = getter();

      if (value !== this.getData()) {
        this.setData(value);
      }
    });
  }
}

export function sanitizeNumber(value: string): string {
  if (value === "0-") {
    return "-";
  }

  value = value.replace(/[^\d.-]/g, "");

  value = value.replace(/(?!^)-/g, "");

  const dot = value.indexOf(".");
  if (dot !== -1) {
    value =
      value.slice(0, dot + 1) +
      value.slice(dot + 1).replace(/\./g, "");
  }

  if (value === "-") {
    return "-";
  }

  if (value === "") {
    return "0";
  }

  // Jika hanya titik, ubah menjadi 0.
  if (value === ".") {
    return "0.";
  }

  // Jika "-."
  if (value === "-.") {
    return "-0.";
  }

  // Kosong menjadi 0
  if (value === "") {
    return "0";
  }

  const negative = value.startsWith("-");
  let number = negative ? value.slice(1) : value;

  // Hilangkan nol di depan kecuali sebelum desimal
  if (number.startsWith("0")) {
    number = number.replace(/^0+(?=\d)/, "");

    if (number.startsWith(".")) {
      number = "0" + number;
    }

    if (number === "") {
      number = "0";
    }
  }

  return negative ? "-" + number : number;
}