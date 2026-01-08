import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, Ticket, Wrench, Users, Plus, Search, FileText, Download, 
  Trash2, Edit3, CheckCircle2, Clock, AlertCircle, ShieldCheck, X, 
  UploadCloud, FileSpreadsheet, Calendar, FileDown, TrendingUp, Briefcase, 
  Layers, AlertTriangle, Printer, Receipt, ChevronLeft, ChevronRight, 
  ArrowUpRight, ArrowDownLeft, Info, Filter, Settings, Lock, Database, 
  Upload, LogOut, KeyRound, History, Eye, Sparkles, FileSearch, Scan, FileWarning 
} from 'lucide-react';

// Estilos Neumorficos
const styles = {
  bg: 'bg-[#F2F3F7]',
  glass: 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl',
  card: 'bg-[#F2F3F7] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] rounded-[2rem] p-6',
  button: 'px-5 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-95 flex items-center gap-2',
  neumorphicBtn: 'bg-[#F2F3F7] shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] text-slate-600',
  input: 'w-full bg-[#F2F3F7] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl px-4 py-3 outline-none text-slate-700 placeholder:text-slate-400',
  tableInput: 'w-full bg-white/50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 transition-all',
  readOnlyBadge: 'bg-white shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] rounded-xl px-4 py-2 text-slate-700 font-bold min-h-[40px] flex items-center'
};

// Utilidades
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const formatMoney = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
const cleanStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

const calculateTaxes = (total, rfc = "") => {
  const isMoral = rfc.length === 12;
  const subtotal = total / 1.16;
  const iva = total - subtotal;
  const isr = isMoral ? subtotal * 0.0125 : 0; 
  return { subtotal, iva, isr, finalTotal: total - isr };
};

const Storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  getVal: (key, def) => localStorage.getItem(key) || def,
  setVal: (key, val) => localStorage.setItem(key, val)
};

const loadPdfJs = () => {
  return new Promise((resolve) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    document.head.appendChild(script);
  });
};

// Componentes UI
const StatCard = ({ title, amount, icon: Icon, color, subtitle }) => (
  <div className={styles.card}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-inner`}><Icon size={24} className={color.replace('bg-', 'text-')} /></div>
      <ArrowUpRight size={16} className="text-slate-300" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-xl font-black text-slate-800 mt-1">{formatMoney(amount)}</h3>
    {subtitle && <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtitle}</p>}
  </div>
);

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, itemTitle }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(10);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className={`${styles.glass} w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border-rose-100/50`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 shadow-inner"><AlertTriangle size={40} className="animate-pulse" /></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Confirmar Eliminacion</h2>
          <p className="text-sm text-slate-500 mb-6 px-4">Estas borrando: <span className="font-bold text-slate-700">"{itemTitle}"</span>.</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-rose-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 10) * 100}%` }} />
          </div>
          <div className="flex gap-4 w-full">
            <button onClick={onCancel} className={`${styles.button} ${styles.neumorphicBtn} flex-1 justify-center`}>Cancelar</button>
            <button onClick={onConfirm} className={`${styles.button} bg-rose-600 text-white shadow-lg shadow-rose-200 flex-1 justify-center relative overflow-hidden`}>Eliminar ({timeLeft}s)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onSave, type, editingItem, nextFolio }) => {
  const fileInputRef = useRef(null);
  const [ticketType, setTicketType] = useState('ingreso'); 
  const [isReading, setIsReading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [formData, setFormData] = useState({ title: '', client: 'Publico en general', amount: 0, date: new Date().toISOString().split('T')[0], fileName: '', rfc: 'XAXX010101000', folio: '', status: 'Pendiente', ticketSubtype: 'ingreso', items: [{ id: generateId(), quantity: 1, description: '', unitPrice: 0 }] });

  useEffect(() => {
    if (cleanStr(formData.client).toLowerCase() === "publico en general") {
      if (formData.rfc !== "XAXX010101000") setFormData(prev => ({ ...prev, rfc: "XAXX010101000" }));
    }
  }, [formData.client]);

  useEffect(() => {
    if (editingItem) {
      setFormData({ status: 'Pendiente', ...editingItem, items: editingItem.items || [{ id: generateId(), quantity: 1, description: '', unitPrice: 0 }] });
      if (editingItem.ticketSubtype) setTicketType(editingItem.ticketSubtype);
    } else {
      setFormData({ title: 'Venta de Servicios', client: 'Publico en general', amount: 0, date: new Date().toISOString().split('T')[0], fileName: '', rfc: 'XAXX010101000', status: type === 'quote' ? 'Borrador' : 'Aceptada', folio: type === 'note' ? `CV-${String(nextFolio).padStart(5, '0')}` : '', ticketSubtype: 'ingreso', items: [{ id: generateId(), quantity: 1, description: '', unitPrice: 0 }] });
    }
    setPdfPreview(null);
  }, [editingItem, isOpen, type, nextFolio]);

  const taxes = useMemo(() => calculateTaxes(formData.amount, formData.rfc), [formData.amount, formData.rfc]);

  const updateItem = (id, field, value) => {
    setFormData(prev => {
      const newItems = prev.items.map(item => item.id === id ? { ...item, [field]: value } : item);
      const isComplex = type === 'quote' || type === 'note';
      const newTotal = newItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
      return { ...prev, items: newItems, amount: isComplex ? newTotal : prev.amount };
    });
  };

  const addItem = () => { setFormData(prev => ({ ...prev, items: [...prev.items, { id: generateId(), quantity: 1, description: '', unitPrice: 0 }] })); };
  const removeItem = (id) => { if (formData.items.length === 1) return; setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) })); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPdfPreview(url);
    setFormData(prev => ({ ...prev, fileName: file.name }));
    setIsReading(true);
    try {
      const pdfjs = await loadPdfJs();
      const reader = new FileReader();
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument(typedArray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(" ");
        }
        const cleanText = fullText.replace(/\\/g, '');
        const totalMatch = cleanText.match(/TOTAL[:\s]*\$?\s*([\d,]+\.\d{2})/i);
        const folioMatch = cleanText.match(/Folio[:\s]*([A-Z0-9-]+)/i);
        const dateMatch = cleanText.match(/Fecha[:\s]*(\d{2})[\/-](\d{2})[\/-](\d{4})/i);
        if (totalMatch) setFormData(prev => ({ ...prev, amount: parseFloat(totalMatch[1].replace(/,/g, '')) }));
        if (folioMatch) setFormData(prev => ({ ...prev, folio: folioMatch[1] }));
        if (dateMatch) setFormData(prev => ({ ...prev, date: `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` }));
        setIsReading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) { setIsReading(false); }
  };

  if (!isOpen) return null;
  const isComplex = type === 'quote' || type === 'note';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className={`${styles.glass} w-full ${isComplex || (type === 'ticket' && pdfPreview) ? 'max-w-6xl' : 'max-w-2xl'} p-8 rounded-[2.5rem] relative overflow-hidden my-auto shadow-2xl`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${type === 'ticket' ? (ticketType === 'ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600') : 'bg-indigo-100 text-indigo-600'}`}>
                {type === 'quote' ? <FileText size={20}/> : type === 'note' ? <Receipt size={20}/> : <Scan size={20}/>}
             </div>
             <h2 className="text-xl font-black text-slate-800">{type === 'quote' ? 'Gestion de Cotizacion' : type === 'note' ? 'Nueva Nota de Venta' : 'Procesar Ticket Digital'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
        </div>
        <div className={`grid grid-cols-1 ${ (isComplex || (type === 'ticket' && pdfPreview)) ? 'lg:grid-cols-2' : ''} gap-10`}>
          {type === 'ticket' ? (
            <div className="space-y-8 flex flex-col h-full justify-center text-left">
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full shadow-inner">
                  <button onClick={() => { setTicketType('ingreso'); setFormData({...formData, ticketSubtype: 'ingreso'}); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${ticketType === 'ingreso' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}>INGRESO</button>
                  <button onClick={() => { setTicketType('egreso'); setFormData({...formData, ticketSubtype: 'egreso'}); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${ticketType === 'egreso' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}`}>GASTO</button>
              </div>
              <div className="flex-1">
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
                <div onClick={() => fileInputRef.current.click()} className={`group h-full min-h-[250px] border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${formData.fileName ? (formData.fileName === 'PENDIENTE_SUBIR.pdf' ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-emerald-300 bg-emerald-50 text-emerald-600') : 'border-indigo-100 hover:border-indigo-400 hover:bg-white text-slate-300'}`}>
                  <div className={`p-6 rounded-3xl ${formData.fileName ? (formData.fileName === 'PENDIENTE_SUBIR.pdf' ? 'bg-amber-100' : 'bg-emerald-100') : 'bg-indigo-50 group-hover:scale-110'} transition-all duration-500`}>
                    {formData.fileName === 'PENDIENTE_SUBIR.pdf' ? <FileWarning size={64} /> : (formData.fileName ? <CheckCircle2 size={64} /> : <UploadCloud size={64} className="text-indigo-600" />)}
                  </div>
                  <div className="text-center px-4"><p className="text-lg font-black break-words">{formData.fileName === 'PENDIENTE_SUBIR.pdf' ? 'ARCHIVO FALTANTE' : (formData.fileName || 'Adjuntar Ticket PDF')}</p></div>
                  {isReading && <div className="flex items-center gap-2 text-indigo-600 animate-pulse"><Sparkles size={16}/> <span className="text-[10px] font-black uppercase tracking-tighter">Analizando...</span></div>}
                </div>
              </div>
              <div className="bg-[#F8F9FB] p-8 rounded-[2.5rem] border border-white shadow-xl space-y-5 text-left">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-left">Informacion Extraida</h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase">Referencia</span><div className={styles.readOnlyBadge + " truncate"}>{cleanStr(formData.title) || 'Analizando...'}</div></div>
                    <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase">Folio Detectado</span><div className={styles.readOnlyBadge}>{formData.folio || 'N/A'}</div></div>
                    <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase">Fecha Detectada</span><div className={styles.readOnlyBadge}>{formData.date}</div></div>
                    <div className="space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase">Importe Total</span><div className={`${styles.readOnlyBadge} text-indigo-600 text-xl font-black`}>{formatMoney(formData.amount)}</div></div>
                    <div className="col-span-2 space-y-1"><span className="text-[9px] font-black text-slate-400 uppercase">Receptor Fiscal</span><div className={styles.readOnlyBadge}>{formData.client} - {formData.rfc}</div></div>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={onClose} className={`${styles.button} ${styles.neumorphicBtn} flex-1 justify-center`}>Descartar</button>
                 <button onClick={() => onSave({...formData, ...taxes})} disabled={!formData.fileName || formData.amount <= 0} className={`${styles.button} bg-slate-900 text-white shadow-xl flex-1 justify-center disabled:opacity-50`}>Confirmar y Archivar</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-left">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Proyecto</label><input className={styles.input} placeholder="Nombre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha</label><input type="date" className={styles.input} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cliente</label><input className={styles.input} placeholder="Receptor" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">RFC</label><input className={styles.input} placeholder="XAXX010101000" value={formData.rfc} onChange={e => setFormData({...formData, rfc: e.target.value.toUpperCase().trim()})} /></div>
               </div>
               {type === 'quote' && (
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Estatus</label>
                  <select className={styles.input + ' font-bold'} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Borrador">Borrador</option><option value="Pendiente">Pendiente</option><option value="Revision">En Revision</option><option value="Aceptada">Aceptada ✅</option><option value="Cancelada">Cancelada ❌</option>
                  </select></div>
               )}
               <div className="bg-white/40 rounded-[2rem] p-6 border border-indigo-100 shadow-inner">
                  <div className="overflow-x-auto max-h-40">
                    <table className="w-full text-left">
                      <thead><tr className="text-[8px] font-black text-slate-400 uppercase"><th className="pb-2">Cant</th><th className="pb-2">Descripcion</th><th className="pb-2 text-right">Precio</th><th className="pb-2"></th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.items.map((item) => (
                          <tr key={item.id}><td className="py-1 w-12"><input type="number" className={styles.tableInput} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} /></td><td className="py-1 px-2"><input type="text" className={styles.tableInput} value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></td><td className="py-1 w-20 px-2"><input type="number" className={`${styles.tableInput} text-right`} value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} /></td><td className="py-1 text-center"><button onClick={() => removeItem(item.id)} className="text-rose-400"><Trash2 size={12}/></button></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setFormData(prev => ({ ...prev, items: [...prev.items, { id: generateId(), quantity: 1, description: '', unitPrice: 0 }] }))} className="mt-4 text-[10px] font-black text-indigo-600 uppercase">+ Agregar Fila</button>
               </div>
               <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-2xl">
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">Total Neto</span>
                  <span className="text-3xl font-black">{formatMoney(taxes.finalTotal)}</span>
               </div>
               <div className="flex gap-4 pt-4">
                  <button onClick={onClose} className={`${styles.button} ${styles.neumorphicBtn} flex-1 justify-center`}>Cerrar</button>
                  <button onClick={() => onSave({...formData, ...taxes})} disabled={formData.amount <= 0} className={`${styles.button} bg-slate-900 text-white shadow-xl flex-1 justify-center`}>Guardar Documento</button>
               </div>
            </div>
          )}
          {(isComplex || (type === 'ticket' && pdfPreview)) && (
            <div className="hidden lg:flex flex-col bg-slate-100 rounded-[3rem] border border-slate-200 overflow-hidden shadow-inner animate-in zoom-in-95 duration-500">
               <div className="flex-1 p-3">{pdfPreview ? <iframe src={pdfPreview} className="w-full h-full rounded-[2.5rem]" title="Preview" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4"><FileSearch size={100} strokeWidth={1} className="animate-pulse" /><p className="text-[10px] font-black uppercase tracking-[0.4em]">Cargar Archivo</p></div>}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [view, setView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState({ quotes: Storage.get('it_quotes'), notes: Storage.get('it_notes'), tickets: Storage.get('it_tickets') });
  const [modal, setModal] = useState({ open: false, type: '', editing: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, title: '' });
  const [toast, setToast] = useState(null);
  const [password, setPassword] = useState(Storage.getVal('it_sys_pass', '1234'));
  const [newPass, setNewPass] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const handleLogin = (e) => { e.preventDefault(); if (loginPass === password) { setIsAuthenticated(true); showToast("Acceso Concedido"); } else { showToast("Clave incorrecta"); setLoginPass(''); } };
  
  const generatePDF = async (item, docType) => {
    showToast(`Generando...`);
    const jspdf = await loadJsPDF();
    const doc = new jspdf.jsPDF();
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.text("CIBER CENTRO IT MANAGER", 105, 20, { align: 'center' });
    doc.setTextColor(50, 50, 50); doc.setFontSize(10); doc.text(`CLIENTE: ${cleanStr(item.client)}`, 20, 65);
    doc.text(`RFC: ${item.rfc}`, 20, 72); doc.text(`FOLIO: ${item.folio}`, 140, 65);
    doc.save(`${docType.toUpperCase()}_${item.id}.pdf`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Aceptada': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Cancelada': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'Revision': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Borrador': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-amber-100 text-amber-600 border-amber-200';
    }
  };

  const handleSave = (formData) => {
    const key = `it_${modal.type}s`;
    const currentData = data[`${modal.type}s`];
    let newData = modal.editing ? currentData.map(item => item.id === modal.editing.id ? { ...formData, id: item.id } : item) : [...currentData, { ...formData, id: Date.now() }];
    setData({ ...data, [`${modal.type}s`]: newData });
    Storage.save(key, newData);
    setModal({ open: false, type: '', editing: null });
    showToast('Guardado');
  };

  const confirmDelete = () => {
    const newData = data[`${deleteModal.type}s`].filter(item => item.id !== deleteModal.id);
    setData({ ...data, [`${deleteModal.type}s`]: newData });
    Storage.save(`it_${deleteModal.type}s`, newData);
    setDeleteModal({ open: false, type: '', id: null, title: '' });
    showToast('Eliminado');
  };

  const exportCSV = () => {
    const all = [...data.quotes, ...data.notes, ...data.tickets];
    let csv = "Folio,Fecha,Concepto,Cliente,RFC,Estado,Subtotal,IVA,ISR,MontoTotal\n";
    all.forEach(row => { csv += `"${row.folio || row.id}","${row.date}","${cleanStr(row.title)}","${cleanStr(row.client)}","${row.rfc || ''}","${row.status || 'Aceptada'}","${Number(row.subtotal || 0).toFixed(2)}","${Number(row.iva || 0).toFixed(2)}","${Number(row.isr || 0).toFixed(2)}","${Number(row.amount || 0).toFixed(2)}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `IT_BACKUP_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportXLS = () => {
    const all = [...data.quotes.map(x=>({...x,t:'Cotizacion'})), ...data.notes.map(x=>({...x,t:'Nota Venta'})), ...data.tickets.map(x=>({...x,t:x.ticketSubtype === 'egreso' ? 'Gasto' : 'Ticket'}))];
    let xls = "<html><head><meta charset='utf-8'></head><body><table border='1'><tr style='background:#1e293b; color:#fff'><th>Tipo</th><th>Folio</th><th>Fecha</th><th>Concepto</th><th>Cliente</th><th>RFC</th><th>Estado</th><th>Subtotal</th><th>IVA</th><th>ISR</th><th>Neto</th></tr>";
    all.forEach(row => { xls += `<tr><td>${row.t}</td><td>${row.folio || row.id}</td><td>${row.date}</td><td>${cleanStr(row.title)}</td><td>${cleanStr(row.client)}</td><td>${row.rfc || ''}</td><td>${row.status || 'Aceptada'}</td><td>${Number(row.subtotal || 0).toFixed(2)}</td><td>${Number(row.iva || 0).toFixed(2)}</td><td>${Number(row.isr || 0).toFixed(2)}</td><td>${Number(row.amount || 0).toFixed(2)}</td></tr>`; });
    xls += "</table></body></html>";
    const blob = new Blob([xls], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `REPORT_TI_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").slice(1); 
        const newTickets = [...data.tickets];
        lines.forEach(line => {
          const cols = line.split(",").map(p => p.replace(/"/g, '').trim());
          if (cols.length >= 10) newTickets.push({ id: generateId(), folio: cols[0], date: cols[1], title: cols[2], client: cols[3], rfc: cols[4], status: cols[5], subtotal: parseFloat(cols[6]) || 0, iva: parseFloat(cols[7]) || 0, isr: parseFloat(cols[8]) || 0, amount: parseFloat(cols[9]) || 0, ticketSubtype: 'ingreso', fileName: 'PENDIENTE_SUBIR.pdf' });
        });
        setData({ ...data, tickets: newTickets });
        Storage.save('it_tickets', newTickets);
        showToast("Importado");
      } catch (err) { showToast("Error", "error"); }
    };
    reader.readAsText(file);
  };

  const fiscalReport = useMemo(() => {
    const acceptedQuotes = data.quotes.filter(q => q.status === 'Aceptada');
    const all = [...acceptedQuotes.map(q => ({...q, kind: 'ingreso'})), ...data.notes.map(n => ({...n, kind: 'ingreso'})), ...data.tickets];
    return {
      totalIngresos: all.filter(x => x.kind === 'ingreso' || x.ticketSubtype === 'ingreso').reduce((a, b) => a + Number(b.amount), 0),
      totalEgresos: all.filter(x => x.ticketSubtype === 'egreso').reduce((a, b) => a + Number(b.amount), 0),
      ivaTrasladado: all.filter(x => x.kind === 'ingreso' || x.ticketSubtype === 'ingreso').reduce((a, b) => a + (Number(b.iva) || 0), 0),
      ivaAcreditable: all.filter(x => x.ticketSubtype === 'egreso').reduce((a, b) => a + (Number(b.iva) || 0), 0),
      isrRetenido: all.reduce((a, b) => a + (Number(b.isr) || 0), 0),
      pendingQuotesCount: data.quotes.filter(q => q.status !== 'Aceptada' && q.status !== 'Cancelada').length
    };
  }, [data]);

  const renderListView = (type, IconComp, label) => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
        <div><div className="flex items-center gap-3"><h1 className="text-3xl font-black text-slate-800 tracking-tight italic">{label}</h1><span className="bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-500 shadow-sm border border-white uppercase">{data[`${type}s`].length} Items</span></div></div>
        <button onClick={() => setModal({ open: true, type, editing: null })} className={`${styles.button} bg-slate-900 text-white shadow-2xl hover:bg-black w-full md:w-auto`}><Plus size={20} /> Nuevo Registro</button>
      </div>
      <div className={styles.card}><div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]"><thead><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4 text-left">Concepto</th><th className="px-6 py-4 text-left">Receptor</th><th className="px-6 py-4 text-left">Fecha</th>{type === 'quote' && <th className="px-6 py-4 text-left">Estatus</th>}<th className="px-6 py-4 text-right">Neto</th><th className="px-6 py-4 text-center">Gestion</th></tr></thead><tbody className="divide-y divide-slate-50">
      {data[`${type}s`].map((item) => (
        <tr key={item.id} className="hover:bg-white/40 transition-colors">
          <td className="px-6 py-5 font-bold text-slate-800 leading-tight text-left">{cleanStr(item.title)}</td>
          <td className="px-6 py-5 text-left"><p className="text-[10px] font-black text-indigo-500 uppercase">{cleanStr(item.client)}</p><p className="text-[9px] text-slate-400 font-mono uppercase">{item.folio || item.rfc || 'N/A'}</p></td>
          <td className="px-6 py-5 text-left text-xs text-slate-400 font-bold uppercase">{item.date}</td>
          {type === 'quote' && <td className="px-6 py-5 text-left"><span className={`text-[9px] font-black px-2 py-1 rounded-md border ${getStatusColor(item.status)}`}>{item.status || 'Pendiente'}</span></td>}
          <td className="px-6 py-5 text-right font-black text-slate-800"><div className="flex flex-col items-end"><span>{formatMoney(item.finalTotal || item.amount)}</span>{type === 'ticket' && item.fileName === 'PENDIENTE_SUBIR.pdf' && <span className="text-[7px] text-amber-600 font-black flex items-center gap-1 animate-pulse"><FileWarning size={8}/> PDF Faltante</span>}</div></td>
          <td className="px-6 py-5"><div className="flex justify-center gap-2">
            <button onClick={() => type === 'ticket' ? (item.fileName === 'PENDIENTE_SUBIR.pdf' ? showToast("Vincule PDF", "error") : showToast("Descargando")) : generatePDF(item, type)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">{type === 'ticket' && item.fileName === 'PENDIENTE_SUBIR.pdf' ? <FileWarning size={18}/> : (type === 'ticket' ? <Download size={18}/> : <Printer size={18}/>)}</button>
            <button onClick={() => setModal({ open: true, type, editing: item })} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"><Edit3 size={18}/></button>
            <button onClick={() => setDeleteModal({ open: true, type, id: item.id, title: item.title })} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={18}/></button>
          </div></td>
        </tr>
      ))}
      </tbody></table></div></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${styles.bg} font-sans flex text-slate-800`}>
      {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl font-bold text-sm animate-bounce flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> {toast}</div>}
      
      {!isAuthenticated ? (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#cbd5e1] p-6 animate-in fade-in duration-500 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-sm border border-white">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200"><Lock size={36} className="text-white" /></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">IT FLOW</h1>
            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <input type="password" placeholder="Contraseña" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-center font-bold tracking-widest" autoFocus />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest text-sm">Entrar</button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <aside className={`h-screen sticky top-0 bg-white/40 backdrop-blur-3xl border-r border-white/40 p-6 flex flex-col items-center md:items-stretch transition-all duration-500 ${isCollapsed ? 'w-24' : 'w-24 md:w-72'}`}>
            <div className="flex items-center justify-center md:justify-between mb-16 px-2 text-left"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white shrink-0"><ShieldCheck size={24} /></div>{!isCollapsed && <div className="hidden md:block animate-in fade-in text-left"><h2 className="text-xl font-black tracking-tighter italic leading-none text-left">IT FLOW</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">SISTEMA v5.8</p></div>}</div></div>
            <nav className="flex flex-col gap-4 flex-1 items-center md:items-stretch text-left">
              <button onClick={() => setView('dashboard')} className={`${styles.button} ${view === 'dashboard' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'} ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><LayoutDashboard size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Resumen</span>}</button>
              <div className="h-px bg-slate-200/50 my-2 w-full text-left" />
              <button onClick={() => setView('quote')} className={`${styles.button} ${view === 'quote' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'} ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><FileText size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Cotizaciones</span>}</button>
              <button onClick={() => setView('note')} className={`${styles.button} ${view === 'note' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'} ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><Receipt size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Notas</span>}</button>
              <button onClick={() => setView('ticket')} className={`${styles.button} ${view === 'ticket' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'} ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><Ticket size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Tickets</span>}</button>
              <div className="h-px bg-slate-200/50 my-2 w-full text-left" />
              <button onClick={() => setView('settings')} className={`${styles.button} ${view === 'settings' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'} ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><Settings size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Ajustes</span>}</button>
            </nav>
            <div className="flex flex-col gap-4 items-center md:items-stretch pt-4 text-left"><button onClick={() => setIsAuthenticated(false)} className={`${styles.button} text-red-500 hover:bg-red-50 ${isCollapsed ? 'p-3 justify-center' : 'md:justify-start'}`}><LogOut size={22} className="shrink-0" /> {!isCollapsed && <span className="hidden md:block ml-2 font-black text-xs uppercase tracking-widest">Salir</span>}</button><button onClick={() => setIsCollapsed(!isCollapsed)} className="p-3 rounded-2xl bg-white/50 text-slate-400 border border-white/80 hidden md:flex items-center justify-center">{isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button></div>
          </aside>
          <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full pb-32">
            {view === 'dashboard' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                <header className="flex justify-between items-start text-left"><div><h1 className="text-3xl font-black text-slate-800 tracking-tight italic">Panel Administrativo</h1><p className="text-slate-500 font-medium">Visualizacion fiscal consolidada</p></div><div className="bg-white/80 px-5 py-2.5 rounded-2xl border border-white flex items-center gap-2 shadow-sm"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status: Online</span></div></header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"><StatCard title="Ingresos" amount={fiscalReport.totalIngresos} icon={ArrowUpRight} color="bg-emerald-500" subtitle="Total confirmado" /><StatCard title="IVA Ventas" amount={fiscalReport.ivaTrasladado} icon={Receipt} color="bg-blue-500" subtitle="IVA Ventas" /><StatCard title="Gastos" amount={fiscalReport.totalEgresos} icon={ArrowDownLeft} color="bg-rose-500" subtitle="Tickets de gasto" /><StatCard title="IVA Favor" amount={fiscalReport.ivaAcreditable} icon={ShieldCheck} color="bg-amber-500" subtitle="IVA a favor" /></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  <div className="lg:col-span-2 space-y-6 text-left"><div className={styles.card}><h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 italic text-left"><History size={20} className="text-indigo-500" /> Movimientos del Ciclo</h3><div className="space-y-4">
                  {[...data.quotes.map(q=>({...q, k:'COT'})), ...data.notes.map(n=>({...n, k:'NOT'})), ...data.tickets.map(t=>({...t, k:'TIC'}))].sort((a,b)=>b.id-a.id).slice(0, 6).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white transition-all text-left"><div className="flex items-center gap-4 text-left"><div className={`p-2.5 rounded-xl font-black text-[9px] ${item.ticketSubtype === 'egreso' || item.status === 'Cancelada' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{item.k}</div><div><p className="text-sm font-black text-slate-700 leading-tight">{cleanStr(item.title)}</p><div className="flex items-center gap-2 mt-1"><p className="text-[9px] text-slate-400 font-bold uppercase">{cleanStr(item.client)}</p>{item.status && <span className={`text-[7px] px-1 rounded border ${getStatusColor(item.status)}`}>{item.status}</span>}</div></div></div><div className="text-right text-left"><p className="text-sm font-black text-slate-800">{formatMoney(item.finalTotal || item.amount)}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.date}</p></div></div>
                  ))}</div></div></div>
                  <div className="space-y-8 text-center md:text-left text-left text-left"><div className={`${styles.card} bg-slate-900 text-white relative overflow-hidden ring-4 ring-white shadow-2xl text-left text-left`}><div className="relative z-10 text-left"><p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 text-left">Resumen Consolidado</p><h4 className="text-2xl font-black text-indigo-200 text-left">Utilidad Operativa</h4><p className="text-4xl font-black mt-4 text-emerald-400 drop-shadow-md text-left">{formatMoney(fiscalReport.totalIngresos - fiscalReport.totalEgresos)}</p><div className="mt-10 pt-6 border-t border-white/10 space-y-4 text-left text-left"><div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-left"><span className="text-slate-400">ISR RETENIDO:</span><span className="text-amber-400">{formatMoney(fiscalReport.isrRetenido)}</span></div><div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-left"><span className="text-slate-400">IVA DIFERENCIAL:</span><span className={fiscalReport.ivaTrasladado - fiscalReport.ivaAcreditable > 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatMoney(fiscalReport.ivaTrasladado - fiscalReport.ivaAcreditable)}</span></div></div></div><TrendingUp size={240} className="absolute -bottom-24 -right-24 opacity-10 animate-pulse text-left" /></div></div>
                </div>
              </div>
            )}
            {view === 'quote' && renderListView('quote', FileText, 'Cotizaciones Profesionales')}
            {view === 'note' && renderListView('note', Receipt, 'Notas de Venta')}
            {view === 'ticket' && renderListView('ticket', Ticket, 'Modulo de Tickets')}
            {view === 'settings' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 text-left text-left">
                <header><h1 className="text-3xl font-black text-slate-800 tracking-tight italic text-left">Ajustes</h1></header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left text-left"><div className={styles.card}><div className="flex items-center gap-3 mb-6 text-left"><div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 text-left"><Database size={20}/></div><h3 className="font-black text-slate-800 uppercase text-xs tracking-widest text-left">Respaldos</h3></div><div className="flex flex-col gap-4 text-left">
                <button onClick={exportXLS} className={`${styles.button} ${styles.neumorphicBtn} justify-between group text-left`}><div className="flex items-center gap-3 text-left"><FileSpreadsheet size={20} className="text-emerald-500" /><span className="text-sm font-bold">Descargar Excel</span></div><Download size={16}/></button>
                <button onClick={exportCSV} className={`${styles.button} ${styles.neumorphicBtn} justify-between group text-left`}><div className="flex items-center gap-3 text-left"><FileText size={20} className="text-blue-500" /><span className="text-sm font-bold">Descargar CSV</span></div><Download size={16}/></button></div></div>
                <div className={styles.card}><div className="flex items-center gap-3 mb-6 text-left"><div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 text-left"><Lock size={20}/></div><h3 className="font-black text-slate-800 uppercase text-xs tracking-widest text-left">Seguridad</h3></div><div className="flex gap-2 text-left text-left"><input className={styles.input} type="password" placeholder="Nueva Clave" value={newPass} onChange={e => setNewPass(e.target.value)} /><button onClick={() => { if(newPass.length < 4) return showToast("Minimo 4 carac."); Storage.setVal('it_sys_pass', newPass); setPassword(newPass); setNewPass(''); showToast("Actualizada"); }} className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg active:scale-90 transition-transform text-left"><CheckCircle2 size={20}/></button></div></div>
                <div className={`${styles.card} lg:col-span-2 text-left text-left`}><div className="flex items-center gap-3 mb-6 text-left text-left text-left"><div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 text-left text-left"><Upload size={20}/></div><h3 className="font-black text-slate-800 uppercase text-xs tracking-widest text-left text-left">Importacion Masiva</h3></div><div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left text-left text-left text-left text-left"><div className="space-y-4 text-left text-left text-left"><p className="text-xs text-slate-500 font-medium text-left">Carga registros masivos. Se marcaran como "PDF Faltante" para vincular despues.</p><div className="bg-slate-100 p-5 rounded-2xl border text-[10px] text-indigo-600 font-mono break-all font-black text-left text-left text-left">Folio, Fecha, Concepto, Cliente, RFC, Estado, Subtotal, IVA, ISR, Total</div></div><div className="relative group text-left text-left text-left text-left"><input type="file" accept=".csv" onChange={handleImportCSV} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-left text-left" /><div className="h-full min-h-[160px] border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 group-hover:border-amber-400 group-hover:bg-amber-50 transition-all text-left text-left text-left text-left"><UploadCloud size={32} className="text-amber-500" /><p className="mt-4 text-sm font-black text-slate-400 text-left text-left">Subir Respaldo CSV</p></div></div></div></div></div></div>
            )}
          </main>
        </>
      )}
      <UploadModal isOpen={modal.open} onClose={() => setModal({ open: false, type: '', editing: null })} onSave={handleSave} type={modal.type} editingItem={modal.editing} nextFolio={1} />
      <DeleteConfirmModal isOpen={deleteModal.open} itemTitle={deleteModal.title} onConfirm={confirmDelete} onCancel={() => setDeleteModal({ open: false, type: '', id: null, title: '' })} />
    </div>
  );
}
