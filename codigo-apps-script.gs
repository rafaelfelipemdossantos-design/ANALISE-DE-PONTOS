// ===== CENTRAL DE AUDITORIAS — Google Apps Script =====
// 1) TROQUE as duas chaves abaixo por senhas suas (letras e números, sem espaços).
const CHAVE_ENVIO   = 'TROQUE-CHAVE-ENVIO';    // vai no link dos promotores (só grava)
const CHAVE_LEITURA = 'TROQUE-CHAVE-LEITURA';  // só você usa no Analisador (lê tudo)
const ABA = 'Auditorias';

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(ABA);
  if (!s) {
    s = ss.insertSheet(ABA);
    s.appendRow(['id','recebido_em','loja','promotor','data','modelo','canal','pontos','maximo','status','json']);
    s.setFrozenRows(1);
  }
  return s;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// Recebe a auditoria do Simulador
function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.chave !== CHAVE_ENVIO) return out_({ ok: false, erro: 'chave inválida' });
    const r = b.registro;
    if (!r || !r.loja || !r.ts) return out_({ ok: false, erro: 'registro inválido' });
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const s = aba_(), id = String(r.loja).trim().toLowerCase() + '|' + r.ts + '|' + r.canal;
      const ids = s.getLastRow() > 1 ? s.getRange(2, 1, s.getLastRow() - 1, 1).getValues().flat() : [];
      if (!ids.includes(id)) s.appendRow([id, new Date(), r.loja, r.promotor, "'" + r.ts, r.modelo, r.canal, r.got, r.max, r.status, JSON.stringify(r)]);
    } finally { lock.releaseLock(); }
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false, erro: String(err) }); }
}
// Entrega todas as auditorias para o Analisador
function doGet(e) {
  if (!e.parameter || e.parameter.chave !== CHAVE_LEITURA) return out_({ ok: false, erro: 'chave inválida' });
  const s = aba_(), n = s.getLastRow() - 1;
  const dados = n > 0 ? s.getRange(2, 11, n, 1).getValues()
    .map(r => { try { return JSON.parse(r[0]); } catch (x) { return null; } }).filter(Boolean) : [];
  return out_({ ok: true, dados: dados });
}
