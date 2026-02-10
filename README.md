# Loan Origination Dashboard

A modern, responsive web application for managing loan origination processes. Built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard Overview**: Real-time metrics and key performance indicators
- **Loan Applications Management**: View, filter, and manage all loan applications
- **New Application Form**: Create new loan applications with comprehensive data collection
- **Analytics**: Detailed insights into loan origination performance and trends
- **Modern UI**: Beautiful, intuitive interface with responsive design

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
loan-origination-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── Dashboard.jsx
│   │   ├── LoanApplications.jsx
│   │   ├── NewApplication.jsx
│   │   └── Analytics.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features Overview

### Dashboard
- Key metrics cards showing total loan volume, active applications, pending reviews, and approvals
- Recent applications table with status indicators
- Trend indicators showing month-over-month changes

### Applications
- Comprehensive table view of all loan applications
- Search and filter functionality
- Status-based filtering
- Export functionality

### New Application
- Multi-section form for collecting applicant information
- Loan details and financial information
- Form validation and submission handling

### Analytics
- Performance metrics and KPIs
- Loan type distribution visualization
- Status breakdown charts
- Monthly performance trends

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme. The primary color is defined in the `primary` color palette.

### Components

All components are located in `src/components/` and can be easily modified or extended.

## License

MIT
