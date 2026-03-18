import { Outlet } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

export default function InfluencerLayout() {
    return (
        <LayoutGroup>
            <div className="flex h-screen bg-surface-900 p-4 gap-4 overflow-hidden">
                <Sidebar />
                <motion.div 
                    layout
                    className="flex-1 flex flex-col min-w-0 gap-4"
                >
                    <Topbar />
                    <main className="flex-1 overflow-y-auto backdrop-blur-xl !rounded-3xl border border-white/20 bg-surface-800/20 shadow-inner overflow-hidden">
                        <div className="h-full overflow-y-auto scrollbar-hide">
                            <Outlet />
                        </div>
                    </main>
                </motion.div>
            </div>
        </LayoutGroup>
    );
}
