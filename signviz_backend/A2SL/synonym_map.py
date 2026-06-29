"""
synonym_map.py
==============
Synonym → dataset word mapping for SignViz.

Data source: signviz-word-synonyms.xlsx (provided by user).

Logic:
  1. Direct match  — word exists as a .webm filename in assets/
  2. Synonym match — word is a synonym of a dataset word (from this table)

Both lookups are case-insensitive and punctuation-tolerant.
"""

from __future__ import annotations
import re
from typing import Optional

# ─── Raw synonym table (from Excel) ──────────────────────────────────────────
# Format: { "dataset_word": ["synonym1", "synonym2", ...] }
# Dataset word is the .webm filename (without extension), title-cased.

_RAW_SYNONYMS: dict[str, list[str]] = {
    "About":      ["concerning", "regarding"],
    "Above":      ["atop", "higher", "across"],
    "Action":     ["act", "operation"],
    "Active":     ["energetic", "engaged"],
    "Activity":   ["movement", "task"],
    "After":      ["afterward", "following", "later"],
    "Again":      ["repeatedly"],
    "Against":    ["opposing", "versus", "contrary"],
    "Age":        ["era", "years"],
    "All":        ["entire", "everything", "whole"],
    "Alone":      ["isolated", "lonely", "solo"],
    "Also":       ["additionally", "plus", "too"],
    "And":        ["along", "alongside", "together"],
    "Ask":        ["inquire", "question", "request"],
    "At":         ["around", "near"],
    "Be":         ["exist"],
    "Beard":      [],
    "Beautiful":  ["attractive", "gorgeous", "lovely", "amazing", "wonderful"],
    "Before":     ["earlier", "previously", "prior to"],
    "Best":       ["finest", "greatest", "top"],
    "Better":     ["improved", "superior"],
    "Busy":       ["occupied", "working"],
    "But":        ["although", "however", "yet"],
    "Bye":        ["farewell", "goodbye"],
    "Can":        ["able", "capable", "enabled"],
    "Cannot":     ["can't", "unable"],
    "Change":     ["alter", "modify", "transform"],
    "Children":   ["kids", "youngsters"],
    "College":    ["campus", "institute", "university"],
    "Come":       ["arrive"],
    "Computer":   ["machine", "pc", "system"],
    "Cousin":     [],
    "Day":        ["date", "daytime"],
    "Distance":   ["gap", "length", "space"],
    "Do":         ["execute", "perform"],
    "Do Not":     ["no"],
    "Does Not":   ["lacking"],
    "Eat":        ["consume", "dine"],
    "Engineer":   ["developer", "technician"],
    "English":    ["language", "tongue"],
    "Ever":       ["lifetime"],
    "Expression": ["emotion", "statement",
                   "emotions", "feeling", "feelings", "express", "meaning", "meaningful",
                   "ideas", "idea", "describe", "inspiring", "interesting", "educational"],
    "Fast":       ["quick", "rapid", "speedy"],
    "Fight":      ["battle", "struggle"],
    "Finish":     ["complete", "end"],
    "From":       ["concerning", "regarding"],
    "Garden":     ["park", "yard"],
    "Glitter":    ["shine", "sparkle"],
    "Go":         ["move", "proceed"],
    "God":        [],
    "Gold":       [],
    "Good":       ["correct", "excellent", "nice", "proper"],
    "Great":      ["amazing", "excellent", "wonderful"],
    "Grow":       ["develop", "increase", "improve", "improving"],
    "Hand":       ["hold"],
    "Hands":      ["gesture"],
    "Happy":      ["cheerful", "glad", "joyful"],
    "Have":       ["hold"],
    "He":         [],
    "Hello":      ["greetings", "hey", "hi"],
    "Help":       ["aid", "assist", "support", "helps", "helping"],
    "Her":        [],
    "Here":       ["currently", "presently"],
    "His":        [],
    "Home":       ["house", "residence"],
    "Homepage":   ["screen"],
    "How":        ["method", "approach"],
    "If":         ["condition"],
    "Image":      ["photo", "picture"],
    "In":         ["inside"],
    "Invent":     ["create"],
    "It":         [],
    "Just":       ["solely", "only"],
    "Keep":       ["continue", "maintain", "remain"],
    "Language":   ["speech", "tongue",
                   "communication", "speaking", "literature", "reading", "vocabulary",
                   "grammar", "writing"],
    "Laugh":      ["giggle", "smile"],
    "Learn":      ["research", "understand",
                   "knowledge", "education", "educational", "thinking", "students",
                   "student", "classes", "class", "skills", "skill"],
    "Like":       ["enjoy", "prefer"],
    "Little":     ["small", "tiny"],
    "Me":         ["self"],
    "Mean":       ["indicate", "signify"],
    "Minute":     ["moment"],
    "More":       ["additional", "extra"],
    "Mostly":     ["generally", "mainly"],
    "My":         [],
    "Name":       ["identity", "title"],
    "Next":       ["following", "upcoming"],
    "Not":        ["no"],
    "Now":        ["currently", "presently"],
    "Of":         ["concerning", "regarding"],
    "On":         ["atop"],
    "Only":       ["solely"],
    "Other":      ["another", "different"],
    "Our":        ["us"],
    "Out":        ["outside", "outward"],
    "Over":       ["across", "above"],
    "Overnight":  ["nighttime"],
    "Pretty":     ["attractive", "lovely"],
    "Quickly":    ["rapidly"],
    "Right":      ["correct", "proper"],
    "Sad":        ["unhappy", "upset"],
    "Safe":       ["protected", "secure"],
    "See":        ["observe", "view"],
    "Self":       ["yourself"],
    "Sign":       ["gesture", "symbol"],
    "Sing":       [],
    "Situation":  ["circumstance", "condition",
                   "situations", "life", "culture", "behavior", "behaviour"],
    "So":         ["therefore"],
    "Sound":      ["audio", "noise"],
    "Stay":       ["continue", "remain"],
    "Study":      ["research", "learn",
                   "books", "book", "novels", "novel", "poetry", "poem", "poems",
                   "drama", "stories", "story", "reading"],
    "Super":      ["amazing", "excellent", "superior"],
    "Take":       ["grab", "receive"],
    "Talk":       ["communicate", "speak", "speaking", "communication"],
    "Television": ["tv"],
    "Ten":        [],
    "Than":       ["versus"],
    "Thank":      ["appreciate it", "thanks"],
    "Thank You":  ["appreciate it", "thanks"],
    "That":       ["which"],
    "They":       [],
    "This":       ["present"],
    "Those":      ["these"],
    "Time":       ["duration", "era", "moment"],
    "To":         ["toward"],
    "Trip":       ["journey", "travel"],
    "Type":       ["category", "kind"],
    "Us":         ["our"],
    "Use":        ["employ", "utilize"],
    "Very":       ["extremely", "highly"],
    "Walk":       ["stroll"],
    "Want":       ["desire", "wish"],
    "Wash":       ["clean", "rinse"],
    "Way":        ["approach", "method", "path"],
    "We":         ["us"],
    "Weed":       [],
    "Welcome":    ["greetings"],
    "What":       ["which"],
    "When":       ["afterward", "later"],
    "Where":      ["place"],
    "Which":      ["that"],
    "Who":        ["person", "human", "humans", "people", "folk", "folks",
                   "writers", "writer"],
    "Whole":      ["entire"],
    "Whose":      ["belonging to"],
    "Why":        ["reason"],
    "Will":       ["going to", "shall"],
    "With":       ["along", "together"],
    "Without":    ["excluding", "lacking"],
    "Words":      ["phrase", "terms", "vocabulary"],
    "Work":       ["job", "labor"],
    "World":      ["earth", "globe", "because", "through", "many", "is", "give"],
    "Wrong":      ["incorrect", "mistaken"],
    "You":        ["yourself"],
    "Your":       ["belonging to you"],
    "Yourself":   ["self"],
}


def _normalize(s: str) -> str:
    """Lowercase, strip punctuation and extra spaces."""
    return re.sub(r'[^a-z0-9 ]', '', s.lower()).strip()


# ─── Build reverse lookup: synonym_norm → dataset_word ───────────────────────
# Built once at import time.

_SYNONYM_TO_DATASET: dict[str, str] = {}

for _dataset_word, _synonyms in _RAW_SYNONYMS.items():
    # The dataset word itself is also a valid lookup key
    _SYNONYM_TO_DATASET[_normalize(_dataset_word)] = _dataset_word
    for _syn in _synonyms:
        _key = _normalize(_syn)
        if _key and _key not in _SYNONYM_TO_DATASET:
            _SYNONYM_TO_DATASET[_key] = _dataset_word


def resolve_synonym(word: str) -> Optional[str]:
    """
    Given an input word, return the dataset word it maps to (via synonym table),
    or None if no synonym mapping exists.

    Note: this does NOT check whether the dataset file actually exists.
    Use find_sign() for the full lookup chain.
    """
    return _SYNONYM_TO_DATASET.get(_normalize(word))


def get_all_synonyms() -> dict[str, str]:
    """Return the full synonym → dataset_word mapping (read-only copy)."""
    return dict(_SYNONYM_TO_DATASET)
