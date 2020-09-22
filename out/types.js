"use strict";
// TODO: dont let this be a copy of the types.ts of the hoo-kit repo
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopStrategy = exports.TaskRetriggerStrategy = void 0;
var TaskRetriggerStrategy;
(function (TaskRetriggerStrategy) {
    TaskRetriggerStrategy["Restart"] = "restart";
    TaskRetriggerStrategy["Add"] = "add";
})(TaskRetriggerStrategy = exports.TaskRetriggerStrategy || (exports.TaskRetriggerStrategy = {}));
var StopStrategy;
(function (StopStrategy) {
    StopStrategy["All"] = "all";
    StopStrategy["Oldest"] = "oldest";
    StopStrategy["Newest"] = "newest";
})(StopStrategy = exports.StopStrategy || (exports.StopStrategy = {}));
//# sourceMappingURL=types.js.map