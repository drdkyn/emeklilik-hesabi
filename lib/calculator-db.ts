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
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateServiceYears(startDate: Date, referenceDate: Date): number {
  let years = referenceDate.getFullYear() - startDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - startDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < startDate.getDate())) {
    years--;
  }
  return years;
}

export function calculateRetirementOptionsDB(input: RetirementInput): RetirementResult[] {
  const {
    status,
    dogumTarihi,
    cinsiyet,
    ilkGirisTarihi,
    priGunu,
    borçlanmaOption,
    borçlanmaGunu,
    askerlikGunu,
    askerlikNedir,
    malulukTuru,
    derece,
    malulTarihi,
  } = input;

  const today = new Date();
  const age = calculateAge(dogumTarihi, today);
  const serviceYears = calculateServiceYears(ilkGirisTarihi, today);
  
  // BORÇLANMA HESAPLAMASI
  // - hariç: borçlanma ayrı → prim gününe EKLE
  // - dahil: borçlanma zaten prim günü içinde → EKLEME
  const totalDays =
    borçlanmaOption === 'hariç'
      ? priGunu + askerlikGunu + borçlanmaGunu
      : priGunu + askerlikGunu;

  const results: RetirementResult[] = [];

  try {
    const statusRules = rules[status as keyof typeof rules];
    if (!statusRules) {
      throw new Error(`${status} statüsü kuralı bulunamadı`);
    }

    // NORMAL YAŞLILIK
    if (statusRules.normal) {
      const normalRules = statusRules.normal;
      for (const rule of normalRules) {
        const ruleDate = new Date();
        const dateFrom = new Date(rule.dateFrom);
        const dateTo = new Date(rule.dateTo);
        
        let uygun = true;
        const kosullar = [];

        // Gün şartı
        const gunOk = totalDays >= rule.days;
        kosullar.push({
          ad: 'Gün',
          gerekli: `${rule.days}`,
          sahip: `${totalDays}`,
          basarili: gunOk,
        });
        uygun = uygun && gunOk;

        // Yaş şartı (varsa)
        if (rule.ageWoman !== null || rule.ageMan !== null) {
          const requiredAge = cinsiyet === 'kadin' ? rule.ageWoman : rule.ageMan;
          if (requiredAge !== null) {
            const yasOk = age >= requiredAge;
            kosullar.push({
              ad: 'Yaş',
              gerekli: `${requiredAge}`,
              sahip: `${age}`,
              basarili: yasOk,
            });
            uygun = uygun && yasOk;
          }
        }

        // Hizmet yılı şartı (varsa)
        if (rule.serviceYears !== null) {
          const hizmetOk = serviceYears >= rule.serviceYears;
          kosullar.push({
            ad: 'Hizmet Yılı',
            gerekli: `${rule.serviceYears}`,
            sahip: `${serviceYears}`,
            basarili: hizmetOk,
          });
          uygun = uygun && hizmetOk;
        }

        results.push({
          name: rule.name,
          type: 'normal',
          uygun,
          kosullar,
        });
      }
    }

    // YAŞTAN EMEKLİLİK (KISMİ)
    if (statusRules.age) {
      const ageRules = statusRules.age;
      for (const rule of ageRules) {
        let uygun = true;
        const kosullar = [];

        const gunOk = totalDays >= rule.days;
        kosullar.push({
          ad: 'Gün',
          gerekli: `${rule.days}`,
          sahip: `${totalDays}`,
          basarili: gunOk,
        });
        uygun = uygun && gunOk;

        if (rule.ageWoman !== null || rule.ageMan !== null) {
          const requiredAge = cinsiyet === 'kadin' ? rule.ageWoman : rule.ageMan;
          if (requiredAge !== null) {
            const yasOk = age >= requiredAge;
            kosullar.push({
              ad: 'Yaş',
              gerekli: `${requiredAge}`,
              sahip: `${age}`,
              basarili: yasOk,
            });
            uygun = uygun && yasOk;
          }
        }

        if (rule.serviceYears !== null) {
          const hizmetOk = serviceYears >= rule.serviceYears;
          kosullar.push({
            ad: 'Hizmet Yılı',
            gerekli: `${rule.serviceYears}`,
            sahip: `${serviceYears}`,
            basarili: hizmetOk,
          });
          uygun = uygun && hizmetOk;
        }

        results.push({
          name: `${rule.name} (Kısmi)`,
          type: 'age',
          uygun,
          kosullar,
        });
      }
    }

    // MALÜllÜK
    if (malulukTuru !== 'yok' && statusRules.disability) {
      const disabilityRules = statusRules.disability;
      for (const rule of disabilityRules) {
        // SK 28/4 için derece filtresi yok
        if (malulukTuru === 'sk284' && rule.degree === null) {
          let uygun = true;
          const kosullar = [];

          const gunOk = totalDays >= rule.days;
          kosullar.push({
            ad: 'Gün',
            gerekli: `${rule.days}`,
            sahip: `${totalDays}`,
            basarili: gunOk,
          });
          uygun = uygun && gunOk;

          if (rule.serviceYears !== null) {
            const hizmetOk = serviceYears >= rule.serviceYears;
            kosullar.push({
              ad: 'Hizmet Yılı',
              gerekli: `${rule.serviceYears}`,
              sahip: `${serviceYears}`,
              basarili: hizmetOk,
            });
            uygun = uygun && hizmetOk;
          }

          results.push({
            name: rule.name,
            type: 'disability',
            uygun,
            kosullar,
            notlar: rule.note,
          });
        }

        // SK 28/5 için derece eşleştir
        if (malulukTuru === 'sk285' && rule.degree && derece === rule.degree) {
          let uygun = true;
          const kosullar = [];

          const gunOk = totalDays >= rule.days;
          kosullar.push({
            ad: 'Gün',
            gerekli: `${rule.days}`,
            sahip: `${totalDays}`,
            basarili: gunOk,
          });
          uygun = uygun && gunOk;

          if (rule.serviceYears !== null) {
            const hizmetOk = serviceYears >= rule.serviceYears;
            kosullar.push({
              ad: 'Hizmet Yılı',
              gerekli: `${rule.serviceYears}`,
              sahip: `${serviceYears}`,
              basarili: hizmetOk,
            });
            uygun = uygun && hizmetOk;
          }

          results.push({
            name: `${rule.name} - ${derece}`,
            type: 'disability',
            uygun,
            kosullar,
            notlar: rule.note,
          });
        }
      }
    }

    return results;
  } catch (error: any) {
    throw new Error(`Hesaplama hatası: ${error.message}`);
  }
}
