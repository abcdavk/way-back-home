import { Player } from "@minecraft/server";
import { CustomForm, ObservableBoolean } from "@minecraft/server-ui";

enum UIWaybackState {
  Home,
  Manage,
}

export class UIState {
  readonly home = new ObservableBoolean(true);
  readonly manage = new ObservableBoolean(false);
  
  navigate(page: UIWaybackState) {
    this.home.setData(false);
    this.manage.setData(false);
    
    switch (page) {
      case UIWaybackState.Home:
      this.home.setData(true);
      break;

      case UIWaybackState.Manage:
      this.manage.setData(true);
      break;
    }
  }
}

function registerManage(form: CustomForm, state: UIState) {
  form.label("Waypoint list here", { visible: state.manage });
}

function registerHome(form: CustomForm, state: UIState) {
  form.button("Create Waypoint", () => state.navigate(UIWaybackState.Home), { visible: state.home });
  form.button("Manage Waypoint", () => state.navigate(UIWaybackState.Manage), { visible: state.home });
}

export function showMainUI(player: Player) {
  const state = new UIState();
  const form = new CustomForm(player, "Way Back Home")
  
  registerHome(form, state);
}