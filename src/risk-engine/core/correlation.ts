import { Matrix, CholeskyDecomposition } from 'ml-matrix';

export function generateCorrelatedShocks(
    correlationMatrix: number[][],
    shocks: number[]
): number[] {
    const L = new CholeskyDecomposition(new Matrix(correlationMatrix))
        .lowerTriangularMatrix;

    return L.mmul(Matrix.columnVector(shocks)).to1DArray();
}
