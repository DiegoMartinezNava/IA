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
    # Solo se puede ganar si ya se tienen al menos 3 números
    if len(jugador) < 3:
        return False
    # Se revisan todas las combinaciones posibles de 3 números
    return any(sum(c) == 15 for c in combinations(jugador, 3))

# Determinar si la partida terminó (victoria o empate por límites/disponibles)
def juego_terminado(personita, computadora, numeros_disponibles):
    # Alguien ganó
    if hay_ganador(personita) or hay_ganador(computadora):
        return True
    # Empate por alcanzar el tope de 3 por jugador sin ganador
    if len(personita) >= MAX_NUMEROS_POR_JUGADOR and len(computadora) >= MAX_NUMEROS_POR_JUGADOR:
        return True
    # Empate por quedarse sin números disponibles (por si cambias el tope)
    if not numeros_disponibles:
        return True
    return False

# Turno de la personita
def jugada_personita(numeros_disponibles):
    while True:
        try:
            eleccion = int(input("Elige un número disponible (1-9): "))
            # Revisamos que el número esté disponible
            if eleccion not in numeros_disponibles:
                print("Ese número no está disponible, intenta otro.")
                continue
            return eleccion
        except ValueError:
            # Controlamos que la personita escriba un número válido
            print("Debes ingresar un número válido.")

# Jugada de la computadora (estrategia básica)
def jugada_computadora(numeros_disponibles, personita, computadora):
    # a) Si puede ganar, lo hace
    for n in numeros_disponibles:
        if hay_ganador(computadora + [n]):
            return n
    # b) Si la personita puede ganar en el siguiente, bloqueo
    for n in numeros_disponibles:
        if hay_ganador(personita + [n]):
            return n
    # c) Si no hay peligro ni victoria inmediata, elije al azar
    return random.choice(numeros_disponibles)

# Preguntar si se desea volver a jugar
def preguntar_reintento():
    while True:
        r = input("¿Quieres volver a jugar? (s/n): ").strip().lower()
        if r in ('s', 'n'):
            return r == 's'
        print("Opción no válida. Escribe 's' para sí o 'n' para no.")

# Elegimos quién empieza (solo Personita o Computadora)
def elegir_quien_empieza():
    """
    Preguntamos quién inicia la partida:
    - 'p' -> empieza Personita
    - 'c' -> empieza la Computadora
    Regresamos 'personita' o 'computadora'.
    """
    while True:
        s = input("¿Quién empieza? (p=Personita, c=Computadora): ").strip().lower()
        if s in ('p', 'personita'):
            return 'personita'
        if s in ('c', 'computadora'):
            return 'computadora'
        print("Opción no válida. Escribe p o c.")

# -------- Juego principal --------

def jugar():
    # Marcadores globales
    marcador_persona = 0
    marcador_pc = 0
    marcador_empates = 0

    # Contador de partidas: incrementa solo cuando la personita decide jugar de nuevo
    contador_partidas = 0

    # Bucle de varias partidas
    while True:
        # --- Configuración inicial de cada nueva partida ---
        numeros_disponibles = list(range(1, 10))  # del 1 al 9
        personita = []   # Números de la personita
        computadora = [] # Números de la computadora

        # Preguntamos quién empieza para esta partida
        turno = elegir_quien_empieza()
        print(f"Empieza: {'Personita' if turno == 'personita' else 'Computadora'}")

        # Encabezado de partida: la primera no lleva número
        if contador_partidas == 0:
            print("\n--- Nueva Partida ---")
        else:
            print(f"\n--- Partida {contador_partidas + 1} ---")

        # --- Comienza la partida ---
        while True:
            mostrar_estado(numeros_disponibles, personita, computadora)

            # Turno de la personita (si no alcanzó el tope)
            if turno == "personita":
                if len(personita) < MAX_NUMEROS_POR_JUGADOR:
                    mov = jugada_personita(numeros_disponibles)
                    numeros_disponibles.remove(mov)
                    personita.append(mov)
                    # ¿Ganó la personita?
                    if hay_ganador(personita):
                        mostrar_estado(numeros_disponibles, personita, computadora)
                        print("¡Felicidades Personita! Ganaste esta partida.")
                        marcador_persona += 1
                        break
                # Ceder turno
                turno = "computadora"

            # Turno de la computadora (si no alcanzó el tope)
            else:
                if len(computadora) < MAX_NUMEROS_POR_JUGADOR:
                    mov = jugada_computadora(numeros_disponibles, personita, computadora)
                    numeros_disponibles.remove(mov)
                    computadora.append(mov)
                    print(f"La computadora eligió el {mov}")
                    # ¿Ganó la computadora?
                    if hay_ganador(computadora):
                        mostrar_estado(numeros_disponibles, personita, computadora)
                        print("¡Ups! La computadora ganó esta partida.")
                        marcador_pc += 1
                        break
                # Ceder turno
                turno = "personita"

            # ¿Se terminó la partida por empate o recursos?
            if juego_terminado(personita, computadora, numeros_disponibles):
                # Si nadie ganó explícitamente, es empate
                if not hay_ganador(personita) and not hay_ganador(computadora):
                    mostrar_estado(numeros_disponibles, personita, computadora)
                    print("Empate: se alcanzó el límite o ya no hay números disponibles.")
                    marcador_empates += 1
                break

        # Calcular cuántas partidas van jugadas (contando la primera como 1)
        partidas_jugadas = contador_partidas + 1

        # Mostrar marcador (incluyendo empates y partidas jugadas)
        print(f"\nMarcador -> Personita: {marcador_persona} | Computadora: {marcador_pc} | Empates: {marcador_empates} | Partidas jugadas = {partidas_jugadas}")

        # Preguntar si seguir o salir (si dice que sí, volvemos a elegir quién inicia)
        if not preguntar_reintento():
            print("\nGracias por jugar. ¡Hasta luego!")
            break

        # Si la personita decide jugar de nuevo, incrementamos el contador de partidas
        contador_partidas += 1

# -------- Iniciar el programa --------
print("¡Bienvenido al Juego del 15!")
print(f"Reglas: Toman números del 1 al 9, gana quien junte 3 que sumen 15. (Máximo {MAX_NUMEROS_POR_JUGADOR} por jugador)\n")
jugar()
