import React, { useState, useEffect } from 'react';
import { Save, User, Camera, Settings, Trophy, Globe, Calendar } from 'lucide-react';

const UserProfile = ({ user, isEditable, onSave, stats: initialStats, achievements, unlocked: initialUnlocked }) => {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [stats, setStats] = useState(initialStats || {});
  const [unlocked, setUnlocked] = useState(initialUnlocked || []);

  const countries = window.countries || [];
  const { getFlagUrl } = window.gameHelpers || {};
  const { calculateLevel, getLevelProgress, getRankTitle } = window.levelSystem || {};

  useEffect(() => {
    if (user) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
        setBio('');
        setCountryCode('');
        
        if (window.db) {
            window.db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setBio(data.bio || '');
                    setCountryCode(data.countryCode || '');
                    if (data.photoURL) setPhotoURL(data.photoURL);
                    if (data.stats) setStats(data.stats);
                    if (data.achievements) setUnlocked(data.achievements);
                }
            }).catch(err => console.error("Error fetching profile:", err));
        }
    }
  }, [user]);

  // Update local state if props change (for current user)
  useEffect(() => {
      if (initialStats) setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
      if (initialUnlocked) setUnlocked(initialUnlocked);
  }, [initialUnlocked]);

  const handleFileChange = async (e) => {
    if (!isEditable) return;
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
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

  const handleSaveProfile = async () => {
    if (!isEditable) return;

    setLoading(true);
    setMessage(null);
    try {
        // Update Auth Profile
        if (user.updateProfile) {
            await user.updateProfile({
                displayName: displayName,
                photoURL: photoURL
            });
        }

        // Update Firestore User Document
        if (window.db) {
            await window.db.collection('users').doc(user.uid).set({
                displayName,
                photoURL,
                bio,
                countryCode,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (onSave) onSave();
    } catch (error) {
        console.error("Error updating profile:", error);
        setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
        {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
            </div>
        )}

        <div className="space-y-6">
            {/* Header / Photo */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className={`w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-4 border-white/10 ${isEditable ? 'group-hover:border-emerald-500/50 transition-colors' : ''}`}>
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    {isEditable && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera className="w-8 h-8 text-white" />
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    )}
                </div>
                
                {isEditable && (
                    <input 
                        type="text" 
                        placeholder="Or paste image URL..."
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="text-xs text-slate-500 bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none w-48 text-center pb-1"
                    />
                )}
            </div>

            {/* Level & XP Section */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-500/20">
                            {calculateLevel ? calculateLevel(stats.xp || 0) : 1}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Rank</span>
                            <span className="text-white font-bold">{getRankTitle ? getRankTitle(calculateLevel ? calculateLevel(stats.xp || 0) : 1) : 'Novice'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-emerald-400 font-bold text-lg">{stats.xp || 0}</span>
                        <span className="text-slate-500 text-xs font-bold ml-1">XP</span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                        style={{ width: `${getLevelProgress ? getLevelProgress(stats.xp || 0) : 0}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-500">Level {calculateLevel ? calculateLevel(stats.xp || 0) : 1}</span>
                    <span className="text-[10px] text-slate-500">Level {(calculateLevel ? calculateLevel(stats.xp || 0) : 1) + 1}</span>
                </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4">
                {/* Display Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                    {isEditable ? (
                        <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors"
                            placeholder="Enter your name"
                        />
                    ) : (
                        <div className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white text-lg font-medium flex items-center gap-3">
                            {displayName || 'Anonymous'}
                            {countryCode && (
                                <img 
                                    src={getFlagUrl(countryCode)} 
                                    alt={countryCode} 
                                    className="w-6 h-4 object-cover rounded shadow-sm opacity-80"
                                    title={countries.find(c => c.alpha3 === countryCode)?.name}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Country Selection (Editable Only) */}
                {isEditable && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Representing Country</label>
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Bio</label>
                    {isEditable ? (
                        <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder:text-zinc-600 transition-colors min-h-[120px] resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    ) : (
                        <div className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-slate-300 min-h-[80px]">
                            {bio || 'No bio yet.'}
                        </div>
                    )}
                </div>

                {/* Achievements */}
                <div>
                    <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2 mt-2">
                        <Trophy className="w-4 h-4" />
                        Achievements
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {achievements && achievements.map(ach => {
                            const isUnlocked = unlocked.includes(ach.id);
                            const Icon = ach.icon || Trophy;
                            return (
                                <div 
                                    key={ach.id} 
                                    className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                                        isUnlocked 
                                            ? 'bg-zinc-900 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                                            : 'bg-zinc-900/50 border-white/5 opacity-50 grayscale'
                                    }`}
                                    title={ach.description}
                                >
                                    <div className={`p-2 rounded-full ${isUnlocked ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                                        <Icon className={`w-5 h-5 ${isUnlocked ? ach.color : 'text-slate-500'}`} />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-300 leading-tight">{ach.title}</div>
                                </div>
                            );
                        })}
                        {(!achievements || achievements.length === 0) && (
                            <p className="text-slate-500 text-xs col-span-3 text-center">No achievements data.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {isEditable && (
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

window.UserProfile = UserProfile;
// export default UserProfile;
