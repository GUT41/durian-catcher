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

## 📝 Reflection

### What was your game idea?

My game idea was inspired by the real durian harvest culture of Davao City, Philippines — the durian capital of the country. I wanted to build something that felt local and personal rather than a generic game concept. The mechanic is simple: a durian falls from a tree and you have to tap the screen at the right moment to drop it into a farmer's sack below. The catcher moves left and right on his own, so the entire challenge comes from reading his position and timing your single tap correctly. I called it Durian Catcher, and the one-button, one-life rules of the Game Jam fit the concept perfectly — in real life, a falling durian either lands in the sack or it doesn't. There are no second chances.

### What was the most difficult part to implement?

The hardest part was getting the catch detection to feel fair and responsive. Because the catcher moves using a `requestAnimationFrame` game loop and the durian falls using React Native's `Animated` API, the two systems run on different timing mechanisms. Early versions had the catch zone either too forgiving or too strict, and it was difficult to visually debug because the hit box was invisible. I ended up building a temporary colored debug overlay — a red box for the full catcher width and a green box for the actual catch zone — so I could see exactly where detection was happening in real time. Tuning that catch zone to feel satisfying but not unfair took a lot of iteration. Getting the animations — the durian scale-and-fade on catch, the splat on miss, the screen shake, and the flash overlay — to all fire in the correct sequence without race conditions was also more complex than I expected.

### What would you improve with more time?

With more time I would add several things. First, I would implement persistent high score saving using AsyncStorage so the best score survives app restarts — I had this working but removed it due to Expo Go compatibility issues. Second, I would add walking animations to the farmer sprite so the character feels alive instead of sliding. Third, I would introduce variety in the gameplay — random wind that slightly shifts the durian mid-fall, different durian sizes worth different points, or even a night mode that makes the background darker and harder to see. I would also add a proper tutorial on the first launch so new players understand the mechanic immediately. Finally, I would replace the `expo-av` audio library with the newer `expo-audio` package before the SDK 54 deprecation deadline to keep the project future-proof.

---

*Inspired by the real durian harvest culture of Davao City, Philippines* 🌴
