from collections import Counter
from typing import Any


def _calculate_count(answers: dict[str, int], questions_data: dict) -> Counter:
    types_counter = Counter()
    questions = questions_data.get("data")
    for q in questions:
        q_id = str(q["id"])
        if q_id in answers:
            selected_option_id = answers[q_id]
            for opt in q["options"]:
                if opt["id"] == selected_option_id and "type" in opt:
                    types_counter[opt["type"]] += 1
    return types_counter


def calculate_klimov(answers: dict[str, int], questions_data: dict) -> dict:
    """Calculate result depends on type in options"""
    types_counter = _calculate_count(answers, questions_data)
    return {
        "type": "klimov",
        "scores": dict(types_counter.most_common()),
        "top_type": types_counter.most_common(1)[0][0] if types_counter else None
    }


def calculate_holland(answers: dict[str, int], question_data: dict) -> dict:
    types_counter = _calculate_count(answers, question_data)

    top_3 = [t[0] for t in types_counter.most_common(3)]
    return {
        "type": "holland",
        "scores": dict(types_counter.most_common()),
        "top_types": top_3,
        "code": "".join([t[0].upper() for t in top_3])  # "RIA"
    }


def calculate_yovaishi(answers: dict[str, int], questions_data: dict) -> dict:
    types_counter = _calculate_count(answers, questions_data)
    return {
        "type": "yovaishi",
        "scores": dict(types_counter.most_common()),
        "top_type": types_counter.most_common(1)[0][0] if types_counter else None
    }


def calculate_interests(answers: dict[str, int], questions_data: dict) -> dict:
    directions_scores = {}
    weights = {
        "veryPositive": 2,
        "positive": 1,
        "neutral": 0,
        "negative": -1,
        "veryNegative": -2
    }
    questions = questions_data.get("data")
    for q in questions:
        q_id = str(q["id"])
        direction = q.get("direction")
        if q_id in answers and direction:
            selected_option_id = answers[q_id]
            for opt in q["options"]:
                if opt["id"] == selected_option_id and "type" in opt:
                    score = weights.get(opt["type"], 0)
                    directions_scores[direction] = directions_scores.get(direction, 0) + score
    # sort direction by scores desc
    sorted_directions = dict(sorted(
        directions_scores.items(), key=lambda item: item[1], reverse=True
    ))
    return {
        "type": "interests",
        "scores": sorted_directions,
        "top_directions": list(sorted_directions.keys())[:3]
    }


_calc_test_result = {
    "klimov": calculate_klimov,
    "holland": calculate_holland,
    "yovaishi": calculate_yovaishi,
    "interests": calculate_interests
}


def calculate_results(test_code: str, answers: dict[str, int], questions_data: dict) -> dict:
    calculator = _calc_test_result.get(test_code)
    if not calculator:
        raise ValueError(f"Cant find required algorithm for {test_code}")

    return calculator(answers, questions_data)
