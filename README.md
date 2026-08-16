# 🐍 BLOCK SNAKE 3D — Retro Voxel Snake Game

**BLOCK SNAKE 3D** is a browser-based **3D voxel snake game** built with **HTML, CSS, JavaScript, and Three.js**.

Navigate through a neon voxel world, collect apples to grow, avoid your own tail and obstacles, and survive as long as possible.

The game features a retro **16-bit / voxel-inspired visual style**, real-time HUD elements, boost and jump mechanics, campaign and endless game modes, desktop keyboard controls, and mobile touch controls.

---

# ✨ Features

🎮 **3D Voxel Gameplay**

* Explore a block-style 3D game world
* Retro 16-bit inspired visual design
* Built using Three.js WebGL

🍎 **Apple Collection**

* Collect apples to increase your score
* Track collected apples through the objective HUD
* Grow your snake as you progress

🐍 **Snake Growth**

* Snake length increases during gameplay
* Avoid colliding with your own tail
* Survive as long as possible

🚀 **Boost System**

* Use the BOOST ability to move faster
* Real-time boost meter
* Keyboard and touch support

🦘 **Jump System**

* Jump through the voxel environment
* Real-time jump meter
* SPACE key / mobile JUMP button

🎯 **Multiple Game Modes**

* ► START GAME
* ► ENDLESS MODE

📊 **Live HUD**

* Current score
* High score
* Snake length
* Current level
* Apple objective
* Boost meter
* Jump meter
* Game status controls

⚙️ **Settings**

* Audio ON/OFF
* Graphics quality settings
* Bloom ON/OFF
* In-game settings interface

⏸ **Pause System**

* Pause the game at any time
* Resume gameplay
* Restart the current game
* Supports `P` / `ESC`

📱 **Mobile Controls**

* Virtual joystick for steering
* Touch-based JUMP button
* Touch-based BOOST button
* Responsive mobile interface

🖥 **Standalone Desktop Mode**

* Includes a Windows launcher
* Starts a local PowerShell HTTP server
* Automatically opens the game in Microsoft Edge App Mode
* No browser address bar or tabs
* Automatically stops the local server after closing the game

---

# 🛠️ Technologies Used

| Technology        | Purpose                       |
| ----------------- | ----------------------------- |
| 🌐 HTML5          | Game interface and structure  |
| 🎨 CSS3           | UI, HUD and visual styling    |
| ⚡ JavaScript      | Game logic and interaction    |
| 🎮 Three.js       | 3D rendering and WebGL        |
| 🧊 WebGL          | Hardware-accelerated graphics |
| 🖥 PowerShell     | Local development server      |
| 📦 Microsoft Edge | Standalone App Mode           |

The project imports **Three.js v0.160.0** directly through a browser import map.

---

# 📂 Project Structure

```text
BLOCK-SNAKE-3D/
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   └── main.js
│
├── assets/
│   └── ...
│
├── server.ps1
├── launch.bat
├── launch.vbs
├── .gitignore
├── server.log
└── README.md
```

---

# ⚙️ Requirements

Before running the game, make sure you have:

* 🪟 Windows
* 🌐 Microsoft Edge
* 💻 A modern computer with WebGL support
* ⚡ PowerShell

No Python installation or `npm install` is required for the included launcher.

---

# 🚀 Running the Game

## Method 1 — Windows Launcher

Simply double-click:

```text
launch.bat
```

The launcher will:

1. Start the PowerShell local HTTP server
2. Use port `8000`
3. Wait for the server to initialize
4. Open Microsoft Edge in App Mode
5. Launch the game at:

```text
http://localhost:8000
```

6. Wait until the game window is closed
7. Terminate the background server

---

# ▶️ Manual Server Start

You can also start the server manually using PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```

The server runs at:

```text
http://localhost:8000/
```

Then open the address in Microsoft Edge.

---

# 🎮 Controls

## 🖥️ Desktop

| Key             | Action             |
| --------------- | ------------------ |
| `W`             | Move               |
| `A`             | Move               |
| `S`             | Move               |
| `D`             | Move               |
| `↑` `↓` `←` `→` | Move               |
| `SHIFT`         | Boost              |
| `SPACE`         | Jump               |
| `P`             | Pause              |
| `ESC`           | Pause / Exit pause |

---

## 📱 Mobile

Use the on-screen controls:

```text
        ┌─────────────┐
        │   JOYSTICK  │
        │    STEER    │
        └─────────────┘

              JUMP

             BOOST
```

The left virtual joystick controls movement.

The right-side buttons provide:

* JUMP
* BOOST

---

# 🎯 Gameplay

The objective is simple:

```text
ENTER THE VOXEL WORLD
        ↓
COLLECT APPLES 🍎
        ↓
GROW YOUR SNAKE 🐍
        ↓
AVOID YOUR TAIL
        ↓
AVOID OBSTACLES
        ↓
SURVIVE
        ↓
GET THE HIGHEST SCORE
```

The game HUD continuously displays:

```text
SCORE
HIGH SCORE

LENGTH
LEVEL

APPLES

BOOST
JUMP
```

---

# 🖥️ Game Interface

The game includes several interface screens:

### 🔄 Loading Screen

Displays the initialization process while the voxel world is being generated.

### 🐍 Start Screen

Provides:

* Game title
* Game description
* Controls
* Start Game
* Endless Mode

### ⏸ Pause Screen

Provides:

* Resume
* Restart

### ⚙️ Settings Screen

Provides:

* Audio
* Graphics
* Bloom

### 💀 Game Over Screen

Displays:

* Final Score
* High Score
* Apples
* Length
* Retry button

---

# 🎨 Visual Design

BLOCK SNAKE 3D uses a retro arcade-inspired interface featuring:

* 🟦 Neon blue interface elements
* 🟩 Voxel-style gameplay
* 🔲 Pixel panels
* 👾 Retro typography
* ✨ Glow and bloom effects
* 🎮 Arcade-inspired HUD
* 🌌 3D WebGL environment

The interface uses:

```text
Press Start 2P
Silkscreen
```

for the retro gaming aesthetic.

---

# 🌐 Three.js

The game uses **Three.js** for 3D rendering.

The browser import map loads:

```text
Three.js 0.160.0
```

from the official Three.js CDN:

```text
https://unpkg.com/three@0.160.0/
```

No local Three.js installation is required.

---

# 🖥️ Local Server

The project includes a lightweight PowerShell HTTP server.

The server:

* Runs on port `8000`
* Serves HTML files
* Serves CSS files
* Serves JavaScript files
* Serves JSON files
* Serves PNG/JPG/SVG assets
* Adds CORS headers
* Provides the game locally

Server address:

```text
http://localhost:8000/
```

---

# 📦 Supported Assets

The local server is configured to serve:

```text
.html
.css
.js
.json
.png
.jpg
.svg
```

Other file types are served as:

```text
application/octet-stream
```

---

# 🔧 Configuration

The server port can be changed inside:

```text
server.ps1
```

Current configuration:

```powershell
$port = 8000
```

If you change the port, also update the URL inside:

```text
launch.bat
```

For example:

```text
http://localhost:8000
```

---

# 🛡️ Git Ignore

Temporary and system-generated files are excluded using `.gitignore`.

Ignored files include:

```text
server.log
.DS_Store
Thumbs.db
*.tmp
```

---

# 🚀 Future Improvements

Possible future additions:

🔊 Advanced game sound effects

🎵 Background music

🏆 Global leaderboard

💾 Save/load game progress

🌍 More voxel environments

🐍 Different snake skins

🍎 More collectible items

👾 Enemy characters

🧱 More obstacle types

🌧️ Dynamic weather

🌅 Day/night cycle

🎮 Gamepad support

📱 Improved mobile optimization

🌐 Online multiplayer

🏆 Achievement system

📈 Detailed player statistics

---

# ⚠️ Disclaimer

This project is intended for **educational, experimental, and entertainment purposes**.

The game is provided as a browser-based personal project and should not be considered a professional commercial game engine or production-grade multiplayer system.

---

# 👨‍💻 Creator & Developer

**Chahek Sinha**

🎮 Project: **BLOCK SNAKE 3D**

📅 License: **MIT**

📅 Year: **2026**

---

# 📜 License

This project is licensed under the **MIT License**.

You are free to:

* Use the project
* Modify the source code
* Study the implementation
* Distribute copies
* Create derivative projects

subject to the terms of the MIT License.

---

# ⭐ Project

```text
╔══════════════════════════════════════╗
║          BLOCK SNAKE 3D              ║
║                                      ║
║       🐍  VOXEL EDITION  🍎          ║
║                                      ║
║      COLLECT • GROW • SURVIVE        ║
╚══════════════════════════════════════╝
```

**Enter the voxel world.
Collect apples.
Grow your snake.
Survive as long as possible. 🐍🍎🎮**
