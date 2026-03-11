import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const CONFIG = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,

  // Durian
  DURIAN_SIZE: 52,
  DURIAN_START_X: SCREEN_WIDTH / 2 - 26,
  DURIAN_START_Y: 130,

  // Catcher
  CATCHER_WIDTH: 80,
  CATCHER_HEIGHT: 80,
  CATCHER_START_X: SCREEN_WIDTH / 2 - 40,
  CATCHER_Y: SCREEN_HEIGHT - 180,

  // Physics
  BASE_CATCHER_SPEED: 180,   // px per second
  MAX_CATCHER_SPEED: 520,
  SPEED_INCREMENT: 18,       // added per catch
  DROP_DURATION_MS: 480,

  // Catch tolerance
  CATCH_TOLERANCE: 16,

  // Colors
  C: {
    D_DARK:   "#2a3a08",
    D_SPIKE:  "#4a5c1a",
    D_BODY:   "#7a8c2a",
    D_YELLOW: "#c8b830",
    F_HAIR:   "#c89030",
    F_SKIN:   "#c87040",
    F_SHIRT:  "#2850a0",
    F_PANTS:  "#1a3070",
    F_SACK_D: "#806010",
    F_SHOE:   "#301808",
    T_LEAF:   "#2a6018",
    T_LEAF_D: "#1a4010",
    T_BARK:   "#5a3010",
    BG_SKY:   "#1a3a10",
    BG_DARK:  "#0d2008",
    GROUND:   "#3a2010",
    GROUND_L: "#5a3820",
    GOLD:     "#f5c842",
    GOLD_D:   "#c89020",
    WHITE:    "#f0f0e0",
    RED:      "#e03030",
    PIXEL_BG: "#0a1a08",
    GREEN:    "#40c040",
    YELLOW:   "#c0c040",
    ORANGE:   "#c08040",
  },
};
