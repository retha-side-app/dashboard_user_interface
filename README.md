# Turkish Learning Platform

A modern, interactive web application for learning Turkish language through structured courses, interactive exercises, and real-time progress tracking.

## Features

- 📚 Comprehensive course management
- 🎯 Interactive learning exercises
  - Flashcards with audio pronunciation
  - Word matching games
  - Quizzes with instant feedback
- 📝 Personal note-taking system
- 📢 Course announcements and group messaging
- 📊 Real-time progress tracking
- 🎓 Course enrollment management
- 👤 User profile management
- 🔒 Secure authentication system

## Project Structure

```
src/
├── components/           # React components
│   ├── account/         # Account management components
│   ├── auth/            # Authentication components
│   ├── course/          # Course-related components
│   │   ├── content/     # Course content components
│   │   └── media/       # Media handling components
│   ├── courses/         # Course listing components
│   └── layout/          # Layout components
├── context/             # React context providers
├── layouts/             # Page layouts
├── lib/                 # Utility libraries
├── pages/               # Page components
├── services/            # API services
│   └── types/          # TypeScript type definitions
└── utils/              # Utility functions
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account and project

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENI=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd turkish-learning-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Database Setup

The application uses Supabase as its database. You'll need to:

1. Create a new Supabase project
2. Set up the following tables:
   - users
   - courses
   - course_weeks
   - course_days
   - course_steps
   - course_media
   - media_files
   - course_enrollments
   - user_notes
   - quizzes
   - quiz_questions
   - quiz_answers
   - quiz_submissions
   - flashcards
   - matching_game_words
   - course_groups
   - group_messages

Detailed schema information is available in the database migration files.

## Main Dependencies

- React 18.3
- React Router 6.22
- Supabase
- Tailwind CSS
- Lucide React (for icons)
- TypeScript
- Vite

## Development

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks
- Use Tailwind CSS for styling
- Implement responsive design
- Follow the component structure in the project

### Building for Production

```bash
npm run build
```

This will create a production build in the `dist` directory.

### Testing

```bash
npm run test
```

## Features Documentation

### Authentication

- Email/password authentication
- User profile management
- Session management

### Course Management

- Course creation and enrollment
- Structured content (weeks, days, steps)
- Progress tracking
- Interactive exercises

### Media Support

- Audio playback for pronunciations
- Document handling (PDF, Word, Excel)
- Image support
- Video integration

### Interactive Features

- Flashcards with audio
- Word matching games
- Quizzes with scoring
- Personal notes
- Group announcements

## API Integration

The application integrates with:

- Supabase for database and authentication
- OpenAI for text-to-speech generation
- Storage services for media files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please ensure your PR:
- Follows the existing code style
- Includes appropriate tests
- Updates documentation as needed
- Describes the changes made

## License

MIT License - see LICENSE file for details

## Support

For support, please:
1. Check the documentation
2. Create an issue in the repository
3. Contact the development team

## Security

- All authentication is handled through Supabase
- Environment variables are required for API keys
- Row Level Security (RLS) is implemented in the database
- File uploads are restricted to authorized users

## Performance Considerations

- Lazy loading for components and routes
- Image optimization
- Caching strategies
- Efficient state management

## Deployment

The application can be deployed to:
- Netlify
- Vercel
- Any static hosting service

## Future Enhancements

- Additional exercise types
- Advanced progress analytics
- Mobile application
- Social learning features
- Content creation tools