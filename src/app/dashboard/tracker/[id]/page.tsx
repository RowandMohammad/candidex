import { JobPackDetailClient } from './job-pack-detail-client';

export default async function JobPackDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <JobPackDetailClient packId={id} />;
}
