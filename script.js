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

const DURATION_LIMITS = [0, 5, 10, 15]; // minutes, 0 means no limit
const ENVIRONMENT_PREFS = ["either", "home", "outdoors"];
const INTENSITY_PREFS = ["either", "calm", "active"];

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

const FEEDBACK_STATUSES = ["skipped", "not_completed", "partially_completed", "completed"];
const FEEDBACK_INTERESTS = ["not_observed", "disliked", "neutral", "liked"];
const FEEDBACK_DIFFICULTIES = ["not_observed", "too_easy", "appropriate", "too_hard"];
const REASONS = ["no_time", "no_materials", "child_not_in_mood", "not_suitable", "other"];
const NEEDS_REASON = ["not_completed", "skipped"];

const DAILY_LOG_METRICS = {
    weight: {decimals: 0, step: 100, max: 9999, target: 100, color: "--red"},
    poop: {decimals: 0, step: 1, max: 20, target: 3, color: "--yellow"},
    pee: {decimals: 0, step: 1, max: 30, target: 10, color: "--blue"},
    sleep: {decimals: 1, step: 0.5, max: 24, target: 8, color: "--violet"},
    tummy: {decimals: 0, step: 5, max: 300, target: 60, color: "--green"},
    feed: {decimals: 0, step: 1, max: 30, target: 8, color: "--pink"},
    spit: {decimals: 0, step: 1, max: 20, target: 3, color: "--sky"},
    temp: {decimals: 1, step: 0.1, max: 45, target: 37.5, color: "--red"},
};

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
        appName: "Занятия с ребенком",
        units: {days: "дн.", weeks: "нед.", months: "мес.", years: "г.", minutes: "мин"},
        firstDay: "первый день",

        /* --- Navigation --- */
        navigation: "Основная навигация",
        calendar: "Календарь",
        activity: "Занятие",
        statistics: "Статистика",
        child: "Ребенок",
        settings: "Настройки",
        nextChild: "Следующий ребенок",

        /* --- Common --- */
        save: "Сохранить",
        cancel: "Отмена",
        close: "Закрыть",
        delete: "Удалить",
        clear: "Очистить",
        yes: "Да",
        storageError: "Не удалось сохранить данные: в браузере закончилось место.",

        /* --- Calendar --- */
        previousMonth: "Предыдущий месяц",
        nextMonth: "Следующий месяц",
        calendarEmpty: "не было занятий",
        weekdaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],

        /* --- Activity --- */
        welcomeTitle: "Идея для игры с малышом на каждый день",
        welcomeText:
            "Расскажите о ребенке, и приложение будет предлагать одно занятие в день " +
            "с учетом возраста, навыков и интересов.",
        localDataNote: "Данные хранятся только на этом устройстве и никуда не отправляются.",
        noActivityTitle: "Сегодня подходящих занятий нет",
        noActivityText:
            "Приложение предлагает только занятия, которые подходят по возрасту и условиям " +
            "и прошли проверку безопасности. Сейчас таких нет. Посмотрите каталог " +
            "или измените условия в профиле ребенка.",
        noActivityForAge: (max) => `Сейчас в каталоге есть занятия для детей до ${max} мес.`,
        browseCatalogue: "Открыть каталог",
        changeConditions: "Изменить условия",
        another: "Другое занятие",
        oneMore: "Еще одно занятие",
        noAlternative: "Других подходящих занятий на сегодня нет.",
        activityName: "Название занятия",
        searchActivity: "Найти занятие",
        searchTitle: "Поиск занятий",
        createActivity: "Новое занятие",
        descriptionLabel: "Описание",
        actualDuration: "Сколько длилось",
        durationMinutes: "Длительность, мин",
        ageFrom: "Возраст от, мес.",
        ageTo: "Возраст до, мес.",
        developmentAreas: "Развивающие области",
        createError: "Заполните название, описание, развивающие области, инструкции и безопасность.",
        createdActivity: "Занятие добавлено.",
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
        feedbackInterest: "Интерес ребенка",
        feedbackDifficulty: "Сложность",
        feedbackReason: "Что помешало",
        dateLabel: "Дата",
        timeLabel: "Время",
        selectDate: "Выбрать дату",
        selectTime: "Выбрать время",
        selectHour: "Выбрать часы",
        selectMinute: "Выбрать минуты",
        previous: "Назад",
        next: "Вперед",
        dailyLogTitle: "Показатели дня",
        valueLabel: "Значение",
        decrease: "Уменьшить",
        increase: "Увеличить",
        dailyLogLabels: {
            weight: "Вес",
            poop: "Покаки",
            pee: "Пописи",
            sleep: "Сон",
            tummy: "Пузико",
            feed: "Сися",
            spit: "Срыги",
            temp: "Темпа",
        },
        dailyLogUnits: {
            weight: "г",
            poop: "раз",
            pee: "раз",
            sleep: "ч",
            tummy: "мин",
            feed: "раз",
            spit: "раз",
            temp: "°C",
        },
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

        mons: [
            "янв",
            "фев",
            "мар",
            "апр",
            "мая",
            "июн",
            "июл",
            "авг",
            "сен",
            "окт",
            "ноя",
            "дек",
        ],

        /* --- Statistics --- */
        statsEmpty: "Пока нет завершенных занятий. Запишите первое занятие на вкладке «Занятие».",
        frequencyTitle: "Частота занятий",
        timeTitle: "Время с ребенком",
        areasTitle: "Развивающие области",
        consistencyTitle: "Регулярность",
        feedbackTrendTitle: "Оценки занятий",
        positiveTitle: "Что нравится",
        positiveActivities: "Занятия",
        positiveSkills: "Навыки",
        activeDays: (n) => `Активных дней: ${n}`,
        longestGap: (n) => `Самый длинный перерыв: ${n} дн.`,
        entriesCount: (n) => {
            const mod10 = n % 10;
            const mod100 = n % 100;
            const word = mod10 === 1 && mod100 !== 11 ? "занятие" : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? "занятия" : "занятий";
            return `${n} ${word}`;
        },
        totalMinutes: (n) => `${n} мин`,
        noData: "Нет данных",
        weeks: (n) => `Последние ${n} недель`,
        positiveEmpty: "Пока нет положительных отметок.",
        calendarDay: (count, minutes) => `${count} занятий, ${minutes} мин`,
        /* --- Child profile --- */
        noChildText: "Пока нет ни одного профиля.",
        addChild: "Добавить ребенка",
        newChild: "Новый ребенок",
        profileTitle: "Профиль",
        age: "Возраст",
        name: "Имя",
        birthDate: "Дата рождения",
        dueDate: "ПДР (необязательно)",
        gender: "Пол (необязательно)",
        genders: {unspecified: "Не указан", female: "Девочка", male: "Мальчик"},
        deleteChild: "Удалить профиль",
        deleteChildQuestion: (name) =>
            `Удалить профиль «${name}» вместе с историей занятий? Это действие нельзя отменить.`,

        skillsTitle: "Навыки",
        skillsNote:
            "Отмечайте то, что замечаете сами. Это ваши наблюдения, а не медицинская " +
            "или стандартизированная оценка развития. Каждый ребенок развивается в своем темпе.",
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
        anyDuration: "Любое время",
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
        ageRange: (min, max) => `${min}–${max} мес`,
        notReviewed: "Не проверено",
        disabled: "Отключено",
        notReviewedNote:
            "Это занятие еще не проверено на безопасность, поэтому приложение его не рекомендует.",
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
        unknownActivity: "Занятие удалено из каталога",

        /* --- Settings --- */
        privacyNote:
            "Все данные хранятся только на этом устройстве, никуда не отправляются " +
            "и не синхронизируются между устройствами. Чтобы перенести их, используйте экспорт и импорт.",
        disclaimer:
            "Приложение помогает выбрать занятие для игры и общения. Оно не ставит диагнозы, " +
            "не оценивает развитие и не заменяет консультацию педиатра. Делайте столько занятий, " +
            "сколько удобно вашей семье.",
        support: "Сказать спасибо",
        mailTo: "Написать нам",
        privacy: "Политика конфиденциальности",
        exportData: "Экспорт данных",
        importData: "Импорт данных",
        resetPreferences: "Сбросить выводы из отзывов",
        deleteAll: "Удалить все данные",
        importError: "Не удалось прочитать файл. Выберите файл, сохраненный через «Экспорт данных».",
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
            releasing: "Кладет и отпускает предметы",
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
            scarf: "Легкий платок",
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
// 3. STATE
// ==========================================================================

let data;
let catalogue = [];
let catalogueBase = [];
let catalogueError = false;
let todayRec = null;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = "";
let createAreas = [];

let currentPage = "calendar";
let activityArea = "";
let ageFilter = null;
let durationFilter = "0";
let interestFilters = [];
let draft = {date: "", time: "", status: "skipped", interest: "not_observed", difficulty: "not_observed", reason: null};
let draftRecId = null;
let editingRecId = null;
let activityDate = null;

let childFormNew = false;
let formGender = "unspecified";

let openedSheet = null;
let onModalYes = null;
let scrollLocked = false;
let lockedScrollY = 0;

// ==========================================================================
// 4. HELPERS
// ==========================================================================

const $ = (id) => document.getElementById(id);

const pad = (n) => String(n).padStart(2, "0");

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const now = () => new Date().toISOString();

const timeKey = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const timeFromTimestamp = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : timeKey(date);
};

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

const debounce = (fn, ms) => {
    let timer = null;
    let lastArgs = [];
    const call = (...args) => {
        lastArgs = args;
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
    call.flush = () => {
        if (timer === null) return;
        clearTimeout(timer);
        timer = null;
        fn(...lastArgs);
    };
    return call;
};

const icon = (name, className = "tool") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `sprite.svg#${name}`);
    svg.append(use);
    return svg;
};

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
// 5. DOM ELEMENTS
// ==========================================================================

/* --- Pages and navigation --- */
const pages = {
    calendar: $("calendar-page"),
    activity: $("activity-page"),
    search: $("search-page"),
    create: $("create-page"),
    stats: $("stats-page"),
    child: $("child-page"),
    settings: $("settings-page"),
};

const nav = $("nav");
const navBar = $("nav-bar");
const navButtons = [...nav.querySelectorAll("button")];

const header = $("top");
const topSelected = $("top-selected");
const topChildren = $("top-children");
const childSelect = $("child-select");
const childAge = $("child-age");
const childNames = $("child-names");

/* --- Calendar --- */
const calendarWelcome = $("calendar-welcome");
const calendarMain = $("calendar-main");
const calendarEl = $("calendar");
const calendars = $("calendars");
const chosenDay = $("chosen-day");
const dayEntries = $("day-entries");
const logRings = $("log-rings");

/* --- Activity --- */
const activityWelcome = $("activity-welcome");
const activityMain = $("activity-main");
const activityName = $("activity-name");
const activityNameClear = $("activity-name-clear");
const activitySuggestions = $("activity-suggestions");
const activitySearch = $("activity-search");
const activityAdd = $("activity-add");
const activityRefresh = $("activity-refresh");
const activityNoResult = $("activity-no-result");
const activityBody = $("activity-body");
const feedbackForm = $("feedback-form");
const fbDate = $("fb-date");
const fbDateValue = $("fb-date-value");
const fbTime = $("fb-time");
const fbTimeValue = $("fb-time-value");
const activityConfirm = $("activity-confirm");
const activityCancel = $("activity-cancel");
const timePicker = $("time-picker");
const clock = $("clock");
const hand = $("hand");
const line = $("line");
const white = $("white");
const black = $("black");
const timeDayButton = $("time-day");
const timeHourButton = $("time-hour");
const timeMinuteButton = $("time-minute");
const timeCalendar = $("time-calendar");
const timeWeekdays = $("time-weekdays");
const timeDays = $("time-days");
const timePrev = $("time-prev");
const timeNext = $("time-next");
const timeCancel = $("time-cancel");
const timeApply = $("time-apply");

/* --- Settings --- */
const exportButton = $("export");
const importButton = $("import");
const importInput = $("import-input");
const resetPreferencesButton = $("reset-preferences");
const deleteAllButton = $("delete-all");

/* --- Child --- */
const childPageTitle = $("child-page-title");
const childNone = $("child-none");
const childProfile = $("child-profile");
const childDetails = $("child-details");
const childDelete = $("child-delete");
const skillsList = $("skills");
const interestsList = $("interests");
const conditionDuration = $("condition-duration");
const conditionEnvironment = $("condition-environment");
const conditionIntensity = $("condition-intensity");
const conditionMaterials = $("condition-materials");

/* --- Feedback --- */
const fbStatus = $("fb-status");
const fbStatusValue = $("fb-status-value");
const fbObserved = $("fb-observed");
const fbInterest = $("fb-interest");
const fbInterestValue = $("fb-interest-value");
const fbDifficulty = $("fb-difficulty");
const fbDifficultyValue = $("fb-difficulty-value");
const fbReasonField = $("fb-reason-field");
const fbReason = $("fb-reason");
const fbComment = $("fb-comment");
const fbDuration = $("fb-duration");
const fbDurationValue = $("fb-duration-value");

/* --- Search and create --- */
const searchInput = $("search");
const searchClear = $("search-clear");
const filterAreaChips = $("filter-area");
const filterAge = $("filter-age");
const filterAgeValue = $("filter-age-value");
const filterDuration = $("filter-duration");
const filterDurationValue = $("filter-duration-value");
const filterInterest = $("filter-interest");
const catalogueStatus = $("catalogue-status");
const activityList = $("activity-list");
const activityEmpty = $("activity-empty");
const searchBack = $("search-back");
const createCancel = $("create-cancel");
const createTitle = $("create-title");
const createDescription = $("create-description");
const createDuration = $("create-duration");
const createAgeMin = $("create-age-min");
const createAgeMax = $("create-age-max");
const createAreasEl = $("create-areas");
const createInstructions = $("create-instructions");
const createSafety = $("create-safety");
const createSave = $("create-save");

/* --- Statistics --- */
const statsEmpty = $("stats-empty");
const statsContent = $("stats-content");
const frequencyTotal = $("frequency-total");
const frequencyChart = $("frequency-chart");
const timeTotal = $("time-total");
const timeChart = $("time-chart");
const areasChart = $("areas-chart");
const consistencySummary = $("consistency-summary");
const consistencyChart = $("consistency-chart");
const feedbackChart = $("feedback-chart");
const feedbackLegend = $("feedback-legend");
const positiveActivities = $("positive-activities");
const positiveSkills = $("positive-skills");

/* --- Child form --- */
const childNameInput = $("child-name-input");
const childBirthInput = $("child-birth-input");
const childDueInput = $("child-due-input");
const childGender = $("child-gender");
const childCancel = $("child-cancel");

/* --- Overlay and modal --- */
const overlay = $("overlay");
const logSheet = $("log-sheet");
const logTitle = $("log-title");
const logValue = $("log-value");
const logUnit = $("log-unit");
const logMinus = $("log-minus");
const logPlus = $("log-plus");
const closeLog = $("close-log");
const applyLog = $("apply-log");
const modal = $("modal");
const question = $("question");
const modalYes = $("modal-yes");
const modalNo = $("modal-no");

// ==========================================================================
// 6. LANGUAGE
// ==========================================================================

const translatePage = () => {
    document.documentElement.lang = LANG;
    document.title = S.appName;

    document
        .querySelectorAll("[data-i18n]")
        .forEach((node) => (node.textContent = S[node.dataset.i18n]));
    document
        .querySelectorAll("[data-i18n-aria-label]")
        .forEach((node) =>
            node.setAttribute("aria-label", S[node.dataset.i18nAriaLabel]),
        );
    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach((node) => (node.placeholder = S[node.dataset.i18nPlaceholder]));

    childGender
        .querySelectorAll("button")
        .forEach((button) => (button.textContent = S.genders[button.dataset.gender]));
};

// ==========================================================================
// 7. STORAGE
// ==========================================================================

const emptyData = () => ({
    version: DATA_VERSION,
    children: [],
    activeChildId: null,
    recommendations: [],
    feedback: [],
    preferences: [],
    dailyLogs: [],
    settings: {},
    activities: [],
});

// Data of an older version would be migrated here, based on data.version
const loadData = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
        data = {...emptyData(), ...JSON.parse(raw)};
        if (!Array.isArray(data.activities)) data.activities = [];
        if (!Array.isArray(data.dailyLogs)) data.dailyLogs = [];
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
    d.children.every((c) => c.id && c.name && DATE_PATTERN.test(c.birthDate) && (!c.dueDate || DATE_PATTERN.test(c.dueDate)) && Array.isArray(c.skills) && c.conditions) &&
    d.recommendations.every((r) => r.childId && r.activityId && DATE_PATTERN.test(r.date) && typeof r.createdAt === "string") &&
    d.preferences.every((p) => PREFERENCE_KINDS.includes(p.kind)) &&
    (!d.dailyLogs || Array.isArray(d.dailyLogs));

const importData = (imported) => {
    data = {...emptyData(), ...imported};
    if (!Array.isArray(data.activities)) data.activities = [];
    if (!Array.isArray(data.dailyLogs)) data.dailyLogs = [];
    if (!activeChild()) data.activeChildId = data.children[0]?.id ?? null;
    refreshCatalogue();
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
// 8. UI COMPONENTS
// ==========================================================================

// Re-renders a group of buttons and keeps keyboard focus on the same position
const replaceButtons = (container, buttons) => {
    const focused = [...container.children].indexOf(document.activeElement);
    container.replaceChildren(...buttons);
    container.children[focused]?.focus();
};

// Buttons for single or multiple choice
const renderChoices = (container, options, labels, isSelected, onSelect, className = "tap chip") =>
    replaceButtons(
        container,
        options.map((option) => {
            const button = el("button", {
                type: "button",
                className: isSelected(option) ? `${className} selected` : className,
                textContent: labels[option],
                onclick: () => onSelect(option),
            });
            button.setAttribute("aria-pressed", String(isSelected(option)));
            return button;
        }),
    );

const renderAreaChoices = (container, value, onSelect) =>
    renderChoices(
        container,
        ["", ...AREAS],
        {"": S.allAreas, ...S.areas},
        (area) => area === value,
        onSelect,
    );

const setSelectValue = (button, text) => {
    button.querySelector(".select-value").textContent = text;
};

/* --- Segments --- */

const setSegment = (segment, value, attr) => {
    const buttons = [...segment.querySelectorAll("button")];
    const i = Math.max(
        0,
        buttons.findIndex((button) => button.dataset[attr] === String(value)),
    );
    segment.style.setProperty("--n", String(buttons.length));
    segment.style.setProperty("--i", String(i));
    buttons.forEach((button, j) => {
        button.classList.toggle("active", j === i);
        button.setAttribute("aria-pressed", String(j === i));
    });
};

const onSegment = (segment, attr, callback) => {
    segment.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button || button.classList.contains("active")) return;
        setSegment(segment, button.dataset[attr], attr);
        callback(button.dataset[attr]);
    });
};

/* --- Sheets and modal --- */

const updateScrollLock = () => {
    const shouldLock = !!openedSheet || !modal.hidden;
    if (shouldLock === scrollLocked) return;
    scrollLocked = shouldLock;
    if (shouldLock) {
        lockedScrollY = window.scrollY;
        document.body.style.top = `-${lockedScrollY}px`;
        document.documentElement.classList.add("scroll-locked");
    } else {
        document.documentElement.classList.remove("scroll-locked");
        document.body.style.top = "";
        window.scrollTo(0, lockedScrollY);
    }
};

const openSheet = (sheet) => {
    closeSheet();
    openedSheet = sheet;
    overlay.classList.add("open");
    openedSheet.classList.add("open");
    updateScrollLock();
};

const closeSheet = () => {
    if (!openedSheet) return;
    openedSheet.classList.remove("open");
    overlay.classList.remove("open");
    openedSheet = null;
    updateScrollLock();
};

overlay.onclick = closeSheet;

const showModal = (text, onYes = null, yesLabel = null) => {
    question.textContent = text;
    onModalYes = onYes;
    modalYes.textContent = yesLabel || (onYes ? S.yes : "OK");
    modalNo.classList.toggle("hidden", !onYes);
    modal.hidden = false;
    modal.querySelector(".dialog").scrollTop = 0;
    updateScrollLock();
};

const showMessage = (text) => showModal(text);

const closeModal = () => {
    modal.hidden = true;
    onModalYes = null;
    updateScrollLock();
};

modalYes.onclick = () => {
    const callback = onModalYes;
    closeModal();
    callback?.();
};
modalNo.onclick = closeModal;
modal.onclick = (event) => {
    if (event.target === modal) closeModal();
};

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!modal.hidden) closeModal();
    else if (openedSheet) closeSheet();
});

// ==========================================================================
// 9. PROFILE
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
// 10. CATALOGUE
// ==========================================================================

const isComplete = (activity) =>
    REQUIRED_FIELDS.every((key) => activity[key] != null && activity[key] !== "") &&
    NON_EMPTY_FIELDS.every((key) => activity[key].length > 0);

const refreshCatalogue = () => {
    catalogue = [...catalogueBase, ...(data?.activities ?? [])].filter(isComplete);
};

const loadCatalogue = async () => {
    try {
        const list = await (await fetch(CATALOGUE_URL)).json();
        catalogueBase = list.filter(isComplete);
        refreshCatalogue();
        list.filter((a) => !isComplete(a)).forEach((a) => console.warn("Incomplete activity skipped:", a.id));
    } catch {
        catalogueError = true;
    }
};

const findActivity = (id) => catalogue.find((a) => a.id === id);

// Only enabled activities that passed a safety review can be recommended
const isAvailable = (activity) => activity?.enabled === true && activity.safetyReviewed === true;

// ==========================================================================
// 11. RECOMMENDATIONS
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
const recommendationForDate = (child, date) => {
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
// 12. FEEDBACK
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
// 13. HEADER
// ==========================================================================

const renderChildNames = () => {
    childNames.replaceChildren(
        ...data.children.map((child) => {
            const selected = child.id === data.activeChildId;
            const button = el("button", {
                type: "button",
                className: `tap chip${selected ? " selected" : ""}`,
                textContent: child.name,
                onclick: () => {
                    updateData((d) => (d.activeChildId = child.id));
                    childFormNew = false;
                    render();
                },
            });
            button.setAttribute("aria-pressed", String(selected));
            return button;
        }),
    );
};

const renderHeader = () => {
    if (currentPage === "search" || currentPage === "create" || currentPage === "settings") {
        header.classList.add("hidden");
        return;
    }

    const child = activeChild();
    const childPage = currentPage === "child";
    if (!child && !childPage) {
        header.classList.add("hidden");
        return;
    }

    header.classList.remove("hidden");
    header.classList.toggle("with-close", currentPage === "activity");
    topSelected.classList.toggle("hidden", childPage);
    topChildren.classList.toggle("hidden", !childPage);

    if (childPage) {
        renderChildNames();
        return;
    }

    setSelectValue(childSelect, child.name);
    childAge.textContent = formatAge(child.birthDate);
};

header.onclick = (event) => {
    if (event.target.closest("button, a, input, textarea, select")) return;
    if (currentPage === "calendar" || currentPage === "stats") renderPage("child");
};

childSelect.onclick = () => {
    if (data.children.length < 2) return;
    const index = data.children.findIndex((child) => child.id === data.activeChildId);
    const next = data.children[(index + 1) % data.children.length];
    updateData((d) => (d.activeChildId = next.id));
    childFormNew = false;
    render();
};

// ==========================================================================
// 14. CALENDAR AND ACTIVITY
// ==========================================================================

const PERFORMED = ["completed", "partially_completed"];

const diaryEntries = (childId) =>
    data.recommendations
        .filter((rec) => rec.childId === childId)
        .map((rec) => {
            const feedback = feedbackFor(rec.id);
            const activity = findActivity(rec.activityId);
            if (!feedback) return null;
            const duration = Number.isFinite(feedback.duration)
                ? feedback.duration
                : activity?.duration ?? 0;
            return {
                rec,
                feedback,
                activity,
                date: feedback.date ?? rec.date,
                time: feedback.time || timeFromTimestamp(feedback.createdAt) || "",
                duration,
                performed: PERFORMED.includes(feedback.status),
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.rec.createdAt.localeCompare(b.rec.createdAt));

const areaWeights = (entries) => {
    const weights = {};
    entries.forEach((entry) => {
        const areas = entry.activity?.areas ?? [];
        if (!areas.length) return;
        const share = entry.duration / areas.length;
        areas.forEach((area) => (weights[area] = (weights[area] ?? 0) + share));
    });
    return weights;
};

const dominantArea = (entries) =>
    Object.entries(areaWeights(entries)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

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

const diaryBadge = (text, tone = "") =>
    el("span", {className: `badge diary-badge ${tone}`, textContent: text});

const diaryItem = (entry) => {
    const {feedback, activity, duration, time} = entry;
    const status = feedback.status;
    const reason = feedback.reason;
    const item = el(
        "div",
        {className: "entry"},
        el(
            "div",
            {className: "row between gap-10"},
            el("span", {className: "entry-title", textContent: activity?.title ?? S.unknownActivity}),
            el("span", {className: "help small", textContent: `${duration} ${S.units.minutes}`}),
        ),
        // el("span", {className: "small", textContent: resultText(entry.rec)}),
        el(
            "div",
            {className: "chips diary-chips"},
            diaryBadge(S.feedbackStatuses[status], PERFORMED.includes(status) ? "good" : "bad"),
            feedback.interest === "liked" && diaryBadge(S.interestFeedback.liked, "good"),
            feedback.difficulty === "appropriate" && diaryBadge(S.difficultyFeedback.appropriate, "good"),
            reason && diaryBadge(S.reasons[reason], "warn"),
        ),
        feedback.comment && el("span", {className: "help small entry-quote", textContent: `«${feedback.comment}»`}),
    );
    item.dataset.id = entry.rec.id;
    return item;
};

const monthKey = (date) => date.slice(0, 7);

const AREA_BACKGROUND = {
    gross_motor: "var(--green)",
    fine_motor: "var(--yellow)",
    sensory: "var(--blue)",
    cognitive: "var(--violet)",
    communication: "var(--pink)",
    social_emotional: "var(--sky)",
};

const dailyLogFor = (childId, date) =>
    data.dailyLogs.find((log) => log.childId === childId && log.date === date);

const dailyLogValues = (childId, date) => dailyLogFor(childId, date)?.values ?? {};

const setDailyLogValue = (childId, date, kind, value) =>
    updateData((d) => {
        let log = d.dailyLogs.find((item) => item.childId === childId && item.date === date);
        if (!log && value == null) return;
        if (!log) {
            log = {childId, date, values: {}};
            d.dailyLogs.push(log);
        }
        if (value == null) delete log.values[kind];
        else log.values[kind] = value;
        if (!Object.keys(log.values).length) d.dailyLogs = d.dailyLogs.filter((item) => item !== log);
    });

const formatLogValue = (value, decimals = 0) => {
    const rounded = Number(Number(value).toFixed(decimals));
    return String(rounded).replace(".", ",");
};

const normalizeLogNumber = (value, max, decimals) => {
    let next = value.replace(",", ".").replace(/[^\d.]/g, "");
    const point = next.indexOf(".");
    if (point >= 0) {
        next = decimals
            ? next.slice(0, point + 1) + next.slice(point + 1).replace(/\./g, "").slice(0, decimals)
            : next.slice(0, point);
    }
    next = next.replace(/^0+(?=\d)/, "");
    while (next && +next > max) next = next.slice(0, -1);
    return next.replace(".", ",");
};

const parseLogNumber = (value) => {
    const number = Number(String(value).replace(",", "."));
    return String(value).trim() && Number.isFinite(number) ? number : null;
};

const RING_LENGTH = 2 * Math.PI * 28;

const ringHtml = ({kind, value, target, label, unit, color, decimals}) => {
    target = Math.max(1, target);
    const valueText = value == null ? "0" : formatLogValue(value, decimals);
    let ring = "";

    if (value != null) {
        const delta = value;
        if (Math.abs(delta) > target) {
            const arrow = delta > 0 ? "M 29 0 L 32 4 L 29 9" : "M 35 0 L 32 4 L 35 9";
            ring = `<circle class="fill" cx="32" cy="32" r="28" stroke="var(${color})" />`;
            ring += `<path d="${arrow}" stroke="var(--bg)" stroke-width="2" transform="rotate(${(360 * delta) / target} 32 32)"/>`;
        } else {
            const ratio = Math.abs(delta / target);
            const length = RING_LENGTH * ratio;
            const angle = 90 + (delta < 0) * 360 * ratio;
            ring = `<circle class="fill" cx="32" cy="32" r="28"
                style="stroke:var(${color});stroke-dasharray:${length} ${RING_LENGTH}"
                transform="rotate(-${angle} 32 32)"/>`;
        }
    }

    return `<button type="button" class="ring" data-kind="${kind}" aria-label="${label}, ${unit}: ${valueText}">
        <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle class="track" cx="32" cy="32" r="28"></circle>
            ${ring}
        </svg>
        <div class="ring-value mono">${valueText}</div>
        <div class="small help center">${label}</div>
    </button>`;
};

const renderLogRings = () => {
    const child = activeChild();
    if (!child) {
        logRings.replaceChildren();
        return;
    }
    const values = dailyLogValues(child.id, selectedDate);
    logRings.innerHTML = Object.entries(DAILY_LOG_METRICS)
        .map(([kind, config]) =>
            ringHtml({
                kind,
                value: values[kind],
                target: config.target,
                label: S.dailyLogLabels[kind],
                unit: S.dailyLogUnits[kind],
                color: config.color,
                decimals: config.decimals,
            }),
        )
        .join("");
};

const calendarData = (child) => {
    const entries = diaryEntries(child.id);
    const byDate = new Map();
    entries.forEach((entry) => {
        const list = byDate.get(entry.date) ?? [];
        list.push(entry);
        byDate.set(entry.date, list);
    });
    const performedByDate = new Map();
    entries.filter((entry) => entry.performed).forEach((entry) => {
        const list = performedByDate.get(entry.date) ?? [];
        list.push(entry);
        performedByDate.set(entry.date, list);
    });
    return {byDate, performedByDate};
};

const getCalendarPage = (delta, data) => {
    const monthDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthStats = [...data.performedByDate.entries()].filter(([date]) => monthKey(date) === `${year}-${pad(month + 1)}`);
    const maxTotal = Math.max(1, ...monthStats.map(([, list]) => list.reduce((sum, entry) => sum + entry.duration, 0)));
    const today = dateKey();

    const previous = el("button", {type: "button", className: "prev"}, icon("prev"));
    previous.setAttribute("aria-label", S.previousMonth);
    const next = el("button", {type: "button", className: "next"}, icon("next"));
    next.setAttribute("aria-label", S.nextMonth);
    const heading = el(
        "h2",
        {className: "row"},
        previous,
        el("span", {className: "big", textContent: capitalize(formatDate(dateKey(monthDate), {month: "long", year: "numeric"}))}),
        next,
    );

    const grid = el("div", {className: "days"});
    S.weekdaysShort.forEach((weekday) => grid.append(el("span", {textContent: weekday})));
    for (let i = 0; i < offset; i++) grid.append(el("span", {className: "calendar-empty"}));

    for (let day = 1; day <= days; day++) {
        const date = dateKey(new Date(year, month, day));
        const dayEntriesForDate = data.byDate.get(date) ?? [];
        const performed = data.performedByDate.get(date) ?? [];
        const total = performed.reduce((sum, entry) => sum + entry.duration, 0);
        const area = dominantArea(performed);
        const markerSize = performed.length ? Math.round(16 + 20 * (total / maxTotal)) : 0;
        const number = el("span", {
            className: `${date === selectedDate ? "big " : ""}${date === today ? "today" : date > today ? "future" : ""}`,
            textContent: String(day),
        });
        const button = el(
            "button",
            {type: "button", className: date === selectedDate ? "selected" : ""},
            number,
            area &&
                el("i", {
                    style: `width:${markerSize}px;height:${markerSize}px;background:${AREA_BACKGROUND[area]}`,
                }),
        );
        button.dataset.date = date;
        button.setAttribute(
            "aria-label",
            `${formatDate(date, {day: "numeric", month: "long"})}: ${S.calendarDay(performed.length, total)}`,
        );
        if (dayEntriesForDate.length) button.classList.add("has-entries");
        grid.append(button);
    }

    return el("div", {className: "calendar"}, heading, grid);
};

const renderCalendarDay = (data) => {
    chosenDay.textContent = capitalize(formatDate(selectedDate, {weekday: "long", day: "numeric", month: "long"}));
    const selectedEntries = data.byDate.get(selectedDate) ?? [];
    dayEntries.replaceChildren(
        ...(selectedEntries.length
            ? selectedEntries.map(diaryItem)
            : [el("div", {className: "small help center", textContent: S.calendarEmpty})]),
    );
};

const renderCalendar = () => {
    if (!selectedDate) selectedDate = dateKey();
    const child = activeChild();
    calendarWelcome.classList.toggle("hidden", !!child);
    calendarMain.classList.toggle("hidden", !child);
    if (!child) return;

    const data = calendarData(child);
    calendarEl.replaceChildren(getCalendarPage(0, data));
    renderCalendarDay(data);
    renderLogRings();
};

let logKind = null;

const openLogSheet = (kind) => {
    const config = DAILY_LOG_METRICS[kind];
    const child = activeChild();
    if (!child) return;
    logKind = kind;
    const value = dailyLogValues(child.id, selectedDate)[kind];
    logTitle.textContent = S.dailyLogLabels[kind];
    logUnit.textContent = S.dailyLogUnits[kind];
    logValue.value = value == null ? "" : formatLogValue(value, config.decimals);
    logValue.inputMode = config.decimals ? "decimal" : "numeric";
    openSheet(logSheet);
};

const shiftLogValue = (diff) => {
    const config = DAILY_LOG_METRICS[logKind];
    let value = parseLogNumber(logValue.value) ?? 0;
    value = Math.min(config.max, Math.max(0, value + diff * config.step));
    logValue.value = formatLogValue(value, config.decimals);
};

const applyLogValue = () => {
    const config = DAILY_LOG_METRICS[logKind];
    const child = activeChild();
    if (!child) return;
    const parsed = parseLogNumber(logValue.value);
    const value =
        parsed == null
            ? null
            : Number(Math.min(config.max, Math.max(0, parsed)).toFixed(config.decimals));
    setDailyLogValue(child.id, selectedDate, logKind, value);
    closeSheet();
    renderLogRings();
};

logValue.addEventListener("input", () => {
    const config = DAILY_LOG_METRICS[logKind];
    logValue.value = normalizeLogNumber(logValue.value, config.max, config.decimals);
});

logMinus.onclick = () => shiftLogValue(-1);
logPlus.onclick = () => shiftLogValue(1);
closeLog.onclick = closeSheet;
applyLog.onclick = applyLogValue;

logRings.onclick = (event) => {
    const ring = event.target.closest("[data-kind]");
    if (ring) openLogSheet(ring.dataset.kind);
};

const addPageMonth = (delta) => {
    const month = calendarMonth.getMonth() + delta;
    const year = calendarMonth.getFullYear();
    const m = (month + 12) % 12;
    const y = year + delta * (month !== m);
    calendarMonth = new Date(y, m, 1);
};

calendarEl.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.classList.contains("prev") || button.classList.contains("next")) {
        addPageMonth(button.classList.contains("prev") ? -1 : 1);
        renderCalendar();
        return;
    }
    if (button.dataset.date) {
        selectedDate = button.dataset.date;
        renderCalendar();
    }
});

// --- Swipe between months ---

let startX = null;
let dragging = false;
let shift = 0;
let delta = 0;
let width = 0;

const MIN_SHIFT = 10;
const MAX_SHIFT = 40;

const renderCalendars = () => {
    const child = activeChild();
    if (!child) return;
    const data = calendarData(child);
    width = calendarEl.clientWidth + 30;
    calendars.style.setProperty("--width", `${calendarEl.clientWidth}px`);
    calendars.replaceChildren(getCalendarPage(-1, data), getCalendarPage(0, data), getCalendarPage(1, data));
    calendarEl.replaceChildren(calendars);
    calendars.style.transition = "none";
    calendars.style.transform = `translateX(-${width}px)`;
};

calendars.addEventListener("transitionend", () => {
    addPageMonth(delta);
    renderCalendar();
});

calendarEl.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    delta = 0;
    dragging = false;
});

calendarEl.addEventListener("pointermove", (event) => {
    if (startX === null) return;

    shift = event.clientX - startX;

    if (!dragging) {
        if (Math.abs(shift) < MIN_SHIFT) return;
        dragging = true;

        delta = shift > 0 ? -1 : 1;
        startX -= delta * MIN_SHIFT;
        shift += delta * MIN_SHIFT;

        renderCalendars();
        calendarEl.setPointerCapture(event.pointerId);
    }
    calendars.style.transform = `translateX(${shift - width}px)`;
});

const stopDragging = () => {
    if (startX === null) return;
    startX = null;

    if (!dragging) return;
    dragging = false;

    delta = Math.abs(shift) > MAX_SHIFT ? (shift > 0 ? -1 : 1) : 0;

    calendars.style.transition = "transform 0.2s ease";
    calendars.style.transform = `translateX(-${width + delta * width}px)`;
};

calendarEl.addEventListener("pointerup", stopDragging);
calendarEl.addEventListener("pointercancel", stopDragging);

dayEntries.addEventListener("click", (event) => {
    const item = event.target.closest(".entry");
    if (!item || !dayEntries.contains(item)) return;
    const id = item.dataset.id;
    if (!id) return;
    editingRecId = id;
    activityDate = selectedDate || dateKey();
    renderPage("activity");
});

// --- Activity ---

const renderFeedbackDuration = () => {
    const value = Math.max(0, Number(fbDuration.value) || 0);
    fbDurationValue.textContent = `${value} ${S.units.minutes}`;
    fbDuration.style.setProperty("--value", `${(value / Number(fbDuration.max)) * 100}%`);
};

const renderFeedbackTime = () => {
    fbTimeValue.textContent = draft.time;
};

const renderFeedbackDate = () => {
    fbDateValue.textContent = getShortDate(draft.date);
};

const resetFeedback = (activity) => {
    const saved = todayRec ? feedbackFor(todayRec.id) : null;
    draftRecId = todayRec?.id ?? null;
    draft = saved
        ? {
              date: saved.date || todayRec.date,
              time: saved.time || timeFromTimestamp(saved.createdAt) || timeKey(),
              status: saved.status,
              interest: saved.interest,
              difficulty: saved.difficulty,
              reason: saved.reason,
          }
        : {date: todayRec.date, time: timeKey(), status: "skipped", interest: "not_observed", difficulty: "not_observed", reason: null};
    fbComment.value = saved?.comment ?? "";
    const duration = saved?.duration ?? activity?.duration ?? 0;
    fbDuration.max = String(Math.max(60, Math.ceil(Number(duration) || 0)));
    fbDuration.value = duration;
    renderFeedbackDuration();
};

const renderActivity = () => {
    const child = activeChild();
    activityWelcome.classList.toggle("hidden", !!child);
    activityMain.classList.toggle("hidden", !child);
    activitySuggestions.replaceChildren();
    if (!child) {
        todayRec = null;
        feedbackForm.classList.add("hidden");
        activityConfirm.classList.add("hidden");
        return;
    }

    const edited = editingRecId
        ? data.recommendations.find((rec) => rec.id === editingRecId && rec.childId === child.id)
        : null;
    if (editingRecId && !edited) editingRecId = null;
    const date = activityDate || selectedDate || dateKey();
    todayRec = edited ?? (child && !catalogueError ? recommendationForDate(child, date) : null);
    const activity = todayRec ? findActivity(todayRec.activityId) : null;
    if (!activity) {
        todayRec = null;
        editingRecId = null;
        draftRecId = null;
        activityName.value = "";
        activityNameClear.classList.add("hidden");
        activityBody.replaceChildren();
        activityNoResult.textContent = catalogueError ? S.catalogueError : emptyReason(child);
        activityNoResult.classList.remove("hidden");
        feedbackForm.classList.add("hidden");
        activityConfirm.classList.add("hidden");
        return;
    }

    if (todayRec.id !== draftRecId) resetFeedback(activity);
    activityNameClear.classList.toggle("hidden", !activityName.value);
    activityNoResult.classList.add("hidden");
    activityBody.replaceChildren(...activityContent(activity, true));
    feedbackForm.classList.remove("hidden");
    activityConfirm.classList.remove("hidden");
    renderFeedbackForm();
};

const chooseActivity = (activity) => {
    const child = activeChild();
    if (!child) return;
    if (!todayRec || todayRec.childId !== child.id || todayRec.activityId !== activity.id) {
        updateData((d) => {
            if (todayRec && todayRec.childId === child.id && !FINISHED.includes(todayRec.status)) {
                setStatus(todayRec, "replaced");
            }
            todayRec = addRecommendation(child.id, activityDate || todayRec?.date || selectedDate || dateKey(), activity);
        });
    }
    editingRecId = null;
    activityName.value = "";
    activityNameClear.classList.add("hidden");
    renderPage("activity");
};

const suggestionItem = (activity) =>
    el(
        "button",
        {type: "button", className: "entry suggestion", onclick: () => chooseActivity(activity)},
        el("span", {className: "entry-title", textContent: activity.title}),
        el("span", {className: "help small", textContent: phrase([ageRangeText(activity), `${activity.duration} ${S.units.minutes}`])}),
    );

const renderActivitySuggestions = () => {
    const query = normalize(activityName.value.trim());
    if (!query) {
        activitySuggestions.replaceChildren();
        return;
    }
    const matches = catalogue
        .filter(isAvailable)
        .map((activity) => ({activity, index: normalize(activity.title).indexOf(query)}))
        .filter((match) => match.index >= 0)
        .sort((a, b) => a.index - b.index || a.activity.title.length - b.activity.title.length)
        .slice(0, 5);
    activitySuggestions.replaceChildren(...matches.map(({activity}) => suggestionItem(activity)));
};

activityName.addEventListener(
    "input",
    debounce(() => {
        activityNameClear.classList.toggle("hidden", !activityName.value);
        renderActivitySuggestions();
    }, 120),
);

activityNameClear.onclick = () => {
    activityName.value = "";
    activityNameClear.classList.add("hidden");
    activitySuggestions.replaceChildren();
    activityName.focus();
};

activitySearch.onclick = () => {
    renderPage("search");
    searchInput.focus();
};

activityAdd.onclick = () => {
    resetCreateForm();
    renderPage("create");
    createTitle.focus();
};

const refreshActivity = () => {
    const child = activeChild();
    if (!child) return;
    const date = todayRec?.date || activityDate || selectedDate || dateKey();
    editingRecId = null;
    activityDate = date;
    if (!todayRec) {
        todayRec = recommendationForDate(child, date);
    } else if (!replaceRecommendation(child, todayRec)) {
        showMessage(S.noAlternative);
    }
    renderActivity();
};

activityRefresh.onclick = refreshActivity;

// --- Feedback ---

const renderRating = (input, output, key, values, labels) => {
    const index = Math.max(0, values.indexOf(draft[key]));
    input.value = index;
    input.style.setProperty("--value", `${(index / (values.length - 1)) * 100}%`);
    output.textContent = labels[draft[key]];
};

const resizeComment = () => {
    fbComment.style.height = "auto";
    fbComment.style.height = `${fbComment.scrollHeight}px`;
};

const renderFeedbackForm = () => {
    renderRating(fbStatus, fbStatusValue, "status", FEEDBACK_STATUSES, S.feedbackStatuses);
    renderRating(fbInterest, fbInterestValue, "interest", FEEDBACK_INTERESTS, S.interestFeedback);
    renderRating(fbDifficulty, fbDifficultyValue, "difficulty", FEEDBACK_DIFFICULTIES, S.difficultyFeedback);
    renderChoices(fbReason, REASONS, S.reasons, (v) => v === draft.reason, (value) => {
        draft.reason = value;
        renderFeedbackForm();
    });
    fbObserved.classList.toggle("hidden", draft.status === "skipped");
    fbReasonField.classList.toggle("hidden", !NEEDS_REASON.includes(draft.status));
    resizeComment();
    renderFeedbackDate();
    renderFeedbackTime();
};

const bindRating = (input, values, key) => {
    input.addEventListener("input", () => {
        draft[key] = values[+input.value];
        renderFeedbackForm();
    });
};

bindRating(fbStatus, FEEDBACK_STATUSES, "status");
bindRating(fbInterest, FEEDBACK_INTERESTS, "interest");
bindRating(fbDifficulty, FEEDBACK_DIFFICULTIES, "difficulty");
fbDuration.addEventListener("input", renderFeedbackDuration);
fbComment.addEventListener("input", resizeComment);

const closeActivityPage = () => {
    editingRecId = null;
    activityDate = null;
    draftRecId = null;
    draft = {date: dateKey(), time: timeKey(), status: "skipped", interest: "not_observed", difficulty: "not_observed", reason: null};
    fbComment.value = "";
    renderPage("calendar");
};

const saveFeedbackForm = () => {
    if (!todayRec) return;
    const skipped = draft.status === "skipped";
    const duration = Math.max(0, Number(fbDuration.value) || 0);
    const date = draft.date || todayRec.date;
    saveFeedback(todayRec, {
        date,
        time: draft.time || timeKey(),
        status: draft.status,
        interest: skipped ? "not_observed" : draft.interest,
        difficulty: skipped ? "not_observed" : draft.difficulty,
        reason: NEEDS_REASON.includes(draft.status) ? draft.reason : null,
        duration,
        comment: fbComment.value.trim() || null,
    });
    const day = parseDate(date);
    editingRecId = null;
    activityDate = null;
    selectedDate = date;
    calendarMonth = new Date(day.getFullYear(), day.getMonth(), 1);
    renderPage("calendar");
};

activityConfirm.onclick = saveFeedbackForm;
activityCancel.onclick = closeActivityPage;

// --- Time picker ---

const CX = 125;
const CY = 125;
const R_OUT = 100;
const R_IN = 70;
const HAND_RADIUS = 16;

const MINUTE_LABELS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const HOUR_LABELS_AM = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const HOUR_LABELS_PM = ["12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

let timeUpdate = null;
let timeAdd = null;
let timeDate = new Date();
let timeMonth = new Date();
let timeHour = 0;
let timeMinute = 0;

const getShortDate = (date) => {
    date = new Date(date);
    return date.getDate() + ' ' + S.mons[date.getMonth()];
}

const setTimeDay = () => (timeDayButton.textContent = getShortDate(timeDate));
const setTimeHour = () => (timeHourButton.textContent = pad(timeHour));
const setTimeMinute = () => (timeMinuteButton.textContent = pad(timeMinute));

const updateHand = (angle, radius) => {
    const x = CX + radius * Math.cos(angle);
    const y = CY + radius * Math.sin(angle);
    hand.style.left = `${x - HAND_RADIUS}px`;
    hand.style.top = `${y - HAND_RADIUS}px`;
    line.style.width = `${radius}px`;
    line.style.transform = `rotate(${angle}rad)`;
    white.style.clipPath = `circle(${HAND_RADIUS}px at ${x}px ${y}px)`;
};

const createTicks = (labels, radius) =>
    labels
        .map((label, i) => {
            const angle = (i / 6 - 0.5) * Math.PI;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return `<div class="tick" style="left:${x}%;top:${y}%">${label}</div>`;
        })
        .join("");

const getMinute = (angle) => (Math.round((30 * angle) / Math.PI) + 75) % 60;
const getHour = (angle) => (Math.round((6 * angle) / Math.PI) + 15) % 12;

const clockPoint = (event) => {
    const rect = clock.getBoundingClientRect();
    return {x: event.clientX - rect.left - CX, y: event.clientY - rect.top - CY};
};

const updateMinute = (event) => {
    const {x, y} = clockPoint(event);
    const angle = Math.atan2(y, x);
    updateHand(angle, R_OUT);
    timeMinute = getMinute(angle);
    setTimeMinute();
};

const updateHour = (event) => {
    const {x, y} = clockPoint(event);
    const angle = Math.atan2(y, x);
    const pm = 4 * (x * x + y * y) < (R_IN + R_OUT) ** 2;
    updateHand(angle, pm ? R_IN : R_OUT);
    timeHour = getHour(angle) + 12 * pm;
    setTimeHour();
};

const selectTimePart = (button) =>
    [timeDayButton, timeHourButton, timeMinuteButton].forEach((part) => part.classList.toggle("selected", part === button));

const toMinute = () => {
    clock.classList.remove("hidden");
    timeCalendar.classList.add("hidden");
    white.innerHTML = black.innerHTML = createTicks(MINUTE_LABELS, 40);
    updateHand((timeMinute / 30 - 0.5) * Math.PI, R_OUT);
    timeUpdate = updateMinute;
    timeAdd = addTimeMinute;
    selectTimePart(timeMinuteButton);
};

const toHour = () => {
    clock.classList.remove("hidden");
    timeCalendar.classList.add("hidden");
    white.innerHTML = black.innerHTML = createTicks(HOUR_LABELS_AM, 40) + createTicks(HOUR_LABELS_PM, 28);
    updateHand((timeHour / 6 - 0.5) * Math.PI, timeHour >= 12 ? R_IN : R_OUT);
    timeUpdate = updateHour;
    timeAdd = addTimeHour;
    selectTimePart(timeHourButton);
};

const addTimeMonth = (delta) => {
    timeMonth.setMonth(timeMonth.getMonth() + delta);
    renderTimeCalendar();
};

const toDay = () => {
    clock.classList.add("hidden");
    timeCalendar.classList.remove("hidden");
    timeMonth = new Date(timeDate.getFullYear(), timeDate.getMonth(), 1);
    timeUpdate = null;
    timeAdd = addTimeMonth;
    selectTimePart(timeDayButton);
    renderTimeCalendar();
};

const renderTimeCalendar = () => {
    const year = timeMonth.getFullYear();
    const month = timeMonth.getMonth();
    const first = (new Date(year, month, 1).getDay() + 6) % 7;
    const last = new Date(year, month + 1, 0).getDate();
    const selected = dateKey(timeDate);
    const today = dateKey();

    timeWeekdays.replaceChildren(...S.weekdaysShort.map((weekday) => el("span", {textContent: weekday})));
    const days = [];
    for (let i = 0; i < first; i++) days.push(el("span", {className: "calendar-empty"}));
    for (let day = 1; day <= last; day++) {
        const date = dateKey(new Date(year, month, day));
        const type = date === selected ? "selected" : date === today ? "today" : date > today ? "future" : "";
        const button = el("button", {type: "button", className: type}, el("span", {textContent: String(day)}));
        button.onclick = () => {
            timeDate = new Date(year, month, day);
            setTimeDay();
            toHour();
        };
        days.push(button);
    }
    timeDays.replaceChildren(...days);
};

const openTimePicker = (to) => {
    const [hour, minute] = (draft.time || timeKey()).split(":").map(Number);
    timeDate = parseDate(draft.date || todayRec.date);
    timeMonth = new Date(timeDate.getFullYear(), timeDate.getMonth(), 1);
    timeHour = clamp(Number(hour) || 0, 0, 23);
    timeMinute = clamp(Number(minute) || 0, 0, 59);

    setTimeDay();
    setTimeHour();
    setTimeMinute();
    (to ?? toHour)();
    openSheet(timePicker);
};

const applyTimePicker = () => {
    draft.date = dateKey(timeDate);
    draft.time = `${pad(timeHour)}:${pad(timeMinute)}`;
    renderFeedbackDate();
    renderFeedbackTime();
    closeSheet();
};

const addTimeMinute = (delta) => {
    timeMinute = (timeMinute + 60 + delta) % 60;
    updateHand((timeMinute / 30 - 0.5) * Math.PI, R_OUT);
    setTimeMinute();
};

const addTimeHour = (delta) => {
    timeHour = (timeHour + 24 + delta) % 24;
    updateHand((timeHour / 6 - 0.5) * Math.PI, timeHour >= 12 ? R_IN : R_OUT);
    setTimeHour();
};

timeDayButton.onclick = toDay;
timeHourButton.onclick = toHour;
timeMinuteButton.onclick = toMinute;

clock.addEventListener("pointerdown", (event) => {
    hand.setPointerCapture(event.pointerId);
    timeUpdate(event);
});

clock.addEventListener("pointermove", (event) => {
    if (hand.hasPointerCapture(event.pointerId)) timeUpdate(event);
});

clock.addEventListener("pointerup", (event) => {
    if (!hand.hasPointerCapture(event.pointerId)) return;
    timeUpdate(event);
    hand.releasePointerCapture(event.pointerId);
    if (timeUpdate === updateHour) toMinute();
});

clock.addEventListener("pointercancel", (event) => {
    if (hand.hasPointerCapture(event.pointerId)) hand.releasePointerCapture(event.pointerId);
});

timePrev.onclick = () => timeAdd(-1);
timeNext.onclick = () => timeAdd(1);
timeCancel.onclick = closeSheet;
timeApply.onclick = applyTimePicker;
fbDate.onclick = () => openTimePicker(toDay);
fbTime.onclick = () => openTimePicker(toHour);

// ==========================================================================
// 15. ACTIVITY DETAILS
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

// Full details for the sheet, a compact version for the Today screen
const activityContent = (a, full) =>
    [
        full &&
            !isAvailable(a) &&
            el("p", {className: "warning", textContent: a.enabled ? S.notReviewedNote : S.disabledNote}),
        areaMarks(a),
        el("h1", {textContent: a.title}),
        el("p", {className: "lead", textContent: a.description}),
        facts([
            [S.goal, a.goal],
            full && [S.age, ageRangeText(a)],
            [S.duration, `${a.duration} ${S.units.minutes}`],
            full && [S.place, S.environment[a.environment]],
            full && [S.character, S.intensity[a.intensity]],
            full && [S.difficultyTitle, S.difficulty[a.difficulty]],
            full && a.skillTags.length && [S.skillsTitle, phrase(a.skillTags.map((id) => S.skills[id]))],
            full && a.interestTags.length && [S.interestsTitle, phrase(a.interestTags.map((id) => S.interests[id]))],
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

// ==========================================================================
// 16. ACTIVITIES
// ==========================================================================

const durationOptions = () =>
    DURATION_LIMITS.map((value) => ({
        value: String(value),
        label: value ? S.durationLimits[value] : S.anyDuration,
    }));

const selectedLabel = (options, value) =>
    options.find((option) => option.value === value)?.label ?? options[0].label;

const renderDurationFilter = () => {
    filterDuration.value = durationFilter;
    filterDurationValue.textContent = selectedLabel(durationOptions(), durationFilter);
    filterDuration.style.setProperty(
        "--value",
        `${(Number(durationFilter) / DURATION_LIMITS[DURATION_LIMITS.length - 1]) * 100}%`,
    );
};

const renderAgeFilter = () => {
    const maxAge = Math.max(12, ...catalogue.map((activity) => activity.ageMaxMonths));
    filterAge.max = String(maxAge);
    if (ageFilter === null) {
        const child = activeChild();
        ageFilter = child ? clamp(ageOf(child.birthDate).months, 0, maxAge) : 0;
    }
    ageFilter = Math.min(ageFilter, maxAge);
    filterAge.value = ageFilter;
    filterAgeValue.textContent = `${ageFilter} ${S.units.months}`;
    filterAge.style.setProperty("--value", `${(ageFilter / maxAge) * 100}%`);
};

const activityItem = (a) =>
    el(
        "li",
        {},
        el(
            "button",
            {className: "entry", onclick: () => chooseActivity(a)},
            el("span", {className: "entry-title", textContent: a.title}),
            el("span", {className: "help small", textContent: phrase([ageRangeText(a), `${a.duration} ${S.units.minutes}`])}),
            areaMarks(a),
        ),
    );

const renderActivities = () => {
    renderAgeFilter();
    renderDurationFilter();

    renderChoices(
        filterInterest,
        INTERESTS,
        S.interests,
        (tag) => interestFilters.includes(tag),
        (tag) => {
            interestFilters = interestFilters.includes(tag)
                ? interestFilters.filter((value) => value !== tag)
                : [...interestFilters, tag];
            renderActivities();
        },
        "filter-option",
    );

    renderAreaChoices(filterAreaChips, activityArea, (area) => {
        activityArea = area;
        renderActivities();
    });

    const query = normalize(searchInput.value.trim());
    const duration = Number(durationFilter);
    const list = catalogue.filter(
        (a) =>
            isAvailable(a) &&
            normalize(a.title).includes(query) &&
            (!activityArea || a.areas.includes(activityArea)) &&
            a.ageMinMonths <= ageFilter &&
            a.ageMaxMonths >= ageFilter &&
            (!duration || a.duration <= duration) &&
            (!interestFilters.length ||
                interestFilters.some((tag) => a.interestTags.includes(tag))),
    );
    activityList.replaceChildren(...list.map(activityItem));
    activityEmpty.classList.toggle("hidden", list.length > 0 || catalogueError);
    catalogueStatus.textContent = catalogueError
        ? S.catalogueError
        : S.catalogueStatus(catalogue.filter(isAvailable).length, catalogue.length);
};

searchInput.addEventListener(
    "input",
    debounce(() => {
        searchClear.classList.toggle("hidden", !searchInput.value);
        renderActivities();
    }, 150),
);

searchClear.onclick = () => {
    searchInput.value = "";
    searchClear.classList.add("hidden");
    renderActivities();
    searchInput.focus();
};

searchBack.onclick = () => renderPage("activity");

filterAge.addEventListener("input", () => {
    ageFilter = Number(filterAge.value);
    renderActivities();
});

filterDuration.addEventListener("input", () => {
    durationFilter = filterDuration.value;
    renderActivities();
});

// ==========================================================================
// 17. CREATE ACTIVITY
// ==========================================================================

const renderCreateAreas = () =>
    renderChoices(
        createAreasEl,
        AREAS,
        S.areas,
        (area) => createAreas.includes(area),
        (area) => {
            createAreas = toggle(createAreas, area);
            renderCreateAreas();
        },
    );

const resetCreateForm = () => {
    createTitle.value = "";
    createDescription.value = "";
    createDuration.value = "5";
    createAgeMin.value = "0";
    createAgeMax.value = "12";
    createInstructions.value = "";
    createSafety.value = "";
    createAreas = [];
};

const renderCreate = () => {
    renderCreateAreas();
};

const linesOf = (value) =>
    value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

createSave.onclick = () => {
    const title = createTitle.value.trim();
    const description = createDescription.value.trim();
    const instructions = linesOf(createInstructions.value);
    const safety = linesOf(createSafety.value);
    const duration = Math.round(Number(createDuration.value));
    const ageMin = Math.round(Number(createAgeMin.value));
    const ageMax = Math.round(Number(createAgeMax.value));
    if (
        !title ||
        !description ||
        !createAreas.length ||
        !instructions.length ||
        !safety.length ||
        !Number.isFinite(duration) ||
        duration < 1 ||
        !Number.isFinite(ageMin) ||
        !Number.isFinite(ageMax) ||
        ageMin < 0 ||
        ageMax < ageMin
    ) {
        showMessage(S.createError);
        return;
    }
    const activity = {
        id: `custom-${uid()}`,
        title,
        description,
        goal: description,
        ageMinMonths: ageMin,
        ageMaxMonths: ageMax,
        areas: [...createAreas],
        skillTags: [],
        interestTags: [],
        difficulty: "medium",
        duration: Math.min(240, duration),
        materials: [],
        environment: "either",
        intensity: "either",
        instructions,
        safety,
        safetyReviewed: true,
        sources: [],
        videos: [],
        enabled: true,
        custom: true,
    };
    updateData((d) => d.activities.push(activity));
    refreshCatalogue();
    chooseActivity(activity);
};

createCancel.onclick = () => renderPage("activity");

// ==========================================================================
// 17. CHILD
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
                el(
                    "summary",
                    {},
                    icon("plus", "plus"),
                    icon("minus", "minus"),
                    el("span", {textContent: S.areas[area]}),
                    count,
                ),
                ...SKILLS[area].map((id) => {
                    let level = skillLevel(child, id);
                    const button = el("button", {
                        type: "button",
                        className: `tap chip${level === "unknown" ? "" : " selected"}`,
                        textContent: S.levels[level],
                        onclick: () => {
                            level = SKILL_LEVELS[(SKILL_LEVELS.indexOf(level) + 1) % SKILL_LEVELS.length];
                            setSkillLevel(child, id, level);
                            button.textContent = S.levels[level];
                            button.className = `tap chip${level === "unknown" ? "" : " selected"}`;
                            button.setAttribute("aria-label", `${S.skills[id]}: ${S.levels[level]}`);
                            updateCount();
                        },
                    });
                    button.setAttribute("aria-label", `${S.skills[id]}: ${S.levels[level]}`);
                    return el(
                        "div",
                        {className: "skill"},
                        el("span", {textContent: S.skills[id]}),
                        button,
                    );
                }),
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
            const button = el("button", {
                type: "button",
                className: `tap chip ${state === "like" ? "selected" : state === "dislike" ? "excluded" : ""}`,
                textContent: S.interests[tag] + ({inferredLike: " ↑", inferredDislike: " ↓"}[state] ?? ""),
                onclick: () => {
                    toggleInterest(child, tag);
                    renderInterests(child);
                },
            });
            button.setAttribute(
                "aria-label",
                state ? `${S.interests[tag]}: ${S.interestStates[state]}` : S.interests[tag],
            );
            return button;
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
    const showForm = !!child || childFormNew;
    childPageTitle.textContent = childFormNew ? S.newChild : child ? S.profileTitle : S.child;
    childNone.classList.toggle("hidden", showForm);
    childProfile.classList.toggle("hidden", !showForm);
    if (!showForm) return;

    const formChild = childFormNew ? null : child;
    childNameInput.value = formChild?.name ?? "";
    birthdate.set(formChild?.birthDate);
    duedate.set(formChild?.dueDate);
    formGender = formChild?.gender ?? "unspecified";
    setSegment(childGender, formGender, "gender");
    childCancel.classList.toggle("hidden", !childFormNew);

    childDetails.classList.toggle("hidden", childFormNew);
    if (!child || childFormNew) return;
    renderSkills(child);
    renderInterests(child);
    renderConditions(child);
};

childDelete.onclick = () => {
    const child = activeChild();
    showModal(
        S.deleteChildQuestion(child.name),
        () => {
            childFormNew = false;
            deleteChild(child.id);
            render();
        },
        S.delete,
    );
};

/* --- Child form --- */

const YY = new Date().getFullYear() % 100;

// Masked DD.MM.YYYY input shared by the birth and due date fields.
const createDateInput = (input, allowFuture = false) => {
    const value = {digits: "", cursor: 0};

    const text = () => {
        if (!value.digits) return "";
        const d = value.digits.slice(0, 2) + (value.digits.length >= 2 ? "." : "");
        const m = value.digits.slice(2, 4) + (value.digits.length >= 4 ? "." : "");
        const y = value.digits.slice(4);
        return d + m + y;
    };

    const normalize = () => {
        if (value.cursor < value.digits.length)
            value.digits = value.digits.slice(0, value.cursor);

        if (+value.digits[0] > 3) value.digits = "0" + value.digits;

        if (value.digits.length >= 2) {
            const d = +value.digits.slice(0, 2);
            if (d > 31) value.digits = "0" + value.digits;
            else if (d === 0) value.digits = "01" + value.digits.slice(2);
        }

        if (value.digits.length >= 3 && +value.digits[2] > 1)
            value.digits = value.digits.slice(0, 2) + "0" + value.digits.slice(2);

        if (value.digits.length >= 4) {
            const d = value.digits.slice(0, 2);
            const m = +value.digits.slice(2, 4);
            if (m > 12) value.digits = d + "0" + value.digits.slice(2);
            else if (m === 0) value.digits = d + "01" + value.digits.slice(4);
        }

        if (value.digits.length >= 6) {
            const y = value.digits.slice(4, 6);
            if (y !== "19" && y !== "20") {
                value.digits = value.digits.slice(0, 4) + (+y <= YY ? "20" : "19") + y;
            }
        }

        value.digits = value.digits.slice(0, 8);
        value.cursor = value.digits.length;
    };

    const setValue = () => {
        input.value = text();
        let p = value.cursor;
        if (value.cursor >= 2) p++;
        if (value.cursor >= 4) p++;
        p = Math.min(p, input.value.length);
        input.setSelectionRange(p, p);
    };

    const position = (p) => input.value.slice(0, p).replace(/\D/g, "").length;

    const set = (date) => {
        value.digits = date ? date.slice(8, 10) + date.slice(5, 7) + date.slice(0, 4) : "";
        value.cursor = value.digits.length;
        setValue();
    };

    const get = () => {
        if (value.digits.length !== 8) return null;

        const d = +value.digits.slice(0, 2);
        const m = +value.digits.slice(2, 4);
        const y = +value.digits.slice(4, 8);
        const date = new Date(y, m - 1, d);

        if (
            date.getFullYear() !== y ||
            date.getMonth() !== m - 1 ||
            date.getDate() !== d ||
            (!allowFuture && date > new Date())
        )
            return null;

        return dateKey(date);
    };

    input.addEventListener("beforeinput", (e) => {
        if (e.inputType === "insertText" && e.data === ".") {
            e.preventDefault();
            if (value.cursor === 1) {
                value.digits = "0" + value.digits;
                value.cursor = 2;
                setValue();
            } else if (value.cursor === 3) {
                value.digits =
                    value.digits.slice(0, 2) + "0" + value.digits.slice(2);
                value.cursor = 4;
                setValue();
            }
            return;
        }

        if (e.inputType === "insertText" || e.inputType === "insertFromPaste") {
            e.preventDefault();
            const p = (e.data || "").replace(/\D/g, "");
            if (!p || value.cursor >= 8) return;

            value.digits =
                value.digits.slice(0, value.cursor) +
                p +
                value.digits.slice(value.cursor);
            value.cursor += p.length;
            normalize();
            setValue();
            return;
        }

        if (e.inputType === "deleteContentBackward") {
            e.preventDefault();
            if (!value.cursor) return;

            if (value.cursor === 8 && value.digits.length === 8) {
                const y = value.digits.slice(4);
                if (y.slice(0, 2) !== "19" && y.slice(0, 2) !== "20") {
                    value.digits = value.digits.slice(0, 4) + y.slice(2);
                    value.cursor = 6;
                    setValue();
                    return;
                }
            }

            value.digits =
                value.digits.slice(0, value.cursor - 1) +
                value.digits.slice(value.cursor);
            value.cursor--;
            normalize();
            setValue();
        }
    });

    input.addEventListener("click", () => {
        value.cursor = position(input.selectionStart);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            value.cursor = Math.max(0, value.cursor - 1);
            setValue();
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            value.cursor = Math.min(8, value.cursor + 1);
            setValue();
        }
    });

    input.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").trim();
        const parts = text.split(/[.\-/\s]+/);

        if (parts.length >= 3) {
            let [d, m, y] = parts;
            d = d.replace(/\D/g, "");
            m = m.replace(/\D/g, "");
            y = y.replace(/\D/g, "");

            if (d.length === 1) d = "0" + d;
            if (m.length === 1) m = "0" + m;

            if (y.length === 1) y = "200" + y;
            else if (y.length === 2) y = (+y <= YY ? "20" : "19") + y;
            else y = y.slice(0, 4);

            value.digits = (d + m + y).slice(0, 8);
        } else {
            value.digits = text.replace(/\D/g, "").slice(0, 8);
            normalize();
        }

        value.cursor = value.digits.length;
        setValue();
    });

    return {set, get};
};

const birthdate = createDateInput(childBirthInput);
const duedate = createDateInput(childDueInput, true);

const childFormReady = () => {
    const due = duedate.get();
    return !!childNameInput.value.trim() && !!birthdate.get() && (!childDueInput.value || !!due);
};

const openChildForm = () => {
    childFormNew = true;
    closeSheet();
    renderPage("child");
};

const cancelChildForm = () => {
    childFormNew = false;
    render();
};

const saveChild = () => {
    if (!childFormReady()) return;
    const fields = {
        name: childNameInput.value.trim(),
        birthDate: birthdate.get(),
        dueDate: duedate.get(),
        gender: formGender,
    };
    if (childFormNew) {
        createChild(fields);
        childFormNew = false;
        render();
    } else {
        editChild(activeChild(), fields);
        childNameInput.value = fields.name;
        renderHeader();
    }
};

const saveChildOnBlur = (event) => {
    if (event.relatedTarget?.closest?.("#child-cancel")) return;
    saveChild();
};

childCancel.onclick = cancelChildForm;
childNameInput.addEventListener("blur", saveChildOnBlur);
childBirthInput.addEventListener("blur", saveChildOnBlur);
childDueInput.addEventListener("blur", saveChildOnBlur);
onSegment(childGender, "gender", (value) => {
    formGender = value;
    saveChild();
});

document.querySelectorAll(".add-child").forEach((button) => {
    button.onclick = () => openChildForm();
});

// ==========================================================================
// 18. STATISTICS
// ==========================================================================

const mondayOf = (date) => {
    const day = parseDate(date);
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
    return dateKey(day);
};

const lastWeeks = (count) => {
    const monday = parseDate(mondayOf(dateKey()));
    return Array.from({length: count}, (_, index) => {
        const day = new Date(monday);
        day.setDate(day.getDate() - (count - 1 - index) * 7);
        return dateKey(day);
    });
};

const shortWeek = (date) => formatDate(date, {day: "numeric"});
const fullWeek = (date) => formatDate(date, {day: "numeric", month: "2-digit"});

const chartValue = (value) => String(value);

const renderBarChart = (container, weeks, values, format = chartValue) => {
    if (!values.some(Boolean)) {
        container.replaceChildren(el("p", {className: "empty", textContent: S.noData}));
        return;
    }
    const max = Math.max(...values);
    container.replaceChildren(
        ...weeks.map((week, index) =>
            el(
                "div",
                {className: "bar-item"},
                el("span", {className: "bar-value", textContent: values[index] ? format(values[index]) : ""}),
                el(
                    "div",
                    {className: "bar-track"},
                    el("div", {
                        className: `bar-fill${values[index] ? "" : " bar-empty"}`,
                        style: `height:${(values[index] / max) * 100}%`,
                    }),
                ),
                el("span", {className: "bar-label", textContent: shortWeek(week), title: fullWeek(week)}),
            ),
        ),
    );
};

const renderStackedChart = (container, weeks, rows) => {
    if (!rows.some((row) => row.total)) {
        container.replaceChildren(el("p", {className: "empty", textContent: S.noData}));
        return;
    }
    const max = Math.max(...rows.map((row) => row.total));
    container.replaceChildren(
        ...weeks.map((week, index) => {
            const row = rows[index];
            return el(
                "div",
                {className: "bar-item"},
                el("span", {className: "bar-value", textContent: row.total || ""}),
                el(
                    "div",
                    {className: "bar-track"},
                    el(
                        "div",
                        {className: "stack", style: `height:${(row.total / max) * 100}%`},
                        ...row.statuses
                            .filter(({count}) => count)
                            .map(({status, count}) =>
                                el("span", {
                                    className: `stack-seg status-${status}`,
                                    style: `flex:${count}`,
                                    title: `${S.feedbackStatuses[status]}: ${count}`,
                                }),
                            ),
                    ),
                ),
                el("span", {className: "bar-label", textContent: shortWeek(week), title: fullWeek(week)}),
            );
        }),
    );
};

const renderHList = (container, rows, emptyText = S.noData) => {
    if (!rows.length) {
        container.replaceChildren(el("p", {className: "empty", textContent: emptyText}));
        return;
    }
    const max = Math.max(...rows.map((row) => row.value));
    container.replaceChildren(
        ...rows.map((row) =>
            el(
                "div",
                {className: `h-row${row.className ? ` ${row.className}` : ""}`},
                el("span", {className: "h-label", textContent: row.label}),
                el(
                    "div",
                    {className: "h-track"},
                    el("div", {className: "h-fill", style: `width:${(row.value / max) * 100}%`}),
                ),
                el("span", {className: "h-value", textContent: row.text ?? String(row.value)}),
            ),
        ),
    );
};

const renderStats = () => {
    const child = activeChild();
    const entries = child ? diaryEntries(child.id) : [];
    statsEmpty.classList.toggle("hidden", !!child && entries.length > 0);
    statsContent.classList.toggle("hidden", !child || entries.length === 0);
    if (!child || !entries.length) {
        statsEmpty.textContent = S.statsEmpty;
        return;
    }

    const performed = entries.filter((entry) => entry.performed);
    const weeks = lastWeeks(8);
    const weekIndex = new Map(weeks.map((week, index) => [week, index]));
    const counts = Array(weeks.length).fill(0);
    const minutes = Array(weeks.length).fill(0);
    performed.forEach((entry) => {
        const index = weekIndex.get(mondayOf(entry.date));
        if (index === undefined) return;
        counts[index]++;
        minutes[index] += entry.duration;
    });
    frequencyTotal.textContent = S.entriesCount(performed.length);
    timeTotal.textContent = S.totalMinutes(performed.reduce((sum, entry) => sum + entry.duration, 0));
    renderBarChart(frequencyChart, weeks, counts);
    renderBarChart(timeChart, weeks, minutes, (value) => `${value}`);

    const weights = areaWeights(performed);
    const areaRows = Object.entries(weights)
        .sort((a, b) => b[1] - a[1])
        .map(([area, value]) => ({
            label: S.areas[area],
            value,
            text: `${Math.round(value)} ${S.units.minutes}`,
            className: `area-${area}`,
        }));
    renderHList(areasChart, areaRows);

    const activeDates = [...new Set(performed.map((entry) => entry.date))].sort();
    const gaps = activeDates.slice(1).map((date, index) => daysBetween(activeDates[index], date));
    consistencySummary.replaceChildren(
        el("span", {className: "small", textContent: S.activeDays(activeDates.length)}),
        el("span", {className: "small", textContent: S.longestGap(Math.max(0, ...gaps))}),
    );
    const activeSet = new Set(activeDates);
    const recentWeeks = lastWeeks(12);
    const consistencyCells = [];
    recentWeeks.forEach((week) => {
        const monday = parseDate(week);
        for (let day = 0; day < 7; day++) {
            const date = new Date(monday);
            date.setDate(date.getDate() + day);
            const key = dateKey(date);
            const cell = el("span", {className: `consistency-day${activeSet.has(key) ? " active" : ""}`});
            cell.title = formatDate(key, {day: "numeric", month: "long"});
            consistencyCells.push(cell);
        }
    });
    consistencyChart.replaceChildren(...consistencyCells);

    const feedbackRows = weeks.map((week) => {
        const weekly = entries.filter((entry) => mondayOf(entry.date) === week);
        const statuses = FEEDBACK_STATUSES.map((status) => ({
            status,
            count: weekly.filter((entry) => entry.feedback.status === status).length,
        }));
        return {total: weekly.length, statuses};
    });
    renderStackedChart(feedbackChart, weeks, feedbackRows);
    feedbackLegend.replaceChildren(
        ...FEEDBACK_STATUSES.map((status) =>
            el(
                "span",
                {className: "legend-item"},
                el("span", {className: `legend-dot status-${status}`}),
                el("span", {textContent: S.feedbackStatuses[status]}),
            ),
        ),
    );

    const positive = entries.filter(
        (entry) =>
            entry.feedback.status === "completed" ||
            entry.feedback.interest === "liked" ||
            entry.feedback.difficulty === "appropriate",
    );
    const activityCounts = new Map();
    positive.forEach((entry) => {
        const title = entry.activity?.title ?? S.unknownActivity;
        activityCounts.set(title, (activityCounts.get(title) ?? 0) + 1);
    });
    renderHList(
        positiveActivities,
        [...activityCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value]) => ({label, value, text: String(value)})),
        S.positiveEmpty,
    );

    const skillCounts = new Map();
    positive.forEach((entry) => {
        (entry.activity?.skillTags ?? []).forEach((skill) => {
            skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
        });
    });
    renderHList(
        positiveSkills,
        [...skillCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, value]) => ({label: S.skills[skill] ?? skill, value, text: String(value)})),
        S.positiveEmpty,
    );
};

// ==========================================================================
// 19. SETTINGS
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
    showModal(
        S.importQuestion,
        () => {
            importData(imported);
            renderPage("calendar");
        },
        S.importConfirm,
    );
};

resetPreferencesButton.onclick = () => {
    const child = activeChild();
    showModal(S.resetQuestion(child.name), () => resetInferredPreferences(child.id), S.resetConfirm);
};

deleteAllButton.onclick = () =>
    showModal(
        S.deleteAllQuestion,
        () => {
            deleteAllData();
            refreshCatalogue();
            renderPage("calendar");
        },
        S.delete,
    );

// ==========================================================================
// 20. NAVIGATION
// ==========================================================================

const renderers = {
    calendar: renderCalendar,
    activity: renderActivity,
    search: renderActivities,
    create: renderCreate,
    stats: renderStats,
    child: renderChild,
    settings: renderSettings,
};

const render = () => {
    renderHeader();
    renderers[currentPage]();
};

const renderPage = (name) => {
    if (name !== "child") childFormNew = false;
    currentPage = name;
    Object.entries(pages).forEach(([key, section]) => {
        section.classList.toggle("hidden", key !== name);
    });
    navBar.classList.toggle("hidden", name === "activity" || name === "search" || name === "create");
    navButtons.forEach((button) => {
        const active = button.dataset.page === name;
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    render();
};

nav.onclick = (event) => {
    const button = event.target.closest("button");
    if (!button?.dataset.page) return;
    if (button.dataset.page === "activity") {
        editingRecId = null;
        activityDate = selectedDate || dateKey();
    }
    renderPage(button.dataset.page);
};

// ==========================================================================
// 21. INIT
// ==========================================================================

document.querySelectorAll("input:not([type=file])").forEach((input) => {
    input.setAttribute("readonly", "true");
    input.addEventListener("focus", () => input.removeAttribute("readonly"));
});

(async () => {
    translatePage();
    loadData();
    await loadCatalogue();
    renderPage("calendar");
    navigator.serviceWorker?.register("sw.js", {updateViaCache: "none"});

    // the date changes while the app stays open: refresh age and the daily screen
    let renderedDay = dateKey();
    document.addEventListener("visibilitychange", () => {
        if (document.hidden || dateKey() === renderedDay) return;
        renderedDay = dateKey();
        render();
    });
})();
