"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSpeech = useSpeech;
var react_1 = require("react");
function useSpeech() {
    var recognitionRef = (0, react_1.useRef)(null);
    var _a = (0, react_1.useState)("idle"), status = _a[0], setStatus = _a[1];
    var _b = (0, react_1.useState)(""), transcript = _b[0], setTranscript = _b[1];
    (0, react_1.useEffect)(function () {
        var SpeechRecognition = window.SpeechRecognition ||
            window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus("unsupported");
            return;
        }
        var recognition = new SpeechRecognition();
        recognition.lang = "it-IT";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onstart = function () { return setStatus("listening"); };
        recognition.onend = function () { return setStatus("idle"); };
        recognition.onresult = function (event) {
            var text = event.results[0][0].transcript;
            setTranscript(text);
        };
        recognitionRef.current = recognition;
    }, []);
    function start() {
        if (recognitionRef.current && status !== "listening") {
            setTranscript("");
            recognitionRef.current.start();
        }
    }
    function stop() {
        var _a;
        (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop();
    }
    return { transcript: transcript, status: status, start: start, stop: stop };
}
