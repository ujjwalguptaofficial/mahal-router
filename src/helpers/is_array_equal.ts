export const isArrayEqual = (value1: any[], value2: any[]) => {
    if (value1.length != value2.length) {
        return false;
    }

    for (var i = 0, length = value1.length; i < length; i++) {
        if (value2[i] != value1[i]) return false;
    }
    return true;

}