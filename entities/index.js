import { CONFIG } from "../constants/gameConfig";
import {
    CatcherRenderer,
    DurianRenderer
} from "../renderers";

const { SCREEN_WIDTH, SCREEN_HEIGHT, DURIAN_SIZE, DURIAN_START_X, DURIAN_START_Y,
  CATCHER_WIDTH, CATCHER_HEIGHT, CATCHER_START_X, CATCHER_Y } = CONFIG;

export function buildEntities() {
  return {
    // Durian
    durian: {
      position: [DURIAN_START_X, DURIAN_START_Y],
      size: DURIAN_SIZE,
      dropping: false,
      dropProgress: 0,       // 0 → 1
      dropStartY: DURIAN_START_Y,
      dropTargetY: CATCHER_Y - DURIAN_SIZE,
      opacity: 1,
      renderer: <DurianRenderer position={[DURIAN_START_X, DURIAN_START_Y]} size={DURIAN_SIZE} opacity={1} />,
    },

    // Catcher
    catcher: {
      position: [CATCHER_START_X, CATCHER_Y],
      width: CATCHER_WIDTH,
      height: CATCHER_HEIGHT,
      direction: 1,          // 1 = right, -1 = left
      speed: CONFIG.BASE_CATCHER_SPEED,
      renderer: <CatcherRenderer position={[CATCHER_START_X, CATCHER_Y]} width={CATCHER_WIDTH} />,
    },

    // Game state (not rendered — logic only)
    gameState: {
      score: 0,
      phase: "waiting",      // waiting | dropping | checking | caught | missed
      catchFlash: 0,
      renderer: null,
    },
  };
}
