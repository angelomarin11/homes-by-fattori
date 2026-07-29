/**
 * Combina Camada A (regras) + Camada B (LLM) + verificação ANATEL e decide o
 * semáforo final de cada item.
 *
 * Postura: 🔴 só com alta convicção (regras com certeza alta, ou LLM ≥ 0.9).
 * Toda dúvida vira 🟡. INMETRO nunca vira 🔴 (não há base pública consultável
 * em lote para validar certificado — exigiria verificação manual).
 */
import { verifyCode } from './anatel.js';

const LLM_REGULATED_MIN = 0.8; // abaixo disso, continua incerto
const LLM_CRITICAL_MIN = 0.9;  // abaixo disso, regulado por LLM fica 🟡, não 🔴
const LLM_CLEAR_MIN = 0.7;     // "nao" do LLM com essa confiança → 🟢

export function resolveClassification(ruleResult, llmResult) {
  if (ruleResult.regulado !== 'incerto') {
    return { ...ruleResult, fonte: 'regras' };
  }
  if (llmResult) {
    const { regulado, confianca, motivo } = llmResult;
    if (['anatel', 'inmetro', 'ambos'].includes(regulado) && confianca >= LLM_REGULATED_MIN) {
      return { regulado, certeza: confianca >= LLM_CRITICAL_MIN ? 'alta' : 'media', motivo, fonte: 'llm', confianca };
    }
    if (regulado === 'nao' && confianca >= LLM_CLEAR_MIN) {
      return { regulado: 'nao', certeza: 'media', motivo, fonte: 'llm', confianca };
    }
    return { regulado: 'incerto', certeza: null, motivo, fonte: 'llm', confianca };
  }
  return { ...ruleResult, fonte: 'regras' };
}

/**
 * @returns {'critico'|'atencao'|'ok'} + motivo de status
 */
export function decideStatus(cls, codeInfo, base) {
  const isAnatel = cls.regulado === 'anatel' || cls.regulado === 'ambos';
  const isInmetro = cls.regulado === 'inmetro' || cls.regulado === 'ambos';

  if (cls.regulado === 'nao') {
    return { status: 'ok', statusMotivo: 'Produto não regulado (ANATEL/INMETRO não se aplicam).' };
  }

  if (cls.regulado === 'incerto') {
    return {
      status: 'atencao',
      statusMotivo: `Classificação incerta — recomenda-se verificação manual. (${cls.motivo})`,
    };
  }

  if (isAnatel) {
    if (codeInfo) {
      const v = verifyCode(codeInfo.code, base);
      if (v === 'valido') {
        return {
          status: 'ok',
          statusMotivo: `Código de homologação exibido (${codeInfo.fonte}) e localizado na base ANATEL.`,
          verificacao: v,
        };
      }
      if (v === 'base_indisponivel') {
        return {
          status: 'atencao',
          statusMotivo: `Código exibido (${codeInfo.fonte}), mas a base ANATEL não pôde ser consultada nesta execução.`,
          verificacao: v,
        };
      }
      return {
        status: 'atencao',
        statusMotivo: `Código exibido (${codeInfo.fonte}) mas NÃO localizado na base ANATEL — pode ser digitação incorreta, código de outro produto ou base desatualizada. Verificar manualmente.`,
        verificacao: v,
      };
    }
    // sem código exibido
    if (cls.certeza === 'alta') {
      return {
        status: 'critico',
        statusMotivo:
          'Produto de RF/telecom sem código de homologação ANATEL visível no anúncio — exigência da Res. 780/2025; anúncios assim vêm sendo removidos.',
      };
    }
    return {
      status: 'atencao',
      statusMotivo: 'Provável produto de RF/telecom sem código de homologação visível — confirmar e regularizar.',
    };
  }

  if (isInmetro) {
    return {
      status: 'atencao',
      statusMotivo:
        'Categoria com certificação INMETRO compulsória — verificar se o produto possui registro/certificado e se o anúncio o informa.',
    };
  }

  return { status: 'atencao', statusMotivo: 'Situação não determinada — verificação manual.' };
}

/** Estimativa de faturamento mensal: sold_quantity / meses ativos. */
export function estimateMonthlyRevenue(item, detail, now = Date.now()) {
  const sold = item.sold_quantity ?? detail?.sold_quantity ?? null;
  const price = item.price ?? detail?.price ?? null;
  if (sold == null || price == null) return { monthlySales: null, monthlyRevenue: null };
  const start = detail?.start_time ? Date.parse(detail.start_time) : null;
  const months = start ? Math.max(1, (now - start) / (30 * 24 * 3600 * 1000)) : null;
  const monthlySales = months ? sold / months : null;
  return {
    monthlySales,
    monthlyRevenue: monthlySales != null ? monthlySales * price : null,
    lifetimeRevenue: sold * price,
  };
}
