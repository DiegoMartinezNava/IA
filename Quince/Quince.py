# Importamos librerías necesarias para manejar el tablero
# y crear copias sin afectar el original.
from copy import deepcopy
import random
from typing import List, Tuple

# Definimos el estado objetivo con los números del 1 al 15
# y dejamos el 0 como espacio vacío.
GOAL: List[List[int]] = [
    [1,  2,  3,  4],
    [5,  6,  7,  8],
    [9, 10, 11, 12],
    [13,14, 15, 0]
]

# Creamos un alias de tipo para representar al tablero.
Board = List[List[int]]

# Creamos funciones para convertir de una lista plana (16 elementos)
# a un tablero 4x4 y viceversa, ya que así podremos barajar más fácil.
def from_flat(flat: List[int]) -> Board:
    assert len(flat) == 16, "Necesitamos 16 elementos para el tablero 4x4"
    return [flat[i:i+4] for i in range(0, 16, 4)]

def to_flat(board: Board) -> List[int]:
    return [x for row in board for x in row]

# Agregamos una función para imprimir el tablero en consola
# de forma ordenada y con un guion bajo donde está el espacio vacío.
def print_board(board: Board) -> None:
    for row in board:
        print(" ".join(f"{v:2d}" if v != 0 else " _" for v in row))
    print()

# Creamos una función para localizar rápidamente la posición del hueco (0)
# ya que la necesitaremos para mover las fichas.
def find_zero(board: Board) -> Tuple[int, int]:
    for i in range(4):
        for j in range(4):
            if board[i][j] == 0:
                return i, j
    raise ValueError("El tablero no contiene hueco (0)")

# Agregamos una función que nos permitirá generar un tablero barajado.
# Más adelante implementaremos la verificación de si es resoluble.
def shuffled_board() -> Board:
    flat = list(range(16))
    random.shuffle(flat)
    return from_flat(flat)

# Punto de entrada del programa.
# Aquí solo mostramos un tablero inicial para probar.
if __name__ == "__main__":
    board = shuffled_board()
    print("Tablero inicial generado:")
    print_board(board)
