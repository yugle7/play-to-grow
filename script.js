// ==========================================================================
// 1. CONSTANTS
// ==========================================================================

const STORAGE_KEY = "childActivityPlanner";
const DATA_VERSION = 1;
const CATALOGUE_URL = "data/activities.json";
const LANG = "ru";

// Shared vocabulary: the same ids are used in the catalogue, the child profile, feedback and scoring

const AREAS = ["gross_motor", "fine_motor", "sensory", "cognitive", "communication", "social_emotional"];

const SKILLS = {
    gross_motor: ["head_control", "rolling", "sitting", "crawling", "standing"],
    fine_motor: ["grasping", "reaching", "hand_transfer", "releasing", "finger_skills"],
    sensory: ["visual_tracking", "auditory_attention", "tactile_exploration"],
    cognitive: ["attention_focus", "cause_effect", "object_permanence"],
    communication: ["responding_to_voice", "cooing_babbling", "gestures", "understanding_words"],
    social_emotional: ["social_smile", "joint_attention", "turn_taking", "imitation"],
};

const SKILL_LEVELS = ["unknown", "emerging", "developing", "confident"];

const INTERESTS = [
    "music",
    "sounds",
    "faces",
    "moving_objects",
    "colors",
    "books",
    "textures",
    "water",
    "movement",
    "calm",
];

const MATERIALS = [
    "blanket",
    "rattle",
    "soft_toy",
    "ball",
    "mirror",
    "contrast_cards",
    "book",
    "fabric",
    "scarf",
    "container",
    "blocks",
    "cups",
    "pot_and_spoon",
    "bowl",
    "bubbles",
    "button_toy",
    "pillows",
];

const GENDERS = ["unspecified", "female", "male"];
const DURATION_LIMITS = [0, 5, 10, 15]; // minutes, 0 means no limit
const ENVIRONMENT_PREFS = ["either", "home", "outdoors"];
const INTENSITY_PREFS = ["either", "calm", "active"];
const AGE_RANGES = [[0, 3], [3, 6], [6, 9], [9, 12]]; // catalogue filter, months

// Activities without these fields are left out of the catalogue
const REQUIRED_FIELDS = [
    "id",
    "title",
    "description",
    "goal",
    "ageMinMonths",
    "ageMaxMonths",
    "areas",
    "skillTags",
    "interestTags",
    "difficulty",
    "duration",
    "materials",
    "environment",
    "intensity",
    "instructions",
    "safety",
    "sources",
    "videos",
];
const NON_EMPTY_FIELDS = ["areas", "instructions", "safety"];

// Manual interest marks cycle: none → like → dislike → none
const NEXT_MANUAL = {like: "dislike", dislike: null};
// Manual marks override scores inferred from feedback; all preference scores are in -100…100
const MANUAL_SCORE = {like: 100, dislike: -100};

// Recommendation score is a weighted sum of components, each in the 0–100 range
const RECOMMENDATION_WEIGHTS = {
    age: 0.2,
    skill: 0.2,
    interest: 0.2,
    feedback: 0.2,
    diversity: 0.1,
    practical: 0.1,
};

const HISTORY_DAYS = 7; // days of history used for repetition and diversity
const SAME_ACTIVITY_PENALTY = 60; // points, fades over HISTORY_DAYS
const SIMILAR_ACTIVITY_PENALTY = 20; // points, scaled by similarity
const NOVELTY_BONUS = 10; // activity not recommended to the child before
const EXPLORE_BONUS = 5; // activity with an interest the child has no observations for yet

// Skills that are just appearing are the most relevant. Unobserved skills stay neutral and never exclude an activity.
const SKILL_RELEVANCE = {unknown: 60, emerging: 100, developing: 85, confident: 40};
// Difficulty that suits an observed skill level
const SKILL_DIFFICULTY = {emerging: 0, developing: 1, confident: 2};
const DIFFICULTY_LEVEL = {easy: 0, medium: 1, challenging: 2};

const FINISHED = ["completed", "partially_completed", "not_completed"];

const FEEDBACK_STATUSES = ["completed", "partially_completed", "not_completed", "skipped"];
const FEEDBACK_INTERESTS = ["liked", "neutral", "disliked", "not_observed"];
const FEEDBACK_DIFFICULTIES = ["too_easy", "appropriate", "too_hard", "not_observed"];
const REASONS = ["no_time", "no_materials", "child_not_in_mood", "not_suitable", "other"];
const NEEDS_REASON = ["not_completed", "skipped"];

const PREFERENCE_STEP = 25; // one liked or disliked response; repeated responses add up
const DIFFICULTY_STEP = 50; // one "too easy" or "too hard" response
const INTEREST_SIGN = {liked: 1, disliked: -1};
const DIFFICULTY_SIGN = {too_easy: 1, too_hard: -1};
const INFERRED_HINT = 25; // inferred interest scores from this value are shown in the profile

const DATA_LISTS = ["children", "recommendations", "feedback", "preferences"];
const PREFERENCE_KINDS = ["interest", "activity", "difficulty"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ==========================================================================
// 2. TRANSLATIONS
// ==========================================================================

// All user-visible strings live here: another language is one more object with the same keys
const STRINGS = {
    ru: {
        locale: "ru-RU",
        appName: "Занятия с ребёнком",
        units: {days: "дн.", weeks: "нед.", months: "мес.", years: "г.", minutes: "мин"},
        firstDay: "первый день",

        /* --- Navigation --- */
        navigation: "Основная навигация",
        today: "Сегодня",
        activities: "Занятия",
        history: "История",
        child: "Ребёнок",
        settings: "Настройки",

        /* --- Common --- */
        save: "Сохранить",
        cancel: "Отмена",
        close: "Закрыть",
        delete: "Удалить",
        edit: "Изменить",
        storageError: "Не удалось сохранить данные: в браузере закончилось место.",

        /* --- Today --- */
        welcomeTitle: "Идея для игры с малышом на каждый день",
        welcomeText:
            "Расскажите о ребёнке, и приложение будет предлагать одно занятие в день " +
            "с учётом возраста, навыков и интересов.",
        localDataNote: "Данные хранятся только на этом устройстве и никуда не отправляются.",
        noActivityTitle: "Сегодня подходящих занятий нет",
        noActivityText:
            "Приложение предлагает только занятия, которые подходят по возрасту и условиям " +
            "и прошли проверку безопасности. Сейчас таких нет. Посмотрите каталог " +
            "или измените условия в профиле ребёнка.",
        noActivityForAge: (max) => `Сейчас в каталоге есть занятия для детей до ${max} мес.`,
        browseCatalogue: "Открыть каталог",
        changeConditions: "Изменить условия",
        moreDetails: "Подробнее о занятии",
        start: "Начать",
        finish: "Завершить",
        another: "Другое занятие",
        oneMore: "Ещё одно занятие",
        noAlternative: "Других подходящих занятий на сегодня нет.",
        statuses: {
            recommended: "Рекомендовано",
            in_progress: "Начато",
            completed: "Выполнено",
            partially_completed: "Выполнено частично",
            not_completed: "Не получилось",
            replaced: "Заменено",
            skipped: "Пропущено",
        },

        /* --- Feedback --- */
        feedbackTitle: "Как прошло занятие?",
        feedbackStatus: "Результат",
        feedbackInterest: "Интерес ребёнка",
        feedbackDifficulty: "Сложность",
        feedbackReason: "Что помешало",
        comment: "Комментарий",
        commentPlaceholder: "Необязательно",
        feedbackStatuses: {
            completed: "Получилось",
            partially_completed: "Частично",
            not_completed: "Не получилось",
            skipped: "Пропустили",
        },
        interestFeedback: {
            liked: "Понравилось",
            neutral: "Нейтрально",
            disliked: "Не понравилось",
            not_observed: "Не заметно",
        },
        difficultyFeedback: {
            too_easy: "Слишком легко",
            appropriate: "В самый раз",
            too_hard: "Сложновато",
            not_observed: "Не заметно",
        },
        reasons: {
            no_time: "Не было времени",
            no_materials: "Нет материалов",
            child_not_in_mood: "Не было настроения",
            not_suitable: "Не подходит",
            other: "Другое",
        },

        /* --- Child profile --- */
        selectChild: "Выбрать ребёнка",
        noChildText: "Пока нет ни одного профиля.",
        addChild: "Добавить ребёнка",
        addAnotherChild: "Добавить ещё ребёнка",
        newChild: "Новый ребёнок",
        editChild: "Профиль ребёнка",
        profileTitle: "Профиль",
        age: "Возраст",
        name: "Имя",
        birthDate: "Дата рождения",
        gender: "Пол (необязательно)",
        genderTitle: "Пол",
        genders: {unspecified: "Не указан", female: "Девочка", male: "Мальчик"},
        deleteChild: "Удалить профиль",
        deleteChildQuestion: (name) =>
            `Удалить профиль «${name}» вместе с историей занятий? Это действие нельзя отменить.`,

        skillsTitle: "Навыки",
        skillsNote:
            "Отмечайте то, что замечаете сами. Это ваши наблюдения, а не медицинская " +
            "или стандартизированная оценка развития. Каждый ребёнок развивается в своём темпе.",
        observed: (n) => (n ? `отмечено: ${n}` : ""),
        interestsTitle: "Интересы",
        interestsNote:
            "Одно нажатие — нравится, второе — не нравится, третье снимает отметку. " +
            "Стрелки ↑ и ↓ — то, что приложение заметило по отзывам. Ваша отметка всегда важнее.",
        interestStates: {
            like: "нравится",
            dislike: "не нравится",
            inferredLike: "по отзывам нравится",
            inferredDislike: "по отзывам не нравится",
        },
        conditionsTitle: "Условия для занятий",
        conditionsNote: "Необязательно. Помогает подбирать занятия, которые удобно провести.",
        durationLabel: "Сколько есть времени",
        environmentLabel: "Где заниматься",
        intensityLabel: "Какие занятия",
        materialsLabel: "Что есть под рукой",
        durationLimits: {0: "Неважно", 5: "До 5 мин", 10: "До 10 мин", 15: "До 15 мин"},
        environmentPrefs: {either: "Неважно", home: "Дома", outdoors: "На улице"},
        intensityPrefs: {either: "Любые", calm: "Спокойные", active: "Подвижные"},

        /* --- Catalogue --- */
        searchPlaceholder: "Поиск по названию",
        allAreas: "Все области",
        anyAge: "Любой возраст",
        childAgeFilter: "По возрасту ребёнка",
        anyDuration: "Любое время",
        allInterests: "Все интересы",
        filterArea: "Область развития",
        filterAge: "Возраст",
        filterDuration: "Длительность",
        filterInterest: "Интерес",
        nothingFound: "Ничего не нашлось. Попробуйте изменить поиск или фильтры.",
        catalogueError:
            "Не удалось загрузить каталог занятий. Подключитесь к интернету и откройте приложение снова.",
        catalogueStatus: (reviewed, total) =>
            reviewed === total
                ? "Все занятия в каталоге проверены на безопасность."
                : `Проверено на безопасность: ${reviewed} из ${total}. ` +
                  "Непроверенные занятия видны в каталоге, но не попадают в рекомендации.",
        ageRange: (min, max) => `${min}–${max} мес.`,
        notReviewed: "Не проверено",
        disabled: "Отключено",
        notReviewedNote:
            "Это демонстрационное занятие ещё не проверено на безопасность, поэтому приложение его не рекомендует.",
        disabledNote: "Это занятие отключено и не попадает в рекомендации.",
        goal: "Цель",
        duration: "Время",
        place: "Где",
        character: "Характер",
        difficultyTitle: "Сложность",
        materialsTitle: "Материалы",
        noMaterials: "Ничего не нужно",
        instructions: "Как играть",
        variations: "Варианты",
        easier: "Проще",
        harder: "Сложнее",
        safety: "Безопасность",
        videos: "Видео",
        sources: "Источники",
        difficulty: {easy: "Легко", medium: "Средне", challenging: "Посложнее"},
        environment: {home: "Дома", outdoors: "На улице", either: "Дома или на улице"},
        intensity: {calm: "Спокойное", active: "Подвижное"},
        historyFilterLabel: "Показать",

        /* --- History --- */
        historyFilters: {all: "Все", completed: "Выполненные", skipped: "Пропущенные"},
        historyEmpty: "Здесь появятся занятия, которые предлагало приложение. Пропускать дни — нормально.",
        unknownActivity: "Занятие удалено из каталога",

        /* --- Settings --- */
        privacyNote:
            "Все данные хранятся только на этом устройстве, никуда не отправляются " +
            "и не синхронизируются между устройствами. Чтобы перенести их, используйте экспорт и импорт.",
        disclaimer:
            "Приложение помогает выбрать занятие для игры и общения. Оно не ставит диагнозы, " +
            "не оценивает развитие и не заменяет консультацию педиатра. Делайте столько занятий, " +
            "сколько удобно вашей семье.",
        exportData: "Экспорт данных",
        importData: "Импорт данных",
        resetPreferences: "Сбросить выводы из отзывов",
        deleteAll: "Удалить все данные",
        importError: "Не удалось прочитать файл. Выберите файл, сохранённый через «Экспорт данных».",
        importQuestion: "Данные на этом устройстве будут заменены данными из файла. Продолжить?",
        importConfirm: "Заменить",
        resetQuestion: (name) =>
            `Сбросить выводы из отзывов для профиля «${name}»? История занятий и ваши отметки интересов сохранятся.`,
        resetConfirm: "Сбросить",
        deleteAllQuestion:
            "Удалить все профили, историю и настройки с этого устройства? Это действие нельзя отменить. " +
            "Перед удалением можно сделать экспорт.",

        /* --- Vocabulary --- */
        areas: {
            gross_motor: "Крупная моторика",
            fine_motor: "Мелкая моторика",
            sensory: "Сенсорика",
            cognitive: "Познание",
            communication: "Ранняя речь",
            social_emotional: "Общение и эмоции",
        },
        skills: {
            head_control: "Держит голову",
            rolling: "Переворачивается",
            sitting: "Сидит",
            crawling: "Ползает",
            standing: "Стоит с опорой",
            grasping: "Захватывает игрушку",
            reaching: "Тянется к предметам",
            hand_transfer: "Перекладывает из руки в руку",
            releasing: "Кладёт и отпускает предметы",
            finger_skills: "Нажимает и тычет пальчиком",
            visual_tracking: "Следит глазами за предметом",
            auditory_attention: "Прислушивается к звукам",
            tactile_exploration: "Исследует на ощупь",
            attention_focus: "Сосредотачивается на игрушке",
            cause_effect: "Повторяет действие ради результата",
            object_permanence: "Ищет спрятанную игрушку",
            responding_to_voice: "Откликается на голос",
            cooing_babbling: "Гулит и лепечет",
            gestures: "Использует жесты",
            understanding_words: "Понимает знакомые слова",
            social_smile: "Улыбается в ответ",
            joint_attention: "Смотрит туда же, куда взрослый",
            turn_taking: "Играет по очереди",
            imitation: "Подражает действиям и звукам",
        },
        levels: {
            unknown: "Не замечали",
            emerging: "Появляется",
            developing: "Иногда",
            confident: "Уверенно",
        },
        interests: {
            music: "Музыка",
            sounds: "Звуки",
            faces: "Лица и общение",
            moving_objects: "Движущиеся предметы",
            colors: "Яркие предметы",
            books: "Книжки и картинки",
            textures: "Разные текстуры",
            water: "Вода",
            movement: "Движение",
            calm: "Спокойные занятия",
        },
        materials: {
            blanket: "Коврик или плед",
            rattle: "Погремушка",
            soft_toy: "Мягкая игрушка",
            ball: "Мягкий мяч",
            mirror: "Небьющееся детское зеркало",
            contrast_cards: "Контрастные картинки",
            book: "Книжка с плотными страницами",
            fabric: "Лоскутки разных тканей",
            scarf: "Лёгкий платок",
            container: "Корзинка или коробка",
            blocks: "Крупные кубики",
            cups: "Пластиковые стаканчики",
            pot_and_spoon: "Кастрюля и деревянная ложка",
            bowl: "Неглубокая миска",
            bubbles: "Мыльные пузыри",
            button_toy: "Игрушка с кнопками",
            pillows: "Подушки",
        },
    },
};

const S = STRINGS[LANG];

// ==========================================================================
// 3. HELPERS
// ==========================================================================

const $ = (id) => document.getElementById(id);

const pad = (n) => String(n).padStart(2, "0");

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const now = () => new Date().toISOString();

const clamp = (x, min, max) => Math.min(max, Math.max(min, x));

const average = (values) => values.reduce((sum, x) => sum + x, 0) / values.length;

const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

// Calendar days are local YYYY-MM-DD strings, never UTC conversions
const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDate = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
};

const formatDate = (key, options) => parseDate(key).toLocaleDateString(S.locale, options);


// Day numbers come from UTC so that daylight saving changes never shift them
const dayNumber = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
};

const daysBetween = (from, to) => dayNumber(to) - dayNumber(from);

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Completed months plus the days since the last monthly birthday.
// A birthday on the 31st falls on the last day of shorter months.
const ageOf = (birthDate, today = dateKey()) => {
    const [by, bm, bd] = birthDate.split("-").map(Number);
    const [ty, tm, td] = today.split("-").map(Number);
    let months = (ty - by) * 12 + (tm - bm);
    if (td < Math.min(bd, daysInMonth(ty, tm - 1))) months--;
    const year = by + Math.floor((bm - 1 + months) / 12);
    const month = (bm - 1 + months) % 12;
    const anniversary = dateKey(new Date(year, month, Math.min(bd, daysInMonth(year, month))));
    return {months, days: daysBetween(anniversary, today)};
};

const formatAge = (birthDate) => {
    const {months, days} = ageOf(birthDate);
    const weeks = Math.floor(days / 7);
    const u = S.units;
    if (months === 0) return weeks ? `${weeks} ${u.weeks}` : days ? `${days} ${u.days}` : S.firstDay;
    if (months < 3 && weeks) return `${months} ${u.months} ${weeks} ${u.weeks}`;
    if (months < 24) return `${months} ${u.months}`;
    const rest = months % 12;
    return `${Math.floor(months / 12)} ${u.years}` + (rest ? ` ${rest} ${u.months}` : "");
};

// Builds an element. Strings become text nodes, so catalogue and user text is never parsed as HTML.
// False and null children are skipped to allow `condition && child`.
const el = (tag, props, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children.filter((child) => child != null && child !== false));
    return node;
};

const normalize = (text) => text.toLowerCase().replaceAll("ё", "е");

const capitalize = (text) => text.charAt(0).toLocaleUpperCase(S.locale) + text.slice(1);

// "Сегодня", "Вчера" or a date; the year only when it is not the current one
const formatDay = (key) => {
    const ago = daysBetween(key, dateKey());
    if (ago === 0 || ago === 1) return capitalize(new Intl.RelativeTimeFormat(S.locale, {numeric: "auto"}).format(-ago, "day"));
    const thisYear = key.startsWith(String(new Date().getFullYear()));
    return formatDate(key, {day: "numeric", month: "long", year: thisYear ? undefined : "numeric"});
};

// Joins labels into one phrase: "Выполнено, понравилось, в самый раз"
const phrase = (parts) =>
    parts
        .filter(Boolean)
        .map((part, i) => (i ? part.toLocaleLowerCase(S.locale) : part))
        .join(", ");

// ==========================================================================
// 4. DOM ELEMENTS
// ==========================================================================

const header = $("top");
const childSelect = $("child-select");
const childAge = $("child-age");

const nav = $("nav");
const navButtons = [...nav.querySelectorAll("button")];

/* --- Today --- */
const todayDate = $("today-date");
const welcome = $("welcome");
const todayEmpty = $("today-empty");
const todayEmptyText = $("today-empty-text");
const todayActivity = $("today-activity");
const todayBody = $("today-body");
const todayDetails = $("today-details");
const todayStatus = $("today-status");
const todayMain = $("today-main");
const todayAnother = $("today-another");
const openCatalogue = $("open-catalogue");
const changeConditions = $("change-conditions");

/* --- History --- */
const historyFilterChips = $("history-filter");
const historyArea = $("history-area");
const historyList = $("history-list");
const historyEmpty = $("history-empty");

/* --- Settings --- */
const exportButton = $("export");
const importButton = $("import");
const importInput = $("import-input");
const resetPreferencesButton = $("reset-preferences");
const deleteAllButton = $("delete-all");

/* --- Child --- */
const childNone = $("child-none");
const childProfile = $("child-profile");
const childInfo = $("child-info");
const childEdit = $("child-edit");
const childDelete = $("child-delete");
const skillsList = $("skills");
const interestsList = $("interests");
const conditionDuration = $("condition-duration");
const conditionEnvironment = $("condition-environment");
const conditionIntensity = $("condition-intensity");
const conditionMaterials = $("condition-materials");

/* --- Feedback --- */
const feedbackDialog = $("feedback-dialog");
const feedbackForm = $("feedback-form");
const fbStatus = $("fb-status");
const fbObserved = $("fb-observed");
const fbInterest = $("fb-interest");
const fbDifficulty = $("fb-difficulty");
const fbReasonField = $("fb-reason-field");
const fbReason = $("fb-reason");
const fbComment = $("fb-comment");

/* --- Activities --- */
const searchInput = $("search");
const filterArea = $("filter-area");
const filterAge = $("filter-age");
const filterDuration = $("filter-duration");
const filterInterest = $("filter-interest");
const catalogueStatus = $("catalogue-status");
const activityList = $("activity-list");
const activityEmpty = $("activity-empty");

/* --- Activity details --- */
const activityDialog = $("activity-dialog");
const activityBody = $("activity-body");

/* --- Child form --- */
const childDialog = $("child-dialog");
const childForm = $("child-form");
const childFormTitle = $("child-form-title");
const childNameInput = $("child-name-input");
const childBirthInput = $("child-birth-input");
const childGender = $("child-gender");

/* --- Confirmation --- */
const confirmDialog = $("confirm-dialog");
const confirmText = $("confirm-text");
const confirmYes = $("confirm-yes");
const confirmNo = $("confirm-no");

// ==========================================================================
// 5. LANGUAGE
// ==========================================================================

const translatePage = () => {
    document.documentElement.lang = LANG;
    document.title = S.appName;
    document
        .querySelectorAll("[data-i18n]")
        .forEach((node) => (node.textContent = S[node.dataset.i18n]));
    document
        .querySelectorAll("[data-i18n-label]")
        .forEach((node) => node.setAttribute("aria-label", S[node.dataset.i18nLabel]));
    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach((node) => (node.placeholder = S[node.dataset.i18nPlaceholder]));
};

// ==========================================================================
// 6. STORAGE
// ==========================================================================

let data;

const emptyData = () => ({
    version: DATA_VERSION,
    children: [],
    activeChildId: null,
    recommendations: [],
    feedback: [],
    preferences: [],
    settings: {},
});

// Data of an older version would be migrated here, based on data.version
const loadData = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
        data = {...emptyData(), ...JSON.parse(raw)};
    } catch {
        // keep unreadable data aside instead of overwriting it
        localStorage.setItem(`${STORAGE_KEY}-unreadable-${Date.now()}`, raw);
        data = emptyData();
    }
};

const saveData = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        showMessage(S.storageError);
    }
};

const updateData = (change) => {
    change(data);
    saveData();
};

const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: "application/json"}));
    el("a", {href: url, download: `child-activities-${dateKey()}.json`}).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Checks the fields the app relies on, so a broken file cannot replace working data
const isValidImport = (d) =>
    Number.isInteger(d?.version) &&
    d.version <= DATA_VERSION &&
    DATA_LISTS.every((key) => Array.isArray(d[key])) &&
    d.children.every((c) => c.id && c.name && DATE_PATTERN.test(c.birthDate) && Array.isArray(c.skills) && c.conditions) &&
    d.recommendations.every((r) => r.childId && r.activityId && DATE_PATTERN.test(r.date) && typeof r.createdAt === "string") &&
    d.preferences.every((p) => PREFERENCE_KINDS.includes(p.kind));

const importData = (imported) => {
    data = {...emptyData(), ...imported};
    if (!activeChild()) data.activeChildId = data.children[0]?.id ?? null;
    saveData();
};

// Also removes copies of unreadable data kept by loadData
const deleteAllData = () => {
    Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_KEY))
        .forEach((key) => localStorage.removeItem(key));
    data = emptyData();
};

// ==========================================================================
// 7. PROFILE
// ==========================================================================

const activeChild = () => data.children.find((c) => c.id === data.activeChildId);

const createChild = (fields) =>
    updateData((d) => {
        const time = now();
        const child = {
            id: uid(),
            ...fields,
            createdAt: time,
            updatedAt: time,
            skills: [],
            conditions: {duration: 0, materials: [], environment: "either", intensity: "either"},
        };
        d.children.push(child);
        d.activeChildId = child.id;
    });

const editChild = (child, fields) => updateData(() => Object.assign(child, fields, {updatedAt: now()}));

const deleteChild = (id) =>
    updateData((d) => {
        const other = (item) => item.childId !== id;
        d.children = d.children.filter((c) => c.id !== id);
        d.recommendations = d.recommendations.filter(other);
        d.feedback = d.feedback.filter(other);
        d.preferences = d.preferences.filter(other);
        d.activeChildId = d.children[0]?.id ?? null;
    });

const skillLevel = (child, id) => child.skills.find((s) => s.id === id)?.level ?? "unknown";

const setSkillLevel = (child, id, level) =>
    updateData(() => {
        const time = now();
        const skill = child.skills.find((s) => s.id === id);
        if (skill) Object.assign(skill, {level, updatedAt: time});
        else child.skills.push({id, level, updatedAt: time});
        child.updatedAt = time;
    });

const setCondition = (child, key, value) =>
    updateData(() => {
        child.conditions[key] = value;
        child.updatedAt = now();
    });

/* --- Preferences: interests, activities and difficulty per area --- */

const findPreference = (childId, kind, id) =>
    data.preferences.find((p) => p.childId === childId && p.kind === kind && p.id === id);

const getPreference = (childId, kind, id) => {
    let p = findPreference(childId, kind, id);
    if (!p) data.preferences.push((p = {childId, kind, id, score: 0, manual: null, updatedAt: now()}));
    return p;
};

const toggleInterest = (child, tag) =>
    updateData(() => {
        const p = getPreference(child.id, "interest", tag);
        p.manual = p.manual ? NEXT_MANUAL[p.manual] : "like";
        p.updatedAt = now();
    });

// ==========================================================================
// 8. CATALOGUE
// ==========================================================================

let catalogue = [];
let catalogueError = false;

const isComplete = (activity) =>
    REQUIRED_FIELDS.every((key) => activity[key] != null && activity[key] !== "") &&
    NON_EMPTY_FIELDS.every((key) => activity[key].length > 0);

const loadCatalogue = async () => {
    try {
        const list = await (await fetch(CATALOGUE_URL)).json();
        catalogue = list.filter(isComplete);
        list.filter((a) => !isComplete(a)).forEach((a) => console.warn("Incomplete activity skipped:", a.id));
    } catch {
        catalogueError = true;
    }
};

const findActivity = (id) => catalogue.find((a) => a.id === id);

// Only enabled activities that passed a safety review can be recommended
const isAvailable = (activity) => activity?.enabled === true && activity.safetyReviewed === true;

// ==========================================================================
// 9. RECOMMENDATIONS
// ==========================================================================

const tagsOf = (a) => [...a.areas, ...a.skillTags, ...a.interestTags];

// Share of common tags: 1 for the same activity, 0 for unrelated ones
const similarity = (a, b) => {
    const tags = new Set(tagsOf(a));
    const other = tagsOf(b);
    const common = other.filter((tag) => tags.has(tag)).length;
    return common / (tags.size + other.length - common);
};

/* --- Step 1: filter. Incomplete activities are already left out when the catalogue loads. --- */

const fitsConditions = (a, {environment, intensity}) =>
    (environment === "either" || a.environment === "either" || a.environment === environment) &&
    (intensity === "either" || a.intensity === intensity);

const isEligible = (a, child, months) =>
    isAvailable(a) && months >= a.ageMinMonths && months <= a.ageMaxMonths && fitsConditions(a, child.conditions);

/* --- Step 2: score --- */

const preferenceScore = (p) => (p.manual ? MANUAL_SCORE[p.manual] : p.score);

// Preference scores of a child grouped by kind: {interest: {music: 25}, activity: {...}, difficulty: {...}}
const preferencesOf = (childId) => {
    const prefs = Object.fromEntries(PREFERENCE_KINDS.map((kind) => [kind, {}]));
    data.preferences
        .filter((p) => p.childId === childId)
        .forEach((p) => (prefs[p.kind][p.id] = preferenceScore(p)));
    return prefs;
};

// Activities aimed at the middle of the age range fit best
const ageFit = (a, months) => {
    const center = (a.ageMinMonths + a.ageMaxMonths) / 2;
    const half = (a.ageMaxMonths - a.ageMinMonths) / 2 || 1;
    return 100 - 40 * Math.min(1, Math.abs(months - center) / half);
};

// Relevance of the activity's skills plus how well its difficulty suits the observed levels.
// "Too easy" and "too hard" feedback shifts the suitable difficulty per area.
const skillFit = (a, child, prefs) => {
    const levels = a.skillTags.map((id) => skillLevel(child, id));
    const relevance = levels.length ? average(levels.map((level) => SKILL_RELEVANCE[level])) : SKILL_RELEVANCE.unknown;
    const known = levels.filter((level) => level !== "unknown");
    const base = known.length ? average(known.map((level) => SKILL_DIFFICULTY[level])) : DIFFICULTY_LEVEL.medium;
    const shift = average(a.areas.map((area) => prefs.difficulty[area] ?? 0)) / 100;
    const difficultyFit = Math.max(0, 100 - 40 * Math.abs(DIFFICULTY_LEVEL[a.difficulty] - base - shift));
    return (relevance + difficultyFit) / 2;
};

const interestFit = (a, prefs) =>
    a.interestTags.length ? 50 + average(a.interestTags.map((tag) => prefs.interest[tag] ?? 0)) / 2 : 50;

// Liked and disliked activities raise and lower similar ones: the more similar, the stronger
const feedbackFit = (a, prefs) => {
    let sum = 0;
    let weight = 0;
    for (const [id, score] of Object.entries(prefs.activity)) {
        const other = findActivity(id);
        if (!other) continue;
        const w = similarity(a, other);
        sum += w * score;
        weight += w;
    }
    return 50 + sum / Math.max(1, weight) / 2;
};

// Areas that got less attention recently score higher
const diversity = (a, areaCounts) => {
    const max = Math.max(1, ...Object.values(areaCounts));
    return 100 - 100 * average(a.areas.map((area) => (areaCounts[area] ?? 0) / max));
};

const practicalFit = (a, {duration, materials}) => {
    const time = !duration || a.duration <= duration ? 100 : Math.max(0, 100 - 10 * (a.duration - duration));
    const available = a.materials.filter((m) => materials.includes(m)).length;
    // materials the parent has not listed are unknown rather than missing
    const things = !a.materials.length ? 100 : materials.length ? (100 * available) / a.materials.length : 70;
    return (time + things) / 2;
};

/* --- Step 3: repetition and novelty --- */

const repetitionPenalty = (a, recent) =>
    recent.reduce((sum, r) => {
        const fade = 1 - r.daysAgo / (HISTORY_DAYS + 1);
        const penalty = r.activity === a ? SAME_ACTIVITY_PENALTY : SIMILAR_ACTIVITY_PENALTY * similarity(a, r.activity);
        return sum + fade * penalty;
    }, 0);

const scoreActivity = (a, ctx) => {
    const fits = {
        age: ageFit(a, ctx.months),
        skill: skillFit(a, ctx.child, ctx.prefs),
        interest: interestFit(a, ctx.prefs),
        feedback: feedbackFit(a, ctx.prefs),
        diversity: diversity(a, ctx.areaCounts),
        practical: practicalFit(a, ctx.child.conditions),
    };
    const weighted = Object.entries(RECOMMENDATION_WEIGHTS).reduce((sum, [key, w]) => sum + fits[key] * w, 0);
    const novelty = ctx.shownIds.has(a.id) ? 0 : NOVELTY_BONUS;
    const explore = a.interestTags.some((tag) => !(tag in ctx.prefs.interest)) ? EXPLORE_BONUS : 0;
    return weighted - repetitionPenalty(a, ctx.recent) + novelty + explore;
};

// Eligible activities, best first. Replaced recommendations do not count as shown.
const rankActivities = (child, date, excludeIds = new Set()) => {
    const {months} = ageOf(child.birthDate, date);
    const shown = data.recommendations.filter((r) => r.childId === child.id && r.status !== "replaced");
    const recent = shown
        .map((r) => ({activity: findActivity(r.activityId), daysAgo: daysBetween(r.date, date)}))
        .filter((r) => r.activity && r.daysAgo >= 0 && r.daysAgo <= HISTORY_DAYS);
    const areaCounts = {};
    recent.forEach((r) => r.activity.areas.forEach((area) => (areaCounts[area] = (areaCounts[area] ?? 0) + 1)));
    const ctx = {
        child,
        months,
        recent,
        areaCounts,
        prefs: preferencesOf(child.id),
        shownIds: new Set(shown.map((r) => r.activityId)),
    };
    return catalogue
        .filter((a) => isEligible(a, child, months) && !excludeIds.has(a.id))
        .map((activity) => ({activity, score: scoreActivity(activity, ctx)}))
        .sort((x, y) => y.score - x.score);
};

const pickActivity = (child, date, excludeIds) => rankActivities(child, date, excludeIds)[0]?.activity;

/* --- Daily recommendation --- */

const recommendationsOn = (childId, date) =>
    data.recommendations.filter((r) => r.childId === childId && r.date === date);

const setStatus = (rec, status) => Object.assign(rec, {status, updatedAt: now()});

const addRecommendation = (childId, date, activity) => {
    const time = now();
    const rec = {id: uid(), childId, date, activityId: activity.id, status: "recommended", createdAt: time, updatedAt: time};
    data.recommendations.push(rec);
    return rec;
};

// One recommendation per child and day: created once, then kept until the parent asks for another
const todayRecommendation = (child) => {
    const date = dateKey();
    const todays = recommendationsOn(child.id, date);
    const current = todays.findLast((r) => r.status !== "replaced");
    if (current && isAvailable(findActivity(current.activityId))) return current;
    // the activity has left the catalogue or lost its safety review
    if (current && !FINISHED.includes(current.status)) setStatus(current, "replaced");
    const activity = pickActivity(child, date, new Set(todays.map((r) => r.activityId)));
    const rec = activity ? addRecommendation(child.id, date, activity) : null;
    if (current || rec) saveData();
    return rec;
};

// The replaced recommendation stays in history and is not a negative evaluation.
// Activities already shown today come back only when nothing else is left.
const replaceRecommendation = (child, current) => {
    const shownToday = new Set(recommendationsOn(child.id, current.date).map((r) => r.activityId));
    const activity =
        pickActivity(child, current.date, shownToday) ?? pickActivity(child, current.date, new Set([current.activityId]));
    if (!activity) return false;
    updateData(() => {
        if (!FINISHED.includes(current.status)) setStatus(current, "replaced");
        addRecommendation(child.id, current.date, activity);
    });
    return true;
};

// ==========================================================================
// 10. FEEDBACK
// ==========================================================================

const feedbackFor = (recId) => data.feedback.findLast((f) => f.recommendationId === recId);

const adjustPreference = (childId, kind, id, delta) => {
    const p = getPreference(childId, kind, id);
    p.score = clamp(p.score + delta, -100, 100);
    p.updatedAt = now();
};

// Only explicit observations change preferences: lack of time, materials or mood says nothing about interest.
// Responses add up, so repeated ones weigh more than a single one, and nothing is ever excluded for good.
const applyFeedback = ({childId, interest, difficulty, reason}, activity) => {
    const sign = INTEREST_SIGN[interest];
    if (sign) {
        activity.interestTags.forEach((tag) => adjustPreference(childId, "interest", tag, sign * PREFERENCE_STEP));
        adjustPreference(childId, "activity", activity.id, sign * PREFERENCE_STEP);
    }
    if (reason === "not_suitable") adjustPreference(childId, "activity", activity.id, -PREFERENCE_STEP);
    const shift = DIFFICULTY_SIGN[difficulty];
    if (shift) activity.areas.forEach((area) => adjustPreference(childId, "difficulty", area, shift * DIFFICULTY_STEP));
};

const saveFeedback = (rec, fields) =>
    updateData((d) => {
        const feedback = {
            id: uid(),
            childId: rec.childId,
            activityId: rec.activityId,
            recommendationId: rec.id,
            date: rec.date,
            ...fields,
            createdAt: now(),
        };
        d.feedback.push(feedback);
        setStatus(rec, fields.status === "skipped" ? "not_completed" : fields.status);
        applyFeedback(feedback, findActivity(rec.activityId));
    });

// Forgets what was learned from feedback. History and manual interest marks stay.
const resetInferredPreferences = (childId) =>
    updateData((d) => {
        d.preferences = d.preferences.filter((p) => p.childId !== childId || p.manual);
        d.preferences.forEach((p) => {
            if (p.childId === childId) p.score = 0;
        });
    });

// ==========================================================================
// 11. UI COMPONENTS
// ==========================================================================

// Re-renders a group of buttons and keeps keyboard focus on the same position
const replaceButtons = (container, buttons) => {
    const focused = [...container.children].indexOf(document.activeElement);
    container.replaceChildren(...buttons);
    container.children[focused]?.focus();
};

// Chips for single or multiple choice
const renderChoices = (container, options, labels, isSelected, onSelect) =>
    replaceButtons(
        container,
        options.map((option) =>
            el("button", {
                type: "button",
                className: isSelected(option) ? "tap selected" : "tap",
                ariaPressed: isSelected(option),
                textContent: labels[option],
                onclick: () => onSelect(option),
            }),
        ),
    );

let onConfirm = null;

const confirmAction = (text, yesLabel, action) => {
    confirmText.textContent = text;
    confirmYes.textContent = yesLabel;
    confirmNo.classList.toggle("hidden", !action);
    onConfirm = action;
    confirmDialog.returnValue = "";
    confirmDialog.showModal();
};

const showMessage = (text) => confirmAction(text, "OK", null);

confirmDialog.onclose = () => {
    if (confirmDialog.returnValue === "yes") onConfirm?.();
};

document.querySelectorAll("dialog .close").forEach((button) => {
    button.onclick = () => button.closest("dialog").close();
});

// ==========================================================================
// 12. HEADER
// ==========================================================================

const renderHeader = () => {
    const child = activeChild();
    header.classList.toggle("hidden", !child);
    if (!child) return;
    childSelect.replaceChildren(
        ...data.children.map((c) => el("option", {value: c.id, textContent: c.name, selected: c === child})),
    );
    childAge.textContent = formatAge(child.birthDate);
};

childSelect.onchange = () => {
    updateData((d) => (d.activeChildId = childSelect.value));
    render();
};

// ==========================================================================
// 13. TODAY
// ==========================================================================

let todayRec = null;

// An older child is the one case the generic explanation does not cover
const emptyReason = (child) => {
    const months = child && ageOf(child.birthDate).months;
    const maxAge = Math.max(...catalogue.map((a) => a.ageMaxMonths));
    return catalogue.length && months > maxAge ? S.noActivityForAge(maxAge) : S.noActivityText;
};

// Status and the observations from feedback, if any
const resultText = (rec) => {
    const fb = feedbackFor(rec.id);
    return phrase([
        S.statuses[fb?.status ?? rec.status],
        fb && fb.interest !== "not_observed" && S.interestFeedback[fb.interest],
        fb && fb.difficulty !== "not_observed" && S.difficultyFeedback[fb.difficulty],
        fb?.reason && S.reasons[fb.reason],
    ]);
};

const renderToday = () => {
    todayDate.textContent = capitalize(formatDate(dateKey(), {weekday: "long", day: "numeric", month: "long"}));
    const child = activeChild();
    // without the catalogue the stored recommendation cannot be checked, so it is left untouched
    todayRec = child && !catalogueError ? todayRecommendation(child) : null;
    welcome.classList.toggle("hidden", !!child);
    todayDate.classList.toggle("hidden", !child);
    todayEmpty.classList.toggle("hidden", !child || !!todayRec);
    todayActivity.classList.toggle("hidden", !todayRec);
    todayEmptyText.textContent = catalogueError ? S.catalogueError : emptyReason(child);
    changeConditions.classList.toggle("hidden", catalogueError);
    if (!todayRec) return;

    const {status} = todayRec;
    const finished = FINISHED.includes(status);
    todayBody.replaceChildren(...activityContent(findActivity(todayRec.activityId), false));
    todayStatus.textContent = resultText(todayRec);
    todayStatus.classList.toggle("hidden", status === "recommended");
    todayMain.textContent = status === "in_progress" ? S.finish : S.start;
    todayMain.classList.toggle("hidden", finished);
    todayAnother.textContent = finished ? S.oneMore : S.another;
};

todayMain.onclick = () => {
    if (todayRec.status === "in_progress") return openFeedback();
    updateData(() => setStatus(todayRec, "in_progress"));
    renderToday();
};

todayAnother.onclick = () => {
    if (!replaceRecommendation(activeChild(), todayRec)) showMessage(S.noAlternative);
    renderToday();
    window.scrollTo(0, 0);
};

todayDetails.onclick = () => openActivity(findActivity(todayRec.activityId));

openCatalogue.onclick = () => showPage("activities");
changeConditions.onclick = () => showPage("child");

/* --- Feedback form --- */

let draft = null;

const renderFeedbackForm = () => {
    const pick = (key) => (value) => {
        draft[key] = value;
        renderFeedbackForm();
    };
    renderChoices(fbStatus, FEEDBACK_STATUSES, S.feedbackStatuses, (v) => v === draft.status, pick("status"));
    renderChoices(fbInterest, FEEDBACK_INTERESTS, S.interestFeedback, (v) => v === draft.interest, pick("interest"));
    renderChoices(fbDifficulty, FEEDBACK_DIFFICULTIES, S.difficultyFeedback, (v) => v === draft.difficulty, pick("difficulty"));
    renderChoices(fbReason, REASONS, S.reasons, (v) => v === draft.reason, pick("reason"));
    fbObserved.classList.toggle("hidden", draft.status === "skipped");
    fbReasonField.classList.toggle("hidden", !NEEDS_REASON.includes(draft.status));
};

const openFeedback = () => {
    draft = {status: "completed", interest: "not_observed", difficulty: "not_observed", reason: null};
    fbComment.value = "";
    renderFeedbackForm();
    feedbackDialog.showModal();
};

feedbackForm.onsubmit = () => {
    const skipped = draft.status === "skipped";
    saveFeedback(todayRec, {
        status: draft.status,
        interest: skipped ? "not_observed" : draft.interest,
        difficulty: skipped ? "not_observed" : draft.difficulty,
        reason: NEEDS_REASON.includes(draft.status) ? draft.reason : null,
        comment: fbComment.value.trim() || null,
    });
    renderToday();
};

// ==========================================================================
// 14. ACTIVITY DETAILS
// ==========================================================================

const block = (title, content, className = "") =>
    el("section", {className: `block ${className}`}, el("h3", {textContent: title}), content);

const listOf = (tag, className, items) => el(tag, {className}, ...items.map((text) => el("li", {textContent: text})));

const areaMarks = (a) =>
    el(
        "span",
        {className: "areas"},
        ...a.areas.map((area) => el("span", {className: `area area-${area}`, textContent: S.areas[area]})),
    );

// Rows of a definition list from [term, text] pairs; false rows are skipped
const factRows = (rows) =>
    rows.filter(Boolean).flatMap(([term, text]) => [el("dt", {textContent: term}), el("dd", {textContent: text})]);

const facts = (rows) => el("dl", {className: "facts"}, ...factRows(rows));

const ageRangeText = (a) => S.ageRange(a.ageMinMonths, a.ageMaxMonths);

const externalLinks = (links) =>
    el(
        "ul",
        {className: "links"},
        ...links
            .filter(({url}) => /^https?:\/\//.test(url))
            .map(({title, url, sourceName, language, duration}) =>
                el(
                    "li",
                    {},
                    el("a", {href: url, target: "_blank", rel: "noopener noreferrer", textContent: title}),
                    el("span", {
                        className: "help small",
                        textContent: [sourceName, language, duration].filter(Boolean).join(", "),
                    }),
                ),
            ),
    );

// Full details for the dialog, a compact version for the Today screen
const activityContent = (a, full) =>
    [
        full &&
            !isAvailable(a) &&
            el("p", {className: "warning", textContent: a.enabled ? S.notReviewedNote : S.disabledNote}),
        areaMarks(a),
        el(full ? "h2" : "h1", {textContent: a.title}),
        el("p", {className: "lead", textContent: a.description}),
        facts([
            [S.goal, a.goal],
            full && [S.age, ageRangeText(a)],
            [S.duration, `${a.duration} ${S.units.minutes}`],
            full && [S.place, S.environment[a.environment]],
            full && [S.character, S.intensity[a.intensity]],
            full && [S.difficultyTitle, S.difficulty[a.difficulty]],
            [S.materialsTitle, phrase(a.materials.map((m) => S.materials[m])) || S.noMaterials],
        ]),
        block(S.instructions, listOf("ol", "steps", a.instructions)),
        full &&
            a.variations &&
            block(S.variations, facts(["easier", "harder"].map((key) => a.variations[key] && [S[key], a.variations[key]]))),
        block(S.safety, listOf("ul", "bullets", a.safety), "safety"),
        a.videos.length > 0 && block(S.videos, externalLinks(a.videos)),
        full && a.sources.length > 0 && block(S.sources, externalLinks(a.sources)),
    ].filter(Boolean);

const openActivity = (activity) => {
    activityBody.replaceChildren(...activityContent(activity, true));
    activityDialog.showModal();
    activityBody.scrollTop = 0;
};

// ==========================================================================
// 15. ACTIVITIES
// ==========================================================================

const option = (value, textContent) => el("option", {value, textContent});

const areaOptions = () => [option("", S.allAreas), ...AREAS.map((area) => option(area, S.areas[area]))];

const fillFilters = () => {
    filterArea.append(...areaOptions());
    filterAge.append(
        option("", S.anyAge),
        option("child", S.childAgeFilter),
        ...AGE_RANGES.map(([min, max]) => option(`${min}-${max}`, S.ageRange(min, max))),
    );
    filterDuration.append(...DURATION_LIMITS.map((d) => option(d, d ? S.durationLimits[d] : S.anyDuration)));
    filterInterest.append(option("", S.allInterests), ...INTERESTS.map((tag) => option(tag, S.interests[tag])));
};

const ageFilterRange = (child) => {
    if (filterAge.value !== "child") return filterAge.value && filterAge.value.split("-").map(Number);
    const {months} = ageOf(child.birthDate);
    return [months, months];
};

const activityItem = (a) =>
    el(
        "li",
        {},
        el(
            "button",
            {className: "item", onclick: () => openActivity(a)},
            el(
                "span",
                {className: "item-title"},
                el("span", {textContent: a.title}),
                !isAvailable(a) && el("span", {className: "badge", textContent: a.enabled ? S.notReviewed : S.disabled}),
            ),
            el("span", {className: "help small", textContent: phrase([ageRangeText(a), `${a.duration} ${S.units.minutes}`])}),
            areaMarks(a),
        ),
    );

const renderActivities = () => {
    const child = activeChild();
    filterAge.options[1].disabled = !child;
    if (!child && filterAge.value === "child") filterAge.value = "";

    const query = normalize(searchInput.value.trim());
    const range = ageFilterRange(child);
    const duration = Number(filterDuration.value);
    const list = catalogue.filter(
        (a) =>
            normalize(a.title).includes(query) &&
            (!filterArea.value || a.areas.includes(filterArea.value)) &&
            (!range || (a.ageMinMonths <= range[1] && a.ageMaxMonths >= range[0])) &&
            (!duration || a.duration <= duration) &&
            (!filterInterest.value || a.interestTags.includes(filterInterest.value)),
    );
    activityList.replaceChildren(...list.map(activityItem));
    activityEmpty.classList.toggle("hidden", list.length > 0 || catalogueError);
    catalogueStatus.textContent = catalogueError
        ? S.catalogueError
        : S.catalogueStatus(catalogue.filter(isAvailable).length, catalogue.length);
};

[searchInput, filterArea, filterAge, filterDuration, filterInterest].forEach((input) => {
    input.oninput = renderActivities;
});

// ==========================================================================
// 16. CHILD
// ==========================================================================

const renderSkills = (child) =>
    skillsList.replaceChildren(
        ...AREAS.map((area) => {
            const count = el("span", {className: "help small"});
            const updateCount = () =>
                (count.textContent = S.observed(
                    SKILLS[area].filter((id) => skillLevel(child, id) !== "unknown").length,
                ));
            updateCount();
            return el(
                "details",
                {},
                el("summary", {}, el("span", {textContent: S.areas[area]}), count),
                ...SKILLS[area].map((id) =>
                    el(
                        "label",
                        {className: "skill"},
                        el("span", {textContent: S.skills[id]}),
                        el(
                            "select",
                            {
                                className: "input",
                                onchange: (e) => {
                                    setSkillLevel(child, id, e.target.value);
                                    updateCount();
                                },
                            },
                            ...SKILL_LEVELS.map((level) =>
                                el("option", {
                                    value: level,
                                    textContent: S.levels[level],
                                    selected: skillLevel(child, id) === level,
                                }),
                            ),
                        ),
                    ),
                ),
            );
        }),
    );

// Manual mark, or a noticeable score inferred from feedback
const interestState = (p) =>
    p?.manual ?? (p?.score >= INFERRED_HINT ? "inferredLike" : p?.score <= -INFERRED_HINT ? "inferredDislike" : null);

const renderInterests = (child) =>
    replaceButtons(
        interestsList,
        INTERESTS.map((tag) => {
            const state = interestState(findPreference(child.id, "interest", tag));
            return el("button", {
                type: "button",
                className: `tap ${{like: "selected", dislike: "excluded"}[state] ?? ""}`,
                ariaLabel: state ? `${S.interests[tag]}: ${S.interestStates[state]}` : S.interests[tag],
                textContent: S.interests[tag] + ({inferredLike: " ↑", inferredDislike: " ↓"}[state] ?? ""),
                onclick: () => {
                    toggleInterest(child, tag);
                    renderInterests(child);
                },
            });
        }),
    );

const renderConditions = (child) => {
    const {conditions} = child;
    const choose = (key) => (value) => {
        setCondition(child, key, value);
        renderConditions(child);
    };
    renderChoices(conditionDuration, DURATION_LIMITS, S.durationLimits, (v) => v === conditions.duration, choose("duration"));
    renderChoices(conditionEnvironment, ENVIRONMENT_PREFS, S.environmentPrefs, (v) => v === conditions.environment, choose("environment"));
    renderChoices(conditionIntensity, INTENSITY_PREFS, S.intensityPrefs, (v) => v === conditions.intensity, choose("intensity"));
    renderChoices(conditionMaterials, MATERIALS, S.materials, (v) => conditions.materials.includes(v), (v) =>
        choose("materials")(toggle(conditions.materials, v)),
    );
};

const renderChild = () => {
    const child = activeChild();
    childNone.classList.toggle("hidden", !!child);
    childProfile.classList.toggle("hidden", !child);
    if (!child) return;
    childInfo.replaceChildren(
        ...factRows([
            [S.name, child.name],
            [S.birthDate, formatDate(child.birthDate, {day: "numeric", month: "long", year: "numeric"})],
            [S.age, formatAge(child.birthDate)],
            child.gender !== "unspecified" && [S.genderTitle, S.genders[child.gender]],
        ]),
    );
    renderSkills(child);
    renderInterests(child);
    renderConditions(child);
};

childDelete.onclick = () => {
    const child = activeChild();
    confirmAction(S.deleteChildQuestion(child.name), S.delete, () => {
        deleteChild(child.id);
        render();
    });
};

/* --- Child form --- */

let editedChild = null;
let formGender = "unspecified";

const renderGender = () =>
    renderChoices(childGender, GENDERS, S.genders, (g) => g === formGender, (g) => {
        formGender = g;
        renderGender();
    });

const openChildForm = (child) => {
    editedChild = child;
    childFormTitle.textContent = child ? S.editChild : S.newChild;
    childNameInput.value = child?.name ?? "";
    childBirthInput.value = child?.birthDate ?? "";
    childBirthInput.max = dateKey();
    formGender = child?.gender ?? "unspecified";
    renderGender();
    childDialog.showModal();
};

childForm.onsubmit = () => {
    const fields = {name: childNameInput.value.trim(), birthDate: childBirthInput.value, gender: formGender};
    if (editedChild) editChild(editedChild, fields);
    else createChild(fields);
    render();
};

childEdit.onclick = () => openChildForm(activeChild());

document.querySelectorAll(".add-child").forEach((button) => {
    button.onclick = () => openChildForm(null);
});

// ==========================================================================
// 17. HISTORY
// ==========================================================================

const HISTORY_FILTERS = {
    all: () => true,
    completed: (status) => status === "completed" || status === "partially_completed",
    skipped: (status) => ["not_completed", "skipped", "replaced"].includes(status),
};

let historyFilter = "all";

const historyItem = (rec) => {
    const activity = findActivity(rec.activityId);
    const comment = feedbackFor(rec.id)?.comment;
    return el(
        "li",
        {},
        el(
            "button",
            {className: "item", disabled: !activity, onclick: () => openActivity(activity)},
            el("span", {
                className: "help small",
                textContent: formatDay(rec.date),
            }),
            el("span", {className: "item-title", textContent: activity?.title ?? S.unknownActivity}),
            el("span", {className: "small", textContent: resultText(rec)}),
            comment && el("span", {className: "help small item-quote", textContent: `«${comment}»`}),
        ),
    );
};

const renderHistory = () => {
    const child = activeChild();
    renderChoices(historyFilterChips, Object.keys(HISTORY_FILTERS), S.historyFilters, (f) => f === historyFilter, (f) => {
        historyFilter = f;
        renderHistory();
    });
    const area = historyArea.value;
    const items = data.recommendations
        .filter(
            (r) =>
                r.childId === child?.id &&
                HISTORY_FILTERS[historyFilter](feedbackFor(r.id)?.status ?? r.status) &&
                (!area || findActivity(r.activityId)?.areas.includes(area)),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    historyList.replaceChildren(...items.map(historyItem));
    historyEmpty.classList.toggle("hidden", items.length > 0);
};

historyArea.oninput = renderHistory;

// ==========================================================================
// 18. SETTINGS
// ==========================================================================

const renderSettings = () => {
    resetPreferencesButton.disabled = !activeChild();
};

exportButton.onclick = exportData;
importButton.onclick = () => importInput.click();

importInput.onchange = async () => {
    const file = importInput.files[0];
    importInput.value = "";
    if (!file) return;
    let imported = null;
    try {
        imported = JSON.parse(await file.text());
    } catch {
        imported = null;
    }
    if (!isValidImport(imported)) return showMessage(S.importError);
    confirmAction(S.importQuestion, S.importConfirm, () => {
        importData(imported);
        showPage("today");
    });
};

resetPreferencesButton.onclick = () => {
    const child = activeChild();
    confirmAction(S.resetQuestion(child.name), S.resetConfirm, () => resetInferredPreferences(child.id));
};

deleteAllButton.onclick = () =>
    confirmAction(S.deleteAllQuestion, S.delete, () => {
        deleteAllData();
        showPage("today");
    });

// ==========================================================================
// 19. NAVIGATION
// ==========================================================================

const renderers = {
    today: renderToday,
    activities: renderActivities,
    history: renderHistory,
    child: renderChild,
    settings: renderSettings,
};

let currentPage = "today";

const render = () => {
    renderHeader();
    renderers[currentPage]();
};

const showPage = (name) => {
    currentPage = name;
    navButtons.forEach((button) => {
        const active = button.dataset.page === name;
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
        $(`${button.dataset.page}-page`).classList.toggle("hidden", !active);
    });
    window.scrollTo(0, 0);
    render();
};

nav.onclick = (e) => {
    const button = e.target.closest("button");
    if (button) showPage(button.dataset.page);
};

// ==========================================================================
// 20. INIT
// ==========================================================================

(async () => {
    translatePage();
    fillFilters();
    historyArea.append(...areaOptions());
    loadData();
    await loadCatalogue();
    showPage("today");
    navigator.serviceWorker?.register("sw.js", {updateViaCache: "none"});

    // the date changes while the app stays open: refresh age and the daily screen
    let renderedDay = dateKey();
    document.addEventListener("visibilitychange", () => {
        if (document.hidden || dateKey() === renderedDay) return;
        renderedDay = dateKey();
        render();
    });
})();
