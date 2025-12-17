import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, Loader2, User, Mail, FileText,
    Send, Copy, Check, Image as ImageIcon, Plus
} from 'lucide-react';
import {
    getComplaint, updateComplaintStatus, assignComplaint, addAdminNote
} from '../../services/complaints';
import { getUsersByRole, type UserData } from '../../services/users';
import { generateEmail } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Complaint, ComplaintStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';

const AdminComplaintDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAuth();
    const { showSuccess, showError } = useNotification();

    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailType, setEmailType] = useState<'strict' | 'friendly' | 'report'>('strict');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [generatingEmail, setGeneratingEmail] = useState(false);
    const [copied, setCopied] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    // Assignment state
    const [adminUsers, setAdminUsers] = useState<UserData[]>([]);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);

    useEffect(() => {
        if (id) loadComplaint();
        loadAdminUsers();
    }, [id]);

    const loadAdminUsers = async () => {
        try {
            const admins = await getUsersByRole('admin');
            setAdminUsers(admins);
        } catch (error) {
            console.error('Failed to load admin users:', error);
        }
    };

    const loadComplaint = async () => {
        if (!id) return;
        const data = await getComplaint(id);
        setComplaint(data);
        setLoading(false);
    };

    const handleStatusChange = async (newStatus: ComplaintStatus) => {
        if (!id || !userData) return;
        setUpdating(true);
        try {
            await updateComplaintStatus(id, newStatus, userData.displayName || 'Admin');
            showSuccess('Status updated', `Complaint marked as ${newStatus}`);
            loadComplaint();
        } catch (error) {
            showError('Update failed', 'Could not update status');
        }
        setUpdating(false);
    };

    const handleAssign = async (assigneeName: string) => {
        if (!id || !userData) return;
        setUpdating(true);
        try {
            await assignComplaint(id, assigneeName, userData.displayName || 'Admin');
            showSuccess('Assigned', `Complaint assigned to ${assigneeName}`);
            setShowAssignDropdown(false);
            loadComplaint();
        } catch (error) {
            showError('Assignment failed', 'Could not assign complaint');
        }
        setUpdating(false);
    };

    const handleGenerateEmail = async () => {
        if (!complaint) return;
        setGeneratingEmail(true);
        try {
            const email = await generateEmail(complaint, emailType);
            setGeneratedEmail(email);
        } catch (error) {
            showError('Generation failed', 'Could not generate email');
        }
        setGeneratingEmail(false);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(generatedEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddNote = async () => {
        if (!id || !userData || !newNote.trim()) return;
        setAddingNote(true);
        try {
            await addAdminNote(id, newNote, userData.uid, userData.displayName || 'Admin');
            showSuccess('Note added', 'Your private note has been saved');
            setNewNote('');
            setNoteModalOpen(false);
            loadComplaint();
        } catch (error) {
            showError('Failed', 'Could not add note');
        }
        setAddingNote(false);
    };

    const getTimelineIcon = (action: string) => {
        if (action.includes('Submit')) return '📝';
        if (action.includes('AI')) return '🤖';
        if (action.includes('Assign')) return '👤';
        if (action.includes('Progress')) return '🔧';
        if (action.includes('Resolved')) return '✅';
        if (action.includes('Escalat')) return '⚠️';
        if (action.includes('Note')) return '📋';
        return '📋';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Complaint not found</p>
                <Link to="/admin/complaints" className="text-primary-500 hover:underline mt-2 inline-block">
                    Go back
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/complaints" className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Complaint Details</h1>
                        <p className="text-sm text-gray-500">ID: {complaint.id}</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Description */}
                        <Card>
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>

                            {complaint.imageUrl && (
                                <div className="mt-4">
                                    <img src={complaint.imageUrl} alt="Complaint" className="w-full max-h-64 object-cover rounded-xl" />
                                </div>
                            )}
                        </Card>

                        {/* AI Analysis */}
                        <Card>
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">🤖 AI Analysis</h2>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Category</p>
                                    <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 font-medium">{complaint.category}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Priority</p>
                                    <PriorityBadge score={complaint.priorityScore} reasons={complaint.priorityReason} showReasons size="sm" />
                                </div>
                            </div>

                            {complaint.aiSummary && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Summary</p>
                                    <p className="text-gray-700 dark:text-gray-300">{complaint.aiSummary}</p>
                                </div>
                            )}

                            {/* Image Intelligence */}
                            {complaint.detectedObjects && complaint.detectedObjects.length > 0 && (
                                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> Image Intelligence
                                    </p>
                                    <div className="space-y-2">
                                        {complaint.detectedObjects.map((obj, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-sm text-purple-600 dark:text-purple-400">{obj.label}</span>
                                                <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500" style={{ width: `${obj.confidence}%` }} />
                                                </div>
                                                <span className="text-xs text-purple-500">{obj.confidence}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Timeline
                            </h2>

                            <div className="relative pl-6">
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                                {complaint.timeline?.map((event, index) => (
                                    <div key={event.id || index} className="relative mb-4 last:mb-0">
                                        <div className="absolute -left-4 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-500 flex items-center justify-center text-xs">
                                            {getTimelineIcon(event.action)}
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{event.action}</p>
                                            {event.details && <p className="text-sm text-gray-500">{event.details}</p>}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {event.actor} • {event.timestamp?.toDate?.().toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* User Info */}
                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> Complainant
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {complaint.isAnonymous ? '🔒 Anonymous' : complaint.userName}
                                </p>
                                {!complaint.isAnonymous && (
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {complaint.userEmail}
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* Status Actions */}
                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Update Status</h3>
                            <div className="space-y-2">
                                {complaint.status !== 'In Progress' && (
                                    <Button fullWidth variant="secondary" loading={updating} onClick={() => handleStatusChange('In Progress')}>
                                        Mark In Progress
                                    </Button>
                                )}
                                {complaint.status !== 'Resolved' && (
                                    <Button fullWidth loading={updating} onClick={() => handleStatusChange('Resolved')}>
                                        ✅ Mark Resolved
                                    </Button>
                                )}
                                {complaint.status !== 'Escalated' && (
                                    <Button fullWidth variant="danger" loading={updating} onClick={() => handleStatusChange('Escalated')}>
                                        ⚠️ Escalate
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Assignment */}
                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> Assignment
                            </h3>

                            {complaint.assignedTo ? (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Currently assigned to:</p>
                                    <p className="font-medium text-green-600 dark:text-green-400 mb-3">{complaint.assignedTo}</p>
                                    <button
                                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                                        className="text-sm text-primary-500 hover:underline"
                                    >
                                        Reassign to someone else
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">AI Suggestion: <span className="font-medium text-gray-700 dark:text-gray-300">{complaint.suggestedAssignment}</span></p>
                                    <Button
                                        fullWidth
                                        variant="secondary"
                                        loading={updating}
                                        onClick={() => handleAssign(complaint.suggestedAssignment)}
                                        className="mb-2"
                                    >
                                        ✓ Assign to Suggested
                                    </Button>
                                    <button
                                        onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                                        className="text-sm text-primary-500 hover:underline w-full text-center"
                                    >
                                        Or select admin manually
                                    </button>
                                </div>
                            )}

                            {/* Admin Dropdown */}
                            {showAssignDropdown && (
                                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <p className="text-sm text-gray-500 mb-2">Select Admin:</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {adminUsers.length > 0 ? (
                                            adminUsers.map(admin => (
                                                <button
                                                    key={admin.id}
                                                    onClick={() => handleAssign(admin.displayName || admin.email)}
                                                    disabled={updating}
                                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
                                                        {(admin.displayName || admin.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-700 dark:text-gray-300">{admin.displayName || admin.email}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 text-center py-2">No admin users found</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* AI Actions */}
                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🤖 AI Actions</h3>
                            <div className="space-y-2">
                                <Button fullWidth variant="secondary" icon={<FileText className="w-4 h-4" />} onClick={() => { setEmailType('strict'); setEmailModalOpen(true); }}>
                                    ✍️ Strict Email
                                </Button>
                                <Button fullWidth variant="secondary" icon={<FileText className="w-4 h-4" />} onClick={() => { setEmailType('friendly'); setEmailModalOpen(true); }}>
                                    📝 Friendly Reminder
                                </Button>
                                <Button fullWidth variant="secondary" icon={<FileText className="w-4 h-4" />} onClick={() => { setEmailType('report'); setEmailModalOpen(true); }}>
                                    📄 Report Summary
                                </Button>
                            </div>
                        </Card>

                        {/* Admin Notes */}
                        <Card>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white">📝 Admin Notes</h3>
                                <button onClick={() => setNoteModalOpen(true)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Plus className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {complaint.adminNotes && complaint.adminNotes.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {complaint.adminNotes.map((note) => (
                                        <div key={note.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm">
                                            <p className="text-gray-700 dark:text-gray-300">{note.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {note.createdByName} • {note.createdAt?.toDate?.().toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No notes yet</p>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Email Modal */}
                <Modal isOpen={emailModalOpen} onClose={() => { setEmailModalOpen(false); setGeneratedEmail(''); }} title={`Generate ${emailType === 'strict' ? 'Strict' : emailType === 'friendly' ? 'Friendly' : 'Report'} Email`} size="lg">
                    {!generatedEmail ? (
                        <div className="text-center py-8">
                            <Button onClick={handleGenerateEmail} loading={generatingEmail}>
                                <Send className="w-4 h-4 mr-2" /> Generate Email
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {generatedEmail}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button fullWidth variant="secondary" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={handleCopyEmail}>
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Note Modal */}
                <Modal isOpen={noteModalOpen} onClose={() => { setNoteModalOpen(false); setNewNote(''); }} title="Add Admin Note">
                    <Textarea placeholder="Add a private note (not visible to users)..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4} />
                    <Button fullWidth className="mt-4" onClick={handleAddNote} loading={addingNote} disabled={!newNote.trim()}>
                        Add Note
                    </Button>
                </Modal>
            </motion.div>
        </div>
    );
};

export default AdminComplaintDetailPage;
