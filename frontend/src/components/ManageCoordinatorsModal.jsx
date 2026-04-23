import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ManageCoordinatorsModal = ({ eventId, isOpen, onClose, onUpdate }) => {
    const [coordinators, setCoordinators] = useState([]);
    const [creator, setCreator] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && eventId) {
            fetchCoordinators();
        }
    }, [isOpen, eventId]);

    const fetchCoordinators = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/events/${eventId}/coordinators`);
            setCreator(data.creator);
            setCoordinators(data.coordinators || []);
        } catch (err) {
            toast.error('Failed to load coordinators');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchCoordinators = async (name) => {
        if (!name || name.trim() === '') {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const { data } = await api.get(`/events/search-users?name=${encodeURIComponent(name)}`);
            // Filter out already selected coordinators and the creator
            const filtered = data.filter(user =>
                !coordinators.some(coord => coord._id === user._id) &&
                user._id !== creator?._id
            );
            setSearchResults(filtered);
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const addCoordinator = async (user) => {
        try {
            const { data } = await api.post(`/events/${eventId}/coordinators`, {
                userId: user._id
            });
            setCoordinators(data.coordinators || []);
            setSearchResults([]);
            setSearchName('');
            toast.success(`${user.name} added as coordinator`);
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add coordinator');
        }
    };

    const removeCoordinator = async (userId, userName) => {
        try {
            const { data } = await api.delete(`/events/${eventId}/coordinators/${userId}`);
            setCoordinators(data.coordinators || []);
            toast.success(`${userName} removed as coordinator`);
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove coordinator');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Manage Coordinators</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : (
                    <>
                        {/* Event Creator */}
                        {creator && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Event Creator
                                </h3>
                                <div className="card bg-purple-500/10 border-purple-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <UserPlus className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{creator.name}</p>
                                            <p className="text-sm text-gray-400">{creator.email}</p>
                                            <span className="badge-info text-xs mt-1">{creator.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Section */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Add Coordinator
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="form-input pl-10"
                                    placeholder="Search by name..."
                                    value={searchName}
                                    onChange={(e) => {
                                        setSearchName(e.target.value);
                                        searchCoordinators(e.target.value);
                                    }}
                                />
                                {searching && (
                                    <div className="absolute right-3 top-3 text-gray-400 text-sm">
                                        Searching...
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-2 bg-gray-700/50 rounded-lg border border-gray-600 max-h-48 overflow-y-auto">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            className="p-3 hover:bg-gray-600/50 transition flex items-center justify-between border-b border-gray-600 last:border-b-0"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="badge-info text-xs">{user.role}</span>
                                                    {user.department && (
                                                        <span className="text-xs text-gray-500">{user.department}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addCoordinator(user)}
                                                className="btn-primary btn-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Current Coordinators */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Current Coordinators ({coordinators.length})
                            </h3>
                            {coordinators.length === 0 ? (
                                <p className="text-gray-500 text-sm italic py-4 text-center bg-gray-700/30 rounded-lg">
                                    No additional coordinators added yet
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {coordinators.map((coord) => (
                                        <div
                                            key={coord._id}
                                            className="card bg-blue-500/10 border-blue-500/20 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{coord.name}</p>
                                                <p className="text-sm text-gray-400">{coord.email}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="badge-info text-xs">{coord.role}</span>
                                                    {coord.department && (
                                                        <span className="text-xs text-gray-500">{coord.department}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeCoordinator(coord._id, coord.name)}
                                                className="text-red-400 hover:text-red-300 transition p-2"
                                                title="Remove coordinator"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageCoordinatorsModal;
