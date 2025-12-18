import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Save, Check, Crown, Info } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';
import { SUPER_ADMIN_EMAIL } from '../../config/constants';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        autoAssign: true,
        emailNotifications: false,
        autoEscalate: 48,
        allowAnonymous: true
    });
    const [saved, setSaved] = useState(false);
    const { showSuccess } = useNotification();

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            setSettings({ ...settings, ...JSON.parse(savedSettings) });
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        showSuccess('Success', 'Settings saved successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-7 h-7 text-gray-500" />
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Configure system behavior and preferences
                    </p>
                </div>

                {/* Super Admin Info */}
                <Card className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-3">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h2 className="font-semibold text-amber-800 dark:text-amber-200">Super Admin</h2>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Primary Admin Email</p>
                                <p className="font-medium text-gray-900 dark:text-white">{SUPER_ADMIN_EMAIL}</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                Active
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Super admin can promote/demote users and manage all settings
                    </p>
                </Card>

                {/* Notification Settings */}
                <Card className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-amber-500" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive email for high priority complaints</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Automation Settings */}
                <Card className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">Automation</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Auto-Assign Complaints</p>
                                <p className="text-sm text-gray-500">Automatically assign based on category</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, autoAssign: !settings.autoAssign })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoAssign ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.autoAssign ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Allow Anonymous Complaints</p>
                                <p className="text-sm text-gray-500">Let users submit without revealing identity</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, allowAnonymous: !settings.allowAnonymous })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.allowAnonymous ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.allowAnonymous ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Auto-Escalate After (hours)
                            </label>
                            <select
                                value={settings.autoEscalate}
                                onChange={(e) => setSettings({ ...settings, autoEscalate: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="24">24 hours</option>
                                <option value="48">48 hours</option>
                                <option value="72">72 hours</option>
                                <option value="0">Disabled</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Complaints not addressed in this time will be escalated automatically
                            </p>
                        </div>
                    </div>
                </Card>

                <Button
                    fullWidth
                    onClick={handleSave}
                    icon={saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                >
                    {saved ? 'Saved!' : 'Save Settings'}
                </Button>

                {/* Info */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    Settings are saved locally in your browser
                </p>
            </motion.div>
        </div>
    );
};

export default AdminSettingsPage;

