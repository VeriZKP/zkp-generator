pragma circom 2.0.0;
include "lib/circomlib/circuits/poseidon.circom";

template VerifyStudent() {
    signal input studentHash;   // Student's hashed ID (field element)
    signal input validHash;     // Precomputed valid hash (field element)
    
    signal output isValid;

    isValid <== 1 - (studentHash - validHash) * (studentHash - validHash);

}

component main = VerifyStudent();