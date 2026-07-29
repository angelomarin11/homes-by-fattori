/**
 * Camada A — classificação determinística por categoria + palavras-chave.
 *
 * Saída por item: { regulado: 'anatel'|'inmetro'|'ambos'|'nao'|'incerto',
 *                   certeza: 'alta'|'media'|null, motivo }
 *
 * Postura conservadora: só marcamos certeza 'alta' quando categoria E título
 * apontam na mesma direção. Divergências viram 'incerto' (vai para a Camada B
 * ou fica 🟡). Falso positivo é o maior risco do produto.
 */

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Palavras no TÍTULO que indicam produto de RF/telecom (ANATEL) — sinal forte.
const ANATEL_TITLE = [
  'bluetooth', 'wireless', 'wi-fi', 'wifi', 'sem fio', 'tws', '5g', '4g', '3g', 'lte',
  'smartwatch', 'smart watch', 'relogio inteligente',
  'drone',
  'roteador', 'repetidor', 'access point', 'mesh',
  'walkie', 'radio comunicador', 'radiocomunicador', 'ht uhf', 'ht vhf',
  'chip ', 'modem', 'mini modem',
  'rastreador', 'localizador gps', 'tracker', 'airtag',
  'controle remoto rf', 'rf 433', '433mhz', '2.4ghz', '2,4ghz',
  'zigbee', 'lora', 'rfid', 'transmissor', 'receptor fm', 'radio fm',
  'lampada inteligente', 'tomada inteligente', 'interruptor inteligente', 'smart plug',
  'camera ip', 'camera wifi', 'baba eletronica',
  'fone de ouvido sem fio', 'headset sem fio', 'earbud',
];

// Nomes de aparelho que aparecem em QUALQUER acessório ("capa para iphone",
// "suporte para celular") — sinal fraco: nunca decide sozinho nem bypassa
// a detecção de acessório passivo.
const ANATEL_TITLE_WEAK = ['celular', 'smartphone', 'telefone', 'iphone', 'galaxy', 'xiaomi', 'redmi'];

// Palavras no título que indicam INMETRO — decidem sozinhas (certeza média).
const INMETRO_TITLE_STRONG = [
  'carregador', 'fonte usb', 'fonte de alimentacao', 'fonte chaveada',
  'power bank', 'bateria portatil',
  'brinquedo', 'boneca', 'boneco', 'pelucia',
  'panela eletrica', 'panela de pressao', 'air fryer', 'airfryer', 'fritadeira',
  'mamadeira', 'chupeta', 'andador infantil', 'cadeirinha infantil', 'bebe conforto',
  'isqueiro',
];
const INMETRO_TITLE_WEAK = ['pilha', 'bateria ', 'infantil', 'bebe '];

// Termos em NOMES DE CATEGORIA do ML que indicam alto risco ANATEL.
const ANATEL_CATEGORY = [
  'celulares e smartphones', 'fones de ouvido', 'smartwatches', 'relogios inteligentes',
  'redes e wi-fi', 'roteadores', 'repetidores', 'drones', 'radiocomunicacao',
  'walkie talkies', 'caixas de som', 'gps', 'rastreadores',
  'telefonia fixa', 'modems', 'cameras de seguranca',
  'automacao residencial', 'casa inteligente', 'teclados e mouses',
];

// Termos em nomes de categoria que indicam INMETRO.
const INMETRO_CATEGORY = [
  'brinquedos', 'bonecas', 'carregadores', 'fontes de alimentacao', 'pilhas e carregadores',
  'panelas eletricas', 'fritadeiras', 'eletroportateis', 'artigos para bebes',
  'alimentacao de bebes', 'seguranca de bebes',
];

// Caminhos de categoria que são de ACESSÓRIOS — evidência ANATEL de categoria
// não vale nesses casos (capa/película/cabo herdam a árvore "Celulares…").
const ACCESSORY_CATEGORY = [
  'acessorios para celulares', 'acessorios para audio', 'capas', 'peliculas',
  'cabos e adaptadores', 'suportes', 'pecas para celular',
];

// Termos no título que indicam acessório passivo (não regulado por si só).
const NEGATORS = [
  'capa', 'capinha', 'pelicula', 'case ', 'suporte', 'adesivo', 'skin ',
  'cabo ', 'pulseira', 'bracelete', 'protetor de tela',
  'bolsa', 'estojo', 'organizador', 'kit limpeza', 'caneca', 'camiseta',
  'com fio', // "fone com fio" não é RF
];

function hits(text, list) {
  const t = ` ${norm(text)} `;
  return list.filter((k) => t.includes(norm(k)));
}

/**
 * @param {object} item  { title, ... }
 * @param {string[]} categoryPath  nomes das categorias (raiz → folha)
 */
export function classifyByRules(item, categoryPath = []) {
  const title = item.title ?? '';
  const catText = categoryPath.join(' > ');

  const negators = hits(title, NEGATORS);
  const anatelStrong = hits(title, ANATEL_TITLE);
  const anatelWeak = hits(title, ANATEL_TITLE_WEAK);
  const inmetroStrong = hits(title, INMETRO_TITLE_STRONG);
  const inmetroWeak = hits(title, INMETRO_TITLE_WEAK);
  const isAccessoryCat = hits(catText, ACCESSORY_CATEGORY).length > 0;
  const anatelC = isAccessoryCat ? [] : hits(catText, ANATEL_CATEGORY);
  const inmetroC = hits(catText, INMETRO_CATEGORY);

  // Acessório passivo: negator presente e nenhum sinal FORTE de produto ativo.
  if (negators.length && !anatelStrong.length && !inmetroStrong.length) {
    if (anatelC.length || inmetroC.length) {
      return {
        regulado: 'incerto',
        certeza: null,
        motivo: `possível acessório passivo ("${negators[0].trim()}") em categoria regulada — confirmar`,
      };
    }
    return { regulado: 'nao', certeza: 'alta', motivo: 'acessório passivo, sem indício de RF/certificação' };
  }

  const anatelScore = (anatelStrong.length ? 1 : 0) + (anatelC.length ? 1 : 0);
  const inmetroScore = (inmetroStrong.length ? 1 : 0) + (inmetroC.length ? 1 : 0);

  if (anatelScore === 2 && inmetroScore === 2) {
    return { regulado: 'ambos', certeza: 'alta', motivo: `título e categoria indicam RF (${anatelStrong[0]}) e certificação INMETRO (${inmetroStrong[0]})` };
  }
  if (anatelScore === 2) {
    return { regulado: 'anatel', certeza: 'alta', motivo: `título ("${anatelStrong[0]}") e categoria ("${anatelC[0]}") indicam RF` };
  }
  if (inmetroScore === 2) {
    return { regulado: 'inmetro', certeza: 'alta', motivo: `título ("${inmetroStrong[0]}") e categoria ("${inmetroC[0]}") indicam certificação compulsória` };
  }

  // INMETRO forte no título decide sozinho (ex.: "Carregador Turbo USB-C"),
  // desde que não haja sinal forte concorrente de RF.
  if (inmetroStrong.length && !anatelStrong.length) {
    return { regulado: 'inmetro', certeza: 'media', motivo: `título indica produto INMETRO ("${inmetroStrong[0]}")` };
  }

  // Aparelho ANATEL identificado por palavra fraca + categoria de aparelho
  // (ex.: "Celular Samsung A15" em "Celulares e Smartphones").
  if (anatelWeak.length && anatelC.length) {
    return { regulado: 'anatel', certeza: 'alta', motivo: `categoria de aparelho ("${anatelC[0]}") confirma título ("${anatelWeak[0]}")` };
  }

  if (anatelScore === 1 || inmetroScore === 1 || anatelWeak.length || inmetroWeak.length) {
    const src = anatelStrong[0] ?? anatelC[0] ?? inmetroC[0] ?? anatelWeak[0] ?? inmetroWeak[0];
    const which = anatelScore || anatelWeak.length ? 'ANATEL' : 'INMETRO';
    return { regulado: 'incerto', certeza: null, motivo: `sinal parcial de ${which} ("${src}") — precisa confirmação` };
  }
  return { regulado: 'nao', certeza: 'alta', motivo: 'sem indício de produto regulado' };
}
