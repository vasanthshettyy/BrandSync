import { useContracts } from '../../hooks/useContracts';
import PageWrapper from '../../components/layout/PageWrapper';
import ContractCard from '../../components/contracts/ContractCard';
import { FileText } from 'lucide-react';

export default function InfluencerContractsPage() {
    const { contracts, loading, submitMilestone } = useContracts();

    return (
        <PageWrapper title="My Contracts" subtitle="Track active campaigns and milestones">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : contracts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No contracts yet</h3>
                    <p className="text-sm text-text-secondary">When a brand accepts your proposal, your contract will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.map(contract => (
                        <ContractCard 
                            key={contract.id} 
                            contract={contract} 
                            onSubmitMilestone={submitMilestone}
                            isBrand={false}
                        />
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}
