# Aquí pusimos todas las combinaciones que dan victoria para no calcularlas cada turno.
LINEAS_GANADORAS = [
    (0, 1, 2),  # fila de arriba
    (3, 4, 5),  # fila del medio
    (6, 7, 8),  # fila de abajo
    (0, 3, 6),  # columna izquierda
    (1, 4, 7),  # columna central
    (2, 5, 8),  # columna derecha
    (0, 4, 8),  # diagonal principal
    (2, 4, 6)   # diagonal inversa
]

def mostrar_tablero(tab):
    """
    Imprimimos el tablero 3x3.
    Si una casilla está vacía, mostramos su número (1..9) para que sea más fácil ubicarse.
    """
    def celda(i):
        return tab[i] if tab[i] != ' ' else str(i + 1)

    filas = [
        f" {celda(0)} | {celda(1)} | {celda(2)} ",
        "---+---+---",
        f" {celda(3)} | {celda(4)} | {celda(5)} ",
        "---+---+---",
        f" {celda(6)} | {celda(7)} | {celda(8)} "
    ]
    print("\n".join(filas))

def casillas_disponibles(tab):
    """Regresamos los índices donde todavía se puede jugar (las casillas libres)."""
    return [i for i, v in enumerate(tab) if v == ' ']

def hay_ganador(tab, j):
    """Marcamos True si 'j' (X u O) completa cualquiera de las líneas ganadoras."""
    return any(all(tab[k] == j for k in linea) for linea in LINEAS_GANADORAS)

def tablero_lleno(tab):
    """Decimos True cuando ya no queda ningún espacio en blanco."""
    return all(c != ' ' for c in tab)

def pedir_movimiento(tab):
    """
    Pedimos una casilla (1-9) y validamos tres cosas:
    - que nos den un número,
    - que esté en rango,
    - y que la casilla siga libre.
    Regresamos el índice 0..8 ya validado.
    """
    while True:
        s = input("Elige una casilla (1-9): ").strip()

        if not s.isdigit():
            print("⚠️ Ingresa un número del 1 al 9.")
            continue

        i = int(s) - 1  # convertimos de 1..9 a 0..8

        if i < 0 or i > 8:
            print("⚠️ Ese número no existe en el tablero.")
            continue

        if tab[i] != ' ':
            print("⚠️ Esa casilla ya está ocupada.")
            continue

        return i

import random  # lo usamos para elegir al azar cuando toque

def movimiento_ia(tab, ia='O', humano='X'):
    """
    Programamos la IA por reglas (rápida para gato):
    1) si podemos ganar ya, cerramos;
    2) si el humano gana en la siguiente, bloqueamos;
    3) tomamos centro;
    4) intentamos esquina;
    5) si no, cualquier libre.
    """
    # 1) Probamos ganar en una
    for m in casillas_disponibles(tab):
        tab[m] = ia               # nos "imaginamos" que jugamos ahí
        if hay_ganador(tab, ia):
            tab[m] = ' '          # deshacemos la prueba
            return m              # listo, esa es la jugada
        tab[m] = ' '

    # 2) Si el humano gana en una, bloqueamos
    for m in casillas_disponibles(tab):
        tab[m] = humano           # nos "imaginamos" su jugada
        if hay_ganador(tab, humano):
            tab[m] = ' '
            return m
        tab[m] = ' '

    # 3) Centro primero
    if tab[4] == ' ':
        return 4

    # 4) Luego intentamos alguna esquina
    esquinas = [i for i in (0, 2, 6, 8) if tab[i] == ' ']
    if esquinas:
        return random.choice(esquinas)

    # 5) Si no, tomamos cualquiera de las libres
    libres = casillas_disponibles(tab)
    return random.choice(libres) if libres else None

if __name__ == "__main__":
    tab = [' '] * 9
    humano, ia = 'X', 'O'   # por ahora dejamos que empiece la persona con X
    turno = 'humano'

    print("=== Gato — Humano(X) vs IA(O) ===")

    while True:
        print("\nTablero:")
        mostrar_tablero(tab)

        if turno == 'humano':
            pos = pedir_movimiento(tab)
            tab[pos] = humano
            # Revisamos si ya ganamos con esta jugada
            if hay_ganador(tab, humano):
                mostrar_tablero(tab)
                print("¡Ganaste!")
                break
            turno = 'ia'
        else:
            pos = movimiento_ia(tab, ia=ia, humano=humano)
            tab[pos] = ia
            print(f"🤖 IA juega en {pos + 1}")
            # Revisamos si la IA ya ganó
            if hay_ganador(tab, ia):
                mostrar_tablero(tab)
                print("Gana la IA.")
                break
            turno = 'humano'

        # Si ya no quedan espacios, declaramos empate
        if tablero_lleno(tab):
            mostrar_tablero(tab)
            print("Empate.")
            break

