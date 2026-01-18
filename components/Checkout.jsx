import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Checkout = ({ plan, user, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Card, 3: Processing, 4: Result
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [pixData, setPixData] = useState(null);

    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        cpf: '',
        email: user?.email || '',
        mobilePhone: '', // Whatsapp
        postalCode: '',
        address: '',
        addressNumber: '',
        complement: '',
        province: '', // Bairro
        city: '',
        state: '',
        cardHolderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        ccv: ''
    });

    // Masks
    const maskCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    const maskPhone = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
    const maskCEP = (v) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
    const maskCard = (v) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'cpf') finalValue = maskCPF(value);
        if (name === 'mobilePhone') finalValue = maskPhone(value);
        if (name === 'postalCode') finalValue = maskCEP(value);
        if (name === 'cardNumber') finalValue = maskCard(value);

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // ViaCEP
    useEffect(() => {
        const cep = formData.postalCode.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (!data.erro) {
                        setFormData(prev => ({
                            ...prev,
                            address: data.logradouro,
                            province: data.bairro,
                            city: data.localidade,
                            state: data.uf
                        }));
                    }
                });
        }
    }, [formData.postalCode]);

    const validateStep1 = () => {
        if (!formData.name || !formData.cpf || !formData.postalCode || !formData.addressNumber || !formData.mobilePhone) return false;
        return true;
    };

    const validateStep2 = () => {
        if (paymentMethod === 'PIX') return true;
        if (!formData.cardHolderName || !formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.ccv) return false;
        return true;
    };

    const processPayment = async () => {
        setLoading(true);
        setStep(3);
        setError('');
        setStatusMessage('Iniciando processamento...');

        try {
            // Prepare Payload
            const payload = {
                customer: {
                    name: formData.name,
                    email: formData.email,
                    cpf: formData.cpf.replace(/\D/g, ''),
                    mobilePhone: formData.mobilePhone.replace(/\D/g, ''),
                    postalCode: formData.postalCode.replace(/\D/g, ''),
                    address: formData.address,
                    addressNumber: formData.addressNumber,
                    complement: formData.complement,
                    province: formData.province,
                    city: formData.city,
                    state: formData.state
                },
                payment: {
                    billingType: paymentMethod,
                    amount: plan.price,
                    installmentCount: plan.installments || 1, // Logic to be passed from parent
                    creditCard: {
                        holderName: formData.cardHolderName,
                        number: formData.cardNumber.replace(/\s/g, ''),
                        expiryMonth: formData.expiryMonth,
                        expiryYear: formData.expiryYear,
                        ccv: formData.ccv
                    },
                    creditCardHolderInfo: {
                        name: formData.name,
                        email: formData.email,
                        cpfCnpj: formData.cpf.replace(/\D/g, ''),
                        postalCode: formData.postalCode.replace(/\D/g, ''),
                        addressNumber: formData.addressNumber,
                        phone: formData.mobilePhone.replace(/\D/g, ''),
                    }
                },
                planType: plan.name // 'Mensal', 'Anual', etc.
            };

            setStatusMessage('Contatando banco...');

            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response:', text);
                throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}`);
            }

            if (!response.ok) throw new Error(data.error || 'Erro ao processar pagamento');

            // Success, start polling
            const paymentId = data.data.id;

            if (data.data.pix) {
                setPixData(data.data.pix);
                setStatusMessage('Aguardando pagamento...');
            }

            const isSubscription = plan.name === 'Mensal';
            await pollStatus(paymentId, isSubscription ? 'subscription' : 'payment');

        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro ao processar pagamento');
            setStep(4);
            setLoading(false);
        }
    };

    const pollStatus = async (id, type) => {
        setStatusMessage('Verificando status...');
        let attempts = 0;
        const maxAttempts = 30; // 60s total

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await fetch('/api/payment-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type })
                });

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Status check parse error:', text);
                    // Don't throw immediately on poll error, just wait for next attempt unless it's a critical auth error
                    if (response.status === 404) throw new Error('Pagamento não encontrado.');
                    return;
                }

                if (data?.status === 'APPROVED' || data?.status === 'CONFIRMED' || data?.status === 'ACTIVE') {
                    clearInterval(interval);
                    setLoading(false);
                    setStep(4);
                    if (onSuccess) onSuccess();
                } else if (data?.status === 'REJECTED') {
                    clearInterval(interval);
                    throw new Error('Pagamento recusado pela operadora.');
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    throw new Error('Tempo limite excedido. Verifique seu status mais tarde.');
                }
            } catch (e) {
                clearInterval(interval);
                setError(e.message);
                setStep(4);
                setLoading(false);
            }
        }, 2000);
    };

    if (step === 4) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    {error ? (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase">Falha</h2>
                            <p className="text-slate-400 mb-8 font-medium">{error}</p>
                            <button onClick={() => setStep(1)} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Tentar Novamente</button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase">Sucesso!</h2>
                            <p className="text-slate-400 mb-8 font-medium">Sua assinatura já está ativa.</p>
                            <button onClick={onClose} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Acessar Painel</button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F172A] border border-white/10 rounded-[30px] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">Checkout Blindado</h2>
                        <p className="text-xs text-slate-400 font-bold">Ambiente Seguro 256-bit</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all">✕</button>
                </div>

                <div className="p-8 overflow-y-auto custom-scroll">
                    {step === 3 ? (
                        <div className="text-center py-6">
                            {pixData ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4">
                                    <h3 className="text-2xl font-black text-white mb-6">Escaneie o QR Code</h3>

                                    <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-2xl shadow-[#F59E0B]/20">
                                        <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="Pix QR Code" className="w-48 h-48" />
                                    </div>

                                    <div className="max-w-xs mx-auto mb-8">
                                        <p className="text-slate-400 text-sm mb-2 font-medium">Ou copie o código para pagar:</p>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2 items-center">
                                            <input
                                                readOnly
                                                value={pixData.payload}
                                                className="bg-transparent text-white text-xs w-full outline-none font-mono opacity-60"
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(pixData.payload)}
                                                className="bg-[#F59E0B] hover:bg-[#D97706] text-black px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                            >
                                                Copiar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 text-[#F59E0B] animate-pulse">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-bold text-sm tracking-wide">Aguardando confirmação...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 border-4 border-[#F59E0B]/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-[#F59E0B] rounded-full border-t-transparent animate-spin"></div>
                                        <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-[#F59E0B] animate-pulse" />
                                    </div>
                                    <p className="text-xl font-bold text-white mb-2">{statusMessage}</p>
                                    <p className="text-sm text-slate-500 font-medium">Validando transação...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center text-black">
                                            <User size={18} strokeWidth={3} />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">Dados Pessoais</h3>
                                    </div>

                                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                        <input name="mobilePhone" value={formData.mobilePhone} onChange={handleChange} placeholder="WhatsApp" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                    </div>

                                    <div className="flex items-center gap-3 mt-8 mb-2">
                                        <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center text-black">
                                            <MapPin size={18} strokeWidth={3} />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">Endereço</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="CEP" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                        <input name="addressNumber" value={formData.addressNumber} onChange={handleChange} placeholder="Número" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                    </div>
                                    <input name="address" value={formData.address} disabled className="w-full p-4 bg-black/20 text-slate-400 border border-white/5 rounded-xl font-medium" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="province" value={formData.province} disabled className="w-full p-4 bg-black/20 text-slate-400 border border-white/5 rounded-xl font-medium" />
                                        <input name="city" value={formData.city} disabled className="w-full p-4 bg-black/20 text-slate-400 border border-white/5 rounded-xl font-medium" />
                                    </div>

                                    <button
                                        onClick={() => validateStep1() && setStep(2)}
                                        disabled={!validateStep1()}
                                        className="w-full mt-6 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-[#F59E0B]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                                    <div className="bg-white/5 p-1 rounded-2xl flex relative">
                                        <div className={`absolute inset-y-1 w-1/2 bg-[#F59E0B] rounded-xl transition-all duration-300 ${paymentMethod === 'CREDIT_CARD' ? 'left-1' : 'left-1/2 -ml-1'}`}></div>
                                        <button
                                            onClick={() => setPaymentMethod('CREDIT_CARD')}
                                            className={`relative z-10 w-1/2 py-3 font-black uppercase text-xs tracking-widest transition-colors ${paymentMethod === 'CREDIT_CARD' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Cartão
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('PIX')}
                                            className={`relative z-10 w-1/2 py-3 font-black uppercase text-xs tracking-widest transition-colors ${paymentMethod === 'PIX' ? 'text-black' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            PIX (Instantâneo)
                                        </button>
                                    </div>

                                    {paymentMethod === 'CREDIT_CARD' ? (
                                        <div className="space-y-4 animate-in fade-in">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center text-black">
                                                    <CreditCard size={18} strokeWidth={3} />
                                                </div>
                                                <h3 className="font-bold text-white text-lg">Dados do Cartão</h3>
                                            </div>

                                            <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Número do Cartão" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />
                                            <input name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} placeholder="Nome Impresso no Cartão" className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600" />

                                            <div className="grid grid-cols-3 gap-4">
                                                <input name="expiryMonth" value={formData.expiryMonth} onChange={handleChange} placeholder="MM" maxLength={2} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600 text-center" />
                                                <input name="expiryYear" value={formData.expiryYear} onChange={handleChange} placeholder="AAAA" maxLength={4} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600 text-center" />
                                                <input name="ccv" value={formData.ccv} onChange={handleChange} placeholder="CVV" maxLength={4} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl focus:border-[#F59E0B] outline-none font-medium placeholder:text-slate-600 text-center" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center animate-in fade-in">
                                            <div className="inline-block p-6 rounded-[30px] bg-emerald-500/10 border border-emerald-500/30 mb-6">
                                                <div className="text-4xl text-emerald-500 mb-2">⚡</div>
                                                <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Aprovação Imediata</p>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-2">Pagamento via PIX</h3>
                                            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                                                Ao confirmar, geraremos o <strong>QR Code</strong> e a <strong>Chave Copia e Cola</strong> para pagamento imediato. Liberação em segundos.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                                        <button onClick={() => setStep(1)} className="w-1/3 py-4 border border-white/10 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-xs">Voltar</button>
                                        <button
                                            onClick={processPayment}
                                            disabled={!validateStep2()}
                                            className="w-2/3 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            {paymentMethod === 'PIX' ? 'Gerar PIX' : 'Pagar Agora'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
