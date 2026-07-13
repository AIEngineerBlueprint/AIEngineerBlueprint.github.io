(function () {
  const storage = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch (error) {
        console.warn(`Unable to read ${key} from LocalStorage`, error);
        return fallback;
      }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };

  const state = {
    completed: storage.get("aieb.completed", {}),
    bookmarks: storage.get("aieb.bookmarks", {}),
    searchIndex: []
  };

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    storage.set("aieb.theme", theme);
  }

  function initTheme() {
    const saved = storage.get("aieb.theme", null);
    const preferred = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(saved || preferred);
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });
  }

  function initReadingTime() {
    const target = document.querySelector("[data-reading-time]");
    if (!target) return;
    const words = document.querySelector("main")?.textContent?.trim().split(/\s+/).length || 0;
    target.textContent = `${Math.max(1, Math.round(words / 220))} min read`;
  }

  function updateProgress() {
    const total = Number(document.body.dataset.totalChapters || 544);
    const completeCount = Object.keys(state.completed).length;
    const globalProgress = document.getElementById("globalProgress");
    if (globalProgress) globalProgress.textContent = `${Math.round((completeCount / total) * 100)}%`;
    document.querySelectorAll("[data-complete-status]").forEach((node) => {
      const id = node.getAttribute("data-complete-status");
      node.textContent = state.completed[id] ? "Completed" : "Not completed";
    });
    document.querySelectorAll("[data-section-progress]").forEach((node) => {
      const slug = node.getAttribute("data-section-progress");
      const count = Object.keys(state.completed).filter((id) => id.startsWith(`${slug}-`)).length;
      node.querySelector("span").style.width = `${Math.min(100, Math.round((count / 17) * 100))}%`;
    });
  }

  function initProgress() {
    document.querySelectorAll("[data-complete]").forEach((button) => {
      const id = button.getAttribute("data-complete");
      button.addEventListener("click", () => {
        state.completed[id] = new Date().toISOString();
        storage.set("aieb.completed", state.completed);
        updateProgress();
      });
    });
    updateProgress();
  }

  function initBookmarks() {
    document.querySelectorAll("[data-bookmark]").forEach((button) => {
      const id = button.getAttribute("data-bookmark");
      const refresh = () => { button.textContent = state.bookmarks[id] ? "Bookmarked" : "Bookmark"; };
      refresh();
      button.addEventListener("click", () => {
        if (state.bookmarks[id]) delete state.bookmarks[id];
        else state.bookmarks[id] = { title: document.body.dataset.pageTitle, url: location.pathname };
        storage.set("aieb.bookmarks", state.bookmarks);
        refresh();
      });
    });
    const list = document.getElementById("bookmarkList");
    if (list) {
      const bookmarks = Object.values(state.bookmarks);
      list.innerHTML = bookmarks.length
        ? bookmarks.map((item) => `<a class="chapter-card" href="${item.url}"><strong>${item.title}</strong><small>${item.url}</small></a>`).join("")
        : "<p>No bookmarks yet. Open a lesson and use the Bookmark button to save it here.</p>";
    }
  }

  function initQuiz() {
    document.querySelectorAll(".quiz").forEach((quiz) => {
      const result = quiz.querySelector(".quiz-result");
      quiz.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          const right = button.dataset.answer === "right";
          result.textContent = right ? "Correct. Production evaluation requires representative cases, failure cases, measurable signals, and review for high-risk flows." : "Not quite. A production system needs reproducible evidence, not vibes or post-launch hope.";
          result.className = `quiz-result ${right ? "right" : "wrong"}`;
        });
      });
    });
  }

  function initSimulator() {
    document.querySelectorAll("[data-sim-select]").forEach((select) => {
      const output = select.closest(".simulator").querySelector("[data-sim-output]");
      select.addEventListener("change", () => {
        output.textContent = output.dataset[select.value] || output.textContent;
      });
    });
  }

  function initDiagrams() {
    document.querySelectorAll(".expand-diagram").forEach((button) => {
      button.addEventListener("click", () => {
        const diagram = button.parentElement.querySelector(".diagram");
        diagram.classList.toggle("expanded");
        button.textContent = diagram.classList.contains("expanded") ? "Collapse diagram" : "Expand diagram";
      });
    });
  }

  async function loadSearch() {
    if (state.searchIndex.length) return state.searchIndex;
    const response = await fetch("/search-index.json");
    state.searchIndex = await response.json();
    return state.searchIndex;
  }

  function renderResults(results) {
    const box = document.getElementById("paletteResults");
    box.innerHTML = results.slice(0, 12).map((item) => `<a href="${item.url}"><strong>${item.title}</strong><small>${item.section || item.type}</small></a>`).join("") || "<p>No results found.</p>";
  }

  function initPalette() {
    const palette = document.getElementById("commandPalette");
    const input = document.getElementById("paletteInput");
    const open = async () => {
      palette.hidden = false;
      input.value = "";
      input.focus();
      renderResults((await loadSearch()).slice(0, 12));
    };
    const close = () => { palette.hidden = true; };
    document.getElementById("paletteButton")?.addEventListener("click", open);
    document.getElementById("homeSearchButton")?.addEventListener("click", open);
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") document.querySelector(".page-nav a:last-child")?.click();
      if (event.key === "ArrowLeft") document.querySelector(".page-nav a:first-child")?.click();
    });
    palette?.addEventListener("click", (event) => { if (event.target === palette) close(); });
    input?.addEventListener("input", async () => {
      const query = input.value.trim().toLowerCase();
      const index = await loadSearch();
      if (!query) return renderResults(index.slice(0, 12));
      const terms = query.split(/\s+/);
      renderResults(index
        .map((item) => ({ item, score: terms.reduce((sum, term) => sum + (`${item.title} ${item.section || ""} ${item.text}`.toLowerCase().includes(term) ? 1 : 0), 0) }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((row) => row.item));
    });
  }

  function initServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    }
  }

  initTheme();
  initReadingTime();
  initProgress();
  initBookmarks();
  initQuiz();
  initSimulator();
  initDiagrams();
  initPalette();
  initServiceWorker();
})();
