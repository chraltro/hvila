/**
 * Neck & Shoulder Relief Timer Application
 * A Pomodoro-style timer focused on preventing neck and shoulder strain
 */

/**
 * Default configuration constants
 * @constant {Object}
 */
const DEFAULT_CONFIG = {
    WORK_TIME: 25 * 60,        // 25 minutes
    MICRO_BREAK: 2 * 60,       // 2 minutes
    EXERCISE_BREAK: 5 * 60,    // 5 minutes
    LONG_BREAK: 15 * 60,       // 15 minutes
    STORAGE_KEY: 'timerState',
    SETTINGS_KEY: 'timerSettings',
    HISTORY_KEY: 'sessionHistory',
    ACHIEVEMENTS_KEY: 'achievements',
    CIRCUMFERENCE: 2 * Math.PI * 100,
    MAX_HISTORY_ENTRIES: 100
};

/**
 * Achievement definitions
 * @constant {Object}
 */
const ACHIEVEMENTS = {
    firstSession: {
        id: 'firstSession',
        name: 'Getting Started',
        description: 'Complete your first work session',
        icon: '🎯',
        check: (stats) => stats.sessions >= 1
    },
    streak3: {
        id: 'streak3',
        name: '3-Day Warrior',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        check: (stats, streak) => streak.current >= 3
    },
    streak7: {
        id: 'streak7',
        name: 'Week Champion',
        description: 'Maintain a 7-day streak',
        icon: '⭐',
        check: (stats, streak) => streak.current >= 7
    },
    streak30: {
        id: 'streak30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        check: (stats, streak) => streak.current >= 30
    },
    sessions25: {
        id: 'sessions25',
        name: 'Quarter Century',
        description: 'Complete 25 sessions',
        icon: '💪',
        check: (stats) => stats.sessions >= 25
    },
    sessions100: {
        id: 'sessions100',
        name: 'Century Club',
        description: 'Complete 100 sessions',
        icon: '💯',
        check: (stats) => stats.sessions >= 100
    },
    exercises50: {
        id: 'exercises50',
        name: 'Flexibility Master',
        description: 'Complete 50 exercise breaks',
        icon: '🧘',
        check: (stats) => stats.exercises >= 50
    },
    dailyGoal: {
        id: 'dailyGoal',
        name: 'Daily Champion',
        description: 'Reach your daily goal',
        icon: '🏆',
        check: (stats, streak, settings) => {
            const today = new Date().toDateString();
            return streak.lastDate === today && stats.sessions >= settings.dailyGoal;
        }
    },
    earlyBird: {
        id: 'earlyBird',
        name: 'Early Bird',
        description: 'Start a session before 7 AM',
        icon: '🌅',
        check: () => false // Checked in real-time
    },
    nightOwl: {
        id: 'nightOwl',
        name: 'Night Owl',
        description: 'Complete a session after 10 PM',
        icon: '🦉',
        check: () => false // Checked in real-time
    }
};

/**
 * Notification sound options
 * @constant {Object}
 */
const SOUND_OPTIONS = {
    bell: {
        name: 'Bell',
        file: 'bell.wav'
    },
    chime: {
        name: 'Chime',
        file: 'chime.wav'
    },
    gong: {
        name: 'Gong',
        file: 'gong.wav'
    },
    subtle: {
        name: 'Subtle Ping',
        file: 'ping.wav'
    }
};

/**
 * Timer profile presets
 * @constant {Object}
 */
const TIMER_PROFILES = {
    standard: {
        name: 'Standard',
        workTime: 25 * 60,
        microBreak: 2 * 60,
        exerciseBreak: 5 * 60,
        longBreak: 15 * 60
    },
    deepFocus: {
        name: 'Deep Focus',
        workTime: 52 * 60,
        microBreak: 3 * 60,
        exerciseBreak: 17 * 60,
        longBreak: 30 * 60
    },
    shortSprints: {
        name: 'Short Sprints',
        workTime: 15 * 60,
        microBreak: 1 * 60,
        exerciseBreak: 3 * 60,
        longBreak: 10 * 60
    },
    custom: {
        name: 'Custom',
        workTime: 25 * 60,
        microBreak: 2 * 60,
        exerciseBreak: 5 * 60,
        longBreak: 15 * 60
    }
};

/**
 * Active configuration (can be modified by settings)
 */
let CONFIG = { ...DEFAULT_CONFIG };

/**
 * Exercise database - neck and shoulder focused
 * Expanded with more variety for better engagement
 * @constant {Object}
 */
const EXERCISES = {
    micro: [
        {
            title: "Shoulder Rolls",
            desc: "Roll shoulders backward 10 times slowly\nRoll shoulders forward 10 times\nFocus on releasing tension with each roll"
        },
        {
            title: "Neck Side Stretch",
            desc: "Tilt head to right shoulder, hold 20 sec\nTilt head to left shoulder, hold 20 sec\nKeep shoulders relaxed and down"
        },
        {
            title: "Chin Tucks",
            desc: "Pull chin straight back (not down)\nHold for 5 seconds\nRepeat 8-10 times\nThis helps align your neck"
        },
        {
            title: "Upper Trap Stretch",
            desc: "Sit tall, place right hand on left side of head\nGently pull head toward right shoulder\nHold 15-20 seconds, repeat other side\nFeel stretch along side of neck"
        },
        {
            title: "Wrist & Forearm Relief",
            desc: "Extend arm, pull fingers back gently\nHold 10 seconds each hand\nMake fists, then spread fingers wide\nRepeat 5 times to release typing tension"
        },
        {
            title: "Eye Rest",
            desc: "Look away from screen at distant object\nHold for 20 seconds (20-20-20 rule)\nBlink rapidly 10 times\nGently massage temples in circles"
        }
    ],
    exercise: [
        {
            title: "Complete Neck Release",
            desc: "1. Neck rotations: 5 slow circles each way\n2. Ear to shoulder stretch: 30 sec each side\n3. Resistance exercise: Push hand against head, hold 10 sec each direction\n4. Upper trap stretch: Pull head gently to side"
        },
        {
            title: "Shoulder & Upper Back",
            desc: "1. Shoulder blade squeezes: 15 reps, hold 5 sec\n2. Wall angels: 15 slow reps\n3. Doorway chest stretch: 30 sec each side\n4. Cat-cow stretches: 10 reps"
        },
        {
            title: "Posture Reset",
            desc: "1. Stand against wall, flatten back\n2. Arms at 90° against wall, slide up/down 10x\n3. Forward fold with clasped hands\n4. Gentle spinal twists: 30 sec each side"
        },
        {
            title: "Desk Warrior Sequence",
            desc: "1. Standing backbend: hands on lower back, arch gently\n2. Side stretches: reach overhead, lean left/right\n3. Hip flexor stretch: lunge position, 30 sec each\n4. Ankle circles: 10 each direction, both feet"
        },
        {
            title: "Energy Boost Circuit",
            desc: "1. Jumping jacks: 20 reps\n2. Desk push-ups: 10 reps\n3. Chair squats: 15 reps\n4. Standing knee raises: 10 each leg\n5. Deep breathing: 5 slow breaths"
        },
        {
            title: "Tension Release Flow",
            desc: "1. Jaw massage: circles on jaw muscles\n2. Scalp massage: fingertips, gentle circles\n3. Neck rolls: very slow, full range\n4. Shoulder shrugs: up to ears, drop with sigh\n5. Hand shakes: shake out tension"
        }
    ],
    long: [
        {
            title: "Deep Recovery Break",
            desc: "Time for a proper break:\n• Walk away from your desk\n• Do full body stretches\n• Consider using a tennis ball for shoulder blade massage\n• Check your workstation ergonomics"
        },
        {
            title: "Mindful Movement Session",
            desc: "Take this time to truly reset:\n• 5-minute walk (indoor or outdoor)\n• Dynamic stretching routine\n• Practice deep breathing or meditation\n• Hydrate and have a healthy snack\n• Adjust your workspace setup"
        },
        {
            title: "Active Recovery",
            desc: "Use this break to boost circulation:\n• Light cardio: stairs, walk, or jog in place\n• Full body dynamic stretches\n• Foam roll or massage any tight areas\n• Practice balance exercises\n• End with progressive muscle relaxation"
        }
    ]
};

/**
 * Session history manager
 * @class
 */
class SessionHistory {
    constructor() {
        this.sessions = [];
        this.load();
    }

    /**
     * Add a session to history
     * @param {Object} session - Session data
     */
    addSession(session) {
        this.sessions.unshift({
            ...session,
            timestamp: Date.now(),
            date: new Date().toISOString()
        });

        // Keep only the last MAX_HISTORY_ENTRIES
        if (this.sessions.length > CONFIG.MAX_HISTORY_ENTRIES) {
            this.sessions = this.sessions.slice(0, CONFIG.MAX_HISTORY_ENTRIES);
        }

        this.save();
    }

    /**
     * Get sessions for a specific date
     * @param {Date} date - Date to filter by
     * @returns {Array} Sessions for that date
     */
    getSessionsForDate(date) {
        const dateStr = date.toDateString();
        return this.sessions.filter(s => {
            const sessionDate = new Date(s.date).toDateString();
            return sessionDate === dateStr;
        });
    }

    /**
     * Get sessions for the last N days
     * @param {number} days - Number of days
     * @returns {Array} Sessions from last N days
     */
    getRecentSessions(days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.sessions.filter(s => s.timestamp >= cutoff);
    }

    /**
     * Calculate total time spent
     * @param {number} days - Number of days to calculate
     * @returns {Object} Time statistics
     */
    calculateTimeStats(days = 7) {
        const recent = this.getRecentSessions(days);
        let totalWork = 0;
        let totalBreak = 0;

        recent.forEach(session => {
            if (session.type === 'work') {
                totalWork += session.duration;
            } else {
                totalBreak += session.duration;
            }
        });

        return {
            totalWork,
            totalBreak,
            total: totalWork + totalBreak,
            workPercentage: totalWork / (totalWork + totalBreak) * 100 || 0
        };
    }

    /**
     * Get statistics by day of week
     * @returns {Object} Activity by day
     */
    getActivityByDayOfWeek() {
        const byDay = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        this.sessions.forEach(session => {
            const day = new Date(session.date).getDay();
            byDay[day]++;
        });
        return byDay;
    }

    /**
     * Save history to localStorage
     */
    save() {
        try {
            localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(this.sessions));
        } catch (error) {
            console.warn('Could not save history:', error);
        }
    }

    /**
     * Load history from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(CONFIG.HISTORY_KEY);
            if (saved) {
                this.sessions = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load history:', error);
        }
    }

    /**
     * Clear all history
     */
    clear() {
        this.sessions = [];
        this.save();
    }
}

/**
 * Achievement manager
 * @class
 */
class AchievementManager {
    constructor() {
        this.unlocked = new Set();
        this.load();
    }

    /**
     * Check and unlock achievements
     * @param {Object} stats - User statistics
     * @param {Object} streak - Streak data
     * @param {Object} settings - User settings
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements(stats, streak, settings) {
        const newlyUnlocked = [];

        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (!this.unlocked.has(achievement.id)) {
                if (achievement.check(stats, streak, settings)) {
                    this.unlock(achievement.id);
                    newlyUnlocked.push(achievement);
                }
            }
        });

        return newlyUnlocked;
    }

    /**
     * Check time-based achievements
     * @returns {Array} Newly unlocked achievements
     */
    checkTimeBasedAchievements() {
        const hour = new Date().getHours();
        const newlyUnlocked = [];

        // Early Bird (before 7 AM)
        if (hour < 7 && !this.unlocked.has('earlyBird')) {
            this.unlock('earlyBird');
            newlyUnlocked.push(ACHIEVEMENTS.earlyBird);
        }

        // Night Owl (after 10 PM)
        if (hour >= 22 && !this.unlocked.has('nightOwl')) {
            this.unlock('nightOwl');
            newlyUnlocked.push(ACHIEVEMENTS.nightOwl);
        }

        return newlyUnlocked;
    }

    /**
     * Unlock an achievement
     * @param {string} id - Achievement ID
     */
    unlock(id) {
        this.unlocked.add(id);
        this.save();
    }

    /**
     * Check if achievement is unlocked
     * @param {string} id - Achievement ID
     * @returns {boolean} True if unlocked
     */
    isUnlocked(id) {
        return this.unlocked.has(id);
    }

    /**
     * Get all unlocked achievements
     * @returns {Array} Array of unlocked achievements
     */
    getUnlocked() {
        return Array.from(this.unlocked).map(id =>
            Object.values(ACHIEVEMENTS).find(a => a.id === id)
        ).filter(Boolean);
    }

    /**
     * Get completion percentage
     * @returns {number} Percentage of achievements unlocked
     */
    getCompletionPercentage() {
        const total = Object.keys(ACHIEVEMENTS).length;
        const unlocked = this.unlocked.size;
        return (unlocked / total * 100).toFixed(1);
    }

    /**
     * Save unlocked achievements to localStorage
     */
    save() {
        try {
            localStorage.setItem(CONFIG.ACHIEVEMENTS_KEY, JSON.stringify(Array.from(this.unlocked)));
        } catch (error) {
            console.warn('Could not save achievements:', error);
        }
    }

    /**
     * Load unlocked achievements from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(CONFIG.ACHIEVEMENTS_KEY);
            if (saved) {
                this.unlocked = new Set(JSON.parse(saved));
            }
        } catch (error) {
            console.warn('Could not load achievements:', error);
        }
    }
}

/**
 * Settings manager for user preferences
 * @class
 */
class Settings {
    constructor() {
        this.profile = 'standard';
        this.soundEnabled = true;
        this.soundVolume = 0.7;
        this.soundType = 'bell';
        this.notificationsEnabled = true;
        this.autoStartBreaks = false;
        this.autoStartWork = false;
        this.dailyGoal = 8; // sessions per day
        this.theme = 'auto'; // auto, light, dark
        this.customTimes = { ...TIMER_PROFILES.standard };
    }

    /**
     * Save settings to localStorage
     */
    save() {
        try {
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify({
                profile: this.profile,
                soundEnabled: this.soundEnabled,
                soundVolume: this.soundVolume,
                soundType: this.soundType,
                notificationsEnabled: this.notificationsEnabled,
                autoStartBreaks: this.autoStartBreaks,
                autoStartWork: this.autoStartWork,
                dailyGoal: this.dailyGoal,
                theme: this.theme,
                customTimes: this.customTimes
            }));
        } catch (error) {
            console.warn('Could not save settings:', error);
        }
    }

    /**
     * Load settings from localStorage
     * @returns {boolean} True if settings were loaded
     */
    load() {
        try {
            const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(this, parsed);
                return true;
            }
        } catch (error) {
            console.warn('Could not load settings:', error);
        }
        return false;
    }

    /**
     * Apply current profile settings to CONFIG
     */
    applyProfile() {
        const profile = this.profile === 'custom' ? this.customTimes : TIMER_PROFILES[this.profile];
        if (profile) {
            CONFIG.WORK_TIME = profile.workTime;
            CONFIG.MICRO_BREAK = profile.microBreak;
            CONFIG.EXERCISE_BREAK = profile.exerciseBreak;
            CONFIG.LONG_BREAK = profile.longBreak;
        }
    }

    /**
     * Export all settings and data
     * @returns {Object} All user data
     */
    exportData() {
        const state = localStorage.getItem(CONFIG.STORAGE_KEY);
        const settings = localStorage.getItem(CONFIG.SETTINGS_KEY);
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: settings ? JSON.parse(settings) : null,
            state: state ? JSON.parse(state) : null
        };
    }

    /**
     * Import settings and data
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    importData(data) {
        try {
            if (data.settings) {
                localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(data.settings));
                Object.assign(this, data.settings);
            }
            if (data.state) {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data.state));
            }
            return true;
        } catch (error) {
            console.error('Could not import data:', error);
            return false;
        }
    }
}

/**
 * Application state manager
 * @class
 */
class TimerState {
    constructor() {
        this.currentTime = CONFIG.WORK_TIME;
        this.totalTime = CONFIG.WORK_TIME;
        this.isRunning = false;
        this.currentPhase = 'work';
        this.interval = null;
        this.sessionCount = 0;
        this.stats = {
            sessions: 0,
            exercises: 0,
            totalWorkTime: 0,
            totalBreakTime: 0
        };
        this.streak = {
            current: 0,
            longest: 0,
            lastDate: null
        };
    }

    /**
     * Reset timer to initial state
     */
    reset() {
        this.currentTime = CONFIG.WORK_TIME;
        this.totalTime = CONFIG.WORK_TIME;
        this.isRunning = false;
        this.currentPhase = 'work';
        this.sessionCount = 0;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Update streak based on current date
     */
    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.streak.lastDate;

        if (lastDate === today) {
            return; // Already updated today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastDate === yesterdayStr) {
            // Continue streak
            this.streak.current++;
        } else if (lastDate && lastDate !== yesterdayStr) {
            // Streak broken
            this.streak.current = 1;
        } else {
            // First time or new streak
            this.streak.current = 1;
        }

        if (this.streak.current > this.streak.longest) {
            this.streak.longest = this.streak.current;
        }

        this.streak.lastDate = today;
    }

    /**
     * Save state to localStorage
     */
    save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                stats: this.stats,
                streak: this.streak,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Could not save state to localStorage:', error);
        }
    }

    /**
     * Load state from localStorage
     * @returns {boolean} True if state was loaded
     */
    load() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.stats = { ...this.stats, ...parsed.stats };
                if (parsed.streak) {
                    this.streak = { ...this.streak, ...parsed.streak };
                }
                return true;
            }
        } catch (error) {
            console.warn('Could not load state from localStorage:', error);
        }
        return false;
    }
}

/**
 * DOM element cache for efficient access
 * @class
 */
class DOMElements {
    constructor() {
        this.timer = document.getElementById('timer');
        this.phase = document.getElementById('phase');
        this.progress = document.getElementById('progress');
        this.startBtn = document.getElementById('startBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.exerciseInfo = document.getElementById('exerciseInfo');
        this.exerciseTitle = document.getElementById('exerciseTitle');
        this.exerciseDesc = document.getElementById('exerciseDesc');
        this.notification = document.getElementById('notification');
        this.sessionsCount = document.getElementById('sessionsCount');
        this.exercisesCount = document.getElementById('exercisesCount');
        this.streakCount = document.getElementById('streakCount');
        this.goalProgress = document.getElementById('goalProgress');
        this.settingsModal = document.getElementById('settingsModal');
    }
}

/**
 * Notification manager for alerts and sounds
 * @class
 */
class NotificationManager {
    constructor(settings) {
        this.settings = settings;
        this.sound = null;
        this.initSound();
        this.requestPermission();
    }

    /**
     * Initialize audio element
     */
    initSound() {
        try {
            const soundOption = SOUND_OPTIONS[this.settings.soundType] || SOUND_OPTIONS.bell;
            this.sound = new Audio(soundOption.file);
            this.sound.volume = this.settings.soundVolume;
        } catch (error) {
            console.warn('Could not initialize sound:', error);
        }
    }

    /**
     * Update sound type
     * @param {string} soundType - Sound type key
     */
    setSoundType(soundType) {
        try {
            const soundOption = SOUND_OPTIONS[soundType] || SOUND_OPTIONS.bell;
            this.sound = new Audio(soundOption.file);
            this.sound.volume = this.settings.soundVolume;
        } catch (error) {
            console.warn('Could not update sound type:', error);
        }
    }

    /**
     * Update sound volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (this.sound) {
            this.sound.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Request notification permission
     */
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(err => {
                console.warn('Notification permission denied:', err);
            });
        }
    }

    /**
     * Show notification with sound and alerts
     * @param {string} message - Message to display
     */
    show(message) {
        // Play notification sound
        if (this.settings.soundEnabled && this.sound) {
            this.sound.play().catch(err => {
                console.warn('Error playing sound:', err);
            });
        }

        // Show in-app notification
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');

            // Hide notification after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }

        // Browser notification
        if (this.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification('Hvila', {
                    body: message,
                    icon: 'icons/icon-192.png',
                    badge: 'icons/icon-192.png',
                    vibrate: [200, 100, 200],
                    tag: 'relief-timer',
                    silent: !this.settings.soundEnabled
                });
            } catch (error) {
                console.warn('Could not show browser notification:', error);
            }
        }

        // Vibration for mobile
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([200, 100, 200]);
            } catch (error) {
                console.warn('Vibration not supported:', error);
            }
        }
    }
}

/**
 * Main application class
 * @class
 */
class ReliefTimer {
    constructor() {
        this.settings = new Settings();
        this.state = new TimerState();
        this.history = new SessionHistory();
        this.achievements = new AchievementManager();
        this.dom = new DOMElements();

        // Load settings first
        this.settings.load();
        this.settings.applyProfile();

        // Apply theme
        this.applyTheme();

        // Initialize notifications with settings
        this.notifications = new NotificationManager(this.settings);

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Load saved state
        this.state.load();

        // Update streak
        this.state.updateStreak();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize display
        this.updateDisplay();
        this.updateStats();
        this.updateBackgroundTheme();

        // Set up PWA features
        this.setupPWA();

        // Prevent sleep on mobile
        this.setupWakeLock();

        // Check for updates
        this.checkForUpdates();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        this.dom.startBtn.addEventListener('click', () => this.toggleTimer());
        this.dom.skipBtn.addEventListener('click', () => this.skipPhase());
        this.dom.resetBtn.addEventListener('click', () => this.resetTimer());

        // Settings button
        if (this.dom.settingsBtn) {
            this.dom.settingsBtn.addEventListener('click', () => this.openSettings());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Ignore if typing in input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
                return;
            }

            if (event.code === 'Space') {
                event.preventDefault();
                this.toggleTimer();
            } else if (event.code === 'Escape') {
                this.closeSettings();
            } else if (event.code === 'KeyS' && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                this.skipPhase();
            } else if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                this.resetTimer();
            } else if (event.code === 'Comma') {
                event.preventDefault();
                this.openSettings();
            }
        });

        // Settings form event listeners (will be set when modal is created)
        this.setupSettingsListeners();
    }

    /**
     * Set up settings modal event listeners
     */
    setupSettingsListeners() {
        // Will be called when settings modal is opened
        document.addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal' || e.target.id === 'closeSettings') {
                this.closeSettings();
            }
        });
    }

    /**
     * Set up PWA features including service worker and install prompt
     */
    setupPWA() {
        // Register service worker for offline functionality
        if ('serviceWorker' in navigator) {
            // Allow service worker in both HTTPS and localhost
            if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('Service worker registered:', registration);
                    })
                    .catch(error => {
                        console.warn('Service worker registration failed:', error);
                    });
            }
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install button if not already installed
            this.showInstallPrompt(deferredPrompt);
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.notifications.show('App installed! You can now use Hvila offline.');
            deferredPrompt = null;
        });
    }

    /**
     * Show PWA install prompt
     * @param {Event} deferredPrompt - Install prompt event
     */
    showInstallPrompt(deferredPrompt) {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Show install notification
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = '';

            const text = document.createTextNode('Install Hvila for offline use ');
            const installBtn = document.createElement('button');
            installBtn.textContent = 'Install';
            installBtn.className = 'notification-action';

            const dismissBtn = document.createElement('button');
            dismissBtn.textContent = 'Dismiss';
            dismissBtn.className = 'notification-action';

            notification.append(text, installBtn, dismissBtn);
            notification.classList.add('show');

            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to install prompt: ${outcome}`);
                    notification.classList.remove('show');
                }
            });

            dismissBtn.addEventListener('click', () => {
                notification.classList.remove('show');
            });
        }
    }

    /**
     * Check for service worker updates
     */
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update().catch(err => {
                    console.warn('Could not check for updates:', err);
                });

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker?.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateNotification();
                        }
                    });
                });
            });
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = '';

            const text = document.createTextNode('New version available! ');
            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Refresh';
            updateBtn.className = 'notification-action';

            notification.append(text, updateBtn);
            notification.classList.add('show');

            updateBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    setupWakeLock() {
        this.wakeLock = null;

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.state.isRunning) {
                this.requestWakeLock();
            }
        });
    }

    /**
     * Request a screen wake lock to prevent sleep during active timer
     */
    async requestWakeLock() {
        if (!('wakeLock' in navigator)) return;
        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.wakeLock.addEventListener('release', () => {
                this.wakeLock = null;
            });
        } catch (error) {
            console.warn('Wake Lock error:', error);
        }
    }

    /**
     * Release the screen wake lock
     */
    async releaseWakeLock() {
        if (this.wakeLock) {
            try {
                await this.wakeLock.release();
            } catch (error) {
                console.warn('Wake Lock release error:', error);
            }
            this.wakeLock = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        // Update timer display
        this.dom.timer.textContent = this.formatTime(this.state.currentTime);
        
        // Update circular progress
        const progress = (this.state.totalTime - this.state.currentTime) / this.state.totalTime;
        const offset = CONFIG.CIRCUMFERENCE - (progress * CONFIG.CIRCUMFERENCE);
        this.dom.progress.style.strokeDashoffset = offset;

        // Warning animation when time is low
        if (this.state.currentTime <= 10 && this.state.currentTime > 0) {
            this.dom.timer.classList.add('warning');
        } else {
            this.dom.timer.classList.remove('warning');
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        this.dom.sessionsCount.textContent = this.state.stats.sessions;
        this.dom.exercisesCount.textContent = this.state.stats.exercises;

        // Update streak if element exists
        if (this.dom.streakCount) {
            this.dom.streakCount.textContent = `${this.state.streak.current} day${this.state.streak.current !== 1 ? 's' : ''}`;
        }

        // Update goal progress if element exists
        if (this.dom.goalProgress) {
            const todaySessions = this.history.getSessionsForDate(new Date())
                .filter(s => s.type === 'work').length;
            const progress = Math.min(100, (todaySessions / this.settings.dailyGoal) * 100);
            this.dom.goalProgress.style.width = `${progress}%`;
            this.dom.goalProgress.setAttribute('aria-valuenow', Math.round(progress));

            // Show motivational message exactly when goal is reached
            if (todaySessions === this.settings.dailyGoal && todaySessions === this.state.sessionCount) {
                this.notifications.show(`Goal reached! ${this.settings.dailyGoal} sessions completed today!`);
            }
        }
    }

    showExercise() {
        const exerciseType = this.getExerciseType();
        if (!exerciseType) return;

        const exerciseList = EXERCISES[exerciseType];
        const exercise = exerciseList[Math.floor(Math.random() * exerciseList.length)];
        
        this.dom.exerciseTitle.textContent = exercise.title;
        this.dom.exerciseDesc.textContent = exercise.desc;
        this.dom.exerciseInfo.classList.add('active');
    }

    hideExercise() {
        this.dom.exerciseInfo.classList.remove('active');
    }

    getExerciseType() {
        const phaseMap = {
            'microBreak': 'micro',
            'exerciseBreak': 'exercise',
            'longBreak': 'long'
        };
        return phaseMap[this.state.currentPhase];
    }

    /**
     * Move to next phase (work/break)
     */
    nextPhase() {
        this.hideExercise();
        this.dom.phase.classList.remove('active');

        const wasWorking = this.state.currentPhase === 'work';
        const sessionType = this.state.currentPhase;
        const sessionDuration = this.state.totalTime;

        // Log completed session to history
        this.history.addSession({
            type: sessionType,
            duration: sessionDuration,
            completed: true
        });

        if (wasWorking) {
            this.state.sessionCount++;
            this.state.stats.sessions++;
            this.state.updateStreak();

            // Check for time-based achievements when starting a session
            const timeAchievements = this.achievements.checkTimeBasedAchievements();
            this.showNewAchievements(timeAchievements);

            // Check regular achievements
            const newAchievements = this.achievements.checkAchievements(
                this.state.stats,
                this.state.streak,
                this.settings
            );
            this.showNewAchievements(newAchievements);

            if (this.state.sessionCount % 4 === 0) {
                // Long break after 4 sessions
                this.setPhase('longBreak', CONFIG.LONG_BREAK, 'Long Break', 'Time for a long break! Walk and stretch.');
            } else if (this.state.sessionCount % 2 === 0) {
                // Exercise break after every 2nd session
                this.setPhase('exerciseBreak', CONFIG.EXERCISE_BREAK, 'Exercise Break', 'Neck & shoulder exercises time!');
                this.state.stats.exercises++;
            } else {
                // Micro break after every session
                this.setPhase('microBreak', CONFIG.MICRO_BREAK, 'Quick Break', 'Quick neck stretch!');
            }

            this.showExercise();

            // Auto-start break if enabled
            if (this.settings.autoStartBreaks && !this.state.isRunning) {
                setTimeout(() => this.toggleTimer(), 1000);
            }
        } else {
            // Back to work
            this.setPhase('work', CONFIG.WORK_TIME, 'Focus Time', 'Back to work! Check your posture.');

            // Auto-start work if enabled
            if (this.settings.autoStartWork && !this.state.isRunning) {
                setTimeout(() => this.toggleTimer(), 1000);
            }
        }

        this.updateStats();
        this.state.save();
        this.updateDisplay();
    }

    /**
     * Show newly unlocked achievements
     * @param {Array} achievements - Array of new achievements
     */
    showNewAchievements(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementNotification(achievement);
            }, index * 2000); // Stagger notifications
        });
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement object
     */
    showAchievementNotification(achievement) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = '';

            const unlock = document.createElement('div');
            unlock.className = 'achievement-unlock';

            const iconEl = document.createElement('div');
            iconEl.className = 'achievement-icon';
            iconEl.textContent = achievement.icon;

            const content = document.createElement('div');
            content.className = 'achievement-content';

            const title = document.createElement('div');
            title.className = 'achievement-title';
            title.textContent = 'Achievement Unlocked!';

            const name = document.createElement('div');
            name.className = 'achievement-name';
            name.textContent = achievement.name;

            const desc = document.createElement('div');
            desc.className = 'achievement-desc';
            desc.textContent = achievement.description;

            content.append(title, name, desc);
            unlock.append(iconEl, content);
            notification.appendChild(unlock);
            notification.classList.add('show', 'achievement');

            // Play special achievement sound if available
            if (this.settings.soundEnabled && this.notifications.sound) {
                this.notifications.sound.play().catch(() => {});
            }

            setTimeout(() => {
                notification.classList.remove('show', 'achievement');
            }, 5000);
        }
    }

    setPhase(phase, time, displayText, notificationText) {
        this.state.currentPhase = phase;
        this.state.currentTime = time;
        this.state.totalTime = time;
        this.dom.phase.textContent = displayText;
        this.dom.phase.classList.add('active');
        this.notifications.show(notificationText);
        
        // Update background theme based on phase
        this.updateBackgroundTheme();
    }

    updateBackgroundTheme() {
        // Remove all phase classes
        document.body.classList.remove('phase-work', 'phase-microBreak', 'phase-exerciseBreak', 'phase-longBreak');
        
        // Add current phase class
        const phaseClassMap = {
            'work': 'phase-work',
            'microBreak': 'phase-microBreak', 
            'exerciseBreak': 'phase-exerciseBreak',
            'longBreak': 'phase-longBreak'
        };
        
        const phaseClass = phaseClassMap[this.state.currentPhase];
        if (phaseClass) {
            document.body.classList.add(phaseClass);
        }
    }

    tick() {
        if (this.state.currentTime > 0) {
            this.state.currentTime--;
            this.updateDisplay();
        } else {
            this.nextPhase();
        }
    }

    toggleTimer() {
        if (this.state.isRunning) {
            // Pause timer
            clearInterval(this.state.interval);
            this.state.interval = null;
            this.dom.startBtn.textContent = 'Start';
            this.dom.phase.textContent = 'Paused';
            this.dom.phase.classList.remove('active');
            this.releaseWakeLock();
        } else {
            // Start timer
            this.state.interval = setInterval(() => this.tick(), 1000);
            this.dom.startBtn.textContent = 'Pause';
            this.requestWakeLock();

            if (this.state.currentPhase === 'work') {
                this.dom.phase.textContent = 'Focus Time';
                this.dom.phase.classList.add('active');
            }
        }

        this.state.isRunning = !this.state.isRunning;
    }

    skipPhase() {
        this.notifications.show('Phase skipped');
        this.state.currentTime = 0;
        this.tick();
    }

    /**
     * Reset timer to initial state
     */
    resetTimer() {
        this.state.reset();
        this.dom.startBtn.textContent = 'Start';
        this.dom.phase.textContent = 'Ready';
        this.dom.phase.classList.remove('active');
        this.hideExercise();
        this.updateDisplay();
        this.updateBackgroundTheme();
        this.releaseWakeLock();
    }

    /**
     * Apply theme based on settings
     */
    applyTheme() {
        document.body.classList.remove('theme-light', 'theme-dark');

        if (this.settings.theme === 'light') {
            document.body.classList.add('theme-light');
        } else if (this.settings.theme === 'dark') {
            document.body.classList.add('theme-dark');
        }
        // 'auto' uses system preference (no class needed)
    }

    /**
     * Open settings modal
     */
    openSettings() {
        // Create modal if it doesn't exist
        if (!document.getElementById('settingsModal')) {
            this.createSettingsModal();
        }

        // Populate current settings
        this.populateSettings();

        // Show modal
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Store the element that had focus before opening
            this._previousFocus = document.activeElement;

            // Focus the close button for keyboard users
            const closeBtn = document.getElementById('closeSettings');
            if (closeBtn) closeBtn.focus();

            // Set up focus trap
            this._trapFocus = (e) => {
                if (e.key !== 'Tab') return;
                const focusable = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            };
            modal.addEventListener('keydown', this._trapFocus);
        }
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            if (this._trapFocus) {
                modal.removeEventListener('keydown', this._trapFocus);
                this._trapFocus = null;
            }
            modal.style.display = 'none';
            document.body.style.overflow = '';

            // Restore focus to the element that opened the modal
            if (this._previousFocus) {
                this._previousFocus.focus();
                this._previousFocus = null;
            }
        }
    }

    /**
     * Create settings modal HTML
     */
    createSettingsModal() {
        const modalHTML = `
            <div id="settingsModal" class="modal" role="dialog" aria-modal="true" aria-label="Settings">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>Settings</h2>
                        <button id="closeSettings" class="close-btn">&times;</button>
                    </div>

                    <div class="modal-tabs">
                        <button class="tab-btn active" data-tab="settings">⚙️ Settings</button>
                        <button class="tab-btn" data-tab="achievements">🏆 Achievements</button>
                        <button class="tab-btn" data-tab="history">📊 History</button>
                        <button class="tab-btn" data-tab="analytics">📈 Analytics</button>
                    </div>

                    <div class="modal-body">
                        <!-- Settings Tab -->
                        <div id="tab-settings" class="tab-content active">
                            <form id="settingsForm">
                                <div class="setting-group">
                                    <label for="profile">Timer Profile</label>
                                    <select id="profile" name="profile">
                                        <option value="standard">Standard (25/5/15)</option>
                                        <option value="deepFocus">Deep Focus (52/17/30)</option>
                                        <option value="shortSprints">Short Sprints (15/3/10)</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>

                                <div id="customTimerSettings" class="custom-timer-settings" style="display: none;">
                                    <h4 class="custom-timer-title">Custom Timer Durations</h4>
                                    <div class="setting-group">
                                        <label for="customWorkTime">Work Session (minutes)</label>
                                        <input type="number" id="customWorkTime" name="customWorkTime" min="1" max="120" value="25">
                                    </div>
                                    <div class="setting-group">
                                        <label for="customMicroBreak">Micro Break (minutes)</label>
                                        <input type="number" id="customMicroBreak" name="customMicroBreak" min="1" max="30" value="2">
                                    </div>
                                    <div class="setting-group">
                                        <label for="customExerciseBreak">Exercise Break (minutes)</label>
                                        <input type="number" id="customExerciseBreak" name="customExerciseBreak" min="1" max="60" value="5">
                                    </div>
                                    <div class="setting-group">
                                        <label for="customLongBreak">Long Break (minutes)</label>
                                        <input type="number" id="customLongBreak" name="customLongBreak" min="1" max="60" value="15">
                                    </div>
                                </div>

                                <div class="setting-group">
                                    <label for="theme">Theme</label>
                                    <select id="theme" name="theme">
                                        <option value="auto">Auto (System)</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>

                                <div class="setting-group">
                                    <label>
                                        <input type="checkbox" id="soundEnabled" name="soundEnabled">
                                        Enable Sound
                                    </label>
                                </div>

                                <div class="setting-group">
                                    <label for="soundType">Notification Sound</label>
                                    <select id="soundType" name="soundType">
                                        <option value="bell">Bell</option>
                                        <option value="chime">Chime</option>
                                        <option value="gong">Gong</option>
                                        <option value="subtle">Subtle Ping</option>
                                    </select>
                                </div>

                                <div class="setting-group">
                                    <label for="soundVolume">Sound Volume</label>
                                    <input type="range" id="soundVolume" name="soundVolume" min="0" max="1" step="0.1">
                                    <span id="volumeValue">70%</span>
                                </div>

                                <div class="setting-group">
                                    <label>
                                        <input type="checkbox" id="notificationsEnabled" name="notificationsEnabled">
                                        Enable Notifications
                                    </label>
                                </div>

                                <div class="setting-group">
                                    <label>
                                        <input type="checkbox" id="autoStartBreaks" name="autoStartBreaks">
                                        Auto-start Breaks
                                    </label>
                                </div>

                                <div class="setting-group">
                                    <label>
                                        <input type="checkbox" id="autoStartWork" name="autoStartWork">
                                        Auto-start Work Sessions
                                    </label>
                                </div>

                                <div class="setting-group">
                                    <label for="dailyGoal">Daily Goal (sessions)</label>
                                    <input type="number" id="dailyGoal" name="dailyGoal" min="1" max="20" value="8">
                                </div>

                                <div class="setting-group">
                                    <button type="button" id="exportData" class="secondary-btn">Export Data</button>
                                    <button type="button" id="importData" class="secondary-btn">Import Data</button>
                                    <input type="file" id="importFile" accept=".json" style="display: none;">
                                </div>
                            </form>
                        </div>

                        <!-- Achievements Tab -->
                        <div id="tab-achievements" class="tab-content">
                            <div class="achievements-header">
                                <h3>Your Achievements</h3>
                                <p class="completion-text">Completed: <span id="achievementProgress">0%</span></p>
                            </div>
                            <div id="achievementsList" class="achievements-grid"></div>
                        </div>

                        <!-- History Tab -->
                        <div id="tab-history" class="tab-content">
                            <div class="history-header">
                                <h3>Recent Sessions</h3>
                                <button type="button" id="clearHistory" class="secondary-btn small">Clear History</button>
                            </div>
                            <div id="historyList" class="history-list"></div>
                        </div>

                        <!-- Analytics Tab -->
                        <div id="tab-analytics" class="tab-content">
                            <div class="analytics-header">
                                <h3>Your Progress</h3>
                            </div>
                            <div id="analyticsContent" class="analytics-content"></div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="saveSettings" class="primary-btn">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add tab switching logic
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Add event listeners
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('closeSettings')?.addEventListener('click', () => this.closeSettings());
        document.getElementById('exportData')?.addEventListener('click', () => this.exportData());
        document.getElementById('importData')?.addEventListener('click', () => {
            document.getElementById('importFile')?.click();
        });
        document.getElementById('importFile')?.addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearHistory')?.addEventListener('click', () => this.clearHistory());

        // Volume slider real-time update
        document.getElementById('soundVolume')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('volumeValue').textContent = `${Math.round(value * 100)}%`;
            this.notifications.setVolume(parseFloat(value));
        });

        // Theme preview
        document.getElementById('theme')?.addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applyTheme();
        });

        // Sound type preview
        document.getElementById('soundType')?.addEventListener('change', (e) => {
            this.settings.soundType = e.target.value;
            this.notifications.setSoundType(e.target.value);
            // Play preview
            if (this.settings.soundEnabled) {
                this.notifications.sound?.play().catch(() => {});
            }
        });

        // Profile change - show/hide custom timer settings
        document.getElementById('profile')?.addEventListener('change', (e) => {
            const customSettings = document.getElementById('customTimerSettings');
            if (customSettings) {
                customSettings.style.display = e.target.value === 'custom' ? 'block' : 'none';
            }
        });
    }

    /**
     * Switch between modal tabs
     * @param {string} tabName - Tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });

        // Populate tab content
        if (tabName === 'achievements') {
            this.populateAchievements();
        } else if (tabName === 'history') {
            this.populateHistory();
        } else if (tabName === 'analytics') {
            this.populateAnalytics();
        }
    }

    /**
     * Populate achievements tab
     */
    populateAchievements() {
        const container = document.getElementById('achievementsList');
        const progressSpan = document.getElementById('achievementProgress');

        if (!container) return;

        progressSpan.textContent = this.achievements.getCompletionPercentage() + '%';

        container.textContent = '';

        Object.values(ACHIEVEMENTS).forEach(achievement => {
            const isUnlocked = this.achievements.isUnlocked(achievement.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            const iconEl = document.createElement('div');
            iconEl.className = 'achievement-icon';
            iconEl.textContent = achievement.icon;

            const info = document.createElement('div');
            info.className = 'achievement-info';

            const nameEl = document.createElement('div');
            nameEl.className = 'achievement-name';
            nameEl.textContent = achievement.name;

            const descEl = document.createElement('div');
            descEl.className = 'achievement-desc';
            descEl.textContent = achievement.description;

            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.textContent = isUnlocked ? '✓ Unlocked' : '🔒 Locked';

            info.append(nameEl, descEl, badge);
            card.append(iconEl, info);
            container.appendChild(card);
        });
    }

    /**
     * Populate history tab
     */
    populateHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;

        const recentSessions = this.history.getRecentSessions(7);

        if (recentSessions.length === 0) {
            container.textContent = '';
            const empty = document.createElement('p');
            empty.className = 'empty-state';
            empty.textContent = 'No session history yet. Start a timer to begin!';
            container.appendChild(empty);
            return;
        }

        container.textContent = '';

        recentSessions.forEach(session => {
            const date = new Date(session.date);
            const item = document.createElement('div');
            item.className = 'history-item';

            const iconEl = document.createElement('div');
            iconEl.className = 'history-icon';
            iconEl.textContent = session.type === 'work' ? '💼' : '☕';

            const info = document.createElement('div');
            info.className = 'history-info';

            const typeEl = document.createElement('div');
            typeEl.className = 'history-type';
            typeEl.textContent = session.type === 'work' ? 'Work Session' : 'Break';

            const dateEl = document.createElement('div');
            dateEl.className = 'history-date';
            dateEl.textContent = date.toLocaleString();

            info.append(typeEl, dateEl);

            const duration = document.createElement('div');
            duration.className = 'history-duration';
            duration.textContent = `${Math.round(session.duration / 60)} min`;

            item.append(iconEl, info, duration);
            container.appendChild(item);
        });
    }

    /**
     * Populate analytics tab
     */
    populateAnalytics() {
        const container = document.getElementById('analyticsContent');
        if (!container) return;

        const stats = this.history.calculateTimeStats(7);
        const dayStats = this.history.getActivityByDayOfWeek();

        const totalHours = (stats.total / 3600).toFixed(1);
        const workHours = (stats.totalWork / 3600).toFixed(1);
        const breakHours = (stats.totalBreak / 3600).toFixed(1);

        container.textContent = '';

        // Helper to create stat box
        const createStatBox = (number, label) => {
            const box = document.createElement('div');
            box.className = 'stat-box';
            const numEl = document.createElement('div');
            numEl.className = 'stat-number';
            numEl.textContent = number;
            const labelEl = document.createElement('div');
            labelEl.className = 'stat-label';
            labelEl.textContent = label;
            box.append(numEl, labelEl);
            return box;
        };

        // Helper to create analytics section
        const createSection = (title) => {
            const section = document.createElement('div');
            section.className = 'analytics-section';
            const h4 = document.createElement('h4');
            h4.textContent = title;
            section.appendChild(h4);
            return section;
        };

        // Last 7 Days section
        const timeSection = createSection('Last 7 Days');
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        statsGrid.append(
            createStatBox(`${totalHours}h`, 'Total Time'),
            createStatBox(`${workHours}h`, 'Work Time'),
            createStatBox(`${breakHours}h`, 'Break Time'),
            createStatBox(`${stats.workPercentage.toFixed(0)}%`, 'Work Ratio')
        );
        timeSection.appendChild(statsGrid);

        // Activity by Day section
        const daySection = createSection('Activity by Day');
        const dayChart = document.createElement('div');
        dayChart.className = 'day-chart';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day, i) => {
            const bar = document.createElement('div');
            bar.className = 'day-bar';
            const fill = document.createElement('div');
            fill.className = 'bar-fill';
            fill.style.height = `${Math.min(100, dayStats[i] * 10)}%`;
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = day;
            const value = document.createElement('div');
            value.className = 'bar-value';
            value.textContent = dayStats[i];
            bar.append(fill, label, value);
            dayChart.appendChild(bar);
        });
        daySection.appendChild(dayChart);

        // Quick Stats section
        const quickSection = createSection('Quick Stats');
        const quickList = document.createElement('ul');
        quickList.className = 'quick-stats';
        const quickItems = [
            `🎯 Total Sessions: ${this.state.stats.sessions}`,
            `🧘 Exercise Breaks: ${this.state.stats.exercises}`,
            `🔥 Current Streak: ${this.state.streak.current} days`,
            `👑 Longest Streak: ${this.state.streak.longest} days`,
            `📅 Sessions Today: ${this.history.getSessionsForDate(new Date()).length}`
        ];
        quickItems.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            quickList.appendChild(li);
        });
        quickSection.appendChild(quickList);

        container.append(timeSection, daySection, quickSection);
    }

    /**
     * Clear session history
     */
    clearHistory() {
        if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
            this.history.clear();
            this.populateHistory();
            this.notifications.show('History cleared');
        }
    }

    /**
     * Populate settings form with current values
     */
    populateSettings() {
        document.getElementById('profile').value = this.settings.profile;
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('soundType').value = this.settings.soundType;
        document.getElementById('soundVolume').value = this.settings.soundVolume;
        document.getElementById('volumeValue').textContent = `${Math.round(this.settings.soundVolume * 100)}%`;
        document.getElementById('notificationsEnabled').checked = this.settings.notificationsEnabled;
        document.getElementById('autoStartBreaks').checked = this.settings.autoStartBreaks;
        document.getElementById('autoStartWork').checked = this.settings.autoStartWork;
        document.getElementById('dailyGoal').value = this.settings.dailyGoal;

        // Populate custom timer values
        document.getElementById('customWorkTime').value = Math.round(this.settings.customTimes.workTime / 60);
        document.getElementById('customMicroBreak').value = Math.round(this.settings.customTimes.microBreak / 60);
        document.getElementById('customExerciseBreak').value = Math.round(this.settings.customTimes.exerciseBreak / 60);
        document.getElementById('customLongBreak').value = Math.round(this.settings.customTimes.longBreak / 60);

        // Show/hide custom timer settings based on profile
        const customSettings = document.getElementById('customTimerSettings');
        if (customSettings) {
            customSettings.style.display = this.settings.profile === 'custom' ? 'block' : 'none';
        }
    }

    /**
     * Save settings from form
     */
    saveSettings() {
        this.settings.profile = document.getElementById('profile').value;
        this.settings.theme = document.getElementById('theme').value;
        this.settings.soundEnabled = document.getElementById('soundEnabled').checked;
        this.settings.soundType = document.getElementById('soundType').value;
        this.settings.soundVolume = parseFloat(document.getElementById('soundVolume').value);
        this.settings.notificationsEnabled = document.getElementById('notificationsEnabled').checked;
        this.settings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
        this.settings.autoStartWork = document.getElementById('autoStartWork').checked;
        this.settings.dailyGoal = Math.max(1, parseInt(document.getElementById('dailyGoal').value, 10) || 8);

        // Save custom timer values
        if (this.settings.profile === 'custom') {
            const clampMinutes = (id, min, max, fallback) => {
                const val = parseInt(document.getElementById(id).value, 10);
                return (isNaN(val) ? fallback : Math.max(min, Math.min(max, val))) * 60;
            };
            this.settings.customTimes = {
                name: 'Custom',
                workTime: clampMinutes('customWorkTime', 1, 120, 25),
                microBreak: clampMinutes('customMicroBreak', 1, 30, 2),
                exerciseBreak: clampMinutes('customExerciseBreak', 1, 60, 5),
                longBreak: clampMinutes('customLongBreak', 1, 60, 15)
            };
        }

        // Apply profile
        this.settings.applyProfile();

        // Apply theme
        this.applyTheme();

        // Update notification manager
        this.notifications.setVolume(this.settings.soundVolume);
        this.notifications.setSoundType(this.settings.soundType);

        // Reset timer to apply new times
        if (!this.state.isRunning) {
            this.state.currentTime = CONFIG.WORK_TIME;
            this.state.totalTime = CONFIG.WORK_TIME;
            this.updateDisplay();
        }

        // Save to localStorage
        this.settings.save();

        this.notifications.show('Settings saved!');
        this.closeSettings();
    }

    /**
     * Export data to JSON file
     */
    exportData() {
        const data = this.settings.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hvila-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.notifications.show('Data exported successfully!');
    }

    /**
     * Import data from JSON file
     * @param {Event} event - File input change event
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (this.settings.importData(data)) {
                    this.settings.load();
                    this.settings.applyProfile();
                    this.state.load();
                    this.updateStats();
                    this.updateDisplay();
                    this.notifications.show('Data imported successfully!');
                    this.closeSettings();
                    window.location.reload(); // Reload to apply all changes
                } else {
                    this.notifications.show('Error importing data!');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.notifications.show('Invalid file format!');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReliefTimer();
});