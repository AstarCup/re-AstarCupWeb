import TournamentConfigCard from '@/app/debug/components/TournamentConfigCard';
import RegisterUserCard from '@/app/debug/components/RegisterUserCard';

import { useUserData,useConfigData } from '@/app/lib/FetcherApi';

export default function DebugPage() {
    const { 
        userData,
        isLoading:isUserLoading,
        isError:isUserError,
        mutate:mutateUser
    } = useUserData();
    const {
        configData,
        isLoading:isConfigLoading,
        isError:isConfigError,
        mutate:mutateConfig
    } = useConfigData();

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">调试页面</h1>

            <RegisterUserCard userInfo={userData} />
            <TournamentConfigCard />

        </div>
    );
}
