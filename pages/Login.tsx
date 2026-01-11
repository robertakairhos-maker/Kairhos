import React from 'react';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-display" style={{
            backgroundColor: '#f6f6f8',
            backgroundImage: 'radial-gradient(#135bec10 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}>
            <div className="w-full max-w-[480px] p-6 sm:p-10">
                {/* Logo / Brand Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">hourglass_top</span>
                    </div>
                    <h1 className="text-[#111318] dark:text-white text-2xl font-bold tracking-tight">Kairhos RH e CRM</h1>
                    <p className="text-[#616f89] dark:text-[#94a3b8] text-sm font-normal mt-1 text-center">Acesse o CRM de Recrutamento da agência</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-[#dbdfe6] dark:border-slate-800 overflow-hidden">
                    {/* Header Image within Card */}
                    <div className="@container">
                        <div className="p-2">
                            <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-primary/10 rounded-lg min-h-[140px]" 
                                 style={{ backgroundImage: 'linear-gradient(135deg, #135bec 0%, #0a2e7a 100%)' }}>
                                <div className="p-4 bg-gradient-to-t from-black/40 to-transparent">
                                    <p className="text-white text-xs font-medium uppercase tracking-widest opacity-80">Portal do Recrutador</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 pt-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col">
                                    <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold leading-normal pb-2">E-mail</p>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#616f89] text-[20px]">mail</span>
                                        <input className="form-input flex w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbdfe6] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#616f89] pl-11 pr-4 text-sm font-normal transition-all" placeholder="admin@agency.com" required type="email" />
                                    </div>
                                </label>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <label className="flex flex-col">
                                    <p className="text-[#111318] dark:text-slate-200 text-sm font-semibold leading-normal pb-2">Senha</p>
                                    <div className="flex w-full items-stretch rounded-lg group">
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#616f89] text-[20px]">lock</span>
                                            <input className="form-input flex w-full rounded-l-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dbdfe6] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#616f89] pl-11 pr-2 text-sm font-normal border-r-0 transition-all" placeholder="••••••••" required type="password" />
                                        </div>
                                        <button type="button" className="text-[#616f89] flex border border-[#dbdfe6] dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center px-4 rounded-r-lg border-l-0 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <a href="#" className="text-primary text-xs font-semibold hover:underline transition-all">
                                    Esqueci minha senha
                                </a>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 pb-2">
                                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg shadow-md shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    <span>Entrar no Sistema</span>
                                    <span className="material-symbols-outlined text-[20px]">login</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-[#616f89] dark:text-[#94a3b8] text-[12px] font-medium">
                        © 2024 Kairhos RH e CRM. Todos os direitos reservados.
                    </p>
                    <div className="flex justify-center gap-4 mt-3">
                        <a href="#" className="text-[#616f89] hover:text-primary text-xs">Suporte</a>
                        <span className="text-[#dbdfe6] dark:text-slate-700">|</span>
                        <a href="#" className="text-[#616f89] hover:text-primary text-xs">Privacidade</a>
                    </div>
                </div>
            </div>
        </div>
    );
};