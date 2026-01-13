import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';

// --- CONEXÃO OFICIAL FIREBASE DO SÓCIO ---
const firebaseConfig = {
  apiKey: "AIzaSyCkcZe3E8Ww4Agp0o2kFI5LKHMQhn6-AcY",
  authDomain: "naaa-9e9ee.firebaseapp.com",
  projectId: "naaa-9e9ee",
  storageBucket: "naaa-9e9ee.firebasestorage.app",
  messagingSenderId: "770100571484",
  appId: "1:770100571484:web:b4c61fce0bc66113352599",
  measurementId: "G-1EGQR2N9WX"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'canaa-diamond-pro-official';

// Ícones Premium Imperial
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Money: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  Card: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  Doc: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Receipt: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" /></svg>,
  Diamond: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M11 3l-4 6 5 11 5-11-4-6" /><path d="M2 9h20" /></svg>,
  Users: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .004 5.411.001 12.045a11.811 11.811 0 0 0 1.592 5.918L0 24l6.135-1.61a11.751 11.751 0 0 0 5.911 1.594h.005c6.637 0 12.05-5.414 12.053-12.05a11.82 11.82 0 0 0-3.48-8.508" /></svg>
};

// PLANS STRUCTURE WITH BENEFITS
const PLANS = {
  mensal: {
    id: 'mensal',
    name: 'Mensal',
    price: 27.90,
    description: 'Menos de R$ 1/dia',
    highlighted: false,
    benefits: [
      'Contratos profissionais ilimitados',
      'Recibos com validade jurídica',
      'Cálculo de taxas e impostos',
      'Sincronização em nuvem',
      'Geração de PDF profissional',
      'Integração com WhatsApp',
      'Suporte por email (48h)'
    ]
  },
  anual: {
    id: 'anual',
    name: 'Anual',
    price: 197.00,
    description: 'Colheita Garantida',
    highlighted: true,
    savings: 'Economia de R$ 137,80 por ano',
    benefits: [
      '✨ Tudo do plano Mensal, mais:',
      '🎯 Suporte prioritário (24h)',
      '📊 Relatórios mensais automáticos',
      '💼 Backup automático de contratos',
      '🔔 Notificações de vencimento',
      '📱 App mobile (em breve)',
      '🎓 Acesso a treinamentos exclusivos',
      '💎 Badge "Cliente Premium"'
    ]
  },
  vitalicio: {
    id: 'vitalicio',
    name: 'Vitalício',
    price: 497.00,
    description: 'Pague uma vez, use para sempre',
    highlighted: false,
    benefits: [
      '🌟 Tudo do plano Anual, mais:',
      '♾️ Acesso vitalício garantido',
      '🚀 Todas as futuras atualizações',
      '👑 Suporte VIP prioritário',
      '🎁 Novos recursos em primeira mão',
      '💰 Melhor custo-benefício',
      '🔒 Sem mensalidades nunca mais',
      '🏆 Status de fundador'
    ]
  }
};

const App = () => {
  // --- SISTEMA E SEGURANÇA (ISOLAMENTO TOTAL) ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [syncStatus, setSyncStatus] = useState('online');
  const [authScreen, setAuthScreen] = useState('login'); // 'login' ou 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login/Signup form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [myReferralCode, setMyReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  // Payment states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // --- DADOS DO NEGÓCIO ---
  const [installments, setInstallments] = useState(6);
  const [cardBrand, setCardBrand] = useState('visa'); // visa ou elo
  const [sigPro, setSigPro] = useState(null);
  const [sigCli, setSigCli] = useState(null);
  const [activeSigner, setActiveSigner] = useState(null);
  const [items, setItems] = useState([
    { id: 1, type: 'mat', desc: 'Materiais de Obra', price: '1500' },
    { id: 2, type: 'ser', desc: 'Mão de Obra de Elite', price: '1000' }
  ]);
  const [data, setData] = useState({
    proName: '', proDoc: '', cliName: '', cliDoc: '',
    title: '', details: '', margin: 10, advance: 50, city: 'Cotia', warranty: '90 dias'
  });
  const [contractText, setContractText] = useState("");
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // --- 1. FIREBASE AUTH (LISTENER) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView('home'); // Redirect to dashboard when logged in
      }
    });
    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION FUNCTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setAuthError('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Senha incorreta');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Email inválido');
      } else {
        setAuthError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (password !== confirmPassword) {
      setAuthError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setAuthLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Este email já está em uso');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Senha muito fraca');
      } else {
        setAuthError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Generate Referral Code on Auth Change
  useEffect(() => {
    if (user && user.email) {
      // Simple hash-like code: COTIA-NAME (or email part)
      const namePart = (data.proName || user.email.split('@')[0]).replace(/\s+/g, '').toUpperCase().substring(0, 5);
      const code = `COTIA-${namePart}`;
      setMyReferralCode(code);
      // Mock referral count for demo
      setReferralCount(Math.floor(Math.random() * 5)); // 0-4
    }
  }, [user, data.proName]);

  // --- ASAAS PAYMENT FUNCTIONS ---
  const createAsaasPayment = async (planId) => {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const plan = PLANS[planId];
      // Note: In a real app we would use '/api/create-payment' but here we'll use a direct mock or the function call depending on setup.
      // Since we created the file at api/create-payment.js, Vercel will serve it at /api/create-payment

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: data.proName || user.email.split('@')[0],
            email: user.email,
            cpfCnpj: data.proDoc.replace(/\D/g, '') || '00000000000' // Ensure logic for CPF exists
          },
          billingType: 'PIX',
          value: plan.price,
          dueDate: new Date().toISOString().split('T')[0],
          description: `Assinatura ${plan.name} - Canaã Pro Diamond`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }

      const paymentResult = await response.json();
      setPaymentData(paymentResult);
      setShowCheckout(true);

      // Start polling for payment status
      startPaymentPolling(paymentResult.id);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setPaymentError(`Erro ao gerar PIX: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await fetch(`/api/payment-status?id=${paymentId}`);
      const result = await response.json();

      if (result.status === 'RECEIVED' || result.status === 'CONFIRMED') {
        // Pagamento confirmado!
        setPaymentData(prev => ({ ...prev, status: 'PAID' }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return false;
    }
  };

  const startPaymentPolling = (paymentId) => {
    const interval = setInterval(async () => {
      const isPaid = await checkPaymentStatus(paymentId);
      if (isPaid) {
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    // Stop polling after 15 minutes
    setTimeout(() => clearInterval(interval), 900000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Código PIX copiado! Cole no seu app de pagamento.');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Código PIX copiado! Cole no seu app de pagamento.');
    }
  };

  // --- 2. BUSCA DE DADOS (ISOLAMENTO POR UID) ---
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      // Caminho Seguro: /artifacts/canaa/users/UID/profile/settings
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const saved = snap.data();
        if (saved.data) setData(saved.data);
        if (saved.items) setItems(saved.items);
        if (saved.sigPro) setSigPro(saved.sigPro);
        if (saved.installments) setInstallments(saved.installments);
      }
    };
    fetchProfile();
  }, [user]);

  // --- 3. SALVAMENTO AUTOMÁTICO (NUVEM) ---
  useEffect(() => {
    if (!user) return;
    const saveCloud = async () => {
      setSyncStatus('saving');
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
        await setDoc(docRef, { data, items, sigPro, installments, cardBrand, updatedAt: new Date().toISOString() });
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('online'), 2000);
      } catch (e) { console.error("Sync Erro:", e); }
    };
    const t = setTimeout(saveCloud, 1500);
    return () => clearTimeout(t);
  }, [data, items, sigPro, installments, cardBrand, user]);

  // --- MOTOR FINANCEIRO (JUROS REAIS) ---
  const totals = useMemo(() => {
    const mat = items.filter(i => i.type === 'mat').reduce((a, b) => a + (parseFloat(b.price) || 0), 0);
    const ser = items.filter(i => i.type === 'ser').reduce((a, b) => a + (parseFloat(b.price) || 0), 0);
    const cost = mat + ser;
    const pixVal = cost * (1 + (parseFloat(data.margin) / 100));

    // Taxas Separadas: Visa (3.1% + 1.5%) vs Elo (4.5% + 2.1%)
    const feeBase = cardBrand === 'visa' ? 0.031 : 0.045;
    const feeMonth = cardBrand === 'visa' ? 0.015 : 0.021;
    const cardTotal = pixVal / (1 - (feeBase + ((installments - 1) * feeMonth)));

    return {
      pix: pixVal, lucro: pixVal - mat, multa: pixVal * 0.10, adv: pixVal * (parseFloat(data.advance) / 100),
      rem: pixVal - (pixVal * (parseFloat(data.advance) / 100)), perMonth: cardTotal / installments, cardTotal,
      taxaPercent: ((cardTotal - pixVal) / cardTotal) * 100
    };
  }, [items, data, installments, cardBrand]);

  const BRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // --- CONTRATO DINÂMICO ---
  useEffect(() => {
    if (!sigCli && !sigPro) {
      setContractText(`INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS\\n\\n1. PARTES:\\nCONTRATADA: ${data.proName || '____________'}, Doc: ${data.proDoc || '____________'}.\\nCONTRATANTE: ${data.cliName || '____________'}, Doc: ${data.cliDoc || '____________'}.\\n\\n2. OBJETO: Execução técnica de: ${data.title || 'Serviços'}. \\nDETALHAMENTO: ${data.details || 'Conforme acordado.'}.\\n\\n3. PAGAMENTO: Valor à vista de ${BRL(totals.pix)}. Ou parcelado no cartão em ${installments}x de ${BRL(totals.perMonth)} (Total: ${BRL(totals.cardTotal)}).\\n\\n4. RESPONSABILIDADES\\n• Prestador: Qualidade técnica e uso de equipamentos de segurança (EPI).\\n• Cliente: Fornecer materiais e livre acesso ao local.\\n\\n5. CANCELAMENTO E MULTA (Art. 603 CC)\\n• Se o CLIENTE cancelar sem justa causa, paga o serviço feito + 50% do valor restante.\\n• Se o PRESTADOR abandonar o serviço, responde por perdas e danos.\\n• Multa de 10% do total para qualquer descumprimento de cláusula.\\n\\n6. GARANTIA\\n• Construção/Estrutural: 5 anos (Art. 618 Código Civil).\\n• Reparos/Limpeza: 90 dias (Código de Defesa do Consumidor).\\n\\n7. ACEITE DIGITAL: Validado conforme MP 2.200-2/2001.`);
    }
  }, [data, totals, installments]);

  // --- MOTOR ASSINATURA BLINDADO ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSigner) return;
    const ctx = canvas.getContext('2d');
    const getPos = (e) => { const rect = canvas.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: cx - rect.left, y: cy - rect.top }; };
    const start = (e) => { isDrawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); if (e.touches) e.preventDefault(); };
    const move = (e) => { if (!isDrawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(); if (e.touches) e.preventDefault(); };
    canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', () => isDrawing.current = false);
    return () => { canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', move); };
  }, [activeSigner]);

  const saveSig = () => { if (activeSigner === 'pro') setSigPro(canvasRef.current.toDataURL()); else setSigCli(canvasRef.current.toDataURL()); setActiveSigner(null); };

  // --- GERADOR DE PDF ---
  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Header
    doc.setFillColor(59, 70, 133); // #3B4685 - Azul Médio
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CANAÃ PRO DIAMOND', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Contrato de Prestação de Serviços', pageWidth / 2, 30, { align: 'center' });

    // Contract content
    yPos = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const lines = contractText.split('\n');
    lines.forEach(line => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const splitText = doc.splitTextToSize(line || ' ', contentWidth);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 6;
    });

    // Signatures
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 20;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);

    // Contratada signature
    if (sigPro) {
      doc.addImage(sigPro, 'PNG', margin, yPos, 60, 20);
    }
    doc.line(margin, yPos + 25, margin + 60, yPos + 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.proName || 'A CONTRATADA', margin + 30, yPos + 30, { align: 'center' });

    // Contratante signature
    if (sigCli) {
      doc.addImage(sigCli, 'PNG', pageWidth - margin - 60, yPos, 60, 20);
    }
    doc.line(pageWidth - margin - 60, yPos + 25, pageWidth - margin, yPos + 25);
    doc.text(data.cliName || 'O CONTRATANTE', pageWidth - margin - 30, yPos + 30, { align: 'center' });

    // --- RODAPÉ OBRIGATÓRIO (GROWTH HACK) ---
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'normal');
    doc.text('Documento gerado pelo Canaã Pro | Escritório Digital para Profissionais de Obra', pageWidth / 2, footerY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text('Teste grátis em: canaapro.com', pageWidth / 2, footerY + 5, { align: 'center' });

    // Save PDF
    doc.save(`contrato-canaa-${data.cliName || 'cliente'}.pdf`);
  };

  // --- GERADOR DE PDF DO RECIBO ---
  const generateReceiptPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFillColor(59, 70, 133); // #3B4685 - Azul Médio
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CANAÃ PRO DIAMOND', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Recibo de Quitação', pageWidth / 2, 30, { align: 'center' });

    // Receipt content
    yPos = 60;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE QUITAÇÃO', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(20);
    doc.setTextColor(217, 119, 6);
    doc.text(BRL(totals.pix), pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');

    const receiptText = `Declaramos ter recebido de ${data.cliName || 'CONTRATANTE'} o valor integral de ${BRL(totals.pix)} referente aos serviços de ${data.title || 'Execução Profissional'} realizados em ${data.city || 'Cotia'}.`;
    const splitText = doc.splitTextToSize(receiptText, pageWidth - (margin * 2));
    doc.text(splitText, margin, yPos);

    // Date
    yPos += splitText.length * 8 + 20;
    const today = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`${data.city || 'Cotia'}, ${today}`, pageWidth / 2, yPos, { align: 'center' });

    // Signature
    yPos += 30;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);

    if (sigPro) {
      doc.addImage(sigPro, 'PNG', pageWidth / 2 - 30, yPos, 60, 20);
    }
    doc.line(pageWidth / 2 - 40, yPos + 25, pageWidth / 2 + 40, yPos + 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.proName || 'A CONTRATADA', pageWidth / 2, yPos + 30, { align: 'center' });

    // Save PDF
    // --- RODAPÉ OBRIGATÓRIO (GROWTH HACK) ---
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento gerado pelo Canaã Pro | Escritório Digital para Profissionais de Obra', pageWidth / 2, footerY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text('Teste grátis em: canaapro.com', pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`recibo-canaa-${data.cliName || 'cliente'}.pdf`);

    // Open WhatsApp after generating PDF
    setTimeout(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(`*RECIBO OFICIAL CANAÃ PRO*\n\nQuitação integral de ${BRL(totals.pix)} para ${data.title}\n\nPDF do recibo foi gerado e salvo automaticamente.`)}`, '_blank');
    }, 500);
  };

  // --- LOGIN/SIGNUP SCREENS ---
  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#0F172A] p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[0_0_40px_rgba(217,119,6,0.5)]">
              <Icons.Diamond />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              CANAÃ <span className="text-[#F59E0B]">PRO</span> | COTIA
            </h1>
            <p className="text-slate-400 text-sm mt-2">Escritório digital para profissionais de obra de Cotia e região.</p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-8 shadow-2xl">
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-2xl">
              <button
                onClick={() => { setAuthScreen('login'); setAuthError(''); }}
                className={`flex-1 py-3 rounded-xl font-black text-sm uppercase transition-all ${authScreen === 'login'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black shadow-lg'
                  : 'text-slate-400'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => { setAuthScreen('signup'); setAuthError(''); }}
                className={`flex-1 py-3 rounded-xl font-black text-sm uppercase transition-all ${authScreen === 'signup'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black shadow-lg'
                  : 'text-slate-400'
                  }`}
              >
                Cadastro
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="bg-rose-500/20 border border-rose-500 text-rose-200 px-4 py-3 rounded-2xl mb-4 text-sm font-bold">
                {authError}
              </div>
            )}

            {/* Login Form */}
            {authScreen === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seuemail@exemplo.com"
                    className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-2xl outline-none font-bold text-sm focus:border-[#D97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-2xl outline-none font-bold text-sm focus:border-[#D97706] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-4 rounded-2xl font-black text-sm uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seuemail@exemplo.com"
                    className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-2xl outline-none font-bold text-sm focus:border-[#D97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-2xl outline-none font-bold text-sm focus:border-[#D97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Digite a senha novamente"
                    className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-2xl outline-none font-bold text-sm focus:border-[#D97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#F59E0B] uppercase mb-2">Código de Indicação (Opcional)</label>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    placeholder="Ex: COTIA-JOAO"
                    className="w-full p-4 bg-black/30 text-[#F59E0B] border border-[#F59E0B]/30 rounded-2xl outline-none font-bold text-sm focus:border-[#F59E0B] transition-all uppercase tracking-widest placeholder:text-[#F59E0B]/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-4 rounded-2xl font-black text-sm uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Criando conta...' : 'Criar Conta'}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-6 font-bold">
            © 2026 Canaã Pro Diamond - Todos os direitos reservados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F172A] text-[#FEF3C7] overflow-hidden font-sans select-none border-t-[6px] border-[#D97706]">

      {/* HEADER SAPPHIRE & GOLD */}
      <header className="bg-[#1E293B] border-b border-[#D97706]/30 p-5 flex justify-between items-center z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-2.5 rounded-2xl text-black shadow-lg"><Icons.Home /></div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-white leading-none">CANAÃ <span className="text-[#F59E0B]">PRO</span> | COTIA</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Conectado: {user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-4 py-1.5 rounded-full text-[9px] font-black border border-rose-500/30 uppercase tracking-widest transition-all active:scale-95"
        >
          Sair
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scroll bg-gradient-to-b from-[#0F172A] to-[#1E3A8A]">

        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in">
            {/* PAINEL COLHEITA */}
            <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-[#D97706]/40 rounded-[30px] p-6 text-white shadow-2xl relative overflow-hidden text-center">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D97706]/10 blur-[60px] rounded-full"></div>
              <p className="text-[9px] font-black text-[#F59E0B] uppercase tracking-[0.3em] mb-3">Prosperidade em Cotia</p>
              <h2 className="text-4xl font-black text-emerald-400 tracking-tighter mb-2 drop-shadow-lg">{BRL(totals.lucro)}</h2>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-6 inline-block">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-wide">Mais de 1.284 contratos gerados em Cotia 🚀</p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-5 font-black text-sm">
                <div><p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Proteção</p><span className="text-[#F59E0B]">{BRL(totals.multa)}</span></div>
                <div><p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Valor Pix</p><span className="text-[#F59E0B]">{BRL(totals.pix)}</span></div>
              </div>
            </div>

            {/* MARGEM DE OURO */}
            <div className="bg-white/5 rounded-[25px] p-5 border border-[#D97706]/20 shadow-2xl space-y-4 text-center">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markup de Canaã: <span className="text-[#F59E0B]">{data.margin}%</span></h2>
              <input type="range" min="0" max="100" value={data.margin} onChange={e => setData({ ...data, margin: e.target.value })} className="w-full h-1.5 accent-[#D97706]" />
            </div>

            {/* FORMULÁRIO */}
            <div className="bg-white/10 border border-white/5 rounded-[30px] p-5 shadow-2xl space-y-4">
              <input placeholder="Título do Serviço Profissional" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full p-3 bg-white/5 text-white border border-white/10 rounded-xl outline-none font-bold text-[14px] focus:border-[#D97706]/50" />
              <textarea placeholder="Descrição Detalhada do Serviço (Isso vai para o contrato)..." value={data.details} onChange={e => setData({ ...data, details: e.target.value })} className="w-full p-3 bg-white/5 text-white border border-white/10 rounded-xl outline-none text-[14px] focus:border-[#D97706]/50" rows="3" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Seu Nome" value={data.proName} onChange={e => setData({ ...data, proName: e.target.value })} className="p-3 bg-white/5 text-white border border-white/10 rounded-xl outline-none text-[14px]" />
                <input placeholder="Cliente" value={data.cliName} onChange={e => setData({ ...data, cliName: e.target.value })} className="p-3 bg-white/5 text-white border border-white/10 rounded-xl outline-none text-[14px]" />
              </div>
            </div>
            <button onClick={() => setView('card')} className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-3 rounded-[25px] font-black text-sm shadow-2xl active:scale-95 transition-all uppercase">Avançar para Documentos</button>
          </div>
        )}

        {view === 'card' && (
          <div className="space-y-4 animate-in fade-in text-center pb-10 max-w-md mx-auto">
            <div className="bg-white rounded-[30px] p-5 text-slate-900 shadow-2xl border border-white/20">
              <h2 className="text-xs font-black text-[#D97706] uppercase tracking-widest mb-4">Taxas de Maquininha</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setCardBrand('visa')} className={`p-3 rounded-2xl border-2 font-black text-xs transition-all ${cardBrand === 'visa' ? 'border-[#D97706] bg-[#D97706] text-white shadow-xl' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>VISA / MASTER</button>
                <button onClick={() => setCardBrand('elo')} className={`p-3 rounded-2xl border-2 font-black text-xs transition-all ${cardBrand === 'elo' ? 'border-[#D97706] bg-[#D97706] text-white shadow-xl' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>ELO / OUTROS</button>
              </div>
              <div className="bg-[#0F172A] p-5 rounded-3xl text-white shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 px-3 py-1 text-[8px] font-black uppercase rounded-bl-xl text-white">Juros {cardBrand.toUpperCase()}</div>
                <span className="bg-amber-500 text-black px-3 py-1 rounded-full font-black text-xs inline-block">{installments}x Parcelas</span>
                <input type="range" min="1" max="12" value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-full h-1.5 accent-amber-500" />
                <h3 className="text-3xl font-black tracking-tighter text-[#FDE68A]">{BRL(totals.perMonth)}</h3>
                <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-[10px] font-black uppercase">
                  <div className="text-left"><p className="text-slate-400">Total Cartão</p><p className="text-white text-sm mt-1">{BRL(totals.cardTotal)}</p></div>
                  <div className="text-right"><p className="text-slate-400">Taxa Banco</p><p className="text-rose-400 text-sm mt-1">{totals.taxaPercent.toFixed(1)}%</p></div>
                </div>
              </div>
            </div>
            <button onClick={() => setView('contract')} className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-3 rounded-3xl font-black text-sm uppercase shadow-2xl active:scale-95 transition-all">Gerar Documentos</button>
          </div>
        )}

        {view === 'planos' && (
          <div className="space-y-6 animate-in zoom-in pb-10 text-center max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-[#F59E0B] to-[#B45309] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white border-4 border-black shadow-[0_0_40px_rgba(217,119,6,0.3)]">
              <Icons.Diamond />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Prosperidade em <span className="text-[#F59E0B]">Canaã</span></h2>
            <p className="text-slate-400 text-sm px-4">Escolha o plano ideal para seu negócio e comece a prosperar hoje</p>

            <div className="space-y-4 mt-8">
              {/* PLANO MENSAL */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left hover:border-[#F59E0B]/50 transition-all cursor-pointer group" onClick={() => setSelectedPlan('mensal')}>
                <div className="flex justify-between items-center text-white mb-2">
                  <div>
                    <h3 className="text-lg font-black uppercase group-hover:text-[#F59E0B] transition-colors">{PLANS.mensal.name}</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1">{PLANS.mensal.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#F59E0B] text-2xl">R$ {PLANS.mensal.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                {selectedPlan === 'mensal' && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in space-y-2">
                    {PLANS.mensal.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-[#F59E0B]">✓</span> {benefit}
                      </div>
                    ))}
                    <button onClick={(e) => { e.stopPropagation(); createAsaasPayment('mensal'); }} className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-xs mt-4 shadow-lg active:scale-95 transition-all">Assinar Mensal</button>
                  </div>
                )}
              </div>

              {/* PLANO ANUAL */}
              <div className="bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-1 rounded-3xl shadow-2xl relative overflow-hidden text-white border-4 border-black/20 cursor-pointer" onClick={() => setSelectedPlan('anual')}>
                <div className="bg-black/80 rounded-[20px] p-6 h-full backdrop-blur-sm hover:bg-black/60 transition-all">
                  <div className="absolute top-0 right-0 bg-[#F59E0B] text-black px-4 py-1 text-[10px] font-black uppercase rounded-bl-2xl">Recomendado</div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-2xl font-black uppercase leading-none text-[#F59E0B]">{PLANS.anual.name}</h3>
                      <p className="text-white/80 text-xs font-bold mt-2">{PLANS.anual.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] line-through text-slate-500">R$ 334,80</p>
                      <span className="font-black text-4xl text-white">R$ {PLANS.anual.price.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-2 mb-4 text-center">
                    <p className="text-xs font-bold text-[#F59E0B]">{PLANS.anual.savings}</p>
                  </div>

                  {selectedPlan === 'anual' ? (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in space-y-2 text-left">
                      {PLANS.anual.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-white">
                          <span className="text-[#F59E0B]">✓</span> {benefit}
                        </div>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); createAsaasPayment('anual'); }} className="w-full bg-[#F59E0B] text-black py-4 rounded-xl font-black uppercase text-sm mt-4 shadow-xl active:scale-95 transition-all">Assinar Anual</button>
                    </div>
                  ) : (
                    <button className="w-full bg-[#F59E0B] text-black py-3 rounded-xl font-black uppercase text-xs mt-2 shadow-lg">Ver Detalhes</button>
                  )}
                </div>
              </div>

              {/* PLANO VITALÍCIO */}
              <div className="bg-black/50 border-2 border-[#D97706]/40 p-6 rounded-3xl text-left hover:border-[#D97706] transition-all cursor-pointer" onClick={() => setSelectedPlan('vitalicio')}>
                <div className="flex justify-between items-center text-[#D97706] mb-2">
                  <div>
                    <h3 className="text-lg font-black uppercase">{PLANS.vitalicio.name}</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1">{PLANS.vitalicio.description}</p>
                  </div>
                  <div className="text-right font-black text-2xl">R$ {PLANS.vitalicio.price.toFixed(0)}</div>
                </div>
                {selectedPlan === 'vitalicio' && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in space-y-2">
                    {PLANS.vitalicio.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-[#F59E0B]">✓</span> {benefit}
                      </div>
                    ))}
                    <button onClick={(e) => { e.stopPropagation(); createAsaasPayment('vitalicio'); }} className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black py-3 rounded-xl font-black uppercase text-xs mt-4 shadow-lg active:scale-95 transition-all">Assinar Vitalício</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'promo' && (
          <div className="space-y-6 animate-in fade-in pb-10 text-center max-w-sm mx-auto">
            <div className="bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-1 rounded-[40px] shadow-2xl relative">
              <div className="bg-[#1E293B] rounded-[38px] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/20 blur-[50px] rounded-full"></div>

                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
                  <Icons.Users />
                </div>

                <h2 className="text-2xl font-black uppercase text-white mb-2">Ganhe Contratos <span className="text-[#F59E0B]">Grátis</span></h2>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">Convide colegas de obra para usar o Canaã Pro. Cada profissional ativo indicado libera contratos extras para você.</p>

                <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mb-6 relative group cursor-pointer" onClick={() => copyToClipboard(myReferralCode)}>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Seu Código de Indicação</p>
                  <div className="text-2xl font-black text-[#F59E0B] tracking-widest">{myReferralCode || 'COTIA-TESTE'}</div>
                  <div className="absolute inset-0 bg-[#F59E0B]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-black text-[#F59E0B] rounded-2xl">
                    COPIAR CÓDIGO
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-4 text-left">
                    <div className="bg-[#F59E0B] text-black w-10 h-10 rounded-full flex items-center justify-center font-black">1</div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Você Indica</p>
                      <p className="text-xs font-bold text-white">Amigo ganha 7 dias grátis</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-4 text-left">
                    <div className="bg-emerald-500 text-black w-10 h-10 rounded-full flex items-center justify-center font-black">2</div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Você Ganha</p>
                      <p className="text-xs font-bold text-white">+3 Contratos Premium</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Indicações Ativas</p>
                  <p className="text-3xl font-black text-white">{referralCount}</p>
                </div>
              </div>
            </div>
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Fala irmão, tudo certo?\nTô usando um sistema aqui em Cotia que gera contrato e assinatura digital direto no celular.\nCliente respeita muito mais.\n\nTô liberando teste grátis pra alguns profissionais da região.\nUse meu código: *${myReferralCode}*\n\nBaixa aí: canaapro.com`)}`, '_blank')} className="w-full bg-[#25D366] text-white py-4 rounded-[30px] font-black text-sm uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"><Icons.Zap /> Enviar no WhatsApp</button>
          </div>
        )}

        {view === 'receipt' && (
          <div className="space-y-6 animate-in zoom-in pb-10 text-center">
            <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden text-slate-900 border-2 border-[#D97706]/20">
              <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-12 text-white border-b border-[#D97706]/20">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#F59E0B] mb-4">Recibo de Quitação</h2>
                <h1 className="text-5xl font-black tracking-tighter">{BRL(totals.pix)}</h1>
              </div>
              <div className="p-10 space-y-10">
                <p className="text-xl font-bold uppercase text-slate-600 leading-loose text-justify">
                  Declaramos ter recebido de <b className="text-slate-900 underline decoration-amber-500 decoration-4 underline-offset-8">{data.cliName || 'CONTRATANTE'}</b> o valor integral pelos serviços de <b className="text-slate-900">{data.title || 'Execução Profissional'}</b> realizados em {data.city}.
                </p>
                <div className="pt-10 flex flex-col items-center">
                  {sigPro ? <img src={sigPro} className="max-h-24 opacity-90" /> : (
                    <button onClick={() => setActiveSigner('pro')} className="bg-[#D97706] text-black px-12 py-4 rounded-3xl font-black uppercase text-xs shadow-xl">Assinar Recibo</button>
                  )}
                  <div className="w-64 h-px bg-slate-300 mt-4"></div>
                  <p className="font-black uppercase text-sm mt-3">{data.proName || 'A CONTRATADA'}</p>
                </div>
              </div>
            </div>
            <button onClick={generateReceiptPDF} className="w-full bg-[#25D366] text-white py-3 rounded-[25px] font-black text-xs uppercase flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"><Icons.Zap /> Gerar PDF e Enviar WhatsApp</button>
          </div>
        )}

        {view === 'contract' && (
          <div className="space-y-4 animate-in fade-in text-slate-900 pb-10">
            <div className="bg-white rounded-[50px] border-2 border-[#D97706]/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-10 border-b border-[#D97706]/20 text-white flex justify-between items-center text-center">
                <h1 className="text-2xl font-black uppercase tracking-tighter text-[#F59E0B]">Canaã Papers</h1>
                <Icons.Diamond />
              </div>
              <div className="p-8 space-y-8">
                <div contentEditable onBlur={(e) => setContractText(e.currentTarget.innerText)} suppressContentEditableWarning={true} className="text-[14px] leading-relaxed text-slate-700 text-justify whitespace-pre-wrap p-7 rounded-[40px] border border-slate-200 outline-none bg-slate-50 shadow-inner min-h-[350px]">
                  {contractText}
                </div>
                {/* RODAPÉ VISUAL DO CONTRATO EDITÁVEL */}
                <div className="text-center opacity-60 mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-normal text-slate-400">Documento gerado pelo Canaã Pro | Escritório Digital para Profissionais de Obra</p>
                  <p className="text-[9px] font-bold text-[#D97706]">Teste grátis em: canaapro.com</p>
                </div>
                <div className="grid grid-cols-1 gap-12 pt-10 border-t border-slate-100 text-center">
                  <div className="flex flex-col items-center">
                    {sigPro ? <img src={sigPro} className="max-h-24 mb-1" /> : <button onClick={() => setActiveSigner('pro')} className="bg-[#D97706] text-black px-10 py-4 rounded-[25px] font-black uppercase text-[10px] shadow-xl">Assinar (Eu)</button>}
                    <div className="w-64 h-px bg-slate-300 mt-2"></div>
                    <p className="font-black text-[11px] uppercase mt-2">{data.proName || 'A CONTRATADA'}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {sigCli ? <img src={sigCli} className="max-h-24 mb-1" /> : <button onClick={() => setActiveSigner('cli')} className="bg-[#0F172A] text-white px-10 py-4 rounded-[25px] font-black uppercase text-[10px] shadow-xl">Assinar Cliente</button>}
                    <div className="w-64 h-px bg-slate-300 mt-2"></div>
                    <p className="font-black text-[11px] uppercase mt-2">{data.cliName || 'O CONTRATANTE'}</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={generatePDF} className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-3 md:py-5 rounded-[40px] font-black text-xs md:text-sm uppercase flex items-center justify-center gap-2 md:gap-4 shadow-2xl active:scale-95 transition-all"><Icons.Doc /> Gerar PDF do Contrato</button>
            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("*CONTRATO OFICIAL CANAÃ PRO*\n\n" + contractText)}`, '_blank')} className="w-full bg-[#25D366] text-white py-3 md:py-5 rounded-[40px] font-black text-xs md:text-sm uppercase flex items-center justify-center gap-2 md:gap-4 shadow-2xl active:scale-95 transition-all"><Icons.Zap /> Mandar Contrato no WhatsApp</button>
            <button onClick={() => setView('home')} className="w-full bg-white/10 text-slate-400 py-3 md:py-4 rounded-[40px] font-black text-[10px] md:text-xs uppercase border border-white/5 mt-2">Voltar ao Painel</button>
          </div>
        )}
      </main>

      {/* NAV BAR: SAPPHIRE & GOLD */}
      <nav className="shrink-0 bg-[#1E293B] border-t border-[#D97706]/30 p-4 flex justify-around items-center z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[{ id: 'home', icon: Icons.Home, label: 'Dash' }, { id: 'card', icon: Icons.Card, label: 'Cartão' }, { id: 'planos', icon: Icons.Diamond, label: 'Planos' }, { id: 'promo', icon: Icons.Users, label: 'Grátis' }, { id: 'contract', icon: Icons.Doc, label: 'Papéis' }, { id: 'receipt', icon: Icons.Receipt, label: 'Recibo' }].map(n => (
          <button key={n.id} onClick={() => setView(n.id)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === n.id ? 'text-[#F59E0B] scale-110' : 'text-slate-600'}`}>
            <n.icon /><span className="text-[8px] font-black uppercase tracking-tighter leading-none">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL CHECKOUT PIX */}
      {showCheckout && paymentData && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#1E293B] w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in border border-[#D97706]/30 relative">
            {paymentData.status === 'PAID' ? (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Icons.Zap />
                </div>
                <h2 className="text-2xl font-black uppercase text-white tracking-widest">Pagamento Aprovado!</h2>
                <p className="text-slate-400 text-sm">Seu plano foi ativado com sucesso.</p>
                <button onClick={() => { setShowCheckout(false); setView('home'); }} className="w-full bg-emerald-500 text-black py-4 rounded-3xl font-black uppercase text-sm shadow-xl hover:bg-emerald-400 transition-all">Começar a Usar</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-lg font-black uppercase text-[#F59E0B]">Pagamento via PIX</h3>
                  <button onClick={() => setShowCheckout(false)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                <div className="bg-white p-4 rounded-3xl border-4 border-white/10 mx-auto w-fit shadow-xl">
                  {paymentData.pix && paymentData.pix.encodedImage ? (
                    <img src={`data:image/png;base64,${paymentData.pix.encodedImage}`} alt="QR Code PIX" className="w-48 h-48 mix-blend-multiply" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-black font-bold text-xs bg-slate-200 rounded-xl">Carregando QR...</div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Código PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <input readOnly value={paymentData.pix?.payload || ''} className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-3 text-[10px] text-slate-300 font-mono text-ellipsis overflow-hidden" />
                    <button onClick={() => copyToClipboard(paymentData.pix?.payload)} className="bg-[#D97706] text-black px-4 rounded-xl font-bold text-xs hover:bg-[#F59E0B]">Copiar</button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#F59E0B] animate-pulse pt-4">
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Aguardando Pagamento...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ASSINATURA */}
      {activeSigner && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-8 text-center">
          <div className="bg-[#1E293B] w-full max-w-sm rounded-[70px] p-12 shadow-2xl animate-in zoom-in border-2 border-[#D97706]/20 text-white">
            <h3 className="text-2xl font-black uppercase mb-10 text-[#F59E0B] tracking-tighter">Assinatura de Canaã</h3>
            <div className="bg-white rounded-[50px] border-4 border-dashed border-[#D97706]/30 mb-10 overflow-hidden h-64 shadow-inner ring-[15px] ring-white/5">
              <canvas ref={canvasRef} width={320} height={256} className="w-full h-full cursor-crosshair touch-none bg-white" />
            </div>
            <button onClick={saveSig} className="w-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-black py-4 md:py-5 rounded-[30px] font-black text-sm md:text-base shadow-2xl active:scale-95 transition-all uppercase mb-4 tracking-tighter">Confirmar Firma</button>
            <button onClick={() => setActiveSigner(null)} className="w-full text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] hover:text-[#D97706]">Cancelar</button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        input, textarea, select { border: 1px solid rgba(217, 119, 6, 0.1) !important; transition: all 0.3s; color: #020617 !important; font-size: 16px !important; outline: none !important; }
        .custom-scroll::-webkit-scrollbar { display: none; }
        input[type="range"] { -webkit-appearance: none; background: #0a0a0a; height: 12px; border-radius: 20px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 35px; height: 35px; background: radial-gradient(circle, #F59E0B, #B45309); border-radius: 50%; border: 6px solid #1E293B; box-shadow: 0 0 25px rgba(217,119,6,0.4); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default App;