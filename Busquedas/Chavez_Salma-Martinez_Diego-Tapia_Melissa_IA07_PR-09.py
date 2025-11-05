# --- Equipo Cafesiux ---
# Chavez Navarro Salma
# Martinez Nava Diego
# Tapia Mundo Melissa Monserrat

from grafo import Grafo

# Pedimos un nodo al usuario, asegurando que esté entre 1 y 28
def pedir_nodo(prompt):
    while True:
        try:
            nodo = int(input(prompt))
            if nodo < 1 or nodo > 28:
                print("El nodo debe estar entre 1 y 28.")
            else:
                return str(nodo)  # siempre lo manejamos como string
        except ValueError:
            print("Ingresa un número válido.")

# Se pide si el usuario quiere Horario o Antihorario
def pedir_sentido():
    while True:
        sentido = input("Elige sentido de expansión de sucesores (H=Horario, A=Antihorario): ").upper()
        if sentido in ('H', 'A'):
            return sentido
        print("Solo puedes elegir 'H' para horario o 'A' para antihorario.")

# Aquí está la búsqueda Primero Mejor
def busqueda_primero_mejor(inicio, meta, sentido):
    grafo = Grafo()              # se crea el grafo
    camino = [inicio]            # se guardan los nodos que voy visitando
    actual = inicio

    # Se muestra el nodo inicial
    g_base = 0
    h_base = grafo.tabla[inicio].get(meta, 0) if inicio != meta else 0
    f_base = g_base + h_base
    print("=============================================")
    print(f"NODO BASE | {inicio} (NODO INICIAL) | G={g_base} | H={h_base} | F={f_base} | META: {'SI' if inicio == meta else 'NO'}")
    print("=============================================\n")

    paso = 0
    visitados = set()

    while actual != meta:
        visitados.add(actual)  # marca que ya se paso por este nodo

        # obtenemos sucesores según lo que el usuario eligió (H o A)
        horario = sentido == 'H'
        sucesores = grafo.vecinos(actual, sentido_horario=horario)

        # se muestra la tabla de expansión
        print(f"--- Paso {paso} — Expando nodo {actual} ---")
        print(f"{'Sucesor':<10} | {'G (arco)':<10} | {'H (tabla)':<10} | {'F=G+H':<10} | {'ELEGIDO':<10}")
        print("-" * 60)

        mejor_f = float('inf')
        mejor_nodo = None

        for s in sucesores:
            if s in visitados:
                continue  # no se revisan nodos que ya vimos
            g = grafo.obtener_arco(actual, s)
            if g is None:
                continue  # si no hay arco, lo saltamos

            # si es la meta, H=0; si no, tomamos de la tabla
            h = 0 if s == meta else grafo.tabla.get(s, {}).get(meta, float('inf'))
            f = g + h
            print(f"{s:<10} | {g:<10} | {h:<10} | {f:<10} | ", end="")

            # se guarda el sucesor con menor F
            if f < mejor_f:
                mejor_f = f
                mejor_nodo = s

            print("")

        if mejor_nodo is None:
            print("No hay sucesores válidos para expandir. Se detiene la búsqueda.")
            break

        # se muestra cuál nodo se elegió y si es la meta
        print(f"--> Elegido: {mejor_nodo} (F = {mejor_f}) | META: {'SI' if mejor_nodo == meta else 'NO'}")
        print("=" * 60 + "\n")

        actual = mejor_nodo
        camino.append(actual)  # se agrega al camino recorrido
        paso += 1

    # al final se muestra la ruta completa
    print("Ruta final encontrada:")
    print(" → ".join(map(str, camino)))
    print("=============================================")
    return camino

# --- Ejecución ---
if __name__ == "__main__":
    print("Búsqueda Primero Mejor en Grafo")
    
    inicio = pedir_nodo("Ingresa el nodo inicial (1-28): ")
    
    while True:
        meta = pedir_nodo("Ingresa el nodo meta (1-28): ")
        if meta == inicio:
            print("El nodo meta no puede ser igual al nodo inicial. Intenta de nuevo.")
        else:
            break

    sentido = pedir_sentido()  # H o A

    ruta = busqueda_primero_mejor(inicio, meta, sentido)
