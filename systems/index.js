import React from "react";
import { CONFIG } from "../constants/gameConfig";
import {
  DurianRenderer,
  CatcherRenderer,
} from "../renderers";

const {
  SCREEN_WIDTH, SCREEN_HEIGHT,
  CATCHER_WIDTH, CATCHER_Y,
  DURIAN_START_X, DURIAN_START_Y, DURIAN_SIZE,
  CATCHER_START_X, BASE_CATCHER_SPEED, MAX_CATCHER_SPEED,
  SPEED_INCREMENT, CATCH_TOLERANCE, DROP_DURATION_MS,
} = CONFIG;

// ─── CATCHER MOVEMENT SYSTEM ────────────────────────────────────
export const MoveCatcher = (entities, { time }) => {
  const gs = entities.gameState;
  const catcher = entities.catcher;

  if (gs.phase === "missed") return entities;

  const delta = time.delta / 1000; // seconds
  let { position, direction, speed } = catcher;
  let [x, y] = position;

  x += direction * speed * delta;

  const leftBound = 12;
  const rightBound = SCREEN_WIDTH - CATCHER_WIDTH - 12;

  if (x >= rightBound) { x = rightBound; direction = -1; }
  if (x <= leftBound)  { x = leftBound;  direction = 1; }

  catcher.position = [x, y];
  catcher.direction = direction;
  catcher.renderer = <CatcherRenderer position={[x, y]} width={CATCHER_WIDTH} />;

  return entities;
};

// ─── DURIAN DROP SYSTEM ─────────────────────────────────────────
export const DropDurian = (entities, { time, dispatch }) => {
  const gs = entities.gameState;
  const durian = entities.durian;

  if (gs.phase !== "dropping") return entities;

  durian.dropProgress += time.delta / DROP_DURATION_MS;

  if (durian.dropProgress >= 1) {
    durian.dropProgress = 1;
    gs.phase = "checking";
    dispatch({ type: "CHECK_CATCH" });
  }

  const newY = durian.dropStartY + (durian.dropTargetY - durian.dropStartY) * durian.dropProgress;
  durian.position = [DURIAN_START_X, newY];
  durian.renderer = <DurianRenderer position={[DURIAN_START_X, newY]} size={DURIAN_SIZE} opacity={durian.opacity} />;

  return entities;
};

// ─── CATCH CHECK SYSTEM ─────────────────────────────────────────
export const CheckCatch = (entities, { events, dispatch }) => {
  const gs = entities.gameState;
  const durian = entities.durian;
  const catcher = entities.catcher;

  if (!events || !events.find(e => e.type === "CHECK_CATCH")) return entities;
  if (gs.phase !== "checking") return entities;

  const durianCenterX = DURIAN_START_X + DURIAN_SIZE / 2;
  const catcherLeft   = catcher.position[0] - CATCH_TOLERANCE;
  const catcherRight  = catcher.position[0] + CATCHER_WIDTH + CATCH_TOLERANCE;

  const caught = durianCenterX >= catcherLeft && durianCenterX <= catcherRight;

  if (caught) {
    gs.score += 1;
    gs.phase = "caught";
    gs.catchFlash = 1;
    // Speed up catcher
    const newSpeed = Math.min(BASE_CATCHER_SPEED + gs.score * SPEED_INCREMENT, MAX_CATCHER_SPEED);
    catcher.speed = newSpeed;
    dispatch({ type: "CATCH_SUCCESS", score: gs.score });
  } else {
    gs.phase = "missed";
    dispatch({ type: "GAME_OVER", score: gs.score });
  }

  return entities;
};

// ─── RESET DURIAN SYSTEM ────────────────────────────────────────
export const ResetDurian = (entities, { events }) => {
  const gs = entities.gameState;
  const durian = entities.durian;

  if (!events || !events.find(e => e.type === "CATCH_SUCCESS")) return entities;

  // Fade out then reset
  durian.opacity = 0;
  setTimeout(() => {
    durian.position  = [DURIAN_START_X, DURIAN_START_Y];
    durian.dropProgress = 0;
    durian.dropStartY   = DURIAN_START_Y;
    durian.opacity   = 1;
    gs.phase = "waiting";
    gs.catchFlash = 0;
    durian.renderer = <DurianRenderer position={[DURIAN_START_X, DURIAN_START_Y]} size={DURIAN_SIZE} opacity={1} />;
  }, 180);

  return entities;
};

// ─── TAP INPUT SYSTEM ───────────────────────────────────────────
export const HandleTap = (entities, { touches }) => {
  const gs = entities.gameState;
  const durian = entities.durian;

  if (gs.phase !== "waiting") return entities;

  const tapped = touches.find(t => t.type === "press" || t.type === "start");
  if (!tapped) return entities;

  gs.phase = "dropping";
  durian.dropProgress = 0;
  durian.dropStartY   = DURIAN_START_Y;
  durian.dropTargetY  = CATCHER_Y - DURIAN_SIZE;

  return entities;
};
