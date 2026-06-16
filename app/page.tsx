'use client';

import React, { useState } from 'react';

interface FormData {
  status: '4a' | '4b' | '4c' | '2925' | '';
  dogumTarihi: string;
  cinsiyet: 'erkek' | 'kadin';
  ilkGirisTarihi: string;
  priGunu: number;
  borçlanmaOption: 'hariç' | 'dahil';
  borçlanmaGunu: number;
  askerlikGunu: number;
  askerlikNedir: 'once' | 'sonra';
  malulukTuru: 'yok' | 'sk284' | 'sk285';
  derece: '%40-%49' | '%50-%59' | '';
  malulTarihi: string;
}

interface RetirementResult {
  name: string;
  type: string;
  uygun: boolean;
  kosullar: {
    ad: string;
    gerekli: string;
    sahip: string;
    basarili: boolean;
  }[];
  notlar?: string;
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    status: '',
    dogumTarihi: '',
    cinsiyet: 'erkek',
    ilkGirisTarihi: '',
    priGunu: 0,
    borçlanmaOption: 'hariç',
    borçlanmaGunu: 0,
    askerlikGunu: 0,
    askerlikNedir: 'sonra',
    malulukTuru: 'yok',
    derece: '',
    malulTarihi: '',
  });

  const [results, setResults] = useState<RetirementResult[] | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.status || !formData.dogumTarihi || !formData.ilkGirisTarihi) {
      alert('Lütfen zorunlu alanları doldurunuz');
      return;
    }

    const dogumTarihi = parseDate(formData.dogumTarihi);
    const ilkGirisTarihi = parseDate(formData.ilkGirisTarihi);

    if (!dogumTarihi || !ilkGirisTarihi) {
      alert('Tarih formatı DD.MM.YYYY olmalıdır');
      return;
    }

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          dogumTarihi: formData.dogumTarihi,
          cinsiyet: formData.cinsiyet,
          ilkGirisTarihi: formData.ilkGirisTarihi,
          priGunu: formData.priGunu,
          borçlanmaOption: formData.borçlanmaOption,
          borçlanmaGunu: formData.borçlanmaOption === 'dahil' ? formData.borçlanmaGunu : 0,
          askerlikGunu: formData.askerlikGunu,
          askerlikNedir: formData.askerlikNedir,
          malulukTuru: formData.malulukTuru,
          derece: formData.derece || null,
          malulTarihi: formData.malulTarihi,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setSubmitted(true);
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      alert('Hesaplama başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
        {/* FORM PANEL */}
        <div className="col-span-1 sticky top-4 h-fit">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">SGK Emeklilik Hak Hesaplayıcı</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statü *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="4a">4/a - SSK</option>
                  <option value="4b">4/b - Bağ-Kur</option>
                  <option value="4c">4/c - Memur</option>
                  <option value="2925">2925 - Tarım</option>
                </select>
              </div>

              {/* DOĞUM TARİHİ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi (DD.MM.YYYY) *</label>
                <input
                  type="text"
                  value={formData.dogumTarihi}
                  onChange={(e) => setFormData({ ...formData, dogumTarihi: e.target.value })}
                  placeholder="01.01.1985"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* CİNSİYET */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="erkek"
                      checked={formData.cinsiyet === 'erkek'}
                      onChange={(e) => setFormData({ ...formData, cinsiyet: 'erkek' })}
                    />
                    <span className="text-sm">Erkek</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="kadin"
                      checked={formData.cinsiyet === 'kadin'}
                      onChange={(e) => setFormData({ ...formData, cinsiyet: 'kadin' })}
                    />
                    <span className="text-sm">Kadın</span>
                  </label>
                </div>
              </div>

              {/* İLK GİRİŞ TARİHİ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlk Giriş Tarihi (DD.MM.YYYY) *</label>
                <input
                  type="text"
                  value={formData.ilkGirisTarihi}
                  onChange={(e) => setFormData({ ...formData, ilkGirisTarihi: e.target.value })}
                  placeholder="01.01.2010"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* PRİM GÜNÜ & BORÇLANMA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prim Günü *</label>
                <input
                  type="number"
                  value={formData.priGunu}
                  onChange={(e) => setFormData({ ...formData, priGunu: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />

                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="hariç"
                      checked={formData.borçlanmaOption === 'hariç'}
                      onChange={(e) => setFormData({ ...formData, borçlanmaOption: 'hariç' })}
                    />
                    <span className="text-sm">Borçlanma Hariç</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="dahil"
                      checked={formData.borçlanmaOption === 'dahil'}
                      onChange={(e) => setFormData({ ...formData, borçlanmaOption: 'dahil' })}
                    />
                    <span className="text-sm">Borçlanma Dahil</span>
                  </label>
                </div>

                {formData.borçlanmaOption === 'dahil' && (
                  <input
                    type="number"
                    value={formData.borçlanmaGunu}
                    onChange={(e) => setFormData({ ...formData, borçlanmaGunu: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Borçlanma Günü"
                  />
                )}
              </div>

              {/* ASKERLİK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Askerlik Günü</label>
                <input
                  type="number"
                  value={formData.askerlikGunu}
                  onChange={(e) => setFormData({ ...formData, askerlikGunu: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="once"
                      checked={formData.askerlikNedir === 'once'}
                      onChange={(e) => setFormData({ ...formData, askerlikNedir: 'once' })}
                    />
                    <span>Çalışmadan önce</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="sonra"
                      checked={formData.askerlikNedir === 'sonra'}
                      onChange={(e) => setFormData({ ...formData, askerlikNedir: 'sonra' })}
                    />
                    <span>Çalıştıktan sonra</span>
                  </label>
                </div>
              </div>

              {/* MALÜLLÜK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Malüllük Türü</label>
                <select
                  value={formData.malulukTuru}
                  onChange={(e) => setFormData({ ...formData, malulukTuru: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="yok">Yok</option>
                  <option value="sk284">SK 28/4 (İlk İşe Girişte)</option>
                  <option value="sk285">SK 28/5 (Sonradan)</option>
                </select>
              </div>

              {/* DERECE & TARİH */}
              {formData.malulukTuru === 'sk285' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Derece</label>
                    <select
                      value={formData.derece}
                      onChange={(e) => setFormData({ ...formData, derece: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seçiniz</option>
                      <option value="%40-%49">%40-%49</option>
                      <option value="%50-%59">%50-%59</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Malüllük Tarihi</label>
                    <input
                      type="text"
                      value={formData.malulTarihi}
                      onChange={(e) => setFormData({ ...formData, malulTarihi: e.target.value })}
                      placeholder="01.01.2015"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition"
              >
                Hesapla
              </button>
            </form>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="col-span-2">
          {submitted && results ? (
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-4 shadow-md border-l-4 ${
                    result.uygun
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-400'
                  }`}
                >
                  <h3 className="font-bold text-lg mb-2">{result.name}</h3>
                  <div className="space-y-1 text-sm">
                    {result.kosullar.map((k, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{k.ad}:</span>
                        <span className={k.basarili ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                          {k.sahip}/{k.gerekli}
                        </span>
                      </div>
                    ))}
                  </div>
                  {result.notlar && <p className="text-xs text-gray-600 mt-2 italic">{result.notlar}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              Form doldurarak hesaplama yapınız
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
