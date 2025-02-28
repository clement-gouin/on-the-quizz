import { createApp } from "vue";

const HELP_HEADER = [
  "Quizz name (html, <h1> on plain text)",
  "Correct answer (html, <h2> on plain text)",
  "Incorrect answer (html, <h2> on plain text)",
  "Submit button text (html, optional)",
  "Retry button text (html, optional)",
];
const HELP_PART = [
  "Number of choices (0+)",
  "Label (html)",
  "Correct choice",
  "Incorrect choices",
];
const DEFAULT_VALUES = {
  header: "",
  successText: "",
  failureText: "",
  hasSubmitText: true,
  submitText: "<i icon='send'></i> Submit",
  hasRetryText: true,
  retryText: "<i icon='rotate-ccw'></i> Retry",
  questions: [],
};

const utils = {
  base64URLTobase64(str) {
    const base64Encoded = str.replace(/-/gu, "+").replace(/_/gu, "/");
    const padding =
      str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    return base64Encoded + padding;
  },
  base64tobase64URL(str) {
    return str.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/[=]+$/u, "");
  },
  decodeData(str) {
    return LZString.decompressFromBase64(
      utils.base64URLTobase64(str.split("").reverse().join(""))
    );
  },
  encodeData(str) {
    return utils
      .base64tobase64URL(LZString.compressToBase64(str))
      .split("")
      .reverse()
      .join("");
  },
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  normalize(str) {
    return str
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/gu, "")
      .toLowerCase();
  },
  shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  },
};

const app = createApp({
  data() {
    return {
      debug: true,
      debugData:
        "My Quizz\n<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>\nTry again !\n0\nThis is a <b>label</b>\n1\nThis a text input (answer: answer)\nanswer\n2\nThis is a multi-choice input\nright\nwrong",
      debugUrl: "",
      editor: {
        numbersCols: 0,
        numbersText: "",
        overlayText: "",
      },
      parsed: DEFAULT_VALUES,
      answers: [],
      readonly: false,
    };
  },
  computed: {
    success() {
      return this.parsed.questions.every(
        (question, index) =>
          question.expected === null ||
          (question.answers.length === 1 &&
            utils
              .normalize(this.answers[index])
              .includes(utils.normalize(question.expected))) ||
          this.answers[index] === question.expected
      );
    },
  },
  watch: {
    debugData(value) {
      this.readZData(value);
      this.updateEditor(value);
      this.updateDebugUrl(value);
    },
  },
  beforeMount() {
    this.initApp();
  },
  mounted() {
    setTimeout(this.showApp);
    this.updateIcons();
  },
  updated() {
    this.updateIcons();
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    initApp() {
      const url = new URL(window.location);
      if (url.searchParams.get("z") !== null) {
        this.debug = this.readZData(
          utils.decodeData(url.searchParams.get("z"))
        );
      }
      if (this.debug) {
        this.readZData(this.debugData);
        this.updateEditor(this.debugData);
        this.updateDebugUrl(this.debugData);
      }
    },
    updateIcons() {
      lucide.createIcons({
        nameAttr: "icon",
        attrs: {
          width: "1.1em",
          height: "1.1em",
        },
      });
    },
    updateDebugUrl(value) {
      this.debugUrl = value.trim().length
        ? `${window.location.pathname}?z=${utils.encodeData(value.trim())}`
        : "";
    },
    updateEditor(value) {
      const debugDataSplit = value.split("\n");
      const headerSize =
        HELP_HEADER.length -
        (this.parsed.hasSubmitText ? 0 : 1) -
        (this.parsed.hasRetryText ? 0 : 1);
      let size = headerSize + HELP_PART.length;
      if (this.parsed.questions.length) {
        size = this.parsed.questions.reduce(
          (sum, question) => sum + question.size + 2,
          headerSize
        );
      }
      while (debugDataSplit.length > size) {
        size += HELP_PART.length;
      }
      const lines = Array(size).fill(0);
      let currentQestionIndex = 0;
      let questionStartIndex = headerSize;
      this.editor.numbersText = debugDataSplit
        .map((_value, index) => `${index + 1}.`)
        .join("\n");
      this.editor.overlayText = lines
        .map((_value, index) => {
          if (
            headerSize <= index &&
            this.parsed.questions.length > currentQestionIndex &&
            index >
              questionStartIndex +
                this.parsed.questions[currentQestionIndex].size +
                1 &&
            (debugDataSplit.length <= index ||
              debugDataSplit[index].trim().length === 0 ||
              /^\d+$/u.test(debugDataSplit[index]))
          ) {
            currentQestionIndex += 1;
            questionStartIndex = index;
          }
          if (
            debugDataSplit.length > index &&
            debugDataSplit[index].trim().length
          ) {
            return " ".repeat(debugDataSplit[index].length);
          }
          if (headerSize > index) {
            return HELP_HEADER[index];
          }
          return HELP_PART[
            Math.min(HELP_PART.length - 1, index - questionStartIndex)
          ];
        })
        .join("\n");
      this.editor.numbersCols = lines.length.toString().length + 1;
    },
    editorScroll() {
      this.$refs.numbers.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollLeft = this.$refs.code.scrollLeft;
    },
    readZData(str) {
      this.debugData = str;
      this.parsed = utils.clone(DEFAULT_VALUES);
      this.answers = [];
      const parts = str.split("\n");
      if (parts.length < 3) {
        return true;
      }
      this.parsed.header = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.header)) {
        this.parsed.header = `<h1>${this.parsed.header}</h1>`;
      }
      this.parsed.successText = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.successText)) {
        this.parsed.successText = `<h2>${this.parsed.successText}</h2>`;
      }
      this.parsed.failureText = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.failureText)) {
        this.parsed.failureText = `<h2>${this.parsed.failureText}</h2>`;
      }
      if (parts.length && !/^\d+$/u.test(parts[0])) {
        this.parsed.submitText = parts.shift();
      } else {
        this.parsed.hasSubmitText = !parts.length || !parts[0].length;
      }
      if (parts.length && !/^\d+$/u.test(parts[0])) {
        this.parsed.retryText = parts.shift();
      } else {
        this.parsed.hasRetryText = !parts.length || !parts[0].length;
      }
      while (parts.length) {
        const line = parts.shift();
        if (/^\d+$/u.test(line)) {
          let size = parseInt(line, 10);
          const currentQuestion = {
            label: parts.shift(),
            size,
            answers: [],
            expected: null,
          };
          while (parts.length && size) {
            currentQuestion.answers.push(parts.shift());
            size -= 1;
          }
          if (currentQuestion.answers.length) {
            [currentQuestion.expected] = currentQuestion.answers;
          }
          utils.shuffle(currentQuestion.answers);
          this.parsed.questions.push(currentQuestion);
        }
      }
      this.answers = this.parsed.questions.map(() => "");
      return false;
    },
    submit() {
      this.readonly = true;
    },
    retry() {
      this.readonly = false;
      this.answers = this.parsed.questions.map(() => "");
    },
  },
});

window.onload = () => {
  app.mount("#app");
};
