# 📱 Mivo Mobile — React Native & Expo

<div align="center">

```
  __  __ _____     ______     __  __  ____  ____ _____ _      ______ 
 |  \/  |_ _\ \   / / __ \   |  \/  |/ __ \|  _ \_   _| |    |  ____|
 | |\/| || | \ \ / / |  | |  | \  / | |  | | |_) || | | |    | |__   
 | |  | || |  \ V /| |__| |  | |\/| | |  | |  _ < | | | |    |  __|  
 |_|  |_|___|  \_/  \____/   |_|  |_|\____/|_| \_\___|_|____|______| 
```

**Next-Generation Unified Real-Time Communication & Stage Platform for iOS & Android**

[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-764ABC?style=for-the-badge)](https://zustand.docs.pmnd.rs/)

</div>

---

## 🌟 Overview

**Mivo Mobile** brings Mivo's signature **Unified Communication Stage** directly to mobile devices. It allows users to fluidly morph between text discussions, audio huddles, and video stages without leaving the conversation room or dropping WebRTC connections.

Built on **Expo SDK 52** and **Expo Router**, this repository is a standalone mobile app configured with dedicated API and Socket.io clients tailored for the Mivo backend.

---

## 🚀 Key Features

* 🎛️ **Unified Room Stage**: Seamlessly transition mobile room context between `TEXT`, `VOICE`, `VIDEO`, and `STREAM` modes at the touch of a pill.
* 🎙️ **Live Participant Audio/Video Grid**: Real-time participant tiles with speaking green pulse halos, mute indicators, and host crown tags.
* 💬 **Rich Direct & Channel Messaging**:
  * Real-time text messaging over WebSockets with reply preview bars.
  * Channel navigation and direct messaging with unread badges and live status dots.
* ⚡ **Dynamic Server Configuration**:
  * Switch between `localhost`, Android emulator (`10.0.2.2`), and local Wi-Fi IP address directly from the login screen or profile settings without modifying code.
* 🛡️ **Zero-Friction Authentication**:
  * Persistent token storage via `@react-native-async-storage/async-storage`.
  * Demo guest access for instant testing and onboarding.
* 🎨 **Mivo Design System**:
  * Optimized dark mode with high contrast slate backgrounds, electric indigo accents, and ruby-red call controls.

---

## 📂 Project Architecture

```
Mivo-mobile/
├── app/                        # Expo Router File-Based Routing
│   ├── _layout.tsx             # Root Layout & Global Socket Initializer
│   ├── index.tsx               # Auth Gateway Check
│   ├── (auth)/                 # Authentication Flow
│   │   ├── _layout.tsx
│   │   ├── login.tsx           # Mobile Sign-In + Guest Quick Join
│   │   └── register.tsx        # Account Creation
│   ├── (tabs)/                 # Bottom Tab Navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Communities & Channels Browser
│   │   ├── conversations.tsx   # Direct & Group Chats List
│   │   ├── activities.tsx      # Alerts & Notifications Feed
│   │   └── profile.tsx         # User Profile, Status & Settings
│   ├── chat/[id].tsx           # Interactive Full Chat View
│   ├── room/[id].tsx           # Unified Room Stage Screen
│   └── settings/server.tsx     # Dynamic Endpoint Configuration Modal
├── src/
│   ├── api/                    # REST API Client & Service Endpoints
│   │   ├── api-client.ts       # Fetch wrapper with JWT injection & timeout
│   │   ├── auth.api.ts         # Login, Register, Profile
│   │   ├── communities.api.ts  # Communities & Channels
│   │   ├── conversations.api.ts# DMs & Chat History
│   │   └── rooms.api.ts        # Stage Room Details & Mode Morphing
│   ├── components/             # Reusable Mivo Mobile UI Primitives
│   │   ├── Avatar.tsx          # Status-aware Avatar
│   │   ├── Badge.tsx           # Channel & Mode Badges
│   │   ├── Button.tsx          # Haptic-enabled Touchables
│   │   ├── Input.tsx           # Form Input with Left/Right Icons
│   │   ├── MessageBubble.tsx   # Chat Message with Quotes & Reactions
│   │   ├── ModeSelector.tsx    # TEXT / VOICE / VIDEO / STREAM Morph Pills
│   │   └── ParticipantTile.tsx # Audio/Video Grid Card with Pulse Ring
│   ├── constants/              # Theme Tokens & WebSocket Events
│   │   ├── events.ts           # Realtime Event Dictionary
│   │   └── theme.ts            # Palette, Typography, Spacing
│   ├── stores/                 # Zustand Global State
│   │   ├── useAuthStore.ts     # User Session & JWT Token
│   │   ├── useCommunityStore.ts# Active Community & Channels
│   │   ├── useConfigStore.ts   # Dynamic Server IP / URL Store
│   │   ├── useConversationStore.ts # Messages & Real-Time Typing
│   │   └── useRoomStore.ts     # Stage Room, Mode & Media Controls
│   └── types/                  # TypeScript Domain Definitions
│       └── index.ts            # DTOs ported from Mivo Shared
├── app.json                    # Expo Manifest
├── babel.config.js             # Babel Preset
├── metro.config.js             # Metro Bundler Config
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites

* **Node.js**: v18.0.0 or later (v20+ recommended)
* **pnpm** or **npm**
* **Expo Go** app on your iOS or Android phone (available in App Store / Google Play)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/din-esh-kumar/Mivo-mobile.git
cd Mivo-mobile

# Install dependencies
pnpm install
# or
npm install
```

### 2. Configure Backend Endpoints

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the API & Socket.io server endpoints:
* **Web Browser / iOS Simulator**: `http://localhost:4000`
* **Android Emulator**: `http://10.0.2.2:4000`
* **Physical Phone (Expo Go)**: `http://<YOUR_COMPUTER_WIFI_IP>:4000` (e.g. `http://192.168.1.5:4000`)

> 💡 **Tip**: You can also change the server endpoint dynamically at runtime inside the app by tapping **"Server Endpoint"** on the login screen or in Profile Settings!

### 3. Start Development Server

```bash
npx expo start
```

* Press `a` to run on an attached **Android device / emulator**.
* Press `i` to run on an **iOS simulator**.
* Press `w` to open a **Web preview**.
* Scan the QR code in your terminal with the **Expo Go** camera (Android) or the native Camera app (iOS).

---

## 📦 Building for Production

To build standalone APKs or iOS bundles using Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build Android APK
eas build -p android --profile preview

# Build iOS App
eas build -p ios --profile preview
```

---

## 📄 License

Proprietary — Mivo Ecosystem. All rights reserved.
