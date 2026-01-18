import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabase'; // Keep main client for other things if needed

export const UserManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('Todos');
    const [statusFilter, setStatusFilter] = useState<string>('Todos');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Junior Recruiter',
        status: 'Ativo'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'Todos' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', email: '', password: '', role: 'Junior Recruiter', status: 'Ativo' });
        setShowModal(true);
    };

    const handleOpenEdit = (user: User) => {
        setIsEditing(true);
        setEditingId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show existing password
            role: user.role,
            status: user.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        // Generate initials for avatar if no image (simplified)
        const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        try {
            if (isEditing && editingId) {
                await updateUser(editingId, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role as User['role'],
                    status: formData.status as User['status']
                });
            } else {
                // Add user using the centralized context method which handles Auth + Profile
                await addUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role as User['role'],
                    status: formData.status as User['status'],
                    avatar: initials
                });
            }
            setShowModal(false);
            setIsSubmitting(false);
        } catch (err: any) {
            setSubmitError(err.message || 'Erro inesperado ao salvar usuário');
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Prevent deleting the currently logged-in user
        if (id === currentUser.id) {
            alert('Você não pode remover o usuário que está atualmente logado no sistema.');
            return;
        }

        if (window.confirm('Tem certeza que deseja remover este usuário? Esta ação removerá o acesso e os dados permanentemente.')) {
            try {
                await deleteUser(id);
                // Notification is handled in context
            } catch (err: any) {
                console.error('Erro ao excluir usuário:', err);
                const errorMessage = err?.message || 'Erro inesperado ao excluir usuário no Supabase.';
                alert(`Erro ao excluir usuário: ${errorMessage}`);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-[#111318] dark:text-white">Gestão de Usuários</h1>
                    <p className="text-sm text-slate-500">Gerencie as permissões e contas da sua equipe de recrutamento.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm sm:text-base mt-4 sm:mt-0"
                >
                    <span className="material-symbols-outlined">add</span>
                    Adicionar Novo Usuário
                </button>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8">
                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm dark:text-white placeholder:text-slate-400"
                            placeholder="Buscar por nome, cargo ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary/50 cursor-pointer dark:text-white"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="Todos">Todos os Cargos</option>
                            <option value="Admin">Admin</option>
                            <option value="Senior Recruiter">Senior Recruiter</option>
                            <option value="Junior Recruiter">Junior Recruiter</option>
                        </select>
                        <select
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary/50 cursor-pointer dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Todos">Status: Todos</option>
                            <option value="Ativo">Ativos</option>
                            <option value="Inativo">Inativos</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">E-mail</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">Nenhum usuário encontrado.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar.startsWith('http') ? (
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-200">{user.avatar}</div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-sm text-[#111318] dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 sm:hidden">{user.email}</p>
                                                    <p className="text-xs text-slate-500 md:hidden">{user.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">{user.email}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status === 'Ativo' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'
                                                    }`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Editar">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Remover">
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a212d] p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#111318] dark:text-white">{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Error Message */}
                            {submitError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">error</span>
                                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{submitError}</p>
                                </div>
                            )}

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome Completo</span>
                                <input
                                    required
                                    type="text"
                                    className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-[#111318] dark:text-gray-200">E-mail</span>
                                <input
                                    required
                                    type="email"
                                    className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </label>

                            {!isEditing && (
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Senha Provisória</span>
                                    <input
                                        required
                                        type="password"
                                        className="form-input rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        disabled={isSubmitting}
                                    />
                                </label>
                            )}

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Cargo</span>
                                <select
                                    className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm h-10 px-3 dark:text-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Senior Recruiter">Senior Recruiter</option>
                                    <option value="Junior Recruiter">Junior Recruiter</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Status</span>
                                <div className="flex gap-4 pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="status" value="Ativo" checked={formData.status === 'Ativo'} onChange={() => setFormData({ ...formData, status: 'Ativo' })} className="text-primary focus:ring-primary" />
                                        <span className="text-sm dark:text-gray-300">Ativo</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="status" value="Inativo" checked={formData.status === 'Inativo'} onChange={() => setFormData({ ...formData, status: 'Inativo' })} className="text-primary focus:ring-primary" />
                                        <span className="text-sm dark:text-gray-300">Inativo</span>
                                    </label>
                                </div>
                            </label>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            <span>Criando...</span>
                                        </>
                                    ) : (
                                        <span>Salvar</span>
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
