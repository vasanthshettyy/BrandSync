import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

export default function InfluencerLayout() {
    return (
        <div className="flex h-screen bg-surface-900 p-4 gap-4 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 gap-4 transition-all duration-300 ease-in-out">
                <Topbar />
                <main className="flex-1 overflow-y-auto glass-card !rounded-3xl border border-white/10 bg-surface-800/20 scrollbar-hide">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
