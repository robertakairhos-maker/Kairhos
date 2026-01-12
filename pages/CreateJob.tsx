import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Job } from '../types';

export const CreateJob: React.FC = () => {
    const navigate = useNavigate();
    const { addJob, users } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        deadline: '',
        priority: 'medium',
        salaryMin: '',
        salaryMax: '',
        description: '',
        recruiterId: '',
        requirements: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriorityChange = (val: string) => {
        setFormData(prev => ({ ...prev, priority: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Find selected recruiter
        const recruiter = users.find(u => u.id === formData.recruiterId);
        if (!recruiter) {
            alert("Por favor, selecione um recrutador responsável.");
            return;
        }

        const requirementsArray = formData.requirements
            .split(',')
            .map(req => req.trim())
            .filter(req => req.length > 0);

        const newJobData: Omit<Job, 'id'> = {
            title: formData.title,
            company: formData.company,
            stage: 'Vagas Abertas',
            priority: formData.priority === 'high' ? 'Crítico' : formData.priority === 'medium' ? 'Alta Prioridade' : undefined,
            tag: { label: 'NEW', color: 'bg-green-50 text-green-600' }, // Default tag for now
            progress: 0,
            daysRemaining: 30, // Mock calculation
            recruiter: {
                id: recruiter.id,
                name: recruiter.name,
                avatar: recruiter.avatar
            },
            candidatesCount: 0,
            salaryMin: Number(formData.salaryMin),
            salaryMax: Number(formData.salaryMax),
            description: formData.description,
            requirements: requirementsArray.length > 0 ? requirementsArray : ['Geral']
        };

        addJob(newJobData);
        navigate('/dashboard');
    };

    return (
        <div className="max-w-[1024px] mx-auto py-4 sm:py-8 px-4 sm:px-8">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap gap-2 mb-4">
                <span onClick={() => navigate('/dashboard')} className="text-[#616f89] hover:text-primary text-sm font-medium transition-colors cursor-pointer">Vagas</span>
                <span className="text-[#616f89] text-sm font-medium">/</span>
                <span className="text-[#111318] dark:text-white text-sm font-medium">Nova Vaga</span>
            </nav>

            {/* Page Heading */}
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-[#111318] dark:text-white text-3xl font-extrabold tracking-tight">Cadastrar Nova Vaga</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-base font-normal">Preencha os detalhes para publicar uma nova oportunidade de emprego no portal.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-900 border border-[#dbdfe6] dark:border-gray-800 rounded-xl shadow-sm">
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 flex flex-col gap-6 sm:gap-8">
                    {/* Row 1: Job Title & Client */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Título da Vaga</span>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                type="text"
                                className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                                placeholder="Ex: Desenvolvedor Full Stack Senior"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Nome do Cliente / Empresa</span>
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                type="text"
                                className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                                placeholder="Selecione ou digite a empresa"
                                required
                            />
                        </label>
                    </div>

                    {/* Row 2: Recruiter Selection & Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Recrutador Responsável (Vincular Usuário)</span>
                            <div className="relative">
                                <select
                                    name="recruiterId"
                                    value={formData.recruiterId}
                                    onChange={handleInputChange}
                                    className="form-select w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary appearance-none"
                                    required
                                >
                                    <option value="" disabled>Selecione um usuário...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} - {user.role}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-3 text-[#616f89] pointer-events-none">expand_more</span>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Prazo de Encerramento (Deadline)</span>
                            <div className="relative">
                                <input
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    type="date"
                                    className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                                />
                                <span className="material-symbols-outlined absolute right-3 top-3 text-[#616f89] pointer-events-none">calendar_today</span>
                            </div>
                        </label>
                    </div>

                    {/* Row 3: Priority */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Nível de Prioridade</span>
                        <div className="flex h-12 p-1 bg-[#f0f2f4] dark:bg-gray-800 rounded-lg max-w-md">
                            <label className="flex-1 flex items-center justify-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="low"
                                    checked={formData.priority === 'low'}
                                    onChange={() => handlePriorityChange('low')}
                                    className="hidden peer"
                                />
                                <span className="w-full h-full flex items-center justify-center text-sm font-medium text-[#616f89] peer-checked:bg-white dark:peer-checked:bg-gray-700 peer-checked:text-[#111318] dark:peer-checked:text-white rounded-md transition-all shadow-sm peer-checked:shadow">Baixa</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="medium"
                                    checked={formData.priority === 'medium'}
                                    onChange={() => handlePriorityChange('medium')}
                                    className="hidden peer"
                                />
                                <span className="w-full h-full flex items-center justify-center text-sm font-medium text-[#616f89] peer-checked:bg-white dark:peer-checked:bg-gray-700 peer-checked:text-[#111318] dark:peer-checked:text-white rounded-md transition-all shadow-sm peer-checked:shadow">Média</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="high"
                                    checked={formData.priority === 'high'}
                                    onChange={() => handlePriorityChange('high')}
                                    className="hidden peer"
                                />
                                <span className="w-full h-full flex items-center justify-center text-sm font-medium text-[#616f89] peer-checked:bg-white dark:peer-checked:bg-gray-700 peer-checked:text-[#111318] dark:peer-checked:text-white rounded-md transition-all shadow-sm peer-checked:shadow">Alta</span>
                            </label>
                        </div>
                    </div>

                    {/* Row 4: Salary Range */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Faixa Salarial</span>
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-[#616f89] text-sm">R$</span>
                                <input
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleInputChange}
                                    type="number"
                                    className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 pl-10 pr-4 focus:ring-primary focus:border-primary"
                                    placeholder="Mínimo"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-[#616f89] text-sm">R$</span>
                                <input
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleInputChange}
                                    type="number"
                                    className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 pl-10 pr-4 focus:ring-primary focus:border-primary"
                                    placeholder="Máximo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Requirements */}
                    <label className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Requisitos Técnicos (Tags)</span>
                        </div>
                        <input
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleInputChange}
                            type="text"
                            className="form-input w-full rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary"
                            placeholder="Ex: React, Node.js, Inglês Fluente (Separe por vírgula)"
                        />
                    </label>

                    {/* Row 6: Description */}
                    <label className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[#111318] dark:text-gray-200 text-sm font-bold">Descrição e Requisitos</span>
                            <span className="text-[#616f89] text-xs font-normal">Markdown suportado</span>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea w-full min-h-[200px] rounded-lg border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white p-4 focus:ring-primary focus:border-primary resize-y"
                            placeholder="Descreva as responsabilidades, competências técnicas e diferenciais..."
                        ></textarea>
                    </label>

                    {/* Form Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#dbdfe6] dark:border-gray-800">
                        <button onClick={() => navigate('/dashboard')} type="button" className="px-6 py-3 text-[#616f89] hover:text-[#111318] dark:text-gray-400 dark:hover:text-white text-sm font-bold transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Publicar Vaga
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
