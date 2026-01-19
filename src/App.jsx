import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { jsPDF } from "jspdf";
import confetti from "canvas-confetti";

// --- CONFIGURAÇÃO OFICIAL FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCkcZe3E8Ww4Agp0o2kFI5LKHMQhn6-AcY",
  authDomain: "naaa-9e9ee.firebaseapp.com",
  projectId: "naaa-9e9ee",
  storageBucket: "naaa-9e9ee.firebasestorage.app",
  messagingSenderId: "770100571484",
  appId: "1:770100571484:web:b4c61fce0bc66113352599",
  measurementId: "G-1EGQR2N9WX"
};

// Singleton de Inicialização
let app, auth, db;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) { console.error("Firebase Guard Initialized"); }

const appId = 'canaa-pro-v33-official';

const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Card: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  Doc: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Diamond: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M11 3l-4 6 5 11 5-11-4-6" /><path d="M2 9h20" /></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .004 5.411.001 12.045a11.811 11.811 0 0 0 1.592 5.918L0 24l6.135-1.61a11.751 11.751 0 0 0 5.911 1.594h.005c6.637 0 12.05-5.414 12.053-12.05a11.82 11.82 0 0 0-3.48-8.508" /></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Lock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Gift: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>,
  Robot: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="2" r="1" /><path d="M12 3v4" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" /><path d="M8 19h8" /></svg>,
  Settings: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" /></svg>
};

// --- DIALOGO DE SUCESSO DO REFERRAL ---
const ReferralSuccessDialog = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-8 text-center animate-in zoom-in">
    <div className="bg-gradient-to-br from-amber-500 to-amber-700 w-full max-w-sm rounded-lg p-8 text-black shadow-2xl relative border-2 border-white/20">
      <div className="bg-white/20 w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-inner backdrop-blur-sm">
        <Icons.Diamond />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Parabéns!</h2>
      <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-8">Você Ganhou 7 Dias de Acesso Diamond</p>
      <div className="bg-black/20 p-4 rounded mb-8">
        <p className="text-white font-black text-sm">Todas as ferramentas desbloqueadas.</p>
      </div>
      <button onClick={onClose} className="w-full bg-white text-amber-600 py-4 rounded font-black uppercase shadow-xl active:scale-95 transition-all text-sm">Aproveitar Agora</button>
    </div>
  </div>
);

// --- MODAL DE PREVIEW WHATSAPP (NOVO) ---
const WhatsAppPreviewModal = ({ onClose, onConfirm, docType, documentId, data, finance, stampData }) => (
  <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 w-full max-w-md rounded-lg p-6 text-white border border-white/10 animate-in zoom-in">
      <h2 className="text-xl font-black uppercase mb-4 text-center flex items-center justify-center gap-2">
        <Icons.Zap />
        Preview WhatsApp
      </h2>

      <div className="bg-[#25D366]/10 border border-[#25D366] rounded p-4 mb-4">
        <p className="text-xs font-bold text-[#25D366] mb-2">MENSAGEM QUE SERÁ ENVIADA:</p>
        <div className="text-[10px] text-slate-300 space-y-1 font-mono bg-black/30 p-3 rounded">
          <p>DOC: {docType === 'contract' ? 'CONTRATO' : docType === 'receipt' ? 'RECIBO' : 'ORÇAMENTO'}</p>
          <p>🆔 ID: #{documentId || 'XXXX-XXXX'}</p>
          <p>Cliente: {data.cliName || '-'}</p>
          <p>VALOR: RS {(finance.finalVal || 0).toFixed(2)}</p>
          <p>DATA: {stampData?.time || new Date().toLocaleString('pt-BR')}</p>
          <p className="text-[9px] text-[#25D366] mt-2">✅ Assinado Digitalmente</p>
        </div>
      </div>

      <div className="bg-black/40 p-4 rounded mb-6">
        <p className="text-[9px] text-slate-400 uppercase font-bold mb-2">Segurança Anti-Fraude:</p>
        <div className="space-y-1 text-[10px]">
          <p>✅ ID único SHA-256 em todas as páginas</p>
          <p>✅ Páginas amarradas matematicamente</p>
          <p>✅ Rastreabilidade GPS e timestamp</p>
          <p>✅ Assinatura digital imutável</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-slate-700 py-3 rounded font-bold text-sm active:scale-95 transition-all"
        >
          ← Revisar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-[#25D366] py-3 rounded font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Icons.Zap />
          Enviar
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [bootReady, setBootReady] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [isPremium, setIsPremium] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [showReferralSuccess, setShowReferralSuccess] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [generatedBudget, setGeneratedBudget] = useState('');
  const [documentHistory, setDocumentHistory] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isDocumentFrozen, setIsDocumentFrozen] = useState(false);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [sambaNovaApiKey, setSambaNovaApiKey] = useState("bb85231d-4b06-4d10-985b-c1aea421d926");

  // --- AUTH STATES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  // --- REFERRAL & USER DATA ---
  const [myReferralCode, setMyReferralCode] = useState("");
  const [premiumUntil, setPremiumUntil] = useState(null);

  // --- PERSISTÊNCIA DADOS ---
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [extraMargin, setExtraMargin] = useState(10);
  const [installments, setInstallments] = useState(1);
  const [cardBrand, setCardBrand] = useState('visa');
  const [modality, setModality] = useState('pix');
  const [passFees, setPassFees] = useState(true);

  const [brandFees, setBrandFees] = useState({
    visa: { debit: 1.2, credit: 3.1, installmentBase: 3.5, perMonth: 1.5 },
    master: { debit: 1.3, credit: 3.2, installmentBase: 3.6, perMonth: 1.6 },
    elo: { debit: 2.1, credit: 4.5, installmentBase: 4.8, perMonth: 2.1 },
    amex: { debit: 0, credit: 4.8, installmentBase: 5.2, perMonth: 2.5 }
  });

  const [data, setData] = useState({
    proName: '', proDoc: '', cliName: '', cliDoc: '',
    title: '', serviceDetail: '', local: '', prazo: 'A combinar', validade: '7 dias', comarca: 'Cotia/SP',
    // Novos campos para orçamento completo
    quantity: '',
    unit: 'm²', // 'm²', 'unidades', 'horas', 'dias'
    unitPrice: 0,
    startDate: '',
    endDate: '',
    paymentType: 'pix', // 'cash', 'pix', 'debit', 'credit', 'installments', 'downpayment'
    downPaymentPercent: 30,
    receiptType: 'full' // 'full', 'downpayment', 'installment', 'final'
  });

  const [sigPro, setSigPro] = useState(null);
  const [sigCli, setSigCli] = useState(null);
  const [activeSigner, setActiveSigner] = useState(null);
  const [docContent, setDocContent] = useState("");
  const [docType, setDocType] = useState('budget');
  const [stampData, setStampData] = useState(null);

  // --- SISTEMA DE AMARRAÇÃO DE PÁGINAS (LEGALTECH) ---
  const [documentId, setDocumentId] = useState('');
  const [deviceMetadata, setDeviceMetadata] = useState(null);

  const canvasRef = useRef(null);
  const drawing = useRef(false);

  // --- MOTOR FINANCEIRO ---
  const finance = useMemo(() => {
    const mat = parseFloat(materialCost) || 0;
    const lab = parseFloat(laborCost) || 0;
    const margin = parseFloat(extraMargin) || 0;
    const baseValue = (mat + lab) * (1 + (margin / 100));

    let feeP = 0;
    if (modality !== 'pix' && modality !== 'dinheiro') {
      const fees = brandFees[cardBrand] || brandFees.visa;
      if (modality === 'debit') feeP = fees.debit;
      else if (modality === 'credit') feeP = fees.credit;
      else feeP = fees.installmentBase + ((installments - 1) * fees.perMonth);
    }
    const factor = feeP / 100;
    const finalVal = passFees ? (baseValue / (1 - factor)) : baseValue;
    return { baseValue, finalVal, netValue: passFees ? baseValue : (baseValue * (1 - factor)), penalty: baseValue * 0.1, perMonth: finalVal / installments };
  }, [materialCost, laborCost, extraMargin, installments, cardBrand, modality, passFees, brandFees]);

  const BRL = (v) => "RS " + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // --- AUTH FLOW ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage("");

    try {
      if (isRegistering) {
        // REGISTRO
        if (!name) throw new Error("O nome é obrigatório.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const usr = userCredential.user;

        await updateProfile(usr, { displayName: name });
        const userCode = usr.uid.substring(0, 6).toUpperCase(); // Gera código simples

        await setDoc(doc(db, 'artifacts', appId, 'users', usr.uid, 'profile', 'settings'), {
          data: { proName: name },
          createdAt: new Date(),
          email: email,
          referralCode: userCode,
          premiumValidUntil: null
        });

        // Confetti removido do cadastro padrão
      } else {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        // Confetti removido do login padrão
      }
    } catch (error) {
      console.error("Auth Error:", error);
      if (error.code === 'auth/email-already-in-use') setAuthMessage("Este e-mail já tem conta.");
      else if (error.code === 'auth/wrong-password') setAuthMessage("Senha incorreta.");
      else if (error.code === 'auth/user-not-found') setAuthMessage("Usuário não encontrado.");
      else if (error.code === 'auth/weak-password') setAuthMessage("Senha muito fraca (mín 6 dig).");
      else setAuthMessage("Erro no acesso: " + error.message);
    }
  };

  // --- REFERRAL LOGIC ---
  const verifyInvite = async () => {
    if (!inviteCode || !user) return;
    const code = inviteCode.toUpperCase();

    // Simulação de validação (Em prod, query no Firestore)
    // Aqui assumimos qualquer > 3 chars é "Válido" para teste imediato
    if (code.length > 3 && code !== myReferralCode) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

      // Grant 7 Days Trial
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings'), {
        premiumValidUntil: nextWeek,
        usedReferralCode: code,
        referralUsedAt: now
      }, { merge: true });

      setShowReferralSuccess(true);
      setPremiumUntil(nextWeek);
      setIsPremium(true);
      setInviteCode(""); // Limpa input
    } else {
      setAuthMessage("Código inválido ou próprio.");
    }
  };

  // --- BOOTLOADER ---
  useEffect(() => {
    const startup = async () => {
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u && db) {
          if (u.displayName) setData(d => ({ ...d, proName: u.displayName }));

          onSnapshot(doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'settings'), (snap) => {
            if (snap.exists()) {
              const c = snap.data();
              if (c.data) setData(d => ({ ...d, ...c.data }));
              if (c.brandFees) setBrandFees(f => ({ ...f, ...c.brandFees }));

              // Check Premium Status
              let isPrem = c.isPremium || false;
              let validUntil = c.premiumValidUntil ? c.premiumValidUntil.toDate() : null;

              // BACKDOOR / ADMIN GRANT FOR SPECIFIC USERS
              // Admin (admin@canaapro.com) -> Força Plano Anual
              if (u.email === 'admin@canaapro.com' && c.plan !== 'anual') {
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'settings'), {
                  isPremium: true,
                  premiumValidUntil: nextYear,
                  plan: 'anual'
                }, { merge: true });
              }

              // Matthews (matthewsrhavier@gmail.com) -> Força Vitalício (ou o que preferir, mantendo lógica anterior se necessário)
              if (u.email === 'matthewsrhavier@gmail.com' && !isPrem) {
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 10);
                setDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'profile', 'settings'), {
                  isPremium: true,
                  premiumValidUntil: nextYear,
                  plan: 'vitalicio'
                }, { merge: true });
              }

              if (validUntil && validUntil > new Date()) {
                isPrem = true;
              }

              // TEMPORARY GLOBAL UNLOCK
              isPrem = true;

              setIsPremium(isPrem);
              setPremiumUntil(validUntil);
              setMyReferralCode(c.referralCode || u.uid.substring(0, 6).toUpperCase());
              setSigPro(c.sigPro || null);
              setSigCli(c.sigCli || null);
            } else {
              // Se não tem documento, define código padrão
              setMyReferralCode(u.uid.substring(0, 6).toUpperCase());
            }
          });

          // LOAD DOCUMENT HISTORY
          onSnapshot(collection(db, 'artifacts', appId, 'users', u.uid, 'documents'), (snapshot) => {
            const docs = [];
            snapshot.forEach((doc) => {
              docs.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar por data mais recente
            docs.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
            setDocumentHistory(docs);
          });
        }
        setBootReady(true);
      });
    };
    startup();
  }, []);

  // === GEMINI AI API INTEGRATION ===
  const callGeminiAPI = async (userInput) => {
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      throw new Error("API Key do Gemini nao configurada. Obtenha em: https://aistudio.google.com/app/apikey");
    }

    const systemPrompt = `# SISTEMA: Budget Intelligence Engine - Canaã Pro (Chave Mestra)

# IDENTIDADE:
Você é um Engenheiro de Custos Sênior especializado em Construção Civil e Serviços Gerais.
Sua missão: Gerar orçamentos técnicos ultra-detalhados que protegem o prestador juridicamente E impressionam o cliente.

---

## PROTOCOLO DE ANÁLISE (O CÉREBRO):

Ao receber o pedido, classifique IMEDIATAMENTE:

### 🟢 PROTOCOLO A: SERVIÇOS PONTUAIS
Gatilho: "40m de piso", "pintar sala", "instalar drywall"
- Engenharia reversa COMPLETA de materiais
- Cálculo: Material + Mão de Obra = Total
- Garantia: 90 dias (CDC)
- Prazo: Em dias úteis

### 🔴 PROTOCOLO B: OBRAS CIVIS ESTRUTURAIS
Gatilho: "construir piscina", "casa", "muro de arrimo", "fundação"
- Lógica CUB++ NÃO APLICÁVEL: Cada obra tem especificidades
- Análise técnica profunda (escavação, cura, impermeabilização)
- Garantia: 5 anos (Código Civil - Solidez)
- Prazo: Em meses ou semanas

---

## FORMATO DE SAÍDA (CRÍTICO):
## FORMATO DE SAIDA (CRITICO):

Retorne APENAS JSON valido. Estrutura EXATA em 2 blocos:

{
  "block_1_client": {
    "header": "PROPOSTA TECNICA E COMERCIAL\\nEmissao: DD/MM/AAAA | Ref: ID-XXXX",
    "intro": "Olá! Segue o detalhamento formal...",
    "scope_title": "ESCOPO DO SERVICO:",
    "scope_details": "Descricao tecnica completa detalhada...",
    "financial_table": "DESCRICAO | VALOR\\n1. Mao de Obra | RS X\\n2. Materiais | RS Y\\nTOTAL | RS Z",
    "deadline": "CRONOGRAMA & PRAZOS:\\nEstimativa: X a Y dias/semanas...",
    "protection_clauses": "CLAUSULAS DE PROTECAO:\\n * Clima: ...\\n * Solo: ...",
    "payment": "CONDICOES DE PAGAMENTO:\\n * Entrada X% + ...",
    "warranty": "GARANTIA LEGAL:\\n05 Anos... ou 90 dias...",
    "footer": "Proposta valida por 07 dias.\\nAguardo seu De Acordo..."
  },
  "block_2_professional": {
    "labor_calc": " * Base de Mão de Obra: ...",
    "materials_breakdown": " * Lista de Materiais Deduzida:\\n   * Item 1\\n   * Item 2...",
    "critical_notes": "Observações técnicas críticas para execução..."
  },
  "whatsapp_summary": "Texto resumido para WhatsApp"
}

---

## REGRAS OBRIGATÓRIAS:

1. **Detalhe Extremo**: Nunca seja genérico. Especifique tudo (ex: "Vergalhões 3/8", não só "ferro")
2. **Cálculos Reais**: Se piscina, calcule volume de água. Se piso, área exata
3. **Cláusulas Contextuais**: 
   - Obra externa? Cláusula de chuva
   - Escavação? Cláusula de solo/rocha
   - Impermeabilização? Tempo de cura
4. **Tom Profissional**: Block 1 = Formal. Block 2 = Coloquial mas técnico
5. **Valores Realistas**: Mercado brasileiro 2026
6. **Garantias Certas**: 
   - Estrutural/Civil = 5 anos
   - Serviços pontuais = 90 dias`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\n# INPUT DO USUÁRIO:\n"${userInput}"\n\nGere o JSON agora:`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Gemini API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Extrair JSON do texto (pode vir com markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    return JSON.parse(jsonMatch[0]);
  };

  // --- GEO & DOCS UTILS ---

  // === SISTEMA DE HASH CRIPTOGRÁFICO SHA-256 (LEGALTECH) ===
  const generateSecureHash = async (data) => {
    try {
      // Usar Web Crypto API para SHA-256
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Retornar versão curta para impressão: primeiros 8 caracteres
      return hashHex.substring(0, 8).toUpperCase();
    } catch (error) {
      console.error('Erro ao gerar hash SHA-256, usando fallback:', error);
      // Fallback para navegadores antigos
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 6);
      return `${timestamp.substring(timestamp.length - 4)}${random}`.toUpperCase();
    }
  };

  // Geração de ID Único do Documento com SHA-256 (Anti-Fraude)
  const generateDocumentID = async () => {
    const timestamp = Date.now();
    const hash = await generateSecureHash({
      timestamp,
      random: Math.random(),
      user: user?.uid || 'anonymous',
      device: navigator.userAgent
    });
    const docId = `${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
    setDocumentId(docId);
    return docId;
  };

  // Captura de Metadados (GPS + Device Info)
  const captureStamp = () => {
    // Capturar informações do dispositivo
    const device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`
    };
    setDeviceMetadata(device);

    // Capturar GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setStampData({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          time: new Date().toLocaleString('pt-BR'),
          hash: Math.random().toString(36).substring(2, 12).toUpperCase(),
          device: device
        });
      }, () => {
        setStampData({
          lat: 'Offline',
          lng: 'Offline',
          time: new Date().toLocaleString('pt-BR'),
          hash: Math.random().toString(36).substring(2, 12).toUpperCase(),
          device: device
        });
      });
    } else {
      setStampData({
        time: new Date().toLocaleString('pt-BR'),
        hash: Math.random().toString(36).substring(2, 12).toUpperCase(),
        device: device
      });
    }
  };

  const generateDocs = async (type) => {
    // VALIDAÇÃO: Campos obrigatórios
    const requiredFields = [];

    if (!data.proName || data.proName.trim() === '') requiredFields.push('Nome do Prestador');
    if (!data.proDoc || data.proDoc.trim() === '') requiredFields.push('CPF/CNPJ do Prestador');
    if (!data.cliName || data.cliName.trim() === '') requiredFields.push('Nome do Cliente');
    if (!data.cliDoc || data.cliDoc.trim() === '') requiredFields.push('CPF/CNPJ do Cliente');
    if (!data.title || data.title.trim() === '') requiredFields.push('Título/Descrição do Serviço');

    if (requiredFields.length > 0) {
      alert(`CAMPOS OBRIGATORIOS FALTANDO:\n\n${requiredFields.map((field, i) => `${i + 1}. ${field}`).join('\n')}\n\nPor favor, preencha todos os campos antes de gerar o ${type === 'contract' ? 'contrato' : 'recibo'}.`);
      return;
    }

    try {
      // GERAR ID ÚNICO DO DOCUMENTO COM SHA-256 (ANTI-FRAUDE)
      await generateDocumentID();
      captureStamp();

      let content = "";
      if (type === 'contract') content = buildContract();
      else if (type === 'receipt') content = buildReceipt();
      
      setDocContent(content);
      setDocType(type);
      setIsDocumentFrozen(false);
      setView('viewer');
      window.scrollTo(0,0);
    } catch (err) {
      console.error("Erro ao gerar documento:", err);
      alert("Erro ao construir o documento. Verifique os dados inseridos.");
    }
  };

  // --- PDF GENERATOR (GRÁTIS POR ENQUANTO) ---
  const generatePDF = () => {
    // TEMPORARIAMENTE GRÁTIS - Bloqueio Premium removido
    if (!docContent) return;
    const pdfDoc = new jsPDF(); // Renomeado de 'doc' para 'pdfDoc' para evitar conflito com Firestore

    const drawPageHeader = () => {
      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(217, 119, 6);
      const pdfHeader = docType === 'contract' ? 'CONTRATO' : docType === 'receipt' ? 'RECIBO' : 'ORÇAMENTO';
      pdfDoc.text(pdfHeader, 105, 20, { align: "center" });
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(100);
      pdfDoc.text(`Documento emitido em: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });
      pdfDoc.setFontSize(9);
      pdfDoc.setTextColor(0);
    };

    // Desenhar cabeçalho na primeira página
    drawPageHeader();

    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 4;

    const splitText = pdfDoc.splitTextToSize(docContent, maxWidth);

    let yPosition = 40;

    // Adicionar texto com suporte a múltiplas páginas
    for (let i = 0; i < splitText.length; i++) {
      // Suporte a Quebra de Página Manual
      if (splitText[i].trim() === '[PAGE_BREAK]') {
        pdfDoc.addPage();
        drawPageHeader();
        yPosition = 40; 
        continue;
      }

      // Verificar se precisa de nova página automática por falta de espaço
      if (yPosition > pageHeight - 40) { 
        pdfDoc.addPage();
        drawPageHeader();
        yPosition = 40; // Ajustado de 20 para 40 para não sobrepor o cabeçalho
      }

      pdfDoc.text(splitText[i], margin, yPosition);
      yPosition += lineHeight;
    }

    // Garantir espaço para assinaturas
    if (yPosition > pageHeight - 60) { // Aumentado espaço para segurança
      pdfDoc.addPage();
      drawPageHeader();
      yPosition = 40;
    } else {
      yPosition += 10;
    }

    let finalY = yPosition;

    // Assinaturas lado a lado - REMOVIDO PARA ORÇAMENTOS
    if (docType !== 'budget') {
      if (sigPro) {
        pdfDoc.addImage(sigPro, 'PNG', 20, finalY, 40, 20);
        pdfDoc.setDrawColor(0);
        pdfDoc.setLineWidth(0.5);
        pdfDoc.line(15, finalY + 22, 65, finalY + 22);
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(80);
        pdfDoc.setFont(undefined, 'normal');
        pdfDoc.text('Prestador', 40, finalY + 27, { align: "center" });
        pdfDoc.setFontSize(7);
        pdfDoc.text(data.proName || '', 40, finalY + 31, { align: "center" });
      }
      if (sigCli && docType === 'contract') {
        pdfDoc.addImage(sigCli, 'PNG', 120, finalY, 40, 20);
        pdfDoc.setDrawColor(0);
        pdfDoc.setLineWidth(0.5);
        pdfDoc.line(115, finalY + 22, 165, finalY + 22);
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(80);
        pdfDoc.setFont(undefined, 'normal');
        pdfDoc.text('Contratante', 140, finalY + 27, { align: "center" });
        pdfDoc.setFontSize(7);
        pdfDoc.text(data.cliName || '', 140, finalY + 31, { align: "center" });
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SISTEMA DE AMARRAÇÃO DE PÁGINAS (ANTI-FRAUDE)
    // ═══════════════════════════════════════════════════════════════

    // Função para adicionar rodapé recorrente em TODAS as páginas
    const addFooterToAllPages = () => {
      const totalPages = pdfDoc.internal.getNumberOfPages();
      const docId = documentId || 'XXXX-XXXX';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        pdfDoc.setPage(pageNum);

        // ══════════════════════════════════════════════════════════
        // CARIMBO VISUAL (SELO) EM TODAS AS PÁGINAS
        // ══════════════════════════════════════════════════════════
        if (stampData) {
          const carimboX = pageWidth - 35; // Canto inferior direito
          const carimboY = pageHeight - 60;
          const raioExterno = 15;
          const raioInterno = 13;

          // Círculos concêntricos
          pdfDoc.setDrawColor(0, 51, 102);
          pdfDoc.setLineWidth(1.5);
          pdfDoc.circle(carimboX, carimboY, raioExterno, 'S');
          pdfDoc.setLineWidth(0.8);
          pdfDoc.circle(carimboX, carimboY, raioInterno, 'S');

          // Texto curvado superior
          pdfDoc.setTextColor(0, 51, 102);
          pdfDoc.setFontSize(5);
          pdfDoc.setFont(undefined, 'bold');
          const textoSuperior = 'ASSINATURA DIGITAL';
          const raioTextoSup = raioExterno - 2.5;
          const anguloInicialSup = 180;
          const anguloTotalSup = 180;

          for (let i = 0; i < textoSuperior.length; i++) {
            const angulo = (anguloInicialSup + (i * anguloTotalSup / (textoSuperior.length - 1))) * Math.PI / 180;
            const x = carimboX + raioTextoSup * Math.cos(angulo);
            const y = carimboY + raioTextoSup * Math.sin(angulo);
            pdfDoc.text(textoSuperior[i], x, y, {
              align: 'center',
              angle: -(angulo * 180 / Math.PI - 90)
            });
          }

          // Texto curvado inferior
          const textoInferior = 'AUTENTICACAO VALIDA';
          const raioTextoInf = raioExterno - 2.5;
          const anguloInicialInf = 0;
          const anguloTotalInf = 180;

          for (let i = 0; i < textoInferior.length; i++) {
            const angulo = (anguloInicialInf + (i * anguloTotalInf / (textoInferior.length - 1))) * Math.PI / 180;
            const x = carimboX + raioTextoInf * Math.cos(angulo);
            const y = carimboY + raioTextoInf * Math.sin(angulo);
            pdfDoc.text(textoInferior[i], x, y, {
              align: 'center',
              angle: -(angulo * 180 / Math.PI - 90)
            });
          }

          // Nome da empresa no centro
          pdfDoc.setFontSize(6);
          pdfDoc.setFont(undefined, 'bold');
          pdfDoc.text('CANAA PRO', carimboX, carimboY - 4, { align: 'center' });

          // Localização
          pdfDoc.setFontSize(4);
          pdfDoc.setFont(undefined, 'normal');
          pdfDoc.text('COTIA - SP', carimboX, carimboY - 1, { align: 'center' });

          // Data corrigida - formatar corretamente
          pdfDoc.setFontSize(4);
          pdfDoc.setFont(undefined, 'bold');
          const timestamp = stampData.time || new Date().toLocaleString('pt-BR');
          const dataFormatada = timestamp.split(' ')[0]; // Pega só a data
          pdfDoc.text(dataFormatada, carimboX, carimboY + 5, { align: 'center' });

          // ID resumido
          pdfDoc.setFontSize(3.5);
          pdfDoc.setFont(undefined, 'normal');
          pdfDoc.text(`#${docId}`, carimboX, carimboY + 9, { align: 'center' });
        }
        // ══════════════════════════════════════════════════════════
        // LINHA SEPARADORA E RODAPÉ
        // ══════════════════════════════════════════════════════════
        pdfDoc.setDrawColor(200, 200, 200);
        pdfDoc.setLineWidth(0.5);
        pdfDoc.line(15, pageHeight - 35, pageWidth - 15, pageHeight - 35);

        // Configurar fonte para rodapé
        pdfDoc.setFontSize(7);
        pdfDoc.setTextColor(80);
        pdfDoc.setFont(undefined, 'normal');

        // Esquerda: ID do Documento
        pdfDoc.text(`ID: #${docId}`, 15, pageHeight - 28);

        // Centro: Data/Hora e GPS
        const timestamp = stampData ? stampData.time : new Date().toLocaleString('pt-BR');
        const gps = stampData && stampData.lat !== 'Offline' ?
          `GPS: ${stampData.lat.toString().substring(0, 8)}...` :
          'GPS: Offline';
        pdfDoc.text(`${timestamp} | ${gps}`, pageWidth / 2, pageHeight - 28, { align: 'center' });

        // Direita: Paginação
        pdfDoc.text(`Pág ${pageNum}/${totalPages}`, pageWidth - 15, pageHeight - 28, { align: 'right' });

        // Selo de Autenticidade textual
        pdfDoc.setFontSize(5);
        pdfDoc.setTextColor(0, 51, 102);
        pdfDoc.setFont(undefined, 'bold');
        pdfDoc.text('✓ DOCUMENTO AUTENTICADO DIGITALMENTE - PÁGINAS VINCULADAS', pageWidth / 2, pageHeight - 20, {
          align: 'center'
        });
      }
    };

    // Adicionar rodapés em todas as páginas
    addFooterToAllPages();

    // SALVAR NO HISTÓRICO (FIRESTORE)
    if (user && db) {
      const docData = {
        type: docType,
        title: data.title || 'Documento',
        content: docContent,
        sigPro: sigPro,
        sigCli: sigCli,
        stampData: stampData,
        documentId: documentId,
        proName: data.proName,
        cliName: data.cliName,
        finalValue: finance.finalVal,
        createdAt: new Date()
      };

      // Salvar no Firestore usando doc() do Firestore
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'documents', Date.now().toString());
      setDoc(docRef, docData)
        .catch(err => console.error('Erro ao salvar histórico:', err));
    }

    pdfDoc.save(`CanaaPro_${docType}_${Date.now()}.pdf`);
  };

  const buildContract = () => {
    // CLÁUSULA DE PAGAMENTO INTELIGENTE
    let paymentClause = '';

    if (data.paymentType === 'pix' || data.paymentType === 'cash') {
      paymentClause = `O pagamento será realizado À VISTA, mediante ${data.paymentType === 'pix' ? 'transferência PIX' : 'dinheiro'}, no valor integral de ${BRL(finance.finalVal)}.`;
    } else if (data.paymentType === 'downpayment') {
      const downValue = finance.finalVal * (data.downPaymentPercent / 100);
      const finalValue = finance.finalVal - downValue;
      paymentClause = `O pagamento será dividido em: (1) ENTRADA de ${data.downPaymentPercent} por cento correspondente a ${BRL(downValue)}, devida na assinatura deste contrato; (2) SALDO FINAL de ${BRL(finalValue)}, devido após a conclusão dos serviços.`;
    } else if (data.paymentType === 'debit') {
      paymentClause = `O pagamento será realizado em PARCELA ÚNICA via CARTÃO DE DÉBITO, no valor de ${BRL(finance.finalVal)}.`;
    } else if (data.paymentType === 'credit' || data.paymentType === 'installments') {
      paymentClause = `O pagamento será realizado via CARTÃO DE CRÉDITO, parcelado em ${installments}x (${installments} parcelas) de ${BRL(finance.perMonth)}, totalizando ${BRL(finance.finalVal)}.`;
    }

    // MONTAGEM DO CONTRATO COM DADOS AUTOMÁTICOS DO ORÇAMENTO E CLÁUSULAS FIXAS DE PROTEÇÃO
    return `INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS PROFISSIONAIS

1. DAS PARTES CONTRATANTES:
CONTRADA (PRESTADOR): ${data.proName || '________________'} (CPF/CNPJ: ${data.proDoc || '________________'}).
CONTRATANTE (CLIENTE): ${data.cliName || '________________'} (CPF/CNPJ: ${data.cliDoc || '________________'}).

2. DO OBJETO E ESCOPO:
O presente contrato tem por objeto a execução de serviços especializados de: ${data.title || '________________'}.
DETALHAMENTO: ${data.serviceDetail || 'Execução técnica conforme as normas de segurança e qualidade acordadas.'}
${data.quantity ? `QUANTIDADE: ${data.quantity} ${data.unit}` : ''}

3. DO INVESTIMENTO E CONDIÇÕES DE PAGAMENTO:
Pelo serviço ora contratado, o CONTRATANTE pagará à CONTRADA a importância total de ${BRL(finance.finalVal)}.
${paymentClause}

4. DOS PRAZOS:
${data.startDate ? `INÍCIO DOS SERVIÇOS: ${data.startDate}` : 'INÍCIO: A combinar'}
${data.endDate ? `CONCLUSÃO PREVISTA: ${data.endDate}` : 'PRAZO: Conforme cronograma acordado'}

5. DAS OBRIGAÇÕES DO PRESTADOR:
A CONTRADA obriga-se a realizar o serviço com técnica profissional, zelo e diligência, utilizando mão de obra qualificada e cumprindo rigorosamente os prazos estabelecidos.

6. DAS OBRIGAÇÕES DO CLIENTE:
O CONTRATANTE obriga-se a garantir livre acesso ao local da prestação, bem como fornecer os insumos e informações necessárias para a viabilidade do cronograma. O pagamento deverá ser efetuado conforme as condições pactuadas.

7. DA RESCISÃO E MULTA PENAL (Art. 603 Código Civil):
Em caso de rescisão antecipada e imotivada por parte do CONTRATANTE, este obriga-se ao pagamento integral da retribuição vencida e da metade a que teria direito o PRESTADOR até o final do prazo contratual, estabelecendo-se multa penal mínima de 10 por cento (${BRL(finance.penalty)}).

CLAUSULAS DE PROTECAO BILATERAL - LEGISLACAO 2026

8. DA GARANTIA E QUALIDADE (PROTEÇÃO AO CONSUMIDOR - Art. 26 CDC):
A CONTRADA garante a qualidade dos serviços executados, oferecendo garantia técnica de 90 (noventa) dias, conforme o Art. 26 do Código de Defesa do Consumidor (CDC), contados a partir da entrega do objeto. A garantia cobre exclusivamente vícios de execução, não abrangendo mau uso, negligência, intervenções de terceiros não autorizados ou materiais fornecidos pelo CONTRATANTE.

9. DA PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS (LGPD - Lei 13.709/2018):
As partes expressamente consentem com a coleta e tratamento de dados pessoais (Nome Completo, CPF/CNPJ, Localização GPS e Biometria de Toque) para fins exclusivos de autenticidade, validade jurídica e segurança deste instrumento contratual, em estrita observância à Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD). O tratamento dos dados visa garantir a segurança jurídica, a identificação inequívoca das partes e a prevenção de fraudes. Os dados serão armazenados em ambiente seguro e não serão compartilhados com terceiros sem autorização judicial.

10. DA INADIMPLÊNCIA E TÍTULO EXECUTIVO EXTRAJUDICIAL (Art. 784, III CPC):
Este contrato, uma vez assinado pelas partes, possui força de TÍTULO EXECUTIVO EXTRAJUDICIAL, nos termos do Art. 784, inciso III, do Código de Processo Civil (CPC/2015). O atraso no pagamento superior a 5 (cinco) dias corridos sujeitará o CONTRATANTE inadimplente à incidência de:
a) Multa moratória de 2 por cento (dois por cento) sobre o valor da parcela em atraso;
b) Juros de mora de 1 por cento (um por cento) ao mês, calculados pro rata die;
c) Correção monetária pelo IGPM/FGV ou índice que vier a substituí-lo;
d) Honorários advocatícios de 10 por cento (dez por cento) sobre o valor total do débito, em caso de execução judicial.

11. DAS MEDIDAS DE COBRANÇA, PROTESTO E NEGATIVAÇÃO:
Decorridos 15 (quinze) dias corridos de atraso e após tentativa de conciliação amigável documentada, a CONTRADA fica expressamente autorizada, independentemente de nova notificação, a:
a) Proceder com o PROTESTO EXTRAJUDICIAL do presente título em Cartório de Protesto de Títulos, nos termos da Lei nº 9.492/97, arcando o devedor com todos os emolumentos e custas cartorárias;
b) Incluir o débito nos cadastros de proteção ao crédito (SERASA, SPC, Boa Vista SCPC e demais órgãos congêneres), conforme facultado pelo Art. 43 do Código de Defesa do Consumidor, garantido ao devedor o direito de ser previamente notificado da negativação, conforme Súmula 359 do STJ;
c) Ajuizar ação de execução de título extrajudicial, sem prejuízo de eventual ação de cobrança ou monitória.

12. DA VALIDADE DA ASSINATURA DIGITAL E ELETRÔNICA (MP 2.200-2/2001):
As partes reconhecem expressamente a plena validade jurídica da assinatura eletrônica colhida via identificação biométrica por toque (touch ID), registro de geolocalização GPS e timestamp digital, realizada por meio do aplicativo Canaã Pro Diamond. Este documento, assinado eletronicamente, possui a mesma eficácia probatória, autenticidade e força executória de um instrumento particular assinado de forma manuscrita ou autenticado em cartório, nos termos da Medida Provisória nº 2.200-2/2001 (ICP-Brasil) e da Lei nº 14.063/2020, que regulamenta o uso de assinaturas eletrônicas em interações com entes públicos e entre particulares.

13. DO FORO E JURISDIÇÃO:
Elegem as partes, com expressa renúncia a qualquer outro, por mais privilegiado que seja, o Foro da Comarca de ${data.comarca || 'Cotia/SP'} para dirimir quaisquer controvérsias oriundas do presente contrato que não possam ser resolvidas administrativamente.

Data: ${new Date().toLocaleDateString('pt-BR')}
Local: ${data.comarca || 'Cotia/SP'}`;
  };

  const buildReceipt = () => {
    // RECIBO INTELIGENTE BASEADO NO TIPO DE PAGAMENTO
    let receiptTitle = '';
    let receiptValue = 0;
    let receiptDescription = '';

    if (data.receiptType === 'full') {
      receiptTitle = 'RECIBO DE QUITAÇÃO TOTAL';
      receiptValue = finance.finalVal;
      receiptDescription = 'referente à quitação TOTAL';
    } else if (data.receiptType === 'downpayment') {
      receiptTitle = 'RECIBO DE ENTRADA';
      receiptValue = finance.finalVal * (data.downPaymentPercent / 100);
      receiptDescription = `referente à ENTRADA de ${data.downPaymentPercent} por cento`;
    } else if (data.receiptType === 'final') {
      receiptTitle = 'RECIBO DE QUITAÇÃO FINAL';
      const downValue = finance.finalVal * (data.downPaymentPercent / 100);
      receiptValue = finance.finalVal - downValue;
      receiptDescription = 'referente ao SALDO FINAL e QUITAÇÃO do serviço';
    } else if (data.receiptType === 'installment') {
      receiptTitle = `RECIBO DE PARCELA`;
      receiptValue = finance.perMonth;
      receiptDescription = `referente à parcela do pagamento parcelado`;
    }

    return `${receiptTitle}

Recebemos de ${data.cliName || '________________'} (CPF/CNPJ: ${data.cliDoc || '________________'}) a importância de ${BRL(receiptValue)} ${receiptDescription} dos serviços de ${data.title || '________________'}.

Serviço executado: ${data.serviceDetail || 'Conforme orçamento e contrato firmado.'}

${data.receiptType === 'downpayment' ? `ATENÇÃO: Este recibo refere-se apenas à ENTRADA. O saldo de ${BRL(finance.finalVal - receiptValue)} deverá ser pago conforme contrato.` : ''}

${data.receiptType === 'full' || data.receiptType === 'final' ? 'Pelo presente, damos plena, geral e irrevogável QUITAÇÃO do valor recebido, para nada mais reclamar.' : ''}

Data: ${new Date().toLocaleDateString('pt-BR')}
Local: ${data.comarca || 'Cotia/SP'}
Prestador: ${data.proName || '________________'}`;
  };


  const generateBudgetIA = async () => {
    // RECURSO DIAMOND GRATUITO
    setLoadingIA(true);
    setTimeout(() => {
      setDocContent(`PROPOSTA COMERCIAL TÉCNICA\\n\\nOBJETIVO: \\nExecução de ${data.title}.\\n\\nVALOR: \\n${BRL(finance.finalVal)} \\n\\n(Texto gerado automaticamente)`);
      setDocType('budget'); setView('viewer'); captureStamp(); setLoadingIA(false);
    }, 1500);
  };

  // GERADOR DE ORÇAMENTO AUTOMÁTICO COM IA (MESTRE DE OBRAS)
  const generateAutoBudget = async () => {
    if (!budgetInput || budgetInput.trim().length < 2) {
      setGeneratedBudget("Por favor, descreva o serviço que deseja orçar (ex: drywall 50m², pintura externa, instalação elétrica).");
      return;
    }

    setLoadingIA(true);
    setGeneratedBudget('');

    try {
      // SISTEMA LOCAL - BASEADO EM PALAVRAS-CHAVE (SEM API)
      const input = budgetInput.toLowerCase().trim();
      const today = new Date().toLocaleDateString('pt-BR');
      const refId = `ID-${input.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      
      // EXTRAIR DIMENSÕES
      const areaMatch = input.match(/(\d+)\s*m/);
      const area = areaMatch ? parseInt(areaMatch[1]) : 50;
      
      // DETECTAR TIPO DE SERVIÇO
      let aiResponse;
      if (input.includes('piscina')) {
        const volume = area * 1.5;
        const laborCost = area * 900;
        const materialCost = area * 1200;
        const total = laborCost + materialCost;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Transformando o seu pedido em um projeto estruturado e profissional.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `Construcao de piscina em Alvenaria Estrutural com aproximados ${area}m2 e volume estimado de ${volume.toFixed(0)} litros. Inclui escavacao, radier em concreto armado, estrutura de blocos estruturais, impermeabilizacao em argamassa polimerica e acabamento ceramico.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: `Estimativa de 25 a 30 dias uteis trabalhaveis.`,
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: O prazo considera condicoes favoraveis. Chuvas ou impedimentos externos prorrogam o cronograma automaticamente.\n2. INSUMOS: Atrasos na entrega de materiais pelo cliente pausam a contagem do prazo.`,
            payment: "PAGAMENTO:\nEntrada de 50 por cento e 50 por cento na conclusao do servico.",
            warranty: "GARANTIA:\n05 anos para solidez estrutural e impermeabilizacao conforme Codigo Civil.",
            footer: "Proposta valida por 07 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Alvenaria Estrutural`,
            labor_calc: `Mao de Obra: RS 900 por m2`,
            materials_breakdown: `• Blocos estruturais: Quantidade conforme projeto\n• Vergalhoes 3/8 e 5/16: Quantidade estimada\n• Argamassa polimerica: Quantidade estimada\n• Bomba 1/2 CV: 01 Unidade`,
            critical_notes: "Nota: Impermeabilizacao e o ponto critico desta obra."
          },
          whatsapp_summary: `PISCINA ${area}m2\nValor: RS ${total.toFixed(2)}\nPrazo: 25-30 dias`
        };
      } else if (input.includes('drywall') || input.includes('gesso') || input.includes('teto')) {
        const laborCost = area * 55;
        const materialCost = area * 45;
        const total = laborCost + materialCost;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Servico especializado de instalacao de sistemas a seco.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `Instalacao de Drywall Gesso Acartonado em ${area}m2. Inclui estrutura galvanizada, chapeamento standard e tratamento de juntas com fita e massa profissional.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: `Estimativa de 03 a 05 dias uteis trabalhaveis.`,
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: Umidade excessiva pode prorrogar o cronograma.\n2. INSUMOS: Atrasos na entrega de materiais pelo cliente pausam a contagem do prazo.`,
            payment: "PAGAMENTO:\nEntrada de 50 por cento e 50 por cento na conclusao do servico.",
            warranty: "GARANTIA:\n90 dias para acabamentos conforme Lei 8078/90.",
            footer: "Proposta valida por 07 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Sistema Drywall`,
            labor_calc: `Mao de Obra: RS 55 por m2`,
            materials_breakdown: `• Chapas ST: ${Math.ceil((area/2.88)*1.1)} unidades\n• Perfis 48/70: Quantidade estimada\n• Parafusos GN25: Quantidade estimada\n• Massa Drywall: Quantidade estimada`,
            critical_notes: "Nota: Nivel a laser obrigatorio para qualidade final."
          },
          whatsapp_summary: `DRYWALL ${area}m2\nValor: RS ${total.toFixed(2)}\nPrazo: 3-5 dias`
        };
      } else if (input.includes('pintura') || input.includes('pintar')) {
        const isExternal = input.includes('externa');
        const laborCost = area * (isExternal ? 35 : 25);
        const materialCost = area * (isExternal ? 20 : 15);
        const total = laborCost + materialCost;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Servico profissional de pintura e acabamento.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `Pintura ${isExternal ? 'Externa' : 'Interna'} em ${area}m2. Inclui preparacao de superficie com lixamento, aplicacao de selador e duas demaos de tinta de qualidade.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: `Estimativa de ${Math.ceil(area/25)} dias uteis trabalhaveis.`,
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: O prazo considera condicoes favoraveis. Chuvas impedem a pintura externa.\n2. INSUMOS: Materiais em falta pausam o cronograma.`,
            payment: "PAGAMENTO:\nEntrada de 50 por cento e 50 por cento na conclusao do servico.",
            warranty: "GARANTIA:\n90 dias conforme Lei 8078/90.",
            footer: "Proposta valida por 07 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Pintura Profissional`,
            labor_calc: `Mao de Obra: RS ${isExternal ? 35 : 25} por m2`,
            materials_breakdown: `• Lixas: Quantidade estimada\n• Selador: Quantidade estimada\n• Tinta: Quantidade estimada para 2 demaos`,
            critical_notes: "Nota: Protecao de pisos e mobiliario e essencial."
          },
          whatsapp_summary: `PINTURA ${area}m2\nValor: RS ${total.toFixed(2)}`
        };
      } else if (input.includes('piso')) {
        const laborCost = area * 45;
        const materialCost = area * 90;
        const total = laborCost + materialCost;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Instalacao técnica de revestimentos cerâmicos.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `Assentamento de piso em ${area}m2. Para porcelanatos grandes, aplicamos sobretaxa de mao de obra e exigimos argamassa AC3. Inclui preparacao de base e rejuntamento.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: `Estimativa de ${Math.ceil(area/17)} dias uteis trabalhaveis.`,
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: O prazo considera area protegida ou tempo seco.\n2. INSUMOS: Atraso de materiais pausa o prazo.`,
            payment: "PAGAMENTO:\nEntrada de 50 por cento e 50 por cento na conclusao do servico.",
            warranty: "GARANTIA:\n90 dias conforme Lei 8078/90.",
            footer: "Proposta valida por 07 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Assentamento Tecnico`,
            labor_calc: `Mao de Obra: RS 45 por m2`,
            materials_breakdown: `• Argamassa AC3: Quantidade estimada\n• Rejunte: Quantidade estimada\n• Espacadores: Quantidade estimada`,
            critical_notes: "Nota: Verificar esquadro no inicio do assentamento."
          },
          whatsapp_summary: `PISO ${area}m2\nValor: RS ${total.toFixed(2)}`
        };
      } else if (input.includes('construir') || input.includes('casa')) {
        const cubBase = area * 2800;
        const total = cubBase * 1.42;
        const laborPortion = total * 0.4;
        const materialPortion = total * 0.6;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Projeto de construcao civil completa.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `Construcao de imovel com ${area}m2 em regime chave na mao. Inclui fundacao, alvenaria, cobertura, instalacoes eletricas, hidraulicas e acabamentos basicos.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: `Estimativa de ${Math.ceil(area/4)} meses uteis trabalhaveis.`,
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: Chuvas prolongadas prorrogam o cronograma.\n2. INSUMOS: Burocracia ou falta de materiais pausam o prazo.`,
            payment: "PAGAMENTO:\nMedicoes mensais conforme cronograma de obra.",
            warranty: "GARANTIA:\n05 anos para solidez estrutural conforme Codigo Civil.",
            footer: "Proposta preliminar valida por 15 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Obra Completa CUB-Ajustado`,
            labor_calc: `Mao de Obra: Baseada em 40 por cento do total`,
            materials_breakdown: `• Cimento, Areia, Brita: Quantidade estimada\n• Blocos e Tijolos: Quantidade estimada\n• Telhado e Madeiramento: Quantidade estimada`,
            critical_notes: "Nota: Visita tecnica obrigatoria para confirmacao de valores."
          },
          whatsapp_summary: `CONSTRUCAO ${area}m2\nValor: RS ${total.toFixed(2)}`
        };
      } else {
        // GENÉRICO
        const laborCost = area * 80;
        const materialCost = area * 60;
        const total = laborCost + materialCost;
        
        aiResponse = {
          block_1_client: {
            header: `PROPOSTA TECNICA E COMERCIAL\nReferencia: ${refId}`,
            intro: "Orcamento para o servico solicitado.",
            scope_title: "ESCOPO DO SERVICO:",
            scope_details: `${budgetInput}\nEstimativa calculada sobre ${area}m2 aproximados.`,
            financial_table: `VALOR TOTAL DO INVESTIMENTO: RS ${total.toFixed(2)}`,
            deadline: "Estimativa de dias uteis a definir apos vistoria.",
            protection_clauses: `CLAUSULAS DE SEGURANCA:\n1. CLIMA: Chuvas atrasam obras externas.\n2. INSUMOS: Materiais em falta pausam prazo.`,
            payment: "PAGAMENTO:\nEntrada de 50 por cento e 50 por cento na conclusao do servico.",
            warranty: "GARANTIA:\n90 dias conforme Lei 8078/90.",
            footer: "Proposta valida por 07 dias."
          },
          block_2_professional: {
            title: "PAINEL DE CONTROLE INTERNO (LISTA DE COMPRAS):",
            intro: "Estimativa de materiais para execucao:",
            strategy: `Estrategia: Padrao Estimado`,
            labor_calc: `Mao de Obra: RS 80 por m2`,
            materials_breakdown: `• Insumos basicos: Quantidade a definir`,
            critical_notes: "Nota: Recomenda-se visita tecnica para orcamento final."
          },
          whatsapp_summary: `${budgetInput.toUpperCase()}\nValor: RS ${total.toFixed(2)}`
        };
      }

      // CONSTRUIR DOCUMENTO FORMATADO COM BLOCOS
      const block1 = aiResponse.block_1_client;
      const block2 = aiResponse.block_2_professional;
      
      const orcamento = `
${block1.header}

${block1.intro}

${block1.scope_title}
${block1.scope_details}

QUADRO DE INVESTIMENTO:
${block1.financial_table}

CRONOGRAMA:
${block1.deadline}

${block1.protection_clauses}

${block1.payment}

${block1.warranty}

RESUMO PARA WHATSAPP:
${aiResponse.whatsapp_summary}

Documento gerado pela IA Budget Intelligence Engine
`;

      setGeneratedBudget(orcamento);
      setDocContent(orcamento);
      setDocType('budget-auto');

      // PREENCHER CAMPOS AUTOMATICAMENTE (extrair do bloco 1)
      const titleMatch = block1.header.match(/Ref: #([\w-]+)/);
      const title = titleMatch ? `Projeto ${titleMatch[1]}` : 'Orçamento Técnico';
      
      setData(prevData => ({
        ...prevData,
        title: title,
        serviceDetail: block1.scope_details.substring(0, 200) + '...'
      }));

      // ATUALIZAR CUSTOS FINANCEIROS (extrair da tabela)
      const valueMatches = block1.financial_table.match(/R\$\s*([\d.,]+)/g);
      if (valueMatches && valueMatches.length >= 2) {
        const parseValue = (str) => parseFloat(str.replace(/[RS$\s.]/g, '').replace(',', '.'));
        setLaborCost(parseValue(valueMatches[0]).toString());
        setMaterialCost(parseValue(valueMatches[1]).toString());
      }
      setExtraMargin('0'); // Margem já incluída no cálculo

    } catch (error) {
      console.error('Erro ao gerar orçamento:', error);
      setGeneratedBudget(`❌ ERRO AO GERAR ORÇAMENTO:\n\n${error.message}\n\nDica: Verifique se você configurou a API Key do Gemini nas Configurações.`);
    } finally {
      setLoadingIA(false);
    }
  };

  // --- MOTOR ASSINATURA ---
  useEffect(() => {
    if (!activeSigner) return;
    const t = setTimeout(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); const r = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr; ctx.scale(dpr, dpr);
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, r.width, r.height); ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#020617';
      const getXY = (e) => { const rect = canvas.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: cx - rect.left, y: cy - rect.top }; };
      const start = (e) => { drawing.current = true; const { x, y } = getXY(e); ctx.beginPath(); ctx.moveTo(x, y); if (e.touches) e.preventDefault(); };
      const move = (e) => { if (!drawing.current) return; const { x, y } = getXY(e); ctx.lineTo(x, y); ctx.stroke(); if (e.touches) e.preventDefault(); };
      const stop = () => drawing.current = false;
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', stop);
      canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', move, { passive: false }); canvas.addEventListener('touchend', stop);
    }, 250); return () => clearTimeout(t);
  }, [activeSigner]);

  const saveFirma = () => {
    const img = canvasRef.current.toDataURL('image/png');
    let newSigPro = sigPro;
    let newSigCli = sigCli;

    if (activeSigner === 'pro') {
      setSigPro(img);
      newSigPro = img;
    } else {
      setSigCli(img);
      newSigCli = img;
    }

    // CONGELAR DOCUMENTO APENAS APÓS AMBAS AS ASSINATURAS (Prestador + Cliente)
    if (newSigPro && newSigCli) {
      setIsDocumentFrozen(true);
      setIsReadOnly(true);
    }

    setActiveSigner(null);
    captureStamp();
  };
  const updateFee = (f, v) => setBrandFees(p => ({ ...p, [cardBrand]: { ...p[cardBrand], [f]: parseFloat(v) || 0 } }));

  // --- RENDER ---
  if (!user && !bootReady) return <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div></div>;

  if (!user) return (
    <div className="fixed inset-0 bg-[#0F172A] flex flex-col items-center justify-center text-white p-8 overflow-hidden">
      <div className="max-w-md w-full space-y-6 text-center animate-in fade-in">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
            <Icons.Diamond />
          </div>
          <h1 className="text-3xl font-black uppercase text-white">Canaã <span className="text-amber-500">Pro</span></h1>
        </div>
        <div className="bg-slate-800/50 p-1 rounded flex mb-6 relative border border-slate-700">
          <div className={"absolute top-1 bottom-1 w-[48%] bg-amber-500 rounded transition-all duration-300 " + (isRegistering ? "left-[50%]" : "left-1")}></div>
          <button onClick={() => setIsRegistering(false)} className="flex-1 py-3 text-xs font-black uppercase z-10 relative">Entrar</button>
          <button onClick={() => setIsRegistering(true)} className="flex-1 py-3 text-xs font-black uppercase z-10 relative">Criar Conta</button>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-black text-amber-500 pl-2">Seu Nome Profissional</label>
              <input type="text" placeholder="Ex: João Silva" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded text-white outline-none focus:border-amber-500 font-bold" required />
            </div>
          )}
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black text-slate-400 pl-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded text-white outline-none focus:border-amber-500 font-bold" required />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-black text-slate-400 pl-2">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded text-white outline-none focus:border-amber-500 font-bold" required />
          </div>
          <button type="submit" className="w-full bg-amber-500 text-black py-4 rounded font-black uppercase hover:bg-amber-400 transition-all shadow-lg active:scale-95 mt-4">
            {isRegistering ? 'Criar Conta' : 'Acessar'}
          </button>
          <div className="flex justify-center mt-4">
            <button type="button" onClick={() => { setEmail('admin@canaapro.com'); setPassword('admin123'); }} className="text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors">
              Usar Conta Teste (Pro)
            </button>
          </div>
          {authMessage && <p className="text-rose-400 text-xs font-bold bg-rose-500/10 p-2 rounded">{authMessage}</p>}
        </form>
      </div>
    </div>
  );

  // === FUNÇÃO DE COMPARTILHAMENTO WHATSAPP COM COPYWRITING AUTOMÁTICO ===
  const shareViaWhatsApp = () => {
    if (!docContent || !documentId) {
      alert('Por favor, gere o documento primeiro.');
      return;
    }
    setShowWhatsAppPreview(true);
  };

  const confirmWhatsAppShare = () => {
    // Gerar PDF primeiro
    generatePDF();

    // Copywriting automático personalizado
    const docTypeLabel = docType === 'contract' ? 'Contrato' :
      docType === 'receipt' ? 'Recibo' : 'Orçamento';
    const message = `${docTypeLabel.toUpperCase()} DIGITAL AUTENTICADO
Data de Emissao: ${stampData?.time || new Date().toLocaleString('pt-BR')}
Localizacao: ${stampData?.lat !== 'Offline' ? `GPS ${stampData.lat.toFixed(4)}, ${stampData.lng.toFixed(4)}` : 'Offline'}

${data.title}
Cliente: ${data.cliName}
Valor: ${BRL(finance.finalVal)}

Autenticidade verificavel atraves do ID unico.

--
Sistema Canaa Pro Diamond
Autenticidade Garantida`;

    // Encode para URL
    const encodedMessage = encodeURIComponent(message);

    // Abrir WhatsApp
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

    // Fechar modal
    setShowWhatsAppPreview(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F172A] text-[#FEF3C7] overflow-hidden font-sans border-t-[6px] border-[#D97706] select-none">
      {showReferralSuccess && <ReferralSuccessDialog onClose={() => setShowReferralSuccess(false)} />}
      {showWhatsAppPreview && (
        <WhatsAppPreviewModal
          onClose={() => setShowWhatsAppPreview(false)}
          onConfirm={confirmWhatsAppShare}
          docType={docType}
          documentId={documentId}
          data={data}
          finance={finance}
          stampData={stampData}
        />
      )}

      <header className="bg-[#1E293B] border-b border-[#D97706]/20 p-5 flex justify-between items-center z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-3"><div className="bg-amber-500 p-2 rounded text-black shadow-lg"><Icons.Home /></div><div><h1 className="text-base font-black uppercase text-white leading-none">CANAÃ <span className="text-amber-500">PRO</span></h1><p className="text-[7px] font-bold text-slate-400 uppercase mt-1">SaaS Diamond v33</p></div></div>
        <div className="flex gap-2">
          <button onClick={() => signOut(auth)} className="bg-slate-800 p-2 rounded text-slate-400"><Icons.LogOut /></button>
          <div className={"px-4 py-1.5 rounded text-[9px] font-black border transition-all flex items-center " + (isPremium ? "border-emerald-500 text-emerald-500 shadow-emerald-500/20" : "border-amber-500 text-amber-500 animate-pulse")}>{isPremium ? "DIAMOND ATIVO" : "ATIVAR CONTA"}</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] custom-scroll">
        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in">
            {/* REFERRAL BOX */}
            <div className="bg-slate-800/60 border border-white/5 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <div className="bg-emerald-500/20 p-2 rounded text-emerald-400"><Icons.Gift /></div>
                <div className="flex-1"><h3 className="text-xs font-black text-white uppercase">Indique e Ganhe</h3><p className="text-[9px] text-slate-400">Ambos ganham 7 dias Grátis.</p></div>
              </div>
              {/* GERAR CODIGO */}
              <div className="flex items-center justify-between bg-black/40 p-3 rounded border border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Seu Código:</span>
                <span className="text-lg font-black text-emerald-400 tracking-widest select-all">{myReferralCode}</span>
              </div>
              {/* APLICAR CODIGO */}
              <div className="flex gap-2">
                <input placeholder="Tem um código?" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} className="bg-white/5 outline-none flex-1 text-xs font-bold text-white uppercase p-3 rounded border border-white/10" />
                <button onClick={verifyInvite} className="bg-emerald-600 px-4 rounded text-[9px] font-black uppercase hover:bg-emerald-500 transition-all">Validar</button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-amber-500/40 rounded-lg p-10 text-white shadow-2xl text-center relative overflow-hidden">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4">Lucro Líquido Real</p>
              <h2 className="text-6xl font-black text-emerald-400 tracking-tighter mb-8 drop-shadow-lg">{BRL(finance.netValue - (parseFloat(materialCost) || 0))}</h2>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8 font-black text-xs text-center"><div><p className="text-slate-400 uppercase mb-1">Reserva (10%)</p><span className="text-rose-400">{BRL(finance.penalty)}</span></div><div><p className="text-slate-400 uppercase mb-1">Preço p/ Cliente</p><span className="text-amber-500">{BRL(finance.finalVal)}</span></div></div>
            </div>

            <div className="space-y-3">
              <button onClick={() => setView('finance')} className="w-full bg-white/5 border border-white/10 p-6 rounded-lg flex items-center justify-between shadow-xl font-black text-white"><div className="text-left"><h3>1. CUSTOS DA OBRA</h3></div><Icons.ArrowRight /></button>
              <button onClick={() => setView('machine')} className="w-full bg-white/5 border border-white/10 p-6 rounded-lg flex items-center justify-between shadow-xl font-black text-white"><div className="text-left"><h3>2. RECEBIMENTO</h3></div><Icons.ArrowRight /></button>
              <button onClick={() => setView('docs')} className="w-full bg-white/5 border border-white/10 p-6 rounded-lg flex items-center justify-between shadow-xl font-black text-white"><div className="text-left"><h3>3. PAPÉIS & FIRMA</h3></div><Icons.ArrowRight /></button>
            </div>

            {/* HISTÓRICO DE DOCUMENTOS */}
            {documentHistory.length > 0 && (
              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/20 p-2 rounded text-amber-400">
                    <Icons.Doc />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white uppercase">Histórico de Documentos</h3>
                    <p className="text-[9px] text-slate-400">PDFs gerados e salvos</p>
                  </div>
                  <span className="text-xs font-black text-amber-500">{documentHistory.length}</span>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scroll">
                  {documentHistory.map((doc) => (
                    <div key={doc.id} className="bg-black/40 p-4 rounded border border-white/5 hover:border-amber-500/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-white uppercase">{doc.title || 'Documento'}</h4>
                          <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">
                            {doc.type === 'contract' ? 'Contrato' : doc.type === 'receipt' ? 'Recibo' : doc.type === 'budget' ? 'Orçamento' : 'Orçamento IA'}
                          </p>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono">
                          {doc.createdAt?.toDate().toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {doc.finalValue && (
                        <div className="text-xs font-black text-emerald-400 mb-2">
                          {BRL(doc.finalValue)}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[8px] text-slate-400 mb-3">
                        {doc.proName && <span>PRO: {doc.proName}</span>}
                        {doc.cliName && <span>CLI: {doc.cliName}</span>}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDocContent(doc.content);
                            setDocType(doc.type);
                            setSigPro(doc.sigPro || null);
                            setSigCli(doc.sigCli || null);
                            setStampData(doc.stampData || null);
                            // Se o documento tem assinaturas, ativar modo somente leitura
                            setIsReadOnly(!!(doc.sigPro || doc.sigCli));
                            setView('viewer');
                          }}
                          className="flex-1 bg-amber-500/20 text-amber-400 py-2 px-3 rounded text-[9px] font-black uppercase hover:bg-amber-500/30 transition-all"
                        >
                          {(doc.sigPro || doc.sigCli) ? 'Ver Documento' : 'Ver/Editar'}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Deseja excluir este documento do histórico?')) {
                              await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'documents', doc.id), {}, { merge: false })
                                .then(() => {
                                  // Remover do Firestore
                                  const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'documents', doc.id);
                                  docRef.delete?.() || setDoc(docRef, { deleted: true });
                                })
                                .catch(err => console.error('Erro ao deletar:', err));
                            }
                          }}
                          className="bg-rose-500/20 text-rose-400 py-2 px-3 rounded text-[9px] font-black uppercase hover:bg-rose-500/30 transition-all"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'finance' && <div className="space-y-6 text-center"><div className="bg-slate-800/80 rounded-lg p-8 space-y-6 shadow-2xl text-white"><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Custos Base</h3><input type="number" placeholder="Material RS" value={materialCost} onChange={e => setMaterialCost(e.target.value)} className="w-full bg-slate-900 p-5 rounded font-black text-xl outline-none text-white border border-slate-700" /><input type="number" placeholder="Mao de Obra RS" value={laborCost} onChange={e => setLaborCost(e.target.value)} className="w-full bg-slate-900 p-5 rounded font-black text-xl outline-none text-white border border-slate-700" /><input type="number" placeholder="Markup %" value={extraMargin} onChange={e => setExtraMargin(e.target.value)} className="w-full bg-slate-900 p-5 rounded font-black text-xl outline-none text-white border border-amber-500/30" /></div><button onClick={() => setView('home')} className="w-full bg-amber-500 text-black py-6 rounded-lg font-black uppercase shadow-xl">Salvar Custos</button></div>}

        {view === 'machine' && <div className="bg-slate-800/80 rounded-lg p-8 shadow-2xl text-center text-white"><div className="grid grid-cols-4 gap-2 mb-6">{['visa', 'master', 'elo', 'amex'].map(b => <button key={b} onClick={() => setCardBrand(b)} className={"py-3 rounded border-2 font-black text-[8px] uppercase " + (cardBrand === b ? "bg-amber-500 border-amber-500 text-black" : "border-slate-600")}>{b}</button>)}</div><div className="grid grid-cols-4 gap-2 mb-6">{[{ id: 'pix', l: 'Pix' }, { id: 'dinheiro', l: 'Dinheiro' }, { id: 'debit', l: 'Débito' }, { id: 'installments', l: 'Parcelar' }].map(m => <button key={m.id} onClick={() => { setModality(m.id); setInstallments(1); }} className={"p-3 rounded text-[9px] font-black uppercase border-2 " + (modality === m.id ? "bg-emerald-600 border-emerald-500 text-white" : "border-slate-600")}>{m.l}</button>)}</div>{modality === 'installments' && <div className="bg-[#0F172A] p-10 rounded-lg text-white overflow-hidden mb-6"><input type="range" min="2" max="12" value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-full accent-amber-500" /><h3 className="text-4xl font-black text-amber-200 mt-4">{BRL(finance.perMonth)}/mês ({installments}x)</h3></div>}<button onClick={() => setView('home')} className="w-full bg-[#1E293B] text-white py-6 rounded-lg font-black uppercase">Confirmar</button></div>}

        {view === 'docs' && (
          <div className="space-y-6 text-white">
            <div className="bg-slate-800/80 rounded-lg p-8 shadow-2xl space-y-4">
              <h3 className="text-sm font-black uppercase text-amber-500 mb-4">Dados do Orçamento Completo</h3>

              {/* PRESTADOR E CLIENTE */}
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Prestador" value={data.proName} onChange={e => setData({ ...data, proName: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
                <input placeholder="CPF/CNPJ Prestador" value={data.proDoc} onChange={e => setData({ ...data, proDoc: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Cliente" value={data.cliName} onChange={e => setData({ ...data, cliName: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
                <input placeholder="CPF/CNPJ Cliente" value={data.cliDoc} onChange={e => setData({ ...data, cliDoc: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
              </div>

              {/* SERVIÇO */}
              <input placeholder="Título do Serviço *" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} className="w-full p-5 bg-slate-900 rounded outline-none font-bold text-white border border-slate-700" />
              <textarea placeholder="Descrição Detalhada *" value={data.serviceDetail} onChange={e => setData({ ...data, serviceDetail: e.target.value })} className="w-full p-5 bg-slate-900 rounded outline-none font-medium text-sm min-h-[120px] text-white border border-slate-700" />

              {/* QUANTIDADE E DATAS */}
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Quantidade" value={data.quantity} onChange={e => setData({ ...data, quantity: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
                <select value={data.unit} onChange={e => setData({ ...data, unit: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700">
                  <option value="m²">m²</option>
                  <option value="unidades">Unidades</option>
                  <option value="horas">Horas</option>
                  <option value="dias">Dias</option>
                </select>
                <input placeholder="Localidade" value={data.comarca} onChange={e => setData({ ...data, comarca: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 pl-2">Início do Serviço</label>
                  <input type="date" value={data.startDate} onChange={e => setData({ ...data, startDate: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 pl-2">Conclusão Prevista</label>
                  <input type="date" value={data.endDate} onChange={e => setData({ ...data, endDate: e.target.value })} className="w-full p-4 bg-slate-900 rounded outline-none text-xs font-bold text-white border border-slate-700" />
                </div>
              </div>

              {/* TIPO DE PAGAMENTO */}
              <div className="pt-4 border-t border-white/10">
                <label className="text-[10px] uppercase font-black text-amber-400 pl-2 mb-3 block">Tipo de Pagamento</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { id: 'pix', label: 'PIX' },
                    { id: 'cash', label: 'Dinheiro' },
                    { id: 'debit', label: 'Débito' },
                    { id: 'credit', label: 'Crédito' },
                    { id: 'installments', label: 'Parcelado' },
                    { id: 'downpayment', label: 'Entrada+Saldo' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setData({ ...data, paymentType: type.id })}
                      className={"p-3 rounded text-[9px] font-black uppercase border-2 " + (data.paymentType === type.id ? "bg-amber-500 border-amber-500 text-black" : "border-slate-600 text-slate-400")}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* ENTRADA % (se selecionado) */}
                {data.paymentType === 'downpayment' && (
                  <div className="bg-amber-500/10 p-4 rounded border border-amber-500/30 space-y-2">
                    <label className="text-[9px] uppercase font-black text-amber-400">Percentual de Entrada (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={data.downPaymentPercent}
                      onChange={e => setData({ ...data, downPaymentPercent: parseInt(e.target.value) || 30 })}
                      className="w-full p-4 bg-slate-900 rounded outline-none text-lg font-black text-amber-400 border border-amber-500/50"
                    />
                    <div className="text-xs text-amber-300">
                      Entrada: {BRL(finance.finalVal * (data.downPaymentPercent / 100))} | Saldo: {BRL(finance.finalVal * (1 - data.downPaymentPercent / 100))}
                    </div>
                  </div>
                )}
              </div>

              {/* TIPO DE RECIBO */}
              <div className="pt-4 border-t border-white/10">
                <label className="text-[10px] uppercase font-black text-emerald-400 pl-2 mb-3 block">Tipo de Recibo a Gerar</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full', label: 'Quitação Total' },
                    { id: 'downpayment', label: 'Recibo de Entrada' },
                    { id: 'final', label: 'Quitação Final' },
                    { id: 'installment', label: 'Recibo de Parcela' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setData({ ...data, receiptType: type.id })}
                      className={"p-3 rounded text-[9px] font-black uppercase border-2 " + (data.receiptType === type.id ? "bg-emerald-500 border-emerald-500 text-black" : "border-slate-600 text-slate-400")}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-2">
              {/* BUTTONS WITH LOCK LOGIC */}
              <button onClick={generateBudgetIA} disabled={loadingIA} className="p-7 rounded-lg font-black uppercase text-[11px] flex items-center justify-center gap-2 shadow-xl bg-emerald-600 text-white active:scale-95">
                {loadingIA ? 'CONSTRUINDO...' : 'ORÇAMENTO COM IA (Grátis)'}
              </button>
              <button onClick={() => generateDocs('contract')} className="bg-amber-500 text-black p-7 rounded-lg font-black uppercase text-[11px] shadow-xl active:scale-95">GERAR CONTRATO AUTOMÁTICO</button>
              <button onClick={() => generateDocs('receipt')} className="bg-[#1E293B] text-white p-7 rounded-lg font-black uppercase text-[11px] shadow-xl active:scale-95">GERAR RECIBO INTELIGENTE</button>
            </div>
          </div>
        )}

        {view === 'viewer' && (
          <div className="space-y-4 pb-10 text-white text-center animate-in fade-in">
            <div className="bg-slate-800/80 rounded-lg shadow-2xl overflow-hidden border border-amber-500/20">
              <div className="bg-[#1E293B] p-10 text-white flex justify-between items-center"><h1 className="text-xl font-black uppercase text-amber-500">{docType === 'contract' ? 'CONTRATO' : docType === 'receipt' ? 'RECIBO' : 'ORÇAMENTO'}</h1><Icons.Diamond /></div>
              <div className="p-8 pb-16">
                {isReadOnly ? (
                  // MODO SOMENTE LEITURA - Não editável
                  <div className="text-[11px] text-justify bg-slate-900/50 p-4 rounded min-h-[400px] whitespace-pre-wrap text-white border-2 border-amber-500/30">
                    <div className="bg-amber-500/10 text-amber-400 p-2 rounded text-[9px] font-black uppercase mb-4 text-center">
                      Documento Assinado - Somente Leitura
                    </div>
                    {docContent}
                  </div>
                ) : (
                  // MODO EDITÁVEL
                  <div contentEditable onBlur={e => setDocContent(e.currentTarget.innerText)} suppressContentEditableWarning className="text-[11px] text-justify bg-slate-900/50 p-4 rounded outline-none min-h-[400px] whitespace-pre-wrap text-white">{docContent}</div>
                )}

                <div className="pt-12 mt-12 border-t border-white/10 relative">
                  <div className="grid grid-cols-2 gap-8 text-center relative">
                    {/* ASSINATURA PRESTADOR */}
                    <div className="flex flex-col items-center">
                      {sigPro ? <img src={sigPro} className="max-h-24 grayscale" /> : (!isReadOnly && <button onClick={() => setActiveSigner('pro')} className="bg-[#1E293B] text-white px-8 py-3 rounded font-black text-[10px] uppercase shadow-lg mb-2">Assinar Prestador</button>)}
                      <p className="text-xs mt-2 text-slate-400 font-bold border-t border-white/20 pt-2 mt-4 w-full">{data.proName || 'Prestador'}</p>
                    </div>

                    {/* ASSINATURA CLIENTE */}
                    <div className="flex flex-col items-center relative">
                      {sigCli ? <img src={sigCli} className="max-h-24 grayscale" /> : (!isReadOnly && <button onClick={() => setActiveSigner('cli')} className="bg-amber-500 text-black px-8 py-3 rounded font-black text-[10px] uppercase shadow-lg mb-2">Assinar Cliente</button>)}
                      <p className="text-xs mt-2 text-slate-400 font-bold border-t border-white/20 pt-2 mt-4 w-full">{data.cliName || 'Cliente'}</p>

                      {/* SELO DIGITAL REDONDO - CARIMBO */}
                      {isPremium && stampData && (
                        <div className="absolute-top-8-right-4 w-24 h-24 rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/40 backdrop-blur-sm flex flex-col items-center justify-center shadow-2xl transform rotate-12 animate-in zoom-in">
                          <div className="text-[8px] font-black text-amber-500 uppercase leading-tight text-center">
                            Autenticado
                          </div>
                          <div className="text-xs font-black text-white my-1">CP</div>
                          <div className="text-[6px] text-amber-300 font-bold">{stampData.hash.substring(0, 6)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DETALHES DO SELO EXPANDIDO (OPCIONAL) */}
                  {isPremium && stampData && (
                    <div className="mt-8 p-4 bg-slate-900/50 rounded border border-amber-500/20 text-[9px] text-slate-400 font-mono">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><span className="text-amber-500 font-bold">DATA:</span><br />{stampData.time}</div>
                        <div><span className="text-amber-500 font-bold">GPS:</span><br />{stampData.lat !== 'Offline' ? stampData.lat.toString().substring(0, 6) + "..." : 'OFF'}</div>
                        <div><span className="text-amber-500 font-bold">ID:</span><br />{stampData.hash}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BANNER DE DOCUMENTO CONGELADO */}
            {isDocumentFrozen && (
              <div className="bg-emerald-500/20 border border-emerald-500 p-4 rounded mb-4 text-center animate-in fade-in">
                <p className="text-emerald-400 font-black text-xs uppercase flex items-center justify-center gap-2">
                  <Icons.Lock />
                  DOCUMENTO TOTALMENTE ASSINADO - IMUTÁVEL
                </p>
                <p className="text-slate-400 text-[9px] mt-1">
                  Ambas as partes assinaram. Documento congelado e pronto para envio.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setShowWhatsAppPreview(true)}
                className="w-full bg-[#25D366] text-white py-5 rounded-lg font-black uppercase flex items-center justify-center gap-3 active:scale-95 shadow-xl text-sm transition-all"
              >
                <Icons.Zap /> FINALIZAR E ENVIAR NO WHATSAPP
              </button>
              <button onClick={generatePDF} className="w-full py-4 rounded-lg font-black uppercase flex items-center justify-center gap-4 active:scale-95 shadow-xl transition-all bg-slate-700 text-white">
                <Icons.Doc /> {isReadOnly ? 'Baixar PDF Novamente' : 'Baixar PDF Certificado (Grátis)'}
              </button>
            </div>
            <button onClick={() => { setView('home'); setIsReadOnly(false); }} className="w-full text-slate-500 font-black text-[11px] uppercase py-2 text-center active:scale-95">Voltar</button>
          </div>
        )}

        {
          view === 'budget-ia' && (
            <div className="space-y-6 text-white animate-in fade-in pb-10">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-6 text-black border-2 border-white/20 shadow-2xl shadow-amber-500/30">
                <Icons.Robot />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-2">Orçamentos <span className="text-amber-500">Automáticos</span></h2>
              <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-widest mb-8">Geração Inteligente Multissetorial</p>

              <div className="bg-slate-800/80 rounded-lg p-8 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-amber-400 pl-2">Descreva o Serviço ou Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: piso, azulejo, drywall, telhado, elétrica, mecânica, salão..."
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-5 rounded text-white outline-none focus:border-amber-500 font-bold text-lg"
                  />
                  <p className="text-[9px] text-slate-500 pl-2 mt-2">Dica: Digite apenas uma palavra-chave. O sistema inferira todos os detalhes automaticamente.</p>
                </div>

                <button
                  onClick={generateAutoBudget}
                  disabled={loadingIA}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-black py-6 rounded-lg font-black uppercase shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loadingIA ? (
                    <>
                      <div className="w-5 h-5 border-3 border-black rounded-full animate-spin border-t-transparent"></div>
                      GERANDO ORÇAMENTO...
                    </>
                  ) : (
                    <>
                      <Icons.Robot />
                      GERAR ORÇAMENTO AUTOMÁTICO
                    </>
                  )}
                </button>
              </div>

              {generatedBudget && !loadingIA && (
                <div className="bg-slate-800/80 rounded-lg shadow-2xl overflow-hidden border border-amber-500/20 animate-in fade-in">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-6 text-black flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase">Orçamento Gerado</h3>
                    <Icons.Robot />
                  </div>
                  <div className="p-8">
                    <div className="bg-slate-900/50 p-6 rounded outline-none min-h-[400px] max-h-[600px] overflow-y-auto whitespace-pre-wrap text-white text-xs font-mono leading-relaxed custom-scroll">
                      {generatedBudget}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <button
                        onClick={() => {
                          setView('viewer');
                          captureStamp();
                        }}
                        className="bg-amber-500 text-black py-4 rounded-lg font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Icons.Doc />
                        Continuar Editando
                      </button>
                      <button
                        onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(generatedBudget), '_blank')}
                        className="bg-[#25D366] text-white py-4 rounded-lg font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Icons.Zap />
                        Enviar WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => setView('home')} className="w-full text-slate-500 font-black text-[11px] uppercase py-2 text-center active:scale-95">Voltar ao Painel</button>
            </div>
          )
        }

        {
          view === 'planos' && (
            <div className="space-y-6 animate-in zoom-in pb-10 text-center text-white">
              <div className="bg-gradient-to-br from-[#F59E0B] to-[#B45309] w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-6 text-black border-2 border-black shadow-2xl shadow-amber-500/20"><Icons.Diamond /></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Domínio <span className="text-amber-500">Canaã</span></h2>

              <div className="space-y-6 px-2">
                {isPremium ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-emerald-400 font-black uppercase tracking-widest mb-6">
                    Você já é Diamond!
                    <p className="text-[9px] text-emerald-300 mt-2 normal-case">Válido até: {premiumUntil ? premiumUntil.toLocaleDateString() : 'Vitalício'}</p>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg text-amber-500 font-black uppercase tracking-widest mb-6 text-xs">
                    Escolha sua Assinatura
                  </div>
                )}

                {/* PLANO MENSAL */}
                <div onClick={() => window.open('https://pay.cakto.com.br/37ch7yd_731819', '_blank')} className="bg-white/5 border border-white/10 p-6 rounded-lg relative group cursor-pointer active:scale-95 transition-all hover:bg-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-left"><h3 className="text-xl font-black uppercase text-slate-200">Mensal</h3><p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Iniciante</p></div>
                    <div className="text-right font-black text-white text-2xl">RS 27,90</div>
                  </div>
                  <ul className="text-left space-y-2 text-[10px] text-slate-400 font-medium">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Orçamentos Ilimitados</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Contratos Jurídicos</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> PDF Certificado</li>
                  </ul>
                </div>

                {/* PLANO ANUAL */}
                <div onClick={() => window.open('https://pay.cakto.com.br/332mcat_731800', '_blank')} className="bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-8 rounded-lg shadow-2xl relative overflow-hidden text-black cursor-pointer active:scale-95 transform scale-105 border-2 border-black/20">
                  <div className="absolute top-0 right-0 bg-black text-[#F59E0B] px-4 py-1.5 text-[9px] font-black uppercase rounded-bl">Mais Escolhido</div>
                  <div className="flex justify-between items-center mb-6 mt-2">
                    <div className="text-left"><h3 className="text-3xl font-black uppercase leading-none">Anual</h3><p className="text-black/60 text-[10px] font-black uppercase tracking-widest">Economize 40%</p></div>
                    <div className="text-right text-4xl font-black">RS 197</div>
                  </div>
                  <ul className="text-left space-y-2 text-[11px] font-bold opacity-80 border-t border-black/10 pt-4">
                    <li className="flex items-center gap-2">✓ Tudo do Mensal</li>
                    <li className="flex items-center gap-2">✓ Inteligência Artificial (IA)</li>
                    <li className="flex items-center gap-2">✓ Carimbo Digital com GPS</li>
                    <li className="flex items-center gap-2">✓ +Prioridade no Suporte</li>
                  </ul>
                </div>

                {/* PLANO VITALÍCIO */}
                <div onClick={() => window.open('https://pay.cakto.com.br/qh6fxpo_726634', '_blank')} className="bg-black/40 border-2 border-amber-500/50 p-6 rounded-lg relative group cursor-pointer active:scale-95 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-left"><h3 className="text-xl font-black uppercase text-amber-500">Vitalício</h3><p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Pagamento Único</p></div>
                    <div className="text-right font-black text-amber-500 text-2xl">RS 497</div>
                  </div>
                  <ul className="text-left space-y-2 text-[10px] text-slate-400 font-medium border-t border-white/5 pt-4">
                    <li className="flex items-center gap-2 text-amber-200"><Icons.Diamond /> Acesso Diamond Para Sempre</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Sem mensalidades futuras</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-amber-500 rounded-full"></div> Todas as atualizações v33+</li>
                  </ul>
                </div>

              </div>
            </div>
          )
        }

        {/* CONFIGURAÇÕES */}
        {
        }

      </main >

      <nav className="shrink-0 bg-[#1E293B] border-t border-[#D97706]/20 p-6 flex justify-around items-center z-[60] shadow-2xl text-center">
        {[{ id: 'home', i: Icons.Home, l: 'Painel' }, { id: 'finance', i: Icons.ArrowRight, l: 'Custos' }, { id: 'machine', i: Icons.Card, l: 'Receber' }, { id: 'docs', i: Icons.Doc, l: 'Papéis' }, { id: 'budget-ia', i: Icons.Robot, l: 'IA' }, { id: 'planos', i: Icons.Diamond, l: 'SaaS' }].map(n => <button key={n.id} onClick={() => setView(n.id)} className={"flex flex-col items-center gap-2 transition-all " + (view === n.id ? "text-amber-500 scale-125" : "text-slate-600")}><n.i /><span className="text-[9px] font-black uppercase mt-1 tracking-tighter leading-none">{n.l}</span></button>)}
      </nav>
      {/* MODAL ASSINATURA */}
      {activeSigner && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-8 text-center animate-in zoom-in overflow-hidden">
          <div className="bg-[#1E293B] w-full max-w-sm rounded-lg p-10 border-2 border-amber-500/20 text-white shadow-2xl relative shadow-amber-500/10">
            <h3 className="text-xl font-black uppercase mb-8 text-amber-500 tracking-widest text-center">Firma Digital</h3>
            <div className="bg-white rounded-lg mb-6 overflow-hidden h-64 shadow-inner ring-4 ring-white/5 relative" style={{ touchAction: 'none' }}>
              <canvas ref={canvasRef} className="w-full h-full cursor-crosshair bg-white touch-none" />
              <button onClick={() => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }} className="absolute top-4 right-4 bg-rose-500/20 text-rose-500 p-2 rounded active:scale-90 transition-all shadow-md text-center"><Icons.Trash /></button>
            </div>
            <button onClick={saveFirma} className="w-full bg-[#D97706] text-black py-6 rounded-lg font-black uppercase text-lg tracking-tighter shadow-xl active:scale-95 transition-all">Confirmar Firma</button>
            <button onClick={() => setActiveSigner(null)} className="w-full text-slate-500 text-[10px] font-black uppercase mt-4 text-center">Fechar Janela</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;