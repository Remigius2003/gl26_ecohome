export type Lang = "en" | "fr";

export interface Translations {
    faces:  Record<"right" | "left" | "top" | "bottom" | "front" | "back", string>;
    labels: Record<string, string>;
    ui: {
        view:           string;
        tooFar:         string;
        pathBlocked:    string;
        interactedWith: string;
        loadError:      string;
    };
}

export const translations: Record<Lang, Translations> = {
    en: {
        labels: {
            "Lectures": "Reading",
        },
        faces: {
            front:  "Profile",
            left:   "Experience",
            top:    "Education",
            bottom: "Skills",
            right:  "Projects",
            back:   "Mini Game",
        },
        ui: {
            view:           "View",
            tooFar:         "Too far to interact",
            pathBlocked:    "Path blocked!",
            interactedWith: "Interacted with",
            loadError:      "Could not load objects from server",
        },
    },
    fr: {
        labels: {
            "Skills":      "Compétences",
            "Soft Skills": "Savoir-être",
        },
        faces: {
            front:  "Profil",
            left:   "Expérience",
            top:    "Éducation",
            bottom: "Compétences",
            right:  "Projets",
            back:   "Mini Jeu",
        },
        ui: {
            view:           "Vue",
            tooFar:         "Trop loin pour interagir",
            pathBlocked:    "Chemin bloqué !",
            interactedWith: "Interaction avec",
            loadError:      "Impossible de charger les objets",
        },
    },
};
