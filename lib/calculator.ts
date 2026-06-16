export interface EmeklilikKosulu {
  adi: string;
  kosullar: {
    ad: string;
    gerekli: number | null;
    sahip: number;
    basarili: boolean;
  }[];
  tamamlandi: boolean;
}

export interface HesaplamaResultati {
  yas: number;
  hizmetYili: number;
  priGunleri: number;
  hesaplananIlkIsGirisTarihi?: string;
  emeklilikKosullari: EmeklilikKosulu[];
  yakinEmeklilik: {
    adi: string;
    tarih: Date;
    kalan: number;
  } | null;
}

// EYT Tarihi: 08.09.1999 DAHİL ÖNCESI
const EYT_SINIR_TARIHI = new Date(1999, 8, 8); // 08.09.1999 dahil

// Engelli (Malul) Gün Tablosu - Dönem bazlı (5510 SK 28/4)
const ENGELLI_GUN_TABLOSU: { basla: Date; bitis?: Date; gun: number }[] = [
  { basla: new Date(1900, 0, 1), bitis: new Date(2008, 9, 30), gun: 3600 }, // 2008 Ekim öncesi
  { basla: new Date(2008, 9, 1), bitis: new Date(2008, 11, 31), gun: 3700 },
  { basla: new Date(2009, 0, 1), bitis: new Date(2009, 11, 31), gun: 3800 },
  { basla: new Date(2010, 0, 1), bitis: new Date(2010, 11, 31), gun: 3900 },
  { basla: new Date(2011, 0, 1), bitis: undefined, gun: 3960 },
];

export const parseDate = (str: string): Date => new Date(str);

export const dateFark = (d1: Date, d2: Date): number => {
  return Math.floor((d2.getTime() - d1.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

// Engelli gün şartını tarih bazlı al
const getEngelliGun = (tarih: Date): number => {
  for (const tab of ENGELLI_GUN_TABLOSU) {
    const bitisTarihi = tab.bitis || new Date(2099, 11, 31);
    if (tarih >= tab.basla && tarih <= bitisTarihi) {
      return tab.gun;
    }
  }
  return 3960; // varsayılan
};

export const hesaplaEmeklilik = (
  dogumTarihi: string,
  ilkIsGirisTarihi: string,
  priGunu: number,
  askerlikBorclanlmasi: number,
  askerlikNedir: 'once' | 'sonra',
  cinsiyet: 'erkek' | 'kadin',
  statular: string[],
  ilkIsGirisOnceEngelliMi?: boolean
): HesaplamaResultati => {
  const dogumTar = parseDate(dogumTarihi);
  const originalIlkGirisTar = parseDate(ilkIsGirisTarihi);
  const simdiBugnu = new Date();

  // Eğer askerlik borçlanması "ilk işe girişten önce" ise, tarihi geri çek
  let ilkGirisTar = originalIlkGirisTar;
  let hesaplananIlkIsGirisTarihi = '';
  
  if (askerlikNedir === 'once' && askerlikBorclanlmasi > 0) {
    ilkGirisTar = new Date(originalIlkGirisTar);
    ilkGirisTar.setDate(ilkGirisTar.getDate() - askerlikBorclanlmasi);
    hesaplananIlkIsGirisTarihi = ilkGirisTar.toLocaleDateString('tr-TR');
  }

  const yas = dateFark(dogumTar, simdiBugnu);
  const hizmetYili = dateFark(ilkGirisTar, simdiBugnu);
  const priGunleri = priGunu + askerlikBorclanlmasi;

  const emeklilikKosullari: EmeklilikKosulu[] = [];

  // ===== 4/a (SSK) =====
  if (statular.includes('4a')) {
    // EYT: 08.09.1999 DAHİL ÖNCESI
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/a (SSK) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: 5000,
            sahip: priGunleri,
            basarili: priGunleri >= 5000,
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) && priGunleri >= 5000,
      });
    }

    // Yaştan Emeklilik
    emeklilikKosullari.push({
      adi: '4/a (SSK) - Yaştan Emeklilik',
      kosullar: [
        {
          ad: 'Yaş',
          gerekli: cinsiyet === 'erkek' ? 60 : 55,
          sahip: yas,
          basarili: yas >= (cinsiyet === 'erkek' ? 60 : 55),
        },
        {
          ad: 'Hizmet Yılı',
          gerekli: 15,
          sahip: hizmetYili,
          basarili: hizmetYili >= 15,
        },
        {
          ad: 'Prim Günü',
          gerekli: 3600,
          sahip: priGunleri,
          basarili: priGunleri >= 3600,
        },
      ],
      tamamlandi:
        yas >= (cinsiyet === 'erkek' ? 60 : 55) &&
        hizmetYili >= 15 &&
        priGunleri >= 3600,
    });

    // Engelli Emeklilik (İlk işe girişten ÖNCE engelli) - 5510 SK 28/4
    if (ilkIsGirisOnceEngelliMi) {
      const engelliGun = getEngelliGun(originalIlkGirisTar);
      emeklilikKosullari.push({
        adi: '4/a (SSK) - Engelli Emeklilik (Yaşsız)',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: 15,
            sahip: hizmetYili,
            basarili: hizmetYili >= 15,
          },
          {
            ad: `Prim Günü (${engelliGun} gün)`,
            gerekli: engelliGun,
            sahip: priGunleri,
            basarili: priGunleri >= engelliGun,
          },
        ],
        tamamlandi: hizmetYili >= 15 && priGunleri >= engelliGun,
      });
    }
  }

  // ===== 4/b (Bağ-Kur) =====
  if (statular.includes('4b')) {
    // 08.09.1999 DAHİL ÖNCESI
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: cinsiyet === 'erkek' ? 9000 : 7200,
            sahip: priGunleri,
            basarili: priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) &&
          priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
      });
    }

    // 09.09.1999 - 30.04.2008
    if (ilkGirisTar >= parseDate('1999-09-09') && ilkGirisTar <= parseDate('2008-04-30')) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - 5510 SK Geçici 9/1',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Hizmet Yılı',
            gerekli: 25,
            sahip: hizmetYili,
            basarili: hizmetYili >= 25,
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
          hizmetYili >= 25 &&
          priGunleri >= 9000,
      });
    }

    // 01.05.2008 ve sonrası
    if (ilkGirisTar >= parseDate('2008-05-01')) {
      emeklilikKosullari.push({
        adi: '4/b (Bağ-Kur) - 5510 SK Md.28/2',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) && priGunleri >= 9000,
      });
    }
  }

  // ===== 4/c (Memur) =====
  if (statular.includes('4c')) {
    // 08.09.1999 DAHİL ÖNCESI
    if (ilkGirisTar <= EYT_SINIR_TARIHI) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - EYT Yaşsız',
        kosullar: [
          {
            ad: 'Hizmet Yılı',
            gerekli: cinsiyet === 'erkek' ? 25 : 20,
            sahip: hizmetYili,
            basarili: hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20),
          },
          {
            ad: 'Prim Günü',
            gerekli: cinsiyet === 'erkek' ? 9000 : 7200,
            sahip: priGunleri,
            basarili: priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
          },
        ],
        tamamlandi:
          hizmetYili >= (cinsiyet === 'erkek' ? 25 : 20) &&
          priGunleri >= (cinsiyet === 'erkek' ? 9000 : 7200),
      });
    }

    // 09.09.1999 - 30.04.2008
    if (ilkGirisTar >= parseDate('1999-09-09') && ilkGirisTar <= parseDate('2008-04-30')) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - İstekle Emeklilik',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Hizmet Yılı',
            gerekli: 25,
            sahip: hizmetYili,
            basarili: hizmetYili >= 25,
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
          hizmetYili >= 25 &&
          priGunleri >= 9000,
      });
    }

    // 01.05.2008 ve sonrası
    if (ilkGirisTar >= parseDate('2008-05-01')) {
      emeklilikKosullari.push({
        adi: '4/c (Memur) - 5510 SK Md.28/2',
        kosullar: [
          {
            ad: 'Yaş',
            gerekli: cinsiyet === 'erkek' ? 60 : 58,
            sahip: yas,
            basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
          },
          {
            ad: 'Prim Günü',
            gerekli: 9000,
            sahip: priGunleri,
            basarili: priGunleri >= 9000,
          },
        ],
        tamamlandi:
          yas >= (cinsiyet === 'erkek' ? 60 : 58) && priGunleri >= 9000,
      });
    }
  }

  // ===== 2925 (Tarım Sigortası) =====
  if (statular.includes('2925')) {
    emeklilikKosullari.push({
      adi: '2925 (Tarım Sigortası) - Emeklilik',
      kosullar: [
        {
          ad: 'Yaş',
          gerekli: cinsiyet === 'erkek' ? 60 : 58,
          sahip: yas,
          basarili: yas >= (cinsiyet === 'erkek' ? 60 : 58),
        },
        {
          ad: 'Hizmet Yılı',
          gerekli: 15,
          sahip: hizmetYili,
          basarili: hizmetYili >= 15,
        },
        {
          ad: 'Prim Günü',
          gerekli: 3600,
          sahip: priGunleri,
          basarili: priGunleri >= 3600,
        },
      ],
      tamamlandi:
        yas >= (cinsiyet === 'erkek' ? 60 : 58) &&
        hizmetYili >= 15 &&
        priGunleri >= 3600,
    });
  }

  let yakinEmeklilik: {
    adi: string;
    tarih: Date;
    kalan: number;
  } | null = null;

  if (statular.length > 0) {
    const hedefler: { adi: string; tarih: Date; kalan: number }[] = [];

    if (statular.includes('4a')) {
      const yasTam = new Date(dogumTar);
      yasTam.setFullYear(yasTam.getFullYear() + 60);
      const kalan = dateFark(simdiBugnu, yasTam);
      if (kalan > 0) {
        hedefler.push({ adi: '4/a Yaştan (60)', tarih: yasTam, kalan });
      }
    }

    if (hedefler.length > 0) {
      hedefler.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
      yakinEmeklilik = hedefler[0];
    }
  }

  return {
    yas,
    hizmetYili,
    priGunleri,
    hesaplananIlkIsGirisTarihi,
    emeklilikKosullari,
    yakinEmeklilik,
  };
};
