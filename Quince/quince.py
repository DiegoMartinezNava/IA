# Juego del 15
# Personita vs Computadora
# Gana quien junte 3 números distintos del 1 al 9 que sumen exactamente 15

import random
from itertools import combinations

# -------- Configuración / Constantes --------

# Guardamos todas las combinaciones ganadoras (tríos que suman 15)
COMBINACIONES_GANADORAS = [
    (1, 5, 9), (1, 6, 8), (2, 4, 9), (2, 5, 8), (2, 6, 7),
    (3, 4, 8), (3, 5, 7), (4, 5, 6)
]

# Límite de números por jugador (para que no se puedan escoger más de 3)
MAX_NUMEROS_POR_JUGADOR = 3

# -------- Funciones del juego --------

# Mostrar estado: disponibles y números de cada jugador
def mostrar_estado(numeros_disponibles, personita, computadora):
    print(f"\nNúmeros disponibles: {numeros_disponibles}")
    print(f"Tus números: {personita}")
    print(f"Números de la computadora: {computadora}")

# Revisar si un jugador ya ganó (algún trío suma 15)
def hay_ganador(jugador):
    if len(jugador) < 3:
        return False
    return any(sum(c) == 15 for c in combinations(jugador, 3))

# Determinar si la partida terminó (victoria o empate por límites/disponibles)
def juego_terminado(personita, computadora, numeros_disponibles):
    if hay_ganador(personita) or hay_ganador(computadora):
        return True
    if len(personita) >= MAX_NUMEROS_POR_JUGADOR and len(computadora) >= MAX_NUMEROS_POR_JUGADOR:
        return True
    if not numeros_disponibles:
        return True
    return False

# Turno de la personita
def jugada_personita(numeros_disponibles):
    while True:
        try:
            eleccion = int(input("Elige un número disponible (1-9): "))
            if eleccion not in numeros_disponibles:
                print("Ese número no está disponible, intenta otro.")
                continue
            return eleccion
        except ValueError:
            print("Debes ingresar un número válido.")

# Jugada de la computadora (estrategia básica)
def jugada_computadora(numeros_disponibles, personita, computadora):
    for n in numeros_disponibles:
        if hay_ganador(computadora + [n]):
            return n
    for n in numeros_disponibles:
        if hay_ganador(personita + [n]):
            return n
    return random.choice(numeros_disponibles)

# Preguntar si se desea volver a jugar
def preguntar_reintento():
    while True:
        r = input("¿Quieres volver a jugar? (s/n): ").strip().lower()
        if r in ('s', 'n'):
            return r == 's'
        print("Opción no válida. Escribe 's' para sí o 'n' para no.")

# -------- Juego principal --------

def jugar():
    # Marcadores globales
    marcador_persona = 0
    marcador_pc = 0

    # Bucle de varias partidas
    while True:
        numeros_disponibles = list(range(1, 10))
        personita = []
        computadora = []
        turno = "personita"

        print("\n--- Nueva Partida ---")
        while True:
            mostrar_estado(numeros_disponibles, personita, computadora)

            if turno == "personita":
                if len(personita) < MAX_NUMEROS_POR_JUGADOR:
                    mov = jugada_personita(numeros_disponibles)
                    numeros_disponibles.remove(mov)
                    personita.append(mov)
                    if hay_ganador(personita):
                        mostrar_estado(numeros_disponibles, personita, computadora)
                        print("¡Felicidades Personita! Ganaste esta partida.")
                        marcador_persona += 1
                        break
                turno = "computadora"

            else:
                if len(computadora) < MAX_NUMEROS_POR_JUGADOR:
                    mov = jugada_computadora(numeros_disponibles, personita, computadora)
                    numeros_disponibles.remove(mov)
                    computadora.append(mov)
                    print(f"La computadora eligió el {mov}")
                    if hay_ganador(computadora):
                        mostrar_estado(numeros_disponibles, personita, computadora)
                        print("¡Ups! La computadora ganó esta partida.")
                        marcador_pc += 1
                        break
                turno = "personita"

            if juego_terminado(personita, computadora, numeros_disponibles):
                if not hay_ganador(personita) and not hay_ganador(computadora):
                    mostrar_estado(numeros_disponibles, personita, computadora)
                    print("Empate: se alcanzó el límite o ya no hay números disponibles.")
                break

        # Mostrar marcador
        print(f"\nMarcador -> Personita: {marcador_persona} | Computadora: {marcador_pc}")

        # Preguntar si seguir o salir
        if not preguntar_reintento():
            print("\nGracias por jugar. ¡Hasta luego!")
            break

# -------- Iniciar el programa --------
print("¡Bienvenido al Juego del 15!")
print(f"Reglas: Toman números del 1 al 9, gana quien junte 3 que sumen 15. (Máximo {MAX_NUMEROS_POR_JUGADOR} por jugador)\n")
jugar()
