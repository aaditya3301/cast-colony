# Cast Colony 🏰

A fully onchain multiplayer strategy game built as a Farcaster Mini App on Base. Claim territory, harvest resources, battle for supremacy, and earn $TOMO tokens through innovative DeFi-gaming integration!

## 🎮 Game Features

- **Territory Claiming**: Claim tiles on a shared onchain game map
- **Resource Harvesting**: Collect resources from your claimed territories
- **Strategic Battles**: Engage in tactical combat with other players
- **Onchain Assets**: All game assets are stored on Base blockchain
- **Wallet Integration**: Connect with MetaMask, Coinbase Wallet, WalletConnect
- **Farcaster Native**: Built as a Mini App for seamless Farcaster experience

## 🎰 Tomo-Labs DeFi Integration - The Main Innovation

Cast Colony is powered by **Tomo-Labs** revolutionary DeFi infrastructure that transforms traditional yield farming into an exciting lottery-based system:

### 🔄 Cross DEX Liquidity Pool
- **Advanced Aggregation**: Liquidity sourced across multiple DEXs for optimal pricing
- **Uniswap V4 Hooks**: Custom logic layer built on Uniswap V4 infrastructure
- **ZK Proof Layer**: Zero-knowledge proofs ensure privacy, efficiency, and fairness

### 🎲 Lottery-Based Yield System
- **Gamified Returns**: Instead of traditional APY, users receive lottery tickets
- **Real Yield**: Pool generates actual yield from cross-DEX arbitrage and trading fees
- **Prize Distribution**: Yield distributed as lottery prizes creating excitement and bigger potential wins
- **Dual Incentive**: Gaming rewards + DeFi yield opportunities in one ecosystem

### 💎 $TOMO Token Economy
- **Stablecoin Purchases**: Buy $TOMO with USDC, USDT, ETH
- **Automatic Lottery Entry**: Every $TOMO purchase generates lottery tickets
- **Game Integration**: Use $TOMO for all Cast Colony game actions
- **Yield Participation**: Token holders automatically participate in lottery yield distribution

**This creates the first truly gamified DeFi experience where gaming meets yield farming!** 🚀

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **Blockchain**: Base (Ethereum L2)
- **DeFi Layer**: Tomo-Labs Cross DEX Liquidity with ZK Proofs
- **DEX Integration**: Uniswap V4 Hooks
- **Web3**: Wagmi v2, Viem, RainbowKit
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

3. Set up environment variables:
```bash
cp .env.example .env
# Add your WalletConnect Project ID and other config
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the game

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
│   ├── WalletConnection.tsx # Web3 wallet integration
│   ├── BuyGemsModal.tsx # GEMS purchase interface
│   └── ...
├── context/             # React context providers
├── hooks/               # Custom React hooks
│   ├── useGameIntegration.ts # Game state & Web3 integration
│   └── useWeb3Contracts.ts   # Smart contract interactions
├── contracts/           # Contract addresses and ABIs
└── types/               # TypeScript type definitions

public/
├── .well-known/
│   └── farcaster.json   # Farcaster Mini App manifest
└── assets/              # Game assets and icons
```

## 🎯 Game Mechanics

### 🎰 Tomo-Labs DeFi Integration (MVP Feature)
- **Cross DEX Liquidity Pool**: Advanced liquidity aggregation across multiple DEXs
- **Uniswap V4 Hooks**: Custom logic layer built on Uniswap V4 infrastructure
- **ZK Proof Layer**: Zero-knowledge proofs ensure privacy and efficiency
- **Lottery-Based Yield**: Purchase $TOMO with USDC/USDT and receive lottery tickets
- **Gamified Returns**: Pool yield distributed as lottery prizes instead of traditional APY
- **Dual Incentive**: Gaming rewards + DeFi yield opportunities in one ecosystem

### $TOMO Token Economy
- Buy $TOMO tokens with stablecoins (USDC, USDT, ETH)
- Use $TOMO for all game actions (claiming, battling, upgrades)
- Every $TOMO purchase generates lottery entries for yield distribution
- Cross-DEX arbitrage generates real yield for lottery prize pool

### Territory System
- Claim tiles on the shared game map using $TOMO
- Each tile has different resource generation rates
- Claimed tiles generate resources over time
- All territory ownership stored onchain

### Resource Management
- Multiple resource types with different utilities
- Harvest resources from your claimed territories
- Strategic resource allocation affects gameplay
- Resources used for upgrades and battles

### Battle System
- Turn-based tactical combat using $TOMO
- Territory control influences battle outcomes
- Risk/reward mechanics for aggressive expansion
- Battle results recorded onchain

### Web3 Integration
- Connect wallet to play (MetaMask, Coinbase, WalletConnect)
- All game actions are blockchain transactions
- Real ownership of territories and resources
- Transparent, verifiable game state

## 🔗 Deployment

### Environment Variables
Required environment variables:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with default Next.js settings
4. Ensure `vercel.json` redirect is working

### Farcaster Registration
1. Deploy to a public URL
2. Verify `/.well-known/farcaster.json` redirects to hosted manifest
3. Test Mini App functionality in Farcaster
4. Submit to Farcaster Mini App directory

### Smart Contract Deployment
1. Deploy game contracts to Base network
2. Update contract addresses in `src/contracts/addresses.js`
3. Verify contracts on BaseScan
4. Test all contract interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
