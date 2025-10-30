export class HillCipher {
  private readonly ALPHABET_SIZE = 26;

  generateKey(size: number = 2): number[][] {
    let matrix: number[][];
    let attempts = 0;
    const maxAttempts = 100;

    do {
      matrix = [];
      for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
          matrix[i][j] = Math.floor(Math.random() * this.ALPHABET_SIZE);
        }
      }
      attempts++;
    } while (!this.isInvertible(matrix) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback to a known invertible 2x2 matrix
      return [
        [3, 3],
        [2, 5],
      ];
    }

    return matrix;
  }

  keyToString(matrix: number[][]): string {
    return JSON.stringify(matrix);
  }

  stringToKey(keyString: string): number[][] {
    return JSON.parse(keyString);
  }

  private isInvertible(matrix: number[][]): boolean {
    const det = this.determinant(matrix);
    const detMod = ((det % this.ALPHABET_SIZE) + this.ALPHABET_SIZE) % this.ALPHABET_SIZE;
    return this.gcd(detMod, this.ALPHABET_SIZE) === 1;
  }

  private determinant(matrix: number[][]): number {
    const size = matrix.length;
    if (size === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    let det = 0;
    for (let j = 0; j < size; j++) {
      det += matrix[0][j] * this.cofactor(matrix, 0, j);
    }
    return det;
  }

  private cofactor(matrix: number[][], row: number, col: number): number {
    const minor = this.getMinor(matrix, row, col);
    return Math.pow(-1, row + col) * this.determinant(minor);
  }

  private getMinor(matrix: number[][], row: number, col: number): number[][] {
    return matrix
      .filter((_, i) => i !== row)
      .map((r) => r.filter((_, j) => j !== col));
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private modInverse(a: number, m: number): number {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) {
        return x;
      }
    }
    return 1;
  }

  private invertMatrix(matrix: number[][]): number[][] {
    const size = matrix.length;
    const det = this.determinant(matrix);
    const detMod = ((det % this.ALPHABET_SIZE) + this.ALPHABET_SIZE) % this.ALPHABET_SIZE;
    const detInv = this.modInverse(detMod, this.ALPHABET_SIZE);

    const adjugate: number[][] = [];
    for (let i = 0; i < size; i++) {
      adjugate[i] = [];
      for (let j = 0; j < size; j++) {
        const cofactor = this.cofactor(matrix, j, i);
        adjugate[i][j] =
          ((cofactor * detInv) % this.ALPHABET_SIZE + this.ALPHABET_SIZE) % this.ALPHABET_SIZE;
      }
    }

    return adjugate;
  }

  private multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
    return matrix.map((row) =>
      row.reduce((sum, val, i) => sum + val * vector[i], 0) % this.ALPHABET_SIZE
    );
  }

  encrypt(plaintext: string, keyMatrix: number[][]): string {
    const text = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
    const size = keyMatrix.length;
    let result = "";

    // Pad text if needed
    const paddedText = text + "X".repeat((size - (text.length % size)) % size);

    for (let i = 0; i < paddedText.length; i += size) {
      const block = paddedText
        .slice(i, i + size)
        .split("")
        .map((c) => c.charCodeAt(0) - 65);
      const encrypted = this.multiplyMatrixVector(keyMatrix, block);
      result += encrypted.map((n) => String.fromCharCode(n + 65)).join("");
    }

    return result;
  }

  decrypt(ciphertext: string, keyMatrix: number[][]): string {
    const inverseMatrix = this.invertMatrix(keyMatrix);
    return this.encrypt(ciphertext, inverseMatrix);
  }
}
