import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { CONFIG } from "../constants/gameConfig";

const { C, SCREEN_WIDTH, SCREEN_HEIGHT } = CONFIG;

// ─── TREE PIXEL ART (start screen only) ─────────────────────────
export const TREE_PIXELS = [
  "..LLLLLLLL..",
  ".LLLLLLLLLL.",
  "LLLLLLLLLLLL",
  "LLLLDLLLLLLL",
  "LLLDDDLLLLL.",
  ".LLDDDLLLLL.",
  "..LLDDLLLLL.",
  "...LLLLLLL..",
  "....BBBBB...",
  "....BBBBB...",
];
export const TREE_MAP = {
  L: C.T_LEAF, D: C.T_LEAF_D, B: C.T_BARK, ".": null,
};

// ─── PIXEL ART RENDERER ─────────────────────────────────────────
export function PixelArt({ pixels, colorMap, pixelSize = 4, style }) {
  return (
    <View style={[{ flexDirection: "column" }, style]}>
      {pixels.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: "row" }}>
          {row.split("").map((char, colIdx) => {
            const color = colorMap[char];
            return color ? (
              <View key={colIdx} style={{ width: pixelSize, height: pixelSize, backgroundColor: color }} />
            ) : (
              <View key={colIdx} style={{ width: pixelSize, height: pixelSize }} />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── PIXEL TEXT ─────────────────────────────────────────────────
export function PixelText({ children, size = 16, color = C.WHITE, style }) {
  return (
    <Text style={[{
      fontSize: size, color, fontWeight: "900", letterSpacing: 2,
      textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 0, fontFamily: "monospace",
    }, style]}>
      {children}
    </Text>
  );
}

// ─── PIXEL BUTTON ───────────────────────────────────────────────
export function PixelButton({ label, onPress, color = C.GOLD, textColor = "#1a0a00" }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{
          backgroundColor: pressed ? C.GOLD_D : color,
          paddingVertical: 14, paddingHorizontal: 36,
          borderWidth: 3,
          borderColor: pressed ? C.GOLD_D : "#fff4",
          borderBottomColor: "#0006", borderRightColor: "#0004",
          transform: pressed ? [{ translateY: 2 }] : [],
        }}>
          <Text style={{
            fontSize: 17, fontWeight: "900", color: textColor,
            letterSpacing: 4, fontFamily: "monospace",
          }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── PIXEL BOX ──────────────────────────────────────────────────
export function PixelBox({ children, style }) {
  return (
    <View style={[{
      borderWidth: 3, borderColor: C.GOLD,
      backgroundColor: "#1a0a00ee", padding: 20,
    }, style]}>
      <View style={{ position: "absolute", top: -3, left: -3, width: 6, height: 6, backgroundColor: C.PIXEL_BG }} />
      <View style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, backgroundColor: C.PIXEL_BG }} />
      <View style={{ position: "absolute", bottom: -3, left: -3, width: 6, height: 6, backgroundColor: C.PIXEL_BG }} />
      <View style={{ position: "absolute", bottom: -3, right: -3, width: 6, height: 6, backgroundColor: C.PIXEL_BG }} />
      {children}
    </View>
  );
}

// ─── START / GAMEOVER BACKGROUND ────────────────────────────────
export function PixelBackground() {
  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={{
        position: "absolute", top: 0, left: 0,
        right: 0, bottom: 0,
      }}
      resizeMode="cover"
    >
      {/* Dark overlay so text is readable */}
      <View style={{
        flex: 1,
        backgroundColor: "#00000066",
      }} />
    </ImageBackground>
  );
}

// ─── GAME BACKGROUND (full screen image) ────────────────────────
export function GameBackground() {
  return (
    <Image
      source={require("../assets/images/background.png")}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      }}
      resizeMode="cover"
    />
  );
}

// ─── ENTITY RENDERERS ───────────────────────────────────────────

// Durian — now uses real image with transparent background handling
export function DurianRenderer({ position, size, opacity }) {
  return (
    <View style={{
      position: "absolute",
      left: position[0],
      top: position[1],
      width: 70,
      height: 70,
      opacity: opacity ?? 1,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <Image
        source={require("../assets/images/durian.png")}
        style={{
          width: 70,
          height: 70,
          resizeMode: "contain",
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
}

// Catcher — real sprite image with transparent background
export function CatcherRenderer({ position, width }) {
  return (
    <View style={{
      position: "absolute",
      left: position[0],
      top: position[1],
      width: width,
      alignItems: "center",
      backgroundColor: "transparent",
    }}>
      <Image
        source={require("../assets/images/catcher.png")}
        style={{
          width: 120,
          height: 120,
          resizeMode: "contain",
          backgroundColor: "transparent",
        }}
      />
      {/* Gold catch zone bar */}
      <View style={{
        width: width,
        height: 4,
        backgroundColor: C.GOLD,
        marginTop: 2,
        shadowColor: C.GOLD,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
      }} />
    </View>
  );
}

// Ground — pixel brick strip
export function GroundRenderer({ position, width, height }) {
  const cols = Math.ceil(width / 12);
  return (
    <View style={{
      position: "absolute",
      left: position[0],
      top: position[1],
      width, height,
      backgroundColor: "transparent",
    }}>
      {/* Brick row */}
      <View style={{ flexDirection: "row", height: 12 }}>
        {[...Array(cols)].map((_, i) => (
          <View key={i} style={{
            width: 12, height: 12,
            backgroundColor: i % 2 === 0 ? "#c8906040" : "#a07040",
            borderWidth: 1,
            borderColor: "#00000030",
          }} />
        ))}
      </View>
    </View>
  );
}

// Tree canopy renderer (start screen)
export function TreeRenderer({ position }) {
  const pixelSize = Math.floor(SCREEN_WIDTH / 12);
  return (
    <View style={{
      position: "absolute",
      left: position[0],
      top: position[1],
      alignItems: "center",
      opacity: 0.85,
    }}>
      <PixelArt pixels={TREE_PIXELS} colorMap={TREE_MAP} pixelSize={pixelSize} />
    </View>
  );
}