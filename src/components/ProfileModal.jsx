import React, { useState, useEffect } from 'react';
import { X, Save, User, Camera, Settings } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, user }) => {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
        // Fetch bio from Firestore
        if (window.db) {
            window.db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setBio(data.bio || '');
                    if (data.photoURL) setPhotoURL(data.photoURL); // Prefer Firestore photo if updated
                }
            }).catch(err => console.error("Error fetching profile:", err));
        }
    }
  }, [user, isOpen]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
        setMessage({ type: 'error', text: 'File size too large (max 5MB)' });
        return;
    }

    if (!window.storage) {
        setMessage({ type: 'error', text: 'Storage not initialized' });
        return;
    }

    setLoading(true);
    try {
        const storageRef = window.storage.ref();
        const fileRef = storageRef.child(`profile_photos/${user.uid}/${Date.now()}_${file.name}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        setPhotoURL(downloadURL);
        setMessage({ type: 'success', text: 'Photo uploaded!' });
    } catch (error) {
        console.error("Error uploading file:", error);
        setMessage({ type: 'error', text: 'Error uploading file' });
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
        // Update Auth Profile
        if (user) {
            await user.updateProfile({
                displayName: displayName,
                photoURL: photoURL
            });
        }

        // Update Firestore User Document
        if (window.db && user) {
            await window.db.collection('users').doc(user.uid).set({
                displayName,
                photoURL,
                bio,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => onClose(), 1500);
    } catch (error) {
        console.error("Error updating profile:", error);
        setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Edit Profile
        </h2>

        {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
            </div>
        )}

        <div className="space-y-4">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-3 mb-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10 group-hover:border-emerald-500/50 transition-colors">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <User className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <input 
                    type="text" 
                    placeholder="Profile Picture URL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 text-sm text-slate-300 placeholder:text-zinc-600"
                />
            </div>

            {/* Display Name */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Display Name</label>
                <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors"
                    placeholder="Enter your name"
                />
            </div>

            {/* Bio */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Bio</label>
                <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors min-h-[100px] resize-none"
                    placeholder="Tell us about yourself..."
                />
            </div>

            <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? 'Saving...' : (
                    <>
                        <Save className="w-4 h-4" />
                        Save Profile
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

window.ProfileModal = ProfileModal;
