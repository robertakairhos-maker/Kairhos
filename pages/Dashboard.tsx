import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { jobs, candidates, users, currentUser } = useApp();
    const navigate = useNavigate();

    // Metrics Calculations
    const totalJobs = jobs.length;
    const totalCandidates = candidates.length;
    const activeJobs = jobs.filter(j => j.stage !== 'Entregue' && j.stage !== 'Retrabalho').length;
    const criticalJobs = jobs.filter(j => j.priority === 'Crítico').length;
    const closedJobs = totalJobs - activeJobs;

    const candidatesPerJob = totalJobs > 0 ? (totalCandidates / totalJobs).toFixed(1) : '0';

    // Get jobs closing soon (sorted by days remaining)
    const urgentJobs = [...jobs]
        .filter(j => j.daysRemaining !== undefined && j.daysRemaining <= 10 && j.stage !== 'Entregue')
        .sort((a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0))
        .slice(0, 5);

    // Group jobs by stage for distribution
    const stageDistribution = {
        'Vagas Abertas': jobs.filter(j => j.stage === 'Vagas Abertas').length,
        'Em Triagem': jobs.filter(j => j.stage === 'Em Triagem').length,
        'Entrevistas': jobs.filter(j => j.stage === 'Primeira Entrevista' || j.stage === 'Entrevista Gestor').length,
        'Finalizado': jobs.filter(j => j.stage === 'Entregue').length
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Dashboard Analítico</h1>
                    <p className="text-sm text-slate-500">Visão geral dos indicadores de desempenho de recrutamento.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold dark:text-white">{currentUser.name}</p>
                        <p className="text-[10px] text-[#616f89]">{currentUser.role}</p>
                    </div>
                    <div className="size-10 rounded-full border-2 border-primary/20 p-0.5">
                        <img alt="User profile" className="rounded-full size-full object-cover" src={currentUser.avatar} />
                    </div>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vagas Ativas</p>
                            <h3 className="text-3xl font-black text-[#111318] dark:text-white mt-2">{activeJobs}</h3>
                            <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {totalJobs} total criadas
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined text-2xl">work</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Candidatos</p>
                            <h3 className="text-3xl font-black text-[#111318] dark:text-white mt-2">{totalCandidates}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Média de {candidatesPerJob} por vaga
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vagas Fechadas</p>
                            <h3 className="text-3xl font-black text-[#111318] dark:text-white mt-2">{closedJobs}</h3>
                            <p className="text-xs text-emerald-500 font-bold mt-1">
                                Sucesso neste mês
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Atenção Necessária</p>
                            <h3 className="text-3xl font-black text-[#111318] dark:text-white mt-2">{criticalJobs}</h3>
                            <p className="text-xs text-red-500 font-bold mt-1">
                                Vagas Críticas
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <span className="material-symbols-outlined text-2xl">priority_high</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Job Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[#111318] dark:text-white">Status das Vagas Ativas</h2>
                            <button onClick={() => navigate('/pipeline')} className="text-sm text-primary font-bold hover:underline">Ver Pipeline Completo</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Vaga</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Empresa</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Etapa</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Progresso</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Candidatos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {jobs.slice(0, 6).map(job => (
                                        <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm text-[#111318] dark:text-white">{job.title}</div>
                                                {job.priority === 'Crítico' && <span className="text-[10px] text-red-500 font-bold">Crítico</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{job.company}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${job.stage === 'Entregue' ? 'bg-green-100 text-green-700' :
                                                        job.stage === 'Vagas Abertas' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {job.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 w-32 hidden sm:table-cell">
                                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: `${job.progress}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full px-2 py-1 text-xs font-bold">
                                                    {job.candidatesCount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Deadlines & Distribution */}
                    <div className="flex flex-col gap-6">

                        {/* Funnel Distribution */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Distribuição do Funnel</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Vagas Abertas</span>
                                        <span className="font-bold">{stageDistribution['Vagas Abertas']}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${(stageDistribution['Vagas Abertas'] / totalJobs) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Em Triagem</span>
                                        <span className="font-bold">{stageDistribution['Em Triagem']}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full" style={{ width: `${(stageDistribution['Em Triagem'] / totalJobs) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Em Entrevista</span>
                                        <span className="font-bold">{stageDistribution['Entrevistas']}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-full" style={{ width: `${(stageDistribution['Entrevistas'] / totalJobs) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">Finalizadas</span>
                                        <span className="font-bold">{stageDistribution['Finalizado']}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: `${(stageDistribution['Finalizado'] / totalJobs) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deadlines */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex-1">
                            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Prazos Próximos</h3>
                            <div className="flex flex-col gap-3">
                                {urgentJobs.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">Nenhuma vaga próxima do prazo.</p>
                                ) : (
                                    urgentJobs.map(job => (
                                        <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white dark:bg-slate-700 p-2 rounded text-orange-500 shadow-sm">
                                                    <span className="material-symbols-outlined text-lg">calendar_clock</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#111318] dark:text-white line-clamp-1 w-40">{job.title}</p>
                                                    <p className="text-[10px] text-slate-500">{job.company}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{job.daysRemaining} dias</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
