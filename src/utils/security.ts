export const sanitize = (input: string, maxLen = 500): string => {
  if (typeof input !== 'string') return '';
  return input.slice(0,maxLen).replace(/[<>'"`;]/g,'').replace(/\0/g,'').replace(/javascript:/gi,'').trim();
};
export const sanitizePhone = (phone: string): string => {
  const d = phone.replace(/\D/g,'').slice(0,12);
  if (d.length===9) return '998'+d;
  if (d.length===12 && d.startsWith('998')) return d;
  throw new Error("Telefon raqam noto'g'ri");
};
export const sanitizeName = (name: string): string => {
  const s = sanitize(name,100).replace(/[^a-zA-ZА-Яа-яЎўҚқҒғҲҳ' -]/g,'').trim();
  if (s.length < 2) throw new Error("Ism kamida 2 ta harf");
  return s;
};
export const maskCard = (card: string) => '**** **** **** ' + card.replace(/\D/g,'').slice(-4);
export const formatPhone = (p: string) => {
  const d = p.replace(/\D/g,'');
  if (d.length===12 && d.startsWith('998'))
    return `+998 ${d.slice(3,5)} ${d.slice(5,8)} ${d.slice(8,10)} ${d.slice(10)}`;
  return '+'+d;
};
