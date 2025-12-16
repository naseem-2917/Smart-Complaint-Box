import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, MapPin, AlertTriangle, Zap } from 'lucide-react';
import Card from '../../components/common/Card';

const AdminAIInsightsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-primary-500" />
                        AI Insights
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        AI-powered analysis of complaint patterns and trends
                    </p>
                </div>

                {/* Key Insights */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Most Common Issue</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">Water Supply</p>
                                <p className="text-sm text-primary-600 dark:text-primary-400">45% of all complaints</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Hotspot Area</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">Block C, Sector 5</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">12 complaints this week</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Trends */}
                <Card className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Trending Issues
                    </h2>
                    <div className="space-y-4">
                        {[
                            { issue: 'Water pressure low in morning hours', trend: '+23%', type: 'up' },
                            { issue: 'Electricity fluctuation reports', trend: '+15%', type: 'up' },
                            { issue: 'Garbage collection delays', trend: '-8%', type: 'down' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <p className="text-gray-700 dark:text-gray-300">{item.issue}</p>
                                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${item.type === 'up'
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {item.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Fake Detection */}
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Potential Spam/Fake Complaints</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                AI detected 3 potentially fake complaints based on:
                            </p>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                                <li>• Similar text patterns from same IP</li>
                                <li>• Duplicate submissions within minutes</li>
                                <li>• Vague descriptions with no specifics</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminAIInsightsPage;
