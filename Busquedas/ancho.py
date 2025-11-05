# --- Equipo Cafesiux ---
# Chavez Navarro Salma
# Martinez Nava Diego
# Tapia Mundo Melissa Monserrat

# BÚSQUEDA A LO ANCHO
# Este código recorre nivel por nivel utilizando una cola,
# avanzando primero por los nodos que están más cerca.
# La personita controla el sentido.

from collections import deque
# Traemos el grafo desde el archivo común para no duplicar datos.
from grafo import Grafo

# Solo separa los nodos con comas 
def _formatea_lista(vals):
    return ", ".join(vals)

# Función principal de la búsqueda a lo ancho
def busqueda_ancha(inicio, meta, sentido):
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
    visitado = set([inicio])
    # padre permite reconstruir la ruta al final
    padre = {inicio: None}
    # La cola permite recorrer por niveles 
    cola = deque([inicio])
    # ya_generados evita repetir impresiones en consola
    ya_generados = set()

    print(f"Nodo inicial: {inicio}")
    print(f"Nodo {inicio} es meta? {'Si' if inicio == meta else 'No'}")

    # Si el inicial ya era meta, se termina rápido
    if inicio == meta:
        print("Ruta: " + inicio)
        return True

    # Se muestran los nodos que salen del inicial (filtrando repeticiones)
    sucesores_ini = adj[inicio]            # equivalente: g.vecinos(inicio)
    gen_ini = [v for v in sucesores_ini
               if v not in visitado and v not in cola and v not in ya_generados and v != inicio]
    print(f"Nodo {inicio} genera: " + (_formatea_lista(gen_ini) if gen_ini else "NADA"))

    # Se respeta el sentido que la personita pidió
    if sentido == "a":
        orden = list(reversed(gen_ini))
    else:
        orden = gen_ini[:]

    # Se agregan a la cola y se marcan como vistos
    for v in orden:
        cola.append(v)
        visitado.add(v)
        padre[v] = inicio
    ya_generados.update(gen_ini)

    # Bucle principal, aquí sucede la exploración por niveles
    while cola:
        u = cola.popleft()  # Se toma del frente (clave de lo ancho)
        print(f"Nodo {u} es meta? {'Si' if u == meta else 'No'}")

        # Si ya llegamos, se arma la ruta hacia atrás
        if u == meta:
            ruta = []
            cur = u
            while cur is not None:
                ruta.append(cur)
                cur = padre[cur]
            ruta.reverse()
            print("Ruta: " + "-".join(ruta))
            return True

        # Se obtienen nuevos nodos desde u, sin repetir
        sucesores_u = adj[u]              # equivalente: g.vecinos(u)
        nuevos = [w for w in sucesores_u
                  if w not in visitado and w not in cola and w not in ya_generados]
        print(f"Nodo {u} genera: " + (_formatea_lista(nuevos) if nuevos else "NADA"))

        # De nuevo se respeta el sentido
        if sentido == "a":
            orden = list(reversed(nuevos))
        else:
            orden = nuevos[:]

        # Se encolan y se rellenan estructuras
        for w in orden:
            cola.append(w)
            visitado.add(w)
            padre[w] = u

        ya_generados.update(nuevos)

    # Si la cola se vacía sin meta, no hay ruta
    print("No se encontró una ruta con este sentido.")
    return False

# Menú para repetir búsquedas sin reiniciar
def menu_ancha():
    while True:
        print("\n=== Búsqueda a lo ancho ===\n")
        ini = input("Personita, escoge el nodo inicial: ").strip()
        fin = input("Personita, escoge el nodo final: ").strip()
        sentido = input("¿En qué sentido quieres buscar? (h=horario/a=antihorario): ").strip().lower()

        busqueda_ancha(ini, fin, sentido)

        otra = input("\nPersonita, ¿quieres realizar otra búsqueda? (s/n): ").strip().lower()
        if otra != "s":
            print("\nHasta luego :)\n")
            break

# Entrada principal
if __name__ == "__main__":
    try:
        menu_ancha()
    except KeyboardInterrupt:
        print("\nCancelado por la personita.")

