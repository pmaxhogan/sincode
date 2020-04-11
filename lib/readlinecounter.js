const readline = require("readline");

class ReadlineCounter{
    constructor(total){
        this.total = total;
    }

    update(numDone) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);
        process.stdout.write(numDone + "/" + this.total);
    }
}

exports.ReadlineCounter = ReadlineCounter;
