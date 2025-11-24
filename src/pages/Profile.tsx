import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          
          {/* Profile Content */}
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-800">
                <User size={64} className="text-gray-300" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
            <p className="text-gray-400 mb-8">Member Profile</p>

            {/* Info Cards */}
            <div className="grid gap-6">
              <div className="bg-gray-700/50 rounded-xl p-6 flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email Address</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6 flex items-center gap-4">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Account Role</p>
                  <p className="text-white font-semibold capitalize">{user.role}</p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6 flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Account ID</p>
                  <p className="text-white font-semibold font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
