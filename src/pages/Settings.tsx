import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Lock,
  Trash2,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Check,
  X,
  AlertTriangle,
  Settings as SettingsIcon,
  Info,
  Code,
  Rocket,
  Heart,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Facebook,
  Twitter,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'language' | 'about';

interface Device {
  id: string;
  name: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile Settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Password Change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Theme Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem('emailNotifications') !== 'false'
  );
  const [pushNotifications, setPushNotifications] = useState(
    localStorage.getItem('pushNotifications') !== 'false'
  );
  const [newReleases, setNewReleases] = useState(
    localStorage.getItem('newReleases') !== 'false'
  );
  const [recommendations, setRecommendations] = useState(
    localStorage.getItem('recommendations') !== 'false'
  );
  
  // Privacy Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(
    localStorage.getItem('twoFactorAuth') === 'true'
  );
  const [showActivity, setShowActivity] = useState(
    localStorage.getItem('showActivity') !== 'false'
  );
  const [publicProfile, setPublicProfile] = useState(
    localStorage.getItem('publicProfile') !== 'false'
  );
  
  // Language Settings
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );
  
  // Session Management
  const [devices] = useState<Device[]>([
    {
      id: '1',
      name: 'Windows PC',
      location: 'New York, USA',
      lastActive: 'Active now',
      current: true
    },
    {
      id: '2',
      name: 'iPhone 13',
      location: 'New York, USA',
      lastActive: '2 hours ago',
      current: false
    }
  ]);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('pushNotifications', pushNotifications.toString());
    localStorage.setItem('newReleases', newReleases.toString());
    localStorage.setItem('recommendations', recommendations.toString());
    localStorage.setItem('twoFactorAuth', twoFactorAuth.toString());
    localStorage.setItem('showActivity', showActivity.toString());
    localStorage.setItem('publicProfile', publicProfile.toString());
    localStorage.setItem('language', language);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.status === 401) {
        // Token expired - logout and redirect to login
        alert('Your session has expired. Please login again.');
        await logout();
        navigate('/login');
        return;
      }

      if (response.ok) {
        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        // Token expired - logout and redirect to login
        alert('Your session has expired. Please login again.');
        await logout();
        navigate('/login');
        return;
      }

      if (response.ok) {
        await logout();
        navigate('/');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your browsing history?')) {
      localStorage.removeItem('searchHistory');
      alert('History cleared successfully!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'about', label: 'About Us', icon: Info }
  ];

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/30">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your account preferences
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Profile Settings
                    </h2>
                    
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                          {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Profile Picture
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to upload a new avatar
                        </p>
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Password & Delete */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-4">
                    <ToggleCard
                      icon={Mail}
                      title="Email Notifications"
                      description="Receive updates via email"
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                    />
                    
                    <ToggleCard
                      icon={Bell}
                      title="Push Notifications"
                      description="Receive push notifications in browser"
                      checked={pushNotifications}
                      onChange={setPushNotifications}
                    />
                    
                    <ToggleCard
                      icon={Smartphone}
                      title="New Releases"
                      description="Get notified about new movies and shows"
                      checked={newReleases}
                      onChange={setNewReleases}
                    />
                    
                    <ToggleCard
                      icon={Monitor}
                      title="Recommendations"
                      description="Receive personalized recommendations"
                      checked={recommendations}
                      onChange={setRecommendations}
                    />
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Privacy & Security
                  </h2>
                  
                  <div className="space-y-4">
                    <ToggleCard
                      icon={Shield}
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security"
                      checked={twoFactorAuth}
                      onChange={setTwoFactorAuth}
                    />
                    
                    <ToggleCard
                      icon={Eye}
                      title="Show Activity"
                      description="Let others see your watch activity"
                      checked={showActivity}
                      onChange={setShowActivity}
                    />
                    
                    <ToggleCard
                      icon={User}
                      title="Public Profile"
                      description="Make your profile visible to everyone"
                      checked={publicProfile}
                      onChange={setPublicProfile}
                    />
                  </div>

                  {/* Active Sessions */}
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {device.name}
                                {device.current && (
                                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {device.location} • {device.lastActive}
                              </p>
                            </div>
                          </div>
                          {!device.current && (
                            <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clear History */}
                  <div className="mt-6">
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Browsing History
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Appearance Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ThemeCard
                      icon={Sun}
                      title="Light"
                      selected={theme === 'light'}
                      onClick={() => setTheme('light')}
                    />
                    <ThemeCard
                      icon={Moon}
                      title="Dark"
                      selected={theme === 'dark'}
                      onClick={() => setTheme('dark')}
                    />
                    <ThemeCard
                      icon={Monitor}
                      title="System"
                      selected={theme === 'system'}
                      onClick={() => setTheme('system')}
                    />
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Language Settings
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ar">العربية</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              )}

              {/* About Us Tab */}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  {/* Header Section */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                        <Info className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-2">
                      SerieLat
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                      "Your Gateway to Movies & TV Magic"
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Founded December 1, 2024
                    </p>
                  </div>

                  {/* Mission Statement */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Our Mission
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      To provide users with a modern, fast, and intelligent platform for discovering movies, TV shows, and actors—powered by advanced search, AI assistance, and seamless user experience.
                    </p>
                  </div>

                  {/* Founder Section */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Founder & Team
                    </h3>
                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        Abdurabu Saleh Abdurabu Ali
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          Founder & Lead Developer
                        </span>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          UI/UX Designer
                        </span>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                          Backend Engineer
                        </span>
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                          API Integration Specialist
                        </span>
                        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium">
                          AI Features Developer
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Powerful search for Movies, TV Shows & People',
                        'AI-powered chatbot for recommendations',
                        'Clean, modern UI with smooth UX',
                        'Favorites system (Movies, TV, People)',
                        'Watch Later functionality',
                        'Best 100 curated lists',
                        'Genre & Year filtering',
                        'Actor profiles with complete works',
                        'Fully responsive design',
                        'Fast TMDB-powered database'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technology Stack */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700/50 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Technology Stack
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Frontend:</strong> React + Vite</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Backend:</strong> Node.js + Express</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Database:</strong> MongoDB Atlas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>APIs:</strong> TMDB + Resend</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Hosting:</strong> Vercel + Render</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Auth:</strong> JWT + Email Verification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Styling:</strong> TailwindCSS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>AI:</strong> Gemini API</span>
                      </div>
                    </div>
                  </div>

                  {/* Future Roadmap */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      Future Roadmap
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Personalized AI-powered recommendations',
                        'Mobile app (iOS + Android)',
                        'User reviews & ratings system',
                        'Watch history tracking',
                        'Community features (lists, comments, profiles)',
                        'Premium subscription with analytics',
                        'Trailer player integration',
                        'Full cast & crew system',
                        'Social login options',
                        'Smart summaries & actor info generation'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Get in Touch
                    </h3>
                    <div className="space-y-3">
                      <a href="mailto:alshrafi1999@gmail.com" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Mail className="w-5 h-5" />
                        <span>alshrafi1999@gmail.com</span>
                      </a>
                      <a href="tel:+966552445377" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Phone className="w-5 h-5" />
                        <span>+966 552 445 377</span>
                      </a>
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-5 h-5" />
                        <span>Saudi Arabia — Riyadh</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Follow Us:</p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="https://x.com/3bdurabu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          <span className="text-sm">Twitter</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://www.facebook.com/3bdurabu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Facebook className="w-4 h-4" />
                          <span className="text-sm">Facebook</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://github.com/3bdrabu222"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span className="text-sm">GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/abdurabu-saleh-ba7a7531a"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span className="text-sm">LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      © 2024 SerieLat. All Rights Reserved.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                
                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-500 font-medium flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Saved successfully!
                  </motion.span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <Modal onClose={() => setShowPasswordModal(false)}>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Change Password
              </h3>
              
              <div className="space-y-4">
                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                />
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                >
                  Update Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal onClose={() => setShowDeleteModal(false)}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable Components
function ToggleCard({ icon: Icon, title, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
      </label>
    </div>
  );
}

function ThemeCard({ icon: Icon, title, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <Icon className={`w-8 h-8 mx-auto mb-3 ${
        selected ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
      }`} />
      <p className={`font-medium ${
        selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {title}
      </p>
    </button>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
