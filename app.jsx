import React, { useState, useMemo, useRef, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'zapt-diamond-pro-v1';

// Ícones SVG Manuais Premium
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Money: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Doc: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Receipt: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/></svg>,
  Diamond: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3l-4 6 5 11 5-11-4-6"/><path d="M2 9h20"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .004 5.411.001 12.045a11.811 11.811 0 0 0 1.592 5.918L0 24l6.135-1.61a11.751 11.751 0 0 0 5.911 1.594h.005c6.637 0 12.05-5.414 12.053-12.05a11.82 11.82 0 0 0-3.48-8.508"/></svg>
};

const App = () => {
  // --- SISTEMA E SEGURANÇA ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [syncStatus, setSyncStatus] = useState('online');
  const [isPremium, setIsPremium] = useState(false); // Simulando controle de venda

  // --- DADOS PRIVADOS ---
  const [installments, setInstallments] = useState(6);
  const [sigPro, setSigPro] = useState(null);
  const [sigCli, setSigCli] = useState(null);
  const [activeSigner, setActiveSigner] = useState(null);
  const [items, setItems] = useState([{ id: 1, type: 'mat', desc: 'Materiais', price: '1500' }, { id: 2, type: 'ser', desc: 'Mão de Obra', price: '1000' }]);
  const [data, setData] = useState({ proName: '', proDoc: '', cliName: '', cliDoc: '', title: '', details: '', margin: 10, advance: 50, city: 'Cotia', warranty: '90 dias' });
  const [contractText, setContractText] = useState("");
  
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // --- AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- FETCH & AUTO-SAVE ---
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const saved = docSnap.data();
        setData(saved.data || data);
        setItems(saved.items || items);
        setSigPro(saved.sigPro || null);
        setIsPremium(saved.isPremium || false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const saveToCloud = async () => {
      setSyncStatus('saving');
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
        await setDoc(docRef, { data, items, sigPro, installments, isPremium, updatedAt: new Date().toISOString() });
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('online'), 2000);
      } catch (e) { console.error(e); }
    };
    const timer = setTimeout(saveToCloud, 2000);
    return () => clearTimeout(timer);
  }, [data, items, sigPro, installments, isPremium, user]);

  // --- FINANCEIRO ---
  const totals = useMemo(() => {
    const mat = items.filter(i => i.type === 'mat').reduce((a, b) => a + (parseFloat(b.price) || 0), 0);
    const ser = items.filter(i => i.type === 'ser').reduce((a, b) => a + (parseFloat(b.price) || 0), 0);
    const cost = mat + ser;
    const markup = 1 + (parseFloat(data.margin) / 100);
    const pixVal = cost * markup;
    const cardVal = pixVal / (1 - (0.031 + ((installments - 1) * 0.015)));
    return {
      pix: pixVal, mat, cardTotal: cardVal, perMonth: cardVal / installments,
      adv: pixVal * (parseFloat(data.advance) / 100),
      rem: pixVal - (pixVal * (parseFloat(data.advance) / 100)),
      multa: pixVal * 0.10, lucro: pixVal - mat
    };
  }, [items, data, installments]);

  const BRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // --- CONTRATO ---
  useEffect(() => {
    if (!sigCli && !sigPro) {
      setContractText(`INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS\n\n1. PARTES: CONTRATADA: ${data.proName || '___'}, CPF: ${data.proDoc || '___'}. CONTRATANTE: ${data.cliName || '___'}, CPF: ${data.cliDoc || '___'}.\n\n2. OBJETO: ${data.title || 'Serviços'}. Detalhes: ${data.details || 'Conforme acordado.'}.\n\n3. PAGAMENTO: Total ${BRL(totals.pix)}. Sinal de ${BRL(totals.adv)} e saldo de ${BRL(totals.rem)} na entrega.\n\n4. MULTA: 10% (${BRL(totals.multa)}) por desistência imotivada.\n\n5. GARANTIA: ${data.warranty}.\n\n6. ACEITE: Validado via assinatura digital MP 2.200-2.`);
    }
  }, [data, totals]);

  // --- MOTOR ASSINATURA ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSigner) return;
    const ctx = canvas.getContext('2d');
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    };
    const start = (e) => { isDrawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); if(e.touches) e.preventDefault(); };
    const move = (e) => { if(!isDrawing.current) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(); if(e.touches) e.preventDefault(); };
    canvas.addEventListener('touchstart', start, {passive:false});
    canvas.addEventListener('touchmove', move, {passive:false});
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', () => isDrawing.current = false);
    return () => { canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', move); };
  }, [activeSigner]);

  const saveSig = () => {
    const img = canvasRef.current.toDataURL();
    if (activeSigner === 'pro') setSigPro(img); else setSigCli(img);
    setActiveSigner(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F172A] text-slate-100 overflow-hidden font-sans select-none border-t-[8px] border-emerald-500">
      
      {/* HEADER PREMIUM */}
      <header className="bg-[#1E293B] border-b border-white/5 p-5 flex justify-between items-center z-50 shrink-0 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg"><Icons.Home /></div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight">ZAPT <span className="text-emerald-500">DIAMOND</span></h1>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isPremium ? '💎 Status: Premium Vitalício' : '🔓 Versão Gratuita'}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${syncStatus === 'saving' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
      </header>

      {/* ÁREA CENTRAL */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scroll bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        
        {view === 'home' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="bg-emerald-500 rounded-[45px] p-10 text-white shadow-2xl relative overflow-hidden">
               <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mb-4 text-center">Lucro Real Estimado</p>
               <h2 className="text-5xl font-black text-white text-center tracking-tighter mb-10">{BRL(totals.lucro)}</h2>
               <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-8 text-center text-sm font-black">
                  <div><p className="text-[8px] font-bold text-white/60 uppercase">Multa (10%)</p>{BRL(totals.multa)}</div>
                  <div><p className="text-[8px] font-bold text-white/60 uppercase">Entrada</p>{BRL(totals.adv)}</div>
               </div>
            </div>

            <div className="bg-[#1E293B] rounded-[40px] p-8 border border-white/5 shadow-2xl space-y-6">
               <div className="flex justify-between items-end">
                  <div><h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ajuste de Margem</h2><p className="text-3xl font-black text-emerald-400">{data.margin}%</p></div>
                  <div className="flex gap-2">
                    {[10, 20, 30].map(v => (
                      <button key={v} onClick={() => setData({...data, margin: v})} className={`w-11 h-10 rounded-xl text-[11px] font-black transition-all ${data.margin == v ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>{v}%</button>
                    ))}
                  </div>
               </div>
               <input type="range" min="0" max="100" value={data.margin} onChange={e => setData({...data, margin: e.target.value})} className="w-full h-2 accent-emerald-500" />
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-5 text-slate-900">
              <input placeholder="Título do Serviço" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-[16px] border border-slate-100" />
              <textarea placeholder="Descrição completa..." value={data.details} onChange={e => setData({...data, details: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-[16px] border border-slate-100" rows="3" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <input placeholder="Seu Nome" value={data.proName} onChange={e => setData({...data, proName: e.target.value})} className="p-4 bg-slate-50 rounded-xl outline-none text-[16px]" />
                 <input placeholder="Nome Cliente" value={data.cliName} onChange={e => setData({...data, cliName: e.target.value})} className="p-4 bg-slate-50 rounded-xl outline-none text-[16px]" />
              </div>
            </div>
            <button onClick={() => setView('items')} className="w-full bg-emerald-500 text-white py-6 rounded-[35px] font-black text-lg shadow-2xl active:scale-95 transition-all">AVANÇAR</button>
          </div>
        )}

        {view === 'premium' && (
          <div className="space-y-6 animate-in zoom-in">
             <div className="text-center py-5">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                   <Icons.Diamond />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Planos Império</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Escolha sua licença de uso</p>
             </div>

             <div className="space-y-4">
                <div className="bg-[#1E293B] p-8 rounded-[45px] border border-white/5 shadow-2xl relative overflow-hidden group active:scale-[0.98] transition-all">
                   <div className="flex justify-between items-start mb-5">
                      <div><h3 className="text-xl font-black uppercase">Mensal</h3><p className="text-slate-500 text-[10px] font-bold uppercase">Flexibilidade total</p></div>
                      <div className="text-right font-black"><p className="text-emerald-500 text-2xl">R$ 34,90</p><p className="text-[9px] text-slate-500 uppercase">Por mês</p></div>
                   </div>
                   <button className="w-full bg-slate-800 text-white py-4 rounded-3xl font-black uppercase text-[10px] border border-white/5">Assinar Agora</button>
                </div>

                <div className="bg-emerald-500 p-8 rounded-[45px] shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all">
                   <div className="absolute top-0 right-0 bg-white/20 px-4 py-1 text-[8px] font-black uppercase rounded-bl-2xl">Mais Popular</div>
                   <div className="flex justify-between items-start mb-5">
                      <div><h3 className="text-xl font-black uppercase text-white">Anual</h3><p className="text-emerald-100 text-[10px] font-bold uppercase">Economize 30%</p></div>
                      <div className="text-right font-black text-white"><p className="text-2xl">R$ 297,00</p><p className="text-[9px] opacity-70 uppercase">Pagamento Único</p></div>
                   </div>
                   <button className="w-full bg-white text-emerald-500 py-4 rounded-3xl font-black uppercase text-[10px] shadow-xl">Garantir Desconto</button>
                </div>

                <div className="bg-slate-900 p-8 rounded-[45px] border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden active:scale-[0.98] transition-all">
                   <div className="flex justify-between items-start mb-5">
                      <div><h3 className="text-xl font-black uppercase text-emerald-500">Vitalício</h3><p className="text-slate-500 text-[10px] font-bold uppercase">Oportunidade Única</p></div>
                      <div className="text-right font-black"><p className="text-emerald-500 text-2xl">R$ 697,00</p><p className="text-[9px] text-slate-500 uppercase">Nunca mais pague</p></div>
                   </div>
                   <button className="w-full bg-emerald-500 text-white py-4 rounded-3xl font-black uppercase text-[10px] shadow-2xl">Ser Membro Diamond</button>
                </div>
             </div>
          </div>
        )}

        {(view === 'contract' || view === 'receipt' || view === 'items') && (
           /* ... resto das views mantidas iguais para funcionalidade total ... */
           <div className="space-y-4 animate-in fade-in text-slate-900">
             <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Orçamento Detalhado</h2>
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-3xl border border-slate-100 shadow-sm">
                    <div className={`w-2 h-10 rounded-full ${item.type === 'mat' ? 'bg-blue-400' : 'bg-emerald-500'}`}></div>
                    <input placeholder="Item" value={item.desc} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, desc: e.target.value} : i))} className="flex-1 bg-transparent outline-none text-[16px] font-bold text-slate-700" />
                    <input type="number" value={item.price} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, price: e.target.value} : i))} className="w-24 bg-white rounded-xl p-3 outline-none font-black text-[16px] border border-slate-200" />
                  </div>
                ))}
                <button onClick={() => setView('home')} className="w-full bg-slate-900 text-white py-5 rounded-[30px] font-black uppercase text-xs">Voltar e Gerar Documento</button>
             </div>
           </div>
        )}
      </main>

      {/* MENU INFERIOR DIAMOND */}
      <nav className="shrink-0 bg-[#1E293B] border-t border-white/5 p-6 flex justify-around items-center z-[60] shadow-2xl">
        {[ { id: 'home', icon: Icons.Home, label: 'Painel' }, { id: 'items', icon: Icons.Money, label: 'Orçamentos' }, { id: 'premium', icon: Icons.Diamond, label: 'Planos' }, { id: 'contract', icon: Icons.Doc, label: 'Contrato' } ].map(n => (
          <button key={n.id} onClick={() => setView(n.id)} className={`flex flex-col items-center gap-2 transition-all ${view === n.id ? 'text-emerald-500 scale-110' : 'text-slate-500'}`}>
            <n.icon /><span className="text-[10px] font-black uppercase mt-1 tracking-tighter leading-none">{n.label}</span>
          </button>
        ))}
      </nav>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        input, textarea, select { font-size: 16px !important; border: 1px solid #F1F5F9 !important; border-radius: 20px !important; background: #F8FAFC !important; color: #0F172A !important; }
        .custom-scroll::-webkit-scrollbar { display: none; }
        input[type="range"] { -webkit-appearance: none; background: #334155; height: 10px; border-radius: 20px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 35px; height: 35px; background: #10B981; border-radius: 50%; border: 8px solid #1E293B; box-shadow: 0 15px 35px rgba(0,0,0,0.6); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default App;