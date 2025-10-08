# JUEGO DE NIM
# Personita vs Computadora
# VARIANTE: PIERDE QUIEN TOMA LA ÚLTIMA FICHA (misère)

import sys

# -------- Funciones del juego --------

# Mostrar cuántas fichas quedan
def mostrar_monton(monton):
    print(f"\nFichas restantes: {monton}")

# Jugada de la computadora (estrategia misère)
def jugada_computadora(monton, limite_por_turno):
    # En la variante misère de una sola pila:
    # P-positions: monton ≡ 1 (mod limite+1)
    # Estrategia: intentar dejar (limite+1)*k + 1
    m = limite_por_turno + 1
    objetivo = (monton - 1) % m
    if objetivo == 0:
        quitar = 1  # no hay jugada ganadora, tomamos 1
    else:
        quitar = objetivo
    quitar = max(1, min(quitar, min(limite_por_turno, monton)))
    monton -= quitar
    print(f"La computadora quita {quitar} ficha(s)")
    return monton

# Revisar si el juego terminó (sin decidir ganador)
def juego_terminado(monton):
    return monton == 0

# Turno de la personita
def jugada_personita(monton, limite_por_turno):
    while True:
        try:
            fichas = int(input(f"Personita, ¿cuántas fichas quieres quitar? (1 a {min(limite_por_turno, monton)}): "))
            if 1 <= fichas <= min(limite_por_turno, monton):
                monton -= fichas
                return monton
            else:
                print("Movimiento inválido, intenta de nuevo.")
        except ValueError:
            print("Debes ingresar un número válido.")

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
    # Marcadores
    marcador_persona = 0
    marcador_pc = 0
    marcador_empates = 0  # En Nim misère de una pila no hay empates; quedará en 0.

    # Contador de partidas: la primera no se numera en el encabezado
    contador_partidas = 0  # incrementa solo cuando la personita decide jugar de nuevo

    # Bucle de varias partidas
    while True:
        # --- Configuración inicial (monton y límite) en cada nueva partida ---
        while True:
            try:
                monton = int(input("Elige el tamaño del montón (100-999): "))
                if 100 <= monton <= 999:
                    break
                else:
                    print("El montón debe ser un número de 3 dígitos entre 100 y 999.")
            except ValueError:
                print("Debes ingresar un número válido.")

        while True:
            try:
                limite_por_turno = int(input("Elige el límite máximo de fichas por turno: "))
                if 1 < limite_por_turno < monton:
                    if limite_por_turno > monton * 0.7:
                        print("Advertencia: el límite es demasiado cercano al montón, la partida podría ser aburrida.")
                    break
                else:
                    print("El límite debe ser menor que el montón y mayor a 1.")
            except ValueError:
                print("Debes ingresar un número válido.")

        # --- Elegimos quién empieza para esta nueva partida ---
        turno = elegir_quien_empieza()
        print(f"Empieza: {'Personita' if turno == 'personita' else 'Computadora'}")
        print("Regla: PIERDE quien toma la ÚLTIMA ficha.")

        # Encabezado de partida: la primera no lleva número
        if contador_partidas == 0:
            print("\n--- Nueva Partida ---")
        else:
            print(f"\n--- Partida {contador_partidas+1} ---")

        # --- Comienza la partida ---
        fichas_restantes = monton
        while True:
            mostrar_monton(fichas_restantes)

            if turno == 'personita':
                # Turno de la personita
                fichas_restantes = jugada_personita(fichas_restantes, limite_por_turno)
                if juego_terminado(fichas_restantes):
                    # En misère: quien tomó la última ficha PIERDE
                    mostrar_monton(fichas_restantes)
                    print("Tomaste la última ficha... ¡pierdes esta partida!")
                    print("La computadora gana esta partida.")
                    marcador_pc += 1
                    break
                turno = 'computadora'
            else:
                # Turno de la computadora
                fichas_restantes = jugada_computadora(fichas_restantes, limite_por_turno)
                if juego_terminado(fichas_restantes):
                    # En misère: quien tomó la última ficha PIERDE
                    mostrar_monton(fichas_restantes)
                    print("La computadora tomó la última ficha... ¡pierde esta partida!")
                    print("¡Felicidades Personita! Ganaste esta partida.")
                    marcador_persona += 1
                    break
                turno = 'personita'

            # En Nim misère de una sola pila no existe condición de empate: alguien siempre toma la última ficha.

        # Calcular cuántas partidas van jugadas (contando la primera como 1)
        partidas_jugadas = contador_partidas + 1

        # Mostrar marcador (incluyendo empates y partidas jugadas)
        print(f"\nMarcador -> Personita: {marcador_persona} | Computadora: {marcador_pc} | Empates: {marcador_empates} | Partidas jugadas = {partidas_jugadas}")

        # Preguntar si seguir o salir
        opcion = input("\n¿Quieres volver a jugar? (s/n): ").lower().strip()
        if opcion != 's':
            print("\nGracias por jugar. ¡Hasta luego!")
            break

        # Si la personita decide jugar de nuevo, incrementamos el contador de partidas
        contador_partidas += 1

# -------- Iniciar el programa --------
print("¡Bienvenido al juego de Nim!")
jugar()
