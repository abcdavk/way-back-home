import { Player, system } from "@minecraft/server";
import { CustomForm, DropdownItemData, ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
import { ObservableLocation } from "../const/ui";
import { WaybackManager } from "./manager";
import { Wayback, WaybackCreateOptions } from "../const/manager";
import { playerAddLocatorBar, playerAddWayback, playerRefreshWayback } from "./locator";
import { locatorIcons } from "../const/icons";
import { colors } from "../const/colors";
import { ComputedBoolean, ComputedString, sanitizeNumber } from "../utils/ui";

enum UIWaybackState {
  Home,
  Manage,
  Create,
}

const dimensionList = [
  "minecraft:overworld",
  "minecraft:nether",
  "minecraft:the_end",
];

function showEditWaybackUI(player: Player, wayback: Wayback) {
  const form = new CustomForm(player, "Way Back Home");

  const $saveButtonDisabled = new ObservableBoolean(wayback.label.length < 1);

  const $toggleVisibility = new ObservableBoolean(wayback.appearance.visible, { clientWritable: true });

  const $name = new ObservableString(wayback.label, { clientWritable: true });
  $name.subscribe((data) => {
    $saveButtonDisabled.setData(data.length < 1);
  });

  const $locationDimension: ObservableLocation = {
    x: new ObservableString(wayback.location.x.toString(), { clientWritable: true }),
    y: new ObservableString(wayback.location.y.toString(), { clientWritable: true }),
    z: new ObservableString(wayback.location.z.toString(), { clientWritable: true }),
  };

  $locationDimension.x.subscribe((data) => {
    const value = sanitizeNumber(data);

    if (value !== data) {
      $locationDimension.x.setData(value);
    }
  });

  $locationDimension.y.subscribe((data) => {
    const value = sanitizeNumber(data);

    if (value !== data) {
      $locationDimension.y.setData(value);
    }
  });

  $locationDimension.z.subscribe((data) => {
    const value = sanitizeNumber(data);

    if (value !== data) {
      $locationDimension.z.setData(value);
    }
  });

  const dimensionIdx = dimensionList.findIndex(d => d === wayback.dimension);
  const $dimensionSelector = new ObservableNumber(dimensionIdx, { clientWritable: true });

  const iconList: DropdownItemData[] = [];
  for (let i = 0; i < locatorIcons.length; i++) {
    iconList.push({
      label: locatorIcons[i]
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase()),
      value: i,
    });
  }

  const $iconSelector = new ObservableNumber(wayback.appearance.icon, {
    clientWritable: true,
  });

  const colorList: DropdownItemData[] = [];
  for (const color of colors) {
    colorList.push({
      label: color.display,
      value: color.id,
    });
  }

  const $colorSelector = new ObservableNumber(wayback.appearance.color, {
    clientWritable: true,
  });

  form.label("Edit Waypoint");

  form.spacer();

  form.textField("Waypoint Name", $name);

  form.spacer();

  form.button("Set Here", () => {
    const location = player.location;

    $locationDimension.x.setData(Math.floor(location.x).toString());
    $locationDimension.y.setData(Math.floor(location.y).toString());
    $locationDimension.z.setData(Math.floor(location.z).toString());

    const dimensionIdx = dimensionList.findIndex(d => d === player.dimension.id);
    $dimensionSelector.setData(dimensionIdx);
  });

  form.textField("", $locationDimension.x, { description: "X" });
  form.textField("", $locationDimension.y, { description: "Y" });
  form.textField("", $locationDimension.z, { description: "Z" });

  form.dropdown("", $dimensionSelector, [
    { label: "Overworld", value: 0 },
    { label: "Nether", value: 1 },
    { label: "The End", value: 2 },
  ], {
    description: "Dimension",
  });

  form.spacer();

  form.dropdown(
    "Appearance:",
    $iconSelector,
    iconList,
    {
      description: "Locator Bar Icon",
    }
  );

  form.dropdown(
    "",
    $colorSelector,
    colorList,
    {
      description: "Waypoint Color",
    }
  );
  form.toggle("Visible", $toggleVisibility);

  form.button("Save and Quit", () => {
    if ($saveButtonDisabled.getData()) return;
    wayback.location = {
      x: Number($locationDimension.x.getData()),
      y: Number($locationDimension.y.getData()),
      z: Number($locationDimension.z.getData()),
    };

    wayback.dimension = dimensionList[$dimensionSelector.getData()];

    wayback.appearance.icon = $iconSelector.getData();
    wayback.appearance.color = $colorSelector.getData();

    const manager = new WaybackManager(player);
    manager.update(wayback.id, {
      label: $name.getData(),
      location: {
        x: Number($locationDimension.x.getData()),
        y: Number($locationDimension.y.getData()),
        z: Number($locationDimension.z.getData()),
      },
      dimension: dimensionList[$dimensionSelector.getData()],
      appearance: {
        icon: $iconSelector.getData(),
        color: $colorSelector.getData(),
        visible: $toggleVisibility.getData(),
      }
    });

    system.run(() => playerRefreshWayback(player));

    form.close();
  }, {
    disabled: $saveButtonDisabled,
  });

  form.divider();

  form.button("Delete", () => {
    const manager = new WaybackManager(player);

    manager.remove(wayback.id);

    form.close();
  });

  form.button("Cancel", () => {
    form.close();
  });

  form.show();
}

export class UIState {
  readonly home = new ObservableBoolean(true);
  readonly manage = new ObservableBoolean(false);
  readonly create = new ObservableBoolean(false);
  
  navigate(page: UIWaybackState) {
    this.home.setData(false);
    this.manage.setData(false);
    this.create.setData(false);
    
    switch (page) {
      case UIWaybackState.Home:
      this.home.setData(true);
      break;
      
      case UIWaybackState.Manage:
      this.manage.setData(true);
      break;
      
      case UIWaybackState.Create:
      this.create.setData(true);
      break;
    }
  }
}

function registerCreate(player: Player, form: CustomForm, state: UIState) {
  let { location } = player;
  location = {
    x: Math.floor(location.x),
    y: Math.floor(location.y),
    z: Math.floor(location.z),
  }
  const $saveButtonDisabled = new ObservableBoolean(true);
  const $name = new ObservableString("", { clientWritable: true });
  $name.subscribe((data) => {
    const disabled = $name.getData().length < 1;
    $saveButtonDisabled.setData(disabled);
  }); 
  const $locationDimension: ObservableLocation = {
    x: new ObservableString(location.x.toString(), { clientWritable: true }),
    y: new ObservableString(location.y.toString(), { clientWritable: true }),
    z: new ObservableString(location.z.toString(), { clientWritable: true }),
  }
  
  $locationDimension.x.subscribe((data) => {
    const value = sanitizeNumber(data);
    
    if (value !== data) {
      $locationDimension.x.setData(value);
    }
  });
  
  $locationDimension.y.subscribe((data) => {
    const value = sanitizeNumber(data);
    
    if (value !== data) {
      $locationDimension.y.setData(value);
    }
  });
  
  $locationDimension.z.subscribe((data) => {
    const value = sanitizeNumber(data);
    
    if (value !== data) {
      $locationDimension.z.setData(value);
    }
  });
  
  const dimensionIdx = dimensionList.findIndex(d => d === player.dimension.id);
  
  const $dimensionSelector = new ObservableNumber(dimensionIdx, { clientWritable: true });
  
  let iconList = Array<DropdownItemData>();
  for (let i = 0; i < locatorIcons.length; i++) {
    const icon = locatorIcons[i]
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
    
    iconList.push({ label: icon, value: i });
  }
  
  const $iconSelector = new ObservableNumber(0, { clientWritable: true });
  
  const colorList = Array<DropdownItemData>();
  for (const color of colors) {
    colorList.push({ label: color.display, value: color.id });
  }
  const randomColor = Math.floor(Math.random() * colors.length);
  const $colorSelector = new ObservableNumber(randomColor, { clientWritable: true });
  
  form.label("Create Waypoint", { visible: state.create });
  
  form.spacer({ visible: state.create });
  form.textField("Waypoint Name", $name, { visible: state.create });
  form.spacer({ visible: state.create });
  
  form.button("Set Here", () => {
    $locationDimension.x.setData(location.x.toString());
    $locationDimension.y.setData(location.y.toString());
    $locationDimension.z.setData(location.z.toString());
  }, { visible: state.create });
  
  form.textField("", $locationDimension.x, { description: "X", visible: state.create });
  form.textField("", $locationDimension.y, { description: "Y", visible: state.create });
  form.textField("", $locationDimension.z, { description: "Z", visible: state.create });
  form.dropdown("", $dimensionSelector, [
    { label: "Overworld", value: 0 },
    { label: "Nether", value: 1 },
    { label: "The End", value: 2 },
  ], { description: "Dimension", visible: state.create });
  form.spacer({ visible: state.create });
  
  form.dropdown("Appearance:", $iconSelector, iconList, { description: "Locator Bar Icon", visible: state.create });
  form.dropdown("", $colorSelector, colorList, { description: "Waypoint Color", visible: state.create });
  
  form.button("Save and Quit", () => {
    if ($saveButtonDisabled.getData()) return;
    const options: WaybackCreateOptions = {
      label: $name.getData(),
      location: {
        x: Number($locationDimension.x.getData()),
        y: Number($locationDimension.y.getData()),
        z: Number($locationDimension.z.getData()),
      },
      dimension: dimensionList[$dimensionSelector.getData()],
      appearance: {
        icon: $iconSelector.getData(),
        color: $colorSelector.getData(),
        visible: true,
      },
    }
    const manager = new WaybackManager(player);
    const wayback = manager.create(options);
    
    playerAddWayback(player, wayback);
    form.close();
  }, { visible: state.create });
  
  form.divider({ visible: state.create });
  form.button("Back", () => state.navigate(UIWaybackState.Manage), { visible: state.create });
}

function registerManage(player: Player, form: CustomForm, state: UIState) {
  const manager = new WaybackManager(player);
  const waybacks = manager.getAll();
  
  const maxElementsPerPage = 6;
  
  const totalPages = Math.max(0, Math.ceil(waybacks.length / maxElementsPerPage) - 1);
  
  const $pageSelector = new ObservableNumber(0, { clientWritable: true });

  const isAllVisible = waybacks.every(wayback => wayback.appearance.visible);
  const $toggleVisibilityAll = new ObservableBoolean(isAllVisible, { clientWritable: true });

  form.spacer({ visible: state.manage });

  form.toggle("Visible All Waypoints", $toggleVisibilityAll, { visible: state.manage });

  $toggleVisibilityAll.subscribe((data) => {
    for (const wayback of waybacks) {
      wayback.appearance.visible = data;
      manager.update(wayback.id, { appearance: wayback.appearance });
    }

    playerRefreshWayback(player);
  });
  
  if (waybacks.length > 0) {
    for (let i = 0; i < maxElementsPerPage; i++) {
      const getWayback = () => {
        const index = $pageSelector.getData() * maxElementsPerPage + i;
        return waybacks[index];
      };

      form.button(
        new ComputedString(() => getWayback()?.label ?? ""),
        () => {
          const wayback = getWayback();
          if (!wayback) return;
          form.close();

          system.run(() => {
            showEditWaybackUI(player, wayback);
          });
        },
        {
          visible: state.manage,
          disabled: new ComputedBoolean(() => getWayback() === undefined),
          tooltip: new ComputedString(() => { if (getWayback() !== undefined) return `Location: ${getWayback().location.x} ${getWayback().location.y} ${getWayback().location.z}\nVisible: ${getWayback().appearance.visible}`; else return "" })
        }
      );
    }
  }
  
  form.slider("Page", $pageSelector, 0, totalPages, {  visible: state.manage });
  form.spacer({ visible: state.manage });
  form.button("Back", () => state.navigate(UIWaybackState.Home), { visible: state.manage });
}

function registerHome(form: CustomForm, state: UIState) {
  form.button("Create Waypoint", () => state.navigate(UIWaybackState.Create), { visible: state.home });
  form.button("Manage Waypoint", () => state.navigate(UIWaybackState.Manage), { visible: state.home });
}

export function showWaybackMainUI(player: Player) {
  const state = new UIState();
  const form = new CustomForm(player, "Way Back Home")
  
  registerHome(form, state);
  registerManage(player, form, state);
  registerCreate(player, form, state);
  
  form.show();
}