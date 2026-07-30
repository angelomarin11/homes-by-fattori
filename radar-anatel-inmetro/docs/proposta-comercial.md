# Radar Conformidade — Proposta de licenciamento para certificadora (OCD)

> Documento-base para a conversa comercial. Valores são **referência de
> negociação**, não tabela final.

## O contexto (por que agora)

- A **Resolução ANATEL 780/2025** está em pleno vigor desde a queda da liminar
  do Mercado Livre (fev/2026): anúncios de produtos de telecomunicações/RF
  precisam exibir o código de homologação, e marketplace + vendedor respondem
  solidariamente.
- A ANATEL fiscaliza ativamente com ferramenta própria de IA (Regulatron) e
  milhares de anúncios já foram removidos.
- Resultado: **milhares de vendedores com produtos irregulares** que precisam
  exatamente do serviço que uma certificadora vende — e a maioria ainda não
  sabe disso.

## O problema da certificadora

Prospecção de certificação é cara: o lead não sabe que tem o problema, o ciclo
de venda começa com evangelização, e identificar quem precisa de homologação
exige análise manual de catálogos.

## O que o Radar Conformidade entrega

Uma **máquina de leads qualificados**, com a sua marca:

1. **Entrada:** lista de lojas do Mercado Livre (nichos que você atende).
2. **Scan automático** de cada catálogo: classificação ANATEL/INMETRO em duas
   camadas (regras + IA), busca do código de homologação no anúncio e
   conferência na base pública de produtos homologados da ANATEL.
3. **Saída A — ranking de prospecção** (`leads.html` + `leads.csv` p/ CRM):
   lojas ordenadas por oportunidade — nº de anúncios críticos e **faturamento
   mensal em risco** (a dor, já quantificada em R$).
4. **Saída B — relatório individual white-label**: documento profissional com
   a sua marca, cores e contato, pronto para enviar ao lojista como
   *diagnóstico gratuito*. O caminho de regularização aponta para o seu
   serviço.

O fluxo comercial fica: escanear nicho → abordar as lojas do topo do ranking
com o relatório em anexo → converter diagnóstico em contrato de homologação.

## Por que funciona como abertura de conversa

O relatório não diz "compre certificação". Diz: **"R$ X de faturamento mensal
do seu negócio está em risco de remoção — e aqui está o caminho para
resolver"**. É informação verificável (dados públicos), com números da própria
loja do prospect.

## Modelo de licenciamento (proposta)

| Plano | Referência mensal | Inclui |
|---|---|---|
| Piloto (30 dias) | R$ 997 | Até 20 scans, relatórios white-label, ranking de leads, suporte por e-mail. Objetivo: fechar 1 contrato e provar o ROI. |
| Essencial | R$ 1.997 | Até 100 scans/mês, white-label completo, atualização semanal da base ANATEL. |
| Profissional | R$ 3.497 | Scans ilimitados, ajustes de regras para os nichos da certificadora, prioridade de suporte e evolução. |

**Conta de ROI:** um único processo de homologação típico (ensaios +
certificação) fatura da ordem de R$ 15–40 mil para a certificadora. Um
contrato fechado por trimestre já paga a licença várias vezes.

## O que a ferramenta NÃO é (transparência)

- Não é parecer jurídico; é análise automatizada de dados públicos, sujeita a
  falsos positivos — o relatório declara isso e o processo prevê validação
  humana antes da abordagem.
- Não acessa dados privados de vendedores: usa API pública do Mercado Livre e
  dados abertos da ANATEL.
- Não orienta evasão de fiscalização — só o caminho de regularização.

## Operação

- Hoje: CLI simples (`node scan.js --sellers lojas.txt --brand voce.json`),
  operável pela certificadora ou operado por nós como serviço.
- Roadmap (se a parceria validar): painel web, agendamento automático de
  re-scans, monitoramento contínuo dos clientes já convertidos (upsell de
  "vigilância de conformidade").

## Próximo passo sugerido

Piloto de 30 dias: você indica 10–20 lojas do seu nicho-alvo, entregamos o
ranking + relatórios com a sua marca e acompanhamos as duas primeiras
abordagens.
