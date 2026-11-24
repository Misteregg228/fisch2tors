const helpWidget = document.querySelector("#help-widget");
const helpButton = document.querySelector("#help-button");
const helpPanel = document.querySelector("#fisch-info");
const closeHelp = () => {
  helpWidget.classList.remove("is-open");
  helpButton.setAttribute("aria-expanded", "false");
  helpPanel.setAttribute("aria-hidden", "true");
};
helpButton.addEventListener("click", () => {
  const isOpen = helpWidget.classList.toggle("is-open");
  helpButton.setAttribute("aria-expanded", String(isOpen));
  helpPanel.setAttribute("aria-hidden", String(!isOpen));
});
document.querySelector("#help-close").addEventListener("click", closeHelp);
document.addEventListener("pointerdown", (event) => {
  if (!helpWidget.contains(event.target)) closeHelp();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeHelp();
});

// Optional integrations are enabled after their public site code/access key is configured.
const GOATCOUNTER_SITE_CODE = "";
if (GOATCOUNTER_SITE_CODE) {
  const tracker = document.createElement("script");
  tracker.async = true;
  tracker.src = "https://gc.zgo.at/count.js";
  tracker.dataset.goatcounter = `https://${GOATCOUNTER_SITE_CODE}.goatcounter.com/count`;
  document.head.append(tracker);
}

const feedbackForm = document.querySelector("#feedback-form");
if (feedbackForm) {
  const WEB3FORMS_ACCESS_KEY = "";
  const feedbackFields = feedbackForm.querySelectorAll("input, textarea, button[type=submit]");
  const feedbackStatus = document.querySelector("#feedback-status");
  if (WEB3FORMS_ACCESS_KEY) {
    feedbackFields.forEach((field) => { field.disabled = false; });
    feedbackStatus.textContent = "Сообщение отправится мне через Web3Forms.";
    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = feedbackForm.querySelector("button[type=submit]");
      const payload = new FormData(feedbackForm);
      payload.set("access_key", WEB3FORMS_ACCESS_KEY);
      payload.set("subject", "Отзыв с Fisch2tors");
      payload.set("from_name", "Fisch2tors");
      payload.set("botcheck", "");
      submitButton.disabled = true;
      feedbackStatus.textContent = "Отправляю сообщение…";
      try {
        const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: payload });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error("submission failed");
        feedbackForm.reset();
        feedbackStatus.textContent = "Спасибо! Сообщение отправлено.";
      } catch {
        feedbackStatus.textContent = "Не получилось отправить сообщение. Попробуй ещё раз позже.";
      } finally {
        submitButton.disabled = false;
      }
    });
  }
}

const guideSearch = document.querySelector("#guide-search");
if (guideSearch) {
  const input = document.querySelector("#guide-query");
  const suggestions = document.querySelector("#search-suggestions");
  const status = document.querySelector("#search-status");
  let activeIndex = -1;
  let visibleResults = [];

  const guideResults = [
    { title: "Все удочки", type: "Раздел", url: "rods.html", terms: ["удочки", "все удочки", "rods"] },
    { title: "Все предметы", type: "Раздел", url: "items.html", terms: ["предметы", "items"] },
    { title: "Все локации", type: "Раздел", url: "locations.html", terms: ["локации", "locations"] },
    { title: "Verdant Oath", type: "Удочка · инструкция", url: "verdant-guide.html", terms: ["verdant oath", "verdant", "вердант", "вердант аут"] },
    { title: "Aurora Rod", type: "Удочка · инструкция", url: "aurora-guide.html", terms: ["aurora rod", "aurora", "аврора", "аврора род"] },
    { title: "Trident Rod", type: "Удочка · инструкция", url: "trident-guide.html", terms: ["trident rod", "trident", "трезубец", "трайдент"] },
    { title: "Heaven’s Rod", type: "Удочка · инструкция", url: "heavens-guide.html", terms: ["heaven's rod", "heavens rod", "heaven", "небесная удочка", "хевен"] },
    { title: "Magma Rod", type: "Удочка · инструкция", url: "magma-guide.html", terms: ["magma rod", "magma", "магма"] },
    { title: "Fungal Rod", type: "Удочка · инструкция", url: "fungal-guide.html", terms: ["fungal rod", "fungal", "грибная удочка", "фангл"] },
    { title: "Magnet Rod", type: "Удочка · инструкция", url: "magnet-guide.html", terms: ["magnet rod", "magnet", "магнитная удочка", "магнет"] },
    { title: "Nocturnal Rod", type: "Удочка · инструкция", url: "nocturnal-guide.html", terms: ["nocturnal rod", "nocturnal", "ночная удочка", "ноктюрнал"] },
    { title: "Carbon Rod", type: "Удочка · инструкция", url: "carbon-guide.html", terms: ["carbon rod", "carbon", "карбоновая удочка", "карбон"] },
    { title: "Steady Rod", type: "Удочка · инструкция", url: "steady-guide.html", terms: ["steady rod", "steady", "стеди", "стабильная удочка"] },
    { title: "Flimsy Rod", type: "Удочка · инструкция", url: "flimsy-guide.html", terms: ["flimsy rod", "flimsy", "стартовая удочка", "флимси"] },
    { title: "Plastic Rod", type: "Удочка · инструкция", url: "plastic-guide.html", terms: ["plastic rod", "plastic", "пластиковая удочка", "пластик"] },
    { title: "Volcanic Rod", type: "Удочка · инструкция", url: "volcanic-guide.html", terms: ["volcanic rod", "volcanic", "вулканическая удочка", "волканик"] },
    ...[
      ["Training Rod", "training", "rod-training", ["training rod", "тренировочная удочка"]], ["Long Rod", "long", "rod-long", ["long rod", "лонг род"]],
      ["Fast Rod", "fast", "rod-fast", ["fast rod", "фаст род"]], ["Lucky Rod", "lucky", "rod-lucky", ["lucky rod", "лакки род"]],
      ["Decayed Rod", "decayed", "rod-decayed", ["decayed rod", "декаед род"]], ["Stone Rod", "stone", "rod-stone", ["stone rod", "стоун род"]],
      ["Firefly Rod", "firefly", "rod-firefly", ["firefly rod", "файрфлай род"]], ["Fortune Rod", "fortune", "rod-fortune", ["fortune rod", "фортун род"]],
      ["Frog Rod", "frog", "rod-frog", ["frog rod", "фрог род"]], ["Rapid Rod", "rapid", "rod-rapid", ["rapid rod", "рэпид род"]],
      ["Reinforced Rod", "reinforced", "rod-reinforced", ["reinforced rod", "ринфорсд род"]], ["Arctic Rod", "arctic", "rod-arctic", ["arctic rod", "арктик род"]],
      ["Splitbranch Twig", "splitbranch", "rod-splitbranch-twig", ["splitbranch twig"]], ["Coral Rod", "coral", "rod-coral", ["coral rod", "корал род"]],
      ["Avalanche Rod", "avalanche", "rod-avalanche", ["avalanche rod", "аваланш род"]], ["Crystalized Rod", "crystalized", "rod-crystalized", ["crystalized rod"]],
      ["Artisan Rod", "artisan", "rod-artisan", ["artisan rod"]], ["Depthseeker Rod", "depthseeker", "rod-depthseeker", ["depthseeker rod"]],
      ["Scurvy Rod", "scurvy", "rod-scurvy", ["scurvy rod"]], ["Wildflower Rod", "wildflower", "rod-wildflower", ["wildflower rod"]],
      ["Boreal Rod", "boreal", "rod-boreal", ["boreal rod"]], ["Carrot Rod", "carrot", "rod-carrot", ["carrot rod"]],
      ["Phoenix Rod", "phoenix", "rod-phoenix", ["phoenix rod", "феникс род"]], ["Treasure Rod", "treasure", "rod-treasure", ["treasure rod"]],
      ["Ice Warpers Rod", "ice-warpers", "rod-ice-warpers", ["ice warpers rod"]], ["Blazebringer Rod", "blazebringer", "rod-blazebringer", ["blazebringer rod"]],
      ["Mythical Rod", "mythical", "rod-mythical", ["mythical rod"]], ["King’s Rod", "kings", "rod-kings", ["kings rod", "king's rod", "королевская удочка"]],
      ["Tempest Rod", "tempest", "rod-tempest", ["tempest rod"]], ["Poseidon Rod", "poseidon", "rod-poseidon", ["poseidon rod"]],
      ["Zeus Rod", "zeus", "rod-zeus", ["zeus rod"]], ["Rod of the Depths", "depths", "rod-depths", ["rod of the depths", "удочка глубин"]]
    ].map(([title, id, anchor, terms]) => ({ title, type: "Удочка · карточка", url: `rods.html#${anchor}`, terms: [...terms, title] })),

    { title: "Aurora Totem", type: "Предмет", url: "items.html#item-aurora-totem", terms: ["aurora totem", "тотем авроры"] },
    { title: "Alligator", type: "Предмет", url: "items.html#item-alligator", terms: ["alligator", "аллигатор"] },
    { title: "Energy Crystals", type: "Предмет", url: "items.html#item-energy-crystals", terms: ["energy crystal", "energy crystals", "кристалл энергии", "кристаллы энергии"] },
    { title: "Кирка", type: "Предмет", url: "items.html#item-pickaxe", terms: ["кирка", "pickaxe"] },
    { title: "Avalanche Totem", type: "Предмет", url: "items.html#item-avalanche-totem", terms: ["avalanche totem", "тотем лавины"] },
    { title: "Pufferfish", type: "Предмет", url: "items.html#item-pufferfish", terms: ["pufferfish", "рыба фугу", "фугу"] },
    { title: "Enchant Relic", type: "Предмет", url: "items.html#item-enchant-relic", terms: ["enchant relic", "enchant relics", "реликвия зачарования", "реликвии"] },
    { title: "Venom Maw", type: "Предмет", url: "items.html#item-venom-maw", terms: ["venom maw"] },
    { title: "Mycotide Serpent", type: "Предмет", url: "items.html#item-mycotide-serpent", terms: ["mycotide serpent"] },
    { title: "Toxic-Proof Raft", type: "Предмет", url: "items.html#item-toxic-proof-raft", terms: ["toxic-proof raft", "raft", "плот"] },
    { title: "Submarine", type: "Предмет", url: "items.html#item-submarine", terms: ["submarine", "субмарина", "субмарину"] },
    { title: "Glimmerfin Suit Level 1", type: "Предмет", url: "items.html#item-glimmerfin-suit", terms: ["glimmerfin suit", "костюм glimmerfin"] },
    { title: "Submarine Heat Upgrade", type: "Предмет", url: "items.html#item-submarine-heat-upgrade", terms: ["submarine heat upgrade", "heat upgrade", "тепловое улучшение"] },
    { title: "GPS", type: "Предмет", url: "items.html#item-gps", terms: ["gps", "координаты", "джипиэс"] },
    { title: "Basic Diving Gear", type: "Предмет", url: "items.html#item-basic-diving-gear", terms: ["basic diving gear", "базовое снаряжение для дайвинга"] },
    { title: "Advanced Diving Gear", type: "Предмет", url: "items.html#item-advanced-diving-gear", terms: ["advanced diving gear", "улучшенное снаряжение для дайвинга"] },
    { title: "Glider", type: "Предмет", url: "items.html#item-glider", terms: ["glider", "глайдер"] },
    { title: "Flippers", type: "Предмет", url: "items.html#item-flippers", terms: ["flippers", "ласты"] },
    { title: "Tidebreaker", type: "Предмет", url: "items.html#item-tidebreaker", terms: ["tidebreaker", "тайдбрейкер"] },

    { title: "Moosewood", type: "Локация", url: "locations.html#location-moosewood", terms: ["moosewood", "мусвуд"] },
    { title: "Strange Whirlpool", type: "Локация", url: "locations.html#location-strange-whirlpool", terms: ["strange whirlpool", "водоворот", "странный водоворот"] },
    { title: "Vertigo", type: "Локация", url: "locations.html#location-vertigo", terms: ["vertigo", "вертиго"] },
    { title: "Mushgrove Swamp", type: "Локация", url: "locations.html#location-mushgrove-swamp", terms: ["mushgrove swamp", "mushgrove", "мушгроув", "болото"] },
    { title: "Northern Expedition", type: "Локация", url: "locations.html#location-northern-expedition", terms: ["northern expedition", "северная экспедиция", "camp 1", "camp 2", "overgrowth caves"] },
    { title: "Roslit Bay", type: "Локация", url: "locations.html#location-roslit-bay", terms: ["roslit bay", "рослит"] },
    { title: "Roslit Volcano", type: "Локация", url: "locations.html#location-roslit-volcano", terms: ["roslit volcano", "вулкан рослит"] },
    { title: "Terrapin Island", type: "Локация", url: "locations.html#location-terrapin-island", terms: ["terrapin island", "террапин"] },
    { title: "Desolate Deep", type: "Локация", url: "locations.html#location-desolate-deep", terms: ["desolate deep", "дезолейт дип"] },
    { title: "Sunstone Island / Point Nemo Buoy", type: "Локация", url: "locations.html#location-sunstone-point-nemo", terms: ["sunstone island", "point nemo buoy", "sunstone", "буй пойнт немо"] },
    { title: "Glacial Grotto", type: "Локация", url: "locations.html#location-glacial-grotto", terms: ["glacial grotto", "ледяной грот"] },
    { title: "Forsaken Shores / Snowcap Island / Ancient Isle", type: "Локация", url: "locations.html#location-forsaken-snowcap-ancient", terms: ["forsaken shores", "snowcap island", "ancient isle", "форсейкен", "сноукэп", "эншент"] },
    { title: "Living Garden", type: "Локация", url: "locations.html#location-living-garden", terms: ["living garden", "ливаяющий сад", "ливинг гарден"] },
    { title: "Toxic Grove / Nectar Den", type: "Локация", url: "locations.html#location-toxic-grove-nectar-den", terms: ["toxic grove", "nectar den", "токсик гроув", "нектар ден"] },
    { title: "Verdant Pocket", type: "Локация", url: "locations.html#location-verdant-pocket", terms: ["verdant pocket", "вердант покет"] },
    { title: "Mariana’s Veil / Volcanic Vents", type: "Локация", url: "locations.html#location-mariana-volcanic-vents", terms: ["mariana's veil", "mariana’s veil", "volcanic vents", "марианас вейл", "вулканик вентс"] }
    ,{ title: "Castaway Cliffs", type: "Локация", url: "locations.html#location-castaway-cliffs", terms: ["castaway cliffs"] }
    ,{ title: "Ancient Isle", type: "Локация", url: "locations.html#location-ancient-isle", terms: ["ancient isle", "эншент айл"] }
    ,{ title: "Everturn Forest", type: "Локация", url: "locations.html#location-everturn-forest", terms: ["everturn forest"] }
    ,{ title: "Coral Bastion", type: "Локация", url: "locations.html#location-coral-bastion", terms: ["coral bastion"] }
    ,{ title: "Frigid Cavern", type: "Локация", url: "locations.html#location-frigid-cavern", terms: ["frigid cavern"] }
    ,{ title: "Overgrowth Caves", type: "Локация", url: "locations.html#location-overgrowth-caves", terms: ["overgrowth caves"] }
    ,{ title: "Skycrest", type: "Локация", url: "locations.html#location-skycrest", terms: ["skycrest"] }
    ,{ title: "Atlantis", type: "Локация", url: "locations.html#location-atlantis", terms: ["atlantis", "атлантис"] }
    ,{ title: "Boreal Pines", type: "Локация", url: "locations.html#location-boreal-pines", terms: ["boreal pines"] }
    ,{ title: "Carrot Garden", type: "Локация", url: "locations.html#location-carrot-garden", terms: ["carrot garden"] }
    ,{ title: "Treasure Island", type: "Локация", url: "locations.html#location-treasure-island", terms: ["treasure island"] }
    ,{ title: "Keepers Altar", type: "Локация", url: "locations.html#location-keepers-altar", terms: ["keepers altar"] }
    ,{ title: "The Depths", type: "Локация", url: "locations.html#location-the-depths", terms: ["the depths"] }
  ];

  const normalize = (value) => value.toLocaleLowerCase("ru").replace(/[’']/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
  const hideSuggestions = () => {
    suggestions.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  };
  const navigateTo = (result) => { window.location.href = result.url; };
  const renderSuggestions = () => {
    const query = normalize(input.value);
    suggestions.replaceChildren();
    activeIndex = -1;
    if (query.length < 2) {
      visibleResults = [];
      hideSuggestions();
      status.textContent = "";
      return;
    }
    visibleResults = guideResults.filter((result) => result.terms.some((term) => normalize(term).includes(query) || query.includes(normalize(term)))).slice(0, 8);
    if (!visibleResults.length) {
      hideSuggestions();
      status.textContent = "По этому запросу пока ничего не найдено.";
      return;
    }
    for (const [index, result] of visibleResults.entries()) {
      const option = document.createElement("a");
      option.id = `search-option-${index}`;
      option.className = "search-suggestion";
      option.href = result.url;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      const title = document.createElement("span");
      title.className = "search-suggestion-title";
      title.textContent = result.title;
      const type = document.createElement("span");
      type.className = "search-suggestion-type";
      type.textContent = result.type;
      option.append(title, type);
      option.addEventListener("pointerenter", () => setActive(index));
      suggestions.append(option);
    }
    suggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
    status.textContent = "";
  };
  const setActive = (index) => {
    const options = [...suggestions.querySelectorAll('[role="option"]')];
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => option.setAttribute("aria-selected", String(optionIndex === activeIndex)));
    input.setAttribute("aria-activedescendant", options[activeIndex].id);
  };

  input.addEventListener("input", renderSuggestions);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && !suggestions.hidden) { event.preventDefault(); setActive(activeIndex + 1); }
    if (event.key === "ArrowUp" && !suggestions.hidden) { event.preventDefault(); setActive(activeIndex < 0 ? visibleResults.length - 1 : activeIndex - 1); }
    if (event.key === "Escape") hideSuggestions();
    if (event.key === "Enter" && !suggestions.hidden) {
      event.preventDefault();
      navigateTo(visibleResults[activeIndex >= 0 ? activeIndex : 0]);
    }
  });
  input.addEventListener("focus", renderSuggestions);
  document.addEventListener("pointerdown", (event) => {
    if (!guideSearch.contains(event.target)) hideSuggestions();
  });
  guideSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = normalize(input.value);
    if (!query) { status.textContent = "Введи название удочки, предмета или локации."; return; }
    const result = guideResults.find((entry) => entry.terms.some((term) => normalize(term).includes(query) || query.includes(normalize(term))));
    if (result) navigateTo(result);
    else status.textContent = "По этому запросу ничего не найдено.";
  });
}


const adminCountdown = document.querySelector("#admin-countdown");
if (adminCountdown) {
  const nextExpectedWindow = (now = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Moscow",
      weekday: "short", year: "numeric", month: "numeric", day: "numeric"
    }).formatToParts(now);
    const value = (type) => parts.find((part) => part.type === type).value;
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday"));
    const daysUntilSaturday = (6 - weekday + 7) % 7;
    const targetParts = new Date(Date.UTC(
      Number(value("year")), Number(value("month")) - 1, Number(value("day")) + daysUntilSaturday, 16, 0, 0
    ));
    if (targetParts <= now) targetParts.setUTCDate(targetParts.getUTCDate() + 7);
    return targetParts;
  };
  const nextDateLabel = document.querySelector("#admin-next-date");
  const updateAdminCountdown = () => {
    const now = new Date();
    const target = nextExpectedWindow(now);
    const left = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(left / 86400000);
    const hours = Math.floor((left % 86400000) / 3600000);
    const minutes = Math.floor((left % 3600000) / 60000);
    const seconds = Math.floor((left % 60000) / 1000);
    adminCountdown.textContent = `${days} д ${String(hours).padStart(2, "0")} ч ${String(minutes).padStart(2, "0")} мин ${String(seconds).padStart(2, "0")} с`;
    const dateText = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Moscow",
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    }).format(target);
    nextDateLabel.textContent = `Ожидаемое время по Москве: ${dateText} МСК.`;
  };
  updateAdminCountdown();
  window.setInterval(updateAdminCountdown, 1000);
}
