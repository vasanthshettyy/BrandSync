import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-[240px] transition-all duration-300">
                <Topbar />
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
