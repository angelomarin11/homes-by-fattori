# Decisão GO / NO-GO — Radar Conformidade

> Documento de decisão fria. Preenchido ANTES de gastar mais um real ou uma
> hora: se os gatilhos de abandono dispararem, **abandonamos sem drama** — o
> custo afundado até aqui é ~2 dias de trabalho e R$ 0 de caixa, e ele não
> volta por insistirmos.

## O julgamento honesto de hoje

A ideia **não é fantasiosa** — mas está **0% validada comercialmente**:

| Premissa | Status hoje | Evidência |
|---|---|---|
| A dor regulatória existe (Res. 780/2025, remoções) | ✅ Validada | Fatos públicos, remoções documentadas |
| O motor técnico funciona (classificar, verificar, relatar) | ✅ Validada em mock | 17 casos de teste; **zero catálogos reais** |
| Conseguimos coletar catálogos de terceiros | ❌ NÃO validada | Busca pública do ML bloqueada; híbrido não testado |
| O número do pitch é defensável | ⚠ Parcial | sold_quantity é referencial → corrigido para faixa |
| O lead do ranking compra homologação | ❌ NÃO validada | Corrigido p/ filtrar marca identificável, mas é proxy |
| Certificadora/consultoria PAGA por isso | ❌ NÃO validada | Zero conversas com compradores |
| O comprador certo é OCD | ❌ Provavelmente errada | Conflito de imparcialidade (ISO 17065) → alvo revisado p/ consultorias |
| O mercado dura | ⚠ Incerta | ML drena o estoque de irregulares; janela estimada 12–24 meses |

**Tradução:** temos um produto que funciona contra dados de mentira, para um
comprador com quem nunca falamos, alimentado por uma coleta que nunca rodou.
Isso não é motivo para abandonar — é motivo para **validar barato antes de
construir qualquer outra coisa**.

## Orçamento máximo de validação (cerca anti-teimosia)

- **Tempo:** 3 semanas corridas a partir do início do Gate 1.
- **Dinheiro:** ≤ R$ 300 (chave de API + eventuais custos de contato).
- **Código novo:** ZERO até os 3 gates fecharem. Nenhuma linha.

Estourou o orçamento sem fechar os gates → conta como gatilho de abandono.

## Os 3 gates (em ordem — parar no primeiro que matar)

### Gate 1 — Coleta (técnico) · ~1 dia · custo R$ 0

**Teste:** `node doctor.js --seller <loja real> --item <MLB real>` numa rede
normal + 1 scan real ponta a ponta de um catálogo verdadeiro (rota que o
doctor aprovar; `--seller me` com a própria conta serve para validar o motor).

**Passa se:** existe QUALQUER rota reprodutível de obter um catálogo de
terceiro (busca pública, híbrido via `/items`, ou colheita manual ≤ 30
min/loja) **e** o scan real roda até o relatório.

**🔴 ABANDONA a tese outbound se:** nenhuma rota funciona — nem `/items`
público, nem colheita manual viável. (A tese inbound com OAuth do vendedor
sobrevive a este gate, mas é OUTRO negócio e volta para o Gate 3 com outra
pergunta.)

### Gate 2 — Qualidade do sinal · ~2 dias · custo ≤ R$ 50

**Teste:** escanear 5 lojas reais de nicho eletrônico. Conferir manualmente
TODOS os 🔴: (a) taxa de falso positivo; (b) % de críticos com marca
identificável (lead que teoricamente compra homologação).

**Passa se:** falso positivo ≤ 20% nos críticos **e** ≥ 1 lead qualificado
(marca identificável) a cada 2 lojas escaneadas.

**🔴 ABANDONA se:** falso positivo > 40% (o produto acusa inocente — irreparável
como ferramenta de abordagem) **ou** ~0 leads qualificados em 5 lojas (o
ranking lista lojas, não clientes — a tese do valor morre).

### Gate 3 — Demanda (o gate que mata ou consagra) · ~2 semanas · custo R$ 0

**Teste:** 3 conversas reais — 2 consultorias de homologação + 1 OCD (nessa
ordem). Não é pitch: é entrevista. As 3 perguntas:

1. "Hoje, o gargalo de vocês é **achar cliente** ou **entregar para os que
   chegam**?" (se for entrega, lead não vale nada para eles)
2. "Como um cliente novo chega até vocês hoje? Quanto custa?" (se o inbound
   pós-remoção do ML já lota o funil deles, nosso outbound é redundante)
3. Mostrar o ranking real do Gate 2: "vocês pagariam R$ 1.000/mês por isso?
   Por quê não?" (a objeção real vale mais que o sim educado)

**Passa se:** ≥ 1 das 3 diz com clareza que falta lead **e** toparia um piloto
pago (mesmo barato) sobre os dados reais mostrados.

**🔴 ABANDONA se:** as 3 disserem que o gargalo é entrega/capacidade, ou que o
inbound já resolve, ou nenhuma topar piloto nem de graça. Sem comprador
declarado, não existe negócio — existe hobby.

## Regra agregada de decisão

- **Qualquer gatilho 🔴 disparado → abandonar a tese atual.** Permitido UM
  pivô documentado (ex.: outbound → triagem de inbound da consultoria), que
  reinicia APENAS o Gate 3 — os gates técnicos não se repetem.
- **Segundo gatilho 🔴 (na tese original ou no pivô) → abandono definitivo do
  projeto.** Arquiva-se o repositório com honra: o motor fica pronto caso o
  contexto mude (ex.: ML reabrir busca, ANATEL abrir API de denúncia, etc.).
- Gates 1–3 fechados em verde → aí sim vale investir: piloto real com o
  material já pronto (deck, playbook, proposta).

## O que NÃO é motivo para abandonar (ruído que ignoramos)

- "A API pode mudar de novo" — risco operacional de qualquer negócio sobre
  plataforma; mitigável, não fatal.
- Uma consultoria dizer "não" por preço — preço se ajusta; gatilho é ninguém
  reconhecer a dor.
- O primeiro scan real achar poucos críticos num nicho — troca-se o nicho
  antes de concluir; o gatilho é o padrão se repetir em 5 lojas de nichos
  diferentes.

## Registro da decisão

| Data | Gate | Resultado | Decisão | Assinado |
|---|---|---|---|---|
| _____ | 1 — Coleta | | | |
| _____ | 2 — Sinal | | | |
| _____ | 3 — Demanda | | | |
