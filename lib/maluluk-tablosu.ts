// Malüllük/Engellilik Derecelerine Göre Şartlar
// Excel Kaynakları: Kitap2.xlsx (4/a), Kitap1.xlsx (4/b, 4/c)

export interface MalullikSarti {
  derece: string; // '%40-%49', '%50-%59', '%60+'
  hizmetYili: number;
  gunSayisi: number;
  aciklama?: string;
}

export interface MalullikTablosu {
  statü: '4a' | '4b' | '4c';
  tip: 'sk28/4' | 'sk28/5'; // 4=İlk işe girişte, 5=İşe girdikten sonra
  saritlar: MalullikSarti[];
}

// ============= 4/a (SSK) - 5510 SK 28/5 =============
// İşe girdikten sonra malül olan sigortalılar
export const malullik4a: MalullikTablosu = {
  statü: '4a',
  tip: 'sk28/5',
  saritlar: [
    {
      derece: '%40-%49',
      hizmetYili: 20,
      gunSayisi: 5075,
      aciklama: 'Çalışma gücü kayıp oranı %40-%49 arası',
    },
    {
      derece: '%50-%59',
      hizmetYili: 20,
      gunSayisi: 5300,
      aciklama: 'Çalışma gücü kayıp oranı %50-%59 arası',
    },
    {
      derece: '%60+',
      hizmetYili: 20,
      gunSayisi: 5450,
      aciklama: 'Çalışma gücü kayıp oranı %60 ve üzeri',
    },
  ],
};

// ============= 4/b (Bağ-Kur) - 5510 SK 28/5 =============
export const malullik4b: MalullikTablosu = {
  statü: '4b',
  tip: 'sk28/5',
  saritlar: [
    {
      derece: '%40-%49',
      hizmetYili: 15,
      gunSayisi: 5400,
      aciklama: 'Çalışma gücü kayıp oranı %40-%49 arası',
    },
    {
      derece: '%50-%59',
      hizmetYili: 15,
      gunSayisi: 5400,
      aciklama: 'Çalışma gücü kayıp oranı %50-%59 arası',
    },
    {
      derece: '%60+',
      hizmetYili: 15,
      gunSayisi: 3960,
      aciklama: 'Çalışma gücü kayıp oranı %60 ve üzeri',
    },
  ],
};

// ============= 4/c (Memur) - Engelli İştirakçiler =============
// 27.04.2005 öncesi vs sonrası farklı şartlar var
export const malullik4c_oncesi: MalullikTablosu = {
  statü: '4c',
  tip: 'sk28/5',
  saritlar: [
    {
      derece: '%40-%49',
      hizmetYili: 15,
      gunSayisi: 6480,
      aciklama: 'Çalışma gücü kayıp oranı %40-%49 arası (27.04.2005 öncesi)',
    },
    {
      derece: '%50-%59',
      hizmetYili: 15,
      gunSayisi: 5760,
      aciklama: 'Çalışma gücü kayıp oranı %50-%59 arası (27.04.2005 öncesi)',
    },
    {
      derece: '%60+',
      hizmetYili: 15,
      gunSayisi: 5760,
      aciklama: 'Çalışma gücü kayıp oranı %60 ve üzeri (27.04.2005 öncesi)',
    },
  ],
};

export const malullik4c_sonrasi: MalullikTablosu = {
  statü: '4c',
  tip: 'sk28/5',
  saritlar: [
    {
      derece: '%40-%49',
      hizmetYili: 15,
      gunSayisi: 6480,
      aciklama: 'Çalışma gücü kayıp oranı %40-%49 arası (27.04.2005 sonrası)',
    },
    {
      derece: '%50-%59',
      hizmetYili: 15,
      gunSayisi: 5760,
      aciklama: 'Çalışma gücü kayıp oranı %50-%59 arası (27.04.2005 sonrası)',
    },
    {
      derece: '%60+',
      hizmetYili: 15,
      gunSayisi: 5760,
      aciklama: 'Çalışma gücü kayıp oranı %60 ve üzeri (27.04.2005 sonrası)',
    },
  ],
};

// ============= İLK İŞE GİRİŞTE MALÜL (SK 28/4) =============
// Yaşsız, sabit şartlar
export const sk28_4_saritlari = {
  '4a': {
    hizmetYili: 15,
    gunSayisi: 3960,
    aciklama: '4/a (SSK) - 5510 SK 28/4 (İlk işe girişte malül)',
  },
  '4b': {
    hizmetYili: 15,
    gunSayisi: 3960,
    aciklama: '4/b (Bağ-Kur) - 5510 SK 28/4 (İlk işe girişte malül)',
  },
  '4c': {
    hizmetYili: 15,
    gunSayisi: 3960,
    aciklama: '4/c (Memur) - Engelli (27.04.2005 öncesi)',
  },
};

export const getMalullikSaritlari = (
  statü: string,
  malulBirimi: string,
  derece?: string
) => {
  if (malulBirimi === 'sk28/4') {
    return sk28_4_saritlari[statü as keyof typeof sk28_4_saritlari];
  }

  if (malulBirimi === 'sk28/5') {
    if (statü === '4a') {
      return malullik4a.saritlar.find((s) => s.derece === derece);
    } else if (statü === '4b') {
      return malullik4b.saritlar.find((s) => s.derece === derece);
    } else if (statü === '4c') {
      return malullik4c_oncesi.saritlar.find((s) => s.derece === derece);
    }
  }

  return null;
};

export const getMalulDereceleri = (statü: string, malulBirimi: string) => {
  if (malulBirimi === 'sk28/4') {
    return []; // Derece seçimi yok
  }

  if (malulBirimi === 'sk28/5') {
    if (statü === '4a') {
      return malullik4a.saritlar.map((s) => ({ value: s.derece, label: s.derece }));
    } else if (statü === '4b') {
      return malullik4b.saritlar.map((s) => ({ value: s.derece, label: s.derece }));
    } else if (statü === '4c') {
      return malullik4c_oncesi.saritlar.map((s) => ({
        value: s.derece,
        label: s.derece,
      }));
    }
  }

  return [];
};
