#include "circom.hpp"
#include "calcwit.hpp"
#define NSignals 3
#define NComponents 1
#define NOutputs 1
#define NInputs 1
#define NVars 3
#define NPublic 2
#define __P__ "21888242871839275222246405745257275088548364400416034343698204186575808495617"

/*
PositionCheck
*/
void PositionCheck_af0d9e777d49c95a(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    int _position_sigIdx_;
    int _isValid_sigIdx_;
    _position_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x4cbf3a26fca1d74aLL /* position */);
    _isValid_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x645a3bc684679a41LL /* isValid */);
    /* signal input position */
    /* signal output isValid */
    /* isValid <== position */
    ctx->multiGetSignal(__cIdx, __cIdx, _position_sigIdx_, _sigValue, 1);
    ctx->setSignal(__cIdx, __cIdx, _isValid_sigIdx_, _sigValue);
    ctx->finished(__cIdx);
}
// Function Table
Circom_ComponentFunction _functionTable[1] = {
     PositionCheck_af0d9e777d49c95a
};
