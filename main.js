/* exported app */

let app = {
  data() {
    return {
      debug: true,
      debugData:
        "My Quizz\n<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>\nTry again !\n0\nThis is a <b>label</b>\n1\nThis a text input (answer: answer)\nanswer\n2\nThis is a multi-choice input\nright\nwrong",
      readonly: false,
      header: "",
      successText: "",
      failureText: "",
      questions: [],
    };
  },
  computed: {
    debugUrl() {
      return window.location.pathname + "?z=" + this.encodeData(this.debugData);
    },
    success() {
      const self = this;
      return this.questions.every(
        (q) =>
          q.expected == null ||
          (q.answers.length === 1 &&
            self.normalize(q.value).includes(self.normalize(q.expected))) ||
          q.value === q.expected
      );
    },
  },
  watch: {
    debugData(value) {
      this.readZData(value);
    },
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    submit() {
      this.readonly = true;
    },
    retry() {
      this.readonly = false;
      this.questions.forEach((question) => {
        question.value = "";
      });
    },
    base64URLTobase64(str) {
      const base64Encoded = str.replace(/-/g, "+").replace(/_/g, "/");
      const padding =
        str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
      return base64Encoded + padding;
    },
    base64tobase64URL(str) {
      return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    },
    decodeData(str) {
      return LZString.decompressFromBase64(
        this.base64URLTobase64(str.split("").reverse().join(""))
      );
    },
    encodeData(str) {
      return this.base64tobase64URL(LZString.compressToBase64(str))
        .split("")
        .reverse()
        .join("");
    },
    shuffle(array) {
      let currentIndex = array.length;
      while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }
    },
    normalize(str) {
      return str
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    },
    readZData(str) {
      this.debugData = str;
      const parts = str.trim().split("\n");
      if (parts.length < 3) {
        return true;
      }
      this.header = parts.shift();
      if (!/<[^>]*>/.test(this.header)) {
        this.header = `<h1>${this.header}</h1>`;
      }
      this.successText = parts.shift();
      if (!/<[^>]*>/.test(this.successText)) {
        this.successText = `<h2>${this.successText}</h2>`;
      }
      this.failureText = parts.shift();
      if (!/<[^>]*>/.test(this.failureText)) {
        this.failureText = `<h2>${this.failureText}</h2>`;
      }
      this.questions = [];
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
          value: "",
        };
        while (parts.length && size) {
          currentQuestion.answers.push(parts.shift());
          size--;
        }
        if (currentQuestion.answers.length) {
          currentQuestion.expected = currentQuestion.answers[0];
        }
        this.shuffle(currentQuestion.answers);
        this.questions.push(currentQuestion);
      }
      return false;
    },
    initApp() {
      const url = new URL(window.location);
      if (url.searchParams.get("z") !== null) {
        this.debug = this.readZData(this.decodeData(url.searchParams.get("z")));
      }
      if (this.debug) {
        this.readZData(this.debugData);
      }
    },
  },
  beforeMount: function () {
    this.initApp();
  },
  mounted: function () {
    console.log("app mounted");
    setTimeout(this.showApp);
  },
};

window.onload = () => {
  app = Vue.createApp(app);
  app.mount("#app");
};
