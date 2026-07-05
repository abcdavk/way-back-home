import { Player, system } from "@minecraft/server";
import {
  CustomForm,
  DropdownItemData,
  ObservableBoolean,
  ObservableNumber,
  ObservableString,
} from "@minecraft/server-ui";
import { ObservableLocation } from "../const/ui";
import { WaybackManager } from "./manager";
import { Wayback, WaybackCreateOptions } from "../const/manager";
import { playerAddLocatorBar, playerAddWayback, playerClearWayback, playerRefreshWayback } from "./locator";
import { locatorIcons } from "../const/icons";
import { colors } from "../const/colors";
import { ComputedBoolean, ComputedString, sanitizeNumber } from "../utils/ui";

enum UIWaybackState {
  Home,
  Manage,
  Create,
}

const dimensionList = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

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

  const dimensionIdx = dimensionList.findIndex((d) => d === wayback.dimension);
  const $dimensionSelector = new ObservableNumber(dimensionIdx, { clientWritable: true });

  const iconList: DropdownItemData[] = [];
  for (let i = 0; i < locatorIcons.length; i++) {
    iconList.push({
      label: locatorIcons[i].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
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

  form.label({ translate: "wbh.ui.editWaypoint" });

  form.spacer();

  form.textField({ translate: "wbh.ui.waypointName" }, $name);

  form.spacer();

  form.button({ translate: "wbh.ui.setHere" }, () => {
    const location = player.location;

    $locationDimension.x.setData(Math.floor(location.x).toString());
    $locationDimension.y.setData(Math.floor(location.y).toString());
    $locationDimension.z.setData(Math.floor(location.z).toString());

    const dimensionIdx = dimensionList.findIndex((d) => d === player.dimension.id);
    $dimensionSelector.setData(dimensionIdx);
  });

  form.textField("", $locationDimension.x, { description: "X" });
  form.textField("", $locationDimension.y, { description: "Y" });
  form.textField("", $locationDimension.z, { description: "Z" });

  form.dropdown(
    "",
    $dimensionSelector,
    [
      { label: "Overworld", value: 0 },
      { label: "Nether", value: 1 },
      { label: "The End", value: 2 },
    ],
    {
      description: "Dimension",
    }
  );

  form.spacer();

  form.dropdown({ translate: "wbh.ui.appearance" }, $iconSelector, iconList, {
    description: { translate: "wbh.ui.locatorBarIcon" },
  });

  form.dropdown("", $colorSelector, colorList, {
    description: { translate: "wbh.ui.waypointColor" },
  });
  form.toggle({ translate: "wbh.ui.visible" }, $toggleVisibility);

  form.spacer();

  form.button(
    { translate: "wbh.ui.saveAndQuit" },
    () => {
      if ($saveButtonDisabled.getData()) return;

      const intLoc = {
        x: Number($locationDimension.x.getData()),
        y: Number($locationDimension.y.getData()),
        z: Number($locationDimension.z.getData()),
      };

      if (isNaN(intLoc.x) || isNaN(intLoc.y) || isNaN(intLoc.z)) return;

      const manager = new WaybackManager(player);
      manager.update(wayback.id, {
        label: $name.getData(),
        location: intLoc,
        dimension: dimensionList[$dimensionSelector.getData()],
        appearance: {
          icon: $iconSelector.getData(),
          color: $colorSelector.getData(),
          visible: $toggleVisibility.getData(),
        },
      });

      system.run(() => playerRefreshWayback(player));

      form.close();
    },
    {
      disabled: $saveButtonDisabled,
    }
  );

  form.button({ translate: "wbh.ui.delete" }, () => {
    const manager = new WaybackManager(player);

    manager.remove(wayback.id);

    system.run(() => playerClearWayback(player));
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
  };
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

  const dimensionIdx = dimensionList.findIndex((d) => d === player.dimension.id);

  const $dimensionSelector = new ObservableNumber(dimensionIdx, { clientWritable: true });

  let iconList = Array<DropdownItemData>();
  for (let i = 0; i < locatorIcons.length; i++) {
    const icon = locatorIcons[i].replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

    iconList.push({ label: icon, value: i });
  }

  const $iconSelector = new ObservableNumber(0, { clientWritable: true });

  const colorList = Array<DropdownItemData>();
  for (const color of colors) {
    colorList.push({ label: color.display, value: color.id });
  }
  const randomColor = Math.floor(Math.random() * colors.length);
  const $colorSelector = new ObservableNumber(randomColor, { clientWritable: true });

  form.label({ translate: "wbh.ui.createWaypoint" }, { visible: state.create });

  form.spacer({ visible: state.create });
  form.textField({ translate: "wbh.ui.waypointName" }, $name, { visible: state.create });
  form.spacer({ visible: state.create });

  form.button(
    { translate: "wbh.ui.setHere" },
    () => {
      $locationDimension.x.setData(location.x.toString());
      $locationDimension.y.setData(location.y.toString());
      $locationDimension.z.setData(location.z.toString());
    },
    { visible: state.create }
  );

  form.textField("", $locationDimension.x, { description: "X", visible: state.create });
  form.textField("", $locationDimension.y, { description: "Y", visible: state.create });
  form.textField("", $locationDimension.z, { description: "Z", visible: state.create });
  form.dropdown(
    "",
    $dimensionSelector,
    [
      { label: "Overworld", value: 0 },
      { label: "Nether", value: 1 },
      { label: "The End", value: 2 },
    ],
    { description: "Dimension", visible: state.create }
  );
  form.spacer({ visible: state.create });

  form.dropdown({ translate: "wbh.ui.appearance" }, $iconSelector, iconList, {
    description: { translate: "wbh.ui.locatorBarIcon" },
    visible: state.create,
  });
  form.dropdown("", $colorSelector, colorList, {
    description: { translate: "wbh.ui.waypointColor" },
    visible: state.create,
  });

  form.spacer({ visible: state.create });

  form.button(
    { translate: "wbh.ui.saveAndQuit" },
    () => {
      if ($saveButtonDisabled.getData()) return;

      const intLoc = {
        x: Number($locationDimension.x.getData()),
        y: Number($locationDimension.y.getData()),
        z: Number($locationDimension.z.getData()),
      };

      if (isNaN(intLoc.x) || isNaN(intLoc.y) || isNaN(intLoc.z)) return;

      const options: WaybackCreateOptions = {
        label: $name.getData(),
        location: intLoc,
        dimension: dimensionList[$dimensionSelector.getData()],
        appearance: {
          icon: $iconSelector.getData(),
          color: $colorSelector.getData(),
          visible: true,
        },
      };
      const manager = new WaybackManager(player);
      const wayback = manager.create(options);

      playerAddWayback(player, wayback);
      form.close();
    },
    { visible: state.create, disabled: new ComputedBoolean(() => $saveButtonDisabled.getData()) }
  );

  form.button({ translate: "wbh.ui.back" }, () => state.navigate(UIWaybackState.Home), { visible: state.create });
}

function registerManage(player: Player, form: CustomForm, state: UIState) {
  const manager = new WaybackManager(player);
  const waybacks = manager.getAll();

  const maxElementsPerPage = 6;

  const totalPages = Math.max(0, Math.ceil(waybacks.length / maxElementsPerPage) - 1);

  const $pageSelector = new ObservableNumber(0, { clientWritable: true });

  const isAllVisible = waybacks.every((wayback) => wayback.appearance.visible);
  const $toggleVisibilityAll = new ObservableBoolean(isAllVisible, { clientWritable: true });
  const $buttonDeleteAllMsg = new ObservableString("Delete All");
  const $buttonDeleteAllState = new ObservableNumber(0);

  form.spacer({ visible: state.manage });

  form.toggle({ translate: "wbh.ui.visibleAllWaypoint" }, $toggleVisibilityAll, { visible: state.manage });

  $toggleVisibilityAll.subscribe((data) => {
    for (const wayback of waybacks) {
      wayback.appearance.visible = data;
      manager.update(wayback.id, { appearance: wayback.appearance });
    }

    system.run(() => playerRefreshWayback(player));
  });

  form.divider({ visible: state.manage });
  form.button(
    $buttonDeleteAllMsg,
    () => {
      $buttonDeleteAllState.setData($buttonDeleteAllState.getData() + 1);
      switch ($buttonDeleteAllState.getData()) {
        case 1:
          $buttonDeleteAllMsg.setData("Are you sure?");
          break;
        case 2:
          $buttonDeleteAllMsg.setData("Are you REALLY sure?");
          break;
        case 3:
          waybacks.forEach((wayback) => manager.remove(wayback.id));
          system.run(() => playerClearWayback(player));
          form.close();
          break;
      }
    },
    { visible: state.manage, disabled: waybacks.length < 1 }
  );
  form.divider({ visible: state.manage });

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
          tooltip: new ComputedString(() => {
            if (getWayback() !== undefined)
              return `Location: ${getWayback().location.x} ${getWayback().location.y} ${getWayback().location.z}\nVisible: ${getWayback().appearance.visible}`;
            else return "";
          }),
        }
      );
    }
  }

  form.slider({ translate: "wbh.ui.page" }, $pageSelector, 0, totalPages, { visible: state.manage });
  form.spacer({ visible: state.manage });
  form.button({ translate: "wbh.ui.back" }, () => state.navigate(UIWaybackState.Home), { visible: state.manage });
}

function registerHome(form: CustomForm, state: UIState) {
  form.button({ translate: "wbh.ui.createWaypoint" }, () => state.navigate(UIWaybackState.Create), {
    visible: state.home,
  });
  form.button({ translate: "wbh.ui.manageWaypoint" }, () => state.navigate(UIWaybackState.Manage), {
    visible: state.home,
  });
}

export function showWaybackMainUI(player: Player) {
  const state = new UIState();
  const form = new CustomForm(player, "Way Back Home");

  registerHome(form, state);
  registerManage(player, form, state);
  registerCreate(player, form, state);

  form.show();
}
