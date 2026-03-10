import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Upload, Send, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function TrabalheConosco() {
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        sexo: '',
        idade: '',
        cidade: '',
        bairro: '',
        cargo: '',
        mensagem: ''
    });

    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [funcoes, setFuncoes] = useState<{ id: string; nome: string }[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    // Busca funções disponíveis do banco
    useEffect(() => {
        supabase
            .rpc('get_funcoes_curriculo_mda')
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erro ao buscar funções (RPC):', error);
                    return;
                }
                if (data) setFuncoes(data);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isSubmitted) return; // bloqueio de duplo clique já existente, reforçando.

        setIsSubmitting(true);
        setError(null);

        try {
            let anexo_url: string | null = null;
            let anexo_nome: string | null = null;

            // 1. Upload do currículo para o Storage
            if (file) {
                const ext = file.name.split('.').pop();
                const filePath = `curriculos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from('temperos_d_casa')
                    .upload(filePath, file, { upsert: false });

                if (uploadError) throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);

                const { data: urlData } = supabase.storage
                    .from('temperos_d_casa')
                    .getPublicUrl(filePath);

                anexo_url = urlData?.publicUrl ?? null;
                anexo_nome = file.name;
            }

            // 2. Salvar no banco via RPC para evitar erro de schema (406)
            const { error: insertError } = await supabase
                .rpc('insert_curriculo_mda', {
                    payload: {
                        nome: formData.nome,
                        telefone: formData.telefone,
                        sexo: formData.sexo,
                        faixa_etaria: formData.idade,
                        cidade: formData.cidade,
                        bairro: formData.bairro,
                        cargo: formData.cargo,
                        mensagem: formData.mensagem || null,
                        anexo_url: anexo_url,
                        anexo_nome: anexo_nome,
                    }
                });

            if (insertError) throw new Error(`Erro ao registrar currículo: ${insertError.message}`);

            setIsSubmitted(true);
        } catch (err: any) {
            console.error('Erro ao enviar candidatura:', err);
            setError(err.message || 'Ocorreu um erro ao enviar sua candidatura. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen font-sans text-earth-800 bg-white selection:bg-mustard-500/30 selection:text-olive-900 flex flex-col">
            <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto flex flex-col items-center">

                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="text-center mb-10 w-full max-w-2xl">
                                <span className="text-secondary-green font-semibold tracking-wider text-sm uppercase mb-2 block">Vagas Temperos D'Casa</span>
                                <h1 className="text-3xl md:text-5xl font-black text-primary-red mb-4">
                                    Trabalhe Conosco
                                </h1>
                                <p className="text-base text-gray-500 font-light">
                                    Faça parte da nossa equipe. Preencha seus dados abaixo e envie seu currículo para avaliarmos seu perfil.
                                </p>
                            </div>

                            {/* Error Banner */}
                            {error && (
                                <div className="w-full mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
                                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Form Container */}
                            <div className="w-full">
                                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Coluna Principal da Esquerda: Dados Essenciais */}
                                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Nome Completo */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Nome Completo *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nome"
                                                    required
                                                    value={formData.nome}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-red transition-colors"
                                                    placeholder="Como você se chama?"
                                                />
                                            </div>

                                            {/* Telefone */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Telefone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="telefone"
                                                    required
                                                    value={formData.telefone}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8cc63f] transition-colors"
                                                    placeholder="(11) 90000-0000"
                                                />
                                            </div>

                                            {/* Cidade */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Cidade *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cidade"
                                                    required
                                                    value={formData.cidade}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8cc63f] transition-colors"
                                                    placeholder="Sua cidade"
                                                />
                                            </div>

                                            {/* Bairro */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Bairro *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="bairro"
                                                    required
                                                    value={formData.bairro}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8cc63f] transition-colors"
                                                    placeholder="Seu bairro"
                                                />
                                            </div>

                                            {/* Cargo de Interesse */}
                                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Cargo de Interesse *
                                                </label>
                                                <select
                                                    name="cargo"
                                                    required
                                                    value={formData.cargo}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 focus:outline-none focus:border-[#8cc63f] transition-colors appearance-none cursor-pointer"
                                                >
                                                    <option value="" disabled hidden>Selecione uma opção</option>
                                                    {funcoes.map((f) => (
                                                        <option key={f.id} value={f.nome}>{f.nome}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Mensagem Adicional */}
                                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Resumo Profissional
                                                </label>
                                                <textarea
                                                    name="mensagem"
                                                    value={formData.mensagem}
                                                    onChange={handleChange}
                                                    placeholder="Conte-nos brevemente suas experiências e por que quer trabalhar conosco..."
                                                    rows={2}
                                                    className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-2 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#8cc63f] transition-colors resize-y min-h-[60px]"
                                                />
                                            </div>

                                        </div>

                                        {/* Coluna Secundária da Direita */}
                                        <div className="md:col-span-1 flex flex-col gap-6 md:pl-6 md:border-l border-gray-100">

                                            {/* Sexo */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Sexo *
                                                </label>
                                                <div className="flex flex-wrap gap-4">
                                                    {['Masculino', 'Feminino'].map((opt) => (
                                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${formData.sexo === opt ? 'border-[#8cc63f]' : 'border-gray-300'}`}>
                                                                {formData.sexo === opt && <div className="w-2 h-2 rounded-full bg-[#8cc63f]" />}
                                                            </div>
                                                            <input type="radio" name="sexo" value={opt} required onChange={handleChange} className="hidden" />
                                                            <span className={`text-sm transition-colors ${formData.sexo === opt ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Faixa Etária */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Faixa Etária *
                                                </label>
                                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                    {['13 a 17 anos', '18 a 24 anos', '25 a 34 anos', '35 a 44 anos', '45 a 54 anos', '+ de 60 anos'].map((idade) => (
                                                        <label key={idade} className="flex items-center gap-2 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${formData.idade === idade ? 'border-[#8cc63f]' : 'border-gray-300'}`}>
                                                                {formData.idade === idade && <div className="w-2 h-2 rounded-full bg-[#8cc63f]" />}
                                                            </div>
                                                            <input type="radio" name="idade" value={idade} required onChange={handleChange} className="hidden" />
                                                            <span className={`text-sm transition-colors ${formData.idade === idade ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-800'}`}>{idade}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6 flex flex-col gap-4">
                                                {/* Anexar Currículo */}
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-sm font-semibold text-gray-700">
                                                        Currículo (PDF/DOC)
                                                    </label>
                                                    <div className="relative group w-full">
                                                        <input
                                                            ref={fileRef}
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleFileChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className={`px-4 py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors ${fileName ? 'border-secondary-green bg-green-50' : 'border-gray-300 bg-gray-50 group-hover:bg-gray-100 group-hover:border-gray-400'}`}>
                                                            <Upload className={`w-4 h-4 flex-shrink-0 ${fileName ? 'text-secondary-green' : 'text-gray-400'}`} />
                                                            <span className={`text-sm font-medium truncate ${fileName ? 'text-secondary-green' : 'text-gray-500'}`}>
                                                                {fileName ? fileName : 'Selecione o arquivo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full mt-2 px-8 bg-primary-red hover:bg-primary-red-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                            Enviando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Enviar Candidatura
                                                            <Send className="w-4 h-4 ml-1" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                        </div>
                                    </div>

                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-lg flex flex-col items-center text-center mt-12 sm:mt-24 px-4"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 rounded-full border-4 border-[#8cc63f] opacity-20 animate-ping" />
                                <CheckCircle className="w-12 h-12 text-secondary-green" />
                            </div>
                            <h2 className="text-3xl font-black text-primary-red mb-4">Currículo Enviado!</h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed font-light">
                                Obrigado pelo seu interesse em fazer parte da equipe do <span className="font-semibold text-gray-900">Temperos D'Casa</span>. Nossa equipe de RH irá analisar seu perfil e, caso haja uma oportunidade alinhada, entraremos em contato.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
