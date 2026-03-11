# DURIAN CATCHER
### A Davao Durian Harvest Game

> One button. One life. Don't miss the sack.

---

## 🎮 Game Concept
You play as a durian harvester high up in a tree. A catcher moves left and right on the ground below holding a sack. Tap the screen at the right moment to drop the durian into the sack. Miss once — the durian splats on the ground and the game ends immediately.

Each successful catch makes the catcher move faster, increasing difficulty.

---

## 🚀 Setup & Run

### 1. Create the Expo project
```bash
npx create-expo-app crown-fall
cd crown-fall
```

### 2. Replace App.js
Copy the provided `App.js` into your project root, replacing the default one.

### 3. Start the app
```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## ✅ Lab Requirements Checklist

| Requirement | Status |
|---|---|
| One Button (screen tap) | ✅ |
| One Life (miss = instant game over) | ✅ |
| Start Screen | ✅ |
| Game Screen | ✅ |
| Game Over Screen | ✅ |
| Score Counter | ✅ |
| Restart Button | ✅ |
| Basic UI Styling | ✅ |
| useState | ✅ |
| useEffect | ✅ |
| Conditional Rendering | ✅ |
| Pressable component | ✅ |
| Animated mechanic | ✅ (Animated API) |

## 🏆 Bonus Features Implemented
- Haptic feedback via `Vibration` on catch and miss
- Screen shake animation on death
- Score pop animation on successful catch
- Difficulty scaling (catcher speeds up every catch)
- Dynamic fun messages based on score
- Difficulty label (Easy → Medium → Hard → Insane)

---

## 🌴 Game Screens

### Start Screen
- Game title with bounce animation
- Durian wobble animation
- Instructions
- TAP TO PLAY button

### Game Screen
- Live score display
- Animated durian drops from center top
- Catcher moves left/right, speeding up over time
- Tap anywhere = drop the durian
- Difficulty indicator

### Game Over Screen
- Score + Best Score card
- Fun message based on score
- TRY AGAIN / MAIN MENU buttons

---

## 💡 How Difficulty Scales
```
Speed = max(500ms, 1800ms - score × 80ms)
```
- Score 0:  1800ms per sweep (slow)
- Score 5:  1400ms per sweep
- Score 10: 1000ms per sweep
- Score 16: 500ms per sweep (max speed)

---

## 🎨 Design
- Dark jungle / harvest night theme
- Gold (#f5c842) accent color — referencing durian's golden value
- Deep brown background — earthy Davao soil
- Brutalist typography with hard shadows

---

*Inspired by the real durian harvest culture of Davao City, Philippines* 🌴
