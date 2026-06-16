import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'retirement.db');
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS retirement_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    dateFrom TEXT NOT NULL,
    dateTo TEXT NOT NULL,
    serviceYears INTEGER,
    days INTEGER,
    ageWoman INTEGER,
    ageMan INTEGER,
    degree TEXT,
    notes TEXT,
    source TEXT DEFAULT 'excel'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS statuses (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
  )
`);

// Clear existing rules
db.prepare('DELETE FROM retirement_rules').run();

// Insert statuses
const insertStatus = db.prepare(
  'INSERT OR REPLACE INTO statuses (code, name, description) VALUES (?, ?, ?)'
);
insertStatus.run('4a', 'SSK', 'Sosyal Sigortalar Kurumu');
insertStatus.run('4b', 'Bağ-Kur', 'Esnaf ve Sanatkârlar Kurumu');
insertStatus.run('4c', 'Memur', 'Devlet Memurları');
insertStatus.run('2925', 'Tarım', 'Tarım Sigortası');

// TÜMEL EMEKLILIK ŞARTLARI - EXCEL'DEN AKTARıLMıŞ

const rules = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/a (SSK) - İSTEKLE EMEKLILIK (YAŞTAN) - 08.09.1999 ÖNCESİ
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Kadın: Yaş şartsız (5000 gün kademeli)
  ['4a', 'age', 'İstekle Emeklilik Kadın (08.09.1981)', '1981-09-08', '1984-05-23', 20, 5000, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1984)', '1984-05-24', '1985-05-23', 20, 5000, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1985)', '1985-05-24', '1986-05-23', 20, 5075, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1986)', '1986-05-24', '1987-05-23', 20, 5150, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1987)', '1987-05-24', '1988-05-23', 20, 5225, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1988)', '1988-05-24', '1989-05-23', 20, 5300, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1989)', '1989-05-24', '1990-05-23', 20, 5375, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1990)', '1990-05-24', '1991-05-23', 20, 5450, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1991)', '1991-05-24', '1992-05-23', 20, 5525, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1992)', '1992-05-24', '1993-05-23', 20, 5600, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1993)', '1993-05-24', '1994-05-23', 20, 5675, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1994)', '1994-05-24', '1995-05-23', 20, 5750, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1995)', '1995-05-24', '1996-05-23', 20, 5825, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1996)', '1996-05-24', '1997-05-23', 20, 5900, 58, null, null, null],
  ['4a', 'age', 'İstekle Emeklilik Kadın (24.05.1997)', '1997-05-24', '1999-09-08', 20, 5975, 58, null, null, null],

  // Erkek: Yaş şartsız (25 yıl, 5000-5975 gün kademeli)
  ['4a', 'age', 'İstekle Emeklilik Erkek (08.09.1981)', '1981-09-08', '1984-05-23', 25, 5000, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1984)', '1984-05-24', '1985-05-23', 25, 5000, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1985)', '1985-05-24', '1986-05-23', 25, 5075, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1986)', '1986-05-24', '1987-05-23', 25, 5150, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1987)', '1987-05-24', '1988-05-23', 25, 5225, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1988)', '1988-05-24', '1989-05-23', 25, 5300, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1989)', '1989-05-24', '1990-05-23', 25, 5375, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1990)', '1990-05-24', '1991-05-23', 25, 5450, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1991)', '1991-05-24', '1992-05-23', 25, 5525, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1992)', '1992-05-24', '1993-05-23', 25, 5600, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1993)', '1993-05-24', '1994-05-23', 25, 5675, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1994)', '1994-05-24', '1995-05-23', 25, 5750, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1995)', '1995-05-24', '1996-05-23', 25, 5825, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1996)', '1996-05-24', '1997-05-23', 25, 5900, null, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik Erkek (24.05.1997)', '1997-05-24', '1999-09-08', 25, 5975, null, 60, null, null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/a (SSK) - İSTEKLE EMEKLILIK (YAŞTAN) - 09.09.1999-30.04.2008
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4a', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - TAM', '1999-09-09', '2008-04-30', 25, 7200, 58, 60, null, 'TAM'],
  ['4a', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - KISMİ', '1999-09-09', '2008-04-30', 15, 4500, 58, 60, null, 'KISMİ'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/a (SSK) - SK 28/4 FIKRASı (İLK İŞE GİRİŞTE MALÜL)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4a', 'disability', 'SK 28/4 (İlk İşe Girişte Malül)', '1981-09-08', '2099-12-31', 15, 3960, null, null, null, null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/a (SSK) - SK 28/5 FIKRASı (SONRADAN MALÜL) - DERECE BAZLI
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // 01.10.2008+ - %50-%59 Derece
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 16, 3700, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2009)', '2009-01-01', '2009-12-31', 16, 3800, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2010)', '2010-01-01', '2010-12-31', 16, 3900, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2011)', '2011-01-01', '2011-12-31', 16, 4000, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2012)', '2012-01-01', '2012-12-31', 16, 4100, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2013)', '2013-01-01', '2013-12-31', 16, 4200, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2014)', '2014-01-01', '2014-12-31', 16, 4300, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2015+)', '2015-01-01', '2099-12-31', 16, 4320, null, null, '%50-%59', null],
  
  // 01.10.2008+ - %40-%49 Derece
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 18, 4100, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2009)', '2009-01-01', '2009-12-31', 18, 4200, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2010)', '2010-01-01', '2010-12-31', 18, 4300, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2011)', '2011-01-01', '2011-12-31', 18, 4400, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2012)', '2012-01-01', '2012-12-31', 18, 4500, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2013)', '2013-01-01', '2013-12-31', 18, 4600, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2014+)', '2014-01-01', '2099-12-31', 18, 4680, null, null, '%40-%49', null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/b (BAĞ-KUR) - İSTEKLE EMEKLILIK - 08.09.1999 ÖNCESİ
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4b', 'age', 'İstekle Emeklilik (08.09.1999 Öncesi)', '1981-09-08', '1999-09-08', 20, 7200, 58, 58, null, null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/b (BAĞ-KUR) - İSTEKLE EMEKLILIK - 09.09.1999-30.04.2008
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4b', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - TAM Kadın', '1999-09-09', '2008-04-30', 25, 9000, 58, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - TAM Erkek', '1999-09-09', '2008-04-30', 25, 9000, null, 60, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - KISMİ Kadın', '1999-09-09', '2008-04-30', 15, 5400, 60, null, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) - KISMİ Erkek', '1999-09-09', '2008-04-30', 15, 5400, null, 62, null, 'KISMİ'],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/b (BAĞ-KUR) - İSTEKLE EMEKLILIK - 01.05.2008+
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // TAM - Kademeli Yaş
  ['4b', 'age', 'İstekle Emeklilik TAM (01.05.2008-31.12.2035) Kadın', '2008-05-01', '2035-12-31', null, 9000, 58, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.05.2008-31.12.2035) Erkek', '2008-05-01', '2035-12-31', null, 9000, null, 60, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2036-31.12.2037) Kadın', '2036-01-01', '2037-12-31', null, 9000, 59, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2036-31.12.2037) Erkek', '2036-01-01', '2037-12-31', null, 9000, null, 61, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2038-31.12.2039) Kadın', '2038-01-01', '2039-12-31', null, 9000, 60, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2038-31.12.2039) Erkek', '2038-01-01', '2039-12-31', null, 9000, null, 62, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2040-31.12.2041) Kadın', '2040-01-01', '2041-12-31', null, 9000, 61, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2040-31.12.2041) Erkek', '2040-01-01', '2041-12-31', null, 9000, null, 63, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2042-31.12.2043) Kadın', '2042-01-01', '2043-12-31', null, 9000, 62, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2042-31.12.2043) Erkek', '2042-01-01', '2043-12-31', null, 9000, null, 64, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2044+) Kadın', '2044-01-01', '2099-12-31', null, 9000, 63, null, null, 'TAM'],
  ['4b', 'age', 'İstekle Emeklilik TAM (01.01.2044+) Erkek', '2044-01-01', '2099-12-31', null, 9000, null, 65, null, 'TAM'],

  // KISMİ - Kademeli Yaş
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.05.2008-31.12.2035) Kadın', '2008-05-01', '2035-12-31', null, 5400, 61, null, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.05.2008-31.12.2035) Erkek', '2008-05-01', '2035-12-31', null, 5400, null, 63, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2036-31.12.2037) Kadın', '2036-01-01', '2037-12-31', null, 5400, 62, null, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2036-31.12.2037) Erkek', '2036-01-01', '2037-12-31', null, 5400, null, 64, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2038-31.12.2039) Kadın', '2038-01-01', '2039-12-31', null, 5400, 63, null, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2038-31.12.2039) Erkek', '2038-01-01', '2039-12-31', null, 5400, null, 65, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2040+) Kadın', '2040-01-01', '2099-12-31', null, 5400, 64, null, null, 'KISMİ'],
  ['4b', 'age', 'İstekle Emeklilik KISMİ (01.01.2040+) Erkek', '2040-01-01', '2099-12-31', null, 5400, null, 65, null, 'KISMİ'],

  // SK 28/4-5 (Engelli İştirakçiler) 4/b - DERECE BAZLI
  ['4b', 'disability', 'SK 28/4 (%50-%59)', '2008-01-01', '2099-12-31', null, 5760, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/4 (%40-%49)', '2008-01-01', '2099-12-31', null, 6480, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 16, 3700, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2009)', '2009-01-01', '2009-12-31', 16, 3800, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2010)', '2010-01-01', '2010-12-31', 16, 3900, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2011)', '2011-01-01', '2011-12-31', 16, 4000, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2012)', '2012-01-01', '2012-12-31', 16, 4100, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2013)', '2013-01-01', '2013-12-31', 16, 4200, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2014)', '2014-01-01', '2014-12-31', 16, 4300, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%50-%59, 2015+)', '2015-01-01', '2099-12-31', 16, 4320, null, null, '%50-%59', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 18, 4100, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2009)', '2009-01-01', '2009-12-31', 18, 4200, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2010)', '2010-01-01', '2010-12-31', 18, 4300, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2011)', '2011-01-01', '2011-12-31', 18, 4400, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2012)', '2012-01-01', '2012-12-31', 18, 4500, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2013)', '2013-01-01', '2013-12-31', 18, 4600, null, null, '%40-%49', null],
  ['4b', 'disability', 'SK 28/5 (%40-%49, 2014+)', '2014-01-01', '2099-12-31', 18, 4680, null, null, '%40-%49', null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/c (MEMUR) - İSTEKLE EMEKLILIK - 08.09.1999 ÖNCESİ
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4c', 'age', 'İstekle Emeklilik (08.09.1999 Öncesi) Kadın', '1981-09-08', '1999-09-08', 20, 7200, null, null, null, null],
  ['4c', 'age', 'İstekle Emeklilik (08.09.1999 Öncesi) Erkek', '1981-09-08', '1999-09-08', 25, 9000, null, null, null, null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/c (MEMUR) - İSTEKLE EMEKLILIK - 09.09.1999-30.04.2008
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['4c', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) Kadın', '1999-09-09', '2008-04-30', 25, 9000, 58, null, null, 'İstekle'],
  ['4c', 'age', 'İstekle Emeklilik (09.09.1999-30.04.2008) Erkek', '1999-09-09', '2008-04-30', 25, 9000, null, 60, null, 'İstekle'],
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 4/c (MEMUR) - İSTEKLE EMEKLILIK - 01.05.2008+ (PÖGS)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // TAM - Kademeli Yaş
  ['4c', 'age', 'İstekle Emeklilik TAM (01.05.2008-31.12.2035) Kadın', '2008-05-01', '2035-12-31', null, 9000, 58, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.05.2008-31.12.2035) Erkek', '2008-05-01', '2035-12-31', null, 9000, null, 60, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2036-31.12.2037) Kadın', '2036-01-01', '2037-12-31', null, 9000, 59, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2036-31.12.2037) Erkek', '2036-01-01', '2037-12-31', null, 9000, null, 61, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2038-31.12.2039) Kadın', '2038-01-01', '2039-12-31', null, 9000, 60, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2038-31.12.2039) Erkek', '2038-01-01', '2039-12-31', null, 9000, null, 62, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2040-31.12.2041) Kadın', '2040-01-01', '2041-12-31', null, 9000, 61, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2040-31.12.2041) Erkek', '2040-01-01', '2041-12-31', null, 9000, null, 63, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2042-31.12.2043) Kadın', '2042-01-01', '2043-12-31', null, 9000, 62, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2042-31.12.2043) Erkek', '2042-01-01', '2043-12-31', null, 9000, null, 64, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2044-31.12.2045) Kadın', '2044-01-01', '2045-12-31', null, 9000, 63, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2044-31.12.2045) Erkek', '2044-01-01', '2045-12-31', null, 9000, null, 65, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2046-31.12.2047) Kadın', '2046-01-01', '2047-12-31', null, 9000, 64, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2046-31.12.2047) Erkek', '2046-01-01', '2047-12-31', null, 9000, null, 65, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2048+) Kadın', '2048-01-01', '2099-12-31', null, 9000, 65, null, null, 'TAM'],
  ['4c', 'age', 'İstekle Emeklilik TAM (01.01.2048+) Erkek', '2048-01-01', '2099-12-31', null, 9000, null, 65, null, 'TAM'],

  // KISMİ - Kademeli Yaş  
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.05.2008-31.12.2035) Kadın', '2008-05-01', '2035-12-31', null, 5400, 61, null, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.05.2008-31.12.2035) Erkek', '2008-05-01', '2035-12-31', null, 5400, null, 63, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2036-31.12.2037) Kadın', '2036-01-01', '2037-12-31', null, 5400, 62, null, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2036-31.12.2037) Erkek', '2036-01-01', '2037-12-31', null, 5400, null, 64, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2038-31.12.2039) Kadın', '2038-01-01', '2039-12-31', null, 5400, 63, null, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2038-31.12.2039) Erkek', '2038-01-01', '2039-12-31', null, 5400, null, 65, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2040+) Kadın', '2040-01-01', '2099-12-31', null, 5400, 64, null, null, 'KISMİ'],
  ['4c', 'age', 'İstekle Emeklilik KISMİ (01.01.2040+) Erkek', '2040-01-01', '2099-12-31', null, 5400, null, 65, null, 'KISMİ'],

  // SK 28/4-5 (Engelli) 4/c - DERECE BAZLI
  ['4c', 'disability', 'SK 28/4 (%50-%59)', '2008-01-01', '2099-12-31', null, 5760, null, null, '%50-%59', null],
  ['4c', 'disability', 'SK 28/4 (%40-%49)', '2008-01-01', '2099-12-31', null, 6480, null, null, '%40-%49', null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2925 (TARIM) - NORMAL EMEKLİLİK
  // ═══════════════════════════════════════════════════════════════════════════════
  
  ['2925', 'normal', 'Normal (08.09.1999 Öncesi)', '1981-09-08', '1999-09-08', 15, 3600, null, null, null, null],
  ['2925', 'normal', 'Normal (09.09.1999-30.04.2008)', '1999-09-09', '2008-04-30', 15, 3600, null, null, null, null],
  ['2925', 'normal', 'Normal (01.05.2008+)', '2008-05-01', '2099-12-31', 15, 7200, null, null, null, null],

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2925 (TARIM) - SK 28/5 - DERECE + TARİH BAZLI
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // %50-%59
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 16, 3700, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2009)', '2009-01-01', '2009-12-31', 16, 3800, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2010)', '2010-01-01', '2010-12-31', 16, 3900, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2011)', '2011-01-01', '2011-12-31', 16, 4000, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2012)', '2012-01-01', '2012-12-31', 16, 4100, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2013)', '2013-01-01', '2013-12-31', 16, 4200, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2014)', '2014-01-01', '2014-12-31', 16, 4300, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2015+)', '2015-01-01', '2099-12-31', 16, 4320, null, null, '%50-%59', null],

  // %40-%49
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 18, 4100, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2009)', '2009-01-01', '2009-12-31', 18, 4200, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2010)', '2010-01-01', '2010-12-31', 18, 4300, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2011)', '2011-01-01', '2011-12-31', 18, 4400, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2012)', '2012-01-01', '2012-12-31', 18, 4500, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2013)', '2013-01-01', '2013-12-31', 18, 4600, null, null, '%40-%49', null],
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2014+)', '2014-01-01', '2099-12-31', 18, 4680, null, null, '%40-%49', null],
];

// Insert rules
const insertRule = db.prepare(`
  INSERT INTO retirement_rules 
  (status, type, name, dateFrom, dateTo, serviceYears, days, ageWoman, ageMan, degree, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rules: any[]) => {
  for (const rule of rules) {
    insertRule.run(...rule);
  }
});

insertMany(rules);

console.log(`✅ Veritabanı başarıyla yüklendi`);
console.log(`📊 Toplam Kural: ${rules.length}`);
console.log(`📁 Konumu: ${dbPath}`);
console.log(`\n📈 Kural Dağılımı:`);
console.log(`   4/a: ${rules.filter(r => r[0] === '4a').length}`);
console.log(`   4/b: ${rules.filter(r => r[0] === '4b').length}`);
console.log(`   4/c: ${rules.filter(r => r[0] === '4c').length}`);
console.log(`   2925: ${rules.filter(r => r[0] === '2925').length}`);

db.close();
