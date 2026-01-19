import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Candidate } from '../types';

export const CandidateTrash: React.FC = () => {
    const { candidates, jobs, restoreCandidate, deleteCandidatePermanently, currentUser } = useApp();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    // Filter trashed candidates only
    const trashedCandidates = useMemo(() => {
        return candidates.filter(c => c.trashed);
    }, [candidates]);

    // Apply search filter
    const filteredCandidates = useMemo(() => {
        return trashedCandidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [trashedCandidates, searchTerm]);

    const handleRestore = async (candidate: Candidate) => {
        if (window.confirm(`Restaurar "${candidate.name}"? O candidato voltará para o Banco de Talentos.`)) {
            await restoreCandidate(candidate.id);
        }
    };

    const handleDeletePermanently = async (candidate: Candidate) => {
        if (window.confirm(`⚠️ ATENÇÃO: Excluir PERMANENTEMENTE "${candidate.name}"?\n\nEsta ação NÃO PODE ser desfeita. Todos os dados do candidato serão perdidos.`)) {
            if (window.confirm(`Confirme novamente: Tem CERTEZA ABSOLUTA que deseja excluir "${candidate.name}" permanentemente?`)) {
                await deleteCandidatePermanently(candidate.id);
            }
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
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Lixeira de Candidatos</h1>
                    <p className="text-sm text-slate-500">Candidatos excluídos do sistema</p>
                </div>
                <button
                    onClick={() => navigate('/candidate-bank')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Voltar ao Banco
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                {/* Warning Banner */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                    <div>
                        <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-1">Lixeira de Candidatos</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Candidatos nesta área foram excluídos do Banco de Talentos. Você pode restaurá-los ou excluí-los permanentemente.
                            {currentUser.role === 'Admin' && ' A exclusão permanente não pode ser desfeita.'}
                        </p>
                    </div>
                </div>

                {/* Search */}
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

                    <div className="text-sm font-medium text-slate-500">
                        {filteredCandidates.length} candidato{filteredCandidates.length !== 1 ? 's' : ''} na lixeira
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
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-4xl text-slate-300">delete_sweep</span>
                                                <p className="text-slate-400 font-medium">
                                                    {searchTerm
                                                        ? 'Nenhum candidato encontrado na lixeira.'
                                                        : 'A lixeira está vazia.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-200 text-slate-500">
                                                        {candidate.initials}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-500 dark:text-slate-400">{candidate.name}</p>
                                                        <p className="text-xs text-slate-400">{candidate.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {getJobTitle(candidate.jobId)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    {candidate.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRestore(candidate)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all text-sm font-bold"
                                                        title="Restaurar"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">restore</span>
                                                        Restaurar
                                                    </button>
                                                    {currentUser.role === 'Admin' && (
                                                        <button
                                                            onClick={() => handleDeletePermanently(candidate)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm font-bold"
                                                            title="Excluir Permanentemente"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete_forever</span>
                                                            Excluir
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
