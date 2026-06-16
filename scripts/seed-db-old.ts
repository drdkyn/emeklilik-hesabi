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

// Retirement rules data
const rules = [
  // 4/a NORMAL
  ['4a', 'normal', 'EYT Yaşsız', '1981-08-09', '1999-08-07', 15, 3600, null, null, null, null],
  ['4a', 'normal', 'EYT Yaşsız (Uzatılmış)', '1999-08-08', '2099-12-31', 15, 3960, null, null, null, null],
  
  // 4/a AGE
  ['4a', 'age', 'Yaştan Emeklilik (08.09.1999 Öncesi)', '1981-08-09', '1999-08-07', 20, 5000, null, null, null, null],
  ['4a', 'age', 'Yaştan Emeklilik (09.09.1999-30.04.2008)', '1999-08-08', '2008-03-30', 25, 7200, null, null, null, null],
  ['4a', 'age', 'Yaştan Emeklilik (01.05.2008+)', '2008-04-01', '2099-12-31', null, 7200, 58, 60, null, null],
  
  // 4/a SK 28/4
  ['4a', 'disability', 'SK 28/4 (İlk İşe Girişte Malül)', '1981-08-09', '1999-08-07', 15, 3600, null, null, null, null],
  ['4a', 'disability', 'SK 28/4 (İlk İşe Girişte Malül)', '1999-08-08', '2099-12-31', 15, 3960, null, null, null, null],
  
  // 4/a SK 28/5
  ['4a', 'disability', 'SK 28/5 (%50-%59 Derece)', '1981-08-09', '2099-12-31', 16, 4320, null, null, '%50-%59', null],
  ['4a', 'disability', 'SK 28/5 (%40-%49 Derece)', '1981-08-09', '2099-12-31', 18, 4680, null, null, '%40-%49', null],

  // 4/b NORMAL
  ['4b', 'normal', 'EYT Yaşsız', '1981-08-09', '1999-08-07', 20, 7200, null, null, null, null],
  ['4b', 'normal', 'Normal (09.09.1999-30.04.2008)', '1999-08-08', '2008-03-30', 15, 5400, null, null, null, null],
  ['4b', 'normal', 'Normal (01.05.2008+)', '2008-04-01', '2099-12-31', null, 9000, 58, 60, null, null],

  // 4/b AGE
  ['4b', 'age', 'Yaştan Emeklilik (08.09.1999 Öncesi)', '1981-08-09', '1999-08-07', 20, 7200, null, null, null, null],
  ['4b', 'age', 'Yaştan Emeklilik (09.09.1999-30.04.2008)', '1999-08-08', '2008-03-30', 15, 5400, 60, 62, null, null],
  ['4b', 'age', 'Yaştan Emeklilik TAM (01.05.2008+)', '2008-04-01', '2099-12-31', null, 9000, 58, 60, null, null],
  ['4b', 'age', 'Yaştan Emeklilik KISMİ (01.05.2008+)', '2008-04-01', '2099-12-31', null, 5400, 61, 63, null, 'KISMİ'],

  // 4/c NORMAL
  ['4c', 'normal', 'EYT Yaşsız', '1981-08-09', '1999-08-07', 25, 9000, null, null, null, null],
  ['4c', 'normal', 'Normal (09.09.1999-30.04.2008)', '1999-08-08', '2008-03-30', 25, 9000, 58, 60, null, null],
  ['4c', 'normal', 'Normal (01.05.2008+)', '2008-04-01', '2099-12-31', null, 9000, 58, 60, null, null],

  // 4/c AGE - Kademeli
  ['4c', 'age', 'Yaştan Emeklilik (08.09.1999 Öncesi)', '1981-08-09', '1999-08-07', 20, 7200, null, null, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.05.2008-31.12.2035)', '2008-04-01', '2035-12-31', null, 9000, 58, 60, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2036-31.12.2037)', '2036-01-01', '2037-12-31', null, 9000, 59, 61, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2038-31.12.2039)', '2038-01-01', '2039-12-31', null, 9000, 60, 62, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2040-31.12.2041)', '2040-01-01', '2041-12-31', null, 9000, 61, 63, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2042-31.12.2043)', '2042-01-01', '2043-12-31', null, 9000, 62, 64, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2044-31.12.2045)', '2044-01-01', '2045-12-31', null, 9000, 63, 65, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2046-31.12.2047)', '2046-01-01', '2047-12-31', null, 9000, 64, 65, null, null],
  ['4c', 'age', 'Yaştan Emeklilik TAM (01.01.2048+)', '2048-01-01', '2099-12-31', null, 9000, 65, 65, null, null],

  // 4/c KISMİ - Kademeli
  ['4c', 'age', 'Yaştan Emeklilik KISMİ (01.05.2008-31.12.2035)', '2008-04-01', '2035-12-31', null, 5400, 61, 63, null, 'KISMİ'],
  ['4c', 'age', 'Yaştan Emeklilik KISMİ (01.01.2036-31.12.2037)', '2036-01-01', '2037-12-31', null, 5400, 62, 64, null, 'KISMİ'],
  ['4c', 'age', 'Yaştan Emeklilik KISMİ (01.01.2038-31.12.2039)', '2038-01-01', '2039-12-31', null, 5400, 63, 65, null, 'KISMİ'],
  ['4c', 'age', 'Yaştan Emeklilik KISMİ (01.01.2040-31.12.2041)', '2040-01-01', '2041-12-31', null, 5400, 64, 65, null, 'KISMİ'],
  ['4c', 'age', 'Yaştan Emeklilik KISMİ (01.01.2042+)', '2042-01-01', '2099-12-31', null, 5400, 65, 65, null, 'KISMİ'],

  // 4/c DISABILITY
  ['4c', 'disability', 'SK 28/4 (%50-%59 Derece)', '1981-08-09', '2099-12-31', null, 5760, null, null, '%50-%59', null],
  ['4c', 'disability', 'SK 28/4 (%40-%49 Derece)', '1981-08-09', '2099-12-31', null, 6480, null, null, '%40-%49', null],

  // 2925 NORMAL
  ['2925', 'normal', 'Normal (2008 Ekim Öncesi)', '2008-08-01', '2008-08-30', 15, 3600, null, null, null, null],
  ['2925', 'normal', 'Normal (2008 Ekim-Aralık)', '2008-09-01', '2008-12-31', 15, 3700, null, null, null, null],
  ['2925', 'normal', 'Normal (2009)', '2009-01-01', '2009-12-31', 15, 3800, null, null, null, null],
  ['2925', 'normal', 'Normal (2010)', '2010-01-01', '2010-12-31', 15, 3900, null, null, null, null],
  ['2925', 'normal', 'Normal (2011+)', '2011-01-01', '2099-12-31', 15, 3960, null, null, null, null],

  // 2925 SK 28/5 %50-%59
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2008 Ekim-Aralık)', '2008-09-01', '2008-12-31', 16, 3700, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2009)', '2009-01-01', '2009-12-31', 16, 3800, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2010)', '2010-01-01', '2010-12-31', 16, 3900, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2011)', '2011-01-01', '2011-12-31', 16, 4000, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2012)', '2012-01-01', '2012-12-31', 16, 4100, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2013)', '2013-01-01', '2013-12-31', 16, 4200, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2014)', '2014-01-01', '2014-12-31', 16, 4300, null, null, '%50-%59', null],
  ['2925', 'disability', 'SK 28/5 (%50-%59, 2015+)', '2015-01-01', '2099-12-31', 16, 4320, null, null, '%50-%59', null],

  // 2925 SK 28/5 %40-%49
  ['2925', 'disability', 'SK 28/5 (%40-%49, 2008 Ekim-Aralık)', '2008-09-01', '2008-12-31', 18, 4100, null, null, '%40-%49', null],
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

console.log(`✅ Database seeded with ${rules.length} retirement rules`);
console.log(`📁 Database: ${dbPath}`);

db.close();
