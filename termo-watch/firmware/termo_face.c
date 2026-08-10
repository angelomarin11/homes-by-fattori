/*
 * termo_face — jogo estilo Termo (Wordle PT-BR) para o Sensor Watch.
 *
 * Regras adaptadas ao LCD de 7 segmentos do F-91W:
 *  - palavras de 5 letras, sem acento, alfabeto restrito a letras legiveis;
 *  - palavra do dia derivada da data (mesma palavra para todos no dia);
 *  - feedback: letra fixa = posicao certa, letra piscando = existe em outra
 *    posicao, traco = nao existe.
 *
 * Controles:
 *  - ALARM curto: troca a letra sob o cursor
 *  - LIGHT curto: avanca o cursor; na 5a letra, submete a tentativa
 *  - ALARM longo: novo jogo
 *  - MODE: proxima watch face
 */

#include <stdlib.h>
#include <string.h>
#include "termo_face.h"
#include "watch.h"
#include "watch_utility.h"

// Letras que renderizam bem em 7 segmentos (sem M, K, V, W, X, Y).
static const char termo_alphabet[] = "ABCDEFGHIJLNOPQRSTUZ";
#define TERMO_ALPHABET_LEN 20

// Somente letras do alfabeto acima; sem acentos, como no Termo original.
static const char *termo_words[] = {
    "TERRA", "PRATO", "FESTA", "PONTE", "LINHA", "GOSTO", "PORTA", "PEDRA",
    "PLANO", "BRISA", "CARTA", "CANTO", "TIGRE", "GRITO", "SALTO", "SONHO",
    "TARDE", "NOITE", "DENTE", "FRUTA", "PASTA", "PISTA", "ROSTO", "SANTO",
    "TINTA", "TRIGO", "TROCO", "TRONO", "USINA", "PIANO", "RADIO", "LITRO",
    "FILHO", "FOLHA", "PALHA", "PRAIA", "GARFO", "LOUCO", "JUSTO", "OBRAS",
    "SIGLA", "REGRA", "GRUPO", "SITIO", "LENTE", "PONTA", "TROPA", "PAUSA",
};
#define TERMO_NUM_WORDS (sizeof(termo_words) / sizeof(termo_words[0]))

static uint8_t alphabet_index_of(char c) {
    for (uint8_t i = 0; i < TERMO_ALPHABET_LEN; i++) {
        if (termo_alphabet[i] == c) return i;
    }
    return 0;
}

// Palavra do dia: indice deterministico derivado da data local.
static void termo_pick_word_of_the_day(termo_face_state_t *state) {
    watch_date_time now = watch_rtc_get_date_time();
    uint32_t day_key = (uint32_t)now.unit.year * 372 + (uint32_t)now.unit.month * 31 + now.unit.day;
    // multiplicador primo para nao percorrer a lista em ordem alfabetica
    strcpy(state->secret, termo_words[(day_key * 37) % TERMO_NUM_WORDS]);
}

static void termo_reset_guess(termo_face_state_t *state) {
    for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) state->letter_idx[i] = 0;
    state->cursor = 0;
}

static void termo_new_game(termo_face_state_t *state) {
    termo_pick_word_of_the_day(state);
    termo_reset_guess(state);
    state->attempt = 1;
    state->mode = TERMO_MODE_GUESSING;
}

// Avaliacao em dois passos (verdes primeiro) para tratar letras repetidas
// do mesmo jeito que o Termo/Wordle.
static void termo_evaluate_guess(termo_face_state_t *state) {
    char guess[TERMO_WORD_LEN];
    char remaining[TERMO_WORD_LEN];
    for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
        guess[i] = termo_alphabet[state->letter_idx[i]];
        remaining[i] = state->secret[i];
    }
    for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
        if (guess[i] == state->secret[i]) {
            state->result[i] = TERMO_LETTER_CORRECT;
            remaining[i] = 0;
        } else {
            state->result[i] = TERMO_LETTER_ABSENT;
        }
    }
    for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
        if (state->result[i] == TERMO_LETTER_CORRECT) continue;
        for (uint8_t j = 0; j < TERMO_WORD_LEN; j++) {
            if (remaining[j] == guess[i]) {
                state->result[i] = TERMO_LETTER_PRESENT;
                remaining[j] = 0;
                break;
            }
        }
    }
}

static bool termo_guess_is_correct(termo_face_state_t *state) {
    for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
        if (state->result[i] != TERMO_LETTER_CORRECT) return false;
    }
    return true;
}

static void termo_draw(termo_face_state_t *state) {
    char buf[11];

    switch (state->mode) {
        case TERMO_MODE_TITLE:
            watch_display_string("TE  TERMO ", 0);
            break;
        case TERMO_MODE_GUESSING: {
            buf[0] = 'T';
            buf[1] = '0' + state->attempt;
            buf[2] = ' ';
            buf[3] = ' ';
            for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
                char c = termo_alphabet[state->letter_idx[i]];
                // cursor pisca para mostrar onde voce esta digitando
                buf[4 + i] = (i == state->cursor && !state->blink_on) ? ' ' : c;
            }
            buf[9] = ' ';
            buf[10] = 0;
            watch_display_string(buf, 0);
            break;
        }
        case TERMO_MODE_REVEAL: {
            buf[0] = 'T';
            buf[1] = '0' + state->attempt;
            buf[2] = ' ';
            buf[3] = ' ';
            for (uint8_t i = 0; i < TERMO_WORD_LEN; i++) {
                char c = termo_alphabet[state->letter_idx[i]];
                switch (state->result[i]) {
                    case TERMO_LETTER_CORRECT: buf[4 + i] = c; break;
                    case TERMO_LETTER_PRESENT: buf[4 + i] = state->blink_on ? c : ' '; break;
                    default:                   buf[4 + i] = '-'; break;
                }
            }
            buf[9] = ' ';
            buf[10] = 0;
            watch_display_string(buf, 0);
            break;
        }
        case TERMO_MODE_WON:
            watch_display_string("T   ACERTO", 0);
            break;
        case TERMO_MODE_LOST: {
            // derrota: mostra a palavra secreta
            buf[0] = 'T';
            buf[1] = '-';
            buf[2] = ' ';
            buf[3] = ' ';
            memcpy(&buf[4], state->secret, TERMO_WORD_LEN);
            buf[9] = ' ';
            buf[10] = 0;
            watch_display_string(buf, 0);
            break;
        }
    }
}

void termo_face_setup(movement_settings_t *settings, uint8_t watch_face_index, void **context_ptr) {
    (void) settings;
    (void) watch_face_index;
    if (*context_ptr == NULL) {
        *context_ptr = malloc(sizeof(termo_face_state_t));
        memset(*context_ptr, 0, sizeof(termo_face_state_t));
    }
}

void termo_face_activate(movement_settings_t *settings, void *context) {
    (void) settings;
    termo_face_state_t *state = (termo_face_state_t *)context;
    state->mode = TERMO_MODE_TITLE;
    state->blink_on = true;
    movement_request_tick_frequency(2);
}

bool termo_face_loop(movement_event_t event, movement_settings_t *settings, void *context) {
    termo_face_state_t *state = (termo_face_state_t *)context;

    switch (event.event_type) {
        case EVENT_ACTIVATE:
            termo_draw(state);
            break;
        case EVENT_TICK:
            state->blink_on = !state->blink_on;
            termo_draw(state);
            break;
        case EVENT_LIGHT_BUTTON_UP:
            if (state->mode == TERMO_MODE_TITLE) {
                termo_new_game(state);
            } else if (state->mode == TERMO_MODE_GUESSING) {
                if (state->cursor < TERMO_WORD_LEN - 1) {
                    state->cursor++;
                } else {
                    termo_evaluate_guess(state);
                    state->mode = TERMO_MODE_REVEAL;
                }
            } else if (state->mode == TERMO_MODE_REVEAL) {
                if (termo_guess_is_correct(state)) {
                    state->mode = TERMO_MODE_WON;
                } else if (state->attempt >= TERMO_MAX_ATTEMPTS) {
                    state->mode = TERMO_MODE_LOST;
                } else {
                    state->attempt++;
                    termo_reset_guess(state);
                    state->mode = TERMO_MODE_GUESSING;
                }
            }
            termo_draw(state);
            break;
        case EVENT_ALARM_BUTTON_UP:
            if (state->mode == TERMO_MODE_GUESSING) {
                state->letter_idx[state->cursor] =
                    (state->letter_idx[state->cursor] + 1) % TERMO_ALPHABET_LEN;
            }
            termo_draw(state);
            break;
        case EVENT_ALARM_LONG_PRESS:
            termo_new_game(state);
            termo_draw(state);
            break;
        case EVENT_TIMEOUT:
            movement_move_to_face(0);
            break;
        case EVENT_LOW_ENERGY_UPDATE:
            // em modo de baixa energia nao ha jogo; mostra so o titulo
            watch_display_string("TE  TERMO ", 0);
            break;
        default:
            return movement_default_loop_handler(event, settings);
    }

    return true;
}

void termo_face_resign(movement_settings_t *settings, void *context) {
    (void) settings;
    (void) context;
}
