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
        logo: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredClients = clients.filter(client => {
        return client.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
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

            if (isEditing && editingId) {
                await updateClient(editingId, {
                    name: formData.name
                });
            } else {
                const newId = await addClient({
                    name: formData.name,
                    industry: '',
                    contactName: '',
                    contactEmail: '',
                    phone: '',
                    status: 'Ativo',
                    contractValue: '',
                    logo: ''
                });
                clientId = newId;
            }

            // Handle Logo Upload if a new file was selected
            if (clientId && logoFile) {
                await uploadClientLogo(clientId, logoFile);
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
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Lista de Clientes</h1>
                    <p className="text-sm text-slate-500">Gerencie as empresas parceiras da agência.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Cliente
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-8">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400"
                            placeholder="Buscar cliente pelo nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Logomarca</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome da Empresa</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400">Nenhum cliente cadastrado.</td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    {client.logo ? (
                                                        <img src={client.logo} alt={client.name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-slate-400">business</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-[#111318] dark:text-white uppercase">{client.name}</p>
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
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Logomarca do Cliente (Opcional)</p>
                                    <p className="text-xs text-slate-500 mb-2">PNG ou SVG recomendado. Máx 2MB.</p>
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
                                        Selecionar Logo
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome da Empresa</span>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Digite o nome do cliente..."
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-12 px-4 dark:text-white focus:ring-2 focus:ring-primary/50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
