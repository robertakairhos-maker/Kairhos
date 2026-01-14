import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, KanbanColumnData } from '../types';
import { useApp } from '../context/AppContext';

const INITIAL_COLUMNS: KanbanColumnData[] = [
    { id: 'Vagas Abertas', title: 'Vagas Abertas', count: 0, color: 'bg-blue-400' },
    { id: 'Em Triagem', title: 'Em Triagem', count: 0, color: 'bg-amber-400' },
    { id: 'Primeira Entrevista', title: 'Primeira Entrevista', count: 0, color: 'bg-indigo-400' },
    { id: 'Entrevista Gestor', title: 'Entrevista Gestor', count: 0, color: 'bg-purple-400' },
    { id: 'Vaga paralisada', title: 'Vaga paralisada', count: 0, color: 'bg-gray-400' },
    { id: 'Substituição', title: 'Substituição', count: 0, color: 'bg-cyan-400' },
    { id: 'Entregue', title: 'Entregue', count: 0, color: 'bg-green-400' },
    { id: 'Retrabalho', title: 'Retrabalho', count: 0, color: 'bg-red-400' },
];

export const Pipeline: React.FC = () => {
    const navigate = useNavigate();
    const { jobs, updateJobStage, notifications, markNotificationAsRead, currentUser } = useApp();

    // UI States
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>(window.innerWidth < 768 ? 'list' : 'kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [columns, setColumns] = useState<KanbanColumnData[]>(INITIAL_COLUMNS);
    const [showNotifications, setShowNotifications] = useState(false);

    // Force update columns if new ones are added in code (Migration for existing state)
    useEffect(() => {
        const missingColumns = INITIAL_COLUMNS.filter(ic => !columns.find(c => c.id === ic.id));
        if (missingColumns.length > 0) {
            setColumns(prev => [...prev, ...missingColumns]);
        }
    }, [columns]);

    // Dnd States
    const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

    // Column Renaming States
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [tempTitle, setTempTitle] = useState("");

    // --- Computed Data ---
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateJobCount = (stageId: string) => {
        return filteredJobs.filter(j => j.stage === stageId).length;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // --- Drag to Scroll Handlers ---
    const boardRef = useRef<HTMLDivElement>(null);
    const [isDragScroll, setIsDragScroll] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleBoardPointerDown = (e: React.PointerEvent) => {
        // Only trigger for primary pointer (left click or touch)
        if (!e.isPrimary) return;

        // Prevent scrolling if clicking on interaction elements
        const target = e.target as HTMLElement;
        if (target.closest('.cursor-grab') || target.closest('button') || target.closest('input') || target.closest('a')) return;

        if (!boardRef.current) return;

        setIsDragScroll(true);
        // Set capture to track movement even if pointer leaves element
        boardRef.current.setPointerCapture(e.pointerId);

        setStartX(e.pageX - boardRef.current.offsetLeft);
        setScrollLeft(boardRef.current.scrollLeft);
    };

    const handleBoardPointerMove = (e: React.PointerEvent) => {
        if (!isDragScroll || !boardRef.current) return;

        // requestAnimationFrame could be added if performance is an issue
        const x = e.pageX - boardRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Adjusted sensitivity
        boardRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleBoardPointerUp = (e: React.PointerEvent) => {
        if (!isDragScroll || !boardRef.current) return;
        setIsDragScroll(false);
        boardRef.current.releasePointerCapture(e.pointerId);
    };

    const stopDragging = () => {
        setIsDragScroll(false);
    };

    // --- Handlers ---

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedJobId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) {
            updateJobStage(id, targetStageId as Job['stage']);
        }
        setDraggedJobId(null);
    };

    const startEditing = (column: KanbanColumnData) => {
        setEditingColumnId(column.id);
        setTempTitle(column.title);
        setActiveMenu(null);
    };

    const saveTitle = () => {
        if (editingColumnId && tempTitle.trim()) {
            setColumns(prev => prev.map(col =>
                col.id === editingColumnId ? { ...col, title: tempTitle } : col
            ));
        }
        setEditingColumnId(null);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-[#2d3748] bg-white dark:bg-[#1a202c] px-4 py-3 sm:px-6 sticky top-0 z-30 gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center bg-[#f0f2f4] dark:bg-[#2d3748] rounded-lg px-3 py-1.5 gap-2 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-[#616f89] text-xl">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-48 placeholder:text-[#616f89]"
                            placeholder="Buscar vagas ou empresas..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-[#616f89] hover:bg-[#f0f2f4] dark:hover:bg-[#2d3748] rounded-full transition-colors relative"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1a202c]"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#2d3748] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-[#111318] dark:text-white">Notificações</h3>
                                        <button className="text-[10px] text-primary font-bold hover:underline">Marcar todas como lidas</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-xs">Nenhuma notificação nova</div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                    onClick={() => markNotificationAsRead(notification.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 size-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[#111318] dark:text-white">{notification.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden lg:block">
                            <p className="text-xs font-bold dark:text-white">{currentUser.name}</p>
                            <p className="text-[10px] text-[#616f89]">{currentUser.role}</p>
                        </div>
                        <div className="size-10 rounded-full border-2 border-primary/20 p-0.5">
                            <img alt="User profile" className="rounded-full size-full object-cover" src={currentUser.avatar} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-4 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <nav className="flex text-xs text-[#616f89] mb-1 gap-1 items-center">
                            <span className="hover:text-primary cursor-pointer">Recrutamento</span>
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                            <span className="text-primary font-semibold">Pipeline</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#111318] dark:text-white tracking-tight">Pipeline de Vagas</h1>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                        <div className="flex bg-white dark:bg-[#1a202c] rounded-lg border border-gray-200 dark:border-gray-700 p-1 shrink-0">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${viewMode === 'kanban' ? 'bg-[#f0f2f4] dark:bg-[#2d3748] text-primary' : 'text-[#616f89] hover:bg-gray-50'}`}
                            >
                                <span className="material-symbols-outlined text-lg">view_kanban</span>
                                <span className="text-xs font-bold hidden sm:inline">Board</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-[#f0f2f4] dark:bg-[#2d3748] text-primary' : 'text-[#616f89] hover:bg-gray-50'}`}
                            >
                                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                                <span className="text-xs font-bold hidden sm:inline">Lista</span>
                            </button>
                        </div>
                        <button onClick={() => navigate('/jobs/new')} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all shrink-0">
                            <span className="material-symbols-outlined">add</span>
                            <span className="hidden sm:inline">Nova Vaga</span>
                            <span className="sm:hidden">Nova</span>
                        </button>
                    </div>
                </div>

                {/* View Mode Switcher */}
                {viewMode === 'kanban' ? (
                    // KANBAN VIEW
                    <div
                        ref={boardRef}
                        onPointerDown={handleBoardPointerDown}
                        onPointerMove={handleBoardPointerMove}
                        onPointerUp={handleBoardPointerUp}
                        onPointerCancel={stopDragging}
                        className={`flex-1 overflow-x-auto custom-scrollbar px-6 pb-8 touch-pan-y ${isDragScroll ? 'cursor-grabbing select-none' : 'cursor-default'}`}
                        style={{ scrollBehavior: isDragScroll ? 'auto' : 'smooth' }}
                    >
                        <div className="flex gap-6 h-full items-start">
                            {columns.map((col) => (
                                <div
                                    key={col.id}
                                    className="min-w-[320px] w-[320px] flex-shrink-0 flex flex-col h-full rounded-xl transition-colors duration-200"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-1 group relative">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className={`size-2 rounded-full ${col.color}`}></span>
                                            {editingColumnId === col.id ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={tempTitle}
                                                    onChange={(e) => setTempTitle(e.target.value)}
                                                    onBlur={saveTitle}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                                                    className="flex-1 bg-white dark:bg-[#2d3748] border border-primary rounded px-2 py-0.5 text-sm font-bold uppercase tracking-wider outline-none text-[#111318] dark:text-white"
                                                />
                                            ) : (
                                                <h3 className="font-bold text-sm text-[#111318] dark:text-white uppercase tracking-wider">{col.title}</h3>
                                            )}
                                            <span className="bg-gray-200 dark:bg-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{updateJobCount(col.id)}</span>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === col.id ? null : col.id)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>

                                            {activeMenu === col.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                                    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#2d3748] rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 w-40 overflow-hidden">
                                                        <button
                                                            onClick={() => startEditing(col)}
                                                            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                            Renomear
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1 custom-scrollbar pb-4 min-h-[150px]">
                                        {col.id === 'Retrabalho' && filteredJobs.filter(j => j.stage === col.id).length === 0 && (
                                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl h-24 flex items-center justify-center text-gray-400">
                                                <span className="material-symbols-outlined text-3xl opacity-20">hourglass_empty</span>
                                            </div>
                                        )}

                                        {filteredJobs.filter(job => job.stage === col.id).map(job => (
                                            <div
                                                key={job.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, job.id)}
                                                onClick={() => navigate(`/jobs/${job.id}`)}
                                                className={`bg-white dark:bg-[#1a202c] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer group ${job.priority === 'Crítico' ? 'border-l-4 border-l-primary' : ''} ${draggedJobId === job.id ? 'opacity-50 rotate-3 scale-95' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    {job.tag && (
                                                        <span className={`${job.tag.color} text-[10px] font-extrabold px-2 py-1 rounded`}>{job.tag.label}</span>
                                                    )}
                                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing hover:scale-110">drag_indicator</span>
                                                </div>
                                                <h4 className="font-bold text-[#111318] dark:text-gray-100 mb-1 leading-tight">{job.title}</h4>
                                                <p className="text-xs text-[#616f89] dark:text-gray-400 mb-4 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">apartment</span> {job.company}
                                                </p>

                                                <div className="space-y-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${job.progress}%` }}></div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {job.candidatesCount ? (
                                                            <div className="flex -space-x-2">
                                                                <img alt="Recruiter" className="size-6 rounded-full border-2 border-white dark:border-[#1a202c]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdvMItBqd86zWcHTVJequBeEdXDC5VZKkwhiqjsNSMJN-noPmhl87597Uac_ER4-y1XdC5KQn2wpo3bEVaKM0WIEYE9OZpUsYGQq4uqlZ2YJ6A-vLuj0XTtwVFfFyo7MlWrMi5ZqU5cX4KNJtRKG2fPOZeTxN-noPmhl87597Uac_ER4-y1XdC5KQn2wpo3bEVaKM0WIEYE9OZpUsYGQq4uqlZ2YJ6A-vLuj0XTtwVFfFyo7MlWrMi5ZqU5cX4KNJtRKG2fPOZeTxN-n_3PXKuaNGY1SOLey7XEAauOfWJNIgqo9zI9AAR9Tf_lThpFh2bSE2eEQKKRRWIFR8YAbkGC2fQ4RSBbfDbDLwLXFf5JFxQVZAe0ww4HxJgPO18" />
                                                                <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#1a202c] flex items-center justify-center text-[8px] font-bold">+{job.candidatesCount}</div>
                                                            </div>
                                                        ) : (
                                                            <img alt="Recruiter" className="size-6 rounded-full border-2 border-white dark:border-[#1a202c]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEdaDdUE-zZfixpoy4GVXNwyG-xBpsS7edaq7DKOY_CgY2q8uaMb4eHHVePJBJllaJiIlsb1ThJiL7VXCJiEBRCtNYXBSPLM3poD95oTxq7XcT2552oVOzEMucR0Crnl8j0gruXGiq1pKPy75HIeswvXgrJrAs3E0r73XwQVRWYEIfkg8zQmxop5dLrVytmYarWPTdPNzD0g7szmkJva-SlTFWpbKBbhV8WtnCTtao1DGqDYJwPjiknDPpGR2lkBACqjymOP7otvY" />
                                                        )}

                                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                                            {job.daysRemaining ? (
                                                                <span className="text-orange-500 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">schedule</span> {job.daysRemaining} dias rest.
                                                                </span>
                                                            ) : job.priority ? (
                                                                <span className={job.priority === 'Crítico' ? 'text-red-500 flex items-center gap-1' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 px-2 py-0.5 rounded'}>
                                                                    {job.priority === 'Crítico' && <span className="material-symbols-outlined text-xs">warning</span>}
                                                                    {job.priority}
                                                                </span>
                                                            ) : (
                                                                <span className="text-green-500 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">check_circle</span> Quase lá
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-6 rounded-full ${job.recruiter.avatar.startsWith('http') ? 'border border-gray-200 dark:border-gray-700 overflow-hidden' : 'bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center'}`}>
                                                            {job.recruiter.avatar.startsWith('http') ? (
                                                                <img alt={job.recruiter.name} className="size-full object-cover" src={job.recruiter.avatar} />
                                                            ) : (
                                                                <span className="text-[8px] font-black text-amber-700 dark:text-amber-300">{job.recruiter.avatar}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-[#616f89] dark:text-gray-400">{job.recruiter.name}</span>
                                                    </div>
                                                    {job.statusIcon && (
                                                        <span className="material-symbols-outlined text-gray-300 text-sm">assignment_ind</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // LIST VIEW
                    <div className="flex-1 overflow-auto px-6 pb-8">
                        <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vaga</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Empresa</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Etapa</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Recrutador</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden lg:table-cell">Prioridade</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right hidden sm:table-cell">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhuma vaga encontrada para sua busca.</td>
                                        </tr>
                                    ) : (
                                        filteredJobs.map(job => (
                                            <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-[#111318] dark:text-white">{job.title}</div>
                                                    {job.tag && <span className={`text-[10px] font-bold ${job.tag.color.replace('bg-', 'text-').split(' ')[0]}`}>{job.tag.label}</span>}
                                                    <div className="sm:hidden text-xs text-gray-500 mt-1">{job.company}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{job.company}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 whitespace-nowrap">
                                                        {job.stage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <img src={job.recruiter.avatar} className="size-6 rounded-full" alt="" />
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{job.recruiter.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden lg:table-cell">
                                                    {job.priority === 'Crítico' ? (
                                                        <span className="text-red-500 font-bold text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">warning</span> Crítico</span>
                                                    ) : job.priority === 'Alta Prioridade' ? (
                                                        <span className="text-amber-500 font-bold text-xs">Alta</span>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium text-xs">Normal</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right hidden sm:table-cell">
                                                    <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">chevron_right</span></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
