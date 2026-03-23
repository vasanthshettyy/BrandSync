import { useState } from 'react';
import { Clock, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../../lib/constants';

export default function MilestoneRow({ milestone, onSubmit, onApprove, onRevision, isBrand }) {
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');

    const statusIcon = {
        Pending: <Clock className="w-4 h-4 text-text-muted" />,
        Submitted: <Send className="w-4 h-4 text-blue-400" />,
        Approved: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        Revision_Requested: <AlertCircle className="w-4 h-4 text-amber-400" />,
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(milestone.id, { url, note });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    }

    if (isBrand) {
        return (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5 mb-2">
                <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        milestone.status === 'Approved' ? "bg-emerald-500" : 
                        milestone.status === 'Submitted' ? "bg-blue-500" : "bg-zinc-600"
                    }`} />
                    <span className="text-text-secondary font-medium">{milestone.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[milestone.status]}`}>
                        {milestone.status?.replace('_', ' ')}
                    </span>
                </div>
                {milestone.status === 'Submitted' && (
                    <div className="flex gap-3">
                        <button onClick={() => onRevision(milestone.id, 'Please revise')} 
                            className="text-[10px] text-amber-500 font-bold hover:underline cursor-pointer uppercase tracking-wider">
                            Revision
                        </button>
                        <button onClick={() => onApprove(milestone.id)} 
                            className="text-[10px] text-emerald-500 font-bold hover:underline cursor-pointer uppercase tracking-wider">
                            Approve
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-3 rounded-lg bg-white/5 border border-border-dark mb-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {statusIcon[milestone.status] || statusIcon.Pending}
                    <span className="text-sm font-medium">{milestone.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[milestone.status] || ''}`}>
                        {milestone.status?.replace('_', ' ')}
                    </span>
                </div>

                {(milestone.status === 'Pending' || milestone.status === 'Revision_Requested') && (
                    <button onClick={() => setShowForm(!showForm)}
                        className="text-xs text-primary hover:underline cursor-pointer font-bold uppercase tracking-wider">
                        Submit Work
                    </button>
                )}
            </div>

            {milestone.revision_note && milestone.status === 'Revision_Requested' && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1 bg-amber-400/5 p-2 rounded-lg border border-amber-400/10">
                    <AlertCircle className="w-3 h-3" /> <b>Revision:</b> {milestone.revision_note}
                </p>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-3 space-y-2 animate-fade-in">
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                        placeholder="Link to your deliverable (Google Drive, etc.)"
                        className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-xs outline-none focus:border-primary" />
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)" rows={2}
                        className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-xs outline-none focus:border-primary resize-none" />
                    <button type="submit" disabled={submitting || !url.trim()}
                        className="w-full px-4 py-2 bg-gradient-brand text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {submitting ? 'Submitting...' : 'Submit Deliverable'}
                    </button>
                </form>
            )}
        </div>
    );
}
