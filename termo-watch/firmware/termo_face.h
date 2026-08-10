/*
 * termo_face — jogo estilo Termo (Wordle PT-BR) para o Sensor Watch.
 *
 * Placa: Sensor Watch (Microchip SAM L22) em caixa de Casio F-91W/A158W.
 * Firmware: Movement (https://github.com/joeycastillo/Sensor-Watch)
 *
 * Instalação: copie termo_face.c/.h para movement/watch_faces/complication/,
 * inclua "termo_face.h" em movement_faces.h e adicione termo_face à lista
 * watch_faces[] em movement_config.h.
 */

#ifndef TERMO_FACE_H_
#define TERMO_FACE_H_

#include "movement.h"

#define TERMO_WORD_LEN 5
#define TERMO_MAX_ATTEMPTS 6

typedef enum {
    TERMO_MODE_TITLE,
    TERMO_MODE_GUESSING,
    TERMO_MODE_REVEAL,
    TERMO_MODE_WON,
    TERMO_MODE_LOST,
} termo_mode_t;

typedef enum {
    TERMO_LETTER_ABSENT,   // letra nao existe na palavra ("cinza")
    TERMO_LETTER_PRESENT,  // existe em outra posicao ("amarelo", pisca)
    TERMO_LETTER_CORRECT,  // posicao certa ("verde", fixa)
} termo_letter_result_t;

typedef struct {
    termo_mode_t mode;
    char secret[TERMO_WORD_LEN + 1];
    uint8_t letter_idx[TERMO_WORD_LEN];  // indice no alfabeto, por posicao
    uint8_t cursor;
    uint8_t attempt;
    termo_letter_result_t result[TERMO_WORD_LEN];
    bool blink_on;
} termo_face_state_t;

void termo_face_setup(movement_settings_t *settings, uint8_t watch_face_index, void **context_ptr);
void termo_face_activate(movement_settings_t *settings, void *context);
bool termo_face_loop(movement_event_t event, movement_settings_t *settings, void *context);
void termo_face_resign(movement_settings_t *settings, void *context);

#define termo_face ((const watch_face_t){ \
    termo_face_setup, \
    termo_face_activate, \
    termo_face_loop, \
    termo_face_resign, \
    NULL, \
})

#endif // TERMO_FACE_H_
