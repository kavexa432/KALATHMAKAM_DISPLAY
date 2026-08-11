# KALATHMAKAM 2K26 - Leaderboard Application

A simplified, elegant leaderboard application for the KALATHMAKAM 2K26 Grand Arts Festival at MGM Model School, Ayiroor, Varkala.

## ✨ Features

This streamlined version includes only the essential components:

### 🏠 **Hero Section**
- Beautiful Malayalam cultural design
- Festival branding and information
- Direct navigation to leaderboard
- Responsive across all devices

### 🏆 **Leaderboard**
- **Live house standings** - Real-time points from competition results
- **House cards** with detailed stats (ASTRA, NOVA, ORION, VEGA)
- **Recent victories feed** - Shows latest competition winners
- **Points breakdown** - Visual progress bars and medal counts
- **Category filtering** - Filter by Music, Dance, Literary, Fine Arts
- **Auto-updates** every 30 seconds from Firebase

### 🔐 **Authentication**
- Google OAuth login for administrators
- Secure Firebase authentication
- Clean, modal-based login interface

## 🎨 Design System

The application features a sophisticated design matching your original UI:

- **Typography**: Cormorant Garamond (serif) + Manrope (sans-serif)
- **Colors**: 
  - ASTRA: Green (#10B981)
  - NOVA: Red (#EF4444) 
  - ORION: Blue (#3B82F6)
  - VEGA: Yellow (#F59E0B)
- **Background**: Warm cream (#FAF8F5) with subtle gradients
- **Components**: Glassmorphism cards, smooth animations, responsive grid

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - **Normal Website**: `http://localhost:5174/`
   - **Large Display Mode**: `http://localhost:5174/display`

## 📺 Display Mode

The application includes a **broadcast-style large display mode** specifically designed for TVs/projectors:

- Access at `/display` route (e.g., `http://localhost:5174/display`)
- **Fullscreen design** optimized for large screens
- **Real-time updates** with live clock and breaking news ticker
- **Auto-rotating content** (categories filter every 10 seconds)
- **No user interaction required** - designed for passive viewing
- **Broadcast-style UI** similar to sports/news channels

### Display Features:
- Live clock updating every second
- Breaking news ticker with scrolling updates
- 4 house score cards with medals and points
- Current champion highlight panel
- Recent victories live activity feed
- House leaderboard table
- Upcoming event with countdown timer
- Auto-updated from Firebase in real-time

## 🔧 Build & Deploy

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 📱 Responsive Design

- **Mobile**: Optimized touch interface, stacked layout
- **Tablet**: Balanced grid layout 
- **Desktop**: Full feature set with hover effects

## 🏗️ Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS 4 + Custom CSS
- **Backend**: Firebase (Auth + Firestore)
- **Build**: Vite 8
- **Icons**: Lucide React

## 📊 Data Structure

The leaderboard automatically computes house points from:
- **Published Results**: Firebase collection with event outcomes
- **House Points System**: CBSE-compliant scoring (1st=10pts, 2nd=7pts, 3rd=5pts)
- **Real-time Updates**: Firestore listeners for live data sync

## 🎯 Key Components

1. **`Hero.tsx`** - Landing section with festival branding
2. **`LeaderboardSection.tsx`** - Main leaderboard interface
3. **`Navbar.tsx`** - Navigation with authentication
4. **`LoginModal.tsx`** - Google OAuth modal
5. **`FestivalContext.tsx`** - Firebase data management

## 🔥 Firebase Configuration

Ensure your `.env` file contains:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

---

**Kalathmakam 2K26** - Where Art, Talent Flourishes. 🎨✨
