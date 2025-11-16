/*Equipo:
  Chávez Navarro Salma
  Martínez Nava Diego
  Tapia Mundo Melissa Monserrat */

/* Aquí arrancamos todo apenas carga la página. Nos sirve para tener
   todas las referencias listas y asegurarnos de que el DOM ya existe. */
   document.addEventListener("DOMContentLoaded", () => {

    /* --- Aquí agarramos todos los elementos que vamos a estar usando.
       Básicamente preparamos todo para no andar buscándolo después. --- */
    const thoughtInput = document.getElementById("thoughtInput");
    const saveBtn = document.getElementById("saveBtn");
    const emotionResult = document.getElementById("emotionResult");
    const thoughtList = document.getElementById("thoughtList");
    const chartCanvas = document.getElementById("emotionChart");
    const recomendacionBox = document.getElementById("recommendation");
  
    /* --- Este es nuestro diccionario gigante de palabras clave.
       Aquí definimos todo lo que nos ayuda a detectar emociones de manera básica.
       Lo pensamos como nuestro radar manual de emociones. --- */
    const reglasPalabras = {
      alegria: [
        "feliz","content","alegr","emocion","bien","tranquil","optimist","agradecid","anim",
        "divertid","entusiasm","relajad","satisfech","orgull","maravill","euforic",
        "me muero de risa","felicidad","excelente","genial","sorprendentemente bien","super content",
        "con ganas","excit","entusiasta","alegrecito","vibrante","radiante","ilusion","pura energía",
        "diversión","placentero","felicidad total","maravilloso","fantástico","fenomenal",
        "wow que bien","esto es lo mejor","jajaja","me encanta","yeah","súper feliz"
      ],
      tristeza: [
        "triste","solo","llor","deprim","mal","nostalg","sin ganas","vaci","agotad",
        "melancol","desanim","abat","frustr","desesper","desol","desmotiv","infeliz",
        "desilusion","angust","desconsol","desesperanz","melancolia","apatic","abatimiento",
        "pesimista","derrot","apagad","cansancio emocional","tristezón","decadente","desmoraliz","nostálgic",
        "me siento fatal","no tengo ganas","todo mal","triste total","de bajón","harto de todo"
      ],
      enojo: [
        "enoj","molest","furios","rabia","irrit","odio","resentim","frustr","indign","enfurec",
        "molestia","irritacion","rabios","coraje","exasper","exalt","fastidi","iracund",
        "explot","quem","frustración total","hartazg","enerv","coléric","resentimiento profundo",
        "rabia contenida","qué rabia","no lo soporto","ufff","fastidiad","me quema"
      ],
      miedo: [
        "miedo","asust","temor","panico","nervios","insegur","angust","preocup","alarm","tension",
        "temblor","desconfi","reticent","vacilant","inquietud","precaucion","suspicaz",
        "intranquil","inseguridad","aprehens","pavor","susto","cautel","alert",
        "desconcert","despavor","tembloros","cobardía","qué miedo","me asusté","me da miedo"
      ],
      ansiedad: [
        "ansiedad","ansios","estres","angust","no puedo dormir","presion","taquicardia","no puedo respirar",
        "inquiet","nervios","intranquil","tenso","desbord","sobreexcit","agobi",
        "preocupacion constante","obsesion","inseguridad","angustiad","hipervigilancia","desesperación",
        "temblor interno","súper nervios","incómod","cansancio mental","preocupación excesiva",
        "ufff no puedo","me pongo nervios","no paro de pensar","me acelero"
      ],
      amor: [
        "amor","cariñ","te quiero","me encanta","corazon","crush","aprecio","afecto","ador",
        "ternur","romantic","enamorado","querer","cuidar","sentimiento","pasión","afectuoso",
        "afecto profundo","apapacho","conexión","mimos","cariños","admiración","adoración","ternura absoluta",
        "aprecio verdadero","corazón lleno","amor platónico","sentir amor","te adoro","me encanta estar contigo"
      ],
      sorpresa: [
        "sorprend","wow","impresion","inesperad","asomb","increibl","alucin","sorprendent","maravill",
        "fantastic","impresionante","inolvidable","vaya","quede sin palabras","increíblemente",
        "no lo esperaba","flipante","asombr","súper sorprendent","increíble","asombroso",
        "maravillosamente","qué sorpresa","totalmente inesperado","wow total","alucin","no me lo creo","sorprendente"
      ],
      aburrimiento: [
        "aburr","sin motivacion","monoton","rutina","no se que hacer","cansad","agotad","desinteres",
        "tedio","hastiad","desganad","repetitiv","indiferent","apatic","flojera",
        "poca energía","sin ganas de nada","fastidiad","desanimad","cansancio mental","apatía total",
        "harto de todo","falta de inspiración","desmotivad","sensación de vacío","aburridísima",
        "ufff que aburrido","no tengo nada que hacer","qué flojera","sin ánimos"
      ]
    };
  
    /* --- Estas reglas de contexto son más avanzadas.
       Aquí detectamos frases completas y no solo palabras sueltas.
       Lo pensamos como nuestro segundo motor para afinar el análisis. --- */
    const contexto = [
      { reg: /no tengo ganas|me da flojera|no quiero hacer nada|me siento sin ganas|me siento cansad(a)?|todo me cuesta/, emo: "tristeza", intensidad: "alta" },
      { reg: /no puedo concentrarme|no dejo de pensar|me siento nerviosa|me siento nervioso|me siento inquieta|mi cabeza no para/, emo: "ansiedad", intensidad: "alta" },
      { reg: /me siento vaci(a)?|me siento apagad(a)?|me siento decaíd(a)?|me siento medio triste|estoy medio bajón/, emo: "tristeza", intensidad: "moderada" },
      { reg: /me late rápido el corazón|siento mariposas|me siento acelerad(a)?|estoy con nervios|me siento inquieta|me siento nerviosa/, emo: "ansiedad", intensidad: "moderada" },
      { reg: /ganas de llorar|quiero llorar|me dan ganas de llorar|me siento llorona|me siento triste a morir|no paro de llorar/, emo: "tristeza", intensidad: "alta" },
      { reg: /quiero estar sola|quiero estar solo|necesito un tiempo sola|necesito un tiempo solo|no quiero ver a nadie|me quiero aislar/, emo: "tristeza", intensidad: "alta" },
      { reg: /me siento emocionad(a)?|estoy emocionad(a)?|qué emoción|no lo puedo creer|me siento con ganas de brincar|me siento animad(a)?/, emo: "alegria", intensidad: "moderada" },
      { reg: /me siento feliz pero nervios(a)?|estoy content(a) pero nervios(a)?|feliz pero ansiosa?|feliz pero preocupado(a)?|feliz pero inquieta?/, emo: "alegria", intensidad: "moderada" },
      { reg: /no puedo más|ya no aguanto|estoy saturad(a)?|me siento al límite|me siento agotad(a)?|me siento cansad(a)?/, emo: "tristeza", intensidad: "alta" },
      { reg: /me muero de risa|no paro de reír|me da mucha risa|me río mucho|me hace reír mucho|qué risa me da/, emo: "alegria", intensidad: "alta" },
      { reg: /estoy muy nervios(a)?|no dejo de preocuparme|me siento tensa|me siento inquieta|me pongo ansiosa?|me siento acelerad(a)?/, emo: "ansiedad", intensidad: "alta" },
      { reg: /me siento relajad(a)?|tranquil(a)?|calmad(a)?|todo bien|me siento en paz|me siento a gusto|todo chido/, emo: "alegria", intensidad: "moderada" },
      { reg: /estoy aburrid(a)?|no sé qué hacer|qué flojera|me aburro|no hay nada que hacer|sin nada que hacer|estoy sin ideas/, emo: "aburrimiento", intensidad: "moderada" },
      { reg: /me siento enamorad(a)?|me late el corazón por|estoy ilusionad(a)?|me tiene flechad(a)?|me siento prendida(o)?|me encanta alguien/, emo: "amor", intensidad: "alta" },
      { reg: /me da miedo|temo que|me asusta|me da temor|no me atrevo|tengo miedo|me da pánico|me da cosa/, emo: "miedo", intensidad: "alta" },
      { reg: /estoy sorprendida?|no lo esperaba|vaya sorpresa|no me lo creo|qué inesperado|no lo vi venir|me tomó por sorpresa|no me lo esperaba/, emo: "sorpresa", intensidad: "moderada" }
    ];
  
    /* --- Esta función es la mera base del análisis.
       Aquí combinamos palabras clave + contexto + sentiment.js.
       Lo pensamos como nuestro "triple filtro" para detectar emociones. ---*/
    function analizarEmocion(texto) {
      const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let emocionesDetectadas = new Set();
      let intensidad = {};
  
      contexto.forEach(c => {
        if (c.reg.test(t)) {
          emocionesDetectadas.add(c.emo);
          intensidad[c.emo] = c.intensidad;
        }
      });
  
      for (let emo in reglasPalabras) {
        for (let exp of reglasPalabras[emo]) {
          if (t.includes(exp)) {
            emocionesDetectadas.add(emo);
            if (!intensidad[emo]) intensidad[emo] = "moderada";
            break;
          }
        }
      }
  
      /* Aquí nos apoyamos con sentiment.js para afinar cositas. */
      if (typeof Sentiment !== "undefined") {
        const sentiment = new Sentiment();
        const score = sentiment.analyze(texto).score;
  
        if (score > 2) { emocionesDetectadas.add("alegria"); intensidad["alegria"] = "alta"; }
        else if (score > 0) { if (!intensidad["alegria"]) { emocionesDetectadas.add("alegria"); intensidad["alegria"] = "moderada"; } }
        else if (score < -2) { emocionesDetectadas.add("tristeza"); intensidad["tristeza"] = "alta"; }
        else if (score < 0) { if (!intensidad["tristeza"]) { emocionesDetectadas.add("tristeza"); intensidad["tristeza"] = "moderada"; } }
      }
  
      if (emocionesDetectadas.size === 0)
        return { mensaje: "No se detectaron emociones claras.", emociones: [], intensidad: {} };
  
      return {
        mensaje: "Emociones detectadas: " + [...emocionesDetectadas].join(", "),
        emociones: [...emocionesDetectadas],
        intensidad
      };
    }
  
    /* --- Aquí generamos recomendaciones dependiendo de la mezcla de emociones.
       Esta sección la vemos como nuestro mini-sistema experto.
       Si hay combinación especial → damos recomendación especial.
       Si no → soltamos recomendaciones individuales. --- */
    function generarRecomendacionAvanzada(emociones, intensidad) {
      if (!emociones || emociones.length === 0) return "No hay suficientes datos para dar una recomendación.";
  
      let combo = emociones.sort().join("+");
  
      const combinacionesMasivas = {
        "alegria+ansiedad": "Si estás feliz pero sientes ansiedad, respira hondo un par de minutos y luego ponte a ver un video gracioso o escuchar tu canción favorita para relajarte un poco.",
        "alegria+tristeza": "Si estás alegre pero un poco triste, pon música que te guste y haz algo pequeño como ordenar tu escritorio o sacar fotos bonitas. Te ayuda a sentir mejor ambas cosas.",
        "alegria+enojo": "Si estás contenta pero con algo de enojo, sal a caminar unos 10 minutos o mueve el cuerpo con un poco de ejercicio. Te quitas la tensión y no pierdes la buena onda.",
        "alegria+miedo": "Si estás alegre pero también sientes miedo, haz algo divertido y seguro, como ver un video gracioso o jugar algo ligero. Te ayuda a calmarte y seguir disfrutando.",
        "alegria+amor": "Si sientes alegría y amor al mismo tiempo, manda un mensaje bonito a alguien o dibuja algo simple para alguien que quieres. Es rápido y se siente bien.",
        "alegria+sorpresa": "Si estás sorprendida y feliz, toma una foto, haz un mini video o escribe algo rápido en tu diario. Así guardas el momento.",
        "alegria+aburrimiento": "Si estás alegre pero aburrida, haz algo creativo rápido: dibuja, colorea, prepara un snack fácil o busca un reto divertido en internet.",
        
        "tristeza+enojo": "Si estás triste y enojada, agarra un cuaderno y escribe todo lo que sientes, luego rompe una hoja o aprieta una almohada. Te ayuda a sacar la tensión sin lastimarte.",
        "tristeza+miedo": "Si estás triste y con miedo, ponte cómoda con una cobija y mira un video relajante, escucha música tranquila o simplemente respira profundo un par de minutos.",
        "tristeza+amor": "Si estás triste pero con amor, abraza un peluche o algo suave y escribe un mensaje sincero a alguien que quieres. Te reconecta con cosas lindas.",
        "tristeza+sorpresa": "Si estás triste y algo sorprendida, pon música suave y acomoda un espacio pequeño, como tu escritorio o una mesita. Te ayuda a sentir un poco de control.",
        "tristeza+aburrimiento": "Si estás triste y aburrida, haz algo manual rápido: origami, dibuja garabatos o prueba un DIY sencillo. Te distrae y te relaja.",
        "tristeza+ansiedad": "Si estás triste y ansiosa, levanta una botella de agua ligera unas cuantas veces o haz estiramientos cortos. Te activa el cuerpo y baja un poco la tensión.",
        
        "enojo+miedo": "Si estás enojada y con miedo, mueve el cuerpo fuerte: saltos, estiramientos o un par de sentadillas. Saca la energía acumulada y te calma.",
        "enojo+amor": "Si tienes enojo pero también amor, escucha una canción que te relaje y luego manda un mensaje sincero pero calmado a alguien. Evitas decir algo que no quieres.",
        "enojo+sorpresa": "Si estás enojada y sorprendida, toma un vaso de agua fría y respira profundo un par de veces. Te ayuda a bajar la intensidad del momento.",
        "enojo+aburrimiento": "Si estás enojada y aburrida, mueve el cuerpo un minuto: saltitos, giros de brazos o sube y baja escaleras. Libera tensión rápido.",
        "enojo+ansiedad": "Si estás enojada y ansiosa, aprieta una almohada contra el pecho unos segundos o haz unos golpes suaves sobre una almohada para soltar energía.",
        
        "miedo+amor": "Si sientes miedo pero también amor, escribe una nota o un mensaje de agradecimiento a alguien que quieras. Te calma y te conecta.",
        "miedo+sorpresa": "Si estás con miedo y sorprendida, mira algo que te guste o un hobby que disfrutes, aunque sea 5 minutos. Te ayuda a sentir seguridad.",
        "miedo+aburrimiento": "Si estás aburrida y con miedo, ordena cosas repetitivas: lápices, ropa, apps en el teléfono. Lo repetitivo te calma.",
        "miedo+ansiedad": "Si estás con miedo y ansiedad, pon los pies firmes en el suelo, respira profundo y nombra cosas que ves de un mismo color. Te ayuda a volver al presente.",
        
        "amor+sorpresa": "Si sientes amor y sorpresa, manda un audio o un mensaje contando lo que pasó. Es rápido y te hace sentir bien con la otra persona.",
        "amor+aburrimiento": "Si estás aburrida pero con amor, arma una playlist para alguien o busca fotos lindas de recuerdos. Te entretiene y te hace sentir conectada.",
        "amor+ansiedad": "Si sientes amor y ansiedad, abraza algo suave como un peluche o una manta un par de segundos. Ayuda a calmar la respiración y a sentir seguridad.",
        
        "sorpresa+aburrimiento": "Si estás sorprendida pero aburrida, prueba algo nuevo por cinco minutos: dibuja, cocina algo simple o busca un reto divertido en internet.",
        "sorpresa+ansiedad": "Si estás sorprendida y ansiosa, cuenta en voz baja lo que pasó como si se lo contaras a alguien. Te ayuda a ordenar los pensamientos.",
        
        "aburrimiento+ansiedad": "Si estás aburrida y ansiosa, haz el método 5-4-3-2-1 (mira, toca, escucha, huele, siente) y luego haz algo pequeño como regar una planta o limpiar un espacio. Te centra y relaja."
      };
  
      if (combinacionesMasivas[combo]) return combinacionesMasivas[combo];
  
      const recomendaciones = {
        "alegria": "¡Qué bueno que estás feliz! Aprovecha esa energía: comparte tu entusiasmo, baila un poco, escucha tu canción favorita o empieza algo que te motive.",
        "tristeza": "Sé que no es fácil, respira profundo y escribe lo que sientes. Si quieres, habla con alguien de confianza o date un pequeño gusto que te haga sentir mejor.",
        "enojo": "Si estás enojada/o, saca esa energía: camina, da unos saltos, aprieta una almohada o escribe lo que sientes. Respira profundo y verás cómo baja la tensión.",
        "miedo": "Si tienes miedo, respira hondo y piensa en lo que sí puedes controlar. Escribir tus preocupaciones o hablar con alguien ayuda a sentirte más tranquila/o.",
        "amor": "Si sientes amor, disfrútalo y cuida de quienes te rodean. También date un momento para ti: un abrazo, un snack rico o algo que te guste.",
        "sorpresa": "Disfruta de lo inesperado, toma un momento para notar lo que pasó y ríete o comparte la sorpresa con alguien cercano.",
        "aburrimiento": "Si estás aburrida/o, cambia un poco la rutina: escucha música, prueba un dibujo rápido, aprende algo nuevo o haz algo creativo por unos minutos.",
        "ansiedad": "Si estás ansiosa/o, respira profundo un par de minutos, escribe lo que te preocupa y haz algo que te distraiga un poco, como caminar o escuchar música relajante."
      };
  
      return emociones.map(e => recomendaciones[e] || "").join(" ");
    }
  
    /* --- Aquí configuramos la gráfica de emociones.
       Decidimos ocultar las etiquetas del eje X porque se hacía muy cargada,
       y mejor usamos la leyenda externa que pusimos en el HTML. --- */
    let emotionChart;
    if (chartCanvas) {
      const ctx = chartCanvas.getContext("2d");
      emotionChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Alegría","Tristeza","Enojo","Miedo","Amor","Sorpresa","Aburrimiento","Ansiedad"],
          datasets: [{
            label: "Emociones detectadas",
            data: [0,0,0,0,0,0,0,0],
            backgroundColor: [
              "#FFD93D","#6BCB77","#FF6B6B","#4D96FF",
              "#FFB5E8","#C9BBCF","#A0AEC0","#FFD6A5"
            ],
            borderRadius: 8,
            borderWidth: 0
          }]
        },
        options: {
          scales: { 
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { ticks: { display: false }, grid: { display: false } }
          },
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  
    /* --- Esta función actualiza la gráfica leyendo todo lo del historial.
       Prácticamente es nuestro "contador oficial" de emociones. --- */
    function actualizarGrafica() {
      if (!emotionChart) return;
      const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
      const conteos = { alegria:0,tristeza:0,enojo:0,miedo:0,amor:0,sorpresa:0,aburrimiento:0,ansiedad:0 };
      
      pensamientos.forEach(p => { 
        for (let emo in conteos) { 
          if (p.emociones.includes(emo)) conteos[emo]++; 
        } 
      });
  
      emotionChart.data.datasets[0].data = [
        conteos.alegria,conteos.tristeza,conteos.enojo,conteos.miedo,
        conteos.amor,conteos.sorpresa,conteos.aburrimiento,conteos.ansiedad
      ];
      emotionChart.update();
    }
  
    /* --- Aquí mostramos el historial y le metemos el texto con las etiquetas de
       emociones resaltadas. Esto lo pensamos como la parte "visual chida" del diario. --- */
    function mostrarPensamientos() {
      const pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
      thoughtList.innerHTML = "";
  
      pensamientos.forEach(p => {
        let textoConEmociones = p.texto;
  
        p.emociones.forEach(e => {
          const nivel = p.intensidad[e] || "moderada";
          const regex = new RegExp(`\\b(${e})\\b`, "gi");
  
          textoConEmociones = textoConEmociones.replace(
            regex, 
            `<span class="emocion-combinada ${nivel}">$1 (${nivel})</span>`
          );
        });
  
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${p.fecha}</strong><br>
          ${textoConEmociones}<br>
          <em>${p.resultado}</em>
        `;
  
        thoughtList.prepend(li);
  
        li.classList.add("flash");
        setTimeout(() => li.classList.remove("flash"), 1000);
      });
    }
  
    /* --- Esta función guarda el pensamiento actual, lo analiza, lo mete al historial
       y refresca la gráfica. Es básicamente el corazón operativo del diario. --- */
    function guardarPensamiento() {
      const texto = thoughtInput.value.trim();
      
      if (!texto) { 
        alert("Por favor, escribe algo antes de guardar."); 
        return; 
      }
  
      if (texto.length > 500) {
        alert("Tu pensamiento es demasiado largo, acorta un poco.");
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
  
      let pensamientos = JSON.parse(localStorage.getItem("pensamientos")) || [];
      pensamientos.push(pensamiento);
      localStorage.setItem("pensamientos", JSON.stringify(pensamientos));
  
      mostrarPensamientos();
      try { actualizarGrafica(); } catch(e){ console.error("Error actualizando gráfica:", e); }
  
      thoughtInput.value = "";
  
      recomendacionBox.innerHTML = generarRecomendacionAvanzada(analisis.emociones, analisis.intensidad);
    }
  
    /* --- Eventos principales que usamos para guardar rápido.
       Aquí dejamos que también se pueda guardar con Enter. --- */
    saveBtn.addEventListener("click", guardarPensamiento);
  
    thoughtInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") guardarPensamiento();
    });
  
    /* --- Este botón nos sirve para limpiar todo si la persona quiere empezar fresco. --- */
    const clearBtn = document.getElementById("clearBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("¿Seguro que quieres eliminar todos los pensamientos?")) {
          localStorage.removeItem("pensamientos");
          mostrarPensamientos();
          actualizarGrafica();
          recomendacionBox.innerHTML = "";
        }
      });
    }
  
    /* --- Aquí inicializamos todo apenas carga la página. --- */
    mostrarPensamientos();
    actualizarGrafica();
  
  });
  