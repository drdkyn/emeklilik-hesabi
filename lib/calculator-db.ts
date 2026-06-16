import rulesRaw from './rules.json' assert { type: 'json' };
const rules = rulesRaw as any;

interface RetirementInput {
  status: '4a' | '4b' | '4c' | '2925';
  dogumTarihi: Date;
  cinsiyet: 'erkek' | 'kadin';
  ilkGirisTarihi: Date;
  priGunu: number;
  borçlanmaOption: 'hariç' | 'dahil';
  borçlanmaGunu: number;
  askerlikGunu: number;
  askerlikNedir: 'once' | 'sonra';
  malulukTuru: 'yok' | 'sk284' | 'sk285';
  derece: string | null;
  malulTarihi: Date | null;
}

interface RetirementResult {
  name: string;
  type: string;
  uygun: boolean;
  gecerli: boolean; // giriş tarihine göre bu kural kişiye uygulanabilir mi
  kosullar: {
    ad: string;
    gerekli: string;
    sahip: string;
    basarili: boolean;
  }[];
  notlar?: string;
}

function calculateAge(birthDate: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) age--;
  return age;
}

function calculateServiceYears(startDate: Date, referenceDate: Date): number {
  let years = referenceDate.getFullYear() - startDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - startDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < startDate.getDate())) years--;
  return years;
}

export function calculateRetirementOptionsDB(input: RetirementInput): RetirementResult[] {
  const {
    status, dogumTarihi, cinsiyet, ilkGirisTarihi,
    priGunu, borçlanmaOption, borçlanmaGunu,
    askerlikGunu, askerlikNedir,
    malulukTuru, derece,
  } = input;

  const today = new Date();
  const age = calculateAge(dogumTarihi, today);
  const serviceYears = calculateServiceYears(ilkGirisTarihi, today);

  const totalDays =
    borçlanmaOption === 'hariç'
      ? priGunu + askerlikGunu + borçlanmaGunu
      : priGunu + askerlikGunu;

  const results: RetirementResult[] = [];

  const statusRules = rules[status as keyof typeof rules];
  if (!statusRules) throw new Error(`${status} statüsü kuralı bulunamadı`);

  // Kural tarih aralığına göre kişinin bu kurala tabi olup olmadığı
  // İlk işe giriş tarihi o kuralın dateFrom–dateTo aralığında mı?
  function isGecerli(rule: any): boolean {
    const from = new Date(rule.dateFrom);
    const to = new Date(rule.dateTo);
    return ilkGirisTarihi >= from && ilkGirisTarihi <= to;
  }

  // ---- NORMAL YAŞLILIK ----
  if (statusRules.normal) {
    for (const rule of statusRules.normal) {
      const gecerli = isGecerli(rule);
      const kosullar = [];
      let uygun = true;

      const gunOk = totalDays >= rule.days;
      kosullar.push({ ad: 'Gün', gerekli: `${rule.days}`, sahip: `${totalDays}`, basarili: gunOk });
      uygun = uygun && gunOk;

      if (rule.ageWoman !== null || rule.ageMan !== null) {
        const requiredAge = cinsiyet === 'kadin' ? rule.ageWoman : rule.ageMan;
        if (requiredAge !== null) {
          const yasOk = age >= requiredAge;
          kosullar.push({ ad: 'Yaş', gerekli: `${requiredAge}`, sahip: `${age}`, basarili: yasOk });
          uygun = uygun && yasOk;
        }
      }

      if (rule.serviceYears !== null) {
        const hizmetOk = serviceYears >= rule.serviceYears;
        kosullar.push({ ad: 'Hizmet Yılı', gerekli: `${rule.serviceYears}`, sahip: `${serviceYears}`, basarili: hizmetOk });
        uygun = uygun && hizmetOk;
      }

      results.push({ name: rule.name, type: 'normal', uygun: gecerli && uygun, gecerli, kosullar });
    }
  }

  // ---- YAŞTAN EMEKLİLİK ----
  if (statusRules.age) {
    for (const rule of statusRules.age) {
      const gecerli = isGecerli(rule);
      const kosullar = [];
      let uygun = true;

      const gunOk = totalDays >= rule.days;
      kosullar.push({ ad: 'Gün', gerekli: `${rule.days}`, sahip: `${totalDays}`, basarili: gunOk });
      uygun = uygun && gunOk;

      if (rule.ageWoman !== null || rule.ageMan !== null) {
        const requiredAge = cinsiyet === 'kadin' ? rule.ageWoman : rule.ageMan;
        if (requiredAge !== null) {
          const yasOk = age >= requiredAge;
          kosullar.push({ ad: 'Yaş', gerekli: `${requiredAge}`, sahip: `${age}`, basarili: yasOk });
          uygun = uygun && yasOk;
        }
      }

      if (rule.serviceYears !== null) {
        const hizmetOk = serviceYears >= rule.serviceYears;
        kosullar.push({ ad: 'Hizmet Yılı', gerekli: `${rule.serviceYears}`, sahip: `${serviceYears}`, basarili: hizmetOk });
        uygun = uygun && hizmetOk;
      }

      results.push({ name: `${rule.name} (Kısmi)`, type: 'age', uygun: gecerli && uygun, gecerli, kosullar });
    }
  }

  // ---- MALÜLLÜk ----
  if (malulukTuru !== 'yok' && statusRules.disability) {
    for (const rule of statusRules.disability) {
      const gecerli = isGecerli(rule);
      const kosullar = [];
      let uygun = true;

      if (malulukTuru === 'sk284' && rule.degree === null) {
        const gunOk = totalDays >= rule.days;
        kosullar.push({ ad: 'Gün', gerekli: `${rule.days}`, sahip: `${totalDays}`, basarili: gunOk });
        uygun = uygun && gunOk;

        if (rule.serviceYears !== null) {
          const hizmetOk = serviceYears >= rule.serviceYears;
          kosullar.push({ ad: 'Hizmet Yılı', gerekli: `${rule.serviceYears}`, sahip: `${serviceYears}`, basarili: hizmetOk });
          uygun = uygun && hizmetOk;
        }

        results.push({ name: rule.name, type: 'disability', uygun: gecerli && uygun, gecerli, kosullar, notlar: rule.note });
      }

      if (malulukTuru === 'sk285' && rule.degree && derece === rule.degree) {
        const gunOk = totalDays >= rule.days;
        kosullar.push({ ad: 'Gün', gerekli: `${rule.days}`, sahip: `${totalDays}`, basarili: gunOk });
        uygun = uygun && gunOk;

        if (rule.serviceYears !== null) {
          const hizmetOk = serviceYears >= rule.serviceYears;
          kosullar.push({ ad: 'Hizmet Yılı', gerekli: `${rule.serviceYears}`, sahip: `${serviceYears}`, basarili: hizmetOk });
          uygun = uygun && hizmetOk;
        }

        results.push({ name: `${rule.name} - ${derece}`, type: 'disability', uygun: gecerli && uygun, gecerli, kosullar, notlar: rule.note });
      }
    }
  }

  return results;
}
