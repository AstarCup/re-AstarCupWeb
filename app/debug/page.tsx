import TournamentConfigCard from '@/app/debug/components/TournamentConfigCard';
import RegisterUserCard from '@/app/debug/components/RegisterUserCard';

export default function DebugPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">调试页面</h1>

            <RegisterUserCard />
            <TournamentConfigCard />

        </div>
    );
}
