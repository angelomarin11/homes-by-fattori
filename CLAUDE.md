# Duality — contexto do projeto (para o Claude Code)

Este arquivo dá a você, Claude Code, todo o contexto necessário pra continuar o trabalho sem que o Angelo precise reexplicar nada. Leia inteiro antes de começar.

## O que é

Duality é um produto social viral inspirado na Million Dollar Homepage, mas interativo. Uma **disputa ao vivo entre dois lados** (ex: Jesus vs Diabo, Flamengo vs Vasco) num tabuleiro de blocos. Pessoas pagam pra pintar blocos do seu lado e empurrar a fronteira. O nome de quem paga fica cravado no bloco.

## Mecânica (já decidida — não reabrir sem o Angelo pedir)

- Tabuleiro 24×24 (576 blocos). Bloco virgem custa R$2 (ou moeda do locale).
- **Tomar um bloco do adversário custa o dobro do que ele pagou** — e o preço daquele bloco dobra a cada reconquista. Território vira disputa cara.
- **Handicap:** quem está perdendo reconquista com desconto (até 50%), pra reacender a disputa.
- **Vitória sustentada:** ao chegar a 80%, inicia contagem de **24h**. Se o líder segurar 80% por 24h, vence. Se for derrubado antes, zera. Vitória encerra a disputa (vira monumento).
- **Bloco Eterno:** R$100, imune a conquista, escassez de 50 por disputa.
- **Split 70% criador / 30% plataforma (Angelo).**
- Primeira jogada custa R$1 (degrau de entrada). Toque grátis pra experimentar.

## Gamificação v2 (ver GAME-DESIGN.md pro racional completo)

- **Grito de Guerra:** toda jogada pode levar uma frase; o gasto define o palco (mural →
  destaque 15+ → tela inteira 50+/Eterno). O dinheiro continua comprando blocos.
- **Equipes:** tag coletiva com ranking próprio. SÓ status — nunca payout (pirâmide).
- **Modo Transmissão:** tela limpa pra OBS com QR "escaneie e entre". Streamer = criador = 70%.
- **Emblema do jogador** nos blocos tomados + **skins de arena**, **gritos prontos**,
  **mensagem de vitória** e **simulador de ganhos** no estúdio do criador.
- **Combo e meta coletiva:** momentum visual; não alteram preço nem regra.
- Primeira jogada: promo fixa de **até 5 blocos por R$1** (corrigido — antes R$1 não comprava nada).

## Decisões de produto importantes

- **Curadoria fechada:** só criadores aprovados publicam disputas.
- **Sem atividade fabricada.** Versões antigas faziam o mapa se mexer sozinho "pra parecer cheio" — isso é engano e foi REMOVIDO. Toda atividade real vem de pagamento. (A demo do trailer/home é exceção, claramente rotulada como demonstração.)
- **Sem recompensa por recrutamento.** O campo `ref` é só atribuição. Pagar por indicação = pirâmide. Não implementar. (Equipes também não pagam nada — só ranking.)
- **Mural sem mensagem grátis:** grito só entra pago junto da jogada. Moderação = apagar `transactions.cry`.
- **i18n PT/EN/ES** com detecção de navegador + seletor.
- **Pagamento por país:** BR→Pix (Pagar.me, split nativo), internacional→Stripe Connect.

## Estrutura

```
app/
  page.jsx              # renderiza components/Duality.jsx
  layout.jsx
  api/
    charge/route.js     # calcula blocos/preço no servidor + cry/crew/flair, gera pagamento
    webhook/route.js    # confirma pagamento, pinta blocos (com flair), soma equipe, vitória 24h
    duels/route.js      # cria disputa (criador aprovado) + semeia blocos
    check-wins/route.js # CRON 1/min: conclui disputas com prazo 24h vencido
components/
  Duality.jsx           # app: trailer→home→estúdio→jogar (+hype, equipes, gritos)
  duality/
    rules.js            # constantes + helpers puros (tiers de grito, combo, metas, skins)
    i18n.js             # dicionário PT/EN/ES completo
    theme.js            # paleta carvão, animações CSS, objeto S de estilos
    Board.jsx           # canvas do tabuleiro (lados, imagens, Eternos, emblemas)
    Tv.jsx              # modo transmissão (OBS) com QR
lib/
  payments.js           # roteamento Pix/Stripe + split
  db.js                 # client Supabase lazy (não quebra build sem env)
db/
  schema.sql            # rodar no Supabase SQL Editor (inclui crews + cry/crew/flair)
GAME-DESIGN.md          # racional da gamificação v2
```

## Estado atual e o que falta (em ordem de prioridade)

O frontend v2 está completo, **compila (`next build` ✓) e foi testado no navegador** (fluxo
trailer→home→estúdio→jogar→grito→Eterno→TV, sem erros de console/hidratação). Continua em
**estado local com pagamento simulado**, rotulado como demo. O backend está escrito
(incluindo cry/crew/flair) mas **nunca foi testado com pagamento real**. Prioridades:

1. **Conectar o frontend ao backend real:** trocar o estado local por leitura do Supabase
   (Realtime em `blocks`, gritos das últimas `transactions` pagas, `crews`), e o pagamento
   simulado pela chamada a `/api/charge` + tela de QR/cartão.
2. **Criar a rota pública `/d/[id]`** que carrega uma disputa específica do banco (hoje o
   componente tem uma disputa fixa em memória).
3. **Testar um pagamento real** em sandbox (Pagar.me tem ambiente de teste). Este é o marco
   que valida tudo.
4. **Painel de moderação** (remover nomes/gritos/disputas abusivas) — obrigatório antes de
   abrir ao público. Grito é conteúdo público pago: precisa de filtro de palavras + remoção.
5. **QR real no modo TV** (hoje é placeholder visual) — gerar QR do link `/d/[id]`.

## O que NÃO é código (Angelo precisa providenciar pra publicar)

CNPJ, contas empresariais no Pagar.me e Stripe, contador (repasse fiscal 70/30), advogado (termos LGPD/GDPR, termo do Eterno, moderação). Ver README.md do backend. NÃO finja que isso é opcional.

## Recomendação estratégica (importante)

O Angelo tem um padrão — reconhecido por ele — de gerar ideias e adicionar features sem fechar o ciclo comercial. **O passo de maior valor não é mais nenhuma feature; é processar UM pagamento real.** Comece validando no Brasil com Pix, uma disputa só. Não ative Stripe/internacional antes disso. Se ele pedir mais features antes de validar, vale apontar isso com gentileza.

## Estilo de código

Frontend: React com estilos inline (objeto `S`). Fontes Archivo/Space Mono. Paleta carvão (#0B0A0F) com as cores da disputa como únicos acentos. Visual "câmbio sagrado" — mercado de disputa ao vivo.
