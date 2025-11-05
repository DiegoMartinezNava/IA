# --- Equipo Cafesiux ---
# Chavez Navarro Salma
# Martinez Nava Diego
# Tapia Mundo Melissa Monserrat

from collections import deque
import math
from grafo import Grafo

# ---------------- Utilidades comunes ----------------
# En esta sección van funciones de apoyo que reutilizan las búsquedas:
# - formatea salida de listas
# - pedir/validar sentido
# - pedir/validar nodos (para 1–4)
# - reconstruir/imprimir ruta (→)
# - obtener heurística con la tabla del grafo.

def formatea_lista(vals):
    return ", ".join(vals)

def pedir_sentido():
    """
    Se pide si la personita quiere expandir en sentido horario o antihorario.
    Regresamos el texto 'horario' o 'antihorario' porque así lo usan las funciones.
    """
    while True:
        s = input("Ingresa el sentido (H=horario, A=antihorario): ").strip().upper()
        if s in ("H", "A"):
            return "horario" if s == "H" else "antihorario"
        print("Sentido inválido.")

def pedir_nodo_busqueda(prompt, grafo):
    """
    Pedimos un nodo asegurando que exista en el grafo y lo tratamos como string.
    Esta función se usa en las búsquedas 1–4 para mantener el mismo formato de entrada.
    """
    while True:
        n = input(prompt).strip()
        if n.isdigit() and n in grafo.lista:
            return n
        print("Nodo inválido.")

def imprimir_ruta(meta, padre):
    """
    Reconstruimos la ruta desde 'meta' hacia atrás usando el diccionario 'padre'.
    Luego la invertimos y la mostramos con flechas '→' para que se lea bonito.
    """
    ruta = []
    actual = meta
    while actual is not None:
        ruta.append(actual)
        actual = padre.get(actual)
    ruta.reverse()
    print("Ruta:", " → ".join(ruta))

def h(grafo, nodo, meta):
    """
    Heurística: pedimos al grafo el valor estimado entre 'nodo' y 'meta'.
    Si no existe en la tabla, devolvemos infinito para que no sea candidato.
    """
    try:
        return grafo.evaluar(nodo, meta)
    except KeyError:
        return math.inf

# -------------------------------------------------------------------
# (1) BÚSQUEDA A LO ANCHO
# Recorre por niveles usando una cola: primero cercanos, luego lejanos.
# -------------------------------------------------------------------
def busqueda_ancha(inicio, meta, sentido, grafo):
    adj = grafo.lista
    visitado = set([inicio])   # para no repetir nodos
    padre = {inicio: None}     # nos permite reconstruir la ruta
    cola = deque([inicio])     # estructura clave de lo ancho (nivel por nivel)
    generados = set()          # evita imprimir/encolar repetidos en consola

    print("Nodo inicial:", inicio)
    print("Nodo", inicio, "es meta?", "Si" if inicio == meta else "No")
    if inicio == meta:
        imprimir_ruta(inicio, padre)
        return

    # Primeros generados del nodo inicial (se imprime lo que sale)
    gen_ini = [v for v in adj[inicio] if v not in visitado]
    print("Nodo", inicio, "genera:", formatea_lista(gen_ini) if gen_ini else "Ninguno")
    if sentido == "antihorario":
        gen_ini.reverse()

    # Se encolan y se marcan como vistos
    for v in gen_ini:
        cola.append(v)
        visitado.add(v)
        padre[v] = inicio
    generados.update(gen_ini)

    # Ciclo principal: sacar del frente y expandir por niveles
    while cola:
        u = cola.popleft()
        print("Nodo", u, "es meta?", "Si" if u == meta else "No")

        if u == meta:
            imprimir_ruta(u, padre)
            return

        nuevos = [w for w in adj[u] if w not in visitado and w not in generados]
        print("Nodo", u, "genera:", formatea_lista(nuevos) if nuevos else "Ninguno")

        if sentido == "antihorario":
            nuevos.reverse()

        for w in nuevos:
            cola.append(w)
            visitado.add(w)
            padre[w] = u
        generados.update(nuevos)

    print("No se encontró ruta.")

# -------------------------------------------------------------------
# (2) BÚSQUEDA EN PROFUNDIDAD
# Baja lo más posible por un camino usando pila; si se traba, retrocede.
# -------------------------------------------------------------------
def busqueda_profunda(inicio, meta, sentido, grafo):
    adj = grafo.lista
    visitado = set()     # nodos ya vistos
    pila = []            # estructura clave de profundidad
    padre = {}           # para reconstruir la ruta
    generados = set()    # solo para no repetir impresiones

    print("Nodo inicial:", inicio)
    print("Nodo", inicio, "es meta?", "Si" if inicio == meta else "No")
    if inicio == meta:
        padre[inicio] = None
        imprimir_ruta(inicio, padre)
        return

    # Se imprime qué salidas tiene el inicial
    gen_ini = [v for v in adj[inicio] if v not in visitado]
    print("Nodo", inicio, "genera:", formatea_lista(gen_ini) if gen_ini else "Ninguno")

    # Se inicializa la pila con el nodo de inicio
    pila.append(inicio)
    visitado.add(inicio)
    padre[inicio] = None
    generados.update(gen_ini)

    # Bucle de profundidad: tomamos la cima y empujamos el siguiente candidato
    while pila:
        u = pila[-1]  # miramos la cima sin sacar
        candidatos = [v for v in adj[u] if v not in visitado]
        if not candidatos:
            pila.pop()   # si ya no hay a dónde seguir, retrocedemos
            continue

        # Elegimos el siguiente según el sentido
        v = candidatos[0] if sentido == "horario" else candidatos[-1]
        print("Nodo", v, "es meta?", "Si" if v == meta else "No")

        if v == meta:
            padre[v] = u
            visitado.add(v)
            pila.append(v)
            imprimir_ruta(v, padre)
            return

        # Imprimimos lo que genera 'v' y avanzamos
        nuevos = [w for w in adj[v] if w not in visitado and w not in generados]
        print("Nodo", v, "genera:", formatea_lista(nuevos) if nuevos else "Ninguno")

        padre[v] = u
        visitado.add(v)
        pila.append(v)
        generados.update(nuevos)

    print("No se encontró ruta.")

# -------------------------------------------------------------------
# VECINOS PARA HEURÍSTICA
# Muestra vecinos con su H(nodo, meta); se usa en escaladas.
# -------------------------------------------------------------------
def mostrar_vecinos(grafo, actual, vecinos, meta, sentido):
    partes = []
    for v in vecinos:
        hv = h(grafo, v, meta)
        hv_txt = '∞' if hv == math.inf else str(hv)
        partes.append(f"{v} ({hv_txt})")
    print(f"{actual} genera ({sentido}): " + ", ".join(partes) if partes else f"{actual} genera ({sentido}): Ninguno")

# -------------------------------------------------------------------
# (3) ESCALADA SIMPLE (BES)
# Recorre al primer vecino que realmente mejora la heurística (H baja).
# Si ninguno mejora, se detiene (meseta/local).
# -------------------------------------------------------------------
def escalada_simple(grafo, inicial, meta, sentido):
    print("\n=== BÚSQUEDA POR ESCALADA SIMPLE (BES) ===")

    actual = str(inicial)
    camino = [actual]                 # guardamos el recorrido
    sentido_horario = (sentido == 'horario')

    print(f"Nodo inicial: {actual}")

    while True:
        # Vecinos en el orden del sentido elegido
        vecinos = grafo.vecinos(actual, sentido_horario)
        if not vecinos:
            print(f"{actual} genera ({sentido}): Ninguno")
            print("No hay más vecinos, la búsqueda termina.")
            break

        mostrar_vecinos(grafo, actual, vecinos, meta, sentido)

        h_actual = h(grafo, actual, meta)
        siguiente = None

        # Se elige el PRIMERO que mejore la heurística
        for v in vecinos:
            print(f"¿{v} es el nodo meta? ", end="")
            if v == str(meta):
                print("Sí")
                camino.append(v)
                print("Camino encontrado:", " → ".join(camino))
                return
            else:
                print("No")

            if h(grafo, v, meta) < h_actual:
                siguiente = v
                break

        if siguiente is None:
            print("Ningún vecino mejora la heurística, fin de búsqueda.")
            break

        print(f"{actual} pasa a {siguiente}")
        camino.append(siguiente)
        actual = siguiente

    print("Camino recorrido:", " → ".join(camino))

# -------------------------------------------------------------------
# (4) ESCALADA MÁXIMA PENDIENTE (BEMP)
# Evalúa TODOS los vecinos y avanza al que tenga la mejor heurística.
# Si no mejora, termina (meseta/local).
# -------------------------------------------------------------------
def escalada_maxima_pendiente(grafo, inicial, meta, sentido):
    print("\n=== BÚSQUEDA DE ESCALADA MÁXIMA PENDIENTE (BEMP) ===")

    actual = str(inicial)
    camino = [actual]
    sentido_horario = (sentido == 'horario')

    print(f"Nodo inicial: {actual}")

    while True:
        vecinos = grafo.vecinos(actual, sentido_horario)
        if not vecinos:
            print(f"{actual} genera ({sentido}): Ninguno")
            print("No hay más vecinos, fin de búsqueda.")
            break

        mostrar_vecinos(grafo, actual, vecinos, meta, sentido)

        # Primero, se revisa si ya apareció la meta directamente
        for v in vecinos:
            print(f"¿{v} es el nodo meta? ", end="")
            if v == str(meta):
                print("Sí")
                camino.append(v)
                print("Camino encontrado:", " → ".join(camino))
                return
            else:
                print("No")

        # Elegimos el de menor H entre los vecinos
        mejor = min(vecinos, key=lambda x: h(grafo, x, meta))

        # Solo se avanza si realmente mejora la H respecto al actual
        if h(grafo, mejor, meta) < h(grafo, actual, meta):
            print(f"{actual} pasa a {mejor}")
            camino.append(mejor)
            actual = mejor
        else:
            print("Ningún sucesor mejora la heurística, fin de búsqueda.")
            break

    print("Camino recorrido:", " → ".join(camino))

# -------------------------------------------------------------------
# (5) BÚSQUEDA PRIMERO MEJOR (original del equipo, respetando su estilo)
# Hace tabla por paso: Sucesor | G | H | F y elige el de menor F.
# Aquí se crea su propio Grafo() interno para conservar el comportamiento original.
# -------------------------------------------------------------------
def busqueda_primero_mejor():
    # Pedimos un nodo al usuario, asegurando que esté entre 1 y 28
    def pedir_nodo(prompt):
        while True:
            try:
                nodo = int(input(prompt))
                if 1 <= nodo <= 28:
                    return str(nodo)  # siempre lo manejamos como string
                print("El nodo debe estar entre 1 y 28.")
            except ValueError:
                print("Ingresa un número válido.")

    # Se pide el sentido H/A con el mismo mensaje que el resto de búsquedas
    def pedir_sentido_local():
        while True:
            sentido = input("Ingresa el sentido (H=horario, A=antihorario): ").upper()
            if sentido in ('H', 'A'):
                return sentido
            print("Solo puedes elegir H o A")

    grafo = Grafo()  # se crea el grafo (esta búsqueda usa su propia instancia)

    # Prompts idénticos a los de tu compañera
    inicio = pedir_nodo("Ingresa el nodo inicial (1-28): ")
    while True:
        meta = pedir_nodo("Ingresa el nodo meta (1-28): ")
        if meta != inicio:
            break
        print("El nodo meta no puede ser igual al inicial.")

    sentido = pedir_sentido_local()

    # Se arma el camino y se arranca desde 'inicio'
    camino = [inicio]
    actual = inicio

    # Encabezado base que muestra G/H/F del nodo inicial
    print("=============================================")
    print(f"NODO BASE | {inicio} (INICIO) | META: {'SI' if inicio==meta else 'NO'}")
    print("=============================================\n")

    paso = 0
    visitados = set()

    while actual != meta:
        visitados.add(actual)  # marcamos que ya pasamos por este nodo

        horario = sentido == 'H'
        sucesores = grafo.vecinos(actual, sentido_horario=horario)

        # Se imprime la tablita con G/H/F
        print(f"--- Paso {paso} — Expando nodo {actual} ---")
        print(f"{'Sucesor':<10} | {'G (arco)':<10} | {'H (tabla)':<10} | {'F=G+H':<10}")

        mejor = None
        mejor_f = float("inf")

        for s in sucesores:
            if s in visitados:
                continue  # no repetimos nodos ya visitados
            g = grafo.obtener_arco(actual, s)
            if g is None:
                continue  # si no hay costo de arco definido, lo saltamos
            h_val = 0 if s == meta else grafo.tabla.get(s, {}).get(meta, float("inf"))
            f = g + h_val
            print(f"{s:<10} | {g:<10} | {h_val:<10} | {f:<10}")

            # Se queda con el de menor F
            if f < mejor_f:
                mejor_f = f
                mejor = s

        if mejor is None:
            print("No hay sucesores válidos.")
            break

        # Se anuncia el elegido del paso y se continúa
        print(f"--> Elegido: {mejor} | META: {'SI' if mejor==meta else 'NO'}")
        print("="*60 + "\n")

        actual = mejor
        camino.append(actual)
        paso += 1

    # Al final, muestra la ruta completa con flechas
    print("Ruta final encontrada:")
    print(" → ".join(camino))
    print("=============================================")

# -------------------------------------------------------------------
# MENÚ PRINCIPAL CON REPETICIÓN
# Deja elegir la búsqueda, corre el algoritmo y luego pregunta si se repite.
# -------------------------------------------------------------------
def main():
    global g
    g = Grafo()  # se crea una instancia global para las búsquedas 1–4

    while True:
        print("\n=== Menú de Búsquedas ===")
        print("1) Búsqueda a lo ancho")
        print("2) Búsqueda en profundidad")
        print("3) Escalada simple")
        print("4) Escalada máxima pendiente")
        print("5) Búsqueda primero mejor")
        print("0) Salir")

        op = input("Selecciona una opción (0-5): ").strip()

        if op == "0":
            print("Hasta luego :)")
            break

        if op not in {"1","2","3","4","5"}:
            print("Opción inválida.")
            continue

        # Primero Mejor conserva su propio estilo de entrada y su propio grafo interno
        if op == "5":
            busqueda_primero_mejor()
        else:
            # Para 1–4 usamos el mismo formato de prompts que acordaste
            inicio = pedir_nodo_busqueda("Ingresa el nodo inicial (1-28): ", g)
            meta = pedir_nodo_busqueda("Ingresa el nodo meta (1-28): ", g)
            sentido = pedir_sentido()

            if op == "1":
                busqueda_ancha(inicio, meta, sentido, g)
            elif op == "2":
                busqueda_profunda(inicio, meta, sentido, g)
            elif op == "3":
                escalada_simple(g, inicio, meta, sentido)
            elif op == "4":
                escalada_maxima_pendiente(g, inicio, meta, sentido)

        # Al terminar una búsqueda, preguntamos si se quiere repetir
        rep = input("\n¿Quieres realizar otra búsqueda? (S/N): ").strip().upper()
        if rep != "S":
            print("\nEstá bien, hasta luego :)\n")
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nEjecución cancelada.")
