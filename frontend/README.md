# InsureAI Frontend

React (Vite) application for InsureAI.

## Tech
- React + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- React Context API (`AuthContext`)
- `react-i18next` (EN/HI/GU)
- PWA (`vite-plugin-pwa`)

## Structure
- `src/assets`
- `src/components`
- `src/pages`
- `src/services`
- `src/context`
- `src/hooks`
- `src/utils`

## Setup
1. Copy `.env.example` to `.env`.
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm run dev`

## Main Pages
- Home
- Policies (filters + search)
- PolicyDetails
- ComparePolicies
- Login/Register
- Dashboard
- PremiumCalculator

## Notes
- Dark mode toggle included.
- AI chatbot uses backend `/api/ai/chat`.
- Purchase flow uses backend payment intent endpoint.
