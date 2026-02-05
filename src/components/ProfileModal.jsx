import React from 'react';
import { X, User } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, currentUser, targetUser, stats, achievements, unlocked }) => {
  if (!isOpen) return null;

  const UserProfile = window.UserProfile;
  const userToDisplay = targetUser || currentUser;
  const isSelf = currentUser && userToDisplay.uid === currentUser.uid;

  // Modal is strictly for VIEWING (Read-Only)
  // Editing is done in the "Account" tab.
  const isEditable = false; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Player Profile
        </h2>

        {UserProfile ? (
            <UserProfile 
                user={userToDisplay} 
                isEditable={isEditable} 
                stats={isSelf ? stats : undefined}
                achievements={achievements}
                unlocked={isSelf ? unlocked : undefined}
            />
        ) : (
            <p className="text-red-500">UserProfile component missing.</p>
        )}
      </div>
    </div>
  );
};

window.ProfileModal = ProfileModal;
