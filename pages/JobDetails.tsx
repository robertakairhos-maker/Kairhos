import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KanbanColumnData, Candidate, Note, Job } from '../types';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';

const INITIAL_COLUMNS: KanbanColumnData[] = [
    { id: 'Triagem', title: 'Triagem', count: 0, color: 'bg-slate-400' },
    { id: 'Primeira entrevista', title: 'Primeira entrevista', count: 0, color: 'bg-blue-400' },
    { id: 'Reprovado', title: 'Reprovado', count: 0, color: 'bg-red-500' },
    { id: 'Video apresentação', title: 'Video apresentação', count: 0, color: 'bg-purple-400' },
    { id: 'Entrevista com gestor', title: 'Entrevista com gestor', count: 0, color: 'bg-indigo-400' },
    { id: 'Presencial', title: 'Presencial', count: 0, color: 'bg-orange-400' },
    { id: 'Testes', title: 'Testes', count: 0, color: 'bg-amber-400' },
    { id: 'Reprovado Gestor', title: 'Reprovado Gestor', count: 0, color: 'bg-red-600' },
    { id: 'Aprovado', title: 'Aprovado', count: 0, color: 'bg-green-500' },
];

export const JobDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { jobs, candidates, updateJob, trashJob, updateCandidateStage, addCandidate, updateCandidate, trashCandidate, restoreCandidate, deleteCandidatePermanently, currentUser, clients } = useApp();

    const job = jobs.find(j => j.id === id);
    const jobCandidates = candidates.filter(c => c.jobId === id && !c.trashed);
    const trashedCandidates = candidates.filter(c => c.jobId === id && c.trashed);

    const [columns, setColumns] = useState(INITIAL_COLUMNS);

    // Force update columns if new ones are added in code (Migration for existing state)
    useEffect(() => {
        const missingColumns = INITIAL_COLUMNS.filter(ic => !columns.find(c => c.id === ic.id));
        if (missingColumns.length > 0) {
            setColumns(prev => [...prev, ...missingColumns]);
        }
    }, [columns]);

    const [showToast, setShowToast] = useState(false);
    const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [tempTitle, setTempTitle] = useState("");

    // --- Drag to Scroll Handlers ---
    const boardRef = useRef<HTMLDivElement>(null);
    const [isDragScroll, setIsDragScroll] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    const handleBoardPointerDown = (e: React.PointerEvent) => {
        // Only use custom logic for mouse. Touch will use native horizontal scrolling.
        if (e.pointerType !== 'mouse') return;
        if (!e.isPrimary) return;

        const target = e.target as HTMLElement;
        if (target.closest('.cursor-grab') || target.closest('button') || target.closest('input') || target.closest('a')) return;

        if (!boardRef.current) return;

        setIsDragScroll(true);
        setStartX(e.pageX - boardRef.current.offsetLeft);
        setScrollLeft(boardRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleBoardPointerMove = (e: React.PointerEvent) => {
        if (!isDragScroll || !boardRef.current) return;

        const x = e.pageX - boardRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;

        // Threshold check to avoid intercepting clicks
        const currentDistance = Math.abs(x - startX);
        if (!boardRef.current.hasPointerCapture(e.pointerId) && currentDistance > 10) {
            boardRef.current.setPointerCapture(e.pointerId);
        }

        if (boardRef.current.hasPointerCapture(e.pointerId)) {
            boardRef.current.scrollLeft = scrollLeft - walk;
            setDragDistance(currentDistance);
        }
    };

    const handleBoardPointerUp = (e: React.PointerEvent) => {
        if (!boardRef.current) return;

        if (boardRef.current.hasPointerCapture(e.pointerId)) {
            boardRef.current.releasePointerCapture(e.pointerId);
        }

        setIsDragScroll(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!boardRef.current) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            boardRef.current.scrollLeft += e.deltaY;
        }
    };

    const stopDragging = () => {
        setIsDragScroll(false);
    };

    // UI Logic
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [isSavingJob, setIsSavingJob] = useState(false);
    const [jobEditForm, setJobEditForm] = useState({
        title: '',
        company: '',
        deadline: '',
        priority: 'Alta Prioridade' as Job['priority'],
        salaryMin: 0,
        salaryMax: 0,
        description: '',
        requirements: ''
    });

    const openEditJobModal = () => {
        if (!job) return;
        setJobEditForm({
            title: job.title,
            company: job.company,
            deadline: job.deadline || '',
            priority: job.priority || 'Alta Prioridade',
            salaryMin: job.salaryMin || 0,
            salaryMax: job.salaryMax || 0,
            description: job.description || '',
            requirements: job.requirements ? job.requirements.join(', ') : ''
        });
        setShowEditJobModal(true);
    };

    const handleJobEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job) return;
        setIsSavingJob(true);
        try {
            const reqArray = jobEditForm.requirements.split(',').map(r => r.trim()).filter(r => r.length > 0);
            await updateJob(job.id, {
                title: jobEditForm.title,
                company: jobEditForm.company,
                deadline: jobEditForm.deadline,
                priority: jobEditForm.priority,
                salaryMin: Number(jobEditForm.salaryMin),
                salaryMax: Number(jobEditForm.salaryMax),
                description: jobEditForm.description,
                requirements: reqArray
            });
            setShowEditJobModal(false);
        } catch (error) {
            console.error('Error saving job:', error);
        } finally {
            setIsSavingJob(false);
        }
    };

    const handleTrashJob = async () => {
        if (!job) return;
        if (window.confirm('Mover esta vaga para a lixeira? Ela não será mais visível no Dashboard.')) {
            await trashJob(job.id);
            navigate('/dashboard');
        }
    };

    // Modals
    const [showCandidateModal, setShowCandidateModal] = useState(false); // Used for Add & Edit
    const [showTrashModal, setShowTrashModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [signedResumeUrl, setSignedResumeUrl] = useState<string | null>(null);
    const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

    const getSignedUrl = async (resumeUrl: string) => {
        try {
            if (!resumeUrl) return null;
            // Check if it's already a blob or object URL (local preview)
            if (resumeUrl.startsWith('blob:') || resumeUrl.startsWith('data:')) return resumeUrl;
            // Check if it's a dummy public URL
            if (resumeUrl.includes('dummy.pdf')) return resumeUrl;

            // Extract path
            // Format: .../storage/v1/object/public/resumes/<path>
            let path = '';
            if (resumeUrl.includes('/resumes/')) {
                const parts = resumeUrl.split('/resumes/');
                if (parts.length > 1) {
                    path = parts[1];
                }
            }

            if (!path) return resumeUrl; // Return original if path extraction fails

            path = decodeURIComponent(path); // Handle spaces/special chars

            const { data, error } = await supabase.storage
                .from('resumes')
                .createSignedUrl(path, 60 * 60); // 1 hour validity

            if (error || !data?.signedUrl) {
                console.warn('Failed to get signed URL:', error);
                return resumeUrl;
            }

            return data.signedUrl;
        } catch (error) {
            console.error('Error generating signed URL:', error);
            return resumeUrl;
        }
    };

    const handleDownloadResume = async (candidate: Candidate) => {
        if (!candidate.resumeUrl) return;

        try {
            const url = await getSignedUrl(candidate.resumeUrl);
            if (!url) return;

            // Create temporary link to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = candidate.resumeName || 'curriculo';
            link.target = '_blank'; // Open in new tab if download is blocked or to be safe
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            alert('Erro ao baixar arquivo. Tente novamente.');
        }
    };
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [candidateForm, setCandidateForm] = useState({
        name: '',
        email: '',
        phone: '',
        resumeName: '',
        resumeUrl: '',
        location: '',
        currentRole: '',
        seniority: 'Pleno' as Candidate['seniority'],
        skills: ''
    });

    // Note State
    const [newNoteContent, setNewNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const notesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!job && id) {
            // navigate('/dashboard'); // Optional: redirect
        }
    }, [job, id, navigate]);

    // Scroll to bottom of notes when modal opens or note added
    useEffect(() => {
        if (showNotesModal && notesContainerRef.current) {
            notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
        }
    }, [showNotesModal, selectedCandidate?.notes]);

    if (!job) return <div className="p-10 text-center">Vaga não encontrada</div>;

    const filteredCandidates = filterStatus
        ? jobCandidates.filter(c => c.status === filterStatus)
        : jobCandidates;

    const updateCandidateCount = (stageId: string) => {
        return filteredCandidates.filter(c => c.stage === stageId).length;
    };

    // --- Drag & Drop ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedCandidateId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        const candidateId = e.dataTransfer.getData('text/plain');
        if (candidateId) {
            let newStatus: Candidate['status'] | undefined;
            if (targetStageId === 'Reprovado' || targetStageId === 'Reprovado Gestor') {
                newStatus = 'Rejeitado';
            } else if (targetStageId === 'Aprovado') {
                newStatus = 'Aprovado';
            }

            // Perform the update
            updateCandidateStage(candidateId, targetStageId as Candidate['stage']);

            // If status changed to rejected, also update the status field if needed (wrapper for your context update might be needed if updateCandidateStage doesn't handle status)
            // Assuming we also want to update the candidate status property explicitly:
            if (newStatus) {
                updateCandidate(candidateId, { status: newStatus });
            }

            const currentCandidate = jobCandidates.find(c => c.id === candidateId);
            if (currentCandidate && currentCandidate.stage !== targetStageId) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        }
        setDraggedCandidateId(null);
    };

    // --- Column Renaming ---
    const startEditing = (column: KanbanColumnData) => {
        if (currentUser.role !== 'Admin') return;
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

    const addColumn = () => {
        if (currentUser.role !== 'Admin') return;
        const newId = `new-stage-${Date.now()}`;
        const newColumn: KanbanColumnData = {
            id: newId,
            title: 'Nova Etapa',
            count: 0,
            color: ''
        };
        setColumns(prev => [...prev, newColumn]);
        setEditingColumnId(newId);
        setTempTitle('Nova Etapa');
    };

    const deleteColumn = (columnId: string) => {
        if (currentUser.role !== 'Admin') return;
        if (window.confirm('Tem certeza que deseja excluir esta etapa? Candidatos nesta etapa precisarão ser movidos manualmente.')) {
            setColumns(prev => prev.filter(col => col.id !== columnId));
            setActiveMenu(null);
        }
    };

    const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

    const handleColumnDragStart = (e: React.DragEvent, index: number) => {
        if (currentUser.role !== 'Admin') return;
        setDraggedColumnIndex(index);
        e.dataTransfer.setData('column-index', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
        if (currentUser.role !== 'Admin') return;
        const sourceIndexStr = e.dataTransfer.getData('column-index');
        if (sourceIndexStr === '') return; // Not a column drag

        const sourceIndex = parseInt(sourceIndexStr);
        if (sourceIndex === targetIndex) return;

        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(sourceIndex, 1);
        newColumns.splice(targetIndex, 0, movedColumn);
        setColumns(newColumns);
        setDraggedColumnIndex(null);
    };

    // --- Modal Handlers ---

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedCandidate(null);
        setCandidateForm({
            name: '', email: '', phone: '', resumeName: '', resumeUrl: '',
            location: '', currentRole: '', seniority: 'Pleno', skills: ''
        });
        setNewNoteContent('');
        setShowCandidateModal(true);
    };

    const openEditModal = (candidate: Candidate) => {
        setIsEditing(true);
        setSelectedCandidate(candidate);
        setCandidateForm({
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            resumeName: candidate.resumeName || '',
            resumeUrl: candidate.resumeUrl || '',
            location: candidate.location || '',
            currentRole: candidate.currentRole || '',
            seniority: candidate.seniority || 'Pleno',
            skills: candidate.skills ? candidate.skills.join(', ') : ''
        });
        setNewNoteContent('');
        setShowCandidateModal(true);
    };

    const openPreviewModal = async (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setShowPreviewModal(true);
        setSignedResumeUrl(null); // Reset

        if (candidate.resumeUrl) {
            setIsGeneratingUrl(true);
            const url = await getSignedUrl(candidate.resumeUrl);
            setSignedResumeUrl(url);
            setIsGeneratingUrl(false);
        }
    };

    const openNotesModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setNewNoteContent('');
        setShowNotesModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            setCandidateForm(prev => ({
                ...prev,
                resumeName: file.name,
                resumeUrl: data.publicUrl
            }));

        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Erro ao fazer upload do currículo. Verifique se o bucket "resumes" existe e é público.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCandidateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let notes: Note[] = [];
        // If adding new candidate with a note
        if (!isEditing && newNoteContent.trim()) {
            notes.push({
                id: Date.now().toString(),
                content: newNoteContent,
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorAvatar: currentUser.avatar,
                createdAt: new Date().toISOString()
            });
        } else if (isEditing && selectedCandidate && selectedCandidate.notes) {
            notes = selectedCandidate.notes;
        }

        const skillsArray = candidateForm.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (isEditing && selectedCandidate) {
            updateCandidate(selectedCandidate.id, {
                name: candidateForm.name,
                email: candidateForm.email,
                phone: candidateForm.phone,
                resumeName: candidateForm.resumeName,
                resumeUrl: candidateForm.resumeUrl,
                location: candidateForm.location,
                currentRole: candidateForm.currentRole,
                seniority: candidateForm.seniority,
                skills: skillsArray
            });
        } else {
            addCandidate({
                jobId: job.id,
                name: candidateForm.name,
                email: candidateForm.email,
                phone: candidateForm.phone,
                status: 'Triagem',
                stage: 'Triagem',
                notes: notes,
                resumeName: candidateForm.resumeName,
                resumeUrl: candidateForm.resumeUrl,
                location: candidateForm.location,
                currentRole: candidateForm.currentRole,
                seniority: candidateForm.seniority,
                skills: skillsArray
            });
        }
        setShowCandidateModal(false);
    };

    const handleAddNote = () => {
        if (selectedCandidate && newNoteContent.trim()) {
            const newNote: Note = {
                id: Date.now().toString(),
                content: newNoteContent,
                authorId: currentUser.id,
                authorName: currentUser.name,
                authorAvatar: currentUser.avatar,
                createdAt: new Date().toISOString()
            };

            const updatedNotes = selectedCandidate.notes ? [...selectedCandidate.notes, newNote] : [newNote];
            updateCandidate(selectedCandidate.id, { notes: updatedNotes });

            // Update local state to reflect change immediately in modal
            setSelectedCandidate({ ...selectedCandidate, notes: updatedNotes });

            setNewNoteContent('');
        }
    };

    const handleEditNote = (note: Note) => {
        setEditingNoteId(note.id);
        setEditingNoteContent(note.content);
    };

    const handleSaveEditedNote = () => {
        if (selectedCandidate && editingNoteId && editingNoteContent.trim()) {
            const updatedNotes = selectedCandidate.notes?.map(note =>
                note.id === editingNoteId ? { ...note, content: editingNoteContent } : note
            ) || [];

            updateCandidate(selectedCandidate.id, { notes: updatedNotes });
            setSelectedCandidate({ ...selectedCandidate, notes: updatedNotes });
            setEditingNoteId(null);
            setEditingNoteContent('');
        }
    };

    const handleDeleteNote = (noteId: string) => {
        if (selectedCandidate && window.confirm('Tem certeza que deseja excluir este comentário?')) {
            const updatedNotes = selectedCandidate.notes?.filter(note => note.id !== noteId) || [];
            updateCandidate(selectedCandidate.id, { notes: updatedNotes });
            setSelectedCandidate({ ...selectedCandidate, notes: updatedNotes });
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Indefinido';
        const date = new Date(dateStr);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString('pt-BR');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <header className="sticky top-0 z-50 w-full border-b border-[#dbdfe6] dark:border-[#2a303c] bg-white dark:bg-[#1a212d] px-4 sm:px-6 lg:px-20 py-3">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-xl">hourglass_top</span>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block text-[#111318] dark:text-white">Kairhos</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#" className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">Vagas</a>
                            <a href="#" className="text-[#616f89] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors">Candidatos</a>
                            <a href="#" className="text-[#616f89] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors">Clientes</a>
                            <a href="#" className="text-[#616f89] dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors">Relatórios</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89] text-xl">search</span>
                            <input className="w-64 h-10 pl-10 pr-4 rounded-lg border-none bg-background-light dark:bg-[#2a303c] text-sm focus:ring-2 focus:ring-primary/50" placeholder="Pesquisar..." type="text" />
                        </div>
                        <div className="size-10 rounded-full bg-cover bg-center border border-[#dbdfe6] dark:border-gray-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCoJFrpK4zA2ZVLujU-5BOUV7-7xgotJqGRZIdfyNWWexkmw_zjsvdJZVk5rL28v11HuvI4ujBDqdvfZQsSTVPIJLnKnL6BzEMS9vYLuJLenruPq54aOGcGx1qWxqVVRNgvpy_R04hPrm7JZHw47qBstC7uBuvt6zTjevcmFm3fbfLTJo1SFwScRsFBsbMOUxJZBvoedscThFJ2mTHQPDtvNH5Vq216wwFk8KRGCpZm0a-ctCJWB1zd7QZ3AX-UgxhCYnQ5XyBSL08")' }}></div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 w-full flex-1 overflow-y-auto">
                <nav className="flex items-center gap-2 mb-4 text-sm font-medium">
                    <span onClick={() => navigate('/dashboard')} className="text-[#616f89] hover:text-primary transition-colors cursor-pointer">Vagas</span>
                    <span className="material-symbols-outlined text-sm text-[#616f89]">chevron_right</span>
                    <span className="text-[#111318] dark:text-gray-200">{job.title}</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-[#111318] dark:text-white">{job.title}</h1>
                        <p className="text-[#616f89] dark:text-gray-400 text-lg">Pipeline Interno da Vaga</p>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-4 h-11 border border-[#dbdfe6] dark:border-[#2a303c] rounded-lg text-sm font-bold transition-all shadow-sm ${filterStatus ? 'bg-primary/10 text-primary border-primary' : 'bg-white dark:bg-[#1a212d] hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111318] dark:text-white'}`}
                            >
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                {filterStatus ? `Status: ${filterStatus}` : 'Filtrar'}
                            </button>

                            {showFilterMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#2a303c] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                                        <div className="p-2">
                                            <button onClick={() => { setFilterStatus(null); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111318] dark:text-white">Todos</button>
                                            <button onClick={() => { setFilterStatus('Triagem'); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111318] dark:text-white">Triagem</button>
                                            <button onClick={() => { setFilterStatus('Entrevista'); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111318] dark:text-white">Entrevista</button>
                                            <button onClick={() => { setFilterStatus('Aprovado'); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111318] dark:text-white">Aprovado</button>
                                            <button onClick={() => { setFilterStatus('Rejeitado'); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-[#111318] dark:text-white">Rejeitado</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Trash Button */}
                        <button
                            onClick={() => setShowTrashModal(true)}
                            className="flex items-center gap-2 px-4 h-11 bg-white dark:bg-[#1a212d] border border-[#dbdfe6] dark:border-[#2a303c] rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Lixeira ({trashedCandidates.length})
                        </button>

                        {/* Admin Controls */}
                        {currentUser.role === 'Admin' && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={openEditJobModal}
                                    className="flex items-center gap-2 px-4 h-11 bg-white dark:bg-[#1a212d] border border-[#dbdfe6] dark:border-[#2a303c] rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Editar Vaga
                                </button>
                                <button
                                    onClick={handleTrashJob}
                                    className="flex items-center gap-2 px-4 h-11 bg-white dark:bg-[#1a212d] border border-red-100 dark:border-red-900/30 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Excluir Vaga
                                </button>
                            </div>
                        )}

                        {/* Add Candidate Button */}
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-6 h-11 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            Adicionar Candidato
                        </button>
                    </div>
                </div>

                {/* Job Info Card */}
                <div className="bg-white dark:bg-[#1a212d] rounded-xl border border-[#dbdfe6] dark:border-[#2a303c] shadow-sm mb-8 overflow-hidden">
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#dbdfe6] dark:divide-[#2a303c]">
                        <div className="flex flex-col gap-1 pb-4 md:pb-0 md:pr-6">
                            <p className="text-[#616f89] text-[10px] font-bold uppercase tracking-wider">Cliente</p>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">corporate_fare</span>
                                <p className="text-sm font-semibold text-[#111318] dark:text-white">{job.company}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 py-4 md:py-0 md:px-6">
                            <p className="text-[#616f89] text-[10px] font-bold uppercase tracking-wider">Prazo de Encerramento</p>
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <span className="material-symbols-outlined text-xl">calendar_today</span>
                                <p className="text-sm font-semibold">{formatDate(job.deadline)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pt-4 md:pt-0 md:pl-6">
                            <p className="text-[#616f89] text-[10px] font-bold uppercase tracking-wider">Requisitos</p>
                            <div className="flex flex-wrap gap-1.5">
                                {job.requirements && job.requirements.length > 0 ? (
                                    job.requirements.map((req, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-background-light dark:bg-[#2a303c] text-[#111318] dark:text-white rounded text-[10px] font-medium">{req}</span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400">Nenhum requisito listado.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columns */}
                <div
                    ref={boardRef}
                    onPointerDown={handleBoardPointerDown}
                    onPointerMove={handleBoardPointerMove}
                    onPointerUp={handleBoardPointerUp}
                    onPointerCancel={stopDragging}
                    onWheel={handleWheel}
                    className={`w-full overflow-x-scroll pb-6 custom-scrollbar touch-pan-x touch-pan-y ${isDragScroll && dragDistance > 10 ? 'cursor-grabbing select-none' : 'cursor-default'}`}
                    style={{ scrollBehavior: isDragScroll ? 'auto' : 'smooth', minHeight: 'min-content' }}
                >
                    <div className="flex gap-4 min-w-full px-1">
                        {columns.map((col, idx) => (
                            <div
                                key={col.id}
                                draggable={currentUser.role === 'Admin'}
                                onDragStart={(e) => handleColumnDragStart(e, idx)}
                                onDragOver={(e) => {
                                    if (currentUser.role === 'Admin') e.preventDefault();
                                    handleDragOver(e);
                                }}
                                onDrop={(e) => {
                                    if (currentUser.role === 'Admin' && e.dataTransfer.getData('column-index') !== '') {
                                        handleColumnDrop(e, idx);
                                    } else {
                                        handleDrop(e, col.id);
                                    }
                                }}
                                className={`flex flex-col gap-4 min-w-[320px] w-[320px] flex-shrink-0 bg-[#f1f3f7] dark:bg-[#151a24] rounded-xl p-3 transition-all duration-200 ${draggedColumnIndex === idx ? 'opacity-30' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2 px-1 relative">
                                    <div className="flex-1 mr-2">
                                        {editingColumnId === col.id ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempTitle}
                                                onChange={(e) => setTempTitle(e.target.value)}
                                                onBlur={saveTitle}
                                                onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                                                className="w-full bg-white dark:bg-[#2a303c] border border-primary rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider outline-none text-[#111318] dark:text-white"
                                            />
                                        ) : (
                                            <h3 className={`text-xs font-bold text-[#616f89] uppercase tracking-wider ${currentUser.role === 'Admin' ? 'cursor-grab active:cursor-grabbing' : ''}`}>{col.title}</h3>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#dbdfe6] dark:bg-[#2a303c] text-[#111318] dark:text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{updateCandidateCount(col.id)}</span>
                                        {currentUser.role === 'Admin' && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === col.id ? null : col.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                >
                                                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                                                </button>

                                                {/* Menu */}
                                                {activeMenu === col.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                                        <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#2a303c] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-40 overflow-hidden">
                                                            <button
                                                                onClick={() => startEditing(col)}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                                Renomear
                                                            </button>
                                                            <button
                                                                onClick={() => deleteColumn(col.id)}
                                                                className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                                Excluir Etapa
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Empty State */}
                                {updateCandidateCount(col.id) === 0 && (
                                    <div className="border-2 border-dashed border-[#dbdfe6] dark:border-[#2a303c] rounded-lg h-32 flex items-center justify-center pointer-events-none">
                                        <p className="text-[10px] text-[#616f89] font-medium">Nenhum candidato</p>
                                    </div>
                                )}

                                {/* Cards */}
                                {filteredCandidates.filter(c => c.stage === col.id).map(candidate => (
                                    <div
                                        key={candidate.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, candidate.id)}
                                        className={`bg-white dark:bg-[#1a212d] p-4 rounded-lg shadow-sm border border-[#dbdfe6] dark:border-[#2a303c] hover:shadow-md transition-all cursor-pointer group ${candidate.status === 'Rejeitado' ? 'border-l-4 border-l-red-500' : ''} ${draggedCandidateId === candidate.id ? 'opacity-50 scale-95' : ''}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${candidate.avatarColor}`}>
                                                {candidate.initials}
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-sm text-[#111318] dark:text-white">{candidate.name}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(candidate); }} className="text-gray-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded w-fit ${candidate.badgeColor} ${candidate.textColor}`}>{candidate.badgeText}</span>
                                                    {candidate.seniority && <span className="px-2 py-0.5 text-[10px] font-bold rounded w-fit bg-slate-100 dark:bg-slate-800 text-slate-500">{candidate.seniority}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 mb-4 border-t border-[#dbdfe6] dark:border-[#2a303c] pt-3">
                                            <a href={`https://wa.me/${candidate.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#25D366] hover:underline decoration-1 cursor-grab">
                                                <span className="material-symbols-outlined text-lg">chat</span>
                                                <span className="text-[11px] font-bold">{candidate.phone}</span>
                                            </a>
                                            <span className="text-[10px] text-[#616f89] dark:text-gray-400 pl-6">{candidate.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex gap-1.5 w-full">
                                                <button onClick={() => openPreviewModal(candidate)} className="flex-1 h-7 rounded-lg bg-background-light dark:bg-[#2a303c] flex items-center justify-center text-[#616f89] hover:text-primary transition-colors" title="Visualizar CV">
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                                <button onClick={() => handleDownloadResume(candidate)} className="flex-1 h-7 rounded-lg bg-background-light dark:bg-[#2a303c] flex items-center justify-center text-[#616f89] hover:text-primary transition-colors" title="Download CV">
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                </button>
                                                <button onClick={() => trashCandidate(candidate.id)} className="flex-1 h-7 rounded-lg bg-background-light dark:bg-[#2a303c] flex items-center justify-center text-[#616f89] hover:text-red-500 transition-colors" title="Mover para Lixeira">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                                <button onClick={() => openNotesModal(candidate)} className="flex-1 h-7 rounded-lg bg-background-light dark:bg-[#2a303c] flex items-center justify-center text-[#616f89] hover:text-primary transition-colors relative" title="Observações">
                                                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                                    {candidate.notes && candidate.notes.length > 0 && (
                                                        <span className="absolute top-0 right-1 bg-red-500 rounded-full size-2 border border-white dark:border-[#1a212d]"></span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {currentUser.role === 'Admin' && (
                            <button
                                onClick={addColumn}
                                className="min-w-[320px] w-[320px] h-32 flex-shrink-0 border-2 border-dashed border-[#dbdfe6] dark:border-[#2a303c] rounded-xl flex flex-col items-center justify-center text-[#616f89] hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-2"
                            >
                                <span className="material-symbols-outlined text-3xl">add_circle</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Adicionar Etapa</span>
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Add / Edit Candidate Modal */}
            {
                showCandidateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-[#1a212d] p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-[#111318] dark:text-white">{isEditing ? 'Editar Candidato' : 'Adicionar Candidato'}</h3>
                                <button onClick={() => setShowCandidateModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleCandidateSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome Completo</span>
                                        <input
                                            required
                                            type="text"
                                            className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                            value={candidateForm.name}
                                            onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-sm font-bold text-[#111318] dark:text-gray-200">E-mail</span>
                                        <input
                                            required
                                            type="email"
                                            className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                            value={candidateForm.email}
                                            onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Telefone / WhatsApp</span>
                                    <input
                                        required
                                        type="tel"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        placeholder="+55 11 99999-9999"
                                        value={candidateForm.phone}
                                        onChange={e => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                                    />
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Cargo Atual</span>
                                        <input
                                            type="text"
                                            className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                            placeholder="Ex: Dev Frontend"
                                            value={candidateForm.currentRole}
                                            onChange={e => setCandidateForm({ ...candidateForm, currentRole: e.target.value })}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Senioridade</span>
                                        <select
                                            className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                            value={candidateForm.seniority}
                                            onChange={e => setCandidateForm({ ...candidateForm, seniority: e.target.value as any })}
                                        >
                                            <option value="Estagiário">Estagiário</option>
                                            <option value="Júnior">Júnior</option>
                                            <option value="Pleno">Pleno</option>
                                            <option value="Sênior">Sênior</option>
                                            <option value="Especialista">Especialista</option>
                                            <option value="Gerente">Gerente</option>
                                        </select>
                                    </label>
                                </div>

                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Localização</span>
                                    <input
                                        type="text"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        placeholder="Ex: São Paulo, SP"
                                        value={candidateForm.location}
                                        onChange={e => setCandidateForm({ ...candidateForm, location: e.target.value })}
                                    />
                                </label>

                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Skills / Tags (Separadas por vírgula)</span>
                                    <input
                                        type="text"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        placeholder="Ex: React, Node.js, Inglês Avançado"
                                        value={candidateForm.skills}
                                        onChange={e => setCandidateForm({ ...candidateForm, skills: e.target.value })}
                                    />
                                </label>

                                <div className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Currículo (PDF/DOCX)</span>
                                    <div className="flex items-center gap-3">
                                        <label className="flex-1 cursor-pointer">
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400 text-2xl mb-1">cloud_upload</span>
                                                <p className="text-xs text-gray-500">Clique para fazer upload</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                        {candidateForm.resumeName && (
                                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-2 rounded-lg text-xs font-bold max-w-[50%] truncate">
                                                <span className="material-symbols-outlined text-base">description</span>
                                                <span className="truncate">{candidateForm.resumeName}</span>
                                            </div>
                                        )}
                                        {isUploading && <span className="text-xs text-gray-500 animate-pulse">Enviando...</span>}
                                    </div>
                                </div>

                                {!isEditing && (
                                    <label className="flex flex-col gap-1.5">
                                        <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Observação Inicial (Opcional)</span>
                                        <textarea
                                            className="form-textarea rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 min-h-[80px] dark:text-white"
                                            placeholder="Adicione uma nota inicial..."
                                            value={newNoteContent}
                                            onChange={e => setNewNoteContent(e.target.value)}
                                        />
                                    </label>
                                )}

                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setShowCandidateModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancelar</button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className={`px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isUploading ? 'Enviando...' : 'Salvar Candidato'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Resume Preview Modal */}
            {
                showPreviewModal && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-[#1a212d] w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a212d]">
                                <h3 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    {selectedCandidate.resumeName || "Currículo"}
                                </h3>
                                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
                                {isGeneratingUrl ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                        <p className="text-gray-500">Carregando documento...</p>
                                    </div>
                                ) : signedResumeUrl ? (
                                    selectedCandidate.resumeName?.toLowerCase().endsWith('.pdf') ? (
                                        <iframe
                                            src={signedResumeUrl}
                                            className="w-full h-full"
                                            title="Resume Preview"
                                        ></iframe>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">draft</span>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-2">Visualização não disponível para este formato</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Por favor, faça o download do arquivo para visualizar seu conteúdo.</p>
                                            <button onClick={() => handleDownloadResume(selectedCandidate)} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2">
                                                <span className="material-symbols-outlined">download</span>
                                                Baixar Arquivo
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">folder_off</span>
                                        <p className="text-gray-500">Nenhum currículo anexado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notes Modal (Timeline Style) */}
            {
                showNotesModal && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-[#1a212d] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">history_edu</span>
                                    Histórico de Observações
                                </h3>
                                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Timeline List */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black/20" ref={notesContainerRef}>
                                {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {selectedCandidate.notes.map((note) => (
                                            <div key={note.id} className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    {note.authorAvatar?.startsWith('http') ? (
                                                        <img src={note.authorAvatar} alt={note.authorName} className="size-8 rounded-full object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{note.authorAvatar || note.authorName.charAt(0)}</div>
                                                    )}
                                                </div>
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-[#111318] dark:text-white">{note.authorName}</span>
                                                            <span className="text-[10px] text-gray-400">{formatDateTime(note.createdAt)}</span>
                                                        </div>
                                                        {note.authorId === currentUser.id && (
                                                            <div className="flex items-center gap-2">
                                                                <button onClick={() => handleEditNote(note)} className="text-gray-400 hover:text-primary transition-colors">
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                </button>
                                                                <button onClick={() => handleDeleteNote(note.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {editingNoteId === note.id ? (
                                                        <div className="mt-2">
                                                            <textarea
                                                                className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-2 min-h-[60px] mb-2 focus:ring-primary focus:border-primary resize-none dark:text-white"
                                                                value={editingNoteContent}
                                                                onChange={e => setEditingNoteContent(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setEditingNoteId(null)} className="text-xs font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
                                                                <button onClick={handleSaveEditedNote} className="text-xs font-bold text-primary hover:text-primary/80">Salvar</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble_outline</span>
                                        <p className="text-sm">Nenhuma observação registrada.</p>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a212d] rounded-b-xl">
                                <textarea
                                    className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 min-h-[80px] mb-3 focus:ring-primary focus:border-primary resize-none dark:text-white"
                                    placeholder="Digite uma nova observação..."
                                    value={newNoteContent}
                                    onChange={e => setNewNoteContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!newNoteContent.trim()}
                                        className="px-4 py-2 bg-primary disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Adicionar Nota
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Edit Job Modal (Admin Only) */}
            {showEditJobModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl my-auto border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h3 className="text-xl font-bold text-[#111318] dark:text-white">Editar Detalhes da Vaga</h3>
                                <p className="text-xs text-gray-500 mt-1">Altere as informações globais da oportunidade.</p>
                            </div>
                            <button onClick={() => setShowEditJobModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 dark:bg-gray-800 p-2 rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleJobEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Título da Vaga</span>
                                    <input
                                        type="text"
                                        className="form-input rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.title}
                                        onChange={e => setJobEditForm({ ...jobEditForm, title: e.target.value })}
                                        required
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Empresa / Cliente</span>
                                    <select
                                        className="form-select rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.company}
                                        onChange={e => setJobEditForm({ ...jobEditForm, company: e.target.value })}
                                        required
                                    >
                                        {clients.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Prazo de Encerramento (Deadline)</span>
                                    <input
                                        type="date"
                                        className="form-input rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.deadline}
                                        onChange={e => setJobEditForm({ ...jobEditForm, deadline: e.target.value })}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Prioridade</span>
                                    <select
                                        className="form-select rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.priority}
                                        onChange={e => setJobEditForm({ ...jobEditForm, priority: e.target.value as Job['priority'] })}
                                    >
                                        <option value="Baixa Prioridade">Baixa</option>
                                        <option value="Alta Prioridade">Média/Alta</option>
                                        <option value="Crítico">Crítico</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Salário Mínimo</span>
                                    <input
                                        type="number"
                                        className="form-input rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.salaryMin}
                                        onChange={e => setJobEditForm({ ...jobEditForm, salaryMin: Number(e.target.value) })}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Salário Máximo</span>
                                    <input
                                        type="number"
                                        className="form-input rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                        value={jobEditForm.salaryMax}
                                        onChange={e => setJobEditForm({ ...jobEditForm, salaryMax: Number(e.target.value) })}
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Requisitos (Tags, separadas por vírgula)</span>
                                <input
                                    type="text"
                                    className="form-input rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white h-11 px-4 focus:ring-primary focus:border-primary transition-all text-sm"
                                    value={jobEditForm.requirements}
                                    onChange={e => setJobEditForm({ ...jobEditForm, requirements: e.target.value })}
                                />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Descrição Completa</span>
                                <textarea
                                    className="form-textarea rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white p-4 focus:ring-primary focus:border-primary transition-all text-sm min-h-[150px] resize-y"
                                    value={jobEditForm.description}
                                    onChange={e => setJobEditForm({ ...jobEditForm, description: e.target.value })}
                                />
                            </label>
                        </form>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-black/20 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setShowEditJobModal(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleJobEditSubmit}
                                disabled={isSavingJob}
                                className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isSavingJob ? (
                                    <span className="animate-spin size-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">save</span>
                                )}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {
                showToast && (
                    <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-[#111318] dark:bg-primary text-white px-6 py-3 rounded-xl shadow-2xl z-[100] transform transition-all animate-bounce">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <span className="text-sm font-semibold">Candidato movido de etapa com sucesso</span>
                    </div>
                )
            }
        </div >
    );
};