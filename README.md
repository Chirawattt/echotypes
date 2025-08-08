# EchoTypes - English Vocabulary Learning Game

An interactive web application for learning English vocabulary through engaging game modes. Built with Next.js 15, TypeScript, and modern web technologies.
Website: http://echotypes.vercel.app

## 🎮 Game Modes

- **Echo Mode**: Listen and type what you hear
- **Memory Mode**: Memorize and recall words visually  
- **Typing Mode**: Speed typing with energy management

Each mode supports both **Practice** (learning-focused) and **Challenge** (competitive) styles.

## ✨ Key Features

- **Dynamic Difficulty Adjustment**: AI-powered difficulty scaling
- **Real-time Scoring**: Challenge mode with streak bonuses
- **User Profiles**: Progress tracking and leaderboards
- **CEFR Levels**: A1-C2 vocabulary progression
- **Audio Integration**: Text-to-speech and sound effects
- **Mobile Optimized**: Responsive design for all devices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit `http://localhost:3000` to start learning!

## 📚 Documentation

Key docs in `/docs`:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Structure, routing, UX patterns
- **[GAMEPLAY_GUIDE.md](./docs/GAMEPLAY_GUIDE.md)** - Modes, challenge, scoring, DDA
- **[DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md)** - Setup, testing, deployment
- **[DDA_DESIGN.md](./docs/DDA_DESIGN.md)** - Dynamic difficulty details

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **State**: Zustand for game state management
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js with OAuth providers
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+  
- Safari 14+
- Mobile browsers with Web Speech API support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Status

✅ **Production Ready**
- All game modes implemented and tested
- User authentication and profiles
- Scoring and leaderboard system
- Mobile optimization complete
- Performance optimized for deployment

Built with ❤️ for English language learners worldwide.
