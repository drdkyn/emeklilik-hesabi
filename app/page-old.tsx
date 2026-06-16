'use client';

import { useState } from 'react';
import { calculateRetirement, CalculationResult } from '@/lib/calculator';

export default function Home() {
  const [formData, setFormData] = useState({
    birthDate: '',
    entryDate: '',
    gender: 'erkek' as 'erkek' | 'kadin',
    status: '4a' as string,
    premiumDays: 0,
    maluluk: 'yok' as 'yok' | 'sk284' | 'sk285',
    degree: '' as '' | '%40-%49' | '%50-%59' | '%60+',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    const errs: string[] = [];

    if (!formData.birthDate) errs.push('Doğum tarihi zorunludur (DD.MM.YYYY)');
    if (!formData.entryDate) errs.push('İlk işe giriş tarihi zorunludur (DD.MM.YYYY)');
    if (!formData.status) errs.push('Statü seçiniz');

    // Tarih validasyon
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (formData.birthDate && !dateRegex.test(formData.birthDate)) {
      errs.push('Doğum tarihi format: DD.MM.YYYY');
    }
    if (formData.entryDate && !dateRegex.test(formData.entryDate)) {
      errs.push('İlk işe giriş tarihi format: DD.MM.YYYY');
    }

    if (formData.maluluk === 'sk285' && !formData.degree) {
      errs.push('SK 28/5 için engel derecesi seçiniz');
    }

    setErrors(errs);

    if (errs.length === 0 && formData.birthDate && formData.entryDate) {
      const res = calculateRetirement(
        formData.birthDate,
        formData.entryDate,
        formData.gender,
        formData.status,
        formData.premiumDays,
        formData.maluluk !== 'yok' ? { type: formData.maluluk as 'sk284' | 'sk285', degree: formData.degree as any } : undefined
      );
      setResult(res);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SGK Emeklilik Hesaplama</h1>
          <p className="text-gray-600">Yaştan emeklilik, normal emeklilik ve malüllük şartlarını kontrol edin</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Statü */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sigortalılık Statüsü *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="4a">4/a (SSK)</option>
                <option value="4b">4/b (Bağ-Kur)</option>
                <option value="4c">4/c (Memur)</option>
                <option value="2925">2925 (Tarım Sigortası)</option>
              </select>
            </div>

            {/* Doğum Tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi (DD.MM.YYYY) *</label>
              <input
                type="text"
                name="birthDate"
                placeholder="01.01.1980"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* İlk İşe Giriş Tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İlk İşe Giriş Tarihi (DD.MM.YYYY) *</label>
              <input
                type="text"
                name="entryDate"
                placeholder="15.06.2005"
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Cinsiyet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
              </select>
            </div>

            {/* Prim Günü */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prim Günü</label>
              <input
                type="number"
                name="premiumDays"
                value={formData.premiumDays}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Malüllük Durumu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Malüllük/Engelli Durumu</label>
              <select
                name="maluluk"
                value={formData.maluluk}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="yok">Yok</option>
                <option value="sk284">SK 28/4 (İlk işe girişte malül)</option>
                <option value="sk285">SK 28/5 (İşe girdikten sonra malül - Derece bazlı)</option>
              </select>
            </div>

            {/* Derece (SK 28/5 için) */}
            {formData.maluluk === 'sk285' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engel Derecesi *</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Seçiniz</option>
                  <option value="%40-%49">%40-%49 (Hafif)</option>
                  <option value="%50-%59">%50-%59 (Orta)</option>
                  <option value="%60+">%60+ (Ağır)</option>
                </select>
              </div>
            )}

            {/* Hata Mesajları */}
            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hesapla Butonu */}
            <button
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Hesapla
            </button>
          </div>
        </div>

        {/* Sonuçlar */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hesaplama Sonuçları</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Yaş</p>
                <p className="text-2xl font-bold text-blue-600">{result.age}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Hizmet Yılı</p>
                <p className="text-2xl font-bold text-green-600">{result.serviceYears}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Prim Günü</p>
                <p className="text-2xl font-bold text-purple-600">{result.days}</p>
              </div>
            </div>

            {result.results.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">Hiçbir emeklilik şartı sağlanmamıştır.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {result.results.map((res, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 ${
                      res.uygun ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{res.name}</h3>
                      {res.uygun && (
                        <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          ✓ UYGUN
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {res.conditions.map((cond, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{cond.label}:</span>
                          <div className="flex items-center gap-2">
                            <span className={cond.met ? 'text-green-700 font-bold' : 'text-red-700'}>
                              {cond.have} / {cond.required}
                            </span>
                            {cond.met && <span className="text-green-600">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
