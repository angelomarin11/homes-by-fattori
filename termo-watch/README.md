# Termo Watch — jogo estilo Termo num relógio de pulso

Guia técnico para rodar um jogo estilo **Termo** (Wordle em português) num relógio
digital de pulso, e base para a microbrand brasileira de "relógios com jogos".

## A resposta curta

- **Casio de prateleira (F-91W, A158W, W-59...) não é programável.** O chip é
  máscara de fábrica, sem firmware acessível.
- **SKMEI de prateleira também não é programável.** A SKMEI é uma fábrica
  OEM/ODM de Guangzhou — serve para a fase de *marca própria* (caixa, pulseira,
  mostrador com sua marca), não para hackear o módulo.
- **O caminho real é o [Sensor Watch](https://www.sensorwatch.net/):** uma placa
  de reposição (ARM Cortex-M0+, Microchip SAM L22) que substitui o módulo
  original do **Casio F-91W / A158W**. Você abre o relógio, troca a placa, e
  passa a ter um relógio 100% programável em C, com bootloader USB (UF2) e
  mais de um ano de bateria numa CR2016.

O firmware comunitário do Sensor Watch chama-se **Movement**
([joeycastillo/Sensor-Watch](https://github.com/joeycastillo/Sensor-Watch)) e
já inclui dezenas de "watch faces" — **inclusive uma de Wordle em inglês**
(`wordle_face`). Ou seja: o conceito já está provado no hardware. O que este
diretório adiciona é um protótipo de **Termo em português** (`firmware/`).

## Hardware necessário (fase maker)

| Item | Onde | Custo aprox. |
|---|---|---|
| Casio F-91W ou A158W | qualquer loja BR | R$ 120–180 |
| Placa Sensor Watch (ou Sensor Watch Pro) | [Crowd Supply](https://www.crowdsupply.com/oddly-specific-objects/sensor-watch) | US$ 35–50 |
| Chave de precisão + pulseira antiestática | — | — |

A troca da placa leva ~15 minutos (4 parafusos, 1 flat cable do LCD). O LCD, a
caixa, os botões e o buzzer originais do Casio continuam sendo usados.

## O jogo no LCD de segmentos

O LCD do F-91W tem 10 posições, mas só as posições **4–9** (a linha principal,
6 dígitos) exibem letras razoavelmente bem. Restrições que o design do jogo
respeita:

- Palavras de **5 letras**, sem acento (o Termo original também ignora acentos).
- Alfabeto restrito às letras legíveis em 7 segmentos:
  `A B C D E F G H I J L N O P Q R S T U Z` (evitamos M, K, V, W, X, Y).
- Feedback sem cores: **letra fixa = posição certa (verde)**, **letra piscando
  = existe em outra posição (amarelo)**, **traço = não existe (cinza)**.
- 6 tentativas; contador da tentativa no canto superior; **palavra do dia**
  derivada da data (mesma palavra pra todo mundo no mesmo dia, como no Termo).

Controles (padrão Movement):

- **ALARM (curto):** troca a letra na posição do cursor.
- **LIGHT (curto):** avança o cursor; na 5ª letra, submete a tentativa.
- **ALARM (longo):** novo jogo / recomeçar.
- **MODE:** sai para a próxima watch face.

## Compilando o protótipo

```sh
git clone https://github.com/joeycastillo/Sensor-Watch.git
cd Sensor-Watch/movement
# copie termo_face.c/.h para watch_faces/complication/
# adicione a face em movement_faces.h e movement_config.h
make            # firmware real (requer arm-none-eabi-gcc)
# ou simule no navegador com emscripten:
cd make && emmake make && python3 -m http.server -d build-sim
```

> **Nota:** o código em `firmware/` segue a API clássica do Movement
> (`movement_settings_t`). O projeto está migrando para o "second movement"
> (API 2.0) — se o repositório upstream tiver mudado as assinaturas, use a
> `wordle_face` oficial como referência de porte; a lógica do jogo é isolada
> e não muda.

## Fontes

- Sensor Watch: https://www.sensorwatch.net/ e
  https://github.com/joeycastillo/Sensor-Watch
- Sensor Watch Pro (tem versão com LCD custom de mais caracteres):
  https://www.crowdsupply.com/oddly-specific-objects/sensor-watch-pro
- SKMEI OEM/ODM: https://www.skmeifactory.com/
- LCDs de segmento custom são baratos em volume:
  https://hackaday.com/2018/07/24/custom-lcd-module-is-unexpectedly-cheap-and-easy/

Veja `PLANO-DA-MARCA.md` para o caminho da microbrand.
