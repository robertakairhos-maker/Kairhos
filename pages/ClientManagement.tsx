import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';

export const ClientManagement: React.FC = () => {
    const { clients, addClient, updateClient, deleteClient, uploadClientLogo, currentUser } = useApp();

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
        status: 'Prospect' as Client['status'],
        contractValue: '',
        logo: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contactName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || client.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
            industry: '',
            contactName: '',
            contactEmail: '',
            phone: '',
            status: 'Prospect',
            contractValue: '',
            logo: ''
        });
        setLogoFile(null);
        setLogoPreview(null);
        setSubmitError('');
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
        setLogoFile(null);
        setLogoPreview(client.logo);
        setSubmitError('');
        setShowModal(true);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        try {
            let clientId = editingId;
            let currentLogoUrl = formData.logo;

            if (isEditing && editingId) {
                await updateClient(editingId, {
                    name: formData.name,
                    industry: formData.industry,
                    contactName: formData.contactName,
                    contactEmail: formData.contactEmail,
                    phone: formData.phone,
                    status: formData.status,
                    contractValue: formData.contractValue
                });
            } else {
                const newId = await addClient({
                    name: formData.name,
                    industry: formData.industry,
                    contactName: formData.contactName,
                    contactEmail: formData.contactEmail,
                    phone: formData.phone,
                    status: formData.status,
                    contractValue: formData.contractValue,
                    logo: '' // Will update after upload if file exists
                });
                clientId = newId;
            }

            // Handle Logo Upload if a new file was selected
            if (clientId && logoFile) {
                const uploadedUrl = await uploadClientLogo(clientId, logoFile);
                if (uploadedUrl) {
                    currentLogoUrl = uploadedUrl;
                }
            }

            setShowModal(false);
            setIsSubmitting(false);
        } catch (err: any) {
            setSubmitError(err.message || 'Erro inesperado ao salvar cliente');
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja remover o cliente "${name}"? Esta ação removerá os dados permanentemente.`)) {
            await deleteClient(id);
        }
    };

    if (currentUser.role !== 'Admin') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Acesso Restrito</h2>
                    <p className="text-slate-500">Apenas administradores podem gerenciar clientes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Gestão de Clientes</h1>
                    <p className="text-sm text-slate-500">Administre o portfólio de contas e logos da sua agência.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm"
                >
                    <span className="material-symbols-outlined">add_business</span>
                    Cadastrar Novo Cliente
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                    <div className="relative flex-1 min-w-[280px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400"
                            placeholder="Buscar por nome, setor ou contato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary/50 cursor-pointer dark:text-white min-w-[160px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Todos">Status: Todos</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Negociação">Negociação</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Churn">Churn</option>
                    </select>
                </div>

                {/* Clients Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Setor</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Contato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Nenhum cliente cadastrado.</td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        {client.logo ? (
                                                            <img src={client.logo} alt={client.name} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-slate-400">business</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-[#111318] dark:text-white uppercase">{client.name}</p>
                                                        <p className="text-xs text-slate-500 sm:hidden">{client.industry}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{client.industry}</td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{client.contactName}</p>
                                                <p className="text-xs text-slate-500">{client.contactEmail}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${client.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                        client.status === 'Negociação' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                            'bg-slate-50 text-slate-500 border border-slate-200'
                                                    }`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleOpenEdit(client)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Editar">
                                                        <span className="material-symbols-outlined text-xl">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(client.id, client.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Remover">
                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                    </button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#1a212d] my-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#111318] dark:text-white">
                                {isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
                            {submitError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">error</span>
                                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{submitError}</p>
                                </div>
                            )}

                            {/* Logo Section */}
                            <div className="flex flex-col sm:flex-row gap-6 items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="w-24 h-24 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-300 text-3xl">add_photo_alternate</span>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Logomarca do Cliente</p>
                                    <p className="text-xs text-slate-500 mb-2">Recomendado: PNG ou SVG com fundo transparente. Máx 2MB.</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full sm:w-fit bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">upload</span>
                                        Selecionar Imagem
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome da Empresa</span>
                                    <input
                                        required
                                        type="text"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Setor / Indústria</span>
                                    <input
                                        required
                                        type="text"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome do Contato</span>
                                    <input
                                        type="text"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">E-mail de Contato</span>
                                    <input
                                        type="email"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Status da Conta</span>
                                    <select
                                        className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
                                    >
                                        <option value="Prospect">Prospect</option>
                                        <option value="Negociação">Negociação</option>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                        <option value="Churn">Churn</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Valor Contrato (R$)</span>
                                    <input
                                        type="text"
                                        placeholder="Ex: 5.000,00"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.contractValue}
                                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        <span>Salvar Cliente</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
