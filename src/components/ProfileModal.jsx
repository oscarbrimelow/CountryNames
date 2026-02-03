import React, { useState, useEffect } from 'react';
import { X, Save, User, Camera, Settings } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, currentUser, targetUser }) => {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [countryCode, setCountryCode] = useState(''); // Alpha-2 or Alpha-3
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const countries = window.countries || [];
  const { getFlagUrl } = window.gameHelpers || {};

  // Determine if we are editing the current user's profile
  const isEditing = currentUser && targetUser && currentUser.uid === targetUser.uid;
  
  // The user to display is targetUser, fallback to currentUser if not provided
  const userToDisplay = targetUser || currentUser;

  useEffect(() => {
    if (userToDisplay && isOpen) {
        setDisplayName(userToDisplay.displayName || '');
        setPhotoURL(userToDisplay.photoURL || '');
        setBio(''); // Reset bio initially
        setCountryCode(''); // Reset country initially
        
        // Fetch bio and country from Firestore
        if (window.db) {
            window.db.collection('users').doc(userToDisplay.uid).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setBio(data.bio || '');
                    setCountryCode(data.countryCode || '');
                    if (data.photoURL) setPhotoURL(data.photoURL); // Prefer Firestore photo if updated
                }
            }).catch(err => console.error("Error fetching profile:", err));
        }
    }
  }, [userToDisplay, isOpen]);

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
        const fileRef = storageRef.child(`profile_photos/${currentUser.uid}/${Date.now()}_${file.name}`);
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
    if (!isEditing) return;

    setLoading(true);
    setMessage(null);
    try {
        // Update Auth Profile
        if (currentUser) {
            await currentUser.updateProfile({
                displayName: displayName,
                photoURL: photoURL
            });
        }

        // Update Firestore User Document
        if (window.db && currentUser) {
            await window.db.collection('users').doc(currentUser.uid).set({
                displayName,
                photoURL,
                bio,
                countryCode,
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
            {isEditing ? 'Edit Profile' : 'User Profile'}
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
                    <div className={`w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10 ${isEditing ? 'group-hover:border-emerald-500/50 transition-colors' : ''}`}>
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <User className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera className="w-6 h-6 text-white" />
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>
                {isEditing && (
                    <input 
                        type="text" 
                        placeholder="Profile Picture URL"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500/50 text-sm text-slate-300 placeholder:text-zinc-600"
                    />
                )}
            </div>

            {/* Display Name */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Display Name</label>
                {isEditing ? (
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors"
                        placeholder="Enter your name"
                    />
                ) : (
                    <div className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white flex items-center justify-between">
                        <span>{displayName || 'Anonymous'}</span>
                        {countryCode && (
                             <img 
                                src={getFlagUrl(countryCode)} 
                                alt={countryCode} 
                                className="w-6 h-4 object-cover rounded shadow-sm"
                                title={countries.find(c => c.alpha3 === countryCode)?.name}
                             />
                        )}
                    </div>
                )}
            </div>

            {/* Country Selection */}
            {isEditing && (
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Representing Country</label>
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white transition-colors appearance-none"
                    >
                        <option value="">Select a country...</option>
                        {countries.sort((a, b) => a.name.localeCompare(b.name)).map(country => (
                            <option key={country.id} value={country.alpha3} className="bg-zinc-900 text-white">
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Bio */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Bio</label>
                {isEditing ? (
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors min-h-[100px] resize-none"
                        placeholder="Tell us about yourself..."
                    />
                ) : (
                    <div className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-slate-300 min-h-[100px] whitespace-pre-wrap">
                        {bio || 'No bio available.'}
                    </div>
                )}
            </div>

            {isEditing && (
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
            )}
        </div>
      </div>
    </div>
  );
};

window.ProfileModal = ProfileModal;
