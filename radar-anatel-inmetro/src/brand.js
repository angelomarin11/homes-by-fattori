/**
 * White-label: identidade da certificadora que aluga o sistema.
 * Carregada via --brand caminho.json; sem ela o relatório sai neutro
 * ("Radar Conformidade").
 */
import fs from 'node:fs';

export const DEFAULT_BRAND = {
  nome: 'Radar Conformidade',
  corPrimaria: '#1e3a5f',
  // contato/cta vazios = relatório neutro, sem bloco comercial
  contato: null,
  cta: null,
  poweredBy: false,
};

export function loadBrand(filePath) {
  if (!filePath) return DEFAULT_BRAND;
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!raw.nome) throw new Error(`--brand ${filePath}: campo "nome" é obrigatório.`);
  return {
    nome: String(raw.nome),
    corPrimaria: raw.corPrimaria ?? DEFAULT_BRAND.corPrimaria,
    contato: raw.contato ?? null, // { whatsapp, email, site, telefone } — todos opcionais
    cta: raw.cta ?? `Fale com a ${raw.nome} para conduzir a regularização dos itens apontados.`,
    poweredBy: raw.poweredBy !== false, // rodapé "powered by Radar Conformidade"
  };
}

export function contactLine(brand) {
  if (!brand?.contato) return '';
  const c = brand.contato;
  return [c.whatsapp && `WhatsApp ${c.whatsapp}`, c.telefone && `Tel. ${c.telefone}`, c.email, c.site]
    .filter(Boolean)
    .join(' · ');
}
