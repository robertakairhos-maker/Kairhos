
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Senior Recruiter' | 'Junior Recruiter';
    status: 'Ativo' | 'Inativo';
    avatar: string;
    password?: string;
    bio?: string;
    preferences?: {
        notifications: boolean;
        newsletter: boolean;
    };
}

export interface Client {
    id: string;
    name: string;
    industry: string;
    contactName: string;
    contactEmail: string;
    phone: string;
    status: 'Prospect' | 'Negociação' | 'Ativo' | 'Inativo' | 'Churn';
    contractValue?: string;
    logo: string;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    stage: 'Vagas Abertas' | 'Em Triagem' | 'Primeira Entrevista' | 'Entrevista Gestor' | 'Vaga paralisada' | 'Substituição' | 'Entregue' | 'Retrabalho';
    priority?: 'Alta Prioridade' | 'Crítico';
    tag?: { label: string; color: string };
    progress: number;
    daysRemaining?: number;
    recruiter: {
        id: string;
        name: string;
        avatar: string;
    };
    candidatesCount?: number;
    statusIcon?: string;
    salaryMin?: number;
    salaryMax?: number;
    description?: string;
    requirements?: string[];
}

export interface Note {
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
}

export interface Candidate {
    id: string;
    jobId: string;
    initials: string;
    name: string;
    email: string;
    phone: string;
    status: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Rejeitado';
    stage: 'Triagem' | 'Testes' | 'Primeira Entrevista' | 'Entrevista Gestor' | 'Entregue' | 'Retrabalho' | 'Reprovado';
    avatarColor: string;
    textColor: string;
    badgeColor: string;
    badgeText: string;
    // Enhanced Fields for Talent Pool
    resumeUrl?: string;
    resumeName?: string;
    notes?: Note[];
    skills?: string[];
    source?: string;
    location?: string; // e.g. "São Paulo, SP"
    currentRole?: string; // e.g. "Frontend Developer"
    seniority?: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Gerente' | 'Estagiário';
    trashed?: boolean;
}

export interface KanbanColumnData {
    id: string;
    title: string;
    count: number;
    color: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'success' | 'warning' | 'info';
}
