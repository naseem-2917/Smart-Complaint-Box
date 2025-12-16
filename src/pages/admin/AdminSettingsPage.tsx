import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Brain, Shield, Save } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState({
        autoAssign: true,
        emailNotifications: true,
        priorityThreshold: 70,
        aiSensitivity: 'medium',
        autoEscalate: 48
    });

    return (
        <div className="max-w-2xl mx-auto">
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

                {/* AI Settings */}
                <Card className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-5 h-5 text-primary-500" />
                        <h2 className="font-semibold text-gray-900 dark:text-white">AI Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Priority Threshold (AI will mark as High Priority above this score)
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="90"
                                value={settings.priorityThreshold}
                                onChange={(e) => setSettings({ ...settings, priorityThreshold: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>50</span>
                                <span className="font-medium text-primary-500">{settings.priorityThreshold}</span>
                                <span>90</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                AI Sensitivity Level
                            </label>
                            <select
                                value={settings.aiSensitivity}
                                onChange={(e) => setSettings({ ...settings, aiSensitivity: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="low">Low - Less strict categorization</option>
                                <option value="medium">Medium - Balanced</option>
                                <option value="high">High - Strict categorization</option>
                            </select>
                        </div>
                    </div>
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
                <Card className="mb-6">
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
                        </div>
                    </div>
                </Card>

                <Button fullWidth icon={<Save className="w-5 h-5" />}>
                    Save Settings
                </Button>
            </motion.div>
        </div>
    );
};

export default AdminSettingsPage;
