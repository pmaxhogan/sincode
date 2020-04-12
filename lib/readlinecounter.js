const readline = require("readline");
const style = require("ansi-styles");
const ansiEscapes = require("ansi-escapes");

const NS_PER_SEC = 1e9;

class ReadlineCounter{
    constructor(total){
        this.total = total;
        this.lastUpdateTime = process.hrtime.bigint();
    }

    update(numDone) {
        const now = process.hrtime.bigint();
        if((now - this.lastUpdateTime) > (NS_PER_SEC * .1)){// 100ms update freq
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0, null);

            const beginStr = ansiEscapes.cursorHide + style.inverse.open;
            let str = numDone + "/" + this.total;
            str += " ".repeat(process.stdout.columns - str.length);

            const sliceIdx = Math.round(numDone / this.total * process.stdout.columns);

            process.stdout.write(beginStr + str.slice(0, sliceIdx) + style.inverse.close + str.slice(sliceIdx));
            this.lastUpdateTime = now;
        }

        if(numDone === this.total) this.done();
    }

    done(){
        process.stdout.write(ansiEscapes.cursorShow);
    }
}

exports.ReadlineCounter = ReadlineCounter;
