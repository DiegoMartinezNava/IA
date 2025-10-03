# JUEGO DE GATO
# Personita vs Computadora

import random

# Combinaciones que dan la victoria
LINEAS_GANADORAS = [
    (0,1,2), (3,4,5), (6,7,8),  # filas
    (0,3,6), (1,4,7), (2,5,8),  # columnas
    (0,4,8), (2,4,6)            # diagonales
]

# -------- Funciones del juego --------

# Mostrar el tablero bonito
def mostrar_tablero(tablero):
    def celda(i):
        return tablero[i] if tablero[i] != ' ' else str(i+1)
    print(f"\n {celda(0)} | {celda(1)} | {celda(2)} ")
    print("---+---+---")
    print(f" {celda(3)} | {celda(4)} | {celda(5)} ")
    print("---+---+---")
    print(f" {celda(6)} | {celda(7)} | {celda(8)} ")

# Saber qué casillas están libres
def casillas_libres(tablero):
    return [i for i,v in enumerate(tablero) if v == ' ']

# Revisar si alguien ya ganó
def juego_terminado(tablero, jugador):
    return any(all(tablero[i]==jugador for i in linea) for linea in LINEAS_GANADORAS)

# Movimiento de la personita
def movimiento_personita(tablero, simbolo):
    while True:
        eleccion = input(f"Personita ({simbolo}), elige una casilla (1-9): ").strip()
        if not eleccion.isdigit():
            print("Ingresa un número válido del 1 al 9.")
            continue
        i = int(eleccion) - 1
        if i<0 or i>8:
            print("Número fuera de rango.")
            continue
        if tablero[i] != ' ':
            print("Casilla ocupada, elige otra.")
            continue
        return i

# Movimiento de la computadora (estrategia)
def movimiento_computadora(tablero, simbolo_pc, simbolo_persona):
    # a) Ganar si puede
    for m in casillas_libres(tablero):
        tablero[m] = simbolo_pc
        if juego_terminado(tablero, simbolo_pc):
            tablero[m] = ' '
            return m
        tablero[m] = ' '
    # b) Bloquear a la persona
    for m in casillas_libres(tablero):
        tablero[m] = simbolo_persona
        if juego_terminado(tablero, simbolo_persona):
            tablero[m] = ' '
            return m
        tablero[m] = ' '
    # c) Centro
    if tablero[4] == ' ':
        return 4
    # d) Esquinas
    esquinas = [i for i in (0,2,6,8) if tablero[i]==' ']
    if esquinas:
        return random.choice(esquinas)
    # e) Cualquier libre
    return random.choice(casillas_libres(tablero))

# -------- Juego principal --------

def jugar():
    # Elegir símbolo
    while True:
        simbolo_persona = input("¿Quieres jugar con X o con O? ").upper().strip()
        if simbolo_persona in ['X','O']:
            break
        print("Elige X o O, por favor.")

    simbolo_pc = 'O' if simbolo_persona == 'X' else 'X'

    # Marcadores
    marcador_persona = 0
    marcador_pc = 0

    # Bucle para jugar varias partidas
    while True:
        tablero = [' '] * 9
        turno = 'personita' if simbolo_persona == 'X' else 'computadora'
        ganador = None

        print("\n--- Nueva Partida ---")
        while True:
            mostrar_tablero(tablero)

            if turno == 'personita':
                mov = movimiento_personita(tablero, simbolo_persona)
                tablero[mov] = simbolo_persona
                if juego_terminado(tablero, simbolo_persona):
                    mostrar_tablero(tablero)
                    print("¡Felicidades Personita! Ganaste esta partida.")
                    marcador_persona += 1
                    ganador = 'personita'
                    break
                turno = 'computadora'
            else:
                mov = movimiento_computadora(tablero, simbolo_pc, simbolo_persona)
                tablero[mov] = simbolo_pc
                print(f"La computadora juega en {mov+1}")
                if juego_terminado(tablero, simbolo_pc):
                    mostrar_tablero(tablero)
                    print("¡Ups! La computadora ganó esta partida.")
                    marcador_pc += 1
                    ganador = 'computadora'
                    break
                turno = 'personita'

            if not casillas_libres(tablero):
                mostrar_tablero(tablero)
                print("Empate.")
                break

        # Mostrar marcador
        print(f"\nMarcador -> Personita: {marcador_persona} | Computadora: {marcador_pc}")

        # Preguntar si seguir o salir
        opcion = input("\n¿Quieres volver a jugar? (s/n): ").lower().strip()
        if opcion != 's':
            print("\nGracias por jugar. ¡Hasta luego!")
            break

# -------- Iniciar el programa --------
print("¡Bienvenido al juego de Gato!")
jugar()
