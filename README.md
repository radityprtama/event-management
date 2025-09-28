# Event Management Platform

A comprehensive event management platform built with Next.js, featuring role-based authentication, event creation, participant management, and analytics.

## ✨ Features

- **🔐 Authentication System**: Secure login/register with NextAuth.js
- **👥 Role-Based Access**: Admin and User roles with different permissions
- **📅 Event Management**: Full CRUD operations for events
- **📊 Analytics Dashboard**: Charts and statistics for admins
- **🎯 Event Registration**: Users can register/unregister for events
- **👤 User Dashboard**: Personal event participation tracking
- **🌓 Dark Mode**: Theme switching with next-themes
- **📱 Responsive Design**: Mobile-friendly interface
- **🔔 Notifications**: Toast notifications for user feedback

## 🚀 Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: NextAuth.js with credentials provider
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner for toast messages

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your database in `.env`:
   ```env
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. Seed the database:
   ```bash
   npm run db:seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Default Accounts

After seeding, you can use these accounts:

### Admin Account
- **Email**: admin@eventplatform.com
- **Password**: admin123

### User Accounts
- **Email**: john@example.com / **Password**: user123
- **Email**: jane@example.com / **Password**: user123
- **Email**: mike@example.com / **Password**: user123

## 🗂️ Database Schema

### Users
- ID, name, email, passwordHash, role (ADMIN/USER)
- Timestamps for created/updated

### Events
- ID, title, description, date, location
- Capacity, price, status, imageUrl
- Created by admin, timestamps

### Participants
- User-Event relationship
- Status tracking (REGISTERED/CONFIRMED/ATTENDED/CANCELLED)
- Timestamps

## 🚢 Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production domain)

4. Deploy!

### Database Options

- **Supabase**: Free PostgreSQL with built-in auth
- **Railway**: Simple PostgreSQL hosting
- **PlanetScale**: Serverless MySQL alternative
- **Vercel Postgres**: Integrated with Vercel

## 📱 Pages & Features

### Public Pages
- **Landing Page**: Hero section, upcoming events, features
- **Event Details**: Event information with registration

### Authentication
- **Login**: Secure sign-in with credentials
- **Register**: User account creation

### User Dashboard
- **My Events**: Track registered events
- **Event Discovery**: Browse new events
- **Participation Status**: Track attendance

### Admin Dashboard
- **Analytics**: Event and participant statistics
- **Event Management**: CRUD operations
- **Participant Management**: Status updates
- **Charts**: Visual data representation

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:seed      # Seed database with sample data
```

## 🎨 Customization

The platform uses shadcn/ui components with TailwindCSS for styling. You can customize:

- **Colors**: Update the color palette in `app/globals.css`
- **Components**: Modify shadcn/ui components in `components/ui/`
- **Layout**: Adjust layouts in app directories
- **Database**: Extend schema in `prisma/schema.prisma`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js and modern web technologies.
