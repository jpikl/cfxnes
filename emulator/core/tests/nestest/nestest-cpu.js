var
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

import { DebugCPU } from "../../debug/debug-cpu";

export function NestestCPU() {
    return NestestCPU.__super__.constructor.apply(this, arguments);
}

extend(NestestCPU, DebugCPU);

NestestCPU.prototype.handleReset = function() {
    NestestCPU.__super__.handleReset.call(this);
    return this.programCounter = 0xC000;
};
