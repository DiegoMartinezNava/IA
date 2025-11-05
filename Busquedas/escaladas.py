import math

# ----------------------------------------
# FUNCIONES AUXILIARES
# ----------------------------------------

def h(grafo, nodo, meta):
    """
    Esta función devuelve la heurística (o distancia estimada)
    desde un nodo hasta el nodo meta. 
    Usa los valores de la tabla del grafo.
    """
    try:
        return grafo.evaluar(nodo, meta)
    except KeyError:
        # Si no existe esa relación en la tabla, devuelve infinito
        return math.inf


def mostrar_vecinos(grafo, actual, vecinos, meta, sentido):
    """
    Muestra los vecinos del nodo actual junto con su valor heurístico.
    Por ejemplo: "1 genera (horario): 6 (117), 13 (697), 4 (687)"
    """
    partes = []
    for v in vecinos:
        hv = h(grafo, v, meta)
        hv_txt = '∞' if hv == math.inf else str(hv)
        partes.append(f"{v} ({hv_txt})")
    print(f"{actual} genera ({sentido}): " + ", ".join(partes) if partes else f"{actual} genera ({sentido}): Ninguno")


# ----------------------------------------
# ESCALADA SIMPLE (Opción 3)
# ----------------------------------------

def escalada_simple(grafo, inicial, meta, sentido):
    """
    En la búsqueda por escalada simple (BES):
    - Se parte de un nodo inicial.
    - Se revisan los vecinos en el sentido elegido.
    - Se pasa al primer vecino que tenga una mejor heurística (menor valor).
    - Si ninguno mejora, la búsqueda se detiene.
    """
    print("\n=== BÚSQUEDA POR ESCALADA SIMPLE (BES) ===")

    actual = str(inicial)
    camino = [actual]
    sentido_horario = (sentido == 'horario')

    print(f"Nodo inicial: {actual}")

    while True:
        # Se obtienen los vecinos del nodo actual
        vecinos = grafo.vecinos(actual, sentido_horario)
        if not vecinos:
            print(f"{actual} genera ({sentido}): Ninguno")
            print("No hay más vecinos, la búsqueda termina.")
            break

        mostrar_vecinos(grafo, actual, vecinos, meta, sentido)

        h_actual = h(grafo, actual, meta)
        siguiente = None

        # Recorremos los vecinos en orden y evaluamos
        for v in vecinos:
            print(f"¿{v} es el nodo meta? ", end="")
            if v == str(meta):
                print("Sí")
                camino.append(v)
                print("Camino encontrado:", " → ".join(camino))
                return
            else:
                print("No")

            # En la escalada simple, solo tomamos el primer vecino que mejore la heurística
            if h(grafo, v, meta) < h_actual:
                siguiente = v
                break

        if siguiente is None:
            print("Ningún vecino mejora la heurística, fin de búsqueda.")
            break

        # Se avanza al siguiente nodo
        print(f"{actual} pasa a {siguiente}")
        camino.append(siguiente)
        actual = siguiente

    print("Camino recorrido:", " → ".join(camino))


# ----------------------------------------
# ESCALADA MÁXIMA PENDIENTE (Opción 4)
# ----------------------------------------

def escalada_maxima_pendiente(grafo, inicial, meta, sentido):
    """
    En la búsqueda por escalada máxima pendiente (BEMP):
    - Se revisan todos los vecinos del nodo actual.
    - Se elige el que tenga la mejor heurística (el valor más pequeño).
    - Solo se avanza si mejora respecto al nodo actual.
    - Si no hay mejora, se termina.
    """
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

        # Primero verificamos si alguno de los vecinos ya es la meta
        for v in vecinos:
            print(f"¿{v} es el nodo meta? ", end="")
            if v == str(meta):
                print("Sí")
                camino.append(v)
                print("Camino encontrado:", " → ".join(camino))
                return
            else:
                print("No")

        # Buscamos el vecino con mejor heurística (el valor más bajo)
        mejor = min(vecinos, key=lambda x: h(grafo, x, meta))

        # Solo avanzamos si mejora respecto al actual
        if h(grafo, mejor, meta) < h(grafo, actual, meta):
            print(f"{actual} pasa a {mejor}")
            camino.append(mejor)
            actual = mejor
        else:
            print("Ningún sucesor mejora la heurística, fin de búsqueda.")
            break

    print("Camino recorrido:", " → ".join(camino))


# ----------------------------------------
# PROGRAMA PRINCIPAL
# ----------------------------------------

if __name__ == "__main__":
    grafo = Grafo()  # se crea el grafo usando la clase de tus compañeros

    # El usuario elige los nodos de inicio y meta
    inicial = input("Ingrese el nodo inicial: ").strip()
    meta = input("Ingrese el nodo meta: ").strip()

    # Validación por si el nodo inicial no existe
    if inicial not in grafo.lista:
        print("Nodo inicial no válido.")
        exit()

    # Selección del método y sentido
    modo = int(input("Seleccione modo de búsqueda:\n3. Escalada simple\n4. Escalada máxima pendiente\n→ ").strip())
    s = int(input("Seleccione sentido:\n1. Horario\n2. Antihorario\n→ ").strip())
    sentido = 'horario' if s == 1 else 'antihorario'

    # Ejecución de la búsqueda elegida
    if modo == 3:
        escalada_simple(grafo, inicial, meta, sentido)
    elif modo == 4:
        escalada_maxima_pendiente(grafo, inicial, meta, sentido)
    else:
        print("Modo no válido (usa 3 o 4).")
