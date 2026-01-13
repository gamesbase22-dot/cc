// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkcZe3E8Ww4Agp0o2kFI5LKHMQhn6-AcY",
  authDomain: "naaa-9e9ee.firebaseapp.com",
  projectId: "naaa-9e9ee",
  storageBucket: "naaa-9e9ee.firebasestorage.app",
  messagingSenderId: "770100571484",
  appId: "1:770100571484:web:b4c61fce0bc66113352599",
  measurementId: "G-1EGQR2N9WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [syncStatus, setSyncStatus] = useState('online');
  const [isPremium, setIsPremium] = useState(false);

  const [installments, setInstallments] = useState(6);
  const [sigPro, setSigPro] = useState(null);
  const [sigCli, setSigCli] = useState(null);
  const [activeSigner, setActiveSigner] = useState(null);
  const [items, setItems] = useState([{ id: 1, type: 'mat', desc: 'Materiais', price: '1500' }, { id: 2, type: 'ser', desc: 'Mão de Obra', price: '1000' }]);
  const [data, setData] = useState({ proName: '', proDoc: '', cliName: '', cliDoc: '', title: '', details: '', margin: 10, advance: 50, city: 'Cotia', warranty: '90 dias' });
  const [contractText, setContractText] = useState("");
  
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // --- AUTH AJUSTADO ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Erro auth:", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- FETCH & AUTO-SAVE ---
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const saved = docSnap.data();
          setData(saved.data || data);
          setItems(saved.items || items);
          setSigPro(saved.sigPro || null);
          setIsPremium(saved.isPremium || false);
        }
      } catch (e) { console.error("Erro ao buscar dados:", e); }
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
      } catch (e) { console.error("Erro ao salvar:", e); }
    };
    const timer = setTimeout(saveToCloud, 2000);
    return () => clearTimeout(timer);
  }, [data, items, sigPro, installments, isPremium, user]);

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

  useEffect(() => {
    if (!sigCli && !sigPro) {
      setContractText(`INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS...`);
    }
  }, [data, totals]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F172A] text-slate-100 overflow-hidden font-sans select-none border-t-[8px] border-emerald-500">
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

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
        {view === 'home' && (
          <div className="space-y-5">
            <div className="bg-emerald-500 rounded-[45px] p-10 text-white shadow-2xl text-center">
               <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-4">Lucro Real Estimado</p>
               <h2 className="text-5xl font-black mb-10">{BRL(totals.lucro)}</h2>
               <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-8">
                  <div><p className="text-[8px] opacity-60 uppercase">Multa (10%)</p>{BRL(totals.multa)}</div>
                  <div><p className="text-[8px] opacity-60 uppercase">Entrada</p>{BRL(totals.adv)}</div>
               </div>
            </div>

            <div className="bg-[#1E293B] rounded-[40px] p-8 border border-white/5 shadow-2xl space-y-6">
                <div className="flex justify-between items-end">
                  <div><h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Margem</h2><p className="text-3xl font-black text-emerald-400">{data.margin}%</p></div>
                  <div className="flex gap-2">
                    {[10, 20, 30].map(v => (
                      <button key={v} onClick={() => setData({...data, margin: v})} className={`w-11 h-10 rounded-xl text-[11px] font-black ${data.margin == v ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{v}%</button>
                    ))}
                  </div>
                </div>
                <input type="range" min="0" max="100" value={data.margin} onChange={e => setData({...data, margin: e.target.value})} className="w-full h-2 accent-emerald-500" />
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-5 text-slate-900">
              <input placeholder="Título do Serviço" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
              <textarea placeholder="Descrição completa..." value={data.details} onChange={e => setData({...data, details: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" rows="3" />
              <div className="grid grid-cols-2 gap-3">
                 <input placeholder="Seu Nome" value={data.proName} onChange={e => setData({...data, proName: e.target.value})} className="p-4 bg-slate-50 rounded-xl outline-none" />
                 <input placeholder="Nome Cliente" value={data.cliName} onChange={e => setData({...data, cliName: e.target.value})} className="p-4 bg-slate-50 rounded-xl outline-none" />
              </div>
            </div>
            <button onClick={() => setView('items')} className="w-full bg-emerald-500 text-white py-6 rounded-[35px] font-black text-lg shadow-2xl active:scale-95 transition-all">AVANÇAR</button>
          </div>
        )}
      </main>

      <nav className="shrink-0 bg-[#1E293B] border-t border-white/5 p-6 flex justify-around items-center z-[60] shadow-2xl">
        {[ { id: 'home', icon: Icons.Home, label: 'Painel' }, { id: 'items', icon: Icons.Money, label: 'Orçamentos' }, { id: 'premium', icon: Icons.Diamond, label: 'Planos' }, { id: 'contract', icon: Icons.Doc, label: 'Contrato' } ].map(n => (
          <button key={n.id} onClick={() => setView(n.id)} className={`flex flex-col items-center gap-2 ${view === n.id ? 'text-emerald-500' : 'text-slate-500'}`}>
            <n.icon /><span className="text-[10px] font-black uppercase mt-1">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;