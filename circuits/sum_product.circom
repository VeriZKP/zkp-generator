pragma circom 2.0.0;

template SumProduct() {
    // Declaration of signals.
    signal input a;
    signal input b;
    
    signal output sum;
    signal output product;

    // Force witness ordering
    a * 1 === a;
    b * 1 === b;
    sum <== a + b;
    product <== a * b;
}

component main = SumProduct();
