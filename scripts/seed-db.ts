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

// Clear existing
db.prepare('DELETE FROM retirement_rules').run();

// Insert statuses
const insertStatus = db.prepare(
  'INSERT OR REPLACE INTO statuses (code, name, description) VALUES (?, ?, ?)'
);
insertStatus.run('4a', 'SSK', 'Sosyal Sigortalar Kurumu');
insertStatus.run('4b', 'Bağ-Kur', 'Esnaf ve Sanatkârlar Kurumu');
insertStatus.run('4c', 'Memur', 'Devlet Memurları');
insertStatus.run('2925', 'Tarım', 'Tarım Sigortası');

// ═══════════════════════════════════════════════════════════════════════════════
// 4/a (SSK) - BÜTÜN KURALLAR
// ═══════════════════════════════════════════════════════════════════════════════

const rules = [
  // 4/a - İSTEKLE (YAŞTAN) - 08.09.1981-23.05.1991 (20 yıl, kademeli gün)
  ['4a', 'age', 'İstekle Emeklilik (08.09.1981-23.05.1984)', '1981-09-08', '1984-05-23', 20, 5000, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1984-23.05.1985)', '1984-05-24', '1985-05-23', 20, 5000, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1985-23.05.1986)', '1985-05-24', '1986-05-23', 20, 5075, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1986-23.05.1987)', '1986-05-24', '1987-05-23', 20, 5150, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1987-23.05.1988)', '1987-05-24', '1988-05-23', 20, 5225, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1988-23.05.1989)', '1988-05-24', '1989-05-23', 20, 5300, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1989-23.05.1990)', '1989-05-24', '1990-05-23', 20, 5375, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1990-23.05.1991)', '1990-05-24', '1991-05-23', 20, 5450, 58, 60, null, null],
  
  // 4/a - İSTEKLE (YAŞTAN) - 24.05.1991-08.09.1999 (20 yıl, devam kademeli)
  ['4a', 'age', 'İstekle Emeklilik (24.05.1991-23.05.1992)', '1991-05-24', '1992-05-23', 20, 5525, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1992-23.05.1993)', '1992-05-24', '1993-05-23', 20, 5600, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1993-23.05.1994)', '1993-05-24', '1994-05-23', 20, 5675, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1994-23.05.1995)', '1994-05-24', '1995-05-23', 20, 5750, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1995-23.05.1996)', '1995-05-24', '1996-05-23', 20, 5825, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1996-23.05.1997)', '1996-05-24', '1997-05-23', 20, 5900, 58, 60, null, null],
  ['4a', 'age', 'İstekle Emeklilik (24.05.1997-08.09.1999)', '1997-05-24', '1999-09-08', 20, 5975, 58, 60, null, null],

  // 4/a - İSTEKLE (YAŞTAN) - 09.09.1999-30.04.2008
  ['4a', 'age', 'İstekle Emeklilik TAM (09.09.1999-30.04.2008)', '1999-09-09', '2008-04-30', 25, 7200, 58, 60, null, 'TAM'],
  ['4a', 'age', 'İstekle Emeklilik KISMİ (09.09.1999-30.04.2008)', '1999-09-09', '2008-04-30', 15, 4500, 58, 60, null, 'KISMİ'],

  // 4/a - SK 28/4 (İlk İşe Girişte Malül)
  ['4a', 'disability', 'SK 28/4 (İlk İşe Girişte Malül)', '1981-09-08', '2099-12-31', 15, 3960, null, null, null, null],

  // 4/a - SK 28/5 (%40-%59)
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 18, 4100, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2009)', '2009-01-01', '2009-12-31', 18, 4200, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2010)', '2010-01-01', '2010-12-31', 18, 4300, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2011)', '2011-01-01', '2011-12-31', 18, 4400, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2012)', '2012-01-01', '2012-12-31', 18, 4500, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2013)', '2013-01-01', '2013-12-31', 18, 4600, null, null, '%40-%49', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49, 2014+)', '2014-01-01', '2099-12-31', 18, 4680, null, null, '%40-%49', null],

  // 4/a - SK 28/5 (%50-%59)
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2008 Ekim-Aralık)', '2008-10-01', '2008-12-31', 16, 3700, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2009)', '2009-01-01', '2009-12-31', 16, 3800, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2010)', '2010-01-01', '2010-12-31', 16, 3900, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2011)', '2011-01-01', '2011-12-31', 16, 4000, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2012)', '2012-01-01', '2012-12-31', 16, 4100, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2013)', '2013-01-01', '2013-12-31', 16, 4200, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2014)', '2014-01-01', '2014-12-31', 16, 4300, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%50-%59, 2015+)', '2015-01-01', '2099-12-31', 16, 4320, null, null, '%50-%59', null],

  // 4/a - VERGİ İNDİRİMDEN YARARLANAN (30.09.2008 ve öncesi) - 1. DERECE %80+
  ['4a', 'disability', 'Vergi İnd. %80+ (05.08.1991 ve öncesi)', '1981-09-08', '1991-08-05', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %80+ (06.08.1991-05.08.1994)', '1991-08-06', '1994-08-05', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %80+ (06.08.1994-05.08.1997)', '1994-08-06', '1997-08-05', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %80+ (06.08.1997-05.08.2000)', '1997-08-06', '2000-08-05', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %80+ (06.08.2000-05.08.2003)', '2000-08-06', '2003-08-05', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %80+ (06.08.2003-30.09.2008)', '2003-08-06', '2008-09-30', 15, 3600, null, null, '%80+', 'Vergi İndirimi'],

  // 4/a - VERGİ İNDİRİMDEN YARARLANAN - 2. DERECE %60-79 (Kademeli)
  ['4a', 'disability', 'Vergi İnd. %60-79 (05.08.1991 ve öncesi)', '1981-09-08', '1991-08-05', 15, 3600, null, null, '%60-79', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %60-79 (06.08.1991-05.08.1994)', '1991-08-06', '1994-08-05', null, 3680, null, null, '%60-79', 'Vergi İndirimi, 15Y8Ay'],
  ['4a', 'disability', 'Vergi İnd. %60-79 (06.08.1994-05.08.1997)', '1994-08-06', '1997-08-05', null, 3760, null, null, '%60-79', 'Vergi İndirimi, 16Y4Ay'],
  ['4a', 'disability', 'Vergi İnd. %60-79 (06.08.1997-05.08.2000)', '1997-08-06', '2000-08-05', 17, 3840, null, null, '%60-79', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %60-79 (06.08.2000-05.08.2003)', '2000-08-06', '2003-08-05', null, 3920, null, null, '%60-79', 'Vergi İndirimi, 17Y8Ay'],
  ['4a', 'disability', 'Vergi İnd. %60-79 (06.08.2003-30.09.2008)', '2003-08-06', '2008-09-30', 18, 4000, null, null, '%60-79', 'Vergi İndirimi'],

  // 4/a - VERGİ İNDİRİMDEN YARARLANAN - 3. DERECE %40-59 (Kademeli)
  ['4a', 'disability', 'Vergi İnd. %40-59 (05.08.1991 ve öncesi)', '1981-09-08', '1991-08-05', 15, 3600, null, null, '%40-59', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %40-59 (06.08.1991-05.08.1994)', '1991-08-06', '1994-08-05', 16, 3760, null, null, '%40-59', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %40-59 (06.08.1994-05.08.1997)', '1994-08-06', '1997-08-05', 17, 3920, null, null, '%40-59', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %40-59 (06.08.1997-05.08.2000)', '1997-08-06', '2000-08-05', 18, 4080, null, null, '%40-59', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %40-59 (06.08.2000-05.08.2003)', '2000-08-06', '2003-08-05', 19, 4240, null, null, '%40-59', 'Vergi İndirimi'],
  ['4a', 'disability', 'Vergi İnd. %40-59 (06.08.2003-30.09.2008)', '2003-08-06', '2008-09-30', 20, 4400, null, null, '%40-59', 'Vergi İndirimi'],
];

// Insert
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

console.log(`✅ Veritabanı yüklendi: ${rules.length} kural (4/a tam)`);
db.close();
