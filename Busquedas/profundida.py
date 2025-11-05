# --- Equipo Cafesiux ---
# Chavez Navarro Salma
# Martinez Nava Diego
# Tapia Mundo Melissa Monserrat

# BÚSQUEDA A LO PROFUNDO
# Este código recorre hacia lo más profundo posible usando una pila,
# avanzando primero por un camino hasta que ya no se pueda y luego regresa.
# La personita controla el sentido.

# Traemos el grafo desde el archivo común para no duplicar datos.
from grafo import Grafo

# Solo separa los nodos con comas 
def _formatea_lista(vals):
    return ", ".join(vals)

# Función principal de la búsqueda a lo profundo
def busqueda_profunda(inicio, meta, sentido):
    # Instanciamos el grafo; aquí ya vienen lista, tabla, arcos y utilidades
    g = Grafo()
    adj = g.lista  # lista de adyacencia que usaremos para generar sucesores

    # Por si la personita mete números
    inicio = str(inicio).strip()
    meta = str(meta).strip()
    sentido = str(sentido).strip().lower()

    # Verificaciones básicas para evitar errores
    if inicio not in adj:
        print(f"⚠️ El nodo inicial {inicio} no existe.")
        return False
    if meta not in adj:
        print(f"⚠️ El nodo final {meta} no existe.")
        return False
    if sentido not in ("h", "a"):
        print("⚠️ Escribe 'h' (horario) o 'a' (antihorario).")
        return False

    # visitado evita repetir nodos
    visitado = set()
    # pila permite bajar profundo 
    pila = []
    # padre permite reconstruir la ruta al final
    padre = {}
    # ya_generados evita repetir impresiones en consola
    ya_generados = set()

    print(f"Nodo inicial: {inicio}")
    print(f"Nodo {inicio} es meta? {'Si' if inicio == meta else 'No'}")

    # Si el inicial ya era meta se termina 
    if inicio == meta:
        print("Ruta: " + inicio)
        return True

    # Se muestran los nodos que salen del inicial (filtrando repeticiones)
    # Si prefieres usar el método del grafo: sucesores = g.vecinos(inicio)
    sucesores_ini = adj[inicio]
    gen_ini = [v for v in sucesores_ini
               if v not in visitado and v not in pila and v not in ya_generados and v != inicio]
    print(f"Nodo {inicio} genera: " + (_formatea_lista(gen_ini) if gen_ini else "NADA"))
    ya_generados.update(gen_ini)

    # Arranca el recorrido profundo
    pila.append(inicio)
    visitado.add(inicio)
    padre[inicio] = None

    # Arma la ruta al llegar a la meta
    def imprime_ruta(hasta):
        ruta = []
        cur = hasta
        while cur is not None:
            ruta.append(cur)
            cur = padre.get(cur)
        ruta.reverse()
        print("Ruta: " + "-".join(ruta))

    # Bucle principal, aquí sucede lo profundo
    while pila:
        u = pila[-1]  # se trabaja siempre con el tope (último en entrar)

        # Candidatos son los vecinos aún no visitados
        # (si quieres usar el método: candidatos_base = g.vecinos(u))
        candidatos_base = adj[u]
        candidatos = [v for v in candidatos_base if v not in visitado]

        # Si ya no hay a dónde seguir, se regresa 
        if not candidatos:
            pila.pop()
            continue

        # Según el sentido: tomar el primero (horario) o el último (antihorario)
        v = candidatos[0] if sentido == "h" else candidatos[-1]

        print(f"Nodo {v} es meta? {'Si' if v == meta else 'No'}")

        # Si se llegó a la meta, se imprime ruta y fin
        if v == meta:
            padre[v] = u
            visitado.add(v)
            pila.append(v)
            imprime_ruta(v)
            return True

        # Mostrar qué genera v sin repetir en consola
        sucesores_v = adj[v]  # o g.vecinos(v)
        gen_v = [w for w in sucesores_v
                 if w not in visitado and w not in pila and w not in ya_generados]
        print(f"Nodo {v} genera: " + (_formatea_lista(gen_v) if gen_v else "NADA"))
        ya_generados.update(gen_v)

        # Bajar un nivel más profundo
        padre[v] = u
        visitado.add(v)
        pila.append(v)

    # Si se vacía la pila sin meta, no hubo ruta
    print("No se encontró una ruta con este sentido.")
    return False

# Menú para repetir búsquedas sin reiniciar
def menu_profundo():
    while True:
        print("\n=== Búsqueda a lo profundo ===\n")
        ini = input("Personita, escoge el nodo inicial: ").strip()
        fin = input("Personita, escoge el nodo final: ").strip()
        sentido = input("¿En qué sentido quieres buscar? (h=horario/a=antihorario): ").strip().lower()

        busqueda_profunda(ini, fin, sentido)

        otra = input("\nPersonita, ¿quieres realizar otra búsqueda? (s/n): ").strip().lower()
        if otra != "s":
            print("\nHasta luego :)\n")
            break

# Entrada principal
if __name__ == "__main__":
    try:
        menu_profundo()
    except KeyboardInterrupt:
        print("\nCancelado por la personita.")
