import db from './db';

interface CalculatorInput {
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
  derece?: string | null;
  malulTarihi?: Date | null;
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

interface RetirementRule {
  id: number;
  status: string;
  type: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  serviceYears: number | null;
  days: number | null;
  ageWoman: number | null;
  ageMan: number | null;
  degree: string | null;
  notes: string | null;
}

const calculateAge = (birthDate: Date, refDate: Date = new Date()): number => {
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateServiceYears = (entryDate: Date, refDate: Date = new Date()): number => {
  const years = refDate.getFullYear() - entryDate.getFullYear();
  const monthDiff = refDate.getMonth() - entryDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < entryDate.getDate())) {
    return Math.max(0, years - 1);
  }
  return years;
};

const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function calculateRetirementOptionsDB(input: CalculatorInput): RetirementResult[] {
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
  const totalDays = 
    borçlanmaOption === 'dahil' 
      ? priGunu + askerlikGunu + borçlanmaGunu
      : priGunu + askerlikGunu;

  const results: RetirementResult[] = [];

  try {
    // DB'den kuralları al
    const query = `
      SELECT * FROM retirement_rules
      WHERE status = ?
      ORDER BY type, dateFrom DESC
    `;
    
    const statement = db.prepare(query);
    const allRules = statement.all(status) as RetirementRule[];

    // Kuralları türlere ayır
    const normalRules = allRules.filter(r => r.type === 'normal');
    const ageRules = allRules.filter(r => r.type === 'age');
    let disabilityRules = allRules.filter(r => r.type === 'disability');

    // NORMAL EMEKLİLİK
    for (const rule of normalRules) {
      const ruleFromDate = parseDate(rule.dateFrom);
      const ruleToDate = parseDate(rule.dateTo);

      if (ilkGirisTarihi >= ruleFromDate && ilkGirisTarihi <= ruleToDate) {
        const meetsServiceYears =
          rule.serviceYears === null || serviceYears >= rule.serviceYears;
        const meetsDays = rule.days === null || totalDays >= rule.days;
        const meetsAge =
          rule.ageMan === null ||
          (cinsiyet === 'erkek' ? age >= rule.ageMan : age >= (rule.ageWoman || 60));

        const uygun = meetsServiceYears && meetsDays && meetsAge;

        results.push({
          name: `${rule.name}`,
          type: 'normal',
          uygun,
          kosullar: [
            ...(rule.serviceYears !== null
              ? [
                  {
                    ad: 'Hizmet Yılı',
                    gerekli: rule.serviceYears.toString(),
                    sahip: serviceYears.toString(),
                    basarili: meetsServiceYears,
                  },
                ]
              : []),
            ...(rule.days !== null
              ? [
                  {
                    ad: 'Prim Günü',
                    gerekli: rule.days.toString(),
                    sahip: totalDays.toString(),
                    basarili: meetsDays,
                  },
                ]
              : []),
            ...(rule.ageMan !== null
              ? [
                  {
                    ad: 'Yaş',
                    gerekli:
                      cinsiyet === 'erkek'
                        ? rule.ageMan.toString()
                        : (rule.ageWoman || 60).toString(),
                    sahip: age.toString(),
                    basarili: meetsAge,
                  },
                ]
              : []),
          ],
          notlar: rule.notes || undefined,
        });
      }
    }

    // YAŞTAN EMEKLİLİK
    for (const rule of ageRules) {
      const ruleFromDate = parseDate(rule.dateFrom);
      const ruleToDate = parseDate(rule.dateTo);

      if (ilkGirisTarihi >= ruleFromDate && ilkGirisTarihi <= ruleToDate) {
        const meetsServiceYears =
          rule.serviceYears === null || serviceYears >= rule.serviceYears;
        const meetsDays = rule.days === null || totalDays >= rule.days;
        const meetsAge =
          rule.ageMan === null ||
          (cinsiyet === 'erkek' ? age >= rule.ageMan : age >= (rule.ageWoman || 60));

        const uygun = meetsServiceYears && meetsDays && meetsAge;

        results.push({
          name: `${rule.name}`,
          type: 'age',
          uygun,
          kosullar: [
            ...(rule.serviceYears !== null
              ? [
                  {
                    ad: 'Hizmet Yılı',
                    gerekli: rule.serviceYears.toString(),
                    sahip: serviceYears.toString(),
                    basarili: meetsServiceYears,
                  },
                ]
              : []),
            ...(rule.days !== null
              ? [
                  {
                    ad: 'Prim Günü',
                    gerekli: rule.days.toString(),
                    sahip: totalDays.toString(),
                    basarili: meetsDays,
                  },
                ]
              : []),
            ...(rule.ageMan !== null
              ? [
                  {
                    ad: 'Yaş',
                    gerekli:
                      cinsiyet === 'erkek'
                        ? rule.ageMan.toString()
                        : (rule.ageWoman || 60).toString(),
                    sahip: age.toString(),
                    basarili: meetsAge,
                  },
                ]
              : []),
          ],
          notlar: rule.notes || undefined,
        });
      }
    }

    // MALÜLLÜK EMEKLİLİĞİ
    if (malulukTuru !== 'yok') {
      // SK 28/5 için derece filtresi (SADECE %40-%49 ve %50-%59)
      if (malulukTuru === 'sk285' && derece) {
        disabilityRules = disabilityRules.filter(r => r.degree === derece);
      }

      for (const rule of disabilityRules) {
        // SK 28/5 tarih filtresi
        if (
          malulukTuru === 'sk285' &&
          malulTarihi &&
          rule.dateFrom &&
          rule.dateTo
        ) {
          const ruleFromDate = parseDate(rule.dateFrom);
          const ruleToDate = parseDate(rule.dateTo);
          if (malulTarihi < ruleFromDate || malulTarihi > ruleToDate) {
            continue;
          }
        }

        const meetsServiceYears =
          rule.serviceYears === null || serviceYears >= rule.serviceYears;
        const meetsDays = rule.days === null || totalDays >= rule.days;

        const uygun = meetsServiceYears && meetsDays;

        results.push({
          name: rule.name,
          type: 'disability',
          uygun,
          kosullar: [
            ...(rule.serviceYears !== null
              ? [
                  {
                    ad: 'Hizmet Yılı',
                    gerekli: rule.serviceYears.toString(),
                    sahip: serviceYears.toString(),
                    basarili: meetsServiceYears,
                  },
                ]
              : []),
            ...(rule.days !== null
              ? [
                  {
                    ad: 'Prim Günü',
                    gerekli: rule.days.toString(),
                    sahip: totalDays.toString(),
                    basarili: meetsDays,
                  },
                ]
              : []),
            ...(rule.degree ? [{ ad: 'Derece', gerekli: rule.degree, sahip: derece || '-', basarili: true }] : []),
          ],
          notlar: rule.notes || undefined,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Emeklilik hesaplaması sırasında hata oluştu');
  }
}
