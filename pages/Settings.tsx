import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
    const { currentUser, updateUser, theme, toggleTheme } = useApp();
    const [formData, setFormData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        bio: currentUser.bio || '',
        currentPassword: '',
        newPassword: '',
        notifications: currentUser.preferences?.notifications ?? true,
        newsletter: currentUser.preferences?.newsletter ?? false,
    });

    // Reset form when currentUser changes (e.g. after update)
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: currentUser.name,
            email: currentUser.email,
            bio: currentUser.bio || '',
        }));
    }, [currentUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(currentUser.id, {
            name: formData.name,
            email: formData.email,
            bio: formData.bio,
            preferences: {
                notifications: formData.notifications,
                newsletter: formData.newsletter
            }
        });
    };

    const handleSubmitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, verify current password and call API
        if (formData.newPassword.length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        // Mock update
        updateUser(currentUser.id, { password: formData.newPassword });
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        alert('Senha atualizada com sucesso!');
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#111318] dark:text-white">Configurações</h1>
                    <p className="text-xs sm:text-sm text-slate-500">Gerencie seu perfil e preferências do sistema.</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">

                    {/* Appearance */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">palette</span>
                                    Aparência
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Personalize a experiência visual do sistema.</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
                            >
                                <span className="sr-only">Toggle Dark Mode</span>
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-sm ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}
                                />
                                <span className={`absolute left-1.5 text-[10px] ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}>☀️</span>
                                <span className={`absolute right-1.5 text-[10px] ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
                            </button>
                        </div>
                    </section>

                    {/* Profile Information */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            {currentUser.avatar.startsWith('http') ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-white dark:border-slate-700 shadow-sm">
                                    {currentUser.avatar}
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-bold text-[#111318] dark:text-white">Informações Pessoais</h2>
                                <p className="text-sm text-slate-500">Atualize sua foto e detalhes pessoais.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitProfile} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nome Completo</span>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm h-10 px-3 focus:ring-primary focus:border-primary"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">E-mail Corporativo</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm h-10 px-3 focus:ring-primary focus:border-primary"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Biografia / Sobre</span>
                                <textarea
                                    name="bio"
                                    className="form-textarea rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm p-3 min-h-[100px] focus:ring-primary focus:border-primary"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Conte um pouco sobre você..."
                                />
                            </label>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <h3 className="text-sm font-bold text-[#111318] dark:text-white mb-3">Preferências de Notificação</h3>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="notifications"
                                            checked={formData.notifications}
                                            onChange={handleCheckboxChange}
                                            className="form-checkbox text-primary rounded border-slate-300 focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Receber notificações do sistema no navegador</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleCheckboxChange}
                                            className="form-checkbox text-primary rounded border-slate-300 focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Receber resumo semanal por e-mail</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Security */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-[#111318] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">lock</span>
                                Segurança e Senha
                            </h2>
                            <p className="text-sm text-slate-500">Altere sua senha de acesso.</p>
                        </div>

                        <form onSubmit={handleSubmitPassword} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Senha Atual</span>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="form-input rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm h-10 px-3 focus:ring-primary focus:border-primary"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-sm font-bold text-[#111318] dark:text-gray-200">Nova Senha</span>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-input rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm h-10 px-3 focus:ring-primary focus:border-primary"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!formData.newPassword || !formData.currentPassword}
                                    className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Atualizar Senha
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};
