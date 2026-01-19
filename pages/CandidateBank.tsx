import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Candidate } from '../types';

export const CandidateBank: React.FC = () => {
    const { candidates, jobs, trashCandidate, currentUser } = useApp();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [jobFilter, setJobFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter active candidates only
    const activeCandidates = useMemo(() => {
        return candidates.filter(c => !c.trashed);
    }, [candidates]);

    // Apply filters
    const filteredCandidates = useMemo(() => {
        return activeCandidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesJob = jobFilter === 'all' || candidate.jobId === jobFilter;
            const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

            return matchesSearch && matchesJob && matchesStatus;
        });
    }, [activeCandidates, searchTerm, jobFilter, statusFilter]);

    const handleTrash = async (candidate: Candidate) => {
        if (window.confirm(`Tem certeza que deseja mover "${candidate.name}" para a lixeira?`)) {
            await trashCandidate(candidate.id);
        }
    };

    const getJobTitle = (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        return job?.title || 'Vaga não encontrada';
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Banco de Talentos</h1>
                    <p className="text-sm text-slate-500">Todos os candidatos cadastrados no sistema</p>
                </div>
                <button
                    onClick={() => navigate('/candidate-trash')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Lixeira ({candidates.filter(c => c.trashed).length})
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white"
                    >
                        <option value="all">Todas as Vagas</option>
                        {jobs.filter(j => !j.trashed).map(job => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="Triagem">Triagem</option>
                        <option value="Entrevista">Entrevista</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Rejeitado">Rejeitado</option>
                    </select>

                    <div className="text-sm font-medium text-slate-500">
                        {filteredCandidates.length} candidato{filteredCandidates.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Candidato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vaga</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Habilidades</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-4xl text-slate-300">person_search</span>
                                                <p className="text-slate-400 font-medium">
                                                    {searchTerm || jobFilter !== 'all' || statusFilter !== 'all'
                                                        ? 'Nenhum candidato encontrado com os filtros aplicados.'
                                                        : 'Nenhum candidato cadastrado ainda.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${candidate.avatarColor || 'bg-slate-200 text-slate-600'}`}>
                                                        {candidate.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-[#111318] dark:text-white">{candidate.name}</p>
                                                        <p className="text-xs text-slate-500">{candidate.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/job/${candidate.jobId}`)}
                                                    className="text-sm text-primary hover:underline font-medium"
                                                >
                                                    {getJobTitle(candidate.jobId)}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${candidate.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                                    {candidate.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {candidate.skills && candidate.skills.length > 0 ? (
                                                        candidate.skills.slice(0, 3).map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                    {candidate.skills && candidate.skills.length > 3 && (
                                                        <span className="text-xs text-slate-400">+{candidate.skills.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => navigate(`/job/${candidate.jobId}`)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Ver na Pipeline"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">visibility</span>
                                                    </button>
                                                    {currentUser.role === 'Admin' && (
                                                        <button
                                                            onClick={() => handleTrash(candidate)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            title="Mover para Lixeira"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
