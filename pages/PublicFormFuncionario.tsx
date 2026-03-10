import React, { useState, useEffect } from 'react';
import {
  Briefcase, User, CreditCard, Upload, MapPin, FileText, CheckCircle, Search, ChevronDown, CheckCircle2, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ScrollToTop from '../components/ScrollToTop';

const PublicFormFuncionario: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formClosed, setFormClosed] = useState(false);

  // Initial check if form is enabled
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: isEnabled, error } = await supabase.schema('temperos_d_casa').rpc('is_public_form_enabled');

        if (error) {
          console.error('RPC Error:', error);
          return;
        }

        if (isEnabled === false) {
          setFormClosed(true);
        }
      } catch (err) {
        console.error('Error checking form status:', err);
      }
    };

    checkStatus();
  }, []);

  const [formData, setFormData] = useState({
    status: 'Ativo',
    tipoContrato: 'CLT',
    funcao: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    nome: '',
    sexo: 'Masculino',
    dataNascimento: '',
    telefone: '',
    telefoneRecado: '',
    email: '',
    titular: '',
    banco: '',
    pixTipo: 'CPF',
    pixChave: '',
    docTipo: 'RG',
    docNumero: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    complemento: ''
  });

  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);

  const fetchRoles = async () => {
    const { data, error } = await supabase.schema('temperos_d_casa').rpc('manage_cargos_mda', { action_type: 'SELECT_ALL' });
    if (error) {
      console.error('Erro ao buscar cargos (RPC):', error);
      return;
    }
    if (data) setRoles((data as any[]).map((d: any) => ({ id: d.id, name: d.nome })));
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'frente' | 'verso') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'frente') setDocFrente(e.target.files[0]);
      else setDocVerso(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `funcionarios/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('temperos_d_casa')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('temperos_d_casa')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Permite que o React renderize o loader antes do upload
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      let frenteUrl = '';
      let versoUrl = '';

      const uploadPromises = [];
      if (docFrente) uploadPromises.push(uploadFile(docFrente).then(url => frenteUrl = url));
      if (docVerso) uploadPromises.push(uploadFile(docVerso).then(url => versoUrl = url));

      await Promise.all(uploadPromises);

      const isFreelancer = formData.tipoContrato === 'Freelancer';

      const payload = {
        status: 'Ativo',
        tipo_contrato: formData.tipoContrato,
        funcao: isFreelancer ? 'Freelancer' : formData.funcao,
        data_entrada: isFreelancer ? null : formData.dataEntrada,
        nome: formData.nome,
        sexo: isFreelancer ? null : formData.sexo,
        data_nascimento: isFreelancer ? null : (formData.dataNascimento || null),
        telefone: formData.telefone,
        telefone_recado: formData.telefoneRecado,
        email: isFreelancer ? null : formData.email,
        titular_conta: formData.titular,
        banco: formData.banco,
        pix_tipo: formData.pixTipo,
        pix_chave: formData.pixChave,
        documento_tipo: isFreelancer ? null : formData.docTipo,
        documento_numero: isFreelancer ? null : formData.docNumero,
        documento_frente_url: frenteUrl,
        documento_verso_url: versoUrl,
        rua: isFreelancer ? null : formData.rua,
        numero: isFreelancer ? null : formData.numero,
        bairro: isFreelancer ? null : formData.bairro,
        cidade: isFreelancer ? null : formData.cidade,
        estado: isFreelancer ? null : formData.estado,
        complemento: isFreelancer ? null : formData.complemento,
        codigo: Math.floor(Math.random() * 9000) + 1000
      };

      console.log('Sending payload to RPC:', payload);
      const { data, error } = await supabase.schema('temperos_d_casa').rpc('insert_funcionario_mda', { payload });

      if (error) {
        console.error('RPC Error details:', error);
        throw error;
      }

      console.log('RPC Response:', data);
      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao realizar cadastro: ' + (error.message || 'Erro desconhecido. Verifique o console.'));
    } finally {
      setLoading(false);
    }
  };

  if (formClosed) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Briefcase size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Formulário Pausado</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Este formulário de cadastro está temporariamente desativado.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Solicite ao administrador para ativá-lo nas configurações do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Cadastro Realizado!</h1>
            <p className="text-slate-500 font-medium">Seus dados foram enviados com sucesso.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-red text-white font-bold rounded-xl hover:bg-primary-red-dark transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider";
  const inputClass = "w-full p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none transition-all";
  const sectionHeader = "flex items-center gap-2 text-xs font-bold text-primary-red uppercase tracking-widest py-2 border-b border-slate-100 mb-6 mt-8 first:mt-0";

  const isFreelancer = formData.tipoContrato === 'Freelancer';

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-primary-red p-6 sm:p-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tighter">Ficha Cadastral</h1>
            <p className="text-white/80 font-medium text-sm">TEMPEROS D'CASA</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            <div className={sectionHeader}><Briefcase size={14} /> Dados Profissionais</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Contrato</label>
                <select name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} className={inputClass} required>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Estágio">Estágio</option>
                  <option value="Temporário">Temporário</option>
                </select>
              </div>

              {!isFreelancer && (
                <>
                  <div>
                    <label className={labelClass}>Função/Cargo</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={14} />
                      </div>
                      <input
                        name="funcao"
                        value={formData.funcao}
                        onChange={handleChange}
                        onFocus={() => setShowRoleDropdown(true)}
                        onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
                        className={`${inputClass} pl-9`}
                        placeholder="Pesquisar função..."
                        autoComplete="off"
                        required={!isFreelancer}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={14} />
                      </div>

                      {showRoleDropdown && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                          {roles.filter(r => r.name.toLowerCase().includes(formData.funcao.toLowerCase())).length > 0 ? (
                            roles
                              .filter(r => r.name.toLowerCase().includes(formData.funcao.toLowerCase()))
                              .map(r => (
                                <div
                                  key={r.id}
                                  className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                  onClick={() => setFormData(prev => ({ ...prev, funcao: r.name }))}
                                >
                                  {r.name}
                                </div>
                              ))
                          ) : (
                            <div className="p-3 text-xs text-slate-500 text-center">Nenhuma função encontrada.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Data Disponibilidade</label>
                    <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} className={inputClass} required={!isFreelancer} />
                  </div>
                </>
              )}
            </div>

            <div className={sectionHeader}><User size={14} /> Dados Pessoais</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className={inputClass} required placeholder="Seu nome completo" />
              </div>

              {!isFreelancer && (
                <>
                  <div>
                    <label className={labelClass}>Sexo</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass} required={!isFreelancer}>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Data Nascimento</label>
                    <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className={inputClass} required={!isFreelancer} />
                  </div>
                </>
              )}

              <div>
                <label className={labelClass}>Celular / WhatsApp</label>
                <input name="telefone" value={formData.telefone} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" required />
              </div>

              {!isFreelancer && (
                <>
                  <div>
                    <label className={labelClass}>Telefone Recado</label>
                    <input name="telefoneRecado" value={formData.telefoneRecado} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="seu@email.com" required={!isFreelancer} />
                  </div>
                </>
              )}
            </div>

            <div className={sectionHeader}><CreditCard size={14} /> Dados Bancários</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nome do Titular</label>
                <input name="titular" value={formData.titular} onChange={handleChange} className={inputClass} placeholder="Titular da conta" required />
              </div>
              <div>
                <label className={labelClass}>Banco</label>
                <input name="banco" value={formData.banco} onChange={handleChange} className={inputClass} placeholder="Ex: Nubank, Itaú" required />
              </div>
              <div>
                <label className={labelClass}>Tipo de Chave PIX</label>
                <select name="pixTipo" value={formData.pixTipo} onChange={handleChange} className={inputClass} required>
                  <option value="CPF">CPF</option>
                  <option value="Celular">Celular</option>
                  <option value="Email">Email</option>
                  <option value="Aleatória">Aleatória</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Chave PIX</label>
                <input name="pixChave" value={formData.pixChave} onChange={handleChange} className={inputClass} placeholder="Chave PIX" required />
              </div>
            </div>

            {!isFreelancer && (
              <>
                <div className={sectionHeader}><FileText size={14} /> Documentos</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tipo de Documento</label>
                    <select name="docTipo" value={formData.docTipo} onChange={handleChange} className={inputClass} required={!isFreelancer}>
                      <option value="RG">RG</option>
                      <option value="CPF">CPF</option>
                      <option value="CNH">CNH</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Número do Documento</label>
                    <input name="docNumero" value={formData.docNumero} onChange={handleChange} className={inputClass} placeholder="00.000.000-0" required={!isFreelancer} />
                  </div>
                  <div>
                    <label className={labelClass}>Foto Documento (Frente)</label>
                    <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <input type="file" onChange={(e) => handleFileChange(e, 'frente')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        {docFrente ? (
                          <>
                            <CheckCircle size={24} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium truncate max-w-full px-2">{docFrente.name}</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} />
                            <span className="text-xs">Frente do Documento</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Foto Documento (Verso)</label>
                    <div className="relative border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <input type="file" onChange={(e) => handleFileChange(e, 'verso')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        {docVerso ? (
                          <>
                            <CheckCircle size={24} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium truncate max-w-full px-2">{docVerso.name}</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} />
                            <span className="text-xs">Verso do Documento</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={sectionHeader}><MapPin size={14} /> Endereço</div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className={labelClass}>Rua</label>
                    <input name="rua" value={formData.rua} onChange={handleChange} className={inputClass} placeholder="Nome da Rua" required={!isFreelancer} />
                  </div>
                  <div>
                    <label className={labelClass}>Número</label>
                    <input name="numero" value={formData.numero} onChange={handleChange} className={inputClass} placeholder="123" required={!isFreelancer} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Bairro</label>
                    <input name="bairro" value={formData.bairro} onChange={handleChange} className={inputClass} required={!isFreelancer} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Cidade</label>
                    <input name="cidade" value={formData.cidade} onChange={handleChange} className={inputClass} required={!isFreelancer} />
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-red hover:bg-primary-red-dark text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Cadastro'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center pb-8">
        </div>
      </div>
    </>
  );
};

export default PublicFormFuncionario;
