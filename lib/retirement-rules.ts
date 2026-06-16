/**
 * EMEKLİLİK ŞARTLARI - TÜM STATÜLER
 * Kaynak: Kitap1.xlsx (4/b, 4/c), Kitap2.xlsx (4/a), Resmi belgeler
 * 
 * Üç tür emeklilik:
 * 1. NORMAL EMEKLİLİK (Hizmet Yılı + Yaş şartı)
 * 2. YAŞTAN EMEKLİLİK (Kademeli yükselen yaş - 08.09.1999+)
 * 3. MALÜLLÜK EMEKLİLİK (SK 28/4: İlk işe girişte | SK 28/5: İşe girdikten sonra derece-bazlı)
 */

// 4/a SK 28/4 (İlk İşe Girişte Malül)
export const SK284_4A = [
  { dateFrom: new Date(1981, 8, 9), dateTo: new Date(1999, 8, 7), serviceYears: 15, days: 3600 },
  { dateFrom: new Date(1999, 8, 8), dateTo: new Date(2099, 11, 31), serviceYears: 15, days: 3960 },
];

// 4/a SK 28/5 (Derece Bazlı)
export const SK285_4A = {
  '%50-%59': { serviceYears: 16, days: 4320 },
  '%40-%49': { serviceYears: 18, days: 4680 },
};

// 4/b Normal + SK 28/4 + SK 28/5
export const SK284_4B = [
  { dateFrom: new Date(1981, 8, 9), dateTo: new Date(1999, 8, 7), serviceYears: 20, days: 7200 },
  { dateFrom: new Date(1999, 8, 8), dateTo: new Date(2008, 3, 30), serviceYears: 15, days: 5400, ageWoman: 60, ageMan: 62 },
  { dateFrom: new Date(2008, 4, 1), dateTo: new Date(2099, 11, 31), serviceYears: null, days: 9000, ageWoman: 58, ageMan: 60 },
];

export const SK285_4B = {
  '%50-%59': { serviceYears: 16, days: 4320 },
  '%40-%49': { serviceYears: 18, days: 4680 },
};

// 4/c Normal + Yaştan + SK 28/4 + SK 28/5
export const NORMAL_4C = [
  { dateFrom: new Date(1981, 8, 9), dateTo: new Date(1999, 8, 7), serviceYears: 25, days: 9000 },
  { dateFrom: new Date(1999, 8, 8), dateTo: new Date(2008, 3, 30), serviceYears: 25, days: 9000, ageWoman: 58, ageMan: 60 },
  { dateFrom: new Date(2008, 4, 1), dateTo: new Date(2099, 11, 31), serviceYears: null, days: 9000, ageWoman: 58, ageMan: 60 },
];

export const AGE_BASED_4C = [
  { dateFrom: new Date(1981, 8, 9), dateTo: new Date(1999, 8, 7), serviceYears: 20, days: 7200 },
  { dateFrom: new Date(2008, 4, 1), dateTo: new Date(2035, 11, 31), serviceYears: null, days: 9000, ageWoman: 58, ageMan: 60, type: 'tam' },
  { dateFrom: new Date(2036, 0, 1), dateTo: new Date(2037, 11, 31), serviceYears: null, days: 9000, ageWoman: 59, ageMan: 61, type: 'tam' },
  { dateFrom: new Date(2038, 0, 1), dateTo: new Date(2039, 11, 31), serviceYears: null, days: 9000, ageWoman: 60, ageMan: 62, type: 'tam' },
  { dateFrom: new Date(2040, 0, 1), dateTo: new Date(2041, 11, 31), serviceYears: null, days: 9000, ageWoman: 61, ageMan: 63, type: 'tam' },
  { dateFrom: new Date(2042, 0, 1), dateTo: new Date(2043, 11, 31), serviceYears: null, days: 9000, ageWoman: 62, ageMan: 64, type: 'tam' },
  { dateFrom: new Date(2044, 0, 1), dateTo: new Date(2045, 11, 31), serviceYears: null, days: 9000, ageWoman: 63, ageMan: 65, type: 'tam' },
  { dateFrom: new Date(2046, 0, 1), dateTo: new Date(2047, 11, 31), serviceYears: null, days: 9000, ageWoman: 64, ageMan: 65, type: 'tam' },
  { dateFrom: new Date(2048, 0, 1), dateTo: new Date(2099, 11, 31), serviceYears: null, days: 9000, ageWoman: 65, ageMan: 65, type: 'tam' },
  { dateFrom: new Date(2008, 4, 1), dateTo: new Date(2035, 11, 31), serviceYears: null, days: 5400, ageWoman: 61, ageMan: 63, type: 'kismi' },
  { dateFrom: new Date(2036, 0, 1), dateTo: new Date(2037, 11, 31), serviceYears: null, days: 5400, ageWoman: 62, ageMan: 64, type: 'kismi' },
  { dateFrom: new Date(2038, 0, 1), dateTo: new Date(2039, 11, 31), serviceYears: null, days: 5400, ageWoman: 63, ageMan: 65, type: 'kismi' },
  { dateFrom: new Date(2040, 0, 1), dateTo: new Date(2041, 11, 31), serviceYears: null, days: 5400, ageWoman: 64, ageMan: 65, type: 'kismi' },
  { dateFrom: new Date(2042, 0, 1), dateTo: new Date(2099, 11, 31), serviceYears: null, days: 5400, ageWoman: 65, ageMan: 65, type: 'kismi' },
];

export const SK284_4C = {
  '%50-%59': { days: 5760 },
  '%40-%49': { days: 6480 },
};

export const SK285_4C = {
  '%50-%59': { serviceYears: 16, days: 5760 },
  '%40-%49': { serviceYears: 20, days: 6480 },
};

// 2925 (Tarım)
export const NORMAL_2925 = { serviceYears: 15, days: 3600, ageWoman: 58, ageMan: 60 };

export const SK284_2925 = [
  { dateFrom: new Date(2008, 9, 1), dateTo: new Date(2008, 11, 31), serviceYears: 15, days: 3700 },
  { dateFrom: new Date(2009, 0, 1), dateTo: new Date(2009, 11, 31), serviceYears: 15, days: 3800 },
  { dateFrom: new Date(2010, 0, 1), dateTo: new Date(2010, 11, 31), serviceYears: 15, days: 3900 },
  { dateFrom: new Date(2011, 0, 1), dateTo: new Date(2099, 11, 31), serviceYears: 15, days: 3960 },
];

export const SK285_2925 = [
  // %50-%59
  { derece: '%50-%59', tarihFrom: new Date(2008, 9, 1), tarihTo: new Date(2008, 11, 31), serviceYears: 16, days: 3700 },
  { derece: '%50-%59', tarihFrom: new Date(2009, 0, 1), tarihTo: new Date(2009, 11, 31), serviceYears: 16, days: 3800 },
  { derece: '%50-%59', tarihFrom: new Date(2010, 0, 1), tarihTo: new Date(2010, 11, 31), serviceYears: 16, days: 3900 },
  { derece: '%50-%59', tarihFrom: new Date(2011, 0, 1), tarihTo: new Date(2011, 11, 31), serviceYears: 16, days: 4000 },
  { derece: '%50-%59', tarihFrom: new Date(2012, 0, 1), tarihTo: new Date(2012, 11, 31), serviceYears: 16, days: 4100 },
  { derece: '%50-%59', tarihFrom: new Date(2013, 0, 1), tarihTo: new Date(2013, 11, 31), serviceYears: 16, days: 4200 },
  { derece: '%50-%59', tarihFrom: new Date(2014, 0, 1), tarihTo: new Date(2014, 11, 31), serviceYears: 16, days: 4300 },
  { derece: '%50-%59', tarihFrom: new Date(2015, 0, 1), tarihTo: new Date(2099, 11, 31), serviceYears: 16, days: 4320 },
  // %40-%49
  { derece: '%40-%49', tarihFrom: new Date(2008, 9, 1), tarihTo: new Date(2008, 11, 31), serviceYears: 18, days: 4100 },
  { derece: '%40-%49', tarihFrom: new Date(2009, 0, 1), tarihTo: new Date(2009, 11, 31), serviceYears: 18, days: 4200 },
  { derece: '%40-%49', tarihFrom: new Date(2010, 0, 1), tarihTo: new Date(2010, 11, 31), serviceYears: 18, days: 4300 },
  { derece: '%40-%49', tarihFrom: new Date(2011, 0, 1), tarihTo: new Date(2011, 11, 31), serviceYears: 18, days: 4400 },
  { derece: '%40-%49', tarihFrom: new Date(2012, 0, 1), tarihTo: new Date(2012, 11, 31), serviceYears: 18, days: 4500 },
  { derece: '%40-%49', tarihFrom: new Date(2013, 0, 1), tarihTo: new Date(2013, 11, 31), serviceYears: 18, days: 4600 },
  { derece: '%40-%49', tarihFrom: new Date(2014, 0, 1), tarihTo: new Date(2099, 11, 31), serviceYears: 18, days: 4680 },
];
