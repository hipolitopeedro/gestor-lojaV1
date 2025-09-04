# LuPA Financial Management System

**LuPA** (Lucro e Performance em Análise) is a comprehensive financial management system designed for small to medium businesses. The system provides real-time financial insights, transaction management, and performance analytics through an intuitive web interface.

## 🚀 Features

### Frontend (React + Tailwind CSS)
- **Responsive Dashboard** - Complete financial overview with charts and metrics
- **Sticky Header Navigation** - Quick access to main functions (Income, Expenses, Bills, Receivables)
- **Real-time Charts** - Financial evolution, expense categories, daily transactions
- **Mobile Responsive** - Optimized for desktop and mobile devices
- **Modern UI/UX** - Clean design with purple branding and improved contrast

### Backend (Flask + Python)
- **Simplified Authentication** - Streamlined user access for demo purposes
- **RESTful API** - Clean API endpoints for all financial operations
- **Transaction Management** - Complete CRUD operations for financial records
- **Bill Payment System** - Manage recurring payments and due dates
- **Accounts Receivable** - Track customer payments and outstanding amounts

## 🎨 Design System

### Color Scheme
- **Background**: `#f5f3ff` (Light lavender)
- **Primary Brand**: `#8b5cf6` (Purple)
- **Success/Profits**: `#34d399` (Green)
- **Expenses**: `#fb7185` (Coral)
- **Neutral**: `#fb923c` (Orange)
- **Text**: Black for optimal readability

### Key UI Improvements
- **Sticky Header**: Always accessible quick actions
- **Improved Contrast**: Black text on light backgrounds for better readability
- **Smaller Buttons**: Compact design for better space utilization
- **Responsive Grid**: Adapts from 4-column (desktop) to 2-column (mobile)

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Recharts** - Beautiful and responsive charts
- **Lucide React** - Modern icon library

### Backend
- **Flask** - Lightweight Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-CORS** - Cross-origin resource sharing
- **Python 3.11** - Latest Python features

## 📁 Project Structure

```
lupa-financial-system/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React context providers
│   │   ├── styles/         # Custom CSS and themes
│   │   └── lib/           # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Flask backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models
│   │   ├── utils/          # Helper functions
│   │   └── static/         # Built frontend files
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm/pnpm
- Python 3.11+
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python src/main.py
```

### Build for Production
```bash
cd frontend
npm run build
```

## 📱 Screenshots

### Desktop Dashboard
- Full-width layout with comprehensive financial metrics
- Interactive charts and real-time data visualization
- Sticky header with quick action buttons

### Mobile Interface
- Responsive 2x2 grid layout for quick actions
- Touch-friendly interface elements
- Optimized typography and spacing

## 🔧 Configuration

### Environment Variables
- Development server runs on `http://localhost:5173`
- Backend API available at `http://localhost:5000`
- CORS enabled for cross-origin requests

### Customization
- Colors can be modified in `frontend/src/styles/lupa-theme.css`
- Component styling uses Tailwind CSS classes
- Charts and data visualization via Recharts library

## 📈 Key Metrics Tracked

- **Revenue Total** - Complete income tracking
- **Total Expenses** - Comprehensive expense management
- **Net Profit** - Real-time profit calculations
- **Profit Margin** - Performance percentage metrics
- **Active Customers** - Customer relationship tracking
- **Pending Bills** - Payment due date management
- **Overdue Payments** - Outstanding receivables
- **Monthly Growth** - Performance trend analysis

## 🎯 Recent Updates

### Version 1.0 (Latest)
- ✅ Implemented sticky header with quick actions
- ✅ Updated button styling with black text for better readability
- ✅ Reduced button size for more compact design
- ✅ Improved mobile responsiveness
- ✅ Enhanced color contrast throughout the application
- ✅ Fixed JSX syntax issues and cleaned up duplicate code

## 🤝 Contributing

This is a private project for business financial management. For questions or support, please contact the development team.

## 📄 License

Private project - All rights reserved.

---

**LuPA Financial Management System** - Transforming financial data into actionable business insights.

