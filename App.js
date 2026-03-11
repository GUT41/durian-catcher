import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── GAME CONSTANTS ─────────────────────────────────────────────
const CATCHER_WIDTH      = 120;
const CATCHER_HEIGHT     = 120;
const CATCH_ZONE_INSET   = 70;
const DURIAN_SIZE        = 60;
const DURIAN_X           = SCREEN_WIDTH / 2 - DURIAN_SIZE / 2;
const DURIAN_START_Y     = 80;
const GROUND_Y           = SCREEN_HEIGHT - 85;
const DURIAN_DROP_TARGET = GROUND_Y - DURIAN_SIZE - 12;
const DURIAN_TRAVEL      = DURIAN_DROP_TARGET - DURIAN_START_Y; 100;

const BASE_SPEED    = 180;  // px per second
const MAX_SPEED     = 520;
const SPEED_INC     = 18;
const DROP_DURATION = 480;  // ms

// ─── SCREENS ────────────────────────────────────────────────────
const S_LOADING  = "loading";
const S_START    = "start";
const S_GAME     = "game";
const S_GAMEOVER = "gameover";

// ─── COLORS ─────────────────────────────────────────────────────
const GOLD   = "#f5c842";
const GOLD_D = "#c89020";
const WHITE  = "#f0f0e0";
const RED    = "#e03030";

export default function App() {
  const [screen, setScreen]       = useState(S_LOADING);
  const [score, setScore]         = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [dropping, setDropping]   = useState(false);
  const [gameActive, setGameActive] = useState(false);
  // color used for the flash overlay during catch/miss: 'white' | 'red' | null
  const [flashColor, setFlashColor] = useState(null);

  // Refs for game logic (avoid stale closures)
  const scoreRef        = useRef(0);
  const droppingRef     = useRef(false);
  const gameActiveRef   = useRef(false);
  const catcherDirRef   = useRef(1);
  const catcherSpeedRef = useRef(BASE_SPEED);
  const catcherXRef     = useRef(SCREEN_WIDTH / 2 - CATCHER_WIDTH / 2);
  const lastTimeRef     = useRef(null);
  const animFrameRef    = useRef(null);
  const soundRef        = useRef(null);
  const catchSoundRef   = useRef(null);
  const missSoundRef    = useRef(null);

  // Animated values
  const catcherX   = useRef(new Animated.Value(SCREEN_WIDTH / 2 - CATCHER_WIDTH / 2)).current;
  const durianY    = useRef(new Animated.Value(DURIAN_START_Y)).current;
  const durianOpacity = useRef(new Animated.Value(1)).current;
  const durianScale = useRef(new Animated.Value(1)).current;
  const titleBounce   = useRef(new Animated.Value(0)).current;
  const durianWobble  = useRef(new Animated.Value(0)).current;
  const scorePop      = useRef(new Animated.Value(1)).current;
  const screenShake   = useRef(new Animated.Value(0)).current;
  const catchFlash    = useRef(new Animated.Value(0)).current;
  const loadingScale  = useRef(new Animated.Value(0.3)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const loadingFadeOut = useRef(new Animated.Value(1)).current;
  const loadingDotsAnim = useRef(new Animated.Value(0)).current;

  // ─── MUSIC & SFX ──────────────────────────────────────────────
  useEffect(() => {
    loadMusic();
    loadCatchSound();
    loadMissSound();
    startIdleAnimations();
    startLoadingSequence();
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (catchSoundRef.current) catchSoundRef.current.unloadAsync();
      if (missSoundRef.current) missSoundRef.current.unloadAsync();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startLoadingSequence = () => {
    loadingScale.setValue(0.3);
    loadingOpacity.setValue(0);
    loadingFadeOut.setValue(1);
    loadingDotsAnim.setValue(0);

    Animated.loop(
      Animated.timing(loadingDotsAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(loadingScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
      Animated.timing(loadingFadeOut, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setScreen(S_START);
    });
  };

  const loadMusic = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/sounds/background.mp3"),
        { isLooping: true, volume: 0.4, shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (e) {
      // Music file not found — game still works without it
      console.log("Music not loaded:", e);
    }
  };

  const loadCatchSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/sounds/catch.mp3"),
        { volume: 1.0 }
      );
      catchSoundRef.current = sound;
    } catch (e) {
      console.log("Catch sound not loaded:", e);
    }
  };

  const loadMissSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/sounds/miss.mp3"),
        { volume: 1.0 }
      );
      missSoundRef.current = sound;
    } catch (e) {
      console.log("Miss sound not loaded:", e);
    }
  };

  const pauseMusic = async () => {
    try { if (soundRef.current) await soundRef.current.pauseAsync(); } catch (e) {}
  };

  const resumeMusic = async () => {
    try { if (soundRef.current) await soundRef.current.playAsync(); } catch (e) {}
  };

  // ─── IDLE ANIMATIONS (start screen) ────────────────────────────
  const startIdleAnimations = () => {
    titleBounce.setValue(0);
    durianWobble.setValue(0);

    Animated.loop(
      Animated.timing(titleBounce, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(durianWobble, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // ─── CATCHER GAME LOOP (requestAnimationFrame) ──────────────────
  const startCatcherLoop = () => {
    lastTimeRef.current = null;

    const loop = (timestamp) => {
      if (!gameActiveRef.current) return;

      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      // Move catcher
      let x = catcherXRef.current;
      x += catcherDirRef.current * catcherSpeedRef.current * delta;

      const leftBound  = 0;
const rightBound = SCREEN_WIDTH - CATCHER_WIDTH;

      if (x >= rightBound) { x = rightBound; catcherDirRef.current = -1; }
      if (x <= leftBound)  { x = leftBound;  catcherDirRef.current = 1; }

      catcherXRef.current = x;
      catcherX.setValue(x);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // ─── START GAME ─────────────────────────────────────────────────
  const startGame = () => {
    // Reset all state
    scoreRef.current      = 0;
    droppingRef.current   = false;
    gameActiveRef.current = true;
    catcherDirRef.current = 1;
    catcherSpeedRef.current = BASE_SPEED;
    catcherXRef.current   = SCREEN_WIDTH / 2 - CATCHER_WIDTH / 2;

    catcherX.setValue(SCREEN_WIDTH / 2 - CATCHER_WIDTH / 2);
    durianY.setValue(DURIAN_START_Y);
    durianOpacity.setValue(1);
    screenShake.setValue(0);
    durianScale.setValue(1);
    catchFlash.setValue(0);

    setScore(0);
    setDropping(false);
    setGameActive(true);
    setScreen(S_GAME);

    resumeMusic();
    setTimeout(() => startCatcherLoop(), 300);
  };

  // Pause functionality removed per request

  const quitToMenu = () => {
    // Reset core refs/state in required order
    gameActiveRef.current = false;
    droppingRef.current = false;
    lastTimeRef.current = null;
    // pause state removed
    setGameActive(false);
    setDropping(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Reset animated values
    catcherX.setValue(SCREEN_WIDTH / 2 - CATCHER_WIDTH / 2);
    durianY.setValue(DURIAN_START_Y);
    durianOpacity.setValue(1);
    screenShake.setValue(0);
    catchFlash.setValue(0);
    durianScale.setValue(1);
    scorePop.setValue(1);

    // Restart music and idle animations for main menu
    resumeMusic();
    startIdleAnimations();

    // Go to main menu last
    setScreen(S_START);
  };

  // ─── TAP HANDLER ────────────────────────────────────────────────
  const handleTap = () => {
    if (!gameActiveRef.current || droppingRef.current) return;

    droppingRef.current = true;
    setDropping(true);

    // Drop the durian
    Animated.timing(durianY, {
      toValue: DURIAN_START_Y + DURIAN_TRAVEL,
      duration: DROP_DURATION,
      useNativeDriver: true,
    }).start(() => {
      checkCatch();
    });
  };

  // ─── CATCH CHECK ────────────────────────────────────────────────
  const checkCatch = () => {
      const catcherCenter = catcherXRef.current + CATCHER_WIDTH / 2;
      const durianCenterX = DURIAN_X + DURIAN_SIZE / 2;
      const catchZoneHalf = 40; // half of the 80px catch box width
      const caught = Math.abs(durianCenterX - catcherCenter) <= catchZoneHalf;

    if (caught) {
      handleCatch();
    } else {
      handleMiss();
    }
  };

  // ─── CATCH SUCCESS ──────────────────────────────────────────────
  const handleCatch = () => {
    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);

    // Speed up catcher
    catcherSpeedRef.current = Math.min(BASE_SPEED + newScore * SPEED_INC, MAX_SPEED);

    Vibration.vibrate(40);

    const playCatchSound = async () => {
      try {
        if (catchSoundRef.current) {
          await catchSoundRef.current.replayAsync();
        }
      } catch (e) {}
    };
    playCatchSound();
    // Animations: durian scale+fade and a white flash
    setFlashColor("white");
    Animated.parallel([
      Animated.parallel([
        Animated.timing(durianScale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(durianOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(catchFlash, { toValue: 0.5, duration: 80, useNativeDriver: true }),
        Animated.timing(catchFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(scorePop, { toValue: 1.5, duration: 100, useNativeDriver: true }),
        Animated.timing(scorePop, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // reset for next drop
      durianScale.setValue(1);
      durianY.setValue(DURIAN_START_Y);
      durianOpacity.setValue(1);
      catchFlash.setValue(0);
      setFlashColor(null);
      droppingRef.current = false;
      setDropping(false);
    });
  };

  // ─── MISS / GAME OVER ───────────────────────────────────────────
  const handleMiss = () => {
    gameActiveRef.current = false;
    setGameActive(false);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // crunch vibration pattern
    Vibration.vibrate([0, 80, 50, 80]);

    const playMissSound = async () => {
      try {
        if (missSoundRef.current) {
          await missSoundRef.current.replayAsync();
        }
      } catch (e) {}
    };
    playMissSound();

    pauseMusic();
    // Screen shake pattern
    Animated.sequence([
      Animated.timing(screenShake, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: 12,  duration: 40, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: -8,  duration: 35, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: 8,   duration: 35, useNativeDriver: true }),
      Animated.timing(screenShake, { toValue: 0,   duration: 40, useNativeDriver: true }),
    ]).start();

    // Flash red and splat durian before navigating to Game Over
    setFlashColor("red");
    Animated.parallel([
      Animated.parallel([
        Animated.timing(durianScale, { toValue: 1.6, duration: 200, useNativeDriver: true }),
        Animated.timing(durianOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(catchFlash, { toValue: 0.5, duration: 80, useNativeDriver: true }),
        Animated.timing(catchFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // reset visual values and then go to Game Over
      durianScale.setValue(1);
      durianY.setValue(DURIAN_START_Y);
      durianOpacity.setValue(1);
      catchFlash.setValue(0);
      setFlashColor(null);

      const final = scoreRef.current;
      setBestScore(prev => Math.max(prev, final));
      setScreen(S_GAMEOVER);
    });
  };

  // ─── DIFFICULTY LABEL ───────────────────────────────────────────
  const diffLabel = score < 5  ? "► EASY"
    : score < 10 ? "►► MED"
    : score < 20 ? "▶▶ HARD"
    : "!! INSANE";

  const diffColor = score < 5  ? "#40c040"
    : score < 10 ? "#c0c040"
    : score < 20 ? "#c08040"
    : "#e03030";

  // ════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === S_LOADING) {
    const dotsOpacity1 = loadingDotsAnim.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.25, 1, 0.25, 0.25],
    });
    const dotsOpacity2 = loadingDotsAnim.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.25, 0.25, 1, 0.25],
    });
    const dotsOpacity3 = loadingDotsAnim.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [1, 0.25, 0.25, 1],
    });

    return (
      <Animated.View
        style={[
          styles.loadingScreen,
          { opacity: Animated.multiply(loadingOpacity, loadingFadeOut) },
        ]}
      >
        <Animated.Image
          source={require("./assets/images/durian-logo.png")}
          style={[
            styles.loadingLogo,
            {
              opacity: loadingOpacity,
              transform: [{ scale: loadingScale }],
            },
          ]}
          resizeMode="contain"
        />

        <Animated.Text style={[styles.loadingTitle, { opacity: loadingOpacity }]}>
          DURIAN CATCHER
        </Animated.Text>
        <Animated.Text style={[styles.loadingTagline, { opacity: loadingOpacity }]}>
          🌴 Durian Harvest 🌴
        </Animated.Text>

        <View style={styles.loadingDotsRow} pointerEvents="none">
          <Animated.Text style={[styles.loadingDot, { opacity: dotsOpacity1 }]}>·</Animated.Text>
          <Animated.Text style={[styles.loadingDot, { opacity: dotsOpacity2 }]}>·</Animated.Text>
          <Animated.Text style={[styles.loadingDot, { opacity: dotsOpacity3 }]}>·</Animated.Text>
        </View>
      </Animated.View>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // START SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === S_START) {
    // pause state removed
    return (
      <ImageBackground
        source={require("./assets/images/background.png")}
        style={styles.fullScreen}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay} />

        <Animated.View
          style={{
            alignItems: "center",
            transform: [{
              translateY: titleBounce.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, -10, 0, -10, 0],
              }),
            }],
          }}
        >
          <Text style={styles.titleMain}>DURIAN</Text>
          <Text style={styles.titleSub}>CATCHER</Text> 
        </Animated.View>

        <Text style={styles.tagline}>Tarunga og salo boi.</Text>

        <Animated.Image
          source={require("./assets/images/durian.png")}
          style={[
            styles.durianPreview,
            {
              transform: [{
                translateX: durianWobble.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, 8, 0, -8, 0],
                }),
              }],
            },
          ]}
          resizeMode="contain"
        />

        <View style={styles.instructBox}>
          <Text style={styles.instructText}>TAP TO DROP THE DURIAN{"\n"}LAND IT IN THE SACK</Text>
          <View style={styles.instructDivider} />
          <Text style={styles.instructWarn}>ONE MISS = GAME OVER</Text>
        </View>

        <Pressable style={styles.playBtn} onPress={startGame}>
          {({ pressed }) => (
            <Text style={[styles.playBtnText, pressed && { opacity: 0.7 }]}>► PLAY</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>🌴 🌴</Text>
      </ImageBackground>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // GAME OVER SCREEN
  // ════════════════════════════════════════════════════════════════
  if (screen === S_GAMEOVER) {
    // pause state removed
    return (
      <ImageBackground
        source={require("./assets/images/background.png")}
        style={styles.fullScreen}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay} />

        <Text style={{ fontSize: 64 }}>💥</Text>
        <Text style={styles.splatText}>SPLAT!</Text>
        <Text style={styles.splatSub}>THE DURIAN HIT THE GROUND</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardLabel}>SCORE</Text>
          <Text style={styles.scoreCardValue}>{score}</Text>
          <View style={styles.scoreCardDivider} />
          <Text style={styles.scoreCardLabel}>BEST</Text>
          <Text style={styles.scoreCardBest}>{bestScore}</Text>
        </View>

        <Text style={styles.funMsg}>
          {score === 0  ? "EVEN DURIANS HAVE STANDARDS 😂"
          : score < 5   ? "KEEP TRYING, HARVESTER! 🌴"
          : score < 10  ? "THE VILLAGE IS IMPRESSED! 👏"
          : score < 20  ? "MASTER HARVESTER! 🏆"
          : "LEGENDARY DURIAN KING! 👑"}
        </Text>

        <Pressable style={styles.playBtn} onPress={startGame}>
          {({ pressed }) => (
            <Text style={[styles.playBtnText, pressed && { opacity: 0.7 }]}>► TRY AGAIN</Text>
          )}
        </Pressable>

        <Pressable style={styles.menuBtn} onPress={quitToMenu}>
          <Text style={styles.menuBtnText}>MAIN MENU</Text>
        </Pressable>
      </ImageBackground>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════════════════════════════
  return (
    <Animated.View style={[styles.gameScreen, { transform: [{ translateX: screenShake }] }] }>
      <Pressable style={{ flex: 1 }} onPress={handleTap}>
        <StatusBar hidden={true} />

        {/* Background — full screen stretched to fill */}
        <Image
          source={require("./assets/images/background.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          }}
          resizeMode="stretch"
        />

        {/* Content wrapper (was screen-shake wrapper) */}
        <View style={StyleSheet.absoluteFill}>

          {/* Catcher + detection zone (unified) */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: GROUND_Y - CATCHER_HEIGHT,
              width: CATCHER_WIDTH,
              height: CATCHER_HEIGHT,
              transform: [{ translateX: catcherX }],
            }}
          >
            <Image
              source={require("./assets/images/catcher.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Score HUD */}
          <View style={styles.hud} pointerEvents="none">
            <Animated.Text style={[styles.scoreHud, { transform: [{ scale: scorePop }] }]}>
              {score}
            </Animated.Text>
            <Text style={styles.scoreHudLabel}>DURIANS CAUGHT</Text>
          </View>

          {/* Difficulty badge */}
          <View style={styles.diffBadge} pointerEvents="none">
            <Text style={[styles.diffText, { color: diffColor }]}>{diffLabel}</Text>
          </View>
          

          {/* Durian */}
          <Animated.Image
            source={require("./assets/images/durian.png")}
            style={[
              styles.durian,
              {
                transform: [{ translateY: durianY }, { scale: durianScale }],
                opacity: durianOpacity,
              },
            ]}
            resizeMode="contain"
          />

          {/* Drop guide dashes */}
          {!dropping && (
            <View style={styles.dropGuide} pointerEvents="none">
              {[...Array(16)].map((_, i) => (
                <View key={i} style={styles.dropDash} />
              ))}
            </View>
          )}

          {/* Tap hint */}
          {!dropping && (
            <View style={styles.tapHint} pointerEvents="none">
              <Text style={styles.tapHintText}>▼ TAP TO DROP ▼</Text>
            </View>
          )}

        </View>
      </Pressable>

      {/* Flash overlay (white for catch, red for miss) */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: flashColor === "red" ? "#ff000066" : "#ffffff", opacity: catchFlash },
        ]}
      />
    </Animated.View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#0d1f0d",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingLogo: {
    width: 220,
    height: 220,
    marginBottom: 22,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: GOLD,
    fontFamily: "monospace",
    letterSpacing: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  loadingTagline: {
    fontSize: 12,
    color: "#80c060aa",
    fontFamily: "monospace",
    letterSpacing: 2,
    marginBottom: 28,
    textAlign: "center",
  },
  loadingDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingDot: {
    fontSize: 24,
    color: "#f5c842aa",
    fontFamily: "monospace",
    fontWeight: "900",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000055",
  },
  gameScreen: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ── Start / GameOver shared ──
  crownIcon: { fontSize: 48, textAlign: "center" },
  titleMain: {
    fontSize: 56, fontWeight: "900", color: GOLD,
    letterSpacing: 10, textAlign: "center",
    fontFamily: "monospace",
    textShadowColor: GOLD_D, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
  },
  titleSub: {
    fontSize: 56, fontWeight: "900", color: WHITE,
    letterSpacing: 14, textAlign: "center",
    fontFamily: "monospace",
    textShadowColor: "#333", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
    marginTop: -8,
  },
  tagline: {
    fontSize: 10, color: "#ffffffaa", letterSpacing: 4,
    fontFamily: "monospace", marginTop: 8, marginBottom: 16,
  },
  durianPreview: {
    width: 120, height: 120, marginVertical: 12,
  },
  instructBox: {
    borderWidth: 3, borderColor: GOLD,
    backgroundColor: "#1a0a00cc",
    padding: 20, alignItems: "center",
    minWidth: 280, marginVertical: 16,
  },
  instructText: {
    fontSize: 12, color: "#80c060", fontFamily: "monospace",
    textAlign: "center", lineHeight: 22, letterSpacing: 1,
  },
  instructDivider: { width: 80, height: 1, backgroundColor: GOLD_D, marginVertical: 10 },
  instructWarn: {
    fontSize: 12, color: GOLD, fontFamily: "monospace",
    fontWeight: "900", letterSpacing: 2,
  },
  playBtn: {
    backgroundColor: GOLD,
    paddingVertical: 14, paddingHorizontal: 40,
    borderWidth: 3, borderColor: "#fff4",
    borderBottomColor: "#0006", borderRightColor: "#0004",
    marginBottom: 12,
  },
  playBtnText: {
    fontSize: 18, fontWeight: "900", color: "#1a0a00",
    letterSpacing: 4, fontFamily: "monospace",
  },
  menuBtn: {
    borderWidth: 2, borderColor: "#ffffff44",
    paddingVertical: 10, paddingHorizontal: 32,
  },
  menuBtnText: {
    fontSize: 13, color: "#ffffffaa",
    fontFamily: "monospace", letterSpacing: 4,
  },
  footer: {
    fontSize: 10, color: "#ffffff55",
    marginTop: 20, fontFamily: "monospace", letterSpacing: 2,
  },

  // ── Game Over ──
  splatText: {
    fontSize: 48, fontWeight: "900", color: RED,
    letterSpacing: 8, fontFamily: "monospace",
    textShadowColor: "#880000", textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0,
  },
  splatSub: {
    fontSize: 10, color: "#c8a060", letterSpacing: 3,
    fontFamily: "monospace", marginBottom: 24,
  },
  scoreCard: {
    borderWidth: 3, borderColor: GOLD,
    backgroundColor: "#1a0a00cc",
    paddingVertical: 20, paddingHorizontal: 48,
    alignItems: "center", marginBottom: 20,
  },
  scoreCardLabel: {
    fontSize: 10, color: "#80a060", letterSpacing: 4, fontFamily: "monospace",
  },
  scoreCardValue: {
    fontSize: 64, fontWeight: "900", color: WHITE,
    fontFamily: "monospace",
    textShadowColor: "#000", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
  },
  scoreCardDivider: { width: 60, height: 1, backgroundColor: GOLD_D, marginVertical: 10 },
  scoreCardBest: {
    fontSize: 40, fontWeight: "900", color: GOLD, fontFamily: "monospace",
  },
  funMsg: {
    fontSize: 11, color: "#c8a060", fontFamily: "monospace",
    textAlign: "center", marginBottom: 24, fontStyle: "italic",
  },

  // ── Game Screen ──
  hud: {
    position: "absolute", top: 40, left: 0, right: 0, alignItems: "center",
  },
  scoreHud: {
    fontSize: 72, fontWeight: "900", color: GOLD,
    fontFamily: "monospace",
    textShadowColor: "#000", textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
    lineHeight: 80,
  },
  scoreHudLabel: {
    fontSize: 10, color: "#ffffffaa", letterSpacing: 3, fontFamily: "monospace",
  },
  diffBadge: {
    position: "absolute", top: 44, right: 16,
    backgroundColor: "#00000088",
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 2, borderColor: "#2a4a1a",
  },
  diffText: { fontSize: 10, fontFamily: "monospace", fontWeight: "900" },
  durian: {
    position: "absolute",
    left: DURIAN_X,
    top: 0,
    width: DURIAN_SIZE,
    height: DURIAN_SIZE,
  },
  dropGuide: {
    position: "absolute",
    left: SCREEN_WIDTH / 2 - 1,
    top: DURIAN_START_Y + DURIAN_SIZE,
    alignItems: "center",
  },
  dropDash: {
    width: 2, height: 5,
    backgroundColor: "#ffffff50",
    marginBottom: 8,
  },
  catcher: {
    position: "absolute",
    top: SCREEN_HEIGHT * 1.0 - 110,
    width: 180,
    height: 180,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: "flex-start",
  },
  groundBricks: {
    flexDirection: "row",
    height: 14,
    width: "100%",
  },
  brick: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#00000030",
  },
  tapHint: {
    position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center",
  },
  tapHintText: {
    fontSize: 10, color: "#ffffff50", letterSpacing: 4, fontFamily: "monospace",
  },
});