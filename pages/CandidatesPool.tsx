import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CandidatesPool: React.FC = () => {
    const { candidates, jobs } = useApp();

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>('');
    const [selectedSeniority, setSelectedSeniority] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedStage, setSelectedStage] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique values for filters
    const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills || []))).sort() as string[];
    const allLocations = Array.from(new Set(candidates.map(c => c.location).filter(Boolean) as string[])).sort();

    // Toggle Skill Selection
    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.phone.includes(searchTerm) ||
            (candidate.currentRole && candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesJob = selectedJob ? candidate.jobId === selectedJob : true;
        const matchesSeniority = selectedSeniority ? candidate.seniority === selectedSeniority : true;
        const matchesLocation = selectedLocation ? candidate.location === selectedLocation : true;
        const matchesStage = selectedStage ? candidate.stage === selectedStage : true;

        // Skill Match (AND logic - must have all selected skills, or OR logic? Let's use AND for stricter filtering)
        const matchesSkills = selectedSkills.length === 0 || selectedSkills.every(skill => candidate.skills?.includes(skill));

        return matchesSearch && matchesJob && matchesSeniority && matchesLocation && matchesStage && matchesSkills;
    });

    const getJobTitle = (jobId: string) => {
        return jobs.find(j => j.id === jobId)?.title || 'Vaga Removida';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSkills([]);
        setSelectedJob('');
        setSelectedSeniority('');
        setSelectedLocation('');
        setSelectedStage('');
    };

    return (
        <div className="flex h-full overflow-hidden bg-background-light dark:bg-background-dark relative">

            {/* Filter Overlay for Mobile */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setShowFilters(false)}></div>
            )}

            {/* Left Filter Sidebar */}
            <aside className={`
                w-80 flex-shrink-0 bg-white dark:bg-[#1a212d] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar
                fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
                ${showFilters ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#1a212d] z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">filter_alt</span>
                            Filtros
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Refine sua busca</p>
                    </div>
                    <button onClick={() => setShowFilters(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {/* Search Input */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Palavra-chave</span>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400"
                                placeholder="Nome, email, cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Filter */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Vaga de Origem</span>
                        <select
                            className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">Todas as Vagas</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Seniority Filter */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Senioridade</span>
                        <div className="flex flex-wrap gap-2">
                            {['Estagiário', 'Júnior', 'Pleno', 'Sênior', 'Especialista', 'Gerente'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedSeniority(selectedSeniority === level ? '' : level)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${selectedSeniority === level
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location Filter */}
                    {allLocations.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Localização</span>
                            <select
                                className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">Qualquer Local</option>
                                {allLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Skills Filter */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Habilidades (Tags)</span>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                            {allSkills.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${selectedSkills.includes(skill)
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Button */}
                    <button
                        onClick={clearFilters}
                        className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">restart_alt</span>
                        Limpar Filtros
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-auto min-h-[5rem] py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 shrink-0 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[#111318] dark:text-white">Talentos ({filteredCandidates.length})</h1>
                            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
                                {selectedSkills.length > 0
                                    ? `Filtrando por ${selectedSkills.length} habilidades`
                                    : 'Visualizando todos os candidatos'}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {/* List */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCandidates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">filter_list_off</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#111318] dark:text-white">Nenhum candidato encontrado</h3>
                                <p className="text-slate-500 font-medium max-w-sm mt-2">Tente ajustar seus filtros laterais para encontrar o que procura.</p>
                                <button onClick={clearFilters} className="mt-6 text-primary font-bold text-sm hover:underline">Limpar todos os filtros</button>
                            </div>
                        ) : (
                            filteredCandidates.map(candidate => (
                                <div key={candidate.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group">
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 size-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm ${candidate.avatarColor}`}>
                                        {candidate.initials}
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-bold text-[#111318] dark:text-white text-lg truncate">{candidate.name}</h3>
                                            {candidate.seniority && (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded border border-slate-200 dark:border-slate-700">
                                                    {candidate.seniority}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                            {candidate.currentRole && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base">work</span>
                                                    <span>{candidate.currentRole}</span>
                                                </div>
                                            )}
                                            {candidate.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base">location_on</span>
                                                    <span>{candidate.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {candidate.skills && candidate.skills.length > 0 ? (
                                                candidate.skills.slice(0, 5).map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Sem tags cadastradas</span>
                                            )}
                                            {candidate.skills && candidate.skills.length > 5 && (
                                                <span className="text-xs text-slate-400 self-center">+{candidate.skills.length - 5}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta & Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                                        <div className="text-left md:text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vaga Atual</p>
                                            <p className="text-xs font-bold text-primary truncate max-w-[150px]" title={getJobTitle(candidate.jobId)}>
                                                {getJobTitle(candidate.jobId)}
                                            </p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${candidate.badgeColor} ${candidate.textColor}`}>
                                                {candidate.badgeText}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 ml-auto md:ml-0">
                                            <a
                                                href={`mailto:${candidate.email}`}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title={candidate.email}
                                            >
                                                <span className="material-symbols-outlined">mail</span>
                                            </a>
                                            <a
                                                href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title={candidate.phone}
                                            >
                                                <span className="material-symbols-outlined">chat</span>
                                            </a>
                                            <a
                                                href={candidate.resumeUrl}
                                                download={candidate.resumeName}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Baixar CV"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
