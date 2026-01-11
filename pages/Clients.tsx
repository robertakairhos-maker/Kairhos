import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';

export const Clients: React.FC = () => {
    const { clients, jobs, addClient, updateClient } = useApp();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Todos');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        contactName: '',
        contactEmail: '',
        phone: '',
        status: 'Prospect',
        contractValue: '',
        logo: ''
    });

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              client.contactName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Helper to get active jobs count for a client
    const getActiveJobsCount = (clientName: string) => {
        return jobs.filter(j => j.company === clientName && j.stage !== 'Entregue').length;
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', industry: '', contactName: '', contactEmail: '', phone: '', status: 'Prospect', contractValue: '', logo: '' });
        setShowModal(true);
    };

    const handleOpenEdit = (client: Client) => {
        setIsEditing(true);
        setEditingId(client.id);
        setFormData({ 
            name: client.name, 
            industry: client.industry, 
            contactName: client.contactName, 
            contactEmail: client.contactEmail,
            phone: client.phone,
            status: client.status,
            contractValue: client.contractValue || '',
            logo: client.logo
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const logoChar = formData.logo || formData.name.substring(0, 1).toUpperCase();
        
        if (isEditing && editingId) {
            updateClient(editingId, {
                ...formData,
                logo: logoChar
            } as any);
        } else {
            addClient({
                ...formData,
                logo: logoChar
            } as any);
        }
        setShowModal(false);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Ativo': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Negociação': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Prospect': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Churn': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Clientes e CRM</h1>
                    <p className="text-sm text-slate-500">Gerencie sua carteira de empresas e o pipeline comercial.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                    <span className="material-symbols-outlined">add_business</span>
                    Novo Cliente
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8 bg-background-light dark:bg-background-dark">
                
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400 shadow-sm" 
                            placeholder="Buscar cliente, contato..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['Todos', 'Ativo', 'Negociação', 'Prospect'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                                    statusFilter === status 
                                    ? 'bg-primary text-white border-primary shadow-md' 
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClients.map(client => (
                        <div key={client.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            {/* Top Accent */}
                            <div className={`h-1.5 w-full ${
                                client.status === 'Ativo' ? 'bg-emerald-500' : 
                                client.status === 'Negociação' ? 'bg-amber-500' :
                                client.status === 'Prospect' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-gray-500 dark:text-gray-300">
                                        {client.logo}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(client.status)}`}>
                                        {client.status.toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-1">{client.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">{client.industry}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                                        <span className="truncate">{client.contactName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                                        <span className="truncate">{client.contactEmail}</span>
                                    </div>
                                     <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
                                        <span className="truncate font-medium">{client.contractValue || '-'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Vagas Ativas</p>
                                        <p className="text-lg font-black text-[#111318] dark:text-white">{getActiveJobsCount(client.name)}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenEdit(client)}
                                        className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add New Card Button */}
                    <button 
                        onClick={handleOpenAdd}
                        className="min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all gap-2"
                    >
                        <span className="material-symbols-outlined text-4xl">add_circle</span>
                        <span className="font-bold">Adicionar Cliente</span>
                    </button>
                </div>
            </div>

             {/* Add/Edit Modal */}
             {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a212d] p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-[#111318] dark:text-white">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome da Empresa</span>
                                    <input 
                                        required
                                        type="text" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-11 px-4 dark:text-white"
                                        placeholder="Ex: ACME Corp"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Indústria / Setor</span>
                                    <input 
                                        required
                                        type="text" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-11 px-4 dark:text-white"
                                        placeholder="Ex: Tecnologia"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                    />
                                </label>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className="flex flex-col gap-2 md:col-span-3">
                                    <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Dados do Contato Principal</span>
                                </label>
                                <label className="flex flex-col gap-2 md:col-span-1">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome</span>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm h-10 px-3 dark:text-white"
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                                    />
                                </label>
                                <label className="flex flex-col gap-2 md:col-span-1">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">E-mail</span>
                                    <input 
                                        type="email" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm h-10 px-3 dark:text-white"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                                    />
                                </label>
                                <label className="flex flex-col gap-2 md:col-span-1">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Telefone</span>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm h-10 px-3 dark:text-white"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Status Comercial</span>
                                    <select 
                                        className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-11 px-4 dark:text-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Prospect">Prospect (Prospecção)</option>
                                        <option value="Negociação">Em Negociação</option>
                                        <option value="Ativo">Cliente Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                        <option value="Churn">Churn (Cancelou)</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Valor do Contrato / Estimativa</span>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-11 px-4 dark:text-white"
                                        placeholder="Ex: R$ 10.000/mês"
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({...formData, contractValue: e.target.value})}
                                    />
                                </label>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancelar</button>
                                <button type="submit" className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Salvar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
