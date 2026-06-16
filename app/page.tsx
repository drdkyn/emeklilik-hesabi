'use client';

import { useState } from 'react';
import FormSection from '@/components/FormSection';
import StatCard from '@/components/StatCard';
import { calculateRetirementOptionsDB } from '@/lib/calculator-db';

interface KosulSatir {
  ad: string;
  gerekli: string;
  sahip: string;
  basarili: boolean;
}

interface HesapSonucu {
  name: string;
  type: string;
  uygun: boolean;
  kosullar: KosulSatir[];
  notlar?: string;
}

interface FormState {
  dogumTarihi: string;
  cinsiyet: 'erkek' | 'kadin';
  ilkIsGirisTarihi: string;
  priGunu: number;
  askerlikBorclanlmasi: number;
  askerlikNedir: 'once' | 'sonra';
  statular: string[];
  malulBirimi?: string;
  malulDerece?: string;
  bagimaMuhtac?: boolean;
}

function parseDate(str: string): Date {
  // HTML date input: YYYY-MM-DD
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    dogumTarihi: '',
    cinsiyet: 'erkek',
    ilkIsGirisTarihi: '',
    priGunu: 0,
    askerlikBorclanlmasi: 0,
    askerlikNedir: 'sonra',
    statular: [],
    malulBirimi: 'yok',
    malulDerece: '',
    bagimaMuhtac: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sonuclar, setSonuclar] = useState<HesapSonucu[] | null>(null);
  const [ozet, setOzet] = useState<{ yas: number; hizmetYili: number; toplamGun: number } | null>(null);

  // Askerlik ÖNCE ise ilk işe giriş tarihini geri çek
  const hesaplananIlkIsGirisTarihi = (() => {
    if (
      form.askerlikNedir === 'once' &&
      form.askerlikBorclanlmasi > 0 &&
      form.ilkIsGirisTarihi
    ) {
      const d = parseDate(form.ilkIsGirisTarihi);
      d.setDate(d.getDate() - form.askerlikBorclanlmasi);
      return formatDate(d);
    }
    return undefined;
  })();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'priGunu' || name === 'askerlikBorclanlmasi' ? Number(value) : value,
    }));
  };

  const handleCheckbox = (statu: string) => {
    setForm(prev => ({ ...prev, statular: [statu], malulBirimi: 'yok', malulDerece: '' }));
  };

  const handleAskerlikChange = (nedir: 'once' | 'sonra') => {
    setForm(prev => ({ ...prev, askerlikNedir: nedir }));
  };

  const handleMalulBirimiChange = (birim: string) => {
    setForm(prev => ({ ...prev, malulBirimi: birim, malulDerece: '' }));
  };

  const handleMalulDereceChange = (derece: string) => {
    setForm(prev => ({ ...prev, malulDerece: derece }));
  };

  const handleBagimaMuhtacChange = (value: boolean) => {
    setForm(prev => ({ ...prev, bagimaMuhtac: value }));
  };

  const handleHesapla = () => {
    const errs: Record<string, string> = {};

    if (!form.dogumTarihi) errs.dogumTarihi = 'Doğum tarihi zorunludur';
    if (!form.ilkIsGirisTarihi) errs.ilkIsGirisTarihi = 'İlk işe giriş tarihi zorunludur';
    if (form.statular.length === 0) errs.statular = 'Sigortalılık statüsü seçiniz';
    if (form.malulBirimi === 'sk28/5' && !form.malulDerece) {
      errs.malulDerece = 'Engelli derece seçiniz';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const dogumTarihi = parseDate(form.dogumTarihi);
    const ilkGirisTarihi = parseDate(form.ilkIsGirisTarihi);
    const status = form.statular[0] as '4a' | '4b' | '4c' | '2925';

    // Malüllük tipini dönüştür
    const malulMap: Record<string, 'yok' | 'sk284' | 'sk285'> = {
      'yok': 'yok',
      'sk28/4': 'sk284',
      'sk28/5': 'sk285',
    };
    const malulukTuru = malulMap[form.malulBirimi || 'yok'] || 'yok';

    const results = calculateRetirementOptionsDB({
      status,
      dogumTarihi,
      cinsiyet: form.cinsiyet,
      ilkGirisTarihi,
      priGunu: form.priGunu,
      borçlanmaOption: 'hariç',
      borçlanmaGunu: 0,
      askerlikGunu: form.askerlikBorclanlmasi,
      askerlikNedir: form.askerlikNedir,
      malulukTuru,
      derece: form.malulDerece || null,
      malulTarihi: null,
    });

    // Yaş ve hizmet yılı
    const today = new Date();
    let yas = today.getFullYear() - dogumTarihi.getFullYear();
    if (
      today.getMonth() < dogumTarihi.getMonth() ||
      (today.getMonth() === dogumTarihi.getMonth() && today.getDate() < dogumTarihi.getDate())
    ) yas--;

    let hizmetYili = today.getFullYear() - ilkGirisTarihi.getFullYear();
    if (
      today.getMonth() < ilkGirisTarihi.getMonth() ||
      (today.getMonth() === ilkGirisTarihi.getMonth() && today.getDate() < ilkGirisTarihi.getDate())
    ) hizmetYili--;

    const toplamGun = form.priGunu + form.askerlikBorclanlmasi;

    setOzet({ yas, hizmetYili, toplamGun });
    setSonuclar(results);

    // Mobilde form'dan sonuca scroll et
    setTimeout(() => {
      document.getElementById('sonuclar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const uygunSayisi = sonuclar?.filter(s => s.uygun).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-4">

        {/* Başlık */}
        <div className="text-center py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SGK Emeklilik Hesaplama</h1>
          <p className="text-gray-500 text-sm mt-1">Normal, Yaştan ve Malüllük Emeklilik Şartları</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* SOL: FORM */}
          <div className="w-full lg:w-80 shrink-0">
            <FormSection
              form={form}
              hesaplananIlkIsGirisTarihi={hesaplananIlkIsGirisTarihi}
              errors={errors}
              onFormChange={handleFormChange}
              onCheckbox={handleCheckbox}
              onAskerlikChange={handleAskerlikChange}
              onMalulBirimiChange={handleMalulBirimiChange}
              onMalulDereceChange={handleMalulDereceChange}
              onBagimaMuhtacChange={handleBagimaMuhtacChange}
              onHesapla={handleHesapla}
            />
          </div>

          {/* SAĞ: SONUÇLAR */}
          <div className="flex-1" id="sonuclar">
            {sonuclar === null ? (
              /* Hesaplama yapılmadan önce */
              <div className="card flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Bilgileri Girin</h2>
                <p className="text-gray-400 text-sm max-w-sm">
                  Sol taraftaki formu doldurup <strong>Hesapla</strong> butonuna basın.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* ÖZET KARTLARI */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Yaş" value={ozet!.yas} />
                  <StatCard label="Hizmet Yılı" value={ozet!.hizmetYili} />
                  <StatCard label="Toplam Gün" value={ozet!.toplamGun} />
                </div>

                {/* UYGUN SONUÇ BANNER */}
                {uygunSayisi > 0 ? (
                  <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 text-center">
                    <p className="text-green-800 font-bold text-lg">
                      ✅ {uygunSayisi} emeklilik şartı sağlanmaktadır
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-bold text-lg">
                      ⚠️ Henüz hiçbir emeklilik şartı sağlanmamaktadır
                    </p>
                  </div>
                )}

                {/* SONUÇ KARTLARI */}
                {sonuclar.map((sonuc, idx) => (
                  <div
                    key={idx}
                    className={`card ${sonuc.uygun ? 'card-success' : 'card-warning'}`}
                  >
                    {/* Kart Başlık */}
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-opacity-30 border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{sonuc.uygun ? '✅' : '⏳'}</span>
                        <h3 className={`font-semibold text-base ${sonuc.uygun ? 'text-green-900' : 'text-yellow-900'}`}>
                          {sonuc.name}
                        </h3>
                      </div>
                      {sonuc.uygun && (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0">
                          UYGUN
                        </span>
                      )}
                    </div>

                    {/* Koşullar */}
                    <div className="space-y-3">
                      {sonuc.kosullar.map((kosul, ki) => (
                        <div key={ki}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 font-medium text-gray-800">
                              <span className={kosul.basarili ? 'text-green-600' : 'text-gray-400'}>
                                {kosul.basarili ? '✓' : '○'}
                              </span>
                              {kosul.ad}
                            </span>
                            <span className={`font-mono font-bold text-xs ${kosul.basarili ? 'text-green-700' : 'text-gray-500'}`}>
                              {kosul.sahip} / {kosul.gerekli || '—'}
                            </span>
                          </div>
                          {/* İlerleme çubuğu */}
                          {kosul.gerekli && kosul.gerekli !== '—' && !isNaN(Number(kosul.sahip)) && !isNaN(Number(kosul.gerekli)) && (
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${kosul.basarili ? 'bg-green-500' : 'bg-yellow-400'}`}
                                style={{ width: `${Math.min(Math.round((Number(kosul.sahip) / Number(kosul.gerekli)) * 100), 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Notlar */}
                    {sonuc.notlar && (
                      <p className="text-xs text-gray-600 mt-3 italic border-t border-gray-200 pt-2">
                        💡 {sonuc.notlar}
                      </p>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
