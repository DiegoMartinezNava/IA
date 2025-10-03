# JUEGO DE NIM
# Personita vs Computadora

import sys

# -------- Funciones del juego --------

# Mostrar cuántas fichas quedan
def mostrar_monton(monton):
    print(f"\nFichas restantes: {monton}")

# Jugada de la computadora (estrategia)
def jugada_computadora(monton, limite_por_turno):
    # La estrategia es dejar múltiplos de (limite+1)
    objetivo = monton % (limite_por_turno + 1)
    if objetivo == 0:
        quitar = 1
    else:
        quitar = objetivo
    monton -= quitar
    print(f"La computadora quita {quitar} ficha(s)")
    return monton

# Revisar si el juego terminó
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

# -------- Juego principal --------

def jugar():
    # Marcadores
    marcador_persona = 0
    marcador_pc = 0

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

        # --- Comienza la partida ---
        fichas_restantes = monton
        print("\n--- Nueva Partida ---")
        while True:
            mostrar_monton(fichas_restantes)

            # Turno de la personita
            fichas_restantes = jugada_personita(fichas_restantes, limite_por_turno)
            if juego_terminado(fichas_restantes):
                mostrar_monton(fichas_restantes)
                print("¡Felicidades Personita! Ganaste esta partida.")
                marcador_persona += 1
                break

            # Turno de la computadora
            fichas_restantes = jugada_computadora(fichas_restantes, limite_por_turno)
            if juego_terminado(fichas_restantes):
                mostrar_monton(fichas_restantes)
                print("¡Ups! La computadora ganó esta partida.")
                marcador_pc += 1
                break

        # Mostrar marcador
        print(f"\nMarcador -> Personita: {marcador_persona} | Computadora: {marcador_pc}")

        # Preguntar si seguir o salir
        opcion = input("\n¿Quieres volver a jugar? (s/n): ").lower().strip()
        if opcion != 's':
            print("\nGracias por jugar. ¡Hasta luego!")
            break

# -------- Iniciar el programa --------
print("¡Bienvenido al juego de Nim!")
jugar()
