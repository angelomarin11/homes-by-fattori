/**
 * Camada B — classificação por LLM dos itens que a Camada A marcou "incerto".
 *
 * Usa claude-haiku-4-5-20251001 (baixo custo), lotes de até 20 itens por
 * chamada, saída estruturada (JSON Schema) para não depender de parsing.
 * Sem ANTHROPIC_API_KEY, degrada: todos os incertos permanecem "incerto" (🟡).
 */
import Anthropic from '@anthropic-ai/sdk';
import { chunk, progress } from './util.js';

const MODEL = 'claude-haiku-4-5-20251001';
const BATCH = 20;

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['itens'],
  properties: {
    itens: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'regulado', 'confianca', 'motivo'],
        properties: {
          id: { type: 'string' },
          regulado: { type: 'string', enum: ['anatel', 'inmetro', 'ambos', 'nao', 'incerto'] },
          confianca: { type: 'number' },
          motivo: { type: 'string' },
        },
      },
    },
  },
};

const SYSTEM = `Você é um classificador de compliance regulatório brasileiro para anúncios do Mercado Livre.

Para cada item (título + categoria + atributos), responda se o PRODUTO anunciado exige:
- "anatel": homologação ANATEL (produto de telecomunicações/RF: emite ou recebe radiofrequência — bluetooth, wi-fi, celular, drone com RF, rastreador, rádio etc.)
- "inmetro": certificação compulsória INMETRO (carregadores/fontes USB, pilhas/baterias, brinquedos, panelas elétricas, produtos infantis etc.)
- "ambos": exige os dois
- "nao": não exige nenhum (inclui acessórios passivos: capas, películas, cabos simples, suportes, pulseiras)
- "incerto": impossível afirmar só com esses dados

Regras:
- Julgue o PRODUTO, não a marca. Um "fone bluetooth" exige ANATEL mesmo sem marca.
- Acessório passivo de produto regulado NÃO é regulado (capa de celular = "nao").
- Em dúvida real, responda "incerto" com confiança baixa — nunca chute "anatel"/"inmetro" sem indício claro. Falso positivo é pior que falso negativo aqui.
- "confianca" ∈ [0,1].
- "motivo": uma frase curta em português.`;

export async function classifyWithLLM(uncertainItems, { onBatch } = {}) {
  const results = new Map();
  if (!uncertainItems.length) return results;

  if (!process.env.ANTHROPIC_API_KEY) {
    progress('ANTHROPIC_API_KEY ausente — pulando Camada B (itens ambíguos ficam 🟡).');
    return results;
  }

  const client = new Anthropic();
  const batches = chunk(uncertainItems, BATCH);
  for (let i = 0; i < batches.length; i++) {
    const payload = batches[i].map((it) => ({
      id: it.id,
      titulo: it.title,
      categoria: it.categoryPath?.join(' > ') || it.category_id || '',
      atributos: (it.attributes ?? [])
        .slice(0, 8)
        .map((a) => `${a.name ?? a.id}: ${a.value_name ?? ''}`)
        .join('; '),
    }));

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
        messages: [
          {
            role: 'user',
            content: `Classifique estes ${payload.length} itens:\n\n${JSON.stringify(payload, null, 1)}`,
          },
        ],
      });

      if (response.stop_reason === 'refusal') {
        progress(`  lote ${i + 1}: recusado pelo modelo — itens permanecem incertos.`);
        continue;
      }
      const text = response.content.find((b) => b.type === 'text')?.text ?? '';
      const parsed = JSON.parse(text);
      for (const r of parsed.itens ?? []) {
        results.set(r.id, {
          regulado: r.regulado,
          confianca: Math.max(0, Math.min(1, Number(r.confianca) || 0)),
          motivo: r.motivo,
        });
      }
    } catch (err) {
      progress(`  lote ${i + 1} falhou (${err?.constructor?.name ?? 'erro'}: ${String(err.message).slice(0, 120)}) — itens permanecem incertos.`);
    }
    onBatch?.(i + 1, batches.length);
  }
  return results;
}
