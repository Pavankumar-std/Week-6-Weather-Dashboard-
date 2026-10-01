const STORAGE_KEY = "weatherDashboardPreferences";

/**
 * Save user preferences.
 */
export function savePreferences(preferences) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferences)
    );
}

/**
 * Load user preferences.
 */
export function loadPreferences() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        return {
            defaultCity: "Hyderabad",
            units: "metric",
            theme: "light"
        };

    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Unable to read saved preferences:",
            error
        );

        return {
            defaultCity: "Hyderabad",
            units: "metric",
            theme: "light"
        };

    }
}