'use client';

interface FormSectionProps {
  form: {
    dogumTarihi: string;
    cinsiyet: 'erkek' | 'kadin';
    ilkIsGirisTarihi: string;
    priGunu: number;
    borçlanmaDahil: boolean;
    askerlikBorclanlmasi: number;
    askerlikNedir: 'once' | 'sonra';
    statular: string[];
    lawType?: '5434' | '5510';
  };
  hesaplananIlkIsGirisTarihi?: string;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCheckbox: (statu: string) => void;
  onAskerlikChange: (nedir: 'once' | 'sonra') => void;
  onBorclanmaDahilChange: (dahil: boolean) => void;
  onLawTypeChange?: (lawType: '5434' | '5510') => void;
  onHesapla: () => void;
  onTemizle: () => void;
}

export default function FormSection({
  form, hesaplananIlkIsGirisTarihi, errors,
  onFormChange, onCheckbox, onAskerlikChange,
  onBorclanmaDahilChange, onLawTypeChange, onHesapla, onTemizle,
}: FormSectionProps) {
  const statu = form.statular[0];
  const lawType = form.lawType || '5510';

  return (
    <div className="card overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>

      {/* STATÜ */}
      <div className="section-box bg-blue-50 border-blue-200 mb-3">
        <p className="text-xs font-semibold text-blue-800 mb-2">
          Sigortalılık Statüsü <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-1">
          {[
            { value: '4a', label: '4/a (SSK)' },
            { value: '4b', label: '4/b (Bağ-Kur)' },
            { value: '4c', label: '4/c (Memur)' },
            { value: '2925', label: '2925 (Tarım)' },
          ].map((s) => (
            <label key={s.value} className={`flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg border text-xs transition-all ${
              statu === s.value
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}>
              <input type="radio" name="statular" value={s.value}
                checked={statu === s.value} onChange={() => onCheckbox(s.value)}
                className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        {errors.statular && <p className="text-xs text-red-600 mt-1">{errors.statular}</p>}
      </div>

      {/* 4c için kanun seçimi (statü seçiminin hemen altında) */}
      {statu === '4c' && (
        <div className="section-box bg-orange-50 border-orange-200 mb-3">
          <p className="text-xs font-semibold text-orange-800 mb-2">
            Hangi Kanuna Göre Değerlendirilsin?
          </p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { value: '5434' as const, label: '5434 (Emekli Sandığı)' },
              { value: '5510' as const, label: '5510 (Memur)' },
            ].map((l) => (
              <label key={l.value} className={`flex items-center justify-center gap-1 cursor-pointer px-2 py-1.5 rounded-lg border text-xs transition-all ${
                lawType === l.value
                  ? 'bg-orange-600 text-white border-orange-600 font-semibold'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
              }`}>
                <input type="radio" name="lawType" value={l.value}
                  checked={lawType === l.value}
                  onChange={() => onLawTypeChange?.(l.value)}
                  className="sr-only" />
                {l.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* KİŞİSEL BİLGİLER */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="label">Doğum Tarihi <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="dogumTarihi" 
            value={form.dogumTarihi}
            onChange={(e) => {
              // Otomatik noktalar ekleme: 25011977 → 25.01.1977
              let val = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
              if (val.length >= 2) val = val.slice(0, 2) + '.' + val.slice(2);
              if (val.length >= 5) val = val.slice(0, 5) + '.' + val.slice(5, 9);
              onFormChange({ target: { name: 'dogumTarihi', value: val } } as any);
            }}
            placeholder="GG.AA.YYYY"
            inputMode="numeric"
            pattern="\d{2}\.\d{2}\.\d{4}"
            className={`input-field ${errors.dogumTarihi ? 'border-red-500' : ''}`} 
          />
          {errors.dogumTarihi && <p className="text-xs text-red-600 mt-0.5">{errors.dogumTarihi}</p>}
        </div>
        <div>
          <label className="label">Cinsiyet</label>
          <select name="cinsiyet" value={form.cinsiyet} onChange={onFormChange} className="input-field">
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="label">İlk İşe Giriş Tarihi <span className="text-red-500">*</span></label>
        <input 
          type="text" 
          name="ilkIsGirisTarihi" 
          value={form.ilkIsGirisTarihi}
          onChange={(e) => {
            // Otomatik noktalar ekleme: 01012004 → 01.01.2004
            let val = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
            if (val.length >= 2) val = val.slice(0, 2) + '.' + val.slice(2);
            if (val.length >= 5) val = val.slice(0, 5) + '.' + val.slice(5, 9);
            onFormChange({ target: { name: 'ilkIsGirisTarihi', value: val } } as any);
          }}
          placeholder="GG.AA.YYYY"
          inputMode="numeric"
          pattern="\d{2}\.\d{2}\.\d{4}"
          className={`input-field ${errors.ilkIsGirisTarihi ? 'border-red-500' : ''}`} 
        />
        {errors.ilkIsGirisTarihi && <p className="text-xs text-red-600 mt-0.5">{errors.ilkIsGirisTarihi}</p>}
        {hesaplananIlkIsGirisTarihi && (
          <p className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded">
            ↩ Borçlanma nedeniyle öne çekilen giriş: <strong>{hesaplananIlkIsGirisTarihi}</strong>
          </p>
        )}
      </div>

      {/* PRİM GÜNÜ + BORÇLANMA */}
      <div className="mb-3">
        <label className="label">Prim Günü <span className="text-red-500">*</span></label>
        <input type="number" name="priGunu" value={form.priGunu || ''} onChange={onFormChange}
          min="0" max="20000" placeholder="0" className={`input-field ${errors.priGunu ? 'border-red-500' : ''}`} />
        {errors.priGunu && <p className="text-xs text-red-600 mt-0.5">{errors.priGunu}</p>}
        <div className="flex gap-3 mt-1.5">
          {[{ val: false, label: 'Borçlanma hariç' }, { val: true, label: 'Borçlanma dahil' }].map(opt => (
            <label key={String(opt.val)} className="flex items-center gap-1 cursor-pointer text-xs text-gray-600">
              <input type="radio" name="borclanmaDahil" checked={form.borçlanmaDahil === opt.val}
                onChange={() => onBorclanmaDahilChange(opt.val)}
                className="w-3 h-3 text-blue-600" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* ASKERLİK */}
      <div className="section-box bg-blue-50 border-blue-200 mb-3">
        <p className="text-xs font-semibold text-blue-800 mb-2">Askerlik Borçlanması (Gün)</p>
        <input type="number" name="askerlikBorclanlmasi" value={form.askerlikBorclanlmasi || ''}
          onChange={onFormChange} min="0" placeholder="0" className="input-field mb-2" />
        <div className="flex gap-4">
          {[
            { val: 'once' as const, label: 'İlk İşe Girişten ÖNCE', desc: '(borçlanma nedeniyle öne çekilir)' },
            { val: 'sonra' as const, label: 'İlk İşe Girişten SONRA', desc: '(sadece gün eklenir)' },
          ].map(opt => (
            <label key={opt.val} className="flex items-start gap-1.5 cursor-pointer text-xs text-gray-700">
              <input type="radio" name="askerlikNedir" value={opt.val}
                checked={form.askerlikNedir === opt.val}
                onChange={() => onAskerlikChange(opt.val)}
                className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
              <span><strong>{opt.label}</strong><span className="block text-gray-400">{opt.desc}</span></span>
            </label>
          ))}
        </div>
      </div>

      {/* HESAPLA + TEMİZLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
        <button onClick={onHesapla}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md text-sm">
          Hesapla →
        </button>
        <button onClick={onTemizle}
          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-1.5 rounded-lg transition-all shadow-sm text-xs">
          Temizle ✕
        </button>
      </div>
    </div>
  );
}
