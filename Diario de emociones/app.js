document.addEventListener("DOMContentLoaded", () => {
  // Aquí conectamos todo con el HTML para tener a la mano los campos, botones y zonas donde vamos a mostrar cosas.
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

  // En esta parte normalizamos el texto para que lo podamos analizar sin acentos raros ni símbolos que estorben.
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
    // Aquí ajustamos abreviaturas y expresiones típicas de chat para que el analizador las entienda mejor.
    let t = " " + s + " ";
    t = t.replace(/\b(k|q)\b/g, " que ");
    t = t.replace(/\bxq\b|\bpxq\b|\bpq\b/g, " porque ");
    t = t.replace(/\btqm\b/g, " te quiero mucho ");
    t = t.replace(/\bbn\b/g, " bien ");
    t = t.replace(/\bni\s+tantito\b/g, " ni ");
    return t.trim();
  }

  const normalize = (s) => normalizeBase(normalizeLatAm(s));

  // Aquí armamos nuestro “diccionario” de palabras y raíces que asociamos con cada emoción.
  const reglasPalabras = {
    alegria: [
      "feliz", "content", "alegr", "emocion", "bien", "tranquil", "optimist", "agradecid", "anim",
      "divertid", "entusiasm", "relajad", "satisfech", "orgull", "maravill", "euforic",
      "me muero de risa", "felicidad", "excelente", "genial", "sorprendentemente bien", "super content",
      "con ganas", "excit", "entusiasta", "alegrecito", "vibrante", "radiante", "ilusion", "pura energia",
      "diversion", "placentero", "felicidad total", "maravilloso", "fantastico", "fenomenal",
      "wow que bien", "esto es lo mejor", "jajaja", "me encanta", "yeah", "super feliz"
    ],
    tristeza: [
      "triste", "solo", "llor", "deprim", "mal", "nostalg", "sin ganas", "vaci", "agotad",
      "melancol", "desanim", "abat", "frustr", "desesper", "desol", "desmotiv", "infeliz",
      "desilusion", "angust", "desconsol", "desesperanz", "melancolia", "apatic", "abatimiento",
      "pesimista", "derrot", "apagad", "cansancio emocional", "tristezon", "decadente", "desmoraliz", "nostalgic",
      "me siento fatal", "no tengo ganas", "todo mal", "triste total", "de bajon", "harto de todo"
    ],
    enojo: [
      "enoj", "molest", "furios", "rabia", "irrit", "odio", "resentim", "frustr", "indign", "enfurec",
      "molestia", "irritacion", "rabios", "coraje", "exasper", "exalt", "fastidi", "iracund",
      "explot", "quem", "frustracion total", "hartazg", "enerv", "coleric", "resentimiento profundo",
      "rabia contenida", "que rabia", "no lo soporto", "ufff", "fastidiad", "me quema"
    ],
    miedo: [
      "miedo", "asust", "temor", "panico", "nervios", "insegur", "angust", "preocup", "alarm", "tension",
      "temblor", "desconfi", "reticent", "vacilant", "inquietud", "precaucion", "suspicaz",
      "intranquil", "inseguridad", "aprehens", "pavor", "susto", "cautel", "alert",
      "desconcert", "despavor", "tembloros", "cobardia", "que miedo", "me asuste", "me da miedo"
    ],
    ansiedad: [
      "ansiedad", "ansios", "estres", "angust", "no puedo dormir", "presion", "taquicardia", "no puedo respirar",
      "inquiet", "nervios", "intranquil", "tenso", "desbord", "sobreexcit", "agobi",
      "preocupacion constante", "obsesion", "inseguridad", "angustiad", "hipervigilancia", "desesperacion",
      "temblor interno", "super nervios", "incomod", "cansancio mental", "preocupacion excesiva",
      "ufff no puedo", "me pongo nervios", "no paro de pensar", "me acelero"
    ],
    amor: [
      "amor", "carin", "te quiero", "me encanta", "corazon", "crush", "aprecio", "afecto", "ador",
      "ternur", "romantic", "enamorado", "querer", "cuidar", "sentimiento", "pasion", "afectuoso",
      "afecto profundo", "apapacho", "conexion", "mimos", "carinos", "admiracion", "adoracion", "ternura absoluta",
      "aprecio verdadero", "corazon lleno", "amor platonico", "sentir amor", "te adoro", "me encanta estar contigo"
    ],
    sorpresa: [
      "sorprend", "wow", "impresion", "inesperad", "asomb", "increibl", "alucin", "sorprendent", "maravill",
      "fantastic", "impresionante", "inolvidable", "vaya", "quede sin palabras", "increiblemente",
      "no lo esperaba", "flipante", "asombr", "super sorprendent", "increible", "asombroso",
      "maravillosamente", "que sorpresa", "totalmente inesperado", "wow total", "no me lo creo", "sorprendente"
    ],
    aburrimiento: [
      "aburr", "sin motivacion", "monoton", "rutina", "no se que hacer", "cansad", "agotad", "desinteres",
      "tedio", "hastiad", "desganad", "repetitiv", "indiferent", "apatic", "flojera",
      "poca energia", "sin ganas de nada", "fastidiad", "desanimad", "cansancio mental", "apatia total",
      "harto de todo", "falta de inspiracion", "desmotivad", "sensacion de vacio", "aburridisima",
      "ufff que aburrido", "no tengo nada que hacer", "que flojera", "sin animos"
    ]
  };

  // Aquí definimos frases completas de contexto que ya nos dan una pista fuerte de la emoción y su intensidad.
  const contexto = [
    {
      reg: /no tengo ganas|no quiero hacer nada|sin ganas de nada|todo me cuesta/,
      emo: "tristeza",
      intensidad: "alta"
    },
    {
      reg: /me da flojera|que flojera|ufff que aburrido|no tengo nada que hacer/,
      emo: "aburrimiento",
      intensidad: "alta"
    },
    {
      reg: /no puedo concentrarme|no dejo de pensar|mi cabeza no para|no paro de pensar/,
      emo: "ansiedad",
      intensidad: "alta"
    },
    {
      reg: /me siento vaci(a)?|me siento apagado|me siento apagada|estoy de bajon|estoy de bajón/,
      emo: "tristeza",
      intensidad: "moderada"
    },
    {
      reg: /me late rapido el corazon|me late rápido el corazon|siento mariposas|me siento nervios/,
      emo: "ansiedad",
      intensidad: "moderada"
    },
    {
      reg: /ganas de llorar|quiero llorar|me dan ganas de llorar|no paro de llorar/,
      emo: "tristeza",
      intensidad: "alta"
    },
    {
      reg: /quiero estar sola|quiero estar solo|necesito un tiempo para mi|no quiero ver a nadie/,
      emo: "tristeza",
      intensidad: "alta"
    },
    {
      reg: /estoy muy enojad[oa]|no lo soporto|que rabia|ya me harte|ya me hart/,
      emo: "enojo",
      intensidad: "alta"
    }
  ];

  // Aquí preparamos las combinaciones de emociones para dar recomendaciones más específicas cuando se mezclan dos emociones.
  const combinacionesMasivas = {
    // aburrimiento + alegria
    "aburrimiento+alegria":
      "Si estás alegre pero aburrida o aburrido, prueba algo distinto a tu rutina: un juego corto, un reto sencillo, cocinar algo pequeño o buscar un video de algo nuevo que te llame la atención.",
    // aburrimiento + amor
    "aburrimiento+amor":
      "Si estás aburrida(o) pero con amor presente, puedes proponer una actividad distinta con esa persona: ver algo nuevo juntos, cocinar algo simple o jugar un juego corto.",
    // aburrimiento + ansiedad
    "aburrimiento+ansiedad":
      "Si estás aburrida(o) y ansiosa(o), hacer una tarea corta y concreta como regar una planta, ordenar un cajón o limpiar una parte pequeña de tu espacio puede ayudarte a centrarte y bajar un poco la inquietud.",
    // aburrimiento + enojo
    "aburrimiento+enojo":
      "Si estás enojada(o) y aburrida(o), una forma sana de sacar energía es hacer algo físico como subir y bajar escaleras, hacer sentadillas o estiramientos fuertes por unos minutos.",
    // aburrimiento + miedo
    "aburrimiento+miedo":
      "Si estás aburrida(o) y con miedo, una actividad repetitiva sencilla (ordenar una parte de tu cuarto, acomodar libros, limpiar apps del celular) puede ayudarte a calmar la mente.",
    // aburrimiento + sorpresa
    "aburrimiento+sorpresa":
      "Si estás sorprendida(o) pero aburrida(o), usa esa curiosidad para aprender algo nuevo: buscar un dato interesante, ver un video corto educativo o probar una actividad que nunca has intentado.",
    // aburrimiento + tristeza
    "aburrimiento+tristeza":
      "Si estás triste y aburrida(o), una actividad creativa muy sencilla como dibujar garabatos, colorear, hacer un pequeño collage o probar un DIY fácil puede ayudarte a distraerte un poco.",

    // alegria + amor
    "alegria+amor":
      "Si sientes alegría y amor al mismo tiempo, es un buen momento para compartirlo: manda un mensaje, haz una llamada o un detalle simple para alguien que quieres. Es rápido y suele sentirse muy bien.",
    // alegria + ansiedad
    "alegria+ansiedad":
      "Si estás feliz pero sientes ansiedad, puedes disfrutar lo que te hace sentir bien y luego tomarte unos minutos para respirar profundo, estirarte o escuchar tu canción favorita para relajarte un poco.",
    // alegria + enojo
    "alegria+enojo":
      "Si estás contenta o contento pero con algo de enojo, podrías mover tu cuerpo con un poco de ejercicio suave, caminar o bailar una canción. Así liberas tensión sin perder la parte positiva del momento.",
    // alegria + miedo
    "alegria+miedo":
      "Si estás alegre pero también sientes miedo, ve paso a paso. Hablar con alguien de confianza sobre lo que te asusta y hacer una actividad pequeña que sí te haga sentir seguro puede ayudarte a seguir disfrutando.",
    // alegria + sorpresa
    "alegria+sorpresa":
      "Si estás sorprendida o sorprendido y feliz, puedes aprovechar para guardar ese recuerdo: tomar una foto, escribir dos líneas en tu diario o grabar una nota de voz para ti del futuro.",
    // alegria + tristeza
    "alegria+tristeza":
      "Si estás alegre pero un poco triste, es normal mezclar emociones. Puedes escribir lo que te alegra y lo que te duele, y después hacer algo sencillo que te guste para equilibrar.",

    // amor + ansiedad
    "amor+ansiedad":
      "Si sientes amor y ansiedad, hablar con calma sobre lo que te preocupa y escuchar a la otra persona puede bajar muchas dudas y darte más tranquilidad.",
    // amor + miedo
    "amor+miedo":
      "Si sientes miedo pero también amor, puedes apoyarte en alguien importante para ti. Un mensaje sincero, una llamada o pedir un abrazo puede darte un poco más de seguridad y calma.",
    // amor + sorpresa
    "amor+sorpresa":
      "Si sientes amor y sorpresa, puedes compartirlo: manda un audio contando lo que pasó o un mensaje lindo. Eso refuerza el vínculo y te hace sentir acompañado(a).",
    // amor + tristeza
    "amor+tristeza":
      "Si estás triste pero también sientes amor, puedes apoyarte en eso: mandar un mensaje sincero a alguien que quieres, ver fotos que te traigan buenos recuerdos o abrazar algo que te dé calma.",

    // ansiedad + enojo
    "ansiedad+enojo":
      "Si estás enojada(o) y ansiosa(o), prueba respirar profundo contando hasta cuatro al inhalar y exhalar, varias veces. Después, escribe qué cosas sí están en tus manos y cuáles no.",
    // ansiedad + miedo
    "ansiedad+miedo":
      "Si estás con miedo y ansiedad, intenta un ejercicio de atención al presente: nombra mentalmente cinco cosas que ves, cuatro que puedes tocar, tres que escuchas, dos que puedes oler y una que puedes saborear.",
    // ansiedad + sorpresa
    "ansiedad+sorpresa":
      "Si estás sorprendida(o) y ansiosa(o), contar en voz baja (o escribir) lo que pasó como si se lo contaras a alguien te ayuda a ordenar tus pensamientos.",
    // ansiedad + tristeza
    "ansiedad+tristeza":
      "Si estás triste y ansiosa(o), levantarte, estirarte y caminar unos minutos, aunque sea dentro de tu casa, puede activar tu cuerpo. Combínalo con respiraciones profundas para bajar un poco la tensión.",

    // enojo + miedo
    "enojo+miedo":
      "Si estás con enojo y miedo al mismo tiempo, intenta primero moverte (caminar, sacudir brazos, hacer estiramientos) y después hablar con alguien sobre lo que te preocupa para no quedarte con todo dentro.",
    // enojo + sorpresa
    "enojo+sorpresa":
      "Si estás sorprendida(o) y enojada(o), quizá algo te tomó desprevenido. Tómate unos minutos para pensar qué fue lo que más te molestó y luego decide cómo quieres expresarlo de una forma que no te haga daño.",
    // enojo + tristeza
    "enojo+tristeza":
      "Si estás triste y enojada(o), puede ayudar escribir en una hoja todo lo que sientes y luego romperla o golpear una almohada para sacar esa energía sin lastimarte a ti ni a nadie.",

    // miedo + sorpresa
    "miedo+sorpresa":
      "Si estás con miedo y sorpresa, recuerda que es normal sentirse así cuando algo no se esperaba. Puedes anotar qué pasó y qué necesitas ahora para sentirte un poco más seguro.",
    // miedo + tristeza  (⚠️ la que tú pediste)
    "miedo+tristeza":
      "Si estás triste y con miedo, ponte cómodo con una cobija y mira un video relajante, escucha música tranquila o simplemente respira profundo un par de minutos.",

    // sorpresa + tristeza
    "sorpresa+tristeza":
      "Si estás triste y a la vez sorprendida(o) por algo que pasó, ordenar tu espacio (escritorio, cama, una mesa) puede darte una pequeña sensación de control mientras procesas lo que sientes."
  };

  // En este bloque convertimos nuestro diccionario de palabras en expresiones regulares para poder buscar raíces y frases.
  const reglasRegex = {};
  for (const emo in reglasPalabras) {
    reglasRegex[emo] = reglasPalabras[emo].map((exp) => {
      const e = normalize(exp);
      if (e.includes(" ")) {
        const safe = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(safe, "i");
      } else {
        const safe = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(safe + "\\w*", "i");
      }
    });
  }

  // Aquí hacemos el análisis principal del texto: detectamos qué emociones aparecen y con qué intensidad.
  function analizarEmocion(textoOriginal) {
    const texto = textoOriginal || "";
    const t = normalize(texto);
    if (!t) {
      return {
        mensaje: "No se detectaron emociones claras.",
        emociones: [],
        intensidad: {}
      };
    }

    const emocionesDetectadas = new Set();
    const intensidad = {};

    // Primero revisamos si alguna frase de contexto encaja con lo que escribió la persona.
    contexto.forEach((c) => {
      if (c.reg.test(t)) {
        emocionesDetectadas.add(c.emo);
        intensidad[c.emo] = c.intensidad;
      }
    });

    // Luego recorremos las raíces y palabras asociadas a cada emoción para sumar más señales.
    for (const emo in reglasRegex) {
      const lista = reglasRegex[emo];
      for (const reg of lista) {
        if (reg.test(t)) {
          emocionesDetectadas.add(emo);
          if (!intensidad[emo]) intensidad[emo] = "moderada";
          break;
        }
      }
    }

    // Aquí, si la librería Sentiment está disponible, usamos la polaridad del texto como apoyo extra.
    try {
      if (typeof Sentiment !== "undefined") {
        const sentiment = new Sentiment();
        const score = sentiment.analyze(texto).score;

        if (score > 2) {
          emocionesDetectadas.add("alegria");
          intensidad["alegria"] = "alta";
        } else if (score > 0) {
          if (!intensidad["alegria"]) {
            emocionesDetectadas.add("alegria");
            intensidad["alegria"] = "moderada";
          }
        } else if (score < -2) {
          emocionesDetectadas.add("tristeza");
          intensidad["tristeza"] = "alta";
        } else if (score < 0) {
          if (!intensidad["tristeza"]) {
            emocionesDetectadas.add("tristeza");
            intensidad["tristeza"] = "moderada";
          }
        }
      }
    } catch (_) {}

    if (emocionesDetectadas.size === 0) {
      return {
        mensaje: "No se detectaron emociones claras.",
        emociones: [],
        intensidad: {}
      };
    }

    const arr = Array.from(emocionesDetectadas);
    return {
      mensaje: "Emociones detectadas: " + arr.join(", "),
      emociones: arr,
      intensidad
    };
  }

  // En esta función armamos el texto de recomendación según las emociones que hayamos detectado.
  function generarRecomendacionAvanzada(emociones, intensidad) {
    if (!emociones || emociones.length === 0) {
      return "No hay suficientes datos para dar una recomendación.";
    }

    const combo = [...emociones].sort().join("+");

    if (combinacionesMasivas[combo]) {
      return combinacionesMasivas[combo];
    }

    const recomendaciones = {
      alegria:
        "Estás en un momento de alegría. Disfruta esa energía: puedes hacer algo que te guste mucho, compartirla con alguien o iniciar un pequeño proyecto que te motive.",
      tristeza:
        "Se nota que no es un momento fácil. Puede ayudarte escribir lo que sientes, hablar con alguien de confianza y darte un pequeño espacio para descansar.",
      enojo:
        "Hay enojo presente. Antes de reaccionar, respira profundo varias veces, muévete un poco (camina o estírate) y luego decide cómo quieres expresar lo que sientes.",
      miedo:
        "Sientes miedo o inseguridad. Pensar qué cosas sí están bajo tu control y hablar con alguien de confianza puede ayudarte a sentirte más seguro.",
      amor:
        "Estás sintiendo amor o afecto. Cuidar ese vínculo, expresar lo que sientes y también cuidarte a ti mismo es una buena forma de aprovechar esta emoción.",
      sorpresa:
        "Hay sorpresa en lo que estás viviendo. Puedes tomarlo como una oportunidad para aprender algo nuevo o simplemente guardar el recuerdo de este momento.",
      aburrimiento:
        "Hay señales de aburrimiento o desinterés. Probar una actividad distinta, aunque sea pequeña, puede cambiar un poco cómo te sientes.",
      ansiedad:
        "Se nota tensión o ansiedad. Realizar respiraciones profundas, hacer una pausa breve y dividir tus pendientes en pasos pequeños puede ayudar."
    };

    if (emociones.length === 1) {
      const emo = emociones[0];
      return (
        recomendaciones[emo] ||
        "Se detecta una emoción predominante. Date un momento para escucharte y cuidarte."
      );
    }

    const principal = emociones[0];
    return (
      recomendaciones[principal] ||
      "Se detecta una combinación de emociones. Escucha lo que sientes y busca una acción pequeña para cuidarte."
    );
  }

  // Aquí manejamos el guardado del pensamiento: lo analizamos, lo almacenamos y refrescamos la vista.
  function guardarPensamiento() {
    const texto = thoughtInput.value.trim();
    if (!texto) {
      alert("Por favor, escribe algo antes de guardar.");
      return;
    }

    const analisis = analizarEmocion(texto);
    emotionResult.textContent = analisis.mensaje;

    const pensamiento = {
      texto,
      resultado: analisis.mensaje,
      emociones: analisis.emociones,
      intensidad: analisis.intensidad,
      fecha: new Date().toLocaleString()
    };

    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    pensamientos.push(pensamiento);
    localStorage.setItem("pensamientos", JSON.stringify(pensamientos));

    mostrarPensamientos();
    actualizarGrafica();
    thoughtInput.value = "";
  }

  // Con esta función leemos el historial guardado y lo mostramos como una lista de entradas.
  function mostrarPensamientos() {
    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    thoughtList.innerHTML = "";

    pensamientos.forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${p.fecha}</strong><br>${p.texto}<br><em>${p.resultado}</em>`;
      thoughtList.prepend(li);
    });
  }

  // En este bloque preparamos la gráfica de barras y la leyenda de colores que representa cada emoción.
  let emotionChart;
  const BAR_LABELS = [
    "Alegría",
    "Tristeza",
    "Enojo",
    "Miedo",
    "Amor",
    "Sorpresa",
    "Aburrimiento",
    "Ansiedad"
  ];
  const BAR_KEYS = [
    "alegria",
    "tristeza",
    "enojo",
    "miedo",
    "amor",
    "sorpresa",
    "aburrimiento",
    "ansiedad"
  ];
  const BAR_COLORS = [
    "#FFD93D",
    "#6BCB77",
    "#FF6B6B",
    "#4D96FF",
    "#FFB5E8",
    "#C9BBCF",
    "#A0AEC0",
    "#90CDF4"
  ];

  function renderColorLegend() {
    if (!colorLegend) return;
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
        datasets: [
          {
            label: "Emociones detectadas",
            data: Array(BAR_LABELS.length).fill(0),
            backgroundColor: BAR_COLORS,
            borderWidth: 1
          }
        ]
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

  // Aquí actualizamos la gráfica y el recuadro verde a partir de todo el historial guardado.
  function actualizarGrafica() {
    if (!emotionChart) return;

    const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
    const conteos = {
      alegria: 0,
      tristeza: 0,
      enojo: 0,
      miedo: 0,
      amor: 0,
      sorpresa: 0,
      aburrimiento: 0,
      ansiedad: 0
    };

    const strip = (s) =>
      (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    pensamientos.forEach((p) => {
      if (Array.isArray(p.emociones)) {
        p.emociones.forEach((emo) => {
          if (conteos.hasOwnProperty(emo)) {
            conteos[emo]++;
          }
        });
      } else if (p.resultado) {
        const r = strip(p.resultado);
        for (const k in conteos) {
          if (r.includes(k)) conteos[k]++;
        }
      }
    });

    emotionChart.data.datasets[0].data = BAR_KEYS.map((k) => conteos[k]);
    emotionChart.update();

    const total = Object.values(conteos).reduce((a, b) => a + b, 0);

    if (total === 0) {
      recomendacionBox.textContent =
        "Aún no hay suficientes datos para dar una recomendación.";
      // Aquí, si todavía no hay datos, ocultamos cualquier sección extra de recomendaciones.
      if (recSection) {
        recSection.hidden = true;
      }
      if (recList) recList.innerHTML = "";
      return;
    }

    const ordenadas = Object.entries(conteos).sort((a, b) => b[1] - a[1]);
    const [e1, v1] = ordenadas[0];
    const [e2, v2] = ordenadas[1] || [null, 0];

    const emocionesTop = [];
    if (v1 > 0) emocionesTop.push(e1);
    if (e2 && v2 > 0 && v2 >= v1 * 0.6) {
      emocionesTop.push(e2);
    }

    const intensidad = {};
    if (emocionesTop.length === 1) {
      intensidad[emocionesTop[0]] = "alta";
    } else if (emocionesTop.length === 2) {
      intensidad[emocionesTop[0]] = "alta";
      intensidad[emocionesTop[1]] = "moderada";
    }

    const textoRec = generarRecomendacionAvanzada(emocionesTop, intensidad);
    recomendacionBox.textContent = textoRec;

    // Aquí decidimos que, por ahora, no mostraremos listas extra debajo del recuadro verde.
    if (recSection) {
      recSection.hidden = true;
    }
    if (recList) recList.innerHTML = "";
  }

  // En esta parte conectamos los eventos de los botones y el textarea con las funciones que ya armamos.
  saveBtn.addEventListener("click", guardarPensamiento);

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
      recomendacionBox.textContent =
        "Aún no hay suficientes datos para dar una recomendación.";
      actualizarGrafica();
    }
  });

  // Al final, cuando se carga la página, inicializamos la vista con lo que ya haya guardado en el navegador.
  mostrarPensamientos();
  actualizarGrafica();
});
