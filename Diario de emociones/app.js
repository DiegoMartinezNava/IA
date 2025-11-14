document.addEventListener("DOMContentLoaded", () => {
  const thoughtInput = document.getElementById("thoughtInput");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const emotionResult = document.getElementById("emotionResult");
  const thoughtList = document.getElementById("thoughtList");
  const chartCanvas = document.getElementById("emotionChart");
  const colorLegend = document.getElementById("colorLegend");

  /* ==================== Utilidades de normalización ==================== */
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
  const tokenize = (s) => normalize(s).split(" ").filter(Boolean);

  /* ==================== Léxico (raíces como strings) ==================== */
  const lex = {
    alegria: [
      "feliz","content","alegr","sonrisa","divertid","entusias","genial","maravill",
      "increibl","positivo","gracias","emocionad","tranquil","bien"
    ],
    tristeza: [
      "triste","solo","sola","llor","deprim","melancol","vacio","nostalg","desanimad","aguite","bajonead"
    ],
    enojo: [
      "enoj","molest","furios","rabia","irrit","fastidi","odio","coraje","harto","harta",
      "frustracion","frustrad","discus"
    ],
    miedo: ["miedo","temor","panico"],
    amor: ["amor","amo","amar","aprec","carin","me encanta","enamora","querer","te quiero mucho","te amo","lo amo"],
    sorpresa: ["sorprend","impresion","inesperad","wow","asomb","de golpe","de repente","no me lo esperaba"],
    aburrimiento: ["aburr","tedio","monoton","pereza","flojera","hueva","desgan","rutina","meh","apatia","apatico","no tengo ganas"],
    ansiedad: ["ansiedad","ansios","estres","angust","tension","inquiet","duda","insegur","indecis","preocup","no se"]
  };

  /* Excepciones para raíces ambiguas */
  const exceptions = {
    amo: ["amortiguar","amortiguo","amortiguada","amortiguado","amortiguamiento"]
  };

  /* Plantillas (n-gramas) estilo original */
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

  /* Negación y modificadores */
  const negators = new Set(["no","ni","sin","apenas"]);
  const intensifiers = new Set(["muy","demasiado","super","re","mega","bastante","tan","muchisimo","muchísimo"]);
  const attenuators = new Set(["poco","poquito","algo","medianamente","ligero","apenas","un","un poco"]);

  function isBienAllowed(sentence) {
    return sentence.includes("me siento bien");
  }
  function isTranquiloAllowed(sentence) {
    return sentence.includes("me siento tranquilo") || sentence.includes("me siento tranquila");
  }

  function emphasisBoost(raw) {
    let boost = 0;
    if (/[A-ZÁÉÍÓÚÜÑ]{5,}/.test(raw)) boost += 0.2;
    if (/!{2,}/.test(raw)) boost += 0.2;
    if (/(.)\1{2,}/.test(normalizeBase(raw))) boost += 0.2;
    return boost;
  }

  const SUFIJOS = ["","s","es","o","a","os","as","mente","ar","ando","ado","e","é","aste","aba","ado","ido","ando","iendo"];
  function isException(root, token) {
    const list = exceptions[root] || [];
    return list.includes(token);
  }
  function matchesRoot(token, root, sent = "") {
    if (isException(root, token)) return false;
    if (root === "bien" && !isBienAllowed(sent)) return false;
    if (root === "tranquil" && !isTranquiloAllowed(sent)) return false;

    if (token === root) return true;
    for (const suf of SUFIJOS) {
      if (suf && token === root + suf) return true;
    }
    if (token.startsWith(root) && token.length - root.length <= 6) return true;
    return false;
  }

  /* ==================== Analizador principal ==================== */
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

    const globalBoost = emphasisBoost(textoOriginal);

    for (const sent of sentences) {
      const tokens = sent.split(/\s+/).filter(Boolean);

      for (const p of patterns) {
        if (sent.includes(p.phrase)) score[p.em] += p.w;
      }

      for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        const windowStart = Math.max(0, i - 2);
        const ctx = tokens.slice(windowStart, i);

        const hasNeg = ctx.some(t => negators.has(t));
        const hasInt = ctx.some(t => intensifiers.has(t));
        const hasAtt = ctx.some(t => attenuators.has(t) || (t === "un" && tokens[i-1] === "poco"));

        for (const em in lex) {
          for (const root of lex[em]) {
            if (root.includes(" ")) {
              if (sent.includes(root)) {
                let w = 1.0;
                if (["tristeza","ansiedad","enojo"].includes(em)) w += 0.2;
                w += globalBoost;
                score[em] += w;
              }
              continue;
            }

            if (!matchesRoot(tk, root, sent)) continue;

            let w = 1.0;
            if (root === "tranquil") w = 0.5;
            if (root === "bien") w = 0.6;

            if (hasNeg) w = 0;
            if (hasInt) w += 0.4;
            if (hasAtt) w -= 0.3;

            if (["tristeza","ansiedad","enojo"].includes(em)) w += 0.2;
            w += globalBoost;

            if (w > 0) score[em] += w;
            break;
          }
        }
      }
    }

    if (typeof Sentiment !== "undefined") {
      try {
        const sentiment = new Sentiment();
        const analisis = sentiment.analyze(textoOriginal);
        if (analisis.score > 0) score.alegria += 0.6;
        else if (analisis.score < 0) score.tristeza += 0.6;
      } catch (_) {}
    }

    const entries = Object.entries(score);
    const maxVal = Math.max(...entries.map(([, v]) => v));
    const THRESH = 0.7;
    const REL   = 0.5;

    if (maxVal < THRESH) {
      return "No se detectaron emociones claras en el texto.";
    }

    const picked = entries
      .filter(([, v]) => v >= THRESH || v >= maxVal * REL || v >= 0.9)
      .map(([k]) => k);

    return "Emociones detectadas: " + picked.join(", ");
  }

  /* ==================== Guardar / historial ==================== */
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

  /* ==================== Gráfica + Leyenda ==================== */
  let emotionChart;

  const BAR_LABELS = ["Alegría","Tristeza","Enojo","Miedo","Amor","Sorpresa","Aburrimiento","Ansiedad"];
  const BAR_KEYS   = ["alegria","tristeza","enojo","miedo","amor","sorpresa","aburrimiento","ansiedad"];
  const BAR_COLORS = ["#FFD93D","#6BCB77","#FF6B6B","#4D96FF","#FFB5E8","#C9BBCF","#A0AEC0","#90CDF4"];

  function renderColorLegend() {
    if (!colorLegend) return;
    colorLegend.innerHTML = "";
    for (let i = 0; i < BAR_LABELS.length; i++) {
      const item = document.createElement("span");
      item.className = "legend-item";
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = BAR_COLORS[i];
      const txt = document.createElement("span");
      txt.textContent = BAR_LABELS[i];
      item.appendChild(dot);
      item.appendChild(txt);
      colorLegend.appendChild(item);
    }
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
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          },
          x: {
            ticks: {
              display: false   // ya no se muestran textos debajo de las barras
            }
          }
        },
        plugins: {
          legend: { display: false } // usamos la leyenda personalizada
        },
        maintainAspectRatio: false
      }
    });
    renderColorLegend();
  }

  /* ==================== Recomendaciones ==================== */
  const RECS = {
    tristeza: [
      "Camina 10–15 min al aire libre.",
      "Escribe 5 frases sobre lo que sientes (journaling).",
      "Llama o manda mensaje a alguien de confianza.",
      "Haz una lista de gratitud con 3 cosas de hoy.",
      "Escucha música calmada 10 min con respiración ligera."
    ],
    // Aburrimiento — actividades renovadas + deportes en bloque aparte
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
        "Ciclismo",
        "Natación",
        "Fútbol",
        "Básquetbol",
        "Voleibol",
        "Senderismo",
        "Patinaje/Skate",
        "Yoga",
        "Pilates",
        "Artes marciales",
        "Box recreativo",
        "Baile"
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

  const recSection = document.getElementById("recSection");
  const recList = document.getElementById("recList");

  function renderRecommendations(dominantEmotion) {
    const showable = ["tristeza","aburrimiento","ansiedad","enojo","miedo"];
    if (!showable.includes(dominantEmotion)) {
      recSection.hidden = true;
      recList.innerHTML = "";
      return;
    }

    // limpiar elementos extra posibles (títulos/listas añadidos antes)
    [...recSection.querySelectorAll("p, ul:not(#recList)")].forEach(n => n.remove());
    recList.innerHTML = "";

    if (dominantEmotion === "aburrimiento") {
      // Actividades recreativas (máximo 5)
      RECS.aburrimiento.actividades.slice(0, 5).forEach(t => {
        const li = document.createElement("li");
        li.textContent = t;
        recList.appendChild(li);
      });

      // Línea + lista de deportes
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

    // Caso general
    const ideas = RECS[dominantEmotion] || [];
    recList.innerHTML = ideas.slice(0, 5).map(t => `<li>${t}</li>`).join("");
    recSection.hidden = ideas.length === 0;
  }

  function actualizarGrafica() {
    if (!emotionChart) return;

    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    const conteos = {
      alegria: 0, tristeza: 0, enojo: 0, miedo: 0,
      amor: 0, sorpresa: 0, aburrimiento: 0, ansiedad: 0
    };

    const stripAccents = (s) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    pensamientos.forEach(p => {
      const res = stripAccents(p.resultado || "");
      for (let emocion in conteos) {
        if (res.includes(emocion)) conteos[emocion]++;
      }
    });

    emotionChart.data.datasets[0].data = BAR_KEYS.map(k => conteos[k]);
    emotionChart.update();

    const total = Object.values(conteos).reduce((a,b)=>a+b,0);
    const recomendacionBox = document.getElementById("recommendation");

    // limpiar elementos extra (por si veníamos de aburrimiento)
    [...recSection.querySelectorAll("p, ul:not(#recList)")].forEach(n => n.remove());

    if (total === 0) {
      recomendacionBox.innerHTML = "Aún no hay suficientes datos para dar una recomendación.";
      recSection.hidden = true;
      recList.innerHTML = "";
      return;
    }

    const maxEmocion = Object.keys(conteos)
      .reduce((a,b) => conteos[a] > conteos[b] ? a : b);

    let mensaje = "";
    switch (maxEmocion) {
      case "alegria":
        mensaje = "Se nota que estás pasando buenos momentos. Aprovecha esta energía para iniciar algo nuevo o conectar con personas importantes.";
        break;
      case "tristeza":
        mensaje = "Has estado algo triste. Cuida tu descanso y date permiso de expresar lo que sientes.";
        break;
      case "enojo":
        mensaje = "Has expresado enojo. Tómate una pausa breve y canaliza esa energía de forma saludable.";
        break;
      case "miedo":
        mensaje = "Se observan señales de preocupación. Dar pasos pequeños y realistas puede ayudar.";
        break;
      case "amor":
        mensaje = "El amor está presente. Expresa tu cariño y también cuídate a ti mismo/a.";
        break;
      case "sorpresa":
        mensaje = "Hubo situaciones inesperadas. Mantén apertura y curiosidad; lo nuevo puede traer oportunidades.";
        break;
      case "aburrimiento":
        mensaje = "Posible apatía o desmotivación. Cambiar pequeñas rutinas puede darte un impulso.";
        break;
      case "ansiedad":
        mensaje = "Señales de estrés/ansiedad. Respira profundo y cuida tu sueño; pasos cortos ayudan.";
        break;
    }
    recomendacionBox.innerHTML = mensaje;

    renderRecommendations(maxEmocion);
  }

  /* ==================== Eventos ==================== */
  saveBtn.addEventListener("click", guardarPensamiento);

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
