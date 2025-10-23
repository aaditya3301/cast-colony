# Cast Colony 🏰

A multiplayer strategy game built as a Farcaster Mini App on Base chain. Claim territory, harvest resources, and battle for onchain pixel art supremacy!

## 🎮 Game Features

- **Territory Claiming**: Claim tiles on a shared game map
- **Resource Harvesting**: Collect resources from your claimed territories
- **Strategic Battles**: Engage in tactical combat with other players
- **Onchain Assets**: All game assets are stored on Base blockchain
- **Farcaster Integration**: Native Mini App experience within Farcaster

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **Blockchain**: Base (Ethereum L2)
- **Platform**: Farcaster Mini App SDK
- **Language**: TypeScript

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cast-colony
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the game

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Farcaster Mini App

Cast Colony is built as a Farcaster Mini App with:

- **Manifest**: Located at `/.well-known/farcaster.json`
- **SDK Integration**: Automatic initialization and splash screen handling
- **Embed Support**: Rich previews when shared in casts
- **Mobile Optimized**: Touch-friendly interface for mobile gameplay

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── FarcasterSDK.tsx # Farcaster Mini App integration
│   ├── GameMap.tsx      # Main game map component
│   └── ...
├── context/             # React context providers
└── types/               # TypeScript type definitions

public/
├── .well-known/
│   └── farcaster.json   # Farcaster Mini App manifest
└── assets/              # Game assets and icons
```

## 🎯 Game Mechanics

### Territory System
- Players can claim unclaimed tiles on the game map
- Each tile has different resource generation rates
- Claimed tiles generate resources over time

### Resource Management
- Multiple resource types with different utilities
- Resources can be harvested from claimed territories
- Strategic resource allocation affects gameplay

### Battle System
- Turn-based tactical combat
- Territory control influences battle outcomes
- Risk/reward mechanics for aggressive expansion

## 🔗 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Deploy with default Next.js settings
3. Ensure environment variables are configured

### Farcaster Registration
1. Deploy to a public URL
2. Verify `/.well-known/farcaster.json` is accessible
3. Submit to Farcaster Mini App directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
