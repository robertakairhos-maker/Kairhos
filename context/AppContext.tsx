import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Job, User, Notification, Candidate, Note, Client } from '../types';
import { supabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';

// Helper to get admin client only when needed
const getSupabaseAdmin = () => {
    // Use a more robust check for environments where import.meta.env might be problematic for types
    const env = (import.meta as any).env || {};
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

interface AppContextType {
    jobs: Job[];
    users: User[];
    candidates: Candidate[];
    clients: Client[];
    notifications: Notification[];
    currentUser: User;
    isAuthenticated: boolean;
    loading: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    logout: () => Promise<void>;
    addJob: (jobData: Omit<Job, 'id'>) => Promise<string | null>;
    updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
    updateJobStage: (jobId: string, newStage: Job['stage']) => Promise<void>;
    trashJob: (jobId: string) => Promise<void>;
    restoreJob: (jobId: string) => Promise<void>;
    deleteJobPermanently: (jobId: string) => Promise<void>;
    addCandidate: (candidate: Omit<Candidate, 'id' | 'initials' | 'avatarColor' | 'textColor' | 'badgeColor' | 'badgeText' | 'notes'> & { notes?: Note[] }) => void;
    updateCandidateStage: (candidateId: string, newStage: Candidate['stage']) => void;
    updateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
    trashCandidate: (candidateId: string) => void;
    restoreCandidate: (candidateId: string) => void;
    deleteCandidatePermanently: (candidateId: string) => void;
    // User Management
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (userId: string, updates: Partial<User>) => void;
    deleteUser: (userId: string) => void;
    // Client Management
    addClient: (client: Omit<Client, 'id'>) => void;
    updateClient: (clientId: string, updates: Partial<Client>) => void;
    // Notification
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_USER: User = {
    id: 'guest',
    name: 'Convidado',
    email: '',
    role: 'Junior Recruiter',
    status: 'Ativo',
    avatar: ''
};

// Initial Mock Data
const INITIAL_USERS: User[] = [
    {
        id: 'u1',
        name: 'Ana Silva',
        email: 'ana.silva@agency.com',
        role: 'Senior Recruiter',
        status: 'Ativo',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUjudNv8TgTSOhkzl9_1YNQLV2EuKatNDE1MCYTbSxrEMjyb5XNKoukExLUIWuy7mkJ9nFbN8IJcpL9ZhrvBgzaMxE_e3qaRSuLzv_0wMuIRqS01uZWkqF3iZzowsZwd9XTTypZ0lPPJPFPrDqZextg-541zgx0S-oqMRwDD90EtHIEdiiGbAolW8lvtbOcxeLuMMulgJt9G-PsUR2LJIJJw44xLJFmljWY0FfLiwWVf4wH8OycgTwWXEtLS3RBJEN_ykFM65YwqY',
        bio: 'Especialista em recrutamento Tech com 5 anos de experiência.',
        preferences: { notifications: true, newsletter: false }
    },
    { id: 'u2', name: 'Lucas Santos', email: 'lucas.s@agency.com', role: 'Senior Recruiter', status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdvMItBqd86zWcHTVJequBeEdXDC5VZKkwhiqjsNSMJN-noPmhl87597Uac_ER4-y1XdC5KQn2wpo3bEVaKM0WIEYE9OZpUsYGQq4uqlZ2YJ6A-vLuj0XTtwVFfFyo7MlWrMi5ZqU5cX4KNJtRKG2fPOZeTxN-noPmhl87597Uac_ER4-y1XdC5KQn2wpo3bEVaKM0WIEYE9OZpUsYGQq4uqlZ2YJ6A-vLuj0XTtwVFfFyo7MlWrMi5ZqU5cX4KNJtRKG2fPOZeTxN-n_3PXKuaNGY1SOLey7XEAauOfWJNIgqo9zI9AAR9Tf_lThpFh2bSE2eEQKKRRWIFR8YAbkGC2fQ4RSBbfDbDLwLXFf5JFxQVZAe0ww4HxJgPO18' },
    { id: 'u3', name: 'Maria Costa', email: 'maria.c@agency.com', role: 'Admin', status: 'Ativo', avatar: 'MC' },
    { id: 'u4', name: 'Ricardo Alves', email: 'ricardo.a@agency.com', role: 'Junior Recruiter', status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU1Z_ryp9S4BGUiwF2osKUHwrQqwaqfq0dEgskRQi1p4CHUvBecIiu9X5qR4EtbSl2TSDEyKM9VsGlRyzQ80NoNfUogNy8Y82M8-AeoDIXx7qlbvE1NFlpi37-qY0lnSSrXr_2_V0C6MnAnMTOXlp1KfHngB6XFpJiEVtp5m9r8GGrdkLKlUSlR2i3dXA3Fhm3uzmgG_xt1IxYt6S4IU6Pp8qhQxxxYQJTz_Ya1mjVLqS9p1Fo5Tcfsd-nI0DZMK_r43CPtj5DVrM' }
];

const INITIAL_JOBS: Job[] = [
    {
        id: '1',
        title: 'Desenvolvedor Fullstack Senior',
        company: 'Nubank Brasil',
        stage: 'Vagas Abertas',
        tag: { label: 'TECH', color: 'bg-blue-50 dark:bg-blue-900/30 text-primary' },
        progress: 25,
        daysRemaining: 4,
        recruiter: { id: 'u1', name: 'Ana Silva', avatar: INITIAL_USERS[0].avatar },
        candidatesCount: 2,
        statusIcon: 'schedule',
        requirements: ['React', 'Node.js', 'AWS', 'TypeScript']
    },
    {
        id: '2',
        title: 'Product Manager (Growth)',
        company: 'Hotmart',
        stage: 'Vagas Abertas',
        tag: { label: 'PRODUTO', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' },
        progress: 15,
        daysRemaining: 12,
        recruiter: { id: 'u2', name: 'Lucas Santos', avatar: INITIAL_USERS[1].avatar },
        requirements: ['Product Strategy', 'Analytics', 'A/B Testing']
    },
    {
        id: '3',
        title: 'Executivo de Contas Mid-Market',
        company: 'Salesforce',
        stage: 'Em Triagem',
        tag: { label: 'SALES', color: 'bg-green-50 dark:bg-green-900/30 text-green-600' },
        progress: 40,
        priority: 'Alta Prioridade',
        recruiter: { id: 'u3', name: 'Maria Costa', avatar: 'MC' },
        requirements: ['B2B Sales', 'CRM', 'Negotiation']
    }
];

const INITIAL_CLIENTS: Client[] = [
    {
        id: '1',
        name: 'Nubank Brasil',
        industry: 'Fintech',
        contactName: 'Fernanda Lima',
        contactEmail: 'fernanda.lima@nubank.com.br',
        phone: '(11) 99999-9999',
        status: 'Ativo',
        contractValue: 'R$ 25.000/mês',
        logo: 'N'
    },
    {
        id: '2',
        name: 'Hotmart',
        industry: 'Tecnologia / Educação',
        contactName: 'Roberto Almeida',
        contactEmail: 'roberto@hotmart.com',
        phone: '(31) 98888-8888',
        status: 'Ativo',
        contractValue: 'R$ 15.000/mês',
        logo: 'H'
    },
    {
        id: '3',
        name: 'Salesforce',
        industry: 'SaaS / CRM',
        contactName: 'Juliana Costa',
        contactEmail: 'jcosta@salesforce.com',
        phone: '(11) 97777-7777',
        status: 'Negociação',
        contractValue: 'R$ 40.000/projeto',
        logo: 'S'
    }
];

const INITIAL_CANDIDATES: Candidate[] = [
    {
        id: '1', jobId: '1', initials: 'DO', name: 'David Oliveira', email: 'david.oliveira@email.com', phone: '+55 11 98765-4321',
        status: 'Triagem', stage: 'Triagem', avatarColor: 'bg-emerald-100 text-emerald-600', textColor: 'text-gray-700 dark:text-gray-300', badgeColor: 'bg-gray-100 dark:bg-gray-700/50', badgeText: 'Triagem',
        resumeName: 'CV_David_Oliveira.pdf', resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        source: 'LinkedIn',
        location: 'São Paulo, SP',
        currentRole: 'Software Engineer',
        seniority: 'Sênior',
        notes: [
            { id: 'n1', content: 'Candidato com forte experiência em React.', authorId: 'u1', authorName: 'Ana Silva', authorAvatar: INITIAL_USERS[0].avatar, createdAt: '2023-10-24T10:00:00' }
        ]
    },
    {
        id: '2', jobId: '1', initials: 'BC', name: 'Bruno Costa', email: 'bruno.costa@tech.com', phone: '+55 11 99988-7766',
        status: 'Entrevista', stage: 'Primeira entrevista', avatarColor: 'bg-orange-100 text-orange-600', textColor: 'text-primary dark:text-blue-400', badgeColor: 'bg-primary/10 dark:bg-primary/20', badgeText: 'Entrevista',
        resumeName: 'Bruno_Costa_Resume.pdf', resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        skills: ['JavaScript', 'Vue.js', 'PHP', 'Laravel'],
        source: 'Indicação',
        location: 'Curitiba, PR',
        currentRole: 'Backend Developer',
        seniority: 'Pleno',
        notes: [
            { id: 'n2', content: 'Agendado entrevista técnica para terça-feira.', authorId: 'u1', authorName: 'Ana Silva', authorAvatar: INITIAL_USERS[0].avatar, createdAt: '2023-10-25T14:30:00' }
        ]
    },
    {
        id: '3', jobId: '2', initials: 'AS', name: 'Ana Silva', email: 'ana.silva@marketing.pro', phone: '+55 11 91234-5678',
        status: 'Aprovado', stage: 'Aprovado', avatarColor: 'bg-blue-100 text-primary', textColor: 'text-green-700 dark:text-green-400', badgeColor: 'bg-green-100 dark:bg-green-900/30', badgeText: 'Aprovado',
        resumeName: 'Portfolio_Ana.pdf', resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        skills: ['Product Management', 'Growth', 'Data Analytics', 'SQL'],
        source: 'Site da Empresa',
        location: 'Belo Horizonte, MG',
        currentRole: 'Product Owner',
        seniority: 'Especialista',
        notes: [
            { id: 'n3', content: 'Aprovada pelo gestor. Aguardando proposta.', authorId: 'u2', authorName: 'Lucas Santos', authorAvatar: INITIAL_USERS[1].avatar, createdAt: '2023-10-26T09:15:00' }
        ]
    },
    {
        id: '4', jobId: '3', initials: 'FM', name: 'Melo Felipe', email: 'felipe.melo@sales.com', phone: '+55 11 95555-4444',
        status: 'Triagem', stage: 'Triagem', avatarColor: 'bg-purple-100 text-purple-600', textColor: 'text-gray-700 dark:text-gray-300', badgeColor: 'bg-gray-100 dark:bg-gray-700/50', badgeText: 'Triagem',
        skills: ['Vendas B2B', 'CRM Salesforce', 'Negociação', 'Inglês Avançado'],
        source: 'LinkedIn',
        location: 'Rio de Janeiro, RJ',
        currentRole: 'Sales Executive',
        seniority: 'Sênior',
        notes: []
    }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const authRef = useRef(false);
    const currentUserRef = useRef<User>(GUEST_USER);
    const lastAuthCallRef = useRef<number>(0);

    // Sync refs with state
    useEffect(() => {
        authRef.current = isAuthenticated;
        currentUserRef.current = currentUser;
    }, [isAuthenticated, currentUser]);
    const [loading, setLoading] = useState(true);

    // Theme Management
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as 'light' | 'dark') || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const [jobs, setJobs] = useState<Job[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Handle Authentication & Identity
    useEffect(() => {
        let mounted = true;

        const resolveIdentity = async (session: any, source: string, attempt = 1) => {
            const currentCallId = Date.now();
            lastAuthCallRef.current = currentCallId;

            console.log(`[Auth] Resolving identity from ${source} (Attempt ${attempt}). User: ${session?.user?.email || 'None'}`);

            if (!session?.user) {
                if (mounted && lastAuthCallRef.current === currentCallId) {
                    console.log('[Auth] No session user, setting guest state.');
                    setCurrentUser(GUEST_USER);
                    setIsAuthenticated(false);
                    setLoading(false);
                }
                return;
            }

            try {
                // Se já estamos autenticados com o usuário correto e perfil carregado, pular fetch
                if (authRef.current && currentUserRef.current.id === session.user.id && currentUserRef.current.email !== '' && source !== 'syncUser') {
                    console.log('[Auth] Already authenticated as current user, skipping profile fetch.');
                    if (mounted && lastAuthCallRef.current === currentCallId) setLoading(false);
                    return;
                }

                console.log(`[Auth] Fetching profile for ${session.user.id}...`);
                const { data: profile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (!mounted || lastAuthCallRef.current !== currentCallId) return;

                if (fetchError) {
                    const isNotFoundError = fetchError.code === 'PGRST116';

                    if (isNotFoundError) {
                        console.warn('[Auth] Profile missing in DB. Attempting lazy creation...');

                        const newProfile = {
                            id: session.user.id,
                            name: session.user.user_metadata?.name || 'Novo Recrutador',
                            email: session.user.email || '',
                            user_role: (session.user.user_metadata?.role as User['role']) || 'Junior Recruiter',
                            status: 'Ativo' as User['status'],
                            preferences: { notifications: true }
                        };

                        const { data: createdProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert(newProfile)
                            .select()
                            .single();

                        if (insertError) {
                            console.error('[Auth] Lazy creation failed:', insertError);
                            if (insertError.code === '23505') {
                                console.log('[Auth] Profile already exists (race), retrying fetch...');
                                await new Promise(r => setTimeout(r, 500));
                                return resolveIdentity(session, 'retryrace', attempt + 1);
                            }

                            // Se falhou criar perfil, tenta limpar sessão e deslogar para evitar loop
                            console.error('[Auth] Could not load or create profile. Clearing session.');
                            if (mounted && lastAuthCallRef.current === currentCallId) {
                                await supabase.auth.signOut();
                                setCurrentUser(GUEST_USER);
                                setIsAuthenticated(false);
                            }
                        } else if (createdProfile) {
                            console.log('[Auth] Profile created successfully.');
                            setCurrentUser({
                                id: createdProfile.id,
                                name: createdProfile.name,
                                email: createdProfile.email,
                                role: createdProfile.user_role as User['role'],
                                status: createdProfile.status as User['status'],
                                avatar: createdProfile.avatar_url,
                                bio: createdProfile.bio,
                                preferences: createdProfile.preferences
                            });
                            setIsAuthenticated(true);
                        }
                    } else {
                        console.error(`[Auth] Persistent fetch error (Attempt ${attempt}):`, fetchError);

                        // Retry on transient network errors (up to 3 times)
                        if (attempt < 3) {
                            console.log(`[Auth] Retrying profile fetch in 1s...`);
                            await new Promise(r => setTimeout(r, 1000));
                            return resolveIdentity(session, 'retryerror', attempt + 1);
                        }

                        // Se falhou após tentativas, deslogar usuário para não ficar preso
                        console.error('[Auth] Failed to load profile after retries. Enforcing logout.');
                        if (mounted && lastAuthCallRef.current === currentCallId) {
                            await supabase.auth.signOut();
                            setCurrentUser(GUEST_USER);
                            setIsAuthenticated(false);
                        }
                    }
                } else if (profile) {
                    console.log('[Auth] Profile found, updating state.');
                    setCurrentUser({
                        id: profile.id,
                        name: profile.name,
                        email: profile.email,
                        role: profile.user_role as User['role'],
                        status: profile.status as User['status'],
                        avatar: profile.avatar_url,
                        bio: profile.bio,
                        preferences: profile.preferences
                    });
                    setIsAuthenticated(true);
                }
            } catch (err: any) {
                console.error('[Auth] Identity resolution exception:', err);
                if (err.name === 'AbortError') return;

                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 1000));
                    return resolveIdentity(session, 'retryexception', attempt + 1);
                }

                if (mounted && lastAuthCallRef.current === currentCallId) {
                    setLoading(false);
                }
            } finally {
                if (mounted && lastAuthCallRef.current === currentCallId) {
                    setLoading(false);
                }
            }
        };

        const syncUser = async () => {
            console.log('[Auth] Running initial session sync...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                await resolveIdentity(session, 'syncUser');
            } catch (err) {
                console.error('[Auth] Initial sync error:', err);
                if (mounted) setLoading(false);
            }
        };

        syncUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] onAuthStateChange event: ${event}`);

            // Only block UI for explicitly signing in
            if (mounted && event === 'SIGNED_IN' && !authRef.current) {
                setLoading(true);
            }

            if (mounted && event === 'SIGNED_OUT') {
                setCurrentUser(GUEST_USER);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            await resolveIdentity(session, `onAuthStateChange(${event})`);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Watchdog for infinite loading
    useEffect(() => {
        if (loading) {
            const watchdog = setTimeout(() => {
                console.warn('Loading Watchdog: Force-clearing infinite splash.');
                setLoading(false);
            }, 7000);
            return () => clearTimeout(watchdog);
        }
    }, [loading]);

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setCurrentUser(GUEST_USER);
            setIsAuthenticated(false);
            // Clear any caches or data if needed
            setJobs([]);
            setCandidates([]);
            setNotifications([]);
            // Force a slight delay or redirect if state doesn't propagate
            window.location.hash = '#/login';
        } catch (err) {
            console.error('Logout error:', err);
            // Fallback: force redirect
            window.location.hash = '#/login';
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profiles
                const { data: profilesData } = await supabase.from('profiles').select('*');
                let mappedUsers: User[] = [];
                if (profilesData) {
                    mappedUsers = profilesData.map(p => ({
                        id: p.id,
                        name: p.name,
                        email: p.email,
                        role: p.user_role as User['role'],
                        status: p.status as User['status'],
                        avatar: p.avatar_url,
                        bio: p.bio,
                        preferences: p.preferences
                    }));
                    setUsers(mappedUsers);
                }

                // Fetch Clients
                const { data: clientsData } = await supabase.from('clients').select('*');
                if (clientsData) {
                    setClients(clientsData.map(c => ({
                        id: c.id,
                        name: c.name,
                        industry: c.industry,
                        contactName: c.contact_name,
                        contactEmail: c.contact_email,
                        phone: c.phone,
                        status: c.status as Client['status'],
                        contractValue: c.contract_value,
                        logo: c.logo_url
                    })));
                }

                // Fetch Jobs - Filtered by role
                let jobsQuery = supabase.from('jobs').select('*');

                // If not admin, only see assigned jobs
                if (currentUser && currentUser.role !== 'Admin') {
                    jobsQuery = jobsQuery.eq('recruiter_id', currentUser.id);
                }

                const { data: jobsData } = await jobsQuery;
                let mappedJobs: Job[] = [];
                if (jobsData) {
                    mappedJobs = jobsData.map(j => {
                        // Find recruiter details from users list
                        const recruiterInfo = mappedUsers.find(u => u.id === j.recruiter_id);
                        return {
                            id: j.id,
                            title: j.title,
                            company: j.company_name,
                            stage: j.job_stage as Job['stage'],
                            priority: j.priority as Job['priority'],
                            tag: j.tag_label ? { label: j.tag_label, color: j.tag_color } : undefined,
                            progress: j.progress,
                            daysRemaining: j.days_remaining,
                            recruiter: {
                                id: j.recruiter_id,
                                name: recruiterInfo?.name || 'Recrutador Externo',
                                avatar: recruiterInfo?.avatar || ''
                            },
                            salaryMin: j.salary_min,
                            salaryMax: j.salary_max,
                            description: j.description,
                            requirements: j.requirements,
                            deadline: j.deadline,
                            trashed: j.trashed || false
                        };
                    });
                    setJobs(mappedJobs);
                }

                // Fetch Candidates - All candidates are visible to everyone
                let candidatesQuery = supabase.from('candidates').select('*');

                const { data: candidatesData } = await candidatesQuery;
                if (candidatesData) {
                    setCandidates(candidatesData.map(c => ({
                        id: c.id,
                        jobId: c.job_id,
                        name: c.name,
                        email: c.email,
                        phone: c.phone,
                        status: c.candidate_status as Candidate['status'],
                        stage: c.candidate_stage as Candidate['stage'],
                        resumeUrl: c.resume_url,
                        resumeName: c.resume_name,
                        skills: c.skills,
                        source: c.source,
                        location: c.location,
                        currentRole: c.current_job_role,
                        seniority: c.seniority as Candidate['seniority'],
                        initials: c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                        avatarColor: 'bg-emerald-100 text-emerald-600', // Default
                        textColor: 'text-gray-700',
                        badgeColor: 'bg-gray-100',
                        badgeText: c.candidate_stage,
                        trashed: c.trashed || false,
                        notes: c.notes || []
                    })));
                }

                // Fetch Notifications
                if (currentUser && currentUser.id !== 'guest') {
                    const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', currentUser.id);
                    if (notifData) {
                        setNotifications(notifData.map(n => ({
                            id: n.id,
                            title: n.title,
                            message: n.message,
                            time: new Date(n.created_at).toLocaleTimeString(),
                            read: n.is_read,
                            type: n.notification_type as Notification['type']
                        })));
                    }
                }
            } catch (error) {
                console.error('Error fetching data from Supabase:', error);
            }
        };

        fetchData();
    }, [currentUser.id, currentUser.role]);

    const addNotification = async (title: string, message: string, type: 'success' | 'warning' | 'info' = 'info') => {
        if (currentUser.id === 'guest') return;
        const { data, error } = await supabase.from('notifications').insert({
            user_id: currentUser.id,
            title,
            message,
            notification_type: type,
            is_read: false
        }).select().single();

        if (data && !error) {
            const newNotification: Notification = {
                id: data.id,
                title: data.title,
                message: data.message,
                time: 'Agora',
                read: data.is_read,
                type: data.notification_type as Notification['type']
            };
            setNotifications(prev => [newNotification, ...prev]);
        }
    };

    const addJob = async (jobData: Omit<Job, 'id'>) => {
        try {
            const { data, error } = await supabase.from('jobs').insert({
                title: jobData.title,
                company_name: jobData.company,
                job_stage: 'Vagas Abertas',
                priority: jobData.priority,
                tag_label: jobData.tag?.label,
                tag_color: jobData.tag?.color,
                progress: 0,
                days_remaining: jobData.daysRemaining,
                recruiter_id: jobData.recruiter.id,
                salary_min: jobData.salaryMin,
                salary_max: jobData.salaryMax,
                description: jobData.description,
                requirements: jobData.requirements,
                deadline: jobData.deadline
            }).select().single();

            if (data && !error) {
                const newJob: Job = {
                    ...jobData,
                    id: data.id,
                    stage: 'Vagas Abertas',
                    progress: 0,
                    candidatesCount: 0,
                    trashed: false
                };
                setJobs(prev => [...prev, newJob]);

                if (newJob.recruiter.id === currentUser.id) {
                    addNotification('Nova Vaga Atribuída', `Você é o responsável pela vaga de ${newJob.title}.`, 'success');
                }
                return data.id;
            }
            if (error) throw error;
            return null;
        } catch (error: any) {
            console.error('Error adding job:', error);
            addNotification('Erro ao publicar vaga', error.message || 'Verifique sua conexão.', 'warning');
            return null;
        }
    };

    const updateJob = async (jobId: string, updates: Partial<Job>) => {
        try {
            const dbUpdates: any = {};
            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.company !== undefined) dbUpdates.company_name = updates.company;
            if (updates.stage !== undefined) dbUpdates.job_stage = updates.stage;
            if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
            if (updates.tag !== undefined) {
                dbUpdates.tag_label = updates.tag.label;
                dbUpdates.tag_color = updates.tag.color;
            }
            if (updates.salaryMin !== undefined) dbUpdates.salary_min = updates.salaryMin;
            if (updates.salaryMax !== undefined) dbUpdates.salary_max = updates.salaryMax;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.requirements !== undefined) dbUpdates.requirements = updates.requirements;
            if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;

            const { error } = await supabase.from('jobs').update(dbUpdates).eq('id', jobId);
            if (error) throw error;

            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...updates } : j));
            addNotification('Vaga Atualizada', 'As alterações foram salvas no banco de dados.', 'success');
        } catch (error: any) {
            console.error('Error updating job:', error);
            addNotification('Erro ao atualizar vaga', error.message, 'warning');
            throw error;
        }
    };

    const trashJob = async (jobId: string) => {
        try {
            const { error } = await supabase.from('jobs').update({ trashed: true }).eq('id', jobId);
            if (error) throw error;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, trashed: true } : j));
            addNotification('Vaga movida para a lixeira', '', 'info');
        } catch (error: any) {
            console.error('Error trashing job:', error);
            addNotification('Erro ao excluir vaga', error.message, 'warning');
        }
    };

    const restoreJob = async (jobId: string) => {
        try {
            const { error } = await supabase.from('jobs').update({ trashed: false }).eq('id', jobId);
            if (error) throw error;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, trashed: false } : j));
            addNotification('Vaga restaurada', '', 'success');
        } catch (error: any) {
            console.error('Error restoring job:', error);
            addNotification('Erro ao restaurar vaga', error.message, 'warning');
        }
    };

    const deleteJobPermanently = async (jobId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta vaga PERMANENTEMENTE? Todos os dados vinculados serão perdidos.')) return;
        try {
            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (error) throw error;
            setJobs(prev => prev.filter(j => j.id !== jobId));
            addNotification('Vaga excluída permanentemente', '', 'warning');
        } catch (error: any) {
            console.error('Error deleting job permanently:', error);
            addNotification('Erro ao remover vaga', 'Pode haver candidatos vinculados a esta vaga.', 'warning');
        }
    };

    const updateJobStage = async (jobId: string, newStage: Job['stage']) => {
        const { error } = await supabase.from('jobs').update({ job_stage: newStage }).eq('id', jobId);

        if (!error) {
            setJobs(prevJobs => {
                const job = prevJobs.find(j => j.id === jobId);
                if (job && job.stage !== newStage && job.recruiter.id === currentUser.id) {
                    addNotification(
                        'Atualização de Pipeline',
                        `A vaga ${job.title} moveu de "${job.stage}" para "${newStage}".`,
                        'info'
                    );
                }
                return prevJobs.map(j => j.id === jobId ? { ...j, stage: newStage } : j);
            });
        }
    };

    const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'initials' | 'avatarColor' | 'textColor' | 'badgeColor' | 'badgeText' | 'notes'> & { notes?: Note[] }) => {
        try {
            console.log('[Candidate] Adding new candidate:', candidateData);

            const insertData = {
                job_id: candidateData.jobId,
                name: candidateData.name,
                email: candidateData.email || '',
                phone: candidateData.phone || '',
                candidate_status: candidateData.status || 'Triagem',
                candidate_stage: candidateData.stage || 'Triagem',
                resume_url: candidateData.resumeUrl || null,
                resume_name: candidateData.resumeName || null,
                skills: candidateData.skills || [],
                source: candidateData.source || 'Manual',
                location: candidateData.location || '',
                current_job_role: candidateData.currentRole || '',
                seniority: candidateData.seniority || 'Pleno',
                trashed: false
                // notes removed - stored in separate candidate_notes table
            };

            console.log('[Candidate] Insert data:', insertData);

            const { data, error } = await supabase.from('candidates').insert(insertData).select().single();

            console.log('[Candidate] Supabase response - data:', data);
            console.log('[Candidate] Supabase response - error:', error);

            if (error) {
                console.error('[Candidate] Database error:', error);
                alert(`ERRO DO BANCO DE DADOS:\n\nMensagem: ${error.message}\nCódigo: ${error.code}\nDetalhes: ${error.details}\nHint: ${error.hint}`);
                throw error;
            }

            if (!data) {
                console.error('[Candidate] No data returned from insert!');
                alert('ERRO: Nenhum dado retornado do banco após inserção. Verifique as políticas RLS ou constraints da tabela.');
                throw new Error('No data returned from insert');
            }

            if (data) {
                console.log('[Candidate] Successfully inserted:', data);
                const initials = data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                // Helper for colors based on status (simplified)
                let colors = { avatarColor: 'bg-gray-100 text-gray-600', textColor: 'text-gray-700', badgeColor: 'bg-gray-100', badgeText: data.candidate_status };
                if (data.candidate_stage === 'Triagem') colors = { avatarColor: 'bg-emerald-100 text-emerald-600', textColor: 'text-gray-700 dark:text-gray-300', badgeColor: 'bg-gray-100 dark:bg-gray-700/50', badgeText: 'Triagem' };
                if (data.candidate_stage === 'Aprovado') colors = { avatarColor: 'bg-blue-100 text-primary', textColor: 'text-green-700 dark:text-green-400', badgeColor: 'bg-green-100 dark:bg-green-900/30', badgeText: 'Aprovado' };
                if (data.candidate_stage === 'Reprovado' || data.candidate_stage === 'Reprovado Gestor') colors = { avatarColor: 'bg-red-100 text-red-600', textColor: 'text-red-700', badgeColor: 'bg-red-100', badgeText: 'Reprovado' };

                const newCandidate: Candidate = {
                    jobId: data.job_id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    status: data.candidate_status as Candidate['status'],
                    stage: data.candidate_stage as Candidate['stage'],
                    resumeUrl: data.resume_url,
                    resumeName: data.resume_name,
                    skills: data.skills,
                    source: data.source,
                    location: data.location,
                    currentRole: data.current_job_role,
                    seniority: data.seniority as Candidate['seniority'],
                    id: data.id,
                    initials,
                    notes: data.notes || [],
                    trashed: data.trashed || false,
                    ...colors
                };

                console.log('[Candidate] Created candidate object:', newCandidate);

                setCandidates(prev => {
                    const updated = [...prev, newCandidate];
                    console.log('[Candidate] Previous candidates count:', prev.length);
                    console.log('[Candidate] Updated candidates count:', updated.length);
                    console.log('[Candidate] New candidate in array:', updated.find(c => c.id === newCandidate.id));
                    return updated;
                });

                // Update Job candidate count local
                setJobs(prev => prev.map(j => j.id === candidateData.jobId ? { ...j, candidatesCount: (j.candidatesCount || 0) + 1 } : j));
                addNotification('Candidato Adicionado', `${data.name} foi cadastrado com sucesso.`, 'success');
                return data.id;
            }
            return null;
        } catch (error: any) {
            console.error('[Candidate] Error adding candidate:', error);
            console.error('[Candidate] Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            addNotification('Erro ao salvar candidato', error.message || 'Verifique se a tabela "candidates" existe no Supabase.', 'warning');
            return null;
        }
    };

    const updateCandidateStage = async (candidateId: string, newStage: Candidate['stage']) => {
        try {
            const { error } = await supabase.from('candidates').update({ candidate_stage: newStage }).eq('id', candidateId);
            if (error) throw error;
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
        } catch (error: any) {
            console.error('[Candidate] Error updating stage:', error);
            addNotification('Erro ao mover candidato', error.message, 'warning');
        }
    };

    const updateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
        try {
            // Map updates to DB columns
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.status !== undefined) dbUpdates.candidate_status = updates.status;
            if (updates.stage !== undefined) dbUpdates.candidate_stage = updates.stage;
            if (updates.resumeUrl !== undefined) dbUpdates.resume_url = updates.resumeUrl;
            if (updates.resumeName !== undefined) dbUpdates.resume_name = updates.resumeName;
            if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
            if (updates.source !== undefined) dbUpdates.source = updates.source;
            if (updates.location !== undefined) dbUpdates.location = updates.location;
            if (updates.currentRole !== undefined) dbUpdates.current_job_role = updates.currentRole;
            if (updates.seniority !== undefined) dbUpdates.seniority = updates.seniority;
            if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

            const { error } = await supabase.from('candidates').update(dbUpdates).eq('id', candidateId);
            if (error) throw error;

            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, ...updates } : c));
            addNotification('Candidato Atualizado', 'As informações foram salvas.', 'success');
        } catch (error: any) {
            console.error('[Candidate] Error updating candidate:', error);
            addNotification('Erro ao atualizar candidato', error.message, 'warning');
        }
    };

    const trashCandidate = async (candidateId: string) => {
        const { error } = await supabase.from('candidates').update({ trashed: true }).eq('id', candidateId);
        if (!error) {
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, trashed: true } : c));
            addNotification('Candidato movido para lixeira', '', 'success');
        }
    };

    const restoreCandidate = async (candidateId: string) => {
        const { error } = await supabase.from('candidates').update({ trashed: false }).eq('id', candidateId);
        if (!error) {
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, trashed: false } : c));
            addNotification('Candidato restaurado', '', 'success');
        }
    };

    const deleteCandidatePermanently = async (candidateId: string) => {
        const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
        if (!error) {
            setCandidates(prev => prev.filter(c => c.id !== candidateId));
            addNotification('Candidato excluído permanentemente', '', 'warning');
        }
    };

    // User Operations
    const addUser = async (userData: Omit<User, 'id'> & { id?: string, password?: string }) => {
        try {
            let userId = userData.id;

            // If no ID is provided, create the user in Supabase Auth first
            if (!userId && userData.password) {
                const adminClient = getSupabaseAdmin();
                if (!adminClient) {
                    throw new Error('Configuração administrativa ausente. Verifique a Service Role Key.');
                }

                const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true,
                    user_metadata: { name: userData.name, role: userData.role }
                });

                if (authError) throw authError;
                if (authData.user) {
                    userId = authData.user.id;
                }
            }

            if (!userId) throw new Error('Não foi possível gerar um ID de usuário.');

            const insertData: any = {
                id: userId,
                name: userData.name,
                email: userData.email,
                user_role: userData.role,
                status: userData.status,
                avatar_url: userData.avatar,
                bio: userData.bio,
                preferences: userData.preferences
            };

            const { data, error } = await supabase.from('profiles').insert(insertData).select().single();

            if (error) throw error;
            if (data) {
                const newUser: User = {
                    ...userData,
                    id: data.id,
                };
                setUsers(prev => [...prev, newUser]);
                addNotification('Novo Usuário', `${newUser.name} foi adicionado ao sistema.`, 'success');
            }
        } catch (error: any) {
            console.error('Error adding user:', error);
            throw error; // Rethrow to be caught in the UI
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.role) dbUpdates.user_role = updates.role;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
        if (updates.bio) dbUpdates.bio = updates.bio;
        if (updates.preferences) dbUpdates.preferences = updates.preferences;

        const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
        if (!error) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));

            // If email or role changed, update Auth as well
            if (updates.email || updates.role) {
                const adminClient = getSupabaseAdmin();
                if (adminClient) {
                    await adminClient.auth.admin.updateUserById(userId, {
                        email: updates.email,
                        user_metadata: updates.role ? { role: updates.role } : undefined
                    });
                }
            }

            // If current user is updated, notify
            if (userId === currentUser.id) {
                addNotification('Perfil Atualizado', 'Suas informações de perfil foram salvas.', 'success');
            }
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            // 1. Check if administrative client is available
            const adminClient = getSupabaseAdmin();
            if (!adminClient) {
                throw new Error('Acesso negado. Esta funcionalidade requer a Service Role Key configurada (VITE_SUPABASE_SERVICE_ROLE_KEY).');
            }

            // 2. Delete from Profiles first (this usually fails if there are foreign key constraints like in 'jobs')
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);

            if (profileError) {
                if (profileError.message?.includes('foreign key constraint')) {
                    throw new Error('Não é possível excluir este usuário pois ele possui registros vinculados (como vagas ou candidatos atribuídos). Tente desativar o usuário em vez de excluí-lo.');
                }
                console.error('Supabase Profile Delete Error:', profileError);
                throw new Error(`Erro no banco de dados: ${profileError.message || 'Falha ao remover perfil'}`);
            }

            // 3. Delete from Auth (Internal System)
            const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
            if (authError) {
                console.error('Supabase Auth Delete Error:', authError);
                // If profile was deleted but auth failed, it's an inconsistent state but we should report it.
                throw new Error(`Erro ao remover acesso (Auth): ${authError.message || 'Falha no sistema de autenticação'}`);
            }

            setUsers(prev => prev.filter(u => u.id !== userId));
            addNotification('Usuário Removido', 'O usuário foi excluído do sistema permanentemente.', 'info');
        } catch (error: any) {
            console.error('Error detail in deleteUser:', error);
            throw error; // Let the UI handle the specific error message
        }
    };

    // Client Operations
    const addClient = async (clientData: Omit<Client, 'id'>) => {
        try {
            const { data, error } = await supabase.from('clients').insert({
                name: clientData.name,
                industry: clientData.industry,
                contact_name: clientData.contactName,
                contact_email: clientData.contactEmail,
                phone: clientData.phone,
                status: clientData.status,
                contract_value: clientData.contractValue,
                logo_url: clientData.logo
            }).select().single();

            if (error) throw error;
            if (data) {
                const newClient: Client = {
                    ...clientData,
                    id: data.id,
                };
                setClients(prev => [...prev, newClient]);
                addNotification('Novo Cliente', `${newClient.name} foi adicionado à carteira.`, 'success');
                return data.id;
            }
        } catch (error: any) {
            console.error('Error adding client:', error);
            addNotification('Erro', 'Não foi possível adicionar o cliente.', 'warning');
            throw error;
        }
    };

    const updateClient = async (clientId: string, updates: Partial<Client>) => {
        try {
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
            if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
            if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.contractValue !== undefined) dbUpdates.contract_value = updates.contractValue;
            if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;

            const { error } = await supabase.from('clients').update(dbUpdates).eq('id', clientId);
            if (error) throw error;

            setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
            addNotification('Cliente Atualizado', 'As informações do cliente foram salvas.', 'success');
        } catch (error: any) {
            console.error('Error updating client:', error);
            addNotification('Erro', 'Não foi possível atualizar o cliente.', 'warning');
            throw error;
        }
    };

    const deleteClient = async (clientId: string) => {
        try {
            const { error } = await supabase.from('clients').delete().eq('id', clientId);
            if (error) {
                if (error.message?.includes('foreign key constraint')) {
                    throw new Error('Não é possível excluir este cliente pois ele possui vagas vinculadas. Remova ou altere as vagas antes de excluir o cliente.');
                }
                throw error;
            }
            setClients(prev => prev.filter(c => c.id !== clientId));
            addNotification('Cliente Removido', 'O cliente e seus dados foram excluídos.', 'info');
        } catch (error: any) {
            console.error('Error deleting client:', error);
            alert(error.message || 'Erro ao excluir cliente.');
        }
    };

    const uploadClientLogo = async (clientId: string, file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${clientId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            // Upload the file to the 'logos' bucket
            const { data, error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            // Update client record with the new logo URL
            await updateClient(clientId, { logo: publicUrl });

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            addNotification('Erro no Upload', 'Não foi possível carregar a logo do cliente.', 'warning');
            return null;
        }
    };

    const markNotificationAsRead = async (id: string) => {
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }
    };

    const clearNotifications = async () => {
        const { error } = await supabase.from('notifications').delete().eq('user_id', currentUser.id);
        if (!error) {
            setNotifications([]);
        }
    };

    return (
        <AppContext.Provider value={{
            jobs,
            users,
            candidates,
            clients,
            notifications,
            currentUser,
            isAuthenticated,
            loading,
            theme,
            toggleTheme,
            logout,
            addJob,
            updateJob,
            updateJobStage,
            trashJob,
            restoreJob,
            deleteJobPermanently,
            addCandidate,
            updateCandidateStage,
            updateCandidate,
            trashCandidate,
            restoreCandidate,
            deleteCandidatePermanently,
            addUser,
            updateUser,
            deleteUser,
            addClient,
            updateClient,
            deleteClient,
            uploadClientLogo,
            markNotificationAsRead,
            clearNotifications
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
