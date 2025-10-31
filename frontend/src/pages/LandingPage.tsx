import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Track shift performance with comprehensive charts and statistics. Monitor movements, downtime, and productivity metrics instantly.'
    },
    {
      icon: '👥',
      title: 'Multi-Role Management',
      description: 'Three-tier role system: SuperAdmin, Admin, and Workers. Each role has specific permissions and tailored dashboards.'
    },
    {
      icon: '🏭',
      title: 'Section-Based Tracking',
      description: 'Organize data by sections (CCS, BAF, Slitter). Each section has customized data entry forms and reporting.'
    },
    {
      icon: '🕒',
      title: 'Shift Management',
      description: 'Track three shifts per day with detailed time records. Automatic shift detection and seamless handover tracking.'
    },
    {
      icon: '💾',
      title: 'Auto-Save Forms',
      description: 'Never lose your data! Forms automatically save to local storage. Continue where you left off even after refresh.'
    },
    {
      icon: '📈',
      title: 'Performance Reports',
      description: 'Generate detailed reports with filters by date, shift, and section. Export and analyze historical performance trends.'
    }
  ];

  const stats = [
    { number: '3', label: 'Sections' },
    { number: '3', label: 'Shifts/Day' },
    { number: '17+', label: 'Data Points' },
    { number: '100%', label: 'Responsive' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">
                ShiftTrack<span className="text-blue-400">Pro</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Modern Shift Tracking &
            <span className="text-blue-400"> Performance Analytics</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline your production tracking with real-time data entry, automated reporting,
            and powerful analytics. Built for manufacturing teams who demand precision and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Get Started →
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-lg border border-gray-700"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to track, analyze, and improve shift performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Simple, efficient workflow for your team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Select Section & Shift
              </h3>
              <p className="text-gray-400">
                Choose your work section (CCS, BAF, or Slitter) and current shift (1st, 2nd, or 3rd).
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Enter Data
              </h3>
              <p className="text-gray-400">
                Fill in production metrics with intuitive forms. Data auto-saves as you type.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                View Reports
              </h3>
              <p className="text-gray-400">
                Access real-time analytics and generate comprehensive reports with filters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Designed for Every Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-lg text-white">
              <div className="text-3xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-bold mb-4">SuperAdmin</h3>
              <ul className="space-y-2 text-purple-100">
                <li>✓ Full system access</li>
                <li>✓ User role management</li>
                <li>✓ Global analytics</li>
                <li>✓ System configuration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-lg text-white">
              <div className="text-3xl mb-4">👨‍💻</div>
              <h3 className="text-2xl font-bold mb-4">Admin</h3>
              <ul className="space-y-2 text-blue-100">
                <li>✓ Create & manage users</li>
                <li>✓ Assign sections</li>
                <li>✓ View all reports</li>
                <li>✓ Export data</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-lg text-white">
              <div className="text-3xl mb-4">👷</div>
              <h3 className="text-2xl font-bold mb-4">Worker</h3>
              <ul className="space-y-2 text-green-100">
                <li>✓ Submit shift data</li>
                <li>✓ View personal records</li>
                <li>✓ Track performance</li>
                <li>✓ Section-specific forms</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Shift Tracking?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join manufacturing teams who trust ShiftTrackPro for accurate, real-time production tracking.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Start Tracking Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="text-xl font-bold text-white mb-2">
                ShiftTrack<span className="text-blue-400">Pro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional Shift Tracking & Analytics Platform
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                ShiftTrackPro © 2025 - All Rights Reserved
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
