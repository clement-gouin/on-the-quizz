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
  submitText: "<i icon='send'></i> Submit",
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
  normalize(str) {
    return str
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },
  shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
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
          question.expected == null ||
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
    console.log("app mounted");
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
      // TODO
      const debugDataSplit = value.split("\n");
      let size = HELP_HEADER.length + HELP_PART.length;
      while (debugDataSplit.length > size) {
        size += HELP_PART.length;
      }
      const lines = Array(size).fill(0);
      this.editor.numbersText = debugDataSplit
        .map((_value, index) => `${index + 1}.`)
        .join("\n");
      this.editor.overlayText = lines
        .map((_value, index) => {
          if (
            debugDataSplit.length > index &&
            debugDataSplit[index].trim().length
          ) {
            return " ".repeat(debugDataSplit[index].length);
          }
          if (HELP_HEADER.length > index) {
            return HELP_HEADER[index];
          }
          return HELP_PART[(index - HELP_HEADER.length) % HELP_PART.length];
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
      this.parsed = DEFAULT_VALUES;
      this.answers = [];
      const parts = str.trim().split("\n");
      if (parts.length < 3) {
        return true;
      }
      this.parsed.header = parts.shift();
      if (!/<[^>]*>/.test(this.parsed.header)) {
        this.parsed.header = `<h1>${this.parsed.header}</h1>`;
      }
      this.parsed.successText = parts.shift();
      if (!/<[^>]*>/.test(this.parsed.successText)) {
        this.parsed.successText = `<h2>${this.parsed.successText}</h2>`;
      }
      this.parsed.failureText = parts.shift();
      if (!/<[^>]*>/.test(this.parsed.failureText)) {
        this.parsed.failureText = `<h2>${this.parsed.failureText}</h2>`;
      }
      if (parts.length && !/^\d+$/.test(parts[0])) {
        this.parsed.submitText = parts.shift();
      }
      if (parts.length && !/^\d+$/.test(parts[0])) {
        this.parsed.retryText = parts.shift();
      }
      while (parts.length) {
        if (!/^\d+$/.test(parts[0])) {
          parts.shift();
          continue;
        }
        let size = parseInt(parts.shift());
        const currentQuestion = {
          label: parts.shift(),
          answers: [],
          expected: null,
        };
        while (parts.length && size) {
          currentQuestion.answers.push(parts.shift());
          size--;
        }
        if (currentQuestion.answers.length) {
          currentQuestion.expected = currentQuestion.answers[0];
        }
        utils.shuffle(currentQuestion.answers);
        this.parsed.questions.push(currentQuestion);
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
