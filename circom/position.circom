template PositionCheck() {
    signal input position;
    signal output isValid;

    isValid <== position;
}

component main = PositionCheck();