document.addEventListener("DOMContentLoaded", () => {
  const thoughtInput = document.getElementById("thoughtInput");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const emotionResult = document.getElementById("emotionResult");
  const thoughtList = document.getElementById("thoughtList");
  const chartCanvas = document.getElementById("emotionChart");
  const colorLegend = document.getElementById("colorLegend");
  const recomendacionBox = document.getElementById("recommendation");
  const recSection = document.getElementById("recSection");
  const recList = document.getElementById("recList");

  /* ==================== Normalización ==================== */
  function normalizeBase(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[()“”"’'[\]{}]/g, " ")
      .replace(/[.,;:!?¿¡]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeLatAm(s) {
    let t = " " + s + " ";
    t = t.replace(/\b(k|q)\b/g, " que ");
    t = t.replace(/\bxq\b|\bpxq\b|\bpq\b/g, " porque ");
    t = t.replace(/\btqm\b/g, " te quiero mucho ");
    t = t.replace(/\bbn\b/g, " bien ");
    t = t.replace(/\bni\s+tantito\b/g, " ni ");
    return t.trim();
  }

  const normalize = (s) => normalizeBase(normalizeLatAm(s));

  /* ==================== Léxico MUY ampliado ==================== */
  const lex = {
    alegria: [
      "feliz","felicidad","content","contento","contenta",
      "alegr","alegre","alegres","gozo","gozoso","gozosa",
      "sonrisa","sonriente","sonriend","divertid","diversion","diversiones",
      "entusias","entusiasmado","entusiasmada",
      "genial","maravill","maravilla","increibl","fantastic","fantastico","fantastica",
      "positivo","positiva","optimista","optimismo",
      "esperanz","esperanza","animad","animado","animada",
      "motivad","motivado","motivada","emocionad","emocionado","emocionada",
      "agradecid","agradecido","agradecida",
      "orgull","orgulloso","orgullosa",
      "satisfech","satisfecho","satisfecha",
      "tranquil","tranquilo","tranquila","relajad","relajado","relajada",
      "bien","muy bien","super bien","re bien",
      "a gusto","a gusto con todo",
      "chido","chida","padre","cool","nice",
      "que buena onda","buena vibra","buenas vibras","que chido","que padre"
    ],

    tristeza: [
      "triste","tristeza","triston","tristona",
      "solo","sola","soledad","sentirme solo","sentirme sola",
      "llor","llorando","llanto","ganas de llorar",
      "deprim","depresion","depre",
      "melancol","melancolia",
      "vacio","vacío","vaciamiento","hueco por dentro",
      "nostalg","nostalgia","extrañ","extrano","extrana",
      "desanimad","desanimado","desanimada","sin animo","sin ánimo",
      "aguite","aguitad","aguitado","aguitada",
      "bajonead","bajoneado","bajoneada",
      "desesperanz","desesperanza","derrotad","derrotado","derrotada",
      "infeliz","desconsolad","desconsolado","desconsolada",
      "abatid","abatido","abatida",
      "sin ganas","sin ganas de nada",
      "cansado de todo","cansada de todo",
      "me siento mal","me siento muy mal","me siento fatal",
      "no tengo ganas de nada","nada me anima","nada me motiva"
    ],

    enojo: [
      "enoj","enojo","enojado","enojada",
      "molest","molesto","molesta",
      "furios","furioso","furiosa",
      "rabia","coraje","irrit","irritado","irritada",
      "fastidi","fastidio","harto","harta","ya me harte","ya me harté",
      "odio","odiar","lo odio","la odio","los odio",
      "frustracion","frustrado","frustrada",
      "resentim","resentido","resentida",
      "desquite","desquitarme","explote","explote","explotar",
      "estallo","estalle","estallé",
      "mal genio","mal humor","gruñon","gruñona",
      "me vale","me vale todo","me vale madre","me vale madres",
      "que coraje","que rabia","que enojo",
      "me saca de quicio","me desespera","desesperado","desesperada"
    ],

    miedo: [
      "miedo","temor","temores",
      "panic","panico","pánico",
      "asust","asustado","asustada",
      "susto","espanto","espantad","espantado","espantada",
      "pavor","horror","terror",
      "nervios","nervioso","nerviosa",
      "paniquead","paniqueado","paniqueada",
      "me da miedo","me da cosa","me espanta",
      "me preocupa mucho","me aterra","me asusta",
      "temer","temiendo","temblando","tembloroso","temblorosa"
    ],

    amor: [
      "amor","amar","amo","amas","amamos",
      "aprec","aprecio","apreciar",
      "carin","carino","cariño","cariñoso","cariñosa",
      "te quiero","te quiero mucho","te amo","lo amo","la amo",
      "me encanta","me fascina","me gusta mucho","me super encanta",
      "enamora","enamorado","enamorada","enamoradisimo","enamoradisima",
      "ador","adoro","adorable",
      "afecto","apego","cercania","cercanía",
      "detalle bonito","detalle lindo","detalle hermoso",
      "me hace feliz","me hace sentir bien",
      "me importa mucho","me importas muchisimo","me importas muchísimo",
      "lo quiero","la quiero","los quiero","las quiero"
    ],

    sorpresa: [
      "sorprend","sorpresa","sorprendido","sorprendida",
      "impresion","impresionad","impresionado","impresionada",
      "inesperad","inesperado","inesperada",
      "no me lo esperaba","no lo esperaba",
      "wow","orale","órale","no inventes","no manches",
      "asomb","asombro","asombrado","asombrada",
      "impacto","impactante","impresionante",
      "de golpe","de repente","de pronto",
      "que raro","qué raro","algo raro paso","algo raro pasó",
      "me dejo en shock","me dejó en shock","me saco de onda","me sacó de onda"
    ],

    aburrimiento: [
      "aburr","aburrido","aburrida","aburridisimo","aburridísima",
      "tedio","tedioso","tediosa",
      "monoton","monotono","monotona","monotonia","monotonía",
      "rutina","siempre lo mismo",
      "pereza","perezoso","perezosa",
      "flojera","hueva","huevon","huevona",
      "desgan","desganado","desganada",
      "apatic","apatia","apatico","apatica",
      "no tengo ganas","no tengo ganas de hacer nada",
      "sin ganas","nada que hacer","no hay nada que hacer",
      "me da igual","no me interesa","todo me da igual",
      "me da flojera","me da muchisima flojera",
      "no hay nada interesante","todo se siente plano","todo se siente vacio"
    ],

    ansiedad: [
      "ansiedad","ansioso","ansiosa","ansios","ansiosa",
      "estres","estresado","estresada",
      "angust","angustia","angustiado","angustiada",
      "tension","tenso","tensa",
      "inquiet","inquieto","inquieta",
      "duda","dudas","dudando",
      "insegur","inseguridad","inseguro","insegura",
      "indecis","indeciso","indecisa",
      "preocup","preocupacion","preocupado","preocupada",
      "nervios","nervioso","nerviosa",
      "sobrepens","sobrepensando","sobrepensar",
      "no se que hacer","no sé qué hacer",
      "no se que va a pasar","no sé qué va a pasar",
      "me preocupa","me preocupa mucho",
      "me siento muy tenso","me siento muy tensa",
      "estresadisimo","estresadísimo","estresadisima","estresadísima",
      "presion","presión","siento presion","siento presión",
      "no puedo relajarme","no puedo dormir","no logro descansar"
    ]
  };

  const exceptions = {
    amo: ["amortiguar","amortiguo","amortiguada","amortiguado","amortiguamiento"]
  };

  const patterns = [
    { phrase: "me siento feliz", em: "alegria", w: 1.2 },
    { phrase: "me siento triste", em: "tristeza", w: 1.3 },
    { phrase: "me siento ansioso", em: "ansiedad", w: 1.3 },
    { phrase: "me siento ansiosa", em: "ansiedad", w: 1.3 },
    { phrase: "me siento enojado", em: "enojo", w: 1.3 },
    { phrase: "me siento enojada", em: "enojo", w: 1.3 },
    { phrase: "me siento solo", em: "tristeza", w: 1.2 },
    { phrase: "me siento sola", em: "tristeza", w: 1.2 },
    { phrase: "me siento tranquilo", em: "alegria", w: 0.9 },
    { phrase: "me siento tranquila", em: "alegria", w: 0.9 },

    { phrase: "tengo miedo", em: "miedo", w: 1.4 },
    { phrase: "tengo ansiedad", em: "ansiedad", w: 1.3 },
    { phrase: "tengo coraje", em: "enojo", w: 1.3 },
    { phrase: "tengo preocup", em: "ansiedad", w: 1.2 },

    { phrase: "me da flojera", em: "aburrimiento", w: 1.3 },
    { phrase: "me da pereza", em: "aburrimiento", w: 1.2 },
    { phrase: "me da miedo", em: "miedo", w: 1.2 },
    { phrase: "no tengo ganas de", em: "aburrimiento", w: 1.3 },

    { phrase: "ganas de llorar", em: "tristeza", w: 1.4 },
    { phrase: "tuve una discus", em: "enojo", w: 1.2 },
    { phrase: "siento frustracion", em: "enojo", w: 1.2 },
    { phrase: "lo amo", em: "amor", w: 1.4 },
    { phrase: "te amo", em: "amor", w: 1.4 },
    { phrase: "me encanta", em: "amor", w: 1.1 }
  ];

  const negators = new Set(["no","ni","sin","apenas"]);
  const intensifiers = new Set(["muy","demasiado","super","re","mega","bastante","tan","muchisimo","muchísimo"]);
  const attenuators = new Set(["poco","poquito","algo","medianamente","ligero","apenas","un","un poco"]);

  const SUFIJOS = ["","s","es","o","a","os","as","mente","ar","ando","ado","e","é","aste","aba","ado","ido","ando","iendo"];

  function matchesRoot(token, root, sent = "") {
    if (exceptions[root]?.includes(token)) return false;
    if (root === "bien" && !sent.includes("me siento bien")) return false;
    if (root === "tranquil" && !sent.includes("me siento tranquil")) return false;

    if (token === root) return true;

    for (const suf of SUFIJOS) {
      if (token === root + suf) return true;
    }
    if (token.startsWith(root) && token.length - root.length <= 6) return true;

    return false;
  }

  function emphasisBoost(raw) {
    let b = 0;
    if (/[A-ZÁÉÍÓÚÜÑ]{5,}/.test(raw)) b += 0.2;
    if (/!{2,}/.test(raw)) b += 0.2;
    if (/(.)\1{2,}/.test(normalizeBase(raw))) b += 0.2;
    return b;
  }

  /* ==================== Analizador ==================== */
  function analizarEmocion(textoOriginal) {
    const raw = textoOriginal || "";
    const text = normalize(raw);
    if (!text) return "No se detectaron emociones claras en el texto.";

    const sentences = text
      .split(/(?<=[\.\?\!])\s+|(?:\s+y\s+|\s+pero\s+|\s+aunque\s+|\s+sin\s+embargo\s+|\s+ademas\s+)/)
      .map(s => s.trim())
      .filter(Boolean);

    const score = {
      alegria: 0, tristeza: 0, enojo: 0, miedo: 0,
      amor: 0, sorpresa: 0, aburrimiento: 0, ansiedad: 0
    };

    const boost = emphasisBoost(raw);

    for (const sent of sentences) {
      const tokens = sent.split(/\s+/).filter(Boolean);

      for (const p of patterns) {
        if (sent.includes(p.phrase)) score[p.em] += p.w;
      }

      for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        const prev = tokens.slice(Math.max(i - 2, 0), i);

        const hasNeg = prev.some(t => negators.has(t));
        const hasInt = prev.some(t => intensifiers.has(t));
        const hasAtt = prev.some(t => attenuators.has(t));

        for (const em in lex) {
          for (const root of lex[em]) {
            if (root.includes(" ")) {
              if (sent.includes(root)) {
                let w = 1 + boost;
                if (["tristeza","ansiedad","enojo"].includes(em)) w += 0.2;
                if (hasNeg) w = 0;
                if (w > 0) score[em] += w;
              }
              continue;
            }

            if (!matchesRoot(tk, root, sent)) continue;

            let w = 1;
            if (root === "tranquil") w = 0.5;
            if (root === "bien") w = 0.6;
            if (["tristeza","ansiedad","enojo"].includes(em)) w += 0.2;

            if (hasNeg) w = 0;
            if (hasInt) w += 0.4;
            if (hasAtt) w -= 0.3;

            w += boost;
            if (w > 0) score[em] += w;

            break;
          }
        }
      }
    }

    // Polaridad extra (Sentiment)
    try {
      const sentiment = new Sentiment();
      const pol = sentiment.analyze(raw).score;
      if (pol > 0) score.alegria += 0.6;
      else if (pol < 0) score.tristeza += 0.6;
    } catch (_) {}

    const entries = Object.entries(score);
    const maxVal = Math.max(...entries.map(e => e[1]));
    const TH = 0.7;
    const REL = 0.5;

    if (maxVal < TH) return "No se detectaron emociones claras en el texto.";

    const picked = entries
      .filter(([, v]) => v >= TH || v >= maxVal * REL || v >= 0.9)
      .map(e => e[0]);

    return "Emociones detectadas: " + picked.join(", ");
  }

  /* ==================== Guardado / historial ==================== */
  function guardarPensamiento() {
    const texto = thoughtInput.value.trim();
    if (!texto) {
      alert("Por favor, escribe algo antes de guardar.");
      return;
    }

    const resultado = analizarEmocion(texto);
    emotionResult.textContent = resultado;

    const pensamiento = {
      texto,
      resultado,
      fecha: new Date().toLocaleString()
    };

    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    pensamientos.push(pensamiento);
    localStorage.setItem("pensamientos", JSON.stringify(pensamientos));

    mostrarPensamientos();
    actualizarGrafica();

    // limpiar textarea al guardar
    thoughtInput.value = "";
  }

  function mostrarPensamientos() {
    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    thoughtList.innerHTML = "";

    pensamientos.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${p.fecha}</strong><br>${p.texto}<br><em>${p.resultado}</em>`;
      thoughtList.prepend(li);
    });
  }

  /* ==================== Gráfica + leyenda ==================== */
  let emotionChart;
  const BAR_LABELS = ["Alegría","Tristeza","Enojo","Miedo","Amor","Sorpresa","Aburrimiento","Ansiedad"];
  const BAR_KEYS   = ["alegria","tristeza","enojo","miedo","amor","sorpresa","aburrimiento","ansiedad"];
  const BAR_COLORS = ["#FFD93D","#6BCB77","#FF6B6B","#4D96FF","#FFB5E8","#C9BBCF","#A0AEC0","#90CDF4"];

  function renderColorLegend() {
    colorLegend.innerHTML = "";
    BAR_LABELS.forEach((lbl, i) => {
      const item = document.createElement("span");
      item.className = "legend-item";
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = BAR_COLORS[i];
      const txt = document.createElement("span");
      txt.textContent = lbl;
      item.appendChild(dot);
      item.appendChild(txt);
      colorLegend.appendChild(item);
    });
  }

  if (chartCanvas) {
    const ctx = chartCanvas.getContext("2d");
    emotionChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: BAR_LABELS,
        datasets: [{
          label: "Emociones detectadas",
          data: Array(BAR_LABELS.length).fill(0),
          backgroundColor: BAR_COLORS,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { ticks: { display: false } }
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
      }
    });
    renderColorLegend();
  }

  /* ==================== Mensajes del cuadro verde ==================== */
  const BASE_MESSAGES = {
    alegria: "Se nota un estado de alegría y energía positiva.",
    tristeza: "Se observa una sensación de tristeza.",
    enojo: "Se percibe enojo o molestia.",
    miedo: "Se nota cierto temor o inseguridad.",
    amor: "Se percibe un sentimiento de afecto.",
    sorpresa: "Se observa una reacción inesperada o sorprendente.",
    aburrimiento: "Hay señales de desánimo o falta de interés.",
    ansiedad: "Se nota preocupación o tensión interna."
  };

  // claves ordenadas alfabéticamente: aburrimiento, alegria, amor, ansiedad, enojo, miedo, sorpresa, tristeza
  const COMBINED_MESSAGES = {
    "ansiedad-tristeza": "Parece que estás sintiendo tristeza acompañada de preocupación.",
    "miedo-tristeza": "Se nota una mezcla de tristeza con cierto temor.",
    "enojo-tristeza": "Hay una combinación fuerte entre tristeza y enojo.",
    "aburrimiento-tristeza": "Se percibe un estado apagado entre tristeza y desánimo.",

    "ansiedad-enojo": "Se siente tensión emocional entre enojo y preocupación.",
    "enojo-miedo": "Hay frustración mezclada con un poco de miedo.",
    "aburrimiento-enojo": "Parece haber irritación combinada con falta de interés.",

    "ansiedad-miedo": "Se nota una mezcla intensa entre ansiedad y temor.",
    "aburrimiento-ansiedad": "Hay inquietud emocional junto con falta de motivación.",

    "aburrimiento-miedo": "Se percibe temor acompañado de desgano.",

    "alegria-ansiedad": "Hay una mezcla curiosa de entusiasmo con algo de inquietud.",
    "alegria-tristeza": "Se notan emociones encontradas entre alegría y tristeza.",
    "alegria-miedo": "Hay alegría presente, pero acompañada de cierto temor.",
    "alegria-enojo": "Se percibe energía elevada entre alegría y molestia.",
    "aburrimiento-alegria": "Hay un contraste emocional entre motivación y desgano.",

    "amor-ansiedad": "Se siente cariño mezclado con un poco de preocupación.",
    "amor-tristeza": "Hay afecto presente, pero acompañado de cierta tristeza.",
    "amor-miedo": "Se nota cariño acompañado de temor o inseguridad.",
    "amor-enojo": "Hay afecto, aunque mezclado con molestia.",
    "aburrimiento-amor": "Se percibe cariño junto con un estado de desánimo.",

    "alegria-amor": "Hay una combinación cálida de alegría y afecto.",
    "alegria-sorpresa": "Se siente una mezcla emocionante entre sorpresa y felicidad.",
    "amor-sorpresa": "Hay una sorpresa acompañada de un sentimiento de cariño.",

    "miedo-sorpresa": "Se percibe una sorpresa acompañada de temor.",
    "ansiedad-sorpresa": "Hay sorpresa mezclada con inquietud.",
    "sorpresa-tristeza": "Se nota sorpresa con un toque de tristeza.",
    "enojo-sorpresa": "Hay una reacción entre molestia y sorpresa."
  };

  function comboKey(a, b) {
    return [a, b].sort().join("-");
  }

  /* ==================== Recomendaciones específicas (lista) ==================== */
  const RECS = {
    tristeza: [
      "Camina 10–15 min al aire libre.",
      "Escribe 5 frases sobre lo que sientes (journaling).",
      "Llama o manda mensaje a alguien de confianza.",
      "Haz una lista de gratitud con 3 cosas de hoy.",
      "Escucha música calmada 10 min con respiración ligera."
    ],
    aburrimiento: {
      actividades: [
        "Dibujo de una sola línea",
        "Crea una playlist temática nueva",
        "Fotografía: 10 fotos con un mismo color",
        "Cocina una receta que no hayas probado",
        "Arma un rompecabezas pequeño o cubo Rubik",
        "Aprende un truco con cartas",
        "Explora un museo virtual",
        "Escribe 10 ideas locas para un proyecto",
        "Jardinería en maceta",
        "Juegos de mesa rápidos con familia/amigos"
      ],
      deportes: [
        "Ciclismo","Natación","Fútbol","Básquetbol","Voleibol",
        "Senderismo","Patinaje/Skate","Yoga","Pilates",
        "Artes marciales","Box recreativo","Baile"
      ]
    },
    ansiedad: [
      "Respiración 4–7–8 durante 3 minutos.",
      "Anota tus preocupaciones y 1 acción pequeña.",
      "Relajación muscular progresiva 5–7 min.",
      "Camina 15 min con música tranquila.",
      "Evita cafeína/pantalla 1 h antes de dormir."
    ],
    enojo: [
      "Respiración en caja 4-4-4-4 por 2–3 min.",
      "Escribe qué te molestó y qué sí controlas.",
      "Saltos/sentadillas 5–10 min para descargar.",
      "Pausa sensorial: agua fría en manos/cara.",
      "Camina 10–15 min para bajar activación."
    ],
    miedo: [
      "Respiración 4–4–4–4 (caja) por 3 minutos para estabilizar.",
      "Divide tu preocupación en 3 pasos pequeños y haz el primero hoy.",
      "Ensayo mental: visualiza durante 2–3 min un resultado aceptable.",
      "Escribe 3 evidencias a favor y 3 en contra de tu miedo.",
      "Camina 10–15 min al aire libre mientras repites una frase de calma."
    ]
  };

  function renderRecommendations(dominantEmotion) {
    const showable = ["tristeza","aburrimiento","ansiedad","enojo","miedo"];

    [...recSection.querySelectorAll("p, ul:not(#recList)")].forEach(n => n.remove());
    recList.innerHTML = "";

    if (!showable.includes(dominantEmotion)) {
      recSection.hidden = true;
      return;
    }

    if (dominantEmotion === "aburrimiento") {
      RECS.aburrimiento.actividades.slice(0, 5).forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        recList.appendChild(li);
      });

      const p = document.createElement("p");
      p.innerHTML = "<strong>Te recomendamos realizar alguno de los siguientes deportes:</strong>";
      recSection.appendChild(p);

      const ul = document.createElement("ul");
      RECS.aburrimiento.deportes.slice(0, 6).forEach(d => {
        const li = document.createElement("li");
        li.textContent = d;
        ul.appendChild(li);
      });
      recSection.appendChild(ul);

      recSection.hidden = false;
      return;
    }

    const ideas = RECS[dominantEmotion] || [];
    recList.innerHTML = ideas.slice(0, 5).map(t => `<li>${t}</li>`).join("");
    recSection.hidden = ideas.length === 0;
  }

  /* ==================== Actualizar gráfica + cuadro verde ==================== */
  function actualizarGrafica() {
    if (!emotionChart) return;

    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    const conteos = {
      alegria:0, tristeza:0, enojo:0, miedo:0,
      amor:0, sorpresa:0, aburrimiento:0, ansiedad:0
    };

    const strip = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

    pensamientos.forEach(p => {
      const r = strip(p.resultado || "");
      for (const k in conteos) {
        if (r.includes(k)) conteos[k]++;
      }
    });

    emotionChart.data.datasets[0].data = BAR_KEYS.map(k => conteos[k]);
    emotionChart.update();

    const total = Object.values(conteos).reduce((a,b)=>a+b,0);

    [...recSection.querySelectorAll("p, ul:not(#recList)")].forEach(n => n.remove());

    if (total === 0) {
      recomendacionBox.textContent = "Aún no hay suficientes datos para dar una recomendación.";
      recSection.hidden = true;
      recList.innerHTML = "";
      return;
    }

    const ordered = Object.entries(conteos).sort((a,b)=>b[1]-a[1]);
    const [e1, v1] = ordered[0];
    const [e2, v2] = ordered[1] || [null, 0];

    const TWO_THRESHOLD = 0.6;
    const secondHigh = v2 > 0 && v2 >= v1 * TWO_THRESHOLD;

    let msg;
    if (secondHigh && e2) {
      const key = comboKey(e1, e2);
      msg = COMBINED_MESSAGES[key] || BASE_MESSAGES[e1];
    } else {
      msg = BASE_MESSAGES[e1];
    }

    recomendacionBox.textContent = msg;
    renderRecommendations(e1);
  }

  /* ==================== Eventos ==================== */
  saveBtn.addEventListener("click", guardarPensamiento);

  // Guardar con Enter (Enter = guardar, Shift+Enter = nuevo renglón)
  thoughtInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      guardarPensamiento();
    }
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("¿Seguro que quieres borrar todo el historial de pensamientos?")) {
      localStorage.removeItem("pensamientos");
      thoughtList.innerHTML = "";
      emotionResult.textContent = "";
      actualizarGrafica();
    }
  });

  /* ==================== Inicialización ==================== */
  mostrarPensamientos();
  actualizarGrafica();
});
