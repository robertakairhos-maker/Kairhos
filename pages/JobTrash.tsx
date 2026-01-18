import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const JobTrash: React.FC = () => {
    const navigate = useNavigate();
    const { jobs, restoreJob, deleteJobPermanently, currentUser } = useApp();

    // Only show trashed jobs
    const trashedJobs = jobs.filter(j => j.trashed);

    if (currentUser.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <span className="material-symbols-outlined text-6xl text-red-400">lock</span>
                <h2 className="text-xl font-bold">Acesso Negado</h2>
                <p className="text-gray-500 text-center max-w-md">Esta página é restrita a administradores. Se você acredita que isso é um erro, entre em contato com o suporte.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-2 px-6 py-2 bg-primary text-white rounded-lg font-bold"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <span onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-primary cursor-pointer transition-colors">Vagas</span>
                        <span className="material-symbols-outlined text-xs text-gray-400">chevron_right</span>
                        <span className="text-gray-600 dark:text-gray-300">Lixeira</span>
                    </div>
                    <h1 className="text-4xl font-black leading-tight tracking-tight text-[#111318] dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-500">delete</span>
                        Lixeira de Vagas
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie as vagas que foram removidas do pipeline principal.</p>
                </div>
            </header>

            {trashedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="size-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-4xl text-gray-300">delete_sweep</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">A lixeira está vazia</h3>
                    <p className="text-gray-400 mt-2">Nenhuma vaga foi removida recentemente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trashedJobs.map((job) => (
                        <div key={job.id} className="bg-white dark:bg-[#1a212d] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h3>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{job.company}</p>
                                </div>
                                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded">DELETADO</span>
                            </div>

                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    <span>Recrutador: {job.recruiter.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    <span>Prazo original: {job.deadline || 'Indefinido'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => restoreJob(job.id)}
                                    className="flex-1 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">restore</span>
                                    Restaurar
                                </button>
                                <button
                                    onClick={() => deleteJobPermanently(job.id)}
                                    className="flex-1 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                                    Excluir Final
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
