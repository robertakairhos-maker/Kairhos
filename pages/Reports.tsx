import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Job, Candidate } from '../types';

export const Reports: React.FC = () => {
    const { jobs, candidates, currentUser } = useApp();

    // 1. Role-based Filtering
    const filteredJobs = useMemo(() => {
        if (currentUser.role === 'Admin') return jobs.filter(j => !j.trashed);
        return jobs.filter(j => !j.trashed && j.recruiter.id === currentUser.id);
    }, [jobs, currentUser]);

    const filteredCandidates = useMemo(() => {
        const jobIds = new Set(filteredJobs.map(j => j.id));
        return candidates.filter(c => !c.trashed && jobIds.has(c.jobId));
    }, [candidates, filteredJobs]);

    // 2. Metrics Calculations
    const metrics = useMemo(() => {
        const activeJobs = filteredJobs.filter(j => j.stage !== 'Vaga fechada').length;
        const closedJobs = filteredJobs.filter(j => j.stage === 'Vaga fechada').length;
        const totalCandidates = filteredCandidates.length;

        // Funnel counts
        const inInterview = filteredCandidates.filter(c =>
            ['Primeira entrevista', 'Entrevista técnica', 'Entrevista gestor'].includes(c.stage)
        ).length;

        const hired = filteredCandidates.filter(c => c.stage === 'Aprovado').length;
        const conversionRate = totalCandidates > 0 ? ((hired / totalCandidates) * 100).toFixed(1) : '0';

        return {
            activeJobs,
            closedJobs,
            totalCandidates,
            inInterview,
            hired,
            conversionRate
        };
    }, [filteredJobs, filteredCandidates]);

    // 3. Job Funnel Breakdown
    const jobStats = filteredJobs.map(job => {
        const jobCandidates = candidates.filter(c => c.jobId === job.id && !c.trashed);
        return {
            ...job,
            stats: {
                total: jobCandidates.length,
                screening: jobCandidates.filter(c => c.stage === 'Triagem').length,
                test: jobCandidates.filter(c => c.stage === 'Fase de testes').length,
                interview: jobCandidates.filter(c => ['Primeira entrevista', 'Entrevista técnica', 'Entrevista gestor'].includes(c.stage)).length,
                hired: jobCandidates.filter(c => c.stage === 'Aprovado').length,
                rejected: jobCandidates.filter(c => c.stage === 'Reprovado').length
            }
        };
    });

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in duration-500">
            {/* Header */}
            <header className="mb-10">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    <span>Insights & Analytics</span>
                </div>
                <h1 className="text-4xl font-extrabold text-[#111318] dark:text-white tracking-tight">
                    Relatórios de Performance
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                    {currentUser.role === 'Admin'
                        ? 'Visão global de todas as vagas e candidatos da agência.'
                        : 'Métricas de desempenho para as vagas sob sua responsabilidade.'}
                </p>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard
                    title="Vagas Ativas"
                    value={metrics.activeJobs}
                    icon="work"
                    color="blue"
                    description="Em andamento"
                />
                <MetricCard
                    title="Total Candidatos"
                    value={metrics.totalCandidates}
                    icon="groups"
                    color="purple"
                    description="No funnel filtrado"
                />
                <MetricCard
                    title="Em Entrevista"
                    value={metrics.inInterview}
                    icon="forum"
                    color="amber"
                    description="Fases críticas"
                />
                <MetricCard
                    title="Taxa de Conversão"
                    value={`${metrics.conversionRate}%`}
                    icon="trending_up"
                    color="emerald"
                    description="Candidatos contratados"
                />
            </div>

            {/* Job Progress Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Andamento por Vaga</h2>
                        <p className="text-sm text-gray-500 mt-1">Detalhamento do funnel por oportunidade.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Total de Vagas: {filteredJobs.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/30">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Vaga / Cliente</th>
                                <th className="px-4 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Candidatos</th>
                                <th className="px-4 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Fases do Funnel</th>
                                <th className="px-4 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Contratados</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {jobStats.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-gray-300">visibility_off</span>
                                            <p className="text-gray-400 font-medium">Nenhuma vaga encontrada para o seu perfil.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jobStats.map(job => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white text-base">{job.title}</span>
                                                <span className="text-xs font-semibold text-gray-400 uppercase mt-1 tracking-wider">{job.company}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold px-3 py-1 rounded-full text-sm">
                                                {job.stats.total}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center justify-center gap-1">
                                                <FunnelStep count={job.stats.screening} label="Triagem" color="blue" />
                                                <FunnelStep count={job.stats.test} label="Testes" color="purple" />
                                                <FunnelStep count={job.stats.interview} label="Entrevistas" color="amber" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-lg font-black ${job.stats.hired > 0 ? 'text-emerald-500' : 'text-gray-300'}`}>
                                                    {job.stats.hired}
                                                </span>
                                                <div className="w-12 bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full transition-all duration-1000"
                                                        style={{ width: job.stats.total > 0 ? `${(job.stats.hired / job.stats.total) * 100}%` : '0%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${job.stage === 'Vaga fechada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    job.stage === 'Vaga paralisada' ? 'bg-gray-50 text-gray-400 border border-gray-100' :
                                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {job.stage}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ title: string, value: string | number, icon: string, color: string, description: string }> = ({ title, value, icon, color, description }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-6">
                <div className={`size-14 rounded-2xl flex items-center justify-center border ${colorClasses[color]}`}>
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <span className="material-symbols-outlined text-gray-200 group-hover:text-primary transition-colors">trending_up</span>
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
        </div>
    );
};

const FunnelStep: React.FC<{ count: number, label: string, color: 'blue' | 'purple' | 'amber' }> = ({ count, label, color }) => {
    const colors = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500'
    };

    return (
        <div className="group relative flex flex-col items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-900 -mx-1 shadow-sm transition-transform group-hover:-translate-y-1 ${colors[color]}`}>
                {count}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-20">
                <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                    {label}: {count}
                </div>
            </div>
        </div>
    );
};
